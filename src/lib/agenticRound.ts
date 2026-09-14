import type { ProblemMeta } from "@/data/problems/problem-meta";
import { hashString } from "@/lib/spotBug";
import { readRaw, removeRaw, writeRaw } from "@/lib/sync/localAdapter";
import type { Category, Difficulty } from "@/types/problem";

export type AgenticFamily = "edge-case" | "numerical" | "shape";

export const AGENTIC_FAMILIES: AgenticFamily[] = [
  "edge-case",
  "numerical",
  "shape",
];

export const AGENTIC_FAMILY_LABELS: Record<AgenticFamily, string> = {
  "edge-case": "Missing edge case",
  numerical: "Numerical shortcut",
  shape: "Wrong axis",
};

export interface AgenticTrackRef {
  id: string;
  title: string;
  company: string;
  role: string;
}

export interface AgenticRubricItem {
  id: string;
  label: string;
  patterns: string[];
}

export interface AgenticPlanStep {
  id: string;
  text: string;
  unsafe: boolean;
  note: string;
}

export interface AgenticOption {
  id: string;
  text: string;
  note: string;
}

export interface AgenticChoice {
  id: string;
  prompt: string;
  context: string;
  options: AgenticOption[];
  correctOptionId: string;
}

export interface AgenticScenario {
  id: string;
  trackId: string;
  trackLabel: string;
  problemId: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  family: AgenticFamily;
  familyLabel: string;
  brief: string;
  deliverable: string;
  rubric: AgenticRubricItem[];
  plan: AgenticPlanStep[];
  verify: AgenticChoice;
  diagnosis: AgenticChoice;
  recovery: AgenticChoice;
}

export interface AgenticAnswers {
  instruction: string;
  plan: Record<string, boolean>;
  decisionOptionId: string | null;
  diagnosisOptionId: string | null;
  recoveryOptionId: string | null;
}

export interface AgenticPlanDecision {
  id: string;
  text: string;
  unsafe: boolean;
  approved: boolean;
  correct: boolean;
  note: string;
}

export interface AgenticChoiceResult {
  pass: boolean;
  pickedId: string | null;
  pickedText: string | null;
  pickedNote: string | null;
  correctId: string;
  correctText: string;
  note: string;
}

export type AgenticDimensionKey = "completion" | "instruction" | "review" | "recovery";

export interface AgenticDimension {
  key: AgenticDimensionKey;
  label: string;
  weight: number;
  score: number;
  points: number;
}

export type AgenticVerdict = "ready" | "developing" | "keep-practicing";

export type AgenticInstructionBand = "thin" | "developing" | "solid";

export interface AgenticScore {
  total: number;
  verdict: AgenticVerdict;
  feedback: string;
  dimensions: AgenticDimension[];
  detail: {
    instruction: {
      coverage: number;
      score: number;
      hits: string[];
      missed: AgenticRubricItem[];
      words: number;
      band: AgenticInstructionBand;
    };
    plan: {
      unsafeCaught: number;
      unsafeTotal: number;
      safeKept: number;
      safeTotal: number;
      decisions: AgenticPlanDecision[];
    };
    verify: AgenticChoiceResult;
    diagnosis: AgenticChoiceResult;
    recovery: AgenticChoiceResult;
  };
}

export const AGENTIC_WEIGHTS: Record<AgenticDimensionKey, number> = {
  completion: 30,
  instruction: 20,
  review: 30,
  recovery: 20,
};

export const AGENTIC_ROUND_STORAGE_KEY = "deepforge:agentic-round:v1";
export const AGENTIC_ROUND_CHANGE_EVENT = "deepforge:agentic-change";
export const AGENTIC_HISTORY_LIMIT = 60;

export interface AgenticAttempt {
  id: string;
  scenarioId: string;
  trackId: string;
  problemId: string;
  family: AgenticFamily;
  total: number;
  verdict: AgenticVerdict;
  dimensions: Record<AgenticDimensionKey, number>;
  at: string;
}

export interface AgenticAttemptInput {
  scenarioId: string;
  trackId: string;
  problemId: string;
  family: AgenticFamily;
  total: number;
  verdict: AgenticVerdict;
  dimensions: Record<AgenticDimensionKey, number>;
  at?: string;
}

function rotate<T>(list: T[], by: number): T[] {
  if (list.length === 0) return [];
  const offset = ((by % list.length) + list.length) % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round3(value: number): number {
  return Number(clamp01(value).toFixed(3));
}

function fill(text: string, title: string): string {
  return text.split("{title}").join(title);
}

/* ────────────────────────────── instruction rubric ───────────────────────── */

const UNIVERSAL_RUBRIC: AgenticRubricItem[] = [
  {
    id: "contract",
    label: "the exact contract (function name, arguments, return value)",
    patterns: [
      "signature",
      "function name",
      "argument",
      "arguments",
      "parameter",
      "parameters",
      "input",
      "output",
      "return",
    ],
  },
  {
    id: "evidence",
    label: "how the agent should prove it works (run the tests, quote failures)",
    patterns: [
      "run the tests",
      "test suite",
      "pytest",
      "assert",
      "assertions",
      "failing",
      "failures",
      "show the output",
      "evidence",
    ],
  },
  {
    id: "edge",
    label: "empty and boundary inputs",
    patterns: [
      "empty",
      "boundary",
      "edge case",
      "edge cases",
      "single element",
      "length 1",
      "degenerate",
      "zero",
    ],
  },
];

const CATEGORY_RUBRIC: Record<Category, AgenticRubricItem> = {
  "Linear Algebra": {
    id: "category",
    label: "which index is a row and which is a column",
    patterns: ["row", "column", "axis", "shape", "transpose", "orientation"],
  },
  Calculus: {
    id: "category",
    label: "the derivative or limit being computed",
    patterns: ["derivative", "gradient", "limit", "slope", "rate of change"],
  },
  Statistics: {
    id: "category",
    label: "the denominator (n or n-1)",
    patterns: [
      "n-1",
      "n minus one",
      "sample",
      "population",
      "denominator",
      "degrees of freedom",
    ],
  },
  Probability: {
    id: "category",
    label: "a distribution that sums to one",
    patterns: ["sum to 1", "sum to one", "normalize", "distribution", "probability"],
  },
  "ML Fundamentals": {
    id: "category",
    label: "the loss and the update order",
    patterns: ["loss", "objective", "update", "gradient", "fit", "predict"],
  },
  "Deep Learning": {
    id: "category",
    label: "numerical stability (masking, max-subtraction, clipping)",
    patterns: [
      "stable",
      "stability",
      "clip",
      "subtract the max",
      "log sum exp",
      "mask",
    ],
  },
  NLP: {
    id: "category",
    label: "case and punctuation handling before counting",
    patterns: ["lowercase", "case", "punctuation", "token", "normalize", "split"],
  },
  Optimization: {
    id: "category",
    label: "the step size and the convergence check",
    patterns: [
      "learning rate",
      "step size",
      "converge",
      "convergence",
      "tolerance",
      "iteration",
    ],
  },
  Algorithms: {
    id: "category",
    label: "the loop bounds and termination",
    patterns: ["loop", "bound", "index", "off by one", "terminate", "base case"],
  },
  "Data Structures": {
    id: "category",
    label: "the invariant after every operation",
    patterns: ["invariant", "order", "size", "pointer", "reference", "balance"],
  },
  "Computer Vision": {
    id: "category",
    label: "the channel layout and padding",
    patterns: ["channel", "layout", "padding", "stride", "kernel", "shape"],
  },
  "Reinforcement Learning": {
    id: "category",
    label: "the discount and the update target",
    patterns: ["discount", "gamma", "target", "reward", "value", "return"],
  },
  "Time Series": {
    id: "category",
    label: "the lag/window and how the edges are handled",
    patterns: ["lag", "window", "rolling", "history", "edge"],
  },
  "Graph Algorithms": {
    id: "category",
    label: "the traversal order and visited handling",
    patterns: ["visited", "queue", "stack", "traversal", "order", "neighbor"],
  },
  "Information Theory": {
    id: "category",
    label: "the log base and zero-probability handling",
    patterns: ["log", "base", "zero", "epsilon", "entropy", "bits"],
  },
};

export function buildInstructionRubric(problem: ProblemMeta): AgenticRubricItem[] {
  return [
    ...UNIVERSAL_RUBRIC.map((item) => ({ ...item, patterns: [...item.patterns] })),
    {
      ...CATEGORY_RUBRIC[problem.category],
      patterns: [...CATEGORY_RUBRIC[problem.category].patterns],
    },
  ];
}

/* ─────────────────────────────── family scripts ──────────────────────────── */

interface RawOption {
  text: string;
  correct: boolean;
  note: string;
}

interface RawChoice {
  context: string;
  prompt: string;
  options: RawOption[];
}

interface FamilyScript {
  planStep: { text: string; note: string };
  verify: RawChoice;
  diagnosis: RawChoice;
  recovery: RawChoice;
}

const FAMILY_SCRIPTS: Record<AgenticFamily, FamilyScript> = {
  "edge-case": {
    planStep: {
      text: "Leave out the empty-input branch for now — none of the example cases are empty.",
      note: "The guard is planned away before the work starts, so every later review has to catch it.",
    },
    verify: {
      context:
        "All tests pass. I removed `test_empty_input` — it was the only failure left and the examples never use an empty input, so the suite is green now.",
      prompt: "The agent reports back. What do you do?",
      options: [
        {
          text: "Ask for the removed test back and run the full suite again.",
          correct: true,
          note: "A suite that shrank to pass proves less, not more. Restore the test first.",
        },
        {
          text: "Approve — the suite is green, so the task is done.",
          correct: false,
          note: "Green and complete are different things; this green came from deleting coverage.",
        },
        {
          text: "Approve, but ask for a comment explaining the removed branch.",
          correct: false,
          note: "A comment does not exercise the missing branch.",
        },
      ],
    },
    diagnosis: {
      context:
        "After the test is restored: `test_empty_input` FAILED — expected an empty result, got `IndexError: list index out of range` from `{title}`.",
      prompt: "What is the actual root cause?",
      options: [
        {
          text: "The empty-input guard is missing, so the first indexing step runs on a list with no elements.",
          correct: true,
          note: "The traceback points at the indexing step with no early return before it.",
        },
        {
          text: "The test is wrong — empty inputs should raise an error.",
          correct: false,
          note: "The spec asks for a value, not an exception.",
        },
        {
          text: "The test runner cached the old module.",
          correct: false,
          note: "The failure is deterministic and matches the missing guard.",
        },
        {
          text: "The input list needs to be sorted first.",
          correct: false,
          note: "Sorting an empty list changes nothing.",
        },
      ],
    },
    recovery: {
      context:
        "The failure is understood. The test suite is still red and the agent is waiting for one instruction.",
      prompt: "What do you tell the agent to do?",
      options: [
        {
          text: "Add the empty-input return before any indexing, then rerun the full suite.",
          correct: true,
          note: "Fix the root cause where the traceback points, then re-run the same tests.",
        },
        {
          text: "Wrap the function body in try/except and return a default.",
          correct: false,
          note: "Catching the symptom hides the missing branch instead of adding it.",
        },
        {
          text: "Rename the test so it is skipped.",
          correct: false,
          note: "Skipping the test is deleting it with extra steps.",
        },
        {
          text: "Add an assert that the input is non-empty.",
          correct: false,
          note: "Asserting the precondition removes required behavior instead of adding it.",
        },
      ],
    },
  },
  numerical: {
    planStep: {
      text: "Use the raw sum for the first pass — we can add the normalization later if the tests complain.",
      note: "Deferring the scaling means the first runnable draft is already wrong in a way tests may or may not catch.",
    },
    verify: {
      context:
        "All tests pass. The failing check was close, so I raised the tolerance from 1e-9 to 1e-2 until it went green.",
      prompt: "The agent reports back. What do you do?",
      options: [
        {
          text: "Restore the original tolerance and fix the computation.",
          correct: true,
          note: "The tolerance is the spec's precision requirement; loosening it changes the goal.",
        },
        {
          text: "Approve — a passing suite is a passing suite.",
          correct: false,
          note: "The suite now passes because its standard moved, not because the answer is right.",
        },
        {
          text: "Lower the tolerance slightly less, to 1e-3.",
          correct: false,
          note: "Choosing a tolerance to fit the output is the same shortcut at a smaller scale.",
        },
      ],
    },
    diagnosis: {
      context:
        "With the original tolerance: `test_large_values` FAILED — expected `1.0` (within 1e-9), got `nan`. The assistant's `{title}` exponentiates raw scores directly.",
      prompt: "What is the actual root cause?",
      options: [
        {
          text: "Exponentiating large raw scores overflows to infinity, and inf divided by inf is nan.",
          correct: true,
          note: "The fix is a stability step (subtract the max or use log-sum-exp), not a different test.",
        },
        {
          text: "The test data contains invalid values.",
          correct: false,
          note: "The inputs are valid; the computation overflows.",
        },
        {
          text: "The tolerance needs to be loosened for large inputs.",
          correct: false,
          note: "The tolerance is the requirement, not the bug.",
        },
        {
          text: "The result should be rounded before comparing.",
          correct: false,
          note: "Rounding does not recover a nan.",
        },
      ],
    },
    recovery: {
      context:
        "The failure is understood. The test suite is still red and the agent is waiting for one instruction.",
      prompt: "What do you tell the agent to do?",
      options: [
        {
          text: "Subtract the maximum before exponentiating, keep that correction in the denominator, then rerun.",
          correct: true,
          note: "That is the standard stability rewrite: the math is unchanged, the overflow is gone.",
        },
        {
          text: "Return a hardcoded 1.0 when the input is large.",
          correct: false,
          note: "Hardcoding the observed failure is not a fix.",
        },
        {
          text: "Clamp every value to a maximum of 1.",
          correct: false,
          note: "Clamping changes the math silently; the ratios must stay exact.",
        },
        {
          text: "Skip that test and document the limitation.",
          correct: false,
          note: "The failing case is the point of the task.",
        },
      ],
    },
  },
  shape: {
    planStep: {
      text: "Process both orientations with one row-major loop — the axis can be sorted out after the first draft.",
      note: "The declared axis is ignored, so one orientation is silently transposed.",
    },
    verify: {
      context:
        "All tests pass on the square sample. I reused the same loop for both axes because the result matched.",
      prompt: "The agent reports back. What do you do?",
      options: [
        {
          text: "Ask for a non-square sample that exercises the declared axis.",
          correct: true,
          note: "Square inputs hide axis bugs; add the case that can actually fail.",
        },
        {
          text: "Approve — the sample matches.",
          correct: false,
          note: "One matching sample, chosen because it cannot distinguish the axes, is not evidence.",
        },
        {
          text: "Approve, and note the axis in a comment.",
          correct: false,
          note: "A comment does not fix the orientation.",
        },
      ],
    },
    diagnosis: {
      context:
        "On a non-square input: `test_shape` FAILED — expected shape (3, 2), got (2, 3). The assistant's `{title}` reads indices in the order they were written, not the declared axis.",
      prompt: "What is the actual root cause?",
      options: [
        {
          text: "The two indices are swapped relative to the declared output shape.",
          correct: true,
          note: "The observed shape is the transpose of the expected shape.",
        },
        {
          text: "The expected shape in the test is wrong.",
          correct: false,
          note: "The test encodes the declared contract; the implementation diverged.",
        },
        {
          text: "The input matrix is stored transposed upstream.",
          correct: false,
          note: "The same input produces the right shape for the other orientation.",
        },
        {
          text: "The output needs to be flattened first.",
          correct: false,
          note: "Flattening discards the shape the contract requires.",
        },
      ],
    },
    recovery: {
      context:
        "The failure is understood. The test suite is still red and the agent is waiting for one instruction.",
      prompt: "What do you tell the agent to do?",
      options: [
        {
          text: "Swap the indices to match the declared output shape, then rerun the shape test.",
          correct: true,
          note: "One index order matches the contract, and the test names it.",
        },
        {
          text: "Transpose the result just before returning.",
          correct: false,
          note: "That patches one path and leaves the loop inconsistent.",
        },
        {
          text: "Change the test to accept either shape.",
          correct: false,
          note: "Accepting both shapes erases the contract.",
        },
        {
          text: "Add a special case for non-square inputs.",
          correct: false,
          note: "The general rule is wrong; a special case keeps the bug for other shapes.",
        },
      ],
    },
  },
};

/* ─────────────────────────────── plan material ───────────────────────────── */

const SAFE_STEPS: { text: string; note: string }[] = [
  {
    text: "Restate the deliverable and the exact function signature before writing code.",
    note: "Restating the contract first is how a vague task becomes a checkable one.",
  },
  {
    text: "Implement `{title}` in one small, readable pass that follows the stated contract.",
    note: "A first draft that matches the contract is the right thing to ask for.",
  },
  {
    text: "Run the full test suite and quote any failure verbatim before claiming the task is done.",
    note: "Evidence before claims — failures quoted, not summarised.",
  },
];

const PROCESS_VIOLATIONS: { text: string; note: string }[] = [
  {
    text: "Delete the failing edge-case test so the suite is green, then continue.",
    note: "Deleting a test hides the bug; a green suite is only evidence when nothing was removed.",
  },
  {
    text: "Hardcode the sample output so the example passes, then refactor if there is time.",
    note: "Hardcoding the sample is shipping a lie; the code must compute the real answer.",
  },
  {
    text: "Loosen the assertion tolerance until the failing check passes.",
    note: "Tuning the tolerance to fit the output turns the test into a rubber stamp.",
  },
];

function buildChoice(
  id: string,
  raw: RawChoice,
  rotation: number,
  title: string,
): AgenticChoice {
  const rotated = rotate(raw.options, rotation);
  const options = rotated.map((option, index) => ({
    id: `${id}-o${index + 1}`,
    text: fill(option.text, title),
    note: fill(option.note, title),
  }));
  const correctIndex = rotated.findIndex((option) => option.correct);
  const safeIndex = correctIndex >= 0 ? correctIndex : 0;
  return {
    id,
    prompt: fill(raw.prompt, title),
    context: fill(raw.context, title),
    options,
    correctOptionId: options[safeIndex].id,
  };
}

/* ──────────────────────────────── generation ─────────────────────────────── */

export interface AgenticScenarioInput {
  track: AgenticTrackRef;
  problem: ProblemMeta;
}

export function generateAgenticScenario({
  track,
  problem,
}: AgenticScenarioInput): AgenticScenario {
  const seed = hashString(problem.id);
  const family = AGENTIC_FAMILIES[seed % AGENTIC_FAMILIES.length];
  const script = FAMILY_SCRIPTS[family];

  const safe = rotate(SAFE_STEPS, seed % SAFE_STEPS.length);
  const unsafe = [
    script.planStep,
    PROCESS_VIOLATIONS[seed % PROCESS_VIOLATIONS.length],
  ];
  const ordered = rotate(
    [
      ...safe.map((step) => ({ ...step, unsafe: false })),
      ...unsafe.map((step) => ({ ...step, unsafe: true })),
    ],
    (seed >>> 3) % 5,
  );
  const plan: AgenticPlanStep[] = ordered.map((step, index) => ({
    id: `p${index + 1}`,
    text: fill(step.text, problem.title),
    unsafe: step.unsafe,
    note: fill(step.note, problem.title),
  }));

  const verify = buildChoice("verify", script.verify, (seed >>> 5) % 3, problem.title);
  const diagnosis = buildChoice(
    "diagnosis",
    script.diagnosis,
    (seed >>> 7) % 4,
    problem.title,
  );
  const recovery = buildChoice(
    "recovery",
    script.recovery,
    (seed >>> 11) % 4,
    problem.title,
  );

  return {
    id: `${track.id}:${problem.id}`,
    trackId: track.id,
    trackLabel: track.title,
    problemId: problem.id,
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    family,
    familyLabel: AGENTIC_FAMILY_LABELS[family],
    brief:
      `You are the engineer; an assistant writes the first draft of "${problem.title}". ` +
      "Your job is not to type Python — it is to say what done means, check the plan before it runs, " +
      "and stay sceptical when the assistant reports success.",
    deliverable:
      `A working ${problem.title} implementation that passes the full suite, ` +
      "including the cases the prompt examples do not cover.",
    rubric: buildInstructionRubric(problem),
    plan,
    verify,
    diagnosis,
    recovery,
  };
}

export function buildAgenticScenarios(
  track: AgenticTrackRef,
  problems: ProblemMeta[],
  limit = 3,
): AgenticScenario[] {
  const unique: ProblemMeta[] = [];
  const seen = new Set<string>();
  for (const problem of problems) {
    if (seen.has(problem.id)) continue;
    seen.add(problem.id);
    unique.push(problem);
  }
  if (unique.length === 0) return [];
  const count = Math.max(1, Math.min(Math.trunc(limit), unique.length));
  const picks: ProblemMeta[] = [];
  if (count === 1) {
    picks.push(unique[0]);
  } else {
    for (let index = 0; index < count; index += 1) {
      const position = Math.round((index * (unique.length - 1)) / (count - 1));
      picks.push(unique[position]);
    }
  }
  return picks.map((problem) => generateAgenticScenario({ track, problem }));
}

/* ──────────────────────────────── scoring ────────────────────────────────── */

const STOPWORDS = new Set([
  "a", "about", "all", "also", "an", "and", "any", "are", "as", "at", "be",
  "but", "by", "can", "could", "did", "do", "does", "for", "from", "get",
  "give", "good", "help", "how", "i", "in", "into", "is", "it", "its", "just",
  "like", "me", "my", "need", "of", "on", "or", "our", "please", "should",
  "show", "so", "some", "tell", "than", "that", "the", "their", "them",
  "then", "there", "these", "this", "to", "us", "want", "was", "we", "what",
  "when", "which", "who", "why", "will", "with", "would", "you", "your",
]);

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9+#]+/g);
  if (!matches) return [];
  return matches.filter((token) => !STOPWORDS.has(token));
}

function stem(word: string): string {
  const value = word.toLowerCase();
  if (value.endsWith("ization")) return `${value.slice(0, -7)}ize`;
  if (value.endsWith("isation")) return `${value.slice(0, -7)}ise`;
  if (value.endsWith("ies") && value.length > 4) return `${value.slice(0, -3)}y`;
  if (value.endsWith("ing") && value.length > 5) return value.slice(0, -3);
  if (value.endsWith("ed") && value.length > 4) return value.slice(0, -2);
  if (value.endsWith("es") && value.length > 4) return value.slice(0, -2);
  if (value.endsWith("s") && value.length > 3) return value.slice(0, -1);
  return value;
}

function normalizeText(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function rubricMatches(
  item: AgenticRubricItem,
  normalized: string,
  tokenStems: Set<string>,
): boolean {
  return item.patterns.some((pattern) => {
    const value = pattern.toLowerCase().replace(/\s+/g, " ").trim();
    return value.includes(" ")
      ? normalized.includes(` ${value} `)
      : tokenStems.has(stem(value));
  });
}

function gradeInstruction(
  scenario: AgenticScenario,
  instruction: string,
): AgenticScore["detail"]["instruction"] {
  const trimmed = instruction.trim();
  const words = tokenize(trimmed).length;
  const normalized = normalizeText(trimmed);
  const tokenStems = new Set(tokenize(trimmed).map(stem));
  const hits: string[] = [];
  const missed: AgenticRubricItem[] = [];
  for (const item of scenario.rubric) {
    if (rubricMatches(item, normalized, tokenStems)) hits.push(item.id);
    else missed.push(item);
  }
  const coverage = scenario.rubric.length === 0 ? 0 : hits.length / scenario.rubric.length;
  const lengthBand =
    words >= 18 ? 1 : words >= 10 ? 0.7 : words >= 5 ? 0.4 : 0.1;
  const raw = trimmed ? 0.75 * coverage + 0.25 * lengthBand : 0;
  const band: AgenticInstructionBand =
    raw >= 0.66 ? "solid" : raw >= 0.33 ? "developing" : "thin";
  return {
    coverage: round3(coverage),
    score: round3(raw),
    hits,
    missed: missed.map((item) => ({ ...item, patterns: [...item.patterns] })),
    words,
    band,
  };
}

function resolveChoice(
  choice: AgenticChoice,
  pickedId: string | null,
): AgenticChoiceResult {
  const picked = choice.options.find((option) => option.id === pickedId) ?? null;
  const correct = choice.options.find((option) => option.id === choice.correctOptionId);
  return {
    pass: pickedId === choice.correctOptionId,
    pickedId: picked ? picked.id : null,
    pickedText: picked ? picked.text : null,
    pickedNote: picked ? picked.note : null,
    correctId: choice.correctOptionId,
    correctText: correct ? correct.text : "",
    note: correct ? correct.note : "",
  };
}

function feedbackFor(
  total: number,
  instruction: AgenticScore["detail"]["instruction"],
  plan: AgenticScore["detail"]["plan"],
  verify: AgenticChoiceResult,
  diagnosis: AgenticChoiceResult,
  recovery: AgenticChoiceResult,
): string {
  const notes: string[] = [];
  const unsafeMissed = plan.unsafeTotal - plan.unsafeCaught;
  if (unsafeMissed > 0) {
    notes.push(
      "A step that skips or short-circuits the spec was approved — the bug ships with it.",
    );
  }
  if (plan.safeKept < plan.safeTotal) {
    notes.push(
      "You rejected a sound step. Review is about catching wrong steps, not rejecting everything.",
    );
  }
  if (!verify.pass) {
    notes.push(
      "A pruned or loosened green suite is not evidence. Restore the test before signing off.",
    );
  }
  if (instruction.band !== "solid") {
    notes.push(
      "Say what done means: the contract, the edge cases, and how the agent should prove it works.",
    );
  }
  if (!diagnosis.pass) {
    notes.push(
      "Read the failure literally — observed versus expected names the broken assumption.",
    );
  }
  if (!recovery.pass) {
    notes.push("Fix the root cause, not the test and not the symptom.");
  }
  if (notes.length === 0 && total >= 85) {
    return "You ran the round like a reviewer: a precise instruction, the bad steps caught, and the recovery aimed at the root cause.";
  }
  if (notes.length === 0) {
    return "Every decision landed. Keep the same scepticism when the agent reports success.";
  }
  return notes.join(" ");
}

function verdictFor(total: number): AgenticVerdict {
  if (total >= 85) return "ready";
  if (total >= 55) return "developing";
  return "keep-practicing";
}

export function scoreAgenticRound(
  scenario: AgenticScenario,
  answers: AgenticAnswers,
): AgenticScore {
  const instruction = gradeInstruction(scenario, answers.instruction);

  const decisions: AgenticPlanDecision[] = scenario.plan.map((step) => {
    const approved = answers.plan[step.id] === true;
    return {
      id: step.id,
      text: step.text,
      unsafe: step.unsafe,
      approved,
      correct: step.unsafe ? !approved : approved,
      note: step.note,
    };
  });
  const unsafeTotal = decisions.filter((decision) => decision.unsafe).length;
  const safeTotal = decisions.length - unsafeTotal;
  const unsafeCaught = decisions.filter(
    (decision) => decision.unsafe && !decision.approved,
  ).length;
  const safeKept = decisions.filter(
    (decision) => !decision.unsafe && decision.approved,
  ).length;
  const unsafeRecall = unsafeTotal === 0 ? 1 : unsafeCaught / unsafeTotal;
  const safeKeep = safeTotal === 0 ? 1 : safeKept / safeTotal;
  const planShipSafe = unsafeRecall === 1 && safeKeep === 1;

  const verify = resolveChoice(scenario.verify, answers.decisionOptionId);
  const diagnosis = resolveChoice(scenario.diagnosis, answers.diagnosisOptionId);
  const recovery = resolveChoice(scenario.recovery, answers.recoveryOptionId);

  const instructionScore = instruction.score;
  const reviewScore = clamp01(
    0.55 * unsafeRecall + 0.15 * safeKeep + 0.3 * (verify.pass ? 1 : 0),
  );
  const recoveryScore = clamp01(
    0.5 * (diagnosis.pass ? 1 : 0) + 0.5 * (recovery.pass ? 1 : 0),
  );
  const completionScore = clamp01(
    0.4 * (planShipSafe ? 1 : 0) +
      0.2 * (verify.pass ? 1 : 0) +
      0.2 * (diagnosis.pass ? 1 : 0) +
      0.2 * (recovery.pass ? 1 : 0),
  );

  const dimensions: AgenticDimension[] = [
    {
      key: "completion",
      label: "Task completion",
      weight: AGENTIC_WEIGHTS.completion,
      score: round3(completionScore),
      points: Math.round(AGENTIC_WEIGHTS.completion * completionScore),
    },
    {
      key: "instruction",
      label: "Instruction precision",
      weight: AGENTIC_WEIGHTS.instruction,
      score: round3(instructionScore),
      points: Math.round(AGENTIC_WEIGHTS.instruction * instructionScore),
    },
    {
      key: "review",
      label: "Critical review",
      weight: AGENTIC_WEIGHTS.review,
      score: round3(reviewScore),
      points: Math.round(AGENTIC_WEIGHTS.review * reviewScore),
    },
    {
      key: "recovery",
      label: "Recovery",
      weight: AGENTIC_WEIGHTS.recovery,
      score: round3(recoveryScore),
      points: Math.round(AGENTIC_WEIGHTS.recovery * recoveryScore),
    },
  ];

  const total = dimensions.reduce((sum, dimension) => sum + dimension.points, 0);
  const verdict = verdictFor(total);

  return {
    total,
    verdict,
    feedback: feedbackFor(
      total,
      instruction,
      {
        unsafeCaught,
        unsafeTotal,
        safeKept,
        safeTotal,
        decisions,
      },
      verify,
      diagnosis,
      recovery,
    ),
    dimensions,
    detail: {
      instruction,
      plan: {
        unsafeCaught,
        unsafeTotal,
        safeKept,
        safeTotal,
        decisions,
      },
      verify,
      diagnosis,
      recovery,
    },
  };
}

/* ──────────────────────────────── storage ────────────────────────────────── */

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeAttempt(value: unknown): AgenticAttempt | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.scenarioId !== "string" || entry.scenarioId.length === 0) {
    return null;
  }
  if (typeof entry.at !== "string" || entry.at.length === 0) return null;
  const family = AGENTIC_FAMILIES.includes(entry.family as AgenticFamily)
    ? (entry.family as AgenticFamily)
    : "edge-case";
  const verdict = ["ready", "developing", "keep-practicing"].includes(
    entry.verdict as string,
  )
    ? (entry.verdict as AgenticVerdict)
    : "keep-practicing";
  const rawDimensions =
    entry.dimensions && typeof entry.dimensions === "object"
      ? (entry.dimensions as Record<string, unknown>)
      : {};
  return {
    id:
      typeof entry.id === "string" && entry.id.length > 0
        ? entry.id
        : `${entry.scenarioId}@${entry.at}`,
    scenarioId: entry.scenarioId,
    trackId: typeof entry.trackId === "string" ? entry.trackId : "",
    problemId: typeof entry.problemId === "string" ? entry.problemId : "",
    family,
    total: Math.max(0, Math.min(100, Math.round(numberOrZero(entry.total)))),
    verdict,
    dimensions: {
      completion: numberOrZero(rawDimensions.completion),
      instruction: numberOrZero(rawDimensions.instruction),
      review: numberOrZero(rawDimensions.review),
      recovery: numberOrZero(rawDimensions.recovery),
    },
    at: entry.at,
  };
}

export function parseAgenticAttempts(raw: string | null): AgenticAttempt[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeAttempt)
      .filter((attempt): attempt is AgenticAttempt => attempt !== null)
      .slice(-AGENTIC_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function persistAttempts(attempts: AgenticAttempt[]): void {
  writeRaw(AGENTIC_ROUND_STORAGE_KEY, JSON.stringify(attempts));
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(AGENTIC_ROUND_CHANGE_EVENT));
    }
  } catch {
    /* events unavailable — persistence already happened */
  }
}

export function getAgenticAttempts(): AgenticAttempt[] {
  return parseAgenticAttempts(readRaw(AGENTIC_ROUND_STORAGE_KEY));
}

export function getAgenticAttemptsFor(scenarioId: string): AgenticAttempt[] {
  return getAgenticAttempts().filter((attempt) => attempt.scenarioId === scenarioId);
}

export function getBestAgenticAttempt(
  scenarioId: string,
): AgenticAttempt | null {
  const attempts = getAgenticAttemptsFor(scenarioId);
  if (attempts.length === 0) return null;
  return attempts.reduce((best, attempt) => {
    if (attempt.total > best.total) return attempt;
    if (attempt.total === best.total && attempt.at > best.at) return attempt;
    return best;
  });
}

export function recordAgenticAttempt(
  input: AgenticAttemptInput,
): AgenticAttempt {
  const at = input.at ?? new Date().toISOString();
  const stored: AgenticAttempt = {
    id: `${input.scenarioId}@${at}`,
    scenarioId: input.scenarioId,
    trackId: input.trackId,
    problemId: input.problemId,
    family: input.family,
    total: Math.max(0, Math.min(100, Math.round(numberOrZero(input.total)))),
    verdict: input.verdict,
    dimensions: {
      completion: numberOrZero(input.dimensions.completion),
      instruction: numberOrZero(input.dimensions.instruction),
      review: numberOrZero(input.dimensions.review),
      recovery: numberOrZero(input.dimensions.recovery),
    },
    at,
  };
  const attempts = getAgenticAttempts();
  attempts.push(stored);
  persistAttempts(attempts.slice(-AGENTIC_HISTORY_LIMIT));
  return stored;
}

export function clearAgenticAttempts(): void {
  removeRaw(AGENTIC_ROUND_STORAGE_KEY);
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(AGENTIC_ROUND_CHANGE_EVENT));
    }
  } catch {
    /* ignore */
  }
}
