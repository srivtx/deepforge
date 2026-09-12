import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  BADGE_CATALOG,
  computeXp,
  earnedBadges,
  getDailyQuests,
  getTotals,
  type BadgeSnapshot,
} from "@/lib/badges";
import type { LabRecords } from "@/lib/labs";
import type { ProgressMap } from "@/lib/progress";
import type { ResearchState } from "@/lib/research";
import { PROBLEMS } from "@/data/problems";

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

const FIXED_NOW = new Date(2026, 0, 14, 12, 0, 0, 0);
const SOLVED_AT = new Date(2026, 0, 14, 12, 0, 0, 0).toISOString();

function emptySnapshot(now: Date = FIXED_NOW): BadgeSnapshot {
  return {
    progress: {},
    daily: { lastSolvedDate: null, streak: 0, solvedDates: [] },
    labs: {},
    research: {},
    contests: [],
    now,
  };
}

function solvedProgress(problems: { id: string }[]): ProgressMap {
  const map: ProgressMap = {};
  for (const problem of problems) {
    map[problem.id] = { attempted: true, solved: true, solvedAt: SOLVED_AT };
  }
  return map;
}

const byDifficulty = {
  easy: PROBLEMS.filter((p) => p.difficulty === "Easy"),
  medium: PROBLEMS.filter((p) => p.difficulty === "Medium"),
  hard: PROBLEMS.filter((p) => p.difficulty === "Hard"),
};

describe("badge catalog", () => {
  test("has unique ids and non-negative progress bars", () => {
    const ids = new Set(BADGE_CATALOG.map((badge) => badge.id));
    expect(ids.size).toBe(BADGE_CATALOG.length);
    expect(BADGE_CATALOG.length).toBeGreaterThan(0);

    for (const badge of BADGE_CATALOG) {
      expect(badge.name.trim().length > 0, badge.id).toBe(true);
      expect(badge.description.trim().length > 0, badge.id).toBe(true);
      const [current, target] = badge.progress(emptySnapshot());
      expect(current, badge.id).toBeGreaterThanOrEqual(0);
      expect(target, badge.id).toBeGreaterThan(0);
      expect(current, badge.id).toBeLessThanOrEqual(target);
    }
  });
});

describe("empty state", () => {
  test("earns no badges and offers three incomplete quests", () => {
    const snapshot = emptySnapshot();
    expect(earnedBadges(snapshot)).toHaveLength(0);

    const quests = getDailyQuests(snapshot);
    expect(quests).toHaveLength(3);
    expect(new Set(quests.map((quest) => quest.id)).size).toBe(3);
    for (const quest of quests) {
      expect(quest.done, quest.id).toBe(false);
      expect(quest.progress, quest.id).toBe(0);
      expect(quest.target, quest.id).toBeGreaterThan(0);
    }
  });
});

describe("earned badges", () => {
  test("a single seeded easy solve earns first-blood", () => {
    const easy = byDifficulty.easy[0];
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      progress: solvedProgress([easy]),
    };

    const earned = earnedBadges(snapshot);
    expect(earned.map((badge) => badge.id)).toEqual(["first-blood"]);
    expect(earned[0].earnedAt).toBe(SOLVED_AT);
  });

  test("a hard solve additionally earns hard-hat", () => {
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      progress: solvedProgress([
        byDifficulty.easy[0],
        byDifficulty.hard[0],
      ]),
    };

    const ids = earnedBadges(snapshot).map((badge) => badge.id);
    expect(ids).toContain("first-blood");
    expect(ids).toContain("hard-hat");
    expect(ids).not.toContain("forged-10");
  });
});

describe("XP", () => {
  test("matches an independently calculated fixture", () => {
    const easy = byDifficulty.easy.slice(0, 2);
    const medium = byDifficulty.medium[0];
    const hard = byDifficulty.hard[0];
    const solved = [...easy, medium, hard];

    const labs: LabRecords = {
      "lab-01": { best: 0.95, attempts: 4, passed: true },
      "lab-02": { best: 0.4, attempts: 2, passed: false },
      "lab-03": { best: 350, attempts: 2, passed: true },
    };
    const research: ResearchState = {
      alpha: {
        bestScore: 0.8,
        bestAt: SOLVED_AT,
        beatenBaseline: true,
        attempts: [
          { score: 0.5, at: SOLVED_AT },
          { score: 0.7, at: SOLVED_AT },
          { score: 0.8, at: SOLVED_AT },
        ],
      },
      beta: {
        bestScore: 0.3,
        bestAt: SOLVED_AT,
        beatenBaseline: false,
        attempts: [{ score: 0.3, at: SOLVED_AT }],
      },
    };
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      progress: solvedProgress(solved),
      labs,
      research,
    };

    const expectedXp =
      2 * (10 + 5) +
      1 * (25 + 10) +
      1 * (50 + 20) +
      2 * 100 +
      (3 + 1) * 5 +
      1 * 50;

    const info = computeXp(snapshot);
    expect(info.xp).toBe(expectedXp);
    expect(info.xp).toBe(405);
    expect(info.level).toBe(3);
    expect(info.title).toBe("Novice");
    expect(info.nextLevelXp).toBe(600);
    expect(info.progress).toBe(105 / 300);

    const totals = getTotals(snapshot);
    expect(totals.solved).toBe(solved.length);
    expect(totals.xp).toBe(expectedXp);
    expect(totals.badges).toBe(earnedBadges(snapshot).length);
  });

  test("empty progress yields zero XP and level one", () => {
    const info = computeXp(emptySnapshot());
    expect(info.xp).toBe(0);
    expect(info.level).toBe(1);
    expect(info.nextLevelXp).toBe(100);
    expect(info.progress).toBe(0);
  });
});
