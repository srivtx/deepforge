import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  LAB_RECENT_LIMIT,
  REVIEW_HEALTH_LAPSE_LIMIT,
  REVIEW_HEALTH_TREND_DAYS,
  deriveLabStats,
  deriveResearchStats,
  emptyLabStats,
  emptyResearchStats,
  emptyReviewHealth,
  getActivityTrend,
  getCategoryBreakdown,
  getDifficultyBreakdown,
  getEstimatedMastery,
  getLabStats,
  getOverview,
  getRecords,
  getResearchStats,
  getReviewHealth,
  getTimeOfDay,
} from "@/lib/stats";
import { LABS } from "@/data/labs";
import { CATEGORIES, PROBLEMS } from "@/data/problems";
import { RESEARCH_CHALLENGES } from "@/data/research";
import {
  earnedBadges,
  FIRST_SOLVE_BONUS,
  getDailyQuests,
  getTotals,
  XP_BASE,
  type BadgeSnapshot,
} from "@/lib/badges";
import { getDailyDateKey } from "@/lib/daily";
import { meetsTarget, type LabRecords } from "@/lib/labs";
import type { ProgressMap } from "@/lib/progress";
import type { ResearchState } from "@/lib/research";
import {
  REVIEWS_STORAGE_KEY,
  type ReviewMap,
  type ReviewState,
} from "@/lib/reviewQueue";

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

function seedReviews(reviews: ReviewMap): void {
  stub.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

const FIXED_NOW = new Date(2026, 0, 14, 12, 0, 0, 0);

function fixedIso(year: number, month: number, day: number): string {
  return new Date(year, month, day, 12, 0, 0, 0).toISOString();
}

function reviewState(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    ease: 2.5,
    interval: 1,
    due: "2026-01-14",
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

function idsFor(category: string, count: number): string[] {
  return PROBLEMS.filter((problem) => problem.category === category)
    .slice(0, count)
    .map((problem) => problem.id);
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

describe("review health", () => {
  test("empty state is zeroed with a 28-day trend ending today", () => {
    const health = getReviewHealth(FIXED_NOW);
    expect(health.buckets).toEqual({
      due: 0,
      learning: 0,
      new: 0,
      scheduled: 0,
    });
    expect(health.lapsesByCategory).toEqual([]);
    expect(health.nextDue).toBeNull();
    expect(health.completionTrend).toHaveLength(REVIEW_HEALTH_TREND_DAYS);
    for (const day of health.completionTrend) expect(day.count).toBe(0);
    expect(health.completionTrend[0].date).toBe("2025-12-18");
    expect(health.completionTrend[REVIEW_HEALTH_TREND_DAYS - 1].date).toBe(
      "2026-01-14",
    );
    expect(health).toEqual(emptyReviewHealth(FIXED_NOW));
  });

  test("maps stored states onto the queue's four buckets", () => {
    const ids = EASY.slice(0, 6).map((problem) => problem.id);
    seedReviews({
      [ids[0]]: reviewState(), // reps 0, due today → learning
      [ids[1]]: reviewState({ due: "2026-01-20" }), // reps 0, future → new
      [ids[2]]: reviewState({ reps: 2 }), // reviewed, due today → due
      [ids[3]]: reviewState({ reps: 2, due: "2026-01-20" }), // scheduled
      [ids[4]]: reviewState({ due: "2026-01-13" }), // overdue first review
      [ids[5]]: reviewState({ reps: 1, due: "2026-01-13" }), // overdue review
    });

    expect(getReviewHealth(FIXED_NOW).buckets).toEqual({
      due: 2,
      learning: 2,
      new: 1,
      scheduled: 1,
    });
  });

  test("ranks lapses descending with a stable category tie-break", () => {
    const la = idsFor("Linear Algebra", 1);
    const ca = idsFor("Calculus", 2);
    const st = idsFor("Statistics", 1);
    const pr = idsFor("Probability", 1);
    seedReviews({
      [la[0]]: reviewState({ reps: 2, lapses: 5 }),
      [ca[0]]: reviewState({ reps: 2, lapses: 2, due: "2026-01-20" }),
      [ca[1]]: reviewState({ reps: 1, lapses: 1, due: "2026-01-13" }),
      [st[0]]: reviewState({ reps: 0, lapses: 3 }),
      [pr[0]]: reviewState({ reps: 2, lapses: 1, due: "2026-01-20" }),
    });

    const health = getReviewHealth(FIXED_NOW);
    expect(health.lapsesByCategory).toEqual([
      { category: "Linear Algebra", lapses: 5, due: 1 },
      { category: "Calculus", lapses: 3, due: 1 },
      { category: "Statistics", lapses: 3, due: 1 },
      { category: "Probability", lapses: 1, due: 0 },
    ]);
  });

  test("caps the lapse list at the top five categories", () => {
    const lapsed = [
      "Algorithms",
      "Calculus",
      "Deep Learning",
      "Linear Algebra",
      "NLP",
      "Probability",
    ];
    const reviews: ReviewMap = {};
    for (const category of lapsed) {
      const [id] = idsFor(category, 1);
      reviews[id] = reviewState({
        reps: 2,
        lapses: 1,
        due: "2026-02-01",
      });
    }
    seedReviews(reviews);

    const rows = getReviewHealth(FIXED_NOW).lapsesByCategory;
    expect(rows).toHaveLength(REVIEW_HEALTH_LAPSE_LIMIT);
    expect(rows.map((row) => row.category)).toEqual([
      "Algorithms",
      "Calculus",
      "Deep Learning",
      "Linear Algebra",
      "NLP",
    ]);
    for (const row of rows) expect(row.due).toBe(0);
  });

  test("builds the completion trend from lastReviewedAt, oldest first", () => {
    const ids = EASY.slice(0, 6).map((problem) => problem.id);
    seedReviews({
      [ids[0]]: reviewState({ reps: 1, lastReviewedAt: fixedIso(2026, 0, 14) }),
      [ids[1]]: reviewState({ reps: 1, lastReviewedAt: fixedIso(2026, 0, 14) }),
      [ids[2]]: reviewState({ reps: 1, lastReviewedAt: fixedIso(2026, 0, 11) }),
      [ids[3]]: reviewState({ reps: 1, lastReviewedAt: fixedIso(2025, 11, 18) }),
      [ids[4]]: reviewState({ reps: 1, lastReviewedAt: fixedIso(2025, 11, 17) }),
      [ids[5]]: reviewState({ reps: 1, lastReviewedAt: "not-a-date" }),
    });

    const trend = getReviewHealth(FIXED_NOW).completionTrend;
    expect(trend).toHaveLength(REVIEW_HEALTH_TREND_DAYS);
    expect(trend[0].date).toBe("2025-12-18");
    expect(trend[REVIEW_HEALTH_TREND_DAYS - 1].date).toBe("2026-01-14");
    const byDate = new Map(trend.map((day) => [day.date, day.count]));
    expect(byDate.get("2026-01-14")).toBe(2);
    expect(byDate.get("2026-01-11")).toBe(1);
    expect(byDate.get("2025-12-18")).toBe(1);
    expect(byDate.has("2025-12-17")).toBe(false);
    expect(trend.reduce((sum, day) => sum + day.count, 0)).toBe(4);
  });

  test("nextDue points at the earliest future due date", () => {
    const ids = EASY.slice(0, 3).map((problem) => problem.id);
    seedReviews({
      [ids[0]]: reviewState({ reps: 1, due: "2026-01-13" }),
      [ids[1]]: reviewState({ reps: 1, due: "2026-01-20" }),
      [ids[2]]: reviewState({ reps: 1, due: "2026-01-18" }),
    });
    expect(getReviewHealth(FIXED_NOW).nextDue).toBe("2026-01-18");

    seedReviews({
      [ids[0]]: reviewState({ reps: 1, due: "2026-01-13" }),
      [ids[1]]: reviewState({ reps: 1, due: "2026-01-14" }),
    });
    expect(getReviewHealth(FIXED_NOW).nextDue).toBeNull();
  });

  test("degrades safely on malformed store payloads", () => {
    stub.setItem(REVIEWS_STORAGE_KEY, "{not json");
    stub.setItem(PROGRESS_KEY, "[1,2,3]");
    expect(getReviewHealth(FIXED_NOW)).toEqual(emptyReviewHealth(FIXED_NOW));

    seedReviews({
      "not-a-problem": reviewState({ reps: 2, lapses: 9 }),
      [EASY[0].id]: "nope",
      [EASY[1].id]: null,
      [EASY[2].id]: reviewState({
        lapses: Number.NaN,
        due: 5 as unknown as string,
        lastReviewedAt: 42 as unknown as string,
      }),
    } as unknown as ReviewMap);

    const health = getReviewHealth(FIXED_NOW);
    // Bad entries are dropped and NaN lapses count as zero; the unknown id
    // keeps a valid state (so it still counts in the queue buckets) but can
    // never appear in the category lapse list.
    expect(health.lapsesByCategory).toEqual([]);
    expect(health.completionTrend.every((day) => day.count === 0)).toBe(true);
    const { buckets } = health;
    expect(
      buckets.due + buckets.learning + buckets.new + buckets.scheduled,
    ).toBe(2);
  });

  test("is deterministic for the same fixture regardless of key order", () => {
    const ids = EASY.slice(0, 4).map((problem) => problem.id);
    const forward: ReviewMap = {
      [ids[0]]: reviewState({
        reps: 2,
        lapses: 2,
        due: "2026-01-20",
        lastReviewedAt: fixedIso(2026, 0, 9),
      }),
      [ids[1]]: reviewState({
        reps: 1,
        lapses: 2,
        due: "2026-01-14",
        lastReviewedAt: fixedIso(2026, 0, 12),
      }),
      [ids[2]]: reviewState({
        reps: 3,
        due: "2026-01-10",
        lastReviewedAt: fixedIso(2026, 0, 10),
      }),
      [ids[3]]: reviewState({ due: "2026-01-19" }),
    };
    const reversed = Object.fromEntries(
      Object.entries(forward).reverse(),
    ) as ReviewMap;

    seedReviews(forward);
    const first = getReviewHealth(FIXED_NOW);
    const second = getReviewHealth(FIXED_NOW);
    seedReviews(reversed);
    const third = getReviewHealth(FIXED_NOW);

    expect(second).toEqual(first);
    expect(third).toEqual(first);
  });
});

describe("lab stats", () => {
  const LABS_KEY = "deepforge:labs";

  test("empty store derives exact zeros with catalogue-sized rows", () => {
    const stats = deriveLabStats({});
    expect(stats.passed).toBe(0);
    expect(stats.metTarget).toBe(0);
    expect(stats.attempted).toBe(0);
    expect(stats.total).toBe(LABS.length);
    expect(stats.entries).toHaveLength(LABS.length);
    expect(stats.entries.every((entry) => entry.best === null)).toBe(true);
    expect(
      stats.entries.every((entry) => !entry.passed && !entry.metTarget),
    ).toBe(true);
    expect(stats.recent).toEqual([]);

    expect(emptyLabStats()).toEqual({
      passed: 0,
      total: LABS.length,
      metTarget: 0,
      attempted: 0,
      entries: [],
      recent: [],
    });
  });

  test("counts 3 of 8 labs passed with exact target matching", () => {
    const records: LabRecords = {};
    for (const lab of LABS.slice(0, 3)) {
      records[lab.id] = {
        best: lab.target,
        attempts: 2,
        passed: true,
        lastScoredAt: atDaysAgo(1),
        lastScore: lab.target,
        recentPasses: [atDaysAgo(1)],
      };
    }

    const stats = deriveLabStats(records);
    expect(stats.passed).toBe(3);
    expect(stats.metTarget).toBe(3);
    expect(stats.attempted).toBe(3);
    expect(stats.total).toBe(8);

    for (const lab of LABS.slice(0, 3)) {
      const entry = stats.entries.find((row) => row.id === lab.id)!;
      expect(entry.best).toBe(lab.target);
      expect(entry.attempts).toBe(2);
      expect(entry.passed).toBe(true);
      // Exactly at target counts as passed for both directions.
      expect(meetsTarget(lab, lab.target)).toBe(true);
      expect(entry.metTarget).toBe(true);
    }

    // Unrecorded labs stay at zero and are excluded from recent activity.
    const untouched = stats.entries.find((row) => row.id === LABS[3].id)!;
    expect(untouched.best).toBeNull();
    expect(untouched.attempts).toBe(0);
    expect(untouched.metTarget).toBe(false);
    expect(stats.recent).toHaveLength(3);
    expect(stats.recent.map((row) => row.id).sort()).toEqual(
      LABS.slice(0, 3)
        .map((lab) => lab.id)
        .sort(),
    );
  });

  test("aggregates best scores with the catalogue's direction", () => {
    const higher = LABS.find((lab) => lab.higherIsBetter)!;
    const lower = LABS.find((lab) => !lab.higherIsBetter)!;

    const records: LabRecords = {
      [higher.id]: { best: higher.target, attempts: 1, passed: true },
      [lower.id]: { best: lower.target + 0.5, attempts: 1, passed: false },
    };
    const stats = deriveLabStats(records);
    const higherEntry = stats.entries.find((row) => row.id === higher.id)!;
    const lowerEntry = stats.entries.find((row) => row.id === lower.id)!;

    expect(higherEntry.best).toBe(higher.target);
    expect(higherEntry.metTarget).toBe(true);
    expect(lowerEntry.best).toBe(lower.target + 0.5);
    expect(lowerEntry.metTarget).toBe(false);
    expect(stats.metTarget).toBe(1);
    expect(stats.passed).toBe(1);

    // Lower-is-better edge: exactly at target meets it, one unit above misses.
    const exact = deriveLabStats({
      [lower.id]: { best: lower.target, attempts: 1, passed: true },
    });
    expect(exact.entries.find((row) => row.id === lower.id)!.metTarget).toBe(
      true,
    );
    const above = deriveLabStats({
      [lower.id]: { best: lower.target + 0.5, attempts: 1, passed: false },
    });
    expect(above.entries.find((row) => row.id === lower.id)!.metTarget).toBe(
      false,
    );
  });

  test("recent runs are newest first and capped", () => {
    const records: LabRecords = {};
    LABS.forEach((lab, index) => {
      records[lab.id] = {
        best: 1,
        attempts: 1,
        passed: false,
        lastScoredAt: atDaysAgo(index),
        lastScore: index,
      };
    });

    const stats = deriveLabStats(records);
    expect(stats.recent).toHaveLength(LAB_RECENT_LIMIT);
    expect(stats.recent.map((row) => row.id)).toEqual(
      LABS.slice(0, LAB_RECENT_LIMIT).map((lab) => lab.id),
    );
    const times = stats.recent.map((row) => Date.parse(row.lastScoredAt!));
    for (let i = 1; i < times.length; i += 1) {
      expect(times[i - 1]).toBeGreaterThan(times[i]);
    }

    // Records without a valid timestamp never enter the recent list.
    const undated = deriveLabStats({
      [LABS[0].id]: { best: 1, attempts: 1, passed: false },
    });
    expect(undated.attempted).toBe(1);
    expect(undated.recent).toEqual([]);
  });

  test("malformed records degrade to zeros instead of throwing", () => {
    const stats = deriveLabStats({
      [LABS[0].id]: {
        best: Number.NaN,
        attempts: Number.NaN,
        passed: "yes",
        lastScoredAt: 42,
        lastScore: "nope",
      },
    } as unknown as LabRecords);

    const entry = stats.entries.find((row) => row.id === LABS[0].id)!;
    expect(entry.best).toBeNull();
    expect(entry.attempts).toBe(0);
    expect(entry.passed).toBe(false);
    expect(entry.metTarget).toBe(false);
    expect(entry.lastScoredAt).toBeNull();
    expect(entry.lastScore).toBeNull();
    expect(stats.passed).toBe(0);
    expect(stats.attempted).toBe(0);
  });

  test("the live wrapper reads the seeded lab store", () => {
    expect(getLabStats().passed).toBe(0);

    const lab = LABS[0];
    stub.setItem(
      LABS_KEY,
      JSON.stringify({
        [lab.id]: { best: lab.target, attempts: 3, passed: true },
      }),
    );

    const stats = getLabStats();
    expect(stats.passed).toBe(1);
    expect(stats.metTarget).toBe(1);
    expect(stats.attempted).toBe(1);
    expect(stats.entries.find((row) => row.id === lab.id)!.best).toBe(
      lab.target,
    );
  });
});

describe("research stats", () => {
  const RESEARCH_KEY = "deepforge:research:v1";

  test("empty store derives exact zeros with catalogue-sized rows", () => {
    const stats = deriveResearchStats({});
    expect(stats.beaten).toBe(0);
    expect(stats.attempted).toBe(0);
    expect(stats.total).toBe(RESEARCH_CHALLENGES.length);
    expect(stats.entries).toHaveLength(RESEARCH_CHALLENGES.length);
    expect(stats.entries.every((entry) => entry.bestScore === null)).toBe(true);
    expect(stats.entries.every((entry) => !entry.beatenBaseline)).toBe(true);

    expect(emptyResearchStats()).toEqual({
      beaten: 0,
      total: RESEARCH_CHALLENGES.length,
      attempted: 0,
      entries: [],
    });
  });

  test("counts 2 of 5 baselines beaten and keeps per-challenge bests", () => {
    const research: ResearchState = {};
    for (const challenge of RESEARCH_CHALLENGES.slice(0, 2)) {
      research[challenge.id] = {
        bestScore: challenge.higherIsBetter
          ? challenge.baselineScore + 0.1
          : challenge.baselineScore - 0.01,
        bestAt: atDaysAgo(0),
        beatenBaseline: true,
        attempts: [
          { score: challenge.baselineScore, at: atDaysAgo(2) },
          {
            score: challenge.higherIsBetter
              ? challenge.baselineScore + 0.1
              : challenge.baselineScore - 0.01,
            at: atDaysAgo(0),
          },
        ],
      };
    }

    const stats = deriveResearchStats(research);
    expect(stats.beaten).toBe(2);
    expect(stats.attempted).toBe(2);
    expect(stats.total).toBe(5);

    for (const challenge of RESEARCH_CHALLENGES.slice(0, 2)) {
      const entry = stats.entries.find((row) => row.id === challenge.id)!;
      expect(entry.title).toBe(challenge.title);
      expect(entry.baselineScore).toBe(challenge.baselineScore);
      expect(entry.bestScore).not.toBeNull();
      expect(entry.beatenBaseline).toBe(true);
      expect(entry.attempts).toBe(2);
    }

    const untouched = stats.entries.find(
      (row) => row.id === RESEARCH_CHALLENGES[2].id,
    )!;
    expect(untouched.bestScore).toBeNull();
    expect(untouched.beatenBaseline).toBe(false);
    expect(untouched.attempts).toBe(0);
  });

  test("malformed states degrade to zeros instead of throwing", () => {
    const stats = deriveResearchStats({
      [RESEARCH_CHALLENGES[0].id]: {
        bestScore: Number.NaN,
        beatenBaseline: "yes",
        attempts: null,
      },
      [RESEARCH_CHALLENGES[1].id]: null,
    } as unknown as ResearchState);

    for (const entry of stats.entries) {
      expect(entry.bestScore).toBeNull();
      expect(entry.beatenBaseline).toBe(false);
      expect(entry.attempts).toBe(0);
    }
    expect(stats.beaten).toBe(0);
    expect(stats.attempted).toBe(0);
  });

  test("the live wrapper reads the seeded research store", () => {
    expect(getResearchStats().beaten).toBe(0);

    const challenge = RESEARCH_CHALLENGES[0];
    stub.setItem(
      RESEARCH_KEY,
      JSON.stringify({
        [challenge.id]: {
          bestScore: 0.9,
          bestAt: atDaysAgo(0),
          beatenBaseline: true,
          attempts: [{ score: 0.9, at: atDaysAgo(0) }],
        },
      }),
    );

    const stats = getResearchStats();
    expect(stats.beaten).toBe(1);
    expect(stats.attempted).toBe(1);
    expect(stats.entries.find((row) => row.id === challenge.id)!.bestScore).toBe(
      0.9,
    );
  });
});

describe("badge snapshot sanitization", () => {
  function junkSnapshot(now: Date): BadgeSnapshot {
    return {
      progress: {},
      daily: { lastSolvedDate: null, streak: 0, solvedDates: [] },
      labs: {
        broken: null,
        wrongType: 42,
        empty: {},
        text: "nope",
        junkDate: { passed: "yes", lastScoredAt: 42 },
        junkPassed: { passed: 1, lastScoredAt: "2026-01-14T12:00:00.000Z" },
      },
      research: {
        alpha: null,
        beta: { attempts: null, beatenBaseline: "yes" },
      },
      contests: [],
      now,
    } as unknown as BadgeSnapshot;
  }

  test("corrupted lab and research entries never throw and earn nothing", () => {
    expect(earnedBadges(junkSnapshot(FIXED_NOW))).toHaveLength(0);

    const totals = getTotals(junkSnapshot(FIXED_NOW));
    expect(totals.badges).toBe(0);
    expect(totals.xp).toBe(0);
    expect(Number.isNaN(totals.xp)).toBe(false);

    let sawLabQuest = false;
    for (let offset = 0; offset < 30; offset += 1) {
      const day = new Date(2026, 0, 14 + offset, 12, 0, 0, 0);
      const snapshot = junkSnapshot(day);
      if (getDailyQuests(snapshot).some((quest) => quest.id === "lab")) {
        sawLabQuest = true;
      }
      getDailyQuests(snapshot);
      earnedBadges(snapshot);
    }
    expect(sawLabQuest, "expected a lab quest day in the sampled range").toBe(
      true,
    );
  });
});
