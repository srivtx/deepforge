/**
 * F12 — Onboarding Diagnostic & Starting Plan.
 *
 * A short, deterministic placement check built from the light `PROBLEM_META`
 * index (never the heavy problem bank). Each of the eight-to-twelve questions
 * is a real catalogue problem shown as a title; the learner answers honestly
 * whether they could solve it from scratch. Scoring is plain arithmetic — no
 * model, no network, no randomness — so the same answers always produce the
 * same plan.
 *
 * The plan recommends two or three of the 33 learning paths that fit the
 * diagnosed level and weak categories, a first problem set, and a daily
 * cadence. Results persist in `deepforge:placement:v1`; an in-progress check
 * persists in `deepforge:placement-draft:v1` so a refresh resumes where the
 * learner stopped.
 *
 * Persistence follows the repo's local-first store seam. The shared `StoreId`
 * union is sealed (see `avatars.ts`), so this module uses the same hygiene as
 * `createStore`: `readRaw`/`writeRaw`, validated parsing, and a same-tab
 * `deepforge:placement-change` CustomEvent. Adding `"placement"` to `StoreId`
 * and `remote.ts` is the one-line change that turns remote sync on later;
 * nothing here ever asks for an account.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { getAllPaths } from "@/lib/paths";
import type { PathLevel, ResolvedLearningPath } from "@/lib/paths";
import type { ProgressMap } from "@/lib/progress";
import { categorySlug } from "@/lib/sections";
import { readRaw, removeRaw, writeRaw } from "@/lib/sync/localAdapter";
import type { Category, Difficulty } from "@/types/problem";

export const PLACEMENT_STORAGE_KEY = "deepforge:placement:v1";
export const PLACEMENT_DRAFT_KEY = "deepforge:placement-draft:v1";
export const PLACEMENT_CHANGE_EVENT = "deepforge:placement-change";

export const PLACEMENT_VERSION = 1;
export const DIAGNOSTIC_MIN_QUESTIONS = 8;
export const DIAGNOSTIC_MAX_QUESTIONS = 12;
export const MAX_INTERESTS = 3;
export const MINUTES_OPTIONS = [10, 20, 30] as const;
export const DEFAULT_MINUTES = 20;

export type DiagnosticLevel = 0 | 1 | 2;

export interface DiagnosticAnswer {
  problemId: string;
  category: Category;
  difficulty: Difficulty;
  /** True = "yes, I could write this from scratch", false = "not yet". */
  correct: boolean;
}

export interface DiagnosticScore {
  answered: number;
  /** Correct difficulty weight over asked difficulty weight, 0..1. */
  score: number;
  level: DiagnosticLevel;
  levelLabel: string;
  perCategory: Partial<Record<Category, DiagnosticLevel>>;
  /** Asked categories where an answer showed a gap, strongest signal first. */
  weakCategories: Category[];
  /** Categories where a harder answer was correct. */
  strengths: Category[];
}

export interface PathRecommendation {
  id: string;
  slug: string;
  title: string;
  level: PathLevel | null;
  estimatedHours: number;
  score: number;
  why: string;
  firstProblemIds: string[];
}

export interface StartingPlan {
  at: string;
  answered: number;
  score: number;
  level: DiagnosticLevel;
  levelLabel: string;
  levelDetail: string;
  weakCategories: Category[];
  strengths: Category[];
  perCategory: Partial<Record<Category, DiagnosticLevel>>;
  interests: Category[];
  recommendedPaths: PathRecommendation[];
  firstProblemIds: string[];
  dailyTarget: number;
  cadence: string;
  minutesPerDay: number;
  summary: string;
  note: string;
}

export interface PlacementRecord {
  v: number;
  at: string;
  level: DiagnosticLevel;
  levelLabel: string;
  answered: number;
  score: number;
  weakCategories: Category[];
  strengths: Category[];
  perCategory: Partial<Record<Category, DiagnosticLevel>>;
  interests: Category[];
  recommendedPathIds: string[];
  firstProblemIds: string[];
  dailyTarget: number;
  cadence: string;
  minutesPerDay: number;
}

export interface PlacementDraft {
  v: number;
  at: string;
  areas: Category[];
  minutesPerDay: number | null;
  answers: DiagnosticAnswer[];
}

export const LEVEL_LABELS: Record<DiagnosticLevel, string> = {
  0: "Starting from the foundations",
  1: "Solid on the basics",
  2: "Ready for harder material",
};

const LEVEL_DETAIL: Record<DiagnosticLevel, string> = {
  0: "Your answers land at the starting level. That is a normal place to begin: the plan below keeps each problem to one new idea, in plain language, with anything technical defined as it comes up.",
  1: "You have the basics in place. The plan below gives them a quick refresher, then adds problems that take a few more steps and combine two ideas at once.",
  2: "Your answers say you can move faster than the opening material. The plan below skips the warm-ups and starts with harder problems that combine several ideas.",
};

export const HONEST_NOTE =
  "This check has at most twelve questions and it trusts your own answers, so treat the level as a rough starting point, not a score or a verdict. Plans are meant to change: if the first problems feel too easy, move up a path; if they feel too hard, step back or retake the check.";

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

const CATEGORY_NAMES: Category[] = CATEGORIES.map((category) => category.name);
const CATEGORY_SET = new Set<string>(CATEGORY_NAMES);
const CATEGORY_ORDER = new Map<Category, number>(
  CATEGORY_NAMES.map((name, index) => [name, index]),
);
const CATEGORY_BY_TAG = new Map<string, Category>(
  CATEGORY_NAMES.map((name) => [categorySlug(name), name]),
);

/* ─────────────────────────── question staircase ─────────────────────────── */

type Ladder = Partial<Record<Difficulty, ProblemMeta>>;

const LADDER_CACHE = new WeakMap<
  readonly ProblemMeta[],
  Map<Category, Ladder>
>();

/**
 * One anchor problem per category and difficulty: the lowest id wins, so the
 * same pool always yields the same questions regardless of file order.
 */
function laddersFor(pool: readonly ProblemMeta[]): Map<Category, Ladder> {
  const cached = LADDER_CACHE.get(pool);
  if (cached) return cached;
  const ladders = new Map<Category, Ladder>();
  for (const problem of pool) {
    let ladder = ladders.get(problem.category);
    if (!ladder) {
      ladder = {};
      ladders.set(problem.category, ladder);
    }
    const current = ladder[problem.difficulty];
    if (!current || problem.id < current.id) ladder[problem.difficulty] = problem;
  }
  LADDER_CACHE.set(pool, ladders);
  return ladders;
}

/** Selected areas first (in catalogue order), then the rest of the catalogue. */
export function orderedCategories(
  areas: readonly Category[] = [],
): Category[] {
  const wanted = new Set(areas);
  const first = CATEGORY_NAMES.filter((category) => wanted.has(category));
  const rest = CATEGORY_NAMES.filter((category) => !wanted.has(category));
  return [...first, ...rest];
}

function answersByCategory(
  answers: readonly DiagnosticAnswer[],
): Map<Category, DiagnosticAnswer[]> {
  const byCategory = new Map<Category, DiagnosticAnswer[]>();
  for (const answer of answers) {
    const list = byCategory.get(answer.category);
    if (list) list.push(answer);
    else byCategory.set(answer.category, [answer]);
  }
  return byCategory;
}

/** Build the answer for a question in one place so the UI cannot drift. */
export function answerFor(
  question: ProblemMeta,
  correct: boolean,
): DiagnosticAnswer {
  return {
    problemId: question.id,
    category: question.category,
    difficulty: question.difficulty,
    correct,
  };
}

/**
 * The next question for a fixed answer sequence, or null when the check is
 * done. Pure: no clock, no storage, no randomness.
 *
 * Phase 1 (coverage): one Easy anchor from each category, in priority order,
 * until eight questions are asked. Phase 2 (escalation): walk the order and
 * ask the next difficulty of the first category whose last answer was
 * correct; stop when nothing is open or the twelve-question cap is reached.
 */
export function nextQuestion(
  answers: readonly DiagnosticAnswer[],
  areas: readonly Category[] = [],
  pool: readonly ProblemMeta[] = PROBLEM_META,
): ProblemMeta | null {
  if (answers.length >= DIAGNOSTIC_MAX_QUESTIONS) return null;
  const ladders = laddersFor(pool);
  const order = orderedCategories(areas);
  const byCategory = answersByCategory(answers);

  if (answers.length < DIAGNOSTIC_MIN_QUESTIONS) {
    for (const category of order) {
      if ((byCategory.get(category)?.length ?? 0) > 0) continue;
      const easy = ladders.get(category)?.Easy;
      if (easy) return easy;
    }
  }

  for (const category of order) {
    const ladder = ladders.get(category);
    if (!ladder) continue;
    const asked = byCategory.get(category) ?? [];
    const easy = asked.find((answer) => answer.difficulty === "Easy");
    const medium = asked.find((answer) => answer.difficulty === "Medium");
    const hard = asked.find((answer) => answer.difficulty === "Hard");
    if (easy?.correct && !medium && ladder.Medium) return ladder.Medium;
    if (medium?.correct && !hard && ladder.Hard) return ladder.Hard;
  }

  return null;
}

/* ───────────────────────────────── scoring ──────────────────────────────── */

function clamp01(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000;
}

/** Category level from the hardest correct answer (0 none, 1 Easy, 2 Medium+). */
export function categoryLevel(
  answers: readonly DiagnosticAnswer[],
): DiagnosticLevel {
  let highest = 0;
  for (const answer of answers) {
    if (!answer.correct) continue;
    highest = Math.max(highest, DIFFICULTY_WEIGHT[answer.difficulty]);
  }
  return highest >= 2 ? 2 : highest === 1 ? 1 : 0;
}

/**
 * Deterministic scoring for a fixed answer sequence.
 *
 * Level rule, in plain words: two Medium answers or one Hard answer correct
 * means the harder material is reachable; otherwise at least two correct
 * answers with half of the asked difficulty handled means the basics are
 * solid; otherwise start at the beginning.
 */
export function scoreDiagnostic(
  answers: readonly DiagnosticAnswer[],
): DiagnosticScore {
  const byCategory = answersByCategory(answers);
  const perCategory: Partial<Record<Category, DiagnosticLevel>> = {};
  const weakCategories: Category[] = [];
  const strengths: Category[] = [];
  let earned = 0;
  let possible = 0;

  for (const answer of answers) {
    possible += DIFFICULTY_WEIGHT[answer.difficulty];
    if (answer.correct) earned += DIFFICULTY_WEIGHT[answer.difficulty];
  }

  for (const [category, list] of byCategory) {
    const level = categoryLevel(list);
    perCategory[category] = level;
    if (level === 0 || list.some((answer) => !answer.correct)) {
      weakCategories.push(category);
    }
    if (level === 2) strengths.push(category);
  }

  const wrongCount = (category: Category): number =>
    byCategory.get(category)?.filter((answer) => !answer.correct).length ?? 0;
  const byOrder = (a: Category, b: Category): number =>
    (CATEGORY_ORDER.get(a) ?? 0) - (CATEGORY_ORDER.get(b) ?? 0);

  weakCategories.sort(
    (a, b) =>
      wrongCount(b) - wrongCount(a) ||
      (perCategory[a] ?? 0) - (perCategory[b] ?? 0) ||
      byOrder(a, b),
  );
  strengths.sort(
    (a, b) =>
      (CATEGORY_ORDER.get(a) ?? 0) - (CATEGORY_ORDER.get(b) ?? 0),
  );

  const mediumCorrect = answers.filter(
    (answer) => answer.difficulty === "Medium" && answer.correct,
  ).length;
  const hardCorrect = answers.filter(
    (answer) => answer.difficulty === "Hard" && answer.correct,
  ).length;
  const correctCount = answers.filter((answer) => answer.correct).length;
  const weighted = possible === 0 ? 0 : earned / possible;

  let level: DiagnosticLevel = 0;
  if (hardCorrect >= 1 || mediumCorrect >= 2) level = 2;
  else if (correctCount >= 2 && weighted >= 0.5) level = 1;

  return {
    answered: answers.length,
    score: possible === 0 ? 0 : clamp01(earned / possible),
    level,
    levelLabel: LEVEL_LABELS[level],
    perCategory,
    weakCategories,
    strengths,
  };
}

/* ──────────────────────────── path recommendation ───────────────────────── */

export interface PathFit {
  level: DiagnosticLevel;
  weakCategories: readonly Category[];
}

export interface RecommendOptions {
  paths?: readonly ResolvedLearningPath[];
  problems?: readonly ProblemMeta[];
  interests?: readonly Category[];
  progress?: ProgressMap;
  limit?: number;
}

function pathRank(level: PathLevel | null | undefined): number {
  if (level === "Beginner") return 0;
  if (level === "Advanced") return 2;
  return 1;
}

function textCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function namesFromTags(tags: readonly string[]): string[] {
  const names: string[] = [];
  for (const tag of tags) {
    const name = CATEGORY_BY_TAG.get(tag);
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

function listNames(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function reasonForPath(
  path: ResolvedLearningPath,
  weakHits: readonly string[],
  interestHits: readonly string[],
  level: DiagnosticLevel,
): string {
  const parts: string[] = [];
  const weakNames = namesFromTags(weakHits);
  if (weakNames.length > 0) {
    parts.push(
      `Your answers showed gaps in ${listNames(weakNames)}, and this path spends real time there.`,
    );
  }
  const interestNames = namesFromTags(interestHits);
  if (interestNames.length > 0) {
    parts.push(`It also matches your interest in ${listNames(interestNames)}.`);
  }
  if (parts.length === 0) {
    parts.push(
      level === 0
        ? "A gentle first path: it assumes no prior machine-learning experience."
        : level === 1
          ? "It matches your level: a quick refresh of the basics, then problems with more steps."
          : "It moves fast — your answers showed you are ready for harder material.",
    );
  }
  return parts.join(" ");
}

/** The first few problems of a path at (or below) the diagnosed difficulty. */
function firstProblemsForPath(
  path: ResolvedLearningPath,
  level: DiagnosticLevel,
  metaById: ReadonlyMap<string, ProblemMeta>,
  progress: ProgressMap | undefined,
  count: number,
): string[] {
  const cap = level === 0 ? 0 : level === 1 ? 1 : 2;
  const atLevel: string[] = [];
  for (const id of path.problemIds) {
    const meta = metaById.get(id);
    if (!meta) continue;
    if (progress?.[id]?.solved) continue;
    if (DIFFICULTY_RANK[meta.difficulty] <= cap) atLevel.push(id);
    if (atLevel.length >= count) break;
  }
  return atLevel;
}

/**
 * Rank the catalogue against the diagnosed level. A path is only eligible
 * when its own level fits and every prerequisite resolves to a path whose
 * level also fits — so a recommendation never assumes knowledge the check
 * did not see.
 */
export function recommendPaths(
  fit: PathFit,
  options: RecommendOptions = {},
): PathRecommendation[] {
  const allPaths = options.paths ?? getAllPaths();
  const problems = options.problems ?? PROBLEM_META;
  const limit = Math.max(1, Math.min(3, options.limit ?? 3));
  const weakTags = new Set(fit.weakCategories.map(categorySlug));
  const interestTags = new Set((options.interests ?? []).map(categorySlug));
  const byKey = new Map<string, ResolvedLearningPath>();
  for (const path of allPaths) {
    byKey.set(path.id, path);
    byKey.set(path.slug, path);
  }
  const metaById = new Map(problems.map((problem) => [problem.id, problem]));

  const eligible = allPaths.filter((path) => {
    if (pathRank(path.level) > fit.level) return false;
    for (const key of path.prerequisites) {
      const target = byKey.get(key);
      if (!target || pathRank(target.level) > fit.level) return false;
    }
    return true;
  });

  const isSolved = (path: ResolvedLearningPath): boolean =>
    Boolean(options.progress) &&
    path.problemIds.length > 0 &&
    path.problemIds.every((id) => options.progress?.[id]?.solved);
  const open = eligible.filter((path) => !isSolved(path));
  const candidates = open.length > 0 ? open : eligible;

  const scored = candidates.map((path) => {
    const rank = pathRank(path.level);
    const weakHits = path.tags.filter((tag) => weakTags.has(tag));
    const interestHits = path.tags.filter((tag) => interestTags.has(tag));
    let score = 1;
    if (rank === fit.level) score += 2;
    else if (path.level === "Mixed" || rank === fit.level - 1) score += 1;
    score += 3 * weakHits.length + 2 * interestHits.length;
    return { path, rank, weakHits, interestHits, score };
  });

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.rank - b.rank ||
      textCompare(a.path.title, b.path.title) ||
      textCompare(a.path.id, b.path.id),
  );

  return scored.slice(0, limit).map((entry) => ({
    id: entry.path.id,
    slug: entry.path.slug,
    title: entry.path.title,
    level: entry.path.level ?? null,
    estimatedHours: entry.path.estimatedHours,
    score: entry.score,
    why: reasonForPath(entry.path, entry.weakHits, entry.interestHits, fit.level),
    firstProblemIds: firstProblemsForPath(
      entry.path,
      fit.level,
      metaById,
      options.progress,
      3,
    ),
  }));
}

/* ──────────────────────────────── cadence ───────────────────────────────── */

function clampMinutes(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MINUTES;
  }
  return Math.max(10, Math.min(60, Math.round(value)));
}

export function suggestDailyTarget(
  level: DiagnosticLevel,
  minutesPerDay: number = DEFAULT_MINUTES,
): number {
  const minutes = clampMinutes(minutesPerDay);
  const base = minutes >= 30 ? 4 : minutes >= 20 ? 3 : 2;
  return Math.max(2, Math.min(6, base + level));
}

export function suggestCadence(
  level: DiagnosticLevel,
  minutesPerDay: number = DEFAULT_MINUTES,
): { dailyTarget: number; cadence: string } {
  const dailyTarget = suggestDailyTarget(level, minutesPerDay);
  const minutes = clampMinutes(minutesPerDay);
  const cadence = `${dailyTarget} problems a day, most days — about ${minutes} minutes per session. Short, regular sessions beat one long catch-up: meeting an idea again while it is still fresh is what makes it stick.`;
  return { dailyTarget, cadence };
}

/* ──────────────────────────── starting plan ─────────────────────────────── */

export interface StartingPlanOptions {
  areas?: readonly Category[];
  paths?: readonly ResolvedLearningPath[];
  problems?: readonly ProblemMeta[];
  progress?: ProgressMap;
  minutesPerDay?: number;
  now?: Date;
}

function buildFirstSet(
  recommendations: readonly PathRecommendation[],
  score: DiagnosticScore,
  problems: readonly ProblemMeta[],
  progress: ProgressMap | undefined,
  count: number,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (id: string): boolean => {
    if (seen.has(id)) return false;
    seen.add(id);
    out.push(id);
    return out.length >= count;
  };

  for (const recommendation of recommendations) {
    for (const id of recommendation.firstProblemIds) {
      if (push(id)) return out;
    }
  }

  for (const category of score.weakCategories) {
    const candidates = problems
      .filter(
        (problem) =>
          problem.category === category && !progress?.[problem.id]?.solved,
      )
      .sort(
        (a, b) =>
          DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
          textCompare(a.id, b.id),
      );
    if (candidates.length > 0 && push(candidates[0].id)) return out;
  }

  return out;
}

function summaryFor(score: DiagnosticScore): string {
  if (score.answered === 0) {
    return "No answers yet, so this is the all-purpose start: the first path assumes nothing, and the first problems are all short.";
  }
  const weakText =
    score.weakCategories.length > 0
      ? ` ${listNames(score.weakCategories.slice(0, 3))} came up as the areas worth strengthening.`
      : " No single area stood out as a gap.";
  if (score.level === 0) {
    return `From ${score.answered} answers, the plan starts at the beginning: short problems that each teach one idea, with nothing assumed.${weakText}`;
  }
  if (score.level === 1) {
    return `From ${score.answered} answers, the basics look solid, so the plan mixes a quick refresher with problems that take a few more steps.${weakText}`;
  }
  return `From ${score.answered} answers, the plan skips the earliest material and starts with problems that combine several ideas. If that feels too hard, retake the check or drop back one path.${weakText}`;
}

/** Everything the plan screen needs, computed deterministically. */
export function buildStartingPlan(
  answers: readonly DiagnosticAnswer[],
  options: StartingPlanOptions = {},
): StartingPlan {
  const now = options.now ?? new Date();
  const areas = sanitizeAreas(options.areas, MAX_INTERESTS);
  const minutesPerDay = clampMinutes(options.minutesPerDay);
  const score = scoreDiagnostic(answers);
  const recommendedPaths = recommendPaths(score, {
    paths: options.paths,
    problems: options.problems,
    interests: areas,
    progress: options.progress,
  });
  const { dailyTarget, cadence } = suggestCadence(score.level, minutesPerDay);
  const firstProblemIds = buildFirstSet(
    recommendedPaths,
    score,
    options.problems ?? PROBLEM_META,
    options.progress,
    dailyTarget,
  );

  return {
    at: now.toISOString(),
    answered: score.answered,
    score: score.score,
    level: score.level,
    levelLabel: score.levelLabel,
    levelDetail: LEVEL_DETAIL[score.level],
    weakCategories: score.weakCategories,
    strengths: score.strengths,
    perCategory: score.perCategory,
    interests: areas,
    recommendedPaths,
    firstProblemIds,
    dailyTarget,
    cadence,
    minutesPerDay,
    summary: summaryFor(score),
    note: HONEST_NOTE,
  };
}

/* ───────────────────────────── persistence ──────────────────────────────── */

function isLevel(value: unknown): value is DiagnosticLevel {
  return value === 0 || value === 1 || value === 2;
}

function sanitizeAreas(
  value: unknown,
  cap: number = Number.POSITIVE_INFINITY,
): Category[] {
  if (!Array.isArray(value)) return [];
  const wanted = new Set<Category>();
  for (const entry of value) {
    if (typeof entry !== "string" || !CATEGORY_SET.has(entry)) continue;
    wanted.add(entry as Category);
    if (wanted.size >= cap) break;
  }
  return CATEGORY_NAMES.filter((category) => wanted.has(category));
}

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.length === 0) continue;
    if (out.includes(entry)) continue;
    out.push(entry);
  }
  return out;
}

function sanitizeAnswers(value: unknown): DiagnosticAnswer[] {
  if (!Array.isArray(value)) return [];
  const out: DiagnosticAnswer[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.problemId !== "string" || record.problemId.length === 0) {
      continue;
    }
    if (typeof record.category !== "string" || !CATEGORY_SET.has(record.category)) {
      continue;
    }
    if (
      record.difficulty !== "Easy" &&
      record.difficulty !== "Medium" &&
      record.difficulty !== "Hard"
    ) {
      continue;
    }
    if (typeof record.correct !== "boolean") continue;
    out.push({
      problemId: record.problemId,
      category: record.category as Category,
      difficulty: record.difficulty,
      correct: record.correct,
    });
  }
  return out.slice(0, DIAGNOSTIC_MAX_QUESTIONS);
}

function sanitizePerCategory(
  value: unknown,
): Partial<Record<Category, DiagnosticLevel>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Partial<Record<Category, DiagnosticLevel>> = {};
  for (const [category, level] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (!CATEGORY_SET.has(category) || !isLevel(level)) continue;
    out[category as Category] = level;
  }
  return out;
}

function clampCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function clampTarget(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function notifyPlacementChange(): void {
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(PLACEMENT_CHANGE_EVENT));
    }
  } catch {
    /* events unavailable — the write already happened */
  }
}

export function parsePlacement(raw: string | null): PlacementRecord | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const value = parsed as Record<string, unknown>;
    if (typeof value.at !== "string" || value.at.length === 0) return null;
    if (!isLevel(value.level)) return null;
    const level = value.level;
    return {
      v: PLACEMENT_VERSION,
      at: value.at,
      level,
      levelLabel:
        typeof value.levelLabel === "string" && value.levelLabel.length > 0
          ? value.levelLabel
          : LEVEL_LABELS[level],
      answered: clampCount(value.answered),
      score: clamp01(value.score),
      weakCategories: sanitizeAreas(value.weakCategories),
      strengths: sanitizeAreas(value.strengths),
      perCategory: sanitizePerCategory(value.perCategory),
      interests: sanitizeAreas(value.interests, MAX_INTERESTS),
      recommendedPathIds: sanitizeIds(value.recommendedPathIds),
      firstProblemIds: sanitizeIds(value.firstProblemIds),
      dailyTarget: clampTarget(value.dailyTarget),
      cadence: typeof value.cadence === "string" ? value.cadence : "",
      minutesPerDay: clampMinutes(
        typeof value.minutesPerDay === "number" ? value.minutesPerDay : undefined,
      ),
    };
  } catch {
    return null;
  }
}

export function parseDraft(raw: string | null): PlacementDraft | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const value = parsed as Record<string, unknown>;
    return {
      v: PLACEMENT_VERSION,
      at:
        typeof value.at === "string" && value.at.length > 0
          ? value.at
          : new Date().toISOString(),
      areas: sanitizeAreas(value.areas, MAX_INTERESTS),
      minutesPerDay:
        typeof value.minutesPerDay === "number"
          ? clampMinutes(value.minutesPerDay)
          : null,
      answers: sanitizeAnswers(value.answers),
    };
  } catch {
    return null;
  }
}

export function planToRecord(plan: StartingPlan): PlacementRecord {
  return {
    v: PLACEMENT_VERSION,
    at: plan.at,
    level: plan.level,
    levelLabel: plan.levelLabel,
    answered: plan.answered,
    score: plan.score,
    weakCategories: [...plan.weakCategories],
    strengths: [...plan.strengths],
    perCategory: { ...plan.perCategory },
    interests: [...plan.interests],
    recommendedPathIds: plan.recommendedPaths.map((path) => path.id),
    firstProblemIds: [...plan.firstProblemIds],
    dailyTarget: plan.dailyTarget,
    cadence: plan.cadence,
    minutesPerDay: plan.minutesPerDay,
  };
}

/** Persist a finished plan locally. Sync is optional and never requested. */
export function savePlacement(plan: StartingPlan): PlacementRecord {
  const record = planToRecord(plan);
  writeRaw(PLACEMENT_STORAGE_KEY, JSON.stringify(record));
  removeRaw(PLACEMENT_DRAFT_KEY);
  notifyPlacementChange();
  return record;
}

export function readPlacement(): PlacementRecord | null {
  return parsePlacement(readRaw(PLACEMENT_STORAGE_KEY));
}

export function clearPlacement(): void {
  removeRaw(PLACEMENT_STORAGE_KEY);
  notifyPlacementChange();
}

export function saveDraft(input: {
  areas: readonly Category[];
  minutesPerDay: number | null;
  answers: readonly DiagnosticAnswer[];
}): PlacementDraft {
  const draft: PlacementDraft = {
    v: PLACEMENT_VERSION,
    at: new Date().toISOString(),
    areas: sanitizeAreas(input.areas, MAX_INTERESTS),
    minutesPerDay:
      input.minutesPerDay === null ? null : clampMinutes(input.minutesPerDay),
    answers: sanitizeAnswers(input.answers),
  };
  writeRaw(PLACEMENT_DRAFT_KEY, JSON.stringify(draft));
  notifyPlacementChange();
  return draft;
}

export function readDraft(): PlacementDraft | null {
  return parseDraft(readRaw(PLACEMENT_DRAFT_KEY));
}

export function clearDraft(): void {
  removeRaw(PLACEMENT_DRAFT_KEY);
  notifyPlacementChange();
}

/**
 * Rebuild a displayable plan from a stored record. Recommendations are
 * re-ranked from the stored level and weak categories (same inputs, same
 * ranking); the first problem set is the one that was saved.
 */
export function placementToPlan(
  record: PlacementRecord,
  options: StartingPlanOptions = {},
): StartingPlan {
  const fit: DiagnosticScore = {
    answered: record.answered,
    score: record.score,
    level: record.level,
    levelLabel: record.levelLabel,
    perCategory: record.perCategory,
    weakCategories: record.weakCategories,
    strengths: record.strengths,
  };
  const recommendedPaths = recommendPaths(fit, {
    paths: options.paths,
    problems: options.problems,
    interests: record.interests,
    progress: options.progress,
  });
  return {
    at: record.at,
    answered: record.answered,
    score: record.score,
    level: record.level,
    levelLabel: record.levelLabel,
    levelDetail: LEVEL_DETAIL[record.level],
    weakCategories: record.weakCategories,
    strengths: record.strengths,
    perCategory: record.perCategory,
    interests: record.interests,
    recommendedPaths,
    firstProblemIds: record.firstProblemIds,
    dailyTarget: record.dailyTarget,
    cadence:
      record.cadence.length > 0
        ? record.cadence
        : suggestCadence(record.level, record.minutesPerDay).cadence,
    minutesPerDay: record.minutesPerDay,
    summary: summaryFor(fit),
    note: HONEST_NOTE,
  };
}

/* ─────────────────────────────── entry gate ─────────────────────────────── */

export function hasAnyProgress(progress: ProgressMap): boolean {
  return Object.values(progress).some(
    (entry) => Boolean(entry?.attempted || entry?.solved),
  );
}

/**
 * Offer the check only to a clean account: nothing attempted, nothing solved,
 * no saved placement. A draft does not suppress it — the CTA is how a learner
 * resumes.
 */
export function shouldOfferDiagnostic(
  progress: ProgressMap,
  placement: PlacementRecord | null = readPlacement(),
): boolean {
  return !hasAnyProgress(progress) && placement === null;
}
