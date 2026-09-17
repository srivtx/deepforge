import { describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { LAB_TRAILS } from "@/data/labTrails";

const DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2 } as const;

describe("lab trails", () => {
  test("trail ids are unique", () => {
    const ids = LAB_TRAILS.map((trail) => trail.id);
    expect(new Set(ids).size).toBe(LAB_TRAILS.length);
    expect(LAB_TRAILS.length).toBeGreaterThan(0);
  });

  test("every trail is non-empty and has no duplicate lab ids", () => {
    for (const trail of LAB_TRAILS) {
      expect(trail.id.trim().length, trail.id).toBeGreaterThan(0);
      expect(trail.title.trim().length, trail.id).toBeGreaterThan(0);
      expect(trail.blurb.trim().length, trail.id).toBeGreaterThan(0);
      expect(trail.why.trim().length, trail.id).toBeGreaterThan(0);
      expect(trail.labIds.length, trail.id).toBeGreaterThan(0);
      expect(new Set(trail.labIds).size, trail.id).toBe(trail.labIds.length);
    }
  });

  test("every lab id in a trail exists in LABS", () => {
    const known = new Set(LABS.map((lab) => lab.id));
    for (const trail of LAB_TRAILS) {
      for (const id of trail.labIds) {
        expect(known.has(id), `${trail.id}: ${id}`).toBe(true);
      }
    }
  });

  test("every lab appears in at least one trail", () => {
    const covered = new Set(LAB_TRAILS.flatMap((trail) => trail.labIds));
    for (const lab of LABS) {
      expect(covered.has(lab.id), lab.id).toBe(true);
    }
  });

  test("labs within a trail are ordered easier to harder", () => {
    const byId = new Map(LABS.map((lab) => [lab.id, lab]));
    for (const trail of LAB_TRAILS) {
      const ranks = trail.labIds.map((id) => {
        const lab = byId.get(id);
        if (!lab) throw new Error(`${trail.id}: unknown lab ${id}`);
        return DIFFICULTY_RANK[lab.difficulty];
      });
      for (let i = 1; i < ranks.length; i += 1) {
        expect(ranks[i], `${trail.id}: ${trail.labIds[i]}`).toBeGreaterThanOrEqual(
          ranks[i - 1],
        );
      }
    }
  });
});
