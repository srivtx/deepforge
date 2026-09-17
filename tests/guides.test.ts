import { describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { LAB_THEORY, getLabTheory } from "@/data/labTheory";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { RESEARCH_THEORY, getResearchTheory } from "@/data/researchTheory";

const MIN_BODY_LENGTH = 80;

describe("research theory", () => {
  test("covers every challenge exactly once", () => {
    const challengeIds = new Set(RESEARCH_CHALLENGES.map((item) => item.id));
    const theoryIds = RESEARCH_THEORY.map((item) => item.id);
    expect(new Set(theoryIds).size).toBe(theoryIds.length);
    for (const challenge of RESEARCH_CHALLENGES) {
      expect(
        getResearchTheory(challenge.id) === undefined,
        challenge.id,
      ).toBe(false);
    }
    for (const id of theoryIds) {
      expect(challengeIds.has(id), `unknown id ${id}`).toBe(true);
    }
  });

  test("every entry carries substantive, uniquely headed sections", () => {
    for (const entry of RESEARCH_THEORY) {
      expect(entry.premise.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.takeaway.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.sections.length, entry.id).toBeGreaterThanOrEqual(3);
      expect(entry.sections.length, entry.id).toBeLessThanOrEqual(4);

      const headings = entry.sections.map((section) =>
        section.heading.trim().toLowerCase(),
      );
      expect(new Set(headings).size, entry.id).toBe(headings.length);
      for (const section of entry.sections) {
        expect(section.heading.trim().length, entry.id).toBeGreaterThan(0);
        expect(
          section.body.trim().length,
          `${entry.id}: ${section.heading}`,
        ).toBeGreaterThan(MIN_BODY_LENGTH);
      }

      expect(entry.pitfalls.length, entry.id).toBeGreaterThanOrEqual(2);
      expect(entry.pitfalls.length, entry.id).toBeLessThanOrEqual(4);
      for (const pitfall of entry.pitfalls) {
        expect(pitfall.trim().length, entry.id).toBeGreaterThan(0);
      }
    }
  });

  test("unknown ids resolve to undefined", () => {
    expect(getResearchTheory("not-a-challenge")).toBeUndefined();
  });
});

describe("lab theory", () => {
  test("covers every lab exactly once", () => {
    const labIds = new Set(LABS.map((item) => item.id));
    const theoryIds = LAB_THEORY.map((item) => item.id);
    expect(new Set(theoryIds).size).toBe(theoryIds.length);
    for (const lab of LABS) {
      expect(getLabTheory(lab.id) === undefined, lab.id).toBe(false);
    }
    for (const id of theoryIds) {
      expect(labIds.has(id), `unknown id ${id}`).toBe(true);
    }
  });

  test("every entry carries substantive, uniquely headed sections", () => {
    for (const entry of LAB_THEORY) {
      expect(entry.teaches.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.sections.length, entry.id).toBeGreaterThanOrEqual(3);
      expect(entry.sections.length, entry.id).toBeLessThanOrEqual(4);

      const headings = entry.sections.map((section) =>
        section.heading.trim().toLowerCase(),
      );
      expect(new Set(headings).size, entry.id).toBe(headings.length);
      for (const section of entry.sections) {
        expect(section.heading.trim().length, entry.id).toBeGreaterThan(0);
        expect(
          section.body.trim().length,
          `${entry.id}: ${section.heading}`,
        ).toBeGreaterThan(MIN_BODY_LENGTH);
      }

      expect(entry.pitfalls.length, entry.id).toBeGreaterThanOrEqual(2);
      expect(entry.pitfalls.length, entry.id).toBeLessThanOrEqual(4);
      for (const pitfall of entry.pitfalls) {
        expect(pitfall.trim().length, entry.id).toBeGreaterThan(0);
      }
    }
  });

  test("unknown ids resolve to undefined", () => {
    expect(getLabTheory("lab-99")).toBeUndefined();
  });
});
