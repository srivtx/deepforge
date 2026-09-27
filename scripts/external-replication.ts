#!/usr/bin/env bun
/**
 * External replication runner — one command, a third party's corpus in, one
 * machine-readable report out.
 *
 *   npm run verify:external -- --corpus <path> [options]
 *   bun run scripts/external-replication.ts --corpus <path>
 *
 * This is the deliverable the research portfolio has been missing: a path on
 * which an independent lab can point the Alibi Distance / Behavioral Delta
 * Ledger methodology at its own exercise corpus, without editing a line of the
 * research engine. It performs four stages, in this order, and refuses to
 * continue past a stage that did not pass:
 *
 *   1. **validate**  — `src/lib/externalCorpus/validate.ts` checks the file
 *      against `df-corpus/1`. Any rejection ends the run: a corpus the
 *      methodology cannot honestly process is not measured on the exercises it
 *      *can* process and quietly reported as if it were the whole corpus. That
 *      refusal is the point, and `--allow-rejections` exists only to produce a
 *      report whose `filterAccounting` and comparison verdict both show the
 *      filtering.
 *   2. **census**    — `scripts/py_external_census.py` runs the *committed*
 *      analyzer (`scripts/py_bdl_verify.py`, imported, not copied) over the whole
 *      accepted corpus, twice, and writes the engine's own records. No sampling:
 *      the external denominator is the whole corpus, which is the one thing the
 *      internal 240-problem gate cannot offer.
 *   3. **alibi**     — when the file declares candidate alibis, they are composed
 *      into the record shape `scripts/py_alibi_verify.py` consumes and run
 *      through that shipped verifier as a subprocess. Nothing is mined here:
 *      DeepForge's alibi mutation-mining engine is not in this repository, so
 *      this stage can only verify candidates somebody else found.
 *   4. **report**    — `src/lib/externalCorpus/report.ts` assembles the report.
 *      `resultDigest` covers the reproducible section only; timestamps, host,
 *      durations, and worker counts live in `runMetadata` and are never hashed.
 *      The output file name starts with the provenance kind, so a directory
 *      listing alone separates this from an internal artifact.
 *
 * What this cannot do, and what the report says so: it cannot reproduce the
 * DeepForge alibi census, because that engine is not in the repository; it
 * cannot turn a run into a claim of external validity, because a claim needs a
 * pre-registration, an independent corpus, and a reader — not a command; and it
 * cannot make a different corpus agree. Until somebody else runs it, external
 * validity is UNPROVEN.
 *
 * Options
 *   --corpus <path>        the external corpus file (required)
 *   --out <path>           report path (default `./<name>.external-run.json`)
 *   --scratch <dir>        scratch directory for engine intermediates
 *   --workers <n>          engine worker processes (default min(8, cpus))
 *   --engine-runs <n>      engine runs for the determinism check (default 2)
 *   --allow-rejections     measure the accepted subset even though the validator
 *                          rejected something; the report is marked degraded and
 *                          the comparison verdict cannot be AGREE
 *   --preregistration <p>  a JSON file with the pre-registration, so the
 *                          comparison can emit a verdict
 *   --compare <path>       also write the comparison document next to the report
 *   --no-overlap           skip the overlap check (disclosed in the report)
 *   --print                print the report's measurement table to stdout
 *
 * Exit codes: 0 ran and wrote a report · 1 refused or failed · 2 usage error.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import {
  REPORT_SCHEMA_TAG,
  alibiBankFor,
  buildRunReport,
  bytesDigest,
  canonicalJson,
  compareExternalRun,
  corpusContentDigest,
  headerOf,
  logLine,
  overlapFindingFor,
  percent,
  projectExercise,
  reportFileName,
  resultDigestOf,
  runProvenance,
  sha256OfText,
  shortDigest,
  validateRunReport,
  validateCorpusFile,
  type AlibiVerificationSummary,
  type AnalysisExclusions,
  type ComparisonDocument,
  type EngineDigest,
  type Preregistration,
  type RuleCounts,
  type RunProvenance,
} from "../src/lib/externalCorpus";
import type { EngineRecord } from "../src/lib/externalCorpus/report";

const BDL_ENGINE = "scripts/py_bdl_verify.py";
const ALIBI_ENGINE = "scripts/py_alibi_verify.py";
const CENSUS_RUNNER = "scripts/py_external_census.py";

function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

interface Options {
  corpus: string;
  out: string | null;
  scratch: string;
  workers: number;
  engineRuns: number;
  allowRejections: boolean;
  preregistration: string | null;
  compare: boolean;
  overlap: boolean;
  print: boolean;
}

function parseArgs(argv: readonly string[]): Options {
  let corpus: string | null = null;
  let out: string | null = null;
  let scratch = join(tmpdir(), "deepforge-external-run");
  let workers = Math.max(1, Math.min(8, cpus().length));
  let engineRuns = 2;
  let allowRejections = false;
  let preregistration: string | null = null;
  let compare = false;
  let overlap = true;
  let print = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = (): string => {
      const value = argv[index + 1];
      if (!value) fail(`FAIL: ${arg} needs a value`);
      index += 1;
      return value;
    };
    if (arg === "--corpus") corpus = next();
    else if (arg === "--out") out = next();
    else if (arg === "--scratch") scratch = next();
    else if (arg === "--workers") workers = Math.max(1, Number(next()) || 1);
    else if (arg === "--engine-runs") engineRuns = Math.max(1, Number(next()) || 1);
    else if (arg === "--allow-rejections") allowRejections = true;
    else if (arg === "--preregistration") preregistration = next();
    else if (arg === "--compare") compare = true;
    else if (arg === "--no-overlap") overlap = false;
    else if (arg === "--print") print = true;
    else fail(`FAIL: unknown argument "${arg}"`);
  }
  if (!corpus) {
    fail(
      "FAIL: --corpus <path> is required\n" +
        "  usage: bun run scripts/external-replication.ts --corpus <your-corpus.json>\n" +
        "  the file must follow docs/research/external-corpus/format.schema.json",
      2,
    );
  }
  return {
    corpus,
    out,
    scratch,
    workers,
    engineRuns,
    allowRejections,
    preregistration,
    compare,
    overlap,
    print,
  };
}

function digestOf(path: string): EngineDigest {
  const bytes = readFileSync(path);
  return { path, sha256: sha256OfText(bytes.toString("utf8")), bytes: bytes.byteLength };
}

function pythonVersion(): string {
  const probe = spawnSync("python3", ["-c", "import sys,platform;print(platform.python_implementation(), platform.python_version())"], {
    encoding: "utf8",
  });
  if (probe.status !== 0 || !probe.stdout) return "(python3 not available)";
  return probe.stdout.trim();
}

function bunVersion(): string {
  return process.versions.bun ?? "unknown";
}

/** Group the analyzer's own skip reasons into the analysis-exclusion ledger. */
function analysisExclusionsOf(
  records: readonly EngineRecord[],
  submitted: number,
): AnalysisExclusions {
  const byReason = new Map<string, string[]>();
  for (const record of records) {
    if (record.skip === undefined) continue;
    const list = byReason.get(record.skip) ?? [];
    list.push(String(record.id));
    byReason.set(record.skip, list);
  }
  const exclusions = [...byReason.entries()]
    .map(([reason, exerciseIds]) => ({ reason, count: exerciseIds.length, exerciseIds }))
    .sort((a, b) => a.reason.localeCompare(b.reason));
  const counts: Record<string, number> = {};
  for (const entry of exclusions) counts[entry.reason] = entry.count;
  const analyzable = records.filter((record) => record.skip === undefined).length;
  return {
    exercisesSubmitted: submitted,
    exercisesAnalyzable: analyzable,
    exclusions,
    byReason: counts as RuleCounts,
    complete: analyzable + exclusions.reduce((sum, entry) => sum + entry.count, 0) === submitted,
  };
}

/** Run the shipped alibi verifier over the composed candidate bank. */
function verifyAlibis(args: {
  readonly bankPath: string;
  readonly candidates: number;
  readonly scratch: string;
}): { readonly summary: AlibiVerificationSummary; readonly failures: readonly string[] } {
  const run = spawnSync("python3", [resolve(ALIBI_ENGINE), args.bankPath], {
    encoding: "utf8",
    timeout: 1_800_000,
    maxBuffer: 256 * 1024 * 1024,
  });
  const stdout = run.stdout ?? "";
  if (run.stderr) process.stderr.write(run.stderr);
  const summaryLine = stdout
    .split("\n")
    .filter((line) => line.startsWith("ALIBI_GATE_SUMMARY "))
    .pop();
  if (!summaryLine) {
    return {
      summary: {
        candidatesSubmitted: args.candidates,
        verified: 0,
        failed: args.candidates,
        divergence: {},
        unionProbes: 0,
        heldOutProbes: 0,
        gateSummaryDigest: "",
        perCandidate: [],
      },
      failures: ["the shipped alibi verifier produced no ALIBI_GATE_SUMMARY line"],
    };
  }
  const parsed = JSON.parse(summaryLine.slice("ALIBI_GATE_SUMMARY ".length)) as {
    total: number;
    verified: number;
    failed: number;
    crash: number;
    value: number;
    timeout: number;
    unionFailures: number;
    heldOutFailures: number;
  };
  const perCandidate: { id: string; exerciseId: string; verified: boolean; divergence: string | null }[] = [];
  for (const line of stdout.split("\n")) {
    const match = /^(ok|FAIL)\s+(\S+)\s+\?\s+tests=(\d+)\s+witness=(\S+)\s+union=(\S+)\s+heldout=(\S+)/.exec(line);
    if (!match) continue;
    perCandidate.push({
      id: match[2]!,
      exerciseId: match[2]!,
      verified: match[1] === "ok",
      divergence: match[4]!,
    });
  }
  const unionProbes = stdout
    .split("\n")
    .map((line) => /union=(\d+)\/(\d+)/.exec(line))
    .reduce((sum, match) => sum + (match ? Number(match[2]) : 0), 0);
  const heldOutProbes = stdout
    .split("\n")
    .map((line) => /heldout=(\d+)\/(\d+)/.exec(line))
    .reduce((sum, match) => sum + (match ? Number(match[2]) : 0), 0);
  const failures = stdout
    .split("\n")
    .filter((line) => line.startsWith("FAIL "))
    .map((line) => line.slice(5));
  return {
    summary: {
      candidatesSubmitted: parsed.total,
      verified: parsed.verified,
      failed: parsed.failed,
      divergence: { crash: parsed.crash, value: parsed.value, timeout: parsed.timeout },
      unionProbes,
      heldOutProbes,
      gateSummaryDigest: sha256OfText(summaryLine.slice("ALIBI_GATE_SUMMARY ".length)),
      perCandidate,
    },
    failures,
  };
}

function readPreregistration(path: string | null): Preregistration | null {
  if (path === null) return null;
  if (!existsSync(path)) fail(`FAIL: --preregistration ${path} does not exist`);
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  const record = parsed as Record<string, unknown>;
  for (const field of ["registeredAt", "registeredBy", "registeredWhere", "exclusionPolicy", "margins"]) {
    if (record[field] === undefined) {
      fail(
        `FAIL: the pre-registration at ${path} has no "${field}"\n` +
          "  a verdict needs a margin that was fixed BEFORE the run; see " +
          "docs/research/external-replication-protocol.md §6",
      );
    }
  }
  return parsed as Preregistration;
}

function main(): number {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const startClock = performance.now();

  if (!existsSync(options.corpus)) fail(`FAIL: corpus not found at ${options.corpus}`);
  const corpusText = readFileSync(options.corpus, "utf8");
  const fileInfo = statSync(options.corpus);
  let document: unknown;
  try {
    document = JSON.parse(corpusText);
  } catch (error) {
    fail(
      `FAIL: ${options.corpus} is not valid JSON: ${(error as Error).message}\n` +
        "  remedy: python3 -m json.tool <file>",
    );
  }

  mkdirSync(options.scratch, { recursive: true });

  /* ── stage 1: validate ─────────────────────────────────────────────────── */
  const validation = validateCorpusFile(document, { overlapCheck: options.overlap });
  const header = validation.corpus === null ? null : headerOf(document);
  const overlap = overlapFindingFor(validation.accepted, options.overlap);
  const contentDigest = corpusContentDigest({
    formatVersion: 1,
    exercises: validation.accepted.map((exercise) =>
      projectExercise(
        {
          id: exercise.id,
          reference: exercise.reference,
          tests: exercise.tests,
          category: exercise.category ?? undefined,
          difficulty: exercise.difficulty ?? undefined,
        }),
    ),
    candidateAlibis: validation.acceptedAlibis.map((candidate) => ({
      id: candidate.id,
      exerciseId: candidate.exerciseId,
      ghost: candidate.ghost,
      witness: candidate.witness,
      func: candidate.func,
    })),
  });
  const provenance: RunProvenance | null =
    header === null
      ? null
      : runProvenance(header, contentDigest, overlap);

  const accounting = validation.filterAccounting;
  const rejected = accounting.exercisesRejected + accounting.alibisRejected;
  if (!validation.ok || rejected > 0) {
    if (provenance) console.error(logLine(provenance, `validation refused: ${String(rejected)} item(s) rejected`));
    else console.error("validation refused: the file has a fatal problem and cannot be trusted at all");
    console.error("");
    for (const rejection of [...validation.fatal, ...accounting.rejections, ...accounting.alibiRejections]) {
      console.error(
        `  ${rejection.code}  ${rejection.target}${rejection.index === null ? "" : ` (index ${String(rejection.index)})`}\n` +
          `      ${rejection.message}\n` +
          `      remedy: ${rejection.remedy}`,
      );
    }
    console.error("");
    console.error(
      `FAIL: ${String(accounting.exercisesTotal)} exercises submitted, ${String(accounting.exercisesAccepted)} accepted, ` +
        `${String(rejected)} rejected. The methodology did not run.` +
        (options.allowRejections
          ? "\n  --allow-rejections was given, so the accepted subset was measured; the report records the filtering and the comparison verdict cannot be AGREE."
          : "\n  Fix the rejections and re-run, or pass --allow-rejections to measure the accepted subset with the filtering on the record."),
    );
    return 1;
  }
  if (provenance) {
    console.log(
      logLine(
        provenance,
        `validated ${String(accounting.exercisesAccepted)} exercise(s) and ${String(accounting.alibisAccepted)} candidate(s); ` +
          `content digest ${shortDigest(contentDigest)}; ${String(accounting.advisories.length)} disclosure(s)`,
      ),
    );
  }
  for (const advisory of accounting.advisories) {
    console.log(
      logLine(
        provenance ?? ({ label: "UNIDENTIFIED CORPUS" } as RunProvenance),
        `disclosure ${advisory.code} x${String(advisory.count)} (${advisory.target}): ${advisory.message}`,
      ),
    );
  }

  /* ── stage 2: census over the whole accepted corpus ───────────────────── */
  const analyzerCorpusPath = join(options.scratch, "accepted-corpus.json");
  writeFileSync(
    analyzerCorpusPath,
    canonicalJson(
      validation.accepted.map((exercise) => ({
        id: exercise.id,
        category: exercise.category ?? "unspecified",
        difficulty: exercise.difficulty ?? "unspecified",
        solution: exercise.reference,
        testCases: exercise.tests,
      })),
    ),
  );
  const recordsPath = join(options.scratch, "engine-records.json");
  const census = spawnSync(
    "python3",
    [
      resolve(CENSUS_RUNNER),
      analyzerCorpusPath,
      "--records",
      recordsPath,
      "--workers",
      String(options.workers),
      "--runs",
      String(options.engineRuns),
    ],
    { encoding: "utf8", timeout: 6 * 60 * 60 * 1000, maxBuffer: 256 * 1024 * 1024 },
  );
  if (census.error) fail(`FAIL: could not run ${CENSUS_RUNNER}: ${census.error.message}`);
  if (census.stdout) process.stdout.write(census.stdout);
  if (census.stderr) process.stderr.write(census.stderr);
  if (census.status !== 0 || !existsSync(recordsPath)) {
    fail(`FAIL: the census runner exited ${String(census.status)} and wrote no records`);
  }
  const engineOutput = JSON.parse(readFileSync(recordsPath, "utf8")) as {
    records: EngineRecord[];
    runs: { records_digest: string }[];
    two_runs_byte_identical: boolean;
    engine: { path: string; sha256: string };
  };

  /* ── stage 3: alibi verification, when candidates were supplied ───────── */
  let alibiVerification: AlibiVerificationSummary | null = null;
  const alibiFailures: string[] = [];
  if (validation.acceptedAlibis.length > 0) {
    const bankPath = join(options.scratch, "external-alibi-bank.json");
    writeFileSync(bankPath, canonicalJson(alibiBankFor(validation.accepted, validation.acceptedAlibis)));
    const verified = verifyAlibis({
      bankPath,
      candidates: validation.acceptedAlibis.length,
      scratch: options.scratch,
    });
    alibiVerification = verified.summary;
    alibiFailures.push(...verified.failures);
    if (provenance) {
      console.log(
        logLine(
          provenance,
          `alibi verifier: ${String(verified.summary.verified)}/${String(verified.summary.candidatesSubmitted)} candidate(s) verified, ` +
            `${String(verified.summary.unionProbes)} union + ${String(verified.summary.heldOutProbes)} held-out probes`,
        ),
      );
    }
  } else if (provenance) {
    console.log(
      logLine(
        provenance,
        "no candidate alibis were supplied, so nothing was verified about Alibi Distance and nothing may be concluded from it",
      ),
    );
  }

  /* ── stage 4: report ───────────────────────────────────────────────────── */
  const analysisExclusions = analysisExclusionsOf(engineOutput.records, validation.accepted.length);
  const bytes = bytesDigest(corpusText);
  const engine = {
    bdl: { path: BDL_ENGINE, sha256: engineOutput.engine.sha256, bytes: statSync(resolve(BDL_ENGINE)).size },
    alibi: digestOf(resolve(ALIBI_ENGINE)),
    runner: digestOf(resolve("scripts/external-replication.ts")),
    census: digestOf(resolve(CENSUS_RUNNER)),
  };
  const firstDigest = engineOutput.runs[0]?.records_digest ?? "";
  const secondDigest =
    engineOutput.runs.length > 1
      ? (engineOutput.runs[1]?.records_digest ?? "")
      : firstDigest;

  const report = buildRunReport({
    provenance: provenance as RunProvenance,
    filterAccounting: accounting,
    analysisExclusions,
    records: engineOutput.records,
    engine,
    corpusContentDigest: contentDigest,
    corpusBytesSha256: bytes.sha256,
    corpusBytes: fileInfo.size,
    runMetadata: {
      startedAt,
      finishedAt: new Date().toISOString(),
      durationSeconds: Number(((performance.now() - startClock) / 1000).toFixed(3)),
      host: { platform: process.platform, arch: process.arch, cpus: cpus().length },
      runtime: {
        bun: bunVersion(),
        node: process.versions.node ?? "unknown",
        python: pythonVersion(),
        pythonImplementation: pythonVersion().split(" ")[0] ?? "unknown",
        pythonVersion: pythonVersion().split(" ")[1] ?? "unknown",
      },
      workers: options.workers,
      command: process.argv.slice(1),
      outputPath: "",
    },
    alibiVerification,
    exercisesSubmitted: validation.accepted.length,
  });

  // Determinism is a precondition of any comparison, and the report says so.
  const withDeterminism = {
    ...report,
    reproducible: {
      ...report.reproducible,
      determinism: {
        twoRunsByteIdentical:
          engineOutput.two_runs_byte_identical && options.engineRuns > 1,
        recordsDigestFirst: firstDigest,
        recordsDigestSecond: secondDigest,
      },
    },
  };
  const resultDigest = resultDigestOf(withDeterminism.reproducible);

  let comparison: ComparisonDocument | null = null;
  if (options.compare) {
    comparison = compareExternalRun({
      report: { ...withDeterminism, resultDigest, runMetadata: { ...report.runMetadata, outputPath: "" } },
      preregistration: readPreregistration(options.preregistration),
    });
  }

  const finalProvenance = provenance as RunProvenance;
  const outPath =
    options.out ??
    join(process.cwd(), reportFileName(finalProvenance, resultDigest));
  const finalReport = {
    ...withDeterminism,
    provenance: finalProvenance,
    resultDigest,
    runMetadata: { ...report.runMetadata, outputPath: outPath },
    comparison,
  };

  const check = validateRunReport(finalReport);
  if (!check.ok) {
    fail(
      `FAIL: the assembled report failed its own consistency check\n  ${check.problems.join("\n  ")}`,
    );
  }

  writeFileSync(outPath, `${JSON.stringify(finalReport, null, 2)}\n`);

  /* ── report ────────────────────────────────────────────────────────────── */
  console.log("");
  console.log(logLine(finalProvenance, `report ${basename(outPath)}`));
  console.log(
    `  corpus content digest   ${contentDigest}`,
  );
  console.log(`  result digest           ${resultDigest}  (covers the reproducible section only)`);
  console.log(
    `  engine                  bdl ${shortDigest(engine.bdl.sha256)} · alibi ${shortDigest(engine.alibi.sha256)} · runner ${shortDigest(engine.runner.sha256)}`,
  );
  console.log(
    `  accounting              ${String(accounting.exercisesAccepted)}/${String(accounting.exercisesTotal)} exercises accepted, ` +
      `${String(analysisExclusions.exercisesAnalyzable)}/${String(analysisExclusions.exercisesSubmitted)} analyzable`,
  );
  if (analysisExclusions.exclusions.length > 0) {
    for (const entry of analysisExclusions.exclusions) {
      console.log(`    excluded ${entry.reason.padEnd(24)} ${String(entry.count)}`);
    }
  }
  if (options.print) {
    console.log("");
    console.log("  measurement                        n / N        rate     95% interval");
    for (const row of finalReport.reproducible.measurements) {
      const show = (value: number | null): string =>
        row.scale === "per-unit" && value !== null ? value.toFixed(2) : percent(value);
      console.log(
        `  ${row.label.padEnd(32)} ${String(row.numerator).padStart(7)}/${String(row.denominator).padEnd(7)} ` +
          `${show(row.point).padStart(8)}  [${show(row.ci95[0])}, ${show(row.ci95[1])}]`,
      );
      if (row.caveat) console.log(`  ${"".padEnd(32)} caveat: ${row.caveat}`);
    }
  }
  if (comparison) {
    console.log("");
    console.log(`  comparison verdict   ${comparison.verdict}`);
    console.log(`  ${comparison.verdictReason}`);
  }
  console.log("");
  console.log(
    `EXTERNAL_RUN_REPORT {"schema":"${REPORT_SCHEMA_TAG}","kind":"${finalProvenance.kind}",` +
      `"corpus":"${finalProvenance.corpusId}","resultDigest":"${shortDigest(resultDigest)}",` +
      `"exercises":${String(accounting.exercisesAccepted)},"analyzable":${String(analysisExclusions.exercisesAnalyzable)},` +
      `"deterministic":${String(finalReport.reproducible.determinism.twoRunsByteIdentical)},` +
      `"notAScientificResult":${String(finalProvenance.notAScientificResult)}}`,
  );
  if (alibiFailures.length > 0) {
    console.error("");
    console.error(`ALIBI_CANDIDATE_FAILURES ${String(alibiFailures.length)}`);
    for (const failure of alibiFailures) console.error(`  ${failure}`);
  }
  if (finalProvenance.synthetic) {
    console.error("");
    console.error(
      "NOT A SCIENTIFIC RESULT: this corpus declares itself a synthetic format fixture. " +
        "Its numbers demonstrate that the pipeline runs and must never be cited.",
    );
  }
  console.error("");
  console.error(
    "External validity of the DeepForge results remains UNPROVEN. This run is evidence that the " +
      "methodology is runnable on somebody else's corpus; it is not a replication, and it becomes " +
      "one only when an independent lab runs it on its own corpus, with a pre-registered margin, " +
      "and publishes the result either way.",
  );
  return 0;
}

process.exit(main());
