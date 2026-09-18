# Wave 46 — Prior-Art Attack: ZooCodec (adversarial literature + patent review)

Date: 2026-09-19. Attacker role. Read `wave-46-candidates-c-compression.md` §3 Candidate 1 first.
Method: **38 distinct queries** (arXiv title/abstract search via `arxiv.org/search`, OpenAlex
`title_and_abstract.search` + `fulltext.search`, Google Patents XHR, Bing), with direct retrieval
of ZipLLM's full text and the load-bearing abstracts. Patent families searched separately.
No repo code touched, no git, one file written. Every claim below carries a URL and a date.

## Verdict: KILL

ZooCodec's headline capability — *"compress an entire family of finetunes of one base as one
joint stream, exploiting the shared base and cross-model redundancy, losslessly"* — is **already
shipped and evaluated at scale**. **ZipLLM/BitX** (arXiv:2505.06252, v1 2025-04-30, v3 2025-11-08)
does exactly this on **3,048 real Hugging Face LLMs**: it clusters finetunes by a bit-distance
metric, deduplicates at tensor level, and losslessly XOR-delta compresses each variant against its
family base, reporting **54.1% storage reduction, >20 points over prior SOTA**. **TStore**
(arXiv:2604.17104, 2026-04-18) does tensor-fingerprint cross-model dedup+compression for a model
hub. A dense 2022–2026 literature already jointly compresses multi-model systems (RQT ACL'25;
Differential Weight Quantization TMM'22; Joint Compression of Multi-model Systems 2025; J-Tucker
2024; MTZ NeurIPS'18; RanDeS 2025). The four claim clauses break down as: **(a) joint family stream
— KNOWN/occupied; (d) lossless family reconstruction — KNOWN/occupied; (c) entropy coding — KNOWN
(zstd on XOR stream in ZipLLM; predictive arithmetic coding across checkpoints, arXiv:2506.12000);
(b) finetune-to-finetune permutation alignment — no located match**, but the premise is empirically
false for same-base finetunes (ZipLLM §3.4.3: within-family bit differences concentrate in low
mantissa bits and the sign bit almost never flips, i.e. members are already coordinate-aligned), so
this unoccupied clause buys ≈0 bits. The candidate doc's "0 results" gap is a *phrasing* gap, not a
capability gap. **No located work does the literal (b) mechanism, but it is the only surviving
clause and it is a mechanism transplant with a likely-negative margin.** KILL as a standalone claim.

## Closest work (hostile table)

| Work | Venue / year | URL | What it does | Clause matched | Clauses NOT done |
|---|---|---|---|---|---|
| **ZipLLM / BitX** | arXiv 2505.06252, v1 2025-04-30 | https://arxiv.org/abs/2505.06252 | Family clustering by bit-distance + tensor dedup + **lossless XOR delta vs base**, 54.1% on 3,048 HF LLMs, >20 pts over SOTA | **(a) joint family stream, (d) lossless**, (c) zstd on XOR | (b) no permutation alignment; per-model XOR, not a shared learnt entropy model |
| **TStore** | arXiv 2604.17104, 2026-04-18 | https://arxiv.org/abs/2604.17104 | Tensor-level fingerprinting + clustering for redundancy **across models** in AI model hubs | (a), (d) systems-level | (b); no learnt entropy model |
| **RQT** | ACL Findings 2025 | https://doi.org/10.18653/v1/2025.findings-acl.554 | Hierarchical residual quantization for **multi-model** compression | (a) joint multi-model representation | (d) lossy; (b) none |
| **Differential Weight Quantization** | IEEE TMM 2022 | https://doi.org/10.1109/tmm.2022.3208530 | Quantizes weight **differences across models** sharing structure | (a), (b)-lite (shared structure) | (d) lossy; shared entropy model |
| **Joint Compression of Multi-model Systems** | Springer 2025 | https://doi.org/10.1007/978-3-031-93697-5_13 | Joint edge compression of a set of models | (a) | (b); lossless; family alignment |
| **MTZ (Multi-Task Zipping)** | NeurIPS 2018 | https://arxiv.org/abs/1805.09791 | **Cross-model compression** by layer-wise **neuron sharing** across pre-trained nets | (a), (b) cross-model neuron correspondence | (d) lossy; entropy coding; family-of-finetunes |
| **RanDeS** | arXiv 2505.11204, 2025-05-16 | https://arxiv.org/abs/2505.11204 | Multi-model compression of same-base finetunes via random orthogonal delta decorrelation | (a) multi-model same-base deltas | (d) lossy serving; lossless; permutation alignment |
| **Task Vector Bases** | arXiv 2502.01015, 2025 | https://arxiv.org/abs/2502.01015 | Compress a **set of task vectors** into a shared basis | (a), (c) shared representation | (d) lossy; family entropy coding |
| **CF-STAR** | Complex Intell. Syst. 2026 | https://doi.org/10.1007/s40747-026-02238-y | Highly compressible adapters for model merging via centralized task vectors | (a) adapter population | (d) lossy; alignment |
| **ComPEFT** | arXiv 2311.13171, 2023 | https://arxiv.org/abs/2311.13171 | Sparsify+quantize PEFT updates for communication | (a) adapter population compression | (d) lossy; family clustering |
| **DNN Delta Compression (snapshots + FL)** | IEEE TPDS 2023 | https://doi.org/10.1109/tpds.2022.3230840 | Quantization-based delta compression for **model snapshots and federated updates** | (a) cross-snapshot deltas, (c) coding | (b); lossless; family entropy model |
| **Predictive checkpoint arithmetic coding** | arXiv 2506.12000, 2025-06-13 | https://arxiv.org/abs/2506.12000 | Previous checkpoint as **context for arithmetic coding**; prediction + pruning/quant | (c) cross-state entropy coding | (b) alignment; multi-finetune family |
| **ExCP / Gauss** | arXiv 2406.11257 (2024); Zenodo 19718124 (2026) | https://arxiv.org/abs/2406.11257 | Extreme LLM **checkpoint** compression (weight+momentum joint); 2026 "Gauss: LLM Checkpoint Compression" | (d)-family checkpoint coding | (b); family-of-finetunes |
| **MCWC** | arXiv 2605.24754, 2026-05-23 | https://arxiv.org/abs/2605.24754 | **Permutation-symmetric block alignment + layer-sequential predictor + learnt entropy model** (single net) | **(b) alignment mechanism, (c) learnt entropy**, (d-ish) | Cross-**model**/family; lossless bit-exact not claimed |
| **Universal Succinct Source Coding of DNNs** | arXiv 1804.02800, 2018-04 | https://arxiv.org/abs/1804.02800 | **Permutation-invariance quotient + arithmetic coding**, lossless, decode-without-decompress | (b) symmetry for coding, (d) lossless | Cross-model; finetune family |
| **MC-SMoE (Merge, then Compress)** | ICLR 2024 | https://arxiv.org/abs/2310.01334 | **Neuron permutation alignment** across experts before merging+low-rank compression | (b) neuron permutation alignment **for compression** | Cross-finetune; lossless; entropy model |
| **Kernel Symmetry joint compression** | arXiv 2604.17371, 2026-04-19 | https://arxiv.org/abs/2604.17371 | DoF codec sends only symmetry-unique kernel coefficients; deterministic reconstruction | (b) symmetry-for-compression, (d) near-lossless | Cross-model; finetune family; entropy coder |
| **ZipNN** | arXiv 2411.05239 (2024-11); IEEE Cloud | https://arxiv.org/abs/2411.05239 | Single-model **lossless** exponent/Huffman codec, ~33–>50% | (d) lossless baseline | Family; cross-model |
| **Inshrinkerator / LMC / DBMS / Delta-DCT** | 2023-06 / 2025-05 / 2025-05 / 2025-03 | https://arxiv.org/abs/2306.11800 · https://arxiv.org/abs/2505.09810 · https://arxiv.org/abs/2505.11344 · https://arxiv.org/abs/2503.06676 | Per-checkpoint / per-pair delta quantization | (d) lossy checkpoint deltas | Family-joint; lossless; alignment |
| **BitDelta / DeltaDQ / ME-Switch / D-QRELO** | NeurIPS'24 / 2024-10 / 2024-06 / 2026-04 | https://arxiv.org/abs/2402.10193 · https://arxiv.org/abs/2410.08666 · https://arxiv.org/abs/2406.09041 · https://arxiv.org/abs/2604.16940 | Multi-tenant delta compression of many finetunes of one base | (a) same-base population, (d)-lossy | Lossless; permutation alignment; shared entropy |

## Clause-by-clause

**(a) Joint family stream (N finetunes as one coded unit).** *Closest:* ZipLLM/BitX (family
clustering + tensor dedup + lossless delta, 3,048 models), TStore (tensor-centric hub),
RQT/TMM'22/Joint-Multi-model, RanDeS, Task Vector Bases, MTZ. *Delta claimed by ZooCodec:* a single
learnt entropy model shared by the family and a per-member "motion field." *Assessment:* **KNOWN /
occupied.** The candidate doc's own gap statement (G1, "no cross-model/population codec") is
falsified by ZipLLM 2025 and TStore 2026. The only sliver not done is the *single shared entropy
coder over the whole family*, which is (c), not a new stream.

**(b) Cross-model permutation / neuron alignment for compression.** *Closest:* MCWC (permutation
blocks within one net), 1804.02800 (permutation-invariance quotient, single net), MC-SMoE (neuron
permutation alignment of experts before compression), Kernel-Symmetry DoF codec (2026), Git
Re-Basin (motivation only). *Delta:* **no located work aligns independently finetuned same-base
members to each other for coding.** *Assessment:* **new as a literal mechanism, but partial/weak.**
Two things undercut it: (1) the mechanism is a transplant of MCWC/MC-SMoE alignment to the
cross-model axis; (2) the premise "members look randomly relabelled" is false — ZipLLM's
measurement (§3.4.3, Fig. 5) shows same-family deltas sit in low mantissa bits with a
near-never-flipping sign, and Q1'25 HF data show same-family models are already bit-similar.
Finetunes from one base stay in the base's coordinate chart; permutation symmetry separates
independently initialized training runs, not SGD perturbations of a shared init.

**(c) Entropy coding on the shared representation.** *Closest:* MCWC learnt rate–distortion entropy
model; ZipLLM zstd-over-XOR; 2506.12000 predictive arithmetic coding with prior-checkpoint context;
1804.02800 arithmetic coding to the entropy bound; ZipNN/DFloat11/EntroLLM; "BigSmall: … at the
Joint Entropy Floor" (Zenodo 2026, non-peer-reviewed). *Delta:* *shared learnt entropy model across
N members.* *Assessment:* **KNOWN mechanism; the "shared across family" instantiation is partial.**
Given ZipLLM already drives the XOR stream near compressibility with zstd, the marginal gain of a
learnt shared model must be measured, not assumed.

**(d) Bit-exact lossless family reconstruction.** *Closest:* ZipLLM/BitX (lossless, exact recovery,
family-wide), ZipNN (lossless), 1804.02800 (lossless), checkpoint codecs (Inshrinkerator/LMC/ExCP,
near-lossless). *Assessment:* **KNOWN / occupied.** Lossless is ZipLLM's explicit design
constraint; it is not a differentiator.

## Strongest hostile counterargument (and survival)

*"ZooCodec is ZipLLM + MCWC + 2506.12000. ZipLLM already clusters the family, tensors-dedupes, and
losslessly XOR+zstd-compresses every member against the base at 54% on 3,048 real models. MCWC and
1804.02800 already do permutation-symmetry alignment feeding a learnt entropy coder; MC-SMoE and
Kernel-Symmetry already align/exploit symmetry specifically to make weights compressible; 2506.12000
already uses a previously coded state as arithmetic-coding context. Swap 'layers' for 'members',
reuse zstd or the MCWC entropy model, and the paper writes itself. The only new token is
'population', and the candidate's own required baseline (base + Σ zstd(delta)) is two generations
stale — ZipLLM's baseline is not zstd, it is a bit-distance-clustered lossless XOR codec."*

**Does it survive?** Only at one narrow mechanism-level point: no located system runs *mutual
permutation alignment between independently finetuned same-base members* before *joint* entropy
coding. It survives **weakly**, and only as: *"a family is first brought into one permutation/
scaling chart by solving a joint cross-member alignment, then encoded with one shared entropy model
over the aligned residuals."* Even then it must clear a real bar, because the alignment almost
certainly resolves to near-identity (same-base finetunes share coordinates) and the permutation
side-information (~n·log n bits/layer) must compress below the bits it saves. **Required margin:**
at bit-exact reconstruction, ≤85% of the *ZipLLM/BitX-style* family baseline (base + Σ [bitcast
XOR + zstd]), i.e. a ≥15% bits/param margin over the current family SOTA — not over plain zstd.
No such margin is demonstrated; absent it, the claim is dead.

## Decisive Stage-1 experiment (CPU-only, small team)

**Data.** Base `gpt2` (124M) + 8–16 finetunes. Prefer real checkpoints (tiny LoRAs/Wizard-small
variants, or PEFT LoRAs trained ~10–30 min each on CPU); include a synthetic arm with
θᵢ = θ_base + εᵢ, εᵢ ~ N(0, σ²) for three σ (this arm *favors* ZooCodec — no alignment needed either
way).
**Baselines (must include the strong ones, not zstd-only):**
1. `zstd(θᵢ)` per member (raw-weight baseline);
2. `base + Σ zstd(θᵢ − θ_base)` (the candidate's stated baseline);
3. `base + Σ [bitcast-XOR(θᵢ, θ_base) → zstd]` (**the real family baseline: BitX-style**);
4. `base + Σ ZipNN(θᵢ)` (single-model lossless SOTA).
**ZooCodec arm.** Cross-member alignment search (Git Re-Basin-style permutation ± per-row scaling)
→ identity-or-permutation field + shared arithmetic/ANS model over aligned residuals; store the
exact inverse permutation so reconstruction is bit-exact.
**Metrics.** whole-family bytes (= bits ÷ (16·param) for the family), **bit-exact SHA-256 of the
reconstructed `state_dict`**, decompress MB/s, alignment wall-clock, and *alignment side-info bytes
alone* (the make-or-break number).
**Pass/fail.** PASS iff total family bytes ≤ **0.85 × baseline (3)** at bit-exact reconstruction,
with alignment side-info < 5% of total, in <2 h CPU. FAIL otherwise.
**Likely outcome: FAIL to show a margin.** Two reasons with citations: (i) same-base finetunes are
already coordinate-aligned (ZipLLM §3.4.3), so the solved permutation is ~identity and the search
adds side-info for ~0 residual reduction; (ii) XOR+zstd is already near the achievable rate on the
mantissa-heavy residual (ZipLLM reaches 54% end-to-end), leaving little headroom for a shared learnt
model to recover. The synthetic arm cannot rescue this — it is precisely the case with no
permutation structure to find.

## Patents (Google Patents, retrieved 2026-09-19)

- **WO2021178981A9** — "Hardware-friendly multi-model compression of neural networks," Innopeak
  Technology, priority 2021-05-03. Multi-model pruning/compression. (a)-occupied.
- **US20210209474A1** — "Compression method and system for frequent transmission of deep neural
  network," Peking University, priority 2018-05-29. Explicitly *exploits redundancy among DNN models*
  for transmission compression. Direct (a)/(d)-family anticipation.
- **CN113033763A** — "A Multi-Model Merging Compression Method," priority 2019-12-09. (a).
- **CN121257632A** — "Pruning-based multi-model compression deployment method…," priority
  2025-09-28. (a).
- **US20240273397A1 / WO2024173449A1** — "Machine learning model lineage tracking," Microsoft,
  priority 2023-02-14. Content-based hashing **+ delta compression** to shrink checkpoint storage
  across a lineage. Direct (a)/(d) family-storage anticipation.
- **CN113487025A** — "Intelligent compression storage method… for neural network checkpoint,"
  Zhejiang University, priority 2021-07-02. (d).
- **US20250266846A1** — "System and Method for Network Weight Compression and Intrusion Detection,"
  AtomBeam, priority 2023-02-16. Weight compression (single-model).

## If KILL — best fallback among the other wave-46 candidates

**SeekCode (Candidate 2, RANK 2).** It is the cleanest remaining gap: O(1) randomly-accessible
*sub-tensor* compressed weight units with a stated rate/seek trade-off. OpenAlex/arXiv searches find
random access only for textures (arXiv:2305.17105) and lossless KV archives (arXiv:2607.07144), never
for LLM weight blocks — no joint/delta-family paper occupies it. Candidate 3 (DecodeCostCodec) is
self-admittedly knob-like and crowded by LUT-kernel work; Candidate 4 (ReplayCodec) is high-novelty
but low-impact and partially anticipated by PRANC (2206.08464). Promote SeekCode.

## Corrections / adversarial notes on `wave-46-candidates-c-compression.md`

- §1.7/§2 G1 claim "no cross-model / population codec … 0 results" is **false as a capability
  statement**. Exact-phrase searches return 0, but ZipLLM (2505.06252), TStore (2604.17104), RQT
  (ACL'25), RanDeS (2505.11204), Differential Weight Quantization (TMM'22), MTZ (1805.09791),
  Task Vector Bases (2502.01015) and CF-STAR (2026) jointly compress multi-model finetune families.
  The doc's Gap-1 is a vocabulary artifact.
- §3 C1 decisive experiment baseline "base + Σ zstd(θᵢ−θ_base)" is **not SOTA**; the SOTA family
  baseline is a BitX-style XOR+zstd codec + family clustering (ZipLLM). Any margin claim must be
  against that, or it is measuring the wrong thing.
- §3 C1 premise "independently finetuned members look randomly relabelled" is contradicted by
  ZipLLM §3.4.3 (same-family deltas are low-mantissa, sign ~stable). Remove or empirically qualify.
- The doc correctly flags MCWC as closest single-model prior art; it under-weights MC-SMoE
  (ICLR'24, neuron-permutation alignment *for compression*), 1804.02800 (permutation+arithmetic
  lossless), and 2506.12000 (cross-state predictive arithmetic coding) — together they cover
  ZooCodec's (b) and (c) mechanisms nearly completely.

## Query / exhaustion log (all run 2026-09-19; no direct match for clause (b) cross-model)

arXiv: `"model zoo" compression finetune` (0); `"model zoo" compression` (5, none about finetune
families); `"multi-model compression"` (RanDeS); `"adapter zoo" compression` (0); `"LoRA" population
compression` (0); `"cross-model" redundancy weights` (MTZ); `"fine-tuned models" compression
storage`; `"model deduplication"`; `"delta compression" fine-tuned LLM`; `"model hub" storage
compression`; `"permutation alignment" compression` (MC-SMoE); `"merge" "compress" fine-tuned models
delta`; `neuron alignment compression weights`; `"multi-tenant" fine-tuned models storage`;
`"arithmetic coding" neural network weights` (1804.02800, 2506.12000); `"model lineage" compression`;
`"Re-Basin" compression` (0); `"permutation symmetry" model compression`; `"model family" compression
delta`; `"LoRA" adapter storage compression`; `"Git Re-Basin"` (Git Re-Basin + merges).
OpenAlex title/abstract: `"model zoo compression"` (0); `"population compression"` (all biomedical);
`"permutation alignment"` (mostly BSS/speech, one 2026 speech paper); `"multi-model compression"` (7:
RQT, TMM'22, RanDeS, Joint-Multi-model, Hybrid-Multi-Task); `"cross-model redundancy"` (3, none DNN
coding); `"shared entropy model"` (0); `"adapter zoo"` (0); `"model deduplication"` (6); `"checkpoint
compression"` (34 incl. ExCP, Gauss, Inshrinkerator); `"neuron permutation" + compression` (1:
MC-SMoE); `"task vector" + compression` (25 incl. Task Vector Bases, CF-STAR, Auto-FlexSwitch,
Rate-Distortion for Model Merging); `"model family" + compression`; `"federated" + "delta
compression"` (TPDS'23); `"fine-tuned" + "delta compression"` (ZipLLM, DeltaDQ, Delta-CoMe, SQ-Delta,
D-QRELO); `"joint compression" + "neural networks"` (J-Tucker, Kernel Symmetry); `"model merging" +
compression` (ComPEFT, Task Singular Vectors, Adaptive Rank Pruning, Label-Free LoRA Merging);
`"linear mode connectivity" + compression` (**0**); `"permutation" + "model merging"` (Git Re-Basin,
C2M3, Weight Scope Alignment, Equivariant Deep Weight Space Alignment, DeepWeightFlow);
`"cross-model" + "neural" + compression` (MTZ, DCCD).
Patents: multi-model/weight compression delta; checkpoint delta compression; fine-tuned model
dedup (Google Patents XHR). **Only unmatched clause: mutual permutation alignment across
independently finetuned same-base members for joint lossless coding — a transplant with a
near-zero (likely negative) margin.**
