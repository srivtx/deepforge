import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-361",
    title: "Dot Product Attention Scores",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Unscaled attention scores are the dot products of a query with each key.\n\nGiven the query vector and the list of key vectors, return the score list.",
    starterCode: `def dot_product_attention_scores(query, keys):
    # Your code here
    pass`,
    solution: `def dot_product_attention_scores(query, keys):
    return [sum(q * k for q, k in zip(query, key)) for key in keys]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1]]], expected: [1, 0] },
      { input: [[1, 1], [[1, 1]]], expected: [2] },
      { input: [[0, 1], [[1, 0], [0, 2], [1, 1]]], expected: [0, 2, 1] },
    ],
    hint: "One dot product per key.",
  },
  {
    id: "nlp-362",
    title: "Scaled Dot Product Attention Weights",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Scaled dot-product attention computes softmax(query dot key / sqrt(d_k)) over the keys.\n\nGiven the query and the list of keys, return the attention weights.",
    starterCode: `def scaled_dot_product_attention_weights(query, keys):
    # Your code here
    pass`,
    solution: `def scaled_dot_product_attention_weights(query, keys):
    import math
    d = len(query)
    scores = [sum(q * k for q, k in zip(query, key)) / math.sqrt(d) for key in keys]
    m = max(scores)
    e = [math.exp(s - m) for s in scores]
    total = sum(e)
    return [v / total for v in e]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1]]], expected: [0.6697615493266569, 0.3302384506733431] },
      { input: [[1, 1], [[1, 0], [0, 1]]], expected: [0.5, 0.5] },
      { input: [[1, 0], [[2, 0]]], expected: [1.0] },
    ],
    hint: "Scale by the square root of the key dimension before softmax.",
  },
  {
    id: "nlp-363",
    title: "Attention Output Weighted Sum",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The attention output is the weighted sum of the value vectors: sum_i weight_i * value_i.\n\nGiven the attention weights and the value vectors, return the output vector.",
    starterCode: `def attention_output_weighted_sum(weights, values):
    # Your code here
    pass`,
    solution: `def attention_output_weighted_sum(weights, values):
    d = len(values[0])
    return [sum(w * v[j] for w, v in zip(weights, values)) for j in range(d)]`,
    testCases: [
      { input: [[0.5, 0.5], [[1, 0], [0, 1]]], expected: [0.5, 0.5] },
      { input: [[1.0], [[2, 4]]], expected: [2.0, 4.0] },
      { input: [[0.25, 0.75], [[1, 1], [0, 2]]], expected: [0.25, 1.75] },
    ],
    hint: "Mix the value vectors coordinate by coordinate.",
  },
  {
    id: "nlp-364",
    title: "Causal Masked Attention Row",
    category: "NLP",
    difficulty: "Hard",
    description:
      "In causal attention, position i may attend only to positions j <= i. Mask later positions with -1e9, then softmax.\n\nGiven the raw scores and the current row index, return the masked attention weights.",
    starterCode: `def causal_masked_attention_row(scores, row_index):
    # Your code here
    pass`,
    solution: `def causal_masked_attention_row(scores, row_index):
    import math
    masked = [s if j <= row_index else -1e9 for j, s in enumerate(scores)]
    m = max(masked)
    e = [math.exp(s - m) for s in masked]
    total = sum(e)
    return [v / total for v in e]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0], expected: [1.0, 0.0, 0.0] },
      { input: [[1.0, 2.0, 3.0], 2], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[0.0, 0.0], 1], expected: [0.5, 0.5] },
    ],
    hint: "The masked logits shrink to zero weight after softmax.",
  },
  {
    id: "nlp-365",
    title: "Attention Padding Mask Scores",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Padding positions receive a large negative score so their softmax weight vanishes. Use -1e9 for masked entries.\n\nGiven the scores and a 1/0 keep mask, return the masked scores.",
    starterCode: `def attention_padding_mask_scores(scores, mask):
    # Your code here
    pass`,
    solution: `def attention_padding_mask_scores(scores, mask):
    return [s if m else -1e9 for s, m in zip(scores, mask)]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1, 0, 1]], expected: [1.0, -1000000000.0, 3.0] },
      { input: [[0.5, 0.5], [0, 0]], expected: [-1000000000.0, -1000000000.0] },
      { input: [[1.0], [1]], expected: [1.0] },
    ],
    hint: "Keep scores where the mask is one.",
  },
  {
    id: "nlp-366",
    title: "Multi Head Output Concatenation",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Multi-head attention concatenates the per-head outputs along the feature dimension.\n\nGiven a list of head output vectors, return the concatenated vector.",
    starterCode: `def multi_head_output_concatenation(heads):
    # Your code here
    pass`,
    solution: `def multi_head_output_concatenation(heads):
    out = []
    for head in heads:
        out.extend(head)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[], [1]]], expected: [1] },
    ],
    hint: "Flatten the heads in order.",
  },
  {
    id: "nlp-367",
    title: "Sinusoidal Positional Encoding Vector",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The sinusoidal positional encoding for position pos and even dimension d uses PE[2i] = sin(pos / 10000^(2i/d)) and PE[2i+1] = cos(pos / 10000^(2i/d)).\n\nGiven pos and an even dim d, return the encoding vector of length d.",
    starterCode: `def sinusoidal_positional_encoding_vector(pos, dim):
    # Your code here
    pass`,
    solution: `def sinusoidal_positional_encoding_vector(pos, dim):
    import math
    out = []
    for i in range(dim // 2):
        angle = pos / (10000.0 ** (2.0 * i / dim))
        out.append(math.sin(angle))
        out.append(math.cos(angle))
    return out`,
    testCases: [
      { input: [0, 4], expected: [0.0, 1.0, 0.0, 1.0] },
      { input: [1, 2], expected: [0.8414709848078965, 0.5403023058681398] },
      { input: [2, 6], expected: [0.9092974268256817, -0.4161468365471424, 0.09269850077872725, 0.9956942241237399, 0.0043088560467428125, 0.9999907168366957] },
    ],
    hint: "Each frequency contributes a sine and a cosine pair.",
  },
  {
    id: "nlp-368",
    title: "Learned Positional Embedding Lookup",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Learned positional embeddings are just an embedding table indexed by position.\n\nGiven the table as nested rows and a position, return the row.",
    starterCode: `def learned_positional_embedding_lookup(table, position):
    # Your code here
    pass`,
    solution: `def learned_positional_embedding_lookup(table, position):
    return list(table[position])`,
    testCases: [
      { input: [[[0.1, 0.2], [0.3, 0.4]], 0], expected: [0.1, 0.2] },
      { input: [[[1, 2, 3]], 0], expected: [1, 2, 3] },
      { input: [[[5.0], [6.0], [7.0]], 2], expected: [7.0] },
    ],
    hint: "Index the table directly, being careful to return a copy.",
  },
  {
    id: "nlp-369",
    title: "Average Word Embeddings",
    category: "NLP",
    difficulty: "Easy",
    description:
      "A simple sentence embedding is the coordinatewise mean of its word vectors.\n\nGiven the list of word vectors, return the mean vector.",
    starterCode: `def average_word_embeddings(vectors):
    # Your code here
    pass`,
    solution: `def average_word_embeddings(vectors):
    d = len(vectors[0])
    n = len(vectors)
    return [sum(v[j] for v in vectors) / n for j in range(d)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [0.5, 0.5] },
      { input: [[[1, 1]]], expected: [1.0, 1.0] },
      { input: [[[2, 4], [4, 8], [3, 6]]], expected: [3.0, 6.0] },
    ],
    hint: "Average each coordinate across the words.",
  },
  {
    id: "nlp-370",
    title: "Weighted Average Word Embeddings",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Weighted pooling computes sum_i w_i v_i / sum_i w_i.\n\nGiven the word vectors and their weights, return the weighted mean vector.",
    starterCode: `def weighted_average_word_embeddings(vectors, weights):
    # Your code here
    pass`,
    solution: `def weighted_average_word_embeddings(vectors, weights):
    d = len(vectors[0])
    total = sum(weights)
    return [sum(w * v[j] for w, v in zip(weights, vectors)) / total for j in range(d)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [3, 1]], expected: [0.75, 0.25] },
      { input: [[[2, 2]], [1.0]], expected: [2.0, 2.0] },
      { input: [[[1, 1], [3, 3]], [1, 3]], expected: [2.5, 2.5] },
    ],
    hint: "Weights need not sum to one; normalize explicitly.",
  },
  {
    id: "nlp-371",
    title: "Analogy Vector Arithmetic",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Word analogies use vector offsets: the analogy A is to B as C is to X is solved by X = A - B + C.\n\nGiven vectors a, b, and c, return the result vector.",
    starterCode: `def analogy_vector_arithmetic(a, b, c):
    # Your code here
    pass`,
    solution: `def analogy_vector_arithmetic(a, b, c):
    return [x - y + z for x, y, z in zip(a, b, c)]`,
    testCases: [
      { input: [[1, 2], [0, 1], [1, 0]], expected: [2, 1] },
      { input: [[1, 1, 1], [0, 0, 0], [2, 2, 2]], expected: [3, 3, 3] },
      { input: [[0, 0], [1, 1], [1, 1]], expected: [0, 0] },
    ],
    hint: "Add the offset from B to A onto C.",
  },
  {
    id: "nlp-372",
    title: "Layer Normalized Embedding Vector",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Layer normalization centers and scales a vector: (x - mean) / sqrt(variance + eps) using the population variance.\n\nGiven the vector and eps, return the normalized vector with gamma = 1 and beta = 0.",
    starterCode: `def layer_normalized_embedding_vector(x, eps):
    # Your code here
    pass`,
    solution: `def layer_normalized_embedding_vector(x, eps):
    n = len(x)
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    return [(v - mean) / (var + eps) ** 0.5 for v in x]`,
    testCases: [
      { input: [[1, 2, 3], 1e-06], expected: [-1.224743952833969, 0.0, 1.224743952833969] },
      { input: [[0, 0], 1e-06], expected: [0.0, 0.0] },
      { input: [[4, 4, 4, 4], 1e-06], expected: [0.0, 0.0, 0.0, 0.0] },
    ],
    hint: "Center first, then divide by the root variance.",
  },
  {
    id: "nlp-373",
    title: "L2 Normalize Embedding Vector",
    category: "NLP",
    difficulty: "Easy",
    description:
      "L2 normalization divides a vector by its Euclidean norm, leaving the zero vector unchanged.\n\nGiven the vector, return the normalized vector.",
    starterCode: `def l2_normalize_vector(vector):
    # Your code here
    pass`,
    solution: `def l2_normalize_vector(vector):
    import math
    norm = math.sqrt(sum(v * v for v in vector))
    if norm == 0.0:
        return list(vector)
    return [v / norm for v in vector]`,
    testCases: [
      { input: [[3, 4]], expected: [0.6, 0.8] },
      { input: [[1, 0]], expected: [1.0, 0.0] },
      { input: [[0, 0]], expected: [0, 0] },
    ],
    hint: "Guard the zero vector case.",
  },
  {
    id: "nlp-374",
    title: "Max Pooling over Token Embeddings",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Max pooling over a sequence of word vectors takes the coordinatewise maximum.\n\nGiven the list of vectors, return the pooled vector.",
    starterCode: `def max_pooling_over_token_embeddings(vectors):
    # Your code here
    pass`,
    solution: `def max_pooling_over_token_embeddings(vectors):
    d = len(vectors[0])
    return [max(v[j] for v in vectors) for j in range(d)]`,
    testCases: [
      { input: [[[1, 5], [3, 2]]], expected: [3, 5] },
      { input: [[[0, -1], [-2, 0]]], expected: [0, 0] },
      { input: [[[1, 1], [1, 1], [1, 1]]], expected: [1, 1] },
    ],
    hint: "Reduce each coordinate independently.",
  },
  {
    id: "nlp-375",
    title: "Attention Weights Entropy Nats",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The entropy of an attention row after softmax is -sum_i p_i ln p_i, measured in nats. Compute the softmax from the scores first.\n\nGiven the raw attention scores, return the entropy.",
    starterCode: `def attention_weights_entropy_nats(scores):
    # Your code here
    pass`,
    solution: `def attention_weights_entropy_nats(scores):
    import math
    m = max(scores)
    e = [math.exp(s - m) for s in scores]
    total = sum(e)
    p = [v / total for v in e]
    return -sum(pi * math.log(pi) for pi in p)`,
    testCases: [
      { input: [[0, 0]], expected: 0.6931471805599453 },
      { input: [[1, 2, 3]], expected: 0.8323955818399389 },
      { input: [[10, 0]], expected: 0.0004993775862411646 },
    ],
    hint: "Uniform attention maximizes the entropy at ln(number of keys).",
  },
  {
    id: "nlp-376",
    title: "Temperature Scaled Attention Weights",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Dividing attention logits by a temperature T before softmax sharpens the distribution as T shrinks: softmax(scores / T).\n\nGiven the scores and temperature, return the weights computed stably.",
    starterCode: `def temperature_scaled_attention_weights(scores, temperature):
    # Your code here
    pass`,
    solution: `def temperature_scaled_attention_weights(scores, temperature):
    import math
    scaled = [s / temperature for s in scores]
    m = max(scaled)
    e = [math.exp(s - m) for s in scaled]
    total = sum(e)
    return [v / total for v in e]`,
    testCases: [
      { input: [[1, 2], 1.0], expected: [0.2689414213699951, 0.7310585786300049] },
      { input: [[1, 2], 0.5], expected: [0.11920292202211755, 0.8807970779778823] },
      { input: [[0, 0, 0], 2.0], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "All three softmax stages use the scaled scores.",
  },
  {
    id: "nlp-377",
    title: "Zero Vector Detection",
    category: "NLP",
    difficulty: "Easy",
    description:
      "An embedding is the zero vector when its Euclidean norm is exactly zero.\n\nGiven the vector, return True when it is all zeros.",
    starterCode: `def zero_vector_detection(vector):
    # Your code here
    pass`,
    solution: `def zero_vector_detection(vector):
    return all(v == 0 for v in vector)`,
    testCases: [
      { input: [[0, 0]], expected: true },
      { input: [[0, 0.1]], expected: false },
      { input: [[]], expected: true },
    ],
    hint: "Check every coordinate.",
  },
  {
    id: "nlp-378",
    title: "Embedding Dot Product Matrix",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Projecting a vector onto a matrix computes one dot product per row.\n\nGiven the matrix as nested rows and the vector, return the list of dot products.",
    starterCode: `def embedding_dot_product_matrix(matrix, vector):
    # Your code here
    pass`,
    solution: `def embedding_dot_product_matrix(matrix, vector):
    return [sum(a * b for a, b in zip(row, vector)) for row in matrix]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 2]], expected: [1, 2] },
      { input: [[[1, 1, 1]], [1, 0, 1]], expected: [2] },
      { input: [[[2, 1]], [1, -1]], expected: [1] },
    ],
    hint: "One dot product per row.",
  },
  {
    id: "nlp-379",
    title: "Pairwise Cosine Similarity Matrix",
    category: "NLP",
    difficulty: "Hard",
    description:
      "For a list of vectors, build the matrix of pairwise cosine similarities using 0.0 whenever either vector has zero norm.\n\nGiven the vectors, return the n x n matrix.",
    starterCode: `def cosine_similarity_matrix(vectors):
    # Your code here
    pass`,
    solution: `def cosine_similarity_matrix(vectors):
    import math
    n = len(vectors)
    norms = [math.sqrt(sum(v * v for v in vec)) for vec in vectors]
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if norms[i] == 0.0 or norms[j] == 0.0:
                matrix[i][j] = 0.0
            else:
                matrix[i][j] = sum(a * b for a, b in zip(vectors[i], vectors[j])) / (norms[i] * norms[j])
    return matrix`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 1]]], expected: [[0.9999999999999998]] },
      { input: [[[0, 0], [1, 0]]], expected: [[0.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "The diagonal is one for nonzero vectors.",
  },
  {
    id: "nlp-380",
    title: "Residual Connection Addition",
    category: "NLP",
    difficulty: "Easy",
    description:
      "A residual connection adds the sublayer output back to its input elementwise.\n\nGiven the input vector and the sublayer output, return their sum.",
    starterCode: `def residual_connection_addition(x, sublayer):
    # Your code here
    pass`,
    solution: `def residual_connection_addition(x, sublayer):
    return [a + b for a, b in zip(x, sublayer)]`,
    testCases: [
      { input: [[1, 2], [0.5, -0.5]], expected: [1.5, 1.5] },
      { input: [[0, 0], [1, 1]], expected: [1, 1] },
      { input: [[1], [1]], expected: [2] },
    ],
    hint: "Coordinatewise addition.",
  },
];
