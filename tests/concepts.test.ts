import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CONCEPTS } from "@/data/concepts";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { PROBLEMS } from "@/data/problems";
import {
  gradeConcept,
  getConceptState,
  type ConceptQuality,
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
