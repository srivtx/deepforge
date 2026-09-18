# Wave 48 — Independent cross-verification: REPROGPU paper

Verifier: independent cross-verifier (separate from the spec author). Date 2026-09-19.
Paper under test: `src/data/inventions/reprogpu.ts`. Frozen spec: `docs/research/wave-48-attack-reprogpu.md`.
Prior art: `docs/research/wave-48-priorart-reprogpu.md`. Baseline artifact: `docs/research/reprogpu/expected-hashes.json`.
Commands run: `bun run scripts/reprogpu-evidence.ts`, `bun run scripts/verify-reprogpu.ts`, plus a self-written
bun comparator that imports `REPROGPU` and diffs every table cell / figure bar against the artifact and gate
output (comparator not committed). No repo file was modified except this report; the evidence script rewrites
`expected-hashes.json`, and its content was confirmed byte-identical after the run.

## Verdict: PASS WITH FIXES

Number audit is clean (every table cell and figure bar matches the artifact; only explicitly non-pinned
wall-clock milliseconds differ). The frozen claim, declared boundary, six limitations and honesty rule are
present and semantically verbatim. Safety scan is clean. But three sentences assert cross-checks that do not
exist in the shipped code, and two spec artifacts/checks (committed manifest, NIST 448/896 vectors) are absent.
None of these invalidates the pinned hashes; all are fixable by wording or by adding the missing checks.

## 1. Number audit

Gate run (2026-09-19):
`REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":835}` — all five criteria PASS.
Evidence run: counts `{"K1":4104,"K2":65536,"K3":65536,"K4":16385,"K5":65536}`; all five reference hashes and
all five WGSL source hashes reproduced exactly as committed.

Every T2, T3, T5 cell and every F1 bar matched `expected-hashes.json` / the gate. Spot values:

| Item | Paper / artifact | Comparator | Result |
|---|---|---|---|
| T2/T5 K1 hash | c046384e…dfa27a | c046384e…dfa27a | match |
| T2/T5 K1 count | 4,104 | counts.K1 4104 | match |
| T2/T5 K1-flag hash | cc7dca6d…c9ecb | hashes.K1_FLAG | match |
| T2/T5 K1-flag count | 4,106 | 4104 + 2 appended non-finites | match |
| T2/T5 K2 hash | f9004cf3…6d01 | hashes.K2 | match |
| T2/T5 K2 count / bytes | 65,536 / 1,048,580 | 4 + 4·65536·4 = 1,048,580 | match |
| T2/T5 K3 hash | fbe13a3b…3932e | hashes.K3 | match |
| T2/T5 K3 count / bytes | 65,536 / 262,160 | 65,536·4 + 16 = 262,160 | match |
| T2/T5 K4 hash | eea119f4…e21797 | hashes.K4 | match |
| T2/T5 K4 count / bytes | 16,385 / 36 | 9·4 = 36 | match |
| T3 Philox KATs ×3 | 6627e8d5… / 408f276d… / d16cfe09… | decimal artifact → hex | match |
| T3 K4 oracle digest | 79bfb41c…1361 | kat.k4Digest | match |
| §9 WGSL pins K1–K5 | 4044c04a…, 010e4d4d…, 3a091945…, d26f0105…, 3f003ca3… | wgsl.* | all match |
| F1 K1/K2/K3/K4/K5 | 1.681 / 6.021 / 5.419 / 1.556 / 5.419 | log10(48/1048580/262160/36/262144) → toFixed(3) | all match |
| F1 max / unit | 7 / log10(output buffer size in bytes) | — | consistent |

Unexplained numeric mismatches: **none**. Rounding was checked (`log10` to 3 dp), not just string-equal.

Non-pinned timing cells (declared variable in the paper itself; reported for completeness, not failures):

| Paper path | Paper value | Observed now | Disposition |
|---|---|---|---|
| T4 caption gate string | `"runtimeMs":1049` | `"runtimeMs":835` | T4 caption says runtime varies and is not pinned |
| §9 evidence runtime / K3 BigInt | 1.08 s / 833 ms | 0.84 s / 670 ms | §9 says timings are machine-local, not pinned |

## 2. Claim audit

Present and semantically verbatim (markdown emphasis/backticks removed and a leading capital differ only):

- Frozen one-sentence claim (callout "The claim ceiling") == spec §6 line 113. VERBATIM OK.
- Declared-boundary paragraph == spec §1 line 29 (paper prefixes the label "Declared boundary."). VERBATIM OK.
- Honesty rule == spec §4 line 87 (paper capitalizes "The"). Cosmetic only. VERBATIM OK.
- Six limitations == spec §6 lines 116–121. Items 1, 4, 6 VERBATIM; items 2, 3, 5 differ only by stripped
  markdown emphasis/backticks (`**cannot**`, `` `adapter.info` ``, `` `fail` ``, `` `exceptions.json` ``).
  No paraphrase that weakens or strengthens them.
- Device strings: paper states plainly that adapter identity is self-reported and not cryptographically
  attested (§8 and limitation 3), e.g. "records adapter identity that the adapter self-reports, and is not
  cryptographically attested". CONFIRMED.

No overclaim of soundness, no claim that all floats are reproducible, no cross-vendor *proof*. The paper
repeatedly says the gate cannot test GPUs and that K5 agreement is not evidence of float reproducibility.
However, the following unsupported statements were found:

- **O1 — K1 "second implementation" cross-check does not exist.**
  Paper (T2 K1 formula note): "The reference is computed in BigInt as A mod 2^320 …; it is cross-checked
  against a second implementation on the pinned vectors."
  Reality: `src/lib/reprogpu/sum320.ts` is the only K1 implementation; no second/limb/double path exists in
  `src/`, `scripts/`, or `tests/`. The spec §2 required this cross-check. This is an unsupported claim.
- **O2 — the gate does not compare K4 against an independent oracle.**
  Paper (T3 caption): "…computed by an independent oracle (Node/Web Crypto); the shipped kernel re-derives it
  through its own integer implementation and **the gate compares**." T4 row 2: "…+ K4 oracle match". §6: "The
  K4 message digest is checked against an independent SHA-256 implementation…".
  Reality: `scripts/verify-reprogpu.ts` imports no `node:crypto`; criterion 2 computes `sha256Hex(message)`
  with the shipped JS SHA-256 (`src/lib/reprogpu/sha256.ts`) and compares it to a pin the same script
  generated. The genuine independent `node:crypto` comparison exists only in `tests/reprogpu.test.ts:121`
  (`expect(digest).toBe(nodeSha256Hex(k4Message()))`), not in the gate. The gate's K4 check is self-referential.
- **O3 — K3 "cross-checked against BigInt" is vacuous.**
  Paper §6: "K3 is cross-checked against BigInt on small sizes." Reality: both `q16Gemm` and the test's
  `naiveGemm` (`tests/reprogpu.test.ts:203`) are BigInt, so the comparison cannot catch a shared BigInt error.
  The spec's intent was a `number`-limb reference vs BigInt (or an independent path); that is not shipped.

No unsafe wording beyond the above; all three are overstatements of verification strength, not of the numeric pins.

## 3. Safety scan

- `%` character occurrences in the file: **0**.
- Banned tokens (case-insensitive, word-boundary): `verified`, `validated`, `hallucination-free`,
  `certified`, `safe`, `trusted`, `max independent`, `independence number`, `probability`, `star rating` —
  **all clean**. (`verifies`, `verifiable`, `verification`, `attested`/`attestation` appear but are not banned
  terms and are used to *disclaim* attestation.)

## 4. Structure

- Sections: **10** (`introduction, related-work, subset, kernels, harness, experiments, limits, product,
  reproducibility, future`). Pass.
- References array: **24** entries, **24/24 https** (spec asks ≥15). No duplicate ids. Pass.
- Block kinds match `src/data/inventions/types.ts`: five `table` blocks carry `columns`/`rows`; one `figure`
  block wraps `figure` (`InventionFigure` with `id/title/caption/unit/max/series`). Pass.
- Experiments section explicitly states the CI gap — exact sentence: "No WGSL compilation, no GPU execution,
  no dispatch, no readback, and no cross-adapter equality check ran in CI." Pass.

Spec-conformance gaps (upstream of the paper, but relevant to a "reproducible artifact" claim):

- **G1 — committed manifest missing.** Spec §3 requires `docs/research/reprogpu/expected-manifest.json`
  committed and re-derived by the gate; spec §4 item 5 requires a manifest-schema gate criterion. The only
  committed artifact is `expected-hashes.json`. The paper's embedded manifest-record comment says
  "manifestSha256 … is included in the artifact and re-derived by the gate", and §8 says a third party can
  compare against "the committed artifact" — neither exists, and the gate has no manifest criterion (its
  fifth row is "Summary", not schema). Either add the check/artifact or soften the wording.
- **G2 — NIST 448/896 FIPS vectors not shipped.** Spec §2/§4 require them ("must also pass"). The paper is
  honest ("the longer NIST 448-bit and 896-bit vectors named in the amended spec were not added to the
  shipped test list"), but the frozen spec is not satisfied.
- **G3 — gate criterion numbering differs from spec §4.** Spec's five checks are refs, KATs, source
  integrity, purity, manifest schema; the shipped gate's fifth is a summary. Manifest schema (spec item 5) is
  not implemented.

## 5. Reference spot-check (HTTP status)

| URL (as cited in the paper / prior art) | Status | Final |
|---|---|---|
| https://bebop.cs.berkeley.edu/reproblas (ReproBLAS site) | 200 | `…/reproblas/` (single trailing-slash redirect) |
| https://developer.nvidia.com/blog/controlling-floating-point-determinism-in-nvidia-cccl/ | 200 | unchanged |
| https://chromium.googlesource.com/external/github.com/gpuweb/cts/+/07f15b8e.../docs/fp_primer.md (WebGPU CTS) | 200 | unchanged |
| https://doi.org/10.1145/3389360 (ReproBLAS ref as cited) | 403 | → https://dl.acm.org/doi/10.1145/3389360 |

No dead links. The two 200 primary targets are live. The DOI redirect is a bot/Cloudflare wall at ACM, not a
dead link. The only redirect is the benign `reproblas` → `reproblas/` trailing slash. The paper itself warns
that URL drift invalidates the corresponding pin/statement.

## 6. What I could not verify

- Cross-adapter equality, GPU execution, WGSL compilation, and any real browser-lab manifest: no GPU in this
  environment and no committed manifest exists; per the paper's own honesty rule these are explicitly out of
  scope. I verified only that the harness code exists and declares the documented fields.
- The upstream provenance of the Random123 Philox KATs and FIPS SHA-256 vectors: I confirmed the paper's hex
  values match the committed artifact's decimal values and the shipped constants, but did not fetch
  `DEShawResearch/random123` `kat_vectors` or the FIPS document to re-derive them.
- The "second implementation" and independent-oracle statements (O1–O2): confirmed absent by the shipped
  sources/gate; I could not find the claimed comparisons anywhere in the repo.
- `exceptions.json` mechanism: no such file exists; only described. Not testable here.

## Bottom line

All pinned numbers that the paper actually reports are correct against `expected-hashes.json`; the frozen
claim, boundary, six limitations and honesty rule are intact; the safety scan is clean; the artifact is
structurally complete (10 sections, 24 https refs, kinds valid). Fix O1–O3 (delete or implement the claimed
cross-checks and stop attributing the independent K4 oracle to the gate) and close G1–G3 (or explicitly
downgrade the manifest/NIST language); then this is a PASS.
