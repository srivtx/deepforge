import { describe, expect, test } from "bun:test";
import { classify, respond, retrieve, type Ctx, type Intent } from "@/lib/assistant";
import { PROBLEMS } from "@/data/problems";

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
];

describe("classify", () => {
  test("routes phrases to all six intents", () => {
    const covered = new Set(CLASSIFY_CASES.map(([, intent]) => intent));
    for (const intent of [
      "next",
      "explain",
      "debug",
      "playlist",
      "quiz",
      "plan",
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
    const known = new Set(PROBLEMS.map((p) => p.id));
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
  const attached = PROBLEMS[0];
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
    const known = new Set(PROBLEMS.map((p) => p.id));
    const msg = respond("explain softmax");
    expect((msg.citations ?? []).length).toBeGreaterThan(0);
    for (const id of msg.citations ?? []) {
      expect(known.has(id), id).toBe(true);
    }
  });
});
