/**
 * Derived per-stage checkpoints for the learning-path experience.
 *
 * Implements recommendation 1 / §5 of `docs/research/path-curation.md` the
 * cheap way: nothing is stored and no path file changes. For every stage we
 * derive a "boss set" (the stage's latest ids, preferring Medium/Hard), a
 * checkpoint is passed when at least two bosses are solved, and the stage
 * counts as complete when every problem is solved *or* the checkpoint is
 * passed — a soft gate that never hides later stages.
 *
 * We also derive a category-matched artefact (lab, project, or simulation)
 * for the stage, and validate the prerequisite graph so the content verifier
 * and the unit tests share one implementation.
 *
 * Pure module: no JSX, no window/localStorage, deterministic.
 */

import { LABS } from "@/data/labs";
import { PROJECTS, type Project } from "@/data/projects";
import type {
  Category,
  Difficulty,
  LearningPath,
  PathStage,
} from "@/types/problem";
import { slugify, type ProgressState } from "@/lib/paths";

export interface CheckpointProblem {
  id: string;
  category: Category;
  difficulty: Difficulty;
}

export interface CheckpointArtifact {
  kind: "lab" | "project" | "sim";
  id: string;
  title: string;
  href: string;
  difficulty?: Difficulty;
}

export interface StageCheckpoint {
  stageId: string;
  /** Up to three stage ids, in stage order. */
  bossIds: string[];
  artifact: CheckpointArtifact | null;
}

export interface CheckpointReport {
  checkpoint: StageCheckpoint | null;
  bossSolved: number;
  /** Boss solves needed to pass: min(2, bossIds.length). */
  required: number;
  passed: boolean;
  /** Every stage problem solved (the original completion rule). */
  allSolved: boolean;
  /** All problems solved or the checkpoint passed. */
  complete: boolean;
}

export const BOSS_COUNT = 3;
export const PASS_BOSSES = 2;

/**
 * Latest `BOSS_COUNT` ids of the stage, preferring Medium/Hard. If the stage
 * does not contain enough Medium/Hard problems, fill from the latest
 * remaining ids so a short or easy-only stage still gets a boss set.
 */
export function deriveBossIds(
  problemIds: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): string[] {
  const known: string[] = [];
  const seen = new Set<string>();
  for (const id of problemIds) {
    if (seen.has(id) || !problems.has(id)) continue;
    seen.add(id);
    known.push(id);
  }
  if (known.length === 0) return [];
  const chosen = new Set<string>();
  for (let i = known.length - 1; i >= 0 && chosen.size < BOSS_COUNT; i -= 1) {
    const difficulty = problems.get(known[i])?.difficulty;
    if (difficulty === "Medium" || difficulty === "Hard") chosen.add(known[i]);
  }
  for (let i = known.length - 1; i >= 0 && chosen.size < BOSS_COUNT; i -= 1) {
    chosen.add(known[i]);
  }
  return known.filter((id) => chosen.has(id));
}

const LAB_AFFINITY: Record<string, Category[]> = {
  "lab-01": ["ML Fundamentals", "Statistics"],
  "lab-02": ["NLP", "ML Fundamentals"],
  "lab-03": ["ML Fundamentals", "Statistics"],
  "lab-04": ["Optimization", "Calculus"],
  "lab-05": ["ML Fundamentals", "Statistics"],
  "lab-06": ["ML Fundamentals", "Statistics", "Probability"],
  "lab-07": ["ML Fundamentals", "Statistics"],
  "lab-08": ["Deep Learning", "ML Fundamentals"],
};

const LAB_CATEGORY_AFFINITY: Record<string, Category[]> = {
  Classification: ["ML Fundamentals", "Deep Learning"],
  Regression: ["ML Fundamentals", "Statistics"],
  Clustering: ["ML Fundamentals", "Statistics"],
  NLP: ["NLP", "ML Fundamentals"],
};

/**
 * Mirrors the sim tabs in `src/components/Sims.tsx` (that list is not
 * exported); the ids must stay in sync with the tab ids there.
 */
const SIM_AFFINITY: Record<string, { title: string; categories: Category[] }> = {
  "optimizer-race": {
    title: "Optimizer Race",
    categories: ["Optimization", "ML Fundamentals", "Calculus"],
  },
  "neural-net-trainer": {
    title: "Neural Net Trainer",
    categories: ["Deep Learning", "ML Fundamentals", "Optimization"],
  },
  dijkstra: {
    title: "Dijkstra Step-Through",
    categories: ["Graph Algorithms", "Algorithms", "Data Structures"],
  },
};

interface CatalogueEntry extends CheckpointArtifact {
  categories: Category[];
}

const KIND_ORDER: Record<CheckpointArtifact["kind"], number> = {
  lab: 0,
  project: 1,
  sim: 2,
};

/** Project categories ranked by how many of its steps use them. */
function projectAffinity(project: Project): Category[] {
  const counts = new Map<Category, number>();
  const order: Category[] = [];
  for (const step of project.steps) {
    if (!counts.has(step.category)) order.push(step.category);
    counts.set(step.category, (counts.get(step.category) ?? 0) + 1);
  }
  return order
    .slice()
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
}

const ARTIFACT_CATALOGUE: CatalogueEntry[] = [
  ...LABS.map((lab) => ({
    kind: "lab" as const,
    id: lab.id,
    title: lab.title,
    href: "/labs",
    difficulty: lab.difficulty,
    categories: LAB_AFFINITY[lab.id] ?? LAB_CATEGORY_AFFINITY[lab.category] ?? [],
  })),
  ...PROJECTS.map((project) => ({
    kind: "project" as const,
    id: project.id,
    title: project.title,
    href: "/projects",
    difficulty: project.difficulty,
    categories: projectAffinity(project),
  })),
  ...Object.entries(SIM_AFFINITY).map(([id, sim]) => ({
    kind: "sim" as const,
    id,
    title: sim.title,
    href: "/sims",
    categories: sim.categories,
  })),
];

function stageCategoryRanks(
  problemIds: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): Category[] {
  const counts = new Map<Category, number>();
  const order: Category[] = [];
  for (const id of problemIds) {
    const problem = problems.get(id);
    if (!problem) continue;
    if (!counts.has(problem.category)) order.push(problem.category);
    counts.set(problem.category, (counts.get(problem.category) ?? 0) + 1);
  }
  return order
    .slice()
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
}

function compareScores(a: number[], b: number[]): number {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Best category match for the stage. Candidates are scored by (rank of the
 * matched stage category, position in the artefact's own affinity list, kind
 * priority lab > project > sim, catalogue order) and the lowest score wins.
 * Returns null when the stage's categories match no artefact.
 */
export function recommendArtifact(
  problemIds: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): CheckpointArtifact | null {
  const ranked = stageCategoryRanks(problemIds, problems);
  if (ranked.length === 0) return null;
  const rankOf = new Map(ranked.map((category, index) => [category, index]));

  let best: CheckpointArtifact | null = null;
  let bestScore: number[] | null = null;
  ARTIFACT_CATALOGUE.forEach((artifact, index) => {
    artifact.categories.forEach((category, affinityIndex) => {
      const rank = rankOf.get(category);
      if (rank === undefined) return;
      const score = [rank, affinityIndex, KIND_ORDER[artifact.kind], index];
      if (!bestScore || compareScores(score, bestScore) < 0) {
        best = artifact;
        bestScore = score;
      }
    });
  });
  return best;
}

export function deriveStageCheckpoint(
  stage: Pick<PathStage, "id" | "problemIds">,
  problems: ReadonlyMap<string, CheckpointProblem>,
): StageCheckpoint | null {
  if (stage.problemIds.length === 0) return null;
  const bossIds = deriveBossIds(stage.problemIds, problems);
  if (bossIds.length === 0) return null;
  return {
    stageId: stage.id,
    bossIds,
    artifact: recommendArtifact(stage.problemIds, problems),
  };
}

export function evaluateStageCheckpoint(
  stage: Pick<PathStage, "id" | "problemIds">,
  problems: ReadonlyMap<string, CheckpointProblem>,
  progress: ProgressState,
): CheckpointReport {
  const checkpoint = deriveStageCheckpoint(stage, problems);
  let bossSolved = 0;
  if (checkpoint) {
    for (const id of checkpoint.bossIds) {
      if (progress[id]?.solved) bossSolved += 1;
    }
  }
  const required = checkpoint ? Math.min(PASS_BOSSES, checkpoint.bossIds.length) : 0;
  const passed = checkpoint !== null && bossSolved >= required;
  const allSolved =
    stage.problemIds.length > 0 &&
    stage.problemIds.every((id) => Boolean(progress[id]?.solved));
  return {
    checkpoint,
    bossSolved,
    required,
    passed,
    allSolved,
    complete: allSolved || passed,
  };
}

export interface PrerequisiteIssue {
  pathId: string;
  slug: string;
  kind: "unknown" | "self" | "cycle";
  prerequisite: string;
  message: string;
}

function slugFor(path: LearningPath): string {
  const explicit = typeof path.slug === "string" ? path.slug.trim() : "";
  return explicit || slugify(path.title);
}

/**
 * Content-verifier checks for the prerequisite graph: every prerequisite
 * must resolve to a path (by slug or id), must not reference its own path,
 * and the graph must be acyclic. Each issue carries the offending path's id
 * and slug.
 */
export function validatePrerequisites(
  paths: readonly LearningPath[],
): PrerequisiteIssue[] {
  const issues: PrerequisiteIssue[] = [];
  const slugs = paths.map((path) => slugFor(path));
  const bySlug = new Map<string, number>();
  const byId = new Map<string, number>();
  paths.forEach((path, index) => {
    if (!bySlug.has(slugs[index])) bySlug.set(slugs[index], index);
    if (path.id && !byId.has(path.id)) byId.set(path.id, index);
  });

  const edges: number[][] = paths.map(() => []);
  paths.forEach((path, index) => {
    const slug = slugs[index];
    for (const raw of path.prerequisites ?? []) {
      if (typeof raw !== "string") continue;
      const prerequisite = raw.trim();
      if (!prerequisite) continue;
      if (prerequisite === slug || prerequisite === path.id) {
        issues.push({
          pathId: path.id,
          slug,
          kind: "self",
          prerequisite,
          message: `${path.id} (slug ${slug}): prerequisite references itself (${prerequisite})`,
        });
        continue;
      }
      const target = bySlug.get(prerequisite) ?? byId.get(prerequisite);
      if (target === undefined) {
        issues.push({
          pathId: path.id,
          slug,
          kind: "unknown",
          prerequisite,
          message: `${path.id} (slug ${slug}): unknown prerequisite ${JSON.stringify(prerequisite)}`,
        });
        continue;
      }
      edges[index].push(target);
    }
  });

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Array<number>(paths.length).fill(WHITE);
  const stack: number[] = [];
  const seenCycles = new Set<string>();

  const visit = (index: number): void => {
    color[index] = GRAY;
    stack.push(index);
    for (const target of edges[index]) {
      if (color[target] === GRAY) {
        const cycle = stack.slice(stack.indexOf(target));
        const members = cycle.map((member) => slugs[member]);
        const key = members.slice().sort().join("|");
        if (!seenCycles.has(key)) {
          seenCycles.add(key);
          const chain = [...members, members[0]].join(" -> ");
          const head = cycle[0];
          issues.push({
            pathId: paths[head].id,
            slug: slugs[head],
            kind: "cycle",
            prerequisite: slugs[target],
            message: `${paths[head].id} (slug ${slugs[head]}): prerequisite cycle ${chain}`,
          });
        }
      } else if (color[target] === WHITE) {
        visit(target);
      }
    }
    stack.pop();
    color[index] = BLACK;
  };

  paths.forEach((_, index) => {
    if (color[index] === WHITE) visit(index);
  });

  return issues;
}
