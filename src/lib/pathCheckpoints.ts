/**
 * Derived per-stage checkpoints for the learning-path experience.
 *
 * Implements recommendation 1 / §5 of `docs/research/path-curation.md` the
 * cheap way: no path file changes. For every stage we derive an adaptive
 * "boss set" (feature F6): the selection folds in one due-review problem when
 * the stage has one, weights toward the difficulty tier with more failures and
 * lapses, swaps in replacements for problems missed on the previous recorded
 * attempt, and guarantees category coverage — all deterministically, so the
 * same state always yields the same set. A checkpoint passes when at least two
 * bosses are solved, and the stage counts as complete when every problem is
 * solved *or* the checkpoint is passed — a soft gate that never hides later
 * stages.
 *
 * We also derive a category-matched artefact (lab, project, or simulation)
 * for the stage, and validate the prerequisite graph so the content verifier
 * and the unit tests share one implementation.
 *
 * Pure core: selection and evaluation take every piece of state as an
 * argument and are deterministic. The only side effect lives in the tiny
 * local-only attempt store at the bottom (through the sync adapter's guarded
 * `readRaw`/`writeRaw`), which records failures so a retry can swap in fresh
 * boss ids.
 */

import { LABS } from "@/data/labs";
import { PROJECTS, type Project } from "@/data/projects";
import type {
  Category,
  Difficulty,
  LearningPath,
  PathStage,
} from "@/types/problem";
import { getDailyDateKey } from "@/lib/daily";
import { slugify } from "@/lib/paths";
import type { ReviewMap } from "@/lib/reviewQueue";
import { readRaw, writeRaw } from "@/lib/sync/localAdapter";

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

/** Why a problem was chosen for the boss set. */
export type BossReason =
  | "due-review"
  | "replacement"
  | "weak-tier"
  | "coverage"
  | "baseline";

export interface BossSelection {
  stageId: string;
  /** Up to three stage ids, in stage order. */
  bossIds: string[];
  /** Per-boss reason, keyed by problem id. */
  reasons: Record<string, BossReason>;
  /** Stage ids due for review today, in preference order. */
  dueIds: string[];
  /** Previous-attempt misses swapped out of this set (still unsolved). */
  replacedIds: string[];
  /** Failure weight per difficulty tier used for ranking. */
  difficultyWeights: Record<Difficulty, number>;
}

export interface StageCheckpoint {
  stageId: string;
  /** Up to three stage ids, in stage order. */
  bossIds: string[];
  artifact: CheckpointArtifact | null;
  selection: BossSelection;
}

/** Plain-language review pointer — never a solution or code fragment. */
export interface CheckpointRevisit {
  stageId: string;
  missedIds: string[];
  /** Most common category among the missed problems, when resolvable. */
  category: Category | null;
  /** One-sentence study hint for that category. */
  hint: string;
  /** First missed id, for the one-click review link. */
  firstProblemId: string | null;
}

export type CheckpointOutcome = "passed-clean" | "passed" | "failed" | null;

export type CheckpointNextAction = "advance" | "retry" | "review";

export interface CheckpointAttempt {
  /** Total recorded attempts for this stage. */
  attempts: number;
  /** Boss ids served by the most recent recorded attempt. */
  bossIds: string[];
  /** Boss ids still unsolved when that attempt was recorded. */
  missedIds: string[];
  /** ISO timestamp of the most recent record. */
  at: string;
}

export type CheckpointAttemptMap = Record<string, CheckpointAttempt>;

/**
 * Progress shape the checkpoint logic needs. `ProgressMap` from
 * `src/lib/progress.ts` satisfies it structurally; tests may pass partial
 * records. The extra fields stay optional so the module never has to know
 * where progress came from.
 */
export interface CheckpointProgressRecord {
  solved?: boolean;
  attempted?: boolean;
  solvedAt?: string | null;
}

export type CheckpointProgress = Record<
  string,
  CheckpointProgressRecord | undefined
>;

/** State the adaptive selection reads. All optional: no state, no adaptation. */
export interface CheckpointOptions {
  /** Path id — keys the local attempt records. */
  pathId?: string;
  progress?: CheckpointProgress;
  reviews?: ReviewMap;
  attempts?: CheckpointAttemptMap;
  /** Direct attempt override for a single stage (tests, focused callers). */
  attempt?: CheckpointAttempt | null;
  now?: Date;
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
  /** Current standing: clean pass, pass, recorded failure, or no attempt. */
  outcome: CheckpointOutcome;
  /** What the learner should do next: advance, retry the set, or keep reviewing. */
  nextAction: CheckpointNextAction;
  /** Recorded attempts for the stage (0 when nothing was recorded). */
  attemptCount: number;
  /** Misses from the most recent attempt that are still unsolved. */
  revisit: CheckpointRevisit | null;
  /** Stage ids that are due for review and landed in the boss set. */
  dueReviewIds: string[];
}

export const BOSS_COUNT = 3;
export const PASS_BOSSES = 2;

/** Stage ids that resolve to a known problem, deduped, in stage order. */
function stageProblemIds(
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
  return known;
}

/**
 * Baseline boss set (the original behavior): the latest `BOSS_COUNT` ids of
 * the stage, preferring Medium/Hard. If the stage does not contain enough
 * Medium/Hard problems, fill from the latest remaining ids so a short or
 * easy-only stage still gets a boss set. `selectBossSet` reduces to this when
 * there is no review, failure, or attempt state to adapt to.
 */
export function deriveBossIds(
  problemIds: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): string[] {
  const known = stageProblemIds(problemIds, problems);
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

/* ──────────────────────── adaptive boss selection ──────────────────────── */

/**
 * Baseline preference order, best first: latest Medium/Hard in stage order,
 * then the latest remaining ids. `deriveBossIds` returns the first three of
 * this ranking, so adaptation can re-rank without changing the no-signal case.
 */
function baselineRanking(
  known: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): string[] {
  const ranked: string[] = [];
  for (let i = known.length - 1; i >= 0; i -= 1) {
    const difficulty = problems.get(known[i])?.difficulty;
    if (difficulty === "Medium" || difficulty === "Hard") ranked.push(known[i]);
  }
  for (let i = known.length - 1; i >= 0; i -= 1) {
    if (!ranked.includes(known[i])) ranked.push(known[i]);
  }
  return ranked;
}

/**
 * True when a problem counts as solved *for the checkpoint*. A problem that
 * the review queue has due only counts once it was re-solved on or after its
 * due date, so including a due item never hands out a free pass point.
 */
export function isCheckpointSolved(
  id: string,
  progress: CheckpointProgress | undefined,
  reviews: ReviewMap | undefined,
  todayKey: string,
): boolean {
  const record = progress?.[id];
  if (!record?.solved) return false;
  const review = reviews?.[id];
  if (!review || review.due > todayKey) return true;
  if (!record.solvedAt) return true;
  const solved = new Date(record.solvedAt);
  if (Number.isNaN(solved.getTime())) return true;
  return getDailyDateKey(solved) >= review.due;
}

function individualFailures(
  id: string,
  progress: CheckpointProgress | undefined,
  reviews: ReviewMap | undefined,
): number {
  const lapses = reviews?.[id]?.lapses ?? 0;
  const record = progress?.[id];
  const stuck = record?.attempted && !record.solved ? 1 : 0;
  return lapses + stuck;
}

/**
 * Failure weight per difficulty, from review lapses (the strongest signal),
 * attempted-but-unsolved work in the stage, and problems missed on the last
 * recorded attempt that are still open (worth double, so a retry set presses
 * on the tier that actually failed).
 */
function difficultyFailureWeights(
  known: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
  progress: CheckpointProgress | undefined,
  reviews: ReviewMap | undefined,
  attempt: CheckpointAttempt | null,
  todayKey: string,
): Record<Difficulty, number> {
  const weights: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const id of known) {
    const problem = problems.get(id);
    if (!problem) continue;
    weights[problem.difficulty] += individualFailures(id, progress, reviews);
  }
  for (const id of attempt?.missedIds ?? []) {
    const problem = problems.get(id);
    if (!problem) continue;
    if (isCheckpointSolved(id, progress, reviews, todayKey)) continue;
    weights[problem.difficulty] += 2;
  }
  return weights;
}

/** Stable key for one stage's attempt record (stage ids repeat across paths). */
export function checkpointAttemptKey(pathId: string, stageId: string): string {
  return `${pathId}::${stageId}`;
}

function attemptFor(
  stageId: string,
  options: CheckpointOptions,
): CheckpointAttempt | null {
  if (options.attempt !== undefined) return options.attempt;
  if (options.attempts && options.pathId) {
    return (
      options.attempts[checkpointAttemptKey(options.pathId, stageId)] ?? null
    );
  }
  return null;
}

/**
 * Adaptive boss set. Deterministic for a fixed (stage, problems, progress,
 * reviews, attempt, now). Order of preference:
 *
 *   1. one due-review problem from the stage, when the queue has one;
 *   2. category coverage — a distinct stage category per remaining slot while
 *      slots allow, so a checkpoint can never be three near-identical items;
 *   3. the failure-weighted ranking (weak difficulty tiers first, then
 *      individual lapses/stuck history, then the baseline order);
 *   4. the previous attempt's still-unsolved misses fall back in only when
 *      the stage has no alternatives, so a retry set is never empty.
 *
 * Ids from the previous attempt that are still unsolved are swapped out for
 * replacements (and surfaced as the revisit list); solving them later makes
 * them eligible again.
 */
export function selectBossSet(
  stage: Pick<PathStage, "id" | "problemIds">,
  problems: ReadonlyMap<string, CheckpointProblem>,
  options: CheckpointOptions = {},
): BossSelection | null {
  const known = stageProblemIds(stage.problemIds, problems);
  if (known.length === 0) return null;

  const now = options.now ?? new Date();
  const todayKey = getDailyDateKey(now);
  const reviews = options.reviews;
  const progress = options.progress;
  const attempt = attemptFor(stage.id, options);

  const dueIds = known
    .filter((id) => {
      const review = reviews?.[id];
      return review !== undefined && review.due <= todayKey;
    })
    .sort((a, b) => {
      const lapseDelta = (reviews?.[b]?.lapses ?? 0) - (reviews?.[a]?.lapses ?? 0);
      if (lapseDelta !== 0) return lapseDelta;
      const dueA = reviews?.[a]?.due ?? "";
      const dueB = reviews?.[b]?.due ?? "";
      if (dueA !== dueB) return dueA.localeCompare(dueB);
      return a.localeCompare(b);
    });

  const weights = difficultyFailureWeights(
    known,
    problems,
    progress,
    reviews,
    attempt,
    todayKey,
  );

  const blocked = new Set<string>();
  for (const id of attempt?.missedIds ?? []) {
    if (!problems.has(id)) continue;
    if (isCheckpointSolved(id, progress, reviews, todayKey)) continue;
    blocked.add(id);
  }

  const baseline = baselineRanking(known, problems);
  const baselineIndex = new Map(baseline.map((id, index) => [id, index]));
  const ranked = known
    .map((id) => {
      const problem = problems.get(id) as CheckpointProblem;
      return {
        id,
        category: problem.category,
        tierWeight: weights[problem.difficulty],
        failures: individualFailures(id, progress, reviews),
        baseline: baselineIndex.get(id) ?? known.length,
      };
    })
    .sort(
      (a, b) =>
        b.tierWeight - a.tierWeight ||
        b.failures - a.failures ||
        a.baseline - b.baseline ||
        a.id.localeCompare(b.id),
    );

  const chosen = new Set<string>();
  const reasons: Record<string, BossReason> = {};
  const take = (id: string, reason: BossReason): void => {
    if (chosen.has(id)) return;
    chosen.add(id);
    reasons[id] = reason;
  };

  if (dueIds.length > 0) take(dueIds[0], "due-review");

  const categories: Category[] = [];
  for (const id of known) {
    const category = problems.get(id)?.category;
    if (category && !categories.includes(category)) categories.push(category);
  }
  for (const category of categories) {
    if (chosen.size >= BOSS_COUNT) break;
    const covered = [...chosen].some(
      (id) => problems.get(id)?.category === category,
    );
    if (covered) continue;
    const pick = ranked.find(
      (candidate) =>
        candidate.category === category &&
        !chosen.has(candidate.id) &&
        !blocked.has(candidate.id),
    );
    if (pick) {
      const reason: BossReason =
        pick.tierWeight > 0 || pick.failures > 0 ? "weak-tier" : "coverage";
      take(pick.id, reason);
    }
  }

  for (const candidate of ranked) {
    if (chosen.size >= BOSS_COUNT) break;
    if (chosen.has(candidate.id) || blocked.has(candidate.id)) continue;
    const reason: BossReason =
      blocked.size > 0
        ? "replacement"
        : candidate.tierWeight > 0 || candidate.failures > 0
          ? "weak-tier"
          : "baseline";
    take(candidate.id, reason);
  }

  for (const candidate of ranked) {
    if (chosen.size >= BOSS_COUNT) break;
    if (chosen.has(candidate.id)) continue;
    take(candidate.id, "replacement");
  }

  return {
    stageId: stage.id,
    bossIds: known.filter((id) => chosen.has(id)),
    reasons,
    dueIds,
    replacedIds: (attempt?.missedIds ?? []).filter(
      (id) => blocked.has(id) && !chosen.has(id),
    ),
    difficultyWeights: weights,
  };
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

/**
 * Plain-language study hints per category. Deliberately about *how to work*,
 * never about a solution: the missed problems stay unsolved until the learner
 * redoes them in the editor.
 */
export const CHECKPOINT_STUDY_HINTS: Record<Category, string> = {
  "Linear Algebra":
    "Write the shape of every array first and check the dimensions line up before doing any arithmetic.",
  Calculus:
    "Start from the definition of the derivative or gradient, then take one small step at a time.",
  Statistics:
    "Say what each number means in one plain sentence before you compute it.",
  Probability:
    "List the sample space or condition on the event first — careful counting beats intuition.",
  "ML Fundamentals":
    "Trace the algorithm on five data points by hand, then write the loop in that same order.",
  "Deep Learning":
    "Follow one value through the forward pass first; gradients are that same path walked backwards.",
  NLP: "Turn the text into tokens or indices first — most bugs are bookkeeping, not math.",
  Optimization:
    "Write the update rule as a plain formula, apply one step by hand, and check the loss still moves down.",
  Algorithms:
    "Run the algorithm on the smallest non-trivial example on paper before translating it to code.",
  "Data Structures":
    "Sketch the structure and its invariants, then implement one operation at a time.",
  "Computer Vision":
    "Work out the output shape first; convolution and pooling are mostly shape arithmetic.",
  "Reinforcement Learning":
    "Name the state, action, and reward for one step before coding the update.",
  "Time Series":
    "Write the first few series values by hand so the window and lag are unambiguous.",
  "Graph Algorithms":
    "Draw the graph, label the frontier, and trace a single iteration.",
  "Information Theory":
    "Write the probabilities down explicitly, then apply the formula.",
};

export const CHECKPOINT_GENERIC_HINT =
  "Re-solve one missed problem slowly and say the steps out loud before you start typing.";

export function studyHintFor(category: Category | null): string {
  if (!category) return CHECKPOINT_GENERIC_HINT;
  return CHECKPOINT_STUDY_HINTS[category] ?? CHECKPOINT_GENERIC_HINT;
}

/** Dominant category of a missed set, breaking ties by first appearance. */
function dominantCategory(
  ids: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): Category | null {
  const counts = new Map<Category, number>();
  const order: Category[] = [];
  for (const id of ids) {
    const category = problems.get(id)?.category;
    if (!category) continue;
    if (!counts.has(category)) order.push(category);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  let best: Category | null = null;
  for (const category of order) {
    if (best === null || (counts.get(category) ?? 0) > (counts.get(best) ?? 0)) {
      best = category;
    }
  }
  return best;
}

function buildRevisit(
  stageId: string,
  missedIds: readonly string[],
  problems: ReadonlyMap<string, CheckpointProblem>,
): CheckpointRevisit {
  const category = dominantCategory(missedIds, problems);
  return {
    stageId,
    missedIds: [...missedIds],
    category,
    hint: studyHintFor(category),
    firstProblemId: missedIds[0] ?? null,
  };
}

export function deriveStageCheckpoint(
  stage: Pick<PathStage, "id" | "problemIds">,
  problems: ReadonlyMap<string, CheckpointProblem>,
  options: CheckpointOptions = {},
): StageCheckpoint | null {
  if (stage.problemIds.length === 0) return null;
  const selection = selectBossSet(stage, problems, options);
  if (!selection || selection.bossIds.length === 0) return null;
  return {
    stageId: stage.id,
    bossIds: selection.bossIds,
    artifact: recommendArtifact(stage.problemIds, problems),
    selection,
  };
}

export function evaluateStageCheckpoint(
  stage: Pick<PathStage, "id" | "problemIds">,
  problems: ReadonlyMap<string, CheckpointProblem>,
  progress: CheckpointProgress,
  options: CheckpointOptions = {},
): CheckpointReport {
  const now = options.now ?? new Date();
  const todayKey = getDailyDateKey(now);
  const reviews = options.reviews;
  const attempt = attemptFor(stage.id, options);
  const checkpoint = deriveStageCheckpoint(stage, problems, {
    ...options,
    progress,
    now,
  });

  let bossSolved = 0;
  if (checkpoint) {
    for (const id of checkpoint.bossIds) {
      if (isCheckpointSolved(id, progress, reviews, todayKey)) bossSolved += 1;
    }
  }
  const required = checkpoint
    ? Math.min(PASS_BOSSES, checkpoint.bossIds.length)
    : 0;
  const passed = checkpoint !== null && bossSolved >= required;
  const allSolved =
    stage.problemIds.length > 0 &&
    stage.problemIds.every((id) => Boolean(progress[id]?.solved));
  const complete = allSolved || passed;

  const attemptCount = attempt?.attempts ?? 0;
  const missedNow = attempt
    ? attempt.missedIds.filter(
        (id) => !isCheckpointSolved(id, progress, reviews, todayKey),
      )
    : [];
  const revisit =
    missedNow.length > 0 ? buildRevisit(stage.id, missedNow, problems) : null;

  let outcome: CheckpointOutcome = null;
  if (passed && checkpoint) {
    const clean =
      attemptCount === 0 &&
      bossSolved === checkpoint.bossIds.length &&
      checkpoint.bossIds.every((id) => (reviews?.[id]?.lapses ?? 0) === 0);
    outcome = clean ? "passed-clean" : "passed";
  } else if (revisit) {
    outcome = "failed";
  }

  return {
    checkpoint,
    bossSolved,
    required,
    passed,
    allSolved,
    complete,
    outcome,
    nextAction: complete ? "advance" : attemptCount > 0 ? "retry" : "review",
    attemptCount,
    revisit,
    dueReviewIds: checkpoint?.selection.dueIds ?? [],
  };
}

export interface CheckpointSummary {
  total: number;
  passed: number;
  failed: number;
  complete: number;
  /** Stages whose adaptive set currently includes a due-review problem. */
  due: number;
  nextAction: CheckpointNextAction | null;
}

/** Path-level roll-up for the paths list chip. Pure. */
export function summarizeCheckpoints(
  stages: readonly Pick<PathStage, "id" | "problemIds">[],
  problems: ReadonlyMap<string, CheckpointProblem>,
  progress: CheckpointProgress,
  options: CheckpointOptions = {},
): CheckpointSummary {
  const summary: CheckpointSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    complete: 0,
    due: 0,
    nextAction: null,
  };
  for (const stage of stages) {
    const report = evaluateStageCheckpoint(stage, problems, progress, options);
    if (!report.checkpoint) continue;
    summary.total += 1;
    if (report.passed) summary.passed += 1;
    if (report.outcome === "failed") summary.failed += 1;
    if (report.complete) summary.complete += 1;
    if (report.dueReviewIds.length > 0) summary.due += 1;
  }
  if (summary.total > 0) {
    if (summary.failed > 0) summary.nextAction = "retry";
    else if (summary.due > 0 || summary.complete < summary.total) {
      summary.nextAction = "review";
    } else {
      summary.nextAction = "advance";
    }
  }
  return summary;
}

/* ─────────────────────── local attempt store (F6) ──────────────────────── */

export const CHECKPOINT_ATTEMPTS_STORAGE_KEY =
  "deepforge:checkpoint-attempts:v1";
export const CHECKPOINT_CHANGE_EVENT = "deepforge:checkpoint-change";

function sanitizeAttempt(value: unknown): CheckpointAttempt | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const attempts =
    typeof record.attempts === "number" && Number.isFinite(record.attempts)
      ? Math.max(1, Math.round(record.attempts))
      : null;
  const bossIds = Array.isArray(record.bossIds)
    ? record.bossIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      )
    : null;
  const missedIds = Array.isArray(record.missedIds)
    ? record.missedIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      )
    : null;
  const at =
    typeof record.at === "string" && !Number.isNaN(Date.parse(record.at))
      ? record.at
      : null;
  if (attempts === null || bossIds === null || missedIds === null || at === null) {
    return null;
  }
  return { attempts, bossIds, missedIds, at };
}

export function parseCheckpointAttempts(
  raw: string | null,
): CheckpointAttemptMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: CheckpointAttemptMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      const attempt = sanitizeAttempt(value);
      if (attempt) out[key] = attempt;
    }
    return out;
  } catch {
    return {};
  }
}

export function readCheckpointAttempts(): CheckpointAttemptMap {
  return parseCheckpointAttempts(readRaw(CHECKPOINT_ATTEMPTS_STORAGE_KEY));
}

export function getCheckpointAttempt(
  pathId: string,
  stageId: string,
): CheckpointAttempt | null {
  return (
    readCheckpointAttempts()[checkpointAttemptKey(pathId, stageId)] ?? null
  );
}

function dispatchCheckpointChange(): void {
  try {
    if (typeof window === "undefined" || typeof CustomEvent !== "function") {
      return;
    }
    window.dispatchEvent(new CustomEvent(CHECKPOINT_CHANGE_EVENT));
  } catch {
    /* events unavailable — ignore */
  }
}

/**
 * Record one checkpoint attempt. Boss ids still unsolved (using the due-aware
 * rule) become the revisit list and are swapped out of the next adaptive set.
 * Local-only for now; not yet part of the sync seam.
 */
export function recordCheckpointAttempt(
  pathId: string,
  stageId: string,
  bossIds: readonly string[],
  progress: CheckpointProgress,
  options: { reviews?: ReviewMap; now?: Date } = {},
): CheckpointAttempt {
  const now = options.now ?? new Date();
  const todayKey = getDailyDateKey(now);
  const missedIds = bossIds.filter(
    (id) => !isCheckpointSolved(id, progress, options.reviews, todayKey),
  );
  const key = checkpointAttemptKey(pathId, stageId);
  const map = readCheckpointAttempts();
  const attempt: CheckpointAttempt = {
    attempts: (map[key]?.attempts ?? 0) + 1,
    bossIds: [...bossIds],
    missedIds,
    at: now.toISOString(),
  };
  writeRaw(
    CHECKPOINT_ATTEMPTS_STORAGE_KEY,
    JSON.stringify({ ...map, [key]: attempt }),
  );
  dispatchCheckpointChange();
  return attempt;
}

export function clearCheckpointAttempts(): void {
  writeRaw(CHECKPOINT_ATTEMPTS_STORAGE_KEY, JSON.stringify({}));
  dispatchCheckpointChange();
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
