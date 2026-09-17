/**
 * Daily challenge: one deterministic problem per local calendar day, plus
 * streak shields and the daily-challenge chain.
 *
 * The user-visible "streak" is the solve streak: any calendar day with at
 * least one solved problem counts (the same rule as `getCurrentStreak` in
 * `src/lib/leaderboard.ts`, the source of truth). The daily-challenge chain
 * (`state.streak`) is a separate, smaller mechanic and must be labeled
 * "Daily challenge chain" wherever it is shown — never the bare word
 * "streak".
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and validation semantics are unchanged.
 *
 * Shields protect the solve streak: one fully missed calendar day is
 * auto-covered before it can lapse. A covered day keeps the run alive but
 * never extends it — only a real solve does.
 */

import { getProgress, type ProgressMap } from "@/lib/progress";
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Local calendar day number. Mirrors `localDayNumber` in
 * `src/lib/leaderboard.ts`, the source of truth for solve-streak math — keep
 * the two in lockstep.
 */
function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

/** Day number for a "YYYY-MM-DD" key, or null when malformed. */
function dayNumberFromKey(key: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return Math.floor(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / DAY_MS,
  );
}

/** Real solve days: progress solves plus daily-challenge solves. */
function solveDayNumbers(progress: ProgressMap, state: DailyState): Set<number> {
  const days = new Set<number>();
  for (const entry of Object.values(progress)) {
    if (!entry?.solved || !entry.solvedAt) continue;
    const at = new Date(entry.solvedAt);
    if (Number.isNaN(at.getTime())) continue;
    days.add(localDayNumber(at));
  }
  for (const key of state.solvedDates) {
    const day = dayNumberFromKey(key);
    if (day !== null) days.add(day);
  }
  return days;
}

/** Day numbers covered by a spent shield. */
function coveredDayNumbers(state: DailyState): Set<number> {
  const days = new Set<number>();
  for (const key of getDailyShieldUsedDates(state)) {
    const day = dayNumberFromKey(key);
    if (day !== null) days.add(day);
  }
  return days;
}

/**
 * Days that keep the run alive: real solve days, shield-covered days, and
 * the legacy `lastSolvedDate` marker. Covered days bridge a single missed
 * day; they are never counted as solves.
 */
function activeDayNumbers(
  progress: ProgressMap,
  state: DailyState,
  solves: Set<number>,
): Set<number> {
  const active = new Set(solves);
  for (const day of coveredDayNumbers(state)) active.add(day);
  if (state.lastSolvedDate) {
    const day = dayNumberFromKey(state.lastSolvedDate);
    if (day !== null) active.add(day);
  }
  return active;
}

/**
 * Current solve streak — the user-visible streak: any calendar day with at
 * least one solved problem counts, including days solved only through the
 * daily challenge. The day-number math mirrors `localDayNumber` /
 * `getCurrentStreak` in `src/lib/leaderboard.ts` (the source of truth); a
 * shield-covered day bridges the run without adding to the count, so shields
 * never extend a streak — they only prevent the lapse.
 */
export function getSolveStreak(
  progress: ProgressMap = getProgress(),
  d = new Date(),
): number {
  const state = dailyStore.get();
  const solves = solveDayNumbers(progress, state);
  if (solves.size === 0) return 0;
  const active = [...activeDayNumbers(progress, state, solves)].sort(
    (a, b) => b - a,
  );
  const today = localDayNumber(d);
  if (active[0] !== today && active[0] !== today - 1) return 0;
  let streak = 0;
  for (let i = 0; i < active.length; i += 1) {
    if (i > 0 && active[i] !== active[i - 1] - 1) break;
    if (solves.has(active[i])) streak += 1;
  }
  return streak;
}

/**
 * Auto-cover a single missed day with a shield, before the solve streak can
 * reset.
 *
 * Applies when the run was alive exactly two calendar days ago (a solve on
 * any problem or a covered day), yesterday had no solve at all, the user
 * holds a shield, and yesterday is not already covered. Any solve yesterday
 * — daily challenge or not — consumes nothing. The streak count is
 * preserved and `lastSolvedDate` moves forward to the covered day so the
 * next real solve extends the run instead of starting over. Idempotent; safe
 * to call on every visit or solve.
 */
export function applyShield(d = new Date()): DailyState {
  const state = dailyStore.get();
  const dateKey = getDailyDateKey(d);
  if (state.solvedDates.includes(dateKey)) return state;

  const progress = getProgress();
  const solves = solveDayNumbers(progress, state);
  const yesterdayKey = getDailyDateKey(shiftLocalDays(d, -1));
  const yesterday = dayNumberFromKey(yesterdayKey);
  if (yesterday !== null && solves.has(yesterday)) return state;

  const shields = getDailyShields(state);
  if (shields <= 0) return state;

  const dayBeforeKey = getDailyDateKey(shiftLocalDays(d, -2));
  const dayBefore = dayNumberFromKey(dayBeforeKey);
  const active = activeDayNumbers(progress, state, solves);
  if (dayBefore === null || !active.has(dayBefore)) return state;

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
  /** A solve happened today, on any problem or the daily challenge. */
  solvedToday: boolean;
  /** Yesterday was missed and auto-covered. */
  coveredYesterday: boolean;
  /** A miss today would lapse the solve streak: today unsolved and no shield left. */
  atRisk: boolean;
  /** Today is unsolved but a shield is ready to cover one miss. */
  protectedToday: boolean;
  /**
   * Daily-challenge chain length. This is not the user-visible streak; label
   * it "Daily challenge chain" wherever shown.
   */
  dailyStreak: number;
  /** The user-visible solve streak, same source as `getSolveStreak`. */
  solveStreak: number;
}

/**
 * Read-only shield summary for UI, evaluated against the solve streak. Pair
 * with `applyShield()` on visit so the summary reflects the auto-cover that
 * just happened.
 */
export function getShieldStatus(d = new Date()): ShieldStatus {
  const state = dailyStore.get();
  const progress = getProgress();
  const available = getDailyShields(state);
  const used = getDailyShieldUsedDates(state);
  const yesterdayKey = getDailyDateKey(shiftLocalDays(d, -1));
  const solves = solveDayNumbers(progress, state);
  const solvedToday = solves.has(localDayNumber(d));
  const solveStreak = getSolveStreak(progress, d);
  return {
    available,
    max: MAX_SHIELDS,
    spent: used.length,
    lastUsedDate: used.length > 0 ? used[used.length - 1] : null,
    solvedToday,
    coveredYesterday: used.includes(yesterdayKey),
    atRisk: !solvedToday && available === 0 && solveStreak > 0,
    protectedToday: !solvedToday && available > 0,
    dailyStreak: state.streak,
    solveStreak,
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
