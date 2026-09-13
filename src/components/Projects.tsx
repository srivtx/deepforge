"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Problem } from "@/types/problem";
import { PROJECTS, type Project } from "@/data/projects";
import { getProgress, type ProgressMap } from "@/lib/progress";
import {
  getNextStep,
  getProjectProgress,
  isProjectComplete,
} from "@/lib/projects";
import { cn, difficultyClasses } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectCard({
  project,
  progress,
  open,
  onToggle,
  onOpenStep,
}: {
  project: Project;
  progress: ProgressMap;
  open: boolean;
  onToggle: () => void;
  onOpenStep: (step: Problem) => void;
}) {
  const { solved, total, pct } = getProjectProgress(project, progress);
  const complete = isProjectComplete(project, progress);
  const nextStep = getNextStep(project, progress);
  const stepsId = `project-steps-${project.id}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-canvas-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={stepsId}
        className="rounded-lg p-4 text-left transition-colors hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{project.title}</h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              difficultyClasses(project.difficulty),
            )}
          >
            {project.difficulty}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-body">{project.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-hairline px-1.5 py-0.5 text-[10px] text-body-mid"
            >
              {tag}
            </span>
          ))}
          <span className="rounded border border-hairline px-1.5 py-0.5 text-[10px] text-mute">
            {total} steps
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-canvas-soft"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.title} progress`}
          >
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-body-mid">
            {solved}/{total}
          </span>
          {complete && (
            <span className="shrink-0 text-[10px] font-medium text-accent">
              Complete
            </span>
          )}
        </div>
      </button>

      {open && (
        <div
          id={stepsId}
          className="divide-y divide-hairline border-t border-hairline"
        >
          {project.steps.map((step, index) => {
            const stepSolved = Boolean(progress[step.id]?.solved);
            const isNext = nextStep?.id === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onOpenStep(step)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:px-5"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                    stepSolved
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-mute",
                  )}
                >
                  {stepSolved ? <CheckIcon /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {step.title}
                  </span>
                  <span className="block text-[11px] text-body-mid">
                    {step.category} · {step.difficulty}
                  </span>
                </span>
                {isNext && (
                  <span className="shrink-0 rounded border border-accent/40 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                    Next
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Projects() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    return () => window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
  }, []);

  const hasProgress = useMemo(
    () =>
      PROJECTS.some((project) => getProjectProgress(project, progress).solved > 0),
    [progress],
  );

  const openProblem = (problem: Problem) => {
    router.push(`/problems/${problem.id}`);
  };

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-6">
        <h2 className="text-sm font-medium text-body-mid">
          {PROJECTS.length} projects · progress saves automatically
        </h2>
      </div>

      {hasProgress && (
        <p className="mb-3 text-xs text-body-mid">
          You have started at least one project. Pick up where you left off.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            progress={progress}
            open={openId === project.id}
            onToggle={() =>
              setOpenId((current) => (current === project.id ? null : project.id))
            }
            onOpenStep={openProblem}
          />
        ))}
      </div>
    </section>
  );
}
