import type { Paper } from "./types";

/**
 * Second era of the curriculum: the papers that made DeepSeek cheap to train
 * and cheap to serve. MLA compresses the KV cache, DeepSeekMoE makes the FFN
 * sparse, Loss-Free Balancing takes the router off the loss, Fire-Flyer shows
 * the cluster design, and DeepSeek-V3 puts all of it together at 671B.
 */
export const EFFICIENCY_PAPERS: Paper[] = [
  {
    id: "deepseek-v2",
    slug: "deepseek-v2",
    title:
      "DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model",
    short: "DeepSeek-V2",
    year: 2024,
    date: "2024-05-07",
    arxivId: "2405.04434",
    url: "https://arxiv.org/abs/2405.04434",
    kind: "paper",
    era: "efficiency",
    tier: "core",
    tagline:
      "Compress the KV cache into a latent, make the experts fine-grained, and get a stronger model for less money.",
    whatItIs:
      "DeepSeek-V2 is a 236B-parameter mixture-of-experts language model that activates only 21B parameters per token. It pairs Multi-head Latent Attention (MLA), which caches a small latent vector instead of full keys and values, with DeepSeekMoE, which splits the feed-forward network into many fine-grained experts plus a few shared ones. Against the dense DeepSeek 67B it saves 42.5% of training cost, cuts the KV cache by 93.3%, and raises maximum generation throughput 5.76x. It was pretrained on 8.1T tokens with a 128K context window.",
    theoryMinutes: 18,
    lineage: {
      from: "deepseek-llm",
      to: ["deepseek-coder-v2", "deepseek-v3"],
      context:
        "The second-era opener. It keeps the transformer backbone of DeepSeek-LLM and the fine-grained expert idea of DeepSeekMoE, then attacks the two costs that dominate the lifecycle of a model: the KV cache that makes attention memory-bound at inference, and the dense FFN that makes every extra parameter expensive to train and serve.",
      improved: [
        "MLA compresses keys and values into a single 512-dim latent per token per layer, plus a 64-dim decoupled key that carries RoPE, shrinking the cache to the equivalent of GQA with 2.25 groups while beating MHA on quality.",
        "DeepSeekMoE uses 160 fine-grained routed experts (6 activated per token) plus 2 always-on shared experts, so total parameters grow without per-token compute growing with them.",
        "Training cost drops 42.5% versus the dense DeepSeek 67B: 172.8K versus 300.6K H800 GPU-hours per trillion tokens.",
        "KV cache falls 93.3% and maximum generation throughput rises to 5.76x (over 50K tokens per second on a single 8-GPU H800 node).",
        "Device-limited routing plus expert, device, and communication balance losses keep expert-parallel training efficient, and YaRN (a position-encoding extension method) extends the context window from 4K to 128K.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The bottleneck at inference time",
        text: "A transformer generates one token at a time. To predict token t, every attention layer compares that token's query against the keys of all earlier tokens and then mixes their values. Recomputing keys and values from scratch at every step would repeat work, so serving systems cache them: the KV cache. The arithmetic is unforgiving. A cache entry holds 2 vectors (one key, one value) of size d_head for each head, across n_heads heads and L layers, and it grows by that amount for every token of context. A 60-layer model with 128 heads of width 128 stores 2 * 128 * 128 * 60 = 1.97M numbers per token before any batching, so at long context the cache, not the weights, dominates memory and bandwidth.",
      },
      {
        kind: "prose",
        heading: "Store a latent, rebuild the keys and values",
        text: "MLA never stores keys and values. It stores one small latent vector per token per layer, produced by a down-projection: c_t = W_DKV * h_t, with dimension 512 instead of 2 * 128 * 128 = 32768. Keys and values are reconstructed by two up-projections, k = W_UK * c and v = W_UV * c. Because those projections are linear, W_UK can be folded into the query projection and W_UV into the output projection at inference, a trick the paper calls absorption, so attention can run against the compressed vectors directly. Positions are the one thing that cannot survive compression: RoPE would sit between the projections and break absorption. MLA therefore keeps a separate 64-dimensional key that carries RoPE. Total cached per token per layer: 512 + 64 = 576 numbers, the same as grouped-query attention (GQA) with only 2.25 groups, but with quality above standard multi-head attention (MHA).",
      },
      {
        kind: "visual",
        visual: "mla-latent",
        caption:
          "Multi-head Latent Attention: cache one 512-dim latent plus a 64-dim RoPE key per token per layer, and reconstruct keys and values inside attention. Full MHA would cache 32768 numbers per layer per token.",
      },
      {
        kind: "formula",
        label: "MLA: compress once, reconstruct in attention",
        expression:
          "c_t = W_DKV * h_t\nk_t = W_UK * c_t,  v_t = W_UV * c_t\ncache per token per layer = 512 + 64 = 576 << 2 * 128 * 128 = 32768",
        why: "The down-projection is where compression happens. The up-projections happen inside attention, and at inference they fold into the query and output weights, so only c_t and the small RoPE key are ever written to memory. The win is memory traffic, which is exactly what decode is bound by.",
      },
      {
        kind: "prose",
        heading: "Make the feed-forward layer sparse",
        text: "Attention is only half the compute. The other half is the feed-forward network, normally one wide MLP applied to every token. A mixture-of-experts layer replaces it with N smaller expert MLPs plus a router: score every expert for each token, keep the top K, and add their outputs weighted by the scores. Total parameters grow with N; per-token FLOPs grow only with K. DeepSeekMoE adds two choices. First, finer granularity: 160 small routed experts with 6 activated, so a token's computation is assembled from many small pieces and each expert can specialize. Second, shared experts: 2 experts that every token uses, absorbing common patterns so the routed experts do not all relearn them. DeepSeek-V2 replaces every FFN except the first with an MoE layer.",
      },
      {
        kind: "formula",
        label: "Top-K routed MoE layer",
        expression:
          "h' = u + sum_i FFN_i^shared(u) + sum_i g_i * FFN_i^routed(u)\ng_i = s_i if s_i in TopK({s_j}, K_r) else 0\ns_i = softmax(u^T * e_i)",
        why: "s_i is the affinity between token u and expert centroid e_i. TopK keeps only the K_r largest scores, so only those expert MLPs run, and g_i weights their outputs. Everything else in a MoE layer is about which experts get picked and how evenly the traffic is spread.",
      },
      {
        kind: "prose",
        heading: "Keeping a sparse layer trainable and shippable",
        text: "Two practical problems come with sparsity. Unbalanced routing means some experts never train, a failure called routing collapse, and under expert parallelism it also means some devices idle while others queue. The paper attacks this with three auxiliary losses (expert-level, device-level, communication-level) and a token-dropping rule during training: each device keeps only its share of tokens, dropping the lowest-affinity ones, with about 10% of sequences exempt. Device-limited routing bounds communication by sending each token to at most M devices, which the authors find matches unrestricted routing once M >= 3. Without rules like these, a sparse model is theoretically cheap and practically slow.",
      },
      {
        kind: "visual",
        visual: "fine-grained-experts",
        caption:
          "DeepSeekMoE at V2 scale: 2 shared experts always on, 160 fine-grained routed experts with 6 firing per token. Fine granularity plus shared experts buys specialization without duplicating common knowledge.",
      },
      {
        kind: "prose",
        heading: "What the design buys",
        text: "Against DeepSeek 67B: 42.5% less training cost (172.8K versus 300.6K H800 GPU-hours per trillion tokens), 93.3% smaller KV cache, and 5.76x higher maximum generation throughput, over 50K tokens per second on one 8-GPU H800 node. Pretraining ran on 8.1T tokens with a 100K-vocabulary tokenizer, then YaRN extended the window from 4K to 128K. The report is candid that none of this is a free win: compression adds projections, routing adds communication, and the balance losses trade routing quality against model quality unless tuned carefully.",
      },
      {
        kind: "code",
        title: "KV cache size: dense MHA versus MLA",
        language: "python",
        code: `def dense_cache(n_heads, d_head, layers, ctx, bytes_per=2):
    return 2 * n_heads * d_head * layers * ctx * bytes_per

def mla_cache(d_latent, d_rope, layers, ctx, bytes_per=2):
    return (d_latent + d_rope) * layers * ctx * bytes_per

dense = dense_cache(128, 128, 60, 8192)
sparse = mla_cache(512, 64, 60, 8192)
print(dense // sparse)  # 56x fewer bytes at the same context`,
        notes: [
          "V2 caches 576 numbers per token per layer: the 512-dim latent plus the 64-dim decoupled RoPE key.",
          "Decode is memory-bound, so a smaller cache buys a longer context or a bigger batch on the same hardware.",
        ],
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem",
        text: "Serving a strong open model is dominated by two costs: KV cache memory at long context, and the FLOPs of a dense FFN at every token. Training a good model is dominated by how many parameters you can afford to update and how evenly the work spreads across devices.",
      },
      {
        kind: "prose",
        heading: "Key idea",
        text: "Answer both with architecture. MLA compresses each token's keys and values into a 512-dim latent plus a 64-dim RoPE key and reconstructs them inside attention, cutting the cache 93.3% while improving quality over MHA. DeepSeekMoE keeps the model sparse: 236B total parameters, 21B active per token, with 160 fine-grained routed experts (6 active) and 2 shared experts, bounded by device-limited routing.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "Trained on 8.1T tokens, context extended to 128K with YaRN. Versus dense DeepSeek 67B: 42.5% cheaper training (172.8K versus 300.6K H800 GPU-hours per trillion tokens), 93.3% less KV cache, 5.76x maximum throughput (over 50K tokens per second on one 8-GPU node). A 15.7B-total / 2.4B-active V2-Lite is released so the architecture can be studied at a small scale.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "The stated limitations are the usual LLM ones: no knowledge updates after pretraining, a risk of non-factual output, and a corpus that is predominantly Chinese and English, so other languages should be used with caution. The architecture does not remove the need for balance losses, token dropping rules, or communication management; those are what make sparsity pay off in practice.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you serve a model at long context, the KV cache is your real budget, and low-rank compression is the most direct lever: store a latent, not the keys and values. If you train sparse, the router is the hard part, so design the balance and communication rules together with the architecture rather than bolting them on later.",
      },
    ],
    questions: [
      {
        id: "deepseek-v2-q1",
        prompt:
          "An MLA layer caches a latent vector plus a small RoPE key. What is actually stored per token per layer?",
        options: [
          "Full keys and values for every head, 32768 numbers",
          "A 512-dim latent plus a 64-dim RoPE key, 576 numbers",
          "One shared key and one shared value, 256 numbers",
          "Only the query, key, and value of the current token",
        ],
        answer: 1,
        explanation:
          "MLA caches c_t (512) and the decoupled RoPE key (64). Keys and values are rebuilt by up-projections, which fold into the query and output projections at inference.",
      },
      {
        id: "deepseek-v2-q2",
        prompt:
          "Why does MLA keep a separate 64-dim key for RoPE instead of putting position inside the compressed latent?",
        options: [
          "The compressed latent is too small to store any position information",
          "RoPE applies to queries only, so a key version is needed for symmetry",
          "A RoPE matrix would sit between W_UK and the query projection, so W_UK could no longer be absorbed and all prefix keys would have to be recomputed",
          "Position information is needed only during training, not at inference",
        ],
        answer: 2,
        explanation:
          "Absorption requires that no position-dependent matrix lies between the up-projection and the query. Decoupling RoPE into its own small key keeps the compressed path position-free and the projection foldable.",
      },
      {
        id: "deepseek-v2-q3",
        prompt:
          "DeepSeek-V2 activates 21B of 236B parameters per token. Which experts does the router actually select?",
        options: [
          "6 of 160 routed experts, plus 2 shared experts that every token uses",
          "21 of 236 routed experts, with no shared experts",
          "6 of 160 routed experts, with no shared experts",
          "2 of 160 routed experts, plus 6 shared experts",
        ],
        answer: 0,
        explanation:
          "Each MoE layer has 2 shared experts and 160 routed experts; each token activates 6 routed experts, and the shared experts run for every token.",
      },
      {
        id: "deepseek-v2-q4",
        prompt:
          "What does device-limited routing (at most M devices per token) buy the training system?",
        options: [
          "It guarantees perfect load balance across experts",
          "It bounds the number of cross-device hops per token, trading a little routing freedom for much less communication",
          "It removes the need for expert parallelism entirely",
          "It makes the KV cache smaller during training",
        ],
        answer: 1,
        explanation:
          "A token's communication cost grows with the number of devices its experts live on. Capping that number keeps expert-parallel training efficient; the paper finds M >= 3 matches unrestricted routing in quality.",
      },
      {
        id: "deepseek-v2-q5",
        prompt: "The headline 42.5% training-cost saving compares which two runs?",
        options: [
          "DeepSeek-V2 versus DeepSeek 67B, measured as H800 GPU-hours per trillion tokens (172.8K versus 300.6K)",
          "DeepSeek-V2 versus Llama 3 70B on total training FLOPs",
          "DeepSeek-V2-Lite versus DeepSeek-Coder-33B on tokens per second",
          "DeepSeek-V2 versus its own dense ablation on inference latency",
        ],
        answer: 0,
        explanation:
          "The paper reports 172.8K H800 GPU-hours per trillion tokens for V2 versus 300.6K for the dense DeepSeek 67B, a 42.5% reduction.",
      },
    ],
    practice: {
      concepts: ["la-vectors", "la-matrix-ops"],
      articles: ["art-attention", "art-kv-cache"],
      problems: ["dl-370", "dl-384", "dl-401", "dl-310", "dl-291"],
    },
    project: {
      title: "Compress the KV cache into an MLA latent",
      pitch: "Rebuild the core of Multi-head Latent Attention in miniature: project each token's keys and values down to a shared latent, reconstruct them for attention, and sweep the latent width to find the smallest cache that meets a fixed reconstruction-error budget. The toy uses random projections and a low-rank token state, so the compression arithmetic matches the real one.",
      difficulty: "intermediate",
      timeEstimate: "3-5 hours",
      milestones: [
        "Build the toy model: a random 64-number key and value projection from a 32-dim token state, with the state itself low-rank (8 signal dimensions) so real activations are only approximated.",
        "Implement the MLA round trip: down-project the state to a d_c-number latent, up-project it back to a reconstructed state, then to keys and values.",
        "Count the cache: 2 * 4 * 8 = 64 numbers per token for full MHA against d_c + 8 for MLA, where the 8 is the decoupled RoPE key.",
        "Sweep latent widths 2, 4, 6, 8 and record key and value relative reconstruction error at each width.",
        "Pick the smallest latent whose error is at most 0.05 and report the cache compression ratio.",
        "Repeat over 200 random tokens and report the mean error so one sample cannot set the result.",
        "Write a short note comparing the measured trade curve with the paper's 93.3% cache reduction.",
      ],
      starterCode: `import math, random
random.seed(0)
# EXPECTED before TODOs: MHA cache 64 numbers, then "unimplemented: TODO: mla_roundtrip".
# EXPECTED after TODOs: latent 2/4/6 errors fall from 0.67 to about 0.3;
# latent 8 reaches ~0.02 with cache 16 against 64 for MHA.
D, H, DH, RANK = 32, 4, 8, 8

def mat(r, c): return [[random.gauss(0, 1) for _ in range(c)] for _ in range(r)]
def mv(m, v): return [sum(m[i][j] * v[j] for j in range(len(v))) for i in range(len(m))]
W_K, W_V = mat(H * DH, D), mat(H * DH, D)

def sample_h():
    """Low-rank token state: RANK signal dimensions plus a little noise."""
    h = [random.gauss(0, 1) for _ in range(RANK)] + [0.0] * (D - RANK)
    return [x + 0.01 * random.gauss(0, 1) for x in h]

def mla_roundtrip(h, d_c):
    """TODO: the latent is c = h[:d_c] (W_D keeps the top RANK directions);
    return (W_K @ h_hat, W_V @ h_hat, d_c + 8) with h_hat = c padded with
    zeros, and the 8 extra numbers standing for the decoupled RoPE key."""
    raise NotImplementedError("TODO: mla_roundtrip")

def rel_err(true, hat):
    num = sum((a - b) ** 2 for a, b in zip(true, hat))
    return math.sqrt(num / (sum(a * a for a in true) or 1.0))

h = sample_h()
k_true, v_true = mv(W_K, h), mv(W_V, h)
print("MHA cache/token:", 2 * H * DH, "numbers; data rank:", RANK)
print("MLA cache/token: d_c + 8; target rel err <= 0.05")
for d_c in (2, 4, 6, 8):
    try:
        k_hat, v_hat, cache = mla_roundtrip(h, d_c)
        print("latent", d_c, "cache", cache,
              "k_err", round(rel_err(k_true, k_hat), 4),
              "v_err", round(rel_err(v_true, v_hat), 4))
    except NotImplementedError as exc:
        print("unimplemented:", exc)
        break`,
      successCriteria: [
        "The sweep covers at least 4 latent widths and prints cache size in numbers plus key and value relative error for each.",
        "The chosen latent reaches mean relative key and value error at or below 0.05 over 200 random tokens.",
        "The final report includes the compression ratio versus the 64-number MHA cache and counts the 8-number RoPE key in the MLA cache.",
        "The script runs under 5 seconds with one python3 command using only the standard library.",
      ],
      stretch: [
        "Replace the hand-aligned latent with learned projections: fit W_D by power iteration on the sample covariance (PCA) and re-run the sweep.",
        "Quantize the latent to 8 bits and measure how much extra error a production cache would pay.",
        "Run the round trip inside attention: score 64 keys, take the top-1 key per query with full and reconstructed keys, and report the argmax agreement rate.",
      ],
      relatedProblemIds: ["dl-370", "dl-401"],
    },
  },
  {
    id: "deepseek-coder-v2",
    slug: "deepseek-coder-v2",
    title:
      "DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence",
    short: "DeepSeek-Coder-V2",
    year: 2024,
    date: "2024-06-17",
    arxivId: "2406.11931",
    url: "https://arxiv.org/abs/2406.11931",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "Continue-pretrain a general MoE model on code and math, and open-source code intelligence reaches closed-source territory.",
    whatItIs:
      "DeepSeek-Coder-V2 is an open-source MoE code model built by resuming DeepSeek-V2 from an intermediate checkpoint and training on 6T additional tokens of code, math, and language. It ships in 236B (21B active) and 16B (2.4B active) sizes, supports 338 programming languages and a 128K context window, and reaches closed-source-level scores on several coding benchmarks, including 90.2% on HumanEval for the instruct model. The paper documents the data pipeline, the two-stage context extension, and the GRPO alignment that follows.",
    theoryMinutes: 15,
    lineage: {
      from: "deepseek-v2",
      context:
        "A case study in specialization. It continues the DeepSeek-Coder line of code models, but instead of training from scratch it resumes from an intermediate 4.2T-token checkpoint of DeepSeek-V2 and spends 6T mostly-code tokens moving capability into one domain without giving up general language skill.",
      improved: [
        "Total pretraining exposure grows to 10.2T tokens (4.2T inherited plus 6T new), with the new mix 60% source code, 10% math, and 30% natural language.",
        "Language coverage expands from 86 to 338 programming languages and context from 16K to 128K tokens, using YaRN in two 1000-step extension stages.",
        "The 16B (2.4B active) model beats the older DeepSeek-Coder-33B, and the 236B model reaches 90.2% HumanEval, 76.2% MBPP+, 43.4% LiveCodeBench, and 75.7% MATH.",
        "It becomes the first open-source model past 10% on SWE-bench (12.7%) and tops the Aider editing benchmark at 73.7%, above GPT-4o's 72.9%.",
        "The recipe details matter: fill-in-the-middle at rate 0.5 for the 16B variant, and a reversion from exponential normalization to standard normalization to stop gradient spikes.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "A model is a summary of its training text",
        text: "Pretraining compresses the statistics of a huge corpus into weights, so when the corpus changes, the weights are wrong in a specific way. A general model has seen plenty of prose and some code, but not the long-range structure of repositories, the grammar of rare languages, or the shape of an edit that closes a function. You can train a code model from scratch, as DeepSeek-Coder 33B did, or start from a model that already understands language and specialize it. The second route is cheaper, and this paper shows it can also be stronger.",
      },
      {
        kind: "prose",
        heading: "Specialization is a data problem first",
        text: "The new corpus is 6T tokens: 60% source code, 10% math, 30% natural language. Code comes from public GitHub repositories created before November 2023, filtered and near-deduplicated, plus code-related web text recalled with a fastText classifier seeded from StackOverflow and documentation sites. The result is 1,170B code tokens covering 338 languages, up from 86. Math adds 221B tokens, roughly doubling the DeepSeekMath corpus. Keeping 30% natural language is deliberate: it defends general ability while the model learns to code.",
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "The data pipeline: raw GitHub and Common Crawl, filtering and deduplication, classifier-based domain recall, then a 60/10/30 mix that yields 1,170B code tokens in 338 languages plus 221B math tokens.",
      },
      {
        kind: "formula",
        label: "Fill-in-the-middle as a sequence",
        expression:
          "PREFIX | <fim_hole> | SUFFIX | <fim_end> | MIDDLE\nloss = -log P(MIDDLE | PREFIX, SUFFIX)",
        why: "FIM trains the model to complete a gap given both sides, which is the shape of real editor completions. The 16B variant trains with FIM at rate 0.5; the 236B variant uses next-token prediction only.",
      },
      {
        kind: "prose",
        heading: "Long context, in two stages",
        text: "Code needs context because definitions live far from their uses. The model starts at a 16K window and is extended to 128K with YaRN (scale 40, alpha 1, beta 32). The extension runs two stages of 1000 steps each: first at 32K sequence length with batches of 1152 sequences, then at 128K with batches of 288, keeping roughly the same number of tokens per stage while upsampling long documents. Needle-in-a-haystack checks pass across the full window.",
      },
      {
        kind: "visual",
        visual: "timeline",
        caption:
          "16K to 128K in two 1000-step stages, alongside the jump from 86 to 338 supported languages, on a total pretraining budget of 10.2T tokens.",
      },
      {
        kind: "code",
        title: "Context stages and the token mix",
        language: "python",
        code: `def stage_tokens(seq_len, batch_seqs, steps):
    return seq_len * batch_seqs * steps

stage_one = stage_tokens(32_768, 1152, 1000)
stage_two = stage_tokens(131_072, 288, 1000)
print(stage_one == stage_two)  # about 37.7B tokens each

def token_mix(total):
    return {"code": 0.60 * total, "math": 0.10 * total, "language": 0.30 * total}

mix = token_mix(6_000_000_000_000)
print(mix["code"])  # 3.6T code tokens`,
        notes: [
          "Both extension stages spend roughly 37.7B tokens, so the context window quadruples without a token-budget spike.",
          "The 4.2T-token V2 checkpoint plus the 6T new tokens gives the 10.2T total reported for both model sizes.",
        ],
      },
      {
        kind: "prose",
        heading: "What the specialization buys, and what it costs",
        text: "The instruct model scores 90.2% on HumanEval, 76.2% on MBPP+, 43.4% on LiveCodeBench, and 75.7% on MATH, and solves 4 of 30 AIME 2024 problems (5 of 30 with maj@64, a majority vote over 64 samples). On the Aider editing benchmark it reaches 73.7%, above GPT-4o's 72.9%, and its 12.7% on SWE-bench is the first open-source result above 10%. Two honest notes from the paper: the reasoning gap on CRUXEval is attributed to having only 21B active parameters, and the run suffered gradient spikes that the authors traced to exponential normalization and fixed by returning to conventional normalization.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem",
        text: "Open code models trail the best closed models on coding and math tasks, and training a hundred-billion-parameter code model from scratch is expensive. The question is whether specialization can be bought cheaply by continuing pretraining instead.",
      },
      {
        kind: "prose",
        heading: "Key idea",
        text: "Resume DeepSeek-V2 from an intermediate 4.2T-token checkpoint and train 6T more tokens that are mostly code and math but keep 30% natural language. Keep the MLA plus DeepSeekMoE architecture unchanged, extend context to 128K, then align with SFT and GRPO using compiler and test-case signal, with a reward model to smooth noisy binary feedback.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "A 1B proxy ablation shows the new corpus adds 6.7 points on HumanEval and 9.4 points on MBPP over the old DeepSeek-Coder corpus (30.5% to 37.2% and 44.6% to 54.0% at 2T tokens). The 16B/2.4B-active model outperforms the older 33B dense code model; the 236B model posts 90.2% HumanEval, 76.2% MBPP+, 43.4% LiveCodeBench, 75.7% MATH, 12.7% SWE-bench, and 73.7% Aider. The 16B FIM variant averages 86.4% on single-line infilling across Python, Java, and JavaScript.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "Specialization has a price. General-language scores dip slightly against the base V2 (TriviaQA 82.3 versus 86.7, NaturalQuestions 47.5 versus 53.4), and the CRUXEval gap is attributed to the 21B active-parameter budget rather than the data. The training run was also not frictionless: gradient spikes forced the team to revert an exponential normalization scheme.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Continued pretraining on a domain mix is the cheapest path to specialization, but the mix is the product decision: keep enough general data to avoid regressing, plan a long-context stage if your task needs it, add FIM if you want an editor-grade completion model, and budget for alignment with execution-based feedback.",
      },
    ],
    questions: [
      {
        id: "deepseek-coder-v2-q1",
        prompt: "The 236B instruct model was produced by continuing from which starting point?",
        options: [
          "DeepSeek-Coder-33B, trained 6T additional tokens",
          "A random initialization trained on 10.2T tokens",
          "An intermediate DeepSeek-V2 checkpoint trained on 4.2T tokens, plus 6T additional tokens",
          "The released DeepSeek-V2 chat model, fine-tuned on 6T tokens",
        ],
        answer: 2,
        explanation:
          "Both sizes resume from the 4.2T-token intermediate V2 checkpoint and see 10.2T tokens in total.",
      },
      {
        id: "deepseek-coder-v2-q2",
        prompt: "Why does the data mix keep 30% natural language when the goal is code?",
        options: [
          "Natural language data is cheaper to collect than code",
          "To preserve general language and reasoning ability while the model specializes on code",
          "Because FIM training requires prose examples",
          "To satisfy the license of the Common Crawl corpus",
        ],
        answer: 1,
        explanation:
          "The paper notes general performance stays comparable to V2; dropping language data would trade code skill for a regression elsewhere.",
      },
      {
        id: "deepseek-coder-v2-q3",
        prompt: "What does fill-in-the-middle change about the training objective?",
        options: [
          "It predicts the middle span of a reordered document, so the model learns to use both preceding and following context",
          "It replaces next-token prediction with a classification loss",
          "It trains the router to balance experts",
          "It shortens documents to 16K tokens during pretraining",
        ],
        answer: 0,
        explanation:
          "FIM reorders a document into prefix, hole, suffix, and middle and predicts the middle, which mirrors how editors complete existing code.",
      },
      {
        id: "deepseek-coder-v2-q4",
        prompt: "Both long-context stages train for 1000 steps. How do they differ?",
        options: [
          "Stage one uses 128K sequences, stage two uses 32K sequences",
          "Stage one uses 32K sequences with batch 1152, stage two uses 128K with batch 288",
          "Stage one trains only the router, stage two trains the whole model",
          "Stage one uses FIM, stage two disables it",
        ],
        answer: 1,
        explanation:
          "Sequence length grows 4x while the batch shrinks 4x, so each stage spends roughly the same token count (about 37.7B).",
      },
      {
        id: "deepseek-coder-v2-q5",
        prompt: "Which claim is supported by the paper's numbers?",
        options: [
          "The 16B model has more active parameters than DeepSeek-Coder-33B",
          "The 236B model supports 86 programming languages",
          "The 16B (2.4B active) model outperforms DeepSeek-Coder-33B on average code benchmarks",
          "The 236B model beats GPT-4o on general knowledge benchmarks",
        ],
        answer: 2,
        explanation:
          "The 16B model averages 65.6% versus 61.9% for the 33B dense model despite far fewer active parameters; coverage is 338 languages, and general-language scores stay near V2, not above GPT-4o.",
      },
    ],
    practice: {
      concepts: ["la-matrix-ops"],
      articles: ["art-kv-cache"],
      problems: ["dl-401", "dl-402", "dl-291", "dl-313"],
    },
    project: {
      title: "Fill in the middle with a tiny n-gram model",
      pitch: "Build the fill-in-the-middle pipeline DeepSeek-Coder-V2 trains on: reorder documents into prefix, hole, and suffix, train a small counting model on the reordered stream, and measure how often it completes the hole correctly against a plain left-to-right model trained on the same corpus. The corpus is a synthetic motif language where the middle token is predictable only when both neighbors are visible.",
      difficulty: "starter",
      timeEstimate: "2-3 hours",
      milestones: [
        "Generate a synthetic corpus by concatenating random motifs, so tokens have local structure and some positions are ambiguous from one side only.",
        "Hold out a test split and compute majority-token accuracy as a floor.",
        "Implement the FIM transform: cut a one-token hole at a random interior position and emit (previous token, next token) -> middle.",
        "Train a left-to-right baseline that counts (previous) -> middle pairs from the original documents.",
        "Train the FIM model that counts (previous, next) -> middle pairs from the transformed data.",
        "Evaluate both on held-out holes and report exact-match accuracy.",
        "Widen the hole to 2 or 3 tokens and check how accuracy changes.",
      ],
      starterCode: `import random
from collections import Counter
random.seed(7)
# EXPECTED before TODOs: 400 train docs, 1600 holes, majority accuracy 0.259.
# EXPECTED after TODOs: left-to-right 0.418, fim 0.644.

MOTIFS = ["abc", "adb", "cda", "cbd"]

def make_corpus(n_docs, rng):
    return ["".join(rng.choice(MOTIFS) for _ in range(6)) for _ in range(n_docs)]

def fim_sample(doc, rng):
    """TODO: pick 1 <= i < len(doc) - 1 and return ((doc[i-1], doc[i+1]), doc[i])."""
    raise NotImplementedError("TODO: fim_sample")

def train(rows):
    """TODO: rows are (context_tuple, middle) pairs; return a dict of Counters."""
    raise NotImplementedError("TODO: train")

def predict(counts, context):
    """TODO: return the most common middle for a context, or None."""
    raise NotImplementedError("TODO: predict")

def accuracy(counts, holes, use_suffix):
    hits = 0
    for prev, mid, nxt in holes:
        context = (prev, nxt) if use_suffix else (prev,)
        if predict(counts, context) == mid:
            hits += 1
    return hits / len(holes)

train_docs = make_corpus(400, random)
test_docs = make_corpus(100, random)
holes = [(d[i - 1], d[i], d[i + 1]) for d in test_docs for i in range(1, len(d) - 1)]
print("train docs:", len(train_docs), "test holes:", len(holes))
print("majority-token accuracy:",
      round(Counter(h[1] for h in holes).most_common(1)[0][1] / len(holes), 3))
try:
    left_to_right = train([((d[i - 1],), d[i]) for d in train_docs for i in range(1, len(d))])
    fim = train([fim_sample(d, random) for d in train_docs])
    print("left-to-right accuracy:", round(accuracy(left_to_right, holes, False), 3))
    print("fim accuracy:", round(accuracy(fim, holes, True), 3))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The held-out holes number at least 1000 and come from documents the models never trained on.",
        "The FIM model beats the left-to-right baseline by at least 10 accuracy points.",
        "Both accuracies and the majority-token floor are printed from one run with a fixed seed.",
        "The hole is chosen uniformly from interior positions, not hand-picked.",
      ],
      stretch: [
        "Score completions by mean negative log-likelihood instead of exact match and compare the two models on that scale.",
        "Add the paper's token mix: dilute the code corpus with 30% prose-like sequences and show which model degrades less.",
        "Extend the counting model to order 3 and find where more context stops helping on held-out documents.",
      ],
    },
  },
  {
    id: "aux-loss-free",
    slug: "aux-loss-free",
    title:
      "Auxiliary-Loss-Free Load Balancing Strategy for Mixture-of-Experts",
    short: "Loss-Free Balancing",
    year: 2024,
    date: "2024-08-28",
    arxivId: "2408.15664",
    url: "https://arxiv.org/abs/2408.15664",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "Balance expert load with a nudge to the router, not a gradient to the loss.",
    whatItIs:
      "This paper introduces Loss-Free Balancing, a way to keep MoE expert loads even without an auxiliary loss. Each expert carries a scalar bias that is added to its routing score only when choosing the top-K experts; after every training step the bias is nudged up or down by a fixed amount depending on whether the expert was under- or overloaded. Because the bias never appears in the backward pass, balancing stops fighting the language-modeling gradient. On 1B and 3B MoE models it improves both validation perplexity and load balance over auxiliary-loss training.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-moe",
      context:
        "A methods paper from the same lineage, sitting between the architecture work and the 671B scale-up. Its backbone is DeepSeekMoE, whose fine-grained experts are exactly what needs balancing; the strategy it proposes is then adopted by DeepSeek-V3.",
      improved: [
        "Replaces the auxiliary balance loss with a per-expert bias used only in the top-K selection, so no interference gradient is added to the training objective.",
        "Updates the bias by a fixed step in the sign of the load error, b_i <- b_i + u * sign(e_i), with u = 0.001 the best setting in the sweep.",
        "Improves both sides of the trade-off at once: on a 1B model, validation perplexity 9.50 versus 9.56 and MaxVio (the worst-case expert-load deviation from even, lower is better) 0.04 versus 0.72; on 3B, 7.92 versus 7.97 and 0.04 versus 0.52.",
        "Scales with expert parallelism: imbalance keeps shrinking as the computation batch grows, while auxiliary-loss training plateaus.",
        "Stays causal, unlike Expert Choice routing, because the bias update uses only the previous batch's loads and never lets future tokens influence earlier assignments.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The router's failure mode",
        text: "A sparse MoE layer is only efficient if tokens spread across experts. Left alone, routers drift: a few experts win early, collect more tokens, get more gradient, improve faster, and win even more tokens. This is routing collapse, and it wastes exactly the capacity the model paid for. Imbalance also has a systems cost. Under expert parallelism each expert lives on a fixed device, so a hot expert becomes a straggler while its neighbors sit idle, and every step waits for the busiest device.",
      },
      {
        kind: "prose",
        heading: "The auxiliary loss and its dilemma",
        text: "The standard fix adds a differentiable penalty to the training objective: L_bal = alpha * sum_i f_i * P_i, where f_i is the fraction of tokens routed to expert i and P_i is its average gate score. Minimizing it pushes traffic off the popular experts. But its gradient has nothing to do with predicting the next token. It is an interference gradient whose strength is set by alpha, and the two objectives disagree: small alpha leaves the model imbalanced, large alpha balances it but degrades language modeling. Figure 2 of the paper draws this trade-off directly, and it is the dilemma the paper sets out to break.",
      },
      {
        kind: "formula",
        label: "Auxiliary balance loss (the thing to replace)",
        expression:
          "L_bal = alpha * sum_i f_i * P_i\nf_i = (N / (K * T)) * count(tokens routed to expert i)\nP_i = mean gate score of expert i",
        why: "This term is differentiable on purpose, and that is the problem. Every gradient step now moves experts toward equal load as well as toward better predictions, and the balancing force grows with alpha. Removing the term and controlling load some other way removes the conflict.",
      },
      {
        kind: "prose",
        heading: "Replace the loss with a bias",
        text: "Loss-Free Balancing keeps the routing decision but takes it out of the objective. Each expert i carries a bias b_i, initialized to zero. Routing ranks experts by s_i + b_i, but the gate value that weights an expert's output is still the unbiased s_i, so the bias decides who gets picked and nothing else. After each training step the trainer reads the token counts from the previous batch and moves each bias one fixed step in the opposite direction of its load: overloaded experts go down, underloaded experts go up. No term in the loss changes, so no interference gradient exists.",
      },
      {
        kind: "visual",
        visual: "moe-routing",
        caption:
          "Biased top-K routing: rank experts by s_i + b_i, weight their outputs by s_i. The bias steers traffic; the gate remains an honest affinity score.",
      },
      {
        kind: "formula",
        label: "Bias update (sign rule)",
        expression:
          "e_i = c_bar - c_i\nb_i <- b_i + u * sign(e_i)",
        why: "c_i is expert i's token count on the previous batch and c_bar is the mean count. An overloaded expert gets e_i < 0 and a smaller bias; an underloaded expert gets e_i > 0 and a larger bias. The update is a sign, not a learned function, so nothing flows backward, and using the previous batch keeps routing causal. u = 0.001 was best: larger values oscillate late in training, smaller values converge too slowly.",
      },
      {
        kind: "visual",
        visual: "load-balance",
        caption:
          "Load balance over training: the loss-free router tracks a low violation ratio, while the auxiliary-loss baseline is stuck at whatever balance its alpha coefficient can buy.",
      },
      {
        kind: "code",
        title: "Bias-only routing and its update loop",
        language: "python",
        code: `def top_k_by_bias(scores, bias, k):
    order = sorted(range(len(scores)), key=lambda i: scores[i] + bias[i], reverse=True)
    return order[:k]

def update_bias(bias, counts, u=0.001):
    mean = sum(counts) / len(counts)
    for i, count in enumerate(counts):
        bias[i] += u * (1 if mean > count else -1 if mean < count else 0)
    return bias

bias = [0.0, 0.0, 0.0, 0.0]
print(update_bias(bias, [40, 10, 10, 10]))  # expert 0 is nudged down`,
        notes: [
          "The bias only matters at the margin of the top-K comparison; magnitudes stay tiny.",
          "The gates returned with the chosen experts are the original scores, so gradients never see the bias.",
        ],
      },
      {
        kind: "prose",
        heading: "What the experiments show",
        text: "The authors train MoE models from scratch (1B parameters on 100B tokens, 3B on 200B) with a sigmoid gate and compare against the auxiliary-loss baseline tuned to alpha = 0.001. Loss-Free wins on both axes: 1B validation perplexity 9.50 versus 9.56 and MaxVio 0.04 versus 0.72; 3B 7.92 versus 7.97 and 0.04 versus 0.52. Two boundaries are handled explicitly. The bias update must use historical batches, because using the current sequence would break causality; and the rival Expert Choice approach achieves perfect balance but leaks information about future tokens (more than 50 bits per token in their 9-layer, 16-expert example), so it is rejected as unsafe.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem",
        text: "MoE load imbalance causes routing collapse and wasted device time, and the standard cure, an auxiliary loss, fights the language-modeling objective through gradients whose strength has to be tuned.",
      },
      {
        kind: "prose",
        heading: "Key idea",
        text: "Keep balancing out of the loss. Add a per-expert bias to the routing score for top-K selection only, and update that bias after each step by a fixed step in the sign of the previous batch's load error. No gradient, no alpha trade-off.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "1B/100B-token and 3B/200B-token runs beat the auxiliary-loss baseline on perplexity and on MaxVio (0.04 versus 0.72 and 0.04 versus 0.52). The advantage grows with computation-batch size, which is what expert parallelism produces. Sweeps over update rate and update rule show the sign rule at u = 0.001 is the stable choice; proportional updates balance slightly better but score worse on perplexity, and multiplicative biases are worse on both.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "The method is a heuristic: it has one hand-set knob (u), it does not guarantee exact balance (the reported violation is 0.04, not 0), and it depends on tracking loads during training, which the causal variant handles by looking one batch back. The paper does not discuss behavior at trillion-parameter scale, where a later model in this era, DeepSeek-V3, keeps a tiny sequence-wise loss as a safety net for per-sequence extremes.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If a sparse model underperforms its dense counterpart, suspect the balance loss before the architecture. Try a bias-only router first: it is a few lines of code, adds no gradient, and can be combined with a very weak auxiliary loss only if a specific failure demands it.",
      },
    ],
    questions: [
      {
        id: "aux-loss-free-q1",
        prompt: "In Loss-Free Balancing, what exactly is the bias added to?",
        options: [
          "The expert's output before the residual connection",
          "Only the score used for top-K selection; the gate that weights the output stays unbiased",
          "The language-modeling loss, scaled by expert load",
          "The gradient of each expert's parameters",
        ],
        answer: 1,
        explanation:
          "The bias changes who gets selected and nothing else. Gate values remain the original affinity scores, so the output weighting carries no balancing signal and no gradient is created.",
      },
      {
        id: "aux-loss-free-q2",
        prompt: "Why is b_i updated with sign(e_i) instead of e_i?",
        options: [
          "Because gradients cannot be computed for a sign function",
          "Because e_i is always positive in practice",
          "The proportional variant balanced slightly better but did worse on perplexity, so the sign rule was kept as the better overall trade",
          "Because the sign rule makes the bias grow without bound",
        ],
        answer: 2,
        explanation:
          "The paper's Table 3 compares both rules: magnitude updates reach MaxVio 0.028 versus 0.044 but perplexity 9.51 to 9.53 versus 9.50, so the simpler sign rule wins.",
      },
      {
        id: "aux-loss-free-q3",
        prompt: "Why must the bias update use the previous batch instead of the current one?",
        options: [
          "Because counts from the current batch are too noisy",
          "Because using the current batch would let information about future tokens influence routing decisions, breaking causality",
          "Because the current batch is needed for the backward pass",
          "Because the previous batch has a better-balanced distribution",
        ],
        answer: 1,
        explanation:
          "Loads observed on the current sequence depend on tokens that have not been predicted yet. Using them to route earlier tokens leaks the future, so the update one batch back.",
      },
      {
        id: "aux-loss-free-q4",
        prompt: "What problem does Expert Choice routing have that Loss-Free avoids?",
        options: [
          "It cannot balance load at all",
          "It requires an auxiliary loss with a large coefficient",
          "It assigns experts based on the whole batch, so future tokens influence past assignments and leak information",
          "It is incompatible with expert parallelism",
        ],
        answer: 2,
        explanation:
          "Expert Choice picks each expert's tokens globally, which yields perfect balance but breaks the causal constraint; the paper quantifies leakage at more than 50 bits per token in their example.",
      },
      {
        id: "aux-loss-free-q5",
        prompt: "On the 1B model, which pair of results is reported for Loss-Free versus auxiliary loss?",
        options: [
          "Perplexity 9.50 versus 9.56, MaxVio 0.04 versus 0.72",
          "Perplexity 9.50 versus 9.72, MaxVio 0.44 versus 0.04",
          "Perplexity 7.92 versus 7.97, MaxVio 0.04 versus 0.52",
          "Perplexity 9.56 versus 9.50, MaxVio 0.72 versus 0.04",
        ],
        answer: 0,
        explanation:
          "On 1B the loss-free model gets 9.50 perplexity and 0.04 MaxVio, against 9.56 and 0.72 for the auxiliary-loss baseline; the 7.92/7.97 pair is the 3B model.",
      },
    ],
    practice: {
      problems: ["dl-310", "dl-311", "dl-312", "dl-313", "dl-314", "dl-291"],
    },
    project: {
      title: "Balance MoE experts with bias, not gradient",
      pitch: "Reproduce Loss-Free Balancing on a toy router: eight experts with skewed popularity and noisy scores, two chosen per token. Compare an integral load penalty that stands in for the auxiliary-loss gradient against the paper's sign update on a selection-only bias, and measure both load imbalance (MaxVio) and how far each method moves the gate scores away from their honest values.",
      difficulty: "intermediate",
      timeEstimate: "3-4 hours",
      milestones: [
        "Build the toy router: eight experts with fixed popularity gaps, noisy per-token scores, top-2 selection.",
        "Measure the uncontrolled MaxVio as the imbalance baseline.",
        "Implement the paper's update: after each batch, move each selection bias one step in the sign of the previous batch's load error.",
        "Implement the auxiliary-loss stand-in: an integral penalty added to scores, driven by the same load error.",
        "Sweep the penalty gain and the bias step and record MaxVio and gate distortion (mean absolute score adjustment) for both.",
        "Print the frontier: the balance each method reaches at a given amount of score distortion.",
        "Verify the bias never enters the gate that weights expert outputs, so its distortion is exactly zero.",
      ],
      starterCode: `import random
random.seed(1)
# EXPECTED before TODOs: no-control MaxVio 0.2424, then "unimplemented".
# EXPECTED after TODOs: aux alpha 0.005/0.02/0.08 -> MaxVio 0.108/0.026/0.023 at
# distortion 0.22/0.41/0.43; loss-free u 0.005 -> MaxVio 0.024, distortion 0.0.
N_EXPERTS, TOP_K, STEPS, BATCH = 8, 2, 600, 256
POPULARITY = [0.9, 0.7, 0.4, 0.2, 0.0, -0.2, -0.4, -0.6]
def token_scores(rng):
    return [POPULARITY[i] + rng.gauss(0, 0.5) for i in range(N_EXPERTS)]
def route(scores, adjust, k=TOP_K):
    order = sorted(range(N_EXPERTS), key=lambda i: scores[i] + adjust[i], reverse=True)
    return order[:k]
def maxvio(counts, total):
    return max(abs(c / total - 1.0 / N_EXPERTS) for c in counts)
def sign_update(bias, counts, u=0.005):
    mean = sum(counts) / len(counts)
    return [b + u * ((mean > c) - (mean < c)) for b, c in zip(bias, counts)]
def penalty_update(penalty, counts, alpha):
    """TODO: integral controller standing in for the auxiliary-loss gradient:
    add alpha * (load fraction - 1 / N_EXPERTS) to each penalty. Unlike a
    selection bias it also distorts the gate used for weighting."""
    raise NotImplementedError("TODO: penalty_update")
def run(kind, knob, steps=STEPS):
    rng, adjust, last = random.Random(7), [0.0] * N_EXPERTS, []
    for step in range(steps):
        counts = [0] * N_EXPERTS
        for _ in range(BATCH):
            for i in route(token_scores(rng), adjust):
                counts[i] += 1
        if step >= steps - 100:
            distortion = 0.0 if kind == "sign" else sum(abs(a) for a in adjust) / N_EXPERTS
            last.append((maxvio(counts, BATCH * TOP_K), distortion))
        adjust = sign_update(adjust, counts, knob) if kind == "sign" else penalty_update(adjust, counts, knob)
    return (round(sum(m for m, _ in last) / len(last), 4),
            round(sum(d for _, d in last) / len(last), 4))
print("no control MaxVio:", run("sign", 0.0, steps=200)[0])
try:
    for alpha in (0.005, 0.02, 0.08):
        print("aux alpha", alpha, "MaxVio/distortion", run("penalty", alpha))
    print("loss-free u 0.005 MaxVio/distortion", run("sign", 0.005))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The uncontrolled router shows MaxVio >= 0.2, so there is real imbalance to fix.",
        "The loss-free bias reaches MaxVio <= 0.03 with gate distortion 0.0.",
        "The penalty controller reaches comparable MaxVio only at a gain whose distortion is many times the load error it corrects.",
        "Results average the last 100 of at least 400 training steps and the script runs in under 10 seconds.",
      ],
      stretch: [
        "Make the popularity distribution drift over time and compare how quickly each method tracks the moving optimum.",
        "Try the paper's proportional update b_i += u * e_i and the multiplicative variant, and reproduce their ordering of MaxVio versus quality.",
        "Add a second routing layer and show that imbalance compounds layer over layer when uncorrected.",
      ],
      relatedProblemIds: ["dl-310", "dl-313", "dl-291"],
    },
  },
  {
    id: "fire-flyer",
    slug: "fire-flyer",
    title:
      "Fire-Flyer AI-HPC: A Cost-Effective Software-Hardware Co-Design for Deep Learning",
    short: "Fire-Flyer 2",
    year: 2024,
    date: "2024-08-26",
    arxivId: "2408.14158",
    url: "https://arxiv.org/abs/2408.14158",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "Build the cluster around the workload: PCIe A100s, CPU allreduce, and a network that carries storage and compute without congestion.",
    whatItIs:
      "This is the systems paper behind DeepSeek's training cluster. Fire-Flyer 2 is a 10,000-GPU PCIe A100 cluster whose two-layer fat-tree merges storage and compute traffic, built to reach near-DGX-A100 throughput at roughly half the cost and 40% less energy. The paper documents the co-design: HFReduce, the allreduce library that reduces inside the node on CPUs before touching the network; HaiScale, the parallelism and overlap stack; 3FS, the distributed file system; HAI-Platform, the scheduler; and a year of real failure data from production.",
    theoryMinutes: 15,
    lineage: {
      context:
        "The ground layer of the efficiency era. The model papers above it (MLA, DeepSeekMoE, FP8) are algorithmic answers to cost; this is the systems answer. Its patterns, integration of storage and compute on one fabric, overlapping communication with computation, and squeezing cheap PCIe interconnects with software, recur in the training stacks of the later frontier runs.",
      improved: [
        "10,000 PCIe A100 GPUs deliver about 83% of DGX-A100 GEMM (dense matrix multiply) throughput at roughly 60% of node cost and power, which the abstract rounds to half the cost and 40% less energy.",
        "A two-zone, two-layer fat-tree needs 122 switches where a DGX-style three-layer fabric needs 1,320, cutting networking cost about 40% versus an equivalent three-layer design.",
        "HFReduce reduces gradients inside each node on the CPU before the network and launches no GPU kernel: 6.3-8.1 GB/s inter-node at 186 MiB versus NCCL's 1.6-4.8 GB/s, and over 10 GB/s once NVLink (NVIDIA's GPU-to-GPU link) bridges are added.",
        "The software stack, HaiScale for parallelism, 3FS for storage traffic, and the open-sourced HAI-Platform scheduler, keeps computation and communication overlapped across 10,000 GPUs.",
        "The paper publishes a year of production failure data (Xid errors, the driver's GPU error reports, and network flash cuts) alongside the checkpoint and validation machinery that keeps month-long runs alive.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Compute demand grows faster than hardware",
        text: "The paper opens with a scaling mismatch. Deep learning compute demand has grown roughly 10x per year, while Moore's Law adds about 3x of arithmetic every two years, DRAM bandwidth about 1.6x, and interconnect bandwidth about 1.4x. The gap is closed by buying more machines, and at 10,000-GPU scale the GPUs are no longer the whole bill: switches, optics, NICs, power, and cooling are comparable line items. Cost-effectiveness has to be designed, not bought.",
      },
      {
        kind: "prose",
        heading: "The interconnect decides the design",
        text: "Training is a loop of matrix multiplications plus a gradient synchronization. The allreduce at the end of each step (a collective that sums every worker's gradients) moves every gradient across the network, so the ratio of computation to communication sets the ceiling on how many GPUs can be used efficiently. NVIDIA's SXM and DGX systems attack this with fast NVLink and many NICs (network interface cards) per node. The Fire-Flyer bet is that cheaper PCIe A100 nodes with a single 200Gbps NIC can reach a similar place if software does more, which requires raising work per byte: larger batches, gradient accumulation, and MoE layers that keep most computation local.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "Cost, power, and fabric: PCIe A100 nodes reach about 83% of DGX-A100 GEMM throughput at roughly 60% of node cost and power, and the two-zone fat-tree replaces a 1,320-switch DGX-style fabric with 122 switches.",
      },
      {
        kind: "prose",
        heading: "HFReduce: reduce on the CPU, not the GPU",
        text: "In a ring allreduce each unit of data passes through the ring, and on a PCIe node every hop competes for the same bus, while NCCL also launches GPU kernels that steal cycles from compute. HFReduce splits the work differently. First, gradients are copied from the node's 8 GPUs into CPU memory and reduced there with SIMD instructions (wide vector math on the CPU), supporting FP32, FP16, BF16, and FP8. Second, the cross-node allreduce runs on CPUs over RDMA (remote direct memory access, network transfers that bypass the CPU's involvement per byte) using a double binary tree. Third, results are copied back to the GPUs. One transfer down and one up, and because the copies use the GPU's copy engine, no compute kernel is launched.",
      },
      {
        kind: "formula",
        label: "PCIe traffic per unit of allreduced data",
        expression:
          "ring allreduce: (2n - 1) / n PCIe bandwidth units per data unit\nHFReduce: 1 bidirectional unit (one device-to-host, one host-to-device)",
        why: "The paper's accounting says a ring allreduce consumes (2n - 1) / n units of PCIe bandwidth per unit of data, while HFReduce touches the bus once down and once up regardless of scale and runs the inter-node tree over the network instead. Measured outcome: 6.3-8.1 GB/s inter-node for HFReduce versus 1.6-4.8 GB/s for NCCL on a 186 MiB message, scaling from 16 to 1440 GPUs.",
      },
      {
        kind: "prose",
        heading: "The stack above the collective",
        text: "HaiScale is the parallelism toolkit: data, pipeline, tensor, expert, and fully sharded data parallel, with scheduling that overlaps communication with computation. 3FS is a distributed file system for the all-flash era, because training reads huge shards and writes checkpoints, and that traffic shares the fabric with gradients, so the network was built to carry both. HAI-Platform schedules jobs, handles faults, and is open-sourced. The paper also reports what actually breaks over a year in production, GPU Xid errors and network flash cuts, and the checkpoint manager and validator that keep a run recoverable.",
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "The stack: HaiScale for parallelism and overlap, 3FS for storage traffic, HAI-Platform for scheduling and fault handling, all riding one two-zone fat-tree that carries storage and compute together.",
      },
      {
        kind: "code",
        title: "PCIe traffic model: ring allreduce versus HFReduce",
        language: "python",
        code: `def ring_pcie_units(n):
    return (2 * n - 1) / n

def hfreduce_pcie_units():
    return 1.0  # one device-to-host plus one host-to-device per unit

for gpus in (16, 128, 1440):
    print(gpus, round(ring_pcie_units(gpus), 2), hfreduce_pcie_units())`,
        notes: [
          "This is the paper's bandwidth accounting, not a latency model; the measured result is the 6.3-8.1 GB/s versus 1.6-4.8 GB/s comparison.",
          "Adding NVLink bridges between paired GPUs cuts the host traffic further and pushes HFReduce past 10 GB/s inter-node.",
        ],
      },
      {
        kind: "prose",
        heading: "What the numbers say, and what they cost",
        text: "The cluster holds 10,000 PCIe A100s across about 1,250 compute nodes and nearly 200 storage servers. Per GPU, TF32 GEMM runs at 107 versus 131 TFLOPS for DGX-A100, about 83% of the throughput, while a node draws 2500W instead of 4200W and costs about 60% as much. The paper is explicit about the trade: PCIe cards are slower than SXM, so part of the win is bought with software engineering, and its next-generation plan targets MoE training with multi-NIC, multi-plane networking.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem",
        text: "AI infrastructure costs are inflating with model scale, traditional HPC machines were built for double-precision workloads and are poorly suited to deep learning, and long-term cloud rental can exceed the cost of owning a cluster.",
      },
      {
        kind: "prose",
        heading: "Key idea",
        text: "Co-design cheap hardware with custom software. Use PCIe A100 nodes with one NIC, wire them into a two-zone two-layer fat-tree that carries storage and compute traffic together, and compensate for the slower interconnect with CPU-side collectives (HFReduce), compute-communication overlap (HaiScale), a purpose-built file system (3FS), and scheduling plus fault handling (HAI-Platform).",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "About 83% of DGX-A100 GEMM throughput per GPU (107 versus 131 TF32 TFLOPS) at about 60% of node cost and 2500W versus 4200W per node; the abstract states roughly half the cost and 40% less energy at cluster level. HFReduce reaches 6.3-8.1 GB/s inter-node versus NCCL's 1.6-4.8 GB/s on a 186 MiB message, and over 10 GB/s with NVLink bridges. The fabric uses 122 switches versus 1,320 for a DGX-style three-layer design, about 40% cheaper networking than an equivalent three-layer network.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "PCIe is slower than SXM and the paper does not pretend otherwise: part of the performance gap is accepted and repaid in software complexity, and HFReduce itself becomes memory-bound without NVLink bridges. The design leans on in-house engineering (HaiScale, 3FS, HAI-Platform) and on hardware choices made in 2021, and RDMA congestion control remains an open discussion.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Pick the interconnect for your workload's communication-to-computation ratio, not for its spec sheet. If the ratio is low, cheap PCIe nodes plus strong collectives and overlap can win on cost. And treat storage and checkpoint traffic as part of the training network, not as an afterthought.",
      },
    ],
    questions: [
      {
        id: "fire-flyer-q1",
        prompt: "Why does HFReduce beat NCCL on this cluster?",
        options: [
          "It uses a faster InfiniBand switch than NCCL supports",
          "It reduces inside the node on CPUs with one device-to-host and one host-to-device copy, using the copy engine, instead of ring traffic and GPU kernels",
          "It skips the allreduce entirely for most layers",
          "It uses FP64 accumulation to reduce message size",
        ],
        answer: 1,
        explanation:
          "On PCIe nodes the bus is the bottleneck. HFReduce reduces each node's gradients in CPU memory first, runs the cross-node allreduce over RDMA on CPUs, and never launches a compute kernel.",
      },
      {
        id: "fire-flyer-q2",
        prompt: "What is the point of the two-zone, two-layer fat-tree?",
        options: [
          "It doubles the number of NICs per node",
          "It integrates storage and compute traffic with high bisection bandwidth while cutting switch count from 1,320 to 122",
          "It isolates training traffic from inference traffic",
          "It lets storage servers act as compute nodes when idle",
        ],
        answer: 1,
        explanation:
          "One fabric carries both kinds of traffic; the two zones are joined by a limited number of links that the scheduler manages, which keeps cross-zone communication to at most one task.",
      },
      {
        id: "fire-flyer-q3",
        prompt: "What fraction of DGX-A100 GEMM throughput does a PCIe A100 node reach, and at what cost?",
        options: [
          "About 50% of throughput at 30% of cost",
          "About 95% of throughput at 80% of cost",
          "About 83% of throughput at about 60% of node cost and power",
          "About 83% of throughput at the same cost but half the power",
        ],
        answer: 2,
        explanation:
          "The paper's Table II: 107 versus 131 TF32 TFLOPS (83%), node price 60%, and 2500W versus 4200W.",
      },
      {
        id: "fire-flyer-q4",
        prompt: "Why do gradient accumulation and MoE layers help a PCIe cluster specifically?",
        options: [
          "They shrink the model so it fits on one node",
          "They raise computation per byte of communication, which is how a slower interconnect is kept from dominating",
          "They remove the need for an allreduce",
          "They make the network topology irrelevant",
        ],
        answer: 1,
        explanation:
          "The communication-to-computation ratio sets the ceiling on scaling. Anything that increases work per byte lets more GPUs be used efficiently on a cheaper fabric.",
      },
      {
        id: "fire-flyer-q5",
        prompt: "What distinguishes the paper's treatment of hardware failures?",
        options: [
          "It assumes failures are rare and out of scope",
          "It reports a year of production failure data (Xid errors, flash cuts) alongside the checkpoint and validator machinery",
          "It replaces GPUs with spare nodes on the fly",
          "It relies on cloud providers to handle them",
        ],
        answer: 1,
        explanation:
          "Stability is a first-class section: the paper characterizes real failures and the tools that keep multi-week runs recoverable.",
      },
    ],
    practice: {
      problems: ["dl-101", "dl-102", "dl-228", "dl-306", "dl-412"],
    },
    project: {
      title: "Tune a prefetch policy across SSD, DRAM, and HBM",
      pitch: "Build a three-tier cache simulator with a small cost model: shards live on SSD, promote through DRAM into HBM, and every demand reads from wherever it currently sits. Add a speculative prefetch policy, then tune prefetch distance against a cost budget: more lookahead buys hits, but each speculative load costs bandwidth and can evict a shard you needed.",
      difficulty: "intermediate",
      timeEstimate: "3-5 hours",
      milestones: [
        "Generate an access trace with locality: mostly local walks over the shard space plus a fraction of random jumps.",
        "Implement the three-tier simulator with LRU at each tier and a demand-only baseline.",
        "Define the cost model: SSD fetch 40 units, DRAM fetch 4, and 2 extra per speculative prefetch.",
        "Collect the demand-only hit count and cost.",
        "Implement a locality prefetch policy that guesses the next shards from the current one.",
        "Sweep prefetch distances 1 through 4 and record hits and total cost.",
        "Choose the largest distance that stays inside the budget and report the hit gain per extra 1000 cost units.",
        "Compare against an oracle that prefetches exactly the next demands and note the gap.",
      ],
      starterCode: `import random
random.seed(5)
# EXPECTED before TODOs: trace 4000, demand-only 325 hits at cost 91884.
# EXPECTED after TODOs: local-ahead prefetch 1/2/3/4 gives 1281/2264/3300/3304
# hits at cost 171964/226052/250126/274152; 2 is best under the 240000 budget.
SHARDS, TRACE_LEN, BUDGET = 128, 4000, 240000
HBM_SLOTS, DRAM_SLOTS, SPEC_OVERHEAD = 16, 64, 2
COST = {"dram": 4, "ssd": 40}
trace, cur = [], 0
for _ in range(TRACE_LEN):
    cur = (cur + random.randint(1, 3)) % SHARDS if random.random() < 0.8 else random.randrange(SHARDS)
    trace.append(cur)
def simulate(trace, policy=None):
    """3-tier LRU: HBM -> DRAM -> SSD. A miss promotes one tier at a time:
    SSD 40 units, DRAM 4, and each speculative prefetch adds 2. Returns
    (hits, cost)."""
    hbm, dram, hits, cost = [], [], 0, 0
    for i, shard in enumerate(trace):
        for s in [shard] + [x for x in (policy(i) if policy else []) if x != shard]:
            if s in hbm:
                hbm.remove(s); hbm.append(s)
                hits += s == shard
                continue
            if s in dram:
                cost += COST["dram"]; dram.remove(s)
            else: cost += COST["ssd"]
            if s != shard:
                cost += SPEC_OVERHEAD
            dram.append(s)
            if len(dram) > DRAM_SLOTS: dram.pop(0)
            hbm.append(s)
            if len(hbm) > HBM_SLOTS: hbm.pop(0)
    return hits, cost
def prefetch_policy(i, trace, ahead):
    """TODO: return up to ahead shards to preload at step i, e.g. the
    locality guess [(trace[i] + d) % SHARDS for d in range(1, ahead + 1)]."""
    raise NotImplementedError("TODO: prefetch_policy")
hits, cost = simulate(trace)
print("demand-only LRU:", len(trace), "accesses, hits", hits, "cost", cost, "budget", BUDGET)
try:
    for ahead in (1, 2, 3, 4):
        h, c = simulate(trace, lambda i: prefetch_policy(i, trace, ahead))
        print("prefetch", ahead, "hits", h, "cost", c)
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The demand-only run and at least three prefetch distances are reported with hits and cost.",
        "The chosen distance is the best hit count under the stated budget, not the largest distance.",
        "Prefetching beyond the chosen distance costs more per extra hit than the chosen one (the curve turns).",
        "The full script runs in under 5 seconds with a fixed seed.",
      ],
      stretch: [
        "Add a prefetch queue with a confidence threshold so speculative loads that miss the next few accesses are charged a penalty.",
        "Replace LRU with a scan-resistant admission filter and compare hits at the same cost.",
        "Give SSD, DRAM, and HBM different latencies and optimize p99 latency instead of mean cost.",
      ],
      relatedProblemIds: ["dl-101", "dl-102", "dl-306"],
    },
  },
  {
    id: "deepseek-v3",
    slug: "deepseek-v3",
    title: "DeepSeek-V3 Technical Report",
    short: "DeepSeek-V3",
    year: 2024,
    date: "2024-12-27",
    arxivId: "2412.19437",
    url: "https://arxiv.org/abs/2412.19437",
    kind: "paper",
    era: "efficiency",
    tier: "core",
    tagline:
      "671B parameters, 37B active, FP8 training and a loss-free router: frontier quality for 2.788M GPU-hours.",
    whatItIs:
      "DeepSeek-V3 is a 671B-parameter mixture-of-experts model that activates 37B parameters per token, pretrained on 14.8T tokens. It keeps V2's MLA and DeepSeekMoE, adopts the auxiliary-loss-free balancing from earlier in this era, adds an FP8 mixed-precision training framework, and trains on a multi-token prediction objective. The full run took 2.788M H800 GPU-hours, about $5.576M at $2 per GPU-hour, and the report documents the training framework, the routing rules, and the inference deployment.",
    theoryMinutes: 20,
    lineage: {
      from: "deepseek-v2",
      to: ["deepseek-r1", "deepseek-v3-1"],
      context:
        "The era's capstone, and a return to the text main line after the VL2 vision detour. It keeps V2's MLA and DeepSeekMoE, adopts the auxiliary-loss-free router from the methods paper that precedes it in this era, and adds FP8 training plus multi-token prediction. The training-cost table, not a benchmark score, is the headline.",
      improved: [
        "Load balancing drops the auxiliary loss: a per-expert bias steers top-K selection, with a complementary sequence-wise loss at a tiny weight only to bound per-sequence extremes, and no token is dropped.",
        "FP8 mixed precision is validated at 671B scale for the first time: 1x128 activation tiles and 128x128 weight blocks with FP32 promotion every 128 products, keeping GEMM error under 0.25% relative.",
        "Multi-token prediction (MTP) with one extra token densifies the training signal and doubles as a speculative-decoding draft: 85-90% acceptance and 1.8x tokens per second at inference.",
        "Training economics: 14.8T tokens for 2.664M H800 GPU-hours of pretraining (180K GPU-hours per trillion tokens, 3.7 days on 2048 H800s), plus 119K for context extension and 5K for post-training.",
        "Infrastructure co-design: DualPipe overlap, no tensor parallelism needed, 16-way pipeline and 64-way expert parallelism over 8 nodes, and a run with no irrecoverable loss spikes and no rollbacks.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Three costs left on the table",
        text: "V2 showed that sparsity plus latent attention makes a strong model cheap to serve. At V3 scale three costs remain. Precision is the first: keeping 671B parameters and their activations in BF16 burns memory and bandwidth, and moving to 8-bit floats naively destroys accuracy because activations contain outliers. Balance is the second: V2's auxiliary balance losses add gradients that push against the language-modeling objective. Supervision is the third: next-token prediction gives one training signal per position, and nothing supervises longer horizons.",
      },
      {
        kind: "prose",
        heading: "FP8 training, from first principles",
        text: "An 8-bit float spends bits on sign, exponent, and mantissa: E4M3 means 4 exponent bits and 3 mantissa bits, a wide range with coarse relative precision. What makes it usable is a scale. Divide a block of numbers by its largest absolute value, multiply by the format's largest representable value, round to FP8, and remember the scale to dequantize later. Outliers are the enemy: one huge value forces a tiny scale on everything else in the tensor. So V3 quantizes finely, activations in 1x128 tiles (per token, per 128 channels) and weights in 128x128 blocks, with the scale recomputed online each step. Two further fixes: accumulation stays exact by promoting partial sums to CUDA cores every 128 products, because H800 tensor cores keep only about 14 bits of accumulation; and master weights and gradients stay in FP32. V3 uses E4M3 on all tensors rather than the usual E5M2-for-backward split.",
      },
      {
        kind: "visual",
        visual: "fp8-range",
        caption:
          "FP8 trades mantissa for exponent range; per-tile scaling maps each small block into that range so a single outlier cannot distort a whole tensor. V3 uses 1x128 tiles for activations and 128x128 blocks for weights.",
      },
      {
        kind: "formula",
        label: "Per-tile FP8 scaling",
        expression:
          "scale = max_fp8 / amax(X)\nX_fp8 = round_to_e4m3(X * scale)\nX_hat = X_fp8 / scale",
        why: "amax is the largest absolute value in the tile, so dividing by it maps the tile exactly into the format's range. The round-trip error is then set by the 3-bit mantissa, not by the tensor's global dynamic range, and smaller tiles shrink amax. Weights use 128x128 blocks because weight matrices are smoother than activations.",
      },
      {
        kind: "code",
        title: "Scale a tile, round to E4M3, dequantize",
        language: "python",
        code: `from math import floor, log2

def to_e4m3(x):
    if x == 0.0:
        return 0.0
    sign = -1.0 if x < 0 else 1.0
    a = abs(x)
    e = max(-6, min(8, floor(log2(a))))
    step = 2.0 ** (e - 3)
    return sign * round(a / step) * step

def quantize_tile(xs, max_fp8=448.0):
    scale = max_fp8 / max(abs(x) for x in xs)
    return [to_e4m3(x * scale) / scale for x in xs]

print(quantize_tile([0.004, -0.011, 2.5, 0.008]))`,
        notes: [
          "448.0 is the largest magnitude E4M3 can represent in the OCP FP8 spec; three mantissa bits mean values snap to eight steps per exponent.",
          "The real implementation is hardware: tile scale recomputed online, GEMM in FP8, FP32 promotion every 128 products.",
        ],
      },
      {
        kind: "prose",
        heading: "Balancing without a balance loss",
        text: "V3 routes with the bias-only trick: rank experts by s_i + b_i, weight their outputs by s_i, and move each bias one step in the sign of the previous batch's load error. One refinement matters at this scale: a complementary sequence-wise balance loss with a very small weight, there only to stop pathological imbalance inside a single sequence. With balance handled this way, V3 drops no tokens at all, during training or inference. Communication is bounded by node-limited routing: each token is sent to at most 4 nodes, chosen by the sum of each node's top K_r / M expert scores. Each MoE layer has 1 shared expert and 256 routed experts, 8 of them activated per token; the first three layers stay dense.",
      },
      {
        kind: "visual",
        visual: "load-balance",
        caption:
          "A bias-only router keeps 256 experts evenly loaded at 671B scale; the tiny sequence-wise auxiliary loss is a safety net, not the main control, and no tokens are dropped.",
      },
      {
        kind: "prose",
        heading: "Predict the next two tokens",
        text: "Instead of supervising only the next token, V3 adds a multi-token prediction module that, at position i, predicts token i+2 from the depth-1 hidden state combined with the embedding of token i+1. The module is one transformer block with a projection and a shared embedding and output head, trained with its own cross-entropy loss; the total objective is the main loss plus lambda times the MTP loss. Two things come out of it: denser training signal, which the ablations show improves benchmarks, and a free speculative-decoding draft at inference. The draft proposes a second token, the main model verifies it, and the report measures an 85-90% acceptance rate and 1.8x tokens per second.",
      },
      {
        kind: "visual",
        visual: "mtp-tokens",
        caption:
          "Multi-token prediction: each depth-k module chains the previous depth's representation with the embedding of the next token to predict one token further ahead, keeping the causal chain. Inference can discard the module or use it to draft.",
      },
      {
        kind: "formula",
        label: "MTP objective",
        expression:
          "L_MTP = (lambda / D) * sum_k L_MTP^k,  with D = 1\nL_MTP^k = -(1 / T) * sum_i log P_i^k[t_i]",
        why: "Each depth contributes a cross-entropy term over the sequence, averaged over depths and weighted by lambda. V3 uses one extra token (D = 1), enough to improve benchmarks and to serve as a draft model. Keeping the complete causal chain at each depth is what makes the modules reusable at inference: the draft conditions on tokens the main model has already produced.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem",
        text: "V2's architecture was validated, but scaling it to frontier quality raises three questions: can training run in 8-bit precision without losing accuracy, can load balancing stop taxing the language objective, and can the training objective itself be made richer than one-token prediction. And the whole thing has to be affordable without a giant cluster.",
      },
      {
        kind: "prose",
        heading: "Key idea",
        text: "Layer the fixes. MLA plus DeepSeekMoE at 671B total and 37B active; a bias-only router with a tiny sequence-wise complement and no token dropping; an FP8 mixed-precision framework with fine-grained scaling, online scales, and FP32 promotion; and a one-token MTP objective that also accelerates inference. Everything is trained with the DualPipe framework (a pipeline schedule that overlaps communication with computation) on 2048 H800s, with no tensor parallelism.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "14.8T training tokens. Full training costs 2.788M H800 GPU-hours: 2.664M pretraining, 119K context extension, 5K post-training, about $5.576M at $2 per GPU-hour, and about 180K GPU-hours per trillion tokens, 3.7 days on the 2048-GPU cluster. The run had no irrecoverable loss spikes and no rollbacks. Ablations at 15.7B and 228.7B scale show the loss-free router and MTP each improve benchmarks over strong baselines, and the MTP draft is accepted 85-90% of the time for a 1.8x decoding speedup. The model reports 88.5 MMLU, 75.9 MMLU-Pro, and 59.1 GPQA, comparable to leading closed models of the period.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "The conclusion names two deployment limits: the recommended deployment unit is large, which is a burden for small teams, and generation speed, while more than twice V2's, still has room to improve. The FP8 section is also explicit that the H800's limited accumulation precision is a hardware deficiency partially worked around in software, and the hardware-design chapter lists what future chips should do natively.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Three transferable moves: quantize fine and accumulate wide if you want 8-bit training to hold; move balancing out of the loss and into the router; and treat a training objective change as a potential inference optimization (MTP as a draft model). Then measure cost per token, not just benchmark scores, because that is what decides whether the next scale-up is affordable.",
      },
    ],
    questions: [
      {
        id: "deepseek-v3-q1",
        prompt: "Why does V3 scale per 1x128 tile for activations instead of using one scale per tensor?",
        options: [
          "Per-tensor scaling is not supported by the E4M3 format",
          "Outliers in activations force a tiny per-tensor scale; small tiles shrink amax so one huge value cannot crush the precision of the rest",
          "Tiles are needed to keep the exponent unbiased",
          "Per-tensor scaling would require storing the scale in FP32",
        ],
        answer: 1,
        explanation:
          "Activation outliers are the known failure mode of FP8 training. Fine-grained scaling localizes the dynamic range problem to one small group of numbers.",
      },
      {
        id: "deepseek-v3-q2",
        prompt: "Why does the GEMM promote partial sums to CUDA cores every 128 products?",
        options: [
          "To reduce the number of FP8 multiplications",
          "Because H800 tensor cores accumulate at roughly 14 bits, and promotion restores accuracy; the paper measured up to about 2% relative error without it for K = 4096",
          "To keep the weights in BF16",
          "Because CUDA cores are faster at FP8 math",
        ],
        answer: 1,
        explanation:
          "Fine-grained quantization alone is not enough if the accumulation is truncated. Promoting to FP32 registers every 128 multiply-accumulates keeps the relative error under 0.25% in their tests.",
      },
      {
        id: "deepseek-v3-q3",
        prompt: "What does the MTP module do at inference time?",
        options: [
          "It must stay active to produce the second token",
          "It replaces the main model on short sequences",
          "It can be discarded, or used as a speculative-decoding draft that proposes the next-next token for verification",
          "It compresses the KV cache",
        ],
        answer: 2,
        explanation:
          "MTP mainly improves training. At inference it is optional: discard it and the model behaves normally, or keep it to draft tokens, with 85-90% acceptance measured.",
      },
      {
        id: "deepseek-v3-q4",
        prompt: "How does V3 keep its 256 routed experts balanced?",
        options: [
          "A large auxiliary loss tuned for the whole run",
          "A bias added only to top-K selection, a very weak sequence-wise auxiliary loss, and no token dropping",
          "Token dropping with a capacity factor of 1.0",
          "Randomized routing during the first 10% of training",
        ],
        answer: 1,
        explanation:
          "The bias does the balancing; the sequence-wise loss is a tiny complement against per-sequence extremes; the report states no tokens are dropped in training or inference.",
      },
      {
        id: "deepseek-v3-q5",
        prompt: "Which number is the full training cost of DeepSeek-V3?",
        options: [
          "180K H800 GPU-hours",
          "2.788M H800 GPU-hours, about $5.576M at $2 per GPU-hour",
          "14.8M H800 GPU-hours",
          "671B GPU-hours, one per parameter",
        ],
        answer: 1,
        explanation:
          "The report's cost table: 2664K pretraining plus 119K context extension plus 5K post-training equals 2788K H800 GPU-hours; 180K is the per-trillion-token pretraining figure.",
      },
      {
        id: "deepseek-v3-q6",
        prompt: "Why does V3 limit each token to at most 4 nodes during routing?",
        options: [
          "To keep each expert on its own node",
          "To bound all-to-all communication per token; the paper notes the same cost could support up to 13 experts in theory",
          "Because 8 activated experts cannot span more than 4 nodes",
          "To make the router's bias update cheaper",
        ],
        answer: 1,
        explanation:
          "Node-limited routing caps cross-node hops. The paper notes the same 4-node communication budget could stretch from 8 to 13 activated experts without extra cost.",
      },
    ],
    practice: {
      concepts: ["info-entropy", "la-matrix-ops"],
      articles: ["art-quantization", "art-kv-cache"],
      research: ["mini-language-model"],
      problems: ["dl-321", "dl-323", "dl-361", "dl-385", "dl-291", "dl-402"],
    },
    project: {
      title: "Tile-scale FP8 plus a two-token MTP head",
      pitch: "Two halves of the V3 report, built small. First, an FP8 quantizer with per-tile scaling: show that one activation outlier forces a per-tensor scale that crushes small values, and that 128-number tiles rescue them. Second, a multi-token prediction head in n-gram form: train a 1-step head and a 2-step head whose context includes the intermediate token, then compare held-out accuracy as a stand-in for draft acceptance.",
      difficulty: "advanced",
      timeEstimate: "5-8 hours",
      milestones: [
        "Emulate E4M3 rounding with three mantissa bits and a 448 maximum, as in the paper.",
        "Build an activation vector with one large outlier and small values near 1e-5, and quantize it per tensor and per 128-number tile.",
        "Measure relative error on the non-outlier tile for both scaling schemes and explain the gap.",
        "Sweep tile sizes 32, 64, 128, 256 and report error against the number of scale recomputations.",
        "Build a synthetic token stream with local motif structure and hold out the tail.",
        "Train a 1-step next-token counter and a 2-step counter that conditions on the intermediate token.",
        "Report held-out accuracy for both heads and the acceptance rate a draft would see.",
        "Estimate a full-tensor FP8 GEMM against the tiled scheme: error versus metadata bytes.",
      ],
      starterCode: `import random
from math import floor, log2
from collections import Counter
random.seed(2)
# EXPECTED before TODOs: outlier 5.0 with small values near 1e-05, then "unimplemented".
# EXPECTED after TODOs: per-tensor tail err 0.735, per-128-tile 0.019,
# main head 1-step 0.836, mtp head 2-step 0.837.
def to_e4m3(x):
    if x == 0.0: return 0.0
    sign = -1.0 if x < 0 else 1.0
    a = abs(x)
    e = max(-6, min(8, floor(log2(a))))
    step = 2.0 ** (e - 3)
    return sign * round(a / step) * step
def quantize_tile(xs, tile, max_fp8=448.0):
    """TODO: split xs into tiles of size tile, scale each by
    max_fp8 / amax, round to E4M3, dequantize, and return the flat list."""
    raise NotImplementedError("TODO: quantize_tile")
def rel_err(true, hat):
    return sum(abs(a - b) for a, b in zip(true, hat)) / (sum(abs(a) for a in true) or 1.0)
activations = [random.gauss(0.0, 1e-5) for _ in range(256)]
activations[0] = 5.0
tail = activations[128:]
print("one outlier at", activations[0], "small values near", round(abs(tail[0]), 8))
MOTIFS = [(0, 1, 2), (0, 1, 3)]
stream = [t for _ in range(1500) for t in random.choice(MOTIFS)]
def ngram_accuracy(stream, order, target, train_len=3000):
    """TODO: count (context -> next) on stream[:train_len], then predict
    stream[i + order + target - 1] from stream[i:i + order] on the held-out
    tail and return accuracy. Main head: order 2, target 1. MTP head: order
    3, target 1, so its context includes the intermediate token."""
    raise NotImplementedError("TODO: ngram_accuracy")
try:
    print("fp8 per-tensor tail err:", round(rel_err(tail, quantize_tile(activations, 256)[128:]), 4))
    print("fp8 per-128-tile tail err:", round(rel_err(tail, quantize_tile(activations, 128)[128:]), 4))
    print("main head 1-step acc:", round(ngram_accuracy(stream, 2, 1), 3))
    print("mtp head 2-step acc:", round(ngram_accuracy(stream, 3, 1), 3))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "Per-tensor scaling shows relative error above 0.5 on the non-outlier tile; per-128-tile scaling brings it below 0.05.",
        "The 2-step MTP head lands within 5 accuracy points of the 1-step head on the same held-out stream.",
        "The write-up states the E4M3 mantissa limit (roughly 6-12% per-element relative error) and why tiling helps only when the dynamic range is wide.",
        "Both experiments run in one fixed-seed script with no third-party imports.",
      ],
      stretch: [
        "Add FP32 promotion every 128 products to the GEMM estimate and show how much accumulation error it removes.",
        "Quantize the residual stream as well as the activations and measure how error compounds across simulated layers.",
        "Replace the n-gram heads with a tiny learned linear softmax trained by SGD and compare 1-step and 2-step accuracies.",
      ],
      relatedProblemIds: ["dl-321", "dl-323", "dl-361"],
    },
  },
  {
    id: "deepseek-vl2",
    slug: "deepseek-vl2",
    title:
      "DeepSeek-VL2: Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding",
    short: "DeepSeek-VL2",
    year: 2024,
    date: "2024-12-13",
    arxivId: "2412.10302",
    url: "https://arxiv.org/abs/2412.10302",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "Drop the fixed view: cut the image into 384-pixel tiles, add a thumbnail, and let an MLA-plus-MoE trunk read the grid.",
    whatItIs:
      "DeepSeek-VL2 is the second generation of DeepSeek's vision-language family, shipped at three MoE scales: 3B, 16B, and 27B total parameters with 1.0B, 2.8B, and 4.5B activated. The vision side replaces DeepSeek-VL's hybrid SigLIP-plus-SAM encoder with dynamic tiling: one SigLIP-SO400M-384 encoder reads a global thumbnail plus up to nine 384 x 384 local tiles whose grid is chosen to fit the image's aspect ratio, and a 2 x 2 pixel shuffle plus a two-layer MLP compresses each tile to 196 tokens. The language side is DeepSeekMoE with MLA, so the architecture that made V2 cheap to serve now reads images. All three sizes are open, and the 27B model reaches DocVQA 93.3, ChartQA 86.0, OCRBench 811, and MMBench 83.1.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-vl",
      to: ["deepseek-ocr"],
      context:
        "The vision-language line's second step. DeepSeek-VL fused a semantic encoder with a segmentation encoder at a fixed 1024 x 1024; VL2 keeps one encoder but changes what it is shown, and swaps the dense trunk for the V2 architecture so multimodal serving inherits MLA's small cache and the MoE's low activated compute.",
      improved: [
        "Dynamic tiling replaces the fixed-resolution view: candidate grids up to 3 x 3 tiles are scored by padding area, and the best grid plus a global thumbnail is what the encoder sees.",
        "One shared SigLIP-SO400M-384 encoder serves every tile, producing 27 x 27 = 729 embeddings per tile that a pixel shuffle (a space-to-depth fold of 2 x 2 patches into one position) compresses to 14 x 14 = 196 tokens.",
        "The language model is DeepSeekMoE with MLA at three scales (3B/16B/27B total, 1.0B/2.8B/4.5B activated), so the family inherits V2's inference economics.",
        "Document and chart understanding jump well beyond DeepSeek-VL: DocVQA 93.3, ChartQA 86.0, InfoVQA 78.1, and OCRBench 811, against 456 on OCRBench for the 7B predecessor.",
        "A three-stage recipe (adaptor alignment on 2B tokens, about 800B image-text tokens of joint training, then SFT) with expert bias correction enabled in stage 2.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why a fixed resolution breaks on real images",
        text: "DeepSeek-VL fed every image through a 1024 x 1024 path because that is what its SAM-B branch required. Real documents, infographics, and screenshots do not cooperate: they arrive as tall scans, wide charts, or dense pages, and forcing them into a square wastes pixels on padding and shrinks the text you actually need to read. The tiling idea is the standard answer, and VL2's version is worth studying because the grid is chosen per image rather than fixed. The encoder stays small and unchanged; what varies is how many times it is run and in what arrangement.",
      },
      {
        kind: "prose",
        heading: "Choosing a grid, then reading it",
        text: "The candidate set is every grid (m x 384, n x 384) with m and n at least 1 and m * n at most 9. For an input image the pipeline resizes to each candidate and measures the padding area, then keeps the candidate that pads least. That image is cut into m * n local tiles of 384 x 384, and a single global thumbnail of the whole image is added. One SigLIP-SO400M-384 encoder processes all 1 + m * n views. Each view becomes 729 embeddings of width 1152; a 2 x 2 pixel shuffle turns that into a 14 x 14 = 196-token patch. Newline tokens mark rows, a view-separator token splits thumbnail from tiles, and a two-layer MLP projects the sequence into the language model's embedding space.",
      },
      {
        kind: "formula",
        label: "Visual token budget",
        expression:
          "N_visual = 210 + 1 + m * 14 * (n * 14 + 1),   with 1 <= m, n and m * n <= 9",
        why: "The thumbnail contributes 14 x 15 = 210 tokens (14 rows plus a newline per row), the view separator adds 1, and each of the m * 14 tile rows contributes n * 14 content tokens plus a newline. A single 384 x 384 tile therefore costs 421 tokens, and the largest 3 x 3 layout costs 2017. The budget is the knob that trades resolution for context length, and it is set by the image's shape rather than by a constant.",
      },
      {
        kind: "code",
        title: "Picking the grid with least padding",
        language: "python",
        code: `def choose_grid(h, w, base=384, max_tiles=9):
    """Return (m, n) rows x cols whose padding area is smallest."""
    best, best_pad = None, float("inf")
    for m in range(1, max_tiles + 1):
        for n in range(1, max_tiles + 1):
            if m * n > max_tiles:
                continue
            target_h, target_w = m * base, n * base
            # resize until the long side fits, then pad the short side
            scale = min(target_h / h, target_w / w)
            rh, rw = h * scale, w * scale
            pad = target_h * target_w - rh * rw
            if pad < best_pad:
                best, best_pad = (m, n), pad
    return best

print(choose_grid(1200, 800))   # (3, 2): tall image, least wasted area
print(210 + 1 + 3 * 14 * (2 * 14 + 1))  # 1429 visual tokens for that grid`,
        notes: [
          "The paper defines the candidate set the same way: (m * 384, n * 384) with m, n >= 1 and m * n <= 9, then picks the minimum padding area.",
          "Padding is measured after scaling so the image keeps its aspect ratio; a 1200 x 800 photo prefers 3 rows by 2 columns over a square.",
          "When a conversation carries more than two images, the pipeline disables tiling and processes each image as one view, because the token count would otherwise crowd out the dialogue.",
        ],
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "Dynamic tiling: one SigLIP-SO400M-384 encoder reads a global thumbnail plus m * n local tiles; a pixel shuffle compresses each view to 196 tokens and the MLP projects them into an MLA-plus-MoE trunk.",
      },
      {
        kind: "prose",
        heading: "Why the trunk is the V2 architecture",
        text: "A vision-language model is prefill-heavy: the model reads a long sequence of visual tokens once and then writes a comparatively short answer. That makes the two V2 choices directly relevant. MLA compresses the KV cache into a latent, so the long visual prefix does not balloon memory during decoding, and DeepSeekMoE keeps the activated parameter count near 4.5B for the 27B model, so the FLOPs per token track the small active budget rather than the total. The paper's deployment note follows from the same arithmetic: the 3B, 16B, and 27B models fit on single GPUs with roughly 10GB, 40GB, and 80GB of memory.",
      },
      {
        kind: "prose",
        heading: "Three training stages",
        text: "Stage 1 trains only the adaptor, with the vision encoder and language model frozen, on 2B tokens - enough to align the spaces and no more. Stage 2 is joint vision-language pretraining on about 800B image-text tokens with the language model unfrozen; this is where the model learns to read documents and charts. Stage 3 is supervised fine-tuning on in-house vision-language instructions, mixing in text-only dialogue data from DeepSeek-V2 so language ability does not regress. One detail carried from the efficiency era: the 27B model turns on the expert bias correction from the loss-free balancing work during stage 2, which is the same router fix used in the V3 line.",
      },
      {
        kind: "visual",
        visual: "timeline",
        caption:
          "From DeepSeek-VL's fixed 1024 x 1024 hybrid encoder to VL2's dynamic tiling on a shared SigLIP encoder, across three scales (3B/16B/27B total, 1.0B/2.8B/4.5B activated).",
      },
      {
        kind: "prose",
        heading: "Results and the honest limits",
        text: "The 27B model posts DocVQA 93.3, ChartQA 86.0, InfoVQA 78.1, TextVQA 84.2, OCRBench 811, MMBench 83.1, MMMU 51.1, MMStar 61.3, and MathVista 62.8, competitive with dense open models several times larger while activating 4.5B parameters. The Tiny model's 1.0B active budget still reaches DocVQA 88.9 and MMBench 73.3. The limits are structural: tiling multiplies the number of encoder passes, so cost scales with the grid; the encoder itself is frozen from a contrastive pretraining that never saw the tiling layout; and MMMU-class reasoning remains far behind the best closed models of the period. Read the paper for the tiling arithmetic and the stage-2 data recipe, not for a claim about multimodal reasoning.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Vision-language models of the time either fixed their input resolution, which wastes pixels on odd aspect ratios, or scaled the encoder itself. DeepSeek-VL2 asks whether one small encoder plus a per-image tiling policy can match much larger dense models at a fraction of the activated compute.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two substitutions. The vision side substitutes dynamic tiling for a fixed high-resolution encoder. The language side substitutes DeepSeekMoE plus MLA for a dense trunk. Read Section 2 for the tiling and token arithmetic, Section 3 for the three-stage schedule and the data, and the tables for the per-scale comparison.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "DeepSeek-VL2 (27B total, 4.5B activated): DocVQA 93.3, ChartQA 86.0, InfoVQA 78.1, TextVQA 84.2, OCRBench 811, MMBench 83.1, MMBench-CN 79.6, MMMU 51.1, MMStar 61.3, MathVista 62.8, RealWorldQA 68.4, AI2D 81.4, MME 2253. Small (16B/2.8B): DocVQA 92.3, OCRBench 834. Tiny (3B/1.0B): DocVQA 88.9, OCRBench 809. Grounding is evaluated on RefCOCO, RefCOCO+, and RefCOCOg, where the models beat other VLMs at similar scale.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The vision encoder is frozen and pretrained for contrastive alignment, not for this tiling layout. Tiling is disabled for more than two images per conversation, a context-length compromise. The benchmark suite is the authors' selection, and the comparison models come from the same release window. Nothing here closes the reasoning gap on MMMU-style tasks, and the report is a technical report rather than a peer-reviewed paper.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "For document-heavy multimodal work, resolution policy matters more than encoder size: one shared encoder run over a per-image grid is cheaper than a bigger encoder run once. Then budget the visual tokens explicitly, because that number sets both context length and serving cost, and keep enough text-only data in the final stage that the language half does not forget how to talk.",
      },
    ],
    questions: [
      {
        id: "vl2-q1",
        prompt:
          "An image is assigned a 2 x 2 tiling grid. How many encoder views does SigLIP process?",
        options: [
          "4, one per tile",
          "5: the four local tiles plus one global thumbnail",
          "8: two views per tile",
          "1: the encoder reads the whole image directly",
        ],
        answer: 1,
        explanation:
          "The pipeline always adds one global thumbnail to the m * n local tiles, so a 2 x 2 grid means 1 + 4 = 5 forward passes through the same SigLIP-SO400M-384 encoder. The thumbnail preserves global layout while the tiles preserve detail.",
      },
      {
        id: "vl2-q2",
        prompt:
          "Each tile yields 729 embeddings of width 1152. After the pixel shuffle and newline tokens, roughly how many tokens per tile enter the language model?",
        options: ["729", "196 plus a newline per row", "1152", "384"],
        answer: 1,
        explanation:
          "A 2 x 2 pixel shuffle turns the 27 x 27 grid into 14 x 14 = 196 content tokens, and each of the 14 rows gets a newline token. The full sequence formula is 210 + 1 + m * 14 * (n * 14 + 1) for the thumbnail, separator, and tiles.",
      },
      {
        id: "vl2-q3",
        prompt:
          "The 27B model activates 4.5B parameters per token. Which pair of V2 ideas does it inherit, and why do they matter for vision?",
        options: [
          "Multi-token prediction and FP8 training, which speed up image decoding",
          "MLA and DeepSeekMoE: the latent KV cache keeps the long visual prefix cheap to attend over, and MoE keeps per-token compute near the activated budget",
          "Device-limited routing and token dropping, which shrink the image encoder",
          "Shared experts and dense FFNs, which reduce the number of encoder passes",
        ],
        answer: 1,
        explanation:
          "Multimodal prefill is long and decode is short, so the KV cache and the per-token FLOPs are the two costs that matter. MLA compresses the cache and DeepSeekMoE keeps activated parameters low, which is why the 27B model fits on a single 80GB GPU.",
      },
      {
        id: "vl2-q4",
        prompt:
          "Why does the pipeline disable dynamic tiling when a conversation contains more than two images?",
        options: [
          "The encoder cannot process tiles from different images",
          "Because tiling multiplies the visual token count, and several tiled images would crowd out the dialogue in the context window",
          "Because the pixel shuffle fails on repeated tiles",
          "Because SigLIP only accepts square inputs",
        ],
        answer: 1,
        explanation:
          "Each tiled image can cost up to 2017 tokens. With multiple images in one conversation, that arithmetic would leave little room for text, so the pipeline falls back to one view per image. It is a context-length compromise, not an encoder limitation.",
      },
      {
        id: "vl2-q5",
        prompt:
          "Which result best supports the claim that a small activated budget can still read documents well?",
        options: [
          "DeepSeek-VL2-Tiny (1.0B activated) reaches DocVQA 88.9 and OCRBench 809",
          "DeepSeek-VL2 reaches MMMU 51.1",
          "The 16B model beats the 27B model on OCRBench",
          "The models fit on one GPU",
        ],
        answer: 0,
        explanation:
          "Document understanding is the task where high-resolution detail matters most, and the Tiny variant's 1.0B active parameters still reach DocVQA 88.9, far above same-size dense models of its release window. MMMU 51.1 shows the reasoning ceiling, and the GPU-fit note is about deployment, not capability.",
      },
    ],
    practice: {
      concepts: ["la-vectors", "stats-correlation"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-175", "cv-249", "cv-296"],
    },
    project: {
      title: "Dynamic tiling with content-routed experts",
      pitch: "Build the vision half of DeepSeek-VL2 on synthetic images: choose the tile grid that wastes the least padding, cut the image into tiles, route each tile to a small content expert, and stitch the tile features before classifying. The baseline squeezes the whole image into one tile; the tiled pipeline should find a small high-contrast patch that the global average dilutes.",
      difficulty: "intermediate",
      timeEstimate: "3-5 hours",
      milestones: [
        "Generate synthetic 48x32 images, half containing a 16x16 bright patch aligned to a tile boundary, and keep the labels.",
        "Implement the VL2 grid rule: try every (m, n) with m * n <= 9, resize to m*TILE by n*TILE preserving aspect ratio, and keep the least-padding grid.",
        "Implement tile features: one (mean, std) pair per tile in row-major order.",
        "Implement content routing: flat tiles go to the amplify expert, textured tiles to the identity expert.",
        "Classify the stitched features and report accuracy for the single-tile baseline and the tiled pipeline.",
        "Sweep the classification threshold and report the best accuracy for both pipelines.",
        "Shift the bright patch off the tile grid and report how much accuracy drops.",
      ],
      starterCode: `import random
random.seed(11)
# EXPECTED before TODOs: single-tile baseline 0.445, then "unimplemented".
# EXPECTED after TODOs: dynamic tiling grid (3, 2), accuracy 1.0.
H, W, TILE = 48, 32, 16

def make_image(rng):
    img = [[rng.gauss(0, 0.3) for _ in range(W)] for _ in range(H)]
    hot = rng.random() < 0.5
    if hot:
        r, c = rng.randrange(H // TILE) * TILE, rng.randrange(W // TILE) * TILE
        for i in range(r, r + TILE):
            img[i][c:c + TILE] = [x + 3.0 + rng.gauss(0, 0.1) for x in img[i][c:c + TILE]]
    return img, hot

def choose_grid(h, w, max_tiles=9):
    """TODO: score every (m, n) with m * n <= max_tiles by padding area after
    aspect-preserving resize as in VL2; return the best grid."""
    raise NotImplementedError("TODO: choose_grid")

def tile_features(img, m, n):
    """TODO: cut img into m x n tiles of TILE x TILE; return (mean, std) per tile."""
    raise NotImplementedError("TODO: tile_features")

def route_and_stitch(features):
    return [mean * 2.0 if std < 0.5 else mean for mean, std in features]

def single_tile_features(img):
    vals = [x for row in img for x in row]
    mean = sum(vals) / len(vals)
    return [(mean, (sum((x - mean) ** 2 for x in vals) / len(vals)) ** 0.5)]

def classify(stitched):
    return 1 if max(stitched) > 1.5 else 0

images = [make_image(random) for _ in range(200)]
base = sum(classify(route_and_stitch(single_tile_features(img))) == hot for img, hot in images)
print("single-tile baseline accuracy:", round(base / len(images), 3))
try:
    m, n = choose_grid(H, W)
    acc = sum(classify(route_and_stitch(tile_features(img, m, n))) == hot for img, hot in images)
    print("dynamic tiling grid", (m, n), "accuracy:", round(acc / len(images), 3))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The single-tile baseline lands near chance (about 0.5), showing the global average hides the patch.",
        "The tiled pipeline reaches at least 0.95 accuracy on the same 200 images with a fixed seed.",
        "The grid selected for a 48x32 image is (3, 2) and the script prints it.",
        "Both pipelines and the threshold sweep run in one standard-library script under 5 seconds.",
      ],
      stretch: [
        "Add a third expert for high-variance noise tiles and test whether routing by std still separates the content types.",
        "Disable tiling when more than two images share a context and check the token-count arithmetic from the paper's formula.",
        "Quantize each tile feature and measure how much accuracy survives before the stitched vector is classified.",
      ],
      relatedProblemIds: ["cv-175"],
    },
  },
  {
    id: "esft",
    slug: "esft",
    title:
      "Let the Expert Stick to His Last: Expert-Specialized Fine-Tuning for Sparse Architectural Large Language Models",
    short: "ESFT",
    year: 2024,
    date: "2024-07-02",
    arxivId: "2407.01906",
    url: "https://arxiv.org/abs/2407.01906",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "Customize an MoE model by tuning only the experts the task already routes to: 75% to 95% fewer trainable parameters, storage down 90%, and quality that matches full fine-tuning.",
    whatItIs:
      "ESFT is a parameter-efficient fine-tuning method built specifically for mixture-of-experts models. The observation is that a task's tokens concentrate on a small set of experts, and different tasks use different sets, so customizing a model should mean updating the task's experts and freezing everything else. The paper scores expert relevance two ways - average gate score and token selection ratio - and shows that tuning only the selected experts matches full fine-tuning on the custom task while preserving general ability better, reducing storage by up to 90% and training time by up to 30%. Experiments use DeepSeek-V2-Lite, whose fine-grained experts (66 per layer) turn out to be what makes the method work: coarser experts degrade under the same selection strategy.",
    theoryMinutes: 12,
    lineage: {
      from: "deepseek-v2",
      context:
        "A methods paper about customizing the sparse architecture rather than scaling it. Its backbone is DeepSeek-V2-Lite, and its finding - fine-grained experts make selective tuning effective - is a direct payoff of the DeepSeekMoE design decisions from the founding era. It sits beside the loss-free balancing work as the second paper in this era about the router as a first-class object.",
      improved: [
        "Measures expert dispersion: routing for one task is highly concentrated, while the experts that different tasks activate differ significantly, so specialization is real and per-task.",
        "Proposes ESFT: score expert relevance with average gate score or token selection ratio, tune only the top-scoring experts, and freeze all other experts and modules.",
        "Matches full fine-tuning on the custom task average (50.2 versus 51.0) while beating LoRA (low-rank adaptation, 44.9), and preserves general-task performance better than full fine-tuning.",
        "Reports 75% to 95% fewer trainable parameters per task (2 to 15 experts out of 66 per layer), up to 90% less storage, and up to 30% less training time than full fine-tuning.",
        "Shows the method depends on fine-grained segmentation: grouping experts into coarser units lowers ESFT quality below full fine-tuning while raising its cost.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why MoE fine-tuning is a different problem",
        text: "A dense model is one set of weights, so customizing it means either updating all of them (expensive, and it degrades everything else) or attaching a low-rank adapter to every layer (cheap, but it does not use the architecture's structure). An MoE model is not one set of weights: each token is processed by a small, task-dependent subset of experts, and the router is already telling you which parameters that task cares about. ESFT takes that signal seriously. Instead of asking which weights are cheap to train, it asks which weights the task is actually using.",
      },
      {
        kind: "prose",
        heading: "The observation: concentrated but disjoint routing",
        text: "The paper first measures how task data flows through a trained MoE. For a single task, the routing distribution is highly concentrated: a small number of experts take most of the tokens, and that concentration holds layer by layer. Across tasks, the sets differ - math leans on one combination, translation on another - so the model has already organized itself into specialists. That is exactly the premise DeepSeekMoE was designed around, and it has a practical corollary: updating the whole network dilutes the task's specialists by moving experts that the task never uses.",
      },
      {
        kind: "formula",
        label: "Two relevance scores",
        expression:
          "gate score of expert i = mean over the task's tokens of s_i\nselection ratio of expert i = count(tokens routed to i) / total tokens",
        why: "s_i is the router's affinity score for expert i on a token, so the average gate score measures how strongly the router prefers that expert on this task's data; the token selection ratio measures how often the expert is actually chosen. The first can favor experts that are confident but rarely selected; the second favors pure load. The paper builds ESFT-Gate and ESFT-Token from the two and reports that both work, with ESFT-Token generally choosing fewer experts.",
      },
      {
        kind: "code",
        title: "Selecting task experts by gate score",
        language: "python",
        code: `def expert_relevance(records, n_experts):
    """records: (scores, chosen) per token, where scores is the full gate
    vector and chosen is the set of top-k expert indices."""
    gate_sum, gate_count = [0.0] * n_experts, [0] * n_experts
    picked = [0] * n_experts
    for scores, chosen in records:
        for i, s in enumerate(scores):
            gate_sum[i] += s
            gate_count[i] += 1
        for i in chosen:
            picked[i] += 1
    tokens = len(records)
    avg_gate = [gate_sum[i] / gate_count[i] for i in range(n_experts)]
    ratio = [picked[i] / tokens for i in range(n_experts)]
    return avg_gate, ratio

def select_experts(avg_gate, ratio, per_layer=8):
    by_gate = sorted(range(len(avg_gate)), key=lambda i: avg_gate[i], reverse=True)
    by_ratio = sorted(range(len(ratio)), key=lambda i: ratio[i], reverse=True)
    return by_gate[:per_layer], by_ratio[:per_layer]`,
        notes: [
          "The real pipeline collects statistics over a sample of the task's data once, then fixes the expert list for the whole fine-tuning run.",
          "Selection is per layer, because the concentrated-expert pattern varies by depth; the paper reports that middle layers need the fewest experts.",
          "Freezing everything else means the optimizer state and the gradient buffers for the frozen experts disappear, which is where the storage saving comes from.",
        ],
      },
      {
        kind: "visual",
        visual: "moe-routing",
        caption:
          "Score each expert on the task's data, keep the top ones, and update only those. The router decides which parameters a task is entitled to train.",
      },
      {
        kind: "prose",
        heading: "What freezing buys",
        text: "The economics are the point. Full fine-tuning of an MoE model updates every expert and stores a full copy of the model per task; ESFT updates between 2 and 15 of 66 experts per layer, so the per-task checkpoint is a fraction of the weights, the optimizer state shrinks with it, and the backward pass only touches the selected experts. The paper reports storage reductions up to 90% and training-time reductions up to 30% versus full fine-tuning. The quality claim is the surprising half: ESFT-Gate's average of 50.2 is statistically comparable to full fine-tuning's 51.0, and its general-task retention is better, because the experts that were not needed for the task keep their original behavior.",
      },
      {
        kind: "prose",
        heading: "The ablation that ties it to the architecture",
        text: "The paper's most interesting control merges experts into coarser groups - exactly the design DeepSeekMoE argued against - and reruns the same selection method. As groups grow, ESFT's quality falls faster than full fine-tuning's while its cost rises, because a coarse expert that serves several functions cannot be specialized without breaking the others. The lesson generalizes: selective fine-tuning is only as good as the granularity of the units you can select. Fine-grained experts are what make the selection meaningful, which is a strong independent endorsement of the founding-era architecture choice.",
      },
      {
        kind: "visual",
        visual: "fine-grained-experts",
        caption:
          "Why granularity matters: with 66 small experts the task's specialists can be isolated; merged into coarse groups, the same selection drags in unrelated functions and the advantage disappears.",
      },
      {
        kind: "prose",
        heading: "Results and limits",
        text: "On a suite that spans model-enhancement tasks (math, code) and model-adaptation tasks (intent, law, translation), ESFT-Gate averages 50.2 against full fine-tuning's 51.0 and LoRA's 44.9, with near-best results on several individual tasks including HumanEval. Replacing the selected experts with random ones at the same count drops performance sharply, which isolates relevance scoring as the active ingredient. The limits are honest: the method needs a statistic-collection pass over task data before training, relevance is measured on the base model rather than re-estimated as tuning proceeds, and everything is validated on one backbone (DeepSeek-V2-Lite) and a curated alignment corpus that deliberately holds math and code out of the base mixture. It is a customization recipe, not a claim about frontier-scale training.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Parameter-efficient fine-tuning was developed for dense models, where every task touches every weight. Sparse MoE models route each task through a small subset of experts, so the dense recipes are both more expensive than necessary and blind to the structure that makes the model cheap.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Relevance-based selection. Section 3 establishes that task routing is concentrated and disjoint across tasks; Section 3.3 defines ESFT and the two relevance scores; Sections 5 and 6 report the customization results and the granularity ablation. Read the random-expert control, because it is what proves the selection is doing the work.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "On DeepSeek-V2-Lite, ESFT-Gate averages 50.2 versus full fine-tuning 51.0, ESFT-Token 49.4, and LoRA 44.9. Per task, 2 to 15 experts out of 66 are selected per layer, giving 75% to 95% fewer trainable parameters, up to 90% less storage, and up to 30% less training time. Random expert replacement at the same count degrades results substantially. The coarse-expert ablation shows ESFT losing more than full fine-tuning as group size grows, and middle layers need the fewest experts.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The method requires a data pass to score experts, and the selection is frozen rather than adapted during training. Validation covers one backbone and a curated task suite. The paper is an EMNLP 2024 methods paper, so the scale is modest by the standards of the model reports around it; whether the same savings hold at 671B is not tested here.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Before you fine-tune an MoE model, profile where the task's tokens go. Training the experts the router already trusts, and freezing the rest, cuts cost and protects unrelated skills at the same time. If your experts are coarse, fix the granularity first - selective tuning has nothing to select with.",
      },
    ],
    questions: [
      {
        id: "esft-q1",
        prompt:
          "What observation motivates tuning only a subset of experts?",
        options: [
          "Experts are randomly initialized and need to specialize",
          "A task's routing is highly concentrated on a few experts, and different tasks activate significantly different experts",
          "The router is frozen during fine-tuning and cannot adapt",
          "Full fine-tuning always overfits the custom task",
        ],
        answer: 1,
        explanation:
          "The paper measures dispersion and finds that task data flows through a small, task-specific set of experts. That means the router has already identified the parameters the task needs, so updating the rest is wasted compute and risks degrading behavior the task never uses.",
      },
      {
        id: "esft-q2",
        prompt:
          "ESFT reports 75% to 95% fewer trainable parameters. Where does that range come from?",
        options: [
          "Different learning rates across tasks",
          "The number of selected experts varies by task: 2 to 15 out of 66 experts per layer, with specialized tasks such as math using fewer",
          "Some tasks tune the router and others do not",
          "The range reflects different batch sizes",
        ],
        answer: 1,
        explanation:
          "Relevance scoring selects a per-task, per-layer set. The paper reports 2 to 15 experts out of 66 per layer, and more specialized tasks need fewer experts, which is why the savings range is wide.",
      },
      {
        id: "esft-q3",
        prompt:
          "The random-expert control replaces the selected experts with arbitrary ones at the same count. What does the result show?",
        options: [
          "Any random subset of experts trains equally well",
          "The identity of the selected experts matters: relevance scoring, not just parameter count, drives the quality",
          "The router should be trained instead of the experts",
          "Expert selection only helps for math tasks",
        ],
        answer: 1,
        explanation:
          "If random selection matched relevance-based selection, the method would just be a parameter-count trick. The sharp drop with random experts shows that routing statistics identify the parameters the task actually uses.",
      },
      {
        id: "esft-q4",
        prompt:
          "The granularity ablation merges experts into coarser groups. What happens to ESFT?",
        options: [
          "It improves, because each selected unit is larger",
          "It degrades more than full fine-tuning while its cost rises, because a coarse expert cannot specialize without breaking its other functions",
          "It is unchanged, because the number of selected experts is held constant",
          "It becomes identical to LoRA",
        ],
        answer: 1,
        explanation:
          "Fine-grained experts are what make selection meaningful. Merging them means a task-relevant expert also serves unrelated data, so tuning it interferes with other functions. The ablation is the paper's strongest link back to the DeepSeekMoE design.",
      },
      {
        id: "esft-q5",
        prompt:
          "Which pair of benefits does ESFT claim over full fine-tuning?",
        options: [
          "Higher custom-task accuracy and lower memory use",
          "Comparable custom-task quality, better retention of general ability, and large storage and time savings",
          "Faster inference at serving time and a smaller vocabulary",
          "No need for task data and no need for gradients",
        ],
        answer: 1,
        explanation:
          "The paper reports roughly matching customization quality (50.2 versus 51.0 average), better general-task retention because unused experts are untouched, up to 90% less storage, and up to 30% less training time. It does not change inference cost or remove the need for task data.",
      },
    ],
    practice: {
      concepts: ["opt-methods", "ml-generalization"],
      articles: ["art-lora", "art-post-training"],
      problems: ["dl-310", "dl-311", "dl-312", "dl-313"],
    },
    project: {
      title: "Fine-tune only the experts the task routes to",
      pitch: "Simulate expert-specialized fine-tuning on a four-expert router and two linear tasks. The ESFT run updates only the experts a task's samples route to; the baseline updates every expert on every sample. Measure target-task error and how much the other task's experts drift, which is the retention half of the paper's claim.",
      difficulty: "intermediate",
      timeEstimate: "3-4 hours",
      milestones: [
        "Build four linear experts and a nearest-centroid router over a one-dimensional input space.",
        "Define task A on two clusters with a different target in each, and task B on the two clusters the router sends to other experts.",
        "Measure untrained mean absolute error on both test splits.",
        "Implement ESFT training: route each sample, update only that expert, repeat for a fixed number of epochs.",
        "Implement the all-experts baseline: update every expert on every sample.",
        "Compare target-task error (ESFT lower, because each expert sees one consistent target) and retention on task B (ESFT near the untrained level).",
        "Sweep the number of ESFT epochs and show target error converging while retention stays flat.",
      ],
      starterCode: `import random
random.seed(3)
# EXPECTED before TODOs: untrained MAE A 0.989, B 0.640, then "unimplemented".
# EXPECTED after TODOs: ESFT A 0.0084 B 0.6404; train-all A 0.0992 B 1.188.
CENTROIDS = [-0.75, -0.25, 0.25, 0.75]
TASK_A = [(-0.8, -0.6, lambda x: -2.0 * x), (0.2, 0.4, lambda x: 2.0 * x)]
TASK_B = [(-0.4, -0.2, lambda x: 3.0 * x + 1.0), (0.6, 0.8, lambda x: -3.0 * x + 1.0)]

def nearest(x):
    return min(range(len(CENTROIDS)), key=lambda i: abs(x - CENTROIDS[i]))

def make_task(rng, spec, n=160):
    return [(x, f(x)) for _ in range(n)
            for lo, hi, f in [rng.choice(spec)] for x in [rng.uniform(lo, hi)]]

def finetune(data, mode, lr=0.05, epochs=100):
    """TODO: experts are [w, b] pairs starting at [0.0, 0.0]. Run SGD on
    squared error. mode="esft" updates only the routed expert per sample;
    mode="all" updates every expert on every sample. Return the experts."""
    raise NotImplementedError("TODO: finetune")

def mae(experts, data):
    total = 0.0
    for x, y in data:
        w, b = experts[nearest(x)]
        total += abs(w * x + b - y)
    return total / len(data)

rng = random.Random(9)
train_a = make_task(rng, TASK_A)
test_a = make_task(random, TASK_A)
test_b = make_task(random, TASK_B)
print("untrained MAE: A", round(mae([[0.0, 0.0]] * len(CENTROIDS), test_a), 3),
      "B", round(mae([[0.0, 0.0]] * len(CENTROIDS), test_b), 3))
try:
    esft = finetune(train_a, "esft")
    full = finetune(train_a, "all")
    print("ESFT       MAE: A", round(mae(esft, test_a), 4), "B", round(mae(esft, test_b), 4))
    print("train-all  MAE: A", round(mae(full, test_a), 4), "B", round(mae(full, test_b), 4))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "ESFT target-task MAE is at least 3x lower than the all-experts baseline on held-out task A data.",
        "ESFT task B MAE stays within 2% of the untrained level; the baseline degrades it by at least 50%.",
        "The run prints routed expert counts per task, so the specialization claim is checkable.",
        "Everything runs in one standard-library script with a fixed seed in under 5 seconds.",
      ],
      stretch: [
        "Replace the nearest-centroid router with a learned linear gate and re-measure retention when the gate is frozen or tuned.",
        "Merge the four experts into two coarser experts and reproduce the paper's granularity ablation.",
        "Add a third task and test whether selecting experts on task A data damages task C when their clusters overlap.",
      ],
      relatedProblemIds: ["dl-310", "dl-311"],
    },
  },
  {
    id: "v3-hardware",
    slug: "v3-hardware",
    title:
      "Insights into DeepSeek-V3: Scaling Challenges and Reflections on Hardware for AI Architectures",
    short: "V3 Hardware Insights",
    year: 2025,
    date: "2025-05-14",
    arxivId: "2505.09343",
    url: "https://arxiv.org/abs/2505.09343",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "The V3 report told you what was built. This one tells you which hardware limits forced it: a 4:1 scale-up to scale-out bandwidth gap, 20 SMs lost to networking, and a two-layer fabric that had to carry storage too.",
    whatItIs:
      "This is the industry reflection paper that DeepSeek published after V3: a detailed account of the hardware bottlenecks hit while training on 2,048 H800 GPUs and the co-design decisions made in response. It quantifies the H800's reduced NVLink bandwidth, the 4:1 ratio between intra-node and inter-node communication, the streaming-multiprocessor (SM) cycles consumed by network handling, the node-limited routing rule that follows from the ratio, the multi-plane fat-tree that replaced a three-layer topology, and the case for future chips with precise low-precision units and converged scale-up and scale-out fabrics. It is the systems companion to the V3 technical report and was presented at ISCA 2025.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-v3",
      context:
        "The efficiency era's retrospective. Where Fire-Flyer described the cluster DeepSeek built, this paper describes what the V3 training run taught them about the hardware they had, and it closes the era by turning those lessons into concrete requests for the next generation of silicon.",
      improved: [
        "Quantifies the H800's scale-up penalty: NVLink bandwidth cut from 900 GB/s to 400 GB/s, about 200 GB/s per direction and roughly 160 GB/s achievable, against 40 GB/s of effective bandwidth per 400G InfiniBand NIC.",
        "Derives node-limited routing directly from that ratio: 256 routed experts in 8 groups of 32 on 8 nodes, with each token sent to at most 4 nodes so inter-node traffic depends on the node count rather than the expert count.",
        "Documents the hidden SM tax: up to 20 H800 SMs spent on network message handling and NVLink forwarding during training, and the RDMA all-to-all used at inference to give those SMs back to computation.",
        "Describes the Multi-Plane Fat-Tree: each GPU paired with its own NIC on its own plane, a separate 400G RoCE storage plane for 3FS, 64-port 400G switches, and a topology that could reach 16,384 GPUs in two layers.",
        "Turns the experience into hardware recommendations: precise low-precision compute, scale-up and scale-out convergence, low-latency communication fabrics, and direct CPU-GPU interconnects instead of PCIe.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What scaling actually hits",
        text: "The paper opens with the three walls every large training run meets: memory capacity, compute efficiency, and interconnect bandwidth. Model architectures answer the first two - MLA compresses the KV cache, MoE keeps compute per token low, FP8 raises arithmetic throughput per byte. The third is not the model's to fix, because it is a property of the machine. V3 was trained on 2,048 H800s, a GPU whose NVLink bandwidth was cut for export compliance, and the paper's argument is that several of V3's most distinctive choices are direct responses to that one fact.",
      },
      {
        kind: "prose",
        heading: "The 4:1 ratio and what follows from it",
        text: "Inside an H800 node, NVLink delivers about 200 GB/s per direction, of which roughly 160 GB/s is achievable. Between nodes, each 400G InfiniBand NIC delivers a nominal 50 GB/s and an effective 40 GB/s on realistic message sizes. That is a 4:1 gap, and it means the model should be shaped so that most communication stays inside the node. Node-limited routing is the answer: the 256 routed experts are split into 8 groups of 32, each group living on one node, and the router may send a token to at most 4 nodes. Inter-node traffic then depends on the number of nodes a token visits, not on the number of experts it uses - which is why the paper can say the same communication budget would support 13 experts instead of 8.",
      },
      {
        kind: "formula",
        label: "Why node count, not expert count, sets the bill",
        expression:
          "IB traffic per token = M * d_model * bytes_per_element\nwith M = number of nodes the token visits (M <= 4), independent of K = 8 experts",
        why: "Every expert a token visits on a remote node costs one all-to-all hop of the token's hidden vector. Grouping experts by node and capping M means the cost grows with the number of remote nodes, while adding more experts per node is nearly free from the network's point of view. This is the quantitative bridge between the architecture and the fabric.",
      },
      {
        kind: "prose",
        heading: "The SM tax nobody budgets for",
        text: "Communication is not free even when the network is fast: somebody has to move the bytes. The paper reports that during training, up to 20 of the H800's streaming multiprocessors are occupied with network message handling - filling queue pairs and work requests - and with forwarding data over NVLink, leaving fewer SMs for matrix math. At inference the same problem is worse, because latency matters more. V3's serving stack therefore runs expert-parallel all-to-all entirely through NIC RDMA, whose asynchronous model overlaps transfer with computation and returns the SMs to the model. This is a concrete example of a software decision made to work around a hardware deficiency, and the paper says so plainly.",
      },
      {
        kind: "prose",
        heading: "Multi-plane networking and the storage plane",
        text: "The cluster fabric is a two-layer multi-plane fat-tree. Each node has 8 GPUs and 8 InfiniBand NICs, and each GPU-NIC pair is assigned to its own network plane, so a node spreads its traffic across eight independent paths instead of contending for one. A separate 400G RoCE (RDMA over Converged Ethernet) NIC connects each node to a storage plane that carries 3FS traffic, keeping checkpoint and data loading off the compute fabric. With 64-port 400G switches, the topology can address up to 16,384 GPUs while keeping the cost and latency of two layers; the deployed cluster was just over two thousand GPUs. The paper is candid that the deployed fabric does not fully realize the design, because the ConnectX-7 NICs of the time expose separate ports rather than one bonded logical interface, so packets from one queue pair cannot be sprayed across planes.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "The bandwidth budget the architecture is co-designed around: about 160 GB/s achievable NVLink per direction against 40 GB/s effective per inter-node NIC, a 4:1 ratio that node-limited routing is built to respect.",
      },
      {
        kind: "prose",
        heading: "Precision and the request list",
        text: "The FP8 section repeats the V3 findings - fine-grained scaling, FP32 promotion every 128 products, low-precision communication - and then makes the hardware case: current units make you trade exponent range against mantissa precision, so training stacks compensate in software. The paper's recommendation is precise low-precision computation units that preserve accuracy for accumulation, alongside the other three asks: a unified scale-up and scale-out fabric with dedicated network co-processors, lower-latency interconnects that do not consume SM cycles, and direct CPU-GPU links such as NVLink or Infinity Fabric to remove the PCIe bottleneck during parameter, gradient, and KV cache transfers.",
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "The stack the paper describes: node-limited routing and FP8 training on the model side, RDMA all-to-all and a storage plane on the systems side, all shaped by the H800's 4:1 intra-node to inter-node bandwidth ratio.",
      },
      {
        kind: "prose",
        heading: "How to read it",
        text: "This is not a model report and contains no new benchmark results; it is an engineering reflection with numbers, published at ISCA 2025. Read it alongside the V3 technical report, because it explains the why behind choices the report states as configuration: why routing is node-limited, why the cluster is two-layer, why the serving stack insists on RDMA, and why the paper believes the next gains come from co-designing chips and models together rather than from either alone. The stated limits are the flip side: the recommendations are informed by one vendor's hardware generation and by regulatory constraints specific to that deployment, and several suggestions require silicon changes that no vendor had shipped at the time.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Training frontier models on export-restricted hardware exposes mismatches between what architectures want (cheap, fast, uniform communication; precise low-precision math) and what chips provide (a scale-up/scale-out bandwidth gap, SM cycles consumed by networking, coarse low-precision units). The paper documents those mismatches from the V3 run and proposes fixes.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The paper is organized by layer: model architecture (MLA, MoE, MTP), low-precision compute and communication, scale-up interconnect, scale-out network, then broader reflections. Read the bandwidth arithmetic in Sections 4 and 5 first; the architectural choices in Section 2 are the V3 report's material restated with hardware motivation.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Concrete numbers from the deployed system: H800 NVLink 400 GB/s total, about 200 GB/s per direction and 160 GB/s achievable; 8 x 400G IB NICs per node at 50 GB/s nominal and 40 GB/s effective each; a 4:1 ratio; up to 20 SMs consumed by communication; 256 experts in 8 node-groups with M <= 4; a 64-port 400G two-layer fabric sized for 16,384 GPUs; 2,048 GPUs actually deployed; a separate 400G storage plane for 3FS.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The reflection is tied to one hardware generation and one deployment's regulatory constraints. The multi-plane design is not fully realized in the deployed NICs, so some of its projected benefits are argued rather than measured. And the recommendations are proposals to vendors, not results: whether converged fabrics or precise low-precision units arrive is outside the authors' control.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Read your hardware's bandwidth ratio before you design your routing. If inter-node bandwidth is a quarter of intra-node, shape the model so communication stays inside nodes, and remember that moving bytes consumes compute cycles unless the network stack can do it asynchronously. When you write the postmortem of your own training run, quantify the workarounds: that list is what hardware teams need.",
      },
    ],
    questions: [
      {
        id: "v3hw-q1",
        prompt:
          "Why does V3 limit each token to at most 4 nodes rather than a fixed number of experts?",
        options: [
          "Because experts cannot be split across nodes",
          "Because inter-node traffic scales with the number of remote nodes a token visits, so capping nodes bounds communication independently of how many experts are activated",
          "Because the router can only score 4 experts at a time",
          "Because InfiniBand supports at most 4 hops",
        ],
        answer: 1,
        explanation:
          "With 256 experts grouped 32 per node, a token's cross-node cost depends on M, the number of nodes visited, not on K, the number of experts. Capping M bounds the all-to-all traffic, and the paper notes the same budget could support up to 13 experts.",
      },
      {
        id: "v3hw-q2",
        prompt:
          "What is the reported H800 bandwidth ratio the design responds to?",
        options: [
          "About 1:1 between NVLink and InfiniBand",
          "About 4:1: roughly 160 GB/s achievable NVLink per direction against about 40 GB/s effective per inter-node NIC",
          "About 10:1, because InfiniBand is capped at 10 GB/s",
          "It is not quantified in the paper",
        ],
        answer: 1,
        explanation:
          "The paper gives about 200 GB/s per direction on NVLink (roughly 160 GB/s achievable) and 50 GB/s nominal, 40 GB/s effective, per 400G NIC. The resulting 4:1 ratio is the reason routing, parallelism, and fabric topology are all shaped the way they are.",
      },
      {
        id: "v3hw-q3",
        prompt:
          "Why does the serving stack run expert-parallel all-to-all through NIC RDMA instead of GPU-initiated communication?",
        options: [
          "RDMA is the only transport InfiniBand supports",
          "GPU SMs used for message handling and NVLink forwarding are SMs not doing matrix math; RDMA moves the work off the SMs and overlaps transfer with computation",
          "RDMA encrypts the gradients",
          "It reduces the number of experts per token",
        ],
        answer: 1,
        explanation:
          "The paper reports that up to 20 SMs per GPU are consumed by communication during training. At inference, where latency is tighter, RDMA's asynchronous model avoids that contention and improves compute efficiency.",
      },
      {
        id: "v3hw-q4",
        prompt:
          "What does the multi-plane fat-tree change relative to a conventional three-layer fabric?",
        options: [
          "It removes the need for a storage network",
          "Each GPU-NIC pair sits on its own network plane, and a separate storage plane carries 3FS traffic, keeping a two-layer topology that can address up to 16,384 GPUs",
          "It doubles the number of switches to increase bisection bandwidth",
          "It replaces InfiniBand with Ethernet for compute traffic",
        ],
        answer: 1,
        explanation:
          "The design gives each of a node's 8 GPU-NIC pairs its own plane, adds a dedicated 400G RoCE storage plane, and uses 64-port 400G switches so two layers can address 16,384 GPUs. The deployed cluster was about two thousand GPUs, and the paper notes the deployed NICs could not fully realize the port-bonding ideal.",
      },
      {
        id: "v3hw-q5",
        prompt:
          "Which of these is one of the paper's forward-looking hardware recommendations?",
        options: [
          "Increase FP64 throughput for training",
          "Converge scale-up and scale-out communication into a unified framework with dedicated network co-processors",
          "Replace MoE routing with dense FFNs to avoid communication",
          "Move all training to a single node",
        ],
        answer: 1,
        explanation:
          "The asks are precise low-precision compute units, converged scale-up and scale-out fabrics with dedicated co-processors, low-latency communication that does not consume SMs, and direct CPU-GPU interconnects. Dense FFNs and single-node training are the opposite of what the paper argues for.",
      },
    ],
    practice: {
      articles: ["art-kv-cache", "art-quantization"],
      problems: ["dl-101", "dl-102", "dl-228", "dl-306"],
    },
    project: {
      title: "Roofline a toy GEMM to find the crossover",
      pitch: "Build the roofline model the hardware paper reasons with: for a GEMM shape (m, n, k), compute FLOPs and bytes moved, then check whether the shape is compute- or memory-bound against a machine's peak and bandwidth. Sweep k to find the exact crossover where arithmetic intensity passes the ridge point, the same arithmetic behind node-limited routing and batch-size choices.",
      difficulty: "starter",
      timeEstimate: "2-3 hours",
      milestones: [
        "Fix the machine constants: 60 TFLOP/s peak and 3 TB/s bandwidth, giving a ridge point of 20 FLOP/byte.",
        "Write the intensity function: 2*m*n*k FLOPs over twice the bytes of A, B, and C.",
        "Implement the GEMM cost model: seconds = max(flops / peak, bytes / bandwidth) plus a bound label.",
        "Print intensity and bound for small, square, and large-k shapes.",
        "Implement a bisection search for the smallest k that is compute-bound at a fixed (m, n).",
        "Verify the crossing analytically: solve flops/bytes = ridge for k and compare with the search.",
        "Re-run with a second machine profile (for example 100 TFLOP/s at 2 TB/s) and show the crossover moves.",
      ],
      starterCode: `import random
random.seed(0)
# EXPECTED before TODOs: machine ridge 20.0 FLOP/byte and four intensities.
# EXPECTED after TODOs: 64x64x16 memory, 64x64x64 compute (crossover k = 54).
PEAK, BW = 60e12, 3.0e12            # 60 TFLOP/s, 3 TB/s
RIDGE = PEAK / BW                     # 20 FLOP/byte

def intensity(m, n, k):
    return (2.0 * m * n * k) / (2 * (m * k + k * n + m * n))

def gemm_cost(m, n, k, bytes_per=2):
    """TODO: return (flops, bytes, seconds, bound) for a GEMM of shape
    (m, n, k). Move A (m*k), B (k*n), and C (m*n) once each in bytes_per
    bytes per number. seconds = max(flops / PEAK, bytes / BW); bound is
    "compute" if flops / bytes >= RIDGE else "memory"."""
    raise NotImplementedError("TODO: gemm_cost")

def find_crossover(m, n, lo=1, hi=4096):
    """TODO: return the smallest k where gemm_cost is compute-bound."""
    raise NotImplementedError("TODO: find_crossover")

print("machine: peak", PEAK, "FLOP/s, bandwidth", BW, "B/s, ridge", RIDGE, "FLOP/byte")
for shape in [(64, 64, 16), (64, 64, 64), (256, 256, 64), (512, 512, 4096)]:
    print("shape", shape, "intensity", round(intensity(*shape), 2))
try:
    for shape in [(64, 64, 16), (64, 64, 64), (64, 64, 4096)]:
        flops, bytes_moved, sec, bound = gemm_cost(*shape)
        print("shape", shape, bound, "time_us", round(sec * 1e6, 3))
    print("crossover k for 64x64:", find_crossover(64, 64))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "The model labels 64x64x16 memory-bound and 64x64x64 compute-bound, matching the intensity print.",
        "The bisection returns k = 54 for (64, 64), and the analytic solve returns the same value.",
        "Switching to a higher ridge point changes the crossover in the direction the formula predicts.",
        "The whole script is standard library, uses fixed constants, and runs in under a second.",
      ],
      stretch: [
        "Add a batch dimension and show how batching raises intensity until the shape hits the compute roof.",
        "Model FlashAttention-style tiling: keep a block of keys on chip and recompute bytes to see when attention becomes compute-bound.",
        "Add a latency term for the memory-bound case and find the batch size where latency is hidden by arithmetic.",
      ],
      relatedProblemIds: ["dl-228", "dl-412", "dl-306"],
    },
  },
  {
    id: "dualpath",
    slug: "dualpath",
    title:
      "DualPath: Breaking the Storage Bandwidth Bottleneck in Agentic LLM Inference",
    short: "DualPath",
    year: 2026,
    date: "2026-02-25",
    arxivId: "2602.21548",
    url: "https://arxiv.org/abs/2602.21548",
    kind: "paper",
    era: "efficiency",
    tier: "advanced",
    tagline:
      "In agentic serving the KV cache comes from disk, and the prefill nodes' storage NICs saturate while the decode nodes' NICs sit idle. Pool them: let decode engines read the cache and hand it over.",
    whatItIs:
      "DualPath is an inference-systems paper about the storage side of agentic workloads: multi-turn sessions with long contexts and heavy cache reuse, where the model repeatedly reloads a KV cache that no longer fits in HBM. In a prefill-decode disaggregated cluster, the conventional path is storage to prefill engine, which saturates the prefill nodes' storage NICs while decode nodes' NICs go unused. DualPath adds a second path - load the cache into a decode engine, then forward it to the prefill engine over RDMA (remote direct memory access) on the compute network - and a global scheduler that picks between the two paths per request. On production agentic traffic it reports up to 1.87x offline throughput and an average 1.96x online serving throughput without violating latency SLOs (service-level objectives).",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-v3",
      context:
        "The serving-side counterpart of the long-context line. V3.2 and V4 made million-token contexts possible and agent loops made them common; DualPath is about the infrastructure that has to move those caches around, and it belongs to the same systems tradition as Fire-Flyer and the V3 hardware reflections.",
      improved: [
        "Introduces dual-path KV cache loading: storage-to-prefill as before, plus storage-to-decode followed by an RDMA transfer to prefill over the compute network.",
        "Pools the storage bandwidth of all engines instead of only the prefill side, removing the asymmetry where prefill NICs saturate while decode NICs idle.",
        "Adds NIC-centric traffic management that isolates cache traffic from latency-critical model-execution communication, so the extra path does not interfere with collectives.",
        "Schedules requests across both paths with a global policy that balances computation and network load jointly across prefill and decode engines.",
        "Reports up to 1.87x offline and 1.96x average online throughput, with an ablation attributing the gains: layerwise prefill -17.21% JCT (joint completion time), dual-path loading -38.19%, scheduling -45.62% versus the baseline.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What changed when agents arrived",
        text: "Classic chat inference is one turn: read a prompt, generate an answer, forget the cache. Agentic inference is a loop: the model calls a tool, reads the result, thinks again, and each turn appends to a context that can reach hundreds of thousands of tokens. The cache from previous turns is valuable, because recomputing it wastes prefill compute, so serving systems spill it to external storage and reload it on the next turn. That makes storage I/O, not arithmetic, the resource that limits throughput. The paper's motivating observation is an imbalance in the standard disaggregated architecture: prompt processing (prefill) and token generation (decode) run on separate pools, and only the prefill pool is wired to load the cache from storage.",
      },
      {
        kind: "prose",
        heading: "The asymmetry, stated as a bandwidth budget",
        text: "Storage is reachable through NICs, and every engine has them. If only prefill engines ever read the cache, the effective storage bandwidth of the deployment is the prefill pool's NIC bandwidth, no matter how much capacity the decode pool has. When agent traffic is cache-heavy, prefill NICs become the bottleneck while decode NICs sit at low utilization, and the cluster's aggregate storage bandwidth is wasted. DualPath's fix is not faster storage or a bigger cache; it is routing: let decode engines read the cache too, then send it to the prefill engine that needs it over the compute network, which is typically under-used relative to the storage plane and has its own bandwidth.",
      },
      {
        kind: "formula",
        label: "Effective storage bandwidth under one path and two",
        expression:
          "single path:  B_eff = B_nic * N_prefill\nDualPath:     B_eff = B_nic * (N_prefill + N_decode), bounded by the compute network",
        why: "B_nic is the per-engine storage NIC bandwidth. Under the conventional path only prefill engines contribute, so adding decode capacity does not raise the ceiling. DualPath makes every engine a potential loader, and the compute network's RDMA capacity becomes the new limit. The scheduler's job is to decide when the extra hop is worth it, since a transfer that crosses the compute network consumes bandwidth that collectives also need.",
      },
      {
        kind: "code",
        title: "Choosing a loading path per request",
        language: "python",
        code: `def choose_path(request, prefill_load, decode_load, storage_nic_load):
    """Pick the path with the lowest estimated transfer time. load values are
    current bytes-in-flight per pool, capacity is bytes/s per pool."""
    prefill_capacity = 8 * 40e9   # 8 engines, 40 GB/s effective per NIC
    decode_capacity = 8 * 40e9
    direct = request.kv_bytes / max(1.0, prefill_capacity - prefill_load)
    via_decode = (
        request.kv_bytes / max(1.0, decode_capacity - decode_load)
        + request.kv_bytes / request.compute_rdma_bandwidth
    )
    if via_decode < direct and storage_nic_load < 0.9:
        return "storage-to-decode"
    return "storage-to-prefill"

# The scheduler recomputes this per request and rebalances as load moves.`,
        notes: [
          "The constants are illustrative; the paper's scheduler estimates the same quantities online and accounts for the extra RDMA hop.",
          "The compute-network transfer is the new cost, so the decision is only taken when the decode-side storage read is sufficiently cheaper.",
          "Layerwise prefill streams the cache in chunks so the transfer overlaps with the first layers of computation, which is why the ablation attributes a 17% reduction to it alone.",
        ],
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "The bottleneck and the fix: single-path loading caps effective storage bandwidth at the prefill pool's NICs, while DualPath pools prefill and decode NICs and pays one RDMA hop over the compute network.",
      },
      {
        kind: "prose",
        heading: "Interference is the hard part",
        text: "Adding a second path introduces traffic where none existed, and that traffic shares the compute network with tensor, pipeline, and expert-parallel collectives that are latency-critical. The paper's second contribution is NIC-centric traffic management: cache transfers are scheduled and shaped so they do not collide with model execution, and the scheduler avoids paths that would congest the fabric. This is the same lesson the Fire-Flyer and V3 hardware work arrived at from the training side: the network carries several kinds of traffic, and treating them as one undifferentiated stream is what turns a bandwidth advantage into a latency problem.",
      },
      {
        kind: "prose",
        heading: "What the evaluation shows",
        text: "The evaluation runs three models - a 660B DeepSeek model, a 27B DeepSeek model, and Qwen 32B - on production agentic traces with long contexts and high cache reuse, across prefill-to-decode engine ratios (1P1D means one prefill engine per decode engine; 2P1D, 1P2D scale those counts). DualPath reports up to 1.87x offline throughput and an average 1.96x online serving throughput without SLO violations, and an average 1.64x across all P/D configurations, peaking at 2.46x. The ablation separates the contributions: layerwise prefill accounts for 17.21% of the joint-completion-time reduction, dual-path loading for 38.19%, and the scheduling policy for 45.62%, all relative to the baseline stack. The small model shows the design's boundary: with limited storage bandwidth in a 1P1D layout, DualPath still trails an oracle that never waits on storage by 1.09x to 1.85x.",
      },
      {
        kind: "prose",
        heading: "Limits and how to read it",
        text: "The system is evaluated on the authors' in-house inference stack, not a public benchmark, so the multipliers depend on that baseline and its storage configuration. The benefits shrink when storage bandwidth is scarce or the P/D ratio is skewed. The paper assumes disaggregated prefill and decode, which not every deployment has. And it is a systems paper: it does not claim model quality gains, only throughput at fixed SLOs. Read it for the bandwidth-pooling argument and the interference-management design, both of which generalize beyond this stack.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Agentic, multi-turn workloads turn the KV cache into storage I/O. In disaggregated inference, the conventional storage-to-prefill path makes prefill NICs the bottleneck while decode NICs are idle, capping throughput at a fraction of the cluster's aggregate storage bandwidth.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two paths and one scheduler. Section 3 describes the dual-path data flow and why the decode-side read followed by RDMA does not inherently congest the fabric; Section 4 covers NIC-centric traffic isolation; Section 5 covers the scheduling policy. Read the ablation table, which separates the contributions of layerwise prefill, the second path, and scheduling.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Up to 1.87x offline throughput and 1.96x average online throughput on production agentic workloads, across three models (660B, 27B DeepSeek and Qwen 32B) and three P/D ratios, with an average 1.64x and a peak 2.46x across configurations. Joint-completion-time reductions from the ablation: 17.21% for layerwise prefill, 38.19% adding dual-path loading, 45.62% adding the scheduler. Online results are reported at fixed SLOs.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "Evaluation is on an in-house stack with production traces, so absolute multipliers depend on the baseline. Gains shrink in storage-constrained or unbalanced P/D layouts, and the design assumes disaggregated serving. Interference management is a mitigation, not a proof that cache traffic never competes with collectives.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When one resource saturates while an equivalent one idles, the cheapest fix is usually routing, not capacity. In agent serving, pool every engine's storage bandwidth and decide per request whether the extra network hop is worth it, while keeping cache traffic isolated from latency-critical collectives. And measure with the metric that matches the workload: joint completion time and SLO-qualified throughput, not raw tokens per second.",
      },
    ],
    questions: [
      {
        id: "dp-q1",
        prompt: "What imbalance does DualPath target?",
        options: [
          "GPUs idle during decoding while prefill is compute-bound",
          "Prefill engines' storage NICs saturate while decode engines' storage NICs stay idle in cache-heavy agent workloads",
          "HBM is too small to hold model weights",
          "The compute network is slower than the storage network",
        ],
        answer: 1,
        explanation:
          "The conventional path loads the KV cache from storage only into prefill engines. With long, reused caches that makes prefill-side storage NICs the bottleneck while the decode pool's NICs carry little traffic, so aggregate storage bandwidth is under-used.",
      },
      {
        id: "dp-q2",
        prompt: "What exactly is the second path DualPath adds?",
        options: [
          "A second storage network for checkpoints",
          "Loading the cache into a decode engine from storage, then transferring it to the prefill engine over RDMA on the compute network",
          "Prefilling on the decode engine and generating on the prefill engine",
          "Reading the cache directly from the GPU's HBM over NVLink",
        ],
        answer: 1,
        explanation:
          "The cache still comes from storage, but a decode engine can be the reader. It then forwards the data to the prefill engine over the compute network, which pools the storage bandwidth of both pools. The scheduler picks this path only when it is estimated to be faster.",
      },
      {
        id: "dp-q3",
        prompt: "Why is interference management essential to the design?",
        options: [
          "Because RDMA cannot carry cache data",
          "Because the extra path's traffic shares the compute network with latency-critical model-execution collectives, so unmanaged transfers would degrade model latency",
          "Because storage NICs cannot be shared between requests",
          "Because the scheduler needs to compress the cache",
        ],
        answer: 1,
        explanation:
          "DualPath adds traffic where none existed. NIC-centric traffic management isolates cache transfers from collectives and the scheduler avoids congesting paths, which is what lets the throughput gain arrive without violating latency SLOs.",
      },
      {
        id: "dp-q4",
        prompt:
          "The ablation adds techniques one at a time. Which ordering and attribution matches the paper?",
        options: [
          "Scheduling first, then layerwise prefill, then dual-path loading",
          "Layerwise prefill reduces JCT by 17.21%, adding dual-path loading brings it to 38.19%, and adding the scheduler reaches 45.62%",
          "Each technique contributes about 33%",
          "Dual-path loading contributes nothing without the scheduler",
        ],
        answer: 1,
        explanation:
          "The paper's gradual ablation reports 17.21% from layerwise prefill, 38.19% once dual-path loading is added, and 45.62% once scheduling decides the path per request. The scheduler has the single largest incremental effect.",
      },
      {
        id: "dp-q5",
        prompt:
          "Where does the reported improvement get weakest, and why?",
        options: [
          "On large models, because they have more layers",
          "On small models in storage-constrained 1P1D layouts, where limited storage bandwidth leaves DualPath 1.09x to 1.85x slower than an oracle that never waits on storage",
          "On online serving, because latency SLOs forbid cache reuse",
          "On 2P1D layouts, where the compute network is idle",
        ],
        answer: 1,
        explanation:
          "The paper reports the 27B model in a 1P1D configuration as the constrained case: with little storage bandwidth to pool, the second path cannot fully hide the load, so DualPath still trails the storage-free oracle. The gains are largest when storage bandwidth is plentiful and distributed.",
      },
    ],
    practice: {
      articles: ["art-kv-cache"],
      problems: ["dl-075", "dl-210", "dl-386", "ca-225"],
    },
    project: {
      title: "Pool KV cache reads with an LRU/LFU simulator",
      pitch: "Simulate the storage side of agentic serving: multi-turn sessions re-read a growing KV context that no longer fits in cache, and every miss is either a cheap storage reload or an expensive recompute. Implement LRU and LFU eviction, compare hit rates and recompute bytes saved, and see why the paper's reuse pattern favors recency over frequency.",
      difficulty: "intermediate",
      timeEstimate: "3-4 hours",
      milestones: [
        "Generate a multi-turn trace: sessions whose context grows every turn, with occasional tool truncation, across more unique blocks than the cache can hold.",
        "Implement the cache simulator: hits update recency; misses pay storage cost if the block was seen before and recompute cost otherwise.",
        "Implement least-recently-used eviction and report hit rate, total cost, and recompute bytes saved.",
        "Implement least-frequently-used eviction on the same trace and cost model.",
        "Add an unbounded-cache replay to get the reuse upper bound and compare LRU's headroom against it.",
        "Sweep cache capacity and report the capacity where LRU captures 80% of the upper-bound hits.",
        "Explain the LFU collapse: which blocks it holds and why they are never reused.",
      ],
      starterCode: `import random
random.seed(13)
# EXPECTED before TODOs: 480 turns, 43008 accesses, 7680 unique blocks, upper
# bound 0.821, then "unimplemented". EXPECTED after: lru hit 0.445, lfu 0.011.
BLOCK_KB, CAPACITY, RECOMPUTE_COST, STORAGE_COST = 1024, 96, 10, 1
def make_trace(rng, sessions=40, turns=12, per_turn=16):
    trace = []
    for s in range(sessions):
        context = []
        for t in range(turns):
            context = context[-64:] if rng.random() < 0.15 else context
            context.extend((s, k) for k in range(t * per_turn, (t + 1) * per_turn))
            trace.append((s, list(context)))
    return trace
def choose_victim(entries, policy):
    """TODO: entries are (block, freq, last_step). lru -> smallest last_step;
    lfu -> smallest freq, ties broken by smallest last_step."""
    raise NotImplementedError("TODO: choose_victim")
def simulate(trace, policy):
    cache, seen, cost, hits = {}, set(), 0, 0
    for step, (_s, blocks) in enumerate(trace):
        for block in blocks:
            if block in cache:
                hits += 1
                freq, _ = cache[block]
                cache[block] = (freq + 1, step)
            else:
                cost += STORAGE_COST if block in seen else RECOMPUTE_COST; seen.add(block)
                cache[block] = (1, step)
            if len(cache) > CAPACITY:
                entries = [(b, f, last) for b, (f, last) in cache.items()]
                del cache[choose_victim(entries, policy)]
    return hits, cost
trace = make_trace(random)
accesses = sum(len(blocks) for _, blocks in trace)
unique = len({b for _, blocks in trace for b in blocks})
print("turns", len(trace), "accesses", accesses, "unique", unique, "capacity", CAPACITY,
      "unbounded-reuse upper bound", round(1 - unique / accesses, 3))
try:
    for policy in ("lru", "lfu"):
        hits, cost = simulate(trace, policy)
        print(policy, "hit rate", round(hits / accesses, 3), "cost units", cost,
              "recompute MB saved", round(hits * BLOCK_KB / 1024, 1))
except NotImplementedError as exc:
    print("unimplemented:", exc)`,
      successCriteria: [
        "LRU hit rate lands between 0.40 and 0.50 and LFU below 0.05 on the fixed trace, with both printed.",
        "The script reports recompute MB saved and storage cost units, so the policies are compared on bytes, not only hits.",
        "The capacity sweep shows a monotone hit-rate curve for LRU and identifies the 80% point.",
        "One standard-library run with a fixed seed finishes in under 10 seconds.",
      ],
      stretch: [
        "Age LFU counts (halve them every N steps) and see whether it recovers from cache pollution.",
        "Add a size-2 admission filter and test whether scan resistance helps on the same trace.",
        "Simulate dual-path loading: charge an extra compute-network cost for decode-side loads and pick the cheaper path per miss.",
      ],
      relatedProblemIds: ["dl-075", "dl-386"],
    },
  },
];
