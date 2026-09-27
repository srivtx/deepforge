# The external run report, and how to compare it to the internal results

**Status:** specification. Emitted by `scripts/external-replication.ts`, produced by
`src/lib/externalCorpus/report.ts` and `src/lib/externalCorpus/compare.ts`, checked by
`validateRunReport`. Inputs: [`external-corpus-format.md`](external-corpus-format.md). Procedure:
[`external-replication-protocol.md`](external-replication-protocol.md).

---

## 1. The shape of a report, and the one decision that shapes it

```jsonc
{
  "schema": "deepforge-external-run",
  "schemaVersion": 1,
  "provenance":    { /* who ran what, carried end to end — §2 */ },
  "reproducible":  { /* everything a re-run must reproduce — §3 */ },
  "resultDigest":  "sha256 over the canonical `reproducible` object, and nothing else",
  "runMetadata":   { /* everything that legitimately varies — §4 */ },
  "comparison":    null   // filled only by the comparison tool, and only with its preconditions
}
```

The report is split into a reproducible half and a run-metadata half, and `resultDigest` covers
**only the first**. That split is the direct answer to a specific, documented failure: the
portfolio's existing REPROGPU `manifestSha256` hashes the whole manifest, and every record in it
carries a timestamp and a duration, so the digest changes on every run and therefore cannot be
compared between two runs — which means nobody ever compares it. A digest that cannot be compared
is not a reproducibility mechanism; it is a checksum nobody checks.

Here, `runMetadata.reproducible` is typed `false`, so folding a timestamp into a digest is a type
error rather than a judgement call. Two unit tests and gate check F5a assert it directly: change
all eleven run-metadata fields — `startedAt`, `finishedAt`, `durationSeconds`, `host.platform`,
`host.arch`, `host.cpus`, `runtime.bun`, `runtime.node`, `runtime.python`, `workers`, `command`,
`outputPath` — and `resultDigest` does not move. Change a measured value and it does.

## 2. `provenance`

Carried from the corpus file into every log line, every report, and every output file name. Fields:
`kind` (`external` | `synthetic-example`), `corpusId`, `corpusName`, `corpusVersion`,
`corpusContentDigest`, `maintainer`, `source`, `obtained`, `method`, `independence`, `licenseId`,
`licenseUrl`, `synthetic`, `notAScientificResult`, `label`, `overlapWithInternalCorpus`.

- `corpusContentDigest` is SHA-256 over the canonical `{exercises: [{id, category, difficulty,
  solution, testCases}], candidateAlibis}` projection — the fields the engines read. Re-indenting
  the file or editing a title does not move it; changing one byte of a reference solution or a test
  expectation does.
- `corpusBytesSha256` (in `reproducible`) is the digest of the raw file, so a formatting-only
  change is still visible.
- `overlapWithInternalCorpus` records `sharedReferences`, `sharedIds`, `isTheInternalCorpus`, and a
  `doesNotEstablish` string saying what byte-level overlap cannot detect.
- `label` is `EXTERNAL CORPUS <id>@<version>` or
  `SYNTHETIC EXAMPLE (not a scientific corpus) <id>@<version>`. **Every log line in this path is
  prefixed with it.** A synthetic report additionally has `notAScientificResult: true` and a file
  name starting `NOT-A-RESULT__synthetic-example__`.

## 3. `reproducible`

| Field | Content |
| --- | --- |
| `formatVersion`, `schemaVersion` | the two contract versions |
| `corpusContentDigest`, `corpusBytesSha256`, `corpusBytes` | the corpus identity, three ways |
| `engine` | `{bdl, alibi, runner, census}`, each `{path, sha256, bytes}` — the run names the exact code that produced it |
| `bdlConstants`, `alibiConstants` | the frozen engine constants, restated so a reader sees the configuration without diffing Python. Unit-tested against `scripts/py_bdl_verify.py` and `scripts/py_alibi_verify.py` |
| `filterAccounting` | §5 |
| `analysisExclusions` | §6 |
| `measurements` | §3.1 |
| `records` | the analyzer's own per-exercise records, timing excluded |
| `recordsDigest` | SHA-256 over `records` |
| `determinism` | `{twoRunsByteIdentical, recordsDigestFirst, recordsDigestSecond}` |
| `alibiVerification` | §7, or `null` |

### 3.1 Measurements: no rate without its denominator

Every one of the eight statistics carries its definition verbatim, a `definitionDigest` over
(definition, unit), its unit, its numerator, its denominator, a point estimate, a 95% interval, the
method that produced the interval, the cluster-robust SE, the binomial SE, the ratio between them,
and a `caveat` string when anything about the interval needs saying.

| `id` | Unit | Definition | Internal reference |
| --- | --- | --- | --- |
| `analyzable` | exercise | exercises the analyzer produced a record for ÷ exercises submitted to it | 5,682 / 5,730 |
| `mutantsPerExercise` | exercise | generated mutants ÷ analyzable exercises — a **per-unit mean**, `scale: "per-unit"` | 88,357 / 5,682 |
| `invisible` | mutant | mutants identical to the reference on every basis probe ÷ mutants | 9,041 / 88,357 = 10.23% |
| `testPassing` | mutant | mutants passing every shipped test ÷ mutants | 14,534 / 88,357 = 16.45% |
| `hiddenVisible` | mutant | test-passing mutants that churn ÷ test-passing mutants | 6,574 / 14,534 = 45.23% |
| `exercisesWithVisibleSlip` | exercise | exercises with ≥ 1 test-passing churning mutant ÷ analyzable | 2,523 / 5,682 = 44.40% |
| `allVisibleExercises` | exercise | exercises with ≥ 1 mutant and 0 invisible ÷ (analyzable − zero-mutant) | 2,818 / 5,627 = 50.08% |
| `zeroMutantExercises` | exercise | analyzable exercises with no mutant generated | 55 / 5,682 |

Rules the report holds itself to:

- **`denominator === 0` yields `point: null`, never 0.** A rate over nothing is not a small rate; it
  is an absent rate, and `validateRunReport` fails any report that claims otherwise in either
  direction.
- **`mutantsPerExercise` is a mean, not a proportion.** Its `scale` is `per-unit`, it has
  `seBinomial: null` and `designEffect: null`, its interval is a cluster-robust normal interval
  that is *not* clamped to [0, 1], and the comparison computes **no** risk difference, risk ratio,
  or odds ratio against it. `p(1−p)/n` is not a variance for a quantity whose point estimate is
  6.75 per exercise, and a module that produces such a number is producing a number with no meaning.
- **A degenerate interval says so.** When every cluster contributes the same proportion the
  cluster-robust SE is exactly 0 and the interval collapses onto the point; `caveat` says "this is
  arithmetic, not precision".
- **Non-finite numbers cannot be hidden.** `canonicalJson` throws on one, `validateRunReport`
  catches that and reports it as a problem rather than crashing, and walks the whole report for
  non-finite numbers with their JSON paths.

## 4. `runMetadata` — recorded, never hashed

`startedAt`, `finishedAt`, `durationSeconds`, `host` (`platform`, `arch`, `cpus`), `runtime` (`bun`,
`node`, `python`, `pythonImplementation`, `pythonVersion`), `workers`, `command`, `outputPath`, and
the literal `reproducible: false`.

This is where environment provenance lives, and it is attached *to the run* as required — it is
simply not mixed into the digest. A reader comparing two runs compares `resultDigest`; a reader
diagnosing a difference compares `runMetadata`.

## 5. `filterAccounting` — the survivorship ledger

```jsonc
{
  "exercisesTotal": 1284, "exercisesAccepted": 1284, "exercisesRejected": 0,
  "rejectionsByRule": {}, "rejections": [],
  "alibisTotal": 310, "alibisAccepted": 310, "alibisRejected": 0,
  "alibiRejectionsByRule": {}, "alibiRejections": [],
  "advisories": [], "advisoryCounts": {},
  "balances": true
}
```

- `exercisesTotal === exercisesAccepted + exercisesRejected` is **asserted**, and a violation
  throws rather than being noted.
- Each entry of `rejections` is `{code, scope, target, index, message, remedy, path}` — the
  exercise id, its 1-based array index, one sentence naming the offending value, what to do, and a
  JSON path. `exercisesRejected` counts *items*; `rejections.length` counts *violations*, and one
  exercise breaking three rules is one rejected exercise and three violations. Both are reported.
- `advisories` are disclosures that never filter. Each is `{code, target, index, message, count}`.
  They travel into the report and into every comparison, and they change no verdict except by being
  visible to a reader.

## 6. `analysisExclusions` — a separate ledger, never summed with §5

```jsonc
{
  "exercisesSubmitted": 1284, "exercisesAnalyzable": 1279,
  "exclusions": [{ "reason": "small-basis", "count": 5, "exerciseIds": ["acme-0007", …] }],
  "byReason": { "small-basis": 5 },
  "complete": true
}
```

The reasons are the analyzer's own, verbatim: `unparse`, `no-entry`, `ref-fails-own-tests`,
`small-basis`, `crash:<Type>:<msg>`. Every affected exercise id is listed, so an exclusion is
auditable one at a time. `complete` is a self-declaration and is **cross-checked against the
counts** in two places — `validateRunReport` and the comparison's P5 precondition — because a
report that claims completeness while leaving exercises unaccounted for is exactly the case a
self-declared flag cannot be trusted on.

**§5 and §6 are never merged.** "The validator rejected this exercise" and "the analyzer could not
reach this exercise" are different facts with different causes, and summing them is how a reader
ends up believing a rate has a denominator it does not have.

## 7. `alibiVerification`, or `null`

```jsonc
{
  "candidatesSubmitted": 310, "verified": 298, "failed": 12,
  "divergence": { "crash": 41, "value": 257, "timeout": 0 },
  "unionProbes": 51204, "heldOutProbes": 11388,
  "gateSummaryDigest": "…",
  "perCandidate": [{ "id": "acme-alibi-0007", "exerciseId": "acme-0017", "verified": true, "divergence": "value" }]
}
```

Produced by running `scripts/py_alibi_verify.py` — the shipped verifier — over the composed
candidate bank. It is `null` when the corpus declared no candidates, and the run says out loud that
nothing was verified about Alibi Distance and nothing may be concluded from it.

**This is verification, not mining.** DeepForge's alibi mutation-mining engine is not in this
repository. An external run can have its own miner's output checked; it cannot regenerate an alibi
rate, and no comparison in §5 offers an alibi verdict.

## 8. Validating a report you did not produce

```ts
import { validateRunReport } from "@/lib/externalCorpus";
const check = validateRunReport(JSON.parse(readFileSync(process.argv[2], "utf8")));
if (!check.ok) { console.error(check.problems); process.exit(1); }
```

It checks: the schema tag and version; that `resultDigest` re-derives from `reproducible`; that
provenance is present, `kind` is one this format defines, and `synthetic` agrees with
`notAScientificResult`; that both accounting identities hold and no rejection list is shorter than
its count; that the exclusion ledger's ids match its counts and that `complete` agrees with the
arithmetic; that every measurement's `point` is `null` exactly when its denominator is 0 and that
no numerator exceeds its denominator; that `runMetadata.reproducible` is `false`; and that the
report contains no non-finite number. It does not trust any number — only that the report is
internally consistent and that its digest covers what it claims to.

## 9. The comparison document

`compareExternalRun` takes a report plus a pre-registration (or `null`) and returns
`{schema, schemaVersion, provenance, preconditions, verdict, verdictReason, interpretation,
statistics, decisionRule, alpha, power}`. It is a pure function of its two inputs, so the document
itself can be digested and quoted.

### 9.1 Preconditions

Seven, each with a statement, a boolean, and a detail string:

| id | Holds when |
| --- | --- |
| `P1-external-corpus` | the run measured a corpus declaring `origin: "external"` |
| `P2-provenance-complete` | maintainer, source, snapshot date, method ≠ `unknown`, and licence are all present |
| `P3-independence` | `independence: "independent-from-deepforge"` **and** the overlap check found 0 byte-identical references |
| `P4-engine-identity` | always, with the digests named: the shared analyzer is the *committed gate's* analyzer, so an external run and the gate are exactly commensurable while an external run and the published census are commensurable in definition only |
| `P5-filter-accounting` | 0 validator rejections, 0 candidate rejections, and `analyzable + Σexcluded === submitted` — recomputed from the counts, **not** read off the report's own `complete` flag |
| `P6-preregistration` | a pre-registration with a margin was supplied |
| `P7-determinism` | two engine runs produced byte-identical records |

Any failure of P1–P3, P5, or P7 forces **every** statistic to `NOT_COMPARABLE` and names the
blocking reason. There is no way to configure them away.

**A *named, arithmetically accounted* analyzer exclusion is a disclosure, not a block.** The
methodology cannot measure an exercise whose reference does not parse, and the share of such
exercises is itself a reported measurement (`analyzable`). What blocks a verdict is an
*unaccounted* exclusion — one where the counts do not add up, or where the report claims
`complete: true` while exercises have vanished. The internal corpus has 48 such skips out of
5,730 and the internal gate treats them as normal; a comparison that refused to run on any corpus
with a single skip would push labs toward larger corpora for the wrong reason.

### 9.2 Per statistic

`internal` (numerator, denominator, point, interval, and a provenance string naming the file and
lines the numbers were transcribed from), `external` (the same shape or `null`), `margin`,
`minExercisesForMargin`, `minExercisesForPower`, `designEffect`, `riskDifference` (Newcombe
hybrid-score method 10), `riskRatio` (Katz log), `oddsRatio` (Woolf log), `commensurable`,
`commensurabilityDetail`, `verdict`, `verdictReason`.

- **Commensurability is checked by digest.** Each statistic's `definitionDigest` is SHA-256 over
  `(definition, unit)`. Two reports can therefore *prove* they measured the same thing; a
  mismatch is `NOT_COMPARABLE` with both digests shown. This is the direct fix for the audit's
  finding that two of the portfolio's "replications" compared statistics that were not the same
  statistic.
- **Effect sizes only exist between proportions.** `per-unit` rows get `null` for all three, and
  also `null` for both sample-size figures: `n = z²p(1−p)/d²` is a statement about a proportion, and
  applying it to "mutants per exercise" (a point estimate of 15.55 per exercise) would "require"
  one exercise. Publishing that would be worse than publishing nothing.
- **An empty 2×2 cell makes a log-method ratio undefined**, and it is reported as `undefined` with
  a reason. No Haldane–Anscombe 0.5 is substituted: a continuity correction is a number nobody
  measured.

### 9.3 The decision rule, stated once

> For a pre-registered equivalence margin `d` and the external 95% interval `[l, u]`: **AGREE** iff
> `[l, u]` is entirely inside `[p_internal − d, p_internal + d]`; **DISAGREE** iff `[l, u]` is
> entirely outside that band; otherwise **INCONCLUSIVE**. A wide interval therefore can never be
> read as agreement, which is the failure mode a symmetric 3σ tolerance band produces.

The document's overall verdict is the worst verdict among the statistics that *have* a
pre-registered margin; a statistic with no pre-registered margin is `NOT_COMPARABLE` and excluded
from the aggregate rather than allowed to veto it.

### 9.4 Why the rule is interval containment and not a tolerance band

Both rules applied to the internal gate's own 240-problem sample row for `hiddenVisible` (observed
42.33%, ±10.07pp — `bun run verify:bdl` stdout, not a new measurement):

| margin | internal gate's rule (point within band) | this format's rule | exercises needed |
| --- | --- | --- | --- |
| 10.07pp | would pass | `INCONCLUSIVE` | 94 |
| 5.00pp | would pass | `INCONCLUSIVE` | 381 |
| 2.00pp | would fail | `INCONCLUSIVE` | 2,380 |
| 1.29pp | would fail | `INCONCLUSIVE` | 5,719 |

The point estimate is 2.90pp from the published 45.23%, so a 3σ band of ±10.07pp passes it. The
interval behind that point, [32.26%, 52.40%], is too wide to support any verdict at any of these
margins, and the gap between "2.90pp away and passing" and "no verdict available" is the entire
argument for reporting an interval instead of a tolerance. This is the audit's 42.33%-versus-45.23%
finding, made operational.

## 10. Sample size: what you need before you can claim anything

`n = ⌈z²·p(1−p)/d²⌉` at two-sided 95% — the `n` at which the interval is *narrower than the
pre-registered margin*, which is the "can the question be decided at all" figure. For clustered
(mutant-unit) rates it is multiplied by the observed design effect. These are computed, not
transcribed: `sampleSizeGuidance()` produces them, and the numbers below are its output.

| statistic | p | unit | design effect | d = 10pp | d = 5pp | d = 2pp |
| --- | --- | --- | --- | --- | --- | --- |
| `analyzable` | 0.9916 | exercise | — | 4 | 13 | 80 |
| `invisible` | 0.1023 | mutant | 1.85 | 67 | 263 | 1,634 |
| `testPassing` | 0.1645 | mutant | 1.68 | 90 | 357 | 2,218 |
| `hiddenVisible` | 0.4523 | mutant | 1.64 | 158 | **625** | 3,904 |
| `exercisesWithVisibleSlip` | 0.4440 | exercise | — | 95 | **380** | 2,371 |
| `allVisibleExercises` | 0.5008 | exercise | — | 97 | 385 | 2,401 |

**The design effects are measured, not assumed.** The internal gate's `detail` field reports the
cluster-robust SE alongside the denominator on the same sample: 3.33pp cluster against 2.03pp
binomial for `hiddenVisible` (1.64×), 1.01pp against 0.60pp for `testPassing` (1.68×), 0.94pp
against 0.51pp for `invisible` (1.85×) — variance inflations of 2.7×, 2.8×, 3.4×. (The cluster
figures are the gate's `detail` field verbatim; the binomial figures are derived at the observed
rate and denominator, `√(p(1−p)/n)`.) For
exercise-unit rates the cluster-robust SE and the binomial SE coincide *exactly*, which is a useful
consistency check on the implementation rather than a coincidence: when every cluster has
`b_i = 1`, `Σ(a_i − p·b_i)² = n·p(1−p)`, so the cluster-robust SE reduces algebraically to the
binomial SE. That is why the table shows no design effect for exercise-unit rows.

The second figure, `minExercisesForPower`, is the `n` at which a margin-sized departure is detected
with 80% power at α = 0.05 under the normal approximation for a one-sample proportion test. For
`exercisesWithVisibleSlip` at p = 0.4440: 112 exercises for a 10pp shift, 446 for 5pp, 2,786 for
2pp. The power figure is always larger than the interval figure, which is the honest relationship:
deciding agreement is a weaker requirement than detecting disagreement.

**So the practical floor for a 5pp margin is ~380 analyzable exercises for an exercise-unit rate and
~625 for a mutant-unit rate.** A corpus of 100 exercises cannot support a 5pp claim on any of these
statistics, and the report will say `INSUFFICIENT_SAMPLE` and print the `n` it needed.

Every report also carries its *own* observed design effect, so the second run on your corpus can
inflate by what your data actually showed rather than by DeepForge's.

## 11. The standing interpretation, attached to every comparison

The comparison document carries an `interpretation` array that no caller can omit. In substance:

- **A different corpus may legitimately produce a different rate.** Corpora differ in language
  dialect, author population, exercise length, shipped test count, and mutation-basis size, and the
  last of those moves these rates more than anything else. A difference between two corpora is a
  property of the corpora until it is shown to be a property of the methodology.
- **`AGREE` is not "replicated".** It means the external interval lies inside the band. The
  DeepForge number it is compared against was itself produced by an uncommitted engine and checked
  on a 240-problem sample; every comparison row says so.
- **`DISAGREE` is publishable, and is not by itself evidence the DeepForge rate is wrong.** The
  internal rate has its own provenance gap.
- **`INCONCLUSIVE` is the most common honest outcome**, and it is the correct one whenever the
  sample is too small for the margin. `INCONCLUSIVE` with the required `n` attached beats `AGREE`
  obtained by choosing a margin after seeing the data.
- **Until an external corpus has actually been run by someone else, DeepForge's external validity
  is UNPROVEN.** This tooling makes that run one command away; it does not constitute it.

## 12. The internal reference, and its own provenance gap

`src/lib/externalCorpus/internal.ts` transcribes `CENSUS_COUNTS` and `HEADLINE_RATES` from
`scripts/py_bdl_verify.py` (lines 88–105 and 109–116). A unit test parses that file and asserts
every transcribed value matches it, so the two cannot drift apart silently.

What the reference is, precisely, because the audit was blunt about it:

- The **counts** came from `bdl_engine_clean.py` + `census_clean.jsonl`, **neither of which is in
  this repository**. They are NEEDS-VERIFICATION numbers and `py_bdl_verify.py:44-49` says so in
  its own docblock.
- The **gate** re-derives them on a 240-problem stratified sample inside 3σ bands, two of which are
  ±10.07pp and ±9.92pp.
- The **engine** an external run shares with the gate is the committed analyzer, not the
  uncommitted census engine. So an external run and the *gate* are exactly commensurable; an
  external run and the *published census* are commensurable in definition only.
- The **alibi side has no reference rates at all**, and that absence is deliberate: with no
  committed alibi census, `compareExternalRun` offers no alibi statistic and no alibi verdict. The
  constant `INTERNAL_ALIBI_REFERENCE.comparisonPossible` is `false` with the reason attached.
- The **corpus** is hand-authored to a written specification, in batches, by agents. No generator,
  no per-exercise provenance, no independence or contamination control.

`INTERNAL_LIMITATIONS` carries all five as strings, and they are part of the comparison
document's provenance rather than a footnote in a readme.

## 13. A pre-registration template

`docs/research/external-replication-protocol.md` §4 has the annotated version. The short form:

```json
{
  "registeredAt": "YYYY-MM-DD",
  "registeredBy": "name, lab",
  "registeredWhere": "durable public URL or DOI",
  "exclusionPolicy": "what you will do with rejected and unreachable exercises, in advance",
  "hypothesis": "optional",
  "margins": { "hiddenVisible": 0.05, "exercisesWithVisibleSlip": 0.05 }
}
```

Without it, every verdict is `PREREGISTRATION_ABSENT` and the run is still a perfectly good
measurement — it just cannot be called agreement or disagreement in either direction. The
reference margins the tooling falls back to for *sample-size guidance only* are the published
internal CI half-widths rounded up to a whole percentage point; they are never used to produce a
verdict, and the report says so on the row that used one.
