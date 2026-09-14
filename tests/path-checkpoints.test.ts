import { describe, expect, test } from "bun:test";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { resolvePrerequisites } from "@/lib/paths";
import {
  BOSS_COUNT,
  deriveBossIds,
  deriveStageCheckpoint,
  evaluateStageCheckpoint,
  recommendArtifact,
  validatePrerequisites,
  type CheckpointProblem,
} from "@/lib/pathCheckpoints";
import type { Category, Difficulty, LearningPath } from "@/types/problem";

function facts(
  entries: [string, Category, Difficulty][],
): Map<string, CheckpointProblem> {
  return new Map(
    entries.map(([id, category, difficulty]) => [
      id,
      { id, category, difficulty },
    ]),
  );
}

const META_BY_ID = new Map(PROBLEM_META.map((problem) => [problem.id, problem]));

function realFacts(ids: string[]): Map<string, CheckpointProblem> {
  const map = new Map<string, CheckpointProblem>();
  for (const id of ids) {
    const problem = META_BY_ID.get(id);
    if (problem) map.set(id, problem);
  }
  return map;
}

function makePath(overrides: Partial<LearningPath> & { id: string }): LearningPath {
  return {
    title: overrides.id,
    description: "test path",
    problemIds: [],
    estimatedHours: 1,
    ...overrides,
  };
}

describe("deriveBossIds", () => {
  test("picks the latest Medium/Hard ids in stage order", () => {
    const problems = facts([
      ["a", "ML Fundamentals", "Easy"],
      ["b", "ML Fundamentals", "Medium"],
      ["c", "ML Fundamentals", "Easy"],
      ["d", "ML Fundamentals", "Hard"],
      ["e", "ML Fundamentals", "Easy"],
      ["f", "ML Fundamentals", "Medium"],
      ["g", "ML Fundamentals", "Easy"],
      ["h", "ML Fundamentals", "Hard"],
    ]);
    expect(
      deriveBossIds(["a", "b", "c", "d", "e", "f", "g", "h"], problems),
    ).toEqual(["d", "f", "h"]);
  });

  test("fills from the latest remaining ids when fewer than three are Medium/Hard", () => {
    const problems = facts([
      ["a", "Statistics", "Easy"],
      ["b", "Statistics", "Medium"],
      ["c", "Statistics", "Easy"],
      ["d", "Statistics", "Easy"],
      ["e", "Statistics", "Easy"],
    ]);
    expect(deriveBossIds(["a", "b", "c", "d", "e"], problems)).toEqual([
      "b",
      "d",
      "e",
    ]);
  });

  test("caps the boss set at BOSS_COUNT", () => {
    const problems = facts([
      ["a", "Algorithms", "Hard"],
      ["b", "Algorithms", "Hard"],
      ["c", "Algorithms", "Hard"],
      ["d", "Algorithms", "Hard"],
      ["e", "Algorithms", "Hard"],
    ]);
    expect(deriveBossIds(["a", "b", "c", "d", "e"], problems)).toHaveLength(
      BOSS_COUNT,
    );
  });

  test("ignores ids that have no metadata", () => {
    const problems = facts([
      ["b", "NLP", "Medium"],
      ["c", "NLP", "Easy"],
      ["d", "NLP", "Easy"],
      ["e", "NLP", "Easy"],
    ]);
    expect(
      deriveBossIds(["a", "b", "c", "d", "e", "f"], problems),
    ).toEqual(["b", "d", "e"]);
  });

  test("returns an empty set when nothing is resolvable", () => {
    expect(deriveBossIds(["a", "b"], new Map())).toEqual([]);
    expect(deriveBossIds([], facts([["a", "NLP", "Hard"]]))).toEqual([]);
  });
});

describe("deriveStageCheckpoint", () => {
  test("builds a checkpoint for a non-empty stage", () => {
    const problems = facts([
      ["a", "ML Fundamentals", "Easy"],
      ["b", "ML Fundamentals", "Medium"],
      ["c", "ML Fundamentals", "Hard"],
      ["d", "ML Fundamentals", "Hard"],
    ]);
    const checkpoint = deriveStageCheckpoint(
      { id: "stage-1", problemIds: ["a", "b", "c", "d"] },
      problems,
    );
    expect(checkpoint).not.toBeNull();
    expect(checkpoint?.stageId).toBe("stage-1");
    expect(checkpoint?.bossIds).toEqual(["b", "c", "d"]);
  });

  test("returns null for empty stages and unknown ids", () => {
    expect(
      deriveStageCheckpoint({ id: "empty", problemIds: [] }, new Map()),
    ).toBeNull();
    expect(
      deriveStageCheckpoint({ id: "unknown", problemIds: ["nope"] }, new Map()),
    ).toBeNull();
  });
});

describe("evaluateStageCheckpoint", () => {
  const problems = facts([
    ["e1", "Deep Learning", "Easy"],
    ["e2", "Deep Learning", "Easy"],
    ["m1", "Deep Learning", "Medium"],
    ["m2", "Deep Learning", "Medium"],
    ["h1", "Deep Learning", "Hard"],
  ]);
  const stage = {
    id: "attention",
    problemIds: ["e1", "e2", "m1", "m2", "h1"],
  };

  test("passes with two of three bosses solved, even when stage problems remain", () => {
    const report = evaluateStageCheckpoint(stage, problems, {
      m1: { solved: true },
      m2: { solved: true },
    });
    expect(report.required).toBe(2);
    expect(report.bossSolved).toBe(2);
    expect(report.passed).toBe(true);
    expect(report.allSolved).toBe(false);
    expect(report.complete).toBe(true);
  });

  test("does not pass with a single boss solved", () => {
    const report = evaluateStageCheckpoint(stage, problems, {
      m1: { solved: true },
    });
    expect(report.bossSolved).toBe(1);
    expect(report.passed).toBe(false);
    expect(report.complete).toBe(false);
  });

  test("stays complete when every stage problem is solved", () => {
    const progress = Object.fromEntries(
      stage.problemIds.map((id) => [id, { solved: true }]),
    );
    const report = evaluateStageCheckpoint(stage, problems, progress);
    expect(report.allSolved).toBe(true);
    expect(report.passed).toBe(true);
    expect(report.complete).toBe(true);
  });

  test("adapts the pass threshold to short stages", () => {
    const shortProblems = facts([
      ["a", "Statistics", "Hard"],
      ["b", "Statistics", "Hard"],
    ]);
    const twoBoss = evaluateStageCheckpoint(
      { id: "short", problemIds: ["a", "b"] },
      shortProblems,
      { a: { solved: true } },
    );
    expect(twoBoss.required).toBe(2);
    expect(twoBoss.passed).toBe(false);

    const oneProblem = evaluateStageCheckpoint(
      { id: "tiny", problemIds: ["a"] },
      shortProblems,
      { a: { solved: true } },
    );
    expect(oneProblem.required).toBe(1);
    expect(oneProblem.passed).toBe(true);
  });
});

describe("recommendArtifact", () => {
  test("matches a Deep Learning stage to the Deep Learning lab", () => {
    const problems = realFacts(["dl-034", "dl-035", "dl-036", "dl-087"]);
    const artifact = recommendArtifact(
      ["dl-034", "dl-035", "dl-036", "dl-087"],
      problems,
    );
    expect(artifact?.id).toBe("lab-08");
    expect(artifact?.kind).toBe("lab");
    expect(artifact?.href).toBe("/labs");
  });

  test("matches an NLP stage to the spam-filter lab", () => {
    const problems = realFacts(["nlp-001", "nlp-002", "nlp-020"]);
    const artifact = recommendArtifact(["nlp-001", "nlp-002", "nlp-020"], problems);
    expect(artifact?.id).toBe("lab-02");
    expect(artifact?.kind).toBe("lab");
  });

  test("matches a graph stage to the Dijkstra simulation", () => {
    const problems = realFacts(["graph-019", "graph-021", "graph-127"]);
    const artifact = recommendArtifact(
      ["graph-019", "graph-021", "graph-127"],
      problems,
    );
    expect(artifact?.id).toBe("dijkstra");
    expect(artifact?.kind).toBe("sim");
    expect(artifact?.href).toBe("/sims");
  });

  test("matches an ML Fundamentals stage to a lab", () => {
    const problems = realFacts(["ml-006", "ml-007", "ml-032"]);
    const artifact = recommendArtifact(["ml-006", "ml-007", "ml-032"], problems);
    expect(artifact?.kind).toBe("lab");
    expect(artifact?.id).toBe("lab-01");
  });

  test("returns null when the stage matches no artifact", () => {
    const problems = realFacts(["ts-003"]);
    expect(recommendArtifact(["ts-003"], problems)).toBeNull();
    expect(recommendArtifact([], new Map())).toBeNull();
  });

  test("recommended artifact links point at real routes", () => {
    const catalogues: CheckpointProblem[] = PROBLEM_META.map((problem) => problem);
    const problems = new Map(catalogues.map((p) => [p.id, p]));
    const idsByStage = new Map<string, string[]>();
    for (const problem of PROBLEM_META) {
      const list = idsByStage.get(problem.category) ?? [];
      list.push(problem.id);
      idsByStage.set(problem.category, list);
    }
    const routes = new Set(["/labs", "/projects", "/sims"]);
    for (const ids of idsByStage.values()) {
      const artifact = recommendArtifact(ids, problems);
      if (artifact) expect(routes.has(artifact.href)).toBe(true);
    }
  });
});

describe("validatePrerequisites", () => {
  test("accepts a valid prerequisite DAG", () => {
    const paths = [
      makePath({ id: "a", slug: "a" }),
      makePath({ id: "b", slug: "b", prerequisites: ["a"] }),
      makePath({ id: "c", slug: "c", prerequisites: ["a", "b"] }),
    ];
    expect(validatePrerequisites(paths)).toEqual([]);
  });

  test("accepts prerequisites written as a path id", () => {
    const paths = [
      makePath({ id: "alpha", slug: "alpha-path" }),
      makePath({ id: "beta", slug: "beta-path", prerequisites: ["alpha"] }),
    ];
    expect(validatePrerequisites(paths)).toEqual([]);
  });

  test("flags an unknown prerequisite with the offending slug", () => {
    const issues = validatePrerequisites([
      makePath({ id: "b", slug: "b-path", prerequisites: ["missing"] }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("unknown");
    expect(issues[0].pathId).toBe("b");
    expect(issues[0].slug).toBe("b-path");
    expect(issues[0].message).toContain("slug b-path");
    expect(issues[0].message).toContain("missing");
  });

  test("flags a self-reference", () => {
    const issues = validatePrerequisites([
      makePath({ id: "a", slug: "a", prerequisites: ["a"] }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("self");
    expect(issues[0].slug).toBe("a");
    expect(issues[0].message).toContain("references itself");
  });

  test("flags a cycle once, naming every member", () => {
    const issues = validatePrerequisites([
      makePath({ id: "a", slug: "a", prerequisites: ["b"] }),
      makePath({ id: "b", slug: "b", prerequisites: ["a"] }),
      makePath({ id: "c", slug: "c", prerequisites: ["a"] }),
    ]);
    const cycles = issues.filter((issue) => issue.kind === "cycle");
    expect(cycles).toHaveLength(1);
    expect(cycles[0].slug).toBe("a");
    expect(cycles[0].message).toContain("a -> b -> a");
  });

  test("keeps collecting issues after a broken edge", () => {
    const issues = validatePrerequisites([
      makePath({ id: "a", slug: "a", prerequisites: ["ghost"] }),
      makePath({ id: "b", slug: "b", prerequisites: ["a"] }),
    ]);
    expect(issues.map((issue) => issue.kind)).toEqual(["unknown"]);
    expect(issues[0].slug).toBe("a");
  });
});

describe("resolvePrerequisites", () => {
  test("resolves a slug to a path title", () => {
    expect(resolvePrerequisites(["math-foundations"])).toEqual([
      { slug: "math-foundations", title: "Math Foundations" },
    ]);
  });

  test("drops unknown keys and removes duplicates", () => {
    expect(
      resolvePrerequisites([
        "not-a-path",
        "math-foundations",
        "math-foundations",
      ]),
    ).toEqual([{ slug: "math-foundations", title: "Math Foundations" }]);
  });

  test("returns nothing for no prerequisites", () => {
    expect(resolvePrerequisites([])).toEqual([]);
  });
});
