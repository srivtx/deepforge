import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { resolvePrerequisites } from "@/lib/paths";
import {
  BOSS_COUNT,
  CHECKPOINT_STUDY_HINTS,
  clearCheckpointAttempts,
  deriveBossIds,
  deriveStageCheckpoint,
  evaluateStageCheckpoint,
  getCheckpointAttempt,
  isCheckpointSolved,
  parseCheckpointAttempts,
  readCheckpointAttempts,
  recommendArtifact,
  recordCheckpointAttempt,
  selectBossSet,
  studyHintFor,
  summarizeCheckpoints,
  validatePrerequisites,
  type CheckpointAttempt,
  type CheckpointProblem,
} from "@/lib/pathCheckpoints";
import type { ReviewMap, ReviewState } from "@/lib/reviewQueue";
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

/* ─────────────────────── adaptive checkpoint helpers ───────────────────── */

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
const TODAY = "2026-01-14";

/** Local-noon ISO timestamp so the calendar day is timezone-stable. */
function iso(year: number, month: number, day: number): string {
  return new Date(year, month, day, 12, 0, 0, 0).toISOString();
}

function reviewState(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    ease: 2.5,
    interval: 1,
    due: TODAY,
    reps: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
    ...overrides,
  };
}

function reviewMap(
  entries: Record<string, Partial<ReviewState>>,
): ReviewMap {
  const out: ReviewMap = {};
  for (const [id, state] of Object.entries(entries)) {
    out[id] = reviewState(state);
  }
  return out;
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

/* ───────────────────────── adaptive boss selection ─────────────────────── */

describe("selectBossSet determinism", () => {
  const problems = facts([
    ["a", "Statistics", "Easy"],
    ["b", "Statistics", "Easy"],
    ["c", "Statistics", "Medium"],
    ["d", "Statistics", "Medium"],
    ["e", "Statistics", "Hard"],
    ["f", "Statistics", "Hard"],
  ]);
  const stage = { id: "inference", problemIds: ["a", "b", "c", "d", "e", "f"] };

  test("same state yields the same set and reasons", () => {
    const input = {
      reviews: reviewMap({ b: { due: "2026-01-10" }, e: { lapses: 2 } }),
      progress: { a: { attempted: true }, d: { solved: true } },
      attempt: {
        attempts: 1,
        bossIds: ["f", "e", "d"],
        missedIds: ["f"],
        at: iso(2026, 0, 12),
      } satisfies CheckpointAttempt,
      now: FIXED_NOW,
    };
    const first = selectBossSet(stage, problems, input);
    const second = selectBossSet(stage, problems, { ...input });
    expect(first).not.toBeNull();
    expect(second).toEqual(first);
    expect(selectBossSet(stage, problems, input)).toEqual(first);
  });

  test("review map key order never changes the selection", () => {
    const forward = reviewMap({
      a: { lapses: 2 },
      e: { due: "2026-01-11" },
      f: { lapses: 1 },
    });
    const reverse: ReviewMap = {
      f: forward.f,
      e: forward.e,
      a: forward.a,
    };
    expect(
      selectBossSet(stage, problems, { reviews: reverse, now: FIXED_NOW }),
    ).toEqual(
      selectBossSet(stage, problems, { reviews: forward, now: FIXED_NOW }),
    );
  });

  test("reduces to the baseline boss set when there are no signals", () => {
    const selection = selectBossSet(stage, problems, { now: FIXED_NOW });
    expect(selection?.bossIds).toEqual(deriveBossIds(stage.problemIds, problems));
  });
});

describe("due-review inclusion", () => {
  const problems = facts([
    ["a", "Statistics", "Easy"],
    ["b", "Statistics", "Easy"],
    ["c", "Statistics", "Easy"],
    ["d", "Statistics", "Medium"],
    ["e", "Statistics", "Medium"],
    ["f", "Statistics", "Hard"],
  ]);
  const stage = { id: "inference", problemIds: ["a", "b", "c", "d", "e", "f"] };

  test("includes one due problem from the stage with a due-review reason", () => {
    const selection = selectBossSet(stage, problems, {
      reviews: reviewMap({
        c: { due: "2026-01-10" },
        e: { due: "2026-01-12", lapses: 3 },
      }),
      now: FIXED_NOW,
    });
    expect(selection?.bossIds).toContain("e");
    expect(selection?.reasons.e).toBe("due-review");
    expect(selection?.dueIds).toEqual(["e", "c"]);
    expect(selection?.bossIds).toHaveLength(BOSS_COUNT);
  });

  test("ignores problems whose due date is in the future", () => {
    const selection = selectBossSet(stage, problems, {
      reviews: reviewMap({ f: { due: "2026-02-01" } }),
      now: FIXED_NOW,
    });
    expect(selection?.dueIds).toEqual([]);
    expect(selection?.reasons.f).not.toBe("due-review");
  });

  test("a due item only counts as solved after it was re-solved on/after due", () => {
    const three = facts([
      ["a", "Statistics", "Hard"],
      ["b", "Statistics", "Hard"],
      ["c", "Statistics", "Hard"],
    ]);
    const tiny = { id: "tiny", problemIds: ["a", "b", "c"] };
    const reviews = reviewMap({ a: { due: "2026-01-10" } });
    const stale = evaluateStageCheckpoint(
      tiny,
      three,
      { a: { solved: true, solvedAt: iso(2026, 0, 5) }, b: { solved: true } },
      { reviews, now: FIXED_NOW },
    );
    expect(stale.bossSolved).toBe(1);
    expect(stale.passed).toBe(false);

    const fresh = evaluateStageCheckpoint(
      tiny,
      three,
      { a: { solved: true, solvedAt: iso(2026, 0, 12) }, b: { solved: true } },
      { reviews, now: FIXED_NOW },
    );
    expect(fresh.bossSolved).toBe(2);
    expect(fresh.passed).toBe(true);

    expect(isCheckpointSolved("a", { a: { solved: true } }, reviews, TODAY)).toBe(
      true,
    );
    expect(
      isCheckpointSolved(
        "a",
        { a: { solved: true, solvedAt: iso(2026, 0, 5) } },
        reviews,
        TODAY,
      ),
    ).toBe(false);
  });
});

describe("difficulty weighting", () => {
  const problems = facts([
    ["e1", "Deep Learning", "Easy"],
    ["e2", "Deep Learning", "Easy"],
    ["e3", "Deep Learning", "Easy"],
    ["h1", "Deep Learning", "Hard"],
    ["h2", "Deep Learning", "Hard"],
    ["h3", "Deep Learning", "Hard"],
  ]);
  const stage = {
    id: "attention",
    problemIds: ["e1", "e2", "e3", "h1", "h2", "h3"],
  };

  test("lapses on the Hard tier pull the set toward Hard", () => {
    const selection = selectBossSet(stage, problems, {
      reviews: reviewMap({
        h1: { lapses: 3, due: "2026-02-01" },
        h2: { lapses: 2, due: "2026-02-01" },
        h3: { lapses: 1, due: "2026-02-01" },
      }),
      now: FIXED_NOW,
    });
    expect(selection?.bossIds).toEqual(["h1", "h2", "h3"]);
    expect(selection?.difficultyWeights.Hard).toBe(6);
    expect(selection?.reasons.h1).toBe("weak-tier");
  });

  test("attempted-but-unsolved Easy work pulls the set toward Easy", () => {
    const selection = selectBossSet(stage, problems, {
      progress: { e1: { attempted: true }, e2: { attempted: true } },
      now: FIXED_NOW,
    });
    expect(selection?.bossIds).toEqual(["e1", "e2", "e3"]);
    expect(selection?.difficultyWeights.Easy).toBe(2);
    expect(selection?.difficultyWeights.Hard).toBe(0);
  });

  test("without signals the baseline Medium/Hard preference stands", () => {
    const selection = selectBossSet(stage, problems, { now: FIXED_NOW });
    expect(selection?.bossIds).toEqual(["h1", "h2", "h3"]);
  });
});

describe("category coverage", () => {
  test("covers distinct stage categories before repeating one", () => {
    const problems = facts([
      ["s1", "Statistics", "Hard"],
      ["s2", "Statistics", "Hard"],
      ["a1", "Algorithms", "Hard"],
      ["a2", "Algorithms", "Hard"],
      ["a3", "Algorithms", "Hard"],
    ]);
    const stage = {
      id: "mixed",
      problemIds: ["s1", "s2", "a1", "a2", "a3"],
    };
    expect(deriveBossIds(stage.problemIds, problems)).toEqual([
      "a1",
      "a2",
      "a3",
    ]);

    const selection = selectBossSet(stage, problems, { now: FIXED_NOW });
    const chosenCategories = new Set(
      selection?.bossIds.map((id) => problems.get(id)?.category),
    );
    expect(chosenCategories).toEqual(
      new Set(["Statistics", "Algorithms"]),
    );
    expect(selection?.reasons.s2).toBe("coverage");
    expect(selection?.reasons.a3).toBe("coverage");
  });
});

describe("retry adaptation", () => {
  const problems = facts([
    ["a", "Algorithms", "Hard"],
    ["b", "Algorithms", "Hard"],
    ["c", "Algorithms", "Hard"],
    ["d", "Algorithms", "Medium"],
    ["e", "Algorithms", "Medium"],
    ["f", "Algorithms", "Medium"],
  ]);
  const stage = {
    id: "graphs",
    problemIds: ["a", "b", "c", "d", "e", "f"],
  };
  const attempt: CheckpointAttempt = {
    attempts: 1,
    bossIds: ["f", "e", "d"],
    missedIds: ["f", "e"],
    at: iso(2026, 0, 12),
  };

  test("swaps still-unsolved misses for replacement boss ids", () => {
    const selection = selectBossSet(stage, problems, {
      attempt,
      now: FIXED_NOW,
    });
    expect(selection?.bossIds).toEqual(["b", "c", "d"]);
    expect(selection?.bossIds).not.toContain("f");
    expect(selection?.bossIds).not.toContain("e");
    expect(selection?.replacedIds).toEqual(["f", "e"]);
    expect(selection?.reasons.b).toBe("replacement");
  });

  test("a solved miss becomes eligible again", () => {
    const selection = selectBossSet(stage, problems, {
      attempt,
      progress: {
        e: { solved: true, solvedAt: iso(2026, 0, 13) },
        f: { solved: true, solvedAt: iso(2026, 0, 13) },
      },
      now: FIXED_NOW,
    });
    expect(selection?.replacedIds).toEqual([]);
    expect(selection?.bossIds).toEqual(["d", "e", "f"]);
  });

  test("falls back to the missed ids when the stage has no alternatives", () => {
    const tiny = facts([
      ["a", "Algorithms", "Hard"],
      ["b", "Algorithms", "Hard"],
      ["c", "Algorithms", "Hard"],
    ]);
    const allMissed: CheckpointAttempt = {
      attempts: 2,
      bossIds: ["c", "b", "a"],
      missedIds: ["c", "b", "a"],
      at: iso(2026, 0, 12),
    };
    const selection = selectBossSet(
      { id: "tiny", problemIds: ["a", "b", "c"] },
      tiny,
      { attempt: allMissed, now: FIXED_NOW },
    );
    expect(selection?.bossIds).toEqual(["a", "b", "c"]);
    expect(selection?.replacedIds).toEqual([]);
  });

  test("a recorded failure surfaces a revisit list and a retry action", () => {
    const stageProblems = facts([
      ["a", "Statistics", "Medium"],
      ["b", "Statistics", "Medium"],
      ["c", "Statistics", "Medium"],
      ["d", "Statistics", "Hard"],
    ]);
    const report = evaluateStageCheckpoint(
      { id: "inference", problemIds: ["a", "b", "c", "d"] },
      stageProblems,
      { a: { solved: true } },
      {
        attempt: {
          attempts: 1,
          bossIds: ["d", "c", "b"],
          missedIds: ["d", "c"],
          at: iso(2026, 0, 12),
        },
        now: FIXED_NOW,
      },
    );
    expect(report.outcome).toBe("failed");
    expect(report.nextAction).toBe("retry");
    expect(report.attemptCount).toBe(1);
    expect(report.revisit?.missedIds).toEqual(["d", "c"]);
    expect(report.revisit?.category).toBe("Statistics");
    expect(report.revisit?.hint).toBe(studyHintFor("Statistics"));
    expect(report.revisit?.firstProblemId).toBe("d");
    expect(report.revisit?.hint).not.toContain("def ");
  });

  test("remediating every miss clears the revisit list and passes", () => {
    const stageProblems = facts([
      ["a", "Statistics", "Medium"],
      ["b", "Statistics", "Medium"],
      ["c", "Statistics", "Medium"],
      ["d", "Statistics", "Hard"],
    ]);
    const attempt: CheckpointAttempt = {
      attempts: 1,
      bossIds: ["d", "c", "b"],
      missedIds: ["d", "c"],
      at: iso(2026, 0, 12),
    };
    const report = evaluateStageCheckpoint(
      { id: "inference", problemIds: ["a", "b", "c", "d"] },
      stageProblems,
      {
        c: { solved: true, solvedAt: iso(2026, 0, 13) },
        d: { solved: true, solvedAt: iso(2026, 0, 13) },
      },
      { attempt, now: FIXED_NOW },
    );
    expect(report.revisit).toBeNull();
    expect(report.passed).toBe(true);
    expect(report.outcome).toBe("passed");
    expect(report.nextAction).toBe("advance");
  });
});

describe("adaptive invariants", () => {
  test("caps the set, keeps ids unique, and stays inside the stage", () => {
    const problems = facts([
      ["a", "NLP", "Easy"],
      ["b", "NLP", "Easy"],
      ["c", "NLP", "Medium"],
      ["d", "NLP", "Medium"],
      ["e", "NLP", "Hard"],
      ["f", "NLP", "Hard"],
      ["g", "NLP", "Hard"],
      ["h", "NLP", "Hard"],
    ]);
    const stage = {
      id: "tokens",
      problemIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
    };
    const selection = selectBossSet(stage, problems, {
      reviews: reviewMap({ a: { due: "2026-01-01" }, g: { lapses: 4 } }),
      progress: { h: { attempted: true } },
      attempt: {
        attempts: 1,
        bossIds: ["h", "g", "f"],
        missedIds: ["h", "g"],
        at: iso(2026, 0, 12),
      },
      now: FIXED_NOW,
    });
    expect(selection).not.toBeNull();
    const bossIds = selection?.bossIds ?? [];
    expect(bossIds).toHaveLength(BOSS_COUNT);
    expect(new Set(bossIds).size).toBe(BOSS_COUNT);
    for (const id of bossIds) expect(stage.problemIds).toContain(id);
  });

  test("empty stages and unknown ids yield no checkpoint", () => {
    expect(selectBossSet({ id: "empty", problemIds: [] }, new Map())).toBeNull();
    expect(
      selectBossSet({ id: "unknown", problemIds: ["nope"] }, new Map()),
    ).toBeNull();
    expect(
      deriveStageCheckpoint({ id: "empty", problemIds: [] }, new Map()),
    ).toBeNull();

    const report = evaluateStageCheckpoint(
      { id: "empty", problemIds: [] },
      new Map(),
      {},
    );
    expect(report.checkpoint).toBeNull();
    expect(report.bossSolved).toBe(0);
    expect(report.required).toBe(0);
    expect(report.passed).toBe(false);
    expect(report.complete).toBe(false);
    expect(report.outcome).toBeNull();
    expect(report.revisit).toBeNull();
    expect(report.dueReviewIds).toEqual([]);
    expect(report.nextAction).toBe("review");
  });

  test("a one-problem stage passes with a single boss", () => {
    const problems = facts([["only", "Calculus", "Hard"]]);
    const report = evaluateStageCheckpoint(
      { id: "tiny", problemIds: ["only"] },
      problems,
      { only: { solved: true } },
    );
    expect(report.required).toBe(1);
    expect(report.passed).toBe(true);
    expect(report.outcome).toBe("passed-clean");
  });
});

describe("summarizeCheckpoints", () => {
  test("rolls up pass and retry state across stages", () => {
    const problems = facts([
      ["a", "Statistics", "Hard"],
      ["b", "Statistics", "Hard"],
      ["c", "Statistics", "Hard"],
      ["d", "Statistics", "Hard"],
      ["e", "Statistics", "Hard"],
      ["f", "Statistics", "Hard"],
    ]);
    const stages = [
      { id: "one", problemIds: ["a", "b", "c"] },
      { id: "two", problemIds: ["d", "e", "f"] },
    ];
    const attempts = {
      "path::two": {
        attempts: 1,
        bossIds: ["f", "e", "d"],
        missedIds: ["d"],
        at: iso(2026, 0, 12),
      },
    };
    const summary = summarizeCheckpoints(
      stages,
      problems,
      { a: { solved: true }, b: { solved: true } },
      { pathId: "path", attempts, now: FIXED_NOW },
    );
    expect(summary).toEqual({
      total: 2,
      passed: 1,
      failed: 1,
      complete: 1,
      due: 0,
      nextAction: "retry",
    });
  });

  test("an empty stage list yields no action", () => {
    expect(summarizeCheckpoints([], new Map(), {})).toEqual({
      total: 0,
      passed: 0,
      failed: 0,
      complete: 0,
      due: 0,
      nextAction: null,
    });
  });
});

describe("checkpoint hints", () => {
  test("every catalogue category has a plain-language hint", () => {
    const categories = new Set<Category>(
      PROBLEM_META.map((problem) => problem.category),
    );
    for (const category of categories) {
      const hint = studyHintFor(category);
      expect(hint.length).toBeGreaterThan(20);
      expect(hint).toBe(CHECKPOINT_STUDY_HINTS[category]);
      expect(hint).not.toContain("def ");
      expect(hint).not.toContain("return ");
    }
    expect(studyHintFor(null).length).toBeGreaterThan(20);
  });
});

describe("checkpoint attempt store", () => {
  test("records, increments, and reads per path + stage", () => {
    clearCheckpointAttempts();
    const first = recordCheckpointAttempt(
      "path-a",
      "stage-1",
      ["a", "b", "c"],
      { a: { solved: true } },
      { now: FIXED_NOW },
    );
    expect(first.attempts).toBe(1);
    expect(first.missedIds).toEqual(["b", "c"]);
    expect(first.at).toBe(FIXED_NOW.toISOString());

    const second = recordCheckpointAttempt(
      "path-a",
      "stage-1",
      ["b", "c", "d"],
      {},
      { now: FIXED_NOW },
    );
    expect(second.attempts).toBe(2);
    expect(second.missedIds).toEqual(["b", "c", "d"]);
    expect(readCheckpointAttempts()["path-a::stage-1"]?.attempts).toBe(2);
    expect(getCheckpointAttempt("path-a", "stage-1")?.attempts).toBe(2);
    expect(getCheckpointAttempt("path-b", "stage-1")).toBeNull();
    clearCheckpointAttempts();
  });

  test("a due boss only counts as solved once refreshed on/after due", () => {
    clearCheckpointAttempts();
    const reviews = reviewMap({ b: { due: "2026-01-10" } });
    const attempt = recordCheckpointAttempt(
      "path-a",
      "stage-2",
      ["a", "b"],
      { a: { solved: true }, b: { solved: true, solvedAt: iso(2026, 0, 5) } },
      { reviews, now: FIXED_NOW },
    );
    expect(attempt.missedIds).toEqual(["b"]);
    clearCheckpointAttempts();
  });

  test("sanitizes malformed payloads instead of throwing", () => {
    expect(parseCheckpointAttempts(null)).toEqual({});
    expect(parseCheckpointAttempts("{not json")).toEqual({});
    expect(parseCheckpointAttempts("[]")).toEqual({});
    const parsed = parseCheckpointAttempts(
      JSON.stringify({
        ok: {
          attempts: 2,
          bossIds: ["a", 7],
          missedIds: [],
          at: iso(2026, 0, 12),
        },
        bad: { attempts: "x" },
        alsoBad: "nope",
      }),
    );
    expect(Object.keys(parsed)).toEqual(["ok"]);
    expect(parsed.ok.bossIds).toEqual(["a"]);
    expect(parsed.ok.attempts).toBe(2);
  });
});
