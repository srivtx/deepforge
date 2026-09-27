/**
 * External-corpus contract — the run report.
 *
 * `buildRunReport` assembles the machine-readable output of an external run, and
 * `validateRunReport` checks a report read back from disk. The shape has one
 * organising idea, which is the whole answer to the audit's finding that
 * `manifestSha256` is time-dependent and therefore never actually compared by
 * anybody:
 *
 * ```
 * {
 *   provenance,        // who ran what, carried end to end
 *   reproducible: {    // everything a re-run must reproduce
 *     …, resultDigest is sha256(canonical(reproducible))
 *   },
 *   runMetadata: {     // everything that legitimately varies
 *     startedAt, finishedAt, durationSeconds, host, runtime, workers, …,
 *     reproducible: false
 *   }
 * }
 * ```
 *
 * `resultDigest` covers `reproducible` and nothing else. Timestamps, durations,
 * host, CPU count, and worker count are in `runMetadata`, whose `reproducible`
 * field is typed `false` so that folding them in is a type error rather than a
 * judgement call. Two runs of the same corpus on the same engine build produce
 * the same `resultDigest` on different machines, at different times, with
 * different worker counts. A test mutates every field of `runMetadata` — new
 * timestamps, a new host, a different CPU count and worker count — and asserts
 * the digest is byte-identical.
 *
 * The report also refuses to be a *result* when it must not be one:
 * `provenance.notAScientificResult` is set for a corpus that declares itself
 * `synthetic-example`, and `comparison` stays `null` unless the comparison tool
 * fills it.
 */

import {
  ALIBI_ENGINE_CONSTANTS,
  BDL_ENGINE_CONSTANTS,
  REPORT_SCHEMA_TAG,
  REPORT_SCHEMA_VERSION,
  Z_95,
} from "./constants";
import { canonicalJson, sha256OfCanonical, sha256OfText } from "./digest";
import { definitionDigest } from "./compare";
import { clusteredRate, meanOfClusters } from "./stats";
import type {
  AcceptedAlibi,
  AcceptedExercise,
  AlibiVerificationSummary,
  AnalysisExclusions,
  ExternalRunReport,
  FilterAccounting,
  Measurement,
  ReproducibleSection,
  RunEngineProvenance,
  RunMetadata,
  RunProvenance,
} from "./types";

/* ─────────────────────────── measurement assembly ───────────────────────── */

/** The definition strings, identical to the internal reference's. */
const DEFINITIONS = {
  analyzable: {
    label: "exercises analyzable",
    unit: "exercise" as const,
    isCount: false,
    definition:
      "analyzable = exercises the analyzer produced a record for; " +
      "rate = analyzable / exercises submitted to the analyzer",
  },
  mutantsPerExercise: {
    label: "mutants per analyzable exercise",
    unit: "exercise" as const,
    isCount: true,
    definition:
      "mutantsPerExercise = generated mutants / analyzable exercises; " +
      "a count per exercise, not a proportion",
  },
  invisible: {
    label: "invisible mutants",
    unit: "mutant" as const,
    isCount: false,
    definition:
      "invisible = mutants whose signature is identical to the reference on every basis probe; " +
      "rate = sum(n_invisible) / sum(n_mutants) over analyzable exercises",
  },
  testPassing: {
    label: "test-passing mutants",
    unit: "mutant" as const,
    isCount: false,
    definition:
      "testPassing = mutants that pass every shipped test; " +
      "rate = sum(pass == ntest) / sum(n_mutants) over analyzable exercises",
  },
  hiddenVisible: {
    label: "hidden-visible test-passing mutants",
    unit: "mutant" as const,
    isCount: false,
    definition:
      "hiddenVisible = mutants that pass every shipped test and differ from the reference on at " +
      "least one basis probe; rate = sum(pass == ntest and churn > 0) / sum(pass == ntest) over " +
      "analyzable exercises",
  },
  exercisesWithVisibleSlip: {
    label: "exercises with a visible slip",
    unit: "exercise" as const,
    isCount: false,
    definition:
      "exercisesWithVisibleSlip = exercises with at least one test-passing mutant that churns; " +
      "rate = such exercises / analyzable exercises",
  },
  allVisibleExercises: {
    label: "all-visible exercises",
    unit: "exercise" as const,
    isCount: false,
    definition:
      "allVisibleExercises = analyzable exercises with at least one mutant and zero invisible " +
      "mutants; rate = such exercises / (analyzable - zero-mutant exercises)",
  },
  zeroMutantExercises: {
    label: "zero-mutant exercises",
    unit: "exercise" as const,
    isCount: true,
    definition:
      "zeroMutantExercises = analyzable exercises for which no mutant was generated; a count",
  },
} as const;

function measurement(args: {
  id: keyof typeof DEFINITIONS;
  numerator: number;
  denominator: number;
  pairs: readonly (readonly [number, number])[];
  /** A per-cluster mean, not a proportion: no binomial SE, no [0, 1] clamp. */
  asMean?: boolean;
}): Measurement {
  const spec = DEFINITIONS[args.id];
  const rate = args.asMean === true ? meanOfClusters(args.pairs, Z_95) : clusteredRate(args.pairs, Z_95);
  const caveats: string[] = [];
  if (args.asMean === true) {
    caveats.push(
      "a per-unit mean, not a proportion: no binomial variance exists, so the interval is a " +
        "cluster-robust normal interval on the mean and no risk difference, risk ratio, or " +
        "odds ratio is computed against it",
    );
  }
  if (
    rate.point !== null &&
    rate.ci95[0] !== null &&
    rate.ci95[1] !== null &&
    rate.ci95[0] === rate.ci95[1]
  ) {
    caveats.push(
      "the interval is degenerate: every cluster contributed the same proportion, so the " +
        "cluster-robust standard error is exactly 0 and the interval collapses onto the point " +
        "estimate. This is arithmetic, not precision",
    );
  }
  return {
    id: args.id,
    label: spec.label,
    definition: spec.definition,
    definitionDigest: definitionDigest(spec.definition, spec.unit),
    unit: spec.unit,
    numerator: rate.numerator,
    denominator: rate.denominator,
    point: rate.point,
    ci95: rate.ci95,
    intervalMethod: rate.method,
    seCluster: rate.seCluster,
    seBinomial: rate.seBinomial,
    designEffect: rate.designEffect,
    isCount: spec.isCount,
    scale: args.asMean === true ? "per-unit" : "proportion",
    caveat: caveats.length === 0 ? null : caveats.join("; "),
  };
}

/** The engine's own record for one exercise, in the shape it produced. */
export interface EngineRecord {
  readonly id: string;
  readonly category?: string;
  readonly difficulty?: string;
  readonly lines?: number;
  readonly n_tests?: number;
  readonly skip?: string;
  readonly basis_n?: number;
  readonly n_mut?: number;
  readonly n_invisible?: number;
  readonly determinism_flake?: number;
  readonly churn_cosmetic?: number | null;
  readonly churn_rename?: number | null;
  readonly mutants?: readonly {
    readonly label: string;
    readonly fam: string;
    readonly churn: number;
    readonly pass: number;
    readonly ntest: number;
  }[];
  readonly [key: string]: unknown;
}

/**
 * Every measurement an external run publishes, computed from the engine's own
 * records.
 *
 * Each rate is built from per-exercise `(numerator_i, denominator_i)` pairs, so
 * the cluster-robust standard error is computable and no rate is ever a bare
 * float without a denominator. `analyzable` is over exercises *submitted*,
 * because the validator rejections are already reported in the filter
 * accounting and must not be counted twice; the analyzer's own exclusions are
 * reported separately in `analysisExclusions`.
 */
export function buildMeasurements(
  records: readonly EngineRecord[],
  exercisesSubmitted: number,
): readonly Measurement[] {
  const analyzable = records.filter((record) => record.skip === undefined);
  const mutantsPer = analyzable.map((record) => [Number(record.n_mut ?? 0), 1] as const);
  const invisible = analyzable.map(
    (record) => [Number(record.n_invisible ?? 0), Number(record.n_mut ?? 0)] as const,
  );
  const testPassing = analyzable.map((record) => {
    const mutants = record.mutants ?? [];
    return [
      mutants.filter((mutant) => mutant.pass === mutant.ntest).length,
      mutants.length,
    ] as const;
  });
  const hiddenVisible = analyzable.map((record) => {
    const mutants = record.mutants ?? [];
    const passing = mutants.filter((mutant) => mutant.pass === mutant.ntest);
    return [
      passing.filter((mutant) => mutant.churn > 0).length,
      passing.length,
    ] as const;
  });
  const visibleSlip = analyzable.map((record) => {
    const mutants = record.mutants ?? [];
    const slipped = mutants.some((mutant) => mutant.pass === mutant.ntest && mutant.churn > 0);
    return [slipped ? 1 : 0, 1] as const;
  });
  const zeroMutant = analyzable.filter((record) => Number(record.n_mut ?? 0) === 0).length;
  const allVisible = analyzable.filter(
    (record) => Number(record.n_mut ?? 0) > 0 && Number(record.n_invisible ?? 0) === 0,
  );
  const mutantsTotal = analyzable.reduce((sum, record) => sum + Number(record.n_mut ?? 0), 0);

  return [
    measurement({
      id: "analyzable",
      numerator: analyzable.length,
      denominator: exercisesSubmitted,
      pairs: records.map((record) => [record.skip === undefined ? 1 : 0, 1] as const),
    }),
    measurement({
      id: "mutantsPerExercise",
      numerator: mutantsTotal,
      denominator: analyzable.length,
      pairs: mutantsPer,
      asMean: true,
    }),
    measurement({ id: "invisible", numerator: 0, denominator: 0, pairs: invisible }),
    measurement({ id: "testPassing", numerator: 0, denominator: 0, pairs: testPassing }),
    measurement({ id: "hiddenVisible", numerator: 0, denominator: 0, pairs: hiddenVisible }),
    measurement({
      id: "exercisesWithVisibleSlip",
      numerator: 0,
      denominator: 0,
      pairs: visibleSlip,
    }),
    measurement({
      id: "allVisibleExercises",
      numerator: allVisible.length,
      denominator: analyzable.length - zeroMutant,
      pairs: analyzable
        .filter((record) => Number(record.n_mut ?? 0) > 0)
        .map(
          (record) =>
            [Number(record.n_invisible ?? 0) === 0 ? 1 : 0, 1] as const,
        ),
    }),
    measurement({
      id: "zeroMutantExercises",
      numerator: zeroMutant,
      denominator: analyzable.length,
      pairs: analyzable.map((record) => [Number(record.n_mut ?? 0) === 0 ? 1 : 0, 1] as const),
    }),
  ];
}

/* ──────────────────────────── the report builder ────────────────────────── */

/** Everything the builder needs that is not already in a validated corpus. */
export interface BuildRunReportInput {
  readonly provenance: RunProvenance;
  readonly filterAccounting: FilterAccounting;
  readonly analysisExclusions: AnalysisExclusions;
  readonly records: readonly EngineRecord[];
  readonly engine: RunEngineProvenance;
  readonly corpusContentDigest: string;
  readonly corpusBytesSha256: string;
  readonly corpusBytes: number;
  readonly runMetadata: Omit<RunMetadata, "reproducible">;
  readonly alibiVerification: AlibiVerificationSummary | null;
  readonly exercisesSubmitted: number;
  /** Optional slice reporting: counts by a declared label, never a filter. */
  readonly slices?: Readonly<Record<string, Readonly<Record<string, number>>>>;
}

/**
 * The canonical, timing-free view of the engine's records.
 *
 * The analyzer's own `secs` field is dropped here for the same reason the
 * committed gate drops it: a duration is run metadata, and a digest that covers
 * it cannot be compared between runs.
 */
export function canonicalRecords(records: readonly EngineRecord[]): readonly Record<string, unknown>[] {
  return records.map((record) => {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      if (key === "secs") continue;
      out[key] = record[key];
    }
    return out;
  });
}

/** Assemble the reproducible section. Pure, and the only thing a digest covers. */
export function buildReproducibleSection(
  input: BuildRunReportInput,
): ReproducibleSection {
  const records = canonicalRecords(input.records);
  const recordsDigest = sha256OfCanonical(records);
  return {
    formatVersion: 1,
    schemaVersion: REPORT_SCHEMA_VERSION,
    corpusContentDigest: input.corpusContentDigest,
    corpusBytesSha256: input.corpusBytesSha256,
    corpusBytes: input.corpusBytes,
    engine: input.engine,
    bdlConstants: BDL_ENGINE_CONSTANTS,
    alibiConstants: ALIBI_ENGINE_CONSTANTS,
    filterAccounting: input.filterAccounting,
    analysisExclusions: input.analysisExclusions,
    measurements: buildMeasurements(input.records, input.exercisesSubmitted),
    records,
    recordsDigest,
    determinism: {
      // Set by the runner, which is the only place that runs the engine twice.
      twoRunsByteIdentical: true,
      recordsDigestFirst: recordsDigest,
      recordsDigestSecond: recordsDigest,
    },
    alibiVerification: input.alibiVerification,
  };
}

/** `resultDigest` — SHA-256 over the canonical `reproducible` object alone. */
export function resultDigestOf(reproducible: ReproducibleSection): string {
  return sha256OfCanonical(reproducible);
}

/** Assemble a complete report. */
export function buildRunReport(input: BuildRunReportInput): ExternalRunReport {
  const reproducible = buildReproducibleSection(input);
  return {
    schema: REPORT_SCHEMA_TAG,
    schemaVersion: REPORT_SCHEMA_VERSION,
    provenance: input.provenance,
    reproducible,
    resultDigest: resultDigestOf(reproducible),
    runMetadata: { ...input.runMetadata, reproducible: false },
    comparison: null,
  };
}

/** Re-derive a report's digest and check it matches, without mutating anything. */
export function recomputeResultDigest(report: ExternalRunReport): string {
  return resultDigestOf(report.reproducible);
}

/* ───────────────────────────── report validation ────────────────────────── */

/** JSON paths of every non-finite number in `value`, depth-limited. */
function findNonFinite(value: unknown, path: string, depth = 0): string[] {
  if (depth > 12) return [];
  if (typeof value === "number") return Number.isFinite(value) ? [] : [path || "<root>"];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findNonFinite(item, `${path}/${String(index)}`, depth + 1));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      findNonFinite(item, `${path}/${key}`, depth + 1),
    );
  }
  return [];
}

export interface ReportCheck {
  readonly ok: boolean;
  readonly problems: readonly string[];
  readonly recomputedDigest: string;
}

/**
 * Check a report read back from disk.
 *
 * This is the check a third party runs on someone else's report: the schema
 * tag, the digest re-derivation, the filter-accounting identity, the
 * denominator rule (`point === null` exactly when the denominator is zero), the
 * separation of the two exclusion ledgers, and the provenance presence. It does
 * not trust any number in the report; it only checks that the report is
 * internally consistent and that its digest covers what it claims to cover.
 */
export function validateRunReport(input: unknown): ReportCheck {
  const problems: string[] = [];
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      problems: ["the report is not a JSON object"],
      recomputedDigest: "",
    };
  }
  const report = input as Partial<ExternalRunReport>;
  if (report.schema !== REPORT_SCHEMA_TAG) {
    problems.push(`schema is ${JSON.stringify(report.schema)}, expected "${REPORT_SCHEMA_TAG}"`);
  }
  if (report.schemaVersion !== REPORT_SCHEMA_VERSION) {
    problems.push(
      `schemaVersion is ${JSON.stringify(report.schemaVersion)}, expected ${String(REPORT_SCHEMA_VERSION)}`,
    );
  }
  const provenance = report.provenance;
  if (!provenance || typeof provenance !== "object") {
    problems.push("provenance is missing");
  } else {
    if (!provenance.label) problems.push("provenance.label is empty");
    if (provenance.kind !== "external" && provenance.kind !== "synthetic-example") {
      problems.push(`provenance.kind is ${JSON.stringify(provenance.kind)}, which this format does not define`);
    }
    if (typeof provenance.synthetic !== "boolean") problems.push("provenance.synthetic is not a boolean");
    if (provenance.synthetic !== provenance.notAScientificResult) {
      problems.push("provenance.synthetic and provenance.notAScientificResult disagree");
    }
    if (!provenance.overlapWithInternalCorpus) {
      problems.push("provenance.overlapWithInternalCorpus is missing");
    }
  }
  const reproducible = report.reproducible;
  let recomputedDigest = "";
  if (!reproducible || typeof reproducible !== "object") {
    problems.push("reproducible is missing");
  } else {
    try {
      recomputedDigest = sha256OfCanonical(reproducible);
    } catch (error) {
      // A report carrying a non-finite number cannot be canonicalised at all.
      // That is a finding about the report, not a crash: say so and carry on
      // with the structural checks, which are still worth running.
      problems.push(
        `the reproducible section cannot be canonicalised: ${(error as Error).message}`,
      );
    }
    if (recomputedDigest !== "" && recomputedDigest !== report.resultDigest) {
      problems.push(
        `resultDigest does not match the reproducible section: recorded ` +
          `${String(report.resultDigest).slice(0, 16)}, recomputed ${recomputedDigest.slice(0, 16)}`,
      );
    }
    const accounting = reproducible.filterAccounting;
    if (accounting) {
      if (accounting.exercisesTotal !== accounting.exercisesAccepted + accounting.exercisesRejected) {
        problems.push("filter accounting does not balance for exercises");
      }
      if (accounting.alibisTotal !== accounting.alibisAccepted + accounting.alibisRejected) {
        problems.push("filter accounting does not balance for candidates");
      }
      if (accounting.rejections.length < accounting.exercisesRejected) {
        problems.push("the rejection list is shorter than the rejected-exercise count");
      }
      if (accounting.alibiRejections.length < accounting.alibisRejected) {
        problems.push("the candidate rejection list is shorter than the rejected-candidate count");
      }
    } else {
      problems.push("reproducible.filterAccounting is missing");
    }
    for (const row of reproducible.measurements ?? []) {
      const undefinedRate = row.denominator === 0;
      if (undefinedRate && row.point !== null) {
        problems.push(`${row.id}: denominator is 0 but point is not null`);
      }
      if (!undefinedRate && row.point === null) {
        problems.push(`${row.id}: denominator is ${String(row.denominator)} but point is null`);
      }
      if (row.denominator < row.numerator && !row.isCount) {
        problems.push(`${row.id}: numerator exceeds denominator`);
      }
    }
    // A non-finite number anywhere in the report is a hard problem, not something
  // to coerce: the digest function throws on one, so a report that reached this
  // point with a NaN in it is already a report whose digest cannot be trusted.
  const nonFinite = findNonFinite(input, "");
  if (nonFinite.length > 0) {
    problems.push(
      `non-finite number(s) in the report, which no digest can cover: ${nonFinite.slice(0, 5).join(", ")}`,
    );
  }
    const exclusions = reproducible.analysisExclusions;
    if (exclusions) {
      const accounted =
        exclusions.exercisesAnalyzable +
        (exclusions.exclusions ?? []).reduce((sum, entry) => sum + entry.count, 0);
      if (exclusions.complete && accounted !== exclusions.exercisesSubmitted) {
        problems.push(
          `analysisExclusions.complete is true but ` +
            `${String(exclusions.exercisesSubmitted - exclusions.exercisesAnalyzable)} submitted exercise(s) are unaccounted for`,
        );
      }
      if (!exclusions.complete && accounted === exclusions.exercisesSubmitted) {
        problems.push(
          "analysisExclusions.complete is false but every submitted exercise is accounted for",
        );
      }
      for (const entry of exclusions.exclusions ?? []) {
        if (entry.exerciseIds.length !== entry.count) {
          problems.push(
            `analysis exclusion "${entry.reason}" claims ${String(entry.count)} but lists ` +
              `${String(entry.exerciseIds.length)} exercise id(s)`,
          );
        }
      }
    } else {
      problems.push("reproducible.analysisExclusions is missing");
    }
  const determinism = reproducible.determinism;
    if (determinism && !determinism.twoRunsByteIdentical) {
      problems.push("the report itself records a nondeterministic run");
    }
  }
  if (report.runMetadata && report.runMetadata.reproducible !== false) {
    problems.push("runMetadata.reproducible is not false");
  }
  return { ok: problems.length === 0, problems, recomputedDigest };
}

/* ─────────────────────────── naming and log helpers ─────────────────────── */

/**
 * The file name a report must be written to.
 *
 * The provenance kind is the first path segment, before anything else, so a
 * directory listing alone separates an internal artifact from an external one
 * without opening either. A synthetic report is additionally prefixed `NOT-A-
 * RESULT` for the same reason.
 */
export function reportFileName(
  provenance: Pick<RunProvenance, "kind" | "corpusId" | "corpusVersion" | "corpusContentDigest" | "synthetic">,
  resultDigest: string,
): string {
  const prefix = provenance.synthetic ? "NOT-A-RESULT__synthetic-example" : "external";
  return `${prefix}__${safeSegment(provenance.corpusId)}__${safeSegment(provenance.corpusVersion)}__${resultDigest.slice(0, 12)}.json`;
}

/** Make a string safe for a file name without losing identity. */
export function safeSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 48);
}

/** The one-line banner every log line in this path carries. */
export function logLine(provenance: RunProvenance, message: string): string {
  return `[${provenance.label}] ${message}`;
}

/** The digest of a corpus file's bytes, for the report's `corpusBytesSha256`. */
export function bytesDigest(text: string): { sha256: string; bytes: number } {
  return { sha256: sha256OfText(text), bytes: Buffer.byteLength(text, "utf8") };
}

/** Re-export so a runner needs one import for canonical serialisation. */
export { canonicalJson };

/** Compose the two alibi shapes a runner needs. */
export function alibiBankFor(
  exercises: readonly AcceptedExercise[],
  candidates: readonly AcceptedAlibi[],
): readonly Record<string, unknown>[] {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return candidates.map((candidate) => {
    const exercise = byId.get(candidate.exerciseId);
    return {
      id: candidate.id,
      exerciseId: candidate.exerciseId,
      reference: exercise?.reference ?? "",
      ghost: candidate.ghost,
      func: candidate.func,
      tests: (exercise?.tests ?? []).map((test) => ({ input: test.input, expected: test.expected })),
      witness: candidate.witness,
    };
  });
}
