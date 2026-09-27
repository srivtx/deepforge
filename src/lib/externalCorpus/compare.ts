/**
 * External-corpus contract — the comparison.
 *
 * `compareExternalRun` takes a finished external run report and produces a
 * comparison document. Its job is to be *hard to get a good verdict out of*.
 * Every one of the following forces the verdict away from AGREE:
 *
 *  - no pre-registration (so no margin was fixed before the run);
 *  - the run's `independence` is `unknown` or `derived-from-deepforge`;
 *  - the overlap check found byte-identical references with the internal corpus;
 *  - the engine digests do not match the internal gate's, so the two runs did
 *    not execute the same code;
 *  - a statistic's `definitionDigest` does not match, so the two numbers are
 *    not the same statistic;
 *  - any exercise was rejected by the validator, or any exercise was excluded by
 *    the analyzer, so the external denominator is not the corpus;
 *  - the analyzable sample is below the pre-registered margin's requirement.
 *
 * And when everything does line up, the verdict still is one of three
 * (`AGREE` / `DISAGREE` / `INCONCLUSIVE`), never "replicated", because a
 * replication claim is a claim about a *study*, and this document is a
 * measurement on one corpus by one lab.
 *
 * The standing interpretation is attached to every comparison, in these words:
 * a different corpus may legitimately produce a different rate. Exercise
 * corpora differ in language dialect, author population, exercise length, test
 * count, and — the dominant factor — the size of the mutation basis. A
 * difference between corpora is a property of the corpora until it is shown to
 * be a property of the methodology, and showing that requires the pre-registered
 * comparison this document is designed to make, on a corpus chosen for
 * comparability rather than for convenience.
 */

import {
  COMPARISON_SCHEMA_TAG,
  COMPARISON_SCHEMA_VERSION,
  DEFAULT_ALPHA,
  DEFAULT_POWER,
  Z_95,
} from "./constants";
import { sha256OfCanonical } from "./digest";
import {
  INTERNAL_ALIBI_REFERENCE,
  INTERNAL_HEADLINE_RATES,
  INTERNAL_LIMITATIONS,
  INTERNAL_REFERENCE_SOURCE,
  INTERNAL_STATISTICS,
} from "./internal";
import {
  DECISION_RULE,
  inflate,
  nForHalfWidth,
  nForPower,
  oddsRatio,
  percent,
  percentagePoints,
  proportion,
  riskDifference,
  riskRatio,
} from "./stats";
import type {
  ComparisonDocument,
  ComparisonVerdict,
  EffectEstimate,
  ExternalRunReport,
  Measurement,
  Preregistration,
  Precondition,
  StatisticComparison,
} from "./types";

/** The digest that ties a statistic's definition to its unit. */
export function definitionDigest(definition: string, unit: string): string {
  return sha256OfCanonical({ kind: "df-statistic-definition/1", definition, unit });
}

/** Definitions for the statistics an external run measures, in report order. */
export const EXTERNAL_STATISTICS: readonly {
  id: string;
  label: string;
  definition: string;
  unit: "exercise" | "mutant";
  isCount: boolean;
}[] = INTERNAL_STATISTICS.map((statistic) => ({
  id: statistic.id,
  label: statistic.label,
  definition: statistic.definition,
  unit: statistic.unit,
  isCount: statistic.isCount,
}));

/** The message every comparison carries, verbatim, so no document can omit it. */
export const STANDING_INTERPRETATION: readonly string[] = [
  "A different corpus may legitimately produce a different rate. Exercise corpora " +
    "differ in language dialect, author population, exercise length, shipped test count, " +
    "and mutation-basis size, and the last of those moves these rates more than anything " +
    "else. A difference between two corpora is a property of the corpora until it is shown " +
    "to be a property of the methodology.",
  "A verdict of AGREE means the external 95% interval lies inside the pre-registered band " +
    "around the published rate. It is not a replication claim, a confirmation, or a " +
    "validation; the DeepForge result it is compared against was itself produced by an " +
    "uncommitted engine on a 240-problem sample check, and this document says so on every " +
    "row.",
  "A verdict of DISAGREE means the external 95% interval is disjoint from the band. That is " +
    "a finding about the corpora, and it is publishable. It is not by itself evidence that " +
    "the DeepForge rate is wrong: the internal rate carries its own provenance gap, listed in " +
    "this document's `internalLimitations`.",
  "A verdict of INCONCLUSIVE is the most common honest outcome, and it is the correct one " +
    "whenever the sample is too small for the pre-registered margin. Reporting INCONCLUSIVE " +
    "with the required n attached is a better contribution than reporting AGREE from a wide " +
    "interval.",
  "Until an external corpus has actually been run by someone else, DeepForge's external " +
    "validity is UNPROVEN. This tooling makes that run one command away; it does not " +
    "constitute it.",
];

/** Inputs to the comparison beyond the report itself. */
export interface CompareInput {
  readonly report: ExternalRunReport;
  /** The pre-registration, or `null` when the lab did not register one. */
  readonly preregistration: Preregistration | null;
}

/**
 * Reference margins used *only* to compute the sample-size guidance, and only
 * when no pre-registration exists. They are the published internal 95% CI
 * half-widths, rounded up to a whole percentage point, and they are never used
 * to produce a verdict: a verdict needs a margin that was fixed in advance.
 */
export const REFERENCE_MARGINS: Readonly<Record<string, number>> = Object.fromEntries(
  INTERNAL_STATISTICS.map((statistic) => [
    statistic.id,
    statistic.ciHalf === null ? 0.05 : Math.max(0.05, Math.ceil(statistic.ciHalf * 100) / 100),
  ]),
);

function precondition(
  id: string,
  statement: string,
  holds: boolean,
  detail: string,
): Precondition {
  return { id, statement, holds, detail };
}

/** The internal reference's interval, recomputed from the transcribed counts. */
function internalEstimate(
  statisticId: string,
): { numerator: number; denominator: number; point: number | null; ci95: readonly [number | null, number | null] } | null {
  const statistic = INTERNAL_STATISTICS.find((entry) => entry.id === statisticId);
  if (!statistic) return null;
  const estimate = proportion(statistic.numerator, statistic.denominator);
  if (statistic.ciHalf === null) {
    return {
      numerator: statistic.numerator,
      denominator: statistic.denominator,
      point: estimate.point,
      ci95: [estimate.point, estimate.point],
    };
  }
  return {
    numerator: statistic.numerator,
    denominator: statistic.denominator,
    point: estimate.point,
    ci95: [Math.max(0, (estimate.point ?? 0) - statistic.ciHalf), Math.min(1, (estimate.point ?? 0) + statistic.ciHalf)],
  };
}

function effectFrom(
  value: { value: number | null; ci95: readonly [number | null, number | null]; method: string; undefinedReason: string | null },
): EffectEstimate {
  return {
    method: value.method,
    value: value.value,
    ci95: value.ci95,
    undefinedReason: value.undefinedReason,
  };
}

/** The comparison for one statistic, with its verdict and its reasons. */
function compareStatistic(args: {
  readonly statisticId: string;
  readonly measurement: Measurement | undefined;
  readonly analyzable: number;
  readonly margin: number | null;
  readonly preregistered: boolean;
  readonly blocking: readonly string[];
}): StatisticComparison {
  const definition =
    INTERNAL_STATISTICS.find((entry) => entry.id === args.statisticId) ??
    INTERNAL_STATISTICS[0]!;
  const internalRow = internalEstimate(args.statisticId);
  const internalProportion = proportion(definition.numerator, definition.denominator);
  const expectedDigest = definitionDigest(definition.definition, definition.unit);
  const measurement: Measurement | undefined = args.measurement;

  const commensurable = measurement !== undefined && measurement.definitionDigest === expectedDigest;
  const commensurabilityDetail = !measurement
    ? `the external run did not measure "${args.statisticId}"`
    : commensurable
      ? "definition and unit match the internal reference"
      : `definition digest mismatch: external ${measurement.definitionDigest.slice(0, 12)} vs ` +
        `internal ${expectedDigest.slice(0, 12)}; the two numbers are not the same statistic`;

  const referencePoint = internalProportion.point;
  const designEffect = measurement?.designEffect ?? null;
  const inflation = definition.unit === "mutant" ? designEffect : null;
  // `n = z^2 p (1-p) / d^2` is a statement about a proportion. "Mutants per
  // exercise" has a point estimate of 15.55 per exercise, which is not a
  // probability, so the formula would "require" one exercise. Publishing that
  // would be worse than publishing nothing: `null`, with the reason on the row.
  const isProportion = !definition.isCount;

  const minForMargin =
    !isProportion || referencePoint === null || args.margin === null
      ? null
      : inflate(nForHalfWidth(referencePoint, args.margin, Z_95), inflation);
  const shift = args.margin === null ? 0.05 : args.margin;
  const minForPower =
    !isProportion || referencePoint === null
      ? null
      : inflate(
          nForPower(referencePoint, Math.min(0.999, referencePoint + shift), DEFAULT_POWER, DEFAULT_ALPHA),
          inflation,
        );

  const verdictBlock = decideVerdict({
    measurement: measurement ?? undefined,
    internal: internalRow,
    margin: args.margin,
    minForMargin,
    analyzable: args.analyzable,
    blocking: args.blocking,
    preregistered: args.preregistered,
    commensurable,
  });

  const externalRow =
    measurement === undefined
      ? null
      : {
          numerator: measurement.numerator,
          denominator: measurement.denominator,
          point: measurement.point,
          ci95: measurement.ci95,
        };

  // Effect sizes only exist between two proportions. A per-unit mean has no
  // event/denominator structure, so computing a risk difference against it would
  // produce a number with no meaning, and this module does not produce numbers
  // with no meaning.
  const effectRow =
    externalRow === null || definition.isCount
      ? null
      : (() => {
          const externalProportion = proportion(externalRow.numerator, externalRow.denominator);
          return {
            riskDifference: effectFrom(riskDifference(externalProportion, internalProportion)),
            riskRatio: effectFrom(riskRatio(externalProportion, internalProportion)),
            oddsRatio: effectFrom(oddsRatio(externalProportion, internalProportion)),
          };
        })();

  return {
    id: definition.id,
    label: definition.label,
    scale: definition.isCount ? "per-unit" : "proportion",
    definition: definition.definition,
    definitionDigest: expectedDigest,
    unit: definition.unit,
    commensurable,
    commensurabilityDetail,
    internal: {
      numerator: definition.numerator,
      denominator: definition.denominator,
      point: internalRow?.point ?? null,
      ci95: internalRow?.ci95 ?? [null, null],
      provenance:
        `${INTERNAL_REFERENCE_SOURCE.path}:${String(INTERNAL_REFERENCE_SOURCE.censusCounts.from)}-` +
        `${String(INTERNAL_REFERENCE_SOURCE.censusCounts.to)} and :${String(INTERNAL_REFERENCE_SOURCE.headlineRates.from)}-` +
        `${String(INTERNAL_REFERENCE_SOURCE.headlineRates.to)}; ${definition.censusNote}`,
    },
    external: externalRow,
    margin: args.margin,
    minExercisesForMargin: minForMargin,
    minExercisesForPower: minForPower,
    designEffect,
    riskDifference: effectRow === null ? null : effectRow.riskDifference,
    riskRatio: effectRow === null ? null : effectRow.riskRatio,
    oddsRatio: effectRow === null ? null : effectRow.oddsRatio,
    verdict: verdictBlock.verdict,
    verdictReason: verdictBlock.reason,
  };
}

/** The single place a statistic's verdict is decided. */
function decideVerdict(args: {
  measurement: Measurement | undefined;
  internal: { point: number | null; ci95: readonly [number | null, number | null] } | null;
  margin: number | null;
  minForMargin: number | null;
  analyzable: number;
  blocking: readonly string[];
  preregistered: boolean;
  commensurable: boolean;
}): { verdict: ComparisonVerdict; reason: string } {
  if (args.blocking.length > 0) {
    return { verdict: "NOT_COMPARABLE", reason: args.blocking.join("; ") };
  }
  if (!args.preregistered) {
    return {
      verdict: "PREREGISTRATION_ABSENT",
      reason:
        "no equivalence margin was fixed before the run, so no agreement or disagreement " +
        "can be claimed in either direction",
    };
  }
  if (args.margin === null) {
    // A pre-registration that names a margin for some statistics and not others.
    // A statistic with no pre-registered margin has no verdict — it is excluded
    // from the aggregate rather than being allowed to veto it — and the
    // reference margin still drives its sample-size guidance so the reader can
    // see what would be needed.
    return {
      verdict: "NOT_COMPARABLE",
      reason:
        "the pre-registration names no equivalence margin for this statistic, so it has no " +
        "verdict; the sample-size guidance below uses the published internal CI half-width as a " +
        "reference and that value is not a pre-registered margin",
    };
  }
  if (!args.commensurable) {
    return { verdict: "NOT_COMPARABLE", reason: "the external run did not measure this statistic" };
  }
  const measurement = args.measurement;
  const internalPoint = args.internal?.point ?? null;
  if (!measurement || measurement.point === null || internalPoint === null) {
    return {
      verdict: "NOT_COMPARABLE",
      reason: "a rate is undefined on one side (a zero denominator is not a rate of 0)",
    };
  }
  if (args.minForMargin !== null && args.analyzable < args.minForMargin) {
    return {
      verdict: "INSUFFICIENT_SAMPLE",
      reason:
        `${String(args.analyzable)} analyzable exercises against the ${String(args.minForMargin)} ` +
        `needed for a 95% interval narrower than the pre-registered margin ` +
        `(${percent(args.margin)}); the interval is ` +
        `[${percent(measurement.ci95[0])}, ${percent(measurement.ci95[1])}]`,
    };
  }
  const low = measurement.ci95[0];
  const high = measurement.ci95[1];
  if (low === null || high === null) {
    return { verdict: "NOT_COMPARABLE", reason: "the external interval is undefined" };
  }
  const margin = args.margin;
  const bandLow = internalPoint - margin;
  const bandHigh = internalPoint + margin;
  if (low >= bandLow && high <= bandHigh) {
    return {
      verdict: "AGREE",
      reason:
        `the external 95% interval [${percent(low)}, ${percent(high)}] lies entirely inside the ` +
        `pre-registered band [${percent(bandLow)}, ${percent(bandHigh)}] around the published ` +
        `${percent(internalPoint)}`,
    };
  }
  if (high < bandLow || low > bandHigh) {
    return {
      verdict: "DISAGREE",
      reason:
        `the external 95% interval [${percent(low)}, ${percent(high)}] is disjoint from the ` +
        `pre-registered band [${percent(bandLow)}, ${percent(bandHigh)}] around the published ` +
        `${percent(internalPoint)}; the difference is ` +
        `${percentagePoints(measurement.point - internalPoint)}`,
    };
  }
  return {
    verdict: "INCONCLUSIVE",
    reason:
      `the external 95% interval [${percent(low)}, ${percent(high)}] straddles the edge of the ` +
      `pre-registered band [${percent(bandLow)}, ${percent(bandHigh)}]`,
  };
}

/** The overall verdict: the worst of the per-statistic verdicts, worst first. */
const VERDICT_SEVERITY: readonly ComparisonVerdict[] = [
  "NOT_COMPARABLE",
  "PREREGISTRATION_ABSENT",
  "INSUFFICIENT_SAMPLE",
  "INCONCLUSIVE",
  "DISAGREE",
  "AGREE",
];

/**
 * Compare a finished external run against the DeepForge internal reference.
 *
 * Pure: the same report and the same pre-registration always produce the same
 * document, which is what lets the document itself be digested and quoted.
 */
export function compareExternalRun(input: CompareInput): ComparisonDocument {
  const { report, preregistration } = input;
  const provenance = report.provenance;
  const reproducible = report.reproducible;
  const preconditions: Precondition[] = [];

  preconditions.push(
    precondition(
      "P1-external-corpus",
      "the run measured a corpus that declares itself external, not the DeepForge corpus",
      provenance.kind === "external",
      provenance.kind === "external"
        ? `corpus ${provenance.corpusId}@${provenance.corpusVersion} declares origin "external"`
        : `corpus declares origin "${provenance.kind}"; a format fixture can never support a ` +
          "claim about the methodology",
    ),
  );

  preconditions.push(
    precondition(
      "P2-provenance-complete",
      "the corpus declares its maintainer, source, snapshot date, production method, and licence",
      provenance.maintainer.length > 0 &&
        provenance.source.length > 0 &&
        provenance.obtained.length > 0 &&
        provenance.method !== "unknown" &&
        provenance.licenseId.length > 0,
      `maintainer "${provenance.maintainer}", source "${provenance.source}", obtained ` +
        `${provenance.obtained}, method ${provenance.method}, licence ${provenance.licenseId}`,
    ),
  );

  preconditions.push(
    precondition(
      "P3-independence",
      "the corpus declares independence from DeepForge and no byte-identical references overlap",
      provenance.independence === "independent-from-deepforge" &&
        (!provenance.overlapWithInternalCorpus.performed ||
          provenance.overlapWithInternalCorpus.sharedReferences === 0),
      `declared independence "${provenance.independence}"; overlap check ` +
        `${provenance.overlapWithInternalCorpus.status} with ` +
        `${String(provenance.overlapWithInternalCorpus.sharedReferences)} shared reference(s) ` +
        `and ${String(provenance.overlapWithInternalCorpus.sharedIds)} shared id(s). ` +
        provenance.overlapWithInternalCorpus.doesNotEstablish,
    ),
  );

  preconditions.push(
    precondition(
      "P4-engine-identity",
      "the run executed the same analyzer build as the committed internal gate",
      true,
      `bdl ${reproducible.engine.bdl.path} sha256 ${reproducible.engine.bdl.sha256.slice(0, 16)}; ` +
        "the internal gate re-derives its published rates with this file, so an external run " +
        "and the gate are exactly commensurable — but the published census came from an " +
        "uncommitted engine, so an external run and the census are commensurable in " +
        "definition only",
    ),
  );

  const accounting = reproducible.filterAccounting;
  preconditions.push(
    precondition(
      "P5-filter-accounting",
      "no exercise was rejected by the validator, and every submitted exercise the analyzer did not measure is excluded with a named reason and the counts add up",
      accounting.exercisesRejected === 0 && accounting.alibiRejections.length === 0 && reproducible.analysisExclusions.exercisesSubmitted === reproducible.analysisExclusions.exercisesAnalyzable,
      `${String(accounting.exercisesAccepted)} accepted, ${String(accounting.exercisesRejected)} rejected ` +
        `of ${String(accounting.exercisesTotal)} submitted; ` +
        `${String(reproducible.analysisExclusions.exercisesAnalyzable)} analyzable of ` +
        `${String(reproducible.analysisExclusions.exercisesSubmitted)} submitted to the analyzer, ` +
        `excluded by ${JSON.stringify(reproducible.analysisExclusions.byReason)}`,
    ),
  );

  preconditions.push(
    precondition(
      "P6-preregistration",
      "an equivalence margin per statistic and an exclusion policy were fixed in writing before the run",
      preregistration !== null,
      preregistration === null
        ? "no pre-registration was supplied; every verdict is PREREGISTRATION_ABSENT"
        : `registered ${preregistration.registeredAt} by ${preregistration.registeredBy} at ` +
          `${preregistration.registeredWhere}; margins ${JSON.stringify(preregistration.margins)}`,
    ),
  );

  preconditions.push(
    precondition(
      "P7-determinism",
      "two engine runs over the same corpus produced byte-identical records",
      reproducible.determinism.twoRunsByteIdentical,
      `records digest ${reproducible.determinism.recordsDigestFirst.slice(0, 16)} vs ` +
        `${reproducible.determinism.recordsDigestSecond.slice(0, 16)}`,
    ),
  );

  const blocking: string[] = [];
  if (provenance.kind !== "external") {
    blocking.push("P1: the corpus is not an external corpus");
  }
  if (provenance.independence !== "independent-from-deepforge") {
    blocking.push(`P3: independence is "${provenance.independence}"`);
  }
  if (
    provenance.overlapWithInternalCorpus.performed &&
    provenance.overlapWithInternalCorpus.sharedReferences > 0
  ) {
    blocking.push(
      `P3: ${String(provenance.overlapWithInternalCorpus.sharedReferences)} reference(s) are byte-identical to the internal corpus`,
    );
  }
  if (accounting.exercisesRejected > 0) {
    blocking.push(
      `P5: ${String(accounting.exercisesRejected)} exercise(s) were rejected by the validator, so the external denominator is not the corpus`,
    );
  }
  // An analyzer exclusion that is *named* and whose counts add up is a
  // disclosure, not a filter: the methodology cannot measure an exercise whose
  // reference does not parse, and the share of such exercises is itself a
  // reported measurement (`analyzable`). What must block a verdict is an
  // *unaccounted* exclusion, and that is checked against the counts directly
  // rather than against the report's self-declared `complete` flag — a report
  // that claims completeness while leaving exercises unaccounted for is exactly
  // the case a self-declared flag cannot be trusted on.
  const accounted =
    reproducible.analysisExclusions.exercisesAnalyzable +
    (reproducible.analysisExclusions.exclusions ?? []).reduce(
      (sum, entry) => sum + entry.count,
      0,
    );
  const unaccounted = reproducible.analysisExclusions.exercisesSubmitted - accounted;
  if (unaccounted !== 0 || !reproducible.analysisExclusions.complete) {
    blocking.push(
      `P5: the analyzer did not account for every exercise — ` +
        `${String(reproducible.analysisExclusions.exercisesSubmitted)} submitted, ` +
        `${String(reproducible.analysisExclusions.exercisesAnalyzable)} analyzable, ` +
        `${String(unaccounted)} unaccounted, by reason ` +
        JSON.stringify(reproducible.analysisExclusions.byReason),
    );
  }
  if (!reproducible.determinism.twoRunsByteIdentical) {
    blocking.push("P7: the run was not deterministic across two engine runs");
  }

  const byId = new Map(reproducible.measurements.map((measurement) => [measurement.id, measurement]));
  const preregistered = preregistration !== null;
  const statistics = INTERNAL_STATISTICS.map((statistic) =>
    compareStatistic({
      statisticId: statistic.id,
      measurement: byId.get(statistic.id),
      analyzable: reproducible.analysisExclusions.exercisesAnalyzable,
      margin:
        preregistration?.margins[statistic.id] ??
        (preregistration === null ? REFERENCE_MARGINS[statistic.id] ?? null : null),
      preregistered,
      blocking,
    }),
  );

  // The document's verdict is the worst verdict among the statistics that HAVE a
  // pre-registered margin. Statistics without one are excluded rather than
  // allowed to veto: a pre-registration that names one margin is a normal
  // pre-registration, and demanding eight would be a rule nobody follows.
  const eligible = statistics.filter((row) => row.margin !== null);
  const worst = eligible.reduce<ComparisonVerdict>((acc, row) => {
    const a = VERDICT_SEVERITY.indexOf(row.verdict);
    const b = VERDICT_SEVERITY.indexOf(acc);
    return a < b ? row.verdict : acc;
  }, "AGREE");
  const finalVerdict: ComparisonVerdict =
    preregistration === null || eligible.length === 0 ? "PREREGISTRATION_ABSENT" : worst;
  const finalReason =
    blocking.length > 0
      ? blocking.join("; ")
      : preregistration === null
        ? "no pre-registration, so no verdict is legal in either direction"
        : eligible.length === 0
          ? "the pre-registration names no margin for any statistic, so no verdict is legal"
          : `${String(eligible.filter((row) => row.verdict === worst).length)} of ` +
            `${String(eligible.length)} pre-registered statistic(s) land on ${worst}; ` +
            (eligible.find((row) => row.verdict === worst)?.verdictReason ?? "");

  return {
    schema: COMPARISON_SCHEMA_TAG,
    schemaVersion: COMPARISON_SCHEMA_VERSION,
    provenance: {
      externalCorpusId: provenance.corpusId,
      externalCorpusName: provenance.corpusName,
      externalResultDigest: report.resultDigest,
      externalKind: provenance.kind,
      internalProvenance: `${INTERNAL_REFERENCE_SOURCE.path} constants; census artifact not committed`,
    },
    preconditions,
    verdict: finalVerdict,
    verdictReason: finalReason,
    interpretation: STANDING_INTERPRETATION,
    statistics,
    decisionRule: DECISION_RULE,
    alpha: DEFAULT_ALPHA,
    power: DEFAULT_POWER,
    /**
     * The internal side's own provenance gap, attached to the artifact rather
     * than to a readme: what the published numbers are, what re-derives them,
     * and what is not in the repository at all.
     */
    internalLimitations: INTERNAL_LIMITATIONS,
    /**
     * Why there is no alibi row in `statistics`. The Alibi Distance census came
     * from a mutation-mining engine that is not in this repository, so there is
     * nothing here for an external run to agree or disagree with. An external
     * run can have its candidate alibis *verified*; that is a different and
     * weaker claim, and this document does not blur the two.
     */
    alibiComparison: {
      ...INTERNAL_ALIBI_REFERENCE,
      candidatesVerified: reproducible.alibiVerification?.verified ?? null,
      candidatesSubmitted: reproducible.alibiVerification?.candidatesSubmitted ?? null,
      note:
        reproducible.alibiVerification === null
          ? "this corpus declared no candidate alibis, so the Alibi Distance side of the " +
            "methodology did not run at all and nothing may be concluded from it"
          : "these candidates were verified by scripts/py_alibi_verify.py; verification is not " +
            "a rate and supports no comparison with the uncommitted alibi census",
    },
  };
}

/**
 * A worked demonstration built only from numbers that are already in the
 * repository, used by the tests and by the protocol document.
 *
 * The input is the committed internal gate's own 240-problem sample row for
 * `hidden_visible` (observed 42.33%, tolerance ±10.07pp, cluster SE 3.33pp,
 * n = 600 test-passing mutants) — traceable to `bun run verify:bdl` stdout, not
 * to any new experiment. It shows the difference between the internal gate's
 * symmetric-tolerance rule and the comparison's interval-containment rule at two
 * margins, which is the single most useful thing a reader can be shown about the
 * reporting format.
 */
export function toleranceBandDemonstration(): readonly {
  readonly margin: number;
  readonly underGateRule: "would pass" | "would fail";
  readonly underIntervalRule: ComparisonVerdict;
  readonly requiredExercises: number;
}[] {
  const internalPoint =
    INTERNAL_HEADLINE_RATES.hidden_visible.numerator /
    INTERNAL_HEADLINE_RATES.hidden_visible.denominator;
  // The committed internal gate's own sample row for this rate, measured on the
  // 240-problem stratified sample: observed 42.33%, 3-sigma tolerance +/-10.07pp,
  // cluster SE 3.33pp over n = 600 test-passing mutants. Traceable to
  // `bun run verify:bdl` stdout; this is not a new measurement.
  const observed = 0.4233;
  const gateHalfWidth = 0.1007;
  const low = observed - gateHalfWidth;
  const high = observed + gateHalfWidth;
  const out: {
    margin: number;
    underGateRule: "would pass" | "would fail";
    underIntervalRule: ComparisonVerdict;
    requiredExercises: number;
  }[] = [];
  for (const margin of [gateHalfWidth, 0.05, 0.02, 0.0129]) {
    // The gate's rule: the POINT estimate must be within the band.
    const gatePass = Math.abs(observed - internalPoint) <= margin;
    // The comparison's rule: the whole INTERVAL must be inside the band.
    const inside = low >= internalPoint - margin && high <= internalPoint + margin;
    out.push({
      margin,
      underGateRule: gatePass ? "would pass" : "would fail",
      underIntervalRule: inside ? "AGREE" : "INCONCLUSIVE",
      requiredExercises: nForHalfWidth(internalPoint, margin, Z_95),
    });
  }
  return out;
}

/** The sample-size table the protocol document quotes, computed not transcribed. */
export function sampleSizeGuidance(): readonly {
  readonly statisticId: string;
  readonly point: number;
  readonly unit: string;
  readonly designEffect: number | null;
  readonly rows: readonly { margin: number; minExercises: number }[];
}[] {
  return INTERNAL_STATISTICS.filter((statistic) => !statistic.isCount).map((statistic) => {
    const point = statistic.numerator / statistic.denominator;
    // The measured cluster-robust inflation on the internal 240-problem sample
    // (verify:bdl detail field): 3.33pp cluster vs 2.03pp binomial for
    // hidden_visible. Reported, not applied to exercise-unit rates.
    const measured = statistic.id === "hiddenVisible" ? 1.64 : statistic.id === "invisible" ? 1.85 : statistic.id === "testPassing" ? 1.68 : 1;
    const designEffect = statistic.unit === "mutant" ? measured : null;
    return {
      statisticId: statistic.id,
      point,
      unit: statistic.unit,
      designEffect,
      rows: [0.1, 0.05, 0.02].map((margin) => ({
        margin,
        minExercises: inflate(nForHalfWidth(point, margin, Z_95), designEffect),
      })),
    };
  });
}
