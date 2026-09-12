/**
 * Speedrun: a seeded, timed solve-a-thon that runs entirely client-side.
 *
 * The seed deterministically picks a problem list, the clock runs in the
 * browser, and every solve is scored from the elapsed time against a par
 * time for the problem's difficulty. Active runs and the last 20 finished
 * runs persist in localStorage; finished runs can be shared as compact,
 * base64url-encoded run codes so a friend can race the same seed.
 *
 * Score is honor-system: solves come from the in-browser test runner and
 * the clock is local, so treat codes as a fun comparison, not proof.
 */

import { PROBLEMS, getProblemById } from "@/data/problems";
import type { Difficulty, Problem } from "@/types/problem";

const STORAGE_KEY = "deepforge:runs:v1";
const HISTORY_LIMIT = 20;

export const RUNS_CHANGE_EVENT = "deepforge:runs-change";

export interface RunConfig {
  seed: string;
  problemCount: number;
  durationSeconds: number;
  category?: string;
}

export interface RunState {
  id: string;
  seed: string;
  /** Epoch ms when the clock started. */
  startedAt: number;
  /** Epoch ms when the clock expires (startedAt + duration). */
  endsAt: number;
  problemIds: string[];
  solvedIds: string[];
  /** problemId -> elapsed ms from run start when the solve landed. */
  solvedAt: Record<string, number>;
  score: number;
  status: "active" | "finished" | "abandoned";
  /** Category the seed was filtered by, when not "All". */
  category?: string;
}

export interface RunComparisonRow {
  problemId: string;
  aSolved: boolean;
  bSolved: boolean;
  /** Elapsed ms, or null when the run predates codes or did not solve it. */
  aMs: number | null;
  bMs: number | null;
  winner: "a" | "b" | "tie" | null;
}

/** Points for a solve at t = 0, by difficulty. */
export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

const PAR_SECONDS: Record<Difficulty, number> = {
  Easy: 90,
  Medium: 150,
  Hard: 240,
};

/* ── Deterministic seeding ── */

/** FNV-1a (32-bit) hash of a string. */
function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 32-bit LCG (Numerical Recipes constants), matching the repo's generators. */
function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function compareIds(a: Problem, b: Problem): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

/** Stable order so the pick never depends on import order. */
const ORDERED_PROBLEMS: Problem[] = [...PROBLEMS].sort(compareIds);

/** Draw the next unused problem, preferring a category not used yet. */
function takeProblem(
  list: Problem[],
  usedIds: Set<string>,
  usedCategories: Set<string>,
): Problem | null {
  for (const p of list) {
    if (usedIds.has(p.id)) continue;
    if (usedCategories.has(p.category)) continue;
    return p;
  }
  for (const p of list) {
    if (!usedIds.has(p.id)) return p;
  }
  return null;
}

/**
 * Deterministic run problem list for a seed: Fisher-Yates over the
 * catalogue with an LCG seeded by the FNV-1a hash. The selection is
 * shuffled toward a ~40% Easy / 40% Medium / 20% Hard mix and spreads
 * across distinct categories. The same seed, count, and category always
 * produce the same problem ids in the same order.
 */
export function seededRunProblems(
  seed: string,
  count: number,
  category?: string,
): Problem[] {
  const total = Math.max(1, Math.floor(count));
  const pool =
    category && category !== "All"
      ? ORDERED_PROBLEMS.filter((p) => p.category === category)
      : ORDERED_PROBLEMS;
  if (pool.length === 0) return [];

  const rand = lcg(fnv1a(seed));
  const buckets: Record<Difficulty, Problem[]> = {
    Easy: [],
    Medium: [],
    Hard: [],
  };
  for (const p of pool) buckets[p.difficulty].push(p);
  buckets.Easy = shuffled(buckets.Easy, rand);
  buckets.Medium = shuffled(buckets.Medium, rand);
  buckets.Hard = shuffled(buckets.Hard, rand);

  const easyTarget = Math.round(total * 0.4);
  const hardTarget = Math.round(total * 0.2);
  const plan: Difficulty[] = [
    ...Array<Difficulty>(easyTarget).fill("Easy"),
    ...Array<Difficulty>(total - easyTarget - hardTarget).fill("Medium"),
    ...Array<Difficulty>(hardTarget).fill("Hard"),
  ];

  const chosen: Problem[] = [];
  const usedIds = new Set<string>();
  const usedCategories = new Set<string>();
  for (const difficulty of shuffled(plan, rand)) {
    if (chosen.length >= total) break;
    const p = takeProblem(buckets[difficulty], usedIds, usedCategories);
    if (!p) continue;
    chosen.push(p);
    usedIds.add(p.id);
    usedCategories.add(p.category);
  }
  if (chosen.length < total) {
    for (const p of pool) {
      if (chosen.length >= total) break;
      if (usedIds.has(p.id)) continue;
      chosen.push(p);
      usedIds.add(p.id);
    }
  }
  return chosen;
}

/* ── Scoring ── */

/** Par solve time in seconds by difficulty. */
export function parSeconds(problem: Problem): number {
  return PAR_SECONDS[problem.difficulty];
}

/**
 * Points for solving `problem` in `solveSeconds`. Full points at zero
 * seconds, scaling linearly to a 50% floor at twice par and beyond.
 * Rounded to two decimals.
 */
export function solveScore(problem: Problem, solveSeconds: number): number {
  const par = parSeconds(problem);
  const seconds = Number.isFinite(solveSeconds)
    ? Math.max(0, solveSeconds)
    : par * 2;
  const factor = Math.max(0.5, Math.min(1, 1 - seconds / (2 * par)));
  return Math.round(DIFFICULTY_POINTS[problem.difficulty] * factor * 100) / 100;
}

/** Render a millisecond duration as mm:ss. */
export function formatClock(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* ── Persistence ── */

interface RunsStore {
  active: RunState | null;
  history: RunState[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(
    (v) => typeof v === "number" && Number.isFinite(v),
  );
}

function isRunState(value: unknown): value is RunState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.seed === "string" &&
    typeof v.startedAt === "number" &&
    Number.isFinite(v.startedAt) &&
    typeof v.endsAt === "number" &&
    Number.isFinite(v.endsAt) &&
    isStringArray(v.problemIds) &&
    isStringArray(v.solvedIds) &&
    isNumberRecord(v.solvedAt) &&
    typeof v.score === "number" &&
    Number.isFinite(v.score) &&
    (v.status === "active" || v.status === "finished" || v.status === "abandoned") &&
    (v.category === undefined || typeof v.category === "string")
  );
}

function emptyStore(): RunsStore {
  return { active: null, history: [] };
}

function readStore(): RunsStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed: unknown = JSON.parse(raw);
    const history = Array.isArray(parsed)
      ? parsed.filter(isRunState)
      : parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as RunsStore).history)
        ? ((parsed as RunsStore).history.filter(isRunState) as RunState[])
        : [];
    const active =
      !Array.isArray(parsed) &&
      parsed &&
      typeof parsed === "object" &&
      isRunState((parsed as RunsStore).active)
        ? ((parsed as RunsStore).active as RunState)
        : null;
    return { active, history: history.slice(0, HISTORY_LIMIT) };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: RunsStore): void {
  if (typeof window === "undefined") return;
  try {
    const next: RunsStore = {
      active: store.active,
      history: store.history.slice(0, HISTORY_LIMIT),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(RUNS_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function makeRunId(seed: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `run-${crypto.randomUUID()}`;
  }
  return `run-${seed}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Run lifecycle ── */

/** Create and persist a new active run from the config. */
export function startRun(config: RunConfig): RunState {
  const seed = config.seed.trim() || `seed-${Math.random().toString(36).slice(2, 8)}`;
  const problemCount = Math.max(1, Math.floor(config.problemCount));
  const durationSeconds = Math.max(1, Math.floor(config.durationSeconds));
  const category =
    config.category && config.category !== "All" ? config.category : undefined;
  const problems = seededRunProblems(seed, problemCount, category);
  const now = Date.now();
  const state: RunState = {
    id: makeRunId(seed),
    seed,
    startedAt: now,
    endsAt: now + durationSeconds * 1000,
    problemIds: problems.map((p) => p.id),
    solvedIds: [],
    solvedAt: {},
    score: 0,
    status: "active",
    ...(category ? { category } : {}),
  };

  const store = readStore();
  writeStore({ active: state, history: store.history });
  return state;
}

/**
 * Record one solve at `atMs` elapsed milliseconds. Returns the updated
 * state; a no-op for unknown, already-solved, or non-active runs. Persists
 * when the run is the stored active run.
 */
export function recordSolve(
  state: RunState,
  problemId: string,
  atMs: number,
): RunState {
  if (state.status !== "active") return state;
  if (state.solvedIds.includes(problemId)) return state;
  if (!state.problemIds.includes(problemId)) return state;
  const problem = getProblemById(problemId);
  if (!problem) return state;

  const cap = Math.max(0, state.endsAt - state.startedAt);
  const elapsedMs = Math.min(Math.max(0, atMs), cap);
  const points = solveScore(problem, elapsedMs / 1000);
  const next: RunState = {
    ...state,
    solvedIds: [...state.solvedIds, problemId],
    solvedAt: { ...state.solvedAt, [problemId]: elapsedMs },
    score: Math.round((state.score + points) * 100) / 100,
  };

  const store = readStore();
  if (store.active && store.active.id === next.id) {
    writeStore({ active: next, history: store.history });
  }
  return next;
}

/**
 * Finish a run and move it to the history (last 20, newest first).
 * `status` is "finished" unless the run was abandoned.
 */
export function finishRun(
  state: RunState,
  status: "finished" | "abandoned" = "finished",
): RunState {
  if (state.status !== "active") return state;
  const finished: RunState = { ...state, status };
  const store = readStore();
  const history = [
    finished,
    ...store.history.filter((r) => r.id !== finished.id),
  ].slice(0, HISTORY_LIMIT);
  const active =
    store.active && store.active.id === finished.id ? null : store.active;
  writeStore({ active, history });
  return finished;
}

/** The in-progress run, if any. */
export function getActiveRun(): RunState | null {
  return readStore().active;
}

/** Finished and abandoned runs, newest first (last 20). */
export function getRunHistory(): RunState[] {
  return readStore().history;
}

/** Clear the active run and the entire run history. */
export function resetRun(): void {
  writeStore(emptyStore());
}

/* ── Run codes ── */

interface RunCodePayload {
  v: 1;
  seed: string;
  score: number;
  duration: number;
  count: number;
  /** Catalogue indices of solved problems, in the run's order. */
  solved: number[];
  /** Category filter, present only when the run was category-scoped. */
  c?: string;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string | null {
  try {
    const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Encode a finished run into a compact, shareable base64url code. */
export function encodeRun(run: RunState): string {
  const indexOf = new Map<string, number>();
  for (let i = 0; i < ORDERED_PROBLEMS.length; i += 1) {
    indexOf.set(ORDERED_PROBLEMS[i].id, i);
  }
  const solved = run.solvedIds
    .map((id) => indexOf.get(id))
    .filter((i): i is number => typeof i === "number");
  const payload: RunCodePayload = {
    v: 1,
    seed: run.seed,
    score: Math.round(run.score * 100) / 100,
    duration: Math.max(0, Math.round((run.endsAt - run.startedAt) / 1000)),
    count: run.problemIds.length,
    solved,
  };
  if (run.category && run.category !== "All") payload.c = run.category;
  try {
    return toBase64Url(JSON.stringify(payload));
  } catch {
    return "";
  }
}

/**
 * Decode a run code. Returns a finished RunState reconstructed from the
 * seed (timings are not carried in codes, so `startedAt` is 0 and
 * `solvedAt` is empty), or null when the code is malformed.
 */
export function decodeRun(code: string): RunState | null {
  const json = fromBase64Url(code.trim());
  if (!json) return null;
  let payload: RunCodePayload;
  try {
    payload = JSON.parse(json) as RunCodePayload;
  } catch {
    return null;
  }
  if (
    !payload ||
    payload.v !== 1 ||
    typeof payload.seed !== "string" ||
    typeof payload.score !== "number" ||
    !Number.isFinite(payload.score) ||
    typeof payload.duration !== "number" ||
    !Number.isFinite(payload.duration) ||
    typeof payload.count !== "number" ||
    !Number.isFinite(payload.count) ||
    !Array.isArray(payload.solved) ||
    !payload.solved.every((i) => typeof i === "number" && Number.isInteger(i)) ||
    (payload.c !== undefined && typeof payload.c !== "string")
  ) {
    return null;
  }
  const count = Math.max(1, Math.floor(payload.count));
  const category = payload.c && payload.c !== "All" ? payload.c : undefined;
  const problems = seededRunProblems(payload.seed, count, category);
  const inRun = new Set(problems.map((p) => p.id));
  const solvedIds: string[] = [];
  for (const i of payload.solved) {
    const id = ORDERED_PROBLEMS[i]?.id;
    if (id && inRun.has(id) && !solvedIds.includes(id)) solvedIds.push(id);
  }
  const durationMs = Math.max(0, Math.round(payload.duration)) * 1000;
  return {
    id: `code-${payload.seed}`,
    seed: payload.seed,
    startedAt: 0,
    endsAt: durationMs,
    problemIds: problems.map((p) => p.id),
    solvedIds,
    solvedAt: {},
    score: Math.round(payload.score * 100) / 100,
    status: "finished",
    ...(category ? { category } : {}),
  };
}

/**
 * Per-problem comparison of two runs over the union of their problems.
 * `a` is the player, `b` the ghost. A problem is decided by who solved
 * it; when both solved it, the faster time wins (tie when either run's
 * time is unknown, e.g. imported codes).
 */
export function compareRuns(a: RunState, b: RunState): RunComparisonRow[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const id of [...a.problemIds, ...b.problemIds]) {
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids.map((problemId) => {
    const aSolved = a.solvedIds.includes(problemId);
    const bSolved = b.solvedIds.includes(problemId);
    const aMs =
      aSolved && typeof a.solvedAt[problemId] === "number"
        ? a.solvedAt[problemId]
        : null;
    const bMs =
      bSolved && typeof b.solvedAt[problemId] === "number"
        ? b.solvedAt[problemId]
        : null;
    let winner: RunComparisonRow["winner"] = null;
    if (aSolved && !bSolved) winner = "a";
    else if (bSolved && !aSolved) winner = "b";
    else if (aSolved && bSolved) {
      if (aMs !== null && bMs !== null) {
        winner = aMs === bMs ? "tie" : aMs < bMs ? "a" : "b";
      } else {
        winner = "tie";
      }
    }
    return { problemId, aSolved, bSolved, aMs, bMs, winner };
  });
}
