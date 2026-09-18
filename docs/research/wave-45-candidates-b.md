# Wave 45 — Independent novelty-first survey (Scientist B)

Date: 2026-09-19. Scope: candidate inventions only; no product code touched. 22 web
queries were run before any candidate was written (queries: behavioral equivalence
indexing, semantic clone detection, equivalent-mutant detection, Unison content
addressing, selective undo/CRDTs, merge-conflict explanation/MUS, deterministic
sandboxes and gas metering, record/replay, self-verifying notebooks, behavioral
profiles, content-addressed execution certificates, compact test covers/minimum test
set, subsuming mutants, HOM search/composition, variational execution, test
transplantation, exercise deduplication, symmetry/equivariance canonicalization,
task-version refinement, cost-aware test cover). One provider call was throttled
(429) and retried.

**Honest headline.** My assigned space is heavily saturated. Every *problem area*
here already has a mature mechanism: behavioral sampling (1992→2025), semantic clone
detection, dynamic mutant subsumption, HOM search, variational execution, minimum
test cover, record/replay, deterministic sandboxes, notebook reproducibility,
content-addressed code, CRDT/OT undo. I did **not** find an unqualified new
mechanism. The two candidates below that I would let into a build are at the
**new-algorithm / new-format** level with explicit deltas and explicit kill criteria;
two more are graded weak/composition and are included to show the boundary. Nothing
here is a "known mechanism plus a contract" except Candidate 4, which I reject.

Grading scale: **new mechanism** (no direct match found) / **new algorithm** /
**new format** / **weak** (known parts, thin delta) / **composition (reject)**.

---

## Candidate 1 — Derivation-Carrying Variant Profiles (DCVP): exact-on-audit
## higher-order behavior without per-combination execution

**1. Definition.** A data structure + algorithm that compresses a *combinatorial
variant space* (mutants as sets of edits) into three disjoint regions per probe —
`verified` (executed), `derived` (predicted by a *named, frozen composition rule*
from first-order executions only), `open` (not predicted) — where every `derived`
cell carries the rule id and the first-order evidence that produced it, and any
audit falsification demotes exactly the cells derived by that rule. The unit is not
"a kill count" but "a cell of the variant-space behavior table with its derivation".

**2. The big use.** Complete higher-order mutation profiles for a 5,730-problem bank
at roughly first-order cost, with a machine-checkable answer of the form *"3,102
combinations were executed; 44,193 were derived by rule R1 and audited 1-in-20 with
0 falsifications; 210,000 remain open"*. A product can then say which *combinations*
a test suite pins and which combinations were never observed. Current tools either
execute the combination (HOM search; exponentially expensive) or *jointly explore*
it (variational execution: language-specific source transformation, no Pyodide path),
or infer *single-mutant* kills from infected state (exact but not about combinations).
None of the three emits a portable, per-cell derivation artifact with an explicit
open region, which is what makes the result *auditable* instead of *claimed*.

**3. Real problem evidence.** The alibi/BDL census in this repo shows the base facts:
88,357 sampled single-edit mutants, 10.23% invisible on the 48-probe basis, 16.45%
test-passing (`src/data/inventions/behavioral-delta-ledger.ts`). Wave-41's funnel
(89,622 mutants → 19,030 test-passers → 268 with a hidden witness) shows the cost
that combinatorial layers would multiply (`src/data/alibis/puzzles.ts` provenance
comment). Who hurts: anyone who wants "does a test suite pin *interacting* slips",
and any platform that cannot afford per-combination Python executions in the browser.
External: HOM search is an admitted search problem with genetic heuristics because
the space is exponential (Jia & Harman, http://www0.cs.ucl.ac.uk/staff/mharman/ist-hom.pdf;
Wong et al. FSE 2020, https://doi.org/10.1145/3368089.3409713).

**4. Closest prior art (adversarial).**
- *Variational execution* (Wong/Meinicke/Kästner, FSE 2020; ESEC/FSE 2018
  https://doi.org/10.1145/3236024.3264837): encodes all variants as program options
  and explores them in one (or few) executions, often completely, with SAT/BDDs.
  **What exists:** better than DCVP when you can transform the source and run the
  instrumented program. **What does not exist there:** language independence and
  black-box operation; DCVP never sees the program, only first-order outputs.
  A hostile reviewer can say "DCVP is a weaker, unsound cousin of variational
  execution" — that is the single most dangerous objection and it is partly fair.
- *Infection/propagation partitioning* (Just, Ernst, Fraser, ISSTA 2014,
  https://doi.org/10.1145/2610384.2610388): one execution of the unmutated program
  tells you which mutants infect state; equal infected states let you infer kills.
  **Exists:** exact inference for single mutants. **Does not exist:** any statement
  about *combinations* of edits.
- Dynamic subsumption / minimal mutant sets (Ammann, Offutt et al., ICST 2014,
  https://www.albany.edu/faculty/offutt/research/papers/MiniMutant-ICST2014.pdf):
  pairwise kill-set inclusion on one test suite; no composition, no open region.
- CPDA + HOM sampling (2021, https://arxiv.org/abs/2104.11005): statistical
  dependence prioritizes pairs; still executes combinations, no certificate.
- Verdict on my own candidate: the *object* (per-cell derivation provenance with a
  rule registry + open region) is not in these works; the *predictive content* of
  the default rule is deliberately weak. **Grade: new algorithm (moderate); a
  reviewer may downgrade to weak. This is the risk I am asking the wave to price.**

**5. Self-test: "known-mechanism + contract?"** No: the mechanism is the derivation
table and its demotion semantics, not a promise layered on top of known executions.
But the honest counter: the *default rule* I propose (a visible single edit dominates
on probes where the other edit is invisible) is a *heuristic*, so DCVP's value is
"cheap, audited coverage of a combination space + honest open region", not soundness.
If the wave wants a sound result, it must build variational execution instead, which
this repo cannot do in Pyodide. State that in the paper or do not ship it.

**6. Formal core.**
- Inputs: base program `b`; site set `S = {1..n}` with a value-change edit per site;
  finite probe family `P` (ordered, versioned, each probe a concrete input);
  oracle `Obs(v)` = output of variant `v` on `p`, deep-equality to `Obs(b)` giving
  `δ(v,p) ∈ {0,1}`; a `comb(C) ∈ {0..k}` order bound.
- Certificate: partial map `T : Comb × P → Cell`, `Cell = Verified(out) | Derived(ruleId, ev) | Open`.
  - `Verified` from execution only.
  - `Derived` only from a *frozen rule* `R` whose inputs are first-order cells.
  - Default rule `R1` (dominance): if `|{i ∈ C : δ({i},p)=1}| ≤ 1`, then
    `δ(C,p) = max_i δ({i},p)`; else `Open`. Rule registry hash is part of the artifact.
- Audit: sample `A ⊆ Derived` by a deterministic seed; execute; any mismatch
  *demotes every cell with that ruleId in the artifact* and emits the witness cell;
  the run fails closed (no silent smoothing).
- Invariants: (I1) no cell is `Derived` without a registry rule; (I2) audits are
  reproducible from (seed, artifact hash); (I3) demotion is total for a rule id;
  (I4) `Verified` cells are exactly the executed set.
- Complexity: first-order = `O(n·|P|)` executions; table size `O(C(n,k)·|P|)` bits;
  prediction `O(k)` per cell; audits `O(|A|)` executions.

**7. Cheap decisive experiment on real repo data.**
- Data: the 96 frozen records in `src/data/alibis/puzzles.ts` (reference, ghost,
  shipped tests, union/held-out probe counts, witnesses) plus first-order edits
  regenerated with the wave-41 family list in `src/data/inventions/alibi-distance.ts`
  and the existing gates `scripts/py_alibi_verify.py` / `scripts/verify-alibis.ts`.
- Method (TS orchestration + the repo's Python engine, CPU-only): for 24 frozen
  puzzles, enumerate up to 6 distinct first-order edits each (cap by AST span),
  execute base + first-order + all C(6,2)=15 second-order combinations on a fixed
  48-probe suite; build DCVP artifact with `R1`; audit all `Derived` cells; compare
  to ground truth.
- Baselines: (a) execute-all (ground truth); (b) `k`-capped FOM kill counts (the
  shipped behavior); (c) random 50% combination sampling at equal execution budget.
- Pass/fail (frozen before the run): (i) zero undetected rule violations
  (every mismatched derived cell must have been demoted) — hard gate; (ii) measured
  `R1` accuracy on 2nd-order cells ≥ 90% (kill below 80%); (iii) at equal execution
  budget, DCVP covers ≥ 2× the combinations of random sampling with ≥ 99% agreement
  on covered cells; (iv) the paper reports the `Open` fraction and never implies
  soundness for it. Minutes at 24 puzzles; the full 96 is a background run.

**8. Failure modes / honest scope.** `R1` is unsound in general (masking pairs:
one edit changes control flow, the other changes a value that no longer flows);
edits that change argument *liveness* break dominance; non-deterministic solutions
are out of scope; probe-family choice dominates results (wave-41 lesson); "verified"
cells are only verified *on this probe family*.

**9. Product sketch.** A `/ledger`-adjacent "variant profile" panel: per problem, a
coverage figure — verified/derived/open with the rule hash and audit seed — plus a
"higher-order alibi" mode that can ship only combinations whose divergence is
`Verified`. Internal use: lab/research benchmarks get a complete interaction profile
without per-combination browser runs.

**10. Future work + references.** Replace `R1` with a *checked* rule: derive
per-probe interference from lightweight dynamic traces where available (Pyodide
hooks), or import variational execution results when a language path exists; extend
to k=3 and to probe-family transfer. References: ISSTA 2014, FSE 2020, CPDA 2021,
ICST 2014 (URLs in §4); in-repo wave-41/42 inventions as evidence sources.

---

## Candidate 2 — Discriminating Cores (DC): a canonical normal form for test
## suites, with witness chains and a checked confluence condition

**1. Definition.** A reduction system + canonical form for a *test suite relative to
a declared variant space*: every removed test carries a *witness chain* — a sequence
of kept tests that separates every variant pair the removed test separated — and the
system either reaches a unique normal form (confluence *checked* on the instance) or
refuses with the ambiguous removal pair. Two suites are *behaviorally identical*
(identical discrimination power over the variant space, not merely similar coverage)
iff their canonical cores are equal, and inequality is given as a variant pair plus
the tests that separate it, if any.

**2. The big use.** "Suite identity" as a first-class, mechanically decided fact:
deduplicate 5,730 test suites across the bank, decide whether a suite edit changed
its discriminating power at all, and move/port suites (or alibi evidence) between
versions without re-deriving everything. Current tools give *minimal suites* via
set cover (not unique, no identity), or *subsumption* per test (pairwise, no
canonical form), or coverage numbers (not sound). A canonical core with witness
chains is a portable artifact: another platform can verify it without re-running
the full mutant matrix.

**3. Real problem evidence.** The repo already stores test suites, probe banks and
mutant funnels per problem (~88k mutants in wave 42) but has no notion of two suites
being *the same suite*: `verify-alibis.ts` re-runs everything when anything changes.
Minimum test cover is old, NP-hard and non-unique (Moret & Shapiro 1985,
https://doi.org/10.1137/0906067; de Bontridder et al. 2002), and modern tools
optimize under multiple criteria without canonicality (Nemo, ICSE 2018,
https://seal.ics.uci.edu/publications/2018_ICSE_Nemo.pdf). Who hurts: anyone
maintaining variants of the same task across 33 paths and 96 alibi puzzles.

**4. Closest prior art (adversarial).**
- Dynamic subsumption (ICST 2014, URL above) defines redundancy by kill-set
  inclusion and removes subsumed mutants/tests; **exists:** pairwise removal and
  the theorem that dynamic subsumption characterizes redundancy for one matrix.
  **Does not exist:** a canonical form, witness chains, or a confluence check
  under order-dependent removal — in fact the ICST result only gives a fixed
  removal order (live → indistinguished → subsumed).
- Minimal complete suites for failure-trace semantics (White Rose,
  https://eprints.whiterose.ac.uk/id/eprint/173724/) build *minimal complete* suites
  in conformance testing; explicitly note non-uniqueness and drop the quest for a
  canonical suite.
- Test-case subsumption in table-based tools (Waikato report,
  https://researchcommons.waikato.ac.nz/server/api/core/bitstreams/011c2f86-d3b8-4c8e-9dee-22eadf832727/content):
  uses an abstraction lattice on *inputs* to flag redundancy; no canonical core.
- Kill: a reviewer can call DC "test-suite reduction + canonicalization". That is
  the honest core of it; the delta is the *witness chain* (each removal discharged
  by kept tests, replayable) and the *refusal semantics* (ambiguity is a result,
  not a heuristic guess). **Grade: new algorithm (moderate), weaker than C1 in
  product value but with a stronger formal invariant.**

**5. Self-test: "known-mechanism + contract?"** Partly. Set-cover minimization and
subsumption are known; canonicality + witness discharge + checked confluence is the
new part. If the wave wants a safer bet, ship only the *verifier* ("is core X a
valid normal form with full witness chains?") which is new as a checkable artifact.

**6. Formal core.**
- Instance: variant space `V` (from the mutation engine), tests `T`, kill matrix
  `K[t] ⊆ V` (variants killed), `sep(t) = { {u,v} ⊆ V : exactly one of u,v ∈ K[t] }`.
- State: kept set `T'`, chains `χ : removed t → ordered subset of T'` with
  `∪_{s∈χ(t)} sep(s) ⊇ sep(t)`; chain is *validated by replay*.
- Reduction: remove `t` when a chain exists. Refusal: if two different maximal runs
  reach different irreducible sets with all chains valid, reports the divergence.
- Confluence check (per instance, cheap): local confluence on critical pairs of
  removal rules; if it passes and the system terminates (chains strictly decrease a
  measure), the normal form is unique by Newman's lemma; else refuse.
- Invariants: (I1) every removal has a replayable chain; (I2) the normal form has
  the same kill matrix as the input (checked by comparing `sep` sets on `V×V`);
  (I3) normal form is a function of the kill matrix only (not of test names/order);
  (I4) refusal is explicit. Complexity: `O(|T|·|V|²/64)` bitset work per pass,
  `O(|T|²)` worst-case chain searches; `V` is thousands, so bitsets dominate.

**7. Cheap decisive experiment on real repo data.**
- Data: 96 alibi puzzles + first-order edits (wave-41 engine) → kill matrices over
  the union probe suites; plus the shipped test suites of 500 problems for scale.
- Method: implement the reducer in TS with bitset separations; run 50 random removal
  orders per instance; compare normal forms; brute-force all minimal covers for
  small instances (≤ 14 tests) with a DP over subsets; cross-check
  "core equal ⇔ kill matrix equal" for all pairs of (suite, perturbed suite)
  where perturbation = add/remove/reorder tests and add/delete variants.
- Baselines: (a) greedy cover (current practice), (b) kill-matrix equality
  (ground truth, computed directly), (c) ICST-order subsumption removal.
- Pass/fail: (i) 100% order-invariance on instances the confluence check accepts;
  (ii) zero false "identical" verdicts vs kill-matrix equality; (iii) every
  "different" verdict carries a separating pair (checked by execution); (iv) on the
  500-problem sample, the canonical core is ≤ 1.2× the size of the greedy cover
  (else the mechanism is only a verifier, not a reducer — still shippable, reported
  as such). Deterministic; seconds to minutes in Node.

**8. Failure modes / honest scope.** NP-hard core minimization (chains make it a
witness-hitting problem; cap the search and refuse rather than lie); confluence can
fail on real instances (that is a *finding*, not a bug); variant space is declared
by the platform, so "identity" is always identity-under-this-mutation-model.

**9. Product sketch.** A "suite identity" chip on problem pages and in CI: shows the
canonical core size, the diff (removed test → chain), and a one-click
"same discrimination as vN" badge; a corpus job deduplicates suites and reuses
alibi banks across identical suites.

**10. Future work + references.** Extend to *cost-weighted* cores (chains with
budgets), to *adaptive* suites (decision trees), and to cross-problem core
*languages* (shared test templates). References: Moret & Shapiro 1985; ICST 2014;
Nemo 2018; White Rose minimal suites; Waikato subsumption (URLs in §4).

---

## Candidate 3 — Acceptance-Profile Manifests (APM): a portable per-task artifact
## whose semantics is the acceptance set over a declared variant space

**1. Definition.** A versioned, content-addressed manifest per task version carrying
(a) the *variant-space acceptance profile* (which declared variants pass the
shipped tests), (b) the reference's probe-bank signature (behavioral fingerprint
over a frozen probe family), and (c) the *refinement relation* to its parent
version with witnesses: variants accepted only by the child (stricter) or only by
the parent (looser). Two task versions are *mechanically equivalent* iff their
profiles are equal on the frozen variant space; edits to prose, hints, or test
order change the manifest's *text hash* but not its profile.

**2. The big use.** Task-version control and progress portability for a learning
platform: decide whether a problem edit changed what counts as a correct solution,
migrate learner "solved" state across a refinement, and match equivalent tasks
across banks. Current tools have nothing mechanical: text hashes flip on typos;
coverage numbers do not decide equivalence; behavioral sampling reproduces a
*function's* fingerprint but not a *task version's* acceptance set; Unison-grade
content addressing is syntactic by construction.

**3. Real problem evidence.** The repo's content is versioned by text: `README` says
every problem was executed before shipping, but nothing records *what changed* in
acceptance when a problem is edited; the 96 alibi puzzles were remined twice when
suites changed (provenance comment in `src/data/alibis/puzzles.ts`), discarding
prior results. External: content-addressed code is syntactic and explicitly
insensitive to semantic change (Unison, https://www.unison-lang.org/docs/tour/_big-technical-idea/);
behavioral sampling needs ~39 random tests to reach 85% discrimination
(IEEE 2019 study, https://ieeexplore.ieee.org/document/8930875) and test-based
semantic clone detection remains approximate (HyClone 2025,
https://arxiv.org/html/2508.01357; JSCTracker, http://www.cs.ucf.edu/~leavens/tech-reports/UCF/CS-TR-12-07/TR.pdf).

**4. Closest prior art (adversarial).**
- Equivalent-mutant/verification for student code: Stainless-based equivalence for
  functional assignments (PLDI 2023, https://lara.epfl.ch/~milovanc/papers/pldi23.pdf)
  proves equivalence with an SMT toolchain; SeqCoBench/inequivalence games
  (https://aclanthology.org/2025.findings-naacl.382.pdf,
  https://arxiv.org/html/2505.03818v2) evaluate LLM judgment. **Exists:** exact
  proofs in Scala; benchmark labeling. **Does not exist:** a portable artifact
  deciding *task-version* equivalence with witnesses, no toolchain, on the web.
- Behavioral profiles in process mining are literally a *known, limited* abstraction
  with a published expressivity ceiling (https://doi.org/10.1007/s00165-016-0372-4):
  behavioral abstractions can be lossy. Any `APM` paper must state its scope.
- Kill: a reviewer can call APM "behavioral fingerprint (BDL, wave 42) + a
  refinement order + a format" — that is essentially a contract over known
  mechanisms. **My honest grade: new format at best; weak as a mechanism. I list
  it third and would not fund it unless C1 and C2 both die.**

**5. Self-test: known-mechanism + contract?** **Yes for the profile part** (BDL and
alibi distance already ship probe-bank signatures in this repo) — only the
*version-level refinement relation* is new. Per the wave-45 bar this is a weak
candidate; I am marking it weak rather than dressing it up.

**6. Formal core.** Variant space `V`; acceptance `A_v ⊆ V` = variants passing
version `v`'s tests; fingerprint `σ_v = (Obs_ref_v(p))_{p∈P}`. Manifest = canonical
serialization of `(A_v, σ_v, scope, parent, diff)`. Refinement: `child ⊑ parent`
iff `A_child ⊆ A_parent` on `V`; witness of strictness = `x ∈ A_parent \ A_child`.
Equality is `A`-set equality (canonical sorted variant ids). Complexity: `O(|V|·|T|)`
executions once per version, `O(|V|)` comparison; mergeable by set operations.

**7. Cheap decisive experiment.** Take 200 problems with a frozen type-directed
probe family (wave-42 method) and a frozen first-order variant set; compute `A` and
`σ`; apply 5 edit classes to each (comment-only, test reorder, test add, test
remove, hint change) and a 6th *solution* edit. Method: compare APM verdicts to
direct recomputation; count text-hash disagreements. Pass/fail: (i) APM equivalence
verdicts match recomputation 100% (by construction, checked as a sanity gate);
(ii) text hash disagrees with APM on 100% of no-op edits and APM agrees on 100% of
them — this is the *entire* delta and it must show up; (iii) every non-equivalence
emits a variant witness that is accepted by exactly one side. Minutes, TS+Python.

**8. Failure modes / honest scope.** Identity only up to the declared variant space
(platform-defined mutants); probe-family versioning must be part of the address or
manifests silently drift; floats/NaN need a canonical output algebra; never claims
"same correctness", only "same acceptance on the declared space".

**9. Product sketch.** `manifests/` beside `src/data/problems/`, a version-diff
view on problem pages ("stricter: 3 variants now rejected, witnesses shown"), and
progress migration: a solve carries over iff the learner's solution lies in the
child's acceptance set (checked by executing their saved code on the frozen suite).

**10. Future work + references.** Cross-task matching via profile isomorphism;
signed manifests; integration with the existing `credentials.ts` hashing.
References in §3–§4.

---

## Candidate 4 — Cost-Ranked Separation Bases (rejected: composition)

**Definition.** Exact minimum-cost subset of a structured input universe that
separates all pairs of a variant family, with an optimality certificate.
**Prior art kills it outright:** minimum test cover is NP-hard and studied since at
least Moret & Shapiro 1985 (https://doi.org/10.1137/0906067); costed/generalized
variants have exact IP methods and metaheuristics (GTCP,
http://www.eng.tau.ac.il/~talraviv/Publications/GTCP_Sep2019.pdf; STCP,
https://www.sciencedirect.com/science/article/pii/S0377221721010997; weighted
branch-and-bound, https://doi.org/10.1145/1187436.1216579); test prioritization
covers the "which tests first" question (APFD literature). The only new-ish piece is
canonical tie-breaking among optima, which is packaging.
**Grade: composition (reject).** Experiment would be DP-over-subsets (k ≤ 20) vs
greedy on 96 alibi puzzles, but there is no reason to spend the wave on it.

---

## Candidates considered and killed (one line each)

- **Commutative/local-first merge without clocks:** Pijul/Darcs-style patch
  commutation already defines merge/undo semantically; re-proposing it fails the
  "no clocks/CRDTs" rule (domain statement; YuDAIS15 selective-undo CRDT,
  https://members.loria.fr/CIgnat/files/pdf/YuDAIS15.pdf).
- **Selective undo with repair witnesses:** OT/CRDT undo is solved with correctness
  proofs since Sun 2002 (https://dl.acm.org/doi/10.1145/586081.586085) and extended
  to MVR CRDTs in 2024 (https://arxiv.org/pdf/2404.11308.pdf); contract-level only.
- **Minimal conflict explanations via MUS:** generic MUS machinery
  (https://www.logicng.org/documentation/explanations/) + an encoding; no new
  mechanism.
- **Budgeted deterministic sandbox / gas metering:** shipping TS libraries already
  do deterministic WASM + gas + snapshots (https://github.com/Robust-infrastructure/ri-sandbox;
  XChain VM, https://docs.xchain.io/components/vm/index.html); TraceCore DER
  (https://github.com/justindobbs/Tracecore) adds budgets + replay artifacts.
- **Exact record/replay with divergence localization:** octopus-replay already
  freezes clock/RNG/IO and reports the first divergent event
  (https://github.com/octoryn/octopus-replay); rr/reverse-debugging is decades old.
- **Self-verifying notebooks:** FlowBook enforces top-to-bottom reproducibility with
  read/write-set tracking (https://arxiv.org/html/2605.01560v1); hash-chained
  notebooks ship (LedgerLens, https://github.com/AmSh4/Ledger_Lens); VeriRepro
  (https://github.com/XiantingWu/VeriRepro). Contract-level.
- **Proof-carrying execution / certified traces without crypto:** LeanGuard trace
  checker (https://days.sh/docs/research/design), PCS-Core
  (https://github.com/kadubon/Proof-Carrying-Skills--PCS-Core-), certified traces
  (https://arxiv.org/html/2605.24462v1), PCC 1997.
- **Semantic clone detection via cross-execution:** mined since Gabel 2008
  (https://dl.acm.org/doi/10.1145/1572272.1572283), JSCTracker, SABER
  (https://par.nsf.gov/biblio/10175629-saber-identifying-similar-behavior-program-comprehension),
  HyClone 2025 (https://arxiv.org/html/2508.01357).
- **Behavioral hashing / fingerprints:** fnprint (https://github.com/1rhino2/fnprint),
  behaviorprint (https://github.com/phoenix-assistant/behaviorprint), execution hash
  (https://doi.org/10.1109/access.2022.3181283).
- **Equivalent mutants / test equivalence:** undecidable, decades of approximations
  (EMS ISSTA 2024, https://homes.cs.washington.edu/~rjust/publ/equi_mutants_ems_issta_2024.pdf;
  LLM EMD ISSTA 2024; deductive verification Mutation 2025).
- **Mutant/test subsumption:** ICST 2014 + Cerebro (https://arxiv.org/abs/2112.14151);
  pairwise inclusion only — Candidate 2 must live above this.
- **HOM search and coupling:** Jia & Harman IST; FSE 2020 variational execution; CPDA
  2021 — Candidate 1 must be positioned as black-box and certificate-carrying, or die.
- **Group testing / adaptive identification of variants:** minimum test collection is
  the same optimization (Halldórsson et al. 2001; test-cover branch-and-bound 2007).
- **Test transplantation / reuse across clones:** Grafter ICSE 2017, JTestMigrator
  SCAM 2024, fork-ecosystem studies (https://www.cse.chalmers.se/~bergert/paper/2023-ase-testcasereuse.pdf).
- **Cross-representation equivalence by theorem proving:** Stainless for FP
  assignments (PLDI 2023) and SeqCoBench already cover it; browser-side TS
  reimplementation of a proof toolchain is out of scope (zero deps, minutes).
- **Knowledge-space prerequisite inference / curriculum planning:** KST and AND/OR
  shortest hyperpath are established; no new mechanism.
- **CIT covering arrays for interaction testing:** wave 43 already shipped covering
  arrays inside KeyFuse; a second application is packaging.
- **Symmetry/equivariance canonicalization of tests:** canonicalization theory is
  mature in ML (Kaba et al. 2023, https://proceedings.mlr.press/v202/kaba23a/kaba23a.pdf)
  and statistical equivariance tests exist; no product driver here.
- **Task identity via embeddings/PDG similarity:** graph-semantic assessment
  (https://www.nature.com/articles/s41598-024-61219-8) and clone-based tools are
  ML/statistical, not mechanical; opposite of the wave bar.
- **Property-based generator format for probes:** seeded generators are standard
  (Hypothesis/QuickCheck); a new file format would be packaging.
- **TS Python-subset interpreter for server-side checking:** Skulpt/Brython/Pyodide
  already occupy the mechanism; no delta without crypto or PCC.

## Recommendation to the wave

Fund **Candidate 1** only if the experiment's hard gates pass on real repo data and
the paper states the dominance rule as a heuristic with an explicit `Open` region;
fund **Candidate 2** as the safer formal artifact (a canonical core *verifier* is
useful even if the reducer underperforms). Kill 3 and 4. If both 1 and 2 die in the
first verification pass, the honest fallback for wave 45 is not another contract:
it is to extend the existing alibi/BDL engines to higher-order *search* (variational
execution is unavailable in Pyodide) and accept a "better search, same mechanism"
invention with a lower grade — or to import an external toolchain, which this
repo's zero-dependency constraint forbids.
