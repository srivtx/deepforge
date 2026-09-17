import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import type { Category, Difficulty } from "@/types/problem";
import {
  AGENTIC_FAMILIES,
  AGENTIC_HISTORY_LIMIT,
  AGENTIC_ROUND_CHANGE_EVENT,
  AGENTIC_ROUND_STORAGE_KEY,
  AGENTIC_SPEC,
  buildAgenticScenarios,
  clearAgenticAttempts,
  generateAgenticScenario,
  getAgenticAttempts,
  getAgenticAttemptsFor,
  getBestAgenticAttempt,
  mergeAgenticAttempts,
  parseAgenticAttempts,
  recordAgenticAttempt,
  scoreAgenticRound,
  type AgenticAnswers,
  type AgenticAttempt,
  type AgenticFamily,
  type AgenticScenario,
} from "@/lib/agenticRound";

const TRACK = {
  id: "anthropic",
  title: "Anthropic · Machine Learning Engineer",
  company: "Anthropic",
  role: "Machine Learning Engineer",
};

function meta(
  id: string,
  title: string,
  category: Category,
  difficulty: Difficulty,
): ProblemMeta {
  return { id, title, category, difficulty };
}

const PROBLEMS: ProblemMeta[] = [
  meta("la-001", "Matrix Multiplication", "Linear Algebra", "Easy"),
  meta("st-001", "Sample Mean", "Statistics", "Easy"),
  meta("al-001", "Binary Search", "Algorithms", "Medium"),
  meta("dl-001", "ReLU", "Deep Learning", "Easy"),
  meta("info-001", "Entropy", "Information Theory", "Medium"),
];

function scenarioFor(problem: ProblemMeta): AgenticScenario {
  return generateAgenticScenario({ track: TRACK, problem });
}

function wrongOptionId(scenario: AgenticScenario, choiceId: "verify" | "diagnosis" | "recovery"): string {
  const choice = scenario[choiceId];
  const wrong = choice.options.find((option) => option.id !== choice.correctOptionId);
  if (!wrong) throw new Error(`no wrong option for ${choiceId}`);
  return wrong.id;
}

function perfectInstruction(scenario: AgenticScenario): string {
  const categoryWord = scenario.rubric[scenario.rubric.length - 1].patterns[0];
  return [
    "Please implement the function with the exact signature, the arguments it takes, and the value it must return.",
    "Run the tests after each change and quote any failing output verbatim instead of summarising it.",
    `Cover the empty input and the boundary cases, and keep ${categoryWord} explicit in the code.`,
    "Then report the final output and the evidence before claiming the task is done.",
  ].join(" ");
}

function perfectPlan(scenario: AgenticScenario): Record<string, boolean> {
  const plan: Record<string, boolean> = {};
  for (const step of scenario.plan) plan[step.id] = !step.unsafe;
  return plan;
}

function perfectAnswers(scenario: AgenticScenario): AgenticAnswers {
  return {
    instruction: perfectInstruction(scenario),
    plan: perfectPlan(scenario),
    decisionOptionId: scenario.verify.correctOptionId,
    diagnosisOptionId: scenario.diagnosis.correctOptionId,
    recoveryOptionId: scenario.recovery.correctOptionId,
  };
}

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

describe("scenario generation", () => {
  test("is deterministic for the same track and problem", () => {
    const first = scenarioFor(PROBLEMS[0]);
    const second = scenarioFor(PROBLEMS[0]);
    expect(first).toEqual(second);
  });

  test("seeds content by problem id, not by track identity", () => {
    const otherTrack = {
      id: "openai",
      title: "OpenAI · Research Engineer",
      company: "OpenAI",
      role: "Research Engineer",
    };
    const a = generateAgenticScenario({ track: TRACK, problem: PROBLEMS[0] });
    const b = generateAgenticScenario({ track: otherTrack, problem: PROBLEMS[0] });
    expect(a.plan).toEqual(b.plan);
    expect(a.verify.correctOptionId).toBe(b.verify.correctOptionId);
    expect(a.id).toBe("anthropic:la-001");
    expect(b.id).toBe("openai:la-001");
    expect(a.id).not.toBe(b.id);
  });

  test("every planted divergence family is reachable from problem ids", () => {
    const families = new Set<AgenticFamily>();
    for (let index = 0; index < 40; index += 1) {
      const scenario = scenarioFor(
        meta(`gen-${index}`, `Generated ${index}`, "Algorithms", "Medium"),
      );
      families.add(scenario.family);
    }
    expect([...families].sort()).toEqual([...AGENTIC_FAMILIES].sort());
  });

  test("scenarios are honest records: 5 plan steps, 2 unsafe, one correct option per choice", () => {
    for (const problem of PROBLEMS) {
      const scenario = scenarioFor(problem);
      expect(scenario.plan).toHaveLength(5);
      expect(scenario.plan.filter((step) => step.unsafe)).toHaveLength(2);
      expect(scenario.plan.filter((step) => !step.unsafe)).toHaveLength(3);
      expect(scenario.rubric).toHaveLength(4);
      for (const step of scenario.plan) {
        expect(step.text.length).toBeGreaterThan(0);
        expect(step.note.length).toBeGreaterThan(0);
      }
      for (const choice of [scenario.verify, scenario.diagnosis, scenario.recovery]) {
        expect(choice.options.length).toBeGreaterThanOrEqual(3);
        expect(choice.context.length).toBeGreaterThan(0);
        expect(choice.prompt.length).toBeGreaterThan(0);
        const correct = choice.options.filter(
          (option) => option.id === choice.correctOptionId,
        );
        expect(correct).toHaveLength(1);
        for (const option of choice.options) {
          expect(option.text.length).toBeGreaterThan(0);
          expect(option.note.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("per-track scenario lists are deterministic, spread, and dedupe problems", () => {
    const first = buildAgenticScenarios(TRACK, PROBLEMS, 3);
    const second = buildAgenticScenarios(TRACK, PROBLEMS, 3);
    expect(first.map((scenario) => scenario.id)).toEqual(
      second.map((scenario) => scenario.id),
    );
    expect(first).toHaveLength(3);
    expect(first[0].problemId).toBe("la-001");
    expect(first[1].problemId).toBe("al-001");
    expect(first[2].problemId).toBe("info-001");
    expect(buildAgenticScenarios(TRACK, [PROBLEMS[0], PROBLEMS[0]], 3)).toHaveLength(1);
    expect(buildAgenticScenarios(TRACK, [], 3)).toEqual([]);
  });
});

describe("rubric scoring", () => {
  test("a precise instruction, catches, and correct calls score 100 and ready", () => {
    const scenario = scenarioFor(PROBLEMS[0]);
    const score = scoreAgenticRound(scenario, perfectAnswers(scenario));
    expect(score.detail.instruction.coverage).toBe(1);
    expect(score.detail.instruction.band).toBe("solid");
    expect(score.detail.plan.unsafeCaught).toBe(2);
    expect(score.detail.plan.safeKept).toBe(3);
    expect(score.detail.verify.pass).toBe(true);
    expect(score.detail.diagnosis.pass).toBe(true);
    expect(score.detail.recovery.pass).toBe(true);
    for (const dimension of score.dimensions) expect(dimension.score).toBe(1);
    expect(score.total).toBe(100);
    expect(score.verdict).toBe("ready");
  });

  test("an empty instruction and every wrong call score zero completion", () => {
    const scenario = scenarioFor(PROBLEMS[0]);
    const plan: Record<string, boolean> = {};
    for (const step of scenario.plan) plan[step.id] = true;
    const score = scoreAgenticRound(scenario, {
      instruction: "",
      plan,
      decisionOptionId: wrongOptionId(scenario, "verify"),
      diagnosisOptionId: wrongOptionId(scenario, "diagnosis"),
      recoveryOptionId: wrongOptionId(scenario, "recovery"),
    });
    expect(score.detail.instruction.score).toBe(0);
    expect(score.detail.plan.unsafeCaught).toBe(0);
    expect(score.detail.plan.safeKept).toBe(3);
    expect(score.dimensions.find((d) => d.key === "completion")?.score).toBe(0);
    expect(score.dimensions.find((d) => d.key === "recovery")?.score).toBe(0);
    expect(score.total).toBeLessThan(10);
    expect(score.total).toBeGreaterThan(0);
    expect(score.verdict).toBe("keep-practicing");
    expect(score.feedback).toContain("bug ships");
  });

  test("partial: right plan, wrong report and diagnosis, right fix earns partial credit", () => {
    const scenario = scenarioFor(PROBLEMS[2]);
    const score = scoreAgenticRound(scenario, {
      instruction: "",
      plan: perfectPlan(scenario),
      decisionOptionId: wrongOptionId(scenario, "verify"),
      diagnosisOptionId: wrongOptionId(scenario, "diagnosis"),
      recoveryOptionId: scenario.recovery.correctOptionId,
    });
    expect(score.dimensions.find((d) => d.key === "review")?.score).toBe(0.7);
    expect(score.dimensions.find((d) => d.key === "completion")?.score).toBe(0.6);
    expect(score.dimensions.find((d) => d.key === "recovery")?.score).toBe(0.5);
    expect(score.total).toBe(49);
    expect(score.verdict).toBe("keep-practicing");
  });

  test("missing a single unsafe step is not a ready round", () => {
    const scenario = scenarioFor(PROBLEMS[3]);
    const plan: Record<string, boolean> = {};
    let approvedOneUnsafe = false;
    for (const step of scenario.plan) {
      if (step.unsafe && !approvedOneUnsafe) {
        plan[step.id] = true;
        approvedOneUnsafe = true;
      } else {
        plan[step.id] = !step.unsafe;
      }
    }
    const score = scoreAgenticRound(scenario, {
      ...perfectAnswers(scenario),
      plan,
    });
    expect(score.detail.plan.unsafeCaught).toBe(1);
    expect(score.detail.plan.safeKept).toBe(3);
    expect(score.dimensions.find((d) => d.key === "completion")?.score).toBe(0.6);
    expect(score.total).toBe(80);
    expect(score.verdict).toBe("developing");
    expect(score.feedback).toContain("bug ships");
  });

  test("rejecting everything keeps the agent blocked and flags the false alarms", () => {
    const scenario = scenarioFor(PROBLEMS[4]);
    const score = scoreAgenticRound(scenario, {
      ...perfectAnswers(scenario),
      plan: {},
    });
    expect(score.detail.plan.unsafeCaught).toBe(2);
    expect(score.detail.plan.safeKept).toBe(0);
    expect(score.dimensions.find((d) => d.key === "completion")?.score).toBe(0.6);
    expect(score.feedback).toContain("rejected a sound step");
  });

  test("unknown answers never throw and score what they deserve", () => {
    const scenario = scenarioFor(PROBLEMS[0]);
    const score = scoreAgenticRound(scenario, {
      instruction: "fix it",
      plan: { "not-a-step": true },
      decisionOptionId: "nope",
      diagnosisOptionId: null,
      recoveryOptionId: null,
    });
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.detail.plan.decisions).toHaveLength(5);
    expect(score.detail.verify.pass).toBe(false);
    expect(score.detail.diagnosis.pickedId).toBe(null);
  });
});

describe("attempt records", () => {
  test("empty state: no attempts, no best, nothing for an unknown scenario", () => {
    expect(getAgenticAttempts()).toEqual([]);
    expect(getBestAgenticAttempt("anthropic:la-001")).toBeNull();
    expect(getAgenticAttemptsFor("anthropic:la-001")).toEqual([]);
    expect(parseAgenticAttempts(null)).toEqual([]);
    expect(parseAgenticAttempts("not json")).toEqual([]);
    expect(parseAgenticAttempts('{"scenario":"x"}')).toEqual([]);
  });

  test("recording stores a validated attempt and best picks the top score", () => {
    recordAgenticAttempt({
      scenarioId: "anthropic:la-001",
      trackId: "anthropic",
      problemId: "la-001",
      family: "edge-case",
      total: 42,
      verdict: "keep-practicing",
      dimensions: { completion: 0.4, instruction: 0.2, review: 0.5, recovery: 0.5 },
      at: "2026-09-14T10:00:00.000Z",
    });
    const stored = recordAgenticAttempt({
      scenarioId: "anthropic:la-001",
      trackId: "anthropic",
      problemId: "la-001",
      family: "edge-case",
      total: 91,
      verdict: "ready",
      dimensions: { completion: 1, instruction: 0.8, review: 1, recovery: 1 },
      at: "2026-09-14T11:00:00.000Z",
    });
    expect(stored.id).toBe("anthropic:la-001@2026-09-14T11:00:00.000Z");
    expect(getAgenticAttempts()).toHaveLength(2);
    expect(getAgenticAttemptsFor("anthropic:la-001")).toHaveLength(2);
    const best = getBestAgenticAttempt("anthropic:la-001");
    expect(best?.total).toBe(91);
    expect(best?.dimensions.review).toBe(1);
    expect(getBestAgenticAttempt("openai:dl-001")).toBeNull();
  });

  test("manual payloads are re-validated on read", () => {
    globalScope.window = {
      localStorage: createStorageStub(),
      dispatchEvent: () => true,
    };
    (globalScope.window as { localStorage: Storage }).localStorage.setItem(
      AGENTIC_ROUND_STORAGE_KEY,
      JSON.stringify([
        { nonsense: true },
        {
          scenarioId: "anthropic:la-001",
          at: "2026-09-14T12:00:00.000Z",
          total: 999,
          verdict: "made-up",
          dimensions: { completion: "high" },
        },
      ]),
    );
    const attempts = getAgenticAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].total).toBe(100);
    expect(attempts[0].verdict).toBe("keep-practicing");
    expect(attempts[0].dimensions.completion).toBe(0);
  });

  test("clearing removes every recorded attempt", () => {
    recordAgenticAttempt({
      scenarioId: "anthropic:la-001",
      trackId: "anthropic",
      problemId: "la-001",
      family: "shape",
      total: 60,
      verdict: "developing",
      dimensions: { completion: 0.6, instruction: 0.5, review: 0.7, recovery: 0.5 },
    });
    expect(getAgenticAttempts().length).toBe(1);
    clearAgenticAttempts();
    expect(getAgenticAttempts()).toEqual([]);
  });
});

describe("store spec and merge", () => {
  function attempt(
    overrides: Pick<AgenticAttempt, "id" | "at"> & Partial<AgenticAttempt>,
  ): AgenticAttempt {
    return {
      scenarioId: "anthropic:la-001",
      trackId: "anthropic",
      problemId: "la-001",
      family: "edge-case",
      total: 50,
      verdict: "developing",
      dimensions: { completion: 0.5, instruction: 0.5, review: 0.5, recovery: 0.5 },
      ...overrides,
    };
  }

  test("the spec mirrors the storage key, event, and parser", () => {
    expect(AGENTIC_SPEC.id).toBe("agentic");
    expect(AGENTIC_SPEC.storageKey).toBe(AGENTIC_ROUND_STORAGE_KEY);
    expect(AGENTIC_SPEC.event).toBe(AGENTIC_ROUND_CHANGE_EVENT);
    expect(AGENTIC_SPEC.empty()).toEqual([]);
    expect(AGENTIC_SPEC.parse(null)).toEqual([]);
    expect(AGENTIC_SPEC.parse("{junk")).toEqual([]);
    const value = [attempt({ id: "a-1", at: "2026-09-14T10:00:00.000Z" })];
    expect(AGENTIC_SPEC.parse(AGENTIC_SPEC.serialize(value))).toEqual(value);
  });

  test("the parser drops malformed entries and clamps junk totals", () => {
    const parsed = parseAgenticAttempts(
      JSON.stringify([
        null,
        { scenarioId: "anthropic:la-001" },
        { scenarioId: "", at: "2026-09-14T10:00:00.000Z" },
        {
          scenarioId: "anthropic:la-001",
          at: "2026-09-14T10:00:00.000Z",
          total: 500,
          verdict: "made-up",
          dimensions: { review: "1" },
        },
      ]),
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].total).toBe(100);
    expect(parsed[0].verdict).toBe("keep-practicing");
    expect(parsed[0].dimensions.review).toBe(0);
  });

  test("merge keeps the later timestamp per id, ties keep local, junk dropped", () => {
    const local = [
      attempt({ id: "shared", at: "2026-09-14T10:00:00.000Z", total: 40 }),
      attempt({ id: "local-only", at: "2026-09-13T10:00:00.000Z" }),
    ];
    const remote = [
      attempt({
        id: "shared",
        at: "2026-09-15T10:00:00.000Z",
        total: 91,
        verdict: "ready",
      }),
      attempt({ id: "remote-only", at: "2026-09-16T10:00:00.000Z" }),
      null,
      42,
      { scenarioId: "no-time" },
    ];
    const merged = mergeAgenticAttempts(local, remote);
    expect(merged.map((entry) => entry.id)).toEqual([
      "local-only",
      "shared",
      "remote-only",
    ]);
    expect(merged[1].total).toBe(91);
    expect(merged[1].verdict).toBe("ready");

    const tied = mergeAgenticAttempts(
      [attempt({ id: "tie", at: "2026-09-14T10:00:00.000Z", total: 10 })],
      [attempt({ id: "tie", at: "2026-09-14T10:00:00.000Z", total: 99 })],
    );
    expect(tied).toHaveLength(1);
    expect(tied[0].total).toBe(10);
  });

  test("merge caps the union at the history limit, keeping the newest", () => {
    const remote = Array.from({ length: 80 }, (_, index) =>
      attempt({
        id: `r-${index}`,
        at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
      }),
    );
    const merged = mergeAgenticAttempts([], remote);
    expect(merged).toHaveLength(AGENTIC_HISTORY_LIMIT);
    expect(merged[0].id).toBe("r-20");
    expect(merged[merged.length - 1].id).toBe("r-79");
  });

  test("merge tolerates non-array payloads on either side", () => {
    expect(mergeAgenticAttempts(null, "junk")).toEqual([]);
    expect(mergeAgenticAttempts(undefined, 7)).toEqual([]);
    const value = attempt({ id: "a-1", at: "2026-09-14T10:00:00.000Z" });
    expect(mergeAgenticAttempts([value], {})).toEqual([value]);
  });
});
