"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SectionHub } from "@/components/SectionHub";
import { PageShell } from "@/components/PageShell";
import { ZeroAssistant } from "@/components/ZeroAssistant";
import { DeepLink } from "@/components/DeepLink";
import { categorySlug, findSectionByHash } from "@/lib/sections";
import { CATEGORIES } from "@/data/problems/meta";
import { getAllPaths } from "@/lib/paths";
import type { Category } from "@/types/problem";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

const PATH_COUNT = getAllPaths().length;

export default function Page() {
  const router = useRouter();
  // Per-category counts live in the problem bank; resolve them after hydration
  // so the landing page never statically imports the five-megabyte dataset.
  const [categoryCounts, setCategoryCounts] = useState<
    Partial<Record<Category, number>> | undefined
  >(undefined);

  useEffect(() => {
    let alive = true;
    void import("@/data/problems").then((mod) => {
      if (alive) setCategoryCounts(mod.getCategoryCounts());
    });
    return () => {
      alive = false;
    };
  }, []);

  const resolveCategory = useCallback((value: string) => {
    const key = value.toLowerCase();
    return CATEGORIES.find(
      (c) => c.name.toLowerCase() === key || categorySlug(c.name) === key,
    );
  }, []);

  // Legacy hashes (#math, #profile, #submit-problem, plain section ids) now
  // resolve to real routes. Query-parameter deep links are owned by the effects
  // below — never hijack them (e.g. /?category=X#problems or /?p=id#problems).
  useEffect(() => {
    const onHashChange = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      if (params.get("p") || (category && resolveCategory(category))) return;
      const section = findSectionByHash(window.location.hash);
      if (section) router.replace(section.href);
    };
    const initial = requestAnimationFrame(onHashChange);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [router, resolveCategory]);

  // Legacy /?category=<name-or-slug> deep link → /problems?category=<slug>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (!category || params.get("p")) return;
    const match = resolveCategory(category);
    if (!match) return;
    router.replace(`/problems?category=${categorySlug(match.name)}`);
  }, [router, resolveCategory]);

  const handleCategorySelect = useCallback((): void => {}, []);

  return (
    <PageShell>
      <Hero
        problemCount={MARKETING_PROBLEM_COUNT}
        categoryCount={CATEGORIES.length}
      />
      <StatsStrip
        problemCount={MARKETING_PROBLEM_COUNT}
        categoryCount={CATEGORIES.length}
        pathCount={PATH_COUNT}
      />
      <CategoryGrid
        categories={CATEGORIES}
        counts={categoryCounts}
        activeCategory="All"
        onSelect={handleCategorySelect}
      />
      <SectionHub counts={{ problems: MARKETING_PROBLEM_COUNT }} />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <Link
          href="/blog"
          className="flex flex-col gap-1 rounded-lg border border-hairline bg-canvas-card p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
        >
          <span className="text-sm font-medium text-ink">
            Engineering — how we build DeepForge
          </span>
          <span className="shrink-0 text-xs text-body-mid">
            Read the blog →
          </span>
        </Link>
      </section>
      <ZeroAssistant />
      <DeepLink />
    </PageShell>
  );
}
