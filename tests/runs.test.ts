import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  DIFFICULTY_POINTS,
  decodeRun,
  encodeRun,
  finishRun,
  getRunHistory,
  parSeconds,
  recordSolve,
  seededRunProblems,
  solveScore,
  startRun,
  type RunState,
} from "@/lib/runs";
import { PROBLEMS } from "@/data/problems";
import type { Difficulty } from "@/types/problem";

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

const knownIds = new Set(PROBLEMS.map((problem) => problem.id));
const difficultyCases: Array<[Difficulty, (typeof PROBLEMS)[number]]> = [];
for (const difficulty of ["Easy", "Medium", "Hard"] as Difficulty[]) {
  const problem = PROBLEMS.find((p) => p.difficulty === difficulty);
  if (problem) difficultyCases.push([difficulty, problem]);
}

describe("seededRunProblems", () => {
  test("is deterministic for the same seed, count, and category", () => {
    const first = seededRunProblems("speedrun-42", 12);
    const second = seededRunProblems("speedrun-42", 12);
    expect(first.map((p) => p.id)).toEqual(second.map((p) => p.id));
    expect(first).toHaveLength(12);
    expect(new Set(first.map((p) => p.id)).size).toBe(12);
    for (const problem of first) expect(knownIds.has(problem.id), problem.id).toBe(true);
  });

  test("spreads the requested count across difficulties", () => {
    const picks = seededRunProblems("mix-seed", 10);
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    for (const problem of picks) counts[problem.difficulty] += 1;
    expect(counts.Easy + counts.Medium + counts.Hard).toBe(10);
    expect(counts.Easy).toBe(Math.round(10 * 0.4));
    expect(counts.Hard).toBe(Math.round(10 * 0.2));
    expect(counts.Medium).toBe(10 - counts.Easy - counts.Hard);
  });

  test("honours the category filter and treats All as unfiltered", () => {
    const filtered = seededRunProblems("category-seed", 8, "Algorithms");
    expect(filtered).toHaveLength(8);
    for (const problem of filtered) {
      expect(problem.category, problem.id).toBe("Algorithms");
    }

    const all = seededRunProblems("category-seed", 8, "All");
    const unfiltered = seededRunProblems("category-seed", 8);
    expect(all.map((p) => p.id)).toEqual(unfiltered.map((p) => p.id));

    expect(seededRunProblems("category-seed", 5, "No Such Category")).toEqual([]);
  });

  test("normalizes fractional and non-positive counts", () => {
    expect(seededRunProblems("seed", 0)).toHaveLength(1);
    expect(seededRunProblems("seed", -4)).toHaveLength(1);
    expect(seededRunProblems("seed", 5.9)).toHaveLength(5);
  });

  test("different seeds produce different orders", () => {
    const a = seededRunProblems("seed-a", 10).map((p) => p.id);
    const b = seededRunProblems("seed-b", 10).map((p) => p.id);
    expect(a).not.toEqual(b);
  });
});

describe("solveScore", () => {
  test("awards full points at zero seconds and never drops below half", () => {
    for (const [difficulty, problem] of difficultyCases) {
      const points = DIFFICULTY_POINTS[difficulty];
      expect(solveScore(problem, 0), problem.id).toBe(points);
      expect(solveScore(problem, 2 * parSeconds(problem)), problem.id).toBe(
        points * 0.5,
      );
      expect(solveScore(problem, 100 * parSeconds(problem)), problem.id).toBe(
        points * 0.5,
      );
    }
  });

  test("is monotonically non-increasing as solve time grows", () => {
    for (const [, problem] of difficultyCases) {
      const par = parSeconds(problem);
      const times = [0, 1, par / 2, par, par * 1.5, par * 2, par * 5];
      for (let i = 1; i < times.length; i += 1) {
        expect(
          solveScore(problem, times[i]),
          `${problem.id} @${times[i]}s`,
        ).toBeLessThanOrEqual(solveScore(problem, times[i - 1]));
      }
      expect(solveScore(problem, 0), problem.id).toBeGreaterThan(
        solveScore(problem, 2 * par),
      );
    }
  });

  test("clamps negative times to full points and non-finite to the floor", () => {
    for (const [, problem] of difficultyCases) {
      const points = DIFFICULTY_POINTS[problem.difficulty];
      expect(solveScore(problem, -10), problem.id).toBe(points);
      expect(solveScore(problem, NaN), problem.id).toBe(points * 0.5);
      expect(solveScore(problem, Infinity), problem.id).toBe(points * 0.5);
    }
  });

  test("never awards more than the difficulty points", () => {
    for (const [, problem] of difficultyCases) {
      const points = DIFFICULTY_POINTS[problem.difficulty];
      for (const time of [0, 1, 30, 90, 150, 240, 1e6]) {
        const score = solveScore(problem, time);
        expect(score, problem.id).toBeGreaterThanOrEqual(points * 0.5);
        expect(score, problem.id).toBeLessThanOrEqual(points);
      }
    }
  });
});

describe("run codes", () => {
  test("round-trips a finished run reconstructed from the seed", () => {
    const state = startRun({
      seed: "race-me",
      problemCount: 8,
      durationSeconds: 300,
      category: "Algorithms",
    });
    let running: RunState = state;
    running = recordSolve(running, running.problemIds[0], 5_000);
    running = recordSolve(running, running.problemIds[1], 25_000);
    const finished = finishRun(running, "finished");
    expect(getRunHistory()).toHaveLength(1);

    const code = encodeRun(finished);
    expect(code.length).toBeGreaterThan(0);
    expect(code).not.toContain("=");
    expect(code).not.toContain("+");
    expect(code).not.toContain("/");

    const decoded = decodeRun(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.seed).toBe("race-me");
    expect(decoded!.status).toBe("finished");
    expect(decoded!.score).toBe(finished.score);
    expect(decoded!.category).toBe("Algorithms");
    expect(decoded!.problemIds).toEqual(finished.problemIds);
    expect(decoded!.solvedIds).toEqual(finished.solvedIds);
    expect(decoded!.startedAt).toBe(0);
    expect(decoded!.endsAt).toBe(300_000);
    expect(decoded!.solvedAt).toEqual({});
  });

  test("rejects malformed codes and out-of-range payloads", () => {
    expect(decodeRun("")).toBeNull();
    expect(decodeRun("!!!not-base64!!!")).toBeNull();
    expect(decodeRun(btoa(JSON.stringify({ hello: "world" })))).toBeNull();
    expect(decodeRun(btoa(JSON.stringify({ v: 2, seed: "x" })))).toBeNull();
    expect(
      decodeRun(
        btoa(
          JSON.stringify({
            v: 1,
            seed: "x",
            score: "nope",
            duration: 60,
            count: 3,
            solved: [],
          }),
        ),
      ),
    ).toBeNull();
    expect(
      decodeRun(
        btoa(
          JSON.stringify({
            v: 1,
            seed: "x",
            score: 1,
            duration: 60,
            count: 3,
            solved: [1.5],
          }),
        ),
      ),
    ).toBeNull();
  });

  test("drops solved indices that are not part of the seeded run", () => {
    const seed = "handmade-code";
    const count = 3;
    const problems = seededRunProblems(seed, count);
    const sorted = [...PROBLEMS].sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    );
    const indexOf = new Map(sorted.map((problem, index) => [problem.id, index]));
    const validIndex = indexOf.get(problems[0].id) as number;
    const outsider = PROBLEMS.find(
      (problem) => !problems.some((pick) => pick.id === problem.id),
    );
    const outsiderIndex = indexOf.get(outsider!.id) as number;

    const payload = {
      v: 1,
      seed,
      score: 12.34,
      duration: 120,
      count,
      solved: [validIndex, outsiderIndex, 9_999_999, -1, validIndex],
    };
    const code = btoa(JSON.stringify(payload)).replace(/=+$/, "");
    const decoded = decodeRun(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.solvedIds).toEqual([problems[0].id]);
    expect(decoded!.problemIds).toEqual(problems.map((p) => p.id));
  });

  test("encode ignores solved ids that are not in the catalogue", () => {
    const state = startRun({ seed: "ghost-solve", problemCount: 3, durationSeconds: 60 });
    const withGhost: RunState = {
      ...state,
      solvedIds: ["not-a-real-problem", state.problemIds[0]],
    };
    const decoded = decodeRun(encodeRun(withGhost));
    expect(decoded).not.toBeNull();
    expect(decoded!.solvedIds).toEqual([state.problemIds[0]]);
  });
});
