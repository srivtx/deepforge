import { describe, test, expect } from "bun:test";
import { getSimilarProblems } from "@/lib/similar";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";

function byId(id: string): ProblemMeta {
  const found = PROBLEM_META.find((meta) => meta.id === id);
  if (!found) throw new Error(`missing fixture problem: ${id}`);
  return found;
}

/** Crafted source: not part of PROBLEM_META, so no self-collision. */
const source: ProblemMeta = {
  id: "fixture-source",
  title: "Cosine Similarity Between Vectors",
  category: "Linear Algebra",
  difficulty: "Medium",
};

const alphaBeta: ProblemMeta = {
  id: "zz-002",
  title: "Alpha Beta",
  category: "Linear Algebra",
  difficulty: "Easy",
};

const gammaDelta: ProblemMeta = {
  id: "zz-001",
  title: "Gamma Delta",
  category: "Linear Algebra",
  difficulty: "Medium",
};

const epsilonZeta: ProblemMeta = {
  id: "zz-000",
  title: "Epsilon Zeta",
  category: "Linear Algebra",
  difficulty: "Hard",
};

/** Cross-category but shares two title tokens and the difficulty. */
const crossCategory: ProblemMeta = {
  id: "zz-003",
  title: "Cosine Similarity",
  category: "NLP",
  difficulty: "Medium",
};

describe("getSimilarProblems scoring", () => {
  test("same-category siblings outrank a cross-category title match", () => {
    const results = getSimilarProblems(source, 5, [
      crossCategory,
      alphaBeta,
      gammaDelta,
      epsilonZeta,
    ]);
    expect(results.map((meta) => meta.id)).toEqual([
      "zz-001",
      "zz-000",
      "zz-002",
      "zz-003",
    ]);
    expect(results[0].category).toBe(source.category);
  });

  test("difficulty adjacency is partial credit, same difficulty wins", () => {
    const adjacent = getSimilarProblems(source, 5, [alphaBeta, gammaDelta]);
    expect(adjacent.map((meta) => meta.id)).toEqual(["zz-001", "zz-002"]);

    const hardSource: ProblemMeta = { ...source, difficulty: "Hard" };
    const distanceTwo = getSimilarProblems(hardSource, 5, [
      alphaBeta,
      gammaDelta,
      epsilonZeta,
    ]);
    expect(distanceTwo.map((meta) => meta.id)).toEqual([
      "zz-000",
      "zz-001",
      "zz-002",
    ]);
  });

  test("title token overlap breaks ties within a category", () => {
    const shared: ProblemMeta = {
      id: "zz-030",
      title: "Vectors Overview",
      category: "Linear Algebra",
      difficulty: "Medium",
    };
    const unshared: ProblemMeta = {
      id: "zz-031",
      title: "Alpha Beta",
      category: "Linear Algebra",
      difficulty: "Medium",
    };
    const results = getSimilarProblems(source, 5, [unshared, shared]);
    expect(results.map((meta) => meta.id)).toEqual(["zz-030", "zz-031"]);
  });

  test("stop words do not create overlap and zero scores are filtered", () => {
    const stopOnly: ProblemMeta = {
      id: "zz-040",
      title: "Between And Of",
      category: "NLP",
      difficulty: "Hard",
    };
    expect(getSimilarProblems(source, 5, [stopOnly])).toEqual([]);
  });

  test("never recommends the source itself (present in the corpus)", () => {
    const results = getSimilarProblems(byId("la-025"), 5, [
      byId("la-025"),
      alphaBeta,
    ]);
    expect(results.some((meta) => meta.id === "la-025")).toBe(false);
    expect(results.map((meta) => meta.id)).toEqual(["zz-002"]);
  });
});

describe("getSimilarProblems determinism and ordering", () => {
  test("two calls return equal results", () => {
    const first = getSimilarProblems(byId("la-025"));
    const second = getSimilarProblems(byId("la-025"));
    expect(first).toEqual(second);
  });

  test("crafted corpora are order-independent and tie-break by id", () => {
    const tied: ProblemMeta[] = [
      { id: "zz-100", title: "Nonsense One", category: "Linear Algebra", difficulty: "Medium" },
      { id: "zz-010", title: "Nonsense Two", category: "Linear Algebra", difficulty: "Medium" },
      { id: "zz-005", title: "Nonsense Three", category: "Linear Algebra", difficulty: "Medium" },
    ];
    const expected = ["zz-005", "zz-010", "zz-100"];
    expect(
      getSimilarProblems(source, 5, tied).map((meta) => meta.id),
    ).toEqual(expected);
    expect(
      getSimilarProblems(source, 5, [...tied].reverse()).map((meta) => meta.id),
    ).toEqual(expected);
  });

  test("sampled real problems never recommend themselves and stay ranked", () => {
    for (let i = 0; i < PROBLEM_META.length; i += 37) {
      const problem = PROBLEM_META[i];
      const results = getSimilarProblems(problem, 5);
      expect(results.length).toBeLessThanOrEqual(5);
      expect(results.some((meta) => meta.id === problem.id)).toBe(false);
      for (const result of results) {
        expect(result.category).toBe(problem.category);
        expect(PROBLEM_META.includes(result)).toBe(true);
      }
    }
  });
});

describe("getSimilarProblems limits and corpus safety", () => {
  test("respects the limit", () => {
    expect(getSimilarProblems(byId("la-001"), 1)).toHaveLength(1);
    expect(getSimilarProblems(byId("la-001"), 3)).toHaveLength(3);
    expect(getSimilarProblems(byId("la-001"), 5)).toHaveLength(5);
  });

  test("non-positive and non-finite limits return empty", () => {
    expect(getSimilarProblems(byId("la-001"), 0)).toEqual([]);
    expect(getSimilarProblems(byId("la-001"), -2)).toEqual([]);
    expect(getSimilarProblems(byId("la-001"), Number.NaN)).toEqual([]);
  });

  test("empty and self-only corpora are safe", () => {
    expect(getSimilarProblems(source, 5, [])).toEqual([]);
    expect(getSimilarProblems(source, 5, [source])).toEqual([]);
  });

  test("small corpus returns only positive-score siblings", () => {
    expect(getSimilarProblems(source, 5, [crossCategory]).map((m) => m.id)).toEqual([
      "zz-003",
    ]);
    expect(getSimilarProblems(source, 100, [alphaBeta]).map((m) => m.id)).toEqual([
      "zz-002",
    ]);
  });
});

describe("getSimilarProblems on the real index", () => {
  test("top picks for a real problem are real siblings", () => {
    const results = getSimilarProblems(byId("al-001"));
    expect(results).toHaveLength(5);
    expect(results.map((meta) => meta.id)).not.toContain("al-001");
    expect(results.every((meta) => meta.category === "Algorithms")).toBe(true);
    const ids = new Set(results.map((meta) => meta.id));
    expect(ids.size).toBe(results.length);
  });

  test("every category yields in-category siblings", () => {
    const seen = new Set<string>();
    for (const meta of PROBLEM_META) {
      if (seen.has(meta.category)) continue;
      seen.add(meta.category);
      const results = getSimilarProblems(meta, 5);
      expect(results).toHaveLength(5);
      expect(results.every((entry) => entry.category === meta.category)).toBe(true);
    }
    expect(seen.size).toBe(15);
  });
});
