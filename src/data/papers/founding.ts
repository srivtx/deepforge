import type { Paper } from "./types";

/**
 * Founding era: the five papers from January to March 2024 that opened the
 * DeepSeek line. Read in order: DeepSeek LLM sets the trunk and the training
 * recipe, DeepSeekMoE changes how the feed-forward blocks scale, DeepSeek-Coder
 * specializes the trunk on code, DeepSeekMath adds the GRPO algorithm, and
 * DeepSeek-VL extends the trunk to vision.
 */
export const FOUNDING_PAPERS: Paper[] = [
  {
    id: "deepseek-llm",
    slug: "deepseek-llm",
    title: "DeepSeek LLM: Scaling Open-Source Language Models with Longtermism",
    short: "DeepSeek LLM",
    year: 2024,
    date: "2024-01-05",
    arxivId: "2401.02954",
    url: "https://arxiv.org/abs/2401.02954",
    kind: "paper",
    era: "founding",
    tier: "core",
    tagline:
      "The 7B and 67B base models that opened the DeepSeek line, configured by scaling laws the authors re-measured from scratch.",
    whatItIs:
      "DeepSeek's first public language model family: two dense decoder-only Transformers, 7B and 67B parameters, trained from scratch on a 2 trillion token corpus of mostly English and Chinese text. The paper's real subject is budgeting: it re-measures scaling laws for batch size, learning rate, and the model/data split, then spends its compute budget according to those curves. Supervised fine-tuning and DPO turn the base models into chat models that beat LLaMA-2 70B on many benchmarks and GPT-3.5 on open-ended comparisons.",
    theoryMinutes: 15,
    lineage: {
      to: ["deepseek-moe", "deepseek-coder", "deepseek-vl"],
      context:
        "This is the root of the whole curriculum. Every later DeepSeek model inherits its trunk, its tokenizer, and its multi-step learning rate schedule.",
      improved: [
        "A calibrated scaling law for hyperparameters: fitted power laws predict the near-optimal batch size and learning rate for a given compute budget.",
        "A new model-scale unit, non-embedding FLOPs per token M, which includes attention cost and excludes the vocabulary projection, making the model/data split fit more accurate at small scale.",
        "A dataset and pipeline that reached 2 trillion tokens, with cross-dump deduplication removing 89.8% of documents versus 22.2% for single-dump dedup.",
        "A multi-step learning rate schedule that matches cosine's final loss while letting early training be reused when a run is extended.",
        "A full alignment recipe (about 1.5M SFT instances, then DPO) that produced a 67B chat model rated above GPT-3.5 in open-ended evaluations.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why another language model",
        text: "By early 2024 the open-source world had settled on LLaMA-2 as the de facto baseline, and most teams trained fixed-size models without asking how compute should be divided between model and data. Two famous scaling-law papers, Kaplan et al. and Chinchilla, disagreed on that split, and neither described how they chose the batch size and learning rate for each run. DeepSeek LLM starts by treating those disagreements as the problem: before training anything large, work out how to allocate compute, then follow the answer. Keep that framing in mind, because the benchmark tables are the smaller half of the paper.",
      },
      {
        kind: "prose",
        heading: "What a scaling law actually claims",
        text: "A scaling law is a fitted curve: train many small models at known compute budgets, measure validation loss, and extrapolate. The DeepSeek team uses IsoFLOP profiles, the Chinchilla method, which fixes a compute budget and tries several model/data splits to find the loss minimum. The output is not a law of nature but a budget planner. If the curve is right, a run costing 1e20 FLOPs can tell you how to spend 1e23, which is exactly what a lab with limited GPUs needs.",
      },
      {
        kind: "formula",
        label: "Compute as model times data",
        expression: "C = M * D",
        why: "C is the training compute budget in FLOPs, M is model scale measured as non-embedding FLOPs per token, and D is the number of training tokens. Older work wrote C = 6ND; the authors argue 6N ignores attention cost and, in its full-parameter form, includes the vocabulary projection that contributes little capacity. At small scale those approximations are off by up to 50%, which distorts the fitted curve.",
      },
      {
        kind: "formula",
        label: "The fitted split",
        expression: "M_opt = 0.1715 * C^0.5243    D_opt = 5.8316 * C^0.4757",
        why: "M_opt is the model scale and D_opt the token budget that minimize loss for compute C. The exponents are close to one half, so extra compute is split almost evenly between a bigger model and more data. They sum to 1.0, which keeps M_opt * D_opt = C consistent. The coefficients are empirical, not constants of nature: refit them on your own data.",
      },
      {
        kind: "prose",
        heading: "Data quality moves the split",
        text: "The finding that outlasted the paper: the optimal split depends on the dataset. On their early in-house data the exponents were a = 0.450, b = 0.550; after cleaning, a = 0.524, b = 0.476; on the carefully curated OpenWebText2, a = 0.578, b = 0.422. Chinchilla's MassiveText gave roughly 0.49 and 0.51. As data gets better, more of each new FLOP should go to the model, which is a clean explanation for why previous studies disagreed: they were measuring different corpora.",
      },
      {
        kind: "visual",
        visual: "scaling-curve",
        caption:
          "Validation loss against compute follows a straight line on a log-log plot. The fitted curve predicted the 7B and 67B runs, a thousand times more compute, before they were trained.",
      },
      {
        kind: "code",
        title: "The multi-step learning rate",
        language: "python",
        code: `def lr_at(step, total_steps, peak):
    # 2000 warmup steps, then drops at 80% and 90% of training.
    if step < 2000:
        return peak * step / 2000
    progress = step / total_steps
    if progress < 0.8:
        return peak
    if progress < 0.9:
        return peak * 0.316
    return peak * 0.1


for s in (0, 1000, 2000, 7000, 8500, 9500):
    print(s, round(lr_at(s, 10000, 4.2e-4), 8))`,
        notes: [
          "The 7B model peaked at 4.2e-4 and the 67B model at 3.2e-4, both chosen from the scaling law for hyperparameters rather than from a grid search at full size.",
          "The 0.316 factor is the square root of 0.1: each drop cuts the learning rate to about a third, then to a tenth of the peak.",
          "The authors report this schedule reaches essentially the same final loss as cosine decay, with one practical advantage: the first stage can be reused when training is later extended.",
        ],
      },
      {
        kind: "prose",
        heading: "The recipe around the math",
        text: "The micro design follows LLaMA: pre-norm with RMSNorm, SwiGLU feed-forward layers, rotary position embeddings, and a 100K-token byte-level BPE tokenizer padded to 102400 entries. The macro design differs: 30 layers for 7B, 95 for 67B, depth instead of extra width, and grouped-query attention with 8 key-value heads only in the 67B model. Training ran in bf16 with fp32 gradient accumulation, FlashAttention, ZeRO-1, and pipeline parallelism. Alignment used about 1.5 million instruction instances (1.2M helpful, 300K safety) for SFT, then DPO. The 7B model was fine-tuned for 4 epochs and the 67B for 2, because the larger model overfit quickly. One side effect worth knowing: adding math SFT data increased the rate at which chat responses looped, and DPO reduced it.",
      },
      {
        kind: "prose",
        heading: "What to watch for while reading",
        text: "Read Section 3 for the scaling laws and treat Section 5 as receipt-checking. Notice how many choices depend on the fitted curves, and how much rests on a single validation set of 100M tokens distributed like the training data. The limitation section is short and honest: a chat model that cannot update knowledge after pretraining, hallucinates, covers Chinese unevenly, and is shaky in languages beyond English and Chinese.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "The problem it attacks",
        text: "Open-source models were being trained at fixed sizes with no shared method for choosing hyperparameters or allocating compute, and published scaling laws disagreed with each other. DeepSeek wants to show that a smaller lab can train 7B and 67B models from scratch if it first works out how to spend the budget.",
      },
      {
        kind: "prose",
        heading: "The key idea",
        text: "Measure everything small, fit curves, and let the curves configure the big runs. Concretely: refit the batch-size and learning-rate laws against compute, replace 6N with non-embedding FLOPs per token, and refit the model/data split on the actual corpus, because data quality changes the optimal exponents.",
      },
      {
        kind: "prose",
        heading: "What the evidence showed",
        text: "The pre-training corpus reached 2 trillion tokens. Validation loss for the 7B and 67B runs landed where the curve predicted, extrapolated over roughly a 1000x compute range. DeepSeek LLM 67B surpassed LLaMA-2 70B on a range of benchmarks, with the largest gaps in code, mathematics, and reasoning, and the 67B chat model outperformed GPT-3.5 in open-ended evaluations in both Chinese and English. Cross-dump deduplication removed 89.8% of documents across 91 dumps, against 22.2% for a single dump.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The chat model shares the familiar failure modes: no knowledge updates after pretraining, non-factual advice, and hallucination. The Chinese data is not exhaustive, so some Chinese-specific topics are weak, and because the corpus is basically Chinese and English, other languages should be treated with caution. The scaling analysis also ignores factors beyond the compute budget, and the optimal hyperparameters shift slightly between models with the same budget but different data allocations.",
      },
      {
        kind: "prose",
        heading: "For the practitioner",
        text: "Two transferable lessons. First, a schedule that is reusable matters: if you may extend a run, the multi-step schedule costs nothing in final loss and saves the whole early phase. Second, never borrow a scaling law; the exponents depend on your corpus, and the correct response to better data is to spend marginal compute on parameters, not more tokens.",
      },
    ],
    questions: [
      {
        id: "q-llm-scale-unit",
        prompt:
          "The paper represents model scale as M (non-embedding FLOPs per token) instead of the usual 6N. What does that change?",
        options: [
          "It counts only the MLP parameters, ignoring attention entirely",
          "It includes attention cost at the current sequence length and excludes the vocabulary projection, both of which bias 6N",
          "It makes validation loss a linear function of compute",
          "It removes the need to tune the learning rate",
        ],
        answer: 1,
        explanation:
          "6N1 omits attention cost; 6N2 also counts the vocabulary projection, which adds parameters but little capacity. The paper's Table 3 shows these miss the true compute by up to 50% at small scale, which corrupts the IsoFLOP fit. M fixes both ends.",
      },
      {
        id: "q-llm-split-math",
        prompt:
          "The fitted exponents are a = 0.5243 and b = 0.4757. If the compute budget grows by 100x, what roughly happens to the optimal model scale and token count?",
        options: [
          "Model 100x, data 1x",
          "Model 10x, data 10x",
          "Model 52x, data 48x",
          "Model 11x, data 9x",
        ],
        answer: 3,
        explanation:
          "100^0.5243 is about 11.2 and 100^0.4757 is about 8.9. The exponents sum to 1, so the two factors multiply back to 100. Read this as: add compute to the model and the data in roughly equal proportion, then verify on your own corpus.",
      },
      {
        id: "q-llm-hyper-trend",
        prompt:
          "The hyperparameter law says eta_opt = 0.3118 * C^-0.1250 and B_opt = 0.2920 * C^0.3271. As the compute budget grows, what should you do?",
        options: [
          "Raise both the batch size and the learning rate",
          "Lower both the batch size and the learning rate",
          "Raise the batch size and lower the learning rate",
          "Keep the batch size fixed and lower the learning rate",
        ],
        answer: 2,
        explanation:
          "The positive exponent on B means batches grow with compute; the negative exponent on eta means the peak learning rate shrinks. The paper validated the formulas at 1e20 FLOPs and then used them for the 7B and 67B runs.",
      },
      {
        id: "q-llm-step-lr",
        prompt:
          "Why did the team switch from cosine decay to a multi-step learning rate schedule?",
        options: [
          "It reaches a visibly lower loss at the same compute",
          "It matches cosine's final performance while letting the early training phase be reused if the run is extended",
          "It removes the warmup phase",
          "It allows a constant batch size across all model sizes",
        ],
        answer: 1,
        explanation:
          "Their Figure 1 compares the two schedules at 1.6B parameters and 100B tokens and finds essentially the same loss. The multi-step version wins on logistics: when you continue training a model at a larger scale, the first stage carries over instead of being retrained.",
      },
      {
        id: "q-llm-dedup",
        prompt:
          "Deduplicating one Common Crawl dump removed 22.2% of documents; deduplicating across 91 dumps removed 89.8%. What is the practical consequence for a pretraining pipeline?",
        options: [
          "Single dumps are cleaner, so dedup scope barely matters",
          "Duplicates concentrate within a month, so deduplicating a few recent dumps is enough",
          "Duplicates live across dumps, so dedup has to span the whole corpus to be effective",
          "Deduplication should be skipped once the dataset is large",
        ],
        answer: 2,
        explanation:
          "Four times more documents were removed at 91-dump scope than at single-dump scope. Scoped too narrowly, dedup leaves large repeated fractions of the corpus, which the paper treats as an information-density problem: repeated text spends tokens without adding knowledge.",
      },
      {
        id: "q-llm-data-quality",
        prompt:
          "When the training data gets better, how does the optimal model/data allocation shift?",
        options: [
          "Toward more tokens for the same model size",
          "Toward a larger model for the same token budget",
          "It does not shift; scaling laws are dataset independent",
          "Toward a larger batch size, leaving model and data unchanged",
        ],
        answer: 1,
        explanation:
          "The model exponent a rises and the data exponent b falls as quality improves (0.450/0.550 early, 0.524/0.476 cleaned, 0.578/0.422 on OpenWebText2). The intuition: clean data is easier to fit, so extra compute buys more in parameters than in more tokens.",
      },
    ],
    practice: {
      research: ["mini-language-model"],
      concepts: ["info-entropy", "ml-probabilistic", "opt-methods"],
      articles: ["art-softmax-temperature", "art-bpe", "art-kv-cache"],
      problems: ["dl-003", "dl-017", "nlp-026"],
    },
  },
  {
    id: "deepseek-moe",
    slug: "deepseek-moe",
    title:
      "DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models",
    short: "DeepSeekMoE",
    year: 2024,
    date: "2024-01-11",
    arxivId: "2401.06066",
    url: "https://arxiv.org/abs/2401.06066",
    kind: "paper",
    era: "founding",
    tier: "core",
    tagline:
      "Split every expert into smaller pieces and pin a few experts as always-on, so parameters grow without compute growth and each expert stays specialized.",
    whatItIs:
      "An architecture paper about mixture-of-experts language models. Instead of routing a token to one or two large feed-forward experts, DeepSeekMoE chops each expert into m finer experts and routes to mK of them, giving the router a much richer menu. A small set of shared experts is always active to absorb knowledge every token needs. Validation runs at 2B, 16B, and a preliminary 145B scale show the design matching dense models of comparable quality with a fraction of the compute.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-llm",
      to: ["deepseek-v2"],
      context:
        "Second paper of the founding era. DeepSeek LLM showed how to train a good dense trunk; this paper asks how to grow that trunk's capacity without growing its bill, an idea the efficiency era then scales into DeepSeek-V2.",
      improved: [
        "Fine-grained expert segmentation: each expert shrinks by a factor m and mK experts activate, keeping expert parameters and per-token compute constant while multiplying the combinations the router can form.",
        "Shared expert isolation: Ks experts run for every token and the top-k routed count drops by Ks, so common knowledge lives in one place instead of being duplicated across experts.",
        "Two balance losses, expert-level and device-level, that keep the router from collapsing onto a few experts and keep computation even across devices.",
        "Empirical validation at three scales: 2B matching GShard 2.9B with 1.5x expert parameters and compute, 16B matching LLaMA2 7B at about 40% of the compute, and 145B matching DeepSeek 67B at 28.5% (possibly 18.2%) of the compute.",
        "A deployable checkpoint: DeepSeekMoE 16B fits on a single 40GB GPU without quantization.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Where experts come from",
        text: "A Transformer block does attention, then a feed-forward network. Most of the parameters and most of the compute per token sit in that feed-forward network. Mixture-of-experts replaces it with N expert networks plus a tiny router: every expert holds a full copy of the layer's weights, but each token only runs through the K experts the router selects. Total parameters scale with N while per-token compute scales with K, which is the entire economic argument for MoE. The catch is training the router: if it keeps picking the same experts, the others never learn.",
      },
      {
        kind: "formula",
        label: "Routing in a classic MoE layer",
        expression:
          "s_i = softmax_i(u^T * e_i)    g_i = s_i if s_i in TopK(s_1..s_N, K) else 0    h = sum_i g_i * FFN_i(u) + u",
        why: "u is the token's hidden vector after attention, e_i is a learned centroid for expert i, and s_i is the affinity between the token and that expert. The softmax turns the affinities into a distribution; TopK keeps only the K largest and zeroes the rest, so g is sparse and only K experts run. h is the layer output plus the residual u.",
      },
      {
        kind: "visual",
        visual: "moe-routing",
        caption:
          "One token, one layer: the router scores every expert, keeps the top K, and blends their outputs. Everything about MoE design is about making those choices useful.",
      },
      {
        kind: "prose",
        heading: "The two failure modes the paper names",
        text: "Knowledge hybridity: with only 8 or 16 big experts, each expert receives tokens from wildly different topics and is forced to jam unrelated knowledge into one set of weights. Knowledge redundancy: tokens routed to different experts often need the same common facts, so several experts all learn them. Both problems reduce specialization, and specialization is the only reason sparse models should beat dense ones at equal active compute.",
      },
      {
        kind: "visual",
        visual: "fine-grained-experts",
        caption:
          "Keep the expert budget fixed and slice each feed-forward width into quarters. Now a token can pick 8 small experts instead of 2 big ones, and the space of combinations explodes.",
      },
      {
        kind: "code",
        title: "Top-k routing, from affinities to gates",
        language: "python",
        code: `import math


def route_token(u, centroids, k):
    # Affinity of this token to every expert centroid.
    logits = [sum(a * b for a, b in zip(u, e)) for e in centroids]
    weights = [math.exp(s - max(logits)) for s in logits]
    total = sum(weights)
    # Softmax over all experts first, then keep only the top-k gates.
    picked = sorted(range(len(logits)), key=lambda i: -logits[i])[:k]
    return {i: weights[i] / total for i in picked}


def moe_layer(u, centroids, experts, k):
    gates = route_token(u, centroids, k)
    out = [0.0] * len(u)
    for i, g in gates.items():
        out = [o + g * v for o, v in zip(out, experts[i](u))]
    return out`,
        notes: [
          "The softmax is taken over all experts before the top-k cut, exactly as in the paper's equations; the kept gates therefore do not sum to one, which is intended.",
          "A production implementation groups tokens per expert and fuses the weight matrices, but the logic is the same: score, select, scale, sum.",
          "With fine-grained segmentation you would pass mN centroids and activate mK, changing only two integers in this code.",
        ],
      },
      {
        kind: "formula",
        label: "Expert-level balance loss",
        expression: "L_ExpBal = alpha_1 * sum_i f_i * P_i",
        why: "For routed expert i, f_i is the fraction of tokens that selected it and P_i is its average affinity across the batch. Multiplying them means the loss grows only when an expert is both popular and confident, which is the onset of routing collapse. The factor alpha_1 stays small (0.01 in the 2B runs, 0.001 at 16B) so the loss nudges the router without distorting the language objective.",
      },
      {
        kind: "prose",
        heading: "What the 16B configuration looks like",
        text: "Twenty-eight layers, hidden width 2048, sixteen attention heads, and MoE layers everywhere except the first, because that layer's load balance converges slowly. Each layer holds 2 shared experts and 64 routed experts, each expert one quarter the width of a standard feed-forward network. A token goes to both shared experts and to 6 of the 64 routed ones, so 8 expert passes in total. That is 16.4B total parameters but only about 2.8B activated, and the checkpoint fits on one 40GB GPU. At 145B the recipe widens: 4 shared and 128 routed experts, 12 routed active, 144.6B total and 22.2B active.",
      },
      {
        kind: "prose",
        heading: "Reading the evidence carefully",
        text: "Three scales, three different kinds of claim. The 2B validation is a controlled comparison: five architectures, the same 100B tokens, the same training settings, with DeepSeekMoE 2B matching GShard 2.9B that has 1.5 times the expert parameters and compute. The 16B model is a real 2T-token run matching LLaMA2 7B and DeepSeek 7B at about 40% of the compute. The 145B number is explicitly preliminary: 245B training tokens, a constant learning rate, and performance comparable to their own DeepSeek 67B at 28.5% (maybe 18.2%) of the compute. Watch the qualifiers; they are the authors' own.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "The problem it attacks",
        text: "Sparse MoE models should beat dense models at equal active compute, but standard top-K routing produces experts that each contain a jumble of topics and duplicate each other's common knowledge. More parameters then buy less than they should.",
      },
      {
        kind: "prose",
        heading: "The idea in two moves",
        text: "First, spend the same expert-parameter budget on many smaller experts and activate more of them per token, so knowledge can be decomposed more finely and combined more precisely. Second, reserve a few always-on shared experts for common knowledge, subtracting them from the routed budget so activated compute stays fixed.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "At 2B, the model matches GShard 2.9B despite 1.5x less expert parameter and compute, and nearly reaches the dense model with the same total parameters, which is the experimental upper bound for any MoE. DeepSeekMoE 16B was trained on 2T tokens and lands near LLaMA2 7B at roughly 40% of the compute, beating models with similar activated parameters on the Open LLM Leaderboard. Ablations confirm both moves separately, and the analysis finds lower redundancy between routed experts and shared experts that cannot be replaced by routed ones.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "The 145B results are preliminary: fewer than a tenth of the tokens used for the smaller models, a constant learning rate schedule, and no alignment work. Even at 16B the authors keep expert granularity at 1/4 and the first layer dense, both practical compromises; they note that finer cuts hurt computational efficiency and that the first layer's balance converges slowly. Load balance remains a tuned hyperparameter, not a solved problem.",
      },
      {
        kind: "prose",
        heading: "For the practitioner",
        text: "Think in ratios, not counts. The useful quantities are expert width relative to a dense feed-forward block, routed experts per token, shared experts per layer, and the balance factors. If you build your own MoE, start from a dense model of the same activated size, then move capacity into experts while watching two curves: validation loss and per-expert token counts. If the token counts collapse onto a few experts, the dense baseline will win.",
      },
    ],
    questions: [
      {
        id: "q-moe-fine-grained",
        prompt:
          "Fine-grained expert segmentation keeps expert parameters and per-token compute constant. How?",
        options: [
          "It trains more experts on the same data and activates all of them",
          "It splits each expert's hidden width by m and activates mK of the smaller experts",
          "It halves the number of layers and doubles the width",
          "It removes the router and uses a hash function instead",
        ],
        answer: 1,
        explanation:
          "The feed-forward intermediate dimension shrinks to 1/m, so each expert holds a fraction of the original parameters; activating mK of them restores the original FLOPs. The gain is combinatorial: 2-of-16 gives 120 choices, 8-of-64 gives 4,426,165,368.",
      },
      {
        id: "q-moe-16b-routing",
        prompt:
          "In the DeepSeekMoE 16B configuration, how many experts actually process one token?",
        options: ["6", "8", "64", "68"],
        answer: 1,
        explanation:
          "Two shared experts run for every token, plus the top 6 of 64 routed experts: 8 expert passes. The total parameter count is 16.4B, but only about 2.8B parameters are activated per token, which is why it fits on one 40GB GPU.",
      },
      {
        id: "q-moe-shared-subtract",
        prompt:
          "When Ks shared experts are added, the number of nonzero routed gates becomes mK - Ks rather than mK. Why subtract?",
        options: [
          "Shared experts are less accurate, so fewer routed experts are needed",
          "To keep the per-token compute budget constant while adding always-on experts",
          "Because the shared experts replace the router entirely",
          "To make the top-k operation cheaper to compute",
        ],
        answer: 1,
        explanation:
          "Every token now runs through Ks extra networks unconditionally, so the routed budget is reduced by the same amount. The activated parameter count stays fixed; what changes is where the capacity sits: shared experts for common knowledge, routed experts for the specialized remainder.",
      },
      {
        id: "q-moe-balance-loss",
        prompt:
          "In L_ExpBal = alpha_1 * sum_i f_i * P_i, f_i is the fraction of tokens routed to expert i and P_i is its mean affinity. Why multiply the two?",
        options: [
          "Because the loss should be zero when all experts are equally likely",
          "Because it penalizes an expert only when it is both heavily used and confidently scored, which is the onset of routing collapse",
          "Because multiplication is cheaper than addition on GPUs",
          "Because f_i and P_i are both probabilities that must sum to one",
        ],
        answer: 1,
        explanation:
          "The product is a load-times-confidence signal. If an expert is popular but unsure, or confident but rarely chosen, the term stays small; it grows when one expert starts cornering the tokens, and the gradient pushes assignments back toward other experts.",
      },
      {
        id: "q-moe-combinatorics",
        prompt:
          "The paper compares 120 possible 2-of-16 expert choices with 4,426,165,368 possible 8-of-64 choices. What is that number supposed to show?",
        options: [
          "That fine-grained routing needs more memory for centroids",
          "That finer experts give the router a vastly richer combination space, which supports more precise knowledge decomposition",
          "That top-8 routing is 36 million times slower",
          "That 64 experts are mathematically necessary for specialization",
        ],
        answer: 1,
        explanation:
          "The claim is about expressiveness, not cost. Per-token compute is held constant, but the number of ways to combine experts grows by seven orders of magnitude, so different token types can get different, more targeted expert mixtures.",
      },
    ],
    practice: {
      concepts: ["opt-methods"],
      problems: ["dl-310", "dl-311", "dl-312", "dl-313", "dl-314"],
    },
  },
  {
    id: "deepseek-coder",
    slug: "deepseek-coder",
    title:
      "DeepSeek-Coder: When the Large Language Model Meets Programming - The Rise of Code Intelligence",
    short: "DeepSeek-Coder",
    year: 2024,
    date: "2024-01-25",
    arxivId: "2401.14196",
    url: "https://arxiv.org/abs/2401.14196",
    kind: "paper",
    era: "founding",
    tier: "advanced",
    tagline:
      "A code model family trained from scratch on 2 trillion tokens, with repository structure and fill-in-the-middle objectives built into pretraining.",
    whatItIs:
      "DeepSeek's code models, from 1.3B to 33B parameters, trained from scratch on 2 trillion tokens that are 87% source code across 87 programming languages. Two design choices separate it from earlier code models: the corpus is assembled at repository level, ordering files so dependencies come before their dependents, and half the training documents are rearranged with fill-in-the-middle sentinels so the model learns to write code from the signature above it and the code below it. It reached state of the art among open code models and beat Codex and GPT-3.5 on prominent benchmarks.",
    theoryMinutes: 12,
    lineage: {
      from: "deepseek-llm",
      to: ["deepseek-math"],
      context:
        "Third paper of the founding era. It takes the DeepSeek LLM trunk and specializes it on code; the base checkpoint it produces is then the starting point for DeepSeekMath.",
      improved: [
        "Repository-level data assembly: file dependencies are parsed and topologically sorted so a training sample sees a file's imports before the file, and near-deduplication happens per repository instead of per file.",
        "Fill-in-the-middle pretraining at a 50% rate in PSM order, chosen from an ablation that measured the trade-off between infilling and ordinary code completion.",
        "A 16K-token context window, obtained by RoPE linear scaling (factor 1 to 4, base 10000 to 100000) plus 1000 extra training steps at 16K.",
        "Openly released weights from 1.3B to 33B under a permissive license, where DeepSeek-Coder-Instruct 33B beat GPT-3.5-Turbo on HumanEval and the 6.7B model matched CodeLlama 34B.",
        "A decontamination pass that removes code containing 10-gram matches against HumanEval, MBPP, GSM8K, and MATH.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why code completion needs a different objective",
        text: "Autocomplete in an editor is not next-token prediction from the start of a file. A developer types inside an existing function with code above and code below, and the model must produce what belongs in the gap. Plain left-to-right training gives the model no practice with a known suffix, and file-level pretraining gives it no sense of a project's structure: which imports exist, which module defines the helper two files away. DeepSeek-Coder attacks both gaps in the data pipeline rather than in the architecture.",
      },
      {
        kind: "formula",
        label: "Fill-in-the-middle in PSM order",
        expression: "<fim_start> f_pre <fim_hole> f_suf <fim_end> f_mid",
        why: "A document is cut into prefix, middle, and suffix. In PSM order the prefix comes first, then the suffix behind a hole sentinel, then the middle behind an end sentinel. Loss is computed on f_mid only, so the model learns to generate the missing span from the prefix and the suffix together. SPM is the same idea with suffix and prefix swapped; the paper chooses PSM.",
      },
      {
        kind: "code",
        title: "Building one FIM training example",
        language: "python",
        code: `import random


def build_fim(doc, rate=0.5, rng=None):
    # Half of all documents get the PSM rearrangement.
    rng = rng or random.Random(0)
    if rng.random() > rate or len(doc) < 3:
        return doc
    p = rng.randrange(1, len(doc))
    s = rng.randrange(p, len(doc))
    prefix, middle, suffix = doc[:p], doc[p:s], doc[s:]
    return ("<fim_start>" + prefix + "<fim_hole>" +
            suffix + "<fim_end>" + middle)`,
        notes: [
          "Three sentinel tokens mark the hole, the end of the context, and the start of the answer; the model is supervised only on the middle segment.",
          "At inference you place the hole where the missing line belongs and let the model fill it, which is why the ordering at train time has to match the prompt format at serve time.",
          "The ablation ran a 1.3B model on Python at 0%, 50%, and 100% FIM: 100% maximized infilling but produced the weakest completion, so 50% PSM became the default.",
        ],
      },
      {
        kind: "visual",
        visual: "code-pipeline",
        caption:
          "Crawl, filter, parse dependencies, order files, deduplicate repositories, screen quality. Each stage changes what the model can learn, not just how much data it sees.",
      },
      {
        kind: "prose",
        heading: "Repository-level assembly, step by step",
        text: "Start with public repositories created before February 2023 and keep 87 programming languages; StarCoder-style filters (line length, alphabetic character ratio, visible-text ratio for HTML, size bounds for JSON and YAML) cut the raw crawl to 32.8% of its original size. Next, parse invocation relationships with regular expressions (import, using, include) and sort the files of each repository so dependencies precede dependents; because real projects contain cycles, the sort picks the minimum in-degree node instead of requiring zero. A comment with the file path is prepended to every file, then files are concatenated in dependency order into one training sample. Deduplication runs on the concatenated repository, not on individual files, so dedup cannot delete half a project and break the structure the model is supposed to learn.",
      },
      {
        kind: "prose",
        heading: "The numbers behind the corpus",
        text: "After cleaning, the code corpus is 798 GB across 603 million files; it covers 87 languages, from Java and Python down to exotic ones, with the largest slices in Java, Python, C++, C#, JavaScript, and TypeScript. The training mixture is 87% source code, 10% English code-related text such as GitHub Markdown and StackExchange, and 3% Chinese natural language, a deliberate bet that natural-language understanding of code concepts matters for instructions and bug reports. The tokenizer is BPE with a 32,000-token vocabulary, smaller than the general model's because code token counts dominate. An n-gram filter removes files containing 10-gram matches against HumanEval, MBPP, GSM8K, and MATH, and exact-matches shorter test strings of at least 3 grams.",
      },
      {
        kind: "prose",
        heading: "The ablation that picked 50%",
        text: "The FIM section is a model of how to choose a pretraining knob. Using a 1.3B model on a Python subset, the authors compare FIM rates of 0%, 50%, and 100%, plus a masked-span variant. The result is a clean trade-off: 100% FIM peaks on the HumanEval-FIM infilling benchmark but is the worst at ordinary code completion, because every document is rearranged and the prefix-to-continuation statistics shift. The 50% PSM setting best balances the two abilities, and the masked-span strategy underperforms plain PSM at the same rate. When you read the benchmark tables later, remember that this single number governs the model's most distinctive skill.",
      },
      {
        kind: "prose",
        heading: "Extending the window, and what to watch for",
        text: "The models train on 4K context, then get 1000 extra steps at 16K with RoPE's linear scaling factor raised from 1 to 4 and its base frequency from 10000 to 100000. The authors say the modification theoretically supports 64K but that the model is most reliable inside 16K; treat advertised context as a ceiling and measured reliability as the real number. One caution appears in the paper itself: on the LeetCode contest benchmark, scores are higher for contests close to the data collection window, and the authors admit contamination cannot be fully ruled out. That is the kind of honest footnote worth internalizing, because it applies to every benchmark you will meet later.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "The problem it attacks",
        text: "Strong code models were closed. Open models were trained on file-level code with next-token prediction only, so they had neither project context nor infilling skill, and the gap to GPT-3.5 looked structural rather than a matter of scale.",
      },
      {
        kind: "prose",
        heading: "The key idea",
        text: "Treat the repository as the unit of data and infilling as a first-class objective. Order files by dependency before concatenation, deduplicate whole repositories, and rearrange half the documents into prefix-suffix-middle form with sentinel tokens.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "Base 33B reached 56.1% pass@1 on HumanEval Python and 66.0% on MBPP, with a multilingual average of 50.3% against CodeLlama 34B's 41.0%. Base 6.7B matched CodeLlama 34B overall. Instruct 33B reached 79.3% on HumanEval Python, above GPT-3.5-Turbo's 76.2%, and was the only open model to beat GPT-3.5-Turbo on the LeetCode contest set (27.8% versus 23.3%). On the single-line infilling benchmark, the 7B model averaged 80.7% against StarCoder's 69.7%. A v1.5 model was later produced by continuing from a DeepSeek LLM 7B checkpoint on 2B mixed tokens, improving natural language without losing code skill.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "The LeetCode comparison may be contaminated, and the authors say so rather than hiding it. The 1.3B model is far behind its larger siblings, and the reliable context is 16K even though 64K is theoretically reachable. The strongest results also come from instruction-tuned models, which is a different comparison than the base-model tables that dominate the paper.",
      },
      {
        kind: "prose",
        heading: "For the practitioner",
        text: "If you train a code model, the objective layout at training time must match the prompt layout at inference time; a mismatch quietly wastes the whole FIM investment. Order matters inside the sample, so preserve file boundaries and paths. And when you evaluate on a public benchmark, assume contamination until proven otherwise, including in your own runs.",
      },
    ],
    questions: [
      {
        id: "q-coder-fim-rate",
        prompt:
          "The FIM ablation found that a 100% FIM rate maximized the infilling score. Why did the authors still choose 50%?",
        options: [
          "Because 100% FIM was slower to train",
          "Because 100% FIM produced the weakest ordinary code completion, and 50% balanced both abilities",
          "Because the HumanEval-FIM benchmark is unreliable",
          "Because sentinel tokens cannot be used on every document",
        ],
        answer: 1,
        explanation:
          "Rearranging every document shifts the prefix-to-continuation statistics the model learns, which erodes left-to-right completion. The 50% rate keeps both skills alive; the paper reports the trade-off explicitly rather than optimizing one benchmark.",
      },
      {
        id: "q-coder-psm-loss",
        prompt:
          "In PSM order, the document becomes <fim_start> prefix <fim_hole> suffix <fim_end> middle. Where should the cross-entropy loss be computed?",
        options: [
          "On the prefix, so the model learns the context",
          "On the suffix, because it sits behind the hole",
          "On the middle segment, which is the only part the model is supposed to generate",
          "Uniformly on all tokens, including the sentinels",
        ],
        answer: 2,
        explanation:
          "The prefix and suffix are the condition; the middle is the answer. Training on anything else teaches the model to reconstruct context it will always be given at inference time, and the sentinels are formatting, not content.",
      },
      {
        id: "q-coder-repo-dedup",
        prompt:
          "Why does the paper deduplicate at repository level instead of file level?",
        options: [
          "Repository-level dedup is faster",
          "File-level dedup removes files that appear in many projects, which breaks the repository structure that dependency ordering depends on",
          "Repository-level dedup catches more near-duplicates",
          "Because GitHub stores repositories, not files",
        ],
        answer: 1,
        explanation:
          "A file that is common across many repositories (a license, a generated stub) would be deleted under file-level dedup, leaving holes in the dependency graph. Concatenating the repository first and deduplicating whole samples keeps each project internally consistent.",
      },
      {
        id: "q-coder-topo",
        prompt:
          "The dependency sort concatenates files so that a file's imports appear before it. Real repositories contain import cycles, so the algorithm does not require zero in-degree. What does it do instead?",
        options: [
          "It deletes files inside cycles",
          "It picks the node with the minimum in-degree among remaining files, decrements its neighbors, and repeats",
          "It sorts alphabetically by file path",
          "It skips the repository entirely when a cycle is found",
        ],
        answer: 1,
        explanation:
          "Minimum in-degree selection is a practical relaxation of topological sort: cycles stall a strict zero-in-degree rule, but lowering the bar to the least-depended-upon remaining file produces a complete ordering anyway. The file path comment prepended to each file preserves metadata through concatenation.",
      },
      {
        id: "q-coder-long-context",
        prompt:
          "How did the models get to 16K context, and what was the actual result?",
        options: [
          "They trained at 16K from scratch and the result is a reliable 16K window",
          "They scaled RoPE (factor 1 to 4, base 10000 to 100000) and trained 1000 more steps at 16K; 64K is theoretical but 16K is the reliable range",
          "They reordered the attention mask to process 64K directly",
          "They grew the context to 16K purely with a larger tokenizer",
        ],
        answer: 1,
        explanation:
          "Linear RoPE scaling stretches the position encoding so positions beyond the original window stay well-defined; a short continued-training phase adapts the model. The authors are explicit that reliability, not capability, sets the useful window.",
      },
    ],
    practice: {
      articles: ["art-bpe", "art-embeddings"],
      problems: ["nlp-020", "nlp-021", "dl-015"],
    },
  },
  {
    id: "deepseek-math",
    slug: "deepseek-math",
    title:
      "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
    short: "DeepSeekMath",
    year: 2024,
    date: "2024-02-05",
    arxivId: "2402.03300",
    url: "https://arxiv.org/abs/2402.03300",
    kind: "paper",
    era: "founding",
    tier: "core",
    tagline:
      "A 7B math model built on web data, plus GRPO: the critic-free RL method that later powered DeepSeek's reasoning era.",
    whatItIs:
      "Two contributions in one paper. Starting from DeepSeek-Coder-Base-v1.5 7B, the authors continue pretraining on 120B math tokens filtered out of Common Crawl and reach 36.2% on the MATH benchmark as a base model, then 46.8% after instruction tuning. Reinforcement learning with GRPO lifts that to 51.7%, close to Gemini Ultra and GPT-4 at the time. GRPO itself is the lasting idea: instead of training a value network to estimate advantages, it samples a group of answers to the same question and scores each answer relative to the mean and standard deviation of its group.",
    theoryMinutes: 16,
    lineage: {
      from: "deepseek-coder",
      to: ["deepseek-r1"],
      context:
        "Fourth paper of the founding era. It shows that code training transfers to mathematical reasoning and introduces GRPO, the algorithm the reasoning era builds on.",
      improved: [
        "A web-scale math corpus: 120.2B tokens and 35.5M web pages selected from Common Crawl by an iteratively retrained fastText classifier, roughly 7 times the math web pages Minerva used.",
        "Evidence that code pretraining improves mathematical reasoning, with and without tools, and that arXiv papers, contrary to common practice, brought no notable benchmark gains.",
        "GRPO, a PPO variant that drops the critic and estimates the baseline from group rewards, cutting the memory cost of RL fine-tuning.",
        "A unified account of SFT, rejection sampling, DPO, PPO, and GRPO as direct or simplified forms of one objective, distinguished by their gradient coefficients.",
        "Strong results on a 7B budget: 51.7% on MATH with chain-of-thought and no voting, 60.9% with self-consistency over 64 samples, and out-of-domain gains such as CMATH 84.6% to 88.8%.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why math is a hard test case",
        text: "Mathematical reasoning is verifiable: the final answer is right or wrong, so you can build a reward signal without collecting human preferences. It is also unforgiving, because a single dropped sign breaks a long chain of steps. Before this paper, open models trailed closed ones badly on MATH, and the common assumption was that web text had little to offer. DeepSeekMath challenges both halves of that assumption: first, mine the web with a classifier sharp enough to find math; second, reward the model for producing correct final answers and let it discover the reasoning.",
      },
      {
        kind: "prose",
        heading: "The data pipeline, in plain language",
        text: "Seed the loop with OpenWebMath, a small high-quality collection. Train a fastText classifier on 500K positive pages from the seed and 500K random Common Crawl negatives. Score the web, keep the top pages, then look at which domains contributed heavily (over 10% of a domain's pages collected marks it as math-related), have humans annotate more URLs inside those domains, and retrain. Four iterations produced 35.5M pages and 120.2B tokens; the fourth pass recovered almost nothing new, so collection stopped. Deduplication by URL and near-duplicates shrank the raw crawl to 40B HTML pages before scoring, and a 10-gram filter removes benchmark questions and answers.",
      },
      {
        kind: "formula",
        label: "Group-relative advantage",
        expression: "A_i = (r_i - mean(r_1..r_G)) / std(r_1..r_G)",
        why: "For one question, the policy samples G answers. Each answer gets a reward r_i from the reward model, and A_i is how much better or worse that answer was than its siblings. Subtracting the group mean removes the question's overall difficulty, and dividing by the group standard deviation removes how spread out the group happened to be, so one question cannot dominate the gradient simply because its rewards vary more.",
      },
      {
        kind: "code",
        title: "Advantage normalization and the clipped term",
        language: "python",
        code: `import math


def group_advantages(rewards, eps=1e-8):
    n = len(rewards)
    mean = sum(rewards) / n
    var = sum((r - mean) ** 2 for r in rewards) / n
    std = math.sqrt(var)
    if std < eps:
        return [0.0] * n
    return [(r - mean) / (std + eps) for r in rewards]


def clipped_objective(ratios, advantages, eps=0.2):
    total = 0.0
    for ratio, adv in zip(ratios, advantages):
        clipped = max(1.0 - eps, min(1.0 + eps, ratio))
        total += min(ratio * adv, clipped * adv)
    return total / len(ratios)`,
        notes: [
          "A degenerate group (every sample scores the same) carries no signal, so its advantages are zeroed instead of dividing by a tiny number.",
          "ratio is the new policy's probability of a token divided by the old policy's; eps bounds how far one update may move that ratio.",
          "The min of the unclipped and clipped products is what makes the update a trust region: if moving the ratio further would only help, the clipped term wins and the gradient shrinks.",
        ],
      },
      {
        kind: "visual",
        visual: "grpo-loop",
        caption:
          "Sample a group, score it, normalize within the group, update the policy. No value network sits between the reward and the gradient.",
      },
      {
        kind: "prose",
        heading: "What GRPO removes, and why it matters",
        text: "PPO, the standard RL method for language models, trains a value network alongside the policy to estimate advantages, which roughly doubles the memory and adds a moving target to debug. GRPO replaces that value network with the group mean: the baseline for an answer is simply how its siblings scored. The KL penalty also moves: PPO shapes per-token rewards with a reference-model term, while GRPO adds the KL divergence between policy and reference directly to the objective, using an unbiased estimator that stays positive. In the paper's runs the KL coefficient is 0.04, the policy learning rate 1e-6, and each question samples 64 outputs, so a group is large enough for the mean and standard deviation to mean something.",
      },
      {
        kind: "formula",
        label: "The GRPO objective",
        expression:
          "J = (1/G) * sum_i (1/|o_i|) * sum_t min(ratio * A_i, clip(ratio, 1-eps, 1+eps) * A_i) - beta * KL(pi || pi_ref)",
        why: "G is the number of sampled answers o_i for one question; |o_i| is an answer's token count, so longer answers do not dominate. ratio is pi(o_i,t | q, o_i,<t) / pi_old(...) for the t-th token, A_i is the group-relative advantage, eps bounds the ratio, and beta weights the KL term against the reference model. The first term in the min is the plain policy gradient; the second cancels the gain from moving the ratio outside the trust region.",
      },
      {
        kind: "visual",
        visual: "rl-reward-curve",
        caption:
          "A strong instruction model still has room: RL lifts GSM8K from 82.9 to 88.2, MATH from 46.8 to 51.7, and even out-of-domain CMATH from 84.6 to 88.8.",
      },
      {
        kind: "prose",
        heading: "What the RL runs showed",
        text: "RL ran on 144K chain-of-thought questions drawn only from GSM8K and MATH, starting from DeepSeekMath-Instruct 7B. Both benchmarks improved despite the training data being a subset of what instruction tuning already used, and out-of-domain benchmarks improved too, which is the interesting part: the model did not merely memorize the two training distributions, it got better at math in general. Self-consistency over 64 samples reaches 60.9% on MATH, showing the tuned model's answer distribution contains more correct solutions than a single greedy decode reveals. The paper also reports iterative GRPO, where the reference model is reset to the current policy and the reward model continues training on replayed and fresh data; the details are in Algorithm 1 and worth reading alongside the code above.",
      },
      {
        kind: "prose",
        heading: "Two surprising findings and what to watch",
        text: "First, code pretraining helps math: starting from a code model beats starting from a general LLM, both with and without tools. Second, contrary to common practice, adding arXiv papers brought no notable improvement on these benchmarks, likely because the pipeline's web pages already covered the useful mathematical text. When reading, separate the two stories. The data story is a pipeline paper with careful ablations. The algorithm story is the one that mattered later, and it is short, with the entire GRPO description fitting in a few pages.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "The problem it attacks",
        text: "Open models were far behind closed models on competition mathematics. The standard assumptions were that web text was too noisy to teach math and that reinforcement learning for language models required an expensive value network.",
      },
      {
        kind: "prose",
        heading: "The key idea",
        text: "Mine web math with an iteratively improved classifier, then improve reasoning with a critic-free RL algorithm that uses the average reward of a sampled group as the baseline. Both halves are about extracting signal from cheap resources: web pages instead of curated textbooks, group statistics instead of a learned value function.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "DeepSeekMath-Base 7B reaches 64.2% on GSM8K and 36.2% on MATH, ahead of Minerva 540B on both despite being 77 times smaller. Instruction tuning brings MATH to 46.8% and GSM8K to 82.9%. GRPO then lifts them to 51.7% and 88.2%, with 60.9% on MATH under self-consistency over 64 samples. The 51.7% figure, without tools or voting, approaches Gemini Ultra and GPT-4 on the same benchmark (53.2 and 52.9). A 1.3B controlled study shows the DeepSeekMath Corpus produces a steeper, longer-lasting learning curve than MathPile, OpenWebMath, or Proof-Pile-2.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "Geometry and theorem proving are weak spots: the authors report the model failing on triangle and ellipse problems, which they attribute to selection bias in the pretraining and fine-tuning data. Few-shot prompting barely helps; performance is similar zero-shot and few-shot, unlike GPT-4. The RL gains are measured on two in-domain benchmarks, and the out-of-domain improvements, while consistent, are smaller.",
      },
      {
        kind: "prose",
        heading: "For the practitioner",
        text: "GRPO is small enough to implement from the equations, and the two details people get wrong are the degenerate group (guard the standard deviation) and the trust region (keep the clipped minimum, not just the ratio times advantage). On the data side, the transferable trick is domain annotation: let the classifier point at the domains it likes, then let humans label within them, and repeat. That loop is what turns a noisy web into 120B usable tokens.",
      },
    ],
    questions: [
      {
        id: "q-math-std-normalize",
        prompt:
          "In GRPO, why divide the centered rewards by the standard deviation of the group?",
        options: [
          "To make every reward positive",
          "To make advantages comparable across questions whose reward spreads differ, so no single question dominates the gradient",
          "Because the reward model outputs standard-normal scores",
          "To guarantee the policy update never increases the KL divergence",
        ],
        answer: 1,
        explanation:
          "The mean removes question difficulty; the standard deviation removes question variance. Without it, a question whose group happens to have spread-out rewards would produce larger advantages and larger gradients than a question with nearly identical answers, purely as an artifact of sampling.",
      },
      {
        id: "q-math-no-critic",
        prompt: "What replaces the critic (value) network in GRPO?",
        options: [
          "A second reward model trained on preferences",
          "The mean reward of the group of answers sampled for the same question",
          "The reference model's log probabilities",
          "A Monte Carlo estimate of the state value from rollouts of other questions",
        ],
        answer: 1,
        explanation:
          "The group is the baseline. Because all answers in a group respond to the same question, their average is a natural estimate of expected reward, which removes the need for a learned value function and roughly halves the memory of the RL stage.",
      },
      {
        id: "q-math-kl-placement",
        prompt:
          "How does GRPO handle the KL penalty relative to PPO?",
        options: [
          "PPO and GRPO both fold it into the per-token reward",
          "GRPO adds the KL divergence directly to the objective, while PPO commonly subtracts it from each token's reward",
          "GRPO drops the KL penalty entirely",
          "GRPO computes KL against the reward model instead of the policy",
        ],
        answer: 1,
        explanation:
          "The paper argues adding KL to the loss avoids complicating the advantage calculation, since per-token shaping would change what A_i means. The estimator they use is guaranteed positive, and beta (0.04 in their runs) sets its weight.",
      },
      {
        id: "q-math-why-groups",
        prompt: "Why does GRPO sample a group of outputs for each question instead of one?",
        options: [
          "To average away reward model noise only",
          "Because relative comparisons within a group supply a baseline and mirror how reward models are trained (on comparisons between outputs)",
          "Because it makes the training batch larger without extra cost",
          "To enable majority voting at training time",
        ],
        answer: 1,
        explanation:
          "Reward models are typically trained on comparisons of outputs for the same prompt, so asking the policy to improve relative to sibling outputs aligns with the reward's own structure. The group also performs the baseline role that a value network would otherwise provide.",
      },
      {
        id: "q-math-degenerate-group",
        prompt:
          "A group of 64 sampled answers all receive the same reward. What do the group-relative advantages become, and what should the implementation do?",
        options: [
          "All advantages are 1, and the policy should update normally",
          "All advantages are 0, and the group contributes no gradient, so guard the division by a small epsilon",
          "Advantages become infinite, so the group must be discarded",
          "Advantages flip sign, so the group teaches the model to avoid the answer",
        ],
        answer: 1,
        explanation:
          "With zero variance the numerator is zero for every answer, and allowing the division would produce an undefined value. The standard guard is an epsilon (or an explicit zero return), which is why uniform groups are simply neutral rather than destructive.",
      },
      {
        id: "q-math-self-consistency",
        prompt:
          "The paper reports 51.7% on MATH single-sample and 60.9% with self-consistency over 64 samples. What does the gap indicate?",
        options: [
          "The single-sample number is measured incorrectly",
          "The policy's distribution contains many correct solutions, and sampling plus voting recovers some of them",
          "The model was trained on MATH answers, so voting memorizes the benchmark",
          "Self-consistency is only valid for GSM8K",
        ],
        answer: 1,
        explanation:
          "The headline claim in the abstract is deliberately the harder setting (one sample, no voting, no tools), because it measures the policy directly. The self-consistency number measures the distribution, which is useful for reasoning agents that can sample and aggregate, but it is a different claim.",
      },
    ],
    practice: {
      concepts: ["stats-central", "stats-spread", "prob-distributions"],
      articles: ["art-post-training"],
      problems: ["rl-271", "rl-272", "rl-273", "dl-181"],
    },
  },
  {
    id: "deepseek-vl",
    slug: "deepseek-vl",
    title: "DeepSeek-VL: Towards Real-World Vision-Language Understanding",
    short: "DeepSeek-VL",
    year: 2024,
    date: "2024-03-08",
    arxivId: "2403.05525",
    url: "https://arxiv.org/abs/2403.05525",
    kind: "paper",
    era: "founding",
    tier: "advanced",
    tagline:
      "A vision-language family whose hybrid encoder reads 1024 x 1024 images into 576 tokens, trained so the language model never forgets how to read.",
    whatItIs:
      "DeepSeek-VL adapts the DeepSeek LLM into a vision-language model at 1.3B and 7B scale. Its vision side is a hybrid: a SigLIP encoder takes a coarse semantic view at 384 x 384, a SAM-B encoder adds fine detail at 1024 x 1024, and a small adaptor compresses both into 576 visual tokens. The authors also tackle a practical failure mode, multimodal training eroding language ability, by keeping at least 70% text in the mix and warming the model onto vision gradually. Both sizes are fully open.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-llm",
      to: ["deepseek-vl2"],
      context:
        "Last paper of the founding era. It applies the DeepSeek LLM trunk to a second modality and sets the pattern (hybrid encoder, joint training, taxonomy-driven fine-tuning) that later multimodal work reuses.",
      improved: [
        "High-resolution visual input inside a fixed token budget: 1024 x 1024 pixels compressed to 576 visual tokens, where comparable open models worked at 336 or 448 pixels.",
        "A hybrid encoder that pairs SigLIP-L for semantics with SAM-B for low-level detail, aimed at dense OCR, charts, and tiny objects where a single CLIP-family encoder struggles.",
        "Joint vision-and-language pretraining with a roughly 7:3 language-to-multimodal mix plus modality warm-up, which preserves language benchmark scores that pure multimodal training degrades.",
        "Instruction data organized by a use-case taxonomy built from real GPT-4V and Gemini test cases, instead of an unweighted pile of academic datasets.",
        "Open weights at two scales with strong small-model results: DeepSeek-VL-1.3B scores 64.6 on MMBench and 87.6 on POPE.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The vision-language problem",
        text: "A language model reads tokens; an image is a grid of pixels. The standard bridge is a vision encoder that turns the image into a sequence of vectors, plus an adaptor that maps those vectors into the language model's embedding space. Everything else is a data and training question. Two failure modes dominate the field: encoders that see the image at low resolution and miss small text, and training that spends so much time on image-caption pairs that the language half of the model forgets its skills. DeepSeek-VL is built around avoiding both.",
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "Two encoders, one image: SigLIP-L gives the gist at 384 x 384, SAM-B gives the fine print at 1024 x 1024, and the adaptor fuses them into 576 tokens the language model can read.",
      },
      {
        kind: "prose",
        heading: "Why one encoder was not enough",
        text: "CLIP-family encoders, SigLIP included, are trained to align an image with a caption, which rewards semantic gist and punishes attention to pixel detail. The paper cites the CLIP-blind-pairs problem: visually distinct images can land on similar embeddings, and the low input resolution (224 to 384 pixels) is too coarse for dense OCR or visual grounding. A vision-only encoder is the complement: SAM-B is trained for segmentation, so it preserves location and texture. DeepSeek-VL runs both and lets the adaptor learn what each contributes. The cost is managed by keeping the output at a fixed token count rather than by shrinking the input.",
      },
      {
        kind: "formula",
        label: "From 1024 pixels to 576 tokens",
        expression: "576 = (96 / 2 / 2)^2",
        why: "SAM-B sees the image at 1024 x 1024 with 16-pixel patches, which is a 64 x 64 grid of 4096 tokens. The adaptor interpolates that grid to 96 x 96 and applies two convolutions with stride 2, each halving the grid: 96, then 48, then 24. Reshaped, the 24 x 24 grid is 576 vectors. The low-resolution branch already produces 576 vectors after SigLIP-L, so the two are concatenated into 576 tokens of 2048 dimensions each.",
      },
      {
        kind: "code",
        title: "Building a 7:3 joint batch",
        language: "python",
        code: `def joint_batch(text_pool, vision_pool, vision_fraction=0.3):
    # Keep the language-to-multimodal ratio near 7:3 in every batch.
    size = 1000
    n_vision = int(size * vision_fraction)
    n_text = size - n_vision
    batch = text_pool[:n_text] + vision_pool[:n_vision]
    return batch, n_text / size`,
        notes: [
          "The paper's experiments show a 100% multimodal batch causes a stark decline in language metrics, while 70:30 both preserves language and lets multimodal scores rise.",
          "The warm-up starts text-heavy and ramps the vision share toward 30%, so the model eases into the new modality instead of switching abruptly.",
          "The ratio is a real training decision with a cost curve: more vision per batch buys vision ability and spends language ability, and the paper argues for keeping language above 70%.",
        ],
      },
      {
        kind: "prose",
        heading: "Three training stages",
        text: "Stage 1 freezes the vision encoder and the language model and trains only the adaptor, on 1.25M ShareGPT4V captions plus 2.5M rendered document OCR pairs. This aligns the embedding spaces cheaply; the authors also test scaling the adaptor's data and find it plateaus, which is why stage 2 unfreezes the language model. Stage 2 is joint vision-language pretraining: the vision encoder stays frozen while the language model and adaptor learn together on a mixed batch. Stage 3 is supervised fine-tuning on instruction data, where the SigLIP-L encoder, adaptor, and language model train and only SAM-B stays frozen because of GPU memory limits.",
      },
      {
        kind: "prose",
        heading: "What went into the data",
        text: "The pretraining mix is dominated by text: the DeepSeek-LLM 2T corpus is 70% of it. The rest is spread across interleaved image-text (MMC4 at 13.1%), image captions (11.1%), tables and charts (2.1%), document OCR (2.1%), scene text (1.2%), and web code (0.4%). The document OCR slice is worth a look: 1.4 million arXiv articles compiled and rendered into image-text pairs with Nougat tooling, plus 860K English and 180K Chinese e-books and millions of education exam questions rendered from HTML. The web-code slice came from 1.46 million Jupyter notebooks, whose plots were paired with the code that preceded them, about 2M pairs narrowed to 1.1M. Instruction tuning follows a taxonomy of real use cases, from recognition and OCR to image-to-code conversion, charts, commonsense and logical reasoning, evaluation, multi-image comparison, and safety.",
      },
      {
        kind: "prose",
        heading: "Results, limits, and what to watch",
        text: "DeepSeek-VL-7B reaches 73.2 on MMBench and 72.8 on MMBench-CN, 36.6 on MMMU, 456 on OCRBench, and 88.1 on POPE, beating open models of similar size on most of these and coming close to much larger ones. The 1.3B model scores 64.6 on MMBench and 87.6 on POPE. Two limits are stated plainly: the work covers visual understanding only, with the loss computed on the language side, so the model does not generate images; and SAM-B stays frozen during fine-tuning, so the fine-detail encoder never adapts to the tasks. A third, implicit limit is scale, and the authors say the next step is a larger model with mixture-of-experts blocks. While reading, give the training-strategy section the most attention: the encoder is a composition of known parts, but the 7:3 ratio and the warm-up are where the real-world behavior comes from.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "The problem it attacks",
        text: "Open vision-language models often win academic benchmarks yet disappoint in real use, because they under-pretrain the multimodal stages, train on low-resolution inputs, and let language ability degrade during vision training. DeepSeek-VL targets all three.",
      },
      {
        kind: "prose",
        heading: "The key idea",
        text: "Spend the vision budget where it matters: a hybrid encoder gives both semantic gist and high-resolution detail at a fixed 576-token cost, and a joint language-plus-vision training mixture protects the language half while the vision half learns.",
      },
      {
        kind: "prose",
        heading: "Evidence",
        text: "At 7B the model reaches 73.2 on MMBench, 72.8 on MMBench-CN, 37.9 on CMMMU, 456 on OCRBench, and 88.1 on POPE, ahead of open models of the same size and competitive with larger ones. At 1.3B it still manages 64.6 on MMBench, 61.3 on MMBench-CN, 409 on OCRBench, and 87.6 on POPE. The ablations show that scaling the adaptor alone saturates, that a 100% multimodal batch collapses language metrics, and that the 7:3 mixture keeps both modalities strong.",
      },
      {
        kind: "prose",
        heading: "What the authors admit",
        text: "This is an understanding model, not a generator: the training loss is computed only on the language part, so image synthesis is out of scope. SAM-B remains frozen in the final fine-tuning stage due to GPU memory. The 1.3B model needed special handling (multiple-choice perplexity evaluation plus a small amount of SFT data mixed into pretraining) because generative metrics were too noisy to steer the run, which the authors attribute to limited capacity rather than to the data.",
      },
      {
        kind: "prose",
        heading: "For the practitioner",
        text: "If you build a multimodal model, two numbers deserve attention before architecture: the text share in your training batches and the visual token count per image. The first protects the language model from forgetting; the second decides your serving cost. DeepSeek-VL fixes the second at 576 and lets the encoder work hard to make those tokens informative, which is a better trade than shrinking the input image.",
      },
    ],
    questions: [
      {
        id: "q-vl-hybrid-roles",
        prompt:
          "The hybrid encoder combines SigLIP-L at 384 x 384 with SAM-B at 1024 x 1024. Which task most needs the SAM-B branch?",
        options: [
          "Recognizing the general topic of a photo",
          "Reading dense text in a scanned document or spotting a tiny object",
          "Translating a caption into another language",
          "Counting the parameters of the language model",
        ],
        answer: 1,
        explanation:
          "SigLIP is caption-trained, so it excels at semantic gist but has limited resolution and can map distinct images to similar embeddings. SAM-B is a segmentation model: it preserves spatial and textural detail, which is exactly what dense OCR and small-object tasks need.",
      },
      {
        id: "q-vl-token-budget",
        prompt:
          "SAM-B processes a 1024 x 1024 image and produces a 64 x 64 feature grid. After the adaptor interpolates to 96 x 96 and applies two stride-2 convolutions, how many visual tokens reach the language model?",
        options: ["4096", "1024", "576", "2048"],
        answer: 2,
        explanation:
          "Each stride-2 convolution halves the grid: 96 becomes 48, then 24. A 24 x 24 grid reshaped is 576 vectors. The SigLIP branch is already 576 tokens, so concatenation keeps 576 tokens at 2048 dimensions, and that fixed budget is the serving-cost guarantee.",
      },
      {
        id: "q-vl-text-ratio",
        prompt:
          "Why keep 70% of each training batch as pure text when the goal is vision understanding?",
        options: [
          "Because text data is cheaper to load",
          "Because multimodal training competes with language ability, and dropping below that ratio causes severe language forgetting",
          "Because the vision encoder is frozen and cannot learn from images alone",
          "Because text batches are needed to keep the tokenizer stable",
        ],
        answer: 1,
        explanation:
          "The paper's 100% multimodal experiment shows a stark decline in language metrics, and the ratio study shows both modalities track their share of the batch. The 7:3 mix improves vision while keeping language scores, and the warm-up ramps into it gradually.",
      },
      {
        id: "q-vl-stage1",
        prompt:
          "In stage 1, the vision encoder and the language model are frozen and only the adaptor trains. Why does the pipeline move past this stage?",
        options: [
          "Because the adaptor overfits after one epoch",
          "Because adaptor capacity is small and scaling its training data stops helping, so the language model itself must learn to read the visual tokens",
          "Because the vision encoder needs gradients to stay sharp",
          "Because the KL divergence between adaptor and model grows too large",
        ],
        answer: 1,
        explanation:
          "A two-layer MLP has limited capacity, and the paper reports that more adaptor data does not help. Stage 2 therefore unfreezes the language model while keeping the vision encoder fixed, letting the trunk adapt to the new input distribution.",
      },
      {
        id: "q-vl-small-model-eval",
        prompt:
          "The 1.3B model had unstable generative benchmark scores during pretraining. What did the authors do?",
        options: [
          "They stopped evaluating until the model was larger",
          "They switched to comparing the perplexity of answer options and mixed a small amount of SFT data into pretraining",
          "They replaced generation with retrieval for the small model",
          "They froze the language model for the rest of training",
        ],
        answer: 1,
        explanation:
          "Following the point that benchmark metrics can move sharply even when per-token error improves smoothly, they scored each candidate answer by its perplexity, and mixed in SFT data so instruction-following would not be the bottleneck. This kept the small-scale experiments usable for model selection.",
      },
    ],
    practice: {
      concepts: ["la-vectors", "stats-correlation"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-188", "cv-249", "cv-296"],
    },
  },
];
