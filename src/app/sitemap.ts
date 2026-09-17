import type { MetadataRoute } from "next";
import { ARTICLES } from "@/data/articles";
import { POSTS } from "@/data/blog";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { INTERVIEW_TRACKS } from "@/data/interview";
import { LABS } from "@/data/labs";
import { PROJECTS } from "@/data/projects";
import { RESEARCH_CHALLENGES } from "@/data/research";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getAllPaths, pathSlug } from "@/lib/paths";
import { categorySlug } from "@/lib/sections";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

// Build time: sitemap entries without a real publish date use the build date.
const LAST_MODIFIED = new Date();

const BANK_IDS = new Set(PROBLEM_META.map((problem) => problem.id));

const ROUTES = [
  { path: "/start", changeFrequency: "monthly", priority: 0.7 },
  { path: "/paths", changeFrequency: "weekly", priority: 0.9 },
  { path: "/daily", changeFrequency: "daily", priority: 0.8 },
  { path: "/today", changeFrequency: "daily", priority: 0.7 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/labs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/labs/trails", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contests", changeFrequency: "weekly", priority: 0.8 },
  { path: "/speedrun", changeFrequency: "weekly", priority: 0.7 },
  { path: "/research", changeFrequency: "weekly", priority: 0.8 },
  { path: "/leaderboard", changeFrequency: "weekly", priority: 0.7 },
  { path: "/badges", changeFrequency: "monthly", priority: 0.6 },
  { path: "/stats", changeFrequency: "weekly", priority: 0.6 },
  { path: "/certificates", changeFrequency: "monthly", priority: 0.6 },
  { path: "/verify", changeFrequency: "monthly", priority: 0.5 },
  { path: "/backup", changeFrequency: "monthly", priority: 0.4 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.7 },
  { path: "/playlists", changeFrequency: "weekly", priority: 0.7 },
  { path: "/interview", changeFrequency: "weekly", priority: 0.8 },
  { path: "/math", changeFrequency: "weekly", priority: 0.8 },
  { path: "/concepts", changeFrequency: "weekly", priority: 0.8 },
  { path: "/articles", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/sims", changeFrequency: "weekly", priority: 0.7 },
  { path: "/discuss", changeFrequency: "weekly", priority: 0.6 },
  { path: "/submit", changeFrequency: "monthly", priority: 0.5 },
  { path: "/playground", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
] as const;

const seenPostSlugs = new Set<string>();
const POST_ROUTES = (Array.isArray(POSTS) ? POSTS : [])
  .flatMap((entry) => (entry?.post ? [entry.post] : []))
  .filter((post) => {
    const slug = post.slug;
    if (typeof slug !== "string" || slug.length === 0) return false;
    if (seenPostSlugs.has(slug)) return false;
    seenPostSlugs.add(slug);
    return true;
  })
  .map((post) => {
    const published = new Date(post.date);
    return {
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: Number.isNaN(published.getTime())
        ? LAST_MODIFIED
        : published,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/problems`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...ROUTES.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${siteUrl}/categories/${categorySlug(category.name)}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...PROBLEM_META.map((problem) => ({
      url: `${siteUrl}/problems/${problem.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getAllPaths().map((path) => ({
      url: `${siteUrl}/paths/${pathSlug(path)}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...PREMADE_COLLECTIONS.map((collection) => ({
      url: `${siteUrl}/collections/${collection.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...INTERVIEW_TRACKS.map((track) => ({
      url: `${siteUrl}/interview/${track.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...LABS.map((lab) => ({
      url: `${siteUrl}/labs/${lab.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...RESEARCH_CHALLENGES.map((challenge) => ({
      url: `${siteUrl}/research/${challenge.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...ARTICLES.map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...PROJECTS.flatMap((project) =>
      project.steps
        .filter((step) => !BANK_IDS.has(step.id))
        .map((step) => ({
          url: `${siteUrl}/problems/${step.id}`,
          lastModified: LAST_MODIFIED,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        })),
    ),
    ...PROJECTS.map((project) => ({
      url: `${siteUrl}/projects/${project.id}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...POST_ROUTES,
  ];
}
