/**
 * Community problem submissions ("Submit a Problem").
 *
 * Drafts live in localStorage and are validated locally with the exact same
 * Pyodide harness the app uses to judge problems, so an author can be sure
 * their cases pass before pasting the exported TS into the repo. There is no
 * backend — this is a deliberate honor-system, browser-only authoring tool.
 */

import { CATEGORIES } from "@/data/problems/meta";
import {
  extractFuncName,
  loadPyodideOnce,
  runTests,
  type TestResult,
} from "@/lib/pyodide";
import type { Category, Difficulty, TestCase } from "@/types/problem";

const STORAGE_KEY = "deepforge:submissions:v1";

export const SUBMISSIONS_CHANGE_EVENT = "deepforge:submissions-change";

/** One test case while it is still raw JSON text in the editor. */
export interface DraftTestCase {
  /** JSON text for the positional argument array, e.g. "[[1, 2], 3]". */
  input: string;
  /** JSON text for the expected return value, e.g. "[2, 5]". */
  expected: string;
}

export interface SubmissionDraft {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  description: string;
  starterCode: string;
  solution: string;
  testCases: DraftTestCase[];
  hint?: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "validated";
}

export interface DraftValidation {
  errors: string[];
  warnings: string[];
}

export interface DraftRunResult {
  ok: boolean;
  results: TestResult[];
  error?: string;
}

interface SubmissionsBackup {
  app: "deepforge-submissions";
  version: 1;
  exportedAt: string;
  drafts: SubmissionDraft[];
}

const CATEGORY_PREFIX: Record<Category, string> = {
  "Linear Algebra": "la",
  Calculus: "ca",
  Statistics: "st",
  Probability: "pr",
  "ML Fundamentals": "ml",
  "Deep Learning": "dl",
  NLP: "nlp",
  Optimization: "op",
  Algorithms: "al",
  "Data Structures": "ds",
  "Computer Vision": "cv",
  "Reinforcement Learning": "rl",
  "Time Series": "ts",
  "Graph Algorithms": "graph",
  "Information Theory": "info",
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDraft(value: Record<string, any>): SubmissionDraft {
  const now = new Date().toISOString();
  const testCases: DraftTestCase[] = Array.isArray(value.testCases)
    ? value.testCases.filter(isRecord).map((entry: Record<string, any>) => ({
        input: typeof entry.input === "string" ? entry.input : "",
        expected: typeof entry.expected === "string" ? entry.expected : "",
      }))
    : [];
  return {
    id: String(value.id ?? ""),
    title: typeof value.title === "string" ? value.title : "",
    category: value.category as Category,
    difficulty: DIFFICULTIES.includes(value.difficulty)
      ? value.difficulty
      : "Easy",
    description: typeof value.description === "string" ? value.description : "",
    starterCode: typeof value.starterCode === "string" ? value.starterCode : "",
    solution: typeof value.solution === "string" ? value.solution : "",
    testCases,
    hint:
      typeof value.hint === "string" && value.hint.length > 0
        ? value.hint
        : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
    status: value.status === "validated" ? "validated" : "draft",
  };
}

function isDraftLike(value: unknown): value is Record<string, any> {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.title === "string" &&
    Array.isArray(value.testCases)
  );
}

function read(): SubmissionDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDraftLike).map(normalizeDraft);
  } catch {
    return [];
  }
}

function write(drafts: SubmissionDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent(SUBMISSIONS_CHANGE_EVENT));
  } catch {
    /* storage unavailable or full — silently ignore */
  }
}

export function getDrafts(): SubmissionDraft[] {
  return read();
}

/** Insert or update a draft. Blank ids are assigned one; timestamps are managed. */
export function saveDraft(draft: SubmissionDraft): SubmissionDraft {
  const drafts = read();
  const now = new Date().toISOString();
  const hasId = typeof draft.id === "string" && draft.id.length > 0;
  const index = hasId ? drafts.findIndex((d) => d.id === draft.id) : -1;
  const saved: SubmissionDraft = {
    ...draft,
    id: hasId ? draft.id : newId(),
    testCases: (draft.testCases ?? []).map((entry) => ({
      input: typeof entry?.input === "string" ? entry.input : "",
      expected: typeof entry?.expected === "string" ? entry.expected : "",
    })),
    hint:
      draft.hint && draft.hint.trim().length > 0 ? draft.hint : undefined,
    createdAt: index >= 0 ? drafts[index].createdAt : draft.createdAt || now,
    updatedAt: now,
    status: draft.status === "validated" ? "validated" : "draft",
  };
  if (index >= 0) drafts[index] = saved;
  else drafts.push(saved);
  write(drafts);
  return saved;
}

export function deleteDraft(id: string): void {
  const drafts = read();
  const next = drafts.filter((d) => d.id !== id);
  if (next.length === drafts.length) return;
  write(next);
}

/** Deep-copy a stored draft into a new "draft" entry. Returns null if missing. */
export function duplicateDraft(id: string): SubmissionDraft | null {
  const drafts = read();
  const index = drafts.findIndex((d) => d.id === id);
  if (index < 0) return null;
  const source = drafts[index];
  const now = new Date().toISOString();
  const copy: SubmissionDraft = {
    ...source,
    id: newId(),
    title: source.title ? `${source.title} (copy)` : "Untitled draft (copy)",
    testCases: source.testCases.map((entry) => ({ ...entry })),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  drafts.splice(index + 1, 0, copy);
  write(drafts);
  return copy;
}

/**
 * Structural validation only — no Python runs here. Checks that the draft is
 * shaped like a repo problem and will pass the structural half of the
 * verifier once exported.
 */
export function validateDraft(draft: SubmissionDraft): DraftValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (!title) {
    errors.push("Title is required.");
  } else {
    if (title.length > 80) errors.push("Title must be 80 characters or fewer.");
    if (!/[A-Za-z0-9]/.test(title)) {
      errors.push(
        "Title must contain at least one letter or number to be id-safe.",
      );
    }
    if (title.includes("`")) errors.push("Title must not contain a backtick.");
    if (title.includes("${"))
      errors.push('Title must not contain the sequence "${".');
  }

  if (!CATEGORIES.some((category) => category.name === draft.category)) {
    errors.push(`Category ${JSON.stringify(draft.category)} is not recognized.`);
  }

  if (!DIFFICULTIES.includes(draft.difficulty)) {
    errors.push(
      `Difficulty ${JSON.stringify(draft.difficulty)} must be Easy, Medium, or Hard.`,
    );
  }

  const description =
    typeof draft.description === "string" ? draft.description.trim() : "";
  if (!description) errors.push("Description is required.");
  else if (description.length < 40) {
    errors.push("Description must be at least 40 characters.");
  }

  const starterCode =
    typeof draft.starterCode === "string" ? draft.starterCode : "";
  const solution = typeof draft.solution === "string" ? draft.solution : "";

  if (!starterCode.trim()) errors.push("Starter code is required.");
  if (!solution.trim()) errors.push("Solution is required.");

  const starterName = extractFuncName(starterCode);
  const solutionName = extractFuncName(solution);
  if (!starterName) {
    errors.push("Starter code must define a function with `def name(...)`.");
  }
  if (!solutionName) {
    errors.push("Solution must define a function with `def name(...)`.");
  }
  if (starterName && solutionName && starterName !== solutionName) {
    errors.push(
      `Starter and solution must define the same function (starter: ${starterName}, solution: ${solutionName}).`,
    );
  }

  if (
    starterCode.trim() &&
    solution.trim() &&
    starterCode.trim() === solution.trim()
  ) {
    errors.push("Solution must differ from the starter code.");
  }

  const codeFields: [string, string][] = [
    ["Starter code", starterCode],
    ["Solution", solution],
  ];
  for (const [label, code] of codeFields) {
    if (code.includes("`")) errors.push(`${label} must not contain a backtick.`);
    if (code.includes("${"))
      errors.push(`${label} must not contain the sequence "\${".`);
  }

  const cases = Array.isArray(draft.testCases) ? draft.testCases : [];
  if (cases.length < 3) {
    errors.push(`At least 3 test cases are required (currently ${cases.length}).`);
  }
  if (cases.length > 6) {
    errors.push(`At most 6 test cases are allowed (currently ${cases.length}).`);
  }

  cases.forEach((testCase, index) => {
    const n = index + 1;
    const input =
      typeof testCase?.input === "string" ? testCase.input.trim() : "";
    const expected =
      typeof testCase?.expected === "string" ? testCase.expected.trim() : "";

    if (!input) {
      errors.push(`Test case ${n}: input is required.`);
    } else {
      try {
        const parsed: unknown = JSON.parse(input);
        if (!Array.isArray(parsed)) {
          errors.push(
            `Test case ${n}: input must be a JSON array of positional arguments.`,
          );
        }
      } catch {
        errors.push(`Test case ${n}: input is not valid JSON.`);
      }
    }

    if (!expected) {
      errors.push(`Test case ${n}: expected is required.`);
    } else {
      try {
        JSON.parse(expected);
      } catch {
        errors.push(`Test case ${n}: expected is not valid JSON.`);
      }
    }
  });

  if (cases.length >= 3 && cases.length < 5) {
    warnings.push(
      "Fewer than 5 test cases — add an edge case (empty input, zeros, or negatives).",
    );
  }
  if (!draft.hint || !draft.hint.trim()) {
    warnings.push("No hint yet — a one-line nudge helps learners get unstuck.");
  }
  if (description && description.length < 80) {
    warnings.push(
      "The description is short — aim for 2-4 sentences stating the signature and algorithm.",
    );
  }

  return { errors, warnings };
}

/**
 * Run the draft's solution against its parsed test cases with the same
 * Pyodide harness the app uses for problems. Never throws.
 */
export async function runDraftTests(
  draft: SubmissionDraft,
): Promise<DraftRunResult> {
  const rawCases = Array.isArray(draft.testCases) ? draft.testCases : [];
  const cases: TestCase[] = [];

  for (let index = 0; index < rawCases.length; index += 1) {
    const n = index + 1;
    const raw = rawCases[index];
    let input: unknown;
    let expected: unknown;

    try {
      input = JSON.parse(typeof raw?.input === "string" ? raw.input : "");
    } catch {
      return {
        ok: false,
        results: [],
        error: `Test case ${n}: input is not valid JSON.`,
      };
    }
    if (!Array.isArray(input)) {
      return {
        ok: false,
        results: [],
        error: `Test case ${n}: input must be a JSON array of positional arguments.`,
      };
    }
    try {
      expected = JSON.parse(typeof raw?.expected === "string" ? raw.expected : "");
    } catch {
      return {
        ok: false,
        results: [],
        error: `Test case ${n}: expected is not valid JSON.`,
      };
    }
    cases.push({ input, expected });
  }

  if (cases.length === 0) {
    return { ok: false, results: [], error: "No test cases to run." };
  }

  try {
    const py = await loadPyodideOnce();
    const results = await runTests(py, draft.solution, cases);
    return { ok: results.length > 0 && results.every((r) => r.ok), results };
  } catch (error: any) {
    return {
      ok: false,
      results: [],
      error: error?.message || String(error),
    };
  }
}

/** Emit a TS template literal, escaping anything that would break it. */
function codeLiteral(code: string): string {
  const escaped = code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
  return "`" + escaped + "`";
}

function parseCaseValue(text: string, label: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} is not valid JSON — fix it before exporting.`);
  }
}

/**
 * Render a ready-to-paste `Problem` object literal plus the file-header
 * comment that tells the author where it belongs.
 */
export function draftToTs(draft: SubmissionDraft): string {
  const folder = draft.category.toLowerCase().replace(/\s+/g, "-");
  const prefix = CATEGORY_PREFIX[draft.category] ?? "xx";
  const lines: string[] = [
    `// paste into src/data/problems/${folder}/part-XX.ts`,
    "{",
    `  id: ${JSON.stringify(`${prefix}-000`)},`,
    `  title: ${JSON.stringify(draft.title)},`,
    `  category: ${JSON.stringify(draft.category)},`,
    `  difficulty: ${JSON.stringify(draft.difficulty)},`,
    `  description: ${JSON.stringify(draft.description)},`,
    `  starterCode: ${codeLiteral(draft.starterCode)},`,
    `  solution: ${codeLiteral(draft.solution)},`,
    "  testCases: [",
  ];

  draft.testCases.forEach((testCase, index) => {
    const n = index + 1;
    const input = parseCaseValue(
      typeof testCase?.input === "string" ? testCase.input : "",
      `Test case ${n}: input`,
    );
    const expected = parseCaseValue(
      typeof testCase?.expected === "string" ? testCase.expected : "",
      `Test case ${n}: expected`,
    );
    if (!Array.isArray(input)) {
      throw new Error(
        `Test case ${n}: input must be a JSON array of positional arguments.`,
      );
    }
    lines.push(
      `    { input: ${JSON.stringify(input)}, expected: ${JSON.stringify(expected)} },`,
    );
  });

  lines.push("  ],");
  if (draft.hint && draft.hint.trim()) {
    lines.push(`  hint: ${JSON.stringify(draft.hint)},`);
  }
  lines.push("}");
  return lines.join("\n");
}

/** Serialize every draft for backup. */
export function exportAllDrafts(): string {
  const backup: SubmissionsBackup = {
    app: "deepforge-submissions",
    version: 1,
    exportedAt: new Date().toISOString(),
    drafts: read(),
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Restore drafts from a backup (our envelope or a bare array). Existing
 * drafts with the same id are overwritten. Never throws.
 */
export function importDrafts(json: string): { imported: number; error?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { imported: 0, error: "That is not valid JSON." };
  }

  let incoming: unknown[];
  if (Array.isArray(parsed)) {
    incoming = parsed;
  } else if (isRecord(parsed) && Array.isArray(parsed.drafts)) {
    incoming = parsed.drafts;
  } else {
    return { imported: 0, error: "Unrecognized submissions backup." };
  }

  const valid = incoming.filter(isDraftLike).map(normalizeDraft);
  if (valid.length === 0) {
    return { imported: 0, error: "No valid drafts found in that JSON." };
  }

  const drafts = read();
  const byId = new Map(drafts.map((draft) => [draft.id, draft]));
  for (const draft of valid) {
    const existing = byId.get(draft.id);
    byId.set(
      draft.id,
      existing
        ? {
            ...draft,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
          }
        : draft,
    );
  }
  write(Array.from(byId.values()));
  return { imported: valid.length };
}
