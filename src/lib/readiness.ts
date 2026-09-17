/**
 * Interview readiness model and target-date projection (feature F5).
 *
 * Pure and local-first: everything here derives from the progress store, a
 * small goal store, the interview mock history, the agentic-round history,
 * and the clock. No network, no accounts, no hidden state.
 *
 * Five components, each 0–100, weighted into one 0–100 score:
 *
 *   coverage    30%  mean solved share across every catalogue category, so a
 *                    single deep category cannot carry the score
 *   retention   25%  share of attempted problems whose retrievability is still
 *                    ≥0.7 on a 28-day linear forgetting curve. When the
 *                    review queue has a schedule for a problem, retrievability
 *                    comes from its due date (items due or overdue decay);
 *                    otherwise it falls back to the last activity timestamp
 *                    (`solvedAt` / `lastOpened`).
 *   balance     15%  half weakest-category coverage, half closeness to the
 *                    catalogue's own Easy/Medium/Hard mix — an "all Easy"
 *                    history drifts from that mix and cannot read as ready
 *   consistency 10%  distinct active days in the trailing 28; 14 active days
 *                    saturates, so rest days are not punished
 *   rehearsal   20%  60% best mock result per track (solved / the track's mock
 *                    target) averaged over tracks with a completed mock, plus
 *                    40% agentic dimension averages over attempts in the
 *                    trailing 28 days, recency-weighted to the newest rounds
 *
 * The weighted total is computed from the rounded component values, so the
 * five numbers shown in the UI reproduce the score exactly (no black box).
 *
 * The projection compares problems-per-week required by a target date against
 * observed pace (trailing 14 days), optionally raised to the capacity implied
 * by the user's weekly-hours plan. It reports an ahead / on-track / behind
 * state and a finish *window* (pace ±25%), never one fake-precise date.
 *
 * Determinism: same stores + same clock => same output. Empty stores and
 * division-by-zero paths yield 0 rather than NaN, mirroring `stats.ts`.
 */

import { INTERVIEW_TRACKS } from "@/data/interview";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import {
  AGENTIC_DIMENSION_LABELS,
  AGENTIC_WEIGHTS,
  getAgenticAttempts,
  type AgenticDimensionKey,
} from "@/lib/agenticRound";
import { getDailyDateKey } from "@/lib/daily";
import { getBestInterviewResult } from "@/lib/interview";
import {
  getProgress,
  type ProblemProgress,
  type ProgressMap,
} from "@/lib/progress";
import { getReviewMap, type ReviewState } from "@/lib/reviewQueue";
import type { Category, Difficulty } from "@/types/problem";

/* ─────────────────────────────── constants ─────────────────────────────── */

export const READINESS_WEIGHTS = {
  coverage: 0.3,
  retention: 0.25,
  balance: 0.15,
  consistency: 0.1,
  rehearsal: 0.2,
} as const;

/** Linear forgetting curve used for the retention proxy. */
export const RETENTION_HORIZON_DAYS = 28;
/** A problem counts as retained at or above this retrievability. */
export const RETENTION_THRESHOLD = 0.7;

/** Consistency looks at this trailing window... */
export const CONSISTENCY_WINDOW_DAYS = 28;
/** ...and saturates once this many days inside it were active. */
export const CONSISTENCY_TARGET_DAYS = 14;

/** Agentic attempts older than this fall out of the rehearsal component. */
export const REHEARSAL_AGENTIC_WINDOW_DAYS = 28;
/** Interview mocks and agentic rounds split the rehearsal component 60/40. */
export const REHEARSAL_INTERVIEW_WEIGHT = 0.6;
export const REHEARSAL_AGENTIC_WEIGHT = 0.4;
/** Dimension order for the rehearsal breakdown (matches the round score). */
export const REHEARSAL_DIMENSION_KEYS: readonly AgenticDimensionKey[] = [
  "completion",
  "instruction",
  "review",
  "recovery",
];

/** Observed pace is measured over this trailing window. */
export const PACE_WINDOW_DAYS = 14;
/** Finish-window spread: effective pace ±25%. */
export const PACE_UNCERTAINTY = 0.25;
/** Pace ratio at or above which the projection reads "ahead". */
export const PACE_AHEAD_RATIO = 1.15;
/** Pace ratio at or above which the projection reads "on track". */
export const PACE_ON_TRACK_RATIO = 0.85;

export const DEFAULT_MINUTES_PER_PROBLEM = 45;
export const MIN_MINUTES_PER_PROBLEM = 15;
export const MAX_MINUTES_PER_PROBLEM = 90;
export const MAX_WEEKLY_HOURS = 168;

export const READINESS_GOAL_CHANGE_EVENT = "deepforge:readiness-goal-change";

const GOAL_STORAGE_KEY = "deepforge:readiness-goal:v1";

const DAY_MS = 24 * 60 * 60 * 1000;

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The catalogue's own difficulty mix. Solving it proportionally is the reach
 * target, so a complete catalogue scores 100 on balance while an all-Easy
 * history measurably drifts away from it.
 */
export const TARGET_DIFFICULTY_MIX: Record<Difficulty, number> = (() => {
  const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const problem of PROBLEM_META) counts[problem.difficulty] += 1;
  const total = counts.Easy + counts.Medium + counts.Hard;
  if (total === 0) return { Easy: 0.34, Medium: 0.42, Hard: 0.24 };
  return {
    Easy: counts.Easy / total,
    Medium: counts.Medium / total,
    Hard: counts.Hard / total,
  };
})();

const PROBLEM_META_BY_ID: Map<string, ProblemMeta> = new Map(
  PROBLEM_META.map((problem) => [problem.id, problem]),
);

/* ──────────────────────────────── types ────────────────────────────────── */

export interface ReadinessBreakdown {
  /** Weighted 0–100 result. */
  value: number;
  /** Component scores, each 0–100. */
  coverage: number;
  retention: number;
  balance: number;
  consistency: number;
  rehearsal: number;
}

export interface RehearsalTrackRatio {
  trackId: string;
  company: string;
  role: string;
  /** Solved count on the track's best recorded mock (or practice) session. */
  solved: number;
  /** Problems in that best session. */
  total: number;
  /** The track's mock size — the denominator a best ratio is measured on. */
  target: number;
  /** solved / target as a 0–1 ratio, capped at 1. */
  ratio: number;
}

export interface RehearsalDimensionAverage {
  key: AgenticDimensionKey;
  label: string;
  /** Recency-weighted mean of that dimension over the window, 0–1. */
  average: number;
}

export interface RehearsalSummary {
  /** Blended 0–1 rehearsal value (interview 60% / agentic 40%); 0 with no evidence. */
  average: number;
  /** Mean best-mock ratio over tracks with a result; 0 when there are none. */
  interviewAverage: number;
  /** Recency-weighted agentic dimension mean; 0 outside the window. */
  agenticAverage: number;
  /** Per-track best-ratio breakdown, in catalogue track order. */
  tracks: RehearsalTrackRatio[];
  /** The four dimension averages, in round-score order. */
  dimensions: RehearsalDimensionAverage[];
  /** Lowest average dimension, or null without agentic evidence. */
  weakestDimension: RehearsalDimensionAverage | null;
  /** Attempts inside the trailing window that contributed. */
  attemptsInWindow: number;
}

/**
 * Best mock ratio for one track: solved over the track's mock target, so a
 * shorter practice session cannot inflate the score. Falls back to the
 * session's own total when the track declares no target, and to 1 when
 * neither side has a positive denominator.
 */
export function bestMockRatio(
  solved: number,
  total: number,
  target: number,
): number {
  const denominator = target > 0 ? target : total > 0 ? total : 1;
  const value = Number.isFinite(solved) ? solved : 0;
  return Math.min(1, Math.max(0, value / denominator));
}

/**
 * Rehearsal summary from the interview mock history and the agentic attempt
 * store. Deterministic from both stores plus `now`; empty stores yield zeros.
 */
export function summarizeRehearsal(now: Date = new Date()): RehearsalSummary {
  const tracks: RehearsalTrackRatio[] = [];
  let interviewSum = 0;
  for (const track of INTERVIEW_TRACKS) {
    const best = getBestInterviewResult(track.id);
    if (!best) continue;
    const target = track.mockProblemIds.length;
    const ratio = bestMockRatio(best.solved, best.total, target);
    interviewSum += ratio;
    tracks.push({
      trackId: track.id,
      company: track.company,
      role: track.role,
      solved: best.solved,
      total: best.total,
      target,
      ratio: round4(ratio),
    });
  }
  const interviewAverage = tracks.length > 0 ? interviewSum / tracks.length : 0;

  const totals: Record<AgenticDimensionKey, number> = {
    completion: 0,
    instruction: 0,
    review: 0,
    recovery: 0,
  };
  let weightSum = 0;
  let attemptsInWindow = 0;
  const nowTime = now.getTime();
  for (const attempt of getAgenticAttempts()) {
    const at = Date.parse(attempt.at);
    if (!Number.isFinite(at) || !Number.isFinite(nowTime)) continue;
    const ageDays = Math.max(0, (nowTime - at) / DAY_MS);
    const weight = Math.max(0, 1 - ageDays / REHEARSAL_AGENTIC_WINDOW_DAYS);
    if (weight <= 0) continue;
    weightSum += weight;
    attemptsInWindow += 1;
    for (const key of REHEARSAL_DIMENSION_KEYS) {
      totals[key] += weight * clampUnit(attempt.dimensions[key]);
    }
  }

  const dimensions: RehearsalDimensionAverage[] = REHEARSAL_DIMENSION_KEYS.map(
    (key) => ({
      key,
      label: AGENTIC_DIMENSION_LABELS[key],
      average: weightSum > 0 ? round4(totals[key] / weightSum) : 0,
    }),
  );
  let agenticAverage = 0;
  if (weightSum > 0) {
    let weighted = 0;
    for (const dimension of dimensions) {
      weighted += (AGENTIC_WEIGHTS[dimension.key] / 100) * dimension.average;
    }
    agenticAverage = round4(weighted);
  }
  const weakestDimension =
    weightSum > 0
      ? dimensions.reduce((min, dimension) =>
          dimension.average < min.average ? dimension : min,
        )
      : null;
  const average =
    REHEARSAL_INTERVIEW_WEIGHT * interviewAverage +
    REHEARSAL_AGENTIC_WEIGHT * agenticAverage;

  return {
    average: round4(average),
    interviewAverage: round4(interviewAverage),
    agenticAverage,
    tracks,
    dimensions,
    weakestDimension,
    attemptsInWindow,
  };
}

export interface CoverageBucket {
  solved: number;
  total: number;
  /** solved / total as a 0–100 percentage; 0 when the bucket is empty. */
  percent: number;
}

export interface CoverageSummary {
  solved: number;
  total: number;
  /** solved / total as a 0–100 percentage; 0 when there are no problems. */
  percent: number;
  byDifficulty: Record<Difficulty, CoverageBucket>;
}

export interface ReadinessGoal {
  /** Local calendar date "YYYY-MM-DD", or null when unset. */
  targetDate: string | null;
  /** Planned study hours per week, or null when unset. */
  weeklyHours: number | null;
}

export type ProjectionStatus =
  | "no-goal"
  | "complete"
  | "ahead"
  | "on-track"
  | "behind";

export interface ProjectionInput {
  now: Date;
  solved: number;
  total: number;
  /** Solves with a `solvedAt` inside the trailing PACE_WINDOW_DAYS. */
  solvesInPaceWindow: number;
  goal: ReadinessGoal;
  /** Median observed solve time, already clamped; drives hours → problems. */
  minutesPerProblem: number;
}

export interface ReadinessProjection {
  solved: number;
  total: number;
  remaining: number;
  /** Calendar days until the target; null without a target, negative when past. */
  daysRemaining: number | null;
  /** Problems per week the target date demands; null without a usable target. */
  requiredPerWeek: number | null;
  /** Observed problems per week over the trailing PACE_WINDOW_DAYS. */
  currentPerWeek: number;
  /** Problems/week the weekly-hours plan implies; null without hours. */
  capacityPerWeek: number | null;
  /** requiredPerWeek − effective pace when behind, else 0. */
  behindPerWeek: number;
  status: ProjectionStatus;
  /** Finish window for ±PACE_UNCERTAINTY around the effective pace. */
  earliest: string | null;
  latest: string | null;
  minutesPerProblem: number;
}

export const EMPTY_READINESS_GOAL: ReadinessGoal = {
  targetDate: null,
  weeklyHours: null,
};

export const EMPTY_READINESS_PROJECTION: ReadinessProjection = {
  solved: 0,
  total: 0,
  remaining: 0,
  daysRemaining: null,
  requiredPerWeek: null,
  currentPerWeek: 0,
  capacityPerWeek: null,
  behindPerWeek: 0,
  status: "no-goal",
  earliest: null,
  latest: null,
  minutesPerProblem: DEFAULT_MINUTES_PER_PROBLEM,
};

/* ─────────────────────────────── helpers ───────────────────────────────── */

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function percentOf(bucket: { solved: number; total: number }): number {
  return bucket.total > 0 ? Math.round((bucket.solved / bucket.total) * 100) : 0;
}

/** Latest valid timestamp on a progress record, or null when undated. */
function latestActivity(record: ProblemProgress): number | null {
  let latest: number | null = null;
  for (const stamp of [record.solvedAt, record.lastOpened]) {
    if (!stamp) continue;
    const at = new Date(stamp).getTime();
    if (Number.isNaN(at)) continue;
    if (latest === null || at > latest) latest = at;
  }
  return latest;
}

/** Fallback proxy for problems the review queue has no schedule for. */
function timestampRetrievability(
  record: ProblemProgress,
  now: Date,
): number {
  const latest = latestActivity(record);
  if (latest === null) return 0;
  const ageDays = Math.max(0, (now.getTime() - latest) / DAY_MS);
  return Math.max(0, 1 - ageDays / RETENTION_HORIZON_DAYS);
}

/**
 * Queue-based proxy: a scheduled item is fully retained until its due date,
 * then decays linearly over the same 28-day horizon.
 */
function reviewRetrievability(state: ReviewState, now: Date): number {
  const due = parseDateKey(state.due);
  if (!due) return 0;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const overdueDays = (today.getTime() - due.getTime()) / DAY_MS;
  if (overdueDays <= 0) return 1;
  return Math.max(0, 1 - overdueDays / RETENTION_HORIZON_DAYS);
}

function parseDateKey(key: string | null): Date | null {
  if (!key || !DATE_KEY_PATTERN.test(key)) return null;
  const date = new Date(`${key}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKeyDaysFrom(now: Date, days: number): string {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

function daysUntil(now: Date, target: Date): number {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/* ────────────────────────────── readiness ──────────────────────────────── */

/**
 * Five-component readiness score for the whole catalogue, 0–100.
 * Deterministic from the progress, review, interview, and agentic stores
 * plus `now`.
 */
export function getReadinessScore(now: Date = new Date()): ReadinessBreakdown {
  const progress = getProgress();

  const totalsByCategory = new Map<Category, number>();
  const solvedByCategory = new Map<Category, number>();
  const totalsByDifficulty: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  const solvedByDifficulty: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  let solvedTotal = 0;

  for (const problem of PROBLEM_META) {
    totalsByCategory.set(
      problem.category,
      (totalsByCategory.get(problem.category) ?? 0) + 1,
    );
    totalsByDifficulty[problem.difficulty] += 1;
    if (!progress[problem.id]?.solved) continue;
    solvedTotal += 1;
    solvedByDifficulty[problem.difficulty] += 1;
    solvedByCategory.set(
      problem.category,
      (solvedByCategory.get(problem.category) ?? 0) + 1,
    );
  }

  let categorySum = 0;
  let categoryCount = 0;
  let weakestCategory = 1;
  for (const meta of CATEGORIES) {
    const total = totalsByCategory.get(meta.name) ?? 0;
    if (total === 0) continue;
    const ratio = Math.min(1, (solvedByCategory.get(meta.name) ?? 0) / total);
    categorySum += ratio;
    categoryCount += 1;
    if (ratio < weakestCategory) weakestCategory = ratio;
  }
  const coverage = categoryCount > 0 ? categorySum / categoryCount : 0;

  let touched = 0;
  let retained = 0;
  const reviews = getReviewMap(now);
  for (const [id, record] of Object.entries(progress)) {
    if (!record) continue;
    touched += 1;
    const review = reviews[id];
    const retrievability = review
      ? reviewRetrievability(review, now)
      : timestampRetrievability(record, now);
    if (retrievability >= RETENTION_THRESHOLD) retained += 1;
  }
  const retention = touched > 0 ? retained / touched : 0;

  let difficultyPart = 0;
  if (solvedTotal > 0) {
    let distance = 0;
    for (const difficulty of DIFFICULTIES) {
      distance += Math.abs(
        solvedByDifficulty[difficulty] / solvedTotal -
          TARGET_DIFFICULTY_MIX[difficulty],
      );
    }
    difficultyPart = Math.max(0, 1 - distance / 2);
  }
  const categoryPart =
    solvedTotal > 0 && categoryCount > 0 ? weakestCategory : 0;
  const balance = solvedTotal > 0 ? (categoryPart + difficultyPart) / 2 : 0;

  const todayKey = getDailyDateKey(now);
  const windowStart = new Date(now);
  windowStart.setHours(0, 0, 0, 0);
  windowStart.setDate(windowStart.getDate() - (CONSISTENCY_WINDOW_DAYS - 1));
  const windowStartKey = getDailyDateKey(windowStart);
  const activeDays = new Set<string>();
  for (const record of Object.values(progress)) {
    if (!record) continue;
    for (const stamp of [record.solvedAt, record.lastOpened]) {
      if (!stamp) continue;
      const at = new Date(stamp);
      if (Number.isNaN(at.getTime())) continue;
      const key = getDailyDateKey(at);
      if (key >= windowStartKey && key <= todayKey) activeDays.add(key);
    }
  }
  const consistency = Math.min(
    1,
    activeDays.size / CONSISTENCY_TARGET_DAYS,
  );

  const coverageScore = clampScore(coverage * 100);
  const retentionScore = clampScore(retention * 100);
  const balanceScore = clampScore(balance * 100);
  const consistencyScore = clampScore(consistency * 100);
  const rehearsalScore = clampScore(summarizeRehearsal(now).average * 100);
  const value = clampScore(
    READINESS_WEIGHTS.coverage * coverageScore +
      READINESS_WEIGHTS.retention * retentionScore +
      READINESS_WEIGHTS.balance * balanceScore +
      READINESS_WEIGHTS.consistency * consistencyScore +
      READINESS_WEIGHTS.rehearsal * rehearsalScore,
  );

  return {
    value,
    coverage: coverageScore,
    retention: retentionScore,
    balance: balanceScore,
    consistency: consistencyScore,
    rehearsal: rehearsalScore,
  };
}

/**
 * Coverage of an arbitrary problem set (a path, an interview track).
 * Duplicate and unknown ids are ignored so counts never double.
 */
export function summarizeCoverage(
  problemIds: readonly string[],
  progress: ProgressMap,
): CoverageSummary {
  const counts: Record<Difficulty, { solved: number; total: number }> = {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 },
  };
  const seen = new Set<string>();
  let solved = 0;
  let total = 0;

  for (const id of problemIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const problem = PROBLEM_META_BY_ID.get(id);
    if (!problem) continue;
    total += 1;
    counts[problem.difficulty].total += 1;
    if (progress[id]?.solved) {
      solved += 1;
      counts[problem.difficulty].solved += 1;
    }
  }

  return {
    solved,
    total,
    percent: total > 0 ? Math.round((solved / total) * 100) : 0,
    byDifficulty: {
      Easy: { ...counts.Easy, percent: percentOf(counts.Easy) },
      Medium: { ...counts.Medium, percent: percentOf(counts.Medium) },
      Hard: { ...counts.Hard, percent: percentOf(counts.Hard) },
    },
  };
}

/**
 * Median observed time from first open to solve, clamped to a sane band.
 * Falls back to DEFAULT_MINUTES_PER_PROBLEM when there is no usable pair.
 */
export function estimateMinutesPerProblem(progress: ProgressMap): number {
  const durations: number[] = [];
  for (const record of Object.values(progress)) {
    if (!record?.solved || !record.solvedAt || !record.lastOpened) continue;
    const solvedAt = new Date(record.solvedAt).getTime();
    const openedAt = new Date(record.lastOpened).getTime();
    if (Number.isNaN(solvedAt) || Number.isNaN(openedAt)) continue;
    const minutes = (solvedAt - openedAt) / 60000;
    if (minutes <= 0 || minutes > 24 * 60) continue;
    durations.push(minutes);
  }
  if (durations.length === 0) return DEFAULT_MINUTES_PER_PROBLEM;
  durations.sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  const median =
    durations.length % 2 === 1
      ? durations[middle]
      : (durations[middle - 1] + durations[middle]) / 2;
  return Math.round(
    Math.min(MAX_MINUTES_PER_PROBLEM, Math.max(MIN_MINUTES_PER_PROBLEM, median)),
  );
}

/* ────────────────────────────── projection ─────────────────────────────── */

function countRecentSolves(progress: ProgressMap, now: Date): number {
  const nowTime = now.getTime();
  const cutoff = nowTime - PACE_WINDOW_DAYS * DAY_MS;
  let count = 0;
  for (const record of Object.values(progress)) {
    if (!record?.solved || !record.solvedAt) continue;
    const at = new Date(record.solvedAt).getTime();
    if (Number.isNaN(at)) continue;
    if (at >= cutoff && at <= nowTime) count += 1;
  }
  return count;
}

/**
 * Pure projection math. The effective pace is the better of the observed
 * 14-day pace and the capacity implied by the weekly-hours plan, so setting
 * hours can lift a stalled projection but never hides a required shortfall.
 */
export function projectReadiness(
  input: ProjectionInput,
): ReadinessProjection {
  const total = Math.max(0, Math.floor(input.total));
  const solved = Math.max(0, Math.min(total, Math.floor(input.solved)));
  const remaining = Math.max(0, total - solved);

  const currentPerWeek = round1(
    input.solvesInPaceWindow / (PACE_WINDOW_DAYS / 7),
  );
  const capacityPerWeek =
    input.goal.weeklyHours !== null && input.minutesPerProblem > 0
      ? round1((input.goal.weeklyHours * 60) / input.minutesPerProblem)
      : null;
  const effectivePerWeek = Math.max(currentPerWeek, capacityPerWeek ?? 0);

  const target = parseDateKey(input.goal.targetDate);
  const daysRemaining = target ? daysUntil(input.now, target) : null;

  let status: ProjectionStatus;
  let requiredPerWeek: number | null = null;

  if (!input.goal.targetDate) {
    status = "no-goal";
  } else if (remaining === 0) {
    status = "complete";
    requiredPerWeek = 0;
  } else if (daysRemaining === null || daysRemaining <= 0) {
    status = "behind";
  } else {
    const required = (remaining / daysRemaining) * 7;
    requiredPerWeek = round1(required);
    if (effectivePerWeek <= 0) {
      status = "behind";
    } else {
      const ratio = effectivePerWeek / required;
      if (ratio >= PACE_AHEAD_RATIO) status = "ahead";
      else if (ratio >= PACE_ON_TRACK_RATIO) status = "on-track";
      else status = "behind";
    }
  }

  const behindPerWeek =
    requiredPerWeek !== null && effectivePerWeek < requiredPerWeek
      ? round1(requiredPerWeek - effectivePerWeek)
      : 0;

  let earliest: string | null = null;
  let latest: string | null = null;
  if (remaining > 0 && effectivePerWeek > 0) {
    const fastPerWeek = effectivePerWeek * (1 + PACE_UNCERTAINTY);
    const slowPerWeek = effectivePerWeek * (1 - PACE_UNCERTAINTY);
    earliest = dateKeyDaysFrom(
      input.now,
      Math.ceil((remaining / fastPerWeek) * 7),
    );
    latest = dateKeyDaysFrom(
      input.now,
      Math.ceil((remaining / slowPerWeek) * 7),
    );
  }

  return {
    solved,
    total,
    remaining,
    daysRemaining,
    requiredPerWeek,
    currentPerWeek,
    capacityPerWeek,
    behindPerWeek,
    status,
    earliest,
    latest,
    minutesPerProblem: input.minutesPerProblem,
  };
}

/** Store-backed projection: catalogue + progress + goal store + clock. */
export function getReadinessProjection(
  now: Date = new Date(),
): ReadinessProjection {
  const progress = getProgress();
  let solved = 0;
  for (const problem of PROBLEM_META) {
    if (progress[problem.id]?.solved) solved += 1;
  }
  return projectReadiness({
    now,
    solved,
    total: PROBLEM_META.length,
    solvesInPaceWindow: countRecentSolves(progress, now),
    goal: getReadinessGoal(),
    minutesPerProblem: estimateMinutesPerProblem(progress),
  });
}

/* ───────────────────────────── goal store ──────────────────────────────── */

function sanitizeGoal(value: unknown): ReadinessGoal {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_READINESS_GOAL };
  }
  const raw = value as Record<string, unknown>;
  const targetDate =
    typeof raw.targetDate === "string" && DATE_KEY_PATTERN.test(raw.targetDate)
      ? raw.targetDate
      : null;
  const hours =
    typeof raw.weeklyHours === "number" &&
    Number.isFinite(raw.weeklyHours) &&
    raw.weeklyHours > 0 &&
    raw.weeklyHours <= MAX_WEEKLY_HOURS
      ? round1(raw.weeklyHours)
      : null;
  return { targetDate, weeklyHours: hours };
}

export function getReadinessGoal(): ReadinessGoal {
  if (typeof window === "undefined") return { ...EMPTY_READINESS_GOAL };
  try {
    const raw = window.localStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return { ...EMPTY_READINESS_GOAL };
    return sanitizeGoal(JSON.parse(raw));
  } catch {
    return { ...EMPTY_READINESS_GOAL };
  }
}

export function saveReadinessGoal(
  goal: Partial<ReadinessGoal>,
): ReadinessGoal {
  const clean = sanitizeGoal(goal);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(clean));
      if (typeof CustomEvent === "function") {
        window.dispatchEvent(new CustomEvent(READINESS_GOAL_CHANGE_EVENT));
      }
    } catch {
      /* storage unavailable — silently ignore */
    }
  }
  return clean;
}
