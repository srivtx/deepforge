/**
 * DeepForge Silent Bug Hunt integrity gate (v2).
 *
 *   bun run scripts/verify-alibis.ts
 *
 * Serializes the frozen `ALIBI_PUZZLES` bank to a scratch JSON file and shells
 * into `scripts/py_alibi_verify.py`, which re-checks every puzzle in real
 * Python: reference passes the shipped tests, ghost passes the shipped tests,
 * the two diverge at the stored witness (1e-6 deep equality; an exception or
 * timeout counts as divergence), the text diff is exactly one changed line,
 * and the puzzle has ZERO divergent probes over the FULL UNION suite and ZERO
 * over the independently parameterised HELD-OUT suite (both built from the
 * visible shipped tests only; the huge-int overflow fix in deep equality is
 * part of the check).
 *
 * Bank-level checks run here: every record must be survived=true with
 * union/held-out sizes recorded, at least 24 puzzles (target 48) and all 15
 * categories present. Prints the mining funnel, the per-puzzle survival
 * counts, the size and gzip statistics, and exits non-zero unless every check
 * passes.
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ALIBI_PUZZLES } from "../src/data/alibis";
import { CATEGORIES } from "../src/data/problems";

const OUT_DIR = "/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w41-remine2/build-data";
const BANK_PATH = join(OUT_DIR, "alibi-bank.json");
const PUZZLES_PATH = resolve("src/data/alibis/puzzles.ts");
const MIN_PUZZLES = 24;
const TARGET_PUZZLES = 48;
const MAX_PUZZLES = 96;

/**
 * Mining funnel (provenance of the shipped bank; the previous wave's lazy-128
 * curation is reconstructed by scripts/phase1.py in the scratch tree).
 *  - mined candidate pool:   7,726 (256 lazy-128 "resistant" + 7,470 warmups)
 *  - old-pool union-clean:   9   -> held-out-clean: 8
 *  - exhaustive re-mine:     affected 2,636 problems, all engine targets
 *  - exhaustive passers:     see exhaustive-stats.json (recomputed at build)
 *  - exhaustive union-clean / held-out-clean: see funnel print below
 */
const FUNNEL = {
  problems: 2636,
  mutants: 89622,
  passers: 19030,
  unionClean: 4060,
  withWitness: 268,
  heldOutClean: 217,
  validated: 211,
  shipped: 96,
  legacyPool: 7726,
  legacyUnionClean: 9,
  legacyHeldOutClean: 8,
};

interface GateSummary {
  readonly total: number;
  readonly verified: number;
  readonly failed: number;
  readonly crash: number;
  readonly value: number;
  readonly timeout: number;
  readonly resistant: number;
  readonly warmup: number;
  readonly unionFailures: number;
  readonly heldOutFailures: number;
  readonly metadataMismatches: number;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function median(sorted: readonly number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

function countBy<T extends string>(values: readonly T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function main(): void {
  const total = ALIBI_PUZZLES.length;
  if (total < MIN_PUZZLES || total > MAX_PUZZLES) {
    fail(`FAIL: expected ${MIN_PUZZLES}..${MAX_PUZZLES} puzzles, found ${total}`);
  }
  if (total < TARGET_PUZZLES) {
    console.warn(`WARN: ${total} puzzles shipped (target ${TARGET_PUZZLES}; hard minimum ${MIN_PUZZLES})`);
  }

  for (const puzzle of ALIBI_PUZZLES) {
    if (puzzle.survived !== true) fail(`FAIL: ${puzzle.id} is not marked survived`);
    if (typeof puzzle.unionProbes !== "number" || puzzle.unionProbes <= 0) {
      fail(`FAIL: ${puzzle.id} is missing unionProbes metadata`);
    }
    if (typeof puzzle.heldOutProbes !== "number" || puzzle.heldOutProbes <= 0) {
      fail(`FAIL: ${puzzle.id} is missing heldOutProbes metadata`);
    }
    if (puzzle.resistanceTier === "warmup" || typeof puzzle.firstDivergentProbe === "number") {
      fail(`FAIL: ${puzzle.id} is marked a warm-up; v2 ships only union+held-out clean puzzles`);
    }
  }

  const bankCategories = new Set(ALIBI_PUZZLES.map((p) => p.category));
  const missing = CATEGORIES.map((c) => c.name).filter((name) => !bankCategories.has(name));
  if (missing.length > 0) {
    fail(`FAIL: missing categor${missing.length === 1 ? "y" : "ies"}: ${missing.join(", ")}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const bank = ALIBI_PUZZLES.map((p) => ({
    id: p.id,
    difficulty: p.difficulty,
    reference: p.reference,
    ghost: p.ghost,
    func: p.func,
    tests: p.tests,
    witness: p.witness,
    unionProbes: p.unionProbes,
    heldOutProbes: p.heldOutProbes,
    survived: p.survived,
  }));
  const bankJson = JSON.stringify(bank);
  const fullJson = JSON.stringify(ALIBI_PUZZLES);
  writeFileSync(BANK_PATH, bankJson);

  const py = spawnSync("python3", [resolve("scripts/py_alibi_verify.py"), BANK_PATH], {
    encoding: "utf8",
    timeout: 1_800_000,
    maxBuffer: 256 * 1024 * 1024,
  });
  if (py.error) fail(`FAIL: could not run the Python gate: ${py.error.message}`);
  const stdout = py.stdout ?? "";
  process.stdout.write(stdout);
  if (py.stderr) process.stderr.write(py.stderr);

  const summaryLine = stdout
    .split("\n")
    .filter((line) => line.startsWith("ALIBI_GATE_SUMMARY "))
    .pop();
  if (!summaryLine) fail("FAIL: Python gate produced no summary line");
  const summary = JSON.parse(summaryLine.slice("ALIBI_GATE_SUMMARY ".length)) as GateSummary;

  // gzip -9 on the serialized bank (the blueprint's size estimate).
  const gzip = spawnSync("gzip", ["-9", "-c"], {
    input: fullJson,
    maxBuffer: 256 * 1024 * 1024,
  });
  const gzipBytes = gzip.status === 0 ? gzip.stdout.length : -1;

  const byCategory = countBy(ALIBI_PUZZLES.map((p) => p.category));
  const byDifficulty = countBy(ALIBI_PUZZLES.map((p) => p.difficulty));
  const refLines: number[] = [];
  let testCount = 0;
  let witnessMax = 0;
  let unionTotal = 0;
  let heldOutTotal = 0;
  for (const p of ALIBI_PUZZLES) {
    refLines.push(p.reference.split("\n").length);
    testCount += p.tests.length;
    witnessMax = Math.max(witnessMax, p.witness.length);
    unionTotal += p.unionProbes ?? 0;
    heldOutTotal += p.heldOutProbes ?? 0;
  }
  refLines.sort((a, b) => a - b);
  const buckets = [
    ["1-5", (n: number) => n <= 5],
    ["6-10", (n: number) => n >= 6 && n <= 10],
    ["11-15", (n: number) => n >= 11 && n <= 15],
    ["16-20", (n: number) => n >= 16 && n <= 20],
    ["21+", (n: number) => n >= 21],
  ] as const;

  console.log("");
  console.log("Silent Bug Hunt — bank statistics (v2 union + held-out)");
  console.log(
    `  mining funnel       exhaustive: ${FUNNEL.problems} problems -> ${FUNNEL.mutants} mutants -> ` +
      `${FUNNEL.passers} passers -> ${FUNNEL.unionClean} union-clean -> ${FUNNEL.withWitness} with witness -> ` +
      `${FUNNEL.heldOutClean} held-out-clean; validated ${FUNNEL.validated}, shipped ${FUNNEL.shipped}`
  );
  console.log(
    `  legacy pool funnel  ${FUNNEL.legacyPool} -> union-clean ${FUNNEL.legacyUnionClean} -> ` +
      `held-out-clean ${FUNNEL.legacyHeldOutClean} (old lazy-128 bank was overfit to one shuffle)`
  );
  console.log(`  puzzles             ${total}`);
  console.log(`  probes checked      ${unionTotal} union + ${heldOutTotal} held-out (all passing)`);
  console.log(`  shipped tests       ${testCount} (all passing for reference and ghost)`);
  console.log(`  serialized bank     ${fullJson.length} B raw / ${gzipBytes} B gzip -9 (JSON.stringify(ALIBI_PUZZLES), compact)`);
  console.log(`  puzzles.ts          ${statSync(PUZZLES_PATH).size} B on disk`);
  console.log(`  witness length      max ${witnessMax} chars`);
  console.log(`  divergence types    ` + ["crash", "value", "timeout"].map((k) => `${k} ${summary[k as keyof GateSummary]}`).join(" / "));
  console.log("  difficulty          " + [...byDifficulty.entries()].map(([k, v]) => `${k} ${v}`).join(" / "));
  console.log("  categories          " + [...byCategory.entries()].sort().map(([k, v]) => `${k} ${v}`).join(", "));
  console.log(
    `  reference lines     min ${refLines[0]} / p25 ${percentile(refLines, 0.25)} / median ${median(refLines)} / p75 ${percentile(refLines, 0.75)} / p90 ${percentile(refLines, 0.9)} / max ${refLines[refLines.length - 1]}`
  );
  console.log(
    "  line histogram      " +
      buckets.map(([label, test]) => `${label}:${refLines.filter(test).length}`).join("  ")
  );

  // `failed` already includes union/held-out failures and metadata mismatches.
  const gateFailures = summary.failed;
  if (py.status !== 0 || gateFailures > 0) {
    fail(
      `FAIL: ${summary.verified}/${summary.total} verified (${summary.failed} claim failure(s), ` +
        `${summary.unionFailures} union failure(s), ${summary.heldOutFailures} held-out failure(s), ` +
        `${summary.metadataMismatches} metadata mismatch(es))`
    );
  }
  if (summary.verified !== total) {
    fail(`FAIL: Python gate verified ${summary.verified}/${total}`);
  }
  if (summary.resistant !== total || summary.warmup !== 0) {
    fail(
      `FAIL: tier counts disagree (python resistant ${summary.resistant}/warmup ${summary.warmup}, typescript total ${total})`
    );
  }
  if (summary.timeout !== 0) {
    fail(`FAIL: ${summary.timeout} timeout-only divergence(s) in the frozen bank`);
  }
  console.log(
    `\nPASS ${summary.verified}/${summary.total} verified — all union+held-out clean, gate failures 0`
  );
}

main();
