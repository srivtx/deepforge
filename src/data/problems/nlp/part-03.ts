import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-051",
    title: "Word Frequency Ranking",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the words in tokens ordered by descending frequency.\n\nBreak ties alphabetically by the word itself. Every distinct word appears exactly once, and an empty token list yields an empty list.",
    starterCode: `def zipf_rank(tokens):
    # Your code here
    pass`,
    solution: `def zipf_rank(tokens):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return sorted(counts, key=lambda w: (-counts[w], w))`,
    testCases: [
      { input: [["b", "a", "b", "c"]], expected: ["b", "a", "c"] },
      { input: [["the", "cat", "sat", "on", "the", "mat"]], expected: ["the", "cat", "mat", "on", "sat"] },
      { input: [[]], expected: [] },
      { input: [["a", "a", "b", "b", "c"]], expected: ["a", "b", "c"] },
    ],
    hint: "Sort the distinct words by the tuple (negative count, word).",
  },
  {
    id: "nlp-052",
    title: "Zipf Expected Frequency",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Zipf law expected frequency C / rank ** s for a word at the given rank.\n\nrank is 1-based, C is the constant of proportionality, and s is the exponent. rank is assumed to be positive.",
    starterCode: `def zipf_frequency(rank, C, s):
    # Your code here
    pass`,
    solution: `def zipf_frequency(rank, C, s):
    return C / (rank ** s)`,
    testCases: [
      { input: [1, 100.0, 1.0], expected: 100.0 },
      { input: [2, 100.0, 1.0], expected: 50.0 },
      { input: [1, 50.0, 2.0], expected: 50.0 },
      { input: [4, 64.0, 1.5], expected: 8.0 },
      { input: [2, 10.0, 0.0], expected: 10.0 },
    ],
    hint: "A rank exponent of 1 gives the classic 1/rank decay.",
  },
  {
    id: "nlp-053",
    title: "Heap's Law Vocabulary Size",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Heap's law vocabulary size K * n ** beta for a corpus of n tokens, where K and beta are the law's parameters.\n\nn = 0 yields 0.0.",
    starterCode: `def heaps_law(n, K, beta):
    # Your code here
    pass`,
    solution: `def heaps_law(n, K, beta):
    return K * (n ** beta)`,
    testCases: [
      { input: [1000, 10.0, 0.5], expected: 316.2277660168379 },
      { input: [0, 10.0, 0.5], expected: 0.0 },
      { input: [100, 5.0, 1.0], expected: 500.0 },
      { input: [10000, 20.0, 0.6], expected: 5023.77286301916 },
    ],
    hint: "Vocabulary grows sublinearly, so beta is usually below 1.",
  },
  {
    id: "nlp-054",
    title: "Windowed Type-Token Ratio",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Split tokens into consecutive windows of size k, where the final window may be shorter, and return the type-token ratio of each window in order.\n\nA window's ratio is its number of distinct tokens divided by its length. Return an empty list when k <= 0 or tokens is empty.",
    starterCode: `def windowed_ttr(tokens, k):
    # Your code here
    pass`,
    solution: `def windowed_ttr(tokens, k):
    if k <= 0:
        return []
    ratios = []
    for i in range(0, len(tokens), k):
        w = tokens[i:i + k]
        ratios.append(len(set(w)) / len(w))
    return ratios`,
    testCases: [
      { input: [["a", "b", "a", "b", "c", "d"], 2], expected: [1.0, 1.0, 1.0] },
      { input: [["a", "b", "a", "b", "c", "d"], 4], expected: [0.5, 1.0] },
      { input: [["a", "b", "a", "b", "c", "d"], 3], expected: [0.6666666666666666, 1.0] },
      { input: [[], 3], expected: [] },
      { input: [["a", "b"], 0], expected: [] },
    ],
    hint: "Step through the token list with range(0, n, k) and slice each window.",
  },
  {
    id: "nlp-055",
    title: "OOV Rate",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the token-level out-of-vocabulary rate: the fraction of token occurrences in tokens that are not in vocab.\n\nReturn 0.0 for an empty token list.",
    starterCode: `def oov_rate(tokens, vocab):
    # Your code here
    pass`,
    solution: `def oov_rate(tokens, vocab):
    if not tokens:
        return 0.0
    v = set(vocab)
    return sum(1 for t in tokens if t not in v) / len(tokens)`,
    testCases: [
      { input: [["a", "b", "z"], ["a", "b"]], expected: 0.3333333333333333 },
      { input: [["a", "b"], ["a", "b", "c"]], expected: 0.0 },
      { input: [["x", "y"], []], expected: 1.0 },
      { input: [[], ["a"]], expected: 0.0 },
    ],
    hint: "Count occurrences, not distinct types, and divide by the token count.",
  },
  {
    id: "nlp-056",
    title: "Vocabulary Coverage of Corpus",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the type-level coverage: the fraction of distinct tokens in the corpus that appear in vocab.\n\nDuplicate occurrences do not affect the result. Return 0.0 when the corpus has no tokens.",
    starterCode: `def vocab_coverage(tokens, vocab):
    # Your code here
    pass`,
    solution: `def vocab_coverage(tokens, vocab):
    types = set(tokens)
    if not types:
        return 0.0
    v = set(vocab)
    return len(types & v) / len(types)`,
    testCases: [
      { input: [["a", "b", "c", "d"], ["a", "b"]], expected: 0.5 },
      { input: [["a", "a", "b"], ["a", "b"]], expected: 1.0 },
      { input: [[], ["a"]], expected: 0.0 },
      { input: [["x", "y"], []], expected: 0.0 },
    ],
    hint: "Coverage is a type-level measure, so work with set(tokens).",
  },
  {
    id: "nlp-057",
    title: "Word Count Excluding Stopwords",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the number of tokens that are not in the stopwords list.\n\nDuplicates among the remaining tokens are counted each time.",
    starterCode: `def word_count_excluding_stopwords(tokens, stopwords):
    # Your code here
    pass`,
    solution: `def word_count_excluding_stopwords(tokens, stopwords):
    stop = set(stopwords)
    return sum(1 for t in tokens if t not in stop)`,
    testCases: [
      { input: [["the", "cat", "is", "on", "the", "mat"], ["the", "is", "on"]], expected: 2 },
      { input: [["a", "b"], []], expected: 2 },
      { input: [[], ["x"]], expected: 0 },
      { input: [["do", "not", "stop"], ["do", "not", "stop"]], expected: 0 },
    ],
    hint: "Put the stopwords in a set and count the tokens outside it.",
  },
  {
    id: "nlp-058",
    title: "Collocation Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return how many times w1 is immediately followed by w2 in tokens.\n\nOnly adjacent pairs count, and a token list shorter than two elements yields 0.",
    starterCode: `def collocation_count(tokens, w1, w2):
    # Your code here
    pass`,
    solution: `def collocation_count(tokens, w1, w2):
    return sum(1 for i in range(len(tokens) - 1) if tokens[i] == w1 and tokens[i + 1] == w2)`,
    testCases: [
      { input: [["new", "york", "new", "york", "city"], "new", "york"], expected: 2 },
      { input: [["a", "a", "a"], "a", "a"], expected: 2 },
      { input: [["a", "b", "c"], "b", "a"], expected: 0 },
      { input: [["a"], "a", "a"], expected: 0 },
    ],
    hint: "Overlapping bigrams both count, so a a a contains two (a, a) pairs.",
  },
  {
    id: "nlp-059",
    title: "PMI Collocation Score",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the pointwise mutual information score log((O * N) / (c1 * c2)), where O is the number of times w1 is immediately followed by w2, c1 and c2 are the token counts of w1 and w2, and N is the corpus length.\n\nReturn 0.0 when any of those counts is 0 or the corpus is empty.",
    starterCode: `import math
def pmi_score(tokens, w1, w2):
    # Your code here
    pass`,
    solution: `import math
def pmi_score(tokens, w1, w2):
    n = len(tokens)
    if n == 0:
        return 0.0
    c1 = tokens.count(w1)
    c2 = tokens.count(w2)
    c12 = sum(1 for i in range(n - 1) if tokens[i] == w1 and tokens[i + 1] == w2)
    if c1 == 0 or c2 == 0 or c12 == 0:
        return 0.0
    return math.log((c12 * n) / (c1 * c2))`,
    testCases: [
      { input: [["new", "york", "new", "york", "city"], "new", "york"], expected: 0.9162907318741551 },
      { input: [["the", "cat", "sat", "on", "the", "mat"], "the", "cat"], expected: 1.0986122886681098 },
      { input: [["a", "b"], "a", "z"], expected: 0.0 },
      { input: [[], "a", "b"], expected: 0.0 },
      { input: [["a", "b", "c"], "a", "c"], expected: 0.0 },
    ],
    hint: "O * N / (c1 * c2) measures how much more often the pair co-occurs than chance.",
  },
  {
    id: "nlp-060",
    title: "T-Score Collocation",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the t-score (O - E) / sqrt(O), where O is the number of adjacent (w1, w2) bigrams and E = c1 * c2 / N is the expected count under independence.\n\nReturn 0.0 when O is 0 or the corpus is empty.",
    starterCode: `import math
def t_score(tokens, w1, w2):
    # Your code here
    pass`,
    solution: `import math
def t_score(tokens, w1, w2):
    n = len(tokens)
    if n == 0:
        return 0.0
    c1 = tokens.count(w1)
    c2 = tokens.count(w2)
    observed = sum(1 for i in range(n - 1) if tokens[i] == w1 and tokens[i + 1] == w2)
    if observed == 0:
        return 0.0
    expected = (c1 * c2) / n
    return (observed - expected) / math.sqrt(observed)`,
    testCases: [
      { input: [["new", "york", "new", "york", "city"], "new", "york"], expected: 0.8485281374238569 },
      { input: [["the", "cat", "sat", "on", "the", "mat"], "the", "cat"], expected: 0.6666666666666667 },
      { input: [["a", "b", "c"], "b", "a"], expected: 0.0 },
      { input: [[], "a", "b"], expected: 0.0 },
    ],
    hint: "The t-score divides the excess over chance by the square root of the observed count.",
  },
  {
    id: "nlp-061",
    title: "Log-Likelihood Ratio Collocation",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return Dunning's log-likelihood ratio for the (w1, w2) collocation. Build the 2x2 table O11 = adjacent bigram count, O12 = c1 - O11, O21 = c2 - O11, and O22 = N - c1 - c2 + O11, with expected counts E_ij = row_total * col_total / N.\n\nReturn 2 * sum of O_ij * log(O_ij / E_ij) over cells with O_ij > 0. Return 0.0 for an empty corpus or if such a cell has zero expectation.",
    starterCode: `import math
def log_likelihood_ratio(tokens, w1, w2):
    # Your code here
    pass`,
    solution: `import math
def log_likelihood_ratio(tokens, w1, w2):
    n = len(tokens)
    if n == 0:
        return 0.0
    c1 = tokens.count(w1)
    c2 = tokens.count(w2)
    o11 = sum(1 for i in range(n - 1) if tokens[i] == w1 and tokens[i + 1] == w2)
    o12 = c1 - o11
    o21 = c2 - o11
    o22 = n - c1 - c2 + o11
    if o22 < 0:
        o22 = 0
    total = 0.0
    cells = [
        (o11, c1 * c2),
        (o12, c1 * (n - c2)),
        (o21, (n - c1) * c2),
        (o22, (n - c1) * (n - c2)),
    ]
    for o, e in cells:
        if o > 0:
            if e <= 0:
                return 0.0
            total += o * math.log(o * n / e)
    return 2 * total`,
    testCases: [
      {
        input: [["new", "york", "new", "york", "city"], "new", "york"],
        expected: 6.730116670092565,
      },
      {
        input: [["the", "cat", "sat", "on", "the", "mat"], "the", "cat"],
        expected: 2.6341457841558746,
      },
      { input: [[], "a", "b"], expected: 0.0 },
      { input: [["a", "b", "c"], "a", "c"], expected: 1.0464962875290957 },
    ],
    hint: "The four expected counts are row_total times col_total over N; multiply O by log of O times N over that product.",
  },
  {
    id: "nlp-062",
    title: "Dice Bigram Coefficient",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Dice coefficient 2 * O / (c1 + c2) for the adjacent bigram (w1, w2), where O is how often w1 is immediately followed by w2 and c1, c2 are the token counts.\n\nReturn 0.0 when c1 + c2 is 0.",
    starterCode: `def dice_bigram_coefficient(tokens, w1, w2):
    # Your code here
    pass`,
    solution: `def dice_bigram_coefficient(tokens, w1, w2):
    c1 = tokens.count(w1)
    c2 = tokens.count(w2)
    if c1 + c2 == 0:
        return 0.0
    observed = sum(1 for i in range(len(tokens) - 1) if tokens[i] == w1 and tokens[i + 1] == w2)
    return 2 * observed / (c1 + c2)`,
    testCases: [
      { input: [["new", "york", "new", "york", "city"], "new", "york"], expected: 1.0 },
      { input: [["the", "cat", "sat", "on", "the", "mat"], "the", "cat"], expected: 0.6666666666666666 },
      { input: [["a", "b", "c"], "b", "a"], expected: 0.0 },
      { input: [[], "a", "b"], expected: 0.0 },
    ],
    hint: "The coefficient is maximal when every occurrence of either word forms the bigram.",
  },
  {
    id: "nlp-063",
    title: "Skip-gram Context Pairs",
    category: "NLP",
    difficulty: "Medium",
    description:
      "For each center position i, pair tokens[i] with every token inside the window [i - w, i + w] except itself, scanning contexts left to right.\n\nReturn the pairs as two-element lists in center-then-context order. A window size w <= 0 yields an empty list.",
    starterCode: `def skipgram_pairs(tokens, w):
    # Your code here
    pass`,
    solution: `def skipgram_pairs(tokens, w):
    pairs = []
    if w <= 0:
        return pairs
    n = len(tokens)
    for i in range(n):
        lo = max(0, i - w)
        hi = min(n, i + w + 1)
        for j in range(lo, hi):
            if j != i:
                pairs.append([tokens[i], tokens[j]])
    return pairs`,
    testCases: [
      {
        input: [["a", "b", "c"], 1],
        expected: [["a", "b"], ["b", "a"], ["b", "c"], ["c", "b"]],
      },
      { input: [["a", "b"], 2], expected: [["a", "b"], ["b", "a"]] },
      { input: [["x"], 1], expected: [] },
      { input: [["a", "b", "c"], 0], expected: [] },
    ],
    hint: "Clamp the window edges to the sequence and skip the center itself.",
  },
  {
    id: "nlp-064",
    title: "CBOW Average Context Vector",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the element-wise average of a list of context vectors.\n\nAll vectors are assumed to have the same length. Return an empty list when there are no vectors.",
    starterCode: `def cbow_average(context_vectors):
    # Your code here
    pass`,
    solution: `def cbow_average(context_vectors):
    if not context_vectors:
        return []
    d = len(context_vectors[0])
    return [sum(v[k] for v in context_vectors) / len(context_vectors) for k in range(d)]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]]], expected: [2.0, 3.0] },
      { input: [[[1.0, 1.0, 1.0]]], expected: [1.0, 1.0, 1.0] },
      { input: [[]], expected: [] },
      { input: [[[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]], expected: [0.6666666666666666, 0.6666666666666666] },
    ],
    hint: "Average each coordinate independently across all context vectors.",
  },
  {
    id: "nlp-065",
    title: "Negative Sampling Probability",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the negative-sampling distribution over vocabulary items with the given counts: p_i = count_i ** 0.75 divided by the sum of count ** 0.75 over all items.\n\nReturn an empty list for empty input, and all zeros when every count is 0.",
    starterCode: `def negative_sampling_prob(counts):
    # Your code here
    pass`,
    solution: `def negative_sampling_prob(counts):
    if not counts:
        return []
    powered = [c ** 0.75 for c in counts]
    total = sum(powered)
    if total == 0:
        return [0.0 for c in counts]
    return [p / total for p in powered]`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [[4, 1]], expected: [0.7387961250362586, 0.2612038749637414] },
      { input: [[]], expected: [] },
      { input: [[0, 1]], expected: [0.0, 1.0] },
      { input: [[9]], expected: [1.0] },
    ],
    hint: "The 0.75 power flattens frequent words before normalizing.",
  },
  {
    id: "nlp-066",
    title: "Word2Vec Analogy",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Solve a word analogy by vector arithmetic. Compute target = vectors[a] - vectors[b] + vectors[c], then return the word not equal to a, b, or c whose vector has the highest cosine similarity with target.\n\nBreak ties alphabetically and return an empty string when there are no candidates.",
    starterCode: `import math
def word_analogy(a, b, c, vectors):
    # Your code here
    pass`,
    solution: `import math
def word_analogy(a, b, c, vectors):
    target = [x - y + z for x, y, z in zip(vectors[a], vectors[b], vectors[c])]
    best = ""
    best_sim = -2.0
    for w in sorted(vectors):
        if w == a or w == b or w == c:
            continue
        v = vectors[w]
        dot = sum(x * y for x, y in zip(target, v))
        nt = sum(x * x for x in target) ** 0.5
        nv = sum(y * y for y in v) ** 0.5
        sim = dot / (nt * nv) if nt > 0 and nv > 0 else 0.0
        if sim > best_sim:
            best = w
            best_sim = sim
    return best`,
    testCases: [
      {
        input: [
          "king",
          "man",
          "woman",
          { king: [1.0, 1.0], man: [1.0, 0.0], woman: [0.0, 1.0], queen: [0.0, 2.0], apple: [-1.0, -1.0] },
        ],
        expected: "queen",
      },
      {
        input: [
          "man",
          "king",
          "queen",
          { king: [1.0, 1.0], man: [1.0, 0.0], woman: [0.0, 1.0], queen: [0.0, 2.0], apple: [-1.0, -1.0] },
        ],
        expected: "woman",
      },
      {
        input: [
          "king",
          "man",
          "apple",
          { king: [1.0, 1.0], man: [1.0, 0.0], woman: [0.0, 1.0], queen: [0.0, 2.0], apple: [-1.0, -1.0] },
        ],
        expected: "queen",
      },
      {
        input: [
          "king",
          "man",
          "woman",
          { king: [1.0, 0.0], man: [1.0, 0.0], woman: [1.0, 0.0], queen: [1.0, 0.0] },
        ],
        expected: "queen",
      },
    ],
    hint: "Build the analogy vector, then rerank every word that is not one of the three inputs.",
  },
  {
    id: "nlp-067",
    title: "Top-k Embedding Cosine Ranking",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Score every word in vectors by cosine similarity with query, sort by descending similarity with alphabetical tie-breaking, and return the top k as [word, similarity] pairs.\n\nReturn an empty list when k <= 0 or vectors is empty.",
    starterCode: `import math
def embedding_cosine_ranking_topk(query, vectors, k):
    # Your code here
    pass`,
    solution: `import math
def embedding_cosine_ranking_topk(query, vectors, k):
    if k <= 0:
        return []
    scored = []
    nq = sum(a * a for a in query) ** 0.5
    for w in vectors:
        v = vectors[w]
        dot = sum(a * b for a, b in zip(query, v))
        nv = sum(b * b for b in v) ** 0.5
        sim = dot / (nq * nv) if nq > 0 and nv > 0 else 0.0
        scored.append((w, sim))
    scored.sort(key=lambda p: (-p[1], p[0]))
    return [[w, s] for w, s in scored[:k]]`,
    testCases: [
      {
        input: [[1.0, 0.0], { a: [1.0, 0.0], b: [0.0, 1.0], c: [1.0, 1.0], d: [-1.0, 0.0] }, 2],
        expected: [["a", 1.0], ["c", 0.7071067811865475]],
      },
      {
        input: [[1.0, 0.0], { a: [1.0, 0.0], b: [0.0, 1.0], c: [1.0, 1.0], d: [-1.0, 0.0] }, 0],
        expected: [],
      },
      {
        input: [[1.0, 0.0], { a: [1.0, 0.0], b: [0.0, 1.0], c: [1.0, 1.0], d: [-1.0, 0.0] }, 10],
        expected: [["a", 1.0], ["c", 0.7071067811865475], ["b", 0.0], ["d", -1.0]],
      },
      {
        input: [[0.0, 0.0], { a: [1.0, 0.0], b: [0.0, 1.0], c: [1.0, 1.0], d: [-1.0, 0.0] }, 4],
        expected: [["a", 0.0], ["b", 0.0], ["c", 0.0], ["d", 0.0]],
      },
      { input: [[1.0, 0.0], {}, 2], expected: [] },
    ],
    hint: "A zero query has no direction, so every similarity is defined as 0.0.",
  },
  {
    id: "nlp-068",
    title: "Positional Embedding Addition",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the element-wise sum of a token embedding and a positional embedding.\n\nThe two lists are assumed to have equal length, and zipping truncates to the shorter one.",
    starterCode: `def positional_embedding_add(token_emb, pos_emb):
    # Your code here
    pass`,
    solution: `def positional_embedding_add(token_emb, pos_emb):
    return [a + b for a, b in zip(token_emb, pos_emb)]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 0.5]], expected: [1.5, 2.5] },
      { input: [[0.0, 0.0], [-1.0, 1.0]], expected: [-1.0, 1.0] },
      { input: [[1.0], [2.0]], expected: [3.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "A list comprehension over zip adds corresponding coordinates.",
  },
  {
    id: "nlp-069",
    title: "Transformer Block Parameter Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the parameter count of one transformer block. Count four d_model x d_model attention projections with biases, a feed-forward network d_model -> d_ff -> d_model with biases, and two layer norms each with a weight and a bias of size d_model.\n\nThat is 4*d^2 + 4*d + (d*d_ff + d_ff) + (d_ff*d + d) + 4*d.",
    starterCode: `def transformer_block_param_count(d_model, d_ff):
    # Your code here
    pass`,
    solution: `def transformer_block_param_count(d_model, d_ff):
    return 4 * d_model * d_model + 4 * d_model + 2 * d_model * d_ff + d_ff + d_model + 4 * d_model`,
    testCases: [
      { input: [4, 16], expected: 244 },
      { input: [8, 32], expected: 872 },
      { input: [1, 1], expected: 16 },
      { input: [768, 3072], expected: 7087872 },
    ],
    hint: "Add the FFN terms as two matrix products plus their bias vectors.",
  },
  {
    id: "nlp-070",
    title: "Multi-Head Attention Parameter Count",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the parameter count of the attention projections: query, key, value, and output projections, each d_model x d_model with a bias vector.\n\nThat is 4 * d_model ** 2 + 4 * d_model.",
    starterCode: `def multihead_attention_param_count(d_model):
    # Your code here
    pass`,
    solution: `def multihead_attention_param_count(d_model):
    return 4 * d_model * d_model + 4 * d_model`,
    testCases: [
      { input: [4], expected: 80 },
      { input: [8], expected: 288 },
      { input: [1], expected: 8 },
      { input: [768], expected: 2362368 },
    ],
    hint: "Each of the four projections contributes d squared weights plus d biases.",
  },
  {
    id: "nlp-071",
    title: "Attention Head Concatenation Shape",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the shape [seq_len, n_heads * d_head] produced by concatenating n_heads attention heads of width d_head over a sequence of length seq_len.",
    starterCode: `def head_concat_shape(seq_len, n_heads, d_head):
    # Your code here
    pass`,
    solution: `def head_concat_shape(seq_len, n_heads, d_head):
    return [seq_len, n_heads * d_head]`,
    testCases: [
      { input: [5, 2, 4], expected: [5, 8] },
      { input: [1, 1, 1], expected: [1, 1] },
      { input: [10, 8, 64], expected: [10, 512] },
      { input: [0, 2, 3], expected: [0, 6] },
    ],
    hint: "Concatenation keeps the sequence length and sums the head widths.",
  },
  {
    id: "nlp-072",
    title: "Attention Scaling Factor",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the scaled dot-product attention scaling factor 1 / sqrt(d_k).\n\nd_k is the key dimension and is assumed positive.",
    starterCode: `import math
def attention_scaling_factor(d_k):
    # Your code here
    pass`,
    solution: `import math
def attention_scaling_factor(d_k):
    return 1.0 / math.sqrt(d_k)`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [4], expected: 0.5 },
      { input: [2], expected: 0.7071067811865475 },
      { input: [64], expected: 0.125 },
      { input: [16], expected: 0.25 },
    ],
    hint: "The factor grows smaller as the key dimension grows.",
  },
  {
    id: "nlp-073",
    title: "Attention Entropy",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the Shannon entropy -sum(p * log(p)) of a row of attention weights using the natural log.\n\nZero-probability entries contribute nothing, and an empty row yields 0.0.",
    starterCode: `import math
def attention_entropy(weights):
    # Your code here
    pass`,
    solution: `import math
def attention_entropy(weights):
    total = 0.0
    for p in weights:
        if p > 0:
            total -= p * math.log(p)
    return total`,
    testCases: [
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 1.3862943611198906 },
      { input: [[]], expected: 0.0 },
      { input: [[1.0, 0.0, 0.0]], expected: 0.0 },
    ],
    hint: "A peaked attention row has zero entropy; a uniform row is maximally uncertain.",
  },
  {
    id: "nlp-074",
    title: "Attention Row Sums",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the sum of each row of an attention weight matrix as a list, in order.\n\nAn empty matrix yields an empty list.",
    starterCode: `def attention_row_sums(weights):
    # Your code here
    pass`,
    solution: `def attention_row_sums(weights):
    return [sum(row) for row in weights]`,
    testCases: [
      { input: [[[0.5, 0.5], [0.2, 0.8]]], expected: [1.0, 1.0] },
      { input: [[[1.0]]], expected: [1.0] },
      { input: [[]], expected: [] },
      { input: [[[], []]], expected: [0, 0] },
    ],
    hint: "After a valid softmax each row sums to 1.0.",
  },
  {
    id: "nlp-075",
    title: "Softmax with Temperature",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return softmax(logits / temperature), computed with the max-subtraction trick for numerical stability.\n\ntemperature is assumed positive and non-zero. Return an empty list for empty logits.",
    starterCode: `import math
def softmax_temperature(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def softmax_temperature(logits, temperature):
    if not logits:
        return []
    scaled = [x / temperature for x in logits]
    mx = max(scaled)
    exps = [math.exp(s - mx) for s in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1.0, 1.0], 1.0], expected: [0.5, 0.5] },
      {
        input: [[1.0, 2.0, 3.0], 1.0],
        expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
      },
      {
        input: [[1.0, 2.0, 3.0], 0.5],
        expected: [0.015876239976466765, 0.11731042782619838, 0.8668133321973349],
      },
      { input: [[2.0, 2.0], 0.5], expected: [0.5, 0.5] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Low temperature sharpens the distribution; dividing by it amplifies the logits.",
  },
  {
    id: "nlp-076",
    title: "Cross-Attention Scores",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the score matrix Q K^T / sqrt(d) for a list of query vectors and a list of key vectors, where d is the query dimension.\n\nElement (i, j) is the dot product of queries[i] and keys[j] times the scaling factor. Return an empty list when either input is empty.",
    starterCode: `import math
def cross_attention_scores(queries, keys):
    # Your code here
    pass`,
    solution: `import math
def cross_attention_scores(queries, keys):
    if not queries or not keys:
        return []
    d = len(queries[0])
    scale = 1.0 / math.sqrt(d)
    scores = []
    for q in queries:
        row = []
        for k in keys:
            row.append(sum(a * b for a, b in zip(q, k)) * scale)
        scores.append(row)
    return scores`,
    testCases: [
      { input: [[[1.0, 0.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[0.7071067811865475, 0.0]] },
      { input: [[[1.0, 1.0], [0.0, 1.0]], [[1.0, 0.0]]], expected: [[0.7071067811865475], [0.0]] },
      { input: [[[1.0]], [[2.0]]], expected: [[2.0]] },
      { input: [[], [[1.0]]], expected: [] },
      { input: [[[1.0, 0.0]], []], expected: [] },
    ],
    hint: "Compute every query-key dot product, then multiply the whole matrix by the scaling factor.",
  },
  {
    id: "nlp-077",
    title: "Greedy Decoding",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Decode one token per probability row by taking the argmax, breaking ties toward the smallest vocabulary index.\n\nStop before appending eos when the argmax token is eos, and return the generated tokens. An empty probability list yields an empty result.",
    starterCode: `def greedy_decode(vocab, probs, eos):
    # Your code here
    pass`,
    solution: `def greedy_decode(vocab, probs, eos):
    result = []
    for row in probs:
        best_idx = 0
        for i in range(1, len(row)):
            if row[i] > row[best_idx]:
                best_idx = i
        token = vocab[best_idx]
        if token == eos:
            break
        result.append(token)
    return result`,
    testCases: [
      {
        input: [["a", "b", "</s>"], [[0.1, 0.7, 0.2], [0.6, 0.3, 0.1], [0.1, 0.1, 0.8]], "</s>"],
        expected: ["b", "a"],
      },
      { input: [["a", "b", "</s>"], [[0.1, 0.2, 0.7]], "</s>"], expected: [] },
      {
        input: [["a", "b", "</s>"], [[0.5, 0.5, 0.0], [0.2, 0.6, 0.2]], "</s>"],
        expected: ["a", "b"],
      },
      { input: [["x", "y"], [], "z"], expected: [] },
    ],
    hint: "Ties keep the earlier vocabulary index because only strictly greater values replace the best.",
  },
  {
    id: "nlp-078",
    title: "Beam Search (Two Steps)",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Run beam search over step_probs, a list of probability rows aligned with vocab. Start from one empty hypothesis with score 0, extend every beam by every token with positive probability, and keep the top beam_width hypotheses.\n\nRank hypotheses by score descending and then by sequence lexicographically, and return the tokens of the best final sequence.",
    starterCode: `import math
def beam_search_two_steps(vocab, step_probs, beam_width):
    # Your code here
    pass`,
    solution: `import math
def beam_search_two_steps(vocab, step_probs, beam_width):
    beams = [([], 0.0)]
    for row in step_probs:
        candidates = []
        for seq, score in beams:
            for i, p in enumerate(row):
                if p > 0:
                    candidates.append((seq + [vocab[i]], score + math.log(p)))
        candidates.sort(key=lambda x: (-x[1], x[0]))
        beams = candidates[:beam_width]
    beams.sort(key=lambda x: (-x[1], x[0]))
    return beams[0][0]`,
    testCases: [
      { input: [["a", "b"], [[0.6, 0.4], [0.9, 0.1]], 2], expected: ["a", "a"] },
      { input: [["a", "b"], [[0.5, 0.5], [0.02, 0.98]], 1], expected: ["a", "b"] },
      { input: [["a", "b", "c"], [[0.5, 0.3, 0.2], [0.1, 0.2, 0.7]], 2], expected: ["a", "c"] },
      { input: [["a"], [[1.0], [1.0]], 1], expected: ["a", "a"] },
    ],
    hint: "Scores are log probabilities, so they add as sequences grow.",
  },
  {
    id: "nlp-079",
    title: "Top-p (Nucleus) Filtering",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the smallest set of tokens whose probabilities sum to at least p, taken in descending probability order with ties broken by original index.\n\nThe result is a list of [token, probability] pairs in that order. An empty input yields an empty list.",
    starterCode: `def top_p_filtering(tokens, probs, p):
    # Your code here
    pass`,
    solution: `def top_p_filtering(tokens, probs, p):
    order = sorted(range(len(tokens)), key=lambda i: (-probs[i], i))
    kept = []
    cum = 0.0
    for i in order:
        kept.append([tokens[i], probs[i]])
        cum += probs[i]
        if cum >= p:
            break
    return kept`,
    testCases: [
      { input: [["a", "b", "c", "d"], [0.4, 0.3, 0.2, 0.1], 0.5], expected: [["a", 0.4], ["b", 0.3]] },
      {
        input: [["a", "b", "c", "d"], [0.25, 0.25, 0.25, 0.25], 0.5],
        expected: [["a", 0.25], ["b", 0.25]],
      },
      {
        input: [["a", "b", "c", "d"], [0.25, 0.25, 0.25, 0.25], 0.9],
        expected: [["a", 0.25], ["b", 0.25], ["c", 0.25], ["d", 0.25]],
      },
      { input: [["a", "b"], [0.9, 0.1], 0.1], expected: [["a", 0.9]] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "Stop as soon as the running probability mass reaches p.",
  },
  {
    id: "nlp-080",
    title: "Repetition Penalty",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Apply the repetition penalty to a list of logits. For every index in previous, divide a positive logit by penalty or multiply a non-positive logit by penalty, leaving other logits unchanged.\n\nLater duplicates of an index apply the penalty again.",
    starterCode: `def repetition_penalty(logits, previous, penalty):
    # Your code here
    pass`,
    solution: `def repetition_penalty(logits, previous, penalty):
    result = list(logits)
    for i in previous:
        if 0 <= i < len(result):
            if result[i] > 0:
                result[i] = result[i] / penalty
            else:
                result[i] = result[i] * penalty
    return result`,
    testCases: [
      { input: [[1.0, -1.0, 2.0], [0, 2], 2.0], expected: [0.5, -1.0, 1.0] },
      { input: [[2.0, -2.0, 0.0], [0, 1], 1.0], expected: [2.0, -2.0, 0.0] },
      { input: [[4.0, 4.0], [0, 1], 2.0], expected: [2.0, 2.0] },
      { input: [[0.5, -0.5], [0, 1], 2.0], expected: [0.25, -1.0] },
      { input: [[1.0], [], 2.0], expected: [1.0] },
    ],
    hint: "Positive logits are divided and negative logits are multiplied so both move down.",
  },
  {
    id: "nlp-081",
    title: "No-Repeat N-gram Check",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return True when no n-gram occurs more than once in tokens, and False otherwise.\n\nIf n <= 0 or the token list is shorter than n, return True vacuously.",
    starterCode: `def no_repeat_ngram_check(tokens, n):
    # Your code here
    pass`,
    solution: `def no_repeat_ngram_check(tokens, n):
    if n <= 0 or len(tokens) < n:
        return True
    seen = set()
    for i in range(len(tokens) - n + 1):
        gram = tuple(tokens[i:i + n])
        if gram in seen:
            return False
        seen.add(gram)
    return True`,
    testCases: [
      { input: [["a", "b", "a", "b"], 2], expected: false },
      { input: [["a", "b", "c", "a", "b"], 2], expected: false },
      { input: [["a", "b", "c"], 2], expected: true },
      { input: [["a", "a"], 1], expected: false },
      { input: [["a", "b"], 3], expected: true },
    ],
    hint: "Track n-grams in a set of tuples as you slide the window forward.",
  },
  {
    id: "nlp-082",
    title: "Beam Length Normalization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the length-normalized beam score score / (length ** alpha).\n\nReturn 0.0 when length is not positive.",
    starterCode: `def beam_length_normalization(score, length, alpha):
    # Your code here
    pass`,
    solution: `def beam_length_normalization(score, length, alpha):
    if length <= 0:
        return 0.0
    return score / (length ** alpha)`,
    testCases: [
      { input: [-2.0, 2, 1.0], expected: -1.0 },
      { input: [-4.0, 4, 0.5], expected: -2.0 },
      { input: [0.5, 1, 0.7], expected: 0.5 },
      { input: [-3.0, 0, 1.0], expected: 0.0 },
      { input: [-8.0, 2, 2.0], expected: -2.0 },
    ],
    hint: "Dividing a negative log score by a growing length makes it less negative.",
  },
  {
    id: "nlp-083",
    title: "BERT CLS Pooling",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return a copy of the first hidden-state vector, which plays the role of the [CLS] representation.\n\nReturn an empty list for empty hidden states.",
    starterCode: `def cls_pooling(hidden_states):
    # Your code here
    pass`,
    solution: `def cls_pooling(hidden_states):
    if not hidden_states:
        return []
    return list(hidden_states[0])`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]]], expected: [1.0, 2.0] },
      { input: [[[0.5]]], expected: [0.5] },
      { input: [[]], expected: [] },
      { input: [[[1.0, -1.0]]], expected: [1.0, -1.0] },
    ],
    hint: "The [CLS] token always sits at position 0 of the sequence.",
  },
  {
    id: "nlp-084",
    title: "Token Type IDs",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build BERT token type ids for the packed pair [CLS] A [SEP] B [SEP].\n\nReturn len_a + 2 zeros followed by len_b + 1 ones.",
    starterCode: `def token_type_ids(len_a, len_b):
    # Your code here
    pass`,
    solution: `def token_type_ids(len_a, len_b):
    return [0] * (len_a + 2) + [1] * (len_b + 1)`,
    testCases: [
      { input: [3, 2], expected: [0, 0, 0, 0, 0, 1, 1, 1] },
      { input: [1, 1], expected: [0, 0, 0, 1, 1] },
      { input: [0, 0], expected: [0, 0, 1] },
      { input: [2, 0], expected: [0, 0, 0, 0, 1] },
    ],
    hint: "The first [CLS] and [SEP] belong to segment 0; the second [SEP] closes segment 1.",
  },
  {
    id: "nlp-085",
    title: "Seeded MLM Masking",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Select token positions to mask for masked language modeling. Using random.Random(seed), draw one random number per token in order and mask token i when the draw is strictly less than mask_prob.\n\nReturn the sorted list of masked indices, which makes the result reproducible across runs.",
    starterCode: `import random
def mlm_masking_seeded(tokens, mask_prob, seed):
    # Your code here
    pass`,
    solution: `import random
def mlm_masking_seeded(tokens, mask_prob, seed):
    rng = random.Random(seed)
    masked = []
    for i, t in enumerate(tokens):
        if rng.random() < mask_prob:
            masked.append(i)
    return masked`,
    testCases: [
      {
        input: [["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"], 0.5, 42],
        expected: [1, 2, 3, 7, 8, 9],
      },
      {
        input: [["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"], 0.0, 7],
        expected: [],
      },
      {
        input: [["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"], 1.0, 7],
        expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      { input: [["a", "b", "c"], 0.5, 1], expected: [0] },
      { input: [[], 0.5, 1], expected: [] },
    ],
    hint: "random.Random(seed) gives an independent deterministic generator; random() is always below 1.0.",
  },
  {
    id: "nlp-086",
    title: "Next Sentence Pair Labeling",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Convert a list of IsNext flags into BERT NSP labels: 0 when the second segment truly follows the first (flag True) and 1 when it does not (flag False).",
    starterCode: `def nsp_labeling(is_next_flags):
    # Your code here
    pass`,
    solution: `def nsp_labeling(is_next_flags):
    return [0 if flag else 1 for flag in is_next_flags]`,
    testCases: [
      { input: [[true, false, true]], expected: [0, 1, 0] },
      { input: [[false]], expected: [1] },
      { input: [[]], expected: [] },
      { input: [[true, true]], expected: [0, 0] },
    ],
    hint: "The label is the inverse of the IsNext flag in this encoding.",
  },
  {
    id: "nlp-087",
    title: "CLS Classification Head Logits",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the logits W x + b for a classification head, where cls_vector is x, weights is one row per class, and bias is one entry per class.\n\nIterate classes in row order.",
    starterCode: `def cls_classification_logits(cls_vector, weights, bias):
    # Your code here
    pass`,
    solution: `def cls_classification_logits(cls_vector, weights, bias):
    result = []
    for row, b in zip(weights, bias):
        result.append(sum(w * x for w, x in zip(row, cls_vector)) + b)
    return result`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [1.0, 2.0] },
      { input: [[1.0, 1.0], [[1.0, 1.0]], [0.5]], expected: [2.5] },
      { input: [[0.0, 0.0], [[1.0, 2.0], [-1.0, -2.0]], [1.0, -1.0]], expected: [1.0, -1.0] },
      { input: [[], [[1.0]], [0.0]], expected: [0.0] },
    ],
    hint: "Each class row is a dot product with the pooled vector plus its bias.",
  },
  {
    id: "nlp-088",
    title: "Pad Sequences to Batch Maximum",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Pad every sequence on the right with pad_value until it matches the longest sequence in the batch, and return the padded batch.\n\nPreserve element order and return an empty list for an empty batch.",
    starterCode: `def pad_to_batch_max(sequences, pad_value=0):
    # Your code here
    pass`,
    solution: `def pad_to_batch_max(sequences, pad_value=0):
    if not sequences:
        return []
    max_len = max(len(s) for s in sequences)
    return [s + [pad_value] * (max_len - len(s)) for s in sequences]`,
    testCases: [
      { input: [[[1, 2], [3]], 0], expected: [[1, 2], [3, 0]] },
      { input: [[[1], [2]], 9], expected: [[1], [2]] },
      { input: [[[], [1, 2, 3]], 0], expected: [[0, 0, 0], [1, 2, 3]] },
      { input: [[], 0], expected: [] },
    ],
    hint: "Find the maximum length first, then append the difference of pad values.",
  },
  {
    id: "nlp-089",
    title: "Subword Reconstruction",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Reconstruct words from subword tokens. A token starting with '##' continues the previous word, and any other token starts a new word.\n\nReturn the list of reconstructed words.",
    starterCode: `def subword_reconstruction(tokens):
    # Your code here
    pass`,
    solution: `def subword_reconstruction(tokens):
    words = []
    current = ""
    for t in tokens:
        if t.startswith("##"):
            current += t[2:]
        else:
            if current:
                words.append(current)
            current = t
    if current:
        words.append(current)
    return words`,
    testCases: [
      { input: [["play", "##ing"]], expected: ["playing"] },
      { input: [["un", "##want", "##ed"]], expected: ["unwanted"] },
      { input: [["hello", "world"]], expected: ["hello", "world"] },
      { input: [["##ed"]], expected: ["ed"] },
      { input: [[]], expected: [] },
    ],
    hint: "Accumulate continuation pieces into the current word and flush before starting a new one.",
  },
  {
    id: "nlp-090",
    title: "Rule-Based Verb Lemmatization",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Lemmatize a verb with simple rules. Return irregular[word] when present.\n\nOtherwise, for words longer than 5 ending in 'ing' drop the suffix, and for words longer than 4 ending in 'ed' drop the suffix. If the remaining stem ends in a doubled consonant other than 'l' or 's', drop one copy. Words matching no rule are returned unchanged.",
    starterCode: `def rule_based_lemma_verbs(word, irregular):
    # Your code here
    pass`,
    solution: `def rule_based_lemma_verbs(word, irregular):
    if word in irregular:
        return irregular[word]
    if word.endswith("ing") and len(word) > 5:
        stem = word[:-3]
    elif word.endswith("ed") and len(word) > 4:
        stem = word[:-2]
    else:
        return word
    if len(stem) >= 2 and stem[-1] == stem[-2] and stem[-1] not in "ls":
        stem = stem[:-1]
    return stem`,
    testCases: [
      { input: ["running", {}], expected: "run" },
      { input: ["stopped", {}], expected: "stop" },
      { input: ["walked", {}], expected: "walk" },
      { input: ["went", { "went": "go" }], expected: "go" },
      { input: ["called", {}], expected: "call" },
    ],
    hint: "Undoubling happens only for doubled consonants other than l and s.",
  },
  {
    id: "nlp-091",
    title: "Anagram Grouping",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Group words by their anagram signature, the string of lowercased characters sorted alphabetically.\n\nReturn a dictionary mapping each signature to the alphabetically sorted list of its words.",
    starterCode: `def anagram_grouping(words):
    # Your code here
    pass`,
    solution: `def anagram_grouping(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w.lower()))
        if key not in groups:
            groups[key] = []
        groups[key].append(w)
    for key in groups:
        groups[key] = sorted(groups[key])
    return groups`,
    testCases: [
      {
        input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: { aet: ["ate", "eat", "tea"], ant: ["nat", "tan"], abt: ["bat"] },
      },
      { input: [["a", "a"]], expected: { a: ["a", "a"] } },
      { input: [[]], expected: {} },
      { input: [["Listen", "Silent"]], expected: { eilnst: ["Listen", "Silent"] } },
    ],
    hint: "Sorting the lowercase characters of an anagram is invariant.",
  },
  {
    id: "nlp-092",
    title: "ROUGE-2 F1",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Return the bigram-overlap F1 between candidate and reference token lists. Count clipped matches per distinct bigram, then F1 = 2PR/(P+R) with precision = matches / candidate bigrams and recall = matches / reference bigrams.\n\nReturn 0.0 when either list has fewer than two tokens or there are no matches.",
    starterCode: `def rouge2_f1(candidate, reference):
    # Your code here
    pass`,
    solution: `def rouge2_f1(candidate, reference):
    def bigrams(tokens):
        return [tuple(tokens[i:i + 2]) for i in range(len(tokens) - 1)]
    cb = bigrams(candidate)
    rb = bigrams(reference)
    if not cb or not rb:
        return 0.0
    ccount = {}
    for g in cb:
        ccount[g] = ccount.get(g, 0) + 1
    rcount = {}
    for g in rb:
        rcount[g] = rcount.get(g, 0) + 1
    matches = sum(min(ccount[g], rcount[g]) for g in ccount if g in rcount)
    if matches == 0:
        return 0.0
    precision = matches / len(cb)
    recall = matches / len(rb)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "b", "c"]], expected: 1.0 },
      { input: [["a", "b", "c"], ["a", "b", "d"]], expected: 0.5 },
      { input: [["a", "b"], ["c", "d"]], expected: 0.0 },
      { input: [["a"], ["a"]], expected: 0.0 },
      { input: [["a", "b", "c", "d"], ["a", "b", "c"]], expected: 0.8 },
    ],
    hint: "Clipped matching counts each bigram at most as often as it appears in the reference.",
  },
  {
    id: "nlp-093",
    title: "BLEU Brevity Penalty",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Return the BLEU brevity penalty min(1, exp(1 - ref_len / hyp_len)).\n\nReturn 0.0 when hyp_len is 0.",
    starterCode: `import math
def bleu_brevity_penalty(hyp_len, ref_len):
    # Your code here
    pass`,
    solution: `import math
def bleu_brevity_penalty(hyp_len, ref_len):
    if hyp_len <= 0:
        return 0.0
    return min(1.0, math.exp(1 - ref_len / hyp_len))`,
    testCases: [
      { input: [10, 10], expected: 1.0 },
      { input: [5, 10], expected: 0.36787944117144233 },
      { input: [10, 5], expected: 1.0 },
      { input: [0, 5], expected: 0.0 },
      { input: [1, 1], expected: 1.0 },
    ],
    hint: "The penalty only bites when the hypothesis is shorter than the reference.",
  },
  {
    id: "nlp-094",
    title: "chrF-lite Character F-score",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Return the character unigram F1 between candidate and reference strings. Count clipped per-character matches, then F1 = 2PR/(P+R) with precision = matches / len(candidate) and recall = matches / len(reference).\n\nReturn 0.0 when both strings are empty or there are no matches.",
    starterCode: `def chrf_lite(candidate, reference):
    # Your code here
    pass`,
    solution: `def chrf_lite(candidate, reference):
    if not candidate and not reference:
        return 0.0
    ccount = {}
    for ch in candidate:
        ccount[ch] = ccount.get(ch, 0) + 1
    rcount = {}
    for ch in reference:
        rcount[ch] = rcount.get(ch, 0) + 1
    matches = sum(min(ccount[ch], rcount[ch]) for ch in ccount if ch in rcount)
    if matches == 0:
        return 0.0
    precision = matches / len(candidate)
    recall = matches / len(reference)
    return 2 * precision * recall / (precision + recall)`,
    testCases: [
      { input: ["abc", "abc"], expected: 1.0 },
      { input: ["abc", "abd"], expected: 0.6666666666666666 },
      { input: ["ab", "a"], expected: 0.6666666666666666 },
      { input: ["abc", "xyz"], expected: 0.0 },
      { input: ["aab", "ab"], expected: 0.8 },
    ],
    hint: "Characters are matched with clipping, exactly like a bag-of-words F-score.",
  },
  {
    id: "nlp-095",
    title: "MTLD-lite Lexical Diversity",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Estimate lexical diversity with a simplified MTLD. Scan tokens into segments; whenever a segment's type-token ratio falls to or below threshold, count one factor and start a fresh segment.\n\nClose any leftover segment with partial credit (1 - TTR) / (1 - threshold). Return len(tokens) / factors, or len(tokens) when no factors were counted, and 0.0 for empty input.",
    starterCode: `def mtld_lite(tokens, threshold):
    # Your code here
    pass`,
    solution: `def mtld_lite(tokens, threshold):
    if not tokens:
        return 0.0
    factors = 0
    seg = []
    for t in tokens:
        seg.append(t)
        if len(set(seg)) / len(seg) <= threshold:
            factors += 1
            seg = []
    if seg:
        ttr = len(set(seg)) / len(seg)
        if threshold < 1:
            factors += (1 - ttr) / (1 - threshold)
        else:
            factors += 1.0
    if factors <= 0:
        return float(len(tokens))
    return len(tokens) / factors`,
    testCases: [
      { input: [["a", "b", "c", "d"], 0.72], expected: 4.0 },
      { input: [["a", "a", "a", "a"], 0.72], expected: 2.0 },
      { input: [["a", "b", "a", "c"], 0.72], expected: 4.0 },
      { input: [["a", "b", "c", "a", "b", "c", "a"], 0.72], expected: 7.0 },
      { input: [[], 0.72], expected: 0.0 },
    ],
    hint: "Frequent repetition ends segments sooner, which raises the final score through more factors.",
  },
];
