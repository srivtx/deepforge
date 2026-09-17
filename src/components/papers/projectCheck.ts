import type { PaperProject } from "@/data/papers/types";

/**
 * Pure shape checks for `Paper.project`. Content files are authored in
 * parallel, so every rule here is about a project that is present: callers
 * skip papers without one. The validator returns a list of human-readable
 * violations and an empty list for a well-formed project.
 */

export const PROJECT_DIFFICULTIES = [
  "starter",
  "intermediate",
  "advanced",
] as const;

export type ProjectDifficulty = (typeof PROJECT_DIFFICULTIES)[number];

export const PROJECT_DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Badge colours mirror the paper page's tier badge and the difficulty tokens. */
export const PROJECT_DIFFICULTY_BADGE: Record<ProjectDifficulty, string> = {
  starter: "border-accent/40 text-accent",
  intermediate: "border-warning/40 text-warning",
  advanced: "border-error/40 text-error",
};

export interface ProjectRegistry {
  labIds: ReadonlySet<string>;
  problemIds: ReadonlySet<string>;
}

export function validatePaperProject(
  project: PaperProject,
  registry: ProjectRegistry,
): string[] {
  const errors: string[] = [];

  if (project.title.trim().length === 0) errors.push("title is empty");
  if (project.pitch.trim().length === 0) errors.push("pitch is empty");
  if (!PROJECT_DIFFICULTIES.includes(project.difficulty)) {
    errors.push(`difficulty "${project.difficulty}" is not valid`);
  }
  if (project.timeEstimate.trim().length === 0) {
    errors.push("timeEstimate is empty");
  }

  if (project.milestones.length < 4) {
    errors.push(
      `needs at least 4 milestones (has ${project.milestones.length})`,
    );
  }
  project.milestones.forEach((milestone, index) => {
    if (milestone.trim().length === 0) {
      errors.push(`milestone ${index + 1} is empty`);
    }
  });

  if (project.starterCode.trim().length === 0) {
    errors.push("starterCode is empty");
  } else if (
    !project.starterCode.includes("def ") &&
    !project.starterCode.includes("TODO")
  ) {
    errors.push('starterCode must contain "def " or "TODO"');
  }

  if (project.successCriteria.length < 2) {
    errors.push(
      `needs at least 2 success criteria (has ${project.successCriteria.length})`,
    );
  }
  project.successCriteria.forEach((criterion, index) => {
    if (criterion.trim().length === 0) {
      errors.push(`success criterion ${index + 1} is empty`);
    }
  });

  project.stretch.forEach((goal, index) => {
    if (goal.trim().length === 0) {
      errors.push(`stretch goal ${index + 1} is empty`);
    }
  });

  for (const id of project.relatedLabIds ?? []) {
    if (!registry.labIds.has(id)) {
      errors.push(`related lab id "${id}" does not resolve`);
    }
  }
  for (const id of project.relatedProblemIds ?? []) {
    if (!registry.problemIds.has(id)) {
      errors.push(`related problem id "${id}" does not resolve`);
    }
  }

  return errors;
}
