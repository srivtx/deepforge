# Wave 44 — Significance attack: Refutation-Ledger Values (RLV)

Date: 2026-09-18. Role: adversarial significance analysis (not prior-art). Inputs:
`wave-44-candidates-a.md` §C2 and `wave-44-priorart-refutation.md` §3/§5. Method: analytic
reduction of the grade function; enumeration of decisions that could flip; one deterministic
TypeScript experiment with a pre-declared falsification criterion; external evidence for the
problem; product-contract red lines. No code written; no other file touched.

Honesty contract: this document attacks *significance*, not existence. The prior-art file already
found no direct match and rated RLV GO. The question here is narrower and harsher: **does the
mechanism change any decision that a cheap counter cannot already make?** If it does not, the novel
contract is a presentation layer over known parts.

---

## 1. Steelman: RLV is `totem` + `falsifyr` + TMS plus an aggregation function with no evidential content

All four load-bearing parts ship today. Exact dependency-directed retraction through `cites` is the
ATMS label-update obligation restated (Doyle 1979; de Kleer 1986). "Grade is a total, recomputable
function of an append-only log, and inflation is detectable" is `totem`'s pinned-arithmetic check
(commit `fc3f4114`). An append-only, tamper-evident ledger of falsification attempts is
`falsification-ledger` and FalsiFlyer. Attempts keyed by attack family + seed with a survival score
is `falsifyr`. "Independent reasons reinforce" is Verheij and weighted gradual semantics; requiring
independence for evidence fusion is Dempster–Shafer, and Knight–Leveson already showed that
development-level independence does not buy failure independence. So the only object not located
elsewhere is the aggregation function γ. Reviewers are entitled to read the rest as integration.

Now attack γ directly. Under the formal core, `Indep(a,b) = false iff (refuter, family, seed) equal`,
so the "largest pairwise-independent set" is exactly the number of *distinct tuples*: equal tuples
can never both be selected, distinct tuples are always pairwise independent, so one picks at most one
per class (Lemma L1, §2.1). No combinatorial optimization happens; `MaxIndependent` is a grand name
for deduplication. Under the one-paragraph contract in the task brief (distinct `(refuter, family)`
pairs), γ is exactly "number of distinct families/refuters that survived", i.e. the strongest cheap
count baseline. Either way the grade is a capped dedup count over a relation that encodes nothing
about *why* two checks are redundant: same seed, same family, same method lineage, same input domain,
same author, and same blind spot are all treated differently unless their tuple happens to match.
And distinctness is producer-chosen: seeds and refuter identities are cheap to mint, so the grade is
purchasable at zero epistemic cost — precisely the Assurance 2.0 count-gaming warning
(https://www.csl.sri.com/~rushby/papers/defeaters24.pdf).

The decision consequence is the part that matters. Every behavior RLV promises is already available
without the number: `why` is a ledger read, `challenge` is append + re-run, `audit` is recompute the
arithmetic, demotion is reachability. A boolean "tested/refuted" flag plus the ledger answers every
consumer query. A *ranking* is only valuable if it predicts something a flag cannot; and if no
decision flips between counting attempts and counting independent attempts, then the honest
description of RLV is "an auditable ledger with a count badge". The contract (contest, blast radius,
recompute) may survive review as engineering; the claim that independence is the evidential core
does not, until a decision experiment proves it.

---

## 2. Test: where the independence term must win, and the reduction that says it cannot

### 2.1 Reduction of γ (decided by the spec, not by data)

- **L1.** On `Indep(a,b) = ¬[(r,f,s)_a = (r,f,s)_b]`, `|MaxIndependent(S)| = #distinct (r,f,s) ∈ S`.
  Pairwise independence holds iff tuples are pairwise distinct; pick one per equivalence class.
- **L2.** Therefore `γ(v) = min(K, #distinct survivor tuples, min γ(cites))`. The "independence
  number" is a deduplication count; the `min(K, ·)` cap and the cited-grade term are also count /
  TMS operations, not evidence accounting.
- **L3.** The brief's grade (distinct `(refuter, family)` pairs, seed omitted) is L2 with the seed
  dropped: it *is* baseline B5 below. Under that reading RLV's grade is definitionally identical to
  the strongest cheap counter, so the independence term contributes nothing even in principle.
- **L4.** Spec inconsistency to fix before any review: seed is in `Indep` but not in the brief's
  grade. The paper must choose one; both choices are dedup counts.
- **L5.** Neither reading represents shared method, shared input family, or shared blind spot —
  the properties that make evidence redundant (Knight–Leveson; `falsifyr` families). So the number
  cannot separate "three genuinely different checks" from "one check, three labels", which is the
  only distinction that could make it evidential.

### 2.2 Decisions that could flip (all reduce to one primitive: rank values by warrant)

| Decision | What count-flags do | What an evidential independence term should do |
|---|---|---|
| Conflict resolution: two contradictory derived values, pick one to use/display | Boolean ties; raw count picks the value with more attempts; `falsifyr` ratio leans to fewer kills; `totem` count = raw; TMS ties | Prefer the value whose survivors come from different failure modes, when the other's attempts are repetitions of one mode |
| Audit triage: spend fixed verification budget on the most suspicious values | High-count values get audited; repeated attempts make a value look *better*, not more suspicious | Flag values whose warrant is one mode repeated; audit them first |
| Hint / prereq trust: which of several conflicting hints or prerequisite edges to surface | Prefers the most-repeated claim; recommends the majority-attempted edge | Prefer the claim checked by more independent modes |

### 2.3 The concrete scenario where the term must win (deterministic, seconds on CPU)

Problem P has two candidate hints, H1 and H2, that cannot both be shown; H2 is defective by
construction. Refuters belong to families with blind spots: a family's attempts cannot detect a
defect class inside its blind spot, so same-family attempts are perfectly correlated. H1's ledger:
4 survived attempts, all from family f0, same refuter, 4 seeds. H2's ledger: 3 survived attempts from
f0, f1, f2 (one each). Count graders see 4 > 3 and rank the defective H2 first. A family-aware grade
sees 1 independent mode vs 3 and ranks H1 first. RLV under Reading A (seed in γ) keeps 4 > 3 and
picks H2 — the grade fails its own scenario. Under Reading B it ties the family-dedup baseline (1 vs
3, correct but not distinct from B5). This two-value example is the whole significance question in
miniature; §3 scales it into a corpus that can also test family correlation (two families sharing a
blind spot) where family-dedup itself is fooled.

---

## 3. Decisive experiment: the Derived-Claim Arena

### 3.1 Corpus (TypeScript, zero dependencies, seeded 32-bit LCG, no other randomness)

- **Claims.** 48 derived claims, 4 kinds × 12: hint, explanation, difficulty label, prerequisite
  edge. Each claim has a hidden boolean `defective`; defective claims carry exactly one of 8 defect
  classes. Ground truth is generated, never inferred from a grader.
- **Refuters.** 16 refuters in 4 families f0–f3, fixed blind spots: f0 blind to classes {0,1}, f1 to
  {2,3}, f2 to {4,5}, f3 to {6,7}. An attempt refutes a defective claim iff its class is outside the
  family blind spot; correct claims always survive. Family is the semantic unit; seeds are
  repetitions. A fifth oracle family (empty blind spot) exists only for audit scoring.
- **Regimes** (applied to the same claim set, so comparisons are paired): `R` redundant — 8 attempts
  in one covering family, distinct seeds; `D` diverse — survivors spread over all 4 families; `C`
  churn — R plus 8 extra seeds in the same family; `P` replay — 8 *identical* tuples; `X` correlated
  — f2′ and f3′ share f2's blind spot, so family-dedup sees 2 modes where only 1 exists.
- **Conflict pairs.** 12 pairs per regime; both members cite around the same problem with
  contradictory payloads; the two evidence manifests are matched on raw survivor count (±0), so the
  raw-count grader ties by construction and only mode-aware graders can separate them. The defective
  side is fixed by the generator.
- **Seeds.** 200 evaluator seeds from an LCG (`s ← (1664525·s + 1013904223) mod 2^32`); each seed
  regenerates corpus, regime assignment, and pairs. The paper reports seed-sweep statistics, never a
  single lucky corpus.

### 3.2 Graders (arms; all O(n log n), no dependencies)

| Arm | Definition |
|---|---|
| B0 | boolean: survives iff ≥ 1 survived attempt |
| B1 | raw count of survived attempts |
| B2 | `falsifyr`-style 0–100 survival ratio (count-based proxy, deliberately generous to falsifyr) |
| B3 | `totem`-style pinned decisive count (raw count, formula-checked) |
| B4 | TMS belief: alive / dead only; all ties |
| B5 | **strongest cheap adversary:** distinct families with ≥ 1 survivor, capped at K |
| B6 | RLV as specified: `min(K, #distinct (r,f,s) survivors, min cites)` |
| B7 | RLV-fixed: dependence declared over (same family) OR (declared coverage overlap ≥ half); seed-only churn is dependent |
| B8 | oracle ceiling: `min(K, #distinct blind-spot classes among survivors, min cites)` — analysis only, not implementable by the system |

### 3.3 Metrics (mean and 5th percentile over 200 seeds; thresholds apply to the 5th percentile)

- **PW — pair win rate.** Fraction of matched conflict pairs where the grader ranks the
  non-defective side above the defective side; ties count 0.5. Primary decision metric.
- **AUC — calibration.** Grade vs hidden `defective` over all 48 claims, per regime.
- **AP@12 — audit precision.** Rank values by suspicion (`1/grade`, tie-break: fewest distinct
  families), replay the top 12 with the oracle family; fraction actually defective.
- **Churn delta.** `Δγ` when only seeds are added within the same family; and the fraction of pairs
  whose ranking flips toward the churned side.
- **Demotion sanity.** Precision = recall = 1.0 against the reachable-set oracle (expected pass;
  it tests TMS, not significance, and must not be sold as the novelty).

### 3.4 Pre-declared pass / falsification criteria

| ID | Criterion | Reading |
|---|---|---|
| P1 | PW(B6 or B7) − PW(B1) ≥ 0.15 in regime R | independence beats count under redundancy |
| P2 | PW(B7) − PW(B5) ≥ 0.10 **and** AUC(B7) − AUC(B5) ≥ 0.10 in regime X | a non-trivial dependence relation beats the strongest count baseline where family-dedup is fooled |
| P3 | seed-churn mean Δγ ≤ 0.1 and pair flips ≤ 5% | the declared relation is not purchasable with seeds |
| P4 | AP@12 ≥ 0.75 and ≥ B5 + 0.10 | the ranking changes audit outcomes |
| P5 | B7 ≥ B5 − 0.02 in every regime | no regression |
| F1 | B6 ≤ B1 + 0.05 in R **and** B6 ≤ B5 + 0.05 in X | the grade is a count under both readings — **kill as specified** |
| F2 | P3 fails for the shipped relation (seed-only churn raises γ) | independence is producer-purchasable — **kill** |
| F3 | AUC(B8) − AUC(B5) ≤ 0.05 in X | even true semantic independence has no headroom on this corpus — **kill the idea, not just the witness** |
| F4 | B6/B7 advantage over B1 survives collapsing each family to one survivor (delta < 0.03) | the effect was duplicate suppression, not independent evidence |

**Outcome space.** F1/F2/F3 ⇒ RLV is not significant as specified; the paper must either adopt B7's
declared, gaming-tested dependence relation and pass P2–P4, or report a negative result. B6 passes
P1/P2 ⇒ significance as specified. **Prediction on the current spec: F1 and F2 hold for B6** because
L2 makes it a distinct-tuple count and seeds are in the tuple; the significance case therefore rests
entirely on B7 and on fixing the spec. F4 is the reviewer's ablation: if removing redundant evidence
does not change the story, the story was redundancy bookkeeping.

### 3.5 Anti-gaming of the experiment itself

Ground truth comes from the generator's blind-spot table, not from any grader; pairs are matched on
raw count so B1 ties instead of losing to a construction artifact; B5 is the adversary, not a
strawman; B8 is an explicit upper bound so "the corpus is just too easy" cannot rescue a failure;
thresholds are 5th-percentile over 200 committed seeds; the seed list and thresholds are frozen
before the run. The honest negative result is publishable: "independence accounting did not change
a decision on a corpus built to give it its best shot."

---

## 4. Real-problem check: derived content is trusted without evidence, and it hurts

The problem is real, documented, and repeated across domains; the evidence is not thin.

1. **Legal research tools marketed as "hallucination-free" still hallucinate 17–33% of the time** on
   pre-registered queries; lawyers were sanctioned for consuming fabricated citations.
   https://reglab.stanford.edu/publications/hallucination-free-assessing-the-reliability-of-leading-ai-legal-research-tools/
2. **Epic's Sepsis Model** was deployed at hundreds of hospitals on vendor-reported performance;
   external validation found AUC 0.63 (vs 0.76–0.83 claimed), 67% of sepsis cases missed, alerts on
   18% of admissions — a derived risk score trusted without independent evidence, with patient harm.
   https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307
3. **Generative AI tutoring**: near-1,000-student field experiment — GPT-4 access improved practice
   performance (48%) but left students 17% *worse* on later exams without it; guardrails changed the
   outcome. Derived explanations were consumed as content without evidence of learning value.
   https://www.pnas.org/doi/abs/10.1073/pnas.2422633122
4. **Adversarial helpfulness**: LLM explanations make wrong answers *more* convincing to humans
   (>90% of inference-problem explanations used reframing). Explanations increase reliance even when
   incorrect. https://arxiv.org/pdf/2405.06800
5. **Students' verification behavior**: a 132-student study found >75% use verification methods
   rated inadequate, accepting plausibility and repetition as evidence.
   https://www.mdpi.com/2227-7102/15/10/1307
6. **Algorithmic bias in education** (Baker & Hawn, IJAIED 2022): documented harm from at-risk
   labels, essay scoring, and other derived labels consumed without contestability.
   https://link.springer.com/content/pdf/10.1007/s40593-021-00285-9.pdf
7. **Copilot**: ~40% of 1,689 generated programs vulnerable; novices disproportionately accept the
   top suggestion. https://arxiv.org/abs/2108.09293

Caveat that cuts against RLV: none of these harms is caused by missing grade *arithmetic*. They are
caused by missing negative-evidence workflows and missing contestability. That supports the contract
half of RLV; it does not, by itself, support the aggregation function.

---

## 5. Product honesty: the only contract DeepForge may ship

Surface: a read-only contestability lab for derived content. No effect on any existing score, path,
rank, or teacher view. Claim card shows: kind; payload; warrant line; ledger; cites; the exact γ
definition, cap K, and saturation note; the declared dependence relation; last challenge date.

**Honest copy patterns.** "Survived 3 check-families; 0 refutations; 1 challenge on record."
"No challenge recorded." "Warrant: 2 of 3 independent checks (cap 3)." "Challenge" and "Why" and
"Audit" buttons; on refutation, preview the exact blast radius through `cites` in the demo, because
demotion is the one mechanism prior art confirms and the one with real user value.

**Must NOT claim or do:**

- Never "verified", "validated", "correct", "accurate", "safe", "certified", "hallucination-free",
  "trusted", "quality", percentage, probability, or star rating for a claim's grade.
- Never use a grade for assessment or grading of learners, mastery, readiness, XP, streaks, ranks,
  path gating, recommendations, or teacher reporting. Grades rank content contestability, never
  people.
- Never imply that independence counts prove failure independence; say "declared check-families"
  and disclose blind spots (Knight–Leveson).
- Never imply audit = truth; audit checks arithmetic against the ledger. Hash chains are tamper
  evidence, not authenticity.
- Never sell "never challenged" as a positive warrant; absence of attempts is not survival.
- Never let a refuted learner-authored explanation count against the learner; refute the claim, not
  the person, and never change learner scores as a consequence.
- No claim of improved learning outcomes from RLV itself; the §4 evidence is about the problem, not
  the solution.

---

## 6. Verdict

**GO-WEAK.** The problem is real and the contract (warrant shown, challenge available, refutation
demotes exactly this affected set) is honest, useful, and legally safe if the §5 red lines hold. But
the significance case for the aggregation function is not made and currently fails its own
reduction: under both spec readings the "independence number" is a deduplication count, and under
Reading A it is purchasable with fresh seeds. A wave built on γ as specified would hand the hostile
reviewer the win.

Conditions for wave-44 to be justified: (1) amend the spec — dependence must be declared over
family/coverage/input-domain overlap, with seed-only churn dependent, and the seed in the tuple
removed; (2) run the Decisive Experiment and ship its numbers, not the current strawman comparison
against boolean/TMS; (3) the product ships as a lab, never as assessment.

**Single most important thing the paper must demonstrate:** a decision flip on *matched* evidence —
in a conflict pair where raw counts tie and the strongest cheap baseline (family-dedup count) is
fooled by correlated families, the RLV-fixed grader ranks the correct value first (PW ≥ 0.75 at the
5th percentile, vs B5 ≤ 0.65). If the paper can only show wins against boolean, raw count, or TMS,
the reviewer's sentence stands and the wave should be killed rather than shipped.
