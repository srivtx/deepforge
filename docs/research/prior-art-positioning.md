# Prior-art positioning: Alibi Distance, Behavioral Delta Ledger, Refutation-Ledger Values

Analysis-only document. This file contains **recommended wording**, not applied wording. It does
not edit any paper prose and does not edit anything under `src/data/inventions/`.

Search and verification method: web search on 2026-09-27 against ACM DL, arXiv, Springer, author
copies, White Rose eTheses, and GitHub. Every reference in the *Verified* sections below was located
and read during this pass. Anything I could not confirm is in §9 and must not be cited until checked.
Where a claim in the papers rests on a citation I could not verify, that is flagged inline.

---

## 1. Abstract (honest)

None of the three artifacts introduces a new mechanism. All three apply established mechanisms to a
setting they were not written for, and the honest summary for each is "new measurement / new
instrument / new composition," not "new method."

**Alibi Distance** is mutation analysis of an education corpus, with the surviving mutants
aggregated into a *minimum-distance* statistic instead of a mean adequacy score. Survival of
shipped autograding test suites in CS education has been measured repeatedly and published for
over a decade (Clegg et al. 2019/2020, Perretta et al. 2022, Clegg's 2022 Sheffield thesis, Shams
2015, Delgado-Pérez et al. 2021, Hall & Baniassad 2022, Mansur et al. 2024), and the
diagnose-then-close loop — "find a program variant that survives the suite, then write the test
that kills it" — is the published method of STING/PROBE (Li et al., ASE 2026) and a decade older
than that. What is genuinely new here is narrow: a 5,730-exercise census run twice by
independently written engines under real CPython execution; an oracle-versus-cross-validated
accounting of closure that reports its own loss (73.22% in-sample versus 48.35% held-out); and two
falsified predictions reported in place. The paper's own priority claim — "the first census of
radius-1 silent survivors" — is **not supportable** and should be retired.

**Behavioral Delta Ledger** is differential testing in miniature, wrapped in a deterministic probe
basis, wrapped again in a count-only learner-facing card. Every ingredient is standard: behavioural
traces of student code are a fifteen-year-old research programme (Zhang et al. 2023 on trace
features, Piech et al. 2014 on programming pluralism, Jemmali et al. 2020 on debugging sequences,
parse-tree tracking in 2025), and "show the student a program their tests did not catch" is Smith
et al. 2017. The ledger's specific contribution is a measurement definition (an exact behavioural
no-op over a hidden basis, with the fix/break churn bug found and fixed) and a shipped instrument.
The honest limitation the paper already states — no human data at all — is a genuine gap here, in
contrast to Alibi Distance's version of that limitation (see §3.1).

**Refutation-Ledger Values** is the most conventional of the three. Every individual mechanism is
decades old: truth-maintenance retraction (Doyle 1979, de Kleer 1986), provenance semirings
(Green et al. 2007), accrual of arguments, dependence-aware source fusion (Dong, Berti-Equille &
Srivastava 2009; Li et al. 2016), Assurance 2.0 defeaters, and hash-chained append-only audit
ledgers. What is offered is a small API-level contract: ledger as warrant, grade as a recomputable
function of that ledger, exact demotion through frozen cites. I could not locate a prior work that
composes exactly these three, which is a defensible negative result *provided it is stated as a
negative literature result and not as a positive claim*. The Derived-Claim Arena, however, does
**not** produce empirical evidence: its ground truth is generated from a blind-spot table and the
shipped relation B7 is defined by that same table, so B7 and the analysis-only oracle B8 coincide by
construction. The +1.000 pair-win, +1.000 AUC and +1.000 AP@12 gaps are algebraic consequences of the
generator, not measurements of anything external. This must be stated plainly.

---

## 2. Consolidated placement table

| Artifact | Nearest established neighbourhood | The mechanism that is *not* new | The thing that is arguably new | Honest taxonomy verdict |
|---|---|---|---|---|
| **Alibi Distance** | Mutation analysis / mutation score applied to autograding suites (Clegg 2019, 2020; Perretta 2022; Clegg thesis 2022); survivor-guided test augmentation (Li et al. ASE 2026); differential testing (McKeeman 1998) | Single-edit AST mutants, the survival/kill dichotomy, mutation score, the witness-plus-reference-output test, greedy set cover over witnesses | (a) minimum-radius aggregation of survivors into a corpus statistic α(p); (b) 5,730-exercise census with two independent engines and real execution; (c) oracle-vs-cross-validated closure accounting; (d) two falsified predictions; (e) 96-item machine-verified practice set | **NEW MEASUREMENT** (the α(p) aggregation and the CV closure protocol) + **NEW EMPIRICAL DATASET** (the census, if released) + **NEW COMPOSITION**. **NO** new method. Priority claims not supportable. |
| **Behavioral Delta Ledger** | Learning analytics / behavioural-trace analysis in programming education (Zhang 2023; Jemmali 2020; Piech 2014; parse-tree tracking 2025); differential testing; test-signature feedback (Smith 2017) | Edit-based change measurement, behavioural signatures, "did this edit change anything", the pass/fail autograder loop | (a) exact behavioural-no-op definition over a hidden deterministic basis, with the churn bug found and corrected; (b) the count-only opt-in instrument; (c) the honesty ladder (in-sample → held-out collapse → four dead predictions) | **NEW MEASUREMENT** + **NEW SYSTEM OR INSTRUMENT** + **NEW COMPOSITION**. Not a new construct. |
| **Refutation-Ledger Values** | Truth maintenance (Doyle 1979 / de Kleer 1986); provenance semirings (Green 2007); dependence-aware evidence fusion and truth discovery (Dong 2009; Li 2016); Assurance 2.0 defeaters; append-only signed audit ledgers (FalsiFlyer; falsification-ledger) | Append-only chains, hash-linked tamper evidence, grade-from-evidence, retraction through a dependency graph, correlated-source discount | (a) the value-level ledger→grade→cite-demotion *contract* as one API; (b) a dependence-class counter with a K cap and cited-value minimum. The arena is **not** a contribution | **NEW SYSTEM OR INSTRUMENT** (the contract). **NO CONTRIBUTION (reproduction only)** for the arena's +1.000 headline, which restates a known result inside a synthetic generator. |

---

## 3. Alibi Distance

### 3.1 Closest established concepts

**Mutation testing and mutation analysis.** This is the parent and it must be dealt with head on.
An "alibi" as defined in §3 of the paper is exactly a *surviving mutant*: a single-edit rewrite of
the reference that the shipped test suite does not kill. `Pass(p) = { g in E(f) : pass(g,T) }` is
the surviving-mutant set. `P(alpha=1)` is "the problem admits a surviving mutant." The paper says
this in §2; the problem is that the *scale of prior measurement* is not acknowledged. Mutation
survival of autograding test suites in CS education is a well-populated published line:

- **Clegg, North, McMinn & Fraser (ICSE-SEET 2019)** built mutation operators derived from a real
  classification of student mistakes, explicitly to detect *which mistake types an autograder
  misses* and *which it unfairly punishes* (verified: `eprints.whiterose.ac.uk/id/eprint/163399`).
- **Clegg, McMinn, Fraser et al. (ICER 2020)**, doi `10.1145/3408877.3432411`: 197 student Java
  classes across three assignments; mutants "capture the observed faulty behaviour of students'
  solutions" (verified).
- **Perretta, DeOrio, Guha, Bell, Ryu & Smaragdakis (ISSTA 2022)**, doi `10.1145/3533767.3534217`:
  2,711 student submissions; mutation score correlates with manually-seeded fault detection and
  moderately strongly (r 0.67–0.79, rising to 0.86–0.89 after removing non-mutant-coupled faults)
  with faulty student implementation detection (verified).
- **Clegg (PhD thesis, Sheffield, 2022)**, `uk.bl.ethos.858756`: asks directly whether inadequate
  grading test suites generate unfair grades, over many exercises, and evaluates mutant detection
  against student faults (verified).
- **Shams (2015 dissertation)**: ~36,500 authentic human-written student errors; 1,971,073 test
  runs; all-pairs beats mutation analysis as a defect-detection predictor, coverage measures
  correlate weakly (verified).
- **Delgado-Pérez et al. (ICSE 2021, SEIP)**: student test suites at 8%–61% mutation score, mean
  31% (verified).
- **Hall & Baniassad (SPLASH-E 2022)**, doi `10.1145/3563767.3568132`; **Kazerouni et al. (2021)**,
  1,389 student projects; **Mansur, Shaffer & Edwards (2024)** (verified).

> **Borrowable idea:** surviving single-edit mutants as the fault model; the equivalent-mutant
> caveat; the observation that *more tests is not a tighter suite*.
> **Where it stops:** DeepForge's 16.50% corpus survival rate is a normal mutation score on a
> corpus of small pure functions. It is not evidence of anything the mutation-testing literature
> does not already predict, and 16.50% must never be presented as a discovery.

**The 77% problem.** Li, Xu, Wang, Tan & Chen, *Probe to Generate* (arXiv:2604.01518, ASE 2026)
report that **77.0% of SWE-bench Verified instances admit at least one surviving program variant**
(verified, including the ASE 2026 acceptance and the numbers). A reader will line DeepForge's
46.08% up against that number and conclude DeepForge's aperture is *lower* on a *harder* measure.
The denominators are not comparable (instances vs exercises; LLM-based mutation reaching 76% of
instances vs eleven fixed operator families; patch-region code vs whole reference functions), but
**the paper must say so explicitly**, because the current related-work paragraph (§2) treats STING
as a method comparison and never confronts the 77% figure.

**Test adequacy criteria and their critiques.** The long "which criteria predict real defects"
argument is the direct ancestor of DeepForge's headline caution. Inozemtseva & Holmes 2014 showed
coverage is weakly correlated with suite effectiveness; Just et al. 2014 is the strongest available
evidence that mutants track real faults. Both are already cited and both are correct to cite. What
they establish for us: the mutation–fault *coupling* is not an open question in general. It has
been measured in industry (Just et al.) and **in CS education specifically** (Clegg 2019/2020,
Perretta 2022, Clegg thesis 2022). DeepForge's §10 says the coupling "is assumed, not measured."
As stated that is true *of this corpus* and misleading *about the field*, because the field has
measured it on richer data than DeepForge has. This is a **framing defect, not a novelty claim**,
and it must be repaired (§3.5, W3).

**Automated programming assessment and its validity threats.** Paiva, Leal & Figueira's state-of-
the-art review (ACM TOCE 2022, doi `10.1145/3513140`) and their 2024 clustering paper (doi
`10.1007/s41060-024-00554-5`) (both verified) establish that autograding adequacy is a studied
object with a review literature. The specific threat DeepForge measures — a test suite that admits
wrong programs — is the *central* documented threat to autograding validity.

**Formal equivalence checking of student submissions.** This is the most under-credited
neighbourhood and it does not appear at all in the Alibi Distance related-work section.

- **Milovančević & Kunčak (PLDI 2023)**, *Proving and Disproving Equivalence of Functional
  Programming Assignments*: >4,000 programs, 15 assignments, Stainless, clustering over equivalence
  (verified).
- **Milovančević, Bucev, Wojnarowski, Chassot & Kunčak (2025)**, doi
  `10.1007/978-3-031-91121-7_7`, extended TOPLAS version at
  `lara.epfl.ch/~milovanc/papers/toplas26.pdf`: 1,700+ submissions, live in-classroom deployment;
  reports that the LAV verifier found **35 incorrect submissions out of 266 that passed the test
  suite** (verified). That is the Alibi Distance phenomenon, measured with a sound method instead
  of a sampling method.
- **Liu, Wang, Wang & Wu (ICSE-SEIP 2019)**, AUTOGRADER: weakest-precondition and path-deviation
  differential analysis of submissions against a reference (verified).

> **Borrowable idea:** equivalence or counterexample as the oracle rather than a test suite.
> **Where it stops:** DeepForge's probe bank is an *approximation* of the same query, bounded to 48
> deterministic inputs, and the paper is honest that 18.37% of problems have survivors it cannot
> resolve at all. That is a weaker instrument than a verifier and must be described as such.

**Code clone / similarity detection.** Partially adjacent: the witness is a "minimal pair" and the
duel is a two-program comparison, but no clone detection is performed. Dolos (Maertens et al. 2022,
doi `10.1111/jcal.12662`) and Novak, Joy & Kermek's systematic review (doi `10.1145/3313290`)
(verified) are the neighbourhood. **Nothing is borrowed** and nothing should be claimed here.

**Flaky tests and test-suite inadequacy.** Luo, Hariri, Eloussi & Marinov (ESEC/FSE 2014, doi
`10.1145/2635868.2635920`) (verified) is the canonical citation. DeepForge borrows nothing; the
timeout-exclusion decision is the only contact point. Do not imply a contribution.

**LLM-generated and AI-assisted programming education assessment.** The closest verified items:

- **arXiv:2411.09261 (v2, 18 Nov 2024)**: GPT-4-generated test suites for 26 CS1 problems run over
  25,000+ student attempts; **instructor-written suites failed to identify 14.6% of invalid
  solutions** while LLM suites failed on 0.2% (verified). This is the single most damaging
  comparison for the "first census" claim: a large, education-specific, published measurement of
  the *same* silent-pass phenomenon, two years old, on a different corpus.
- **Padurean, Denny & Singla (SIGCSE TS 2025)**, doi `10.1145/3641554.3701974` (verified).
- **Padurean et al. (ICER 2026)**, arXiv:2607.05068, 2,636 sessions / 917 students (verified).
- **Caraco, Lojo, Verdicchio & Fox (SIGCSE 2024)**, doi `10.1145/3626252.3630786` (verified).
- **Prasad, Greenman, Nelson & Krishnamurthi (2024)**, doi `10.22152/programming-journal.org/2024/8/7`,
  arXiv:2401.00021 (verified).
- On assessment validity under GenAI: **Bearman, Tai, Dawson, Boud & Ajjawi (2024)**, doi
  `10.1080/02602938.2024.2335321`; **Lodge, Howard, Bearman, Dawson & Associates (2023)**, TEQSA
  (both verified).

### 3.2 What DeepForge adds

- A **minimum-radius aggregation**: α(p) = min edit distance to a surviving mutant, reported as a
  corpus statistic. Mutation adequacy is always reported as a mean or a ratio. The minimum is a
  weakest-link statistic, and the distinction is real.
- A **census at corpus scale with execution** and a **second independently written engine** that
  agrees to 0.2 percentage points. The two-engine agreement is the most reproducible result here.
- A **cross-validated closure estimate** (73.22% oracle → 48.35% held-out → 23.5–23.8% deployable
  affected). This is standard cross-validation applied honestly to a survivor-closure procedure.
  STING/PROBE validates its tests by "passes on P_gt, fails on ≥1 surviving variant, robust under
  behaviour-preserving transformations" and does **not** report a held-out kill rate (verified from
  the paper text). Reporting the oracle-versus-holdout loss for witness closure is a genuine
  methodological contribution, and it is the one I would defend.
- Two **falsified predictions** reported in place.
- A 96-item machine-verified practice set with an explicit resistance gate, plus a documented
  record that the first bank was 74–78% solvable and the second 84/96 convincible.

### 3.3 Comparison matrix — Alibi Distance

| Closest work | Shared mechanism | What DeepForge does differently | What DeepForge adds | Verdict |
|---|---|---|---|---|
| Mutation analysis (DeMillo 1978; Jia & Harman 2011; Papadakis 2019) | Deliberate small edits; surviving-mutant set; mutation score | Aggregates survivors by **minimum edit radius** per exercise and over a corpus; measures the *suite* rather than one program under test | α(p), the aperture, the length/difficulty confounds | **NEW MEASUREMENT** |
| Clegg et al. 2019; Clegg et al. ICER 2020; Perretta et al. 2022; Clegg thesis 2022 | Mutation analysis of CS autograding test suites; student-mistake operators; mutation↔student-fault correlation | 5,730 exercises, pure-Python AST families, two engines, no student data at all | Census at 10× scale with dual-engine replication; explicitly *declines* the coupling study those papers did | **NEW EMPIRICAL DATASET** (census) / **NO CONTRIBUTION** (coupling) |
| Shams 2015; Hall & Baniassad 2022; Delgado-Pérez 2021; Mansur 2024 | Mutation score as a classroom adequacy measure; curated mutants; test-writing pedagogy | Does not grade student tests; mines a *shipped* suite | Per-problem aperture report for authors | **NO CONTRIBUTION (reproduction only)** |
| STING / PROBE (Li et al., ASE 2026, arXiv:2604.01518) | Surviving variants diagnose weak suites; generate a test that kills the survivor; validate by pass-on-reference | Python exercises, not patches; deterministic probe bank; appends the witness + reference output with **no LLM test synthesis**; reports held-out generalisation | Cross-validated closure accounting; no model in the loop; education corpus | **NEW COMPOSITION OF EXISTING MECHANISMS** |
| Differential testing (McKeeman 1998) | Two comparable programs, same inputs, divergence as oracle | Fixed pair (reference, one-edit ghost), manual probe | The Silent Bug Hunt duel | **NO CONTRIBUTION (reproduction only)** |
| Formal equivalence autograding (Milovančević & Kunčak PLDI 2023; Milovančević et al. 2025; AUTOGRADER ICSE-SEIP 2019) | Reference-vs-submission semantic comparison; counterexample as verdict | Bounded 48-input approximation; 18.37% of problems unresolved | Cheap, sound-in-one-direction surrogate for a verifier | **NEW COMPOSITION** (a sound method is approximated by a sampled one — a downgrade in rigour, honestly labelled) |
| Inozemtseva & Holmes 2014; Just et al. 2014 | Coverage↔effectiveness weak; mutants↔faults moderate | Applies both cautions; keeps coupling at arm's length | — | **NO CONTRIBUTION (reproduction only)** |
| DSpot (Danglot et al. 2019) | Test amplification from seeds | Appends a witness directly; no amplification search | — | **NO CONTRIBUTION (reproduction only)** |
| LLM test suites for CS1 autograding (arXiv:2411.09261) | Autograding suites silently admit invalid solutions; measured at scale | Deterministic operator families, no LLM; measures the *platform's own* corpus | — | **NO CONTRIBUTION (reproduction only)** — and a direct threat to any "first" claim |
| BugSpotter 2025; AI Wrong on Purpose 2026; FPPgen 2024; Katabench | Mutant-as-practice; buggy code that *fails* the suite | Ghosts that *pass* the suite | The silent case as a practice object | **NEW COMPOSITION** |
| Smith, Tang, Warren & Rixner (ITiCSE 2017) | Show the student implementations their tests miss; signatures over student solutions ∪ mutants | Ghost is mined from the reference, not from a real student program | Deterministic curation gate | **NEW COMPOSITION** |

### 3.4 Taxonomy verdict — Alibi Distance

- **NEW MEASUREMENT** — the α(p) minimum-radius adequacy statistic, and the oracle-versus-held-out
  closure protocol. Defensible, and the strongest claim in the paper.
- **NEW EMPIRICAL DATASET** — the 5,730-exercise census with two engines. Defensible **only if the
  raw artifacts are released**; the paper itself says the mining run is not committed and lives in
  scratch directories. A census that cannot be re-derived from the repository is a claim, not a
  dataset.
- **NEW COMPOSITION OF EXISTING MECHANISMS** — the whole pipeline, and the Silent Bug Hunt route.
- **NO new method, construct, or capability.** Mutation analysis, witness tests, greedy set cover,
  differential testing and cross-validation are all prior.
- **No "first".** See §7.

### 3.5 Recommended wording changes (weakening / clarifying only)

**W1 — §1 "What we contribute" bullet (i).** This is the most exposed sentence in the corpus.

> Current: "What we contribute is: (i) the first census of radius-1 silent survivors on a large
> verified education corpus, computed with real execution; …"

> Replace with: "What we contribute is: (i) a census of radius-1 silent survivors over this
> platform's 5,730-exercise corpus, computed with real execution and replicated by a second
> independently written engine. Survival of autograding test suites in CS education has been
> measured before (Clegg et al. 2019, 2020; Perretta et al. 2022; Clegg 2022), and LLM-generated
> suites for CS1 autograding have been compared against instructor suites on 25,000+ attempts
> (arXiv:2411.09261); we did not attempt a systematic survey and therefore make no priority claim.
> The difference is the aggregation, not the existence of the phenomenon."

**W2 — §1 last sentence, novelty assertion.**

> Current: "The technique this paper reports is invented in DeepForge research wave 41 …"

> Replace with: "The measurement reported here was constructed in DeepForge research wave 41. Its
> components — single-edit mutants, the surviving-mutant set, a deterministic execution probe — are
> standard mutation-analysis practice; the assembled procedure and the α statistic are what this
> paper describes."

**W3 — §10 first paragraph and §7 list, the coupling limitation.**

> Current: "The most important limitation is the one no offline method in this wave can fix:
> mutation-slip coupling is assumed, not measured."

> Replace with: "The most important limitation of this measurement is that mutation–slip coupling
> is assumed rather than measured *in this corpus*. It is not an open question in the field:
> mutants have been shown to track real faults at scale (Just et al. 2014) and to track faults in
> *student* implementations in CS courses (Clegg et al. 2019, 2020; Perretta et al. 2022; Clegg
> 2022). We cannot reproduce those results here because the platform has no human false-pass data
> and no student submissions to fault-label. The consequence is narrow and should be stated as
> such: α(p) is a property of this corpus and this edit model, and the prior work above is the
> evidence that such a property is *likely* to be educationally meaningful — it is not evidence
> that it is, for this corpus."

**W4 — §2, the STING paragraph.** Add the missing confrontation.

> Add after the existing STING sentence: "The two apertures are not comparable and should not be
> compared: PROBE reports 77.0% of SWE-bench Verified *instances* admit at least one surviving
> variant, measured over patch-region code with LLM-based mutation reaching 76% of instances
> alongside operator mutation at 10%. Our 46.08% is over *exercises*, over whole reference
> functions, and under eleven fixed operator families with no LLM-generated variants. The ordering
> of the two numbers says nothing about either study."

**W5 — §2 and T1, the STING reference itself.** The arXiv v1 names the system **STING**; the
current arXiv/ASE version names it **PROBE** and is titled *Probe to Generate*. The repository cites
"STING 2026 … arxiv.org/abs/2604.01518". Keep the URL; add the rename so a reader who searches
"STING" and finds "PROBE" is not confused.

> Reference text to use: "Li, Xu, Wang, Tan & Chen 2026, Probe to Generate: Program Variant-Guided
> Test Augmentation for Repository-Level Repair Benchmarks, arXiv:2604.01518, accepted ASE 2026
> (earlier arXiv versions name the system STING)."

**W6 — §5, the oracle numbers.** The 73.22% / 18.56% figures are already labelled in-sample in the
body and abstract. That labelling is correct and should be kept verbatim. Add one sentence making
the comparison to STING's validation explicit, so the CV protocol reads as a contribution rather
than as an unexplained caveat.

> Add: "PROBE validates its generated tests structurally (each must pass on the reference patch,
> fail on at least one surviving variant, and survive behaviour-preserving transformations) and
> does not report a held-out kill rate. The cross-validated number here is therefore not directly
> comparable to its reported gains, and we offer it as a caution about in-sample survivor-closure
> accounting rather than as a competing estimate."

**W7 — §4, the "usable authoring signal" sentence about categories.** The paper already concedes
the length/branching confound. It does not concede that the ordering is therefore a property of the
*edit model*, not of the corpus.

> Current: "The ordering is a usable authoring signal: a review queue that looks at Statistics
> first will find roughly twice the aperture of one that starts with Deep Learning."

> Replace with: "Within this corpus and this edit model, the ordering is a usable authoring signal:
> a review queue that looks at Statistics first will find roughly twice the aperture of one that
> starts with Deep Learning. The ordering is a joint property of the corpus, the eleven families and
> the sampling cap, and would be expected to move if any of the three changed."

**W8 — §9 reproducibility.** The paper concedes the raw run is not committed. That concession
undercuts "new empirical dataset" more than any citation would. Recommend either committing a
reduced artifact (e.g. the 7,727 alibi records with their witnesses, or a content-addressed
manifest plus the two engines) or dropping the word "census" in favour of "one run over the corpus,
replicated by a second engine."

---

## 4. Behavioral Delta Ledger

### 4.1 Closest established concepts

**Learning analytics and behavioural-trace analysis in programming education** — this is the real
home neighbourhood and the paper acknowledges it only via Jadud (2006).

- **Zhang et al. (2023)**, *Utilizing programming traces to explore and model the dimensions of
  novices' code writing*, Computer Applications in Engineering Education, doi `10.1002/cae.22622`:
  614 students, 11 trace features, four factors (style, syntactic, semantic, syntactic-debugging),
  measurement invariance across two new datasets (verified). The feature families it enumerates —
  added/deleted/modified lines, AST edit distance, error counts, time-on-task — are precisely the
  trace channels BDL reads.
- **Jemmali, Kleinman, Bunian, Almeda, Rowe & Seif El-Nasr (SIGCSE 2020)**, doi
  `10.1145/3328778.3366824`, MAADS: mixed-method analysis of *debugging sequences* of beginner
  programmers (verified).
- **Piech, Blikstein, Worsley, Sahami, Cooper & Koller (2014)**, Programming Pluralism, J. Learning
  Sciences 23(4):561–599, doi `10.1080/10508406.2014.954750` — sequence mining over student
  programming behaviour (verified via citation trail).
- **arXiv:2509.03668 (2025)**, *Parse Tree Tracking Through Time for Programming Process Analysis
  at Scale*: automated tracking of parse-tree node edits, replicating Brown et al. (2024)'s manual
  line-edit tagging (verified).
- **Beck & Mohammadi-Aragh (ASEE 2021)**, *Timeline of Program Development*: CREATE / UPDATE / DELETE /
  RUN_SUCCESS / RUN_FAIL event compression from a Python IDE (verified).
- **López-Pernas, Lehdonvirta & Lye** — process and sequence mining over combined systems
  (referenced consistently in the trace literature; **not independently verified in this pass** —
  see §9).

> **Borrowable idea:** the submission/event trace as the unit of analysis; edit-based change
> features; clustering students by problem-solving pattern.
> **Where it stops:** BDL's input is *not* a learner trace. Every walk, ghost rate and no-op rate is
> produced by a synthetic policy over AST mutants. The paper says this clearly (§1, "there is no
> human data"). That honesty is a real strength and must be preserved. What remains, empirically, is
> a property of the *generator*.

**Differential testing** (McKeeman 1998) — the ledger is a differential test with a fixed pair and a
count-only output. Borrowed whole.

**Test-signature feedback** — **Smith, Tang, Warren & Rixner (ITiCSE 2017)**, *An Automated System
for Interactively Learning Software Testing*: the submitted test suite is scored against a corpus of
incorrect implementations (student solutions ∪ `mutpy` mutants), and the student is *shown buggy
implementations their tests do not detect*, grouped by shared *test signature* (verified). The
"test signature" is BDL's "behavioural signature"; the show-the-uncaught-program is BDL's
underlying feedback philosophy. This is the closest single paper and the BDL related-work section
does not mention it.

**Mutation testing** — the eleven families and the single-edit sampling are inherited wholesale, and
the paper says so.

**Automated assessment validity / GenAI** — Bearman et al. 2024 and TEQSA 2023 (verified) frame
*process* evidence as the assessment-design response to GenAI. BDL is a process-evidence instrument,
which means the GenAI-assessment literature is directly relevant context and is currently absent.

**Flaky tests** — Luo et al. 2014 (verified). BDL's fresh-copy protocol and its finding that a
shared-object protocol flaked on 9 problems and disagreed with fresh-copy on 8 is a real, small
contribution to reproducibility hygiene in an autograding harness, and it is the kind of thing a
methods reviewer will respect.

### 4.2 What DeepForge adds

- An **exact behavioural no-op** definition (text changed, signature byte-identical, visible mask
  unchanged) with a **found and corrected bug**: the original Churn = |Fix| + |Break| missed
  nonzero→nonzero transitions and called behaviour-changing edits ghosts. Publishing the correction
  is good practice and is stated.
- A **hidden deterministic probe basis** built from the exercise's own tests, with a documented
  product/research seed divergence (md5 vs FNV-1a) and an explicit statement that the product does
  not claim bit-identical bases.
- A **leakage-controlled protocol** (basis from odd-index tests, scoring on even-index tests) that
  collapses in-sample rates to 84.00%/82.23% and *deletes the directional copy*. This is the
  strongest methodological posture in the entire portfolio: a result that did not survive
  generalisation was used to remove product features.
- A **count-only, opt-in, device-local** instrument with a mechanical no-state-write rule and a
  source-scan test.

### 4.3 Comparison matrix — BDL

| Closest work | Shared mechanism | What BDL does differently | What BDL adds | Verdict |
|---|---|---|---|---|
| Programming-trace analytics (Zhang 2023; MAADS 2020; Piech 2014; parse-tree tracking 2025; Beck 2021) | Behavioural/edit traces of student code as the analytic object; edit-based change features | Analysed object is a *simulated* edit walk over AST mutants, not a learner | Nothing empirical; a measurement definition and constants | **NEW MEASUREMENT** (definition only) |
| Smith, Tang, Warren & Rixner (ITiCSE 2017) | Test signatures over a corpus of uncaught incorrect programs; show the student what their tests miss | Delta between two consecutive *learner* programs, count-only output, no verdict, no corpus of student solutions | The consecutive-pair delta and the exact no-op event | **NEW COMPOSITION OF EXISTING MECHANISMS** |
| Mutation analysis (DeMillo 1978; Jia & Harman 2011; Papadakis 2019) | Single-edit operator families as a slip model | Object is the *edit's behavioural delta*, not mutant survival | — | **NO CONTRIBUTION (reproduction only)** |
| Wave 41 / Alibi Distance (this repo) | Probe-bank divergence visibility | Own object: delta between consecutive learner programs | No-op, churn, held-out collapse | **NO CONTRIBUTION (reproduction, correctly labelled as such in the paper)** |
| Differential testing (McKeeman 1998) | Divergence between two programs as oracle | Output is a count, never a verdict | — | **NO CONTRIBUTION (reproduction only)** |
| Jadud (2006); Jadud-style flailing | Novice futility as a behavioural event | Judges by behavioural delta rather than error count | — | **NO CONTRIBUTION (reproduction only)** |
| Errorful learning (Kornell 2009; Metcalfe 2017); desirable difficulties (Bjork & Bjork 2020) | Re-encountering one's own wrong program; exposure as practice | Replay shelf is a product surface with no outcome measurement | — | **NO CONTRIBUTION (reproduction only)** |
| Assessment validity under GenAI (Bearman 2024; TEQSA 2023) | Process evidence as the design response to GenAI | Not framed in that literature | — | **NO CONTRIBUTION (reproduction only)** |
| Flaky-test discipline (Luo et al. 2014) | Determinism of test outcomes; non-determinism taxonomy | Applies it to an autograding harness's argument protocol | Fresh-copy protocol + 8-mutation finding | **NEW SYSTEM OR INSTRUMENT** (small) |

### 4.4 Taxonomy verdict — BDL

- **NEW MEASUREMENT** — the exact behavioural-no-op and churn definitions, with the corrected
  formulation and its permutation/held-out controls.
- **NEW SYSTEM OR INSTRUMENT** — the `/ledger` count-only route and the fresh-copy protocol.
- **NEW COMPOSITION** — the assembly.
- **NO** new construct: behavioural signatures, edit deltas and "did anything change" are all
  established.
- **Empirically: NO CONTRIBUTION.** Every number in §4 and §5 of the paper is a property of a
  synthetic generator. The paper already says so in boldface in the right places; that honesty is
  the finding, and it is more valuable than any number it deletes.

### 4.5 Recommended wording changes (weakening / clarifying only)

**W9 — §1 callout "Novelty, stated honestly", first sentence.** The current wording leads with the
replicated phenomenon, which invites the reader to score BDL on Alibi Distance's work.

> Current: "The visibility of hidden-basis divergence is wave 41's result, replicated here
> (44.40% of problems carry a test-passing slip the basis sees, against Alibi Distance's 46.08%
> P(alpha=1) on a basis that included the shipped inputs). What is new is the object: …"

> Replace with: "The visibility of hidden-basis divergence is wave 41's result, and the 44.40%
> figure here is a re-measurement of it on a different artifact, not an independent confirmation of
> anything: both are properties of synthetic single-edit mutants over a deterministic basis. This
> paper's object is different — the delta between two of a learner's own consecutive programs — and
> no claim is made that the object, the no-op definition, or any rate over it is new to the
> literature. Learning-analytics work on behavioural traces of student code is the established
> context; what is absent from it is a behavioural-no-op definition over a hidden basis, and what is
> absent from this paper is any human data."

**W10 — §2, add the omitted closest neighbours.** Two sentences, no weakening of results needed.

> Add: "Closer than any of the above is prior work we should have cited and did not: Smith, Tang,
> Warren and Rixner (ITiCSE 2017) score a student's test suite against a corpus of incorrect
> implementations — student solutions plus mutation-generated mutants — group those implementations
> by shared *test signature*, and show the student the ones their tests did not catch. The
> behavioural signature here is that test signature, and the pedagogical premise of the count card
> is that premise. The differences are that our pair is two consecutive versions of one learner
> program rather than a submitted suite against a corpus, and that our output is a count with no
> program attached."

> Add: "The trace-analytics literature is the natural home for the object rather than the testing
> literature: Zhang et al. (2023) derive eleven trace features and four code-writing factors from 614
> students' submissions, Jemmali et al. (2020) analyse debugging sequences, and parse-tree
> tracking work (2025) automates structural change measurement over keystroke logs. We report those
> as context for why the object is a reasonable one to study, not as results our synthetic numbers
> can be compared against."

**W11 — §1 last paragraph.** It is already good. Add only the negative-literature caveat.

> Current: "There is no human data. Every walk, ghost rate, and improvement number comes from
> simulated edit policies or synthetic cohorts on the real corpus."

> Replace with: "There is no human data. Every walk, ghost rate, and improvement number comes from
> simulated edit policies or synthetic cohorts on the real corpus. We did not survey the
> programming-trace literature systematically and therefore make no priority claim for the trace
> features or the delta object."

---

## 5. Refutation-Ledger Values / Warrant Lab

### 5.1 Closest established concepts

The paper's own T1 is the most honest prior-art table in the repository, and I verified most of its
rows. Where it errs, it errs conservatively.

**Truth maintenance and assumption-based reasoning.** Doyle 1979 (*A Truth Maintenance System*, IEEE
TSE 105(2), MIT DSpace 1721.1/5733) and de Kleer 1986 (*An Assumption-based TMS*, Artificial
Intelligence 28(2), doi `10.1016/0004-3702(86)90080-9`) (both verified) supply exact
dependency-directed retraction and label recomputation. RLV's `min over cites(v) of gamma(c)` and
the read-time closure are a graded TMS. The paper correctly labels the demotion sanity check as a
"TMS-style retraction check, not the novelty." Keep that label on every mention.

**Provenance.** Green, Karvounarakis & Tannen 2007, *Provenance Semirings*, PODS, doi
`10.1145/1265530.1265535` (verified) — positive-only, so negative evidence has no semiring value.
RLV's opening argument is correct and is the most defensible conceptual gap in the paper.

**Dependence-aware evidence fusion — the standing counter-pressure, and the closest conceptual
match.** RLV's regime X operationalises exactly this, and the paper cites it. I verified:

- **Dong, Berti-Equille & Srivastava (PVLDB 2009)**, *Integring Conflicting Data: The Role of Source
  Dependence* — the origin. Majority vote fails when sources copy; Bayesian dependence detection;
  verified at `lunadong.com/publication/dependence_vldb.pdf`.
- **Li, Gao, Meng, Li, Su & Zhao 2016**, *A Survey on Truth Discovery*, SIGKDD Explorations 17(2),
  doi `10.1145/2897350.2897352` (verified). **Note:** the repository's T1 does not attribute authors;
  the correct first author is Li, not Yuan. Fix the attribution.
- **Knight & Leveson (IEEE TSE 1986)**, multiversion programming independence experiment — live PDF
  confirmed at the KTH URL already in T1 (verified as reachable; I did not read the full text).
- **IATD (CIKM 2016)**, *Influence-Aware Truth Discovery* (verified) — claim-level trustworthiness
  fusing source and influencer reliability. This is *closer to RLV's value-level grade than truth
  discovery is*, and it is not cited.

> **Borrowable idea:** that correlated "independent" evidence must be discounted, and that failure
> independence does not follow from development independence.
> **Where it stops:** — and this is the crux. **The arena does not test this; it re-derives it from
> its own generator's definition.** The ground-truth blind-spot table *is* the dependence relation
> B7 computes. `FAMILY_SPEC` in `src/lib/warrant/arena.ts:80-88` sets `F2P` and `F3P` to blind
> `[4,5]` with coverage subsets overlapping `F2`; `B7` then merges them; `B8` (the oracle, blind
> spot classes) therefore coincides with `B7` in regime X. The paper says this out loud
> ("B8 ... matches it"), and then still reports the B7−B5 gap of +1.000 in the abstract as a result.
> The gap is a property of the generator, not a discovery.

**Defeasible argumentation and assurance.** Verheij's accrual of arguments; Amgoud et al. (IJCAI
2017) weighted gradual semantics, doi `10.24963/ijcai.2017/9`; **Rushby, Bloomfield, Netkachova &
Martinez (2024)**, Assurance 2.0 / "Defeaters" (URL live, spec text confirmed) — the paper's own
cited warning that counts are gameable is the sharpest available critique of RLV's grade.

**Append-only, signed, tamper-evident audit ledgers — the record layer is fully occupied.**

- **foolproof-labs/falsification-ledger** (verified, README read): hash-chained JSONL, pre-registered
  falsification contract, content-addressed evidence, hit-rate report, chain recompute. The T1 row
  is accurate.
- **subvurs/FalsiFlyer `docs/AUDIT_LEDGER_SPEC.md`** (verified, spec read in full): kernel-hash,
  dataset-hash and decision-rule-hash bindings; `prev_record_hash`/`record_hash`; Ed25519 over
  `record_hash`; a published threat model including a documented *not-detected* case (kernel/dataset
  substitution). The T1 row is accurate and the threat model is more candid than RLV's.
- **msaule/falsifyr** (CRAN, verified): attack leaderboard keyed by family and seed, smallest-kill
  search, 0–100 survival score, and a vignette that states the score "is a heuristic communication
  device, not a probability that the claim is true." T1 row accurate.
- **EviBound, arXiv:2511.05524** (verified, full text read): governance gates that promote a claim
  only with a queryable run id, required artifacts, FINISHED status and validated metrics. This is
  RLV's "claim promotion requires machine-checkable evidence" thesis, already published, in a
  different domain. It is cited in T1 but not weighed.
- **mmnto-ai/totem** — **could not verify.** See §9.

### 5.2 What DeepForge adds

- A **value-level contract**: `Append` over a value's chain → `D(chain, registry)` → `lambda(store,
  registry, id)` → `audit(id, store, registry, published, anchor)`, with cites frozen at creation so
  the cite graph is acyclic by construction and over/under-demotion is impossible.
- A **declared dependence-class counter** with a K = 3 cap and a cited-value minimum, and an
  explicit declared residual (distinct roots under one author still count separately).
- A **disclosure posture** that is unusual and good: the admission trust root is named, `dead` is
  kept distinct from `0`, audit is scoped to arithmetic consistency plus anchored tamper evidence,
  and the oracle `B8` is declared analysis-only and never implemented.

I did not locate a work that composes ledger-as-warrant + dependence-class grade + exact
cite-demotion at the value level. That is a **negative literature result**, and it is the paper's
strongest defensible position — provided it is phrased as "we did not locate" rather than as "no
one has."

### 5.3 Comparison matrix — Refutation-Ledger Values

| Closest work | Shared mechanism | What RLV does differently | What RLV adds | Verdict |
|---|---|---|---|---|
| Doyle 1979 TMS; de Kleer 1986 ATMS | Dependency-directed retraction; label recomputation; nogoods | Grades rather than booleans; retraction at read time over frozen cites, no propagation pass | Grade as a total over `{dead,0..K}` | **NO CONTRIBUTION (reproduction only)** for demotion; **NEW SYSTEM** for the graded, acyclic-by-construction closure |
| Green et al. 2007 provenance semirings | How a result derives from other results | Adds the negative half; semiring cannot express it | Negative evidence in the derivation | **NEW COMPOSITION** |
| Dong, Berti-Equille & Srivastava 2009; Li et al. 2016 truth discovery; IATD 2016; Knight & Leveson 1986 | Correlated sources must be discounted; claim-level confidence | Grade is a declared *class count* on a registered lineage, not a learned source reliability | — | **NO CONTRIBUTION (reproduction only)** — the arena's regime X *is* this result, inside a generator |
| Verheij accrual; Amgoud et al. 2017 | Independent reasons reinforce; acceptability degrees | Executable ledger, syntactic refuter identity, exact demotion | Ledger + grade + demotion as one contract | **NEW COMPOSITION** |
| FalsiFlyer AUDIT_LEDGER_SPEC; falsification-ledger; falsifyr | Hash-chained append-only records of falsification attempts; recompute on demand; smallest-kill; survival score | Runtime *value* is the unit; cite graph; declared coverage overlap | The value-level binding and the K cap | **NEW SYSTEM OR INSTRUMENT** |
| EviBound (arXiv:2511.05524) | Claim promotion gated on machine-checkable evidence | Evidence is a ledger of attacks on a value, not an artifact manifest; grade is graded | — | **NO CONTRIBUTION (reproduction only)** |
| Assurance 2.0 defeaters (Rushby et al. 2024) | Defeaters recorded, investigated, retained; counts are gameable | Actually computes a grade | — | **NO CONTRIBUTION (reproduction only)** — and this is the standing critique the paper should quote against itself |
| **The Derived-Claim Arena (this repo)** | — | — | — | **NO CONTRIBUTION** — see §5.4 |

### 5.4 Taxonomy verdict — Refutation-Ledger Values

- **NEW SYSTEM OR INSTRUMENT** — the value-level ledger → grade → cite-demotion contract. This is
  the honest verdict and it matches the REPROGPU walk-back pattern (artifact/conformance
  contribution, not a novel method).
- **NO CONTRIBUTION (reproduction only)** — the Derived-Claim Arena. B7's +1.000 pair-win, +1.000
  AUC and +1.000 AP@12 over B5 are determined by `FAMILY_SPEC`. They reproduce, inside a
  synthetic generator, the published finding that naive count fusion fails under correlated
  sources. The paper is transparent about the mechanism; the abstract's presentation of the gap as
  a result is the defect.
- **NO** new evidence, and no external validity: 48 generated claims, one generator, one
  defect-class model, one seed schedule.

### 5.5 Recommended wording changes (weakening / clarifying only)

**W12 — the abstract sentence reporting the arena gaps.** This is the most over-claimed sentence in
the corpus (see §8).

> Current: "Across 200 frozen seeds and 12 matched conflict pairs per regime, the shipped
> declared-dependence relation (B7) reaches pair-win 1.000 where the strongest cheap baseline (B5)
> reaches 0.000 in the correlated regime X, AUC 1.000 against 0.000, and audit precision AP@12 1.000
> against 0.000; seed-only churn moves the mean grade by 0.000 and flips 0.000 of pairs."

> Replace with: "The arena is a constructed instance, not an experiment: ground truth is generated
> from a declared blind-spot table, and the shipped relation B7 is defined by that same table, so in
> the correlated regime X B7 provably coincides with the analysis-only oracle B8 and the pair-win,
> AUC and AP@12 gaps of 1.000 are algebraic consequences of the construction rather than
> measurements. What the arena demonstrates is that a dependence-class grade is *stable* under seed
> churn and replay — the churn figures are the ones carrying information — and that the syntactic
> tuple variant B6 behaves as pre-declared. The finding it reproduces is the published one that
> count-based fusion collapses when sources are correlated (Dong, Berti-Equille & Srivastava 2009;
> Knight & Leveson 1986)."

**W13 — §1 "The claim ceiling" callout.** Already close to correct; one clause to add.

> Current: "…a value-level ledger→grade→demotion contract that no located work implements; …"

> Replace with: "…a value-level ledger→grade→demotion contract that we did not locate in any
> published work or located open-source system, and which we therefore claim only as an absence in
> the literature we surveyed rather than as a priority; …"

**W14 — §5, before T2/T3.** Add the tautology explicitly, so the reader is not left to infer it.

> Add: "The arena's ground truth and the shipped grader's dependence relation are two readings of the
> same declared table (`FAMILY_SPEC` in `src/lib/warrant/arena.ts`). In regime X, families F2P and
> F3P carry F2's blind spot and overlap its declared coverage, so B7 merges exactly what B8 treats as
> one mode, and B7 = B8 by construction. Every comparison involving B7 and B8 in T3–T5 is therefore a
> consistency check on the implementation, not a measurement of grader quality. The two informative
> contrasts in the arena are B5 versus B6 (dedup by family versus dedup by attempt tuple) and B7
> versus B5 under seed churn, where the claim is invariance rather than superiority."

**W15 — T1 author attribution.**

> Current row label: "truth discovery with dependent sources (SIGKDD Explor. 2016)"
> Replace with: "Li, Gao, Meng, Li, Su & Zhao 2016, A Survey on Truth Discovery, SIGKDD Explorations
> 17(2), doi 10.1145/2897350.2897352". Add an IATD row (CIKM 2016) as a closer value-level
> neighbour than truth discovery at large.

**W16 — T1, add the EviBound weighting.** EviBound is cited as RLV(i)/(iii) "spirit". It should be
listed as a *pre-registered* neighbour of the promotion-with-evidence thesis, and RLV should say
plainly that it does not claim that thesis.

> Add row: ["EviBound (arXiv 2511.05524, 2025)", "…, MLflow-verified", "dual governance gates; a
> claim is promoted only with a queryable run id, required artifacts, FINISHED status, validated
> metrics", "RLV(i)/(iii); the promotion-with-evidence thesis is prior art", "falsification attempts
> as the warrant; a graded value; dependence classes; cite demotion"].

**W17 — §5, AP@12 framing.** "Audit precision AP@12 1.000" is a replay of the top 12 ranked values
against the oracle. With 48 claims and a generator whose ranking signal is the ground-truth rule,
this is circular. Demote it from the abstract and label it in-table.

**W18 — the claim ceiling is a ceiling, so use it as one.** Any wording elsewhere in the paper or
the lab that implies the grade is a *quality* judgement rather than a *warrant-count* judgement
should be weakened to match §1's "never a statement about evidence quality."

---

## 6. Cross-cutting findings

1. **The corpus's most credible work is its negative results and its self-corrections.** The
   withdrawn geometric law, the corrected churn definition, the honest oracle-versus-held-out split,
   the four dead predictions, the 74–78% overfit practice bank, the 84/96 convincible second bank,
   and the REPROGPU prior-art walk-back (commits `18e11ca`, `c2feabf`) are all better evidence of
   research maturity than any headline number. A PhD admissions reader will weight them heavily.
2. **The over-claim pattern is specific and diagnosable.** Every inflated sentence is a *priority*
   claim or a *gap* number derived from a self-constructed generator. There are no inflated
   *measurements*. The fix is therefore narrow: strip "first", "no located work implements" → "we
   did not locate", and move arena gaps out of the abstract.
3. **The strongest genuinely-defensible methodological contributions** are: the cross-validated
   closure accounting (Alibi Distance), the leakage-controlled held-out protocol plus four dead
   predictions (BDL), and the threat-model-disclosed append-only contract (Warrant Lab). All three
   are *reporting disciplines*, not inventions. That is a fine and publishable thing to be, provided
   it is named correctly.
4. **No external replication exists** for any of the three, and none is claimed in the papers I
   read. That must stay true in the wording.
5. **"Peer review" must not be implied anywhere.** The arXiv/venue items cited here are the
   external literature; DeepForge's own papers have no venue.

---

## 7. Claims that CANNOT be supported as novel given the literature found

These are listed so the wording agent can find and fix every instance. Each is unsupported *as a
novelty claim*; most remain true as descriptions of this repo.

| # | Claim as it appears | Where it appears | Why it fails | Supported replacement |
|---|---|---|---|---|
| C1 | "the first census of radius-1 silent survivors on a large verified education corpus" | `alibi-distance.ts:304` (§1) | Mutation survival of CS autograding suites: Clegg 2019, Clegg ICER 2020, Perretta 2022, Clegg thesis 2022, Shams 2015, Delgado-Pérez 2021, Hall & Baniassad 2022, Mansur 2024. Silent-pass aperture at 25k-attempt scale: arXiv:2411.09261. Survivor-driven augmentation: Li et al. ASE 2026. | "a census … over this corpus, with a second independently written engine; no priority claim" (W1) |
| C2 | "the first census of simulated edit-walk ghosts and cold sets" | `docs/research/invention-wave-42.md:472` | Same mutation-survival literature; and the object is explicitly synthetic, so a "first" over a synthetic generator is a first over nothing. | "the first measurement we are aware of *on this corpus*" — or delete "first" |
| C3 | "the first census of near-miss …" | `docs/research/invention-wave-41.md:410` | as C1 | as C1 |
| C4 | "the technique this paper reports is invented in DeepForge research wave 41" | `alibi-distance.ts:300` | Reads as a mechanism-invention claim. The components are mutation analysis, differential testing, greedy set cover, cross-validation. | "was constructed in DeepForge research wave 41; its components are standard" (W2) |
| C5 | "mutation–slip coupling is assumed, not measured" presented as the field's open problem | `alibi-distance.ts` §7 list, §10 ¶1 | It has been measured — Just et al. 2014 (industry) and Clegg 2019/2020, Perretta 2022, Clegg 2022 (education). | "assumed rather than measured *in this corpus*; the field has measured it elsewhere" (W3) |
| C6 | Implicit equivalence of the 46.08% aperture with an undocumented quantity, with STING presented only as a method comparison | `alibi-distance.ts` §2 | The 77.0% figure is the number a reader will find. Non-comparability must be stated. | Add W4. |
| C7 | Abstract: "B7 reaches pair-win 1.000 … AUC 1.000 … AP@12 1.000 against 0.000" as a *result* | `refutation-ledgers.ts` abstract, T3, T4, T5, F1–F3 | B7 ≡ B8 by construction (`FAMILY_SPEC`); the gaps are generator artefacts. Restates Dong 2009 / Knight & Leveson 1986. | W12, W14, W17 |
| C8 | "a value-level ledger→grade→demotion contract that no located work implements" | `refutation-ledgers.ts` §1 claim ceiling, abstract | A negative literature claim, stated as an absence in the world. No systematic survey was performed. | "we did not locate … in the literature we surveyed" (W13) |
| C9 | "What is new is the object" (BDL) | `behavioral-delta-ledger.ts` §1 callout | The trace object is a fifteen-year-old neighbourhood; a bare "what is new" reads as a priority claim. | W9 |
| C10 | Anything implying a *quality* or *truth* reading of gamma | `refutation-ledgers.ts` §4, lab copy | The grade is a warrant count under a declared relation. §1 says "never a statement about evidence quality"; §4 and the lab must match it. | W18 |
| C11 | "novelty-first external software invention" (Wave 43/44 entries) | `AGENT_CONTEXT.md:262-263`, `docs/next-wave-plan.md` | Agent bookkeeping, but it is the label a future reader will inherit. "Novelty-first" is not a claim the comparisons support. | "composition of established mechanisms, with a documented negative-literature check" |
| C12 | "first census" used as a *finding* in a contribution bullet while the raw run is uncommitted | `alibi-distance.ts` §9 ¶last | A census whose artifacts are in a scratch directory is not a dataset. | W8 |

---

## 8. The single most over-claimed sentence in the corpus

From the `REFUTATION_LEDGERS` abstract, `src/data/inventions/refutation-ledgers.ts`:

> "Across 200 frozen seeds and 12 matched conflict pairs per regime, the shipped declared-dependence
> relation (B7) reaches pair-win 1.000 where the strongest cheap baseline (B5) reaches 0.000 in the
> correlated regime X, AUC 1.000 against 0.000, and audit precision AP@12 1.000 against 0.000"

Why: B7 is a function of the same `FAMILY_SPEC` blind-spot table that generates the ground truth,
so in regime X B7 and the analysis-only oracle B8 are the same function. A mutation-testing or
knowledge-fusion reviewer will spot this in about ninety seconds, and once they have, every other
claim in the portfolio gets discounted with it. The paper's own tables and prose concede the
mechanism ("B8 ... matches it"), which makes the abstract sentence the only place where the
concession is missing. Replace per W12.

*Runner-up, and the most clearly **false** claim rather than the most misleading one:*
`alibi-distance.ts:304`, "the first census of radius-1 silent survivors on a large verified
education corpus." Eight published studies measure mutation survival of CS autograding suites, and
one measures the instructor-suite silent-pass rate on 25,000+ attempts. Replace per W1.

---

## 9. UNVERIFIED — do not cite

I could not confirm these during this pass. They appear in the repository's reference lists or were
candidates I considered. **Do not cite any of them** until checked. None of them is load-bearing for
any argument in this document.

**In the repository's own reference lists:**

1. **mmnto-ai/totem**, `packages/core/src/capability/falsification.ts` at commit `fc3f4114`
   (`refutation-ledgers.ts` T1 row and reference `totem`, labelled the "strongest match" for RLV(iii)).
   Repository not located by search. Because T1 calls it the strongest match, its absence weakens
   the paper's own related-work argument asymmetrically — resolve it one way or the other.
2. **speccle ADR-0012**, `github.com/matthewalton/speccle/.../0012-strengthen-routes-on-the-surviver-not-the-score.md`
   (cited in Alibi Distance §2 and BDL §2, and in T-1 "what we take / do not claim" tables). Not
   located by search. If it cannot be found, delete the sentence in Alibi Distance §2 that says "our
   oracle-vs-deployable split reaches the same conclusion for a different reason" — it currently
   leans on this ADR.
3. **katabench.com/docs/grading** (cited in both Alibi Distance and BDL as a mutation-graded
   test-writing product). Not fetched in this pass.
4. **Bloomfield, Netkachova & Rushby**, "defeaters", arXiv `2405.15800` — listed in the reference
   array; I confirmed the SRI-hosted `defeaters24.pdf` is live but did not confirm the arXiv ID maps
   to the same work. Cite the SRI PDF or verify the arXiv record; do not cite both as if independent.
5. **arXiv:2607.26512**, "Evidence-ledger adjudication: claim, evidence packet, and route" (listed in
   the reference array). Not located.
6. **arXiv:2604.01518 cited as "STING 2026"** — the *work* is verified; the *name* changed to
   PROBE in the current version. Cite with the rename (W5) rather than treating "STING" and
   "PROBE" as two works.
7. **A phantom 2018 paper.** The PROBE/STING paper's own ACM template contains a malformed
   self-reference: "Chenglin Li … Tse-Hsu (Peter) Chen. 2018. Are Benchmark Tests Strong Enough?
   Mutation-Guided Diagnosis and Augmentation of Regression Suites." Multiple indexes have
   ingested it as a separate 2018 arXiv entry. **There is no separate 2018 paper here** — it is the
   same work as arXiv:2604.01518 with a broken self-citation. Do not cite it.
8. **"truth discovery with dependent sources (SIGKDD Explor. 2016)"** — the DOI is correct but T1
   gives no authors and I could not confirm the intended first author. Correct attribution is
   Li, Gao, Meng, Li, Su & Zhao (W15). Verify before use.

**Candidates I found but could not fully verify (do not cite without a second look):**

9. **Kazerouni, Davis, Basak, Shaffer, Servant & Edwards**, "Fast and accurate incremental feedback
   for students' software tests using selective mutation analysis" (1,389 student projects,
   2–3 operator subsets, R² up to 0.94). Content confirmed; **venue not independently confirmed**
   (widely listed as ASE 2021).
10. **Mansur, Shaffer & Edwards**, "Mutating Matters: Analyzing the Influence of Mutation Testing in
    Programming Courses" (2024). Content confirmed; **venue and final publication status not
    confirmed** — I read a 2024-12-02 preprint.
11. **arXiv:2411.09261** (LLM-generated test suites for CS1 autograding). Findings confirmed in full
    (26 problems, 25,000+ attempts, instructor-suite FPR 14.6%); **exact title and author list not
    confirmed.** Cite by arXiv ID until the record is read directly.
12. **Paiva, Leal & Figueira 2022**, "Automated Assessment in Computer Science Education: A
    State-of-the-Art Review", ACM TOCE 22(3), doi `10.1145/3513140` — DOI and venue confirmed via
    citation trail; primary record not read.
13. **Nieminen, Bearman, Boud, Corbin, Dawson, Tai et al. (2026)**, "Grading in an age of assessment
    reform: the elephant in the room". Content confirmed; **venue not identified** (found only via
    an aggregator). Not load-bearing for anything here.
14. **López-Pernas, Lehdonvirta & Lye**, process and sequence mining over two systems. Content
    confirmed via citation trail only; **bibliographic record not read.**
15. **Clegg et al. (ICER 2020)** full author list. I confirmed the DOI `10.1145/3408877.3432411` and
    the substance (197 Java classes, three assignments) but did not read the author list; cite
    "Clegg et al." unless verified.
16. **Knight & Leveson 1986**, IEEE TSE 12(5). The KTH-hosted PDF is live; **I did not read the
    full text**, so the specific claim attributed to it in T1 (development independence does not buy
    failure independence) is unverified by me.
17. **Verheij**, "Accrual of arguments" — T1's CiteSeer link is unstable. The 1995/1999 dual
    attribution needs a real venue (AIS or the 1995 *Argumentation* paper) before use.
18. **Amgoud et al. (IJCAI 2017)**, weighted gradual semantics, doi `10.24963/ijcai.2017/9` —
    DOI unverified by me; the venue and title were taken from the repository's T1.
19. **Josang 2001** "subjective logic / evidence-based security logic", doi
    `10.1016/s0218-4885(01)00083-1` — taken from T1; unverified.
20. **de Kleer 1986** *An Assumption-Based TMS* — DOI taken from T1; unverified. The paper is
    standard, but the DOI string itself should be checked.

---

## 10. Application to a PhD-admissions portfolio

The defensible one-paragraph version of each, for use if a committee asks "so what is new?":

- **Alibi Distance:** mutation analysis has long told us that weak autograding suites admit wrong
  programs. We measured that on our own 5,730-exercise corpus at a scale and with a second
  independent engine that we did not find reported, aggregated it as a *minimum-distance* adequacy
  statistic rather than a mean, and — the part we would actually defend — we showed that the
  usual survivor-driven test-generation accounting is optimistic by roughly a third when the
  witness is chosen on the same alibis it is scored against.
- **Behavioral Delta Ledger:** we built a cheap, count-only instrument that tells a learner whether
  their last edit changed anything, defined behavioural no-ops precisely, and then reported that
  our own headline rates collapse from in-sample to held-out and that four pre-registered
  predictions failed — which is why four product features were cut.
- **Refutation-Ledger Values:** a small, auditable contract that makes a derived value's warrant an
  append-only ledger, its grade a recomputable function of that ledger, and its demotion exact
  through a frozen cite graph. The arena that accompanies it is a constructed instance that
  reproduces a known dependence-collapse result and is best read as an implementation
  consistency check.

None of the three is a new method. All three are defensible as careful, reproducible engineering
measurement with an unusually honest negative-results record — which is a legitimate and attractive
thing to be, provided it is described that way from the first sentence.
