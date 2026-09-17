/**
 * "Your Stats" dashboard derivations.
 *
 * Pure reads over the existing localStorage stores (progress, daily, labs,
 * research, concepts, contests). Every function derives its result from the
 * current state — nothing here mutates progress, so the dashboard can
 * recompute freely on change events.
 *
 * All math guards empty stores: counts default to 0 and division-by-zero
 * cases yield 0 rather than NaN.
 */

import { LABS } from "@/data/labs";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META, getCategoryCounts } from "@/data/problems/problem-meta";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getBadgeSnapshot, computeXp } from "@/lib/badges";
import { getConceptStats } from "@/lib/concepts";
import { getDailyDateKey } from "@/lib/daily";
import { getLabRecords, meetsTarget, type LabRecords } from "@/lib/labs";
import { getCurrentStreak, getLongestStreak } from "@/lib/leaderboard";
import { getProgress } from "@/lib/progress";
import { getResearchState, type ResearchState } from "@/lib/research";
import {
  bucketOf,
  getReviewBucketCounts,
  getReviewMap,
  nextDueDate,
} from "@/lib/reviewQueue";
import type { Category, Difficulty } from "@/types/problem";

/* ──────────────────────────────── types ─────────────────────────────────── */

export interface Overview {
  solved: number;
  attempted: number;
  total: number;
  /** solved / attempted, 0..1; 0 when nothing has been attempted. */
  accuracy: number;
  solvedToday: number;
  /** Solves within the trailing 7 local calendar days (today included). */
  solvedThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  levelTitle: string;
  labsPassed: number;
  researchBeaten: number;
  conceptsMastered: number;
  contestsPlayed: number;
}

export interface CategoryStat {
  name: Category;
  solved: number;
  total: number;
  /** solved / total as a 0..100 percentage. */
  percent: number;
  /** Mean difficulty score (Easy 1, Medium 2, Hard 3) of solved problems, 0 when none. */
  avgDifficulty: number;
}

export interface DifficultyStat {
  difficulty: Difficulty;
  solved: number;
  total: number;
  /** solved / total as a 0..100 percentage. */
  percent: number;
}

export interface TrendDay {
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  count: number;
}

export interface TimeOfDayBucket {
  /** "0-5", "6-11", "12-17", "18-23". */
  label: string;
  count: number;
}

export interface FastestSolveRecord {
  problemId: string;
  title: string;
  durationMs: number;
}

export interface MostActiveDay {
  date: string;
  count: number;
}

export interface Records {
  /**
   * Smallest non-negative gap between a solve's `lastOpened` timestamp and
   * its `solvedAt`. Progress stores no dedicated attempt timestamp, so the
   * last-open marker is the closest available proxy.
   */
  fastestFirstSolve: FastestSolveRecord | null;
  longestDailyStreak: number;
  mostActiveDay: MostActiveDay | null;
  hardestSolved: number;
  firstSolvedAt: string | null;
  lastSolvedAt: string | null;
}

export interface MasteryEstimate {
  /** Weighted result, 0..100. */
  value: number;
  /** Component scores, each 0..100 for display. */
  coverage: number;
  depth: number;
  recency: number;
}

/* ─────────────────────────────── constants ──────────────────────────────── */

export const DIFFICULTY_SCORE: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

/**
 * Weights for `getEstimatedMastery`. The three components are independent
 * 0..1 ratios, so the result is simply their weighted sum:
 *
 *   coverage = solved / total problems
 *   depth    = solved Hard / total Hard problems
 *   recency  = min(1, solves in the last 14 days / 7)
 *   value    = round(100 * (0.45 * coverage + 0.35 * depth + 0.20 * recency))
 *
 * Coverage dominates, depth rewards working the hardest tier, and recency
 * credits sustained recent practice (7 solves in 14 days saturates it).
 */
export const MASTERY_WEIGHTS = {
  coverage: 0.45,
  depth: 0.35,
  recency: 0.2,
} as const;

const MASTERY_RECENCY_DAYS = 14;
const MASTERY_RECENCY_TARGET = 7;

const TIME_OF_DAY_LABELS = ["0-5", "6-11", "12-17", "18-23"];

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/* ────────────────────────────── overview ────────────────────────────────── */

export function getOverview(): Overview {
  const snapshot = getBadgeSnapshot();
  const progress = snapshot.progress;

  const todayKey = getDailyDateKey(snapshot.now);
  const weekKeys = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(snapshot.now);
    day.setDate(day.getDate() - i);
    weekKeys.add(getDailyDateKey(day));
  }

  let solved = 0;
  let attempted = 0;
  let solvedToday = 0;
  let solvedThisWeek = 0;

  for (const problem of PROBLEM_META) {
    const record = progress[problem.id];
    if (!record) continue;
    if (record.attempted) attempted += 1;
    if (!record.solved) continue;
    solved += 1;
    if (!record.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    const key = getDailyDateKey(at);
    if (key === todayKey) solvedToday += 1;
    if (weekKeys.has(key)) solvedThisWeek += 1;
  }

  const xp = computeXp(snapshot);
  const concepts = getConceptStats(snapshot.now);

  return {
    solved,
    attempted,
    total: PROBLEM_META.length,
    accuracy: attempted > 0 ? solved / attempted : 0,
    solvedToday,
    solvedThisWeek,
    currentStreak: getCurrentStreak(progress),
    longestStreak: getLongestStreak(progress),
    xp: xp.xp,
    level: xp.level,
    levelTitle: xp.title,
    labsPassed: Object.values(snapshot.labs).filter((record) => record.passed)
      .length,
    researchBeaten: Object.values(snapshot.research).filter(
      (state) => state.beatenBaseline,
    ).length,
    conceptsMastered: concepts.mastered,
    contestsPlayed: snapshot.contests.length,
  };
}

/* ─────────────────────────── category breakdown ─────────────────────────── */

export function getCategoryBreakdown(): CategoryStat[] {
  const progress = getProgress();
  const totals = getCategoryCounts();

  const solvedCounts = new Map<Category, number>();
  const difficultySums = new Map<Category, number>();

  for (const problem of PROBLEM_META) {
    if (!progress[problem.id]?.solved) continue;
    solvedCounts.set(
      problem.category,
      (solvedCounts.get(problem.category) ?? 0) + 1,
    );
    difficultySums.set(
      problem.category,
      (difficultySums.get(problem.category) ?? 0) +
        DIFFICULTY_SCORE[problem.difficulty],
    );
  }

  return CATEGORIES.map((meta) => {
    const solved = solvedCounts.get(meta.name) ?? 0;
    const total = totals[meta.name] ?? 0;
    const difficultySum = difficultySums.get(meta.name) ?? 0;
    return {
      name: meta.name,
      solved,
      total,
      percent: total > 0 ? (solved / total) * 100 : 0,
      avgDifficulty: solved > 0 ? difficultySum / solved : 0,
    };
  }).sort((a, b) => b.percent - a.percent);
}

/* ────────────────────────── difficulty breakdown ────────────────────────── */

export function getDifficultyBreakdown(): DifficultyStat[] {
  const progress = getProgress();
  const totals: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const solved: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };

  for (const problem of PROBLEM_META) {
    totals[problem.difficulty] += 1;
    if (progress[problem.id]?.solved) solved[problem.difficulty] += 1;
  }

  return DIFFICULTIES.map((difficulty) => ({
    difficulty,
    solved: solved[difficulty],
    total: totals[difficulty],
    percent:
      totals[difficulty] > 0 ? (solved[difficulty] / totals[difficulty]) * 100 : 0,
  }));
}

/* ─────────────────────────── activity trend ─────────────────────────────── */

export function getActivityTrend(days = 30): TrendDay[] {
  const safeDays = Math.max(1, Math.floor(days));
  const progress = getProgress();

  const counts = new Map<string, number>();
  for (const record of Object.values(progress)) {
    if (!record.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    const key = getDailyDateKey(at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trend: TrendDay[] = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = getDailyDateKey(date);
    trend.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return trend;
}

/* ──────────────────────────── time of day ───────────────────────────────── */

export function getTimeOfDay(): TimeOfDayBucket[] {
  const counts = [0, 0, 0, 0];

  for (const record of Object.values(getProgress())) {
    if (!record.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    const bucket = Math.min(3, Math.max(0, Math.floor(at.getHours() / 6)));
    counts[bucket] += 1;
  }

  return TIME_OF_DAY_LABELS.map((label, index) => ({
    label,
    count: counts[index],
  }));
}

/* ─────────────────────────────── records ────────────────────────────────── */

export function getRecords(): Records {
  const progress = getProgress();

  let fastestFirstSolve: FastestSolveRecord | null = null;
  let firstSolvedAt: string | null = null;
  let lastSolvedAt: string | null = null;
  let firstTime = Number.POSITIVE_INFINITY;
  let lastTime = Number.NEGATIVE_INFINITY;
  let hardestSolved = 0;
  const dayCounts = new Map<string, number>();

  for (const problem of PROBLEM_META) {
    const record = progress[problem.id];
    if (!record?.solved) continue;
    if (problem.difficulty === "Hard") hardestSolved += 1;
    if (!record.solvedAt) continue;
    const solvedAt = new Date(record.solvedAt);
    if (Number.isNaN(solvedAt.getTime())) continue;
    const solvedTime = solvedAt.getTime();

    if (solvedTime < firstTime) {
      firstTime = solvedTime;
      firstSolvedAt = record.solvedAt;
    }
    if (solvedTime > lastTime) {
      lastTime = solvedTime;
      lastSolvedAt = record.solvedAt;
    }

    const key = getDailyDateKey(solvedAt);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);

    if (record.lastOpened) {
      const opened = new Date(record.lastOpened);
      if (!Number.isNaN(opened.getTime())) {
        const durationMs = solvedTime - opened.getTime();
        if (
          durationMs >= 0 &&
          (fastestFirstSolve === null ||
            durationMs < fastestFirstSolve.durationMs)
        ) {
          fastestFirstSolve = {
            problemId: problem.id,
            title: problem.title,
            durationMs,
          };
        }
      }
    }
  }

  let mostActiveDay: MostActiveDay | null = null;
  for (const [date, count] of dayCounts) {
    if (
      mostActiveDay === null ||
      count > mostActiveDay.count ||
      (count === mostActiveDay.count && date > mostActiveDay.date)
    ) {
      mostActiveDay = { date, count };
    }
  }

  return {
    fastestFirstSolve,
    longestDailyStreak: getLongestStreak(progress),
    mostActiveDay,
    hardestSolved,
    firstSolvedAt,
    lastSolvedAt,
  };
}

/* ────────────────────────── estimated mastery ───────────────────────────── */

export function getEstimatedMastery(): MasteryEstimate {
  const snapshot = getBadgeSnapshot();
  const progress = snapshot.progress;
  const total = PROBLEM_META.length;

  const cutoffTime =
    snapshot.now.getTime() - MASTERY_RECENCY_DAYS * 24 * 60 * 60 * 1000;

  let hardTotal = 0;
  let solved = 0;
  let hardSolved = 0;
  let recentSolves = 0;

  for (const problem of PROBLEM_META) {
    if (problem.difficulty === "Hard") hardTotal += 1;
    const record = progress[problem.id];
    if (!record?.solved) continue;
    solved += 1;
    if (problem.difficulty === "Hard") hardSolved += 1;
    if (!record.solvedAt) continue;
    const at = new Date(record.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    if (at.getTime() >= cutoffTime) recentSolves += 1;
  }

  const coverage = total > 0 ? solved / total : 0;
  const depth = hardTotal > 0 ? hardSolved / hardTotal : 0;
  const recency = Math.min(1, recentSolves / MASTERY_RECENCY_TARGET);

  const weighted =
    MASTERY_WEIGHTS.coverage * coverage +
    MASTERY_WEIGHTS.depth * depth +
    MASTERY_WEIGHTS.recency * recency;

  return {
    value: Math.max(0, Math.min(100, Math.round(weighted * 100))),
    coverage: Math.round(coverage * 100),
    depth: Math.round(depth * 100),
    recency: Math.round(recency * 100),
  };
}

/* ────────────────────────────── review health ───────────────────────────── */

/** Trailing window for the review-completion trend. */
export const REVIEW_HEALTH_TREND_DAYS = 28;

/** Weak categories listed by the review-health card. */
export const REVIEW_HEALTH_LAPSE_LIMIT = 5;

export interface ReviewHealthBuckets {
  due: number;
  learning: number;
  new: number;
  scheduled: number;
}

export interface ReviewLapseRow {
  category: Category;
  lapses: number;
  /**
   * Items in this category due today or earlier — the actionable queue,
   * counting both the `due` and first-review `learning` buckets.
   */
  due: number;
}

export interface ReviewHealth {
  /** Same bucket semantics as the Today queue. */
  buckets: ReviewHealthBuckets;
  /**
   * Up to `REVIEW_HEALTH_LAPSE_LIMIT` categories with lapses, descending,
   * ties broken by category name so the ranking is stable.
   */
  lapsesByCategory: ReviewLapseRow[];
  /** Review completions per local day, oldest → newest, always 28 entries. */
  completionTrend: TrendDay[];
  /** Earliest due date after today ("YYYY-MM-DD"), or null when none. */
  nextDue: string | null;
}

function buildCompletionTrend(
  now: Date,
  counts: Map<string, number>,
): TrendDay[] {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  const trend: TrendDay[] = [];
  for (let i = REVIEW_HEALTH_TREND_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    const key = getDailyDateKey(date);
    trend.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return trend;
}

/** Zeroed review-health shape for empty state and server snapshots. */
export function emptyReviewHealth(now: Date = new Date()): ReviewHealth {
  const safeNow = Number.isNaN(now.getTime()) ? new Date() : now;
  return {
    buckets: { due: 0, learning: 0, new: 0, scheduled: 0 },
    lapsesByCategory: [],
    completionTrend: buildCompletionTrend(safeNow, new Map()),
    nextDue: null,
  };
}

/**
 * Review health for the stats dashboard: queue buckets from the review
 * scheduler, the weakest categories by lapses, a 28-day completion trend
 * built from `lastReviewedAt`, and the next future due date.
 *
 * Pure read: same store state + same `now` yields the same result. Malformed
 * payloads and empty state degrade to zeroed shapes instead of throwing.
 */
export function getReviewHealth(now: Date = new Date()): ReviewHealth {
  const safeNow = Number.isNaN(now.getTime()) ? new Date() : now;
  try {
    const reviews = getReviewMap(safeNow);
    if (!reviews || typeof reviews !== "object" || Array.isArray(reviews)) {
      return emptyReviewHealth(safeNow);
    }

    const counts = getReviewBucketCounts(reviews, safeNow);
    const today = getDailyDateKey(safeNow);
    const metaById = new Map(
      PROBLEM_META.map((problem) => [problem.id, problem]),
    );
    const lapses = new Map<Category, number>();
    const dueByCategory = new Map<Category, number>();
    const completions = new Map<string, number>();

    for (const [id, state] of Object.entries(reviews)) {
      if (!state || typeof state !== "object") continue;
      const meta = metaById.get(id);
      if (meta) {
        const lapseCount =
          typeof state.lapses === "number" && Number.isFinite(state.lapses)
            ? Math.max(0, Math.floor(state.lapses))
            : 0;
        if (lapseCount > 0) {
          lapses.set(
            meta.category,
            (lapses.get(meta.category) ?? 0) + lapseCount,
          );
        }
        const bucket = bucketOf(state, today);
        if (bucket === "due" || bucket === "learning") {
          dueByCategory.set(
            meta.category,
            (dueByCategory.get(meta.category) ?? 0) + 1,
          );
        }
      }
      if (typeof state.lastReviewedAt === "string") {
        const reviewed = new Date(state.lastReviewedAt);
        if (!Number.isNaN(reviewed.getTime())) {
          const key = getDailyDateKey(reviewed);
          completions.set(key, (completions.get(key) ?? 0) + 1);
        }
      }
    }

    const lapsesByCategory = [...lapses.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, REVIEW_HEALTH_LAPSE_LIMIT)
      .map(([category, lapseCount]) => ({
        category,
        lapses: lapseCount,
        due: dueByCategory.get(category) ?? 0,
      }));

    return {
      buckets: {
        due: counts.due,
        learning: counts.learning,
        new: counts.new,
        scheduled: counts.scheduled,
      },
      lapsesByCategory,
      completionTrend: buildCompletionTrend(safeNow, completions),
      nextDue: nextDueDate(reviews, safeNow),
    };
  } catch {
    return emptyReviewHealth(safeNow);
  }
}

/* ─────────────────────────── labs & research ────────────────────────────── */

/** Recent lab runs listed on the stats dashboard. */
export const LAB_RECENT_LIMIT = 3;

export interface LabStatEntry {
  id: string;
  title: string;
  /** Best recorded score, or null when the lab has never produced one. */
  best: number | null;
  /** Catalogue target for the lab's metric. */
  target: number;
  /** Best score meets the target — direction-aware via `meetsTarget`. */
  metTarget: boolean;
  /** Sticky pass flag persisted by the lab store. */
  passed: boolean;
  attempts: number;
  /** Metric value of the most recent scored run, when one is stored. */
  lastScore: number | null;
  /** ISO timestamp of the most recent scored run, when one is stored. */
  lastScoredAt: string | null;
}

export interface LabStats {
  /** Labs whose stored record carries `passed === true`. */
  passed: number;
  total: number;
  /** Labs whose best score meets the target, per `meetsTarget`. */
  metTarget: number;
  /** Labs with at least one recorded run or best score. */
  attempted: number;
  /** One entry per catalogue lab, catalogue order. */
  entries: LabStatEntry[];
  /** Scored labs by most recent run, newest first, capped. */
  recent: LabStatEntry[];
}

export interface ResearchStatEntry {
  id: string;
  title: string;
  /** Hidden-test metric of the reference baseline. */
  baselineScore: number;
  bestScore: number | null;
  beatenBaseline: boolean;
  attempts: number;
}

export interface ResearchStats {
  /** Challenges whose stored record carries `beatenBaseline === true`. */
  beaten: number;
  total: number;
  /** Challenges with at least one recorded score or attempt. */
  attempted: number;
  /** One entry per catalogue challenge, catalogue order. */
  entries: ResearchStatEntry[];
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isoOrNull(value: unknown): string | null {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? value
    : null;
}

/** Zeroed lab shape for empty stores and server snapshots. */
export function emptyLabStats(): LabStats {
  return {
    passed: 0,
    total: LABS.length,
    metTarget: 0,
    attempted: 0,
    entries: [],
    recent: [],
  };
}

/** Zeroed research shape for empty stores and server snapshots. */
export function emptyResearchStats(): ResearchStats {
  return {
    beaten: 0,
    total: RESEARCH_CHALLENGES.length,
    attempted: 0,
    entries: [],
  };
}

/**
 * Pure derivation over stored lab records: pass counts against the catalogue,
 * direction-aware target comparison through the store's own `meetsTarget`,
 * and the most recent scored runs. Missing or malformed entries degrade to
 * zeros / nulls instead of throwing.
 */
export function deriveLabStats(records: LabRecords): LabStats {
  const entries: LabStatEntry[] = LABS.map((lab) => {
    const record = records[lab.id];
    const best = finiteOrNull(record?.best);
    const attempts = finiteOrNull(record?.attempts);
    const lastScoredAt = isoOrNull(record?.lastScoredAt);
    return {
      id: lab.id,
      title: lab.title,
      best,
      target: lab.target,
      metTarget: best !== null && meetsTarget(lab, best),
      passed: record?.passed === true,
      attempts: attempts === null ? 0 : Math.max(0, Math.round(attempts)),
      lastScore: lastScoredAt === null ? null : finiteOrNull(record?.lastScore),
      lastScoredAt,
    };
  });

  const recent = entries
    .filter(
      (entry): entry is LabStatEntry & { lastScoredAt: string } =>
        entry.lastScoredAt !== null,
    )
    .sort((a, b) => Date.parse(b.lastScoredAt) - Date.parse(a.lastScoredAt))
    .slice(0, LAB_RECENT_LIMIT);

  return {
    passed: entries.filter((entry) => entry.passed).length,
    total: entries.length,
    metTarget: entries.filter((entry) => entry.metTarget).length,
    attempted: entries.filter(
      (entry) => entry.best !== null || entry.attempts > 0,
    ).length,
    entries,
    recent,
  };
}

/**
 * Pure derivation over the stored research state: per-challenge best scores
 * and baseline flags against the catalogue, with a beaten count. Missing or
 * malformed entries degrade to zeros / nulls instead of throwing.
 */
export function deriveResearchStats(state: ResearchState): ResearchStats {
  const entries: ResearchStatEntry[] = RESEARCH_CHALLENGES.map((challenge) => {
    const record = state?.[challenge.id];
    return {
      id: challenge.id,
      title: challenge.title,
      baselineScore: challenge.baselineScore,
      bestScore: finiteOrNull(record?.bestScore),
      beatenBaseline: record?.beatenBaseline === true,
      attempts:
        record && Array.isArray(record.attempts) ? record.attempts.length : 0,
    };
  });

  return {
    beaten: entries.filter((entry) => entry.beatenBaseline).length,
    total: entries.length,
    attempted: entries.filter(
      (entry) => entry.bestScore !== null || entry.attempts > 0,
    ).length,
    entries,
  };
}

/** Live lab progress from the local lab store. */
export function getLabStats(): LabStats {
  return deriveLabStats(getLabRecords());
}

/** Live research progress from the local research store. */
export function getResearchStats(): ResearchStats {
  return deriveResearchStats(getResearchState());
}
