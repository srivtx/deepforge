/**
 * localStorage-backed contest results.
 *
 * A result records the score of one contest attempt. Scoring reads global
 * problem progress: Easy = 1, Medium = 3, Hard = 5 per solved problem.
 */

import { getProgress } from "@/lib/progress";
import { getProblemById } from "@/data/problems";
import type { Contest } from "@/data/contests";
import type { Difficulty } from "@/types/problem";

const STORAGE_KEY = "deepforge:contests:v1";

export const CONTEST_CHANGE_EVENT = "deepforge:contest-change";

export interface ContestResult {
  contestId: string;
  score: number;
  solved: number;
  total: number;
  durationSeconds: number;
  completedAt: string;
}

const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 3,
  Hard: 5,
};

function read(): ContestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContestResult[]) : [];
  } catch {
    return [];
  }
}

function write(results: ContestResult[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    window.dispatchEvent(new CustomEvent(CONTEST_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getContestResults(): ContestResult[] {
  return read();
}

/**
 * Compute and persist one contest attempt. Returns the saved result.
 */
export function saveContestResult(
  contest: Contest,
  durationSeconds: number,
): ContestResult {
  const progress = getProgress();
  let score = 0;
  let solved = 0;

  for (const id of contest.problemIds) {
    const problem = getProblemById(id);
    if (!problem || !progress[id]?.solved) continue;
    solved += 1;
    score += DIFFICULTY_POINTS[problem.difficulty];
  }

  const result: ContestResult = {
    contestId: contest.id,
    score,
    solved,
    total: contest.problemIds.length,
    durationSeconds: Math.max(0, Math.round(durationSeconds)),
    completedAt: new Date().toISOString(),
  };

  const all = read();
  all.push(result);
  write(all);
  return result;
}

/**
 * Highest score for a contest; ties break toward the faster run.
 */
export function getBestResult(contestId: string): ContestResult | null {
  const results = read().filter((r) => r.contestId === contestId);
  if (results.length === 0) return null;
  return results.reduce((best, r) => {
    if (r.score > best.score) return r;
    if (r.score === best.score && r.durationSeconds < best.durationSeconds) {
      return r;
    }
    return best;
  });
}

export function clearContestResults(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CONTEST_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}
