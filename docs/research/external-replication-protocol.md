# External replication protocol — running the DeepForge methodology on somebody else's corpus

**Status:** protocol. For a third-party lab. Nothing in this document has been executed on a real
external corpus, because no external corpus has been supplied. Until somebody runs it, DeepForge's
**external validity is UNPROVEN**, and the tooling described here is the reason that statement is
still honest rather than a hedge.

Read first: [`external-corpus-format.md`](external-corpus-format.md) (what a corpus file must look
like) and [`external-run-report.md`](external-run-report.md) (what comes out, and how to compare
it). This document is the order of operations.

---

## 1. Environment

| Requirement | Version | Why |
| --- | --- | --- |
| **Bun** | 1.3.9 (what CI pins) | Runs the validator, the runner, and the report |
| **Python 3** | on `PATH`; **CPython 3.13 is the version the committed BDL spot digests were produced on** | The engines are CPython. The repo pins nothing and checks nothing; if you are not on 3.13, expect the spot-record digests to differ (the internal gate will tell you) |
| CPUs | ≥ 2; the runner uses `min(8, cpus)` workers | |
| No GPU, no network, no `.env`, no running server | | The path is entirely local |
| Disk | scratch for the engine's intermediate records | Defaults to `$TMPDIR/deepforge-external-run` |

```bash
git clone <this repository> && cd deepforge
bun install --frozen-lockfile
```

## 2. Build your corpus file

Write one JSON file following
[`external-corpus/format.schema.json`](external-corpus/format.schema.json). Start from the
worked example, which is a **synthetic format fixture** and is labelled as one in its own text:

```bash
cp docs/research/external-corpus/example-synthetic-corpus.json my-corpus.json
```

The minimum each exercise needs is `id`, `reference`, and `tests`; §1 of the format specification
has the contracts. Two things to get right before you start, because they are the two that silently
change a denominator:

- **`input` is always an array** of positional arguments. `[]` for a zero-argument function.
- **`expected` must be present as a key.** `null` is a legal value; a missing key is a rejection.

## 3. Validate — and read the whole accounting

```bash
bun run scripts/verify-corpus.ts --corpus my-corpus.json
```

or `npm run verify:corpus -- --corpus my-corpus.json`.

| Exit | Meaning |
| --- | --- |
| `0` | every exercise and candidate passed. Advisories may still be printed |
| `1` | at least one exercise or candidate was rejected, or a file-level rule fired. The accounting is still printed in full |
| `2` | usage error, or the file could not be read |

Useful flags: `--json` (machine-readable `deepforge-external-validation`), `--rules` (print every
rule in the table with the count that fired), `--quiet` (one line), `--list-rules` (the whole rule
table with remedies), `--no-overlap` (skip the overlap check; a disclosure, not a filter — but the
report then records that it did not happen).

**What a valid run looks like:**

```
filter accounting
  exercises  1284 submitted = 1284 accepted + 0 rejected
  candidates 310 submitted = 310 accepted + 0 rejected
  balances   true
...
PASS — every submitted exercise and candidate passed; 2 disclosure(s)
```

**What an invalid run looks like** — the point of this stage is that you see *which* exercise and
*why*, not a count:

```
filter accounting
  exercises  1284 submitted = 1281 accepted + 3 rejected
  candidates 310 submitted = 309 accepted + 1 rejected
  balances   true

rejections by rule
  exercise/test-expected-missing                 2
  exercise/unknown-field                        1

rejected exercises (3 item(s), 3 rule violation(s))
  exercise/test-expected-missing                 acme-0417 (index 416)
      tests[0] has no "expected"; the key must be present even when the value is null
      path /exercises/416/tests/0/expected
      remedy: `expected` is required; `null` is a legal value, so the key must be present rather than non-null
...
REJECTED — 4 item(s) rejected; the methodology will not run over this corpus until they are fixed
or removed by the submitter
```

Fix the file and re-run. **Do not delete the exercises to make the gate pass** unless you mean it:
dropping an exercise changes the corpus and therefore the measurement, and a corpus with holes in
it is a different corpus. If you must drop one, drop it in your source of truth, re-version the
corpus, and say so in `notes` and in your write-up.

## 4. Write the pre-registration **before** you look at any rate

This is the step that decides whether the run can be called a replication or only a measurement.
Without it, the tooling will emit `PREREGISTRATION_ABSENT` and no verdict in either direction — by
design, not by omission.

A pre-registration is a small JSON file:

```json
{
  "registeredAt": "2026-05-02",
  "registeredBy": "A. Researcher, Lab X",
  "registeredWhere": "https://doi.org/10.0000/your-lab-prereg-2026-05",
  "exclusionPolicy": "Reject any exercise the df-corpus/1 validator rejects; disclose every analyzer exclusion (unparse, no-entry, ref-fails-own-tests, small-basis) with its reason and count. Do not add or remove exercises after seeing any rate.",
  "hypothesis": "The DeepForge hidden-visible rate (45.23%) and exercise-visible-slip rate (44.40%) reproduce on the ACME corpus within 5 percentage points.",
  "margins": {
    "hiddenVisible": 0.05,
    "exercisesWithVisibleSlip": 0.05,
    "testPassing": 0.05,
    "invisible": 0.02
  }
}
```

Fix, in writing and durably, before the run:

1. **The exclusion policy.** What you will do with rejected or unreachable exercises. The tooling
   refuses to run on a corpus with rejections unless you pass `--allow-rejections`, in which case
   the filtering is in the report and the verdict cannot be `AGREE`.
2. **The margins.** One per statistic, in proportions. §6 of
   [`external-run-report.md`](external-run-report.md) explains how to choose them and what the
   required sample sizes are; that section is worth reading *before* you pick, because the margin
   determines whether your corpus is big enough to decide anything at all.
3. **Which corpus.** The choice is the finding's most important uncontrolled factor and cannot be
   fixed after the fact. §5 of the report document says what makes two corpora comparable.

`registeredWhere` should be somewhere time-stamped and public (OSF, a repository DOI). A
pre-registration in a private file is a note to yourself.

## 5. Run

```bash
bun run scripts/external-replication.ts \
  --corpus my-corpus.json \
  --preregistration prereg.json \
  --compare \
  --print
```

or `npm run verify:external -- --corpus my-corpus.json --preregistration prereg.json --compare --print`.

One command. Four stages, in order, and it stops at the first one that does not pass:

| Stage | What happens |
| --- | --- |
| 1. **validate** | `df-corpus/1` check. **Any rejection ends the run.** A corpus the methodology cannot honestly process is not measured on the subset it *can* process and reported as if it were the whole corpus |
| 2. **census** | `scripts/py_external_census.py` runs the committed analyzer (`scripts/py_bdl_verify.py`, imported, not copied) over the **whole** accepted corpus, twice |
| 3. **alibi** | your candidate alibis, composed from the referenced exercises, run through the shipped verifier `scripts/py_alibi_verify.py`. **Nothing is mined here** — DeepForge's alibi mining engine is not in the repository, so candidates can only be verified |
| 4. **report** | one JSON file. `resultDigest` covers the reproducible section only |

**No sampling.** The internal CI gate substitutes a 240-problem stratified sample for a full
census because the census engine is uncommitted and a full run is expensive. Your external run is
over the whole corpus, so its denominator is the corpus. That is the one thing the internal gate
cannot offer, and it is why an external run is worth doing at all.

Options: `--out <path>` (report path), `--scratch <dir>`, `--workers <n>`, `--engine-runs <n>`
(default 2, for the determinism check), `--allow-rejections`, `--preregistration <p>`, `--compare`,
`--no-overlap`, `--print`.

Budget: the BDL analyzer takes roughly 0.25 s of CPython per exercise, times the workers, times the
engine runs. The internal gate's 240-problem sample costs ~137 s on 8 cores. Measure your own
machine rather than trusting that ratio.

## 6. Collect the outputs

You get:

- **the report** — a JSON file named
  `external__<corpusId>__<version>__<resultDigest12>.json` (or `NOT-A-RESULT__synthetic-example__…`
  for a fixture). One report per run; keep them all.
- **scratch intermediates** in `$TMPDIR/deepforge-external-run` (default): the normalised corpus,
  the composed alibi bank, and the analyzer's raw records. Re-derive anything from these; the
  report is the artifact to publish.
- **stdout** ending in one machine-readable line:

```
EXTERNAL_RUN_REPORT {"schema":"deepforge-external-run","kind":"external","corpus":"acme-2026",
 "resultDigest":"9f1c…","exercises":1284,"analyzable":1279,"deterministic":true,
 "notAScientificResult":false}
```

and, with `--compare`, a comparison document and a verdict.

**Check three things before you believe anything:**

1. `deterministic: true` in the summary line, and `twoRunsByteIdentical: true` in the report. If
   it is false, your run is not reproducible and nothing downstream means anything.
2. `exercisesRejected: 0` and `analysisExclusions.complete: true` in the report, with the
   `analysisExclusions.exclusions` array read one entry at a time. Every entry is a *named*
   exclusion: `unparse`, `no-entry`, `ref-fails-own-tests`, `small-basis`, or `crash:<Type>:<msg>`.
3. `provenance.independence` is `independent-from-deepforge` and
   `provenance.overlapWithInternalCorpus.sharedReferences` is 0 — and you have read the
   `doesNotEstablish` string next to it, which says that byte-level overlap is not plagiarism
   detection.

A third party checking your work runs `validateRunReport` over your report, which re-derives
`resultDigest` and checks the filter accounting, the denominator rule, the two exclusion ledgers,
and the provenance. It does not trust your numbers; it checks that your report is internally
consistent and that its digest covers what it claims to.

## 7. Interpret

Verdicts, in the order the tooling applies them — any blocking condition wins over everything:

| Verdict | Means |
| --- | --- |
| `NOT_COMPARABLE` | something structural: not an external corpus, independence undeclared or derived, byte-identical overlap with the internal corpus, a rejected exercise, an unaccounted analyzer exclusion, or a nondeterministic run |
| `PREREGISTRATION_ABSENT` | no pre-registration, or one that names no margin — so no verdict is legal in either direction |
| `INSUFFICIENT_SAMPLE` | fewer analyzable exercises than the pre-registered margin requires. The `minExercisesForMargin` field says how many you needed |
| `INCONCLUSIVE` | the 95% interval straddles the edge of the band, or is too wide to decide |
| `DISAGREE` | the 95% interval is entirely outside the pre-registered band |
| `AGREE` | the 95% interval lies entirely inside the pre-registered band |

`AGREE` is the best available outcome and it is still not the word "replicated". The decision rule
requires the **whole interval** to be inside the band, so a wide interval can never be read as
agreement — which is precisely the failure mode of a symmetric 3σ tolerance band. Concretely, on
the internal 240-problem sample the `hidden_visible` rate came out 42.33% against a published
45.23% with a ±10.07pp tolerance: the point is 2.90pp from the headline and the gate passes, but
the interval [32.26%, 52.40%] straddles the edge of even a 10pp band, so the comparison rules call
that `INCONCLUSIVE` at **every** margin down to 1.29pp. Those numbers are the gate's own, from
`bun run verify:bdl`; they are not new measurements.

`DISAGREE` is a publishable finding about the corpora. It is not by itself evidence that the
DeepForge rate is wrong: the internal rate carries its own provenance gap, listed on every
comparison row and in §4 of the report document.

`INCONCLUSIVE` with the required `n` attached is a good contribution. It is the correct answer
whenever the corpus is too small for the margin, and it is more useful than an `AGREE` obtained by
choosing a margin after seeing the data.

## 8. What a claim of external validity would require

State all of it, or state none of it. In order:

1. **A corpus that is not ours.** Attributable maintainer, a named source, a snapshot date, a
   licence, a declared production method, and a declared independence from DeepForge. A corpus we
   generated, derived from ours, or cannot attribute is not external evidence no matter how the
   numbers come out.
2. **A clean run.** Zero validator rejections (or an explicit, pre-registered exclusion policy and
   a report that shows the filtering), zero unaccounted analyzer exclusions with every exclusion
   enumerated by reason, and a determinism check that passed.
3. **A pre-registration**, fixed in writing before any rate was seen, naming the exclusion policy
   and one margin per statistic, with `n` large enough for the margin.
4. **A run at full scale** over the whole corpus, not a subsample, with the engine digests recorded
   so a reader can confirm the same analyzer build ran.
5. **A published artifact**: the corpus file (or its digest plus a retrieval route), the pre-
   registration, the report, the comparison document, and the verdict — **including if the verdict
   is `INCONCLUSIVE` or `DISAGREE`**.
6. **A reader other than the authors.** Independence of the *judge*, not only of the sample. The
   audit found this distinction missing from the DeepForge papers' own use of the word
   "independent", and the same standard applies here.
7. **On the alibi side, something weaker.** Because the alibi mining engine is not in the
   repository, an external run can have its candidate alibis **verified**; it cannot reproduce the
   46.08% radius-one aperture rate, and no amount of running this tooling will change that.

**Until all seven hold, the correct sentence is: "the methodology is runnable on an independent
corpus by one command", not "the results replicate".** This repository currently supports only the
first sentence, and the tooling here is what makes saying so checkable.

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `provenance/collides-with-deepforge-corpus` | your corpus *is* DeepForge's, or contains it wholesale | not an external corpus; the internal gate measures ours |
| `corpus/origin` fatal | `origin` is `internal` or unknown | use `external`; there is no internal value by design |
| `exercise/reference-no-def` on most of your corpus | the reference has no `def`, or the validator's entry mirror and yours disagree | the engines call a named function; supply one |
| `exercise/test-expected-missing` | a test case has no `expected` key | add the key; `null` is fine as a value |
| many `small-basis` analyzer exclusions | few shipped tests, or test inputs too large to seed probes | disclosed by the validator as `advisory/tests-below-three` and `advisory/test-input-repr-over-engine-cap` before you run; more tests, smaller inputs |
| `INSUFFICIENT_SAMPLE` with a huge required `n` | the margin is tight relative to your corpus | read §6 of the report document; either enlarge the corpus or pre-register a margin your corpus can decide |
| `NOT_COMPARABLE: P3` | independence `unknown` or `derived-from-deepforge`, or byte-identical references shared | not fixable by editing the report; it is a fact about the corpus |
| `deterministic: false` | two engine runs differed | a real problem; report it rather than re-running until it passes |
| `ALIBI_CANDIDATE_FAILURES` | the verifier rejected a candidate | read the line: either the ghost fails a shipped test, or it matches the reference at the witness, or a union/held-out probe found the divergence. All three are the verifier working |

## 10. What this protocol does not buy you

Stated plainly, because a reader needs the difference between "runnable" and "validated":

- It does **not** reproduce the Alibi Distance census. The mining engine, its edit families, and
  its candidate pool are not in this repository; the funnel is a hard-coded constant.
- It does **not** reproduce the BDL full-corpus census exactly. An external run shares the
  *committed* analyzer with the internal gate, and the published census came from an uncommitted
  engine. An external run and the gate are exactly commensurable; an external run and the published
  census are commensurable in definition only. Every comparison row says so.
- It does **not** make a corpus comparable by declaring it comparable. Comparability is a
  pre-registered property of a chosen corpus.
- It does **not** detect a paraphrased or machine-rewritten derivative of the internal corpus.
  Byte overlap is not plagiarism detection, and the report says so on every run.
- It does **not** make DeepForge's own numbers better. It makes them *falsifiable from outside*,
  which is a different and smaller achievement, and the only one available while the mining and
  census engines are absent.
