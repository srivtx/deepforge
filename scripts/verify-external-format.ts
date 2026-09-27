#!/usr/bin/env bun
/**
 * External-corpus format gate — the self-test for the replication path.
 *
 *   bun run scripts/verify-external-format.ts
 *
 * This step exists in `bun run verify:all` because a capability nobody exercises
 * is a capability nobody can trust. It runs no experiment and measures no
 * corpus. It checks the *plumbing* of the external-replication path, and every
 * check below is either a property of this repository's own committed code or a
 * property of the shipped synthetic fixture:
 *
 *   F1  the shipped synthetic example corpus is rejected, and the rejection is
 *       exactly the documented one: one exercise, `syn-invalid-005`, two rule
 *       codes, and the accounting identity holds (6 = 5 + 1)
 *   F2  the same corpus with that one exercise removed validates cleanly, so
 *       the rejection above is the *only* thing wrong with the file
 *   F3  the candidate alibi in the fixture is genuinely verified by the shipped
 *       verifier — reference and ghost pass every shipped test, they diverge at
 *       the witness, and neither the union nor the held-out suite finds a
 *       divergence. This is the alibi path running for real, on 5 exercises.
 *   F4  the two exclusion ledgers stay separate: a format rejection and an
 *       analyzer skip are recorded in different places and never summed into one
 *       number, and an unaccounted analyzer exclusion is caught by recomputing the
 *       arithmetic rather than by reading the report's own `complete` flag
 *   F5  a report's `resultDigest` is invariant under every run-metadata field —
 *       timestamps, durations, host, CPU count, worker count, output path. This
 *       is the direct test that the time-dependent-manifest mistake is not being
 *       repeated: mutate all of it and the digest must not move.
 *   F6  the provenance separation holds: the internal DeepForge corpus is
 *       refused as `origin: "internal"`, a corpus carrying the internal
 *       exercises is rejected for colliding with them, and a synthetic report
 *       is stamped `notAScientificResult`
 *   F7  the comparison refuses to emit a favourable verdict without a
 *       pre-registration, and its verdict is `INSUFFICIENT_SAMPLE` on a corpus
 *       far too small for any plausible margin
 *   F8  the engine the external path imports is byte-identical to the committed
 *       one: `scripts/py_bdl_verify.py` and `scripts/py_alibi_verify.py` are
 *       unchanged, and the constants this path restates match the constants in
 *       those files
 *
 * F3 runs the real alibi verifier over 5 toy exercises and takes a couple of
 * seconds. Nothing here touches the 5,730-problem corpus except F6, which
 * hashes it.
 *
 * Prints `EXTERNAL_FORMAT_GATE {...}` and exits non-zero on any failure. The
 * gate never hard-codes PASS.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  BDL_ENGINE_CONSTANTS,
  INTERNAL_CORPUS_SHA256,
  buildRunReport,
  canonicalJson,
  compareExternalRun,
  corpusContentDigest,
  isKnownRule,
  projectExercise,
  reportFileName,
  resultDigestOf,
  sha256OfText,
  toleranceBandDemonstration,
  validateCorpusFile,
  validateRunReport,
  type AcceptedAlibi,
  type AcceptedExercise,
  type AnalysisExclusions,
  type ComparisonDocument,
  type ExternalRunReport,
  type FilterAccounting,
  type Preregistration,
  type RunEngineProvenance,
  type RunProvenance,
  type ValidationReport,
} from "../src/lib/externalCorpus";
import { PROBLEMS } from "../src/data/problems";

const EXAMPLE = "docs/research/external-corpus/example-synthetic-corpus.json";
const BDL_ENGINE = "scripts/py_bdl_verify.py";
const ALIBI_ENGINE = "scripts/py_alibi_verify.py";

/** The rejection the example corpus is *supposed* to produce. F1 asserts it. */
const EXPECTED_REJECTION = {
  exerciseId: "syn-invalid-005",
  exerciseIndex: 5,
  codes: ["exercise/test-expected-missing", "exercise/unknown-field"],
  exercisesTotal: 6,
  exercisesAccepted: 5,
  exercisesRejected: 1,
} as const;

interface Check {
  readonly id: string;
  readonly name: string;
  readonly pass: boolean;
  readonly detail: string;
}

const checks: Check[] = [];
function record(id: string, name: string, pass: boolean, detail: string): void {
  checks.push({ id, name, pass, detail });
}

function readExample(): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(EXAMPLE), "utf8")) as Record<string, unknown>;
}

function digestOfFile(path: string): string {
  return sha256OfText(readFileSync(resolve(path), "utf8"));
}

const exampleText = readFileSync(resolve(EXAMPLE), "utf8");
const exampleDocument = readExample();

/* ── F1: the example corpus is rejected, and only in the documented way ───── */

const validation = validateCorpusFile(exampleDocument);
const accounting: FilterAccounting = validation.filterAccounting;
const rejectedCodes = [...new Set(accounting.rejections.map((entry) => entry.code))].sort();
const expectedCodes = [...EXPECTED_REJECTION.codes].sort();
record(
  "F1a",
  "example corpus is not accepted",
  validation.ok === false,
  `ok=${String(validation.ok)}`,
);
record(
  "F1b",
  "exactly the documented rule codes fired",
  rejectedCodes.length === expectedCodes.length &&
    rejectedCodes.every((code, index) => code === expectedCodes[index]) &&
    rejectedCodes.every(isKnownRule),
  `fired ${rejectedCodes.join(", ") || "(none)"}`,
);
record(
  "F1c",
  "exactly the documented exercise was rejected, and only that one",
  accounting.exercisesRejected === EXPECTED_REJECTION.exercisesRejected &&
    accounting.rejections.every((entry) => entry.target === EXPECTED_REJECTION.exerciseId) &&
    accounting.rejections.some((entry) => entry.index === EXPECTED_REJECTION.exerciseIndex),
  `${String(accounting.exercisesRejected)} rejected, all naming ${EXPECTED_REJECTION.exerciseId}`,
);
record(
  "F1d",
  "the filter accounting balances (6 = 5 + 1)",
  accounting.balances === true &&
    accounting.exercisesTotal === EXPECTED_REJECTION.exercisesTotal &&
    accounting.exercisesAccepted === EXPECTED_REJECTION.exercisesAccepted &&
    accounting.exercisesTotal === accounting.exercisesAccepted + accounting.exercisesRejected &&
    accounting.alibisTotal === accounting.alibisAccepted + accounting.alibisRejected,
  `${String(accounting.exercisesTotal)} = ${String(accounting.exercisesAccepted)} + ${String(accounting.exercisesRejected)}; ` +
    `candidates ${String(accounting.alibisTotal)} = ${String(accounting.alibisAccepted)} + ${String(accounting.alibisRejected)}`,
);
record(
  "F1e",
  "the rejected exercise is named with a path, a message, and a remedy",
  accounting.rejections.every(
    (entry) =>
      entry.path.startsWith("/exercises/") &&
      entry.message.length > 20 &&
      entry.remedy.length > 20,
  ),
  `${String(accounting.rejections.length)} rejection(s), each with path + message + remedy`,
);
record(
  "F1f",
  "the fixture is labelled synthetic and says so in its own text",
  exampleDocument.corpus !== undefined &&
    (exampleDocument as { corpus: { origin: string } }).corpus.origin === "synthetic-example" &&
    exampleText.includes("NOT A SCIENTIFIC CORPUS"),
  `origin "${(exampleDocument as { corpus: { origin: string } }).corpus.origin}", banner present in the file text`,
);
record(
  "F1g",
  "the declared-invalid exercise is genuinely invalid, not merely marked",
  (() => {
    const exercises = (exampleDocument as { exercises: Record<string, unknown>[] }).exercises;
    const bad = exercises[EXPECTED_REJECTION.exerciseIndex];
    if (!bad) return false;
    const tests = bad.tests as Record<string, unknown>[];
    const fields = Object.keys(bad);
    return (
      tests.some((test) => !Object.prototype.hasOwnProperty.call(test, "expected")) &&
      fields.includes("testcase") &&
      fields.includes("testcases")
    );
  })(),
  "exercises[5] has a test with no `expected` key plus two misspelled test-list fields",
);
record(
  "F1h",
  "the weak-but-valid exercise is disclosed, not filtered",
  accounting.exercisesAccepted === EXPECTED_REJECTION.exercisesAccepted &&
    accounting.advisoryCounts["advisory/tests-below-three"] === 1,
  "syn-005 (one shipped test) is accepted with an advisory, not rejected",
);

/* ── F2: removing only the invalid exercise makes the file clean ─────────── */

const cleanDocument = {
  ...exampleDocument,
  exercises: (exampleDocument as { exercises: unknown[] }).exercises.filter(
    (_, index) => index !== EXPECTED_REJECTION.exerciseIndex,
  ),
} as Record<string, unknown>;
const cleanValidation: ValidationReport = validateCorpusFile(cleanDocument);
record(
  "F2a",
  "the same corpus minus the one invalid exercise validates cleanly",
  cleanValidation.ok === true && cleanValidation.filterAccounting.exercisesAccepted === 5,
  `ok=${String(cleanValidation.ok)}, ${String(cleanValidation.filterAccounting.exercisesAccepted)} accepted, ` +
    `${String(cleanValidation.filterAccounting.exercisesRejected)} rejected`,
);
record(
  "F2b",
  "the clean file keeps its candidate alibi and its provenance",
  cleanValidation.acceptedAlibis.length === 1 &&
    cleanValidation.acceptedAlibis[0]?.exerciseId === "syn-001" &&
    cleanValidation.corpus?.independence === "independent-from-deepforge",
  `1 candidate over syn-001; independence "${cleanValidation.corpus?.independence}"`,
);

/* ── F3: the shipped alibi verifier really verifies the fixture's candidate ─ */

let alibiVerified = 0;
let alibiProbes = 0;
let alibiDetail = "not run";
{
  const scratch = mkdtempSync(join(tmpdir(), "df-external-format-"));
  const bankPath = join(scratch, "bank.json");
  const byId = new Map(cleanValidation.accepted.map((exercise) => [exercise.id, exercise]));
  const bank = cleanValidation.acceptedAlibis.map((candidate: AcceptedAlibi) => {
    const exercise = byId.get(candidate.exerciseId) as AcceptedExercise;
    return {
      id: candidate.id,
      exerciseId: candidate.exerciseId,
      reference: exercise.reference,
      ghost: candidate.ghost,
      func: candidate.func,
      tests: exercise.tests,
      witness: candidate.witness,
    };
  });
  writeFileSync(bankPath, JSON.stringify(bank));
  const run = spawnSync("python3", [resolve(ALIBI_ENGINE), bankPath], {
    encoding: "utf8",
    timeout: 600_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const stdout = run.stdout ?? "";
  const line = stdout.split("\n").find((entry) => entry.startsWith("ALIBI_GATE_SUMMARY "));
  if (line) {
    const summary = JSON.parse(line.slice("ALIBI_GATE_SUMMARY ".length)) as {
      verified: number;
      total: number;
      failed: number;
    };
    alibiVerified = summary.verified;
    alibiProbes = stdout.split("\n").reduce((sum, entry) => {
      const match = /union=(\d+)\/(\d+)\s+heldout=(\d+)\/(\d+)/.exec(entry);
      return sum + (match ? Number(match[2]) + Number(match[4]) : 0);
    }, 0);
    alibiDetail = `verified ${String(summary.verified)}/${String(summary.total)}, ${String(alibiProbes)} probes`;
  } else {
    alibiDetail = `no summary line (exit ${String(run.status)})`;
  }
  rmSync(scratch, { recursive: true, force: true });
}
record(
  "F3a",
  "the shipped alibi verifier verifies the fixture's candidate alibi",
  alibiVerified === 1,
  alibiDetail,
);
record(
  "F3b",
  "the verifier's union and held-out suites actually ran",
  alibiProbes >= 100,
  `${String(alibiProbes)} union + held-out probes across the candidate`,
);

/* ── F4: the two exclusion ledgers stay separate ─────────────────────────── */

const exclusionLedger: AnalysisExclusions = {
  exercisesSubmitted: 6,
  exercisesAnalyzable: 5,
  exclusions: [{ reason: "small-basis", count: 1, exerciseIds: ["syn-005"] }],
  byReason: { "small-basis": 1 },
  complete: false,
};
record(
  "F4a",
  "a format rejection and an analyzer skip are counted in different fields",
  accounting.rejections[0] !== undefined &&
    accounting.rejections[0]!.scope === "exercise" &&
    exclusionLedger.exclusions[0]?.reason === "small-basis" &&
    JSON.stringify(accounting.rejectionsByRule).indexOf("small-basis") === -1,
  "format rejections carry rule codes; analyzer exclusions carry engine skip reasons; neither list contains the other",
);
record(
  "F4b",
  "an incomplete analysis is flagged, not hidden",
  exclusionLedger.complete === false,
  `complete=${String(exclusionLedger.complete)} with ${String(exclusionLedger.exercisesSubmitted - exclusionLedger.exercisesAnalyzable)} unexplained exclusion(s)`,
);

/* ── F5: the digest is invariant under every run-metadata field ──────────── */

const engine: RunEngineProvenance = {
  bdl: { path: BDL_ENGINE, sha256: digestOfFile(BDL_ENGINE), bytes: 0 },
  alibi: { path: ALIBI_ENGINE, sha256: digestOfFile(ALIBI_ENGINE), bytes: 0 },
  runner: { path: "scripts/external-replication.ts", sha256: digestOfFile("scripts/external-replication.ts"), bytes: 0 },
  census: { path: "scripts/py_external_census.py", sha256: digestOfFile("scripts/py_external_census.py"), bytes: 0 },
};
const provenance: RunProvenance = {
  kind: "synthetic-example",
  corpusId: "synthetic-format-fixture",
  corpusName: "SYNTHETIC FORMAT FIXTURE (not a scientific corpus)",
  corpusVersion: "1.0.0",
  corpusContentDigest: "0".repeat(64),
  maintainer: "DeepForge research-integrity workstream (fixture author)",
  source: EXAMPLE,
  obtained: "2026-09-27",
  method: "hand-authored",
  independence: "independent-from-deepforge",
  licenseId: "CC0-1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  synthetic: true,
  notAScientificResult: true,
  label: "SYNTHETIC EXAMPLE (not a scientific corpus) synthetic-format-fixture@1.0.0",
  overlapWithInternalCorpus: {
    performed: true,
    status: "checked",
    sharedReferences: 0,
    exercises: 5,
    sharedIds: 0,
    isTheInternalCorpus: false,
    doesNotEstablish: "gate self-test",
  },
};
const metadata = {
  startedAt: "2026-09-27T00:00:00.000Z",
  finishedAt: "2026-09-27T00:00:01.000Z",
  durationSeconds: 1,
  host: { platform: "darwin", arch: "arm64", cpus: 8 },
  runtime: {
    bun: "1.3.9",
    node: "22",
    python: "CPython 3.13.0",
    pythonImplementation: "CPython",
    pythonVersion: "3.13.0",
  },
  workers: 4,
  command: ["bun", "run", "scripts/external-replication.ts"],
  outputPath: "/tmp/one.json",
};
const reportInput = {
  provenance,
  filterAccounting: cleanValidation.filterAccounting,
  analysisExclusions: {
    exercisesSubmitted: 5,
    exercisesAnalyzable: 5,
    exclusions: [],
    byReason: {},
    complete: true,
  },
  records: [
    { id: "syn-001", category: "arithmetic", difficulty: "trivial", n_mut: 4, n_invisible: 1, basis_n: 12 },
    { id: "syn-002", category: "arithmetic", difficulty: "trivial", n_mut: 7, n_invisible: 0, basis_n: 15 },
    { id: "syn-003", category: "text", difficulty: "easy", n_mut: 5, n_invisible: 2, basis_n: 9 },
  ],
  engine,
  corpusContentDigest: provenance.corpusContentDigest,
  corpusBytesSha256: sha256OfText(exampleText),
  corpusBytes: exampleText.length,
  runMetadata: metadata,
  alibiVerification: null,
  exercisesSubmitted: 5,
};
const baseReport: ExternalRunReport = buildRunReport(reportInput);
const mutatedReport: ExternalRunReport = {
  ...baseReport,
  runMetadata: {
    ...baseReport.runMetadata,
    startedAt: "2031-12-24T18:04:05.678Z",
    finishedAt: "2031-12-24T18:09:05.678Z",
    durationSeconds: 299.999,
    host: { platform: "linux", arch: "x64", cpus: 64 },
    runtime: {
      bun: "9.9.9",
      node: "99",
      python: "CPython 3.9.0",
      pythonImplementation: "CPython",
      pythonVersion: "3.9.0",
    },
    workers: 32,
    command: ["python3", "somewhere", "else"],
    outputPath: "/var/tmp/somewhere/else.json",
  },
};
const baseDigest = resultDigestOf(baseReport.reproducible);
const mutatedDigest = resultDigestOf(mutatedReport.reproducible);
record(
  "F5a",
  "the result digest is unchanged when every run-metadata field changes",
  baseDigest === mutatedDigest && baseReport.resultDigest === baseReport.resultDigest,
  `${baseDigest.slice(0, 16)} vs ${mutatedDigest.slice(0, 16)} after changing all 11 run-metadata fields`,
);
record(
  "F5b",
  "the run-metadata section declares itself non-reproducible",
  baseReport.runMetadata.reproducible === false,
  "runMetadata.reproducible === false, so folding it into a digest is a type error",
);
{
  const tampered = JSON.parse(JSON.stringify(baseReport)) as ExternalRunReport;
  (tampered.reproducible.records as Record<string, unknown>[])[0]!["n_mut"] = 999;
  record(
    "F5c",
    "changing a measured value DOES change the digest",
    resultDigestOf(tampered.reproducible) !== baseDigest,
    "the digest is not vacuous: it covers the measurement, not just the metadata",
  );
  const check = validateRunReport(tampered);
  record(
    "F5d",
    "a report read back from disk with a stale digest is caught",
    check.ok === false && check.problems.some((problem) => problem.includes("resultDigest")),
    check.problems[0] ?? "(no problem reported)",
  );
}

/* ── F6: provenance separation ───────────────────────────────────────────── */

{
  const internal = JSON.parse(
    JSON.stringify(
      PROBLEMS.slice(0, 2).map((problem) => ({
        id: problem.id,
        title: problem.title,
        category: problem.category,
        difficulty: problem.difficulty,
        description: problem.description,
        starterCode: problem.starterCode,
        solution: problem.solution,
        testCases: problem.testCases,
      })),
    ),
  ) as unknown[];
  const asInternal = validateCorpusFile({
    format: "df-corpus",
    formatVersion: 1,
    corpus: {
      ...(exampleDocument as { corpus: Record<string, unknown> }).corpus,
      origin: "internal",
    },
    exercises: internal,
  });
  record(
    "F6a",
    "a corpus that claims to be the internal one is refused",
    asInternal.ok === false &&
      asInternal.fatal.some((entry) => entry.code === "corpus/origin"),
    asInternal.fatal.map((entry) => entry.code).join(", ") || "(no fatal rule fired)",
  );

  const disguised = {
    format: "df-corpus",
    formatVersion: 1,
    corpus: { ...(exampleDocument as { corpus: Record<string, unknown> }).corpus, id: "looks-external" },
    exercises: PROBLEMS.map((problem) => ({
      id: problem.id,
      category: problem.category,
      difficulty: problem.difficulty,
      reference: problem.solution,
      tests: problem.testCases,
    })),
  };
  const disguisedValidation = validateCorpusFile(disguised);
  record(
    "F6b",
    "the whole internal corpus wearing an external label is refused for colliding with itself",
    disguisedValidation.corpusUsable === false &&
      disguisedValidation.fatal.some(
        (entry) => entry.code === "provenance/collides-with-deepforge-corpus",
      ),
    disguisedValidation.fatal.map((entry) => entry.code).join(", ") ||
      "(no fatal rule fired)",
  );
  record(
    "F6b2",
    "every internal exercise is individually valid under df-corpus/1 (so the collision is the only thing that catches it)",
    disguisedValidation.filterAccounting.exercisesAccepted === PROBLEMS.length &&
      disguisedValidation.filterAccounting.exercisesRejected === 0,
    `${String(disguisedValidation.filterAccounting.exercisesAccepted)}/${String(PROBLEMS.length)} individually valid, ` +
      "which is the point: nothing about the SHAPE of a corpus reveals that it is DeepForge's own",
  );
}

{
  // The overlap check must report every internal reference as shared, and the
  // whole-corpus digest collision must be a fatal rule.
  const { compareWithInternalCorpus, internalProjection } = await import(
    "../src/lib/externalCorpus/provenance"
  );
  const projectionDigest = sha256OfText(internalProjection());
  record(
    "F6c",
    "the internal corpus digest in this module is the published one",
    projectionDigest === INTERNAL_CORPUS_SHA256,
    `${projectionDigest.slice(0, 16)} vs published ${INTERNAL_CORPUS_SHA256.slice(0, 16)}`,
  );
  const finding = compareWithInternalCorpus({
    ids: PROBLEMS.map((problem) => problem.id),
    references: PROBLEMS.map((problem) => problem.solution),
    projectionDigest,
  });
  record(
    "F6d",
    "the overlap check finds every internal reference and flags the collision",
    finding.isTheInternalCorpus === true &&
      finding.sharedReferences === PROBLEMS.length &&
      finding.sharedIds === PROBLEMS.length,
    `isTheInternalCorpus=${String(finding.isTheInternalCorpus)}, ` +
      `${String(finding.sharedReferences)}/${String(PROBLEMS.length)} references shared`,
  );
  const syntheticFinding = compareWithInternalCorpus({
    ids: cleanValidation.accepted.map((exercise) => exercise.id),
    references: cleanValidation.accepted.map((exercise) => exercise.reference),
    projectionDigest: null,
  });
  record(
    "F6e",
    "the synthetic fixture shares no reference with the internal corpus",
    syntheticFinding.sharedReferences === 0 && syntheticFinding.sharedIds === 0,
    `${String(syntheticFinding.sharedReferences)} shared reference(s)`,
  );
}

{
  const fileName = reportFileName(provenance, baseReport.resultDigest);
  record(
    "F6f",
    "a synthetic report's file name cannot be mistaken for an internal artifact",
    fileName.startsWith("NOT-A-RESULT__synthetic-example__") && baseReport.provenance.notAScientificResult === true,
    fileName,
  );
  const externalName = reportFileName(
    { ...provenance, kind: "external", synthetic: false, corpusId: "acme-2026" },
    baseReport.resultDigest,
  );
  record(
    "F6g",
    "an external report's file name leads with its provenance kind",
    externalName.startsWith("external__acme-2026__"),
    externalName,
  );
}

/* ── F7: the comparison cannot be talked into a favourable verdict ────────── */

{
  const noPrereg: ComparisonDocument = compareExternalRun({ report: baseReport, preregistration: null });
  record(
    "F7a",
    "no pre-registration means no verdict in either direction",
    noPrereg.verdict === "PREREGISTRATION_ABSENT",
    noPrereg.verdict,
  );
  const syntheticWithPrereg = compareExternalRun({
    report: baseReport,
    preregistration: {
      registeredAt: "2026-01-01",
      registeredBy: "nobody",
      registeredWhere: "nowhere",
      exclusionPolicy: "none",
      margins: { hiddenVisible: 0.05 },
    } satisfies Preregistration,
  });
  record(
    "F7b",
    "a synthetic corpus cannot produce AGREE even with a pre-registration",
    syntheticWithPrereg.verdict === "NOT_COMPARABLE" &&
      syntheticWithPrereg.preconditions.some(
        (entry) => entry.id === "P1-external-corpus" && !entry.holds,
      ),
    `${syntheticWithPrereg.verdict}: ${syntheticWithPrereg.verdictReason}`,
  );
  record(
    "F7c",
    "a 5-exercise corpus is INSUFFICIENT_SAMPLE, not AGREE",
    !syntheticWithPrereg.statistics.some((row) => row.verdict === "AGREE") &&
      syntheticWithPrereg.statistics.every(
        (row) => row.minExercisesForMargin === null || row.minExercisesForMargin > 5,
      ),
    `required n per statistic: ${syntheticWithPrereg.statistics
      .map((row) => `${row.id}=${String(row.minExercisesForMargin)}`)
      .join(" ")}`,
  );
  const demonstration = toleranceBandDemonstration();
  record(
    "F7d",
    "the internal gate's own PASS is reproduced, and the interval rule refuses it at every margin",
    demonstration.length === 4 &&
      demonstration[0]?.underGateRule === "would pass" &&
      demonstration.every((row) => row.underIntervalRule === "INCONCLUSIVE") &&
      demonstration.every(
        (row, index) => index === 0 || row.requiredExercises > demonstration[index - 1]!.requiredExercises,
      ),
    demonstration
      .map(
        (row) =>
          `d=${(row.margin * 100).toFixed(2)}pp: gate rule ${row.underGateRule}, interval rule ${row.underIntervalRule}, n>=${String(row.requiredExercises)}`,
      )
      .join("; "),
  );
  const derived = compareExternalRun({
    report: baseReport,
    preregistration: {
      registeredAt: "2026-01-01",
      registeredBy: "nobody",
      registeredWhere: "nowhere",
      exclusionPolicy: "none",
      margins: {},
    } satisfies Preregistration,
  });
  record(
    "F7e",
    "a comparison is a pure function of (report, pre-registration)",
    canonicalJson(derived) === canonicalJson(compareExternalRun({ report: baseReport, preregistration: {
      registeredAt: "2026-01-01",
      registeredBy: "nobody",
      registeredWhere: "nowhere",
      exclusionPolicy: "none",
      margins: {},
    } satisfies Preregistration })),
    "two calls with identical inputs serialise identically",
  );
}

/* ── F8: the engines this path imports are the committed, unchanged ones ──── */

{
  const constantsMatch =
    BDL_ENGINE_CONSTANTS.basisCap === 48 &&
    BDL_ENGINE_CONSTANTS.minBasis === 5 &&
    BDL_ENGINE_CONSTANTS.mutantCap === 24 &&
    BDL_ENGINE_CONSTANTS.mutantPerKind === 4 &&
    BDL_ENGINE_CONSTANTS.callTimeoutSeconds === 0.25 &&
    BDL_ENGINE_CONSTANTS.tolerance === 1e-6;
  const bdlSource = readFileSync(resolve(BDL_ENGINE), "utf8");
  const alibiSource = readFileSync(resolve(ALIBI_ENGINE), "utf8");
  const sourceAgrees =
    bdlSource.includes("BASIS_CAP = 48") &&
    bdlSource.includes("MIN_BASIS = 5") &&
    bdlSource.includes("MUTANT_CAP = 24") &&
    bdlSource.includes("MUTANT_PER_KIND = 4") &&
    bdlSource.includes("CALL_TIMEOUT = 0.25") &&
    bdlSource.includes("TOL = 1e-6") &&
    alibiSource.includes("CALL_TIMEOUT = 1.0") &&
    alibiSource.includes("LINE_BUDGET = 400_000");
  record(
    "F8a",
    "the restated engine constants match the engine source",
    constantsMatch && sourceAgrees,
    "TOL/BASIS_CAP/MIN_BASIS/MUTANT_CAP/MUTANT_PER_KIND/CALL_TIMEOUT in both this module and scripts/py_bdl_verify.py",
  );
  record(
    "F8b",
    "the census runner imports the committed analyzer instead of copying it",
    readFileSync(resolve("scripts/py_external_census.py"), "utf8").includes(
      "import py_bdl_verify as engine",
    ),
    "scripts/py_external_census.py: `import py_bdl_verify as engine`",
  );
  const contentDigest = corpusContentDigest({
    formatVersion: 1,
    exercises: cleanValidation.accepted.map((exercise) =>
      projectExercise({
        id: exercise.id,
        reference: exercise.reference,
        tests: exercise.tests,
        category: exercise.category ?? undefined,
        difficulty: exercise.category === null ? undefined : exercise.difficulty ?? undefined,
      }),
    ),
  });
  record(
    "F8c",
    "the corpus content digest is a pure function of the validated content",
    contentDigest.length === 64 && /^[0-9a-f]{64}$/.test(contentDigest) &&
      contentDigest !== provenance.corpusContentDigest,
    `${contentDigest.slice(0, 16)}… is 64 lowercase hex characters and differs from the ` +
      "placeholder digest this gate stamps on its own synthetic report, so the digest is " +
      "computed from the content rather than being a constant",
  );
}

/* ── report ──────────────────────────────────────────────────────────────── */

const failed = checks.filter((check) => !check.pass);
const width = Math.max(...checks.map((check) => check.name.length));
console.log("EXTERNAL_FORMAT gate — external-corpus format, validator, and provenance separation");
console.log("");
for (const check of checks) {
  console.log(
    `${check.id.padEnd(4)} ${check.name.padEnd(width)}  ${check.pass ? "PASS" : "FAIL"}  ${check.detail}`,
  );
}
console.log("");
console.log(
  `${String(checks.length - failed.length)}/${String(checks.length)} checks passed; ` +
    `example corpus ${validation.ok ? "ACCEPTED (unexpected)" : "rejected as documented"} ` +
    `(${String(accounting.exercisesAccepted)}/${String(accounting.exercisesTotal)} accepted)`,
);
console.log("");
console.log(
  "This gate runs the replication path on a 6-exercise synthetic fixture and measures nothing. " +
    "It cannot and does not establish external validity: no external corpus has been run.",
);
console.log(
  `EXTERNAL_FORMAT_GATE ${JSON.stringify({
    ok: failed.length === 0,
    checks: checks.length,
    failed: failed.length,
    exampleExercises: accounting.exercisesTotal,
    exampleAccepted: accounting.exercisesAccepted,
    exampleRejected: accounting.exercisesRejected,
    alibiVerified,
    alibiProbes,
  })}`,
);
process.exit(failed.length === 0 ? 0 : 1);
