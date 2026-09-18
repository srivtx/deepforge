# Invention wave 41 — Alibi Distance

Research track, 2026-09-18. One invention: **Alibi Distance (AD)** — a measure of how far the
*nearest silently-passing wrong program* sits from a verified reference solution, plus the
deterministic procedure that mines it, reports it, and closes it.

Everything in §6 marked **observed** was produced by a throwaway engine (scratch files under
`/var/folders/.../T/opencode/w41/`, not committed) run over all 5,730 DeepForge problems with real
Python execution. Nothing else in the repo was written or changed. Nine problems could not be
analyzed (5 have fewer than 5 reference-evaluable probe inputs; 4 raised during mining). All
claimed numbers below are exact counts from that run, except where labeled approximate.

---

## 1. What it is

Auto-graded exercises are built on a finite projection: a reference program `f` and 3–5 test
cases. A program can agree with `f` on every shipped test and still be wrong — and the *closest*
such program is a measurable property of the exercise. Call it an **alibi**: it was at the scene,
but the evidence cannot convict it.

Formally, the **alibi distance** `α(p)` of a problem is the minimum number of single-edit
mutations of the reference that yields a program passing every shipped test while diverging from
the reference somewhere in a deterministic probe domain. `α = 1` means *a one-line slip passes the
entire suite and is behaviorally wrong somewhere*.

Three objects follow from the measure:

1. **The Alibi Ledger** — a per-problem, offline-computed record of the nearest alibi(s), a
   *witness* input where the alibi and the reference disagree, and the reference's output there.
   It is a statement of fact ("these two programs agree on all shipped inputs and differ here"),
   not a verdict of wrongness.
2. **Witness closure** — the corpus operation of appending `(witness, reference(witness))` to a
   problem's test set. One witness is derived from the alibi itself; no test generation, no LLM,
   no network. Measured: **one added test closes all radius-1 alibis for 59.7% of affected
   problems and kills 73.2% of all alibis corpus-wide.**
3. **The examined solve** — a product unit: a solve counts as *examined* when the learner passes
   the problem *and* can distinguish their accepted code from its nearest alibi (the "alibi duel").

Pitch in one sentence: *a verified exercise corpus can audit and tighten itself offline by mining
the nearest program that passes every shipped test but behaves differently — on DeepForge this
affects 46.1% of problems, and a median of one added test per problem removes most of it.*

---

## 2. Motivation

DeepForge verifies 5,730 solutions with real Python before shipping them. That guarantees the
*catalog* is correct. It guarantees nothing about the *tests*: passing `f`'s tests is a finite
condition, and the platform's honest evidence claim ("you solved it") is only as strong as the
distance from `f` to the nearest program the tests cannot distinguish from `f`.

This matters more, not less, in an LLM-free, server-free product. There is no model to reason
about a learner's intent and no server to hold back hidden tests. The only resources are the
reference implementation, local execution, and determinism — which are exactly the resources
needed to *compute* the aperture and to close it. The measure is also a content-quality signal
that does not require learners at all: it can run at build time.

---

## 3. The invention, formal

### 3.1 Setup

A problem is `p = (S, f, T)`:

- `S` — the natural-language statement (not machine-readable);
- `f : X → Y` — the reference program, partial (it may raise);
- `T = {(x_i, y_i)}_{i=1..k}` — shipped tests, `y_i = f(x_i)`, `k ∈ {3,4,5,6}` in this corpus.

Two step functions are carried by the problem's existing metadata: `eval_f(x)` (run `f` on `x`
with the platform's harness semantics: 1e-6 deep equality, time budget) and `pass(g, T)`.

### 3.2 Edit model `E`

A finite set of AST rewrite operators, each a *single* edit. The census used 11 families (24
concrete rewrites):

| family | rewrites |
|---|---|
| `cmp` | `<`↔`<=`, `>`↔`>=`, `==`↔`!=` |
| `bool` | `and`↔`or` |
| `bin` | `+`↔`-`, `//`↔`/`, `%`→`//`, `*`→`+` |
| `aug` | `+=`↔`-=`, `*=`→`+=` |
| `int` | integer constant `n` → `n±1` |
| `func` | `min`↔`max` |
| `idx` | subscript index `i` → `i±1` |
| `lenshift` | `len(x)` → `len(x)±1` |
| `negdel` | unary minus deletion `-x` → `x` |
| `notins` | wrap a comparison in `not (...)` |
| `notdel` | delete a `not` |

Distance `d(f,g)` is the minimum number of operator applications taking `f` to `g`. This is not
semantic distance; it is *slip distance* — the size of the human error class being modeled.

### 3.3 Probe domain `D`

A deterministic, per-problem bank `D(p)` of at most 48 call inputs, built from the shipped inputs
by perturbing one argument at a time (empty, singleton, reversed, duplicated, extended, shrunk,
negated, sorted, incremented; matrices also transposed and row-perturbed), deduplicated, shuffled
with `seed = md5(p.id)`, shipped inputs first. Only probes on which `f` succeeds are evaluable
(89.2% of bank entries on average).

### 3.4 Alibi set and alibi distance

Let `Pass(p) = { g ∈ E(f) : g compiles ∧ pass(g,T) }` (mutants that survive the shipped tests), and

```
Diverge(g) = { x ∈ D(p) : eval_f(x) ok ∧ ( eval_g(x) ≠ eval_f(x)  ∨  eval_g(x) fails/timeouts ) }
Alibi(p)   = { g ∈ Pass(p) : Diverge(g) ≠ ∅ }
α(p)       = min { d(f,g) : g ∈ Alibi(p) }   ∈ ℕ ∪ {∞}
```

A witness of `g` is any `w ∈ Diverge(g)`. **Near-miss aperture** is the event `α(p) = 1`.

### 3.5 Alibi Mining (the algorithm)

```
input: p = (f, T)
1. control: unparse(parse(f)) must pass T            (guards formatting side effects)
2. D  ← probe_bank(T.inputs, seed=md5(p.id), cap=48)
3. O  ← [eval_f(x) for x in D], keep indices where ok
4. M  ← sample ≤36 single-edit mutants, ≤6 per family, targets shuffled with seed=md5(p.id)
5. P  ← [m ∈ M : m compiles and passes T]
6. for m ∈ P: W(m) ← [x ∈ D_eval : eval_m(x) diverges from eval_f(x)]      # witness set
7. ledger[p] ← { (m, W(m)) : W(m) ≠ ∅ };  α(p) ← 1 if ledger[p] ≠ ∅
8. best_probe(p) ← argmax_{x∈D} |{m : x ∈ W(m)}|                          # max-coverage
9. closure(p)  ← greedy set cover of {W(m)} by probes; iterate until A1(p) empties
```

Cost on the real corpus: 106,081 mutants, 17,502 survivors, 7,727 alibis; roughly 4.5–5M Python
function calls; about 27 CPU-minutes, 4 minutes wall on 8 CPython workers. This is a build-time
content pipeline, not runtime work.

### 3.6 Witness closure

For a mined alibi `m` with witness `w`: append `(w, eval_f(w))` to `T`. This is sound by
construction relative to the *reference*: `f` itself still passes (its own output is the expected
value). The closure target is expressed as a radius guarantee: **r-closure** = no surviving alibi
within `r` edits of `f`, i.e. `α ≥ r+1` relative to the mined family.

### 3.7 The examined solve (product unit)

A solve is *examined* if the learner's accepted program `g` passes `T` and the learner correctly
identifies an input where `g` and its nearest mined alibi disagree (the alibi duel), or explicitly
declines when the two are probe-equivalent. The evidence it creates is behavioral: "I know what my
code is not." §6.5 reports a negative result about the duel's difficulty that matters for how it
should be used.

---

## 4. Formal properties

**P1 (witness soundness).** If `g` passes `T` and `g(w) ≠ f(w)` with `f(w)` defined, then
`g` fails `T ∪ {(w, f(w))}`; and `f` passes the augmented suite.
*Proof.* The new case is exactly `(w, f(w))`; `f` returns it, `g` does not. ∎
Consequence: hardening cannot reject the reference; it can only reject programs that differ from
it on an added input.

**P2 (monotonicity in tests).** For `T ⊆ T'`, `Alibi(p') ⊆ Alibi(p)` and `α(p') ≥ α(p)`.
*Proof.* `Pass` shrinks under a superset of tests; `min` over a subset is no smaller. ∎
Consequence: adding tests never *creates* alibis. The intervention is safe in the direction that
matters for grading strictness.

**P3 (`D`- and `E`-monotonicity; α is a lower bound on the domain-relative value).**
For `D ⊆ D'`, `α_{D'} ≤ α_D`; for `E ⊆ E'`, `α_{E'} ≤ α_E`.
*Proof.* `Diverge` is existential over `D`; enlarging `D` enlarges the alibi set. Same for the
reachable program set under a larger operator family. ∎
Consequence: the measured aperture (46.08% with 11 families and ≤48 probes) is a **lower bound**:
a wider operator set or probe domain can only find *more* radius-1 alibis. §6.4 tests the
probe-domain side directly.

**P4 (closure is well-defined and cheap in practice).** Greedy closure terminates in at most
`|Alibi|` probes and kills every mined alibi. Minimum witness cover is Set Cover (NP-hard), but the
observed instance is small: mean 1.594 probes, median 1, p90 3, max 7; 95.98% of affected problems
close within 3 probes.

**P5 (radius hierarchy).** `r`-closure guarantees `α ≥ r+1` *among programs reachable by the mined
edit family*; it does **not** guarantee `α ≥ r+1` over all programs, nor does it eliminate
radius-`r+1` alibis. §6.4 quantifies the leakage: after 1-closure, random two-edit programs still
survive at 8.56% versus 12.52% before.

**P6 (spec-ambiguity is not decidable from `(S, f, T)`).** Some alibis are legitimate alternative
readings of `S`, not bugs. Deciding spec-compliance from the machine-readable triple alone is
ill-posed because `S` is natural language. Therefore the ledger must report *divergence facts*, and
hardening must be gated by an authoring decision or a conservative rule (e.g., only harden alibis
whose divergence is a crash, a timeout, or a change of output beyond tolerance scale). This is not
a defect of the method; it is the honest boundary of what execution can prove.

---

## 5. Falsifiable predictions + thresholds, with observed outcomes

Predictions were formed before the corpus run and are reported with their outcomes. Thresholds are
the kill conditions: a prediction is dead if the bound fails.

| # | Prediction (kill condition) | Observed | Status |
|---|---|---|---|
| P1 | ≥40% of problems have a radius-1 alibi | **46.08%** (2,636/5,721) | survived |
| P2 | Per-mutant survival in the longest solution quartile ≥1.5× the shortest | **1.62×** (18.57% vs 11.45%) | survived |
| P3 | With length controlled (5–8 lines), per-mutant survival on 5-test problems is *not lower* than on 3-test problems | **15.76% vs 12.06%** (higher) | survived |
| P4 | One oracle-chosen witness kills ≥75% of a problem's radius-1 alibis | **73.2% corpus-wide**, 82.9% mean per-problem, 100% in 59.7% of problems | borderline-failed/survived (see §6.3) |
| P5 | A witness chosen on half the alibis kills ≥40% of held-out alibis | **48.35%** | survived |
| P6 | One witness reduces radius-2 silent survival by ≥20% relative | **31.6%** (12.52% → 8.56%) | survived |
| P7 | Feature-guided probe selection convicts in ≥1.5× fewer probes than random | **0.94×** (worse) | **falsified** |
| P8 | ≥70% of alibis admit a ≤2-literal input predicate with balanced accuracy ≥0.9 | **32.2%** full-bank, **32.8%** held-out; permutation control mean-max 0.881 | **falsified** |
| P9 | Geometric per-line law `P(α=1) = 1-(1-q)^L` | poor fit (observed 10.6/39.1/44.1/55.4/61.0/73.2/81.0% vs 12.4/23.0/33.4/45.2/58.5/74.0/89.9% across length deciles); mechanically confounded by mutant count | **falsified** |
| P10 | (human, untested) Duel-trained learners show ≥20% relative reduction in next-review failure on the dueled problem vs controls | not testable offline; needs n≥200 problem-learner pairs | outstanding |

P4 is called out honestly: the *aggregate* kill rate (73.2%) is below the 75% threshold, while the
mean-per-problem rate (82.9%) and the "fully closed" rate (59.7%) exceed it. The prediction as
written fails on the aggregate statistic.

---

## 6. Simulation protocol and observed results

### 6.1 Determinism and controls

- Seeds: `md5(problem_id)` for mutant-target shuffling and probe shuffling; fixed seeds
  `11, 5, 7, 99, 2026, 3, 41` for the resampling/audit scripts. Re-running produced byte-identical
  chunk files.
- Harness: same semantics as `scripts/py_verify.py` (real Python, 1e-6 deep equality, first `def`
  is the entry point).
- Time budget: 0.25 s per call; timeout counted as divergence only where the reference succeeded.
- Round-trip control: every problem's `ast.unparse(ast.parse(solution))` had to pass `T`, else the
  problem was skipped. This prevents formatting differences from inflating survival.
- Probe-bank artifact check: the same 300-problem sample re-run with `cap=120` (2.5× probes)
  gave 45.3% → 46.7% aperture (4 problems gained, 0 lost) — not a small-bank artifact.

### 6.2 Census (observed, all 5,730 problems; 5,721 analyzable)

Mutant survival by family (survivors / generated):

| family | gen | pass | rate |
|---|---:|---:|---:|
| `cmp` | 8,576 | 3,024 | 35.26% |
| `bool` | 1,801 | 552 | 30.65% |
| `int` | 29,624 | 7,682 | 25.93% |
| `func` | 955 | 186 | 19.48% |
| `negdel` | 1,924 | 276 | 14.35% |
| `idx` | 22,414 | 2,700 | 12.05% |
| `lenshift` | 8,778 | 887 | 10.10% |
| `bin` | 19,218 | 1,807 | 9.40% |
| `aug` | 2,812 | 165 | 5.87% |
| `notins` | 9,189 | 208 | 2.26% |
| `notdel` | 790 | 15 | 1.90% |
| **total** | **106,081** | **17,502** | **16.50%** |

7,727 of the 17,502 survivors are probe-divergent **alibis** (44.15% of survivors, 7.28% of all
mutants). 1,051 problems (18.4%) have survivors that never diverged in the bank (probe-equivalent
or divergent outside it).

Aperture by slice (observed):

| slice | n | P(α=1) | per-mutant survival |
|---|---:|---:|---:|
| Easy / Medium / Hard | 2,055 / 2,549 / 1,117 | 35.77% / 49.39% / 57.48% | — |
| lines ≤4 / 5–8 / 9–14 / >14 | 1,502 / 1,503 / 1,435 / 1,281 | 20.24% / 41.45% / 56.66% / 69.95% | 11.45% / 14.10% / 16.55% / 18.57% |
| tests 3 / 4 / 5 (marginal) | 1,089 / 2,998 / 1,581 | 35.35% / 43.63% / 57.62% | — |
| tests 3 / 4 / 5, lines 5–8 only | 294 / 840 / 361 | 36.73% / 42.98% / 41.83% | 12.06% / 14.13% / 15.76% |

Categories (P(α=1)): Statistics 60.24%, Time Series 58.89%, ML Fundamentals 58.61%,
Probability 58.33%, Graph Algorithms 53.76%, Algorithms 50.89%, Optimization 50.67%,
Data Structures 50.14%, Computer Vision 48.35%, Reinforcement Learning 41.23%, NLP 39.81%,
Linear Algebra 33.12%, Information Theory 32.78%, Calculus 28.80%, Deep Learning 25.93%.

Witness sets: mean 11.03% of evaluable probes, median 7.69%, p90 24.00%; only 0.57% of alibis have
a singleton witness set. Mean 2.93 alibis per affected problem (max 19).

### 6.3 Witness closure (observed)

- One oracle-chosen probe kills every alibi in **1,574/2,636 = 59.71%** of affected problems.
- Corpus-wide it kills **5,658/7,727 = 73.22%** of alibis.
- After one added test: problems with a radius-1 alibi **46.08% → 18.56%**; aggregate mutant
  survival **16.50% → 11.17%** (relative reduction 32.3%).
- Full greedy 1-closure: mean 1.594 probes, median 1, p90 3, max 7. Cumulative fraction fully
  closed: ≤1 probe 59.71%, ≤2 86.57%, ≤3 95.98%, ≤4 98.79%, ≤5 99.62%, ≤6 99.96%, ≤7 100%.
- Cross-validated (choose probe on half the alibis via a label hash, score the other half;
  n=1,332 problems with ≥2 alibis): held-out kill **48.35%**, oracle 71.96%, random probe 10.80%.
  So closure generalizes to *unseen* alibis well above chance but loses about a third of its
  oracle performance.
- Radius-2 generalization (n=120 affected problems, 24 random two-edit mutants each): silent
  survival 12.52%; with one oracle radius-1 witness 8.56% (−31.6% relative); with a random probe
  11.75% (−6.1%). Conditioned on problems with any radius-2 survivor: 13.78% → 9.42%.

### 6.4 The two negative results (observed)

**Duel probing does not learn.** Train/test split by problem (60/40). Feature weights were learned
on training witness sets (rate of each structural feature among witness probes, smoothed) and used
to rank probes on held-out problems; a uniform-random probe order was the control. Conviction
within 10 probes: random 63.3% (mean 4.36 probes when successful) vs feature-guided 59.5% (mean
4.42). The transferred feature policy is *slightly worse* than random; the predicted 1.5× advantage
is falsified. Consequently the duel is not an information-gain skill game as designed — it is a
short exposure exercise whose difficulty comes only from the small witness fraction (median 7.7%).

**Short predicates do not explain alibis.** Best ≤2-literal conjunctions over 21 structural input
features reached balanced accuracy ≥0.9 for only 32.2% of 671 alibis (median BA 0.807), and a
permutation control (best predicate for random subsets of the same size) reached mean-max BA 0.881,
with only 26.2% of real predicates beating the control max. A held-out split (predicate chosen on
even probes, scored on odd probes; 743 alibis with |W|≥3) gave ≥0.9 for 32.8% and beat the control
max in 53.8% of cases. The mechanism is real for some families (`second_zero`, `second_one`,
`any_empty`, `any_neg` recur), but the "automatic explanation" claim at the 70% threshold is dead.

### 6.5 Manual audit (author judgment, not blind, n=10)

Ten randomly sampled alibis were inspected with their diffs and witnesses:
`pr-039` dead empty-guard; `op-183` sign error in Expected Improvement (`best - mu` → `best + mu`);
`rl-259` boundary `<=0` → `<=1`; `rl-318` sentinel sign flip; `st-291` off-by-one guard leading to
division by zero; `ml-346` clip `1.0 - 1e-6` → `1.0 + 1e-6` (**immaterial**, a 1e-6 clip change);
`graph-043` `head < len(queue)` → `<=` producing an infinite loop (timeout divergence);
`graph-218` numerical threshold `theta >= 0` → `>= 1` (**subtle**); `ts-282` negative-value guard
`< 0` → `< -1`; `ds-270` ceil-division `-1` → `-2`. Eight of ten are plainly wrong; one immaterial;
one subtle. This supports, but does not prove, the coupling assumption that single-edit mutants
approximate human slips (DeMillo, Lipton, Sayward 1978).

---

## 7. Attempts to falsify (self-red-team)

1. **"It's just the probe bank."** Enlarged the bank 2.5× on 300 problems: aperture 45.3% → 46.7%
   (4 gained, 0 lost). Failed to falsify.
2. **"The closure is overfit to the mined family."** Cross-validation: 48.35% of held-out alibis
   still killed (vs 10.80% random). Partially falsified: closure loses ~32% of oracle performance
   on unseen alibis.
3. **"Witnesses don't transfer beyond radius 1."** Radius-2 test: relative reduction 31.6%, versus
   6.1% for a random probe. The *radius guarantee* fails; the *directional benefit* survives.
4. **"The mutation families are implausible."** Lowest-rate families are the destructive ones
   (`notins` 2.26%), highest are the classic slips (`cmp` 35.26%, `int` 25.93%). The family behaves
   as a slip-relevance ordering, not as noise.
5. **"Aliases are just equivalent mutants."** Undecidable in general; the manual audit, the
   bank-size check, and the radius-2 behavior all point to genuine divergence for most alibis. The
   residual probe-equivalent survivors (1,051 problems) are reported as-is and *not* claimed as
   alibis.
6. **"More shipped tests should mean tighter suites."** Not in this corpus after controlling for
   length: per-mutant survival is *higher* with 5 tests than 3 within 5–8-line solutions
   (15.76% vs 12.06%). The association is confounded, so this is not a causal claim about adding
   tests — but it kills the naive proxy "test count = tightness" for this corpus.
7. **"Feature-guided probing will make the duel a skill game."** Falsified (§6.4).
8. **"Short predicates will explain the failures."** Falsified against a permutation control
   (§6.4).
9. **"The per-line geometric law."** Falsified, and additionally confounded because the number of
   sampled mutants grows with solution length.

The most damaging finding for the *strong* claim is #2/#3: witness closure is effective, not
complete. The honest final claim is bounded: **1-closure removes the mined near-miss class at a
median cost of one test, and about half of what it removes generalizes to unseen near-misses.**

---

## 8. Limitations and failure modes

- **Spec ambiguity (the harmful case).** If an alibi is a legitimate reading of `S`, adding its
  witness hardens the suite against a *correct* solution. Mitigation: the ledger states divergence
  facts; hardening should be gated (author audit, or conservative classes: crashes, timeouts,
  gross numeric divergence). This is the strongest reason not to auto-ship closure unreviewed.
- **Relativization.** `α` is relative to the operator family `E` and the probe domain `D`; it is a
  lower bound on any domain-wide notion of alibi distance, and it is *not* semantic distance.
- **Probe domains can leave the intended domain.** Some witnesses are inputs the statement never
  promised (e.g., non-square matrices). The reference often handles them anyway; the audit
  suggests ~80% of these are still genuine, but the fraction is unknown in general.
- **Timeout = divergence.** Three audited examples relied on the 0.25 s budget. A timeout is a
  behavioral difference under the platform's budget, but it is machine-dependent; the ledger
  should record it as a separate divergence class.
- **Mutation–slip coupling is assumed, not measured.** No human false-pass data exists offline.
- **Python-only, first-`def`-only, pure functions.** The corpus is unusually friendly; no classes,
  no I/O, no randomness.
- **Compute.** ~27 CPU-minutes for the corpus plus probe execution; acceptable at build time,
  not per interaction.
- **Coverage.** Nine problems skipped; one in five problems has probe-equivalent survivors whose
  true status is unknown.
- **No human outcome data.** Everything about learning effects is predicted, not observed.

---

## 9. Novelty statement

Adjacent work, named honestly:

- **Mutation testing** (DeMillo, Lipton, Sayward 1978; survey: Jia & Harman 2011) and the
  **equivalent-mutant problem** are the parent technique. `α` is a minimum-distance statistic over
  the survival set.
- **STING** ("Are Benchmark Tests Strong Enough? Mutation-Guided Test Augmentation", 2026)
  generates surviving variants of a reference patch and augments the suite to kill them — the same
  *goal* as witness closure, with LLM-generated tests, on SWE-bench, and reports 77% of instances
  with a surviving variant. My closure differs in mechanism (the witness + reference output *is*
  the test; no generation) and in target (radius guarantee, educational corpus).
- **Examplar / conceptual mutation testing** (Prasad, Greenman, Nelson, Krishnamurthi 2024) uses
  curated "chaff" mutants to check whether *student-authored examples* pin the problem down.
  Alibi mining checks whether the *platform-shipped* suite pins the problem down, mines the
  chaffs automatically at minimum edit distance, and produces a corpus metric.
- **BugSpotter** (Pădurean, Denny, Singla, SIGCSE 2025) and "When AI Is Wrong on Purpose" (2026)
  generate buggy code and have students write failing tests. Their bugs are generated by an LLM
  and *fail* the suite (findable); an alibi *passes* the suite (silent). The duel practice object
  is theirs in spirit.
- **FPPgen** (Caraco, Lojo, Verdicchio, Fox 2024) uses mutation-based autograding of student tests,
  and **Katabench** ships planted faulty implementations as test-writing exercises — both are
  mutant-as-practice, not corpus measurement.
- **speccle ADR-0012** argues to act on the surviving mutant rather than the mutation score; a
  design note, not a metric.
- **Delta debugging** (Zeller & Hildebrandt 2002) minimizes a *known-failing* input; an alibi
  witness exists precisely because no shipped input fails.
- The **minimal pair** in linguistics is the conceptual ancestor of the witness; I found no
  program-education formulation of it as a corpus metric.
- Machine teaching (Goldman & Kearns 1995; Zhu 2015) asks which examples identify a concept; that
  literature is about example selection, not about measuring the aperture of shipped suites.

What I claim as new, with the honest caveat that my search was a handful of queries and I could
not verify absence: (i) the **radius/weakest-link metric** `α` for exercise tightness — minimum
edit distance to a silently-passing divergent program; (ii) the **first census** of near-miss
aperture on a large verified educational corpus, with per-operator and per-slice structure;
(iii) **deterministic witness closure** as a build-time corpus operation with measured cost and a
radius guarantee (the witness *is* the test); (iv) the **examined-solve** unit; (v) two clean
**negative results** (probe-policy transfer, predicate explanations) that save the next builder
from repeating them.

---

## 10. Cool use

**The Ghost Card, and a corpus that tightens itself while you sleep.**

1. **For the corpus (no learner needed).** At build time, run Alibi Mining over
   `src/data/problems`; write the ledger to a JSON keyed by problem id; append each problem's
   best witness as one extra test case (or a hidden test, in the app's grading path). Result:
   radius-1 alibis fall from 46.1% of problems to 18.6% for one test per problem, at zero runtime
   cost, zero network, zero LLM. That is a permanent, verifiable quality upgrade to the platform's
   core claim ("verified from scratch").
2. **For the learner.** After a solve, show the **Ghost Card**: the nearest alibi's diff, the
   witness input, the reference's output, and the ghost's output — a single card that says *"your
   code agrees with this one edit away from it on every test you passed, and disagrees here."*
   The learner's task is only to say what should happen at that input. The measured profile
   (63% of ghosts convictable within ten reasonable probes) says this is a 30-second ritual, not
   a puzzle — use it as a closing ritual that makes the boundary between "passed" and "knows"
   visible, and count it as the *examined solve*.
3. **For honest proof.** The profile line "examined solves" is behavioral evidence that cannot be
   earned by watching solutions: it is the difference between your code and its nearest twin,
   witnessed by execution. Certificates can carry the count and the ledger hash.
4. **For content authors.** The aperture table becomes a review queue: solve the 60%-aperture
   Statistics problems first. The `cmp` family alone (35% survival) suggests where new boundary
   tests matter most.

---

## Appendix A — reproduction hooks

The scratch engine and data live at
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w41/` (`engine.py`, `stats.py`,
`analyze2.py`, `analyze3.py`, `analyze4.py`, `analyze5.py`, `problems.json`, `chunk-*.jsonl`,
`*-out.txt`). They are not committed. Key constants:

- probe cap 48 (robustness re-run 120); per-call timeout 0.25 s; deep equality tolerance 1e-6.
- mutant cap 36, per-family cap 6, target order seeded by `int(md5(id)[:6], 16)`; probe shuffle
  seeded by `int(md5(id)[:8], 16)`.
- skip rules: unparse round-trip must pass the shipped tests; ≥5 reference-evaluable probes.
- witness divergence counts `raise`/timeout where the reference returned; reference failures on a
  probe drop that probe.

The core loop is 30 lines: enumerate single-edit targets, sample, run tests, run the bank, keep
survivors that diverge. Any independent implementation should reproduce the headline counts
(2,636 affected problems; 7,727 alibis; 5,658 killed by the best probe) to within the sampling
noise of a different operator set.

## Appendix B — headline observed numbers

```
problems                 5,730 total / 5,721 analyzable / 9 skipped
mutants                  106,081   passers 17,502 (16.50%)   alibis 7,727 (7.28%)
problems with >=1 alibi  2,636 / 5,721 = 46.08%
best single probe        5,658 alibis killed = 73.22%; fully closes 1,574/2,636 = 59.71%
after one probe          P(alibi problem) 18.56%; survival 11.17%
full 1-closure           median 1 probe, mean 1.594, max 7
cross-validated closure  held-out kill 48.35% (oracle 71.96%, random 10.80%)
radius-2                 12.52% -> 8.56% with one witness (random probe 11.75%)
duel probe policy        random 63.3% vs feature-guided 59.5% within 10 probes (falsified)
predicate explanation    32.2% at BA>=0.9, mostly chance-level under permutation control
manual audit (n=10)      8 clearly wrong, 1 immaterial, 1 subtle
```

---

## Errata & corrections (wave-41 review)

Reviewed 2026-09-18 by a theory verifier, an empirical verifier, and a red-team critic, independently
and against the scratch artifacts. Every finding below was reproduced. This section is ground truth
wherever it conflicts with the text above; original claims are quoted and located so the history
stays identifiable. **author** = the original chunk files (`w41/chunk-*.jsonl`, 5,721 analyzable
problems); **independent** = a from-scratch engine over the same corpus (5,725 analyzable; it also
analyzed the four problems the author run skipped).

### E1 — BLOCKER: P2 monotonicity is false as stated

**Original** (§4, P2): "For `T ⊆ T'`, `Alibi(p') ⊆ Alibi(p)` and `α(p') ≥ α(p)`."

**Corrected.** The claim holds only for a **fixed** probe bank `D` and **fixed** sampled mutant
family `M`: `Pass_M` shrinks under more tests, so `Alibi_{D,M}(p') ⊆ Alibi_{D,M}(p)` and
`α_{D,M}(p') ≥ α_{D,M}(p)`. Across different test sets it is false, because `D(p)` is rebuilt from
`T`: §3.3 perturbs one argument of each of the **first three** shipped inputs, dedupes, shuffles
with `seed = md5(p.id)`, caps at 48, and keeps only probes on which the reference succeeds. Adding
one test can remove probes (and their divergences) or add new ones.

**Counterexample (reproduced).** `la-029`, mutant `idx-@5`: with `T' = [x0] + T` for a probe `x0`
on which every sampled passer agrees, `D(T') \ D(T)` grows by **17 probes**, and the mutant passes
`T'` while diverging at `[[[4, 5, 6]], 1, 2]`.

**Consequences.** Read every closure statement as relative to a fixed `(D, M)`: "1-closure" and
"r-closure" mean "no surviving **mined sample** alibi", never the full single-edit space. §3.6, P5,
§6.3, §7, §10 are reworded accordingly.

### E2 — "closes all radius-1 alibis" is scoped to the mined sample

**Original** (§3.6, §5 P4, §10.1): "closes all radius-1 alibis"; "`α ≥ r+1`".

**Corrected.** Mining samples ≤36 single-edit mutants per problem, ≤6 per family, targets shuffled
by `md5(p.id)`. "All" means all 7,727 mined alibis, not all programs one edit from `f`. State the
sampling parameters and the `D` dependence (E1) wherever "all" appears; different seeds or caps
yield different survivor sets.

### E3 — Singleton-witness share is 22.78%, not 0.57%

**Original** (§6.2, §10.2, Appendix B): "only 0.57% of alibis have a singleton witness set."

**Corrected.** **22.78%** (1,760 / 7,727); independent 22.83%. The 0.57% came from
`stats.py:83`, which divided a per-alibi count by the **last** row's `bank_ok` instead of the row's
own denominator. The correction strengthens the duel-difficulty argument: the median witness
fraction stays 7.7%, and nearly a quarter of alibis are separated by a single bank input.

### E4 — Cross-validation denominator

**Original** (§6.3): "n=1,332 problems with ≥2 alibis".

**Corrected.** 1,786 problems have ≥2 alibis; 1,332 enter CV because the md5-parity split leaves one
side empty for the rest (independent engine: n=1,320). Held-out numbers use only problems with both
halves nonempty.

### E5 — P9 "ladder" is withdrawn

**Original** (§5 P9): geometric per-line law with deciles "10.6/39.1/44.1/55.4/61.0/73.2/81.0%" and
predicted "12.4/23.0/33.4/45.2/58.5/74.0/89.9%".

**Corrected.** Those numbers appear nowhere in the appendix and no single-`q` geometric law fits.
The verifier's independent length-decile recompute: **8.4 / 15.0 / 42.3 / 39.7 / 46.0 / 53.5 / 53.2
/ 60.5 / 65.9 / 76.3%** (mean lines per decile 2.0 / 2.8 / 4.4 / 5.7 / 7.4 / 8.9 / 10.9 / 13.7 /
17.9 / 29.9). The robust regularity is survival rising with solution length: shortest quartile
11.45% → longest 18.57% (**1.62×**; independent 11.50% → 18.63%), mechanically confounded by
sampled-mutant count per problem (decile ladder by `n_mut_gen`: 5.4 / 16.3 / 24.7 / 39.0 / 47.9 /
56.1 / 60.5 / 59.8 / 69.6 / 81.5%). State the regularity with the confound; delete the law.

### E6 — "~80% of out-of-domain witnesses are genuine" is cut

**Original** (§8): "the audit suggests ~80% of these are still genuine".

**Corrected.** Unsupported by the n=10 author audit, which did not sample for out-of-domain inputs.
Cut. The paper may say only that witnesses can leave the statement's promised domain and that the
curated practice set (E13) excludes such witnesses by curation.

### E7 — Precision nits

- **Inequality semantics.** "Equal" = the harness `_deep_eq` with `rel_tol = abs_tol = 1e-6`; a
  `raise` or timeout where the reference returned counts as a divergence; a reference failure on a
  probe drops that probe. Define `D_eval = { x ∈ D : eval_f(x) succeeds }` and `A1(p)` = the mined
  radius-1 alibi set.
- **"24 concrete rewrites."** Not derivable from the family table: 11 families, one direction for
  `cmp/bool/bin/aug/notdel/func/notins/negdel`, two for `int/idx/lenshift` per target node; the
  concrete count depends on the reference's AST. Reword.
- **"zero runtime cost."** False if a witness were shipped as a test: one more call per submission.
  Say "no network, no LLM, no model; one extra test call per submission if adopted".
- **Duel wording.** §6.4's 0.94× is a success-rate ratio; write "not better than random (63.3%
  random vs 59.5% guided conviction within 10 probes)", never "worse by 6%".
- **Appendix A reproduction.** Replace "within the sampling noise of a different operator set" with
  "headline rates within 0.2 pp" (E15).

### E8 — Oracle-chosen vs deployable closure

**Original** (§6.3, Appendix B, §10): "46.08% → 18.56% after one test".

**Corrected.** 18.56% is **oracle-chosen**: the witness is selected on the same alibi set it is
scored on. The prospective (cross-validated) implication is 46.08% × (1 − 0.4835) ≈ **23.80%** still
affected (independent: 45.94% × (1 − 0.4879) ≈ 23.53%). Report ~23.5–23.8% as the deployable number
and label 18.56% an oracle bound everywhere, including the paper abstract.

### E9 — Corpus counts

**Original**: 5,730 total / 5,721 analyzable / 9 skipped.

**Corrected.** The author run analyzed 5,721 (5 with <5 reference-evaluable probes; 4 raised during
mining: `ds-038/235/236/237`). The independent engine analyzed 5,725 (it handled those four).
Report both.

### E10 — Audits

**Original** (§6.5): n=10, "eight plainly wrong; one immaterial; one subtle".

**Corrected.** The author audit was not blind. The independent verifier ran a blind audit on a
distinct, independently sampled n=10 (selection method stated): **10/10 clearly wrong, 0
spec-valid**. Report both, state the selection method, and treat the strongest coupling evidence as
n=10; expand to n≥100 only if cheap.

### E11 — Coupling is a corpus property, not a learner claim

Mutation–slip coupling remains unmeasured at scale; the audits support but do not establish it.
Frame 46.1% as a property of the **corpus and edit model**, not of learners, and recommend (not
ship) a shadow-logging study that logs learner false-passes and compares them to the mined alibis.

### E12 — Auto-closure is blocked; no grading or certificate changes

Reproduced blockers: spec ambiguity means every witness needs author judgment; hidden tests and no
telemetry make false "wrong" verdicts silent; timeout witnesses are hardware-dependent (Pyodide vs
CPython). Therefore: no automatic modification of grading; any witness used in the product must be
visible, labeled, and must never gate a certificate; timeout divergences are excluded from shipped
content (E13). Maintenance, if mining is ever automated: content-hash caching and CI re-mining only
for changed problems.

### E13 — The examined solve / Ghost Card is cut

Reproduced problems: (i) alibis are mined from the reference solution, not the learner's code, so
the Ghost Card claim is false for any accepted `g ≠ f`; (ii) random probing already convicts 63.3%
within 10 probes, so "cannot be earned by watching solutions" is overclaimed; (iii) it would add a
third post-solve gate. Cut both. The replacement shipped this wave is **Silent Bug Hunt**: a
standalone, optional practice route using already-mined alibi mutants as content (they pass every
shipped test, so they are strictly sharper than existing spot-the-bug content). It never touches
grading, review, or certificates.

### E14 — Novelty, restated

Witness closure is textbook mutation-test augmentation (DeMillo et al. 1978; STING 2026). The
genuinely new parts are: (i) the first education-corpus census of radius-1 silent survivors; (ii)
the radius/weakest-link framing `α` as a corpus statistic; (iii) the blind audits; (iv) two clean
negative results (probe-policy transfer, predicate explanations). Say this plainly; do not claim
closure as novel.

### E15 — Independent replication

From-scratch engine over the same corpus: 105,425 mutants / 16.57% pass / 45.94% P(α=1) / 73.25%
best-probe kill / 48.79% held-out vs author 106,081 / 16.50% / 46.08% / 73.22% / 48.35%. All
headline rates inside 0.2 pp. Trust the census.

### E16 — P4 threshold bookkeeping

P4's aggregate 73.2% (5,658/7,727) is below its own 75% kill threshold; the mean per-problem rate
(82.94%) and fully-closed rate (59.71%) exceed it. The prediction fails as written on the aggregate
statistic and survives on the per-problem statistic. Keep the split verdict; do not average them.
