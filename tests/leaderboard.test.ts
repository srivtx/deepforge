import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getWeekKey,
  getWeeklyLeaderboard,
  getWeeklyScore,
  type WeeklyLeaderboardEntry,
} from "@/lib/leaderboardScores";
import { PROBLEM_META } from "@/data/problems/problem-meta";
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
const EASY = PROBLEM_META.filter((problem) => problem.difficulty === "Easy");
const MEDIUM = PROBLEM_META.filter((problem) => problem.difficulty === "Medium");
const HARD = PROBLEM_META.filter((problem) => problem.difficulty === "Hard");

/** Wednesday of the local week Mon 2026-09-14 → Sun 2026-09-20. */
const NOW = new Date(2026, 8, 16, 12, 0, 0);

function isoAt(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  second = 0,
): string {
  return new Date(year, month, day, hour, minute, second).toISOString();
}

function seedProgress(progress: ProgressMap): void {
  stub.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function solvedAt(
  ids: { id: string }[],
  iso: string,
): ProgressMap {
  const map: ProgressMap = {};
  for (const problem of ids) {
    map[problem.id] = { solved: true, solvedAt: iso };
  }
  return map;
}

function youOf(now: Date = NOW): WeeklyLeaderboardEntry {
  const row = getWeeklyLeaderboard(now).find((entry) => entry.isYou);
  if (!row) throw new Error("weekly leaderboard is missing the you row");
  return row;
}

function botsOf(now: Date = NOW): WeeklyLeaderboardEntry[] {
  return getWeeklyLeaderboard(now).filter((entry) => !entry.isYou);
}

describe("getWeekKey", () => {
  test("is stable Monday through Sunday and increments on Monday", () => {
    const monday = getWeekKey(new Date(2026, 8, 14, 0, 0, 0));
    expect(getWeekKey(new Date(2026, 8, 16, 12))).toBe(monday);
    expect(getWeekKey(new Date(2026, 8, 20, 23, 59, 59))).toBe(monday);
    expect(getWeekKey(new Date(2026, 8, 21, 0, 0, 0))).toBe(monday + 1);
  });

  test("keeps one key across month and year rollovers", () => {
    expect(getWeekKey(new Date(2026, 8, 30))).toBe(
      getWeekKey(new Date(2026, 9, 4)),
    );
    const december = getWeekKey(new Date(2026, 11, 28));
    expect(getWeekKey(new Date(2027, 0, 3, 23, 59, 59))).toBe(december);
    expect(getWeekKey(new Date(2027, 0, 4))).toBe(december + 1);
  });
});

describe("getWeeklyScore", () => {
  test("sums difficulty weights for solves inside the week only", () => {
    const progress: ProgressMap = {
      ...solvedAt([EASY[0], EASY[1]], isoAt(2026, 8, 16, 9)),
      ...solvedAt([MEDIUM[0]], isoAt(2026, 8, 15, 9)),
      ...solvedAt([HARD[0]], isoAt(2026, 8, 20, 23, 59, 59)),
      ...solvedAt([EASY[2]], isoAt(2026, 8, 13, 23, 59, 59)),
      ...solvedAt([MEDIUM[1]], isoAt(2026, 8, 21, 0, 0, 0)),
    };

    expect(getWeeklyScore(progress, NOW)).toEqual({ score: 10, solved: 4 });
  });

  test("counts Monday 00:00 and Sunday 23:59:59, nothing outside", () => {
    const mondayMidnight = solvedAt([MEDIUM[0]], isoAt(2026, 8, 14, 0, 0, 0));
    const sundayBefore = solvedAt([MEDIUM[0]], isoAt(2026, 8, 13, 23, 59, 59));
    const sundayEnd = solvedAt([HARD[0]], isoAt(2026, 8, 20, 23, 59, 59));
    const nextMonday = solvedAt([HARD[0]], isoAt(2026, 8, 21, 0, 0, 0));

    expect(getWeeklyScore(mondayMidnight, NOW)).toEqual({
      score: 3,
      solved: 1,
    });
    expect(getWeeklyScore(sundayBefore, NOW)).toEqual({ score: 0, solved: 0 });
    expect(getWeeklyScore(sundayEnd, NOW)).toEqual({ score: 5, solved: 1 });
    expect(getWeeklyScore(nextMonday, NOW)).toEqual({ score: 0, solved: 0 });
  });

  test("ignores unsolved, undated and unparseable entries", () => {
    const progress: ProgressMap = {
      [EASY[0].id]: { solved: false, solvedAt: isoAt(2026, 8, 16) },
      [EASY[1].id]: { solved: true },
      [MEDIUM[0].id]: { solvedAt: isoAt(2026, 8, 16) },
      [HARD[0].id]: { solved: true, solvedAt: "not-a-date" },
    };

    expect(getWeeklyScore(progress, NOW)).toEqual({ score: 0, solved: 0 });
  });

  test("handles a week spanning a month rollover", () => {
    // Mon 2026-09-28 → Sun 2026-10-04, observed from Wednesday 2026-09-30.
    const now = new Date(2026, 8, 30, 12);
    const inside: ProgressMap = {
      ...solvedAt([EASY[0]], isoAt(2026, 8, 29, 10)),
      ...solvedAt([MEDIUM[0]], isoAt(2026, 9, 1, 10)),
      ...solvedAt([HARD[0]], isoAt(2026, 9, 4, 23, 59)),
    };
    const before = solvedAt([EASY[1]], isoAt(2026, 8, 27, 23, 59));
    const after = solvedAt([EASY[1]], isoAt(2026, 9, 5, 0, 0, 0));

    expect(getWeeklyScore(inside, now)).toEqual({ score: 9, solved: 3 });
    expect(getWeeklyScore(before, now)).toEqual({ score: 0, solved: 0 });
    expect(getWeeklyScore(after, now)).toEqual({ score: 0, solved: 0 });
  });

  test("handles a week spanning a year rollover", () => {
    // Mon 2026-12-28 → Sun 2027-01-03, observed from Wednesday 2026-12-30.
    const now = new Date(2026, 11, 30, 12);
    const inside: ProgressMap = {
      ...solvedAt([EASY[0]], isoAt(2026, 11, 31, 23, 59, 59)),
      ...solvedAt([MEDIUM[0]], isoAt(2027, 0, 1, 0, 0, 0)),
      ...solvedAt([HARD[0]], isoAt(2027, 0, 3, 12)),
    };
    const before = solvedAt([EASY[1]], isoAt(2026, 11, 27, 23, 59));
    const after = solvedAt([EASY[1]], isoAt(2027, 0, 4, 0, 0, 0));

    expect(getWeeklyScore(inside, now)).toEqual({ score: 9, solved: 3 });
    expect(getWeeklyScore(before, now)).toEqual({ score: 0, solved: 0 });
    expect(getWeeklyScore(after, now)).toEqual({ score: 0, solved: 0 });
  });
});

describe("getWeeklyLeaderboard", () => {
  test("carries weekly fields alongside the all-time shape", () => {
    seedProgress({
      ...solvedAt([EASY[0]], isoAt(2026, 8, 16, 9)),
      ...solvedAt([MEDIUM[0]], isoAt(2026, 8, 16, 10)),
      ...solvedAt([HARD[0]], isoAt(2026, 8, 16, 11)),
      ...solvedAt([EASY[1]], isoAt(2026, 8, 10, 9)),
    });

    const you = youOf();
    expect(you.weeklyScore).toBe(9);
    expect(you.weeklySolved).toBe(3);
    expect(you.score).toBe(10);
    expect(you.solved).toBe(4);
    expect(you.isYou).toBe(true);
  });

  test("with no solves this week you sit last with zero weekly output", () => {
    const board = getWeeklyLeaderboard(NOW);
    const you = board[board.length - 1];

    expect(you.isYou).toBe(true);
    expect(you.weeklyScore).toBe(0);
    expect(you.weeklySolved).toBe(0);
    expect(board.filter((entry) => entry.weeklySolved === 0)).toHaveLength(1);
  });

  test("solving this week moves you up the board", () => {
    const emptyRank =
      getWeeklyLeaderboard(NOW).findIndex((entry) => entry.isYou) + 1;

    seedProgress(
      solvedAt([HARD[0], HARD[1], HARD[2], HARD[3]], isoAt(2026, 8, 16, 12)),
    );
    const board = getWeeklyLeaderboard(NOW);
    const rank = board.findIndex((entry) => entry.isYou) + 1;

    expect(youOf().weeklyScore).toBe(20);
    expect(rank).toBeLessThan(emptyRank);
  });

  test("rows sort by weekly points, then weekly solved", () => {
    seedProgress(
      solvedAt([MEDIUM[0], MEDIUM[1], HARD[0]], isoAt(2026, 8, 16, 12)),
    );
    const board = getWeeklyLeaderboard(NOW);

    for (let i = 1; i < board.length; i += 1) {
      const previous = board[i - 1];
      const current = board[i];
      expect(previous.weeklyScore).toBeGreaterThanOrEqual(current.weeklyScore);
      if (previous.weeklyScore === current.weeklyScore) {
        expect(previous.weeklySolved).toBeGreaterThanOrEqual(
          current.weeklySolved,
        );
      }
    }
  });

  test("bot output is identical across every day of the same week", () => {
    const monday = botsOf(new Date(2026, 8, 14, 0, 0, 0));
    const wednesday = botsOf(new Date(2026, 8, 16, 12));
    const sunday = botsOf(new Date(2026, 8, 20, 23, 59, 59));

    expect(wednesday).toEqual(monday);
    expect(sunday).toEqual(monday);
  });

  test("bot output rotates when the week changes", () => {
    const week = botsOf(new Date(2026, 8, 16, 12));
    const next = botsOf(new Date(2026, 8, 21, 0, 0, 0));

    expect(next.map((bot) => [bot.weeklyScore, bot.weeklySolved])).not.toEqual(
      week.map((bot) => [bot.weeklyScore, bot.weeklySolved]),
    );
    expect(next.map((bot) => bot.name).sort()).toEqual(
      week.map((bot) => bot.name).sort(),
    );
    for (let i = 0; i < week.length; i += 1) {
      expect(week[i].weeklySolved).toBeGreaterThan(0);
      expect(week[i].weeklyScore).toBeGreaterThan(0);
      expect(week[i].weeklySolved).toBeLessThanOrEqual(week[i].solved);
      expect(week[i].weeklyScore).toBeLessThanOrEqual(week[i].score);
    }
  });

  test("an exact tie ranks bots above you and repeats are stable", () => {
    const target = botsOf(NOW).find((bot) => {
      const difference = bot.weeklyScore - bot.weeklySolved;
      return difference >= 0 && difference % 2 === 0;
    });
    expect(target).not.toBeUndefined();
    if (!target) throw new Error("no weekly bot can be tied exactly");

    // Reproduce the bot's weekly (score, solved) exactly with real fixtures:
    // m mediums and e easies where e + 3m = score and e + m = solved.
    const mediumCount = (target.weeklyScore - target.weeklySolved) / 2;
    const easyCount = target.weeklySolved - mediumCount;
    expect(easyCount).toBeGreaterThanOrEqual(0);
    expect(easyCount).toBeLessThanOrEqual(EASY.length);
    expect(mediumCount).toBeLessThanOrEqual(MEDIUM.length);

    seedProgress({
      ...solvedAt(EASY.slice(0, easyCount), isoAt(2026, 8, 16, 10)),
      ...solvedAt(MEDIUM.slice(0, mediumCount), isoAt(2026, 8, 16, 11)),
    });

    const board = getWeeklyLeaderboard(NOW);
    const you = board.find((entry) => entry.isYou);
    const tiedBot = board.find((entry) => entry.name === target.name);
    expect(you).not.toBeUndefined();
    expect(tiedBot).not.toBeUndefined();
    if (!you || !tiedBot) throw new Error("missing tie rows");

    expect(you.weeklyScore).toBe(target.weeklyScore);
    expect(you.weeklySolved).toBe(target.weeklySolved);
    expect(board.indexOf(you)).toBeGreaterThan(board.indexOf(tiedBot));
    expect(getWeeklyLeaderboard(NOW)).toEqual(board);
  });
});
