/**
 * DeepForge problem verifier.
 *
 *   bun run scripts/verify-problems.ts                     # verify ALL problems
 *   bun run scripts/verify-problems.ts src/data/problems/algorithms.ts
 *                                                          # verify one data file
 *
 * Structural checks (ids, fields, categories, test count) run in TS, then
 * every solution is executed in real Python against its test cases with the
 * same deep-equality semantics as the browser Pyodide harness.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PROBLEMS, CATEGORIES } from "../src/data/problems";
import type { Problem } from "../src/types/problem";

const ID_PREFIXES = [
  "la",
  "ca",
  "st",
  "pr",
  "ml",
  "dl",
  "nlp",
  "op",
  "al",
  "ds",
  "cv",
  "rl",
  "ts",
  "graph",
  "info",
  "proj",
];

async function loadProblems(args: string[]): Promise<Problem[]> {
  if (args.length === 0) return PROBLEMS;
  const all: Problem[] = [];
  for (const arg of args) {
    const abs = resolve(arg);
    const mod = await import(abs);
    let found = false;
    for (const value of Object.values(mod)) {
      if (
        Array.isArray(value) &&
        (value.length === 0 ||
          (value[0] && typeof value[0] === "object" && "id" in value[0] && "solution" in value[0]))
      ) {
        all.push(...(value as Problem[]));
        found = true;
      }
    }
    if (!found) console.error(`warning: no problem array exported from ${arg}`);
  }
  return all;
}

function structuralErrors(problems: Problem[], catNames: string[]): string[] {
  const errors: string[] = [];
  const seen = new Map<string, string>();

  for (const p of problems) {
    const where = p.id || p.title || "(untitled)";
    for (const field of ["id", "title", "description", "starterCode", "solution"] as const) {
      if (!p[field] || typeof p[field] !== "string" || !p[field].trim()) {
        errors.push(`${where}: missing/empty \`${field}\``);
      }
    }
    if (!catNames.includes(p.category)) {
      errors.push(`${where}: invalid category ${JSON.stringify(p.category)}`);
    }
    if (!["Easy", "Medium", "Hard"].includes(p.difficulty)) {
      errors.push(`${where}: invalid difficulty ${JSON.stringify(p.difficulty)}`);
    }
    const prefix = p.id.split("-")[0];
    if (!p.id.match(/^[a-z]+-\d{3,4}$/)) {
      errors.push(`${where}: id must look like \`prefix-001\` (got ${JSON.stringify(p.id)})`);
    } else if (!ID_PREFIXES.includes(prefix)) {
      errors.push(`${where}: unknown id prefix \`${prefix}-\``);
    }
    if (seen.has(p.id)) errors.push(`${where}: duplicate id (also in ${seen.get(p.id)})`);
    else seen.set(p.id, where);

    const cases = p.testCases ?? [];
    if (cases.length < 3) errors.push(`${where}: only ${cases.length} test case(s), need 3-5`);
    if (cases.length > 6) errors.push(`${where}: ${cases.length} test cases, keep it to 3-5`);

    if (!p.starterCode?.includes("def ")) errors.push(`${where}: starterCode has no \`def\``);
    const solMatch = p.solution?.match(/^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/m);
    const startMatch = p.starterCode?.match(/^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/m);
    if (solMatch && startMatch && solMatch[1] !== startMatch[1]) {
      errors.push(`${where}: starter function \`${startMatch[1]}\` != solution function \`${solMatch[1]}\``);
    }
    for (const [i, c] of cases.entries()) {
      if (!Array.isArray(c.input)) errors.push(`${where}: test case ${i} input must be an array`);
      if (c.expected === undefined) errors.push(`${where}: test case ${i} missing expected`);
    }
  }
  return errors;
}

interface CaseFail {
  case: number;
  input?: string;
  actual?: string;
  expected?: string;
  error?: string;
}
interface PyResult {
  id: string;
  ok: boolean;
  fatal?: string;
  fails?: CaseFail[];
}

async function main() {
  const args = process.argv.slice(2);
  const problems = await loadProblems(args);
  const catNames = CATEGORIES.map((c) => c.name);

  console.log(`Loaded ${problems.length} problem(s).`);

  const errors = structuralErrors(problems, catNames);
  if (errors.length) {
    console.log(`\n${errors.length} structural error(s):`);
    for (const e of errors.slice(0, 80)) console.log(`  - ${e}`);
    if (errors.length > 80) console.log(`  ...and ${errors.length - 80} more`);
  }

  const dir = mkdtempSync(join(tmpdir(), "df-verify-"));
  const inputPath = join(dir, "problems.json");
  writeFileSync(
    inputPath,
    JSON.stringify(
      problems.map((p) => ({
        id: p.id,
        title: p.title,
        solution: p.solution,
        testCases: p.testCases,
      }))
    )
  );

  const py = spawnSync("python3", [resolve("scripts/py_verify.py"), inputPath], {
    encoding: "utf8",
    timeout: 600_000,
    maxBuffer: 256 * 1024 * 1024,
  });

  if (py.error || py.status !== 0) {
    console.error("Python harness failed:", py.error?.message || py.stderr);
    process.exit(1);
  }

  const results = JSON.parse(py.stdout) as PyResult[];
  const runtimeFails = results.filter((r) => !r.ok);

  for (const r of runtimeFails.slice(0, 60)) {
    const title = problems.find((p) => p.id === r.id)?.title ?? "";
    console.log(`\nFAIL ${r.id} — ${title}`);
    if (r.fatal) console.log(`  fatal: ${r.fatal}`);
    for (const f of (r.fails ?? []).slice(0, 4)) {
      const bits = [`case ${f.case}`];
      if (f.input) bits.push(`input=${f.input}`);
      if (f.error) bits.push(`error=${f.error}`);
      else bits.push(`actual=${f.actual} expected=${f.expected}`);
      console.log(`  ${bits.join("  ")}`);
    }
    if ((r.fails?.length ?? 0) > 4) console.log(`  ...and ${r.fails!.length - 4} more failing cases`);
  }

  const byCategory = new Map<string, number>();
  for (const p of problems) byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);

  console.log("\nProblems per category:");
  for (const c of catNames) console.log(`  ${String(byCategory.get(c) ?? 0).padStart(5)}  ${c}`);

  console.log(
    `\nStructural errors: ${errors.length}   Runtime failures: ${runtimeFails.length}   Passed: ${
      results.length - runtimeFails.length
    }/${results.length}`
  );

  if (errors.length || runtimeFails.length) process.exit(1);
  console.log("ALL GREEN");
}

main();
