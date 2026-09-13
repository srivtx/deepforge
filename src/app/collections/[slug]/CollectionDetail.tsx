"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PremadeCollection } from "@/data/collections";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import { categorySlug } from "@/lib/sections";
import { cn, difficultyClasses } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

interface CollectionDetailProps {
  collection: PremadeCollection;
  problems: ProblemMeta[];
}

function SolvedMark({ solved }: { solved: boolean }) {
  if (solved) {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M2 5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Solved</span>
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="h-4 w-4 shrink-0 rounded-full border border-hairline"
    />
  );
}

function ProgressBar({
  solved,
  total,
  pct,
  label,
}: {
  solved: number;
  total: number;
  pct: number;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${solved} of ${total} problems solved (${pct}%)`}
      aria-label={label}
      className="h-1 w-full overflow-hidden rounded-full bg-canvas-mid"
    >
      <div
        className="h-full bg-accent transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CollectionDetail({
  collection,
  problems,
}: CollectionDetailProps) {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener("storage", load);
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
    };
  }, []);

  const problemMap = useMemo(
    () => new Map(problems.map((problem) => [problem.id, problem])),
    [problems],
  );

  const total = collection.problemIds.length;
  const from = `/collections/${collection.id}`;
  const solved = collection.problemIds.filter(
    (id) => progress[id]?.solved,
  ).length;
  const pct = total === 0 ? 0 : Math.round((solved / total) * 100);
  const firstUnsolved = collection.problemIds.find(
    (id) => !progress[id]?.solved,
  );
  const nextProblem = firstUnsolved
    ? problemMap.get(firstUnsolved)
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/collections"
          className="w-fit rounded-sm text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          ← All collections
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {collection.name}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-body">
          {collection.description}
        </p>
        <p className="font-mono text-xs text-body-mid">
          {total} {total === 1 ? "problem" : "problems"}
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-ink">Your progress</h2>
          <span className="font-mono text-xs text-body-mid">
            {solved}/{total} · {pct}%
          </span>
        </div>
        <ProgressBar
          solved={solved}
          total={total}
          pct={pct}
          label={`${collection.name} progress`}
        />
        {firstUnsolved ? (
          <Link
            href={problemHref(firstUnsolved, from)}
            aria-label={
              nextProblem
                ? `Continue ${collection.name} with ${nextProblem.title}`
                : `Continue ${collection.name}`
            }
            className="mt-1 inline-flex min-h-11 w-fit max-w-full items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
          >
            <span className="truncate">
              {nextProblem
                ? `Continue collection · ${nextProblem.title}`
                : "Continue collection"}
            </span>
          </Link>
        ) : total > 0 ? (
          <p className="mt-1 text-sm text-accent">
            Collection complete. Nice work.
          </p>
        ) : (
          <p className="mt-1 text-sm text-body-mid">
            This collection has no problems yet.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Problems
        </h2>
        <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
          {total === 0 ? (
            <p className="px-4 py-3 text-sm text-body-mid">
              No problems in this collection yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {collection.problemIds.map((id) => {
                const problem = problemMap.get(id);
                const isSolved = Boolean(progress[id]?.solved);
                return (
                  <li
                    key={id}
                    className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft"
                  >
                    <SolvedMark solved={isSolved} />
                    <div className="min-w-0 flex-1">
                      {problem ? (
                        <Link
                          href={problemHref(problem.id, from)}
                          className="block truncate rounded-sm text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          {problem.title}
                        </Link>
                      ) : (
                        <span className="block truncate text-sm text-body-mid">
                          Problem not available
                        </span>
                      )}
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-mute">
                          {id}
                        </span>
                        {problem && (
                          <Link
                            href={`/categories/${categorySlug(problem.category)}`}
                            className="rounded-sm text-[11px] text-body-mid transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                          >
                            {problem.category}
                          </Link>
                        )}
                      </div>
                    </div>
                    {problem && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                          difficultyClasses(problem.difficulty),
                        )}
                      >
                        {problem.difficulty}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
