/**
 * Review Plan — pure read-only projections over the spaced-repetition store.
 *
 * `reviewQueue` owns scheduling; this module composes its primitives (local
 * day keys, weak-category weights, category interleaving) into the four views
 * the Review hub renders: a 14-day due forecast, a leech list, a deterministic
 * cram queue, and a small health summary.
 *
 * Every function here is pure and receives its clock as an argument; nothing
 * reads localStorage, `new Date()`, or the network. Corrupt or unknown review
 * entries are skipped rather than allowed to throw.
 */

import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import { problemHref } from "@/lib/problemLinks";
import {
  interleaveByCategory,
  weakCategories,
  type ReviewItem,
  type ReviewMap,
  type ReviewState,
} from "@/lib/reviewQueue";

/** Forecast window (today plus the following 13 local days). */
export const FORECAST_DAYS = 14;
/** A problem becomes a "leech" once it has lapsed this many times. */
export const LEECH_MIN_LAPSES = 3;
/** Default cram queue length, mirroring the daily review cap. */
export const CRAM_SIZE = 10;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar date key ("YYYY-MM-DD") — same semantics as the store. */
export function dayKey(date: Date): string {
  return getDailyDateKey(date);
}

/* ─────────────────────────────── internals ─────────────────────────────── */

/** Strict round-trip check so "2026-02-30" cannot sneak through the regex. */
function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_KEY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Shift a local date key by whole days; DST-safe because setDate is local. */
function addDays(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

/** Local calendar day number, mirroring `dayNumberFromKey` in `daily.ts`. */
function dayNumber(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

function overdueDays(dueKey: string, todayKey: string): number {
  return Math.max(0, dayNumber(todayKey) - dayNumber(dueKey));
}

function weekdayLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

/** A usable entry is an object carrying a real "YYYY-MM-DD" due key. */
function usableState(value: unknown): value is ReviewState {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    isDateKey((value as { due?: unknown }).due)
  );
}

function lapsesOf(state: ReviewState): number {
  return Number.isFinite(state.lapses) ? Math.max(0, state.lapses) : 0;
}

/**
 * Drop unusable entries and normalize lapses before handing the map to
 * `weakCategories`, which assumes every value is a real `ReviewState`.
 */
function cleanReviews(reviews: ReviewMap): ReviewMap {
  const clean: ReviewMap = {};
  for (const [id, state] of Object.entries(reviews)) {
    if (!usableState(state)) continue;
    clean[id] = { ...state, lapses: lapsesOf(state) };
  }
  return clean;
}

/* ────────────────────────────── forecast ───────────────────────────────── */

export interface ForecastDay {
  /** Local day key, "YYYY-MM-DD". */
  key: string;
  /** Short weekday label for display. */
  label: string;
  /** Tracked problems due that day (today also carries everything overdue). */
  count: number;
  /** Of `count`, how many were already due before that day. */
  overdue: number;
}

/**
 * Today plus the next `days - 1` local days, one bucket per day.
 *
 * Only problems already PRESENT in the review map are counted — the forecast
 * never floods with problems the learner has never solved. Everything due on
 * or before today folds into today's bucket, where `count` includes the
 * overdue items and `overdue` says how many of them are past due. Items due
 * beyond the window are ignored.
 */
export function forecastDue(
  reviews: ReviewMap,
  now: Date,
  days: number = FORECAST_DAYS,
): ForecastDay[] {
  const total = Number.isFinite(days) ? Math.max(0, Math.round(days)) : 0;
  if (total === 0) return [];
  const today = dayKey(now);
  const buckets = new Map<string, { count: number; overdue: number }>();
  for (let i = 0; i < total; i += 1) {
    buckets.set(addDays(today, i), { count: 0, overdue: 0 });
  }
  for (const state of Object.values(reviews)) {
    if (!usableState(state)) continue;
    const past = state.due < today;
    const bucket = buckets.get(past ? today : state.due);
    if (!bucket) continue;
    bucket.count += 1;
    if (past) bucket.overdue += 1;
  }
  return [...buckets.entries()].map(([key, bucket]) => ({
    key,
    label: weekdayLabel(key),
    count: bucket.count,
    overdue: bucket.overdue,
  }));
}

/* ─────────────────────────────── leeches ───────────────────────────────── */

export interface LeechItem {
  id: string;
  title: string;
  href: string;
  lapses: number;
  /** The problem's next due day key. */
  dueKey: string;
}

/**
 * Problems that have lapsed at least `minLapses` times, hardest first:
 * lapses descending, then most overdue (earliest due), then id for a stable
 * order. Ids missing from `meta` are skipped instead of guessed at.
 */
export function leeches(
  reviews: ReviewMap,
  meta: ReadonlyMap<string, ProblemMeta>,
  minLapses: number = LEECH_MIN_LAPSES,
): LeechItem[] {
  const threshold = Number.isFinite(minLapses) ? minLapses : LEECH_MIN_LAPSES;
  const items: LeechItem[] = [];
  for (const [id, state] of Object.entries(reviews)) {
    if (!usableState(state)) continue;
    const problem = meta.get(id);
    if (!problem) continue;
    const lapses = lapsesOf(state);
    if (lapses < threshold) continue;
    items.push({
      id,
      title: problem.title,
      href: problemHref(id, "/review"),
      lapses,
      dueKey: state.due,
    });
  }
  items.sort(
    (a, b) =>
      b.lapses - a.lapses ||
      a.dueKey.localeCompare(b.dueKey) ||
      a.id.localeCompare(b.id),
  );
  return items;
}

/* ─────────────────────────────── cram queue ────────────────────────────── */

export interface CramItem {
  id: string;
  title: string;
  href: string;
  dueKey: string;
  category: ProblemMeta["category"];
  /** Whole days past due at `now`; 0 for anything due today or later. */
  overdueDays: number;
  /** Short, honest explanation for why the item is in the drill. */
  why: string;
}

/**
 * A deterministic mixed drill: everything due (most overdue first), then
 * tracked problems from the weakest categories (`weakCategories`), returned
 * interleaved by category where possible (`interleaveByCategory`) and capped
 * at `size`.
 *
 * Ordering is total and input-order independent, so the same map always
 * yields the same queue. Items whose ids are unknown or whose due key is
 * malformed are skipped.
 */
export function cramQueue(
  reviews: ReviewMap,
  meta: ReadonlyMap<string, ProblemMeta>,
  now: Date,
  size: number = CRAM_SIZE,
): CramItem[] {
  const limit = Number.isFinite(size) ? Math.max(0, Math.round(size)) : 0;
  if (limit === 0) return [];
  const today = dayKey(now);
  const clean = cleanReviews(reviews);
  const weights = weakCategories(clean, meta);
  const candidates: ReviewItem[] = [];
  for (const [id, state] of Object.entries(clean)) {
    const problem = meta.get(id);
    if (!problem) continue;
    const due = state.due <= today;
    const weak = (weights.get(problem.category) ?? 0) > 0;
    if (!due && !weak) continue;
    candidates.push({
      id,
      state,
      meta: problem,
      due: state.due,
      bucket: state.reps === 0 ? "learning" : "due",
    });
  }
  candidates.sort((a, b) => {
    const overdueA = overdueDays(a.due, today);
    const overdueB = overdueDays(b.due, today);
    if (overdueA !== overdueB) return overdueB - overdueA;
    const weightA = weights.get(a.meta.category) ?? 0;
    const weightB = weights.get(b.meta.category) ?? 0;
    if (weightA !== weightB) return weightB - weightA;
    const byDue = a.due.localeCompare(b.due);
    if (byDue !== 0) return byDue;
    return a.id.localeCompare(b.id);
  });
  return interleaveByCategory(candidates)
    .slice(0, limit)
    .map((item) => {
      const overdue = overdueDays(item.due, today);
      const weight = weights.get(item.meta.category) ?? 0;
      const why =
        overdue > 0
          ? `Overdue ${overdue} ${overdue === 1 ? "day" : "days"}`
          : weight > 0
            ? `Weak area: ${item.meta.category}`
            : "Due today";
      return {
        id: item.id,
        title: item.meta.title,
        href: problemHref(item.id, "/review"),
        dueKey: item.due,
        category: item.meta.category,
        overdueDays: overdue,
        why,
      };
    });
}

/* ──────────────────────────────── health ───────────────────────────────── */

export interface ReviewHealth {
  /** Tracked problems due today or earlier. */
  due: number;
  /** Of `due`, problems whose due day has already passed. */
  overdue: number;
  /** Problems due in the seven days after today (tomorrow through +7). */
  dueNext7: number;
  /** Problems present in the review map with a usable schedule entry. */
  totalTracked: number;
  /**
   * Share (0–100) of graded problems whose most recent review passed
   * (`lastGrade >= 3`). This is the only outcome signal the store actually
   * keeps, so it is labeled as such in the UI. Returns null when nothing has
   * been graded yet — never fabricated.
   */
  retention: number | null;
}

/**
 * Honest one-line health summary for the Review hub. Everything is counted
 * from entries the store actually contains; corrupt entries are ignored.
 */
export function health(reviews: ReviewMap, now: Date): ReviewHealth {
  const today = dayKey(now);
  const weekAhead = addDays(today, 7);
  let due = 0;
  let overdue = 0;
  let dueNext7 = 0;
  let totalTracked = 0;
  let graded = 0;
  let passed = 0;
  for (const state of Object.values(reviews)) {
    if (!usableState(state)) continue;
    totalTracked += 1;
    if (state.due <= today) {
      due += 1;
      if (state.due < today) overdue += 1;
    } else if (state.due <= weekAhead) {
      dueNext7 += 1;
    }
    const grade = state.lastGrade;
    if (grade === 0 || grade === 3 || grade === 4 || grade === 5) {
      graded += 1;
      if (grade >= 3) passed += 1;
    }
  }
  return {
    due,
    overdue,
    dueNext7,
    totalTracked,
    retention: graded > 0 ? Math.round((passed / graded) * 100) : null,
  };
}
