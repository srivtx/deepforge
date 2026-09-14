import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import type { PathLevel, ResolvedLearningPath } from "@/lib/paths";
import type { ProgressMap } from "@/lib/progress";
import {
  DIAGNOSTIC_MAX_QUESTIONS,
  DIAGNOSTIC_MIN_QUESTIONS,
  PLACEMENT_DRAFT_KEY,
  PLACEMENT_STORAGE_KEY,
  answerFor,
  buildStartingPlan,
  categoryLevel,
  clearDraft,
  clearPlacement,
  hasAnyProgress,
  nextQuestion,
  parseDraft,
  parsePlacement,
  placementToPlan,
  readDraft,
  readPlacement,
  recommendPaths,
  saveDraft,
  savePlacement,
  scoreDiagnostic,
  shouldOfferDiagnostic,
  suggestCadence,
  suggestDailyTarget,
  type DiagnosticAnswer,
  type PlacementRecord,
} from "@/lib/onboarding";
import type { Category, Difficulty } from "@/types/problem";

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

function storage(): Storage {
  return (globalScope.window as { localStorage: Storage }).localStorage;
}

/* ───────────────────────────── helpers ───────────────────────────── */

function answer(
  category: Category,
  difficulty: Difficulty,
  correct: boolean,
  id = `${category}:${difficulty}:${correct}`,
): DiagnosticAnswer {
  return { problemId: id, category, difficulty, correct };
}

type Pattern = (index: number, question: ProblemMeta) => boolean;

function runDiagnostic(areas: Category[], pattern: Pattern) {
  const questions: ProblemMeta[] = [];
  const answers: DiagnosticAnswer[] = [];
  for (;;) {
    const question = nextQuestion(answers, areas);
    if (!question) break;
    questions.push(question);
    answers.push(answerFor(question, pattern(questions.length - 1, question)));
    if (answers.length > DIAGNOSTIC_MAX_QUESTIONS + 1) {
      throw new Error("staircase did not stop");
    }
  }
  return { questions, answers };
}

function firstAnchor(category: Category, difficulty: Difficulty): ProblemMeta {
  return PROBLEM_META.filter(
    (problem) =>
      problem.category === category && problem.difficulty === difficulty,
  ).sort((a, b) => (a.id < b.id ? -1 : 1))[0];
}

function syntheticPath(
  id: string,
  title: string,
  level: PathLevel,
  prerequisites: string[],
  tags: string[],
  problemIds: string[] = [],
): ResolvedLearningPath {
  return {
    id,
    slug: id,
    title,
    description: "",
    estimatedHours: 1,
    level,
    tags,
    goals: [],
    prerequisites,
    stages: [],
    hasStages: false,
    problemIds,
  };
}

const SYNTH_META: ProblemMeta[] = [
  { id: "e1", title: "Easy One", category: "Calculus", difficulty: "Easy" },
  { id: "m1", title: "Medium One", category: "Calculus", difficulty: "Medium" },
  { id: "h1", title: "Hard One", category: "Calculus", difficulty: "Hard" },
];

/* ────────────────────────── question staircase ───────────────────────── */

describe("question staircase", () => {
  test("starts with the first interest area's Easy anchor", () => {
    const question = nextQuestion([], ["Calculus"]);
    expect(question).not.toBeNull();
    expect(question?.category).toBe("Calculus");
    expect(question?.difficulty).toBe("Easy");
    expect(question?.id).toBe(firstAnchor("Calculus", "Easy").id);
  });

  test("walks one Easy question per category, never repeating a problem", () => {
    const { questions } = runDiagnostic([], () => false);
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(questions).toHaveLength(DIAGNOSTIC_MIN_QUESTIONS);
    expect(new Set(questions.map((question) => question.category)).size).toBe(
      DIAGNOSTIC_MIN_QUESTIONS,
    );
    for (const question of questions) {
      expect(question.difficulty).toBe("Easy");
    }
  });

  test("every answer wrong stops at the minimum (8)", () => {
    const { questions } = runDiagnostic([], () => false);
    expect(questions).toHaveLength(DIAGNOSTIC_MIN_QUESTIONS);
  });

  test("every answer correct stops at the maximum (12)", () => {
    const { questions, answers } = runDiagnostic([], () => true);
    expect(questions).toHaveLength(DIAGNOSTIC_MAX_QUESTIONS);
    expect(scoreDiagnostic(answers).level).toBe(2);
  });

  test("a mixed sequence stops between 8 and 12 and is deterministic", () => {
    const pattern: Pattern = (index) => index % 3 !== 1;
    const first = runDiagnostic(["Deep Learning"], pattern);
    const second = runDiagnostic(["Deep Learning"], pattern);
    expect(first.questions.map((q) => q.id)).toEqual(
      second.questions.map((q) => q.id),
    );
    expect(first.questions.length).toBeGreaterThanOrEqual(
      DIAGNOSTIC_MIN_QUESTIONS,
    );
    expect(first.questions.length).toBeLessThanOrEqual(
      DIAGNOSTIC_MAX_QUESTIONS,
    );
    expect(scoreDiagnostic(first.answers)).toEqual(
      scoreDiagnostic(second.answers),
    );
  });

  test("selected areas are asked before the rest of the catalogue", () => {
    const { questions } = runDiagnostic(["NLP", "Statistics"], () => false);
    const expected: Category[] = [
      "Statistics",
      "NLP",
      "Linear Algebra",
      "Calculus",
      "Probability",
      "ML Fundamentals",
      "Deep Learning",
      "Optimization",
    ];
    expect(questions.map((question) => question.category)).toEqual(expected);
  });

  test("escalates a correct Easy answer to Medium, then Hard", () => {
    const coverage: DiagnosticAnswer[] = [
      answer("Calculus", "Easy", true),
      answer("Linear Algebra", "Easy", false),
      answer("Statistics", "Easy", false),
      answer("Probability", "Easy", false),
      answer("ML Fundamentals", "Easy", false),
      answer("Deep Learning", "Easy", false),
      answer("NLP", "Easy", false),
      answer("Optimization", "Easy", false),
    ];
    const first = nextQuestion(coverage, []);
    expect(first?.id).toBe(firstAnchor("Calculus", "Medium").id);
    const second = nextQuestion(
      [...coverage, answerFor(first as ProblemMeta, true)],
      [],
    );
    expect(second?.id).toBe(firstAnchor("Calculus", "Hard").id);
  });

  test("handles an empty pool without throwing", () => {
    expect(nextQuestion([], [], [])).toBeNull();
    expect(categoryLevel([])).toBe(0);
  });
});

/* ────────────────────────────── scoring ────────────────────────────── */

describe("scoring and level mapping", () => {
  test("empty answers score as level 0 with no weak categories", () => {
    const score = scoreDiagnostic([]);
    expect(score.level).toBe(0);
    expect(score.answered).toBe(0);
    expect(score.score).toBe(0);
    expect(score.weakCategories).toEqual([]);
    expect(score.strengths).toEqual([]);
  });

  test("all wrong answers score level 0 with every asked category weak", () => {
    const answers = [
      answer("Calculus", "Easy", false),
      answer("Statistics", "Easy", false),
      answer("NLP", "Easy", false),
    ];
    const score = scoreDiagnostic(answers);
    expect(score.level).toBe(0);
    expect(score.score).toBe(0);
    expect(score.weakCategories).toEqual(["Calculus", "Statistics", "NLP"]);
    expect(score.strengths).toEqual([]);
    expect(score.perCategory).toEqual({
      Calculus: 0,
      Statistics: 0,
      NLP: 0,
    });
  });

  test("about half the Easy questions correct maps to level 1", () => {
    const answers = [
      answer("Calculus", "Easy", true),
      answer("Statistics", "Easy", true),
      answer("NLP", "Easy", true),
      answer("Probability", "Easy", true),
      answer("Optimization", "Easy", false),
    ];
    const score = scoreDiagnostic(answers);
    expect(score.level).toBe(1);
    expect(score.score).toBe(0.8);
    expect(score.weakCategories).toEqual(["Optimization"]);
    expect(score.strengths).toEqual([]);
  });

  test("one Medium correct is not enough for level 2; two are", () => {
    const one = scoreDiagnostic([
      answer("Calculus", "Easy", true),
      answer("Calculus", "Medium", true),
    ]);
    expect(one.level).toBe(1);
    const two = scoreDiagnostic([
      answer("Calculus", "Easy", true),
      answer("Calculus", "Medium", true),
      answer("Statistics", "Easy", true),
      answer("Statistics", "Medium", true),
    ]);
    expect(two.level).toBe(2);
    expect(two.strengths).toEqual(["Calculus", "Statistics"]);
  });

  test("a correct Hard answer alone pushes level 2", () => {
    const score = scoreDiagnostic([
      answer("Deep Learning", "Easy", false),
      answer("Deep Learning", "Hard", true),
    ]);
    expect(score.level).toBe(2);
    expect(score.weakCategories).toEqual(["Deep Learning"]);
    expect(score.strengths).toEqual(["Deep Learning"]);
  });

  test("weak categories rank by misses, then lowest level, then catalogue order", () => {
    const answers = [
      answer("NLP", "Easy", false),
      answer("NLP", "Medium", false),
      answer("Calculus", "Easy", false),
      answer("Calculus", "Easy", true),
    ];
    const score = scoreDiagnostic(answers);
    expect(score.weakCategories[0]).toBe("NLP");
    expect(score.weakCategories[1]).toBe("Calculus");
  });

  test("is deterministic for the same answers", () => {
    const answers = [
      answer("Calculus", "Easy", true),
      answer("NLP", "Easy", false),
      answer("Calculus", "Medium", true),
    ];
    expect(scoreDiagnostic(answers)).toEqual(scoreDiagnostic([...answers]));
  });
});

/* ─────────────────────── path recommendation ───────────────────────── */

describe("path recommendation ranking", () => {
  test("level 0 recommends only Beginner paths, two to three of them", () => {
    const recs = recommendPaths({ level: 0, weakCategories: ["Linear Algebra"] });
    expect(recs.length).toBeGreaterThanOrEqual(2);
    expect(recs.length).toBeLessThanOrEqual(3);
    for (const rec of recs) expect(rec.level).toBe("Beginner");
    expect(recs[0].id).toBe("math-foundations");
  });

  test("level 1 never recommends an Advanced path", () => {
    const recs = recommendPaths({ level: 1, weakCategories: [] });
    for (const rec of recs) {
      expect(rec.level === "Advanced").toBe(false);
    }
  });

  test("level 2 can reach Advanced paths when a weak area matches", () => {
    const recs = recommendPaths({
      level: 2,
      weakCategories: ["Deep Learning"],
    });
    expect(recs.some((rec) => rec.level === "Advanced")).toBe(true);
  });

  test("never recommends a path whose prerequisite outranks the level", () => {
    const paths = [
      syntheticPath("intro", "Intro", "Beginner", [], ["math"]),
      syntheticPath("mid", "Mid", "Intermediate", ["intro"], ["math"]),
      syntheticPath("late", "Late", "Advanced", ["mid"], ["math"]),
    ];
    const level0 = recommendPaths(
      { level: 0, weakCategories: [] },
      { paths },
    );
    expect(level0.map((rec) => rec.id)).toEqual(["intro"]);
    const level1 = recommendPaths(
      { level: 1, weakCategories: [] },
      { paths },
    );
    expect(level1.map((rec) => rec.id)).toContain("mid");
    expect(level1.map((rec) => rec.id)).not.toContain("late");
    const level2 = recommendPaths(
      { level: 2, weakCategories: [] },
      { paths },
    );
    expect(level2.map((rec) => rec.id)).toContain("late");
  });

  test("drops paths with an unresolvable prerequisite", () => {
    const paths = [
      syntheticPath("safe", "Safe", "Beginner", [], ["math"]),
      syntheticPath("ghost", "Ghost", "Beginner", ["missing"], ["math"]),
    ];
    const recs = recommendPaths({ level: 0, weakCategories: [] }, { paths });
    expect(recs.map((rec) => rec.id)).toEqual(["safe"]);
  });

  test("weak categories outrank interests and untouched categories", () => {
    const paths = [
      syntheticPath("math", "Math Path", "Beginner", [], ["math"]),
      syntheticPath("calc", "Calc Path", "Beginner", [], ["calculus"]),
      syntheticPath("nlp", "NLP Path", "Beginner", [], ["nlp"]),
    ];
    const recs = recommendPaths(
      { level: 0, weakCategories: ["Calculus"] },
      { paths, interests: ["NLP"] },
    );
    expect(recs.map((rec) => rec.id)).toEqual(["calc", "nlp", "math"]);
    expect(recs[0].why).toContain("Calculus");
    expect(recs[1].why).toContain("NLP");
  });

  test("first problems respect the diagnosed difficulty cap", () => {
    const paths = [
      syntheticPath("calc", "Calc Path", "Beginner", [], ["calculus"], [
        "e1",
        "m1",
        "h1",
      ]),
    ];
    const beginner = recommendPaths(
      { level: 0, weakCategories: [] },
      { paths, problems: SYNTH_META },
    );
    expect(beginner[0].firstProblemIds).toEqual(["e1"]);

    const advanced = recommendPaths(
      { level: 2, weakCategories: [] },
      { paths, problems: SYNTH_META },
    );
    expect(advanced[0].firstProblemIds).toEqual(["e1", "m1", "h1"]);
  });

  test("skips solved problems when a progress map is provided", () => {
    const paths = [
      syntheticPath("calc", "Calc Path", "Beginner", [], ["calculus"], [
        "e1",
        "m1",
      ]),
    ];
    const progress: ProgressMap = { e1: { solved: true, solvedAt: "x" } };
    const recs = recommendPaths(
      { level: 1, weakCategories: [] },
      { paths, problems: SYNTH_META, progress },
    );
    expect(recs[0].firstProblemIds).toEqual(["m1"]);
  });
});

/* ─────────────────────────── starting plan ─────────────────────────── */

describe("starting plan", () => {
  test("an empty answer set still produces a gentle, complete plan", () => {
    const plan = buildStartingPlan([], { minutesPerDay: 10 });
    expect(plan.answered).toBe(0);
    expect(plan.level).toBe(0);
    expect(plan.recommendedPaths.length).toBeGreaterThanOrEqual(2);
    expect(plan.dailyTarget).toBe(2);
    expect(plan.firstProblemIds.length).toBeGreaterThan(0);
    expect(plan.summary).toContain("No answers yet");
    expect(plan.note).toContain("rough starting point");
    const metaById = new Map(PROBLEM_META.map((p) => [p.id, p]));
    for (const id of plan.firstProblemIds) {
      expect(metaById.get(id)?.difficulty).toBe("Easy");
    }
  });

  test("first problems never include an already-solved problem", () => {
    const base = buildStartingPlan(
      [
        answer("Linear Algebra", "Easy", false),
        answer("Calculus", "Easy", false),
      ],
      { minutesPerDay: 30 },
    );
    expect(base.firstProblemIds.length).toBeGreaterThan(0);
    const solvedId = base.firstProblemIds[0];
    const progress: ProgressMap = {
      [solvedId]: { solved: true, solvedAt: "2026-01-01T00:00:00.000Z" },
    };
    const next = buildStartingPlan([], { minutesPerDay: 30, progress });
    expect(next.firstProblemIds).not.toContain(solvedId);
  });

  test("cadence scales with level and available minutes", () => {
    expect(suggestDailyTarget(0, 10)).toBe(2);
    expect(suggestDailyTarget(1, 20)).toBe(4);
    expect(suggestDailyTarget(2, 30)).toBe(6);
    const { cadence } = suggestCadence(1, 20);
    expect(cadence).toContain("4 problems a day");
    expect(cadence).toContain("20 minutes");
  });

  test("is deterministic for a fixed answer sequence", () => {
    const answers = [
      answer("Statistics", "Easy", true),
      answer("NLP", "Easy", false),
      answer("Statistics", "Medium", true),
    ];
    const first = buildStartingPlan(answers, { minutesPerDay: 20 });
    const second = buildStartingPlan(answers, { minutesPerDay: 20 });
    expect(second.recommendedPaths.map((rec) => rec.id)).toEqual(
      first.recommendedPaths.map((rec) => rec.id),
    );
    expect(second.firstProblemIds).toEqual(first.firstProblemIds);
    expect(second.level).toBe(first.level);
  });
});

/* ──────────────────────────── persistence ──────────────────────────── */

describe("local persistence", () => {
  test("save and read round-trip the placement record", () => {
    const plan = buildStartingPlan(
      [
        answer("Linear Algebra", "Easy", true),
        answer("Calculus", "Easy", true),
        answer("Statistics", "Easy", false),
      ],
      { minutesPerDay: 30, areas: ["Linear Algebra"] },
    );
    const saved = savePlacement(plan);
    const read = readPlacement();
    expect(read).toEqual(saved);
    expect(read?.level).toBe(plan.level);
    expect(read?.firstProblemIds).toEqual(plan.firstProblemIds);
    expect(read?.recommendedPathIds).toEqual(
      plan.recommendedPaths.map((rec) => rec.id),
    );
    expect(read?.interests).toEqual(["Linear Algebra"]);
    expect(storage().getItem(PLACEMENT_DRAFT_KEY)).toBeNull();
  });

  test("malformed or foreign payloads read as no placement", () => {
    storage().setItem(PLACEMENT_STORAGE_KEY, "{not json");
    expect(readPlacement()).toBeNull();
    storage().setItem(PLACEMENT_STORAGE_KEY, "[]");
    expect(readPlacement()).toBeNull();
    storage().setItem(
      PLACEMENT_STORAGE_KEY,
      JSON.stringify({ at: "2026-01-01T00:00:00.000Z", level: 9 }),
    );
    expect(readPlacement()).toBeNull();
    expect(parsePlacement(null)).toBeNull();
  });

  test("sanitizes out-of-band fields instead of throwing", () => {
    const parsed = parsePlacement(
      JSON.stringify({
        at: "2026-01-01T00:00:00.000Z",
        level: 1,
        answered: "many",
        score: 42,
        weakCategories: ["Calculus", "Not A Category", "Calculus"],
        recommendedPathIds: ["a", "a", 3],
        dailyTarget: 99,
      }),
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.answered).toBe(0);
    expect(parsed?.score).toBe(1);
    expect(parsed?.weakCategories).toEqual(["Calculus"]);
    expect(parsed?.recommendedPathIds).toEqual(["a"]);
    expect(parsed?.dailyTarget).toBe(10);
  });

  test("clear removes the placement", () => {
    savePlacement(buildStartingPlan([], { minutesPerDay: 20 }));
    expect(readPlacement()).not.toBeNull();
    clearPlacement();
    expect(readPlacement()).toBeNull();
    expect(storage().getItem(PLACEMENT_STORAGE_KEY)).toBeNull();
  });

  test("draft save, read, parse and clear round-trip", () => {
    const draft = saveDraft({
      areas: ["NLP"],
      minutesPerDay: 10,
      answers: [answer("NLP", "Easy", true, "nlp-001")],
    });
    expect(readDraft()).toEqual(draft);
    expect(readDraft()?.answers[0].problemId).toBe("nlp-001");
    expect(storage().getItem(PLACEMENT_DRAFT_KEY)).not.toBeNull();
    clearDraft();
    expect(readDraft()).toBeNull();
    expect(parseDraft("oops")).toBeNull();
  });

  test("placementToPlan rebuilds the same recommendations from the record", () => {
    const plan = buildStartingPlan(
      [
        answer("Deep Learning", "Easy", true),
        answer("Deep Learning", "Medium", true),
        answer("NLP", "Easy", false),
      ],
      { minutesPerDay: 20, areas: ["Deep Learning"] },
    );
    const record = savePlacement(plan);
    const rebuilt = placementToPlan(record);
    expect(rebuilt.level).toBe(plan.level);
    expect(rebuilt.recommendedPaths.map((rec) => rec.id)).toEqual(
      plan.recommendedPaths.map((rec) => rec.id),
    );
    expect(rebuilt.firstProblemIds).toEqual(plan.firstProblemIds);
    expect(rebuilt.levelDetail).toBe(plan.levelDetail);
  });

  test("the stored record keeps its shape for a sync hand-off later", () => {
    savePlacement(buildStartingPlan([], { minutesPerDay: 20 }));
    const raw = storage().getItem(PLACEMENT_STORAGE_KEY) as string;
    const value = JSON.parse(raw) as PlacementRecord;
    expect(value.v).toBe(1);
    expect(PLACEMENT_STORAGE_KEY).toBe("deepforge:placement:v1");
  });
});

/* ────────────────────────── entry / skip gate ──────────────────────── */

describe("entry gate", () => {
  test("hasAnyProgress is false only for a clean account", () => {
    expect(hasAnyProgress({})).toBe(false);
    expect(hasAnyProgress({ a: {} })).toBe(false);
    expect(hasAnyProgress({ a: { attempted: true } })).toBe(true);
    expect(hasAnyProgress({ a: { solved: true } })).toBe(true);
  });

  test("offers the diagnostic only with no progress and no placement", () => {
    expect(shouldOfferDiagnostic({}, null)).toBe(true);
    const record = savePlacement(buildStartingPlan([], { minutesPerDay: 20 }));
    expect(shouldOfferDiagnostic({}, record)).toBe(false);
    expect(shouldOfferDiagnostic({ a: { attempted: true } }, null)).toBe(false);
  });

  test("skipping stores nothing and leaves the offer in place", () => {
    clearPlacement();
    clearDraft();
    expect(readPlacement()).toBeNull();
    expect(shouldOfferDiagnostic({}, null)).toBe(true);
  });
});
