/**
 * DeepForge Behavioral Delta Ledger (wave 42) — corpus + harness gate.
 *
 *   bun run scripts/verify-bdl.ts [--census <census_clean.jsonl>]
 *
 * Self-contained and CI-portable: dumps the real shipped problem bank to
 * scratch JSON, generates a fixed set of end-to-end Python harness fixtures
 * with the shipped `buildBdlHarness`, shells into `scripts/py_bdl_verify.py`,
 * and validates the captured fixture stdout with the shipped
 * `parseBdlStdout`. The Python gate independently re-implements the frozen BDL
 * probe-basis and signature semantics, re-runs the analyzer on a deterministic
 * stratified sample of >= 200 problems, checks the committed spot records
 * (`al-345`, `ds-074`) against embedded sha256 digests and pinned fields,
 * checks determinism with two byte-identical runs, and exercises the emitted
 * harnesses on agree / wrong-value / raise / reference-timeout / sleep-budget /
 * line-budget / wall-budget / duplicate-marker fixtures. It exits non-zero on
 * any failure.
 *
 * The machine-local census is optional. With `--census` (or DF_BDL_CENSUS) the
 * gate additionally re-checks the census artifact itself and re-verifies every
 * sampled problem against its census record; without it the gate is fully
 * self-contained on committed constants and spot digests and passes from a
 * clean checkout.
 *
 * Tolerances are sample-size-aware and stated per row (3 sigma, cluster-
 * robust for mutant-level rates, combined with the published corpus 95% CI);
 * exact rows are census-artifact invariants, committed spot records, and
 * canonical-run checks. The gate never hard-codes PASS.
 *
 * Env overrides: DF_BDL_CENSUS (optional census path), DF_BDL_SCRATCH
 * (scratch directory), DF_BDL_VERBOSE=1 (forward the Python table too).
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PROBLEMS } from "../src/data/problems";
import {
  BDL_MARK,
  buildBdlHarness,
  parseBdlStdout,
  type BdlBasisProbe,
  type BdlTestCase,
} from "../src/lib/bdl";

const DEFAULT_SCRATCH = join(tmpdir(), "deepforge-bdl-gate");
const SAMPLE_SIZE = 240;
const SAMPLE_SEED = "deepforge-bdl-gate-v1";
const PY_TIMEOUT_MS = 10 * 60 * 1000;

interface GateMetric {
  readonly name: string;
  readonly expected: string;
  readonly observed: string;
  readonly tolerance: string;
  readonly pass: boolean;
  readonly detail?: string;
}

interface GateSummary {
  readonly ok: boolean;
  readonly checks: number;
  readonly failures: readonly string[];
  readonly metrics: readonly GateMetric[];
  readonly sample: {
    readonly size: number;
    readonly seed: string;
    readonly analyzable: number;
    readonly workers: number;
    readonly records_match_census: number | null;
    readonly mismatches: readonly string[];
  };
  readonly determinism: {
    readonly byte_identical: boolean;
    readonly reference_flakes: number;
    readonly cosmetic_churn_nonzero: number;
    readonly rename_churn_nonzero: number;
    readonly digest: string;
    readonly run_seconds: readonly number[];
  };
  readonly census: {
    readonly path: string | null;
    readonly sha256: string | null;
    readonly records: number;
  };
  readonly spot?: {
    readonly clean: boolean;
    readonly digest: Readonly<Record<string, string>>;
  };
  readonly corpus: {
    readonly path: string;
    readonly sha256: string;
    readonly problems: number;
  };
  readonly runtime_seconds: number;
}

/* ─────────────────────── shipped harness fixtures ──────────────────────── */

interface HarnessFixtureExpect {
  readonly markers: number;
  readonly sigs?: readonly string[];
  readonly masks?: readonly string[];
  readonly maxSeconds?: number;
  readonly allValid?: boolean;
  readonly parsedNull?: boolean;
  readonly parsedSig?: string;
  readonly parsedMask?: string;
}

interface HarnessFixture {
  readonly name: string;
  readonly runner: "once" | "twice";
  readonly expect: HarnessFixtureExpect;
  readonly python: string;
}

interface HarnessFixtureResult {
  readonly name: string;
  readonly stdout: string;
  readonly stderr: string;
  readonly elapsed: number;
  readonly status: number | string;
  readonly markers: readonly {
    readonly valid: boolean;
    readonly sig: string | null;
    readonly mask: string | null;
  }[];
}

const DEFAULT_REFERENCE = "def total(xs):\n    return sum(xs)\n";
const DEFAULT_TESTS: readonly BdlTestCase[] = [
  { input: [[1, 2, 3]], expected: 6 },
  { input: [[4]], expected: 4 },
];
const DEFAULT_PROBES: readonly BdlBasisProbe[] = [
  { args: [[1, 2, 3]] },
  { args: [[4]] },
];

const FORGED_MARKER = BDL_MARK + JSON.stringify({ v: 1, sig: "00", mask: "11" });

function makeFixture(entry: {
  readonly name: string;
  readonly submission: string;
  readonly expect: HarnessFixtureExpect;
  readonly reference?: string;
  readonly tests?: readonly BdlTestCase[];
  readonly probes?: readonly BdlBasisProbe[];
  readonly lineBudget?: number;
  readonly wallBudgetMs?: number;
  readonly runner?: "once" | "twice";
}): HarnessFixture {
  return {
    name: entry.name,
    runner: entry.runner ?? "once",
    expect: entry.expect,
    python: buildBdlHarness({
      reference: entry.reference ?? DEFAULT_REFERENCE,
      submission: entry.submission,
      func: "total",
      tests: entry.tests ?? DEFAULT_TESTS,
      probes: entry.probes ?? DEFAULT_PROBES,
      lineBudget: entry.lineBudget,
      wallBudgetMs: entry.wallBudgetMs,
    }),
  };
}

function buildHarnessFixtures(): HarnessFixture[] {
  const agree = "def total(xs):\n    return sum(xs)\n";
  const wrong = "def total(xs):\n    return sum(xs) + 1\n";
  const raises = 'def total(xs):\n    raise ValueError("boom")\n';
  const sleepsWithin =
    "import time\n\n\ndef total(xs):\n    time.sleep(0.05)\n    return sum(xs)\n";
  const sleepsOver =
    "import time\n\n\ndef total(xs):\n    time.sleep(3)\n    return sum(xs)\n";
  const sleepsChunk =
    "import time\n\n\ndef total(xs):\n    time.sleep(0.4)\n    return sum(xs)\n";
  const busyLoop = "def total(xs):\n    while True:\n        pass\n";
  const manyLines =
    "def total(xs):\n    for index in range(100000):\n        index += 1\n    return sum(xs)\n";
  const referenceSleeper =
    "import time\n\n\ndef total(xs):\n    time.sleep(3)\n    return sum(xs)\n";
  const earlyForge = [
    "import sys",
    "",
    "_forged = False",
    "",
    "",
    "def total(xs):",
    "    global _forged",
    "    if not _forged:",
    "        _forged = True",
    `        sys.__stdout__.write(${JSON.stringify(FORGED_MARKER)} + "\\n")`,
    "        sys.__stdout__.flush()",
    "    return sum(xs)",
    "",
  ].join("\n");
  const atexitForge = [
    "import atexit",
    "",
    "",
    "def _forge():",
    `    print(${JSON.stringify(FORGED_MARKER)})`,
    "",
    "",
    "atexit.register(_forge)",
    "",
    "",
    "def total(xs):",
    "    return sum(xs)",
    "",
  ].join("\n");
  const threadForge = [
    "import threading",
    "import time",
    "",
    "",
    "def _forge():",
    "    time.sleep(0.25)",
    `    print(${JSON.stringify(FORGED_MARKER)})`,
    "",
    "",
    "threading.Thread(target=_forge).start()",
    "",
    "",
    "def total(xs):",
    "    return sum(xs)",
    "",
  ].join("\n");

  return [
    makeFixture({
      name: "agree",
      submission: agree,
      expect: {
        markers: 1,
        sigs: ["00"],
        masks: ["11"],
        allValid: true,
        parsedSig: "00",
        parsedMask: "11",
        maxSeconds: 10,
      },
    }),
    makeFixture({
      name: "wrong_value",
      submission: wrong,
      expect: {
        markers: 1,
        sigs: ["11"],
        masks: ["00"],
        allValid: true,
        parsedSig: "11",
        parsedMask: "00",
        maxSeconds: 10,
      },
    }),
    makeFixture({
      name: "raise",
      submission: raises,
      expect: {
        markers: 1,
        sigs: ["22"],
        masks: ["00"],
        allValid: true,
        parsedSig: "22",
        parsedMask: "00",
        maxSeconds: 10,
      },
    }),
    makeFixture({
      name: "reference_timeout",
      reference: referenceSleeper,
      submission: agree,
      wallBudgetMs: 500,
      expect: {
        markers: 1,
        sigs: ["xx"],
        masks: ["11"],
        allValid: true,
        parsedSig: "xx",
        parsedMask: "11",
        maxSeconds: 5,
      },
    }),
    makeFixture({
      name: "sleep_within_budget",
      submission: sleepsWithin,
      wallBudgetMs: 2000,
      expect: {
        markers: 1,
        sigs: ["00"],
        masks: ["11"],
        allValid: true,
        parsedSig: "00",
        parsedMask: "11",
        maxSeconds: 10,
      },
    }),
    makeFixture({
      name: "sleep_over_budget",
      submission: sleepsOver,
      wallBudgetMs: 500,
      // Once the deadline passes the reference has no answer either, so the
      // probe states are x (reference-less), not 2; the evidence is the
      // bounded elapsed time and the failing mask.
      expect: {
        markers: 1,
        sigs: ["xx"],
        masks: ["00"],
        allValid: true,
        parsedSig: "xx",
        parsedMask: "00",
        maxSeconds: 3,
      },
    }),
    makeFixture({
      name: "busy_loop_wall_timeout",
      submission: busyLoop,
      wallBudgetMs: 500,
      lineBudget: 10_000_000,
      expect: {
        markers: 1,
        sigs: ["xx"],
        masks: ["00"],
        allValid: true,
        parsedSig: "xx",
        parsedMask: "00",
        maxSeconds: 3,
      },
    }),
    makeFixture({
      name: "line_budget",
      submission: manyLines,
      lineBudget: 500,
      wallBudgetMs: 60_000,
      expect: {
        markers: 1,
        sigs: ["22"],
        masks: ["00"],
        allValid: true,
        parsedSig: "22",
        parsedMask: "00",
        maxSeconds: 5,
      },
    }),
    makeFixture({
      name: "marker_early_forge",
      submission: earlyForge,
      expect: { markers: 2, allValid: true, parsedNull: true, maxSeconds: 10 },
    }),
    makeFixture({
      name: "marker_atexit_forge",
      submission: atexitForge,
      expect: { markers: 2, allValid: true, parsedNull: true, maxSeconds: 10 },
    }),
    makeFixture({
      name: "marker_thread_forge",
      submission: threadForge,
      expect: { markers: 2, allValid: true, parsedNull: true, maxSeconds: 10 },
    }),
    makeFixture({
      name: "per_program_fresh_budget",
      submission: sleepsChunk,
      tests: [{ input: [[1, 2, 3]], expected: 6 }],
      probes: [{ args: [[4]] }],
      wallBudgetMs: 1500,
      runner: "twice",
      expect: {
        markers: 2,
        sigs: ["0", "0"],
        masks: ["1", "1"],
        allValid: true,
        parsedNull: true,
        maxSeconds: 6,
      },
    }),
  ];
}

function validateHarnessFixtures(
  fixtures: readonly HarnessFixture[],
  results: readonly HarnessFixtureResult[],
): { readonly failures: readonly string[]; readonly rows: readonly string[] } {
  const failures: string[] = [];
  const rows: string[] = [];
  const byName = new Map(results.map((result) => [result.name, result]));
  for (const fixture of fixtures) {
    const result = byName.get(fixture.name);
    if (!result) {
      failures.push(`${fixture.name}: no result from the Python runner`);
      continue;
    }
    const parsed = parseBdlStdout(result.stdout);
    let verdict = "ok";
    if (fixture.expect.parsedNull) {
      if (parsed !== null) {
        verdict = "FAIL: shipped parser accepted duplicate/forged stdout";
        failures.push(`${fixture.name}: ${verdict}`);
      }
    } else if (
      parsed === null ||
      parsed.sig !== fixture.expect.parsedSig ||
      parsed.mask !== fixture.expect.parsedMask
    ) {
      const observed = parsed ? `sig ${parsed.sig} mask ${parsed.mask}` : "null";
      verdict = `FAIL: shipped parser read ${observed}`;
      failures.push(
        `${fixture.name}: ${verdict}, expected sig ${fixture.expect.parsedSig ?? "?"} mask ${fixture.expect.parsedMask ?? "?"}`,
      );
    }
    rows.push(
      `${fixture.name.padEnd(22)}  markers ${result.markers.length}  ` +
        `parsed ${parsed ? `${parsed.sig}/${parsed.mask}` : "null"}  ` +
        `${result.elapsed.toFixed(2)}s`,
    );
  }
  return { failures, rows };
}

/* ───────────────────────────── orchestration ───────────────────────────── */

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parseCli(argv: readonly string[]): {
  readonly census: string | null;
  readonly sample: number;
} {
  let census: string | null = process.env.DF_BDL_CENSUS ?? null;
  let sample = SAMPLE_SIZE;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--census") {
      const value = argv[index + 1];
      if (!value) fail("FAIL: --census needs a path to census_clean.jsonl");
      census = value;
      index += 1;
    } else if (arg === "--sample") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value <= 0) {
        fail("FAIL: --sample needs a positive integer");
      }
      sample = value;
      index += 1;
    } else {
      fail(
        `FAIL: unknown argument "${arg}" (supported: --census <path>, --sample <n>)`,
      );
    }
  }
  return { census, sample };
}

function main(): void {
  const { census, sample } = parseCli(process.argv.slice(2));
  const outDir = process.env.DF_BDL_SCRATCH ?? DEFAULT_SCRATCH;
  const workers = Math.max(2, Math.min(8, cpus().length));

  if (census !== null && !existsSync(census)) {
    fail(
      `FAIL: census not found at ${census}\n` +
        "The census is an optional certification artifact; omit --census/DF_BDL_CENSUS " +
        "to run the self-contained gate.",
    );
  }

  mkdirSync(outDir, { recursive: true });
  const corpusPath = join(outDir, "corpus.json");
  const corpus = PROBLEMS.map((problem) => ({
    id: problem.id,
    category: problem.category,
    difficulty: problem.difficulty,
    solution: problem.solution,
    testCases: problem.testCases,
  }));
  writeFileSync(corpusPath, JSON.stringify(corpus));

  const fixtures = buildHarnessFixtures();
  const fixturesPath = join(outDir, "harness-fixtures.json");
  const resultsPath = join(outDir, "harness-results.json");
  writeFileSync(fixturesPath, JSON.stringify(fixtures));

  const pythonArgs = [
    resolve("scripts/py_bdl_verify.py"),
    corpusPath,
    "--sample",
    String(sample),
    "--seed",
    SAMPLE_SEED,
    "--workers",
    String(workers),
    "--scratch",
    outDir,
    "--harnesses",
    fixturesPath,
    "--harness-results",
    resultsPath,
  ];
  if (census !== null) pythonArgs.push("--census", census);

  const py = spawnSync("python3", pythonArgs, {
    encoding: "utf8",
    timeout: PY_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (py.error) fail(`FAIL: could not run the Python gate: ${py.error.message}`);
  const stdout = py.stdout ?? "";
  const verbose = process.env.DF_BDL_VERBOSE === "1";
  if (verbose) process.stdout.write(stdout);
  if (py.stderr) process.stderr.write(py.stderr);

  const summaryLine = stdout
    .split("\n")
    .filter((line) => line.startsWith("BDL_GATE_SUMMARY "))
    .pop();
  if (!summaryLine) {
    process.stdout.write(stdout);
    fail("FAIL: Python gate produced no BDL_GATE_SUMMARY line");
  }
  const summary = JSON.parse(
    summaryLine.slice("BDL_GATE_SUMMARY ".length),
  ) as GateSummary;

  const results = existsSync(resultsPath)
    ? (JSON.parse(readFileSync(resultsPath, "utf8")) as HarnessFixtureResult[])
    : [];
  const fixtureCheck = validateHarnessFixtures(fixtures, results);

  const width = Math.max(...summary.metrics.map((m) => m.name.length), "metric".length);
  console.log(
    `\nBDL gate — independent corpus verification (sample ${summary.sample.size}, seed "${summary.sample.seed}", ${workers} workers)`,
  );
  console.log(
    `corpus ${summary.corpus.problems} problems (sha256 ${summary.corpus.sha256.slice(0, 12)})` +
      (summary.census.path
        ? ` · census ${summary.census.records} records (sha256 ${(summary.census.sha256 ?? "").slice(0, 12)})`
        : " · census not provided (self-contained mode)"),
  );
  console.log("");
  console.log(
    `${"metric".padEnd(width)}  ${"expected".padStart(12)}  ${"observed".padStart(12)}  ${"tolerance".padStart(12)}  result`,
  );
  console.log("-".repeat(width + 54));
  for (const metric of summary.metrics) {
    console.log(
      `${metric.name.padEnd(width)}  ${metric.expected.padStart(12)}  ${metric.observed.padStart(12)}  ${metric.tolerance.padStart(12)}  ${metric.pass ? "PASS" : "FAIL"}`,
    );
  }
  console.log("");
  if (summary.sample.records_match_census !== null) {
    console.log(
      `sample provenance: ${summary.sample.records_match_census}/${summary.sample.size} sampled problems reproduce their census record exactly`,
    );
  }
  if (summary.spot) {
    console.log(
      `spot records: al-345/ds-074 digests ${summary.spot.clean ? "match the committed checksums" : "MISMATCH"}`,
    );
  }
  console.log(
    `determinism: two runs byte-identical ${summary.determinism.byte_identical ? "yes" : "NO"}; flakes ${summary.determinism.reference_flakes}; cosmetic churn ${summary.determinism.cosmetic_churn_nonzero}; rename churn ${summary.determinism.rename_churn_nonzero}`,
  );

  console.log("");
  console.log("shipped-harness fixtures (generated by buildBdlHarness, run under CPython):");
  for (const row of fixtureCheck.rows) console.log(`  ${row}`);
  if (fixtureCheck.failures.length > 0) {
    for (const failure of fixtureCheck.failures) console.error(`  FAIL: ${failure}`);
  }

  const failed =
    py.status !== 0 ||
    !summary.ok ||
    summary.failures.length > 0 ||
    fixtureCheck.failures.length > 0;
  if (failed) {
    if (!verbose) process.stdout.write(stdout);
    const names = [
      ...summary.failures,
      ...fixtureCheck.failures.map((failure) => `harness:${failure.split(":")[0]}`),
    ];
    console.error(
      `\nFAIL: ${summary.checks - summary.failures.length}/${summary.checks} checks passed ` +
        `(${names.join(", ") || "python exit " + String(py.status)})`,
    );
    process.exit(1);
  }
  console.log(
    `\nPASS — ${summary.checks}/${summary.checks} checks, ${fixtures.length}/${fixtures.length} harness fixtures, ` +
      `sample ${summary.sample.analyzable}/${summary.sample.size} analyzable, runtime ${summary.runtime_seconds}s`,
  );
}

main();
