#!/usr/bin/env bun
/**
 * Wave-44 evidence harness — Refutation-Ledger Values / Warrant Lab.
 *
 *   bun run scripts/warrant-evidence.ts
 *
 * Deterministic, offline: runs the Derived-Claim Arena over the 200 frozen
 * LCG seeds, emits a byte-stable JSON artifact (canonical serialization, no
 * timestamps, no absolute paths) plus a digest, and prints the tables the
 * paper quotes. Output root is DF_WARRANT_SCRATCH or os.tmpdir(); each run
 * gets a fresh mkdtemp directory. Nothing here is used as a gate input: the
 * permanent gate re-runs the arena and compares pinned aggregates.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runArena } from "../src/lib/warrant/arena";
import type { Regime } from "../src/lib/warrant/arena";
import { canonicalJson, warrantHash } from "../src/lib/warrant/hash";
import type { GraderId } from "../src/lib/warrant/graders";

const REGIMES: readonly Regime[] = ["R", "D", "C", "P", "X"];
const HEADLINE_GRADERS: readonly GraderId[] = ["B1", "B5", "B6", "B7", "B8"];

function format(value: number): string {
  return value.toFixed(3);
}

function main(): void {
  const started = performance.now();
  const root = process.env.DF_WARRANT_SCRATCH ?? join(tmpdir(), "deepforge-warrant-evidence");
  mkdirSync(root, { recursive: true });
  const scratch = mkdtempSync(join(root, "run-"));
  const arena = runArena();
  const digest = warrantHash(canonicalJson(arena));
  const jsonPath = join(scratch, "warrant-evidence.json");
  writeFileSync(jsonPath, canonicalJson({ digest, arena }));

  console.log("Wave-44 evidence — Refutation-Ledger Values (Derived-Claim Arena)");
  console.log(`seeds: ${arena.config.seeds}; digest: ${digest}`);
  console.log("criteria:");
  for (const criterion of arena.criteria) {
    console.log(`  ${criterion.id}  ${criterion.status.toUpperCase()}  measured=${String(criterion.measured)}  (${criterion.threshold})`);
  }
  console.log("pair-win rate, mean / p5 (ties 0.5):");
  for (const regime of REGIMES) {
    const row = HEADLINE_GRADERS.map((grader) => {
      const stats = arena.pw[regime][grader];
      return `${grader} ${format(stats.mean)}/${format(stats.p5)}`;
    });
    console.log(`  ${regime}: ${row.join("  ")}`);
  }
  console.log("AUC, mean / p5 (label 1 = non-defective):");
  for (const regime of REGIMES) {
    const row = HEADLINE_GRADERS.map((grader) => {
      const stats = arena.auc[regime][grader];
      return `${grader} ${format(stats.mean)}/${format(stats.p5)}`;
    });
    console.log(`  ${regime}: ${row.join("  ")}`);
  }
  console.log("AP@12, mean / p5:");
  for (const regime of REGIMES) {
    const row = HEADLINE_GRADERS.map((grader) => {
      const stats = arena.ap12[regime][grader];
      return `${grader} ${format(stats.mean)}/${format(stats.p5)}`;
    });
    console.log(`  ${regime}: ${row.join("  ")}`);
  }
  console.log(`churn: seedDeltaMean ${format(arena.churn.seedDeltaMean)}, pairFlipRate ${format(arena.churn.pairFlipRate)}`);
  console.log(`demotion sanity: precision ${format(arena.demotion.precision)}, recall ${format(arena.demotion.recall)}`);
  const seconds = (performance.now() - started) / 1000;
  console.log(`runtime: ${seconds.toFixed(2)}s`);
  console.log(`JSON: ${jsonPath}`);
}

main();
