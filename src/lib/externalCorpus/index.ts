/**
 * External-corpus public surface.
 *
 * Re-exports only: every function and constant lives in its own module
 * (constants, types, digest, provenance, validate, stats, internal, report,
 * compare) so a consumer can import the narrow piece it needs, and this barrel
 * exists so scripts and tests have one import path.
 *
 * The dependency graph is acyclic and one-way:
 *
 *   constants  <- types
 *       ^          ^
 *       |          |
 *    digest      validate ---> provenance ---> digest
 *       ^          |              ^
 *       |          v              |
 *   internal <- report -----------+  and  compare ---> stats, internal, report
 *
 * Nothing here imports the DeepForge corpus except `provenance`, which does so
 * for the sole purpose of refusing to mistake it for an external one.
 */

export {
  ADVISORY_MIN_TESTS,
  ADVISORY_PROBE_REPR_CHARS,
  ALIBI_ENGINE_CONSTANTS,
  ALIBI_RULES,
  ALL_RULES,
  BDL_ENGINE_CONSTANTS,
  BDL_STRATIFIED_SAMPLE_SEED,
  CORPUS_FORMAT_TAG,
  CORPUS_FORMAT_VERSION,
  CORPUS_ID_PATTERN,
  CORPUS_LANGUAGE,
  CORPUS_MARK,
  CORPUS_VERSION_PATTERN,
  DEFAULT_ALPHA,
  DEFAULT_POWER,
  EXERCISE_RULES,
  EXTERNAL_RUN_MARK,
  EXTENSION_PREFIX,
  FILE_RULES,
  KNOWN_ALIBI_FIELDS,
  KNOWN_CORPUS_FIELDS,
  KNOWN_EXERCISE_FIELDS,
  KNOWN_LICENSE_FIELDS,
  KNOWN_PROVENANCE_FIELDS,
  KNOWN_TEST_FIELDS,
  KNOWN_TOP_LEVEL_FIELDS,
  MAX_EXERCISES,
  MAX_REFERENCE_CHARS,
  MAX_WITNESS_CHARS,
  REPORT_SCHEMA_TAG,
  REPORT_SCHEMA_VERSION,
  REQUIRED_ALIBI_FIELDS,
  REQUIRED_CORPUS_FIELDS,
  REQUIRED_EXERCISE_FIELDS,
  REQUIRED_LICENSE_FIELDS,
  REQUIRED_PROVENANCE_FIELDS,
  REQUIRED_TEST_FIELDS,
  REQUIRED_TOP_LEVEL_FIELDS,
  SUPPORTED_FORMAT_VERSIONS,
  VALIDATION_SCHEMA_TAG,
  VALIDATION_SCHEMA_VERSION,
  Z_95,
  isKnownRule,
  ruleSpec,
} from "./constants";

export {
  INTERNAL_ALIBI_REFERENCE,
  INTERNAL_CENSUS_COUNTS,
  INTERNAL_HEADLINE_RATES,
  INTERNAL_LIMITATIONS,
  INTERNAL_REFERENCE_SOURCE,
  INTERNAL_STATISTICS,
} from "./internal";
export type { InternalStatistic } from "./internal";

export {
  INTERNAL_CORPUS_EXERCISES,
  INTERNAL_CORPUS_SHA256,
  OVERLAP_LIMITATION,
  compareWithInternalCorpus,
  declaredProvenance,
  internalCorpusDigest,
  internalProjection,
  overlapNotPerformed,
} from "./provenance";

export {
  UNDECLARED_CATEGORY,
  UNDECLARED_DIFFICULTY,
  canonicalJson,
  corpusContentDigest,
  projectExercise,
  sha256OfBytes,
  sha256OfCanonical,
  sha256OfText,
  shortDigest,
  utf8,
} from "./digest";

export {
  ENTRY_POINT_PATTERN,
  VALIDATOR_RULES,
  asCorpusFile,
  candidatesOf,
  composeAlibiBank,
  composeAnalyzerCorpus,
  estimateReprChars,
  headerOf,
  overlapFindingFor,
  overlapFindingUnavailable,
  resolveEntryPoint,
  runProvenance,
  validateCorpusFile,
} from "./validate";
export type { ValidateOptions } from "./validate";

export {
  DECISION_RULE,
  clusteredRate,
  clusterRobustSe,
  inflate,
  meanOfClusters,
  nForHalfWidth,
  nForPower,
  normalQuantile,
  oddsRatio,
  percent,
  percentagePoints,
  powerAgainst,
  proportion,
  riskDifference,
  riskRatio,
  wilsonInterval,
  zForAlpha,
} from "./stats";
export type { ClusteredRate, EffectSize, ProportionEstimate } from "./stats";

export {
  alibiBankFor,
  buildMeasurements,
  buildReproducibleSection,
  buildRunReport,
  bytesDigest,
  canonicalRecords,
  logLine,
  recomputeResultDigest,
  reportFileName,
  resultDigestOf,
  safeSegment,
  validateRunReport,
} from "./report";
export type { BuildRunReportInput, EngineRecord, ReportCheck } from "./report";

export {
  EXTERNAL_STATISTICS,
  REFERENCE_MARGINS,
  STANDING_INTERPRETATION,
  compareExternalRun,
  definitionDigest,
  sampleSizeGuidance,
  toleranceBandDemonstration,
} from "./compare";
export type { CompareInput } from "./compare";

export type {
  AcceptedAlibi,
  AcceptedExercise,
  Advisory,
  AlibiVerificationSummary,
  AnalysisExclusion,
  AnalysisExclusions,
  ComparisonDocument,
  ComparisonVerdict,
  CorpusCandidateAlibi,
  CorpusExercise,
  CorpusHeader,
  CorpusLicense,
  CorpusOrigin,
  CorpusProvenance,
  CorpusTestCase,
  DfCorpusFile,
  EffectEstimate,
  EngineDigest,
  ExternalRunReport,
  FilterAccounting,
  IntervalMethod,
  Measurement,
  OverlapFinding,
  Precondition,
  Preregistration,
  ReproducibleSection,
  Rejection,
  RejectionScope,
  RuleCounts,
  RunEngineProvenance,
  RunMetadata,
  RunProvenance,
  StatisticComparison,
  StatisticUnit,
  ValidationReport,
} from "./types";
