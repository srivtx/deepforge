import type { Article } from "@/data/articles";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";

export interface HandsOnLink {
  href: string;
  label: string;
  title: string;
}

export function resolveHandsOnLinks(article: Article): HandsOnLink[] {
  const labById = new Map(LABS.map((lab) => [lab.id, lab]));
  const challengeById = new Map(
    RESEARCH_CHALLENGES.map((challenge) => [challenge.id, challenge]),
  );

  const labLinks = (article.relatedLabIds ?? []).flatMap((id) => {
    const lab = labById.get(id);
    return lab
      ? [{ href: `/labs/${lab.id}`, label: "Lab", title: lab.title }]
      : [];
  });

  const researchLinks = (article.relatedResearchIds ?? []).flatMap((id) => {
    const challenge = challengeById.get(id);
    return challenge
      ? [
          {
            href: `/research/${challenge.id}`,
            label: "Research",
            title: challenge.title,
          },
        ]
      : [];
  });

  return [...labLinks, ...researchLinks];
}
