/**
 * Regenerate the light article index from the full registry.
 *
 *   bun run scripts/generate-article-index.ts
 *
 * Writes `src/data/articleIndex.ts` with plain literals for { slug, title,
 * dek } so palette/search code can include the Articles group without pulling
 * the article prose sections or the figure/demo component graph. Re-run after
 * adding or editing articles.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARTICLES } from "../src/data/articles";

const OUT = join(process.cwd(), "src", "data", "articleIndex.ts");

const seenSlugs = new Set<string>();
for (const article of ARTICLES) {
  if (
    article.slug.trim().length === 0 ||
    article.title.trim().length === 0 ||
    article.dek.trim().length === 0
  ) {
    throw new Error(`missing slug/title/dek on ${article.id}`);
  }
  if (seenSlugs.has(article.slug)) {
    throw new Error(`duplicate slug ${article.slug}`);
  }
  seenSlugs.add(article.slug);
}

const rows = ARTICLES.map((article) => {
  const slug = JSON.stringify(article.slug);
  const title = JSON.stringify(article.title);
  const dek = JSON.stringify(article.dek);
  return `  articleIndexEntry(${slug}, ${title}, ${dek}),`;
});

const source = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun run scripts/generate-article-index.ts
 *
 * Light index of the interactive articles: { slug, title, dek } only, so
 * palette search can include the Articles group without importing the prose
 * sections or the figure/demo component graph in src/data/articles.ts.
 */

export interface ArticleIndexEntry {
  slug: string;
  title: string;
  dek: string;
}

function articleIndexEntry(
  slug: string,
  title: string,
  dek: string,
): ArticleIndexEntry {
  return { slug, title, dek };
}

export const ARTICLE_INDEX: ArticleIndexEntry[] = [
${rows.join("\n")}
];
`;

writeFileSync(OUT, source);
console.log(`wrote ${OUT} — ${ARTICLES.length} articles`);
