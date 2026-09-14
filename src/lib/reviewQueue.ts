/**
 * Review Queue — spaced repetition for the code problem bank.
 *
 * Every solved problem already carries a first-solve timestamp
 * (`ProblemProgress.solvedAt`); this module turns those timestamps into an
 * SM-2-style schedule (`ease 2.5` clamp 1.3–2.8, intervals 1 → 6 → ease ×
 * interval, lapse reset) and exposes the due / learning / new buckets the
 * Today screen composes.
 *
 * Determinism: every exported scheduler function takes its clock as an
 * argument and returns a brand-new map, so identical state always yields the
 * identical queue. Nothing here touches the network; persistence routes
 * through `createStore` so the optional sync engine can pick it up while the
 * feature stays fully local-first.
 *
 * Re-solving a due problem is the pass signal: `ProblemView` calls
 * `markSolved`, which refreshes `solvedAt`, and `deriveReviews` advances the
 * schedule with a clean-pass grade. The "Forgot" action grades a lapse
 * explicitly. `qualityFromRun` maps a richer run summary (used by the run
 * harness) onto the 0/3/4/5 ladder.
 */

import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";
import type { Difficulty } from "@/types/problem";

export const REVIEWS_STORAGE_KEY = "deepforge:reviews:v1";
export const REVIEWS_CHANGE_EVENT = "deepforge:reviews-change";

/** Hard cap on a single day's queue (review fatigue guard). */
export const REVIEW_DAILY_LIMIT = 10;

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

/** Grade recorded when a due problem is re-solved cleanly. */
export const CLEAN_PASS: ReviewQuality = 5;

export type ReviewQuality = 0 | 3 | 4 | 5;

export interface ReviewState {
  ease: number;
  /** Days until the next review. */
  interval: number;
  /** Local calendar date the item is next due: "YYYY-MM-DD". */
  due: string;
  /** Consecutive passes since the last lapse. */
  reps: number;
  lapses: number;
  lastGrade: ReviewQuality | null;
  lastReviewedAt: string | null;
}

export type ReviewMap = Record<string, ReviewState>;

export type ReviewBucket = "due" | "learning" | "new" | "scheduled";

export interface ReviewBucketCounts {
  /** Reviewed before, due today or earlier. */
  due: number;
  /** First interval complete, waiting on the first review. */
  learning: number;
  /** Solved recently, first interval still running. */
  new: number;
  /** Scheduled ahead of today. */
  scheduled: number;
  total: number;
}

export interface ReviewItem {
  id: string;
  state: ReviewState;
  meta: ProblemMeta;
  bucket: "due" | "learning";
  due: string;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DIFFICULTY_RANK: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

/* ─────────────────────────────── date math ─────────────────────────────── */

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function clampEase(ease: number): number {
  return Math.round(Math.min(MAX_EASE, Math.max(MIN_EASE, ease)) * 1000) / 1000;
}

/* ──────────────────────────────── state ────────────────────────────────── */

export function defaultReviewState(now: Date = new Date()): ReviewState {
  return {
    ease: INITIAL_EASE,
    interval: 0,
    due: getDailyDateKey(now),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
  };
}

/**
 * Validate a persisted/remote review entry. Returns null for anything that
 * is not a usable state, so a bad payload can never poison a schedule.
 */
export function sanitizeReviewState(value: unknown): ReviewState | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const ease =
    typeof record.ease === "number" && Number.isFinite(record.ease)
      ? clampEase(record.ease)
      : INITIAL_EASE;
  const interval =
    typeof record.interval === "number" && Number.isFinite(record.interval)
      ? Math.max(0, Math.round(record.interval))
      : 0;
  const due =
    typeof record.due === "string" && DATE_KEY.test(record.due)
      ? record.due
      : getDailyDateKey();
  const reps =
    typeof record.reps === "number" && Number.isFinite(record.reps)
      ? Math.max(0, Math.round(record.reps))
      : 0;
  const lapses =
    typeof record.lapses === "number" && Number.isFinite(record.lapses)
      ? Math.max(0, Math.round(record.lapses))
      : 0;
  const lastGrade =
    record.lastGrade === 0 ||
    record.lastGrade === 3 ||
    record.lastGrade === 4 ||
    record.lastGrade === 5
      ? (record.lastGrade as ReviewQuality)
      : null;
  const lastReviewedAt = isIsoTimestamp(record.lastReviewedAt)
    ? record.lastReviewedAt
    : null;
  return { ease, interval, due, reps, lapses, lastGrade, lastReviewedAt };
}

export function parseReviewMap(raw: string | null): ReviewMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: ReviewMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      const state = sanitizeReviewState(value);
      if (state) out[id] = state;
    }
    return out;
  } catch {
    return {};
  }
}

/* ────────────────────────────── scheduling ─────────────────────────────── */

/**
 * Map a run summary onto the SM-2 quality ladder. Kept pure so the run
 * harness can record richer grades later without touching the scheduler:
 * clean first-pass 5, pass after failed runs 4, pass after a reset 3, fail 0.
 */
export function qualityFromRun(run: {
  passed: boolean;
  failedRuns?: number;
  resetBeforePass?: boolean;
}): ReviewQuality {
  if (!run.passed) return 0;
  if (run.resetBeforePass) return 3;
  if ((run.failedRuns ?? 0) > 0) return 4;
  return 5;
}

/** One SM-2 step. Pure: same (prev, quality, now) → same next state. */
export function gradeReviewState(
  prev: ReviewState | undefined,
  quality: ReviewQuality,
  now: Date = new Date(),
): ReviewState {
  const base = prev ?? defaultReviewState(now);
  const today = getDailyDateKey(now);
  if (quality < 3) {
    return {
      ease: clampEase(base.ease - 0.2),
      interval: 1,
      due: addDays(today, 1),
      reps: 0,
      lapses: base.lapses + 1,
      lastGrade: quality,
      lastReviewedAt: now.toISOString(),
    };
  }
  const interval =
    base.reps === 0
      ? 1
      : base.reps === 1
        ? 6
        : Math.max(1, Math.round(base.interval * base.ease));
  const delta = 0.1 - (5 - quality) * (0.08 + 0.02 * (5 - quality));
  return {
    ease: clampEase(base.ease + delta),
    interval,
    due: addDays(today, interval),
    reps: base.reps + 1,
    lapses: base.lapses,
    lastGrade: quality,
    lastReviewedAt: now.toISOString(),
  };
}

function seedEntry(solvedAt: string | null, now: Date): ReviewState {
  const anchor = solvedAt ? new Date(solvedAt) : now;
  const solvedDay = getDailyDateKey(anchor);
  return {
    ease: INITIAL_EASE,
    interval: 1,
    due: addDays(solvedDay, 1),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
  };
}

/**
 * A solve counts as a completed review only once the item was actually due
 * (and only once per calendar day), so re-solving an early item never skips
 * the forgetting curve.
 */
function reconcileEntry(
  state: ReviewState,
  solvedAt: string,
): ReviewState {
  const solvedDay = getDailyDateKey(new Date(solvedAt));
  if (solvedDay < state.due) return state;
  if (state.lastReviewedAt) {
    const reviewedDay = getDailyDateKey(new Date(state.lastReviewedAt));
    if (solvedDay <= reviewedDay) return state;
  }
  return gradeReviewState(state, CLEAN_PASS, new Date(solvedAt));
}

/**
 * Merge the solve history into the review map: new solves are seeded with a
 * one-day first interval, and solves that land on/after the due date advance
 * the schedule. Pure; keys are built in sorted order for stable output.
 */
export function deriveReviews(
  progress: ProgressMap,
  existing: ReviewMap,
  now: Date = new Date(),
): ReviewMap {
  const ids = new Set([...Object.keys(existing), ...Object.keys(progress)]);
  const out: ReviewMap = {};
  for (const id of [...ids].sort()) {
    const current = existing[id];
    const entry = progress[id];
    const solvedAt = isIsoTimestamp(entry?.solvedAt) ? entry.solvedAt : null;
    const solved = entry?.solved === true;
    if (current) {
      out[id] = solved && solvedAt ? reconcileEntry(current, solvedAt) : current;
      continue;
    }
    if (!solved) continue;
    out[id] = seedEntry(solvedAt, now);
  }
  return out;
}

/* ─────────────────────────────── buckets ───────────────────────────────── */

export function bucketOf(state: ReviewState, todayKey: string): ReviewBucket {
  const dueNow = state.due <= todayKey;
  if (state.reps === 0) return dueNow ? "learning" : "new";
  return dueNow ? "due" : "scheduled";
}

export function getReviewBucketCounts(
  reviews: ReviewMap,
  now: Date = new Date(),
): ReviewBucketCounts {
  const today = getDailyDateKey(now);
  const counts: ReviewBucketCounts = {
    due: 0,
    learning: 0,
    new: 0,
    scheduled: 0,
    total: 0,
  };
  for (const state of Object.values(reviews)) {
    counts.total += 1;
    const bucket = bucketOf(state, today);
    if (bucket === "due") counts.due += 1;
    else if (bucket === "learning") counts.learning += 1;
    else if (bucket === "new") counts.new += 1;
    else counts.scheduled += 1;
  }
  return counts;
}

/** Total lapses per category — the weak-area signal for queue ordering. */
export function weakCategories(
  reviews: ReviewMap,
  metaById: ReadonlyMap<string, ProblemMeta>,
): Map<string, number> {
  const weights = new Map<string, number>();
  for (const [id, state] of Object.entries(reviews)) {
    if (state.lapses <= 0) continue;
    const meta = metaById.get(id);
    if (!meta) continue;
    weights.set(
      meta.category,
      (weights.get(meta.category) ?? 0) + state.lapses,
    );
  }
  return weights;
}

/**
 * No two consecutive items from the same category (interleaved practice).
 * The input order is preserved as the preference order.
 */
export function interleaveByCategory(items: ReviewItem[]): ReviewItem[] {
  const remaining = [...items];
  const out: ReviewItem[] = [];
  let lastCategory: string | null = null;
  while (remaining.length > 0) {
    const index = remaining.findIndex(
      (item) => item.meta.category !== lastCategory,
    );
    const [item] = remaining.splice(index === -1 ? 0 : index, 1);
    out.push(item);
    lastCategory = item.meta.category;
  }
  return out;
}

/**
 * The day's queue: everything due today or earlier, weak categories first,
 * then ease ascending, due date, difficulty, and id; interleaved so no two
 * neighbours share a category, capped at `limit`.
 */
export function dueReviews(
  reviews: ReviewMap,
  metaById: ReadonlyMap<string, ProblemMeta>,
  now: Date = new Date(),
  limit: number = REVIEW_DAILY_LIMIT,
): ReviewItem[] {
  const today = getDailyDateKey(now);
  const weights = weakCategories(reviews, metaById);
  const items: ReviewItem[] = [];
  for (const [id, state] of Object.entries(reviews)) {
    if (state.due > today) continue;
    const meta = metaById.get(id);
    if (!meta) continue;
    items.push({
      id,
      state,
      meta,
      due: state.due,
      bucket: state.reps === 0 ? "learning" : "due",
    });
  }
  items.sort(
    (a, b) =>
      (weights.get(b.meta.category) ?? 0) -
        (weights.get(a.meta.category) ?? 0) ||
      a.state.ease - b.state.ease ||
      a.state.due.localeCompare(b.state.due) ||
      DIFFICULTY_RANK[a.meta.difficulty] -
        DIFFICULTY_RANK[b.meta.difficulty] ||
      a.id.localeCompare(b.id),
  );
  return interleaveByCategory(items).slice(0, Math.max(0, Math.round(limit)));
}

/** Earliest future due date, for the "nothing due" state. */
export function nextDueDate(
  reviews: ReviewMap,
  now: Date = new Date(),
): string | null {
  const today = getDailyDateKey(now);
  let next: string | null = null;
  for (const state of Object.values(reviews)) {
    if (state.due <= today) continue;
    if (next === null || state.due < next) next = state.due;
  }
  return next;
}

/* ──────────────────────────── weak-area pick ───────────────────────────── */

/**
 * One problem from the learner's weakest area with work left to do:
 * categories rank by recorded lapses, then by attempted-but-unsolved count,
 * then by solve ratio; the pick prefers the easiest unsolved item.
 * Returns null for a brand-new learner (no attempts yet).
 */
export function pickWeakArea(
  progress: ProgressMap,
  reviews: ReviewMap,
  problems: readonly ProblemMeta[],
): ProblemMeta | null {
  const metaById = new Map(problems.map((problem) => [problem.id, problem]));
  const lapses = weakCategories(reviews, metaById);
  const stats = new Map<
    string,
    { attempted: number; solved: number; unsolvedReferenced: number }
  >();
  for (const problem of problems) {
    const entry = progress[problem.id];
    if (!entry?.attempted && !entry?.solved) continue;
    const stat = stats.get(problem.category) ?? {
      attempted: 0,
      solved: 0,
      unsolvedReferenced: 0,
    };
    stat.attempted += 1;
    if (entry.solved) stat.solved += 1;
    else stat.unsolvedReferenced += 1;
    stats.set(problem.category, stat);
  }
  if (stats.size === 0) return null;

  const ranked = [...stats.entries()].sort((a, b) => {
    const lapseDelta = (lapses.get(b[0]) ?? 0) - (lapses.get(a[0]) ?? 0);
    if (lapseDelta !== 0) return lapseDelta;
    const openDelta = b[1].unsolvedReferenced - a[1].unsolvedReferenced;
    if (openDelta !== 0) return openDelta;
    const ratioDelta =
      a[1].solved / Math.max(1, a[1].attempted) -
      b[1].solved / Math.max(1, b[1].attempted);
    if (ratioDelta !== 0) return ratioDelta;
    return a[0].localeCompare(b[0]);
  });

  for (const [category] of ranked) {
    const candidates = problems.filter(
      (problem) =>
        problem.category === category && !progress[problem.id]?.solved,
    );
    if (candidates.length === 0) continue;
    candidates.sort(
      (a, b) =>
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        a.id.localeCompare(b.id),
    );
    return candidates[0];
  }
  return null;
}

/* ──────────────────────────────── store ────────────────────────────────── */

const reviewStore = createStore<ReviewMap>({
  id: "reviews",
  storageKey: REVIEWS_STORAGE_KEY,
  event: REVIEWS_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseReviewMap,
  serialize: (v) => JSON.stringify(v),
});

function sameMap(a: ReviewMap, b: ReviewMap): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Stored schedule (validated), without touching the solve history. */
export function readReviews(): ReviewMap {
  return reviewStore.get();
}

/** Derived schedule for rendering. Pure read — never writes during render. */
export function getReviewMap(now: Date = new Date()): ReviewMap {
  return deriveReviews(getProgress(), reviewStore.get(), now);
}

/**
 * Derive and persist if the solve history moved the schedule. Safe to call
 * from an effect or an event handler; returns the current map.
 */
export function syncReviewQueue(now: Date = new Date()): ReviewMap {
  const stored = reviewStore.get();
  const next = deriveReviews(getProgress(), stored, now);
  if (!sameMap(next, stored)) reviewStore.set(next);
  return next;
}

/** Record an explicit grade for one problem and persist it. */
export function gradeReview(
  id: string,
  quality: ReviewQuality,
  now: Date = new Date(),
): ReviewState {
  const derived = deriveReviews(getProgress(), reviewStore.get(), now);
  const next = gradeReviewState(derived[id], quality, now);
  reviewStore.set({ ...derived, [id]: next });
  return next;
}

/** Grade a failed review (lapse): interval resets, ease drops. */
export function forgetReview(id: string, now: Date = new Date()): ReviewState {
  return gradeReview(id, 0, now);
}

export const REVIEWS_SPEC: StoreSpec<ReviewMap> = {
  id: "reviews",
  storageKey: REVIEWS_STORAGE_KEY,
  event: REVIEWS_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseReviewMap,
  serialize: (v) => JSON.stringify(v),
};
