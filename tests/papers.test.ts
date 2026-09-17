import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  ERA_LABELS,
  PAPERS,
  PAPER_ERAS,
  getPaper,
  getPaperById,
  paperNeighbours,
  paperProgress,
  papersByEra,
  type PaperAnswerMap,
} from "@/data/papers";
import { EFFICIENCY_PAPERS } from "@/data/papers/efficiency";
import { FOUNDING_PAPERS } from "@/data/papers/founding";
import { FRONTIER_PAPERS } from "@/data/papers/frontier";
import { FRONTIER2_PAPERS } from "@/data/papers/frontier2";
import { REASONING_PAPERS } from "@/data/papers/reasoning";
import type {
  Paper,
  PaperKind,
  PaperEra,
  PaperQuestion,
  PaperVisual,
} from "@/data/papers/types";
import {
  getPapersState,
  markRead,
  mergePapers,
  PAPERS_CHANGE_EVENT,
  PAPERS_SPEC,
  PAPERS_STORAGE_KEY,
  parsePapersState,
  recordAnswer,
  resetPaper,
  type PapersState,
} from "@/lib/papers";

const ERA_SOURCES: Record<PaperEra, Paper[]> = {
  founding: FOUNDING_PAPERS,
  efficiency: EFFICIENCY_PAPERS,
  reasoning: REASONING_PAPERS,
  frontier: [...FRONTIER_PAPERS, ...FRONTIER2_PAPERS],
};

/** Same comparator as the index: date ascending, then id ascending. */
function compareWithinEra(a: Paper, b: Paper): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

const VALID_KINDS: PaperKind[] = ["paper", "report", "announcement"];
const VALID_ERAS: PaperEra[] = ["founding", "efficiency", "reasoning", "frontier"];
const VALID_TIERS = ["core", "advanced"];
const VISUAL_KINDS: PaperVisual[] = [
  "timeline",
  "scaling-curve",
  "code-pipeline",
  "moe-routing",
  "fine-grained-experts",
  "grpo-loop",
  "vision-tower",
  "mla-latent",
  "prover-tree",
  "load-balance",
  "fp8-range",
  "mtp-tokens",
  "rl-reward-curve",
  "distillation-flow",
  "sparse-attention",
  "hybrid-thinking",
  "cost-bars",
  "janus-decouple",
];

describe("paper registry", () => {
  test("merges the four era files in reading order", () => {
    const total = VALID_ERAS.reduce(
      (sum, era) => sum + ERA_SOURCES[era].length,
      0,
    );
    expect(PAPERS.length).toBe(total);

    const expected = PAPER_ERAS.flatMap((era) =>
      [...ERA_SOURCES[era.id]].sort(compareWithinEra),
    );
    expect(PAPERS.map((paper) => paper.id)).toEqual(
      expected.map((paper) => paper.id),
    );
    expect(expected.map((paper) => paper.era)).toEqual(
      [...expected.map((paper) => paper.era)].sort(
        (a, b) => VALID_ERAS.indexOf(a) - VALID_ERAS.indexOf(b),
      ),
    );
  });

  test("dates ascend within each era with an id tiebreak", () => {
    for (const era of PAPER_ERAS) {
      const papers = PAPERS.filter((paper) => paper.era === era.id);
      for (let i = 1; i < papers.length; i += 1) {
        const previous = papers[i - 1];
        const current = papers[i];
        expect(
          previous.date < current.date ||
            (previous.date === current.date && previous.id <= current.id),
          `${previous.id} before ${current.id}`,
        ).toBe(true);
      }
    }
  });

  test("ids and slugs are unique and url-safe", () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const paper of PAPERS) {
      expect(ids.has(paper.id), paper.id).toBe(false);
      ids.add(paper.id);
      expect(slugs.has(paper.slug), paper.slug).toBe(false);
      slugs.add(paper.slug);
      expect(paper.slug, paper.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  test("every paper is well-formed", () => {
    for (const paper of PAPERS) {
      expect(paper.date, paper.id).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(Number.isNaN(Date.parse(paper.date)), paper.id).toBe(false);
      expect(paper.year, paper.id).toBeGreaterThan(1900);
      expect(VALID_KINDS).toContain(paper.kind);
      expect(VALID_ERAS).toContain(paper.era);
      expect(VALID_TIERS).toContain(paper.tier);
      expect(paper.title.trim().length > 0, paper.id).toBe(true);
      expect(paper.short.trim().length > 0, paper.id).toBe(true);
      expect(paper.tagline.trim().length > 0, paper.id).toBe(true);
      expect(paper.whatItIs.trim().length > 0, paper.id).toBe(true);
      expect(paper.theoryMinutes, paper.id).toBeGreaterThan(0);
      expect(paper.url.startsWith("http"), paper.id).toBe(true);
      if (paper.arxivId !== undefined) {
        expect(paper.arxivId.trim().length > 0, paper.id).toBe(true);
      }
    }
  });

  test("question ids are unique across all papers and options are graded", () => {
    const seen = new Set<string>();
    for (const paper of PAPERS) {
      for (const question of paper.questions as PaperQuestion[]) {
        expect(seen.has(question.id), question.id).toBe(false);
        seen.add(question.id);
        expect(question.prompt.trim().length > 0, question.id).toBe(true);
        expect(question.options.length, question.id).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(question.answer), question.id).toBe(true);
        expect(question.answer, question.id).toBeGreaterThanOrEqual(0);
        expect(question.answer, question.id).toBeLessThan(
          question.options.length,
        );
        expect(question.explanation.trim().length > 0, question.id).toBe(true);
      }
    }
  });

  test("visual sections use the frozen PaperVisual union", () => {
    for (const paper of PAPERS) {
      for (const section of [...paper.theory, ...paper.paper]) {
        if (section.kind !== "visual") continue;
        expect(VISUAL_KINDS, `${paper.id}:${section.visual}`).toContain(
          section.visual,
        );
      }
    }
  });

  test("lineage edges resolve within PAPERS or are absent", () => {
    const ids = new Set(PAPERS.map((paper) => paper.id));
    for (const paper of PAPERS) {
      if (paper.lineage.from !== undefined) {
        expect(ids.has(paper.lineage.from), `${paper.id} -> ${paper.lineage.from}`).toBe(true);
        expect(paper.lineage.from === paper.id, paper.id).toBe(false);
      }
      for (const id of paper.lineage.to ?? []) {
        expect(ids.has(id), `${paper.id} -> ${id}`).toBe(true);
        expect(id === paper.id, paper.id).toBe(false);
      }
      expect(paper.lineage.context.trim().length > 0, paper.id).toBe(true);
    }
  });

  test("era metadata covers every era in order", () => {
    expect(PAPER_ERAS.map((era) => era.id)).toEqual(VALID_ERAS);
    for (const era of PAPER_ERAS) {
      expect(era.label.trim().length > 0, era.id).toBe(true);
      expect(era.blurb.trim().length > 0, era.id).toBe(true);
      expect(ERA_LABELS[era.id]).toBe(era.label);
    }
    expect(Object.keys(ERA_LABELS).sort()).toEqual([...VALID_ERAS].sort());
  });

  test("papersByEra groups every paper exactly once in order", () => {
    const groups = papersByEra();
    expect(groups.map((group) => group.era.id)).toEqual(VALID_ERAS);
    expect(groups.flatMap((group) => group.papers).map((paper) => paper.id)).toEqual(
      PAPERS.map((paper) => paper.id),
    );
  });

  test("lookups and neighbours follow the global order", () => {
    for (const paper of PAPERS) {
      expect(getPaper(paper.slug)?.id).toBe(paper.id);
      expect(getPaperById(paper.id)?.slug).toBe(paper.slug);
    }
    expect(getPaper("definitely-not-a-paper")).toBeUndefined();
    expect(getPaperById("definitely-not-a-paper")).toBeUndefined();
    expect(paperNeighbours("definitely-not-a-paper")).toEqual({
      prev: null,
      next: null,
    });

    PAPERS.forEach((paper, index) => {
      const { prev, next } = paperNeighbours(paper.id);
      expect(prev?.id).toBe(index > 0 ? PAPERS[index - 1].id : undefined);
      expect(next?.id).toBe(
        index < PAPERS.length - 1 ? PAPERS[index + 1].id : undefined,
      );
    });
  });
});

describe("paperProgress", () => {
  const questions: PaperQuestion[] = [
    {
      id: "q-1",
      prompt: "First?",
      options: ["a", "b"],
      answer: 0,
      explanation: "a",
    },
    {
      id: "q-2",
      prompt: "Second?",
      options: ["a", "b"],
      answer: 1,
      explanation: "b",
    },
    {
      id: "q-3",
      prompt: "Third?",
      options: ["a", "b"],
      answer: 0,
      explanation: "a",
    },
  ];

  test("counts answered and correct, and completes only when all are answered", () => {
    const empty: PaperAnswerMap = {};
    expect(paperProgress({ questions }, empty)).toEqual({
      answered: 0,
      correct: 0,
      total: 3,
      done: false,
    });

    const partial: PaperAnswerMap = {
      "q-1": { correct: true, at: "2026-01-01T00:00:00.000Z" },
    };
    expect(paperProgress({ questions }, partial)).toEqual({
      answered: 1,
      correct: 1,
      total: 3,
      done: false,
    });

    const full: PaperAnswerMap = {
      "q-1": { correct: true, at: "2026-01-01T00:00:00.000Z" },
      "q-2": { correct: false, at: "2026-01-01T00:00:00.000Z" },
      "q-3": { correct: true, at: "2026-01-01T00:00:00.000Z" },
    };
    expect(paperProgress({ questions }, full)).toEqual({
      answered: 3,
      correct: 2,
      total: 3,
      done: true,
    });
  });

  test("a paper with no questions is never complete", () => {
    expect(paperProgress({ questions: [] }, {})).toEqual({
      answered: 0,
      correct: 0,
      total: 0,
      done: false,
    });
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
let dispatched: string[];

beforeEach(() => {
  hadWindow = "window" in globalScope;
  originalWindow = globalScope.window;
  dispatched = [];
  globalScope.window = {
    localStorage: createStorageStub(),
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

function storage(): Storage {
  return (globalScope.window as { localStorage: Storage }).localStorage;
}

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-01-02T00:00:00.000Z";
const T3 = "2026-01-03T00:00:00.000Z";

describe("papers store", () => {
  test("exposes the storage key, event, and spec as the sync seam", () => {
    expect(PAPERS_STORAGE_KEY).toBe("deepforge:papers:v1");
    expect(PAPERS_CHANGE_EVENT).toBe("deepforge:papers-change");
    expect(PAPERS_SPEC.id).toBe("papers");
    expect(PAPERS_SPEC.storageKey).toBe(PAPERS_STORAGE_KEY);
    expect(PAPERS_SPEC.event).toBe(PAPERS_CHANGE_EVENT);
    expect(PAPERS_SPEC.empty()).toEqual({ questions: {}, read: {} });
  });

  test("malformed payloads read as empty without throwing", () => {
    for (const raw of [
      "not json at all",
      "null",
      "42",
      '"nope"',
      "[]",
      '{"questions":"x","read":7}',
    ]) {
      storage().setItem(PAPERS_STORAGE_KEY, raw);
      expect(getPapersState()).toEqual({ questions: {}, read: {} });
    }
    expect(parsePapersState(null)).toEqual({ questions: {}, read: {} });
  });

  test("drops malformed entries and keeps well-formed ones", () => {
    storage().setItem(
      PAPERS_STORAGE_KEY,
      JSON.stringify({
        questions: {
          good: { correct: true, at: T1 },
          noAt: { correct: true },
          badAt: { correct: false, at: "not-a-date" },
          badCorrect: { correct: "yes", at: T1 },
          junk: "nope",
        },
        read: { paper: T1, bad: 42 },
      }),
    );
    expect(getPapersState()).toEqual({
      questions: { good: { correct: true, at: T1 } },
      read: { paper: T1 },
    });
  });

  test("recordAnswer persists and dispatches the change event", () => {
    recordAnswer("q-1", true, new Date(T1));
    expect(dispatched).toContain(PAPERS_CHANGE_EVENT);
    expect(getPapersState().questions["q-1"]).toEqual({
      correct: true,
      at: T1,
    });
  });

  test("the last answer timestamp wins per question", () => {
    recordAnswer("q-1", true, new Date(T2));
    recordAnswer("q-1", false, new Date(T1));
    expect(getPapersState().questions["q-1"].correct).toBe(true);
    recordAnswer("q-1", false, new Date(T3));
    expect(getPapersState().questions["q-1"]).toEqual({
      correct: false,
      at: T3,
    });
  });

  test("markRead keeps the latest timestamp", () => {
    markRead("paper-1", new Date(T2));
    markRead("paper-1", new Date(T1));
    expect(getPapersState().read["paper-1"]).toBe(T2);
    markRead("paper-1", new Date(T3));
    expect(getPapersState().read["paper-1"]).toBe(T3);
  });

  test("resetPaper clears its answers and read mark only", () => {
    recordAnswer("q-1", true, new Date(T1));
    recordAnswer("q-2", false, new Date(T1));
    recordAnswer("q-3", true, new Date(T1));
    markRead("paper-1", new Date(T1));
    markRead("paper-2", new Date(T1));

    resetPaper("paper-1", ["q-1", "q-2"]);

    const state = getPapersState();
    expect(state.questions["q-1"]).toBeUndefined();
    expect(state.questions["q-2"]).toBeUndefined();
    expect(state.questions["q-3"]).toEqual({ correct: true, at: T1 });
    expect(state.read["paper-1"]).toBeUndefined();
    expect(state.read["paper-2"]).toBe(T1);
  });

  test("mergePapers takes the later timestamp per question and read mark", () => {
    const local: PapersState = {
      questions: {
        q1: { correct: true, at: T1 },
        q2: { correct: false, at: T2 },
      },
      read: { p1: T1 },
    };
    const remote: PapersState = {
      questions: {
        q1: { correct: false, at: T2 },
        q3: { correct: true, at: T1 },
      },
      read: { p1: T2, p2: T1 },
    };

    const merged = mergePapers(local, remote);
    expect(merged.questions.q1).toEqual({ correct: false, at: T2 });
    expect(merged.questions.q2).toEqual({ correct: false, at: T2 });
    expect(merged.questions.q3).toEqual({ correct: true, at: T1 });
    expect(merged.read).toEqual({ p1: T2, p2: T1 });
  });

  test("mergePapers ties keep local and malformed payloads are dropped", () => {
    const local: PapersState = {
      questions: { q1: { correct: true, at: T1 } },
      read: { p1: T2 },
    };
    const remote = {
      questions: {
        q1: { correct: false, at: T1 },
        bad: { correct: true, at: "nope" },
      },
      read: { p1: T1, bad: 42 },
    } as unknown as PapersState;

    const merged = mergePapers(local, remote);
    expect(merged.questions.q1).toEqual({ correct: true, at: T1 });
    expect(merged.questions.bad).toBeUndefined();
    expect(merged.read.p1).toBe(T2);
    expect(merged.read.bad).toBeUndefined();

    for (const value of [null, undefined, 42, "junk", [], true]) {
      expect(mergePapers(value as never, value as never)).toEqual({
        questions: {},
        read: {},
      });
    }
  });
});
