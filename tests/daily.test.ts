import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  applyShield,
  getDailyDateKey,
  getDailyShieldUsedDates,
  getDailyShields,
  getDailyState,
  getShieldStatus,
  isTodaySolved,
  markDailySolved,
  MAX_SHIELDS,
} from "@/lib/daily";
import { getDailyProblemId } from "@/lib/dailyProblem";
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

function atNoon(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0);
}

function daysBefore(days: number, from = atNoon(2026, 4, 20)): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

function daysAfter(days: number, from = atNoon(2026, 4, 20)): Date {
  return daysBefore(-days, from);
}

/** Solve `count` consecutive calendar days starting at `start`. */
function solveConsecutive(start: Date, count: number): void {
  for (let i = 0; i < count; i += 1) {
    markDailySolved(daysAfter(i, start));
  }
}

describe("daily problem selection", () => {
  test("is deterministic for the same calendar day", () => {
    const morning = atNoon(2026, 0, 15);
    morning.setHours(8);
    const night = new Date(morning);
    night.setHours(23, 59, 59);

    const first = getDailyProblemId(morning);
    expect(getDailyProblemId(morning)).toBe(first);
    expect(getDailyProblemId(night)).toBe(first);
    expect(getDailyProblemId(new Date(morning))).toBe(first);
  });

  test("returns an existing problem id for five different dates", () => {
    const ids = new Set(PROBLEMS.map((p) => p.id));
    const dates = [
      atNoon(2024, 0, 1),
      atNoon(2025, 5, 15),
      atNoon(2026, 8, 12),
      atNoon(2026, 11, 31),
      atNoon(2027, 2, 3),
    ];
    for (const date of dates) {
      const id = getDailyProblemId(date);
      expect(typeof id).toBe("string");
      expect(id.length > 0).toBe(true);
      expect(ids.has(id)).toBe(true);
    }
  });

  test("formats the date key as YYYY-MM-DD", () => {
    expect(getDailyDateKey(atNoon(2026, 0, 5))).toBe("2026-01-05");
    expect(getDailyDateKey(atNoon(2026, 11, 31))).toBe("2026-12-31");
    expect(getDailyDateKey(atNoon(2026, 8, 12))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});

describe("daily streak", () => {
  test("solving yesterday then today builds a 2-day streak", () => {
    const today = atNoon(2026, 4, 20);
    const yesterday = daysBefore(1, today);

    const first = markDailySolved(yesterday);
    expect(first.streak).toBe(1);
    expect(first.lastSolvedDate).toBe(getDailyDateKey(yesterday));

    const second = markDailySolved(today);
    expect(second.streak).toBe(2);
    expect(second.lastSolvedDate).toBe(getDailyDateKey(today));
    expect(second.solvedDates).toHaveLength(2);
    expect(isTodaySolved(today)).toBe(true);
    expect(getDailyState().streak).toBe(2);
  });

  test("solving the same day twice does not double-count", () => {
    const today = atNoon(2026, 4, 20);
    markDailySolved(today);
    const again = markDailySolved(today);
    expect(again.streak).toBe(1);
    expect(again.solvedDates).toHaveLength(1);
  });

  test("a gap resets the streak to one", () => {
    const today = atNoon(2026, 4, 20);
    const threeDaysAgo = daysBefore(3, today);

    const first = markDailySolved(threeDaysAgo);
    expect(first.streak).toBe(1);

    const afterGap = markDailySolved(today);
    expect(afterGap.streak).toBe(1);
    expect(afterGap.lastSolvedDate).toBe(getDailyDateKey(today));
    expect(afterGap.solvedDates).toHaveLength(2);
  });

  test("unreadable state falls back to an empty streak", () => {
    const storage = (globalScope.window as { localStorage: Storage })
      .localStorage;
    storage.setItem("deepforge:daily:v1", "{not json");
    expect(getDailyState().streak).toBe(0);
    expect(getDailyState().solvedDates).toEqual([]);
    expect(isTodaySolved(atNoon(2026, 4, 20))).toBe(false);
  });
});

describe("streak shields — earning", () => {
  test("a 7-day streak earns the first shield", () => {
    const start = atNoon(2026, 0, 1);
    solveConsecutive(start, 6);
    expect(getDailyShields(getDailyState())).toBe(0);

    markDailySolved(daysAfter(6, start));
    expect(getDailyState().streak).toBe(7);
    expect(getDailyShields(getDailyState())).toBe(1);
  });

  test("shields cap at MAX_SHIELDS even across many 7-day multiples", () => {
    const start = atNoon(2026, 0, 1);
    solveConsecutive(start, 21);
    expect(getDailyState().streak).toBe(21);
    expect(getDailyShields(getDailyState())).toBe(MAX_SHIELDS);
  });

  test("a spent shield frees a slot and the next 7-day multiple refills it", () => {
    const start = atNoon(2026, 0, 1);
    solveConsecutive(start, 7);
    expect(getDailyShields(getDailyState())).toBe(1);

    // Miss day 8; the visit on day 9 spends the shield.
    const visit = daysAfter(8, start);
    applyShield(visit);
    expect(getDailyShields(getDailyState())).toBe(0);

    // Solve day 9 … day 15: the streak crosses 14 and earns a fresh shield.
    for (let i = 8; i <= 14; i += 1) markDailySolved(daysAfter(i, start));
    expect(getDailyState().streak).toBe(14);
    expect(getDailyShields(getDailyState())).toBe(1);
  });
});

describe("streak shields — auto-cover", () => {
  test("one missed day is covered, keeps the streak, and extends after a solve", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 7);
    const missed = daysAfter(7, start);
    const back = daysAfter(8, start);

    const covered = applyShield(back);
    expect(covered.streak).toBe(7);
    expect(covered.lastSolvedDate).toBe(getDailyDateKey(missed));
    expect(getDailyShields(covered)).toBe(0);
    expect(getDailyShieldUsedDates(covered)).toEqual([
      getDailyDateKey(missed),
    ]);

    // Idempotent: a second visit must not spend anything else.
    const again = applyShield(back);
    expect(getDailyShields(again)).toBe(0);
    expect(getDailyShieldUsedDates(again)).toHaveLength(1);

    // The covered day does not extend the run; the next solve does.
    const solved = markDailySolved(back);
    expect(solved.streak).toBe(8);
    expect(solved.lastSolvedDate).toBe(getDailyDateKey(back));
  });

  test("with no shield the gap still resets exactly as before", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 6);
    expect(getDailyShields(getDailyState())).toBe(0);

    const afterGap = markDailySolved(daysAfter(7, start));
    expect(afterGap.streak).toBe(1);
  });

  test("a gap longer than one day is never covered", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 7);

    const covered = applyShield(daysAfter(9, start));
    expect(getDailyShields(covered)).toBe(1);
    expect(getDailyShieldUsedDates(covered)).toEqual([]);
    expect(covered.lastSolvedDate).toBe(getDailyDateKey(daysAfter(6, start)));

    const afterGap = markDailySolved(daysAfter(9, start));
    expect(afterGap.streak).toBe(1);
    expect(getDailyShields(afterGap)).toBe(1);
  });

  test("solving today after a covered miss does not double-spend", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 7);
    applyShield(daysAfter(8, start));

    markDailySolved(daysAfter(8, start));
    const state = getDailyState();
    expect(state.streak).toBe(8);
    expect(getDailyShields(state)).toBe(0);
    expect(getDailyShieldUsedDates(state)).toHaveLength(1);
  });

  test("shield status reports covered, at-risk, and protected states", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 7);
    const back = daysAfter(8, start);

    // Before the visit: today unsolved, one shield ready.
    const protectedStatus = getShieldStatus(back);
    expect(protectedStatus.protectedToday).toBe(true);
    expect(protectedStatus.atRisk).toBe(false);

    applyShield(back);
    const coveredStatus = getShieldStatus(back);
    expect(coveredStatus.coveredYesterday).toBe(true);
    expect(coveredStatus.spent).toBe(1);
    expect(coveredStatus.lastUsedDate).toBe(
      getDailyDateKey(daysAfter(7, start)),
    );

    markDailySolved(back);
    const solvedStatus = getShieldStatus(back);
    expect(solvedStatus.solvedToday).toBe(true);
    expect(solvedStatus.atRisk).toBe(false);
  });

  test("at-risk is true only with an unsolved today and no shield left", () => {
    const start = atNoon(2026, 4, 1);
    solveConsecutive(start, 7);
    applyShield(daysAfter(8, start));

    const status = getShieldStatus(daysAfter(8, start));
    expect(status.solvedToday).toBe(false);
    expect(status.available).toBe(0);
    expect(status.atRisk).toBe(true);
  });

  test("legacy payloads without shield fields load as zero shields", () => {
    const storage = (globalScope.window as { localStorage: Storage })
      .localStorage;
    storage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: "2026-05-01",
        streak: 7,
        solvedDates: ["2026-05-01"],
      }),
    );

    const state = getDailyState();
    expect(state.streak).toBe(7);
    expect(getDailyShields(state)).toBe(0);
    expect(getDailyShieldUsedDates(state)).toEqual([]);
    expect(getShieldStatus(atNoon(2026, 4, 20)).available).toBe(0);
  });

  test("malformed shield fields are sanitized", () => {
    const storage = (globalScope.window as { localStorage: Storage })
      .localStorage;
    storage.setItem(
      "deepforge:daily:v1",
      JSON.stringify({
        lastSolvedDate: null,
        streak: 0,
        solvedDates: [],
        shields: 99.7,
        shieldUsedDates: ["2026-05-02", "nope", "2026-05-02", 7],
      }),
    );

    const state = getDailyState();
    expect(getDailyShields(state)).toBe(MAX_SHIELDS);
    expect(getDailyShieldUsedDates(state)).toEqual(["2026-05-02"]);
  });
});

describe("streak shields — timezone and DST safety", () => {
  test("day keys stay consecutive across the spring-forward boundary", () => {
    const beforeDst = new Date(2026, 2, 7, 0, 30);
    const afterDst = new Date(2026, 2, 8, 0, 30);
    expect(isNaN(beforeDst.getTime())).toBe(false);
    expect(isNaN(afterDst.getTime())).toBe(false);

    markDailySolved(beforeDst);
    const state = markDailySolved(afterDst);
    expect(state.streak).toBe(2);
    expect(state.lastSolvedDate).toBe(getDailyDateKey(afterDst));
  });

  test("auto-cover lands on the right local date across DST", () => {
    // Seven solves ending the day before the spring-forward transition.
    const start = new Date(2026, 2, 1, 0, 30);
    solveConsecutive(start, 7);
    const missed = new Date(2026, 2, 8, 0, 30);
    const back = new Date(2026, 2, 9, 0, 30);

    const covered = applyShield(back);
    expect(getDailyShieldUsedDates(covered)).toEqual([
      getDailyDateKey(missed),
    ]);
    expect(covered.streak).toBe(7);

    const solved = markDailySolved(back);
    expect(solved.streak).toBe(8);
  });

  test("auto-cover lands on the right local date across fall-back", () => {
    const start = new Date(2026, 9, 25, 0, 30);
    solveConsecutive(start, 7);
    const missed = new Date(2026, 10, 1, 0, 30);
    const back = new Date(2026, 10, 2, 0, 30);

    const covered = applyShield(back);
    expect(getDailyShieldUsedDates(covered)).toEqual([
      getDailyDateKey(missed),
    ]);
    expect(covered.streak).toBe(7);
  });
});
