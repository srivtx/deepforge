/**
 * External-corpus contract — frozen constants.
 *
 * Every number here is either (a) a version tag, (b) an identifier, or (c) a
 * cap whose justification is stated in the same object. No cap is a guess: each
 * one records the measurement or the engine constant it was derived from, so a
 * reader can check that the cap cannot silently exclude a legitimate exercise.
 *
 * The contract is deliberately small. It describes only what the two committed
 * engines actually consume:
 *
 *   - `scripts/py_bdl_verify.py` (the independent Behavioral Delta Ledger
 *     analyzer) reads `id`, `category`, `difficulty`, `solution`, `testCases`
 *     from each problem record — nothing else.
 *   - `scripts/py_alibi_verify.py` (the independent Alibi Distance verifier)
 *     reads `id`, `reference`, `ghost`, `func`, `tests`, `witness` and the
 *     optional `unionProbes`/`unionPassed`/`heldOutProbes`/`heldOutPassed`
 *     metadata from each candidate record.
 *
 * Nothing in either engine reads a title, a description, a hint, or a
 * difficulty *value*; those are carried for slice reporting only. The format
 * therefore requires the six fields the engines read and treats everything else
 * as optional metadata, which is what makes the format usable by a lab that
 * does not share DeepForge's internals.
 */

/** Wire tag. A file that does not start with this is not a corpus file. */
export const CORPUS_FORMAT_TAG = "df-corpus";

/** The only format version this build accepts. */
export const CORPUS_FORMAT_VERSION = 1;

/** The only language this build accepts; the engines exec CPython source. */
export const CORPUS_LANGUAGE = "python";

/** Report wire tag + version, separate from the corpus format version. */
export const REPORT_SCHEMA_TAG = "deepforge-external-run";
export const REPORT_SCHEMA_VERSION = 1;

/** Comparison-document wire tag + version. */
export const COMPARISON_SCHEMA_TAG = "deepforge-external-comparison";
export const COMPARISON_SCHEMA_VERSION = 1;

/** Validation report wire tag + version (the validator's own output). */
export const VALIDATION_SCHEMA_TAG = "deepforge-external-validation";
export const VALIDATION_SCHEMA_VERSION = 1;

/** Machine-readable stdout markers, following the repo's `*_GATE` convention. */
export const CORPUS_MARK = "__DF_CORPUS__";
export const EXTERNAL_RUN_MARK = "__DF_EXTRUN__";

/**
 * Identifier pattern for corpus and exercise ids. URL-safe, case-sensitive,
 * deliberately wider than DeepForge's own `^[a-z]+-\d{3,4}$` so a third party
 * is not forced to renumber their catalogue into DeepForge's scheme.
 */
export const CORPUS_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

/** Corpus version: a release string, not a semver requirement. */
export const CORPUS_VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,31}$/;

/** ISO calendar date, `YYYY-MM-DD`. The snapshot date is load-bearing. */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Cap on one reference source string.
 *
 * Justification: the longest reference solution in the 5,730-problem internal
 * corpus is 1,902 characters (`ds-191`, measured with
 * `bun -e 'import {PROBLEMS} …'`). The cap is 20,000 characters, 10.5x the
 * longest internal exercise and 3.3 orders of magnitude above the 60-character
 * median, so it cannot exclude a legitimate exercise of this methodology; it
 * exists to bound a hostile or accidentally inlined file.
 */
export const MAX_REFERENCE_CHARS = 20_000;

/**
 * Cap on one `witness` literal.
 *
 * Justification: `ALIBI_INPUT_MAX_CHARS` in `src/lib/alibiHunt.ts:18` is 2,000
 * characters — the longest learner literal the shipped duel harness accepts.
 * The witness of a candidate alibi is the same kind of Python literal, so the
 * cap is the engine's own, not a new invention.
 */
export const MAX_WITNESS_CHARS = 2_000;

/**
 * Cap on the number of exercises in one corpus file.
 *
 * Justification: the internal corpus has 5,730. The cap is 200,000, ~35x
 * larger, so it is a resource bound (the analyzer is O(exercises x mutants x
 * probes) in CPython) and not a plausibility filter.
 */
export const MAX_EXERCISES = 200_000;

/**
 * Advisory threshold on shipped tests per exercise.
 *
 * Justification: `probe_bank` in `scripts/py_bdl_verify.py:292` perturbs only
 * the first three shipped inputs, and `_analyze` skips an exercise whose basis
 * has fewer than `MIN_BASIS = 5` probes. The internal corpus carries 3-6 tests
 * per exercise (min 3, max 6, measured). Fewer than 3 is therefore not invalid
 * — it is legal but weakens the basis, so it is an advisory and never a filter.
 */
export const ADVISORY_MIN_TESTS = 3;

/**
 * Probe-cap advisory threshold on one test input, in characters.
 *
 * Justification: `probe_bank` drops any candidate whose `repr` is
 * `>= 4000` characters, so a shipped input that large contributes no probes and
 * silently shrinks the basis. The validator reports such inputs (estimated)
 * instead of letting the basis shrink invisibly. The estimate uses
 * `JSON.stringify` as a proxy for Python `repr`; it is an estimate and is
 * labelled as one.
 */
export const ADVISORY_PROBE_REPR_CHARS = 4_000;

/** Longest accepted category / difficulty label (free text, not an enum). */
export const MAX_LABEL_CHARS = 120;

/** Longest accepted corpus name. */
export const MAX_CORPUS_NAME_CHARS = 120;

/** Recursion cap for the validator's own walk of a test value. */
export const MAX_VALUE_DEPTH = 64;

/** Longest accepted SPDX-ish licence id or `NOASSERTION`. */
export const MAX_LICENSE_ID_CHARS = 64;

/** Two-sided 95% normal quantile, used by every interval in the report. */
export const Z_95 = 1.959963984540054;

/**
 * Alpha/beta conventions for the sample-size guidance, stated once so the
 * reported numbers are not free parameters.
 */
export const DEFAULT_ALPHA = 0.05;
export const DEFAULT_POWER = 0.8;

/**
 * The engine seeds, restated here so a report can prove which seeds produced
 * it without reading the Python source. These mirror
 * `scripts/py_bdl_verify.py:71` and the per-id `md5` seed inside `_analyze`.
 */
export const BDL_STRATIFIED_SAMPLE_SEED = "deepforge-bdl-gate-v1";

/**
 * The engine constants an external run depends on, restated for the report so a
 * reader can see the frozen configuration without diffing Python. A test
 * asserts every value here against `scripts/py_bdl_verify.py`.
 */
export const BDL_ENGINE_CONSTANTS = {
  /** `TOL` — the deep-equality tolerance shared with the product harnesses. */
  tolerance: 1e-6,
  /** `BASIS_CAP` — probe-bank cap. */
  basisCap: 48,
  /** `MIN_BASIS` — below this an exercise is skipped as `small-basis`. */
  minBasis: 5,
  /** `MUTANT_CAP` — mutants generated per exercise. */
  mutantCap: 24,
  /** `MUTANT_PER_KIND` — per edit family. */
  mutantPerKind: 4,
  /** `CALL_TIMEOUT` — per-call wall alarm, seconds. */
  callTimeoutSeconds: 0.25,
  /** `_analyze` derives the per-exercise seed from `md5(id)[:8]`. */
  perExerciseSeed: "md5(id)[0:8] as big-endian int",
  /** `probe_bank` perturbs only the first N shipped inputs. */
  basisSourceInputs: 3,
  /** `probe_bank` drops candidates whose repr is at least this long. */
  probeReprCap: 4000,
} as const;

/** The alibi verifier's frozen call budget, restated for the report. */
export const ALIBI_ENGINE_CONSTANTS = {
  /** `TOL` in `scripts/py_alibi_verify.py:57`. */
  tolerance: 1e-6,
  /** `CALL_TIMEOUT` in `scripts/py_alibi_verify.py:58`, seconds. */
  callTimeoutSeconds: 1.0,
  /** `LINE_BUDGET` in `scripts/py_alibi_verify.py:59`. */
  lineBudget: 400_000,
  /** `LAZY_PROBE_CAP` in `scripts/py_alibi_verify.py:61`. */
  lazyProbeCap: 128,
  /** `UNION_SEEDS` in `scripts/py_alibi_verify.py:64`. */
  unionSeeds: 16,
  /** `UNION_PER_SEED` in `scripts/py_alibi_verify.py:65`. */
  unionPerSeed: 100,
} as const;

/**
 * Every rejection rule the validator can emit, with its one-line meaning.
 *
 * The table is the contract: a rule that is not in this table cannot be
 * emitted, and a rule that is in this table always produces a `rejection`
 * entry naming the exercise (or the file) it applies to. `advisory` rules
 * never reject — they are counted and carried into the report, because a
 * disclosure that filters is a filter.
 */
export interface RuleSpec {
  readonly code: string;
  readonly kind: "file" | "exercise" | "alibi";
  readonly title: string;
  readonly remedy: string;
}

export const FILE_RULES: readonly RuleSpec[] = [
  {
    code: "file/unreadable",
    kind: "file",
    title: "the corpus file could not be read",
    remedy: "check the path and the file permissions",
  },
  {
    code: "file/not-json",
    kind: "file",
    title: "the corpus file is not valid JSON",
    remedy: "validate with `python3 -m json.tool <file>` and fix the reported position",
  },
  {
    code: "file/not-object",
    kind: "file",
    title: "the top level of the corpus file is not a JSON object",
    remedy: "wrap the document in a single `{ … }` object; see format.schema.json",
  },
  {
    code: "file/unknown-field",
    kind: "file",
    title: "an unrecognised top-level field is present",
    remedy:
      "remove it, or move it under an `x-<vendor>` key, which the validator records and ignores",
  },
  {
    code: "field/missing",
    kind: "file",
    title: "a required top-level field is absent",
    remedy: "add the field; format.schema.json lists every required field",
  },
  {
    code: "field/type",
    kind: "file",
    title: "a field has the wrong JSON type",
    remedy: "match the type in format.schema.json",
  },
  {
    code: "format/tag",
    kind: "file",
    title: "`format` is not the expected tag",
    remedy: `set "format": "${CORPUS_FORMAT_TAG}"`,
  },
  {
    code: "format/version",
    kind: "file",
    title: "`formatVersion` is not a version this build implements",
    remedy:
      "use a version listed in SUPPORTED_FORMAT_VERSIONS, or upgrade the validator; a newer version is refused rather than guessed at",
  },
  {
    code: "corpus/id",
    kind: "file",
    title: "`corpus.id` is missing, empty, or not URL-safe",
    remedy: "use 1-64 characters matching /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/",
  },
  {
    code: "corpus/name",
    kind: "file",
    title: "`corpus.name` is missing or empty",
    remedy: "give the corpus a human-readable name",
  },
  {
    code: "corpus/version",
    kind: "file",
    title: "`corpus.version` is missing or malformed",
    remedy: "use a release string matching /^[A-Za-z0-9][A-Za-z0-9._+-]{0,31}$/",
  },
  {
    code: "corpus/origin",
    kind: "file",
    title: "`corpus.origin` is absent, unknown, or claims to be the internal corpus",
    remedy:
      "set origin to `external` for a third-party corpus or `synthetic-example` for a format fixture; `internal` is refused by design",
  },
  {
    code: "corpus/language",
    kind: "file",
    title: "`corpus.language` is not `python`",
    remedy: "the engines exec CPython source; this build implements no other dialect",
  },
  {
    code: "provenance/field",
    kind: "file",
    title: "a required provenance field is missing or malformed",
    remedy:
      "fill corpus.provenance.{maintainer,source,obtained,method,independence}; `obtained` is an ISO date (YYYY-MM-DD)",
  },
  {
    code: "license/field",
    kind: "file",
    title: "a required licence field is missing or malformed",
    remedy:
      "fill corpus.license.{id,url}; use id `NOASSERTION` if the licence is genuinely unstated, which the run then discloses",
  },
  {
    code: "exercises/missing",
    kind: "file",
    title: "`exercises` is absent or is not an array",
    remedy: "add an `exercises` array; format.schema.json declares its item type",
  },
  {
    code: "exercises/empty",
    kind: "file",
    title: "`exercises` is an empty array",
    remedy:
      "an empty corpus yields no measurement at all; the validator refuses it rather than emitting 0/0",
  },
  {
    code: "exercises/too-many",
    kind: "file",
    title: "`exercises` exceeds the resource cap",
    remedy: `split the corpus, or raise MAX_EXERCISES (${String(MAX_EXERCISES)}) deliberately`,
  },
  {
    code: "alibis/shape",
    kind: "file",
    title: "`candidateAlibis` is present but is not an array",
    remedy: "remove the key or make it an array of candidate records",
  },
  {
    code: "provenance/collides-with-deepforge-corpus",
    kind: "file",
    title:
      "the corpus content digest equals the DeepForge internal corpus digest",
    remedy:
      "this is DeepForge's own corpus, not an external one; measure it with `bun run verify:bdl` and do not present it as a replication",
  },
];

export const EXERCISE_RULES: readonly RuleSpec[] = [
  {
    code: "exercise/not-an-object",
    kind: "exercise",
    title: "an `exercises` entry is not a JSON object",
    remedy: "every entry must be an object; remove nulls and stray array elements",
  },
  {
    code: "exercise/unknown-field",
    kind: "exercise",
    title: "an unrecognised exercise field is present",
    remedy:
      "remove it, or move it under `x-<vendor>`; an unknown field is how a misspelled `tests` silently becomes a zero-test exercise",
  },
  {
    code: "exercise/id-missing",
    kind: "exercise",
    title: "the exercise has no `id`",
    remedy: "give every exercise a stable, unique id; it seeds the probe bank",
  },
  {
    code: "exercise/id-invalid",
    kind: "exercise",
    title: "`id` is not URL-safe",
    remedy: "use 1-64 characters matching /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/",
  },
  {
    code: "exercise/id-duplicate",
    kind: "exercise",
    title: "two exercises share an id",
    remedy: "ids must be unique; the id is the probe-bank seed and the record key",
  },
  {
    code: "exercise/reference-missing",
    kind: "exercise",
    title: "`reference` is absent or not a string",
    remedy: "supply the reference solution as a Python source string",
  },
  {
    code: "exercise/reference-empty",
    kind: "exercise",
    title: "`reference` is empty or whitespace only",
    remedy: "supply a non-empty reference solution",
  },
  {
    code: "exercise/reference-too-long",
    kind: "exercise",
    title: "`reference` exceeds the character cap",
    remedy: `keep references at or under ${String(MAX_REFERENCE_CHARS)} characters, or split the exercise`,
  },
  {
    code: "exercise/reference-control-bytes",
    kind: "exercise",
    title: "`reference` contains a NUL or other C0 control character",
    remedy: "remove the control character; JSON escapes it but CPython will not accept it in source",
  },
  {
    code: "exercise/reference-no-def",
    kind: "exercise",
    title: "`reference` defines no function at all",
    remedy: "the engines call a named entry function; supply a `def`",
  },
  {
    code: "exercise/reference-entry-unresolvable",
    kind: "exercise",
    title: "no entry function can be resolved for this exercise",
    remedy:
      "declare `entry` explicitly, or make the first `def` in the source the entry point (the rule both engines use)",
  },
  {
    code: "exercise/category-invalid",
    kind: "exercise",
    title: "`category` is present but is not a short non-empty string",
    remedy: `use 1-${String(MAX_LABEL_CHARS)} characters, or omit the field entirely (the run then reports the taxonomy as undeclared)`,
  },
  {
    code: "exercise/difficulty-invalid",
    kind: "exercise",
    title: "`difficulty` is present but is not a short non-empty string",
    remedy: `use 1-${String(MAX_LABEL_CHARS)} characters, or omit the field (it is carried for slices and never filtered on)`,
  },
  {
    code: "exercise/tests-missing",
    kind: "exercise",
    title: "`tests` is absent or is not an array",
    remedy: "supply at least one `{input, expected}` test case",
  },
  {
    code: "exercise/tests-empty",
    kind: "exercise",
    title: "`tests` is an empty array",
    remedy:
      "an exercise with no test case has no shipped behaviour to be silent about; supply at least one test",
  },
  {
    code: "exercise/test-not-an-object",
    kind: "exercise",
    title: "a `tests` entry is not a JSON object",
    remedy: "every test case must be an object with `input` and `expected`",
  },
  {
    code: "exercise/test-input-missing",
    kind: "exercise",
    title: "a test case has no `input`",
    remedy: "`input` is the positional argument list and is required",
  },
  {
    code: "exercise/test-input-not-array",
    kind: "exercise",
    title: "a test case's `input` is not an array",
    remedy: "`input` is always a list of positional arguments, even for a zero-argument function (`[]`)",
  },
  {
    code: "exercise/test-expected-missing",
    kind: "exercise",
    title: "a test case has no `expected` key",
    remedy:
      "`expected` is required; `null` is a legal value, so the key must be present rather than non-null",
  },
  {
    code: "exercise/test-value-unserializable",
    kind: "exercise",
    title: "a test value nests deeper than the walk limit",
    remedy: `flatten the value below ${String(MAX_VALUE_DEPTH)} levels`,
  },
  {
    code: "exercise/test-unknown-field",
    kind: "exercise",
    title: "a test case carries an unrecognised field",
    remedy: "use only `input` and `expected`, or `x-<vendor>` for extensions",
  },
];

export const ALIBI_RULES: readonly RuleSpec[] = [
  {
    code: "alibi/not-an-object",
    kind: "alibi",
    title: "a `candidateAlibis` entry is not a JSON object",
    remedy: "every candidate must be an object",
  },
  {
    code: "alibi/unknown-field",
    kind: "alibi",
    title: "a candidate carries an unrecognised field",
    remedy: "use id/exerciseId/ghost/witness/func, or `x-<vendor>` for extensions",
  },
  {
    code: "alibi/id-missing",
    kind: "alibi",
    title: "a candidate has no `id`",
    remedy: "give every candidate a stable, unique id",
  },
  {
    code: "alibi/id-invalid",
    kind: "alibi",
    title: "a candidate's `id` is not URL-safe",
    remedy: "use 1-64 characters matching /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/",
  },
  {
    code: "alibi/id-duplicate",
    kind: "alibi",
    title: "two candidates share an id",
    remedy: "candidate ids must be unique",
  },
  {
    code: "alibi/exercise-unknown",
    kind: "alibi",
    title: "a candidate names an `exerciseId` that is not an accepted exercise",
    remedy:
      "point at an exercise id that passed validation; a candidate over a rejected exercise cannot be verified",
  },
  {
    code: "alibi/ghost-missing",
    kind: "alibi",
    title: "`ghost` is absent or not a string",
    remedy: "supply the mined variant as a Python source string",
  },
  {
    code: "alibi/ghost-empty",
    kind: "alibi",
    title: "`ghost` is empty or whitespace only",
    remedy: "supply a non-empty ghost program",
  },
  {
    code: "alibi/ghost-too-long",
    kind: "alibi",
    title: "`ghost` exceeds the character cap",
    remedy: `keep the ghost at or under ${String(MAX_REFERENCE_CHARS)} characters`,
  },
  {
    code: "alibi/witness-missing",
    kind: "alibi",
    title: "`witness` is absent or not a string",
    remedy: "supply the Python literal at which reference and ghost diverge",
  },
  {
    code: "alibi/witness-empty",
    kind: "alibi",
    title: "`witness` is empty or whitespace only",
    remedy: "supply the diverging literal, e.g. \"(0,)\"",
  },
  {
    code: "alibi/witness-too-long",
    kind: "alibi",
    title: "`witness` exceeds the character cap",
    remedy: `keep the witness at or under ${String(MAX_WITNESS_CHARS)} characters (the duel harness limit)`,
  },
  {
    code: "alibi/func-mismatch",
    kind: "alibi",
    title: "a candidate declares a `func` that is not the exercise's entry point",
    remedy: "drop the field to inherit the exercise's entry point, or make the two agree",
  },
];

/** Every rule code the validator can emit, in one table. */
export const ALL_RULES: readonly RuleSpec[] = [
  ...FILE_RULES,
  ...EXERCISE_RULES,
  ...ALIBI_RULES,
];

const RULE_INDEX = new Map(ALL_RULES.map((rule) => [rule.code, rule]));

/** Rule metadata, or undefined for a code that is not in the table. */
export function ruleSpec(code: string): RuleSpec | undefined {
  return RULE_INDEX.get(code);
}

/** `true` when `code` is a rule this build can emit. */
export function isKnownRule(code: string): boolean {
  return RULE_INDEX.has(code);
}

/** Format versions this build implements. Refusing an unknown one is deliberate. */
export const SUPPORTED_FORMAT_VERSIONS: readonly number[] = [CORPUS_FORMAT_VERSION];

/** The fields a corpus file must carry at the top level. */
export const REQUIRED_TOP_LEVEL_FIELDS: readonly string[] = [
  "format",
  "formatVersion",
  "corpus",
  "exercises",
];

/** Every top-level field the format defines. Anything else is a hard rejection. */
export const KNOWN_TOP_LEVEL_FIELDS: readonly string[] = [
  ...REQUIRED_TOP_LEVEL_FIELDS,
  "candidateAlibis",
  "notes",
];

/** Fields the `corpus` object must carry. */
export const REQUIRED_CORPUS_FIELDS: readonly string[] = [
  "id",
  "name",
  "version",
  "origin",
  "language",
  "provenance",
  "license",
];

/** Every field the `corpus` object defines. */
export const KNOWN_CORPUS_FIELDS: readonly string[] = [...REQUIRED_CORPUS_FIELDS];

/** Fields the `corpus.provenance` object must carry. */
export const REQUIRED_PROVENANCE_FIELDS: readonly string[] = [
  "maintainer",
  "source",
  "obtained",
  "method",
  "independence",
];

/** Every field the `corpus.provenance` object defines. */
export const KNOWN_PROVENANCE_FIELDS: readonly string[] = [
  ...REQUIRED_PROVENANCE_FIELDS,
  "contaminationNotes",
  "tooling",
];

/** Fields the `corpus.license` object must carry. */
export const REQUIRED_LICENSE_FIELDS: readonly string[] = ["id", "url"];

/** Every field the `corpus.license` object defines. */
export const KNOWN_LICENSE_FIELDS: readonly string[] = [
  ...REQUIRED_LICENSE_FIELDS,
  "holder",
  "notes",
];

/**
 * Fields an exercise object must carry: exactly the six the engines read.
 * `entry` is optional because both engines fall back to the first `def`.
 */
export const REQUIRED_EXERCISE_FIELDS: readonly string[] = [
  "id",
  "reference",
  "tests",
];

/** Every field an exercise object defines. */
export const KNOWN_EXERCISE_FIELDS: readonly string[] = [
  ...REQUIRED_EXERCISE_FIELDS,
  "title",
  "category",
  "difficulty",
  "entry",
  "source",
  "notes",
];

/** Fields a test case must carry. `expected` is required but may be `null`. */
export const REQUIRED_TEST_FIELDS: readonly string[] = ["input", "expected"];

/** Every field a test case defines. */
export const KNOWN_TEST_FIELDS: readonly string[] = [...REQUIRED_TEST_FIELDS];

/** Fields a candidate alibi must carry. */
export const REQUIRED_ALIBI_FIELDS: readonly string[] = [
  "id",
  "exerciseId",
  "ghost",
  "witness",
];

/** Every field a candidate alibi defines. */
export const KNOWN_ALIBI_FIELDS: readonly string[] = [
  ...REQUIRED_ALIBI_FIELDS,
  "func",
  "minedBy",
  "notes",
];

/** Prefix for vendor extension keys, which are recorded and then ignored. */
export const EXTENSION_PREFIX = "x-";
