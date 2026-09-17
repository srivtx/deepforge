/**
 * Ranked search across the learn/read registries for the command palette.
 *
 * Pure, synchronous, and deterministic: no Date, no randomness, and stable
 * tie-breaks. The palette lazy-loads this module the same way it lazy-loads
 * the problem bank, so these registries never enter the global client graph.
 *
 * Articles come from the generated light index `src/data/articleIndex.ts`
 * ({ slug, title, dek } only). `src/data/articles.ts` is never imported here:
 * every article record carries its prose sections and pulls the figure/demo
 * component graph, so the whole module is far too heavy for palette search.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { ARTICLE_INDEX } from "@/data/articleIndex";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { LABS } from "@/data/labs";
import { PAPERS, ERA_LABELS } from "@/data/papers";
import { POSTS } from "@/data/blog";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { getAllPaths } from "@/lib/paths";
import { categorySlug } from "@/lib/sections";

export type GlobalSearchGroup =
  | "Paths"
  | "Collections"
  | "Interview"
  | "Articles"
  | "Blog"
  | "Categories"
  | "Research"
  | "Papers"
  | "Labs";

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  /**
   * Extra palette-only search terms (metric, topic, a few blurb words).
   * Matched and ranked exactly like the title, but never rendered.
   */
  keywords?: readonly string[];
}

export interface GlobalSearchResult {
  group: GlobalSearchGroup;
  items: GlobalSearchItem[];
}

/** Canonical display order for groups. */
export const GLOBAL_SEARCH_GROUPS: readonly GlobalSearchGroup[] = [
  "Paths",
  "Collections",
  "Interview",
  "Articles",
  "Blog",
  "Categories",
  "Research",
  "Papers",
  "Labs",
];

/** Queries shorter than this return nothing; the palette handles defaults. */
export const GLOBAL_SEARCH_MIN_LENGTH = 2;

const DEFAULT_LIMIT = 4;

const PATH_ITEMS: GlobalSearchItem[] = getAllPaths().map((path) => ({
  id: path.id,
  title: path.title,
  subtitle: path.level ?? `${path.problemIds.length} problems`,
  href: `/paths/${path.slug}`,
}));

const COLLECTION_ITEMS: GlobalSearchItem[] = PREMADE_COLLECTIONS.map(
  (collection) => ({
    id: collection.id,
    title: collection.name,
    subtitle: `${collection.problemIds.length} problems`,
    href: `/collections/${collection.id}`,
  }),
);

const INTERVIEW_ITEMS: GlobalSearchItem[] = INTERVIEW_TRACKS.map((track) => ({
  id: track.id,
  title: track.title,
  subtitle: track.audience,
  href: `/interview/${track.id}`,
}));

const ARTICLE_ITEMS: GlobalSearchItem[] = ARTICLE_INDEX.map((article) => ({
  id: article.slug,
  title: article.title,
  subtitle: article.dek,
  href: `/articles/${article.slug}`,
}));

const BLOG_ITEMS: GlobalSearchItem[] = POSTS.map((entry) => ({
  id: entry.post.slug,
  title: entry.post.title,
  subtitle: `${entry.post.readingMinutes} min read`,
  href: `/blog/${entry.post.slug}`,
}));

const CATEGORY_ITEMS: GlobalSearchItem[] = CATEGORIES.map((category) => ({
  id: category.name,
  title: category.name,
  href: `/problems?category=${categorySlug(category.name)}`,
}));

/** Palette-only terms per research challenge: topic and blurb words. */
const RESEARCH_KEYWORDS: Record<string, readonly string[]> = {
  "tabular-classification-showdown": [
    "classification",
    "blobs",
    "majority class",
    "logistic regression",
  ],
  "nonlinear-regression-chase": [
    "regression",
    "parabola",
    "quadratic",
    "least squares",
  ],
  "imbalanced-signal-hunt": [
    "classification",
    "imbalanced",
    "sparse signal",
    "rare positives",
  ],
  "noisy-sensor-denoising": [
    "sensor",
    "denoising",
    "moving average",
    "time series",
  ],
  "mini-language-model": [
    "language model",
    "markov",
    "next token",
    "unigram",
  ],
};

const RESEARCH_ITEMS: GlobalSearchItem[] = RESEARCH_CHALLENGES.map(
  (challenge) => ({
    id: challenge.id,
    title: challenge.title,
    subtitle: `${challenge.metric} · beat ${challenge.baselineName}`,
    href: `/research/${challenge.id}`,
    keywords: [challenge.metric, ...(RESEARCH_KEYWORDS[challenge.id] ?? [])],
  }),
);

/** Every paper in the curriculum, searchable by title, era, and tagline. */
const PAPER_ITEMS: GlobalSearchItem[] = PAPERS.map((paper) => ({
  id: paper.id,
  title: paper.title,
  subtitle: `${paper.year} · ${ERA_LABELS[paper.era]}`,
  href: `/papers/${paper.slug}`,
  keywords: [
    paper.short,
    paper.tagline,
    ERA_LABELS[paper.era],
    paper.kind,
    String(paper.year),
    ...(paper.arxivId ? [paper.arxivId] : []),
  ],
}));

/** Palette-only terms per lab: topic and blurb words. */
const LAB_KEYWORDS: Record<string, readonly string[]> = {
  "lab-01": [
    "classification",
    "logistic regression",
    "binary",
    "gradient descent",
  ],
  "lab-02": ["nlp", "spam", "keyword counts", "classifier"],
  "lab-03": ["regression", "house prices", "least squares", "normal equations"],
  "lab-04": ["regression", "r-squared", "quadratic", "polynomial"],
  "lab-05": ["clustering", "k-means", "unsupervised", "segmentation"],
  "lab-06": ["classification", "credit", "default", "logistic regression"],
  "lab-07": ["regression", "sensor", "outliers", "robust"],
  "lab-08": ["classification", "xor", "interaction", "logistic regression"],
};

const LAB_ITEMS: GlobalSearchItem[] = LABS.map((lab) => ({
  id: lab.id,
  title: lab.title,
  subtitle: `${lab.category} · ${lab.difficulty}`,
  href: `/labs/${lab.id}`,
  keywords: [lab.metric, lab.category, ...(LAB_KEYWORDS[lab.id] ?? [])],
}));

const INDEX: Record<GlobalSearchGroup, readonly GlobalSearchItem[]> = {
  Paths: PATH_ITEMS,
  Collections: COLLECTION_ITEMS,
  Interview: INTERVIEW_ITEMS,
  Articles: ARTICLE_ITEMS,
  Blog: BLOG_ITEMS,
  Categories: CATEGORY_ITEMS,
  Research: RESEARCH_ITEMS,
  Papers: PAPER_ITEMS,
  Labs: LAB_ITEMS,
};

interface ScoredItem {
  item: GlobalSearchItem;
  score: number;
}

/**
 * 0 = text starts with the query, 1 = query starts a later word,
 * 2 = query appears inside a word, -1 = no match.
 */
function scoreText(text: string, query: string): number {
  const haystack = text.toLowerCase();
  const at = haystack.indexOf(query);
  if (at < 0) return -1;
  if (at === 0) return 0;
  return /[^a-z0-9]/.test(haystack[at - 1]) ? 1 : 2;
}

/** Best score across an item's title and its palette-only keywords. */
function scoreItem(item: GlobalSearchItem, query: string): number {
  let best = scoreText(item.title, query);
  for (const keyword of item.keywords ?? []) {
    const score = scoreText(keyword, query);
    if (score >= 0 && (best < 0 || score < best)) best = score;
  }
  return best;
}

/** Score, then shorter title, then id, then title: total and stable. */
function compareScored(a: ScoredItem, b: ScoredItem): number {
  if (a.score !== b.score) return a.score - b.score;
  if (a.item.title.length !== b.item.title.length) {
    return a.item.title.length - b.item.title.length;
  }
  if (a.item.id !== b.item.id) return a.item.id < b.item.id ? -1 : 1;
  if (a.item.title === b.item.title) return 0;
  return a.item.title < b.item.title ? -1 : 1;
}

/**
 * Matches per group in `GLOBAL_SEARCH_GROUPS` order. Groups without matches
 * are omitted. `limit` caps items per group (default 4); a query that trims
 * to fewer than `GLOBAL_SEARCH_MIN_LENGTH` characters returns nothing.
 */
export function searchGlobal(
  query: string,
  limit: number = DEFAULT_LIMIT,
): GlobalSearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return [];
  const cap = Number.isFinite(limit)
    ? Math.max(0, Math.floor(limit))
    : DEFAULT_LIMIT;
  if (cap < 1) return [];

  const results: GlobalSearchResult[] = [];
  for (const group of GLOBAL_SEARCH_GROUPS) {
    const scored: ScoredItem[] = [];
    for (const item of INDEX[group]) {
      const score = scoreItem(item, q);
      if (score >= 0) scored.push({ item, score });
    }
    if (scored.length === 0) continue;
    scored.sort(compareScored);
    results.push({ group, items: scored.slice(0, cap).map((s) => s.item) });
  }
  return results;
}
