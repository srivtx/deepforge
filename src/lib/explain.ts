/**
 * F7 — Self-Explanation Gate ("Feynman mode").
 *
 * After a solve, the learner explains the key step in their own words before
 * the final celebration and the next action. Grading is fully deterministic:
 * per-category concept keywords plus structural checks, and a reasoning
 * completeness score. No model, no network, no API key.
 *
 * Persistence follows the repo's local-first store seam. The shared `StoreId`
 * union is sealed (see `avatars.ts`), so this module uses the same hygiene as
 * `createStore`: `readRaw`/`writeRaw`, validated parsing, and a same-tab
 * `deepforge:explanation-change` CustomEvent. Adding `"explanations"` to
 * `StoreId` is the one-line change that turns remote sync on later.
 */

import { readRaw, removeRaw, writeRaw } from "@/lib/sync/localAdapter";
import type { Category, Problem } from "@/types/problem";

export const EXPLANATION_STORAGE_KEY = "deepforge:explanations:v1";
export const EXPLANATION_CHANGE_EVENT = "deepforge:explanation-change";
export const EXPLAIN_PREFS_KEY = "deepforge:explain-prefs:v1";
export const EXPLANATION_HISTORY_LIMIT = 20;

/** Everything the rubric needs from a problem — kept narrow for tests. */
export type ExplainProblem = Pick<
  Problem,
  "id" | "title" | "description" | "category"
>;

/* ─────────────────────────────── rubric types ───────────────────────────── */

export interface RubricItem {
  /** Stable id, e.g. `structure:iterate` or `term:median`. */
  id: string;
  kind: "concept" | "structure";
  /** Short human label for positive feedback. */
  label: string;
  /** Question-shaped prompt shown when the item was not covered. */
  question: string;
  /** Alternatives that count as a hit (single words match by stem). */
  patterns: string[];
}

export interface ExplainRubric {
  problemId: string;
  items: RubricItem[];
}

export interface ExplainGap {
  id: string;
  label: string;
  question: string;
}

export type ExplainBand = "thin" | "developing" | "solid";

export interface ExplainGrade {
  /** Required rubric items covered, 0..1. */
  coverage: number;
  /** Length + causal language + specificity, 0..1. */
  completeness: number;
  /** Combined score, 0..1. */
  score: number;
  /** Matched rubric item ids. */
  hits: string[];
  /** Uncovered items, phrased as questions. */
  gaps: ExplainGap[];
  words: number;
  band: ExplainBand;
  /** Kind, first-principles summary — never a grade, never "wrong". */
  feedback: string;
}

/* ────────────────────────────── token helpers ───────────────────────────── */

const STOPWORDS = new Set([
  "a", "about", "all", "also", "an", "and", "any", "are", "as", "at", "be",
  "best", "but", "by", "can", "could", "did", "do", "does", "for", "from",
  "get", "give", "good", "help", "how", "i", "in", "into", "is", "it", "its",
  "just", "like", "me", "my", "need", "of", "on", "or", "our", "please",
  "should", "show", "so", "some", "tell", "than", "that", "the", "their",
  "them", "then", "there", "these", "this", "to", "us", "want", "was", "we",
  "what", "when", "which", "who", "why", "will", "with", "would", "you",
  "your",
]);

/** Filler words that carry no concept signal in a problem statement. */
const GENERIC_TERMS = new Set([
  "return", "returns", "given", "write", "implement", "computes", "compute",
  "function", "functions", "list", "value", "values", "element", "elements",
  "array", "arrays", "input", "inputs", "output", "outputs", "number",
  "numbers", "using", "use", "make", "makes", "calculate", "build", "find",
  "first", "second", "simple", "standard", "small", "large", "result",
  "results", "example", "examples", "case", "cases", "test", "tests", "note",
  "notes", "zero", "one", "two", "each", "every", "same", "different",
]);

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9+#]+/g);
  if (!matches) return [];
  return matches.filter((token) => !STOPWORDS.has(token));
}

/** Tiny suffix stemmer so "normalization" matches "normalize". */
function stem(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith("ization")) return `${w.slice(0, -7)}ize`;
  if (w.endsWith("isation")) return `${w.slice(0, -7)}ise`;
  if (w.endsWith("ations")) return w.slice(0, -6);
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  return w;
}

function normalizeText(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function itemMatches(item: RubricItem, text: string, tokens: string[]): boolean {
  const normalized = normalizeText(text);
  const tokenStems = new Set(tokens.map(stem));
  for (const pattern of item.patterns) {
    const p = pattern.toLowerCase().replace(/\s+/g, " ").trim();
    if (p.includes(" ")) {
      if (normalized.includes(` ${p} `)) return true;
    } else if (tokenStems.has(stem(p))) {
      return true;
    }
  }
  return false;
}

/* ─────────────────────────── category rubric data ────────────────────────── */

interface ConceptSeed {
  label: string;
  question: string;
  patterns: string[];
}

/**
 * Two canonical concepts per category. Patterns are lenient on purpose —
 * the gate is a nudge toward generative processing, not a vocabulary quiz.
 */
const CATEGORY_CONCEPTS: Record<Category, ConceptSeed[]> = {
  "Linear Algebra": [
    {
      label: "shape and indices",
      question: "Could you say which index is a row and which is a column?",
      patterns: ["matrix", "matrices", "shape", "dimension", "dimensions"],
    },
    {
      label: "entry-by-entry work",
      question: "Could you describe what happens at a single entry of the result?",
      patterns: ["row", "rows", "column", "columns", "entry", "entries", "position"],
    },
  ],
  Calculus: [
    {
      label: "derivative or integral",
      question: "Could you name the derivative, integral, or rate of change you are computing?",
      patterns: ["derivative", "derivatives", "integral", "slope", "rate of change", "gradient"],
    },
    {
      label: "limits and small steps",
      question: "Could you say why a small step or limit is the right approximation?",
      patterns: ["limit", "small step", "step size", "approximation", "approximate", "infinitesimal"],
    },
  ],
  Statistics: [
    {
      label: "center of the data",
      question: "Could you say what the mean or central value represents here?",
      patterns: ["mean", "average", "center", "central", "expected value"],
    },
    {
      label: "spread around the center",
      question: "Could you say how you measure spread — variance, deviation, or standard deviation?",
      patterns: ["variance", "deviation", "spread", "standard deviation", "dispersion"],
    },
  ],
  Probability: [
    {
      label: "likelihood of an event",
      question: "Could you say what event you are measuring the likelihood of?",
      patterns: ["probability", "likelihood", "chance", "odds"],
    },
    {
      label: "counting or summing outcomes",
      question: "Could you say what you are counting or summing over?",
      patterns: ["count", "counts", "sum", "total", "outcomes", "sample space"],
    },
  ],
  "ML Fundamentals": [
    {
      label: "loss or objective",
      question: "Could you say what quantity the model is trying to improve?",
      patterns: ["loss", "cost", "error", "objective", "residual"],
    },
    {
      label: "gradient and update",
      question: "Could you say which direction the parameters move and why?",
      patterns: ["gradient", "update", "learn", "fit", "parameter", "weight", "weights"],
    },
  ],
  "Deep Learning": [
    {
      label: "forward pass",
      question: "Could you walk through the forward pass, layer by layer?",
      patterns: ["forward", "forward pass", "activation", "layer", "layers"],
    },
    {
      label: "backward pass",
      question: "Could you say how the gradient flows backward through the chain rule?",
      patterns: ["backward", "backprop", "backpropagation", "gradient", "chain rule"],
    },
  ],
  NLP: [
    {
      label: "tokens or vocabulary",
      question: "Could you say how the text becomes tokens or vocabulary entries?",
      patterns: ["token", "tokens", "word", "words", "vocabulary", "vocab"],
    },
    {
      label: "counts and frequencies",
      question: "Could you say what you count and how the counts become the answer?",
      patterns: ["count", "counts", "frequency", "frequencies", "probability"],
    },
  ],
  Optimization: [
    {
      label: "direction of improvement",
      question: "Could you say which direction reduces the objective?",
      patterns: ["gradient", "direction", "slope", "descent", "ascent"],
    },
    {
      label: "step size and convergence",
      question: "Could you say how the step size affects getting closer to the optimum?",
      patterns: ["step", "step size", "learning rate", "converge", "convergence"],
    },
  ],
  Algorithms: [
    {
      label: "position or pointer",
      question: "Could you say what each pointer or index marks at the start and as it moves?",
      patterns: ["index", "indices", "pointer", "pointers", "range", "offset", "boundary"],
    },
    {
      label: "the repeating step",
      question: "Could you describe what one pass through the loop does?",
      patterns: ["loop", "iterate", "iteration", "step", "search", "compare"],
    },
  ],
  "Data Structures": [
    {
      label: "the invariant",
      question: "Could you say what property stays true after every operation?",
      patterns: ["invariant", "stays true", "property", "order", "ordered", "sorted"],
    },
    {
      label: "the operations",
      question: "Could you say what changes on an insert, delete, or access?",
      patterns: ["insert", "delete", "remove", "append", "push", "pop", "pointer", "reference"],
    },
  ],
  "Computer Vision": [
    {
      label: "pixels and intensity",
      question: "Could you say what a single pixel value means here?",
      patterns: ["pixel", "pixels", "intensity", "channel", "channels"],
    },
    {
      label: "the sliding window",
      question: "Could you say how the kernel or window moves over the image?",
      patterns: ["kernel", "window", "filter", "slide", "sliding", "convolve", "convolution"],
    },
  ],
  "Reinforcement Learning": [
    {
      label: "states and actions",
      question: "Could you say what the states and actions are in this problem?",
      patterns: ["state", "states", "action", "actions", "policy"],
    },
    {
      label: "reward and value",
      question: "Could you say how reward shapes the values being updated?",
      patterns: ["reward", "rewards", "value", "values", "discount", "bellman"],
    },
  ],
  "Time Series": [
    {
      label: "lags and history",
      question: "Could you say what a lag means in this sequence?",
      patterns: ["lag", "lags", "previous", "history", "past"],
    },
    {
      label: "the moving window",
      question: "Could you say how the window or difference moves along time?",
      patterns: ["window", "rolling", "moving", "difference", "trend", "forecast"],
    },
  ],
  "Graph Algorithms": [
    {
      label: "nodes and edges",
      question: "Could you say what the nodes and edges represent?",
      patterns: ["node", "nodes", "vertex", "vertices", "edge", "edges", "graph"],
    },
    {
      label: "the traversal order",
      question: "Could you say why the walk visits things in this order?",
      patterns: ["visited", "visit", "queue", "stack", "traverse", "path", "distance"],
    },
  ],
  "Information Theory": [
    {
      label: "probability and surprise",
      question: "Could you say how probability connects to surprise or information?",
      patterns: ["probability", "surprise", "information", "uncertainty"],
    },
    {
      label: "logs and bits",
      question: "Could you say why a logarithm (or bits) appears in the formula?",
      patterns: ["log", "logarithm", "bits", "base 2", "entropy"],
    },
  ],
};

type StructureCheck = ConceptSeed;

/** Shared structural checks; each category requires two or three of them. */
const STRUCTURE_CHECKS: Record<string, StructureCheck> = {
  iterate: {
    label: "the repeating step",
    question: "Could you say what happens on each pass through the loop?",
    patterns: ["loop", "loops", "iterate", "iterates", "iteration", "scan", "walk", "repeat", "each element", "pass"],
  },
  return: {
    label: "what the function gives back",
    question: "Could you say what the function returns and why that is the answer?",
    patterns: ["return", "returns", "output", "result", "produces", "gives back", "answer"],
  },
  edge: {
    label: "empty and edge inputs",
    question: "Could you say what happens for an empty, single, or boundary input?",
    patterns: ["empty", "none", "null", "single element", "one element", "length 1", "duplicate", "duplicates", "boundary", "base case", "edge case", "negative", "out of range"],
  },
  formula: {
    label: "the formula being implemented",
    question: "Could you write out the formula or definition the code follows?",
    patterns: ["formula", "definition", "equation", "expression", "term", "terms"],
  },
  shape: {
    label: "shapes and indices",
    question: "Could you say which shape or index the code tracks?",
    patterns: ["shape", "dimension", "dimensions", "index", "indices", "axis", "axes"],
  },
  count: {
    label: "what is counted or summed",
    question: "Could you say what is counted, summed, or accumulated?",
    patterns: ["count", "counts", "sum", "total", "accumulate", "frequency"],
  },
  normalize: {
    label: "scaling or normalizing",
    question: "Could you say how the values are scaled or divided to a total?",
    patterns: ["normalize", "normalise", "normalization", "scale", "scaling", "divide", "division", "proportion", "fraction", "average", "ratio"],
  },
  update: {
    label: "the update rule",
    question: "Could you say what the update rule changes and by how much?",
    patterns: ["update", "updates", "step", "learning rate", "move", "direction", "adjust"],
  },
  invariant: {
    label: "the invariant",
    question: "Could you say what stays true as the structure changes?",
    patterns: ["invariant", "stays true", "always", "property", "order", "sorted"],
  },
  tokenize: {
    label: "splitting and counting text",
    question: "Could you say how the text is split into tokens or words?",
    patterns: ["token", "tokens", "split", "word", "words", "vocabulary", "vocab"],
  },
  window: {
    label: "the sliding window",
    question: "Could you say how the window, kernel, or filter moves?",
    patterns: ["window", "kernel", "filter", "slide", "sliding", "neighborhood", "patch"],
  },
  reward: {
    label: "reward driving the update",
    question: "Could you say how reward or value drives the change?",
    patterns: ["reward", "value", "discount", "bellman", "policy", "action"],
  },
  lag: {
    label: "lags and history",
    question: "Could you say what a lag or previous value means here?",
    patterns: ["lag", "lags", "previous", "history", "past", "change"],
  },
  traverse: {
    label: "the traversal order",
    question: "Could you say how the walk visits nodes and why in that order?",
    patterns: ["traverse", "visit", "visited", "queue", "stack", "path", "neighbor", "neighbour"],
  },
  entropy: {
    label: "logs and uncertainty",
    question: "Could you say how probability and the logarithm combine here?",
    patterns: ["log", "logarithm", "probability", "uncertainty", "surprise", "bits", "distribution"],
  },
  why: {
    label: "the reason it works",
    question: "Could you connect the steps with a \"because\" — why does this give the right answer?",
    patterns: ["because", "since", "so that", "therefore", "thus", "hence", "which means", "the reason", "as a result"],
  },
};

const CATEGORY_STRUCTURES: Record<Category, string[]> = {
  "Linear Algebra": ["shape", "why"],
  Calculus: ["formula", "why"],
  Statistics: ["count", "normalize"],
  Probability: ["count", "normalize"],
  "ML Fundamentals": ["update", "why"],
  "Deep Learning": ["update", "why"],
  NLP: ["tokenize", "count"],
  Optimization: ["update", "why"],
  Algorithms: ["iterate", "return", "edge"],
  "Data Structures": ["invariant", "iterate"],
  "Computer Vision": ["window", "shape"],
  "Reinforcement Learning": ["reward", "update"],
  "Time Series": ["lag", "window"],
  "Graph Algorithms": ["traverse", "edge"],
  "Information Theory": ["entropy", "count"],
};

/* ────────────────────────────── rubric build ─────────────────────────────── */

function topProblemTerms(problem: ExplainProblem): string[] {
  const titleTokens = tokenize(problem.title);
  const descTokens = tokenize(problem.description);
  const categoryStems = new Set(
    CATEGORY_CONCEPTS[problem.category]
      .flatMap((concept) => concept.patterns)
      .flatMap((pattern) => tokenize(pattern))
      .map(stem),
  );
  const counts = new Map<string, { count: number; first: number }>();
  const ranked: string[] = [];
  // The title is weighted by listing it twice; `first` is the true position.
  const ordered = [...titleTokens, ...titleTokens, ...descTokens];
  ordered.forEach((token, index) => {
    const entry = counts.get(token);
    if (entry) entry.count += 1;
    else counts.set(token, { count: 1, first: index });
  });
  for (const token of counts.keys()) {
    if (token.length < 3) continue;
    if (GENERIC_TERMS.has(token)) continue;
    if (categoryStems.has(stem(token))) continue;
    ranked.push(token);
  }
  ranked.sort((a, b) => {
    const ca = counts.get(a);
    const cb = counts.get(b);
    return (cb?.count ?? 0) - (ca?.count ?? 0) || (ca?.first ?? 0) - (cb?.first ?? 0);
  });
  return ranked.slice(0, 2);
}

export function buildExplainRubric(problem: ExplainProblem): ExplainRubric {
  const items: RubricItem[] = [];
  for (const term of topProblemTerms(problem)) {
    items.push({
      id: `term:${term}`,
      kind: "concept",
      label: `the idea of "${term}"`,
      question: `Could you bring in the idea of "${term}"?`,
      patterns: [term],
    });
  }
  CATEGORY_CONCEPTS[problem.category].forEach((concept, index) => {
    items.push({
      id: `category:${slug(problem.category)}:${index}`,
      kind: "concept",
      label: concept.label,
      question: concept.question,
      patterns: concept.patterns,
    });
  });
  for (const checkId of CATEGORY_STRUCTURES[problem.category]) {
    const check = STRUCTURE_CHECKS[checkId];
    items.push({
      id: `structure:${checkId}`,
      kind: "structure",
      label: check.label,
      question: check.question,
      patterns: check.patterns,
    });
  }
  return { problemId: problem.id, items };
}

/* ──────────────────────────────── grading ────────────────────────────────── */

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function gradeExplanation(
  problem: ExplainProblem,
  text: string,
): ExplainGrade {
  const rubric = buildExplainRubric(problem);
  const trimmed = text.trim();
  const tokens = tokenize(trimmed);
  const hits: string[] = [];
  for (const item of rubric.items) {
    if (itemMatches(item, trimmed, tokens)) hits.push(item.id);
  }
  const coverage = rubric.items.length === 0 ? 0 : hits.length / rubric.items.length;

  const lengthScore = clamp01(tokens.length / 40);
  const causal = /\b(because|since|so that|therefore|thus|hence|which means|the reason|as a result)\b/i.test(
    trimmed,
  );
  const specificity = clamp01(hits.length / Math.min(4, rubric.items.length || 4));
  const completeness = clamp01(
    0.45 * lengthScore + 0.35 * (causal ? 1 : 0) + 0.2 * specificity,
  );
  const score = clamp01(0.65 * coverage + 0.35 * completeness);

  const gaps: ExplainGap[] = rubric.items
    .filter((item) => !hits.includes(item.id))
    .map((item) => ({ id: item.id, label: item.label, question: item.question }));

  const band: ExplainBand =
    score >= 0.62 ? "solid" : score >= 0.32 ? "developing" : "thin";
  const feedback =
    band === "solid"
      ? "That is a real explanation — it walks through the steps and says why they work."
      : band === "developing"
        ? "Good start. One or two more details and this becomes a complete explanation."
        : "You have made a start. Add what the code does step by step, and why that gives the right answer.";

  return {
    coverage: Number(coverage.toFixed(3)),
    completeness: Number(completeness.toFixed(3)),
    score: Number(score.toFixed(3)),
    hits,
    gaps,
    words: tokens.length,
    band,
    feedback,
  };
}

/* ──────────────────────────────── storage ────────────────────────────────── */

export interface ExplanationEntry {
  text: string;
  /** ISO timestamp. */
  at: string;
  coverage: number;
  completeness: number;
  score: number;
  hits: string[];
  /** True when the learner chose to skip the gate (allowed, but marked). */
  skipped: boolean;
}

export type ExplanationMap = Record<string, ExplanationEntry[]>;

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeEntry(value: unknown): ExplanationEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.at !== "string" || entry.at.length === 0) return null;
  return {
    text: typeof entry.text === "string" ? entry.text : "",
    at: entry.at,
    coverage: numberOrZero(entry.coverage),
    completeness: numberOrZero(entry.completeness),
    score: numberOrZero(entry.score),
    hits: Array.isArray(entry.hits)
      ? entry.hits.filter((hit): hit is string => typeof hit === "string")
      : [],
    skipped: entry.skipped === true,
  };
}

function parseExplanations(raw: string | null): ExplanationMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const map: ExplanationMap = {};
    for (const [problemId, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!Array.isArray(value)) continue;
      const entries = value
        .map(normalizeEntry)
        .filter((entry): entry is ExplanationEntry => entry !== null)
        .slice(-EXPLANATION_HISTORY_LIMIT);
      if (entries.length > 0) map[problemId] = entries;
    }
    return map;
  } catch {
    return {};
  }
}

function persist(map: ExplanationMap): void {
  writeRaw(EXPLANATION_STORAGE_KEY, JSON.stringify(map));
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(EXPLANATION_CHANGE_EVENT));
    }
  } catch {
    /* events unavailable — persistence already happened */
  }
}

export function getExplanations(): ExplanationMap {
  return parseExplanations(readRaw(EXPLANATION_STORAGE_KEY));
}

export function getExplanationsFor(problemId: string): ExplanationEntry[] {
  return getExplanations()[problemId] ?? [];
}

export function getLatestExplanation(problemId: string): ExplanationEntry | null {
  const entries = getExplanationsFor(problemId);
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

/** True once an entry exists — including a marked skip. */
export function hasExplained(problemId: string): boolean {
  return getLatestExplanation(problemId) !== null;
}

export function recordExplanation(
  problemId: string,
  text: string,
  grade: Pick<ExplainGrade, "coverage" | "completeness" | "score" | "hits">,
): ExplanationEntry {
  const entry: ExplanationEntry = {
    text: text.trim(),
    at: new Date().toISOString(),
    coverage: numberOrZero(grade.coverage),
    completeness: numberOrZero(grade.completeness),
    score: numberOrZero(grade.score),
    hits: [...grade.hits],
    skipped: false,
  };
  const map = getExplanations();
  map[problemId] = [...(map[problemId] ?? []), entry].slice(
    -EXPLANATION_HISTORY_LIMIT,
  );
  persist(map);
  return entry;
}

/** Skips are allowed; they are stored so the moment is marked, not erased. */
export function recordSkip(problemId: string): ExplanationEntry {
  const entry: ExplanationEntry = {
    text: "",
    at: new Date().toISOString(),
    coverage: 0,
    completeness: 0,
    score: 0,
    hits: [],
    skipped: true,
  };
  const map = getExplanations();
  map[problemId] = [...(map[problemId] ?? []), entry].slice(
    -EXPLANATION_HISTORY_LIMIT,
  );
  persist(map);
  return entry;
}

export function clearExplanations(): void {
  removeRaw(EXPLANATION_STORAGE_KEY);
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(EXPLANATION_CHANGE_EVENT));
    }
  } catch {
    /* ignore */
  }
}

/* ───────────────────────────────── prefs ─────────────────────────────────── */

interface ExplainPrefs {
  enabled: boolean;
}

function parsePrefs(raw: string | null): ExplainPrefs {
  if (!raw) return { enabled: true };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { enabled: true };
    }
    const value = parsed as Record<string, unknown>;
    return { enabled: value.enabled !== false };
  } catch {
    return { enabled: true };
  }
}

/** Opt-out gate: the prompt appears by default and can be turned off. */
export function isExplainEnabled(): boolean {
  return parsePrefs(readRaw(EXPLAIN_PREFS_KEY)).enabled;
}

export function setExplainEnabled(enabled: boolean): void {
  writeRaw(EXPLAIN_PREFS_KEY, JSON.stringify({ enabled }));
}
