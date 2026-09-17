import { describe, expect, test } from "bun:test";
import { generateStaticParams as problemPageParams } from "@/app/problems/[id]/page";
import { generateStaticParams as projectPageParams } from "@/app/projects/[id]/page";
import sitemap from "@/app/sitemap";
import { PROJECTS, PROJECT_STEPS } from "@/data/projects";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

describe("project detail routes", () => {
  test("every project id has a static page entry", () => {
    const pageIds = projectPageParams().map((entry) => entry.id);
    expect(pageIds.length).toBe(PROJECTS.length);
    expect(new Set(pageIds).size).toBe(pageIds.length);
    expect([...pageIds].sort()).toEqual(
      PROJECTS.map((project) => project.id).sort(),
    );
  });

  test("steps are ordered and unique", () => {
    for (const project of PROJECTS) {
      expect(project.steps.length, project.id).toBeGreaterThan(0);
      const ids = project.steps.map((step) => step.id);
      expect(new Set(ids).size, project.id).toBe(ids.length);
      for (let i = 1; i < ids.length; i++) {
        const previous = Number(ids[i - 1].replace("proj-", ""));
        const current = Number(ids[i].replace("proj-", ""));
        expect(current, `${project.id}: ${ids[i]}`).toBeGreaterThan(previous);
      }
    }
    const allIds = PROJECT_STEPS.map((step) => step.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  test("each step id resolves to a real problem in the bank", () => {
    const routable = new Set(problemPageParams().map((entry) => entry.id));
    for (const step of PROJECT_STEPS) {
      expect(routable.has(step.id), step.id).toBe(true);
      expect(step.title.trim().length, step.id).toBeGreaterThan(0);
      expect(step.solution.includes("def "), step.id).toBe(true);
      expect(step.testCases.length, step.id).toBeGreaterThanOrEqual(3);
    }
  });

  test("sitemap lists every project detail route", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    const details = entries.filter((entry) =>
      entry.url.startsWith(`${siteUrl}/projects/`),
    );
    expect(details.length).toBe(PROJECTS.length);
    for (const project of PROJECTS) {
      expect(urls.has(`${siteUrl}/projects/${project.id}`), project.id).toBe(
        true,
      );
    }
    for (const entry of details) {
      expect(entry.changeFrequency).toBe("monthly");
      expect(entry.priority).toBe(0.7);
    }
    for (const step of PROJECT_STEPS) {
      expect(urls.has(`${siteUrl}/problems/${step.id}`), step.id).toBe(true);
    }
  });
});
