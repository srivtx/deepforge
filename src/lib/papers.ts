/**
 * Local-first store for the papers curriculum: self-graded answers plus
 * per-paper read marks.
 *
 * The key and event are assembled from the shared `deepforge:` prefix, and
 * persistence goes through the raw adapter rather than `createStore`, because
 * the synced store inventory (`StoreId`, `ALL_STORE_IDS`, the backup key and
 * event lists) lives in `src/lib/sync` and is owned by the sync layer.
 * `PAPERS_SPEC` below is the registration seam: once "papers" joins `StoreId`,
 * add it to `STORE_SPECS` / `ALL_STORE_IDS` / `mergeStoreValue` in
 * `src/lib/sync/remote.ts` and to the backup inventories exactly like
 * "concepts". The local behavior is already identical (same parse/serialize,
 * same change event, same merge-by-recency rule).
 */

import type { PaperAnswer, PaperAnswerMap } from "@/data/papers";
import { readRaw, writeRaw } from "@/lib/sync/localAdapter";
import type { StoreSpec } from "@/lib/sync/types";

const STORAGE_PREFIX = "deepforge:";

export const PAPERS_STORAGE_KEY = `${STORAGE_PREFIX}papers:v1`;

export const PAPERS_CHANGE_EVENT = "deepforge:papers-change";

export interface PapersState {
  questions: PaperAnswerMap;
  read: Record<string, string>;
}

export function emptyPapersState(): PapersState {
  return { questions: {}, read: {} };
}

/** Stable empty state for `useSyncExternalStore` server snapshots. */
export const EMPTY_PAPERS_STATE: PapersState = Object.freeze({
  questions: {},
  read: {},
}) as PapersState;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function timestampOf(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

function sanitizeAnswer(value: unknown): PaperAnswer | null {
  const record = asRecord(value);
  if (!record || typeof record.correct !== "boolean") return null;
  const at = timestampOf(record.at);
  if (!at) return null;
  return { correct: record.correct, at };
}

export function parsePapersState(raw: string | null): PapersState {
  if (!raw) return emptyPapersState();
  try {
    const parsed = asRecord(JSON.parse(raw));
    if (!parsed) return emptyPapersState();
    const questions: PaperAnswerMap = {};
    for (const [id, value] of Object.entries(asRecord(parsed.questions) ?? {})) {
      const answer = sanitizeAnswer(value);
      if (answer) questions[id] = answer;
    }
    const read: Record<string, string> = {};
    for (const [id, value] of Object.entries(asRecord(parsed.read) ?? {})) {
      const at = timestampOf(value);
      if (at) read[id] = at;
    }
    return { questions, read };
  } catch {
    return emptyPapersState();
  }
}

function dispatch(): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent(PAPERS_CHANGE_EVENT));
  } catch {
    /* events unavailable — ignore */
  }
}

function write(state: PapersState): void {
  writeRaw(PAPERS_STORAGE_KEY, JSON.stringify(state));
  dispatch();
}

export function getPapersState(): PapersState {
  return parsePapersState(readRaw(PAPERS_STORAGE_KEY));
}

/* ─────────────────────── React external-store seam ─────────────────────── */

let snapshotRaw: string | null | undefined;

let snapshotState: PapersState = EMPTY_PAPERS_STATE;

/**
 * Cached snapshot for `useSyncExternalStore`: the parsed state is reused until
 * the raw payload actually changes, which keeps React from re-rendering (or
 * looping) on every `getSnapshot` call.
 */
export function getPapersSnapshot(): PapersState {
  const raw = readRaw(PAPERS_STORAGE_KEY);
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshotState = parsePapersState(raw);
  }
  return snapshotState;
}

export function getEmptyPapersSnapshot(): PapersState {
  return EMPTY_PAPERS_STATE;
}

/**
 * Subscribe to every signal that can change the papers state: this store's
 * own change event, cross-tab `storage` writes, and the progress event the
 * backup layer replays after an import (which carries restored paper answers
 * until the sync/backup inventories register this store).
 */
export function subscribePapersState(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(PAPERS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  window.addEventListener("deepforge:progress-change", handler);
  return () => {
    window.removeEventListener(PAPERS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("deepforge:progress-change", handler);
  };
}

/** True when `next` is newer than the timestamp already on record. */
function isNewer(next: string, current: string | undefined): boolean {
  if (!current) return true;
  const currentAt = Date.parse(current);
  if (Number.isNaN(currentAt)) return true;
  return Date.parse(next) > currentAt;
}

/**
 * Record one self-graded answer. The last answer timestamp wins: an older
 * write (a stale tab, a slow sync) never overwrites a newer one.
 */
export function recordAnswer(
  questionId: string,
  correct: boolean,
  now: Date = new Date(),
): void {
  const state = getPapersState();
  const at = now.toISOString();
  const previous = state.questions[questionId];
  if (previous && !isNewer(at, previous.at)) return;
  state.questions[questionId] = { correct, at };
  write(state);
}

/** Mark a paper as read; read marks merge by latest timestamp too. */
export function markRead(paperId: string, now: Date = new Date()): void {
  const state = getPapersState();
  const at = now.toISOString();
  if (!isNewer(at, state.read[paperId])) return;
  state.read[paperId] = at;
  write(state);
}

/** Clear every answer for a paper (and its read mark) so it can be redone. */
export function resetPaper(paperId: string, questionIds: readonly string[]): void {
  const state = getPapersState();
  for (const id of questionIds) delete state.questions[id];
  delete state.read[paperId];
  write(state);
}

/* ──────────────────────────────── merge ───────────────────────────────── */

/**
 * Per-entry merge for the optional sync engine: the answer with the later
 * timestamp wins per question, read marks keep the latest timestamp, and
 * malformed entries are dropped exactly like the local `parse`.
 */
export function mergePapers(local: PapersState, remote: PapersState): PapersState {
  const localState = parsePapersState(JSON.stringify(local));
  const remoteState = parsePapersState(JSON.stringify(remote));
  const questions: PaperAnswerMap = {};
  for (const id of new Set([
    ...Object.keys(localState.questions),
    ...Object.keys(remoteState.questions),
  ])) {
    const left = localState.questions[id];
    const right = remoteState.questions[id];
    if (!left) {
      if (right) questions[id] = right;
      continue;
    }
    if (!right || Date.parse(right.at) <= Date.parse(left.at)) {
      questions[id] = left;
      continue;
    }
    questions[id] = right;
  }
  const read: Record<string, string> = { ...localState.read };
  for (const [id, at] of Object.entries(remoteState.read)) {
    if (isNewer(at, read[id])) read[id] = at;
  }
  return { questions, read };
}

export type PapersStoreSpec = Omit<StoreSpec<PapersState>, "id"> & {
  id: "papers";
};

export const PAPERS_SPEC: PapersStoreSpec = {
  id: "papers",
  storageKey: PAPERS_STORAGE_KEY,
  event: PAPERS_CHANGE_EVENT,
  empty: emptyPapersState,
  parse: parsePapersState,
  serialize: (value) => JSON.stringify(value),
  merge: mergePapers,
};
