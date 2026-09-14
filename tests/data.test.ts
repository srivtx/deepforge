import { describe, test, expect } from "bun:test";
import { PROBLEMS, CATEGORIES } from "@/data/problems";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { CONTESTS } from "@/data/contests";
import { INTERVIEW_TRACKS } from "@/data/interview";

const problemIds = new Set(PROBLEMS.map((p) => p.id));
const categoryNames = new Set(CATEGORIES.map((c) => c.name));

const KNOWN_DUPLICATE_TITLES = new Set<string>();

describe("problem catalog integrity", () => {
  test("ships at least 5550 problems", () => {
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(5550);
  });

  test("has unique, well-formed ids", () => {
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(PROBLEMS.length);
    for (const p of PROBLEMS) {
      expect(p.id, p.id).toMatch(/^[a-z]+-\d{3,4}$/);
    }
  });

  test("has no duplicate titles", () => {
    const counts = new Map<string, number>();
    for (const p of PROBLEMS) counts.set(p.title, (counts.get(p.title) ?? 0) + 1);
    for (const [title, count] of counts) {
      if (count > 1) expect(KNOWN_DUPLICATE_TITLES.has(title), title).toBe(true);
    }
    for (const title of KNOWN_DUPLICATE_TITLES) {
      expect(counts.get(title) ?? 0, title).toBeGreaterThan(1);
    }
  });

  test("uses known categories", () => {
    for (const p of PROBLEMS) {
      expect(categoryNames.has(p.category), p.id).toBe(true);
    }
  });

  test("has non-empty fields and 3-6 test cases each", () => {
    for (const p of PROBLEMS) {
      expect(p.description.trim().length > 0, p.id).toBe(true);
      expect(p.starterCode.trim().length > 0, p.id).toBe(true);
      expect(p.solution.trim().length > 0, p.id).toBe(true);
      expect(p.testCases.length, p.id).toBeGreaterThanOrEqual(3);
      expect(p.testCases.length, p.id).toBeLessThanOrEqual(6);
    }
  });

  test("solutions contain a Python def", () => {
    for (const p of PROBLEMS) {
      expect(p.solution.includes("def "), p.id).toBe(true);
    }
  });
});

describe("pen and paper set", () => {
  test("has 60 problems", () => {
    expect(PENPAPER_PROBLEMS).toHaveLength(60);
  });

  test("multiple-choice questions have exactly 4 options including the answer", () => {
    for (const p of PENPAPER_PROBLEMS) {
      if (!p.options) continue;
      expect(p.options, p.id).toHaveLength(4);
      expect(p.options.includes(String(p.answer)), p.id).toBe(true);
    }
  });

  test("numeric answers are finite", () => {
    for (const p of PENPAPER_PROBLEMS) {
      if (p.options) continue;
      expect(typeof p.answer, p.id).toBe("number");
      expect(Number.isFinite(p.answer as number), p.id).toBe(true);
    }
  });
});

describe("curated sets", () => {
  test("contests reference only known problems", () => {
    for (const contest of CONTESTS) {
      expect(contest.problemIds.length, contest.id).toBeGreaterThan(0);
      for (const id of contest.problemIds) {
        expect(problemIds.has(id), `${contest.id} -> ${id}`).toBe(true);
      }
    }
  });

  test("interview tracks reference only known problems", () => {
    for (const track of INTERVIEW_TRACKS) {
      expect(track.problemIds.length, track.id).toBeGreaterThan(0);
      for (const id of track.problemIds) {
        expect(problemIds.has(id), `${track.id} -> ${id}`).toBe(true);
      }
    }
  });
});
