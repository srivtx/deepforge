# Wave 45 — Utility attack on XFit (behavioral quotient of the DeepForge bank)

Date: 2026-09-19. Role: Utility/Product Attacker. One file written (this one); no git, no repo code
touched. Inputs: `wave-45-candidates-a.md` §C1 and `wave-45-priorart-xfit.md`. Method: read-only
reconnaissance of the real 5,730-problem bank (`src/data/problems/**`, `scripts/py_verify.py`,
`scripts/dump-solutions.ts`) plus real Python executions using the repo's own equality semantics
(1e-6 deep-eq, fresh copies, 0.25 s alarms); all scratch artifacts in the approved temp dir
(`w45-attack/`: `scan/shapes/shared` reruns, `bank.json`, `agree-pairs.json`, `union_replay.py`,
`probes.py`, `swap_fit.py`, `recall.ts`). The prior-art review already said GO-WEAK on novelty; this
attack tests **utility** and finds the headline census mostly artifact. **Verdict: GO-WEAK, but only
after the headline is re-scoped. The "semantic-duplicate census" as proposed is KILLED; the
surviving deliverable is an evidence-budgeted *twin & drift report* plus a frozen refutation index.**

## 0. Bottom line

| Question | Answer (measured, this repo, 2026-09-19) |
|---|---|
| References runnable? | **5,730/5,730**: exec + pass all shipped tests in 0.65 s, stdlib-only imports |
| Stage-0 scan cost | 0.2–0.3 s TS; numbers reproduced exactly |
| Stage-0 "agree" pairs | 5,159 — but **94.0% die on the union of their own two suites**; 309 survive |
| After two independent probe families | **194 edges / 94 classes** survive — and the classes are dominated by *intentional* duplicates (all 7 sorts) and unrelated ratio formulas (a 9-member class) |
| Argument-correspondence search (the novelty) | **9 fits out of 6,015 permutation attempts** on 3,626 conflict pairs (0.25%) |
| Same-concept divergences worth showing an author | **~12 pairs** (hand-verifiable), 3 found by shipped tests, 9 by probes; 1 is arguably a real defect |
| Prefilter recall vs known duplicates | strict signature rediscovers **2/3** text-identical pairs (misses `la-291`≡`ml-030`) and **35/141** same-name pairs; the four ground-truth pairs cannot all be in scope |
| Verdict reproducibility (P3) | same-family new seed: **95.1%** (borderline pass); cross-family: **71.5%** (fail) |
| Stage-1 as specified (`|K|≤64`, b=200, 14,542 pairs) | 6.9M fit calls + ≤5.8M probe calls ≈ **25–45 min single core traced**, not ≤10 min; an identity+swap+early-abort version is **~1–3 min** |

What survives as shippable: a deterministic **refutation index** (all pairs refuted by shipped tests
or by named probe families, each with a replayable witness and an evidence label), and a small
**twin-drift report** naming same-operation exercises with divergent edge behavior.

## 1. Feasibility at real scale (all measured)

**Data shape.** 5,730 problems / 169 files; each ships `solution` (Python source string) and 3–6
JSON test cases (`input` = positional args, `expected` = JSON value). Test-count histogram
3/4/5/6 = 1,089/3,007/1,581/53; mean 4.10. The wave-41 frozen dump
(`w41-verify-final2/source_problems.json`) matches today's repo on 5,730/5,730 solutions+tests.

**Runnability census.** Exec each solution, call its first `def` on every shipped input: 0 errors,
0 mismatches, 0 timeouts; 0.65 s total. Imports are stdlib (`math` 743, `random` 70, `heapq` 48,
…). Probe-runnability: in 17,190 cross-suite calls, 5 timed out (0.03%); ≥99.9% callable under a
0.25 s alarm. The wave-41 "5,721/5,725 analyzable" gap is a probe-harness artifact, not a data gap.

**Call cost** (400-problem sample, alarm + `deepcopy`): mean 35 µs, median 3.0 µs, p99 131 µs →
**26,760 calls/s**; with line-budget tracing (verifier mode): mean 170 µs, p99 421 µs → 5,795/s;
my end-to-end pair loop with JSON bookkeeping: 2,751/s. Slow tails exist (p999 ≈ ms; some DP
solutions seconds) — **a per-pair call cap is mandatory**, timeouts must be `open`, not refuted.

**Stage-0 (pure TS, reproduced exactly):** strict shape signature → 46,897 candidate pairs
(36,061 cross-category), 14,542 share ≥1 exact input, 21,007 shared comparisons, 5,159 pairs with
zero conflicting shared outputs, 9,383 with ≥1 conflict; 3,818 problems in multi-groups, 2,576 in
shared-input pairs. **Prefilter sensitivity is the whole ballgame:** a kind-only signature yields
**634,970** candidates / 83,087 shared-input pairs / 34,455 "agree" / 48,632 conflict / 101,060
comparisons (5,572 and 3,844 problems in groups). Strict recall vs the baselines it claims to beat:
exact-text 2/3, same-name 35/141 (24.8%); loose: 3/3 and 82/141 (58.2%). The strict signature
**excludes the ground-truth softmax trio** (`la-149` sig `[float]`, `ml-064` sig `[]|[int]|[float]`)
and the cross-category text-duplicate pair `la-291`≡`ml-030` (empty/float test shapes). Any P5
(ground-truth classification) must state which prefilter it uses or it is unfalsifiable.

**Largest honest census and coverage claim.** Frame: the **loose kind-only signature with ≥1 exact
shared shipped input = 83,087 pairs over 3,844 problems (67.1% of the bank)**; identity union
replay costs 2 calls/point; extrapolating my measured 2,751 calls/s, ~1.1M calls ≈ **7 min** single
core (≈40 s lean). Coverage claim: *all pairs whose positional arg/output kinds match and that
share at least one shipped input; no claims about pairs with disjoint inputs, different kinds, or
non-JSON outputs.* Strict-frame alternative: 14,542 pairs / 2,576 problems (45.0%), 31.0% of
strict candidates, recall as above.

**CI vs build time.** CI (≤6 min) can host: Stage-0 (~0.5 s), the strict-frame union replay
(~80 s in my loop, ~10 s lean), witness replay, and rendering a frozen report. Build-time (frozen
`xfit-report.json`, content-hashed on the bank): loose-frame replay, probe families, permutation
search, shrunk witnesses. Full `|K|≤64` fit-on-observed over 14,542 pairs = 14,542 × 64 × 7.42
union points ≈ 6.9M calls ≈ 4.3 min at the lean rate but **20 min traced / 42 min at my loop
rate**, plus a worst case of 6.9M × 0.25 s under adversarial slow solutions: **unbounded without
caps**. b=200 probes over every fitted pair adds ≤5.8M calls ≈ 4 min lean. The candidate's "≤10 min
single core" is only true for a reduced κ.

## 2. The 5,159 number, decomposed — and the threshold

Measured on the real pairs:

| Decomposition | Count |
|---|---|
| Pairs sharing exactly 1 input / 2 / 3 / 4 / 5+ | 4,756 / 331 / 51 / 19 / 2 |
| Pairs whose every shared input is a degenerate literal (`[]`, `[[1,0],[0,1]]`, `0`, …) | 2,400 |
| Pairs whose shared outputs are all constant-degenerate (`0`, `[]`, `1`, `False`, …) | 4,513 |
| Same first-function-name / cross-category | 28 / 3,350 |
| Survive cross-suite replay on the union of both suites | **309** (6.0%) |
| Refuted on union (value / error / timeout) | 4,574 / 271 / 5 |

The dominant cause of "agreement" is **coincidence on a one-point common domain** (e.g. two matrix
operations agree on the identity-matrix test; two rate formulas agree on `[1,2]`). Consequences:
(a) a single shared comparison cannot distinguish even distinct linear functions, so **one-point
agreement must never ground a class**; (b) the census is bounded by shipped-suite size (mean 4.10),
not by the bank's concepts. **Experiment to separate coincidence from equivalence (the one I ran):**
fit-on-observed (union replay, identity κ) → two disjoint probe families: F1 = systematic boundary
edits of every observed value (empty/singleton/reverse/negate/+1/drop), F2 = seeded draws from the
per-argument observed value pools + small numeric grids, seeds 201/202, with F2b held out from
fitting. Threshold below which the census is not meaningful: **report a pair only if it survives
union replay with ≥2 independent shared points (or ≥1 plus F1+F2a), and mark everything else
`open`**; report a *class* only if every edge survives F1+F2a and no F2b witness refutes it.

Results on the 309 union survivors: F1 201 survive (108 refuted); F2a 267 (42); F2b 267 (42); all
three **194 edges / 94 classes**; cross-family verdict flips 88/309 (28.5%), same-family seed flips
15/309 (4.85%), held-out (F2b) refutation of F1-fitted edges 7/201 (3.5%) — exactly the failure
mode I3 warns about, now quantified: **the verdict is a function of the probe family, so "≥95%
under a second seed" (P3) passes only at the same-family reading and fails across families.**

## 3. Value test — strongest case against each use, and the evidence that would settle it

**(a) Semantic-duplicate census.** *Against:* the 94 surviving classes are dominated by intentional
repeats. The second-largest class is all seven sorts (`al-004/005/006/018/019/033`, `ds-058`) —
behaviorally identical, pedagogically distinct. The largest is **nine unrelated exercises that all
compute `a/b` with a denominator guard** (`information_fraction`, `mle_bernoulli`, `replay_ratio`,
`person_years_rate`, `item_difficulty_index`, SMR, …) — a true behavioral quotient and a false
duplicate report. *Evidence that settles it:* report the 194-edge quotient, sample 25 edges,
hand-verify, and count how many an author would call duplicates (**my hand-check: 1 pair is an
outright duplicate class — `pr-003`≡`al-023` — plus ~10 same-operation twins across
names/categories; the sort/ratio classes are intended repeats**). *Falsifier:* if a majority of
class edges are judged intended-distinct (likely), the census is a **redundancy metric for path
curation**, not a duplicate detector — relabel it.

**(b) Same-concept edge-conflict detection.** *Against:* most divergences are out-of-domain
conventions, and the descriptions often say so. Measured: 28 same-name pairs agree on shipped
inputs; 9 are refuted by probes; 3 same-name pairs conflict already in shipped tests; plus
cross-name twins like `pr-052`/`al-200`. Total ≈ **12**. Of these, `ml-064` *documents* "empty
input returns []" (so vs `la-149`/`dl-003` is a stated convention), `ml-046` *documents* the length
guard, and `pr-052` *documents* "return 0 for negative n". The one finding with defect character is
`la-025`'s silent zip-truncation on ragged vectors (returns 0.5976 instead of erroring/0.0).
*Evidence:* list every divergence with its witness, the two descriptions, and a verdict
`documented | unstated | silent-default`; hand-check each. *Falsifier:* if (as here) every witness
is documented or out-of-domain-undefined, the product claim shrinks from "bug detection" to
"unstated edge-policy census" — still publishable, but not a bug hunt.

**(c) Cross-oracle instance verification.** *Against:* circular. `scripts/py_verify.py` checks
`solution == expected`, so expected outputs are *defined* by the references; references and tests
were authored by the same agent waves, so shared blind spots are invisible to agreement checks.
*Minimum evidence:* inject the 96 alibi ghosts (the only known-wrong corpus, `src/data/alibis/`)
and measure how often a fitted twin detects the ghost within its probe budget; compare against
wave-41's measured random-probe conviction rate (63.3% in ≤10 probes) — the twin must **beat
random** to matter. *Falsifier:* detection ≤ random, or any class where both references carry the
same domain error (none found yet, but untestable without external oracles).

**(d) Named diagnosis.** *Against:* it needs learner errors; the platform stores no submission
corpus and has no telemetry; the 96 ghosts are synthetic 1-line mutants, not misconception
distributions. Also "your function is exactly exercise Y" is only reachable if the learner's code
is behaviorally equivalent to another *reference* — a rare accident, not a misconception model.
*Evidence:* precision@1 of "nearest reference class" on the 96 ghosts + a 200-submission shadow set
if any local corpus exists; report top-3 classes. *Falsifier:* precision@1 <50%, or the ghost
corpus's error modes don't match any real learner error (they don't — they are edits of references).

## 4. Product honesty — exact wording, and what must never be shown

Verdicts are **probe-conditional**; no page may say "equivalent", "proven", or "duplicate" alone.
Required label grammar: `equivalent on [suite ∪ probe family F] (b=N calls, seed=S, κ=…)` or
`refuted (witness below)` or `not compared (budget/open)`.

- **Class card:** "**Behaviorally identical so far.** These N exercises return the same results on
  all M shipped inputs and on P probes from family F (budget b). Intent is not assessed. If both
  exercises are required in a path, this is a redundancy signal, not an error."
- **Conflict card:** "**Edge behavior differs.** `A` and `B` cover the same operation but disagree
  at the input below. One or both descriptions may leave this input undefined. Witness: … . This is
  a convention to align, not an accusation."
- **Open card:** "**Not compared beyond budget.** No verdict: the pair was not probed far enough
  (or a call timed out at 0.25 s)."
- **Never shown:** the words *duplicate / same problem / copied* as a fact; *bug / wrong* without a
  witness plus the description quote; author or wave attribution next to a finding; any ranking of
  authors/files by class/divergence count; verdicts without `(family, budget, seed)`; a fitted κ
  presented as intent; any learner-identifying data. Findings surface only to the authoring
  toolchain behind a manual "review" state, never in learner UI.

## 5. Decisive go/no-go experiment (one experiment, pre-registered)

**Twin Audit on the frozen bank.** Population: loose-frame shared-input pairs (83,087; strict
14,542 as the cheap arm), 4 ground-truth groups seeded in by hand, plus F2b as held-out.
Pipeline: S0 scan → S1 identity union replay → S2 F1 fit (boundary) → S3 F2a fit (seed 201) →
S4 audit with F2b (seed 202, never used for fitting) + 200 domain draws for every class edge;
witness shrink by delta-debugging; machine-readable JSONL. **Pass:** (i) 100% witnesses replay with
exit-diff; (ii) all four ground truths classified correctly and in scope; (iii) held-out
refutation ≤5% of fitted edges; (iv) ≥10 hand-verified same-concept divergences; (v) whole
experiment ≤15 min single core; (vi) class edges carry F1+F2a survival. **Fail:** any ground truth
misclassified, replay <100%, holdout refutation >10%, or wall >30 min. Time budget: S1 80 s
(strict) / ~7 min (loose); S2–S4 ≈ 1–2 min; witness re-verification traced ≈ 2× S1.

Ground-truth expectations (already reproduced today): `pr-003` ≡ `al-023` on 1,155/1,155 grid
points — **equivalent**; `pr-052` vs `al-200` — **edge conflict**, witnesses n=−1 (0 vs
ZeroDivisionError), n=−2/−3 (0 vs −1), found only by F1 (F2 misses; pools contain no negatives);
softmax `la-149` ≡ `dl-003` (both raise on `[]`), `ml-064` — **edge conflict** at `[]` (returns
`[]`), pair excluded by the strict prefilter — the plan fails its own P5 unless the frame is
loosened; cosine `la-025` ≡ `nlp-005` (7/7), both vs `ml-046` — **edge conflict** at ragged input
(0.5976143046671968 vs 0.0). Current status: the experiment **passes after re-scoping (loose
frame, family-qualified verdicts) and fails as originally specified**; that asymmetry is the
go/no-go decision the wave must make before writing.

## 6. Fallback deliverable if the census underperforms (it does at the headline)

Ship the **Twin & Drift Report**, frozen, not a "duplicate census":
1. `refutations.jsonl`: every pair refuted by a shipped test or by F1/F2, with minimized,
   replay-gated witness and the source (`shipped/union/F1/F2a/F2b`): ~14.3k pairs strict (9,383
   shipped-test + 4,845 union + 115 probe); the loose frame adds the analogous ~48k-plus set when
   run — freeze both when reached, never extrapolate silently.
2. `twins.json`: the ~12 hand-verified same-concept divergences with description quotes and
   `documented|unstated` labels; plus the 194-edge / 94-class quotient, every edge labeled
   `(family, b, seed, κ=identity)`, classes marked "intent not assessed".
3. Exploratory appendix: permutation-κ search over conflict pairs (9 fits / 6,015 attempts) as
   *evidence about the bank*, explicitly not a headline — the novelty does not pay for itself here.
4. Paper: the 5,159→309→194 funnel, the sort/ratio-class finding, the prefilter-recall table, the
   ground-truth four, and the limitations below.

Worth shipping? **Yes, marginal but positive:** compute is ~2 min, the artifact is deterministic
and replayable, the authoring value (edge-policy and redundancy review on `/paths` and in content
CI) is real, and nothing else in the repo emits cross-exercise behavioral evidence. It is not a
flagship and must not displace a wave with learner-facing value.

## 7. Limitations the paper must carry (honest section)

- Probe-conditional, no proofs; `equivalent(b, family)` is a budgeted claim. Undecidable in general.
- **Probe-family dependence is measured** (28.5% cross-family flips; catalan found only by F1):
  every verdict must name its family and budget; second-seed replication is necessary but not
  sufficient (F2a↔F2b 95.1% agreement hid the F1-only witness).
- **Prefilter sensitivity (20×) and recall failure** (2/3 exact-text, 24.8% same-name under
  strict); the known cross-category duplicate `la-291`/`ml-030` is silently out of frame.
- Not covered: 32,355 strict candidates with disjoint inputs; all kind-mismatched pairs; non-JSON
  outputs; correspondences outside identity/permutation (ψ transforms untested — caveat).
- Intent is not observable: duplicates may be deliberate; conflicts may be documented conventions
  (softmax/cosine/catalan all are).
- Reference/test circularity: expected = reference outputs by construction; no learner corpus, no
  telemetry; diagnosis and cross-oracle verification remain unvalidated.
- Timeout divergence is hardware-dependent (5 open pairs at 0.25 s); witnesses from ill-formed
  inputs (ragged graphs, wrong arity) may violate preconditions — domain-validity filters needed.
- Single bank, single language, single repo, snapshot 2026-09-19; content-hash the bank or the
  artifact is stale by construction.
- Novelty is narrower than §C1 claimed: correspondence search yields 9/6,015; the remainder is
  differential replay + partition, which the prior-art review already located in the literature.

## 8. Numbers the paper must report (exact, from this attack)

`5,730/5,730` runnable; `46,897 / 14,542 / 5,159 / 9,383 / 21,007` (strict scan, reproduced);
`634,970 / 83,087 / 34,455 / 48,632 / 101,060` (loose); recall `2/3` and `35/141` (strict),
`3/3` and `82/141` (loose); `4,756` one-point agreements; `2,400` degenerate-input agreements;
`5,159 → 309 → 194` funnel; `201/267/267` F1/F2a/F2b survivors; `88/309` cross-family flips;
`7/201` held-out refutations; `194 edges → 94 classes` ({9,7,7,6,6,5,5,4,4,3×15,2×70}); `9/6,015`
permutation fits; four ground truths as in §5; call rates `26,760/s` untraced / `5,795/s` traced;
Stage-1 costs `~80 s` (strict union replay) to `~45 min` (full κ traced, capped).
