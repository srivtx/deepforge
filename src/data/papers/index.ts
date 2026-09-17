/**
 * The "Understanding Papers" registry: merges the four era files in reading
 * order (founding → efficiency → reasoning → frontier), sorts each era by
 * publication date, and exposes the lookups the routes and tests share.
 *
 * Content files are filled by separate authors; every helper here works on an
 * empty list, so the app and its test suite stay green while content lands.
 */

import { EFFICIENCY_PAPERS } from "./efficiency";
import { FOUNDING_PAPERS } from "./founding";
import { FRONTIER_PAPERS } from "./frontier";
import { REASONING_PAPERS } from "./reasoning";
import type { Paper, PaperEra } from "./types";

export interface PaperEraMeta {
  id: PaperEra;
  label: string;
  blurb: string;
}

/** Eras in reading order; the index and the paper pages render in this order. */
export const PAPER_ERAS: PaperEraMeta[] = [
  {
    id: "founding",
    label: "Founding",
    blurb:
      "The first DeepSeek LLMs, code, and math models: dense, scale-first, and already competitive.",
  },
  {
    id: "efficiency",
    label: "Efficiency",
    blurb:
      "Mixture-of-experts routing, latent attention, and low-precision training: frontier quality at a fraction of the cost.",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    blurb:
      "Reinforcement learning with verifiable rewards: models taught to think before they answer.",
  },
  {
    id: "frontier",
    label: "Frontier",
    blurb:
      "Sparse attention, multimodal decoupling, and hybrid thinking at the current edge of the series.",
  },
];

export const ERA_LABELS: Record<PaperEra, string> = {
  founding: "Founding",
  efficiency: "Efficiency",
  reasoning: "Reasoning",
  frontier: "Frontier",
};

const ERA_SOURCES: Record<PaperEra, Paper[]> = {
  founding: FOUNDING_PAPERS,
  efficiency: EFFICIENCY_PAPERS,
  reasoning: REASONING_PAPERS,
  frontier: FRONTIER_PAPERS,
};

/** Chronological within an era, with a stable id tiebreak for equal dates. */
function compareWithinEra(a: Paper, b: Paper): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/** Every paper in global reading order. */
export const PAPERS: Paper[] = PAPER_ERAS.flatMap((era) =>
  [...ERA_SOURCES[era.id]].sort(compareWithinEra),
);

const PAPER_BY_SLUG = new Map(PAPERS.map((paper) => [paper.slug, paper]));

const PAPER_BY_ID = new Map(PAPERS.map((paper) => [paper.id, paper]));

export function getPaper(slug: string): Paper | undefined {
  return PAPER_BY_SLUG.get(slug);
}

export function getPaperById(id: string): Paper | undefined {
  return PAPER_BY_ID.get(id);
}

export interface PaperEraGroup {
  era: PaperEraMeta;
  papers: Paper[];
}

/** Era sections in reading order; an era with no papers still yields a group. */
export function papersByEra(): PaperEraGroup[] {
  return PAPER_ERAS.map((era) => ({
    era,
    papers: PAPERS.filter((paper) => paper.era === era.id),
  }));
}

/** Previous and next paper in the global order; both null for unknown ids. */
export function paperNeighbours(id: string): {
  prev: Paper | null;
  next: Paper | null;
} {
  const index = PAPERS.findIndex((paper) => paper.id === id);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: PAPERS[index - 1] ?? null,
    next: PAPERS[index + 1] ?? null,
  };
}

export interface PaperAnswer {
  correct: boolean;
  at: string;
}

export type PaperAnswerMap = Record<string, PaperAnswer>;

export interface PaperProgress {
  answered: number;
  correct: number;
  total: number;
  /** Complete means every question has an answer; a paper with none is not. */
  done: boolean;
}

/** Question progress for one paper against the persisted answer map. */
export function paperProgress(
  paper: Pick<Paper, "questions">,
  answers: PaperAnswerMap,
): PaperProgress {
  const total = paper.questions.length;
  let answered = 0;
  let correct = 0;
  for (const question of paper.questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    answered += 1;
    if (answer.correct) correct += 1;
  }
  return { answered, correct, total, done: total > 0 && answered >= total };
}
