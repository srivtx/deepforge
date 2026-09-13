/**
 * DeepForge learning-path verifier.
 *
 *   bun run scripts/verify-paths.ts
 *
 * Structural checks for `src/data/problems/paths.ts`:
 *   - slug present, unique, and URL-safe
 *   - stages present and usable (falls back to a flat problemIds list)
 *   - no duplicate problem ids, no unknown problem ids
 *   - no empty stages, no path under 6 problems
 *   - estimatedHours positive, title/description non-empty
 *
 * Exits 1 on any error and prints `ALL GREEN` when the catalog is clean.
 */

import { LEARNING_PATHS } from "../src/data/problems/paths";
import { PROBLEMS } from "../src/data/problems";
import {
  assignSlugs,
  pathExtras,
  pathSlug,
} from "../src/lib/paths";
import type { LearningPath } from "../src/types/problem";

const URL_SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_PROBLEMS_PER_PATH = 6;

interface PathRow {
  slug: string;
  title: string;
  problems: number;
  stages: number;
  hours: number;
  errors: number;
}

function explicitSlug(path: LearningPath): string | null {
  const value = pathExtras(path).slug;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function rawStages(path: LearningPath): unknown[] | null {
  const value = pathExtras(path).stages;
  return Array.isArray(value) ? value : null;
}

function rawProblemIds(path: LearningPath): string[] {
  const stages = rawStages(path);
  if (stages && stages.length > 0) {
    const ids: string[] = [];
    for (const stage of stages) {
      const list =
        stage && typeof stage === "object"
          ? (stage as Record<string, unknown>).problemIds
          : undefined;
      if (Array.isArray(list)) {
        for (const id of list) if (typeof id === "string") ids.push(id);
      }
    }
    return ids;
  }
  return Array.isArray(path.problemIds) ? path.problemIds : [];
}

function main() {
  const knownProblemIds = new Set(PROBLEMS.map((problem) => problem.id));
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows: PathRow[] = [];

  const resolvedSlugs = assignSlugs(LEARNING_PATHS);
  const slugOwners = new Map<string, number[]>();
  const explicitOwners = new Map<string, number[]>();
  LEARNING_PATHS.forEach((path, index) => {
    const ownerList = slugOwners.get(resolvedSlugs[index]) ?? [];
    ownerList.push(index);
    slugOwners.set(resolvedSlugs[index], ownerList);

    const explicit = explicitSlug(path);
    if (explicit) {
      const list = explicitOwners.get(explicit) ?? [];
      list.push(index);
      explicitOwners.set(explicit, list);
    }
  });

  LEARNING_PATHS.forEach((path, index) => {
    const where = path.id || `path #${index + 1}`;
    const slug = resolvedSlugs[index];
    const pathErrors: string[] = [];
    const pathWarnings: string[] = [];
    const fail = (message: string) => pathErrors.push(`${where}: ${message}`);
    const warn = (message: string) => pathWarnings.push(`${where}: ${message}`);

    // Title / description.
    if (typeof path.title !== "string" || !path.title.trim()) {
      fail("missing/empty title");
    }
    if (typeof path.description !== "string" || !path.description.trim()) {
      fail("missing/empty description");
    }

    // Slug.
    const explicit = explicitSlug(path);
    if (!explicit) {
      fail(`missing slug (fallback would be "${slug}")`);
    } else if (!URL_SAFE_SLUG.test(explicit)) {
      fail(`slug "${explicit}" is not URL-safe`);
    }
    if (!URL_SAFE_SLUG.test(slug)) {
      fail(`resolved slug "${slug}" is not URL-safe`);
    }
    const owners = slugOwners.get(slug) ?? [];
    if (owners.length > 1) {
      const others = owners
        .filter((owner) => owner !== index)
        .map((owner) => LEARNING_PATHS[owner].id || `#${owner + 1}`);
      fail(`duplicate slug "${slug}" (also used by ${others.join(", ")})`);
    }
    if (explicit && (explicitOwners.get(explicit)?.length ?? 0) > 1) {
      fail(`duplicate slug "${explicit}"`);
    }

    // Hours.
    if (
      typeof path.estimatedHours !== "number" ||
      !Number.isFinite(path.estimatedHours) ||
      path.estimatedHours <= 0
    ) {
      fail(`estimatedHours must be a positive number (got ${JSON.stringify(path.estimatedHours)})`);
    }

    // Stages.
    const authoredStages = rawStages(path);
    if (!authoredStages || authoredStages.length === 0) {
      const flatCount = rawProblemIds(path).length;
      if (flatCount === 0) {
        fail("no stages and no problemIds");
      } else {
        warn(
          `no stages; falling back to a flat list of ${flatCount} problemIds`,
        );
      }
    } else {
      authoredStages.forEach((stage, stageIndex) => {
        const value =
          stage && typeof stage === "object"
            ? (stage as Record<string, unknown>)
            : null;
        const list = value && Array.isArray(value.problemIds) ? value.problemIds : [];
        if (list.length === 0) {
          const stageId =
            value && typeof value.id === "string" && value.id.trim()
              ? value.id
              : `#${stageIndex + 1}`;
          fail(`stage "${stageId}" has zero problems`);
        }
        if (!value || typeof value.title !== "string" || !value.title.trim()) {
          warn(`stage #${stageIndex + 1} is missing a title`);
        }
        if (!value || typeof value.blurb !== "string" || !value.blurb.trim()) {
          warn(`stage #${stageIndex + 1} is missing a blurb`);
        }
      });
    }

    // Problem ids: duplicates and unknown references, in raw order.
    const ids = rawProblemIds(path);
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) fail(`duplicate problem id "${id}"`);
      else seen.add(id);
      if (!knownProblemIds.has(id)) fail(`unknown problem id "${id}"`);
    }

    if (seen.size < MIN_PROBLEMS_PER_PATH) {
      fail(`only ${seen.size} problems, need at least ${MIN_PROBLEMS_PER_PATH}`);
    }

    if (pathErrors.length) errors.push(...pathErrors);
    if (pathWarnings.length) warnings.push(...pathWarnings);

    const stageCount =
      authoredStages && authoredStages.length > 0 ? authoredStages.length : 0;
    rows.push({
      slug: pathSlug(path),
      title: path.title ?? "",
      problems: seen.size,
      stages: stageCount,
      hours: typeof path.estimatedHours === "number" ? path.estimatedHours : 0,
      errors: pathErrors.length,
    });
  });

  const slugWidth = Math.max(4, ...rows.map((row) => row.slug.length));
  const titleWidth = Math.min(
    36,
    Math.max(5, ...rows.map((row) => row.title.length)),
  );
  console.log(
    `${"slug".padEnd(slugWidth)}  ${"problems".padStart(8)}  ${"stages".padStart(6)}  ${"hours".padStart(5)}  ${"title".padEnd(titleWidth)}  status`,
  );
  console.log("-".repeat(slugWidth + titleWidth + 32));
  for (const row of rows) {
    const title =
      row.title.length > titleWidth
        ? `${row.title.slice(0, titleWidth - 1)}…`
        : row.title;
    console.log(
      `${row.slug.padEnd(slugWidth)}  ${String(row.problems).padStart(8)}  ${String(
        row.stages,
      ).padStart(6)}  ${String(row.hours).padStart(5)}  ${title.padEnd(
        titleWidth,
      )}  ${row.errors === 0 ? "OK" : `${row.errors} error(s)`}`,
    );
  }

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
  if (errors.length) {
    console.log(`\n${errors.length} error(s):`);
    for (const error of errors) console.log(`  - ${error}`);
  }

  console.log(
    `\nPaths: ${LEARNING_PATHS.length}   Errors: ${errors.length}   Warnings: ${warnings.length}`,
  );

  if (errors.length) {
    console.log("FAILED");
    process.exit(1);
  }
  console.log("ALL GREEN");
}

main();
