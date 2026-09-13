/**
 * localStorage-backed progress tracker.
 * No account needed — progress saves to the user's browser.
 *
 * Reads/writes route through the local-first sync seam (`createStore`);
 * the key, event, and synchronous behavior are unchanged.
 */

import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_KEY = "deepforge:progress:v1";
const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

export interface ProblemProgress {
  /** ISO timestamp of last interaction. */
  lastOpened?: string;
  /** Has the user ever run the code? */
  attempted?: boolean;
  /** Has the user ever passed all tests? */
  solved?: boolean;
  /** ISO timestamp of first solve. */
  solvedAt?: string;
  /** Saved user code (so refreshes don't lose work). */
  savedCode?: string;
}

export type ProgressMap = Record<string, ProblemProgress>;

const progressStore = createStore<ProgressMap>({
  id: "progress",
  storageKey: STORAGE_KEY,
  event: PROGRESS_CHANGE_EVENT,
  empty: () => ({}),
  parse: (raw) => {
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed as ProgressMap;
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
});

export function getProgress(): ProgressMap {
  return progressStore.get();
}

export function getProblemProgress(id: string): ProblemProgress {
  return progressStore.get()[id] || {};
}

export function markOpened(id: string, savedCode?: string): void {
  progressStore.update((map) => ({
    ...map,
    [id]: {
      ...map[id],
      lastOpened: new Date().toISOString(),
      savedCode: savedCode ?? map[id]?.savedCode,
    },
  }));
}

export function saveCode(id: string, code: string): void {
  progressStore.update((map) => ({
    ...map,
    [id]: { ...map[id], savedCode: code, attempted: true },
  }));
}

export function markSolved(id: string): void {
  progressStore.update((map) => ({
    ...map,
    [id]: {
      ...map[id],
      attempted: true,
      solved: true,
      solvedAt: new Date().toISOString(),
    },
  }));
}

export function resetProblem(id: string): void {
  progressStore.update((map) => {
    const next = { ...map };
    delete next[id];
    return next;
  });
}

export function getStats(problems: { id: string }[]): {
  solved: number;
  attempted: number;
  total: number;
} {
  const map = progressStore.get();
  let solved = 0;
  let attempted = 0;
  for (const p of problems) {
    const prog = map[p.id];
    if (prog?.solved) solved += 1;
    if (prog?.attempted) attempted += 1;
  }
  return { solved, attempted, total: problems.length };
}

export const PROGRESS_SPEC: StoreSpec<ProgressMap> = {
  id: "progress",
  storageKey: STORAGE_KEY,
  event: PROGRESS_CHANGE_EVENT,
  empty: () => ({}),
  parse: (raw) => {
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed as ProgressMap;
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
};
