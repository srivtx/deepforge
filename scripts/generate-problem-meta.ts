/**
 * Regenerate the light problem index from the full dataset.
 *
 *   bun run scripts/generate-problem-meta.ts
 *
 * Writes `src/data/problems/problem-meta.ts` with plain literals for
 * { id, title, category, difficulty } so list/browse/search/sitemap code can
 * import the index without pulling the ~5 MB payloads (description, starter
 * code, solution, test cases). Re-run after adding problems (NW-07).
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROBLEMS, CATEGORIES } from "../src/data/problems";
import type { Category, Difficulty } from "../src/types/problem";

const OUT = join(process.cwd(), "src", "data", "problems", "problem-meta.ts");

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const categoryNames = new Set<string>(CATEGORIES.map((c) => c.name));
const difficultyNames = new Set<string>(DIFFICULTIES);

const seenIds = new Set<string>();
for (const problem of PROBLEMS) {
  if (!categoryNames.has(problem.category)) {
    throw new Error(`unknown category "${problem.category}" on ${problem.id}`);
  }
  if (!difficultyNames.has(problem.difficulty)) {
    throw new Error(`unknown difficulty "${problem.difficulty}" on ${problem.id}`);
  }
  if (seenIds.has(problem.id)) {
    throw new Error(`duplicate id ${problem.id}`);
  }
  seenIds.add(problem.id);
}

const rows = PROBLEMS.map((problem) => {
  const id = JSON.stringify(problem.id);
  const title = JSON.stringify(problem.title);
  const category = JSON.stringify(problem.category);
  const difficulty = JSON.stringify(problem.difficulty);
  return `  problemMeta(${id}, ${title}, ${category}, ${difficulty}),`;
});

const source = `import type { Category, Difficulty } from "@/types/problem";
import { CATEGORIES } from "./categories";

export interface ProblemMeta {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
}

function problemMeta(
  id: string,
  title: string,
  category: Category,
  difficulty: Difficulty,
): ProblemMeta {
  return { id, title, category, difficulty };
}

export const PROBLEM_META: ProblemMeta[] = [
${rows.join("\n")}
];

export function getCategoryCounts(): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const category of CATEGORIES) counts[category.name] = 0;
  for (const problem of PROBLEM_META) counts[problem.category] += 1;
  return counts;
}
`;

writeFileSync(OUT, source);
console.log(
  `wrote ${OUT} — ${PROBLEMS.length} problems, ${CATEGORIES.length} categories`,
);
