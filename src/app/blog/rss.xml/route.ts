import { POSTS } from "@/data/blog";
import { PROBLEM_META } from "@/data/problems/problem-meta";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const feedTitle = "DeepForge Engineering";
const feedDescription =
  `Notes from building DeepForge: verification, offline-first sync, performance, and the design system behind ${PROBLEM_META.length.toLocaleString("en-US")} problems.`;

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return new Date(0).toUTCString();
  return parsed.toUTCString();
}

export function GET(): Response {
  const items = POSTS.map(({ post }) => {
    const url = `${siteUrl}/blog/${post.slug}`;
    const categories = post.tags
      .map((tag) => `      <category>${escapeXml(tag)}</category>`)
      .join("\n");
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${toRfc822(post.date)}</pubDate>`,
      `      <description>${escapeXml(post.abstract)}</description>`,
      categories,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n");

  const lastBuildDate = toRfc822(POSTS[0]?.post.date ?? "1970-01-01");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteUrl}/blog</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
