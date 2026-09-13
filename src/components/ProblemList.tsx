"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem, Difficulty } from "@/types/problem";
import { ProblemCard } from "./ProblemCard";
import { cn } from "@/lib/utils";

interface ProblemListProps {
  problems: Problem[];
  progress: Record<
    string,
    { solved?: boolean; attempted?: boolean }
  >;
  activeCategory: string;
  activeDifficulty: Difficulty | "All";
  search: string;
  onCategoryChange: (c: string) => void;
  onDifficultyChange: (d: Difficulty | "All") => void;
  onSearchChange: (s: string) => void;
  onOpen: (p: Problem) => void;
  categories: string[];
  initialCategory?: string;
}

const DIFFICULTIES: (Difficulty | "All")[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

const PAGE_SIZE = 60;

export function ProblemList({
  problems,
  progress,
  activeCategory,
  activeDifficulty,
  search,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
  onOpen,
  categories,
  initialCategory,
}: ProblemListProps) {
  const filterKey = `${activeCategory}\u0000${activeDifficulty}\u0000${search}`;
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_SIZE });
  const appliedInitialCategory = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!initialCategory || appliedInitialCategory.current === initialCategory)
      return;
    appliedInitialCategory.current = initialCategory;
    if (initialCategory !== activeCategory) onCategoryChange(initialCategory);
  }, [initialCategory, activeCategory, onCategoryChange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory)
        return false;
      if (activeDifficulty !== "All" && p.difficulty !== activeDifficulty)
        return false;
      if (q) {
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [problems, activeCategory, activeDifficulty, search]);

  const visibleCount =
    paging.key === filterKey ? paging.count : PAGE_SIZE;

  const visible = filtered.slice(0, visibleCount);
  const shown = Math.min(visibleCount, filtered.length);

  return (
    <section
      id="problems"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Problems
        </h2>
        <p className="text-xs text-mute">
          Showing {shown.toLocaleString()} of{" "}
          {filtered.length.toLocaleString()} problems. Click any card to open
          the editor.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="problem-search" className="sr-only">
          Search problems
        </label>
        <input
          id="problem-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, id, or description…"
          className="min-h-11 flex-1 rounded-lg border border-hairline bg-canvas-card px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 sm:min-h-0"
        />
        <div className="flex items-center gap-1 overflow-x-auto">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={activeCategory === c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors sm:min-h-0",
                activeCategory === c
                  ? "border-accent/40 bg-accent/5 text-accent"
                  : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
              )}
            >
              {activeCategory === c && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden
                  className="shrink-0"
                >
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {c === "All" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={activeDifficulty === d}
            onClick={() => onDifficultyChange(d)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors sm:min-h-0",
                activeDifficulty === d
                ? "border-accent/40 bg-accent/5 text-accent"
                : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
            )}
          >
            {activeDifficulty === d && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden
                className="shrink-0"
              >
                <path
                  d="M2 5l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-canvas-card p-8 text-center text-sm text-body-mid">
          No problems match your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => {
              const prog = progress[p.id] || {};
              return (
                <ProblemCard
                  key={p.id}
                  problem={p}
                  solved={prog.solved}
                  attempted={prog.attempted}
                  onClick={() => onOpen(p)}
                />
              );
            })}
          </div>
          {shown < filtered.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() =>
                  setPaging({ key: filterKey, count: visibleCount + PAGE_SIZE })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft"
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
