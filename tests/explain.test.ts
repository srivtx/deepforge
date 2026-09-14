import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  EXPLANATION_STORAGE_KEY,
  EXPLAIN_PREFS_KEY,
  buildExplainRubric,
  clearExplanations,
  getExplanations,
  getExplanationsFor,
  getLatestExplanation,
  gradeExplanation,
  hasExplained,
  isExplainEnabled,
  recordExplanation,
  recordSkip,
  setExplainEnabled,
  type ExplainProblem,
} from "@/lib/explain";

const BINARY_SEARCH: ExplainProblem = {
  id: "al-001",
  title: "Binary Search",
  category: "Algorithms",
  description:
    "Search for target in a sorted list of integers and return its index, or -1 if it is absent. Keep low and high pointers and halve the remaining range each step.",
};

const GOOD_EXPLANATION =
  "Because the list is sorted, I keep a low and high pointer and look at the middle index. Each pass compares the middle value with the target and cuts the range in half. If the range becomes empty I return -1, so an empty list just returns -1.";

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

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  stub = createStorageStub();
  globalScope.window = {
    localStorage: stub,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (hadWindow) globalScope.window = originalWindow;
  else delete globalScope.window;
});

describe("explain rubric", () => {
  test("is deterministic for the same problem", () => {
    expect(buildExplainRubric(BINARY_SEARCH)).toEqual(
      buildExplainRubric(BINARY_SEARCH),
    );
    expect(buildExplainRubric(BINARY_SEARCH).problemId).toBe("al-001");
  });

  test("algorithmic problems require loop, return, and edge structure", () => {
    const ids = buildExplainRubric(BINARY_SEARCH).items.map((item) => item.id);
    expect(ids).toContain("structure:iterate");
    expect(ids).toContain("structure:return");
    expect(ids).toContain("structure:edge");
  });

  test("each category contributes its own structural checks", () => {
    const stats = buildExplainRubric({
      ...BINARY_SEARCH,
      id: "st-001",
      title: "Sample Variance",
      category: "Statistics",
      description:
        "Compute the sample variance of a list of numbers. Subtract the mean from each value, square the deviations, and divide by n minus one.",
    });
    const ids = stats.items.map((item) => item.id);
    expect(ids).toContain("structure:count");
    expect(ids).toContain("structure:normalize");

    const graphs = buildExplainRubric({
      ...BINARY_SEARCH,
      id: "gr-001",
      title: "Breadth First Search",
      category: "Graph Algorithms",
      description:
        "Traverse a graph from a start node using a queue, returning the nodes in visit order.",
    });
    const graphIds = graphs.items.map((item) => item.id);
    expect(graphIds).toContain("structure:traverse");
    expect(graphIds).toContain("structure:edge");
  });

  test("an explanation that covers the key ideas scores higher than an empty one", () => {
    const good = gradeExplanation(BINARY_SEARCH, GOOD_EXPLANATION);
    const empty = gradeExplanation(BINARY_SEARCH, "");
    expect(good.score).toBeGreaterThan(empty.score);
    expect(empty.score).toBe(0);
    expect(empty.coverage).toBe(0);
    expect(empty.completeness).toBe(0);
    expect(empty.band).toBe("thin");
    expect(good.hits).toContain("structure:iterate");
    expect(good.hits).toContain("structure:return");
    expect(good.hits).toContain("structure:edge");
    expect(good.band).toBe("solid");
  });

  test("gaps are question-shaped and never a grade", () => {
    const grade = gradeExplanation(BINARY_SEARCH, "");
    expect(grade.gaps.length).toBe(buildExplainRubric(BINARY_SEARCH).items.length);
    for (const gap of grade.gaps) {
      expect(gap.question.endsWith("?")).toBe(true);
      expect(gap.label.length).toBeGreaterThan(0);
    }
    expect(grade.feedback).not.toMatch(/wrong|incorrect|fail(ed|ure)?|bad/i);
  });

  test("causal language raises the reasoning-completeness score", () => {
    const plain = gradeExplanation(
      BINARY_SEARCH,
      "low pointer high pointer middle index range return empty",
    );
    const causal = gradeExplanation(
      BINARY_SEARCH,
      "low pointer high pointer middle index range return empty because the range halves each pass",
    );
    expect(causal.completeness).toBeGreaterThan(plain.completeness);
  });

  test("stemming lets related word forms count as hits", () => {
    const grade = gradeExplanation(
      { ...BINARY_SEARCH, id: "st-002", category: "Statistics" },
      "I normalize the deviations and divide by the count.",
    );
    expect(grade.hits).toContain("structure:normalize");
    expect(grade.hits).toContain("structure:count");
  });
});

describe("explanation storage", () => {
  test("records explanations and shows the latest on reopen", () => {
    const first = gradeExplanation(BINARY_SEARCH, "A loop over the range.");
    recordExplanation(BINARY_SEARCH.id, "A loop over the range.", first);
    const second = gradeExplanation(BINARY_SEARCH, GOOD_EXPLANATION);
    recordExplanation(BINARY_SEARCH.id, GOOD_EXPLANATION, second);

    const history = getExplanationsFor(BINARY_SEARCH.id);
    expect(history).toHaveLength(2);
    expect(history[1].text).toBe(GOOD_EXPLANATION);
    expect(getLatestExplanation(BINARY_SEARCH.id)?.text).toBe(GOOD_EXPLANATION);
    expect(hasExplained(BINARY_SEARCH.id)).toBe(true);
    expect(hasExplained("never-seen")).toBe(false);
  });

  test("a skip is allowed but marked", () => {
    const entry = recordSkip(BINARY_SEARCH.id);
    expect(entry.skipped).toBe(true);
    expect(entry.text).toBe("");
    expect(entry.score).toBe(0);
    const latest = getLatestExplanation(BINARY_SEARCH.id);
    expect(latest?.skipped).toBe(true);
    expect(hasExplained(BINARY_SEARCH.id)).toBe(true);
  });

  test("caps stored history per problem", () => {
    for (let i = 0; i < 25; i += 1) {
      recordExplanation(
        BINARY_SEARCH.id,
        `attempt ${i}`,
        { coverage: 0.1, completeness: 0.1, score: 0.1, hits: [] },
      );
    }
    const history = getExplanationsFor(BINARY_SEARCH.id);
    expect(history).toHaveLength(20);
    expect(history[history.length - 1].text).toBe("attempt 24");
  });

  test("clear removes everything", () => {
    recordExplanation(BINARY_SEARCH.id, "text", {
      coverage: 0.5,
      completeness: 0.5,
      score: 0.5,
      hits: [],
    });
    clearExplanations();
    expect(getExplanations()).toEqual({});
  });

  test("unreadable or malformed payloads fall back to empty", () => {
    stub.setItem(EXPLANATION_STORAGE_KEY, "{not json");
    expect(getExplanations()).toEqual({});

    stub.setItem(
      EXPLANATION_STORAGE_KEY,
      JSON.stringify({
        "al-001": [{ text: 5 }, "nope", { at: "" }],
        "al-002": [{ at: "2026-01-01T00:00:00.000Z", text: "ok", skipped: false }],
      }),
    );
    const map = getExplanations();
    expect(map["al-001"]).toBeUndefined();
    expect(map["al-002"]).toHaveLength(1);
    expect(map["al-002"][0].coverage).toBe(0);
  });
});

describe("explain preference", () => {
  test("defaults on and round-trips the opt-out", () => {
    expect(isExplainEnabled()).toBe(true);
    setExplainEnabled(false);
    expect(isExplainEnabled()).toBe(false);
    setExplainEnabled(true);
    expect(isExplainEnabled()).toBe(true);
  });

  test("a corrupt preference payload defaults to on", () => {
    stub.setItem(EXPLAIN_PREFS_KEY, "nope");
    expect(isExplainEnabled()).toBe(true);
  });
});
