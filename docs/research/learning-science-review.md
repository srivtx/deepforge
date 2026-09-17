# Learning-science review: the review queue and habit layer

Research track, written 2026-09-18. Read-only review of `src/lib/reviewQueue.ts`, `src/lib/readiness.ts`,
`src/lib/weeklyDigest.ts`, `src/components/today/Today.tsx`, and `docs/next-wave-plan.md` §17; sources fetched
September 2026. Labels: **[meta]** replicated/meta-analytic, **[rct]** randomized trial, **[bench]** large-scale
benchmark, **[lore]** practice consensus without controlled evidence, **[contested]** genuinely disputed. Parallel
wave tracks (prerequisite map, 14-day forecast + leech triage hub, in-browser paper starters) are assumed out of
scope; hypotheses below are chosen to complement, not duplicate, them.

## 1. Spacing: gap size matters; expansion does not

- Spaced beats massed at a delay, and this is one of the most replicated effects in learning research. Cepeda et
  al. 2006 **[meta]** (839 assessments) found ~15% average benefit for long retention intervals and a
  non-monotonic lag function: for a given retention interval there is an optimal inter-study gap, and the optimal
  gap grows with the retention interval ([PDF](https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf)).
- Expanding vs fixed is *not* settled in favor of expanding. Karpicke & Bauernschmidt 2011 found absolute spacing
  drove large gains while expanding, equal, and contracting relative schedules were indistinguishable
  ([paper](https://doi.org/10.1037/a0023436)). Latimier et al. 2021 **[meta]** found no expanding-vs-uniform
  difference, g = 0.034 n.s., across 54 effect sizes ([meta](https://link.springer.com/article/10.1007/s10648-020-09572-8)).
  Cepeda 2006: expanding either helps or equals fixed, with some impaired cases. Kang et al. 2014 found expanding
  equal on an 8-week final test but better recall during training
  ([study](https://doi.org/10.3758/s13423-014-0636-z)). Storm et al. 2010 found expanding wins when interference
  is high ([paper](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Storm_Bjork_Storm_2010.pdf)).
- Verdict: SM-2's ease-driven expansion is acceptable because it grows the *absolute* gap, but "expanding is
  superior" is not the reason; there is no evidence for an expanding-specific advantage under typical conditions.
- Task complexity moderates. Donovan & Radosevich 1999 **[meta]** report d = 0.46 overall but near-zero for
  high-complexity tasks (0.07–0.11) vs 0.97 for psychomotor tasks ([meta](https://gwern.net/doc/psychology/spaced-repetition/1999-donovan.pdf)).
  So spaced review should help a 45-minute interview problem, but the effect will be smaller than the flashcard
  literature implies.

## 2. Retrieval practice, desirable difficulties, interleaving

- Testing effect: Rowland 2014 **[meta]** g ≈ 0.50, stronger for effortful recall than recognition
  ([meta](https://doi.org/10.1037/a0037559)); a 2021 synthesis puts practice testing at d = 0.74 and distributed
  practice at d = 0.85, with feedback as a key moderator
  ([synthesis](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full)). The
  app's core loop — re-solve from scratch, never re-read — sits on the strongest evidence in the file.
- Desirable difficulties have a floor: difficulty helps only when the learner has the prior knowledge to succeed,
  otherwise it is an undesirable difficulty (Bjork & Bjork 2020
  [essay](https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2021/01/RABjorkELBjorkJARMAC2020ForPostingSingleSpaced.pdf)).
  Grading hint-heavy or multi-failure passes lower but still counting them as passes is aligned with this; refusing
  the pass would not be.
- Interleaving: Brunmair & Richter 2019 **[meta]** g = 0.42 overall, math g = 0.34, words g = −0.39; benefits grow
  with between-category similarity/confusability and fall with within-category similarity
  ([meta](https://doi.org/10.1037/bul0000209)). Rohrer et al. 2020 **[rct]** found d = 0.83 on a delayed
  unannounced test (61% vs 38%) after four months of interleaved homework, with weaker performance during practice
  ([rct](http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2020JEdPsych.pdf)). Boundary condition: interleave
  confusable problem types; blocked practice is acceptable for early or non-confusable skills.
- Most retrieval-practice evidence comes from verbal or procedural materials, not multi-step interview problems;
  transfer claims are weaker than retention claims.

## 3. Modern schedulers: SM-2 vs FSRS

- FSRS models difficulty, stability, and retrievability (DSR) and schedules to an explicit desired retention.
  FSRS-6 (21 weights, optimizable forgetting-curve decay) ships in Anki since 25.07
  ([PR](https://github.com/ankitects/anki/pull/3929)); FSRS-7 (35 weights, fractional intervals, same-day
  predictions) is in open PRs as of Sep 2026 and not merged
  ([fsrs-rs PR](https://github.com/open-spaced-repetition/fsrs-rs/pull/395),
  [benchmark README](https://github.com/open-spaced-repetition/srs-benchmark)).
- Calibration gains are large and replicated at scale. On ~350M held-out reviews, FSRS-6 log loss 0.346 vs
  0.436 for FSRS v3; on the earlier 20k-collection benchmark, SM-2 scored 0.73 log loss / 0.21 RMSE(bins) vs
  FSRS v4 0.39 / 0.046 ([bench](https://github.com/open-spaced-repetition/srs-benchmark),
  [breakdown](https://expertium.github.io/Benchmark.html)). Caveat from the benchmark authors: SM-2 never
  predicted probabilities, so converting its intervals to probabilities requires assumptions; the comparison is
  directionally strong, not perfectly fair.
- Practice-level gain: community simulations report 20–30% fewer reviews for the same retention; per-user
  optimization beats default parameters for ~84% of collections, but the Anki manual warns optimization needs at
  least "a few hundred" reviews to generalize ([manual](https://docs.ankiweb.net/deck-options.html)). FSRS-5/6
  short-term handling also loses most of the benefit without same-day review logs.
- Implementation cost in this app: `ts-fsrs` is browser-ready TypeScript with an ESM/CJS/UMD build and a browser
  example ([ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)); the optimizer is the heavy part. The
  blocker is data, not code: the app stores one `ReviewState` row per problem (`ease, interval, due, reps,
  lapses, lastGrade, lastReviewedAt`) and has **no per-review log**, which is what FSRS (and any better leech
  detector) needs. The original algorithm paper is Ye et al., KDD 2022 ([paper](https://dl.acm.org/doi/10.1145/3534678.3539081)).
- Honest verdict: a full FSRS migration is not the next win. The benchmark evidence is about flashcard recall
  prediction, default FSRS-6 without personalization gives up much of the edge, and the app's execution-graded
  problem outcomes are a different measurement regime. A small append-only review-log store is the useful
  prerequisite regardless of whether FSRS is ever adopted.

## 4. Leeches and repeated failure

- Anki practice: increment a lapse counter on review-mode failure; at 8 lapses (configurable) tag and suspend,
  with warnings every half-threshold; the manual suggests interference management (learn one confusable item at a
  time) and suspending/deleting material that is not worth the time ([manual](https://docs.ankiweb.net/leeches.html)).
  This is **[lore]**: no controlled trial validates the threshold or the actions.
- FSRS-era proposals detect leeches statistically — the Poisson-binomial probability of the observed failures
  under FSRS-predicted recall — but as of 2026 this is a design discussion, not shipped behavior
  ([forum](https://forums.ankiweb.net/t/automated-leech-detection/56887)).
- The evidence-adjacent claim is about feedback, not interval caps: errors persist and are repeated unless
  corrected, while feedback after failure (and after low-confidence success) improves later retention
  (Butler & Roediger 2008 [paper](https://link.springer.com/article/10.3758/MC.36.3.604); Butler, Karpicke &
  Roediger 2008 [paper](https://learninglab.psych.purdue.edu/downloads/2008/2008_Butler_Karpicke_Roediger_JEPLMC.pdf)).
  So the supported intervention is "fail → feedback → reformulate or split", and interval manipulation is
  secondary **[lore]**.
- Resetting a lapse to a 1-day interval is consistent with Anki's default minimum interval and with the argument
  that preserving part of a lapsed interval is counter-productive (Anki manual). An interval cap for repeatedly
  lapsed items is sensible practice but unproven.

## 5. Confidence, calibration, and self-grading

- Immediate self-report is weak. Delaying judgments of learning improves relative accuracy with g = 0.93
  (Rhodes & Tauber 2011 [meta](https://doi.org/10.1037/a0021705)); in problem-solving tasks, monitoring
  interventions average only g = 0.25, and timing interventions *hurt* (Janssen & Lazonder 2024
  [meta](https://doi.org/10.1007/s10648-024-09936-4)); a 475-student confidence-assessment RCT in mathematics
  found no attainment difference (d = −0.02, BF01 = 8.5) ([rct](https://link.springer.com/article/10.1007/s10763-021-10207-9)).
  Certainty-based marking improves exam discrimination and student satisfaction but does not reliably change
  learning ([study](https://doi.org/10.3390/ijerph19031706)) **[contested]** at the "does it teach?" level.
- Confidence is still diagnostic: feedback after low-confidence correct answers roughly doubled their retention
  (Butler, Karpicke & Roediger 2008). Use confidence to decide what gets feedback, not to set intervals.
- Grading from execution outcomes is objective and at least as trustworthy as self-report, but there is no direct
  RCT comparing execution-graded to self-graded scheduling; that part is extrapolation. FSRS accepts binary
  pass/fail, and Anki's data shows two-button grading performs comparably or better than inconsistent four-button
  grading ([forum](https://forums.ankiweb.net/t/pass-fail-grading-as-default/34147)). The app's use of failed runs
  and hints as effort signals is therefore reasonable and cheap.
- The weakest signal in the habit layer is the inline concepts self-grade on `/today`: immediate, binary, and
  unverified.

## 6. Cramming before a deadline

- Cramming is massed practice: it can hold short-term performance but decays quickly. Cousins et al. 2019 found
  one hour of cramming beat a break at 30 minutes, but the advantage was gone at one week while an equal-length
  nap persisted ([study](https://cogneuro-lab.org/UserFiles/Publication/Thelong-termmemorybenefitsofadaytimenapcomparedwithcramming..pdf)).
  The overall spaced-vs-massed effect is d ≈ 0.46 and smaller for complex tasks (Donovan & Radosevich).
- Sleep consolidation is real but less robust than folklore; replication failures and task-dependence are
  documented (Cordi & Rasch 2020 [review](https://doi.org/10.1016/j.conb.2020.06.002)) **[contested]**.
- What a deadline mode can honestly salvage: retrieval practice on high-frequency and most-confused patterns,
  immediate feedback, keep gaps as large as the deadline allows (≥1 day between passes when possible), stop
  interval growth at the deadline, and schedule one post-deadline retrieval. No RCT tests this workflow; the
  components are individually supported, the composition is extrapolation.

## 7. Evidence → DeepForge, honestly

**Already does well (strong evidence):**

- Retrieval-first review: re-solving from scratch is the pass signal; nothing is re-read.
- Spacing exists at all: seed at +1 day, then 1, 6, ease × interval — vastly better than massed re-solving.
- Effort-aware grading: `ProblemView.gradeHintAwareSolve` lowers quality when hints or failed runs preceded a
  pass, and quality 3 still counts as a pass; consistent with effort and feedback evidence.
- Coupling review to actual due dates and "only once per calendar day" (no schedule skips) is sound.
- Lapse reset to a 1-day interval; interleaving that never repeats a category back-to-back; a daily cap of 10.

**Approximates (plausible, not validated):**

- The ease factor is a coarse difficulty/stability proxy. `qualityFromRun` collapses SM-2's 0–5 ladder to
  0/3/4/5; that matches the "two reliable buttons beat four inconsistent ones" data, but loses Hard/Easy
  information that FSRS would use.
- `weakCategories` (lapse counts) and `pickWeakArea` (lapses → unsolved attempts → solve ratio) are reasonable
  heuristics with no direct evidence behind them.
- Interleaving-by-category ignores the confusability moderator from Brunmair & Richter; for broad CS categories
  this is probably harmless, but the benefit is likely below the meta's g = 0.42.

**Contradicts or is unsupported:**

- `readiness.ts` uses a **linear 28-day forgetting curve**. The best-fitting forgetting curves are power/
  exponential (FSRS-4 replaced exponential with power; FSRS-6 makes decay optimizable — see
  [algorithm explainer](https://expertium.github.io/Algorithm.html)). A linear proxy understates early decay and
  overstates late decay; a 100-day-interval item 10 days overdue and a 1-day-interval item 10 days overdue both
  read 0.64, even though their true recall probabilities differ by orders of magnitude. This is the clearest
  contradiction in the codebase.
- `MAX_EASE = 2.8` is practice lore with no empirical basis. Anki's SM-2 applies no upper cap, and the manual
  frames ease collapse ("ease hell") as an SM-2 artifact that FSRS avoids. The 1.3 floor exists because an ease
  ≤ 1 yields non-positive interval growth; that is engineering, not learning science.
- The doc comment's rationale ("expanding intervals") overstates a contested area; relative expansion is not
  what drives the benefit.
- `deriveReviews` grades any due re-solve `CLEAN_PASS` regardless of run context unless the UI path already
  graded it. The module's own doc says richer grades come "later"; until then, a non-UI or edge-path solve can
  buy a 6-day interval for a hint-heavy pass.
- No leech concept exists beyond a lapse count used for ranking: no threshold, interval cap, or reformulation
  state. The leech hub being built will surface this, but the scheduler still schedules the leech like any item.
- `targetDate` drives only projection and status; scheduling is deadline-blind.

## 8. Hypotheses

**H1 — Queue order should rank by overdue risk, not raw ease.**
**Claim:** ordering due items by elapsed-versus-interval (a retrievability proxy) puts the most-forgotten item
first, which ease ascending does not guarantee.
**Operationalization:** `dueReviews` sorts by `overdueRatio = max(0, daysBetween(due, today)) / max(1, interval)`
descending (tie-break: weak category, ease, due, difficulty, id); no new fields.
**Falsification test:** with `FIXED_NOW = 2026-01-14`, item A `{ease: 1.3, interval: 100, due: 2026-01-13}` and
item B `{ease: 2.5, interval: 3, due: 2026-01-04}`, `dueReviews(...)[0].id` must be B (A is only 1/100 overdue;
B is 10/3). Today the fixture returns A because ease ascends.
**Effort:** S. **Risk to existing data:** none (pure ordering change; stored state untouched).

**H2 — Replace the linear readiness curve with an interval-scaled exponential decay.**
**Claim:** retrievability should decay exponentially with time over the item's own stability, not linearly over a
fixed 28 days.
**Operationalization:** derive per-item stability from the review interval (`S = interval / ln(1/0.9)`, so
R ≈ 0.9 at the due date) and compute `R = exp(−elapsed / S)` with `elapsed = interval + daysOverdue` in
`readiness.ts`; the timestamp fallback uses the same curve.
**Falsification test:** with reviews `{interval: 30, due: 10 days ago}` and `{interval: 1, due: 5 days ago}`,
the first must classify retained (R ≈ 0.87) and the second not retained (R ≈ 0.53). The current linear formula
gives 0.64 and 0.82 — the first is a false negative, the second a false positive.
**Effort:** S. **Risk to existing data:** none (read-only derivation; no schema change).

**H3 — Scale the second review step to the target retention horizon.**
**Claim:** a fixed 6-day second interval is too short when the user is preparing for a date months away, because
optimal gap grows with retention interval.
**Operationalization:** when a readiness goal exists, seed/reconcile the second successful interval as
`clamp(round(daysUntil(target) * 0.08), 6, 30)` days; without a goal keep 6. User-visible: due dates shift out.
**Falsification test:** with goal `targetDate = now + 90 days`, the fixture that currently yields interval 6 for
a second clean pass must yield ≥ 7; with no goal it must still be exactly 6.
**Effort:** S/M. **Risk to existing data:** none (derived; existing `due` dates unchanged until next grade).

**H4 — Add a leech policy to `ReviewState` (threshold, cap, require two spaced passes).**
**Claim:** items that keep lapsing need an interval ceiling and a reformulation flag, not just another 1 → 6
ascent.
**Operationalization:** add optional `leech: boolean` and `leechSince: string | null` to `ReviewState`
(sanitizer defaults them), flag at `lapses >= 8`, cap interval at 7 days until two clean passes with ≥1 day
apart, and expose the flag for the triage hub. User-visible: leeched items reappear weekly and are labeled.
**Falsification test:** fixture `{lapses: 8, reps: 2, interval: 20, ease: 2.5}` must produce interval ≤ 7 with
`leech: true` on a clean pass, and `leech` must persist through a second pass the same day; it clears only after
a clean pass on a later calendar day. A control fixture with 1 lapse must reach interval 6 on its second pass.
**Effort:** M. **Risk to existing data:** none (optional fields; `sanitizeReviewState` fills defaults). Directly
complements the triage hub rather than replacing it.

**H5 — Deadline-aware scheduling: cap growth at the target date, reset after.**
**Claim:** when a mock-interview date is set, intervals that extend past it cannot help and inflate the
projection.
**Operationalization:** if `daysUntil(target) <= interval`, schedule due = `min(due, target − 1 day)` and do not
grow ease; after the target passes, reset affected items to a 1-day learning interval. Stored only via existing
fields plus the goal store.
**Falsification test:** with target 3 days out, ten consecutive quality-5 grades must never produce a due date
after the target; after `now > target`, `syncReviewQueue` must put every affected item in the learning bucket.
**Effort:** M. **Risk to existing data:** none (goal-conditional behavior; no schema change).

## 9. Ranking and recommendation

1. **H1 — overdue-risk ordering** (S): every day's queue is ordered by it, the evidence (FSRS/Anki's ascending
   retrievability) is strong, and it is the cheapest real improvement.
2. **H2 — exponential readiness curve** (S): fixes the one place where the code visibly contradicts the memory
   literature, with a one-fixture test.
3. **H3 — horizon-scaled second step** (S/M): moves the fixed 6-day constant toward the measured optimal-gap
   rule, conditional on a goal the app already stores.
4. **H4 — leech policy** (M): clearly needed, but the triage hub landing this wave should land first so the
   policy and the UI share one source of truth.
5. **H5 — deadline-aware scheduling** (M): valuable for mock-interview mode, but built on extrapolated cramming
   evidence; wait until the forecast track shows how users set dates.

**Recommended next two after this wave: H1, then H2.** H1 changes what the user sees first every day and is a
pure comparator rewrite covered by existing `dueReviews` fixtures; H2 removes a defensible-but-wrong claim from
the readiness score at the same effort. H3 is the natural third once the goal store is exercised by the forecast
track.
