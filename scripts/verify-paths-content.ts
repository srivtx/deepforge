/**
 * DeepForge learning-path content verifier.
 *
 *   bun run scripts/verify-paths-content.ts
 *
 * Validates the hand-authored curriculum in `src/data/problems/paths.ts`
 * against the real problem bank and the shape the path UI expects. Fails
 * (exit 1) on unknown problem ids, duplicates, empty stages, flattened
 * problemIds that disagree with the stage lists, missing metadata, short
 * paths/stages, and bad slugs. Prints per-path stats on the way.
 */

import { LEARNING_PATHS, PROBLEMS } from "../src/data/problems";
import type { Difficulty, Problem } from "../src/types/problem";

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced", "Mixed"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const byId = new Map<string, Problem>(PROBLEMS.map((p) => [p.id, p]));

const errors: string[] = [];

function error(message: string): void {
  errors.push(message);
}

function shortList(ids: string[]): string {
  if (ids.length <= 4) return ids.join(", ");
  return `${ids.slice(0, 4).join(", ")} +${ids.length - 4} more`;
}

function difficultyMix(ids: string[]): Record<Difficulty, number> {
  const mix: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const id of ids) {
    const problem = byId.get(id);
    if (problem) mix[problem.difficulty] += 1;
  }
  return mix;
}

const stats: string[] = [];
const seenSlugs = new Map<string, string>();

for (const path of LEARNING_PATHS) {
  const label = path.id || "(missing id)";
  const pathProblems: string[] = [];
  const seenInPath = new Set<string>();
  const stageIds = new Set<string>();

  if (!path.slug?.trim()) {
    error(`${label}: missing slug`);
  } else if (!SLUG_RE.test(path.slug)) {
    error(`${label}: slug is not URL-safe (${JSON.stringify(path.slug)})`);
  } else if (seenSlugs.has(path.slug)) {
    error(`${label}: duplicate slug ${JSON.stringify(path.slug)} (also used by ${seenSlugs.get(path.slug)})`);
  } else {
    seenSlugs.set(path.slug, label);
  }

  if (!path.level || !VALID_LEVELS.includes(path.level)) {
    error(`${label}: missing or invalid level (${JSON.stringify(path.level)})`);
  }
  if (!path.tags || path.tags.length === 0) {
    error(`${label}: missing tags`);
  } else if (path.tags.length < 3 || path.tags.length > 6) {
    error(`${label}: ${path.tags.length} tags (expected 3-6)`);
  }
  if (!path.goals || path.goals.length === 0) {
    error(`${label}: missing goals`);
  } else if (path.goals.length < 3 || path.goals.length > 5) {
    error(`${label}: ${path.goals.length} goals (expected 3-5)`);
  }
  if (path.prerequisites && path.prerequisites.length > 4) {
    error(`${label}: ${path.prerequisites.length} prerequisites (expected 0-4)`);
  }

  const stages = path.stages;
  if (!stages || stages.length === 0) {
    error(`${label}: empty stages`);
  } else if (stages.length < 3 || stages.length > 5) {
    error(`${label}: ${stages.length} stages (expected 3-5)`);
  } else {
    for (const [index, stage] of stages.entries()) {
      if (!stage || typeof stage !== "object") {
        error(`${label}/stage-${index + 1}: stage is not an object`);
        continue;
      }
      const where = `${label}/${stage.id || `stage-${index + 1}`}`;
      if (!stage.id?.trim()) error(`${where}: empty stage id`);
      else if (stageIds.has(stage.id)) error(`${where}: duplicate stage id`);
      else stageIds.add(stage.id);

      if (!stage.title?.trim()) error(`${where}: empty title`);
      if (!stage.blurb?.trim()) error(`${where}: empty blurb`);
      if (!Array.isArray(stage.problemIds) || stage.problemIds.length === 0) {
        error(`${where}: empty problemIds`);
        continue;
      }
      if (stage.problemIds.length < 6 || stage.problemIds.length > 15) {
        error(`${where}: ${stage.problemIds.length} problems (expected 6-15)`);
      }

      const unknown = stage.problemIds.filter((id) => !byId.has(id));
      if (unknown.length) error(`${where}: unknown problem ids ${shortList(unknown)}`);

      for (const id of stage.problemIds) {
        if (seenInPath.has(id)) {
          error(`${label}: duplicate problem ${id} across stages`);
        } else {
          seenInPath.add(id);
        }
        pathProblems.push(id);
      }
    }
  }

  const declared = path.problemIds ?? [];
  const unknownDeclared = declared.filter((id) => !byId.has(id));
  if (unknownDeclared.length) {
    error(`${label}: unknown problem ids in problemIds ${shortList(unknownDeclared)}`);
  }
  const declaredSeen = new Set<string>();
  for (const id of declared) {
    if (declaredSeen.has(id)) error(`${label}: duplicate id in problemIds (${id})`);
    declaredSeen.add(id);
  }
  if (declared.length !== pathProblems.length || declared.some((id, i) => id !== pathProblems[i])) {
    error(
      `${label}: problemIds does not match the flattened stages ` +
        `(declared ${declared.length}, stages ${pathProblems.length})`,
    );
  }

  if (pathProblems.length < 6) {
    error(`${label}: only ${pathProblems.length} problems (expected at least 6)`);
  }

  const mix = difficultyMix(pathProblems);
  const minutes = pathProblems.length > 0 ? (path.estimatedHours * 60) / pathProblems.length : 0;
  stats.push(
    [
      label.padEnd(32),
      path.slug?.padEnd(32) ?? "-",
      `${path.level ?? "-"}`.padEnd(13),
      `stages=${stages?.length ?? 0}`,
      `problems=${String(pathProblems.length).padStart(3)}`,
      `E/M/H=${mix.Easy}/${mix.Medium}/${mix.Hard}`,
      `hours=${path.estimatedHours}`,
      `min/problem=${minutes.toFixed(1)}`,
    ].join("  "),
  );
}

console.log("Learning path stats:\n");
console.log(
  ["path".padEnd(32), "slug".padEnd(32), "level".padEnd(13), "stages", "problems ", "mix", "hours", "pace"].join("  "),
);
for (const line of stats) console.log(line);

console.log(`\nPaths: ${LEARNING_PATHS.length}   Problems available: ${PROBLEMS.length}`);

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const message of errors) console.log(`  - ${message}`);
  console.log("\nFAILED");
  process.exit(1);
}

console.log("\nALL GREEN");
