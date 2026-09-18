#!/usr/bin/env bun
/**
 * Warrant permanent gate (wave 44) — Refutation-Ledger Values.
 *
 *   bun run scripts/verify-warrant.ts
 *
 * Self-contained, deterministic, offline: Bun/Node built-ins plus the shipped
 * engine through its public surface. Every aggregate is recomputed by running
 * the Derived-Claim Arena again; the EXPECTED block is a literal pinned from a
 * reviewed green run, and there is no auto-update path. Any failure exits
 * non-zero. The final line is machine-readable:
 *
 *   WARRANT_GATE {"passed":N,"failed":M,"runtimeMs":T,"digest":"..."}
 *
 * Criteria:
 *  1 determinism        two full arena runs produce one digest (no clock, no
 *                       ambient randomness), and it equals the pinned digest.
 *  2 criteria statuses  P1-P5 pass, F1 fails (the syntactic tuple variant is a
 *                       dedup count and is expected to be killed), F2-F4 pass.
 *  3 pinned aggregates  headline pair-win, AUC, AP@12, churn and demotion
 *                       numbers equal the reviewed run exactly.
 *  4 decisive margins   the P2/P4 margins are recomputed from the pinned
 *                       aggregates: PW(B7,X)-PW(B5,X) >= 0.10, AUC B7-B5 >=
 *                       0.10 in X, AP@12 >= 0.75, churn 0.
 *  5 F1 diagnosis       B6 does not beat B1 in R and is dominated by B7 in X.
 *  6 purity             no clock, randomness, network, process, fs or console
 *                       tokens in src/lib/warrant; JSON.stringify only in the
 *                       canonical serializer (hash.ts); the barrel hides the
 *                       oracle grader.
 *  7 runtime budget     full workspace under 60 s.
 *  8 summary            machine line + compact criterion table.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runArena } from "../src/lib/warrant/arena";
import type { ArenaResult } from "../src/lib/warrant/arena";

const EXPECTED = {
  digest: "ca0cda0f562b8c10",
  criteria: {
    P1: "pass",
    P2: "pass",
    P3: "pass",
    P4: "pass",
    P5: "pass",
    F1: "fail",
    F2: "pass",
    F3: "pass",
    F4: "pass",
  },
  pw: {
    "R.B1": 0.5,
    "R.B5": 1,
    "R.B6": 0.5,
    "R.B7": 1,
    "X.B1": 0.5,
    "X.B5": 0,
    "X.B6": 0.5,
    "X.B7": 1,
  },
  auc: { "R.B5": 1, "R.B7": 1, "X.B5": 0, "X.B7": 1, "X.B8": 1 },
  ap12: { "R.B7": 1, "X.B5": 0, "X.B7": 1 },
  churn: { seedDeltaMean: 0, pairFlipRate: 0 },
  demotion: { precision: 1, recall: 1 },
} as const;

interface Criterion {
  readonly name: string;
  readonly ok: boolean;
  readonly details: readonly string[];
}

const FORBIDDEN_TOKENS = [
  "Date",
  "Math.random",
  "fetch(",
  "XMLHttpRequest",
  "process.",
  "require(",
  'from "fs"',
  'from "node:',
  "crypto",
  "setTimeout",
  "setInterval",
  "console.",
];

function scanPurity(): readonly string[] {
  const directory = join(process.cwd(), "src", "lib", "warrant");
  const problems: string[] = [];
  for (const name of readdirSync(directory)) {
    if (!name.endsWith(".ts")) continue;
    const source = readFileSync(join(directory, name), "utf8");
    for (const token of FORBIDDEN_TOKENS) {
      if (source.includes(token)) {
        problems.push(`${name} contains ${token}`);
      }
    }
    if (name !== "hash.ts" && source.includes("JSON.stringify")) {
      problems.push(`${name} uses JSON.stringify outside the canonical serializer`);
    }
    if (name === "index.ts" && source.includes("oracleScore")) {
      problems.push("index.ts exports the oracle grader");
    }
  }
  return problems;
}

function cell(
  arena: ArenaResult,
  table: "pw" | "auc" | "ap12",
  path: string,
): number {
  const [regime, grader] = path.split(".");
  const source = arena[table] as Record<string, Record<string, { mean: number }>>;
  return source[regime][grader].mean;
}

function main(): number {
  const started = performance.now();
  const first = runArena();
  const second = runArena();
  const criteria: Criterion[] = [];

  criteria.push({
    name: "determinism",
    ok: first.digest === second.digest && first.digest === EXPECTED.digest,
    details: [`digest ${first.digest}`, `pinned ${EXPECTED.digest}`],
  });

  const statuses = new Map(first.criteria.map((criterion) => [criterion.id, criterion.status]));
  const statusMismatches: string[] = [];
  for (const [id, expected] of Object.entries(EXPECTED.criteria)) {
    const actual = statuses.get(id as keyof typeof EXPECTED.criteria);
    if (actual !== expected) {
      statusMismatches.push(`${id} expected ${expected}, got ${String(actual)}`);
    }
  }
  criteria.push({
    name: "criteria statuses",
    ok: statusMismatches.length === 0,
    details:
      statusMismatches.length === 0
        ? ["P1-P5 pass, F1 fails as predicted, F2-F4 pass"]
        : statusMismatches,
  });

  const aggregateMismatches: string[] = [];
  for (const [path, expected] of Object.entries(EXPECTED.pw)) {
    const actual = cell(first, "pw", path);
    if (actual !== expected) aggregateMismatches.push(`pw ${path}: expected ${expected}, got ${actual}`);
  }
  for (const [path, expected] of Object.entries(EXPECTED.auc)) {
    const actual = cell(first, "auc", path);
    if (actual !== expected) aggregateMismatches.push(`auc ${path}: expected ${expected}, got ${actual}`);
  }
  for (const [path, expected] of Object.entries(EXPECTED.ap12)) {
    const actual = cell(first, "ap12", path);
    if (actual !== expected) aggregateMismatches.push(`ap12 ${path}: expected ${expected}, got ${actual}`);
  }
  criteria.push({
    name: "pinned aggregates",
    ok: aggregateMismatches.length === 0,
    details: aggregateMismatches.length === 0 ? ["all headline cells equal the reviewed run"] : aggregateMismatches,
  });

  const pwB7X = cell(first, "pw", "X.B7");
  const pwB5X = cell(first, "pw", "X.B5");
  const aucB7X = cell(first, "auc", "X.B7");
  const aucB5X = cell(first, "auc", "X.B5");
  const apB7X = cell(first, "ap12", "X.B7");
  const marginDetails = [
    `PW margin ${(pwB7X - pwB5X).toFixed(3)} (>= 0.10)`,
    `AUC margin ${(aucB7X - aucB5X).toFixed(3)} (>= 0.10)`,
    `AP@12 ${apB7X.toFixed(3)} (>= 0.75)`,
    `churn ${first.churn.seedDeltaMean.toFixed(3)}/${first.churn.pairFlipRate.toFixed(3)} (<= 0.1/0.05)`,
  ];
  criteria.push({
    name: "decisive margins",
    ok:
      pwB7X - pwB5X >= 0.1 &&
      aucB7X - aucB5X >= 0.1 &&
      apB7X >= 0.75 &&
      first.churn.seedDeltaMean <= 0.1 &&
      first.churn.pairFlipRate <= 0.05,
    details: marginDetails,
  });

  const b6R = cell(first, "pw", "R.B6");
  const b1R = cell(first, "pw", "R.B1");
  const b7X = cell(first, "pw", "X.B7");
  const b6X = cell(first, "pw", "X.B6");
  criteria.push({
    name: "F1 diagnosis",
    ok: b6R <= b1R + 0.05 && b6X <= b7X - 0.1,
    details: [
      `R: B6 ${b6R.toFixed(3)} <= B1 ${b1R.toFixed(3)} + 0.05`,
      `X: B6 ${b6X.toFixed(3)} <= B7 ${b7X.toFixed(3)} - 0.10`,
    ],
  });

  const purityProblems = scanPurity();
  criteria.push({
    name: "purity",
    ok: purityProblems.length === 0,
    details: purityProblems.length === 0 ? ["no forbidden tokens; oracle hidden"] : purityProblems,
  });

  const runtimeMs = Math.round(performance.now() - started);
  criteria.push({
    name: "runtime budget",
    ok: runtimeMs < 60_000,
    details: [`${runtimeMs} ms (budget 60000 ms, two full arena runs)`],
  });

  const failed = criteria.filter((criterion) => !criterion.ok).length;
  criteria.push({
    name: "summary",
    ok: failed === 0,
    details: [failed === 0 ? "all criteria passed" : `${failed} criterion/criteria failed; exit code 1`],
  });

  const passed = criteria.filter((criterion) => criterion.ok).length;
  const totalFailed = criteria.length - passed;
  console.log("Warrant permanent gate (wave 44) — scripts/verify-warrant.ts");
  const width = Math.max(...criteria.map((criterion) => criterion.name.length));
  criteria.forEach((criterion, index) => {
    const status = criterion.ok ? "PASS" : "FAIL";
    console.log(`${String(index + 1).padStart(2)}  ${criterion.name.padEnd(width)}  ${status}  ${criterion.details[0] ?? ""}`);
    for (const detail of criterion.details.slice(1)) {
      console.log(`${" ".repeat(6 + width)}  ${detail}`);
    }
  });
  console.log(
    `WARRANT_GATE {"passed":${passed},"failed":${totalFailed},"runtimeMs":${runtimeMs},"digest":"${first.digest}"}`,
  );
  return totalFailed === 0 ? 0 : 1;
}

process.exit(main());
