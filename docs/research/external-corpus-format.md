# The external exercise-corpus format — `df-corpus/1`

**Status:** specification. Normative for `src/lib/externalCorpus/validate.ts`, whose rule table
is the executable half of this document. Machine-readable half:
[`external-corpus/format.schema.json`](external-corpus/format.schema.json). Worked example:
[`external-corpus/example-synthetic-corpus.json`](external-corpus/example-synthetic-corpus.json)
(a **synthetic format fixture**, not a scientific corpus). Protocol:
[`external-replication-protocol.md`](external-replication-protocol.md). Output and comparison
formats: [`external-run-report.md`](external-run-report.md).

## 0. What this format is for, in one paragraph

DeepForge's Alibi Distance and Behavioral Delta Ledger methodologies were only ever run against
DeepForge's own hand-authored corpus of 5,730 Python exercises. That makes every rate in the
portfolio a statement about one corpus produced by one group, and it is the single largest
threat to the work being externally checkable. This format is the minimum contract an
independent lab has to satisfy to point those two methodologies at *their own* exercise corpus
without editing a line of the research engine. It is deliberately small: it declares exactly the
six fields the two committed engines actually read, plus the provenance and licence a reader
needs before believing anything the run produces, and nothing else. A corpus is one JSON file,
so a third party ships one artifact, and its byte digest is its identity.

## 1. The minimal valid exercise

A corpus file is a JSON object with four required top-level fields:

```jsonc
{
  "format": "df-corpus",       // exact tag
  "formatVersion": 1,          // exact integer
  "corpus": { /* see §3 */ },  // identity, provenance, licence
  "exercises": [ /* see §4 */ ] // at least one
}
```

The minimal valid **exercise** is three fields:

```jsonc
{
  "id": "acme-001",                                  // unique; seeds the probe bank
  "reference": "def total(xs):\n    return sum(xs)\n", // the program
  "tests": [                                          // at least one
    { "input": [[1, 2, 3]], "expected": 6 }
  ]
}
```

Those three are exactly what the engines read, and no more:

| Field | Read by | Contract |
| --- | --- | --- |
| `id` | `py_bdl_verify.py:600` (`md5(id)` seed), `py_alibi_verify.py:829` (probe seeds) | Matches `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/`, unique in the file. **Load-bearing**: the analyzer derives each exercise's mutation seed from `md5(id)[0:8]`, so changing an id changes that exercise's mutants. |
| `reference` | both | Non-empty Python source, ≤ 20,000 characters, no C0 control bytes, at least one `def`, and an entry point the engines can resolve (§4.3). |
| `tests` | both | At least one case; each case has `input` (always an array) and `expected` (**key** required, value may be `null`). |

**Why only these three.** `src/lib/bdl.ts`, `src/lib/alibiHunt.ts`, and the two Python gates read
`id`, `category`, `difficulty`, `solution`/`reference`, and `testCases`/`tests`. A title, a
description, a hint, a starter snippet, a learning path — none of them reach a measurement.
Declaring them as required would be a filter with no scientific content behind it, and the audit
this work answers was, in part, about filters like that. So they are optional, carried, and never
used to include or exclude anything.

## 2. Field-by-field contract

### 2.1 Top level

| Field | Required | Type | Contract |
| --- | --- | --- | --- |
| `format` | yes | string | exactly `"df-corpus"` |
| `formatVersion` | yes | integer | exactly `1`. An unimplemented version is **refused**, not guessed at |
| `corpus` | yes | object | §3 |
| `exercises` | yes | array | 1 … 200,000 objects (§4). An empty array is a hard rejection: 0/0 is not a result |
| `candidateAlibis` | no | array | §5. **Absence is meaningful** (§5.1) |
| `notes` | no | string | free text; never read |

Any other top-level key is a hard rejection (`file/unknown-field`). A misspelled key is how a real
exercise silently becomes a zero-test exercise and quietly changes the denominator of every rate
computed from the corpus. A key beginning `x-` is a vendor extension: recorded, ignored, and
reported as `advisory/ignored-extension`.

### 2.2 Test case

| Field | Required | Type | Contract |
| --- | --- | --- | --- |
| `input` | yes | array | Positional arguments, JSON-serializable, ≤ 64 levels deep. `[]` for a zero-argument function. Compared under the engines' 1e-6 deep equality |
| `expected` | yes | any | The **key must be present**. `null` is a legal expected value, so a missing key and a null value are different things and the validator distinguishes them (`exercise/test-expected-missing`) |

### 2.3 Caps, and why each one is a number rather than a guess

| Cap | Value | Justification |
| --- | --- | --- |
| `reference` length | 20,000 chars | The longest reference in the 5,730-problem internal corpus is **1,902** characters (`ds-191`). The cap is 10.5× that, so it cannot exclude a legitimate exercise of this methodology; it bounds a hostile or accidentally inlined file |
| `witness` length | 2,000 chars | `ALIBI_INPUT_MAX_CHARS` in `src/lib/alibiHunt.ts:18` — the engine's own limit on a Python literal, not a new invention |
| `exercises` count | 200,000 | The internal corpus has 5,730. The cap is a resource bound on an O(exercises × mutants × probes) CPython run, ~35× larger than anything plausible |
| `category` / `difficulty` | 120 chars | Free-form labels, not an enum (§2.4) |
| test-input probe cap | *disclosure* at 4,000 chars | `probe_bank` drops candidates whose `repr` is ≥ 4,000, so a shipped input that large seeds no probes. Disclosed, never filtered (§6) |

### 2.4 `category` and `difficulty` are free text, and their absence is disclosed

DeepForge's internal corpus uses 15 fixed category names. An external corpus is **not** required
to. Requiring DeepForge's taxonomy would import an internal convention into a contract whose whole
point is to be independent of DeepForge internals, and it would reject otherwise perfectly
measurable exercises for a reason that has nothing to do with the methodology.

Both fields are therefore optional free text. An absent `category` means the corpus's taxonomy is
undeclared: the exercise is **accepted**, the run reports the taxonomy as undeclared, and the
whole-corpus digest comparison against the internal corpus reports `not-applicable` (it cannot
project a corpus with undeclared labels onto the internal field set). An absent `difficulty` is
recorded as `unspecified` — never defaulted to a value nobody chose — and `difficulty` is never
filtered on in any case.

## 3. The `corpus` object

All seven fields are required.

| Field | Type | Contract | Why it is required |
| --- | --- | --- | --- |
| `id` | string | `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/` | Identity in every log line, report, and file name |
| `name` | string | 1–120 non-blank chars | A corpus nobody can name is not a citable object |
| `version` | string | `/^[A-Za-z0-9][A-Za-z0-9._+-]{0,31}$/` | Two snapshots of the same corpus are two measurements, and a report must say which one ran |
| `origin` | enum | `external` \| `synthetic-example` | **There is deliberately no `internal` value** — see §7 |
| `language` | const | `"python"` | The engines exec CPython source. No other dialect is implemented, and saying so prevents a reader assuming otherwise |
| `provenance` | object | §3.1 | A rate from an unattributable corpus cannot be argued about |
| `license` | object | §3.2 | Redistribution of a report that quotes a corpus's exercises depends on it |

### 3.1 `corpus.provenance`

| Field | Required | Contract |
| --- | --- | --- |
| `maintainer` | yes | non-blank. Who answers for this snapshot |
| `source` | yes | non-blank. Where the exercises came from: URL, DOI, repository, local path |
| `obtained` | yes | ISO date `YYYY-MM-DD` |
| `method` | yes | `hand-authored` \| `generated` \| `derived` \| `unknown` |
| `independence` | yes | `independent-from-deepforge` \| `derived-from-deepforge` \| `unknown` |
| `contaminationNotes` | no | free text |
| `tooling` | no | free text |

`independence` is the submitter's own declaration, and the comparison treats it as decisive:
`unknown` and `derived-from-deepforge` both force the verdict to `NOT_COMPARABLE`
(`docs/research/external-run-report.md` §5). `unknown` is a legal value and a disclosure, not a
rejection — a lab that genuinely cannot answer should be able to submit and be told exactly what
its answer is worth.

### 3.2 `corpus.license`

| Field | Required | Contract |
| --- | --- | --- |
| `id` | yes | SPDX identifier or the literal `NOASSERTION`, ≤ 64 chars |
| `url` | yes | non-blank. Where the text lives |
| `holder`, `notes` | no | free text |

`NOASSERTION` is legal and produces `advisory/license-unasserted`. It blocks nothing by itself: an
unlicensed corpus can still be measured, and the run discloses the fact rather than refusing a
measurement over a licensing question that is the reader's to resolve.

## 4. `exercises` in detail

### 4.1 Fields

| Field | Required | Contract |
| --- | --- | --- |
| `id` | yes | §1. Unique across the file |
| `reference` | yes | §1 |
| `tests` | yes | ≥ 1 |
| `entry` | no | Python identifier. Absent ⇒ the first `def` in `reference` |
| `title`, `source`, `notes` | no | free text; never read by an engine |
| `category`, `difficulty` | no | §2.4 |

### 4.2 What the validator does **not** check, and who does

The validator checks the **shape** of the format. It does not check the **truth** of the content,
because the engines already do and duplicating them would be a second implementation that can
drift:

| Property | Established by | Recorded in the report as |
| --- | --- | --- |
| `reference` parses as Python | `py_bdl_verify.py` → `skip: "unparse"` | `analysisExclusions` |
| the entry function loads | `py_bdl_verify.py` → `skip: "no-entry"` | `analysisExclusions` |
| the reference passes its own tests | `py_bdl_verify.py` → `skip: "ref-fails-own-tests"` | `analysisExclusions` |
| the probe basis is large enough | `py_bdl_verify.py` → `skip: "small-basis"` | `analysisExclusions` |
| a ghost passes every shipped test, diverges at the witness, and is one line different | `py_alibi_verify.py` | `alibiVerification` |

These are two **separate ledgers** and the report never sums them. Merging "the validator rejected
this exercise" with "the analyzer could not reach this exercise" is how a reader ends up believing
a number has a denominator it does not have — the failure mode this whole workstream exists to
remove.

### 4.3 The entry-point rule, and one bug worth reading about

When `entry` is absent, both engines resolve it the same way: the first `def` in the source
(`py_bdl_verify.py:574`, `entry_fn`). The validator mirrors that rule exactly
(`resolveEntryPoint` in `src/lib/externalCorpus/validate.ts`) so that an exercise the validator
accepts is an exercise the engines can load.

The mirror's `m` flag is load-bearing, and its absence was a real bug caught during development:
**878 of the 5,730 internal exercises begin with an `import` line**, so a non-multiline `^` fails
to find their `def` and the validator rejects 15% of a perfectly legitimate corpus for a reason
that has nothing to do with the methodology. Two checks now guard the mirror against exactly this
class of error: `tests/external-corpus.test.ts` runs the *actual Python regular expression* over
all 5,730 internal solutions and compares, and step F8d of
`scripts/verify-external-format.ts` does the same over a sample. A future edit to either side is
caught rather than believed.

## 5. `candidateAlibis` — optional, and the most important asymmetry in this document

A candidate silent failure is `{id, exerciseId, ghost, witness}` plus optional `func`,
`minedBy`, `notes`. It deliberately carries **no `reference` and no `tests`**: the runner composes
the verifier's record from the referenced exercise, so a candidate can never carry a stale copy of
the program it claims to differ from.

### 5.1 Absence is a finding

A corpus with no `candidateAlibis` key produces `advisory/no-candidate-alibis`, and the run says
out loud that nothing was verified about Alibi Distance and nothing may be concluded from it. The
reason is not squeamishness:

> **DeepForge's alibi mutation-mining engine is not in this repository.** The funnel
> (2,636 problems → 89,622 mutants → 19,030 passers → 4,060 union-clean → 268 with witness → 217
> held-out-clean → 211 validated → 96 shipped) is a hard-coded constant in
> `scripts/verify-alibis.ts:46-58`, and the published aperture rate of 46.08% has no committed
> engine and no committed artifact.

What *is* committed, and what therefore externalizes cleanly, is the **verifier**:
`scripts/py_alibi_verify.py` independently re-checks any candidate — reference and ghost both
pass every shipped test, they diverge at the witness under the same 1e-6 deep equality, the text
diff is exactly one changed line, and the union and held-out probe suites built from the visible
tests alone find zero divergences. So an external lab can have its own miner's output *verified*
here. It cannot have an alibi *rate* reproduced here, and this document does not pretend
otherwise.

## 6. Validation rules and disclosures

`bun run scripts/verify-corpus.ts --list-rules` prints the full table with remedies. The
validator's design rules, which matter more than the individual codes:

1. **Nothing is silent.** Every rejected exercise appears in `filterAccounting.rejections` with its
   id, its 1-based array index, a rule code, a one-sentence message naming the offending value, a
   JSON path (`/exercises/5/tests/0/expected`), and a remedy. The identity
   `exercisesTotal === exercisesAccepted + exercisesRejected` is asserted before the report is
   returned, and a violation throws rather than being noted. One exercise breaking three rules is
   **one** rejected exercise and **three** violations; both counts are reported.
2. **Nothing is repaired.** No field is coerced, defaulted, renamed, or dropped. An exercise with a
   misspelled `tests` is rejected, not silently treated as a zero-test exercise.
3. **Disclosures are not filters.** Conditions that weaken a measurement without making it
   impossible are advisories: `advisory/tests-below-three`, `advisory/duplicate-test-input`,
   `advisory/test-input-repr-over-engine-cap`, `advisory/license-unasserted`,
   `advisory/independence-unknown`, `advisory/provenance-method-unknown`,
   `advisory/no-candidate-alibis`, `advisory/ignored-extension`. They never remove an exercise.
4. **Semantic truth belongs to the engines** (§4.2).

### 6.1 Rule counts

54 rules: 20 file-level (fatal for the whole file), 21 exercise-level, 13 candidate-level. The
file-level set includes the one rule that depends on content rather than shape,
`provenance/collides-with-deepforge-corpus` (§7).

## 7. Provenance separation, enforced four ways

The DeepForge corpus and a third party's corpus are the same *kind* of object: both are arrays of
`{id, category, difficulty, solution, testCases}` in a JSON file, both go to the same analyzer, and
both produce the same *shaped* numbers. Nothing in a naive wire format distinguishes them. Four
independent mechanisms make the confusion hard rather than easy:

1. **The format cannot claim to be internal.** `origin` accepts only `external` and
   `synthetic-example`. There is no value meaning "the DeepForge corpus", so no file can be
   *labelled* internal (`corpus/origin`).
2. **The internal corpus is positively identified.** The validator loads the real
   `src/data/problems` bank and reports whether the corpus under test *is* it or shares
   byte-identical references with it. A corpus whose content digest equals the published internal
   digest `3ff60b9e3aa8b5ab8a1cb2e6dfcdffcc6d31774b7f770c3b787a8fdc8a498e31` is refused outright.
   Gate check F6b runs this against all 5,730 exercises and confirms the mechanism is the *only*
   thing that catches it: every one of them is individually valid under `df-corpus/1`.
3. **Overlap is a disclosure, never a filter.** An overlapping corpus is still measured and marked
   not independent, which forces the comparison to `NOT_COMPARABLE`. Silently dropping it would be
   a hidden filter — the exact failure mode the audit identified.
4. **The label travels.** Every report, log line, and output file name carries
   `EXTERNAL CORPUS <id>@<version>` or
   `SYNTHETIC EXAMPLE (not a scientific corpus) <id>@<version>`, and a synthetic report also carries
   `notAScientificResult: true` and a file name starting `NOT-A-RESULT__`. There is no code path
   that emits a measurement without one of those two.

**What the overlap check cannot establish,** and says so in every report
(`overlapWithInternalCorpus.doesNotEstablish`): byte-level overlap is not plagiarism detection. A
corpus that paraphrases, re-implements, or machine-rewrites DeepForge's exercises shares no bytes
with them and reads as clean. The independence claim therefore rests on the corpus's own
declaration plus its maintainer's honesty, and the report marks the difference.

## 8. The shipped example corpus

[`external-corpus/example-synthetic-corpus.json`](external-corpus/example-synthetic-corpus.json) —
**a synthetic format fixture, not a scientific corpus.** Six hand-written exercises, no external
data, sampled from no population, and labelled `origin: "synthetic-example"` with the phrase
`NOT A SCIENTIFIC CORPUS` in its own text. It exists so a researcher can see the validator accept,
reject, and account without running anything:

```bash
bun run scripts/verify-corpus.ts \
  --corpus docs/research/external-corpus/example-synthetic-corpus.json
```

Expected outcome, and what `scripts/verify-external-format.ts` asserts on every CI run:

- 6 exercises submitted = **5 accepted + 1 rejected**
- the rejected one is `ex-invalid-005` at index 5, with exactly two rule codes:
  `exercise/unknown-field` (the misspelled `testcase` / `testcases` keys) and
  `exercise/test-expected-missing` (a test with no `expected` key)
- exit code **1**; the accounting balances
- one disclosure: `advisory/tests-below-three` on `syn-005`, the one-test exercise that is
  **accepted** because fewer tests is weaker, not invalid
- 1 candidate alibi, accepted

The deliberately invalid exercise is genuinely invalid, not merely marked: it really does carry a
test with no `expected` key and two misspelled test-list fields. A validator that ignored the typo
would accept a zero-test exercise and quietly change the denominator of every rate computed from
that corpus.

Removing that one exercise makes the file validate cleanly, and the runner then executes the whole
pipeline on the remaining five — census, alibi verification (1/1 candidate verified over 242
union + 87 held-out probes), and a report. The numbers it produces are printed with a
`NOT A SCIENTIFIC RESULT` banner and exist only to demonstrate that the pipeline runs.

## 9. What this format deliberately does not do

- It does not let you ship a corpus in another language. `language` is `python` because the
  engines exec CPython.
- It does not verify that your exercises are pedagogically sound, correctly posed, or free of
  leaked answers. It verifies that the methodology can honestly process them.
- It does not make a corpus comparable. Comparability is a property of a *pre-registered*
  comparison against a chosen corpus, defined in
  [`external-run-report.md`](external-run-report.md) §5, and no format field can substitute for it.
- It does not enable an alibi-rate comparison, because there is no committed alibi census to
  compare against (§5.1).
