import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/problems/meta";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { getAllPaths, pathSlug } from "@/lib/paths";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app"
).replace(/\/$/, "");

const LAST_MODIFIED = new Date("2026-09-01T00:00:00.000Z");

function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ROUTES = [
  { path: "/paths", changeFrequency: "weekly", priority: 0.9 },
  { path: "/daily", changeFrequency: "daily", priority: 0.8 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/labs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contests", changeFrequency: "weekly", priority: 0.8 },
  { path: "/speedrun", changeFrequency: "weekly", priority: 0.7 },
  { path: "/research", changeFrequency: "weekly", priority: 0.8 },
  { path: "/leaderboard", changeFrequency: "weekly", priority: 0.7 },
  { path: "/badges", changeFrequency: "monthly", priority: 0.6 },
  { path: "/stats", changeFrequency: "weekly", priority: 0.6 },
  { path: "/certificates", changeFrequency: "monthly", priority: 0.6 },
  { path: "/backup", changeFrequency: "monthly", priority: 0.4 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.7 },
  { path: "/playlists", changeFrequency: "weekly", priority: 0.7 },
  { path: "/interview", changeFrequency: "weekly", priority: 0.8 },
  { path: "/math", changeFrequency: "weekly", priority: 0.8 },
  { path: "/articles", changeFrequency: "weekly", priority: 0.8 },
  { path: "/sims", changeFrequency: "weekly", priority: 0.7 },
  { path: "/discuss", changeFrequency: "weekly", priority: 0.6 },
  { path: "/submit", changeFrequency: "monthly", priority: 0.5 },
  { path: "/playground", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
] as const;

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
  ];
}
