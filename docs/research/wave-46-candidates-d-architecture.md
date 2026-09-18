# Wave 46 — Architecture candidates D (Scientist survey)

Date: 2026-09-19. Repo: deepforge. Scope: scientist survey only. Exactly one file written
(`docs/research/wave-46-candidates-d-architecture.md`); no repo code touched; no git.
Method: **28 web searches** (parallel.ai) plus direct arXiv fetches of the load-bearing papers
(Zoology, "Repeat After Me", MAD, Saturated Transformers/TC0, Let's Verify Step by Step) on
2026-09-19. The search provider rate-limited (HTTP 429) the final ~11 queries, so a handful of
remaining URLs are canonical arXiv IDs cited from the papers themselves and marked `[unverified-fetch]`.

**Honesty contract.** Grades: NEW CATEGORY / BREAKTHROUGH 10x+ / PARTIAL GAP / EXISTS (skip) / HARD.
"EXISTS" means the mechanism *and* the contract already exist; a mere composition is not a candidate.
Small-scale gains routinely vanish at scale, so every advantage is stated with its axis and a
falsifiable Stage-1 test. Where a mechanism already exists (Mamba / RWKV-7 / DeltaNet / Miras) I
propose only a genuinely new *component*, never a re-skin.

---

## 1. Mandatory existence map (1 line each; URL + date)

### 1.1 Transformer variants
- **Sparse MoE:** Mixtral 8x7B, 2-of-8 expert routing, 13B active of 47B — https://arxiv.org/abs/2401.04088 (2024-01-08).
- **MoE + MLA:** DeepSeek-V2 compresses KV to a latent vector, 93.3% KV reduction — https://arxiv.org/abs/2405.04434 (2024-05-07).
- **Soft MoE:** fully-differentiable slot routing, fixes token-drop/instability — https://arxiv.org/abs/2308.00951 (2023-08-02).
- **Mixture-of-Depths:** top-k token routing through a block vs. residual, static compute budget — https://arxiv.org/abs/2404.02258 (2024-04-02).
- **Mixture-of-Recursions:** shared recursive block + per-token recursion depth + KV sharing — https://proceedings.neurips.cc/paper_files/paper/2025/hash/8b08bbf8b420faa6eeb4020720582ec7-Abstract-Conference.html (NeurIPS 2025).
- **Early exit / CALM:** confidence-calibrated per-token exit, ~3x inference speedup — https://arxiv.org/abs/2207.07061 (2022-07-14); Depth-Adaptive Transformer https://arxiv.org/abs/1910.10073 (2019-10-22); EE is intrinsic https://arxiv.org/abs/2412.01455 (2024-12-02).
- **Linear attention:** kernelized attention as an RNN, O(N) — https://arxiv.org/abs/2006.16236 (2020-06-29).
- **Sliding-window:** Longformer/BigBird local+global sparse attention — https://arxiv.org/abs/2004.05150 (2020-04-10) `[unverified-fetch]`.
- **Long-context RoPE:** YaRN, 10x fewer tokens for context extension — https://arxiv.org/abs/2309.00071 (2023-08-31).
- **SSM line:** S4 https://arxiv.org/abs/2111.00396 (2021-10-31); Mamba selective SSM https://arxiv.org/abs/2312.00752 (2023-12-01) `[unverified-fetch]`; Mamba-2/SSD 2–8x faster https://arxiv.org/abs/2405.21060 (2024-05-31); Mamba-3 listed in https://github.com/state-spaces/mamba/blob/main/README.md (2026, arXiv:2603.15569).
- **RWKV:** v5/6 matrix-valued states https://arxiv.org/abs/2404.05892 (2024-04-08) `[unverified-fetch]`; v7 "Goose" generalized delta rule, claims all regular languages + S5 state tracking — https://arxiv.org/abs/2503.14456 (2025-03-18).
- **xLSTM:** exponential gating, sLSTM/mLSTM matrix memory, covariance update — https://arxiv.org/abs/2405.04517 (2024-05-07).
- **Hyena:** interleaved implicit long convolutions + gating, >50-pt recall gain over SSMs — https://arxiv.org/abs/2302.10866 (2023-02-21).
- **Hybrids:** Jamba Transformer+Mamba+MoE, 256K context — https://arxiv.org/abs/2403.19887 (2024-03-28); Griffin/Hawk gated linear recurrence + local attention — https://arxiv.org/abs/2402.19427 (2024-02-29) `[unverified-fetch]`; RecurrentGemma — https://arxiv.org/abs/2404.07839 (2024-04-11).
- **Test-time memory:** Titans neural long-term memory — https://arxiv.org/abs/2501.00663 (2024-12-31) (critical reimplementation: https://arxiv.org/abs/2510.09551, 2025-10-10).
- **Gated linear attention:** FlashLinearAttention, length generalization 2K→20K — https://arxiv.org/abs/2312.06635 (2023-12-11).
- **RetNet:** retention, parallel/recurrent/chunkwise, O(1) inference — https://arxiv.org/abs/2307.08621 (2023-07-17).
- **DeltaNet:** fast-weight delta update, hardware-parallel over sequence — https://arxiv.org/abs/2406.06484 (2024-06-10).
- **Sparse attention at scale:** DeepSeek Native Sparse Attention, natively trainable — https://arxiv.org/abs/2502.11089 (2025-02-16); MiniMax lightning attention hybrid, 1M–4M context — https://arxiv.org/abs/2501.08313 (2025-01-14).

### 1.2 Memory / associative
- **Modern Hopfield:** exponential capacity, one-step retrieval, = attention — https://arxiv.org/abs/2008.02217 (2020-08-05); tutorial https://arxiv.org/abs/2507.06211 (2025-07-08).
- **Fast weight programmers:** linear attention ≡ additive outer-product memory; delta rule fixes capacity — https://arxiv.org/abs/2102.11174 (2021-02-22).
- **NTM lineage:** controller + differentiable external tape, learns copy/sort/recall — https://arxiv.org/abs/1410.5401 (2014-10-20); DNC adds content lookup + temporal links (Graves et al., *Nature* 538:471, 2016) `[unverified-fetch]`; "Transformers are stateless DNC" formalism https://arxiv.org/abs/2603.19272 (2026).
- **KV compression:** survey of selection/budget/merge/quantization/low-rank — https://arxiv.org/abs/2412.19442 (2024-12-27).
- **Retrieval-augmented:** RETRO chunked cross-attention vs 2T-token DB — https://arxiv.org/abs/2112.04426 (2021-12-07); REALM https://arxiv.org/abs/2002.08909 (2020-02-20) `[unverified-fetch]`.
- **Episodic/parametric memory layers:** product-key exact lookup, memory >2x-compute dense models — https://arxiv.org/abs/2412.09764 (2024-12-12); Large Memory Layers w/ Product Keys https://arxiv.org/abs/1907.05242 (2019-07-10).
- **State-space memory theory:** Miras (memory/bias/retention/optimizer), MONETA/MEMORA/YAAD — https://arxiv.org/abs/2504.13173 (2025-04-17); ATLAS optimal test-time memory, 10M-token BABILong — https://arxiv.org/abs/2505.23735 (2025-05-29).

### 1.3 Reasoning / verification architectures
- **Depth recurrence / latent reasoning:** Universal Transformer https://arxiv.org/abs/1807.03819 (2018-07-09) `[unverified-fetch]`; looped transformers match kL layers with k layers looped L times — https://arxiv.org/abs/2502.17416 (2025-02-24); depth-recurrent Huginn / recurrent-depth systematic generalization https://arxiv.org/abs/2604.07822 (COLM 2026).
- **Latent CoT:** Coconut feeds hidden state back as input, BFS-like search, beats CoT on planning — https://arxiv.org/abs/2412.06769 (2024-12-09).
- **CoT + distillation authority:** CoT prompting https://arxiv.org/abs/2201.11903 (2022-01-28); Distilling step-by-step `[unverified-fetch]` https://arxiv.org/abs/2305.02301.
- **Toolformer:** self-supervised API-call insertion as a learned behavior — https://arxiv.org/abs/2302.04761 (2023-02-09) `[unverified-fetch]`.
- **Verifier heads / process supervision:** PRM800K, process ≫ outcome supervision — https://arxiv.org/abs/2305.20050 (2023-05-31) **[fetched]**.
- **Dual-process framing:** System-1/System-2 is a *framing*, not an architecture; its only architectural instantiations found are latent-CoT/looping above (no separate dual-network architecture with a verified interface).

### 1.4 Efficiency axes / small-scale benchmarks
- **Scaling laws:** Kaplan https://arxiv.org/abs/2001.08361 (2020-01-23) `[unverified-fetch]`; Chinchilla https://arxiv.org/abs/2203.15556 (2022-03-29) `[unverified-fetch]`; non-transformer scaling (Mamba empirical) https://arxiv.org/abs/2406.07522 (2024-06-11) `[unverified-fetch]`.
- **Synthetic unit tests predictive of scaling:** MAD (compression/recall/IMO), 70M–7B — https://arxiv.org/abs/2403.17844 (2024-03-26) **[fetched]**.
- **Associative-recall benchmark:** Zoology/MQAR — https://arxiv.org/abs/2312.04927 (2023-12-08) **[fetched]**.
- **Natural small-scale LMs:** TinyStories (tens of M params) https://arxiv.org/abs/2305.07759 (2023-05-12) `[unverified-fetch]`; char-LM/enwiki8 https://arxiv.org/abs/1808.04444 (2018-08-14) `[unverified-fetch]`, Hutter Prize http://prize.hutter1.net/.
- **State-tracking probe:** S5 / permutation composition, flip-flop, parity (used across RWKV-7 and looped-transformer papers above).

### 1.5 Known negatives (what repeatedly fails)
- **Recall is the gap:** 82% of the gated-conv vs attention perplexity gap is associative recall; a 70M attention model beats a 1.4B gated-conv model — https://arxiv.org/abs/2312.04927 (2023-12-08) **[fetched]**.
- **Copying is a hard GSSM limit:** fixed-state models cannot copy unbounded strings; 2-layer transformer can copy exponential-length strings — https://arxiv.org/abs/2402.01032 (2024-02-01) **[fetched]**.
- **Transformers are TC0:** saturated transformers ⊆ constant-depth threshold circuits, so no state tracking without depth/CoT — https://arxiv.org/abs/2106.16213 (2021-06-30) **[fetched]**; log-precision version https://arxiv.org/abs/2207.00729 (2022-07-05) `[unverified-fetch]`; CoT changes the bound https://arxiv.org/abs/2310.07923 (2023-10-12) `[unverified-fetch]`.
- **Linear attention underperforms softmax and its recurrent form is I/O-bound** — https://arxiv.org/abs/2312.06635 (2023-12-11); recall–throughput tradeoff formalized (Based) https://arxiv.org/abs/2402.18668 (2024-02-28) `[unverified-fetch]`.
- **Test-time memory is not reproducible as published:** Titans reimplementation found chunking erases some gains — https://arxiv.org/abs/2510.09551 (2025-10-10).
- **Recurrent training instability:** Mamba/Hawk/KV issues motivating RMSNorm/clipped sqrt gradients — https://arxiv.org/abs/2404.07839 (2024-04-11) and https://arxiv.org/abs/2406.07522 `[unverified-fetch]`.

---

## 2. Where the real gap is (read of the map)

Four axes are heavily contested and therefore **not** candidates: subquadratic sequence mixing,
recall-via-delta-rule memory, parametric key-value memory, and adaptive depth/exit. Three axes are
documented as *broken or absent* and remain unclaimed as architecture contracts:

- **G1 — Verifiable context use.** No trained architecture emits a machine-checkable witness of
  which stored items it read/wrote. NTM/DNC addressing is soft and unwitnessed (1410.5401);
  attention attribution is post-hoc; process supervision verifies *reasoning text*, not memory
  access (2305.20050).
- **G2 — Exact, hard-addressed, test-time memory.** NTM/DNC = soft blurry writes; DeltaNet/RWKV-7
  = dense superposition (no address, interference); Memory Layers/Product Keys = *train-time
  parametric* memory, not per-sequence (2412.09764); RETRO/RAG = frozen external store, no
  differentiable write (2112.04426). Hard addressing + test-time write + exact read does not exist
  as a sequence core.
- **G3 — Certified compute / state path.** MoD/MoR/early-exit route by learned importance but never
  emit a calibrated correctness certificate for the routing or the state transition (2404.02258;
  CALM 2207.07061); state-tracking recurrences (RWKV-7) give no externally replayable trace.

Candidates below are ranked by (missing × impact × CPU-feasibility). All Stage-1 tests use
synthetics (MQAR, copy, S5, needle) where CPU cost is minutes, not the natural-text SOTA that would
be dishonest to promise from 1–50M params.

| # | Candidate | Axis | Grade | Lead? |
|---|---|---|---|---|
| 1 | **VERM** — Verified Exact Recall Memory | memory + verifiability | **NEW CATEGORY** (address+contract); memory alone PARTIAL | **yes** |
| 2 | **CAC** — Certificated Adaptive Compute | quality/compute + verifiability | PARTIAL GAP (high composition risk) | only if #1 stalls |
| 3 | **CSM** — Certified State-Machine layer | state tracking + verifiability | PARTIAL GAP | no (RWKV-7 adjacent) |
| 4 | **HVA** — Hierarchical Verified Anchors | long context + verifiability | PARTIAL GAP | no |

---

## Candidate 1 — VERM: Verified Exact Recall Memory

**1. One-liner.** Replace attention/SSM sequence mixing with a *test-time, hard-addressed,
collision-resolving key-value store* whose every read and write emits a replayable witness
(slot ids, hashed keys, policy decisions), so the model both recalls exactly at O(1) resident
state per layer and can prove which context it used.

**2. What exists / what does NOT.** Exists: soft addressable memory (NTM, 1410.5401), dense
delta-rule memory (DeltaNet 2406.06484; RWKV-7 2503.14456), train-time product-key lookup
(1907.05242; 2412.09764), frozen retrieval (RETRO 2112.04426), stateless-DNC formalization of
attention (2603.19272). Does **not** exist: a sequence core that (a) hard-addresses at *test time*,
(b) resolves collisions with an explicit policy, (c) emits a verifiable access log. Gap = G1 ∧ G2.

**3. Advantage + axis.** Memory (O(1) resident per layer, O(N) total; no KV growth) and recall
(exact-match read avoids superposition, so should match attention on MQAR/Zoology at far fewer
params); verifiability (replay the access log). Axis = **memory + verifiability**, with a
secondary recall/parameter-efficiency claim. Not claimed: perplexity SOTA.

**4. Why now.** Recall gap localized + quantified (2312.04927; 2402.01032); delta-rule writes now
parallelize (2406.06484); exact product-key lookup proven to 128B params (2412.09764);
verification culture mainstream (2305.20050); synthetic unit tests shown predictive of scaling so a
CPU result is publishable (2403.17844).

**5. Architecture sketch.** Per layer, per token: (i) project x_t → q,k,v; (ii) `hash(q)` →
exactly one primary slot (+ short collision probe chain of length c); (iii) **read** = key-match
compare → if match return its value exactly, else load nearest of k candidates; (iv) **write** =
if same key, overwrite via delta correction, else allocate/evict by LRU; (v) a small local
conv/linear-attention term mixes neighbors; (vi) a witness head emits w_t. Complexity per token:
O(d²) projections + O(1+c) hash/probe + O(k) compare — linear, no N dependence. Parameters:
projections + hash MLP only (slots are activations, not parameters ⇒ capacity scales with N, not
params). Δ vs transformer: attention O(N·d)/token and grows KV; VERM is O(d²+k) and fixed resident.
Hybrid fallback: one attention layer every 4 for soft content; witness then records the soft path too.

**6. Stage-1 CPU milestone (≤1h).** Datasets: MQAR (Zoology/MAD format), string copy
(2402.01032), TinyStories char-subset. Model 3–15M params, seq 256–1024, PyTorch fp32 CPU,
baseline = vanilla transformer and a DeltaNet of equal params + equal FLOPs. Non-goals: no
pretrained weights, no natural-LM SOTA, no large vocab, no multi-GPU. Trains in ~20–50 min.

**7. Decisive first experiment (pass/fail).** Pass: VERM reaches ≥95% exact MQAR recall at N=1024
using ≤1/10 the params of a transformer that first reaches ≥95%; copy accuracy stays ≥95% for
lengths 4x train length at O(1) resident state; and **100%** of recorded memory steps replay-verify
(recompute hash+checksum from witness+input). Fail: recall <90% (interference), witness mismatch
>0, or copy degrades with length (i.e. it behaved like a GSSM, 2402.01032).

**8. Failure modes / scaling.** Hard hash needs straight-through/REINFORCE → gradient noise; learned
hash can collapse to few slots; collisions degrade to superposition; LRU eviction kills long-range
facts; witness is meaningless if the soft-mixer path dominates; on natural text the memory churns,
likely no LM gain. **Small-scale recall wins often shrink** once attention has enough params.

**9. Grade.** **NEW CATEGORY** on the hard-address + witness contract. The hard-addressed memory
component alone is PARTIAL (NTM/DeltaNet near), so the novelty rests on (c) verification.

---

## Candidate 2 — CAC: Certificated Adaptive Compute

**1. One-liner.** A router that, per token, selects depth/experts *and* emits a calibrated
correctness certificate for that selection, so the model can skip compute when it certifies
"this token is already solved" and be audited when it does not.

**2. What exists / what does NOT.** Exists: MoD/MoR top-k routing (2404.02258; MoR NeurIPS 2025),
CALM calibrated exit (2207.07061), depth-adaptive exit (1910.10073), MoE (2401.04088). Does NOT
exist: routing coupled to an *externally checkable* per-token certificate (e.g. a low-rank
signature whose reuse replays the exact same computation), or architectures trained to be robust to
certificate-gated halting. Gap = G3.

**3. Advantage + axis.** Quality/compute: equal accuracy at lower FLOPs with a *checked* saving
certificate; verifiability of the compute path. Axis = **quality per compute + verifiability**.

**4. Why now.** MoD shows 50% faster sampling at equal quality (2404.02258); MoR unifies recursion +
adaptive depth (NeurIPS 2025); CALM gives confidence-based exit guarantees (2207.07061); but no work
makes the saving independently verifiable, which matters for agent/audit settings.

**5. Architecture sketch.** Block = [router(x_t) → (expert id, depth d, certificate c_t)] then
[run chosen sub-network] then [certificate head updates c_t]. Certificate = a quantized hash of the
expert/depth path + a calibrated score. Verifier recomputes path hash and checks score ≥ threshold.
Complexity: O(d·E) routing + active expert cost; skipped tokens cost O(d). Params scale like MoE/MoD.

**6. Stage-1 CPU milestone.** Synthetic variable-difficulty tasks (parity, addition with carries,
p-hop induction) with per-token difficulty labels + TinyStories. 3–20M params, fp32 CPU, ≤1h.
Baseline: MoD-style router and CALM. Non-goals: no GPU throughput claims, no serving system.

**7. Decisive experiment.** Pass: within 1% accuracy, certificate-gated halting uses ≤60% of
baseline FLOPs and certificate ECE ≤0.05, and path-hash replay matches on 100% of steps. Fail:
savings <25% at equal accuracy, or ECE >0.1 (uncalibrated certificate = no contract).

**8. Failure modes / scaling.** Router gaming; certificates miscalibrated and cheap to fool; compute
savings are memory-bound on GPUs and may not survive batching; strongly overlaps MoD/MoR, so the
delta may be judged a feature not architecture. Grade risk high.

**9. Grade.** **PARTIAL GAP** (composition risk high).

---

## Candidate 3 — CSM: Certified State-Machine layer

**1. One-liner.** A block with an explicit finite-group state register (permutation/affine element)
plus a recall memory, that emits a replayable *trace* of group updates, so the model can state-track
beyond TC0 and prove the state trajectory.

**2. What exists / what does NOT.** Exists: TC0 limit (2106.16213), CoT raises it (2310.07923),
RWKV-7 claims S5 state tracking + all regular languages (2503.14456), looped transformers give
depth generalization (2504.17416; 2604.07822). Does NOT exist: an architecture whose state
transition is emitted as a checkable trace (group element per step) and can be verified
independently of the network. Gap = G3 on the state path.

**3. Advantage + axis.** State tracking at shallow depth + verifiability of the trajectory; possible
parameter win vs. depth (~log n) transformers. Axis = **state tracking + verifiability**.

**4. Why now.** RWKV-7 proved state tracking is achievable by a parallelizable recurrence
(2503.14456); TC0/CoT theory is settled (2106.16213; 2310.07923); looped models show depth
extrapolation (2604.07822). No one has made the transition auditable.

**5. Architecture sketch.** Per token: read x_t → emit group element g_t ∈ S5 (via a learned
classifier/straight-through one-hot) → update state s ← g_t · s (exact group op) → matrix memory for
recall as in DeltaNet → output; trace head emits g_t. Complexity O(|G| + d²) per token; params
O(d²) per layer. Δ vs transformer: explicit state (correct by construction) instead of emergent.

**6. Stage-1 CPU milestone.** Synthetic S5 word problem, flip-flop, parity, A5 at lengths 8–64;
MQAR for recall; 1–10M params, fp32 CPU, ≤1h. Baseline: fixed-depth transformer (needs ≥8 layers),
RWKV-7-style recurrence without trace. Non-goals: no natural-language reasoning.

**7. Decisive experiment.** Pass: ≥99% S5 accuracy at ≤4 layers and generalization to held-out
lengths where the transformer baseline fails or needs ≥8 layers, with trace replay matching on 100%
of steps. Fail: <99%, or depth advantage absent, or trace does not cover the learned computation.

**8. Failure modes.** Discrete group op is non-differentiable; hard to learn beyond small groups;
trace covers finite-state only, not general reasoning; RWKV-7 already does state tracking, so the
sole novelty is the certificate — narrow.

**9. Grade.** **PARTIAL GAP**.

---

## Candidate 4 — HVA: Hierarchical Verified Anchors

**1. One-liner.** During decoding, build a tree of summary "anchors" over past spans; retrieval of
any past token returns an exact pointer path from root to the original span, verifiable offline,
while resident state stays O(√N).

**2. What exists / what does NOT.** Exists: KV eviction/compression (2412.19442), sparse attention
(2502.11089; 2501.08313), retrieval trees (RAPTOR-like) `[unverified-fetch]`, chunked memory
(2112.04426). Does NOT exist: an architecture that guarantees *exact* retrieval of any original span
through a verifiable anchor path at sublinear resident memory. Eviction methods are lossy and give no
provenance (2412.19442; "The Pitfalls of KV Cache Compression" 2510.00231). Gap = long-context ∧ G1.

**3. Advantage + axis.** Long context at bounded memory, plus exact provenance of every retrieved
span. Axis = **long context + verifiability**.

**4. Why now.** KV growth is the dominant serving cost (2412.19442); sparse/hybrid attention proves
subquadratic long context works (2502.11089; 2501.08313); but none of these let you audit what was
retrieved.

**5. Architecture sketch.** Every B tokens, summarize the span and insert an anchor (key = span
signature, value = summary + pointer to raw tokens); reads do top-k anchor lookup then exact
pointer dereference. Complexity per token O(d²) amortized + O(log N) tree; resident state O(√N).
Params scale with summarizer + query nets.

**6. Stage-1 CPU milestone.** Synthetic needle-in-a-haystack at 4k–32k, plus a small BABILong-style
multi-hop subset; 5–20M params, fp32 CPU, ≤1h inference/training on synthetic. Baseline: full
attention (quadratic) and small-scale StreamingLLM/H2O. Non-goals: no real-corpus long-context SOTA.

**7. Decisive experiment.** Pass: 200/200 exact needle retrieval at 32k with ≤2k resident state and
100% pointer-path verification to the original span. Fail: <95% exactness or resident state
approaching full KV (i.e. eviction-like behavior).

**8. Failure modes.** Summary loss destroys exactness; tree build cost; pointers only verify exact
spans, not semantic claims; overlaps retrieval/eviction literature so novelty is the provenance
contract only.

**9. Grade.** **PARTIAL GAP**.

---

## 3. Explicitly skipped (EXISTS — do not re-propose)

- Recall memory: DeltaNet (2406.06484), RWKV-7 (2503.14456), Miras/MONETA/MEMORA/YAAD (2504.13173),
  Titans/ATLAS (2501.00663; 2505.23735) — occupies G2 without verification.
- Parametric memory: Product Keys (1907.05242), Memory Layers at Scale (2412.09764).
- Adaptive depth/compute: MoD (2404.02258), MoR (NeurIPS 2025), CALM (2207.07061) — occupies G3
  without certificates.
- State tracking mechanism: RWKV-7 (2503.14456) already does it; only the trace is new.
- Hybrid long context: Jamba (2403.19887), NSA (2502.11089), MiniMax-01 (2501.08313).

## 4. Honest closing

The only defensible "does not exist yet" claim here is **the verification contract** (G1/G3): emit a
replayable witness of memory/compute/state. That is an architecture-level output contract, not a
post-hoc tool, and it is testable on CPU in minutes. The recall/state-tracking/memory *mechanisms*
are being filled fast by DeltaNet/RWKV-7/Miras every few months; a candidate whose only delta is a
mechanism will likely be EXISTS by the next wave. All four candidates share the same risk: on
natural text at 1–50M params the gains may be invisible, and any claimed 10x is a synthetic-task
claim, not a scaling claim. Stage-1 is designed to falsify, not to impress.
