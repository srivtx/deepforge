# Wave 44 — Independent novelty-first survey (Scientist A)

Date: 2026-09-18. Scope: four candidate inventions, one per starting domain. No code was written;
this file is the whole deliverable. Method: prior-art search first (18 web searches + direct fetches
of the load-bearing sources; all URLs in §10 of each candidate), then per-candidate novelty ledger,
then a formal core precise enough to implement in TypeScript with zero new dependencies.

Honesty contract used below: a candidate is marked **new kind** only if no located work implements
its core contract; **moderate** if the mechanism exists but the contract (refusal, audit, witness)
does not; **weak** if the candidate is a new composition of known mechanisms. KeyFuse's frame
(cache keys / covering arrays / delta debugging) is not reused as a core mechanism anywhere.

---

## Candidate 1 — Divergence-Sealed Counterfactuals (DSC)

**1. One line.** A portable *what-if claim* about one recorded deterministic run that any third
party can accept or reject by re-executing only the claimed divergence segment, and that must be
**refused**, not approximated, when no such segment can be sealed.

**2. The real problem.** Who hurts: teams debugging record/replay systems. Durable workflow engines
document a first-class `REPLAY_DIVERGENCE` failure mode where a replay follows a different path than
recorded; agent pipelines now ship record/replay + divergence tooling (stepback, agrepl) because
"where did this run diverge?" is the hard question. Multi-version execution systems spent a whole
DSL on reconciling divergent executions (Pina et al., ATC 2017). Why current approaches are
insufficient: (a) full re-execution answers a what-if but costs the whole run and can drift for
unrelated reasons; (b) engine-side replay (stepback dirty-set, CauDEr causal replay) answers the
question but the answer is not independently checkable — it is "trust the engine"; (c) symbolic
re-enactment (Arab & Glavic 2017) computes historical what-ifs without a portable artifact;
(d) proof-carrying data certifies only the history that *happened*, with cryptography, and cannot
certify what did *not* happen.

**3. Existing landscape.**
- stepback (GitHub, fetched 2026-09-18): signed `.sb` traces, substitutions, dirty-set propagation
  with Lean/TLA+ soundness artifacts, replay, bisect, minimization. Very close.
- Arab & Glavic, "Answering Historical What-if Queries…", TaPP 2017 (fetched): reenactment +
  symbolic execution + slicing for DB histories.
- CauDEr, causal-consistent reversible debugging (PADL 2021, fetched): interactive forward/backward
  exploration of concurrent runs.
- iDNA (VEE 2006) and execution indexing (PLDI 2008): full-fidelity trace re-simulation and
  cross-execution event correspondence.
- Proof-Carrying Data (Chiesa & Tromer, ICS 2010; SNARK bootstrapping ePrint 2012/095, fetched).
- `agrepl` (arXiv 2607.16200, 2026): proxy record/replay for agent runs with divergence sets.

**4. Novelty ledger.**
| Closest work | Does | Does NOT | Why the delta is not merely compositional |
|---|---|---|---|
| stepback | dirty-set *planning* verified sound for its own replay engine; signed traces | define a claim object separable from the engine; bounded third-party verification; refusal semantics; composition of claims | DSC's soundness target is a run that never happened, checked by a *claim verifier* with no planner; stepback's Lean proof is about its planner's dirty set, not about a portable claim checked without it. *(Risk: still reads as a protocol over stepback — flag below.)* |
| Arab & Glavic 2017 | computes historical what-if results over transactional histories | portable claim; divergence index; refusal; bounded consumer verification | they return a result, DSC returns a checkable object whose acceptance is a segment-bounded procedure. |
| CauDEr 2021 | causal-consistent back/forward steps | any artifact a third party can check without the debugger | DSC externalizes the replay step into a certificate. |
| PCD / SNARKs | crypto proofs about a computation's actual history, bounded verification | counterfactuals; no-crypto deterministic replay as verification | PCD's theorem quantifies over history; DSC's quantifies over a substituted history, and verification is re-execution of a segment, not proof checking. |
| iDNA / execution indexing | exact re-simulation; event matching | claims, refusal, substitution grammar | same target shift as above. |

**5. Formal core.** Record `R = (P, x, τ, E, ckpt)`: program, input, event trace `τ = e_1..e_n`,
recorded environment reads `E`, sparse checkpoints. Substitution `Δ` over a declared grammar of
edits (input fields, return values, branch outcomes, env values). Claim
`C = (digest(R), Δ, o', d, S, σ_d, e_S)` with `d ∈ [0,n]`, `S = τ[d..]`, `σ_d` the recorded entry
state at `d`, `e_S` the recorded env reads used by `S`. Verifier `V(C, P)`:
```
if d > n or digest(R) unknown: reject
rebuild σ_d from ckpt(d)          # recorded, no re-execution of prefix
run P|Δ from d with env reads answered only from e_S and host effects suppressed
accept iff final outcome = o' AND first trace difference from τ is exactly d
refuse  iff some needed env read ∉ e_S, or determinism evidence for the region is absent
```
Invariants (falsifiable):
- **I1 Segment bound.** verifier executes ≤ `|S| + c` steps, `c` = checkpoint rebuild cost,
  independent of the unchanged prefix.
- **I2 Soundness under determinism.** `accept ⇒` full execution `P[Δ]` yields `o'`.
- **I3 Divergence exactness.** if `d > 0`, replaying `e_1..e_{d-1}` under `Δ` matches `τ` on those
  events, and event `d` differs. A claim with a shifted `d` must be rejected.
- **I4 Refusal totality.** if a consumed env read is missing or the changed region is declared
  nondeterministic, the answer is `REFUSED`; there is no path to `accept`.

**6. Cheap falsification experiment.** TS: a small deterministic interpreter (20 programs) with
traced env reads; generate 100 substitutions per program; ground truth = full re-execution;
tamper suite = wrong `o'`, shifted `d`, truncated `S`, forged digest. Criteria: **0 false accepts**,
**0 false rejects** on deterministic programs, **100% rejection of all four tamper families**,
median verifier steps ≤ `1.2·|S|`, and ≥ 60% step reduction vs full replay when `d` is late.
Baselines: full replay; dirty-set replay without a claim.

**7. Failure modes.** Nondeterminism defeats soundness (only refusal is safe); reads not recorded in
`E` (native/ambient) defeat closure; loop events can make `d` ambiguous when repeated events have
equal values (must use an event identity); structural substitutions that rewrite control flow may
have no segment interpretation; no security boundary — a malicious producer can forge a claim
unless the record is hashed/signed; checkpoint rebuild cost `c` may dominate if checkpoints are
dense.

**8. Product sketch.** DeepForge "what if" explanations: one Run records a trace; the learner (or a
hint engine) asks "what if line 7 returned `n-1`?" The UI shows the claimed outcome, the first
divergence, and a *Verify* action that re-runs only the suffix; if the submission reads randomness,
the card says *refused* instead of guessing. A reversed exercise: the learner predicts the
divergence index and the verifier grades the prediction.

**9. Future work.** Claim composition (claims about claims) with segment algebra; automatic segment
minimization; interaction with behavioral signatures; a recorded-I/O mode so DSC can cross language
boundaries without a shared interpreter.

**10. References.** stepback github.com/thehalleyyoung/stepback (fetched 2026-09-18) ·
usenix.org/system/files/conference/tapp2017/tapp17_paper_arab.pdf (fetched) ·
popl21.sigplan.org/details/PADL-2021-papers/10/Causal-Consistent-Reversible-Debugging-Improving-CauDEr
(fetched) · usenix.org/event/vee06/full_papers/p154-bhansali.pdf ·
www2.cs.sfu.ca/~wsumner/research/papers/pldi08.pdf ·
eprint.iacr.org/2012/095 (fetched) · ic-people.epfl.ch/~achiesa/docs/CT10.pdf ·
arxiv.org/pdf/2607.16200 · usenix.org/system/files/conference/atc17/atc17-pina.pdf.

**Novelty grade: MODERATE, composition risk high.** The claim/refusal contract is not implemented by
the closest work, but an external reviewer could reasonably call DSC "a protocol layer over
stepback-class replay + checkpointing". Do not lead the wave with this.

---

## Candidate 2 — Refutation-Ledger Values (RLV)  ← flagship

**1. One line.** A first-class runtime value whose *warrant* is an auditable, append-only ledger of
**independent falsification attempts**: consumers can ask *why*, *challenge*, and detect grade
forgery; a successful refutation demotes exactly the values that depend on it.

**2. The real problem.** Who hurts: anyone consuming derived claims they did not compute — learners
consuming platform hints and explanations, teachers trusting auto-derived labels, agents acting on
generated config. Today verification is positive-only: a passing test is a boolean with no record of
what was tried and failed; an explanation is displayable text with no evidence attached. Assurance
research makes the case directly: positive arguments are confirmation-bias prone, and *defeaters*
should be explicitly recorded and assessed (Bloomfield, Netkachova & Rushby, arXiv:2405.15800,
2024). Test suites are famously inadequate as evidence (mutation-testing survey, Jia & Harman 2011):
"tests pass" hides what was never attacked. Current mechanisms do not transfer: TMS/ATMS maintain
logical consistency, not graded warrant (Doyle 1979; de Kleer 1986); provenance semirings are
positive-only (Green et al. 2007); defeasible/justification logics reason about arguments, not
operational values (SEP entries); `falsifyr` (CRAN 2026) computes survival scores but only as an
offline report for scientific claims.

**3. Existing landscape.** Truth Maintenance Systems (1979/1986); provenance semirings (PODS 2007)
and why/where provenance (ICDT 2001); justification logic (Artemov; SEP); Pollock's defeasible
reasoning and Dung argumentation (SEP; Dung 1995); Assurance 2.0 defeaters (2024); `falsifyr`
survival scores (CRAN, 2026); mutation testing survey (2011).

**4. Novelty ledger.**
| Closest work | Does | Does NOT | Why the delta is not merely compositional |
|---|---|---|---|
| Doyle TMS / de Kleer ATMS | dependency-directed belief revision from justifications / assumption sets | count *attempts*; independence of evidence; grades as a published total function of a ledger; executable refuters attached to values | TMS's update rule is consistency; RLV's is attempt accounting. Independence + audit are not expressible as TMS justifications without adding a new primitive. |
| Provenance semirings | positive polynomials for how a result derives | any representation of negative evidence or refutation; demotion | The grade lattice is not induced by ⊕/⊗; a refuted attempt has no semiring value, so the demotion rule cannot be derived from provenance algebra. |
| Justification logic | explicit justification *terms* in a logic | runtime values, cost, executable attempt records, read gating | Static proof objects vs operational value semantics; "attempt" is not a term former in JL. |
| Assurance 2.0 defeaters | documents and assesses defeaters in assurance cases | machine-checked grade function; independence accounting; dependency-directed demotion of runtime values | Documentation practice vs runtime contract; no grade forgery detection exists because grades do not exist. |
| `falsifyr` survival scores | attack claims, aggregate survival | per-value ledgers; derivation graph; demotion; independence rule | A report vs a value primitive: nothing propagates when a claim dies. |
| Mutation testing | measures suite adequacy via killed/surviving mutants | values as evidence carriers; audit invariants | Evaluates test suites, not runtime values. |

**5. Formal core.**
```
Attempt      = { refuter: RefuterId, family: InputFamily, seed: u64,
                 outcome: survived | refuted | inconclusive, cost: Nat }
Value v      = { payload, kind, ledger: Attempt[], cites: ValueId[] }   (ledger append-only)
Grade γ(v)   ∈ { dead } ∪ { k-warranted : k ∈ 0..K }
γ(v) = dead                          if any attempt.outcome = refuted
      = min(K, |MaxIndependent(ledger survivors)|, γ(cites))
where MaxIndependent = largest pairwise-independent set, and
Indep(a,b) = false iff (refuter, family, seed) equal; else true
```
Operations: `assert(payload, kind)`; `derive(f, cites)` ⇒ cites; `challenge(v, r)` appends an attempt
and, if refuted, marks `v` dead and demotes reachable dependents; `why(v)` returns ledger + cites;
`audit(v)` recomputes γ from the ledger.
Invariants (falsifiable):
- **I1 Auditable grade.** at every read, observed γ equals the ledger-derived γ. A forged grade is
  detectable by a public, deterministic function.
- **I2 Independence / no replay inflation.** replaying the same `(refuter, family, seed)` adds 0 to
  `k`; only distinct attempts count.
- **I3 Exact demotion.** after a refutation at `v`, a value is dead iff there is a path to `v`
  through cited values; no over-demotion, no under-demotion.
- **I4 Monotone ledger.** attempts are append-only; γ can only decrease when a refuted attempt is
  added (no silent repair).

**6. Cheap falsification experiment.** TS: 30 deterministic derived-claim programs (e.g. "this
explanation is consistent with problem metadata", "this difficulty label is stable under the
declared edit family") over a small corpus. Adversarial harness: (a) replay the identical refuter
20× and assert Δk = 0; (b) forge ledgers/grades and assert `audit` catches 100% of N=200 forgeries;
(c) inject one refutation into a random node of 100 random derivation DAGs and assert demotion
precision = recall = 1.0 vs. the reachable-set ground truth; (d) compare against two baselines —
boolean "tested" flag and TMS-style belief without grades — and show they either cannot answer
`why`/`challenge` or over/under-demote. Runtime budget: all values + audits < 1 s on CPU.

**7. Failure modes.** Grade is *not* truth: a good refuter set can still miss a real flaw; refuters
are only as diverse as their authors (independence is syntactic, not semantic — two genuinely
different tests may share a blind spot); `k` saturates and hides diminishing returns; a malicious
author can fabricate attempts unless ledgers are hash-chained; refutation is expensive for some
claim kinds; inconclusive attempts must be recorded but never rewarded; never use γ for assessment
(no grading path).

**8. Product sketch.** Contestable content on DeepForge: every derived claim (hint, explanation,
difficulty label, prerequisite edge) carries an RLV. A learner can press *Challenge* on a hint; the
platform runs a deterministic refuter (e.g., try the hint's stated rule on a counterexample family);
if it refutes, the hint and exactly the claims citing it demote, and the UI shows the affected set
and the failed attempt. The site can display "warranted by 3 independent survived checks" with the
ledger visible, and "never challenged" where it is true. This is the missing inverse of badges: real
negative evidence.

**9. Future work.** Refuter libraries per claim kind; semantic independence measures (input-space
disjointness instead of tuple identity); exporting signed ledgers so third parties can re-audit;
combining RLV grades with BDL behavioral signatures; decay/aging of attempts.

**10. References.** sciencedirect.com/science/article/abs/pii/0004370286900809 (ATMS, fetched via
search) · apps.dtic.mil/sti/tr/pdf/ADA078419.pdf (TMS) · dl.acm.org/doi/10.1145/1265530.1265535
(provenance semirings) · dl.acm.org/doi/10.5555/645504.656274 (why/where) ·
plato.stanford.edu/entries/logic-justification (fetched) ·
plato.stanford.edu/entries/reasoning-defeasible (fetched) · arxiv.org/abs/2405.15800 (defeaters) ·
mirrors.linux.iu.edu/CRAN/web/packages/falsifyr/vignettes/interpreting-survival-scores.html ·
homepages.inf.ed.ac.uk/jcheney/publications/provdbsurvey.pdf.

**Novelty grade: NEW KIND (moderate confidence).** The closest located systems are either belief
revision (no attempts, no grades), positive provenance (no refutation), or offline falsification
reports (no runtime values, no demotion). The audit + independence + exact-demotion contract is not
implemented anywhere I found. This is the candidate I would defend as a new type of thing.

---

## Candidate 3 — Materiality-Certified Freshness (MCF)

**1. One line.** Derived values carry a consumer-checkable certificate that decides
*fresh / stale / undecided* from a change log, where *fresh* requires a checked proof that each
changed dependency is **immaterial** to the output, and *stale* comes with a **minimal
materially-changing witness**.

**2. The real problem.** Who hurts: anyone maintaining derived data. Caching/build systems
invalidate on any byte change (Bazel action digests; Nix store paths; DICE/rustc query graphs):
immaterial edits (comments, formatting, reordered keys) cause expensive false-stale recomputation.
The dual failure is worse: consumers keep reading data that changed materially (data-freshness
monitoring exists precisely because "slow bleeds" go unnoticed for weeks — SRECon21 talk; FreshCtx
2026 blocks agent actions on stale reasoning). Current approaches: digests and equality (sound but
imprecise), dependency-graph change propagation (recomputes on any read change), IVM (recomputes
deltas), static change-impact analysis (approximate, not per-value, not checkable), FreshCtx's
selected-field mode (declarative field selection, not a checked materiality claim).

**3. Existing landscape.** Adapton / self-adjusting computation (PLDI 2014; adaptive memoization);
rustc/Salsa demand-driven query memoization (incremental re-use on dependency change); DICE
incrementality (Buck2); differential dataflow / IVM (Gupta et al. 1993); FreshCtx (GitHub, fetched
2026); SRECon21 data freshness monitoring; change propagation in dataflows (HotCloud 2011).

**4. Novelty ledger.**
| Closest work | Does | Does NOT | Why the delta is not merely compositional |
|---|---|---|---|
| Adapton (PLDI 2014) | dynamic dependency graph; re-run only dependents of changed cells | per-edge materiality predicates; consumer-checkable certificates; staleness witnesses | Adapton's rule is "dirty on read-change"; MCF's rule is "fresh only with a checked immateriality claim". The status function is not induced by dirtiness. |
| rustc query system / DICE | memoized queries invalidated when tracked inputs change | immateriality proofs; undecided status; witness | Granularity is per-query, not per-change provenance; no certificate is emitted for a consumer. |
| IVM / differential dataflow | incrementally maintain views under deltas | decide validity from a certificate without the producer; minimal witness | IVM computes the new answer; MCF decides whether the old answer may be used, and proves why. |
| FreshCtx 2026 | declared dependencies revalidated before actions; CURRENT/STALE/UNVERIFIABLE | *tested* materiality; witness of material change; predicate audit | FreshCtx checks equality of fingerprints/selected fields; it does not check that a changed field cannot affect the output. |
| static change-impact analysis | approximates which outputs a change may affect | per-value, machine-checked, falsifiable decisions | Static approximation has no witness and no sound-fresh claim. |

**5. Formal core.**
```
Cert D = { valueDigest, deps: [ { srcId, fingerprint(old), materiality: Predicate<Change> } ],
           checkerVersion }
Change   = (srcId, oldValue, newValue, observedAt)
status(D, Log L) :
   for each (srcId, c) ∈ L where srcId cited:
      if D.materiality(c) = false          -> fresh for that edge
      if D.materiality(c) = true           -> stale; emit witness (c, localRecomputeDelta)
      if inconclusive / predicate unsupported -> undecided
   fresh  iff no stale edge and no undecided edge
   stale  iff ≥1 stale edge (return the minimal witness under declared edge order)
   undecided otherwise
```
Invariants (falsifiable):
- **I1 Producer-free decision.** `status` is computed from `D` + `L` only; no clock, no producer call.
- **I2 No false fresh.** whenever `status = fresh`, recomputing the value under `L` yields the same
  output (checked by an adversarial test).
- **I3 Witness minimality.** a stale witness stays stale when any field is removed/flipped, verified
  by the flips, not by heuristic reduction.
- **I4 Predicate audit.** a predicate returning `false` on a pair whose output changes is a detected
  defect: the audit reproduces the output delta locally and reports the predicate as unsound.

**6. Cheap falsification experiment.** TS: 40 small derived functions over a synthetic change corpus
(500 change pairs mixing immaterial and material changes). Criteria: **0 false-fresh**; false-stale
rate reduced ≥ 50% vs digest-only invalidation on the immaterial subset; 100% witness minimality
under the flip suite; a planted wrong predicate is caught 100% of the time; certificate size bounded
(bits) and status latency < 1 ms per decision on CPU. Baselines: digest-only; FreshCtx-style
declared-dependency equality.

**7. Failure modes.** Materiality predicates can be unsound (the audit catches only what it
re-checks); predicates for arbitrary functions are undecidable — the honest default is `undecided`,
which can grow and make the certificate useless; unobserved sources are outside the contract;
values whose dependencies are not decomposable have no useful predicates; no time/TTL semantics by
design.

**8. Product sketch.** DeepForge derives per-learner artifacts (due-review lists, readiness scores,
leaderboard slices, path checkpoints). Today any input change forces recomputation or risks stale
reads. With MCF, each derived artifact ships a certificate: "still valid — your last 3 submissions
changed only code comments"; "recomputed — your submission changed the failing-test count from 2 to
0"; "undecided — the schedule changed in a way no predicate covers". The UI can show the witness.

**9. Future work.** Predicate synthesis from small input domains; certificate aggregation across
pipelines; combining MCF with RLV (a predicate is itself a claim with a refutation ledger);
compression of change logs.

**10. References.** cs.umd.edu/~mwh/papers/hammer13adapton.html (fetched) ·
cs.cmu.edu/~rwh/papers/admem/short.pdf · rustc-dev-guide.rust-lang.org/queries/incremental-compilation.html ·
github.com/facebook/buck2/blob/main/dice/dice/docs/incrementality.md ·
vldb.org/conf/2007/papers/research/p675-green.pdf (IVM ref) ·
github.com/Hyperwise-LLC/freshctx (fetched 2026-09-18) ·
usenix.org/system/files/srecon21_slides-skorikov.pdf.

**Novelty grade: MODERATE.** The space is crowded and FreshCtx already owns "revalidate declared
dependencies". The delta — *checked materiality*, `undecided`, minimal witness, predicate audit — is
real but a reviewer may call it "cache validation with tests". Keep as a secondary candidate.

---

## Candidate 4 — Commutation-Witnessed State Links (CWSL)

**1. One line.** A first-class *state link*: an undo handle plus machine-checked commutation
witnesses that let it be applied out of causal order, with histories quotiented by witnessed
commutations.

**2. The real problem.** Selective undo remains awkward: users cannot undo one operation without
either reversing everything after it or risking inconsistent states; collaborative/local-first
editors must decide which later operations survive. The literature has attacked this for 30 years
(Prakash & Knister 1992; Sun 2000; CRDT selective undo 2015; Aquamarine CHI 2015; reversible event
structures 2023), so the problem is real and *established* — a warning sign for novelty.

**3. Existing landscape.** Prakash & Knister CSCW 1992 (transpose-based group undo); Sun 2000 (undo
any operation in group editors); Yu, André & Ignat DAIS 2015 (CRDT selective undo); Aquamarine CHI
2015 (script vs inverse models); reversible event structures (arXiv 2312.16714); causal-consistent
reversibility (Lanese et al., PMC7788630); quotient/edit lenses (POPL 2012 + JFP 2023).

**4. Novelty ledger.**
| Closest work | Does | Does NOT | Why the delta is not merely compositional |
|---|---|---|---|
| Sun 2000 / Prakash-Knister | selective undo via transformed inverses | stored witnesses; canonical state equivalence classes | CWSL's undo token carries its own validity proof; ordering is derived from witnesses, not from a central history. |
| CRDT selective undo (2015) | undo of string ops with conflict management | witness-checkable commutation; quotient semantics | CRDT correctness is by construction; there is no consumer-checkable artifact. |
| Reversible event structures | rich out-of-causal-order undo with prevention/reverse causality | first-class witnesses; application-level state links | Formal model, not an artifact a consumer checks. |
| Quotient/edit lenses | backward transformations with round-trip laws | commutation witnesses; undo tokens | Laws constrain implementations; CWSL exposes the witness as data. |

**5. Formal core.** `Update u = (touch: RegionId[], f: S→S, inv: S→S)`; `Witness w(u,v)` is a
checked predicate that `u∘v = v∘u` on `touch(u) ∪ touch(v)` (sampled exhaustively on a small
declared region). A `Link = (u, inv(u), {w})`. Application rule: apply `inv(u)` in state `S` if every
update after `u`'s occurrence in `S`'s history either commutes with `u` by a stored witness, or is
itself undone first. Invariant (falsifiable): applying an undo under this rule reaches a state
equivalent to the sequential history with `u` removed, for every permutation of independent updates;
violations are found by exhaustive search on small states/traces.

**6. Cheap falsification experiment.** TS: an orthogonal-persistence register/log model; generate
random traces of 20 updates with 5–8 independent regions; enumerate all undo orders allowed by
witnesses; compare against sequential-removal ground truth. Criteria: 0 mismatches; witness storage
≤ c per pair; compare with naive LIFO undo (which must fail on dependent traces) and with
undo-everything rollback (correct but destroys independent work). The experiment is minutes on CPU.

**7. Failure modes.** Witnesses can be exponential in overlapping regions; non-invertible updates
(e.g. arithmetic) have no inverse; "equivalence" must be declared per observation interface or the
quotient is meaningless; a witness proves a property only on the sampled region, so it is a
certificate of *tested* commutation, not a theorem.

**8. Product sketch.** Local-first DeepForge progress with selective undo: "undo my answer to problem
3" without reverting later solves, because the two edits touch different state regions and the link
carries the witness; a "time-travel" panel where any single action can be reversed and the platform
proves which later actions survive.

**9. Future work.** Witness inference from effects (rather than declarations); link composition;
merging two devices' histories using links instead of CRDT merge.

**10. References.** dl.acm.org/doi/pdf/10.1145/358916.358990 · web.eecs.umich.edu/~aprakash/papers/prakash-knister-cscw92.pdf ·
members.loria.fr/CIgnat/files/pdf/YuDAIS15.pdf · arxiv.org/pdf/2312.16714 ·
pmc.ncbi.nlm.nih.gov/articles/PMC7788630 · www.cs.cmu.edu/~faulring/papers/aquamarine-chi15.pdf ·
cambridge.org/core/journals/journal-of-functional-programming/article/contract-lenses.

**Novelty grade: WEAK.** Every named component exists in the reversible-computing / OT / CRDT
literatures; the only delta is "witnesses as stored data". Reported honestly as a negative result:
this domain did **not** yield a defensible new primitive in this survey.

---

## Portfolio assessment

- **Pursue C2 (RLV)** as the wave's core. It is the only candidate whose *contract* (auditable
  ledger grade, independence, exact demotion, refutation-as-evidence) I could not match to any
  located system, and it fits the repo constraints (deterministic, CPU-only, TS, no dependencies).
- **C1 and C3** are honest moderate candidates; both are at high risk of the KeyFuse critique
  ("known problem + composed mechanism"). They are worth keeping as fallback experiments, not as
  the headline.
- **C4** is weak and should not advance.
- The four starting domains were all covered. Domain coverage forced C4's weakness to surface; the
  epistemic domain (C2) is where the genuine opening is.

Search log: 12 web searches (counterfactual execution; provenance semirings; TMS/ATMS; Adapton/
incremental computation; selective undo/OT/CRDT; freshness certificates; trace query languages;
epistemic types; why-not provenance; memoization/irrelevance; verification debt; first-class
counterfactuals; proof-carrying data; contingent dependencies; execution indexing; causal-consistent
undo; falsification/survival; defeasible runtimes) plus direct fetches of stepback, FreshCtx,
Adapton, SEP defeasible reasoning, CauDEr, and the TaPP what-if paper.
