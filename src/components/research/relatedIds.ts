import { getProblemById } from "@/data/problems";
import type { Problem } from "@/types/problem";

/**
 * Three practice problems per research challenge, chosen to rehearse the same
 * skill the challenge scores (scaling, the metric, the model form). Ids are
 * verified against the problem bank in tests/researchRoutes.test.ts.
 */
export const RESEARCH_RELATED_PROBLEMS: Record<string, readonly string[]> = {
  "tabular-classification-showdown": ["ml-023", "ml-083", "ca-186"],
  "nonlinear-regression-chase": ["ml-051", "ml-011", "ml-012"],
  "imbalanced-signal-hunt": ["st-021", "ml-015", "ml-239"],
  "noisy-sensor-denoising": ["ml-054", "ml-053", "st-030"],
  "mini-language-model": ["nlp-024", "nlp-025", "pr-037"],
};

export function getRelatedProblemIds(challengeId: string): readonly string[] {
  return RESEARCH_RELATED_PROBLEMS[challengeId] ?? [];
}

/** Related ids resolved to real problems; unknown ids are dropped. */
export function getRelatedProblems(challengeId: string): Problem[] {
  return getRelatedProblemIds(challengeId)
    .map((id) => getProblemById(id))
    .filter((problem): problem is Problem => Boolean(problem));
}
