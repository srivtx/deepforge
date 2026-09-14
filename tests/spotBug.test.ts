import { describe, expect, test } from "bun:test";
import {
  BUG_CATALOG,
  BUG_CATEGORIES,
  canSpotTheBug,
  generateBugMutants,
  scoreBugAnswer,
  type BugCategory,
  type BugMutant,
} from "@/lib/spotBug";

const SOLUTION = [
  "def demo(xs, ys, m):",
  "    total = 0",
  "    for i in range(len(xs)):",
  "        total += xs[i]",
  "    diff = total - ys[0]",
  "    pick = m[0][1]",
  "    mid = (m[0][0] + m[1][1]) // 2",
  "    mean = total / len(xs)",
  "    if total > 0:",
  "        total = total + 1",
  "    while total < 10:",
  "        total += 1",
  "    return mean",
].join("\n");

const PROBLEM = { id: "demo-001", solution: SOLUTION };

const MULTI_LINE = {
  id: "multi-001",
  solution: [
    "def f(xs):",
    "    mean = (",
    "        sum(xs) / len(xs)",
    "    )",
    "    return mean",
  ].join("\n"),
};

function byCategory(mutants: BugMutant[], category: BugCategory): BugMutant {
  const found = mutants.find((mutant) => mutant.category === category);
  if (!found) throw new Error(`missing mutant for ${category}`);
  return found;
}

describe("mutation generation", () => {
  test("covers every bug family on a solution that contains them", () => {
    const mutants = generateBugMutants(PROBLEM, { limit: 40 });
    const categories = new Set(mutants.map((mutant) => mutant.category));
    for (const category of BUG_CATEGORIES) {
      expect(categories.has(category), category).toBe(true);
    }
  });

  test("is deterministic for the same problem and seed", () => {
    const first = generateBugMutants(PROBLEM);
    const second = generateBugMutants(PROBLEM);
    expect(first).toEqual(second);
    expect(generateBugMutants(PROBLEM, { seed: 7, limit: 5 })).toEqual(
      generateBugMutants(PROBLEM, { seed: 7, limit: 5 }),
    );
  });

  test("mutants are honest records: code, line, and original all agree", () => {
    const mutants = generateBugMutants(PROBLEM, { limit: 40 });
    expect(mutants.length).toBeGreaterThan(0);
    for (const mutant of mutants) {
      const lines = mutant.code.split("\n");
      expect(lines[mutant.lineIndex]).toBe(mutant.mutatedLine);
      expect(mutant.mutatedLine).not.toBe(mutant.originalLine);
      expect(mutant.lineNumber).toBe(mutant.lineIndex + 1);
      expect(mutant.span[0]).toBeLessThanOrEqual(mutant.lineIndex);
      expect(mutant.span[1]).toBeGreaterThanOrEqual(mutant.lineIndex);
      expect(mutant.rationale.length).toBeGreaterThan(0);
      expect(mutant.label.length).toBeGreaterThan(0);
    }
  });

  test("off-by-one shifts a loop bound", () => {
    const mutant = byCategory(generateBugMutants(PROBLEM, { limit: 40 }), "off-by-one");
    expect(mutant.originalLine).toContain("range(len(xs))");
    expect(mutant.mutatedLine).toMatch(/range\(len\(xs\)\s*[-+]\s*1\)/);
  });

  test("swapped operands reverses the subtraction", () => {
    const mutant = byCategory(generateBugMutants(PROBLEM, { limit: 40 }), "swapped-operands");
    expect(mutant.originalLine).toContain("total - ys[0]");
    expect(mutant.mutatedLine).toContain("ys[0] - total");
  });

  test("wrong axis transposes the indices", () => {
    const mutant = byCategory(generateBugMutants(PROBLEM, { limit: 40 }), "wrong-axis");
    expect(mutant.originalLine).toContain("m[0][1]");
    expect(mutant.mutatedLine).toContain("m[1][0]");
  });

  test("missing normalization drops the division", () => {
    const mutant = byCategory(
      generateBugMutants(PROBLEM, { limit: 40 }),
      "missing-normalization",
    );
    expect(mutant.originalLine).toContain("/ len(xs)");
    expect(mutant.mutatedLine).not.toContain("/");
  });

  test("boundary condition flips an inclusive comparison", () => {
    const mutants = generateBugMutants(PROBLEM, { limit: 40 }).filter(
      (mutant) => mutant.category === "boundary-condition",
    );
    const flips = mutants.map((mutant) => mutant.mutatedLine).join("\n");
    expect(flips).toMatch(/>=|<=/);
  });

  test("spans wrap continuation lines of a statement", () => {
    const mutant = byCategory(
      generateBugMutants(MULTI_LINE, { limit: 40 }),
      "missing-normalization",
    );
    expect(mutant.span[0]).toBe(1);
    expect(mutant.span[1]).toBe(3);
  });

  test("degrading: solutions that cannot be mutated yield no mutants", () => {
    expect(generateBugMutants({ id: "tiny", solution: "def f(x):\n    pass" })).toEqual([]);
    expect(generateBugMutants({ id: "tiny", solution: "def f(x):\n    return x" })).toEqual([]);
    expect(canSpotTheBug({ id: "tiny", solution: "def f(x):\n    pass" })).toBe(false);
    expect(canSpotTheBug(PROBLEM)).toBe(true);
  });

  test("respects the candidate limit", () => {
    expect(generateBugMutants(PROBLEM, { limit: 3 })).toHaveLength(3);
    expect(generateBugMutants(PROBLEM, { limit: 1 })).toHaveLength(1);
  });
});

describe("bug answer scoring", () => {
  test("a correct line plus a full why scores 100 and nails it", () => {
    const mutant = byCategory(
      generateBugMutants(PROBLEM, { limit: 40 }),
      "missing-normalization",
    );
    const score = scoreBugAnswer(mutant, {
      line: mutant.lineNumber,
      reason:
        "The mean needs to divide by the length to normalize the total; without it the sum is just the sum.",
    });
    expect(score.lineCorrect).toBe(true);
    expect(score.reasonScore).toBe(1);
    expect(score.total).toBe(100);
    expect(score.verdict).toBe("nailed-it");
    expect(score.missed).toEqual([]);
  });

  test("a wrong line and empty reasoning scores zero", () => {
    const mutant = byCategory(
      generateBugMutants(PROBLEM, { limit: 40 }),
      "missing-normalization",
    );
    const score = scoreBugAnswer(mutant, { line: 1, reason: "" });
    expect(score.lineScore).toBe(0);
    expect(score.reasonScore).toBe(0);
    expect(score.total).toBe(0);
    expect(score.verdict).toBe("not-yet");
    expect(score.missed.length).toBeGreaterThan(0);
  });

  test("picking another line of the same statement gets partial credit", () => {
    const mutant = byCategory(
      generateBugMutants(MULTI_LINE, { limit: 40 }),
      "missing-normalization",
    );
    const pick = mutant.span[0] + 1;
    expect(pick).not.toBe(mutant.lineNumber);
    const score = scoreBugAnswer(mutant, {
      line: pick,
      reason: "divide by length to normalize",
    });
    expect(score.lineNear).toBe(true);
    expect(score.lineCorrect).toBe(false);
    expect(score.lineScore).toBe(0.6);
    expect(score.reasonScore).toBeGreaterThan(0.5);
  });

  test("partial reasoning earns partial credit", () => {
    const mutant = byCategory(
      generateBugMutants(PROBLEM, { limit: 40 }),
      "missing-normalization",
    );
    const score = scoreBugAnswer(mutant, {
      line: mutant.lineNumber,
      reason: "it should normalize the values",
    });
    expect(score.lineCorrect).toBe(true);
    expect(score.reasonScore).toBe(0.333);
    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThan(100);
  });

  test("out-of-range lines never crash and score zero", () => {
    const mutant = byCategory(
      generateBugMutants(PROBLEM, { limit: 40 }),
      "off-by-one",
    );
    const score = scoreBugAnswer(mutant, { line: 999, reason: "index is shifted" });
    expect(score.lineScore).toBe(0);
    expect(score.total).toBeLessThanOrEqual(40);
  });

  test("every catalog entry carries a rationale and reason groups", () => {
    for (const category of BUG_CATEGORIES) {
      const entry = BUG_CATALOG[category];
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.rationale.length).toBeGreaterThan(0);
      expect(entry.reasonGroups.length).toBeGreaterThan(0);
      for (const group of entry.reasonGroups) {
        expect(group.patterns.length).toBeGreaterThan(0);
      }
    }
  });
});
