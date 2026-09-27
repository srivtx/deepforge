#!/usr/bin/env bun
/**
 * DeepForge research reproduction entry point (one command, every gate).
 *
 *   bun run verify:all
 *   bun run scripts/reproduce.ts            # same thing
 *   bun run scripts/reproduce.ts --list     # step names and commands, run nothing
 *   bun run scripts/reproduce.ts --skip bdl # skip one step (comma-separated)
 *
 * Runs the research gates in the same order as .github/workflows/ci.yml, tees
 * every gate's real stdout/stderr to the terminal unchanged, and prints a
 * pass/fail/summary table plus the wall-clock total. Nothing is asserted here:
 * this script is an orchestrator, it never re-implements a check, never edits a
 * pinned value, and exits non-zero if any step fails. The pass/fail meaning of
 * each step lives in the step's own header comment and in
 * docs/research/reproducibility.md.
 *
 * Step order is the fail-fast order: pure-TypeScript structure gates first
 * (milliseconds), then the unit tests, then the Python-backed corpus gates
 * (minutes). No network, no service, no GPU, no writes outside the gates' own
 * os.tmpdir() scratch directories.
 *
 * Two of these steps are about the *external-replication path* rather than
 * about a measurement: `external-format` self-tests the df-corpus/1 format, its
 * validator, and the provenance separation that keeps somebody else's corpus
 * from being mistaken for DeepForge's own, and `tests` includes
 * tests/external-corpus.test.ts. Neither runs an external corpus, and neither
 * can establish external validity: no external corpus has been run. The
 * measurement path itself is `npm run verify:external -- --corpus <path>`, which
 * is deliberately NOT a step here, because running it is a replication and a
 * replication is somebody else's decision to publish.
 *
 * Env overrides honoured by the gates themselves and passed through:
 *   DF_BDL_CENSUS      optional census artifact for scripts/py_bdl_verify.py
 *   DF_BDL_SCRATCH     optional BDL scratch directory
 *   DF_BDL_VERBOSE=1   forward the full Python table + BDL_GATE_SUMMARY line
 *   DF_WARRANT_SCRATCH / DF_KEYFUSE_SCRATCH   evidence-script roots (unused here)
 */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cpus, tmpdir } from "node:os";

interface Step {
  readonly name: string;
  readonly label: string;
  readonly argv: readonly string[];
  /**
   * Verdict patterns in PRIORITY order. The first pattern that matches
   * anywhere in the step's output wins, so a machine-readable summary line is
   * preferred over a human "PASS ..." line. Matched against stdout and stderr.
   */
  readonly verdict: readonly RegExp[];
  /** What PASS means, printed under the table so the summary is self-explaining. */
  readonly means: string;
}

const BUN = process.execPath;
/** Bun reports its own version under process.versions; no `Bun` global type in this project. */
const BUN_VERSION = process.versions.bun ?? "unknown";

const STEPS: readonly Step[] = [
  {
    name: "paths",
    label: "learning paths (structure)",
    argv: [BUN, "run", "scripts/verify-paths.ts"],
    verdict: [/^ALL GREEN$/],
    means: "33 paths: unique URL-safe slugs, no duplicate/unknown problem ids, capstones resolve",
  },
  {
    name: "paths-content",
    label: "learning paths (content)",
    argv: [BUN, "run", "scripts/verify-paths-content.ts"],
    verdict: [/^ALL GREEN$/],
    means: "stage blurbs/ordering/levels, prerequisite graph acyclic",
  },
  {
    name: "problems",
    label: "problem bank (Python 3 harness)",
    argv: [BUN, "run", "scripts/verify-problems.ts"],
    verdict: [/^ALL GREEN$/, /^Structural errors: 0/],
    means: "5,730 solutions execute in real CPython against their own tests (1e-6 deep equality)",
  },
  {
    name: "tests",
    label: "unit tests",
    argv: [BUN, "test"],
    verdict: [/^\s*\d+ pass$/, /^\s*0 fail$/],
    means: "engine unit tests for alibiHunt, bdl, keyfuse/*, warrant/*, reprogpu/*",
  },  {
    name: "alibis",
    label: "Alibi Distance (silent bug hunt)",
    argv: [BUN, "run", "scripts/verify-alibis.ts"],
    verdict: [/^ALIBI_GATE_SUMMARY /, /^PASS \d+\/\d+ verified/],
    means: "96 shipped puzzles re-checked in CPython: reference+ghost pass shipped tests, diverge at the witness, and agree on every union and held-out probe",
  },
  {
    name: "bdl",
    label: "Behavioral Delta Ledger",
    argv: [BUN, "run", "scripts/verify-bdl.ts"],
    verdict: [/^BDL_GATE_SUMMARY /, /^PASS — \d+\/\d+ checks/],
    means: "12 independent checks: committed spot digests, two byte-identical engine runs, 240-problem stratified sample inside stated tolerances, 12 shipped-harness fixtures",
  },
  {
    name: "keyfuse",
    label: "KeyFuse (cache-key auditor)",
    argv: [BUN, "run", "scripts/verify-keyfuse.ts"],
    verdict: [/^KEYFUSE_GATE /, /^\s*\d+ passed, \d+ failed/],
    means: "12 criteria: purity + two byte-identical 360-audit sweeps, exact arm == independently swept ground truth, pinned aggregates",
  },
  {
    name: "warrant",
    label: "Warrant Lab (refutation-ledger values)",
    argv: [BUN, "run", "scripts/verify-warrant.ts"],
    verdict: [/^WARRANT_GATE /],
    means: "8 criteria: arena digest == pinned digest, P1-P5 pass / F1 fails, pinned aggregates, decisive margins, source purity",
  },
  {
    name: "external-format",
    label: "external corpus format (validator + provenance self-test)",
    argv: [BUN, "run", "scripts/verify-external-format.ts"],
    verdict: [/^EXTERNAL_FORMAT_GATE /, /checks passed/],
    means: "df-corpus/1 format: the shipped synthetic example is rejected exactly as documented, its candidate alibi verifies under the shipped verifier, a report digest is invariant under every run-metadata field, and the DeepForge corpus is refused as an input",
  },
  {
    name: "reprogpu",
    label: "REPROGPU (conformance pins)",
    argv: [BUN, "run", "scripts/verify-reprogpu.ts"],
    verdict: [/^REPROGPU_GATE /],
    means: "5 criteria: K1-K4 reference hashes, Philox/SHA-256 KATs, WGSL source pins, integer-kernel purity. Cannot check WGSL compilation or GPU execution.",
  },
];

interface StepResult {
  readonly step: Step;
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly seconds: number;
  readonly verdict: string;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): { readonly list: boolean; readonly skip: ReadonlySet<string> } {
  const skip = new Set<string>();
  let list = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--list") {
      list = true;
    } else if (arg === "--skip") {
      const value = argv[index + 1];
      if (!value) fail("FAIL: --skip needs a comma-separated step name list");
      for (const name of value.split(",").map((entry) => entry.trim()).filter(Boolean)) skip.add(name);
      index += 1;
    } else {
      fail(`FAIL: unknown argument "${arg}" (supported: --list, --skip <names>)`);
    }
  }
  for (const name of skip) {
    if (!STEPS.some((step) => step.name === name)) {
      fail(`FAIL: unknown step "${name}" (known: ${STEPS.map((s) => s.name).join(", ")})`);
    }
  }
  return { list, skip };
}

function runStep(step: Step): Promise<StepResult> {
  return new Promise((resolveStep) => {
    const started = performance.now();
    const child = spawn(step.argv[0]!, step.argv.slice(1), { stdio: ["ignore", "pipe", "pipe"] });
    const out: string[] = [];
    const err: string[] = [];
    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      out.push(text);
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      err.push(text);
      process.stderr.write(text);
    });
    child.on("error", (error) => {
      process.stderr.write(`could not run ${step.argv.join(" ")}: ${error.message}\n`);
      resolveStep({ step, code: null, signal: null, seconds: 0, verdict: "spawn error" });
    });
    child.on("close", (code, signal) => {
      const lines = [...out.join("").split(/\r?\n/), ...err.join("").split(/\r?\n/)];
      const matched = step.verdict
        .map((pattern) => lines.find((line) => pattern.test(line)))
        .find((line): line is string => line !== undefined);
      const verdict = matched?.trim() ?? (code === 0 ? "(no verdict line)" : "(no verdict line — see output above)");
      resolveStep({
        step,
        code,
        signal,
        seconds: (performance.now() - started) / 1000,
        verdict,
      });
    });
  });
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** `python3 -V` on stdout; the three Python-backed gates need it on PATH. */
function pythonVersion(): Promise<string> {
  return probeVersion(["python3", "-V"], "(not found on PATH — the problems/alibis/bdl gates need python3)");
}

/** `node -v`; the gates run under Bun, so report the host Node separately. */
function nodeVersion(): Promise<string> {
  return probeVersion(["node", "-v"], `(not on PATH; Bun ${BUN_VERSION} runs the gates)`);
}

function probeVersion(argv: readonly string[], missing: string): Promise<string> {
  return new Promise((done) => {
    const probe = spawn(argv[0]!, argv.slice(1), { stdio: ["ignore", "pipe", "ignore"] });
    let text = "";
    probe.stdout.on("data", (chunk: Buffer) => {
      text += chunk.toString("utf8");
    });
    probe.on("error", () => done(missing));
    probe.on("close", () => done(text.trim() || "(no version reported)"));
  });
}

/**
 * Fingerprint the two data artifacts the gates serialise, byte-for-byte the way
 * they do, so a reproducer can tell "my checkout differs" from "my machine
 * differs" before reading a single gate number.
 */
async function provenance(): Promise<readonly string[]> {
  const [{ PROBLEMS, CATEGORIES }, { ALIBI_PUZZLES }] = await Promise.all([
    import("../src/data/problems"),
    import("../src/data/alibis"),
  ]);
  const corpus = JSON.stringify(
    PROBLEMS.map((problem) => ({
      id: problem.id,
      category: problem.category,
      difficulty: problem.difficulty,
      solution: problem.solution,
      testCases: problem.testCases,
    })),
  );
  const bank = JSON.stringify(
    ALIBI_PUZZLES.map((puzzle) => ({
      id: puzzle.id,
      difficulty: puzzle.difficulty,
      reference: puzzle.reference,
      ghost: puzzle.ghost,
      func: puzzle.func,
      tests: puzzle.tests,
      witness: puzzle.witness,
      unionProbes: puzzle.unionProbes,
      heldOutProbes: puzzle.heldOutProbes,
      survived: puzzle.survived,
    })),
  );
  return [
    `problems         ${PROBLEMS.length} in ${CATEGORIES.length} categories, ${PROBLEMS.reduce((total, p) => total + (p.testCases?.length ?? 0), 0)} test cases`,
    `corpus.json      ${corpus.length} B  sha256 ${sha256(corpus)}`,
    `alibi bank       ${ALIBI_PUZZLES.length} puzzles, ${ALIBI_PUZZLES.reduce((t, p) => t + (p.unionProbes ?? 0), 0)} union + ${ALIBI_PUZZLES.reduce((t, p) => t + (p.heldOutProbes ?? 0), 0)} held-out probes`,
    `alibi-bank.json  ${bank.length} B  sha256 ${sha256(bank)}`,
  ];
}

async function main(): Promise<number> {
  const { list, skip } = parseArgs(process.argv.slice(2));
  if (list) {
    for (const step of STEPS) {
      console.log(`${step.name.padEnd(14)}  ${step.argv.slice(1).join(" ")}`);
    }
    return 0;
  }
  const steps = STEPS.filter((step) => !skip.has(step.name));

  console.log("DeepForge research reproduction — one command, every research gate");
  console.log("");
  console.log(`bun     ${BUN_VERSION}   (CI pins bun-version 1.3.9)`);
  console.log(`node    ${await nodeVersion()}`);
  console.log(`python3 ${await pythonVersion()}   (BDL spot digests were produced on CPython 3.13)`);
  console.log(`cpus    ${cpus().length} (BDL uses min(8, cpus))`);
  console.log(`tmpdir  ${tmpdir()}`);
  console.log("");
  for (const line of await provenance()) console.log(`  ${line}`);
  console.log("");

  const results: StepResult[] = [];
  for (const step of steps) {
    console.log(`\u2500\u2500 ${step.name} — ${step.label}`);
    results.push(await runStep(step));
    console.log("");
  }

  const failed = results.filter((result) => result.code !== 0);
  const nameWidth = Math.max(...results.map((result) => result.step.name.length));
  const secondsWidth = Math.max(...results.map((result) => result.seconds.toFixed(1).length));
  console.log("\u2500\u2500 summary");
  console.log("");
  console.log(
    `${"step".padEnd(nameWidth)}  ${"result".padEnd(6)}  ${"time".padStart(secondsWidth + 3)}  verdict`,
  );
  for (const result of results) {
    const status = result.code === 0 ? "PASS" : "FAIL";
    console.log(
      `${result.step.name.padEnd(nameWidth)}  ${status.padEnd(6)}  ${`${result.seconds.toFixed(1)}s`.padStart(secondsWidth + 3)}  ${result.verdict}`,
    );
  }
  console.log("");
  for (const result of results) {
    const status = result.code === 0 ? "PASS" : "FAIL";
    const how = result.code === 0 ? "" : ` (exit ${String(result.code)}${result.signal ? `, ${result.signal}` : ""})`;
    console.log(`${status}  ${result.step.label}${how}`);
    console.log(`      means: ${result.step.means}`);
  }
  const total = results.reduce((sum, result) => sum + result.seconds, 0);
  console.log("");
  console.log(
    `${results.length - failed.length}/${results.length} steps passed in ${total.toFixed(1)}s wall clock` +
      (skip.size > 0 ? ` (${skip.size} skipped: ${[...skip].join(", ")})` : ""),
  );
  if (failed.length > 0) {
    console.error(
      `\nREPRODUCE_FAIL {"steps":${results.length},"failed":${failed.length},"names":"${failed.map((r) => r.step.name).join(",")}","seconds":${total.toFixed(1)}}`,
    );
    return 1;
  }
  console.log(
    `\nREPRODUCE_OK {"steps":${results.length},"failed":0,"seconds":${total.toFixed(1)}}`,
  );
  return 0;
}

process.exit(await main());
