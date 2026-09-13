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

describe("article catalogue", () => {
  test("every referenced problem exists in the catalogue", () => {
    for (const article of ARTICLES) {
      expect(article.problemIds.length, article.id).toBeGreaterThan(0);
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
    expect([...used].sort()).toEqual(Object.keys(DEMOS).sort());
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
    expect([...used].sort()).toEqual(Object.keys(FIGURES).sort());
    for (const kind of Object.keys(FIGURES) as FigureKind[]) {
      expect(typeof FIGURES[kind], kind).toBe("function");
    }
  });
});
