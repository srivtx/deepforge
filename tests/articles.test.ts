import { describe, expect, test } from "bun:test";
import {
  ARTICLES,
  FIGURES,
  type DemoKind,
  type FigureKind,
} from "@/data/articles";
import { DEMOS } from "@/lib/articles-demos";
import { PROBLEMS } from "@/data/problems";

const problemIds = new Set(PROBLEMS.map((problem) => problem.id));

const EXPECTED_DEMO_KINDS: DemoKind[] = [
  "softmax-temperature",
  "eigenvector",
  "gradient-descent",
  "kmeans",
  "attention",
  "bpe-merge",
  "embedding-cosine",
  "quantization-scale",
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

  test("ships the eight expected articles with a demo and a figure each", () => {
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
