/**
 * External-corpus contract — the DeepForge internal reference.
 *
 * This is the other half of the comparison: the internal corpus's published
 * rates, transcribed here so the comparison tool has something to compare
 * *against* that is not hard-coded twice. Every value below is a transcription
 * of a constant that already lives in `scripts/py_bdl_verify.py` (the
 * independent BDL gate), at the line numbers recorded next to it:
 *
 *   - `CENSUS_COUNTS` at `scripts/py_bdl_verify.py:88-105` — the published
 *     full-corpus census counts.
 *   - `HEADLINE_RATES` at `scripts/py_bdl_verify.py:109-116` — the published
 *     rates and their 95% CI half-widths.
 *
 * The transcription is *not* a second source of truth. `tests/external-corpus.test.ts`
 * parses `scripts/py_bdl_verify.py` and asserts every value here matches the
 * file it claims to come from, so the two cannot drift apart silently. If the
 * Python constants change, the test fails and this file is updated in the same
 * commit.
 *
 * What the internal reference is, stated carefully, because the audit was
 * blunt about it:
 *
 *  - The **counts** come from `bdl_engine_clean.py` + `census_clean.jsonl`,
 *    neither of which is in the repository. They are NEEDS-VERIFICATION
 *    numbers, and `py_bdl_verify.py:44-49` says so in its own docblock.
 *  - The **gate** re-derives them on a 240-problem stratified sample inside
 *    3-sigma tolerance bands, and two of those bands are enormous
 *    (`hidden_visible` ±10.07pp, `problems_visible_slip` ±9.92pp).
 *  - The **engine** an external run shares with the internal gate is the
 *    committed `py_bdl_verify.py` analyzer — not the uncommitted census engine.
 *    So an external run and the *gate* are exactly commensurable; an external
 *    run and the *published census* are commensurable in definition but not in
 *    provenance, and the comparison says so on every row.
 *
 * The Alibi Distance side has no reference rates here at all, and that absence
 * is deliberate: the alibi census (106,081 mutants, 46.08% radius-one aperture)
 * came from an engine that is not in the repository, so there is nothing here
 * that an external run could agree or disagree *with*. The comparison refuses
 * to emit a verdict for the alibi side and says why.
 */

/** Where each group of numbers is transcribed from, byte-for-byte checkable. */
export const INTERNAL_REFERENCE_SOURCE = {
  path: "scripts/py_bdl_verify.py",
  censusCounts: { from: 88, to: 105 },
  headlineRates: { from: 109, to: 116 },
  corpusDigest: "docs/research/reproducibility.md §3.1 (printed by scripts/reproduce.ts)",
  corpusSha256: "3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31",
} as const;

/**
 * The published full-corpus census counts, transcribed from
 * `CENSUS_COUNTS` in `scripts/py_bdl_verify.py`.
 */
export const INTERNAL_CENSUS_COUNTS = {
  rows: 5_730,
  analyzable: 5_682,
  skipped: 48,
  mutants: 88_357,
  invisible: 9_041,
  test_passing: 14_534,
  hidden_visible: 6_574,
  problems_test_passing_mutant: 3_600,
  problems_visible_slip: 2_523,
  zero_mutant_problems: 55,
  all_visible_problems: 2_818,
  all_visible_denominator: 5_627,
  reference_flakes: 0,
  cosmetic_churn_bad: 0,
  rename_applied: 4_680,
  rename_churn_bad: 0,
  invariant_bad: 0,
} as const;

/**
 * The published rates and their 95% CI half-widths, transcribed from
 * `HEADLINE_RATES` in `scripts/py_bdl_verify.py`. The half-widths are the
 * published corpus intervals, i.e. the *reference* uncertainty an external
 * comparison must not silently ignore.
 */
export const INTERNAL_HEADLINE_RATES = {
  analyzable: { numerator: 5_682, denominator: 5_730, ciHalf: 0 },
  mutants_per_problem: { numerator: 88_357, denominator: 5_682, ciHalf: 0 },
  invisible: { numerator: 9_041, denominator: 88_357, ciHalf: 0.002 },
  test_passing: { numerator: 14_534, denominator: 88_357, ciHalf: 0.002_45 },
  hidden_visible: { numerator: 6_574, denominator: 14_534, ciHalf: 0.008_1 },
  problems_visible_slip: { numerator: 2_523, denominator: 5_682, ciHalf: 0.012_9 },
} as const;

/**
 * The statistics the comparison knows about, in report order. Each row names
 * the definition the report must carry so two reports can prove they measured
 * the same thing.
 */
export interface InternalStatistic {
  readonly id: string;
  readonly label: string;
  /** The definition string; its digest is the commensurability key. */
  readonly definition: string;
  readonly unit: "exercise" | "mutant";
  readonly isCount: boolean;
  readonly numerator: number;
  readonly denominator: number;
  /** The published 95% CI half-width, or `null` for a raw count. */
  readonly ciHalf: number | null;
  /** The census count behind the rate, for a reader who wants the raw numbers. */
  readonly censusNote: string;
}

export const INTERNAL_STATISTICS: readonly InternalStatistic[] = [
  {
    id: "analyzable",
    label: "exercises analyzable",
    definition:
      "analyzable = exercises the analyzer produced a record for; " +
      "rate = analyzable / exercises submitted to the analyzer",
    unit: "exercise",
    isCount: false,
    numerator: INTERNAL_HEADLINE_RATES.analyzable.numerator,
    denominator: INTERNAL_HEADLINE_RATES.analyzable.denominator,
    ciHalf: null,
    censusNote: `census rows 5730, analyzable 5682, skipped 48 (all small-basis)`,
  },
  {
    id: "mutantsPerExercise",
    label: "mutants per analyzable exercise",
    definition:
      "mutantsPerExercise = generated mutants / analyzable exercises; " +
      "a count per exercise, not a proportion",
    unit: "exercise",
    isCount: true,
    numerator: INTERNAL_HEADLINE_RATES.mutants_per_problem.numerator,
    denominator: INTERNAL_HEADLINE_RATES.mutants_per_problem.denominator,
    ciHalf: null,
    censusNote: `census mutants 88357 over 5682 analyzable = 15.5503 per exercise`,
  },
  {
    id: "invisible",
    label: "invisible mutants",
    definition:
      "invisible = mutants whose signature is identical to the reference on every basis probe; " +
      "rate = sum(n_invisible) / sum(n_mutants) over analyzable exercises",
    unit: "mutant",
    isCount: false,
    numerator: INTERNAL_HEADLINE_RATES.invisible.numerator,
    denominator: INTERNAL_HEADLINE_RATES.invisible.denominator,
    ciHalf: INTERNAL_HEADLINE_RATES.invisible.ciHalf,
    censusNote: `census invisible 9041 of 88357 mutants = 10.23%`,
  },
  {
    id: "testPassing",
    label: "test-passing mutants",
    definition:
      "testPassing = mutants that pass every shipped test; " +
      "rate = sum(pass == ntest) / sum(n_mutants) over analyzable exercises",
    unit: "mutant",
    isCount: false,
    numerator: INTERNAL_HEADLINE_RATES.test_passing.numerator,
    denominator: INTERNAL_HEADLINE_RATES.test_passing.denominator,
    ciHalf: INTERNAL_HEADLINE_RATES.test_passing.ciHalf,
    censusNote: `census test_passing 14534 of 88357 mutants = 16.45%`,
  },
  {
    id: "hiddenVisible",
    label: "hidden-visible test-passing mutants",
    definition:
      "hiddenVisible = mutants that pass every shipped test and differ from the reference on at " +
      "least one basis probe; rate = sum(pass == ntest and churn > 0) / sum(pass == ntest) over " +
      "analyzable exercises",
    unit: "mutant",
    isCount: false,
    numerator: INTERNAL_HEADLINE_RATES.hidden_visible.numerator,
    denominator: INTERNAL_HEADLINE_RATES.hidden_visible.denominator,
    ciHalf: INTERNAL_HEADLINE_RATES.hidden_visible.ciHalf,
    censusNote: `census hidden_visible 6574 of 14534 test-passing mutants = 45.23%`,
  },
  {
    id: "exercisesWithVisibleSlip",
    label: "exercises with a visible slip",
    definition:
      "exercisesWithVisibleSlip = exercises with at least one test-passing mutant that churns; " +
      "rate = such exercises / analyzable exercises",
    unit: "exercise",
    isCount: false,
    numerator: INTERNAL_HEADLINE_RATES.problems_visible_slip.numerator,
    denominator: INTERNAL_HEADLINE_RATES.problems_visible_slip.denominator,
    ciHalf: INTERNAL_HEADLINE_RATES.problems_visible_slip.ciHalf,
    censusNote: `census problems_visible_slip 2523 of 5682 analyzable = 44.40%`,
  },
  {
    id: "allVisibleExercises",
    label: "all-visible exercises",
    definition:
      "allVisibleExercises = analyzable exercises with at least one mutant and zero invisible " +
      "mutants; rate = such exercises / (analyzable - zero-mutant exercises)",
    unit: "exercise",
    isCount: false,
    numerator: INTERNAL_CENSUS_COUNTS.all_visible_problems,
    denominator: INTERNAL_CENSUS_COUNTS.all_visible_denominator,
    ciHalf: null,
    censusNote: `census all_visible 2818 of 5627 (5682 - 55 zero-mutant) = 50.08%`,
  },
  {
    id: "zeroMutantExercises",
    label: "zero-mutant exercises",
    definition: "zeroMutantExercises = analyzable exercises for which no mutant was generated; a count",
    unit: "exercise",
    isCount: true,
    numerator: INTERNAL_CENSUS_COUNTS.zero_mutant_problems,
    denominator: INTERNAL_CENSUS_COUNTS.analyzable,
    ciHalf: null,
    censusNote: `census zero_mutant_problems 55 of 5682 analyzable`,
  },
];

/**
 * The published rates as they are *not* reproducible, stated as a record so a
 * reader of a comparison document sees the gap rather than a footnote.
 */
export const INTERNAL_LIMITATIONS = [
  "The internal full-corpus census came from `bdl_engine_clean.py` + `census_clean.jsonl`, " +
    "neither of which is in this repository; the committed gate re-derives the rates on a " +
    "240-problem stratified sample inside 3-sigma bands, not on the full corpus.",
  "The engine an external run shares with the committed gate is `scripts/py_bdl_verify.py`'s " +
    "analyzer. The uncommitted census engine may differ, so agreement with the gate is not " +
    "agreement with the census engine.",
  "Two of the internal gate's sample tolerances are large: hidden_visible ±10.07pp and " +
    "problems_visible_slip ±9.92pp, against observed 42.33% and 45.34%. A band that wide " +
    "passes a headline that is 2.9pp away, so the gate is a determinism anchor and a " +
    "regression tripwire, not a hypothesis test.",
  "The Alibi Distance census (106,081 mutants; 46.08% radius-one aperture) has no committed " +
    "engine and no committed artifact, so no external run can be compared against it. This " +
    "tooling can verify externally mined candidate alibis; it cannot reproduce an alibi rate.",
  "The internal corpus is hand-authored to a written specification, in batches, by agents. " +
    "There is no generator, no per-exercise provenance record, and no independence or " +
    "contamination control.",
];

/** The internal alibi side, described for a report that has no rates to give. */
export const INTERNAL_ALIBI_REFERENCE = {
  bankPuzzles: 96,
  bankStatus:
    "re-verifiable in full: `bun run verify:alibis` re-checks every shipped puzzle in CPython",
  censusStatus:
    "not reproducible: the mutation-mining engine, its edit families, and its candidate pool " +
    "are not in this repository, and the funnel (2636 -> 89622 -> 19030 -> 4060 -> 268 -> 217 " +
    "-> 211 -> 96) is a hard-coded constant in scripts/verify-alibis.ts",
  comparisonPossible: false,
  reason:
    "there is no committed alibi census artifact to compare an external run against; an " +
    "external run can have its candidate alibis verified, which is a different and weaker claim",
} as const;
