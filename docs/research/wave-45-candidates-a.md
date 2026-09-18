# Wave 45 — Content & assessment candidates (Scientist A)

Date: 2026-09-19. Scope: survey only. One file written (`docs/research/wave-45-candidates-a.md`);
no repo code touched; no git. Method: repo reconnaissance (read-only, plus two throwaway
TS scans and one Python check in the approved temp dir), then **20 web searches** (exercise
generation; mutation testing in education; ambiguity detection/ClarifyGPT/SpecFix/ARHF;
semantic clone detection; hardcoding/test-gaming; synthesis-consistent-with-tests; teaching
dimension/VCP-dimension; MR inference (GenMorph/MemoRIA/MR-Scout/MR-Adopt); metamorphic
assessment; shortest-program/lookup rule-out; black-box function matching; QuickSpec/Bach
relational specs; ADS/Lee–Yannakakis; Daikon; duplicate detection; differential oracles/Xamt;
prerequisite inference; difficulty prediction; autograding test adequacy; transductive
synthesis), plus direct fetches where noted.

**Honesty contract.** Grade every candidate as *new mechanism / new algorithm / new format /
weak / composition (reject)*. A contract over known mechanisms is a reject. Real-data numbers
below come from the repo bank: **5,730 problems, 33 paths, 96 alibi puzzles, 169 problem
files**. Two Stage-0 scans were run and their exact numbers are quoted. Four ground-truth
pairs were executed in real Python (not inspected only); those results are marked **[run]**.

## Portfolio summary (ranked)

| # | Candidate | Core object | Grade | Lead? |
|---|---|---|---|---|
| 1 | **XFit** — Cross-Exercise Behavioral Fitting & Pinning | behavioral quotient graph of a problem bank, correspondence-labeled, witness-carrying | **new algorithm** (bordering new mechanism); composition risk medium | **yes** |
| 2 | **PCDI** — Proof-Carrying Derived Instances | instance-derivation DAG with an offline TS checker; laws carry refutation records | **new format** over known mechanism (MR inference/theory exploration) | only paired with XFit |
| 3 | **SXC** — Shortcut-Exploit Certificates | MDL-minimal test-exploiting strategy per exercise, as a certificate | **new format + small algorithm**; known-mechanism risk high | no (cheap fallback) |
| 4 | **NOVA** — Novelty/Redundancy over the fit graph | graph functional used to test curriculum ordering | **composition** (metric over C1's graph) | no |

---

## Candidate 1 — XFit: Cross-Exercise Behavioral Fitting & Pinning (flagship)

**1. One line.** Discover, for every exercise in a bank, the *other* functions (in and outside
the bank) whose behavior is identical or near-identical to its reference *under an unknown
signature correspondence*, and emit a machine-checkable verdict per pair: `equivalent`
(modulo correspondence), `refuted` (with a replayable separating input), or `open` (budget
exhausted) — i.e., compute the bank's **behavioral quotient graph** instead of assuming each
exercise is unique.

**2. The big use.** One sentence: *turn any example-based exercise bank into a library with
(ca) a semantic-duplicate census no text tool can produce, (b) named misconceptions
("your code is exactly exercise Y") at zero authoring cost, and (c) mutually-independent
oracles that let the platform mint and verify new practice instances and detect buggy
exercises by disagreement.* Current tools cannot: text/similarity tools (MOSS, JPlag, AST
clones) never execute; semantic clone detectors (HyClone, SCD-PSM, ISSTA'09 random-testing
equivalence) require a **shared input signature** and a candidate set of clones, and none
searches unknown argument correspondences or emits exercise-level pinning verdicts.

**3. Real problem evidence.** (a) The bank itself: exact-text dedup finds only **3 groups /
6 problems** (la-291≡ml-030, st-057≡ml-254, nlp-016≡nlp-332); function-name dedup finds
**121 groups / 251 problems**; but the same *concepts* recur across categories with
different names, and their *edge behavior* differs silently. (b) Authors' tests are known to
be incomplete: Sarsa et al. found Codex-generated exercises "lacked tests or had faulty
tests" (arXiv 2206.11861); JetBrains' template study found quality issues in 14.7% of tasks
(arXiv 2304.12376); Koli Calling 2025 addressed multi-artifact inconsistencies directly
(DOI 10.1145/3769994.3770042). (c) Learners: a learner who implements `count_unique_bsts`
correctly for n≥0 gets a *different answer from the platform's other Catalan exercise* at
n<0 — **[run]** `catalan_number` (pr-052) vs `count_unique_bsts` (al-200): agree for
n∈[0,12], differ at n=-3, n=-2 (0 vs -1) and n=-1 (0 vs ZeroDivisionError). Two shipped
exercises, one concept, incompatible edges, no tool noticed.

**4. Closest prior art (adversarial).** *Bach, FSE 2017* (pages.cs.wisc.edu/~aws/papers/fse17.pdf)
learns relational specs over a **shared signature** from one I/O dataset; it does not search
argument correspondences and cannot ask for new inputs. *Random-testing equivalence mining,
ISSTA 2009* (dl.acm.org/doi/10.1145/1572272.1572283) clusters code fragments by output on
**shared random inputs**. *HyClone 2025* (arXiv 2508.01357) cross-executes two programs with
**LLM inputs**, same signature. *Xamt 2025* (arXiv 2508.12546) matches APIs by *name/description*
then differential-fuzzes. *Presyn/IReEn* synthesize one function from a black-box oracle.
*QuickSpec* (JFP 2017) finds equations among **given** functions over shared generators.
What none does: treat *arity/argument-role/output-representation correspondence* as part of
the unknown; fit across *independent test suites*; produce per-pair `equivalent/refuted/open`
verdicts with refutation witnesses; or use fits as cross-oracles for instance verification.
If a reviewer insists "this is behavioral clone detection with renaming", the answer is
that renaming is *static* while correspondence here is *searched and evidenced*, and the
shipped object is a quotient graph, not a clone list. That is a real but non-dramatic delta.
**Self-test:** *moderate novelty, medium composition risk* — not a contract, but the
mechanism's pieces are individually known.

**5. Formal core.** Bank `B = {(r_i, T_i)}`, `T_i = {(x_ij, y_ij)}`; library `L = {r_i}`.
A **correspondence** `κ = (φ, ψ)` where `φ` maps a run of `r_j`'s call to `r_i`'s argument
space (from a bounded grammar `K`: argument permutations, prefix/suffix projections,
constants, list/scalar coercions) and `ψ` maps `r_j`'s output to `r_i`'s output space
(identity, `-`, `1/·`, `round_k`, `abs`, `sort`, scale/shift). Fix `b` probes. Algorithm:
1. **Prefilter (pure TS).** Compute a shape signature per exercise from `T_i` (arity, JSON
   type shapes of each argument, output shape). Only same-signature pairs enter (real run:
   **46,897 pairs**, 36,061 cross-category; down from 16.4M).
2. **Direct comparison (pure TS).** For pairs sharing ≥1 exact input, compare expected
   outputs (real run: **14,542 pairs**, 21,007 shared comparisons; **5,159 agree on all
   shared**, 9,383 conflict — expected across *different* concepts).
3. **Fit search (bounded, deterministic).** For each candidate pair, enumerate `K` in
   size-rank order; for each `κ`, evaluate `r_j(φ(x))` vs `ψ^{-1}(y)` on `T_i ∪ T_j`
   (oracle = the repo's existing Python runner, as in wave 41). A `κ` that agrees on all
   observed points is **fit-on-observed**; then test `b` seeded probes drawn from the
   union generators (the alibi probe machinery, `py_alibi_verify.py`); zero divergence ⇒
   `equivalent(b, κ)`; first divergence ⇒ `refuted(κ, witness)`; budget end ⇒ `open`.
4. **Minimize witnesses** by delta-debugging the input (shrink list length, values) —
   same discipline as wave 41.
5. **Quotient graph.** Classes = union-find over `equivalent` edges; edges carry `κ`,
   `b`, and the exercise pair. Invariants: **I1** `equivalent` is symmetric (agreement is);
   **I2** every `refuted` edge carries a witness that re-executes to divergence (replay
   gate); **I3** every non-identity `equivalent` edge is a *conditional* claim — it
   quantifies over probes, never over all inputs, and is labeled with `b`; **I4** any
   probe-family change can demote an `equivalent` edge but cannot promote a `refuted` one.
   Complexity: `O(P · |K| · |T| · c)` evaluations, `P` = shape-similar pairs, `c` = one
   call; prefilter is `O(N log N)`; witness shrink `O(log |x|)` calls.

**6. Cheap decisive experiment (real data, minutes, CPU-only).**
- *Stage 0 (pure TS, <30 s):* prefilter + shared-input comparison; report the numbers above.
  Baseline B1 = exact-text groups (3); B2 = name groups (121). Stage 0's 5,159 agreement
  pairs are a lower bound the text tools cannot see.
- *Stage 1 (build-time Python oracle, ≤10 min single core):* run fit search on the 14,542
  shared-input pairs with `|K| ≤ 64`, `b = 200` probes/pair, 0.25 s/call budget, seeded.
  Ground truth already in hand **[run]**: (i) `combinations` pr-003 ≡ `binomial` al-023
  (0 diffs over n∈[-2,30], r∈[-2,32] = 1,155 points; different names, categories, tests);
  (ii) `catalan_number` pr-052 vs `count_unique_bsts` al-200 = near-miss, witnesses
  n∈{-3,-2,-1}; (iii) `softmax` la-149/dl-003 vs ml-064: `[]` raises vs returns `[]`;
  (iv) `cosine_similarity` la-025 vs ml-046: ragged input gives 0.5976 vs 0.0.
- *Pass/fail:* (P1) ≥30 confirmed equivalence classes (10× B1) with **zero** held-out
  refutations among `equivalent` verdicts; (P2) 100% of `refuted` witnesses replay;
  (P3) ≥95% verdict reproducibility under a second probe seed; (P4) Stage 1 ≤10 min;
  (P5) all four hand-checked pairs classified correctly. Failure on P1 or P2 kills it.

**7. Failure modes / honest scope.** Probe-conditional equivalence (undecidable in general;
`equivalent(b,κ)` is an *open* claim, not a theorem); correspondence grammar coverage
(relations outside `K` are invisible); cost if `|K|` explodes (must rank/prune by shape);
Python call overhead dominates on slow solutions (budget + skip list); *intended*
cross-category near-duplicates are not bugs — the census needs a same-concept filter for
bug claims; false fits on tiny test sets (`|T| = 3`) are likely and must be reported with
`b`, not as facts; no security boundary.

**8. Product sketch.** Three surfaces on DeepForge: (a) **Content CI** — a `verify:xfit`
gate that fails when two exercises are behaviorally equivalent but labeled different
concepts, or when two same-concept exercises disagree on a witness (e.g., the Catalan
pair); authors see the witness and choose align/clarify. (b) **Named diagnosis** — when a
submission matches another exercise's class within `b` probes, the hint says "your function
is exactly `sample_variance`; the task asks for `population_variance`", with the witness;
zero authored distractors. (c) **Cross-oracle practice** — for `equivalent` pairs, mint
new instances from either test suite and check with the other implementation; disagreement
flags a bug instead of shipping a wrong instance. Wave 41's Silent Bug Hunt becomes one
consumer of the graph.

**9. Future work.** Correspondence search with expression templates over arguments (not just
projections); proof-carrying `equivalent` claims via symbolic execution for a decidable
slice; using the quotient graph to compress paths (`docs/research/path-curation.md`); a
public "fit graph" format so two platforms can exchange quotient classes; adapting `K` to
non-JSON outputs.

**10. References.** See §4 plus: waves 40–44 in this repo (Alibi Distance, BDL); Ryu et al.
ISSTA'09 (10.1145/1572272.1572283) · Thaller PSM (hannes-thaller.com/publications/Thaller2020c.pdf) ·
HyClone (arxiv.org/abs/2508.01357) · Xamt (arxiv.org/abs/2508.12546) · Bach FSE'17
(pages.cs.wisc.edu/~aws/papers/fse17.pdf) · QuickSpec (cse.chalmers.se/~jomoa/papers/quickspec-JFP.pdf) ·
Milovančević & Kunčak OOPSLA'23 (10.1145/3591258) · Sarsa et al. (arxiv.org/abs/2206.11861) ·
JetBrains templates (arxiv.org/abs/2304.12376).

**Novelty grade: new algorithm (moderate).** The quotient graph + searched correspondences +
refutation witnesses + cross-oracle use is not implemented by any located work; the pieces
(clone detection, differential testing, delta debugging) are all known. This is the only
candidate I would lead with.

---

## Candidate 2 — PCDI: Proof-Carrying Derived Instances

**1. One line.** A portable *instance-derivation* format: new practice instances are minted
by applying **confirmed laws** `f(α(x)) = β(f(x))` to shipped examples, and ship a derivation
chain that any consumer can replay in pure TS **without executing the reference**; each law
carries its confirmation/refutation record.

**2. The big use.** A platform can grow unlimited verified instances *offline, in the
browser* (no Pyodide run), because the expected output is computed from the base by `β` and
the chain checker is a TS fold. Current generators (ExGen, CodeContrast, LLM exercise
generation) execute a model to verify; MR systems derive follow-ups only inside a running
test harness.

**3. Real problem evidence.** Fixed example sets are tiny (3–6 cases per exercise here), so
practice collapses to memorization; generation pipelines that verify by execution are slow
and online. Sarsa et al. and the JetBrains study document faulty/under-covering tests.

**4. Closest prior art.** Metamorphic testing (Chen et al. 1998) derives follow-up cases from
**human-written** relations; MR inference is now automatic (GenMorph, TSE 2024; MemoRIA,
FSE 2024; MR-Scout, TOSEM 2024; MR-Adopt 2024, all above). Theory exploration (QuickSpec)
discovers equations over a given signature. What does not exist: a *serialized, offline-
checkable derivation artifact* whose semantics is "this instance follows from that base via
these frozen laws", decoupled from any test runner. **Self-test:** a reviewer will say
"MR discovery + a certificate" — and would be largely right. **Grade: new format over a
known mechanism; composition risk high.**

**5. Formal core.** Law `λ = (α, β, record)`: `α` from a bounded input-transform grammar,
`β` from a bounded output-transform grammar; `record` = (probe family, b, zero refutations,
counterexamples if any). Derivation `d = (base ∈ T_i, [(λ_1,p_1)…(λ_k,p_k)])`, instance
`(α_{p_k}∘…∘α_{p_1}(x), β_{p_k}∘…∘β_{p_1}(y))`. Checker: apply the chain left-to-right to
the base pair; reject if any step's precondition on the *shape* fails. Invariants: **I1**
checker executes no user code; **I2** an instance is only as sound as its laws, and every
instance cites them; **I3** refuted laws are never used (append-only record); **I4** chains
compose (associativity of the fold). Complexity: O(chain) per check; law discovery is
`O(|Λ|·b)` calls per exercise.

**6. Cheap decisive experiment.** On a seeded 300-problem sample + all 96 alibi puzzles, run
law discovery (α,β grammars ~200 templates) over 200-probe grids via the existing Python
runner; target ≤8 min single-core. Metrics: fraction of exercises with ≥1 non-trivial
confirmed law; refutation rate; **held-out audit**: derive 50 instances per law *not* from
shipped tests but from generated bases, and execute the reference to check `β`-derived
outputs; pass if ≥95% of derived outputs match and **zero** refutations occur on a second
seed (else the law set is overstated). Baseline: identity laws only (0 derived instances).
Pass/fail: ≥30% of sampled exercises have a confirmed law; 100% of emitted chains replay in
TS; held-out match ≥95%. If <10% have laws, report and stop (likely for array/string
problems with no algebraic structure).

**7. Failure modes.** Laws are probe-conditional; derived instances cluster near the base
(low diversity); many exercises have no useful law; tautologies must be filtered; a law
confirmed on `b` probes can still be false on held-out inputs — the honest fix is the
refutation record + cross-oracle check (C1), not silence.

**8. Product sketch.** A "mint" button on each solved problem: "generate 10 more like this,
verified offline"; instances carry a small "derived" badge; if a submitted solution
disagrees with a derived instance, that is a bug report against the law, and the law is
demoted. Combined with XFit, a derived instance of exercise A can be checked by a fitted
twin B — two independent oracles, no shared authoring.

**9. Future work.** Law discovery from cross-exercise fits (use XFit edges as candidate
laws); a signed law registry shared across platforms; derive *witnesses* (discriminating
instances) instead of only instances.

**10. References.** GenMorph (valerio-terragni.github.io/assets/pdf/ayerdi-tse-2024.pdf) ·
MemoRIA (10.1145/3643747) · MR-Scout (10.1145/3656340) · MR-Adopt (arxiv.org/abs/2408.15815) ·
QuickSpec (JFP 2017) · Chen et al. metamorphic testing (1998) · wave-41 Alibi probes
(`scripts/py_alibi_verify.py`).

**Novelty grade: new format; mechanism is known.** Do not lead with it; it is strongest as
XFit's offline minting layer.

---

## Candidate 3 — SXC: Shortcut-Exploit Certificates

**1. One line.** For each exercise, search a typed **strategy DSL** over the shipped test
JSON for the *shortest* program that passes every expected output, and ship it as a
certificate (strategy + size in nodes) that says exactly how the example set can be
exploited; a hardening step (reference execution) adds a counter-input.

**2. The big use.** A CI screen that tells an author "these 214 exercises are passed by a
3-node lookup/constant/echo strategy; your examples do not demand the concept" — before
learners find it, and before LLM agents exploit it (CapCode, arXiv 2606.07379).

**3. Real problem evidence.** Test-gaming is now measured in agent coding benchmarks; the
hardcoding literature detects it in student code (FREQTALS patterns, Koli Calling 2023;
JetBrains common-issues study). No bank ships an *adversarial* exploitability certificate.

**4. Closest prior art.** Lookup-table rule-out via MDL (LessWrong write-up), VCP-dimension
(Romanik & Votta, TSE 1993) and teaching dimension formalize "tests pin the concept" but
were never computed for a bank; overfitting-in-synthesis (arXiv 1905.07457) notes
grammar-dependent overfit; hardcoding detectors are pattern-based, not synthesizers.
**Self-test:** "known mechanism + certificate" — yes, likely. The only new part is the
typed DSL over *test data as values* and the shipped size-ranked certificate. **Grade: new
format + small algorithm; weak as a mechanism.**

**5. Formal core.** Strategy DSL: `const(i)`, `lookup(input)`, `nn(input, k)`,
`sorted_expected`, `first/last`, `len`, `type-coerce`, `linear-fit` on numeric tests,
`round_k(expected)`, `echo(input)`, combinations under `if shape == …`. Size = node count;
candidate space enumerated by increasing size (beam). A strategy *passes* iff its output
JSON-equals every shipped expected output (pure TS; deterministic; no Python).
Invariant: a certificate is *evidence of exploitability of the shipped comparator*, not of
test adequacy in general; hard-code the comparator semantics in the checker. Complexity:
O(|DSL|^s · |T|) bounded by beam; trivial at s ≤ 3.

**6. Cheap decisive experiment.** Run over all 5,730 problems (pure TS, seconds). Report the
distribution of minimum passing size, and the list of problems with a ≤3-node pass.
Baselines: (B1) constant strategy; (B2) lookup; (B3) the intended-concept guess. Pass/fail:
the ≤3-node family must *discriminate* (it should fail on ≥90% of problems) and must find
≥N problems where a generalizing strategy (linear-fit, sorted) passes but is not the
intended concept — those are the actionable flags. The hardening step (one counter-input
per flag, via Pyodide) is optional and must be reported separately.

**7. Failure modes.** Passing a DSL strategy ≠ passing *any* program; flags can be false
alarms (the intended concept may coincide with the strategy); no expected-output semantics
for non-JSON output types; the hardening counter-input needs reference execution, which
makes the full loop non-TS.

**8. Product sketch.** An authoring dashboard tab ("the examples you shipped can be passed
by this 2-node program; add a case like `x = []`"); a learner-facing "cheat detector" is
*not* recommended (it teaches cheating); CI gate only.

**9. Future work.** Value-dependent DSL expansion (hash of input → expected index); coupling
to XFit so a *twin exercise's reference* becomes an allowed strategy component; formalizing
the comparator semantics so the certificate is comparator-complete.

**10. References.** CapCode (arxiv.org/abs/2606.07379) · FREQTALS/Koli (ceur-ws.org/Vol-3483/paper5.pdf) ·
JetBrains (arxiv.org/abs/2304.12376) · Romanik & Votta (ittc.ku.edu/~jsv/Papers/RoV93.testing.pdf) ·
teaching dimension (arxiv.org/abs/2010.10012) · overfitting in synthesis (arxiv.org/abs/1905.07457).

**Novelty grade: weak (honest).** Include only as a cheap Stage-0 alarm; do not claim it as
the wave's capability.

---

## Candidate 4 — NOVA: Novelty/Redundancy over the fit graph

**1. One line.** A graph functional over XFit's quotient graph — per exercise, redundancy
(equivalent twins) and novelty (distance to fits of earlier exercises in its path) — used to
*test curriculum claims*: a curated path should introduce new behavior stage by stage.

**2. The big use.** Deterministic, learner-data-free curriculum audit: mark redundant
exercises, detect path stages that add nothing new, and compress 33 paths without losing
behavioral coverage.

**3. Real problem evidence.** Prerequisites in the repo are hand-declared (paths + concepts);
curriculum inference from data is a mature (crowded) field and here there are no response
logs, so only structure is available.

**4. Closest prior art.** Concept prerequisite extraction (LCPRE, CIKM 2024; CSPS, AAAI 2024);
knowledge-space/IRT (heavily used); curriculum ordering heuristics. Those use text or
response data; NOVA uses behavior. **Self-test:** metric-over-graph, not a new mechanism.
**Grade: composition (reject as a headline).**

**5. Formal core.** For exercise `e` at path position `p(e)`: redundancy `ρ(e)` = size of its
XFit equivalence class; novelty `ν(e)` = 1 − max{probe-agreement(e, e') : p(e') < p(e)} (a
bounded probe distance, not edit distance). Prediction: for each consecutive stage pair in
a path, `ν` should not decrease. Complexity O(edges) after XFit.

**6. Cheap decisive experiment.** On the real 33 paths: compute stage-to-stage `ν`
monotonicity; a sign test against chance (50%) and against a text-similarity baseline
(description cosine). Pass: ≥70% of transitions non-decreasing (n ≈ 100+ transitions), and
redundant twins found by XFit are not both required in the same stage. Fail honestly if the
signal is absent; the redundancy census remains useful regardless.

**7. Failure modes.** `ν` depends on XFit's probe budget; stages may legitimately repeat
drills (spacing), so monotonicity is a weak signal; no learner validation possible in-repo.

**8. Product sketch.** `/paths` gains an "audit" tab: "stage 4 repeats stage 2 behavior
(3 twins); stage 5 introduces nothing new"; path compression proposals with evidence.
**9. Future work.** Learner-response calibration once telemetry exists; tie NOVA to LGS
scheduling (wave 40) to avoid redundant review items.
**10. References.** As §4 + wave-40 LGS doc.

**Novelty grade: composition.** Use as a readout of C1, not as a candidate.

---

## Candidates considered and killed (one line each)

- **Adaptive Behavioral Exam** (information-gain input sequencing over program hypotheses):
  crowded — adaptive distinguishing sequences (Lee & Yannakakis, 10.1109/12.272431),
  SYNTRA maximin elimination (arXiv 2509.17393), LEGenT (10.1145/3491140.3528282); and the
  repo has only 1 ghost/problem, so the decisive experiment is data-poor here.
- **MR invariance batteries for grading**: MR inference is solved (GenMorph/MemoRIA/MR-Scout);
  assessment use is a contract over it.
- **Pinning certificates by DSL synthesis** (two distinct programs consistent with the
  tests): the formalization is VCP-dimension (1993) and modern transductive synthesis; also
  every fixed suite is trivially unpinned by a lookup program, so the DSL choice is the whole
  claim. XFit replaces the invented DSL with the bank's own functions.
- **Misconception chaff packs / diagnosis by authored distractors**: Examplar + conceptual
  mutation testing (arXiv 2401.00021); owned in-repo by waves 41–42 (Alibi, BDL).
- **Semantic dedup by embeddings/AST/clones**: HyClone, SCD-PSM, InvAASTCluster (JSS 2025);
  no correspondence search, no witnesses — XFit's delta, and not enough alone.
- **Hardcoding detection in student code**: pattern mining (FREQTALS) detects; SXC is the
  adversarial dual, graded weak.
- **Prerequisite inference for curriculum**: LCPRE (10.1145/3627673.3679597) and CSPS
  (10.1609/aaai.v38i18.30046); reprint risk.
- **Difficulty prediction from code/text**: C-BERT (arXiv 2406.08828), PSG (arXiv 2310.05791);
  ML task, needs labels/telemetry, not a determinism-friendly mechanism.
- **Tolerance/equivalence-policy synthesis for grading**: comparator DSL is a linter;
  discrimination needs a wrong-answer corpus that does not exist here.
- **Counterexample-guided feedback / repair hints**: LEGenT, Apex, Sarfgen (10.1145/3296979.3192384);
  mature research, and a contract-layer proposal would be rejected.
- **Test-suite augmentation by killing mutants**: mutation testing + STING (2026); known.
- **Trace-item / predict-the-output generation**: PRIMM-style tracing-question generation is
  an established area; no new algorithmic core proposed here.
- **Commit/reveal grading transcripts, signed behavioral profiles**: crypto/commitment
  mechanisms over known protocols — KeyFuse/RLV adjacency; contract, not mechanism.
- **Exercise-version semantic diff** (material change classification): wave 44 owns it; would
  be a contract here.

## Final ranking and honest recommendation

1. **XFit** — the only candidate whose *core* (correspondence-constrained, query-bounded
   behavioral fitting producing a witness-carrying quotient graph) I could not match to a
   located system. Build it; the Stage-0 pure-TS scan is already decisive evidence that the
   bank contains semantic duplicates and near-miss edge conflicts that no current tool can see.
2. **PCDI** — build only as XFit's offline minting layer (cross-oracle laws), otherwise it is
   known MR machinery in a new wrapper.
3. **SXC** — cheap Stage-0 alarm; keep out of the headline.
4. **NOVA** — readout of XFit; explicitly not a mechanism.

Cost check for all four: Stage 0 runs in seconds in TS; Stage 1 (Python oracle) is bounded by
the existing probe harness and a 0.25 s/call budget; the four hand-checked pairs reproduce in
under a second. No new dependencies, no network, CPU-only. If Stage 1 misses P1/P2 in §C1,
the honest fallback is Stage 0's pure-TS duplicate/agreement census plus the four verified
ground truths.

Reproduction artifacts (scratch, not committed): shape-signature scan (`46,897` / `14,542` /
`5,159`), pair-grid Python check of the four ground-truth pairs. Queries and URL list are in
the candidate sections; fetch dates 2026-09-19.
