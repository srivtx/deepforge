import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  BADGE_CATALOG,
  badgeProgress,
  computeXp,
  earnedBadges,
  getActivityHeatmap,
  getDailyQuests,
  getTotals,
  type BadgeSnapshot,
} from "@/lib/badges";
import type { LabRecords } from "@/lib/labs";
import type { ProgressMap } from "@/lib/progress";
import type { ResearchState } from "@/lib/research";
import { getDailyDateKey } from "@/lib/daily";
import type { BugRound } from "@/lib/bugHunt";
import type { RunState } from "@/lib/runs";
import { BUG_CATEGORIES } from "@/lib/spotBug";
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
    bugHunts: [],
    runs: [],
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

function cleanHunts(count: number, at: Date = FIXED_NOW): BugRound[] {
  return Array.from({ length: count }, (_, i) => ({
    problemId: `bug-${i}`,
    category: BUG_CATEGORIES[i % BUG_CATEGORIES.length],
    lineOk: true,
    reasonOk: true,
    clean: true,
    at: new Date(at.getTime() + i * 1_000).toISOString(),
  }));
}

function finishedRun(i = 0, at: Date = FIXED_NOW): RunState {
  const startedAt = at.getTime() + i * 60_000;
  return {
    id: `run-${i}`,
    seed: `seed-${i}`,
    startedAt,
    endsAt: startedAt + 300_000,
    problemIds: ["al-001"],
    solvedIds: [],
    solvedAt: {},
    score: 0,
    status: "finished",
  };
}

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

describe("lab quest", () => {
  test("derives completion from lab timestamps, not a mounted view", () => {
    function labQuest(now: Date) {
      const snapshot: BadgeSnapshot = {
        ...emptySnapshot(now),
        labs: {
          "lab-01": {
            best: 0.9,
            attempts: 1,
            passed: true,
            lastScoredAt: now.toISOString(),
          },
        },
      };
      return getDailyQuests(snapshot).find((quest) => quest.id === "lab");
    }

    function dayWithLabQuest(): Date | null {
      for (let offset = 0; offset < 30; offset += 1) {
        const now = new Date(2026, 0, 14 + offset, 12, 0, 0, 0);
        if (getDailyQuests(emptySnapshot(now)).some((quest) => quest.id === "lab")) {
          return now;
        }
      }
      return null;
    }

    const day = dayWithLabQuest();
    expect(day, "expected a day whose quest pick includes a lab run").not.toBeNull();
    if (!day) return;

    const yesterday = new Date(day.getTime() - 86_400_000);
    const stale = getDailyQuests({
      ...emptySnapshot(day),
      labs: {
        "lab-01": {
          best: 0.9,
          attempts: 1,
          passed: true,
          lastScoredAt: yesterday.toISOString(),
        },
      },
    }).find((quest) => quest.id === "lab");
    expect(stale?.done).toBe(false);
    expect(stale?.progress).toBe(0);

    const today = labQuest(day);
    expect(today?.done).toBe(true);
    expect(today?.progress).toBe(1);
  });
});

describe("bug hunt badges", () => {
  function withHunts(count: number): BadgeSnapshot {
    return { ...emptySnapshot(), bugHunts: cleanHunts(count) };
  }

  test("bug-slayer sits at the first clean hunt and dates it", () => {
    const none = earnedBadges(emptySnapshot()).map((badge) => badge.id);
    expect(none).not.toContain("bug-slayer");
    expect(badgeProgress("bug-slayer", emptySnapshot())).toEqual([0, 1]);

    const earned = earnedBadges(withHunts(1));
    const slayer = earned.find((badge) => badge.id === "bug-slayer");
    expect(slayer?.earnedAt).toBe(cleanHunts(1)[0].at);
    expect(badgeProgress("bug-slayer", withHunts(1))).toEqual([1, 1]);
  });

  test("exterminator flips between 9 and 10 clean hunts", () => {
    expect(earnedBadges(withHunts(9)).map((b) => b.id)).not.toContain(
      "exterminator",
    );
    expect(badgeProgress("exterminator", withHunts(9))).toEqual([9, 10]);
    expect(earnedBadges(withHunts(10)).map((b) => b.id)).toContain(
      "exterminator",
    );
    expect(badgeProgress("exterminator", withHunts(10))).toEqual([10, 10]);
  });

  test("flawless flips between 24 and 25 clean hunts and clamps", () => {
    expect(earnedBadges(withHunts(24)).map((b) => b.id)).not.toContain(
      "flawless",
    );
    expect(earnedBadges(withHunts(25)).map((b) => b.id)).toContain("flawless");
    expect(badgeProgress("flawless", withHunts(25))).toEqual([25, 25]);
    expect(badgeProgress("flawless", withHunts(40))).toEqual([25, 25]);
  });

  test("dirty rounds never advance the clean-hunt badges", () => {
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      bugHunts: [
        ...cleanHunts(9),
        { ...cleanHunts(1)[0], problemId: "bug-dirty", clean: false, lineOk: false },
      ],
    };
    const ids = earnedBadges(snapshot).map((b) => b.id);
    expect(ids).not.toContain("exterminator");
    expect(ids).toContain("bug-slayer");
    expect(badgeProgress("exterminator", snapshot)).toEqual([9, 10]);
  });

  test("earnedAt is the moment the Nth clean hunt landed", () => {
    const hunts = cleanHunts(10);
    const earned = earnedBadges({ ...emptySnapshot(), bugHunts: hunts });
    expect(earned.find((b) => b.id === "exterminator")?.earnedAt).toBe(
      hunts[9].at,
    );
  });
});

describe("speedrun badges", () => {
  function withRuns(count: number): BadgeSnapshot {
    return {
      ...emptySnapshot(),
      runs: Array.from({ length: count }, (_, i) => finishedRun(i)),
    };
  }

  test("speedrunner needs one finished run and dates it", () => {
    expect(earnedBadges(withRuns(0)).map((b) => b.id)).not.toContain(
      "speedrunner",
    );
    expect(badgeProgress("speedrunner", withRuns(0))).toEqual([0, 1]);

    const earned = earnedBadges(withRuns(1));
    expect(earned.find((b) => b.id === "speedrunner")?.earnedAt).toBe(
      FIXED_NOW.toISOString(),
    );
    expect(badgeProgress("speedrunner", withRuns(1))).toEqual([1, 1]);
  });

  test("speed-demon flips between 9 and 10 finished runs", () => {
    expect(earnedBadges(withRuns(9)).map((b) => b.id)).not.toContain(
      "speed-demon",
    );
    expect(badgeProgress("speed-demon", withRuns(9))).toEqual([9, 10]);

    const earned = earnedBadges(withRuns(10));
    expect(earned.map((b) => b.id)).toContain("speed-demon");
    expect(earned.find((b) => b.id === "speed-demon")?.earnedAt).toBe(
      new Date(FIXED_NOW.getTime() + 9 * 60_000).toISOString(),
    );
  });

  test("abandoned runs are not completions", () => {
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      runs: [{ ...finishedRun(0), status: "abandoned" }],
    };
    expect(earnedBadges(snapshot)).toHaveLength(0);
    expect(badgeProgress("speedrunner", snapshot)).toEqual([0, 1]);
  });
});

describe("bug hunt quest", () => {
  function dayWithBugHuntQuest(): Date | null {
    for (let offset = 0; offset < 30; offset += 1) {
      const now = new Date(2026, 0, 14 + offset, 12, 0, 0, 0);
      if (
        getDailyQuests(emptySnapshot(now)).some(
          (quest) => quest.id === "bug-hunt",
        )
      ) {
        return now;
      }
    }
    return null;
  }

  test("completes for a clean round on the same day, not another day", () => {
    const day = dayWithBugHuntQuest();
    expect(
      day,
      "expected a day whose quest pick includes a bug hunt",
    ).not.toBeNull();
    if (!day) return;

    const yesterday = new Date(day.getTime() - 86_400_000);
    const roundOn = (date: Date, clean: boolean): BugRound => ({
      problemId: `al-${date.getTime()}`,
      category: "off-by-one",
      lineOk: clean,
      reasonOk: clean,
      clean,
      at: date.toISOString(),
    });

    const stale = getDailyQuests({
      ...emptySnapshot(day),
      bugHunts: [roundOn(yesterday, true)],
    }).find((quest) => quest.id === "bug-hunt");
    expect(stale?.done).toBe(false);
    expect(stale?.progress).toBe(0);

    const dirty = getDailyQuests({
      ...emptySnapshot(day),
      bugHunts: [roundOn(day, false)],
    }).find((quest) => quest.id === "bug-hunt");
    expect(dirty?.done).toBe(false);
    expect(dirty?.progress).toBe(0);

    const clean = getDailyQuests({
      ...emptySnapshot(day),
      bugHunts: [roundOn(day, true)],
    }).find((quest) => quest.id === "bug-hunt");
    expect(clean?.done).toBe(true);
    expect(clean?.progress).toBe(1);
  });
});

describe("activity heatmap sources", () => {
  test("counts bug hunts and finished runs without restructuring", () => {
    const todayKey = getDailyDateKey(FIXED_NOW);
    const snapshot: BadgeSnapshot = {
      ...emptySnapshot(),
      bugHunts: [
        ...cleanHunts(2),
        { ...cleanHunts(1)[0], problemId: "bug-dirty", clean: false, lineOk: false },
      ],
      runs: [finishedRun(0)],
    };

    const days = getActivityHeatmap(52, snapshot);
    expect(days).toHaveLength(364);
    const today = days.find((entry) => entry.date === todayKey);
    expect(today?.count).toBe(4);
    expect(today?.level).toBe(3);
  });

  test("a dirty round still marks the day, an abandoned run does not", () => {
    const todayKey = getDailyDateKey(FIXED_NOW);
    const dirty = getActivityHeatmap(52, {
      ...emptySnapshot(),
      bugHunts: [{ ...cleanHunts(1)[0], clean: false }],
    }).find((entry) => entry.date === todayKey);
    expect(dirty?.count).toBe(1);
    expect(dirty?.level).toBe(1);

    const abandoned = getActivityHeatmap(52, {
      ...emptySnapshot(),
      runs: [{ ...finishedRun(0), status: "abandoned" }],
    }).find((entry) => entry.date === todayKey);
    expect(abandoned?.count).toBe(0);
    expect(abandoned?.level).toBe(0);
  });
});

describe("junk bug hunt and run payloads", () => {
  test("malformed entries are treated as absent and never throw", () => {
    const junk = {
      ...emptySnapshot(),
      bugHunts: [
        null,
        42,
        "nope",
        {},
        { at: 123 },
        { at: "not-a-date", clean: true },
        { at: SOLVED_AT, clean: "yes" },
      ],
      runs: [
        null,
        {},
        { status: "finished", startedAt: Number.NaN },
        { status: "finished", startedAt: -1 },
        { status: "finished", startedAt: "soon" },
        { status: "abandoned", startedAt: FIXED_NOW.getTime() },
      ],
    } as unknown as BadgeSnapshot;

    expect(earnedBadges(junk)).toHaveLength(0);
    expect(getTotals(junk).badges).toBe(0);
    expect(getDailyQuests(junk)).toHaveLength(3);

    const todayKey = getDailyDateKey(FIXED_NOW);
    const today = getActivityHeatmap(52, junk).find(
      (entry) => entry.date === todayKey,
    );
    // The one entry with a parseable `at` still counts as activity, but its
    // junk `clean` value never earns a hunt badge.
    expect(today?.count).toBe(1);
  });

  test("a snapshot missing the new fields entirely is safe", () => {
    const missing = {
      ...emptySnapshot(),
      bugHunts: undefined,
      runs: undefined,
    } as unknown as BadgeSnapshot;
    expect(earnedBadges(missing)).toHaveLength(0);
    expect(getDailyQuests(missing)).toHaveLength(3);
    expect(getTotals(missing).badges).toBe(0);
    expect(getActivityHeatmap(52, missing)).toHaveLength(364);
  });
});
