import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getDailyProblem } from "@/lib/dailyProblem";
import {
  ACTION_LIMIT,
  getNextBestActions,
  getNextResearchAction,
  getTopAction,
} from "@/lib/nextBestAction";
import { evaluateStageCheckpoint } from "@/lib/pathCheckpoints";
import { getAllPaths } from "@/lib/paths";
import { problemHref } from "@/lib/problemLinks";

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

function write(key: string, value: unknown): void {
  storage().setItem(key, JSON.stringify(value));
}

function isoAt(dateKey: string, hour = 9): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0).toISOString();
}

function solvedOn(dateKey: string): Record<string, unknown> {
  return { attempted: true, solved: true, solvedAt: isoAt(dateKey) };
}

function writePlacement(overrides: Record<string, unknown> = {}): void {
  write("deepforge:placement:v1", {
    v: 1,
    at: NOW.toISOString(),
    level: 1,
    levelLabel: "Solid on the basics",
    answered: 8,
    score: 0.6,
    weakCategories: [],
    strengths: [],
    perCategory: {},
    interests: [],
    recommendedPathIds: [],
    firstProblemIds: [],
    dailyTarget: 3,
    cadence: "",
    minutesPerDay: 20,
    ...overrides,
  });
}

function scoreOfKind(kind: string): number {
  const action = getNextBestActions(NOW).find((item) => item.kind === kind);
  return action ? action.score : -1;
}

const NOW = new Date(2026, 0, 20, 12, 0, 0, 0);
const TODAY = "2026-01-20";

const PROGRESS_KEY = "deepforge:progress:v1";
const LABS_KEY = "deepforge:labs";
const LAB_REVIEWS_KEY = "deepforge:lab-reviews:v1";
const CONCEPTS_KEY = "deepforge:concepts:v1";
const PLACEMENT_KEY = "deepforge:placement:v1";
const ATTEMPTS_KEY = "deepforge:checkpoint-attempts:v1";
const DAILY_KEY = "deepforge:daily:v1";
const PENPAPER_KEY = "deepforge:penpaper:v1";
const RESEARCH_KEY = "deepforge:research:v1";

function checkpointFixture(): {
  path: ReturnType<typeof getAllPaths>[number];
  stage: ReturnType<typeof getAllPaths>[number]["stages"][number];
  bossId: string;
} {
  const metaById = new Map(
    PROBLEM_META.map((problem) => [problem.id, problem]),
  );
  for (const path of getAllPaths()) {
    for (const stage of path.stages) {
      const report = evaluateStageCheckpoint(stage, metaById, {}, { now: NOW });
      if (
        report.checkpoint &&
        !report.complete &&
        report.required === 2 &&
        report.checkpoint.bossIds.length >= 2
      ) {
        return { path, stage, bossId: report.checkpoint.bossIds[0] };
      }
    }
  }
  throw new Error("no two-boss stage found in path data");
}

describe("one fixture per action kind", () => {
  test("review: an overdue problem carries the day-scaled score and reason", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-10") });

    const actions = getNextBestActions(NOW);
    const review = actions.find((action) => action.kind === "review");
    expect(review).toBeTruthy();
    expect(review?.id).toBe("review:la-001");
    expect(review?.title).toBe("Matrix Multiplication");
    expect(review?.reason).toBe("Linear Algebra · 9 days overdue");
    expect(review?.href).toBe(problemHref("la-001", "/today"));
    expect(review?.score).toBe(68); // 50 + 2 x 9 days overdue
    expect(actions[0]?.id).toBe("review:la-001");
  });

  test("lab-review: a passed lab's overdue re-run uses the steeper gain", () => {
    const lab = LABS[0];
    write(LABS_KEY, {
      [lab.id]: {
        best: lab.target,
        attempts: 1,
        passed: true,
        lastScoredAt: isoAt("2026-01-05"),
        recentPasses: [isoAt("2026-01-05")],
      },
    });

    const top = getTopAction(NOW);
    expect(top?.kind).toBe("lab-review");
    expect(top?.id).toBe(`lab-review:${lab.id}`);
    expect(top?.title).toBe(lab.title);
    expect(top?.reason).toBe(`${lab.category} · 14 days overdue`);
    expect(top?.href).toBe("/labs");
    expect(top?.score).toBe(90); // 48 + 3 x 14 days overdue
  });

  test("concept: a studied, overdue concept surfaces with its due date", () => {
    write(CONCEPTS_KEY, {
      "la-vectors": {
        ease: 2.5,
        interval: 6,
        due: "2026-01-15",
        reps: 2,
        lapses: 0,
      },
    });

    const top = getTopAction(NOW);
    expect(top?.kind).toBe("concept");
    expect(top?.id).toBe("concept:la-vectors");
    expect(top?.title).toBe("Vectors, Norms & Projection");
    expect(top?.reason).toBe("Linear Algebra · 5 days overdue");
    expect(top?.href).toBe("/math");
    expect(top?.score).toBe(46); // 36 + 2 x 5 days overdue
  });

  test("checkpoint: one boss from passing outranks the rest of the session", () => {
    const { path, stage, bossId } = checkpointFixture();
    write(PROGRESS_KEY, { [bossId]: solvedOn(TODAY) });
    writePlacement({ recommendedPathIds: [path.id] });

    const checkpoint = getNextBestActions(NOW).find(
      (action) => action.kind === "checkpoint",
    );
    expect(checkpoint).toBeTruthy();
    expect(checkpoint?.id).toBe(`checkpoint:${path.id}:${stage.id}`);
    expect(checkpoint?.reason).toBe(
      `${path.title} · 1 of 2 checkpoint problems solved`,
    );
    expect(checkpoint?.href).toBe(`/paths/${path.slug}`);
    expect(checkpoint?.score).toBe(55); // 30 + round(20 / 2) + 15 one short
    expect(getTopAction(NOW)?.kind).toBe("checkpoint");
  });

  test("coverage: the widest category gap wins once the learner has history", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn(TODAY) });
    const calculusTotal = PROBLEM_META.filter(
      (problem) => problem.category === "Calculus",
    ).length;

    const coverage = getNextBestActions(NOW).find(
      (action) => action.kind === "coverage",
    );
    expect(coverage).toBeTruthy();
    expect(coverage?.id).toBe("coverage:calculus");
    expect(coverage?.title).toBe("Cover Calculus");
    expect(coverage?.reason).toBe(`0 of ${calculusTotal} problems solved`);
    expect(coverage?.href).toBe("/categories/calculus");
    expect(coverage?.score).toBe(42); // gap 1 -> 18 + round(24 x 1)
  });

  test("placement: today's unmet target scales with the unmet share", () => {
    writePlacement({ firstProblemIds: ["la-001"] });

    const top = getTopAction(NOW);
    expect(top?.kind).toBe("placement");
    expect(top?.id).toBe("placement:daily-target");
    expect(top?.title).toBe("Today's plan");
    expect(top?.reason).toBe("0 of 3 planned solves done");
    expect(top?.href).toBe(problemHref("la-001", "/today"));
    expect(top?.score).toBe(48); // 24 + round(24 x 3/3)
  });

  test("problem: the daily problem is offered once there is history", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn(TODAY) });
    const daily = getDailyProblem(NOW);

    const top = getTopAction(NOW);
    expect(top?.kind).toBe("problem");
    expect(top?.id).toBe(`problem:${daily.id}`);
    expect(top?.title).toBe(daily.title);
    expect(top?.reason).toBe(`${daily.category} · still open today`);
    expect(top?.href).toBe(problemHref(daily.id, "/today"));
    expect(top?.score).toBe(42);
  });
});

describe("ordering and determinism", () => {
  test("ties break by kind order, then id", () => {
    write(PROGRESS_KEY, {
      "la-001": solvedOn("2026-01-17"),
      "la-002": solvedOn("2026-01-17"),
    });
    const lab = LABS[1];
    write(LABS_KEY, {
      [lab.id]: {
        best: lab.target,
        attempts: 1,
        passed: true,
        lastScoredAt: isoAt("2026-01-17"),
        recentPasses: [isoAt("2026-01-17")],
      },
    });

    const actions = getNextBestActions(NOW);
    const ids = actions.map((action) => action.id);
    const firstReview = ids.indexOf("review:la-001");
    const secondReview = ids.indexOf("review:la-002");
    const labReview = ids.indexOf(`lab-review:${lab.id}`);
    expect(firstReview).toBeGreaterThanOrEqual(0);
    expect(secondReview).toBeGreaterThan(firstReview);
    expect(labReview).toBeGreaterThan(secondReview);
    expect(actions[firstReview].score).toBe(54);
    expect(actions[secondReview].score).toBe(54);
    expect(actions[labReview].score).toBe(54);
    expect(actions).toHaveLength(ACTION_LIMIT);
    expect(getNextBestActions(NOW)).toEqual(actions);
  });

  test("reason strings stay frozen for a fixed fixture", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-10") });
    const daily = getDailyProblem(NOW);
    const calculusTotal = PROBLEM_META.filter(
      (problem) => problem.category === "Calculus",
    ).length;

    expect(
      getNextBestActions(NOW).map(
        (action) => `${action.kind}|${action.title}|${action.reason}|${action.href}`,
      ),
    ).toEqual([
      `review|Matrix Multiplication|Linear Algebra · 9 days overdue|${problemHref("la-001", "/today")}`,
      `problem|${daily.title}|${daily.category} · still open today|${problemHref(daily.id, "/today")}`,
      `coverage|Cover Calculus|0 of ${calculusTotal} problems solved|/categories/calculus`,
    ]);
  });

  test("review scores rise with days overdue and stop at the cap", () => {
    const dueToday = (() => {
      write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-19") });
      return scoreOfKind("review");
    })();
    const oneDay = (() => {
      write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-18") });
      return scoreOfKind("review");
    })();
    const tenDays = (() => {
      write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-09") });
      return scoreOfKind("review");
    })();
    const pastCap = (() => {
      write(PROGRESS_KEY, { "la-001": solvedOn("2025-11-01") });
      return scoreOfKind("review");
    })();
    const fartherPastCap = (() => {
      write(PROGRESS_KEY, { "la-001": solvedOn("2025-10-01") });
      return scoreOfKind("review");
    })();

    expect(dueToday).toBe(50);
    expect(oneDay).toBe(52);
    expect(tenDays).toBe(70);
    expect(oneDay).toBeGreaterThan(dueToday);
    expect(tenDays).toBeGreaterThan(oneDay);
    expect(pastCap).toBe(110); // 50 + 2 x 30 cap
    expect(fartherPastCap).toBe(pastCap);
  });

  test("coverage scores fall as the widest category gap narrows", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn(TODAY) });
    const wide = scoreOfKind("coverage");

    const heavy: Record<string, Record<string, unknown>> = {};
    for (const category of CATEGORIES) {
      const ids = PROBLEM_META.filter(
        (problem) => problem.category === category.name,
      ).map((problem) => problem.id);
      for (const id of ids.slice(0, Math.floor(ids.length / 2))) {
        heavy[id] = solvedOn(TODAY);
      }
    }
    write(PROGRESS_KEY, heavy);
    const narrow = scoreOfKind("coverage");

    expect(wide).toBe(42);
    expect(narrow).toBeGreaterThanOrEqual(18);
    expect(wide).toBeGreaterThan(narrow);
  });
});

describe("research row", () => {
  test("an unbeaten catalogue surfaces the first challenge with its baseline", () => {
    const first = RESEARCH_CHALLENGES[0];
    const row = getNextResearchAction();
    expect(row).not.toBeNull();
    expect(row?.id).toBe(`research:${first.id}`);
    expect(row?.title).toBe(first.title);
    expect(row?.href).toBe(`/research/${first.id}`);
    expect(row?.points).toBe(first.points);
    expect(row?.reason).toBe("accuracy · baseline 0.6667 (Majority class)");
  });

  test("a metric family with no passing lab is preferred", () => {
    const records: Record<string, unknown> = {};
    for (const lab of LABS.filter((item) => item.metric === "accuracy")) {
      records[lab.id] = {
        best: lab.target,
        attempts: 1,
        passed: true,
        lastScoredAt: isoAt("2026-01-15"),
        recentPasses: [isoAt("2026-01-15")],
      };
    }
    const mseLab = LABS.find((lab) => lab.metric === "mse")!;
    records[mseLab.id] = { best: null, attempts: 2, passed: false };
    write(LABS_KEY, records);

    const row = getNextResearchAction();
    expect(row?.id).toBe("research:nonlinear-regression-chase");
    expect(row?.href).toBe("/research/nonlinear-regression-chase");
    expect(row?.reason).toBe("MSE · baseline 0.4432 (Linear regression)");
  });

  test("with every metric family passed, catalogue order decides", () => {
    const records: Record<string, unknown> = {};
    const covered = new Set<string>();
    for (const lab of LABS) {
      if (covered.has(lab.metric)) continue;
      covered.add(lab.metric);
      records[lab.id] = { best: lab.target, attempts: 1, passed: true };
    }
    write(LABS_KEY, records);

    const row = getNextResearchAction();
    expect(row?.id).toBe(`research:${RESEARCH_CHALLENGES[0].id}`);
  });

  test("four beaten baselines still surface the remaining challenge", () => {
    const state: Record<string, unknown> = {};
    for (const challenge of RESEARCH_CHALLENGES.slice(0, 4)) {
      state[challenge.id] = {
        bestScore: challenge.baselineScore,
        bestAt: isoAt(TODAY),
        beatenBaseline: true,
        attempts: [],
      };
    }
    write(RESEARCH_KEY, state);

    const row = getNextResearchAction();
    expect(row?.id).toBe(`research:${RESEARCH_CHALLENGES[4].id}`);
  });

  test("all five baselines beaten hides the row", () => {
    const state: Record<string, unknown> = {};
    for (const challenge of RESEARCH_CHALLENGES) {
      state[challenge.id] = {
        bestScore: challenge.baselineScore,
        bestAt: isoAt(TODAY),
        beatenBaseline: true,
        attempts: [],
      };
    }
    write(RESEARCH_KEY, state);

    expect(getNextResearchAction()).toBeNull();
  });

  test("research state never reorders the ranked actions", () => {
    write(PROGRESS_KEY, { "la-001": solvedOn("2026-01-10") });
    const unbeaten = getNextBestActions(NOW);
    expect(getNextResearchAction()).not.toBeNull();

    const state: Record<string, unknown> = {};
    for (const challenge of RESEARCH_CHALLENGES) {
      state[challenge.id] = {
        bestScore: challenge.baselineScore,
        bestAt: isoAt(TODAY),
        beatenBaseline: true,
        attempts: [],
      };
    }
    write(RESEARCH_KEY, state);

    expect(getNextResearchAction()).toBeNull();
    expect(getNextBestActions(NOW)).toEqual(unbeaten);
    expect(
      unbeaten.some((action) => action.href.startsWith("/research/")),
    ).toBe(false);
  });

  test("junk research payloads read as unbeaten without throwing", () => {
    storage().setItem(RESEARCH_KEY, "{not json");
    const row = getNextResearchAction();
    expect(row?.id).toBe(`research:${RESEARCH_CHALLENGES[0].id}`);
  });
});

describe("defensive behavior", () => {
  test("an empty profile yields no actions", () => {
    expect(getNextBestActions(NOW)).toEqual([]);
    expect(getTopAction(NOW)).toBeNull();
  });

  test("junk payloads never throw and read as no actions", () => {
    const keys = [
      PROGRESS_KEY,
      LABS_KEY,
      LAB_REVIEWS_KEY,
      CONCEPTS_KEY,
      PLACEMENT_KEY,
      ATTEMPTS_KEY,
      DAILY_KEY,
      PENPAPER_KEY,
    ];
    for (const raw of ["{not json", "[]", "null", "7", '"nope"']) {
      for (const key of keys) storage().setItem(key, raw);
      expect(getNextBestActions(NOW)).toEqual([]);
      expect(getTopAction(NOW)).toBeNull();
    }
  });

  test("an unusable clock yields no actions instead of throwing", () => {
    expect(getNextBestActions(new Date("not a date"))).toEqual([]);
    expect(getTopAction(new Date(Number.NaN))).toBeNull();
  });
});
