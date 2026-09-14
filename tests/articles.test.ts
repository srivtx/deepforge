import { describe, expect, test } from "bun:test";
import {
  ARTICLES,
  FIGURES,
  type DemoKind,
  type FigureKind,
} from "@/data/articles";
import { DEMOS } from "@/lib/articles-demos";
import { PROBLEMS } from "@/data/problems";
import {
  DECODE_TILE,
  DECODE_TOKENS,
  TOY_QUERY_HEADS,
  kvBytesPerToken,
  kvGb,
  kvHeadsFor,
  onlineSoftmaxTrace,
  softmaxWeights,
  tokenScores,
  visiblePositions,
} from "@/components/articles/DemoKvCache";
import {
  RAG_CHUNKS,
  RAG_QUERIES,
  boundaryRecall,
  rankIndices,
  rerankScore,
  rrfScores,
  selectEvidence,
} from "@/components/articles/DemoRagRetrieval";
import {
  CORRECT_ACTION,
  GRPO_GROUP_ACTIONS,
  PREFERRED_ACTION,
  REJECTED_ACTION,
  VERIFIABLE_REWARDS,
  dpoMetrics,
  grpoAdvantages,
  policyUpdate,
  softmax,
} from "@/components/articles/DemoPostTraining";

const problemIds = new Set(PROBLEMS.map((problem) => problem.id));

const near = (actual: number, expected: number, eps = 1e-9) =>
  Math.abs(actual - expected) < eps;

const EXPECTED_DEMO_KINDS: DemoKind[] = [
  "softmax-temperature",
  "eigenvector",
  "gradient-descent",
  "kmeans",
  "attention",
  "bpe-merge",
  "embedding-cosine",
  "quantization-scale",
  "kv-cache",
  "rag-retrieval",
  "post-training",
];

const EXPECTED_FIGURE_KINDS: FigureKind[] = [
  "softmax-temperature-curve",
  "eigenvector-grid",
  "descent-contours",
  "kmeans-loop",
  "attention-pipeline",
  "attention-heatmap",
  "bpe-merge-cascade",
  "embedding-geometry",
  "quantization-number-line",
  "kv-memory-tiling",
  "rag-pipeline",
  "post-training-pipeline",
];

const EXPECTED_SLUGS = [
  "why-softmax-needs-temperature",
  "eigenvectors-you-can-see",
  "gradient-descent-from-mse-to-logistic",
  "k-means-assignment-to-convergence",
  "attention-is-a-heatmap",
  "tokenization-byte-pair-encoding",
  "embeddings-and-cosine-similarity",
  "quantization-int8-to-fp8",
  "kv-cache-and-flashattention",
  "rag-from-chunks-to-citations",
  "post-training-rlhf-dpo-grpo",
];

describe("article catalogue", () => {
  test("every referenced problem exists in the catalogue", () => {
    for (const article of ARTICLES) {
      expect(article.problemIds.length, article.id).toBeGreaterThanOrEqual(4);
      expect(article.problemIds.length, article.id).toBeLessThanOrEqual(6);
      for (const id of article.problemIds) {
        expect(problemIds.has(id), `${article.id} -> ${id}`).toBe(true);
      }
    }
  });

  test("has unique ids and slugs with complete metadata", () => {
    const ids = new Set(ARTICLES.map((article) => article.id));
    const slugs = new Set(ARTICLES.map((article) => article.slug));
    expect(ids.size).toBe(ARTICLES.length);
    expect(slugs.size).toBe(ARTICLES.length);

    for (const article of ARTICLES) {
      expect(article.title.trim().length > 0, article.id).toBe(true);
      expect(article.dek.trim().length > 0, article.id).toBe(true);
      expect(article.category.trim().length > 0, article.id).toBe(true);
      expect(article.readMinutes, article.id).toBeGreaterThan(0);
      expect(article.sections.length, article.id).toBeGreaterThan(0);
      for (const section of article.sections) {
        if (section.kind === "prose") {
          expect(section.text.trim().length > 0, article.id).toBe(true);
        } else if (section.kind === "demo") {
          expect(typeof section.demo, article.id).toBe("string");
        } else {
          expect(typeof section.figure, article.id).toBe("string");
          expect(
            section.caption?.trim().length ?? 0,
            `${article.id}:${section.figure} caption`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  test("ships the eleven expected articles with a demo and a figure each", () => {
    expect(ARTICLES.map((article) => article.slug)).toEqual(EXPECTED_SLUGS);
    for (const article of ARTICLES) {
      expect(
        article.sections.filter((section) => section.kind === "demo").length,
        article.id,
      ).toBeGreaterThanOrEqual(1);
      expect(
        article.sections.filter((section) => section.kind === "figure").length,
        article.id,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test("the new articles ship one demo and one figure with the spec practice ids", () => {
    const expected = {
      "art-kv-cache": {
        category: "Deep Learning",
        problemIds: ["dl-075", "dl-124", "dl-186", "dl-211", "dl-370", "dl-401"],
      },
      "art-rag": {
        category: "NLP",
        problemIds: [
          "nlp-141",
          "nlp-148",
          "nlp-184",
          "nlp-185",
          "nlp-242",
          "nlp-252",
        ],
      },
      "art-post-training": {
        category: "Reinforcement Learning",
        problemIds: ["dl-180", "dl-182", "rl-204", "rl-205", "rl-274", "rl-275"],
      },
    } as const;

    for (const [id, spec] of Object.entries(expected)) {
      const article = ARTICLES.find((entry) => entry.id === id);
      expect(article, id).not.toBeUndefined();
      if (!article) continue;
      expect(article.category, id).toBe(spec.category);
      expect(article.problemIds, id).toEqual([...spec.problemIds]);
      expect(
        article.sections.filter((section) => section.kind === "demo"),
        id,
      ).toHaveLength(1);
      expect(
        article.sections.filter((section) => section.kind === "figure"),
        id,
      ).toHaveLength(1);
    }
  });

  test("never places a demo next to a figure", () => {
    for (const article of ARTICLES) {
      for (let i = 1; i < article.sections.length; i++) {
        const previous = article.sections[i - 1];
        const current = article.sections[i];
        if (previous.kind === "prose" || current.kind === "prose") continue;
        expect(previous.kind, `${article.id} sections ${i - 1}-${i}`).not.toBe(
          current.kind,
        );
      }
    }
  });

  test("every demo kind resolves in the DEMOS registry", () => {
    const used = new Set<DemoKind>();
    for (const article of ARTICLES) {
      for (const section of article.sections) {
        if (section.kind !== "demo") continue;
        used.add(section.demo);
        expect(
          typeof DEMOS[section.demo],
          `${article.id}:${section.demo}`,
        ).toBe("function");
      }
    }

    expect(used.size).toBeGreaterThan(0);
    expect([...used].sort()).toEqual([...EXPECTED_DEMO_KINDS].sort());
    expect(Object.keys(DEMOS).sort()).toEqual([...EXPECTED_DEMO_KINDS].sort());
    for (const kind of Object.keys(DEMOS) as DemoKind[]) {
      expect(typeof DEMOS[kind], kind).toBe("function");
    }
  });

  test("every figure kind resolves in the FIGURES registry", () => {
    const used = new Set<FigureKind>();
    for (const article of ARTICLES) {
      for (const section of article.sections) {
        if (section.kind !== "figure") continue;
        used.add(section.figure);
        expect(
          typeof FIGURES[section.figure],
          `${article.id}:${section.figure}`,
        ).toBe("function");
      }
    }

    expect(used.size).toBeGreaterThan(0);
    expect([...used].sort()).toEqual([...EXPECTED_FIGURE_KINDS].sort());
    expect(Object.keys(FIGURES).sort()).toEqual(
      [...EXPECTED_FIGURE_KINDS].sort(),
    );
    for (const kind of Object.keys(FIGURES) as FigureKind[]) {
      expect(typeof FIGURES[kind], kind).toBe("function");
    }
  });
});

describe("kv cache demo logic", () => {
  const base = {
    layers: 32,
    heads: 32,
    headDim: 128,
    mode: "gqa" as const,
    dtype: "bf16" as const,
  };

  test("KV heads compress per attention layout", () => {
    expect(kvHeadsFor(32, "mha")).toBe(32);
    expect(kvHeadsFor(32, "gqa")).toBe(8);
    expect(kvHeadsFor(32, "mqa")).toBe(1);
    expect(kvHeadsFor(64, "gqa")).toBe(16);
  });

  test("bytes per token follows the projection shape", () => {
    expect(kvBytesPerToken(base)).toBe(131072);
    expect(kvBytesPerToken({ ...base, dtype: "fp8" })).toBe(65536);
    expect(kvBytesPerToken({ ...base, dtype: "int4" })).toBe(32768);
    expect(kvBytesPerToken({ ...base, mode: "mha" })).toBe(
      4 * kvBytesPerToken(base),
    );
    expect(kvBytesPerToken({ ...base, mode: "mqa" })).toBe(
      kvBytesPerToken(base) / 8,
    );
  });

  test("cache size scales with context and concurrency", () => {
    const one = kvGb(base, 32768, 1);
    expect(near(kvGb(base, 65536, 1), one * 2)).toBe(true);
    expect(near(kvGb(base, 32768, 8), one * 8)).toBe(true);
    expect(one).toBeGreaterThan(4);
    expect(one).toBeLessThan(5);
  });

  test("online softmax rescales the running sum exactly once per tile", () => {
    const scores = [1, 2, 3, 0];
    const { steps, m, l } = onlineSoftmaxTrace(scores, 2);
    expect(steps).toHaveLength(2);
    expect(steps[0].mNew).toBe(2);
    expect(steps[1].mNew).toBe(3);
    expect(
      near(
        steps[1].rescale,
        steps[1].lOld * Math.exp(steps[1].mOld - steps[1].mNew),
      ),
    ).toBe(true);
    const expectedL = scores.reduce((sum, x) => sum + Math.exp(x - 3), 0);
    expect(m).toBe(3);
    expect(near(l, expectedL)).toBe(true);

    const weights = softmaxWeights(scores);
    expect(near(weights.reduce((sum, w) => sum + w, 0), 1)).toBe(true);
    expect(weights[2]).toBe(Math.max(...weights));
  });

  test("decode policy decides which positions survive", () => {
    expect(visiblePositions(12, 8, "none")).toEqual(
      Array.from({ length: 12 }, (_, i) => i),
    );
    expect(visiblePositions(12, 8, "window")).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
    expect(visiblePositions(12, 8, "sink")).toEqual([0, 1, 6, 7, 8, 9, 10, 11]);
    expect(visiblePositions(4, 8, "window")).toEqual([0, 1, 2, 3]);
  });

  test("decode fixtures stay consistent", () => {
    expect(DECODE_TOKENS.length).toBe(16);
    expect(DECODE_TILE).toBe(4);
    expect(TOY_QUERY_HEADS).toBe(8);
    const scores = tokenScores(10);
    expect(scores).toHaveLength(10);
    expect(tokenScores(10)).toEqual(scores);
  });
});

describe("rag demo logic", () => {
  test("corpus and queries line up", () => {
    expect(RAG_QUERIES).toHaveLength(4);
    for (const chunk of RAG_CHUNKS) {
      expect(chunk.lexical).toHaveLength(RAG_QUERIES.length);
      expect(chunk.dense).toHaveLength(RAG_QUERIES.length);
    }
  });

  test("rank indices sort by score, ties by index", () => {
    expect(rankIndices([0.2, 0.9, 0.5])).toEqual([1, 2, 0]);
    expect(rankIndices([0.5, 0.5, 0.1])).toEqual([0, 1, 2]);
  });

  test("reciprocal rank fusion sums contributions per list", () => {
    const order = rankIndices(RAG_CHUNKS.map((c) => c.lexical[1]));
    const lexicalOnly = rrfScores(
      RAG_CHUNKS.map((c) => c.lexical[1]),
      RAG_CHUNKS.map((c) => c.dense[1]),
      60,
      "lexical",
    );
    order.forEach((index, rank) => {
      expect(near(lexicalOnly[index], 1 / (61 + rank))).toBe(true);
    });
    const hybrid = rrfScores(
      RAG_CHUNKS.map((c) => c.lexical[1]),
      RAG_CHUNKS.map((c) => c.dense[1]),
      60,
      "hybrid",
    );
    hybrid.forEach((score, i) => {
      expect(score).toBeGreaterThanOrEqual(lexicalOnly[i]);
    });
    const denseOnly = rrfScores(
      RAG_CHUNKS.map((c) => c.lexical[1]),
      RAG_CHUNKS.map((c) => c.dense[1]),
      60,
      "dense",
    );
    denseOnly.forEach((score, i) => {
      expect(near(hybrid[i], score + lexicalOnly[i])).toBe(true);
    });
  });

  test("boundary recall improves with chunk overlap and saturates", () => {
    expect(boundaryRecall(0)).toBe(70);
    expect(boundaryRecall(15)).toBe(85);
    expect(boundaryRecall(30)).toBe(100);
    expect(boundaryRecall(60)).toBe(100);
    expect(boundaryRecall(60)).toBeGreaterThan(boundaryRecall(10));
  });

  test("evidence selection refuses below the threshold", () => {
    const scores = [0.9, 0.6, 0.3, 0.2];
    const order = rankIndices(scores);
    expect(selectEvidence(scores, order, 2, 0.4).kept).toEqual([0, 1]);
    expect(selectEvidence(scores, order, 2, 0.4).refused).toBe(false);
    expect(selectEvidence(scores, order, 2, 0.95)).toEqual({
      kept: [],
      refused: true,
    });
  });

  test("the out-of-corpus query never clears the lowest threshold", () => {
    const best = Math.max(
      ...RAG_CHUNKS.map((chunk) => rerankScore(chunk.lexical[3], chunk.dense[3])),
    );
    expect(best).toBeLessThan(0.2);
  });
});

describe("post-training demo logic", () => {
  test("DPO margin, loss, and preference probability agree", () => {
    const chosen = -1.5;
    const rejected = -2.5;
    const result = dpoMetrics(chosen, rejected, -2, -2, 0.5, false);
    expect(near(result.margin, 0.5)).toBe(true);
    expect(near(result.loss, Math.log1p(Math.exp(-0.5)))).toBe(true);
    expect(near(result.winProb, 1 / (1 + Math.exp(-0.5)))).toBe(true);

    const withRef = dpoMetrics(chosen, rejected, -2.2, -2, 0.5, true);
    expect(near(withRef.margin, 0.6)).toBe(true);
    expect(withRef.loss).toBeLessThan(result.loss);
  });

  test("GRPO standardizes rewards inside the group", () => {
    const advantages = grpoAdvantages([1, 0, 1, 0]);
    expect(near(advantages[0], 1)).toBe(true);
    expect(near(advantages[1], -1)).toBe(true);
    expect(near(advantages[2], 1)).toBe(true);
    expect(near(advantages[3], -1)).toBe(true);
    expect(grpoAdvantages([0.5, 0.5, 0.5])).toEqual([0, 0, 0]);
  });

  test("SFT pushes probability toward the demonstrated action", () => {
    const logits = [0.6, 0.2, 0, -0.2, -0.6];
    const before = softmax(logits);
    const after = softmax(
      policyUpdate(logits, "sft", 0.3, {
        preferred: PREFERRED_ACTION,
        rejected: REJECTED_ACTION,
        groupActions: GRPO_GROUP_ACTIONS,
        advantages: grpoAdvantages(VERIFIABLE_REWARDS),
      }),
    );
    expect(after[CORRECT_ACTION]).toBeGreaterThan(before[CORRECT_ACTION]);
    expect(near(after.reduce((s, p) => s + p, 0), 1)).toBe(true);
  });

  test("DPO separates the preferred action from the rejected one", () => {
    const logits = [0.6, 0.2, 0, -0.2, -0.6];
    const before = softmax(logits);
    const after = softmax(
      policyUpdate(logits, "dpo", 0.3, {
        preferred: PREFERRED_ACTION,
        rejected: REJECTED_ACTION,
        groupActions: GRPO_GROUP_ACTIONS,
        advantages: grpoAdvantages(VERIFIABLE_REWARDS),
      }),
    );
    expect(after[PREFERRED_ACTION]).toBeGreaterThan(before[PREFERRED_ACTION]);
    expect(after[REJECTED_ACTION]).toBeLessThan(before[REJECTED_ACTION]);
  });

  test("verifiable GRPO lifts rewarded actions", () => {
    const logits = [0.6, 0.2, 0, -0.2, -0.6];
    const before = softmax(logits);
    const advantages = grpoAdvantages(VERIFIABLE_REWARDS);
    const after = softmax(
      policyUpdate(logits, "grpo", 0.3, {
        preferred: PREFERRED_ACTION,
        rejected: REJECTED_ACTION,
        groupActions: GRPO_GROUP_ACTIONS,
        advantages,
      }),
    );
    for (let i = 0; i < GRPO_GROUP_ACTIONS.length; i++) {
      const action = GRPO_GROUP_ACTIONS[i];
      if (advantages[i] > 0) {
        expect(after[action]).toBeGreaterThan(before[action]);
      } else {
        expect(after[action]).toBeLessThan(before[action]);
      }
    }
  });
});
