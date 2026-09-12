import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getDailyDateKey,
  getDailyProblemId,
  getDailyState,
  isTodaySolved,
  markDailySolved,
} from "@/lib/daily";
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
