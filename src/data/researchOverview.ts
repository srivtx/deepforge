/**
 * The research-facing presentation layer for DeepForge's publications.
 *
 * This module is the single source of truth for three things the research
 * surface must never get wrong:
 *
 *   1. `RESEARCH_AGENDA` — the one-sentence statement of the programme. The
 *      homepage agenda and the publications index both import it, so the two
 *      surfaces cannot drift apart.
 *   2. `WORK_STATUS` — what kind of object each work is and whether it has been
 *      reviewed. The vocabulary is closed and every label is defined in
 *      `STATUS_LEGEND`; the review state is stated once, honestly, rather than
 *      implied by a word like "published" in a menu.
 *   3. The per-work narrative split into `established` (measured in this
 *      repository, traceable to a script and a data file) and `hypotheses`
 *      (assumptions, open questions, and work that has not been run). The split
 *      is the page's core convention and is enforced by tests.
 *
 * Every number below is transcribed from the paper named in `paper`, which is
 * why `tests/researchOverview.test.ts` can assert each `scale` token is
 * literally present in that paper's text. Titles are read from the paper
 * registry rather than retyped, so a rename can never leave a stale copy here.
 *
 * House rules this file obeys: no novelty or market language, no claim of peer
 * review, no claim of external validity, and a failed prediction is a result,
 * not a gap in the writing.
 */

import { INVENTIONS } from "./inventions";

/* ───────────────────────────── the agenda ───────────────────────────── */

/**
 * The programme statement, word for word. This is the sentence the homepage
 * agenda and the publications index are required to carry; tests assert the
 * exact string, so changing it is a deliberate, reviewed act.
 */
export const RESEARCH_AGENDA =
  "Reliable and evidence-based programming education in the age of generative AI.";

/** One or two sentences on what the programme does and does not claim. */
export const RESEARCH_SUMMARY = [
  "The work asks a single family of questions: when an automated environment reports that a learner is correct, or a hint is useful, what is the evidence behind that report, and how far does it reach?",
  "Each question is answered by naming a construct, building a small instrument for it, measuring that instrument on real data, and stating what the measurement cannot show. Every number on this page comes from a script in this repository and appears in the paper it is attributed to.",
];

/**
 * Declared once, in the open, at the top of the research surface. Reviewer-facing
 * honesty is cheaper as a sentence than as a footnote nobody reads.
 */
export const REVIEW_STATEMENT =
  "None of the work on this page has been peer reviewed. There is no venue, no submission, and no acceptance anywhere in this portfolio, and no result here has been reproduced by anyone outside this repository.";

/* ──────────────────────── status vocabulary ─────────────────────────── */

export type WorkKind = "preprint" | "technical-report" | "artifact" | "unpublished";

export interface StatusLegendEntry {
  label: string;
  definition: string;
}

/** The closed vocabulary. A work carries one or more of these, in order. */
export const STATUS_LEGEND: readonly {
  kind: WorkKind;
  label: string;
  definition: string;
}[] = [
  {
    kind: "preprint",
    label: "Preprint",
    definition:
      "A full research write-up, posted here in its entirety with a downloadable PDF. It is posted for comment; it has not been submitted to or accepted by any venue.",
  },
  {
    kind: "technical-report",
    label: "Technical report",
    definition:
      "A specification and measurement report for a shipped system. It documents a design and its measured behaviour. It does not claim to be a research contribution and it is not submitted anywhere.",
  },
  {
    kind: "artifact",
    label: "Artifact",
    definition:
      "A runnable instrument plus a permanent gate that recomputes its pinned results. Here the artifact is the contribution; the write-up beside it is unreviewed.",
  },
  {
    kind: "unpublished",
    label: "Unpublished",
    definition:
      "Planned or in-progress work. There is no document, no data, and no number. It is listed only so that the direction of travel is visible.",
  },
];

const STATUS_BY_KIND: Record<WorkKind, StatusLegendEntry> = STATUS_LEGEND.reduce(
  (acc, entry) => {
    acc[entry.kind] = { label: entry.label, definition: entry.definition };
    return acc;
  },
  {} as Record<WorkKind, StatusLegendEntry>,
);

export function statusLabel(kind: WorkKind): string {
  return STATUS_BY_KIND[kind].label;
}

/** The single review label carried by every work in the portfolio. */
export const REVIEW_LABEL = "Not peer reviewed";

/* ──────────────────────── research questions ─────────────────────────── */

export interface ResearchQuestion {
  id: string;
  /** Short name for the thread. */
  title: string;
  /** The question, phrased so that a negative answer would be informative. */
  question: string;
  /** What the instrument actually does. */
  detail: string;
  /** The practice surface built from this thread. */
  href: string;
  action: string;
  /** The flagship paper that carries the measurement. */
  paper: string;
}

/**
 * The three questions of the programme. These are the same threads the
 * homepage agenda renders, which is why both surfaces import this list: a
 * reader who arrives from either one sees the same three questions in the same
 * words.
 */
export const RESEARCH_QUESTIONS: readonly ResearchQuestion[] = [
  {
    id: "test-adequacy",
    title: "Test adequacy",
    question:
      "Can a test suite distinguish correct programs from plausible-but-wrong ones?",
    detail:
      "Silent Bug Hunt pairs a reference function with a test-passing one-line divergence, then asks you to find the input the suite missed.",
    href: "/alibi",
    action: "Try Silent Bug Hunt",
    paper: "alibi-distance",
  },
  {
    id: "behavioral-evidence",
    title: "Behavioral evidence",
    question:
      "Can an edit reveal a meaningful behavioral change without becoming a grade?",
    detail:
      "Behavioral Delta Ledger reports only whether hidden checks changed after an edit. It never affects progress, review, or certificates.",
    href: "/ledger",
    action: "Explore the ledger",
    paper: "behavioral-delta-ledger",
  },
  {
    id: "auditable-feedback",
    title: "Auditable feedback",
    question:
      "Can learning guidance show the evidence behind it and respond when that evidence is refuted?",
    detail:
      "Warrant Lab makes each derived claim inspectable: see its checks, challenge it, and audit the resulting bookkeeping.",
    href: "/warrant",
    action: "Open Warrant Lab",
    paper: "refutation-ledgers",
  },
];

/* ────────────────────────── the works ────────────────────────────────── */

export type WorkRole = "flagship" | "supporting";

/**
 * A claim in the narrative. `kind` is the page's evidence convention and is
 * rendered, never inferred: `result` marks something measured here, `hypothesis`
 * marks an assumption, an open question, or work that has not been run.
 */
export type ClaimKind = "result" | "hypothesis";

export interface Claim {
  kind: ClaimKind;
  text: string;
}

export interface WorkEntry {
  /** The paper slug, so a title can never drift from the registry. */
  slug: string;
  role: WorkRole;
  /** Closed vocabulary; rendered as pills in this order. */
  kinds: readonly WorkKind[];
  /** One honest sentence about what this work is, in the work's own terms. */
  note: string;
  established: readonly Claim[];
  hypotheses: readonly Claim[];
}

const result = (text: string): Claim => ({ kind: "result", text });
const hypothesis = (text: string): Claim => ({ kind: "hypothesis", text });

export const WORKS: readonly WorkEntry[] = [
  {
    slug: "alibi-distance",
    role: "flagship",
    kinds: ["preprint", "artifact"],
    note:
      "A corpus-level aperture measurement for a machine-verified exercise bank, with an independent second engine and a machine-verified practice artifact.",
    established: [
      result(
        "A full-corpus run sampled 106,081 single-edit mutants across 5,730 exercises. 17,502 of them pass every shipped test, 7,727 of those diverge from the reference on the probe bank, and 46.08% of analyzable problems admit a radius-1 alibi.",
      ),
      result(
        "A second, separately written CPython engine, run by the same author, agreed with the TypeScript engine to within 0.14 percentage points on the census rates, 0.32 on the length quartiles and 0.44 on the closure estimates. Neither engine, nor its input, nor its output is part of this release, so the census below is a record of a mining run rather than a result an outside reader can re-derive.",
      ),
      result(
        "An in-sample witness closes 59.7% of affected problems and kills 73.2% of mined alibis, but a cross-validated witness kills only 48.4% of held-out alibis. The deployable estimate is therefore about 23.5% of problems still affected, not the in-sample 18.6%.",
      ),
      result(
        "Two planned follow-ups failed and are reported as failures: feature-guided probe selection does not transfer better than random (63.3% against 59.5% conviction within ten probes), and the best two-literal input predicate reaches 0.9 balanced accuracy for only 32.2% of alibis against a permutation control of 0.881.",
      ),
      result(
        "A blind audit of ten independently sampled alibis found 10 of 10 plainly wrong.",
      ),
    ],
    hypotheses: [
      hypothesis(
        "That near-miss mutants resemble the slips learners actually make is an assumption, not a measurement. The paper frames the aperture as a property of the corpus and the edit model, and proposes a shadow-logging study that has not been run.",
      ),
      hypothesis(
        "A probe bank derived from the shipped tests is not a proof of semantic inequivalence. Divergence is established only where a probe actually separates the two programs.",
      ),
    ],
  },
  {
    slug: "behavioral-delta-ledger",
    role: "flagship",
    kinds: ["preprint", "artifact"],
    note:
      "A count-only per-edit behavioural delta on a hidden probe basis, with the product boundary set by what the measurement failed to support.",
    established: [
      result(
        "A fresh full-corpus census covers 5,682 analyzable exercises and 88,357 sampled single-edit mutants. 10.23% of mutants are invisible on the 48-probe basis, 16.45% pass every shipped test, and 44.40% of problems carry a test-passing slip the basis can see.",
      ),
      result(
        "In-sample, the sign of the hidden delta matches the sign of the test delta for 90.20% of climb walks. With the basis built from odd-index tests and the delta scored on even-index tests, held-out concordance falls to 84.00% and 82.23%. The held-out figures are the ones reported.",
      ),
      result(
        "On 699 simulated edit walks under three policies, 34% to 51% of edits are exact no-ops by signature.",
      ),
      result(
        "Four of nine pre-registered predictions failed or reversed and are reported as failures: the predicted edit-family ordering was reversed, hidden-visible test-passers missed the threshold narrowly, the next-attempt regression ratio reached only 1.14x and 1.36x against a pre-registered 2x, and cold sets were not family-concentrated (1.50%).",
      ),
    ],
    hypotheses: [
      hypothesis(
        "The ledger is retrospective attribution, not forecasting. The pre-registered prediction of a 2x next-test regression risk was falsified, and the routing story implied by cold-set enrichment is post hoc and was cut from the shipped design rather than reported as a finding.",
      ),
      hypothesis(
        "All learner-behaviour numbers come from simulated edit policies and synthetic cohorts. No learner data was collected, and the delta is not a measure of understanding.",
      ),
    ],
  },
  {
    slug: "refutation-ledgers",
    role: "flagship",
    kinds: ["preprint", "artifact"],
    note:
      "A value-level contract in which recorded falsification attempts produce a recomputable warrant state and exact cite-graph demotion.",
    established: [
      result(
        "Across 200 frozen seeds and 12 matched conflict pairs per regime, the shipped declared-dependence relation reaches pair-win 1.000 and AUC 1.000 in the correlated regime, where the strongest cheap count baseline reaches 0.000. Audit precision at 12 is 1.000 against 0.000.",
      ),
      result(
        "Seed-only churn moves the mean grade by 0.000 and flips 0.000 of pairs.",
      ),
      result(
        "The syntactic tuple variant was declared in advance as a negative arm and was killed by its criterion, as predicted.",
      ),
      result(
        "No individual mechanism is new. Retraction in truth-maintenance systems, evidence fusion, audited ledgers, and attack-family scoring are all established; the contribution is the ledger-to-grade-to-demotion contract that ties them to a runtime value.",
      ),
    ],
    hypotheses: [
      hypothesis(
        "The arena's ground truth is generated from the generator's own blind-spot table, so the result is a property of the contract under that generator and not evidence about educational content.",
      ),
      hypothesis(
        "The dependence relation is declared, not semantically proved, and a well-formed fabricated ledger can still pass a recomputation audit. Audit is arithmetic consistency plus anchored tamper evidence at the append point; it is never a truth verdict.",
      ),
      hypothesis(
        "Whether a recomputable warrant state is useful to a learner is untested. No study asks.",
      ),
    ],
  },
  {
    slug: "ladder-graded-spacing",
    role: "supporting",
    kinds: ["technical-report"],
    note:
      "A measurement report for the platform's own review scheduler, run as a simulation against a stated truth model.",
    established: [
      result(
        "In a 100-learner, 40-item, 365-day simulation against a memory-based truth model, the shipped variant used 25.63% fewer reviews per retained item than SM-2 at matched first-attempt recall (25.32% in the literal protocol), with a Brier delta of -0.1105.",
      ),
      result(
        "30 of 30 seeds passed the 10% gate with no seed worse, and no edge cohort exceeded the 1.10x SM-2 review gate.",
      ),
      result(
        "An ablation removed the proposed evidence multiplier: it cost 27% more reviews for no Brier gain, so the shipped variant does not use it.",
      ),
    ],
    hypotheses: [
      hypothesis(
        "Every learner is simulated. This is a report on a scheduler under a stated truth model, not evidence about human memory or learning.",
      ),
      hypothesis(
        "The baseline is SM-2, the scheduler the platform used before. No published memory model is evaluated on the same protocol, so the result does not establish that this variant is the best available scheduler.",
      ),
      hypothesis(
        "Hint debits have no published calibration, and the effort cap is the weakest-chosen default in the model.",
      ),
    ],
  },
  {
    slug: "keyfuse",
    role: "supporting",
    kinds: ["technical-report", "artifact"],
    note:
      "A read-only auditor for build-cache keys. Software-engineering work adjacent to the agenda, recorded as a specification plus an artifact.",
    established: [
      result(
        "On a frozen 24-task corpus with brute-force ground truth (408 binary assignments, 651 full product assignments, 1,533 enumerated same-key collision pairs), the exact arm matched ground truth in 69 of 72 task-by-strength cells, with 3 explicit nondeterminism refusals.",
      ),
      result(
        "83 minimized witnesses were produced, 81 verified 1-minimal with 2 flagged and reported, and repair separated all 101 recorded collision witnesses in the separating check with 0 unseparated.",
      ),
      result(
        "Masking is demonstrated rather than assumed: a pinned adversarial covering array misses the (a,b) pair of f = (a AND b) XOR c, and the miss is recorded.",
      ),
    ],
    hypotheses: [
      hypothesis(
        "The anchoring assumption, that every output difference has a witness reachable by a small displacement from the baseline which includes a differing slot, is stated in the code, the paper, and the interface. It is not proved and not verified.",
      ),
      hypothesis(
        "Detection is not soundness and a repaired key is conservative rather than complete. The certificate is exactly: no detected effect of that support at the covered tuples.",
      ),
      hypothesis(
        "Covering-array testing, delta debugging, and cache-key auditing all predate this work, and the frozen corpus is 24 synthetic tasks rather than a production build graph.",
      ),
    ],
  },
  {
    slug: "reprogpu",
    role: "supporting",
    kinds: ["technical-report", "artifact"],
    note:
      "A conformance harness for a declared integer WGSL subset, recorded as a narrow artifact contribution rather than a new method.",
    established: [
      result(
        "The CPU-only gate reproduces the pinned reference hashes byte-for-byte across five of five criteria, matches three published Philox known-answer tests and the FIPS SHA-256 vectors, pins five WGSL source hashes, and finds no float type, atomic, discard, or unmasked runtime shift in the integer kernels.",
      ),
      result(
        "The subset is exact by construction: integer wrapping arithmetic, bitwise operations, comparisons, bitcast between i32 and u32, and host-shared little-endian layout. WGSL leaves rounding direction, reassociation, fusion, and subnormal flushing unspecified for floating point.",
      ),
      result(
        "A float matmul kernel is carried as an explicit negative control with no pass criterion, and its divergence is the expected outcome.",
      ),
    ],
    hypotheses: [
      hypothesis(
        "Cross-adapter equality is demonstrated only by the browser lab, on one machine, at one time. The gate cannot compile WGSL or run a GPU, and no CI artifact is evidence of GPU agreement.",
      ),
      hypothesis(
        "Adapter identity is self-reported and not attested, and the hardware sample is small.",
      ),
      hypothesis(
        "Exact integer GPU execution hashed and compared already exists, and reproducible floating-point BLAS work is mature. The contribution is the narrow protocol and the pinned subset, not a new capability.",
      ),
    ],
  },
];

/** Slug to entry, for the paper page, the PDF line, and the tests. */
const WORK_BY_SLUG: Record<string, WorkEntry> = WORKS.reduce<Record<string, WorkEntry>>(
  (acc, work) => {
    acc[work.slug] = work;
    return acc;
  },
  {},
);

/**
 * The status of one published work. Throws on an unknown slug rather than
 * rendering a blank: the paper routes are statically generated from the paper
 * registry, so an unknown slug is a build-time mistake, not a runtime state.
 */
export function requireWorkEntry(slug: string): WorkEntry {
  const entry = WORK_BY_SLUG[slug];
  if (!entry) {
    throw new Error(`no research overview entry for paper "${slug}"`);
  }
  return entry;
}

/** The paper registry's own title for a work, so a rename cannot go stale. */
const TITLES: Record<string, string> = INVENTIONS.reduce<Record<string, string>>(
  (acc, paper) => {
    acc[paper.slug] = paper.title;
    return acc;
  },
  {},
);

export function workTitle(slug: string): string {
  const title = TITLES[slug];
  if (!title) throw new Error(`no paper titled "${slug}"`);
  return title;
}

/** Short form for tables and legends: the name before the first colon. */
export function workShortTitle(slug: string): string {
  const title = workTitle(slug);
  const colon = title.indexOf(":");
  return colon > 0 ? title.slice(0, colon) : title;
}

/* ────────────────────────── methods ──────────────────────────────────── */

export interface MethodEntry {
  id: string;
  name: string;
  /** What the method does. */
  does: string;
  /** The boundary of the method, stated as plainly as the capability. */
  cannot: string;
  /** The works that use it. */
  works: readonly string[];
}

export const METHODS: readonly MethodEntry[] = [
  {
    id: "census",
    name: "Census by real execution",
    does:
      "The reference solution and every sampled mutant are executed in CPython against a deterministic per-problem probe basis. No model, no network, no learner telemetry is involved.",
    cannot:
      "It measures this corpus under one stated edit model and one probe basis. A program that agrees with the reference on every probe is not thereby proved equivalent.",
    works: ["alibi-distance", "behavioral-delta-ledger"],
  },
  {
    id: "replication",
    name: "Independent re-execution",
    does:
      "A second engine, written separately, recomputes the census from scratch and reports its own rates.",
    cannot:
      "It is an internal replication by the same author on the same corpus. It is not external replication, and agreement between two implementations still leaves both open to a shared mistake in the edit model.",
    works: ["alibi-distance"],
  },
  {
    id: "simulation",
    name: "Simulation against a stated truth model",
    does:
      "Synthetic learners are scheduled for a fixed horizon against a memory-based truth model, with paired-by-learner bootstrap gates repeated over 30 seeds and explicit edge-learner cohorts.",
    cannot:
      "It cannot say anything about human learners, because there are none. It is a property of the scheduler under the chosen truth model.",
    works: ["ladder-graded-spacing"],
  },
  {
    id: "leakage-control",
    name: "Leakage-controlled scoring",
    does:
      "The probe basis is built from one subset of the shipped tests and the delta is scored on the disjoint remainder, so the reported concordance is not measured in sample.",
    cannot:
      "It removes basis and score overlap. It does not remove the blind spots the probe basis inherits from the shipped tests.",
    works: ["behavioral-delta-ledger"],
  },
  {
    id: "arena",
    name: "Synthetic arena with frozen seeds and a pre-declared negative arm",
    does:
      "A fixed generator produces matched conflict pairs across regimes, run over 200 frozen seeds against nine graders, one of which was declared as a negative arm before the run and is expected to fail.",
    cannot:
      "Its ground truth is read off the generator's own blind-spot table, so it measures the contract under that generator rather than the world.",
    works: ["refutation-ledgers"],
  },
  {
    id: "brute-force",
    name: "Brute-force ground truth",
    does:
      "Every assignment over a finite typed slot universe is enumerated and every same-key collision pair is listed, so a detector can be scored against a complete answer rather than a sample.",
    cannot:
      "The universe is 24 synthetic tasks, not a production build graph, and exhaustive enumeration is affordable only at that size.",
    works: ["keyfuse"],
  },
  {
    id: "reference-gate",
    name: "CPU reference gate plus browser demonstration",
    does:
      "The gate recomputes pinned reference hashes, published known-answer tests, and source hashes on the CPU. The browser lab executes the kernels and records a canonical manifest of per-adapter output hashes.",
    cannot:
      "The gate cannot compile WGSL, execute a GPU, or compare two adapters. Only the browser run is a demonstration, and only on the machine that ran it.",
    works: ["reprogpu"],
  },
  {
    id: "permanent-gates",
    name: "Permanent gates in continuous integration",
    does:
      "Every instrument ships a gate that recomputes its pinned aggregates and fails the build when they drift, so a change that silently invalidates a published number cannot merge.",
    cannot:
      "A gate re-derives a published number from the same repository at the same commit. It is a drift alarm, not an independent reproduction.",
    works: [
      "alibi-distance",
      "behavioral-delta-ledger",
      "keyfuse",
      "refutation-ledgers",
      "reprogpu",
    ],
  },
];

/* ────────────────────── empirical scale ──────────────────────────────── */

export interface ScaleEntry {
  /** The number as displayed, in tabular figures. */
  value: string;
  label: string;
  /** The paper this figure belongs to. */
  paper: string;
  /**
   * A literal substring of that paper. The test asserts it is present, which
   * is what makes the figure traceable rather than merely plausible.
   */
  token: string;
}

export const SCALE: readonly ScaleEntry[] = [
  {
    value: "5,730",
    label: "machine-verified Python exercises in the corpus",
    paper: "alibi-distance",
    token: "5,730 exercises",
  },
  {
    value: "106,081",
    label: "single-edit mutants sampled across the corpus",
    paper: "alibi-distance",
    token: "106,081 sampled mutants",
  },
  {
    value: "5,682",
    label: "exercises analyzable in the ledger census",
    paper: "behavioral-delta-ledger",
    token: "5,682 analyzable",
  },
  {
    value: "88,357",
    label: "single-edit mutants sampled in that census",
    paper: "behavioral-delta-ledger",
    token: "88,357 sampled single-edit mutants",
  },
  {
    value: "699",
    label: "simulated edit walks under three policies",
    paper: "behavioral-delta-ledger",
    token: "699 simulated edit walks",
  },
  {
    value: "200",
    label: "frozen seeds in the derived-claim arena",
    paper: "refutation-ledgers",
    token: "200 frozen seeds",
  },
  {
    value: "24",
    label: "frozen tasks with brute-force ground truth",
    paper: "keyfuse",
    token: "frozen 24-task corpus",
  },
  {
    value: "96",
    label: "machine-verified silent-bug puzzles shipped as an artifact",
    paper: "alibi-distance",
    token: "96 verified silent-bug",
  },
  {
    value: "100",
    label: "simulated learners in the scheduling study",
    paper: "ladder-graded-spacing",
    token: "100-learner, 40-item, 365-day simulation",
  },
  {
    value: "5 / 5",
    label: "reference-gate criteria reproduced byte-for-byte",
    paper: "reprogpu",
    token: "five of five criteria",
  },
];

/* ───────────────────── reproducibility ──────────────────────────────── */

export interface ReproEntry {
  /** A command that exists in package.json. */
  command: string;
  what: string;
}

export const REPRO_COMMANDS: readonly ReproEntry[] = [
  {
    command: "bun run verify:alibis",
    what: "Recomputes the alibi census and checks the union and held-out suites.",
  },
  {
    command: "bun run verify:bdl",
    what: "Recomputes the behavioural-delta census and the harness fixtures.",
  },
  {
    command: "bun run verify:keyfuse",
    what: "Runs the 12 KeyFuse criteria against the frozen corpus and pinned aggregates.",
  },
  {
    command: "bun run verify:warrant",
    what: "Runs the 8 warrant criteria against the pinned arena digest.",
  },
  {
    command: "bun run verify:reprogpu",
    what: "Recomputes the reference hashes, known-answer tests, and source pins.",
  },
  {
    command: "bun test",
    what: "Runs the unit tests, including the contract invariants of each instrument.",
  },
];

export const REPRO_LIMITS: readonly string[] = [
  "Each gate re-derives a published number from this repository at this commit. That makes it a drift alarm, not an independent reproduction.",
  "The corpus is the repository. A fork that edits an exercise has a different corpus and will not reproduce these numbers.",
  "The alibi census is the slowest gate and takes about twelve minutes in continuous integration.",
  "No artifact carries a DOI, and no container image is published.",
  "No result here has been reproduced by anyone outside this repository.",
];

/* ───────────────────── programme limitations ────────────────────────── */

/**
 * Limits that apply to the whole portfolio rather than to one paper. They are
 * listed here so that a reader meets them before reading any single claim.
 */
export const PORTFOLIO_LIMITATIONS: readonly string[] = [
  "No work in this portfolio has been peer reviewed, and none has been submitted to a venue.",
  "No human-participant data was collected anywhere. Every learner-behaviour number comes from simulated edit policies or synthetic cohorts.",
  "There is no external replication. The independent second engine in one paper was written by the same author on the same corpus.",
  "No experiment here measures a generative-AI tutor. The agenda names the age of generative AI; LLM-assisted programming is planned work, not a result, and nothing on this page should be read as evidence about it.",
  "The probe banks are derived from the shipped tests and inherit their blind spots.",
  "The systems studied were chosen by the author, so the selection is not a sample of the field.",
  "These results describe this corpus at this commit. They are not a general claim about programming education, and they do not transfer to a corpus authored differently without being re-measured.",
];

/* ───────────────────── planned, unpublished work ─────────────────────── */

export interface PlannedWork {
  id: string;
  title: string;
  /** Always `unpublished`; declared so the status vocabulary stays closed. */
  kinds: readonly WorkKind[];
  /** The question the study would answer. */
  question: string;
  /** What exists today, stated exactly. */
  state: string;
}

/**
 * Work that has not been run. Listed so the direction is visible, and labelled
 * `unpublished` everywhere it appears so it can never be read as a result.
 */
export const PLANNED_WORK: readonly PlannedWork[] = [
  {
    id: "shadow-logging",
    title: "Shadow-logging study",
    kinds: ["unpublished"],
    question:
      "Do the mined near-miss programs resemble the errors learners actually make?",
    state:
      "No data collected. The coupling between a mutation and a learner slip is assumed throughout the Alibi Distance paper, and a shadow-logging study is proposed there. It needs learner telemetry, consent, and ethics review before it can start.",
  },
  {
    id: "tutoring-comparison",
    title: "Assisted-tutoring comparison",
    kinds: ["unpublished"],
    question:
      "In the age of generative AI, does evidence-bearing feedback change outcomes against an unassisted control?",
    state:
      "No protocol is written, registered, or run. No comparison, no effect size, and no claim about AI-assisted learning exists in this portfolio. The agenda names the setting; the measurement has not happened.",
  },
  {
    id: "external-replication",
    title: "External replication",
    kinds: ["unpublished"],
    question:
      "Do the corpus-level rates hold on an exercise corpus authored by someone else?",
    state:
      "Not started. Every figure here comes from a corpus whose author also wrote the measurement code, so the main threat to validity has not been addressed.",
  },
  {
    id: "ledger-intervention",
    title: "Interventional study of the behavioural delta",
    kinds: ["unpublished"],
    question:
      "Does surfacing per-edit behavioural change help a learner, or does it become surveillance?",
    state:
      "Not started. The ledger is deliberately opt-in, count-only, and outside assessment; an intervention would change that boundary and would need a design that a learner can refuse.",
  },
];

/* ───────────────────── the claim convention ──────────────────────────── */

export const CLAIM_CONVENTION: readonly {
  kind: ClaimKind;
  label: string;
  definition: string;
}[] = [
  {
    kind: "result",
    label: "Result",
    definition:
      "Measured in this repository. The number appears in the paper it is attributed to and is recomputed by a gate listed under reproducibility.",
  },
  {
    kind: "hypothesis",
    label: "Hypothesis",
    definition:
      "An assumption, an open question, or work that has not been run. Nothing here has been measured, and a falsified pre-registered prediction is reported as a result about the prediction, not as a hypothesis.",
  },
];

/** The mark that renders beside a claim of the given kind. */
export function claimLabel(kind: ClaimKind): string {
  const entry = CLAIM_CONVENTION.find((option) => option.kind === kind);
  return entry ? entry.label : kind;
}

/** Every claim in the portfolio, in render order, for the tests. */
export function allClaims(): { slug: string; claim: Claim }[] {
  return WORKS.flatMap((work) =>
    [...work.established, ...work.hypotheses].map((claim) => ({
      slug: work.slug,
      claim,
    })),
  );
}
