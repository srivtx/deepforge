import type { Category, Difficulty, Problem } from "@/types/problem";

export interface HintTier {
  label: string;
  text: string;
  isSolution?: boolean;
}

const GENERIC_NUDGES: Record<Difficulty, string> = {
  Easy: "Re-read the description and identify the exact output the tests expect. Trace one tiny example by hand, then write the loop that reproduces it.",
  Medium:
    "Break the problem into two or three smaller steps, get each one right on a small example, and only then combine them into the final function.",
  Hard: "Write the mathematical definition of the result first, then translate each term directly into code. Check signs and edge cases before worrying about efficiency.",
};

const CURATED_APPROACH: Record<Category, string> = {
  "Linear Algebra":
    "Translate the matrices into plain Python lists and track the shapes before writing any loops — most bugs here are shape mismatches. Work out one index pattern on a 2x2 example, then generalize it into nested loops. Prefer straightforward index arithmetic over clever flattening unless the problem explicitly asks for efficiency.",
  Calculus:
    "Start from the definition (derivative, gradient, or integral) and apply it term by term. For numerical problems, pick a small step size and validate against a closed-form answer you can compute by hand. Watch boundary points and keep sign conventions consistent throughout.",
  Statistics:
    "Write down the formula you are implementing before touching code, and map each symbol to a variable. Compute the mean first, then the deviations needed for variance-like quantities. On small samples, check your result against a hand calculation to catch n versus n-1 denominator mistakes.",
  Probability:
    "List the sample space and the event you care about, then count or sum over the favorable outcomes. If events interact, decide up front whether independence or conditional probability applies. Small exact-fraction checks by hand are the fastest way to validate your implementation.",
  "ML Fundamentals":
    "Identify the inputs and the exact output shape the test cases expect, then implement the simplest correct formula before optimizing. Handle degenerate cases such as empty inputs or all-zero values explicitly. If a library would vectorize this, reproduce that math with plain loops first.",
  "Deep Learning":
    "Sketch the forward pass as a sequence of tensor operations and track shapes at every step. Derive the backward pass by applying the chain rule to your own forward equations. Validate with tiny arrays where you can compute the expected values by hand.",
  NLP:
    "Normalize the text first and decide exactly what counts as a token before counting anything. Build intermediate structures such as vocabulary maps or count matrices, then derive the final statistic from them. Keep case, punctuation, and whitespace behavior consistent with the provided examples.",
  Optimization:
    "Write the update rule in its mathematical form, then take one step manually on a tiny example. Be precise about signs and step sizes — most errors are a flipped gradient or a missing factor. Check convergence behavior against the expected output rather than assuming it.",
  Algorithms:
    "State the invariant your loop maintains, then pick the data structure that makes it cheap to preserve. Work through the provided test cases by hand before coding and look for edge inputs (empty, single element, duplicates). Get an obvious correct solution passing first, then optimize.",
  "Data Structures":
    "Decide which operations must be fast, since that dictates the representation you should build. Keep every invariant — size, ordering, parent pointers — valid after each mutation. Trace an insert and a delete on a small structure on paper before writing code.",
  "Computer Vision":
    "Treat images as nested lists of pixel values and fix your coordinate convention early (row versus column, x versus y). Implement the operation for a single pixel or kernel window first, then slide it across the whole image. Pay close attention to boundary handling and channel counts.",
  "Reinforcement Learning":
    "Write the Bellman relationship or policy update you are implementing, then iterate over states and actions in a fixed, deterministic order. Initialize values consistently and keep applying updates until they stop changing. Test on a tiny MDP where you can reason about the optimal answer.",
  "Time Series":
    "Clarify the indexing convention first — what a lag means in the data and where the output series starts. Compute one value by hand from the formula, then loop over time. Keep initial conditions and output length aligned with the examples.",
  "Graph Algorithms":
    "Represent the graph as adjacency lists and choose a traversal that matches the algorithm: BFS for unweighted shortest paths, DFS for structure, a priority queue for weighted graphs. Track visited nodes so each node is processed once. Trace the algorithm on the smallest test graph before coding.",
  "Information Theory":
    "Write the entropy or divergence formula explicitly and decide how to handle zero probabilities before looping. Use base-2 logarithms when the expected units are bits. Sanity-check simple distributions such as uniform or deterministic ones against known values.",
};

/* ─────────────────────────────── budget ────────────────────────────────── */

/**
 * Hint budget thresholds for one attempt.
 *
 * - tier 1 (Nudge): always available.
 * - tier 2 (Approach): 1 failed run OR 3 minutes (180_000 ms) on the problem.
 * - tier 3 (Full solution): 2 failed runs OR 6 minutes (360_000 ms) on the
 *   problem.
 *
 * A reset (a fresh attempt, e.g. a new problem) restores tier 1. Tier 3 is
 * never permanently blocked — the budget always opens it eventually.
 */
export const HINT_TIER_2_FAILED_RUNS = 1;
export const HINT_TIER_2_ELAPSED_MS = 3 * 60_000;
export const HINT_TIER_3_FAILED_RUNS = 2;
export const HINT_TIER_3_ELAPSED_MS = 6 * 60_000;
export const MAX_HINT_TIER = 3;

export interface HintBudgetInput {
  /** Completed runs whose tests did not all pass. */
  failedRuns?: number;
  /** Milliseconds spent on the problem in this attempt. */
  elapsedMs?: number;
  /** Fresh attempt: the budget returns to tier 1. */
  reset?: boolean;
  /** Upper bound for the returned tier (default 3). */
  maxTier?: number;
}

function countOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function clampTier(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(MAX_HINT_TIER, Math.max(1, Math.floor(value)))
    : fallback;
}

/** Highest hint tier this attempt has earned. Pure and junk-safe. */
export function allowedHintTier(input: HintBudgetInput = {}): number {
  const budget = input ?? {};
  const maxTier = clampTier(budget.maxTier, MAX_HINT_TIER);
  if (budget.reset === true) return Math.min(1, maxTier);
  const failedRuns = countOrZero(budget.failedRuns);
  const elapsedMs = countOrZero(budget.elapsedMs);
  if (
    failedRuns >= HINT_TIER_3_FAILED_RUNS ||
    elapsedMs >= HINT_TIER_3_ELAPSED_MS
  ) {
    return Math.min(3, maxTier);
  }
  if (
    failedRuns >= HINT_TIER_2_FAILED_RUNS ||
    elapsedMs >= HINT_TIER_2_ELAPSED_MS
  ) {
    return Math.min(2, maxTier);
  }
  return 1;
}

/**
 * Usage penalty from the highest tier ever revealed this attempt:
 * 0 = none, 1 = nudge, 2 = approach, 3 = full solution. Non-finite or
 * out-of-range entries are ignored/clamped rather than trusted.
 */
export function hintPenalty(
  usedTiers: readonly number[] | null | undefined,
): number {
  if (!Array.isArray(usedTiers)) return 0;
  let highest = 0;
  for (const tier of usedTiers) {
    if (typeof tier !== "number" || !Number.isFinite(tier)) continue;
    highest = Math.max(
      highest,
      Math.min(MAX_HINT_TIER, Math.max(0, Math.floor(tier))),
    );
  }
  return highest;
}

/**
 * Apply hint usage to an SM-2 base quality (from `qualityFromRun`). A pass
 * never drops below 3 — hints cost the grade, they never turn it into a
 * lapse — and failing grades pass through unchanged.
 */
export function applyHintPenalty(
  baseQuality: number,
  usedTiers: readonly number[] | null | undefined,
): number {
  const base = Number.isFinite(baseQuality) ? Math.round(baseQuality) : 0;
  const bounded = Math.max(0, Math.min(5, base));
  if (bounded < 3) return bounded;
  return Math.max(3, bounded - hintPenalty(usedTiers));
}

/* ──────────────────────────────── tiers ────────────────────────────────── */

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/[^.!?]+[.!?]/);
  const sentence = (match ? match[0] : trimmed).trim();
  if (sentence.length <= 220) return sentence;
  return `${sentence.slice(0, 220).trimEnd()}…`;
}

export function getHintTiers(problem: Problem): HintTier[] {
  const nudge = problem.hint ?? GENERIC_NUDGES[problem.difficulty];
  const approach = `${CURATED_APPROACH[problem.category]} This problem asks: "${firstSentence(problem.description)}"`;
  return [
    { label: "Nudge", text: nudge },
    { label: "Approach", text: approach },
    { label: "Full solution", text: problem.solution, isSolution: true },
  ];
}
