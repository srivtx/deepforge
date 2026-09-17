import { describe, expect, test } from "bun:test";
import {
  allowedHintTier,
  applyHintPenalty,
  getHintTiers,
  hintPenalty,
  HINT_TIER_2_ELAPSED_MS,
  HINT_TIER_2_FAILED_RUNS,
  HINT_TIER_3_ELAPSED_MS,
  HINT_TIER_3_FAILED_RUNS,
  MAX_HINT_TIER,
} from "@/lib/hints";
import type { Problem } from "@/types/problem";

const PROBLEM: Problem = {
  id: "al-999",
  title: "Echo",
  category: "Algorithms",
  difficulty: "Easy",
  description: "Return the input unchanged.",
  starterCode: "def echo(x):\n    pass",
  solution: "def echo(x):\n    return x",
  testCases: [{ input: [1], expected: 1 }],
  hint: "Return it as-is.",
};

describe("allowedHintTier", () => {
  test("tier 1 is available on a fresh attempt", () => {
    expect(allowedHintTier({ failedRuns: 0, elapsedMs: 0 })).toBe(1);
    expect(allowedHintTier({})).toBe(1);
  });

  test("tier 2 unlocks after 1 failed run", () => {
    expect(
      allowedHintTier({ failedRuns: HINT_TIER_2_FAILED_RUNS, elapsedMs: 0 }),
    ).toBe(2);
    expect(allowedHintTier({ failedRuns: 1, elapsedMs: 0 })).toBe(2);
  });

  test("tier 2 unlocks at 3 minutes, not a millisecond earlier", () => {
    expect(
      allowedHintTier({ failedRuns: 0, elapsedMs: HINT_TIER_2_ELAPSED_MS - 1 }),
    ).toBe(1);
    expect(
      allowedHintTier({ failedRuns: 0, elapsedMs: HINT_TIER_2_ELAPSED_MS }),
    ).toBe(2);
  });

  test("tier 3 unlocks after 2 failed runs", () => {
    expect(
      allowedHintTier({ failedRuns: HINT_TIER_3_FAILED_RUNS - 1, elapsedMs: 0 }),
    ).toBe(2);
    expect(
      allowedHintTier({ failedRuns: HINT_TIER_3_FAILED_RUNS, elapsedMs: 0 }),
    ).toBe(3);
  });

  test("tier 3 unlocks at 6 minutes, not a millisecond earlier", () => {
    expect(
      allowedHintTier({ failedRuns: 0, elapsedMs: HINT_TIER_3_ELAPSED_MS - 1 }),
    ).toBe(2);
    expect(
      allowedHintTier({ failedRuns: 0, elapsedMs: HINT_TIER_3_ELAPSED_MS }),
    ).toBe(3);
  });

  test("a reset restores tier 1 regardless of runs or time", () => {
    expect(
      allowedHintTier({
        failedRuns: 9,
        elapsedMs: HINT_TIER_3_ELAPSED_MS * 3,
        reset: true,
      }),
    ).toBe(1);
    expect(allowedHintTier({ failedRuns: 0, elapsedMs: 0, reset: false })).toBe(1);
  });

  test("maxTier caps the earned tier", () => {
    expect(
      allowedHintTier({ failedRuns: 9, elapsedMs: 999_999, maxTier: 1 }),
    ).toBe(1);
    expect(
      allowedHintTier({ failedRuns: 9, elapsedMs: 999_999, maxTier: 2 }),
    ).toBe(2);
    expect(allowedHintTier({ failedRuns: 0, elapsedMs: 0, maxTier: 99 })).toBe(1);
    expect(allowedHintTier({ failedRuns: 0, elapsedMs: 0, maxTier: 0 })).toBe(1);
    expect(
      allowedHintTier({ failedRuns: 0, elapsedMs: 0, maxTier: 2 }),
    ).toBe(1);
  });

  test("junk inputs fall back to a tier-1 budget instead of throwing", () => {
    expect(allowedHintTier()).toBe(1);
    expect(allowedHintTier(undefined as never)).toBe(1);
    expect(allowedHintTier(null as never)).toBe(1);
    expect(
      allowedHintTier({
        failedRuns: Number.NaN,
        elapsedMs: Number.POSITIVE_INFINITY,
      }),
    ).toBe(1);
    expect(allowedHintTier({ failedRuns: -5, elapsedMs: -1 })).toBe(1);
    expect(
      allowedHintTier({
        failedRuns: "9" as never,
        elapsedMs: "9999999" as never,
      }),
    ).toBe(1);
    expect(allowedHintTier({ failedRuns: 1.9, elapsedMs: 0 })).toBe(2);
  });
});

describe("hintPenalty", () => {
  test("maps the highest revealed tier to penalty points", () => {
    expect(hintPenalty([])).toBe(0);
    expect(hintPenalty([1])).toBe(1);
    expect(hintPenalty([2])).toBe(2);
    expect(hintPenalty([3])).toBe(3);
    expect(hintPenalty([1, 2])).toBe(2);
    expect(hintPenalty([1, 3, 2])).toBe(3);
  });

  test("ignores junk entries", () => {
    expect(hintPenalty(null)).toBe(0);
    expect(hintPenalty(undefined)).toBe(0);
    expect(hintPenalty([Number.NaN, -1, 0])).toBe(0);
    expect(hintPenalty([99])).toBe(MAX_HINT_TIER);
    expect(hintPenalty(["2" as never, 2.9])).toBe(2);
  });
});

describe("applyHintPenalty", () => {
  test("a clean, hint-free base keeps its quality", () => {
    expect(applyHintPenalty(5, [])).toBe(5);
    expect(applyHintPenalty(4, [])).toBe(4);
  });

  test("hint tiers lower a passing grade but never below 3", () => {
    expect(applyHintPenalty(5, [1])).toBe(4);
    expect(applyHintPenalty(5, [2])).toBe(3);
    expect(applyHintPenalty(5, [3])).toBe(3);
    expect(applyHintPenalty(5, [1, 3])).toBe(3);
    expect(applyHintPenalty(4, [1])).toBe(3);
    expect(applyHintPenalty(4, [3])).toBe(3);
  });

  test("failing grades pass through unchanged", () => {
    expect(applyHintPenalty(0, [])).toBe(0);
    expect(applyHintPenalty(0, [3])).toBe(0);
  });

  test("junk base values clamp into the 0-5 band", () => {
    expect(applyHintPenalty(Number.NaN, [1])).toBe(0);
    expect(applyHintPenalty(99, [1])).toBe(4);
    expect(applyHintPenalty(-4, [1])).toBe(0);
  });
});

describe("getHintTiers", () => {
  test("tier numbers 1..3 map to nudge, approach, full solution", () => {
    const tiers = getHintTiers(PROBLEM);
    expect(tiers).toHaveLength(MAX_HINT_TIER);
    expect(tiers[0].label).toBe("Nudge");
    expect(tiers[1].label).toBe("Approach");
    expect(tiers[2].label).toBe("Full solution");
    expect(tiers[2].isSolution).toBe(true);
    expect(tiers[2].text).toBe(PROBLEM.solution);
    expect(tiers[0].text).toBe(PROBLEM.hint);
  });
});
