import type { Problem } from "@/types/problem";

export type ProjectStepProblem = Problem;

export interface Project {
  id: string;
  title: string;
  blurb: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  steps: Problem[];
}

const gptSteps: Problem[] = [
  {
    id: "proj-001",
    title: "Character Vocabulary",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build a character-level vocabulary from a text string.\n\nReturn a dict mapping each unique character to its rank in sorted order, so the alphabetically first character gets index 0. An empty string yields an empty dict.",
    starterCode: `def char_vocab(text):
    # Your code here
    pass`,
    solution: `def char_vocab(text):
    chars = sorted(set(text))
    return {c: i for i, c in enumerate(chars)}`,
    testCases: [
      { input: ["cab"], expected: { a: 0, b: 1, c: 2 } },
      { input: ["hello"], expected: { e: 0, h: 1, l: 2, o: 3 } },
      { input: [""], expected: {} },
      { input: ["a"], expected: { a: 0 } },
    ],
    hint: "Sorting the unique characters makes the vocabulary deterministic.",
  },
  {
    id: "proj-002",
    title: "Token Embedding Lookup",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Look up token embeddings from an embedding table.\n\ntoken_ids is a list of row indices and embedding is a list of vectors. Return the list of embedding vectors selected by the ids, preserving the order of token_ids.",
    starterCode: `def embed_tokens(token_ids, embedding):
    # Your code here
    pass`,
    solution: `def embed_tokens(token_ids, embedding):
    return [list(embedding[i]) for i in token_ids]`,
    testCases: [
      {
        input: [[0, 2], [[1, 2], [3, 4], [5, 6]]],
        expected: [[1, 2], [5, 6]],
      },
      { input: [[0], [[7, 8]]], expected: [[7, 8]] },
      { input: [[0, 0, 1], [[1], [2]]], expected: [[1], [1], [2]] },
      { input: [[], [[1, 2]]], expected: [] },
    ],
    hint: "An embedding table is just a list indexed by token id.",
  },
  {
    id: "proj-003",
    title: "Sinusoidal Positional Encoding",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute sinusoidal positional encodings for a sequence.\n\nFor position pos and pair index i, PE[pos][2i] = sin(pos / 10000^(2i/d_model)) and PE[pos][2i+1] = cos(pos / 10000^(2i/d_model)). Return a seq_len x d_model matrix and assume d_model is even.",
    starterCode: `import math
def positional_encoding(seq_len, d_model):
    # Your code here
    pass`,
    solution: `import math
def positional_encoding(seq_len, d_model):
    pe = []
    for pos in range(seq_len):
        row = []
        for i in range(d_model // 2):
            angle = pos / (10000 ** (2.0 * i / d_model))
            row.append(math.sin(angle))
            row.append(math.cos(angle))
        pe.append(row)
    return pe`,
    testCases: [
      { input: [1, 4], expected: [[0.0, 1.0, 0.0, 1.0]] },
      {
        input: [2, 4],
        expected: [
          [0.0, 1.0, 0.0, 1.0],
          [
            0.8414709848078965, 0.5403023058681398, 0.009999833334166664,
            0.9999500004166653,
          ],
        ],
      },
      { input: [0, 4], expected: [] },
      {
        input: [3, 2],
        expected: [
          [0.0, 1.0],
          [0.8414709848078965, 0.5403023058681398],
          [0.9092974268256817, -0.4161468365471424],
        ],
      },
    ],
    hint: "Even indices use sin, odd indices use cos, and the wavelength grows with i.",
  },
  {
    id: "proj-004",
    title: "Add Positional Encoding",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Add positional encodings to a sequence of token embeddings.\n\nThe two matrices have the same shape. Return the element-wise sum as nested lists.",
    starterCode: `def add_positional(token_embeddings, pe):
    # Your code here
    pass`,
    solution: `def add_positional(token_embeddings, pe):
    return [
        [token_embeddings[i][j] + pe[i][j] for j in range(len(pe[i]))]
        for i in range(len(token_embeddings))
    ]`,
    testCases: [
      {
        input: [
          [[1, 2], [3, 4]],
          [[0.5, 0.5], [1, 1]],
        ],
        expected: [[1.5, 2.5], [4, 5]],
      },
      { input: [[[1, 2, 3]], [[-1, -2, -3]]], expected: [[0, 0, 0]] },
      { input: [[], []], expected: [] },
    ],
    hint: "Position information is injected by simple addition before attention.",
  },
  {
    id: "proj-005",
    title: "Causal Attention Scores",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute scaled dot-product attention scores with a causal mask.\n\nFor query row i and key row j, score = dot(q_i, k_j) / sqrt(d_k) where d_k is the key dimension. Set every entry with j > i to -1000000000.0 so future tokens are masked out while every value stays finite. Return a len(q) x len(k) matrix.",
    starterCode: `import math
def causal_attention_scores(q, k):
    # Your code here
    pass`,
    solution: `import math
def causal_attention_scores(q, k):
    d = len(k[0])
    scale = math.sqrt(d)
    out = []
    for i in range(len(q)):
        row = []
        for j in range(len(k)):
            if j > i:
                row.append(-1000000000.0)
            else:
                dot = sum(q[i][x] * k[j][x] for x in range(d))
                row.append(dot / scale)
        out.append(row)
    return out`,
    testCases: [
      {
        input: [
          [[1, 0], [0, 1]],
          [[1, 0], [0, 1]],
        ],
        expected: [
          [0.7071067811865475, -1000000000.0],
          [0.0, 0.7071067811865475],
        ],
      },
      {
        input: [
          [
            [1, 1, 1],
            [0, 1, 0],
          ],
          [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
        ],
        expected: [
          [0.5773502691896258, -1000000000.0, -1000000000.0],
          [0.0, 0.5773502691896258, -1000000000.0],
        ],
      },
      { input: [[[0, 0]], [[1, 1]]], expected: [[0.0]] },
    ],
    hint: "Divide by sqrt(d_k), then block every key position past the current query position.",
  },
  {
    id: "proj-006",
    title: "Row-Wise Softmax",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply softmax to every row of a matrix independently.\n\nFor each row, subtract the row maximum before exponentiating for numerical stability, then divide by the sum of exponentials. Empty rows stay empty and a masked entry of -1000000000.0 becomes probability 0.0.",
    starterCode: `import math
def row_softmax(scores):
    # Your code here
    pass`,
    solution: `import math
def row_softmax(scores):
    out = []
    for row in scores:
        if not row:
            out.append([])
            continue
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        total = sum(exps)
        out.append([e / total for e in exps])
    return out`,
    testCases: [
      { input: [[[0, 0], [0, 0]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      {
        input: [[[1, 2, 3]]],
        expected: [
          [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
        ],
      },
      {
        input: [[[0.7071067811865475, -1000000000.0]]],
        expected: [[1.0, 0.0]],
      },
      { input: [[[0]]], expected: [[1.0]] },
    ],
    hint: "Converting scores to probabilities row by row is what makes attention a weighted average.",
  },
  {
    id: "proj-007",
    title: "Layer Normalization",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply layer normalization to a single feature vector.\n\nCompute the mean and population variance of x, then return (x_i - mean) / sqrt(var + eps) for each element. Use eps=1e-5 by default; a single element normalizes to 0.0 and an empty vector returns [].",
    starterCode: `import math
def layer_norm(x, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def layer_norm(x, eps=1e-5):
    n = len(x)
    if n == 0:
        return []
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    denom = math.sqrt(var + eps)
    return [(v - mean) / denom for v in x]`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [-1.2247356859083902, 0.0, 1.2247356859083902],
      },
      { input: [[0, 0, 0]], expected: [0.0, 0.0, 0.0] },
      { input: [[2, 4]], expected: [-0.9999950000374997, 0.9999950000374997] },
      { input: [[5]], expected: [0.0] },
    ],
    hint: "Population variance divides by n, and eps keeps the denominator away from zero.",
  },
  {
    id: "proj-008",
    title: "Greedy Token Generation",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Generate tokens greedily from precomputed logits.\n\nlogits_seq is a list where each element is a vector of next-token logits for one generation step. At each step pick the index of the largest value, breaking ties by choosing the lowest index, and stop after max_tokens tokens or when the logits run out.",
    starterCode: `def generate_greedy(logits_seq, max_tokens):
    # Your code here
    pass`,
    solution: `def generate_greedy(logits_seq, max_tokens):
    tokens = []
    for logits in logits_seq[:max_tokens]:
        best = 0
        for i in range(1, len(logits)):
            if logits[i] > logits[best]:
                best = i
        tokens.append(best)
    return tokens`,
    testCases: [
      { input: [[[0.1, 0.9], [0.7, 0.2]], 2], expected: [1, 0] },
      { input: [[[1, 2, 3]], 1], expected: [2] },
      { input: [[[5, 1]], 3], expected: [0] },
      { input: [[[0.4, 0.4, 0.1]], 1], expected: [0] },
    ],
    hint: "argmax with strict greater-than keeps the earliest index on ties.",
  },
];

const frameworkSteps: Problem[] = [
  {
    id: "proj-009",
    title: "Autograd Node: Add and Multiply",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Implement one node of a tiny reverse-mode autograd engine.\n\nFor z = a * b + c, return [z, dz/da, dz/db, dz/dc]. The multiply node feeds the add node, so gradients flow backwards through both: dz/dc = 1, dz/db = a, and dz/da = b.",
    starterCode: `def autograd_addmul(a, b, c):
    # Return [z, dz_da, dz_db, dz_dc]
    # Your code here
    pass`,
    solution: `def autograd_addmul(a, b, c):
    z = a * b + c
    return [z, b, a, 1]`,
    testCases: [
      { input: [2, 3, 4], expected: [10, 3, 2, 1] },
      { input: [0, -1, 5], expected: [5, -1, 0, 1] },
      { input: [1.5, 2, 0], expected: [3.0, 2, 1.5, 1] },
      { input: [-2, 3, 1], expected: [-5, 3, -2, 1] },
    ],
    hint: "Local gradients multiply along the path and add at branches.",
  },
  {
    id: "proj-010",
    title: "Linear Layer Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Forward pass of a framework-style linear layer.\n\nparams is a dict with W of shape out x in and b of length out. Return W @ x + b as a list of length out.",
    starterCode: `def linear_layer(x, params):
    # Your code here
    pass`,
    solution: `def linear_layer(x, params):
    W = params["W"]
    b = params["b"]
    return [sum(W[i][j] * x[j] for j in range(len(x))) + b[i] for i in range(len(W))]`,
    testCases: [
      {
        input: [[1, 2], { W: [[1, 0], [0, 1]], b: [0, 0] }],
        expected: [1, 2],
      },
      { input: [[1, 2], { W: [[2, 0]], b: [1] }], expected: [3] },
      {
        input: [[0.5, -0.5], { W: [[1, 1]], b: [0.0] }],
        expected: [0.0],
      },
      { input: [[1], { W: [[3]], b: [2] }], expected: [5] },
    ],
    hint: "Each output row is a dot product with x plus its bias.",
  },
  {
    id: "proj-011",
    title: "ReLU With Gradient",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply ReLU and return the forward values plus local gradients.\n\nReturn [outputs, grads] where outputs[i] = max(0, x_i) and grads[i] is 1.0 when the input is strictly positive, otherwise 0.0. An empty input returns [[], []].",
    starterCode: `def relu_with_grad(x):
    # Return [outputs, grads]
    # Your code here
    pass`,
    solution: `def relu_with_grad(x):
    out = [max(0.0, v) for v in x]
    grads = [1.0 if v > 0 else 0.0 for v in x]
    return [out, grads]`,
    testCases: [
      {
        input: [[-1, 0, 2]],
        expected: [[0.0, 0.0, 2.0], [0.0, 0.0, 1.0]],
      },
      { input: [[5]], expected: [[5.0], [1.0]] },
      { input: [[]], expected: [[], []] },
      { input: [[-3, -0.5]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "The derivative of ReLU is a step function: 1 above zero, 0 elsewhere.",
  },
  {
    id: "proj-012",
    title: "Mean Squared Error Loss",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute mean squared error between predictions and targets.\n\nL = (1/n) * sum((y_pred_i - y_true_i)^2). Return 0.0 for empty inputs.",
    starterCode: `def mse_loss(y_pred, y_true):
    # Your code here
    pass`,
    solution: `def mse_loss(y_pred, y_true):
    n = len(y_pred)
    if n == 0:
        return 0.0
    return sum((y_pred[i] - y_true[i]) ** 2 for i in range(n)) / n`,
    testCases: [
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[1, 3], [2, 1]], expected: 2.5 },
      { input: [[0], [0]], expected: 0.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: 2.6666666666666665 },
    ],
    hint: "Square the residuals, average, and the loss stays non-negative.",
  },
  {
    id: "proj-013",
    title: "MSE Backprop Through ReLU",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Backpropagate mean squared error through a ReLU layer.\n\nForward: z = W @ x + b, y_pred = relu(z), L = (1/n) * sum((y_pred - y_true)^2) with n = len(y_pred). Return [dW, db] where the upstream gradient through ReLU is dz_i = 2 * (y_pred_i - y_true_i) / n if z_i > 0 else 0, dW[i][j] = dz_i * x_j, and db = dz.",
    starterCode: `def mse_backprop(x, y_true, W, b):
    # Return [dW, db]
    # Your code here
    pass`,
    solution: `def mse_backprop(x, y_true, W, b):
    z = [sum(W[i][j] * x[j] for j in range(len(x))) + b[i] for i in range(len(W))]
    y_pred = [max(0.0, v) for v in z]
    n = len(y_pred)
    dz = [2.0 * (y_pred[i] - y_true[i]) / n if z[i] > 0 else 0.0 for i in range(n)]
    dW = [[dz[i] * x[j] for j in range(len(x))] for i in range(n)]
    return [dW, list(dz)]`,
    testCases: [
      {
        input: [[1, 0], [0], [[1, 1]], [0]],
        expected: [[[2.0, 0.0]], [2.0]],
      },
      {
        input: [[1, 2], [1, 1], [[1, 0], [0, 1]], [0, 0]],
        expected: [[[0.0, 0.0], [1.0, 2.0]], [0.0, 1.0]],
      },
      { input: [[1], [0], [[-1]], [-1]], expected: [[[0.0]], [0.0]] },
      {
        input: [[2, 1], [3], [[0.5, 0.5]], [0.0]],
        expected: [[[-6.0, -3.0]], [-3.0]],
      },
    ],
    hint: "The ReLU gate zeroes gradients for pre-activations at or below zero.",
  },
  {
    id: "proj-014",
    title: "SGD Parameter Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "One step of stochastic gradient descent on nested parameters.\n\nparams and grads are nested lists with identical shapes. Return a new params structure where every element is updated as p - lr * g.",
    starterCode: `def sgd_step(params, grads, lr):
    # Your code here
    pass`,
    solution: `def sgd_step(params, grads, lr):
    return [
        [params[i][j] - lr * grads[i][j] for j in range(len(params[i]))]
        for i in range(len(params))
    ]`,
    testCases: [
      {
        input: [[[1, 2], [3, 4]], [[0.1, 0.1], [0.2, 0.2]], 0.5],
        expected: [[0.95, 1.95], [2.9, 3.9]],
      },
      { input: [[[1.0]], [[0.0]], 0.1], expected: [[1.0]] },
      {
        input: [[[0.5, -0.5]], [[0.25, -0.25]], 2.0],
        expected: [[0.0, 0.0]],
      },
      { input: [[[1, 1]], [[-1, -1]], 0.5], expected: [[1.5, 1.5]] },
    ],
    hint: "SGD takes a step opposite the gradient, scaled by the learning rate.",
  },
  {
    id: "proj-015",
    title: "Linear Training Loop",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Train a single-layer linear model with full-batch gradient descent.\n\nx is a list of input vectors and y is a list of target vectors, with W of shape out x in and b of length out. Each epoch computes the mean squared error over all outputs and samples, records it, then updates W and b with gradient descent using learning rate lr. Return [final_W, final_b, losses] where losses has one entry per epoch and is empty when epochs is 0.",
    starterCode: `def train_linear(x, y, W, b, lr, epochs):
    # Return [final_W, final_b, losses]
    # Your code here
    pass`,
    solution: `def train_linear(x, y, W, b, lr, epochs):
    n = len(x)
    n_out = len(W)
    n_in = len(x[0]) if x else 0
    W = [row[:] for row in W]
    b = list(b)
    losses = []
    for _ in range(epochs):
        preds = [
            [
                sum(W[o][j] * x[s][j] for j in range(n_in)) + b[o]
                for o in range(n_out)
            ]
            for s in range(n)
        ]
        loss = 0.0
        for s in range(n):
            for o in range(n_out):
                loss += (preds[s][o] - y[s][o]) ** 2
        loss /= n * n_out
        losses.append(loss)
        gW = [[0.0] * n_in for _ in range(n_out)]
        gb = [0.0] * n_out
        for s in range(n):
            for o in range(n_out):
                err = preds[s][o] - y[s][o]
                gb[o] += 2.0 * err / (n * n_out)
                for j in range(n_in):
                    gW[o][j] += 2.0 * err * x[s][j] / (n * n_out)
        for o in range(n_out):
            b[o] -= lr * gb[o]
            for j in range(n_in):
                W[o][j] -= lr * gW[o][j]
    return [W, b, losses]`,
    testCases: [
      {
        input: [[[1], [2]], [[3], [5]], [[0.0]], [0.0], 0.1, 2],
        expected: [[[1.71]], [1.05], [17.0, 1.685]],
      },
      {
        input: [[[0], [1]], [[1], [1]], [[0.0]], [0.0], 1.0, 1],
        expected: [[[1.0]], [2.0], [1.0]],
      },
      {
        input: [
          [[1], [2], [3]],
          [[3], [5], [7]],
          [[0.0]],
          [0.0],
          0.05,
          3,
        ],
        expected: [
          [[1.8621481481481483]],
          [0.8234444444444443],
          [27.666666666666668, 5.488518518518517, 1.089693415637859],
        ],
      },
      {
        input: [[[1]], [[2]], [[1.0]], [0.5], 0.1, 0],
        expected: [[[1.0]], [0.5], []],
      },
    ],
    hint: "Record the loss before the update so losses[0] reflects the initial parameters.",
  },
];

const searchSteps: Problem[] = [
  {
    id: "proj-016",
    title: "Query Tokenization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Normalize and tokenize a search query.\n\nLowercase the text, replace every non-alphanumeric non-whitespace character with a space, split on whitespace, and drop tokens that appear in the stopwords list. Return the remaining tokens in order.",
    starterCode: `def tokenize_query(text, stopwords):
    # Your code here
    pass`,
    solution: `def tokenize_query(text, stopwords):
    cleaned = "".join(c if c.isalnum() or c.isspace() else " " for c in text.lower())
    return [t for t in cleaned.split() if t not in stopwords]`,
    testCases: [
      { input: ["The cat sat", ["the"]], expected: ["cat", "sat"] },
      {
        input: ["Hello, World! hello", []],
        expected: ["hello", "world", "hello"],
      },
      { input: ["a b c", ["a", "b", "c"]], expected: [] },
      { input: ["Don't stop", ["don", "t"]], expected: ["stop"] },
    ],
    hint: "Clean the text first, then filter whole tokens against the stopword list.",
  },
  {
    id: "proj-017",
    title: "Term Frequency",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Compute relative term frequencies for a document.\n\nReturn a dict mapping each unique token to count(token) / len(tokens). An empty token list returns an empty dict.",
    starterCode: `def term_frequency(tokens):
    # Your code here
    pass`,
    solution: `def term_frequency(tokens):
    if not tokens:
        return {}
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return {t: c / len(tokens) for t, c in counts.items()}`,
    testCases: [
      {
        input: [["a", "a", "b"]],
        expected: { a: 0.6666666666666666, b: 0.3333333333333333 },
      },
      { input: [[]], expected: {} },
      { input: [["x"]], expected: { x: 1.0 } },
      { input: [["a", "b", "a", "b"]], expected: { a: 0.5, b: 0.5 } },
    ],
    hint: "Counting first and dividing once is simpler than dividing per token.",
  },
  {
    id: "proj-018",
    title: "TF-IDF Document Vector",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Build a sparse TF-IDF vector for one document.\n\ntokens is the tokenized document, document_frequency maps each term to the number of documents containing it, and num_docs is the collection size. For each unique term use tf = count / len(tokens) and idf = ln(num_docs / df), then return a dict mapping term to tf * idf. Empty tokens return an empty dict.",
    starterCode: `import math
def tfidf_vector(tokens, document_frequency, num_docs):
    # Your code here
    pass`,
    solution: `import math
def tfidf_vector(tokens, document_frequency, num_docs):
    if not tokens:
        return {}
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    out = {}
    for t, c in counts.items():
        idf = math.log(num_docs / document_frequency[t])
        out[t] = (c / len(tokens)) * idf
    return out`,
    testCases: [
      {
        input: [["a", "a", "b"], { a: 2, b: 1 }, 2],
        expected: { a: 0.0, b: 0.23104906018664842 },
      },
      { input: [["a"], { a: 1 }, 2], expected: { a: 0.6931471805599453 } },
      {
        input: [["a", "b"], { a: 1, b: 2 }, 4],
        expected: { a: 0.6931471805599453, b: 0.34657359027997264 },
      },
      { input: [[], {}, 3], expected: {} },
    ],
    hint: "Terms that appear in every document get idf = 0 and vanish from the vector.",
  },
  {
    id: "proj-019",
    title: "Inverted Index",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Build an inverted index from tokenized documents.\n\ndocs is a list of token lists and document ids are their 0-based positions. Return a dict mapping each term to the sorted list of document ids that contain it.",
    starterCode: `def build_inverted_index(docs):
    # Your code here
    pass`,
    solution: `def build_inverted_index(docs):
    index = {}
    for i, tokens in enumerate(docs):
        for t in set(tokens):
            index.setdefault(t, []).append(i)
    return {t: sorted(v) for t, v in index.items()}`,
    testCases: [
     {
        input: [[["a", "b"], ["b", "c"], ["a"]]],
        expected: { a: [0, 2], b: [0, 1], c: [1] },
      },
      { input: [[["x"]]], expected: { x: [0] } },
      { input: [[[], []]], expected: {} },
      {
        input: [[["a", "b"], ["a", "b"]]],
        expected: { a: [0, 1], b: [0, 1] },
      },
    ],
    hint: "Iterating document ids in order keeps each posting list sorted automatically.",
  },
  {
    id: "proj-020",
    title: "Rank Documents by Cosine",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Rank documents against a query using sparse cosine similarity.\n\nquery_vec and each entry of doc_vecs are dicts mapping term to weight. Compute cosine similarity as the dot product over shared terms divided by the product of L2 norms, and score 0.0 when either side has zero norm. Return a list of [doc_index, similarity] pairs sorted by similarity descending and then index ascending, including every document.",
    starterCode: `import math
def rank_documents(query_vec, doc_vecs):
    # Your code here
    pass`,
    solution: `import math
def rank_documents(query_vec, doc_vecs):
    def norm(v):
        return math.sqrt(sum(x * x for x in v.values()))

    qn = norm(query_vec)
    scored = []
    for i, dv in enumerate(doc_vecs):
        dn = norm(dv)
        if qn == 0 or dn == 0:
            sim = 0.0
        else:
            dot = sum(w * dv.get(t, 0.0) for t, w in query_vec.items())
            sim = dot / (qn * dn)
        scored.append([i, sim])
    scored.sort(key=lambda p: (-p[1], p[0]))
    return scored`,
    testCases: [
      {
        input: [{ a: 1.0 }, [{ a: 1.0 }, { b: 1.0 }]],
        expected: [[0, 1.0], [1, 0.0]],
      },
      {
        input: [
          { a: 1.0, b: 1.0 },
          [{ a: 1.0 }, { b: 1.0 }, { a: 1.0, b: 1.0 }],
        ],
        expected: [
          [2, 1.0],
          [0, 0.7071067811865475],
          [1, 0.7071067811865475],
        ],
      },
      { input: [{ a: 1.0 }, []], expected: [] },
      { input: [{}, [{ a: 1.0 }]], expected: [[0, 0.0]] },
    ],
    hint: "Sort with a key of (-similarity, index) to get both tie rules.",
  },
  {
    id: "proj-021",
    title: "BM25 Score",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Score one document against a query with BM25.\n\ndocument_frequency maps a term to the number of documents containing it, num_docs is the collection size, and avg_doc_length is the mean document length. For each query term use idf = ln((N - df + 0.5) / (df + 0.5) + 1) and tf = the raw count in the document, contributing idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avg_doc_length)). Skip terms absent from the document or collection, use k1=1.5 and b=0.75 by default, and return 0.0 for an empty document or zero average length.",
    starterCode: `import math
def bm25_score(query_tokens, doc_tokens, document_frequency, num_docs, avg_doc_length, k1=1.5, b=0.75):
    # Your code here
    pass`,
    solution: `import math
def bm25_score(query_tokens, doc_tokens, document_frequency, num_docs, avg_doc_length, k1=1.5, b=0.75):
    if not doc_tokens or avg_doc_length == 0:
        return 0.0
    dl = len(doc_tokens)
    score = 0.0
    for t in set(query_tokens):
        df = document_frequency.get(t, 0)
        if df == 0:
            continue
        tf = doc_tokens.count(t)
        if tf == 0:
            continue
        idf = math.log((num_docs - df + 0.5) / (df + 0.5) + 1.0)
        score += idf * (tf * (k1 + 1.0)) / (tf + k1 * (1.0 - b + b * dl / avg_doc_length))
    return score`,
    testCases: [
      {
        input: [["cat"], ["cat", "sat"], { cat: 1 }, 2, 2.0],
        expected: 0.6931471805599453,
      },
      {
        input: [["a", "b"], ["a", "a", "b", "c"], { a: 2, b: 2 }, 4, 3.0],
        expected: 1.4971201375348047,
      },
      {
        input: [["x"], ["a", "b"], { x: 1 }, 2, 2.0],
        expected: 0.0,
      },
      { input: [["a"], [], { a: 1 }, 1, 1.0], expected: 0.0 },
    ],
    hint: "Term saturation and length normalization live in the denominator of each term.",
  },
  {
    id: "proj-022",
    title: "PageRank",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Run the iterative PageRank algorithm on a directed graph.\n\nedges is a list of [from, to] pairs and num_nodes is the node count. Initialize every rank to 1/num_nodes and repeat the given number of iterations: each node splits its rank equally across outgoing links, dangling nodes spread their rank across all nodes, and every node receives (1 - damping) / num_nodes as a base. Use damping=0.85 by default and return the final rank list; an empty graph returns [].",
    starterCode: `def pagerank(edges, num_nodes, damping=0.85, iterations=10):
    # Your code here
    pass`,
    solution: `def pagerank(edges, num_nodes, damping=0.85, iterations=10):
    if num_nodes == 0:
        return []
    out_links = [[] for _ in range(num_nodes)]
    for u, v in edges:
        if 0 <= u < num_nodes and 0 <= v < num_nodes:
            out_links[u].append(v)
    rank = [1.0 / num_nodes] * num_nodes
    for _ in range(iterations):
        new_rank = [(1.0 - damping) / num_nodes] * num_nodes
        dangling = 0.0
        for u in range(num_nodes):
            if not out_links[u]:
                dangling += rank[u]
            else:
                share = rank[u] / len(out_links[u])
                for v in out_links[u]:
                    new_rank[v] += damping * share
        for v in range(num_nodes):
            new_rank[v] += damping * dangling / num_nodes
        rank = new_rank
    return rank`,
    testCases: [
      {
        input: [[[0, 1], [1, 2]], 3, 0.85, 3],
        expected: [0.20153086419753088, 0.347054012345679, 0.45141512345679013],
      },
      {
        input: [[[0, 1]], 2, 0.85, 5],
        expected: [0.34880948730468747, 0.6511905126953125],
      },
      {
        input: [[[0, 1], [0, 2], [1, 2]], 3, 0.85, 10],
        expected: [0.1975828206588288, 0.2815526116649371, 0.5208645676762342],
      },
      { input: [[], 0, 0.85, 3], expected: [] },
    ],
    hint: "Compute the next rank vector from the previous one; never update in place.",
  },
];

const recommenderSteps: Problem[] = [
  {
    id: "proj-023",
    title: "Build a Rating Matrix",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Build a dense user-item rating matrix from sparse ratings.\n\nratings is a list of [user_index, item_index, rating] triples and missing entries are 0.0. Ignore out-of-range indices and let later duplicates overwrite earlier ratings. Return num_users rows of num_items floats.",
    starterCode: `def rating_matrix(ratings, num_users, num_items):
    # Your code here
    pass`,
    solution: `def rating_matrix(ratings, num_users, num_items):
    matrix = [[0.0] * num_items for _ in range(num_users)]
    for u, i, r in ratings:
        if 0 <= u < num_users and 0 <= i < num_items:
            matrix[u][i] = float(r)
    return matrix`,
    testCases: [
      {
        input: [[[0, 0, 5], [1, 1, 3]], 2, 2],
        expected: [[5.0, 0.0], [0.0, 3.0]],
      },
      {
        input: [[], 2, 3],
        expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
      },
      { input: [[[0, 0, 4], [0, 0, 5]], 1, 1], expected: [[5.0]] },
      { input: [[[2, 0, 1]], 2, 2], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Zero is the missing-value sentinel, so ratings must be positive to be observed.",
  },
  {
    id: "proj-024",
    title: "User Cosine Similarity",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute pairwise cosine similarities between users.\n\nmatrix is a user x item rating matrix. Return an n x n matrix where entry [a][b] = dot(row_a, row_b) / (norm_a * norm_b), or 0.0 when either row has zero norm. A user with any ratings has similarity 1.0 with themselves.",
    starterCode: `import math
def user_similarity(matrix):
    # Your code here
    pass`,
    solution: `import math
def user_similarity(matrix):
    n = len(matrix)
    sim = [[0.0] * n for _ in range(n)]
    for a in range(n):
        na = math.sqrt(sum(x * x for x in matrix[a]))
        for b in range(n):
            nb = math.sqrt(sum(y * y for y in matrix[b]))
            if na == 0 or nb == 0:
                sim[a][b] = 0.0
            else:
                dot = sum(x * y for x, y in zip(matrix[a], matrix[b]))
                sim[a][b] = dot / (na * nb)
    return sim`,
    testCases: [
      {
        input: [[[1, 0], [1, 0]]],
        expected: [[1.0, 1.0], [1.0, 1.0]],
      },
      {
        input: [[[1, 0], [0, 1]]],
        expected: [[1.0, 0.0], [0.0, 1.0]],
      },
      {
        input: [[[0, 0], [1, 1]]],
        expected: [[0.0, 0.0], [0.0, 1.0]],
      },
      {
        input: [[[1, 0], [1, 1]]],
        expected: [[1.0, 0.7071067811865475], [0.7071067811865475, 1.0]],
      },
    ],
    hint: "The zero vector has no direction, so its cosine with anything is defined as 0.0.",
  },
  {
    id: "proj-025",
    title: "Mean-Center by User",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Center each user's ratings by their observed mean.\n\nFor every row, compute the mean over nonzero entries only, subtract it from those entries, and leave zeros as 0.0. A row with no ratings stays all zeros.",
    starterCode: `def mean_center_by_user(matrix):
    # Your code here
    pass`,
    solution: `def mean_center_by_user(matrix):
    out = []
    for row in matrix:
        observed = [r for r in row if r != 0]
        mean = sum(observed) / len(observed) if observed else 0.0
        out.append([r - mean if r != 0 else 0.0 for r in row])
    return out`,
    testCases: [
      {
        input: [[[5, 0, 3], [0, 0, 0]]],
        expected: [[1.0, 0.0, -1.0], [0.0, 0.0, 0.0]],
      },
      {
        input: [[[2, 4], [6, 2]]],
        expected: [[-1.0, 1.0], [2.0, -2.0]],
      },
      { input: [[[1, 2, 3]]], expected: [[-1.0, 0.0, 1.0]] },
      {
        input: [[[0, 0], [80, 20]]],
        expected: [[0.0, 0.0], [30.0, -30.0]],
      },
    ],
    hint: "Users rate on different scales; centering removes each user's personal bias.",
  },
  {
    id: "proj-026",
    title: "Collaborative Filtering Prediction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict a missing rating with user-based collaborative filtering.\n\nFor the target user, average the ratings other users gave the item, weighted by their cosine similarity to the target: sum(sim * rating) / sum(abs(sim)) over users with a nonzero rating, excluding the target user. Return 0.0 when no other user qualifies.",
    starterCode: `def cf_predict(matrix, similarity, user, item):
    # Your code here
    pass`,
    solution: `def cf_predict(matrix, similarity, user, item):
    num = 0.0
    den = 0.0
    for v in range(len(matrix)):
        if v == user:
            continue
        r = matrix[v][item]
        if r != 0:
            num += similarity[user][v] * r
            den += abs(similarity[user][v])
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      {
        input: [[[5, 0], [4, 4]], [[1, 0.5], [0.5, 1]], 0, 1],
        expected: 4.0,
      },
      {
        input: [[[3, 0], [0, 5]], [[1, 0], [0, 1]], 0, 1],
        expected: 0.0,
      },
      {
        input: [
          [[0, 0], [2, 0], [0, 4]],
          [[1, 0.8, 0.2], [0.8, 1, 0.5], [0.2, 0.5, 1]],
          0,
          0,
        ],
        expected: 2.0,
      },
      {
        input: [[[4, 0], [0, 0]], [[1, 0], [0, 1]], 0, 1],
        expected: 0.0,
      },
    ],
    hint: "Only neighbors who actually rated the item contribute to the weighted average.",
  },
  {
    id: "proj-027",
    title: "Matrix Factorization SGD Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one SGD update for matrix factorization.\n\nGiven user vector p, item vector q, and observed rating r, compute pred = dot(p, q) and err = r - pred. Return [new_p, new_q] with new_p_i = p_i + lr * (err * q_i - reg * p_i) and new_q_i = q_i + lr * (err * p_i - reg * q_i). Defaults are lr=0.01 and reg=0.02.",
    starterCode: `def mf_update(p, q, rating, lr=0.01, reg=0.02):
    # Return [new_p, new_q]
    # Your code here
    pass`,
    solution: `def mf_update(p, q, rating, lr=0.01, reg=0.02):
    pred = sum(a * b for a, b in zip(p, q))
    err = rating - pred
    new_p = [p[i] + lr * (err * q[i] - reg * p[i]) for i in range(len(p))]
    new_q = [q[i] + lr * (err * p[i] - reg * q[i]) for i in range(len(q))]
    return [new_p, new_q]`,
    testCases: [
      {
        input: [[0.5, 0.5], [0.5, 0.5], 1.0, 0.1, 0.0],
        expected: [[0.525, 0.525], [0.525, 0.525]],
      },
      {
        input: [[1.0], [2.0], 5.0, 0.1, 0.0],
        expected: [[1.6], [2.3]],
      },
      {
        input: [[1.0], [1.0], 2.0, 0.1, 0.1],
        expected: [[1.09], [1.09]],
      },
      {
        input: [[0.0, 0.0], [1.0, 1.0], 3.0, 0.1, 0.0],
        expected: [[0.30000000000000004, 0.30000000000000004], [1.0, 1.0]],
      },
    ],
    hint: "The regularization term pulls each latent vector toward zero every update.",
  },
  {
    id: "proj-028",
    title: "Masked RMSE",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Compute RMSE over observed ratings only.\n\nmatrix holds the true ratings with 0.0 marking missing entries, and reconstructed holds the predicted matrix. Average the squared differences over nonzero entries and take the square root, returning 0.0 when nothing is observed.",
    starterCode: `import math
def masked_rmse(matrix, reconstructed):
    # Your code here
    pass`,
    solution: `import math
def masked_rmse(matrix, reconstructed):
    total = 0.0
    count = 0
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if matrix[i][j] != 0:
                diff = matrix[i][j] - reconstructed[i][j]
                total += diff * diff
                count += 1
    if count == 0:
        return 0.0
    return math.sqrt(total / count)`,
    testCases: [
      {
        input: [[[5, 0], [0, 3]], [[5, 0], [0, 3]]],
        expected: 0.0,
      },
      {
        input: [[[5, 0], [0, 3]], [[4, 0], [0, 5]]],
        expected: 1.5811388300841898,
      },
      { input: [[[0, 0]], [[1, 1]]], expected: 0.0 },
      { input: [[[1, 2], [3, 0]], [[1, 2], [3, 9]]], expected: 0.0 },
    ],
    hint: "Masking the zeros is what makes the metric measure generalization, not missing data.",
  },
  {
    id: "proj-029",
    title: "Top-K Recommendations",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Rank unseen items for a user.\n\nscores is a list of predicted scores per item and rated lists the item indices the user has already rated. Return the k unseen item indices with the highest scores, breaking ties by smaller index, as a list.",
    starterCode: `def top_k_items(scores, rated, k):
    # Your code here
    pass`,
    solution: `def top_k_items(scores, rated, k):
    rated_set = set(rated)
    candidates = [i for i in range(len(scores)) if i not in rated_set]
    candidates.sort(key=lambda i: (-scores[i], i))
    return candidates[:k]`,
    testCases: [
      { input: [[0.1, 0.9, 0.5, 0.7], [0], 2], expected: [1, 3] },
      { input: [[1, 2, 3], [], 3], expected: [2, 1, 0] },
      { input: [[1, 2], [0, 1], 2], expected: [] },
      { input: [[5, 5, 5], [], 2], expected: [0, 1] },
    ],
    hint: "Filter out rated items first, then sort by descending score.",
  },
];

const cnnSteps: Problem[] = [
  {
    id: "proj-030",
    title: "Convolution with Zero Padding",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "2D convolution (cross-correlation) with zero padding.\n\nSlide the kernel over the image, multiplying and summing image patches with the kernel weights, and treat out-of-bounds pixels as 0. pad is the number of zero pixels added on every side, so the output shape is (H + 2*pad - kh + 1) x (W + 2*pad - kw + 1).",
    starterCode: `def conv2d_padded(image, kernel, pad):
    # Your code here
    pass`,
    solution: `def conv2d_padded(image, kernel, pad):
    h = len(image)
    w = len(image[0])
    kh = len(kernel)
    kw = len(kernel[0])
    out = []
    for i in range(h + 2 * pad - kh + 1):
        row = []
        for j in range(w + 2 * pad - kw + 1):
            s = 0
            for a in range(kh):
                for b in range(kw):
                    ii = i + a - pad
                    jj = j + b - pad
                    if 0 <= ii < h and 0 <= jj < w:
                        s += image[ii][jj] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      {
        input: [[[1, 2], [3, 4]], [[1]], 1],
        expected: [
          [0, 0, 0, 0],
          [0, 1, 2, 0],
          [0, 3, 4, 0],
          [0, 0, 0, 0],
        ],
      },
      {
        input: [
          [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
          1,
        ],
        expected: [[6, 9, 8], [13, 20, 17], [12, 21, 14]],
      },
      {
        input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]], 0],
        expected: [[5]],
      },
      { input: [[[2]], [[5]], 0], expected: [[10]] },
    ],
    hint: "Iterate over output positions, then over kernel offsets, offsetting by -pad.",
  },
  {
    id: "proj-031",
    title: "ReLU Feature Map",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply ReLU to every element of a 2D feature map.\n\nReturn a new nested list where each value is max(0.0, v).",
    starterCode: `def relu_map(feature_map):
    # Your code here
    pass`,
    solution: `def relu_map(feature_map):
    return [[max(0.0, v) for v in row] for row in feature_map]`,
    testCases: [
      {
        input: [[[-1, 0], [2, -3]]],
        expected: [[0.0, 0.0], [2.0, 0.0]],
      },
      { input: [[[]]], expected: [[]] },
      { input: [[[0]]], expected: [[0.0]] },
      { input: [[[1.5, -2.5]]], expected: [[1.5, 0.0]] },
    ],
    hint: "Nonlinearity is applied independently to each activation.",
  },
  {
    id: "proj-032",
    title: "Max Pooling with Argmax",
    category: "Computer Vision",
    difficulty: "Medium",
    description:
      "Max pooling with stride equal to the window size, plus argmax locations.\n\nSlide a k x k window over the image in non-overlapping steps and take the maximum, using the first occurrence on ties. Return [pooled, indices] where indices[i][j] is the [row, col] position of the winning value in the input.",
    starterCode: `def max_pool_argmax(image, k):
    # Return [pooled, indices]
    # Your code here
    pass`,
    solution: `def max_pool_argmax(image, k):
    h = len(image)
    w = len(image[0])
    pooled = []
    indices = []
    for i in range(0, h - k + 1, k):
        prow = []
        irow = []
        for j in range(0, w - k + 1, k):
            best = image[i][j]
            bi = 0
            bj = 0
            for a in range(k):
                for b in range(k):
                    if image[i + a][j + b] > best:
                        best = image[i + a][j + b]
                        bi = a
                        bj = b
            prow.append(best)
            irow.append([i + bi, j + bj])
        pooled.append(prow)
        indices.append(irow)
    return [pooled, indices]`,
    testCases: [
      {
        input: [
          [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]],
          2,
        ],
        expected: [
          [[6, 8], [14, 16]],
          [
            [[1, 1], [1, 3]],
            [[3, 1], [3, 3]],
          ],
        ],
      },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3],
        expected: [[[9]], [[[2, 2]]]],
      },
      {
        input: [[[-5, -1], [-3, -2]], 2],
        expected: [[[-1]], [[[0, 1]]]],
      },
      {
        input: [[[2, 2], [2, 1]], 2],
        expected: [[[2]], [[[0, 0]]]],
      },
    ],
    hint: "Track the offset within the window, then add the window origin.",
  },
  {
    id: "proj-033",
    title: "Flatten Feature Maps",
    category: "Computer Vision",
    difficulty: "Easy",
    description:
      "Flatten a list of 2D feature maps into one vector.\n\nFlatten each map in row-major order and concatenate the maps in their original order. An empty map list returns [].",
    starterCode: `def flatten_maps(maps):
    # Your code here
    pass`,
    solution: `def flatten_maps(maps):
    out = []
    for m in maps:
        for row in m:
            out.extend(row)
    return out`,
    testCases: [
      { input: [[[[1, 2], [3, 4]]]], expected: [1, 2, 3, 4] },
      { input: [[[[1, 2]], [[3], [4]]]], expected: [1, 2, 3, 4] },
      { input: [[[[]]]], expected: [] },
      { input: [[[[0]]]], expected: [0] },
    ],
    hint: "Row-major per map, then maps in channel order.",
  },
  {
    id: "proj-034",
    title: "Dense Class Scores",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute class scores from a flattened feature vector.\n\nW has shape num_classes x len(x) and b has length num_classes. Return W @ x + b as the raw logits for each class.",
    starterCode: `def dense_scores(x, W, b):
    # Your code here
    pass`,
    solution: `def dense_scores(x, W, b):
    return [sum(W[i][j] * x[j] for j in range(len(x))) + b[i] for i in range(len(W))]`,
    testCases: [
      { input: [[1, 2], [[1, 0], [0, 1]], [0, 0]], expected: [1.0, 2.0] },
      { input: [[0.5], [[2]], [1]], expected: [2.0] },
      { input: [[1, -1], [[1, 1]], [0]], expected: [0.0] },
      { input: [[1, 2, 3], [[1, 0, 1]], [0.5]], expected: [4.5] },
    ],
    hint: "The classifier head is a single matrix-vector product plus bias.",
  },
  {
    id: "proj-035",
    title: "Temperature Softmax",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Softmax with temperature scaling.\n\nScale every logit by 1/temperature, subtract the max for numerical stability, exponentiate, and normalize. Lower temperatures sharpen the distribution and higher temperatures flatten it; assume temperature > 0.",
    starterCode: `import math
def temperature_softmax(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_softmax(logits, temperature):
    scaled = [v / temperature for v in logits]
    m = max(scaled)
    exps = [math.exp(v - m) for v in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      {
        input: [[2, 4, 6], 2.0],
        expected: [
          0.09003057317038046, 0.24472847105479764, 0.6652409557748218,
        ],
      },
      {
        input: [[1, 2, 3], 1.0],
        expected: [
          0.09003057317038046, 0.24472847105479764, 0.6652409557748218,
        ],
      },
      {
        input: [[1, 2, 3], 0.5],
        expected: [
          0.015876239976466765, 0.11731042782619838, 0.8668133321973349,
        ],
      },
      { input: [[0, 0], 1.0], expected: [0.5, 0.5] },
    ],
    hint: "Dividing the logits by temperature before softmax does the whole job.",
  },
  {
    id: "proj-036",
    title: "CNN Predict",
    category: "Computer Vision",
    difficulty: "Hard",
    description:
      "Full CNN prediction pass from pixels to class index.\n\nPipeline: zero-padded convolution with pad=1 (cross-correlation), ReLU, non-overlapping 2x2 max pooling, flatten in row-major order, dense scores W @ x + b, then softmax. Return the index of the highest probability, breaking ties by the lower index.",
    starterCode: `import math
def cnn_predict(image, kernel, W, b):
    # Your code here
    pass`,
    solution: `import math
def cnn_predict(image, kernel, W, b):
    def conv_pad(im, ker, pad):
        h = len(im)
        w = len(im[0])
        kh = len(ker)
        kw = len(ker[0])
        out = []
        for i in range(h + 2 * pad - kh + 1):
            row = []
            for j in range(w + 2 * pad - kw + 1):
                s = 0
                for a in range(kh):
                    for c in range(kw):
                        ii = i + a - pad
                        jj = j + c - pad
                        if 0 <= ii < h and 0 <= jj < w:
                            s += im[ii][jj] * ker[a][c]
                row.append(s)
            out.append(row)
        return out

    act = [[max(0.0, v) for v in row] for row in conv_pad(image, kernel, 1)]
    ph = len(act) // 2
    pw = len(act[0]) // 2
    flat = []
    for i in range(ph):
        for j in range(pw):
            flat.append(
                max(
                    act[2 * i][2 * j],
                    act[2 * i][2 * j + 1],
                    act[2 * i + 1][2 * j],
                    act[2 * i + 1][2 * j + 1],
                )
            )
    logits = [
        sum(W[c][j] * flat[j] for j in range(len(flat))) + b[c]
        for c in range(len(W))
    ]
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    probs = [e / total for e in exps]
    best = 0
    for i in range(1, len(probs)):
        if probs[i] > probs[best]:
            best = i
    return best`,
    testCases: [
      {
        input: [
          [[1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1]],
          [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
          [[1.0, -1.0, 0.5, -0.5], [-1.0, 1.0, -0.5, 0.5]],
          [0.2, -0.2],
        ],
        expected: 0,
      },
      {
        input: [
          [[5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5], [5, 5, 5, 5]],
          [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
          [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]],
          [0.0, 0.0],
        ],
        expected: 0,
      },
      {
        input: [
          [[1, 2], [3, 4]],
          [[1]],
          [[1.0, 0.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0]],
          [0.0, 0.0],
        ],
        expected: 1,
      },
      {
        input: [[[1]], [[1]], [[1.0], [1.0]], [0.0, 0.0]],
        expected: 0,
      },
    ],
    hint: "After pooling with k=2 the maps shrink by half; flatten, score, and take the argmax.",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "gpt",
    title: "Build a GPT from Scratch",
    blurb:
      "Tokenize text, embed it, run causal self-attention, normalize, and generate the next token — a decoder-only transformer assembled problem by problem.",
    difficulty: "Hard",
    tags: ["transformers", "attention", "generation"],
    steps: gptSteps,
  },
  {
    id: "nn-framework",
    title: "Build a Neural Network Framework",
    blurb:
      "Grow a tiny reverse-mode autograd engine into a trainable network: nodes, layers, losses, and a full-batch SGD loop.",
    difficulty: "Hard",
    tags: ["autograd", "backprop", "sgd"],
    steps: frameworkSteps,
  },
  {
    id: "search-engine",
    title: "Build a Search Engine",
    blurb:
      "Index a document collection end to end: tokenization, TF-IDF vectors, an inverted index, cosine ranking, BM25, and PageRank.",
    difficulty: "Medium",
    tags: ["information retrieval", "ranking", "graphs"],
    steps: searchSteps,
  },
  {
    id: "recommender",
    title: "Build a Recommender System",
    blurb:
      "Predict ratings from behavior: user-item matrices, user similarity, collaborative filtering, matrix factorization, and masked RMSE.",
    difficulty: "Medium",
    tags: ["collaborative filtering", "matrix factorization", "ranking"],
    steps: recommenderSteps,
  },
  {
    id: "cnn",
    title: "Build a CNN from Scratch",
    blurb:
      "Assemble a convolutional classifier: convolution with padding, ReLU, pooled argmax features, dense scores, softmax, and a full predict pass.",
    difficulty: "Hard",
    tags: ["convolution", "pooling", "classification"],
    steps: cnnSteps,
  },
];

export const PROJECT_STEPS: Problem[] = PROJECTS.flatMap((p) => p.steps);
