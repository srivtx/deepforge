import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-366",
    title: "Attention Scores With Explicit Scale",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute attention scores with an explicit multiplicative scale: out[i][j] = scale * (Q[i] . K[j]), where Q has shape (seq_q, d) and K has shape (seq_k, d).\n\nThe signature is attention_scores_scaled(Q, K, scale). Use this when the scale is set by hand instead of the usual 1 / sqrt(d).",
    starterCode: `def attention_scores_scaled(Q, K, scale):
    # Your code here
    pass`,
    solution: `def attention_scores_scaled(Q, K, scale):
    d = len(Q[0])
    return [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(len(K))] for i in range(len(Q))]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], 0.5], expected: [[0.5, 0.0], [0.0, 0.5]] },
      { input: [[[1.0, 2.0]], [[1.0, 2.0]], 1.0], expected: [[5.0]] },
      { input: [[[1.0, 0.0], [0.0, 2.0]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], 0.5], expected: [[0.5, 0.0, 0.5], [0.0, 1.0, 1.0]] },
      { input: [[[2.0]], [[3.0]], 0.25], expected: [[1.5]] },
    ],
    hint: "Each score is the dot product of a query row and a key row, then multiplied by the shared scale.",
  },
  {
    id: "dl-367",
    title: "Masked Attention Softmax",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a numerically stable softmax to each score row while honoring a boolean keep mask. Masked entries receive weight 0.0 and the surviving entries are renormalized to sum to 1.0.\n\nThe signature is masked_attention_softmax(scores, keep_mask). Every row must keep at least one entry.",
    starterCode: `import math
def masked_attention_softmax(scores, keep_mask):
    # Your code here
    pass`,
    solution: `import math
def masked_attention_softmax(scores, keep_mask):
    out = []
    for i in range(len(scores)):
        row = scores[i]
        m = max(row[j] for j in range(len(row)) if keep_mask[i][j])
        exps = [math.exp(row[j] - m) if keep_mask[i][j] else 0.0 for j in range(len(row))]
        total = sum(exps)
        out.append([e / total for e in exps])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1, 1], [0, 1]]], expected: [[0.2689414214, 0.7310585786], [0.0, 1.0]] },
      { input: [[[0.0, 0.0, 0.0]], [[1, 0, 1]]], expected: [[0.5, 0.0, 0.5]] },
      { input: [[[5.0]], [[1]]], expected: [[1.0]] },
      { input: [[[1.0, 1.0], [2.0, 2.0]], [[1, 1], [1, 1]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
    ],
    hint: "Take the row maximum over kept entries only, then zero out the masked columns after exponentiating.",
  },
  {
    id: "dl-368",
    title: "Interleaved Head Split",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Split a (seq_len, d_model) matrix into num_heads heads using an interleaved column layout: head h takes columns h, h + num_heads, h + 2 * num_heads, and so on.\n\nThe signature is split_heads_interleaved(x, num_heads). This differs from the contiguous chunk split used by most frameworks.",
    starterCode: `def split_heads_interleaved(x, num_heads):
    # Your code here
    pass`,
    solution: `def split_heads_interleaved(x, num_heads):
    seq = len(x)
    dim = len(x[0])
    head_dim = dim // num_heads
    heads = []
    for h in range(num_heads):
        head = []
        for i in range(seq):
            head.append([x[i][h + j * num_heads] for j in range(head_dim)])
        heads.append(head)
    return heads`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]], 2], expected: [[[1.0, 3.0], [5.0, 7.0]], [[2.0, 4.0], [6.0, 8.0]]] },
      { input: [[[1.0, 2.0, 3.0, 4.0]], 4], expected: [[[1.0]], [[2.0]], [[3.0]], [[4.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1], expected: [[[1.0, 2.0], [3.0, 4.0]]] },
      { input: [[[1.0, 2.0, 3.0, 4.0, 5.0, 6.0]], 3], expected: [[[1.0, 4.0]], [[2.0, 5.0]], [[3.0, 6.0]]] },
    ],
    hint: "Head h owns the columns whose index is congruent to h modulo num_heads.",
  },
  {
    id: "dl-369",
    title: "GQA Repeat Padding",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the key/value repetition factor for grouped-query attention and the number of dummy query heads needed to make the query-head count a multiple of the KV-head count: groups = ceil(num_query_heads / num_kv_heads).\n\nThe signature is gqa_repeat_padding(num_query_heads, num_kv_heads). Return [groups, padded_heads - num_query_heads].",
    starterCode: `def gqa_repeat_padding(num_query_heads, num_kv_heads):
    # Your code here
    pass`,
    solution: `def gqa_repeat_padding(num_query_heads, num_kv_heads):
    groups = (num_query_heads + num_kv_heads - 1) // num_kv_heads
    padded = groups * num_kv_heads
    return [groups, padded - num_query_heads]`,
    testCases: [
      { input: [8, 2], expected: [4, 0] },
      { input: [12, 5], expected: [3, 3] },
      { input: [1, 1], expected: [1, 0] },
      { input: [10, 4], expected: [3, 2] },
    ],
    hint: "Ceiling division tells you how many query heads each KV head must serve.",
  },
  {
    id: "dl-370",
    title: "GQA Cache Savings Fraction",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the percentage of key/value cache bytes saved by grouped-query attention, which stores num_kv_heads heads instead of num_query_heads heads.\n\nThe signature is gqa_cache_savings(num_query_heads, num_kv_heads). The result is 100 * (1 - num_kv_heads / num_query_heads).",
    starterCode: `def gqa_cache_savings(num_query_heads, num_kv_heads):
    # Your code here
    pass`,
    solution: `def gqa_cache_savings(num_query_heads, num_kv_heads):
    return (1.0 - num_kv_heads / num_query_heads) * 100.0`,
    testCases: [
      { input: [32, 8], expected: 75.0 },
      { input: [32, 32], expected: 0.0 },
      { input: [32, 1], expected: 96.875 },
      { input: [12, 4], expected: 66.6666666667 },
    ],
    hint: "Only the K and V projections shrink; the ratio of stored heads is the whole story.",
  },
  {
    id: "dl-371",
    title: "MHA GQA MQA Parameter Comparison",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count attention projection parameters for three variants with head_dim = d_model / num_heads: MHA (Q, K, V and output each d_model x d_model), GQA (K and V use num_kv_heads * head_dim columns) and MQA (a single KV head).\n\nThe signature is attention_params_by_variant(d_model, num_heads, num_kv_heads). Return [mha_params, gqa_params, mqa_params] as integers, ignoring biases.",
    starterCode: `def attention_params_by_variant(d_model, num_heads, num_kv_heads):
    # Your code here
    pass`,
    solution: `def attention_params_by_variant(d_model, num_heads, num_kv_heads):
    head_dim = d_model // num_heads
    mha = 4 * d_model * d_model
    gqa = d_model * d_model + 2 * d_model * num_kv_heads * head_dim + d_model * d_model
    mqa = d_model * d_model + 2 * d_model * head_dim + d_model * d_model
    return [mha, gqa, mqa]`,
    testCases: [
      { input: [512, 8, 8], expected: [1048576, 1048576, 589824] },
      { input: [512, 8, 2], expected: [1048576, 655360, 589824] },
      { input: [64, 4, 1], expected: [16384, 10240, 10240] },
      { input: [1024, 16, 4], expected: [4194304, 2621440, 2228224] },
    ],
    hint: "Q and the output projection are always d_model x d_model; only K and V shrink with the KV head count.",
  },
  {
    id: "dl-372",
    title: "SwiGLU Forward Value",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Evaluate a SwiGLU feed-forward layer on one input vector: out[j] = SiLU(W[j] . x) * (V[j] . x), where SiLU(a) = a / (1 + exp(-a)).\n\nThe signature is swiglu_forward(x, W, V). W and V are (hidden, d) matrices and x has length d; the result has length hidden.",
    starterCode: `import math
def swiglu_forward(x, W, V):
    # Your code here
    pass`,
    solution: `import math
def swiglu_forward(x, W, V):
    out = []
    for j in range(len(W)):
        a = sum(W[j][k] * x[k] for k in range(len(x)))
        b = sum(V[j][k] * x[k] for k in range(len(x)))
        out.append((a / (1.0 + math.exp(-a))) * b)
    return out`,
    testCases: [
      { input: [[1.0], [[0.0]], [[2.0]]], expected: [0.0] },
      { input: [[1.0], [[1.0]], [[1.0]]], expected: [0.7310585786] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0], [1.0, -1.0]]], expected: [0.0, -0.7310585786] },
      { input: [[1.0, 2.0], [[1.0, 1.0]], [[1.0, 0.0]]], expected: [2.8577223805] },
    ],
    hint: "One projection produces the gate that is passed through SiLU, the other produces the value that multiplies it.",
  },
  {
    id: "dl-373",
    title: "GeGLU Forward Value",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Evaluate a GeGLU feed-forward layer on one input vector: out[j] = GELU(W[j] . x) * (V[j] . x), using the exact GELU = 0.5 * a * (1 + erf(a / sqrt(2))).\n\nThe signature is geglu_forward(x, W, V). W and V are (hidden, d) matrices and x has length d; the result has length hidden.",
    starterCode: `import math
def geglu_forward(x, W, V):
    # Your code here
    pass`,
    solution: `import math
def geglu_forward(x, W, V):
    out = []
    for j in range(len(W)):
        a = sum(W[j][k] * x[k] for k in range(len(x)))
        b = sum(V[j][k] * x[k] for k in range(len(x)))
        g = 0.5 * a * (1.0 + math.erf(a / math.sqrt(2.0)))
        out.append(g * b)
    return out`,
    testCases: [
      { input: [[1.0], [[0.0]], [[3.0]]], expected: [0.0] },
      { input: [[1.0], [[1.0]], [[1.0]]], expected: [0.8413447461] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0], [1.0, -1.0]]], expected: [0.0, -0.8413447461] },
      { input: [[1.0, 2.0], [[1.0, 1.0]], [[1.0, 0.0]]], expected: [2.9959503059] },
    ],
    hint: "GeGLU is SwiGLU with the erf-based exact GELU instead of SiLU as the gate.",
  },
  {
    id: "dl-374",
    title: "GLU Sigmoid Gate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Evaluate a gated linear unit on one input vector: out[j] = sigmoid(W[j] . x) * (V[j] . x), where sigmoid(a) = 1 / (1 + exp(-a)).\n\nThe signature is glu_forward(x, W, V). W and V are (hidden, d) matrices and x has length d; the result has length hidden.",
    starterCode: `import math
def glu_forward(x, W, V):
    # Your code here
    pass`,
    solution: `import math
def glu_forward(x, W, V):
    out = []
    for j in range(len(W)):
        a = sum(W[j][k] * x[k] for k in range(len(x)))
        b = sum(V[j][k] * x[k] for k in range(len(x)))
        out.append((1.0 / (1.0 + math.exp(-a))) * b)
    return out`,
    testCases: [
      { input: [[1.0], [[0.0]], [[5.0]]], expected: [2.5] },
      { input: [[1.0], [[1.0]], [[1.0]]], expected: [0.7310585786] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 1.0], [1.0, -1.0]]], expected: [0.5, -0.7310585786] },
      { input: [[1.0, 1.0], [[-1.0, -1.0]], [[2.0, 2.0]]], expected: [0.4768116881] },
    ],
    hint: "A zero gate input still passes half of the value because sigmoid(0) is 0.5.",
  },
  {
    id: "dl-375",
    title: "SwiGLU FFN Parameter Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the parameters of a SwiGLU feed-forward block without biases: three matrices of shape (d_ff, d_model) give 3 * d_model * d_ff. When bias is True, add one bias vector of length d_ff for each of the two up projections and one of length d_model for the down projection.\n\nThe signature is swiglu_ffn_params(d_model, d_ff, bias=False). Return an integer.",
    starterCode: `def swiglu_ffn_params(d_model, d_ff, bias=False):
    # Your code here
    pass`,
    solution: `def swiglu_ffn_params(d_model, d_ff, bias=False):
    params = 3 * d_model * d_ff
    if bias:
        params += 2 * d_ff + d_model
    return params`,
    testCases: [
      { input: [512, 1365], expected: 2096640 },
      { input: [768, 2048], expected: 4718592 },
      { input: [512, 1365, true], expected: 2099882 },
      { input: [64, 128], expected: 24576 },
    ],
    hint: "SwiGLU uses three weight matrices because the gate and value branches are separate.",
  },
  {
    id: "dl-376",
    title: "RMSNorm Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply RMSNorm: r = sqrt(mean(x^2) + eps), then out[i] = x[i] / r * weight[i]. Unlike LayerNorm there is no mean subtraction and no bias.\n\nThe signature is rmsnorm_forward(x, weight, eps=1e-6). Return a list of the same length as x.",
    starterCode: `import math
def rmsnorm_forward(x, weight, eps=1e-6):
    # Your code here
    pass`,
    solution: `import math
def rmsnorm_forward(x, weight, eps=1e-6):
    ms = sum(v * v for v in x) / len(x)
    r = math.sqrt(ms + eps)
    return [x[i] / r * weight[i] for i in range(len(x))]`,
    testCases: [
      { input: [[3.0, 4.0], [1.0, 1.0], 0.0], expected: [0.8485281374, 1.1313708499] },
      { input: [[1.0, 1.0], [2.0, 3.0], 0.0], expected: [2.0, 3.0] },
      { input: [[0.0, 0.0], [5.0, 5.0], 0.000001], expected: [0.0, 0.0] },
      { input: [[1.0, 2.0, 3.0], [1.0, 1.0, 1.0], 0.0], expected: [0.4629100499, 0.9258200998, 1.3887301497] },
    ],
    hint: "Only the root mean square of the row matters; the mean is never subtracted.",
  },
  {
    id: "dl-377",
    title: "LayerNorm vs RMSNorm Outputs",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute LayerNorm and RMSNorm outputs for the same input so the difference is visible. LayerNorm subtracts the mean and divides by the standard deviation, while RMSNorm divides by the root mean square without centering. Both scale by weight and add eps inside the square root.\n\nThe signature is norm_compare(x, weight, eps=1e-5). Return [layernorm_output, rmsnorm_output].",
    starterCode: `import math
def norm_compare(x, weight, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def norm_compare(x, weight, eps=1e-5):
    n = len(x)
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    ln = [(x[i] - mean) / math.sqrt(var + eps) * weight[i] for i in range(n)]
    ms = sum(v * v for v in x) / n
    rms = [x[i] / math.sqrt(ms + eps) * weight[i] for i in range(n)]
    return [ln, rms]`,
    testCases: [
      { input: [[1.0, 3.0], [1.0, 1.0], 0.0], expected: [[-1.0, 1.0], [0.4472135955, 1.3416407865]] },
      { input: [[0.0, 0.0], [1.0, 1.0], 1.0], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[2.0, 2.0, 2.0], [1.0, 2.0, 3.0], 0.00001], expected: [[0.0, 0.0, 0.0], [0.99999875, 1.9999975, 2.99999625]] },
      { input: [[1.0, 2.0, 3.0], [1.0, 1.0, 1.0], 0.00001], expected: [[-1.2247356859, 0.0, 1.2247356859], [0.4629095539, 0.9258191078, 1.3887286617]] },
    ],
    hint: "A constant input makes LayerNorm output exactly zero but leaves RMSNorm nonzero.",
  },
  {
    id: "dl-378",
    title: "Residual Gradient Scale Pre Vs Post Norm",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Toy model of how residual depth scales gradients. For each block scale s, the pre-norm multiplier is (1 + s) because the identity path is untouched, while the post-norm multiplier is s / (1 + s) because the block output is renormalized before it is added back. Multiply the multipliers across all blocks.\n\nThe signature is residual_grad_scale(scales). Return [pre_norm_scale, post_norm_scale].",
    starterCode: `def residual_grad_scale(scales):
    # Your code here
    pass`,
    solution: `def residual_grad_scale(scales):
    pre = 1.0
    post = 1.0
    for s in scales:
        pre *= (1.0 + s)
        post *= s / (1.0 + s)
    return [pre, post]`,
    testCases: [
      { input: [[0.1, 0.1, 0.1]], expected: [1.331, 0.0007513148] },
      { input: [[0.5]], expected: [1.5, 0.3333333333] },
      { input: [[1.0, 1.0]], expected: [4.0, 0.25] },
      { input: [[]], expected: [1.0, 1.0] },
    ],
    hint: "An empty stack gives the identity scale of 1.0 for both orderings.",
  },
  {
    id: "dl-379",
    title: "Attention Head Dim And Scale",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Given d_model and num_heads, compute the per-head dimension head_dim = d_model / num_heads and the attention scaling factor 1 / sqrt(head_dim).\n\nThe signature is attention_head_scale(d_model, num_heads). Return [head_dim, scale] as an integer and a float.",
    starterCode: `import math
def attention_head_scale(d_model, num_heads):
    # Your code here
    pass`,
    solution: `import math
def attention_head_scale(d_model, num_heads):
    head_dim = d_model // num_heads
    return [head_dim, 1.0 / math.sqrt(head_dim)]`,
    testCases: [
      { input: [512, 8], expected: [64, 0.125] },
      { input: [768, 12], expected: [64, 0.125] },
      { input: [64, 4], expected: [16, 0.25] },
      { input: [512, 16], expected: [32, 0.1767766953] },
    ],
    hint: "Keep more heads means a smaller head_dim and a larger softmax temperature scale.",
  },
  {
    id: "dl-380",
    title: "Length-Aware Causal Mask",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply a causal mask that also respects per-row valid lengths: entry (i, j) is kept only when j <= i and j < lengths[i], otherwise it becomes -1e9.\n\nThe signature is causal_mask_with_lengths(scores, lengths). This is used for packed or padded batches where rows hold different numbers of real tokens.",
    starterCode: `def causal_mask_with_lengths(scores, lengths):
    # Your code here
    pass`,
    solution: `def causal_mask_with_lengths(scores, lengths):
    return [[scores[i][j] if (j <= i and j < lengths[i]) else -1e9 for j in range(len(scores[i]))] for i in range(len(scores))]`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], [3, 2, 1]], expected: [[1.0, -1e9, -1e9], [4.0, 5.0, -1e9], [7.0, -1e9, -1e9]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0, 2]], expected: [[-1e9, -1e9], [3.0, 4.0]] },
      { input: [[[5.0]], [1]], expected: [[5.0]] },
      { input: [[[1.0, 2.0, 3.0]], [1]], expected: [[1.0, -1e9, -1e9]] },
    ],
    hint: "Both conditions matter: the row length can mask out positions that the causal rule would allow.",
  },
  {
    id: "dl-381",
    title: "Sliding Window Allowed Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the allowed entries of a causal sliding-window mask where position i attends to itself and the window - 1 positions before it, so row i keeps min(i + 1, window) entries.\n\nThe signature is sliding_window_count(seq_len, window). Return an integer count without building the mask.",
    starterCode: `def sliding_window_count(seq_len, window):
    # Your code here
    pass`,
    solution: `def sliding_window_count(seq_len, window):
    return sum(min(i + 1, window) for i in range(seq_len))`,
    testCases: [
      { input: [4, 2], expected: 7 },
      { input: [5, 1], expected: 5 },
      { input: [3, 3], expected: 6 },
      { input: [1, 5], expected: 1 },
    ],
    hint: "Each row keeps one more entry than the previous until the window size is reached.",
  },
  {
    id: "dl-382",
    title: "Attention Sink Weights",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Inject an attention sink score into every row and softmax over the sink plus the original scores, so each output row has one extra leading weight for the sink.\n\nThe signature is attention_sink_softmax(scores, sink_score). Use a stable max over the sink and the row; masked future columns are handled separately by the caller.",
    starterCode: `import math
def attention_sink_softmax(scores, sink_score):
    # Your code here
    pass`,
    solution: `import math
def attention_sink_softmax(scores, sink_score):
    out = []
    for row in scores:
        m = max(sink_score, max(row))
        exps = [math.exp(sink_score - m)] + [math.exp(v - m) for v in row]
        total = sum(exps)
        out.append([e / total for e in exps])
    return out`,
    testCases: [
      { input: [[[0.0]], 0.0], expected: [[0.5, 0.5]] },
      { input: [[[1.0, 2.0]], 2.0], expected: [[0.4223187983, 0.1553624035, 0.4223187983]] },
      { input: [[[0.0, 0.0], [1000.0, 1000.0]], 1000.0], expected: [[1.0, 0.0, 0.0], [0.3333333333, 0.3333333333, 0.3333333333]] },
      { input: [[[-5.0]], 0.0], expected: [[0.9933071491, 0.0066928509]] },
    ],
    hint: "The sink behaves like one extra key with its own fixed score that every query can always attend to.",
  },
  {
    id: "dl-383",
    title: "Streaming Sink Window Keep Set",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Streaming attention keeps a small cache: the first sink_tokens positions plus the most recent window_tokens positions, with duplicates removed when the two ranges overlap.\n\nThe signature is streaming_cache_keep(seq_len, sink_tokens, window_tokens). Return the kept token indices sorted ascending.",
    starterCode: `def streaming_cache_keep(seq_len, sink_tokens, window_tokens):
    # Your code here
    pass`,
    solution: `def streaming_cache_keep(seq_len, sink_tokens, window_tokens):
    keep = set(range(min(sink_tokens, seq_len)))
    start = max(sink_tokens, seq_len - window_tokens)
    for i in range(start, seq_len):
        keep.add(i)
    return sorted(keep)`,
    testCases: [
      { input: [10, 2, 3], expected: [0, 1, 7, 8, 9] },
      { input: [5, 2, 10], expected: [0, 1, 2, 3, 4] },
      { input: [4, 0, 2], expected: [2, 3] },
      { input: [3, 3, 0], expected: [0, 1, 2] },
      { input: [6, 4, 4], expected: [0, 1, 2, 3, 4, 5] },
    ],
    hint: "Use a set so the sink and window ranges merge cleanly when they overlap.",
  },
  {
    id: "dl-384",
    title: "Paged KV Cache Footprint",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute allocated KV cache bytes with paged memory: each sequence is rounded up to a whole number of blocks, so padded_tokens = ceil(seq_len / block_size) * block_size.\n\nThe signature is paged_kv_cache_bytes(num_layers, batch_size, num_kv_heads, head_dim, seq_len, block_size, bytes_per_value=2). Total bytes = 2 * num_layers * batch_size * num_kv_heads * head_dim * padded_tokens * bytes_per_value; return an integer.",
    starterCode: `def paged_kv_cache_bytes(num_layers, batch_size, num_kv_heads, head_dim, seq_len, block_size, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def paged_kv_cache_bytes(num_layers, batch_size, num_kv_heads, head_dim, seq_len, block_size, bytes_per_value=2):
    padded = ((seq_len + block_size - 1) // block_size) * block_size
    return 2 * num_layers * batch_size * num_kv_heads * head_dim * padded * bytes_per_value`,
    testCases: [
      { input: [12, 1, 12, 64, 500, 16, 2], expected: 18874368 },
      { input: [1, 2, 1, 4, 10, 4, 4], expected: 768 },
      { input: [2, 1, 2, 8, 8, 8, 2], expected: 1024 },
      { input: [32, 1, 8, 128, 1024, 16, 2], expected: 134217728 },
    ],
    hint: "Only the token count gets rounded up; the block size itself never changes the per-token cost.",
  },
  {
    id: "dl-385",
    title: "KV Cache Dtype Savings",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the byte savings from storing the KV cache in a smaller dtype. Given the fp16 total, scale it by new_bytes_per_value / old_bytes_per_value, then report the new total, the bytes saved, and the percentage saved.\n\nThe signature is kv_cache_dtype_savings(fp16_bytes, new_bytes_per_value=1, old_bytes_per_value=2). Return [new_total, saved_bytes, pct_saved].",
    starterCode: `def kv_cache_dtype_savings(fp16_bytes, new_bytes_per_value=1, old_bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def kv_cache_dtype_savings(fp16_bytes, new_bytes_per_value=1, old_bytes_per_value=2):
    new_total = fp16_bytes * (float(new_bytes_per_value) / old_bytes_per_value)
    saved = fp16_bytes - new_total
    pct = 100.0 * saved / fp16_bytes
    return [new_total, saved, pct]`,
    testCases: [
      { input: [1000000, 1, 2], expected: [500000.0, 500000.0, 50.0] },
      { input: [134217728, 1, 2], expected: [67108864.0, 67108864.0, 50.0] },
      { input: [1000, 2, 2], expected: [1000.0, 0.0, 0.0] },
      { input: [1000, 1, 4], expected: [250.0, 750.0, 75.0] },
    ],
    hint: "The saving depends only on the ratio of dtype widths, not on the model size.",
  },
  {
    id: "dl-386",
    title: "RoPE Half-Split Rotation",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the half-split RoPE layout: pair coordinate i with coordinate i + d/2, use angle = position * theta_base^(-2i/d), and write out[i] = x[i] * cos - x[i + d/2] * sin and out[i + d/2] = x[i] * sin + x[i + d/2] * cos.\n\nThe signature is rope_half_split(x, position, theta_base=10000.0). d must be even; the adjacent-pair layout is a different convention.",
    starterCode: `import math
def rope_half_split(x, position, theta_base=10000.0):
    # Your code here
    pass`,
    solution: `import math
def rope_half_split(x, position, theta_base=10000.0):
    d = len(x)
    half = d // 2
    out = [0.0] * d
    for i in range(half):
        freq = theta_base ** (-2.0 * i / d)
        angle = position * freq
        c = math.cos(angle)
        s = math.sin(angle)
        out[i] = x[i] * c - x[half + i] * s
        out[half + i] = x[i] * s + x[half + i] * c
    return out`,
    testCases: [
      { input: [[1.0, 0.0, 0.0, 0.0], 1], expected: [0.5403023059, 0.0, 0.8414709848, 0.0] },
      { input: [[1.0, 2.0, 3.0, 4.0], 0], expected: [1.0, 2.0, 3.0, 4.0] },
      { input: [[0.0, 1.0, 0.0, 0.0], 1, 1.0], expected: [0.0, 0.5403023059, 0.0, 0.8414709848] },
      { input: [[1.0, 2.0, 3.0, 4.0], 1], expected: [-1.9841106486, 1.9599006675, 2.4623779024, 4.0197996683] },
    ],
    hint: "Position 0 rotates every pair by angle 0 and leaves the vector unchanged.",
  },
  {
    id: "dl-387",
    title: "RoPE Frequency Wavelength",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the wavelength of a RoPE frequency band: 2 * pi * theta_base^(2 * pair_index / dim). Long wavelengths rotate slowly and carry long-range position information.\n\nThe signature is rope_wavelength(dim, pair_index, theta_base=10000.0). Return a float.",
    starterCode: `import math
def rope_wavelength(dim, pair_index, theta_base=10000.0):
    # Your code here
    pass`,
    solution: `import math
def rope_wavelength(dim, pair_index, theta_base=10000.0):
    return 2.0 * math.pi * (theta_base ** (2.0 * pair_index / dim))`,
    testCases: [
      { input: [4, 0], expected: 6.2831853072 },
      { input: [4, 1], expected: 628.318530718 },
      { input: [8, 2, 100.0], expected: 62.8318530718 },
      { input: [64, 31], expected: 47117.2427801674 },
    ],
    hint: "Pair index 0 has wavelength 2 * pi regardless of the base or dimension.",
  },
  {
    id: "dl-388",
    title: "NTK-Aware RoPE Base Scaling",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "NTK-aware RoPE scaling raises the base frequency to stretch context length without retraining: new_base = theta_base * scale^(dim / (dim - 2)), where scale is the context-extension factor and the exponent comes from spreading the interpolation over dimension pairs.\n\nThe signature is ntk_rope_base(theta_base, dim, scale). Return a float.",
    starterCode: `def ntk_rope_base(theta_base, dim, scale):
    # Your code here
    pass`,
    solution: `def ntk_rope_base(theta_base, dim, scale):
    return theta_base * (scale ** (dim / (dim - 2.0)))`,
    testCases: [
      { input: [10000.0, 64, 2.0], expected: 20452.2287120254 },
      { input: [10000.0, 64, 1.0], expected: 10000.0 },
      { input: [10000.0, 8, 4.0], expected: 63496.042078728 },
      { input: [500000.0, 128, 4.0], expected: 2044497.121624311 },
    ],
    hint: "A scale factor of 1 leaves the base unchanged; larger context-extension factors raise it.",
  },
  {
    id: "dl-389",
    title: "YaRN Interpolation Ramp",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the YaRN interpolation ramp for one RoPE pair index: indices at or below alpha keep their frequency, indices at or above beta are fully interpolated, and values in between ramp linearly.\n\nThe signature is yarn_ramp(pair_index, alpha, beta). Return a float in [0.0, 1.0]; compute (pair_index - alpha) / (beta - alpha) for the middle range.",
    starterCode: `def yarn_ramp(pair_index, alpha, beta):
    # Your code here
    pass`,
    solution: `def yarn_ramp(pair_index, alpha, beta):
    if pair_index <= alpha:
        return 0.0
    if pair_index >= beta:
        return 1.0
    return (pair_index - alpha) / (beta - alpha)`,
    testCases: [
      { input: [0, 0.0, 32.0], expected: 0.0 },
      { input: [16, 0.0, 32.0], expected: 0.5 },
      { input: [32, 0.0, 32.0], expected: 1.0 },
      { input: [8, 4.0, 12.0], expected: 0.5 },
    ],
    hint: "Dimensions that rotate quickly need no interpolation, while slow long-wavelength dimensions need full interpolation.",
  },
  {
    id: "dl-390",
    title: "ALiBi Head Slopes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the ALiBi head slopes: head h gets slope 1 / 2^(h + 1), so earlier heads penalize distance the most.\n\nThe signature is alibi_slopes(num_heads). Return the list of slopes as floats.",
    starterCode: `def alibi_slopes(num_heads):
    # Your code here
    pass`,
    solution: `def alibi_slopes(num_heads):
    return [1.0 / (2.0 ** (h + 1)) for h in range(num_heads)]`,
    testCases: [
      { input: [4], expected: [0.5, 0.25, 0.125, 0.0625] },
      { input: [1], expected: [0.5] },
      { input: [8], expected: [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125, 0.00390625] },
      { input: [3], expected: [0.5, 0.25, 0.125] },
    ],
    hint: "Each head halves the previous slope, starting from 0.5.",
  },
  {
    id: "dl-391",
    title: "T5 Relative Position Bucket",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute the T5-style relative position bucket for a nonnegative distance. Distances below max_exact = num_buckets / 2 map to their own bucket; larger distances go on a logarithmic grid that spreads them up to bucket num_buckets - 1.\n\nThe signature is t5_relative_bucket(distance, num_buckets, max_distance). Return an integer bucket, with distance <= 0 mapping to bucket 0 and the logarithmic value clamped to num_buckets - 1.",
    starterCode: `import math
def t5_relative_bucket(distance, num_buckets, max_distance):
    # Your code here
    pass`,
    solution: `import math
def t5_relative_bucket(distance, num_buckets, max_distance):
    if distance <= 0:
        return 0
    max_exact = num_buckets // 2
    if distance < max_exact:
        return distance
    val = max_exact + int(math.log(distance / max_exact) / math.log(max_distance / max_exact) * (num_buckets - max_exact))
    if val > num_buckets - 1:
        val = num_buckets - 1
    return val`,
    testCases: [
      { input: [0, 8, 128], expected: 0 },
      { input: [3, 8, 128], expected: 3 },
      { input: [5, 8, 128], expected: 4 },
      { input: [100, 8, 128], expected: 7 },
      { input: [1000, 16, 64], expected: 15 },
    ],
    hint: "Small distances get exact buckets and only the long tail is log-compressed, then clamped at the last bucket.",
  },
  {
    id: "dl-392",
    title: "Online Softmax Merge",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Merge two partial online-softmax summaries, each given as a running maximum m and running denominator l: m_new = max(m1, m2) and l_new = l1 * exp(m1 - m_new) + l2 * exp(m2 - m_new).\n\nThe signature is online_softmax_merge(m1, l1, m2, l2). Return [m_new, l_new]. This is how flash decoding combines partial attention tiles.",
    starterCode: `import math
def online_softmax_merge(m1, l1, m2, l2):
    # Your code here
    pass`,
    solution: `import math
def online_softmax_merge(m1, l1, m2, l2):
    m = max(m1, m2)
    l = l1 * math.exp(m1 - m) + l2 * math.exp(m2 - m)
    return [m, l]`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 1.0], expected: [0.0, 2.0] },
      { input: [1.0, 1.0, 0.0, 1.0], expected: [1.0, 1.3678794412] },
      { input: [5.0, 0.5, 1.0, 0.5], expected: [5.0, 0.5091578194] },
      { input: [-1000000000.0, 1.0, 0.0, 0.0], expected: [0.0, 0.0] },
    ],
    hint: "Only the summary with the smaller maximum needs rescaling, because the larger one already has the winning max.",
  },
  {
    id: "dl-393",
    title: "Tiled Attention Row Output",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute one attention output row tile by tile with the online softmax recurrence, never materializing the full score vector. Scores use the standard 1 / sqrt(d) scale, and each block of block_size keys rescales the running accumulator when a new maximum appears.\n\nThe signature is tiled_attention_row(q, K, V, block_size). Return the output vector for the query row q; the result must match a full softmax weighted sum.",
    starterCode: `import math
def tiled_attention_row(q, K, V, block_size):
    # Your code here
    pass`,
    solution: `import math
def tiled_attention_row(q, K, V, block_size):
    d = len(q)
    scale = 1.0 / math.sqrt(d)
    m = float("-inf")
    l = 0.0
    acc = [0.0] * len(V[0])
    for start in range(0, len(K), block_size):
        for j in range(start, min(start + block_size, len(K))):
            s = sum(q[k] * K[j][k] for k in range(d)) * scale
            if s > m:
                alpha = math.exp(m - s) if m != float("-inf") else 0.0
                acc = [a * alpha for a in acc]
                l = l * alpha + 1.0
                m = s
                w = 1.0
            else:
                w = math.exp(s - m)
                l += w
            acc = [acc[t] + w * V[j][t] for t in range(len(acc))]
    return [a / l for a in acc]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], 1], expected: [0.6697615493, 0.3302384507] },
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], 2], expected: [0.8022241854, 0.5988879073] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [[2.0, 3.0], [4.0, 5.0]], 5], expected: [3.3395230987, 4.3395230987] },
      { input: [[1.0, 1.0], [[1.0, 0.0], [0.0, 2.0]], [[1.0, 1.0], [2.0, 0.0]], 1], expected: [1.6697615493, 0.3302384507] },
    ],
    hint: "When a new maximum arrives, multiply the accumulator and denominator by exp(old_m - new_m) before adding the tile contribution.",
  },
  {
    id: "dl-394",
    title: "Attention Recompute Memory Savings",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compare the memory of materializing the full attention matrix against recomputing it block by block. Full storage holds batch_size * num_heads * seq_len * seq_len values, while the tiled version holds batch_size * num_heads * seq_len * block_size values.\n\nThe signature is attention_recompute_savings(batch_size, num_heads, seq_len, block_size, bytes_per_value=2). Return [full_bytes, recompute_bytes, saved_fraction].",
    starterCode: `def attention_recompute_savings(batch_size, num_heads, seq_len, block_size, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def attention_recompute_savings(batch_size, num_heads, seq_len, block_size, bytes_per_value=2):
    full = batch_size * num_heads * seq_len * seq_len * bytes_per_value
    recompute = batch_size * num_heads * seq_len * block_size * bytes_per_value
    return [full, recompute, (full - recompute) / full]`,
    testCases: [
      { input: [1, 12, 1024, 128, 2], expected: [25165824, 3145728, 0.875] },
      { input: [8, 16, 512, 64, 2], expected: [67108864, 8388608, 0.875] },
      { input: [1, 1, 10, 10, 4], expected: [400, 400, 0.0] },
      { input: [2, 4, 8, 2, 2], expected: [1024, 256, 0.75] },
    ],
    hint: "The saved fraction depends only on block_size / seq_len, not on batch size, heads, or dtype.",
  },
  {
    id: "dl-395",
    title: "Softmax Denominator From Logsumexp",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the log-sum-exp denominator of each score row with the stable max-subtraction trick: m + log(sum(exp(x - m))).\n\nThe signature is softmax_logsumexp(scores). Return one value per row; this is the logarithm of the softmax denominator.",
    starterCode: `import math
def softmax_logsumexp(scores):
    # Your code here
    pass`,
    solution: `import math
def softmax_logsumexp(scores):
    out = []
    for row in scores:
        m = max(row)
        out.append(m + math.log(sum(math.exp(v - m) for v in row)))
    return out`,
    testCases: [
      { input: [[[0.0, 0.0]]], expected: [0.6931471806] },
      { input: [[[1.0, 2.0, 3.0]]], expected: [3.4076059644] },
      { input: [[[1000.0, 1000.0]]], expected: [1000.6931471806] },
      { input: [[[-1.0, -1.0, -1.0]]], expected: [0.0986122887] },
      { input: [[[5.0]]], expected: [5.0] },
    ],
    hint: "Subtracting the row maximum prevents overflow while leaving the log-sum-exp value unchanged.",
  },
  {
    id: "dl-396",
    title: "Attention Row Entropy",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the entropy of each attention weight row: H = -sum(p * log(p)) over positive entries only. A uniform row has maximum entropy and a one-hot row has zero entropy.\n\nThe signature is attention_row_entropy(weights). Return one float per row.",
    starterCode: `import math
def attention_row_entropy(weights):
    # Your code here
    pass`,
    solution: `import math
def attention_row_entropy(weights):
    out = []
    for row in weights:
        e = 0.0
        for p in row:
            if p > 0.0:
                e -= p * math.log(p)
        out.append(e)
    return out`,
    testCases: [
      { input: [[[0.5, 0.5]]], expected: [0.6931471806] },
      { input: [[[1.0, 0.0]]], expected: [0.0] },
      { input: [[[1.0]]], expected: [0.0] },
      { input: [[[0.25, 0.25, 0.25, 0.25]]], expected: [1.3862943611] },
    ],
    hint: "Skip zero weights so log(0) never appears, and expect ln(row_length) for a uniform row.",
  },
  {
    id: "dl-397",
    title: "Attention Weight Sparsity Fraction",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Measure attention sparsity as the fraction of weights strictly below a threshold.\n\nThe signature is attention_sparsity_fraction(weights, threshold). Count entries with p < threshold across all rows and divide by the total number of entries.",
    starterCode: `def attention_sparsity_fraction(weights, threshold):
    # Your code here
    pass`,
    solution: `def attention_sparsity_fraction(weights, threshold):
    total = 0
    sparse = 0
    for row in weights:
        for p in row:
            total += 1
            if p < threshold:
                sparse += 1
    return sparse / total`,
    testCases: [
      { input: [[[0.5, 0.5]], 0.1], expected: 0.0 },
      { input: [[[0.05, 0.95], [0.0, 1.0]], 0.1], expected: 0.5 },
      { input: [[[1.0]], 1.0], expected: 0.0 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 0.5], expected: 1.0 },
    ],
    hint: "The comparison is strict, so a weight exactly equal to the threshold is not counted.",
  },
  {
    id: "dl-398",
    title: "MQA Broadcast Outputs",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Run multi-query attention where every query head broadcasts the same K and V matrices. For each query head, compute the standard scaled softmax attention output row by row.\n\nThe signature is mqa_broadcast_outputs(Q_heads, K, V). Q_heads is a list of (seq_q, d) query matrices and K, V are (seq_k, d); return a list of (seq_q, d) output matrices.",
    starterCode: `import math
def mqa_broadcast_outputs(Q_heads, K, V):
    # Your code here
    pass`,
    solution: `import math
def mqa_broadcast_outputs(Q_heads, K, V):
    d = len(K[0])
    scale = 1.0 / math.sqrt(d)
    outs = []
    for Q in Q_heads:
        rows = []
        for i in range(len(Q)):
            scores = [sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(len(K))]
            m = max(scores)
            exps = [math.exp(s - m) for s in scores]
            total = sum(exps)
            rows.append([sum(exps[j] * V[j][t] for j in range(len(K))) / total for t in range(len(V[0]))])
        outs.append(rows)
    return outs`,
    testCases: [
      { input: [[[[1.0, 0.0]], [[0.0, 1.0]]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 2.0], [3.0, 4.0]]], expected: [[[1.6604769013, 2.6604769013]], [[2.3395230987, 3.3395230987]]] },
      { input: [[[[1.0, 0.0]]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]], expected: [[[0.8022241854, 0.5988879073]]] },
      { input: [[[[1.0, 1.0]], [[2.0, 0.0]]], [[1.0, 0.0]], [[5.0, 6.0]]], expected: [[[5.0, 6.0]], [[5.0, 6.0]]] },
      { input: [[[[1.0, 0.0], [0.0, 1.0]]], [[1.0, 0.0], [0.0, 2.0]], [[1.0, 1.0], [2.0, 0.0]]], expected: [[[1.3302384507, 0.6697615493], [1.8044296825, 0.1955703175]]] },
    ],
    hint: "All query heads share one set of keys and values, which is exactly what saves cache memory in MQA.",
  },
  {
    id: "dl-399",
    title: "Grouped-Query Head Assignment",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Assign each query head to a KV head for grouped-query attention, spreading num_query_heads as evenly as possible across num_kv_heads groups: the first num_query_heads % num_kv_heads groups receive one extra head.\n\nThe signature is gqa_head_assignment(num_query_heads, num_kv_heads). Return a list of length num_query_heads holding the KV head index for each query head.",
    starterCode: `def gqa_head_assignment(num_query_heads, num_kv_heads):
    # Your code here
    pass`,
    solution: `def gqa_head_assignment(num_query_heads, num_kv_heads):
    base = num_query_heads // num_kv_heads
    extra = num_query_heads % num_kv_heads
    out = []
    for g in range(num_kv_heads):
        size = base + (1 if g < extra else 0)
        out.extend([g] * size)
    return out`,
    testCases: [
      { input: [8, 2], expected: [0, 0, 0, 0, 1, 1, 1, 1] },
      { input: [12, 5], expected: [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4] },
      { input: [4, 4], expected: [0, 1, 2, 3] },
      { input: [1, 1], expected: [0] },
    ],
    hint: "Assign contiguous blocks of query heads; the remainder heads go to the lowest-numbered KV groups.",
  },
  {
    id: "dl-400",
    title: "Attention Output Projection FLOPs",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the FLOPs of the attention output projection, treating a multiply-add as 2 FLOPs: 2 * batch_size * seq_len * d_model * d_model.\n\nThe signature is attention_out_proj_flops(batch_size, seq_len, d_model). Return an integer.",
    starterCode: `def attention_out_proj_flops(batch_size, seq_len, d_model):
    # Your code here
    pass`,
    solution: `def attention_out_proj_flops(batch_size, seq_len, d_model):
    return 2 * batch_size * seq_len * d_model * d_model`,
    testCases: [
      { input: [1, 128, 512], expected: 67108864 },
      { input: [8, 512, 768], expected: 4831838208 },
      { input: [1, 1, 64], expected: 8192 },
      { input: [2, 32, 128], expected: 2097152 },
    ],
    hint: "One output projection is one dense matrix multiply per token: 2 * d_model^2 FLOPs each.",
  },
  {
    id: "dl-401",
    title: "KV Cache Bytes Per Token",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the KV cache bytes added per generated token: 2 (for K and V) * num_layers * num_kv_heads * head_dim * bytes_per_value.\n\nThe signature is kv_bytes_per_token(num_layers, num_kv_heads, head_dim, bytes_per_value=2). Return an integer.",
    starterCode: `def kv_bytes_per_token(num_layers, num_kv_heads, head_dim, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def kv_bytes_per_token(num_layers, num_kv_heads, head_dim, bytes_per_value=2):
    return 2 * num_layers * num_kv_heads * head_dim * bytes_per_value`,
    testCases: [
      { input: [12, 12, 64, 2], expected: 36864 },
      { input: [32, 8, 128, 2], expected: 131072 },
      { input: [1, 1, 4, 4], expected: 32 },
      { input: [12, 12, 64, 1], expected: 18432 },
    ],
    hint: "Two tensors per layer, one write per token, multiplied by the dtype width.",
  },
  {
    id: "dl-402",
    title: "Prefill Decode FLOP Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate the prefill-to-decode FLOP ratio for a transformer. Prefill of a prompt with seq_len tokens costs about 2 * model_params * seq_len FLOPs and one decode step costs about 2 * model_params, so the ratio reduces to seq_len.\n\nThe signature is prefill_decode_flops_ratio(seq_len, model_params). Return a float.",
    starterCode: `def prefill_decode_flops_ratio(seq_len, model_params):
    # Your code here
    pass`,
    solution: `def prefill_decode_flops_ratio(seq_len, model_params):
    prefill = 2.0 * model_params * seq_len
    decode = 2.0 * model_params
    return prefill / decode`,
    testCases: [
      { input: [128, 1000000000], expected: 128.0 },
      { input: [1, 7000000000], expected: 1.0 },
      { input: [2048, 7000000000], expected: 2048.0 },
      { input: [512, 100000000], expected: 512.0 },
    ],
    hint: "Model size cancels out, so one prefill equals seq_len decode steps of compute.",
  },
  {
    id: "dl-403",
    title: "Chunked Prefill Chunk Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the chunks a prompt of seq_len tokens is split into for chunked prefill with chunk_size tokens per chunk.\n\nThe signature is chunked_prefill_chunks(seq_len, chunk_size). Return an integer; a trailing partial chunk still counts.",
    starterCode: `def chunked_prefill_chunks(seq_len, chunk_size):
    # Your code here
    pass`,
    solution: `def chunked_prefill_chunks(seq_len, chunk_size):
    return (seq_len + chunk_size - 1) // chunk_size`,
    testCases: [
      { input: [1000, 256], expected: 4 },
      { input: [512, 256], expected: 2 },
      { input: [100, 128], expected: 1 },
      { input: [1, 1], expected: 1 },
    ],
    hint: "Ceiling division counts the final partial chunk.",
  },
  {
    id: "dl-404",
    title: "Transformer Attention Total FLOPs",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count total attention FLOPs per layer: the quadratic score and weighted-sum products cost 4 * batch_size * seq_len^2 * d_model, and the QKV plus output projections cost 8 * batch_size * seq_len * d_model^2, treating a multiply-add as 2 FLOPs.\n\nThe signature is attention_total_flops(batch_size, seq_len, d_model). Return an integer.",
    starterCode: `def attention_total_flops(batch_size, seq_len, d_model):
    # Your code here
    pass`,
    solution: `def attention_total_flops(batch_size, seq_len, d_model):
    quadratic = 4 * batch_size * seq_len * seq_len * d_model
    projections = 8 * batch_size * seq_len * d_model * d_model
    return quadratic + projections`,
    testCases: [
      { input: [1, 128, 512], expected: 301989888 },
      { input: [8, 512, 768], expected: 25769803776 },
      { input: [1, 1, 64], expected: 33024 },
      { input: [2, 32, 128], expected: 9437184 },
    ],
    hint: "Short sequences are dominated by projections; long sequences are dominated by the seq_len^2 term.",
  },
  {
    id: "dl-405",
    title: "Context Quadratic Cost Multiplier",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute how much the quadratic attention cost grows when the context length increases from base_len to new_len: (new_len / base_len)^2.\n\nThe signature is context_cost_multiplier(base_len, new_len). Return a float multiplier.",
    starterCode: `def context_cost_multiplier(base_len, new_len):
    # Your code here
    pass`,
    solution: `def context_cost_multiplier(base_len, new_len):
    return (new_len / base_len) ** 2`,
    testCases: [
      { input: [2048, 4096], expected: 4.0 },
      { input: [1024, 3072], expected: 9.0 },
      { input: [512, 512], expected: 1.0 },
      { input: [100, 150], expected: 2.25 },
    ],
    hint: "Doubling the context quadruples the quadratic attention work.",
  },
  {
    id: "dl-406",
    title: "Attention Head Pruning Top-K",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Select the top-k attention heads to keep when pruning, using their importance scores; break ties by preferring the smaller head index.\n\nThe signature is head_prune_topk(importance, k). Return the kept head indices sorted ascending.",
    starterCode: `def head_prune_topk(importance, k):
    # Your code here
    pass`,
    solution: `def head_prune_topk(importance, k):
    order = sorted(range(len(importance)), key=lambda i: (-importance[i], i))
    return sorted(order[:k])`,
    testCases: [
      { input: [[0.5, 0.9, 0.1, 0.9], 2], expected: [1, 3] },
      { input: [[1.0, 2.0, 3.0], 3], expected: [0, 1, 2] },
      { input: [[0.2, 0.2, 0.2], 1], expected: [0] },
      { input: [[5.0, 4.0, 3.0, 2.0], 2], expected: [0, 1] },
    ],
    hint: "Sort by descending score and ascending index, keep the first k, then sort the result for a stable answer.",
  },
  {
    id: "dl-407",
    title: "Raw Attention Flow Product",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the raw attention flow product across layers by multiplying the attention matrices in order: result = A_last @ ... @ A_1, starting from the identity matrix. Unlike attention rollout this does not mix in the identity at each layer.\n\nThe signature is attention_flow_product(attentions). Return the final (seq_len, seq_len) matrix.",
    starterCode: `def attention_flow_product(attentions):
    # Your code here
    pass`,
    solution: `def attention_flow_product(attentions):
    seq = len(attentions[0])
    result = [[1.0 if i == j else 0.0 for j in range(seq)] for i in range(seq)]
    for A in attentions:
        result = [[sum(A[i][k] * result[k][j] for k in range(seq)) for j in range(seq)] for i in range(seq)]
    return result`,
    testCases: [
      { input: [[[[1.0, 0.0], [0.0, 1.0]]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [[[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [[[[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
    ],
    hint: "Multiplying two row-stochastic matrices keeps rows stochastic, so a uniform matrix is a fixed point.",
  },
  {
    id: "dl-408",
    title: "Induction Head Target",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Toy induction head: at the given position, look for the most recent earlier occurrence of the current token that is at least two positions back, and return the index immediately after it, which is the token an induction head would copy. Return -1 when there is no such occurrence.\n\nThe signature is induction_head_target(tokens, position).",
    starterCode: `def induction_head_target(tokens, position):
    # Your code here
    pass`,
    solution: `def induction_head_target(tokens, position):
    target = tokens[position]
    for p in range(position - 2, -1, -1):
        if tokens[p] == target:
            return p + 1
    return -1`,
    testCases: [
      { input: [[1, 2, 3, 1, 2], 4], expected: 2 },
      { input: [[5, 5], 1], expected: -1 },
      { input: [[1, 2, 1, 2], 3], expected: 2 },
      { input: [[7], 0], expected: -1 },
      { input: [[1, 2, 3], 2], expected: -1 },
    ],
    hint: "The target is the successor of the previous matching token, which is how a repeated pattern gets completed.",
  },
  {
    id: "dl-409",
    title: "Causal Attention With Temperature",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a causal mask and a temperature-scaled softmax to attention scores. Position i attends only to j <= i, and each kept score is divided by temperature before the stable softmax.\n\nThe signature is causal_attention_temperature(scores, temperature). Masked future entries become weight 0.0.",
    starterCode: `import math
def causal_attention_temperature(scores, temperature):
    # Your code here
    pass`,
    solution: `import math
def causal_attention_temperature(scores, temperature):
    out = []
    for i in range(len(scores)):
        row = scores[i]
        m = max(row[:i + 1])
        exps = [math.exp((row[j] - m) / temperature) if j <= i else 0.0 for j in range(len(row))]
        total = sum(exps)
        out.append([e / total for e in exps])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1.0], expected: [[1.0, 0.0], [0.2689414214, 0.7310585786]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 2.0], expected: [[1.0, 0.0], [0.5, 0.5]] },
      { input: [[[1.0]], 0.5], expected: [[1.0]] },
      { input: [[[2.0, 2.0, 100.0], [0.0, 1.0, 0.0]], 1.0], expected: [[1.0, 0.0, 0.0], [0.2689414214, 0.7310585786, 0.0]] },
    ],
    hint: "Each row has its own maximum over the unmasked prefix, and future columns stay exactly zero.",
  },
  {
    id: "dl-410",
    title: "QK-Norm Attention Scores",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Apply QK-Norm: RMS-normalize every query and key row, then compute scaled dot-product scores with the usual 1 / sqrt(d) factor. This removes row magnitude from the dot products and keeps logits bounded.\n\nThe signature is qk_norm_scores(Q, K, eps=0.0). Return the (seq_q, seq_k) score matrix.",
    starterCode: `import math
def qk_norm_scores(Q, K, eps=0.0):
    # Your code here
    pass`,
    solution: `import math
def qk_norm_scores(Q, K, eps=0.0):
    Qn = []
    for row in Q:
        ms = sum(v * v for v in row) / len(row)
        r = math.sqrt(ms + eps)
        Qn.append([v / r for v in row])
    Kn = []
    for row in K:
        ms = sum(v * v for v in row) / len(row)
        r = math.sqrt(ms + eps)
        Kn.append([v / r for v in row])
    d = len(Qn[0])
    scale = 1.0 / math.sqrt(d)
    return [[sum(Qn[i][k] * Kn[j][k] for k in range(d)) * scale for j in range(len(Kn))] for i in range(len(Qn))]`,
    testCases: [
      { input: [[[2.0, 0.0], [0.0, 3.0]], [[1.0, 0.0], [0.0, 1.0]], 0.0], expected: [[1.4142135624, 0.0], [0.0, 1.4142135624]] },
      { input: [[[1.0, 0.0]], [[1.0, 0.0]], 0.0], expected: [[1.4142135624]] },
      { input: [[[3.0, 4.0]], [[3.0, 4.0]], 0.0], expected: [[1.4142135624]] },
      { input: [[[1.0, 2.0]], [[2.0, 1.0]], 0.0], expected: [[1.1313708499]] },
    ],
    hint: "After RMS normalization the mean square of each row is 1, so self-scores scale with the dimension as sqrt(d) times 1 / sqrt(d).",
  },
];
