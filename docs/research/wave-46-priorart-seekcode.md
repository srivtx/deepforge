# Wave 46 — Prior-Art Attack: SeekCode (adversarial literature + patent review)

Date: 2026-09-19. Attacker role. Read `wave-46-candidates-c-compression.md` §3 Candidate 2 first.
Method: **>45 distinct queries** — arXiv full-text search (`arxiv.org/search`), the arXiv API and
`ar5iv` full texts, OpenAlex `title_and_abstract.search`, DOI pages, GitHub raw files, and Google
Patents XHR (via `r.jina.ai`, because `patents.google.com` blocks direct fetches). Direct retrieval
of every load-bearing abstract/full text named below. No repo code, no git, one file written. Every
claim carries a URL and a date; claims I could not date are marked as publication numbers only.

## Verdict: KILL

**Which clause has no located match:** only a *strictly sub-row/neuron* lossless random-access unit
(and, separately, browser/WASM weight paging) has no exact located object. Every load-bearing
clause is occupied. **Lossless** is occupied (ZipNN, DFloat11, Brevis, ZipServ, Huff-LLM, NeuZip,
LEXI, 2606.15789). **Bounded/O(1) random access into compressed weights** is occupied at
chunk/tile/tensor/expert granularity: 2606.15789 decodes *individual GEMM tiles* on the fly with a
lossless ANS codec (within 0.01–0.1 bits of Shannon), ZipServ gives *constant-time* fixed-length
decode, DFloat11 decodes *one weight matrix at a time*, ZipNN compresses *256 KB chunks
independently on disk*, and FluxMoE pages *losslessly compressed experts* per-tensor on demand.
**Better ratio than seekable-zstd at equal access cost** is over-delivered: seekable zstd's
random-access penalty is 6.57 % at 16 KiB (10.06 % at 4 KiB) [2609.16731], while the neural codecs
above reach 20–50 %+ reduction at the same granularity. **Serving/disk paging** is occupied by
ZipNN's "always compressed on the filesystem" vLLM/HF plugins, FluxMoE (vLLM), ZipServ (vLLM),
2606.15789 (SGLang), LLM-in-a-flash, NeuroPrefetcher and MawForge. G2 in the candidate doc ("No
random-access weight codec") is **false as a capability statement**. SeekCode is, at best, the
composition *neural lossless block entropy coder (ZipNN/DFloat11 machinery) + a seek table
(zstd-seekable machinery) + a chunk-size knob* — all three parts ship today. KILL by composition.

## Closest work (hostile table; ratios/access costs exactly as stated)

| Work | Venue/year | URL | What it does | Ratio / access cost | Clauses NOT done |
|---|---|---|---|---|---|
| **Shannon-bound lossless LLM weight codec** | arXiv 2606.15789, 2026-06 | https://arxiv.org/abs/2606.15789 | **Tile-level, on-the-fly lossless ANS** decode aligned to GPU GEMM tiling; SGLang, multi-GPU | bit-rates **within 0.01–0.1 bits of Shannon**; Qwen-14B batch 47→75, Mixtral-176B 20→95, up to 11× vs NeuZip/DFloat11 | granularity is a **tile**, not a row/neuron; no browser |
| **ZipServ** | arXiv 2603.17435, 2026-03 | https://arxiv.org/abs/2603.17435 | Lossless **fixed-length triple-bitmap** format, **constant-time parallel decode**, fused decompress-GEMM ("load-compressed, compute-decompressed"); vLLM | **≤30 % smaller**, 2.21× kernel speedup, 1.22× end-to-end | tile granularity; GPU-only |
| **DFloat11** | NeurIPS 2025, arXiv 2504.11651, 2025-04 | https://arxiv.org/abs/2504.11651 | Lossless entropy coding of BF16 exponents; **each weight matrix decompressed on the fly** and discarded after the GEMV; transformer-block-level | **30 % size**, bit-exact, 2.3–46.2× vs CPU offload | tensor granularity, not sub-tensor |
| **ZipNN** | arXiv 2411.05239, 2024-11 | https://arxiv.org/abs/2411.05239 | Lossless exponent Huffman + byte-grouping; **256 KB chunks compressed independently**; stays compressed on disk; vLLM/safetensors plugin | **33 % often >50 %** | no seek table exposed; no sub-256 KB access |
| **FluxMoE** | arXiv 2604.02715, 2026-04 | https://arxiv.org/abs/2604.02715 | **Expert paging**: lossless selective Huffman of expert exponent bits, **per-tensor** paging, on-the-fly GPU decompression; vLLM | **~20 %** BF16; up to 7.2× vLLM throughput | tensor/expert granularity; not bit-exact rows |
| **Compression-Aware Memory Controller** | arXiv 2503.18869, 2025-03 | https://arxiv.org/abs/2503.18869 | Lossless **LZ4/ZSTD block compression of weights + KV**, bit-plane placement, **partial-plane fetch / partial decompression** into a memory controller | **25.2 %** weight footprint, −30 % load latency | DRAM-controller path, not disk/browser; plane granularity |
| **Brevis** | arXiv 2608.02162, 2026-08 | https://arxiv.org/abs/2608.02162 | Lossless tensor compression as **synthesized per-tensor programs**, bit-exact; beats ZipNN, DFloat11, zstd, gzip | **33.93 %**, 6.61 GB/s decompress | per-tensor; no sub-tensor seeks |
| **LEXI** | arXiv 2603.15589, 2026-03 | https://arxiv.org/abs/2603.15589 | Lossless exponent Huffman, **compressed weights JIT-decompressed near compute** (LUT decoders) | −33–45 % inter-chiplet traffic; 0.09 % area | chiplet/tile granularity |
| **Huff-LLM** | arXiv 2502.00922, 2025-02 | https://arxiv.org/abs/2502.00922 | End-to-end lossless; weights stored compressed **in cloud, disk, main memory, on-chip buffers** | memory + bandwidth + latency/energy gains (no ratio stated) | no random-access API stated |
| **NeuZip** | arXiv 2410.20650, 2024-10 | https://arxiv.org/abs/2410.20650 | Entropy-based lossless weight coding; Llama-3 8B training 31 GB→16 GB, inference >2× less memory | near-lossless | sequential stream |
| **SeedLM** | arXiv 2410.10714, 2024-10 | https://arxiv.org/abs/2410.10714 | **Per-block PRNG seeds**; each block reconstructs independently (natural O(1) block access) | 3–4 bit | **lossy** (not lossless) |
| **zstd seekable format** | spec v0.1.0, 2017 | https://github.com/facebook/zstd/blob/dev/contrib/seekable_format/zstd_seekable_compression_format.md | Frames compressed **independently** + seek table; sub-ranges decompress without whole document | penalty **6.57 % @16 KiB, 10.06 % @4 KiB** [2609.16731] | generic, not neural/tensor-aware |
| **ACEAPEX / position-invariant RA** | arXiv 2606.24531 & 2606.18900, 2026-06 | https://arxiv.org/abs/2606.24531 · https://arxiv.org/abs/2606.18900 | Bit-perfect seek through **ANS entropy + LZ77 match layers** via one absolute-offset coordinate; GPU pipeline | **1.632 % @16 KiB (5.33 % @4 KiB)**; **0.334 ms/16 KB** seek; GPU 0.362 ms | generic data, not weights |
| **The Price of Random Access** | arXiv 2609.16731, 2026-09 | https://arxiv.org/abs/2609.16731 | Measures the density a random-access unit costs across four formats; 17 rejected designs | 1.632 % vs 6.57 % @16 KiB (see above) | general corpus; **0 mentions of neural/weight/tensor/model** |
| **RLZ access-time tradeoffs** | arXiv 1602.08829, 2016-02 | https://arxiv.org/abs/1602.08829 | Random access into RLZ-compressed archives vs block-adaptive priming; HDD/SSD | rate dominates seek cost on HDD | generic text/log data |
| **RAGE** | IEEE ICIP 2024, arXiv 2402.05974 | https://arxiv.org/abs/2402.05974 | Generalized-dedup image codec, **pixel-level random access**, lossless+lossy | seek **9.9–40.6 ns** | images, not weights |
| **NeaTS** | arXiv 2412.16266, 2024-12 | https://arxiv.org/abs/2412.16266 | **Randomly-accessible learned** compression of time series, lossless/lossy | up to +14 % ratio over SOTA function codecs | time series |
| **Fractal KV archives** | arXiv 2607.07144, 2026-07 | https://arxiv.org/abs/2607.07144 | **Lossless O(1) random access + O(1) append** onto quantized KV symbol streams | 36–54× archived KV | KV, not weights |
| **LLM in a flash** | arXiv 2312.11514, 2023-12 | https://arxiv.org/abs/2312.11514 | On-demand **row/neuron fetch from flash**, windowing + row-column bundling | 4–5× / 20–25× speedup | uncompressed weights |
| **NeuroPrefetcher** | arXiv 2608.22643, 2026-08 | https://arxiv.org/abs/2608.22643 | Storage-backed **delta prefetch of active neuron rows** from NVMe | 82–85 % row persistence; 7.9–12× | no lossless codec claim |
| **PowerInfer** | arXiv 2312.12456, 2023-12 | https://arxiv.org/abs/2312.12456 | Hot/cold-neuron split, cold neurons computed on CPU | 11.69× | lossy/raw weights |
| **HOBBIT** | arXiv 2411.01433, 2024-11 | https://arxiv.org/abs/2411.01433 | Mixed-precision **expert offloading**, token-level dynamic loading | | quantization = lossy |
| **RotaryQuant** | arXiv 2608.08081, 2026-08 | https://arxiv.org/abs/2608.08081 | 2–4 bit experts + **LRU expert paging** on consumer HW | fits 120B MoE in 32 GB | lossy |
| **MawForge** | arXiv 2607.09686, 2026-07 | https://arxiv.org/abs/2607.09686 | Disk-resident MoE, **routed expert tensors materialized into a bounded cache on demand** | bounded-execution study | mixed quantization |
| **GGUF k-quants / block quant** | llama.cpp, 2023– | https://github.com/ggml-org/llama.cpp/pull/1684 | Per-block scales/types; every block decodes independently; mmap | 2–6 bits/param; O(1) per block | **lossy** |
| **GPTQ / AWQ / AQLM** | 2022–2024 | https://arxiv.org/abs/2210.17323 · https://arxiv.org/abs/2306.00978 · https://arxiv.org/abs/2401.06118 | Per-group scales / per-block codebooks → **independent block decode is already O(1)** | 4/4/~2 bpw | **lossy** |
| **ZipLLM / BitX** | arXiv 2505.06252, 2025-04 | https://arxiv.org/abs/2505.06252 | Lossless per-tensor XOR+zstd delta with **tensor-level dedup** (per-tensor fetch) | 54 % storage cut on 3,048 models | no sub-tensor access; family-scoped |
| **US11271588B2 / US11146283B2** | priority 2021-04-21 / 2020-04-13 | https://patents.google.com/patent/US11271588B2/en · https://patents.google.com/patent/US11146283B2/en | Hardware data compressors named **"…compression with random access"** (zero-removal, bit-masks, row-pointers) | | generic compressor, not neural weights |
| **Reconfigurable memory compression for DNNs** | US11625584B2 | https://patents.google.com/patent/US11625584B2/en | Compressed weight set + tabulation-hash selection for on-chip DNN memory | | hashed weight sharing, not lossless block codec |

## Clause-by-clause

**(a) Lossless (bit-exact) reconstruction.** *Closest:* ZipNN, DFloat11, Brevis, ZipServ, Huff-LLM,
NeuZip, LEXI, 2606.15789. *Delta claimed by SeekCode:* none — it is the baseline every competitor
already meets. *Assessment:* **KNOWN / occupied.** ZipNN verifies per-tensor md5 in its safetensors
container; DFloat11 is "bit-for-bit identical"; Brevis "preserves every source byte".

**(b) O(1)/bounded random access.** *Closest:* 2606.15789 (tile-level on-the-fly ANS), ZipServ
(constant-time fixed-length decode), DFloat11 (per-weight-matrix decode), ZipNN (256 KB chunk
independence), FluxMoE (per-tensor expert paging), 2503.18869 (partial-plane fetch), Fractal KV
(O(1) lossless), plus the generic seekable formats (zstd-seekable, ACEAPEX, RAGE). *Delta that
would be new:* lossless access at **sub-row/neuron** granularity with an explicit, published
rate–seek bound. *Assessment:* **new-known-partial, and thin.** It is a granularity choice, not a
mechanism: per-block independence is exactly what block codecs give, and the density penalty of
choosing 16 KiB blocks is measured at 1.6–6.6 % across four formats [2609.16731]. No located work
proves a *row-level lossless* seek; but the access pattern (sparse-neuron fetch) is already served
at row granularity by lossy block formats + LLM-in-a-flash/NeuroPrefetcher, and MoE fetch is
served at tensor granularity by ZipNN/DFloat11/FluxMoE.

**(c) Better ratio than seekable-zstd at equal access cost.** *Closest:* 2606.15789 is within
0.01–0.1 bits of Shannon at tile granularity; ZipNN 33–50 %; DFloat11 30 %; Brevis 33.93 %;
ZipServ 30 %. *Delta:* beat *those* at row granularity with a measured Pareto curve. *Assessment:*
**known/occupied at block-and-above granularity; the residual sub-row delta is unmeasured and
likely negative.** The candidate's stated baseline (seekable-zstd) is already two generations
stale: the real baseline is a per-16-KiB-independent neural entropy coder, and the best located
one is entropy-optimal to 0.1 bits.

**(d) Disk/browser paging integration.** *Closest:* ZipNN ("model is always compressed on the
filesystem"; HF/safetensors + vLLM plugins), FluxMoE (vLLM expert paging), ZipServ (vLLM),
2606.15789 (SGLang), LLM-in-a-flash (flash), NeuroPrefetcher (NVMe), MawForge (disk expert
materialization), ZipLLM (hub storage). *Delta:* **browser/WASM lazy paging** of compressed
weights (no located exact object). *Assessment:* **new-known-partial for browser only** — a
deployment wrapper around an existing codec, not a codec capability.

## Required margin vs baselines (exact numbers)

- **seekable zstd:** independent-frame penalty vs plain zstd = **6.57 % (16 KiB), 10.06 %
  (4 KiB)**; the best generic absolute-offset format is **1.632 % (16 KiB), 5.33 % (4 KiB)** and
  seeks **0.334 ms / 16 KiB** [2609.16731, 2606.24531, 2606.18900]. So "equal access cost" already
  means ≈1.6 % overhead, not 6.57 %.
- **per-tensor / per-chunk lossless neural codecs:** ZipNN **33 %–>50 %**, DFloat11 **30 %**,
  Brevis **33.93 %**, ZipServ **≤30 %**, 2606.15789 **within 0.01–0.1 bits of Shannon**. At equal
  16 KiB–256 KB granularity a GO must be **≤0.85× the best of these** (≥15 % bits/param margin)
  **and** seek ≤0.334 ms/16 KiB **and** decode bit-exact.
- **block quant (4-bit):** ≈**4.0–4.25 bpw** (≈0.25× fp32, 0.50× bf16) with O(1) per-group decode
  [GGUF; GPTQ/AWQ/AQLM]. For the MoE/edge *paging* use case this is the deployed baseline; a
  lossless Seecode at ~1.0–1.5 bits/param-equivalent cannot compete on footprint, only on
  bit-exactness.
- **Honest margin assessment:** the ≥15 %-over-Shannon-adjacent margin required by (c) is **not
  plausible** — 2606.15789 already sits 0.01–0.1 bits from the entropy floor while decoding
  individual tiles on the fly.

## Strongest hostile argument (and whether it survives)

**Hostile (weak form):** *"Block quantization already gives O(1) random access, and seekable-zstd
already gives lossless random access — SeekCode's two primitives are each shipped."* This form
**does not fully survive**: quantization is lossy, so it fails clause (a); seekable-zstd is a
generic byte codec, so (c) is genuinely contestable.

**Hostile (strong form, which does survive):** *"The capability is already composed. A lossless
neural entropy coder with independently decodable tile-level units exists (2606.15789, ZipServ,
DFloat11, ZipNN, FluxMoE); generic seekable framing with a measured 1.6–6.6 % access penalty
exists (zstd-seekable, ACEAPEX, 2609.16731); per-tensor/lossless weight storage and on-demand
serving exists (ZipNN plugins, FluxMoE/vLLM, ZipLLM). Pick a block size, store an offset index,
and 'SeekCode' is a config knob, not a category. The only unoccupied coordinate — sub-row lossless
seek — buys a granularity nobody's disk access pattern needs and costs a density penalty the
generic literature already bounds."* Under the wave's own honesty contract (a mere composition is
not a candidate) this **survives and kills the standalone claim.**

## If KILL — best remaining fallback among all wave-46 candidates

Both compression leads are now dead: **ZooCodec** (killed in `wave-46-priorart-zoocodec.md`) and
**SeekCode** (this file). Within the compression doc the remaining options are weak — Candidate 3
(DecodeCostCodec) is self-admittedly knob-like and crowded by FLUTE/DFloat11/LUT-kernel work;
Candidate 4 (ReplayCodec) is high-novelty but low-deployment-impact. **Best remaining fallback
across the wave: CSM — Certified State-Machine layer (wave-46 candidates-d-architecture, rank 3),
the fallback already endorsed in `wave-46-priorart-verm.md`.** Reasons: (1) its contract — a
replayable trace of discrete state transitions (`s ← g·s`) — is *not* occupied by the
verifiable-inference stack (which certifies arithmetic/linear algebra, not finite-state
semantics) nor by RWKV-7; (2) the verification is a genuine independent check (not a re-hash),
cheap on CPU; (3) it is the least crowded of the architecture four and runs on S5/parity/
flip-flop synthetics within the ≤1 h CPU budget. If the wave insists on staying on the
compression/serving axis, the in-domain fallback is **DecodeCostCodec**, but its expected margin
over the LUT/entropy-decode literature is the thinnest of the set.

## Query / exhaustion log (all run 2026-09-19)

arXiv full-text: `random access compression`; `seekable compression`; `random access
decompression`; `compressed weights random access`; `on-demand weight loading`; `weight
streaming`; `compressed weight`; `paged neural network weights`; `SSD inference`; `partial
decompression`; `selective decompression`; `random access model serving`; `paged attention`;
`expert offloading`; `expert paging`; `succinct data structures`; `compressed data structures`;
`relative Lempel-Ziv`; `random access neural compression`; `lossless random access`; `random
access compressed model`; `independent block decoding`; `partial model loading`; `seekable
archive`; `blocked gzip random access`; `row-wise weight compression`; `expert-level compression`;
`weight matrix decompression on demand`; `ZipNN lossless`; `random access LLM weights`; `lossless
compression weights inference serving`; `random access sub-tensor`; `random access entropy coding
rANS`.
OpenAlex `title_and_abstract.search`: `random access compressed neural network weights` (35);
`random access model compression` (883); `on-demand weight decompression` (94); `block-wise
weight compression lossless` (7); `seekable compression random access` (74); `partial
decompression neural network` (32); `compressed weights paging inference` (31); `lossless
compression random access model weights` (1); `compressed weight block random access inference`
(4); `random access decompression neural network` (18).
Google Patents XHR (via `r.jina.ai`): `random access compressed neural network weights`;
`seekable compression neural network`; `selective decompression model weights`; `paged weight
storage neural network inference`; `on-demand weight decompression neural network`; `random
access model weight compression`; `block-wise decompression neural network weights random
access`; `compressed neural network weight random access decompression`; `expert paging
compressed weight mixture of experts inference`.
Full texts/abstracts fetched: 2606.15789, 2603.17435, 2604.02715, 2504.11651, 2411.05239,
2608.02162, 2603.15589, 2503.18869, 2609.16731, 2606.24531, 2606.18900, 2502.00922, 2410.20650,
2410.10714, 1602.08829, 2412.16266, 2402.05974, 2607.07144, 2312.11514, 2312.12456, 2411.01433,
2608.08081, 2607.09686, 2608.22643, 2505.06252, 2505.02380, 2508.19263, 2412.16266, 2503.18869,
zstd seekable spec, US11271588B2, US11146283B2, US11625584B2, KR102904548B1.
**Residual uncertainty:** a strictly sub-row lossless weight seek with a published Pareto curve
may exist under different vocabulary; if it does, it *confirms* rather than rescues the KILL
(it would occupy the last open coordinate). `websearch`/`mcp.exa.ai` returned HTTP 429 on every
attempt and `patents.google.com` blocked direct fetches, so the patent sweep relied on
`r.jina.ai`; Espacenet/USPTO/PatentsView/FPO were unreachable.
