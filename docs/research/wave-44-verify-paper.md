# Wave 44 — Independent verification of the `refutation-ledgers` paper

Verifier: independent cross-verifier (no authorship of the paper or engine). Date: 2026-09-19.
Scope checked against: `docs/research/wave-44-blueprint.md` part 2 §7, `docs/research/wave-44-attack-significance.md` §5,
`docs/research/wave-44-priorart-refutation.md` §6, and the paper `src/data/inventions/refutation-ledgers.ts`.
No repo file was modified except this report; no git commands were run.

## Verdict: PASS WITH FIXES

- Number audit: **0 mismatches** across 167 independently compared values (table cells, figure bars,
  abstract measured phrases, digest, gates). Positive control: 7 injected artifact mutations were all detected.
- Claim/banned-token/structure/honesty/reference audits: **pass** (details below).
- Three low-severity fixes are recommended, all wording/spec-quota; none is a false number.

## Evidence runs

- `bun run scripts/warrant-evidence.ts` → arena digest `ca0cda0f562b8c10` (top-level payload digest
  `3b8566ca5553f9e9`), 200 seeds, 9 criteria; JSON printed at
  `/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/deepforge-warrant-evidence/run-lQgyHD/warrant-evidence.json`.
- `bun run scripts/verify-warrant.ts` → exit 0, `WARRANT_GATE {"passed":8,"failed":0,"runtimeMs":12944,"digest":"ca0cda0f562b8c10"}`,
  matching the paper's "8 passed, 0 failed, pinned digest" and "two full arena runs inside 60 seconds" claims.
- Comparator: my own bun script imported the paper module and diffed every table cell and figure bar against
  the JSON artifact. It replicated the paper's `cellText` rounding rule (3 dp if exact, else 4 dp) and
  string-compared cells; figure bars were compared as raw numbers. Coverage: T3 45 cells, T4 45, T5 13,
  T6 27 (measured/threshold/status), F1 10 bars + gate, F2 3 bars + gate + caption headroom, F3 9 bars + gate,
  abstract 9 measured phrases, digest 1 = 167 comparisons.

## Mismatch table (paper path / paper value / artifact value)

| Paper path | Paper value | Artifact value |
|---|---|---|
| *(all table cells and figure bars)* | — | — |
| `sections.experiments` — "Reading the tables" paragraph (prose, not a cell) | “X is the discriminating regime, and only the declared dependence relation stays at 1.000 there” | `arena.pw.X.B7.mean = 1.000` **and** `arena.pw.X.B8.mean = 1.000` (the analysis-only B8 also stays at 1.000) |

All other 167 checked values match exactly, including rounding:
T3/T4 all B0–B8 × R/D/C/P/X mean/p5; T5 AP@12.X mean/p5 per grader and churn/demotion cells;
T6 P1–P5/F1–F4 measured/threshold/status; F1/F2/F3 bars and gates; abstract PW/AUC/AP@12/churn/demotion values;
pinned digest `ca0cda0f562b8c10` (artifact `arena.digest`).

## Claim audit

- The defensible claim is carried with the E3-substituted wording in the claim-ceiling callout
  (`refutation-ledgers.ts:310`): “a value-level ledger→grade→demotion contract that no located work implements;
  the individual mechanisms (TMS retraction, evidence fusion, audited ledgers, attack-family scoring) are all known.”
  The abstract (`:274`) and related-work (`:324`) carry the same claim ("the contribution is the value-level
  ledger-to-grade-to-demotion contract ... never a truth verdict"; "nothing in that table supports a claim that
  ledgers, retraction, or attack-family scoring are new here"). One word-level deviation from prior-art §6 /
  blueprint §7.4: the callout says "evidence fusion" where the source phrase is "evidence fusion independence";
  substance is unchanged ("all known"), noted for completeness.
- `"independence number"` and `"max independent set"`: **0 occurrences** anywhere in the paper. The T1
  "Not implemented" columns use "declared dependence-class count" / "declared dependence-class grade".
- Overclaim scan (all occurrences inspected in context; none is a live overclaim):
  - `:310` “never truth, never authenticity of a well-formed fabrication, and never a statement about any person” — disclaimer; `:387` “not truth, not authenticity ... not a statement about evidence quality” — disclaimer; `:477` “No truth guarantee” — disclaimer; `:511` “Never imply that audit is truth; ... not authenticity” — red line.
  - `:383` “over-demotion and under-demotion are impossible by construction once every cite names an earlier value” — strongest positive sentence found; scoped to the structural precondition and identical to the sanctioned I3' contract; not a truth/soundness claim beyond the model.
  - `:343` “the cite graph is acyclic by construction and cycles are unrepresentable” — model invariant; `:408` “correct claims always survive” — generator semantics for non-defective claims.
  - “quality” appears only about prior work (`:324`) or in negations (`:387`, `:508`). “proves/proven/sound/completeness/guaranteed/certified/verified/validated/trusted/probability/star rating”: none.
  - `:503` `"Warrant: 2 of 3 independent checks (cap 3)."` — one of the three Honest-copy strings mandated verbatim by blueprint §7.1 (significance §5). Note the source-level tension: part 1c §5's UI safety-test deny-list includes the token "independent checks"; the paper is not a UI file and the string is spec-mandated here.
- Not-claimed list exists: the claim-ceiling "Nothing stronger is claimed" sentence (`:310`), the 6-item
  "Never ..." product list (`:508`–`:514`), which covers all 7 bullets of significance §5, and the limits list.
  All five required residues are present: fabricated-but-consistent ledgers (`:469`), admission trust root
  (`:469`), semantic non-independence (`:468`), absence≠survival (`:470`), instance-vs-claim (`:473`).
  Two attack-correctness §5 items not in the paper's limits list (equivocation/transparency log; confidentiality)
  are outside the required five; the transparency log appears in future work (`:562`).

## Safety scan (word-boundary)

| Token | Count |
|---|---|
| verified / validated / hallucination-free / certified / trusted / probability / "star rating" | 0 each |
| safe | 0 standalone (1 substring hit is "safety tests" in a code block, `:531`) |
| "max independent" / "independence number" | 0 each |
| `%` character | 0 (external problem statistics use the word "percent", `:291`) |

## Structure

- 10 sections in the required order: introduction, related-work, model, grade, arena, experiments, limits,
  product, reproducibility, future (`sections: 10`, ids exact).
- References: 27 entries, unique ids, all `https://` (≥ 20 required).
- T1–T6 present, one each, in related-work/arena/experiments; T1 static with no arena numbers;
  T2 generator constants; T3/T4/T5/T6 match their blueprint §7.2 data sources as produced.
- F1–F3 use the renderer block shape `{ kind: "figure", figure: InventionFigure }` with id/title/caption/
  unit/max/series; gates are valid (F1 0.75, F2 0.05, F3 0.75, all within `[0, max=1]`).
- Metadata: slug/id `refutation-ledgers`, title exact, date `2026-09-18`, authors `["DeepForge Research"]`,
  abstract 1360 chars, 7 keywords, registered as `INVENTIONS[0]`.

## Honesty audit

- Experiments callout: “Measured: P1-P5 pass, F1 confirms the syntactic tuple variant B6 is killed as predicted,
  and the shipped declared-dependence relation B7 passes P1-P5; F2, F3, and F4 do not fire.” — matches the artifact
  (`P1–P5 pass`, `F1 measured=true / status=fail` = the pre-declared kill of B6 confirmed, `F2–F4 pass`) and the
  gate's recomputation. T6 caption (“F1's status is 'fail' ... F2-F4 pass, which means none of their kills fired”)
  is likewise accurate. No unmeasured arena numbers appear in the callout; thresholds quoted there match
  blueprint §7.2 and the artifact's threshold strings (modulo the P1/F1 expression wording noted below).
- Limitations section carries all required residues; `dead ≠ 0`, saturation, cost-not-weighed, B8-not-implementable,
  synthetic corpus, no-truth-guarantee, and demotion-sanity-is-TMS-not-novelty are all stated.

## Reference spot-check (plain fetch, `bun fetch`)

| URL | Status |
|---|---|
| `https://github.com/mmnto-ai/totem/blob/fc3f4114/packages/core/src/capability/falsification.ts` | 200, real content, title contains the pinned commit |
| `https://github.com/msaule/falsifyr/` | 200 |
| `https://github.com/foolproof-labs/falsification-ledger` | 200 (redirects to `holdout-labs/falsification-ledger`) |

No dead URLs found among the three checked.

## What I could not verify

- T2 non-seed constants (48 claims, 8 defect classes, 16 refuters, 4 families, blind spots `{0,1},{2,3},{4,5},{6,7}`)
  are **not fields of the artifact JSON**; I confirmed them against `src/lib/warrant/arena.ts` source
  (48-claim loops; `FAMILY_SPEC` blind arrays; F2P/F3P in X) and the blueprint, not the artifact.
- F2's explicit headroom field `arena.ceiling.aucGapX` (blueprint part 1c §4.1) is absent from the produced JSON;
  the paper's "B8 minus B5 is 1.000" was derived from `auc.X.B8.mean − auc.X.B5.mean`.
- Blueprint §7.2 names the T6 source `kill[F1..F4]`; the artifact uses a unified `arena.criteria` array
  (P1–P5 + F1–F4). The paper's T6 matches `arena.criteria` exactly; the `kill` key does not exist. This is an
  artifact-vs-blueprint schema gap, not a paper mismatch.
- External study statistics in the introduction (17–33 percent; AUC 0.63 vs 0.76–0.83; 67 percent; 18 percent;
  48 percent; 17 percent) were not verified against the underlying papers; only link liveness was checked, and
  only for the three GitHub citations as instructed.
- T1's static prior-art rows were spot-checked against prior-art §2, not diffed row-by-row.
- Product/UI behavior claims (read-only, no storage, no `Date.now()`) were not executed; the gate's purity scan
  covers the engine only.

## Fix list (recommended; all non-numeric)

1. `refutation-ledgers.ts:452` — “only the declared dependence relation stays at 1.000 there” omits the
   analysis-only B8 (also 1.000 in X). Suggested: “only the shipped declared dependence relation stays at 1.000
   there (the analysis-only B8 matches it).”
2. Abstract `:274` quotes demotion precision/recall — T5 cells, but outside blueprint §7.2's abstract allowance
   (“PW, AUC, AP@12, churn, and the F-statuses”). Either trim or record as an erratum to §7.2.
3. `:525` calls `warrant-evidence.json` “digest ca0cda0f562b8c10”; the file's own top-level digest is
   `3b8566ca5553f9e9` and `ca0cda0f562b8c10` is `arena.digest`. Suggest “warrant-evidence.json whose arena digest is
   ca0cda0f562b8c10” so reproducers running the evidence script (which prints the payload digest) are not confused.
4. Optional source alignment: P1/F1 expressions and the AP@12 tie-break wording differ between blueprint
   (part 1b §5/§6, part 1c §4.2) and artifact/significance; the paper follows blueprint wording in the callout and
   artifact strings in T6, with identical measured outcomes.
