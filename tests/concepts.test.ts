import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CONCEPTS } from "@/data/concepts";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { PROBLEMS } from "@/data/problems";
import {
  CONCEPTS_CHANGE_EVENT,
  CONCEPTS_SPEC,
  CONCEPTS_STORAGE_KEY,
  getConceptState,
  getConceptStates,
  getConceptStats,
  getDueConcepts,
  gradeConcept,
  isConceptUnlocked,
  masteryOf,
  mergeConcepts,
  type ConceptQuality,
  type ConceptState,
  type ConceptStateMap,
} from "@/lib/concepts";

function createStorageStub(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const globalScope = globalThis as unknown as { window?: unknown };
let originalWindow: unknown;
let hadWindow = false;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  globalScope.window = {
    localStorage: createStorageStub(),
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

function addDaysToKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function clampEase(ease: number): number {
  return Math.round(Math.min(2.8, Math.max(1.3, ease)) * 1000) / 1000;
}

function easeDelta(quality: number): number {
  return 0.1 - (5 - quality) * (0.08 + 0.02 * (5 - quality));
}

const FIXED_NOW = new Date(2026, 0, 14, 12, 0, 0, 0);
const TODAY_KEY = "2026-01-14";

describe("concept catalogue", () => {
  test("covers all 60 penpaper ids exactly once", () => {
    const known = new Set(PENPAPER_PROBLEMS.map((problem) => problem.id));
    expect(known.size).toBe(60);

    const owners = new Map<string, Set<string>>();
    for (const concept of CONCEPTS) {
      const covered = new Set([concept.workedExampleId, ...concept.practiceIds]);
      expect(covered.size, concept.id).toBe(3);
      for (const id of covered) {
        expect(known.has(id), `${concept.id} -> ${id}`).toBe(true);
        const ownerSet = owners.get(id) ?? new Set<string>();
        ownerSet.add(concept.id);
        owners.set(id, ownerSet);
      }
    }

    expect(owners.size).toBe(known.size);
    for (const [id, ownerSet] of owners) {
      expect(ownerSet.size, id).toBe(1);
    }
    expect([...owners.keys()].sort()).toEqual([...known].sort());
  });

  test("every concept is well-formed and its code ids exist", () => {
    const problemIds = new Set(PROBLEMS.map((problem) => problem.id));
    const ids = new Set(CONCEPTS.map((concept) => concept.id));
    expect(ids.size).toBe(CONCEPTS.length);

    for (const concept of CONCEPTS) {
      expect(concept.title.trim().length > 0, concept.id).toBe(true);
      expect(concept.category.trim().length > 0, concept.id).toBe(true);
      expect(concept.blurb.trim().length > 0, concept.id).toBe(true);
      expect(concept.workedSteps.length, concept.id).toBeGreaterThan(0);
      expect(concept.practiceIds.length, concept.id).toBe(3);
      for (const id of concept.codeProblemIds ?? []) {
        expect(problemIds.has(id), `${concept.id} -> ${id}`).toBe(true);
      }
    }
  });

  test("prerequisites reference real concepts and form no cycles", () => {
    const byId = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
    for (const concept of CONCEPTS) {
      for (const prerequisite of concept.prerequisites) {
        expect(byId.has(prerequisite), `${concept.id} -> ${prerequisite}`).toBe(true);
        expect(prerequisite === concept.id, concept.id).toBe(false);
      }
    }

    const status = new Map<string, "visiting" | "done">();
    const visit = (id: string, stack: string[]): void => {
      const current = status.get(id);
      if (current === "done") return;
      expect(current, `cycle: ${[...stack, id].join(" -> ")}`).not.toBe("visiting");
      status.set(id, "visiting");
      for (const prerequisite of byId.get(id)?.prerequisites ?? []) {
        visit(prerequisite, [...stack, id]);
      }
      status.set(id, "done");
    };
    for (const concept of CONCEPTS) visit(concept.id, []);
  });
});

describe("SM-2 scheduling", () => {
  test("three consecutive passes give 1, 6, then round(6 * ease)", () => {
    let expectedEase = clampEase(2.5 + easeDelta(5));

    const first = gradeConcept("la-vectors", 5, FIXED_NOW);
    expect(first.interval).toBe(1);
    expect(first.reps).toBe(1);
    expect(first.lapses).toBe(0);
    expect(first.ease).toBe(expectedEase);
    expect(first.due).toBe(addDaysToKey(TODAY_KEY, 1));

    expectedEase = clampEase(expectedEase + easeDelta(5));
    const second = gradeConcept("la-vectors", 5, FIXED_NOW);
    expect(second.interval).toBe(6);
    expect(second.reps).toBe(2);
    expect(second.ease).toBe(expectedEase);
    expect(second.due).toBe(addDaysToKey(TODAY_KEY, 6));

    const expectedThirdInterval = Math.round(6 * expectedEase);
    expect(expectedThirdInterval).toBe(16);
    expectedEase = clampEase(expectedEase + easeDelta(5));
    const third = gradeConcept("la-vectors", 5, FIXED_NOW);
    expect(third.interval).toBe(expectedThirdInterval);
    expect(third.reps).toBe(3);
    expect(third.ease).toBe(expectedEase);
    expect(third.due).toBe(addDaysToKey(TODAY_KEY, expectedThirdInterval));
  });

  test("a failed review resets to interval 1 and increments lapses", () => {
    gradeConcept("calc-derivatives", 5, FIXED_NOW);
    gradeConcept("calc-derivatives", 5, FIXED_NOW);
    const before = getConceptState("calc-derivatives", FIXED_NOW);
    expect(before.reps).toBe(2);

    const failed = gradeConcept("calc-derivatives", 0, FIXED_NOW);
    expect(failed.interval).toBe(1);
    expect(failed.reps).toBe(0);
    expect(failed.lapses).toBe(before.lapses + 1);
    expect(failed.ease).toBe(clampEase(before.ease - 0.2));
    expect(failed.due).toBe(addDaysToKey(TODAY_KEY, 1));

    const passAfterFail = gradeConcept("calc-derivatives", 5, FIXED_NOW);
    expect(passAfterFail.interval).toBe(1);
    expect(passAfterFail.reps).toBe(1);
  });

  test("ease stays clamped to the [1.3, 2.8] band", () => {
    let low = getConceptState("prob-basics", FIXED_NOW);
    for (let i = 0; i < 12; i += 1) {
      low = gradeConcept("prob-basics", 0 as ConceptQuality, FIXED_NOW);
    }
    expect(low.ease).toBe(1.3);
    expect(low.lapses).toBe(12);

    let high = low;
    for (let i = 0; i < 20; i += 1) {
      high = gradeConcept("prob-basics", 5, FIXED_NOW);
    }
    expect(high.ease).toBe(2.8);
  });
});

describe("store, parsing, and sanitization", () => {
  function storage(): Storage {
    return (globalScope.window as { localStorage: Storage }).localStorage;
  }

  test("invalid storage payloads read as an empty map", () => {
    storage().setItem(CONCEPTS_STORAGE_KEY, "{not json");
    expect(getConceptStates(FIXED_NOW)).toEqual({});
    expect(CONCEPTS_SPEC.parse(null)).toEqual({});
    expect(CONCEPTS_SPEC.parse("[]")).toEqual({});
    expect(CONCEPTS_SPEC.parse("null")).toEqual({});
    expect(CONCEPTS_SPEC.parse('"nope"')).toEqual({});
  });

  test("sanitizes out-of-band values instead of throwing", () => {
    const parsed = CONCEPTS_SPEC.parse(
      JSON.stringify({
        good: { ease: 2.2, interval: 6, due: "2026-02-01", reps: 3, lapses: 1 },
        bad: {
          ease: "x",
          interval: -5,
          due: "not-a-date",
          reps: 1.7,
          lapses: Number.NaN,
        },
        junk: "not-a-state",
        nil: null,
      }),
    );
    expect(parsed.good).toEqual({
      ease: 2.2,
      interval: 6,
      due: "2026-02-01",
      reps: 3,
      lapses: 1,
    });
    expect(parsed.bad.ease).toBe(2.5);
    expect(parsed.bad.interval).toBe(0);
    expect(parsed.bad.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parsed.bad.reps).toBe(2);
    expect(parsed.bad.lapses).toBe(0);
    expect(parsed.junk).toBeUndefined();
    expect(parsed.nil).toBeUndefined();
  });

  test("round-trips through the spec serializer", () => {
    const states: ConceptStateMap = {
      "la-vectors": {
        ease: 2.6,
        interval: 1,
        due: "2026-01-15",
        reps: 1,
        lapses: 0,
      },
    };
    expect(CONCEPTS_SPEC.parse(CONCEPTS_SPEC.serialize(states))).toEqual(states);
  });

  test("CONCEPTS_SPEC is the sync seam contract for the concepts store", () => {
    expect(CONCEPTS_SPEC.id).toBe("concepts");
    expect(CONCEPTS_SPEC.storageKey).toBe("deepforge:concepts:v1");
    expect(CONCEPTS_SPEC.event).toBe(CONCEPTS_CHANGE_EVENT);
    expect(CONCEPTS_SPEC.empty()).toEqual({});
    expect(CONCEPTS_SPEC.parse(null)).toEqual({});
  });

  test("gradeConcept persists through the store and dispatches the change event", () => {
    const events: string[] = [];
    (
      globalScope.window as { dispatchEvent: (event: Event) => boolean }
    ).dispatchEvent = (event) => {
      events.push((event as CustomEvent).type);
      return true;
    };
    gradeConcept("la-vectors", 5, FIXED_NOW);
    expect(events).toContain(CONCEPTS_CHANGE_EVENT);

    const stored = JSON.parse(
      storage().getItem(CONCEPTS_STORAGE_KEY) as string,
    ) as ConceptStateMap;
    expect(stored["la-vectors"].reps).toBe(1);
    expect(stored["la-vectors"].due).toBe(addDaysToKey(TODAY_KEY, 1));
  });

  test("seeds state from pen paper solves through the store", () => {
    storage().setItem(
      "deepforge:penpaper:v1",
      JSON.stringify({
        "pp-002": {
          attempted: true,
          correct: true,
          lastAt: "2026-01-10T00:00:00.000Z",
        },
      }),
    );
    const states = getConceptStates(FIXED_NOW);
    expect(states["la-vectors"]).toEqual({
      ease: 2.5,
      interval: 1,
      due: TODAY_KEY,
      reps: 1,
      lapses: 0,
    });
    const stored = JSON.parse(
      storage().getItem(CONCEPTS_STORAGE_KEY) as string,
    ) as ConceptStateMap;
    expect(stored["la-vectors"].reps).toBe(1);
  });
});

describe("due and unlock semantics", () => {
  test("prerequisite-free concepts are unlocked and due; dependents start locked", () => {
    const due = getDueConcepts(FIXED_NOW).map((concept) => concept.id);
    expect(due).toContain("la-vectors");
    expect(due).toContain("la-matrix-ops");
    expect(due).not.toContain("la-determinants");

    const dependent = CONCEPTS.find(
      (concept) => concept.id === "la-determinants",
    )!;
    expect(isConceptUnlocked(dependent, {})).toBe(false);
  });

  test("two reps or 40% mastery unlocks a dependent concept", () => {
    const dependent = CONCEPTS.find(
      (concept) => concept.id === "la-determinants",
    )!;
    const base: ConceptState = {
      ease: 2.5,
      interval: 0,
      due: TODAY_KEY,
      reps: 0,
      lapses: 0,
    };
    expect(
      isConceptUnlocked(dependent, { "la-matrix-ops": { ...base, reps: 2 } }),
    ).toBe(true);
    expect(
      isConceptUnlocked(dependent, { "la-matrix-ops": { ...base, interval: 9 } }),
    ).toBe(true);
    expect(
      isConceptUnlocked(dependent, { "la-matrix-ops": { ...base, interval: 8 } }),
    ).toBe(false);
  });

  test("getConceptStats counts due, unlocked, mastered, and total", () => {
    const unlockedCount = CONCEPTS.filter(
      (concept) => concept.prerequisites.length === 0,
    ).length;

    expect(getConceptStats(FIXED_NOW)).toEqual({
      due: unlockedCount,
      mastered: 0,
      unlocked: unlockedCount,
      total: CONCEPTS.length,
    });

    for (let i = 0; i < 4; i += 1) gradeConcept("la-vectors", 5, FIXED_NOW);
    expect(getConceptStats(FIXED_NOW).mastered).toBe(1);
    expect(masteryOf(getConceptState("la-vectors", FIXED_NOW))).toBe(100);
  });
});

describe("remote merge (concepts)", () => {
  const state = (overrides: Partial<ConceptState> = {}): ConceptState => ({
    ease: 2.5,
    interval: 1,
    due: "2026-01-14",
    reps: 0,
    lapses: 0,
    ...overrides,
  });

  test("keeps the entry with the later due date per concept and unions keys", () => {
    const merged = mergeConcepts(
      { a: state({ due: "2026-02-01", reps: 3 }), b: state({ reps: 2 }) },
      { a: state({ due: "2026-03-01", reps: 1 }), c: state({ reps: 1 }) },
    );
    expect(merged.a.due).toBe("2026-03-01");
    expect(merged.a.reps).toBe(1);
    expect(merged.b.reps).toBe(2);
    expect(merged.c.reps).toBe(1);
  });

  test("ties keep local and malformed payloads are dropped", () => {
    const local: ConceptStateMap = { a: state({ reps: 4 }) };
    const remote = {
      a: state({ reps: 9 }),
      bad: "not-a-state",
      worse: 7,
    } as unknown as ConceptStateMap;
    const merged = mergeConcepts(local, remote);
    expect(merged.a.reps).toBe(4);
    expect(merged.bad).toBeUndefined();
    expect(merged.worse).toBeUndefined();
  });

  test("tolerates partial, legacy, and malformed maps", () => {
    for (const value of [null, undefined, 42, "junk", [], true]) {
      expect(mergeConcepts(value as never, value as never)).toEqual({});
    }
    expect(
      mergeConcepts(
        { a: state(), bad: "x" as never },
        { b: state({ due: "2026-02-02" }) },
      ),
    ).toEqual({ a: state(), b: state({ due: "2026-02-02" }) });
  });
});
