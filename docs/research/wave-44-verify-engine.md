# Wave 44 — Independent cross-verification (Refutation-Ledger Values engine)

Date: 2026-09-19. Role: independent cross-verifier (no file touched except this report; no git). Inputs:
`wave-44-attack-correctness.md` §4/§5, `wave-44-attack-significance.md` §3, `wave-44-blueprint.md`
(parts 1a/1b/1c), `src/lib/warrant/*.ts`, `scripts/verify-warrant.ts`. Scratch probes lived in
`/var/folders/.../T/opencode/w44-verify/` (outside the repo) and were run with `bun`; the shipped tests
were executed but are treated only as claims to check, never as evidence. Every row below cites the
probe line, a source line, or a command output.

## Verdict

**PASS WITH FIXES.** The numeric and contract core survives independent attack: the pinned arena digest
`ca0cda0f562b8c10` reproduced exactly through the gate and through `runArena()`; `runArena({seeds:5})`
was byte-equal across two runs; my own seeded demotion oracle agreed with `lambda` on 400 random DAGs
(precision = recall = 1, exact set equality 400/400); my independently rebuilt R/D/C/P/X manifests
scored through the shipped graders reproduce **every** reported pair-win cell with zero mismatches, B1
ties at exactly 0.5 in every regime, B5 is a real adversary (X: 3 vs 2, PW 0), B7 wins X (1 vs 2,
PW 1), F1 fires as diagnosed, P1–P5 all pass, churn is 0/0 and demotion 1.0/1.0. Two things must be
fixed before ship: (1) stored `Value` records are not runtime-frozen and `audit` never re-derives
`valueIdOf`, so an anchored audit accepts a cite-severed store that resurrects a dead value and hides
the original refutation (falsifies the "cites are frozen" / anchored-tamper-evidence claim, not the
arena numbers); (2) the binding blueprint calls the shipped B7 join "Jaccard ≥ 0.5" while the engine
implements `|A∩B| / max(|A|,|B|)`, which joins pairs that Jaccard would keep separate — the
counterexample requested in the brief lands on that label. Several doc-vs-code nits (AP@12 tie-break,
gate pin coverage, F1/P5/F4 wording, regime D ≡ R, seed step count) are listed below; none changes a
shipped result.

## Claim-by-claim results

| # | Claim | Method used | Observed | Expected | Status |
|---|---|---|---|---|---|
| 1 | Pinned gate output | `bun run scripts/verify-warrant.ts` | `WARRANT_GATE {"passed":8,"failed":0,"runtimeMs":12409,"digest":"ca0cda0f562b8c10"}` | same digest, 0 failed | PASS |
| 2 | `runArena({seeds:5})` deterministic | two runs, canonical JSON compare | digest `e5c9baf6080ea405` twice, `byteEqual:true` | equal | PASS |
| 3 | 200-seed arena digest | `runArena()` | `ca0cda0f562b8c10`, config `{seeds:200}`, baseSeed `9e3779b9` | pinned | PASS |
| 4 | Shipped seeds:8 pin | `runArena({seeds:8}).digest` | `053138bfbca949ec` | `053138bfbca949ec` (tests/warrant-arena.test.ts:466) | PASS |
| 5 | Context-keyed id, idempotent assert | probe: same/different context | `same=true diff-context=true` | per part1a line 15 | PASS |
| 6 | Refuted re-mint refused | probe + `RefusedRemintError` | `refused=true`; fresh context mints (declared instance semantics, paper:355) | throw | PASS |
| 7 | derive canonicalizes cites | probe: order+dup, different cites | `canonical=true cites-commit=true` | sorted/unique, id commits to cites | PASS |
| 8 | Exact demotion P/R | own reachability oracle, 300 seeded DAGs + 100 two-refute DAGs | `precision=1 recall=1 exact=300/300 cone=300/300`; `exact=100/100` | 1.0 | PASS |
| 9 | Alive gate removed | derive on dead cite | child immediately dead | dead | PASS |
| 10 | Monotone/absorbing I4' | 597 `lambda` comparisons over 60 DAGs | `monotone=597/597 absorbing=60/60` | no decrease; dead absorbing | PASS |
| 11 | Admission error precedence | 8 two-error scenarios | unknown-value > malformed > version-not-root/unknown-root > chain-budget > duplicate-inconclusive > subsumed-family > bad-signature; rejected attempts leave input store byte-equal | blueprint part1a §2(c) order | PASS |
| 12 | Caps and seed syntax | 64/65 appends, dup inconclusive, u64 | `64 admitted, 65th chain-budget`; second inconclusive refused; u64 max ok, overflow/leading-zero malformed | caps | PASS |
| 13 | Pair manifests matched on raw counts | own manifests per spec, all regimes | R/C/P/X raw counts `3=3`, `11=11` (`matched:true`); arena B1 mean/p5 `0.5` in R,D,C,P,X | tie by construction | PASS |
| 14 | Arena PW cells | independently rebuilt manifests scored with shipped `GRADERS` | `fixtureVsArena` **zero mismatches** (5 regimes × 9 graders) | shipped `pw` means | PASS |
| 15 | B5 genuine adversary | graders.ts:34-42 + X fixture | X scores: B5 correct 2 / defective 3 → PW 0; B7 2 / 1 → PW 1 | strongest cheap count fooled | PASS |
| 16 | F1 diagnosis (B6 dominated) | arena criteria + cells | criteria F1 `measured:true, status:fail`; R.B6 0.5 = B1 0.5; X.B6 0.5 ≤ B7 1.0 − 0.10 | trigger as predicted | PASS (see N4) |
| 17 | P1–P5 margins | arena criteria + pinned cells | P1 0.5; P2 1.0 (AUC gap 1.0); P3 0/0; P4 1.0 (gap 1.0); P5 0.0 | all pass | PASS |
| 18 | Churn 0, demotion 1.0 | `runArena()` result | `churn {seedDeltaMean:0,pairFlipRate:0}`; `demotion {precision:1,recall:1}` | 0 / 1.0 | PASS |
| 19 | Graders never read defectClass except oracle | `rg defectClass src/lib/warrant/` | only graders.ts:134,142,148 (inside `oracleScore`) | only oracle | PASS |
| 20 | Audit catches hand tampering | hand-built stores | forged ancestor grade → `grade-mismatch`; broken prev → `broken-prev@0`; bad sig → `bad-signature@0`; seed `01` → `malformed-attempt@0`; cycle → `cycle`; unknown cite → `unknown-cite`; stale anchor → `head-mismatch` | all detected | PASS |
| 21 | Anchored audit vs value-record tampering | sever cite + republish + fresh anchor | `audit.ok=true; published c1 dead -> live 0; original refutation hidden`; `value.frozen=false cites.frozen=false in-place-mutation=true` | should be detected | **FAIL** (B1) |
| 22 | Hash layout and pinned vectors | independent FNV-1a/canonical reimplementation | vectors `1ca0c9bd42a34426`, `526ccd1e91eddd1b`; manual `valueIdOf` preimage and `contextGenesis` equal engine | part1a §2(a) | PASS |
| 23 | Shipped tests | `bun test tests/warrant*.test.ts` | `103 pass 0 fail` | green | PASS |
| 24 | Type/lint/purity | `bunx tsc --noEmit`; `npx eslint src/lib/warrant src/components/warrant scripts/*warrant*.ts`; `rg` tokens | tsc exit 0; eslint clean; no forbidden tokens; `oracleScore` absent from index | clean | PASS |
| 25 | B7 is "Jaccard ≥ 0.5" | probe A={a,b}, B={a,c} | `overlapRatio=0.5 Jaccard=0.3333 shipped-classes=1` (join) | probe expects separate | **FAIL** vs part1b:18/79/233/294 (doc; N1) |
| 26 | AP@12 tie-break as documented | X.B6 all scores tie at 3, AP still varies | `ap12X.B6 mean=0.5175 p5=0.25`; documented class/family tie-break would be constant 1.0/0.0 | documented | **FAIL** (doc; N2) |

## Blockers (must fix before ship)

**B1 — Cites are frozen only in the type system; `audit` cannot detect a value record rewrite even with
an anchor.** `assertValue`/`deriveValue` store plain objects (`ledger.ts:125-128`, `144-153`); the only
`deepFreeze` is on submitted attempts (`ledger.ts:71-85`, `163-174`); the probe shows
`value.frozen=false cites.frozen=false in-place-mutation=true`. `audit` recomputes from stored cites and
compares the anchor only against `valueId.length.head.published` (`audit.ts:237-305`, `326-339`); it never
re-derives `valueIdOf(value)` and the anchor does not commit to the value record. Probe: refute a
foundation `c0`, sever `c1.cites`, republish grades plus a fresh anchor → `audit.ok=true`, c1 flips
`dead -> live 0`, and the refutation is hidden. This falsifies attack-correctness 3.4's repair ("cites
frozen at creation") and the paper's "frozen cites"/"anchored tamper-evidence" wording
(`refutation-ledgers.ts:335,341,361`), though not any arena number. Minimal fixes: `deepFreeze` stored
values (and `cites`) at creation and/or have `audit` check `valueIdOf(...) === value.id` for every value
in the closure; note the residual that even with anchors, ancestor chains remain unanchored
(attack 1.3ii).

**B2 — The shipped relation's name/semantics disagree with the binding blueprint.** The engine joins
when `overlapRatio(familyA, familyB) >= 1/2` with `overlapRatio = |A∩B| / max(|A|,|B|)`
(`grade.ts:90`, `registry.ts:171-191`); blueprint part1b calls the shipped relation "Jaccard ≥ 0.5"
(`wave-44-blueprint.md:18,79,233,294`). Probe: A={a,b}, B={a,c} → Jaccard 1/3 but shipped class count
1. The paper already says "declared coverage overlap of at least one half"
(`refutation-ledgers.ts:375,468`), and part1a defines `overlapRatio` correctly, so this is a blueprint
wording bug — but as written the "Jaccard" claim is false, and the overlap coefficient is strictly more
permissive (and can chain-merge transitively).

## Nits (should fix later)

- **N1** (same evidence as B2): fix the three "Jaccard" occurrences or change the code; decide explicitly
  whether `1/2` is intended on the overlap coefficient.
- **N2** AP@12 tie-break is index order in the engine (`metrics.ts:98-105`), while the paper says
  "fewest distinct families as the tie-break" (`refutation-ledgers.ts:152,227`) and part1b says "fewest
  distinct dependency classes, then claim id" (`wave-44-blueprint.md:301`). In X every B6 score ties at
  3 (fixture), yet `ap12X.B6 mean=0.5175 p5=0.25`; either documented rule yields a constant (1.0 or
  0.0), so the shipped table cells for constant-score arms (B0–B4, B6) are index artifacts. Gate cells
  (B5, B7) are unaffected because their scores separate the sides.
- **N3** The gate's `EXPECTED` pins 16 mean cells and no `p5` value (`verify-warrant.ts:38-65`,
  `109-117`); the p5-based pass/fail statuses are recomputed (criterion 2), but the numeric p5 cells are
  unpinned. The blueprint claims "every `{mean,p5}` for B0–B8 × R,D,C,P,X in `pw`/`auc`/`ap12`"
  (`wave-44-blueprint.md:380-381`); the gate line also lacks the `seeds`/`criteria` fields the blueprint
  shows (`wave-44-blueprint.md:402` vs `verify-warrant.ts:234-236`). Drift in unpinned mean cells would
  not fail CI.
- **N4** Criterion wording drift between blueprint parts: part1b §6 defines F1 on `B6−B7` in X (which
  the engine implements, `arena.ts:468-469`) and P5 on AUC (`arena.ts:465-467`), while the part1c table
  says F1 on `B6−B5` and P5 on PW (`wave-44-blueprint.md:393-394`). Under the part1c F1 reading
  (0.5 > 0.05) F1 would not fire; the shipped interpretation does (−0.5). Also F4 is implemented as a
  copy of P2's margin, not the "family-collapsed ΔPW" of part1c:397.
- **N5** Regime D is generated identically to R (`arena.ts:265`); my probe confirms "identical on every
  cell" across all three tables. Part1b §2 describes D as the genuine-diversity regime; it contributes
  no independent evidence (the paper already states R/D/C/P coincide).
- **N6** Seed derivation uses `advance(BASE, seedIndex + 1)` (`arena.ts:328`), while the blueprint says
  "run i uses the state after i steps" (`wave-44-blueprint.md:219`). Determinism and pins hold; the
  documented step count is off by one.
- **N7** `lambda` on a cyclic hand-tampered store overflows (`lambda-cyclic: RangeError Maximum call
  stack size exceeded`) while `audit` reports `cycle`; `assertAcyclic` (`graph.ts:67`) is not called by
  `lambda`/`deriveValue`. Public-API stores cannot be cyclic; robustness only.
- **N8** On a hand-tampered store with a malformed survived append, `lambda` counts it while `audit`
  excludes it from the recompute: `c0 lambda=1 auditRecomputed=0`, and a `published==lambda` map is
  flagged `grade-mismatch`. Clarify that `audit` recomputes over structurally valid appends only
  (`audit.ts:258-271`) and that `lambda` is not the validated view (`grade.ts:141-149`).
- **N9** Interface drift: `AdmissionCode` gains `unknown-cite` (`types.ts:126`, used by `graph.ts:7`)
  and the barrel exports `CriterionStatus` while part1a's frozen block says `KillStatus`; harmless but
  the frozen-signature claim is not literal.

## What I could NOT verify

- **Per-seed p5 distributions.** `runArena` does not export per-seed vectors; I verified the manifest
  construction is constant per side (all reported means matched exactly, fixture zero mismatches) and
  read the criteria `p5` measurements from the engine result, but the p5 order statistics themselves
  were not independently recomputed.
- **The evidence artifact** (`warrant-evidence.json`) is written to a temp dir and not committed; only
  the gate's recomputation from source was checked, not a stored artifact.
- **UI copy/safety scans** were not independently re-run beyond the purity grep; the shipped safety test
  passes (103 tests) but its assertions were not re-derived.
- **CI wiring** (blueprint part1c §4.2) — no git commands allowed.
- **Collision behavior** of the 64-bit FNV pattern (declared non-cryptographic) was not stress-tested.

## Commands and key outputs

```
bun run scripts/verify-warrant.ts
  -> WARRANT_GATE {"passed":8,"failed":0,"runtimeMs":12409,"digest":"ca0cda0f562b8c10"}
bun run .../w44-verify/contract.ts      -> SUMMARY 27/27 passed
  cite-severing: audit.ok=true; published c1 dead -> live 0; original refutation hidden
  freeze: value.frozen=false cites.frozen=false in-place-mutation=true
  demotion: 300 DAGs precision=1 recall=1 exact=300/300 cone=300/300; 2-refute: exact=100/100
  admission: all precedence checks passed; refuted-after-inconclusive admitted
  B7: overlapRatio=0.5 Jaccard=0.3333 shipped-classes=1
bun run .../w44-verify/arena.ts         -> fixtureVsArena mismatches: [] ; DvsR: identical on every cell
  full: digest ca0cda0f562b8c10, churn 0/0, demotion 1/1, criteria F1 measured=true status=fail, P1 0.5
  b1Ties: R,D,C,P,X mean=p5=0.5 ; xIndep AUC B5=0/B7=1/B8=1 ; ap12X.B6 mean=0.5175 p5=0.25
bun run .../w44-verify/hash.ts          -> vectors + valueIdOf layout equal engine/pins
bun test tests/warrant*.test.ts         -> 103 pass, 0 fail
bunx tsc --noEmit                       -> exit 0
npx eslint src/lib/warrant src/components/warrant scripts/verify-warrant.ts scripts/warrant-evidence.ts -> no output
rg defectClass src/lib/warrant/         -> graders.ts:134,142,148 only (oracleScore)
rg 'Date|Math\.random|...' src/lib/warrant/ -> no forbidden tokens
```
