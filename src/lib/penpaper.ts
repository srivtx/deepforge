/**
 * localStorage-backed Pen & Paper Math progress.
 *
 * One record per problem: whether it was attempted, whether the most recent
 * answer (or any past answer) was correct, and when it was last answered.
 * A problem that has ever been answered correctly stays marked correct.
 *
 * Persistence routes through the local-first sync seam (`createStore`);
 * key, event, and validation semantics are unchanged.
 */

import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

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

function parseProgress(raw: string | null): PenPaperProgressMap {
  if (!raw) return {};
  try {
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

const penpaperStore = createStore<PenPaperProgressMap>({
  id: "penpaper",
  storageKey: STORAGE_KEY,
  event: PENPAPER_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseProgress,
  serialize: (v) => JSON.stringify(v),
});

export function getPenPaperProgress(): PenPaperProgressMap {
  return penpaperStore.get();
}

export function recordPenPaperAnswer(id: string, correct: boolean): void {
  penpaperStore.update((all) => ({
    ...all,
    [id]: {
      attempted: true,
      correct: correct || Boolean(all[id]?.correct),
      lastAt: new Date().toISOString(),
    },
  }));
}

export function resetPenPaperProgress(): void {
  penpaperStore.clear();
}

export function getPenPaperStats(): PenPaperStats {
  const all = penpaperStore.get();
  let attempted = 0;
  let correct = 0;
  for (const record of Object.values(all)) {
    if (!record.attempted) continue;
    attempted += 1;
    if (record.correct) correct += 1;
  }
  return { attempted, correct, total: PENPAPER_PROBLEMS.length };
}

export const PENPAPER_SPEC: StoreSpec<PenPaperProgressMap> = {
  id: "penpaper",
  storageKey: STORAGE_KEY,
  event: PENPAPER_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseProgress,
  serialize: (v) => JSON.stringify(v),
};
