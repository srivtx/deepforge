# Wave 44 — Prior-art attack: Refutation-Ledger Values (RLV) and Falsification Kernel (FK)

Date: 2026-09-18. Role: adversarial prior-art search only; no code written, no other files touched.
Method: 30+ distinct web queries across nine families (TMS/ATMS; defeasible argumentation; provenance
semirings and negative provenance; runtime verification/certification; testing/mutation/N-version;
falsification-of-claims and replication; subsumption/counterexample reuse; trust fusion and source
dependence; ledgers/attestations), plus direct fetches of the load-bearing sources below.
Coverage note: **no single work was found that implements the core contract of either candidate.**
What follows is the strongest adjacent material, the exact deltas, and the one hostile argument that
comes closest to a kill. Query families that came up empty for a direct match are listed in §7.

---

## 1. Verdict per candidate

**RLV — GO (no direct match).** No located system gives a *runtime value* a warrant that is an
append-only ledger of falsification attempts, grades it by a function of that ledger that includes an
independence term, and demotes exactly through `cites`. The closest systems are all adjacent pieces:
`falsification-ledger` implements a hash-chained, append-only ledger of pre-registered claims and
falsification reports with tamper detection (https://github.com/foolproof-labs/falsification-ledger);
`falsifyr` implements an attack leaderboard whose stochastic attacks are keyed by `family` + `seed`
(https://github.com/msaule/falsifyr/); `totem` implements an append-only claim/resolution log from
which a byte-reproducible "capability ledger" with arithmetically audited rows is regenerated
(https://github.com/mmnto-ai/totem/blob/fc3f4114/packages/core/src/capability/falsification.ts);
Doyle/de Kleer TMS/ATMS implement exact dependency-directed retraction but for beliefs, not graded
warrants (https://dspace.mit.edu/handle/1721.1/5733, https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf).
Nothing composes ledger-as-warrant + independence accounting + audited grade + exact demotion on a
program value. The composition is, however, mostly *known mechanism*; novelty pressure is high and
the defensible claim must be contract-level.

**FK — GO (no direct match).** No located system treats refutations as *ordered, scope-typed values*
with a checker-verified subsumption relation, machine-checkable difference witnesses for failed
subsumption, and a gate that rejects cross-scope application. The pieces exist separately: SV-COMP
witnesses are independently validated, scoped counterexamples
(https://www.sosy-lab.org/research/pub/2024-SPIN.Software_Verification_Witnesses_2.0.pdf); certified
subsumption with an LFSC checker exists in description logic
(https://ceurspt.wikidata.dbis.rwth-aachen.de/Vol-2663/paper-5.pdf); failed entailment already yields
machine-checkable countermodels in DL/SMT
(https://doi.org/10.1145/3579051.3579060, https://doi.org/10.24963/kr.2024/67); mutant subsumption is
the known (undecidable) subsumption-between-killers relation
(https://dl.acm.org/doi/10.1109/ICSTW.2014.20); and scope-containment gates with dependency cascades
exist in attestation specs
(https://github.com/emiliaprotocol/emilia-protocol/blob/main/docs/EP-PROVENANCE-RECEIPT-SPEC.md).
No system puts checked subsumption and a composition gate *on refutations themselves*.

---

## 2. Closest-work table

| Work (venue/year) | URL | Implements | RLV/FK clause matched | Clauses NOT implemented |
|---|---|---|---|---|
| falsification-ledger (OSS, PyPI v0.1.1, 2026) | https://github.com/foolproof-labs/falsification-ledger | pre-registered falsification contract; append-only hash-chained ledger; content-addressed reports; `verify` recomputes chain | RLV(i), RLV(iii) tamper-audit | runtime values; independence number; cite demotion; grade semantics |
| falsifyr (CRAN/GitHub, v1.0.0, 2025–26) | https://github.com/msaule/falsifyr/ | attack leaderboard; independent attack families; deterministic per seed; smallest-kill; 0–100 survival score | RLV(i), partly RLV(ii) | runtime values; independence-number grade; cites/demotion; audit-by-recompute (score is heuristic) |
| falsification-ledger hit-rate report (same repo) | https://pypi.org/project/falsification-ledger/ | Wilson CI hit-rate over adjudicated claims; per-source-type buckets; `verdict_ready` gate | RLV(iii) audit of a derived statistic | per-value grades; independence accounting; demotion |
| FalsiFlyer AUDIT_LEDGER_SPEC (OSS, undated, retrieved 2026-09-18) | https://github.com/subvurs/FalsiFlyer/blob/main/docs/AUDIT_LEDGER_SPEC.md | hash-chained + signed ledger binding kernel/dataset/decision-rule SHAs to verdicts; `verify_chain`; 8 adversarial baselines vs one kernel; truncation caveat | RLV(i), RLV(iii) | runtime values; grade function; independence set; cite demotion |
| totem capability falsification (OSS, commit `fc3f4114`, 2026) | https://github.com/mmnto-ai/totem/blob/fc3f4114/packages/core/src/capability/falsification.ts | append-only claim/resolution log → byte-reproducible ledger; `decisiveN`/`hitRate` pinned arithmetic check (inflation detectable); join integrity | RLV(iii) *strongest match* | falsification attempts as warrant; independence number; dependency-directed demotion |
| Doyle TMS / de Kleer ATMS (AIJ 1979 / 1986) | https://dspace.mit.edu/handle/1721.1/5733 ; https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf | justifications as warrant; exact dependency-directed retraction and label recomputation; nogoods | RLV(iv) | falsification ledger; independence accounting; graded warrant |
| Verheij, accrual of arguments (1995/1999) | http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.41.4458 ; https://www.ai.rug.nl/~verheij/publications/pdf/epia95.pdf | independent arguments reinforce; compound defeat; "more (independent) reasons ⇒ more cogent" | RLV(ii) concept | combinatorial independence set; machine audit; demotion of values |
| Weighted gradual semantics (Amgoud et al., IJCAI 2017; Libman et al., JAIR 2026) | https://doi.org/10.24963/ijcai.2017/9 ; https://www.jair.org/index.php/jair/article/download/20450/27297 | acceptability degree = f(basic strength, attackers); independence/reinforcement principles | RLV(ii)/(iii) concept | ledger warrant; syntactic refuter identity; exact demotion |
| Truth discovery w/ dependent sources (survey SIGKDD Explor. 2016; TKDE 2025) | https://doi.org/10.1145/2897350.2897352 ; https://doi.org/10.1109/tkde.2025.3631376 | dependency detected between sources; dependent votes penalized; claim confidence vs source reliability | RLV(ii) concept | runtime warrants; independence number; demotion; audit recompute |
| Subjective logic / EBSL (Jøsang 2001; 2015) | https://doi.org/10.1016/s0218-4885(01)00083-1 ; https://link.springer.com/article/10.1007/s10207-015-0298-5 | grades as functions of (positive, negative) evidence pairs; fusion explicitly assumes independence; discounting | RLV(ii)/(iii) concept | append-only ledger; syntactic ids; cite demotion; audit |
| Knight & Leveson (IEEE TSE 1986) | https://www.csc.kth.se/utbildning/kth/kurser/DA2210/vettig13/Seminarier/KnightLeveson.pdf | independence assumption for independent development fails empirically (correlated failures) | RLV(ii) *counter-pressure* | everything else (no system) |
| Assurance 2.0 defeaters (2024) | https://www.csl.sri.com/~rushby/papers/defeaters24.pdf ; https://arxiv.org/html/2409.10665 | defeaters recorded, investigated, retained; confidence from doubts; notes defeater-count gaming | RLV(i)/(ii) caution | runtime values; exact grade function; cite demotion |
| EviBound (arXiv:2511.05524, Oct 2025) | https://arxiv.org/abs/2511.05524 | claims promoted only with machine-checkable evidence (run id, artifacts, status); governance gates; refusal/blocking | RLV(i)/(iii) spirit | ledger of *falsification attempts*; independence; grade; demotion |
| Evidence-ledger adjudication (arXiv:2607.26512, 2026) | https://arxiv.org/html/2607.26512v1 | claim + evidence packet → support relation + route; auditable traceability | RLV(i) spirit | warrants as values; grading; demotion; independence |
| SV-COMP witnesses 2.0 (SPIN 2024; rules 2026) | https://www.sosy-lab.org/research/pub/2024-SPIN.Software_Verification_Witnesses_2.0.pdf ; https://sv-comp.sosy-lab.org/2026/rules.php | violation/correctness witnesses as exchangeable, independently validated artifacts; explicit assumption scopes/locations | FK(i) | subsumption; difference witness; composition gate |
| Certify subsumptions in DL (PAAR 2020) | https://ceurspt.wikidata.dbis.rwth-aachen.de/Vol-2663/paper-5.pdf | LFSC-checked certificates for computed subsumptions; countermodels for non-entailment proposed as future work | FK(ii), FK(iii) partial | subsumption *between refutations*; scope typing; gate |
| Non-entailment countermodels / Evee (2022; KR 2024) | https://doi.org/10.1145/3579051.3579060 ; https://doi.org/10.24963/kr.2024/67 | machine-checkable counterexamples (incl. contrastive) for missing entailments | FK(iii) substance | ordering; subsumption; composition gate |
| Mutant subsumption graphs (ICSTW 2014; ICSTW 2015) | https://dl.acm.org/doi/10.1109/ICSTW.2014.20 ; https://doi.org/10.1109/icstw.2015.7107454 | subsumption between killers (kill-set inclusion); true subsumption undecidable; static/dynamic approximations | FK(ii) | refutation values; scope types; difference witnesses; gate |
| Certifying model checkers (CAV 2001) | https://kedar-namjoshi.github.io/papers/Namjoshi-CAV-2001.pdf | checkable proof of ¬f on failure; "compact representation of all counterexamples"; independent checker | FK(i) | subsumption; difference witness; composition gate |
| DRAT/LRAT + SICK (JAR 2019; CPP 2020) | https://doi.org/10.1007/s10817-019-09525-z ; https://doi.org/10.1145/3372885.3373821 | replayable refutation certificates; verified checkers; SICK incorrectness certificates justify a *rejection* | FK(i); FK(iii)-analog | refutation ordering; scope; checked subsumption; gate |
| Jaffar et al., unbounded symbolic execution (RV 2011) | https://jorgenavas.github.io/papers/JaffarNavasSantosaRV11.pdf | state subsumption with min/max annotations; failed subsumption triggers generalization/restart; parent–child subsumption | FK(ii)/(iii)/(iv) for symbolic states | refutation records; scope typing of refutations; difference witness as value |
| IC3/PDR generalization (Bradley; FMCAD 2013) | https://theory.stanford.edu/~arbrad/papers/Understanding_IC3.pdf ; https://www.cs.utexas.edu/~hunt/FMCAD/FMCAD13/papers/85-Better-Generalization-IC3.pdf | CTI as witness of non-consecution; cube generalization (scope widening); blocked clauses; CTG when generalization fails | FK(ii)/(iii) | ordering of refutations; checked subsumption; composition gate |
| SAT subsumption (FMCAD 2022; FMSD 2024) | https://cca.informatik.uni-freiburg.de/papers/RathBiereKovacs-FMCAD22.pdf | subsumption check reduced to SAT (NP-complete); substitution witness on success | FK(ii) mechanics | refutations as domain objects; scope; non-subsumption witness as first-class value |
| Vigilante self-certifying alerts (SOSP 2005) | https://doi.org/10.1145/1095810.1095824 | vulnerability claims carrying inexpensively verifiable proofs (replayable exploitation witness) | FK(i) | ordering; subsumption; scope gate |
| Ligate typed attestations + EP receipt spec (OSS specs, 2026) | https://github.com/ligate-io/ligate-research/blob/main/papers/cross-schema-composition/README.md ; https://github.com/emiliaprotocol/emilia-protocol/blob/main/docs/EP-PROVENANCE-RECEIPT-SPEC.md | typed references; per-hop scope-containment gate (fail-closed); invalidation/slashing cascades through the reference graph | FK(iv); RLV(iv) analog | refutations; subsumption checking; difference witnesses |
| Why-not provenance / provenance games (SIGMOD 2009; later) | https://dl.acm.org/doi/10.1145/1559845.1559901 | explanations of absent tuples; unsuccessful derivations | RLV(i)/FK(i) flavor | no algebra/order over explanations; no grades; no gates |

---

## 3. RLV clause-by-clause novelty

**(i) Ledger of attempts as the warrant.** Closest: `falsification-ledger` (pre-registered
falsification contract; append-only hash-chained JSONL; `fl verify` re-derives the chain), FalsiFlyer
(signed ledger binding kernel/dataset/rule hashes to verdicts), and `falsifyr` (leaderboard of attack
attempts). All three make a claim's standing depend on a recorded set of falsification attempts
rather than on a summary judgment. Exact delta: none of them is a warrant on a *program value*, none
feeds a `cites` graph, and none treats each attempt as carrying an independence identity that is
consumed by a grade. Verdict: **partially known** (strongly anticipated at the record level; new only
as a value-level warrant).

**(ii) Independence accounting.** Closest: Dempster–Shafer/subjective logic both *require* source
independence for evidence fusion (and both literatures document that the assumption is hard to check:
https://arxiv.org/abs/1303.1518, https://doi.org/10.1002/int.21695); truth discovery detects copied
sources and penalizes dependent votes (https://doi.org/10.1145/2897350.2897352); Verheij's accrual
and weighted gradual semantics make "count/quality of independent reasons" a first-class grading
input (http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.41.4458,
https://doi.org/10.24963/ijcai.2017/9); Knight–Leveson shows that development-level independence
does not buy failure independence. Exact delta: no located work computes the **maximum pairwise
independent set** of survived attempts over a declared syntactic independence relation
(refuter/family/seed) and uses its cardinality (capped by K) as the warrant strength. The concept is
old; the specific combinatorial object with syntactic-witness identities is new. Verdict:
**partially known** (concept), **new** (object and its role as the grade).

**(iii) Grade as total function of the ledger, auditable.** Closest and most damaging: `totem`'s
capability falsification explicitly checks that each ledger row's `decisiveN`/`hitRate` "exactly
equals the pinned formula over its counts (catches partial-inflation / wrong-denominator)" and that
regeneration is byte-identical; `falsification-ledger` re-derives the whole chain and content IDs;
EviBound blocks unbacked claims; SV-COMP counts a verification result correct only if a validator
validates the witness. Exact delta: RLV's function explicitly composes (a) an independence-number
term, (b) `K`-capping, (c) cited-value grades, and (d) demotion state; none of the above composes
these, and none applies the audit to a value's grade. Verdict: **partially known** (the
"deterministic grade recomputable from an append-only log; forged grades detectable" property is
already implemented for claims in `totem`; the specific grade algebra is new).

**(iv) Exact dependency-directed demotion through cites.** Closest: TMS/ATMS retraction is exactly
this mechanism for beliefs (Doyle 1979; de Kleer 1986), and both are cited constantly as the canonical
solution; ORCHESTRA uses provenance to decide when a deletion removes derivability and when it does
not (https://repository.upenn.edu/cis_papers/655); Ligate/EP invalidation cascades through typed
references with cycle/depth design questions
(https://github.com/ligate-io/ligate-research/blob/main/papers/cross-schema-composition/README.md).
Exact delta: RLV demotes a *grade* rather than a belief, and the "no over/under-demotion" obligation
is the standard ATMS label-update correctness obligation restated. Verdict: **known** (the mechanism
and its exactness criterion are textbook TMS; novelty survives only in the ledger-grade instantiation).

---

## 4. FK clause-by-clause novelty

**(i) Scope-typed refutations with replayable witness.** Closest: SV-COMP witnesses 2.0 (violation
witnesses as constrained waypoint sequences; `assumption.scope`; validated by independent validators;
results count only if validated), DRAT/LRAT (replayable unsatisfiability certificates, verified
checkers), certifying model checkers (checkable proof of ¬f), Vigilante self-certifying alerts
(inexpensively verifiable proof of vulnerability), `falsifyr` (reproducible attack report). Exact
delta: no located format gives a refutation *finite-domain scope* as a typed field that later gates
where the refutation may be applied, nor orders refutations by anything other than per-task identity.
Verdict: **partially known** (witness and replayability are commodity; scope-typing plus ordering is
the delta).

**(ii) Checker-verified subsumption.** Closest: Baader–Koopmann–Tinelli certify subsumption
computations in EL with LFSC-checked certificates; SAT-based first-order subsumption decides
subsumption and returns a substitution witness; mutant subsumption graphs define the exact relation
(`kill(r1) ⊆ kill(r2)`) and show true subsumption is undecidable, with static/dynamic approximations.
Exact delta: all three check subsumption between *clauses/concepts/mutants*, not between
*refutations*; none checks that refutation r1's reach (its `Ref` set) is contained in r2's by replay.
Verdict: **partially known** (checking machinery known; the refutation-domain subsumption is new).

**(iii) Witnessed non-subsumption.** Closest: SMT practice — a failed implication gives a model that
is a machine-checkable counterexample; DL non-entailment explanation produces countermodels, including
contrastive ones (Alrabbaa–Hieke 2022; Evee KR 2024); IC3/PDR's CTI is a concrete witness that
generalization/blocking failed, and CTGs are states that block a generalization; DRAT's SICK format
gives a machine-checkable certificate that a *proof rejection* was justified. Exact delta: FK's diff
witness is a point in `Ref(r2) \ Ref(r1)` that must itself pass `verify(r2, ·)` — i.e., a
difference witness between two checked refutation domains, not merely a countermodel or a rejection
certificate. Verdict: **partially known** (substance is standard log-engineering; the object and its
role as the dual of subsumption is new).

**(iv) Composition gate (reject cross-scope application).** Closest: SV-COMP's `assumption.scope`
(which exists precisely to prevent out-of-scope variable capture when a witness is validated), EP
receipt spec's fail-closed per-hop scope containment (`DelegateCannotExceedPrincipal`), Ligate's
chain-enforced typing of attestation references, and, as the general form, capture checking in type
systems (https://docs.scala-lang.org/scala3/reference/experimental/capture-checking/scoped-capabilities.html).
Exact delta: the gate is on *refutation applicability* (a θ outside `scope.domSubset` must be
rejected), not on a credential, closure, or term. Verdict: **known pattern / new attachment** — the
gate itself is a known design; no located system attaches one to a refutation value.

---

## 5. Strongest single hostile counterargument

**Against RLV.** "Every piece is already shipped. `falsifyr` already keys falsification attempts by
attack family and seed and reports a survival score; `falsification-ledger` and FalsiFlyer already
give append-only, tamper-evident ledgers of falsification attempts with content-addressed,
machine-checkable reports; `totem` already makes the derived score a byte-reproducible arithmetic
function of the log and treats inflation as a detectable integrity violation; TMS/ATMS already
specify exact dependency-directed retraction through dependency edges. RLV reduces to `totem` +
`falsifyr` + TMS with an unusual aggregation function (largest independent set), and that aggregation
function is exactly the kind of number an Assurance-2.0-style reviewer already warns is gameable
(more trivially distinct attempts ⇒ higher grade). On top of that, Knight–Leveson shows that
'syntactically independent' refuters can fail in correlated ways, so the independence number measures
bookkeeping, not evidence."
**Does it survive?** Yes, but only as a contract: no located work composes these pieces, and the
demotion exactness is stated against the cite graph of stored values rather than against a global
belief revision. The objection lands on *significance*, not existence: to survive review, the paper
must show the independence-number grade changes a decision (e.g., audit outcome or conflict
resolution) relative to `falsifyr`'s heuristic score and `totem`'s count, and must define syntactic
independence so that trivial variants of one attempt do not count (Assurance 2.0's gaming warning is
the reviewer's citable lever: https://www.csl.sri.com/~rushby/papers/defeaters24.pdf).

**Against FK.** "Scoped, independently checkable counterexamples are the SV-COMP witness format;
checked subsumption certificates exist in DL; failed entailment already returns a machine-checkable
countermodel; the undecidability of true subsumption and the need for approximations is exactly what
the mutant-subsumption literature established a decade ago; and fail-closed scope-containment gates
are already specified in attestation protocols. FK is those five facts assembled into a type."
**Does it survive?** Yes, but only as an ordering claim: none of those systems orders refutations,
checks subsumption *between refutations by replay*, or makes a cross-scope application an error rather
than a rebinding/refinement decision. If a reviewer can name even one system with a verified
subsumption relation *on counterexample objects* (not on clauses, mutants, or states), FK dies; none
was found.

---

## 6. Defensible claims (GO — no inflation)

- **RLV (one sentence):** the defensible claim is that a *runtime value's warrant* is an append-only,
  tamper-evident ledger of falsification attempts whose grade is a total, recomputable function of
  that ledger (independence-number term, K-cap, and cited-value grades included) and whose demotion
  is exact with respect to the cite graph — a value-level ledger→grade→demotion contract that no
  located work implements; the individual mechanisms (TMS retraction, evidence fusion independence,
  audited ledgers, attack-family scoring) are all known.
- **FK (one sentence):** the defensible claim is that refutations are first-class, scope-typed values
  ordered by a checker-verified subsumption relation on their reach, with a machine-checkable
  difference witness required for every failed subsumption and a gate that rejects cross-scope
  application — a contract that compositionally combines known certificates and known scope gates but
  that no located system applies to refutations themselves.

---

## 7. Exhaustion record (families searched without a direct match)

TMS/ATMS/assumption-based reasoning and dependency-directed backtracking; defeasible
reasoning/argumentation/Pollock-defeaters/Toulmin; justification logic; Assurance 2.0/assurance
cases; provenance semirings, why/where provenance, why-not and negative provenance; runtime
verification verdicts and certificates (RV, MTL proof-object monitoring); graded trust, subjective
logic, Dempster–Shafer, certainty factors, probabilistic TMS/BMS; test adequacy, mutation testing,
test independence, coverage-of-evidence, N-version; falsification/survival of scientific claims
(`falsifyr`, replication survival analyses, falsification-ledger, EviBound); proof-carrying
code/certifying algorithms/SV-COMP witnesses/certifying model checkers; counterexample reuse,
CEGAR/CEGIS, counterexample generalization, mutant subsumption; truth discovery/source dependence/
evidence-independence epistemics; append-only/attestation ledgers and scope-gated credential specs.
The nearest misses (would be kills if extended by one obvious step): `falsifyr` + `totem` combined
(a ledger-grade on values) and SV-COMP witnesses + certified subsumption combined (checked
subsumption on refutation objects).
