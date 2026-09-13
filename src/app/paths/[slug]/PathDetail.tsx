"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import type { PathLevel, PathStage, ResolvedLearningPath } from "@/lib/paths";
import {
  nextProblemInPath,
  pathProgress,
  slugify,
  stageProgress,
} from "@/lib/paths";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import { cn, difficultyClasses } from "@/lib/utils";

interface PathDetailProps {
  path: ResolvedLearningPath;
  problems: ProblemMeta[];
  prev: ResolvedLearningPath | null;
  next: ResolvedLearningPath | null;
}

function levelClasses(level: PathLevel): string {
  switch (level) {
    case "Beginner":
      return "border-accent/40 bg-accent/5 text-accent";
    case "Intermediate":
      return "border-info/40 bg-info/5 text-info";
    case "Advanced":
      return "border-warning/40 bg-warning/5 text-warning";
    case "Mixed":
      return "border-hairline bg-canvas-soft text-body-mid";
  }
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

function StageSection({
  stage,
  index,
  showHeader,
  problems,
  progress,
  from,
}: {
  stage: PathStage;
  index: number;
  showHeader: boolean;
  problems: Map<string, ProblemMeta>;
  progress: ProgressMap;
  from: string;
}) {
  const stats = stageProgress(stage, progress);
  return (
    <section className="flex flex-col gap-3">
      {showHeader && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight text-ink">
              <span className="mr-2 font-mono text-xs font-normal text-mute">
                {index + 1}
              </span>
              {stage.title}
            </h2>
            <span className="font-mono text-xs text-body-mid">
              {stats.solved}/{stats.total}
            </span>
          </div>
          {stage.blurb && (
            <p className="max-w-3xl text-sm leading-relaxed text-body-mid">
              {stage.blurb}
            </p>
          )}
          <ProgressBar
            solved={stats.solved}
            total={stats.total}
            pct={stats.pct}
            label={`${stage.title} progress`}
          />
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
        {stage.problemIds.length === 0 ? (
          <p className="px-4 py-3 text-sm text-body-mid">
            No problems in this stage yet.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {stage.problemIds.map((id) => {
              const problem = problems.get(id);
              const solved = Boolean(progress[id]?.solved);
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft"
                >
                  <SolvedMark solved={solved} />
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
                          href={`/categories/${slugify(problem.category)}`}
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
}

export function PathDetail({ path, problems, prev, next }: PathDetailProps) {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener("storage", load);
    window.addEventListener("deepforge:progress-change", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("deepforge:progress-change", load);
    };
  }, []);

  const problemMap = new Map(problems.map((problem) => [problem.id, problem]));
  const from = `/paths/${path.slug}`;
  const overall = pathProgress(path, progress);
  const nextStep = nextProblemInPath(path, progress);
  const nextProblem = nextStep ? problemMap.get(nextStep.problemId) : undefined;
  const paragraphs = path.description
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const metaBits = [
    `${path.problemIds.length} ${path.problemIds.length === 1 ? "problem" : "problems"}`,
    `~${path.estimatedHours}h`,
  ];
  if (path.hasStages) {
    metaBits.push(
      `${path.stages.length} ${path.stages.length === 1 ? "stage" : "stages"}`,
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {path.level && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                levelClasses(path.level),
              )}
            >
              {path.level}
            </span>
          )}
          {path.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-xs text-body-mid"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {path.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-body-mid">
          {metaBits.map((bit, index) => (
            <span key={bit} className="flex items-center gap-3">
              {index > 0 && <span className="text-mute">·</span>}
              <span className="font-mono">{bit}</span>
            </span>
          ))}
        </div>
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="max-w-3xl text-sm leading-relaxed text-body"
          >
            {paragraph}
          </p>
        ))}
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-ink">Your progress</h2>
          <span className="font-mono text-xs text-body-mid">
            {overall.solved}/{overall.total} · {overall.pct}%
          </span>
        </div>
        <ProgressBar
          solved={overall.solved}
          total={overall.total}
          pct={overall.pct}
          label={`${path.title} progress`}
        />
        {nextStep && nextProblem ? (
          <Link
            href={problemHref(nextStep.problemId, from)}
            aria-label={`Continue ${path.title} with ${nextProblem.title}`}
            className="mt-1 inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            <span className="truncate">
              Continue path · {nextProblem.title}
            </span>
          </Link>
        ) : overall.total > 0 ? (
          <p className="mt-1 text-sm text-accent">
            Path complete. Nice work.
          </p>
        ) : (
          <p className="mt-1 text-sm text-body-mid">
            This path has no problems yet.
          </p>
        )}
      </section>

      {(path.goals.length > 0 || path.prerequisites.length > 0) && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {path.goals.length > 0 && (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
              <h2 className="text-sm font-medium text-ink">
                What you will learn
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {path.goals.map((goal) => (
                  <li
                    key={goal}
                    className="flex gap-2 text-sm leading-relaxed text-body"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {path.prerequisites.length > 0 && (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
              <h2 className="text-sm font-medium text-ink">Before you start</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {path.prerequisites.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-body"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mute"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="flex flex-col gap-8">
        {path.hasStages ? (
          path.stages.map((stage, index) => (
            <StageSection
              key={stage.id}
              stage={stage}
              index={index}
              showHeader
              problems={problemMap}
              progress={progress}
              from={from}
            />
          ))
        ) : (
          <StageSection
            stage={path.stages[0]}
            index={0}
            showHeader={false}
            problems={problemMap}
            progress={progress}
            from={from}
          />
        )}
      </div>

      {(prev || next) && (
        <nav
          aria-label="Learning path navigation"
          className="flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {prev ? (
            <Link
              href={`/paths/${prev.slug}`}
              className="group flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas-card px-4 py-3 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:max-w-[48%]"
            >
              <span className="text-[11px] text-mute">Previous path</span>
              <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/paths/${next.slug}`}
              className="group flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas-card px-4 py-3 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:max-w-[48%] sm:items-end sm:text-right"
            >
              <span className="text-[11px] text-mute">Next path</span>
              <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
