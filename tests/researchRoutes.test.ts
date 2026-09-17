import { describe, expect, test } from "bun:test";
import {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "@/app/research/[id]/page";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getProblemById } from "@/data/problems";
import {
  RESEARCH_RELATED_PROBLEMS,
  getRelatedProblemIds,
} from "@/components/research/relatedIds";

describe("research detail routes", () => {
  test("every challenge id has exactly one static page entry", () => {
    const ids = generateStaticParams().map((entry) => entry.id);
    expect(ids.length).toBe(RESEARCH_CHALLENGES.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(
      RESEARCH_CHALLENGES.map((challenge) => challenge.id).sort(),
    );
    expect(dynamicParams).toBe(false);
  });

  test("every related-practice id resolves to a real problem", () => {
    const challengeIds = new Set(
      RESEARCH_CHALLENGES.map((challenge) => challenge.id),
    );

    for (const challenge of RESEARCH_CHALLENGES) {
      const related = getRelatedProblemIds(challenge.id);
      expect(related.length, challenge.id).toBeGreaterThanOrEqual(3);
      expect(new Set(related).size, challenge.id).toBe(related.length);
      for (const id of related) {
        const problem = getProblemById(id);
        expect(Boolean(problem), `${challenge.id} -> ${id}`).toBe(true);
        expect(problem?.title.trim().length ?? 0, id).toBeGreaterThan(0);
      }
    }

    for (const [challengeId, related] of Object.entries(
      RESEARCH_RELATED_PROBLEMS,
    )) {
      expect(challengeIds.has(challengeId), challengeId).toBe(true);
      for (const id of related) {
        expect(Boolean(getProblemById(id)), `${challengeId} -> ${id}`).toBe(
          true,
        );
      }
    }
  });

  test("metadata stays inside the SERP budget and points at the OG card", async () => {
    for (const challenge of RESEARCH_CHALLENGES) {
      const meta = await generateMetadata({
        params: Promise.resolve({ id: challenge.id }),
      });
      expect(meta.title).toBe(`${challenge.title} — Research`);
      expect(meta.alternates?.canonical).toBe(`/research/${challenge.id}`);

      const description = typeof meta.description === "string" ? meta.description : "";
      expect(description.length, challenge.id).toBeGreaterThan(0);
      expect(description.length, challenge.id).toBeLessThanOrEqual(158);

      const images = meta.openGraph?.images as unknown as
        | { url?: string }[]
        | undefined;
      const url = images?.[0]?.url ?? "";
      expect(url.includes("/og?"), challenge.id).toBe(true);
      expect(url.includes("kind=research"), challenge.id).toBe(true);
      expect(url.includes("difficulty="), challenge.id).toBe(true);
    }
  });
});
