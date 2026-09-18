# Invention wave 42 — Behavioral Delta Ledger (BDL)

Research track, 2026-09-18. One invention: the **Behavioral Delta Ledger** — a local-first data
structure and instrument that stores, for every submission on an exercise, a hidden *behavioral
signature* of the learner's program relative to the reference solution, so that each edit yields an
execution-grounded delta (what it fixed, what it broke, whether it changed anything at all),
persistent blind spots become named coordinates, and the learner's own saved wrong programs become
replayable review content.

Everything in §6 is from a throwaway engine run over the real 5,730-problem DeepForge corpus with
real Python execution (scratch files under
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w42/`, not committed). Nothing else in
the repo was written or changed. Two problems of this wave's own method were found and fixed during
the run (**argument aliasing**, §4 P6; **nonlocal rename**, §5 H1) and are reported as findings, not
hidden. All numbers below are exact counts from the final clean run unless labeled simulated or
illustrative.

---

## 1. What it is

A learner on DeepForge presses **Run** many times per problem. Today that action produces one bit of
information — pass/fail — and leaves no trace: the browser keeps only the latest source
(`progress.ts` stores one `savedCode` per problem). The learner cannot see whether their last edit
fixed *anything*, changed nothing, or broke a case that used to work; the platform cannot see which
wrong answers recur; and a former wrong version is gone forever.

BDL keeps a bounded ledger per problem:

1. **Hidden behavioral signature.** For problem `p = (S, f, T)` (statement, reference, shipped
   tests), build a deterministic **probe basis** `B(p)` of `n ≤ 48` inputs by perturbing the shipped
   test inputs (one argument at a time), excluding the shipped inputs themselves, seeded by
   `md5(p.id)`. Execute the learner's submission `g` on `B(p)` and record a ternary signature
   `σ(g) ∈ {0,1,2}^n` — `0` agrees with the reference, `1` wrong value, `2` raises/times out. The
   basis is never shown; only aggregate deltas are.
2. **Delta.** Between consecutive submissions, `Fix = {σ_{i-1}≠0, σ_i=0}`, `Break = {σ_{i-1}=0,
   σ_i≠0}`, `Impact I = |Fix|−|Break|`, `Churn C = |Fix|+|Break|`. A **ghost edit** is an edit whose
   text changed while `C = 0`.
3. **Residual coordinates.** The **cold set** `R = {j : σ_i[j]≠0 for every one of the last k
   attempts}` is the learner's *persistent* blind spot on that problem; projected onto probe
   families it becomes a cross-problem **residual family profile**.
4. **Bug Replay.** A saved wrong version becomes a review unit: the learner edits *their own old
   program*, and the platform reports the replay's hidden delta against that old version. This
   turns error history into content that otherwise does not exist on the platform.
5. **Residual-targeted review.** When the spaced scheduler (`LGS`, wave 40) says *when* to review,
   BDL can choose *what*: problems whose hidden basis discriminates the learner's residual
   families.

Pitch in one sentence: *an offline platform can turn every Run into execution-verified memory — a
per-edit behavioral diff, a ghost-edit detector, a persistent blind-spot profile, and a shelf of
your own bugs to replay — all from local Python, with no server, no LLM, and no new dependencies.*

---

## 2. Motivation

The platform's evidence for learning is a test verdict. Wave 41 showed the verdict is not the same
as correctness (46.1% of problems admit a silently-passing divergent program). This wave attacks
the *other* half of the same problem: the learner and platform have no memory of the **process**.
Five concrete gaps:

- **No partial signal.** Passing 3 of 4 tests, 3 of 4, 3 of 4… the learner cannot tell if they are
  one edge case or one rewrite away. A closeness count over hidden behavior answers "how far am I,
  really?" without revealing the witness.
- **No edit attribution.** The moment after a Run is the moment of maximum attention, and the
  platform says "wrong" with no statement of what the edit did. Fix/broke attribution is the single
  cheapest honest diagnosis available offline.
- **Futile edits are invisible.** Novice tinkering (edit–run loops that change nothing) is a known
  phenomenon (Jadud; "haphazard editing"). Nothing in DeepForge can detect it because it never
  compares behavior across submissions.
- **Blind spots never become objects.** `reviewQueue` schedules *problems*; nothing represents
  *which behavior* the learner keeps getting wrong, so review cannot target it.
- **The learner's own bugs are thrown away.** Every product in the space stores a reference and
  tests; none stores the learner's wrong programs as future practice. That is the cheapest new
  content in existence: it is already written, and its failure mode is execution-verified.

BDL is intentionally *formative only*: it changes no grading path, no review interval, no
certificate (wave 41's E12/E13 blockers are respected). Its claims are about feedback and content,
not about assessment.

---

## 3. The invention, formal

### 3.1 Objects

- `p = (S, f, T)`; `T = {(x_i, y_i)}`, `k ∈ {3..6}` shipped tests.
- **Probe basis** `B(p) = (b_1, …, b_n)`, `n ≤ 48`, each `b_j = (args_j, fam_j)`: `args_j` is a
  positional-argument list obtained from the input of one of the first three shipped tests by
  perturbing exactly one argument; `fam_j` is the perturbation family (e.g. `empty`, `zero`,
  `neg`, `reverse`, `sort`, `dup`, `inc`, `dbl`, `transpose`, `rowrev`, `rowdup`, `flip`,
  `sempty`, `srev`, …). Exact shipped inputs are excluded. Candidate list is shuffled with seed
  `int(md5(p.id)[:8], 16)`; duplicates dropped; the first `n` kept. Probes where `f` fails or times
  out are dropped (they define no answer).
- **Fresh-copy call semantics.** Every call executes `g(*deepcopy(args_j))`. This emulates the
  browser harness (fresh JSON per test) and is *required*: 8 of 5,682 references mutate their
  argument objects (§6.2, P6).
- **Signature** `σ(g) ∈ {0,1,2}^n`:
  ```
  σ_j(g) = 0  if g(·) returns and deep_eq(g(args_j), f(args_j))     (1e-6, harness equality)
         = 1  if g(·) returns a different value
         = 2  if g(·) raises, times out, or the probe has no answer
  ```
- **Ledger** `L_p ⊆ (h_i, σ_i, b_i, τ_i, src_i)` — a ring of the last `m ≤ 8` attempts on `p`:
  code hash, signature, test bitmask, timestamp, and (for wrong attempts, opt-in) the source.
- **Delta** from `σ` to `σ'`:
  ```
  Fix    = { j : σ_j ≠ 0, σ'_j = 0 }        Break = { j : σ_j = 0, σ'_j ≠ 0 }
  Impact = |Fix| − |Break|                  Churn = |Fix| + |Break|
  κ(σ)   = |{j : σ_j = 0}| / n              (closeness)
  ghost  = (src changed) ∧ Churn = 0
  ```
- **Cold set** `R_p = { j : σ_i[j] ≠ 0 for all i ∈ last k attempts }`, `k = 3`. Its family
  projection `ρ_p = histogram({fam_j : j ∈ R_p})`. Corpus-wide `ρ = Σ_p ρ_p` is the learner's
  residual profile.
- **Replay unit**: `(p, src_i)` for any attempt with `κ(σ_i) < 1`. Outcome: pass/fail on `T`
  (visible), plus `Δ` against `σ_i` (hidden), plus whether each cold dim was fixed.

### 3.2 Runtime algorithm

```
on Run(g) with cached last attempt a = (σ, src, b):
    σ'  ← signature(g, B(p), fresh-copy)        # n reference-behavior calls
    if flaky(σ', rerun=2): suppress delta card   # honest guard for nondeterministic code
    if b' ≠ b or κ(σ') < 1 or a.churn > 0:
        card ← delta(σ, σ', families)            # "fixed 5 (reverse), broke 1 (empty)"
        if (src ≠ a.src) and Churn == 0: card ← "no behavioral change"
        show(card)                                # counts + families only, never witnesses
    append L_p ← (hash(g), σ', b', now, src'_if_wrong)
    if κ(σ') < 1: offer "save for replay"         # opt-in storage of the wrong source

on Replay(p, src_i):
    present src_i as the editor content, tests as usual
    on Run(g'): show test result + delta vs σ_i (fix/broke by family, cold dims fixed?)

on Review(slot):
    if LGS wants an auxiliary item and ρ has a top family F:
        pick argmax_p Σ_{f∈top(ρ)} min(1, disc_p[f] / 4)
        where disc_p[f] = # sampled family-f slips visible on B(p)   (precomputed at build)
```

### 3.3 Defaults, complexity, determinism

| Parameter | Default | Note |
|---|---|---|
| basis cap `n` | 24 runtime, 48 build | 24-probe basis sees 91.8% of silent slips (§6.6) |
| perturbation sources | first 3 shipped inputs | one argument at a time |
| seed | `int(md5(p.id)[:8], 16)` | stable across machines and sessions |
| equality | 1e-6 deep equality | same as `scripts/py_verify.py` / Pyodide |
| timeout | 0.25 s per call | counted as state 2 where `f` succeeded |
| ledger ring `m` | 8 signatures; ≤3 wrong sources ≤4 KB each | ≈100 B/problem signatures; sources opt-in |
| flake guard | 2 runs; suppress card on mismatch | dead-simple nondeterminism shield |

Cost: `n` fresh-copy function calls per Run (cached reference answers; basis construction is local,
no network). Measured CPython: 24 probes median **0.07 ms**, p99 **0.49 ms**, max 2.66 ms over 200
problems (§6.6). Storage: trits fit in a byte each; the ledger is trivially bounded. Determinism:
the signature is a pure function of `(g, p)` under fresh-copy semantics; measured flakes **0/5,682**.

---

## 4. Formal properties

**P1 (determinism).** If `g` is a deterministic function of its arguments, `σ(g)` is a deterministic
function of `(g, B(p))`, and `B(p)` depends only on `(p.id, T)`. *Measured:* running the reference
twice on all 5,682 analyzable problems gave zero signature flakes under fresh-copy semantics.

**P2 (ghost exactness).** If two source texts have identical behavior on every probe (including
"raises the same way"), `Churn = 0`; the converse is false (probe-blind edits exist, §9). Therefore
a ghost edit is *proof* that nothing observable to the basis changed, never proof of futility in
the learner's mind. *Measured:* comment/whitespace insertion and consistent local renaming produced
`Churn = 0` on 5,682/5,682 and 4,680/4,680 applying problems.

**P3 (sandwich).** `Churn` is a lower bound on the true behavioral difference between the two
versions (any difference outside `B(p)` is invisible). It is **not** an upper bound on shipped-test
changes, because `B(p)` excludes the shipped inputs themselves: an edit can flip a test while
churning zero hidden dims, and vice versa (`Fix` can be positive while a test regresses; §6.4). The
delta card is therefore an attribution aid, never a score.

**P4 (relative ordering).** For fixed `B(p)`, `κ` orders programs by hidden-basis agreement; the
ordering is invariant to presentation order, machine, and session. It is *not* a correctness
probability.

**P5 (no grading surface).** BDL touches no judgment: test verdicts, review scheduling, and
certificates are byte-identical to the current app. The instrument's outputs are advisory cards and
opt-in replay content. (Wave 41's blockers make this non-negotiable.)

**P6 (fresh-copy requirement).** Probe execution must pass a fresh deep copy of the probe arguments
on every call. In-place algorithms mutate their arguments, and a shared-object protocol makes
signatures depend on call history. *Measured:* 8/5,682 (0.14%) references mutate arguments
(al-097, al-252, ds-138, ds-188, ds-298, graph-036, graph-057, graph-273); the shared-object
protocol flakes on 9 problems and disagrees with fresh-copy on 8, the fresh-copy protocol on 0.

**P7 (storage bound).** With `m = 8`, `n ≤ 48`, and optional sources capped at `3 × 4 KB`, a problem
costs ≤ ~12.3 KB in the pathological case and ~100 B without sources. A learner with 300 attempted
problems and sources opt-in on all of them stays under 4 MB, near the practical localStorage budget;
the design therefore makes sources opt-in per attempt ("save this bug") rather than automatic.

---

## 5. Falsifiable predictions + thresholds, with observed outcomes

Predictions were written before the final clean run (the pilot informed H1's protocol detail and the
existence of the aliasing issue; all thresholds are as stated). Kill conditions are in the cell.

| # | Prediction (kill condition) | Observed | Status |
|---|---|---|---|
| H1a | Fresh-copy reference signatures are flake-free on 100% of problems (kill < 99.5%) | **0/5,682** | survived |
| H1b | Comment/whitespace and consistent-rename transforms have `Churn = 0` on 100% (kill < 99%) | **0/5,682**, **0/4,680** | survived |
| H2a | ≤ 15% of sampled single-edit mutants are behaviorally invisible on the hidden basis (kill > 25%) | **10.23%** (9,041/88,357) | survived |
| H2b | `cmp` and `int` edits are the *least* invisible; deletion edits (`notdel`, `negdel`) the most (kill: ordering reversed) | **reversed:** `cmp` **most** invisible (24.75%), `notdel` least (1.47%) | **falsified** |
| H3a | ≥ 50% of test-passing mutants are visible on the hidden basis (kill < 30%) | **45.23%** (6,574/14,534) | **failed (near)** |
| H3b | ≥ 35% of problems carry at least one test-passing, hidden-visible mutant (kill < 20%) | **44.40%** (2,523/5,682) | survived |
| H4a | A 16-probe basis preserves the *sign* of the 48-probe impact on ≥ 80% of edit steps (kill < 65%) | **96.19%** (n=16), **97.83%** (n=24) | survived |
| H4b | A 24-probe basis estimates the 48-probe agreement rate within ±0.10 for ≥ 85% of edit steps (kill < 70%) | **88.4%** within 0.10; 68.9% within 0.05; median error 0.024 | survived |
| H5a | Hidden impact sign agrees with the same edit's test-delta sign on ≥ 70% of steps, AUC ≥ 0.7 (kill < 60%, AUC < 0.6) | **90.20%, AUC 0.903** (climb); 87.79%, AUC 0.854 (random) | survived |
| H5b | Breaking hidden dims raises the odds of a next-attempt test regression by ≥ 2× (kill < 1.3×) | **1.14×** (climb), **1.37×** (random) | **falsified** |
| H6a | ≥ 40% of 10-step walks end with ≥ 4 cold dims (kill < 25%) | **49.8%** (climb), **74.7%** (random) | survived |
| H6b | In ≥ 40% of those walks the cold set is family-concentrated (≥ 60% one family, ≥ 1.5× basis share) (kill < 25%) | **1.72%** (climb), **1.15%** (random) | **falsified** |
| H7 | Residual-targeted selection reaches mastery in ≥ 25% fewer problems than a fixed category track (kill < 10%) — synthetic model, §6.7 | **96.1% fewer** (mean 3.9 vs 100.3) | survived, model-bound |
| H8 | 24-probe signature latency ≤ 100 ms p99 in CPython (kill > 200 ms) | **p99 0.49 ms**, max 2.66 ms, n=200 | survived (Pyodide untested) |

Three of thirteen predictions failed. One failure (H2b) is a wrong theory of what the basis sees;
one (H5b) is a mean-reversion artifact in simulated traces; one (H6b) kills the strong
"your blind spot is one coherent family" story and is replaced by a weaker, statistically strong
aggregate statement (§6.5).

---

## 6. Simulation protocol and observed results

### 6.1 Corpus and protocol

All 5,730 problems from the wave-41 `problems.json` dump (identical to the shipped corpus), real
Python 3.13.7, the platform's own equality semantics (1e-6 deep equality, first `def` as entry),
0.25 s per call, 8 worker processes. Controls: `ast.unparse(ast.parse(solution))` round-trip must
pass the shipped tests; probes where the reference fails are dropped; problems with fewer than 5
evaluable probes are skipped (**48 skipped; 5,682 analyzable**). Basis sizes: min 5, p25 22,
median 34, p75 45, max 48. Mutant sampling: wave-41 edit families (`cmp`, `bool`, `bin`, `aug`,
`int`, `func`, `idx`, `lenshift`, `negdel`, `notins`, `notdel`), ≤ 4 targets per family, ≤ 24 per
problem, target order shuffled by the problem seed.

### 6.2 The aliasing discovery (methodological, observed)

Mid-run, one problem (`graph-273`, a push-relabel discharge step) produced inconsistent signatures.
Cause: it mutates `flow`/`height`/`excess` lists in place, and the probe protocol reused argument
objects. A dedicated pass over all 5,682 problems compared shared-object vs fresh-copy execution:
**8 references mutate arguments**; the shared-object protocol flakes on 9 problems and disagrees
with fresh-copy on 8; the fresh-copy protocol flakes on **0**. Every number in this document uses
fresh copies. This is the kind of quiet protocol bug that would make a learner-facing delta card
lie; it is a property of any probe-based instrument (wave 41's engine did not detect it). A second
bug, in the *transform check* rather than the instrument, was found the same way: the
consistent-local-rename probe initially reported churn on two nested-function problems because
`nonlocal` declarations were not renamed with the variable. After the fix, rename churn is 0
everywhere (4,680/4,680). The rename check is the ghost detector's false-positive guard, so this
mattered.

### 6.3 Census: what the hidden basis sees (observed, 5,682 problems)

- 88,357 sampled mutants; **9,041 invisible (10.23%)**; 2,809 problems (49.4%) have at least one
  invisible mutant; **0** problems have *all* sampled mutants invisible; 2,818 (49.6%) have all
  sampled mutants visible.
- Per-family invisibility (generated / invisible / rate):

| family | gen | invisible | rate |
|---|---:|---:|---:|
| `cmp` | 7,740 | 1,916 | **24.75%** |
| `func` | 898 | 158 | 17.59% |
| `int` | 23,830 | 3,884 | 16.30% |
| `negdel` | 1,751 | 164 | 9.37% |
| `idx` | 17,424 | 1,402 | 8.05% |
| `bool` | 1,670 | 132 | 7.90% |
| `lenshift` | 8,258 | 452 | 5.47% |
| `aug` | 2,601 | 121 | 4.65% |
| `bin` | 15,267 | 669 | 4.38% |
| `notins` | 8,170 | 132 | 1.62% |
| `notdel` | 748 | 11 | 1.47% |

  Comparison swaps are the *most* probe-blind family (24.75%): `<=`↔`<` often changes nothing on
  the generated inputs, which is exactly the boundary class wave 41 found sliding past tests.
- **Silent slips:** 14,534 mutants (16.45%) pass all shipped tests — an independent replication of
  wave 41's 16.50%. Of those, **45.23% are hidden-visible** (the ledger sees them), 54.77% are
  invisible to both tests and the 48-probe basis. 63.36% of problems carry a test-passing mutant;
  **44.40% carry one the ledger sees** (wave 41's P(α=1) was 46.08% on a basis that included the
  shipped inputs; the agreement is expected and is a cross-check, not a new discovery).
- Problem sensitivity (mean mutant churn fraction): p10 0.283, median **0.551**, p90 0.838.

### 6.4 Edit walks: deltas, ghosts, and what predicts tests (observed, 699 walks)

Three policies over a stride-24 sample (233 walks each; step counts 2,330 / 2,330 / 2,796):

| policy | start | step | ghost edits | of ghosts: correct-unchanged | of ghosts: same wrong behavior |
|---|---|---|---:|---:|---:|
| `random` | random failing single-edit mutant | random single edit | **51.16%** | 0.50% | 99.50% |
| `climb` | same | edit maximizing tests passed | **48.37%** | 2.93% | 97.07% |
| `revert` | same | alternating edit/undo | **33.98%** | 2.53% | 97.47% |

Ghost edits are common in simulated traces, and almost all of them are "the program stays wrong in
exactly the same way" — the behavioral definition of a futile tinkering step. Correct-unchanged
ghosts are rare in these policies only because the walks start broken; for a learner polishing a
nearly-passing solution they would be the common case, and the card reads *"all tests pass, hidden
behavior unchanged"*.

Same-edit prediction: hidden impact sign agrees with test-delta sign on **90.20%** of climb steps
(AUC 0.903) and 87.79% of random steps (AUC 0.854). The hidden basis is a genuinely informative
proxy for the graded contract, not a decoration. The *next*-edit version of this prediction is
anti-correlated (AUC 0.241): after a big hidden fix the next random edit more often breaks tests —
regression to the mean in a random walk, reported so nobody mistakes it for signal.

### 6.5 Residuals: persistence yes, per-walk coherence no (observed)

Cold-set size after 10 steps: climb median **3** (p90 29), random median **13** (p90 34); walks with
≥ 4 cold dims: **49.8%** (climb) / **74.7%** (random). The pre-registered family-coherence
prediction H6b is dead: a single family covering ≥ 60% of the cold set with ≥ 1.5× excess occurred
in only **1.72% / 1.15%** of those walks.

A weaker aggregate structure was found *post hoc* and is reported as such (within-walk permutation
null, 300 draws, 5,682 cold dims; z = (observed − null mean)/null sd):

- **Over-indexed in cold sets:** `sext` z=+3.1, `rowdup` +4.7, `sort` +3.7, `rowrev` +3.2,
  `reverse` **+7.1** (share 5.33% vs 3.95%), `dbl` +4.7, `inc2` +6.9, `inc` **+8.2** (13.45% vs
  11.45%), `dup` +5.5, `transpose` +2.8, `rsort` +3.3, `extend` +3.4.
- **Under-indexed:** `empty` **z=−20.5** (0.56% vs 3.85%), `zero` −11.1, `zero1` −8.5, `zeros`
  −5.7, `negone` −3.6, `sempty` −2.7.

In these simulated traces, persistent blind spots concentrate on *structural transformations*
(reversal, duplication, rescaling, reordering) and almost never on *degenerate empties*: random
mutants of the reference rarely damage the guard clauses that empty inputs exercise, while they
frequently damage index/accumulator logic that reversed or duplicate inputs expose. This is a
statement about the corpus and the edit model, not about human learners.

### 6.6 Sub-basis sufficiency and cost (observed)

On a stride-12 sample (477 problems, 549 silent slips visible on the full basis): a **16-probe**
basis sees **81.2%** of them, a **24-probe** basis sees **91.8%**. Delta-step sign agreement is
96.19% (16) / 97.83% (24); agreement-rate error is within ±0.10 for 84.7% (16) / 88.4% (24) of
steps. Runtime on 200 problems, 24 fresh-copy probes: median 0.07 ms, p90 0.16 ms, p99 0.49 ms,
max 2.66 ms. Runtime defaults to n=24; build-time QA can use 48.

### 6.7 Residual-targeted review (synthetic cohort, illustrative)

A synthetic cohort (400 learners, seed 20260918) with three weak edit families, mastery gain
proportional to the number of visible family slips a problem exposes: a fixed category track needs a
mean of **100.3** problems (median 62; 47/400 hit the 300 cap), random problems **58.2**, and
residual-targeted greedy **3.9** (median 4) — a **96.1%** reduction. The model is chosen, not
measured; the number is an upper bound on what content routing could buy if practice credit scales
with discriminating coverage, and it is not evidence of human learning.

---

## 7. Attempts to falsify (self-red-team)

1. **"It's just wave 41's hidden probes, relabeled."** Partly true and stated in §9: the
   *visibility* phenomenon is wave 41's, and this run replicates it (44.40% vs 46.08%). What is new
   is the object: the delta between two of the learner's own versions, the ledger, ghost detection,
   residuals, replay, and review routing. Falsifiable difference: wave 41 mines mutants of the
   reference and needs the reference to *find* a witness; BDL needs only the learner's two
   consecutive programs plus a basis, and its questions are about transitions, not identities. If a
   critic shows a shipped system that surfaces per-edit hidden behavioral deltas to learners, the
   novelty claim is dead.
2. **"The basis leaks or can be gamed."** The basis is deterministic and client-side, and the
   reference solution is shipped in the bundle (`solution` is part of every problem and "Show
   solution" exists). A learner who wants to cheat can read the reference and copy its behavior.
   BDL therefore is not an assessment device and never gates anything; its value is feedback. This
   is a design decision, not an oversight (P5).
3. **"Spec ambiguity makes the meter lie."** Some hidden probes leave the statement's promised
   domain (wave 41 P6), and a legitimate alternative reading of an ambiguous statement will show
   fewer agreements. Mitigation: counts and families only, no witness values, no pass/fail, no
   certificate coupling, and the card is labeled a behavior check. The residual risk is real and is
   the strongest reason not to turn BDL into an exam.
4. **"The ghost rate is inflated by broken programs."** Yes — 97–99.5% of simulated ghost edits are
   "same wrong behavior", mostly because the walk starts from a broken mutant and edits keep it
   broken in the same way. The claim is therefore *not* "50% of human edits are futile"; it is "the
   instrument detects behavioral no-ops exactly, and in simulated edit traces they are frequent."
   The human rate is unmeasured (§8).
5. **"Residual coordinates are not coherent."** Confirmed by H6b: per-walk cold sets are almost
   never dominated by one family (1.2–1.7% vs the predicted 40%). Only the aggregate enrichment is
   significant, and it is post hoc. Any product copy that says "your blind spot is *one* thing" is
   unsupported; the supported copy is "your blind spots over-index these families".
6. **"Hidden impact should predict future test failures."** Falsified in the strong form (H5b:
   ratio 1.14–1.37×, not ≥ 2×). The honest use of the delta card is retrospective attribution
   ("this edit did X"), not forecasting.
7. **"The 24-probe basis is too small."** It sees 91.8% of the silent slips the 48-probe basis
   sees, preserves impact sign 97.8% of the time, and estimates agreement within ±0.10 for 88.4% of
   steps. That is sufficient for a feedback meter and not sufficient for a verdict; the design uses
   it only for feedback.
8. **"The ledger's own blind spot invalidates residual claims."** It bounds them: 10.23% of
   single-edit slips are invisible to the basis, and 8 problems (0.14%) mutate their inputs at all —
   a class the fresh-copy protocol now handles but which any reimplementation must also handle. The
   residual set is "persistent *visible* divergence", not "all error".
9. **"Nondeterministic learner code will poison the ledger."** Guarded by a two-run flake check
   that suppresses the card; the corpus itself produced zero flakes across 5,682 references, but
   learner code is not the corpus (e.g. `random` without a seed). Suppression is the honest default.
10. **"Median 34 probes means many problems get a weak basis."** True: basis size is bounded by the
    number of distinct single-argument perturbations of 3–5 small inputs, and 48 problems have
    fewer than 5 evaluable probes and are skipped entirely. The census numbers condition on the
    5,682 problems with a usable basis; nothing is claimed for the 48.

---

## 8. Limitations and failure modes

- **No human data.** Every learner-behavior number in §6.4–6.7 comes from simulated policies or
  synthetic cohorts. Whether real learners produce ghost edits at these rates, whether fix/broke
  cards help, whether replay improves retention: all unmeasured. A shadow-logging study (log
  (σ_{i-1}, σ_i) pairs locally and compare against the simulated distributions) is the first
  experiment a human cohort should run.
- **Probe-blindness is measurable and real.** 10.23% of single-edit slips leave no trace on the
  basis; `cmp` slips are the blindest (24.75%). A learner can pass tests, pass the meter, and still
  be wrong; the ledger shrinks the aperture, it does not close it.
- **Spec ambiguity.** Hidden probes can be outside the stated domain; counts may penalize a
  legitimate reading. No witness values are shown and nothing is graded, but the card can still be
  misleading on ambiguous exercises.
- **Algorithm bias by family names.** The perturbation families and the mutation families are
  corpus-engineering choices; the enrichment result (§6.5) is relative to them.
- **Pyodide performance untested.** CPython latencies are sub-millisecond; Pyodide is typically
  10–50× slower, so n=24 should be profiled on a mid-range phone before shipping. The flake guard
  doubles the cost on the first run of a version.
- **Storage pressure.** Sources are opt-in and capped, signatures are cheap; still, the ledger adds
  one more localStorage key family and must join the existing backup/export key inventory.
- **The reference is visible.** "Show solution" means the meter cannot certify anything; it is a
  mirror, not a lock.
- **Residual semantics.** The residual enrichment is a property of the edit model and the corpus;
  calling it a "misconception profile" for a real learner would be an overclaim. Call it
  "persistent visible divergence by perturbation family".
- **Corpus scope.** Pure, first-`def`, JSON-valued functions; no classes, I/O, or randomness in the
  references. The semantics of the signature on learner code returning non-JSON objects is defined
  by deep equality but untested at scale.

---

## 9. Novelty statement

Adjacent work, named honestly:

- **Wave 41 / Alibi Distance** (this project): hidden-probe divergence of reference mutants,
  witness closure, Silent Bug Hunt. BDL reuses the probe-divergence idea, replicates its central
  rate (44.40% of problems carry a hidden-visible silent slip vs 46.08% P(α=1)), and converts it
  from a corpus audit into a runtime, per-learner, per-*edit* object. The visibility phenomenon is
  not claimed as new here.
- **Differential testing** (McKeeman 1998) and **regression testing**: comparing executions of two
  programs/versions on shared inputs is old. BDL's difference is the setting (a learner's own
  consecutive submissions), the coordinate system (a deterministic basis derived from the
  exercise's tests, relative to the reference), and the products (delta card, ghost detection,
  cold sets, replay, review routing).
- **Novice tinkering / futile edits**: Jadud's error quotient and edit-compile-run studies
  characterize flailing from compiler/error streams. BDL measures futility *behaviorally*: the edit
  is judged by whether it changed any observable behavior, not by its text or error count.
- **Learning from errors / errorful generation** (Kornell et al.; Metcalfe): re-attempting one's
  own errors improves learning. Bug Replay is an executable implementation of that principle with
  automatic scoring; the pedagogy is old, the object is new.
- **Semantic diff / edit-impact analysis** in IDEs and program repair: tools compute code-level
  changes or repair candidates. BDL computes *behavior* deltas of a learner's own edits against the
  hidden reference behavior and stores them as memory.
- **Mutation-testing-based MCQ distractors and diagnostic questions** (Eedi; LLM distractor
  generation, Feng et al. 2024; ACL 2025): those generate static question items from human-written
  or model-written distractors. BDL's delta card and replay are not MCQs; the only distractor-like
  object is the family label of a broken probe, which is computed, not authored.
- **Execution fingerprints / embeddings** (rejected as a wave-41 candidate): BDL does not identify
  programs or cluster them. The signature exists only as the *left operand of a diff*; the stored
  object is `(σ_i, σ_{i+1}, src_i)` transitions, and the quantities are counts of change, not
  identities.

What is claimed as new, with the caveat that the search was a handful of queries and absence could
not be verified: (i) the **behavioral delta card** — per-edit fix/break/churn attribution shown to
the learner, computed against the exercise's reference on a hidden deterministic basis; (ii) the
**ghost edit** as a behavioral futility signal; (iii) **residual coordinates** as an
execution-grounded, cross-problem learner object, with the honest finding that they are
family-enriched in aggregate but not family-coherent per walk; (iv) **Bug Replay**, the learner's
own wrong programs as automatically scored review content; (v) **residual-targeted review routing**
on top of an existing spaced scheduler; (vi) the measurements in §6 — per-family hidden-basis
invisibility over a full verified corpus, sub-basis sufficiency, the aliasing rate of references
(0.14%), and the first census of simulated edit-walk ghosts and cold sets.

Could not verify: that no product or paper already stores per-learner behavioral signatures across
consecutive submissions for a programming-practice corpus; that the simulated ghost/cold
distributions resemble real novices; that any of this changes learning outcomes.

---

## 10. Cool use

**The Delta Card, the Bug Shelf, and a platform that remembers how you were wrong.**

1. **After every Run (the moment of attention).** A one-line card under the test table:
   *"vs your last attempt: 5 behaviors fixed (reverse, sort), 1 broken (empty); 2 tests now pass."*
   Or, when the learner is spinning: *"No behavioral change. This edit changed text, not behavior —
   all of your previous failures remain."* That single sentence names the futile-edit loop that
   novices rarely see by themselves, and it is computed, not guessed.
2. **The closeness meter (earned, gated).** After two failed runs or a hint tier, the learner sees
   *"tests: 3/4 · behavior: 22/24 hidden checks"*. On the 44.4% of problems with a silently-passing
   slip, this is the first honest answer to "am I done?": the shipped tests say yes; the meter says
   `κ < 1`. It is one number, no witnesses, no spoilers — a mirror for the "passing isn't knowing"
   boundary that wave 41 made visible to the *corpus* and BDL makes visible to the *learner*.
3. **The Bug Shelf (`/review` → "Your bugs").** Every wrong version the learner chose to save
   becomes a replay card: their own code, frozen at the moment it was wrong. Replaying it later is
   free content — already written, already failed, and the platform can score the fix
   deterministically (tests pass, plus the hidden delta: which old failures are gone, which
   persist). A learner can literally fix last month's self, and watch the cold dims die.
4. **The blind-spot profile (`/stats`).** Aggregate cold sets across their own ledger, by
   perturbation family: *"persistent divergences over-index reversal and duplication; you never
   diverge on empty inputs."* This is a behavioral self-portrait built only from execution, and it
   turns "be careful with edge cases" into a specific, personal list.
5. **Review that routes by behavior.** When LGS says "review now", the pick is the problem whose
   hidden basis discriminates the learner's worst residual family — so a review set can deliberately
   gather five different problems that all exercise reversal, instead of five random problems from
   the same category. Same scheduler, better content.
6. **Zero new content.** Nothing in the shipped problem bank changes; no atlas is built at
   deployment; the probe basis and reference signatures are computed locally from the exercise the
   learner is already on, stored only in their browser. The feature is a new *use* of data the
   platform already ships.

---

## Appendix A — reproduction

Scratch directory (not committed): `/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w42/`.
Files: `bdl_engine.py` (census), `rencheck.py` (transform exactness), `aliascheck.py` (argument
aliasing), `walks.py` (edit walks), `subbasis.py` (16/24 sufficiency), `audit.py` (examples +
latency), `h6.py` (synthetic review routing), `analyze_final.py` (all census/walk statistics),
`problems.json` (corpus dump, copied from wave 41), plus outputs `census.jsonl`, `rencheck3.jsonl`,
`aliascheck.jsonl`, `walks_final.jsonl`, `final_report.txt`. Python 3.13.7, stdlib only.

Commands, in order:

```bash
cd /var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w42
python3 bdl_engine.py problems.json census.jsonl 1 0 0 100000     # 5,730 records, 8 workers
python3 rencheck.py   problems.json rencheck3.jsonl               # transform exactness
python3 aliascheck.py problems.json aliascheck.jsonl              # argument aliasing
python3 walks.py      problems.json walks_final.jsonl 24          # 699 walks
python3 subbasis.py   problems.json                               # 16/24 sufficiency
python3 audit.py latency                                          # 24-probe latency, n=200
python3 h6.py                                                     # synthetic cohort
python3 analyze_final.py                                          # the tables in §6
```

Constants and seeds: equality 1e-6 deep (harness semantics); per-call timeout 0.25 s; basis cap 48
(build) / 24 (runtime); probe shuffle seed `int(md5(id)[:8], 16)`; mutant target shuffle seed the
same; mutant caps 24 per problem, 4 per family; walk candidate count 4, steps 10/10/12, walk RNG
seed `md5(id)[:8] + {climb:1, random:2, revert:3}`; H6 learner seed 20260918, 400 learners, 3 weak
families, gain 0.35 × min(1, disc/4), mastery threshold 0.9, step cap 300; subbasis stride 12;
audit latency sample 200 problems, RNG seed 42. Skip rule: fewer than 5 reference-evaluable probes
(48 problems); round-trip `unparse(parse(solution))` must pass the shipped tests.

The core loop is small: perturb inputs, execute the reference and the submission with fresh copies,
compare with the harness deep equality, store trits, diff trits. Any independent implementation
using the same seeds should reproduce the headline rates to within sampling noise of its own edit
family: 10.23% invisible mutants, 16.45% test-passing, 44.40% of problems with a hidden-visible
silent slip, 0 reference flakes.

## Appendix B — headline numbers

```
corpus                    5,730 total / 5,682 analyzable / 48 skipped (basis < 5)
basis size                min 5 / p25 22 / median 34 / p75 45 / max 48
mutants                   88,357   invisible on basis 9,041 = 10.23%
test-passing mutants      14,534 = 16.45%   hidden-visible 45.23%, hidden-invisible 54.77%
problems with visible slip 2,523 / 5,682 = 44.40%
reference flakes          0 / 5,682   (fresh-copy protocol)
arg-mutating references   8 / 5,682 = 0.14%  (shared-args protocol: 9 flakes, 8 disagreements)
transform exactness       cosmetic 0/5,682 ; rename 0/4,680 churn
walk ghosts               random 51.16% / climb 48.37% / revert 33.98% (97-99.5% same-wrong)
impact sign vs tests      climb 90.20% (AUC 0.903) ; random 87.79% (AUC 0.854)
next-edit regression      broke hidden dims 1.14x (climb) / 1.37x (random) — H5b falsified
cold dims                 climb 49.8% / random 74.7% of walks with >=4; per-walk family coherence 1.2-1.7% (H6b falsified)
aggregate enrichment      empty z=-20.5, zero z=-11.1 ; inc z=+8.2, reverse z=+7.1, inc2 z=+6.9
sub-basis                 16 probes: 81.2% of silent slips; 24: 91.8%; sign match 96.19% / 97.83%
latency (CPython)         24 probes: median 0.07 ms, p99 0.49 ms, max 2.66 ms
synthetic review routing  category 100.3 problems vs residual-targeted 3.9 (illustrative)
```

---

## Errata & corrections (wave-42 review)

*Appended 2026-09-18 after three independent reviews (theory verification, empirical
verification, red-team critique). §1–§10 and Appendices A–B are retained as history; where
they disagree with this section, this section is authoritative. Every corrected number was
re-derived from fresh scratch artifacts under
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w42-engineer/`:
`clean/bdl_engine_clean.py` (truncating writer, **no resume path**) → `clean/census_clean.jsonl`
(5,730 fresh records, one per problem), `analysis/recompute.py` → `analysis/recompute.out`
(ghost/churn v2, formal cold sets, within-walk permutation null), plus the two verifier
scratch dirs. No product code was written.*

**Reproducibility note (fixes review blocker 3).** The previously cited `w42/census.jsonl` was
append-resumed and carried two stale pre-rename-fix records (`al-345`, `ds-074`, both with
`churn_rename: null`). The fresh run's records for those two problems have `churn_rename: 0`
and identical mutant counts (31/11 and 27/3); every headline total is unchanged. The fresh
artifact is the one to cite from now on. The §6.5 z-null was not in the old appendix; the
reproducible within-walk permutation null now ships in `analysis/recompute.py` §H (300 draws,
seed 12345).

### E1 (blocker) — ghost/churn semantics fixed

Old §3.1 defined `Churn = |Fix| + |Break|` and `ghost = (src changed) ∧ Churn = 0`. That
ignores nonzero↔nonzero transitions, so an edit that flipped a probe from one wrong behavior
to another (e.g. state 2 → state 1) was reported as a ghost even though behavior changed.
Corrected definition (and the one the blueprint freezes):

```
σ, σ' ∈ {0,1,2,x}                 x = the reference has no answer at that probe
Churn  = |{ j : σ_j ≠ σ'_j }|     all comparable dims; 1↔2 and 2↔1 included
ghost  = (text changed) ∧ (σ = σ' exactly) ∧ (visible test bitmask unchanged)
```

Corrected walk rates (699 walks, `w42/walks_final.jsonl`):

| policy | exact-signature ghost (corrected headline) | old `Churn = 0` rate | old "ghosts" with changed states |
|---|---:|---:|---:|
| `climb` | **48.37%** (1,127/2,330) | 51.93% (1,210/2,330) | 6.86% (83/1,210) |
| `random` | **51.16%** (1,192/2,330) | 57.12% (1,331/2,330) | 10.44% (139/1,331) |
| `revert` | **33.98%** (950/2,796) | 36.77% (1,028/2,796) | 7.59% (78/1,028) |

The §6.4 table already computed exact-signature equality; the definition now matches the
table. **P2 restated:** equal signatures prove *no change on the basis*, never no change in
behavior (probe blindness, §8). **P3 restated:** the lower bound is the number of changed dims
(Churn), not `|Fix| + |Break|`. Product copy may never say "no behavioral change" — only
"no change on N hidden checks", and the ghost card is shown only when the visible bitmask is
unchanged.

### E2 (blocker) — residual object reconciled; residual product story cut

§3.1 defines the cold set on the **last k = 3 attempts**. H6a/H6b and the §6.5 enrichment were
computed over *every version of each walk* (all 10–12 attempts), a different object. Corrected
numbers under the formal definition (last 3 versions), same 699 walks:

| object | climb walks with ≥4 cold dims | random | climb concentration | random |
|---|---:|---:|---:|---:|
| walk-long (what §6.5 measured) | 49.79% | 74.68% | 1.72% | 1.15% |
| **last k = 3 (formal)** | **85.84%** | **93.56%** | **1.50%** | **0.46%** |

H6a is directionally unaffected (more walks qualify under the formal, weaker definition); H6b
is falsified under either object. Corrected §6.5 aggregate enrichment under the formal object
with the shipped within-walk permutation null: under-indexed `empty` z = −11.8, `zero1` −3.8,
`zero` −3.7; over-indexed `reverse` +3.1, `inc` +2.5, `inc2` +2.5, `sort` +1.9, `dup` +1.8,
`extend` +1.7 (walk-long values are similar: `empty` −11.7, `inc` +4.6, `reverse` +4.1). The
old z-values (`empty` −20.5, `inc` +8.2, `reverse` +7.1) came from a null that was never
shipped and are withdrawn. Residual coordinates and review routing are **cut from the
product** (see E7); these remain corpus facts about the edit model only.

### E3 — fresh full-corpus census (supersedes Appendix B)

Clean run, `clean/census_clean.jsonl`, 5,730 problems / 5,682 analyzable / 48 skipped:

| metric | value | 95% CI |
|---|---:|---|
| sampled mutants | 88,357 | — |
| invisible on 48-probe basis | 9,041 (10.23%) | [10.03, 10.43] |
| test-passing mutants | 14,534 (16.45%) | [16.21, 16.70] |
| of those, hidden-visible | 6,574 (45.23%) | [44.42, 46.04] |
| problems with a visible silent slip | 2,523 / 5,682 (44.40%) | [43.12, 45.70] |
| problems with a test-passing mutant | 3,600 (63.36%) | — |
| reference flakes (fresh-copy) | 0 / 5,682 | — |
| arg-mutating references | 8 / 5,682 (0.14%) | — |
| cosmetic / rename churn ≠ 0 | 0 / 5,682; 0 / 4,680 applied | — |

Per-family invisibility is unchanged from §6.3 (`cmp` 24.75% most blind, `notdel` 1.47% least).
**Denominator fix (review SHOULD-FIX):** 55/5,682 problems generate zero evaluable mutants;
"problems with all sampled mutants visible" is 2,818/5,627 = **50.08%**, not the 49.6% printed
in §6.3 (wrong denominator). Problem-level rates condition on problems that generated mutants.

### E4 — H5a correction: report held-out numbers

The 90.20%/87.79% figures are **positive-only concordance restricted to steps with a test
delta ≠ 0**. Full-sign concordance is **87.78% (climb) / 83.40% (random)**; lag-free
concordance over all steps is 89.57% / 88.37%. Trivial baselines among test-changing steps:
always-fix 51.6% / always-break 48.4% (climb), always-fix 41.6% / always-break 58.4%
(random); the model's AUC is 0.9025 / 0.8536. **Leakage control** (basis built from odd-index
tests, delta scored on even-index tests only; independent walks, n = 18,191 steps): concordance
**84.00%** with AUC **0.829** (climb) and **82.23%** with AUC **0.797** (random). The in-sample
90/88% overstates held-out performance by ~6–8 pp; every paper and product statement uses the
held-out numbers.

### E5 — H5b is a risk ratio, not odds; next-edit AUC corrected; H4a wording

- **H5b:** risk ratio, not odds ratio. Climb RR = 1.141, 95% CI [0.88, 1.47] (risk 15.98% vs
  14.00%, n = 676/1,421); random RR = 1.363, 95% CI [1.04, 1.79] (14.76% vs 10.83%, n =
  657/1,440). The random arm's CI excludes 1, but the ≥ 2× threshold is still falsified, and
  the "odds" wording in §5 is withdrawn.
- **Next-edit prediction:** the 0.241 figure is not reproduced. Corrected: next-improvement
  AUC **0.308** (climb) / **0.359** (random); next-regression AUC **0.667** / **0.626**. The
  anti-correlation direction stands; the number does not.
- **H4a:** 96.19%/97.83% test *positivity only*; full-sign agreement is **92.40%/95.87%**
  (16/24 probes). H4b is unchanged (within ± 0.10 for 84.7%/88.4%; median error 0.030/0.024).
- **Sub-basis scope:** 81.2%/91.8% (16/24 probes seeing silent slips the 48-probe basis sees)
  is conditional on the 48-probe universe. Against a 96-probe universe (600-problem stratified
  sample): the 48-probe basis sees **96.12%** (669/696) of test-passing slips, the 24-probe
  basis 86.93%, the 16-probe basis 76.72%.

### E6 — cost, storage, and wall budget corrected

- **Basis build is not free.** Building the basis (candidate generation + reference evaluation)
  exceeded 250 ms on 2/200 sampled problems and reached **3.07 s** on a reference-timeout case.
  It must be built lazily once per problem with a wall budget, not on every Run.
- **Pyodide measured (this corrects §8 "untested"):** median **0.271 ms per 24-probe signature**
  (max 50.6 ms), ≈ 2.45× the CPython median (0.111 ms per signature by the verifier's method;
  0.07 ms median in the original audit). A review phrasing of "per probe" is corrected to "per
  signature".
- **Wall budget.** 24 probes × 0.25 s per-call timeout is a ~6 s worst case per Run in Pyodide.
  The product must use a total wall budget (blueprint: 2 s) and mark timed-out reference dims
  `x` (dropped from comparisons), not wait probe-by-probe.
- **Storage.** "≈ 100 B/problem" is withdrawn: a 48-trit signature serialized as JSON integers
  is **144 B**, one ASCII char per trit is 48 B, 2-bit packed is 12 B. The product stores a
  24-trit signature as a 24-char string (24 B) plus ≤ 64 B metadata per problem.

### E7 — novelty restated; product red lines (red team)

Novelty is restated as: **per-edit no-op / behavior-change detection on a hidden basis derived
from the exercise's own tests, applied to a learner's own consecutive submissions, surfaced
only as counts in a standalone opt-in route.** The probe-visibility phenomenon is wave 41's and
is replicated here, not discovered. Cut from the product story, permanently:

- residual coordinates, residual profiles, and review routing (object mismatch E2; H6b dead);
- per-family labels on any learner surface (`compact` corpus fact only);
- build-time mining (wave 41 already prescribed content-hash caching);
- any hidden-oracle verdict shown post-solve, and any in-`ProblemView` delta card;
- any coupling to test verdicts, LGS, checkpoints, certificates/verify, badges, readiness,
  streaks, XP, or remote sync. Failed hypotheses H2b/H3a/H5b/H6b must not carry product copy.
- learner-level blind-spot copy ("you never diverge on empty inputs") — it outruns the
  in-model aggregate; the supported copy is corpus-level and post hoc.

### E8 — what stands (unchanged)

Determinism 0/5,682 flakes; fresh-copy requirement and 8/5,682 aliasing rate; transform
exactness 0/5,682 cosmetic and 0/4,680 rename; test-passing rate 16.45% (replicating wave 41's
16.50%); H3b 44.40% of problems carry a hidden-visible silent slip; H4b; H8 CPython latency;
the aliasing and nonlocal-rename discoveries; and the instrument's honest limits — probe
blindness (10.23% of single-edit slips invisible at 48 probes), visible reference, spec
ambiguity, no human data.
