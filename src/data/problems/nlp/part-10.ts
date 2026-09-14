import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-341",
    title: "Token Jaccard Similarity",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The Jaccard similarity of two token sets is |A intersect B| / |A union B|; define it as 1.0 when both are empty.\n\nGiven two token lists, return the similarity.",
    starterCode: `def token_jaccard_similarity(tokens_a, tokens_b):
    # Your code here
    pass`,
    solution: `def token_jaccard_similarity(tokens_a, tokens_b):
    a = set(tokens_a)
    b = set(tokens_b)
    union = a | b
    if not union:
        return 1.0
    return len(a & b) / len(union)`,
    testCases: [
      { input: [["a", "b"], ["b", "c"]], expected: 0.3333333333333333 },
      { input: [["x"], ["x"]], expected: 1.0 },
      { input: [[], []], expected: 1.0 },
    ],
    hint: "Deduplicate tokens before intersecting.",
  },
  {
    id: "nlp-342",
    title: "Cosine Similarity Sparse Counts",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Treat each token list as a sparse count vector over its vocabulary and compute the cosine similarity dot(A, B) / (||A|| ||B||), returning 0.0 when either norm is zero.\n\nGiven the two token lists, return the similarity.",
    starterCode: `def cosine_similarity_sparse_counts(tokens_a, tokens_b):
    # Your code here
    pass`,
    solution: `def cosine_similarity_sparse_counts(tokens_a, tokens_b):
    import math
    def counts(tokens):
        c = {}
        for t in tokens:
            c[t] = c.get(t, 0) + 1
        return c
    ca = counts(tokens_a)
    cb = counts(tokens_b)
    dot = sum(v * cb.get(k, 0) for k, v in ca.items())
    na = math.sqrt(sum(v * v for v in ca.values()))
    nb = math.sqrt(sum(v * v for v in cb.values()))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)`,
    testCases: [
      { input: [["a", "b"], ["a", "b"]], expected: 0.9999999999999998 },
      { input: [["a"], ["b"]], expected: 0.0 },
      { input: [[], ["x"]], expected: 0.0 },
    ],
    hint: "Only shared tokens contribute to the dot product.",
  },
  {
    id: "nlp-343",
    title: "Edit Distance One Substitution Check",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Two strings of equal length are at substitution distance one when exactly one position differs.\n\nGiven the two strings, return True when the edit script is a single substitution.",
    starterCode: `def edit_distance_one_substitution_check(a, b):
    # Your code here
    pass`,
    solution: `def edit_distance_one_substitution_check(a, b):
    if len(a) != len(b):
        return False
    return sum(1 for x, y in zip(a, b) if x != y) == 1`,
    testCases: [
      { input: ["cat", "cot"], expected: true },
      { input: ["cat", "cat"], expected: false },
      { input: ["cat", "dog"], expected: false },
    ],
    hint: "Count mismatched positions with equal lengths.",
  },
  {
    id: "nlp-344",
    title: "Longest Common Prefix Length",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The longest common prefix length is the number of leading characters shared by two strings.\n\nGiven the two strings, return the length.",
    starterCode: `def longest_common_prefix_length(a, b):
    # Your code here
    pass`,
    solution: `def longest_common_prefix_length(a, b):
    n = 0
    for x, y in zip(a, b):
        if x != y:
            break
        n += 1
    return n`,
    testCases: [
      { input: ["prefix", "prelude"], expected: 3 },
      { input: ["abc", "xyz"], expected: 0 },
      { input: ["same", "same"], expected: 4 },
    ],
    hint: "Stop at the first mismatch.",
  },
  {
    id: "nlp-345",
    title: "Longest Common Suffix Length",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The longest common suffix length counts trailing characters shared by two strings.\n\nGiven the two strings, return the length.",
    starterCode: `def longest_common_suffix_length(a, b):
    # Your code here
    pass`,
    solution: `def longest_common_suffix_length(a, b):
    n = 0
    for x, y in zip(reversed(a), reversed(b)):
        if x != y:
            break
        n += 1
    return n`,
    testCases: [
      { input: ["walking", "talking"], expected: 6 },
      { input: ["abc", "xyz"], expected: 0 },
      { input: ["data", "meta"], expected: 2 },
    ],
    hint: "Compare the strings from the end.",
  },
  {
    id: "nlp-346",
    title: "Edit Distance Substitution Cost Two",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Compute the Levenshtein-style edit distance where insertion and deletion cost 1 but substitution costs 2, using dynamic programming over prefixes.\n\nGiven the two strings, return the distance.",
    starterCode: `def edit_distance_substitution_cost_two(a, b):
    # Your code here
    pass`,
    solution: `def edit_distance_substitution_cost_two(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 2)
    return dp[n][m]`,
    testCases: [
      { input: ["cat", "cot"], expected: 2 },
      { input: ["kitten", "sitting"], expected: 5 },
      { input: ["abc", "abc"], expected: 0 },
    ],
    hint: "Mismatched characters cost 2 when substituted, versus 2 for delete plus insert.",
  },
  {
    id: "nlp-347",
    title: "Multiset Token F1",
    category: "NLP",
    difficulty: "Easy",
    description:
      "For token multisets, the overlap is sum over tokens of min(count_a, count_b). Precision is overlap / len(a), recall is overlap / len(b), and F1 is their harmonic mean.\n\nGiven the two token lists, return F1, or 0.0 when either is empty.",
    starterCode: `def multiset_token_f1(tokens_a, tokens_b):
    # Your code here
    pass`,
    solution: `def multiset_token_f1(tokens_a, tokens_b):
    if not tokens_a or not tokens_b:
        return 0.0
    def counts(tokens):
        c = {}
        for t in tokens:
            c[t] = c.get(t, 0) + 1
        return c
    ca = counts(tokens_a)
    cb = counts(tokens_b)
    overlap = sum(min(v, cb.get(k, 0)) for k, v in ca.items())
    precision = overlap / len(tokens_a)
    recall = overlap / len(tokens_b)
    if precision + recall == 0:
        return 0.0
    return 2.0 * precision * recall / (precision + recall)`,
    testCases: [
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 0.6666666666666666 },
      { input: [["x"], ["y"]], expected: 0.0 },
      { input: [["a"], []], expected: 0.0 },
    ],
    hint: "Count multiplicities rather than using set intersection.",
  },
  {
    id: "nlp-348",
    title: "Bigram Count Dictionary",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Count consecutive token pairs and key them by the two tokens joined with a single space.\n\nGiven the token list, return a dictionary mapping each bigram string to its count.",
    starterCode: `def bigram_count_dictionary(tokens):
    # Your code here
    pass`,
    solution: `def bigram_count_dictionary(tokens):
    counts = {}
    for i in range(len(tokens) - 1):
        key = tokens[i] + " " + tokens[i + 1]
        counts[key] = counts.get(key, 0) + 1
    return counts`,
    testCases: [
      { input: [["a", "b", "a"]], expected: {"a b": 1, "b a": 1} },
      { input: [["x", "x", "x"]], expected: {"x x": 2} },
      { input: [["only"]], expected: {} },
    ],
    hint: "Slide a window of two over the token list.",
  },
  {
    id: "nlp-349",
    title: "Trigram Total Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The number of trigrams in a token list is max(0, len(tokens) - 2).\n\nGiven the token list, return the trigram count.",
    starterCode: `def trigram_total_count(tokens):
    # Your code here
    pass`,
    solution: `def trigram_total_count(tokens):
    return max(0, len(tokens) - 2)`,
    testCases: [
      { input: [["a", "b", "c", "d"]], expected: 2 },
      { input: [["a", "b"]], expected: 0 },
      { input: [[]], expected: 0 },
    ],
    hint: "Each trigram consumes a window of three consecutive tokens.",
  },
  {
    id: "nlp-350",
    title: "Add K Smoothed Log Probability",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Add-k smoothing estimates a probability as (count + k) / (total + k * vocab_size).\n\nGiven the count, the total number of events, k, and the vocabulary size, return the natural log of the smoothed probability.",
    starterCode: `def add_k_smoothed_log_probability(count, total, k, vocab_size):
    # Your code here
    pass`,
    solution: `def add_k_smoothed_log_probability(count, total, k, vocab_size):
    import math
    return math.log((count + k) / (total + k * vocab_size))`,
    testCases: [
      { input: [5, 100, 1, 50], expected: -3.2188758248682006 },
      { input: [0, 10, 1, 5], expected: -2.70805020110221 },
      { input: [30, 1000, 0.1, 100], expected: -3.513180438080475 },
    ],
    hint: "Smooth the numerator and denominator before taking the log.",
  },
  {
    id: "nlp-351",
    title: "Laplace Smoothed Unigram Probability",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Laplace smoothing for a unigram adds one to every count: (count + 1) / (total_tokens + vocab_size).\n\nGiven the token count, the total tokens, and the vocabulary size, return the probability.",
    starterCode: `def laplace_smoothed_unigram_probability(count, total_tokens, vocab_size):
    # Your code here
    pass`,
    solution: `def laplace_smoothed_unigram_probability(count, total_tokens, vocab_size):
    return (count + 1) / (total_tokens + vocab_size)`,
    testCases: [
      { input: [5, 100, 50], expected: 0.04 },
      { input: [0, 10, 5], expected: 0.06666666666666667 },
      { input: [30, 1000, 100], expected: 0.028181818181818183 },
    ],
    hint: "Every word in the vocabulary gets one pseudo-count.",
  },
  {
    id: "nlp-352",
    title: "Perplexity from Log Probabilities",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Perplexity is exp(-mean(log probabilities)) over the observed tokens.\n\nGiven the list of per-token log probabilities (natural log), return the perplexity.",
    starterCode: `def perplexity_from_log_probabilities(log_probs):
    # Your code here
    pass`,
    solution: `def perplexity_from_log_probabilities(log_probs):
    import math
    return math.exp(-sum(log_probs) / len(log_probs))`,
    testCases: [
      { input: [[-1.0, -2.0, -3.0]], expected: 7.38905609893065 },
      { input: [[0.0, 0.0]], expected: 1.0 },
      { input: [[-0.6931471805599453, -0.6931471805599453]], expected: 2.0 },
    ],
    hint: "Average the negative log-likelihood and exponentiate.",
  },
  {
    id: "nlp-353",
    title: "Interpolated Bigram Probability",
    category: "NLP",
    difficulty: "Hard",
    description:
      "Interpolated language modeling mixes bigram and unigram estimates: lam * (bigram_count / bigram_total) + (1 - lam) * (unigram_count / unigram_total).\n\nGiven lam, the counts and totals for the bigram and unigram tables, return the probability.",
    starterCode: `def interpolated_bigram_probability(lam, bigram_count, bigram_total, unigram_count, unigram_total):
    # Your code here
    pass`,
    solution: `def interpolated_bigram_probability(lam, bigram_count, bigram_total, unigram_count, unigram_total):
    return lam * (bigram_count / bigram_total) + (1.0 - lam) * (unigram_count / unigram_total)`,
    testCases: [
      { input: [0.7, 10, 100, 20, 1000], expected: 0.076 },
      { input: [0.5, 0, 50, 5, 500], expected: 0.005 },
      { input: [1.0, 4, 8, 1, 100], expected: 0.5 },
    ],
    hint: "The mixing weight trades specificity for coverage.",
  },
  {
    id: "nlp-354",
    title: "Unigram Sentence Log Probability",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Under a unigram model, the sentence log probability is the sum of the log probabilities of its tokens. Return None when any token is missing from the table.\n\nGiven the tokens and a probability table keyed by token strings, return the log probability.",
    starterCode: `def unigram_sentence_log_probability(tokens, probs):
    # Your code here
    pass`,
    solution: `def unigram_sentence_log_probability(tokens, probs):
    import math
    total = 0.0
    for t in tokens:
        if t not in probs:
            return None
        total += math.log(probs[t])
    return total`,
    testCases: [
      { input: [["a", "b"], {"a": 0.5, "b": 0.5}], expected: -1.3862943611198906 },
      { input: [["a"], {"a": 0.25}], expected: -1.3862943611198906 },
      { input: [["a"], {"b": 1.0}], expected: null },
    ],
    hint: "Logs turn the product of probabilities into a sum.",
  },
  {
    id: "nlp-355",
    title: "Backoff Probability with Floor",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Backoff uses the bigram maximum likelihood estimate when the bigram was seen, and scales the unigram probability by alpha otherwise: count / total when count > 0 else alpha * unigram_probability.\n\nGiven the bigram count and total, the unigram probability, and alpha, return the probability.",
    starterCode: `def backoff_probability_with_floor(bigram_count, bigram_total, unigram_probability, alpha):
    # Your code here
    pass`,
    solution: `def backoff_probability_with_floor(bigram_count, bigram_total, unigram_probability, alpha):
    if bigram_count > 0:
        return bigram_count / bigram_total
    return alpha * unigram_probability`,
    testCases: [
      { input: [5, 100, 0.01, 0.4], expected: 0.05 },
      { input: [0, 100, 0.01, 0.4], expected: 0.004 },
      { input: [1, 4, 0.5, 0.1], expected: 0.25 },
    ],
    hint: "Only unseen bigrams fall back to the lower order.",
  },
  {
    id: "nlp-356",
    title: "Most Similar Token by Cosine",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Given a target vector and a dictionary of candidate name to vector, return the candidate name with the highest cosine similarity. Return None when the dictionary is empty.\n\nGiven the target vector and candidates, return the best name.",
    starterCode: `def most_similar_token_by_cosine(target, candidates):
    # Your code here
    pass`,
    solution: `def most_similar_token_by_cosine(target, candidates):
    import math
    def norm(v):
        return math.sqrt(sum(x * x for x in v))
    tn = norm(target)
    best_name = None
    best_score = None
    for name, vec in candidates.items():
        vn = norm(vec)
        if tn == 0.0 or vn == 0.0:
            score = 0.0
        else:
            score = sum(a * b for a, b in zip(target, vec)) / (tn * vn)
        if best_score is None or score > best_score:
            best_score = score
            best_name = name
    return best_name`,
    testCases: [
      { input: [[1, 0], {"x": [1, 0], "y": [0, 1]}], expected: "x" },
      { input: [[1, 1], {"a": [1, 0], "b": [1, 1]}], expected: "b" },
      { input: [[1, 0], {}], expected: null },
    ],
    hint: "Score each candidate and track the best name.",
  },
  {
    id: "nlp-357",
    title: "Dice Bigram Similarity Characters",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The character bigram Dice coefficient is 2 |B(A) intersect B(B)| / (|B(A)| + |B(B)|) over bigram sets, with 1.0 when both strings are shorter than two characters.\n\nGiven the two strings, return the coefficient.",
    starterCode: `def dice_bigram_similarity_characters(a, b):
    # Your code here
    pass`,
    solution: `def dice_bigram_similarity_characters(a, b):
    ba = {a[i:i + 2] for i in range(len(a) - 1)}
    bb = {b[i:i + 2] for i in range(len(b) - 1)}
    if not ba and not bb:
        return 1.0
    return 2.0 * len(ba & bb) / (len(ba) + len(bb))`,
    testCases: [
      { input: ["night", "nacht"], expected: 0.25 },
      { input: ["ab", "ab"], expected: 1.0 },
      { input: ["a", "b"], expected: 1.0 },
    ],
    hint: "Build bigram sets first, then apply Dice.",
  },
  {
    id: "nlp-358",
    title: "Weighted Jaccard Token Similarity",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The weighted Jaccard (Ruzicka) similarity of two token multisets is sum_t min(count_a, count_b) / sum_t max(count_a, count_b); define it as 1.0 when both multisets are empty.\n\nGiven two token lists, return the similarity.",
    starterCode: `def weighted_jaccard_token_similarity(tokens_a, tokens_b):
    # Your code here
    pass`,
    solution: `def weighted_jaccard_token_similarity(tokens_a, tokens_b):
    def counts(tokens):
        c = {}
        for t in tokens:
            c[t] = c.get(t, 0) + 1
        return c
    ca = counts(tokens_a)
    cb = counts(tokens_b)
    keys = set(ca) | set(cb)
    if not keys:
        return 1.0
    num = sum(min(ca.get(k, 0), cb.get(k, 0)) for k in keys)
    den = sum(max(ca.get(k, 0), cb.get(k, 0)) for k in keys)
    return num / den`,
    testCases: [
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 0.5 },
      { input: [["x"], ["y"]], expected: 0.0 },
      { input: [[], []], expected: 1.0 },
    ],
    hint: "Weight by counts and compare min against max per token.",
  },
  {
    id: "nlp-359",
    title: "Weighted Edit Distance Costs",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute edit distance with configurable substitution cost: insertion and deletion cost 1, substitution costs sub_cost when characters differ.\n\nGiven the two strings and sub_cost, return the distance.",
    starterCode: `def weighted_edit_distance_costs(a, b, sub_cost):
    # Your code here
    pass`,
    solution: `def weighted_edit_distance_costs(a, b, sub_cost):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + sub_cost)
    return dp[n][m]`,
    testCases: [
      { input: ["cat", "cot", 1], expected: 1 },
      { input: ["cat", "cot", 2], expected: 2 },
      { input: ["ab", "ba", 1], expected: 2 },
    ],
    hint: "Substitution competes with delete plus insert.",
  },
  {
    id: "nlp-360",
    title: "Normalized Levenshtein Similarity",
    category: "NLP",
    difficulty: "Easy",
    description:
      "The normalized Levenshtein similarity is 1 - distance / max(len(a), len(b)), with 1.0 when both strings are empty.\n\nGiven the two strings, return the similarity using the standard unit-cost edit distance.",
    starterCode: `def normalized_levenshtein_similarity(a, b):
    # Your code here
    pass`,
    solution: `def normalized_levenshtein_similarity(a, b):
    n, m = len(a), len(b)
    if n == 0 and m == 0:
        return 1.0
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1)
    return 1.0 - dp[n][m] / max(n, m)`,
    testCases: [
      { input: ["cat", "cot"], expected: 0.6666666666666667 },
      { input: ["abc", "abc"], expected: 1.0 },
      { input: ["", ""], expected: 1.0 },
    ],
    hint: "Normalize the distance by the longer string length.",
  },
];
