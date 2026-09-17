/**
 * Next-best action — one deterministic answer to "what should I do next?".
 *
 * Reads the same stores `/today` already renders (review queue, lab re-runs,
 * concept schedule, path checkpoints, category coverage, the placement plan,
 * and the daily problem) and ranks every open item with plain arithmetic, so
 * the same state always produces the same list. `now` is an argument, nothing
 * here writes, and every store is read through its validated parser: a
 * malformed payload degrades to "no signal", never a throw.
 *
 * Scoring (bases and gains are whole points):
 *
 *   kind         base  gain
 *   review         50  + 2 x min(daysOverdue, 30)
 *   lab-review     48  + 3 x min(daysOverdue, 30)
 *   concept        36  + 2 x min(daysOverdue, 30)
 *   checkpoint     30  + round(20 x solvedBosses / required)
 *                      + 15 when exactly one boss is still missing
 *   coverage       18  + round(24 x unsolved share of the weakest category)
 *   placement      24  + round(24 x unmet share of today's plan)
 *   problem        42  flat (today's one-off)
 *
 * So urgency lifts a review by the day, a nearly-passable checkpoint can
 * outrank a same-day review, a fully unmet plan lands just under one, and
 * coverage is the fallback when nothing is due. Ties break by kind order
 * (review, lab-review, concept, checkpoint, problem, placement, coverage)
 * and then by id, which keeps the ranking stable across equal scores.
 *
 * A profile with no history and no placement yields no actions: the problem
 * and coverage candidates are only offered once the learner has started
 * something, so the "do this next" row can stay hidden without guessing.
 * `getTopAction` is the single highest-ranked action, or null.
 *
 * `getNextResearchAction` and `getNextPaperAction` sit outside the ranking:
 * research challenges are evergreen, so the best unbeaten one — a weak or
 * unseen metric family first, then catalogue order — gets its own Today row
 * instead of a score, and the papers row is a continuation prompt that only
 * appears between the first and the last read mark.
 */

import { formatScore, metricLabel } from "@/components/research/format";
import { ERA_LABELS, PAPERS } from "@/data/papers";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getDueConcepts, getConceptStates } from "@/lib/concepts";
import { getDailyDateKey, isTodaySolved } from "@/lib/daily";
import { getDailyProblem } from "@/lib/dailyProblem";
import { getLabRecords } from "@/lib/labs";
import { deriveLabReviews, readLabReviews } from "@/lib/labReviews";
import { readPlacement, type PlacementRecord } from "@/lib/onboarding";
import {
  evaluateStageCheckpoint,
  readCheckpointAttempts,
  type CheckpointAttemptMap,
} from "@/lib/pathCheckpoints";
import { getAllPaths, slugify } from "@/lib/paths";
import { getPapersState } from "@/lib/papers";
import { problemHref } from "@/lib/problemLinks";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getResearchState } from "@/lib/research";
import { dueReviews, getReviewMap, type ReviewMap } from "@/lib/reviewQueue";
import type { Category } from "@/types/problem";

export type ActionKind =
  | "review"
  | "lab-review"
  | "concept"
  | "checkpoint"
  | "coverage"
  | "placement"
  | "problem";

export interface Action {
  id: string;
  kind: ActionKind;
  title: string;
  reason: string;
  href: string;
  score: number;
}

/** How many ranked candidates the session row may choose from. */
export const ACTION_LIMIT = 5;

/** Days-overdue cap: beyond this, extra days add nothing to the score. */
export const OVERDUE_CAP_DAYS = 30;

const KIND_ORDER: Record<ActionKind, number> = {
  review: 0,
  "lab-review": 1,
  concept: 2,
  checkpoint: 3,
  problem: 4,
  placement: 5,
  coverage: 6,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

const CATEGORY_ORDER: Category[] = CATEGORIES.map((category) => category.name);

/* ──────────────────────────────── helpers ──────────────────────────────── */

/** Whole local calendar days between two date keys (positive when later). */
function dayDiff(fromKey: string, toKey: string): number {
  const [fromYear, fromMonth, fromDay] = fromKey.split("-").map(Number);
  const [toYear, toMonth, toDay] = toKey.split("-").map(Number);
  const from = new Date(fromYear, fromMonth - 1, fromDay);
  const to = new Date(toYear, toMonth - 1, toDay);
  const diff = Math.round((to.getTime() - from.getTime()) / DAY_MS);
  return Number.isFinite(diff) ? diff : 0;
}

function overduePoints(days: number, perDay: number): number {
  return perDay * Math.min(Math.max(0, days), OVERDUE_CAP_DAYS);
}

/** Same phrasing as the lab re-run list, so the two views never disagree. */
function overdueLabel(days: number): string {
  if (days <= 0) return "due today";
  return days === 1 ? "1 day overdue" : `${days} days overdue`;
}

function hasHistory(progress: ProgressMap): boolean {
  return Object.values(progress).some(
    (entry) => Boolean(entry?.attempted || entry?.solved),
  );
}

function solvedTodayCount(progress: ProgressMap, todayKey: string): number {
  let count = 0;
  for (const entry of Object.values(progress)) {
    if (!entry?.solved || !entry.solvedAt) continue;
    const at = new Date(entry.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    if (getDailyDateKey(at) === todayKey) count += 1;
  }
  return count;
}

function dailyProblemSolved(
  progress: ProgressMap,
  dailyId: string,
  now: Date,
  todayKey: string,
): boolean {
  if (isTodaySolved(now)) return true;
  const entry = progress[dailyId];
  if (!entry?.solved || !entry.solvedAt) return false;
  const at = new Date(entry.solvedAt);
  return !Number.isNaN(at.getTime()) && getDailyDateKey(at) === todayKey;
}

/* ─────────────────────────────── candidates ────────────────────────────── */

function reviewActions(
  reviews: ReviewMap,
  todayKey: string,
  now: Date,
): Action[] {
  return dueReviews(reviews, META_BY_ID, now).map((item) => {
    const days = Math.max(0, dayDiff(item.due, todayKey));
    return {
      id: `review:${item.id}`,
      kind: "review",
      title: item.meta.title,
      reason: `${item.meta.category} · ${overdueLabel(days)}`,
      href: problemHref(item.id, "/today"),
      score: 50 + overduePoints(days, 2),
    };
  });
}

function labReviewActions(now: Date, todayKey: string): Action[] {
  const records = getLabRecords();
  const derived = deriveLabReviews(records, readLabReviews(), now);
  const labsById = new Map(LABS.map((lab) => [lab.id, lab]));
  const actions: Action[] = [];
  for (const labId of Object.keys(derived).sort()) {
    const state = derived[labId];
    const lab = labsById.get(labId);
    if (!lab || state.due > todayKey) continue;
    if (records[labId]?.passed !== true) continue;
    const days = Math.max(0, dayDiff(state.due, todayKey));
    actions.push({
      id: `lab-review:${lab.id}`,
      kind: "lab-review",
      title: lab.title,
      reason: `${lab.category} · ${overdueLabel(days)}`,
      href: "/labs",
      score: 48 + overduePoints(days, 3),
    });
  }
  return actions;
}

function conceptActions(now: Date, todayKey: string): Action[] {
  const states = getConceptStates(now);
  const actions: Action[] = [];
  for (const concept of getDueConcepts(now)) {
    const state = states[concept.id];
    if (!state) continue;
    const days = Math.max(0, dayDiff(state.due, todayKey));
    actions.push({
      id: `concept:${concept.id}`,
      kind: "concept",
      title: concept.title,
      reason: `${concept.category} · ${overdueLabel(days)}`,
      href: "/math",
      score: 36 + overduePoints(days, 2),
    });
  }
  return actions;
}

function checkpointAction(
  placement: PlacementRecord,
  progress: ProgressMap,
  reviews: ReviewMap,
  attempts: CheckpointAttemptMap,
  now: Date,
): Action | null {
  const pathsById = new Map(getAllPaths().map((path) => [path.id, path]));
  let best: Action | null = null;
  for (const pathId of placement.recommendedPathIds) {
    const path = pathsById.get(pathId);
    if (!path) continue;
    const options = { pathId: path.id, reviews, attempts, now };
    for (const stage of path.stages) {
      const report = evaluateStageCheckpoint(stage, META_BY_ID, progress, options);
      if (!report.checkpoint || report.complete) continue;
      if (report.bossSolved <= 0) continue;
      const required = Math.max(1, report.required);
      const oneShort = required - report.bossSolved === 1;
      const score =
        30 +
        Math.round((20 * report.bossSolved) / required) +
        (oneShort ? 15 : 0);
      if (best && score <= best.score) continue;
      best = {
        id: `checkpoint:${path.id}:${stage.id}`,
        kind: "checkpoint",
        title: stage.title.trim() || path.title,
        reason: `${path.title} · ${report.bossSolved} of ${required} checkpoint problems solved`,
        href: `/paths/${path.slug}`,
        score,
      };
    }
  }
  return best;
}

interface CategoryCoverage {
  category: Category;
  solved: number;
  total: number;
  gap: number;
}

function coverageAction(
  progress: ProgressMap,
  history: boolean,
): Action | null {
  if (!history) return null;
  const totals = new Map<Category, number>();
  const solvedByCategory = new Map<Category, number>();
  for (const problem of PROBLEM_META) {
    totals.set(
      problem.category,
      (totals.get(problem.category) ?? 0) + 1,
    );
    if (progress[problem.id]?.solved) {
      solvedByCategory.set(
        problem.category,
        (solvedByCategory.get(problem.category) ?? 0) + 1,
      );
    }
  }
  let weakest: CategoryCoverage | null = null;
  for (const category of CATEGORY_ORDER) {
    const total = totals.get(category) ?? 0;
    if (total === 0) continue;
    const solved = solvedByCategory.get(category) ?? 0;
    const gap = 1 - solved / total;
    if (gap <= 0) continue;
    if (!weakest || gap > weakest.gap) {
      weakest = { category, solved, total, gap };
    }
  }
  if (!weakest) return null;
  const slug = slugify(weakest.category);
  return {
    id: `coverage:${slug}`,
    kind: "coverage",
    title: `Cover ${weakest.category}`,
    reason: `${weakest.solved} of ${weakest.total} problems solved`,
    href: `/categories/${slug}`,
    score: 18 + Math.round(24 * weakest.gap),
  };
}

function placementAction(
  placement: PlacementRecord,
  progress: ProgressMap,
  solvedToday: number,
): Action | null {
  const target = placement.dailyTarget;
  if (target <= 0 || solvedToday >= target) return null;
  const remaining = target - solvedToday;
  const firstOpen = placement.firstProblemIds.find(
    (id) => !progress[id]?.solved,
  );
  return {
    id: "placement:daily-target",
    kind: "placement",
    title: "Today's plan",
    reason: `${solvedToday} of ${target} planned solves done`,
    href: firstOpen ? problemHref(firstOpen, "/today") : "/problems",
    score: 24 + Math.round((24 * remaining) / target),
  };
}

function problemAction(
  progress: ProgressMap,
  now: Date,
  todayKey: string,
  offer: boolean,
): Action | null {
  if (!offer) return null;
  const daily = getDailyProblem(now);
  if (dailyProblemSolved(progress, daily.id, now, todayKey)) return null;
  return {
    id: `problem:${daily.id}`,
    kind: "problem",
    title: daily.title,
    reason: `${daily.category} · still open today`,
    href: problemHref(daily.id, "/today"),
    score: 42,
  };
}

/* ───────────────────────────────── entry ───────────────────────────────── */

/**
 * The top `ACTION_LIMIT` ranked actions for `now`. Pure with respect to the
 * stores: reads only, never throws, and an unusable clock yields no actions.
 */
export function getNextBestActions(now: Date = new Date()): Action[] {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return [];
  const todayKey = getDailyDateKey(now);
  const progress = getProgress();
  const reviews = getReviewMap(now);
  const placement = readPlacement();
  const history = hasHistory(progress);
  const solvedToday = solvedTodayCount(progress, todayKey);

  const candidates: Action[] = [
    ...reviewActions(reviews, todayKey, now),
    ...labReviewActions(now, todayKey),
    ...conceptActions(now, todayKey),
  ];

  if (placement) {
    const checkpoint = checkpointAction(
      placement,
      progress,
      reviews,
      readCheckpointAttempts(),
      now,
    );
    if (checkpoint) candidates.push(checkpoint);
    const plan = placementAction(placement, progress, solvedToday);
    if (plan) candidates.push(plan);
  }

  const coverage = coverageAction(progress, history);
  if (coverage) candidates.push(coverage);

  const daily = problemAction(
    progress,
    now,
    todayKey,
    history || placement !== null,
  );
  if (daily) candidates.push(daily);

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      a.id.localeCompare(b.id),
  );
  return candidates.slice(0, ACTION_LIMIT);
}

/** The single best action, or null when nothing is worth surfacing. */
export function getTopAction(now: Date = new Date()): Action | null {
  return getNextBestActions(now)[0] ?? null;
}

/* ───────────────────────────── research row ───────────────────────────── */

/**
 * The best unbeaten research challenge, shaped like the other Today rows:
 * title, a metric + baseline line, the points on offer, and the workspace
 * link. Challenges whose metric family has no passing lab yet — weak or
 * untouched — are preferred; otherwise the first unbeaten challenge in
 * catalogue order wins. Null once all five baselines are beaten.
 */
export interface ResearchAction {
  id: string;
  title: string;
  reason: string;
  points: number;
  href: string;
}

export function getNextResearchAction(): ResearchAction | null {
  const state = getResearchState();
  const unbeaten = RESEARCH_CHALLENGES.filter(
    (challenge) => state[challenge.id]?.beatenBaseline !== true,
  );
  if (unbeaten.length === 0) return null;

  const labsById = new Map(LABS.map((lab) => [lab.id, lab]));
  const passedMetrics = new Set<string>();
  for (const [labId, record] of Object.entries(getLabRecords())) {
    const lab = labsById.get(labId);
    if (lab && record.passed) passedMetrics.add(lab.metric);
  }
  const challenge =
    unbeaten.find((item) => !passedMetrics.has(item.metric)) ?? unbeaten[0];

  return {
    id: `research:${challenge.id}`,
    title: challenge.title,
    reason: `${metricLabel(challenge.metric)} · baseline ${formatScore(
      challenge.baselineScore,
    )} (${challenge.baselineName})`,
    points: challenge.points,
    href: `/research/${challenge.id}`,
  };
}

/* ─────────────────────────── papers row ─────────────────────────── */

/**
 * The next unread paper once the learner is mid-curriculum: at least one
 * paper read and at least one still open. Read marks for ids that are not in
 * the catalogue are ignored, so a stale backup cannot mark the curriculum
 * finished. Null for a fresh profile (nothing read yet) and for a finished
 * one, which keeps the Today row hidden at both ends.
 */
export interface PaperAction {
  id: string;
  title: string;
  /** Era plus position in reading order, e.g. "Founding · paper 2 of 35". */
  reason: string;
  order: number;
  total: number;
  read: number;
  href: string;
}

export function getNextPaperAction(): PaperAction | null {
  const { read } = getPapersState();
  const readCount = PAPERS.filter((paper) => Boolean(read[paper.id])).length;
  if (readCount === 0) return null;
  const index = PAPERS.findIndex((paper) => !read[paper.id]);
  if (index < 0) return null;
  const paper = PAPERS[index];
  return {
    id: `paper:${paper.id}`,
    title: paper.title,
    reason: `${ERA_LABELS[paper.era]} · paper ${index + 1} of ${PAPERS.length}`,
    order: index + 1,
    total: PAPERS.length,
    read: readCount,
    href: `/papers/${paper.slug}`,
  };
}
