/**
 * localStorage-backed contest results.
 *
 * A result records the score of one contest attempt. Scoring reads global
 * problem progress: Easy = 1, Medium = 3, Hard = 5 per solved problem.
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and parse semantics are unchanged.
 */

import { getProgress } from "@/lib/progress";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";
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

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

const contestStore = createStore<ContestResult[]>({
  id: "contests",
  storageKey: STORAGE_KEY,
  event: CONTEST_CHANGE_EVENT,
  empty: () => [],
  parse: (raw) => {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ContestResult[]) : [];
    } catch {
      return [];
    }
  },
  serialize: (v) => JSON.stringify(v),
});

export function getContestResults(): ContestResult[] {
  return contestStore.get();
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
    const problem = META_BY_ID.get(id);
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

  const all = contestStore.get();
  all.push(result);
  contestStore.set(all);
  return result;
}

/**
 * Highest score for a contest; ties break toward the faster run.
 */
export function getBestResult(contestId: string): ContestResult | null {
  const results = contestStore.get().filter((r) => r.contestId === contestId);
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
  contestStore.clear();
}

export const CONTEST_SPEC: StoreSpec<ContestResult[]> = {
  id: "contests",
  storageKey: STORAGE_KEY,
  event: CONTEST_CHANGE_EVENT,
  empty: () => [],
  parse: (raw) => {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ContestResult[]) : [];
    } catch {
      return [];
    }
  },
  serialize: (v) => JSON.stringify(v),
};
