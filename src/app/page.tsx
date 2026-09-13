"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SectionHub } from "@/components/SectionHub";
import { Footer } from "@/components/Footer";
import { ProblemView } from "@/components/ProblemView";
import { CommandPalette } from "@/components/CommandPalette";
import { ZeroAssistant } from "@/components/ZeroAssistant";
import { DeepLink } from "@/components/DeepLink";
import { categorySlug, findSectionByHash } from "@/lib/sections";
import {
  PROBLEMS,
  LEARNING_PATHS,
  CATEGORIES,
  getCategoryCounts,
} from "@/data/problems";
import type { Problem } from "@/types/problem";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<Problem | null>(null);
  // Lazy initial read of localStorage — runs once on first client render.
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());

  // Legacy hashes (#math, #profile, #submit-problem, plain section ids) now
  // resolve to real routes. Anything else keeps its hash untouched.
  useEffect(() => {
    const onHashChange = () => {
      const section = findSectionByHash(window.location.hash);
      if (section) router.replace(section.href);
    };
    const initial = requestAnimationFrame(onHashChange);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [router]);

  // Legacy /?category=<name-or-slug> deep link → /problems?category=<slug>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (!category || params.get("p")) return;
    const match = CATEGORIES.find(
      (c) =>
        c.name === category || categorySlug(c.name) === category.toLowerCase(),
    );
    if (!match) return;
    router.replace(`/problems?category=${categorySlug(match.name)}`);
  }, [router]);

  // Subscribe to progress changes (from this tab's writes via the custom
  // event, and from other tabs via the storage event).
  useEffect(() => {
    const onChange = () => setProgress(getProgress());
    window.addEventListener("storage", onChange);
    window.addEventListener("deepforge:progress-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("deepforge:progress-change", onChange);
    };
  }, []);

  const handleProgressChange = useCallback(() => {
    setProgress(getProgress());
  }, []);

  // Allow any section (forum chips, playlists, assistant citations, articles)
  // to open a problem by id.
  useEffect(() => {
    const onOpenProblem = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (typeof id !== "string") return;
      const p = PROBLEMS.find((x) => x.id === id);
      if (p) setSelected(p);
    };
    window.addEventListener("deepforge:open-problem", onOpenProblem);
    return () =>
      window.removeEventListener("deepforge:open-problem", onOpenProblem);
  }, []);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);
  const stats = useMemo(() => {
    let solved = 0;
    for (const p of PROBLEMS) {
      if (progress[p.id]?.solved) solved += 1;
    }
    return { solved, total: PROBLEMS.length };
  }, [progress]);

  const handleCategorySelect = useCallback((): void => {}, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header solvedCount={stats.solved} totalCount={stats.total} />
      <main className="flex-1">
        <Hero
          problemCount={MARKETING_PROBLEM_COUNT}
          categoryCount={CATEGORIES.length}
        />
        <StatsStrip
          problemCount={MARKETING_PROBLEM_COUNT}
          categoryCount={CATEGORIES.length}
          pathCount={LEARNING_PATHS.length}
        />
        <CategoryGrid
          categories={CATEGORIES}
          counts={categoryCounts}
          activeCategory="All"
          onSelect={handleCategorySelect}
        />
        <SectionHub counts={{ problems: MARKETING_PROBLEM_COUNT }} />
      </main>
      <Footer />
      {selected && (
        <ProblemView
          problem={selected}
          onClose={() => setSelected(null)}
          onProgressChange={handleProgressChange}
        />
      )}
      <CommandPalette />
      <ZeroAssistant />
      <DeepLink />
    </div>
  );
}
