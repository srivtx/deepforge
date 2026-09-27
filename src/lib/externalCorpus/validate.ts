/**
 * External-corpus contract — the validator.
 *
 * `validateCorpusFile` is the only door into the methodology. Nothing in
 * `scripts/external-replication.ts` touches an exercise that has not come
 * through here first, and the runner refuses to analyse a corpus this module
 * marked `ok: false`.
 *
 * Three properties matter more than the individual rules, and each one is a
 * direct response to the audit's central methodological finding — *survivorship
 * in what gets filtered before counting*:
 *
 *  1. **No silent filtering.** Every rejected exercise and every rejected
 *     candidate appears in `filterAccounting.rejections` with its id, its
 *     index, a rule code, a one-sentence message naming the offending value, a
 *     remedy, and a JSON path. The identity
 *     `exercisesTotal === exercisesAccepted + exercisesRejected` is asserted
 *     before the report is returned, and a violation is a thrown error, not a
 *     note. The validator never repairs, coerces, defaults, or drops a field.
 *  2. **Disclosures are not filters.** Conditions that make a corpus weaker
 *     without making it unusable — fewer than three tests, a test input too
 *     large to seed a probe, an unasserted licence, an undeclared taxonomy, a
 *     corpus with no candidate alibis at all — are emitted as *advisories*,
 *     counted, and carried into the run report. They never remove an exercise.
 *  3. **Semantic truth belongs to the engines.** This module checks the shape
 *     of the format, not the truth of the content. Whether a reference parses,
 *     whether it passes its own tests, whether a ghost is exactly one line
 *     different from the reference, and whether a witness really diverges are
 *     all properties of `scripts/py_bdl_verify.py` and
 *     `scripts/py_alibi_verify.py`. The validator does not re-implement them;
 *     the run report records the engines' answers in a *separate* ledger
 *     (`analysisExclusions`, `alibiVerification`) that is never merged with the
 *     format ledger above. Conflating the two is how a reader ends up believing
 *     a number has a denominator it does not have.
 *
 * The entry-function rule is the one place where the validator does mirror an
 * engine, and it is mirrored exactly: `resolveEntryPoint` uses the same
 * regular expression as `entry_fn` in `scripts/py_bdl_verify.py:574` and
 * `record["func"]` in `scripts/py_alibi_verify.py:829`, so an exercise the
 * validator accepts is an exercise both engines can load.
 */

import {
  ADVISORY_MIN_TESTS,
  ADVISORY_PROBE_REPR_CHARS,
  ALIBI_RULES,
  CORPUS_FORMAT_TAG,
  CORPUS_ID_PATTERN,
  CORPUS_LANGUAGE,
  CORPUS_VERSION_PATTERN,
  EXERCISE_RULES,
  EXTENSION_PREFIX,
  FILE_RULES,
  ISO_DATE_PATTERN,
  KNOWN_ALIBI_FIELDS,
  KNOWN_CORPUS_FIELDS,
  KNOWN_EXERCISE_FIELDS,
  KNOWN_LICENSE_FIELDS,
  KNOWN_PROVENANCE_FIELDS,
  KNOWN_TEST_FIELDS,
  KNOWN_TOP_LEVEL_FIELDS,
  MAX_CORPUS_NAME_CHARS,
  MAX_EXERCISES,
  MAX_LABEL_CHARS,
  MAX_LICENSE_ID_CHARS,
  MAX_REFERENCE_CHARS,
  MAX_VALUE_DEPTH,
  MAX_WITNESS_CHARS,
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
  ruleSpec,
} from "./constants";
import { sha256OfText } from "./digest";
import {
  INTERNAL_CORPUS_SHA256,
  compareWithInternalCorpus,
  overlapNotPerformed,
} from "./provenance";
import type { OverlapFinding } from "./types";
import type {
  AcceptedAlibi,
  AcceptedExercise,
  Advisory,
  CorpusCandidateAlibi,
  CorpusHeader,
  CorpusLicense,
  CorpusProvenance,
  CorpusTestCase,
  DfCorpusFile,
  FilterAccounting,
  Rejection,
  RuleCounts,
  ValidationReport,
} from "./types";

/* ────────────────────────────── small helpers ───────────────────────────── */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasKey(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function countBy(codes: readonly string[]): RuleCounts {
  const counts: Record<string, number> = {};
  for (const code of codes) counts[code] = (counts[code] ?? 0) + 1;
  return counts;
}

function extensionKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter((key) => key.startsWith(EXTENSION_PREFIX)).sort();
}

function unknownKeys(record: Record<string, unknown>, known: readonly string[]): string[] {
  return Object.keys(record)
    .filter((key) => !known.includes(key) && !key.startsWith(EXTENSION_PREFIX))
    .sort();
}

function isNonEmptyString(value: unknown, max: number): boolean {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

/** Non-empty after trimming, with no length ceiling. Used for free text. */
function isText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * The engines' entry-point rule, mirrored exactly.
 *
 * `scripts/py_bdl_verify.py:574` is
 * `re.search(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", source, re.M)` and takes
 * the first match. `scripts/py_alibi_verify.py:829` reads an explicit `func`
 * instead, which the runner supplies from this function. The two agree by
 * construction, which is the point: a divergence here would show up as a
 * `ref-fails-own-tests` or `no-entry` skip in the engine ledger rather than as
 * a silent mismatch between the format and the measurement.
 */
/**
 * The engines' entry-point rule, mirrored exactly, multiline included.
 *
 * `scripts/py_bdl_verify.py:574` is
 * `re.search(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", source, re.M)`, and
 * `scripts/py_alibi_verify.py:829` reads an explicit `func` the runner supplies
 * from this function.
 *
 * The `m` flag is load-bearing and its absence is a real hazard, not a style
 * point: 878 of the 5,730 exercises in the DeepForge corpus begin with an `import`
 * line, so a non-multiline `^` fails to find their `def` and the validator rejects
 * 15% of a perfectly legitimate corpus for a reason that has nothing to do with the
 * methodology. The pattern below is checked against the real Python regular
 * expression over all 5,730 internal solutions by `tests/external-corpus.test.ts`
 * and by step F8 of `scripts/verify-external-format.ts`, so a future edit to either
 * side is caught rather than believed.
 */
export const ENTRY_POINT_PATTERN = /^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/m;

/**
 * C0 control bytes CPython will not accept in source, minus tab (\\t), newline
 * (\\n) and carriage return (\\r), which are all legal inside a source string.
 */
const CONTROL_BYTES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

/** The entry point the engines will use, or `null` when none is resolvable. */
export function resolveEntryPoint(
  reference: string,
  declared?: string,
): { readonly entry: string | null; readonly declaredValid: boolean } {
  if (declared !== undefined) {
    return declared.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(declared)
      ? { entry: declared, declaredValid: true }
      : { entry: null, declaredValid: false };
  }
  const match = ENTRY_POINT_PATTERN.exec(reference);
  return match && match[1] ? { entry: match[1], declaredValid: true } : { entry: null, declaredValid: false };
}

/** `repr`-length estimate for one test input, in characters.
 *
 *  The engines drop probe candidates whose Python `repr` is `>= 4000`
 *  characters, so a shipped input that large contributes no probes. Python's
 *  `repr` is not reproducible in TypeScript, so this is an estimate built from
 *  `JSON.stringify`, and it is labelled an estimate in the advisory text. It
 *  is deliberately biased high: over-reporting a disclosure is harmless, missing
 *  one is not.
 */
export function estimateReprChars(value: unknown): number {
  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** Walk a JSON value, returning false past the depth limit. */
function withinDepth(value: unknown, depth = 0): boolean {
  if (depth > MAX_VALUE_DEPTH) return false;
  if (Array.isArray(value)) return value.every((item) => withinDepth(item, depth + 1));
  if (isRecord(value)) {
    return Object.values(value).every((item) => withinDepth(item, depth + 1));
  }
  return true;
}

/* ─────────────────────────── the rejection builder ───────────────────────── */

function reject(args: {
  code: string;
  target: string;
  index: number | null;
  message: string;
  path: string;
}): Rejection {
  const spec = ruleSpec(args.code);
  return {
    code: args.code,
    scope: spec?.kind ?? "file",
    target: args.target,
    index: args.index,
    message: args.message,
    remedy: spec?.remedy ?? "see the format specification",
    path: args.path,
  };
}

class Collector {
  readonly rejections: Rejection[] = [];
  readonly advisories: Advisory[] = [];
  /**
   * Distinct rejected items, keyed by scope and array position. One exercise
   * can break three rules and must still count as ONE rejected exercise, so the
   * accounting identity is over items, not over rule violations. The full list
   * of violations stays in `rejections`, which is why `rejections.length` is
   * normally *larger* than the rejected-item count.
   */
  private readonly rejectedItems = new Set<string>();

  reject(args: {
    code: string;
    target: string;
    index: number | null;
    message: string;
    path: string;
  }): void {
    this.rejections.push(reject(args));
    const scope = ruleSpec(args.code)?.kind ?? "file";
    this.rejectedItems.add(
      args.index === null ? `file:${args.target}` : `${scope}:${String(args.index)}`,
    );
  }

  /** How many distinct items were rejected in `scope`. */
  rejectedCount(scope: "file" | "exercise" | "alibi"): number {
    let count = 0;
    for (const key of this.rejectedItems) if (key.startsWith(`${scope}:`)) count += 1;
    return count;
  }

  advise(args: {
    code: string;
    target: string;
    index: number | null;
    message: string;
    count?: number;
  }): void {
    const existing = this.advisories.find(
      (advisory) =>
        advisory.code === args.code && advisory.target === args.target && advisory.index === args.index,
    );
    if (existing) {
      this.advisories.splice(this.advisories.indexOf(existing), 1);
      (existing as { count: number }).count += args.count ?? 1;
      return;
    }
    this.advisories.push({
      code: args.code,
      target: args.target,
      index: args.index,
      message: args.message,
      count: args.count ?? 1,
    });
  }
}

/* ───────────────────────────── file-level rules ─────────────────────────── */

function checkHeaderShape(
  file: Record<string, unknown>,
  collector: Collector,
): CorpusHeader | null {
  let ok = true;

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!hasKey(file, field)) {
      collector.reject({
        code: "field/missing",
        target: "<file>",
        index: null,
        message: `required top-level field "${field}" is absent`,
        path: `/${field}`,
      });
      ok = false;
    }
  }

  const unknown = unknownKeys(file, KNOWN_TOP_LEVEL_FIELDS);
  if (unknown.length > 0) {
    collector.reject({
      code: "file/unknown-field",
      target: "<file>",
      index: null,
      message:
        `unrecognised top-level field(s): ${unknown.join(", ")}; ` +
        `known fields are ${KNOWN_TOP_LEVEL_FIELDS.join(", ")} ` +
        `(prefix a vendor extension with "${EXTENSION_PREFIX}")`,
      path: `/${unknown[0]}`,
    });
    ok = false;
  }

  if (!isRecord(file.corpus)) {
    collector.reject({
      code: "field/type",
      target: "<file>",
      index: null,
      message: `\`corpus\` must be an object, found ${describe(file.corpus)}`,
      path: "/corpus",
    });
    return null;
  }

  const header = file.corpus;
  for (const field of REQUIRED_CORPUS_FIELDS) {
    if (!hasKey(header, field)) {
      collector.reject({
        code: "field/missing",
        target: "<file>",
        index: null,
        message: `required \`corpus.${field}\` is absent`,
        path: `/corpus/${field}`,
      });
      ok = false;
    }
  }
  const unknownCorpus = unknownKeys(header, KNOWN_CORPUS_FIELDS);
  if (unknownCorpus.length > 0) {
    collector.reject({
      code: "file/unknown-field",
      target: "<file>",
      index: null,
      message:
        `unrecognised \`corpus\` field(s): ${unknownCorpus.join(", ")}; ` +
        `known fields are ${KNOWN_CORPUS_FIELDS.join(", ")}`,
      path: `/corpus/${unknownCorpus[0]}`,
    });
    ok = false;
  }

  if (file.format !== undefined && file.format !== CORPUS_FORMAT_TAG) {
    collector.reject({
      code: "format/tag",
      target: "<file>",
      index: null,
      message: `expected "format": "${CORPUS_FORMAT_TAG}", found ${JSON.stringify(file.format)}`,
      path: "/format",
    });
    ok = false;
  }

  if (file.formatVersion !== undefined) {
    if (typeof file.formatVersion !== "number" || !Number.isInteger(file.formatVersion)) {
      collector.reject({
        code: "field/type",
        target: "<file>",
        index: null,
        message: `\`formatVersion\` must be an integer, found ${describe(file.formatVersion)}`,
        path: "/formatVersion",
      });
      ok = false;
    } else if (!SUPPORTED_FORMAT_VERSIONS.includes(file.formatVersion)) {
      collector.reject({
        code: "format/version",
        target: "<file>",
        index: null,
        message:
          `formatVersion ${file.formatVersion} is not implemented by this build; ` +
          `supported: ${SUPPORTED_FORMAT_VERSIONS.join(", ")}`,
        path: "/formatVersion",
      });
      ok = false;
    }
  }

  if (!isNonEmptyString(header.id, 64) || !CORPUS_ID_PATTERN.test(String(header.id ?? ""))) {
    collector.reject({
      code: "corpus/id",
      target: "<file>",
      index: null,
      message: `\`corpus.id\` must match /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/, found ${JSON.stringify(header.id)}`,
      path: "/corpus/id",
    });
    ok = false;
  }

  if (!isNonEmptyString(header.name, MAX_CORPUS_NAME_CHARS)) {
    collector.reject({
      code: "corpus/name",
      target: "<file>",
      index: null,
      message: `\`corpus.name\` must be 1-${String(MAX_CORPUS_NAME_CHARS)} non-blank characters, found ${describe(header.name)}`,
      path: "/corpus/name",
    });
    ok = false;
  }

  if (!isNonEmptyString(header.version, 32) || !CORPUS_VERSION_PATTERN.test(String(header.version ?? ""))) {
    collector.reject({
      code: "corpus/version",
      target: "<file>",
      index: null,
      message: `\`corpus.version\` must match /^[A-Za-z0-9][A-Za-z0-9._+-]{0,31}$/, found ${JSON.stringify(header.version)}`,
      path: "/corpus/version",
    });
    ok = false;
  }

  const origin = header.origin;
  if (origin !== "external" && origin !== "synthetic-example") {
    collector.reject({
      code: "corpus/origin",
      target: "<file>",
      index: null,
      message:
        `\`corpus.origin\` must be "external" or "synthetic-example", found ${JSON.stringify(origin)}; ` +
        '"internal" is refused by design — this tool exists to measure somebody else\'s corpus',
      path: "/corpus/origin",
    });
    ok = false;
  }

  if (header.language !== CORPUS_LANGUAGE) {
    collector.reject({
      code: "corpus/language",
      target: "<file>",
      index: null,
      message: `\`corpus.language\` must be "${CORPUS_LANGUAGE}", found ${JSON.stringify(header.language)}`,
      path: "/corpus/language",
    });
    ok = false;
  }

  const provenanceOk = checkProvenanceShape(header.provenance, collector);
  const licenseOk = checkLicenseShape(header.license, collector);

  for (const key of extensionKeys(file)) {
    collector.advise({
      code: "advisory/ignored-extension",
      target: "<file>",
      index: null,
      message: `vendor extension "${key}" was recorded and ignored; it cannot affect any measurement`,
    });
  }

  if (!ok || !provenanceOk || !licenseOk) return null;

  return {
    id: String(header.id),
    name: String(header.name),
    version: String(header.version),
    origin: origin as "external" | "synthetic-example",
    language: CORPUS_LANGUAGE,
    provenance: header.provenance as CorpusProvenance,
    license: header.license as CorpusLicense,
  };
}

function checkProvenanceShape(value: unknown, collector: Collector): boolean {
  if (!isRecord(value)) {
    collector.reject({
      code: "provenance/field",
      target: "<file>",
      index: null,
      message: `\`corpus.provenance\` must be an object, found ${describe(value)}`,
      path: "/corpus/provenance",
    });
    return false;
  }
  let ok = true;
  for (const field of REQUIRED_PROVENANCE_FIELDS) {
    if (!hasKey(value, field)) {
      collector.reject({
        code: "provenance/field",
        target: "<file>",
        index: null,
        message: `required \`corpus.provenance.${field}\` is absent`,
        path: `/corpus/provenance/${field}`,
      });
      ok = false;
    }
  }
  const unknown = unknownKeys(value, KNOWN_PROVENANCE_FIELDS);
  if (unknown.length > 0) {
    collector.reject({
      code: "file/unknown-field",
      target: "<file>",
      index: null,
      message: `unrecognised \`corpus.provenance\` field(s): ${unknown.join(", ")}`,
      path: `/corpus/provenance/${unknown[0]}`,
    });
    ok = false;
  }
  for (const field of ["maintainer", "source"]) {
    if (hasKey(value, field) && !isText(value[field])) {
      collector.reject({
        code: "provenance/field",
        target: "<file>",
        index: null,
        message: `\`corpus.provenance.${field}\` must be a non-blank string, found ${describe(value[field])}`,
        path: `/corpus/provenance/${field}`,
      });
      ok = false;
    }
  }
  if (hasKey(value, "obtained") && (typeof value.obtained !== "string" || !ISO_DATE_PATTERN.test(value.obtained))) {
    collector.reject({
      code: "provenance/field",
      target: "<file>",
      index: null,
      message: `\`corpus.provenance.obtained\` must be an ISO date (YYYY-MM-DD), found ${JSON.stringify(value.obtained)}`,
      path: "/corpus/provenance/obtained",
    });
    ok = false;
  }
  const methods = ["hand-authored", "generated", "derived", "unknown"];
  if (hasKey(value, "method") && !methods.includes(String(value.method))) {
    collector.reject({
      code: "provenance/field",
      target: "<file>",
      index: null,
      message: `\`corpus.provenance.method\` must be one of ${methods.join(", ")}, found ${JSON.stringify(value.method)}`,
      path: "/corpus/provenance/method",
    });
    ok = false;
  }
  const independences = [
    "independent-from-deepforge",
    "derived-from-deepforge",
    "unknown",
  ];
  if (hasKey(value, "independence") && !independences.includes(String(value.independence))) {
    collector.reject({
      code: "provenance/field",
      target: "<file>",
      index: null,
      message:
        `\`corpus.provenance.independence\` must be one of ${independences.join(", ")}, ` +
        `found ${JSON.stringify(value.independence)}`,
      path: "/corpus/provenance/independence",
    });
    ok = false;
  }
  if (value.independence === "unknown") {
    collector.advise({
      code: "advisory/independence-unknown",
      target: "<corpus>",
      index: null,
      message:
        "the corpus does not declare its independence from DeepForge, so no agreement claim can be made from it",
    });
  }
  if (value.independence === "derived-from-deepforge") {
    collector.advise({
      code: "advisory/independence-declared-derived",
      target: "<corpus>",
      index: null,
      message:
        "the corpus declares itself derived from the DeepForge corpus, so it cannot support a claim of external validity",
    });
  }
  if (value.method === "unknown") {
    collector.advise({
      code: "advisory/provenance-method-unknown",
      target: "<corpus>",
      index: null,
      message: "the corpus does not declare how its exercises were produced",
    });
  }
  return ok;
}

function checkLicenseShape(value: unknown, collector: Collector): boolean {
  if (!isRecord(value)) {
    collector.reject({
      code: "license/field",
      target: "<file>",
      index: null,
      message: `\`corpus.license\` must be an object, found ${describe(value)}`,
      path: "/corpus/license",
    });
    return false;
  }
  let ok = true;
  for (const field of REQUIRED_LICENSE_FIELDS) {
    if (!hasKey(value, field)) {
      collector.reject({
        code: "license/field",
        target: "<file>",
        index: null,
        message: `required \`corpus.license.${field}\` is absent`,
        path: `/corpus/license/${field}`,
      });
      ok = false;
    }
  }
  const unknown = unknownKeys(value, KNOWN_LICENSE_FIELDS);
  if (unknown.length > 0) {
    collector.reject({
      code: "file/unknown-field",
      target: "<file>",
      index: null,
      message: `unrecognised \`corpus.license\` field(s): ${unknown.join(", ")}`,
      path: `/corpus/license/${unknown[0]}`,
    });
    ok = false;
  }
  if (hasKey(value, "id") && !isNonEmptyString(value.id, MAX_LICENSE_ID_CHARS)) {
    collector.reject({
      code: "license/field",
      target: "<file>",
      index: null,
      message: `\`corpus.license.id\` must be 1-${String(MAX_LICENSE_ID_CHARS)} non-blank characters (an SPDX id or NOASSERTION), found ${describe(value.id)}`,
      path: "/corpus/license/id",
    });
    ok = false;
  }
  if (hasKey(value, "url") && !isText(value.url)) {
    collector.reject({
      code: "license/field",
      target: "<file>",
      index: null,
      message: `\`corpus.license.url\` must be a non-blank string, found ${describe(value.url)}`,
      path: "/corpus/license/url",
    });
    ok = false;
  }
  if (value.id === "NOASSERTION") {
    collector.advise({
      code: "advisory/license-unasserted",
      target: "<corpus>",
      index: null,
      message:
        "the corpus declares NOASSERTION for its licence; the run discloses this and any redistribution question is the reader's",
    });
  }
  return ok;
}

function describe(value: unknown): string {
  if (value === undefined) return "nothing";
  if (value === null) return "null";
  if (Array.isArray(value)) return `an array of ${String(value.length)}`;
  if (typeof value === "object") return "an object";
  if (typeof value === "string") return `a string of ${String(value.length)} characters`;
  return `${typeof value} ${JSON.stringify(value)}`;
}

/* ──────────────────────────── exercise-level rules ───────────────────────── */

/** Missing required field -> rule code, per object shape. */
const MISSING_FIELD_RULES: Readonly<Record<string, string>> = {
  id: "exercise/id-missing",
  reference: "exercise/reference-missing",
  tests: "exercise/tests-missing",
};

function checkExercise(
  value: unknown,
  index: number,
  seenIds: Map<string, number>,
  collector: Collector,
): AcceptedExercise | null {
  const at = `/exercises/${String(index)}`;
  if (!isRecord(value)) {
    collector.reject({
      code: "exercise/not-an-object",
      target: `#${String(index)}`,
      index,
      message: `exercises[${String(index)}] must be an object, found ${describe(value)}`,
      path: at,
    });
    return null;
  }

  const id = typeof value.id === "string" && value.id.length > 0 ? value.id : null;
  const target = id ?? `#${String(index)}`;
  let rejected = false;

  for (const field of REQUIRED_EXERCISE_FIELDS) {
    if (hasKey(value, field)) continue;
    rejected = true;
    collector.reject({
      code: MISSING_FIELD_RULES[field] ?? "exercise/unknown-field",
      target,
      index,
      message: `exercises[${String(index)}] has no "${field}"`,
      path: `${at}/${field}`,
    });
  }

  const unknown = unknownKeys(value, KNOWN_EXERCISE_FIELDS);
  if (unknown.length > 0) {
    rejected = true;
    collector.reject({
      code: "exercise/unknown-field",
      target,
      index,
      message:
        `exercises[${String(index)}] carries unrecognised field(s): ${unknown.join(", ")}; ` +
        `known fields are ${KNOWN_EXERCISE_FIELDS.join(", ")} ` +
        `(a misspelled field is how a real exercise silently becomes a zero-test one)`,
      path: `${at}/${unknown[0]}`,
    });
  }

  if (id !== null && !CORPUS_ID_PATTERN.test(id)) {
    rejected = true;
    collector.reject({
      code: "exercise/id-invalid",
      target,
      index,
      message: `\`id\` must match /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/, found ${JSON.stringify(id)}`,
      path: `${at}/id`,
    });
  } else if (id !== null) {
    const previous = seenIds.get(id);
    if (previous !== undefined) {
      rejected = true;
      collector.reject({
        code: "exercise/id-duplicate",
        target,
        index,
        message: `\`id\` "${id}" is already used by exercises[${String(previous)}]`,
        path: `${at}/id`,
      });
    } else {
      seenIds.set(id, index);
    }
  }

  if (hasKey(value, "category") && !isNonEmptyString(value.category, MAX_LABEL_CHARS)) {
    rejected = true;
    collector.reject({
      code: "exercise/category-invalid",
      target,
      index,
      message: `\`category\` must be 1-${String(MAX_LABEL_CHARS)} non-blank characters, found ${describe(value.category)}`,
      path: `${at}/category`,
    });
  }
  if (hasKey(value, "difficulty") && !isNonEmptyString(value.difficulty, MAX_LABEL_CHARS)) {
    rejected = true;
    collector.reject({
      code: "exercise/difficulty-invalid",
      target,
      index,
      message: `\`difficulty\` must be 1-${String(MAX_LABEL_CHARS)} non-blank characters, found ${describe(value.difficulty)}`,
      path: `${at}/difficulty`,
    });
  }

  const reference = value.reference;
  if (!hasKey(value, "reference") || typeof reference !== "string") {
    if (hasKey(value, "reference")) rejected = true;
    collector.reject({
      code: "exercise/reference-missing",
      target,
      index,
      message: `\`reference\` must be a Python source string, found ${describe(reference)}`,
      path: `${at}/reference`,
    });
  } else if (reference.trim().length === 0) {
    rejected = true;
    collector.reject({
      code: "exercise/reference-empty",
      target,
      index,
      message: "`reference` is empty or whitespace only",
      path: `${at}/reference`,
    });
  } else if (reference.length > MAX_REFERENCE_CHARS) {
    rejected = true;
    collector.reject({
      code: "exercise/reference-too-long",
      target,
      index,
      message: `\`reference\` is ${String(reference.length)} characters, over the ${String(MAX_REFERENCE_CHARS)}-character cap`,
      path: `${at}/reference`,
    });
  } else if (CONTROL_BYTES.test(reference)) {
    rejected = true;
    collector.reject({
      code: "exercise/reference-control-bytes",
      target,
      index,
      message: "`reference` contains a C0 control character that CPython will not accept in source",
      path: `${at}/reference`,
    });
  } else if (!ENTRY_POINT_PATTERN.test(reference)) {
    rejected = true;
    collector.reject({
      code: "exercise/reference-no-def",
      target,
      index,
      message: "`reference` defines no function, so neither engine has anything to call",
      path: `${at}/reference`,
    });
  }

  const tests = value.tests;
  const validTests: CorpusTestCase[] = [];
  let testsUsable = false;
  if (!hasKey(value, "tests") || !Array.isArray(tests)) {
    if (hasKey(value, "tests")) rejected = true;
    collector.reject({
      code: "exercise/tests-missing",
      target,
      index,
      message: `\`tests\` must be an array of {input, expected}, found ${describe(tests)}`,
      path: `${at}/tests`,
    });
  } else if (tests.length === 0) {
    rejected = true;
    collector.reject({
      code: "exercise/tests-empty",
      target,
      index,
      message:
        "`tests` is empty: an exercise with no shipped test has no behaviour to be silent about",
      path: `${at}/tests`,
    });
  } else {
    for (let testIndex = 0; testIndex < tests.length; testIndex += 1) {
      const test = tests[testIndex];
      const testAt = `${at}/tests/${String(testIndex)}`;
      if (!isRecord(test)) {
        rejected = true;
        collector.reject({
          code: "exercise/test-not-an-object",
          target,
          index,
          message: `tests[${String(testIndex)}] must be an object, found ${describe(test)}`,
          path: testAt,
        });
        continue;
      }
      const unknownTest = unknownKeys(test, KNOWN_TEST_FIELDS);
      if (unknownTest.length > 0) {
        rejected = true;
        collector.reject({
          code: "exercise/test-unknown-field",
          target,
          index,
          message: `tests[${String(testIndex)}] carries unrecognised field(s): ${unknownTest.join(", ")}`,
          path: `${testAt}/${unknownTest[0]}`,
        });
      }
      for (const field of REQUIRED_TEST_FIELDS) {
        if (hasKey(test, field)) continue;
        rejected = true;
        collector.reject({
          code:
            field === "input"
              ? "exercise/test-input-missing"
              : "exercise/test-expected-missing",
          target,
          index,
          message: `tests[${String(testIndex)}] has no "${field}"; the key must be present even when the value is null`,
          path: `${testAt}/${field}`,
        });
      }
      if (hasKey(test, "input") && !Array.isArray(test.input)) {
        rejected = true;
        collector.reject({
          code: "exercise/test-input-not-array",
          target,
          index,
          message: `tests[${String(testIndex)}].input must be the positional argument array (use [] for no arguments), found ${describe(test.input)}`,
          path: `${testAt}/input`,
        });
      }
      if (hasKey(test, "expected") && hasKey(test, "input") && !withinDepth(test.input)) {
        rejected = true;
        collector.reject({
          code: "exercise/test-value-unserializable",
          target,
          index,
          message: `tests[${String(testIndex)}].input nests deeper than ${String(MAX_VALUE_DEPTH)} levels`,
          path: `${testAt}/input`,
        });
      }
      if (Array.isArray(test.input) && hasKey(test, "expected") && withinDepth(test.input)) {
        validTests.push({ input: test.input as readonly unknown[], expected: test.expected });
        const repr = estimateReprChars(test.input);
        if (repr >= ADVISORY_PROBE_REPR_CHARS) {
          collector.advise({
            code: "advisory/test-input-repr-over-engine-cap",
            target,
            index,
            message:
              `a shipped test input serialises to about ${String(repr)} characters (estimate); ` +
              `the probe bank drops candidates at ${String(ADVISORY_PROBE_REPR_CHARS)}, so this input seeds no probes`,
            count: 1,
          });
        }
      }
    }
    testsUsable = validTests.length === tests.length;
  }

  if (value.entry !== undefined && typeof value.entry !== "string") {
    rejected = true;
    collector.reject({
      code: "exercise/reference-entry-unresolvable",
      target,
      index,
      message: `\`entry\` must be a function name string, found ${describe(value.entry)}`,
      path: `${at}/entry`,
    });
  }

  if (rejected || !testsUsable || typeof reference !== "string") return null;

  const resolved = resolveEntryPoint(
    reference,
    typeof value.entry === "string" ? value.entry : undefined,
  );
  if (resolved.entry === null) {
    collector.reject({
      code: "exercise/reference-entry-unresolvable",
      target,
      index,
      message:
        value.entry === undefined
          ? "no entry function could be resolved: `reference` has no `def` where the engines look for one"
          : `declared \`entry\` ${JSON.stringify(value.entry)} is not a Python identifier`,
      path: `${at}/entry`,
    });
    return null;
  }

  if (validTests.length < ADVISORY_MIN_TESTS) {
    collector.advise({
      code: "advisory/tests-below-three",
      target,
      index,
      message:
        `${String(validTests.length)} shipped test(s); the probe bank perturbs only the first three, ` +
        "so a smaller basis and a higher `small-basis` skip rate are expected",
    });
  }
  const seenInputs = new Set<string>();
  let duplicates = 0;
  for (const test of validTests) {
    const key = JSON.stringify(test.input);
    if (seenInputs.has(key)) duplicates += 1;
    seenInputs.add(key);
  }
  if (duplicates > 0) {
    collector.advise({
      code: "advisory/duplicate-test-input",
      target,
      index,
      message: `${String(duplicates)} shipped test(s) repeat an input already present`,
      count: duplicates,
    });
  }

  return {
    id: id ?? "",
    reference,
    entry: resolved.entry,
    tests: validTests,
    category: typeof value.category === "string" ? value.category : null,
    difficulty: typeof value.difficulty === "string" ? value.difficulty : null,
    categoryUndeclared: typeof value.category !== "string",
    difficultyUndeclared: typeof value.difficulty !== "string",
    title: typeof value.title === "string" ? value.title : null,
    source: typeof value.source === "string" ? value.source : null,
  };
}

function checkAlibi(
  value: unknown,
  index: number,
  seenIds: Map<string, number>,
  exercises: ReadonlyMap<string, AcceptedExercise>,
  collector: Collector,
): AcceptedAlibi | null {
  const at = `/candidateAlibis/${String(index)}`;
  if (!isRecord(value)) {
    collector.reject({
      code: "alibi/not-an-object",
      target: `#${String(index)}`,
      index,
      message: `candidateAlibis[${String(index)}] must be an object, found ${describe(value)}`,
      path: at,
    });
    return null;
  }
  const id = typeof value.id === "string" && value.id.length > 0 ? value.id : null;
  const target = id ?? `#${String(index)}`;

  for (const field of REQUIRED_ALIBI_FIELDS) {
    if (!hasKey(value, field)) {
      collector.reject({
        code: field === "id" ? "alibi/id-missing" : "alibi/ghost-missing",
        target,
        index,
        message: `candidateAlibis[${String(index)}] has no "${field}"`,
        path: `${at}/${field}`,
      });
    }
  }

  const unknown = unknownKeys(value, KNOWN_ALIBI_FIELDS);
  if (unknown.length > 0) {
    collector.reject({
      code: "alibi/unknown-field",
      target,
      index,
      message: `candidateAlibis[${String(index)}] carries unrecognised field(s): ${unknown.join(", ")}`,
      path: `${at}/${unknown[0]}`,
    });
  }

  if (id !== null && !CORPUS_ID_PATTERN.test(id)) {
    collector.reject({
      code: "alibi/id-invalid",
      target,
      index,
      message: `\`id\` must match /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/, found ${JSON.stringify(id)}`,
      path: `${at}/id`,
    });
  } else if (id !== null) {
    const previous = seenIds.get(id);
    if (previous !== undefined) {
      collector.reject({
        code: "alibi/id-duplicate",
        target,
        index,
        message: `\`id\` "${id}" is already used by candidateAlibis[${String(previous)}]`,
        path: `${at}/id`,
      });
    } else {
      seenIds.set(id, index);
    }
  }

  const exerciseId = typeof value.exerciseId === "string" ? value.exerciseId : null;
  if (exerciseId !== null) {
    if (!exercises.has(exerciseId)) {
      collector.reject({
        code: "alibi/exercise-unknown",
        target,
        index,
        message: `\`exerciseId\` ${JSON.stringify(exerciseId)} is not an accepted exercise in this file`,
        path: `${at}/exerciseId`,
      });
    }
  }

  const ghost = value.ghost;
  if (!hasKey(value, "ghost") || typeof ghost !== "string") {
    collector.reject({
      code: "alibi/ghost-missing",
      target,
      index,
      message: `\`ghost\` must be a Python source string, found ${describe(ghost)}`,
      path: `${at}/ghost`,
    });
  } else if (ghost.trim().length === 0) {
    collector.reject({
      code: "alibi/ghost-empty",
      target,
      index,
      message: "`ghost` is empty or whitespace only",
      path: `${at}/ghost`,
    });
  } else if (ghost.length > MAX_REFERENCE_CHARS) {
    collector.reject({
      code: "alibi/ghost-too-long",
      target,
      index,
      message: `\`ghost\` is ${String(ghost.length)} characters, over the ${String(MAX_REFERENCE_CHARS)}-character cap`,
      path: `${at}/ghost`,
    });
  }

  const witness = value.witness;
  if (!hasKey(value, "witness") || typeof witness !== "string") {
    collector.reject({
      code: "alibi/witness-missing",
      target,
      index,
      message: `\`witness\` must be a Python literal string, found ${describe(witness)}`,
      path: `${at}/witness`,
    });
  } else if (witness.trim().length === 0) {
    collector.reject({
      code: "alibi/ghost-empty",
      target,
      index,
      message: "`witness` is empty or whitespace only",
      path: `${at}/witness`,
    });
  } else if (witness.length > MAX_WITNESS_CHARS) {
    collector.reject({
      code: "alibi/witness-too-long",
      target,
      index,
      message: `\`witness\` is ${String(witness.length)} characters, over the ${String(MAX_WITNESS_CHARS)}-character cap (the duel harness limit)`,
      path: `${at}/witness`,
    });
  }

  const exercise = exerciseId === null ? undefined : exercises.get(exerciseId);
  if (exercise && hasKey(value, "func") && typeof value.func === "string" && value.func !== exercise.entry) {
    collector.reject({
      code: "alibi/func-mismatch",
      target,
      index,
      message: `declared \`func\` ${JSON.stringify(value.func)} is not the entry point ${JSON.stringify(exercise.entry)} of exercise ${JSON.stringify(exerciseId)}`,
      path: `${at}/func`,
    });
  }

  const ok = (typeof ghost === "string" && ghost.trim().length > 0) &&
    (typeof witness === "string" && witness.trim().length > 0) &&
    exercise !== undefined;
  if (!ok) return null;
  return {
    id: id ?? "",
    exerciseId: exerciseId as string,
    ghost: ghost as string,
    witness: witness as string,
    func: exercise?.entry ?? "",
  };
}

/* ─────────────────────────────── entry point ────────────────────────────── */

/** Options for {@link validateCorpusFile}. */
export interface ValidateOptions {
  /**
   * Run the overlap check against the DeepForge internal corpus. It is a
   * disclosure, never a filter, and it is on by default because it is the
   * mechanism that stops an internal corpus from being presented as an external
   * one. Turning it off is recorded in the report.
   */
  readonly overlapCheck?: boolean;
}

/**
 * The overlap finding for a candidate corpus, computed from the exercises that
 * actually passed validation. A disclosure, never a filter: an overlapping
 * corpus is still measured, and the comparison then refuses to call it
 * independent.
 */
export function overlapFindingFor(
  accepted: readonly AcceptedExercise[],
  enabled: boolean,
): OverlapFinding {
  if (!enabled) {
    return {
      performed: false,
      status: "not-performed",
      sharedReferences: 0,
      exercises: accepted.length,
      sharedIds: 0,
      isTheInternalCorpus: false,
      doesNotEstablish: "the overlap check was disabled for this run",
    };
  }
  const declared = accepted.every(
    (exercise) => exercise.category !== null && exercise.difficulty !== null,
  );
  const projectionDigest = declared
    ? sha256OfText(
        JSON.stringify(
          accepted.map((exercise) => ({
            id: exercise.id,
            category: exercise.category,
            difficulty: exercise.difficulty,
            solution: exercise.reference,
            testCases: exercise.tests,
          })),
        ),
      )
    : null;
  const finding = compareWithInternalCorpus({
    ids: accepted.map((exercise) => exercise.id),
    references: accepted.map((exercise) => exercise.reference),
    projectionDigest,
  });
  if (projectionDigest === null) {
    return {
      ...finding,
      status: "not-applicable",
      doesNotEstablish:
        "the whole-corpus digest comparison was skipped because at least one " +
        "exercise left `category` or `difficulty` undeclared, so the corpus " +
        `cannot be projected onto the internal corpus's field set. ${finding.doesNotEstablish}`,
    };
  }
  return finding;
}

/** A finding for a corpus that never got as far as producing exercises. */
export function overlapFindingUnavailable(reason: string): OverlapFinding {
  return overlapNotPerformed(0, reason);
}

/**
 * Validate a parsed corpus document.
 *
 * Returns a {@link ValidationReport} in every case: a total failure is a report
 * with `corpusUsable: false` and the fatal rejections listed, not a thrown
 * error, so a caller can always print the accounting. The one thrown condition
 * is an internal invariant — the filter accounting failing to balance — which
 * would mean the validator itself is wrong.
 */
export function validateCorpusFile(
  input: unknown,
  options: ValidateOptions = {},
): ValidationReport {
  const collector = new Collector();

  if (!isRecord(input)) {
    collector.reject({
      code: "file/not-object",
      target: "<file>",
      index: null,
      message: `the top level of a corpus file must be a JSON object, found ${describe(input)}`,
      path: "",
    });
    return unusable(collector, options);
  }

  const header = checkHeaderShape(input, collector);
  if (header === null) {
    return unusable(collector, options);
  }

  const rawExercises = input.exercises;
  if (!Array.isArray(rawExercises)) {
    collector.reject({
      code: "exercises/missing",
      target: "<file>",
      index: null,
      message: `\`exercises\` must be an array, found ${describe(rawExercises)}`,
      path: "/exercises",
    });
    return unusable(collector, options);
  }
  if (rawExercises.length === 0) {
    collector.reject({
      code: "exercises/empty",
      target: "<file>",
      index: null,
      message: "`exercises` is empty: there is nothing to measure, and 0/0 is not a result",
      path: "/exercises",
    });
    return unusable(collector, options);
  }
  if (rawExercises.length > MAX_EXERCISES) {
    collector.reject({
      code: "exercises/too-many",
      target: "<file>",
      index: null,
      message: `\`exercises\` has ${String(rawExercises.length)} entries, over the ${String(MAX_EXERCISES)} cap`,
      path: "/exercises",
    });
    return unusable(collector, options);
  }

  const seenExerciseIds = new Map<string, number>();
  const acceptedExercises: AcceptedExercise[] = [];
  const exercisesById = new Map<string, AcceptedExercise>();
  for (let index = 0; index < rawExercises.length; index += 1) {
    const accepted = checkExercise(rawExercises[index], index, seenExerciseIds, collector);
    if (accepted !== null && accepted.id.length > 0) {
      acceptedExercises.push(accepted);
      exercisesById.set(accepted.id, accepted);
    }
  }

  if (acceptedExercises.length === 0) {
    collector.advise({
      code: "advisory/no-accepted-exercises",
      target: "<corpus>",
      index: null,
      message: "no exercise passed validation, so the run will measure nothing",
    });
  }

  const seenAlibiIds = new Map<string, number>();
  const acceptedAlibis: AcceptedAlibi[] = [];
  const rawAlibis = input.candidateAlibis;
  if (rawAlibis !== undefined) {
    if (!Array.isArray(rawAlibis)) {
      collector.reject({
        code: "alibis/shape",
        target: "<file>",
        index: null,
        message: `\`candidateAlibis\` must be an array when present, found ${describe(rawAlibis)}`,
        path: "/candidateAlibis",
      });
    } else {
      for (let index = 0; index < rawAlibis.length; index += 1) {
        const accepted = checkAlibi(
          rawAlibis[index],
          index,
          seenAlibiIds,
          exercisesById,
          collector,
        );
        if (accepted !== null) acceptedAlibis.push(accepted);
      }
      if (rawAlibis.length === 0) {
        collector.advise({
          code: "advisory/no-candidate-alibis",
          target: "<corpus>",
          index: null,
          message:
            "`candidateAlibis` is present but empty: the run will make no statement about silent failures",
        });
      }
    }
  } else {
    collector.advise({
      code: "advisory/no-candidate-alibis",
      target: "<corpus>",
      index: null,
      message:
        "the corpus declares no candidate alibis, so the Alibi Distance side of the methodology will not run and nothing may be concluded from it",
    });
  }

  const overlap = overlapFindingFor(acceptedExercises, options.overlapCheck !== false);

  // The one fatal rule that depends on the corpus content rather than its
  // shape: a corpus that *is* the DeepForge corpus cannot be an external one.
  if (overlap.isTheInternalCorpus) {
    collector.reject({
      code: "provenance/collides-with-deepforge-corpus",
      target: "<file>",
      index: null,
      message:
        `the corpus content digest equals the published DeepForge internal digest ` +
        `(${INTERNAL_CORPUS_SHA256}); this is DeepForge's own corpus, not an external one`,
      path: "/exercises",
    });
  }

  const exerciseRejections = collector.rejections.filter((entry) => entry.scope === "exercise");
  const alibiRejections = collector.rejections.filter((entry) => entry.scope === "alibi");
  const remainingFatal = collector.rejections.filter((entry) => entry.scope === "file");

  const accounting: FilterAccounting = {
    exercisesTotal: rawExercises.length,
    exercisesAccepted: acceptedExercises.length,
    exercisesRejected: collector.rejectedCount("exercise"),
    rejectionsByRule: countBy(exerciseRejections.map((entry) => entry.code)),
    rejections: exerciseRejections,
    alibisTotal: Array.isArray(rawAlibis) ? rawAlibis.length : 0,
    alibisAccepted: acceptedAlibis.length,
    alibisRejected: collector.rejectedCount("alibi"),
    alibiRejectionsByRule: countBy(alibiRejections.map((entry) => entry.code)),
    alibiRejections: alibiRejections,
    advisories: collector.advisories,
    advisoryCounts: countBy(collector.advisories.map((advisory) => advisory.code)),
    balances:
      rawExercises.length ===
        acceptedExercises.length + collector.rejectedCount("exercise") &&
      (Array.isArray(rawAlibis) ? rawAlibis.length : 0) ===
        acceptedAlibis.length + collector.rejectedCount("alibi"),
  };
  assertBalances(accounting);

  return {
    schema: VALIDATION_SCHEMA_TAG,
    schemaVersion: VALIDATION_SCHEMA_VERSION,
    ok: collector.rejections.length === 0,
    corpus: {
      id: header.id,
      name: header.name,
      version: header.version,
      origin: header.origin,
      language: header.language,
      maintainer: header.provenance.maintainer,
      independence: header.provenance.independence,
      licenseId: header.license.id,
    },
    filterAccounting: accounting,
    accepted: acceptedExercises,
    acceptedAlibis,
    corpusUsable: remainingFatal.length === 0,
    fatal: remainingFatal,
  };
}

function assertBalances(accounting: FilterAccounting): void {
  const {
    exercisesTotal,
    exercisesAccepted,
    exercisesRejected,
    alibisTotal,
    alibisAccepted,
    alibisRejected,
  } = accounting;
  if (
    exercisesTotal !== exercisesAccepted + exercisesRejected ||
    alibisTotal !== alibisAccepted + alibisRejected
  ) {
    throw new Error(
      "external-corpus validator invariant violated: " +
        `${String(exercisesTotal)} exercises != ${String(exercisesAccepted)} accepted + ${String(exercisesRejected)} rejected; ` +
        `${String(alibisTotal)} candidates != ${String(alibisAccepted)} accepted + ${String(alibisRejected)} rejected`,
    );
  }
}

function unusable(collector: Collector, options: ValidateOptions): ValidationReport {
  const rejections = collector.rejections;
  const accounting: FilterAccounting = {
    exercisesTotal: 0,
    exercisesAccepted: 0,
    exercisesRejected: 0,
    rejectionsByRule: countBy(rejections.filter((entry) => entry.scope === "file").map((entry) => entry.code)),
    rejections: [],
    alibisTotal: 0,
    alibisAccepted: 0,
    alibisRejected: 0,
    alibiRejectionsByRule: countBy(rejections.filter((entry) => entry.scope === "alibi").map((entry) => entry.code)),
    alibiRejections: [],
    advisories: collector.advisories,
    advisoryCounts: countBy(collector.advisories.map((advisory) => advisory.code)),
    balances: true,
  };
  void options;
  return {
    schema: VALIDATION_SCHEMA_TAG,
    schemaVersion: VALIDATION_SCHEMA_VERSION,
    ok: false,
    corpus: null,
    filterAccounting: accounting,
    accepted: [],
    acceptedAlibis: [],
    corpusUsable: false,
    fatal: rejections,
  };
}

/**
 * Compose the alibi verifier's input records from the accepted candidates.
 *
 * The verifier (`scripts/py_alibi_verify.py:829`) wants `{id, reference, ghost,
 * func, tests, witness}`. The reference and the tests come from the *exercise*,
 * never from the candidate, so a candidate can never carry a stale copy of the
 * program it claims to differ from. This function is the only place that
 * composition happens, and it is a pure function of validated input.
 */
export function composeAlibiBank(
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

/** The projection the BDL analyzer consumes, in the engine's own field names. */
export function composeAnalyzerCorpus(
  exercises: readonly AcceptedExercise[],
): readonly Record<string, unknown>[] {
  return exercises.map((exercise) => ({
    id: exercise.id,
    category: exercise.category ?? "unspecified",
    difficulty: exercise.difficulty ?? "unspecified",
    solution: exercise.reference,
    testCases: exercise.tests.map((test) => ({ input: test.input, expected: test.expected })),
  }));
}

/** The provenance object a run report carries, derived from the header. */
export function runProvenance(
  header: CorpusHeader,
  contentDigest: string,
  overlap: OverlapFinding,
): {
  kind: "external" | "synthetic-example";
  corpusId: string;
  corpusName: string;
  corpusVersion: string;
  corpusContentDigest: string;
  maintainer: string;
  source: string;
  obtained: string;
  method: CorpusProvenance["method"];
  independence: CorpusProvenance["independence"];
  licenseId: string;
  licenseUrl: string;
  synthetic: boolean;
  notAScientificResult: boolean;
  label: string;
  overlapWithInternalCorpus: OverlapFinding;
} {
  const synthetic = header.origin === "synthetic-example";
  return {
    kind: header.origin,
    corpusId: header.id,
    corpusName: header.name,
    corpusVersion: header.version,
    corpusContentDigest: contentDigest,
    maintainer: header.provenance.maintainer,
    source: header.provenance.source,
    obtained: header.provenance.obtained,
    method: header.provenance.method,
    independence: header.provenance.independence,
    licenseId: header.license.id,
    licenseUrl: header.license.url,
    synthetic,
    notAScientificResult: synthetic,
    label: synthetic
      ? `SYNTHETIC EXAMPLE (not a scientific corpus) ${header.id}@${header.version}`
      : `EXTERNAL CORPUS ${header.id}@${header.version}`,
    overlapWithInternalCorpus: overlap,
  };
}

/** The corpus header, re-read from a validated document (for the runner). */
export function headerOf(input: unknown): CorpusHeader {
  if (!isRecord(input) || !isRecord(input.corpus)) {
    throw new Error("external-corpus: cannot read a corpus header from a non-object document");
  }
  return input.corpus as unknown as CorpusHeader;
}

/** The declared candidate alibis, for a runner that wants to report "none". */
export function candidatesOf(input: unknown): readonly CorpusCandidateAlibi[] {
  if (!isRecord(input) || !Array.isArray(input.candidateAlibis)) return [];
  return input.candidateAlibis as CorpusCandidateAlibi[];
}

/** Every rule code, for the validator's `--list-rules` output. */
export const VALIDATOR_RULES = {
  file: FILE_RULES,
  exercise: EXERCISE_RULES,
  alibi: ALIBI_RULES,
} as const;

/** A `DfCorpusFile` cast of a document that has already been validated. */
export function asCorpusFile(input: unknown): DfCorpusFile {
  return input as DfCorpusFile;
}
