import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getActivityTrend,
  getCategoryBreakdown,
  getDifficultyBreakdown,
  getEstimatedMastery,
  getOverview,
  getRecords,
  getTimeOfDay,
} from "@/lib/stats";
import { CATEGORIES, PROBLEMS } from "@/data/problems";
import { FIRST_SOLVE_BONUS, XP_BASE } from "@/lib/badges";
import { getDailyDateKey } from "@/lib/daily";
import type { ProgressMap } from "@/lib/progress";

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

const EASY = PROBLEMS.filter((problem) => problem.difficulty === "Easy");
const MEDIUM = PROBLEMS.filter((problem) => problem.difficulty === "Medium");
const HARD = PROBLEMS.filter((problem) => problem.difficulty === "Hard");

function seedProgress(progress: ProgressMap): void {
  stub.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function atDaysAgo(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function atHour(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function keyDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getDailyDateKey(date);
}

describe("empty store", () => {
  test("overview returns exact zeros without NaN", () => {
    const overview = getOverview();
    expect(overview.solved).toBe(0);
    expect(overview.attempted).toBe(0);
    expect(overview.total).toBe(PROBLEMS.length);
    expect(overview.accuracy).toBe(0);
    expect(Number.isNaN(overview.accuracy)).toBe(false);
    expect(overview.solvedToday).toBe(0);
    expect(overview.solvedThisWeek).toBe(0);
    expect(overview.currentStreak).toBe(0);
    expect(overview.longestStreak).toBe(0);
    expect(overview.xp).toBe(0);
    expect(overview.level).toBe(1);
    expect(overview.levelTitle).toBe("Novice");
    expect(overview.labsPassed).toBe(0);
    expect(overview.researchBeaten).toBe(0);
    expect(overview.conceptsMastered).toBe(0);
    expect(overview.contestsPlayed).toBe(0);
  });

  test("breakdowns, trend, and time buckets are zero-filled", () => {
    const categories = getCategoryBreakdown();
    expect(categories).toHaveLength(CATEGORIES.length);
    for (const row of categories) {
      expect(row.solved).toBe(0);
      expect(row.percent).toBe(0);
      expect(row.avgDifficulty).toBe(0);
      expect(Number.isNaN(row.percent)).toBe(false);
    }

    const difficulties = getDifficultyBreakdown();
    expect(difficulties.map((row) => row.difficulty)).toEqual([
      "Easy",
      "Medium",
      "Hard",
    ]);
    for (const row of difficulties) {
      expect(row.solved).toBe(0);
      expect(row.percent).toBe(0);
      expect(Number.isNaN(row.percent)).toBe(false);
    }

    const trend = getActivityTrend(30);
    expect(trend).toHaveLength(30);
    for (const day of trend) expect(day.count).toBe(0);

    const buckets = getTimeOfDay();
    expect(buckets.map((bucket) => bucket.label)).toEqual([
      "0-5",
      "6-11",
      "12-17",
      "18-23",
    ]);
    for (const bucket of buckets) expect(bucket.count).toBe(0);
  });

  test("records and mastery start empty", () => {
    expect(getRecords()).toEqual({
      fastestFirstSolve: null,
      longestDailyStreak: 0,
      mostActiveDay: null,
      hardestSolved: 0,
      firstSolvedAt: null,
      lastSolvedAt: null,
    });

    const mastery = getEstimatedMastery();
    expect(mastery.value).toBe(0);
    expect(mastery.coverage).toBe(0);
    expect(mastery.depth).toBe(0);
    expect(mastery.recency).toBe(0);
  });
});

describe("seeded fixture", () => {
  test("overview reports exact counts, accuracy, streaks, and XP", () => {
    const easy = EASY.slice(0, 2);
    const medium = MEDIUM[0];
    const hard = HARD.slice(0, 2);
    const attemptedOnly = MEDIUM[1];

    const progress: ProgressMap = {
      [easy[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [easy[1].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [medium.id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [hard[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(1) },
      [hard[1].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(3) },
      [attemptedOnly.id]: { attempted: true, lastOpened: atDaysAgo(0, 9) },
    };
    seedProgress(progress);

    stub.setItem(
      "deepforge:labs",
      JSON.stringify({
        "lab-a": { best: 1, attempts: 2, passed: true },
        "lab-b": { best: 0.1, attempts: 1, passed: false },
      }),
    );
    stub.setItem(
      "deepforge:research:v1",
      JSON.stringify({
        alpha: {
          bestScore: 1,
          bestAt: atDaysAgo(0),
          beatenBaseline: true,
          attempts: [],
        },
        beta: {
          bestScore: 0.1,
          bestAt: atDaysAgo(0),
          beatenBaseline: false,
          attempts: [],
        },
      }),
    );
    stub.setItem(
      "deepforge:contests:v1",
      JSON.stringify([
        {
          contestId: "contest-a",
          score: 4,
          solved: 2,
          total: 3,
          durationSeconds: 300,
          completedAt: atDaysAgo(0),
        },
      ]),
    );

    const overview = getOverview();
    expect(overview.solved).toBe(5);
    expect(overview.attempted).toBe(6);
    expect(overview.accuracy).toBe(5 / 6);
    expect(overview.solvedToday).toBe(3);
    expect(overview.solvedThisWeek).toBe(5);
    expect(overview.currentStreak).toBe(2);
    expect(overview.longestStreak).toBe(2);
    expect(overview.labsPassed).toBe(1);
    expect(overview.researchBeaten).toBe(1);
    expect(overview.conceptsMastered).toBe(0);
    expect(overview.contestsPlayed).toBe(1);

    const expectedXp =
      2 * (XP_BASE.Easy + FIRST_SOLVE_BONUS.Easy) +
      1 * (XP_BASE.Medium + FIRST_SOLVE_BONUS.Medium) +
      2 * (XP_BASE.Hard + FIRST_SOLVE_BONUS.Hard) +
      100 +
      50;
    expect(overview.xp).toBe(expectedXp);
    expect(overview.xp).toBe(355);
    expect(overview.level).toBe(3);
    expect(overview.levelTitle).toBe("Novice");
  });

  test("difficulty breakdown counts solved problems per tier", () => {
    const progress: ProgressMap = {
      [EASY[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [EASY[1].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [MEDIUM[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [HARD[0].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [HARD[1].id]: { attempted: true, solved: true, solvedAt: atDaysAgo(0) },
      [MEDIUM[1].id]: { attempted: true },
    };
    seedProgress(progress);

    const rows = getDifficultyBreakdown();
    const byDifficulty = new Map(rows.map((row) => [row.difficulty, row]));
    expect(byDifficulty.get("Easy")!.solved).toBe(2);
    expect(byDifficulty.get("Easy")!.total).toBe(EASY.length);
    expect(byDifficulty.get("Easy")!.percent).toBe((2 / EASY.length) * 100);
    expect(byDifficulty.get("Medium")!.solved).toBe(1);
    expect(byDifficulty.get("Medium")!.total).toBe(MEDIUM.length);
    expect(byDifficulty.get("Hard")!.solved).toBe(2);
    expect(byDifficulty.get("Hard")!.total).toBe(HARD.length);
    expect(byDifficulty.get("Hard")!.percent).toBe((2 / HARD.length) * 100);
  });

  test("activity trend has the requested length and zero-fills gaps", () => {
    const solvedToday = EASY.slice(0, 3);
    const solvedThreeDaysAgo = EASY.slice(3, 5);
    const progress: ProgressMap = {};
    for (const problem of solvedToday) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(0),
      };
    }
    for (const problem of solvedThreeDaysAgo) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(3),
      };
    }
    seedProgress(progress);

    const trend = getActivityTrend(7);
    expect(trend).toHaveLength(7);
    const byDate = new Map(trend.map((day) => [day.date, day.count]));
    const todayKey = getDailyDateKey(new Date());
    expect(byDate.get(todayKey)).toBe(3);
    expect(byDate.get(keyDaysAgo(3))).toBe(2);
    expect(trend[trend.length - 1].date).toBe(todayKey);
    expect(trend.reduce((sum, day) => sum + day.count, 0)).toBe(5);
    expect(trend.filter((day) => day.count === 0)).toHaveLength(5);

    const single = getActivityTrend(0);
    expect(single).toHaveLength(1);
    expect(single[0].count).toBe(3);
  });

  test("time-of-day buckets partition every dated solve", () => {
    const hours = [2, 4, 13, 22, 23];
    const progress: ProgressMap = {};
    hours.forEach((hour, index) => {
      progress[EASY[index].id] = {
        attempted: true,
        solved: true,
        solvedAt: atHour(hour),
      };
    });
    progress[MEDIUM[0].id] = {
      attempted: true,
      solved: true,
      solvedAt: "not-a-date",
    };
    seedProgress(progress);

    const buckets = getTimeOfDay();
    expect(buckets.map((bucket) => bucket.count)).toEqual([2, 0, 1, 2]);
    expect(buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(
      hours.length,
    );
  });

  test("mastery matches the documented weighted formula", () => {
    const solved = [...EASY.slice(0, 2), MEDIUM[0], ...HARD.slice(0, 2)];
    const progress: ProgressMap = {};
    for (const problem of solved) {
      progress[problem.id] = {
        attempted: true,
        solved: true,
        solvedAt: atDaysAgo(0),
      };
    }
    const oldHard = HARD[5];
    progress[oldHard.id] = {
      attempted: true,
      solved: true,
      solvedAt: atDaysAgo(30),
    };
    seedProgress(progress);

    const total = PROBLEMS.length;
    const hardTotal = HARD.length;
    const solvedTotal = solved.length + 1;
    const hardSolved = 3;
    const recentSolves = 5;

    const coverage = solvedTotal / total;
    const depth = hardSolved / hardTotal;
    const recency = Math.min(1, recentSolves / 7);
    const expectedValue = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 * (0.45 * coverage + 0.35 * depth + 0.2 * recency),
        ),
      ),
    );

    const mastery = getEstimatedMastery();
    expect(mastery.value).toBe(expectedValue);
    expect(mastery.coverage).toBe(Math.round(coverage * 100));
    expect(mastery.depth).toBe(Math.round(depth * 100));
    expect(mastery.recency).toBe(Math.round(recency * 100));
    expect(mastery.value).toBeGreaterThanOrEqual(0);
    expect(mastery.value).toBeLessThanOrEqual(100);
  });

  test("records pick the fastest solve and activity extremes", () => {
    const now = Date.now();
    const fast = EASY[0];
    const slow = EASY[1];
    const hard = HARD[0];
    const fastAt = new Date(now).toISOString();
    const slowAt = new Date(now - 86_400_000).toISOString();
    const hardAt = new Date(now - 5 * 86_400_000).toISOString();

    seedProgress({
      [fast.id]: {
        attempted: true,
        solved: true,
        solvedAt: fastAt,
        lastOpened: new Date(now - 60_000).toISOString(),
      },
      [slow.id]: {
        attempted: true,
        solved: true,
        solvedAt: slowAt,
        lastOpened: new Date(now - 86_400_000 - 300_000).toISOString(),
      },
      [hard.id]: { attempted: true, solved: true, solvedAt: hardAt },
    });

    const records = getRecords();
    expect(records.fastestFirstSolve).toEqual({
      problemId: fast.id,
      title: fast.title,
      durationMs: 60_000,
    });
    expect(records.hardestSolved).toBe(1);
    expect(records.firstSolvedAt).toBe(hardAt);
    expect(records.lastSolvedAt).toBe(fastAt);
    expect(records.longestDailyStreak).toBe(2);
    expect(records.mostActiveDay).toEqual({
      date: getDailyDateKey(new Date(now)),
      count: 1,
    });
  });
});
