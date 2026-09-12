/**
 * localStorage-backed progress tracker.
 * No account needed — progress saves to the user's browser.
 */

const STORAGE_KEY = "deepforge:progress:v1";

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

function read(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function write(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    // Notify same-tab listeners.
    window.dispatchEvent(new CustomEvent("deepforge:progress-change"));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function getProgress(): ProgressMap {
  return read();
}

export function getProblemProgress(id: string): ProblemProgress {
  return read()[id] || {};
}

export function markOpened(id: string, savedCode?: string): void {
  const map = read();
  map[id] = {
    ...map[id],
    lastOpened: new Date().toISOString(),
    savedCode: savedCode ?? map[id]?.savedCode,
  };
  write(map);
}

export function saveCode(id: string, code: string): void {
  const map = read();
  map[id] = { ...map[id], savedCode: code, attempted: true };
  write(map);
}

export function markSolved(id: string): void {
  const map = read();
  map[id] = {
    ...map[id],
    attempted: true,
    solved: true,
    solvedAt: new Date().toISOString(),
  };
  write(map);
}

export function resetProblem(id: string): void {
  const map = read();
  delete map[id];
  write(map);
}

export function getStats(problems: { id: string }[]): {
  solved: number;
  attempted: number;
  total: number;
} {
  const map = read();
  let solved = 0;
  let attempted = 0;
  for (const p of problems) {
    const prog = map[p.id];
    if (prog?.solved) solved += 1;
    if (prog?.attempted) attempted += 1;
  }
  return { solved, attempted, total: problems.length };
}
