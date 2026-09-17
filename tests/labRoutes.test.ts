import { describe, expect, test } from "bun:test";
import {
  generateStaticParams,
  labCategorySlug,
  labMetaDescription,
} from "@/app/labs/[id]/page";
import { LABS } from "@/data/labs";
import { getProblemById } from "@/data/problems";
import { CATEGORIES } from "@/data/problems/meta";
import { LAB_RELATED, getLabRelated } from "@/components/labs/related";
import { categorySlug } from "@/lib/sections";

describe("lab detail routes", () => {
  test("every lab id has a unique static page entry", () => {
    const pageIds = generateStaticParams().map((entry) => entry.id);
    expect(pageIds.length).toBe(LABS.length);
    expect(LABS.length).toBe(8);
    expect(new Set(pageIds).size).toBe(pageIds.length);
    expect([...pageIds].sort()).toEqual(LABS.map((lab) => lab.id).sort());
  });

  test("every lab authors related problems that exist in the bank", () => {
    expect(Object.keys(LAB_RELATED).sort()).toEqual(
      LABS.map((lab) => lab.id).sort(),
    );
    for (const lab of LABS) {
      const related = getLabRelated(lab.id);
      expect(related).not.toBeUndefined();
      expect(related!.problems.length, lab.id).toBeGreaterThanOrEqual(2);
      expect(related!.problems.length, lab.id).toBeLessThanOrEqual(3);
      expect(new Set(related!.problems).size, lab.id).toBe(
        related!.problems.length,
      );
      for (const problemId of related!.problems) {
        expect(
          getProblemById(problemId),
          `${lab.id} -> ${problemId}`,
        ).not.toBeUndefined();
      }
    }
  });

  test("every related category slug resolves against the registry", () => {
    for (const lab of LABS) {
      const related = getLabRelated(lab.id)!;
      const slug = labCategorySlug(lab);
      expect(slug, lab.id).toBe(categorySlug(related.category));
      expect(
        CATEGORIES.some((category) => categorySlug(category.name) === slug),
        lab.id,
      ).toBe(true);
    }
  });

  test("meta descriptions stay within the 158-character limit", () => {
    for (const lab of LABS) {
      const description = labMetaDescription(lab);
      expect(description.length, lab.id).toBeGreaterThan(0);
      expect(description.length, lab.id).toBeLessThanOrEqual(158);
    }
  });
});
