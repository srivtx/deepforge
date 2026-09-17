/**
 * Deterministic daily-problem pick.
 *
 * Split out of `src/lib/daily.ts` on purpose: the home hero only needs
 * streak state (`getDailyState`, `isTodaySolved`), and importing the pick
 * from `daily.ts` dragged the 5,550-entry PROBLEM_META index (437 KB raw)
 * into the landing page's client bundle. Route-level surfaces
 * (`DailyChallenge`, `/today`) import from here instead.
 */
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";

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
