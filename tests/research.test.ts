import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { RESEARCH_CHALLENGES } from "@/data/research";
import {
  beatsBaseline,
  getChallengeState,
  getResearchState,
  resetResearchChallenge,
  saveAttempt,
} from "@/lib/research";

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

function assertFiniteNumbers(value: unknown, path: string): void {
  if (typeof value === "number") {
    expect(Number.isFinite(value), path).toBe(true);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteNumbers(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      assertFiniteNumbers(item, `${path}.${key}`);
    }
  }
}

function assertJsonSafe(value: unknown, path: string): void {
  const roundTripped: unknown = JSON.parse(JSON.stringify(value));
  expect(roundTripped, path).toEqual(value);
}

describe("research datasets", () => {
  test("every split is JSON-safe with finite numbers and consistent shapes", () => {
    for (const challenge of RESEARCH_CHALLENGES) {
      const splits = [
        ["train", challenge.trainData],
        ["test", challenge.testData],
      ] as const;
      for (const [name, split] of splits) {
        const path = `${challenge.id}.${name}`;
        assertFiniteNumbers(split, path);
        assertJsonSafe(split, path);

        expect(split.features.length, path).toBeGreaterThan(0);
        expect(split.labels.length, path).toBe(split.features.length);
        const width = split.features[0].length;
        expect(width, path).toBeGreaterThan(0);
        for (const row of split.features) {
          expect(row.length, path).toBe(width);
        }
      }
    }
  });

  test("baselines are finite and plausible for their metric", () => {
    const ids = new Set(RESEARCH_CHALLENGES.map((challenge) => challenge.id));
    expect(ids.size).toBe(RESEARCH_CHALLENGES.length);

    for (const challenge of RESEARCH_CHALLENGES) {
      expect(challenge.title.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.blurb.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.baselineName.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.datasetDescription.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.starterCode.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.hint.trim().length > 0, challenge.id).toBe(true);
      expect(challenge.points, challenge.id).toBeGreaterThan(0);
      expect(Number.isFinite(challenge.baselineScore), challenge.id).toBe(true);

      if (challenge.metric === "accuracy" || challenge.metric === "f1") {
        expect(challenge.baselineScore, challenge.id).toBeGreaterThanOrEqual(0);
        expect(challenge.baselineScore, challenge.id).toBeLessThanOrEqual(1);
      }
    }
  });

  test("every challenge ships a distinct reference solution with notes", () => {
    for (const challenge of RESEARCH_CHALLENGES) {
      expect(
        challenge.solutionCode.trim().length > 0,
        challenge.id,
      ).toBe(true);
      expect(
        challenge.solutionCode.includes("def solve("),
        challenge.id,
      ).toBe(true);
      expect(
        challenge.solutionCode.trim() === challenge.starterCode.trim(),
        challenge.id,
      ).toBe(false);
      expect(
        challenge.solutionNotes.length,
        challenge.id,
      ).toBeGreaterThanOrEqual(2);
      for (const note of challenge.solutionNotes) {
        expect(note.trim().length > 0, challenge.id).toBe(true);
      }
    }
  });
});

describe("beatsBaseline", () => {
  test("is strict about direction and rejects non-finite scores", () => {
    for (const challenge of RESEARCH_CHALLENGES) {
      expect(beatsBaseline(challenge, challenge.baselineScore), challenge.id).toBe(false);

      const better = challenge.higherIsBetter
        ? challenge.baselineScore + 0.05
        : challenge.baselineScore - 0.05;
      expect(beatsBaseline(challenge, better), challenge.id).toBe(true);

      const worse = challenge.higherIsBetter
        ? challenge.baselineScore - 0.05
        : challenge.baselineScore + 0.05;
      expect(beatsBaseline(challenge, worse), challenge.id).toBe(false);

      expect(beatsBaseline(challenge, NaN), challenge.id).toBe(false);
      expect(beatsBaseline(challenge, Infinity), challenge.id).toBe(false);
    }
  });
});

describe("saveAttempt", () => {
  const higher = RESEARCH_CHALLENGES.find((challenge) => challenge.higherIsBetter)!;
  const lower = RESEARCH_CHALLENGES.find((challenge) => !challenge.higherIsBetter)!;

  test("defaults to an empty state for unknown challenges", () => {
    const state = getChallengeState("missing-challenge");
    expect(state.bestScore).toBeNull();
    expect(state.bestAt).toBeNull();
    expect(state.beatenBaseline).toBe(false);
    expect(state.attempts).toEqual([]);
  });

  test("keeps the best score in the metric direction and sticks the baseline flag", () => {
    const below = saveAttempt(higher.id, higher.baselineScore - 0.1);
    expect(below.bestScore).toBe(higher.baselineScore - 0.1);
    expect(below.beatenBaseline).toBe(false);
    expect(below.attempts).toHaveLength(1);

    const above = saveAttempt(higher.id, higher.baselineScore + 0.1);
    expect(above.bestScore).toBe(higher.baselineScore + 0.1);
    expect(above.beatenBaseline).toBe(true);
    expect(above.attempts).toHaveLength(2);

    const mixed = saveAttempt(higher.id, higher.baselineScore - 0.2);
    expect(mixed.bestScore).toBe(higher.baselineScore + 0.1);
    expect(mixed.beatenBaseline).toBe(true);
    expect(mixed.attempts).toHaveLength(3);

    const lowFirst = saveAttempt(lower.id, lower.baselineScore + 0.1);
    expect(lowFirst.bestScore).toBe(lower.baselineScore + 0.1);
    expect(lowFirst.beatenBaseline).toBe(false);

    const lowBetter = saveAttempt(lower.id, lower.baselineScore - 0.1);
    expect(lowBetter.bestScore).toBe(lower.baselineScore - 0.1);
    expect(lowBetter.beatenBaseline).toBe(true);

    const before = getResearchState();
    expect(Object.keys(before).sort()).toEqual([higher.id, lower.id].sort());
  });

  test("ignores non-finite scores and keeps the previous record", () => {
    saveAttempt(lower.id, lower.baselineScore - 0.1);
    const unchanged = saveAttempt(lower.id, NaN);
    expect(unchanged.bestScore).toBe(lower.baselineScore - 0.1);
    expect(unchanged.attempts).toHaveLength(1);
  });

  test("retains only the last 50 attempts", () => {
    for (let i = 0; i < 55; i += 1) {
      saveAttempt(higher.id, higher.baselineScore + i);
    }
    const state = getChallengeState(higher.id);
    expect(state.attempts).toHaveLength(50);
    expect(state.bestScore).toBe(higher.baselineScore + 54);
  });

  test("resetResearchChallenge clears one challenge only", () => {
    saveAttempt(higher.id, higher.baselineScore + 0.1);
    saveAttempt(lower.id, lower.baselineScore - 0.1);

    resetResearchChallenge(higher.id);
    expect(getChallengeState(higher.id).bestScore).toBeNull();
    expect(getChallengeState(lower.id).bestScore).toBe(lower.baselineScore - 0.1);
  });
});
