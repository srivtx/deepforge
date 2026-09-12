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
