/**
 * Pure helpers for the learning-path experience.
 *
 * The path records in `src/data/problems/paths.ts` may carry extra optional
 * fields (slug, level, tags, stages, goals, prerequisites). This module reads
 * them defensively so it type-checks whether or not those fields exist yet,
 * and always falls back to a stable derivation:
 *
 *   - missing slug  -> slugify(title), deduped with a `-2`/`-3` suffix
 *   - missing stages -> a single implicit stage built from `problemIds`
 *
 * No JSX, no window/localStorage: everything here is deterministic and can be
 * exercised directly by tests and by `scripts/verify-paths.ts`.
 */

import { LEARNING_PATHS } from "@/data/problems/paths";
import type { LearningPath } from "@/types/problem";

export type PathLevel = "Beginner" | "Intermediate" | "Advanced" | "Mixed";

export interface PathStage {
  id: string;
  title: string;
  blurb: string;
  problemIds: string[];
}

/** Optional fields the path content author may add to a `LearningPath`. */
export interface PathExtras {
  slug?: string;
  level?: string;
  tags?: string[];
  stages?: PathStage[];
  goals?: string[];
  prerequisites?: string[];
}

export interface ResolvedLearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  level: PathLevel | undefined;
  tags: string[];
  goals: string[];
  prerequisites: string[];
  stages: PathStage[];
  /** False when `stages` was absent and the single stage is the fallback. */
  hasStages: boolean;
  /** Flattened, deduped problem ids in path order. */
  problemIds: string[];
}

export interface ProgressLike {
  solved?: boolean;
}

export type ProgressState = Record<string, ProgressLike | undefined>;

export interface PathProgress {
  solved: number;
  total: number;
  pct: number;
}

export interface NextPathProblem {
  problemId: string;
  stageId: string;
}

export interface AdjacentPaths {
  prev: ResolvedLearningPath | null;
  next: ResolvedLearningPath | null;
}

const PATH_LEVELS: readonly PathLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Mixed",
];

const FALLBACK_SLUG = "path";

/** Lowercase, accent-folded, hyphenated, URL-safe slug. */
export function slugify(value: string): string {
  const slug = (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || FALLBACK_SLUG;
}

/** Read the optional content fields without assuming the type declares them. */
export function pathExtras(path: LearningPath): PathExtras {
  return path as unknown as PathExtras;
}

function explicitSlug(path: LearningPath): string | undefined {
  const value = pathExtras(path).slug;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Keep string entries only: trimmed, empty dropped, duplicates removed. */
function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

function cleanLevel(value: unknown): PathLevel | null {
  if (typeof value !== "string") return null;
  const match = PATH_LEVELS.find(
    (level) => level.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? null;
}

/**
 * Slugs for a list of paths in order, deduped with `-2`, `-3`, ... suffixes
 * when two paths resolve to the same base slug. Index-aligned with the input.
 */
export function assignSlugs(paths: LearningPath[]): string[] {
  const used = new Set<string>();
  return paths.map((path) => {
    const base = explicitSlug(path) ?? slugify(path.title);
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(slug);
    return slug;
  });
}

function cleanStage(raw: unknown, index: number): PathStage | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim()
      : `stage-${index + 1}`;
  const title =
    typeof value.title === "string" && value.title.trim()
      ? value.title.trim()
      : `Stage ${index + 1}`;
  const blurb = typeof value.blurb === "string" ? value.blurb.trim() : "";
  return { id, title, blurb, problemIds: stringList(value.problemIds) };
}

/**
 * Authored stages when present and usable, otherwise one implicit stage built
 * from the flat `problemIds` list (marked with `hasStages: false`).
 */
export function resolveStages(path: LearningPath): {
  stages: PathStage[];
  hasStages: boolean;
} {
  const raw = pathExtras(path).stages;
  if (Array.isArray(raw) && raw.length > 0) {
    const stages = raw
      .map((stage, index) => cleanStage(stage, index))
      .filter((stage): stage is PathStage => stage !== null);
    if (stages.length > 0) return { stages, hasStages: true };
  }
  return {
    stages: [
      {
        id: `${path.id}-all`,
        title: "All problems",
        blurb: "",
        problemIds: stringList(path.problemIds),
      },
    ],
    hasStages: false,
  };
}

/** Flattened, deduped problem ids in stage (or flat list) order. */
export function flattenPathProblems(path: LearningPath): string[] {
  return stringList(
    resolveStages(path).stages.flatMap((stage) => stage.problemIds),
  );
}

export function resolvePath(
  path: LearningPath,
  slug: string,
): ResolvedLearningPath {
  const extras = pathExtras(path);
  const { stages, hasStages } = resolveStages(path);
  return {
    id: path.id,
    slug,
    title: path.title,
    description: path.description,
    estimatedHours:
      typeof path.estimatedHours === "number" ? path.estimatedHours : 0,
    level: cleanLevel(extras.level) ?? undefined,
    tags: stringList(extras.tags),
    goals: stringList(extras.goals),
    prerequisites: stringList(extras.prerequisites),
    stages,
    hasStages,
    problemIds: stringList(stages.flatMap((stage) => stage.problemIds)),
  };
}

let slugCache: {
  byObject: Map<LearningPath, string>;
  byId: Map<string, string>;
} | null = null;

function slugResolution(): {
  byObject: Map<LearningPath, string>;
  byId: Map<string, string>;
} {
  if (!slugCache) {
    const byObject = new Map<LearningPath, string>();
    const byId = new Map<string, string>();
    const slugs = assignSlugs(LEARNING_PATHS);
    LEARNING_PATHS.forEach((path, index) => {
      const slug = slugs[index];
      byObject.set(path, slug);
      if (!byId.has(path.id)) byId.set(path.id, slug);
    });
    slugCache = { byObject, byId };
  }
  return slugCache;
}

/** Stable slug for a path: explicit `slug`, else deduped `slugify(title)`. */
export function pathSlug(path: LearningPath): string {
  const { byObject, byId } = slugResolution();
  return (
    byObject.get(path) ??
    byId.get(path.id) ??
    explicitSlug(path) ??
    slugify(path.title)
  );
}

export function getAllPaths(): ResolvedLearningPath[] {
  return LEARNING_PATHS.map((path) => resolvePath(path, pathSlug(path)));
}

export function getPathBySlug(
  slug: string,
): ResolvedLearningPath | undefined {
  const value = slug.trim();
  const all = getAllPaths();
  return all.find((path) => path.slug === value) ?? all.find((p) => p.id === value);
}

export function stageProgress(
  stage: Pick<PathStage, "problemIds">,
  progress: ProgressState,
): PathProgress {
  let solved = 0;
  for (const id of stage.problemIds) {
    if (progress[id]?.solved) solved += 1;
  }
  const total = stage.problemIds.length;
  return {
    solved,
    total,
    pct: total === 0 ? 0 : Math.round((solved / total) * 100),
  };
}

export function pathProgress(
  path: LearningPath,
  progress: ProgressState,
): PathProgress {
  return stageProgress({ problemIds: flattenPathProblems(path) }, progress);
}

/** First unsolved problem in path order, with the stage it belongs to. */
export function nextProblemInPath(
  path: LearningPath,
  progress: ProgressState,
): NextPathProblem | null {
  for (const stage of resolveStages(path).stages) {
    for (const problemId of stage.problemIds) {
      if (!progress[problemId]?.solved) {
        return { problemId, stageId: stage.id };
      }
    }
  }
  return null;
}

/** Prev/next paths in catalog order. Accepts a slug (or an id). */
export function adjacentPaths(slug: string): AdjacentPaths {
  const value = slug.trim();
  const all = getAllPaths();
  const index = all.findIndex(
    (path) => path.slug === value || path.id === value,
  );
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}
