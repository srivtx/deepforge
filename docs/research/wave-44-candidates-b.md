# Wave 44 — Independent novelty-first survey (Scientist B)

Date: 2026-09-18. Scope: candidate inventions only; no product code touched. Twenty-plus
web searches were run before any candidate was written; every URL below appeared in results.
The honest headline: the *evidence-artifact* space is saturated (proof-carrying code, certifying
algorithms, SV-COMP witnesses, why-not provenance, TMS/argumentation, negative databases,
privacy odometers, verifiable unlearning). Deltas must therefore be **contract-level**, not
"add a witness". Three candidates follow, with candid novelty grades. Candidate 2 is the one I
claim is a new kind of primitive; Candidates 1 and 3 are grade-labelled honestly, including where
a reviewer could reasonably call them compositions.

Grading scale: **new primitive** (no direct match found) / **moderate** (mechanism partly covered,
delta is a contract) / **weak** (mostly known).

---

## Candidate 1 — Falsification Kernel (FK): refutations as ordered, scope-typed values

**1. Definition.** A new contract type `Refutation<C>` for deterministic claims, where each
refutation carries a replayable witness and an explicit **scope**, refutations are comparable by a
checker-verified **subsumption** relation, and every negative comparison result (a failed
subsumption) is itself a first-class, machine-checkable witness. The unit of negative knowledge is
not "a counterexample" but "a counterexample plus its order in a claim family".

**2. The real problem.** Course QA and reviewers hold claims ("this variant is behavior-equivalent
to that one", "these tests characterize the behavior", "this refactor preserves outputs"), and the
negative evidence for them dies on contact with change. SV-COMP witnesses are now formally
exchangeable artifacts, but they are per-task and per-format, validation is a nontrivial
sub-problem of its own (MetaVal; witness-format limits, https://sv-comp.sosy-lab.org/2025/rules.php,
https://pmc.ncbi.nlm.nih.gov/articles/PMC7363212), and when a claim is mutated (new variant, new
test set), the witness is discarded and recomputed. Why-not provenance computes explanations of
missing answers but offers no algebra over them (https://www.vldb.org/pvldb/vol13/p912-lee.pdf).
Who hurts: instructors maintaining problem variants, and learners who find one bug and cannot tell
whether it is the "same" bug the platform already knows.

**3. Existing landscape.** Proof-carrying code (Necula, POPL 1997,
https://homes.cs.washington.edu/~mernst/teaching/6.893/readings/necula-popl97.pdf); certifying
algorithms (McConnell et al., Computer Science Review 2011, https://www.cs.colostate.edu/~rmm/cert11.pdf);
verification witnesses as first-class exchangeable objects (Beyer et al., TOSEM 2022,
https://dl.acm.org/doi/abs/10.1145/3477579); truth maintenance / ATMS (Doyle 1979, de Kleer 1986,
literature); minimal-counterexample CEGIS theory (Jha & Seshia 2014, https://arxiv.org/abs/1407.5397v1).
Delta: all of these attach one witness to one claim or task. None defines a *checked order* between
refutations, a *scope type* gating where a refutation may be applied, or a *difference witness* that
falsifies a claimed subsumption.

**4. Novelty ledger.**
- PCC 1997: code carries a safety proof. Does not: generalize the proof to other claims, compare
  proofs, or type proof scope. Delta: FK objects are claim-family-relative and ordered; PCC proofs
  are claim-fixed.
- Certifying algorithms 2011: each answer ships a witness. Does not: store/compare witnesses or
  support claim mutation. Delta: witness becomes a reusable, comparable value.
- Verification witnesses 2022: explicitly "first-class exchangeable objects" for one verification
  task. Does not: define subsumption, joins, or scope typing. Delta: the order, not the first-class-ness.
- Minimal-counterexample CEGIS 2014: minimality studied inside one synthesis loop. Does not: cross-claim
  comparison. Delta: refutation poset is the artifact.
- Honest caveat: "refutation with a scope" is close to typed evidence in logic; the non-compositional
  core is the *witnessed non-subsumption* operation and the scope gate, not the witness itself.
  **Grade: moderate** (contract novelty; no direct match found, but logic-literate reviewers may
  see familiar structure).

**5. Formal core.**
- `Claim = { id, dom: FiniteDomain, pred: (x) => boolean }`, deterministic; `ClaimFamily` is a
  finite parameter set `Θ` with `C_θ` for each θ.
- `Refutation<Θ> = { rId, θ, witness, replay: ReplayLog, scope: Scope }`; `Scope = { domSubset,
  env: string[] }` (declared environment assumptions, never implicit).
- `verify(r) -> ok | error`: re-executes `Cθ.pred(r.witness)` under `scope`; requires `false` and
  requires `witness ∈ domSubset`; any mismatch rejects.
- `subsume(r1, r2, Θq) -> { subs: true } | { subs: false, diff: θ* }`: computes
  `Ref(r) = { θ ∈ Θq : verify(r, θ) }` by replay; returns `false` **only** with a θ* where
  `θ* ∈ Ref(r2) \ Ref(r1)`, and that θ* must itself pass `verify(r2, θ*)`.
- `join(r1, r2)`: defined only when `r1.θ = r2.θ` and scopes are equal; result refutes the
  conjunction of the two predicate applications at that θ; otherwise returns a *pair* (no fabricated
  single refutation).
- Invariants (falsifiable): (I1) **no false subsumption** — `subsume=false` always carries a valid
  difference witness; (I2) **scope gate** — applying a refutation to a θ whose domain strictly
  exceeds `scope.domSubset` must be rejected, no exceptions; (I3) **join soundness** — a joined
  refutation verifies iff both inputs verify at the same θ.
- Non-trivial falsifiable invariant: I2 is not implied by any of the surveyed systems (witnesses
  today carry no domain contract at all); a single cross-scope acceptance is a bug.

**6. Cheap falsification experiment.** TypeScript, no deps, minutes: 24 tiny claims over finite
domains (predicates on small arrays/strings), 3 claim families with parameter mutation. Build
refutation sets; compare `subsume` against brute force over Θ; assert I1–I3 by mutation: randomly
widen scopes and domain parameters, expecting rejections. Criteria: false-subsumption rate = 0,
difference-witness validity = 100%, illegal cross-scope application = 0 accepted; report the
fraction of stored refutations that survive a claim-family parameter change (reuse rate) versus a
recompute-from-zero baseline.

**7. Failure modes and honest scope.** Undecidable for infinite domains — FK speaks only about
declared finite families; scope claims about the environment are assumptions, not proofs; Θ queries
cost O(|Θ|) replays; stored witnesses can leak hidden tests and must be visibility-gated; no
security or cryptographic claims.

**8. Product sketch.** A "refutation bank" on the platform: exercises present two wrong candidate
solutions; the learner's deliverable is a refutation, which the kernel verifies, orders against the
bank, and reports ("your counterexample subsumes the one the bank had" / "here is a θ it misses").
Internal use: when a variant or test set changes, the kernel reports which stored refutations still
apply, instead of discarding all of them.

**9. Future work.** Extend Θ to structured parameter lattices; generalize subsumption to a decidable
fragment beyond finite replay; integrate with Candidate 3 to order transported refutations.

**10. References.** See URLs inline in §2–§4 (all fetched during this survey).

---

## Candidate 2 — Watch-Causal Stamps (WCS): a three-valued causal timestamp for certified non-exposure

**1. Definition.** A timestamp primitive whose contract is *exact causal non-observation* of a
declared set of watched events. Each stamp carries, per watch, one of SEEN / NOT-SEEN / UNKNOWN;
merge is pointwise-max with UNKNOWN absorbing; watch declarations have logical times, so
NOT-SEEN is decidable retroactively ("this artifact was produced with zero causal paths to any
view of solution W"). This is a new kind of time: existing clocks certify *order* and *presence*;
WCS certifies *absence of influence*, offline, in fixed size per watch, and is honest about the
three-valued boundary instead of embedding uncertainty in a probability.

**2. The real problem.** Local-first learning means work is produced offline, across devices, and
merged. The platform's integrity claims are negative: "this submission was produced without
exposure to the posted solution". Wall clocks cannot say it (they say nothing about influence);
vector clocks decide causality exactly but are O(n) over processes and model process events, not
content views; Bloom clocks are small but probabilistic with false positives, so they can never
certify non-observation (Kshemkalyani & Misra 2020, https://www.cs.uic.edu/~ajayk/ext/BloomClockauthor.pdf;
Misra et al. 2021, https://arxiv.org/abs/2011.11744); trace-graph methods such as causal histories
of "relevant" events require the full graph at analysis time (https://arxiv.org/pdf/2012.09086);
server-side access logs do not travel with exported local-first data. Existing HLC/PWC work is
about order and auditability of *events*, not certified non-exposure (HLC,
https://cse.buffalo.edu/tech-reports/2014-04.pdf; PWC,
https://dl.acm.org/doi/fullHtml/10.1145/3491003.3491009). Who hurts: any offline-first credential or
integrity workflow, and instructors who must decide whether to trust a "solved independently" claim.

**3. Existing landscape.** Lamport 1978 and vector clocks (Raynal survey,
https://web.cecs.pdx.edu/~black/CS410-ds/papers/raynalOSRLogicalClocks.pdf); HLC 2014; Bloom clocks
2019–2021; hybrid vector clocks 2023 (https://arxiv.org/abs/2311.07535); authenticated
non-membership proofs (sparse Merkle trees, https://eprint.iacr.org/2016/683) for *set* absence, not
causal absence. Delta: WCS is a *declared-watch, three-valued* stamp with an exactness boundary,
where Bloom clocks admit only probabilistic presence and vector clocks pay O(n) and have no
declaration semantics.

**4. Novelty ledger.**
- Bloom clock (2019–2021): compact probabilistic set; **false positives**, so "not in the Bloom
  filter" is exact only for absence of hash collisions and a false positive is indistinguishable
  from presence. Does not: support meaningful NOT-SEEN. Delta: exactness on the watch-set and an
  explicit UNKNOWN.
- Vector clocks (1988): exact causality. Do not: model *views of artifacts* as watchable events;
  no declaration epochs; no third state; require an entry per process. Delta: watch-scoped exact
  negative knowledge + declaration-time rule.
- HLC/PWC: total order close to wall clock. Do not: observation semantics. Delta: a different
  question (influence, not order).
- Causal separators / relevant-causality graph methods: prove no path in a known trace. Do not:
  produce a portable stamp; require the trace. Delta: fixed-size offline certificates.
- Honest caveat: for a *static* small watch-set, WCS degenerates to a sub-vector-clock and the
  mechanism is not new in that corner; the non-compositional core is the three-valued
  declaration-aware merge (UNKNOWN absorption, retroactive NOT-SEEN) and its falsifiable
  no-false-negative contract. **Grade: new primitive, contestable at the edges.**

**5. Formal core.**
- Stamp `s = (t: u64, r: ReplicaId, V: Map<WatchId, WatchState>)`; `WatchState = { seenAt?: u64 } |
  NOT_SEEN | UNKNOWN`. Every stamp is created by exactly one replica event.
- Watch declaration: authority declares W with Lamport time `d(W)`; `declaredAt` travels in stamps
  as part of the watch table. A stamp born before `d(W)` on a causally consistent timeline (its `t
  < d(W)` and it has no entry for W) is NOT_SEEN for W.
- Local read of a watched artifact: `V[W] = { seenAt: tick() }`. Local non-reads never change V.
- Merge `s = merge(a, b)`: `t = max`; for each W: if either state is SEEN → the later `seenAt`
  wins; else if both are NOT_SEEN and `max(a.t,b.t) < d(W)` → NOT_SEEN; else UNKNOWN (UNKNOWN absorbs).
- Invariants (falsifiable): (I1) **no false negative** — for every event e, if the true causal past
  of e contains a read of W, then `state(e)[W] ≠ NOT_SEEN`; (I2) **SEEN monotonicity** — once a
  stamp with SEEN(W) is merged, every descendant state remains SEEN(W) with a non-decreasing
  `seenAt`; (I3) **UNKNOWN absorption** — merging with UNKNOWN in a replica that cannot reconstruct
  the watch epoch yields UNKNOWN, never NOT_SEEN; (I4) **epoch stability** — if all replicas have
  advanced past `d(W)` and none reports SEEN, NOT_SEEN becomes permanent (safe-to-forget condition).
- The falsifiable core is I1 + I3: a single trace where a propagated NOT_SEEN hides an actual read
  is a counterexample, and I3 is the rule that prevents the tempting-but-wrong "union of unread
  stamps = unread".

**6. Cheap falsification experiment.** TypeScript simulator, no deps, minutes: 4 replicas, seeded
deterministic schedules, 10k events, 3 watches declared at different epochs, 2 watch-set version
skews. Ground truth: full vector clocks over read events. Measure (a) false-negative count for WCS
(must be 0), (b) exact-NOT-SEEN coverage (fraction of true non-exposures WCS answers NOT-SEEN vs
UNKNOWN), (c) Bloom-clock comparison (false positives > 0 and zero certified NOT-SEEN), (d)
wall-clock heuristic (loses all offline observations; detect a planted offline violation WCS flags
as UNKNOWN). Criteria: I1/I2/I3/I4 hold on 10^4 events and 20 schedules; WCS certifies NOT-SEEN on
≥ a stated fraction of pre-declaration work where the baselines certify nothing.

**7. Failure modes and honest scope.** WCS sees only *trapped* observation events; untrapped
channels (screenshot, second device, memory) are outside the model, and WCS must report UNKNOWN
rather than guess — this is a *declared observation surface* contract, not omniscience. Stamps grow
O(|watch|); declaration of many watches erodes precision; a malicious replica can lie (no
cryptography, not a security boundary); merges can downgrade NOT-SEEN to UNKNOWN (by design) and the
platform must present that honestly.

**8. Product sketch.** Offline practice mode: submissions carry exposure receipts; a submission's
receipt says "no exposure to solution W within the declared surface" or "cannot certify (UNKNOWN)".
Instructor view: fraction of a cohort whose independent-work claim is certifiable; receipts survive
device merges and export. (Cross-check: the LGS scheduler remains the only owner of *when* to
review; WCS is an evidence primitive, not a scheduler.)

**9. Future work.** Sign stamps to resist malicious replicas; define watch-set garbage collection
under I4; study a two-level watch hierarchy for large courses.

**10. References.** Inline in §2–§3 (all fetched during this survey).

---

## Candidate 3 — Transport Certificates (TC): checked movement of refutations between artifacts

**1. Definition.** A certificate type that transfers a refutation from artifact A to artifact B
along a declared, executable relation ρ, where a failed transfer is itself a first-class
*disagreement witness* (A and B genuinely differ at the transported point). The new unit is
"refutation under transport", and the contract forbids unchecked chaining.

**2. The real problem.** A learner's failing input for their program is also evidence about the
problem variant, the reference solution, and future edits — but today it dies with the artifact.
Solver-level reuse exists inside one episode (KLEE's counterexample cache,
https://hci.stanford.edu/cstr/reports/2008-03.pdf; CEGIS(T),
https://www.cs.ox.ac.uk/people/alessandro.abate/publications/bcADKKP18.pdf; incremental regression
verification reuses refinement constraints,
https://dl.acm.org/doi/full/10.1145/3728976), but there is no portable artifact that says "this
witness still refutes that claim over there, and here is the unchecked step that failed".

**3. Existing landscape.** CEGAR (Clarke et al. 2000,
https://www.cs.cmu.edu/~emc/papers/Conference%20Papers/Counterexample-guided%20Abstraction%20Refinement.pdf);
CEGIS and minimal-counterexample analysis (2014); delta debugging for input minimization (Cornell
lecture notes, https://www.cs.cornell.edu/courses/cs5150/2025sp/lecture/lec21-slides-delta-debugging.pdf).
Delta: all reuse is internal to a solver/loop and assumes the relation; TC makes the relation an
explicit checked object and makes transport failure a result.

**4. Novelty ledger.**
- KLEE counterexample cache 2008: memoization of solver queries. Does not: cross artifacts or carry
  a relation. Delta: portable relation + failure object.
- CEGIS(T) 2018: generalizes counterexamples as constraints inside synthesis. Does not: leave the
  loop. Delta: artifact-level transport.
- CEGAR 2000: counterexamples refine abstractions. Does not: reuse witness across independent
  artifacts; relation is internal. Delta: explicit ρ object, checked.
- Incremental regression verification 2025: reuses constraints across program versions. Does not:
  generalize to arbitrary declared relations or emit transport refutations. Delta: the failure
  artifact.
- Honest caveat: a reviewer can argue TC is "refinement bookkeeping"; the non-compositional claim
  is the *composition gate* (I2 below), which no surveyed system provides. **Grade: moderate.**

**5. Formal core.**
- `Rel = { id, src, dst, map: (x) => y, injective: boolean }` declared, executable.
- `Transport = { rel, r: Refutation<Csrc>, rWitnessCheck, rDst }`; checker: (i) `verify(r)`;
  (ii) run `dst(rel.map(r.witness))`; (iii) require it falsifies the corresponding claim of dst.
  On failure, emit `Disagreement = { x: r.witness, y: rel.map(x), outSrc, outDst }`, which is itself
  verifiable by replay.
- Invariants (falsifiable): (I1) **transfer soundness** — every accepted transport's destination
  witness verifies; (I2) **composition gate** — `chain(t1, t2)` is accepted only if the checker
  re-verifies the composed relation; unchecked composition is rejected; (I3) **direction gate** —
  a transport over a non-injective relation is marked many-to-one and may not be transported
  backwards (attempts rejected).

**6. Cheap falsification experiment.** 12 tiny TS programs in variant pairs: 6 behavior-identical
under rename/reorder/wrap (expect transfers succeed and verify), 3 deliberately divergent (expect
transport failure with valid disagreement witnesses), 3 with non-injective ρ (expect direction-gate
rejections). Criteria: I1 soundness violations = 0; divergent pair detection = 3/3; rejection of
invalid chains = 100%; report transported-refutes per CPU-second versus recomputing refutations on
the destination, with replay counts.

**7. Failure modes and honest scope.** TC never proves A ≡ B; it certifies pointwise transfer under
a declared ρ only; nondeterminism breaks replay; ρ itself can be wrong in untested regions; witness
visibility and learner privacy must be gated; no cryptographic non-repudiation.

**8. Product sketch.** "Bug carries": when a problem is refreshed, previously refuted claims about
it are re-pointed through declared relations; where transport fails, the platform shows a labeled
disagreement instead of silently dropping evidence. Learner-facing: "this input also exposes the
same failure in variant B" with a replayable certificate.

**9. Future work.** Infer ρ from refactoring/edit scripts; merge with Candidate 1 so transported
refutations are ordered; study transport across languages via behavioral interpreters.

**10. References.** Inline in §2–§3.

---

## Rejected during survey (honest negative results)

The following were checked and set aside; each fails the core-mechanism bar for wave 44:
- Proof-of-learning / verifiable unlearning: dense, cryptographic, and not cheap
  (https://arxiv.org/abs/2103.05633, https://arxiv.org/abs/2210.09126).
- Privacy odometers/filters: established primitive, not new
  (https://arxiv.org/abs/1605.08294).
- Why-not provenance / negative databases / non-membership proofs: established for databases and
  authenticated sets (https://www.vldb.org/pvldb/vol13/p912-lee.pdf, https://eprint.iacr.org/2016/683).
- Equivalent-mutant proofs and mutant subsumption: active and already addressed
  (https://dl.acm.org/doi/pdf/10.1145/2635868.2635929, https://ieeexplore.ieee.org/document/10962501).
- Causality clocks in every flavor (Lamport, vector, HLC, Bloom, ITC, PWC): the order/space axis is
  exhausted; only the *negative* observation semantics (Candidate 2) showed a visible gap.
- Lakatos-style monster-barring engines: philosophical dialogue games already implemented
  (http://comma2014.arg.tech/res/pdfs/07-pease.pdf).

## Method note

All searches were run before writing; candidate selection was driven by "what does the closest
work explicitly *not* do". Candidate 2 is the strongest bet for a new primitive; Candidates 1 and 3
are contract-level deltas that I would defend as "moderate" and expect a reviewer to push on. Each
candidate's core invariant is falsifiable by a deterministic TypeScript harness with no new
dependencies, consistent with the wave's constraints.
