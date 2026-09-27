# Research claims audit — DeepForge

**Status:** audit only. No file under `src/data/inventions/` was edited and no paper prose was
rewritten. This document records what was run, what each number is actually backed by, where wording
exceeds the evidence, and the exact wording changes proposed for the other agent to apply.

**Auditor scope:** `docs/research/`, the `/inventions` surface (`src/app/inventions/**`,
`src/data/inventions/**`), the five assigned artifact papers, the admissions/portfolio documents that
quote them, and the verifier scripts behind each number. A sixth paper in the registry
(`ladder-graded-spacing.ts`, wave 40) is out of the assigned five but is on the same surface; it is
covered briefly in §7 because it carries the same risk class.

---

## 1. Methodology note — what was run, and what "verified" means here

The distinction this audit turns on is **recompute** vs **replay**.

| Verdict used in this audit | Meaning |
| --- | --- |
| **VERIFIED (recomputed)** | A committed script or gate re-derives the number from raw inputs in this checkout, and the recomputed value equals the published value. |
| **VERIFIED (arithmetic)** | No script produces it, but every component number is verified and the arithmetic checks out. This is weaker than it looks: internally consistent derived values inherit the uncertainty of their inputs. |
| **REPLAYED** | The number exists only as a literal constant in a script or paper. The gate compares against the constant, so it proves *determinism of the pipeline*, not *correctness of the measurement*. A replayed gate is a regression anchor. |
| **NEEDS VERIFICATION** | No committed code or data produces it, but it is plausible, internally consistent, and not contradicted by anything in the repository. |
| **UNSUPPORTED** | No code or data produces it, **or** it is contradicted by the paper's own tables or by a committed gate's output. |

### Commands executed in this audit (all from a clean checkout, no network)

| Command | Result |
| --- | --- |
| `bun run scripts/verify-reprogpu.ts` | `REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":839}` |
| `bun run scripts/reprogpu-evidence.ts` | All five reference hashes, both WGSL blocks, and the 3 Philox KATs regenerated; `docs/research/reprogpu/expected-hashes.json` **unchanged** by `git status` |
| `bun run scripts/verify-warrant.ts` | `WARRANT_GATE {"passed":8,"failed":0,"digest":"ca0cda0f562b8c10"}` |
| `bun run scripts/warrant-evidence.ts` | 200-seed arena regenerated; all T3/T4/T5 cells and the P/F status table reproduced exactly |
| `bun run scripts/verify-keyfuse.ts` | `KEYFUSE_GATE {"passed":12,"failed":0,"cells":72,"runtimeMs":154}` |
| `bun run scripts/keyfuse-evidence.ts` | 408 / 651 / 1,533 ground-truth aggregates, T2's per-strategy row, the 521-detection total, the 348-necessity total and the residual-by-family breakdown all reproduced |
| `bun run scripts/verify-alibis.ts` | `PASS 96/96 verified — all union+held-out clean, gate failures 0`; 189,658 union + 24,560 held-out probes; 412 shipped tests; 152,696 B raw / 27,510 B gzip −9; crash 32 / value 64 / timeout 0; Easy 24 / Medium 49 / Hard 23; all 15 categories at 3–10 each |
| `bun run scripts/verify-bdl.ts` | `PASS — 12/12 checks, 12/12 harness fixtures, sample 236/240 analyzable, runtime 141.63s`; **census not provided → self-contained mode** |
| `bun run scripts/verify-problems.ts` | `Structural errors: 0  Runtime failures: 0  Passed: 5730/5730` |
| `bun test` | `1785 pass, 0 fail, 87 files` |
| `bun run scripts/lgs-sim.ts` (out of scope, §7) | All reported LGS point estimates and both 30-seed intervals reproduced |

Corpus facts computed directly from `src/data/problems`: **5,730 problems, 5,730 unique ids, 15
categories, 23,518 shipped test cases** (histogram: 3 tests → 1,089; 4 → 3,007; 5 → 1,581; 6 → 53).

### What could **not** be verified, and why

1. **The entire Alibi Distance census (106,081 mutants, 17,502 survivors, 7,727 alibis, 46.08%, and
   every closure / cross-validation / negative-result / audit number).** The paper states at
   `alibi-distance.ts:708` that the mining run lives in scratch directories outside the repository.
   Those directories **do not exist on this machine**:
   `/var/folders/.../T/opencode/w41/`, `w41-verify-empirical/`, `w41-verify-theory/`, `w41-remine2/`
   are all absent. No mining engine — author or independent — is committed anywhere in the repo
   (`rg` over `scripts/`, `src/`, `tests/` finds `probe_bank`/`mutant`/`ast.unparse` only in the
   puzzle-bank checker, the BDL gate, and the product harness). The mining programs are therefore
   **not reproducible, not inspectable, and not falsifiable** from the artifact. This is the single
   largest gap in the portfolio.
2. **The entire BDL full-corpus census at exact counts** (88,357 / 9,041 / 14,534 / 6,574 / 2,523).
   `census_clean.jsonl` is not committed. `scripts/py_bdl_verify.py:88` hard-codes the paper's counts
   in `CENSUS_COUNTS`; those constants are checked *exactly* only in `--census` mode, and **CI does
   not pass `--census`**. The committed CI mode is a 3σ statistical check on a 240-problem stratified
   sample (4.2% of 5,682), with the tolerance printed per row. Two of those tolerances are enormous:
   `hidden_visible` ±10.07pp and `problems_visible_slip` ±9.92pp.
3. **The TS-vs-Python independence question for Alibi Distance.** The task brief posits a
   "TypeScript and Python implementation" comparison. **That framing is wrong and no such pair
   exists.** `alibi-distance.ts:677` says "Two independently written **CPython** engines"; the
   TypeScript side (`scripts/verify-alibis.ts`) gates only the 96 shipped puzzles, and
   `scripts/py_alibi_verify.py` is that same bank's Python checker, not a census engine. So the
   "independent reimplementation agrees" claim is **not circular through a shared artifact** — it is
   worse in a different way: it is **unfalsifiable**, because neither engine is in the repository. I
   cannot determine whether the two engines re-derive from raw data or share precomputed results,
   and neither can any reader of the repository.
4. **The "independent" audits.** `alibi-distance.ts:610` describes the blind audit as run by "the
   verifier's script" with seed 8675309. The audits were performed and judged by the paper's own
   author. Only the *sampling* was independent (the author's ten problem ids were excluded). The
   word "independent" in the paper refers to the sample, not to the judge, and the paper does not say
   so where a reader would take it that way.
5. **All WGSL specification claims in REPROGPU** (§15.7.2 / §15.7.4.1 / §15.7.5 / §6.2.3 / §8.10 /
   §14.4.4 / §17.2.1, including the specific "x/y is 2.5 ULP" reading). No network access; the cited
   spec is a dated CRD (2026-09-15) that the paper itself says must be re-checked if it changes.
6. **All 22 external URLs in REPROGPU's T1 and the 26 references across the papers.** The paper's
   honesty rule requires re-checking any URL that has changed; that check was not performed here.
7. **The 7 novel probe families' attack on the shipped bank** (6/96 at N=1 … 35/96 at N=100) and the
   legacy-pool overfit finding (74–78% of the first 96 solvable within five lazy probes). No code or
   log for either is committed.
8. **`docs/admissions/` is untracked.** `git status` shows `?? docs/admissions/`,
   `?? scripts/build-admissions-documents.py`, `?? scripts/build-research-portfolio.py`, `?? output/`.
   The documents most likely to be submitted are not in version control, so the audit trail for
   their wording is currently only this document.

---

## 2. Master claim table

Status counts: **VERIFIED 61 · NEEDS VERIFICATION 44 · UNSUPPORTED 12** (117 rows). Of the 61
VERIFIED rows, 12 are "arithmetic" only; the remaining 49 are genuinely recomputed in this checkout.

### 2.1 Alibi Distance — `src/data/inventions/alibi-distance.ts`

| # | Claim (verbatim) | Source | Status | Evidence |
| --- | --- | --- | --- | --- |
| A1 | "5,730 Python exercises, each with a reference solution that provably passes its shipped tests under real execution" | `:292` | **VERIFIED** | `verify-problems.ts` → `Passed: 5730/5730`, 0 structural, 0 runtime failures |
| A2 | "5,721 of the 5,730 problems: five have fewer than five reference-evaluable probes and four raised during mining (ds-038, ds-235, ds-236, ds-237)" | `:434` | NEEDS VERIFICATION | 5 + 4 = 9 and 5,730 − 9 = 5,721 are self-consistent; no engine committed to confirm the named ids |
| A3 | "106,081 sampled mutants" | `:59`, `:133`, `:275`, `:309`, `:407`, `:434` | NEEDS VERIFICATION | No committed engine. Family table sums to exactly 106,081 (arithmetic ✓) |
| A4 | "17,502 pass all shipped tests, a 16.50% survival rate" | `:59`, `:134`, `:275`, `:309`, `:434` | NEEDS VERIFICATION | Family table sums to 17,502; 17,502/106,081 = 16.500% (arithmetic ✓) |
| A5 | "7,727 of those survivors diverge somewhere in the probe bank … 7.28% of all sampled mutants and 44.15% of survivors" | `:135`, `:434` | NEEDS VERIFICATION | 7,727/106,081 = 7.284%; 7,727/17,502 = 44.149% (arithmetic ✓) |
| A6 | "46.08% of analyzable problems admit a radius-1 alibi" (2,636 / 5,721) | `:136`, `:275`, `:309`, `:438` | NEEDS VERIFICATION | 2,636/5,721 = 46.076%. No engine; no gate; no committed artifact. **"analyzable" is load-bearing and is defined only as "not skipped by the engine"** (5 with <5 evaluable probes, 4 that raised) — a self-defined, non-reproducible denominator |
| A7 | "an independent engine over the same corpus reproduces **every census rate within 0.2 percentage points**" | `:275` | **UNSUPPORTED** | Contradicted by the paper's own `REPLICATION_TABLE` `:144`: length quartiles 56.66 vs 56.34 = **0.32pp**, which the same table's caption `:129` demotes to "within 0.7". "Every census rate" is false on the paper's own page. Also unverifiable: no independent engine is committed |
| A8 | "a from-scratch engine reports 105,425 mutants, 16.57% pass, 45.94% affected, 73.25% best-probe kill" | `:310`, `:133–145` | **UNSUPPORTED** | No independent engine exists in the repository. 105,425 / 17,471 / 7,704 / 2,630 of 5,725 cannot be re-derived by any committed code. Internally consistent (17,471/105,425 = 16.57%; 2,630/5,725 = 45.94%) but that is consistency of transcription, not of measurement |
| A9 | "census rates agree within 0.2 percentage points and the closure estimates within 0.7" | `:129`, `:310`, `:438` | NEEDS VERIFICATION | Arithmetically self-consistent (max census gap 0.14pp on the four census rows; max closure gap 0.44pp on 48.35 vs 48.79). **No gate computes either figure**; the precision is asserted, not measured |
| A10 | "the independent engine analyzed four problems the author run skipped" | `:129` | NEEDS VERIFICATION | Consistent with 5,725 vs 5,721; not checkable |
| A11 | Family survival table: cmp 35.26% … notdel 1.90%, total 16.50% | `:48–59` | NEEDS VERIFICATION | All 11 per-family rates recompute correctly from the generated/pass columns and the columns sum to 106,081 / 17,502 (arithmetic ✓). **No gate produces the family census** |
| A12 | Slice table: Easy 35.77% / Medium 49.39% / Hard 57.48%; length quartiles 20.24 / 41.45 / 56.66 / 69.95% | `:70–76`, `:453` | NEEDS VERIFICATION | Slice n's partition the analyzable set exactly (2,055+2,549+1,117 = 5,721; 1,502+1,503+1,435+1,281 = 5,721). Not recomputable |
| A13 | "Test count, read marginally, is associated with aperture (35.35% at three tests, 43.63% at four, 57.62% at five)" | `:453`, `:77–79` | NEEDS VERIFICATION | Marginal n's (1,089 / 2,998 / 1,581) are consistent with the corpus histogram (1,089 / 3,007 / 1,581) after the 9 non-analyzable 4-test problems are removed. Not recomputable |
| A14 | "per-mutant survival is actually higher at five tests (15.76%) than at three (12.06%)" | `:453`, `:80–82` | NEEDS VERIFICATION | Not recomputable; the confound is stated, which is good |
| A15 | Length deciles: 8.4 / 15.0 / 42.3 / 39.7 / 46.0 / 53.5 / 53.2 / 60.5 / 65.9 / 76.3% with mean mutants 5.4 … 81.5 | `:93–102`, `:514` | NEEDS VERIFICATION | Not recomputable. The non-monotone step and the mutant-count co-movement are disclosed |
| A16 | Closure: "kills 73.22% of all alibis corpus-wide: 5,658 of 7,727"; "fully closes 59.71% of affected problems (1,574 of 2,636)" | `:113–114`, `:531` | NEEDS VERIFICATION | 5,658/7,727 = 73.22%; 1,574/2,636 = 59.71% (arithmetic ✓) |
| A17 | "the affected share falls from 46.08% to 18.56% while aggregate mutant survival falls from 16.50% to 11.17%, a relative reduction of 32.3%" | `:531` | NEEDS VERIFICATION | (16.50 − 11.17)/16.50 = 32.30% (arithmetic ✓) |
| A18 | Cross-validation: "Of 1,786 problems with at least two alibis, 1,332 enter the cross-validated cohort; the other 454" | `:535` | NEEDS VERIFICATION | 1,332 + 454 = 1,786 (arithmetic ✓) |
| A19 | "held-out kill 48.35%, against 71.96% for the oracle choice and 10.80% for a random probe" | `:117–118`, `:535` | NEEDS VERIFICATION | "roughly two-thirds of its in-sample effect" (`:535`): 48.35/71.96 = 0.672 ✓ |
| A20 | "the deployable, oracle-free estimate is therefore ~23.5% of problems still affected" (23.80% author / 23.53% independent) | `:119`, `:275`, `:541` | NEEDS VERIFICATION (arithmetic) | 0.4608 × (1 − 0.4835) = 0.23801 → 23.80% ✓; 0.4594 × (1 − 0.4879) = 0.23526 → 23.53% ✓. Inputs unverified |
| A21 | "Full greedy 1-closure costs a median of one probe per affected problem, a mean of 1.594, a p90 of 3, and a maximum of 7" | `:120`, `:547` | NEEDS VERIFICATION | Not recomputable |
| A22 | "one probe fully closes 59.71% … two close 86.57%, and three close 95.98%; four, five, six, and seven reach 98.79%, 99.62%, 99.96%, and 100%" | `:121`, `:547` | NEEDS VERIFICATION | Internally consistent with a max of 7 probes (`:547`) and 100% at 7 |
| A23 | "the mean per-problem kill rate, 82.94%, is above it" (P4 split verdict) | `:551` | NEEDS VERIFICATION | The paper reports the split honestly. 73.22 aggregate < 75 threshold; 82.94 mean > 75 |
| A24 | Radius-2 leakage: "12.52% … reduced it to 8.56%, a 31.6% relative reduction, where a random probe reduced it only to 11.75%, a 6.1% reduction"; "13.78% to 9.42%"; independent "11.91% to 8.42% (-29.3%) against … 11.31% (-5.0%)" | `:555` | NEEDS VERIFICATION | All four relative reductions recompute exactly (arithmetic ✓) |
| A25 | "roughly 4.5-5 million Python function calls, about 27 CPU-minutes, and about 4 minutes wall-clock on 8 CPython workers" | `:407`, `:722` | NEEDS VERIFICATION | No measurement artifact. Machine-dependent and machine-absent |
| A26 | "Across the corpus the mean bank holds 39.05 probes, of which 89.22% are reference-evaluable" | `:385`, `:682`, `:722` | NEEDS VERIFICATION | Not recomputable |
| A27 | "A 300-problem robustness rerun with the cap raised to 120 moved the aperture from 45.3% to 46.7% (4 problems gained, 0 lost), so the 48-probe cap is not what produces the headline rate" | `:385` | NEEDS VERIFICATION | Good sensitivity check; no artifact. Note 45.3% is a 300-problem subsample rate and is not comparable to the 46.08% headline |
| A28 | Witness statistics: "mean 11.03% … median 7.69% … p90 24.00%"; "mean of 2.93 alibis, with a maximum of 19"; "22.78% of alibis (1,760 of 7,727)" | `:138`, `:496` | NEEDS VERIFICATION | 1,760/7,727 = 22.777% ✓ (arithmetic) |
| A29 | Category spread: Statistics 60.24% … Deep Learning 25.93% | `:219–233`, `:492` | NEEDS VERIFICATION | "roughly twice the aperture": 60.24/25.93 = 2.32× (arithmetic ✓) |
| A30 | "la-029 idx-@5; D grows by 17 probes" (withdrawn monotonicity counterexample) | `:147`, `:419` | NEEDS VERIFICATION | Not recomputable. A withdrawn claim, so low risk |
| A31 | Re-mine funnel: "89,622 single-edit mutants over 2,636 affected problems → 19,030 shipped-test passers → 4,060 clean under the full union lazy suite → 268 with a hidden witness → 217 also clean under the independently constructed held-out suite; legacy pool 9 → 8 valid; combined 253 re-validated → 211 valid → 96 shipped" | `:161`, `:647`, `:698` | **REPLAYED** | `scripts/verify-alibis.ts:46–58` holds these eight integers in `FUNNEL` and only `console.log`s them. Nothing re-derives them. **This gate proves the funnel constants are typed correctly, not that the funnel happened.** The same numbers are repeated in a provenance comment at `src/data/alibis/puzzles.ts:1–40` |
| A32 | "96/96 resistant: zero divergence over 189,658 union probes and 24,560 held-out probes" | `:165`, `:652`, `:698` | **VERIFIED** | Gate run: `probes checked 189658 union + 24560 held-out (all passing)`, `unionFailures: 0`, `heldOutFailures: 0`, `PASS 96/96` |
| A33 | "96/96: reference passes tests, ghost passes tests, ghost diverges at witness, zero divergent union and held-out probes" | `:174` | **VERIFIED** | `ALIBI_GATE_SUMMARY {"verified":96,"failed":0,"unionFailures":0,"heldOutFailures":0,"metadataMismatches":0}` |
| A34 | "Divergence class at stored witness: 32 crash, 64 value, 0 timeout" | `:167`, `:663` | **VERIFIED** | Gate: `divergence types crash 32 / value 64 / timeout 0` |
| A35 | "Difficulty: Easy 24 / Medium 49 / Hard 23" | `:168` | **VERIFIED** | Gate: `difficulty Easy 24 / Medium 49 / Hard 23` |
| A36 | "Categories: all 15, 3-10 each" | `:169` | **VERIFIED** | Gate printed all 15 categories, min 3 (Calculus, Optimization), max 10 |
| A37 | "Shipped tests: 412 (reference and ghost pass all of them)" | `:170` | **VERIFIED** | Gate: `shipped tests 412 (all passing for reference and ghost)` |
| A38 | "Text diff vs reference: exactly 1 changed line in all 96" | `:171` | **VERIFIED** | `py_alibi_verify.py` criterion 4 checks one removed + one added line per puzzle |
| A39 | "Serialized size: 152,696 B raw / 27,510 B gzip -9" | `:177` | **VERIFIED** | Gate: `serialized bank 152696 B raw / 27510 B gzip -9` |
| A40 | "Resistant … 96/96 resistant" gate result | `:663` | **VERIFIED** | Reproduced in this audit |
| A41 | "the verifier's own S2/S3 sequences catch nothing at N = 1, 5, 10, or 25; alternate unseen shuffles caught 1 of 768 S2 sequences … 0 of 768 S3 and S3-leaf" | `:652` | NEEDS VERIFICATION | No code or log committed for the S2/S3 sweeps |
| A42 | "an independent verifier's seven novel probe families … caught 6 of the 96 puzzles at N = 1, 11 at N = 5, 22 at N = 25, and 35 at N = 100" | `:652` | NEEDS VERIFICATION | No code or log committed. **This is the same author**; "independent" here means a separately written attack script, not an independent person |
| A43 | "The first curated set … a resistance check … showed that 74-78% of its 96 puzzles were solvable within five lazy probes" and the 128-probe bank failure (84/96 caught, 47–64/96 by alternate shuffles, 3/96 cleared) | `:647` | NEEDS VERIFICATION | No artifact committed. Reported as a self-criticism, so low risk, but the retraction record `w41-remine/selected-resistant.json` is also absent |
| A44 | "The re-mine was exhaustive over the engine's radius-1 targets" | `:647`, `:698` | NEEDS VERIFICATION | "Exhaustive" is over *the engine's* target list, which is itself a sample (≤36 mutants/problem). The wording is carefully scoped but sits next to unreplayable numbers |
| A45 | "An earlier draft claimed monotonicity across test sets; that claim is false and is withdrawn." | `:411`, `:419` | **VERIFIED (in the paper's favour)** | A withdrawn claim with a reproduced counterexample. Good practice |
| A46 | Author audit: "eight plainly wrong, one immaterial, and one subtle" (n = 10, not blind) | `:314`, `:606` | NEEDS VERIFICATION | 8 + 1 + 1 = 10 ✓. No audit record committed |
| A47 | Blind audit: "All ten were judged clearly wrong, zero spec-valid", seed 8675309 | `:275`, `:314`, `:610`, `:624` | NEEDS VERIFICATION | Sample selection is stated and is genuinely independent of the author's ten ids. **The judge is the author** and the paper does not say so at the point of use |
| A48 | "Re-running either engine produced byte-identical chunk files" | `:677` | **UNSUPPORTED** | Neither engine is in the repository and the scratch trees are gone. This is a determinism claim about code a reader cannot obtain |
| A49 | "The census is reproducible from a checkout without network access, a model, or any new dependency" | `:677` | **UNSUPPORTED** | The census is not reproducible from a checkout. `:708` admits "The raw mining run is not committed". The two sentences are in tension and the first is the one a reviewer will act on |
| A50 | "The permanent gate scripts/verify-alibis.ts plus scripts/py_alibi_verify.py re-checks every claim, including both resistance suites" | `:663` | **UNSUPPORTED** | The gate checks the 96 shipped puzzles and nothing else. It does not touch the census, the funnel, the closure, the cross-validation, the negative results, or the audits. "Every claim" is false |
| A51 | "Five kernels" family-ordering claim: "A mutation family that were noise would not order this way; the ordering is consistent with a slip-relevance reading of the families" | `:442` | NEEDS VERIFICATION | A descriptive ordering read as evidence of construct validity. There is no human fault data, which `:442` itself concedes |
| A52 | "The ordering is a usable authoring signal: a review queue that looks at Statistics first will find roughly twice the aperture of one that starts with Deep Learning" | `:492` | NEEDS VERIFICATION | See W5 below — prescriptive claim from a descriptive census with a stated unseparated confound |
| A53 | "Category spread is wide and, unlike many of the slice results, larger than the replication noise" | `:492` | NEEDS VERIFICATION | The comparison is against an unquantified "replication noise". The largest category gap the paper reports is 0.32pp (length quartiles); the smallest category gap here is 60.24 − 58.89 = 1.35pp, so the claim survives, but the noise band itself is not computed by any gate |

### 2.2 Behavioral Delta Ledger — `src/data/inventions/behavioral-delta-ledger.ts`

| # | Claim (verbatim) | Source | Status | Evidence |
| --- | --- | --- | --- | --- |
| B1 | "5,682 / 5,730 (48 skipped)" | `:25` | **REPLAYED** | `py_bdl_verify.py:88` `CENSUS_COUNTS`. Exact check only in `--census` mode; **CI does not pass it** |
| B2 | "Sampled single-edit mutants: 88,357" | `:26` | **REPLAYED** | Same constant. CI substitutes a 240-problem sample: `sample.mutants 3,670 expected / 3,733 observed, ±448, PASS` |
| B3 | "Invisible on the 48-probe basis: 9,041 (10.23%) [10.03, 10.43]" | `:27` | **REPLAYED** | Sample observed **10.77%** against tolerance **±2.83pp** |
| B4 | "Test-passing mutants: 14,534 (16.45%) [16.21, 16.70]" | `:28` | **REPLAYED** | Sample observed 16.07%, ±3.05pp |
| B5 | "Of those, hidden-visible: 6,574 (45.23%) [44.42, 46.04]" | `:29` | **REPLAYED** | Sample observed **42.33%**, tolerance **±10.07pp** — the sample is 2.9pp away and would still pass with a headline up to ~10pp off |
| B6 | "Problems with a visible silent slip: 2,523 / 5,682 (44.40%) [43.12, 45.70]" | `:30` | **REPLAYED** | Sample observed 45.34%, ±9.92pp |
| B7 | "Problems with a test-passing mutant: 3,600 (63.36%)" | `:31` | **REPLAYED** | Constant only |
| B8 | "Problems with all sampled mutants visible: 2,818 / 5,627 (50.08%)" and "55 of 5,682 problems generated no evaluable mutant at all" | `:32`, `:450` | **REPLAYED** | Constants. The paper's own denominator correction (`:450`) is correct and well explained — but the corrected values are still constants |
| B9 | "Reference flakes (fresh-copy protocol): 0 / 5,682"; "Arg-mutating references: 8 / 5,682 (0.14%)"; "Cosmetic / rename churn not zero: 0 / 5,682; 0 / 4,680 applied" | `:33–35`, `:365` | NEEDS VERIFICATION (partially checked) | The gate does check flakes / cosmetic / rename on its sample: `run.reference_flakes 0/0 exact PASS`, `run.cosmetic_churn_nonzero 0 PASS`, `run.rename_churn_nonzero 0 PASS` — but on 236 analyzable problems, not 5,682. The full-corpus 0/5,682 is a constant. The two spot records `al-345`/`ds-074` do reproduce their committed sha256 digests |
| B10 | Family invisibility table (cmp 24.75% … notdel 1.47%, total 9,041/88,357) | `:46–57` | NEEDS VERIFICATION | Column sums check: 1,916+158+3,884+164+1,402+132+452+121+669+132+11 = 9,041 ✓; generated column sums to 88,357 ✓ (arithmetic ✓) |
| B11 | "The test-passing rate independently replicates wave 41's 16.50% on a fresh artifact" | `:414` | NEEDS VERIFICATION | 16.45% vs 16.50% is 0.05pp, but the two runs use **different mutant sampling budgets and different analyzable denominators** (`:377` and `:396`: BDL ≤24 mutants/problem, ≤4/family, 5,682 problems; wave 41 ≤36/problem, ≤6/family, 5,721 problems, giving 88,357 vs 106,081 mutants). These are not the same estimator, so a 0.05pp gap is not a replication of anything |
| B12 | "699 simulated edit walks"; exact-signature ghost rates "48.37% (1,127/2,330) / 51.16% (1,192/2,330) / 33.98% (950/2,796)" | `:87–90`, `:485` | NEEDS VERIFICATION | 1,127/2,330 = 48.37%; 1,192/2,330 = 51.16%; 950/2,796 = 33.98% ✓. 2,330 + 2,330 + 2,796 = 7,456 steps over 699 walks (10–12 steps) ✓ (arithmetic) |
| B13 | "6.86-10.44% of its 'ghosts' had actually flipped a probe from one wrong state to another" | `:84`, `:485` | NEEDS VERIFICATION | 83/1,210 = 6.86%; 139/1,331 = 10.44% ✓ (arithmetic) |
| B14 | Held-out concordance: "84.00% (AUC 0.829) for climb and 82.23% (AUC 0.797) for random over 18,191 independent steps" | `:102`, `:496` | NEEDS VERIFICATION | Not recomputable. This is the number the paper reports as the honest one |
| B15 | **"In-sample, the sign of the hidden delta matches the sign of the test delta for 90.20% of climb walks (AUC 0.903), but … the held-out concordance drops to 84.00%"** | `:257` (abstract) | **UNSUPPORTED** | 90.20% / AUC 0.903 is the **positive-only** in-sample rate (restricted to steps with test-delta ≠ 0), per `docs/research/invention-wave-42.md:665–667`. The paper's own `CONCORDANCE_TABLE :100` gives full-sign in-sample = **87.78%**, and `:496` states "the positive-only in-sample rates of the first draft are **not used as reported results**". The abstract uses one. The 90.20 → 84.00 "drop" therefore compares two different statistics, inflating the apparent deflation by 2.42pp. The correct drop, which the paper's own figure `:228` computes, is 87.78 → 84.00 = 3.78pp |
| B16 | "Full-sign in-sample concordance 87.78% / 83.40%; lag-free in-sample all steps 89.57% / 88.37%" | `:100–101` | NEEDS VERIFICATION | Three different in-sample metrics coexist in one table with no statement of which one is the estimand. Not recomputable |
| B17 | Sub-basis sensitivity: "the 48-probe basis sees 96.12% (669/696) of the 96-probe universe's test-passing slips, the 24-probe basis 86.93%, and the 16-probe basis 76.72%"; "81.2% / 91.8%" vs the 48-probe universe | `:202`, `:454` | NEEDS VERIFICATION | 669/696 = 96.12% ✓ (arithmetic) |
| B18 | "at the step level the 16- and 24-probe bases preserve the sign … 96.19% and 97.83% … 92.40% and 95.87% … within ±0.10 for 88.4% of steps (median error 0.024)" | `:454` | NEEDS VERIFICATION | Not recomputable. Note the denominator (600-problem stratified sample) differs from B17's and is stated |
| B19 | "sensitivity … p10 0.283, median 0.551, p90 0.838" | `:450` | NEEDS VERIFICATION | Not recomputable |
| B20 | Next-edit: "Next-improvement AUC 0.308 / 0.359"; "Next-regression AUC 0.667 / 0.626" | `:114–115`, `:521` | NEEDS VERIFICATION | Not recomputable |
| B21 | "risk of a next-attempt test regression by 1.14× (95% CI [0.88, 1.47]) … 1.36× ([1.04, 1.79])"; "the random arm's interval excludes 1" | `:116`, `:521` | NEEDS VERIFICATION | Internally consistent. A pre-registered prediction reported as falsified — good practice |
| B22 | "Regression risk, broke vs did not break hidden dims: 15.98% vs 14.00% (n = 676/1,421) … 14.76% vs 10.83% (n = 657/1,440)" | `:117` | NEEDS VERIFICATION | 676/1,421 = 47.57%; 15.98/14.00 = 1.141 ✓; 657/1,440 = 45.63%; 14.76/10.83 = 1.363 ✓ (arithmetic) |
| B23 | Cold sets: walk-long "49.79% / 74.68%", formal "85.84% / 93.56%"; concentration "1.72% / 1.15%" and "1.50% / 0.46%" | `:130–131`, `:551`, `:562` | NEEDS VERIFICATION | Not recomputable |
| B24 | Permutation null: "empty is under-indexed at z = −11.8, zero1 at −3.8, and zero at −3.7, while reverse (+3.1), inc (+2.5), inc2 (+2.5), sort (+1.9), dup (+1.8), and extend (+1.7)"; "300 draws, seed 12345" | `:562`, `:257` | NEEDS VERIFICATION | Not recomputable. Old z-values explicitly withdrawn and named — good practice |
| B25 | Synthetic routing model: "a residual-targeted greedy policy reaches mastery in a mean of 3.9 problems against 100.3 for a fixed category track" | `:566` | NEEDS VERIFICATION | The paper says "The synthetic routing result is a model, not evidence … The model was chosen, not measured … It is not a measurement of human learning and it is not shipped." Correctly scoped |
| B26 | Cost: "median 0.07 ms … p99 0.49 ms, max 2.66 ms (n = 200)"; "median 0.111 ms"; "median 0.271 ms … p95 0.638 ms, max 50.6 ms; ~2.45×"; "basis build … max 3.07 s … > 250 ms on 2/200" | `:142–145`, `:581` | NEEDS VERIFICATION | 0.271/0.111 = 2.44 ≈ 2.45× ✓. Not recomputable |
| B27 | "H8 24-probe latency: CPython p99 0.49 ms; Pyodide median 0.271 ms" (survived a 200 ms p99 kill) | `:76` | NEEDS VERIFICATION | Not recomputable |
| B28 | Permanent gate (12 checks, 12 harness fixtures) | `:670` | **VERIFIED** | `PASS — 12/12 checks, 12/12 harness fixtures, sample 236/240 analyzable`. All 12 fixtures behaved as specified, including the two marker-forgery and the busy-loop wall-timeout cases |
| B29 | "The permanent Python-backed harness gate (wired as verify:bdl once it lands)" | `:657` | **UNSUPPORTED (stale)** | `verify:bdl` is wired in `package.json` and in `.github/workflows/ci.yml` today. A reproducibility instruction that tells a reader the gate does not exist |
| B30 | "Every rate is relative to the frozen perturbation set … Enlarging the basis or the edit model can only find more divergence, so the invisibility rate is a lower bound on any wider-domain notion." | `:404` | NEEDS VERIFICATION | A **monotonicity claim about the measurement** that the paper does not prove and that Alibi Distance explicitly retracted once (`:411`, `:419`). Stated as fact here. The direction is plausible (a wider probe bank can only add divergences) but it is the same class of claim the sibling paper withdrew, so it should be scoped rather than asserted |
| B31 | "The visibility of hidden-basis divergence is wave 41's result, replicated here (44.40% … against Alibi Distance's 46.08% P(alpha=1))" | `:299` | NEEDS VERIFICATION | The two numbers are **not the same statistic**: 44.40% is problems with ≥1 *test-passing* slip visible on the basis (BDL excludes the shipped inputs from the basis and counts only sampled passers), 46.08% is problems with ≥1 radius-1 alibi over a basis that *included* the shipped inputs. A 1.68pp "replication" between non-commensurable definitions is precision theatre |
| B32 | "The paper also states a limit that applies to every learner-facing number below: there is no human data." | `:308`, `:686` | **VERIFIED (in the paper's favour)** | The limitation is stated, prominent, and repeated. Strongest single feature of this paper |
| B33 | "the 24-probe product basis inherits 86.93-91.8% of the visible-slip coverage depending on the universe" | `:692` | NEEDS VERIFICATION | Depends on B17; the paper is explicit that the product basis is not measured at corpus scale (`:696`) |

### 2.3 KeyFuse — `src/data/inventions/keyfuse.ts`

| # | Claim (verbatim) | Source | Status | Evidence |
| --- | --- | --- | --- | --- |
| K1 | "408 binary assignments, 651 full product assignments, 1,533 enumerated same-key collision pairs" | `:519`, `:550`, `:757` | **VERIFIED** | `keyfuse-evidence.ts` output: `binaryProductSize` sum 408, `productSize` sum 651, `collisionPairCount` sum 1,533 over 24 tasks |
| K2 | "the exact default arm matched ground truth in 69 of 72 task-by-strength cells with 3 explicit nondeterminism refusals" | `:519`, `:783` | **VERIFIED** | Gate criterion 2: `cells=72 compared=69 equal=69 refusalCells=3` (nondeterministic-counter@t1/t2/t3) |
| K3 | "the conservative fallback's attributed detections were a subset of the exact detections with all 53 absences classified" | `:519` | **VERIFIED** | Gate criterion 3: `subset violations=0; exact detections absent from ca-ddmin=53` → 33 / 12 / 5 / 3 as reported |
| K4 | "83 minimized witnesses were produced, 81 verified 1-minimal with 2 flagged and reported" | `:519` | **VERIFIED** | Gate criterion 6: `minimized witnesses=83 oneMinimal=81 oneMinimalFalse=2 verifyRunsMismatches=0`, both flags printed |
| K5 | "repair separated all 101 recorded collision witnesses in the gate's separating check with 0 unseparated" | `:519` | **VERIFIED** | Gate criterion 7: `collision witnesses=101 … unseparated=0` |
| K6 | "1 documented minimal pair, 12 Hamming-1 pairs, 55 exhaustive residual pairs" | `:519`, `:783` | **VERIFIED** | Gate criterion 8: `residualCollisionPairs=55 minimalResidualPairs=12` |
| K7 | T2 at strength 2: baseline-toggle 311/112/17/0/1,317/2; single-trace 119/23/8/1/1,533/2; ca 462/127/4/13/1,106/2; ca-ddmin 537/127/18/0/1,231/8; cover-with-defaults 866/288/3/0/**147**/2 | `:174–188` | **VERIFIED** | Every one of the 30 cells reproduced by aggregating `strategyMatrix[strategy]["2"]` |
| K8 | "The exact default separates 1,386 of 1,533 pairs (90.4%)" | `:174` | **VERIFIED** | 1,533 − 147 = 1,386; 1,386/1,533 = 90.41% |
| K9 | "521 detections across 360 audits (baseline-toggle 99, ca 203, cover-with-defaults 136, and 83 minimized witnesses from the ca-ddmin arm), 348 single-slot necessity verifications across the non-minimized arms" | `:196` | **VERIFIED** | 99 + 203 + 136 + 83 = 521 ✓; witnessesVerified baseline-toggle 99 + single-trace 0 + ca 113 + exact 136 = 348 ✓ |
| K10 | Residual concentration "anchor 55, planted-3way 48, negative 28, masking 12, combo-env 4" | `:862` | **VERIFIED** | Family rollup of `collisionsRemaining` at t=2 for `cover-with-defaults` sums to exactly 147 with those five families |
| K11 | F2 run-count scaling (log10) and task counts "n=3: 7 tasks; n=4: 11; n=5: 3; n=6: 1"; exhaustive `2^n` = 0.903/1.204/1.505/1.806 | `:340–390` | **VERIFIED** | Reproduced exactly: ca-ddmin 1.334/1.379/1.482/1.301; exact 1.398/1.510/1.919/1.851; task counts 7/11/3/1; log10(8/16/32/64) ✓. Note the series labelled "ca(2)+ddmin" is the `ca-ddmin` strategy |
| K12 | F3 slot partition (declared / detected-and-relevant / missed / false implicates) | `:391–508` | **VERIFIED (spot-checked)** | combo-env declared 2+1+1 = 4 ✓; monotone 4+5+4 = 13 ✓; control 4+4 = 8 ✓; combo-env detected-and-relevant 3+2+3 = 8 ✓; masking 3+2 = 5 ✓ |
| K13 | Metro: "P1 = P2 = 39603d9ae300dbe1", repaired "928bd61e05391f55 vs 4f82f7227ea9348b", Node adapter "23 runs" | `:290–297` | **VERIFIED** | Gate criterion 7: `metro-env-1 P1/P2 … originalKeysEqual=true repairedKeysDiffer=true`; `node adapter … detections=[env:BUILD_MODE,env:API_URL] … runs=23` |
| K14 | "F2's planned fixed planted family at n in {6, 8, 10, 12} was not built into the frozen 24-task artifact" and "F3's planned five series are drawn as four bars per family" | `:20–29`, `:341`, `:378` | **VERIFIED (honest deviation)** | Disclosed in the module header, the F2 caption (`:341`), and the F3 caption (`:378`) |
| K15 | **F1 detection-coverage bars** | `:310–338` | **UNSUPPORTED (4 of 12 bars)** | 8 of 12 bars reproduce under the rule the caption itself specifies (denominator = Σ\|relevantGlobal\| per family = 4 and 6, which the caption states as "relevantT(2) = 4 slots" / "relevantT(3) = 6 slots"; numerator = Σ over the family's tasks of \|relevantGlobal(task) ∩ detected(task)@strength\|). The four that do **not**: `baseline-toggle` planted-2way (figure 50.0, rule 75.0), `ca(1)` planted-2way (50.0 vs 100.0), `ca(1)` planted-3way (100.0 vs 50.0), `ca(3)` planted-3way (100.0 vs 50.0). The two `ca(1)` discrepancies are exact transpositions between the series. The figure is not a gate-checked artifact and no gate reads it |
| K16 | "No number here is an estimate: the corpus is brute-forced and **every aggregate is recomputed by the gate**." | `:23` | **UNSUPPORTED (as stated)** | The 12-criterion CI gate recomputes the 72 cells, 348 necessity checks, 101 collision separations, the 55/12/1 residual counts and the pinned detection sets. It does **not** recompute the corpus-wide 408 / 651 / 1,533 assignment aggregates, the T2 strategy×metric row, the 521 / 348 detection totals, or the 1,386 / 147 separation. Those come from `scripts/keyfuse-evidence.ts`, which is committed and runs in 0.22 s but is **not in CI** |
| K17 | T1's "Enforcing gate check" column for **C2** ("criterion 3 (ca-fallback-honesty) bounds the shipped CA arm") | `:52–58` | NEEDS VERIFICATION | Criterion 3 checks that the `ca-ddmin` *fallback*'s attributed detections are a subset of exact detections. It does not test the C2 theorem about a strength-t covering array. The supporting evidence offered in the paper ("ca(1) and ca(2) detections equal the exact detections on or-threshold and max-threshold; and-chain has no ≤3-support baseline effect") is two tasks plus one null task out of 24 |
| K18 | "ground truth in this paper is exactly these definitions, computed by brute force over the product of slot values" | `:632` | **VERIFIED** | `buildGroundTruth` is in the gate and in the evidence script; 24 tasks, exhaustive products |
| K19 | "The corpus is a toy corpus … it is not an integration test of Metro, Nx, Gradle, or Turborepo, and no claim is made that the instrument already audits real cached builds." | `:886` | **VERIFIED (in the paper's favour)** | Explicit, prominent, correct |
| K20 | "Deterministic-oracle assumption is explicit; non-determinism refuses rather than guesses." | `:889` | **VERIFIED** | Gate criterion 9: `nondeterministic-counter: 15 cells all deterministic:false, detections=[], miss exactly "oracle nondeterministic at baseline"` |
| K21 | "the determinism check is sampled: two baseline runs and one perturbed row, twice; a task deterministic on those pairs and nondeterministic elsewhere can slip through" | `:886` | **VERIFIED (in the paper's favour)** | A correct and unusually candid statement of the method's own weakness |

### 2.4 Refutation-Ledger Values / Warrant Lab — `src/data/inventions/refutation-ledgers.ts`

| # | Claim (verbatim) | Source | Status | Evidence |
| --- | --- | --- | --- | --- |
| W1 | "200 frozen seeds"; arena digest `ca0cda0f562b8c10` | `:274`, `:36`, `:525` | **VERIFIED** | Gate: `digest ca0cda0f562b8c10` twice from two full arena runs; `warrant-evidence.ts` reproduces every cell |
| W2 | "48 claims = 4 kinds × 12"; "8 defect classes"; "16 refuters in 4 families"; "12 conflict pairs per regime" | `:117–123` | **VERIFIED** | Recomputed by `runArena()` inside the gate and by the evidence script; digest matches |
| W3 | "the shipped declared-dependence relation (B7) reaches pair-win 1.000 where the strongest cheap baseline (B5) reaches 0.000 in the correlated regime X" | `:274` | **VERIFIED** | Evidence run: `X: B5 0.000/0.000  B7 1.000/1.000` |
| W4 | "AUC 1.000 against 0.000" (B7 vs B5, regime X) | `:274` | **VERIFIED** | `X: B5 0.000/0.000  B7 1.000/1.000` |
| W5 | "audit precision AP@12 1.000 against 0.000" | `:274` | **VERIFIED** | `X: B5 0.000/0.000  B7 1.000/1.000` |
| W6 | "seed-only churn moves the mean grade by 0.000 and flips 0.000 of pairs" | `:274` | **VERIFIED** | `churn: seedDeltaMean 0.000, pairFlipRate 0.000` |
| W7 | "Demotion precision and recall" = 1.000 / 1.000 | `:60`, `:169–170` | **VERIFIED** | `demotion sanity: precision 1.000, recall 1.000`. The paper states at `:475` that this "checks TMS-style retraction and must not be sold as the novelty" — correct |
| W8 | "P1-P5 pass, F1 fails as predicted, F2-F4 pass" | `:448`, `:537` | **VERIFIED** | Gate criterion 2 and the evidence script's status table both reproduce P1–P5 pass / F1 fail / F2–F4 pass |
| W9 | 8/8 gate | `:543` | **VERIFIED** | `WARRANT_GATE {"passed":8,"failed":0,"digest":"ca0cda0f562b8c10"}` |
| W10 | T3/T4/T5 cell values (all 9 graders × 5 regimes × 3 metrics) | `:39–60`, `:132–171` | **VERIFIED** | Every cell in `ARTIFACT` matched the evidence run's output exactly |
| W11 | "Thresholds apply to the 5th percentile over 200 seeds frozen before the run" | `:426`, `:448`, `:452` | **VERIFIED (but vacuous as stated)** | The pair-win and AUC distributions are **degenerate**: mean = p5 = 0.500 / 1.000 / 0.000 in every regime-cell. A 5th-percentile threshold is therefore non-binding — it is passed exactly when the mean is. Only AP@12 for the count baselines shows spread (0.517 mean / 0.250 p5). The 200 seeds measure determinism, not sampling variability |
| W12 | "B5, the strongest cheap adversary" | `:134`, `:452` | NEEDS VERIFICATION | B5 is `distinct surviving families`, **capped at K = 3** (`:125`, `:452`). In regime X a defective claim survives three families f2/f2'/f3', so the cap and the family count interact directly with the designed result. Calling a capped counterfactual "the strongest" is a design choice presented as a baseline property |
| W13 | "the arena is built to give the declared dependence relation its best shot" | `:408`, `:425` | **VERIFIED (in the paper's favour)** | The generator's blind-spot table is what makes f2' and f3' one dependence class by the paper's own definition. The paper states this openly |
| W14 | "Ground truth comes from the generator's blind-spot table, never from a grader." | `:114`, `:426` | **VERIFIED** | Enforced by gate criterion 6 (`index.ts exports the oracle grader` is a failure) and by construction |
| W15 | "The corpus is synthetic … 48 claims and 12 pairs per regime are small, and no real content is audited." | `:476` | **VERIFIED (in the paper's favour)** | Explicit |
| W16 | "a value-level ledger→grade→demotion contract that no located work implements" | `:310` | NEEDS VERIFICATION | A novelty claim resting on a single prior-art pass. The paper's own T1 row for `totem` is labelled "RLV(iii), strongest match" |
| W17 | "200 seeds" read as a sample size | `:274`, `:301`, `:412` | NEEDS VERIFICATION | 200 regenerations of a deterministic generator with zero variance are not 200 observations. The word "seeds" is accurate but the framing "Across 200 frozen seeds and 12 matched conflict pairs per regime" invites a sample-size reading |
| W18 | "thresholds apply to the 5th percentile (nearest rank over the 200 frozen seeds), so a mean can look close while a criterion passes, and both are reported" | `:452` | NEEDS VERIFICATION | As W11, this reads as a hedge against sampling noise that does not exist in these cells. It should say the cells are invariant, not that the percentiles are conservative |

### 2.5 REPROGPU — `src/data/inventions/reprogpu.ts`

| # | Claim (verbatim) | Source | Status | Evidence |
| --- | --- | --- | --- | --- |
| R1 | "K1 at count 4,104 with hash c046384e" | `:202`, `:132` | **VERIFIED** | Evidence script + gate both regenerate `c046384ed6580b8111b8ef34f5d0932289209f4920666477bc76ffe724dfa27a` |
| R2 | "K2 at 65,536 with f9004cf3" | `:202`, `:134` | **VERIFIED** | Regenerated |
| R3 | "K3 at 65,536 with fbe13a3b" | `:202`, `:135` | **VERIFIED** | Regenerated (256³ BigInt reference, 942 ms here) |
| R4 | "K4 at 16,385 with eea119f4" | `:202`, `:136` | **VERIFIED** | Regenerated |
| R5 | "K1-flag: count 4,106, hash cc7dca6d" | `:133` | **VERIFIED** | Regenerated |
| R6 | Output byte sizes 48 / 48 / 1,048,580 / 262,160 / 36 / 262,144; F1 log10 1.681 / 6.021 / 5.419 / 1.556 / 5.419 | `:130–137`, `:142–161` | **VERIFIED (arithmetic)** | 4 + 65,536×16 = 1,048,580 ✓; 65,536×4 + 16 = 262,160 ✓; log10(48)=1.6812, log10(1,048,580)=6.0207, log10(262,160)=5.4185, log10(36)=1.5563 ✓ |
| R7 | "three Random123 Philox known-answer tests and the FIPS SHA-256 vectors"; K4 oracle digest `79bfb41c…` | `:202`, `:96–103` | **VERIFIED** | Gate criterion 2: `3 Philox KATs + FIPS SHA-256 + K4 oracle match`. These are **external** oracles, so they are the strongest evidence in the whole portfolio — see `:352` |
| R8 | WGSL source pins K1–K5 (`ea7c4667…`, `010e4d4d…`, `1013c964…`, `d9d8db07…`, `3f003ca3…`) | `:202`, `:428–432` | **VERIFIED** | Gate criterion 3; and `docs/research/reprogpu/expected-hashes.json` agrees. The stale pre-repair values from commit 18e11ca (`4044c04a…`, `3a091945…`, `d26f0105…`) **no longer appear anywhere in the repository** |
| R9 | "pins all five WGSL source hashes" | `:202` | **VERIFIED** | Regenerated by the evidence script |
| R10 | 5/5 gate criteria | `:112`, `:202` | **VERIFIED** | `REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":839}` |
| R11 | "K1 uses 10 limbs (320 bits) because a single term spans 277 bits and up to 2^24 terms must be summed without wrap"; "a term is below 2^277 and N is at most 2^24, so the magnitude stays below 2^301, inside the 320-bit two's-complement range" | `:273`, `:292` | **VERIFIED (arithmetic)** | 2^277 × 2^24 = 2^301 < 2^320 ✓ |
| R12 | "K3 uses 3 limbs (96 bits) because the seeded row sums stay below 2^70"; "\|product\| < 2^40 and each 256-term row sum is below 2^48" | `:273`, `:298`, `:300` | **VERIFIED (arithmetic)** | Values in [−2^20, 2^20) → \|product\| ≤ 2^40; ×256 → 2^48 < 2^70 ✓. Design ceiling: \|product\| ≤ 2^62, ×256 → 2^70 ✓ |
| R13 | "the WGSL section numbers, the Random123 vectors, and the FIPS vectors are quoted with their sources" | `:437` | NEEDS VERIFICATION | No network access in this audit; the spec is a dated CRD. The paper's own rule at `:437` makes this a standing obligation |
| R14 | **"demonstrates, as an explicit negative control (K5), that general floating-point results are not reproducible across implementations"** | `:202` (abstract), repeated at `:231` (claim ceiling) | **UNSUPPORTED** | K5 has **no pass criterion and no pinned hash** (`expected-hashes.json` has no K5 hash; T2 `:84` says "(none: no pass criterion)"). **No K5 outcome is recorded anywhere in the repository.** The paper's own §5 `:329` says the gate "checks none of this, because it has no GPU", and limitation 6 `:378` says "K5 agreement on any hardware set is not evidence of general float reproducibility". If K5 *agreed* on a reader's hardware — a live possibility, since WGSL permits it and nothing forbids it — the abstract's "demonstrates" would be false on that machine |
| R15 | "No claim of novelty, priority, or a new capability is made." | `:231` | **VERIFIED (in the paper's favour)** | Commit `c2feabf` applied this consistently across the paper, README, `docs/next-wave-plan.md`, and `AGENT_CONTEXT.md` |
| R16 | "an earlier draft of the abstract and of this section described the capability as unmatched without them" | `:250` | **VERIFIED (retraction is complete)** | The word "unmatched" survives in the paper only inside the correction paragraph that describes retiring it. The three stale WGSL pins are gone repo-wide. `docs/research/wave-48-priorart-reprogpu.md:239–265` carries a dated §10 |
| R17 | Title: "Cross-Adapter Bit-Reproducible WebGPU Kernels and a Conformance Harness" | `:198` | NEEDS VERIFICATION | **No cross-adapter comparison is recorded in any committed artifact.** The manifest is produced by the reader's browser; the paper's §8 `:389` and limitation 3 `:375` say the sample is "small, time-stamped", "self-reported", on "one machine". The title's central adjective is unevidenced inside the repository |
| R18 | "The CPU-only gate reproduces the pinned reference hashes byte-for-byte in five of five criteria" | `:202` | **VERIFIED** | Exactly what the gate does |
| R19 | "The pins themselves are regression anchors: the same reference computes both the expected constant and the observed value, so a pin can only catch drift, and correctness rests on the external oracles and on the exactness argument, not on the pin." | `:352` | **VERIFIED (in the paper's favour)** | The single most methodologically honest sentence in the five papers. It should be quoted verbatim in the other papers' reproducibility sections |
| R20 | "The gate runs in about one second on the authoring machine" / "runtimeMs:1049" / "The evidence script's runtime was 1.08 seconds … 833 milliseconds" | `:15`, `:112`, `:344`, `:437` | NEEDS VERIFICATION (disclaimed) | This audit measured 839 ms (gate) and 1.18 s / 942 ms (evidence). T4's caption already says "the pinned content is the pass/fail result, not the millisecond count" |
| R21 | "K3 documents mod-2^32 wrap on out-of-range output" (limitation 4) | `:376` vs `:300` | NEEDS VERIFICATION | `:300` says the seeded values keep the sum "comfortably inside the 96-bit bound", so the **pinned K3 vector produces no wrap**. The limitation describes the design ceiling. A reader could take it to mean the shipped vector wraps |

---

## 3. Alibi Distance — wording findings and proposed replacements

Every replacement below may only weaken or clarify. None alters a measured number, and none adds a
citation.

### W1 — "every census rate within 0.2 percentage points" is contradicted by the paper's own table
**Current (`:275`, abstract):** "…and an independent engine over the same corpus reproduces every census rate within 0.2 percentage points (closure estimates agree within 0.7)."
**Problem:** `REPLICATION_TABLE :144` reports the length quartiles as 56.66 vs 56.34, a **0.32pp** gap,
and the table's own caption `:129` puts quartiles in the "within 0.7" bucket. "Every census rate"
is false two paragraphs later.
**Proposed:** "…and a second, independently written engine over the same corpus reproduces the census
rates within 0.2 percentage points, the length-quartile and closure estimates within 0.7 (Table 7).
Neither engine is part of the released artifact, so this agreement is a provenance record rather than
a reproducible check."

### W2 — "the first census of radius-1 silent survivors on a large verified education corpus"
**Current (`:304`):** "What we contribute is: (i) the first census of radius-1 silent survivors on a
large verified education corpus, computed with real execution; …"
**Problem:** A priority claim. §2 does not establish it; §2 establishes adjacency, not absence, and
the paper elsewhere adopts "no located work" phrasing (`:245`).
**Proposed:** "What we contribute is: (i) a census of radius-1 silent survivors on a verified education
corpus of 5,730 exercises, computed with real execution and with a second, separately written engine
cross-checking the rates; …"

### W3 — "the load-bearing replication result"
**Current (`:438`):** "That agreement is the load-bearing replication result of the paper, and it is
not the only one: …"
**Problem:** "Replication" implies an independent party. Both engines are the same author's, written
in the same project against the same corpus and the same seed discipline, and neither is in the
repository.
**Proposed:** "That agreement is the load-bearing cross-implementation check in the paper, and it is
not the only one: … Both engines were written by this paper's author; the check establishes that two
implementations of the same specification agree, not that the measurement has been independently
reproduced. Neither engine is part of the released artifact, so the agreement cannot be re-checked
from this repository."

### W4 — "re-checks every claim"
**Current (`:663`):** "The permanent gate scripts/verify-alibis.ts plus scripts/py_alibi_verify.py
re-checks every claim, including both resistance suites, outside the browser and exits non-zero on any
failure; the last gate run passed 96/96 with zero union, held-out, metadata, or witness failures."
**Problem:** The gate re-checks the 96 shipped puzzles and nothing else. This is the most
overreaching sentence about evidence in the paper, and it is the one a reviewer will test.
**Proposed:** "The permanent gate scripts/verify-alibis.ts plus scripts/py_alibi_verify.py re-checks,
in real Python outside the browser, the claims attached to the 96 shipped puzzles — reference passes
the shipped tests, ghost passes the shipped tests, divergence at the witness, a one-line diff, and
zero divergence over 189,658 union and 24,560 held-out probes — and exits non-zero on any failure; the
last gate run passed 96/96. The gate does not recompute the census, the mining funnel, the closure
estimates, the negative results, or the audits; those numbers are records of a mining run whose
programs are not part of this artifact (Section 9)."

### W5 — "The ordering is a usable authoring signal"
**Current (`:492`):** "The ordering is a usable authoring signal: a review queue that looks at
Statistics first will find roughly twice the aperture of one that starts with Deep Learning. It is not
a statement that one category's authors did worse work; higher-aperture categories are also the ones
whose solutions are longer and more branch-heavy, and the census does not separate those effects."
**Problem:** A prescriptive recommendation is drawn from a descriptive ordering in the same sentence
that disclaims the confound that would license it. A category-level ranking of 15 cells with a stated
unseparated length/branching confound cannot support a triage instruction.
**Proposed:** "The ordering is a starting point for an authoring review queue, not a validated signal:
a review queue that looks at Statistics first would encounter roughly twice the aperture of one that
starts with Deep Learning. It is not a statement that one category's authors did worse work;
higher-aperture categories are also the ones whose solutions are longer and more branch-heavy, and the
census does not separate those effects, so the category ordering may be a proxy for solution shape
rather than for suite quality."
**Related, same file, `:212` (figure caption):** "…so category ordering is a usable authoring signal in
this corpus."
**Proposed:** "…so the category spread is larger than the between-engine differences, while remaining
confounded with solution length and branching; the ordering is a hypothesis about where to look, not a
validated triage signal."

### W6 — "the game reliably teaches"
**Current (`:652`, callout "Practice, not proof of skill"):** "Systematic input variation still solves
a meaningful share, and what the game reliably teaches is that a shipped suite is not the behavior, not
that every ghost demands a leap. The game remains practice, not proof: human behavior is unmeasured, and
an adversarial solver can still convict a ghost with an input no fixed suite contains."
**Problem:** A pedagogical claim asserted from a synthetic attack, in the same cell that concedes
"human behavior is unmeasured". This is the exact descriptive→pedagogical slide the audit was asked to
look for. The concession does not reach the first clause.
**Proposed:** "Systematic input variation still solves a meaningful share. The design intent behind
the route is that a shipped suite is not the behavior and that not every ghost demands a leap; no
learner has been observed doing either, so that intent is unevaluated. The game remains practice, not
proof: human behavior is unmeasured, and an adversarial solver can still convict a ghost with an input
no fixed suite contains."

### W7 — "Re-running either engine produced byte-identical chunk files" / "reproducible from a checkout"
**Current (`:677`):** "The census is reproducible from a checkout without network access, a model, or
any new dependency. Two independently written CPython engines processed the same repository corpus: …
Re-running either engine produced byte-identical chunk files."
**Problem:** The census is **not** reproducible from a checkout — `:708` says the raw mining run is not
committed, and this audit confirmed the scratch trees are gone. The byte-identical claim is about code
no reader can obtain.
**Proposed:** "The census procedure requires no network access, no model, and no new dependency, and
both engines ran on the repository corpus: the author engine over 5,721 analyzable problems and a
from-scratch second engine over 5,725. Neither engine, nor its output, is part of this artifact; the
numbers in this paper are the record of those runs, and the byte-identical determinism result reported
at the time cannot be re-checked from a checkout. Section 9 lists where the run lived."

### W8 — "two audits, one blind and one not, that pin down how often the mined objects are actually bugs"
**Current (`:304`):** "…and (iv) two audits, one blind and one not, that pin down how often the mined
objects are actually bugs."
**Problem:** n = 10 in each. "Pin down" overstates a precision estimate on ten items; "bugs" is also
stronger than the paper's own verdict vocabulary (8 "plainly wrong", 1 "immaterial", 1 "subtle").
**Proposed:** "…and (iv) two audits of ten alibis each, one sampled blind and one not, that give a
first estimate of how often the mined objects are defects, with a wide interval at that sample size."

### W9 — "A blind audit of ten independently sampled alibis found 10/10 plainly wrong" (abstract)
**Current (`:275`):** "A blind audit of ten independently sampled alibis found 10/10 plainly wrong."
**Problem:** True as written, but a reader will take "blind" and "independently sampled" to mean an
external judge. §7 `:610` describes the auditor as "the verifier's script" — the same author, sampling
independently of the first ten ids. The abstract should say who judged.
**Proposed:** "A blind audit of ten alibis sampled independently of the author's first ten (judged by
this paper's author, who had not seen the first audit's verdicts) found 10/10 plainly wrong; a second,
non-blind audit of ten found eight plainly wrong, one immaterial, and one subtle."

### W10 — "A mutation family that were noise would not order this way"
**Current (`:442`):** "A mutation family that were noise would not order this way; the ordering is
consistent with a slip-relevance reading of the families, which is the most that can be said without
human false-pass data."
**Problem:** The counterfactual ("noise would not order this way") assumes the null. Family survival
order is also mechanically related to how destructive each rewrite is, which the paper says in the same
paragraph. The clause "which is the most that can be said" is the honest part and should lead.
**Proposed:** "Which is the most that can be said without human false-pass data: the ordering is
consistent with a slip-relevance reading of the families, but a family-ordering argument cannot
distinguish a plausible-slip effect from a mechanically destructive rewrite, and no human false-pass
data exists to separate them."

### W11 — Figure caption: "wider than the engine-to-engine replication gap"
**Current (`:212`):** "The spread (25.93% to 60.24%) is wider than the engine-to-engine replication gap,
so category ordering is a usable authoring signal in this corpus."
Covered by W5's second proposed replacement.

### W12 — the mining funnel is a stored constant
**Current (`:161`, `CURATED_TABLE` "Re-mine funnel"; repeated at `:647` and `:698`):** "89,622
single-edit mutants over 2,636 affected problems -> 19,030 shipped-test passers -> 4,060 clean under
the full union lazy suite -> 268 with a hidden witness -> 217 also clean under the independently
constructed held-out suite; legacy pool 9 -> 8 valid; combined 253 re-validated -> 211 valid -> 96
shipped by category round-robin"
**Problem:** `verify-alibis.ts:46–58` holds these as `FUNNEL` literals and only prints them. A reader
of the paper may reasonably assume the gate recomputed them; it did not.
**Proposed (append to the row's caption):** "These eight counts are the recorded funnel of the mining
run. The permanent gate stores them as constants and re-prints them; it does not re-derive any step of
the funnel, and the mining programs are not part of the artifact. What the gate does recompute is every
per-puzzle claim in the rows above and below."
**Proposed (append to `:698`):** "The re-mined set was generated once from scratch artifacts by a
deterministic rule recorded with it (…); those funnel counts are stored constants in the gate, not
recomputed by it."

### W13 — BDL "replicates" 46.08%
**Current (`:299`):** "The visibility of hidden-basis divergence is wave 41's result, replicated here
(44.40% of problems carry a test-passing slip the basis sees, against Alibi Distance's 46.08%
P(alpha=1) on a basis that included the shipped inputs)."
**Problem:** "Replicated" plus two numbers 1.68pp apart implies the two runs measured the same thing.
They did not: different basis construction (shipped inputs excluded vs included), different estimand
(test-passing slip vs radius-1 alibi), different denominators.
**Proposed:** "The visibility of hidden-basis divergence is wave 41's result, and this run is consistent
with it rather than a replication of it: 44.40% of problems carry a test-passing slip the basis sees,
against Alibi Distance's 46.08% P(alpha=1) on a basis that included the shipped inputs. The two
statistics are constructed differently (basis composition and estimand), so their 1.68pp difference is
not a measure of agreement."

### W14 — BDL "The test-passing rate independently replicates wave 41's 16.50% on a fresh artifact"
**Current (`:414`):** "The test-passing rate independently replicates wave 41's 16.50% on a fresh artifact."
**Problem:** The two runs use different mutant sampling budgets (≤24/problem, ≤4/family over 5,682
problems → 88,357 mutants; ≤36/problem, ≤6/family over 5,721 problems → 106,081 mutants), so the two
16.x% figures are not estimates of the same quantity. Their 0.05pp proximity is not a replication.
**Proposed:** "The test-passing rate is close to wave 41's 16.50% (16.45% here), which is a useful
coarse consistency check but not a replication: the two runs sample mutants under different caps
(≤24 per problem here, ≤36 there) over slightly different analyzable sets, so the two percentages do
not estimate the same quantity."

### W15 — BDL abstract: the 90.20% / 84.00% metric switch
**Current (`:257`):** "In-sample, the sign of the hidden delta matches the sign of the test delta for
90.20% of climb walks (AUC 0.903), but with the basis built only from odd-index tests and the delta
scored on even-index tests the held-out concordance drops to 84.00% (AUC 0.829) and 82.23% (AUC 0.797)
— the number we report."
**Problem:** 90.20% / AUC 0.903 is the **positive-only** in-sample rate (steps with test-delta ≠ 0);
84.00% is the full-sign held-out rate. The paper's own §5 `:496` states "the positive-only in-sample
rates of the first draft are not used as reported results", and its own figure `:228` uses 87.78%
full-sign and reports a 3.78pp drop. The abstract's 6.20pp "drop" is 2.42pp of metric change, not
2.42pp of leakage.
**Proposed:** "In-sample, on the same full-sign statistic used for the held-out numbers, the sign of the
hidden delta matches the sign of the test delta for 87.78% of climb steps and 83.40% of random steps;
with the basis built only from odd-index tests and the delta scored on even-index tests the held-out
concordance falls to 84.00% (AUC 0.829) and 82.23% (AUC 0.797) — a 3.78 and 1.17 point drop, and the
number we report. A positive-only in-sample rate restricted to steps with a nonzero test delta reads
90.20% (AUC 0.903); it is a different statistic and is not comparable to the held-out figures."

### W16 — BDL "the invisibility rate is a lower bound on any wider-domain notion"
**Current (`:404`):** "Enlarging the basis or the edit model can only find more divergence, so the
invisibility rate is a lower bound on any wider-domain notion."
**Problem:** This is a monotonicity claim about the measurement, asserted rather than shown — and it is
the same class of claim the sibling Alibi Distance paper explicitly retracted once for the same
underlying intuition (`:411`, `:419`).
**Proposed:** "Enlarging the basis should find at least as much divergence, so we expect the
invisibility rate measured here to be a lower bound for a wider basis; that expectation is not
separately measured in this study, and the sibling paper in this series withdrew an analogous
monotonicity claim after a counterexample was found."

### W17 — BDL: the gate is presented as if it certified the census
**Current (`:669–670`):** "Derived statistics: 88,357 mutants; 9,041 invisible = 10.23% […]; …
Permanent gate: scripts/verify-bdl.ts plus scripts/py_bdl_verify.py emit harnesses for fixed fixtures
…, and exit non-zero on any mismatch."
**Problem:** True but adjacent to a misleading impression. `py_bdl_verify.py:88` hard-codes exactly
those "derived statistics" as `CENSUS_COUNTS`; the exact check runs only in `--census` mode, which CI
does not use. CI checks a 240-problem sample within 3σ, with ±10.07pp on one headline row.
**Proposed (replace the "Derived statistics" bullet):** "Derived statistics, recorded from the clean run
and stored as constants in the permanent gate (which compares them exactly only when the census
artifact is supplied; CI runs the gate without it): 88,357 mutants; 9,041 invisible = 10.23% […]; …
In the default self-contained mode the gate instead re-runs the analyzer on a deterministic stratified
240-problem sample and requires the four headline rates to fall within 3σ of the stored values,
printing the tolerance for each row."

### W18 — BDL: stale reproducibility instruction
**Current (`:657`):** "# permanent Python-backed harness gate (wired as verify:bdl once it lands)"
**Proposed:** "# permanent Python-backed harness gate (wired as verify:bdl in CI)"

### W19 — KeyFuse: "every aggregate is recomputed by the gate"
**Current (`:23`):** "No number here is an estimate: the corpus is brute-forced and every aggregate is
recomputed by the gate."
**Problem:** The 12-criterion CI gate recomputes the 72 cells, the 348 necessity checks, the 101
separations, the 55/12/1 residual counts and the pinned detection sets. The corpus-wide aggregates
(408 / 651 / 1,533), T2's strategy×metric row, the 521-detection and 348-necessity totals, and the
1,386/147 separation come from `scripts/keyfuse-evidence.ts`, which is committed but not in CI.
**Proposed:** "No number here is an estimate: the corpus is brute-forced, so ground truth is exact by
enumeration. The committed evidence script recomputes every aggregate; the twelve-criterion CI gate
independently recomputes the 72 cells, the witness and necessity checks, the collision separations, the
anchor residuals and the negative controls, and compares the pinned aggregate counts. Two of the
aggregates quoted in this paper — the corpus-wide assignment and collision-pair totals and the T2
strategy-by-metric row — are produced by the evidence script and are not recomputed by the CI gate; both
are reproduced by running it in 0.22 s."

### W20 — KeyFuse: F1's aggregation rule and four disagreeing bars
**Current (`:310–317`, `F1` bars and caption):** "baseline-toggle 50.0 … ca(1) 50.0 … " for planted
2-way and "ca(1) 100.0 … ca(3) 100.0" for planted 3-way.
**Problem:** Under the rule the caption itself specifies — denominator = Σ over the family's tasks of
\|relevantGlobal\| (4 and 6, as the caption states) and numerator = Σ over the family's tasks of
\|relevantGlobal(task) ∩ detected(task) at the bar's strength\| — 8 of the 12 bars reproduce and 4 do
not: `baseline-toggle` 2-way (figure 50.0, rule 75.0), `ca(1)` 2-way (50.0 vs 100.0), `ca(1)` 3-way
(100.0 vs 50.0), `ca(3)` 3-way (100.0 vs 50.0). The two `ca(1)` values are exact transpositions. No
gate reads this figure.
**Proposed — do not change any bar until the owner confirms the intended rule.** Either (a) state the
aggregation rule explicitly in the caption, e.g. "each bar is the sum over the family's tasks of the
ground-truth slots that arm detected at the labelled strength, divided by the sum of the family's
ground-truth slot counts (4 for the two planted-2way tasks, 6 for the two planted-3way tasks)", and
correct the four bars to the values that rule produces (75.0, 100.0, 50.0, 50.0); or (b) mark the four
bars as unverified in the caption. The audit cannot determine which of the figure or the evidence
artifact is authoritative, and **no measured number elsewhere in the paper changes either way**.

### W21 — Warrant: a degenerate distribution behind a 5th-percentile threshold
**Current (`:448`, callout "Outcome space"):** "Thresholds apply to the 5th percentile except where a
criterion names churn or demotion."
**Current (`:452`):** "Thresholds apply to the 5th percentile (nearest rank over the 200 frozen seeds),
so a mean can look close while a criterion passes, and both are reported."
**Problem:** The pair-win and AUC cells are invariant across all 200 seeds: every cell's 5th percentile
equals its mean exactly. A percentile threshold on a degenerate distribution is non-binding — it is
satisfied exactly when the mean is — so the wording implies a sampling robustness that does not exist.
The 200 seeds demonstrate determinism, not stability under resampling.
**Proposed (`:452`):** "Ties count 0.5 in pair-win; thresholds are stated at the 5th percentile over the
200 frozen seeds and both the mean and the percentile are printed. For the pair-win and AUC cells the
per-seed value is identical across all 200 seeds, so mean and 5th percentile coincide and the
percentile threshold is satisfied exactly when the mean is; those cells carry no sampling variability
and the seed sweep is a determinism check, not a stability check. Only the AP@12 cells for the count
baselines show spread (mean 0.517, 5th percentile 0.250)."
**Proposed (`:274`, abstract):** after "Across 200 frozen seeds and 12 matched conflict pairs per
regime," insert "— a deterministic arena in which the per-seed outcome is identical across all 200
seeds, so the seed sweep tests determinism rather than sampling variability —".

### W22 — Warrant: "the strongest cheap baseline"
**Current (`:274`):** "the strongest cheap baseline (B5)"; also `:134`, `:452`, `:188` in `next-wave-plan`.
**Problem:** B5 is `distinct surviving families` **capped at K = 3** (`:125`). In regime X a defective
claim survives three families, so the cap is directly load-bearing for the result being reported, and
"strongest" is a property of the chosen cap rather than of the baseline family.
**Proposed:** "the strongest cheap baseline we constructed (B5, distinct surviving families, capped at
the same K = 3 as the shipped grade — a cap that matters in regime X, where a defective claim can
survive three families)".
**Related:** `README.md:68` currently reads "the declared-dependence grade beats the strongest count
baseline by +1.000 pair-win and AUC while the syntactic tuple variant is killed as predicted" with no
regime qualifier and no synthetic-corpus qualifier. `docs/next-wave-plan.md:44` row 31 has the correct
qualifier ("in the correlated-family regime"). Bring README into line with `next-wave-plan`.

### W23 — REPROGPU: the K5 "demonstration"
**Current (`:202`, abstract):** "…and demonstrates, as an explicit negative control (K5), that general
floating-point results are not reproducible across implementations."
**Current (`:231`, claim ceiling):** "…and demonstrates, as an explicit negative control, that general
floating-point results are not reproducible across implementations because WGSL §15.7 leaves rounding
direction, reassociation, fusion, and subnormal flushing unspecified."
**Problem:** No K5 result exists anywhere in the artifact. K5 has no pass criterion, no pinned hash, and
no recorded outcome. The paper's own §5 `:329` ("The gate checks none of this, because it has no GPU")
and limitation 6 `:378` ("K5 agreement on any hardware set is not evidence of general float
reproducibility") contradict the abstract. The claim is also not a demonstration: the argument is a
specification reading plus an unrecorded experiment, and the unrecorded experiment could come out the
other way.
**Proposed (abstract):** "…and declares float out of scope, on the specification's own boundary
(WGSL §15.7 leaves rounding direction, reassociation, fusion, and subnormal flushing unspecified). K5
is an f32 matmul negative control that the browser lab runs and records; it carries no pass criterion
and no pinned hash, and no outcome for it is recorded in this artifact, so this paper does not claim an
observed float divergence."
**Proposed (claim ceiling):** "…and declares general floating-point results out of scope because WGSL
§15.7 leaves rounding direction, reassociation, fusion, and subnormal flushing unspecified. K5 is an
f32 negative control whose per-adapter hash and run-to-run comparison are recorded by the browser lab
and classified as divergent, run-to-run only, or agreeing; no K5 outcome is recorded here, and K5
agreement on any hardware set would not be evidence of float reproducibility."

### W24 — REPROGPU: the title's central adjective is unevidenced inside the repo
**Current (`:198`):** "REPROGPU: Cross-Adapter Bit-Reproducible WebGPU Kernels and a Conformance Harness
for a Declared Integer Subset"
**Problem:** No cross-adapter comparison is recorded in any committed artifact. The manifest is produced
on a reader's machine and is self-reported and unattested (`:375`, `:389`).
**Proposed:** add a sentence to §8 or the claim ceiling: "No cross-adapter comparison is recorded in
this artifact. The word 'cross-adapter' in the title names the protocol the harness implements and the
claim a reader can test by running the lab on two machines; the repository contains CPU reference
outputs only, and every cross-adapter statement in this paper is an observation about one time-stamped
machine, never a population claim."

### W25 — REPROGPU: K3 wrap wording
**Current (`:305`):** "The low 32 bits then wrap per section 6.2.3 for the seeded inputs, and that wrap
is stated rather than hidden."
**Current (`:376`, limitation 4):** "K3 documents mod-2^32 wrap on out-of-range output."
**Problem:** `:300` says the seeded values keep every row sum "comfortably inside the 96-bit bound", so
the **pinned** K3 vector does not wrap. `:305`'s "wrap per §6.2.3 for the seeded inputs" reads as though
it does.
**Proposed (`:305`):** "The low 32 bits then wrap per section 6.2.3 whenever the floored value leaves
the i32 range. The seeded pinned vectors do not reach that case — their row sums stay below 2^48
inside a 96-bit accumulator — so the shipped K3 result contains no wrap; wrap is a property of the
design ceiling for larger shapes and is stated here rather than left implicit."

### W26 — the funnel provenance, the census provenance, and "106,081"
`:708` already states that the raw run is not committed and lists the scratch paths. That is honest and
should be kept. One addition: the paths named there
(`/var/folders/.../opencode/w41/`, `w41-verify-empirical/`, `w41-verify-theory/`, `w41-remine2/`) are
**machine-local temp directories that no longer exist**; a reader who follows them gets nothing. Append:
"These directories are machine-local scratch paths and are not expected to persist after the authoring
session; the durable outputs are the checked-in paper, the verified puzzle records, and this
provenance header."

---

## 4. Prior-art history: were commits `18e11ca` and `c2feabf` complete?

**For REPROGPU: yes, and I could not find residue.**

| Check | Result |
| --- | --- |
| The three stale pre-repair WGSL hashes (`4044c04a…`, `3a091945…`, `d26f0105…`) | **Absent from the entire repository.** `rg` over all files returns nothing |
| The word "unmatched" in the paper | Survives only at `:250`, inside the correction paragraph that describes retiring it. No surviving use as a novelty claim |
| `docs/research/wave-48-priorart-reprogpu.md` | Carries a dated §10 "Post-publication correction (2026-09-19)" naming both missed works, what each does, and what it does not do, and stating that the earlier wording "was **overstated**" |
| Consistency of the correction across surfaces | `c2feabf` applied it to `src/data/inventions/reprogpu.ts` (claim ceiling), `README.md:69`, `docs/next-wave-plan.md:44`, and `AGENT_CONTEXT.md:264`. All four carry "artifact/conformance contribution … not a novel method" |
| T1 table | Both missed works are now rows (`:61`, `:62`) with the same four-column "clauses not done" structure as every other row |
| Repins | `expected-hashes.json` regenerates byte-identically; the gate passes 3/5 source pins |

**But one inflation of the same family was not caught by either commit.** The abstract's and claim
ceiling's "demonstrates … that general floating-point results are not reproducible across
implementations" (W23) is a *capability* overclaim of the same shape as the one that was walked back: it
asserts an observed result for an experiment that has no recorded observation, and it sits in direct
tension with the paper's own §5 and limitation 6. It is a live residual of the same failure mode, in
the same paper, four months of commits later.

**Elsewhere, the recurring pattern survives in three more places**, none of them a novelty claim but all
of them evidence-strength claims that a prior-art pass would not look for:
1. `docs/next-wave-plan.md:40` row 28: "independent engine reproduces **every rate**" — same
   overstatement as `alibi-distance.ts:275` (W1).
2. `docs/next-wave-plan.md:42` row 29: "held-out **no-op detection** 84.00/82.23%" — those figures are
   *sign concordance*, not no-op detection. A mislabelled metric in the project ledger.
3. `README.md:68` Warrant Lab: "+1.000 pair-win and AUC" with no regime and no synthetic-corpus
   qualifier (W22).

**Admissions-document surface (highest external visibility):**

- `docs/admissions/global-phd-search-2027.md:9`: "**DeepForge platform (5,730 execution-verified
  exercises, ~1,785 tests)**". **1,785 is the repository's `bun test` count (87 files), not the number of
  exercise test cases.** The corpus has **23,518** shipped test cases (1,089 problems with 3, 3,007 with
  4, 1,581 with 5, 53 with 6 — confirmed directly from `src/data/problems`). Placed immediately after
  "5,730 execution-verified exercises", the sentence reads as a claim about exercise tests and is wrong
  by more than an order of magnitude. This is the single most easily caught factual error in the whole
  portfolio and it sits in the document most likely to be read first by a reviewer.
  **Proposed:** "DeepForge platform (5,730 execution-verified exercises carrying 23,518 shipped test
  cases; 1,785 repository unit tests)".
- `docs/admissions/global-phd-search-2027.md:9` and `:130`, `docs/admissions/research-statement.md:7`,
  `docs/admissions/flagship-research-artifacts.md:19`, `scripts/build-admissions-documents.py:86`, and
  `scripts/build-research-portfolio.py:198` all carry "second/independent engine within 0.2pp". Because
  the paper's own table puts the length quartiles at 0.32pp, "within 0.2pp" should be scoped to the
  census rates (W1's replacement wording) and should say that the second engine is not in the
  repository.
- `docs/admissions/research-portfolio.md:22`: "A corpus-level radius measure, **independent
  re-execution**, two failed follow-on hypotheses…" — "independent re-execution" reads as external.
  **Proposed:** "a second, separately written engine re-executing the census".
- `docs/admissions/flagship-research-artifacts.md:19`: "**A separately written engine** reproduced the
  census rates within 0.2 percentage points." Correct as far as it goes; add that neither engine is in
  the repository and that the figure is a provenance record.
- `docs/admissions/` is **untracked** (`git status` → `?? docs/admissions/`, `?? output/`, and both
  `build-*.py` scripts). Whatever wording corrections land there should be committed.

---

## 5. The ten claims that would do the most damage if a hostile reviewer checked them

Ordered by (likelihood of being checked) × (damage if it fails).

1. **"an independent engine over the same corpus reproduces every census rate within 0.2 percentage
   points"** (`alibi-distance.ts:275`, mirrored at `next-wave-plan.md:40`, `research-statement.md:7`,
   `global-phd-search-2027.md:9`/`:130`, `flagship-research-artifacts.md:19`,
   `build-admissions-documents.py:86`, `build-research-portfolio.py:198`).
   **Why it is the worst:** it is the single most-quoted sentence in the portfolio; it is *refuted on
   the same page* by the paper's own length-quartile row (0.32pp > 0.2pp); and the engine it names does
   not exist in the repository, so a reviewer who asks "show me" gets nothing. A reviewer who finds one
   self-contradiction plus one missing artifact will discount every other number in the paper.

2. **BDL abstract: "In-sample … 90.20% of climb walks (AUC 0.903) … the held-out concordance drops to
   84.00%"** (`behavioral-delta-ledger.ts:257`).
   **Why:** checkable in 30 seconds against §5 and the paper's own Table 4, which report 87.78% for the
   comparable statistic and explicitly say the 90.20% positive-only rate "is not used as reported
   results". It inflates the paper's own admitted deflation by 2.42pp, and it is in the abstract, which
   is the only part some committee members read.

3. **"The permanent gate … re-checks every claim"** (`alibi-distance.ts:663`).
   **Why:** it is a falsifiable statement about the repository that a reviewer can falsify in one command.
   It is false. The honest version is also *more* impressive (189,658 + 24,560 real Python probes,
   96/96), so there is no reason to keep the overclaim.

4. **"~1,785 tests" for a 5,730-exercise corpus** (`global-phd-search-2027.md:9`).
   **Why:** the true figure is 23,518. It is a one-line count that any reviewer can run, it is wrong by
   >10×, and it is in the most-read document. It also signals that the portfolio's numbers were not all
   checked against the repo.

5. **BDL: "The test-passing rate independently replicates wave 41's 16.50% on a fresh artifact"**
   (`behavioral-delta-ledger.ts:414`).
   **Why:** the two runs use different mutant caps (24 vs 36 per problem) and different denominators, so
   they do not estimate the same quantity. A reviewer who notices has grounds to distrust the
   16.45% and 10.23% alongside it.

6. **REPROGPU abstract: "demonstrates … that general floating-point results are not reproducible across
   implementations"** (`reprogpu.ts:202`, `:231`).
   **Why:** same failure family as the prior-art overclaim that `18e11ca` and `c2feabf` already walked
   back once in this exact paper. There is no K5 observation in the artifact, and the paper's own
   limitation 6 contradicts the abstract. A reader who ran the lab and got K5 *agreement* would have
   caught a live falsehood.

7. **REPROGPU title: "Cross-Adapter Bit-Reproducible"** with no cross-adapter comparison in the repo
   (`reprogpu.ts:198`).
   **Why:** the title is the first thing on the page. The paper's honesty about the one-machine sample
   is excellent, but it does not reconcile the title with it.

8. **Alibi Distance: "Census: 106,081 sampled mutants … 46.08% of analyzable problems"** as a *verified*
   result.
   **Why:** no engine is committed, no gate touches it, and "analyzable" is a self-defined, engine-
   dependent denominator. A reviewer who cannot reproduce the headline of the flagship paper will assume
   the flagship paper is unreproducible.

9. **KeyFuse F1: four of twelve bars do not reproduce** (`keyfuse.ts:310–338`).
   **Why:** no gate reads the figure, so nothing in CI would ever notice. A reviewer who re-runs the
   committed evidence script — which takes 0.22 s — and applies the caption's own stated rule gets
   different numbers. A figure that disagrees with its own artifact is the kind of thing that makes a
   reviewer distrust the *gated* numbers too.

10. **Warrant: pre-registered thresholds at the 5th percentile over 200 seeds, on a distribution with
    zero variance** (`refutation-ledgers.ts:448`, `:452`).
    **Why:** every headline cell's mean equals its 5th percentile. The threshold machinery reads as
    statistical rigour and is in fact vacuous; the 200 seeds are a determinism check. A reviewer who
    notices will read the whole P1–P5 table as theatre, and the +1.000 margins as a design consequence —
    which they are, and which the paper says in §5 but not where the thresholds are stated.

---

## 6. Explicit "could not verify" list

Ordered by how much it matters.

1. **Every Alibi Distance census, closure, cross-validation, negative-result, and audit number.** The
   mining engines (author *and* independent) are not in the repository and the scratch trees
   (`w41/`, `w41-verify-empirical/`, `w41-verify-theory/`, `w41-remine2/`, `w41-remine/`) are deleted.
   Affected: A2–A11, A15–A30, A41–A44, A46–A47. Reason: no committed implementation. Note the family,
   slice, decile, closure and category tables are all *internally* consistent, which is a real (if weak)
   positive signal, and is recorded as such above.
2. **Whether the Alibi Distance "independent engine" re-derives from raw data or shares precomputed
   results.** Undeterminable: neither engine is available. The claim is not circular-through-a-shared-
   artifact; it is unfalsifiable.
3. **The BDL full-corpus census at exact counts.** `census_clean.jsonl` is absent; the counts are
   hard-coded in `py_bdl_verify.py:88`; CI omits `--census`. The committed check is a 240-problem
   stratified sample within 3σ, with ±10.07pp on `hidden_visible` and ±9.92pp on
   `problems_visible_slip`. Sample observations: 10.77% vs 10.23%, 16.07% vs 16.45%, **42.33% vs
   45.23%**, 45.34% vs 44.40%. Three of four are within 0.6pp; one is 2.9pp off and passes on a 10pp
   tolerance. I cannot tell whether the paper is right or the gate is too loose.
4. **The BDL walk study, cold sets, permutation null, latency audit, and synthetic routing model.** All
   need `analysis/recompute.py` and the walk artifacts, none committed.
5. **All WGSL specification readings in REPROGPU** (§15.7.2 / §15.7.4.1 / §15.7.5 / §6.2.3 / §8.9 /
   §8.10 / §14.4.4 / §17.2.1, including "x/y is 2.5 ULP"). No network; the spec is a dated CRD. The
   paper's own rule makes re-checking mandatory before the claim is treated as current.
6. **All 22 T1 URLs in REPROGPU and the reference lists in all papers.** The paper's rule
   (`reprogpu.ts:437`) requires re-checking any changed URL; not performed here.
7. **The seven-novel-probe-family attack on the 96 shipped puzzles** (6/11/22/35) and the S2/S3 shuffle
   sweeps (1/768, 0/768, 0/768). No code or log.
8. **The overfit finding for the first two curated banks** (74–78% solvable in five probes; 84/96 and
   47–64/96 for the 128-probe bank; 3/96 cleared). Self-reported, no artifact. The retraction record
   `w41-remine/selected-resistant.json` is also absent.
9. **The three audit transcripts** (author n=10, blind n=10 seed 8675309, and the n=18,191 leakage
   protocol). No records committed; the paper describes the protocol well but the judgements are not
   independently checkable.
10. **The census cost measurements** (≈4.5–5M Python calls, ≈27 CPU-minutes, ≈4 min wall on 8 workers,
    mean bank 39.05 probes, 89.22% evaluable, the cap-120 robustness rerun). No telemetry.
11. **The KeyFuse T1 "Enforcing gate check" column for C2.** I read criterion 3 and it does not test the
    covering-array theorem; the supporting evidence in the paper is 2 of 24 tasks. Whether the column
    is meant as a check or as a bound is a judgement call, so I have recorded it as NEEDS VERIFICATION
    rather than UNSUPPORTED.
12. **Which of KeyFuse F1 or the evidence artifact is authoritative** (W20). I could reproduce 8 of 12
    bars under the caption's own rule and not the other 4; I cannot tell which side is wrong.
13. **`docs/admissions/` wording and provenance.** Untracked, so there is no diff history to audit. I
    read the current files only.
14. **The `ladder-graded-spacing.ts` paper in full** (§7 below) — I verified the simulation numbers and
    did not audit its related-work or novelty wording.
15. **Learner-outcome, production-validity, and cross-domain generalisation claims.** None exist in the
    papers, and none should. Recorded here so the absence is on the record rather than an oversight.

---

## 7. Out-of-assigned-scope note: Ladder-Graded Spacing (wave 40)

Not one of the five assigned artifacts, but it is in the `/inventions` registry and carries the same risk
class, so I ran its simulation rather than skip it.

**All reported numbers reproduce.** `bun run scripts/lgs-sim.ts` gave: literal-protocol 25.3246% (paper
25.32), recall-matched 25.6348% (paper 25.63), matched 30-seed interval 24.1990% [23.6995, 24.6986]
(paper 24.20 [23.70, 24.70], 30/30), memory-truth 20.8386% [20.4123, 21.2648] (paper 20.84 [20.41,
21.26], 30/30), Brier delta −0.1105 [−0.1129, −0.1081] with 0/30 seeds worse (paper exact), raw recall
delta −2.53pp [−2.57, −2.50] (paper exact), edge cohorts allFail 1.0000× / perfect 0.8333× / oneLeech
0.8375× (paper 1.000×, 0.833×), final `GATES: PASS`. This is the only paper in the set whose headline
numbers are recomputed end-to-end by a committed, runnable script that a reviewer can execute in one
command, which makes it the best-evidenced of the six.

Two wording notes, consistent with §3's standard:
- `ladder-graded-spacing.ts:157` (abstract) presents 25.63% fewer reviews and a −0.1105 Brier delta as
  results. The paper discloses "synthetic truth, uncalibrated hint debits" in the same abstract and
  `next-wave-plan.md:39` (row 27) labels it a 100-learner simulation, but the abstract's phrasing
  ("noE used 25.63% fewer reviews per retained item than SM-2") reads as a scheduler comparison rather
  than as a comparison inside one synthetic memory model. **Proposed:** "In a 100-learner, 40-item,
  365-day simulation in which both schedulers are scored against the same synthetic memory-based truth
  model — not against human retention data — noE used 25.63% fewer reviews per retained item than SM-2
  at matched first-attempt recall".
- `ladder-graded-spacing.ts:123` (figure caption) already makes the right point: "The literal protocol
  … is degenerate — every arm retains 4000/4000 — so acceptance uses the matched-recall comparison."
  That admission should be lifted into the abstract, because the literal-protocol 25.32% is the number a
  casual reader will quote.

---

## 8. Summary of the blunt finding

The portfolio has two very different evidence profiles and does not currently distinguish them in prose.

**Strongly evidenced, and it should be said so:** REPROGPU's pinned reference outputs, KATs and WGSL
pins (recomputed byte-identically, with genuine *external* oracles in the Philox and FIPS vectors, and
an explicit statement that a pin is only a regression anchor); the 96-puzzle Silent Bug Hunt bank (189,658
+ 24,560 real Python probes, 96/96, every bank-level statistic reproduced); KeyFuse's brute-force ground
truth and every witness/necessity/collision aggregate; Warrant's entire 200-seed arena including the
digest; LGS's full simulation; and the 5,730-exercise execution verification. KeyFuse, Warrant and LGS
each carry an unusually good limitations section, and REPROGPU's `:352` and `:357` are models the other
papers should copy.

**Not evidenced at all, and it does not say so:** the entire Alibi Distance census, closure,
cross-validation, negative-result and audit evidence, because neither mining engine is in the repository;
and the BDL full-corpus census at exact counts, because the census artifact is absent and CI substitutes
a 240-problem 3σ sample with a ±10pp tolerance on one headline row.

**The structural point.** A gate that compares a recomputed value against a stored constant proves
determinism, not correctness. The repository has one honest sentence about this, at
`reprogpu.ts:352`, and it is the sentence every other paper needs:

> "The pins themselves are regression anchors: the same reference computes both the expected constant
> and the observed value, so a pin can only catch drift, and correctness rests on the external oracles
> and on the exactness argument, not on the pin."

Where a gate *does* compare against an **external** oracle — the Random123 Philox vectors, the FIPS
SHA-256 vectors, Node's Web Crypto digest, a brute-forced product enumeration, real Python execution of
a reference and a mutant — that is evidence. Where a gate compares against a constant the paper's own
pipeline produced — `FUNNEL`, `CENSUS_COUNTS`, `EXPECTED` — that is a drift detector. The papers should
say which of the two each gate is, per number, and the five proposed replacements in §3 (W4, W7, W16,
W17, W19) are all instances of that one distinction.

**Two things are worse than unverified.** First, the BDL abstract's 90.20% → 84.00% comparison, which
switches metric inside the sentence that reports the paper's own admitted deflation. Second, the REPROGPU
abstract's K5 "demonstrates", which is the same capability-overclaim shape that `18e11ca` and `c2feabf`
already had to walk back in that same paper. Both are internally checkable, which is worse than merely
unverifiable, and both are cheap to fix without touching a measured number.
