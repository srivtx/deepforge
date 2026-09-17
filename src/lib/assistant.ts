/**
 * Zero — the offline study assistant for DeepForge.
 *
 * Deterministic, synchronous, catalogue-grounded: it answers only from
 * PROBLEMS / LEARNING_PATHS plus the user's local progress and daily streak.
 * No network, no fetch, no dependencies. Every claim cites `id — title`.
 */

import type {
  Category,
  Difficulty,
  LearningPath,
  Problem,
} from "@/types/problem";
import { getHintTiers } from "@/lib/hints";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getSolveStreak, isTodaySolved } from "@/lib/daily";
import { getConceptStats, getDueConcepts } from "@/lib/concepts";
import { getReadinessScore } from "@/lib/readiness";
import {
  dueReviews,
  getReviewBucketCounts,
  getReviewMap,
} from "@/lib/reviewQueue";
import { CATEGORIES } from "@/data/problems/meta";
import { LEARNING_PATHS } from "@/data/problems/paths";
import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import { LABS, type Lab } from "@/data/labs";
import { getLabTheory } from "@/data/labTheory";
import {
  RESEARCH_CHALLENGES,
  type ResearchChallenge,
  type ResearchMetric,
} from "@/data/research";
import { getResearchTheory } from "@/data/researchTheory";

// ─────────────────────────────────────────────────────────────────────────────
// Lazy problem bank
//
// Answers that cite ids/titles/categories and all progress aggregations only
// need the light PROBLEM_META index. Full records (description, hint, solution)
// are needed for hint/solution answers and description-weighted retrieval, so
// the heavy bank is dynamically imported on demand instead of bundled.
// Explain/playlist/quiz answers warm this cache on first use while every
// synchronous caller falls back to the light index until it lands — merely
// mounting the assistant (or asking "what's due" / "am I ready") never pulls
// the bank. Once loaded, answers are identical to the previously bundled
// behaviour.
// ─────────────────────────────────────────────────────────────────────────────

type ProblemBank = typeof import("@/data/problems");

let problemBank: ProblemBank | null = null;
let problemBankPromise: Promise<ProblemBank> | null = null;

function loadProblemBank(): Promise<ProblemBank> {
  if (problemBankPromise === null) {
    problemBankPromise = import("@/data/problems")
      .then((module) => {
        problemBank = module;
        return module;
      })
      .catch((error: unknown) => {
        problemBankPromise = null;
        throw error;
      });
  }
  return problemBankPromise;
}

function warmProblemBank(): void {
  void loadProblemBank().catch(() => {
    /* offline or chunk failure — the light index keeps answers working */
  });
}

/**
 * Warm the heavy bank once the user actually opens the panel. Mounting the
 * assistant never pulls it, so no route pays for the 5.5k-record chunk at
 * load; opening Zero (or the first explain/playlist/quiz answer) does.
 */
export function warmAssistant(): void {
  warmProblemBank();
}

/** All catalogue entries as (id, title, category, difficulty) tuples. */
function allProblems(): readonly ProblemMeta[] {
  return problemBank?.PROBLEMS ?? PROBLEM_META;
}

/** Light-index lookup, shared by every id → title/category citation. */
const PROBLEM_META_BY_ID: ReadonlyMap<string, ProblemMeta> = new Map(
  PROBLEM_META.map((problem) => [problem.id, problem]),
);

/** Title for a catalogue id; null when the id is unknown. */
export function problemTitle(id: string): string | null {
  return PROBLEM_META_BY_ID.get(id)?.title ?? null;
}

function findProblem(id: string): Problem | null {
  const bank = problemBank?.PROBLEMS;
  if (!bank) return null;
  return bank.find((problem) => problem.id === id) ?? null;
}

function findMeta(id: string): ProblemMeta | null {
  return PROBLEM_META_BY_ID.get(id) ?? null;
}

/** Synthesize a full Problem from the light index for hint-style answers. */
function leanProblem(meta: ProblemMeta, description = ""): Problem {
  return {
    ...meta,
    description,
    starterCode: "",
    solution: "",
    testCases: [],
  };
}

function problemsByCategory(category: Category): readonly ProblemMeta[] {
  return allProblems().filter((problem) => problem.category === category);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type Intent =
  | "next"
  | "explain"
  | "debug"
  | "playlist"
  | "quiz"
  | "plan"
  | "due"
  | "ready"
  | "research"
  | "labs";

/** In-app deep link attached to an answer (e.g. /today, /stats). */
export interface MsgAction {
  label: string;
  href: string;
}

export interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: Intent;
  citations?: string[];
  actions?: MsgAction[];
  at: string;
}

export interface CtxProblem {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  description?: string;
}

export interface Ctx {
  problem?: CtxProblem;
  code?: string;
  /** True when the caller knows the latest run of the attached code failed. */
  lastRunFailed?: boolean;
  /** Attached research challenge id, set from /research/<id>. */
  researchId?: string;
  /** Attached lab id, set from /labs/<id>. */
  labId?: string;
}

interface Answer {
  text: string;
  citations: string[];
  actions?: MsgAction[];
}

// ─────────────────────────────────────────────────────────────────────────────
// classify — deterministic keyword / regex scoring
// ─────────────────────────────────────────────────────────────────────────────

interface IntentRule {
  intent: Intent;
  weight: number;
  pattern: RegExp;
}

const INTENT_RULES: IntentRule[] = [
  // NEXT — "what should I do/solve", "recommend", "practice"
  { intent: "next", weight: 6, pattern: /\bwhat should (?:i|we)\b/ },
  { intent: "next", weight: 5, pattern: /\bnext\b/ },
  { intent: "next", weight: 4, pattern: /\bwhich (?:problem|one|concept)\b/ },
  { intent: "next", weight: 4, pattern: /\bwhere (?:do|should) i (?:start|go)\b/ },
  { intent: "next", weight: 3, pattern: /\brecommend|\bsuggest|\bpractice\b/ },
  { intent: "next", weight: 3, pattern: /\b(?:another|more) (?:problem|one)\b/ },

  // EXPLAIN — "what is", "why", "how does", "explain"
  { intent: "explain", weight: 4, pattern: /\bexplain\b/ },
  { intent: "explain", weight: 4, pattern: /\bwhat(?:'s| is| are)\b/ },
  { intent: "explain", weight: 3, pattern: /\bwhy\b/ },
  { intent: "explain", weight: 3, pattern: /\bhow (?:does|do|is|are)\b/ },
  { intent: "explain", weight: 2, pattern: /\btell me about\b/ },
  {
    intent: "explain",
    weight: 2,
    pattern: /\bmeaning\b|\bdifference between\b|\bintuition\b|\bunderstand\b/,
  },

  // DEBUG — errors, failures, broken code
  { intent: "debug", weight: 5, pattern: /\bbug\b|\bdebug\b|\btraceback\b|\bexception\b/ },
  { intent: "debug", weight: 4, pattern: /\berror\b|\bfails?\b|\bfailing\b|\bbroken\b/ },
  {
    intent: "debug",
    weight: 4,
    pattern: /\bfix\b|\bwrong\b|\bnot working\b|\bdoesn'?t work\b/,
  },

  // PLAYLIST — curated ordered series
  { intent: "playlist", weight: 5, pattern: /\bplaylists?\b|\bcurriculum\b/ },
  { intent: "playlist", weight: 4, pattern: /\bpath\b|\broadmap\b|\bseries\b/ },
  { intent: "playlist", weight: 3, pattern: /\bsequence\b|\bordered list\b/ },

  // QUIZ — self-testing
  { intent: "quiz", weight: 5, pattern: /\bquizzes?\b|\btest me\b|\bflashcards?\b/ },
  { intent: "quiz", weight: 4, pattern: /\bcheck my (?:understanding|knowledge)\b/ },
  { intent: "quiz", weight: 3, pattern: /\bquiz\b/ },

  // PLAN — schedule / streak / interview prep
  { intent: "plan", weight: 5, pattern: /\bplans?\b|\bplanning\b|\bschedules?\b/ },
  { intent: "plan", weight: 4, pattern: /\bstreak\b|\binterview\b/ },
  { intent: "plan", weight: 3, pattern: /\broutine\b|\bprepare\b|\bstudy schedule\b/ },

  // DUE — the spaced review queue and pen-and-paper concepts
  {
    intent: "due",
    weight: 8,
    pattern:
      /\bwhat(?:'s| is| are)?\s+due\b|\bdue (?:today|now|reviews?|problems?)\b|\breview queue\b/,
  },
  {
    intent: "due",
    weight: 7,
    pattern: /\bwhat should i review\b|\banything due\b|\breviews? due\b/,
  },
  { intent: "due", weight: 4, pattern: /\bdue\b/ },
  { intent: "due", weight: 3, pattern: /\breview\b/ },

  // READY — interview readiness score and its weakest component
  { intent: "ready", weight: 9, pattern: /\bam i ready\b|\bhow ready am i\b/ },
  { intent: "ready", weight: 6, pattern: /\breadiness\b|\bready for\b|\bready to\b/ },

  // RESEARCH — beat a baseline on a scored research challenge
  { intent: "research", weight: 7, pattern: /\bresearch\b/ },
  {
    intent: "research",
    weight: 5,
    pattern: /\bbaselines?\b|\bbeat (?:a|the) baseline\b/,
  },

  // LABS — hands-on, dataset-driven practice
  { intent: "labs", weight: 6, pattern: /\blabs?\b/ },
  { intent: "labs", weight: 3, pattern: /\bhands?-on\b/ },
];

/** Ties resolve in this order so classification stays deterministic. */
const INTENT_PRIORITY: Intent[] = [
  "next",
  "debug",
  "quiz",
  "playlist",
  "plan",
  "due",
  "ready",
  "research",
  "labs",
  "explain",
];

export function classify(q: string): Intent {
  const text = (q ?? "").toLowerCase();
  const scores = new Map<Intent, number>();
  for (const rule of INTENT_RULES) {
    if (!rule.pattern.test(text)) continue;
    scores.set(rule.intent, (scores.get(rule.intent) ?? 0) + rule.weight);
  }

  let winner: Intent | null = null;
  let best = 0;
  for (const intent of INTENT_PRIORITY) {
    const score = scores.get(intent) ?? 0;
    if (score > best) {
      winner = intent;
      best = score;
    }
  }
  return winner ?? "explain";
}

// ─────────────────────────────────────────────────────────────────────────────
// retrieve — BM25-lite over the catalogue (lazy index; heavy bank loads async)
// ─────────────────────────────────────────────────────────────────────────────

const TITLE_WEIGHT = 3;
const CATEGORY_WEIGHT = 5;
const DESC_WEIGHT = 1;
const K1 = 1.2;
const B = 0.75;

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

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9+#]+/g);
  if (!matches) return [];
  return matches.filter((t) => !STOPWORDS.has(t));
}

function countOccurrences(tokens: string[], term: string): number {
  let n = 0;
  for (const token of tokens) if (token === term) n += 1;
  return n;
}

interface IndexedDoc {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  titleTokens: string[];
  categoryTokens: string[];
  descTokens: string[];
  len: number;
}

interface SearchIndex {
  docs: IndexedDoc[];
  df: Map<string, number>;
  avgLen: number;
}

let cachedIndex: SearchIndex | null = null;
let cachedIndexHeavy = false;

function buildIndex(): SearchIndex {
  const heavy = problemBank?.PROBLEMS ?? null;
  const heavyById = heavy
    ? new Map(heavy.map((problem) => [problem.id, problem]))
    : null;
  const docs: IndexedDoc[] = allProblems().map((p) => {
    const titleTokens = tokenize(p.title);
    const categoryTokens = tokenize(p.category);
    const descTokens = tokenize(heavyById?.get(p.id)?.description ?? "");
    const len = Math.max(
      1,
      TITLE_WEIGHT * titleTokens.length +
        CATEGORY_WEIGHT * categoryTokens.length +
        DESC_WEIGHT * descTokens.length,
    );
    return {
      id: p.id,
      title: p.title,
      category: p.category,
      difficulty: p.difficulty,
      titleTokens,
      categoryTokens,
      descTokens,
      len,
    };
  });

  const df = new Map<string, number>();
  for (const doc of docs) {
    const unique = new Set([
      ...doc.titleTokens,
      ...doc.categoryTokens,
      ...doc.descTokens,
    ]);
    for (const term of unique) df.set(term, (df.get(term) ?? 0) + 1);
  }

  let totalLen = 0;
  for (const doc of docs) totalLen += doc.len;
  const avgLen = totalLen / Math.max(1, docs.length);

  return { docs, df, avgLen };
}

function getIndex(): SearchIndex {
  const heavy = problemBank !== null;
  if (!cachedIndex || cachedIndexHeavy !== heavy) {
    cachedIndex = buildIndex();
    cachedIndexHeavy = heavy;
  }
  return cachedIndex;
}

export interface Retrieved {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  score: number;
}

export function retrieve(q: string, k = 5): Retrieved[] {
  warmProblemBank();
  const terms = Array.from(new Set(tokenize(q ?? "")));
  if (terms.length === 0 || k <= 0) return [];

  const { docs, df, avgLen } = getIndex();
  const total = docs.length;
  const results: Retrieved[] = [];

  for (const doc of docs) {
    let score = 0;
    for (const term of terms) {
      const docFreq = df.get(term);
      if (!docFreq) continue;
      const tf =
        TITLE_WEIGHT * countOccurrences(doc.titleTokens, term) +
        CATEGORY_WEIGHT * countOccurrences(doc.categoryTokens, term) +
        DESC_WEIGHT * countOccurrences(doc.descTokens, term);
      if (tf === 0) continue;
      const idf = Math.log(1 + (total - docFreq + 0.5) / (docFreq + 0.5));
      score +=
        (idf * (tf * (K1 + 1))) /
        (tf + K1 * (1 - B + (B * doc.len) / avgLen));
    }
    if (score > 0) {
      results.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        difficulty: doc.difficulty,
        score,
      });
    }
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  return results.slice(0, k);
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers shared by the intent templates
// ─────────────────────────────────────────────────────────────────────────────

const MATCH_THRESHOLD = 1.0;

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

function compareIds(a: { id: string }, b: { id: string }): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

function byDifficultyThenId(
  a: { id: string; difficulty: Difficulty },
  b: { id: string; difficulty: Difficulty },
): number {
  return (
    DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
    compareIds(a, b)
  );
}

function cite(id: string): string {
  const problem = findProblem(id) ?? findMeta(id);
  return problem ? `${problem.id} — ${problem.title}` : id;
}

function firstSentence(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/[^.!?]+[.!?]/);
  const sentence = (match ? match[0] : trimmed).trim();
  if (sentence.length <= 200) return sentence;
  return `${sentence.slice(0, 200).trimEnd()}…`;
}

function clipLine(text: string, max = 120): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

interface ProgressStats {
  total: number;
  solved: number;
  attempted: number;
  solvedLast7: number;
}

function progressStats(): ProgressStats {
  const map = getProgress();
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const problems = allProblems();
  let solved = 0;
  let attempted = 0;
  let solvedLast7 = 0;
  for (const problem of problems) {
    const progress = map[problem.id];
    if (!progress) continue;
    if (progress.attempted) attempted += 1;
    if (progress.solved) {
      solved += 1;
      const at = progress.solvedAt ? Date.parse(progress.solvedAt) : NaN;
      if (Number.isFinite(at) && now - at <= week) solvedLast7 += 1;
    }
  }
  return { total: problems.length, solved, attempted, solvedLast7 };
}

interface CategoryStat {
  category: Category;
  total: number;
  solved: number;
  ratio: number;
}

function categoryStats(): CategoryStat[] {
  const map = getProgress();
  return CATEGORIES.map((meta) => {
    const problems = problemsByCategory(meta.name);
    const solved = problems.filter((p) => map[p.id]?.solved).length;
    return {
      category: meta.name,
      total: problems.length,
      solved,
      ratio: problems.length === 0 ? 1 : solved / problems.length,
    };
  });
}

function rankedCategories(): CategoryStat[] {
  return [...categoryStats()].sort(
    (a, b) =>
      a.ratio - b.ratio ||
      a.solved - b.solved ||
      (a.category < b.category ? -1 : a.category > b.category ? 1 : 0),
  );
}

function weakestCategory(): Category {
  const ranked = rankedCategories();
  return ranked[0]?.category ?? CATEGORIES[0].name;
}

function unsolvedIn(category: Category, map: ProgressMap): ProblemMeta[] {
  return problemsByCategory(category)
    .filter((p) => !map[p.id]?.solved)
    .sort(byDifficultyThenId);
}

function uniqueCategories(values: Category[]): Category[] {
  const out: Category[] = [];
  for (const value of values) if (!out.includes(value)) out.push(value);
  return out;
}

function closestCategories(q: string, k: number): Category[] {
  const terms = new Set(tokenize(q));
  const scored = CATEGORIES.map((meta) => {
    const tokens = tokenize(meta.name);
    const hits = tokens.filter((t) => terms.has(t)).length;
    return { category: meta.name, hits };
  })
    .filter((entry) => entry.hits > 0)
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        (a.category < b.category ? -1 : a.category > b.category ? 1 : 0),
    );
  return scored.slice(0, k).map((entry) => entry.category);
}

function looseTokenMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  return a.startsWith(b) || b.startsWith(a);
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent templates
// ─────────────────────────────────────────────────────────────────────────────

function answerNext(ctx: Ctx): Answer {
  const map = getProgress();
  const stats = progressStats();
  let focus: Category = ctx.problem ? ctx.problem.category : weakestCategory();
  let header = ctx.problem
    ? `You're on ${cite(ctx.problem.id)} (${ctx.problem.category}).`
    : `You've solved ${stats.solved} of ${stats.total} problems. ${focus} is your weakest area so far.`;

  let pool = unsolvedIn(focus, map);
  if (pool.length === 0 && ctx.problem) {
    focus = weakestCategory();
    pool = unsolvedIn(focus, map);
    header = `Everything in ${ctx.problem.category} is solved — nice.`;
  }

  if (pool.length === 0) {
    return {
      text:
        `${header} The whole catalogue is solved, so there is nothing left to recommend. ` +
        `Try "quiz me" for spaced review or revisit a favourite hard problem.`,
      citations: [],
    };
  }

  const picks = pool.slice(0, 3);
  const lines = [header, "", `Next up in ${focus}, easiest first:`];
  picks.forEach((p, i) => {
    lines.push(`${i + 1}. ${cite(p.id)} (${p.difficulty})`);
  });
  lines.push("");
  lines.push("Open any pick from the citation chips, or ask me to explain one.");
  return { text: lines.join("\n"), citations: picks.map((p) => p.id) };
}

function explainProblem(problem: Problem): Answer {
  const [nudge, approach] = getHintTiers(problem);
  const marker = approach.text.indexOf(" This problem asks:");
  const approachOnly =
    marker > 0 ? approach.text.slice(0, marker).trim() : approach.text;
  const lines = [
    `${cite(problem.id)} — ${problem.category}, ${problem.difficulty}`,
    "",
    firstSentence(problem.description),
    "",
    `Nudge: ${nudge.text}`,
    `Approach: ${approachOnly}`,
  ];
  return { text: lines.join("\n"), citations: [problem.id] };
}

function honestFallback(q: string, matches: Retrieved[]): Answer {
  const fromMatches = uniqueCategories(matches.map((m) => m.category));
  const categories =
    fromMatches.length > 0 ? fromMatches.slice(0, 3) : closestCategories(q, 3);
  const citations = matches
    .filter((m) => m.score >= MATCH_THRESHOLD * 0.5)
    .slice(0, 3)
    .map((m) => m.id);

  if (categories.length === 0) {
    return {
      text:
        "I couldn't find that in the catalogue. I only answer from DeepForge's " +
        'problems — try naming a concept ("softmax", "eigenvalues") or a category ' +
        "like Linear Algebra, Deep Learning, or Statistics.",
      citations,
    };
  }
  return {
    text:
      `I couldn't find that in the catalogue; closest categories: ${categories.join(", ")}. ` +
      "Try naming a concept or one of those categories and I'll pull real problems.",
    citations,
  };
}

function answerExplain(q: string, ctx: Ctx): Answer {
  if (ctx.problem) {
    const attached = findProblem(ctx.problem.id);
    if (attached) return explainProblem(attached);
    const meta = findMeta(ctx.problem.id);
    if (meta) {
      return explainProblem(leanProblem(meta, ctx.problem.description ?? ""));
    }
    const description = ctx.problem.description
      ? firstSentence(ctx.problem.description)
      : "No description is attached to this problem right now.";
    return {
      text:
        `${cite(ctx.problem.id)} — ${ctx.problem.category}, ${ctx.problem.difficulty}\n\n` +
        `${description}\n\n` +
        "I can go deeper once the full problem is loaded from the catalogue.",
      citations: [ctx.problem.id],
    };
  }

  const matches = retrieve(q, 3);
  const strong = matches.filter((m) => m.score >= MATCH_THRESHOLD);
  if (strong.length === 0) return honestFallback(q, matches);

  const fullTop = findProblem(strong[0].id);
  const metaTop = fullTop ? null : findMeta(strong[0].id);
  if (!fullTop && !metaTop) return honestFallback(q, matches);

  const top = fullTop ?? leanProblem(metaTop!);

  const [nudge] = getHintTiers(top);
  const lines = [
    `Closest matches in the catalogue for "${clipLine(q, 80)}":`,
    "",
    ...strong.map(
      (m, i) => `${i + 1}. ${cite(m.id)} (${m.category}, ${m.difficulty})`,
    ),
    "",
    `Start with ${cite(top.id)}. ${firstSentence(top.description)}`,
    `Nudge: ${nudge.text}`,
  ];
  return {
    text: lines.join("\n"),
    citations: strong.map((m) => m.id),
  };
}

interface Finding {
  weight: number;
  line: string;
  question: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function analyzeCode(code: string, ctx: Ctx): Finding[] {
  const findings: Finding[] = [];
  const trimmedLines = code
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // 1. range(len(...)) loops that index with the loop variable.
  const loopPattern = /for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*len\(/;
  for (const line of trimmedLines) {
    const match = line.match(loopPattern);
    if (!match) continue;
    const varName = match[1];
    const indexPattern = new RegExp(`\\[\\s*${escapeRegExp(varName)}\\s*\\]`);
    if (indexPattern.test(code)) {
      findings.push({
        weight: 3,
        line,
        question:
          `this loops over range(len(...)) and then indexes with ${varName}. ` +
          "Could you iterate the values directly or use enumerate()? Index loops are where off-by-one bugs hide.",
      });
    }
  }

  // 2. exp() without max-subtraction (softmax / overflow).
  const expLine = trimmedLines.find((line) => /(?:math\.)?exp\s*\(/.test(line));
  if (
    expLine &&
    !/\bmax\s*\(|logsumexp|max_value|max_?z\b/.test(code)
  ) {
    findings.push({
      weight: 3,
      line: expLine,
      question:
        "this calls exp(...) without subtracting a max first. If it feeds a softmax or probability, large inputs overflow — what is the largest value the tests pass in?",
    });
  }

  // 3. Division / log without an epsilon guard.
  const divisionLine = trimmedLines.find(
    (line) => /[^/*]\/\s*[A-Za-z(]/.test(line) && !line.startsWith("#"),
  );
  const logLine = trimmedLines.find((line) => /(?:math\.)?log\s*\(/.test(line));
  const guardCandidate = divisionLine ?? logLine;
  if (guardCandidate && !/1e-\d|epsilon|eps\b|EPS/.test(code)) {
    findings.push({
      weight: 2,
      line: guardCandidate,
      question:
        "division or log with no epsilon guard — can the denominator or log argument be zero on any edge test case?",
    });
  }

  // 4. axis= / keepdims broadcasting.
  const axisLine = trimmedLines.find((line) => /axis\s*=/.test(line));
  if (axisLine) {
    findings.push({
      weight: 2,
      line: axisLine,
      question:
        "this passes axis=...; are you certain which dimension it collapses and that the remaining shape matches the expected output? keepdims often changes broadcasting.",
    });
  }

  // 5. len(...) + 1 off-by-one.
  const offByOne = trimmedLines.find((line) =>
    /len\s*\([^)]*\)\s*\+\s*1/.test(line),
  );
  if (offByOne) {
    findings.push({
      weight: 4,
      line: offByOne,
      question:
        "len(...) + 1 adds one extra element — is that boundary intended or an off-by-one? What does the smallest test case expect?",
    });
  }

  // 6. Sum without normalization when the problem wants an average.
  const sumLine = trimmedLines.find((line) => /\bsum\s*\(/.test(line));
  const wantsAverage = ctx.problem?.description
    ? /mean|average|expected|normalize|proportion/i.test(
        ctx.problem.description,
      )
    : false;
  const hasDivision = /[^/*]\/\s*[A-Za-z(]/.test(code);
  if (sumLine && wantsAverage && !hasDivision) {
    findings.push({
      weight: 3,
      line: sumLine,
      question:
        "you sum values but I don't see a division by n/len(...). If the target is a mean or probability, is the normalisation missing?",
    });
  }

  return findings.sort((a, b) => b.weight - a.weight).slice(0, 3);
}

function answerDebug(ctx: Ctx): Answer {
  const code = ctx.code ?? "";
  if (code.trim().length === 0) {
    return {
      text:
        "I debug against your code, but I don't have any yet. Open a problem or paste " +
        "the function below your message, then ask again. I'll point at suspicious " +
        "lines with questions instead of handing you the solution.",
      citations: ctx.problem ? [ctx.problem.id] : [],
    };
  }

  const heading = ctx.problem
    ? `Reading ${cite(ctx.problem.id)} (${ctx.problem.category}).`
    : `Reading your code (${code.split(/\r?\n/).length} lines).`;
  const findings = analyzeCode(code, ctx);

  if (findings.length === 0) {
    return {
      text:
        `${heading}\n\n` +
        "I don't see the classic smells (index loops, exp overflow, missing epsilon, " +
        "axis/keepdims, len+1, missing normalisation). Two questions: what does the " +
        "first failing test expect, and what do your intermediate values look like on " +
        "that input? Add a print() and paste the result here.",
      citations: ctx.problem ? [ctx.problem.id] : [],
    };
  }

  const lines = [
    heading,
    "",
    "Questions to check, most suspicious first:",
    ...findings.map(
      (finding, i) =>
        `${i + 1}. "${clipLine(finding.line)}" — ${finding.question}`,
    ),
    "",
    "I won't hand you the solution — answer these, fix, re-run, and ask me again.",
  ];
  return {
    text: lines.join("\n"),
    citations: ctx.problem ? [ctx.problem.id] : [],
  };
}

type Theme =
  | { kind: "path"; path: LearningPath }
  | { kind: "category"; category: Category };

function resolveTheme(q: string, ctx: Ctx): Theme {
  const lower = q.toLowerCase();
  for (const path of LEARNING_PATHS) {
    if (lower.includes(path.title.toLowerCase())) return { kind: "path", path };
  }

  const qTokens = new Set(tokenize(q));
  for (const path of LEARNING_PATHS) {
    const titleTokens = tokenize(path.title);
    const hits = titleTokens.filter((t) =>
      Array.from(qTokens).some((queryToken) => looseTokenMatch(t, queryToken)),
    ).length;
    if (hits >= 2) return { kind: "path", path };
  }

  for (const meta of CATEGORIES) {
    const nameTokens = tokenize(meta.name);
    if (
      nameTokens.length > 0 &&
      nameTokens.every((t) => qTokens.has(t))
    ) {
      return { kind: "category", category: meta.name };
    }
  }

  if (ctx.problem) return { kind: "category", category: ctx.problem.category };

  const top = retrieve(q, 1)[0];
  if (top && top.score >= MATCH_THRESHOLD) {
    return { kind: "category", category: top.category };
  }
  return { kind: "category", category: weakestCategory() };
}

function answerPlaylist(q: string, ctx: Ctx): Answer {
  const theme = resolveTheme(q, ctx);

  if (theme.kind === "path") {
    const map = getProgress();
    const remaining = theme.path.problemIds
      .map((id) => findProblem(id) ?? findMeta(id))
      .filter((p): p is ProblemMeta => Boolean(p))
      .filter((p) => !map[p.id]?.solved);
    const list = remaining.slice(0, 12);
    if (list.length === 0) {
      return {
        text:
          `${theme.path.title} is fully solved — nothing left in this path. ` +
          'Ask "what should I do next?" for the next weak area.',
        citations: [],
      };
    }
    const lines = [
      `${theme.path.title} — playlist (${list.length} problems):`,
      "",
      ...list.map((p, i) => `${i + 1}. ${cite(p.id)} (${p.difficulty})`),
      "",
      "Order follows the path sequence, so earlier problems unlock later ones.",
    ];
    return { text: lines.join("\n"), citations: list.map((p) => p.id) };
  }

  const map = getProgress();
  let category = theme.category;
  let pool = unsolvedIn(category, map).slice(0, 12);
  if (pool.length === 0) {
    const next = rankedCategories().find((c) => c.ratio < 1);
    if (!next) {
      return {
        text:
          "Everything in the catalogue is solved — no playlist left to build. " +
          'Try "quiz me" for spaced review instead.',
        citations: [],
      };
    }
    category = next.category;
    pool = unsolvedIn(category, map).slice(0, 12);
  }

  const lines = [
    `${category} — playlist (${pool.length} problems):`,
    "",
    ...pool.map((p, i) => `${i + 1}. ${cite(p.id)} (${p.difficulty})`),
    "",
    "Ordered easiest → hardest; ties follow catalogue order.",
  ];
  return { text: lines.join("\n"), citations: pool.map((p) => p.id) };
}

function detectCategory(q: string, ctx: Ctx): Category {
  const qTokens = new Set(tokenize(q));
  for (const meta of CATEGORIES) {
    const nameTokens = tokenize(meta.name);
    if (nameTokens.length > 0 && nameTokens.every((t) => qTokens.has(t))) {
      return meta.name;
    }
  }
  if (ctx.problem) return ctx.problem.category;
  const top = retrieve(q, 1)[0];
  if (top && top.score >= MATCH_THRESHOLD) return top.category;
  return weakestCategory();
}

function answerQuiz(q: string, ctx: Ctx): Answer {
  const category = detectCategory(q, ctx);
  const map = getProgress();
  const all = [...problemsByCategory(category)].sort(byDifficultyThenId);
  const unsolved = all.filter((p) => !map[p.id]?.solved);

  const picked: ProblemMeta[] = [];
  const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
  for (const difficulty of difficulties) {
    const hit = unsolved.find(
      (p) => p.difficulty === difficulty && !picked.includes(p),
    );
    if (hit) picked.push(hit);
  }
  for (const problem of unsolved) {
    if (picked.length >= 3) break;
    if (!picked.includes(problem)) picked.push(problem);
  }
  for (const problem of all) {
    if (picked.length >= 3) break;
    if (!picked.includes(problem)) picked.push(problem);
  }

  const lines = [
    `Quiz — ${category}. Three problems, no timer; work them on paper or open them.`,
    "",
    ...picked.map((p) => `- [ ] ${cite(p.id)} (${p.difficulty})`),
    "",
    'When you finish (or get stuck), ask "explain <id>" and I\'ll walk through the approach.',
  ];
  return { text: lines.join("\n"), citations: picked.map((p) => p.id) };
}

function nextUnsolved(
  category: Category,
  count: number,
  map: ProgressMap,
  cursors: Map<Category, number>,
): ProblemMeta[] {
  const all = [...problemsByCategory(category)].sort(byDifficultyThenId);
  let index = cursors.get(category) ?? 0;
  const picked: ProblemMeta[] = [];
  while (index < all.length && picked.length < count) {
    const problem = all[index];
    index += 1;
    if (!map[problem.id]?.solved) picked.push(problem);
  }
  cursors.set(category, index);
  return picked;
}

function answerPlan(): Answer {
  const map = getProgress();
  const stats = progressStats();
  const streak = getSolveStreak();
  const today = isTodaySolved();
  const remaining = stats.total - stats.solved;

  const pace =
    stats.solvedLast7 > 0 ? Math.max(1, Math.round(stats.solvedLast7 / 7)) : 2;
  const perDay = Math.max(1, Math.min(3, pace));

  const lines = [
    `7-day light plan — ${stats.solved}/${stats.total} solved, ` +
      `${stats.solvedLast7} in the last 7 days, solve streak ${streak}` +
      `${today ? " (today done)" : " (today not done yet)"}.`,
    "",
    `Daily target: ${perDay} problem${perDay === 1 ? "" : "s"} ` +
      `(~${perDay * 10}–${perDay * 15} min). Day 7 is review.`,
    "",
  ];

  const citations: string[] = [];
  const focus = rankedCategories().slice(0, 3);
  const slots = focus.length > 0 ? focus : [];
  const cursors = new Map<Category, number>();
  const dayCategories = [0, 1, 2, 0, 1, 2]
    .map((i) => slots[i])
    .filter((slot): slot is CategoryStat => Boolean(slot));

  if (remaining === 0) {
    lines.push(
      "Everything in the catalogue is solved. Keep the streak alive with one Daily " +
        "problem per day and re-solve a Hard pick from time to time.",
    );
  } else {
    for (let day = 1; day <= 6; day += 1) {
      const slot = dayCategories[(day - 1) % Math.max(1, dayCategories.length)];
      if (!slot) continue;
      const picks = nextUnsolved(slot.category, perDay, map, cursors);
      const pickedText =
        picks.length > 0
          ? picks.map((p) => cite(p.id)).join(", ")
          : `all ${slot.total} solved — review one hard pick instead`;
      lines.push(
        `Day ${day} — ${slot.category} (${slot.solved}/${slot.total} solved): ${pickedText}`,
      );
      citations.push(...picks.map((p) => p.id));
    }
  }

  const review = allProblems()
    .filter((p) => map[p.id]?.attempted && !map[p.id]?.solved)
    .sort(byDifficultyThenId)
    .slice(0, 3);
  const reviewText =
    review.length > 0
      ? `re-attempt ${review.map((p) => cite(p.id)).join(", ")}`
      : `take a 3-problem quiz from ${focus[0]?.category ?? weakestCategory()}`;
  lines.push(`Day 7 — Review: ${reviewText}; then keep your streak with today's Daily problem.`);
  citations.push(...review.map((p) => p.id));

  return { text: lines.join("\n"), citations: Array.from(new Set(citations)).slice(0, 16) };
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

const TODAY_ACTION: MsgAction = { label: "Open Today", href: "/today" };
const STATS_ACTION: MsgAction = { label: "Open Stats", href: "/stats" };
const RESEARCH_ACTION: MsgAction = { label: "Open Research", href: "/research" };
const LABS_ACTION: MsgAction = { label: "Open Labs", href: "/labs" };

function answerDue(): Answer {
  const now = new Date();
  const reviews = getReviewMap(now);
  const counts = getReviewBucketCounts(reviews, now);
  const codeDue = counts.due + counts.learning;
  const queue = codeDue > 0 ? dueReviews(reviews, PROBLEM_META_BY_ID, now) : [];
  const conceptStats = getConceptStats(now);
  const concepts = conceptStats.due > 0 ? getDueConcepts(now) : [];

  if (codeDue === 0 && conceptStats.due === 0) {
    const scheduled = counts.scheduled + counts.new;
    const ahead =
      scheduled > 0
        ? ` ${scheduled} ${plural(scheduled, "review is", "reviews are")} scheduled ahead.`
        : "";
    return {
      text:
        `Nothing is due right now.${ahead} ` +
        "Solve or review a problem and it enters the spaced queue; " +
        'ask "am I ready?" for the readiness picture.',
      citations: [],
      actions: [TODAY_ACTION],
    };
  }

  const headline: string[] = [];
  if (codeDue > 0) {
    headline.push(`${codeDue} code ${plural(codeDue, "review", "reviews")}`);
  }
  if (conceptStats.due > 0) {
    headline.push(
      `${conceptStats.due} ${plural(conceptStats.due, "concept", "concepts")}`,
    );
  }

  const lines = [`Due now: ${headline.join(", ")}.`];
  if (queue.length > 0) {
    lines.push(
      "Code queue: " +
        queue
          .slice(0, 3)
          .map((item) => `${item.id} — ${item.meta.title}`)
          .join(", ") +
        ".",
    );
  }
  if (concepts.length > 0) {
    lines.push(`Concepts: ${concepts.slice(0, 3).map((concept) => concept.title).join(", ")}.`);
  }
  lines.push("Open Today to run the session — code reviews first, then pen-and-paper.");

  return {
    text: lines.join("\n"),
    citations: queue.slice(0, 3).map((item) => item.id),
    actions: [TODAY_ACTION],
  };
}

interface ReadinessComponent {
  label: string;
  value: number;
  advice: string;
}

function answerReady(): Answer {
  const score = getReadinessScore();
  const components: ReadinessComponent[] = [
    {
      label: "coverage",
      value: score.coverage,
      advice: "solve across more categories; the mean solved share over all 15 is the anchor",
    },
    {
      label: "retention",
      value: score.retention,
      advice: "run the due reviews; attempted problems are decaying past the retention threshold",
    },
    {
      label: "balance",
      value: score.balance,
      advice: "close the weakest category and move your Easy/Medium/Hard mix toward the catalogue's",
    },
    {
      label: "consistency",
      value: score.consistency,
      advice: "study on more distinct days; 14 active days in the last 28 saturate it",
    },
  ];
  let weakest = components[0];
  for (const component of components) {
    if (component.value < weakest.value) weakest = component;
  }

  return {
    text:
      `Readiness ${score.value}/100 — coverage ${score.coverage}, retention ${score.retention}, ` +
      `balance ${score.balance}, consistency ${score.consistency}.\n\n` +
      `Weakest component: ${weakest.label} (${weakest.value}/100) — ${weakest.advice}.`,
    citations: [],
    actions: [STATS_ACTION],
  };
}

function answerResearch(): Answer {
  return {
    text:
      "Research challenges are scored, open-ended tasks: read the premise and " +
      "dataset, beat the baseline on the held-out metric, and your run becomes " +
      "the latest best result.\n\n" +
      "Open Research to pick a challenge or hand in a submission.",
    citations: [],
    actions: [RESEARCH_ACTION],
  };
}

function answerLabs(): Answer {
  return {
    text:
      "Hands-on labs ship a dataset, a baseline, and a target: implement " +
      "predict(train_X, train_y, test_X) in Python, respect the constraints, " +
      "and score above the target on the held-out rows.\n\n" +
      "Open Labs to start one — guided lab trails live there too.",
    citations: [],
    actions: [LABS_ACTION],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Research + lab context answers
//
// `routeContext` attaches /research/<id> and /labs/<id>; these builders answer
// the chips generated for those surfaces from the stored challenge/lab record,
// the theory notes, and the same metric semantics the scorers apply. Research
// and lab ids are not catalogue ids, so these answers never cite.
// ─────────────────────────────────────────────────────────────────────────────

const RESEARCH_BY_ID: ReadonlyMap<string, ResearchChallenge> = new Map(
  RESEARCH_CHALLENGES.map((challenge) => [challenge.id, challenge]),
);

const LAB_BY_ID: ReadonlyMap<string, Lab> = new Map(
  LABS.map((lab) => [lab.id, lab]),
);

function findResearchChallenge(id?: string): ResearchChallenge | null {
  return id ? RESEARCH_BY_ID.get(id) ?? null : null;
}

function findLab(id?: string): Lab | null {
  return id ? LAB_BY_ID.get(id) ?? null : null;
}

/** Short label for a scoring metric, shared by research and lab answers. */
function metricName(metric: ResearchMetric): string {
  switch (metric) {
    case "accuracy":
      return "accuracy";
    case "f1":
      return "F1";
    case "mse":
      return "MSE";
    case "r2":
      return "R²";
  }
}

/** Four decimals, trailing zeros trimmed — "0.6667", "0.3", "400". */
function formatMetric(value: number): string {
  return String(Number(value.toFixed(4)));
}

/** The rule the scorer applies, mirroring the harness metric branches. */
function metricSemantics(metric: ResearchMetric): string {
  switch (metric) {
    case "accuracy":
      return "predictions are rounded to the nearest integer and compared with the labels, and the score is the fraction of hidden rows that match";
    case "f1":
      return "predictions are rounded to the nearest integer, then F1 is computed for the positive class as 2*TP / (2*TP + FP + FN)";
    case "mse":
      return "each prediction is compared with its label and the squared errors are averaged over the hidden rows";
    case "r2":
      return "the score is 1 - SS_res/SS_tot over the hidden rows, and 0 when the labels have no variance";
  }
}

function metricPrompt(metric: ResearchMetric): string {
  return `How is ${metricName(metric)} scored?`;
}

function answerResearchBaseline(challenge: ResearchChallenge): Answer {
  const theory = getResearchTheory(challenge.id);
  const section =
    theory?.sections.find((entry) => /baseline/i.test(entry.heading)) ??
    theory?.sections.find((entry) => /baseline/i.test(entry.body));
  const note = section
    ? clipLine(section.body, 220)
    : theory
      ? clipLine(theory.premise, 220)
      : null;
  const lines = [
    `${challenge.title} — baseline: ${challenge.baselineName} at ` +
      `${formatMetric(challenge.baselineScore)} ${metricName(challenge.metric)}. ` +
      `${challenge.higherIsBetter ? "Higher" : "Lower"} is better, and the ` +
      "comparison is strict: a tie scores as a loss.",
  ];
  if (note) lines.push(note);
  return { text: lines.join(" "), citations: [] };
}

function answerResearchMetric(challenge: ResearchChallenge): Answer {
  return {
    text:
      `${challenge.title} is scored on ${metricName(challenge.metric)} ` +
      `(${challenge.higherIsBetter ? "higher" : "lower"} is better) over ` +
      `${challenge.testData.features.length} hidden test rows: ` +
      `${metricSemantics(challenge.metric)}. ` +
      "Your solve(train_X, train_y, test_X) returns one prediction per test " +
      "row, and the harness scores them locally in the browser.",
    citations: [],
  };
}

function answerResearchHint(challenge: ResearchChallenge): Answer {
  return {
    text: `Hint for ${challenge.title}: ${challenge.hint}`,
    citations: [],
  };
}

function answerResearchData(challenge: ResearchChallenge): Answer {
  const features = challenge.trainData.features[0]?.length ?? 0;
  return {
    text:
      `${challenge.title} — ${challenge.trainData.features.length} training ` +
      `rows, ${challenge.testData.features.length} hidden test rows, ` +
      `${features} feature${features === 1 ? "" : "s"} per row. ` +
      clipLine(challenge.datasetDescription, 260),
    citations: [],
  };
}

function answerLabTarget(lab: Lab): Answer {
  const bound = lab.higherIsBetter ? "at least" : "at most";
  return {
    text:
      `${lab.title} scores your predict() on ` +
      `${lab.testData.features.length} held-out rows, and a run passes when ` +
      `${metricName(lab.metric)} is ${bound} ${formatMetric(lab.target)} ` +
      `(baseline ${formatMetric(lab.baseline)}, ` +
      `${lab.higherIsBetter ? "higher" : "lower"} is better). ` +
      "The best score is kept in this browser.",
    citations: [],
  };
}

function answerLabTeach(lab: Lab): Answer {
  const theory = getLabTheory(lab.id);
  return {
    text:
      `${lab.title} (${lab.category}, ${lab.difficulty}): ` +
      `${theory?.teaches ?? lab.blurb} ` +
      "You implement predict(train_X, train_y, test_X) and are scored on " +
      `${metricName(lab.metric)} against a target of ${formatMetric(lab.target)}.`,
    citations: [],
  };
}

function answerLabHint(lab: Lab): Answer {
  return {
    text: `Hint for ${lab.title}: ${lab.hint}`,
    citations: [],
  };
}

function answerLabTime(lab: Lab): Answer {
  const minutes = Math.floor(lab.timeLimitSeconds / 60);
  const seconds = lab.timeLimitSeconds % 60;
  const limit =
    seconds === 0
      ? `${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${minutes} min ${seconds} s`;
  return {
    text:
      `A ${lab.title} run gets ${limit} (${lab.timeLimitSeconds} seconds) to ` +
      `score ${lab.testData.features.length} held-out rows. The clock starts ` +
      "when you press start, counts down live, and the run locks when it " +
      "expires — reset it to try again.",
    citations: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contextual prompt answers
//
// Chips generated by `contextPrompts` must answer from the attached context
// alone — no retrieval-heavy path and no requirement that the full catalogue
// bank has loaded. The router below recognizes the generated strings
// (case/punctuation tolerant) and maps them onto context-grounded templates;
// anything else falls through to the regular intent classifier.
// ─────────────────────────────────────────────────────────────────────────────

function normalizePromptText(text: string): string {
  return (text ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/, "");
}

const PROMPT_REVIEW_CODE = normalizePromptText("Review my code");
const PROMPT_WHY_FAILING = normalizePromptText("Why is my code failing?");
const PROMPT_WALKTHROUGH = normalizePromptText("Walk through my approach");
const PROMPT_EDGE_CASES = normalizePromptText("What edge cases am I missing?");
const PROMPT_SIMILAR = normalizePromptText("Find me a similar problem");
const PROMPT_RESEARCH_BASELINE = normalizePromptText("What's the baseline?");
const PROMPT_RESEARCH_DATA = normalizePromptText("What does the data look like?");
const PROMPT_LAB_TARGET = normalizePromptText("What's the target?");
const PROMPT_LAB_TEACH = normalizePromptText("What does this lab teach?");
const PROMPT_LAB_TIME = normalizePromptText("How long is the run?");
const PROMPT_HINT = normalizePromptText("Give me a hint");

/** Cite the attached problem only when the id is a real catalogue entry. */
function contextCitations(ctx: Ctx): string[] {
  const id = ctx.problem?.id;
  return id && findMeta(id) ? [id] : [];
}

function answerReview(ctx: Ctx): Answer {
  const base = answerDebug(ctx);
  return { ...base, citations: contextCitations(ctx) };
}

function answerWhyFailing(ctx: Ctx): Answer {
  const base = answerReview(ctx);
  if ((ctx.code ?? "").trim().length === 0) return base;
  const lead =
    ctx.lastRunFailed === true
      ? "Your latest run did not pass all tests."
      : "No failed run is attached to this context, so start with the usual suspects.";
  return { ...base, text: `${lead}\n\n${base.text}` };
}

function answerWalkthrough(ctx: Ctx): Answer {
  const heading = ctx.problem
    ? `Walking through your approach on ${cite(ctx.problem.id)} (${ctx.problem.category}).`
    : "Walking through your approach.";
  const citations = contextCitations(ctx);
  const code = ctx.code ?? "";

  if (code.trim().length === 0) {
    return {
      text:
        `${heading}\n\nI don't have any code yet. Open a problem or paste your ` +
        "function below your message and ask again — then I'll trace the shape " +
        "of your approach without handing you the answer.",
      citations,
    };
  }

  const lines = code.split(/\r?\n/);
  const defs: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*def\s+([A-Za-z_]\w*)\s*\(/);
    if (match) defs.push(match[1]);
  }
  const loops = lines.filter((line) => /\b(?:for|while)\b/.test(line)).length;
  const branches = lines.filter((line) =>
    /\b(?:if|elif|else)\b/.test(line),
  ).length;
  const returns = lines.filter((line) => /\breturn\b/.test(line)).length;

  const shape = [
    defs.length > 0 ? `functions ${defs.join(", ")}` : "no function defined yet",
    `${loops} loop${loops === 1 ? "" : "s"}`,
    `${branches} branch${branches === 1 ? "" : "es"}`,
    `${returns} return${returns === 1 ? "" : "s"}`,
  ];

  const questions = [
    defs.length > 0
      ? `Does ${defs[0]}() match the exact signature the tests call, and return the type they compare against?`
      : "Which function name should the tests call, and does your code define it?",
    loops > 0
      ? "What invariant holds before and after each loop body, and does the loop behave on empty or single-element input?"
      : "Without a loop, does the computation still hold on the smallest test case?",
    returns > 0
      ? "Step one small test input through every branch — does each return produce the expected value?"
      : "Where does the function produce its result if nothing is returned?",
  ];

  return {
    text: [
      heading,
      "",
      `Shape: ${shape.join(" · ")}.`,
      "",
      "Walk it yourself, one step at a time:",
      ...questions.map((question, i) => `${i + 1}. ${question}`),
      "",
      "Answer those out loud, then run the tests again — if something still fails, ask me to debug it.",
    ].join("\n"),
    citations,
  };
}

function answerEdgeCases(ctx: Ctx): Answer {
  const heading = ctx.problem
    ? `Edge cases to check for ${cite(ctx.problem.id)} (${ctx.problem.category}).`
    : "Edge cases to check.";
  const checks = [
    "Empty input — an empty list, empty string, or zero: does the code return before it indexes, divides, or loops?",
    "A single element — the first and last position are the same: does the loop still run exactly once and produce the right value?",
    "Duplicates or all-equal values — does the algorithm still make progress, or can a pointer or comparison stall?",
    "Boundary values — the smallest and largest inputs the test cases use, plus negatives and zeros: can any range, slice, or +1 step past the end?",
  ];
  const tail =
    (ctx.code ?? "").trim().length > 0
      ? 'Run each question against your code; when one breaks, ask "why is my code failing?" with the failing input.'
      : "Open the problem or paste your code and I'll map these onto your implementation.";
  return {
    text: [
      heading,
      "",
      ...checks.map((check, i) => `${i + 1}. ${check}`),
      "",
      tail,
    ].join("\n"),
    citations: contextCitations(ctx),
  };
}

function answerSimilar(ctx: Ctx): Answer {
  const problem = ctx.problem;
  if (!problem) return answerNext(ctx);

  const map = getProgress();
  const pool = problemsByCategory(problem.category)
    .filter((entry) => entry.id !== problem.id && !map[entry.id]?.solved)
    .sort(byDifficultyThenId)
    .slice(0, 3);

  if (pool.length === 0) {
    return {
      text:
        `Nothing unsolved is left in ${problem.category} — you've cleared the ` +
        `category, so there is no similar problem to recommend there. Ask ` +
        `"what should I solve next?" for the next weak area, or "quiz me" to review.`,
      citations: [],
    };
  }

  return {
    text:
      `Similar to ${cite(problem.id)} — more unsolved ${problem.category} practice, easiest first:\n\n` +
      pool
        .map((entry, i) => `${i + 1}. ${cite(entry.id)} (${entry.difficulty})`)
        .join("\n") +
      "\n\nOpen one from the citation chips, or ask me to explain any pick.",
    citations: pool.map((entry) => entry.id),
  };
}

interface ContextualAnswer {
  intent: Intent;
  answer: Answer;
}

function contextualAnswer(q: string, ctx: Ctx): ContextualAnswer | null {
  const text = normalizePromptText(q);
  if (text.length === 0) return null;

  if (text === PROMPT_REVIEW_CODE) {
    return { intent: "debug", answer: answerReview(ctx) };
  }
  if (text === PROMPT_WHY_FAILING) {
    return { intent: "debug", answer: answerWhyFailing(ctx) };
  }
  if (text === PROMPT_WALKTHROUGH) {
    return { intent: "debug", answer: answerWalkthrough(ctx) };
  }
  if (text === PROMPT_EDGE_CASES) {
    return { intent: "explain", answer: answerEdgeCases(ctx) };
  }
  if (text === PROMPT_SIMILAR) {
    return { intent: "next", answer: answerSimilar(ctx) };
  }

  const research = findResearchChallenge(ctx.researchId);
  const lab = findLab(ctx.labId);

  if (research) {
    if (text === PROMPT_RESEARCH_BASELINE) {
      return { intent: "research", answer: answerResearchBaseline(research) };
    }
    if (text === normalizePromptText(metricPrompt(research.metric))) {
      return { intent: "research", answer: answerResearchMetric(research) };
    }
    if (text === PROMPT_RESEARCH_DATA) {
      return { intent: "research", answer: answerResearchData(research) };
    }
  }

  if (lab) {
    if (text === PROMPT_LAB_TARGET) {
      return { intent: "labs", answer: answerLabTarget(lab) };
    }
    if (text === PROMPT_LAB_TEACH) {
      return { intent: "labs", answer: answerLabTeach(lab) };
    }
    if (text === PROMPT_LAB_TIME) {
      return { intent: "labs", answer: answerLabTime(lab) };
    }
  }

  if (text === PROMPT_HINT) {
    if (research) {
      return { intent: "research", answer: answerResearchHint(research) };
    }
    if (lab) {
      return { intent: "labs", answer: answerLabHint(lab) };
    }
  }

  const problem = ctx.problem;
  if (!problem) return null;
  const explainPrompt = normalizePromptText(
    `Explain ${problem.title} step by step`,
  );
  const hintPrompt = normalizePromptText(`Give me a hint for ${problem.title}`);
  const insightPrompt = normalizePromptText(
    `What's the key insight in ${problem.title}?`,
  );
  if (text === explainPrompt || text === hintPrompt || text === insightPrompt) {
    return { intent: "explain", answer: answerExplain(q, ctx) };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// respond — synchronous, template-based, always cited
// ─────────────────────────────────────────────────────────────────────────────

export function respond(q: string, ctx: Ctx = {}): Msg {
  const contextual = contextualAnswer(q ?? "", ctx);
  if (contextual) {
    return createMessage(
      "assistant",
      contextual.answer.text,
      contextual.intent,
      contextual.answer.citations,
      contextual.answer.actions,
    );
  }
  const intent = classify(q ?? "");
  let answer: Answer;
  switch (intent) {
    case "next":
      answer = answerNext(ctx);
      break;
    case "debug":
      answer = answerDebug(ctx);
      break;
    case "playlist":
      warmProblemBank();
      answer = answerPlaylist(q ?? "", ctx);
      break;
    case "quiz":
      warmProblemBank();
      answer = answerQuiz(q ?? "", ctx);
      break;
    case "plan":
      answer = answerPlan();
      break;
    case "due":
      answer = answerDue();
      break;
    case "ready":
      answer = answerReady();
      break;
    case "research":
      answer = answerResearch();
      break;
    case "labs":
      answer = answerLabs();
      break;
    default:
      warmProblemBank();
      answer = answerExplain(q ?? "", ctx);
      break;
  }
  return createMessage(
    "assistant",
    answer.text,
    intent,
    answer.citations,
    answer.actions,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence — localStorage, cap 100, same-tab change event
// ─────────────────────────────────────────────────────────────────────────────

export const ASSISTANT_CHANGE_EVENT = "deepforge:assistant-change";

const STORAGE_KEY = "deepforge:assistant:v1";
const MAX_MESSAGES = 100;

let idCounter = 0;

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

function storageKey(problemId?: string): string {
  return problemId ? `deepforge:assistant:${problemId}` : STORAGE_KEY;
}

function isMsg(value: unknown): value is Msg {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.text === "string" &&
    typeof candidate.at === "string"
  );
}

function readMessages(problemId?: string): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(problemId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMsg);
  } catch {
    return [];
  }
}

function writeMessages(messages: Msg[], problemId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(problemId),
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
    window.dispatchEvent(new CustomEvent(ASSISTANT_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getMessages(problemId?: string): Msg[] {
  return readMessages(problemId);
}

export function appendMessage(msg: Msg, problemId?: string): Msg[] {
  const next = [...readMessages(problemId), msg].slice(-MAX_MESSAGES);
  writeMessages(next, problemId);
  return next;
}

export function resetConversation(problemId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(problemId));
    window.dispatchEvent(new CustomEvent(ASSISTANT_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function createMessage(
  role: Msg["role"],
  text: string,
  intent?: Intent,
  citations?: string[],
  actions?: MsgAction[],
): Msg {
  return {
    id: nextId(role === "user" ? "u" : "z"),
    role,
    text,
    ...(intent ? { intent } : {}),
    ...(citations && citations.length > 0 ? { citations } : {}),
    ...(actions && actions.length > 0 ? { actions } : {}),
    at: new Date().toISOString(),
  };
}

/**
 * Persist a full exchange (user question + assistant answer) and return both.
 * The assistant half goes through `respond`, so this is the one call the UI
 * needs — and the one unit tests can exercise end to end.
 */
export function recordExchange(
  q: string,
  ctx: Ctx = {},
  problemId?: string,
): { user: Msg; assistant: Msg } {
  const trimmed = (q ?? "").trim();
  const user = createMessage("user", trimmed);
  const assistant = respond(trimmed, ctx);
  appendMessage(user, problemId);
  appendMessage(assistant, problemId);
  return { user, assistant };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contextual prompt chips
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONTEXT_PROMPTS: readonly string[] = [
  "What should I solve next?",
  "Build me a playlist",
  "Quiz me",
  "Plan my week",
  "What's due?",
  "Am I ready?",
];

/**
 * Route-attached context for the /research/<id> and /labs/<id> surfaces.
 * Pure — parses the pathname only, reads no store. The id is attached even
 * when it is not a known challenge/lab; `contextPrompts` and the answer
 * router validate it and fall back to the generic state.
 */
export function routeContext(pathname?: string | null): Ctx {
  const [section, id, ...rest] = (pathname ?? "")
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean);
  if (rest.length > 0 || !id) return {};
  if (section === "research") return { researchId: id };
  if (section === "labs") return { labId: id };
  return {};
}

/**
 * Deterministic prompt chips for the current context. Pure — no store reads,
 * no retrieval: the same ctx always yields the same ordered list.
 *
 * - research challenge → four challenge-focused prompts (metric-aware)
 * - lab → four lab-focused prompts
 * - no problem → the six existing default prompts (unchanged)
 * - problem, no code → four problem-focused prompts, title-aware
 * - problem + code → four code-focused prompts (still title-aware); the debug
 *   chip reads "Why is my code failing?" only when the caller knows the latest
 *   run failed (`ctx.lastRunFailed === true`).
 */
export function contextPrompts(ctx: Ctx = {}): string[] {
  const research = findResearchChallenge(ctx.researchId);
  if (research) {
    return [
      "What's the baseline?",
      metricPrompt(research.metric),
      "Give me a hint",
      "What does the data look like?",
    ];
  }

  const lab = findLab(ctx.labId);
  if (lab) {
    return [
      "What's the target?",
      "What does this lab teach?",
      "Give me a hint",
      "How long is the run?",
    ];
  }

  const problem = ctx.problem;
  if (!problem) return [...DEFAULT_CONTEXT_PROMPTS];

  const hasCode = typeof ctx.code === "string" && ctx.code.trim().length > 0;
  if (hasCode) {
    return [
      "Review my code",
      ctx.lastRunFailed === true
        ? "Why is my code failing?"
        : "Walk through my approach",
      "What edge cases am I missing?",
      `Explain ${problem.title} step by step`,
    ];
  }
  return [
    `Explain ${problem.title} step by step`,
    `Give me a hint for ${problem.title}`,
    `What's the key insight in ${problem.title}?`,
    "Find me a similar problem",
  ];
}

/** Alias kept for older callers; prefer `contextPrompts`. */
export function suggestedPrompts(ctx: Ctx = {}): string[] {
  return contextPrompts(ctx);
}

// ─────────────────────────────────────────────────────────────────────────────
// Launcher visibility — localStorage boolean, default visible, same-tab event
//
// Hidden collapses the orb to a tiny restore dot; the preference is a chrome
// setting, so it is JSON-safe ("true" / "false") and anything else — missing
// key, junk, older formats — reads as visible. SSR has no storage, so the
// server (and the first paint) always renders the full orb.
// ─────────────────────────────────────────────────────────────────────────────

export const ASSISTANT_HIDDEN_EVENT = "deepforge:assistant-hidden-change";

const HIDDEN_STORAGE_KEY = "deepforge:assistant-hidden:v1";

/** True only when the exact JSON boolean true is stored; visible otherwise. */
export function isAssistantHidden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HIDDEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAssistantHidden(hidden: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(hidden));
    window.dispatchEvent(new CustomEvent(ASSISTANT_HIDDEN_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}
