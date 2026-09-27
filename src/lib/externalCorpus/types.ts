/**
 * External-corpus contract — types.
 *
 * The wire types describe what a third party sends (`DfCorpusFile` and its
 * parts) and what the tooling emits (`ValidationReport`, `ExternalRunReport`,
 * `ComparisonDocument`). The wire types are the ones the JSON Schema in
 * `docs/research/external-corpus/format.schema.json` is written against, so a
 * change here is a change to the published contract and must bump
 * `CORPUS_FORMAT_VERSION`.
 *
 * Nothing in this file imports a runtime value: the two halves (the format the
 * outside world writes, and the reports the tooling emits) share only shape.
 */

import type {
  ALIBI_ENGINE_CONSTANTS,
  BDL_ENGINE_CONSTANTS,
} from "./constants";

/* ───────────────────────────── the wire format ───────────────────────────── */

/** Where a corpus came from, as the corpus itself declares it. */
export type CorpusOrigin = "external" | "synthetic-example";

/** The Python only. Present so a reader never has to guess what is exec'd. */
export type CorpusLanguage = "python";

/** How the exercises were produced, as declared by the corpus. */
export type ProvenanceMethod = "hand-authored" | "generated" | "derived" | "unknown";

/**
 * Independence from DeepForge, as declared by the corpus. `derived-from-deepforge`
 * and `unknown` both block a claim of external validity; they differ in how
 * badly.
 */
export type ProvenanceIndependence =
  | "independent-from-deepforge"
  | "derived-from-deepforge"
  | "unknown";

/** Licence assertion. `NOASSERTION` is legal and is disclosed, never hidden. */
export interface CorpusLicense {
  /** SPDX identifier, or the literal `NOASSERTION`. */
  readonly id: string;
  /** Where the licence text lives. Required even when `id` is `NOASSERTION`. */
  readonly url: string;
  readonly holder?: string;
  readonly notes?: string;
}

/** The corpus's own account of where it came from. */
export interface CorpusProvenance {
  /** Who is responsible for the snapshot. */
  readonly maintainer: string;
  /** Where the exercises came from: a URL, a DOI, a repository, a local path. */
  readonly source: string;
  /** ISO date (`YYYY-MM-DD`) the snapshot was taken. */
  readonly obtained: string;
  readonly method: ProvenanceMethod;
  readonly independence: ProvenanceIndependence;
  /** Free text on known overlap, contamination, or licensing awkwardness. */
  readonly contaminationNotes?: string;
  /** Free text on the tooling and Python build that produced the snapshot. */
  readonly tooling?: string;
}

/** Corpus-level identity. */
export interface CorpusHeader {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly origin: CorpusOrigin;
  readonly language: CorpusLanguage;
  readonly provenance: CorpusProvenance;
  readonly license: CorpusLicense;
}

/** One shipped test: positional arguments, expected return value. */
export interface CorpusTestCase {
  /** Positional arguments; always an array, `[]` for a zero-argument function. */
  readonly input: readonly unknown[];
  /** Expected return value. The key must be present; `null` is a legal value. */
  readonly expected: unknown;
}

/**
 * One exercise. The three required fields are exactly what the two committed
 * engines read; every other field is optional metadata that is carried into the
 * report and never used to include or exclude the exercise.
 */
export interface CorpusExercise {
  /** Unique within the corpus. Seeds the probe bank, so it is load-bearing. */
  readonly id: string;
  /** The reference solution, as a Python source string. */
  readonly reference: string;
  /** At least one shipped test case. */
  readonly tests: readonly CorpusTestCase[];
  /** Entry function; when absent the first `def` in `reference` is used. */
  readonly entry?: string;
  /** Display title. Never read by an engine. */
  readonly title?: string;
  /** Free-form taxonomy label. The internal corpus uses 15 fixed values; an
   *  external corpus is not required to, and an absent value is disclosed. */
  readonly category?: string;
  /** Free-form difficulty label. Carried for slices; never filtered on. */
  readonly difficulty?: string;
  /** Per-exercise provenance pointer, e.g. `chapter-3#ex-12`. */
  readonly source?: string;
  readonly notes?: string;
}

/**
 * One candidate silent failure discovered by somebody else's miner.
 *
 * A candidate carries no `reference` and no `tests`: the runner composes the
 * verifier's record from the referenced exercise, so a candidate can never
 * carry a stale copy of the reference it claims to differ from.
 */
export interface CorpusCandidateAlibi {
  readonly id: string;
  /** The `id` of an accepted exercise in the same file. */
  readonly exerciseId: string;
  /** The mined variant, as a Python source string. */
  readonly ghost: string;
  /** The Python literal at which `reference` and `ghost` must diverge. */
  readonly witness: string;
  /** Optional; must equal the exercise's resolved entry point when present. */
  readonly func?: string;
  /** Free text naming the miner that produced the candidate. */
  readonly minedBy?: string;
  readonly notes?: string;
}

/** A whole corpus file. */
export interface DfCorpusFile {
  readonly format: string;
  readonly formatVersion: number;
  readonly corpus: CorpusHeader;
  readonly exercises: readonly CorpusExercise[];
  /** Optional. Absent means the file makes no alibi claim at all. */
  readonly candidateAlibis?: readonly CorpusCandidateAlibi[];
  readonly notes?: string;
}

/* ─────────────────────────── the validation report ───────────────────────── */

export type RejectionScope = "file" | "exercise" | "alibi";

/** One rejection. Every rejection names what it applies to and how to fix it. */
export interface Rejection {
  readonly code: string;
  readonly scope: RejectionScope;
  /** Exercise id, candidate id, or `"<file>"`. */
  readonly target: string;
  /** 1-based position in the source array, when the target has one. */
  readonly index: number | null;
  /** What is wrong, in one sentence, with the offending value named. */
  readonly message: string;
  /** What to do about it. */
  readonly remedy: string;
  /** JSON-pointer-ish path into the file, e.g. `/exercises/3/tests/1/expected`. */
  readonly path: string;
}

/** One disclosure. Advisories never reject; they are counted and carried. */
export interface Advisory {
  readonly code: string;
  /** Exercise id, candidate id, or `"<corpus>"`. */
  readonly target: string;
  readonly index: number | null;
  readonly message: string;
  /** How many items this advisory stands for. */
  readonly count: number;
}

/** Counts keyed by rule code, for the one-line-per-rule summary. */
export type RuleCounts = Readonly<Record<string, number>>;

/**
 * The filter accounting. The single most important object in the report:
 * `exercisesTotal === exercisesAccepted + exercisesRejected` must hold
 * exactly, and every rejection is listed with its id and rule.
 */
export interface FilterAccounting {
  readonly exercisesTotal: number;
  readonly exercisesAccepted: number;
  readonly exercisesRejected: number;
  readonly rejectionsByRule: RuleCounts;
  readonly rejections: readonly Rejection[];
  readonly alibisTotal: number;
  readonly alibisAccepted: number;
  readonly alibisRejected: number;
  readonly alibiRejectionsByRule: RuleCounts;
  readonly alibiRejections: readonly Rejection[];
  /** Disclosure counts. Never a filter, always reported. */
  readonly advisories: readonly Advisory[];
  readonly advisoryCounts: RuleCounts;
  /** `true` when the accounting identity holds; the validator asserts it. */
  readonly balances: boolean;
}

/** The validator's machine-readable output. */
export interface ValidationReport {
  readonly schema: string;
  readonly schemaVersion: number;
  /** `true` when nothing was rejected. Advisories do not affect this. */
  readonly ok: boolean;
  /** The corpus's declared identity, echoed for the log. Absent on a fatal
   *  file-level rejection, because then the file cannot be trusted at all. */
  readonly corpus: {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly origin: CorpusOrigin;
    readonly language: CorpusLanguage;
    readonly maintainer: string;
    readonly independence: ProvenanceIndependence;
    readonly licenseId: string;
  } | null;
  readonly filterAccounting: FilterAccounting;
  /** The accepted exercises, in file order, with resolved entry points. */
  readonly accepted: readonly AcceptedExercise[];
  /** The accepted candidates, with the composed verifier record. */
  readonly acceptedAlibis: readonly AcceptedAlibi[];
  /** `false` when a file-level rule rejected the whole file. */
  readonly corpusUsable: boolean;
  /** File-level rejections only. Present when `corpusUsable` is false. */
  readonly fatal: readonly Rejection[];
}

/**
 * An exercise that passed validation, with the two derived fields the engines
 * need: the resolved entry point and the count of shipped tests.
 */
export interface AcceptedExercise {
  readonly id: string;
  readonly reference: string;
  readonly entry: string;
  readonly tests: readonly CorpusTestCase[];
  readonly category: string | null;
  readonly difficulty: string | null;
  /** `true` when `category` was absent; the run then reports the taxonomy as
   *  undeclared rather than inventing one. */
  readonly categoryUndeclared: boolean;
  readonly difficultyUndeclared: boolean;
  readonly title: string | null;
  readonly source: string | null;
}

/** A candidate that passed validation, composed into the verifier's shape. */
export interface AcceptedAlibi {
  readonly id: string;
  readonly exerciseId: string;
  readonly ghost: string;
  readonly witness: string;
  readonly func: string;
}

/* ────────────────────────────── the run report ───────────────────────────── */

/** SHA-256 of one named file's bytes, so a run names its own engine. */
export interface EngineDigest {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
}

/** The engine provenance a run records. */
export interface RunEngineProvenance {
  readonly bdl: EngineDigest;
  readonly alibi: EngineDigest;
  readonly runner: EngineDigest;
  readonly census: EngineDigest;
}

/** One exclusion from the methodology, distinct from a validation rejection. */
export interface AnalysisExclusion {
  /** The engine's own skip reason, verbatim: `unparse`, `no-entry`,
   *  `ref-fails-own-tests`, `small-basis`, `crash:<Type>:<msg>`. */
  readonly reason: string;
  readonly count: number;
  /** Every affected exercise id, so the exclusion is auditable one by one. */
  readonly exerciseIds: readonly string[];
}

/** The analysis-stage exclusion ledger. Never merged with `rejections`. */
export interface AnalysisExclusions {
  readonly exercisesSubmitted: number;
  readonly exercisesAnalyzable: number;
  readonly exclusions: readonly AnalysisExclusion[];
  readonly byReason: RuleCounts;
  /** `true` when every submitted exercise produced a record. */
  readonly complete: boolean;
}

/** Which statistical unit a rate is measured over. */
export type StatisticUnit = "exercise" | "mutant";

/**
 * How a point estimate should be read.
 *
 * `proportion` means the numerator is a count of events inside the denominator,
 * so the estimate lies in [0, 1] and a risk difference against another
 * proportion is meaningful. `per-unit` means the numerator is a *total* spread
 * over a number of clusters ("mutants per exercise"), so the estimate is a mean
 * in the units of the thing counted, no binomial variance exists, and a risk
 * difference, risk ratio, or odds ratio against it would be meaningless. The
 * comparison refuses to compute one.
 */
export type StatisticScale = "proportion" | "per-unit";

/** How an interval was computed; stated per statistic, never assumed. */
export type IntervalMethod =
  | "wilson-score"
  | "cluster-robust-normal"
  | "none";

/**
 * One measured rate, with its denominator attached.
 *
 * `numerator` and `denominator` are the whole point: no rate in a report is
 * legal without both, and `denominator === 0` is reported as
 * `undefined` rather than as 0.
 */
export interface Measurement {
  readonly id: string;
  readonly label: string;
  /** One-line definition, carried verbatim into the comparison. */
  readonly definition: string;
  /** Digest of `definition` + `unit`, so two reports can prove commensurability. */
  readonly definitionDigest: string;
  readonly unit: StatisticUnit;
  readonly numerator: number;
  readonly denominator: number;
  /** `null` when `denominator === 0`. Never 0, never NaN. */
  readonly point: number | null;
  /** Two-sided 95% interval; `[null, null]` when undefined. */
  readonly ci95: readonly [number | null, number | null];
  readonly intervalMethod: IntervalMethod;
  /** Cluster-robust standard error, as the BDL gate computes it. */
  readonly seCluster: number | null;
  /** Binomial standard error at the point estimate, for comparison. */
  readonly seBinomial: number | null;
  /** `seCluster / seBinomial`; the variance-inflation factor an n must absorb. */
  readonly designEffect: number | null;
  /** True when this is a raw count, not a proportion. */
  readonly isCount: boolean;
  readonly scale: StatisticScale;
  /**
   * A standing caveat about this interval, or `null`. Set when the interval is
   * degenerate (a zero cluster-robust SE, so the interval is a point) or when
   * the interval is a normal interval on a mean rather than a proportion
   * interval. Carried so a reader never has to re-derive why a zero-width
   * interval appeared.
   */
  readonly caveat: string | null;
}

/**
 * The part of a run report that must be identical on every re-run of the same
 * corpus with the same engine. `resultDigest` is computed over exactly this
 * object and nothing else, which is the fix for the time-dependent-manifest
 * problem: no clock, no host, no duration, no worker count appears here.
 */
export interface ReproducibleSection {
  readonly formatVersion: number;
  readonly schemaVersion: number;
  /** Digest of the canonical normalised corpus content. */
  readonly corpusContentDigest: string;
  /** Digest of the raw file bytes, so a formatting-only change is visible. */
  readonly corpusBytesSha256: string;
  readonly corpusBytes: number;
  readonly engine: RunEngineProvenance;
  readonly bdlConstants: typeof BDL_ENGINE_CONSTANTS;
  readonly alibiConstants: typeof ALIBI_ENGINE_CONSTANTS;
  readonly filterAccounting: FilterAccounting;
  readonly analysisExclusions: AnalysisExclusions;
  readonly measurements: readonly Measurement[];
  /** Canonical per-exercise records, timing excluded. */
  readonly records: readonly Record<string, unknown>[];
  readonly recordsDigest: string;
  readonly determinism: {
    /** `true` when two in-process engine runs serialised byte-identically. */
    readonly twoRunsByteIdentical: boolean;
    readonly recordsDigestFirst: string;
    readonly recordsDigestSecond: string;
  };
  /** The alibi side, when the file carried candidates. */
  readonly alibiVerification: AlibiVerificationSummary | null;
}

/** What the shipped alibi verifier said about the external candidates. */
export interface AlibiVerificationSummary {
  readonly candidatesSubmitted: number;
  readonly verified: number;
  readonly failed: number;
  readonly divergence: Readonly<Record<string, number>>;
  readonly unionProbes: number;
  readonly heldOutProbes: number;
  readonly gateSummaryDigest: string;
  /** Per-candidate verdicts, so a failure is traceable to one record. */
  readonly perCandidate: readonly {
    readonly id: string;
    readonly exerciseId: string;
    readonly verified: boolean;
    readonly divergence: string | null;
  }[];
}

/**
 * The part of a run report that legitimately varies between runs and machines.
 * Nothing here is hashed into `resultDigest`.
 */
export interface RunMetadata {
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly durationSeconds: number;
  readonly host: {
    readonly platform: string;
    readonly arch: string;
    readonly cpus: number;
  };
  readonly runtime: {
    readonly bun: string;
    readonly node: string;
    readonly python: string;
    readonly pythonImplementation: string;
    readonly pythonVersion: string;
  };
  readonly workers: number;
  readonly command: readonly string[];
  readonly outputPath: string;
  /** A standing reminder that this section is not reproducible. */
  readonly reproducible: false;
}

/** A complete external run report. */
export interface ExternalRunReport {
  readonly schema: string;
  readonly schemaVersion: number;
  readonly provenance: RunProvenance;
  readonly reproducible: ReproducibleSection;
  /** SHA-256 over the canonical `reproducible` object. Stable across time. */
  readonly resultDigest: string;
  readonly runMetadata: RunMetadata;
  /** Filled only by the comparison tool, and only with its preconditions. */
  readonly comparison: ComparisonDocument | null;
}

/** Provenance, carried from the corpus file into every artifact. */
export interface RunProvenance {
  /** `external` or `synthetic-example`; the internal corpus has no value here
   *  because this tooling refuses to accept it. */
  readonly kind: CorpusOrigin;
  readonly corpusId: string;
  readonly corpusName: string;
  readonly corpusVersion: string;
  readonly corpusContentDigest: string;
  readonly maintainer: string;
  readonly source: string;
  readonly obtained: string;
  readonly method: ProvenanceMethod;
  readonly independence: ProvenanceIndependence;
  readonly licenseId: string;
  readonly licenseUrl: string;
  /** `true` when the corpus declares itself a format fixture. */
  readonly synthetic: boolean;
  /** `true` when the numbers must never be presented as evidence. */
  readonly notAScientificResult: boolean;
  /** Short label stamped on every log line and every file name. */
  readonly label: string;
  /** Overlap check against the internal corpus. A disclosure, never a filter. */
  readonly overlapWithInternalCorpus: OverlapFinding;
}

/** What the overlap check could and could not establish. */
export interface OverlapFinding {
  readonly performed: boolean;
  /** `not-performed` when the internal corpus could not be loaded. */
  readonly status:
    | "checked"
    | "not-performed"
    | "not-applicable"
    | "internal-corpus-unavailable";
  /** Byte-identical references shared with the internal corpus. */
  readonly sharedReferences: number;
  /** Exercises in this corpus. */
  readonly exercises: number;
  /** Ids shared with the internal corpus. */
  readonly sharedIds: number;
  /** `true` when the whole corpus content digest equals the internal one. */
  readonly isTheInternalCorpus: boolean;
  /** What this check does not establish. Carried verbatim into the report. */
  readonly doesNotEstablish: string;
}

/* ─────────────────────────── the comparison document ─────────────────────── */

/** One precondition for a comparison, and whether it holds. */
export interface Precondition {
  readonly id: string;
  readonly statement: string;
  readonly holds: boolean;
  /** Why it fails, or why it is unverifiable. */
  readonly detail: string;
}

/** The verdict vocabulary. None of these is "replicated". */
export type ComparisonVerdict =
  /** The external 95% interval lies entirely inside the pre-registered band. */
  | "AGREE"
  /** The external 95% interval is disjoint from the pre-registered band. */
  | "DISAGREE"
  /** The interval straddles the band, or is too wide to decide. */
  | "INCONCLUSIVE"
  /** The run is too small to decide at the pre-registered margin. */
  | "INSUFFICIENT_SAMPLE"
  /** No pre-registration was recorded, so no verdict is legal. */
  | "PREREGISTRATION_ABSENT"
  /** The two numbers are not commensurable, or independence fails. */
  | "NOT_COMPARABLE";

/** The pre-registration a run must carry before a verdict is legal. */
export interface Preregistration {
  /** ISO date the pre-registration was fixed, before the run. */
  readonly registeredAt: string;
  /** Who fixed it. */
  readonly registeredBy: string;
  /** Where the pre-registration is written down, durably (OSF, a DOI, a repo). */
  readonly registeredWhere: string;
  /** Declared exclusion policy, in the reporter's own words. */
  readonly exclusionPolicy: string;
  /** Declared equivalence margin per statistic, in proportions. */
  readonly margins: Readonly<Record<string, number>>;
  /** Free-text statement of the hypothesis, if any. */
  readonly hypothesis?: string;
}

/** A pre-registered margin lookup. Absent margin = no verdict is legal. */
export interface MarginRequest {
  readonly preregistration: Preregistration | null;
  /** Fallback margins when no pre-registration was recorded. Never used to
   *  produce AGREE/DISAGREE; they only drive the sample-size guidance. */
  readonly referenceMargins: Readonly<Record<string, number>>;
}

/** One statistic compared between the external run and the internal corpus. */
export interface StatisticComparison {
  readonly id: string;
  readonly scale: StatisticScale;
  readonly label: string;
  readonly definition: string;
  readonly definitionDigest: string;
  readonly unit: StatisticUnit;
  readonly commensurable: boolean;
  readonly commensurabilityDetail: string;
  readonly internal: {
    readonly numerator: number;
    readonly denominator: number;
    readonly point: number | null;
    readonly ci95: readonly [number | null, number | null];
    readonly provenance: string;
  };
  readonly external: {
    readonly numerator: number;
    readonly denominator: number;
    readonly point: number | null;
    readonly ci95: readonly [number | null, number | null];
  } | null;
  /** Pre-registered margin for this statistic, or `null` when none exists. */
  readonly margin: number | null;
  /** Minimum analyzable exercises to decide at this margin. */
  readonly minExercisesForMargin: number | null;
  /** Minimum analyzable exercises to detect a margin-sized shift at 80% power. */
  readonly minExercisesForPower: number | null;
  /** Observed design effect, already applied to the sample-size figures. */
  readonly designEffect: number | null;
  /** Risk difference, external minus internal, with a Newcombe hybrid-score CI. */
  readonly riskDifference: EffectEstimate | null;
  /** Risk ratio with a Katz log-method CI. */
  readonly riskRatio: EffectEstimate | null;
  /** Odds ratio with a Woolf log-method CI. */
  readonly oddsRatio: EffectEstimate | null;
  readonly verdict: ComparisonVerdict;
  readonly verdictReason: string;
}

/** An effect size with an interval, or a documented reason for having none. */
export interface EffectEstimate {
  readonly method: string;
  readonly value: number | null;
  readonly ci95: readonly [number | null, number | null];
  /** Set when the estimate is undefined (empty cell, zero denominator). */
  readonly undefinedReason: string | null;
}

/** The complete comparison document. */
export interface ComparisonDocument {
  readonly schema: string;
  readonly schemaVersion: number;
  readonly provenance: {
    readonly externalCorpusId: string;
    readonly externalCorpusName: string;
    readonly externalResultDigest: string;
    readonly externalKind: CorpusOrigin;
    readonly internalProvenance: string;
  };
  readonly preconditions: readonly Precondition[];
  readonly verdict: ComparisonVerdict;
  readonly verdictReason: string;
  /** Always present. A different corpus may legitimately differ. */
  readonly interpretation: readonly string[];
  readonly statistics: readonly StatisticComparison[];
  /** The convention used for every verdict, stated once. */
  readonly decisionRule: string;
  readonly alpha: number;
  readonly power: number;
  /**
   * The internal side's own provenance gap, carried in the artifact: what the
   * published numbers are, what re-derives them, and what is not in the
   * repository at all. A reader of a comparison document should not have to
   * open a second file to learn that the number being compared against came
   * from an uncommitted engine.
   */
  readonly internalLimitations: readonly string[];
  /**
   * Why there is no alibi row in `statistics`, plus what the alibi side of the
   * run did do. Present so the document cannot be read as having covered
   * Alibi Distance when it did not.
   */
  readonly alibiComparison: {
    readonly bankPuzzles: number;
    readonly bankStatus: string;
    readonly censusStatus: string;
    readonly comparisonPossible: false;
    readonly reason: string;
    readonly candidatesVerified: number | null;
    readonly candidatesSubmitted: number | null;
    readonly note: string;
  };
}
