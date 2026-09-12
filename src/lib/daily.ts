/**
 * Daily challenge: one deterministic problem per local calendar day,
 * plus a localStorage-backed solving streak.
 */

import { PROBLEMS } from "@/data/problems";
import type { Problem } from "@/types/problem";

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

function compareIds(a: Problem, b: Problem): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

/** Stable id order so the pick never depends on import order. */
const ORDERED_PROBLEMS: Problem[] = [...PROBLEMS].sort(compareIds);

function dailyIndex(d: Date): number {
  return fnv1a(getDailyDateKey(d)) % ORDERED_PROBLEMS.length;
}

/** Deterministic problem id for the given day. */
export function getDailyProblemId(d = new Date()): string {
  return ORDERED_PROBLEMS[dailyIndex(d)].id;
}

/** Deterministic problem for the given day. */
export function getDailyProblem(d = new Date()): Problem {
  return ORDERED_PROBLEMS[dailyIndex(d)];
}

function emptyState(): DailyState {
  return { lastSolvedDate: null, streak: 0, solvedDates: [] };
}

function read(): DailyState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
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

function write(state: DailyState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(DAILY_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getDailyState(): DailyState {
  return read();
}

/**
 * Record today's solve. Consecutive calendar days extend the streak;
 * a gap resets it to 1. A date is only appended once.
 */
export function markDailySolved(d = new Date()): DailyState {
  const dateKey = getDailyDateKey(d);
  const state = read();
  if (state.solvedDates.includes(dateKey)) return state;

  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  const previousKey = getDailyDateKey(yesterday);

  const next: DailyState = {
    lastSolvedDate: dateKey,
    streak: state.lastSolvedDate === previousKey ? state.streak + 1 : 1,
    solvedDates: [...state.solvedDates, dateKey],
  };
  write(next);
  return next;
}

export function isTodaySolved(d = new Date()): boolean {
  return read().solvedDates.includes(getDailyDateKey(d));
}
