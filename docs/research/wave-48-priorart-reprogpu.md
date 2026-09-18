# Wave 48 — Prior-Art Attack: REPROGPU (cross-vendor bit-reproducible WebGPU kernels + conformance harness)

Date: 2026-09-19. Adversarial prior-art search only. Read `wave-48-candidates-browser.md` §C2 first.
One file written; no repo code touched; no git. Every claim carries a URL and a date.

**Method.** `websearch` returned results (unlike the candidate wave's 20/20 HTTP 429s): **44 distinct batch
queries**, plus direct fetches of the load-bearing sources below (ReproBLAS site; NGC/CCCL blog; the WGSL
CRD §15.7 fetched in full and grepped locally; NVIDIA framework-reproducibility issue #28; gpuweb #1048;
the `11vated/PAradigm-reference` determinism brief; IBM patent text via the `r.jina.ai` reader proxy of
Google Patents after the direct endpoint returned 503). Google Patents direct HTML/XHR was blocked
(503 / automated-query wall); the proxy reached the same record. Absence-of-search-result is **not**
treated as proof of absence; "no located work" below means I searched web + GitHub (search API; code search
requires auth) and name the closest hits. Search-provider failures are logged in §7.

---

## 1. Verdict: GO-WEAK

REPROGPU's *headline* capability — making a documented subset of GPU compute bit-reproducible **across
vendors** — is a **mature, named, published category** on CPUs and even on GPUs: ReproBLAS (Demmel/Nguyen,
TOMS 2020, https://doi.org/10.1145/3389360), ExBLAS (Iakymchuk/Collange/Defour/Graillat, NRE 2015,
https://www.nist.gov/document/nre-2015-04-iakymchukpdf), the Ozaki scheme (DGEMM on Tensor Cores with
CPU↔GPU bitwise reproducibility, https://dl.acm.org/doi/abs/10.1177/10943420241239588), and NVIDIA's own
`gpu_to_gpu` deterministic reduction using a Reproducible Floating-point Accumulator (CCCL 3.1,
2026-03-05, https://developer.nvidia.com/blog/controlling-floating-point-determinism-in-nvidia-cccl/).
The candidate's "new capability" is therefore mostly **known mechanism**. NVIDIA's own reproducibility
team documents that bit-exactness is *not* expected across GPU architectures (2020-10-13,
https://github.com/NVIDIA/framework-reproducibility/issues/28), whereas the WebGPU/WGSL spec makes even a
single `f32` add's rounding direction unspecified (§15.7.2/§15.7.4, CRD 2026-09-15,
https://www.w3.org/TR/2026/CRD-WGSL-20260915/), so the "cross-vendor float subset" is **empty** for
general float and collapses to integer/fixed-point/exact-accumulation kernels — the known path.

**Unmatched clause (why not KILL):** *a browser/WebGPU library that publishes cross-adapter bit-identical
output hashes for a declared integer/fixed-point WGSL kernel subset, together with a conformance harness*
— no located project does this. The WebGPU CTS (https://github.com/gpuweb/cts) tests **accuracy within
ULP/absolute tolerances**, not bit-exact cross-adapter determinism (`docs/fp_primer.md`,
https://chromium.googlesource.com/external/github.com/gpuweb/cts/+/07f15b8e1e73c5cc52d94ab9916a59c04f9c95ec/docs/fp_primer.md);
the one public brief recommending exactly this "integer-only core + conformance matrix" is a 1★ research
note (`11vated/PAradigm-reference/research/001-gpu-determinism-cross-vendor.md`). So the deliverable is
real but narrow, and it is **engineering a known science onto a new runtime**, not new science →
**GO-WEAK**, not GO. The honest one-line scope is the fallback: *documented deterministic subset +
harness*, with float declared out of scope.

---

## 2. Closest work (hostile table)

| Work | Venue / year | URL | What it does | Clauses not done |
|---|---|---|---|---|
| **ReproBLAS / binned summation** | TOMS 46(3), 2020-07-21 | https://doi.org/10.1145/3389360 · https://bebop.cs.berkeley.edu/reproblas | Bitwise order-independent float sum/dot/nrm2 via 6-word "binned" accumulator; 9n FLOPs; 1 read + 1 reduction; handles over/underflow reproducibly | GPU/WebGPU port; conformance harness; GEMM not in stable release |
| **ExBLAS (Iakymchuk et al.)** | NRE 2015; Parallel Computing 49, 2015 | https://www.nist.gov/document/nre-2015-04-iakymchukpdf · https://doi.org/10.1016/j.parco.2015.09.001 | 5-level FPE + Kulisch superaccumulator; **bit-perfect reproducible** dot/GEMV/TRSV/GEMM on CPUs, Xeon Phi, **NVIDIA + AMD GPUs**; ~25% of FP-sum perf | *same-vendor* GPUs; not WebGPU; no published cross-adapter hashes |
| **Ozaki scheme / OzBLAS / DGEMM on Tensor Cores** | IJHPCA 2024; Ozaki-II arXiv 2504.08009 (2025-04-10) | https://dl.acm.org/doi/abs/10.1177/10943420241239588 · https://arxiv.org/abs/2504.08009 | Error-free integer/modular decomposition ⇒ **bit-level reproducible** FP64 GEMM; CPU↔GPU; Tensor-Core INT8/FP16 path; tunable/round-correct | WebGPU; browser; float64 in WGSL absent; harness |
| **NVIDIA CCCL/CUB `gpu_to_gpu` RFA** | CCCL 3.1, 2026-03-05 | https://developer.nvidia.com/blog/controlling-floating-point-determinism-in-nvidia-cccl/ | Reduction identical across different **NVIDIA** GPUs (3-bin RFA); run-to-run default; +20–30% time | NVIDIA-only; not cross-vendor; reductions only (issue #5550) |
| **RepDL (Microsoft)** | arXiv 2510.09180, 2025-10-10 | https://arxiv.org/abs/2510.09180 | Bitwise-reproducible DL train/infer across CPU/GPU via correct rounding + order invariance | GPU-vendor-agnostic? CUDA-centric; not browser/WebGPU; heavy framework |
| **Hawkeye** | MLSys 2026; arXiv 2603.20421 (2026-03-20) | https://arxiv.org/abs/2603.20421 | Reverse-engineers NVIDIA Tensor Core rounding/subnormal/accumulation; **bit-exact replay on CPU**; 100% on 4096² matmul | One vendor; reproducibility *by simulation*, not cross-vendor kernels |
| **Deterministic Atomic Buffering (DAB)** | MICRO 2020 | http://microarch.org/micro53/papers/738300a981.pdf | GPU **hardware** buffers make FP atomics ordered/deterministic; 4× GPUDet, +23% | Requires new silicon; not WebGPU |
| **GPUDet** | ASPLOS 2013 | https://people.ece.ubc.ca/aamodt/publications/papers/jooybar.asplos2013.pdf | First fully deterministic GPU architecture (~2× slowdown) | Silicon; no portability guarantees |
| **Intel MKL CNR (oneMKL)** | docs 2012→2025 | https://www.intel.com/content/www/us/en/docs/onemkl/developer-guide-linux/2023-1/obtaining-numerically-reproducible-results.html | Bitwise run-to-run under fixed threads/branch; strict CNR for GEMM/TRSM | CPU only; conditional; not cross-vendor |
| **Counter-based RNG (Philox/Threefry/Random123)** | NumPy docs (2.5); C++ P2075 | https://numpy.org/doc/stable/reference/random/bit_generators/philox.html | Fixed seed ⇒ identical integer stream on CPU/GPU/FPGA; in cuRAND/rocRAND | Not a WebGPU/SWGSL implementation; no harness |
| **PyTorch `use_deterministic_algorithms` / TF `enable_op_determinism`** | docs (PyTorch 2.13, 2026-05-14; TF 2.16) | https://docs.pytorch.org/docs/stable/generated/torch.use_deterministic_algorithms.html · https://www.tensorflow.org/api_docs/python/tf/config/experimental/enable_op_determinism | Same-hardware/software determinism; error if only nondeterministic kernel exists | Explicitly **not** cross-platform/cross-vendor; not browser |
| **Optimistic Verifiable Training by Controlling Hardware Nondeterminism** | arXiv 2403.09603, 2024-03-14 | https://arxiv.org/abs/2403.09603 | Makes an auditor replicate training despite GPU nondeterminism via higher-precision rounding signals | Requires auditor+trainer protocol; not a reproducible-kernel library |
| **zkML / verifiable GPU compute** | EuroSys 2024; survey arXiv 2502.18535 | https://dl.acm.org/doi/10.1145/3627703.3650088 · https://arxiv.org/abs/2502.18535 | ZK proofs of ML inference; GPU-accelerated provers (GZKP, ZKProphet) | Proofs, not bit-exact reproduction; not WebGPU |
| **SAGE (software attestation for GPU)** | USENIX ATC 2023 | https://www.usenix.org/system/files/atc23-ivanov.pdf | Verifiable untampered kernel execution on NVIDIA GPU | Attestation of code, not numeric reproducibility |
| **GINGER / Allspice** | USENIX Sec 2012; TR 2013 | https://www.usenix.org/system/files/conference/usenixsecurity12/sec12-final26_0.pdf | Proof-based verified computation with **GPU** prover; float fractions supported | Crypto proving; not deterministic kernels |
| **`11vated/PAradigm` cross-vendor brief** | GitHub, 1★ | https://github.com/11vated/PAradigm-reference/blob/main/research/001-gpu-determinism-cross-vendor.md | Says WGSL is not bitwise-deterministic; recommends integer-only core + wgpu version pinning + conformance matrix | **A recommendation, not an implementation**; no code/hashes |
| **WgPy** | arXiv 2503.00279, 2025-03 | https://arxiv.org/pdf/2503.00279 | NumPy-like WebGPU/WebGL array lib in browser; 340× vs CPU matmul | No determinism/reproducibility claims |
| **`RustyBamboo/hash-shader`** | GitHub | https://github.com/RustyBamboo/hash-shader | SHA-256 WebGPU compute shader (integer) | Not a conformance/reproducibility harness |
| **`aaravkohli1/BitExact`** | GitHub, 1★ | https://github.com/aaravkohli1/BitExact | Deterministic CUDA matmul/RMSNorm/reductions, PyTorch drop-in | CUDA/NVIDIA only |

---

## 3. Clause-by-clause

**(a) Cross-vendor bit-exactness for a declared kernel subset — KNOWN (mechanism) / PARTIAL (target).**
Closest: ExBLAS and Ozaki/OzBLAS already deliver bit-perfect reductions and GEMM across *different*
architectures including NVIDIA and AMD GPUs and CPUs; CUB already delivers `gpu_to_gpu` bit-identical
reductions across NVIDIA GPUs; ReproBLAS already defines the binned accumulator. What is *not* located is
a shipping library that pins a declared subset and proves hashes for NVIDIA↔AMD↔Intel↔Apple via one API.
The subset is forced to be integer/fixed-point/exact-accumulation, because WGSL §15.7.2 provides *no
rounding mode* ("An implementation may round an intermediate result up or down") and §15.7.5 permits
reassociation and fusion; only operations WGSL specifies as "Correct result" (integer/bitwise,
comparisons) or exact are portable. So (a) is **partially new** in the delivery sense and **known** in the
science.

**(b) Cross-vendor conformance harness — PARTIAL/KNOWN.** The WebGPU CTS is already a cross-vendor,
normative harness (https://github.com/gpuweb/cts) and Dawn/Firefox/`wgpu` run it on multiple backends; the
native C++ port links three backends against one oracle (`infosia/webgpu-native-cts`). But the CTS tests
*accuracy within tolerance* (`fp_primer.md`), not bit-exact cross-adapter output hashes. A "run N
adapters, SHA-256 the output, require equality" harness is standard test engineering, not a research
object; AMD/NVIDIA determinism CI and the PAradigm brief already describe it. Delta: **new only as a
published, cross-adapter, bit-exactness artifact for a declared WGSL subset.**

**(c) Integration into a real workload (ML/science) — KNOWN/OCCUPIED.** RepDL (bit-reproducible DL),
Hawkeye (verifiable ML replay), Optimistic Verifiable Training (auditing under hardware nondeterminism),
zkML/GZKP/ZKProphet (verifiable GPU ML), SAGE (GPU attestation), and the HPC reproducible-BLAS line
(ReproBLAS/ExBLAS/OzBLAS solvers) cover this fully. REPROGPU adds no new workload integration.

**(d) Browser / WebGPU — NEW.** No located project implements bit-reproducible compute on WebGPU, and no
WebGPU reproducibility library exists (GitHub search for "reproducible webgpu": 20 repos, none a
determinism library — top hits are `tinySarf` (2★), benchmark/portfolio repos; "deterministic gpu compute":
none relevant). This is the genuine unmatched clause, and it is a **runtime/delivery** delta, not a
scientific one.

---

## 4. The honest size of the bit-exact subset (and its ceiling)

Fixed by the spec, not by effort: WGSL guarantees "Correct result" only for comparisons and
integer/bitwise ops (i32/u32 add/sub/mul/bitwise wrap modulo 2³²; `dot4I8Packed`/`dot4U8Packed`), and
"Correctly rounded" for `+ - * /` and `sqrt` **but with the rounding direction unspecified**
(§15.7.4.1). Therefore:

- **Provably bit-exact across vendors:** integer/bitwise arithmetic and logic; comparisons; indexing;
  counter-based RNG in u32 (Philox/Threefry are integer-only); hashing/checksums in integer; sorting keys
  (deterministic sample/bucket sort, arXiv:1002.4464, 2010); fixed-point `Qn.m` add/mul/div, and exact
  reduction via an **integer binned/superaccumulator** reconstructed in WGSL integer lanes (the
  ReproBLAS/ExBLAS mechanism expressed as integer ops). These are also order-independent, so atomics are
  safe (integer add is associative mod 2³²).
- **Plausible but must be pinned by tree-order, not by hardware:** emulated float reduction/GEMM if every
  real step is reduced to integer ops (Ozaki-style decomposition, e.g. FP→fixed-point slices) with a
  fixed WGSL schedule; this is exactly the ExBLAS/Ozaki result, re-encoded.
- **Impossible without vendor cooperation:** arbitrary IEEE `f32`/`f16` `+ - * /`, `fma`, transcendentals
  (`cos` up to 2⁻¹¹ absolute error; `atan` 4096 ULP), `determinant`/derivatives (infinite ULP), and any
  kernel where the compiler is free to reassociate/fuse/flush-to-zero. A "float matmul bit-exact
  cross-vendor" kernel is not a hard version of the deliverable; it is outside the spec.

So the deliverable that survives is a **small integer/fixed-point kernel library** (reproducible reduction,
counter RNG, exact GEMM, integer hash/sort) plus a **hash-table harness**, with float explicitly out of
scope. That is a legitimate but modest artifact.

---

## 5. Strongest hostile argument (and survival)

*"REPROGPU = ReproBLAS + ExBLAS/Ozaki + Philox + WebGPU CTS. The reproducible-accumulator math is 13–15
years old and already runs on NVIDIA and AMD GPUs (ExBLAS, OzBLAS) and across NVIDIA GPUs (CUB
`gpu_to_gpu`); the RNG is a 2011 counter-based design already shipped in cuRAND/rocRAND/NumPy; the
'conformance harness' is the WebGPU CTS, which is *already* the cross-vendor, normative test suite. The
only new token is 'in a browser,' and WGSL's unspecified rounding (no rounding mode; reassociation and
fusion permitted) means the float subset is empty, so the honest deliverable is 'integer-only kernels +
SHA-256 across adapters' — which is a port, not a contribution."*

**Survival:** the objection lands on *novelty/significance*, not existence. No located work ports
reproducible-accumulator reduction, counter RNG, and exact GEMM to WGSL, publishes cross-adapter
bit-identical hashes, and documents the float boundary as a reusable library + harness; the CTS does not
do bit-exactness at all. But survival is **weak**: the paper must (i) beat a ReproBLAS-style baseline on
WebGPU rather than invent the math, (ii) prove ≥3 adapters (incl. SwiftShader CPU) hash-identical for a
kernel set that a naive integer matmul could not already do, and (iii) find at least one workload where
browser-side verifiability is the *point* (proof-carrying client compute, credential/attestation for a
web result, grading), because otherwise the harness is a solution looking for a problem.

---

## 6. If GO — exact stage-1 experiment (Mac, zero server)

**Backends available on a Mac (N ≥ 3).** Chrome (Dawn→Metal), Safari (WebGPU→Metal), Firefox
(`wgpu`/Naga→Metal); plus the **software adapter**: Chrome `--use-webgpu-adapter=swiftshader` (CPU Vulkan,
https://github.com/google/swiftshader), and optionally headless Dawn/`wgpu` (Metal) or `gogpu`'s SPIR-V
interpreter. Record `adapter.info` (vendor/architecture/device/description) in the manifest.

**Kernels (all integer, so declared-exact by §15.7.4.1).**
1. Reproducible reduction: encode `f32`/`f64` inputs as binned integer superaccumulator lanes (ExBLAS-style
   fixed-point), reduce with a **fixed tree** and integer atomics; compare against a CPU big-int reference.
2. Counter-based RNG: Philox4x32-10 / Threefry-2x32 in WGSL; emit 1 MiB u32; pin published Random123 KATs.
3. Exact GEMM: small fixed-point (Q16.16) matmul with integer accumulation over 256×256×256.
4. Integer SHA-256 compute kernel over 1 MiB (integer, so exact).
5. Negative control: `f32` `fma` matmul of the same shape — **expected to diverge**; this documents the
   boundary and is part of the result.

**Pass/fail.** For kernels 1–4, SHA-256 of the raw output buffer must be **identical across all adapters
and engines** (readback via `copyBufferToBuffer`→`mapAsync`→`crypto.subtle.digest`). Kernel 5 must show
≥1 bit difference on ≥1 adapter pair (or, if it does not, record it as `run-to-run` only, not
cross-vendor, since the spec permits divergence). Fail = any drift in 1–4 not explained by a documented
adapter bug.

**Time budget.** 1–2 days: ~½ day WGSL integer kernels + KATs; ~½ day harness across 3–4 adapters; ~½ day
manifest/README + negative control.

**Defensible one-sentence claim.** *"We present the first browser/WebGPU library and cross-adapter
conformance harness that guarantees bit-identical output hashes for a declared integer/fixed-point WGSL
kernel subset (reproducible reduction, counter-based RNG, exact GEMM, integer hashing) across GPU vendors
and a CPU software adapter, and we document precisely where WGSL's unspecified rounding, reassociation,
and fusion make general floating-point non-reproducible across implementations."*

---

## 7. Patents (retrieved 2026-09-19; direct Google Patents returned 503, proxy reached the records)

- **US8601237B2 / US8966224B2** — "Performing a deterministic reduction operation in a parallel computer,"
  IBM; priority **2010-05-28**, granted 2013-12-03; expired (fee-related).
  https://patents.google.com/patent/US8601237B2/en — claims ordering processors' contribution data via
  dummy-data + ACK so a CAU reduces in a predefined order. **Directly relevant to deterministic
  reductions**, but covers a *hardware ordering protocol*, not a bit-exact cross-vendor kernel subset or a
  browser harness. A portable WGSL implementation that reproduces a value need not practise this ordering
  scheme.
- The reproducible-summation literature (Demmel/Nguyen/Rump/Ozaki) is published and widely implemented;
  no patent located that claims the accumulator arithmetic itself. No patent located on
  "cross-vendor WebGPU bit-reproducibility" or "cross-adapter output-hash conformance harness."
- Verdict: patents are **context, not a blocker** for the narrow GO-WEAK deliverable; the fatal pressure
  is academic (ReproBLAS/ExBLAS/Ozaki) and the platform (WebGPU CTS).

---

## 8. Query / exhaustion log (all 2026-09-19 unless noted)

**44 distinct `websearch` queries.** Reproducible FP/BLAS: ReproBLAS; "reproducible summation hardware
augmented addition patent"; "patent bitwise reproducible floating point summation parallel processor";
Ozaki scheme bitwise reproducible GPU; Collange/Defour/Graillat/Iakymchuk parallel reduction; MPI
reproducible reduction bitwise. GPU determinism: bit-reproducible GPU cross-vendor; CUDA atomicAdd
non-determinism; NVIDIA CCCL/CUB determinism; Deterministic Atomic Buffering MICRO 2020; GPUDet;
PyTorch deterministic algorithms; TensorFlow deterministic ops; deterministic deep-learning survey;
"deterministic WebGPU/wgpu compute shader". WebGPU specifics: WebGPU spec implementation-defined
numerics; WebGPU CTS cross-vendor determinism; WebGPU CTS floating-point tolerance; WGSL fast-math
contraction Naga/Tint; SwiftShader deterministic. Verifiable compute: zkML GPU; verifiable computation
GPU proofs; verifiable GPU browser ZK; reproducible builds GPU attestation; reproducible webgpu GitHub;
"reproducible webgpu deterministic kernel library"; "reproducible WebGPU/WGSL deterministic compute
project github"; WebGPU scientific computing reproducibility; patent deterministic GPU computation;
"reproducible WebGPU" GitHub API; "deterministic gpu compute" GitHub API; "bit-reproducible gpu" GitHub
API; "deterministic kernels reproducible" GitHub API; counter-based RNG Philox GPU; exact integer
accumulation GPU.

**Direct fetches (full or partial):** ReproBLAS site (the 2018-08-17 page); NVIDIA CCCL determinism blog
(2026-03-05); WGSL CRD 2026-09-15 §15.7 (grep of the saved spec text); NVIDIA
`framework-reproducibility` issue #28 (2020/2022); gpuweb issue #1048 (2020-09-03);
`11vated/PAradigm-reference` determinism brief; WebGPU CTS `fp_primer.md`; IBM patent US8601237B2.

**Blocked / degraded:** Google Patents direct HTML/XHR → HTTP 503 (worked only via `r.jina.ai`); GitHub
code-search API → 401 (auth required), repository search API intermittently empty (rate-limit); no
`pdftotext` on host (PDFs read via HTML/abstract mirrors). `websearch` did **not** return HTTP 429 this
wave (unlike the candidate wave).

---

## 9. If KILL — fallback (not selected, recorded for completeness)

If the team rejects "port known reproducible arithmetic to a browser" as insufficiently novel, the
nearest defensible target is **a browser-native verification harness for *result hashes* plus an
attestation envelope** (i.e., combine the integer subset with the DEVSIG/credential direction in
`wave-48-candidates-browser.md` §C5), where the unmatched clause becomes *offline-verifiable proof that a
specific declared kernel produced a specific cross-adapter hash*. Do **not** re-propose general float
bit-reproducibility: §15.7 of the WGSL spec and NVIDIA's own team both state it is not available.
