import { describe, test, expect } from "bun:test";
import { cn, clipRepr } from "@/lib/utils";
import { getCurrentStreak, getLongestStreak } from "@/lib/leaderboard";
import { encodeCollection, decodeCollection } from "@/lib/collections";
import { getHintTiers } from "@/lib/hints";
import { PROBLEMS } from "@/data/problems";
import type { ProgressMap } from "@/lib/progress";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function solvedOn(...days: number[]): ProgressMap {
  const map: ProgressMap = {};
  days.forEach((daysAgo, index) => {
    map[`p-${index}`] = { solved: true, solvedAt: isoDaysAgo(daysAgo) };
  });
  return map;
}

describe("utils", () => {
  test("cn drops falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
    expect(cn()).toBe("");
  });

  test("clipRepr truncates long text with an ellipsis", () => {
    const out = clipRepr("x".repeat(500), 10);
    expect(out).toBe("xxxxxxxxxx…");
    expect(out).toHaveLength(11);
  });

  test("clipRepr collapses whitespace and handles null", () => {
    expect(clipRepr("  a   b\n c  ")).toBe("a b c");
    expect(clipRepr(null)).toBe("(no value)");
  });
});

describe("leaderboard streaks", () => {
  test("empty progress has no streak", () => {
    expect(getCurrentStreak({})).toBe(0);
    expect(getLongestStreak({})).toBe(0);
  });

  test("counts consecutive days ending today", () => {
    const progress = solvedOn(0, 1, 2);
    expect(getCurrentStreak(progress)).toBe(3);
    expect(getLongestStreak(progress)).toBe(3);
  });

  test("yesterday alone keeps the current streak alive", () => {
    expect(getCurrentStreak(solvedOn(1))).toBe(1);
  });

  test("a streak that ended two days ago is not current", () => {
    expect(getCurrentStreak(solvedOn(2))).toBe(0);
    expect(getLongestStreak(solvedOn(2))).toBe(1);
  });

  test("gaps break the streak", () => {
    const progress = solvedOn(0, 1, 3);
    expect(getCurrentStreak(progress)).toBe(2);
    expect(getLongestStreak(progress)).toBe(2);
  });

  test("longest streak can exceed the current one", () => {
    const progress = solvedOn(0, 5, 6, 7, 8);
    expect(getCurrentStreak(progress)).toBe(1);
    expect(getLongestStreak(progress)).toBe(4);
  });

  test("multiple solves on one day count once", () => {
    const progress = solvedOn(0, 0, 1, 1);
    expect(getCurrentStreak(progress)).toBe(2);
    expect(getLongestStreak(progress)).toBe(2);
  });

  test("ignores unsolved or undated entries", () => {
    const progress: ProgressMap = {
      a: { solved: false, solvedAt: isoDaysAgo(0) },
      b: { solved: true },
      c: { solvedAt: isoDaysAgo(0) },
      d: { solved: true, solvedAt: "not-a-date" },
    };
    expect(getCurrentStreak(progress)).toBe(0);
    expect(getLongestStreak(progress)).toBe(0);
  });
});

describe("collections", () => {
  test("round-trips problem ids", () => {
    const ids = ["la-001", "ml-2755", "ds-0042"];
    const code = encodeCollection(ids);
    expect(code).not.toContain("=");
    expect(code).not.toContain("+");
    expect(code).not.toContain("/");
    expect(decodeCollection(code)).toEqual(ids);
  });

  test("round-trips an empty list", () => {
    expect(decodeCollection(encodeCollection([]))).toEqual([]);
  });

  test("returns null for garbage input", () => {
    expect(decodeCollection("!!!not base64!!!")).toBeNull();
    expect(decodeCollection("aGVsbG8")).toBeNull();
    expect(decodeCollection(btoa('{"a":1}'))).toBeNull();
    expect(decodeCollection("")).toBeNull();
  });
});

describe("hints", () => {
  test("returns exactly three tiers ending in the solution", () => {
    const problem = PROBLEMS[0];
    const tiers = getHintTiers(problem);
    expect(tiers).toHaveLength(3);
    expect(tiers[0].label).toBe("Nudge");
    expect(tiers[1].label).toBe("Approach");
    expect(tiers[2].label).toBe("Full solution");
    expect(tiers[2].isSolution).toBe(true);
    expect(tiers[2].text).toBe(problem.solution);
    expect(tiers[0].text.length).toBeGreaterThan(0);
    expect(tiers[1].text.length).toBeGreaterThan(0);
  });
});
