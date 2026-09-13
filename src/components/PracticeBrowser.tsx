"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProblemList } from "@/components/ProblemList";
import { categorySlug } from "@/lib/sections";
import { CATEGORIES, PROBLEMS } from "@/data/problems";
import { getProgress, type ProgressMap } from "@/lib/progress";
import type { Difficulty } from "@/types/problem";

const CATEGORY_NAMES: string[] = CATEGORIES.map((category) => category.name);

// Accept either the display name ("Linear Algebra") or the URL slug
// ("linear-algebra") — CategoryGrid, CommandPalette, and the legacy home
// redirect all produce slugs.
const CATEGORY_BY_PARAM = new Map<string, string>();
for (const category of CATEGORIES) {
  CATEGORY_BY_PARAM.set(category.name.toLowerCase(), category.name);
  CATEGORY_BY_PARAM.set(categorySlug(category.name), category.name);
}

function browserLoading() {
  return (
    <section
      id="problems"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div
        role="status"
        className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-body-mid"
      >
        <span className="df-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-hairline border-t-accent" />
        Loading…
      </div>
    </section>
  );
}

function PracticeBrowserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = categoryParam
    ? CATEGORY_BY_PARAM.get(categoryParam.toLowerCase())
    : undefined;

  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory ?? "All",
  );
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | "All">(
    "All",
  );
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());

  useEffect(() => {
    const onChange = () => setProgress(getProgress());
    window.addEventListener("storage", onChange);
    window.addEventListener("deepforge:progress-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("deepforge:progress-change", onChange);
    };
  }, []);

  return (
    <ProblemList
      problems={PROBLEMS}
      progress={progress}
      activeCategory={activeCategory}
      activeDifficulty={activeDifficulty}
      search={search}
      onCategoryChange={setActiveCategory}
      onDifficultyChange={setActiveDifficulty}
      onSearchChange={setSearch}
      onOpen={(problem) => router.push(`/problems/${problem.id}`)}
      categories={CATEGORY_NAMES}
      initialCategory={initialCategory}
    />
  );
}

export function PracticeBrowser() {
  return (
    <Suspense fallback={browserLoading()}>
      <PracticeBrowserContent />
    </Suspense>
  );
}
