/**
 * localStorage-backed per-problem Python notebooks.
 *
 * A notebook is an ordered list of cells, each with its own source, stored
 * under `deepforge:notebook:v1` as `Record<problemId, NotebookCell[]>`. The
 * ProblemView keeps several cells in sync with this store so a problem can
 * hold scratch work (imports, helper functions, experiments) alongside the
 * single-code editor without the two clobbering each other.
 *
 * Reads are pure: a fresh problem gets one default cell with the caller's
 * fallback source, but nothing is written until an edit is saved. Every
 * write dispatches `deepforge:notebook-change`. No function here throws —
 * storage being unavailable just means notebooks stay in memory.
 */

export interface NotebookCell {
  id: string;
  source: string;
}

const STORAGE_KEY = "deepforge:notebook:v1";
const MAX_CELLS = 100;
const MAX_SOURCE_LENGTH = 200_000;

export const NOTEBOOK_STORAGE_KEY = STORAGE_KEY;
export const NOTEBOOK_CHANGE_EVENT = "deepforge:notebook-change";

type NotebookStore = Record<string, NotebookCell[]>;

function makeCellId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `cell-${crypto.randomUUID()}`;
  }
  return `cell-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isCell(value: unknown): value is NotebookCell {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" && v.id !== "" && typeof v.source === "string"
  );
}

/** Drop malformed cells, clamp source length, and cap the cell count. */
function sanitizeCells(value: unknown): NotebookCell[] {
  if (!Array.isArray(value)) return [];
  const cells: NotebookCell[] = [];
  for (const cell of value) {
    if (!isCell(cell)) continue;
    cells.push({ id: cell.id, source: cell.source.slice(0, MAX_SOURCE_LENGTH) });
    if (cells.length >= MAX_CELLS) break;
  }
  return cells;
}

function cloneCells(cells: NotebookCell[]): NotebookCell[] {
  return cells.map((cell) => ({ id: cell.id, source: cell.source }));
}

function readStore(): NotebookStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const store: NotebookStore = {};
    for (const [problemId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (problemId === "" || !Array.isArray(value)) continue;
      store[problemId] = sanitizeCells(value);
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: NotebookStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(NOTEBOOK_CHANGE_EVENT));
  } catch {
    /* quota exceeded or storage unavailable — silently ignore */
  }
}

function storedCells(problemId: string): NotebookCell[] {
  const stored = readStore()[problemId];
  return Array.isArray(stored) ? stored : [];
}

/** Replace one problem's cells in the store. Returns the sanitized copy. */
function persist(problemId: string, cells: NotebookCell[]): NotebookCell[] {
  const clean = sanitizeCells(cells);
  if (typeof problemId !== "string" || problemId === "") {
    return cloneCells(clean);
  }
  const store = readStore();
  store[problemId] = clean;
  writeStore(store);
  return cloneCells(clean);
}

/** A fresh cell, for inserting at an explicit position. */
export function createCell(source = ""): NotebookCell {
  return { id: makeCellId(), source: typeof source === "string" ? source : "" };
}

/**
 * The notebook for a problem. Returns the stored cells, or — for a problem
 * that has no entry yet — a single default cell containing `fallbackSource`
 * (typically the starter code or the user's saved editor code).
 */
export function getCells(
  problemId: string,
  fallbackSource = "",
): NotebookCell[] {
  const stored = readStore()[problemId];
  if (Array.isArray(stored)) return cloneCells(stored);
  return [createCell(typeof fallbackSource === "string" ? fallbackSource : "")];
}

/** Persist a problem's full cell list. Returns the sanitized copy. */
export function saveCells(
  problemId: string,
  cells: NotebookCell[],
): NotebookCell[] {
  return persist(problemId, cells);
}

/** Append a cell (empty by default) and persist. Returns the new list. */
export function addCell(problemId: string, source = ""): NotebookCell[] {
  const cells = storedCells(problemId);
  if (cells.length >= MAX_CELLS) return cloneCells(cells);
  const next = [...cells, createCell(source)];
  return persist(problemId, next);
}

/** Rewrite one cell's source. Unknown cell ids are a no-op. */
export function updateCell(
  problemId: string,
  cellId: string,
  source: string,
): NotebookCell[] {
  const cells = storedCells(problemId);
  const index = cells.findIndex((cell) => cell.id === cellId);
  if (index === -1) return cloneCells(cells);
  const next = cells.map((cell, i) =>
    i === index
      ? { id: cell.id, source: typeof source === "string" ? source : cell.source }
      : cell,
  );
  return persist(problemId, next);
}

/** Delete one cell. Unknown cell ids are a no-op. */
export function removeCell(
  problemId: string,
  cellId: string,
): NotebookCell[] {
  const cells = storedCells(problemId);
  const next = cells.filter((cell) => cell.id !== cellId);
  if (next.length === cells.length) return cloneCells(cells);
  return persist(problemId, next);
}

/** Swap a cell with its neighbour. Moves past either edge are no-ops. */
export function moveCell(
  problemId: string,
  cellId: string,
  direction: "up" | "down",
): NotebookCell[] {
  const cells = storedCells(problemId);
  const index = cells.findIndex((cell) => cell.id === cellId);
  if (index === -1) return cloneCells(cells);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= cells.length) return cloneCells(cells);
  const next = cloneCells(cells);
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return persist(problemId, next);
}

/** Replace the whole notebook with a single cell holding `starterSource`. */
export function resetNotebook(
  problemId: string,
  starterSource = "",
): NotebookCell[] {
  return persist(problemId, [
    createCell(typeof starterSource === "string" ? starterSource : ""),
  ]);
}
