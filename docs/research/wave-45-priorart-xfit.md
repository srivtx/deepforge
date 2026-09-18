# Wave 45 — Prior-Art Attack: XFit (adversarial literature review)

Date: 2026-09-19. Attacker role. Method: read `wave-45-candidates-a.md` §C1, then **49 web
searches** + direct retrieval of the FSE'17 Bach PDF, across: semantic/behavioral clone
detection; differential testing and cross-build differential testing; relational spec
inference (Bach) and theory exploration (QuickSpec); signature/argument-matching in API
differential fuzzing (DeepREL, Xamt); equivalence checking verdicts with counterexamples
(PLDI'23 grading); random-testing equivalence mining (ISSTA'09); OverCode dynamic variable
correspondence; dedup/quotient structures (union-find, entity clustering); test migration
and codebase conversion; registry searches for "equivalence up to renaming/permutation";
hardware sequential equivalence checking (unknown latch mapping); equivalent mutants.
No repo code touched, no git, one file written. All URLs fetched/verified 2026-09-19.

## Verdict: GO-WEAK

**No direct kill was located, but XFit is a composition and its framing overstates the gap.**
The exact clause *"searched argument-role/signature correspondence between two independently
written implementations, using two independent test suites as evidence and probe source"*
has **no located match** (closest: Bach discovers relations *between same-signature functions
over one shared dataset*; DeepREL *constructs* an argument mapping from API metadata; PLDI'23
equivalence grading explicitly requires identical signatures; a 2026 regression-verification
paper states signature alignment for equivalence is an open problem). Clause 2 (cross-suite
fitting: two independent suites as evidence base and probe generators) also has **no located
match**; the nearest is cross-build differential testing (ICST'25), which replays one side's
generated tests on the other build of the same source. Clause 3 (equivalent/refuted/open with
replayable minimized witnesses) is **known**: three-valued equivalence verdicts with
counterexamples are standard (PLDI'23 uses correct/incorrect/unknown with counterexamples for
programming assignments; delta debugging supplies minimization; random equivalence mining
supplies budget-limited partition refinement). Clause 4 (bank-scale witness-carrying behavioral
quotient) has **no located match as stated**: the closest are ISSTA'09's output-partition of
code fragments, DeepREL's matched API groups, OverCode's solution stacks, and PLDI'23's
transitivity-based clustering of submissions *within one assignment* — none is a corpus-level,
correspondence-labeled, witness-carrying quotient. The honest delta is the **object** (a
quotient graph with conditional correspondence edges and replayable refutation edges over a
whole bank), not any single mechanism. Framing "text/clone tools never execute" is **false**
(MeCC, OverCode, ISSTA'09, HyClone all execute); XFit's defensible novelty is narrower and
must be stated at mechanism level.

## Closest work (hostile table)

| Work | Venue/year | URL | What it implements | Clause matched | Clauses not implemented |
|---|---|---|---|---|---|
| **Bach — Discovering Relational Specifications** (Smith, Ferns, Albarghouthi) | FSE 2017, pp. 616–626 | https://pages.cs.wisc.edu/~aws/papers/fse17.pdf · DOI 10.1145/3106237.3106279 | Searches relational specs over a library from one I/O dataset; discovers commutativity, transitivity, **equivalence of two functions**, argument permutations expressible as term relations | C1 (searched correspondence, incl. permutation, *same input space/signature*) | No arity/role mapping across different signatures, no two independent suites, no per-pair verdicts/witnesses, no quotient |
| **Equivalence of Functional Programming Assignments** (Milovančević, Kunčak) | PLDI 2023, PACMPL 7(PLDI) 144 | https://dl.acm.org/doi/10.1145/3591258 · PDF lara.epfl.ch/~milovanc/papers/pldi23.pdf | Per-submission verdicts **correct / incorrect / unknown**, counterexamples for incorrect, transitive-equivalence **clustering** of submissions to discover intermediate references; education deployment (4000+ programs) | C3 (three-valued verdict + counterexample), C4-lite (transitive clustering, one assignment) | Requires **same signature**; no correspondence search; not bank/corpus-level; no minimized replay witness object; no cross-exercise |
| **Random-testing equivalence mining** (Jiang, Su) | ISSTA 2009, pp. 81–92 | https://ink.library.smu.edu.sg/sis_research/954 · DOI 10.1145/1572272.1572283 | Partitions code fragments into functional-equivalence classes by output agreement on random inputs; scales to Linux kernel | C4-lite (behavioral partition), probe evidence | Shared inputs; fragments of one program; no correspondence; no verdicts; no witnesses; no quotient artifact |
| **DeepREL** (Deng, Yang, Wei, Zhang) | FSE 2022 | https://dl.acm.org/doi/10.1145/3540250.3549085 · arXiv 2207.05531 | Infers "relational APIs", **maps source→target arguments via maximum-weight bipartite matching** on names/types, validates value/status equivalence on shared inputs; 238 groups / 13098 accepted pairs | C1-partial (argument mapping constructed), C4-lite (equivalence groups; cross-oracle bug finding) | Mapping is metadata-derived, not behaviorally searched; no independent suites; no refutation witnesses; groups are pair-acceptance, not union-find quotient |
| **Xamt** (Duan et al.) | ISSRE 2025 / arXiv 2025 | https://arxiv.org/html/2508.12546v1 · DOI 10.1109/ISSRE66568.2025.00030 | Matches APIs by names/descriptions/parameter structure, **aligns parameters by normalized names/types**, variance-guided differential fuzzing | C1-partial (interface alignment), differential oracle | Static alignment rules; no searched correspondence; no verdicts; DL-library-specific |
| **Semantic Program Alignment** (Churchill, Padon, Sharma, Aiken) | PLDI 2019 | https://dl.acm.org/doi/10.1145/3314221.3314596 | **Searches an unknown alignment relation** over concrete execution traces of two functions on the same input; proves/refutes equivalence | C1 (unknown correspondence searched — over *states/traces*, same input) | No argument-space correspondence; single shared input; no suite fitting; no bank object |
| **OverCode** (Glassman et al.) | TOCHI 22(2), 2015 | https://dl.acm.org/doi/10.1145/2699751 | Clusters thousands of student solutions to **one** exercise; **executes traces to rename variables that take the same value sequence** ("common variables"); stacks = canonical-form equivalence classes | C1-partial (dynamic variable correspondence), C4-lite (clusters), education diagnosis | Within one exercise/signature; no cross-exercise fits; no refutation witnesses/verdicts; clustering is heuristic dedup, not quotient-with-evidence |
| **HyClone** (Liang et al.) | arXiv, Aug 2025 | https://arxiv.org/abs/2508.01357 | LLM screening + cross-execution validation of Python clone pairs using LLM-generated inputs | C1-partial (execution evidence, cloning) | Same signature required; no correspondence; no verdicts/witnesses; no quotient |
| **MeCC** (Kim et al.) | ICSE 2011 | https://dl.acm.org/doi/pdf/10.1145/1985793.1985835 | Dynamic semantic clone detector comparing **memory states** under test executions | Behavioral clone detection (counter to "clone tools never execute") | Same harness/inputs; no correspondence; no verdict objects; no bank quotient |
| **Cross-build differential testing** (Dietrich et al.) | ICST 2025 | https://www.computer.org/csdl/proceedings-article/icst/2025/10989044/26S4MaM1Nv2 · DOI 10.1109/ICST62969.2025.10989044 | Tests generated for the baseline binary are replayed on independently built binaries; "differential testing … evidence for non-equivalence" | C2-lite (one suite used as evidence on two artifacts) | Same source/signature; no correspondence; no union-find quotient; evidence, not verdict object |
| **Test migration MUT** (ICSE 2024) | ICSE 2024 | https://dl.acm.org/doi/10.1145/3597503.3639124 | Cross-language test migration via **code mapping**, filtering, translation, adaptation (human-in-the-loop) | C2-lite (mapping between signatures across languages) | Mapping is static/manual; no behavioral fitting; no equivalence verdicts |
| **Signature-change regression verification** (Partial Contracts Suffice) | arXiv, Jul 2026 | https://arxiv.org/pdf/2607.10291v1 | States explicitly: RVT/Reve/SymDiff/REGVER **assume shared signature**, and "aligning refactored signatures (parameter reordering, splitting, merging, type changes) for verification-grade equivalence is **an open problem**" | C1 (proves the gap XFit targets was open as of 2026) | — (gap statement, not a system) |
| **Syntactic equivalence up to renaming** (Fink Amores, Sabel) | arXiv 2021/2022 | https://arxiv.org/abs/2106.13520 | Formalizes 8 isomorphism notions for TRS renaming (vars/function symbols, local/global); GI-complete; **syntactic only** | C1-hostile ("renaming-aware equivalence is a known formalization") | No behavior, I/O, test suites, verdicts, or quotient |
| **Clone-detector reality check** (Xu et al.) | arXiv, Jun 2026 | https://arxiv.org/abs/2606.25272 | 11 SOTA semantic clone detectors degrade under semantics-preserving transformations; "shortcut learning" on lexical/structural cues | C1/C4 counter-evidence (static detectors cannot do XFit's census) | — |
| **CPRet** (Zhu et al.) | NeurIPS 2025 D&B / arXiv 2025 | https://arxiv.org/abs/2505.12925 | Problem-to-duplicate retrieval (~700 duplicate pairs) for CP problem banks, text/embedding-based | C4-lite (bank dedup, non-behavioral) | No execution, no correspondence, no witnesses |
| **QuickSpec** (Smallbone et al.) | JFP 2017 / arXiv 2109.03721 | https://arxiv.org/abs/2109.03721 | Equational law discovery among **given** functions over shared QuickCheck generators | C1-adjacent (shared generators, given signature) | No fitting between two programs, no verdicts, no quotient |
| **Equivalent-mutant detection** (survey/empirical TCE) | arXiv 2404.09241; ISSTA 2024 DOI 10.1145/3650212.3680310 | https://arxiv.org/html/2404.09241v1 | Same-program mutant equivalence; undecidable; compiler-optimization/constraint heuristics; ~41.5% detection (TCE+) | C3-adjacent (equivalence undecidability, partial methods) | Same signature by construction; not cross-implementation |

## Clause-by-clause

**C1. Searched argument-role/signature correspondence between two independently written
implementations.** Closest: Bach FSE'17 (searches relations among functions including
equivalence and commutativity/permutation, but over one shared input space and one dataset),
DeepREL (argument mapping constructed by bipartite matching on names/types), Xamt (static
parameter alignment), PLDI'19 (searches an unknown alignment over *state traces* with a shared
input), OverCode (dynamic variable correspondence *within* one exercise), hardware SEC
(unknown latch/state correspondence is searched — van Eijk, TCAD 2000,
http://www.ecs.umass.edu/ece/labs/vlsicad/ece667/reading/eijk-tcad00.pdf). Exact delta:
none of these searches a bounded grammar of **argument projections/permutations/coercions and
output transforms to fit two different call signatures over two test suites**; the Jul 2026
regression-verification paper calls exactly this alignment "an open problem". **Verdict:
new as the specific searched hypothesis; partially known as a formalization pattern (Bach,
Fink–Sabel, PLDI'19, hardware latch mapping).**

**C2. Cross-suite fitting: two independent suites as evidence base and probe generators.**
Closest: cross-build differential testing (ICST'25; one suite replayed on two builds — same
signature/source), DeepREL (shared verifying inputs), Jiang–Su ISSTA'09 (random shared inputs,
one program), HyClone (LLM-generated shared inputs). No located system takes two *shipped,
independently authored* suites, fits under a correspondence, and then draws probes from the
union/queues of both distributions with verdicts. **Verdict: new, but the mechanism is
"union of evidence + resampling", a modest delta over differential testing.**

**C3. Per-pair verdicts equivalent-under-correspondence / refuted-with-witness / open, with
minimized replayable witnesses.** Closest: PLDI'23 grading (correct/incorrect/unknown +
counterexamples for homework submissions), standard equivalence checkers
(proved/refuted/unknown), equivalent-mutant tooling (undecidable ⇒ partial), delta debugging
(Zeller & Hildebrandt, TSE 2002, https://www.cs.purdue.edu/homes/xyzhang/fall07/Papers/delta-debugging.pdf)
for minimization. **Verdict: known.** The combination with correspondence labels and bank-scale
replay is the only part that is not standard.

**C4. Bank-scale behavioral quotient (union-find over equivalence edges) for dedup,
cross-oracle verification, diagnosis.** Closest: ISSTA'09 (output partition of fragments),
PLDI'23 (transitivity-based clustering among submissions to one assignment), DeepREL (238
matched API groups used as cross-oracles), OverCode (solution stacks per exercise),
codewebs-style phrase equivalence classes (reported in OverCode), CPRet (duplicate problem
retrieval, text-based). No located work emits a **corpus-wide, correspondence-labeled,
witness-carrying quotient with cross-oracle instance verification and named diagnosis**.
**Verdict: new object; classic concept (equivalence closure/partition refinement) in a new
carrier.**

## Strongest hostile counterargument (and survival)

*The pieces are all published: Jiang–Su ISSTA'09 already gives probe-based behavioral
partitioning; Bach already searches relational/equivalence/permutation correspondences; PLDI'23
already produces three-valued correctness verdicts with counterexamples **and transitively
clusters equivalent programs in an educational setting**; DeepREL already builds argument
mappings and uses accepted groups as cross-oracles; delta debugging already minimizes
witnesses. XFit is their conjunction; the only new word is "bank".*

XFit survives this **only if** the paper claims the object, not the parts: no located system
performs behaviorally-searched correspondence fitting between two *distinct-signature*
implementations from their own registered suites, attaches conditional evidence (probe family,
budget) and replayable refutations to each pair, and closes that relation over a bank. Each
nearest work provably lacks a required piece: Bach has no independent suites/verdicts/arity
mapping; PLDI'23 *requires* identical signatures; DeepREL's mapping is metadata-derived and
pair-local, no witnesses; ISSTA'09 has no correspondence, no verdicts, no artifact. The
survival is **narrow**: any claim like "first to search correspondences", "first behavioral
clone detector that executes", or "first equivalence verdicts with counterexamples" is
falsified by Bach/PLDI'23/MeCC/OverCode respectively.

## If GO — defensible one-sentence claim

> XFit computes a witness-carrying behavioral quotient of an exercise bank by fitting pairs of
> independently written reference implementations on the union of their own test suites under a
> bounded, behaviorally searched argument/output correspondence grammar, emitting per-pair
> `equivalent(modulo κ)` / `refuted(minimized replayable witness)` / `open(budget)` verdicts and
> closing them into equivalence classes used for cross-oracle instance checks and nameable
> diagnosis.

**Three citations the paper MUST carry (plus two it cannot omit):**
1. Smith, Ferns, Albarghouthi, *Discovering Relational Specifications*, FSE 2017 — closest
   searched-correspondence work; must be cited as the boundary of what "searching relations"
   has meant. https://pages.cs.wisc.edu/~aws/papers/fse17.pdf
2. Milovančević, Kunčak, *Proving and Disproving Equivalence of Functional Programming
   Assignments*, PLDI 2023 — closest verdict/clustering/education work; same-signature
   assumption is the delta. https://doi.org/10.1145/3591258
3. Jiang, Su, *Automatic Mining of Functionally Equivalent Code Fragments via Random Testing*,
   ISSTA 2009 — the probe/partition engine under XFit's step 3; note the candidate doc
   misattributes this to "Ryu et al." — it is Jiang & Su.
Also mandatory: DeepREL (FSE 2022, https://dl.acm.org/doi/10.1145/3540250.3549085) and
OverCode (TOCHI 2015, https://dl.acm.org/doi/10.1145/2699751) — they anticipate argument
mapping and dynamic variable correspondence respectively.

## Corrections to `wave-45-candidates-a.md` §C1 (must be fixed before writing)

- "ISSTA'09 random-testing equivalence … Ryu et al." → **Jiang & Su**, ISSTA 2009.
- "Milovančević & Kunčak OOPSLA'23 (10.1145/3591258)" → DOI is correct but the venue is
  **PLDI 2023** (PACMPL 7, PLDI), not OOPSLA. Also, the real OOPSLA'23 paper at
  10.1145/3591258-adjacent numbering should not be conflated; cite PLDI.
- "semantic clone detectors … require a shared input signature … and never execute" → too
  strong: MeCC (ICSE 2011) compares memory states dynamically; OverCode executes solution
  traces and renames variables by value-sequence equivalence; HyClone cross-executes;
  ISSTA'09 executes. Rewrite as: *existing execution-based tools assume a shared signature and
  a shared input space; none searches an argument/output correspondence grammar.*
- "renaming is static while correspondence here is searched" → OverCode's variable renaming is
  **dynamic** (value-trace equivalence). The defensible contrast is *scope and object*:
  OverCode renames within one exercise for display; XFit searches cross-exercise
  correspondence hypotheses and carries them as evidence-labeled edges.
- Claim "text/clone tools cannot produce" the census → soften to "cannot produce a
  witness-carrying cross-exercise quotient"; CPRet and OverCode already produce
  dedup/cluster outputs at scale.

## Exhaustion record (families queried; no direct match located)

1. **Searched argument-role correspondence between two implementations** — 6 query variants
   ("input correspondence"/"argument correspondence"/"permutation"/"arity"/"signature
   mismatch"). Only Bach (same input space), DeepREL/Xamt (constructed alignment), hardware
   SEC (state mapping), PLDI'19 (trace alignment). The Jul 2026 open-problem statement is the
   strongest evidence the exact clause is unoccupied.
2. **Cross-suite fitting / two independent suites as evidence + probe source** — 5 variants.
   No match; nearest is single-suite-replayed differential testing and cross-build diff.
3. **Per-pair verdict objects with minimized replayable witnesses** — known (PLDI'23,
   equivalence checkers, delta debugging); no system labels verdicts with a correspondence
   hypothesis.
4. **Bank-scale behavioral quotient with witnesses** — 5 variants (dedup by behavior, function
   corpus equivalence classes, quotient/graph, exercise banks). Only partition/clustering
   precedents, none corpus-level or witness-carrying.
5. **"Learning with/up to renaming" as a formalization** — searched grammatical inference,
   automata learning, neurosymbolic renaming. Found only syntactic/α-renaming invariance
   (Fink–Sabel TRS, arXiv 2106.13520; ML symbol-invariance papers) — **no behavioral
   equivalence-under-unknown-renaming formalization; not a kill.**
6. **Semantic clone detection (HyClone, SCD-PSM, InvAASTCluster, Olech, Stack/ACER)** —
   HyClone, MeCC, ISSTA'09, Kitsios ASE'25 (arXiv 2510.04143), Xu et al. 2026 (arXiv
   2606.25272) located; **SCD-PSM, Olech, ACER could not be located under those names** in 3
   targeted queries (likely community/informal names); the family verdict does not depend on
   them — all located detectors are static or shared-signature execution.
7. **Cross-language translation/test migration** — MUT (ICSE'24), GlueTest (ICSME-NIER'24),
   cross-lingual clone detection (arXiv 2408.04430) — mapping is static/manual or
   language-runtime-interop, not behaviorally fitted.
8. **Duplicate exercise/problem detection in education** — CPRet (arXiv 2505.12925),
   OverCode, Codeforces duplicate-problem folklore; all text/static/cluster-based, none
   behavioral-with-witnesses.
9. **Active distinguishing-input learning (L*, W-method, ADS, conformance)** — Berg et al.,
   FASE 2005 (https://wwwbroy.in.tum.de/publ/papers/leucker_fase05.pdf) and Lee–Yannakakis
   (DOI 10.1109/12.272431) are the known probe-generation machinery; XFit adds no query
   theory and should not claim any.
10. **Surveys that would subsume XFit** — none located: clone-detection surveys (semantic
    clone taxonomies), relational-verification literature (shared-signature assumption), and
    differential-testing surveys do not cover searched cross-signature fitting with
    witness-carrying verdicts.

**Bottom line.** KILL is not supported: no direct match, and a 2026 paper explicitly names the
signature-alignment problem open. Full GO is also not supported: C3 is known and C1/C2/C4 have
close structural precedents. Build it as **GO-WEAK**, with the quotient/witness object as the
headline mechanism and the four corrections above applied.
