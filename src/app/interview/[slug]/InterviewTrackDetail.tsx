"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { InterviewTrack } from "@/data/interview";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import { categorySlug } from "@/lib/sections";
import { cn, difficultyClasses } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const MINUTES_PER_PROBLEM = 4;

interface InterviewTrackDetailProps {
  track: InterviewTrack;
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

export function InterviewTrackDetail({
  track,
  problems,
}: InterviewTrackDetailProps) {
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

  const allIds = track.phases.flatMap((phase) => phase.problemIds);
  const uniqueIds = Array.from(new Set(allIds));
  const total = allIds.length;
  const unique = uniqueIds.length;
  const from = `/interview/${track.id}`;
  const solved = uniqueIds.filter((id) => progress[id]?.solved).length;
  const pct = unique === 0 ? 0 : Math.round((solved / unique) * 100);
  const firstUnsolved = uniqueIds.find((id) => !progress[id]?.solved);
  const nextProblem = firstUnsolved
    ? problemMap.get(firstUnsolved)
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/interview"
          className="w-fit rounded-sm text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          ← All interview tracks
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
            {track.audience}
          </span>
          <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid">
            {track.style}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {track.company} · {track.role}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-body">
          {track.blurb}
        </p>
        <p className="font-mono text-xs text-body-mid">
          {track.phases.length} phases · {total} problems · {unique} unique
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href={`/interview?track=${track.id}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
          >
            Start timed mock
          </Link>
          <span className="font-mono text-xs text-body-mid">
            {track.mockProblemIds.length} problems · {MINUTES_PER_PROBLEM} min
            each
          </span>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-ink">Your progress</h2>
          <span className="font-mono text-xs text-body-mid">
            {solved}/{unique} · {pct}%
          </span>
        </div>
        <ProgressBar
          solved={solved}
          total={unique}
          pct={pct}
          label={`${track.company} ${track.role} track progress`}
        />
        {firstUnsolved && nextProblem ? (
          <Link
            href={problemHref(firstUnsolved, from)}
            aria-label={`Continue ${track.company} ${track.role} with ${nextProblem.title}`}
            className="mt-1 inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            <span className="truncate">
              Continue track · {nextProblem.title}
            </span>
          </Link>
        ) : unique > 0 ? (
          <p className="mt-1 text-sm text-accent">Track complete. Nice work.</p>
        ) : (
          <p className="mt-1 text-sm text-body-mid">
            This track has no problems yet.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-8">
        {track.phases.map((phase, index) => {
          const phaseSolved = phase.problemIds.filter(
            (id) => progress[id]?.solved,
          ).length;
          return (
            <section key={phase.name} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  <span className="mr-2 font-mono text-xs font-normal text-mute">
                    {index + 1}
                  </span>
                  {phase.name}
                </h2>
                <span className="font-mono text-xs text-body-mid">
                  {phaseSolved}/{phase.problemIds.length}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
                {phase.problemIds.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-body-mid">
                    No problems in this phase yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-hairline">
                    {phase.problemIds.map((id) => {
                      const problem = problemMap.get(id);
                      const solvedHere = Boolean(progress[id]?.solved);
                      return (
                        <li
                          key={id}
                          className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft"
                        >
                          <SolvedMark solved={solvedHere} />
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
          );
        })}
      </div>
    </div>
  );
}
