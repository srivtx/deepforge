"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import type {
  PathLevel,
  PathStage,
  ResolvedCapstone,
  ResolvedLearningPath,
} from "@/lib/paths";
import {
  capstoneKindLabel,
  nextProblemInPath,
  pathProgress,
  resolvePrerequisites,
  slugify,
  stageProgress,
} from "@/lib/paths";
import { getDailyDateKey } from "@/lib/daily";
import {
  CHECKPOINT_CHANGE_EVENT,
  evaluateStageCheckpoint,
  isCheckpointSolved,
  readCheckpointAttempts,
  recordCheckpointAttempt,
  type CheckpointAttemptMap,
  type CheckpointReport,
} from "@/lib/pathCheckpoints";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  getReviewMap,
  REVIEWS_CHANGE_EVENT,
  type ReviewMap,
} from "@/lib/reviewQueue";
import { summarizeCoverage } from "@/lib/readiness";
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

const ARTIFACT_LABELS: Record<"lab" | "project" | "sim", string> = {
  lab: "Lab",
  project: "Project",
  sim: "Simulation",
};

function CheckpointCard({
  stageTitle,
  pathId,
  report,
  problems,
  progress,
  reviews,
  now,
  from,
}: {
  stageTitle: string;
  pathId: string;
  report: CheckpointReport;
  problems: Map<string, ProblemMeta>;
  progress: ProgressMap;
  reviews: ReviewMap;
  now: Date;
  from: string;
}) {
  const checkpoint = report.checkpoint;
  if (!checkpoint) return null;
  const todayKey = getDailyDateKey(now);
  const revisit = report.revisit;
  const firstMissedId = revisit?.firstProblemId ?? null;
  const firstMissed = firstMissedId ? problems.get(firstMissedId) : undefined;

  const status = report.passed
    ? { label: "Passed", classes: "border-accent/40 bg-accent/5 text-accent" }
    : report.outcome === "failed"
      ? {
          label: "Retry ready",
          classes: "border-warning/40 bg-warning/5 text-warning",
        }
      : {
          label: `${report.bossSolved}/${report.required} to pass`,
          classes: "border-hairline bg-canvas-card text-body-mid",
        };

  return (
    <Reveal>
      <div className="rounded-lg border border-hairline bg-canvas-soft p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-ink">Stage checkpoint</h3>
          <span
            role="status"
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              status.classes,
            )}
          >
            {status.label}
          </span>
        </div>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-body-mid">
          {report.passed
            ? `You hit the pass mark (${report.required} of ${checkpoint.bossIds.length}), so this stage counts as complete even if a few problems remain.`
            : `A checkpoint is a short retrieval test drawn from this stage: solve ${report.required} of ${checkpoint.bossIds.length} from memory to mark the stage complete. The stage stays open either way.`}
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {checkpoint.bossIds.map((id) => {
            const problem = problems.get(id);
            const solved = isCheckpointSolved(id, progress, reviews, todayKey);
            const reason = checkpoint.selection.reasons[id];
            return (
              <li key={id} className="flex items-center gap-2">
                <SolvedMark solved={solved} />
                {problem ? (
                  <>
                    <Link
                      href={problemHref(id, from)}
                      className="min-w-0 flex-1 truncate rounded-sm text-sm text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {problem.title}
                    </Link>
                    {reason === "due-review" && (
                      <span className="shrink-0 rounded-full border border-info/40 bg-info/5 px-1.5 py-0.5 text-[10px] font-medium text-info">
                        Review due
                      </span>
                    )}
                    {reason === "replacement" && (
                      <span className="shrink-0 rounded-full border border-warning/40 bg-warning/5 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        Fresh pick
                      </span>
                    )}
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                        difficultyClasses(problem.difficulty),
                      )}
                    >
                      {problem.difficulty}
                    </span>
                  </>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm text-body-mid">
                    Problem not available{" "}
                    <span className="font-mono text-[11px] text-mute">
                      {id}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {revisit && (
          <div className="mt-3 rounded-lg border border-warning/40 bg-warning/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-ink">
                {report.passed ? "Worth revisiting" : "Revisit these"}
              </h4>
              <span className="text-[10px] font-medium text-warning">
                {revisit.missedIds.length} still open
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-body-mid">
              {revisit.hint}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {revisit.missedIds.map((id) => {
                const problem = problems.get(id);
                return (
                  <li key={id} className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                    />
                    {problem ? (
                      <>
                        <Link
                          href={problemHref(id, from)}
                          className="min-w-0 flex-1 truncate rounded-sm text-sm text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          {problem.title}
                        </Link>
                        <span className="shrink-0 text-[10px] text-body-mid">
                          {problem.category}
                        </span>
                      </>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-sm text-body-mid">
                        <span className="font-mono text-[11px]">{id}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {firstMissedId && (
              <Link
                href={problemHref(firstMissedId, from)}
                aria-label={`Review the ${revisit.missedIds.length} checkpoint ${
                  revisit.missedIds.length === 1 ? "problem" : "problems"
                } you missed, starting with ${firstMissed?.title ?? firstMissedId}`}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-warning/40 bg-canvas-card px-4 text-sm font-medium text-ink transition-colors hover:border-warning/60 hover:text-warning focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-9 sm:w-auto"
              >
                Review these{" "}
                {revisit.missedIds.length === 1
                  ? "1 problem"
                  : `${revisit.missedIds.length} problems`}
              </Link>
            )}
          </div>
        )}

        {!report.passed && !report.allSolved && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <button
              type="button"
              onClick={() =>
                recordCheckpointAttempt(
                  pathId,
                  checkpoint.stageId,
                  checkpoint.bossIds,
                  progress,
                  { reviews, now: new Date() },
                )
              }
              aria-label={`Record a checkpoint attempt for ${stageTitle}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-hairline bg-canvas-card px-3 text-xs font-medium text-body-mid transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-8"
            >
              Record attempt
            </button>
            <span className="text-[11px] text-body-mid">
              Tried this set and did not pass? Record it — the next set swaps in
              fresh problems from the same stage.
            </span>
          </div>
        )}

        {checkpoint.artifact && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <span className="rounded-full border border-hairline bg-canvas-card px-1.5 py-0.5 text-[10px] font-medium text-body-mid">
              {ARTIFACT_LABELS[checkpoint.artifact.kind]}
            </span>
            <span className="text-xs text-body-mid">
              Recommended next step
            </span>
            <Link
              href={checkpoint.artifact.href}
              className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              {checkpoint.artifact.title}
            </Link>
            {checkpoint.artifact.difficulty && (
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                  difficultyClasses(checkpoint.artifact.difficulty),
                )}
              >
                {checkpoint.artifact.difficulty}
              </span>
            )}
          </div>
        )}
      </div>
    </Reveal>
  );
}

function StageSection({
  stage,
  index,
  showHeader,
  pathId,
  problems,
  progress,
  reviews,
  attempts,
  now,
  from,
}: {
  stage: PathStage;
  index: number;
  showHeader: boolean;
  pathId: string;
  problems: Map<string, ProblemMeta>;
  progress: ProgressMap;
  reviews: ReviewMap;
  attempts: CheckpointAttemptMap;
  now: Date;
  from: string;
}) {
  const stats = stageProgress(stage, progress);
  const report = evaluateStageCheckpoint(stage, problems, progress, {
    pathId,
    reviews,
    attempts,
    now,
  });
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
            <div className="flex items-center gap-2">
              {report.complete && (
                <span className="rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Complete
                </span>
              )}
              <span className="font-mono text-xs text-body-mid">
                {stats.solved}/{stats.total}
              </span>
            </div>
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
      {report.checkpoint && (
        <CheckpointCard
          stageTitle={stage.title}
          pathId={pathId}
          report={report}
          problems={problems}
          progress={progress}
          reviews={reviews}
          now={now}
          from={from}
        />
      )}
    </section>
  );
}

function CapstoneCard({ capstone }: { capstone: ResolvedCapstone }) {
  return (
    <section
      aria-labelledby="path-capstone-heading"
      className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="path-capstone-heading"
          className="text-sm font-medium text-ink"
        >
          Capstone
        </h2>
        <span className="rounded-full border border-hairline bg-canvas-soft px-1.5 py-0.5 text-[10px] font-medium text-body-mid">
          {capstoneKindLabel(capstone.kind)}
        </span>
      </div>
      <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
        Close the path with one real artifact from the catalog.
      </p>
      <div className="min-w-0">
        <Link
          href={capstone.href}
          className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          {capstone.title}
        </Link>
        {capstone.note && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-body">
            {capstone.note}
          </p>
        )}
      </div>
    </section>
  );
}

export function PathDetail({ path, problems, prev, next }: PathDetailProps) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [attempts, setAttempts] = useState<CheckpointAttemptMap>({});
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const load = () => {
      const current = new Date();
      setProgress(getProgress());
      setReviews(getReviewMap(current));
      setAttempts(readCheckpointAttempts());
      setNow(current);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("deepforge:progress-change", load);
    window.addEventListener(REVIEWS_CHANGE_EVENT, load);
    window.addEventListener(CHECKPOINT_CHANGE_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("deepforge:progress-change", load);
      window.removeEventListener(REVIEWS_CHANGE_EVENT, load);
      window.removeEventListener(CHECKPOINT_CHANGE_EVENT, load);
    };
  }, []);

  const problemMap = new Map(problems.map((problem) => [problem.id, problem]));
  const from = `/paths/${path.slug}`;
  const overall = pathProgress(path, progress);
  const readiness = summarizeCoverage(path.problemIds, progress);
  const prerequisites = resolvePrerequisites(path.prerequisites);
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
        <p
          role="status"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-body-mid"
        >
          <span>
            Path readiness{" "}
            <span className="font-mono text-ink">{readiness.percent}%</span>
          </span>
          <span className="font-mono">
            Easy {readiness.byDifficulty.Easy.percent}% · Medium{" "}
            {readiness.byDifficulty.Medium.percent}% · Hard{" "}
            {readiness.byDifficulty.Hard.percent}%
          </span>
        </p>
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

      {(path.goals.length > 0 || prerequisites.length > 0) && (
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
          {prerequisites.length > 0 && (
            <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
              <h2 className="text-sm font-medium text-ink">Before you start</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {prerequisites.map((prerequisite) => (
                  <li
                    key={prerequisite.slug}
                    className="flex gap-2 text-sm leading-relaxed text-body"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mute"
                    />
                    <Link
                      href={`/paths/${prerequisite.slug}`}
                      className="rounded-sm underline decoration-hairline underline-offset-2 transition-colors hover:text-accent hover:decoration-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      {prerequisite.title}
                    </Link>
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
              pathId={path.id}
              problems={problemMap}
              progress={progress}
              reviews={reviews}
              attempts={attempts}
              now={now}
              from={from}
            />
          ))
        ) : (
          <StageSection
            stage={path.stages[0]}
            index={0}
            showHeader={false}
            pathId={path.id}
            problems={problemMap}
            progress={progress}
            reviews={reviews}
            attempts={attempts}
            now={now}
            from={from}
          />
        )}
      </div>

      {path.capstone && <CapstoneCard capstone={path.capstone} />}

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
