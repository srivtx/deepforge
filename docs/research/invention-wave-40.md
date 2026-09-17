# Invention wave 40 — Ladder-Graded Spacing (LGS)

Research track, 2026-09-18. Read-only review of `reviewQueue.ts`, `reviewPlan.ts`, `readiness.ts`,
`hints.ts`, `runs.ts`, `progress.ts`, `sync/*`, `backup.ts`, `problem-meta.ts`, plus
`learning-science-review.md` (H1–H5). This invents **one** technique: **Ladder-Graded Spacing
(LGS)**. Code identifiers use the `lgs` prefix. All params are fixed constants; no fitting, no
network, no deps, no randomness. Every number quoted in §7 was computed in a throwaway `/tmp`
probe (not committed).

## 1. What it is

DeepForge grades a review from objective execution, not self-report: how many test runs failed
before the pass (`failedRuns`), which hint tiers were revealed (`hintTier`), whether code was reset
(`resetBeforePass`), and the outcome (`passed`). Today `qualityFromRun` collapses all of that to
0/3/4/5, `gradeReviewState` collapses that to ease + interval, and reset is never passed from
`ProblemView.gradeHintAwareSolve`. LGS keeps the run **ladder** as graded evidence: (a) a ladder
observation model turns the signal into an effective failure count `phi` and an evidence weight
`E(phi) ∈ (0,1]`; (b) success growth uses the FSRS-6 long-term formula times `E`, and failure uses
FSRS-6 post-lapse stability instead of the hard reset to 1 day; (c) an effort EWMA of normalized
struggle drives a bounded interim interval cap. Queue order and the readiness curve move to the same
quantity: predicted retrievability `R(t, S)` under a power-law forgetting curve.

It **supersedes** H1 (order by `overdueRatio` → order by predicted `R`), H2 (linear 28-day
readiness curve → power law with stored `S`), and H4 (`lapses >= 3` leech → effort EWMA + cap;
lapses no longer reset to 1 day). It leaves H3/H5 out of scope and composes with both. It adds no
per-review log and fits no per-user parameters: the app cannot do either, and FSRS's own benchmark
shows default parameters lose much of the edge of optimized ones, so fixed-parameter honesty
matters ([srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)).

Why DeepForge: hint tiers are **earned** by the hint budget (tier 2 needs 1 failed run or 3 min;
tier 3 needs 2 failed runs or 6 min, `hints.ts`). Unlike the hint-abuse literature, a hint here
cannot be premature — it records how deep the struggle went, making it legitimate memory evidence.
Failed test runs are observable errors, stronger than the response-time proxies now entering SRS
research.

## 2. Evidence base

- **FSRS-6 core.** Power-law curve `R(t,S) = (1 + factor·t/S)^(-d)`, trainable decay, long-term
  success and post-lapse formulas with 21 default weights. FSRS-7 (35 weights, fractional intervals)
  merged into the benchmark Mar 2026 but its Anki/fsrs-rs integration is still an open PR. Fetched:
  [awesome-fsrs wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm),
  [benchmark](https://github.com/open-spaced-repetition/srs-benchmark),
  [FSRS-7 PR](https://github.com/open-spaced-repetition/srs-benchmark/pull/290),
  [fsrs-rs PR #395](https://github.com/open-spaced-repetition/fsrs-rs/pull/395),
  [Expertium benchmark](https://expertium.github.io/Benchmark.html). Caveat: those log losses
  (FSRS-6 0.346, FSRS-7 0.344, FSRS-7 default 0.363) are flashcard recall; execution-verified
  multi-minute problems are out of distribution. LGS uses FSRS-6 defaults as a starting point and
  must be validated by simulation, not assumed.
- **Attempt-level frequency models.** DASH/DAS3H count correct/attempted with log transforms
  (diminishing returns, power law of practice) and beat IRT baselines on tutoring data
  ([DASH](https://laplab.ucsd.edu/articles/LindseyShroyerPashlerMozer2014.pdf),
  [DAS3H](https://arxiv.org/abs/1905.06873)). LGS borrows the shape: more failures ⇒ less credit.
  HLR predicts recall ~45% better than Leitner but needs hundreds of traces per item
  ([ACL 2016](https://aclanthology.org/P16-1174/) — DeepForge has none, hence fixed params).
- **BKT/DKT rejected here.** Per-step tracing needs step logs (absent) or large samples per skill
  ([Corbett & Anderson 1994](https://doi.org/10.1007/BF01099821),
  [Piech et al. 2015](https://arxiv.org/abs/1506.05908)); LGS stays at review-event level.
- **Objective outcome cues.** ARTS (response time + accuracy) beat fixed spacing at immediate and
  delayed tests ([Mettler et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6028005/)); SSP-MMC++
  reports +22.8% target-half-life achievement, −16.8% retention cost
  ([Springer 2026](https://link.springer.com/chapter/10.1007/978-981-95-7072-0_47)). But step-level
  response-time propensities are ambiguous and proficiency-moderated
  ([arXiv 2605.08943](https://arxiv.org/html/2605.08943)), and time is not persisted per problem
  anyway. LGS uses errors and hints, not wall-clock.
- **Errors + immediate feedback teach something.** [Kornell, Hays & Bjork 2009](https://doi.org/10.1037/a0015729),
  [Hays et al. 2013](https://doi.org/10.1037/a0028468): unsuccessful retrieval followed by
  immediate feedback enhances later learning. So a struggled pass is discounted, never treated as a
  lapse; in-app feedback is immediate.
- **Assistance is not free.** Hint shortcuts correlate with worse learning
  ([Stamper LAK 2026](https://dev.stamper.org/publications/An_LAK_2026.pdf)), hint use improves
  help-need prediction ([Maniktala 2022](https://doi.org/10.1007/s11257-022-09338-7)), assistance
  dilemma ([Koedinger & Aleven 2007](https://doi.org/10.1007/s10648-007-9049-0)). **Weak evidence,
  stated plainly:** nothing published maps hint tiers or failed runs to a stability multiplier. The
  `hintDebit` values are *chosen*, swept in simulation, and first to cut if calibration fails.
- **Item difficulty from outcomes.** Elo-style updates approximate IRT quality
  ([Pelánek 2016](https://doi.org/10.1016/j.compedu.2016.03.017)); LGS uses one exponential update
  because there is a single local user and no matchmaking — weaker, flagged.
- **Leech thresholds are lore** (Anki practice, no trial; see `learning-science-review.md` §4).

## 3. Formal model

`clamp(a,b,x) = min(b,max(a,x))`. Grade-time signal:
`{failedRuns >= 0, hintTier ∈ {0,1,2,3}, resetBeforePass, passed}`.

State (extends `ReviewState`; existing fields kept):
`v: 2`, `S` (stability, days at `R=0.9`, `0.1..36500`), `D` (this user's difficulty, `1..10`),
`effort` (EWMA, `0..1`).

```
d        = 0.1542                       // FSRS-6 w20 default
F        = 0.9^(-1/d) - 1               // = 0.980346...; forces R(S,S)=0.9
R(t,S)   = (1 + F*t/S)^(-d)             // t = whole days since last review
I(r,S)   = (S/F) * (r^(-1/d) - 1)       // I(0.9,S) = S exactly
phi(sig) = min(12, sig.failedRuns + (sig.resetBeforePass ? 0.5 : 0))
           + [0, 0.5, 1.5, 4.0][sig.hintTier]
E(phi)   = (1 + phi/6)^(-0.7)           // 1 at 0, 0.5 at 6, >0 always
```

Success (`passed`), with `R_pred = R(elapsedDays, S)` (0.9 when never reviewed):

```
S' = S * (1 + e^w8 * (11 - D) * S^(-w9) * (e^(w10*(1 - R_pred)) - 1)) * E(phi)
D_obs = 3 + 7 * phi / (phi + 6)
```

Lapse (`!passed`):

```
S' = w11 * D^(-w12) * ((S + 1)^(w13) - 1) * e^(w14 * (1 - R_pred))
D_obs = 10
```

Both: `D' = clamp(1,10, D + 0.15*(D_obs - D))`; `e = clamp(0,1,(phi + (passed?0:4))/8)`;
`effort' = 0.5*effort + 0.5*e`; `S' = clamp(0.1,36500,S')`;
`interval = clamp(1,36500, round(I(0.9,S')))`; if `effort' >= 0.6` then `interval = min(interval,7)`;
`due = addDays(dayKey(now), interval)`; `reps' = passed ? reps+1 : 0`;
`lapses' = passed ? lapses : lapses+1`. (With the 0.9 target, `interval = round(S')`.)

**Ordering (supersedes H1):** due items sort by `R(elapsed, S)` ascending, then weak-category weight
desc, due, difficulty rank, id; then `interleaveByCategory`; cap 10.
**Readiness (supersedes H2):** scheduled items use `R(t, S)`; unresolved items use `R(t, S0)` with
`S0 = 2.3065` (FSRS-6 initial Good stability), `t` = days since `max(solvedAt, lastOpened)`; the 0.7
retained threshold is unchanged.

Rejected variant, documented so verifiers can attack it: feeding the ladder estimate into `R_pred`
inside `e^(w10*(1-R))` explodes growth for struggled passes as `R → 0` (S=10, D=5, 3 failures → S' ≈
81 vs 21.7 with LGS) because that term is convex in R. LGS keeps `R_pred` model-driven and discounts
with bounded `E`.

## 4. Parameters, defaults, provenance

| Param | Default | Source |
|---|---|---|
| `d` | 0.1542 | FSRS-6 `w20` (wiki, fetched) |
| success weights | `w8,w9,w10 = 1.8722, 0.1666, 0.796` | FSRS-6 defaults |
| lapse weights | `w11..w14 = 1.4835, 0.0614, 0.2629, 1.6483` | FSRS-6 defaults |
| target retention | 0.9 | FSRS/Anki default; `I(0.9,S)=S` |
| `kappa` | 0.7 | chosen; `E` exponent; sweep `[0,1]` |
| `phi0` | 6 | chosen; half-discount after 6 effective failures; sweep `[3,12]` |
| `F_MAX` | 12 | chosen; caps one session's failure influence |
| `w_reset` | 0.5 | chosen; a reset may be refactoring, not forgetting |
| `hintDebit` | `[0, 0.5, 1.5, 4]` | chosen; tier 3 ≈ several failed retrievals; sweep |
| `w_forget` | 4 | chosen; effort increment for a failed review |
| `eta` | 0.15 | chosen; difficulty learning rate; sweep `[0.05,0.3]` |
| seeds | `S0=1, D0=5` | `S0` chosen so the current seed `due=+1` has `R=0.9`; `D0=5` FSRS-0 (wiki) |
| effort cap | `>=0.6 → <=7d` | chosen; weakest default (leech limits are lore) |
| bounds | `S/interval [0.1,36500]`, `interval >= 1` | Anki max-interval default; floor chosen |

Optional UI-only difficulty prior `{Easy:3.5, Medium:5, Hard:6.5}` from `problem-meta` at first
grade; the pure core and the `deriveReviews` path default to 5 (no meta available there).

## 5. State, migration, merge

**Migration** (inside `sanitizeReviewState`, runs on every read; idempotent; keeps `due`
byte-for-byte): `v := 2`; `S := reps > 0 ? clamp(0.1,36500,interval) : 1` (preserves the due anchor);
`D := clamp(1,10, 5 + (2.5 - ease)*2)` (2.5→5, 1.3→7.4, 2.8→4.4);
`effort := {0:0.9, 3:0.6, 4:0.3, 5:0.1, null:0}[lastGrade]`; all seven legacy fields kept verbatim.
No due date changes on upgrade; the next grade recomputes it. `ease` is frozen (rollback field),
`interval` is written by LGS after migration. Rollback = ignore v2 fields and resume SM-2 from the
stored ease/interval; worst case a few days of drift, no data loss.

**Sanitize:** missing/non-finite/out-of-range `S/D/effort` are re-derived from legacy fields, never
defaulted blindly; unknown `v` is treated as v1; nulls, arrays, strings, `NaN`/`Infinity`,
`interval < 0`, malformed `due` fall back exactly as the current sanitizer does.

**Merge:** no change to `mergeStoreValue`/`mergeReviews` logic. The new fields are atomic parts of a
record and the existing LWW by `lastReviewedAt` (fallback `due`, ties keep local) already selects
them together. Do **not** field-merge `S/D/effort` (max/average are wrong for a sequential update).
A stale v1 record that wins LWW is re-migrated on read and heals on the next grade. Exact ties stay
non-commutative (pre-existing); idempotent and local-stable regardless.

**Backup:** same key `deepforge:reviews:v1`, no inventory change; old backups migrate on read.

## 6. Determinism and API

Pure `src/lib/lgs.ts`: `ladderPhi(sig)`, `ladderEvidence(phi)`, `lgsRetrievability(state, now)`,
`lgsIntervalFor(S, target=0.9)`, `gradeLadderReview(prev, sig, now)`, `migrateReviewStateV1`. No
`new Date()`/`Date.now()`/`Math.random` inside; clocks injected. Same `(state, signal, now)` ⇒
identical JSON; same `(state, now)` ⇒ identical `{due, retrievability}`. Adapter
`gradeReviewState(prev, quality, now)` maps 5→`{f:0,h:0}`, 4→`{f:1,h:0}`, 3→`{f:1,h:2}`,
0→`{passed:false}`, so all existing callers/tests keep working.

## 7. Falsifiable predictions

P1 (**evidence monotonicity, exact table**). Fix `S=10, D=5, elapsed=10` (`R_pred=0.9`), pass:
`S'` strictly decreases in the order (0f,0h)=32.027 > (1f,0h)=28.751 > (2f,1h)=25.097 >
(3f,2h)=21.646 > (2f,3h)=19.715 (±1e-3); same with `reset=true` at fixed `f,h`; strictly decreasing
in `h` at fixed `f`.
P2 (**bounds/shape**). For all `S∈[0.1,36500]`, `D∈[1,10]`, `R∈[0.02,0.999]`: `S'` finite and
positive; on any pass `S' >= 0.4*S` (min observed 0.44 at `S=36500, D=10, phi=16`); `D'∈[1,10]`;
`effort'∈[0,1]`; `E∈[0.4,1]`; `interval>=1`; on fail `S'` increases in `S`, decreases in `D`.
P3 (**lapse policy**). `!passed, phi=0, R_pred=0.9`: `S' = 0.446 / 1.392 / 3.254` for `S = 1/10/100`,
intervals 1/1/3 — no hard reset for mature items, still short for weak ones. Two consecutive failed
reviews push `effort'` to 0.75 and cap the interval at 7.
P4 (**ordering**). (a) H1's fixture: A `{S=100, due yesterday}` → `R=0.899`, B `{S=3, due 10 days
ago}` → `R=0.774`; the queue must return B first. (b) Equal state/elapsed: clean pass schedules
strictly later than 2 failed runs + tier-3 hint (P1 fixture: intervals 32 vs 20, ratio 1.6; `>=1.25`
whenever `phi >= 4.5`).
P5 (**migration/merge**). `migrate` idempotent; preserves `due`, `reps`, `lapses`, `lastGrade`,
`lastReviewedAt` exactly; JSON round-trips; merge picks the newer `lastReviewedAt` with `S/D/effort`
intact; ties keep local; corrupt payloads never throw.
P6 (**simulation calibration**). On the §8 cohort at equal first-attempt recall: `>=10%` fewer
reviews per retained item than SM-2, and Brier no worse than SM-2 (same curve applied) or
FSRS-defaults-without-ladder.

## 8. Simulation protocol

One pure-TS file `scripts/lgs-sim.ts` (imports only `src/lib/lgs.ts`; deterministic LCG):
**Learners** `L=100` (extend to 400 once if inconclusive), **items** `M=40`, horizon 365 days. True
ability `a ~ N(0, 0.7²)`; true item difficulty `delta ~ N(0,1)`; true initial stability
`S* ~ lognormal(0.8, 0.5)` clipped `[0.3, 20]`. At a review on day `t`,
`R* = R(t, S*) * sigma(a - delta)`; attempts are Bernoulli with `p = R*`, max 4 failures; the
ground-truth state update uses FSRS-6 with the **true** `p` and no ladder discount, so `E` is tested
rather than assumed. Synthetic hint policy mirrors `hints.ts`: tier 2 after 1 failure, tier 3 after
2. **Arms:** `lgs`; `lgs-E1` (`E≡1`, isolates the ladder); `sm2` (exact current code path:
`qualityFromRun` + `applyHintPenalty` + `gradeReviewState`); `oracle` (true `S*`, ceiling).
**Metrics:** first-attempt recall at review; reviews per item still retrievable (`R*>=0.7`) at day
365; Brier of each arm's pre-review prediction (SM-2's interval converted by the same curve, per the
learning-science review's caveat); overdue-failure rate (`R*<0.5` when reviewed); reviews/day p95.
**Stopping:** 100 learners, paired-by-learner bootstrap (2,000 fixed-seed resamples) on the primary
metric; stop when the 95% CI of `LGS − SM-2` excludes 0, else extend to 400 once, else declare
inconclusive and do not ship on simulation alone. **Sweeps:** `kappa ∈ {0,0.35,0.7,1}`,
`hintDebit[3] ∈ {1.5,4,8,12}`, `eta ∈ {0.05,0.15,0.3}`, `w_forget ∈ {0,4}`. A 40×40×180-day smoke
probe showed the intended direction (5.72 vs 6.86 reviews/retained; first-pass 0.467 vs 0.471) but
used a buggy Brier estimator and is not evidence.

## 9. Failure modes and kill criteria

- **Over-discounting hints.** If `lgs` lapsing exceeds SM-2 by >20% relative in simulation, cut
  `hintDebit` (try `[0,0.5,1.5,1.5]`) then `kappa`; failing that, drop hints from `phi`.
- **Under-punishing struggle.** If Brier is worse than `sm2` by >0.01, raise `kappa`/lower `phi0`.
- **Wrong branch.** Force struggled passes into a lapse-anchored branch; if that arm beats the
  chosen one by >5% on the primary metric, the success-branch choice is falsified.
- **Ladder is noise.** If `lgs-E1` matches `lgs` (paired CI includes 0), kill the observation model.
- **Migration/merge.** Any `due` change without a grade, or idempotence failure, blocks the ship;
  rollback = ignore v2 fields.
- **Effort cap.** If capping at 7 days raises reviews/retained by >3% with no calibration gain,
  remove the cap (weakest default).
- **Global kill.** No `>=10%` primary win over SM-2 at recall parity, or worse calibration, after
  the 400-learner extension.

## 10. Implementation surface

- `src/lib/lgs.ts` (new): constants, formulas, `gradeLadderReview`, `migrateReviewStateV1`.
- `reviewQueue.ts`: widen `ReviewState`; migrate in `sanitizeReviewState`; `gradeReviewState`
  becomes the quality adapter; add `gradeReviewSignal(id, sig, now)`; `dueReviews` comparator →
  predicted `R` asc; `deriveReviews` unchanged (its `CLEAN_PASS` telemetry hole is not worsened).
- `ProblemView.tsx`: `gradeHintAwareSolve` passes `{failedRuns, hintTier: hintPenalty(hintSeen),
  resetBeforePass}` and the meta difficulty prior instead of a collapsed quality.
- `readiness.ts`: `reviewRetrievability` → `lgsRetrievability`; fallback `S0=2.3065`.
- `reviewPlan.ts`: optional `effort` leech ranking and mean predicted `R` in `health`.
- UI: review cards show "predicted recall today: X%" and the next interval; a "struggle" tag at
  `effort >= 0.6`.
- Tests: `tests/lgs.test.ts` (P1–P5), updated `tests/reviewQueue.test.ts`; backup suite untouched.

## For the verifiers

- **P1 math.** Recompute 32.027 / 28.751 / 25.097 / 21.646 / 19.715 to ±1e-3; strict monotonicity in
  `failedRuns` and in `hintTier` separately; `reset` strictly lowers `S'`. Any non-monotone step or
  number mismatch falsifies the core claim.
- **P2 algebra.** Prove or refute `S' >= 0.4*S` on passes with defaults; check `E` bounds,
  `I(0.9,S)=S` and `R(S,S)=0.9` to 1e-12, and finite/no-NaN behavior at all clamps.
- **P3 fixtures.** Reproduce lapse `S' = 0.446/1.392/3.254`, intervals 1/1/3, `S_f` monotone in
  `S`/`D`, effort 0.5 → 0.75 → 0.375 over fail/fail/clean, and the 7-day cap at `effort >= 0.6`.
- **P4 fixtures.** Assert queue order and the interval ratio; verify the comparator is a total order
  and `interleaveByCategory` behavior is unchanged.
- **P5 migration.** Fixture `{ease:1.7, interval:14, due:"2026-10-02", reps:3, lapses:2, lastGrade:3}`
  → `S=14, D=6.6`, `due` byte-identical; idempotent under double-sanitize; fuzz 10k corrupt payloads
  (null, arrays, strings, `NaN`, `Infinity`, negative intervals, `2026-02-30`) with no throw and
  usable output. Merge: newer `lastReviewedAt` wins with v2 fields intact; ties keep local; v1-wins
  re-migrates.
- **P6 simulation.** Run `scripts/lgs-sim.ts` twice (bit-identical); confirm arms/metrics match §8,
  that SM-2's probability conversion is the stated curve, and the stopping rule is deterministic.
  Independent replication targets the direction, not the exact numbers.
- **Citations.** Every URL resolves and supports its sentence — especially FSRS-6 defaults (w8–w14,
  `d=0.1542`), FSRS-7 merge status, and that the hint/reset mapping is *not* claimed validated.
- **Integration.** `gradeReviewState` adapter preserves all pre-existing fixtures; the
  `deriveReviews` telemetry hole is unchanged; no new storage key; no backup inventory change;
  rollback leaves valid v1 state.

## Errata (independent verification, 2026-09-18)

Two independent audits (theory V1 + empirical V2) refuted or corrected the following. The
authoritative implementation spec is `wave-40-blueprint.md`; where §3–§7 disagree with it, the
blueprint wins.

- **P3 lapse fixtures wrong.** At `D=5, phi=0, R_pred=0.9`, `S' = 0.316769 / 1.391987 / 3.747287`
  for `S = 1/10/100`, intervals 1/1/4 — not 0.446/1.392/3.254 and 1/1/3. The spec's numbers used
  `elapsed=10`; state `R_pred` explicitly in every lapse fixture.
- **P3 effort trajectory impossible as stated.** `effort' = 0.5·effort + 0.5·e` with `e=0` on a
  pass caps effort at 0.5, so `effort' >= 0.6 → interval <= 7` can never be entered by a single
  clean pass; it is a lapse/struggle cap. Correct fixtures: `0.5→0.5→0.25` (`phi=0` fails then
  clean pass) and `0.75→0.875→0.4375` (`phi>=4` fail then clean pass).
- **Migration as written corrupts v2 state.** "Runs on every read" re-derives `S/D/effort` and
  silently resets graded records. Guard: derive a field only when `v !== 2` or that field is
  missing/non-finite/out-of-range; valid v2 fields are copied verbatim. Byte-idempotent
  (`migrate(migrate(x)) === migrate(x)`; 15k fuzz, 0 violations).
- **`elapsedDays` was undefined and changes results ~3×.** Define: whole-day-key difference from
  `lastReviewedAt` when present, else `max(0, round(interval)) + max(0, daysPastDue)` (local date
  keys, UTC diff; DST-safe). Fixture `{interval:6, due:3 days ago}` → elapsed 9.
- **P2 minimum is 0.40273, not 0.44.** `E(16) = (11/3)^(−0.7) = 0.40273` is the true minimum pass
  ratio; the final noE variant removes `E`, so its minimum is `1.000900` — `S` never shrinks on a pass.
- **P4b universal ratio refuted.** `interval_clean/interval_struggled >= 1.25 whenever phi >= 4.5`
  is false (min 1.0; 975 counterexamples, e.g. `S=0.1, D=1, R=0.9, phi=5` → 1 vs 1). 32-vs-20 holds
  only with the spec's `E`; the final variant diverges via `D` (twin second pass 93.04 vs 87.57).
- **P1 strictness is capped.** `S'` strictly decreases in `failedRuns` only below `F_MAX=12`; at or
  beyond the cap it is flat (reset at `f=12` does not lower `phi`). In the final variant `S'` is
  ladder-independent on passes; the ladder moves `D'` and `effort'`.
- **N1 NaN injection.** `failedRuns`/`hintTier` were unclamped, so junk input made `phi` NaN and
  `due` `"NaN-NaN-NaN"`. Clamp tier to 0..3, failures ≥0, non-finite → 0, and re-validate outputs.
- **FSRS-7 citation stale.** `fsrs-rs` PR #395 merged 2026-09-08; benchmark log-loss is FSRS-7
  `0.3401` vs default `0.3620` (FSRS-6 `0.346`) — replace the "still an open PR" sentence and the
  `0.344/0.363` figures in §2.
- **S2 test premise false.** Existing tests do not "keep working": `reviewQueue`/`labReviews`/
  `readiness` fixtures must be updated (blueprint §6). `concepts.ts` is an independent scheduler and
  is unchanged.
- **Empirical mandate.** Default LGS fails P6 (3.10% fewer, 0/30 seeds); `hintDebit[3]=1.5` passes
  (14.31%); the ablation shows `E` costs +27% reviews with no Brier gain, so the blueprint ships
  **noE** (25.32% literal / 25.63% matched-recall, 30/30 seeds, Brier better every seed, edge
  learners ≤1.10×). The literal §8 truth protocol is degenerate (all arms retain 4000/4000);
  acceptance must use the memory-based truth model plus ability offsets.

verified 2026-09-18
