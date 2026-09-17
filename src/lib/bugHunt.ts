/**
 * Bug Hunt — the tracked record for Spot-the-Bug rounds (F8).
 *
 * Every completed round in `ProblemView` lands here: which problem, which
 * mutation family, whether the line was exact, whether the reasoning covered
 * the expected ideas, and the resulting "clean" flag. The store follows the
 * repo's local-first seam (`createStore`), so it stays fully local until the
 * optional sync engine picks it up through `BUG_HUNT_SPEC`.
 *
 * Shape: a map keyed by problem id holding that problem's latest round
 * (`{ problemId, category, lineOk, reasonOk, clean, hintsUsed?, at }`), capped
 * at the 300 most recent rounds. `getBugRounds()` returns the history newest
 * first and `getBugStats()` folds it into the counters the result card shows.
 *
 * Determinism: `recordBugRound` takes its clock as an argument and accepts an
 * explicit `at`; parsing and sanitizing never throw (malformed entries are
 * dropped); `mergeBugHunt` resolves conflicts per problem id by the later
 * `at` with ties keeping local, keeping the union of both keys.
 */

import { BUG_CATEGORIES, type BugCategory } from "@/lib/spotBug";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

export const BUG_HUNT_STORAGE_KEY = "deepforge:bug-hunt:v1";
export const BUG_HUNT_CHANGE_EVENT = "deepforge:bug-hunt-change";

/** Hard cap on retained rounds; the oldest round falls off first. */
export const BUG_HUNT_LIMIT = 300;

/** Share of expected reason groups a "why" must cover to count as ok. */
export const REASON_OK_THRESHOLD = 0.5;

export interface BugRound {
  problemId: string;
  category: BugCategory;
  /** The learner picked the exact mutated line. */
  lineOk: boolean;
  /** The reasoning covered at least `REASON_OK_THRESHOLD` of the groups. */
  reasonOk: boolean;
  /** Exact line plus sufficient reasoning — a clean hunt. */
  clean: boolean;
  hintsUsed?: number;
  /** ISO timestamp of when the round was locked in. */
  at: string;
}

export type BugHuntMap = Record<string, BugRound>;

export interface BugRoundInput {
  problemId: string;
  category: BugCategory;
  lineOk: boolean;
  reasonOk: boolean;
  /** Defaults to `lineOk && reasonOk`. */
  clean?: boolean;
  hintsUsed?: number;
  /** ISO timestamp; defaults to the injected clock. */
  at?: string;
}

export interface BugHuntCategoryStats {
  total: number;
  clean: number;
}

export interface BugHuntStats {
  total: number;
  clean: number;
  /** clean / total, 0 when there are no rounds. */
  cleanRate: number;
  /** Counts per mutation family, only for categories that appeared. */
  byCategory: Partial<Record<BugCategory, BugHuntCategoryStats>>;
  /** Longest run of consecutive clean rounds in chronological order. */
  bestCleanStreak: number;
  /** Most recent round, when there is one. */
  lastRound?: BugRound;
}

const CATEGORY_SET = new Set<string>(BUG_CATEGORIES);

/* ─────────────────────────────── helpers ───────────────────────────────── */

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function roundTimestamp(round: BugRound): number {
  const parsed = Date.parse(round.at);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareNewestFirst(a: BugRound, b: BugRound): number {
  const delta = roundTimestamp(b) - roundTimestamp(a);
  if (delta !== 0) return delta;
  return a.problemId.localeCompare(b.problemId);
}

function compareOldestFirst(a: BugRound, b: BugRound): number {
  const delta = roundTimestamp(a) - roundTimestamp(b);
  if (delta !== 0) return delta;
  return a.problemId.localeCompare(b.problemId);
}

function sanitizeHints(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const hints = Math.max(0, Math.round(value));
  return hints > 0 ? hints : undefined;
}

/**
 * Validate a persisted/remote round. Returns null for anything that is not a
 * usable record (wrong or missing id/category/`at`), so a bad payload can
 * never poison the history. `fallbackId` (the map key) fills in a missing id.
 */
export function sanitizeBugRound(
  value: unknown,
  fallbackId?: string,
): BugRound | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const rawId = typeof record.problemId === "string" ? record.problemId.trim() : "";
  const problemId =
    rawId || (typeof fallbackId === "string" ? fallbackId.trim() : "");
  if (!problemId) return null;
  if (typeof record.category !== "string" || !CATEGORY_SET.has(record.category)) {
    return null;
  }
  if (!isIsoTimestamp(record.at)) return null;
  const lineOk = record.lineOk === true;
  const reasonOk = record.reasonOk === true;
  const clean =
    typeof record.clean === "boolean" ? record.clean : lineOk && reasonOk;
  const round: BugRound = {
    problemId,
    category: record.category as BugCategory,
    lineOk,
    reasonOk,
    clean,
    at: record.at,
  };
  const hintsUsed = sanitizeHints(record.hintsUsed);
  if (hintsUsed !== undefined) round.hintsUsed = hintsUsed;
  return round;
}

/** Keep the newest `limit` rounds, keyed by problem id, newest first. */
export function capBugHunt(
  rounds: readonly BugRound[],
  limit: number = BUG_HUNT_LIMIT,
): BugHuntMap {
  const out: BugHuntMap = {};
  for (const round of [...rounds].sort(compareNewestFirst).slice(
    0,
    Math.max(0, limit),
  )) {
    if (!(round.problemId in out)) out[round.problemId] = round;
  }
  return out;
}

export function parseBugHuntMap(raw: string | null): BugHuntMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const rounds: BugRound[] = [];
    for (const [id, value] of Object.entries(parsed)) {
      const round = sanitizeBugRound(value, id);
      if (round) rounds.push(round);
    }
    return capBugHunt(rounds);
  } catch {
    return {};
  }
}

/* ──────────────────────────────── store ────────────────────────────────── */

const bugHuntStore = createStore<BugHuntMap>({
  id: "bugHunt",
  storageKey: BUG_HUNT_STORAGE_KEY,
  event: BUG_HUNT_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseBugHuntMap,
  serialize: (v) => JSON.stringify(v),
});

/** Stored history, newest first. Pure read — never writes during render. */
export function getBugRounds(): BugRound[] {
  return Object.values(bugHuntStore.get()).sort(compareNewestFirst);
}

/**
 * Persist one completed round (replacing the problem's previous round) and
 * return it, or null when the input cannot form a valid record. Safe to call
 * from an event handler; the cap keeps the store bounded.
 */
export function recordBugRound(
  input: BugRoundInput,
  now: Date = new Date(),
): BugRound | null {
  const round = sanitizeBugRound({
    problemId: input.problemId,
    category: input.category,
    lineOk: input.lineOk,
    reasonOk: input.reasonOk,
    clean: input.clean,
    hintsUsed: input.hintsUsed,
    at: input.at ?? now.toISOString(),
  });
  if (!round) return null;
  bugHuntStore.set(capBugHunt([...Object.values(bugHuntStore.get()), round]));
  return round;
}

/** Fold a history (defaults to the stored one) into the tracked counters. */
export function getBugStats(
  rounds: readonly BugRound[] = getBugRounds(),
): BugHuntStats {
  const byCategory: Partial<Record<BugCategory, BugHuntCategoryStats>> = {};
  let clean = 0;
  for (const round of rounds) {
    const entry = byCategory[round.category] ?? { total: 0, clean: 0 };
    entry.total += 1;
    if (round.clean) {
      entry.clean += 1;
      clean += 1;
    }
    byCategory[round.category] = entry;
  }
  const total = rounds.length;
  let bestCleanStreak = 0;
  let run = 0;
  for (const round of [...rounds].sort(compareOldestFirst)) {
    run = round.clean ? run + 1 : 0;
    if (run > bestCleanStreak) bestCleanStreak = run;
  }
  const lastRound = [...rounds].sort(compareNewestFirst)[0];
  return {
    total,
    clean,
    cleanRate: total === 0 ? 0 : Number((clean / total).toFixed(3)),
    byCategory,
    bestCleanStreak,
    ...(lastRound ? { lastRound } : {}),
  };
}

/* ──────────────────────────────── merge ────────────────────────────────── */

function asRecord(value: unknown): BugHuntMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as BugHuntMap;
}

/**
 * Per problem id the entry with the later `at` wins; ties keep local; keys
 * are unioned; malformed entries are dropped. The result is capped, so a
 * merge can never grow the history past `BUG_HUNT_LIMIT`.
 */
export function mergeBugHunt(local: BugHuntMap, remote: BugHuntMap): BugHuntMap {
  const localMap = asRecord(local);
  const remoteMap = asRecord(remote);
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  const merged: BugRound[] = [];
  for (const id of ids) {
    const left = sanitizeBugRound(localMap[id], id);
    const right = sanitizeBugRound(remoteMap[id], id);
    if (left && right) {
      merged.push(roundTimestamp(right) > roundTimestamp(left) ? right : left);
    } else if (left) {
      merged.push(left);
    } else if (right) {
      merged.push(right);
    }
  }
  return capBugHunt(merged);
}

export const BUG_HUNT_SPEC: StoreSpec<BugHuntMap> = {
  id: "bugHunt",
  storageKey: BUG_HUNT_STORAGE_KEY,
  event: BUG_HUNT_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseBugHuntMap,
  serialize: (v) => JSON.stringify(v),
};
