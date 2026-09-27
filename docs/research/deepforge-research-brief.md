# DeepForge — research brief

## 1. Problem

Auto-graded exercises ship a reference solution and a few tests. A program can pass every shipped test and still be wrong. The environment reports "correct" from that boolean, and nothing records what those tests could not distinguish.

## 2. Research question

When an environment reports that a learner's program is correct, or that guidance is supported, what is the evidence behind it, how far does it reach, and can it be recomputed or challenged afterwards?

## 3. What DeepForge provides

A corpus of 5,730 execution-verified Python exercises carrying 23,518 shipped test cases. It also carries 1,785 repository unit tests, a separate quantity. The method per thread: mine by real execution against a deterministic probe basis from those tests, then report the rate with its boundary. Each flagship ships an instrument plus a CI gate (section 7).

## 4. Three flagship studies

**Alibi Distance.** The alibi distance α(p) of a problem is the fewest single-edit mutations of the reference that pass every shipped test while diverging from it on a probe bank. 46.08% of the 5,721 analyzable problems admit a radius-1 alibi. An oracle-chosen witness kills 73.2% of mined alibis; a cross-validated one kills 48.4%, so the deployable estimate is about 23.5% of problems still affected, not the in-sample 18.6%. Two planned follow-ups failed and are reported as failures. Mutation survival of CS autograding suites is established prior work (Clegg 2019/2020, Perretta 2022, Delgado-Pérez 2021, Hall & Baniassad 2022, Mansur 2024, arXiv:2411.09261, Li et al. ASE 2026). I claim no priority.

**Behavioral Delta Ledger.** The behavioural delta between two consecutive versions of a learner's own program, on a hidden basis built from odd-index shipped tests and scored on the even-index remainder, reported count-only and kept outside assessment. Held-out sign concordance is 84.0% and 82.2%. Four of nine pre-registered predictions failed or reversed. The durable contribution is the definition and its falsified pre-registrations, not the rates.

**Refutation-Ledger Values.** Recorded falsification attempts produce a recomputable warrant state, a grade that is a total function of it, and exact cite-graph demotion. No individual mechanism is new.

## 5. What has actually been measured

Two tiers, and the distinction matters.

**Records of runs whose engines are absent.** The 106,081-mutant Alibi census and the full BDL census (5,682 analyzable exercises, 88,357 mutants, 699 edit walks) came from mining programs that are not committed and cannot be re-derived by an outside reader. A second, separately written CPython engine agreed to 0.14 percentage points on census rates, 0.32 on length quartiles, 0.44 on closure estimates — but both engines are mine, so that is a provenance record, not a check.

**Recomputed from a checkout every gate run.** The 96-puzzle alibi bank (zero divergence over 189,658 union and 24,560 held-out probes under real CPython) and a deterministic 240-problem stratified BDL sample checked against tolerance bands, one headline row at ±10.07pp, where the sample read 42.33% against a 45.23% headline. Passing is not agreement.

## 6. What remains unproven

Nothing here is peer reviewed, submitted anywhere, or replicated outside this repository. No human-participant data exists: every learner-behaviour number comes from simulated edit policies or synthetic cohorts, and none measures understanding. No experiment here measures a generative-AI tutor — that is the setting, not a result. Probe banks derive from the shipped tests and inherit their blind spots, so divergence on a probe is not proof of semantic inequivalence. The corpus was authored by the group that wrote the measurement code, with no independence control. The Refutation-Ledger arena is circular exactly where it looks strongest: in the correlated regime the shipped relation and the analysis-only oracle read the same declared table, so its +1.000 gaps follow from the construction, and its 200 seeds are a determinism check, not a sample. One supporting artifact has four of twelve reported bars that no gate reads and that do not reconcile with its evidence script.

## 7. Reproducibility

```bash
bun install --frozen-lockfile && bun run verify:all
```

This re-derives each instrument's pinned aggregates at this commit and fails the build on drift — a drift alarm, not an independent reproduction. It does not recompute either census, the closure estimates, the cross-validated numbers, the negative results, or the audits. CPython minor version is unpinned and affects the BDL digests.

## 8. Potential external research questions

Whether these rates transfer to a corpus authored by someone else. Whether mined near-miss programs resemble the slips learners actually make. Whether a recomputable warrant state is useful to a learner or merely auditable. Whether per-edit behavioural change helps or becomes surveillance.

**What I am looking for from a research collaborator: critical feedback / independent replication / external corpus evaluation.**
