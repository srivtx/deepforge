# Wave 48 — Independent verification: REPROGPU engine

Date 2026-09-19. Role: independent cross-verifier (did not trust shipped tests; did not modify repo code —
only this report was written). All scratch work under
`/var/folders/lc/r25hfwjs4j963w2f40s9rc5h0000gn/T/opencode/w48-verify/`. No git.

Inputs read: `docs/research/wave-48-attack-reprogpu.md` (121 lines),
`docs/research/wave-48-priorart-reprogpu.md` (241 lines), all of `src/lib/reprogpu/*.ts`,
`scripts/reprogpu-evidence.ts`, `scripts/verify-reprogpu.ts`, `tests/reprogpu*.test.ts`,
`src/app/reprogpu/page.tsx`, `src/components/reprogpu/ReproGpuLab.tsx`.

## Verdict: **FAIL** (reference/gate layer is sound; the shipped WGSL kernel layer is not)

The CPU reference engine, KATs, pins, hashes and the permanent gate are all correct and reproduce exactly.
But **three of the four integer WGSL kernels (K1, K3, K4) are semantically wrong** and cannot emit the pinned
outputs; K2 is correct. The gate passes anyway because, as its own honesty rule states, it never executes WGSL.
This is exactly the gap the attack doc §5 [F6]/§4 warns about, and it is real here.

## 1. Check table

| Check | Method | Observed | Expected | Status |
|---|---|---|---|---|
| K1 `k1Words()` length | independent scan | 4104 | 4104 | PASS |
| K1 no non-finite word | independent exponent scan, all 4104 | 0 hits of `(w>>23)&0xff==0xff` | none | PASS |
| K1 `exactSum320` limbs | from-scratch BigInt decode/reduce | equal to reference limbs | equal | PASS |
| K1 accumulator bound | exact BigInt magnitude | bitlen 280 (`<2^301<2^319<2^320`), non-negative | no 320-bit wrap | PASS |
| K1 flag vector | independent + shipped | `flags==1`, count 4106 | flag set | PASS |
| K2 Philox KATs ×3 | independent BigInt `mulhilo` + shipped | all 12 words match Random123 | match | PASS |
| K2 stream hash | independent philox, 65536 blocks | `f9004cf3…f86d01` | pinned K2 | PASS |
| K3 `q16Gemm` 24×24 | from-scratch naive BigInt GEMM | 0/576 mismatches | 0 | PASS |
| K3 floor / mod-2^32 | `(-1*1)>>16=-1`; wrap cases | ref==naive | match | PASS |
| K4 msg digest | `sha256.ts` vs `node:crypto` 1 MiB | `79bfb41c…acc1361` both | match | PASS |
| SHA-256 padding 0,1,55,56,63,64,65 | `sha256.ts` vs `node:crypto` | all equal | equal | PASS |
| Recompute all `expected-hashes.json` hashes | independent recompute | K1/K1flag/K2/K3/K4 all equal pins | equal | PASS |
| `expected.ts` vs `expected-hashes.json` | field compare | identical | identical | PASS |
| WGSL source hashes K1–K5 | recompute via `wgslSha256` | equal `EXPECTED_WGSL`/json | equal | PASS |
| Gate reproduces | `bun run verify:reprogpu` | `REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":802}` | 5/0 | PASS |
| Shipped tests | `bun test tests/reprogpu*.test.ts` | 44 pass / 0 fail | pass | PASS |
| **K1 WGSL reduction** | faithful u32 simulation | count **33**, limbs wrong | count 4104, pin `c046384e…` | **FAIL** |
| **K3 WGSL product** | faithful u32 simulation | **65533/65536** differ; `[-1]*[1]→65535` | pin `fbe13a3b…`, ref `-1` | **FAIL** |
| **K4 WGSL message read** | faithful u32 simulation | index `4*(16*blk)+j` | should be `16*blk+j` | **FAIL** |
| **K4 WGSL padding schedule** | faithful u32 simulation | W[16..63] never expanded for pad block | expand schedule | **FAIL** |
| K2 WGSL | faithful u32 simulation | hash `f9004cf3…` | pinned K2 | PASS |

Fix confirmations: replacing only `& 31u` in K1's stride reproduces the ref limbs and count 4104; using the
signed product in K3 gives 0/65536 mismatches and hash `fbe13a3b…`; applying both K4 fixes reproduces
`node:crypto` exactly (`79bfb41c…`). K extracted by regex from the source in the K4 fix run.

## 2. Blockers (semantic WGSL bugs — the gate cannot catch any of these)

**B1 — K1 tree reduction runs exactly one level (`src/lib/reprogpu/kernels.ts:97`).**
```wgsl
for (var stride = 128u; stride > 0u; stride = (stride >> 1u) & 31u) {
```
`(128u >> 1u) & 31u` = `64u & 31u` = **0**, so the loop body executes only for `stride = 128` and then
exits. Only `sh[10·tid+k]` for tid 0 and tid 128 are combined; the counts add to
`counts[0]+counts[128] = 17+16 = 33`. Simulated output: `count=33`, limbs
`[2098936416,795926744,406648755,1313,1975517184,561178538,1955675930,558931981,1927903,0]` vs reference
`[1253397778,1908721495,948931111,2706551042,2355586268,3172560646,585413912,1974413524,8615481,0]`.
Fixing the increment to `stride >> 1u` reproduces the reference exactly. The spec (§2 K1) demands
"log2(wg) steps" = 8; the kernel does 1. Carry propagation and pairing are otherwise correct.

**B2 — K3 multiplies operands as unsigned, then sign-extends bit 63 (`kernels.ts:220-232`).**
Inputs are `i32` Q16.16; the reference (`gemm.ts:53`) accumulates `BigInt(a)*BigInt(b)` (signed). The kernel
does `bitcast<u32>(a)`/`bitcast<u32>(b)` and the 16-bit-half **unsigned** product, then sets
`a2add = (hi & 0x80000000) ? 0xffffffff : 0`. Unsigned `ua·ub` differs from signed `a·b` by multiples of
`2^32` whenever a sign bit is set, and the error survives the final `(A0>>16)|(A1<<16)`. Simulated:
**65533/65536** entries differ; the shipped test's own case `a=[[-1]], b=[[1]]` gives kernel `65535` vs
reference `-1` (test `tests/reprogpu.test.ts:241-251` asserts `-1`, but only on `q16Gemm`, never on WGSL).
Correct signed product → 0 mismatches and the pinned K3 hash. Note: spec §2 K3 actually *writes*
`p = u32(a)*u32(b) mod 2^64`, so the spec wording is also self-inconsistent with its own `|product|<2^62`
bound and its BigInt reference; either way the kernel cannot match the pinned hash.

**B3 — K4 reads the wrong input words (`kernels.ts:340`).**
```wgsl
W[j] = bswap32(input[4u * (16u * blk) + j]);
```
`4u*(16u*blk)+j = 64·blk+j`, but a 64-byte block is **16** u32 words, so block `blk` must start at `16·blk`
(block 1 uses words 16–31, not 64–79). The kernel therefore reads only ¼ of the message (words 0–15, 64–79,
128–143, …). Fixing to `16u*blk+j` alone still mismatches.

**B4 — K4 never expands the message schedule for the padding block (`kernels.ts:350-356`).**
The final block zeroes all of `W`, sets `W[0]=0x80000000`, `W[14]=0`, `W[15]=0x00800000`, then calls
`sha256Rounds()` **without** running the `W[16..63]` expansion (`sha256Rounds` only does the 64 rounds). The
padding words W[14]/W[15] and the big-endian length are correct; the schedule is not. Applying B3+B4
together reproduces `node:crypto` exactly (`79bfb41c6346bc10d842265e62eb4e35ce77ac3bc2d3c21ebe068d808acc1361`).

**Why the gate stays green:** `verify-reprogpu.ts` only recomputes the TS references, KATs, source hashes and a
token scan (lines 95-163); it never compiles or runs WGSL. The TS tests (`tests/reprogpu*.test.ts`) exercise
only the references and string/purity checks, so they cannot observe B1–B4 — as the task anticipated.

## 3. Nits

- The K1 purity check *requires* the buggy token: `verify-reprogpu.ts:82-84` fails K1 unless the source
  contains `& 31u`. The very mask that kills the reduction loop is treated as evidence of correctness.
- The harness would in fact mark K1 `fail` (count 33 ≠ 4104) and K3/K4 `fail` (hash mismatch) on a real
  adapter, so the browser lab contradicts the pinned references rather than demonstrating them.
- Fixing the WGSL changes all four WRONG source hashes in `EXPECTED_WGSL`; the gate must be re-pinned.
- `EXPECTED_HASHES.counts.K1=4104` is unused-vs-artifact-consistent, but the K1 kernel can never produce it.
- Attack doc line 39's bound is safe but loose: magnitude is 280 bits, not 301/319; no correctness impact.

## 4. Gate honesty (item 4) — confirmed

- `scripts/verify-reprogpu.ts` makes no GPU/cross-adapter claim; its header (lines 15-18) states it
  "explicitly CANNOT check WGSL compilation, GPU execution, or cross-adapter equality". No adapter/harness
  import or call exists in the file (`rg` over the file shows only the honesty comment).
- `harness.ts` is browser-only: `getGpu()`/`webGpuSupported()` guard `typeof navigator === "undefined"`
  (`harness.ts:172-181`); it uses `navigator`, `crypto.subtle` and `new Date()` in records.
- `src/app/reprogpu/page.tsx` does **not** import the harness (only `PageShell` and the `"use client"`
  `ReproGpuLab`; `page.tsx:3-4`). `ReproGpuLab.tsx` has only a type-only import (`line 5`, erased) and loads
  the harness via `await import("@/lib/reprogpu/harness")` inside click handlers (`lines 68, 87, 97`). No
  server top-level import. The shipped safety test asserts the same and passes.

## 5. Reproduced gate output (item 5)

```
$ bun run verify:reprogpu
 1  references reproduce pins  PASS  K1/K1-flag/K2/K3/K4 all match
 2  known-answer tests         PASS  3 Philox KATs + FIPS SHA-256 + K4 oracle match
 3  WGSL source pins           PASS  all five sources match the pins
 4  integer kernel purity      PASS  no float/atomics/discard; shifts masked; canaries present
 5  summary                    PASS  all criteria passed
REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":802}
EXIT=0
```

## 6. Could not verify

- Actual WGSL compilation, GPU execution, adapter/driver behaviour, and cross-adapter equality (no GPU in
  this verification; the gate cannot either). B1–B4 are source-semantics findings and are GPU-independent.
- Whether any driver "fixes" B1–B4 — it cannot; they are in the module source, not the compiler.
- Browser manifest/`manifestSha256` round-trip and `exceptions.json` (absent), which require a WebGPU run.

---

## Re-verification after fixes (2026-09-19, second pass)

Scope: re-simulate ONLY the edited WGSL kernels. Builder edits read at `src/lib/reprogpu/kernels.ts`
K1 `:97-98`, K3 `:235-251`, K4 `:339-362`; new source pins in `src/lib/reprogpu/expected.ts:30-34` and
`docs/research/reprogpu/expected-hashes.json` (output hashes/counts unchanged, `expected.ts:10-18`).
Scratch: `…/w48-verify/re-sim.ts` (independent faithful u32 simulation).

**New verdict: FAIL — K1 and K4 are fixed; K3 is still broken and its fix is inert.**
One-token correction remains in K3 (`:240`), after which the engine is PASS.

| Kernel | Re-simulated | Observed | Expected | Status |
|---|---|---|---|---|
| K1 tree reduce | strides 128,64,…,1; carry; output | count **4104**, limbs == `exactSum320`, hash `c046384e…` | count 4104, pinned limbs/hash | **PASS** |
| K1 flag vector | Inf+NaN flags | `flags=2` (summed, not OR'd) | sticky `flags=1` | NIT (GPU never runs it) |
| K3 `[-1]*[1]` 2×2 | kernel as written | `65535` | `-1` | **FAIL** |
| K3 24×24 seeded | kernel as written | *(row void — scratch sim hard-coded a 256 stride; see final re-check)* | 0 | **FAIL** (by 2×2 + 256²) |
| K3 256×256 seeded | kernel as written | **65533/65536** mismatch; hash `a6e1e1e6…` | 0; pin `fbe13a3b…` | **FAIL** |
| K3 with `A1 + signedHi` | same sim, one token changed | **0/65536**, hash == pin | 0 | (proves the fix) |
| K4 1 MiB | new index + pad expansion | digest `79bfb41c…acc1361` == `node:crypto`; out hash `eea119f4…` == pin | match | **PASS** |
| Purity scan | `verify:reprogpu` criterion 4 | PASS (only K5 has `f32`; K1 still has `& 31u`) | PASS | **PASS** |
| Gate | `bun run verify:reprogpu` | `REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":808}` | green | **PASS** |
| Shipped tests | `bun test tests/reprogpu*.test.ts` | 44 pass / 0 fail | pass | **PASS** |
| WGSL pins | recompute K1–K5 | all `== EXPECTED_WGSL == expected-hashes.json` | equal | **PASS** |

**K1 — fixed.** `for (var s = 0u; s < 8u; s = s + 1u) { let stride = 1u << ((7u - s) & 31u); … }`
(`kernels.ts:97-98`) yields the full 8-level reduction (128,64,32,16,8,4,2,1); the shift count `7-s` is a
runtime value masked with `& 31u`, consistent with the purity rule. Simulation gives `count=4104`, limbs equal
to `exactSum320(k1Words())`, and the K1 output hash equals the pin `c046384ed6580b8111b8ef34f5d0932289209f4920666477bc76ffe724dfa27a`.

**K3 — still broken; the fix has no effect on the output.** The builder computes
`signedHi = hi - select(0u, ub, a < 0i) - select(0u, ua, b < 0i)` (`:235`) and derives the sign-extension
`a2add` from it (`:236`), but the middle limb still accumulates the **unsigned** high word:
`:240 let t1 = A1 + hi;`. The correct middle limb is `A1 + signedHi`. Worse, the output expression
`:254 output[idx] = (A0 >> 16u) | (A1 << 16u);` never reads `A2`, so changing `a2add` cannot change any
output: the emitted bytes are bit-identical to the pre-fix kernel (sim hash unchanged `a6e1e1e6…`).
Counterexample `[-1]*[1]`: `65535` vs reference `-1`; 256×256 `65533/65536`. (The 24×24 figure quoted
earlier was a scratch-sim indexing artifact; the counterexample and the 256² hash are the valid evidence.)
Substituting `signedHi` in the middle limb gives 0/65536 mismatches and the pinned hash `fbe13a3b…`.

**K4 — fixed.** Input index is now `input[16u * blk + j]` (`:341`), and the padding block expands `W[16..63]`
(`:357-361`) before `sha256Rounds()`. Simulated digest equals `node:crypto` for the 1 MiB message
(`79bfb41c6346bc10d842265e62eb4e35ce77ac3bc2d3c21ebe068d808acc1361`), and the derived output-buffer hash
equals the pin `eea119f4059566875ceaf784400d519fd8ff2148d9f221e0004fd04944a21797`. (Note: my first
re-simulation printed `1cb4bf79…`; that was a byte-order error in my scratch serializer, not a repo bug —
corrected in `re-sim.ts` where the digest is emitted as big-endian H, matching the kernel's `bswap32` output.)

**N1 (nit) — K1 non-finite flag is summed, not OR'd.** The tree reduction does
`wflags[tid] = wflags[tid] + wflags[tid + stride]` (`:111`). With the flag vector (Inf and NaN in two
different threads) the summed value is `flags=2`, whereas the TS reference is a sticky bit (`flags=1`) and
`EXPECTED_K1_FLAG_HASH` was computed with 1. Bit0 is still set and the GPU harness runs only `k1Words()`
(flags=0), so no pinned output is affected; flagging as a semantic deviation only.

**Gate honesty is unchanged and still correct.** `scripts/verify-reprogpu.ts` remains reference-only; the
purity scan (criterion 4) passes and does not catch any of the above, because it never executes WGSL. The
WGSL source hashes for K1/K3/K4 were repinned (`expected.ts:30-34`), and the gate is green.

**Could not verify (unchanged):** actual WGSL compilation, GPU execution, cross-adapter equality, and the
browser manifest/`exceptions.json` path. The K3 finding is a source-level semantics bug and is GPU-independent.

---

## K3 re-check (final, after `A1 + signedHi` and flag-OR edits)

Builder changed `kernels.ts:240` to `let t1 = A1 + signedHi;` and `:111` to
`wflags[tid] = wflags[tid] | wflags[tid + stride];`; pins repinned K1 `ea7c4667…`, K3 `1013c964…`
(`src/lib/reprogpu/expected.ts:30-32`). Re-simulated with a generalized n×n kernel (`…/w48-verify/k3-generic.ts`,
`k3-recheck.ts`):

- K3 counterexample `[-1]*[1]`: sim `-1` == BigInt reference `-1`.
- K3 generalized 24×24 seeded: **0/576** mismatches vs `q16Gemm`.
- K3 256×256 seeded: output hash `fbe13a3b4e2fc7bf3a4b38c838912651151c03460bd9d1d7f1ea81190af3932e` == pin.
- K1 flag vector: `flags=1` (sticky; N1 fixed), `count=4106`, hash == `EXPECTED_K1_FLAG_HASH`.
- K1 exact vector: `count=4104`, hash == pin.
- Purity scan PASS; `bun run verify:reprogpu` → `REPROGPU_GATE {"passed":5,"failed":0,"runtimeMs":793}`;
  `bun test tests/reprogpu*.test.ts` → 44 pass / 0 fail.

**Final verdict: PASS.** All three reported WGSL bugs (K1 reduction stride, K3 signed high word, K4 input
indexing + padding schedule) are fixed and now reproduce the pinned references; the N1 flag nit is also fixed.
Caveat unchanged: the gate still cannot execute WGSL, so this is a source-faithful CPU simulation, not a GPU run.
