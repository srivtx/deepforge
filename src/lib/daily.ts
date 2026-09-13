/**
 * Daily challenge: one deterministic problem per local calendar day,
 * plus a localStorage-backed solving streak.
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and validation semantics are unchanged.
 */

import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:daily:v1";

export const DAILY_CHANGE_EVENT = "deepforge:daily-change";

export interface DailyState {
  lastSolvedDate: string | null;
  streak: number;
  solvedDates: string[];
}

/** Local calendar date as "YYYY-MM-DD". */
export function getDailyDateKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  return { lastSolvedDate: null, streak: 0, solvedDates: [] };
}

function parseState(raw: string | null): DailyState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<DailyState> | null;
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
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

/**
 * Record today's solve. Consecutive calendar days extend the streak;
 * a gap resets it to 1. A date is only appended once.
 */
export function markDailySolved(d = new Date()): DailyState {
  const dateKey = getDailyDateKey(d);
  const state = dailyStore.get();
  if (state.solvedDates.includes(dateKey)) return state;

  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  const previousKey = getDailyDateKey(yesterday);

  const next: DailyState = {
    lastSolvedDate: dateKey,
    streak: state.lastSolvedDate === previousKey ? state.streak + 1 : 1,
    solvedDates: [...state.solvedDates, dateKey],
  };
  dailyStore.set(next);
  return next;
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
