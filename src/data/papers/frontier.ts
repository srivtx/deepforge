import type { Paper } from "./types";

/**
 * Era 4: frontier. Hybrid thinking and the agent era (V3.1), trainable sparse
 * attention (NSA) and its production descendant DSA (V3.2-Exp), the
 * million-token V4 generation and the KV-cache-compressed V4.1-Flash, plus the
 * decoupled multimodal line (Janus, Janus-Pro). Every number quoted below comes
 * from the linked report, release note, or model card; vendor-reported claims
 * are labeled as such.
 */
export const FRONTIER_PAPERS: Paper[] = [
  {
    id: "deepseek-v3-1",
    slug: "deepseek-v3-1",
    title:
      "DeepSeek-V3.1 Release: Hybrid Inference for the Agent Era",
    short: "DeepSeek-V3.1",
    year: 2025,
    date: "2025-08-21",
    url: "https://www.deepseek.com/en/news/deepseek-v3-1/",
    kind: "announcement",
    era: "frontier",
    tier: "core",
    tagline:
      "One set of weights, two modes: Think when the task needs deliberation, Non-Think when latency matters, and the chat template decides which one runs.",
    whatItIs:
      "DeepSeek-V3.1 is the August 21, 2025 upgrade that turned chat and reasoning into one checkpoint. It continues pretraining the V3 base model for 840B tokens to extend context handling, updates the tokenizer and chat template, and post-trains for tool use and multi-step agent tasks. The same weights serve both a fast non-thinking mode (the deepseek-chat API) and a deliberating thinking mode (the deepseek-reasoner API), each with 128K context. DeepSeek reports that V3.1-Think answers in less time than R1-0528, that SWE-bench Verified reaches 66.0, SWE-bench Multilingual 54.5, and Terminal-bench 31.3, and the release calls itself the first step toward the agent era. A follow-up patch, V3.1-Terminus (September 22, 2025), fixed Chinese-English mixing and further tuned the Code and Search agents.",
    theoryMinutes: 12,
    lineage: {
      from: "deepseek-v3",
      to: ["deepseek-v3-2-exp"],
      context:
        "The reasoning era ended with two separate products: a fast instruct model and a slow but stronger reasoner. V3.1 is the moment DeepSeek folds the reasoning capability back into the V3 line as a mode of one model, and points the post-training budget at tool use, which is what the V3.2 and V4 generations build on.",
      improved: [
        "Serves thinking and non-thinking behavior from a single set of weights, selected by the chat template rather than by routing to a different checkpoint.",
        "Extends the V3 base model with 840B tokens of continued pretraining for long-context handling and ships a new tokenizer and chat template configuration.",
        "Post-trains specifically for tool use and multi-step agent tasks, reporting SWE-bench Verified 66.0, SWE-bench Multilingual 54.5, and Terminal-bench 31.3.",
        "Adds an Anthropic-format API endpoint and strict function calling (beta), lowering the integration cost for agent frameworks of the time.",
        "Improves thinking efficiency: DeepSeek reports V3.1-Think reaches answers in less time than R1-0528 rather than by simply emitting more tokens.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two products became one",
        text: "Before V3.1, a DeepSeek deployment had a fork in it. The instruct model answered directly and cheaply but was weak on multi-step problems; the R1-lineage reasoner wrote a long private chain of thought first, which raised quality on math and code but multiplied output cost and latency. Every request had to choose a checkpoint, and every team had to build routing logic on top. V3.1 collapses the fork: one base model, one set of weights, and a mode switch realized in how the prompt is rendered. The architectural claim is deliberately modest - V3.1 keeps the V3 architecture and size (671B total, 37B activated parameters) - and the release spends its budget on post-training and context instead.",
      },
      {
        kind: "prose",
        heading: "The mode switch is a template, not a model",
        text: "The two modes share weights; what changes is the chat template that serializes the conversation before the forward pass. In thinking mode the model emits reasoning between special tags before the final answer, and the API exposes it as deepseek-reasoner; in non-thinking mode the same weights answer directly, and the API exposes it as deepseek-chat. DeepSeek documents a practical detail for multi-turn use: the thinking-mode template drops the previous turn's reasoning tokens while retaining the tag in context, so a long conversation does not balloon just because the model once thought hard. This is the same trick a serving stack would otherwise implement with two model versions and an external router - here it is one artifact and a rendering choice.",
      },
      {
        kind: "visual",
        visual: "hybrid-thinking",
        caption:
          "Hybrid inference: one checkpoint, two prompt templates. Non-Think answers immediately; Think emits a reasoning trace between special tags, then the answer. The template, not a separate model, selects the path.",
      },
      {
        kind: "prose",
        heading: "When each mode wins",
        text: "Thinking is not free: reasoning tokens are output tokens, billed and serialized like the answer. So the honest decision rule is about the value of deliberation per token. Non-Think wins for short factual replies, extraction, classification, formatting, and high-QPS serving (many queries per second) where tail latency (p99, the 99th percentile) is the product. Think wins when the task has many dependent steps - math, code repair, multi-hop search, tool orchestration - because one correct final answer is worth many cheap wrong ones. DeepSeek's own framing in the release is efficiency: V3.1-Think is compared against R1-0528 on time-to-answer, not just accuracy, which is an admission that the previous reasoner overthought. The right mental model is a dial on deliberation, and the work is in learning where to set it.",
      },
      {
        kind: "formula",
        label: "The cost of deliberation",
        expression:
          "cost(mode) = t_in * p_in + t_think(mode) * p_out + t_answer(mode) * p_out\nutility(mode) = P(correct | mode) - lambda * cost(mode)",
        why: "Input tokens are paid once; the mode changes how many tokens the model writes before answering. Thinking multiplies output cost by roughly (t_think + t_answer) / t_answer while raising the probability of a correct answer. A mode router should choose Think only when the accuracy gain times the value of being right exceeds lambda times the extra output cost. That is why the agent-era framing matters: when the answer feeds a tool call or a code patch, the value of being right is high, so thinking pays; when the answer is a one-line lookup, it usually does not.",
      },
      {
        kind: "code",
        title: "A cheap mode router",
        language: "python",
        code: `def choose_mode(prompt, task, value_of_correct, latency_budget_ms):
    # features a serving stack can compute before generation
    multi_step = task in {"math", "code", "agent", "search"}
    long_context = task == "long_doc_qa"
    short_answer = task == "extract" or task == "classify"

    if short_answer and latency_budget_ms < 400:
        return "non-think"          # deliberation cannot pay for itself
    if multi_step and value_of_correct > 10:
        return "think"              # a wrong tool call is expensive
    if long_context:
        return "think"              # retrieval over many hops
    return "non-think"

# the model itself does not need to change; only the template does`,
        notes: [
          "This is the router DeepSeek avoided shipping twice: the mode lives in the prompt, but the decision of which prompt to render is still yours.",
          "The thresholds encode the economics, not model quality: same weights, different willingness to pay for deliberation.",
          "In V4 generations this router mutates into a numeric reasoning-effort setting on the request.",
        ],
      },
      {
        kind: "prose",
        heading: "The agent-era post-training",
        text: "The second half of the release is about tool use. An agent loop is not a single question: the model calls a function, reads the result, decides the next call, and repeats. That workload stresses different skills than chat - deciding when to call a tool at all, formatting arguments exactly, and recovering when a call fails. DeepSeek post-trained V3.1 on this behavior and shipped strict function calling plus an Anthropic-format API so existing agent frameworks could switch with little code. The reported gains (SWE-bench Verified 66.0, Multilingual 54.5, Terminal-bench 31.3) are the earliest public signal that the same checkpoint can compete on agentic coding, and the Terminus patch shows how quickly the remaining rough edges - language mixing, search behavior - were found in production.",
      },
      {
        kind: "prose",
        heading: "Continued pretraining for context",
        text: "Before any post-training, V3.1-Base received 840B tokens of continued pretraining on top of the V3 checkpoint, aimed at long-context extension, plus an updated tokenizer configuration. This is the quiet work behind the headline: a 128K context is not a flag you flip; the model has to see enough long documents during training to use the middle of a long window. The same recipe - take the previous model, continue pretraining on long data, then post-train modes and tools - is exactly what the V3.2 experimental release repeats when it adds DeepSeek Sparse Attention, and it is why V3.1 matters in the lineage even though its architecture is unchanged.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the release sets out to solve",
        text: "A deployment could serve a fast instruct model or a slow reasoner, but not both well. The release asks whether the two can be the same artifact, and whether the post-training budget is better spent on agentic behaviors - tool use, multi-step loops - than on another round of chat improvements.",
      },
      {
        kind: "prose",
        heading: "What is actually public here",
        text: "This is an announcement, not a paper: the primary artifacts are the official release note of August 21, 2025, the Hugging Face model card, and the API changelog. There is no V3.1 technical report, and the paper linked from the model card is the original DeepSeek-V3 report, not a V3.1 write-up. Read the note for the mode design, the 840B-token continued pretraining, and the agent benchmarks; do not expect ablations of the mode switch, because none are published.",
      },
      {
        kind: "prose",
        heading: "Evidence the release notes offer",
        text: "Reported numbers: SWE-bench Verified 66.0, SWE-bench Multilingual 54.5, Terminal-bench 31.3; thinking mode is faster than R1-0528 on time-to-answer while reaching comparable answer quality; the base model is 671B parameters with 37B activated, 128K context for both modes. The agent scores are the same table that later served as the baseline for V3.2-Exp, which is useful: the Exp release deliberately kept training aligned with V3.1-Terminus so the two could be compared head to head.",
      },
      {
        kind: "prose",
        heading: "Limits the release admits (and some it does not)",
        text: "The release is vendor reporting: no third-party evaluations are cited for the headline numbers. The thinking-efficiency claim is comparative without a published measurement protocol. The 840B-token continued pretraining lacks data-mix and context-length details. And the mode switch is only as good as the template that invokes it: if the caller renders the wrong template, the model happily runs the wrong mode, and the release offers no learned router. The Terminus patch, one month later, is an implicit admission that the first cut had language-consistency and agent rough edges.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Treat thinking as a billed resource with a value, not as a quality dial. If your stack serves both fast and deep responses, prefer one checkpoint with prompt-selected modes over two models: it halves the weight memory, unifies evals, and lets you change the mix by traffic policy. And invest post-training in the interface, not just the answer: strict tool schemas and an API format your agent framework already speaks are what make a model usable inside a loop.",
      },
    ],
    questions: [
      {
        id: "v31-q1",
        prompt:
          "In the V3.1 API, which mapping between model names and modes is correct?",
        options: [
          "deepseek-chat is thinking mode, deepseek-reasoner is non-thinking mode",
          "deepseek-chat is non-thinking mode, deepseek-reasoner is thinking mode",
          "Both names route to the thinking mode; the mode is chosen by temperature",
          "Both names route to non-thinking mode and thinking is only available in the app",
        ],
        answer: 1,
        explanation:
          "DeepSeek's changelog states that deepseek-chat corresponds to V3.1's non-thinking mode and deepseek-reasoner to its thinking mode. The two are the same weights rendered with different chat templates, not different checkpoints, and no temperature setting flips the mode.",
      },
      {
        id: "v31-q2",
        prompt:
          "Why can V3.1 offer two behaviors without shipping two models?",
        options: [
          "The router loads a different LoRA adapter per request",
          "The chat template decides whether reasoning tokens are generated, and both modes share one set of weights",
          "Thinking mode uses a larger context window than the non-thinking mode",
          "Non-thinking mode is the base model and thinking mode is a distilled copy stored in the same file",
        ],
        answer: 1,
        explanation:
          "The release and model card describe hybrid inference as a chat-template change over one model. Both modes support 128K context, and there is no per-mode adapter or second copy of the weights involved.",
      },
      {
        id: "v31-q3",
        prompt:
          "A team serves a classification endpoint at high QPS with a tight latency budget. Using the cost model from the theory section, what does the router do?",
        options: [
          "Choose thinking mode, because a correct label is worth more than the latency",
          "Choose non-thinking mode, because deliberation multiplies output cost without changing the label space",
          "Choose thinking mode only when the context is longer than 8K tokens",
          "It cannot decide without knowing the model size",
        ],
        answer: 1,
        explanation:
          "Thinking adds output tokens and time; for a short classification the probability gain is small, so the extra cost is not recovered. The mode decision is an economics question about the task and the value of being right, not about context length or parameter count.",
      },
      {
        id: "v31-q4",
        prompt:
          "What did the 840B-token continued pretraining of V3.1-Base primarily target?",
        options: [
          "Teaching the model new mathematics",
          "Long-context extension on top of the V3 checkpoint, with an updated tokenizer and template",
          "Reducing the parameter count from V3",
          "Replacing MLA with a sparse attention mechanism",
        ],
        answer: 1,
        explanation:
          "The release describes V3.1-Base as V3 continued for 840B tokens specifically for long-context extension, plus a new tokenizer config and chat template. Sparse attention arrives later, in V3.2-Exp, and the parameter count is unchanged from V3.",
      },
      {
        id: "v31-q5",
        prompt:
          "Which change most directly lowers the cost of plugging V3.1 into an existing agent framework?",
        options: [
          "The 128K context window",
          "An Anthropic-format API and strict function calling in the beta API",
          "The lower off-peak API prices",
          "The new tokenizer configuration",
        ],
        answer: 1,
        explanation:
          "Agent frameworks of the time already spoke the Anthropic or OpenAI tool-calling shapes. Shipping an Anthropic-compatible endpoint and strict function calling lets those frameworks switch with minimal code. Context length helps agents, but compatibility is what removes integration work.",
      },
    ],
    practice: {
      articles: ["art-post-training"],
      problems: ["rl-306"],
    },
  },
  {
    id: "deepseek-v3-2-exp",
    slug: "deepseek-v3-2-exp",
    title:
      "DeepSeek-V3.2-Exp: Boosting Long-Context Efficiency with DeepSeek Sparse Attention",
    short: "DeepSeek-V3.2-Exp",
    year: 2025,
    date: "2025-09-29",
    url: "https://github.com/deepseek-ai/DeepSeek-V3.2-Exp/blob/main/DeepSeek_V3_2.pdf",
    kind: "report",
    era: "frontier",
    tier: "core",
    tagline:
      "A lightning indexer scores every past token with a few cheap heads, keeps the top 2048, and lets the main attention read only those: quadratic becomes O(L k).",
    whatItIs:
      "DeepSeek-V3.2-Exp is the September 29, 2025 experimental release that attaches DeepSeek Sparse Attention (DSA) to V3.1-Terminus by continued training. DSA has two parts: a lightning indexer - a small set of indexer heads running in FP8 that scores each query against every preceding token - and a fine-grained selector that keeps the top 2048 key-value entries per query, shared across query heads. The main attention then runs only over the selected entries, so its cost drops from O(L^2) to O(L k). DeepSeek deliberately aligned training with V3.1-Terminus and reports benchmark parity, plus API prices cut by more than 50%. The release includes an open technical report, model weights, and the indexer and sparse-attention kernels in TileLang and CUDA (DeepGEMM and FlashMLA). A later, expanded write-up appeared as the DeepSeek-V3.2 report on arXiv (2512.02556), describing the same architecture.",
    theoryMinutes: 16,
    lineage: {
      from: "deepseek-v3-1",
      to: ["deepseek-v3-2"],
      context:
        "V3.1 stabilized the hybrid model and long context; the next cost wall was attention itself. V3.2-Exp is explicitly an experimental step toward the next architecture: it keeps the same MoE backbone and MLA and changes only how attention reads the cache, so the delta from V3.1-Terminus is measurable.",
      improved: [
        "Introduces DeepSeek Sparse Attention, reducing core attention complexity from O(L^2) to O(L k) with k = 2048 selected entries per query.",
        "Adds a lightning indexer that scores tokens in FP8 with few heads and ReLU, keeping selection cheap enough to run every layer at every step.",
        "Aligns the sparse model's training configuration with V3.1-Terminus so benchmark parity can be read as the price of sparsity rather than a confound of extra training.",
        "Cuts API prices by more than 50% on release day, the first public evidence that the sparsity translates into serving cost.",
        "Releases the kernels (TileLang prototyping plus CUDA in DeepGEMM and FlashMLA) so outside teams can reproduce the efficiency claims.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Why attention cost grows with context",
        text: "Self-attention compares every query with every earlier key. Doubling the context quadruples the number of query-key pairs in the core computation, and the KV cache you must hold - and, while decoding, stream from memory - grows linearly with context on top of that. The two phases fail differently: training and prefilling are compute-bound (arithmetic dominates), while autoregressive decoding is memory-bound (each token costs a pass over the KV cache). Sparse attention attacks both by reading fewer keys, but only if the choice of which keys to read is cheap and hardware-friendly, otherwise you pay the selection cost and save nothing.",
      },
      {
        kind: "prose",
        heading: "Post-hoc sparsity versus native sparsity",
        text: "One family of methods takes a trained dense model and, at inference time, guesses which keys matter - attention sinks, recent windows, heuristic scores. These are easy to deploy and fragile: the model was never told it would be evaluated under that mask, and the heuristic competes with the learned attention pattern. The other family trains the sparsity into the model, so selection and attention co-adapt. The Native Sparse Attention research line made this case first; DSA is the production descendant, and it adds a twist: rather than training the selection mechanism from scratch end to end, it trains a dedicated indexer to approximate the main attention distribution, then uses that indexer to select at serving time.",
      },
      {
        kind: "formula",
        label: "The complexity DSA changes",
        expression:
          "dense core attention:  O(L^2 * d)\nDSA core attention:    O(L * k * d)        with k = 2048\nindexer:               O(L^2 * H_I * d_I) with H_I small and FP8 arithmetic",
        why: "L is the context length, d the head dimension, k the number of selected entries per query. The core attention cost becomes linear in L for fixed k, which is what makes million-token ambitions conceivable. Note what does not change: the indexer still compares each query with every key, so it is quadratic. It is affordable only because it runs with a handful of heads (and a small indexer head dimension) in FP8 - the point of the design is that you pay twice for keys, once cheaply and once expensively, and only the expensive pass is sparse.",
      },
      {
        kind: "prose",
        heading: "The lightning indexer",
        text: "For each query token, the indexer computes a score against every preceding token: a sum over a small number of indexer heads of a learned per-head weight times a ReLU (a rectifying activation that zeroes negative values) of the indexer query-key dot product. ReLU is chosen for throughput - it needs no softmax normalization and runs well in low precision - and the whole module is small enough to execute in FP8. The top 2048 scoring entries are kept for that query, and crucially the selection is shared across all query heads, which allows a single gather of KV entries instead of one per head. The design is a purpose-built approximation of the question 'which keys would dense attention have cared about?', answered cheaply enough to run everywhere.",
      },
      {
        kind: "prose",
        heading: "How the selector learns to be right",
        text: "Selection is a discrete operation, so you cannot backpropagate through 'which 2048 tokens were kept' in the obvious way. DSA's answer: supervise the indexer directly. The indexer's input is detached from the main computation graph, and it receives its own training signal that aligns its scores with the attention distribution the main model would have produced; the main model keeps training on the language-modeling loss alone. This decouples the two problems - attention quality and selection quality - and gives each a clean gradient. In the reported stage, the model selects 2048 entries per query, trains for 15000 steps of 480 sequences at 128K tokens (about 943.7B tokens) at a learning rate of 7.3e-6, and both the main model and the indexer are updated.",
      },
      {
        kind: "prose",
        heading: "Sparsity that survives contact with kernels",
        text: "A sparse pattern that ignores GPU memory hierarchies loses its theoretical win. Two decisions make DSA's sparsity real: the selection happens at entry granularity over the MLA latent, which is shared across query heads (the MQA, multi-query attention, mode of MLA), so one gather serves many queries; and the released kernels - indexer logits in DeepGEMM, sparse attention in FlashMLA, with TileLang versions for research - are built for that shared-entry pattern. DeepSeek also notes a subtle numerical trap found later: the indexer's RoPE (rotary position embedding) needs a non-interleaved layout while MLA's RoPE uses an interleaved one, and the original demo code mixed them up, degrading performance until a November 17, 2025 fix. That is worth remembering: in sparse attention, the selector is part of the model, and a bug in the selector is a quality bug, not just an efficiency bug.",
      },
      {
        kind: "code",
        title: "Top-k selection as a mask",
        language: "python",
        code: `def index_scores(q, k, w):
    """q: [H_i, d_i] indexer query, k: [L, d_i] indexer keys,
    w: [H_i] learned per-head weights. ReLU keeps it cheap in FP8."""
    total = [0.0] * len(k)
    for h in range(len(w)):
        for s in range(len(k)):
            dot = sum(q[h][i] * k[s][i] for i in range(len(q[h])))
            total[s] += w[h] * max(0.0, dot)
    return total

def topk_mask(scores, k=2048):
    """Keep the k highest-scoring entries; every other position gets -inf."""
    order = sorted(range(len(scores)), key=lambda s: scores[s], reverse=True)
    keep = set(order[:k])
    return [0.0 if s in keep else float("-inf") for s in range(len(scores))]

# the mask is added to the attention logits, so unselected keys vanish after
# softmax: attention reads k entries per query instead of all L.`,
        notes: [
          "This is the concept, not the kernel: a real implementation keeps scores in FP8, selects with a radix Top-K, and reuses the selection across query heads and layers.",
          "Selection is per query token, so queries do not share masks in the general case - though all query heads of one token do share the selected KV entries.",
          "If L <= k, every past token is kept and selection is a no-op; production kernels special-case this with a dense fast path.",
        ],
      },
      {
        kind: "visual",
        visual: "sparse-attention",
        caption:
          "DeepSeek Sparse Attention: the lightning indexer scores all past tokens cheaply, the top 2048 entries per query are gathered across the shared MLA latent, and the core attention reads only those entries.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the report sets out to solve",
        text: "Long-context training and serving were dominated by attention cost. The experiment asks a narrow question with a clean comparison: if you bolt a trainable sparse attention onto an unchanged backbone by continued training, how much efficiency do you buy and how much quality do you pay?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two modules and one alignment strategy. The indexer (small, FP8, ReLU, few heads) produces scores; the selector keeps the top k entries per query; the training configuration is deliberately aligned with V3.1-Terminus so differences read as the effect of sparsity. Look for the detached-indexer training scheme and the choice to instantiate DSA under the MQA mode of MLA.",
      },
      {
        kind: "prose",
        heading: "Evidence the report and release muster",
        text: "Parity with V3.1-Terminus across public benchmarks while cutting price by more than 50% at the API. Training details: k = 2048, 15000 steps x 480 sequences x 128K tokens per step, about 943.7B tokens, learning rate 7.3e-6. The complexity reduction O(L^2) to O(L k) is argued from the architecture and supported by deployed-service cost curves in the report; kernels for indexer logits and sparse attention ship in open source. The follow-up V3.2 report on arXiv keeps the same architecture and extends the story to RL training and agentic tasks, including gold-medal-level IMO and IOI results for its Speciale variant under the 2025 contest conditions.",
      },
      {
        kind: "prose",
        heading: "Limits admitted and visible",
        text: "The indexer is still quadratic in context length; only the main attention is linear, so the savings are a constant factor that grows with L but never eliminates the L^2 term. Efficiency gains depend on the released kernels and on the shared-entry (MQA) layout - a different implementation can lose them. Benchmark parity is vendor reported, and an experimental model that is 'on par' is a cost optimization, not a capability jump. The November 2025 RoPE-layout fix shows that the indexer's numerical details are easy to get subtly wrong. And the report's most honest signal is structural: the flagship claimed quality came from continued training on an existing model, not from training sparse attention from scratch.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When you add sparsity, separate the question 'what should be read' from 'how should it be read'. Make the selector cheap (few heads, low precision), train the selector against the signal it is approximating, and keep the main model's objective untouched. Then verify the win end to end, because arithmetic intensity and memory layout decide whether theoretical sparsity becomes wall-clock speed.",
      },
    ],
    questions: [
      {
        id: "v32-q1",
        prompt:
          "DSA reduces core attention cost from O(L^2) to O(L k). What remains quadratic?",
        options: [
          "The KV cache size",
          "The lightning indexer, which still scores each query against every preceding token",
          "The MoE routing",
          "Nothing; the whole model becomes linear",
        ],
        answer: 1,
        explanation:
          "The indexer compares each query with all preceding keys to produce scores, so it is O(L^2) arithmetic - just with a small number of heads and a small head dimension in FP8. The design accepts that cheap quadratic pass because the expensive attention pass is now O(L k) with k = 2048.",
      },
      {
        id: "v32-q2",
        prompt:
          "Why does DSA instantiate its sparse attention under the MQA mode of MLA?",
        options: [
          "MQA improves accuracy on long-context benchmarks",
          "It lets one gathered key-value entry serve all query heads, which is what makes the sparse kernel efficient",
          "MQA removes the need for an indexer",
          "It shrinks the vocabulary",
        ],
        answer: 1,
        explanation:
          "Kernel efficiency requires each key-value entry to be shared across queries, as the report states. Under MQA, one latent vector is the key-value entry for all query heads, so a single top-k gather is reused by every head instead of gathering per head.",
      },
      {
        id: "v32-q3",
        prompt:
          "How is the indexer trained, given that top-k selection is not smoothly differentiable?",
        options: [
          "By reinforcement learning with a sparsity reward",
          "By aligning its scores with the main attention distribution using its own loss, with its input detached from the main graph",
          "By freezing it after random initialization",
          "By labeling the correct tokens with human annotations",
        ],
        answer: 1,
        explanation:
          "The report detaches the indexer's input from the main computation graph and trains it with a dedicated objective that aligns its outputs with the main attention distribution. The main model is optimized only by the language-modeling loss, so the two objectives stay separate.",
      },
      {
        id: "v32-q4",
        prompt:
          "A serving stack applies DSA with k = 2048 to sequences of 1024 tokens. What happens in the selector?",
        options: [
          "The indexer still selects 2048 entries because k is fixed",
          "All past tokens are inherently selected, so the top-k computation is redundant and can be skipped",
          "Attention becomes quadratic again and correctness breaks",
          "The model falls back to dense attention silently",
        ],
        answer: 1,
        explanation:
          "With a sequence at or below k, the top-2048 set is the whole history. Production implementations add a fast path that skips the indexer and Top-K when the sequence is short, since the sparse mask would be all-keep anyway.",
      },
      {
        id: "v32-q5",
        prompt:
          "The November 17, 2025 note about RoPE in the indexer warns implementers that...",
        options: [
          "RoPE cannot be used together with sparse attention",
          "The indexer needs a non-interleaved RoPE layout while MLA uses an interleaved one, and mixing them degrades quality",
          "The indexer must run in bf16, not FP8, when RoPE is enabled",
          "RoPE should be removed from the main attention instead",
        ],
        answer: 1,
        explanation:
          "The note says the indexer's RoPE input requires a non-interleaved layout whereas MLA's RoPE expects interleaved, and earlier demo code mixed them up, degrading model performance. It was fixed in the updated inference code.",
      },
      {
        id: "v32-q6",
        prompt:
          "Why did DeepSeek align V3.2-Exp's training configuration with V3.1-Terminus?",
        options: [
          "To reuse the tokenizer without modification",
          "So benchmark differences between the two models can be attributed to sparsity rather than to a different training recipe",
          "Because sparse attention cannot be trained from scratch",
          "To keep the checkpoint file size identical",
        ],
        answer: 1,
        explanation:
          "The release states the alignment was deliberate so the impact of sparse attention could be evaluated rigorously: with everything else held fixed, on-par benchmarks mean the efficiency came at no measurable quality cost.",
      },
    ],
    practice: {
      articles: ["art-attention", "art-kv-cache"],
      problems: ["dl-210", "dl-308", "dl-386", "dl-075"],
    },
  },
  {
    id: "native-sparse-attention",
    slug: "native-sparse-attention",
    title:
      "Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention",
    short: "Native Sparse Attention",
    year: 2025,
    date: "2025-02-16",
    arxivId: "2502.11089",
    url: "https://arxiv.org/abs/2502.11089",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Make sparsity part of training, not a mask applied after: three attention branches, a learned gate, and kernels that read memory the way the hardware wants.",
    whatItIs:
      "NSA is the DeepSeek-AI research paper that asks what sparse attention would look like if it were designed into training and into the GPU from the start. Each query reads three paths: compressed coarse blocks that summarize global context, top-n selected fine-grained blocks, and a sliding window for local detail, combined by learned scalar gates. All components are trainable, so there is no auxiliary loss and no train/inference mismatch. The paper pretrains a 27B-parameter GQA (grouped-query attention) plus MoE model (3B activated) on 270B tokens at 8K length with NSA throughout, then continues at 32K with YaRN, and reports parity or better against a full-attention baseline on general, long-context, and reasoning evaluations, with up to 9.0x forward, 6.0x backward, and 11.6x decoding speedups at 64K context in Triton kernels on A100 GPUs. DSA in DeepSeek-V3.2 is the production descendant of this line.",
    theoryMinutes: 16,
    lineage: {
      from: "deepseek-v3",
      to: ["deepseek-v3-2-exp"],
      context:
        "NSA is a research satellite rather than a model release: it uses the DeepSeekMoE substrate and the author group around the V3 effort, but it does not replace V3. Its value in this curriculum is as the trainable-sparse-attention line that the production DSA mechanism in V3.2-Exp later adapts to serving.",
      improved: [
        "Trains sparse attention end to end from scratch instead of applying sparsity only at inference, so selection and attention co-adapt.",
        "Combines three complementary paths - compressed blocks, selected blocks, sliding window - fused by learned gates, avoiding the global-awareness loss of pure local or pure selection patterns.",
        "Designs selection at block granularity and loads each block once per GQA group, converting theoretical sparsity into measured memory-bandwidth savings.",
        "Reports up to 9.0x forward, 6.0x backward, and 11.6x decoding speedup at 64K context in Triton on A100, with speedups growing with sequence length.",
        "Shows a 27B/3B model pretrained with NSA matches or exceeds a full-attention baseline on general, long-context, and chain-of-thought evaluations.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Attention is dense by construction, sparse in practice",
        text: "Softmax attention computes a weight for every query-key pair, but the learned weights are usually concentrated: a few keys carry most of the output, and many contribute almost nothing. In principle you could skip the near-zero ones. In practice three things stop you. First, you have to know which keys matter before you compute the expensive product, and computing a proxy is itself work. Second, skipping keys produces irregular memory access, and GPUs reward contiguous block reads. Third, if you impose a mask the model never trained under, quality drops, so you end up paying for a cheap-looking method that loses accuracy. NSA is a careful answer to all three.",
      },
      {
        kind: "prose",
        heading: "Three paths, learned gates",
        text: "NSA splits each query's attention into paths with different jobs. The compression path groups past tokens into blocks and projects each block into a single summary token, giving a cheap coarse view of the whole history. The selection path keeps the top n blocks of original tokens by importance, preserving fine detail where it matters. The sliding window path reads the most recent w tokens directly, so local continuity and recency never need to survive compression. A small learned scalar gate per path, computed per query position, mixes the three outputs. Because every branch is inside the differentiable graph, the model learns how much to rely on global summary, selected detail, and local context at each position.",
      },
      {
        kind: "formula",
        label: "Gated combination",
        expression:
          "o(t) = g_cmp(t) * Attn_cmp(t) + g_sel(t) * Attn_sel(t) + g_win(t) * Attn_win(t)\nAttn_sel(t) = softmax over the selected blocks only",
        why: "Three attention computations of different granularity, each cheap or local in its own way, summed with per-query weights. Compression gives the model a summary it can always afford to read; selection gives it the ability to zoom into important distant detail; the window guarantees the last w tokens are never summarized away. The gates are learned, so no one has to hand-tune the mixture - the model discovers, position by position, which kind of context it needs.",
      },
      {
        kind: "prose",
        heading: "What 'natively trainable' buys",
        text: "Inference-time sparse methods treat the model as fixed and hope the mask does not hurt. NSA trains with the mask and the compression, so gradients flow into every part of the mechanism: the compression projection learns what to preserve, the selection scoring learns what to pick, and the gates learn the mixture. The paper's practical claims follow from this: no auxiliary losses to tune against the main objective, stable pretraining loss curves, and quality that matches or beats full attention rather than degrading against it. The model also gets training-time speedups, not just inference-time ones, which matters because pretraining is where the largest compute bill sits.",
      },
      {
        kind: "prose",
        heading: "Hardware alignment: why blocks and groups",
        text: "The paper's second contribution is making the sparsity hardware-shaped. Selection happens at block granularity: the top-n set indexes contiguous blocks of keys, which the kernel can load into SRAM with coalesced access, instead of chasing random token indices. Data loading is organized per GQA group: all query heads in a group share the same selected blocks, so the kernel loads each block once for the whole group and keeps arithmetic intensity high. The compression path uses fixed-size segments processed with the same blockwise pattern as FlashAttention-2. These choices are why the measured speedups grow with context length instead of flattening out: the algorithm saves arithmetic, and the kernels convert the saved arithmetic into saved memory traffic.",
      },
      {
        kind: "prose",
        heading: "What the experiments show",
        text: "The backbone is a 27B-parameter model with 3B activated parameters combining GQA and DeepSeekMoE (30 layers, 72 routed experts, 2 shared experts, top-6). Both NSA and the full-attention baseline are pretrained on 270B tokens of 8K text, then continued and fine-tuned at 32K with YaRN. Reported configuration: compression block 32 with stride 16, selected block size 64, 16 selected blocks including one initial and two local fixed blocks, sliding window 512. NSA matches or exceeds full attention on general benchmarks and long-context tasks, and shows up to 9.0x forward and 6.0x backward speedup at 64K in Triton on A100, with decoding at up to 11.6x as memory traffic falls from 65536 equivalent tokens to 5632 at that length.",
      },
      {
        kind: "code",
        title: "Block-granularity top-n selection",
        language: "python",
        code: `def select_blocks(scores, block_size, n, fixed):
    """scores: importance per token, length L. fixed: block indices always kept
    (e.g. the first block and the local blocks). Returns block indices to read."""
    num_blocks = len(scores) // block_size
    block_scores = []
    for b in range(num_blocks):
        start = b * block_size
        window = scores[start:start + block_size]
        # one summary score per contiguous block keeps access coalesced
        block_scores.append(max(window) if window else 0.0)
    ranked = sorted(range(num_blocks), key=lambda b: block_scores[b], reverse=True)
    chosen = set(fixed)
    for b in ranked:
        if len(chosen) >= n:
            break
        chosen.add(b)
    return sorted(chosen)

# The kernel then loads exactly these contiguous blocks into SRAM, once per GQA
# group, which is what turns a theoretical sparsity win into bandwidth savings.`,
        notes: [
          "Block granularity is the hardware-alignment trick: random token indices would break coalesced access and erase the speedup.",
          "The fixed local blocks guarantee recent context survives selection even when the scoring proxy is wrong.",
          "Importance is scored with max-pooling over the block, so a block containing one crucial token cannot be dropped.",
        ],
      },
      {
        kind: "visual",
        visual: "sparse-attention",
        caption:
          "The three NSA paths for one query: compressed coarse blocks for global context, top-n selected blocks for critical detail, and a sliding window for local continuity, fused by learned per-position gates.",
      },
      {
        kind: "prose",
        heading: "The honest limits",
        text: "The experiments run at 27B/3B scale on 270B tokens - small by frontier standards - and the speedups are measured with Triton kernels on A100 hardware; other hardware and hand-written kernels can move the numbers. The evaluation suite is the authors' selection. Most importantly, the production path diverged from the purest version of the idea: DSA keeps the top-k selection but replaces end-to-end trained selection with a KL-supervised lightning indexer and applies sparsity to an already trained dense backbone through continued training, because that is what serving constraints and existing checkpoints allowed. NSA is best read as the existence proof that native sparsity can be quality-neutral, and the design space it opened is what later releases mined.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Sparse attention promises large savings and usually fails to deliver either the speedup or the quality, because existing methods are inference-time heuristics bolted onto dense-trained models and because irregular sparse access does not match GPU memory behavior. Can sparsity be designed into training and into the kernel at the same time?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three parallel attention paths with learned gates (Section 2), and the kernel design that makes block selection and GQA-group loading efficient (Section 3 and the appendix). Read the pretraining setup closely: the model trains with NSA throughout rather than upcycling a dense checkpoint, which is the 'native' in the title.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "A 27B/3B GQA+MoE model pretrained on 270B tokens of 8K text and continued at 32K with YaRN, compared against an identically trained full-attention baseline: parity or better on general benchmarks, long-context evaluations, and chain-of-thought reasoning. Kernel measurements in Triton on A100 at 64K context: up to 9.0x forward, 6.0x backward, and 11.6x decoding speedup, with decode memory access falling from 65536 to 5632 equivalent tokens. Published at ACL 2025.",
      },
      {
        kind: "prose",
        heading: "Limits the paper and its sequel admit",
        text: "The scale is a research model, not a frontier one; speedups are backend- and hardware-specific; benchmarks are author-selected. The production adaptation in V3.2-Exp changed two important things - supervised indexer training instead of fully learned selection, and continued training instead of from-scratch native training - which is itself evidence about where pure native sparsity was hard to deploy.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you are going to skip work, make skipping part of the model and part of the kernel. Train the selector with the attention, keep a cheap always-on path for global and local context so nothing catastrophic is missed, and choose access patterns (contiguous blocks, shared groups) that the hardware can actually exploit. Quality-neutral sparsity is possible; it is an architecture and systems problem at once.",
      },
    ],
    questions: [
      {
        id: "nsa-q1",
        prompt:
          "What does 'natively trainable' mean for NSA?",
        options: [
          "The sparse pattern is computed once and frozen before training",
          "Compression, selection, and gating are all differentiable and trained end to end with the model",
          "The model is converted to sparse attention only during fine-tuning",
          "Training uses a hand-written CUDA kernel that cannot be reproduced",
        ],
        answer: 1,
        explanation:
          "NSA puts every component of the sparse mechanism inside the training graph, so the model learns what to compress, what to select, and how to weight the three paths. No auxiliary loss or inference-time heuristic is needed, and there is no train/inference mismatch.",
      },
      {
        id: "nsa-q2",
        prompt:
          "Why does NSA keep a sliding window branch in addition to compression and selection?",
        options: [
          "To guarantee local continuity and recency even when compression and selection both fail",
          "Because selection cannot operate on blocks smaller than the window",
          "To replace the compression branch on short sequences",
          "To avoid computing attention scores entirely",
        ],
        answer: 0,
        explanation:
          "The window is the always-on local path: the most recent tokens are read uncompressed, so recent context and local patterns never depend on the quality of a proxy score. Compression handles the global summary, selection handles distant detail.",
      },
      {
        id: "nsa-q3",
        prompt:
          "Why does NSA select contiguous blocks rather than individual tokens?",
        options: [
          "Blocks reduce the number of attention heads needed",
          "Contiguous blocks allow coalesced memory access and SRAM-friendly loading, which is what converts arithmetic savings into wall-clock speedups",
          "Individual tokens cannot be ranked by importance",
          "Block selection removes the need for softmax",
        ],
        answer: 1,
        explanation:
          "GPUs are built for dense, blockwise reads. Random token indices break coalescing and add memory latency that eats the savings. Block selection keeps access contiguous, and loading each block once per GQA group keeps arithmetic intensity high.",
      },
      {
        id: "nsa-q4",
        prompt:
          "NSA reports a larger speedup for decoding (11.6x) than for forward passes (9.0x) at 64K. Why?",
        options: [
          "Decoding uses lower-precision arithmetic",
          "Decoding is memory-bound: its cost tracks how much KV cache is loaded, and NSA cuts the loaded volume from full context to a few thousand equivalent tokens",
          "The backward pass cannot be sparsified",
          "Decoding skips the compression branch",
        ],
        answer: 1,
        explanation:
          "During decoding, latency is dominated by memory traffic, not arithmetic. The paper's table shows memory access per attention operation falling from 65536 equivalent tokens to 5632 at 64K, and speedup tracks that reduction. Forward and backward are compute-bound, so they benefit less.",
      },
      {
        id: "nsa-q5",
        prompt:
          "What design difference separates DSA in V3.2 from the original NSA approach?",
        options: [
          "DSA removes selection entirely and uses only compression",
          "DSA supervises a lightning indexer to approximate the main attention distribution instead of training selection fully end to end, and continues training an existing dense backbone",
          "DSA trains sparse attention from scratch at 27B scale",
          "DSA uses dense attention and no sparsity",
        ],
        answer: 1,
        explanation:
          "V3.2 keeps the top-k idea but adapts it to serving: a dedicated indexer is trained against the attention distribution (with its input detached), and DSA is attached to V3.1-Terminus through continued training rather than trained from scratch. That is NSA's ideas reshaped by production constraints.",
      },
    ],
    practice: {
      articles: ["art-attention", "art-kv-cache"],
      problems: ["dl-123", "dl-124", "dl-210", "dl-186"],
    },
  },
  {
    id: "deepseek-v4",
    slug: "deepseek-v4",
    title:
      "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence",
    short: "DeepSeek-V4",
    year: 2026,
    date: "2026-04-24",
    arxivId: "2606.19348",
    url: "https://arxiv.org/abs/2606.19348",
    kind: "report",
    era: "frontier",
    tier: "core",
    tagline:
      "A million tokens as the default: compress the cache, select sparsely, and keep the residual stream stable with manifold-constrained hyper-connections.",
    whatItIs:
      "DeepSeek-V4 is the April 24, 2026 preview release that makes one-million-token context routine. Two MoE models ship: V4-Pro with 1.6T parameters (49B activated) and V4-Flash with 284B (13B activated). The architecture keeps the DeepSeekMoE framework and multi-token prediction from V3 and adds three things: a hybrid attention that interleaves Compressed Sparse Attention (CSA, which compresses the KV cache along the sequence and then runs DSA over the compressed entries) with Heavily Compressed Attention (HCA, which compresses much more aggressively and keeps dense attention); Manifold-Constrained Hyper-Connections (mHC), which replace plain residual connections with several parallel streams mixed by a doubly stochastic matrix; and the Muon optimizer. Pretraining covers more than 32T tokens (32T for Flash, 33T for Pro). At 1M-token context, V4-Pro needs only 27% of single-token inference FLOPs and 10% of the KV cache of V3.2. Post-training cultivates domain experts and consolidates them by on-policy distillation; V4-Pro-Max is the maximum reasoning-effort mode. Weights are open, and the API offers V4-Pro and V4-Flash in thinking and non-thinking modes with 1M context.",
    theoryMinutes: 17,
    lineage: {
      from: "deepseek-v3-2",
      to: ["deepseek-v4-1-flash"],
      context:
        "V3.2-Exp proved that sparse attention could be attached to a production backbone with parity; the V3.2 report then spent the year's remaining budget on RL and agentic data over that architecture. V4 asks the next question: if the goal is a million tokens, top-k selection over a full-resolution cache is not enough - the cache itself must shrink - so the attention story becomes compression plus sparsity, and the residual stream gets rebuilt for stability at depth.",
      improved: [
        "Raises supported context to one million tokens for both models and cuts single-token inference cost at 1M context to 27% of the FLOPs and 10% of the KV cache versus V3.2 for V4-Pro, and to 10% / 7% for V4-Flash.",
        "Replaces plain attention with hybrid CSA plus HCA layers, where CSA compresses then selects and HCA keeps a heavily compressed dense view of the whole context.",
        "Introduces mHC, widening the residual stream into parallel streams mixed by a doubly stochastic matrix so signal propagation stays non-expansive across deep stacks.",
        "Switches the optimizer to Muon for faster convergence and stability, and moves routed expert weights to FP4 in the instruct checkpoints.",
        "Adds a two-stage post-training pipeline - specialized domain experts consolidated by on-policy distillation - with a maximum reasoning-effort mode (V4-Pro-Max).",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What actually breaks at a million tokens",
        text: "Two costs scale with context, and they fail in different places. Attention compute grows with the number of query-key pairs, so pretraining and prefilling pay quadratically. KV cache memory grows linearly with context per layer and head, so decoding - which is memory-bound - pays for every cached token it must stream on every step. At a million tokens the memory term is the one that decides whether a service exists at all: you cannot hold hundreds of gigabytes of cache per request and also batch. V4's design responds to both terms at once, and the reported numbers are stated in exactly those units: percent of single-token inference FLOPs and percent of KV cache versus V3.2.",
      },
      {
        kind: "prose",
        heading: "CSA: compress first, then select",
        text: "Compressed Sparse Attention starts by shrinking the sequence dimension: groups of consecutive KV entries are projected into a single compressed entry, with overlapping windows so information at block boundaries is not lost. That alone cuts the cache by the compression rate. Then DSA - the top-k lightning-indexer selection from V3.2 - runs over the compressed entries, so the main attention reads only a few thousand compressed entries per query instead of the whole history. The two operations attack different terms: compression shrinks what must be stored, selection shrinks what must be read. This is the direct lineage move from V3.2-Exp: the same selector, now pointed at a coarser cache.",
      },
      {
        kind: "prose",
        heading: "HCA: a dense, heavy summary",
        text: "Heavily Compressed Attention takes the other extreme. It compresses the KV cache far more aggressively - a much larger compression rate than CSA, without overlapping windows - and then keeps attention dense over the compressed entries, with no indexer at all. The design bet is that a very coarse global view is cheap enough to read in full, and that fine detail is better handled by the uncompressed sliding-window path concatenated alongside it. CSA and HCA are interleaved across layers: some layers get fine-grained sparse attention, others get a coarse global summary. This interleaving is the hybrid: instead of one attention recipe for all layers, the stack mixes two cost profiles with different jobs.",
      },
      {
        kind: "formula",
        label: "Compression and selection",
        expression:
          "compressed entries:  n_comp = n / m\nCSA: small m, overlapping windows, then top-k selection of compressed entries\nHCA: large m, no overlap, dense attention over all n_comp entries\nKV cache: n_comp * entry_size instead of n * entry_size",
        why: "n is the sequence length and m the compression rate. Compressing by m divides both the cache size and the number of entries attention can read. CSA then pays a second constant - the top-k selection over compressed entries - to read only k of them; HCA skips selection and reads all n/m, which is affordable because m is large and the read is dense and hardware-friendly. The layer pattern decides how much of each you pay, and the reported end-to-end result at 1M context is the sum of those choices.",
      },
      {
        kind: "prose",
        heading: "mHC: making the residual stream safe at depth",
        text: "Residual connections are the reason deep transformers train at all: the identity path lets a signal reach layer 60 without being multiplied by sixty arbitrary matrices. Hyper-Connections generalize this by widening the residual stream into several parallel streams, with learned matrices deciding how to read from the streams into a layer, how to mix the streams forward, and how to write the layer output back. That buys expressivity but breaks the identity guarantee: the forward mix matrix is now learned and unconstrained, and at scale the multiplication of many such matrices amplifies or attenuates signals, which is training instability. mHC constrains the mix matrix to the manifold of doubly stochastic matrices (the Birkhoff polytope). Every row and column sums to one, so the spectral norm is bounded by one: the residual transformation can mix and rotate but never expand. The set is closed under multiplication, so the bound survives arbitrary depth, and the read/write maps are squashed through a sigmoid to keep them non-negative and bounded.",
      },
      {
        kind: "formula",
        label: "The mHC residual update",
        expression:
          "X(l+1) = B(l) X(l) + C(l) F(l)(A(l) X(l))\nB(l) is doubly stochastic:  B >= 0,  B 1 = 1,  1^T B = 1^T",
        why: "X(l) is a small stack of parallel residual streams, A(l) reads one d-dimensional vector into layer F, C(l) writes the layer output back into the streams, and B(l) mixes the streams forward. The doubly stochastic constraint on B makes the forward path a convex combination of the streams: the average signal across streams is conserved and the norm cannot grow, so the identity-mapping property that plain residuals give for free is restored in the generalized setting. During training, B is projected back onto the manifold with Sinkhorn-Knopp iterations, which is differentiable and cheap because the stream count is small.",
      },
      {
        kind: "prose",
        heading: "The rest of the training stack",
        text: "V4 keeps DeepSeekMoE routing and multi-token prediction from V3 with only minor adjustments, and changes the optimizer to Muon for faster convergence and greater stability - a natural pairing with mHC, since both are about keeping trillion-parameter training well-conditioned. Precision is mixed: base checkpoints are FP8 throughout, while instruct checkpoints use FP4 for routed expert parameters and FP8 for most of the rest, with the report noting that FP4 x FP8 peak throughput on then-current hardware matched FP8 x FP8 but was expected to improve on future silicon. Pretraining ran on 32T tokens for V4-Flash and 33T for V4-Pro; the models support 1M context natively after pretraining rather than through a late extension stage.",
      },
      {
        kind: "prose",
        heading: "Post-training: specialists, then one student",
        text: "The post-training pipeline has two stages. First, domain experts are cultivated independently - math, coding, agentic tasks, instruction following - each starting from SFT and then RL with GRPO against reward models tailored to that domain. Then the experts are consolidated into one deployable model by on-policy distillation: the unified model is the student, the domain experts are teachers, and training minimizes a reverse KL loss on the student's own rollouts. This is a clean answer to the old tension between specialists and a single generalist: train specialists where reward design is easy, then transfer their behavior into one set of weights. The reasoning-effort modes, including V4-Pro-Max, then expose how much test-time computation to spend per request.",
      },
      {
        kind: "code",
        title: "Compress, then select - CSA in miniature",
        language: "python",
        code: `def csa_forward(entries, m=4, topk=2):
    """entries: KV vectors along the sequence. Compress overlapping groups of
    size m, then keep the top-k compressed entries per query."""
    compressed = []
    stride = max(1, m // 2)          # overlap so boundaries are not lost
    for start in range(0, len(entries) - m + 1, stride):
        block = entries[start:start + m]
        compressed.append([sum(v[i] for v in block) / m for i in range(len(block[0]))])

    query = entries[-1]
    scores = [sum(a * b for a, b in zip(query, c)) for c in compressed]
    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    selected = order[:topk]          # per query, shared across query heads
    return [compressed[i] for i in selected]

# The cache stores compressed entries, not originals: memory drops by the
# compression rate, and attention reads top-k entries instead of all of them.`,
        notes: [
          "Real CSA learns the compression weights rather than averaging, and HCA uses a much larger compression rate with no overlap and dense attention over everything.",
          "Selection happens on compressed entries, which is why the cache and the read set shrink together.",
          "The sliding-window branch keeps recent uncompressed entries for local detail; the snippet omits it for brevity.",
        ],
      },
      {
        kind: "visual",
        visual: "sparse-attention",
        caption:
          "V4's hybrid attention: CSA compresses the sequence dimension and then selects top-k compressed entries; HCA compresses far more aggressively but attends densely over the coarse summary; interleaved layers mix both cost profiles.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the report sets out to solve",
        text: "Long-horizon agents and cross-document analysis want contexts far beyond what attention and the KV cache can serve affordably. The report asks what a frontier model looks like when a million tokens is the design point rather than an extension: attention that compresses as well as selects, a residual scheme that stays stable at depth and scale, and a training stack to match.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three axes, one target. Section 2 covers the hybrid CSA plus HCA attention and mHC; the compression math is where the efficiency comes from. The optimizer and infrastructure sections explain why the recipe trains. The post-training section is where the model becomes deployable: specialist cultivation plus on-policy distillation, and the reasoning-effort modes.",
      },
      {
        kind: "prose",
        heading: "Evidence the report musters",
        text: "Reported efficiency at 1M context: V4-Pro at 27% of V3.2's single-token inference FLOPs and 10% of its KV cache; V4-Flash at 10% of the FLOPs and 7% of the KV cache. Pretraining on 32T (Flash) and 33T (Pro) tokens; both models natively support 1M context. Open checkpoints for Pro and Flash, base and instruct, at FP8 (base) and FP4 plus FP8 (instruct). The report positions V4-Pro-Max as defining open-model state of the art, and the release note claims agentic-coding leadership among open models and world knowledge trailing only one named closed model. The Hugging Face community blog independently describes the headline as 'benchmark numbers competitive, but not SOTA', with the real innovation being efficient long-context support for agentic work.",
      },
      {
        kind: "prose",
        heading: "Limits and open questions",
        text: "This is a preview release: DeepSeek itself calls the series a preview, and the GA rollout of V4-Pro and the multimodal variant followed months later. Headline capability comparisons are vendor reported with selected benchmarks; the efficiency ratios, while stated in precise units, come from DeepSeek's own estimates of equivalent FP8 FLOPs rather than a third-party audit. Many architectural details (how many layers of each attention type, exact compression rates) live in the report rather than the release note, and mHC's stability argument leans on a companion paper. The API transition also carries real cost: the long-standing deepseek-chat and deepseek-reasoner names were retired in favor of V4 model names, with a three-month overlap.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When context grows by an order of magnitude, attack memory and traffic, not just arithmetic: compress what you store and select what you read. Keep a dense coarse path for global awareness so selection mistakes stay survivable. And if you generalize residual connections for expressivity, constrain them so the identity property survives: stability techniques like doubly stochastic mixing and Muon are what make depth at this scale trainable at all.",
      },
    ],
    questions: [
      {
        id: "v4-q1",
        prompt:
          "In V4's hybrid attention, what distinguishes CSA from HCA?",
        options: [
          "CSA is dense and HCA is sparse, with HCA using an indexer",
          "CSA compresses the KV cache along the sequence and then selects top-k entries sparsely; HCA compresses much more aggressively but attends densely, with no indexer",
          "CSA applies only during decoding and HCA only during prefilling",
          "HCA replaces attention with a feed-forward layer",
        ],
        answer: 1,
        explanation:
          "CSA combines compression with DSA-style top-k selection, shrinking both cache and read set. HCA skips selection entirely, using a much larger compression rate and dense attention over the coarse summary. Interleaved across layers, they give the stack both fine sparse detail and a cheap global view.",
      },
      {
        id: "v4-q2",
        prompt:
          "What is the reported efficiency of V4-Pro versus V3.2 at 1M-token context?",
        options: [
          "About 27% of single-token FLOPs and 10% of KV cache",
          "About 10% of FLOPs and 27% of KV cache",
          "About 50% of both",
          "About 3% of FLOPs and 1% of KV cache",
        ],
        answer: 0,
        explanation:
          "The abstract states V4-Pro requires only 27% of single-token inference FLOPs and 10% of KV cache compared with V3.2 at the 1M setting. V4-Flash goes further, to roughly 10% of FLOPs and 7% of KV cache.",
      },
      {
        id: "v4-q3",
        prompt:
          "Why does mHC constrain the residual mix matrix B to be doubly stochastic?",
        options: [
          "So the matrix is invertible at inference time",
          "Its spectral norm is then bounded by 1, making the residual transformation non-expansive, and the set is closed under multiplication so products stay stable at any depth",
          "To make B sparse for faster kernels",
          "Because doubly stochastic matrices are easier to quantize to FP4",
        ],
        answer: 1,
        explanation:
          "Doubly stochastic rows and columns sum to one, so the transform is a convex combination of streams: mean preserved, norm not amplified. The Birkhoff polytope is closed under multiplication, so stacking many layers cannot compound growth - which is what the unconstrained Hyper-Connections version failed to guarantee.",
      },
      {
        id: "v4-q4",
        prompt:
          "Which V3 components does V4 explicitly retain?",
        options: [
          "Multi-head Latent Attention and the dense MLP",
          "The DeepSeekMoE framework and multi-token prediction, with minor MoE adjustments",
          "The FP8-only precision recipe and the legacy chat API names",
          "The Group Relative Policy Optimization objective only",
        ],
        answer: 1,
        explanation:
          "The report says V4 retains DeepSeekMoE and MTP from the V3 line with only minor changes, while replacing MLA-style attention with the CSA/HCA hybrid and residual connections with mHC. GRPO appears in the post-training pipeline, but that is not a V3 architecture component.",
      },
      {
        id: "v4-q5",
        prompt:
          "How are domain specialists consolidated into the final V4 model?",
        options: [
          "By averaging their weights",
          "By mixture-of-experts routing over the specialists at inference",
          "By on-policy distillation: the unified student minimizes a reverse KL loss against the specialist teachers on its own rollouts",
          "By replaying all specialist RL data in a single training run",
        ],
        answer: 2,
        explanation:
          "The pipeline cultivates experts per domain (SFT then RL with GRPO), then trains one unified model as a student of those teachers via on-policy distillation with a reverse KL objective. That merges their behaviors without shipping or routing multiple models at runtime.",
      },
      {
        id: "v4-q6",
        prompt:
          "A team needs a model for 900K-token document analysis on a fixed GPU budget. Per the V4 report, which property matters most?",
        options: [
          "The parameter count of the base checkpoint",
          "KV cache size and per-token inference FLOPs at long context, because memory traffic dominates serving cost",
          "The number of attention heads per layer",
          "The tokenizer vocabulary size",
        ],
        answer: 1,
        explanation:
          "At long context the cache and memory traffic, not parameter count, decide whether a request fits and what it costs. V4's headline numbers are stated exactly in those terms (percent of single-token FLOPs and KV cache versus V3.2) for this reason.",
      },
    ],
    practice: {
      articles: ["art-attention", "art-kv-cache"],
      problems: ["ca-225", "dl-386", "dl-123", "dl-075"],
    },
  },
  {
    id: "deepseek-v4-1-flash",
    slug: "deepseek-v4-1-flash",
    title:
      "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression",
    short: "DeepSeek-V4.1-Flash",
    year: 2026,
    date: "2026-09-10",
    url: "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash",
    kind: "report",
    era: "frontier",
    tier: "core",
    tagline:
      "Split the transformer so input is cheap and output is smart, then squeeze the KV cache to 890 bytes per token: the smallest model in a new architecture family.",
    whatItIs:
      "DeepSeek-V4.1-Flash, released September 10, 2026, is the smallest model of DeepSeek's new architecture family: a multimodal MoE with 552B backbone parameters, a one-million-token context, and native image plus text input. Its core idea is asymmetric compute. A Causal Encoder-Decoder stack (40 layers: a 20-layer causal encoder followed by a 20-layer decoder) projects the decoder's global KV cache from the encoder's final hidden states, so prefill activates only 8B parameters per token while decode activates 16B. On top of that, Compressed Sparse Attention 2 assigns each attention layer a static mode - Full, Reindex, or Reuse - to share KV and indexer state across layers, and a hierarchical sparse indexer bounds deeper indexing cost. With FP4 KV caching, the global cache comes to 890 bytes per token, about a quarter of V4-Flash's, and SWA bounded replay cuts the persistent cache footprint to about an eighth. The model was trained from scratch on 45T multimodal tokens and exposes a continuous reasoning-effort setting. It replaces V4-Flash in the API; the model card and technical report are open, and the weights are MIT licensed.",
    theoryMinutes: 18,
    lineage: {
      from: "deepseek-v4",
      context:
        "V4 made million-token context affordable on paper; V4.1-Flash is the release that turns cache compression into the organizing principle of a whole architecture. It is the first model of what DeepSeek calls a new family, sized small so the same structure can scale up later - with a larger sibling, V4.1-Pro, announced but not yet shipped at release time.",
      improved: [
        "Splits the stack into a causal encoder and decoder so prefill activates 8B parameters per token and decode 16B, making input-heavy agent workloads cheap.",
        "Introduces CSA2 with three static layer modes (Full, Reindex, Reuse) that share main KV and indexer keys across layers and reuse top-k indices, cutting indexer work.",
        "Reduces the global KV cache to 890 bytes per token with FP4 caching - roughly a quarter of V4-Flash's - and, with sliding-window-attention (SWA) bounded replay, cuts the persistent footprint to about an eighth.",
        "Adds native visual understanding, a 196B-parameter Engram conditional memory, and DSpark speculative decoding in one release.",
        "Exposes reasoning effort as a continuous setting from 1 to 100 and cuts API prices, positioning a Flash-tier model against the previous flagship.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The KV cache is the bill",
        text: "In agentic workloads the input side dominates: long documents, long tool traces, long conversations where every turn re-reads the history. Two costs follow. Compute is paid at prefill for every input token, and memory is paid to store the KV cache for the whole context so decoding can read it later. On top of that, providers charge cache-hit input tokens much less than cache misses, so a small cache footprint is not just a GPU memory saving - it is the difference between a cached and an uncached price tier. V4.1-Flash attacks all of it at once: make prefill cheap, make the cache tiny, and make the expensive decode pass read as little as possible.",
      },
      {
        kind: "prose",
        heading: "Asymmetric compute: a causal encoder and decoder",
        text: "The Causal Encoder-Decoder (CED) split is the structural move. The first 20 layers form a causal encoder that processes the input; the last 20 form the decoder that generates. The decoder's global KV cache is projected from the encoder's final hidden states rather than derived from each decoder layer's own hidden states. Because prefilling is input-heavy and decoding is output-heavy, the split lets the model spend fewer parameters per token on the prefill (8B activated) and more on the decode (16B activated). For an agent that ingests a hundred thousand tokens and emits a short tool call, that asymmetry is exactly the right shape: the half of the model that touches most tokens is the cheap half.",
      },
      {
        kind: "prose",
        heading: "CSA2: layer modes and a hierarchical indexer",
        text: "V4.1 keeps the compressed-sparse-attention idea and makes it a per-layer design. Each attention layer is statically assigned one of three modes: Full maintains and writes the main KV and indexer state; Reindex recomputes sparse indices against shared state; Reuse simply reuses the top-k indices computed by an earlier layer. Sharing KV and indexer keys across layers means the cache and the indexer traffic are amortized over more computation. Then a hierarchical sparse indexer narrows the search: the first Full-mode layer constructs a candidate pool, and later indexing layers only score tokens inside that pool, which bounds the indexing cost independently of context length. In a design where the indexer is the remaining quadratic term, bounding it structurally is the important part.",
      },
      {
        kind: "prose",
        heading: "SWA bounded replay: do not store what you can rebuild",
        text: "Sliding-window attention normally creates a storage problem: to serve the next request you must either persist the window KV states to SSD or recompute them. V4.1-Flash chooses recomputation with a bound - SWA bounded replay reconstructs missing sliding-window KV states by replaying only the most recent n_win tokens. Because the window is small and the replay is bounded, the persistent footprint drops to roughly an eighth of V4-Flash's. The general lesson is worth more than the number: if a piece of state is cheap to reconstruct deterministically from a bounded suffix, it does not belong in durable storage at all.",
      },
      {
        kind: "formula",
        label: "Bytes per cached token",
        expression:
          "bytes_per_token = (layers * stored_entries_per_layer * dim_kept * bits_per_value) / (8 * compression)",
        why: "The numerator counts how much must be stored per token; the denominator includes the compression and precision choices. V4.1-Flash drives the result down three ways: sharing KV across layers (fewer stored copies), compressing the sequence dimension (fewer entries), and storing what remains in FP4 with a small per-channel scale (fewer bits). The model card reports the combined result as 890 bytes per token in the global cache, roughly one quarter of V4-Flash. Note what the formula does not include: attention weights, the 196B-parameter Engram memory, and the rest of the fixed model footprint, so the ratio is a statement about the cache, not about total deployment memory.",
      },
      {
        kind: "code",
        title: "Assigning per-layer attention modes",
        language: "python",
        code: `def assign_modes(num_layers, every_full=4):
    """Static schedule: one Full layer writes shared KV and indexer state,
    Reindex layers recompute top-k indices, Reuse layers inherit them."""
    modes = []
    for layer in range(num_layers):
        if layer % every_full == 0:
            modes.append("full")        # writes KV + indexer keys, builds pool
        elif layer % every_full == 1:
            modes.append("reindex")     # scores against shared state, new top-k
        else:
            modes.append("reuse")       # borrows the last top-k indices
    return modes

# print(assign_modes(20))
# ['full', 'reindex', 'reuse', 'reuse', 'full', 'reindex', 'reuse', ...]
# Mode sharing is what amortizes the cache and indexer traffic: not every layer
# pays to store keys or to run the indexer from scratch.`,
        notes: [
          "The schedule here is illustrative; the model card fixes the actual per-layer assignment statically and does not expose it as a runtime dial.",
          "Reuse layers inherit indices, so they cannot recover if the shared candidate pool missed a token - that risk is the price of the saving.",
          "A hierarchical indexer bounds the deeper layers' search to the pool built by the first Full layer, which is where the context-independence of indexer cost comes from.",
        ],
      },
      {
        kind: "prose",
        heading: "Multimodal from the start, plus memory and drafting",
        text: "V4.1-Flash is not a text model with a vision adapter bolted on. A vision encoder (DeepSeek-ViT, trained from scratch with 2D-RoPE and 3x3 pixel-unshuffle downsampling) and a two-layer MLP projector turn images into visual embeddings that are processed jointly with text from the beginning of language-model pretraining. The card also lists two unusual components: Engram, a 196B-parameter conditional memory sparsely accessed by token lookup, and DSpark, a speculative decoding scheme with semi-autoregressive draft generation and confidence-scheduled verification. Both are statements about where the remaining costs are - knowledge that can be looked up rather than recomputed, and cheap draft tokens to hide decode latency.",
      },
      {
        kind: "prose",
        heading: "Reasoning effort as a serving dial",
        text: "The model card exposes a continuously controllable reasoning effort from 1 to 100, with the API surfacing it through effort settings, and all reported instruct numbers use the maximum. This is the V3.1 mode switch evolved into a numeric cost dial: instead of two templates, the caller chooses how much deliberation to buy per request, and the model was trained to behave sensibly across the range. The pretraining story behind it: 45T multimodal tokens, sparse attention trained at 64K sequence length, and context extended to 1M at the 34T-token mark - long context is in the pretraining curriculum, not patched on in post-training.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "KV cache per token across the DeepSeek generations: V4.1-Flash reports 890 bytes per token in the global cache, roughly a quarter of V4-Flash and, on the card's own arithmetic, over 400x below the first-generation V1 baseline.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the report sets out to solve",
        text: "Agentic workloads are input-heavy: they read long contexts, call tools, and repeat, so prefill compute and KV cache memory dominate cost. The report asks what an architecture looks like when cache compression is the primary objective rather than a side optimization, and whether a Flash-tier model built that way can beat the previous flagship on the work agents actually do.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Four mechanisms and their accounting. The CED split (architecture section), CSA2's three layer modes and hierarchical indexer, SWA bounded replay, and FP4 KV caching. Then the pre-training section for the 45T/34T/64K schedule, and the post-training section, which is deliberately plain: standard SFT, RL, and on-policy distillation, with the real work in synthetic agent-task data at scale.",
      },
      {
        kind: "prose",
        heading: "Evidence the report musters",
        text: "Reported cache numbers: 890 bytes per token global KV, about a quarter of V4-Flash and roughly an eighth of its persistent footprint after bounded replay. Activation asymmetry: 8B parameters per token at prefill, 16B at decode. Training: 45T multimodal tokens from scratch, sparse attention at 64K, 1M context extension at 34T. Base-model rows show MMLU-Pro 74.1, HumanEval 79.4, GSM8K 93.0, DocVQA 95.6, MMMU-Pro 56.5. Instruct rows include Codeforces 3471, Terminal-Bench 2.1 90.6, DeepSWE v1.1 74.2, GPQA Diamond 90.9, and HLE with tools 63.9. The release positions it ahead of V4-Pro on several agentic measures while phasing the older flagship toward routing to Flash.",
      },
      {
        kind: "prose",
        heading: "Limits to keep in view",
        text: "All benchmark numbers are vendor reported; as of launch, independent evaluators had not published measurements of the model. The 'ahead of V4-Pro' claim is benchmark-specific: on GPQA Diamond, V4.1-Flash scores 90.9 against V4-Pro's 92.4, and frontier closed models report higher still on the newest terminal-bench tiers. One benchmark number, NL2Repo-Bench, differs between the changelog (65.4) and the model card (64.0) and was not reconciled. The cache reductions are cache reductions: total serving memory also includes weights and the 196B-parameter Engram, so a quarter of the KV cache is not a quarter of the deployment. The naming is also odd - a point release that is a new base model - and V4.1-Pro, the sibling the release implicitly promises, had no published date, weights, or card at release time.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Optimize the half of the stack that touches the most tokens. If prefill dominates your traffic, asymmetric activation is a bigger lever than a smaller model. Share state across layers and bound recomputation, because persistent cache is a storage and price-tier problem, not just a memory problem. And read vendor efficiency ratios carefully: ask per token, per layer, or per deployment, and check which denominator the claim uses.",
      },
    ],
    questions: [
      {
        id: "v41f-q1",
        prompt:
          "In the Causal Encoder-Decoder design, where does the decoder's global KV cache come from?",
        options: [
          "It is derived from each decoder layer's own hidden states",
          "It is projected from the final encoder hidden states",
          "It is copied from the previous request's cache",
          "It is recomputed by DSpark at every decoding step",
        ],
        answer: 1,
        explanation:
          "The model card states the decoder's global KV cache is projected from the encoder's final hidden states, which is what allows the asymmetric activation: 8B parameters per token during prefill and 16B during decode.",
      },
      {
        id: "v41f-q2",
        prompt:
          "Which statement correctly describes CSA2's three layer modes?",
        options: [
          "Full, Reindex, and Reuse are runtime modes the caller selects per request",
          "Each attention layer is statically assigned one mode; Full maintains shared KV and indexer state, Reindex recomputes top-k indices, Reuse reuses earlier indices",
          "The modes control the model's reasoning effort between 1 and 100",
          "Full layers use dense attention, and Reuse layers skip attention entirely",
        ],
        answer: 1,
        explanation:
          "CSA2 assigns a static mode per attention layer to share KV and indexer keys across layers and to reuse top-k sparse-attention indices. Reasoning effort is a separate, request-level dial. Reuse layers still attend, just with inherited indices.",
      },
      {
        id: "v41f-q3",
        prompt:
          "What problem does SWA bounded replay solve?",
        options: [
          "It speeds up the indexer's top-k sort",
          "Instead of persisting sliding-window KV to SSD, it reconstructs missing SWA KV states by replaying only the most recent n_win tokens, cutting the persistent footprint",
          "It replaces RoPE in the vision encoder",
          "It compresses expert weights to FP4",
        ],
        answer: 1,
        explanation:
          "Sliding-window attention otherwise forces you to store window KV or recompute everything. Bounded replay recomputes from a short suffix, avoiding durable storage and reducing the persistent KV cache footprint to about an eighth of V4-Flash's.",
      },
      {
        id: "v41f-q4",
        prompt:
          "The 890 bytes per token figure measures what?",
        options: [
          "Total deployment memory per token, including weights and Engram",
          "The global KV cache footprint per token, roughly a quarter of V4-Flash's",
          "The amount of DRAM needed per user session",
          "The size of the DSpark draft model per token",
        ],
        answer: 1,
        explanation:
          "It is the global KV cache size per token. The card separately lists a 196B-parameter Engram and the model weights, so the cache figure is not a total deployment-memory statement - a distinction independent coverage of the release also flags.",
      },
      {
        id: "v41f-q5",
        prompt:
          "Which honest caveat about V4.1-Flash's benchmark table is supported by the sources?",
        options: [
          "The numbers come from independent third-party evaluators",
          "Flash beats V4-Pro on GPQA Diamond",
          "The numbers are vendor reported without independent audit at launch, and one benchmark (NL2Repo-Bench) differs between the changelog and the model card",
          "The model was withdrawn shortly after release",
        ],
        answer: 2,
        explanation:
          "Coverage at launch notes no independent measurement had been published, and the NL2Repo-Bench figure appears as 65.4 in the changelog and 64.0 in the model card. On GPQA Diamond, Flash (90.9) actually trails V4-Pro (92.4).",
      },
      {
        id: "v41f-q6",
        prompt:
          "A team serves long-document agent tasks where inputs are huge and outputs are short tool calls. Why does V4.1-Flash's asymmetric activation fit?",
        options: [
          "Because it adds more heads to the decoder",
          "Because most tokens flow through the cheaper prefill half (8B activated per token) while the more expensive decode path (16B) handles the short generated output",
          "Because decoding is compute-bound and prefilling is memory-bound",
          "Because the vision encoder runs only during decoding",
        ],
        answer: 1,
        explanation:
          "Input-heavy workloads push most tokens through prefill, so making prefill the cheap half concentrates the compute where it is least needed. Decoding spends more parameters per token, but emits far fewer tokens.",
      },
    ],
    practice: {
      articles: ["art-kv-cache", "art-quantization"],
      problems: ["dl-075", "dl-210", "dl-325", "dl-308", "dl-186"],
    },
  },
  {
    id: "janus",
    slug: "janus",
    title:
      "Janus: Decoupling Visual Encoding for Unified Multimodal Understanding and Generation",
    short: "Janus",
    year: 2024,
    date: "2024-10-17",
    arxivId: "2410.13848",
    url: "https://arxiv.org/abs/2410.13848",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Understanding wants semantic features, generation wants discrete tokens. Use two visual encoders, two adaptors, and keep one transformer in the middle.",
    whatItIs:
      "Janus is DeepSeek's answer to a structural problem in unified multimodal models: a single visual encoder cannot serve both understanding and generation well. Chameleon-style models tokenize images with one VQ (vector-quantized) encoder for both, which starves understanding of semantic features. Janus decouples the paths: images for understanding go through a SigLIP-Large-Patch16-384 encoder, images for generation through a VQ tokenizer with a 16,384-entry codebook and 16x downsampling, each followed by its own two-layer MLP adaptor into a shared autoregressive transformer (DeepSeek-LLM, 1.3B). Text uses the LLM's built-in head; images use a separately initialized prediction head over codebook IDs. The ablation is the argument: with one VQ encoder for both tasks, MMBench sits at 35.0 and POPE at 60.1; with decoupled encoders the 1.3B model reaches MMBench 69.4, POPE 87.0, SEED-Bench 63.7, and a GenEval score of 61% with COCO FID (Frechet inception distance) 8.53.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-llm",
      to: ["janusflow", "janus-pro"],
      context:
        "Janus opens a second front in the DeepSeek family: not language-model scaling, but unified multimodal modeling. It builds on the DeepSeek-LLM backbone rather than on the V-series chat models, and it is a research line about representation, not about serving cost.",
      improved: [
        "Separates visual encoding into an understanding path (SigLIP semantic features) and a generation path (VQ discrete IDs) instead of forcing one encoder to do both.",
        "Keeps a single autoregressive transformer with two adaptors and two prediction heads, so decoupling adds no second language model.",
        "Shows the cost of a shared encoder directly: swapping to decoupled encoding lifts MMBench from 35.0 to 69.4 and POPE from 60.1 to 87.0 in the paper's ablation.",
        "Demonstrates that unified training does not have to trade tasks off: the jointly trained model matches understanding-only and generation-only variants on their own benchmarks.",
        "Releases a 1.3B model whose scores (MMBench 69.4, SEED-Bench 63.7, POPE 87.0, GenEval 61%) beat several much larger task-specific and unified baselines of its time.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two tasks, two kinds of visual information",
        text: "Understanding and generation want opposite things from an image representation. Understanding needs high-level semantics: what objects are present, their attributes, relations, and scene meaning - the kind of feature a contrastive encoder like SigLIP produces after training on image-text pairs. Generation needs fine-grained, reconstructable detail: exact textures, positions, and colors, which is why VQ tokenizers produce discrete IDs that can be decoded back into pixels. A VQ tokenizer optimized for reconstruction carries semantics only implicitly, and a SigLIP encoder discards the low-level detail generation needs. Force one encoder to serve both and it must compromise, and the compromise shows up wherever the tasks disagree.",
      },
      {
        kind: "prose",
        heading: "The conflict, measured",
        text: "Janus does not assert the trade-off; it measures it. With a single VQ tokenizer encoding images for both tasks (the Chameleon-style baseline), understanding collapses: POPE 60.1, MMBench 35.0, SEED-Bench 34.9. The generation side is fine - VQ tokenizers are built for it. Building a stronger shared alternative, a SigLIP-distilled semantic tokenizer that emits discrete IDs, helps understanding (MMBench 52.7) but generation suffers relative to the decoupled design. The cleanest evidence is the control: the same semantic tokenizer scores far better on understanding when trained for understanding only (MMBench 62.1) than when it must also support generation (52.7). The gap is the tax a shared encoder charges.",
      },
      {
        kind: "visual",
        visual: "janus-decouple",
        caption:
          "Janus decouples visual encoding: a SigLIP encoder plus understanding adaptor for images to be understood, a VQ tokenizer plus generation adaptor for images to be generated, concatenated into one sequence inside a single autoregressive transformer with separate text and image heads.",
      },
      {
        kind: "prose",
        heading: "The architecture: two doors, one room",
        text: "The design is deliberately minimal. On the input side, text goes through the LLM's own tokenizer and embedding table; images for understanding go through SigLIP, are flattened from a 2D grid into a sequence, and pass through the understanding adaptor (a two-layer MLP) into the LLM's input space; images for generation are converted to VQ IDs, and their codebook embeddings pass through the generation adaptor into the same space. All three streams concatenate into one sequence and the transformer processes them together, with no special attention masks. On the output side, the built-in language head predicts text, and a randomly initialized head predicts image tokens over the codebook. Training proceeds in three stages: adaptors and image head first, then unified pretraining of everything except the two encoders, then supervised fine-tuning that also unlocks the understanding encoder.",
      },
      {
        kind: "formula",
        label: "The image token budget",
        expression:
          "N_img = (H / 16) * (W / 16)   ->   384 x 384 images become 24 x 24 = 576 tokens",
        why: "The VQ tokenizer downsamples by 16, so an image becomes a fixed-length sequence of discrete IDs the transformer predicts one at a time. This number is the currency of the design: too few tokens and generation loses detail, too many and the context fills with image tokens that crowd out text. It also explains why 384x384 resolution is a hard boundary in this line - quadrupling pixels quadruples tokens - and why the paper's stated limitation about small faces being under-detailed is really about token budget per region.",
      },
      {
        kind: "code",
        title: "Two encoders, one transformer",
        language: "python",
        code: `def janus_forward(text_ids, image, task):
    """text_ids: tokenizer output; image: raw image; task: 'understand' or 'generate'."""
    text_emb = embed_text(text_ids)
    if task == "understand":
        feats = siglip(image)                # continuous semantic features
        feats = flatten_2d(feats)
        img_emb = understand_adaptor(feats)  # 2-layer MLP into LLM space
        seq = concat(text_emb, img_emb)
        return lm_head(transformer(seq))     # built-in text head
    vq_ids = vq_tokenizer.encode(image)      # discrete IDs, 16x downsample
    img_emb = generate_adaptor(embed_codebook(vq_ids))
    seq = concat(text_emb, img_emb)
    return image_head(transformer(seq))      # separate head over codebook IDs

# Same weights for the transformer; the task picks the input encoding and the
# output head. No mask tricks, no duplicated language model.`,
        notes: [
          "The adaptors exist because the two encoders produce different spaces: continuous SigLIP features versus codebook embeddings.",
          "The image head is randomly initialized and trained jointly; the language head is the LLM's own.",
          "Because generation is autoregressive over codebook IDs, Janus needs no diffusion stack and no special attention pattern.",
        ],
      },
      {
        kind: "prose",
        heading: "One transformer can hold both if the doors differ",
        text: "A natural worry is that joint training drags either task down. Janus checks this with single-task controls: the jointly trained decoupled model (POPE 87.0, MMBench 69.4, COCO FID 8.53) is statistically comparable to the understanding-only variant (POPE 85.9, MMBench 70.6) and to the generation-only variant (FID 8.92). Whatever cost unified training adds is smaller than the cost the shared encoder was imposing. The interpretation the authors offer is that the transformer is a general sequence model and the conflict lived in the encoder, not in the weights: once each modality enters the sequence in its own natural representation, the language model can learn to reason over image tokens and text tokens in one space.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Unified multimodal models typically share one visual encoder for understanding and generation, and performance in understanding suffers because generation-friendly tokenizers are semantically weak. Can a unified model keep the benefits of one transformer while giving each task the visual representation it needs?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Decoupling as the organizing principle: two encoders, two adaptors, one transformer, two heads. The ablation study is the heart of the paper - read it as a controlled experiment about representation conflict, not as a leaderboard.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "The 1.3B Janus model reports POPE 87.0, MME-Perception 1338.0, MMBench 69.4, SEED-Bench 63.7, VQAv2 77.3, GQA 59.1, MMMU 30.5, and MM-Vet 34.3 for understanding; GenEval 61% and COCO-30K FID 8.53 for generation. In the ablation, single-encoder VQ encoding lands at POPE 60.1, MMBench 35.0, SEED 34.9 with COCO FID 8.72; the semantic-tokenizer variant reaches MMBench 52.7, and the same encoder without generation training reaches 62.1. The decoupled model beats LLaVA-v1.5 (7B) on POPE, MMBench, SEED-Bench, and MM-Vet, though it trails it on VQAv2, GQA, and MMMU.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "Everything runs at 384x384, the model is validated at a single 1.3B scale, and the ablation's strongest baseline is a distilled semantic tokenizer rather than a full alternative architecture. The paper explicitly frames the contribution as showing the importance of decoupling, not as claiming the architecture is finished - the scaling and data questions are left to the next paper.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When two objectives fight over one representation, the fix may be to give each its own encoder and share the model that reasons, not the model that perceives. Also notice the training-staging pattern: freeze the expensive encoders while adaptors learn to speak the LLM's language, then open the encoder later. That is the same adaptor-first discipline used across the multimodal line.",
      },
    ],
    questions: [
      {
        id: "janus-q1",
        prompt:
          "Why does Janus use different encoders for understanding and generation?",
        options: [
          "Because SigLIP cannot output discrete tokens",
          "Because understanding needs high-level semantic features while generation needs reconstructable fine-grained detail, and one encoder forces a compromise",
          "Because the VQ tokenizer is too slow for understanding",
          "Because the language model has two separate attention stacks",
        ],
        answer: 1,
        explanation:
          "The paper's core claim is that the two tasks require different visual granularity. SigLIP gives semantics for understanding; the VQ tokenizer gives discrete, reconstructable IDs for generation. The ablation shows the shared-encoder alternative losing roughly half of understanding performance.",
      },
      {
        id: "janus-q2",
        prompt: "What do the two adaptors do?",
        options: [
          "Translate the LLM's output back into pixels",
          "Map each encoder's output representation into the shared transformer's input space - continuous SigLIP features and codebook embeddings respectively",
          "Route tokens to different attention heads",
          "Compress the KV cache for image tokens",
        ],
        answer: 1,
        explanation:
          "The understanding and generation adaptors are two-layer MLPs that project different source spaces (continuous semantic features, discrete codebook embeddings) into the LLM's embedding space so one transformer can process both.",
      },
      {
        id: "janus-q3",
        prompt:
          "A 384x384 image goes through Janus's VQ tokenizer with 16x downsampling. How many image tokens does the transformer see?",
        options: ["24", "384", "576", "16384"],
        answer: 2,
        explanation:
          "Downsampling by 16 gives a 24x24 grid, so 576 tokens. The 16,384 number is the codebook size, not the sequence length. This token budget is why resolution and detail are coupled in this design.",
      },
      {
        id: "janus-q4",
        prompt:
          "The comparison between the semantic-tokenizer variant trained jointly (Exp-B) and the same encoder trained for understanding only (Exp-C) shows what?",
        options: [
          "Semantic tokenizers are worse than VQ tokenizers for generation",
          "Even a strong shared encoder pays an understanding tax when it must also support generation",
          "Understanding-only training destroys generation ability permanently",
          "Discrete tokens cannot represent semantics",
        ],
        answer: 1,
        explanation:
          "Exp-C's understanding scores are substantially higher than Exp-B's (for example MMBench 62.1 versus 52.7) with the same encoder. The difference is the trade-off the shared encoder makes when generation training is added - which is the paper's argument for decoupling.",
      },
      {
        id: "janus-q5",
        prompt: "Which training-staging choice matches Janus?",
        options: [
          "Train the two visual encoders first, then freeze the transformer",
          "Train adaptors and the image head first, then unified pretraining of everything except the encoders, then SFT that also unlocks the understanding encoder",
          "Train everything jointly from random initialization in one stage",
          "Skip supervised fine-tuning and use reinforcement learning from image feedback",
        ],
        answer: 1,
        explanation:
          "Janus proceeds in three stages: adaptors and image head, then unified pretraining with encoders frozen, then SFT that additionally unlocks the understanding encoder. This adaptor-first discipline lets the LLM's input space stabilize before the encoders are adjusted.",
      },
    ],
    practice: {
      articles: ["art-embeddings"],
      problems: ["cv-175", "cv-249"],
    },
  },
  {
    id: "janus-pro",
    slug: "janus-pro",
    title:
      "Janus-Pro: Unified Multimodal Understanding and Generation with Data and Model Scaling",
    short: "Janus-Pro",
    year: 2025,
    date: "2025-01-29",
    arxivId: "2501.17811",
    url: "https://arxiv.org/abs/2501.17811",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Same decoupled design, a 7B transformer, 90M more understanding samples and 72M synthetic images: both doors of the architecture get better.",
    whatItIs:
      "Janus-Pro is the scaling study on top of Janus. It keeps the architecture identical - SigLIP for understanding, a 16,384-entry VQ tokenizer for generation, two MLPs, one autoregressive transformer - and improves three things: the training strategy (longer Stage I on ImageNet with the LLM frozen, no ImageNet in Stage II, and an SFT mix of 5:1:4 instead of 7:3:10), the data (+90M multimodal understanding samples in the DeepSeek-VL2 style and about 72M synthetic aesthetic images, bringing real to synthetic to 1:1), and the model scale (two sizes, 1B and 7B, with the LLM grown from 1.5B to 7B). Janus-Pro-7B reports MMBench 79.2, MMMU 41.0, MM-Vet 50.0, POPE 87.4, SEED 72.1, GenEval 0.80, and DPG-Bench 84.19, outperforming TokenFlow-XL (13B) on understanding benchmarks except GQA and DALL-E 3 on GenEval. The conclusion is honest about the ceiling: at 384x384, OCR and fine detail remain weak, and the VQ tokenizer's reconstruction losses still limit small-object quality.",
    theoryMinutes: 14,
    lineage: {
      from: "janus",
      context:
        "Janus validated the decoupled design at a single 1.3B scale and left two open problems: unstable generation and understanding below specialist models. Janus-Pro is the follow-up that asks whether those were architecture problems or resource problems, and answers them by changing everything except the architecture. It is the last entry of the Janus line for now; after it, the frontier era returns to the language backbone with the sparse-attention and V3.1 work.",
      improved: [
        "Scales the LLM backbone from 1.5B to 7B while keeping the decoupled design, showing the architecture scales rather than only working at small size.",
        "Reworks the three-stage recipe: longer Stage I training on ImageNet with the LLM frozen, no ImageNet in Stage II, and a rebalanced SFT mix (5:1:4 versus 7:3:10).",
        "Adds roughly 90M multimodal understanding samples following the DeepSeek-VL2 recipe, including chart, table, and document data.",
        "Adds about 72M synthetic aesthetic images so pretraining sees a 1:1 real-to-synthetic mix, which the paper credits for stability and aesthetics.",
        "Raises the headline numbers substantially: GenEval from 0.61 to 0.80 and DPG-Bench from 79.68 to 84.19, with MMBench moving from 69.4 to 79.2.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "What a scaling study is for",
        text: "Janus proved the decoupling idea at 1.3B parameters but shipped with visible flaws: image generation from short prompts was unstable, and understanding lagged similarly sized specialists. Janus-Pro asks whether those are architectural limits or resource limits. It changes nothing about the architecture and spends on three axes instead - the training schedule, the data, and the model size - so any improvement can be attributed to scale rather than to a new mechanism. This is a useful pattern to recognize: when a paper's contribution is 'same design, more of everything', read it as evidence about which constraints were resource constraints all along.",
      },
      {
        kind: "prose",
        heading: "The training-strategy fix",
        text: "Janus's Stage II spent two thirds of its text-to-image steps on ImageNet-style category prompts to model pixel dependencies, which the authors later judged inefficient. Janus-Pro moves that work earlier: Stage I trains longer with the LLM frozen, where the paper finds the model can learn reasonable category-conditioned generation on its own, and Stage II goes straight to dense-caption text-to-image data. Stage III then rebalances the supervised mix from 7:3:10 to 5:1:4 (understanding, text, generation), trading a little generation data for better understanding. The lesson generalizes: a schedule is a hypothesis about where the model is bottlenecked, and moving cheap objectives earlier frees expensive stages for the data that actually needs them.",
      },
      {
        kind: "prose",
        heading: "Data: semantics on one side, aesthetics on the other",
        text: "Two data decisions map neatly onto the two doors of the architecture. For understanding, Janus-Pro follows the DeepSeek-VL2 recipe and adds about 90M samples - captions plus table, chart, and document understanding, and later chat-style SFT data - widening what the SigLIP path can reason about. For generation, the paper diagnoses the real-data problem as quality and noise, and adds about 72M synthetic aesthetic images, making the pretraining mix 1:1 real to synthetic. Synthetic data converges faster and produces more stable, better-looking outputs at low resolution. The asymmetry is the point: each encoding path gets the data its objective needs, which is only possible because the paths are decoupled.",
      },
      {
        kind: "prose",
        heading: "Scale: 1B and 7B",
        text: "Janus-Pro ships in two sizes with the same architecture: a 1B and a 7B variant, with the language model growing from a 1.5B to a 7B DeepSeek-LLM and the rest of the stack unchanged. The larger model converges faster on both understanding and generation losses and moves every headline metric: MMBench 75.5 for the 1B jumps to 79.2 for the 7B, MMMU from 36.3 to 41.0, GenEval from 0.73 to 0.80. The 7B also outperforms TokenFlow-XL, a 13B unified model, on nearly every understanding benchmark. The reported training cost is 9 and 14 days on 16 and 32 nodes of 8 A100 40GB GPUs for the two sizes, a useful reminder of how modest the compute is compared with the frontier language models in this curriculum.",
      },
      {
        kind: "formula",
        label: "GenEval, read per capability",
        expression:
          "GenEval_overall = (1/6) * ( single_obj + two_obj + counting + colors + position + color_attr )",
        why: "GenEval averages six category accuracies, so the overall score hides which skill improved. Janus to Janus-Pro-7B: position 0.46 to 0.79, color attributes 0.42 to 0.66, counting 0.30 to 0.59, colors 0.84 to 0.90. The gains are largest exactly where a weak model fails compositionally - placing objects, binding attributes, counting - which is what better instruction-following data and a larger transformer should fix. Reading the sub-scores instead of the average tells you whether a generation model is actually better or just better at the easy categories.",
      },
      {
        kind: "code",
        title: "The three-stage schedule, restated",
        language: "python",
        code: `def janus_pro_stages():
    # Janus:  stage1 = adaptors + image head, 180K steps stage2, 24K steps stage3
    # Pro:    longer stage1 on ImageNet (LLM frozen), stage2 drops ImageNet,
    #         stage3 uses a 5:1:4 mix of understanding : text : generation data.
    stage1 = {"trains": ["understand_adaptor", "generate_adaptor", "image_head"],
              "data": "ImageNet categories",
              "note": "longer than Janus; pixel dependence while the LLM is frozen"}
    stage2 = {"trains": ["llm", "adaptors", "image_head"],
              "data": "dense captions + 90M new understanding samples",
              "note": "no ImageNet; 1:1 real to synthetic generation data"}
    stage3 = {"trains": ["llm", "adaptors", "image_head", "understanding_encoder"],
              "ratio_understanding_text_generation": (5, 1, 4)}
    return stage1, stage2, stage3

# Janus used 10K / 180K / 24K steps for the 1B model; Pro trains the shared
# stages longer and reports 9 (1B) and 14 (7B) days on 16/32 A100 nodes.`,
        notes: [
          "The reordering matters more than the step counts: cheap category modeling moves to the frozen-LLM stage so dense-caption training is not diluted.",
          "The 5:1:4 ratio is a deliberate trade: slightly less generation data in exchange for measurably better understanding.",
          "Stage 3 is the only stage where the understanding encoder is unfrozen, the same pattern Janus used.",
        ],
      },
      {
        kind: "visual",
        visual: "janus-decouple",
        caption:
          "Janus-Pro keeps Janus's two-door architecture - SigLIP understanding path, VQ generation path, one autoregressive transformer - and scales the transformer, the data, and the training schedule rather than the design.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Janus validated decoupled visual encoding at 1B scale, but its generation was unstable on short prompts and its understanding trailed dedicated models. The paper asks whether training strategy, data, and model size can close those gaps without changing the architecture.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three axes, one fixed architecture. The method section is short by design: optimized three-stage training, scaled data with explicit real-to-synthetic balance, and 1B/7B model sizes. Read the ablations as a scaling argument: what improves when you only add resources.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Janus-Pro-7B: MMBench 79.2, MMMU 41.0, MM-Vet 50.0, POPE 87.4, MME-Perception 1567.1, SEED 72.1, GQA 62.0; GenEval 0.80 and DPG-Bench 84.19. Janus-Pro-1B: MMBench 75.5, MMMU 36.3, GenEval 0.73, DPG-Bench 82.63. Relative to Janus (MMBench 69.4, GenEval 0.61, DPG-Bench 79.68), the largest gains are in compositional generation categories: position 0.46 to 0.79, counting 0.30 to 0.59, color attributes 0.42 to 0.66. The 7B model beats TokenFlow-XL (13B) on all listed understanding benchmarks except GQA, and beats DALL-E 3 and SD3-Medium on GenEval overall.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "Resolution is capped at 384x384, which limits fine-grained tasks such as OCR, and the VQ tokenizer's reconstruction losses mean generated images can lack fine detail - small faces occupying little image space may appear under-detailed. The evaluation suite is the authors' selection, the generation comparison is against models from the same period rather than a live leaderboard, and the data-scaling result depends on synthetic images whose license and diversity properties are not dissected in the paper.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If a design works at small scale and you believe in it, the cheapest next experiment is often not a new mechanism but a disciplined scaling pass: fix the schedule so each stage does only the work it is good at, add data separately for each objective the architecture exposes, and grow the shared component. Report the sub-scores, not just the averages - they tell you which part of the journey the resources actually bought.",
      },
    ],
    questions: [
      {
        id: "janusp-q1",
        prompt: "Which three axes does Janus-Pro scale?",
        options: [
          "Vision encoder size, codebook size, and image resolution",
          "Training strategy, data, and model size - with the architecture unchanged from Janus",
          "Attention sparsity, MoE routing, and precision",
          "Number of prediction heads, attention masks, and diffusion steps",
        ],
        answer: 1,
        explanation:
          "The paper is explicit: optimized training strategy, expanded training data, and scaling to larger model size, on the same decoupled architecture. Resolution and the number of encoders are unchanged.",
      },
      {
        id: "janusp-q2",
        prompt:
          "What changed in Stage II text-to-image training compared to Janus?",
        options: [
          "ImageNet category data was moved out of Stage II, with longer frozen-LLM Stage I training handling pixel dependence instead",
          "Stage II was removed entirely",
          "Stage II now trains only the encoders",
          "Stage II added a diffusion decoder",
        ],
        answer: 0,
        explanation:
          "Janus spent most of its Stage II text-to-image steps on ImageNet category prompts. Janus-Pro moves that work into a longer Stage I where the LLM is frozen, then uses Stage II for dense-caption generation data, which the paper found more efficient and more effective.",
      },
      {
        id: "janusp-q3",
        prompt: "Why did the authors add about 72M synthetic images?",
        options: [
          "To raise the effective image resolution above 384x384",
          "Because the real-world generation data was noisy and low quality, and a 1:1 real-to-synthetic mix produced more stable, better-looking outputs",
          "To replace the VQ tokenizer with a diffusion model",
          "To train the SigLIP encoder from scratch",
        ],
        answer: 1,
        explanation:
          "The paper diagnoses the previous generation data as noisy and lacking quality, causing instability. Synthetic aesthetic data converges faster and improves stability and aesthetics; the mix becomes 1:1 during unified pretraining.",
      },
      {
        id: "janusp-q4",
        prompt:
          "Janus-Pro-7B's GenEval overall is 0.80 versus Janus at 0.61. Which category improved most, and why does reading sub-scores matter?",
        options: [
          "Colors improved most, showing the model learned color words",
          "Position improved most (0.46 to 0.79), showing compositional placement is what better data and scale fixed - the overall average would hide this",
          "Single-object generation improved most because generation quality doubled",
          "Counting improved most because the codebook grew",
        ],
        answer: 1,
        explanation:
          "Position attribution moved from 0.46 to 0.79, the largest jump among the six categories, with counting and color attributes next. Single-object was already near ceiling (0.97). Averaging hides which compositional skills were actually fixed.",
      },
      {
        id: "janusp-q5",
        prompt: "Which limitation does the Janus-Pro conclusion state plainly?",
        options: [
          "The model cannot generate images at all",
          "384x384 input resolution limits fine-grained tasks such as OCR, and tokenizer reconstruction losses leave fine details weak",
          "The two encoders cannot share one transformer",
          "Synthetic data makes training unstable",
        ],
        answer: 1,
        explanation:
          "The conclusion names both: resolution limits OCR, and the vision tokenizer's reconstruction losses mean images rich in semantics can still lack fine detail, with small facial regions as the example. The paper suggests higher resolution as the path forward.",
      },
    ],
    practice: {
      articles: ["art-embeddings"],
      problems: ["cv-175", "cv-296", "cv-393"],
    },
  },
  {
    id: "janusflow",
    slug: "janusflow",
    title:
      "JanusFlow: Harmonizing Autoregression and Rectified Flow for Unified Multimodal Understanding and Generation",
    short: "JanusFlow",
    year: 2024,
    date: "2024-11-12",
    arxivId: "2411.07975",
    url: "https://arxiv.org/abs/2411.07975",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Keep Janus's two doors, swap the generation door from discrete tokens to rectified flow: the same transformer predicts text autoregressively and image velocity vectors for an ODE (ordinary differential equation) solver.",
    whatItIs:
      "JanusFlow is the sibling of Janus that asks what happens if image generation is a continuous flow instead of a sequence of codebook tokens. The architecture stays deliberately minimal: a 1.3B DeepSeek-LLM backbone, a SigLIP-Large-Patch/16 encoder for understanding, and a small ConvNeXt encoder-decoder pair, initialized from scratch, that adapts the language model for rectified flow in the latent space of a pretrained variational autoencoder (SDXL-VAE). The language model's output at the image positions is read as a velocity field, and an Euler solver integrates it from noise to image. Two ideas make it work: decoupled encoders for the two tasks, and a representation-alignment loss that pulls generation features toward the understanding encoder's semantics during unified training. It reaches GenEval 0.63, DPG-Bench 80.09, and MJHQ FID-30k 9.51 for generation, and MMBench 74.9, SEED-Bench 70.5, and GQA 60.3 for understanding, all from a 1.3B backbone. Published at CVPR 2025.",
    theoryMinutes: 14,
    lineage: {
      from: "janus",
      to: ["janus-pro"],
      context:
        "Janus decoupled the two visual paths but generated images as discrete tokens, which caps quality at what a VQ codebook can represent. JanusFlow keeps the decoupling and replaces the tokenizer with a flow model, testing whether the same transformer can drive both next-token prediction and a continuous generative process.",
      improved: [
        "Replaces autoregressive generation over a VQ codebook with rectified flow in a continuous latent space, using the language model itself as the velocity predictor.",
        "Keeps the architecture minimalist: only a lightweight ConvNeXt encoder and decoder plus a long skip connection are added to adapt the LLM for flow, with causal attention throughout.",
        "Retains decoupled encoders (SigLIP for understanding, ConvNeXt for generation) and adds representation alignment that pulls the generation encoder's features toward the understanding encoder's, improving generation quality.",
        "Reports generation scores that beat much larger specialists of its time: GenEval 0.63, DPG-Bench 80.09, and MJHQ FID-30k 9.51, above SDv1.5 and SDXL.",
        "Keeps understanding competitive at 1.3B: MMBench 74.9, SEED-Bench 70.5, GQA 60.3, ahead of LLaVA-v1.5 and Qwen-VL-Chat on the listed benchmarks.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two generative families, one transformer",
        text: "Autoregressive models write a sequence one token at a time, which is exactly what a language model already does, so a unified model can simply add image tokens to the vocabulary. Diffusion and flow models instead start from noise and iteratively refine a whole continuous sample, which is a different computation but a much better fit for pixel-level detail. Janus chose the first route; JanusFlow chooses the second and asks a narrow question: can an ordinary decoder-only transformer predict the velocity field a flow model needs, without special architecture or attention masks? The paper's answer is yes, and the modifications required turn out to be surprisingly small.",
      },
      {
        kind: "prose",
        heading: "Rectified flow in one paragraph",
        text: "Rectified flow defines a path from noise to data and trains a network to predict its instantaneous direction, the velocity. At generation time you start with Gaussian noise and take small Euler steps along the predicted field until you reach a sample. The training signal is simple: pick a time, interpolate between noise and the real latent, and regress the network's output onto the difference between them. Because the network conditions on the text through the same attention stack, classifier-free guidance applies directly: run the model with and without the caption and extrapolate away from the unconditional direction to sharpen prompt alignment.",
      },
      {
        kind: "formula",
        label: "Flow matching and Euler sampling",
        expression:
          "z_t = (1 - t) * noise + t * latent,   target velocity = latent - noise\nv = v(z_t, t | caption) + w * ( v(z_t, t | caption) - v(z_t, t | empty) )\nz_{t+dt} = z_t + v * dt",
        why: "The first line defines the training target: the velocity that moves a point along the straight path from noise to data. The second is classifier-free guidance with scale w, which extrapolates between the conditional and unconditional predictions; the reported images use w = 2. The third is the Euler update the sampler iterates, and the number of steps is a cost dial that a token-by-token generator does not have.",
      },
      {
        kind: "code",
        title: "The sampling loop",
        language: "python",
        code: `def sample(llm, text_emb, latent_shape, steps=30, w=2.0):
    z = gaussian_noise(latent_shape)
    dt = 1.0 / steps
    for step in range(steps):
        t = step * dt
        # the LLM predicts a velocity for every latent position at once
        v_cond = llm.velocity(z, t, cond=text_emb)
        v_uncond = llm.velocity(z, t, cond=None)
        v = v_cond + w * (v_cond - v_uncond)
        z = z + v * dt
    return vae_decode(z)   # SDXL-VAE latent back to pixels

# Understanding uses the same weights with next-token prediction instead.`,
        notes: [
          "The reported FID uses w = 2 and 30 sampling steps; both are swept in the appendix, so quality and latency trade off explicitly.",
          "Unlike a discrete-token generator, the model emits a velocity for the whole latent grid per step, which is why the ConvNeXt decoder exists.",
          "The same transformer runs both modes; the task decides whether its output is read as logits or as a velocity field.",
        ],
      },
      {
        kind: "prose",
        heading: "What minimal actually means",
        text: "The integration is three pieces. A generation encoder turns the noisy latent into a sequence of embeddings; a time embedding is concatenated so the model knows where it is on the path; a generation decoder turns the transformer's output back into a latent-shaped velocity. The encoder and decoder are ConvNeXt blocks trained from scratch, with a long skip connection between them, and generation happens in an SDXL-VAE latent space so the resolution of the transformer's sequence stays manageable. The paper tested attention-masking schemes used by other unified models and found causal attention sufficient - no special mask, no second attention stack. That simplicity is the contribution: the language model does not need to be rebuilt to become a flow model.",
      },
      {
        kind: "visual",
        visual: "janus-decouple",
        caption:
          "Two doors again: SigLIP for understanding, a ConvNeXt encoder-decoder pair for flow generation, one transformer in the middle. The generation path is continuous, not a codebook sequence.",
      },
      {
        kind: "prose",
        heading: "Representation alignment",
        text: "Decoupling removes the conflict between tasks but leaves the generation path without semantic supervision: its ConvNeXt encoder sees latents, not concepts. JanusFlow adds a regularization term during unified training that aligns the generation encoder's intermediate features with the understanding encoder's features for the same image. The generation branch then learns representations that are not only reconstructable but semantically structured, which the paper credits for better prompt following. It is a small loss term with a large effect, and it only exists because the encoders are decoupled - a shared encoder would have nothing to align.",
      },
      {
        kind: "prose",
        heading: "Results, and what the paper leaves open",
        text: "The 1.3B model reports MJHQ FID-30k 9.51, GenEval 0.63, and DPG-Bench 80.09, ahead of SDv1.5 and SDXL on those generation benchmarks despite being a unified model, and MMBench 74.9, SEED-Bench 70.5, and GQA 60.3 for understanding, ahead of LLaVA-v1.5 and Qwen-VL-Chat on the listed tasks. The limits are structural: everything is validated at one 1.3B scale and 384 x 384 resolution; flow sampling is iterative, so generation costs many forward passes; the VAE latent space is inherited from SDXL rather than learned; and the evaluation suite is the authors' selection. Janus-Pro later scales the token-based line rather than this one, so JanusFlow is best read as the controlled experiment that shows a flow objective can live inside a language model.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Unified multimodal models usually generate images as discrete tokens because that is what a language model already predicts, but VQ tokenization loses fine detail. Can a decoder-only transformer instead drive a continuous flow model, keeping both tasks in one set of weights?",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Minimal adaptation plus alignment. Section 3 describes the flow formulation, the ConvNeXt encoder-decoder, and the causal-attention finding; the representation-alignment loss is the second contribution. Read the ablations for what each piece buys, and the sampling sweep for the step-count trade-off.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Generation: GenEval 0.63, DPG-Bench 80.09, MJHQ FID-30k 9.51 (w = 2, 30 steps), beating SDv1.5 and SDXL. Understanding: MMBench 74.9, SEED-Bench 70.5, GQA 60.3 at 1.3B parameters, ahead of LLaVA-v1.5 and Qwen-VL-Chat. Ablations cover the decoupled encoders, the alignment loss, and the attention-mask choice. Published at CVPR 2025.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "One model scale and one resolution; iterative sampling means generation costs multiple forward passes; the latent space comes from a pretrained SDXL VAE; and the benchmark comparisons are the authors' selection from the same release window. The paper positions itself as evidence that the approach works, not as a finished generation system.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "You do not need a diffusion-specific network to run a flow model: a language transformer with a small latent-space encoder and decoder is enough. If you decouple representations for two tasks, add a loss that reconnects them semantically, because the decoupled branch loses the supervision the shared one used to get for free. And treat sampling steps as a serving dial, not a constant.",
      },
    ],
    questions: [
      {
        id: "jf-q1",
        prompt:
          "What does the language model predict when JanusFlow generates an image?",
        options: [
          "A sequence of VQ codebook tokens",
          "A velocity field over the latent grid at each sampling step, which an Euler solver integrates",
          "A CLIP similarity score for each caption",
          "A segmentation mask that a diffusion model completes",
        ],
        answer: 1,
        explanation:
          "The generation decoder reshapes the transformer's output into a velocity for every latent position. Sampling starts from Gaussian noise and takes Euler steps along the predicted field until the latent can be decoded by the SDXL VAE.",
      },
      {
        id: "jf-q2",
        prompt:
          "Which components does JanusFlow add to the language model for generation?",
        options: [
          "A second transformer and a U-Net",
          "A ConvNeXt generation encoder and decoder plus a time embedding, with a long skip connection between them",
          "A VQ tokenizer and a codebook embedding table",
          "A diffusion loss head on every layer",
        ],
        answer: 1,
        explanation:
          "The minimalist claim is that only a lightweight encoder, a decoder, and a time embedding are needed to adapt the LLM for flow. The paper found causal attention sufficient and used no special attention masks.",
      },
      {
        id: "jf-q3",
        prompt: "What does the representation-alignment loss do?",
        options: [
          "It aligns the image and text tokenizers",
          "It pulls the generation encoder's intermediate features toward the understanding encoder's features, giving the generation path semantic structure",
          "It forces the two encoders to share weights",
          "It aligns the noise schedule across resolutions",
        ],
        answer: 1,
        explanation:
          "The decoupled generation encoder has no semantic supervision of its own. Aligning its features with SigLIP's for the same image makes them semantically organized, which the paper credits for better prompt following while keeping the encoders separate.",
      },
      {
        id: "jf-q4",
        prompt:
          "Why does classifier-free guidance appear in a rectified-flow model?",
        options: [
          "It replaces the ODE solver",
          "The model can predict a velocity with and without the caption, and extrapolating away from the unconditional prediction sharpens alignment with the prompt",
          "It removes the need for a VAE",
          "It converts velocity into probability",
        ],
        answer: 1,
        explanation:
          "Guidance is an inference-time trick: run the model conditionally and unconditionally, then combine the two velocities with scale w. JanusFlow reports w = 2 and 30 sampling steps for its FID numbers.",
      },
      {
        id: "jf-q5",
        prompt:
          "Which limitation does the JanusFlow paper's scope impose on its claims?",
        options: [
          "It only reports at a single 1.3B scale and 384 x 384 resolution",
          "It cannot generate images at all",
          "It requires a discrete codebook larger than Janus's",
          "It trains two separate language models",
        ],
        answer: 0,
        explanation:
          "Everything is validated at one scale and one resolution, with iterative sampling adding cost. The paper is a controlled experiment about the objective and the decoupled design, and Janus-Pro later scales the token-based line instead.",
      },
    ],
    practice: {
      concepts: ["calc-derivatives", "la-vectors"],
      articles: ["art-gradient-descent", "art-embeddings"],
      problems: ["cv-175", "cv-296", "cv-393"],
    },
  },
  {
    id: "deepseek-ocr",
    slug: "deepseek-ocr",
    title: "DeepSeek-OCR: Contexts Optical Compression",
    short: "DeepSeek-OCR",
    year: 2025,
    date: "2025-10-21",
    arxivId: "2510.18234",
    url: "https://arxiv.org/abs/2510.18234",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Render text as an image and let a 570M-active MoE read it back: ten text tokens per vision token is near-lossless, twenty is still 60%.",
    whatItIs:
      "DeepSeek-OCR is a two-part system built to test one hypothesis: that vision can serve as a compression medium for text. The encoder, DeepEncoder, pairs a SAM-base block that reads patches with window attention against a CLIP-large block that adds global context, bridged by a 16x convolutional compressor, so a 1024 x 1024 page becomes 4096 patch tokens and then 256 vision tokens while activations stay small. The decoder is a 3B mixture-of-experts model with only 570M parameters active. The experiments measure how much text can be recovered from how few vision tokens: near 97% OCR precision at compression ratios under 10x, about 60% at 20x. On OmniDocBench it beats GOT-OCR2.0's 256-token pages using 100 vision tokens, and MinerU2.0's 6000-plus-token pages using fewer than 800. In production it generates training data at 200k-plus pages per day on a single A100-40G.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-vl2",
      to: ["deepseek-ocr-2"],
      context:
        "The multimodal line's most utilitarian branch. Where VL2 and Janus aim at general understanding or generation, DeepSeek-OCR uses the same ingredients - a window-attention perception encoder, a global-attention semantic encoder, a small MoE decoder - to attack the cost of long text, and it is the first DeepSeek release whose subject is context compression rather than a capability benchmark.",
      improved: [
        "Introduces DeepEncoder: SAM-base window attention for perception, a 16x convolutional compressor, and CLIP-large global attention for knowledge, keeping activation memory low at high resolution.",
        "Compresses a 1024 x 1024 page from 4096 patch tokens to 256 vision tokens before the language decoder ever runs.",
        "Quantifies the trade curve rather than a single point: 96%+ OCR precision at 9-10x text-to-vision compression, about 90% at 10-12x, and about 60% at 20x.",
        "Beats GOT-OCR2.0 on OmniDocBench with 100 vision tokens against its 256, and MinerU2.0 with fewer than 800 against its 6000-plus per page.",
        "Ships as a practical data engine: over 200k pages per day on one A100-40G, with code and weights open.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The context bill, paid in a different currency",
        text: "Long-context language models pay for text twice: once in attention compute, which grows with the square of the sequence, and once in memory traffic, because decoding streams the KV cache on every step. The paper asks whether text can be stored and read in a cheaper representation. An image of a page is two-dimensional and dense: a paragraph that costs a thousand tokens as text costs a few hundred patches as pixels, and the layout, fonts, and tables come along for free. The catch is that the reader must be able to recover the text, which is an OCR problem, and the quality of that recovery is what the whole paper measures.",
      },
      {
        kind: "prose",
        heading: "DeepEncoder: two attention patterns, one compressor",
        text: "The encoder is assembled from parts with complementary strengths. SAM-base processes 16 x 16 patches with window attention, so its cost stays local and its 80M parameters keep activations manageable at high resolution - it handles perception, the pixels. CLIP-large contributes the visual knowledge of a contrastively pretrained model and runs dense global attention, but it cannot afford to see 4096 tokens. Between them sits the compressor: two convolutional layers with kernel 3, stride 2, and padding 1, with channels rising from 256 to 1024, which downsamples the token grid by a factor of 16. A 1024 x 1024 page therefore reaches CLIP as 256 tokens instead of 4096. The design is a division of labor: window attention for seeing, a bottleneck for paying, global attention for understanding.",
      },
      {
        kind: "formula",
        label: "Compression ratio and what survives",
        expression:
          "compression = text_tokens / vision_tokens\n< 10x  ->  about 97% OCR precision\n~ 20x  ->  about 60% OCR precision",
        why: "The ratio is the design objective and the quality knob at once. Under 10x the reconstruction is effectively lossless for documents; at 20x the model is losing detail, and the paper attributes part of the drop to long texts blurring when rendered at 512 x 512 or 640 x 640, and part to complex layouts. The honest reading is that optical compression has a knee, and the paper's contribution is locating it rather than hiding it.",
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "DeepEncoder: SAM-base window attention reads patches, a 16x convolutional compressor cuts the token count, and CLIP-large adds global context; the 3B MoE decoder with 570M active parameters reconstructs the text.",
      },
      {
        kind: "code",
        title: "Counting the tokens a page costs",
        language: "python",
        code: `def page_tokens(pixels=1024, patch=16, compression=16):
    patches = (pixels // patch) ** 2          # 64 x 64 = 4096
    return patches // compression              # 256 vision tokens

def compression_ratio(text_tokens, vision_tokens):
    return text_tokens / vision_tokens

# A dense page of about 2560 text tokens rendered at 1024 x 1024
print(page_tokens())                                  # 256
print(compression_ratio(2560, 256))                   # 10.0x, near-lossless
print(compression_ratio(5120, 256))                   # 20.0x, about 60%

# Production mode (Gundam) tiles the page into crops and reaches ~1156 tokens,
# trading vision tokens for fidelity on dense or small-print documents.`,
        notes: [
          "The 16x figure is the compressor's downsampling factor, which is what turns 4096 patches into 256 tokens.",
          "Real deployments choose a mode: fewer tokens for bulk data generation, more crops for hard pages.",
          "The same arithmetic applies to any rendered text - chat history, logs, retrieved documents - which is why the paper frames OCR as a proof of concept for context compression in general.",
        ],
      },
      {
        kind: "prose",
        heading: "The decoder and the data",
        text: "The decoder is DeepSeek3B-MoE-A570M: a 3B-parameter mixture-of-experts model activating 570M parameters per token, chosen because the reconstruction task is narrow and does not need a large dense model. Training data is dominated by OCR tasks across document types, with about 20 percent general vision data - captions, detection, grounding - following the DeepSeek-VL2 recipe, included to keep the vision interface usable for future work rather than to make this a general VLM. The paper is explicit that it is not one: the point is the compression experiment, and the general data is insurance.",
      },
      {
        kind: "prose",
        heading: "Production numbers and the honest limits",
        text: "The system's practical claim is throughput: over 200k pages per day on a single A100-40G, which makes it a data engine for pretraining corpora rather than just a benchmark entry. The scientific claim is the compression curve. Both come with caveats the paper states. OCR is a proof of concept: decoding text from a rendered page is not the same as compressing arbitrary context, and the paper defers digital-optical interleaved pretraining and needle-in-a-haystack tests to future work. Beyond 10x compression quality falls, and long documents rendered at low resolution blur. The comparison models are from the same release window, and the 20 percent general-vision data means the model is deliberately not optimized as a general-purpose VLM. Read it as the opening argument for optical context compression, with the compression curve as the evidence.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Text context is expensive to store and read. The paper asks whether a page of text can be rendered as an image, compressed to a small number of vision tokens, and decoded back accurately enough to be useful - and where the accuracy knee lies.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The encoder architecture and the compression curve. Section 2 covers DeepEncoder's three stages and the decoder; Section 4 is the quantitative study of ratios against precision, plus the OmniDocBench comparison and the production numbers. The framing to keep in mind is LLM-centric: the question is how few vision tokens can carry how much text.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "Compression results: 96%+ OCR precision at 9-10x, about 90% at 10-12x, about 60% at 20x, measured on document benchmarks with diverse layouts. OmniDocBench: better than GOT-OCR2.0 with 100 vision tokens versus its 256 per page, and better than MinerU2.0 with under 800 versus its 6000-plus. Production: 200k-plus pages per day on one A100-40G. A 1024 x 1024 input becomes 4096 patch tokens and 256 vision tokens through a 16x compressor.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "OCR is explicitly a proof of concept for context compression, not the full claim; interleaved digital-optical pretraining and long-context retrieval tests are left for later. Quality degrades past 10x, and rendering long text at 512 or 640 pixels blurs it. The model is not a general VLM by design, and all comparisons are vendor-run on the authors' benchmark selection.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If you own a document pipeline, resolution policy is a cost decision you can measure: pick a compression ratio from the curve rather than a fixed resolution, and budget vision tokens the way you budget context. Optical storage wins when layout matters and the reader is good; it loses when text must be edited or exactly searched, so keep the text for those paths.",
      },
    ],
    questions: [
      {
        id: "ocr-q1",
        prompt:
          "What does the 16x compressor in DeepEncoder actually compress?",
        options: [
          "The pixel resolution of the input image",
          "The patch-token grid, from 4096 tokens to 256 before global attention runs",
          "The model's parameter count",
          "The output text length",
        ],
        answer: 1,
        explanation:
          "Two convolutional layers with stride 2 downsample the token grid by 4 x 4 = 16. A 1024 x 1024 page enters as 4096 patch tokens and reaches the CLIP-large global attention block as 256 tokens, which is what keeps activation memory manageable.",
      },
      {
        id: "ocr-q2",
        prompt:
          "Why does DeepEncoder use SAM-base for the first stage and CLIP-large for the second?",
        options: [
          "SAM is faster than CLIP on GPUs",
          "SAM's window attention keeps local perception cheap at high resolution, while CLIP contributes global semantic knowledge over the compressed token set",
          "CLIP cannot process patches",
          "SAM was pretrained for OCR and CLIP for detection",
        ],
        answer: 1,
        explanation:
          "The division of labor is the design: window attention handles many patches without exploding activation, the compressor cuts the count, and global attention over a small set adds the visual knowledge that a contrastively pretrained encoder provides.",
      },
      {
        id: "ocr-q3",
        prompt:
          "At what compression ratio does OCR precision fall to roughly 60%, and what does the paper say about why?",
        options: [
          "At 5x, because the decoder is too small",
          "At 20x, with long texts blurring at low render resolutions and complex layouts contributing",
          "At 2x, because text tokens outnumber vision tokens",
          "It never falls below 90%",
        ],
        answer: 1,
        explanation:
          "The curve stays near 97% below 10x and drops to about 60% at 20x. The paper points to blur from rendering long text at 512 or 640 pixels and to the complexity of long document layouts.",
      },
      {
        id: "ocr-q4",
        prompt:
          "What makes DeepSeek-OCR useful as a production component rather than just a benchmark model?",
        options: [
          "It generates training data at over 200k pages per day on a single A100-40G",
          "It replaces the language model entirely",
          "It supports every language without training",
          "It runs without a vision encoder",
        ],
        answer: 0,
        explanation:
          "The paper positions the model as a data engine for LLM pretraining: a single 40GB A100 can process more than 200k pages per day, which is what makes optical rendering practical at corpus scale.",
      },
      {
        id: "ocr-q5",
        prompt:
          "Which statement correctly describes the paper's own framing of its contribution?",
        options: [
          "It proves optical context compression is solved",
          "It is an initial investigation into optical compression with OCR as the proof of concept, leaving interleaved pretraining and long-context retrieval tests for future work",
          "It is a general-purpose VLM benchmark paper",
          "It replaces attention with vision tokens",
        ],
        answer: 1,
        explanation:
          "The abstract and conclusion call it an initial investigation. The compression curve is real evidence, but the paper defers digital-optical interleaved pretraining and needle-in-a-haystack evaluation, and it keeps general-vision data only to preserve the interface.",
      },
    ],
    practice: {
      concepts: ["info-entropy", "stats-correlation"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-188", "cv-249", "cv-296"],
    },
  },
  {
    id: "deepseek-v3-2",
    slug: "deepseek-v3-2",
    title:
      "DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models",
    short: "DeepSeek-V3.2",
    year: 2025,
    date: "2025-12-01",
    arxivId: "2512.02556",
    url: "https://arxiv.org/abs/2512.02556",
    kind: "report",
    era: "frontier",
    tier: "core",
    tagline:
      "Spend more on post-training than anyone thought sensible, synthesize 1,827 tool environments, and let the model learn to think inside a tool loop: V3.2 matches GPT-5, and its Speciale variant takes gold at IMO and IOI.",
    whatItIs:
      "DeepSeek-V3.2 is the December 1, 2025 successor to the V3.2-Exp experiment and the flagship open release that closes the year. It keeps the DeepSeek Sparse Attention architecture from the Exp report - the lightning indexer and top-k selection that make long-context attention linear in the main path - and spends its effort on three things the Exp release did not: a reinforcement-learning protocol scaled past 10 percent of the pretraining compute, a large-scale synthesis pipeline that builds 1,827 verifiable tool environments and 85,000-plus prompts for agentic training, and a cold-start stage that teaches the model to interleave reasoning with tool calls in a single trajectory. The result is a model the report places level with GPT-5 on reasoning benchmarks, and a high-compute variant, V3.2-Speciale, that the report places with Gemini-3.0-Pro and that earns gold-medal results at IMO 2025, CMO 2025, IOI 2025, and the ICPC World Finals.",
    theoryMinutes: 15,
    lineage: {
      from: "deepseek-v3-2-exp",
      to: ["deepseek-v4"],
      context:
        "The Exp release proved that sparse attention could be attached to a trained backbone at parity; this report is the model that the experiment was for. It keeps the architecture and moves the frontier on the two axes the Exp report named as remaining bottlenecks: how much compute post-training deserves, and how open models generalize inside agent loops.",
      improved: [
        "Scales post-training RL past 10 percent of the pretraining compute budget, with the report attributing the reasoning gains directly to that expansion and to a stable RL protocol.",
        "Adds a cold-start stage that unifies reasoning and tool use within a single trajectory, so the model learns to think and call tools in one stream instead of switching modes.",
        "Synthesizes agentic training data at scale: 1,827 task-oriented environments and more than 85,000 complex prompts, built to be hard to solve and easy to verify.",
        "Matches GPT-5 on reasoning benchmarks in the report's comparisons and, with the length-constrained reward removed, produces V3.2-Speciale, which the report places on par with Gemini-3.0-Pro.",
        "Earns gold-medal-level results at IMO 2025, CMO 2025, IOI 2025, and the ICPC World Finals with the Speciale variant, without task-specific training for the competitions.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The three deficiencies the report names",
        text: "The report opens with a candid diagnosis of open models rather than a victory lap. First, most open models still use vanilla attention, which makes long sequences expensive and constrains both deployment and post-training. Second, their post-training compute is small relative to pretraining, which limits performance on hard tasks. Third, they lag on agentic generalization and instruction following inside tool loops, which is where real deployments happen. The architecture answer to the first deficiency already exists in the Exp report; this paper is about the other two, and its thesis is that the post-training budget is the lever that was left on the table.",
      },
      {
        kind: "prose",
        heading: "Sparse attention, briefly",
        text: "DSA is carried over unchanged: a small FP8 lightning indexer scores every preceding token for each query, a fine-grained selector keeps the top 2,048 key-value entries shared across query heads, and the main attention reads only those entries, turning its cost from quadratic into linear at a fixed k. The indexer remains quadratic but cheap, and the whole mechanism was trained into the model rather than applied at inference. What is new here is that the efficiency gain is no longer only a serving argument: it is what makes long-horizon RL rollouts affordable, because each rollout replays a long context through attention many times. The curriculum entry for V3.2-Exp covers the mechanism in detail; read this report for what the cheaper attention bought.",
      },
      {
        kind: "prose",
        heading: "Post-training compute as the main variable",
        text: "The report's central claim is empirical: reasoning performance kept improving as the RL budget grew, and the budget now exceeds 10 percent of the pretraining cost. That is a striking ratio, because post-training is usually a rounding error next to pretraining. Two engineering pieces make it stable. A robust RL protocol handles the usual failure modes of long-horizon training - reward noise, length drift, and collapse - and a length-constraint reward model keeps generations from inflating without improving. The constraint is also the experiment: when the authors remove it to build Speciale, performance rises further, which tells you the constrained model was trading tokens for trainability rather than hitting a capability wall.",
      },
      {
        kind: "prose",
        heading: "Learning to think inside a tool loop",
        text: "Agentic post-training has a cold-start problem: a model that has never called a tool cannot learn from tool feedback, and supervised tool-use data is expensive to write by hand. The pipeline solves it in two steps. First, cold start: reuse the V3 recipe to unify reasoning and tool use in single trajectories, so the model sees one stream that contains thinking, a call, the result, and more thinking. Second, synthesis at scale: an automatic environment-synthesis agent builds 1,827 task-oriented environments with their toolsets and verification, plus more than 85,000 prompts that are hard to solve but easy to check. RL then runs against those verifiable environments, which is why the gains generalize rather than memorizing a fixed tool set.",
      },
      {
        kind: "formula",
        label: "Where the compute goes",
        expression:
          "post_training_compute > 0.10 * pretraining_compute\nSpeciale: remove the length-constraint reward -> longer trajectories, higher scores",
        why: "The inequality is the report's headline resource statement: RL is not a finishing pass but a second training phase with a budget comparable in spirit to a tenth of pretraining. The second line is the controlled consequence: keeping the protocol and the data fixed and removing only the length penalty raises the ceiling. That isolates length regularization as a trainability tool, not a capability limit.",
      },
      {
        kind: "visual",
        visual: "rl-reward-curve",
        caption:
          "Reasoning performance tracks the RL budget: the report attributes V3.2's parity with GPT-5 to post-training compute exceeding 10 percent of pretraining, and Speciale's gains to removing the length-constraint reward on top of that.",
      },
      {
        kind: "code",
        title: "A unified think-and-call trajectory",
        language: "python",
        code: `def agent_rollout(policy, env, question):
    """One trajectory interleaves reasoning and tool calls; the reward is the
    environment's verifiable check on the final answer."""
    context, steps = question, 0
    while steps < MAX_STEPS:
        out = policy.generate(context)          # think + optionally call
        if "tool_call" in out:
            result = env.execute(out["tool_call"])   # verifiable environment
            context += out["text"] + format(result)
        else:
            break                                # final answer emitted
        steps += 1
    return context, env.verify(context)

# The synthesis pipeline builds 1,827 such environments and 85k+ prompts;
# RL then optimizes the policy on the verifier's verdict.`,
        notes: [
          "The cold-start data shows the model this interleaving before RL ever runs, which is what makes the first rollouts useful instead of random.",
          "Verifiability is the constraint on synthesis: an environment is only usable if success can be checked mechanically, which is why tasks are generated hard to solve but easy to verify.",
          "The context keeps growing with each tool result, which is exactly the workload DSA's linear main attention was built to make affordable.",
        ],
      },
      {
        kind: "visual",
        visual: "sparse-attention",
        caption:
          "The architecture carried over from V3.2-Exp: a cheap FP8 indexer scores all past tokens, top-k selection keeps 2,048 shared entries per query, and the main attention reads only those - the efficiency that makes long agent rollouts affordable.",
      },
      {
        kind: "prose",
        heading: "Results and the honest limits",
        text: "The report compares V3.2 to GPT-5-class reasoning models at rough parity, with a cost advantage it emphasizes, and reports agentic numbers: SWE-bench Verified in the 72 to 74 range across frameworks and modes, Terminal Bench 2.0 at 46.4 using the Claude Code framework and 39.3 in non-thinking mode with Terminus, and tool-use scores of 63.8 (Airline), 81.1 (Retail), and 96.2 (Telecom) on the 2-bench categories. Speciale's gold medals at IMO, CMO, IOI, and ICPC are the headline. The limits section is unusually specific: world knowledge breadth still trails the leading closed model because total training FLOPs are lower; token efficiency is worse, since V3.2 needs longer generation trajectories to match output quality; and complex tasks remain behind the frontier. The context window is 128K, and some search-agent test cases exceed it, which required context management to score. Read this report for the RL budget argument and the environment synthesis recipe; read the Exp entry for the attention mechanism.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the report sets out to solve",
        text: "Open models were falling behind on complex tasks for three reasons the report names: expensive vanilla attention, too little post-training compute, and weak generalization in tool-use loops. V3.2 keeps the sparse attention from the Exp release and attacks the other two.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Two budgets. The RL section is about spending more post-training compute than the field usually does, with a protocol stable enough to survive it. The agent section is about manufacturing verifiable environments at scale. Read the Speciale comparison carefully: it isolates the length-constraint reward by removing it and changing nothing else.",
      },
      {
        kind: "prose",
        heading: "Evidence the report musters",
        text: "Post-training compute above 10 percent of pretraining; 1,827 synthesized environments and over 85,000 prompts; parity with GPT-5 on reasoning benchmarks in the report's comparisons; Speciale on par with Gemini-3.0-Pro and gold-medal results at IMO 2025, CMO 2025, IOI 2025, and ICPC World Finals; SWE-bench Verified 72-74 across settings; Terminal Bench 2.0 46.4 and 39.3; tool-use scores 63.8 / 81.1 / 96.2 on the three 2-bench categories; 128K context.",
      },
      {
        kind: "prose",
        heading: "Limits the report admits",
        text: "World knowledge lags because of lower total training FLOPs; token efficiency is worse than the leading closed model, so equivalent quality costs more generated tokens; and complex tasks remain behind the frontier. The agent scores depend on context management because 128K is smaller than some test cases, and the framework used affects reported Terminal Bench numbers.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "Treat post-training as a first-class compute budget, not a finishing touch: if reasoning keeps improving with RL compute, the constraint is protocol stability, not headroom. When you need agentic behavior, synthesize verifiable environments instead of collecting demonstrations, and let RL discover the loops. And keep a length penalty while training even if you remove it for your best model - it buys stability at a known price.",
      },
    ],
    questions: [
      {
        id: "v32f-q1",
        prompt:
          "Which three deficiencies does the V3.2 report name for open models?",
        options: [
          "Small vocabularies, slow tokenizers, and weak multilingual data",
          "Vanilla attention for long sequences, too little post-training compute, and weak agentic generalization and instruction following",
          "Missing MoE routing, no FP8 training, and no multimodal input",
          "Excessive parameter counts, poor quantization, and licensing limits",
        ],
        answer: 1,
        explanation:
          "The report's diagnosis is architectural efficiency, post-training resource allocation, and agentic capability. V3.2 answers the first with the DSA architecture it inherits from the Exp release, and the paper's new work targets the second and third.",
      },
      {
        id: "v32f-q2",
        prompt:
          "What is the report's headline resource claim about post-training?",
        options: [
          "Post-training costs less than one percent of pretraining",
          "Post-training compute exceeds 10 percent of the pretraining budget, and reasoning performance kept improving as it grew",
          "Post-training is entirely replaced by distillation",
          "Pretraining compute was doubled to avoid post-training",
        ],
        answer: 1,
        explanation:
          "The report states the RL budget exceeds 10 percent of pretraining cost and treats that expansion as the main driver of the reasoning gains. This is unusual in a field where post-training is typically a small fraction.",
      },
      {
        id: "v32f-q3",
        prompt:
          "How does the agentic synthesis pipeline make training data usable for RL?",
        options: [
          "By collecting human demonstrations for every tool",
          "By generating environments and prompts that are hard to solve but easy to verify, so RL can check outcomes mechanically",
          "By training a reward model on preferences",
          "By removing tools from the training loop",
        ],
        answer: 1,
        explanation:
          "The synthesis agent builds 1,827 environments and 85,000-plus prompts with verification built in. The hard-to-solve, easy-to-verify property is what makes the data a valid RL signal rather than a demonstration set.",
      },
      {
        id: "v32f-q4",
        prompt:
          "What distinguishes V3.2-Speciale from V3.2 in the report's account?",
        options: [
          "A larger parameter count",
          "The length-constraint reward is removed, allowing longer reasoning trajectories, which raises scores to Gemini-3.0-Pro level and gold-medal competition results",
          "It uses dense attention instead of DSA",
          "It is a distilled smaller model",
        ],
        answer: 1,
        explanation:
          "Speciale keeps the protocol and data but drops the length penalty, letting generations grow. That isolates length regularization as a trainability trade rather than a capability ceiling, and the variant goes on to gold-medal results at IMO, CMO, IOI, and ICPC.",
      },
      {
        id: "v32f-q5",
        prompt:
          "Which limitation does the report state about V3.2's knowledge and efficiency?",
        options: [
          "The model cannot use tools",
          "World knowledge lags the leading closed model because of fewer total training FLOPs, and token efficiency is worse, needing longer trajectories for comparable quality",
          "The context window is unlimited",
          "It has no benchmark regressions",
        ],
        answer: 1,
        explanation:
          "The limitations section names knowledge breadth, token efficiency, and complex-task performance. It is a specific, self-critical list, and it names the mechanism for the first: lower total training FLOPs than the frontier closed models.",
      },
    ],
    practice: {
      articles: ["art-post-training", "art-attention"],
      problems: ["rl-306", "dl-075", "dl-210", "ca-225"],
    },
  },
  {
    id: "mhc",
    slug: "mhc",
    title: "mHC: Manifold-Constrained Hyper-Connections",
    short: "mHC",
    year: 2025,
    date: "2025-12-31",
    arxivId: "2512.24880",
    url: "https://arxiv.org/abs/2512.24880",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Widen the residual stream for expressivity, but keep the identity property: project the mixing matrix onto the manifold of doubly stochastic matrices so the signal can mix but never amplify.",
    whatItIs:
      "Hyper-Connections (HC) generalize the residual connection by widening the residual stream into several parallel streams with learned read, write, and forward-mixing matrices. The expressivity gain is real, but the forward matrix is unconstrained, so when many of them multiply across layers the signal can explode or vanish, and training becomes unstable at scale. mHC fixes this by projecting the forward matrix onto the Birkhoff polytope - the set of doubly stochastic matrices - using the Sinkhorn-Knopp algorithm. Rows and columns sum to one, so the transform is a convex combination of streams: the mean is preserved and the spectral norm is bounded by one, and because the set is closed under multiplication the bound survives any depth. On MoE models up to 27B parameters the method removes HC's instabilities, improves on both the baseline and HC on downstream benchmarks, and costs only 6.7 percent extra training time after kernel fusion, mixed-precision kernels, selective recomputation, and pipeline overlap.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-v3",
      context:
        "An architecture paper about the residual path rather than the attention or the experts. It trains MoE models built in the V3 style, uses the DualPipe schedule from the V3 infrastructure, and produces a component that the V4 generation then adopts - the frontier era reaching back into the trunk's oldest design decision.",
      improved: [
        "Identifies the failure mode of Hyper-Connections precisely: the unconstrained forward mixing matrix can amplify signals exponentially across layers, measured at up to about 3000x gain versus roughly 1.6x for mHC.",
        "Projects the residual mixing matrix onto the Birkhoff polytope with Sinkhorn-Knopp, restoring the identity-mapping property in generalized form: a convex combination of streams, with spectral norm bounded by one.",
        "Keeps expressivity while bounding it, because the doubly stochastic set is closed under matrix multiplication, so composite mappings across arbitrary depth stay non-expansive.",
        "Delivers the improvement at system cost: 6.7 percent additional training time at expansion rate n = 4 after TileLang kernel fusion, mixed precision, selective recomputation, and overlap inside DualPipe.",
        "Validates across 3B, 9B, and 27B MoE models plus a 1T-token token-scaling run, with a final loss reduction of 0.021 versus the baseline and gains such as +2.1 on BBH and +2.3 on DROP versus HC.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The residual connection is a stability contract",
        text: "Every deep transformer is trainable because of one line: x_{l+1} = x_l + F(x_l). The identity path means a gradient or a signal can travel from layer 1 to layer 60 without being multiplied by sixty learned matrices, so neither explodes nor vanishes. The cost is that the residual stream is one vector wide, and every layer reads and writes through the same channel. Hyper-Connections widen it: the stream becomes several parallel vectors, and learned matrices decide how to read from the streams into a layer, how to write the layer's output back, and how to mix the streams forward. More routes between layers means more expressive topology, and that is the whole appeal.",
      },
      {
        kind: "prose",
        heading: "Where HC breaks, in numbers",
        text: "The forward mixing matrix is learned and unconstrained. If its spectral norm is slightly above one, the product of many such matrices grows exponentially with depth; if slightly below, it decays. The paper measures this directly with the maximum gain magnitude of the residual mapping and reports values up to roughly 3000 in HC, against about 1.6 for its constrained version. A network with a 3000x gain somewhere in its depth is a network whose loss spikes, whose gradients diverge, and whose training requires rescues. This is the same problem the original identity mapping solved for free, reappearing because the architecture generalized away the guarantee.",
      },
      {
        kind: "prose",
        heading: "Constrain to doubly stochastic matrices",
        text: "The fix is geometric. Restrict the forward matrix B to the Birkhoff polytope: non-negative entries with every row and every column summing to one. Three properties follow. First, B is a convex combination operator: each stream's next value is an average of the current streams, so the mean is conserved and no stream can be amplified. Second, the spectral norm of a doubly stochastic matrix is at most one, so the mapping is non-expansive. Third, the set is closed under multiplication, so a product of such matrices is itself doubly stochastic and the bound holds at any depth. The read and write maps A and C are kept non-negative and bounded with a sigmoid instead, because they must be able to emphasize and suppress features; only the forward path needs the strict constraint.",
      },
      {
        kind: "formula",
        label: "The mHC residual update",
        expression:
          "X_{l+1} = B_l * X_l + C_l * F_l(A_l * X_l)\nB_l = SinkhornKnopp( exp(H_l) ),  B_l >= 0,  B_l * 1 = 1,  1^T * B_l = 1^T",
        why: "X_l is the stack of parallel residual streams, A_l reads one d-dimensional vector into layer F_l, C_l writes the output back into the streams, and B_l mixes the streams forward. The exponential makes the learned values positive and the Sinkhorn-Knopp iteration alternately normalizes rows and columns until both sum to one, producing a differentiable projection onto the manifold. The update keeps HC's structure and replaces its unconstrained forward map with a convex combination, which is what restores stability without collapsing the streams into one.",
      },
      {
        kind: "code",
        title: "Sinkhorn-Knopp projection",
        language: "python",
        code: `def sinkhorn(logits, iters=20):
    """Project a positive matrix onto the doubly stochastic manifold by
    alternately normalizing rows and columns."""
    m = [[pow(2.718281828, x) for x in row] for row in logits]
    n = len(m)
    for _ in range(iters):
        for i in range(n):                    # row normalization
            s = sum(m[i])
            m[i] = [x / s for x in m[i]]
        for j in range(n):                    # column normalization
            s = sum(m[i][j] for i in range(n))
            for i in range(n):
                m[i][j] /= s
    return m

B = sinkhorn([[0.1, 0.2, 0.3, 0.4]] * 4)
print([round(sum(row), 6) for row in B])            # rows sum to 1
print([round(sum(B[i][j] for i in range(4)), 6) for j in range(4)])`,
        notes: [
          "The paper uses 20 iterations, which makes the projection approximate rather than exact; the residual deviation in the backward gain stays bounded and small.",
          "Because the stream count is tiny (expansion rate 4 in the experiments), the iteration is cheap and fully differentiable inside the graph.",
          "In the fused kernel the whole projection runs as one operation, which is part of how the overhead stays at 6.7 percent.",
        ],
      },
      {
        kind: "prose",
        heading: "Making it fast enough to use",
        text: "A constraint that doubles training time is not a fix. The paper's systems half is what makes mHC practical: kernel fusion that merges the RMSNorm (the normalization layer), the mixing, and the complete Sinkhorn iteration into unified kernels; mixed-precision implementations written with TileLang; selective recomputation to cut the memory footprint of the intermediate activations; and communication overlapped inside the DualPipe schedule borrowed from the V3 stack. With all of it, expansion rate n = 4 costs 6.7 percent additional training time, and the paper reports the scaling behavior across 3B, 9B, and 27B models so the overhead is not a single measurement.",
      },
      {
        kind: "visual",
        visual: "timeline",
        caption:
          "Three steps in the residual path: the plain identity connection, HC's unconstrained multi-stream mixing, and mHC's projection onto the doubly stochastic manifold, which restores the boundedness the identity gave for free.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "The stability and the bill: composite gain magnitude drops from roughly 3000x in HC to about 1.6x in mHC, while the measured training-time overhead at expansion rate 4 is 6.7 percent.",
      },
      {
        kind: "prose",
        heading: "Results, limits, and why it matters here",
        text: "On the 27B MoE model, mHC eliminates the loss spikes and gradient-norm blowups seen in HC, achieves a final loss 0.021 lower than the baseline, beats the baseline on all eight reported benchmarks, and beats HC on most, with +2.1 on BBH and +2.3 on DROP. The limits are stated in the paper's own terms: the Sinkhorn projection is approximate at 20 iterations, so the backward gain deviates slightly from one; the overhead is real, if small; and validation stops at 27B, far below the frontier scale where the instability it fixes was most feared. The reason this paper sits in the curriculum is the last mile: V4 adopts mHC for its million-token stack, which makes this the rare methods paper whose component ships in the next flagship release.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Hyper-Connections buy expressivity by widening and mixing the residual stream, but the unconstrained mixing matrix destroys the identity-mapping guarantee and makes large-scale training unstable. The paper asks whether the expressivity can be kept while the stability guarantee is restored by construction.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The manifold argument in Section 2: why doubly stochastic matrices give conservation, a spectral-norm bound, and closure under composition. Then read the systems section, because the 6.7 percent overhead is the difference between a theoretical fix and a usable one. The signal-propagation analysis with the gain measurements is the evidence for the diagnosis.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "MoE models at 3B, 9B, and 27B parameters, plus a 3B run on 1T tokens for token scaling. Composite gain magnitude about 1.6 for mHC versus up to about 3000 for HC. Final loss 0.021 below the baseline, stable gradient norms, wins on eight downstream benchmarks including +2.1 BBH and +2.3 DROP over HC. Training overhead 6.7 percent at expansion rate n = 4 with the full optimization stack, Sinkhorn at 20 iterations.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The projection is approximate, so the gain bound holds only up to the residual Sinkhorn error; the overhead, while small, is not zero; and the largest validated model is 27B, so extrapolation to frontier scale is an argument rather than a measurement. The doubly stochastic constraint deliberately narrows the architecture's expressive range, which the authors accept as the price of stability.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "When you generalize a stabilizing mechanism, write down the property that made it stable and enforce it geometrically. Identity mapping is a special case of a convex combination; the Birkhoff polytope is the set where that property survives composition. Then budget for kernels, because a constraint that is mathematically clean but five times slower will not ship.",
      },
    ],
    questions: [
      {
        id: "mhc-q1",
        prompt: "What problem do Hyper-Connections introduce?",
        options: [
          "They shrink the residual stream to one vector",
          "The learned forward mixing matrix is unconstrained, so composed across layers it can amplify or attenuate signals exponentially, causing instability at scale",
          "They remove attention from the block",
          "They force all layers to share weights",
        ],
        answer: 1,
        explanation:
          "HC widens the stream and adds learned read, write, and forward matrices. The forward matrix has no bound on its spectral norm, so the product over many layers can grow without limit; the paper measures gain magnitudes up to about 3000.",
      },
      {
        id: "mhc-q2",
        prompt:
          "Why is the Birkhoff polytope the right manifold for the forward matrix?",
        options: [
          "It makes the matrix sparse for fast kernels",
          "Doubly stochastic matrices act as convex combinations, have spectral norm at most one, and the set is closed under multiplication, so the bound holds at any depth",
          "It guarantees the matrix is invertible",
          "It forces the streams to be identical",
        ],
        answer: 1,
        explanation:
          "The three properties are exactly what the identity connection used to provide for free: no amplification, bounded composition, and conservation of the stream average. Invertibility is irrelevant, and convex combination still allows genuine mixing among streams.",
      },
      {
        id: "mhc-q3",
        prompt: "What does the Sinkhorn-Knopp step do in mHC?",
        options: [
          "It sorts the experts by load",
          "It alternately normalizes rows and columns of the exponentiated learned matrix until both sum to one, projecting it onto the doubly stochastic manifold differentiably",
          "It compresses the KV cache",
          "It computes the loss scaling factor",
        ],
        answer: 1,
        explanation:
          "The learned values are exponentiated to be positive, then row and column normalization are alternated. Twenty iterations make the result approximately doubly stochastic, and the whole operation is differentiable and cheap because the stream count is small.",
      },
      {
        id: "mhc-q4",
        prompt:
          "What did the engineering work buy, and why does it matter?",
        options: [
          "It removed the constraint entirely",
          "Kernel fusion, mixed precision, selective recomputation, and DualPipe overlap cut the overhead to 6.7 percent at expansion rate 4, making the stability fix practical to train",
          "It doubled the expansion rate",
          "It eliminated the need for a residual path",
        ],
        answer: 1,
        explanation:
          "A constraint that is too slow will not be used. The fused kernels run the entire Sinkhorn iteration in one operation, and the memory and overlap optimizations keep the extra cost small enough to be a rounding error on a large run.",
      },
      {
        id: "mhc-q5",
        prompt:
          "Which limit does the paper itself acknowledge?",
        options: [
          "The method cannot train at 3B scale",
          "The projection is approximate at 20 Sinkhorn iterations and the largest validated model is 27B, so frontier-scale behavior is argued rather than measured",
          "The method only works with dense models",
          "Doubly stochastic matrices cannot be multiplied",
        ],
        answer: 1,
        explanation:
          "The paper is explicit about the approximation and about the validation range. The closure property it relies on is exactly about multiplication, so that last option is the opposite of the mathematics.",
      },
    ],
    practice: {
      concepts: ["la-matrix-ops", "la-eigen-inverse"],
      articles: ["art-eigenvectors", "art-gradient-descent"],
      problems: ["dl-370", "dl-384", "dl-401"],
    },
  },
  {
    id: "engram",
    slug: "engram",
    title:
      "Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models",
    short: "Engram",
    year: 2026,
    date: "2026-01-12",
    arxivId: "2601.07372",
    url: "https://arxiv.org/abs/2601.07372",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "MoE spends capacity on computation; Engram spends it on memory. Hash N-grams to a giant embedding table, look facts up in O(1), and split the sparse budget between the two.",
    whatItIs:
      "Engram is DeepSeek's proposal for a second axis of sparsity. Mixture-of-experts scales capacity by choosing which parameters compute a token, but the model still has to reconstruct static knowledge - names, formulas, idioms - through dynamic computation. Engram instead modernizes the classic N-gram embedding table into a conditional memory module: the token's recent N-grams are hashed to indices, the corresponding rows of a large embedding table are looked up in constant time, and a contextual gate fuses the retrieved memory into the hidden state. The paper frames the design question as a sparsity allocation problem - how much of a fixed sparse parameter budget should be computation and how much memory - and finds a U-shaped curve whose optimum is roughly 75 to 80 percent MoE and 20 to 25 percent memory. An Engram-27B model built by converting experts into a 5.7B-parameter memory table beats its strictly iso-parameter, iso-FLOPs MoE baseline across knowledge, reasoning, code, and math benchmarks, with the largest gains on reasoning rather than recall, and it lifts long-context retrieval from 84.2 to 97.0 on multi-query needle-in-a-haystack. The code is open.",
    theoryMinutes: 14,
    lineage: {
      from: "deepseek-v3",
      context:
        "A research satellite that grows out of the MoE line rather than the model line. It uses DeepSeekMoE models as the baseline it reallocates against, and its finding - that lookup is a complement to computation, not a replacement - is the kind of architectural claim the V-series kept testing at scale.",
      improved: [
        "Names a new sparsity axis: conditional memory, where static knowledge is retrieved by hash lookup instead of recomputed by experts.",
        "Modernizes N-gram embeddings with tokenizer compression, multi-head hashing, contextualized gating, and multi-branch integration so a huge table can be trained and served.",
        "Formulates the sparsity allocation problem and measures a U-shaped scaling law: reallocating about 20 to 25 percent of sparse parameters from experts to memory minimizes loss, and pure MoE is suboptimal.",
        "Scales to Engram-27B, which beats a strictly iso-parameter and iso-FLOPs MoE baseline on knowledge (MMLU about +3), reasoning (BBH +5.0, ARC-Challenge +3.7), and code and math (HumanEval +3.0, MATH +2.4).",
        "Improves long-context retrieval substantially (multi-query needle-in-a-haystack 84.2 to 97.0) and enables host-memory offload through deterministic addressing with negligible runtime overhead.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "Two ways to spend capacity",
        text: "A transformer stores knowledge in its weights, and at inference it retrieves that knowledge by computing: attention routes information and the feed-forward network reconstructs facts from distributed parameters. That is powerful and flexible, but it is also wasteful for knowledge that is fixed and local - a frequent phrase, a named entity, a formula, a code idiom. A lookup table answers those in one step, and a lookup is exactly what the model does not have. The paper's argument is that computation and memory are different resources with different costs, and a sparse model should allocate capacity to both rather than putting everything into experts.",
      },
      {
        kind: "prose",
        heading: "What Engram is, mechanically",
        text: "The module takes the last few tokens and forms their N-grams, compresses them through the tokenizer's structure so semantically equivalent suffixes share keys, hashes each compressed N-gram with several independent hash heads, and gathers the corresponding rows from a very large embedding table. Because the keys are hash indices, the lookup is constant time and, crucially, deterministic: the indices are known as soon as the token sequence is, before the layer that consumes them runs. A learned gate conditioned on the current hidden state decides how much retrieved memory to mix into the stream, and multiple branches let different N-gram orders contribute in parallel. The retrieved vectors are static, but how much they matter is contextual, which is the difference between a memory module and a lookup bolted onto a language model.",
      },
      {
        kind: "formula",
        label: "The sparsity allocation problem",
        expression:
          "rho = memory_params / (memory_params + expert_params)\nloss(rho) is U-shaped: minimum near rho ~ 0.20-0.25\npure MoE (rho = 0) is suboptimal",
        why: "The total sparse budget is fixed, so every parameter given to memory is a parameter taken from experts. If memory were a substitute for computation, loss would fall monotonically as rho grows; if it were useless, loss would rise monotonically. The measured U shape says it is a complement: some memory frees experts from static reconstruction, and too much memory starves the computation that handles the dynamic parts. In the paper's 10B-scale experiments the optimum sits at roughly rho = 0.20 to 0.25, stable across compute regimes.",
      },
      {
        kind: "code",
        title: "A hashed N-gram lookup",
        language: "python",
        code: `def ngram_keys(tokens, n=3, heads=8, table_size=10**7):
    """Deterministic keys: same suffix -> same key, computable before the
    layer runs, which is what allows host-memory prefetch."""
    keys = []
    for start in range(max(0, len(tokens) - n), len(tokens)):
        suffix = tokens[start:]
        for h in range(heads):
            hsh = h + 1                      # seed each head differently
            for token in suffix:
                hsh = (hsh * 31 + token) % table_size
            keys.append((h, hsh))
    return keys

def engram_read(embedding_table, keys, gate):
    # each key gathers one row; the gate weights the fused result
    rows = [embedding_table[k] for k in keys]
    fused = [sum(r[i] for r in rows) / len(rows) for i in range(len(rows[0]))]
    return [gate * f for f in fused]

# table_size can be very large: the memory is the point, and static addressing
# means it can live off the GPU with prefetching.`,
        notes: [
          "The rolling hash is written out on purpose: Python's built-in hash() is randomized per process, so it would break the promise that the same suffix always maps to the same row.",
          "Multi-head hashing is a collision mitigation: several independent hashes make it unlikely that all heads collide for the same N-gram.",
          "Tokenizer compression groups suffixes that decode to the same text, so the table is not wasted on byte-level variants.",
          "The paper instantiates Engram at selected layers (2 and 15 in the 27B model) with N-gram order up to 3, 8 heads, and dimension 1280.",
        ],
      },
      {
        kind: "visual",
        visual: "moe-routing",
        caption:
          "Two sparse paths for one token: experts selected by the router for dynamic computation, and N-gram rows selected by hash for static memory. The allocation law decides how the parameter budget splits between them.",
      },
      {
        kind: "prose",
        heading: "The 27B experiment",
        text: "The main result is a controlled conversion. Start from an MoE-27B model with 72 routed experts per layer, remove 17 of them, and spend the freed parameters on a 5.7B-parameter Engram table, giving an allocation ratio of 74.3 percent computation and 25.7 percent memory at the same total size of 26.7 billion parameters. Train both with the same tokens and the same FLOP budget. Engram-27B improves on the baseline across every reported domain: MMLU about +3, CMMLU +4.0, MMLU-Pro +1.8, BBH +5.0, ARC-Challenge +3.7, DROP +3.3, HumanEval +3.0, MBPP +1.6, GSM8K +2.2, MATH +2.4. The pattern is the interesting part: gains on reasoning and code exceed the gains on knowledge tests, which is the opposite of what a pure lookup table should buy.",
      },
      {
        kind: "prose",
        heading: "Why reasoning improves",
        text: "The mechanistic analysis offers an explanation: with static patterns handled by lookup, the early layers no longer spend their capacity reconstructing them, which effectively deepens the network available for reasoning, and attention is freed from local bookkeeping to handle global context. The long-context numbers support the second half: multi-query needle-in-a-haystack rises from 84.2 to 97.0, and variable tracking from 77.0 to 89.0. The paper also trains an Engram-40B variant, which continues to reduce loss and improve most benchmarks, though the authors note it is under-trained at the current token budget.",
      },
      {
        kind: "visual",
        visual: "cost-bars",
        caption:
          "Gains over an iso-parameter, iso-FLOPs MoE baseline: about +3 MMLU, +5.0 BBH, +3.7 ARC-Challenge, +3.0 HumanEval, +2.4 MATH, plus a large long-context retrieval jump - from reallocating roughly a quarter of sparse parameters from experts to memory.",
      },
      {
        kind: "prose",
        heading: "Systems: deterministic addressing",
        text: "A giant embedding table is only practical if it does not have to sit in HBM next to the experts. Engram's keys are static functions of the token sequence, so the next lookup's indices can be computed before the corresponding layer executes, which makes prefetching from host memory possible and decouples storage from compute. The paper reports negligible overhead from the offload and treats this infrastructure-aware property as a first-class design goal rather than a side effect. It is the same instinct as the sparse-attention line: the arithmetic is only half the design; the memory hierarchy decides whether the arithmetic's advantage is real.",
      },
      {
        kind: "prose",
        heading: "Limits and how to read it",
        text: "The evidence comes from 27B and 40B models trained at research scale, not from a frontier release, so the allocation law is measured in a range where the U shape could still shift. The optimum is stable across the compute regimes tested, but those regimes are small by the standards of the V-series. The memory table is large, and while offload makes it affordable, it is still memory that must be stored and served. The U shape is empirical: the paper does not derive the optimum from theory, so treat it as a measured regularity rather than a constant. Read this alongside the V4.1-Flash entry, which ships a 196B-parameter Engram in a production model, as the first evidence that the idea scales beyond the paper.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Sparse models allocate all their conditional capacity to computation, forcing experts to reconstruct static knowledge that a lookup could return directly. The paper asks whether memory should be a second sparse axis, and how a fixed budget should be split between the two.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "Three pieces: the Engram module's design (tokenizer compression, multi-head hashing, contextual gating, multi-branch integration), the sparsity allocation problem and its U-shaped curve, and the mechanistic analysis of why reasoning improves. Read the iso-parameter, iso-FLOPs comparison, because that is the control that makes the result meaningful.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "A U-shaped validation-loss curve with the optimum near 20 to 25 percent memory allocation, stable across the tested compute regimes; in the 10B regime, loss improves from 1.7248 at pure MoE to 1.7109 near the optimum. Engram-27B (5.7B memory, 55 routed experts, 26.7B total) improves MMLU about +3, CMMLU +4.0, MMLU-Pro +1.8, BBH +5.0, ARC-Challenge +3.7, DROP +3.3, HumanEval +3.0, MBPP +1.6, GSM8K +2.2, MATH +2.4, and lifts multi-query NIAH from 84.2 to 97.0 and variable tracking from 77.0 to 89.0. An Engram-40B variant continues improving but is under-trained.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The allocation law is empirical and measured at research scale; the largest model is 40B and under-trained. The memory table adds storage and serving complexity even when offloaded, and the gains are reported against one baseline architecture. The paper frames conditional memory as an indispensable primitive for future sparse models, which is a hypothesis its own experiments support but do not prove at frontier scale.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "If a fixed fact is cheap to look up, do not make a network recompute it. When you have a sparse budget, try spending part of it on memory and measure the allocation curve rather than assuming more computation is always better. Prefer deterministic addressing, because it converts a memory-capacity problem into a prefetch scheduling problem, which is much easier to solve.",
      },
    ],
    questions: [
      {
        id: "eng-q1",
        prompt: "What does Engram add to a sparse model?",
        options: [
          "A second attention mechanism",
          "A conditional memory module: hashed N-gram lookups into a large embedding table, gated into the hidden state",
          "A larger tokenizer vocabulary",
          "A dense feed-forward layer",
        ],
        answer: 1,
        explanation:
          "Engram retrieves static N-gram memory by hash lookup in constant time and fuses it through a context-dependent gate. It complements MoE's conditional computation rather than replacing it, and the paper calls the pair two axes of sparsity.",
      },
      {
        id: "eng-q2",
        prompt:
          "The allocation curve is U-shaped with an optimum near 20 to 25 percent memory. What does the shape mean?",
        options: [
          "Memory and computation are substitutes, so more memory always helps",
          "Memory is useless for language modeling",
          "Memory and computation are complements: some memory frees experts from static reconstruction, but too much starves dynamic computation",
          "The optimum is a measurement artifact",
        ],
        answer: 2,
        explanation:
          "A monotone curve would mean one resource dominates. The U shape says the best model mixes them: memory handles static patterns cheaply, experts handle the dynamic reasoning, and the budget should be split rather than concentrated.",
      },
      {
        id: "eng-q3",
        prompt:
          "In the Engram-27B comparison, what exactly is held constant?",
        options: [
          "Only the parameter count",
          "Total parameters and per-token FLOPs: 17 routed experts are converted into a 5.7B-parameter memory table, and both models train on the same tokens",
          "Only the number of layers",
          "Nothing; the comparison is between different model families",
        ],
        answer: 1,
        explanation:
          "The Engram model is derived from the MoE baseline by removing 17 of 72 routed experts per layer and spending the parameters on memory, keeping the total at 26.7B and the FLOPs matched. That control is what makes the gains attributable to the allocation rather than to more capacity.",
      },
      {
        id: "eng-q4",
        prompt:
          "Which result is most surprising, given that Engram is a memory mechanism?",
        options: [
          "MMLU improves",
          "Reasoning benchmarks improve more than knowledge benchmarks (BBH +5.0, ARC-Challenge +3.7)",
          "The embedding table is large",
          "Training converges",
        ],
        answer: 1,
        explanation:
          "A lookup table should help recall, so the large reasoning gains are the puzzle. The paper's mechanistic analysis suggests memory relieves early layers of static reconstruction, effectively deepening the network, and frees attention capacity for global context - which shows up as better long-context retrieval too.",
      },
      {
        id: "eng-q5",
        prompt: "Why does deterministic addressing matter operationally?",
        options: [
          "It makes the hash function collision-free",
          "Because keys depend only on the token sequence, the next lookup's indices are known before the layer runs, so the table can be prefetched from host memory with negligible overhead",
          "It removes the need for a gate",
          "It reduces the table size",
        ],
        answer: 1,
        explanation:
          "Routing-based MoE activations depend on hidden states and cannot be prefetched with certainty; Engram's hash keys can. That decoupling of storage and compute is what makes a very large embedding table practical to serve.",
      },
    ],
    practice: {
      concepts: ["info-entropy", "ml-probabilistic"],
      articles: ["art-embeddings", "art-rag"],
      problems: ["nlp-026", "dl-017", "dl-003"],
    },
  },
  {
    id: "deepseek-ocr-2",
    slug: "deepseek-ocr-2",
    title: "DeepSeek-OCR 2: Visual Causal Flow",
    short: "DeepSeek-OCR 2",
    year: 2026,
    date: "2026-01-27",
    arxivId: "2601.20552",
    url: "https://arxiv.org/abs/2601.20552",
    kind: "paper",
    era: "frontier",
    tier: "advanced",
    tagline:
      "Stop reading images in raster order. Let learnable queries attend over the whole page and hand the language model a semantically reordered sequence instead of a top-left-to-bottom-right scan.",
    whatItIs:
      "DeepSeek-OCR 2 keeps the optical compression idea of the first model and replaces its encoder's CLIP block with DeepEncoder V2, an LLM-style module that reorders visual tokens before the decoder sees them. Visual tokens keep bidirectional attention so global context is preserved, while a set of learnable causal flow queries, appended after them, attend to all visual tokens and to one another in causal order. Because the queries have the same cardinality as the visual tokens, only their outputs are passed to the language decoder, and the total sequence does not grow: 256 tokens for the global view plus 144 per local crop, capped at 1120. The paper describes the result as two cascaded one-dimensional causal reasoners - the encoder chooses a reading order, the decoder reasons over it - and reports 91.09 percent on OmniDocBench v1.5, a 3.73 point gain over DeepSeek-OCR, with reading-order edit distance falling from 0.085 to 0.057 and production repetition rates dropping from 6.25 to 4.17 percent on user-log images.",
    theoryMinutes: 13,
    lineage: {
      from: "deepseek-ocr",
      context:
        "The second step in the optical compression line. The first model asked how many vision tokens a page needs; this one asks in what order those tokens should arrive. It is a small, focused change with a clear claim: the rigid raster scan that every vision-language model inherits from image grids is the wrong interface for documents.",
      improved: [
        "Replaces DeepEncoder's CLIP component with DeepEncoder V2, an LLM-style encoder whose learnable causal flow queries reorder visual tokens by semantics before the decoder reads them.",
        "Keeps visual tokens under bidirectional attention for global modeling while queries run causal attention, combining both in one customized attention mask.",
        "Preserves the token budget: queries have the same cardinality as visual tokens, so only query outputs are forwarded and the sequence stays at 256 to 1120 tokens, at or below the previous model's 1156.",
        "Raises OmniDocBench v1.5 to 91.09 percent, a 3.73 point gain over DeepSeek-OCR, and cuts reading-order edit distance from 0.085 to 0.057.",
        "Improves production robustness: repetition rate falls from 6.25 to 4.17 percent on online user-log images and from 3.69 to 2.88 percent on PDF data production.",
      ],
    },
    theory: [
      {
        kind: "prose",
        heading: "The raster scan is an assumption, not a law",
        text: "Vision-language models flatten an image grid in a fixed order, usually left to right, top to bottom, and encode position with a fixed positional scheme. Language models, meanwhile, read causal sequences. For a photograph the order hardly matters; for a page it matters a great deal, because a document has a logical reading order that a raster scan does not follow. Multi-column layouts, sidebars, figures with captions, and tables all break the assumption, and the model pays for it in the reading-order mistakes that show up downstream as garbled output. The paper's premise is that the order should be decided from the image's semantics rather than imposed by the grid.",
      },
      {
        kind: "prose",
        heading: "DeepEncoder V2: bidirectional seeing, causal ordering",
        text: "The encoder keeps DeepSeek-OCR's window-attention perception stage and the 16x compressor, and swaps the CLIP block for a small LLM-style stack with a custom mask. Visual tokens are processed bidirectionally, exactly as a vision encoder would, so each token sees the whole page and global modeling is not lost. Appended after them is a set of learnable query tokens - the causal flow queries - that run causal attention: each query attends to every visual token and to the queries before it. The queries therefore form a sequence that progressively summarizes the page in a chosen order, and because there are as many queries as visual tokens, the outputs can replace the visual sequence one for one. Only the query outputs are handed to the language decoder, which then reasons over an already-ordered sequence with its ordinary causal attention.",
      },
      {
        kind: "formula",
        label: "The dual-stream attention mask",
        expression:
          "M = [ [ 1, 0 ],\n      [ 1, LowerTri(Q) ] ]\nvisual tokens: bidirectional block (top-left all ones)\nqueries: causal block (bottom-right lower triangular)",
        why: "The mask is the mechanism. The top-left block lets every visual token attend to every other visual token, preserving the global view. The bottom-left block lets every query attend to all visual tokens, so ordering decisions see the whole page. The bottom-right block is causal, so query i only sees queries before it and the ordering process is itself autoregressive. The top-right zeros keep visual tokens from peeking at the queries, so the visual representation is not contaminated by the ordering that is being derived from it.",
      },
      {
        kind: "code",
        title: "Building the mask for one crop",
        language: "python",
        code: `def dual_mask(n_visual, n_query):
    """True means 'may attend'. Visual block bidirectional, query block causal."""
    size = n_visual + n_query
    mask = [[False] * size for _ in range(size)]
    for i in range(n_visual):                      # visual -> visual
        for j in range(n_visual):
            mask[i][j] = True
    for i in range(n_visual, size):                # query -> all visual
        for j in range(n_visual):
            mask[i][j] = True
        for j in range(n_visual, i + 1):           # query -> earlier queries
            mask[i][j] = True
    return mask

# 144 local queries per crop, 256 global queries; query outputs alone are fed
# to the LLM decoder, so the token count the decoder sees does not grow.`,
        notes: [
          "Equal cardinality is the trick that keeps the token budget flat: the queries do not add tokens, they replace the visual tokens in the decoder's input.",
          "The global view uses 256 queries and each local crop 144, so the sequence ranges from 256 to 1120 tokens - lower than the previous model's 1156 and matching Gemini-3-Pro's stated maximum visual token budget.",
          "Because only query outputs are forwarded, the decoder never sees the raw visual tokens; it sees a causally ordered summary of them.",
        ],
      },
      {
        kind: "visual",
        visual: "vision-tower",
        caption:
          "DeepEncoder V2: window-attention perception and the 16x compressor feed an LLM-style block where visual tokens attend bidirectionally and causal flow queries reorder them; only the ordered query outputs reach the decoder.",
      },
      {
        kind: "prose",
        heading: "Two cascaded one-dimensional reasoners",
        text: "The paper's conceptual framing is worth taking seriously: a two-dimensional image is being understood by two one-dimensional causal processes in series. The encoder's queries perform reading-logic reasoning, deciding an order; the decoder performs task reasoning over the sequence that order produced. Neither stage has to model two dimensions at once, which is precisely why the arrangement is efficient - each is a standard causal sequence model doing what it is good at. The paper calls the decomposition a possible route toward genuine 2D reasoning and is careful to say it is a long journey: multi-hop re-examination of a page would need longer causal flow sequences than the visual tokens they replace.",
      },
      {
        kind: "prose",
        heading: "Results, production behavior, and limits",
        text: "On OmniDocBench v1.5 the model reaches 91.09 percent, up 3.73 points from DeepSeek-OCR under similar training data, while reading-order edit distance falls from 0.085 to 0.057 - the metric that most directly reflects the reordering claim. In production, where ground truth is unavailable, the reported signal is repetition rate: 6.25 to 4.17 percent on online user-log images and 3.69 to 2.88 percent on PDF data generation, which matters because repetition is the failure mode that ruins batch document processing. The limits are the flip side of the design: the method is validated on OCR and document understanding rather than general visual reasoning; the query count is fixed equal to the visual token count, so the reordering is single-pass rather than iterative; and the paper states that genuine 2D reasoning needs longer causal flow sequences and remains future work. The token budget claim is comparative rather than absolute: it is at or below the previous model and matches one frontier system's stated maximum, not a new low.",
      },
    ],
    paper: [
      {
        kind: "prose",
        heading: "Problem the paper sets out to solve",
        text: "Every vision-language model feeds image tokens to the language model in a fixed raster order with fixed positional encoding, which contradicts how documents are actually read. The paper asks whether the encoder can choose a semantic reading order before the decoder begins.",
      },
      {
        kind: "prose",
        heading: "Key idea to look for while reading",
        text: "The attention mask and the equal-cardinality query design. Section 2 describes DeepEncoder V2 and the mask; Section 4 reports OmniDocBench and the reading-order metric; Section 5 adds production measurements. Read the reading-order edit distance as the direct test of the central claim, since overall OCR accuracy can improve for unrelated reasons.",
      },
      {
        kind: "prose",
        heading: "Evidence the paper musters",
        text: "OmniDocBench v1.5: 91.09 percent, +3.73 over DeepSeek-OCR under similar training data. Reading-order edit distance: 0.085 to 0.057. Production repetition rate: 6.25 to 4.17 percent on online user-log images and 3.69 to 2.88 percent on PDF production. Token budget: 256 to 1120 reordered tokens (256 global plus 144 per local crop), versus DeepSeek-OCR's 1156 maximum.",
      },
      {
        kind: "prose",
        heading: "Limits the authors admit",
        text: "The scope is OCR and document understanding; general visual reasoning is not evaluated. The reordering is single-pass because queries equal visual tokens in count, and the paper says multi-hop reordering needs longer flow sequences. Comparisons are against the authors' previous model and a small set of systems, and the production numbers are repetition rates rather than accuracy because labels do not exist in production.",
      },
      {
        kind: "prose",
        heading: "Practitioner takeaway",
        text: "The order in which you feed a model its input is part of the architecture, not a preprocessing detail. When a fixed scan order conflicts with the data's structure, a small learned module that chooses the order can pay off without changing the token budget - the trick is making the chooser produce exactly as many outputs as the tokens it replaces. And evaluate the property you changed: reading-order distance, not just aggregate OCR score.",
      },
    ],
    questions: [
      {
        id: "ocr2-q1",
        prompt: "What is the central change from DeepSeek-OCR to DeepSeek-OCR 2?",
        options: [
          "A larger language decoder",
          "DeepEncoder V2 replaces the CLIP block with an LLM-style module whose causal flow queries reorder visual tokens by semantics",
          "A new VQ tokenizer",
          "Higher input resolution",
        ],
        answer: 1,
        explanation:
          "The perception stage and the compressor stay; the CLIP component becomes a dual-stream encoder where visual tokens attend bidirectionally and learnable queries attend causally to produce a semantic reading order before the decoder runs.",
      },
      {
        id: "ocr2-q2",
        prompt: "Why can the reordering happen without increasing the token count?",
        options: [
          "The queries are compressed to a single token",
          "The number of causal flow queries equals the number of visual tokens, so the query outputs replace the visual sequence one for one",
          "The visual tokens are discarded before the decoder",
          "The decoder uses no attention",
        ],
        answer: 1,
        explanation:
          "Equal cardinality is the design constraint that keeps the budget flat: 256 global queries and 144 per local crop produce a sequence of 256 to 1120 tokens, at or below the previous model's 1156, and only the query outputs are forwarded.",
      },
      {
        id: "ocr2-q3",
        prompt: "In the dual-stream mask, what is the purpose of the bottom-left block?",
        options: [
          "It lets visual tokens see the queries",
          "It lets every causal flow query attend to all visual tokens, so the ordering decision sees the whole page",
          "It blocks the queries from attending to anything",
          "It makes the visual tokens causal",
        ],
        answer: 1,
        explanation:
          "The mask has three active blocks: visual-to-visual bidirectional, query-to-visual all-to-all, and query-to-earlier-query causal. The top-right block is zeros so visual tokens never see the queries, keeping the visual representation independent of the ordering being derived.",
      },
      {
        id: "ocr2-q4",
        prompt:
          "Which metric most directly supports the claim that the encoder learned a better reading order?",
        options: [
          "The overall OCR accuracy on OmniDocBench",
          "The reading-order edit distance, which falls from 0.085 to 0.057",
          "The repetition rate in production",
          "The parameter count of DeepEncoder V2",
        ],
        answer: 1,
        explanation:
          "Overall accuracy can improve for many reasons; reading-order edit distance measures whether the emitted sequence follows the document's logical order, which is the specific property the architecture changes. Repetition rate is a production robustness signal rather than an ordering metric.",
      },
      {
        id: "ocr2-q5",
        prompt: "How does the paper frame the architecture's significance?",
        options: [
          "As a complete solution to 2D reasoning",
          "As two cascaded one-dimensional causal reasoners - one choosing a reading order, one solving the task - with genuine 2D reasoning explicitly left as future work",
          "As a general-purpose vision model",
          "As a replacement for the language decoder",
        ],
        answer: 1,
        explanation:
          "The paper proposes the cascade as a promising route toward 2D reasoning and is explicit that the goal is far off: iterative re-examination would require more causal flow tokens than visual tokens, which the current equal-cardinality design does not provide.",
      },
    ],
    practice: {
      concepts: ["stats-correlation", "la-vectors"],
      articles: ["art-attention", "art-embeddings"],
      problems: ["cv-175", "cv-249", "cv-393"],
    },
  },
];
