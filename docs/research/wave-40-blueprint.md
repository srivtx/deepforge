# Wave 40 blueprint — Ladder-Graded Spacing (final, implementable)

Status 2026-09-18. Supersedes `invention-wave-40.md` §3–§7 wherever they differ; the two
verifier audits are ground truth. Chosen variant: **(b) noE** — success stability is FSRS-6
growth with no evidence multiplier; the ladder survives in difficulty `D` and effort/interval cap.
Every number below was measured with `/tmp/lgs-verify` (verifier `core.ts`/`sim.ts` untouched;
new `vsim.ts`/`variants.ts` add a mode-aware grader).

## 1. Decision and measured basis

Ablation (verifier, P6): the `E` multiplier costs **+27% reviews with no Brier gain**
(`lgsE1 − lgs` Brier CI includes 0). The spec's own kill rule says kill the observation model in
that case, so `E`, `kappa`, `phi0` are retired. Variant scores at the default cohort
(L=100, M=40, 365d; literal = paper §8 protocol `gtPredictor="p"`, degenerate retention
4000/4000; matched = memory-only truth + ability-offset interpolation at recall 0.5):

| Variant | literal %fewer | matched %fewer | 30-seed CI (mean [lo,hi], seeds≥10%) | hintHeavy ×SM-2 | resetHeavy | oneLeech |
|---|---|---|---|---|---|---|
| spec-full | 3.10 | 18.22 | 2.85 [2.32,3.37], 0/30 | 1.449 | 1.001 | 0.999 |
| retuned h15 | 15.57 | 20.94 | 14.31 [13.75,14.87], 30/30 | 0.904 | 0.880 | 0.919 |
| **noE (chosen)** | **25.32** | **25.63** | **24.20 [23.70,24.70], 30/30** | **0.993** | **0.775** | **0.838** |
| nonHintE | 16.38 | 23.01 | 14.79 [14.29,15.29], 30/30 | 1.074 | 0.887 | 0.917 |

Chosen numbers: memory-truth CI 20.84 [20.41,21.26] 30/30; Brier delta vs SM-2 −0.1105
CI [−0.1129,−0.1081] (0/30 seeds worse); raw recall −2.53pp (CI [−2.57,−2.50]); allFail 1.000×,
perfect 0.833×; p95 reviews/day 442. Parameter deltas from the spec: (1) drop `E(phi)` from the
success update (+ its `kappa`/`phi0`); (2) define `elapsed` (S1); (3) guarded migration (B3);
(4) clamp `failedRuns`/`hintTier` (N1). No `hintDebit` change is needed once `E` is gone.

## 2. Final model (exact)

`d = 0.1542`; `F = 0.9^(−1/d) − 1 = 0.9803464944134797`;
`R(t,S) = (1 + F·t/S)^(−d)`; `I(r,S) = (S/F)·(r^(−1/d) − 1)` (`I(0.9,S) = S`).
`t` is whole calendar days (`≥0`), computed from **date keys**, never wall-clock deltas.

```
phi   = min(12, f + (reset ? 0.5 : 0)) + hintDebit[clamp(0,3,floor(hintTier))]
        f = Number.isFinite(failedRuns) ? max(0, failedRuns) : 0       // N1
elapsed = lastReviewedAt ? keyDiff(dayKey(lastReviewedAt), today)
                        : max(0, round(interval)) + max(0, keyDiff(due, today))   // S1
rPred = R(elapsed, S)
pass: S' = S · (1 + e^w8 · (11−D) · S^(−w9) · (e^(w10·(1−rPred)) − 1))     // no E
fail: S' = w11 · D^(−w12) · ((S+1)^(w13) − 1) · e^(w14·(1−rPred))
D_obs = pass ? 3 + 7·phi/(phi+6) : 10
D'    = clamp(1,10, D + eta·(D_obs − D))
e     = clamp(0,1, (phi + (pass ? 0 : 4))/8)
effort' = 0.5·effort + 0.5·e
S'    = clamp(0.1, 36500, S')
interval = clamp(1, 36500, round(I(0.9, S')))
if (effort' >= 0.6) interval = min(interval, 7)
due   = addDays(today, interval);  reps' = pass ? reps+1 : 0;  lapses' = pass ? lapses : lapses+1
lastGrade' = pass ? (reset ? 3 : (f > 0 || tier > 0) ? 4 : 5) : 0   // adapter overrides with its quality
lastReviewedAt' = now.toISOString()
```

`prev` undefined seeds `{v:2, ease:2.5, interval:1, due:today+1, reps:0, lapses:0, lastGrade:null,
lastReviewedAt:null, S:1, D:5, effort:0}` (general elapsed rule then gives `R(1,1)=0.9`).
`ease` is never touched after migration (rollback field).

**Cap semantics (lapse-entered, not a success penalty).** From `effort=0` even a maximal `phi`
review gives `effort'=0.5 < 0.6`; binding needs ≥2 consecutive high-`phi` reviews, and any clean
pass (`e=0`) halves effort and releases the cap. Fixture: `{S:36500, D:1, effort:0.5}` + pass
`f=12,h=3` (`phi=16`) → `S'=36500`, `D'=2.063636`, `effort'=0.75`, `interval=7`. A single
4-failure lapse from `effort=0` → `effort=0.5`, `S'=3.747287` (S=100), interval 4, uncapped.

**Bounds (P2, final).** Pass `S' ≥ S` (growth ≥ 1 for `D ≤ 10`, `rPred ≤ 1`; measured min
`1.000900` at `S=36500, D=10, rPred=0.999`). Fail `S'` increases in `S`, decreases in `D`.
All outputs finite; `D'∈[1,10]`, `effort'∈[0,1]`, `interval∈[1,36500]`.
(Superseded spec minimum: `E(16)=(11/3)^−0.7=0.40273`, not 0.44 — S3.)

### Parameters (corrected defaults + provenance)

| Param | Value | Source |
|---|---|---|
| `decay` | 0.1542 | FSRS-6 `w20` |
| `w8,w9,w10` | 1.8722, 0.1666, 0.796 | FSRS-6 defaults |
| `w11..w14` | 1.4835, 0.0614, 0.2629, 1.6483 | FSRS-6 defaults |
| `target` | 0.9 | FSRS/Anki; `I(0.9,S)=S` |
| `fMax` | 12 | chosen; caps failed-run part only, `phi ≤ 16` |
| `wReset` | 0.5 | chosen; reset may be refactoring |
| `hintDebit` | [0, 0.5, 1.5, 4.0] | chosen; now feeds `D_obs`/effort only |
| `wForget` | 4 | chosen; effort increment on a fail |
| `eta` | 0.15 | chosen; difficulty learning rate |
| `effortCap`, `capInterval` | 0.6, 7 days | chosen; weakest default |
| bounds | `S[0.1,36500]`, `interval[1,36500]` | Anki max-interval default; floor chosen |
| **removed** | `kappa=0.7`, `phi0=6`, `E(phi)` | ablation; see §1 and Errata |

## 3. Module API — `src/lib/lgs.ts` (new, pure, zero imports)

No `new Date()`, `Date.now()`, `Math.random`; same `(state, signal, now)` ⇒ identical JSON.

```ts
export const LGS_VERSION = 2;
export interface LgsParams { decay, w8, w9, w10, w11, w12, w13, w14: number;
  fMax, wReset, wForget, eta, target, effortCap, capInterval: number;
  hintDebit: readonly [number, number, number, number]; }
export const LGS_DEFAULTS: LgsParams;
export interface LgsSignal { passed: boolean; failedRuns: number; hintTier: number;
  resetBeforePass: boolean; }
export interface LgsLegacyFields { ease: number; interval: number; due: string; reps: number;
  lapses: number; lastGrade: 0 | 3 | 4 | 5 | null; lastReviewedAt: string | null; }
export interface LgsState extends LgsLegacyFields { v: 2; S: number; D: number; effort: number; }

export function lgsRetrievabilityAt(t: number, S: number, p?: LgsParams): number;
export function lgsIntervalFor(S: number, target?: number, p?: LgsParams): number;
export function ladderPhi(sig: Pick<LgsSignal, "failedRuns"|"hintTier"|"resetBeforePass">,
  p?: LgsParams): number;                                   // N1-clamped
export function lgsResolveFields(state: LgsLegacyFields):
  { S: number; D: number; effort: number };                 // stored v2 values, else migration rule
export function lgsElapsedDays(prev: LgsLegacyFields, todayKey: string): number;
export function lgsRetrievability(state: LgsLegacyFields, now: Date, p?: LgsParams): number;
export function gradeLadderReview(prev: LgsLegacyFields | undefined, sig: LgsSignal,
  now: Date, p?: LgsParams): LgsState;
export function migrateReviewState(value: unknown, todayKey: string): LgsState | null;
```

`lgs.ts` owns the local `dayKey`/`addDays`/date-key-diff helpers (DST-safe local `setDate`, UTC
`Date.UTC` diff), mirroring `daily.ts`; a test asserts equality with `getDailyDateKey`.

## 4. Persistence: sanitize, migration, merge

**Sanitize (`reviewQueue.sanitizeReviewState(value): LgsState | null`)** keeps current behavior
for the seven legacy fields, computes `todayKey = getDailyDateKey()`, then delegates to
`migrateReviewState(value, todayKey)`. `parseReviewMap` is unchanged.

**Migration guard (B3).** Derive `S/D/effort` **only** when `v !== 2` **or** that field is missing,
non-finite, or out of range; valid v2 fields are copied verbatim. Derivation from sanitized legacy:

```
S = reps > 0 ? clamp(0.1,36500, interval) : 1
D = clamp(1,10, 5 + (2.5 − ease)·2)            // 2.5→5, 1.3→7.4, 2.8→4.4
effort = {0:0.9, 3:0.6, 4:0.3, 5:0.1, null:0}[lastGrade]
```

`due`, `interval`, `reps`, `lapses`, `lastGrade`, `lastReviewedAt`, `ease` are preserved exactly.
Output key order is fixed, so `JSON.stringify(migrate(migrate(x))) === JSON.stringify(migrate(x))`
(byte-idempotent; 15k fuzz proven by the verifier; `tests/lgs.test.ts` re-proves with a fixed seed).

**Merge.** No changes to `mergeStoreValue`/`mergeReviews`/`backup.ts`. `mergeReviews` already
sanitizes both sides (which now migrates) and picks LWW by `lastReviewedAt` else `due`, ties keep
local; the new fields are atomic parts of the record and travel together. Never field-merge
`S/D/effort`. A stale v1 record that wins LWW re-migrates on the next read. Same storage key
`deepforge:reviews:v1`; no backup-inventory change. Lab reviews ride the same sanitizer.

## 5. Consumer changes

**`reviewQueue.ts`** — `ReviewState` stays the seven-field public type (minimal churn);
`ReviewMap = Record<string, ReviewState>`; runtime values are `LgsState` after sanitize.
- `seedEntry` gains `v:2, S:1, D:5, effort:0` (first-review anchor unchanged: interval 1, due+1).
- `gradeReviewState(prev, quality, now)` becomes the adapter: 5→`{f:0,h:0}`, 4→`{f:1,h:0}`,
  3→`{f:1,h:2}`, 0→`{passed:false}`; calls `gradeLadderReview`; overrides `lastGrade` with
  `quality`. Signature and call sites unchanged. First clean grade from the seed: interval **4**
  (`S'=4.232585`, `D'=4.7`); q4/q3 same interval with `D'=4.85/5.008824`, `effort'=0.0625/0.15625`;
  q0 → `S'=0.316769`, interval 1, `D'=5.75`.
- New `gradeReviewSignal(id: string, sig: Partial<LgsSignal>, now?: Date): LgsState` — derives the
  map, normalizes the signal, persists, mirrors `gradeReview`.
- `deriveReviews`/`reconcileEntry` logic unchanged (still CLEAN_PASS through the adapter).
- `dueReviews` comparator (supersedes H1): `lgsRetrievability(a.state, now) − lgsRetrievability(b.state, now)`
  ascending, then weak-category weight desc, `due`, difficulty rank, id.
- `ProblemView.gradeHintAwareSolve`: when due and not already graded today, if
  `failedRuns === 0 && hintTier === 0` return (clean pass stays on the `deriveReviews` path);
  otherwise `gradeReviewSignal(problem.id, { passed: true, failedRuns, hintTier: max(hintSeen),
  resetBeforePass: false }, now)`. `hints.applyHintPenalty` stays for the lab path only.
- `labReviews.ts`: `defaultLabReviewState`/`seedLabReviewState` emit `v:2,S:1,D:5,effort:0`;
  `sanitizeLabReviewState` already spreads the base sanitizer.

**`readiness.ts`** (supersedes H2): replace `reviewRetrievability` with `lgsRetrievability`
(live state; missing fields resolved by `lgsResolveFields`); replace the linear
`timestampRetrievability` with `lgsRetrievabilityAt(ageDays(since max(solvedAt,lastOpened)), 2.3065)`.
Keep `RETENTION_THRESHOLD = 0.7`; delete `RETENTION_HORIZON_DAYS`. Fallback `0.7` crossing is
**21.42 days** (`R(21)=0.70194`, `R(22)=0.69741`), vs 8.4 days under the old linear curve — this is
intended and must be stated in the UI copy/PR.

**`reviewPlan.ts`** (ordering track): `cramQueue` primary sort → `lgsRetrievability` asc, then
overdue desc / weak weight / due / id (same `why` strings); `health` gains additive
`meanRetrievability: number | null` (mean over tracked items; null when none). `leeches` unchanged
(lapses remain the leech signal). `ReviewHub`/`Today` may surface predicted recall and an
`effort >= 0.6` "struggle" tag; no contract changes.

**Not changed:** `concepts.ts` (independent SM-2 scheduler, out of scope), `remoteMerge.ts`,
`sync/*`, `backup.ts`, `hints.ts`, `stats.ts`, `pathCheckpoints.ts`, `weeklyDigest.ts`.

## 6. Test and acceptance plan

**`tests/lgs.test.ts` (new, fast, fixtures only; no simulation).**
1. Identities: `|R(S,S)−0.9| < 1e−12`, `|I(0.9,S)−S| < 1e−9` for `S ∈ {0.1,1,2.3065,10,100,1000,36500}`.
2. P1 table (S=10, D=5, elapsed=10): `S' = 32.026729` for all five signals ±1e−3 (the ladder no
   longer moves `S'`); `D' = 4.7 / 4.85 / 5.008824 / 5.15 / 5.225`; `effort' = 0 / 0.0625 / 0.15625 /
   0.28125 / 0.375`; intervals all 32. Assert `D'` and `effort'` strictly increase in `phi` below the
   cap and are non-decreasing beyond `f=12`.
3. P3 lapse: `lapseStability(1/10/100, D=5, rPred=0.9) = 0.316769 / 1.391987 / 3.747287`,
   intervals 1/1/4. Effort: `0.5→0.5→0.25` (two `phi=0` fails, then clean pass) and
   `0.75→0.875→0.4375` (one `phi=4` fail, then clean pass).
4. Cap: `{S:36500,D:1,effort:0.5}` + pass phi=16 → interval 7, `S'=36500`, `effort'=0.75`; one
   heavy fail from `effort=0` → `effort=0.5`, not capped.
5. D-channel twin: clean vs `f=3,h=3` pass → first `S'=32.026729` both, `D'=4.7` vs `5.265385`;
   second clean pass at the interval → `93.041293` vs `87.565627` (ratio 1.0625).
6. Ordering: H1 fixture `S=100,due 2026-01-13` vs `S=3,due 2026-01-04` at now `2026-01-14` →
   `rA=0.89931494`, `rB=0.77441687`, B first, total order, insertion-order independent.
7. Migration: `{ease:1.7, interval:14, due:"2026-10-02", reps:3, lapses:2, lastGrade:3}` →
   `S=14, D=6.6, effort=0.6`, `due` byte-identical; double-migrate JSON-equal; fixed-seed
   (mulberry32 112233) 3,000-payload fuzz: no throw, ranges hold, `due` never moved; **regression
   for B3**: a valid v2 record `{S:7,D:3,effort:0.2}` is unchanged by double migration.
8. NaN guards: `failedRuns: NaN`, `hintTier: 99`, `S: NaN`, duplicate/absent fields → finite
   `S/D/effort`, `interval ≥ 1`, `due` matches `/^\d{4}-\d{2}-\d{2}$/`, never `"NaN-NaN-NaN"`.
9. Elapsed: `lastReviewedAt` wins; else `interval + max(0, daysPastDue)`; DST sample
   (`2026-03-07 → 2026-03-09`) = 2 days.

**`scripts/lgs-sim.ts` (new, permanent, manual — not CI).** Deterministic (mulberry32, fixed seeds
`20260918`/`987654321`), imports only `src/lib/lgs.ts` plus an in-file SM-2 port. Cohort L=100,
M=40, 365 days, ability `N(0,0.7²)`, difficulty `N(0,1)`, `S*~lognormal(0.8,0.5)` clipped [0.3,20].
**Corrected truth protocol:** memory update uses `Rmem` only; session pass probability
`p = Rmem·σ(a−δ)`; ability offsets generate the recall-matched curve. Arms: `lgs` (final), `sm2`
(current path), `oracle`. Gates: matched-recall ≥10% fewer at recall 0.5, Brier ≤ SM-2 + 0.01,
hintHeavy/resetHeavy/oneLeech ≤1.10× SM-2 reviews, two runs byte-identical; exit 1 otherwise.

**Existing tests.** `tests/reviewQueue.test.ts`: replace SM-2 ladder/ease assertions with LGS
fixtures (first grade interval 4; 4 → 15 → 49 → 142 → 375 on the canonical sequence); seed
tests expect the v2 fields; ordering tests expect predicted-R order; adapter tests check
`S/D/effort`; `qualityFromRun` tests unchanged. `tests/labReviews.test.ts`: second pass after 10
days → interval 12 (`S'=11.8071`), lapse → interval 1/`S'=0.3168`, ease stays 2.5 (frozen).
`tests/readiness.test.ts`: 8d/9d fixtures → 21d/22d (0.70194/0.69741); overdue queue fixture must
set `S=2` (R(20,2)=0.6927) to stay below threshold; add v2 fields to seeded records.
`tests/reviewPlan.test.ts`: expected to pass via `lgsResolveFields` fallbacks; add one fixture where
differing `S` changes order. `tests/concepts.test.ts`: **unchanged** — `concepts.ts` is an
independent scheduler (the verifier's blanket "all callers break" is corrected to this list).

## 7. Parallel tracks (exact write ownership, no overlaps)

| Track | Owns (writes) | Depends on |
|---|---|---|
| **A core** | `src/lib/lgs.ts` (new), `tests/lgs.test.ts` (new), `scripts/lgs-sim.ts` (new) | — |
| **B queue+callers** | `src/lib/reviewQueue.ts`, `src/lib/labReviews.ts`, `src/components/ProblemView.tsx`, `tests/reviewQueue.test.ts`, `tests/labReviews.test.ts` | A (frozen API) |
| **C readiness** | `src/lib/readiness.ts`, `tests/readiness.test.ts` | A (C reads B's files, writes none) |
| **D hub/UI** | `src/lib/reviewPlan.ts`, `src/components/review/ReviewHub.tsx`, `src/components/today/Today.tsx`, `tests/reviewPlan.test.ts` | A (reads B's files, writes none) |
| **E docs** | `docs/research/wave-40-blueprint.md`, errata in `docs/research/invention-wave-40.md` | — (this document) |

Order: A first (API frozen, fixtures land); then B/C/D in parallel; then integration. Per-track
verification: **A** `bun test tests/lgs.test.ts && bunx tsc --noEmit`; **B**
`bun test tests/reviewQueue.test.ts tests/labReviews.test.ts tests/stats.test.ts tests/weeklyDigest.test.ts
tests/path-checkpoints.test.ts`; **C** `bun test tests/readiness.test.ts tests/assistant.test.ts`;
**D** `bun test tests/reviewPlan.test.ts`. Ship gate: `bun test && bun run lint && bunx tsc --noEmit`
and manual `bun run scripts/lgs-sim.ts` (all gates green). No new storage keys, no backup inventory
edits, one new pure module, adapter inside `reviewQueue`.

## 8. Day one, rollback, kill criteria

Day one: migration only derives `S/D/effort`; `due`, `interval`, `reps` are byte-identical, so due
dates and buckets do not move until the next grade. The first post-upgrade grade uses LGS
(e.g. a due clean solve moves from SM-2's next interval to `round(S')` computed from `S=interval`).
Queue order and readiness change immediately (predicted R; more forgiving power-law retention —
0.7 crossing 21.4d vs 8.4d). Rollback: ignore `v2` fields and resume SM-2 from frozen `ease` and the
LGS-written `interval`; no data loss, at most a few days of drift.

Kill criteria: (1) sim gates fail (matched-recall <10%, Brier > SM-2+0.01, or any edge policy
>1.10× reviews); (2) any `due` change without a grade, or non-idempotent migration; (3) any NaN in
`S/D/effort/interval/due` under fuzz; (4) live observation that repeated struggle no longer
shortens intervals (D/effort channel dead) — revert.

## 9. Top risks

1. **Single struggled pass schedules like a clean one** (E removed). The ladder now bites only
   through `D` and the effort cap over repeats; if the sim's truth model understates struggle
   penalty, fragile items over-schedule. Mitigation: D/effort fixtures, twin test, edge-learner
   gates, rollback.
2. **Migration guard is the only corruption barrier.** Every sanitize path (queue, labs, merge,
   backup import) must delegate to one `migrateReviewState`; a second unguarded derivation path
   would silently reset v2 records. Mitigation: single implementation + fixed-seed fuzz + merge tests.
3. **Behavior shift for existing users** (ordering and readiness move on first read). Mitigation:
   due dates frozen, threshold unchanged, tests/fixtures updated, PR note; scheduling path is the
   only thing that changes on grades.
