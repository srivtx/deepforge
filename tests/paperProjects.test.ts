import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PaperProjectSection } from "@/components/papers/PaperProjectSection";
import { PaperProjectsBand } from "@/components/papers/PaperProjectsBand";
import {
  PROJECT_DIFFICULTIES,
  validatePaperProject,
  type ProjectRegistry,
} from "@/components/papers/projectCheck";
import { LABS } from "@/data/labs";
import { PAPERS } from "@/data/papers";
import type { PaperProject } from "@/data/papers/types";
import { PROBLEM_META } from "@/data/problems/problem-meta";

/**
 * Content agents fill `Paper.project` in parallel, so every assertion here
 * skips papers without a project and only checks the ones that are present.
 * That keeps the suite green whether zero projects or all 35 have landed.
 */

const REGISTRY: ProjectRegistry = {
  labIds: new Set(LABS.map((lab) => lab.id)),
  problemIds: new Set(PROBLEM_META.map((problem) => problem.id)),
};

function presentProjects(): { id: string; project: PaperProject }[] {
  return PAPERS.flatMap((paper) =>
    paper.project ? [{ id: paper.id, project: paper.project }] : [],
  );
}

describe("paper projects", () => {
  test("every present project passes the shape validator", () => {
    for (const { id, project } of presentProjects()) {
      expect(validatePaperProject(project, REGISTRY), id).toEqual([]);
    }
  });

  test("present projects meet the minimum build shape", () => {
    for (const { id, project } of presentProjects()) {
      expect(project.title.trim().length, id).toBeGreaterThan(0);
      expect(project.pitch.trim().length, id).toBeGreaterThan(0);
      expect(project.timeEstimate.trim().length, id).toBeGreaterThan(0);
      expect(PROJECT_DIFFICULTIES, id).toContain(project.difficulty);
      expect(project.milestones.length, id).toBeGreaterThanOrEqual(4);
      for (const milestone of project.milestones) {
        expect(milestone.trim().length, id).toBeGreaterThan(0);
      }
      expect(project.starterCode.trim().length, id).toBeGreaterThan(0);
      expect(
        project.starterCode.includes("def ") ||
          project.starterCode.includes("TODO"),
        id,
      ).toBe(true);
      expect(project.successCriteria.length, id).toBeGreaterThanOrEqual(2);
      for (const criterion of project.successCriteria) {
        expect(criterion.trim().length, id).toBeGreaterThan(0);
      }
    }
  });

  test("related ids resolve against the real labs and problem bank", () => {
    for (const { id, project } of presentProjects()) {
      for (const labId of project.relatedLabIds ?? []) {
        expect(REGISTRY.labIds.has(labId), `${id} -> lab ${labId}`).toBe(true);
      }
      for (const problemId of project.relatedProblemIds ?? []) {
        expect(REGISTRY.problemIds.has(problemId), `${id} -> problem ${problemId}`).toBe(
          true,
        );
      }
    }
  });

  test("the validator reports malformed projects instead of passing them", () => {
    const broken: PaperProject = {
      title: "",
      pitch: "",
      difficulty: "impossible" as PaperProject["difficulty"],
      timeEstimate: "",
      milestones: ["only one"],
      starterCode: "print('no scaffolding')",
      successCriteria: [],
      stretch: ["  "],
      relatedLabIds: ["definitely-not-a-lab"],
      relatedProblemIds: ["definitely-not-a-problem"],
    };

    const errors = validatePaperProject(broken, REGISTRY);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.includes("difficulty"))).toBe(true);
    expect(errors.some((error) => error.includes("milestones"))).toBe(true);
    expect(errors.some((error) => error.includes("starterCode"))).toBe(true);
    expect(errors.some((error) => error.includes("success criteria"))).toBe(
      true,
    );
    expect(errors.some((error) => error.includes("stretch goal"))).toBe(true);
    expect(errors.some((error) => error.includes("definitely-not-a-lab"))).toBe(
      true,
    );
    expect(
      errors.some((error) => error.includes("definitely-not-a-problem")),
    ).toBe(true);
  });

  test("a minimal well-formed project passes, including without related ids", () => {
    const good: PaperProject = {
      title: "Tiny toy",
      pitch: "Build the smallest working version.",
      difficulty: "starter",
      timeEstimate: "1-2 hours",
      milestones: ["step one", "step two", "step three", "step four"],
      starterCode: "def main():\n    # TODO: finish\n    pass",
      successCriteria: ["it runs", "it prints a result"],
      stretch: [],
    };
    expect(validatePaperProject(good, REGISTRY)).toEqual([]);
  });
});

describe("paper project rendering", () => {
  const fixture: PaperProject = {
    title: "Tiny attention",
    pitch: "Implement single-head attention end to end.",
    difficulty: "intermediate",
    timeEstimate: "3-5 hours",
    milestones: [
      "Scale the queries and keys",
      "Apply the softmax mask",
      "Multiply into the values",
      "Check the output shape",
    ],
    starterCode: "def attention(q, k, v):\n    # TODO: implement\n    pass",
    successCriteria: ["shape is (seq, d_v)", "softmax rows sum to one"],
    stretch: ["Add multi-head splitting"],
    relatedLabIds: [LABS[0].id, "definitely-not-a-lab"],
    relatedProblemIds: [PROBLEM_META[0].id, "definitely-not-a-problem"],
  };

  test("the section renders milestones, starter code, criteria, and links", () => {
    const markup = renderToStaticMarkup(
      createElement(PaperProjectSection, { project: fixture }),
    );

    expect(markup).toContain("Tiny attention");
    expect(markup).toContain("Intermediate");
    expect(markup).toContain("3-5 hours");
    expect(markup).toContain("Milestones");
    expect(markup).toContain("Starter code");
    expect(markup).toContain("TODO");
    expect(markup).toContain("Success criteria");
    expect(markup).toContain("Stretch goals");
    expect(markup).toContain(`/labs/${LABS[0].id}`);
    expect(markup).toContain(`/problems/${PROBLEM_META[0].id}`);
    expect(markup).not.toContain("definitely-not-a-lab");
    expect(markup).not.toContain("definitely-not-a-problem");
  });

  test("the band stays silent without projects and links every project with some", () => {
    const builds = presentProjects();
    const markup = renderToStaticMarkup(createElement(PaperProjectsBand));

    if (builds.length === 0) {
      expect(markup).toBe("");
      return;
    }

    expect(markup).toContain("From the papers");
    const slugs = new Set(
      PAPERS.filter((paper) => paper.project).map((paper) => paper.slug),
    );
    for (const slug of slugs) {
      expect(markup, slug).toContain(`/papers/${slug}#project`);
    }
  });
});
