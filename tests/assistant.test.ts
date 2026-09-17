import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  ASSISTANT_HIDDEN_EVENT,
  classify,
  contextPrompts,
  isAssistantHidden,
  respond,
  retrieve,
  routeContext,
  setAssistantHidden,
  suggestedPrompts,
  type Ctx,
  type Intent,
} from "@/lib/assistant";
import {
  getAssistantContext,
  setAssistantContext,
} from "@/components/ZeroAssistant";
import { CONCEPTS } from "@/data/concepts";
import { getDailyDateKey } from "@/lib/daily";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getReadinessScore } from "@/lib/readiness";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getResearchTheory } from "@/data/researchTheory";
import { LABS } from "@/data/labs";
import { getLabTheory } from "@/data/labTheory";
import {
  ERA_LABELS,
  PAPERS,
  getPaper,
  getPaperById,
  paperNeighbours,
} from "@/data/papers";

const CLASSIFY_CASES: Array<[string, Intent]> = [
  ["what should I solve next?", "next"],
  ["recommend a hard problem", "next"],
  ["where do I start", "next"],
  ["suggest another problem", "next"],
  ["explain eigenvalues", "explain"],
  ["what is softmax", "explain"],
  ["why does entropy matter", "explain"],
  ["tell me about attention", "explain"],
  ["debug this traceback", "debug"],
  ["my code is broken", "debug"],
  ["i need to fix a wrong answer", "debug"],
  ["build me a playlist for linear algebra", "playlist"],
  ["show me the curriculum", "playlist"],
  ["quiz me on statistics", "quiz"],
  ["test me on gradients", "quiz"],
  ["flashcards for nlp", "quiz"],
  ["plan my week", "plan"],
  ["prepare an interview schedule", "plan"],
  ["what's due today?", "due"],
  ["anything due for review?", "due"],
  ["what should i review?", "due"],
  ["am i ready?", "ready"],
  ["how ready am i for interviews?", "ready"],
  ["show my readiness", "ready"],
  ["show me a research challenge", "research"],
  ["open the research challenges", "research"],
  ["beat a baseline", "research"],
  ["practice lab", "labs"],
  ["hands-on lab", "labs"],
  ["find me a lab", "labs"],
  ["show me the papers", "papers"],
  ["what does the arxiv paper say", "papers"],
];

describe("classify", () => {
  test("routes phrases to every intent", () => {
    const covered = new Set(CLASSIFY_CASES.map(([, intent]) => intent));
    for (const intent of [
      "next",
      "explain",
      "debug",
      "playlist",
      "quiz",
      "plan",
      "due",
      "ready",
      "research",
      "labs",
      "papers",
    ] as Intent[]) {
      expect(covered.has(intent), intent).toBe(true);
    }
    expect(CLASSIFY_CASES.length).toBeGreaterThanOrEqual(10);
  });

  test("matches every phrase deterministically, ignoring case", () => {
    for (const [phrase, expected] of CLASSIFY_CASES) {
      expect(classify(phrase), phrase).toBe(expected);
      expect(classify(phrase.toUpperCase()), phrase).toBe(expected);
    }
  });

  test("falls back to explain when nothing matches", () => {
    expect(classify("zzzqqq flurble wangdoodle")).toBe("explain");
    expect(classify("")).toBe("explain");
  });
});

describe("retrieve", () => {
  test("finds catalogue matches for known concepts", () => {
    const known = new Set(PROBLEM_META.map((p) => p.id));
    for (const term of ["softmax", "dijkstra", "entropy"]) {
      const hits = retrieve(term, 5);
      expect(hits.length, term).toBeGreaterThan(0);
      expect(hits.length, term).toBeLessThanOrEqual(5);
      expect(hits[0].title.toLowerCase(), term).toContain(term);
      for (const hit of hits) {
        expect(known.has(hit.id), hit.id).toBe(true);
        expect(hit.score, hit.id).toBeGreaterThan(0);
      }
    }
  });

  test("returns nothing for gibberish, empty, or zero-k queries", () => {
    expect(retrieve("zzzqqq flurble wangdoodle")).toEqual([]);
    expect(retrieve("")).toEqual([]);
    expect(retrieve("softmax", 0)).toEqual([]);
  });

  test("respects the result-count limit", () => {
    expect(retrieve("gradient", 3)).toHaveLength(3);
    expect(retrieve("gradient", 1)).toHaveLength(1);
  });
});

describe("respond", () => {
  const attached = PROBLEM_META[0];
  const ctx: Ctx = {
    problem: {
      id: attached.id,
      title: attached.title,
      category: attached.category,
      difficulty: attached.difficulty,
    },
  };

  test("cites the attached problem when one is in context", () => {
    const msg = respond("explain this", ctx);
    expect(msg.role).toBe("assistant");
    expect(msg.intent).toBe("explain");
    expect(msg.citations ?? []).toContain(attached.id);
    expect(msg.text).toContain("Nudge:");
    expect(msg.text.length).toBeGreaterThan(0);
  });

  test("fabricates no citations for off-catalogue questions", () => {
    const msg = respond("zzzqqq flurble wangdoodle");
    expect((msg.citations ?? []).length).toBe(0);
    expect(msg.text.includes("couldn't find")).toBe(true);
  });

  test("only cites real catalogue ids for in-catalogue questions", () => {
    const known = new Set(PROBLEM_META.map((p) => p.id));
    const msg = respond("explain softmax");
    expect((msg.citations ?? []).length).toBeGreaterThan(0);
    for (const id of msg.citations ?? []) {
      expect(known.has(id), id).toBe(true);
    }
  });
});

/* ───────────────────────────── store harness ────────────────────────────── */

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
let stub: Storage;
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  dispatched = [];
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: (event: Event) => {
      dispatched.push((event as CustomEvent).type);
      return true;
    },
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

const REVIEWS_KEY = "deepforge:reviews:v1";
const CONCEPTS_KEY = "deepforge:concepts:v1";
const PROGRESS_KEY = "deepforge:progress:v1";

function titleOf(id: string): string {
  const meta = PROBLEM_META.find((problem) => problem.id === id);
  if (!meta) throw new Error(`unknown problem ${id}`);
  return meta.title;
}

function futureDateKey(days = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getDailyDateKey(date);
}

function seedReviewStates(ids: string[]): void {
  const states: Record<string, unknown> = {};
  for (const id of ids) {
    states[id] = {
      ease: 2.5,
      interval: 6,
      due: "2020-01-01",
      reps: 1,
      lapses: 0,
      lastGrade: 5,
      lastReviewedAt: "2020-01-01T00:00:00.000Z",
    };
  }
  stub.setItem(REVIEWS_KEY, JSON.stringify(states));
}

/** Every concept scheduled ahead, except `dueIds`, which are due now. */
function seedConceptSchedule(dueIds: string[]): void {
  const due = new Set(dueIds);
  const states: Record<string, unknown> = {};
  for (const concept of CONCEPTS) {
    states[concept.id] = {
      ease: 2.5,
      interval: 6,
      due: due.has(concept.id) ? "2020-01-01" : futureDateKey(),
      reps: 2,
      lapses: 0,
    };
  }
  stub.setItem(CONCEPTS_KEY, JSON.stringify(states));
}

function seedSolvedProgress(ids: string[]): void {
  const at = new Date().toISOString();
  const progress: Record<string, unknown> = {};
  for (const id of ids) {
    progress[id] = {
      attempted: true,
      solved: true,
      solvedAt: at,
      lastOpened: at,
    };
  }
  stub.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

describe("due intent", () => {
  test("reports seeded review and concept counts with the Today link", () => {
    seedReviewStates(["la-001", "al-001"]);
    seedConceptSchedule(["la-vectors"]);

    const msg = respond("what's due?");
    expect(msg.intent).toBe("due");
    expect(msg.text).toContain("2 code reviews");
    expect(msg.text).toContain("1 concept");
    expect(msg.text).toContain(titleOf("la-001"));
    expect(msg.text).toContain(titleOf("al-001"));
    expect(msg.text).toContain("Vectors, Norms & Projection");
    expect(msg.citations ?? []).toContain("la-001");
    expect(msg.actions).toEqual([{ label: "Open Today", href: "/today" }]);
  });

  test("nothing due answers in the empty state", () => {
    seedConceptSchedule([]);

    const msg = respond("what's due?");
    expect(msg.intent).toBe("due");
    expect(msg.text.toLowerCase()).toContain("nothing is due");
    expect(msg.citations ?? []).toEqual([]);
    expect(msg.actions).toEqual([{ label: "Open Today", href: "/today" }]);
  });

  test("phrasing is deterministic for identical stores", () => {
    seedReviewStates(["la-001"]);
    seedConceptSchedule(["la-vectors"]);

    const first = respond("what's due today?");
    const second = respond("what's due today?");
    expect(first.text).toBe(second.text);
    expect(first.citations).toEqual(second.citations);
    expect(first.actions).toEqual(second.actions);
  });
});

describe("ready intent", () => {
  test("reports the readiness score, weakest component, and Stats link", () => {
    seedSolvedProgress(["la-001", "la-002", "la-003"]);

    const score = getReadinessScore();
    const msg = respond("am I ready?");
    expect(msg.intent).toBe("ready");
    expect(msg.text).toContain(`Readiness ${score.value}/100`);

    const components: Array<[string, number]> = [
      ["coverage", score.coverage],
      ["retention", score.retention],
      ["balance", score.balance],
      ["consistency", score.consistency],
    ];
    const weakest = components.reduce(
      (min, entry) => (entry[1] < min[1] ? entry : min),
      components[0],
    );
    expect(msg.text).toContain(
      `Weakest component: ${weakest[0]} (${weakest[1]}/100)`,
    );
    expect(msg.citations ?? []).toEqual([]);
    expect(msg.actions).toEqual([{ label: "Open Stats", href: "/stats" }]);
  });

  test("empty stores still give a concrete answer", () => {
    const score = getReadinessScore();
    const msg = respond("am I ready?");
    expect(msg.intent).toBe("ready");
    expect(msg.text).toContain(`${score.value}/100`);
    expect(msg.actions).toEqual([{ label: "Open Stats", href: "/stats" }]);
  });
});

describe("research and labs intents", () => {
  test("research phrasings answer with the research link", () => {
    for (const phrase of ["research challenge", "beat a baseline"]) {
      const first = respond(phrase);
      const second = respond(phrase);
      expect(first.intent, phrase).toBe("research");
      expect(first.text.length, phrase).toBeGreaterThan(0);
      expect(first.text, phrase).toBe(second.text);
      expect(first.citations ?? [], phrase).toEqual([]);
      expect(first.actions, phrase).toEqual([
        { label: "Open Research", href: "/research" },
      ]);
    }
  });

  test("lab phrasings answer with the labs link", () => {
    for (const phrase of ["hands-on lab", "practice lab"]) {
      const msg = respond(phrase);
      expect(msg.intent, phrase).toBe("labs");
      expect(msg.text.length, phrase).toBeGreaterThan(0);
      expect(msg.citations ?? [], phrase).toEqual([]);
      expect(msg.actions, phrase).toEqual([
        { label: "Open Labs", href: "/labs" },
      ]);
    }
  });
});

describe("context prompts", () => {
  const attached = PROBLEM_META[0];
  const problemCtx: Ctx = {
    problem: {
      id: attached.id,
      title: attached.title,
      category: attached.category,
      difficulty: attached.difficulty,
    },
  };
  const codeCtx: Ctx = {
    ...problemCtx,
    code: "def solve(xs):\n    total = 0\n    for x in xs:\n        total += x\n    return total",
  };
  const title = attached.title;

  const DEFAULT_PROMPTS = [
    "What should I solve next?",
    "Build me a playlist",
    "Quiz me",
    "Plan my week",
    "What's due?",
    "Am I ready?",
  ];

  test("no context keeps the previous defaults", () => {
    expect(contextPrompts()).toEqual(DEFAULT_PROMPTS);
    expect(contextPrompts({})).toEqual(DEFAULT_PROMPTS);
    expect(suggestedPrompts()).toEqual(DEFAULT_PROMPTS);
  });

  test("problem without code offers four title-aware prompts in a stable order", () => {
    const prompts = contextPrompts(problemCtx);
    expect(prompts).toEqual([
      `Explain ${title} step by step`,
      `Give me a hint for ${title}`,
      `What's the key insight in ${title}?`,
      "Find me a similar problem",
    ]);
    expect(prompts).toHaveLength(4);
    expect(prompts.some((prompt) => prompt.includes(title))).toBe(true);
    expect(contextPrompts(problemCtx)).toEqual(prompts);
    expect(suggestedPrompts(problemCtx)).toEqual(prompts);
  });

  test("code context switches to code-focused prompts and keeps the title", () => {
    const prompts = contextPrompts(codeCtx);
    expect(prompts).toEqual([
      "Review my code",
      "Walk through my approach",
      "What edge cases am I missing?",
      `Explain ${title} step by step`,
    ]);
    expect(prompts.length).toBeLessThanOrEqual(4);
    expect(prompts.some((prompt) => prompt.includes(title))).toBe(true);
    expect(contextPrompts(codeCtx)).toEqual(prompts);
  });

  test("a known failed run swaps the walkthrough chip for the failing one", () => {
    const prompts = contextPrompts({ ...codeCtx, lastRunFailed: true });
    expect(prompts).toContain("Why is my code failing?");
    expect(prompts).not.toContain("Walk through my approach");
    expect(prompts).toHaveLength(4);
    expect(contextPrompts({ ...codeCtx, lastRunFailed: false })).toContain(
      "Walk through my approach",
    );
  });

  test("blank code counts as no code", () => {
    expect(contextPrompts({ ...problemCtx, code: "   \n\t " })).toEqual(
      contextPrompts(problemCtx),
    );
  });

  test("context updates change the chips through the shared store", () => {
    try {
      setAssistantContext({});
      const bare = contextPrompts(getAssistantContext());
      setAssistantContext(problemCtx);
      const attachedChips = contextPrompts(getAssistantContext());
      setAssistantContext(codeCtx);
      const coding = contextPrompts(getAssistantContext());

      expect(bare).toEqual(DEFAULT_PROMPTS);
      expect(attachedChips).not.toEqual(bare);
      expect(coding).not.toEqual(attachedChips);

      setAssistantContext({});
      expect(contextPrompts(getAssistantContext())).toEqual(bare);
    } finally {
      setAssistantContext({});
    }
  });
});

describe("context prompt round-trips", () => {
  const attached = PROBLEM_META[0];
  const known = new Set(PROBLEM_META.map((problem) => problem.id));
  const problemCtx: Ctx = {
    problem: {
      id: attached.id,
      title: attached.title,
      category: attached.category,
      difficulty: attached.difficulty,
      description: "Adds a list of numbers.",
    },
  };
  const codeCtx: Ctx = {
    ...problemCtx,
    code: "def solve(xs):\n    return sum(xs)",
  };
  const contexts: Array<[string, Ctx]> = [
    ["no context", {}],
    ["problem", problemCtx],
    ["code", codeCtx],
    ["failing code", { ...codeCtx, lastRunFailed: true }],
  ];

  test("every generated prompt answers deterministically with real citations", () => {
    for (const [label, ctx] of contexts) {
      const prompts = contextPrompts(ctx);
      expect(prompts.length, label).toBeGreaterThan(0);
      for (const prompt of prompts) {
        const first = respond(prompt, ctx);
        const second = respond(prompt, ctx);
        const where = `${label}: ${prompt}`;
        expect(first.role, where).toBe("assistant");
        expect(first.text.length, where).toBeGreaterThan(0);
        expect(first.text, where).toBe(second.text);
        expect(first.intent, where).toBe(second.intent);
        expect(first.citations ?? [], where).toEqual(second.citations ?? []);
        for (const id of first.citations ?? []) {
          expect(known.has(id), `${where}: ${id}`).toBe(true);
        }
      }
    }
  });

  test("title-aware prompts cite the attached problem and hint at it", () => {
    const msg = respond(`Give me a hint for ${attached.title}`, problemCtx);
    expect(msg.intent).toBe("explain");
    expect(msg.citations ?? []).toContain(attached.id);
    expect(msg.text).toContain("Nudge:");
  });

  test("similar-problem prompts cite unsolved neighbours in the same category", () => {
    const msg = respond("Find me a similar problem", problemCtx);
    expect(msg.intent).toBe("next");
    expect((msg.citations ?? []).length).toBeGreaterThan(0);
    for (const id of msg.citations ?? []) {
      const meta = PROBLEM_META.find((problem) => problem.id === id) ?? null;
      expect(meta ? meta.category : null, id).toBe(attached.category);
      expect(id).not.toBe(attached.id);
    }
  });

  test("code prompts answer from the code without a bank lookup", () => {
    const walk = respond("Walk through my approach", codeCtx);
    expect(walk.intent).toBe("debug");
    expect(walk.text).toContain("solve");
    expect(walk.citations ?? []).toEqual([attached.id]);

    const review = respond("Review my code", codeCtx);
    expect(review.intent).toBe("debug");
    expect(review.text.length).toBeGreaterThan(0);

    const edge = respond("What edge cases am I missing?", codeCtx);
    expect(edge.intent).toBe("explain");
    expect(edge.text).toContain("Empty input");

    const failing = respond("Why is my code failing?", {
      ...codeCtx,
      lastRunFailed: true,
    });
    expect(failing.intent).toBe("debug");
    expect(failing.text).toContain("did not pass all tests");
  });
});

describe("research route context", () => {
  const challenge = RESEARCH_CHALLENGES[0];
  const researchCtx: Ctx = { researchId: challenge.id };

  test("routeContext attaches ids on detail routes and ignores everything else", () => {
    expect(routeContext(`/research/${challenge.id}`)).toEqual({
      researchId: challenge.id,
    });
    expect(routeContext(`/research/${challenge.id}/`)).toEqual({
      researchId: challenge.id,
    });
    expect(routeContext("/labs/lab-01")).toEqual({ labId: "lab-01" });
    expect(routeContext("/research")).toEqual({});
    expect(routeContext("/labs")).toEqual({});
    expect(routeContext("/")).toEqual({});
    expect(routeContext("/problems/la-001")).toEqual({});
    expect(routeContext("/research/one/two")).toEqual({});
    expect(routeContext(null)).toEqual({});
    expect(routeContext(undefined)).toEqual({});
  });

  test("unknown research and lab ids fall back to the generic chips", () => {
    expect(contextPrompts({ researchId: "nope" })).toEqual(contextPrompts());
    expect(contextPrompts({ labId: "nope" })).toEqual(contextPrompts());
    expect(contextPrompts({ labId: "trails" })).toEqual(contextPrompts());
    expect(contextPrompts({ researchId: "nope" })).toHaveLength(6);
    const fallback = respond("What's the baseline?", { researchId: "nope" });
    expect(fallback.text.length).toBeGreaterThan(0);
    expect(fallback.citations ?? []).toEqual([]);
  });

  test("research chips are metric-aware, ordered, and stable", () => {
    const chips = contextPrompts(researchCtx);
    expect(chips).toEqual([
      "What's the baseline?",
      "How is accuracy scored?",
      "Give me a hint",
      "What does the data look like?",
    ]);
    expect(contextPrompts(researchCtx)).toEqual(chips);
    expect(suggestedPrompts(researchCtx)).toEqual(chips);
  });

  test("research context outranks a stale problem context", () => {
    const attached = PROBLEM_META[0];
    const both: Ctx = {
      researchId: challenge.id,
      problem: {
        id: attached.id,
        title: attached.title,
        category: attached.category,
        difficulty: attached.difficulty,
      },
    };
    expect(contextPrompts(both)[0]).toBe("What's the baseline?");
  });

  test("baseline answer carries the stored baseline and the theory note", () => {
    const msg = respond("What's the baseline?", researchCtx);
    expect(msg.intent).toBe("research");
    expect(msg.text).toContain(challenge.baselineName);
    expect(msg.text).toContain("0.6667");
    expect(msg.text).toContain("Predicting the majority label");
    expect(msg.citations ?? []).toEqual([]);
  });

  test("every challenge baseline answer carries its stored numbers", () => {
    for (const entry of RESEARCH_CHALLENGES) {
      const msg = respond("What's the baseline?", { researchId: entry.id });
      const expected = String(Number(entry.baselineScore.toFixed(4)));
      expect(msg.intent, entry.id).toBe("research");
      expect(msg.text, entry.id).toContain(expected);
      expect(msg.text, entry.id).toContain(entry.baselineName);
    }
  });

  test("metric answer explains the scorer used for the challenge", () => {
    const msg = respond("How is accuracy scored?", researchCtx);
    expect(msg.intent).toBe("research");
    expect(msg.text).toContain("accuracy");
    expect(msg.text).toContain("fraction of hidden rows");
    expect(msg.text).toContain(
      `${challenge.testData.features.length} hidden test rows`,
    );
    expect(msg.citations ?? []).toEqual([]);
  });

  test("hint answer returns exactly the stored hint", () => {
    const msg = respond("Give me a hint", researchCtx);
    expect(msg.intent).toBe("research");
    expect(msg.text).toBe(`Hint for ${challenge.title}: ${challenge.hint}`);
    expect(msg.text.endsWith(challenge.hint)).toBe(true);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("data answer reports the stored split shape", () => {
    const msg = respond("What does the data look like?", researchCtx);
    expect(msg.intent).toBe("research");
    expect(msg.text).toContain(
      `${challenge.trainData.features.length} training rows`,
    );
    expect(msg.text).toContain(
      `${challenge.testData.features.length} hidden test rows`,
    );
    expect(msg.citations ?? []).toEqual([]);
  });

  test("every research chip round-trips deterministically", () => {
    for (const entry of RESEARCH_CHALLENGES) {
      const ctx: Ctx = { researchId: entry.id };
      const chips = contextPrompts(ctx);
      expect(chips.length, entry.id).toBe(4);
      for (const chip of chips) {
        const first = respond(chip, ctx);
        const second = respond(chip, ctx);
        expect(first.intent, `${entry.id}: ${chip}`).toBe("research");
        expect(first.text, `${entry.id}: ${chip}`).toBe(second.text);
        expect(first.text.length, `${entry.id}: ${chip}`).toBeGreaterThan(0);
        expect(first.citations ?? [], `${entry.id}: ${chip}`).toEqual([]);
      }
    }
    const theory = getResearchTheory(challenge.id);
    expect(theory).not.toBeUndefined();
  });
});

describe("lab route context", () => {
  const lab = LABS[0];
  const labCtx: Ctx = { labId: lab.id };

  test("lab chips are ordered and stable", () => {
    const chips = contextPrompts(labCtx);
    expect(chips).toEqual([
      "What's the target?",
      "What does this lab teach?",
      "Give me a hint",
      "How long is the run?",
    ]);
    expect(contextPrompts(labCtx)).toEqual(chips);
  });

  test("target answer carries the stored target and baseline", () => {
    const msg = respond("What's the target?", labCtx);
    expect(msg.intent).toBe("labs");
    expect(msg.text).toContain("0.85");
    expect(msg.text).toContain("0.6");
    expect(msg.text).toContain(
      `${lab.testData.features.length} held-out rows`,
    );
    expect(msg.citations ?? []).toEqual([]);
  });

  test("teach answer comes from the lab theory", () => {
    const msg = respond("What does this lab teach?", labCtx);
    expect(msg.intent).toBe("labs");
    expect(msg.text).toContain(getLabTheory(lab.id)!.teaches);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("hint answer returns exactly the stored hint", () => {
    const msg = respond("Give me a hint", labCtx);
    expect(msg.intent).toBe("labs");
    expect(msg.text).toBe(`Hint for ${lab.title}: ${lab.hint}`);
    expect(msg.text.endsWith(lab.hint)).toBe(true);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("run-length answer reports the stored time limit", () => {
    const msg = respond("How long is the run?", labCtx);
    expect(msg.intent).toBe("labs");
    expect(msg.text).toContain("5 minutes");
    expect(msg.text).toContain(`${lab.timeLimitSeconds} seconds`);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("every lab chip round-trips deterministically", () => {
    for (const entry of LABS) {
      const ctx: Ctx = { labId: entry.id };
      const chips = contextPrompts(ctx);
      expect(chips.length, entry.id).toBe(4);
      for (const chip of chips) {
        const first = respond(chip, ctx);
        const second = respond(chip, ctx);
        expect(first.intent, `${entry.id}: ${chip}`).toBe("labs");
        expect(first.text, `${entry.id}: ${chip}`).toBe(second.text);
        expect(first.text.length, `${entry.id}: ${chip}`).toBeGreaterThan(0);
        expect(first.citations ?? [], `${entry.id}: ${chip}`).toEqual([]);
      }
    }
  });
});

describe("papers intent", () => {
  test("paper phrasings answer with the papers link", () => {
    for (const phrase of ["show me the papers", "what does the arxiv paper say"]) {
      const first = respond(phrase);
      const second = respond(phrase);
      expect(first.intent, phrase).toBe("papers");
      expect(first.text.length, phrase).toBeGreaterThan(0);
      expect(first.text, phrase).toBe(second.text);
      expect(first.citations ?? [], phrase).toEqual([]);
      expect(first.actions, phrase).toEqual([
        { label: "Open Papers", href: "/papers" },
      ]);
    }
  });
});

describe("paper route context", () => {
  const paper = getPaper("deepseek-r1")!;
  const paperCtx: Ctx = { paperSlug: paper.slug };

  test("routeContext attaches slugs on /papers/<slug> and ignores everything else", () => {
    expect(routeContext(`/papers/${paper.slug}`)).toEqual({
      paperSlug: paper.slug,
    });
    expect(routeContext(`/papers/${paper.slug}/`)).toEqual({
      paperSlug: paper.slug,
    });
    expect(routeContext("/papers")).toEqual({});
    expect(routeContext("/papers/one/two")).toEqual({});
    expect(routeContext("/problems/deepseek-r1")).toEqual({});
    expect(routeContext("/concepts/deepseek-r1")).toEqual({});
  });

  test("unknown slugs fall back to the generic chips", () => {
    expect(contextPrompts({ paperSlug: "nope" })).toEqual(contextPrompts());
    expect(contextPrompts({ paperSlug: "nope" })).toHaveLength(6);
    const fallback = respond("What is this paper about?", {
      paperSlug: "nope",
    });
    expect(fallback.text.length).toBeGreaterThan(0);
  });

  test("paper chips are ordered and stable", () => {
    const chips = contextPrompts(paperCtx);
    expect(chips).toEqual([
      "What is this paper about?",
      "What came before it?",
      "What did it improve?",
      "Give me a study order",
    ]);
    expect(contextPrompts(paperCtx)).toEqual(chips);
    expect(suggestedPrompts(paperCtx)).toEqual(chips);
  });

  test("paper context outranks a stale problem context", () => {
    const attached = PROBLEM_META[0];
    const both: Ctx = {
      paperSlug: paper.slug,
      problem: {
        id: attached.id,
        title: attached.title,
        category: attached.category,
        difficulty: attached.difficulty,
      },
    };
    expect(contextPrompts(both)[0]).toBe("What is this paper about?");
  });

  test("about answer carries whatItIs and the era", () => {
    const msg = respond("What is this paper about?", paperCtx);
    expect(msg.intent).toBe("papers");
    expect(msg.text).toContain(paper.whatItIs);
    expect(msg.text).toContain(ERA_LABELS[paper.era]);
    expect(msg.text).toContain(paper.short);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("before answer names the lineage predecessor and its context", () => {
    expect(paper.lineage.from).toBe("deepseek-v3");
    const from = getPaperById(paper.lineage.from!)!;
    const msg = respond("What came before it?", paperCtx);
    expect(msg.intent).toBe("papers");
    expect(msg.text).toContain(from.short);
    expect(msg.text).toContain("GRPO");
    expect(msg.citations ?? []).toEqual([]);
  });

  test("improved answer lists every recorded delta over the predecessor", () => {
    const from = getPaperById(paper.lineage.from!)!;
    const msg = respond("What did it improve?", paperCtx);
    expect(msg.intent).toBe("papers");
    expect(paper.lineage.improved.length).toBeGreaterThan(0);
    for (const item of paper.lineage.improved) {
      expect(msg.text).toContain(item);
    }
    expect(msg.text).toContain(from.short);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("study order places the paper in its era and the reading order", () => {
    const index = PAPERS.findIndex((entry) => entry.id === paper.id);
    const { prev, next } = paperNeighbours(paper.id);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(prev).not.toBeNull();
    expect(next).not.toBeNull();

    const msg = respond("Give me a study order", paperCtx);
    expect(msg.intent).toBe("papers");
    expect(msg.text).toContain(`#${index + 1} of ${PAPERS.length}`);
    expect(msg.text).toContain(ERA_LABELS[paper.era]);
    expect(msg.text).toContain(prev!.short);
    expect(msg.text).toContain(next!.short);
    expect(msg.citations ?? []).toEqual([]);
  });

  test("every paper chip round-trips deterministically", () => {
    for (const entry of PAPERS) {
      const ctx: Ctx = { paperSlug: entry.slug };
      const chips = contextPrompts(ctx);
      expect(chips.length, entry.slug).toBe(4);
      for (const chip of chips) {
        const first = respond(chip, ctx);
        const second = respond(chip, ctx);
        expect(first.intent, `${entry.slug}: ${chip}`).toBe("papers");
        expect(first.text, `${entry.slug}: ${chip}`).toBe(second.text);
        expect(first.text.length, `${entry.slug}: ${chip}`).toBeGreaterThan(0);
        expect(first.citations ?? [], `${entry.slug}: ${chip}`).toEqual([]);
      }
    }
  });
});

describe("hidden launcher preference", () => {
  const HIDDEN_KEY = "deepforge:assistant-hidden:v1";

  test("defaults to visible when the key is unset", () => {
    expect(stub.getItem(HIDDEN_KEY)).toBeNull();
    expect(isAssistantHidden()).toBe(false);
  });

  test("round-trips hidden and visible through the store", () => {
    setAssistantHidden(true);
    expect(isAssistantHidden()).toBe(true);
    expect(stub.getItem(HIDDEN_KEY)).toBe("true");

    setAssistantHidden(false);
    expect(isAssistantHidden()).toBe(false);
    expect(stub.getItem(HIDDEN_KEY)).toBe("false");
  });

  test("sanitizes junk, legacy, and non-boolean payloads to visible", () => {
    const junk = [
      "yes",
      "TRUE",
      "1",
      "0",
      "",
      "null",
      "{}",
      '{"hidden":true}',
      '"true"',
      "undefined",
    ];
    for (const value of junk) {
      stub.setItem(HIDDEN_KEY, value);
      expect(isAssistantHidden(), value).toBe(false);
    }

    stub.setItem(HIDDEN_KEY, "true");
    expect(isAssistantHidden()).toBe(true);
  });

  test("dispatches the hidden-change event on every write", () => {
    expect(ASSISTANT_HIDDEN_EVENT).toBe("deepforge:assistant-hidden-change");
    setAssistantHidden(true);
    setAssistantHidden(false);
    expect(dispatched).toEqual([
      ASSISTANT_HIDDEN_EVENT,
      ASSISTANT_HIDDEN_EVENT,
    ]);
  });

  test("is SSR-safe and a no-op without a window", () => {
    globalScope.window = undefined;
    expect(isAssistantHidden()).toBe(false);
    setAssistantHidden(true);
    expect(dispatched).toEqual([]);
  });
});
