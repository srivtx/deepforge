# Wave 46 — Candidate C: A Missing Compression / Decompression Capability for Neural Models

Scope: survey only (no code, no git). One artefact: this file. Date: 2026-09-19.
Method: existence map first, then gaps that survive it, then 3–5 ranked candidates.
Constraint discipline: no GPU, limited download budget → all Stage-1 plans run on CPU with a
~1–125M-param open model (`sshleifer/tiny-gpt2` ~2 MB, `gpt2` 124M, or a locally-constructed
GPT; synthetic random tensors for codec-only tests). URLs + dates are attached to every claim.
Timeline note: this environment's "today" is 2026-09-19, so several load-bearing prior-art items
are 2026 papers; they are treated as real and are what closes the biggest "gaps".

---

## 1. MANDATORY EXISTENCE MAP (URL, 1 line each)

### 1.1 Weight compression — quantization
- GPTQ: layer-wise 2nd-order weight-only PTQ, the 4-bit default — https://arxiv.org/abs/2210.17323 (2022-10; ICLR'23).
- AWQ: activation-aware scaling, salience-based 4-bit — https://arxiv.org/abs/2306.00978 (2023-06; MLSys'24).
- QuIP / QuIP#: incoherence + Hadamard + lattice codebooks for 2-bit — https://arxiv.org/abs/2402.04396 (2024-02).
- AQLM: additive/multi-codebook vector quantization, Pareto to ~2 bpw — https://arxiv.org/abs/2401.06118 (2024-01; ICML'24).
- GGUF k-quants: CPU-decodable 2–6-bit superblock format, hand-tuned layer mixes — https://github.com/ggml-org/llama.cpp/pull/1684 (2023).
- 1–2-bit extremes: BiLLM 1.08 bpw — https://arxiv.org/abs/2402.04291 (2024-02); PTQTP ternary trit-planes — https://arxiv.org/abs/2509.16989 (2025-09).
- VPTQ: vector PTQ, 2nd-order codebook init, <3 bpw with LUT decode — https://aclanthology.org/2024.emnlp-main.467/ (EMNLP 2024).
- Empirical ceiling: 4-bit is the practical floor; <3-bit degrades on math/reasoning — https://arxiv.org/abs/2601.14277 (2026); https://zeroentropy.dev/concepts/gguf/ .

### 1.2 Weight compression — pruning
- SparseGPT: one-shot 50–60% unstructured, 2:4/4:8 — https://arxiv.org/abs/2301.00774 (2023-01; ICML'23).
- Wanda: magnitude×activation, no weight update, ~300× faster to prune — https://arxiv.org/abs/2306.11695 (2023-06; ICLR'24).
- MoE structured pruning / expert redundancy — https://arxiv.org/abs/2504.07807 (2025-04).

### 1.3 Weight compression — low-rank / factorization
- ASVD: activation-aware SVD, also 50% KV reduction — https://arxiv.org/abs/2312.05821 (2023-12).
- SVD-LLM: truncation-aware whitening + sequential low-rank update — https://arxiv.org/abs/2403.07378 (2024-03).
- Low-displacement-rank structured matrices, 20× fewer params — https://arxiv.org/abs/1810.02309 (NeurIPS 2018).
- Palu: low-rank KV hidden-dim projection — https://arxiv.org/abs/2407.21118 (2024-07; ICLR'25).

### 1.4 Weight compression — distillation / weight sharing / supermasks
- KD-of-LLM survey (compression + self-improvement) — https://arxiv.org/abs/2402.13116 (2024-02, rev 2024-10).
- Deep Compression: prune + trained quantization + Huffman, 35–49× — https://arxiv.org/abs/1510.00149 (ICLR 2016).
- Supermasks: untrained random weights + mask reach 80–86% MNIST — https://proceedings.neurips.cc/paper/2019/file/1113d7a76ffceca1bb350bfe145467c6-Paper.pdf (NeurIPS 2019).
- SupSup: thousands of supermasks over one frozen random net — https://proceedings.neurips.cc/paper_files/paper/2020/file/ad1f8bb9b51f023cdc80cf94bb615aa9-Paper.pdf (NeurIPS 2020).
- T-SLTH: supermasks + quantization, 144× ResNet-50 compression — https://nips.cc/virtual/2024/98237 (NeurIPS 2024).

### 1.5 Weight compression — product/vector quantization & generative reconstruction
- Multi-codebook VQ for LLMs: AQLM/VPTQ (above); GPTVQ lineage cited inside those.
- PRANC: model = 1 seed → frozen random basis nets + learnt linear coefficients — https://arxiv.org/abs/2206.08464 (2022-06).
- WINGs: PCA+SVR predict/compress layer weights, 53× on FC — https://arxiv.org/abs/2507.06380 (2025-07).
- Weight-space generative models (diffusion/flow over weights) — https://arxiv.org/abs/2402.18153 (2024-02).

### 1.6 Model-data compression — file formats & lossless codecs
- safetensors: dtype-agnostic, zero-copy, no compression by design — https://github.com/huggingface/safetensors (2022–).
- GGUF: single-file mmap container with embedded quant types — https://github.com/ggml-org/ggml/blob/master/docs/gguf.md (2023–).
- ZipNN: exponent/Huffman lossless codec, ~33% (sometimes >50%) saved — https://arxiv.org/abs/2411.05239 (2024-11; IEEE Cloud, rev 2025-06).
- DFloat11: entropy coding of BF16 + custom GPU LUT decode, bit-exact, 30% smaller — https://arxiv.org/abs/2504.11651 (NeurIPS 2025).
- EntroLLM: mixed quant + Huffman, 30–65% storage cut, faster on Jetson — https://arxiv.org/abs/2505.02380 (2025-05).
- FP8/FP4 lossless (exponent/mantissa split) + KV compressibility — https://arxiv.org/abs/2508.19263 (2025-08).

### 1.7 Model-data compression — delta / checkpoint / merge / dedup
- Inshrinkerator: per-checkpoint non-uniform quant + quantization-aware delta — https://arxiv.org/abs/2306.11800 (2023-06).
- LMC: byte-grouping + Huffman for incremental checkpoints, GiB/s — https://arxiv.org/abs/2505.09810 (2025-05).
- Delta-DCT: treat finetune deltas as JPEG patches, data-free 1-bit-equivalent — https://arxiv.org/abs/2503.06676 (2025-03).
- DBMS: dynamically shift the base model before delta compression — https://arxiv.org/abs/2505.11344 (2025-05).
- Task arithmetic: task vectors = θ_ft − θ_pre, composable — https://arxiv.org/abs/2212.04089 (ICLR 2023).
- Model dedup in DBs (page/tensor blocks) — https://arxiv.org/abs/2201.10442 (VLDB 2022); privacy-aware dedup — https://arxiv.org/abs/2503.02862 (2025-03).

### 1.8 Model-data compression — symmetry / permutation (the key neighbourhood)
- Git Re-Basin: align two models by permutation to merge — https://arxiv.org/abs/2209.04836 (2022-09; ICLR'23).
- Universal & Succinct Source Coding of DNNs: permutation invariance + arithmetic coding, inference without full decode (discrete FF weights) — https://arxiv.org/abs/1804.02800 (2018-04).
- InvarExplore: discrete search over permutation invariance to improve ultra-low-bit quant — https://arxiv.org/abs/2502.06844 (2025-02).
- **MCWC (Motion-Compensated Weight Compression): aligns permutation-symmetric blocks across depth, layer-sequential predictor + keyframes + learnt entropy model of residual — https://arxiv.org/abs/2605.24754 (2026-05).** ← this closes the "cross-layer symmetry codec" idea.
- Permutation used for watermark/stegomalware (not compression) — https://arxiv.org/abs/2609.16193 (2026-09).
- Weight-space symmetry used for curvature, not coding — https://arxiv.org/abs/2606.00442 (ICML 2026).

### 1.9 Activation / KV-cache compression
- H2O: heavy-hitter KV eviction — https://arxiv.org/abs/2306.14048 (NeurIPS 2023).
- StreamingLLM: attention sinks + rolling window — https://arxiv.org/abs/2309.17453 (2023-09; ICLR'24).
- KIVI: tuning-free 2-bit KV, per-channel K / per-token V — https://arxiv.org/abs/2402.02750 (ICML 2024).
- Palu low-rank KV (above); KVTC transform coder ≤20× — https://arxiv.org/abs/2511.01815 (ICLR 2026).
- Fractal KV archives: lossless symbolic KV with O(1) random access — https://arxiv.org/abs/2607.07144 (2026-07).
- Activation compression: GACT 8.1× training memory — https://arxiv.org/abs/2206.11357 (ICML 2022); FourierCompress 7.6× — https://arxiv.org/abs/2510.16418 (2025-10).

### 1.10 Codecs — learned compression, arithmetic coding, decode hardware
- L3C lossless image hierarchy + adaptive arithmetic coding — https://arxiv.org/abs/1811.12817 (2019).
- L3TC: RWKV + outlier tokenizer, real-time MB/s text decode — https://arxiv.org/abs/2412.16642 (2024-12).
- LMCompress: LLM probabilities + arithmetic coding across modalities — https://arxiv.org/abs/2407.07723 (2024-07).
- Nacrith: SmolLM2-135M + arithmetic coder, 0.92 bpb on alice29 (LLM-as-compressor) — https://arxiv.org/abs/2602.19626 (2026-02).
- FLUTE: LUT-quant GEMV, 2–4× kernel speedup, bandwidth-bound — https://arxiv.org/abs/2407.10960 (EMNLP 2024 Findings).
- DFloat11 GPU decode kernels (above); FluxBin LUT ultra-low-bit kernel — https://arxiv.org/abs/2608.15602 (2026-08).
- Random-access neural texture codecs (the only "random access" codecs) — https://arxiv.org/abs/2305.17105 (SIGGRAPH 2023); https://arxiv.org/abs/2407.00021 (ECCV 2024).

### 1.11 Serving / economics / benchmarks
- Decode is memory-bandwidth-bound; dequant is fused to avoid it — https://arxiv.org/abs/2407.10960 (2024).
- Analytical memory-bandwidth/roofline model across model families — https://arxiv.org/abs/2406.01698 (2024-06; rev 2025-05).
- 4-bit 7B is purely bandwidth-bound on embedded FPGA, 85% of BW limit — https://arxiv.org/abs/2502.10659 (DATE 2025).
- Metrics in use: bits-per-weight vs WikiText PPL and downstream tasks — https://arxiv.org/abs/2601.14277 (2026); k-quant bpw table — https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md .
- Energy/latency trade reported by EntroLLM/FPGA papers (above).

---

## 2. GAPS THAT SURVIVE THE MAP (and why)

- **G1 — No cross-model / population codec.** Everything is single-model (MCWC, ZipNN, DFloat11) or
  single-pair (DBMS, Delta-DCT, Inshrinkerator). No shared, symmetry-aligned, learnt-entropy codec
  jointly compressing a *lineage of finetunes of one base*. Queries `"model zoo"+compression+finetune`
  and `delta+model zoo+weights` return **0** arXiv results (2026-09-18). Model hubs are the pain point.
- **G2 — No random-access weight codec.** MCWC is layer-sequential; entropy formats are sequential/block.
  Random access exists only for textures (2305.17105) and KV (2607.07144), never sub-tensor LLM weights.
- **G3 — No decode-cost-aware rate–distortion.** Sub-4-bit formats lose their gain to dequant/LUT cost
  (FLUTE, VPTQ, EntroLLM say so), yet no codec optimises bits *and* decode energy jointly with a
  published tokens/sec-per-byte Pareto.
- **G4 — No "compute-for-bits" replay codec.** PRANC stores seed+basis+coeffs; nobody stores a
  *compressed training trajectory* (seed, data order, schedule) and regenerates weights by re-execution.
- Explicitly **closed** (skip): 4-bit/2-bit/1-bit quant & VQ, pruning, low-rank, distillation, supermasks,
  seed-reconstruction (PRANC), single-model lossless (ZipNN/DFloat11/EntroLLM), finetune-delta (DBMS/Delta-DCT),
  checkpoint delta (Inshrinkerator/LMC), cross-layer symmetry codec (MCWC), permutation+arithmetic coding (1804.02800).

---

## 3. CANDIDATES (ranked by missing × impact × CPU-feasibility)

### Candidate 1 — Lineage/ZooCodec: a population codec for finetune families  [RANK 1]
1. **One-liner.** Compress an entire family of finetunes of one base as one symmetry-aligned "video":
   per-member motion field (permutation ± row scaling) + a shared predictor + arithmetic-coded residuals.
2. **Exists / not.** Exists: single-model cross-layer alignment+predictor (MCWC 2605.24754); per-pair
   delta quant (DBMS 2505.11344, Delta-DCT 2503.06676); run-checkpoint deltas (2306.11800, 2505.09810);
   block dedup (2201.10442, 2503.02862). Does **not** exist: any codec that jointly models N finetunes,
   solves cross-model permutation/scaling alignment, or shares an entropy model across the family.
3. **Who hurts / unlocks.** Hugging Face & mirror traffic (ZipNN estimates >1 EB/month, 2411.05239);
   edge devices shipping many adapters; delta OTA updates; random load-one-version. Unlocks "store the
   family once," instant finetune download, version browsers.
4. **Why now.** MCWC proved symmetry alignment reduces weight entropy; hubs now host millions of
   finetunes of a handful of bases; LoRA/delta distribution is already the norm.
5. **Redundancy exploited.** Permutation + row-scaling symmetries that make independently finetuned
   members look randomly relabelled; shared-base correlation; cross-member weight correlation. Existing
   codecs exploit **none** of the cross-member symmetry.
6. **Stage-1 (CPU).** Zoo = base `gpt2` (124M) + 8–16 small finetunes (train ~10–30 min each on CPU, or
   use existing tiny checkpoints; synthetic random-perturbation members for the codec test). Metrics:
   bytes/param of the whole zoo vs `base + Σ zstd(θ_i−θ_base)`; **bit-exact reconstruction** (store the
   exact inverse permutation, so lossless); decompression MB/s; alignment cost. Non-goals: GPU kernels,
   >125M models, lossy mode.
7. **Decisive first experiment (pass/fail).** "On 8 GPT-2-scale finetunes, ZooCodec ≤ 60% of
   base + 8·zstd(delta) at bit-exact reconstruction, in <2 h CPU." Fail if permutation side-info eats the gain.
8. **Risks.** Permutation search may find no small-displacement match after finetuning; permutation
   side-info (≈ n·log n bits/layer) is the killer — must be compressible; scaling symmetries may be
   unidentifiable in RMSNorm/GELU nets.
9. **Grade.** NEW CATEGORY (population-level codec). Built from existing primitives, but the capability
   (family-as-one-stream with shared learnt entropy) does not exist.

### Candidate 2 — SeekCode: O(1) randomly-accessible compressed weights  [RANK 2]
1. **One-liner.** A weight codec whose addressable units (row / expert / layer) decode in O(1) side-info,
   trading a small rate penalty for seeks.
2. **Exists / not.** Exists: random access for textures (2305.17105, 2407.00021) and lossless KV archive
   with O(1) access+append (2607.07144); block/LUT decode (FLUTE 2407.10960, DFloat11 2504.11651).
   Does **not** exist: sub-tensor random access into compressed LLM weights with a rate/seek trade-off.
3. **Who hurts / unlocks.** MoE serving (fetch only routed experts), on-device lazy/paged loading,
   browser WASM partial models, patch updates, memory < model size. Unlocks "compressed model that is
   still mmap-random-accessible like GGUF."
4. **Why now.** MoE dominates; models exceed RAM; GGUF already proves mmap expectations.
5. **Redundancy exploited.** Intra-block locality plus a *global-but-optional* predictor: blocks are
   self-contained keyframes with tiny local context; cross-block sharing is a separate side channel.
6. **Stage-1 (CPU).** `tiny-gpt2` and `gpt2`; compare `bytes/param` for sequential codec vs seek codec at
   granularities {layer, matrix-row, expert-block}; measure decode time per seek in ms and PPL delta = 0.
   Non-goals: GPU, lossy reconstruction.
7. **Decisive first experiment.** "Any single 1–4 MB unit decodes in ≤ X ms with ≤ 15% rate penalty vs the
   sequential codec on `gpt2`, bit-exact." Fail if either bound is missed.
8. **Risks.** Rate penalty may exceed benefit for dense models (only MoE/embedding fetch a few rows);
   AC/entropy coders naturally resist random access → may need ANS/static tables, hurting adaptivity.
9. **Grade.** PARTIAL GAP / NEW CATEGORY (exists next door in graphics/KV, not in weights).

### Candidate 3 — DecodeCostCodec: rate–energy-optimal sub-4-bit codec  [RANK 3]
1. **One-liner.** Learn a codebook/entropy model whose symbols are consumed directly by a fused GEMV,
   optimising (bits, decode-flops) jointly rather than bits alone.
2. **Exists / not.** Exists: trit-planes/ternary PTQ (2509.16989), LUT kernels (2407.10960, 2608.15602),
   DFloat11 GPU decode (2504.11651), EntroLLM Huffman decode (2505.02380). Does **not** exist: a single
   objective/format that reports and optimises the bits-vs-decode-energy Pareto for <4-bit, and that
   proves decode cost < compute saved.
3. **Who hurts / unlocks.** CPU/edge/phone LLM serving and energy-limited deployments; unlocks true
   sub-4-bit speedups instead of the current 4-bit floor.
4. **Why now.** Everyone documents the dequant/LUT tax; nobody puts it in the loss.
5. **Redundancy exploited.** Weight distribution entropy + hardware-friendly symbol structure
   (power-of-2/ternary) so entropy decode = shift/select, not LUT/gather.
6. **Stage-1 (CPU).** `tiny-gpt2`, synthetic N(0,σ) tensors; build a numpy arithmetic decoder fused with
   a dot product; sweep. Metrics: bits/param, PPL delta, **tokens/s at fixed bytes**, decode-flops/param.
   Non-goals: CUDA, integer-tensor-core kernels.
7. **Decisive first experiment.** "At equal PPL to 4-bit GPTQ-style baseline on `gpt2`, a <3.5 bpw codec
   delivers ≥1.2× CPU tokens/s." Fail if fused decode is not net-positive.
8. **Risks.** Very close to a quantization knob (danger of re-inventing LUT formats); CPU SIMD may invert
   the result; energy hard to measure honestly on a laptop.
9. **Grade.** PARTIAL GAP (honest: this is the most knob-like candidate).

### Candidate 4 — ReplayCodec: compression by deterministic training re-execution  [RANK 4]
1. **One-liner.** Store a compressed *training trajectory* (seed + data order + schedule + tiny checkpoint
   deltas) and regenerate weights by deterministic replay at decode time.
2. **Exists / not.** Exists: seed+basis+coeffs reconstruction (PRANC 2206.08464), supermask+seed
   (1510.00149, NeurIPS'19/'20), checkpoint delta (2306.11800). Does **not** exist: any work framing
   decompression as re-running a compressed training recipe to regenerate a model bit-exactly.
3. **Who hurts / unlocks.** Reproducibility/archival, "model = code," federated/edge where compute ≫ storage.
   Not useful for low-latency inference — decode cost ≈ training cost.
4. **Why now.** Deterministic CPU kernels (`torch.use_deterministic_algorithms`) are reliable; small
   models train in seconds; data audits increasingly require exact provenance.
5. **Redundancy exploited.** Kolmogorov framing: for small models the training procedure is a shorter
   description than the weight table; RNG + data-order streams compress hugely.
6. **Stage-1 (CPU).** Locally construct/train a 1–10M-param GPT on a fixed byte corpus with a fixed seed;
   store compressed {seed, shuffled index stream, schedule} + periodic deltas. Metrics: total bytes vs
   `.safetensors`; **bit-exact** reconstruction; decompression time (= replay time). Non-goals: >10M,
   multi-device, non-deterministic ops.
7. **Decisive first experiment.** "Regenerate the 10M model bit-exactly from ≤ 20% of its fp32 size, using
   only CPU files." Fail if replay is not bit-reproducible or the side-channel isn't smaller.
8. **Risks.** Compute-for-bits is usually a bad trade at inference; reproducibility breaks under any
   nondeterminism (threading, BLAS versions); data must be stored/compressed too.
9. **Grade.** NEW CATEGORY but HARD (high novelty, low deployment impact).

---

## 4. RANKING

| # | Candidate | Missing | Impact | CPU feasibility | Grade |
|---|-----------|---------|--------|-----------------|-------|
| 1 | ZooCodec (population/lineage) | Very high (0 results) | Very high (hubs) | High (tiny GPT zoo) | NEW CATEGORY |
| 2 | SeekCode (O(1) random access) | High | High (MoE/edge) | High | PARTIAL GAP |
| 3 | DecodeCostCodec (rate⊕energy) | Medium | High (sub-4-bit) | High | PARTIAL GAP |
| 4 | ReplayCodec (compute-for-bits) | High | Low–Medium | High | NEW but HARD |

Promote **Candidate 1**. Its decisive experiment is cheap, honest, and the gap is proven empty by
explicit zero-result queries; it is also the direct "gap next to" MCWC/DBMS, exactly as the brief asks.

## 5. KILL LIST (do not re-propose)
4-bit/2-bit/1-bit quant, GPTQ/AWQ/QuIP#/AQLM/VPTQ/BiLLM/PTQTP; SparseGPT/Wanda/pruning; ASVD/SVD-LLM/low-rank;
distillation; supermasks/Deep Compression; PRANC-type seed reconstruction; ZipNN/DFloat11/EntroLLM/ZipNN-FP8
lossless; DBMS/Delta-DCT/Inshrinkerator/LMC checkpoint deltas; MCWC cross-layer symmetry codec;
permutation+arithmetic coding of discrete nets (1804.02800); H2O/StreamingLLM/KIVI/Palu/KVTC/Fractal-KV;
L3C/L3TC/LMCompress/Nacrith learned compressors; FLUTE/DFloat11 kernels. Each has a URL above.

## 6. PRIMARY SOURCES (load-bearing)
- MCWC — https://arxiv.org/abs/2605.24754 (2026-05) · MCWC is the closest prior art; read before Candidate 1.
- Universal & Succinct Source Coding of DNNs — https://arxiv.org/abs/1804.02800 (2018-04).
- Git Re-Basin — https://arxiv.org/abs/2209.04836 (2022-09) · mechanism for Candidate 1 alignment.
- DBMS — https://arxiv.org/abs/2505.11344 (2025-05) · Delta-DCT — https://arxiv.org/abs/2503.06676 (2025-03).
- Inshrinkerator — https://arxiv.org/abs/2306.11800 (2023-06) · LMC — https://arxiv.org/abs/2505.09810 (2025-05).
- ZipNN — https://arxiv.org/abs/2411.05239 (2024-11) · DFloat11 — https://arxiv.org/abs/2504.11651 (2025-04).
- EntroLLM — https://arxiv.org/abs/2505.02380 (2025-05) · FP8/FP4 lossless — https://arxiv.org/abs/2508.19263 (2025-08).
- Fractal KV archive — https://arxiv.org/abs/2607.07144 (2026-07) · texture random access — https://arxiv.org/abs/2305.17105 (2023).
- FLUTE — https://arxiv.org/abs/2407.10960 (2024-07) · bandwidth/roofline — https://arxiv.org/abs/2406.01698 (2024-06).
- k-quant evaluation — https://arxiv.org/abs/2601.14277 (2026) · GGUF quant README — https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md .
