"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import type { LearningPath } from "@/types/problem";
import type { PathLevel } from "@/lib/paths";
import {
  nextProblemInPath,
  pathExtras,
  pathProgress,
  pathSlug,
  resolveStages,
} from "@/lib/paths";
import {
  CHECKPOINT_CHANGE_EVENT,
  readCheckpointAttempts,
  summarizeCheckpoints,
  type CheckpointAttemptMap,
  type CheckpointSummary,
} from "@/lib/pathCheckpoints";
import {
  getReviewMap,
  REVIEWS_CHANGE_EVENT,
  type ReviewMap,
} from "@/lib/reviewQueue";

interface PathsProps {
  paths: LearningPath[];
  problems: ProblemMeta[];
  progress: Record<string, { solved?: boolean }>;
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

function pathMeta(path: LearningPath): {
  level: string | null;
  tags: string[];
  stageCount: number;
} {
  const extras = pathExtras(path);
  const { stages, hasStages } = resolveStages(path);
  const level = typeof extras.level === "string" ? extras.level : null;
  const tags = Array.isArray(extras.tags)
    ? extras.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  return {
    level,
    tags,
    stageCount: hasStages ? stages.length : 0,
  };
}

function checkpointChip(
  summary: CheckpointSummary,
): { label: string; classes: string } | null {
  if (summary.total === 0) return null;
  if (summary.failed > 0) {
    return {
      label:
        summary.failed === 1
          ? "Retry checkpoint"
          : `${summary.failed} checkpoints to retry`,
      classes: "border-warning/40 bg-warning/5 text-warning",
    };
  }
  if (summary.due > 0) {
    return {
      label: summary.due === 1 ? "Review due" : `${summary.due} reviews due`,
      classes: "border-info/40 bg-info/5 text-info",
    };
  }
  if (summary.complete >= summary.total) {
    return {
      label: "Checkpoints passed",
      classes: "border-accent/40 bg-accent/5 text-accent",
    };
  }
  return {
    label: `${summary.passed}/${summary.total} checkpoints`,
    classes: "border-hairline bg-canvas-soft text-body-mid",
  };
}

export function Paths({ paths, problems, progress }: PathsProps) {
  const problemMap = new Map(problems.map((p) => [p.id, p]));
  const [checkpointState, setCheckpointState] = useState<{
    reviews: ReviewMap;
    attempts: CheckpointAttemptMap;
    now: Date;
  }>(() => ({ reviews: {}, attempts: {}, now: new Date() }));

  useEffect(() => {
    const load = () => {
      const current = new Date();
      setCheckpointState({
        reviews: getReviewMap(current),
        attempts: readCheckpointAttempts(),
        now: current,
      });
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener(REVIEWS_CHANGE_EVENT, load);
    window.addEventListener(CHECKPOINT_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(REVIEWS_CHANGE_EVENT, load);
      window.removeEventListener(CHECKPOINT_CHANGE_EVENT, load);
    };
  }, []);

  return (
    <section
      id="paths"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {paths.map((path) => {
          const slug = pathSlug(path);
          const { solved, total, pct } = pathProgress(path, progress);
          const next = nextProblemInPath(path, progress);
          const nextProblem = next ? problemMap.get(next.problemId) : undefined;
          const { level, tags, stageCount } = pathMeta(path);
          const visibleTags = tags.slice(0, 4);
          const { stages } = resolveStages(path);
          const chip = checkpointChip(
            summarizeCheckpoints(stages, problemMap, progress, {
              pathId: path.id,
              reviews: checkpointState.reviews,
              attempts: checkpointState.attempts,
              now: checkpointState.now,
            }),
          );
          return (
            <div
              key={path.id}
              className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">
                    <Link
                      href={`/paths/${slug}`}
                      className="rounded-sm transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {path.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-body-mid">
                    {total} problems · ~{path.estimatedHours}h
                    {stageCount > 0 &&
                      ` · ${stageCount} ${stageCount === 1 ? "stage" : "stages"}`}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-accent">
                  {solved}/{total}
                </span>
              </div>

              {(level || tags.length > 0 || chip) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {level && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${levelClasses(
                        level as PathLevel,
                      )}`}
                    >
                      {level}
                    </span>
                  )}
                  {chip && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${chip.classes}`}
                    >
                      {chip.label}
                    </span>
                  )}
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[10px] text-body-mid"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > visibleTags.length && (
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-mute">
                      +{tags.length - visibleTags.length}
                    </span>
                  )}
                </div>
              )}

              <p className="line-clamp-3 text-sm leading-relaxed text-body">
                {path.description}
              </p>

              <div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-valuetext={`${solved} of ${total} problems solved (${pct}%)`}
                  aria-label={`${path.title} progress`}
                  className="h-1 w-full overflow-hidden rounded-full bg-canvas-mid"
                >
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                <Link
                  href={`/paths/${slug}`}
                  className="rounded-lg border border-accent/40 bg-accent/5 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  View path
                </Link>
                {next && nextProblem && (
                  <Link
                    href={`/problems/${next.problemId}`}
                    aria-label={`Continue ${path.title} with ${nextProblem.title}`}
                    title={nextProblem.title}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-sm text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                  >
                    Continue
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
