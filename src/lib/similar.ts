import { PROBLEM_META, type ProblemMeta } from "@/data/problems/problem-meta";
import type { Difficulty } from "@/types/problem";

/**
 * Deterministic "sibling challenge" recommendations.
 *
 * The light index (src/data/problems/problem-meta.ts) carries only id, title,
 * category and difficulty — no tags, no descriptions — so scoring uses:
 *
 *   same category        +100  (strong bonus: one same-category sibling always
 *                               outranks any cross-category candidate, since
 *                               the non-category maximum is far below 100)
 *   title token overlap  +6    per shared significant token (case-insensitive,
 *                               stop-word filtered over the title)
 *   same difficulty      +8
 *   adjacent difficulty  +4    (Easy↔Medium, Medium↔Hard; distance 2 gets 0)
 *
 * Difficulty only modulates eligible candidates: a candidate must carry a
 * topical signal (same category or at least one shared title token), so an
 * unrelated problem never surfaces on difficulty adjacency alone.
 *
 * Candidates are never the source problem itself. Only positive scores are
 * returned and ties break on id ascending (lexicographic), so the output is
 * stable across calls. Pure module: no randomness, no clock, no network.
 */

const SAME_CATEGORY_BONUS = 100;
const SHARED_TOKEN_BONUS = 6;
const SAME_DIFFICULTY_BONUS = 8;
const ADJACENT_DIFFICULTY_BONUS = 4;

/** Common English glue words that carry no topical signal in a title. */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "between",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "over",
  "per",
  "the",
  "to",
  "under",
  "via",
  "with",
]);

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

/** Tokens depend only on the title, so cache them by title. */
const TOKEN_CACHE = new Map<string, readonly string[]>();

function titleTokens(title: string): readonly string[] {
  const cached = TOKEN_CACHE.get(title);
  if (cached) return cached;
  const tokens = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
  TOKEN_CACHE.set(title, tokens);
  return tokens;
}

function scoreCandidate(
  source: ProblemMeta,
  sourceTokens: ReadonlySet<string>,
  candidate: ProblemMeta,
  candidateTokens: readonly string[],
): number {
  const sameCategory = candidate.category === source.category;
  let sharedTokens = 0;
  for (const token of candidateTokens) {
    if (sourceTokens.has(token)) sharedTokens += 1;
  }

  // Require a topical signal: category alone, or at least one shared title
  // token. Difficulty may only modulate a candidate that is already similar.
  if (!sameCategory && sharedTokens === 0) return 0;

  let score = sharedTokens * SHARED_TOKEN_BONUS;
  if (sameCategory) score += SAME_CATEGORY_BONUS;

  if (candidate.difficulty === source.difficulty) {
    score += SAME_DIFFICULTY_BONUS;
  } else if (
    Math.abs(
      DIFFICULTY_ORDER[candidate.difficulty] -
        DIFFICULTY_ORDER[source.difficulty],
    ) === 1
  ) {
    score += ADJACENT_DIFFICULTY_BONUS;
  }

  return score;
}

function compareIds(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Memoized ranked lists for the default corpus, keyed by the source's full
 * fingerprint so a crafted fixture that reuses a real id cannot poison the
 * production entry. Custom corpora are never cached.
 */
const RESULT_CACHE = new Map<string, ProblemMeta[]>();

/**
 * Up to `limit` problems most similar to `problem`, drawn from PROBLEM_META.
 * Empty or non-positive limits return an empty list. The optional `corpus`
 * exists so tests and future per-corpus callers can pass a fixture; the app
 * always uses the default PROBLEM_META index.
 */
export function getSimilarProblems(
  problem: ProblemMeta,
  limit = 5,
  corpus: readonly ProblemMeta[] = PROBLEM_META,
): ProblemMeta[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const size = Math.floor(limit);

  const cacheKey =
    corpus === PROBLEM_META
      ? `${problem.id}\u0000${problem.title}\u0000${problem.category}\u0000${problem.difficulty}`
      : null;
  if (cacheKey) {
    const cached = RESULT_CACHE.get(cacheKey);
    if (cached) return cached.slice(0, size);
  }

  const sourceTokens = new Set(titleTokens(problem.title));
  const scored: { meta: ProblemMeta; score: number }[] = [];

  for (const candidate of corpus) {
    if (candidate.id === problem.id) continue;
    const score = scoreCandidate(
      problem,
      sourceTokens,
      candidate,
      titleTokens(candidate.title),
    );
    if (score > 0) scored.push({ meta: candidate, score });
  }

  scored.sort(
    (a, b) => b.score - a.score || compareIds(a.meta.id, b.meta.id),
  );
  const ranked = scored.map((entry) => entry.meta);

  if (cacheKey) RESULT_CACHE.set(cacheKey, ranked);
  return ranked.slice(0, size);
}
