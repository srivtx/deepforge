import type { Problem, Category } from "@/types/problem";

import { linearAlgebraProblems } from "./linear-algebra";
import { calculusProblems } from "./calculus";
import { statisticsProblems } from "./statistics";
import { probabilityProblems } from "./probability";
import { mlFundamentalsProblems } from "./ml-fundamentals";
import { deepLearningProblems } from "./deep-learning";
import { nlpProblems } from "./nlp";
import { optimizationProblems } from "./optimization";
import { algorithmsProblems } from "./algorithms";
import { dataStructuresProblems } from "./data-structures";
import { computerVisionProblems } from "./computer-vision";
import { reinforcementLearningProblems } from "./reinforcement-learning";
import { timeSeriesProblems } from "./time-series";
import { graphAlgorithmsProblems } from "./graph-algorithms";
import { informationTheoryProblems } from "./information-theory";

import { CATEGORIES } from "./categories";

export { CATEGORIES } from "./categories";
export { LEARNING_PATHS } from "./paths";

export const PROBLEMS: Problem[] = [
  ...linearAlgebraProblems,
  ...calculusProblems,
  ...statisticsProblems,
  ...probabilityProblems,
  ...mlFundamentalsProblems,
  ...deepLearningProblems,
  ...nlpProblems,
  ...optimizationProblems,
  ...algorithmsProblems,
  ...dataStructuresProblems,
  ...computerVisionProblems,
  ...reinforcementLearningProblems,
  ...timeSeriesProblems,
  ...informationTheoryProblems,
  ...graphAlgorithmsProblems,
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export function getProblemsByCategory(cat: Category): Problem[] {
  return PROBLEMS.filter((p) => p.category === cat);
}

export function getCategoryCounts(): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const c of CATEGORIES) counts[c.name] = 0;
  for (const p of PROBLEMS) counts[p.category] += 1;
  return counts;
}
