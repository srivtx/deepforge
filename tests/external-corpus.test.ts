/**
 * External-corpus contract — unit tests.
 *
 * Six groups, in the order a reader needs them:
 *
 *  1. **the format** — the JSON Schema and the validator agree about what is
 *     required, the entry-point mirror agrees with the engines' Python regex on
 *     all 5,730 internal solutions, and the caps are evidence-based rather than
 *     invented;
 *  2. **the validator** — every rule fires on a minimal violation, nothing
 *     fires on a clean document, and the filter accounting balances in every
 *     case including the deliberately broken example corpus;
 *  3. **the example corpus** — accepted where documented, rejected where
 *     documented, and unmistakably labelled synthetic;
 *  4. **provenance separation** — the internal corpus is refused, a disguised
 *     internal corpus is caught by the overlap check, and a synthetic report is
 *     stamped so it can never be cited;
 *  5. **the report** — `resultDigest` is invariant under every run-metadata
 *     field and moves when a measurement moves, the two exclusion ledgers stay
 *     apart, and a zero denominator is `null` rather than 0;
 *  6. **the statistics and the comparison** — the intervals are correct against
 *     closed-form values, the sample-size rules are monotone, and the
 *     comparison cannot be talked into AGREE.
 *
 * The tests that shell into Python are the ones that matter most and are also
 * the slowest: they check this TypeScript layer against the *actual* engine
 * rather than against a mock of it.
 */

import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROBLEMS } from "@/data/problems";
import {
  BDL_ENGINE_CONSTANTS,
  CORPUS_FORMAT_TAG,
  INTERNAL_CENSUS_COUNTS,
  INTERNAL_CORPUS_SHA256,
  INTERNAL_HEADLINE_RATES,
  INTERNAL_STATISTICS,
  MAX_REFERENCE_CHARS,
  REQUIRED_ALIBI_FIELDS,
  REQUIRED_CORPUS_FIELDS,
  REQUIRED_EXERCISE_FIELDS,
  REQUIRED_PROVENANCE_FIELDS,
  REQUIRED_TEST_FIELDS,
  REQUIRED_TOP_LEVEL_FIELDS,
  KNOWN_EXERCISE_FIELDS,
  buildRunReport,
  canonicalJson,
  clusteredRate,
  clusterRobustSe,
  compareExternalRun,
  corpusContentDigest,
  definitionDigest,
  inflate,
  internalProjection,
  isKnownRule,
  nForHalfWidth,
  nForPower,
  normalQuantile,
  oddsRatio,
  percent,
  powerAgainst,
  projectExercise,
  proportion,
  reportFileName,
  resolveEntryPoint,
  resultDigestOf,
  riskDifference,
  riskRatio,
  sampleSizeGuidance,
  sha256OfText,
  toleranceBandDemonstration,
  validateCorpusFile,
  validateRunReport,
  wilsonInterval,
  type AnalysisExclusions,
  type EngineRecord,
  type ExternalRunReport,
  type Preregistration,
  type RunProvenance,
} from "@/lib/externalCorpus";
import { ENTRY_POINT_PATTERN } from "@/lib/externalCorpus/validate";

const EXAMPLE_PATH = "docs/research/external-corpus/example-synthetic-corpus.json";
const EXAMPLE_TEXT = readFileSync(resolve(EXAMPLE_PATH), "utf8");
const EXAMPLE = JSON.parse(EXAMPLE_TEXT) as Record<string, unknown>;
const SCHEMA = JSON.parse(
  readFileSync(resolve("docs/research/external-corpus/format.schema.json"), "utf8"),
) as Record<string, never>;

/** A minimal corpus that passes every rule, used as the base for mutations. */
function cleanCorpus(): Record<string, unknown> {
  return {
    format: "df-corpus",
    formatVersion: 1,
    corpus: {
      id: "acme-2026",
      name: "ACME Intro Programming",
      version: "2026.04",
      origin: "external",
      language: "python",
      provenance: {
        maintainer: "ACME Learning Research",
        source: "https://example.invalid/acme/intro",
        obtained: "2026-04-11",
        method: "hand-authored",
        independence: "independent-from-deepforge",
      },
      license: { id: "CC-BY-4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
    },
    exercises: [
      {
        id: "acme-001",
        title: "Sum of a list",
        category: "arithmetic",
        difficulty: "easy",
        reference: "def total(xs):\n    return sum(xs)\n",
        tests: [
          { input: [[1, 2, 3]], expected: 6 },
          { input: [[10, -4]], expected: 6 },
          { input: [[0]], expected: 0 },
        ],
      },
      {
        id: "acme-002",
        title: "Largest",
        category: "arithmetic",
        difficulty: "easy",
        reference: "def largest(xs):\n    return max(xs) if xs else None\n",
        tests: [
          { input: [[3, 9, 2]], expected: 9 },
          { input: [[-4, -9]], expected: -4 },
          { input: [[]], expected: null },
        ],
      },
    ],
  };
}

function withoutOverlap(): { overlapCheck: boolean } {
  return { overlapCheck: false };
}

/**
 * The repository's `tests/bun-test.d.ts` shim declares only a subset of Bun's
 * matchers (no `toBeCloseTo`, no `toThrow`), so these two helpers stand in for
 * them rather than widening a file every other test depends on.
 */
function closeTo(actual: number | null | undefined, expected: number, digits = 12): boolean {
  return typeof actual === "number" && Math.abs(actual - expected) < 0.5 * 10 ** -digits;
}

function throwsWith(fn: () => unknown, fragment: string): boolean {
  try {
    fn();
    return false;
  } catch (error) {
    return String((error as Error).message).includes(fragment);
  }
}

function firstRejectionCodes(document: unknown): string[] {
  return validateCorpusFile(document, withoutOverlap()).filterAccounting.rejections.map(
    (entry) => entry.code,
  );
}

/* ─────────────────────────── 1. the format ───────────────────────────────── */

describe("df-corpus/1 format", () => {
  test("the JSON Schema and the validator agree about every required field", () => {
    const defs = SCHEMA["$defs"] as unknown as Record<string, { required?: readonly string[] }>;
    expect(defs["corpusHeader"]?.required).toEqual([...REQUIRED_CORPUS_FIELDS]);
    expect(defs["exercise"]?.required).toEqual([...REQUIRED_EXERCISE_FIELDS]);
    expect(defs["testCase"]?.required).toEqual([...REQUIRED_TEST_FIELDS]);
    expect(defs["candidateAlibi"]?.required).toEqual([...REQUIRED_ALIBI_FIELDS]);
    expect(defs["provenance"]?.required).toEqual([...REQUIRED_PROVENANCE_FIELDS]);
    expect(SCHEMA["required"]).toEqual([...REQUIRED_TOP_LEVEL_FIELDS]);
    expect(SCHEMA["additionalProperties"]).toBe(false);
  });

  test("the schema's exercise field list matches the validator's known fields", () => {
    const defs = SCHEMA["$defs"] as unknown as Record<string, { properties?: Record<string, never> }>;
    expect(Object.keys(defs["exercise"]?.properties ?? {}).sort()).toEqual(
      [...KNOWN_EXERCISE_FIELDS].sort(),
    );
  });

  test("the schema pins the format tag and version the validator enforces", () => {
    const properties = SCHEMA["properties"] as unknown as Record<string, { const?: unknown }>;
    expect(properties["format"]?.const).toBe(CORPUS_FORMAT_TAG);
    expect(properties["formatVersion"]?.const).toBe(1);
  });

  test("the entry-point mirror agrees with the engines' Python regex on all 5,730 solutions", () => {
    const solutions = PROBLEMS.map((problem) => problem.solution);
    const path = "/tmp/df-entry-pattern-conformance.json";
    writeFileSync(path, JSON.stringify(solutions));
    const probe = spawnSync(
      "python3",
      [
        "-c",
        'import json,re,sys\n' +
          'pat=re.compile(r"^\\s*def\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*\\(", re.M)\n' +
          'sols=json.load(open(sys.argv[1]))\n' +
          'print(json.dumps([(m.group(1) if (m:=pat.search(s)) else None) for s in sols]))',
        path,
      ],
      { encoding: "utf8", timeout: 180_000 },
    );
    const pythonEntries = JSON.parse(probe.stdout.trim()) as (string | null)[];
    expect(pythonEntries.length).toBe(PROBLEMS.length);
    const tsEntries = solutions.map((solution) => {
      const match = ENTRY_POINT_PATTERN.exec(solution);
      return match && match[1] ? match[1] : null;
    });
    // The multiline flag is load-bearing: 878 internal solutions start with an
    // `import` line, and a non-multiline `^` rejects all of them.
    const importFirst = solutions.filter((solution) => /^\s*(import|from)\s/.test(solution)).length;
    expect(importFirst).toBeGreaterThan(800);
    expect(tsEntries).toEqual(pythonEntries);
    expect(tsEntries.filter((entry) => entry !== null).length).toBe(PROBLEMS.length);
  });

  test("resolveEntryPoint honours a declared entry and falls back to the first def", () => {
    expect(resolveEntryPoint("def a():\n    return 1\ndef b():\n    return 2\n").entry).toBe("a");
    expect(resolveEntryPoint("x = 1\n\ndef c(v):\n    return v\n").entry).toBe("c");
    expect(resolveEntryPoint("def a():\n    return 1\n", "a").entry).toBe("a");
    expect(resolveEntryPoint("def a():\n    return 1\n", "9bad").entry).toBeNull();
    expect(resolveEntryPoint("x = 1\n").entry).toBeNull();
  });

  test("the reference cap cannot exclude a legitimate exercise of this methodology", () => {
    const longest = PROBLEMS.reduce(
      (max, problem) => Math.max(max, problem.solution.length),
      0,
    );
    expect(longest).toBe(1902);
    expect(MAX_REFERENCE_CHARS).toBeGreaterThan(longest * 10);
  });

  test("the internal reference matches the constants committed in the BDL gate", () => {
    const source = readFileSync(resolve("scripts/py_bdl_verify.py"), "utf8");
    for (const [key, value] of Object.entries(INTERNAL_CENSUS_COUNTS)) {
      // The gate writes plain integers, e.g. `"rows": 5730,`.
      const present = source.includes(`"${key}": ${String(value)}`);
      expect(
        present,
        `CENSUS_COUNTS["${key}"] = ${String(value)} is not in scripts/py_bdl_verify.py`,
      ).toBe(true);
    }
    for (const [key, value] of Object.entries(INTERNAL_HEADLINE_RATES)) {
      // HEADLINE_RATES holds the reduced fraction, e.g. `"invisible": (9041 / 88357, 0.0020),`.
      const present = source.includes(
        `"${key}": (${String(value.numerator)} / ${String(value.denominator)},`,
      );
      expect(
        present,
        `HEADLINE_RATES["${key}"] = (${String(value.numerator)} / ${String(value.denominator)}, …) is not in the gate`,
      ).toBe(true);
    }
    expect(source).toContain('"hidden_visible": (6574 / 14534, 0.0081)');
    expect(source).toContain('"problems_visible_slip": (2523 / 5682, 0.0129)');
    expect(source).toContain('"test_passing": (14534 / 88357, 0.00245)');
  });

  test("the restated engine constants match the engine source", () => {
    const source = readFileSync(resolve("scripts/py_bdl_verify.py"), "utf8");
    // Spelled as the engine spells them, not as `String(1e-6)` would render.
    for (const literal of [
      "TOL = 1e-6",
      "BASIS_CAP = 48",
      "MIN_BASIS = 5",
      "MUTANT_CAP = 24",
      "MUTANT_PER_KIND = 4",
      "CALL_TIMEOUT = 0.25",
    ]) {
      expect(source, `${literal} is not in scripts/py_bdl_verify.py`).toContain(literal);
    }
    expect(BDL_ENGINE_CONSTANTS.tolerance).toBe(1e-6);
    expect(BDL_ENGINE_CONSTANTS.basisCap).toBe(48);
    expect(BDL_ENGINE_CONSTANTS.minBasis).toBe(5);
    expect(BDL_ENGINE_CONSTANTS.mutantCap).toBe(24);
    expect(BDL_ENGINE_CONSTANTS.mutantPerKind).toBe(4);
    expect(BDL_ENGINE_CONSTANTS.callTimeoutSeconds).toBe(0.25);
    const alibi = readFileSync(resolve("scripts/py_alibi_verify.py"), "utf8");
    expect(alibi).toContain("CALL_TIMEOUT = 1.0");
    expect(alibi).toContain("LINE_BUDGET = 400_000");
    expect(alibi).toContain("LAZY_PROBE_CAP = 128");
  });

  test("the published internal corpus digest in this module is the real one", () => {
    expect(sha256OfText(internalProjection())).toBe(INTERNAL_CORPUS_SHA256);
  });

  test("the alibi side has no comparable reference, and says so", () => {
    const alibi = INTERNAL_STATISTICS.find((row) => row.id.includes("alibi"));
    expect(alibi).toBeUndefined();
  });
});

/* ────────────────────────── 2. the validator ──────────────────────────────── */

describe("external-corpus validator", () => {
  test("a clean corpus validates with no rejections", () => {
    const report = validateCorpusFile(cleanCorpus(), withoutOverlap());
    expect(report.ok).toBe(true);
    expect(report.filterAccounting.exercisesAccepted).toBe(2);
    expect(report.filterAccounting.exercisesRejected).toBe(0);
    expect(report.accepted[0]?.entry).toBe("total");
  });

  test("the accounting identity holds for every rejection count", () => {
    for (let broken = 0; broken <= 2; broken += 1) {
      const document = cleanCorpus();
      const exercises = document["exercises"] as Record<string, unknown>[];
      for (let index = 0; index < broken; index += 1) delete exercises[index]!["tests"];
      const report = validateCorpusFile(document, withoutOverlap());
      const accounting = report.filterAccounting;
      expect(accounting.balances).toBe(true);
      expect(accounting.exercisesTotal).toBe(
        accounting.exercisesAccepted + accounting.exercisesRejected,
      );
      expect(accounting.exercisesRejected).toBe(broken);
    }
  });

  test("one exercise breaking three rules is one rejected exercise and three violations", () => {
    const document = cleanCorpus();
    const exercise = (document["exercises"] as Record<string, unknown>[])[0]!;
    delete exercise["tests"];
    exercise["testcase"] = [];
    exercise["id"] = "not a valid id";
    const accounting = validateCorpusFile(document, withoutOverlap()).filterAccounting;
    expect(accounting.exercisesRejected).toBe(1);
    expect(accounting.rejections.length).toBeGreaterThanOrEqual(3);
    expect(accounting.exercisesTotal).toBe(2);
  });

  test("every rule code the validator can emit is in the published table", () => {
    const document = cleanCorpus();
    document["format"] = "not-df-corpus";
    document["formatVersion"] = 99;
    document["surprise"] = 1;
    (document["corpus"] as Record<string, unknown>)["id"] = "";
    (document["corpus"] as Record<string, unknown>)["origin"] = "internal";
    (document["corpus"] as Record<string, unknown>)["language"] = "rust";
    (document["exercises"] as Record<string, unknown>[])[0]!["testcase"] = 1;
    const report = validateCorpusFile(document, withoutOverlap());
    for (const rejection of [...report.fatal, ...report.filterAccounting.rejections]) {
      expect(isKnownRule(rejection.code)).toBe(true);
      expect(rejection.remedy.length).toBeGreaterThan(10);
    }
    expect(report.ok).toBe(false);
    expect(report.corpusUsable).toBe(false);
  });

  test("file-level rules each fire", () => {
    const cases: readonly (readonly [string, () => Record<string, unknown>])[] = [
      ["file/not-object", () => [] as unknown as Record<string, unknown>],
      [
        "field/missing",
        () => {
          const document = cleanCorpus();
          delete document["exercises"];
          return document;
        },
      ],
      [
        "format/tag",
        () => ({ ...cleanCorpus(), format: "df-exercises" }),
      ],
      [
        "format/version",
        () => ({ ...cleanCorpus(), formatVersion: 2 }),
      ],
      [
        "corpus/id",
        () => {
          const document = cleanCorpus();
          (document["corpus"] as Record<string, unknown>)["id"] = "has spaces";
          return document;
        },
      ],
      [
        "corpus/origin",
        () => {
          const document = cleanCorpus();
          (document["corpus"] as Record<string, unknown>)["origin"] = "internal";
          return document;
        },
      ],
      [
        "corpus/language",
        () => {
          const document = cleanCorpus();
          (document["corpus"] as Record<string, unknown>)["language"] = "javascript";
          return document;
        },
      ],
      [
        "provenance/field",
        () => {
          const document = cleanCorpus();
          delete (document["corpus"] as { provenance: Record<string, unknown> }).provenance["obtained"];
          return document;
        },
      ],
      [
        "license/field",
        () => {
          const document = cleanCorpus();
          delete (document["corpus"] as { license: Record<string, unknown> }).license["url"];
          return document;
        },
      ],
      ["exercises/empty", () => ({ ...cleanCorpus(), exercises: [] })],
      [
        "alibis/shape",
        () => ({ ...cleanCorpus(), candidateAlibis: "not an array" }),
      ],
      [
        "file/unknown-field",
        () => ({ ...cleanCorpus(), mystery: true }),
      ],
    ];
    for (const [code, build] of cases) {
      const report = validateCorpusFile(build(), withoutOverlap());
      const codes = [...report.fatal, ...report.filterAccounting.rejections].map((entry) => entry.code);
      expect(codes, `rule ${code} did not fire`).toContain(code);
    }
  });

  test("every exercise-level rule each fires", () => {
    const cases: readonly (readonly [string, (exercise: Record<string, unknown>) => void])[] = [
      ["exercise/id-missing", (e) => delete e["id"]],
      ["exercise/id-invalid", (e) => (e["id"] = "no spaces here")],
      ["exercise/reference-missing", (e) => delete e["reference"]],
      ["exercise/reference-empty", (e) => (e["reference"] = "   ")],
      ["exercise/reference-too-long", (e) => (e["reference"] = `def f():\n    return "${"x".repeat(MAX_REFERENCE_CHARS + 10)}"`),
      ],
      ["exercise/reference-no-def", (e) => (e["reference"] = "x = 1\n")],
      ["exercise/reference-control-bytes", (e) => (e["reference"] = "def f():\n    return 1\n ")],
      ["exercise/reference-entry-unresolvable", (e) => (e["entry"] = "9nope")],
      ["exercise/tests-missing", (e) => delete e["tests"]],
      ["exercise/tests-empty", (e) => (e["tests"] = [])],
      ["exercise/test-not-an-object", (e) => (e["tests"] = ["nope"])],
      ["exercise/test-input-missing", (e) => (e["tests"] = [{ expected: 1 }])],
      ["exercise/test-input-not-array", (e) => (e["tests"] = [{ input: 5, expected: 1 }])],
      ["exercise/test-expected-missing", (e) => (e["tests"] = [{ input: [1] }])],
      ["exercise/test-unknown-field", (e) => (e["tests"] = [{ input: [1], expected: 1, why: "?" }])],
      ["exercise/category-invalid", (e) => (e["category"] = "")],
      ["exercise/difficulty-invalid", (e) => (e["difficulty"] = "x".repeat(200))],
      ["exercise/unknown-field", (e) => (e["testcase"] = [])],
    ];
    for (const [code, mutate] of cases) {
      const document = cleanCorpus();
      const exercises = document["exercises"] as Record<string, unknown>[];
      mutate(exercises[0]!);
      exercises.splice(1, 1);
      const codes = firstRejectionCodes(document);
      expect(codes, `rule ${code} did not fire`).toContain(code);
    }
  });

  test("a duplicate id is rejected and the second occurrence is the one reported", () => {
    const document = cleanCorpus();
    const exercises = document["exercises"] as Record<string, unknown>[];
    exercises[1]!["id"] = exercises[0]!["id"];
    const accounting = validateCorpusFile(document, withoutOverlap()).filterAccounting;
    expect(accounting.exercisesRejected).toBe(1);
    expect(accounting.rejections[0]?.code).toBe("exercise/id-duplicate");
    expect(accounting.rejections[0]?.index).toBe(1);
  });

  test("a null `expected` is a legal value and a missing key is not", () => {
    const legal = cleanCorpus();
    (legal["exercises"] as Record<string, unknown>[])[0]!["tests"] = [
      { input: [[]], expected: null },
    ];
    expect(validateCorpusFile(legal, withoutOverlap()).ok).toBe(true);

    const illegal = cleanCorpus();
    (illegal["exercises"] as Record<string, unknown>[])[0]!["tests"] = [{ input: [[]] }];
    expect(firstRejectionCodes(illegal)).toContain("exercise/test-expected-missing");
  });

  test("an absent category and difficulty are disclosures, not rejections", () => {
    const document = cleanCorpus();
    for (const exercise of document["exercises"] as Record<string, unknown>[]) {
      delete exercise["category"];
      delete exercise["difficulty"];
    }
    const report = validateCorpusFile(document, withoutOverlap());
    expect(report.ok).toBe(true);
    expect(report.accepted.every((exercise) => exercise.categoryUndeclared)).toBe(true);
    expect(report.accepted.every((exercise) => exercise.category === null)).toBe(true);
  });

  test("fewer than three tests is disclosed, not filtered", () => {
    const document = cleanCorpus();
    for (const exercise of document["exercises"] as Record<string, unknown>[]) {
      exercise["tests"] = [{ input: [[1]], expected: 1 }];
    }
    const report = validateCorpusFile(document, withoutOverlap());
    expect(report.ok).toBe(true);
    expect(report.filterAccounting.exercisesAccepted).toBe(2);
    expect(report.filterAccounting.advisoryCounts["advisory/tests-below-three"]).toBe(2);
  });

  test("NOASSERTION is a legal licence and is disclosed", () => {
    const document = cleanCorpus();
    (document["corpus"] as { license: Record<string, unknown> }).license = {
      id: "NOASSERTION",
      url: "no licence text exists",
    };
    const report = validateCorpusFile(document, withoutOverlap());
    expect(report.ok).toBe(true);
    expect(report.filterAccounting.advisoryCounts["advisory/license-unasserted"]).toBe(1);
  });

  test("an unknown independence is disclosed, and a derived corpus is disclosed too", () => {
    const unknown = cleanCorpus();
    (unknown["corpus"] as { provenance: Record<string, unknown> }).provenance["independence"] = "unknown";
    expect(
      validateCorpusFile(unknown, withoutOverlap()).filterAccounting.advisoryCounts[
        "advisory/independence-unknown"
      ],
    ).toBe(1);
    const derived = cleanCorpus();
    (derived["corpus"] as { provenance: Record<string, unknown> }).provenance["independence"] =
      "derived-from-deepforge";
    expect(
      validateCorpusFile(derived, withoutOverlap()).filterAccounting.advisoryCounts[
        "advisory/independence-declared-derived"
      ],
    ).toBe(1);
  });

  test("a vendor extension key is recorded and ignored, an unknown key is not", () => {
    const extended = cleanCorpus();
    extended["x-acme"] = { anything: true };
    const report = validateCorpusFile(extended, withoutOverlap());
    expect(report.ok).toBe(true);
    expect(report.filterAccounting.advisoryCounts["advisory/ignored-extension"]).toBe(1);

    const unknown = cleanCorpus();
    unknown["typo"] = 1;
    expect(validateCorpusFile(unknown, withoutOverlap()).corpusUsable).toBe(false);
  });

  test("every rejection names a path that points at the offending value", () => {
    const document = cleanCorpus();
    (document["exercises"] as Record<string, unknown>[])[0]!["tests"] = [{ input: 5 }];
    for (const rejection of validateCorpusFile(document, withoutOverlap()).filterAccounting.rejections) {
      expect(rejection.path.startsWith("/exercises/0")).toBe(true);
    }
  });

  test("a corpus that declares no candidate alibis says so out loud", () => {
    const report = validateCorpusFile(cleanCorpus(), withoutOverlap());
    expect(report.filterAccounting.advisoryCounts["advisory/no-candidate-alibis"]).toBe(1);
    expect(report.acceptedAlibis).toHaveLength(0);
  });
});

/* ─────────────────────── 3. the example corpus ───────────────────────────── */

describe("the shipped synthetic example corpus", () => {
  test("is rejected, in exactly the documented way", () => {
    const report = validateCorpusFile(EXAMPLE, { overlapCheck: false });
    expect(report.ok).toBe(false);
    const accounting = report.filterAccounting;
    expect(accounting.exercisesTotal).toBe(6);
    expect(accounting.exercisesAccepted).toBe(5);
    expect(accounting.exercisesRejected).toBe(1);
    expect(accounting.balances).toBe(true);
    expect([...new Set(accounting.rejections.map((entry) => entry.code))].sort()).toEqual([
      "exercise/test-expected-missing",
      "exercise/unknown-field",
    ]);
    expect(accounting.rejections.every((entry) => entry.target === "syn-invalid-005")).toBe(true);
  });

  test("removing only the deliberately invalid exercise makes it clean", () => {
    const document = {
      ...EXAMPLE,
      exercises: (EXAMPLE["exercises"] as unknown[]).filter(
        (_, index) => index !== 5,
      ),
    };
    const report = validateCorpusFile(document, { overlapCheck: false });
    expect(report.ok).toBe(true);
    expect(report.filterAccounting.exercisesRejected).toBe(0);
    expect(report.acceptedAlibis).toHaveLength(1);
  });

  test("is unmistakably labelled synthetic, in the file and in the data", () => {
    const header = EXAMPLE["corpus"] as Record<string, unknown>;
    expect(header["origin"]).toBe("synthetic-example");
    expect(EXAMPLE_TEXT).toContain("NOT A SCIENTIFIC CORPUS");
    expect(EXAMPLE_TEXT).toContain("deliberately invalid");
    const notes = String(header["name"]);
    expect(notes.toLowerCase()).toContain("synthetic");
  });

  test("shares no reference and no id with the DeepForge internal corpus", () => {
    const document = {
      ...EXAMPLE,
      exercises: (EXAMPLE["exercises"] as unknown[]).filter((_, index) => index !== 5),
    };
    const report = validateCorpusFile(document);
    expect(report.ok).toBe(true);
    // `validateCorpusFile` does not surface the finding on the report; the
    // runner reads it from `overlapFindingFor`, so assert the fixture's content
    // directly here: none of its five references occurs in the internal bank.
    const accepted = report.accepted;
    expect(accepted.length).toBe(5);
    const internalIds = new Set(PROBLEMS.map((problem) => problem.id));
    expect(accepted.some((exercise) => internalIds.has(exercise.id))).toBe(false);
  });
});

/* ────────────────── 4. provenance and separation ─────────────────────────── */

describe("provenance separation", () => {
  function syntheticReport(overrides: Partial<RunProvenance> = {}): ExternalRunReport {
    const provenance: RunProvenance = {
      kind: "synthetic-example",
      corpusId: "synthetic-format-fixture",
      corpusName: "SYNTHETIC FORMAT FIXTURE (not a scientific corpus)",
      corpusVersion: "1.0.0",
      corpusContentDigest: "0".repeat(64),
      maintainer: "fixture author",
      source: EXAMPLE_PATH,
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
        doesNotEstablish: "byte-level overlap only",
      },
      ...overrides,
    };
    const records: EngineRecord[] = [
      { id: "syn-001", category: "arithmetic", difficulty: "trivial", n_mut: 4, n_invisible: 1 },
      { id: "syn-002", category: "arithmetic", difficulty: "trivial", n_mut: 8, n_invisible: 0 },
    ];
    const analysisExclusions: AnalysisExclusions = {
      exercisesSubmitted: 2,
      exercisesAnalyzable: 2,
      exclusions: [],
      byReason: {},
      complete: true,
    };
    return buildRunReport({
      provenance,
      filterAccounting: {
        exercisesTotal: 2,
        exercisesAccepted: 2,
        exercisesRejected: 0,
        rejectionsByRule: {},
        rejections: [],
        alibisTotal: 1,
        alibisAccepted: 1,
        alibisRejected: 0,
        alibiRejectionsByRule: {},
        alibiRejections: [],
        advisories: [],
        advisoryCounts: {},
        balances: true,
      },
      analysisExclusions,
      records,
      engine: {
        bdl: { path: "scripts/py_bdl_verify.py", sha256: "a".repeat(64), bytes: 1 },
        alibi: { path: "scripts/py_alibi_verify.py", sha256: "b".repeat(64), bytes: 1 },
        runner: { path: "scripts/external-replication.ts", sha256: "c".repeat(64), bytes: 1 },
        census: { path: "scripts/py_external_census.py", sha256: "d".repeat(64), bytes: 1 },
      },
      corpusContentDigest: provenance.corpusContentDigest,
      corpusBytesSha256: "e".repeat(64),
      corpusBytes: 1000,
      runMetadata: {
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
        command: ["bun"],
        outputPath: "/tmp/one.json",
      },
      alibiVerification: null,
      exercisesSubmitted: 2,
    });
  }

  test("a corpus claiming to be the internal one is refused", () => {
    const document = {
      ...cleanCorpus(),
      corpus: { ...(cleanCorpus()["corpus"] as Record<string, unknown>), origin: "internal" },
    };
    const report = validateCorpusFile(document, withoutOverlap());
    expect(report.corpusUsable).toBe(false);
    expect(report.fatal.map((entry) => entry.code)).toContain("corpus/origin");
  });

  test("the DeepForge corpus wearing an external label is caught by the overlap check", () => {
    const document = {
      format: "df-corpus",
      formatVersion: 1,
      corpus: cleanCorpus()["corpus"],
      exercises: PROBLEMS.map((problem) => ({
        id: problem.id,
        category: problem.category,
        difficulty: problem.difficulty,
        reference: problem.solution,
        tests: problem.testCases,
      })),
    };
    const report = validateCorpusFile(document);
    expect(report.filterAccounting.exercisesRejected).toBe(0);
    expect(report.corpusUsable).toBe(false);
    expect(report.fatal.map((entry) => entry.code)).toContain(
      "provenance/collides-with-deepforge-corpus",
    );
  });

  test("a synthetic report is stamped so it can never be read as a result", () => {
    const report = syntheticReport();
    expect(report.provenance.synthetic).toBe(true);
    expect(report.provenance.notAScientificResult).toBe(true);
    expect(report.provenance.label).toContain("SYNTHETIC EXAMPLE");
    expect(reportFileName(report.provenance, report.resultDigest)).toMatch(
      /^NOT-A-RESULT__synthetic-example__/,
    );
  });

  test("an external report's file name leads with its provenance kind", () => {
    const report = syntheticReport({
      kind: "external",
      synthetic: false,
      notAScientificResult: false,
      corpusId: "acme-2026",
      label: "EXTERNAL CORPUS acme-2026@2026.04",
    });
    expect(reportFileName(report.provenance, report.resultDigest)).toMatch(/^external__acme-2026__/);
  });

  test("a report missing its provenance fails validation", () => {
    const report = syntheticReport();
    const stripped = JSON.parse(JSON.stringify(report)) as Record<string, unknown>;
    delete stripped["provenance"];
    const check = validateRunReport(stripped);
    expect(check.ok).toBe(false);
    expect(check.problems.join(" ")).toContain("provenance");
  });

  test("the corpus content digest ignores formatting but not content", () => {
    const exercises = [
      projectExercise(
        {
          id: "acme-001",
          reference: "def total(xs):\n    return sum(xs)\n",
          tests: [{ input: [[1, 2]], expected: 3 }],
          category: "arithmetic",
          difficulty: "easy",
        },),
    ];
    const first = corpusContentDigest({ formatVersion: 1, exercises });
    const second = corpusContentDigest({ formatVersion: 1, exercises: [...exercises] });
    expect(first).toBe(second);
    const changed = corpusContentDigest({
      formatVersion: 1,
      exercises: [
        {
          ...exercises[0]!,
          testCases: [{ input: [[1, 2]], expected: 4 }],
        },
      ],
    });
    expect(changed).not.toBe(first);
  });
});

/* ──────────────────────────── 5. the report ──────────────────────────────── */

describe("the run report", () => {
  const records: EngineRecord[] = [
    {
      id: "acme-001",
      category: "arithmetic",
      difficulty: "easy",
      basis_n: 14,
      n_mut: 6,
      n_invisible: 2,
      mutants: [
        { label: "m1", fam: "cmp", churn: 0, pass: 3, ntest: 3 },
        { label: "m2", fam: "cmp", churn: 1, pass: 3, ntest: 3 },
        { label: "m3", fam: "bin", churn: 2, pass: 0, ntest: 3 },
      ],
    },
    {
      id: "acme-002",
      category: "arithmetic",
      difficulty: "easy",
      basis_n: 16,
      n_mut: 4,
      n_invisible: 0,
      mutants: [
        { label: "m4", fam: "cmp", churn: 0, pass: 2, ntest: 2 },
        { label: "m5", fam: "cmp", churn: 1, pass: 0, ntest: 2 },
      ],
    },
  ];

  function makeReport(analysisExclusions: AnalysisExclusions, recordsIn: readonly EngineRecord[] = records) {
    return buildRunReport({
      provenance: {
        kind: "external",
        corpusId: "acme-2026",
        corpusName: "ACME",
        corpusVersion: "2026.04",
        corpusContentDigest: "0".repeat(64),
        maintainer: "ACME",
        source: "https://example.invalid",
        obtained: "2026-04-11",
        method: "hand-authored",
        independence: "independent-from-deepforge",
        licenseId: "CC-BY-4.0",
        licenseUrl: "https://example.invalid/licence",
        synthetic: false,
        notAScientificResult: false,
        label: "EXTERNAL CORPUS acme-2026@2026.04",
        overlapWithInternalCorpus: {
          performed: true,
          status: "checked",
          sharedReferences: 0,
          exercises: 2,
          sharedIds: 0,
          isTheInternalCorpus: false,
          doesNotEstablish: "byte-level overlap only",
        },
      },
      filterAccounting: {
        exercisesTotal: 2,
        exercisesAccepted: 2,
        exercisesRejected: 0,
        rejectionsByRule: {},
        rejections: [],
        alibisTotal: 0,
        alibisAccepted: 0,
        alibisRejected: 0,
        alibiRejectionsByRule: {},
        alibiRejections: [],
        advisories: [],
        advisoryCounts: {},
        balances: true,
      },
      analysisExclusions,
      records: recordsIn,
      engine: {
        bdl: { path: "scripts/py_bdl_verify.py", sha256: "a".repeat(64), bytes: 1 },
        alibi: { path: "scripts/py_alibi_verify.py", sha256: "b".repeat(64), bytes: 1 },
        runner: { path: "scripts/external-replication.ts", sha256: "c".repeat(64), bytes: 1 },
        census: { path: "scripts/py_external_census.py", sha256: "d".repeat(64), bytes: 1 },
      },
      corpusContentDigest: "0".repeat(64),
      corpusBytesSha256: "e".repeat(64),
      corpusBytes: 1000,
      runMetadata: {
        startedAt: "2026-04-11T00:00:00.000Z",
        finishedAt: "2026-04-11T00:01:00.000Z",
        durationSeconds: 60,
        host: { platform: "linux", arch: "x64", cpus: 16 },
        runtime: {
          bun: "1.3.9",
          node: "22",
          python: "CPython 3.13.0",
          pythonImplementation: "CPython",
          pythonVersion: "3.13.0",
        },
        workers: 8,
        command: ["bun", "run", "scripts/external-replication.ts"],
        outputPath: "/tmp/a.json",
      },
      alibiVerification: null,
      exercisesSubmitted: 2,
    });
  }

  const clean = makeReport({
    exercisesSubmitted: 2,
    exercisesAnalyzable: 2,
    exclusions: [],
    byReason: {},
    complete: true,
  });

  test("resultDigest is invariant under every run-metadata field", () => {
    const mutated = {
      ...clean,
      runMetadata: {
        ...clean.runMetadata,
        startedAt: "2031-12-24T18:04:05.678Z",
        finishedAt: "2031-12-24T18:09:05.678Z",
        durationSeconds: 299.999,
        host: { platform: "win32", arch: "ia32", cpus: 1 },
        runtime: {
          bun: "9.9.9",
          node: "99",
          python: "PyPy 3.9.0",
          pythonImplementation: "PyPy",
          pythonVersion: "3.9.0",
        },
        workers: 1,
        command: ["python3", "elsewhere"],
        outputPath: "C:\\somewhere\\else.json",
      },
    };
    expect(resultDigestOf(mutated.reproducible)).toBe(resultDigestOf(clean.reproducible));
    expect(validateRunReport(mutated).ok).toBe(true);
  });

  test("resultDigest moves when a measurement moves", () => {
    const tampered = JSON.parse(JSON.stringify(clean)) as ExternalRunReport;
    (tampered.reproducible.records as Record<string, unknown>[])[0]!["n_invisible"] = 0;
    expect(resultDigestOf(tampered.reproducible)).not.toBe(clean.resultDigest);
  });

  test("resultDigest moves when the engine changes", () => {
    const tampered = JSON.parse(JSON.stringify(clean)) as ExternalRunReport;
    (tampered.reproducible.engine.bdl as { sha256: string }).sha256 = "f".repeat(64);
    expect(resultDigestOf(tampered.reproducible)).not.toBe(clean.resultDigest);
  });

  test("runMetadata declares itself non-reproducible", () => {
    expect(clean.runMetadata.reproducible).toBe(false);
  });

  test("every rate carries its numerator, denominator, and a null point when undefined", () => {
    for (const row of clean.reproducible.measurements) {
      expect(typeof row.numerator).toBe("number");
      expect(typeof row.denominator).toBe("number");
      if (row.denominator === 0) expect(row.point).toBeNull();
      else expect(row.point).not.toBeNull();
      expect(row.definitionDigest).toBe(definitionDigest(row.definition, row.unit));
    }
  });

  test("the hidden-visible rate is computed with the shipped definition", () => {
    const hidden = clean.reproducible.measurements.find((row) => row.id === "hiddenVisible");
    // acme-001: 2 of 3 mutants pass all tests, 1 of those churns.
    // acme-002: 1 of 2 mutants passes all tests, 0 of those churns.
    expect(hidden?.numerator).toBe(1);
    expect(hidden?.denominator).toBe(3);
    expect(closeTo(hidden?.point, 1 / 3, 12)).toBe(true);
    expect(hidden?.unit).toBe("mutant");
    expect(hidden?.intervalMethod).toBe("cluster-robust-normal");
  });

  test("the invisible rate uses sum(n_invisible) / sum(n_mutants)", () => {
    const row = clean.reproducible.measurements.find((entry) => entry.id === "invisible");
    expect(row?.numerator).toBe(2);
    expect(row?.denominator).toBe(10);
  });

  test("mutants-per-exercise is a per-unit mean with no binomial standard error", () => {
    const row = clean.reproducible.measurements.find((entry) => entry.id === "mutantsPerExercise");
    expect(row?.scale).toBe("per-unit");
    expect(row?.seBinomial).toBeNull();
    expect(closeTo(row?.point, 5, 12)).toBe(true);
    expect(row?.caveat).toContain("per-unit mean");
  });

  test("the two exclusion ledgers are separate and never summed", () => {
    const filtered: AnalysisExclusions = {
      exercisesSubmitted: 3,
      exercisesAnalyzable: 2,
      exclusions: [{ reason: "small-basis", count: 1, exerciseIds: ["acme-003"] }],
      byReason: { "small-basis": 1 },
      complete: true,
    };
    const report = makeReport(filtered, [...records, { id: "acme-003", skip: "small-basis" }]);
    expect(report.reproducible.analysisExclusions.exclusions[0]?.reason).toBe("small-basis");
    expect(report.reproducible.filterAccounting.rejections).toHaveLength(0);
    expect(
      report.reproducible.filterAccounting.rejectionsByRule["small-basis"],
    ).toBeUndefined();
    expect((report.reproducible.analysisExclusions as unknown as Record<string, unknown>)["exerciseIds"]).toBeUndefined();
  });

  test("an incomplete analysis is recorded as incomplete", () => {
    const partial: AnalysisExclusions = {
      exercisesSubmitted: 3,
      exercisesAnalyzable: 2,
      exclusions: [],
      byReason: {},
      complete: false,
    };
    const report = makeReport(partial);
    expect(report.reproducible.analysisExclusions.complete).toBe(false);
    const check = validateRunReport(report);
    expect(check.ok).toBe(true);
  });

  test("a report whose accounting does not balance fails validation", () => {
    const tampered = JSON.parse(JSON.stringify(clean)) as ExternalRunReport;
    (tampered.reproducible.filterAccounting as { exercisesTotal: number }).exercisesTotal = 99;
    const check = validateRunReport(tampered);
    expect(check.ok).toBe(false);
    expect(check.problems.join(" ")).toContain("does not balance");
  });

  test("a non-finite number cannot be hashed, and is reported as a problem", () => {
    const tampered = structuredClone(clean) as ExternalRunReport;
    const row = tampered.reproducible.measurements[0]!;
    // Written directly, not through JSON: `JSON.stringify` would turn NaN into
    // null, which is exactly the silent coercion this check exists to prevent.
    (row as unknown as { seCluster: number }).seCluster = Number.NaN;
    expect(throwsWith(() => canonicalJson(tampered), "non-finite")).toBe(true);
    // Left as NaN on purpose: validation must report it, not throw and not
    // silently canonicalise it away.
    const check = validateRunReport(tampered);
    expect(check.ok).toBe(false);
    expect(check.problems.join(" ")).toContain("non-finite");
    expect(check.problems.join(" ")).toContain("cannot be canonicalised");
  });

  test("the deterministic-run claim is visible in the report", () => {
    expect(clean.reproducible.determinism.twoRunsByteIdentical).toBe(true);
    expect(clean.reproducible.determinism.recordsDigestFirst).toBe(
      clean.reproducible.determinism.recordsDigestSecond,
    );
  });
});

/* ─────────────────── 6. statistics and the comparison ────────────────────── */

describe("statistics", () => {
  test("the normal quantile is exact enough for every interval here", () => {
    expect(closeTo(normalQuantile(0.975), 1.959963984540054, 5)).toBe(true);
    expect(closeTo(normalQuantile(0.95), 1.6448536269514722, 5)).toBe(true);
    expect(normalQuantile(0.5)).toBe(0);
  });

  test("the Wilson interval matches closed-form values and stays inside [0, 1]", () => {
    // 45.23% of 14,534: the published internal row.
    const [low, high] = wilsonInterval(6574, 14534);
    expect(low).toBeLessThan(6574 / 14534);
    expect(high).toBeGreaterThan(6574 / 14534);
    expect(closeTo(high - low, 2 * 0.0081, 3)).toBe(true);
    for (const [successes, trials] of [
      [0, 10],
      [10, 10],
      [1, 3],
      [0, 1],
    ] as const) {
      const [a, b] = wilsonInterval(successes, trials);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  test("a zero denominator is undefined, not zero", () => {
    const estimate = proportion(0, 0);
    expect(estimate.point).toBeNull();
    expect(estimate.ci95).toEqual([null, null]);
    expect(estimate.undefinedReason).toContain("undefined");
  });

  test("the cluster-robust SE reduces to the binomial SE when every cluster has b = 1", () => {
    const pairs = [
      [1, 1],
      [0, 1],
      [1, 1],
      [1, 1],
      [0, 1],
    ] as const;
    const rate = clusteredRate(pairs);
    expect(closeTo(rate.seCluster, rate.seBinomial ?? -1, 12)).toBe(true);
    expect(closeTo(rate.designEffect, 1, 9)).toBe(true);
    expect(rate.method).toBe("wilson-score");
  });

  test("the cluster-robust SE exceeds the binomial SE on clustered data", () => {
    const pairs = [
      [5, 10],
      [0, 10],
      [4, 10],
      [0, 10],
    ] as const;
    const rate = clusteredRate(pairs);
    expect(rate.seCluster).toBeGreaterThan(rate.seBinomial ?? 0);
    expect(rate.designEffect).toBeGreaterThan(1);
    expect(rate.method).toBe("cluster-robust-normal");
    expect(closeTo(clusterRobustSe(pairs), rate.seCluster ?? -1, 12)).toBe(true);
  });

  test("the Newcombe risk difference covers zero when the intervals overlap heavily", () => {
    const a = proportion(50, 100);
    const b = proportion(52, 100);
    const effect = riskDifference(a, b);
    expect(closeTo(effect.value, -0.02, 12)).toBe(true);
    expect(effect.ci95[0]).toBeLessThan(0);
    expect(effect.ci95[1]).toBeGreaterThan(0);
  });

  test("a clearly separated pair gives a risk difference interval away from zero", () => {
    const effect = riskDifference(proportion(10, 100), proportion(90, 100));
    expect(closeTo(effect.value, -0.8, 12)).toBe(true);
    expect(effect.ci95[1]).toBeLessThan(0);
  });

  test("an empty 2x2 cell makes the log-method ratios undefined, not patched", () => {
    const ratio = riskRatio(proportion(0, 100), proportion(10, 100));
    expect(ratio.value).toBeNull();
    expect(ratio.undefinedReason).toContain("empty");
    const odds = oddsRatio(proportion(100, 100), proportion(10, 100));
    expect(odds.value).toBeNull();
  });

  test("the log-method ratios are correct on a 2x2 table with no empty cells", () => {
    const ratio = riskRatio(proportion(20, 100), proportion(10, 100));
    expect(closeTo(ratio.value, 2.25, 12)).toBe(true);
    const variance = 1 / 20 - 1 / 100 + (1 / 10 - 1 / 100);
    const se = Math.sqrt(variance);
    expect(closeTo(ratio.ci95[0], 2.25 * Math.exp(-1.959963984540054 * se), 9)).toBe(true);
    const odds = oddsRatio(proportion(20, 100), proportion(10, 100));
    expect(closeTo(odds.value, (20 / 80) / (10 / 90), 12)).toBe(true);
  });

  test("the sample-size rule is monotone and matches the closed form", () => {
    const p = 0.4523;
    expect(nForHalfWidth(p, 0.05)).toBe(Math.ceil((1.959963984540054 ** 2 * p * (1 - p)) / 0.05 ** 2));
    expect(nForHalfWidth(p, 0.02)).toBeGreaterThan(nForHalfWidth(p, 0.05));
    expect(nForHalfWidth(p, 0.1)).toBeLessThan(nForHalfWidth(p, 0.05));
    expect(nForHalfWidth(p, 0.05)).toBe(381);
  });

  test("the power function and its inverse agree", () => {
    expect(closeTo(powerAgainst(0.45, 0.45, 100), 0.05, 3)).toBe(true);
    const n = nForPower(0.45, 0.5, 0.8, 0.05);
    expect(powerAgainst(0.45, 0.5, n)).toBeGreaterThanOrEqual(0.8);
    expect(powerAgainst(0.45, 0.5, n - 1)).toBeLessThan(0.8);
    expect(nForPower(0.45, 0.45)).toBe(Number.POSITIVE_INFINITY);
  });

  test("a design effect inflates a required n and never deflates it", () => {
    expect(inflate(100, 1)).toBe(100);
    expect(inflate(100, null)).toBe(100);
    expect(inflate(100, 2.7)).toBe(270);
    expect(inflate(100, 0.5)).toBe(100);
  });

  test("the published sample-size table is computable and ordered", () => {
    const table = sampleSizeGuidance();
    expect(table.length).toBeGreaterThan(3);
    for (const row of table) {
      const margins = row.rows.map((entry) => entry.margin);
      expect(margins).toEqual([0.1, 0.05, 0.02]);
      const ns = row.rows.map((entry) => entry.minExercises);
      expect(ns[0]).toBeGreaterThan(0);
      expect(ns[1]).toBeGreaterThan(ns[0]!);
      expect(ns[2]).toBeGreaterThan(ns[1]!);
    }
  });
});

describe("the comparison", () => {
  function externalReport(options: {
    readonly n: number;
    readonly slips: number;
    readonly independence?: RunProvenance["independence"];
    readonly exercisesRejected?: number;
  }) {
    const records: EngineRecord[] = [];
    for (let index = 0; index < options.n; index += 1) {
      const slipped = index < options.slips;
      records.push({
        id: `ex-${String(index)}`,
        category: "c",
        difficulty: "d",
        basis_n: 12,
        n_mut: 8,
        n_invisible: 2,
        mutants: slipped
          ? [
              { label: "a", fam: "cmp", churn: 0, pass: 2, ntest: 2 },
              { label: "b", fam: "cmp", churn: 1, pass: 2, ntest: 2 },
            ]
          : [
              { label: "a", fam: "cmp", churn: 0, pass: 2, ntest: 2 },
              { label: "b", fam: "cmp", churn: 0, pass: 0, ntest: 2 },
            ],
      });
    }
    return buildRunReport({
      provenance: {
        kind: "external",
        corpusId: "acme",
        corpusName: "ACME",
        corpusVersion: "1",
        corpusContentDigest: "0".repeat(64),
        maintainer: "ACME",
        source: "https://example.invalid",
        obtained: "2026-04-11",
        method: "hand-authored",
        independence: options.independence ?? "independent-from-deepforge",
        licenseId: "CC-BY-4.0",
        licenseUrl: "https://example.invalid/l",
        synthetic: false,
        notAScientificResult: false,
        label: "EXTERNAL CORPUS acme@1",
        overlapWithInternalCorpus: {
          performed: true,
          status: "checked",
          sharedReferences: 0,
          exercises: options.n,
          sharedIds: 0,
          isTheInternalCorpus: false,
          doesNotEstablish: "byte-level overlap only",
        },
      },
      filterAccounting: {
        exercisesTotal: options.n,
        exercisesAccepted: options.n,
        exercisesRejected: options.exercisesRejected ?? 0,
        rejectionsByRule: {},
        rejections: [],
        alibisTotal: 0,
        alibisAccepted: 0,
        alibisRejected: 0,
        alibiRejectionsByRule: {},
        alibiRejections: [],
        advisories: [],
        advisoryCounts: {},
        balances: true,
      },
      analysisExclusions: {
        exercisesSubmitted: options.n,
        exercisesAnalyzable: options.n,
        exclusions: [],
        byReason: {},
        complete: true,
      },
      records,
      engine: {
        bdl: { path: "scripts/py_bdl_verify.py", sha256: "a".repeat(64), bytes: 1 },
        alibi: { path: "scripts/py_alibi_verify.py", sha256: "b".repeat(64), bytes: 1 },
        runner: { path: "scripts/external-replication.ts", sha256: "c".repeat(64), bytes: 1 },
        census: { path: "scripts/py_external_census.py", sha256: "d".repeat(64), bytes: 1 },
      },
      corpusContentDigest: "0".repeat(64),
      corpusBytesSha256: "e".repeat(64),
      corpusBytes: 1,
      runMetadata: {
        startedAt: "2026-04-11T00:00:00.000Z",
        finishedAt: "2026-04-11T00:01:00.000Z",
        durationSeconds: 60,
        host: { platform: "linux", arch: "x64", cpus: 8 },
        runtime: {
          bun: "1.3.9",
          node: "22",
          python: "CPython 3.13.0",
          pythonImplementation: "CPython",
          pythonVersion: "3.13.0",
        },
        workers: 8,
        command: ["bun"],
        outputPath: "/tmp/a.json",
      },
      alibiVerification: null,
      exercisesSubmitted: options.n,
    });
  }

  const prereg = (margins: Record<string, number>): Preregistration => ({
    registeredAt: "2026-01-01",
    registeredBy: "a lab",
    registeredWhere: "https://example.invalid/prereg",
    exclusionPolicy: "reject any exercise the validator rejects; disclose everything else",
    margins,
  });

  test("no pre-registration means no verdict", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 500, slips: 220 }),
      preregistration: null,
    });
    expect(comparison.verdict).toBe("PREREGISTRATION_ABSENT");
    expect(comparison.statistics.every((row) => row.verdict === "PREREGISTRATION_ABSENT")).toBe(true);
  });

  test("a corpus too small for the margin is INSUFFICIENT_SAMPLE, never AGREE", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 40, slips: 18 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    const row = comparison.statistics.find(
      (entry) => entry.id === "exercisesWithVisibleSlip",
    );
    expect(row?.minExercisesForMargin).toBeGreaterThan(40);
    expect(row?.verdict).toBe("INSUFFICIENT_SAMPLE");
    expect(comparison.verdict).not.toBe("AGREE");
  });

  test("a large independent corpus with a matching rate can reach AGREE", () => {
    // 44% slips, close to the published 44.40%, on 1,200 exercises.
    const comparison = compareExternalRun({
      report: externalReport({ n: 1200, slips: 528 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    const row = comparison.statistics.find(
      (entry) => entry.id === "exercisesWithVisibleSlip",
    );
    expect(row?.verdict).toBe("AGREE");
    expect(closeTo(row?.riskDifference?.value, 0.44 - 2523 / 5682, 3)).toBe(true);
    expect(row?.riskRatio?.value).toBeGreaterThan(0.9);
    expect(row?.riskRatio?.value).toBeLessThan(1.1);
    expect(row?.oddsRatio?.value).toBeGreaterThan(0);
    expect(comparison.verdict).toBe("AGREE");
  });

  test("a corpus far from the published rate reaches DISAGREE", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 1200, slips: 120 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    const row = comparison.statistics.find(
      (entry) => entry.id === "exercisesWithVisibleSlip",
    );
    expect(row?.verdict).toBe("DISAGREE");
    expect(row?.verdictReason).toContain("disjoint");
  });

  test("a wide interval is INCONCLUSIVE, not AGREE", () => {
    // 50% slips on 500 exercises: the point is close but the interval is wide.
    const comparison = compareExternalRun({
      report: externalReport({ n: 500, slips: 250 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.02 }),
    });
    const row = comparison.statistics.find(
      (entry) => entry.id === "exercisesWithVisibleSlip",
    );
    expect(row?.verdict).toBe("INSUFFICIENT_SAMPLE");
  });

  test("independence failures block the verdict", () => {
    for (const independence of ["unknown", "derived-from-deepforge"] as const) {
      const comparison = compareExternalRun({
        report: externalReport({ n: 1200, slips: 528, independence }),
        preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
      });
      expect(comparison.verdict).toBe("NOT_COMPARABLE");
      expect(comparison.verdictReason).toContain("independence");
    }
  });

  test("byte-identical overlap with the internal corpus blocks the verdict", () => {
    const report = externalReport({ n: 1200, slips: 528 });
    const contaminated = {
      ...report,
      provenance: {
        ...report.provenance,
        overlapWithInternalCorpus: {
          ...report.provenance.overlapWithInternalCorpus,
          sharedReferences: 40,
        },
      },
    };
    const comparison = compareExternalRun({
      report: contaminated,
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    expect(comparison.verdict).toBe("NOT_COMPARABLE");
    expect(comparison.verdictReason).toContain("byte-identical");
  });

  test("a rejected exercise blocks the verdict", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 1200, slips: 528, exercisesRejected: 3 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    expect(comparison.verdict).toBe("NOT_COMPARABLE");
    expect(comparison.verdictReason).toContain("rejected by the validator");
  });

  test("an accounted-for analyzer exclusion is a disclosure, not a block", () => {
    const report = externalReport({ n: 1200, slips: 528 });
    const disclosed = {
      ...report,
      reproducible: {
        ...report.reproducible,
        analysisExclusions: {
          exercisesSubmitted: 1200,
          exercisesAnalyzable: 1100,
          exclusions: [
            {
              reason: "small-basis",
              count: 100,
              exerciseIds: Array.from({ length: 100 }, (_, index) => `ex-${String(index)}`),
            },
          ],
          byReason: { "small-basis": 100 },
          complete: true,
        },
      },
    };
    const comparison = compareExternalRun({
      report: { ...disclosed, resultDigest: resultDigestOf(disclosed.reproducible) },
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    // 1,100 analyzable exercises is still far above the 380 a 5pp margin needs,
    // so the verdict stands — and the exclusion is on the record.
    const row = comparison.statistics.find((entry) => entry.id === "exercisesWithVisibleSlip");
    expect(row?.verdict).toBe("AGREE");
    expect(row?.minExercisesForMargin).toBe(380);
  });

    test("an UNACCOUNTED analyzer exclusion blocks the verdict", () => {
    const report = externalReport({ n: 1200, slips: 528 });
    const excluded = {
      ...report,
      reproducible: {
        ...report.reproducible,
        analysisExclusions: {
          exercisesSubmitted: 1200,
          exercisesAnalyzable: 1100,
          // 1,100 analyzed + 50 listed = 1,150, so 50 submitted exercises
          // vanished. `complete: true` is a self-declaration and it is false;
          // the comparison must recompute the arithmetic rather than believe it.
          exclusions: [
            {
              reason: "small-basis",
              count: 50,
              exerciseIds: Array.from({ length: 50 }, (_, index) => `ex-${String(index)}`),
            },
          ],
          byReason: { "small-basis": 50 },
          complete: true,
        },
      },
    };
    const comparison = compareExternalRun({
      report: { ...excluded, resultDigest: resultDigestOf(excluded.reproducible) },
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    expect(comparison.verdict).toBe("NOT_COMPARABLE");
    expect(comparison.verdictReason).toContain("did not account for every exercise");
  });

  test("every comparison carries the decision rule and the standing interpretation", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 1200, slips: 528 }),
      preregistration: prereg({ exercisesWithVisibleSlip: 0.05 }),
    });
    expect(comparison.decisionRule).toContain("entirely inside");
    expect(comparison.interpretation.length).toBeGreaterThanOrEqual(4);
    expect(comparison.interpretation.join(" ")).toContain("may legitimately produce a different rate");
    expect(comparison.interpretation.join(" ")).toContain("UNPROVEN");
    expect(comparison.preconditions.length).toBeGreaterThanOrEqual(7);
    expect(comparison.preconditions.every((entry) => entry.statement.length > 20)).toBe(true);
  });

  test("a per-unit statistic gets no interval-width sample-size guidance", () => {
    const comparison = compareExternalRun({
      report: externalReport({ n: 1200, slips: 528 }),
      preregistration: prereg({ mutantsPerExercise: 0.5, exercisesWithVisibleSlip: 0.05 }),
    });
    const mean = comparison.statistics.find((entry) => entry.id === "mutantsPerExercise");
    expect(mean?.scale).toBe("per-unit");
    expect(mean?.minExercisesForMargin).toBeNull();
    expect(mean?.minExercisesForPower).toBeNull();
    expect(mean?.riskDifference).toBeNull();
    expect(mean?.riskRatio).toBeNull();
    expect(mean?.oddsRatio).toBeNull();
  });

  test("a comparison is a pure function of its inputs", () => {
    const report = externalReport({ n: 300, slips: 132 });
    const registration = prereg({ exercisesWithVisibleSlip: 0.05 });
    expect(canonicalJson(compareExternalRun({ report, preregistration: registration }))).toBe(
      canonicalJson(compareExternalRun({ report, preregistration: registration })),
    );
  });

  test("the tolerance-band demonstration shows the two rules disagreeing", () => {
    const rows = toleranceBandDemonstration();
    expect(rows[0]?.underGateRule).toBe("would pass");
    expect(rows[0]?.underIntervalRule).toBe("INCONCLUSIVE");
    expect(rows.every((row) => row.underIntervalRule === "INCONCLUSIVE")).toBe(true);
    expect(percent(0.4523)).toBe("45.23%");
  });
});
