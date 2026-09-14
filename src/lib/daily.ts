/**
 * Daily challenge: one deterministic problem per local calendar day,
 * plus a localStorage-backed solving streak and streak shields.
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and validation semantics are unchanged.
 *
 * Shields are a retention save, not a second streak: one missed calendar day
 * is auto-covered before it can reset the streak. A covered day keeps the
 * streak alive but never extends it — only a real solve does.
 */

import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:daily:v1";

export const DAILY_CHANGE_EVENT = "deepforge:daily-change";

/** Shields in hand at any moment. Earned slots above this are not kept. */
export const MAX_SHIELDS = 2;

/** A shield is earned each time the daily streak reaches a multiple of this. */
export const SHIELD_EARN_INTERVAL = 7;

export interface DailyState {
  lastSolvedDate: string | null;
  streak: number;
  solvedDates: string[];
  /**
   * Shields in hand (0–MAX_SHIELDS). Optional so payloads written before
   * shields existed keep loading; readers should go through
   * `getDailyShields` / `getShieldStatus`.
   */
  shields?: number;
  /**
   * Date keys auto-covered by a spent shield. Optional for the same legacy
   * reason; readers should go through `getDailyShieldUsedDates`.
   */
  shieldUsedDates?: string[];
}

/** Local calendar date as "YYYY-MM-DD". */
export function getDailyDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Shift a local date by whole calendar days. `setDate` works in local wall
 * time, so a DST transition inside the gap never moves the calendar day.
 */
function shiftLocalDays(d: Date, days: number): Date {
  const shifted = new Date(d);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

/** FNV-1a (32-bit) hash of a string. */
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function compareIds(a: ProblemMeta, b: ProblemMeta): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

/** Stable id order so the pick never depends on import order. */
const ORDERED_PROBLEMS: ProblemMeta[] = [...PROBLEM_META].sort(compareIds);

function dailyIndex(d: Date): number {
  return fnv1a(getDailyDateKey(d)) % ORDERED_PROBLEMS.length;
}

/** Deterministic problem id for the given day. */
export function getDailyProblemId(d = new Date()): string {
  return ORDERED_PROBLEMS[dailyIndex(d)].id;
}

/** Deterministic problem for the given day. */
export function getDailyProblem(d = new Date()): ProblemMeta {
  return ORDERED_PROBLEMS[dailyIndex(d)];
}

function emptyState(): DailyState {
  return {
    lastSolvedDate: null,
    streak: 0,
    solvedDates: [],
  };
}

/** Sanitize a stored shield count: finite, floored, clamped to [0, MAX_SHIELDS]. */
function sanitizeShields(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_SHIELDS, Math.floor(value)));
}

/** Date keys only, de-duplicated; anything malformed is dropped. */
function sanitizeDateKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry)) {
      seen.add(entry);
    }
  }
  return [...seen].sort();
}

function parseState(raw: string | null): DailyState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<DailyState> | null;
    if (!parsed || typeof parsed !== "object") return emptyState();
    const state: DailyState = {
      lastSolvedDate:
        typeof parsed.lastSolvedDate === "string"
          ? parsed.lastSolvedDate
          : null,
      streak:
        typeof parsed.streak === "number" && Number.isFinite(parsed.streak)
          ? Math.max(0, Math.floor(parsed.streak))
          : 0,
      solvedDates: Array.isArray(parsed.solvedDates)
        ? parsed.solvedDates.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    };
    // Only surface shield fields that were actually stored so payloads (and
    // tests) written before shields existed keep their exact shape; readers
    // normalize through the shield helpers.
    if (parsed.shields !== undefined) {
      state.shields = sanitizeShields(parsed.shields);
    }
    if (parsed.shieldUsedDates !== undefined) {
      state.shieldUsedDates = sanitizeDateKeys(parsed.shieldUsedDates);
    }
    return state;
  } catch {
    return emptyState();
  }
}

const dailyStore = createStore<DailyState>({
  id: "daily",
  storageKey: STORAGE_KEY,
  event: DAILY_CHANGE_EVENT,
  empty: emptyState,
  parse: parseState,
  serialize: (v) => JSON.stringify(v),
});

export function getDailyState(): DailyState {
  return dailyStore.get();
}

/** Shields currently in hand, normalized for legacy payloads. */
export function getDailyShields(state: DailyState): number {
  return sanitizeShields(state.shields);
}

/** Date keys covered by a spent shield, normalized for legacy payloads. */
export function getDailyShieldUsedDates(state: DailyState): string[] {
  return sanitizeDateKeys(state.shieldUsedDates);
}

/**
 * Auto-cover a single missed day with a shield, before the streak can reset.
 *
 * Applies when the last activity was exactly two calendar days ago (so
 * yesterday was missed), the user holds a shield, and yesterday is not
 * already covered. The streak count is preserved and `lastSolvedDate` moves
 * forward to the covered day so the next real solve extends the run instead
 * of starting over. Idempotent; safe to call on every visit or solve.
 */
export function applyShield(d = new Date()): DailyState {
  const state = dailyStore.get();
  const dateKey = getDailyDateKey(d);
  if (state.solvedDates.includes(dateKey)) return state;

  const yesterdayKey = getDailyDateKey(shiftLocalDays(d, -1));
  if (state.solvedDates.includes(yesterdayKey)) return state;

  const shields = getDailyShields(state);
  if (shields <= 0) return state;

  const dayBeforeKey = getDailyDateKey(shiftLocalDays(d, -2));
  if (state.lastSolvedDate !== dayBeforeKey) return state;

  const used = getDailyShieldUsedDates(state);
  if (used.includes(yesterdayKey)) return state;

  const next: DailyState = {
    ...state,
    lastSolvedDate: yesterdayKey,
    shields: shields - 1,
    shieldUsedDates: [...used, yesterdayKey],
  };
  dailyStore.set(next);
  return next;
}

/**
 * Record today's solve. Consecutive calendar days extend the streak;
 * a gap resets it to 1. A date is only appended once. A shield earned when
 * the streak reaches a multiple of `SHIELD_EARN_INTERVAL` while below the cap.
 */
export function markDailySolved(d = new Date()): DailyState {
  applyShield(d);
  const dateKey = getDailyDateKey(d);
  const state = dailyStore.get();
  if (state.solvedDates.includes(dateKey)) return state;

  const previousKey = getDailyDateKey(shiftLocalDays(d, -1));
  const continuing = state.lastSolvedDate === previousKey;
  const streak = continuing ? state.streak + 1 : 1;

  let shields = getDailyShields(state);
  if (
    continuing &&
    streak % SHIELD_EARN_INTERVAL === 0 &&
    shields < MAX_SHIELDS
  ) {
    shields += 1;
  }

  const next: DailyState = {
    lastSolvedDate: dateKey,
    streak,
    solvedDates: [...state.solvedDates, dateKey],
    shields,
    shieldUsedDates: getDailyShieldUsedDates(state),
  };
  dailyStore.set(next);
  return next;
}

export interface ShieldStatus {
  /** Shields in hand (0–MAX_SHIELDS). */
  available: number;
  max: number;
  /** Shields spent over the life of the state. */
  spent: number;
  /** Most recent covered day, "YYYY-MM-DD". */
  lastUsedDate: string | null;
  solvedToday: boolean;
  /** Yesterday was missed and auto-covered. */
  coveredYesterday: boolean;
  /** A miss today would reset the streak: today unsolved and no shield left. */
  atRisk: boolean;
  /** Today is unsolved but a shield is ready to cover one miss. */
  protectedToday: boolean;
  dailyStreak: number;
}

/**
 * Read-only shield summary for UI. Pair with `applyShield()` on visit so the
 * summary reflects the auto-cover that just happened.
 */
export function getShieldStatus(d = new Date()): ShieldStatus {
  const state = dailyStore.get();
  const available = getDailyShields(state);
  const used = getDailyShieldUsedDates(state);
  const dateKey = getDailyDateKey(d);
  const yesterdayKey = getDailyDateKey(shiftLocalDays(d, -1));
  const solvedToday = state.solvedDates.includes(dateKey);
  return {
    available,
    max: MAX_SHIELDS,
    spent: used.length,
    lastUsedDate: used.length > 0 ? used[used.length - 1] : null,
    solvedToday,
    coveredYesterday: used.includes(yesterdayKey),
    atRisk: !solvedToday && state.streak > 0 && available === 0,
    protectedToday: !solvedToday && available > 0,
    dailyStreak: state.streak,
  };
}

export function isTodaySolved(d = new Date()): boolean {
  return dailyStore.get().solvedDates.includes(getDailyDateKey(d));
}

export const DAILY_SPEC: StoreSpec<DailyState> = {
  id: "daily",
  storageKey: STORAGE_KEY,
  event: DAILY_CHANGE_EVENT,
  empty: emptyState,
  parse: parseState,
  serialize: (v) => JSON.stringify(v),
};
