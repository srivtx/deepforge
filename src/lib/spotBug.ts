/**
 * F8 — Spot-the-Bug ("debug the AI").
 *
 * Takes a problem's verified solution and applies one categorized, seeded
 * mutation, producing a plausible buggy variant the learner must locate and
 * explain. Everything here is deterministic and offline: no model, no API
 * key, no network.
 *
 * The mutation is honest because the UI verifies it with real tests before
 * presenting it (the mutant must fail at least one original test). Problems
 * whose solutions cannot be mutated simply never generate a candidate, which
 * is how the mode hides itself.
 */

import type { Problem } from "@/types/problem";

export type BugCategory =
  | "off-by-one"
  | "swapped-operands"
  | "wrong-axis"
  | "missing-normalization"
  | "boundary-condition";

export const BUG_CATEGORIES: BugCategory[] = [
  "off-by-one",
  "swapped-operands",
  "wrong-axis",
  "missing-normalization",
  "boundary-condition",
];

export interface BugReasonGroup {
  label: string;
  patterns: string[];
}

interface BugCatalogEntry {
  label: string;
  /** Plain-language reason the mutation is wrong, revealed after scoring. */
  rationale: string;
  /** Concept groups a good "why" should touch; partial credit per group. */
  reasonGroups: BugReasonGroup[];
}

export const BUG_CATALOG: Record<BugCategory, BugCatalogEntry> = {
  "off-by-one": {
    label: "Off-by-one",
    rationale:
      "Off-by-one: the bound is shifted by one, so the first or last element is skipped or the loop steps one past the end.",
    reasonGroups: [
      { label: "the boundary", patterns: ["off by one", "boundary", "edge"] },
      { label: "index positions", patterns: ["index", "indices", "position"] },
      { label: "the length or range", patterns: ["length", "len", "range", "size", "count"] },
      { label: "a skipped or extra element", patterns: ["skip", "miss", "last", "first", "extra", "too many", "too few"] },
    ],
  },
  "swapped-operands": {
    label: "Swapped operands",
    rationale:
      "Swapped operands: the two sides of the subtraction are reversed, so the sign of the result flips.",
    reasonGroups: [
      { label: "the swap", patterns: ["swap", "swapped", "reversed", "backwards", "flipped", "order"] },
      { label: "subtraction", patterns: ["subtract", "subtraction", "minus", "difference", "sign"] },
      { label: "the two operands", patterns: ["operand", "operands", "arguments", "terms", "sides"] },
    ],
  },
  "wrong-axis": {
    label: "Wrong axis",
    rationale:
      "Wrong axis: rows and columns are transposed, so the code reads the wrong dimension.",
    reasonGroups: [
      { label: "rows and columns", patterns: ["axis", "axes", "row", "column", "col", "dimension"] },
      { label: "the transpose", patterns: ["transpose", "transposed", "swap", "swapped", "flipped", "reversed"] },
      { label: "the indices", patterns: ["index", "indices", "matrix", "grid", "shape"] },
    ],
  },
  "missing-normalization": {
    label: "Missing normalization",
    rationale:
      "Missing normalization: a scaling step was dropped, so the result is not divided by the right total.",
    reasonGroups: [
      { label: "normalization", patterns: ["normalize", "normalise", "normalization", "scale", "scaling"] },
      { label: "division", patterns: ["divide", "division", "ratio", "fraction", "proportion", "average", "mean"] },
      { label: "the denominator", patterns: ["sum", "total", "length", "count", "n", "len"] },
    ],
  },
  "boundary-condition": {
    label: "Boundary condition",
    rationale:
      "Boundary condition: the comparison changed between inclusive and exclusive, so one edge case behaves differently.",
    reasonGroups: [
      { label: "the boundary", patterns: ["boundary", "edge", "inclusive", "exclusive", "strict"] },
      { label: "the comparison", patterns: ["comparison", "compare", "condition", "check", "equal"] },
      { label: "the affected edge", patterns: ["last", "first", "endpoint", "limit", "range", "one"] },
    ],
  },
};

export interface BugMutant {
  id: string;
  problemId: string;
  category: BugCategory;
  /** Category label for the reveal. */
  label: string;
  /** Full mutated source. */
  code: string;
  /** 0-based index of the mutated line inside `code`. */
  lineIndex: number;
  /** 1-based line number for display. */
  lineNumber: number;
  /** Statement lines (0-based, inclusive) the mutated line belongs to. */
  span: [number, number];
  originalLine: string;
  mutatedLine: string;
  /** Why the mutant is wrong, shown only after the learner locks in. */
  rationale: string;
}

export interface BugAnswer {
  /** 1-based line number the learner picked. */
  line: number;
  /** Free-text "why" in the learner's own words. */
  reason: string;
}

export type BugVerdict = "nailed-it" | "close" | "not-yet";

export interface BugScore {
  /** 1 exact line, 0.6 inside the mutated statement, 0 otherwise. */
  lineScore: number;
  /** Fraction of expected reason concepts covered, 0..1. */
  reasonScore: number;
  /** 0..100 deterministic score. */
  total: number;
  verdict: BugVerdict;
  lineCorrect: boolean;
  lineNear: boolean;
  matched: string[];
  missed: string[];
}

/* ───────────────────────────── deterministic seed ────────────────────────── */

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rotate<T>(list: T[], by: number): T[] {
  if (list.length === 0) return [];
  const offset = ((by % list.length) + list.length) % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
}

/* ───────────────────────────── mutation finders ──────────────────────────── */

function replaceFirst(line: string, needle: string, replacement: string): string {
  const index = line.indexOf(needle);
  if (index === -1) return line;
  return line.slice(0, index) + replacement + line.slice(index + needle.length);
}

function offByOneCandidates(line: string): string[] {
  const out: string[] = [];
  const rangeLen = line.match(/range\(\s*len\((\w+)\)\s*\)/);
  if (rangeLen) {
    out.push(line.replace(rangeLen[0], `range(len(${rangeLen[1]}) - 1)`));
    out.push(line.replace(rangeLen[0], `range(len(${rangeLen[1]}) + 1)`));
  }
  const lenMinusOne = line.match(/len\((\w+)\)\s*-\s*1/);
  if (lenMinusOne) {
    out.push(line.replace(lenMinusOne[0], `len(${lenMinusOne[1]})`));
  }
  if (/\bmid\b/.test(line) && /\/\/\s*2/.test(line)) {
    out.push(line.replace(/\/\/\s*2/, "// 2 + 1"));
  }
  return out;
}

function swappedOperandCandidates(line: string): string[] {
  const match = line.match(
    /(^|[^\w-])([A-Za-z_]\w*(?:\[[^\]]+\])?)\s*-\s*([A-Za-z_]\w*(?:\[[^\]]+\])?)/,
  );
  if (!match || match[2] === match[3]) return [];
  return [`${match[1]}${match[3]} - ${match[2]}`];
}

function wrongAxisCandidates(line: string): string[] {
  const out: string[] = [];
  const two = line.match(
    /\b([A-Za-z_]\w*)\[([^[\]]{1,24})\]\[([^[\]]{1,24})\]/,
  );
  if (two && two[2] !== two[3]) {
    out.push(line.replace(two[0], `${two[1]}[${two[3]}][${two[2]}]`));
  }
  const shape = line.match(/range\(\s*len\(\s*(\w+)\s*\[\s*0\s*\]\s*\)\s*\)/);
  if (shape) {
    out.push(line.replace(shape[0], `range(len(${shape[1]}))`));
  }
  return out;
}

const NORMALIZE_DIVISORS =
  /^(len\([^()]*\)|[nN]|count|counts|total|size|length|denom|denominator|num|m)$/;

function missingNormalizationCandidates(line: string): string[] {
  const match = line.match(
    /([A-Za-z_][\w.[\]]*(?:\([^()]*\))?)\s*\/\s*([A-Za-z_]\w*(?:\([^()]*\))?)/,
  );
  if (!match || match.index === undefined) return [];
  if (!NORMALIZE_DIVISORS.test(match[2].trim())) return [];
  const replaced = `${line.slice(0, match.index)}${match[1]}${line.slice(match.index + match[0].length)}`;
  return [replaced];
}

function boundaryCandidates(line: string): string[] {
  const out: string[] = [];
  const skipFirst = line.match(/range\(\s*1\s*,\s*len\((\w+)\)\s*\)/);
  if (skipFirst) {
    out.push(line.replace(skipFirst[0], `range(len(${skipFirst[1]}))`));
  }
  if (line.includes("<=")) out.push(replaceFirst(line, "<=", "<"));
  if (line.includes(">=")) out.push(replaceFirst(line, ">=", ">"));
  if (/[^<>=!-]</.test(line) && !line.includes("<=")) {
    out.push(replaceFirst(line, "<", "<="));
  }
  if (/[^<>=!-]>/.test(line) && !line.includes(">=")) {
    out.push(replaceFirst(line, ">", ">="));
  }
  return out;
}

/* ─────────────────────────── statement + assembly ────────────────────────── */

function bracketBalance(line: string): number {
  let balance = 0;
  for (const char of line) {
    if (char === "(" || char === "[" || char === "{") balance += 1;
    else if (char === ")" || char === "]" || char === "}") balance -= 1;
  }
  return balance;
}

/** The full statement containing `index`, including wrapped continuation lines. */
function statementSpan(lines: string[], index: number): [number, number] {
  let start = index;
  let openBefore = 0;
  for (let i = 0; i < index; i += 1) openBefore += bracketBalance(lines[i]);
  while (start > 0 && openBefore > 0) {
    start -= 1;
    openBefore -= bracketBalance(lines[start]);
    if (openBefore <= 0) break;
  }
  let end = index;
  let balance = 0;
  for (let i = start; i <= index; i += 1) balance += bracketBalance(lines[i]);
  while (end + 1 < lines.length && balance > 0) {
    end += 1;
    balance += bracketBalance(lines[end]);
  }
  return [start, end];
}

interface Candidate {
  category: BugCategory;
  lineIndex: number;
  mutatedLine: string;
}

function buildMutant(
  problemId: string,
  lines: string[],
  candidate: Candidate,
): BugMutant {
  const code = [...lines];
  code[candidate.lineIndex] = candidate.mutatedLine;
  const catalog = BUG_CATALOG[candidate.category];
  return {
    id: `${problemId}:${candidate.category}:${candidate.lineIndex + 1}:${hashString(candidate.mutatedLine)}`,
    problemId,
    category: candidate.category,
    label: catalog.label,
    code: code.join("\n"),
    lineIndex: candidate.lineIndex,
    lineNumber: candidate.lineIndex + 1,
    span: statementSpan(lines, candidate.lineIndex),
    originalLine: lines[candidate.lineIndex],
    mutatedLine: candidate.mutatedLine,
    rationale: catalog.rationale,
  };
}

/**
 * Deterministic candidates for a problem's solution, interleaved by category
 * and rotated by a seed derived from the problem id. Returns [] when the
 * solution cannot be mutated — the caller hides the mode in that case.
 */
export function generateBugMutants(
  problem: Pick<Problem, "id" | "solution">,
  options: { seed?: number; limit?: number } = {},
): BugMutant[] {
  const lines = problem.solution.split("\n");
  const buckets = new Map<BugCategory, Candidate[]>();
  const seen = new Set<string>();
  const push = (
    category: BugCategory,
    lineIndex: number,
    mutatedLine: string,
  ) => {
    if (mutatedLine === lines[lineIndex]) return;
    const key = `${category}:${lineIndex}:${mutatedLine}`;
    if (seen.has(key)) return;
    seen.add(key);
    const list = buckets.get(category) ?? [];
    list.push({ category, lineIndex, mutatedLine });
    buckets.set(category, list);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    if (/^(def|class|@|from |import )/.test(trimmed)) return;
    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) return;
    for (const mutated of offByOneCandidates(line)) {
      push("off-by-one", index, mutated);
    }
    for (const mutated of swappedOperandCandidates(line)) {
      push("swapped-operands", index, mutated);
    }
    for (const mutated of wrongAxisCandidates(line)) {
      push("wrong-axis", index, mutated);
    }
    for (const mutated of missingNormalizationCandidates(line)) {
      push("missing-normalization", index, mutated);
    }
    for (const mutated of boundaryCandidates(line)) {
      push("boundary-condition", index, mutated);
    }
  });

  const seed = Math.trunc(options.seed ?? hashString(problem.id));
  const limit = Math.max(1, Math.trunc(options.limit ?? 8));
  const order = rotate(BUG_CATEGORIES, seed % BUG_CATEGORIES.length);
  const queues = new Map<BugCategory, Candidate[]>();
  for (const category of BUG_CATEGORIES) {
    const list = buckets.get(category) ?? [];
    queues.set(category, rotate(list, list.length > 0 ? (seed >>> 5) % list.length : 0));
  }

  const interleaved: Candidate[] = [];
  let added = true;
  while (added && interleaved.length < limit) {
    added = false;
    for (const category of order) {
      if (interleaved.length >= limit) break;
      const next = (queues.get(category) ?? []).shift();
      if (next) {
        interleaved.push(next);
        added = true;
      }
    }
  }
  return interleaved.map((candidate) => buildMutant(problem.id, lines, candidate));
}

/** Static eligibility — the UI additionally verifies with real tests. */
export function canSpotTheBug(
  problem: Pick<Problem, "id" | "solution">,
): boolean {
  return generateBugMutants(problem, { limit: 1 }).length > 0;
}

/* ───────────────────────────────── scoring ───────────────────────────────── */

function normalizeReason(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function stem(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith("ization")) return `${w.slice(0, -7)}ize`;
  if (w.endsWith("isation")) return `${w.slice(0, -7)}ise`;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  return w;
}

function groupMatches(
  group: BugReasonGroup,
  normalized: string,
  tokenStems: Set<string>,
): boolean {
  return group.patterns.some((pattern) => {
    const p = pattern.toLowerCase().trim();
    return p.includes(" ")
      ? normalized.includes(` ${p} `)
      : tokenStems.has(stem(p));
  });
}

/** Deterministic scoring against the mutation record. */
export function scoreBugAnswer(mutant: BugMutant, answer: BugAnswer): BugScore {
  const picked = Math.trunc(answer.line) - 1;
  const [start, end] = mutant.span;
  const lineScore =
    picked === mutant.lineIndex
      ? 1
      : picked >= start && picked <= end
        ? 0.6
        : 0;
  const normalized = normalizeReason(answer.reason);
  const tokenStems = new Set(
    normalized.split(" ").filter((token) => token.length > 0).map(stem),
  );
  const groups = BUG_CATALOG[mutant.category].reasonGroups;
  const matched: string[] = [];
  const missed: string[] = [];
  for (const group of groups) {
    if (groupMatches(group, normalized, tokenStems)) matched.push(group.label);
    else missed.push(group.label);
  }
  const reasonScore = groups.length === 0 ? 0 : matched.length / groups.length;
  const total = Math.round(100 * (0.6 * lineScore + 0.4 * reasonScore));
  const verdict: BugVerdict =
    total >= 80 ? "nailed-it" : total >= 50 ? "close" : "not-yet";
  return {
    lineScore,
    reasonScore: Number(reasonScore.toFixed(3)),
    total,
    verdict,
    lineCorrect: lineScore === 1,
    lineNear: lineScore === 0.6,
    matched,
    missed,
  };
}
