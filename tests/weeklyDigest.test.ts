import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { PROBLEMS } from "@/data/problems";
import { BUG_HUNT_STORAGE_KEY } from "@/lib/bugHunt";
import { DIFFICULTY_WEIGHTS } from "@/lib/leaderboardScores";
import type { ProblemProgress, ProgressMap } from "@/lib/progress";
import {
  REVIEWS_STORAGE_KEY,
  type ReviewMap,
  type ReviewState,
} from "@/lib/reviewQueue";
import type { RunState } from "@/lib/runs";
import {
  WEEKLY_DIGEST_DAYS,
  emptyWeeklyDigest,
  getWeeklyDigest,
  isWeeklyDigestEmpty,
} from "@/lib/weeklyDigest";

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
const RUNS_KEY = "deepforge:runs:v1";
const LABS_KEY = "deepforge:labs";
const DAILY_KEY = "deepforge:daily:v1";

/**
 * Wednesday 2026-01-14, 12:00 local. The digest window is 2026-01-08 …
 * 2026-01-14; the previous week is 2026-01-01 … 2026-01-07.
 */
const FIXED_NOW = new Date(2026, 0, 14, 12, 0, 0, 0);

function atDay(day: number, hour = 12, minute = 0): string {
  return new Date(2026, 0, day, hour, minute, 0, 0).toISOString();
}

function atDecember(day: number): string {
  return new Date(2025, 11, day, 12, 0, 0, 0).toISOString();
}

const EASY = PROBLEMS.filter((problem) => problem.difficulty === "Easy");
const MEDIUM = PROBLEMS.filter((problem) => problem.difficulty === "Medium");
const HARD = PROBLEMS.filter((problem) => problem.difficulty === "Hard");

function seedProgress(progress: ProgressMap): void {
  stub.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function seedReviews(reviews: ReviewMap): void {
  stub.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

function reviewState(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    ease: 2.5,
    interval: 1,
    due: "2026-01-20",
    reps: 1,
    lapses: 0,
    lastGrade: 4,
    lastReviewedAt: null,
    ...overrides,
  };
}

function finishedRun(
  id: string,
  startedAt: string,
  status: "finished" | "abandoned" = "finished",
): RunState {
  const start = Date.parse(startedAt);
  return {
    id,
    seed: `seed-${id}`,
    startedAt: start,
    endsAt: start + 300_000,
    problemIds: [],
    solvedIds: [],
    solvedAt: {},
    score: 0,
    status,
  };
}

/**
 * Full fixture: solves/reviews/hunts/runs/labs/daily inside the window, on
 * both previous-window boundaries, and outside both windows.
 *
 * Current window (Jan 8 … Jan 14, days 8–14):
 *   solves  EASY[0] Jan 8 00:00, EASY[1] Jan 14 23:00, MEDIUM[0] Jan 10,
 *           HARD[0] + HARD[1] Jan 12            → 5 solves, 1+1+3+5+5 = 15
 *   reviews EASY[10] Jan 14, EASY[11] Jan 8     → 2
 *   hunts   EASY[20] clean Jan 14, EASY[21] not clean Jan 8 → 2 (1 clean)
 *   runs    Jan 13, Jan 8 00:00                 → 2 finished
 *   labs    lab-a passes Jan 14 + Jan 8, lab-b pass Jan 10 → 3
 *   daily   2026-01-14, 01-13, 01-08            → 3
 *   active days: Jan 8, 10, 12, 13, 14          → 5
 *   best day: Jan 12 with 2 solves
 *
 * Previous window (Jan 1 … Jan 7):
 *   solves  EASY[2] Jan 7 23:59, MEDIUM[1] Jan 1 00:00 → 2 solves, 1+3 = 4
 *   reviews EASY[12] Jan 7 23:59                       → 1
 *   hunts   MEDIUM[10] Jan 7 (not counted by the card) → ignored
 */
function seedFullFixture(): void {
  seedProgress({
    [EASY[0].id]: { attempted: true, solved: true, solvedAt: atDay(8, 0) },
    [EASY[1].id]: {
      attempted: true,
      solved: true,
      solvedAt: atDay(14, 23),
    },
    [MEDIUM[0].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
    [HARD[0].id]: { attempted: true, solved: true, solvedAt: atDay(12) },
    [HARD[1].id]: { attempted: true, solved: true, solvedAt: atDay(12) },
    [EASY[2].id]: {
      attempted: true,
      solved: true,
      solvedAt: atDay(7, 23, 59),
    },
    [MEDIUM[1].id]: { attempted: true, solved: true, solvedAt: atDay(1, 0) },
    [HARD[2].id]: {
      attempted: true,
      solved: true,
      solvedAt: atDecember(20),
    },
    [EASY[3].id]: { attempted: true, solved: true },
    [MEDIUM[2].id]: {
      attempted: true,
      solved: true,
      solvedAt: "not-a-date",
    },
    "not-a-problem": { attempted: true, solved: true, solvedAt: atDay(10) },
  });

  seedReviews({
    [EASY[10].id]: reviewState({ lastReviewedAt: atDay(14, 0) }),
    [EASY[11].id]: reviewState({ lastReviewedAt: atDay(8, 0) }),
    [EASY[12].id]: reviewState({ lastReviewedAt: atDay(7, 23, 59) }),
    [EASY[13].id]: reviewState({ lastReviewedAt: atDecember(20) }),
  });

  stub.setItem(
    BUG_HUNT_STORAGE_KEY,
    JSON.stringify({
      [EASY[20].id]: {
        problemId: EASY[20].id,
        category: "off-by-one",
        lineOk: true,
        reasonOk: true,
        clean: true,
        at: atDay(14, 9),
      },
      [EASY[21].id]: {
        problemId: EASY[21].id,
        category: "swapped-operands",
        lineOk: false,
        reasonOk: true,
        clean: false,
        at: atDay(8, 9),
      },
      [MEDIUM[10].id]: {
        problemId: MEDIUM[10].id,
        category: "wrong-axis",
        lineOk: true,
        reasonOk: true,
        clean: true,
        at: atDay(7, 9),
      },
    }),
  );

  stub.setItem(
    RUNS_KEY,
    JSON.stringify({
      active: null,
      history: [
        finishedRun("run-in-1", atDay(13)),
        finishedRun("run-in-2", atDay(8, 0)),
        finishedRun("run-prev", atDay(7, 23)),
        finishedRun("run-abandoned", atDay(12), "abandoned"),
        finishedRun("run-epoch", new Date(0).toISOString()),
      ],
    }),
  );

  stub.setItem(
    LABS_KEY,
    JSON.stringify({
      "lab-a": {
        best: 1,
        attempts: 3,
        passed: true,
        lastScoredAt: atDay(14),
        lastScore: 1,
        recentPasses: [atDay(14), atDay(8), atDay(7)],
      },
      "lab-b": {
        best: 0.9,
        attempts: 1,
        passed: true,
        lastScoredAt: atDay(10),
        lastScore: 0.9,
        recentPasses: [atDay(10)],
      },
      "lab-c": {
        best: null,
        attempts: 1,
        passed: false,
        lastScoredAt: atDecember(20),
        recentPasses: [],
      },
    }),
  );

  stub.setItem(
    DAILY_KEY,
    JSON.stringify({
      lastSolvedDate: "2026-01-14",
      streak: 3,
      solvedDates: [
        "2026-01-14",
        "2026-01-13",
        "2026-01-08",
        "2026-01-07",
        "2025-12-25",
        "junk",
      ],
    }),
  );
}

describe("empty store", () => {
  test("returns a zeroed digest with the real window bounds", () => {
    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest).toEqual(emptyWeeklyDigest(FIXED_NOW));
    expect(WEEKLY_DIGEST_DAYS).toBe(7);
    expect(digest.windowStart).toBe("2026-01-08");
    expect(digest.windowEnd).toBe("2026-01-14");
    expect(digest.bestDay).toBeNull();
    expect(isWeeklyDigestEmpty(digest)).toBe(true);
    expect(isWeeklyDigestEmpty(emptyWeeklyDigest(FIXED_NOW))).toBe(true);
  });

  test("an invalid clock falls back to a usable window", () => {
    const digest = getWeeklyDigest(new Date(Number.NaN));
    expect(digest.windowEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(digest.windowStart < digest.windowEnd).toBe(true);
    expect(isWeeklyDigestEmpty(digest)).toBe(true);
  });
});

describe("windowed counts", () => {
  test("counts only events inside the trailing 7 local days", () => {
    seedFullFixture();
    const digest = getWeeklyDigest(FIXED_NOW);

    expect(digest.windowStart).toBe("2026-01-08");
    expect(digest.windowEnd).toBe("2026-01-14");
    expect(digest.solved).toBe(5);
    expect(digest.points).toBe(15);
    expect(digest.reviewsCompleted).toBe(2);
    expect(digest.bugHunts).toBe(2);
    expect(digest.cleanBugHunts).toBe(1);
    expect(digest.speedrunsFinished).toBe(2);
    expect(digest.labsPassed).toBe(3);
    expect(digest.dailyChainDays).toBe(3);
    expect(digest.activeDays).toBe(5);
    expect(digest.bestDay).toEqual({ date: "2026-01-12", solved: 2 });
    expect(digest.deltaVsPreviousWeek).toEqual({
      solved: 3,
      points: 11,
      reviewsCompleted: 1,
    });
    expect(isWeeklyDigestEmpty(digest)).toBe(false);
  });

  test("includes exactly the first and last day of the window", () => {
    seedProgress({
      [EASY[0].id]: {
        attempted: true,
        solved: true,
        solvedAt: new Date(2026, 0, 8, 0, 0, 0, 0).toISOString(),
      },
      [EASY[1].id]: {
        attempted: true,
        solved: true,
        solvedAt: new Date(2026, 0, 14, 23, 59, 59, 999).toISOString(),
      },
      [EASY[2].id]: {
        attempted: true,
        solved: true,
        solvedAt: new Date(2026, 0, 7, 23, 59, 59, 999).toISOString(),
      },
      [EASY[3].id]: {
        attempted: true,
        solved: true,
        solvedAt: new Date(2026, 0, 15, 0, 0, 0, 0).toISOString(),
      },
    });

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest.solved).toBe(2);
    expect(digest.points).toBe(2);
    expect(digest.deltaVsPreviousWeek.solved).toBe(1);
    expect(digest.deltaVsPreviousWeek.points).toBe(1);
    expect(digest.bestDay).toEqual({ date: "2026-01-08", solved: 1 });
  });

  test("points match the leaderboard difficulty weights", () => {
    seedFullFixture();
    const digest = getWeeklyDigest(FIXED_NOW);

    const expectedPoints =
      DIFFICULTY_WEIGHTS.Easy * 2 +
      DIFFICULTY_WEIGHTS.Medium * 1 +
      DIFFICULTY_WEIGHTS.Hard * 2;
    expect(digest.points).toBe(expectedPoints);
    expect(DIFFICULTY_WEIGHTS).toEqual({ Easy: 1, Medium: 3, Hard: 5 });
  });

  test("best-day ties keep the earliest day", () => {
    seedProgress({
      [EASY[0].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
      [EASY[1].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
      [EASY[2].id]: { attempted: true, solved: true, solvedAt: atDay(12) },
      [EASY[3].id]: { attempted: true, solved: true, solvedAt: atDay(12) },
      [MEDIUM[0].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
    });

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest.bestDay).toEqual({ date: "2026-01-10", solved: 3 });
    expect(digest.solved).toBe(5);
  });
});

describe("previous-week deltas", () => {
  test("zero when both weeks are equal", () => {
    seedProgress({
      [EASY[0].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
      [EASY[1].id]: { attempted: true, solved: true, solvedAt: atDay(5) },
    });
    seedReviews({
      [EASY[10].id]: reviewState({ lastReviewedAt: atDay(9) }),
      [EASY[11].id]: reviewState({ lastReviewedAt: atDay(4) }),
    });

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest.solved).toBe(1);
    expect(digest.reviewsCompleted).toBe(1);
    expect(digest.deltaVsPreviousWeek).toEqual({
      solved: 0,
      points: 0,
      reviewsCompleted: 0,
    });
  });

  test("negative when the previous week was stronger", () => {
    seedProgress({
      [MEDIUM[0].id]: { attempted: true, solved: true, solvedAt: atDay(10) },
      [HARD[0].id]: { attempted: true, solved: true, solvedAt: atDay(3) },
      [HARD[1].id]: { attempted: true, solved: true, solvedAt: atDay(4) },
      [HARD[2].id]: { attempted: true, solved: true, solvedAt: atDay(5) },
    });

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest.solved).toBe(1);
    expect(digest.points).toBe(3);
    expect(digest.deltaVsPreviousWeek.solved).toBe(-2);
    expect(digest.deltaVsPreviousWeek.points).toBe(-12);
    expect(digest.deltaVsPreviousWeek.reviewsCompleted).toBe(0);
  });
});

describe("malformed payloads", () => {
  test("junk in every store yields a zeroed digest without throwing", () => {
    stub.setItem(PROGRESS_KEY, "{not json");
    stub.setItem(REVIEWS_STORAGE_KEY, "[1,2,3]");
    stub.setItem(BUG_HUNT_STORAGE_KEY, "null");
    stub.setItem(RUNS_KEY, '"nope"');
    stub.setItem(LABS_KEY, "42");
    stub.setItem(DAILY_KEY, "[]");

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest).toEqual(emptyWeeklyDigest(FIXED_NOW));
    expect(digest.windowStart).toBe("2026-01-08");
    expect(digest.windowEnd).toBe("2026-01-14");
  });

  test("junk entries inside valid containers are ignored", () => {
    seedProgress({
      "not-a-problem": { attempted: true, solved: true, solvedAt: atDay(10) },
      [EASY[0].id]: "nope" as unknown as ProblemProgress,
      [EASY[1].id]: {
        attempted: true,
        solved: true,
        solvedAt: 42,
      } as unknown as ProblemProgress,
      [EASY[2].id]: null as unknown as ProblemProgress,
    });
    seedReviews({
      [EASY[10].id]: {
        lastReviewedAt: 42,
        due: 7,
        reps: Number.NaN,
        lapses: "many",
        ease: null,
        interval: -3,
        lastGrade: 9,
      } as unknown as ReviewState,
      junk: "nope" as unknown as ReviewState,
    });
    stub.setItem(
      BUG_HUNT_STORAGE_KEY,
      JSON.stringify({
        [EASY[20].id]: {
          problemId: EASY[20].id,
          category: "not-a-category",
          at: atDay(10),
        },
        [EASY[21].id]: { at: 42 },
      }),
    );
    stub.setItem(
      RUNS_KEY,
      JSON.stringify({
        history: [
          { status: "finished", startedAt: "yesterday" },
          null,
          42,
          { status: "active", startedAt: Date.parse(atDay(10)) },
        ],
        active: null,
      }),
    );
    stub.setItem(
      LABS_KEY,
      JSON.stringify({
        "lab-x": {
          best: "x",
          attempts: "many",
          passed: "yes",
          lastScoredAt: 42,
          recentPasses: [42, "nope", null],
        },
      }),
    );
    stub.setItem(
      DAILY_KEY,
      JSON.stringify({
        lastSolvedDate: 42,
        streak: "three",
        solvedDates: [42, "2026-13-99", "2026-02-30", "2026-01-10"],
      }),
    );

    const digest = getWeeklyDigest(FIXED_NOW);
    expect(digest.solved).toBe(0);
    expect(digest.points).toBe(0);
    expect(digest.reviewsCompleted).toBe(0);
    expect(digest.bugHunts).toBe(0);
    expect(digest.speedrunsFinished).toBe(0);
    expect(digest.labsPassed).toBe(0);
    // The only usable daily key still marks the day and the chain.
    expect(digest.dailyChainDays).toBe(1);
    expect(digest.activeDays).toBe(1);
    expect(digest.bestDay).toBeNull();
  });
});

describe("determinism", () => {
  test("same fixture and clock produce identical digests", () => {
    seedFullFixture();
    const first = getWeeklyDigest(FIXED_NOW);
    const second = getWeeklyDigest(FIXED_NOW);
    expect(second).toEqual(first);

    const progress = JSON.parse(
      stub.getItem(PROGRESS_KEY) as string,
    ) as ProgressMap;
    const reversed = Object.fromEntries(
      Object.entries(progress).reverse(),
    ) as ProgressMap;
    seedProgress(reversed);
    expect(getWeeklyDigest(FIXED_NOW)).toEqual(first);
  });
});
