/**
 * localStorage-backed Pen & Paper Math progress.
 *
 * One record per problem: whether it was attempted, whether the most recent
 * answer (or any past answer) was correct, and when it was last answered.
 * A problem that has ever been answered correctly stays marked correct.
 */

import { PENPAPER_PROBLEMS } from "@/data/penpaper";

const STORAGE_KEY = "deepforge:penpaper:v1";

export const PENPAPER_CHANGE_EVENT = "deepforge:penpaper-change";

export interface PenPaperRecord {
  attempted: boolean;
  correct: boolean;
  lastAt: string;
}

export type PenPaperProgressMap = Record<string, PenPaperRecord>;

export interface PenPaperStats {
  attempted: number;
  correct: number;
  total: number;
}

function isRecord(value: unknown): value is PenPaperRecord {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.attempted === "boolean" &&
    typeof v.correct === "boolean" &&
    typeof v.lastAt === "string"
  );
}

function read(): PenPaperProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: PenPaperProgressMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (isRecord(value)) out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function write(progress: PenPaperProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(PENPAPER_CHANGE_EVENT));
  } catch {
    /* storage unavailable - silently ignore */
  }
}

export function getPenPaperProgress(): PenPaperProgressMap {
  return read();
}

export function recordPenPaperAnswer(id: string, correct: boolean): void {
  const all = read();
  const prev = all[id];
  all[id] = {
    attempted: true,
    correct: correct || Boolean(prev?.correct),
    lastAt: new Date().toISOString(),
  };
  write(all);
}

export function resetPenPaperProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PENPAPER_CHANGE_EVENT));
  } catch {
    /* storage unavailable - silently ignore */
  }
}

export function getPenPaperStats(): PenPaperStats {
  const all = read();
  let attempted = 0;
  let correct = 0;
  for (const record of Object.values(all)) {
    if (!record.attempted) continue;
    attempted += 1;
    if (record.correct) correct += 1;
  }
  return { attempted, correct, total: PENPAPER_PROBLEMS.length };
}
