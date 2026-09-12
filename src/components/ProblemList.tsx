"use client";

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
}

const DIFFICULTIES: (Difficulty | "All")[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

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
}: ProblemListProps) {
  const filtered = problems.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (activeDifficulty !== "All" && p.difficulty !== activeDifficulty)
      return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.id.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <section
      id="problems"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Problems
        </h2>
        <p className="text-sm text-body-mid">
          {filtered.length} of {problems.length} shown. Click any card to open
          the editor.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, id, or category…"
          className="flex-1 rounded-lg border border-hairline bg-canvas-card px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        <div className="flex items-center gap-1 overflow-x-auto">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                activeCategory === c
                  ? "border-accent/40 bg-accent/5 text-accent"
                  : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
              )}
            >
              {c === "All" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              activeDifficulty === d
                ? "border-accent/40 bg-accent/5 text-accent"
                : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-canvas-card p-8 text-center text-sm text-body-mid">
          No problems match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
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
      )}
    </section>
  );
}
