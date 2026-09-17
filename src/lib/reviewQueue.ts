/**
 * Review Queue — Ladder-Graded Spacing (LGS) for the code problem bank.
 *
 * Every solved problem already carries a first-solve timestamp
 * (`ProblemProgress.solvedAt`); this module turns those timestamps into an
 * LGS schedule. Grading delegates to the frozen pure core in `src/lib/lgs.ts`
 * (`gradeLadderReview`); the SM-2 ladder (1 → 6 → ease × interval) is gone.
 * The legacy fields (`ease`, `interval`, `due`, `reps`, `lapses`, `lastGrade`,
 * `lastReviewedAt`) are preserved: `ease` is frozen as a rollback field, and
 * `due`/`interval` still drive the queue. The v2 fields (`v`, `S`, `D`,
 * `effort`) are the live model.
 *
 * Migration is a single choke point: every value parsed from storage, sync,
 * or backup flows through `sanitizeReviewState` → `migrateReviewState`, which
 * copies valid v2 fields verbatim and derives them from the legacy fields
 * only when missing/invalid. `migrateReviewState` is byte-idempotent.
 *
 * Determinism: every exported scheduler function takes its clock as an
 * argument and returns a brand-new map, so identical state always yields the
 * identical queue. Nothing here touches the network; persistence routes
 * through `createStore` so the optional sync engine can pick it up while the
 * feature stays fully local-first.
 *
 * Re-solving a due problem is the pass signal: `ProblemView` calls
 * `markSolved`, which refreshes `solvedAt`, and `deriveReviews` advances the
 * schedule through the quality-5 adapter. The "Forgot" action grades a lapse
 * explicitly. `qualityFromRun` remains the run-summary → quality mapping, and
 * `gradeReviewSignal` grades with the richer LGS signal (failed runs, hint
 * tier, reset-before-pass) for callers that have it.
 *
 * Day one: migration only derives `S`/`D`/`effort`; `due`, `interval`, and
 * `reps` are carried over byte-identically, so due dates and buckets do not
 * move until the next grade.
 */

import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import {
  LGS_VERSION,
  gradeLadderReview,
  lgsRetrievability,
  migrateReviewState,
  type LgsSignal,
  type LgsState,
} from "@/lib/lgs";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";
import type { Difficulty } from "@/types/problem";

export const REVIEWS_STORAGE_KEY = "deepforge:reviews:v1";
export const REVIEWS_CHANGE_EVENT = "deepforge:reviews-change";

/** Hard cap on a single day's queue (review fatigue guard). */
export const REVIEW_DAILY_LIMIT = 10;

/**
 * Legacy ease anchors, kept for rollback (LGS never moves `ease`). Rollback
 * resumes SM-2 from the frozen `ease` and the LGS-written `interval`.
 */
export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

/** Grade recorded when a due problem is re-solved cleanly. */
export const CLEAN_PASS: ReviewQuality = 5;

export type ReviewQuality = 0 | 3 | 4 | 5;

/**
 * Public review state: the seven legacy fields plus the LGS fields. The LGS
 * fields are optional in the type so legacy-shaped literals in downstream
 * code keep compiling; every value that crosses `sanitizeReviewState`
 * (storage read, sync merge, backup import) or comes out of a grader is a
 * full `LgsState` with `v`, `S`, `D`, and `effort` present.
 */
export interface ReviewState {
  ease: number;
  /** Days until the next review (mirrors the LGS interval). */
  interval: number;
  /** Local calendar date the item is next due: "YYYY-MM-DD". */
  due: string;
  /** Consecutive passes since the last lapse. */
  reps: number;
  lapses: number;
  lastGrade: ReviewQuality | null;
  lastReviewedAt: string | null;
  /** LGS state version; 2 once migrated. */
  v?: typeof LGS_VERSION;
  /** LGS memory stability. */
  S?: number;
  /** LGS difficulty in [1, 10]. */
  D?: number;
  /** LGS effort EWMA in [0, 1]; >= 0.6 enters the interval cap. */
  effort?: number;
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

/** The ladder signal each quality maps onto (the inverse of the adapter). */
const QUALITY_SIGNAL: Record<ReviewQuality, LgsSignal> = {
  5: { passed: true, failedRuns: 0, hintTier: 0, resetBeforePass: false },
  4: { passed: true, failedRuns: 1, hintTier: 0, resetBeforePass: false },
  3: { passed: true, failedRuns: 1, hintTier: 2, resetBeforePass: false },
  0: { passed: false, failedRuns: 0, hintTier: 0, resetBeforePass: false },
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

/* ──────────────────────────────── state ────────────────────────────────── */

/** A first-review seed: interval 1, due tomorrow, LGS `S=1, D=5, effort=0`. */
export function defaultReviewState(now: Date = new Date()): LgsState {
  return {
    ease: INITIAL_EASE,
    interval: 1,
    due: addDays(getDailyDateKey(now), 1),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    v: LGS_VERSION,
    S: 1,
    D: 5,
    effort: 0,
  };
}

/**
 * Validate a persisted/remote review entry and migrate it to LGS v2. This is
 * the single choke point for data entering the app: `parseReviewMap`, the
 * sync merge (`mergeReviews`), and backup import all route here. Returns null
 * for anything that is not a usable state, so a bad payload can never poison
 * a schedule. Valid v2 fields are copied verbatim; `due` never moves.
 */
export function sanitizeReviewState(value: unknown): LgsState | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return migrateReviewState(value, getDailyDateKey());
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
 * Normalize a partial signal so a junk payload can never produce NaN fields
 * (the core clamps too; this keeps the adapter's contract explicit).
 */
function normalizeSignal(signal: Partial<LgsSignal>): LgsSignal {
  return {
    passed: signal.passed === true,
    failedRuns:
      typeof signal.failedRuns === "number" && Number.isFinite(signal.failedRuns)
        ? Math.max(0, signal.failedRuns)
        : 0,
    hintTier:
      typeof signal.hintTier === "number" && Number.isFinite(signal.hintTier)
        ? Math.max(0, signal.hintTier)
        : 0,
    resetBeforePass: signal.resetBeforePass === true,
  };
}

/**
 * Map a run summary onto the quality ladder. Compatibility shim retained for
 * callers that still grade by quality: it reproduces the original mapping
 * (clean 5, pass after failed runs 4, pass after a reset 3, fail 0) and is the
 * inverse of the adapter below (`gradeReviewState` maps the quality back onto
 * `QUALITY_SIGNAL`). New code that owns hint/struggle data should call
 * `gradeReviewSignal` directly instead.
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

/**
 * One LGS step through the quality adapter: 5 → `{f:0,h:0}`, 4 → `{f:1,h:0}`,
 * 3 → `{f:1,h:2}`, 0 → `{passed:false}`. `lastGrade` is overridden with the
 * caller's exact quality (the core's own ladder label may differ for q3).
 * Pure: same `(prev, quality, now)` → same next state.
 */
export function gradeReviewState(
  prev: ReviewState | undefined,
  quality: ReviewQuality,
  now: Date = new Date(),
): LgsState {
  const next = gradeLadderReview(prev, QUALITY_SIGNAL[quality], now);
  return { ...next, lastGrade: quality };
}

/**
 * Grade one problem with a full LGS signal (failed runs, hint tier, reset
 * flag), deriving the current map first and persisting the result — the
 * signal-aware mirror of `gradeReview`.
 */
export function gradeReviewSignal(
  id: string,
  signal: Partial<LgsSignal>,
  now: Date = new Date(),
): LgsState {
  const derived = deriveReviews(getProgress(), reviewStore.get(), now);
  const next = gradeLadderReview(derived[id], normalizeSignal(signal), now);
  reviewStore.set({ ...derived, [id]: next });
  return next;
}

function seedEntry(solvedAt: string | null, now: Date): LgsState {
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
    v: LGS_VERSION,
    S: 1,
    D: 5,
    effort: 0,
  };
}

/**
 * A solve counts as a completed review only once the item was actually due
 * (and only once per calendar day), so re-solving an early item never skips
 * the forgetting curve.
 */
function reconcileEntry(state: ReviewState, solvedAt: string): ReviewState {
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
 * The day's queue: everything due today or earlier, ordered by predicted
 * retrievability ascending (most forgotten first) per the LGS blueprint,
 * then weak-category weight desc, due date, difficulty, and id; interleaved
 * so no two neighbours share a category, capped at `limit`.
 */
export function dueReviews(
  reviews: ReviewMap,
  metaById: ReadonlyMap<string, ProblemMeta>,
  now: Date = new Date(),
  limit: number = REVIEW_DAILY_LIMIT,
): ReviewItem[] {
  const today = getDailyDateKey(now);
  const weights = weakCategories(reviews, metaById);
  const retrievability = new Map<string, number>();
  const items: ReviewItem[] = [];
  for (const [id, state] of Object.entries(reviews)) {
    if (state.due > today) continue;
    const meta = metaById.get(id);
    if (!meta) continue;
    retrievability.set(id, lgsRetrievability(state, now));
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
      (retrievability.get(a.id) ?? 0) - (retrievability.get(b.id) ?? 0) ||
      (weights.get(b.meta.category) ?? 0) -
        (weights.get(a.meta.category) ?? 0) ||
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

/**
 * Stored schedule (validated and migrated to LGS v2), without touching the
 * solve history.
 */
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
): LgsState {
  const derived = deriveReviews(getProgress(), reviewStore.get(), now);
  const next = gradeReviewState(derived[id], quality, now);
  reviewStore.set({ ...derived, [id]: next });
  return next;
}

/** Grade a failed review (lapse): the LGS lapse policy applies. */
export function forgetReview(id: string, now: Date = new Date()): LgsState {
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
