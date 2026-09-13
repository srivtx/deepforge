"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProblemList } from "@/components/ProblemList";
import { ProblemView } from "@/components/ProblemView";
import { CATEGORIES, PROBLEMS } from "@/data/problems";
import { getProgress, type ProgressMap } from "@/lib/progress";
import type { Difficulty, Problem } from "@/types/problem";

const CATEGORY_NAMES: string[] = CATEGORIES.map((category) => category.name);

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
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory =
    categoryParam && CATEGORY_NAMES.includes(categoryParam)
      ? categoryParam
      : undefined;

  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory ?? "All",
  );
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | "All">(
    "All",
  );
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());
  const [selected, setSelected] = useState<Problem | null>(null);

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
    <>
      <ProblemList
        problems={PROBLEMS}
        progress={progress}
        activeCategory={activeCategory}
        activeDifficulty={activeDifficulty}
        search={search}
        onCategoryChange={setActiveCategory}
        onDifficultyChange={setActiveDifficulty}
        onSearchChange={setSearch}
        onOpen={setSelected}
        categories={CATEGORY_NAMES}
        initialCategory={initialCategory}
      />
      {selected && (
        <ProblemView
          problem={selected}
          onClose={() => setSelected(null)}
          onProgressChange={() => setProgress(getProgress())}
        />
      )}
    </>
  );
}

export function PracticeBrowser() {
  return (
    <Suspense fallback={browserLoading()}>
      <PracticeBrowserContent />
    </Suspense>
  );
}
