/**
 * Ranked search across the learn/read registries for the command palette.
 *
 * Pure, synchronous, and deterministic: no Date, no randomness, and stable
 * tie-breaks. The palette lazy-loads this module the same way it lazy-loads
 * the problem bank, so these registries never enter the global client graph.
 *
 * `src/data/articles.ts` is deliberately not imported: every article record
 * carries its prose sections and pulls the figure/demo component graph, so
 * the whole module is far too heavy for palette search. The Articles group is
 * kept in the type and ordering contract for when a light article index
 * exists; `searchGlobal` never returns it today.
 */

import { CATEGORIES } from "@/data/problems/meta";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { POSTS } from "@/data/blog";
import { getAllPaths } from "@/lib/paths";
import { categorySlug } from "@/lib/sections";

export type GlobalSearchGroup =
  | "Paths"
  | "Collections"
  | "Interview"
  | "Articles"
  | "Blog"
  | "Categories";

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
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

const INDEX: Record<GlobalSearchGroup, readonly GlobalSearchItem[]> = {
  Paths: PATH_ITEMS,
  Collections: COLLECTION_ITEMS,
  Interview: INTERVIEW_ITEMS,
  Articles: [],
  Blog: BLOG_ITEMS,
  Categories: CATEGORY_ITEMS,
};

interface ScoredItem {
  item: GlobalSearchItem;
  score: number;
}

/**
 * 0 = title starts with the query, 1 = query starts a later word,
 * 2 = query appears inside a word, -1 = no match.
 */
function scoreTitle(title: string, query: string): number {
  const haystack = title.toLowerCase();
  const at = haystack.indexOf(query);
  if (at < 0) return -1;
  if (at === 0) return 0;
  return /[^a-z0-9]/.test(haystack[at - 1]) ? 1 : 2;
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
      const score = scoreTitle(item.title, q);
      if (score >= 0) scored.push({ item, score });
    }
    if (scored.length === 0) continue;
    scored.sort(compareScored);
    results.push({ group, items: scored.slice(0, cap).map((s) => s.item) });
  }
  return results;
}
