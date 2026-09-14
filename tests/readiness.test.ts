import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getDailyDateKey } from "@/lib/daily";
import type { ProgressMap } from "@/lib/progress";
import {
  DEFAULT_MINUTES_PER_PROBLEM,
  EMPTY_READINESS_GOAL,
  MAX_MINUTES_PER_PROBLEM,
  MIN_MINUTES_PER_PROBLEM,
  estimateMinutesPerProblem,
  getReadinessGoal,
  getReadinessProjection,
  getReadinessScore,
  projectReadiness,
  saveReadinessGoal,
  summarizeCoverage,
  type ProjectionInput,
} from "@/lib/readiness";

/* ───────────────────────────── test harness ─────────────────────────────── */

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
let stub: Storage;

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const PROGRESS_KEY = "deepforge:progress:v1";
const GOAL_KEY = "deepforge:readiness-goal:v1";

/** Fixed clock so every derivation is deterministic. */
const NOW = new Date(2026, 5, 15, 12, 0, 0);

function atDaysAgo(days: number, hour = 12): string {
  const date = new Date(NOW);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function keyDaysAhead(days: number): string {
  const date = new Date(NOW);
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

function seedProgress(progress: ProgressMap): void {
  stub.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function byCategory(name: string) {
  return PROBLEM_META.filter((problem) => problem.category === name);
}

function expectedCoverageScore(progress: ProgressMap): number {
  let sum = 0;
  let count = 0;
  for (const meta of CATEGORIES) {
    const problems = byCategory(meta.name);
    if (problems.length === 0) continue;
    const solved = problems.filter((problem) => progress[problem.id]?.solved);
    sum += solved.length / problems.length;
    count += 1;
  }
  return Math.round(100 * (count > 0 ? sum / count : 0));
}

const EASY = PROBLEM_META.filter((problem) => problem.difficulty === "Easy");
const MEDIUM = PROBLEM_META.filter((problem) => problem.difficulty === "Medium");
const HARD = PROBLEM_META.filter((problem) => problem.difficulty === "Hard");

/* ──────────────────────────── component math ────────────────────────────── */

describe("empty store", () => {
  test("every component and the total are finite zeros", () => {
    const readiness = getReadinessScore(NOW);
    expect(readiness).toEqual({
      value: 0,
      coverage: 0,
      retention: 0,
      balance: 0,
      consistency: 0,
    });
  });

  test("component values never leave 0–100", () => {
    seedProgress({
      "ghost-1": { attempted: true, lastOpened: atDaysAgo(1) },
      "ghost-2": { attempted: true, solved: true, solvedAt: atDaysAgo(2) },
    });
    const readiness = getReadinessScore(NOW);
    for (const value of Object.values(readiness)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});

describe("coverage", () => {
  test("averages solved share per category, each category equal", () => {
    const progress: ProgressMap = {};
    for (const name of ["Information Theory", "Linear Algebra"]) {
      for (const problem of byCategory(name)) {
        progress[problem.id] = { attempted: true, solved: true };
      }
    }
    seedProgress(progress);
    const readiness = getReadinessScore(NOW);
    expect(readiness.coverage).toBe(expectedCoverageScore(progress));
    expect(readiness.coverage).toBe(Math.round((100 * 2) / CATEGORIES.length));
  });

  test("partial categories earn partial credit", () => {
    const progress: ProgressMap = {};
    const problems = byCategory("Statistics");
    for (const problem of problems.slice(0, 105)) {
      progress[problem.id] = { attempted: true, solved: true };
    }
    seedProgress(progress);
    expect(getReadinessScore(NOW).coverage).toBe(
      expectedCoverageScore(progress),
    );
    expect(getReadinessScore(NOW).coverage).toBe(2);
  });
});

describe("retention", () => {
  test("last activity inside the 0.7 curve counts as retained", () => {
    seedProgress({
      "ghost-8d": { attempted: true, lastOpened: atDaysAgo(8) },
    });
    expect(getReadinessScore(NOW).retention).toBe(100);
  });

  test("activity just past the curve does not count", () => {
    seedProgress({
      "ghost-8d": { attempted: true, lastOpened: atDaysAgo(8) },
      "ghost-9d": { attempted: true, lastOpened: atDaysAgo(9) },
    });
    expect(getReadinessScore(NOW).retention).toBe(50);
  });

  test("undated attempts cannot demonstrate retention", () => {
    seedProgress({ "ghost-undated": { attempted: true } });
    expect(getReadinessScore(NOW).retention).toBe(0);
  });

  test("a scheduled queue item keeps an old solve retained", () => {
    seedProgress({
      [EASY[0].id]: {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(40),
      },
    });
    stub.setItem(
      "deepforge:reviews:v1",
      JSON.stringify({
        [EASY[0].id]: {
          ease: 2.5,
          interval: 60,
          due: keyDaysAhead(30),
          reps: 4,
          lapses: 0,
          lastGrade: 5,
          lastReviewedAt: atDaysAgo(30),
        },
      }),
    );
    expect(getReadinessScore(NOW).retention).toBe(100);
  });

  test("an overdue queue item ignores a fresh open", () => {
    seedProgress({
      [EASY[1].id]: {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(40),
        lastOpened: atDaysAgo(0),
      },
    });
    stub.setItem(
      "deepforge:reviews:v1",
      JSON.stringify({
        [EASY[1].id]: {
          ease: 2.5,
          interval: 6,
          due: keyDaysAhead(-20),
          reps: 2,
          lapses: 0,
          lastGrade: 5,
          lastReviewedAt: atDaysAgo(46),
        },
      }),
    );
    expect(getReadinessScore(NOW).retention).toBe(0);
  });
});

describe("balance", () => {
  test("a fully solved catalogue is perfectly balanced", () => {
    const progress: ProgressMap = {};
    for (const problem of PROBLEM_META) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(0),
      };
    }
    seedProgress(progress);

    const readiness = getReadinessScore(NOW);
    expect(readiness.coverage).toBe(100);
    expect(readiness.retention).toBe(100);
    expect(readiness.balance).toBe(100);
    expect(readiness.consistency).toBe(Math.round(100 / 14));

    const expectedValue = Math.round(
      100 * (0.35 + 0.3 + 0.2 + 0.15 * (Math.round(100 / 14) / 100)),
    );
    expect(readiness.value).toBe(expectedValue);
    expect(readiness.value).toBe(86);
  });

  test("an all-Easy history cannot read as ready", () => {
    const progress: ProgressMap = {};
    for (const problem of EASY) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(0),
      };
    }
    seedProgress(progress);

    const readiness = getReadinessScore(NOW);
    expect(readiness.balance).toBeGreaterThan(0);
    expect(readiness.balance).toBeLessThan(50);
    expect(readiness.value).toBeLessThan(60);
  });
});

describe("consistency", () => {
  test("saturates at 14 active days inside the 28-day window", () => {
    const progress: ProgressMap = {};
    for (let day = 0; day < 14; day += 1) {
      progress[EASY[day].id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(day),
      };
    }
    seedProgress(progress);
    expect(getReadinessScore(NOW).consistency).toBe(100);
  });

  test("counts opens as activity and ignores stale days", () => {
    const progress: ProgressMap = {};
    for (let day = 0; day < 5; day += 1) {
      progress[MEDIUM[day].id] = {
        attempted: true,
        lastOpened: atDaysAgo(day),
      };
    }
    progress[MEDIUM[10].id] = {
      attempted: true,
      solved: true,
      solvedAt: atDaysAgo(30),
    };
    seedProgress(progress);
    expect(getReadinessScore(NOW).consistency).toBe(Math.round((5 / 14) * 100));
  });
});

describe("determinism", () => {
  test("same store plus same clock yields identical scores", () => {
    const progress: ProgressMap = {};
    for (const problem of PROBLEM_META.slice(0, 500)) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(problem.id.length % 20),
      };
    }
    seedProgress(progress);
    expect(getReadinessScore(NOW)).toEqual(getReadinessScore(NOW));
  });
});

/* ──────────────────────────── subset coverage ───────────────────────────── */

describe("summarizeCoverage", () => {
  test("empty and unknown ids stay at zero without NaN", () => {
    const empty = summarizeCoverage([], {});
    expect(empty).toEqual({
      solved: 0,
      total: 0,
      percent: 0,
      byDifficulty: {
        Easy: { solved: 0, total: 0, percent: 0 },
        Medium: { solved: 0, total: 0, percent: 0 },
        Hard: { solved: 0, total: 0, percent: 0 },
      },
    });
    const unknown = summarizeCoverage(["not-a-problem"], {});
    expect(unknown.total).toBe(0);
    expect(Number.isNaN(unknown.percent)).toBe(false);
  });

  test("dedupes ids and buckets by difficulty", () => {
    const easy = EASY[0];
    const hard = HARD[0];
    const summary = summarizeCoverage(
      [easy.id, hard.id, easy.id],
      {
        [easy.id]: { attempted: true, solved: true },
        [hard.id]: { attempted: true, solved: true },
      },
    );
    expect(summary.solved).toBe(2);
    expect(summary.total).toBe(2);
    expect(summary.percent).toBe(100);
    expect(summary.byDifficulty.Easy).toEqual({
      solved: 1,
      total: 1,
      percent: 100,
    });
    expect(summary.byDifficulty.Medium).toEqual({
      solved: 0,
      total: 0,
      percent: 0,
    });
    expect(summary.byDifficulty.Hard.percent).toBe(100);
  });

  test("partial coverage rounds to whole percentages", () => {
    const ids = PROBLEM_META.slice(0, 3).map((problem) => problem.id);
    const summary = summarizeCoverage(ids, {
      [ids[0]]: { attempted: true, solved: true },
    });
    expect(summary.solved).toBe(1);
    expect(summary.total).toBe(3);
    expect(summary.percent).toBe(33);
  });
});

describe("estimateMinutesPerProblem", () => {
  test("falls back to the default without usable pairs", () => {
    expect(estimateMinutesPerProblem({})).toBe(DEFAULT_MINUTES_PER_PROBLEM);
    expect(
      estimateMinutesPerProblem({
        [EASY[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(1) },
      }),
    ).toBe(DEFAULT_MINUTES_PER_PROBLEM);
  });

  test("uses the median open-to-solve duration", () => {
    const progress: ProgressMap = {};
    const minutes = [30, 60, 120];
    minutes.forEach((value, index) => {
      const problem = EASY[index];
      progress[problem.id] = {
        attempted: true,
        solved: true,
        lastOpened: new Date(NOW.getTime() - value * 60000).toISOString(),
        solvedAt: NOW.toISOString(),
      };
    });
    expect(estimateMinutesPerProblem(progress)).toBe(60);
  });

  test("clamps outliers into the sane band", () => {
    const fast: ProgressMap = {
      [EASY[0].id]: {
        attempted: true,
        solved: true,
        lastOpened: new Date(NOW.getTime() - 60000).toISOString(),
        solvedAt: NOW.toISOString(),
      },
    };
    const slow: ProgressMap = {
      [EASY[1].id]: {
        attempted: true,
        solved: true,
        lastOpened: new Date(NOW.getTime() - 200 * 60000).toISOString(),
        solvedAt: NOW.toISOString(),
      },
    };
    expect(estimateMinutesPerProblem(fast)).toBe(MIN_MINUTES_PER_PROBLEM);
    expect(estimateMinutesPerProblem(slow)).toBe(MAX_MINUTES_PER_PROBLEM);
  });
});

/* ───────────────────────────── projection ───────────────────────────────── */

function projectionInput(
  overrides: Partial<ProjectionInput>,
): ProjectionInput {
  return {
    now: NOW,
    solved: 0,
    total: 100,
    solvesInPaceWindow: 0,
    goal: { targetDate: null, weeklyHours: null },
    minutesPerProblem: 60,
    ...overrides,
  };
}

describe("projectReadiness", () => {
  test("no target date reports no goal", () => {
    const projection = projectReadiness(projectionInput({}));
    expect(projection.status).toBe("no-goal");
    expect(projection.remaining).toBe(100);
    expect(projection.requiredPerWeek).toBeNull();
    expect(projection.earliest).toBeNull();
    expect(projection.latest).toBeNull();
  });

  test("target already met reports complete with no window", () => {
    const projection = projectReadiness(
      projectionInput({
        solved: 100,
        goal: { targetDate: keyDaysAhead(14), weeklyHours: null },
      }),
    );
    expect(projection.status).toBe("complete");
    expect(projection.remaining).toBe(0);
    expect(projection.requiredPerWeek).toBe(0);
    expect(projection.earliest).toBeNull();
    expect(projection.latest).toBeNull();
  });

  test("zero pace against a near date is unattainable", () => {
    const projection = projectReadiness(
      projectionInput({
        total: 100,
        goal: { targetDate: keyDaysAhead(14), weeklyHours: null },
      }),
    );
    expect(projection.status).toBe("behind");
    expect(projection.daysRemaining).toBe(14);
    expect(projection.requiredPerWeek).toBe(50);
    expect(projection.currentPerWeek).toBe(0);
    expect(projection.behindPerWeek).toBe(50);
    expect(projection.earliest).toBeNull();
    expect(projection.latest).toBeNull();
  });

  test("required pace versus observed pace sets the state", () => {
    const target = { targetDate: keyDaysAhead(35), weeklyHours: null };
    const onTrack = projectReadiness(
      projectionInput({
        solved: 50,
        solvesInPaceWindow: 20,
        goal: target,
      }),
    );
    expect(onTrack.requiredPerWeek).toBe(10);
    expect(onTrack.currentPerWeek).toBe(10);
    expect(onTrack.status).toBe("on-track");

    const behind = projectReadiness(
      projectionInput({
        solved: 50,
        solvesInPaceWindow: 8,
        goal: target,
      }),
    );
    expect(behind.status).toBe("behind");
    expect(behind.behindPerWeek).toBe(6);

    const ahead = projectReadiness(
      projectionInput({
        solved: 50,
        solvesInPaceWindow: 28,
        goal: target,
      }),
    );
    expect(ahead.status).toBe("ahead");
    expect(ahead.behindPerWeek).toBe(0);
  });

  test("weekly hours lift the effective pace to the plan capacity", () => {
    const projection = projectReadiness(
      projectionInput({
        solved: 50,
        goal: { targetDate: keyDaysAhead(35), weeklyHours: 10 },
      }),
    );
    expect(projection.capacityPerWeek).toBe(10);
    expect(projection.status).toBe("on-track");
    expect(projection.earliest).toBe(keyDaysAhead(28));
    expect(projection.latest).toBe(keyDaysAhead(47));
  });

  test("finish window always brackets and orders the estimates", () => {
    const projection = projectReadiness(
      projectionInput({
        solved: 0,
        solvesInPaceWindow: 21,
        goal: { targetDate: keyDaysAhead(120), weeklyHours: null },
      }),
    );
    expect(projection.earliest).not.toBeNull();
    expect(projection.latest).not.toBeNull();
    expect(projection.earliest! <= projection.latest!).toBe(true);
  });

  test("a past target date is behind without a division-by-zero", () => {
    const projection = projectReadiness(
      projectionInput({
        solved: 0,
        goal: { targetDate: keyDaysAhead(-3), weeklyHours: null },
      }),
    );
    expect(projection.status).toBe("behind");
    expect(projection.daysRemaining).toBe(-3);
    expect(projection.requiredPerWeek).toBeNull();
    expect(Number.isNaN(projection.currentPerWeek)).toBe(false);
  });

  test("solved counts clamp to the catalogue bounds", () => {
    const over = projectReadiness(projectionInput({ solved: 500, total: 100 }));
    expect(over.solved).toBe(100);
    expect(over.remaining).toBe(0);
    const under = projectReadiness(projectionInput({ solved: -5, total: 100 }));
    expect(under.solved).toBe(0);
    expect(under.remaining).toBe(100);
  });
});

describe("getReadinessProjection", () => {
  test("reads goals and progress from the stores, deterministically", () => {
    seedProgress({
      [EASY[0].id]: {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(1),
      },
    });
    saveReadinessGoal({ targetDate: keyDaysAhead(28), weeklyHours: 4 });

    const first = getReadinessProjection(NOW);
    const second = getReadinessProjection(NOW);
    expect(first).toEqual(second);
    expect(first.status).not.toBe("no-goal");
    expect(first.solved).toBe(1);
    expect(first.currentPerWeek).toBe(0.5);
    expect(first.capacityPerWeek).not.toBeNull();
  });
});

/* ───────────────────────────── goal store ───────────────────────────────── */

describe("readiness goal store", () => {
  test("round-trips a valid goal through localStorage", () => {
    const saved = saveReadinessGoal({
      targetDate: "2026-12-01",
      weeklyHours: 6,
    });
    expect(saved).toEqual({ targetDate: "2026-12-01", weeklyHours: 6 });
    expect(getReadinessGoal()).toEqual(saved);
    expect(JSON.parse(stub.getItem(GOAL_KEY) as string)).toEqual(saved);
  });

  test("sanitizes malformed dates and impossible hours", () => {
    saveReadinessGoal({
      targetDate: "not-a-date",
      weeklyHours: 999,
    });
    expect(getReadinessGoal()).toEqual(EMPTY_READINESS_GOAL);

    saveReadinessGoal({
      targetDate: "2026-05-02T00:00:00Z",
      weeklyHours: -3,
    });
    expect(getReadinessGoal()).toEqual(EMPTY_READINESS_GOAL);

    saveReadinessGoal({ targetDate: "2026-05-02", weeklyHours: 6.25 });
    expect(getReadinessGoal()).toEqual({
      targetDate: "2026-05-02",
      weeklyHours: 6.3,
    });
  });

  test("is SSR-safe when window is unavailable", () => {
    delete (globalScope as { window?: unknown }).window;
    expect(getReadinessGoal()).toEqual(EMPTY_READINESS_GOAL);
    expect(
      saveReadinessGoal({ targetDate: "2026-12-01", weeklyHours: 4 }),
    ).toEqual({ targetDate: "2026-12-01", weeklyHours: 4 });
  });
});
