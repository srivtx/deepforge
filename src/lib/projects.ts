import type { Problem } from "@/types/problem";
import type { Project } from "@/data/projects";
import type { ProgressMap } from "@/lib/progress";

export interface ProjectProgress {
  solved: number;
  total: number;
  pct: number;
}

export function getProjectProgress(
  project: Project,
  progress: ProgressMap,
): ProjectProgress {
  const total = project.steps.length;
  const solved = project.steps.filter((step) => progress[step.id]?.solved).length;
  const pct = total === 0 ? 0 : Math.round((solved / total) * 100);
  return { solved, total, pct };
}

export function getNextStep(
  project: Project,
  progress: ProgressMap,
): Problem | null {
  return project.steps.find((step) => !progress[step.id]?.solved) ?? null;
}

export function isProjectComplete(
  project: Project,
  progress: ProgressMap,
): boolean {
  return (
    project.steps.length > 0 &&
    project.steps.every((step) => progress[step.id]?.solved)
  );
}
