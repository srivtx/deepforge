import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { LABS, type Lab } from "@/data/labs";
import {
  LAB_HISTORY_CAP,
  LAB_SPEC,
  getLabBest,
  getLabRecords,
  meetsTarget,
  metricLabel,
  sanitizeLabRecord,
  setLabBest,
} from "@/lib/labs";

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

describe("lab datasets", () => {
  test("every split is JSON-safe with finite numbers and consistent shapes", () => {
    for (const lab of LABS) {
      const splits = [
        ["train", lab.trainData],
        ["test", lab.testData],
      ] as const;
      for (const [name, split] of splits) {
        const path = `${lab.id}.${name}`;
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

  test("targets and baselines are consistent with each metric direction", () => {
    const ids = new Set(LABS.map((lab) => lab.id));
    expect(ids.size).toBe(LABS.length);

    for (const lab of LABS) {
      expect(lab.title.trim().length > 0, lab.id).toBe(true);
      expect(lab.category.trim().length > 0, lab.id).toBe(true);
      expect(lab.starterCode.trim().length > 0, lab.id).toBe(true);
      expect(lab.hint.trim().length > 0, lab.id).toBe(true);
      expect(lab.constraints.length, lab.id).toBeGreaterThan(0);
      expect(lab.points, lab.id).toBeGreaterThan(0);
      expect(lab.timeLimitSeconds, lab.id).toBeGreaterThan(0);
      expect(metricLabel(lab.metric).length, lab.id).toBeGreaterThan(0);

      expect(Number.isFinite(lab.baseline), lab.id).toBe(true);
      expect(Number.isFinite(lab.target), lab.id).toBe(true);
      const gap = Math.abs(lab.target - lab.baseline);
      expect(gap, lab.id).toBeGreaterThan(0);

      if (lab.higherIsBetter) {
        expect(lab.target, lab.id).toBeGreaterThan(lab.baseline);
      } else {
        expect(lab.target, lab.id).toBeLessThan(lab.baseline);
      }

      if (lab.metric === "accuracy" || lab.metric === "f1") {
        expect(lab.baseline, lab.id).toBeGreaterThanOrEqual(0);
        expect(lab.baseline, lab.id).toBeLessThanOrEqual(1);
        expect(lab.target, lab.id).toBeGreaterThanOrEqual(0);
        expect(lab.target, lab.id).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("lab reference solutions", () => {
  test("every lab ships a non-empty solution with at least two notes", () => {
    for (const lab of LABS) {
      expect(lab.solutionCode.trim().length, lab.id).toBeGreaterThan(0);
      expect(lab.solutionNotes.length, lab.id).toBeGreaterThanOrEqual(2);
      expect(lab.solutionNotes.length, lab.id).toBeLessThanOrEqual(4);
      for (const note of lab.solutionNotes) {
        expect(note.trim().length, lab.id).toBeGreaterThan(0);
      }
    }
  });

  test("every solution defines the runner's predict signature", () => {
    const signature = /^def\s+(\w+)\s*\(([^)]*)\):/m;
    for (const lab of LABS) {
      const starter = lab.starterCode.match(signature);
      const solution = lab.solutionCode.match(signature);
      expect(starter, lab.id).not.toBeNull();
      expect(solution, lab.id).not.toBeNull();
      expect(solution![1], lab.id).toBe("predict");
      expect(solution![1], lab.id).toBe(starter![1]);
      expect(solution![2].replace(/\s+/g, ""), lab.id).toBe(
        starter![2].replace(/\s+/g, ""),
      );
      expect(lab.solutionCode, lab.id).toContain(
        "def predict(train_X, train_y, test_X):",
      );
    }
  });

  test("solutions are not copies of the starter baselines", () => {
    for (const lab of LABS) {
      expect(lab.solutionCode.trim(), lab.id).not.toBe(
        lab.starterCode.trim(),
      );
    }
  });
});

describe("meetsTarget", () => {
  test("accepts the target and rejects a step in the wrong direction", () => {
    for (const lab of LABS) {
      expect(meetsTarget(lab, lab.target), lab.id).toBe(true);
      const wrong = lab.higherIsBetter ? lab.target - 0.01 : lab.target + 0.01;
      expect(meetsTarget(lab, wrong), lab.id).toBe(false);
    }
  });
});

describe("setLabBest", () => {
  const higher = LABS.find((lab) => lab.higherIsBetter) as Lab;
  const lower = LABS.find((lab) => !lab.higherIsBetter) as Lab;

  test("keeps the best score in the metric direction and sticks passed", () => {
    const below = setLabBest(higher.id, higher.target - 0.1);
    expect(below.best).toBe(higher.target - 0.1);
    expect(below.attempts).toBe(1);
    expect(below.passed).toBe(false);

    const atTarget = setLabBest(higher.id, higher.target);
    expect(atTarget.best).toBe(higher.target);
    expect(atTarget.passed).toBe(true);

    const worse = setLabBest(higher.id, higher.target - 0.3);
    expect(worse.best).toBe(higher.target);
    expect(worse.passed).toBe(true);
    expect(worse.attempts).toBe(3);
    expect(getLabBest(higher.id)!.attempts).toBe(3);

    const lowFirst = setLabBest(lower.id, lower.target + 10);
    expect(lowFirst.best).toBe(lower.target + 10);
    expect(lowFirst.passed).toBe(false);

    const lowBetter = setLabBest(lower.id, lower.target - 10);
    expect(lowBetter.best).toBe(lower.target - 10);
    expect(lowBetter.passed).toBe(true);

    const records = getLabRecords();
    expect(Object.keys(records).sort()).toEqual([higher.id, lower.id].sort());
  });

  test("unknown lab ids return null and record nothing", () => {
    expect(getLabBest("missing-lab")).toBeNull();
  });

  test("stamps each scored run with the run time", () => {
    const at = new Date(2026, 0, 14, 12, 0, 0, 0);
    const first = setLabBest(higher.id, higher.target - 0.2, at);
    expect(first.lastScoredAt).toBe(at.toISOString());

    const later = new Date(2026, 0, 15, 9, 30, 0, 0);
    const second = setLabBest(higher.id, higher.target, later);
    expect(second.lastScoredAt).toBe(later.toISOString());
    expect(getLabBest(higher.id)!.lastScoredAt).toBe(later.toISOString());
  });

  test("keeps a short append-only pass history and the latest score", () => {
    const at1 = new Date(2026, 0, 5, 10, 0, 0, 0);
    const miss = higher.target - 0.2;
    const first = setLabBest(higher.id, miss, at1);
    expect(first.recentPasses).toEqual([]);
    expect(first.lastScore).toBe(miss);

    const at2 = new Date(2026, 0, 6, 10, 0, 0, 0);
    const pass = setLabBest(higher.id, higher.target, at2);
    expect(pass.recentPasses).toEqual([at2.toISOString()]);
    expect(pass.lastScore).toBe(higher.target);

    const low = setLabBest(lower.id, lower.target + 1, at1);
    expect(low.recentPasses).toEqual([]);
    const lowPass = setLabBest(lower.id, lower.target, at2);
    expect(lowPass.recentPasses).toEqual([at2.toISOString()]);
  });
});

describe("lab record payload hardening", () => {
  function storage(): Storage {
    return (globalScope.window as { localStorage: Storage }).localStorage;
  }

  test("invalid payloads read as an empty map", () => {
    expect(LAB_SPEC.parse(null)).toEqual({});
    expect(LAB_SPEC.parse("")).toEqual({});
    expect(LAB_SPEC.parse("{not json")).toEqual({});
    expect(LAB_SPEC.parse("[]")).toEqual({});
    expect(LAB_SPEC.parse("null")).toEqual({});
    expect(LAB_SPEC.parse('"nope"')).toEqual({});
    expect(LAB_SPEC.parse("7")).toEqual({});
  });

  test('a stored {"x":null} payload never reaches a derived view', () => {
    storage().setItem("deepforge:labs", JSON.stringify({ x: null }));
    expect(getLabRecords()).toEqual({});
    expect(getLabBest("x")).toBeNull();
  });

  test("malformed entries drop instead of throwing", () => {
    const parsed = LAB_SPEC.parse(
      JSON.stringify({
        good: {
          best: 0.9,
          attempts: 2,
          passed: true,
          lastScoredAt: "2026-01-05T10:00:00.000Z",
        },
        nil: null,
        arr: [],
        str: "x",
        num: 5,
      }),
    );
    expect(Object.keys(parsed)).toEqual(["good"]);
    expect(parsed.good).toEqual({
      best: 0.9,
      attempts: 2,
      passed: true,
      lastScoredAt: "2026-01-05T10:00:00.000Z",
    });
  });

  test("present-but-invalid fields sanitize to defaults", () => {
    const parsed = LAB_SPEC.parse(
      JSON.stringify({
        bad: {
          best: "nope",
          attempts: -3.7,
          passed: "yes",
          lastScoredAt: 42,
          lastScore: Number.NaN,
          recentPasses: "nope",
        },
      }),
    );
    expect(parsed.bad).toEqual({ best: null, attempts: 0, passed: false });
  });

  test("recentPasses keeps only ISO timestamps, newest last, capped", () => {
    const passes = Array.from(
      { length: 14 },
      (_, i) =>
        `2026-01-${String(i + 1).padStart(2, "0")}T10:00:00.000Z`,
    );
    const sanitized = sanitizeLabRecord({
      best: 1,
      attempts: 14,
      passed: true,
      lastScoredAt: passes[13],
      lastScore: 1,
      recentPasses: ["nope", ...passes, 7],
    });
    expect(sanitized).not.toBeNull();
    expect(sanitized!.recentPasses).toHaveLength(LAB_HISTORY_CAP);
    expect(sanitized!.recentPasses![0]).toBe(passes[4]);
    expect(sanitized!.recentPasses![LAB_HISTORY_CAP - 1]).toBe(passes[13]);
  });
});
