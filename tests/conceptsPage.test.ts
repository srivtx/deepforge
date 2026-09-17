import { describe, expect, test } from "bun:test";
import { CONCEPTS } from "@/data/concepts";
import { PENPAPER_PROBLEMS } from "@/data/penpaper";
import { getProblemById } from "@/data/problems";
import {
  groupConceptsByCategory,
  resolveCodeProblemIds,
} from "@/components/concepts/ConceptsBrowser";
import {
  SECTIONS,
  SECTIONS_BY_ID,
  getSectionById,
  type SectionId,
} from "@/lib/sections";

const FIRST_APPEARANCE_ORDER = [
  "Linear Algebra",
  "Calculus",
  "Statistics",
  "Probability",
  "ML Fundamentals",
  "Optimization",
  "Information Theory",
];

describe("concepts section metadata", () => {
  test("registers the concepts page under Learn at /concepts", () => {
    const section = getSectionById("concepts");
    expect(section).toBeTruthy();
    expect(section?.id).toBe("concepts");
    expect(section?.href).toBe("/concepts");
    expect(section?.title).toBe("Concepts");
    expect(section?.group).toBe("Learn");
    expect(section?.blurb.trim().length).toBeGreaterThan(0);
    expect(section?.icon.trim().length).toBeGreaterThan(0);
    expect(section?.keywords.length).toBeGreaterThan(0);
    expect(SECTIONS_BY_ID.concepts.href).toBe("/concepts");
  });

  test("every section id is unique and the union includes concepts", () => {
    const ids: SectionId[] = SECTIONS.map((section) => section.id);
    const conceptsId: SectionId = "concepts";
    expect(ids).toContain(conceptsId);
    expect(new Set(ids).size).toBe(SECTIONS.length);
  });

  test("sits between the other Learn entries without reordering them", () => {
    const ids = SECTIONS.map((section) => section.id);
    expect(ids[0]).toBe("today");
    expect(ids.indexOf("penpaper")).toBeLessThan(ids.indexOf("concepts"));
    expect(ids.indexOf("concepts")).toBeLessThan(ids.indexOf("articles"));
    expect(ids.indexOf("problems")).toBeLessThan(ids.indexOf("paths"));
    expect(ids.indexOf("paths")).toBeLessThan(ids.indexOf("projects"));
  });
});

describe("concepts catalogue", () => {
  test("every concept id is unique", () => {
    const ids = CONCEPTS.map((concept) => concept.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every concept has a well-formed, existing pen paper practice id", () => {
    const known = new Set(PENPAPER_PROBLEMS.map((problem) => problem.id));
    for (const concept of CONCEPTS) {
      const practice = [concept.workedExampleId, ...concept.practiceIds];
      expect(
        practice.some((id) => /^pp-\d{3}$/.test(id)),
        concept.id,
      ).toBe(true);
      for (const id of concept.practiceIds) {
        expect(/^pp-\d{3}$/.test(id), `${concept.id} -> ${id}`).toBe(true);
        expect(known.has(id), `${concept.id} -> ${id}`).toBe(true);
      }
    }
  });

  test("code problem ids match getProblemById exactly and resolve titles", () => {
    for (const concept of CONCEPTS) {
      const declared = concept.codeProblemIds ?? [];
      const resolvable = declared.filter((id) => Boolean(getProblemById(id)));
      expect(
        resolveCodeProblemIds(concept.codeProblemIds),
        concept.id,
      ).toEqual(resolvable);
      expect(resolveCodeProblemIds(concept.codeProblemIds)).toEqual(declared);
      if (concept.codeProblemIds) {
        expect(
          resolveCodeProblemIds(concept.codeProblemIds).length,
          concept.id,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("missing code problem ids are filtered out of the render list", () => {
    expect(resolveCodeProblemIds(undefined)).toEqual([]);
    expect(resolveCodeProblemIds([])).toEqual([]);
    expect(
      resolveCodeProblemIds(["la-006", "definitely-not-a-problem"]),
    ).toEqual(["la-006"]);
    expect(getProblemById("definitely-not-a-problem")).toBeUndefined();
  });
});

describe("category ordering", () => {
  test("groups follow first appearance order in the catalogue", () => {
    const groups = groupConceptsByCategory(CONCEPTS);
    expect(groups.map((group) => group.category)).toEqual(FIRST_APPEARANCE_ORDER);
    expect(new Set(groups.map((group) => group.category)).size).toBe(
      groups.length,
    );
    expect(groups.flatMap((group) => group.concepts)).toEqual([...CONCEPTS]);
  });

  test("is deterministic for reversed input", () => {
    const reversed = [...CONCEPTS].reverse();
    expect(
      groupConceptsByCategory(reversed).map((group) => group.category),
    ).toEqual([...FIRST_APPEARANCE_ORDER].reverse());
  });

  test("handles an empty catalogue", () => {
    expect(groupConceptsByCategory([])).toEqual([]);
  });
});
