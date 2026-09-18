# Wave 48 — Correctness attack + amended spec: REPROGPU

Date 2026-09-19. Role: spec / correctness attacker + designer. ONE file (this one); no repo code, no git.
Read in full: `wave-48-candidates-browser.md` §C2; `wave-48-priorart-reprogpu.md`. Normative spec:
**WGSL CRD 2026-09-15** — `https://www.w3.org/TR/2026/CRD-WGSL-20260915/` (all § numbers below are this doc).
Main body (§0–§4) is the amended spec: a builder implements from this file alone; §5 attacks it; §6 verdicts.
Fixes applied after attack are tagged **[F1]…[F8]**. `SHA-256` = `crypto.subtle.digest('SHA-256', bytes)`; all
hashes are **pinned at implementation time by the TS reference** and frozen in `expected-hashes.json` (none invented here).

## 0. Scope and non-negotiables

- Deliverable: a browser library + cross-adapter conformance harness for the **declared integer kernel subset** in §1. Float is out of scope: WGSL §15.7 leaves rounding direction (§15.7.4: "the result may be rounded up or down: WGSL does not specify a rounding mode"), reassociation/fusion (§15.7.5), subnormal flushing (§15.7.2), and overflow/NaN (`indeterminate value`) implementation-defined.
- No i64/u64: every accumulator is multi-limb `u32`, carries propagated in a fixed limb order.
- CI has no GPU. The permanent gate (§4) is pure deterministic TS (CPU, minutes): references + KATs + pinned hashes + WGSL source integrity + purity scan. Cross-adapter equality is demonstrated only by the browser lab (§3); the paper reports a real local run manifest.

## 1. WGSL exactness audit (the subset boundary)

**Guaranteed portable / exact** (relied on by K1–K4):
- i32/u32 `+ - *`, unary `-`: "Expressions on concrete integer types that overflow produce a result that is modulo 2^bitwidth" (§6.2.3); i32 is two's complement. Exact wrapping arithmetic.
- Bitwise `& | ^`, `~`: exact (§8.10, "Bitwise-and/or/xor", component-wise). Comparisons `== != < <= > >=` and `select`: exact (§8.9).
- Shifts `<< >>` (§8.10): "The number of bits to shift is the value of e2, modulo the bit width of e1"; u32 `>>` is logical, i32 `>>` is arithmetic (sign-extends). Every shift count is either a **compile-time constant in [0,31] or a runtime value masked with `& 31`** [F6]; an *unmasked* runtime count ≥ bitwidth has no specified value, and const/override counts ≥ bitwidth are creation errors.
- `bitcast` between i32/u32 (and vec): exact bit reinterpretation (§17.2.1, layout §14.4.4). **Never bitcast through f32/f16**: intermediate values of §17.2 bit-reinterpretation builtins "may be flushed to zero" when the bit pattern is a float subnormal (§15.7.2) [F6].
- Host-shared buffer bytes are little-endian: "numeric values in host-shared buffers are stored in little-endian format" (§14.4.4). Readback is byte-addressed (host-endianness only matters for a Uint32Array view; §3 hashes raw bytes) [F3].
- Integer `/ %` are defined (signed `/` truncates toward zero; divide-by-zero is a creation error for const/override and is avoided in kernels), but are **not used** by K1–K4.
- Mapping a float *value* to an integer is NOT exact: float→int clamps and truncates, and NaN yields an indeterminate value (§15.7.6). K1 therefore never converts f32 values, only decodes their bit patterns.

**Unspecified / implementation-defined (excluded):** all f32/f16 arithmetic. §15.7.4.1 gives f32 `x+y`, `x-y`, `x*y` as "Correctly rounded" (= either neighbour; direction unspecified), `x/y` as **2.5 ULP** (not correctly rounded), comparisons as "Correct result". §15.7.5: "An implementation may reassociate operations" and "may fuse operations" — so `a*b+c` may or may not contract to fma, and `fma` itself "may expand to an ordinary multiply … and an add" (§15.7.2/§17.5.32). Subnormal inputs/outputs of §15.7.4 ops may be flushed to zero; the sign of zero may be ignored; runtime overflow/Inf/NaN may become an indeterminate value (Finite Math Assumption, §15.7.2). Transcendentals, `determinant`, `smoothstep` edges, and OOB indexing are likewise excluded.

**Declared boundary (state verbatim in the paper):** *"Only integer (i32/u32) and bit operations, bitcast between i32/u32, comparisons, and host-shared buffer layout are relied upon. In K1–K4 all f32 values are transported and decoded as opaque u32 bit patterns; no floating-point arithmetic, conversion, or bitcast-through-float occurs. All floating-point results are out of scope for the reproducibility guarantee."*

## 2. Kernel specs

Common: **multi-limb integer addition is associative and, on bounded values, exact**; therefore any workgroup schedule yields identical limbs, and this is a proof, not an empirical result [F4]. No kernel uses `discard`, unmasked dynamic shift counts, float ops, or `atomic` (multi-limb carries cannot be done with per-limb `atomicAdd`) [F6]. Every output buffer begins with a **status word** (count canary) and every input buffer is pre-filled with sentinel `0xDEADBEEF`; the harness fails a kernel whose count ≠ expected or whose output equals the sentinel [F7]. Reserved canary/status semantics are below.

### K1 — exact f32 sum via an integer superaccumulator
- **Input encoding (bit-exact):** `array<u32>` of N binary32 bit patterns, N ≤ 2^24, read from a `Uint32Array` host-side. No f32 anywhere.
- **WGSL:** for each word `w`: `s=w>>31`; `e=(w>>23)&0xFF`; `m=w&0x7FFFFF`. If `e==0xFF` (Inf/NaN) set sticky `flags|=1` and skip. Else if `e==0` and `m==0` skip (±0; sign of zero may be ignored, §15.7.2). Else if `e==0`: `M=m`, `shift=0` (subnormal = `m·2^-149`). Else `M=0x800000|m`, `shift=e-1` (normal = `M·2^-149·2^(e-1)`). The term is `±M·2^shift`; place it into a **10-limb u32 two's-complement accumulator `A[0..9]` (320 bits, A[0] least significant), value = Σ A[i]·2^(32i)**. Per-limb placement (no 64-bit): let `b=shift&31`, `L=shift>>5`; if `b==0` add `M` at limb L; else add `(M<<b)&0xFFFFFFFF` at limb L and `M>>(32-b)` at L+1. If `s==1`, negate the 320-bit term (invert all 10 limbs, add 1 with carry from limb 0), then add the two 10-limb values with carry propagating limb 0→9.
- **Reduction:** each invocation accumulates its strided subset privately; a fixed shared-memory tree (fixed pairing, log2(wg) steps) reduces the workgroup; workgroups write partials to a partials buffer at their `workgroup_id`; a second dispatch reduces partials in ascending index order. Order is irrelevant (see Common), but is pinned to make outputs recomputable.
- **Overflow proof [F1]:** `|v|<2^128`, so a term `<2^277`; N ≤ 2^24 ⇒ `|A| < 2^301 < 2^319`. No wrap.
- **Output layout:** 12 u32 little-endian: `A[0..9]`, `flags` (bit0 = non-finite seen), `n_seen` (=N, counts every word consumed including skipped ones — the read-completeness canary). Bytes hashed: 48. `expectedCount = N`.
- **TS reference:** BigInt. `A = Σ (−1)^s·M·2^shift`; `Amod = ((A mod 2^320)+2^320) mod 2^320`; limbs `i = Number((Amod>>32i)&0xFFFFFFFFn)`; flags from scan. Cross-checked against a second implementation (exact double/limb or per-value `Math`-free BigInt path).
- **Pinned vectors:** two sets. (i) **Exact-sum vector:** N=4096 finite words from LCG seed `0x2545F491` plus `[max-finite, -max-finite, min-subnormal, -min-subnormal, 1.0, -1.0, +0, -0]`; the reference and the kernel must agree on limbs with `flags==0` (this is the pinned hash). (ii) **Flag vector:** same plus `0x7F800000` (Inf) and `0x7FC00000` (NaN); asserts `flags==1`; its limb value is defined (non-finites contribute 0) but the gate treats it as an out-of-domain flag test, never as an exact-sum oracle.

### K2 — Philox4x32-10 counter RNG vs Random123 KATs
- **Algorithm (Random123, `include/Random123/philox.h`, `philox4x32_R`):** constants `M0=0xD2511F53, M1=0xCD9E8D57, W0=0x9E3779B9, W1=0xBB67AE85`. 32×32→64 `mulhilo(a,b)` via 16-bit halves (`a0=a&0xffff,a1=a>>16`; `p0=a0*b0,p1=a0*b1,p2=a1*b0,p3=a1*b1`; `mid=(p0>>16)+(p1&0xffff)+(p2&0xffff)`; `lo=(p0&0xffff)|(mid<<16)`; `hi=p3+(p1>>16)+(p2>>16)+(mid>>16)`). Round: `(hi0,lo0)=mulhilo(M0,c0)`, `(hi1,lo1)=mulhilo(M1,c2)`, then `c=(hi1^c1^k0, lo1, hi0^c3^k1, lo0)`. **Exactly 10 rounds**; after each of rounds 1–9 bump `k0+=W0`, `k1+=W1` (wrapping u32); the post-round-10 bump is unused and omitted.
- **KATs (Random123 `tests/kat_vectors`, DEShawResearch/random123):** `philox4x32 10 00000000…00000000 → 6627e8d5 e169c58d bc57ac4c 9b00dbd8`; `… ffffffff(×6) → 408f276d 41c83b0e a20bc7c6 6d5451fd`; `ctr=243f6a88 85a308d3 13198a2e 03707344, key=a4093822 299f31d0 → d16cfe09 94fdcceb 5001e420 24126ea1`. Words are compared in that order.
- **Stream:** 65536 blocks; block `i` uses `ctr=(i,0,0,0)`, fixed `key=(0x12345678,0x9ABCDEF0)`; output word order `(c0,c1,c2,c3)`. **Output layout:** u32 `[n_blocks=65536, then 65536×4 RNG words]` little-endian = 1 MiB + 4 bytes. `expectedCount = 65536`.
- **TS reference:** the same algorithm in `u32` (`Math.imul`/`>>>0`), word-compared to the three KATs, then streamed and hashed. Pin frozen at implementation time.

### K3 — fixed-point Q16.16 GEMM 256×256×256
- **Encoding:** A,B,C `i32`, row-major 256×256, Q16.16 (`value = raw/2^16`); every i32 is in-domain, so no input rejection. Row-major index `r*256+c`.
- **WGSL:** `S=0` as a **3-limb (96-bit) u32 two's-complement accumulator**; for `k=0..255` add the exact 64-bit product `p = u32(a)*u32(b) mod 2^64` computed with the 16-bit-half decomposition (`t0=p0&0xffff`; `t1=(p0>>16)+(p1&0xffff)+(p2&0xffff)`; `t2=p3+(p1>>16)+(p2>>16)+(t1>>16)`; `t1&=0xffff`; `t3=t2>>16`; `t2&=0xffff`; `lo32=t0|(t1<<16)`, `hi32=t2|(t3<<16)`). Accumulate `lo32,hi32` into the 96-bit signed sum with carry. **Rounding [F2]:** accumulate *all* products exactly; apply one **arithmetic right shift by 16** (floor toward −∞) at the end; take the low 32 bits as the i32 result. Truncation-toward-−∞ is chosen over round-half-up because it is a single unambiguous bit operation (matches BigInt `>>`), has no tie rule, and per-term rounding is unnecessary.
- **Overflow policy:** `|product|<2^62`, `|S|<2^70 < 2^95` (96-bit safe). The stored i32 result **wraps mod 2^32** if the floored value is outside i32 (WGSL §6.2.3 behaviour); in-range seeded vectors are used, and wrap is documented, not treated as "correct".
- **k-order:** fixed `k=0..255` (any order gives the same bytes by integer associativity).
- **Output layout:** 256×256 i32 row-major + status `[256,256,256,n_ok]`; bytes hashed accordingly. `expectedCount = 256*256`.
- **TS reference:** exact via base-2^16 limb accumulation in `number` (`|S|<2^70`; keep 5 limbs base 2^16, each <2^53) or BigInt; cross-checked against BigInt on 16×16×16 random cases + a hand case. **Cost:** Number-limb full 256³ ≈ 1–3 s on Bun; BigInt full ≈ 10–40 s (`--full` optional). Pin frozen at implementation time.

### K4 — integer SHA-256 over a fixed 1 MiB message
- **Algorithm:** FIPS 180-4 SHA-256, all u32. Round constants `K[64]`, `H0..H7` embedded literally; `Σ`/`σ` via `rotr` (constant shifts), message schedule `W[64]`, 64 rounds. No i64 needed.
- **Encoding / message:** 1 MiB = 2^20 bytes generated by LCG `state₀=0x2545F491; stateᵢ₊₁=(1664525·stateᵢ+1013904223) mod 2^32; byteᵢ=stateᵢ₊₁>>24`. Blocks are loaded big-endian into 16 u32. Padding: since 2^20 ≡ 0 (mod 64), append `0x80`, zeros to byte 2^20+56, then 8-byte big-endian bit length `2^23` (`00 00 00 00 00 80 00 00`); total **16385 blocks**, processed serially in one invocation.
- **Output layout:** `[n_blocks=16385, H0..H7]` u32; each `H` word is byte-swapped (`bswap32`) so the 32 bytes following the count equal the standard big-endian digest. Bytes hashed accordingly. `expectedCount = 16385`.
- **TS reference:** the same message + `node:crypto`/Web Crypto SHA-256 — an **independent oracle**. FIPS KATs `"" → e3b0c442…`, `"abc" → ba7816bf…` and the NIST 448/896-bit vectors must also pass. Pin frozen at implementation time.

### K5 — float negative control (f32 matmul)
- **Encoding/spec:** same 256×256 shapes, f32 inputs, `acc = acc + A[i,k]*B[k,j]` for `k=0..255`; no reduction-tree or fusion promise; outputs f32.
- **Why divergence is permitted:** §15.7.4 (no rounding mode), §15.7.4.1 (`x+y`,`x*y` correctly rounded in *either* direction), §15.7.5 (reassociation and fusion permitted), §15.7.2 (subnormal flushing, Finite Math Assumption). Different drivers/GPUs are free to differ; one adapter may also differ run-to-run if it reassociates.
- **Harness behaviour:** K5 never passes/fails the claim. Record per-adapter hash, and a second dispatch for **run-to-run**. Classify `divergent`, `run-to-run only`, or `agreeing`. If all adapters agree, record `k5_agreement=true` and state explicitly that agreement is an observation, **not** evidence that general float is reproducible. Inputs use a wide exponent range (to make flush/fusion divergence observable). `expectedCount = 256*256`.

## 3. Harness + manifest spec

- **Per-record fields:** `kernel`, `kernelVersion`, `wgslSha256` (SHA-256 of the module's exact UTF-8 bytes after CRLF→LF, no BOM), `adapter:{vendor,architecture,device,description,features[],limitsSubset}`, `dispatch:{workgroups,workgroupSize}`, `outputBytes`, `outputSha256`, `status:{count,flags}`, `durationMs`, `timestampISO`, `userAgent`, `compileErrors[]`, `outcome: pass|fail|exception|skip`.
- **Shared source hash:** all adapters run the *same* `wgslSha256`; the manifest records it once per kernel and the gate pins it.
- **Readback:** `copyBufferToBuffer` → `mapAsync(READ)` → copy to a fresh `Uint8Array` → `unmap()`; hash the **raw bytes** (never a typed-array numeric view) [F3].
- **Canonical manifest JSON:** UTF-8, keys sorted, arrays sorted by `kernel` then `adapterKey` (`vendor|architecture|device|description`), no insignificant whitespace; `manifestSha256 = SHA-256(serialized manifest)` included and re-derived by the gate. Committed artifact: `docs/research/reprogpu/expected-manifest.json`.
- **Pass rule:** for K1–K4, every non-skipped record has `outcome=pass` iff `outputSha256 == expectedSha256[kernel]` **and** `status.count == expectedCount[kernel]` **and** `compileErrors` is empty. K5 has no pass criterion. A mismatch that matches an entry of `exceptions.json` becomes `exception` (documented, with adapter info, kernel, observed/expected hash, reason, evidence URL); anything else is `fail` [F5].
- **Third-party reproduction:** open `…/reprogpu/?vectors=wave48`, click Run, download the manifest; verify `manifestSha256` and each `outputSha256` against the committed hashes. The pinned hashes are also recomputable by the CPU gate.

## 4. CI gate (no GPU) and its honesty rule

`scripts/verify-reprogpu.ts` (run by `bun test`/`bun run verify:reprogpu`) checks, deterministically:
1. **References + pinned hashes:** K1 BigInt, K2 philox, K3 Number-limb, K4 LCG+SHA-256 all reproduce `expected-hashes.json` byte-for-byte.
2. **KATs:** K2 vs the three Random123 lines; K4 vs Node/WebCrypto SHA-256 on the LCG 1 MiB message and the FIPS vectors; K1 vs BigInt; K3 vs BigInt on small sizes.
3. **WGSL source integrity:** each kernel's `wgslSha256` equals the pinned value (drift fails until pins are deliberately updated).
4. **Purity scan [F6]:** tokenizer/allowlist over K1–K4 sources — reject float types/literals, `fma`, `atomic`, `discard`, `bitcast` through float, any shift count that is neither a constant in [0,31] nor syntactically masked with `& 31`, and any index expression not statically bounded.
5. **Manifest schema:** `expected-manifest.json` validates and its per-record hashes equal the references.

**Cannot check:** WGSL compilation, GPU execution, driver/adapter behaviour, and **any cross-adapter equality**. **Honesty rule [F8] (must appear in the paper):** *the gate verifies the reference implementations and the vectors; the browser lab is the demonstration of cross-adapter reproducibility. No CI artifact may be cited as evidence of GPU agreement.*

## 5. Attacks on the kernels/claims, with disposition

| # | Attack / ambiguity | Disposition |
|---|---|---|
| A1 | **K1 accumulator width** — brief says 2–4 limbs; full f32 range at unit `2^-149` spans 277 bits per term (`<2^277`), 2^24 terms `<2^301`. | **Fix [F1]:** 10 limbs (320-bit), safe to N ≤ 2^24. 2–4 limbs is impossible without a binned redesign; documented as a corrected constraint. |
| A2 | **K1 special values** — Inf/NaN have no integer magnitude; ±0; subnormals. | **Fix:** subnormals decoded exactly (`M=m, shift=0`); ±0 ≡ 0 (sign of zero may be ignored, §15.7.2); Inf/NaN set sticky `flags` and skip; TS gate **rejects** non-finite vectors as out-of-domain; output for non-finite input is defined (flag set) but is not "the exact sum". |
| A3 | **K1 bitcast-through-float flush** — §17.2/§15.7.2 permits subnormal intermediates of bit-reinterpretation builtins to be flushed. | **Fix [F6]:** K1 never bitcasts through f32; it loads `u32` and decodes. Purity scan bans float bitcast in K1–K4. |
| A4 | **K3 i32 overflow** — products `2^62`, row sums `2^70`; output outside i32. | **Fix [F2]:** 96-bit (3-limb) accumulator; floor shift once; low 32 bits **wrap** per §6.2.3; seeded vectors in range; wrap documented, never called "correct". |
| A5 | **K3 rounding tie** — truncation vs round-half-up. | **Fix:** accumulate exact, round once by arithmetic `>>16`; half-rounding rejected (needs a tie rule with no spec basis). |
| A6 | **Endianness of readback** — hashing a `Uint32Array` view is host-dependent. | **Fix [F3]:** hash raw little-endian bytes (§14.4.4); big-endian hosts are out of test scope. |
| A7 | **Workgroup scheduling** — could reorder accumulation. | **Resolved:** integer add is associative and bounded ⇒ any schedule identical; reduction tree still pinned; optional second dispatch with another `workgroup_size` must reproduce the same hash. |
| A8 | **Atomics** — per-limb `atomicAdd` cannot carry. | **Fix:** atomics banned for all accumulators; private accumulators + fixed tree. |
| A9 | **Silent no-run / partial run** would hash a stale or sentinel buffer. | **Fix [F7]:** sentinel pre-fill, status count canary, output-length check, `createShaderModule`+`getCompilationInfo` (zero errors), `pushErrorScope('validation'|'out-of-memory')`, `onSubmittedWorkDone`. |
| A10 | **Driver bugs** could be quietly tolerated. | **Fix [F5]:** only pre-declared, reproducible `exceptions.json` entries (exact adapter info + reason + evidence) may downgrade a mismatch to `exception`; all others `fail`; the paper lists them. |
| A11 | **K5 false negative/positive** — divergence absent, or agreement spun as reproducibility. | **Fix:** K5 carries no pass/fail; agreement recorded as observation only; paper must not generalise. |
| A12 | **Adapter skip** hides missing adapters. | **Fix:** `skip` (compile/limit failure) is recorded with `compileErrors`/reason and excluded from equality; if every GPU skips, the paper must say the browser demonstration is empty. |
| A13 | **Pinned hash is self-referential** (same reference both sides). | **Mitigated:** external oracles — Random123 KATs (K2), FIPS/Node crypto (K4), independent BigInt (K1/K3). Pins are regression anchors; correctness rests on the oracles. |
| A14 | **`adapter.info` is spoofable / not attestation.** | **Declared limitation:** vendor/device strings identify a run, not a cryptographically attested driver. |
| A15 | **Long accumulation overflows despite design.** | Bounded by explicit proofs (A1, A4) and by the N≤2^24 / K=256 fixed shapes; larger shapes require re-deriving the bound. |

## 6. Verdict, frozen claim, limitations

**GO-WITH-FIXES.** The deliverable is real but narrow (prior art: GO-WEAK). Go **iff** the builder adopts this amended spec — chiefly: [F1] K1 10-limb accumulator, [F2] K3 3-limb exact accumulation + single floor shift, [F3] byte-exact readback, [F4] pinned associative reduction, [F5] machine-checkable exception class, [F6] purity scan + constant shifts + no float bitcast, [F7] sentinel/count/compile gating, [F8] honesty rule. If fewer than two adapters (incl. a software adapter) can be run locally, downgrade the claim to *single-adapter reference conformance* rather than pretending cross-adapter was shown.

**Frozen one-sentence claim.** *"REPROGPU is a browser/WebGPU library and cross-adapter conformance harness that pins byte-identical SHA-256 outputs for a declared integer/fixed-point WGSL kernel subset — exact f32 summation by a 320-bit integer superaccumulator, Philox4x32-10, Q16.16 GEMM, and integer SHA-256 — and demonstrates, as an explicit negative control, that general floating-point results are not reproducible across implementations because WGSL §15.7 leaves rounding direction, reassociation, fusion, and subnormal flushing unspecified."*

**Limitations the paper must carry verbatim:**
1. The guarantee covers only K1–K4 and only the shapes/domains declared above; float is out of scope (WGSL CRD 2026-09-15 §15.7.2/§15.7.4/§15.7.5).
2. The gate verifies the references, KATs, pins, and source integrity; it **cannot** execute WGSL or test cross-adapter equality. The browser lab is the demonstration, not the CI gate.
3. Cross-adapter results are a small, time-stamped sample on one machine; `adapter.info` is self-reported and not cryptographically attested; engine support is `limited` and may change.
4. K1 excludes non-finite inputs (flagged and rejected); K3 documents mod-2^32 wrap on out-of-range output; none of K1–K4 covers general float.
5. Any adapter mismatch is a `fail` unless it is a pre-declared, reproducible `exceptions.json` driver bug; exceptions are reported, not hidden.
6. K5 divergence is permitted and expected; K5 agreement on any hardware set is not evidence of general float reproducibility.
