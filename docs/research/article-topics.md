# Article Topics — Modernizing and Growing the Interactive Library

**Date:** 2026-09-13 · **Truth pass:** 2026-09-17 (NW-12) — "where the library is now" refreshed and shipped picks marked. Current totals: 14 articles / 14 demos / 15 figures; catalogue 5,730 problems (5,050 when this was written).
**Author:** research agent (read-only; no code or data modified)
**Scope:** inventory the 5 shipped articles against what modern ML practice needs in 2026; score 25 candidate articles by learner value, interactive-demo + SVG fit, and coverage in the catalogue (5,050 problems at the time; 5,730 today); pick the next 6 to build with dependencies; audit the existing articles for 2026 additions; map reusable demo/figure components.
**Method:** (a) read `src/data/articles.ts` (5 articles, 5 demos, 6 figures at the time), `src/data/problems/problem-meta.ts` (all 5,050 entries then), `src/lib/articles-demos.ts`, `src/components/articles/*`, `src/app/articles/[slug]/ArticleDetail.tsx`, `docs/next-wave-plan.md`; (b) ran web searches on 22 modern topics and collected 39 dated sources (Section 7); (c) verified every problem id recommended here against `problem-meta.ts` — 160 distinct ids checked, 0 missing; (d) scored candidates with a 3-criteria rubric (Section 3.1). All URLs accessed 2026-09-13 unless noted.

---

## TL;DR

1. **The library covered 5 concepts at the time** (softmax temperature, eigenvectors, gradient descent, k-means, attention); it now ships **14** — the 5 originals plus tokenization BPE, embeddings, quantization, KV cache & FlashAttention, RAG, post-training, PCA/SVD, calibration, and LoRA. Each is prose + live demo + SVG figure + a practice footer driven by real problem ids. The map still has holes: of the 26 modern topics surveyed, 9 now ship as full articles, 5 are partial, and 12 are missing (Section 1.2).
2. **Biggest gaps clustered in LLM systems** (tokenization, embeddings, RAG, quantization, KV cache, post-training). All six shipped; the remaining LLM-systems gaps are MoE, distillation, and agent loops.
3. **Top 6 to build next, in order — all shipped:** (1) Tokenization: BPE, (2) Embeddings & Cosine Similarity, (3) Quantization: INT8→FP8, (4) KV Cache & FlashAttention, (5) RAG: From Chunks to Citations, (6) Post-Training: RLHF→DPO→GRPO. Slugs and landing notes are in Section 4.
4. **The chain held:** tokenization → embeddings → RAG; quantization → KV cache and QLoRA; KV cache extended the existing attention article. Build order is recorded in Section 4.
5. **One deliberate override:** Eval Metrics (precision/recall/ROC/AUC) scored 14/15 but was deferred to the first alternate — and is still the highest-value unshipped candidate. RAG and post-training were picked instead and both shipped.
6. **Catalogue coverage was deep enough for every shipped pick** (quantization 20+ ids, KV cache 15+, post-training 10+, RAG 8+, tokenization/embeddings 6+ — all verified) and remains so against the 5,730-problem bank. The thinnest spot is still data leakage/contamination (3 ids).
7. **Modernization:** only partly done in place. The low-rank story shipped as a standalone PCA/SVD article rather than an edit to the eigenvector piece; the other four in-place additions (sampling stack, AdamW, IVF/PQ, RoPE/GQA) were not made — see Section 5.
8. **Reuse was the effort hack, and it worked:** the original 5 demos and 6 figures were 2,940 LOC of primitives; the library is now 14 demos + 15 figures at ~9,800 LOC, built largely by re-skinning those primitives (Section 6).
9. **Registry cost is trivial**: adding an article means one entry in `ARTICLES` (`src/data/articles.ts:101`), one `DemoKind`/`FigureKind`, and one registry line each in `src/lib/articles-demos.ts:82` (`DEMOS`) and `src/data/articles.ts:72` (`FIGURES`); `ArticleDetail` renders everything generically.
10. **Recommended cadence:** one S/M article per wave slot; never more than one L in flight (L = multi-stage animation or simulator, e.g., KV cache or diffusion).

---

## 1. Where the library is now

### 1.1 The original five articles (all still shipped)

| Article | Category | Demo | Figure | Practice footer | Modernization gap (Section 5) |
|---|---|---|---|---|---|
| Why Softmax Needs Temperature | Deep Learning | log-slider + probability bars + Gumbel flip marks | temperature curve | dl-021, ml-065, nlp-075, dl-003, la-149 | top-p/min-p/DRY sampling stack — **open** |
| Eigenvectors You Can See | Linear Algebra | draggable vector + matrix warp canvas | warped grid | la-040, la-083, la-084, la-050, la-174 | low-rank in practice — **shipped** as the separate `pca-and-svd-in-practice` article |
| Gradient Descent from MSE to Logistic | Optimization | click-to-add points + refit + loss curve | contour path | ml-103, ml-012, op-001, ml-083, ml-002 | momentum/AdamW + schedules — **open** |
| K-Means: Assignment to Convergence | ML Fundamentals | stepped loop + inertia status | loop diagram | ml-003, ml-032, ml-033, ml-034, ml-145 | IVF + product quantization — **open** |
| Attention Is a Heatmap | Deep Learning | Q/K/V matrix + row softmax | pipeline + heatmap | dl-034, dl-035, dl-036, nlp-050, nlp-072 | GQA/MQA/MLA, FP8 KV, FlashAttention — **shipped** in the separate `kv-cache-and-flashattention` article; RoPE itself is still uncovered |

Nine articles were added after this audit (all in `src/data/articles.ts`): `tokenization-byte-pair-encoding`, `embeddings-and-cosine-similarity`, `quantization-int8-to-fp8`, `kv-cache-and-flashattention`, `rag-from-chunks-to-citations`, `post-training-rlhf-dpo-grpo`, `pca-and-svd-in-practice`, `calibration-and-uncertainty`, `lora-low-rank-fine-tuning` — the top 6 from Section 4 plus three Wave-2 picks.

### 1.2 Coverage inventory vs 2026 practice

Status legend: **C** covered, **P** partial (touched in prose by an existing article), **M** missing. Statuses and catalogue notes were verified against the 5,050-problem snapshot on 2026-09-13 and refreshed on 2026-09-17 (the bank is now 5,730; category totals are in `README.md`). "Catalogue" = number of direct matching problem ids in `problem-meta.ts` (search-verified; not exhaustive).

| # | Modern topic | Status | Why it matters in 2026 | Catalogue | Sources |
|---|---|---|---|---|---|
| 1 | Tokenization / BPE | C (`tokenization-byte-pair-encoding`) | Tokenizer quality is a cost and fairness issue: fertility predicts accuracy, and a letters-only pre-tokenizer hard-caps abugida scripts; ACL 2026 has active parity-BPE work | `nlp` 420 total; 6+ direct | S20–S23 |
| 2 | Embeddings & similarity | C (`embeddings-and-cosine-similarity`) | Every RAG/agent stack runs on embeddings; Matryoshka truncation + int8 give 12–48× storage cuts; MTEB v2 standardizes dynamic dims | `la`/`ml`/`nlp`; 6+ direct | S27, S28 |
| 3 | LoRA / PEFT | C (`lora-low-rank-fine-tuning`) | Default adaptation path; 2026 guidance moved to all-linear target modules + LoftQ init; adapter merge/serving economics | `dl` 455 total; 6+ direct | S05–S08 |
| 4 | Quantization | C (`quantization-int8-to-fp8`) | Production default: FP8 on Hopper/Blackwell (<0.5pt MMLU-Pro loss), INT4 weight-only for decode, NF4 for budget training; format must match silicon | 20+ direct ids | S24–S26 |
| 5 | Distillation | P (one softmax sentence) | Still the standard compression/transfer lever (teacher soft targets, feature distillation, sequence-level KL) | 4+ direct | S24, S35 |
| 6 | RAG pipeline | C (`rag-from-chunks-to-citations`) | Dominant applied pattern: hybrid BM25+dense → RRF → cross-encoder → cited generation; contextual retrieval + rerank cuts failures 49–67% | 8+ direct | S15–S17, S38 |
| 7 | RLHF vs DPO vs GRPO | C (`post-training-rlhf-dpo-grpo`) | Post-training stack changed: RLHF→GRPO/DAPO/RLVR for reasoning; DPO the stable default; rankings invert across scale | 10+ direct | S01–S04, S36 |
| 8 | KV cache / FlashAttention | C (`kv-cache-and-flashattention`) | At 128k+, KV cache dominates GPU memory; FP8 KV is now the default start; GQA/MLA give 4–14× compression | 15+ direct | S11–S14, S37 |
| 9 | Mixture-of-experts | M | Frontier open-weight models are MoE (DeepSeek-V3: 671B total / 37B active); routing skew and all-to-all are new systems literacy | 5 direct | S09, S10 |
| 10 | Diffusion | M | Flow matching / rectified flow is the mainstream (SD3; CVPR 2026 FreqFlow), not classic DDPM | 6+ direct | S29, S30 |
| 11 | Contrastive learning (CLIP) | M | The default multimodal embedding layer; MTEB now multimodal; late-interaction variants compete with rerankers | 6 direct | S27, S28 |
| 12 | Batch/Layer/RMS norm | M | RMSNorm/LayerNorm are universal; pre/post-norm changes gradient flow; BN still owns vision | 6+ direct | S11–S14 |
| 13 | Initialization | P (feature scaling in gradient article) | Signal preservation is the prerequisite for deep stacks; Xavier/He still the baseline every quant/init paper assumes | 4 direct | evergreen |
| 14 | Cross-validation | M | Model-selection hygiene; time-series/purged CV gaps are a common production failure | 4+ direct | evergreen |
| 15 | Bias–variance | M | The decomposition explains double descent, ensembling, and why big models still overfit less | 5 direct | evergreen |
| 16 | Regularization | P (one L2 sentence) | Dropout, weight decay, early stopping, group lasso — still the practical overfitting toolkit | 6+ direct | evergreen |
| 17 | Bayesian inference | M | Conjugate updating + credible intervals; tabular foundation models now approximate Bayesian posterior predictive in one forward pass | 6+ direct | S34, S35 |
| 18 | MCMC | M | The sampler behind Bayesian workflows; diffusion sampling is Langevin-adjacent — a strong 2026 bridge | 5 direct | S29 |
| 19 | PCA / SVD in practice | C (`pca-and-svd-in-practice`) | Low-rank everywhere: embeddings, LoRA, compression; randomized SVD is the workhorse | 6+ direct | S27 |
| 20 | Gradient boosting | M | Challenged by tabular foundation models (TabPFN-3 beats tuned GBDTs on TabArena) — the contrast is the lesson | 6 direct | S34, S35 |
| 21 | Calibration | C (`calibration-and-uncertainty`) | RAG needs refusal thresholds, agents need monitored confidence, judges must be calibrated before eval automation | 6 direct | S16, S18 |
| 22 | Eval metrics (P/R/AUC) | P (words only, no article) | Agent/RAG evaluation is trajectory-level, but thresholds still turn on precision/recall/AUC under imbalance | 10+ direct | S18, S31–S33 |
| 23 | Data leakage | M | Benchmark contamination inflates scores by a measured 6–40%; a four-tier taxonomy now exists; leakage hygiene is an interview staple | 3 direct (thin) | S31–S33 |
| 24 | Scaling laws | M | The scaling story moved from pretraining to post-training and test-time compute (thinking modes, best-of-N) | 6 direct | S01, S35 |
| 25 | Inference optimization | P (n² cost noted) | Serving is the product: continuous batching, paged attention, prefix caching, speculative decoding, FP8 KV — 4–40× cost levers | 6+ direct | S11–S14, S24 |
| 26 | Agent loops / tool use | M | Tool use is the deployment frontier; failures multiply (10 steps × 98% = 82% ceiling) and evals must be trajectory-level | 6 direct | S18, S19 |

---

## 2. Scoring method

**Rubric (1–5 each, total /15).** (a) *Learner value*: how much a self-taught practitioner is blocked or misled without it. (b) *Demo + SVG fit*: can one manipulation produce a visible, non-obvious insight, and does a static figure add a takeaway? (c) *Catalogue fit*: count and depth of matching practice problems (verified ids). Effort: **S** ≈ 0.5–1 day, **M** ≈ 1–2 days, **L** ≈ 3+ days of agent work, benchmarked against the demos (276–430 LOC at the time; 330–867 today) and figures (155–241; 155–248 today).

Scores are a guide; two explicit overrides are documented in Section 4.1.

---

## 3. Candidate catalogue (25 candidates)

### 3.1 Scores and ranking

| Rank | Candidate | (a) | (b) | (c) | Total | Effort | Chosen | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Tokenization: Byte-Pair Encoding | 5 | 5 | 5 | 15 | S | **Yes** | **shipped** |
| 2 | Embeddings: Meaning as Geometry | 5 | 5 | 5 | 15 | M | **Yes** | **shipped** |
| 3 | Quantization: INT8, INT4, FP8 | 5 | 4 | 5 | 14 | M | **Yes** | **shipped** |
| 4 | KV Cache & FlashAttention | 5 | 4 | 5 | 14 | L | **Yes** | **shipped** |
| 5 | Eval Metrics: Precision, Recall, ROC, AUC | 5 | 4 | 5 | 14 | M | Alternate #1 | open — the top unshipped pick |
| 6 | RAG: From Chunks to Citations | 5 | 4 | 4 | 13 | M | **Yes** | **shipped** |
| 7 | Post-Training: RLHF → DPO → GRPO | 5 | 4 | 4 | 13 | L | **Yes** | **shipped** |
| 8 | PCA / SVD in Practice | 4 | 5 | 4 | 13 | M | Wave 2 | **shipped** |
| 9 | Calibration & Uncertainty | 4 | 4 | 4 | 12 | S | Wave 2 | **shipped** |
| 10 | Diffusion & Flow Matching | 4 | 4 | 4 | 12 | L | Wave 2 | open |
| 11 | LoRA / PEFT: Low-Rank Fine-Tuning | 4 | 4 | 4 | 12 | M | Wave 2 | **shipped** |
| 12 | CLIP & Contrastive Learning | 4 | 4 | 4 | 12 | M | Wave 2 | open |
| 13 | Normalization: BatchNorm → RMSNorm | 4 | 3 | 4 | 11 | M | Wave 3 | open |
| 14 | Gradient Boosting vs Tabular Foundation Models | 4 | 4 | 3 | 11 | M | Wave 3 | open |
| 15 | Inference Serving: Batching & Speculative Decoding | 4 | 3 | 4 | 11 | M | Wave 3 | open |
| 16 | Agent Loops & Tool Use | 4 | 4 | 3 | 11 | M | Wave 3 | open |
| 17 | Mixture-of-Experts | 4 | 4 | 3 | 11 | M | Wave 3 | open |
| 18 | MCMC: Sampling When Integrals Fail | 3 | 5 | 3 | 11 | M | Wave 3 | open |
| 19 | Cross-Validation & Model Selection | 4 | 3 | 3 | 10 | S | Wave 3 | open |
| 20 | Regularization: Dropout, Weight Decay, Early Stopping | 4 | 3 | 3 | 10 | S | Wave 3 | open |
| 21 | Bayesian Inference: Priors to Posteriors | 3 | 4 | 3 | 10 | S | Wave 3 | open |
| 22 | Data Leakage & Benchmark Contamination | 4 | 3 | 2 | 9 | S | Wave 3 | open |
| 23 | Scaling Laws & Test-Time Compute | 3 | 3 | 3 | 9 | S | Wave 3 | open |
| 24 | Initialization: Xavier, He, Signal Preservation | 3 | 3 | 3 | 9 | S | Wave 3 | open |
| 25 | Bias–Variance in the Deep Learning Era | 3 | 3 | 3 | 9 | S | Wave 3 | open |

### 3.2 Candidate sheets

#### 1. Tokenization: Byte-Pair Encoding — `NLP` · Effort S
- **Dek:** Before a model sees a word, it sees a merge table. BPE decides how text becomes tokens — and tokens are the units of cost, context, and failure.
- **Why 2026:** ACL 2026 work shows frequency-based BPE systematically taxes low-resource and morphologically rich languages (fertility up to 10.5 tokens/word for Indic scripts), that fertility predicts accuracy (each extra token/word ↔ up to 18pp drop in one study), and that a letters-only pre-tokenizer is a hard fertility ceiling for abugida scripts (Thai 9.02×). Parity-aware BPE and MUTANT are the 2026 fixes [S20, S21, S22, S23].
- **Demo:** type or paste text; step through BPE merges on a small corpus and watch the vocabulary grow and compression improve; then encode arbitrary words with the learned tokenizer, highlighting token boundaries, token count, and a cost estimate. Params: initial alphabet, merge count.
- **Figure:** SVG merge cascade — `lowest → low + est`, with merge rank beside each edge and a fertility readout ("1 word → 2 tokens").
- **Practice:** `nlp-001` Tokenization · `nlp-022` WordPiece Longest-Match Tokenizer · `nlp-096` Byte-Level BPE Token Count · `nlp-099` Tokenizer Fertility Ratio · `nlp-235` Unigram Tokenization Report · `nlp-238` Average Characters per Token
- **Build note:** no canvas needed; the existing bar/slider primitives in `DemoSoftmaxTemperature` cover most interaction.
- **Shipped:** `tokenization-byte-pair-encoding` — demo `DemoBpeMerge`, figure `BpeMergeCascade`.

#### 2. Embeddings: Meaning as Geometry — `NLP` · Effort M
- **Dek:** A good embedding puts "dog" near "puppy" and far from "semiconductor". Cosine similarity is how that claim gets measured.
- **Why 2026:** embeddings are the substrate of every RAG/agent stack; 2026 model guidance includes Matryoshka truncation (256-d keeps ~95% retrieval quality at 12× less storage), int8 storage (48× total), and late-interaction variants that trade storage for reranker-free precision. MTEB v2 now exposes on-the-fly embedding dimensions [S27, S28].
- **Demo:** a fixed 2D/3D embedding space of words; drag the query vector and watch neighbor ranking; toggle cosine vs dot vs Euclidean and normalization on/off to show why cosine is length-blind; hard-negative pairs make ranking flip.
- **Figure:** SVG unit sphere with the angle-as-cosine geometry plus the algebra `dot(a,b)/(|a||b|)`.
- **Practice:** `la-025` Cosine Similarity of Vectors · `la-130` Cosine Similarity Matrix · `ml-046` Cosine Similarity of Feature Vectors · `nlp-005` Cosine Similarity of Token Vectors · `nlp-067` Top-k Embedding Cosine Ranking · `nlp-247` Dense Embedding Cosine Rank
- **Build note:** `DemoEigenvector` is 80% of the canvas machinery.
- **Shipped:** `embeddings-and-cosine-similarity` — demo `DemoEmbeddingCosine`, figure `EmbeddingGeometry`.

#### 3. Quantization: INT8, INT4, FP8 — `Deep Learning` · Effort M
- **Dek:** Halving the bits roughly halves memory and doubles decode throughput — the price is a rounding error you can steer.
- **Why 2026:** hardware picks the format. FP8 (W8A8) on Hopper/Blackwell costs ~0.3–0.5 MMLU-Pro points and speeds both prefill and decode 1.4–1.7×; INT4 weight-only (W4A16, GPTQ/AWQ) is a memory/decode play at ~1–2 points; NVFP4 and MXFP4 are Blackwell-native; NF4 + bf16 adapters is how DPO/GRPO run on one node [S24, S25, S26].
- **Demo:** drag a weight distribution; choose format (fp16/int8/fp8/int4/nvfp4), granularity (per-tensor, per-channel, group-128), and clip percentile; see the quantization staircase, reconstruction, error, and SQNR. A second tab quantizes (or distills) a tiny classifier to show accuracy response.
- **Figure:** SVG number line comparing uniformly spaced INT8 levels with exponentially spaced FP8 levels, with an activation outlier arrow explaining why FP8 absorbs it.
- **Practice:** `dl-058` Int8 Quantization Scale · `dl-059` Quantize Int8 · `dl-060` Dequantize Int8 · `dl-077` Per-Channel Quant Scale · `dl-195` Weight-Only Quant Memory · `dl-451` Int4 Vs Int8 Memory Reduction
- **Note:** distillation is the same "student learns from richer signal" story; fold `ml-168` Distillation Loss and `dl-082` Distillation KL into one section, not a separate article.
- **Shipped:** `quantization-int8-to-fp8` — demo `DemoQuantizationScale`, figure `QuantizationNumberLine` (distillation was not folded in).

#### 4. KV Cache & FlashAttention — `Deep Learning` · Effort L
- **Dek:** Attention is O(n²) compute and O(n) memory that never shrinks. The KV cache is why long context costs what it costs — and FlashAttention is why it fits.
- **Why 2026:** at 128k+ the KV cache often exceeds the model weights; vLLM now ships FP8 KV as a recommended default (per-token decode cost ~54% of BF16, sub-1% accuracy cost on validated paths), GQA gives 4–8× and MLA 7–14× compression, and eviction/compression methods target long-*output* reasoning models that classic long-input tricks miss [S11, S12, S13, S14, S37].
- **Demo:** a KV budget simulator — pick layers, heads, head-dim, dtype, context and concurrency; see KV bytes/token vs model weights. Then step through decode: append K/V, watch the cache grow, toggle GQA/MQA/MLA, evict with a policy, and see online-softmax rescaling in a tiled attention block.
- **Figure:** SVG stacked area of memory (weights + KV at 4k/32k/128k) plus a tiling diagram of HBM ↔ SRAM blocks that never materializes the n×n matrix.
- **Practice:** `dl-075` KV Cache Size · `dl-124` Flash Attention Block Count · `dl-186` KV Cache Append Step · `dl-211` Online Softmax Rescale Step · `dl-370` GQA Cache Savings Fraction · `dl-401` KV Cache Bytes Per Token
- **Deps:** the attention article exists; the quantization article should land first so the FP8/INT8 KV section can link to it.
- **Shipped:** `kv-cache-and-flashattention` — demo `DemoKvCache`, figure `KvMemoryTiling`.

#### 5. RAG: From Chunks to Citations — `NLP` · Effort M
- **Dek:** Retrieval-augmented generation is a pipeline, not a prompt. Most failures happen before the model reads a single token.
- **Why 2026:** the settled production stack is hybrid (BM25 + dense) retrieval → rank fusion (RRF) → cross-encoder rerank → citation-grounded generation; Anthropic-style contextual retrieval plus reranking cuts retrieval failures by 67%, and skipping the reranker is the most common quality plateau (10–30 recall@5 points) [S15, S16, S17, S38].
- **Demo:** a fixed mini-corpus of chunks; type a query; toggle lexical vs dense vs hybrid, adjust RRF `k` and the rerank cut; watch candidate lists fuse into a final context; show citation pointers and a "no evidence above threshold → refuse" state; chunk-overlap slider exposes recall hidden by chunking.
- **Figure:** SVG pipeline — parse → chunk → contextualize → index → hybrid retrieve → RRF → rerank → context pack → generate with citations — annotated with the 49–67% failure-reduction numbers.
- **Practice:** `nlp-141` RAG Retrieval Top-k · `nlp-148` Reciprocal Rank Fusion · `nlp-184` Retrieval Precision at k · `nlp-185` Recall at k · `nlp-242` Chunk Overlap Coverage · `nlp-252` Mean Reciprocal Rank for Retrieval
- **Deps:** embeddings article first (the dense half of hybrid retrieval); quantization optional (vector compression).
- **Shipped:** `rag-from-chunks-to-citations` — demo `DemoRagRetrieval`, figure `RagPipeline`.

#### 6. Post-Training: RLHF → DPO → GRPO — `Reinforcement Learning` · Effort L
- **Dek:** Pretraining teaches the model language; post-training teaches it behavior. The 2026 stack replaced human preference labels with verifiable rewards for reasoning.
- **Why 2026:** RLHF-with-PPO is no longer the default. GRPO removes the critic and is the central RLVR baseline; DAPO/GSPO fix its instabilities; DPO remains the stable offline default (matching PPO within ~0.3 MT-Bench points at ~10× less compute); ranking inversions across scale mean "best method" depends on where you measure [S01, S02, S03, S04, S36, S39].
- **Demo:** a preference-pair lab — two responses with token log-prob sliders; watch DPO loss and implicit reward margin, and how β and the reference model shift the preferred response. Toggle SFT / DPO / GRPO and see the update direction on a 1D policy; a verifiable-reward mode shows group-relative advantage from G samples.
- **Figure:** SVG pipeline SFT → preference optimization → RLVR, with the critic crossed out of GRPO, plus the Bradley–Terry preference curve.
- **Practice:** `dl-180` DPO Loss · `dl-182` PPO Clipped Objective · `rl-204` Reward Model Training Loss · `rl-205` Bradley-Terry Likelihood · `rl-274` DPO Loss Value · `rl-275` DPO Implicit Reward Gap
- **Deps:** softmax/temperature + attention articles (log-probs and the transformer context); quantization recommended for the QLoRA-on-one-GPU aside.
- **Shipped:** `post-training-rlhf-dpo-grpo` — demo `DemoPostTraining`, figure `PostTrainingPipeline`.

#### 7. Eval Metrics: Precision, Recall, ROC, AUC — `ML Fundamentals` · Effort M (first alternate)
- **Dek:** Accuracy is a trap. Threshold, prevalence, and the metric you picked decide what "good" means.
- **Why 2026:** agent and RAG evaluation now run on task completion, tool accuracy, faithfulness, step efficiency, and recovery — but thresholds and judge calibration still reduce to precision/recall tradeoffs; benchmark contamination (6–40% inflation estimates, four-tier taxonomy) makes evaluation design itself a core 2026 skill [S18, S31, S32, S33].
- **Demo:** sliders for class separation and prevalence; drag a decision threshold over two score distributions; confusion matrix, precision-recall curve, and ROC update live; show accuracy staying high under 1:100 imbalance while recall collapses; toggle PR vs ROC to expose the divergence.
- **Figure:** SVG threshold sweep with TP/FP/FN/TN shaded regions and the resulting ROC + PR curves side by side.
- **Practice:** `ml-009` Precision, Recall, F1 · `ml-073` ROC Curve Points · `ml-074` AUC by Trapezoid · `ml-075` Precision-Recall Curve Points · `ml-076` Average Precision · `ml-243` PR AUC Trapezoid
- **Override note:** scored 14 but deferred. It reuses existing curve/bar primitives (least new capability), and its 2026 novelty (contamination) is covered by the Data Leakage candidate. Build it the moment a sample-weighting or threshold UX is wanted for eval work.

#### 8. PCA / SVD in Practice — `Linear Algebra` · Effort M
- **Dek:** The eigenvector article explains the theory; this one shows what people actually do with it — project, denoise, compress, truncate.
- **Why 2026:** low-rank is everywhere: Matryoshka embedding truncation [S27], LoRA updates, model compression, and spectral diagnostics. Randomized SVD makes it practical at scale.
- **Demo:** 2D scatter with a draggable projection axis; explained-variance and reconstruction-error readouts; rank-r reconstruction slider; toggle centering and standardization to show how preprocessing changes the axes.
- **Figure:** SVG covariance ellipse with principal axes + scree bars and the Eckart–Young truncation error.
- **Practice:** `ml-041` PCA Mean Centering · `la-139` Rank-1 Approximation · `la-249` SVD Power Iteration for Singular Vectors · `la-250` Eckart-Young Rank-r Reconstruction · `la-251` Pseudoinverse via SVD Formula · `la-089` Singular Values 2x2
- **Deps:** eigenvectors article is the natural predecessor.
- **Shipped:** `pca-and-svd-in-practice` — demo `DemoPcaProjection`, figure `PcaEllipseScree`.

#### 9. Calibration & Uncertainty — `ML Fundamentals` · Effort S
- **Dek:** A model that says 90% should be right 90% of the time. Modern nets are not.
- **Why 2026:** RAG systems need refusal thresholds, agent confidence must be monitored, and LLM judges must be calibrated against human labels (>80–85% agreement) before eval automation is trusted [S16, S18].
- **Demo:** simulated scores; bin-count slider; reliability diagram vs diagonal; ECE readout; fit temperature `T` and watch overconfidence soften while accuracy and ranking stay fixed.
- **Figure:** SVG reliability diagram plus the temperature-scaling formula and before/after ECE.
- **Practice:** `ml-065` Temperature Scaling · `ml-072` Calibration Bins · `ml-101` Expected Calibration Error by Probability Bins · `ml-337` Calibration Gap by Equal-Frequency Bins · `dl-086` Expected Calibration Error for Confidence Scores · `ml-291` Uplift Calibration Error
- **Deps:** softmax article already introduces temperature scaling — this deepens it.
- **Shipped:** `calibration-and-uncertainty` — demo `DemoCalibrationUncertainty`, figure `CalibrationReliability`.

#### 10. Diffusion & Flow Matching — `Deep Learning` · Effort L
- **Dek:** Start from noise and integrate backwards. Diffusion and flow matching are one family with two schedules.
- **Why 2026:** flow matching / rectified flow is the mainstream objective (SD3-style rectified-flow transformers; CVPR 2026 FreqFlow, FID 1.38 on ImageNet-256) and the field treats diffusion as a special case of a Gaussian probability path [S29, S30].
- **Demo:** 2D distribution transport: noise cloud at t=1, step through reverse ODE; sliders for steps and guidance; compare VP quarter-circle vs linear-chord paths; classifier-free guidance scale visibly sharpens or collapses the distribution.
- **Figure:** SVG t=1→0 timeline showing α/σ schedules (quarter circle vs chord) with velocity arrows.
- **Practice:** `dl-142` Linear Beta Schedule · `dl-163` Diffusion Forward Step · `dl-165` Diffusion MSE Loss · `dl-167` Sinusoidal Time Embedding · `cv-335` Diffusion Forward Noising · `cv-339` CFG Variance Rescale
- **Deps:** none hard; benefits from the k-means/EM-style stepped-loop demo.

#### 11. LoRA / PEFT: Low-Rank Fine-Tuning — `Deep Learning` · Effort M
- **Dek:** Freeze the model, train a rank-16 shadow. That is most fine-tuning in 2026.
- **Why 2026:** LoRA is the default adaptation path; 2026 guidance converged on r=8–16, α/r≈2, all-linear target modules, and LoftQ initialization for QLoRA (NF4 + bf16 adapters); merged adapters add <1ms inference overhead, and multi-adapter serving swaps on the fly [S05, S06, S07, S08].
- **Demo:** ΔW = BA explorer — pick rank `r`, see the approximation error against a target update; parameter/VRAM calculator for LoRA vs QLoRA; toggle merge and watch the adapter disappear into `W`.
- **Figure:** SVG of frozen `W` plus the low-rank elbow `B·A`, with the parameter formula `r(d_in+d_out)` vs `d_in·d_out`.
- **Practice:** `dl-151` LoRA Parameter Count · `dl-152` Adapter Bottleneck Params · `dl-153` Prompt Tuning Params · `dl-154` QLoRA Memory · `dl-219` LoRA Merge Weights · `dl-220` Prompt Cache Hit Ratio
- **Deps:** PCA/SVD article is a nice prerequisite; quantization article covers the QLoRA base.
- **Shipped:** `lora-low-rank-fine-tuning` — demo `DemoLoraRank`, figure `LoraAdapterDiagram`.

#### 12. CLIP & Contrastive Learning — `Computer Vision` · Effort M
- **Dek:** Align images and text in one space, then classify with a sentence instead of a head.
- **Why 2026:** contrastive VLMs are the default multimodal embedding layer for zero-shot classification, retrieval, and captioning; MTEB is multimodal now, and late-interaction/Matryoshka variants are the active edge [S27, S28].
- **Demo:** a fixed image × caption embedding matrix; click a caption and see the similarity heatmap; move the learned logit scale/temperature and watch zero-shot softmax sharpen; add a hard negative and watch the InfoNCE loss.
- **Figure:** SVG dual-encoder diagram with the N×N similarity matrix, diagonal positives highlighted.
- **Practice:** `cv-249` CLIP Similarity Matrix · `cv-250` Contrastive Logits · `cv-296` CLIP Zero-Shot Logits · `cv-343` CLIP Learned Logit Scale · `cv-344` CLIP Prompt Ensemble · `ml-169` Contrastive Loss
- **Deps:** embeddings article; reuses `AttentionHeatmap` wholesale.

#### 13. Normalization: BatchNorm → RMSNorm — `Deep Learning` · Effort M
- **Dek:** Normalization is not about making numbers pretty; it is about controlling activation scale so depth is trainable.
- **Why 2026:** LayerNorm/RMSNorm are in essentially every modern transformer; pre-vs-post norm changes residual gradient scale, and normalization placement interacts with quantization and hybrid attention [S11, S12, S13].
- **Demo:** a deep activation chain; toggle BN/LN/RMSNorm; train/inference mode; watch per-layer mean/variance and gradient norm; move a norm layer before/after the residual to see the difference.
- **Figure:** SVG showing which axes each method pools over (batch × features for BN, features for LN, RMS-only for RMSNorm).
- **Practice:** `dl-025` BatchNorm Forward (Train) · `dl-027` LayerNorm Forward · `dl-044` BatchNorm Backward · `dl-054` BatchNorm Momentum Update · `dl-377` LayerNorm vs RMSNorm Outputs · `dl-378` Residual Gradient Scale Pre Vs Post Norm
- **Deps:** initialization article pairs naturally.

#### 14. Gradient Boosting vs Tabular Foundation Models — `ML Fundamentals` · Effort M
- **Dek:** Boosted trees owned tabular data for a decade. In 2026 a pretrained prior is ahead on the benchmark.
- **Why 2026:** TabPFN-3 (1M rows, 200 features) outperforms 8-hour-tuned GBDT baselines in a single forward pass on TabArena, but licensing, inference-time context, and hardware constraints keep XGBoost/CatBoost as the safe production default. The trade-off is the lesson [S34, S35].
- **Demo:** add one stump at a time to residuals (learning-rate slider); watch the sum fit; then toggle "foundation model" mode and show in-context prediction with a context-size cost meter.
- **Figure:** SVG additive boosting (data → residual → stump → sum) next to the in-context inference diagram.
- **Practice:** `ml-005` Best Decision Tree Split · `ml-136` Gradient Boosting Stump · `ml-137` AdaBoost Weight Update · `ml-139` Random Forest Probability Vote · `ml-140` Feature Importance from Split Gains · `ml-311` Quantile Forest Predict
- **Deps:** none.

#### 15. Inference Serving: Batching & Speculative Decoding — `Deep Learning` · Effort M
- **Dek:** Throughput is a scheduling problem: keep the GPU busy, reuse prefixes, and guess tokens faster than you can compute them.
- **Why 2026:** continuous batching, paged attention, prefix caching, KV quantization, and speculative decoding are the documented 4–40× long-context levers; prefix cache hits are 60–85% on agent and multi-tenant workloads [S12, S13, S14, S24].
- **Demo:** request-timeline simulator: arrivals, prefill vs decode, paged blocks; toggle continuous batching, prefix-cache hit rate, speculative accept length; watch tokens/s, TTFT, and P95 latency move.
- **Figure:** SVG Gantt chart of requests with prefill/decode blocks + the draft/verify token tree.
- **Practice:** `dl-203` Speculative Draft Accept Length · `dl-275` Speculative Tree Attention Mask · `dl-301` Quantized Inference Latency · `dl-309` Cascade Inference · `dl-315` Speculative Speedup Estimate · `dl-449` Expected Tokens Per Verification Step
- **Deps:** KV cache article first.

#### 16. Agent Loops & Tool Use — `NLP` · Effort M
- **Dek:** An agent is a loop with a budget. Most failures are step-sequence failures, not answer failures.
- **Why 2026:** multi-tool agents routinely call 3–20 tools per task, so per-step errors multiply (0.98^10 ≈ 82% ceiling); production evaluation is trajectory-level — task completion, tool-call accuracy, faithfulness, step efficiency, and failure recovery — with CI gates on step/cost/safety budgets [S18, S19].
- **Demo:** step through a toy agent task; choose tools for each step; step-budget and cost meters; inject a tool timeout and see retry/spiral behavior; compare a clean trajectory with a looping one.
- **Figure:** SVG observe→plan→act→verify loop with a trajectory branch and a failure-injection callout.
- **Practice:** `nlp-223` Tool Selection Accuracy · `nlp-224` Tool Argument Schema Check · `nlp-264` Tool Schema Parameter Count · `nlp-266` Agent Loop Iteration Cap · `nlp-267` Tool Error Retry Policy · `nlp-268` Scratchpad Token Growth
- **Deps:** RAG article (agents retrieve) and KV cache (long tool histories are prefix-cache workloads).

#### 17. Mixture-of-Experts — `Deep Learning` · Effort M
- **Dek:** Train 671B parameters, run 37B per token. The trick is a router — and the bill is all-to-all.
- **Why 2026:** MoE is the standard frontier architecture (DeepSeek-V3: 256 routed experts, top-8 active + 1 shared); production serving is a routing-skew and all-to-all problem, with dynamic expert replication (EPLB) recovering up to 35% of throughput lost to skew without dropping tokens [S09, S10].
- **Demo:** route a batch of tokens through an 8-expert top-k router; sliders for top-k and capacity factor; watch expert load bars skew, tokens drop, and throughput change; toggle the auxiliary load-balance loss and expert replication.
- **Figure:** SVG router→experts diagram with a skewed load histogram and the capacity-drop path.
- **Practice:** `dl-310` MoE Load Balance · `dl-311` MoE Throughput Gain · `dl-312` Router Z-Loss · `dl-313` MoE Aux Load-Balance Loss · `dl-314` Expert Capacity Drop Rate
- **Deps:** KV cache/serving article pairs well.

#### 18. MCMC: Sampling When Integrals Fail — `Probability` · Effort M
- **Dek:** When you cannot compute the posterior, walk through it instead.
- **Why 2026:** sampling is how uncertainty gets computed; diffusion sampling is a Langevin-adjacent process, so the vocabulary transfers directly from Bayesian stats to generative models [S29].
- **Demo:** a 2D target density; run Metropolis with a step-size slider; watch the chain, acceptance rate, trace plot, and histogram; compare too-small, tuned, and too-large steps; run a Gibbs sweep on a correlated Gaussian for contrast.
- **Figure:** SVG chain over contours + trace with burn-in shading.
- **Practice:** `pr-133` Metropolis One Step (Seeded) · `pr-134` Gibbs Sweep (Seeded) · `pr-219` MCMC Burn-In Mean · `pr-270` Metropolis Acceptance Ratio · `pr-305` Gibbs Two-Variable Sweep Mean
- **Deps:** Bayesian inference article first.

#### 19. Cross-Validation & Model Selection — `ML Fundamentals` · Effort S
- **Dek:** One holdout is a coin flip. K folds are a distribution.
- **Why 2026:** model selection hygiene is still the most common silent failure; time-series and grouped data require non-random folds, and purged CV is standard in quant/ML.
- **Demo:** shuffle a small dataset into k folds; watch fold scores, mean, and spread; toggle random vs stratified vs time-ordered splits and reveal temporal leakage when shuffled.
- **Figure:** SVG fold diagram (k=5) + per-fold score dots and the mean±std band.
- **Practice:** `ml-118` Cross-Validation Mean Score · `ml-119` Cross-Validation Score Std · `st-095` Leave-One-Out Cross-Validation R-Squared · `ml-324` Bootstrap AUC Confidence Interval
- **Deps:** bias–variance article complements.

#### 20. Regularization: Dropout, Weight Decay, Early Stopping — `ML Fundamentals` · Effort S
- **Dek:** The training set is a lure. Regularization is how you stop believing it.
- **Why 2026:** L2/group lasso, dropout, and early stopping remain the practical overfitting toolkit; weight decay is now decoupled (AdamW-style) in every serious optimizer [S06, S07].
- **Demo:** fit a flexible model to noisy points with toggles for L2 λ, dropout p, and early stopping; watch train vs validation curves separate and the weight norm shrink; dropout visibly injects noise and improves validation.
- **Figure:** SVG train/val loss curves with the early-stop marker and L2 penalty contours.
- **Practice:** `ml-163` Regularized Logistic Step · `ml-257` Group Lasso Penalty · `op-074` Ridge Path Value · `op-075` LASSO Coordinate Step · `ml-013` Ridge Regression Closed Form · `dl-028` Inverted Dropout (Seeded)
- **Deps:** none; ties into gradient descent modernize note.

#### 21. Bayesian Inference: Priors to Posteriors — `Statistics` · Effort S
- **Dek:** A prior is not a bias; it is the data you had before this data.
- **Why 2026:** conjugate updating is the cleanest intuition for uncertainty, and tabular/foundation models now approximate Bayesian posterior predictive inference in a single forward pass — the payoff of the machinery [S34, S35].
- **Demo:** Beta-Binomial / Normal-Normal updating: prior sliders, reveal observations one at a time, watch the posterior and credible interval update; show batch vs sequential giving identical posteriors.
- **Figure:** SVG prior → likelihood → posterior trio with the conjugate formula.
- **Practice:** `pr-276` Log-Odds Bayesian Update · `pr-277` Sequential Bayesian Update from Likelihoods · `pr-278` Normal-Normal Posterior Mean · `pr-279` Normal-Normal Posterior Variance · `ml-312` Bayesian Posterior Mean · `ml-313` Posterior Predictive
- **Deps:** probability articles already exist; none hard.

#### 22. Data Leakage & Benchmark Contamination — `ML Fundamentals` · Effort S
- **Dek:** The most dangerous leak is the one that makes your score go up.
- **Why 2026:** benchmark contamination is now quantified (6–40% inflation estimates across MMLU/GSM8K/HumanEval), with a four-tier taxonomy (exact/syntactic/semantic/task-level) and a disclosure-protocol movement; instruction-tuning contamination is called out as undetectable by current methods [S31, S32, S33].
- **Demo:** a pipeline builder — choose split order, scaling/encoding placement, duplicate handling, and fold construction; every leaky choice inflates a simulated test score; fixing it reveals the honest score. A toggle replays a target-encoding leak.
- **Figure:** SVG train/test boundary with leak arrows crossing it (preprocessing, target encoding, duplicates, time).
- **Practice:** `ml-263` Target Encoding Leakage Check · `ml-316` Data Leakage Correlation Flags · `rl-258` Leakage Check
- **Catalogue note:** only 3 direct ids — this is the thinnest candidate; add 2–3 problems when the article ships (e.g., duplicate-row leakage, temporal split violation).

#### 23. Scaling Laws & Test-Time Compute — `Deep Learning` · Effort S
- **Dek:** Pretraining scaling got the headlines; post-training and inference-time compute are where the curves moved.
- **Why 2026:** RL post-training (GRPO/DAPO) and thinking/best-of-N test-time compute are the new scaling axes; TabPFN-3's "Thinking" mode beats tuned ensembles with extra inference compute, and reasoning-model rollouts are group-relative advantage at scale [S01, S03, S35].
- **Demo:** log-log loss vs tokens/compute with sliders; show compute-optimal allocation; add an inference-compute axis (samples G) and watch pass@k/best-of-N saturate.
- **Figure:** SVG log-log scaling curve + compute-allocation bars.
- **Practice:** `dl-414` Forward FLOPs Per Token · `dl-415` Training FLOPs Per Token · `dl-416` Tokens Per Second From MFU · `dl-434` Scaling Efficiency From Step Time · `rl-284` Best-of-N Expected Quality · `rl-285` Best-of-N Pass At K
- **Deps:** post-training article for the RLVR tie-in.

#### 24. Initialization: Xavier, He, Signal Preservation — `Deep Learning` · Effort S
- **Dek:** Deep nets do not explode because of bad data; they explode because of the first layer's dice roll.
- **Why 2026:** initialization is still the assumption behind every deep stack and every quantization/compression result; RMSNorm-era architectures change the variance bookkeeping.
- **Demo:** pass a signal through a deep ReLU chain with a variance slider; watch activations explode or vanish; snap to Xavier/He and see per-layer variance stabilize.
- **Figure:** SVG per-layer variance curves for naive vs Xavier vs He.
- **Practice:** `dl-018` Xavier Init Std · `dl-019` He Init Std · `dl-055` He Init Variance · `dl-006` Leaky ReLU
- **Deps:** normalization article pairs naturally.

#### 25. Bias–Variance in the Deep Learning Era — `ML Fundamentals` · Effort S
- **Dek:** The U-curve is real, but modern nets made the right side weirder.
- **Why 2026:** double descent, ensembling, and the observation that large models can be both over-parameterized and better-generalizing require the decomposition to be understood, not just cited.
- **Demo:** sample noisy datasets from a fixed function; complexity slider; watch the average fit and the variance of fits; decomposition bars shrink/grow; add an ensemble toggle and watch variance drop.
- **Figure:** SVG classic target diagram + U-curve with the double-descent second dip annotated.
- **Practice:** `info-233` Bias-Variance Decomposition · `pr-257` Bagging Variance Reduction · `ml-040` Bagging Feature Subset · `ml-039` Bootstrap Sample · `ml-050` Bootstrap Confidence Interval
- **Deps:** cross-validation and regularization articles are siblings.

---

## 4. Top 6 to build next — all six shipped

All six picks landed in `src/data/articles.ts` (2026-09-17): tokenization, embeddings, quantization, KV cache, RAG, and post-training, in the planned order. The table below is retained as the build record; each row's demo and figure now exist under `src/components/articles/`.

### 4.1 Selection and overrides

By rubric score: tokenization (15), embeddings (15), quantization (14), KV cache (14), eval metrics (14), then a tie at 13 between RAG and post-training. Two judgment calls, stated openly:

- **Eval Metrics (14) is deferred to alternate #1.** It is the highest-value candidate not picked, but its interaction is a threshold sweep over two standard charts — the smallest new capability of the top group — and contamination is covered by the Data Leakage candidate. Build it first if the priority is evaluation literacy over systems + alignment. **Still open — the top unshipped candidate.**
- **Post-Training (13) is taken over Eval Metrics** because the 2026 post-training shift is the largest change in practice this library does not touch, the catalogue support is deep (`dl-170/171/180/182`, `rl-204/205/206/274/275/281`), and the preference-logprob demo reuses the softmax demo's probability primitives. **Shipped** as `post-training-rlhf-dpo-grpo`.

### 4.2 The six

| Order | Article | Category | Effort | Depends on | Demo summary | Figure summary | Practice ids |
|---|---|---|---|---|---|---|---|
| 1 | Tokenization: Byte-Pair Encoding | NLP | S | — | BPE merge stepper + tokenizer playground with cost/fertility readout | merge cascade SVG | nlp-001, nlp-022, nlp-096, nlp-099, nlp-235, nlp-238 |
| 2 | Embeddings: Meaning as Geometry | NLP | M | 1 | draggable vector in embedding space, cosine vs dot vs Euclidean, normalization toggle | unit sphere + angle-as-cosine algebra | la-025, la-130, ml-046, nlp-005, nlp-067, nlp-247 |
| 3 | Quantization: INT8, INT4, FP8 | Deep Learning | M | — (2 recommended for the embedding-compression aside) | format/granularity/clip sliders → staircase, error, SQNR; distillation tab | INT vs FP number line with outlier arrow | dl-058, dl-059, dl-060, dl-077, dl-195, dl-451 |
| 4 | KV Cache & FlashAttention | Deep Learning | L | attention (exists), 3 (dtype section) | KV budget calculator + decode stepper with GQA/eviction + online softmax | memory stacked area + SRAM tiling diagram | dl-075, dl-124, dl-186, dl-211, dl-370, dl-401 |
| 5 | RAG: From Chunks to Citations | NLP | M | 1, 2 (3 optional for vector compression) | hybrid retrieval + RRF + rerank playground ending in cited context or refusal | full pipeline SVG with failure-reduction annotations | nlp-141, nlp-148, nlp-184, nlp-185, nlp-242, nlp-252 |
| 6 | Post-Training: RLHF → DPO → GRPO | Reinforcement Learning | L | softmax (exists), attention (exists), 3 optional (QLoRA) | preference log-prob lab, DPO margin, SFT/DPO/GRPO update toggle | SFT→preference→RLVR pipeline with critic crossed out | dl-180, dl-182, rl-204, rl-205, rl-274, rl-275 |

### 4.3 Build order and dependencies

The order held exactly as planned: tokenization first (the unit every later article counts in), embeddings second, quantization third (before KV cache's dtype section), KV cache fourth, RAG fifth (dependent on tokenization + embeddings), post-training sixth (the only L besides KV cache, developed in parallel). The hard constraints — embeddings before RAG, attention before KV cache, quantization before KV cache's dtype section, tokenization before everything that counts tokens — are visible in the shipped cross-links (`embeddings-and-cosine-similarity` ↔ `rag-from-chunks-to-citations`, `attention-is-a-heatmap` ↔ `kv-cache-and-flashattention`, `quantization-int8-to-fp8` ↔ `kv-cache-and-flashattention` and `post-training-rlhf-dpo-grpo`).

---

## 5. Modernize the five existing articles

Status: the eigenvectors/low-rank topic shipped as the stand-alone `pca-and-svd-in-practice` article and the attention additions partly landed in `kv-cache-and-flashattention`; the other in-place edits were not made. Re-check the articles before treating any bullet as a spec.

- **Softmax / temperature — open.** Add a "temperature is one knob in 2026" section: top-p, min-p, and repetition/DRY penalties truncate the tail that temperature alone just flattens; reasoning models are typically sampled greedily or at low temperature, while creative workloads use temp ~1 with top-p <1; point to `dl-078` Top-P Nucleus Filter, `nlp-079` Top-p (Nucleus) Filtering, `nlp-292` Nucleus Cutoff Index, and tie test-time diversity to the post-training article [S02, S03]. The existing calibration paragraph stays; it is already current.
- **Eigenvectors — shipped as a separate article.** The "low-rank everything" content landed as `pca-and-svd-in-practice` (SVD → PCA, LoRA's `ΔW = BA`, Matryoshka truncation, Eckart–Young) rather than as an edit to `eigenvectors-you-can-see`; the original article is unchanged [S05, S27].
- **Gradient descent — open.** No "SGD is not the optimizer you ship" section: momentum, RMSProp, Adam/AdamW, warmup + cosine schedules, and an optimizer selector in the existing demo are all still missing.
- **K-means — open.** No "the k-means inside your vector database" section (IVF, product quantization, recall/latency dial, spherical k-means); `nlp-256`, `nlp-247`, `ml-219` are not linked from the article [S27].
- **Attention — partly shipped via the KV-cache article.** GQA/MQA/MLA, FP8 KV, FlashAttention tiling, and sliding-window cost now ship in `kv-cache-and-flashattention`; RoPE and attention sinks are still not covered anywhere, and the attention article itself was not edited [S11, S12, S13].

---

## 6. Reuse map — which existing components carry the new articles

LOC refreshed 2026-09-17 (original values in the plan were 276/407/430/344/336/155/219/204/170/158/241/79/191).

| Existing component (LOC) | Primitive it provides | New articles it can serve (direct reuse or light reskin) |
|---|---|---|
| `DemoSoftmaxTemperature.tsx` (330) | log/slider control + probability bars + threshold marker ticks + softmax math | tokenization (merge/compression bars), embeddings (similarity ranking bars), quantization (bit-level sliders + histograms), calibration (bin bars), eval metrics (threshold marks), post-training (preference probability bars) |
| `DemoEigenvector.tsx` (407) | draggable-vector canvas + matrix transform + live readouts + theme-aware palette | embeddings (vector space), PCA/SVD (projection axis), LoRA (ΔW rank approximation), initialization (signal path could reuse the readout pattern) |
| `DemoGradientDescent.tsx` (409) | click-to-add points + iterative refit + loss curve + update-rule toggle | regularization (penalty/dropout toggles), optimizers modernize note (optimizer selector), calibration? no — leave charting to figures |
| `DemoKMeans.tsx` (340) | stepped/play loop + status metric + point/centroid canvas | diffusion/flow (step denoising), MCMC (chain stepping + trace), gradient boosting (stump-by-stump), RAG (step through pipeline stages), agents (step through loop) |
| `DemoAttention.tsx` (336) | token×token heatmap + row-normalized weights + mask toggle | CLIP (similarity matrix), RAG (rerank scores), eval metrics (confusion/score matrices), MoE (routing matrix) |
| `figures/AttentionPipeline.tsx` (155) | horizontal stage-flow SVG | RAG pipeline, post-training pipeline, quantization pipeline, agent loop, serving timeline |
| `figures/AttentionHeatmap.tsx` (219) | matrix heatmap SVG with causal mask | CLIP similarity matrix, confusion matrix, calibration bins, MoE routing |
| `figures/DescentContours.tsx` (204) | contour/landscape SVG with path | DPO loss landscape, bias–variance, scaling-law loss curves |
| `figures/SoftmaxTemperatureCurve.tsx` (179) | curve/bar chart with annotated axis | calibration reliability curve, ROC/PR curves, scaling laws, tokenizer fertility |
| `figures/KMeansLoop.tsx` (158) | two-step cycle diagram | EM/MCMC iterations, diffusion forward/reverse loop, boosting residual loop |
| `figures/EigenvectorGrid.tsx` (241) | grid-warp vector field | PCA projection, low-rank transform, whitening |
| `src/lib/articles-demos.ts` (97) | `DemoProps`, `clamp`, `getCanvasPalette`, `prefersReducedMotion` | every new demo — already the shared contract |
| `ArticleDetail.tsx` (194) | generic renderer for prose/demo/figure + problem-id practice footer | no changes needed; new articles are data + demo + figure + registry lines |

**Reuse rule of thumb:** if a candidate's demo is "a distribution/ranking that responds to one or two sliders," start from `DemoSoftmaxTemperature`; if it is "a geometric object you drag," start from `DemoEigenvector`; if it is "a process you step through," start from `DemoKMeans`; if it is "a matrix you read," start from `DemoAttention`. That classification covers 14 of the 25 candidates with zero new interaction machinery — and the shipped articles leaned on these patterns (the KV-cache demo is the one that outgrew the pattern at 867 LOC).

---

## 7. Sources

All accessed 2026-09-13.

- **S01** — "Post-Training in 2026: GRPO, DAPO, RLVR & Beyond", LLM Stats, 2026-03-10. https://llm-stats.com/blog/research/post-training-techniques-2026
- **S02** — "A Guide to Reinforcement Learning Post-Training for LLMs: PPO, DPO, GRPO, and Beyond", Hugging Face blog, 2026-01-19. https://huggingface.co/blog/karina-zadorozhny/guide-to-llm-post-training-algorithms
- **S03** — "GRPO, DPO & RLVR Explained: Reasoning RL Methods in 2026", Turing Post, 2026-06-07. https://www.turingpost.com/p/reasoning-rl-in-2026
- **S04** — "Post-Training: RLHF, DPO, and What Actually Builds the Frontier", Prompt20, 2026-05-11. https://blog.prompt20.com/posts/post-training-rlhf-dpo/
- **S05** — "PEFT Integration" (LoRA, QLoRA, prompt tuning, learning-rate guidance), Hugging Face TRL docs. https://huggingface.co/docs/trl/peft_integration
- **S06** — "LoRA & QLoRA Fine-Tuning Guide (2026)", AI Workflow Lab, 2026-03-16. https://aiworkflowlab.dev/article/how-to-fine-tune-llms-with-lora-and-qlora-production-python-guide
- **S07** — "LoRA & PEFT Fine-Tuning: Production Guide for 2026", TheCodeForge, 2026-05-28. https://thecodeforge.io/ml-ai/lora-peft-fine-tuning/
- **S08** — "QLoRA and LoftQ in PEFT: what changed for 4-bit fine-tuning in 2026", AxiomLogica, 2026-05-08. https://axiomlogica.com/ai-ml/qlora-loftq-peft-4-bit-fine-tuning-2026
- **S09** — "Serving Mixture-of-Experts Models in Production", LLMs Blog, 2026-08-24. https://www.llms.blog/posts/serving-mixture-of-experts-models-in-production-architecture-distributed-parallelism-all-to-all-bottlenecks-and-serving-economics
- **S10** — "Decoding the Skew: Distribution-Aware MoE Inference with Adaptive Kernel Dispatch", arXiv:2607.23099, 2026-07-25. https://arxiv.org/html/2607.23099v1
- **S11** — "Attention & the KV Cache", Inference Engineering guide. https://inference-engineering.com/guide-kv-cache.html
- **S12** — "The State of FP8 KV-Cache and Attention Quantization in vLLM", vLLM blog, 2026-04-22. https://vllm-project.github.io/2026/04/22/fp8-kvcache.html
- **S13** — "KV Cache Optimization for LLMs 2026: Engineering Guide", Digital Applied, 2026-04-24. https://www.digitalapplied.com/blog/kv-cache-optimization-techniques-2026-engineering-guide
- **S14** — "LLM Inference Engineering: From KV Cache to PagedAttention", 2026-08-19. https://baeseokjae.github.io/posts/llm-inference-engineering-guide/
- **S15** — "Contextual Retrieval in Production RAG", LLMs Blog, 2026-08-20. https://www.llms.blog/posts/contextual-retrieval-in-production-rag-architecture-prompt-caching-economics-hybrid-fusion-and-reranking-pipelines
- **S16** — "RAG in Production: The Complete Guide", Prompt20, 2026-05-14. https://blog.prompt20.com/posts/rag-production-architecture/
- **S17** — "Hybrid Retrieval: BM25, RRF, and Cross-Encoder Reranking", codexpedite, 2026-09-04. https://codexpedite.dev/articles/hybrid-retrieval-pipeline-rrf-reranking
- **S18** — "2026 Guide: Evaluate AI Agents in Production (3 Levels)", Kunal Ganglani, 2026-07-12. https://www.kunalganglani.com/blog/evaluate-ai-agents-production
- **S19** — "ATLAS: Dual-Horizon Diagnostic Evaluation for Industrial Tool-Use Agents", arXiv:2608.30685, 2026-08-31. https://arxiv.org/abs/2608.30685
- **S20** — "Parity-Aware Byte-Pair Encoding: Improving Cross-lingual Fairness in Tokenization", ACL 2026. https://aclanthology.org/2026.acl-long.342.pdf
- **S21** — "MUTANT: A Recipe for Multilingual Tokenizer Design", ACL 2026. https://aclanthology.org/2026.acl-long.2146.pdf
- **S22** — "The Token Tax: Systematic Bias in Multilingual Tokenization", ACL 2026 AfricaNLP. https://aclanthology.org/2026.africanlp-main.10.pdf
- **S23** — "Vowel Signs Are Not Letters: A Pre-tokenization Ceiling on Multilingual Tokenizer Fertility", arXiv:2608.26449, 2026-08-26. https://arxiv.org/abs/2608.26449
- **S24** — "FP8 vs INT8 vs INT4: Picking a Quantization Format for LLM Inference", dreaming.press, 2026-06-23. https://dreaming.press/posts/2026-06-23-fp8-vs-int8-vs-int4-quantization.html
- **S25** — "Quantization" (PTQ/QAT, FP8/INT8/INT4), NVIDIA NeMo Framework User Guide 25.11. https://docs.nvidia.com/nemo-framework/user-guide/25.11/nemotoolkit/nlp/quantization.html
- **S26** — "Quantization for LLM Inference: GPTQ AWQ FP8 INT4", AI Infrastructure Knowledge Base. https://ai-infrastructure.net/quantization-inference/
- **S27** — "Embeddings in Practice: Every Major Model Compared", Stochastic Sandbox, 2026-03-31. https://stochasticsandbox.com/posts/embeddings-in-practice-every-major-model-compared-2026-03-31/
- **S28** — "What's New" (Matryoshka embed_dim support, multimodal tasks), MTEB docs. https://docs.mteb.org/whats_new/
- **S29** — "Diffusion vs Flow Matching: Two Names for One Family", Alessio Borgi, 2026-07-13. https://alessioborgi.github.io/blog/diffusion/diffusion-vs-flow-matching/
- **S30** — "Frequency-Aware Flow Matching for High-Quality Image Generation", CVPR 2026 / arXiv:2604.15521. https://arxiv.org/abs/2604.15521
- **S31** — "Are LLM Benchmarks Already Contaminated? A Systematic Review of Contamination Detection Methods", ACL 2026 GEM. https://aclanthology.org/2026.gem-main.50.pdf
- **S32** — "Benchmark Contamination: A Taxonomy Organized by Defeated Mitigation", arXiv:2608.29463, 2026-08-29. https://arxiv.org/abs/2608.29463
- **S33** — "Controllable Contamination Detection for Reliable LLM Evaluation with Statistical Guarantees", ACL 2026. https://aclanthology.org/2026.acl-long.1390.pdf
- **S34** — "Are Tabular Foundation Models Ready to Replace Gradient Boosting Models?", Towards AI, 2026-07-31. https://pub.towardsai.net/are-tabular-foundation-models-ready-to-replace-gradient-boosting-models-cb039b955162
- **S35** — "TabPFN-3: Technical Report", Prior Labs, arXiv:2605.13986. https://arxiv.org/pdf/2605.13986
- **S36** — Controlled comparison of 8 post-training algorithms across scales, arXiv:2603.19335. https://arxiv.org/pdf/2603.19335
- **S37** — "LongFlow: KV Cache Compression for Long-Output Reasoning Models", arXiv:2603.11504. https://arxiv.org/pdf/2603.11504v1
- **S38** — "How to Rerank RAG Retrieval Results: From Hybrid Retrieval to Cross-Encoders, Listwise Ranking, and Evidence-Set Selection", SiBlog, 2026-07-29. https://sinimite.work/en/posts/rag-reranking-best-practices-2026/
- **S39** — "RLHF to GRPO and Beyond: How Reinforcement Learning Is Transforming LLM Training Pipelines", Algorithmine, 2026-08-12. https://algorithmine.com/research/rlhf-grpo-llm-training-pipelines-2026
