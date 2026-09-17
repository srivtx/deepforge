/**
 * Lab re-runs — spaced repetition for passed scored labs.
 *
 * Passing a lab is a milestone, not a conclusion: the schedule seeds on the
 * lab's first pass with a one-day interval, advances on a later pass using the
 * exact `reviewQueue` SM-2 rules (interval 6, then `interval × ease`), and
 * lapses when a re-run scores below the lab's target. The Today screen uses
 * `labReviewDue` to surface what is due and deep-links to `/labs`, where
 * scoring and grading happen.
 *
 * Pure core: every scheduler function takes its clock as an argument and
 * returns a brand-new map, so identical state always yields the identical
 * schedule. Persistence is local-only this wave — the same try/catch +
 * CustomEvent hygiene as `createStore`, without registering with the sync
 * seam — and records are seeded backwards from each lab's stored pass history
 * (`LabRecord.recentPasses`), so labs passed before this feature existed get
 * a schedule too.
 *
 * Determinism note: re-runs recorded on the Labs page flow through
 * `setLabBest`, which appends pass timestamps but never touches this store.
 * `deriveLabReviews` therefore reconciles: each pass on a calendar day after
 * the last graded one advances the schedule once, mirroring the review
 * queue's one-review-per-day rule and avoiding double-advances.
 */

import { LABS, type Lab } from "@/data/labs";
import { getDailyDateKey } from "@/lib/daily";
import {
  getLabRecords,
  type LabRecord,
  type LabRecords,
} from "@/lib/labs";
import {
  CLEAN_PASS,
  INITIAL_EASE,
  gradeReviewState,
  sanitizeReviewState,
  type ReviewState,
} from "@/lib/reviewQueue";
import { readRaw, writeRaw } from "@/lib/sync/localAdapter";

export const LAB_REVIEWS_STORAGE_KEY = "deepforge:lab-reviews:v1";

export const LAB_REVIEWS_CHANGE_EVENT = "deepforge:lab-reviews-change";

/** Lab review state: the review queue state plus the latest scored value. */
export interface LabReviewState extends ReviewState {
  /** Metric value of the most recent run, when known. */
  lastScore: number | null;
}

export type LabReviewMap = Record<string, LabReviewState>;

export interface LabReviewItem {
  lab: Lab;
  state: LabReviewState;
  /** Date key the re-run is due: "YYYY-MM-DD". */
  due: string;
  /** Whole days past due; 0 when due today. */
  overdueDays: number;
}

/* ─────────────────────────────── date math ─────────────────────────────── */

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

/** Whole local calendar days between two date keys (positive when `to` is later). */
function dayDiff(fromKey: string, toKey: string): number {
  const [fromYear, fromMonth, fromDay] = fromKey.split("-").map(Number);
  const [toYear, toMonth, toDay] = toKey.split("-").map(Number);
  const from = new Date(fromYear, fromMonth - 1, fromDay);
  const to = new Date(toYear, toMonth - 1, toDay);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/* ──────────────────────────────── state ────────────────────────────────── */

export function defaultLabReviewState(now: Date = new Date()): LabReviewState {
  return {
    ease: INITIAL_EASE,
    interval: 0,
    due: getDailyDateKey(now),
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    lastScore: null,
  };
}

/**
 * Seed a schedule from a lab's first pass: a one-day first interval, counted
 * as the first rep so the next pass advances straight to six days.
 */
export function seedLabReviewState(
  passedAt: string | Date,
  score: number | null = null,
): LabReviewState {
  const anchor = typeof passedAt === "string" ? new Date(passedAt) : passedAt;
  const valid = !Number.isNaN(anchor.getTime());
  const at = valid ? anchor : new Date();
  return {
    ease: INITIAL_EASE,
    interval: 1,
    due: addDays(getDailyDateKey(at), 1),
    reps: 1,
    lapses: 0,
    lastGrade: CLEAN_PASS,
    lastReviewedAt: valid ? at.toISOString() : null,
    lastScore: score,
  };
}

/**
 * Sanitize a persisted schedule entry. Returns null for anything unusable, so
 * a malformed payload can never poison a schedule or throw a derived view.
 */
export function sanitizeLabReviewState(value: unknown): LabReviewState | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const base = sanitizeReviewState(record);
  if (!base) return null;
  return {
    ...base,
    lastScore: isFiniteNumber(record.lastScore) ? record.lastScore : null,
  };
}

export function parseLabReviewMap(raw: string | null): LabReviewMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: LabReviewMap = {};
    for (const [labId, value] of Object.entries(parsed)) {
      const state = sanitizeLabReviewState(value);
      if (state) out[labId] = state;
    }
    return out;
  } catch {
    return {};
  }
}

/* ────────────────────────────── scheduling ─────────────────────────────── */

/**
 * One schedule step. A pass grades as a clean pass (quality 5); a re-run below
 * target grades as a lapse (quality 0). Both delegate to the review queue's
 * SM-2 step, so intervals and ease stay consistent across features. Pure.
 */
export function gradeLabReviewState(
  prev: LabReviewState | undefined,
  passed: boolean,
  score: number | null,
  now: Date = new Date(),
): LabReviewState {
  const base = prev ?? defaultLabReviewState(now);
  const next = gradeReviewState(base, passed ? CLEAN_PASS : 0, now);
  return {
    ...next,
    lastScore: isFiniteNumber(score) ? score : base.lastScore,
  };
}

/** Passing runs stored on a lab record, oldest first. */
function recordPasses(record: LabRecord | undefined): string[] {
  if (!record || !Array.isArray(record.recentPasses)) return [];
  return record.recentPasses.filter(isIsoTimestamp).sort();
}

/**
 * Advance a schedule with every pass on a calendar day after the last graded
 * one. Same-day passes never advance twice, matching the review queue.
 */
function applyPasses(
  state: LabReviewState,
  passes: readonly string[],
  score: number | null,
): LabReviewState {
  let next = state;
  let appliedDay = next.lastReviewedAt
    ? getDailyDateKey(new Date(next.lastReviewedAt))
    : null;
  for (const passAt of passes) {
    const at = new Date(passAt);
    const day = getDailyDateKey(at);
    if (appliedDay !== null && day <= appliedDay) continue;
    next = gradeLabReviewState(next, true, score, at);
    appliedDay = day;
  }
  return next;
}

function seedFromRecord(record: LabRecord, now: Date): LabReviewState {
  const passes = recordPasses(record);
  const fallbackAt = isIsoTimestamp(record.lastScoredAt)
    ? record.lastScoredAt
    : now.toISOString();
  const score = isFiniteNumber(record.lastScore) ? record.lastScore : null;
  const seeded = seedLabReviewState(passes[0] ?? fallbackAt, score);
  return applyPasses(seeded, passes, score);
}

/**
 * Merge lab records into the re-run schedule: labs with a recorded pass get a
 * schedule seeded from their first pass, existing schedules advance for every
 * later pass, and unknown/never-passed labs are left alone. Pure; keys are
 * built in sorted order for stable output.
 */
export function deriveLabReviews(
  records: LabRecords,
  existing: LabReviewMap,
  now: Date = new Date(),
): LabReviewMap {
  const ids = new Set([...Object.keys(existing), ...Object.keys(records)]);
  const out: LabReviewMap = {};
  for (const labId of [...ids].sort()) {
    const current = existing[labId];
    const record = records[labId];
    if (current) {
      out[labId] =
        record?.passed === true
          ? applyPasses(
              current,
              recordPasses(record),
              isFiniteNumber(record.lastScore) ? record.lastScore : current.lastScore,
            )
          : current;
      continue;
    }
    if (!record?.passed) continue;
    out[labId] = seedFromRecord(record, now);
  }
  return out;
}

/* ──────────────────────────────── store ────────────────────────────────── */

function dispatchLabReviewsChange(): void {
  try {
    if (typeof window === "undefined" || typeof CustomEvent !== "function") {
      return;
    }
    window.dispatchEvent(new CustomEvent(LAB_REVIEWS_CHANGE_EVENT));
  } catch {
    /* events unavailable — the write already happened */
  }
}

/** Stored schedule (validated), without touching the lab records. */
export function readLabReviews(): LabReviewMap {
  return parseLabReviewMap(readRaw(LAB_REVIEWS_STORAGE_KEY));
}

function persistLabReviews(reviews: LabReviewMap): void {
  writeRaw(LAB_REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  dispatchLabReviewsChange();
}

/**
 * Derived re-run schedule for rendering. Derives and persists when the lab
 * records moved the schedule; safe to call from an effect or event handler.
 */
export function getLabReviews(now: Date = new Date()): LabReviewMap {
  const stored = readLabReviews();
  const next = deriveLabReviews(getLabRecords(), stored, now);
  if (JSON.stringify(next) !== JSON.stringify(stored)) {
    persistLabReviews(next);
  }
  return next;
}

/** Record an explicit re-run outcome for one lab and persist it. */
export function gradeLabRun(
  labId: string,
  passed: boolean,
  score: number | null,
  now: Date = new Date(),
): LabReviewState {
  const derived = deriveLabReviews(getLabRecords(), readLabReviews(), now);
  const next = gradeLabReviewState(derived[labId], passed, score, now);
  persistLabReviews({ ...derived, [labId]: next });
  return next;
}

/* ─────────────────────────────── selectors ─────────────────────────────── */

/**
 * Passed labs whose re-run is due today or earlier, most overdue first, each
 * carrying its lab metadata for rendering. Labs without a recorded pass are
 * excluded so the list stays "re-runs", never first runs.
 */
export function labReviewDue(now: Date = new Date()): LabReviewItem[] {
  const today = getDailyDateKey(now);
  const reviews = getLabReviews(now);
  const records = getLabRecords();
  const items: LabReviewItem[] = [];
  for (const [labId, state] of Object.entries(reviews)) {
    if (state.due > today) continue;
    if (records[labId]?.passed !== true) continue;
    const lab = LABS.find((item) => item.id === labId);
    if (!lab) continue;
    items.push({
      lab,
      state,
      due: state.due,
      overdueDays: Math.max(0, dayDiff(state.due, today)),
    });
  }
  items.sort(
    (a, b) =>
      b.overdueDays - a.overdueDays ||
      a.state.ease - b.state.ease ||
      a.due.localeCompare(b.due) ||
      a.lab.id.localeCompare(b.lab.id),
  );
  return items;
}
