import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-096",
    title: "Seq2Seq Encoder Final State",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the final hidden state of a sequence encoder: given a list of per-timestep hidden vectors, return a copy of the last one.\n\nThe signature is encoder_final_state(hidden_states). This final state is what a seq2seq model passes to its decoder.",
    starterCode: `def encoder_final_state(hidden_states):
    # Your code here
    pass`,
    solution: `def encoder_final_state(hidden_states):
    return list(hidden_states[-1])`,
    testCases: [
      { input: [[[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]]], expected: [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]] },
      { input: [[[[1.0]]]], expected: [[1.0]] },
      { input: [[[[0.0, -1.0], [2.0, 3.0]]]], expected: [[0.0, -1.0], [2.0, 3.0]] },
      { input: [[[[1.0, 2.0, 3.0]]]], expected: [[1.0, 2.0, 3.0]] },
    ],
    hint: "The encoder context is simply the last timestep's hidden vector.",
  },
  {
    id: "dl-097",
    title: "Cross-Attention Shapes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the shapes inside encoder-decoder cross attention. With decoder length dec_len, encoder length enc_len, num_heads and head_dim, the attention weight tensor has shape [num_heads, dec_len, enc_len] and the output has shape [dec_len, num_heads, head_dim].\n\nThe signature is cross_attention_shapes(dec_len, enc_len, num_heads, head_dim). Return [weights_shape, output_shape].",
    starterCode: `def cross_attention_shapes(dec_len, enc_len, num_heads, head_dim):
    # Your code here
    pass`,
    solution: `def cross_attention_shapes(dec_len, enc_len, num_heads, head_dim):
    return [[num_heads, dec_len, enc_len], [dec_len, num_heads, head_dim]]`,
    testCases: [
      { input: [4, 6, 8, 64], expected: [[8, 4, 6], [4, 8, 64]] },
      { input: [1, 1, 1, 1], expected: [[1, 1, 1], [1, 1, 1]] },
      { input: [2, 5, 2, 3], expected: [[2, 2, 5], [2, 2, 3]] },
      { input: [10, 10, 4, 16], expected: [[4, 10, 10], [10, 4, 16]] },
    ],
    hint: "Queries come from the decoder and keys/values from the encoder, so the weight matrix is dec_len x enc_len.",
  },
  {
    id: "dl-098",
    title: "Model Top-1 Agreement",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Measure how often two models agree on their top-1 prediction: the fraction of rows where the argmax of logits_a equals the argmax of logits_b. Break ties by the smaller index.\n\nThe signature is top1_agreement(logits_a, logits_b). Both inputs are 2D logit matrices with the same shape.",
    starterCode: `def top1_agreement(logits_a, logits_b):
    # Your code here
    pass`,
    solution: `def top1_agreement(logits_a, logits_b):
    agree = 0
    for i in range(len(logits_a)):
        a = max(range(len(logits_a[i])), key=lambda j: (logits_a[i][j], -j))
        b = max(range(len(logits_b[i])), key=lambda j: (logits_b[i][j], -j))
        if a == b:
            agree += 1
    return agree / len(logits_a)`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]], [[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]]], expected: 1.0 },
      { input: [[[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]], [[3.0, 2.0, 1.0], [1.0, 2.0, 3.0]]], expected: 0.0 },
      { input: [[[1.0, 1.0]], [[1.0, 2.0]]], expected: 0.0 },
      { input: [[[0.0, 0.0]], [[5.0, 5.0]]], expected: 1.0 },
    ],
    hint: "Agreement is a useful cheap ensemble diversity signal before computing full accuracy.",
  },
  {
    id: "dl-099",
    title: "Ensemble Soft Voting",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Average the class probabilities of an ensemble element-wise, then return the argmax class per row, breaking ties by the smaller class index.\n\nThe signature is ensemble_soft_voting(probs_list). probs_list is a list of models, each contributing a (rows, classes) probability matrix.",
    starterCode: `def ensemble_soft_voting(probs_list):
    # Your code here
    pass`,
    solution: `def ensemble_soft_voting(probs_list):
    n_models = len(probs_list)
    rows = len(probs_list[0])
    cols = len(probs_list[0][0])
    out = []
    for i in range(rows):
        avg = [sum(probs_list[m][i][j] for m in range(n_models)) / n_models for j in range(cols)]
        best = 0
        for j in range(1, cols):
            if avg[j] > avg[best]:
                best = j
        out.append(best)
    return out`,
    testCases: [
      { input: [[[[0.1, 0.6, 0.3]], [[0.2, 0.5, 0.3]]]], expected: [1] },
      { input: [[[[0.2, 0.5, 0.3], [0.6, 0.3, 0.1]], [[0.2, 0.5, 0.3], [0.4, 0.3, 0.3]]]], expected: [1, 0] },
      { input: [[[[0.5, 0.5]]]], expected: [0] },
      { input: [[[[0.4, 0.4], [0.3, 0.7]], [[0.4, 0.4], [0.7, 0.3]]]], expected: [0, 0] },
    ],
    hint: "Average the probabilities first, then take the argmax; strict greater-than keeps ties at the smaller index.",
  },
  {
    id: "dl-100",
    title: "Micro-Batch Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the number of micro-batches needed to cover a dataset: ceil(dataset_size / batch_size).\n\nThe signature is micro_batch_count(dataset_size, batch_size). Return an integer.",
    starterCode: `def micro_batch_count(dataset_size, batch_size):
    # Your code here
    pass`,
    solution: `def micro_batch_count(dataset_size, batch_size):
    return (dataset_size + batch_size - 1) // batch_size`,
    testCases: [
      { input: [1000, 10], expected: 100 },
      { input: [1001, 10], expected: 101 },
      { input: [0, 10], expected: 0 },
      { input: [7, 3], expected: 3 },
    ],
    hint: "Add batch_size - 1 before the integer division to round up.",
  },
  {
    id: "dl-101",
    title: "Throughput Estimate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate token throughput in tokens per second: batch_size * seq_len / seconds.\n\nThe signature is throughput_tokens(batch_size, seq_len, seconds).",
    starterCode: `def throughput_tokens(batch_size, seq_len, seconds):
    # Your code here
    pass`,
    solution: `def throughput_tokens(batch_size, seq_len, seconds):
    return batch_size * seq_len / seconds`,
    testCases: [
      { input: [8, 128, 2.0], expected: 512.0 },
      { input: [1, 1, 0.5], expected: 2.0 },
      { input: [32, 512, 4.0], expected: 4096.0 },
      { input: [1, 1, 3.0], expected: 0.3333333333 },
    ],
    hint: "Tokens per step is batch times sequence length.",
  },
  {
    id: "dl-102",
    title: "Latency Estimate",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate per-token latency in milliseconds: total_ms / num_tokens.\n\nThe signature is latency_ms_per_token(total_ms, num_tokens).",
    starterCode: `def latency_ms_per_token(total_ms, num_tokens):
    # Your code here
    pass`,
    solution: `def latency_ms_per_token(total_ms, num_tokens):
    return total_ms / num_tokens`,
    testCases: [
      { input: [100.0, 50], expected: 2.0 },
      { input: [1.0, 8], expected: 0.125 },
      { input: [250.0, 1000], expected: 0.25 },
      { input: [5.0, 4], expected: 1.25 },
    ],
    hint: "Per-token latency is what matters for streaming generation.",
  },
  {
    id: "dl-103",
    title: "Dilated Conv Receptive Field",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the receptive field of num_layers stacked convolutions with kernel size k and dilation d: 1 + num_layers * (k - 1) * d.\n\nThe signature is dilated_receptive_field(kernel_size, dilation, num_layers). Return an integer.",
    starterCode: `def dilated_receptive_field(kernel_size, dilation, num_layers):
    # Your code here
    pass`,
    solution: `def dilated_receptive_field(kernel_size, dilation, num_layers):
    return 1 + num_layers * (kernel_size - 1) * dilation`,
    testCases: [
      { input: [3, 1, 1], expected: 3 },
      { input: [3, 2, 1], expected: 5 },
      { input: [3, 1, 4], expected: 9 },
      { input: [3, 2, 3], expected: 13 },
      { input: [5, 4, 2], expected: 33 },
    ],
    hint: "Each layer extends the receptive field by (k - 1) * dilation.",
  },
  {
    id: "dl-104",
    title: "Embedding Parameter Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the parameters of an embedding table: vocab_size * d_model.\n\nThe signature is embedding_param_count(vocab_size, d_model). Return an integer.",
    starterCode: `def embedding_param_count(vocab_size, d_model):
    # Your code here
    pass`,
    solution: `def embedding_param_count(vocab_size, d_model):
    return vocab_size * d_model`,
    testCases: [
      { input: [10000, 512], expected: 5120000 },
      { input: [1, 1], expected: 1 },
      { input: [32000, 1024], expected: 32768000 },
      { input: [50000, 768], expected: 38400000 },
    ],
    hint: "Every vocabulary entry has its own d_model-dimensional row.",
  },
  {
    id: "dl-105",
    title: "Vocab Projection Memory",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate the memory of the vocabulary projection (output head) matrix: vocab_size * d_model * bytes_per_value.\n\nThe signature is vocab_projection_memory(vocab_size, d_model, bytes_per_value=4). Return an integer number of bytes.",
    starterCode: `def vocab_projection_memory(vocab_size, d_model, bytes_per_value=4):
    # Your code here
    pass`,
    solution: `def vocab_projection_memory(vocab_size, d_model, bytes_per_value=4):
    return vocab_size * d_model * bytes_per_value`,
    testCases: [
      { input: [32000, 1024, 2], expected: 65536000 },
      { input: [50000, 768, 4], expected: 153600000 },
      { input: [1, 1, 1], expected: 1 },
      { input: [1000, 128, 4], expected: 512000 },
    ],
    hint: "The output head is one of the largest single matrices in an LLM.",
  },
  {
    id: "dl-106",
    title: "Optimizer State Memory",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate optimizer state memory: num_params * num_states * bytes_per_value.\n\nThe signature is optimizer_state_memory(num_params, num_states, bytes_per_value=4). Return an integer number of bytes.",
    starterCode: `def optimizer_state_memory(num_params, num_states, bytes_per_value=4):
    # Your code here
    pass`,
    solution: `def optimizer_state_memory(num_params, num_states, bytes_per_value=4):
    return num_params * num_states * bytes_per_value`,
    testCases: [
      { input: [1000000, 2, 4], expected: 8000000 },
      { input: [1, 2, 4], expected: 8 },
      { input: [7000000000, 2, 4], expected: 56000000000 },
      { input: [1000, 1, 2], expected: 2000 },
    ],
    hint: "Adam-style optimizers keep two state tensors per parameter.",
  },
  {
    id: "dl-107",
    title: "AdamW State Bytes",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the AdamW optimizer state size in bytes. AdamW keeps two moment estimates per parameter, so the state is 2 * num_params * bytes_per_value.\n\nThe signature is adamw_state_bytes(num_params, bytes_per_value=4). Return an integer.",
    starterCode: `def adamw_state_bytes(num_params, bytes_per_value=4):
    # Your code here
    pass`,
    solution: `def adamw_state_bytes(num_params, bytes_per_value=4):
    return 2 * num_params * bytes_per_value`,
    testCases: [
      { input: [1, 4], expected: 8 },
      { input: [1000000, 4], expected: 8000000 },
      { input: [1000, 2], expected: 4000 },
      { input: [0, 4], expected: 0 },
    ],
    hint: "The two moments are the first moment and the second moment.",
  },
  {
    id: "dl-108",
    title: "Mixed Precision Memory Saving",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the bytes saved by storing parameters in half precision instead of full precision: num_params * (full_bytes - half_bytes).\n\nThe signature is mixed_precision_saving(num_params, full_bytes=4, half_bytes=2). Return an integer number of bytes.",
    starterCode: `def mixed_precision_saving(num_params, full_bytes=4, half_bytes=2):
    # Your code here
    pass`,
    solution: `def mixed_precision_saving(num_params, full_bytes=4, half_bytes=2):
    return num_params * (full_bytes - half_bytes)`,
    testCases: [
      { input: [1000000], expected: 2000000 },
      { input: [1], expected: 2 },
      { input: [7000000000, 4, 2], expected: 14000000000 },
      { input: [1000, 2, 1], expected: 1000 },
    ],
    hint: "Each parameter drops from 4 bytes to 2 bytes in fp16/bf16.",
  },
  {
    id: "dl-109",
    title: "Pooling FLOPs",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Count the comparison operations of max pooling: each output compares pool_h * pool_w - 1 candidates, so FLOPs = batch * channels * out_h * out_w * (pool_h * pool_w - 1).\n\nThe signature is pooling_flops(batch, channels, out_h, out_w, pool_h, pool_w). Return an integer.",
    starterCode: `def pooling_flops(batch, channels, out_h, out_w, pool_h, pool_w):
    # Your code here
    pass`,
    solution: `def pooling_flops(batch, channels, out_h, out_w, pool_h, pool_w):
    return batch * channels * out_h * out_w * (pool_h * pool_w - 1)`,
    testCases: [
      { input: [1, 3, 2, 2, 2, 2], expected: 36 },
      { input: [1, 1, 1, 1, 2, 2], expected: 3 },
      { input: [2, 64, 7, 7, 2, 2], expected: 18816 },
      { input: [1, 1, 4, 4, 3, 3], expected: 128 },
    ],
    hint: "A window of n elements needs n - 1 comparisons to find the maximum.",
  },
  {
    id: "dl-110",
    title: "MAE Patch Masking Count",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the number of patches and masked patches for masked autoencoders. For a square image and square patch size, num_patches = (image_size // patch_size)^2 and the masked count is round(num_patches * mask_ratio).\n\nThe signature is mae_patch_mask_count(image_size, patch_size, mask_ratio). Return [num_patches, num_masked].",
    starterCode: `def mae_patch_mask_count(image_size, patch_size, mask_ratio):
    # Your code here
    pass`,
    solution: `def mae_patch_mask_count(image_size, patch_size, mask_ratio):
    n = (image_size // patch_size) ** 2
    masked = int(round(n * mask_ratio))
    return [n, masked]`,
    testCases: [
      { input: [224, 16, 0.75], expected: [196, 147] },
      { input: [32, 8, 0.5], expected: [16, 8] },
      { input: [96, 16, 0.25], expected: [36, 9] },
      { input: [64, 16, 0.5], expected: [16, 8] },
    ],
    hint: "MAE typically masks 75 percent of the patches and encodes only the visible ones.",
  },
  {
    id: "dl-111",
    title: "ViT Class Token",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Prepend the learnable ViT class token to a sequence of patch embeddings, returning a new sequence of length len(x) + 1.\n\nThe signature is vit_class_token(x, cls_token). x has shape (num_patches, d_model) and cls_token is a length d_model vector.",
    starterCode: `def vit_class_token(x, cls_token):
    # Your code here
    pass`,
    solution: `def vit_class_token(x, cls_token):
    return [list(cls_token)] + [list(row) for row in x]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0.0, 0.0]], expected: [[0.0, 0.0], [1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1.0]], [9.0]], expected: [[9.0], [1.0]] },
      { input: [[[0.5, -0.5], [1.0, 2.0], [3.0, 4.0]], [1.0, -1.0]], expected: [[1.0, -1.0], [0.5, -0.5], [1.0, 2.0], [3.0, 4.0]] },
      { input: [[[2.0, 3.0]], [0.0, 0.0]], expected: [[0.0, 0.0], [2.0, 3.0]] },
    ],
    hint: "The class token is prepended like a BERT-style special token; its output is used for classification.",
  },
  {
    id: "dl-112",
    title: "Peephole LSTM",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "One peephole LSTM step. The forget and input gates see the previous cell state and the output gate sees the new cell state: f = sigmoid(Wf x + Uf h + pf * c_prev), i = sigmoid(Wi x + Ui h + pi * c_prev), g = tanh(Wg x + Ug h), c = f * c_prev + i * g, o = sigmoid(Wo x + Uo h + po * c), h = o * tanh(c).\n\nThe signature is peephole_lstm(x, h_prev, c_prev, W, U, b, p). W, U and b are lists of four matrices/vectors, and p is [pf, pi, po]. Return [h, c].",
    starterCode: `import math
def peephole_lstm(x, h_prev, c_prev, W, U, b, p):
    # Your code here
    pass`,
    solution: `import math
def peephole_lstm(x, h_prev, c_prev, W, U, b, p):
    def sig(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def affine(Wm, Um, bv):
        out = []
        for i in range(len(bv)):
            s = bv[i]
            for j in range(len(x)):
                s += Wm[i][j] * x[j]
            for j in range(len(h_prev)):
                s += Um[i][j] * h_prev[j]
            out.append(s)
        return out

    units = len(h_prev)
    zf = affine(W[0], U[0], b[0])
    zi = affine(W[1], U[1], b[1])
    zg = affine(W[2], U[2], b[2])
    zo = affine(W[3], U[3], b[3])
    f = [sig(zf[k] + p[0][k] * c_prev[k]) for k in range(units)]
    i = [sig(zi[k] + p[1][k] * c_prev[k]) for k in range(units)]
    g = [math.tanh(zg[k]) for k in range(units)]
    c = [f[k] * c_prev[k] + i[k] * g[k] for k in range(units)]
    o = [sig(zo[k] + p[2][k] * c[k]) for k in range(units)]
    h = [o[k] * math.tanh(c[k]) for k in range(units)]
    return [h, c]`,
    testCases: [
      { input: [[1.0], [0.0], [0.0], [[[0.0]], [[0.0]], [[0.0]], [[0.0]]], [[[0.0]], [[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0], [0.0]], [[0.0], [0.0], [0.0]]], expected: [[0.0], [0.0]] },
      { input: [[1.0], [0.0], [1.0], [[[5.0]], [[0.0]], [[0.0]], [[0.0]]], [[[0.0]], [[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0], [0.0]], [[0.0], [0.0], [0.0]]], expected: [[0.3793844859], [0.9933071491]] },
      { input: [[2.0], [0.0], [1.0], [[[0.0]], [[0.0]], [[1.0]], [[0.0]]], [[[0.0]], [[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0], [0.0]], [[1.0], [0.0], [0.0]]], expected: [[0.4187993669], [1.2130723687]] },
      { input: [[1.0], [0.5], [0.5], [[[1.0]], [[1.0]], [[1.0]], [[1.0]]], [[[0.5]], [[0.5]], [[0.5]], [[0.5]]], [[0.1], [0.1], [0.1], [0.1]], [[0.5], [0.5], [0.5]]], expected: [[0.7113772528], [1.1432375977]] },
    ],
    hint: "Peephole connections let the gates read the cell state directly; the output gate reads the updated c.",
  },
  {
    id: "dl-113",
    title: "Bidirectional RNN Output Concat",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Concatenate the forward and backward hidden states of a bidirectional RNN at each timestep, producing one vector of length forward_dim + backward_dim per step.\n\nThe signature is bidi_concat(forward_states, backward_states). Both inputs are lists with the same number of timesteps.",
    starterCode: `def bidi_concat(forward_states, backward_states):
    # Your code here
    pass`,
    solution: `def bidi_concat(forward_states, backward_states):
    out = []
    for t in range(len(forward_states)):
        row = list(forward_states[t]) + list(backward_states[t])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[10.0, 20.0], [30.0, 40.0]]], expected: [[1.0, 2.0, 10.0, 20.0], [3.0, 4.0, 30.0, 40.0]] },
      { input: [[[1.0]], [[2.0]]], expected: [[1.0, 2.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], [[0.0], [0.0], [0.0]]], expected: [[1.0, 2.0, 0.0], [3.0, 4.0, 0.0], [5.0, 6.0, 0.0]] },
    ],
    hint: "Forward reads left to right and backward reads right to left; concatenate them per position.",
  },
  {
    id: "dl-114",
    title: "Attention Decoder Context",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the context vector for an attention decoder: score each encoder state with a dot product against the decoder query, apply a stable softmax over the scores, then take the weighted sum of the encoder states.\n\nThe signature is attention_context(query, encoder_states). Return a vector with the same dimension as the query.",
    starterCode: `import math
def attention_context(query, encoder_states):
    # Your code here
    pass`,
    solution: `import math
def attention_context(query, encoder_states):
    scores = [sum(query[j] * encoder_states[t][j] for j in range(len(query))) for t in range(len(encoder_states))]
    m = max(scores)
    exps = [math.exp(v - m) for v in scores]
    total = sum(exps)
    weights = [e / total for e in exps]
    return [sum(weights[t] * encoder_states[t][j] for t in range(len(encoder_states))) for j in range(len(query))]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]]], expected: [0.7310585786, 0.2689414214] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, 1.0]]], expected: [0.2689414214, 0.7310585786] },
      { input: [[1.0, 1.0], [[1.0, 0.0], [0.0, 1.0]]], expected: [0.5, 0.5] },
      { input: [[2.0, 0.0], [[3.0, 4.0]]], expected: [3.0, 4.0] },
    ],
    hint: "One encoder state means the softmax is 1.0 and the context is exactly that state.",
  },
  {
    id: "dl-115",
    title: "Bahdanau Additive Attention",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute Bahdanau additive attention scores: score_j = v dot tanh(W q + U k_j), where q is the query, k_j is the j-th key, W and U are projection matrices and v is the output vector. No softmax is applied.\n\nThe signature is bahdanau_scores(query, keys, W, U, v). Return the list of scores.",
    starterCode: `import math
def bahdanau_scores(query, keys, W, U, v):
    # Your code here
    pass`,
    solution: `import math
def bahdanau_scores(query, keys, W, U, v):
    scores = []
    for k in range(len(keys)):
        proj = []
        for i in range(len(v)):
            s = 0.0
            for j in range(len(query)):
                s += W[i][j] * query[j]
            for j in range(len(keys[k])):
                s += U[i][j] * keys[k][j]
            proj.append(math.tanh(s))
        scores.append(sum(v[i] * proj[i] for i in range(len(v))))
    return scores`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [1.0, 0.0]], expected: [0.9640275801, 0.761594156] },
      { input: [[1.0, 1.0], [[1.0, 0.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [1.0, 1.0]], expected: [1.725621736] },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [1.0, 0.0]], expected: [0.761594156, 0.0] },
      { input: [[1.0, 2.0], [[1.0, 2.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 1.0]], expected: [0.9993292997] },
    ],
    hint: "Additive attention projects query and key into a shared space, applies tanh, then scores with v.",
  },
  {
    id: "dl-116",
    title: "Transformer Decoder Masked Self-Attention",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Single-head masked self-attention for a transformer decoder: compute Q = x Wq, K = x Wk, V = x Wv, scale scores by 1 / sqrt(d), replace entries above the diagonal with -1e9, apply a row-wise softmax and return the weighted sum of V.\n\nThe signature is masked_self_attention(x, Wq, Wk, Wv). All weight matrices are square d x d.",
    starterCode: `import math
def masked_self_attention(x, Wq, Wk, Wv):
    # Your code here
    pass`,
    solution: `import math
def masked_self_attention(x, Wq, Wk, Wv):
    seq = len(x)
    d = len(x[0])
    Q = [[sum(x[i][k] * Wq[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    K = [[sum(x[i][k] * Wk[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    V = [[sum(x[i][k] * Wv[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    scale = 1.0 / math.sqrt(d)
    scores = [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(seq)] for i in range(seq)]
    masked = [[scores[i][j] if j <= i else -1e9 for j in range(seq)] for i in range(seq)]
    weights = []
    for row in masked:
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        total = sum(exps)
        weights.append([e / total for e in exps])
    return [[sum(weights[i][j] * V[j][k] for j in range(seq)) for k in range(d)] for i in range(seq)]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[1.0, 0.0], [0.3302384507, 0.6697615493]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[1.0, 2.0], [2.999899605, 3.999899605]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]], [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]], [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]], [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]], expected: [[1.0, 0.0, 0.0], [0.3595425243, 0.6404574757, 0.0], [0.2644584615, 0.2644584615, 0.471083077]] },
    ],
    hint: "Each position may only attend to itself and earlier positions, which is what the causal mask enforces.",
  },
  {
    id: "dl-117",
    title: "Weight Tying Parameter Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compare the parameter count of an embedding table and an output projection head when the weights are tied. The embedding costs vocab_size * d_model parameters; the output head costs the same amount unless tying removes it.\n\nThe signature is weight_tying_params(vocab_size, d_model, tied). Return [embedding_params, output_params, total_params].",
    starterCode: `def weight_tying_params(vocab_size, d_model, tied):
    # Your code here
    pass`,
    solution: `def weight_tying_params(vocab_size, d_model, tied):
    emb = vocab_size * d_model
    out = 0 if tied else vocab_size * d_model
    return [emb, out, emb + out]`,
    testCases: [
      { input: [10000, 512, true], expected: [5120000, 0, 5120000] },
      { input: [10000, 512, false], expected: [5120000, 5120000, 10240000] },
      { input: [32000, 768, true], expected: [24576000, 0, 24576000] },
      { input: [1, 1, false], expected: [1, 1, 2] },
    ],
    hint: "Tying shares the embedding matrix with the output projection, saving the full table.",
  },
  {
    id: "dl-118",
    title: "Drop-Path Mask (Seeded)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Stochastic depth (drop-path) for a batch of token rows. Call random.seed(seed), draw one random number per row, drop the entire row with probability p, and scale surviving rows by 1 / (1 - p).\n\nThe signature is drop_path(x, p, seed). Iterate rows in order so the mask is reproducible.",
    starterCode: `import random
def drop_path(x, p, seed):
    # Your code here
    pass`,
    solution: `import random
def drop_path(x, p, seed):
    random.seed(seed)
    out = []
    for row in x:
        if random.random() < p:
            out.append([0.0] * len(row))
        else:
            out.append([v / (1.0 - p) for v in row])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], 0.5, 0], expected: [[2.0, 4.0], [6.0, 8.0], [0.0, 0.0]] },
      { input: [[[1.0, 2.0]], 0.0, 5], expected: [[1.0, 2.0]] },
      { input: [[[1.0, 1.0], [2.0, 2.0]], 0.25, 42], expected: [[1.3333333333, 1.3333333333], [0.0, 0.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]], 0.8, 7], expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]] },
    ],
    hint: "Drop-path drops whole residual branches, unlike dropout which drops individual activations.",
  },
  {
    id: "dl-119",
    title: "Attention Dropout (Seeded)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply inverted dropout to an attention weight matrix. Call random.seed(seed), draw one random number per matrix entry in row-major order, zero entries with probability p and scale the rest by 1 / (1 - p).\n\nThe signature is attention_dropout(weights, p, seed).",
    starterCode: `import random
def attention_dropout(weights, p, seed):
    # Your code here
    pass`,
    solution: `import random
def attention_dropout(weights, p, seed):
    random.seed(seed)
    out = []
    for row in weights:
        new_row = []
        for w in row:
            if random.random() < p:
                new_row.append(0.0)
            else:
                new_row.append(w / (1.0 - p))
        out.append(new_row)
    return out`,
    testCases: [
      { input: [[[0.5, 0.5]], 0.5, 1], expected: [[0.0, 1.0]] },
      { input: [[[0.2, 0.8], [0.6, 0.4]], 0.25, 3], expected: [[0.0, 1.0666666667], [0.8, 0.5333333333]] },
      { input: [[[1.0]], 0.0, 9], expected: [[1.0]] },
      { input: [[[0.5, 0.5], [0.5, 0.5]], 0.75, 11], expected: [[0.0, 0.0], [2.0, 0.0]] },
    ],
    hint: "Dropout on attention discourages a token from relying on a single source position.",
  },
  {
    id: "dl-120",
    title: "Gradient Checkpointing Memory",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Estimate gradient checkpointing memory. The baseline stores every layer activation: num_layers * activation_mb. With a checkpoint every k layers, the peak is (ceil(num_layers / k) + k) * activation_mb, since all checkpoints plus one recomputed segment are held.\n\nThe signature is checkpointing_memory(num_layers, activation_mb, checkpoint_every). Return [baseline_mb, checkpointed_mb, saved_mb].",
    starterCode: `def checkpointing_memory(num_layers, activation_mb, checkpoint_every):
    # Your code here
    pass`,
    solution: `def checkpointing_memory(num_layers, activation_mb, checkpoint_every):
    baseline = num_layers * activation_mb
    checkpoints = (num_layers + checkpoint_every - 1) // checkpoint_every
    peak = (checkpoints + checkpoint_every) * activation_mb
    return [baseline, peak, baseline - peak]`,
    testCases: [
      { input: [12, 100, 3], expected: [1200, 700, 500] },
      { input: [24, 50, 4], expected: [1200, 500, 700] },
      { input: [10, 20, 5], expected: [200, 140, 60] },
      { input: [8, 16, 2], expected: [128, 96, 32] },
    ],
    hint: "Checkpointing trades compute for memory: activations are recomputed during backward.",
  },
  {
    id: "dl-121",
    title: "Tensor Parallel Column Split",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Split a weight matrix along its input (column) dimension for tensor parallelism. Each partition keeps all output rows but only in_dim / num_partitions consecutive columns.\n\nThe signature is column_split(weight, num_partitions). Return the list of partitioned matrices.",
    starterCode: `def column_split(weight, num_partitions):
    # Your code here
    pass`,
    solution: `def column_split(weight, num_partitions):
    out_dim = len(weight)
    in_dim = len(weight[0])
    per = in_dim // num_partitions
    parts = []
    for p in range(num_partitions):
        part = [[weight[i][p * per + j] for j in range(per)] for i in range(out_dim)]
        parts.append(part)
    return parts`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]], 2], expected: [[[1.0, 2.0], [5.0, 6.0]], [[3.0, 4.0], [7.0, 8.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1], expected: [[[1.0, 2.0], [3.0, 4.0]]] },
      { input: [[[1.0, 2.0, 3.0, 4.0]], 4], expected: [[[1.0]], [[2.0]], [[3.0]], [[4.0]]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]], 3], expected: [[[1.0], [4.0]], [[2.0], [5.0]], [[3.0], [6.0]]] },
    ],
    hint: "Column parallelism splits each projection so every GPU computes a slice of the output.",
  },
  {
    id: "dl-122",
    title: "Pipeline Bubble Fraction",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the pipeline bubble fraction for GPipe-style scheduling: (num_stages - 1) / (num_microbatches + num_stages - 1).\n\nThe signature is pipeline_bubble_fraction(num_stages, num_microbatches).",
    starterCode: `def pipeline_bubble_fraction(num_stages, num_microbatches):
    # Your code here
    pass`,
    solution: `def pipeline_bubble_fraction(num_stages, num_microbatches):
    return (num_stages - 1) / (num_microbatches + num_stages - 1)`,
    testCases: [
      { input: [4, 8], expected: 0.2727272727 },
      { input: [4, 1], expected: 0.75 },
      { input: [1, 10], expected: 0.0 },
      { input: [8, 32], expected: 0.1794871795 },
    ],
    hint: "More micro-batches per step shrink the idle bubble at the pipeline start and end.",
  },
  {
    id: "dl-123",
    title: "Attention FLOPs (Quadratic)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the FLOPs of the two quadratic attention matrix products (scores QK^T and the weighted sum of V), treating a multiply-add as 2 FLOPs: 4 * batch_size * seq_len^2 * d_model.\n\nThe signature is attention_scores_flops(batch_size, seq_len, d_model). Return an integer.",
    starterCode: `def attention_scores_flops(batch_size, seq_len, d_model):
    # Your code here
    pass`,
    solution: `def attention_scores_flops(batch_size, seq_len, d_model):
    return 4 * batch_size * seq_len * seq_len * d_model`,
    testCases: [
      { input: [1, 128, 512], expected: 33554432 },
      { input: [8, 512, 768], expected: 6442450944 },
      { input: [1, 1, 64], expected: 256 },
      { input: [2, 32, 128], expected: 1048576 },
    ],
    hint: "Both score computation and weighted sum scale with seq_len squared.",
  },
  {
    id: "dl-124",
    title: "Flash Attention Block Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the tile pairs processed by tiled flash attention: ceil(seq_len / block_size) query blocks times the same number of key blocks.\n\nThe signature is flash_attention_blocks(seq_len, block_size). Return an integer.",
    starterCode: `def flash_attention_blocks(seq_len, block_size):
    # Your code here
    pass`,
    solution: `def flash_attention_blocks(seq_len, block_size):
    n = (seq_len + block_size - 1) // block_size
    return n * n`,
    testCases: [
      { input: [1024, 128], expected: 64 },
      { input: [1000, 128], expected: 64 },
      { input: [128, 128], expected: 1 },
      { input: [100, 32], expected: 16 },
    ],
    hint: "Flash attention never materializes the full seq_len x seq_len matrix; it works tile by tile.",
  },
  {
    id: "dl-125",
    title: "Causal Conv1D Output",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a causal 1D convolution. Left-pad the input with (k - 1) * dilation zeros so that output position t only depends on inputs up to t, then slide the kernel with the given dilation and unit stride. The output length equals the input length.\n\nThe signature is causal_conv1d(x, kernel, dilation=1).",
    starterCode: `def causal_conv1d(x, kernel, dilation=1):
    # Your code here
    pass`,
    solution: `def causal_conv1d(x, kernel, dilation=1):
    k = len(kernel)
    pad = (k - 1) * dilation
    padded = [0.0] * pad + list(x)
    out = []
    for t in range(len(x)):
        s = 0.0
        for j in range(k):
            s += padded[t + j * dilation] * kernel[j]
        out.append(s)
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1.0, 1.0], 1], expected: [1.0, 3.0, 5.0] },
      { input: [[1.0, 2.0, 3.0, 4.0], [1.0, 0.0, 1.0], 1], expected: [1.0, 2.0, 4.0, 6.0] },
      { input: [[1.0, 2.0, 3.0, 4.0], [0.5, 0.0, 0.5], 1], expected: [0.5, 1.0, 2.0, 3.0] },
      { input: [[1.0, 2.0, 3.0, 4.0], [1.0, 0.0, 1.0], 2], expected: [1.0, 2.0, 3.0, 4.0] },
    ],
    hint: "Causal convolutions are the convolutional counterpart of masked self-attention.",
  },
  {
    id: "dl-126",
    title: "LSTM Parameter Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the parameters of an LSTM layer: 4 * (input_dim * hidden_dim + hidden_dim * hidden_dim), plus 4 * hidden_dim if bias is enabled (one bias per gate).\n\nThe signature is lstm_param_count(input_dim, hidden_dim, bias=True). Return an integer.",
    starterCode: `def lstm_param_count(input_dim, hidden_dim, bias=True):
    # Your code here
    pass`,
    solution: `def lstm_param_count(input_dim, hidden_dim, bias=True):
    params = 4 * (input_dim * hidden_dim + hidden_dim * hidden_dim)
    if bias:
        params += 4 * hidden_dim
    return params`,
    testCases: [
      { input: [512, 512], expected: 2099200 },
      { input: [100, 128, false], expected: 116736 },
      { input: [1, 1], expected: 12 },
      { input: [64, 32], expected: 12416 },
    ],
    hint: "The four gates are forget, input, cell candidate and output.",
  },
  {
    id: "dl-127",
    title: "GRU Parameter Count",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Count the parameters of a GRU layer: 3 * (input_dim * hidden_dim + hidden_dim * hidden_dim), plus 3 * hidden_dim if bias is enabled (one bias per gate).\n\nThe signature is gru_param_count(input_dim, hidden_dim, bias=True). Return an integer.",
    starterCode: `def gru_param_count(input_dim, hidden_dim, bias=True):
    # Your code here
    pass`,
    solution: `def gru_param_count(input_dim, hidden_dim, bias=True):
    params = 3 * (input_dim * hidden_dim + hidden_dim * hidden_dim)
    if bias:
        params += 3 * hidden_dim
    return params`,
    testCases: [
      { input: [512, 512], expected: 1574400 },
      { input: [100, 128, false], expected: 87552 },
      { input: [1, 1], expected: 9 },
      { input: [64, 32], expected: 9312 },
    ],
    hint: "The three gates are reset, update and candidate; GRUs have one fewer gate than LSTMs.",
  },
  {
    id: "dl-128",
    title: "Loss Spike Detection",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Flag loss spikes using a z-score over the whole loss list: return the indices where (loss - mean) / std exceeds z_threshold, using the population standard deviation. If the standard deviation is zero, return an empty list.\n\nThe signature is loss_spike_detect(losses, z_threshold).",
    starterCode: `import math
def loss_spike_detect(losses, z_threshold):
    # Your code here
    pass`,
    solution: `import math
def loss_spike_detect(losses, z_threshold):
    n = len(losses)
    mean = sum(losses) / n
    var = sum((v - mean) ** 2 for v in losses) / n
    if var <= 0.0:
        return []
    std = math.sqrt(var)
    return [i for i in range(n) if (losses[i] - mean) / std > z_threshold]`,
    testCases: [
      { input: [[1.0, 1.1, 0.9, 1.0, 5.0], 1.5], expected: [4] },
      { input: [[1.0, 1.0, 1.0], 2.0], expected: [] },
      { input: [[10.0, 1.0, 1.0, 1.0], 1.0], expected: [0] },
      { input: [[0.5, 0.6, 0.55, 2.0], 1.0], expected: [3] },
    ],
    hint: "A spike is an outlier relative to the training run's own loss distribution.",
  },
  {
    id: "dl-129",
    title: "Constrained Decoding Mask",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a hard constraint to decoding: keep logits for allowed token ids and set every other logit to -1e9 so it can never be sampled.\n\nThe signature is constrained_mask(logits, allowed_ids). Return a copy of the logits.",
    starterCode: `def constrained_mask(logits, allowed_ids):
    # Your code here
    pass`,
    solution: `def constrained_mask(logits, allowed_ids):
    allowed = set(allowed_ids)
    return [logits[i] if i in allowed else -1e9 for i in range(len(logits))]`,
    testCases: [
      { input: [[0.0, 0.0, 0.0, 0.0], [1, 3]], expected: [-1e9, 0.0, -1e9, 0.0] },
      { input: [[1.0, 2.0], [0, 1]], expected: [1.0, 2.0] },
      { input: [[5.0, 5.0], []], expected: [-1e9, -1e9] },
      { input: [[0.5, 0.5, 0.5], [2]], expected: [-1e9, -1e9, 0.5] },
    ],
    hint: "This is how grammars, JSON schemas and forced formats are enforced during generation.",
  },
  {
    id: "dl-130",
    title: "InfoNCE Loss",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the InfoNCE contrastive loss for one anchor. Similarity is the dot product; logits are sim(anchor, positive) / temperature followed by each negative's similarity / temperature. The loss is the negative log softmax probability of the positive entry.\n\nThe signature is infonce_loss(anchor, positive, negatives, temperature). Return a scalar.",
    starterCode: `import math
def infonce_loss(anchor, positive, negatives, temperature):
    # Your code here
    pass`,
    solution: `import math
def infonce_loss(anchor, positive, negatives, temperature):
    def sim(a, b):
        return sum(a[j] * b[j] for j in range(len(a)))

    logits = [sim(anchor, positive) / temperature]
    for neg in negatives:
        logits.append(sim(anchor, neg) / temperature)
    m = max(logits)
    lse = m + math.log(sum(math.exp(v - m) for v in logits))
    return lse - logits[0]`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0], [[0.0, 1.0], [-1.0, 0.0]], 1.0], expected: 0.4076059644 },
      { input: [[1.0, 0.0], [1.0, 0.0], [[1.0, 0.0]], 2.0], expected: 0.6931471806 },
      { input: [[0.0, 1.0], [0.0, 1.0], [[1.0, 0.0], [0.0, -1.0]], 0.5], expected: 0.1429316285 },
      { input: [[2.0, 0.0], [1.0, 1.0], [[0.0, 0.0]], 1.0], expected: 0.126928011 },
    ],
    hint: "Lower temperature sharpens the distribution and increases the penalty from hard negatives.",
  },
  {
    id: "dl-131",
    title: "ViT Patch Embedding",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Turn a square image into a sequence of flattened non-overlapping patches in row-major order, scanning patch rows top to bottom and patches left to right.\n\nThe signature is patch_embedding(image, patch_size). Each patch is flattened row-major into a vector of length patch_size^2.",
    starterCode: `def patch_embedding(image, patch_size):
    # Your code here
    pass`,
    solution: `def patch_embedding(image, patch_size):
    n = len(image)
    num = n // patch_size
    patches = []
    for pi in range(num):
        for pj in range(num):
            patch = []
            for i in range(patch_size):
                for j in range(patch_size):
                    patch.append(image[pi * patch_size + i][pj * patch_size + j])
            patches.append(patch)
    return patches`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0], [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]], 2], expected: [[1.0, 2.0, 5.0, 6.0], [3.0, 4.0, 7.0, 8.0], [9.0, 10.0, 13.0, 14.0], [11.0, 12.0, 15.0, 16.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1], expected: [[1.0], [2.0], [3.0], [4.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], 3], expected: [[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]] },
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0], [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]], 4], expected: [[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0]] },
    ],
    hint: "Patch embedding is just a reshape plus flatten before the linear projection in ViT.",
  },
  {
    id: "dl-132",
    title: "RNN BPTT One Step",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One backward step through a vanilla RNN cell. Given the upstream gradient dh for the hidden state h = tanh(Wx x + Wh h_prev + b), first compute dpre = dh * (1 - h^2), then dWx = outer(dpre, x), dWh = outer(dpre, h_prev), db = dpre and dh_prev = Wh^T dpre.\n\nThe signature is rnn_bptt_step(dh, x, h_prev, h, Wx, Wh). Return [dWx, dWh, db, dh_prev].",
    starterCode: `def rnn_bptt_step(dh, x, h_prev, h, Wx, Wh):
    # Returns [dWx, dWh, db, dh_prev]
    # Your code here
    pass`,
    solution: `def rnn_bptt_step(dh, x, h_prev, h, Wx, Wh):
    units = len(h)
    dh_raw = [dh[i] * (1.0 - h[i] * h[i]) for i in range(units)]
    dWx = [[dh_raw[i] * x[j] for j in range(len(x))] for i in range(units)]
    dWh = [[dh_raw[i] * h_prev[j] for j in range(len(h_prev))] for i in range(units)]
    db = list(dh_raw)
    dh_prev = [sum(Wh[i][j] * dh_raw[i] for i in range(units)) for j in range(len(h_prev))]
    return [dWx, dWh, db, dh_prev]`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0], [0.0, 0.0], [0.5, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[[0.75, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [0.75, 0.0], [0.75, 0.0]] },
      { input: [[1.0, 1.0], [1.0, 2.0], [0.5, 0.5], [0.5, 0.5], [[1.0, 1.0], [0.0, 1.0]], [[0.5, 0.0], [0.0, 0.5]]], expected: [[[0.75, 1.5], [0.75, 1.5]], [[0.375, 0.375], [0.375, 0.375]], [0.75, 0.75], [0.375, 0.375]] },
      { input: [[2.0], [1.0], [0.5], [0.25], [[1.0]], [[1.0]]], expected: [[[1.875]], [[0.9375]], [1.875], [1.875]] },
      { input: [[-1.0, 0.5], [0.0, -1.0], [1.0, 0.0], [-0.5, 0.0], [[0.5, 0.0], [0.0, 2.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[[0.0, 0.75], [0.0, -0.5]], [[-0.75, 0.0], [0.5, 0.0]], [-0.75, 0.5], [-0.75, 0.5]] },
    ],
    hint: "The tanh derivative is 1 - h^2; propagate through Wh to reach the previous hidden state.",
  },
  {
    id: "dl-133",
    title: "LSTM Backward Gate Gradient",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Backward pass through one LSTM unit given the upstream gradients dh and dc_next, the gate activations f, i, g, o and the cell states c_prev and c. Compute dc = dh * o * (1 - tanh(c)^2) + dc_next, then df = dc * c_prev * f * (1 - f), di = dc * g * i * (1 - i), dg = dc * i * (1 - g^2), do = dh * tanh(c) * o * (1 - o).\n\nThe signature is lstm_gate_gradients(dh, dc_next, f, i, g, o, c_prev, c). All values are scalars. Return [df, di, dg, do, dc].",
    starterCode: `import math
def lstm_gate_gradients(dh, dc_next, f, i, g, o, c_prev, c):
    # Your code here
    pass`,
    solution: `import math
def lstm_gate_gradients(dh, dc_next, f, i, g, o, c_prev, c):
    t = math.tanh(c)
    dc = dh * o * (1.0 - t * t) + dc_next
    df = dc * c_prev * f * (1.0 - f)
    di = dc * g * i * (1.0 - i)
    dg = dc * i * (1.0 - g * g)
    do = dh * t * o * (1.0 - o)
    return [df, di, dg, do, dc]`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, 0.25], expected: [0.0, 0.0587509281, 0.1762527842, 0.0612296656, 0.4700074244] },
      { input: [2.0, 0.5, 0.8, 0.4, 0.6, 0.7, 1.0, 1.2], expected: [0.1483244792, 0.1334920312, 0.2373191666, 0.3501349349, 0.9270279947] },
      { input: [-1.0, 0.0, 0.2, 0.9, 0.3, 0.5, 0.5, 0.4], expected: [-0.0342255514, -0.0115511236, -0.3503840829, -0.0949872406, -0.427819393] },
      { input: [1.0, 1.0, 0.6, 0.6, 0.6, 0.6, 0.0, 0.0], expected: [0.0, 0.2304, 0.6144, 0.0, 1.6] },
    ],
    hint: "The output gate gradient uses the old cell state's tanh, while the other gates use dc.",
  },
  {
    id: "dl-134",
    title: "GRU Update Gate Gradient",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Backward pass for the update-gate path of one scalar GRU unit. With h = (1 - z) * h_prev + z * n and candidate pre-activation gradient dpre_n, let dsh = dpre_n * uh be the gradient through (r * h_prev) where uh is the candidate recurrent weight. Then dz = dh * (n - h_prev), dr = dsh * h_prev and dh_prev = dh * (1 - z) + dsh * r.\n\nThe signature is gru_update_gate_gradient(dh, h_prev, z, n, r, dpre_n, uh). All values are scalars. Return [dz, dr, dh_prev].",
    starterCode: `def gru_update_gate_gradient(dh, h_prev, z, n, r, dpre_n, uh):
    # Your code here
    pass`,
    solution: `def gru_update_gate_gradient(dh, h_prev, z, n, r, dpre_n, uh):
    dsh = dpre_n * uh
    dr = dsh * h_prev
    dh_prev = dh * (1.0 - z) + dsh * r
    dz = dh * (n - h_prev)
    return [dz, dr, dh_prev]`,
    testCases: [
      { input: [1.0, 0.5, 0.3, 0.8, 0.6, 0.5, 2.0], expected: [0.3, 0.5, 1.3] },
      { input: [2.0, -1.0, 0.5, 0.0, 0.2, 1.0, 0.5], expected: [2.0, -0.5, 1.1] },
      { input: [-1.0, 0.0, 0.9, 0.5, 0.5, 0.5, 1.0], expected: [-0.5, 0.0, 0.15] },
      { input: [0.5, 2.0, 0.1, 0.9, 0.9, 2.0, 0.0], expected: [-0.55, 0.0, 0.45] },
    ],
    hint: "The update gate trades off the old hidden state and the candidate; the reset gate scales the recurrent term.",
  },
  {
    id: "dl-135",
    title: "Positional Embedding Interpolation",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Linearly interpolate a positional embedding table from old_len rows to new_len rows. For output position i, the source position is i * (old_len - 1) / (new_len - 1); blend the two neighboring rows with the fractional part. If old_len is 1 the table repeats; if new_len is 1 the first row is returned.\n\nThe signature is interpolate_positional_embedding(pe, new_len).",
    starterCode: `import math
def interpolate_positional_embedding(pe, new_len):
    # Your code here
    pass`,
    solution: `import math
def interpolate_positional_embedding(pe, new_len):
    old_len = len(pe)
    d = len(pe[0])
    if new_len == 1:
        return [list(pe[0])]
    if old_len == 1:
        return [list(pe[0]) for _ in range(new_len)]
    out = []
    for i in range(new_len):
        src = i * (old_len - 1) / (new_len - 1)
        lo = int(math.floor(src))
        hi = min(lo + 1, old_len - 1)
        frac = src - lo
        out.append([pe[lo][j] * (1.0 - frac) + pe[hi][j] * frac for j in range(d)])
    return out`,
    testCases: [
      { input: [[[0.0, 0.0], [1.0, 1.0], [2.0, 2.0]], 5], expected: [[0.0, 0.0], [0.5, 0.5], [1.0, 1.0], [1.5, 1.5], [2.0, 2.0]] },
      { input: [[[0.0], [10.0]], 3], expected: [[0.0], [5.0], [10.0]] },
      { input: [[[0.0, 0.0], [1.0, 2.0], [2.0, 4.0], [3.0, 6.0]], 2], expected: [[0.0, 0.0], [3.0, 6.0]] },
      { input: [[[5.0, 7.0]], 3], expected: [[5.0, 7.0], [5.0, 7.0], [5.0, 7.0]] },
    ],
    hint: "Interpolation lets a model trained at one sequence length run at another.",
  },
  {
    id: "dl-136",
    title: "DETR Set Loss",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "DETR-style set loss. Find the assignment between queries and targets that minimizes the total matching cost, then average cost_bbox * l1 + cost_class * ce over the matched pairs. Assume num_queries >= num_targets and search over all row/column permutations with itertools.permutations.\n\nThe signature is detr_set_loss(cost_matrix, l1_matrix, ce_matrix, cost_bbox, cost_class). Return [assignment, loss], where assignment is a list of [row, col] pairs.",
    starterCode: `import itertools
def detr_set_loss(cost_matrix, l1_matrix, ce_matrix, cost_bbox, cost_class):
    # Your code here
    pass`,
    solution: `import itertools
def detr_set_loss(cost_matrix, l1_matrix, ce_matrix, cost_bbox, cost_class):
    q = len(cost_matrix)
    t = len(cost_matrix[0])
    n = min(q, t)
    best = None
    best_perm = None
    for rows in itertools.permutations(range(q), n):
        for cols in itertools.permutations(range(t), n):
            total = sum(cost_matrix[rows[k]][cols[k]] for k in range(n))
            if best is None or total < best:
                best = total
                best_perm = [[rows[k], cols[k]] for k in range(n)]
    loss = 0.0
    for r, c in best_perm:
        loss += cost_bbox * l1_matrix[r][c] + cost_class * ce_matrix[r][c]
    return [best_perm, loss / n]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 0.5]], [[0.5, 1.0], [2.0, 0.1]], [[0.2, 0.8], [0.9, 0.1]], 5.0, 1.0], expected: [[[0, 0], [1, 1]], 1.65] },
      { input: [[[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]], [[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]], [[0.1, 0.2, 0.3], [0.3, 0.2, 0.1]], 2.0, 1.0], expected: [[[0, 0], [1, 1]], 3.15] },
      { input: [[[1.0, 4.0], [2.0, 1.0], [3.0, 2.0]], [[0.5, 0.2], [0.1, 0.7], [0.3, 0.4]], [[0.1, 0.9], [0.8, 0.2], [0.5, 0.5]], 1.0, 2.0], expected: [[[0, 0], [1, 1]], 0.9] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [[2.0, 2.0], [2.0, 2.0]], [[0.0, 0.0], [0.0, 0.0]], 1.0, 1.0], expected: [[[0, 0], [1, 1]], 2.0] },
    ],
    hint: "DETR matches predictions to targets with a Hungarian-style assignment before computing the loss.",
  },
  {
    id: "dl-137",
    title: "Matching Cost Matrix",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Build the DETR matching cost matrix: cost[i][j] = cost_bbox * L1(pred_box_i, target_box_j) + cost_class * (1 - pred_probs[i][target_label_j]).\n\nThe signature is matching_cost_matrix(pred_boxes, target_boxes, pred_probs, target_labels, cost_bbox=5.0, cost_class=1.0). Boxes are [x1, y1, x2, y2] vectors.",
    starterCode: `def matching_cost_matrix(pred_boxes, target_boxes, pred_probs, target_labels, cost_bbox=5.0, cost_class=1.0):
    # Your code here
    pass`,
    solution: `def matching_cost_matrix(pred_boxes, target_boxes, pred_probs, target_labels, cost_bbox=5.0, cost_class=1.0):
    q = len(pred_boxes)
    t = len(target_boxes)
    out = []
    for i in range(q):
        row = []
        for j in range(t):
            l1 = sum(abs(pred_boxes[i][k] - target_boxes[j][k]) for k in range(len(pred_boxes[i])))
            cls = 1.0 - pred_probs[i][target_labels[j]]
            row.append(cost_bbox * l1 + cost_class * cls)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[0.0, 0.0, 1.0, 1.0], [1.0, 1.0, 2.0, 2.0]], [[0.0, 0.0, 1.0, 1.0]], [[0.9, 0.1], [0.2, 0.8]], [0], 5.0, 1.0], expected: [[0.1], [20.8]] },
      { input: [[[0.0, 0.0, 1.0, 1.0], [2.0, 2.0, 3.0, 3.0]], [[0.0, 0.0, 1.0, 1.0], [1.0, 1.0, 2.0, 2.0]], [[0.7, 0.3], [0.4, 0.6]], [0, 1], 5.0, 1.0], expected: [[0.3, 20.7], [40.6, 20.4]] },
      { input: [[[0.0, 0.0, 1.0, 1.0], [1.0, 1.0, 2.0, 2.0], [2.0, 2.0, 3.0, 3.0]], [[0.0, 0.0, 1.0, 1.0]], [[0.5, 0.5], [0.9, 0.1], [0.1, 0.9]], [1], 1.0, 1.0], expected: [[0.5], [4.9], [8.1]] },
      { input: [[[0.0, 1.0]], [[0.0, 2.0]], [[0.5, 0.5]], [0], 2.0, 3.0], expected: [[3.5]] },
    ],
    hint: "The class cost uses the probability the prediction assigns to the target's label.",
  },
  {
    id: "dl-138",
    title: "ConvNeXt Block (1D)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Forward pass of a simplified 1D ConvNeXt block. For each channel: apply a depthwise convolution with the shared kernel and same padding, normalize the result over the length dimension (LayerNorm), scale by the per-channel gamma, and add the residual: out = x + gamma * LN(DW(x)).\n\nThe signature is convnext_block_1d(x, dw_kernel, gamma, eps=1e-5). x has shape (channels, length).",
    starterCode: `import math
def convnext_block_1d(x, dw_kernel, gamma, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def convnext_block_1d(x, dw_kernel, gamma, eps=1e-5):
    channels = len(x)
    length = len(x[0])
    k = len(dw_kernel)
    pad = k // 2
    out = []
    for c in range(channels):
        padded = [0.0] * pad + list(x[c]) + [0.0] * pad
        dw = []
        for t in range(length):
            s = 0.0
            for j in range(k):
                s += padded[t + j] * dw_kernel[j]
            dw.append(s)
        mean = sum(dw) / length
        var = sum((v - mean) ** 2 for v in dw) / length
        inv = 1.0 / math.sqrt(var + eps)
        out.append([x[c][t] + gamma[c] * (dw[t] - mean) * inv for t in range(length)])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0]], [1.0, 1.0, 1.0], [1.0]], expected: [[-0.3363019143, 3.0690415315, 3.2672603829]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]], [1.0, 1.0, 1.0], [1.0, 1.0]], expected: [[-0.3363019143, 3.0690415315, 3.2672603829], [2.9309558914, 6.3363051357, 5.7327389729]] },
      { input: [[[1.0, 2.0, 3.0]], [0.0, 1.0, 0.0], [0.5]], expected: [[0.387632157, 2.0, 3.612367843]] },
      { input: [[[1.0, 2.0, 3.0]], [1.0, 1.0, 1.0], [0.0]], expected: [[1.0, 2.0, 3.0]] },
    ],
    hint: "ConvNeXt mixes a depthwise spatial conv with an inverted-bottleneck channel MLP; this simplified block keeps the depthwise conv, LayerNorm and layer scale.",
  },
  {
    id: "dl-139",
    title: "Anchor-Free Center Heatmap",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Build a Gaussian center heatmap for anchor-free detection. The output grid has ceil(size / stride) cells per dimension; cell (i, j) has center (j * stride + stride / 2, i * stride + stride / 2). Its value is exp(-d^2 / (2 * sigma^2)) where d is the distance to the object center and sigma = radius / 3.\n\nThe signature is center_heatmap(width, height, stride, center_x, center_y, radius).",
    starterCode: `import math
def center_heatmap(width, height, stride, center_x, center_y, radius):
    # Your code here
    pass`,
    solution: `import math
def center_heatmap(width, height, stride, center_x, center_y, radius):
    out_w = (width + stride - 1) // stride
    out_h = (height + stride - 1) // stride
    sigma = radius / 3.0
    heat = []
    for i in range(out_h):
        cy = i * stride + stride / 2.0
        row = []
        for j in range(out_w):
            cx = j * stride + stride / 2.0
            d2 = (cx - center_x) ** 2 + (cy - center_y) ** 2
            row.append(math.exp(-d2 / (2.0 * sigma * sigma)))
        heat.append(row)
    return heat`,
    testCases: [
      { input: [4, 4, 1, 1.5, 1.5, 1.0], expected: [[0.0001234098, 0.0111089965, 0.0001234098, 2e-10], [0.0111089965, 1.0, 0.0111089965, 1.52e-08], [0.0001234098, 0.0111089965, 0.0001234098, 2e-10], [2e-10, 1.52e-08, 2e-10, 0.0]] },
      { input: [4, 4, 2, 1.0, 1.0, 1.5], expected: [[1.0, 0.0003354626], [0.0003354626, 1.125e-07]] },
      { input: [2, 2, 1, 0.0, 0.0, 3.0], expected: [[0.7788007831, 0.2865047969], [0.2865047969, 0.1053992246]] },
    ],
    hint: "The peak is 1.0 when the object center lands exactly on a cell center.",
  },
  {
    id: "dl-140",
    title: "ZeRO Stage Memory",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate per-GPU training memory for ZeRO stages. With P parameter bytes, G gradient bytes and O optimizer bytes (num_params * optimizer_states * bytes): stage 0 holds P + G + O; stage 1 shards the optimizer state; stage 2 also shards gradients; stage 3 also shards parameters. Sharded quantities use ceiling division by num_gpus.\n\nThe signature is zero_stage_memory(num_params, bytes_per_param, num_gpus, stage, optimizer_states=2). Return an integer number of bytes.",
    starterCode: `def zero_stage_memory(num_params, bytes_per_param, num_gpus, stage, optimizer_states=2):
    # Your code here
    pass`,
    solution: `def zero_stage_memory(num_params, bytes_per_param, num_gpus, stage, optimizer_states=2):
    def cdiv(a, b):
        return (a + b - 1) // b

    p = num_params * bytes_per_param
    g = num_params * bytes_per_param
    o = num_params * optimizer_states * bytes_per_param
    if stage == 0:
        return p + g + o
    if stage == 1:
        return p + g + cdiv(o, num_gpus)
    if stage == 2:
        return p + cdiv(g, num_gpus) + cdiv(o, num_gpus)
    return cdiv(p, num_gpus) + cdiv(g, num_gpus) + cdiv(o, num_gpus)`,
    testCases: [
      { input: [1000000, 4, 8, 0], expected: 16000000 },
      { input: [1000000, 4, 8, 1], expected: 9000000 },
      { input: [1000000, 4, 8, 2], expected: 5500000 },
      { input: [1000000, 4, 8, 3], expected: 2000000 },
      { input: [1000000, 4, 1, 3], expected: 16000000 },
    ],
    hint: "Each increase in ZeRO stage shards one more training-state component across the data-parallel group.",
  },
];
