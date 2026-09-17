import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  ASSISTANT_HIDDEN_EVENT,
  classify,
  isAssistantHidden,
  respond,
  retrieve,
  setAssistantHidden,
  suggestedPrompts,
  type Ctx,
  type Intent,
} from "@/lib/assistant";
import { CONCEPTS } from "@/data/concepts";
import { getDailyDateKey } from "@/lib/daily";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getReadinessScore } from "@/lib/readiness";

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
];

describe("classify", () => {
  test("routes phrases to all eight intents", () => {
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

describe("suggested prompts", () => {
  test("surface the two state-aware intents in both contexts", () => {
    const bare = suggestedPrompts();
    expect(bare).toContain("What's due?");
    expect(bare).toContain("Am I ready?");

    const withProblem = suggestedPrompts({
      problem: {
        id: "la-001",
        title: titleOf("la-001"),
        category: "Linear Algebra",
        difficulty: "Easy",
      },
    });
    expect(withProblem).toContain("What's due?");
    expect(withProblem).toContain("Am I ready?");
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
