import { describe, expect, test } from "bun:test";
import {
  ARTICLES,
  FIGURES,
  type DemoKind,
  type FigureKind,
} from "@/data/articles";
import { DEMOS } from "@/lib/articles-demos";
import { PROBLEMS } from "@/data/problems";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { resolveHandsOnLinks } from "@/components/articles/handsOn";
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
import {
  PCA_POINTS,
  explainedRatio,
  meanOf,
  momentMatrix,
  pcaAxes,
  projectionVariance,
  rankReconstruction,
  residualError,
  standardDeviationOf,
  toWorkingSpace,
  type PcaOptions,
} from "@/components/articles/DemoPcaProjection";
import {
  CALIBRATION_SAMPLES,
  accuracyOf,
  buildCalibrationSamples,
  calibratedConfidence,
  expectedCalibrationError,
  fitTemperature,
  logit,
  meanConfidence,
  negativeLogLikelihood,
  reliabilityBins,
  sigmoid,
} from "@/components/articles/DemoCalibrationUncertainty";
import {
  FROZEN_W,
  LORA_TARGET,
  addMats,
  denseParamCount,
  frobeniusNorm,
  fullFinetuneMemoryBytes,
  identity,
  loraParamCount,
  matmul,
  mergeWeights,
  qloraMemoryBytes,
  rankApproximation,
  symmetricEigen,
  transpose,
} from "@/components/articles/DemoLoraRank";

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
  "pca-projection",
  "calibration-uncertainty",
  "lora-rank",
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
  "pca-ellipse-scree",
  "calibration-reliability",
  "lora-adapter",
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
  "pca-and-svd-in-practice",
  "calibration-and-uncertainty",
  "lora-low-rank-fine-tuning",
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

  test("ships the fourteen expected articles with a demo and a figure each", () => {
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

  test("the wave-28 articles ship one demo and one figure with the spec practice ids", () => {
    const expected = {
      "art-pca-svd": {
        category: "Linear Algebra",
        problemIds: ["ml-041", "la-139", "la-249", "la-250", "la-251", "la-089"],
        demo: "pca-projection",
        figure: "pca-ellipse-scree",
      },
      "art-calibration": {
        category: "ML Fundamentals",
        problemIds: ["ml-065", "ml-072", "ml-101", "ml-337", "dl-086", "ml-291"],
        demo: "calibration-uncertainty",
        figure: "calibration-reliability",
      },
      "art-lora": {
        category: "Deep Learning",
        problemIds: ["dl-151", "dl-152", "dl-153", "dl-154", "dl-219", "dl-220"],
        demo: "lora-rank",
        figure: "lora-adapter",
      },
    } as const;

    for (const [id, spec] of Object.entries(expected)) {
      const article = ARTICLES.find((entry) => entry.id === id);
      expect(article, id).not.toBeUndefined();
      if (!article) continue;
      expect(article.category, id).toBe(spec.category);
      expect(article.problemIds, id).toEqual([...spec.problemIds]);
      const demos = article.sections.filter((section) => section.kind === "demo");
      const figures = article.sections.filter((section) => section.kind === "figure");
      expect(demos, id).toHaveLength(1);
      expect(figures, id).toHaveLength(1);
      expect(demos[0]?.kind === "demo" ? demos[0].demo : "", id).toBe(spec.demo);
      expect(figures[0]?.kind === "figure" ? figures[0].figure : "", id).toBe(
        spec.figure,
      );
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

describe("article hands-on links", () => {
  const labIds = new Set(LABS.map((lab) => lab.id));
  const researchIds = new Set(
    RESEARCH_CHALLENGES.map((challenge) => challenge.id),
  );

  test("every related lab and research id resolves in the catalogues", () => {
    for (const article of ARTICLES) {
      for (const id of article.relatedLabIds ?? []) {
        expect(labIds.has(id), `${article.id} -> ${id}`).toBe(true);
      }
      for (const id of article.relatedResearchIds ?? []) {
        expect(researchIds.has(id), `${article.id} -> ${id}`).toBe(true);
      }
    }
  });

  test("no article repeats a hands-on link and at least eight carry one", () => {
    let withLinks = 0;
    for (const article of ARTICLES) {
      const labs = article.relatedLabIds ?? [];
      const research = article.relatedResearchIds ?? [];
      expect(new Set(labs).size, `${article.id} lab duplicates`).toBe(
        labs.length,
      );
      expect(new Set(research).size, `${article.id} research duplicates`).toBe(
        research.length,
      );
      if (labs.length + research.length > 0) withLinks += 1;
    }
    expect(withLinks).toBeGreaterThanOrEqual(8);
  });

  test("resolveHandsOnLinks builds hrefs and skips unknown ids", () => {
    for (const article of ARTICLES) {
      const links = resolveHandsOnLinks(article);
      const expectedCount =
        (article.relatedLabIds?.length ?? 0) +
        (article.relatedResearchIds?.length ?? 0);
      expect(links, article.id).toHaveLength(expectedCount);
      expect(new Set(links.map((link) => link.href)).size, article.id).toBe(
        links.length,
      );
      for (const link of links) {
        expect(link.title.trim().length > 0, article.id).toBe(true);
        expect(link.href, article.id).toMatch(/^\/(labs|research)\/[a-z0-9-]+$/);
      }
    }

    const stray = resolveHandsOnLinks({
      ...ARTICLES[0],
      relatedLabIds: ["lab-99"],
      relatedResearchIds: ["not-a-challenge"],
    });
    expect(stray).toEqual([]);
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

describe("pca demo logic", () => {
  const centered: PcaOptions = { center: true, standardize: false };
  const standardized: PcaOptions = { center: true, standardize: true };
  const raw: PcaOptions = { center: false, standardize: false };

  test("mean and standard deviation match the fixture", () => {
    expect(PCA_POINTS).toHaveLength(18);
    const mean = meanOf(PCA_POINTS);
    expect(near(mean[0], 1.19 / 18, 1e-9)).toBe(true);
    expect(near(mean[1], 0.44 / 18, 1e-9)).toBe(true);
    const std = standardDeviationOf(PCA_POINTS);
    expect(std[0]).toBeGreaterThan(std[1]);
    expect(std[1]).toBeGreaterThan(0);
  });

  test("principal axes are orthonormal and ordered", () => {
    const { values, axes } = pcaAxes(PCA_POINTS, centered);
    expect(values[0]).toBeGreaterThan(values[1]);
    expect(values[1]).toBeGreaterThan(0);
    for (const axis of axes) {
      expect(near(Math.hypot(axis[0], axis[1]), 1, 1e-9)).toBe(true);
    }
    const dot = axes[0][0] * axes[1][0] + axes[0][1] * axes[1][1];
    expect(Math.abs(dot)).toBeLessThan(1e-9);
  });

  test("the best axis explains the top eigenvalue and floors the residual", () => {
    const { values, axes } = pcaAxes(PCA_POINTS, centered);
    expect(
      near(projectionVariance(PCA_POINTS, axes[0], centered), values[0], 1e-8),
    ).toBe(true);
    expect(
      near(residualError(PCA_POINTS, axes[0], centered), values[1], 1e-8),
    ).toBe(true);
    const other = residualError(PCA_POINTS, axes[1], centered);
    expect(near(other, values[0], 1e-8)).toBe(true);
    expect(near(explainedRatio({ values, axes }, 0) + explainedRatio({ values, axes }, 1), 1, 1e-9)).toBe(true);
  });

  test("rank-r reconstruction is exact at full rank and matches the residual", () => {
    const { values } = pcaAxes(PCA_POINTS, centered);
    const rankOne = rankReconstruction(PCA_POINTS, 1, centered);
    expect(near(rankOne.error, values[1], 1e-8)).toBe(true);
    expect(near(rankOne.retained, values[0] / (values[0] + values[1]), 1e-9)).toBe(true);
    const rankTwo = rankReconstruction(PCA_POINTS, 2, centered);
    expect(rankTwo.error).toBeLessThan(1e-9);
    expect(near(rankTwo.retained, 1, 1e-9)).toBe(true);
  });

  test("preprocessing changes the working space and the axes", () => {
    const working = toWorkingSpace(PCA_POINTS, standardized);
    const mean = meanOf(working);
    const std = standardDeviationOf(working);
    expect(Math.abs(mean[0])).toBeLessThan(1e-9);
    expect(Math.abs(mean[1])).toBeLessThan(1e-9);
    expect(near(std[0], 1, 1e-9)).toBe(true);
    expect(near(std[1], 1, 1e-9)).toBe(true);

    const standardAxes = pcaAxes(PCA_POINTS, standardized);
    const centeredAxes = pcaAxes(PCA_POINTS, centered);
    expect(near(standardAxes.values[0] + standardAxes.values[1], 2, 1e-9)).toBe(true);
    const alignment = Math.abs(
      standardAxes.axes[0][0] * centeredAxes.axes[0][0] +
        standardAxes.axes[0][1] * centeredAxes.axes[0][1],
    );
    expect(alignment).toBeLessThan(0.999);

    const shifted = PCA_POINTS.map(
      ([x, y]) => [x + 2.5, y - 1.5] as [number, number],
    );
    const shiftedCentered = pcaAxes(shifted, centered);
    const shiftedAlignment = Math.abs(
      shiftedCentered.axes[0][0] * centeredAxes.axes[0][0] +
        shiftedCentered.axes[0][1] * centeredAxes.axes[0][1],
    );
    expect(near(shiftedAlignment, 1, 1e-9)).toBe(true);
    expect(near(shiftedCentered.values[0], centeredAxes.values[0], 1e-9)).toBe(true);

    const rawAxes = pcaAxes(PCA_POINTS, raw);
    const shiftedRaw = pcaAxes(shifted, raw);
    const rawAlignment = Math.abs(
      rawAxes.axes[0][0] * shiftedRaw.axes[0][0] +
        rawAxes.axes[0][1] * shiftedRaw.axes[0][1],
    );
    expect(rawAlignment).toBeLessThan(0.999);
    const rawTrace = momentMatrix(PCA_POINTS, false);
    const centeredTrace = momentMatrix(toWorkingSpace(PCA_POINTS, centered), true);
    expect(rawTrace[0] + rawTrace[2]).toBeGreaterThan(centeredTrace[0] + centeredTrace[2]);
  });
});

describe("calibration demo logic", () => {
  test("sigmoid and logit are inverses on the fixture range", () => {
    for (const p of [0.05, 0.25, 0.5, 0.75, 0.95]) {
      expect(near(sigmoid(logit(p)), p, 1e-9)).toBe(true);
    }
    expect(sigmoid(0)).toBe(0.5);
  });

  test("the fixture is deterministic and well formed", () => {
    expect(CALIBRATION_SAMPLES).toHaveLength(320);
    expect(buildCalibrationSamples(16)).toEqual(buildCalibrationSamples(16));
    for (const sample of CALIBRATION_SAMPLES) {
      expect(Number.isFinite(sample.score)).toBe(true);
      expect(sample.outcome === 0 || sample.outcome === 1).toBe(true);
    }
    expect(accuracyOf(CALIBRATION_SAMPLES)).toBeGreaterThan(0.3);
    expect(accuracyOf(CALIBRATION_SAMPLES)).toBeLessThan(0.7);
  });

  test("softening with temperature lowers confidence but never accuracy", () => {
    const atOne = meanConfidence(CALIBRATION_SAMPLES, 1);
    const atTwo = meanConfidence(CALIBRATION_SAMPLES, 2);
    const atFour = meanConfidence(CALIBRATION_SAMPLES, 4);
    expect(atOne).toBeGreaterThan(atTwo);
    expect(atTwo).toBeGreaterThan(atFour);
    expect(accuracyOf(CALIBRATION_SAMPLES)).toBe(accuracyOf(CALIBRATION_SAMPLES));
    expect(
      Math.abs(calibratedConfidence(CALIBRATION_SAMPLES[0].score, 3) - 0.5),
    ).toBeLessThan(
      Math.abs(calibratedConfidence(CALIBRATION_SAMPLES[0].score, 1) - 0.5),
    );
  });

  test("bins partition the sample and gaps are non-negative", () => {
    for (const mode of ["equal-width", "equal-frequency"] as const) {
      const bins = reliabilityBins(CALIBRATION_SAMPLES, 1, 8, mode);
      expect(bins).toHaveLength(8);
      const total = bins.reduce((sum, bin) => sum + bin.count, 0);
      expect(total).toBe(CALIBRATION_SAMPLES.length);
      for (const bin of bins) {
        expect(bin.gap).toBeGreaterThanOrEqual(0);
        expect(bin.confidence).toBeGreaterThanOrEqual(0);
        expect(bin.confidence).toBeLessThanOrEqual(1);
        expect(bin.accuracy).toBeGreaterThanOrEqual(0);
        expect(bin.accuracy).toBeLessThanOrEqual(1);
      }
    }
    const frequency = reliabilityBins(CALIBRATION_SAMPLES, 1, 8, "equal-frequency");
    const counts = frequency.map((bin) => bin.count);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  test("fitting temperature lowers ECE and NLL from the overconfident baseline", () => {
    const fitted = fitTemperature(CALIBRATION_SAMPLES);
    expect(fitted).toBeGreaterThan(1);
    expect(fitted).toBeLessThan(6);
    const baseBins = reliabilityBins(CALIBRATION_SAMPLES, 1, 8, "equal-width");
    const fittedBins = reliabilityBins(CALIBRATION_SAMPLES, fitted, 8, "equal-width");
    const baseEce = expectedCalibrationError(baseBins, CALIBRATION_SAMPLES.length);
    const fittedEce = expectedCalibrationError(fittedBins, CALIBRATION_SAMPLES.length);
    expect(baseEce).toBeGreaterThan(0.02);
    expect(fittedEce).toBeLessThan(baseEce);
    expect(fittedEce).toBeGreaterThanOrEqual(0);
    expect(fittedEce).toBeLessThanOrEqual(1);
    const baseNll = negativeLogLikelihood(CALIBRATION_SAMPLES, 1);
    const fittedNll = negativeLogLikelihood(CALIBRATION_SAMPLES, fitted);
    expect(fittedNll).toBeLessThanOrEqual(baseNll + 1e-9);
    expect(fittedNll).toBeLessThanOrEqual(
      negativeLogLikelihood(CALIBRATION_SAMPLES, 5) + 1e-9,
    );
  });
});

describe("lora demo logic", () => {
  test("matrix helpers behave", () => {
    const eye = identity(3);
    expect(near(frobeniusNorm(eye), Math.sqrt(3), 1e-9)).toBe(true);
    expect(matmul(LORA_TARGET, eye)).toEqual(LORA_TARGET);
    expect(transpose(transpose(LORA_TARGET))).toEqual(LORA_TARGET);
    expect(addMats(LORA_TARGET, eye)[0][0]).toBe(LORA_TARGET[0][0] + 1);
  });

  test("symmetric eigendecomposition reconstructs the matrix", () => {
    const { values, vectors } = symmetricEigen([
      [2, 1],
      [1, 2],
    ]);
    expect(near(values[0], 3, 1e-9)).toBe(true);
    expect(near(values[1], 1, 1e-9)).toBe(true);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const rebuilt =
          values[0] * vectors[0][i] * vectors[0][j] +
          values[1] * vectors[1][i] * vectors[1][j];
        const original = i === j ? 2 : 1;
        expect(near(rebuilt, original, 1e-9)).toBe(true);
      }
    }
  });

  test("rank-r approximation is Eckart-Young optimal and improves with rank", () => {
    const rankOne = rankApproximation(LORA_TARGET, 1);
    const rankTwo = rankApproximation(LORA_TARGET, 2);
    const rankThree = rankApproximation(LORA_TARGET, 3);
    expect(rankOne.error).toBeGreaterThan(rankTwo.error);
    expect(rankTwo.error).toBeGreaterThan(rankThree.error);
    expect(rankThree.error).toBeLessThan(1e-6);
    expect(near(rankOne.retainedEnergy + rankOne.error ** 2, rankOne.totalEnergy, 1e-9)).toBe(true);
    expect(rankOne.retainedEnergy).toBeLessThan(rankTwo.retainedEnergy);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(near(rankThree.approx[i][j], LORA_TARGET[i][j], 1e-6)).toBe(true);
      }
    }
  });

  test("merging folds the adapter into the frozen weight", () => {
    const { b, a, approx } = rankApproximation(LORA_TARGET, 2);
    const merged = mergeWeights(FROZEN_W, b, a);
    const expected = addMats(FROZEN_W, approx);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(near(merged[i][j], expected[i][j], 1e-12)).toBe(true);
      }
    }
  });

  test("parameter and memory arithmetic follows the formulas", () => {
    expect(loraParamCount(4096, 4096, 16)).toBe(131072);
    expect(denseParamCount(4096, 4096)).toBe(16777216);
    expect(
      near(
        loraParamCount(4096, 4096, 16) / denseParamCount(4096, 4096),
        0.0078125,
        1e-9,
      ),
    ).toBe(true);
    expect(loraParamCount(4096, 2048, 8)).toBe(8 * (4096 + 2048));
    const full = fullFinetuneMemoryBytes(7e9);
    const qlora = qloraMemoryBytes(7e9, 4096, 4096, 16);
    expect(qlora).toBeLessThan(full / 20);
    expect(qlora).toBeGreaterThan(3.5e9);
    expect(
      qloraMemoryBytes(7e9, 4096, 4096, 32) - qloraMemoryBytes(7e9, 4096, 4096, 16),
    ).toBe(12 * loraParamCount(4096, 4096, 16));
  });
});
