import { CONCEPTS, type Concept } from "@/data/concepts";
import { getDailyDateKey } from "@/lib/daily";
import { getPenPaperProgress } from "@/lib/penpaper";
import { createStore } from "@/lib/sync/store";
import type { StoreSpec } from "@/lib/sync/types";

export const CONCEPTS_STORAGE_KEY = "deepforge:concepts:v1";

export const CONCEPTS_CHANGE_EVENT = "deepforge:concepts-change";

export const MASTERED_MASTERY = 80;

export const UNLOCK_MASTERY = 40;

export const UNLOCK_REPS = 2;

export interface ConceptState {
  ease: number;
  interval: number;
  due: string;
  reps: number;
  lapses: number;
}

export type ConceptStateMap = Record<string, ConceptState>;

export type ConceptQuality = 0 | 3 | 4 | 5;

export interface ConceptStats {
  due: number;
  mastered: number;
  unlocked: number;
  total: number;
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

function defaultState(now?: Date): ConceptState {
  return {
    ease: 2.5,
    interval: 0,
    due: getDailyDateKey(now),
    reps: 0,
    lapses: 0,
  };
}

function sanitizeState(value: unknown): ConceptState | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const ease =
    typeof v.ease === "number" && Number.isFinite(v.ease) ? v.ease : 2.5;
  const interval =
    typeof v.interval === "number" && Number.isFinite(v.interval)
      ? Math.max(0, Math.round(v.interval))
      : 0;
  const due =
    typeof v.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.due)
      ? v.due
      : getDailyDateKey();
  const reps =
    typeof v.reps === "number" && Number.isFinite(v.reps)
      ? Math.max(0, Math.round(v.reps))
      : 0;
  const lapses =
    typeof v.lapses === "number" && Number.isFinite(v.lapses)
      ? Math.max(0, Math.round(v.lapses))
      : 0;
  return { ease, interval, due, reps, lapses };
}

function parseConceptStates(raw: string | null): ConceptStateMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const out: ConceptStateMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      const state = sanitizeState(value);
      if (state) out[id] = state;
    }
    return out;
  } catch {
    return {};
  }
}

const conceptStore = createStore<ConceptStateMap>({
  id: "concepts",
  storageKey: CONCEPTS_STORAGE_KEY,
  event: CONCEPTS_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseConceptStates,
  serialize: (v) => JSON.stringify(v),
});

function seedFromPenPaper(
  states: ConceptStateMap,
  now?: Date,
): ConceptStateMap {
  if (typeof window === "undefined") return states;
  const progress = getPenPaperProgress();
  const today = getDailyDateKey(now);
  let changed = false;
  const next: ConceptStateMap = { ...states };
  for (const concept of CONCEPTS) {
    if (next[concept.id]) continue;
    const ids = new Set<string>([
      concept.workedExampleId,
      ...concept.practiceIds,
    ]);
    const solved = Array.from(ids).some(
      (id) => progress[id]?.correct === true,
    );
    if (!solved) continue;
    next[concept.id] = {
      ease: 2.5,
      interval: 1,
      due: today,
      reps: 1,
      lapses: 0,
    };
    changed = true;
  }
  if (changed) conceptStore.set(next);
  return next;
}

function read(now?: Date): ConceptStateMap {
  return seedFromPenPaper(conceptStore.get(), now);
}

function clampEase(ease: number): number {
  return Math.round(Math.min(2.8, Math.max(1.3, ease)) * 1000) / 1000;
}

export function getConceptStates(now?: Date): ConceptStateMap {
  return read(now);
}

export function getConceptState(conceptId: string, now?: Date): ConceptState {
  return read(now)[conceptId] ?? defaultState(now);
}

export function masteryOf(state: ConceptState | undefined): number {
  if (!state) return 0;
  return Math.min(100, (state.interval / 21) * 100);
}

export function isConceptUnlocked(
  concept: Concept,
  states: ConceptStateMap,
): boolean {
  return concept.prerequisites.every((id) => {
    const state = states[id];
    if (!state) return false;
    return state.reps >= UNLOCK_REPS || masteryOf(state) >= UNLOCK_MASTERY;
  });
}

export function isUnlocked(conceptId: string, now?: Date): boolean {
  const concept = CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) return false;
  return isConceptUnlocked(concept, read(now));
}

export function getMastery(conceptId: string, now?: Date): number {
  return masteryOf(read(now)[conceptId]);
}

export function gradeConcept(
  conceptId: string,
  quality: ConceptQuality,
  now: Date = new Date(),
): ConceptState {
  const states = read(now);
  const prev = states[conceptId] ?? defaultState(now);
  const today = getDailyDateKey(now);
  let next: ConceptState;
  if (quality < 3) {
    next = {
      ease: clampEase(prev.ease - 0.2),
      interval: 1,
      due: addDays(today, 1),
      reps: 0,
      lapses: prev.lapses + 1,
    };
  } else {
    const interval =
      prev.reps === 0
        ? 1
        : prev.reps === 1
          ? 6
          : Math.round(prev.interval * prev.ease);
    const delta = 0.1 - (5 - quality) * (0.08 + 0.02 * (5 - quality));
    next = {
      ease: clampEase(prev.ease + delta),
      interval,
      due: addDays(today, interval),
      reps: prev.reps + 1,
      lapses: prev.lapses,
    };
  }
  states[conceptId] = next;
  conceptStore.set(states);
  return next;
}

export function getDueConcepts(now: Date = new Date()): Concept[] {
  const states = read(now);
  const today = getDailyDateKey(now);
  return CONCEPTS.filter((concept) => isConceptUnlocked(concept, states))
    .map((concept) => ({
      concept,
      state: states[concept.id] ?? defaultState(now),
    }))
    .filter(({ state }) => state.due <= today)
    .sort(
      (a, b) =>
        a.state.ease - b.state.ease ||
        a.state.due.localeCompare(b.state.due) ||
        a.concept.id.localeCompare(b.concept.id),
    )
    .slice(0, 10)
    .map(({ concept }) => concept);
}

export function getConceptStats(now: Date = new Date()): ConceptStats {
  const states = read(now);
  const today = getDailyDateKey(now);
  let due = 0;
  let mastered = 0;
  let unlocked = 0;
  for (const concept of CONCEPTS) {
    const state = states[concept.id] ?? defaultState(now);
    if (masteryOf(state) >= MASTERED_MASTERY) mastered += 1;
    if (isConceptUnlocked(concept, states)) {
      unlocked += 1;
      if (state.due <= today) due += 1;
    }
  }
  return { due, mastered, unlocked, total: CONCEPTS.length };
}

/* ──────────────────────────────── merge ───────────────────────────────── */

function asRecord<T extends object>(value: unknown): T | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as T;
}

function conceptRecencyAt(state: ConceptState): number {
  const at = Date.parse(`${state.due}T00:00:00Z`);
  return Number.isNaN(at) ? 0 : at;
}

/**
 * Per-concept merge for the optional sync engine: the entry with the later
 * `due` date (the schedule advanced most recently) wins; ties keep local.
 * Malformed payloads are dropped, mirroring the local `parse`.
 */
export function mergeConcepts(
  local: ConceptStateMap,
  remote: ConceptStateMap,
): ConceptStateMap {
  const localMap = asRecord<ConceptStateMap>(local) ?? {};
  const remoteMap = asRecord<ConceptStateMap>(remote) ?? {};
  const merged: ConceptStateMap = {};
  const ids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);
  for (const id of ids) {
    const left = sanitizeState(localMap[id]);
    const right = sanitizeState(remoteMap[id]);
    if (!left) {
      if (right) merged[id] = right;
      continue;
    }
    if (!right) {
      merged[id] = left;
      continue;
    }
    merged[id] = conceptRecencyAt(right) > conceptRecencyAt(left) ? right : left;
  }
  return merged;
}

export const CONCEPTS_SPEC: StoreSpec<ConceptStateMap> = {
  id: "concepts",
  storageKey: CONCEPTS_STORAGE_KEY,
  event: CONCEPTS_CHANGE_EVENT,
  empty: () => ({}),
  parse: parseConceptStates,
  serialize: (v) => JSON.stringify(v),
};
