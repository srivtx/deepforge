import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-316",
    title: "Surprisal of a Sequence",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the total surprisal in bits of a sequence of event probabilities. The surprisal of a single event is -log2(p), and zero-probability events contribute nothing to the total. Return 0.0 for an empty list, and assume each probability lies in [0, 1].",
    starterCode: `import math
def sequence_surprisal(probs):
    # Your code here
    pass`,
    solution: `import math
def sequence_surprisal(probs):
    total = 0.0
    for p in probs:
        if p > 0.0:
            total -= math.log2(p)
    return total`,
    testCases: [
      { input: [[0.5, 0.25, 0.125]], expected: 6.0 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.5, 0.5]], expected: 2.0 },
      { input: [[0.0, 1.0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Add up the surprisal of every event, skipping zeros.",
  },
  {
    id: "info-317",
    title: "Even Parity Codeword",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Append an even parity bit to a list of bits. The parity bit is 1 when the number of ones is odd, so the total number of ones in the returned list is always even. Return the new list with the parity bit at the end.",
    starterCode: `def even_parity_codeword(bits):
    # Your code here
    pass`,
    solution: `def even_parity_codeword(bits):
    return list(bits) + [sum(bits) % 2]`,
    testCases: [
      { input: [[1, 0, 1]], expected: [1, 0, 1, 0] },
      { input: [[1, 1, 0]], expected: [1, 1, 0, 0] },
      { input: [[]], expected: [0] },
      { input: [[1]], expected: [1, 1] },
      { input: [[0, 0, 0, 0]], expected: [0, 0, 0, 0, 0] },
    ],
    hint: "Count the ones and append 1 when that count is odd.",
  },
  {
    id: "info-318",
    title: "Hamming Weight of a Codeword",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Hamming weight of a bit list, which is the number of entries equal to 1. The input is a list of 0/1 integers. Return 0 for an empty list.",
    starterCode: `def hamming_weight(bits):
    # Your code here
    pass`,
    solution: `def hamming_weight(bits):
    count = 0
    for b in bits:
        if b == 1:
            count += 1
    return count`,
    testCases: [
      { input: [[1, 0, 1, 1]], expected: 3 },
      { input: [[]], expected: 0 },
      { input: [[0, 0]], expected: 0 },
      { input: [[1, 1]], expected: 2 },
      { input: [[0, 1, 0, 1, 0]], expected: 2 },
    ],
    hint: "Iterate once and count the bits that are equal to 1.",
  },
  {
    id: "info-319",
    title: "Gini Impurity of Labels",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the Gini impurity of a list of labels, defined as 1 - sum(p_i^2) where p_i is the empirical frequency of each distinct label. Return 0.0 for an empty list.",
    starterCode: `def gini_impurity(labels):
    # Your code here
    pass`,
    solution: `def gini_impurity(labels):
    if not labels:
        return 0.0
    n = len(labels)
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    total = 0.0
    for c in counts.values():
        p = c / n
        total += p * p
    return 1.0 - total`,
    testCases: [
      { input: [["a", "b"]], expected: 0.5 },
      { input: [["a", "a", "b", "b"]], expected: 0.5 },
      { input: [["a", "a", "a"]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [["a", "b", "c", "c"]], expected: 0.625 },
    ],
    hint: "Count each label, square the frequencies, and subtract from one.",
  },
  {
    id: "info-320",
    title: "Majority Label of a Node",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the most frequent label in a list, breaking ties by choosing the lexicographically smallest label. Return an empty string for an empty list.",
    starterCode: `def majority_label(labels):
    # Your code here
    pass`,
    solution: `def majority_label(labels):
    if not labels:
        return ""
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    best = None
    best_count = -1
    for label in sorted(counts):
        if counts[label] > best_count:
            best = label
            best_count = counts[label]
    return best`,
    testCases: [
      { input: [["a", "b", "a"]], expected: "a" },
      { input: [["b", "a"]], expected: "a" },
      { input: [[]], expected: "" },
      { input: [["c", "b", "c", "b"]], expected: "b" },
      { input: [["z"]], expected: "z" },
    ],
    hint: "Track counts, then compare count and label together.",
  },
  {
    id: "info-321",
    title: "Misclassification Error of a Node",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the misclassification error of a label list, defined as 1 - max(p_i) where p_i is the empirical frequency of each distinct label. Return 0.0 for an empty list.",
    starterCode: `def misclassification_error(labels):
    # Your code here
    pass`,
    solution: `def misclassification_error(labels):
    if not labels:
        return 0.0
    n = len(labels)
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return 1.0 - max(counts.values()) / n`,
    testCases: [
      { input: [["a", "a", "b"]], expected: 0.33333333333333337 },
      { input: [["a", "b"]], expected: 0.5 },
      { input: [["a", "a"]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [["a", "a", "a", "b"]], expected: 0.25 },
    ],
    hint: "The error is the fraction of samples not belonging to the majority class.",
  },
  {
    id: "info-322",
    title: "Code Redundancy Fraction",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the redundancy fraction of a code, (L - H) / L, where H is the source entropy in bits and L is the expected codeword length. Probabilities are normalized before use and zero-probability symbols are skipped. Return 0.0 when L equals 0.",
    starterCode: `import math
def code_redundancy(probs, lengths):
    # Your code here
    pass`,
    solution: `import math
def code_redundancy(probs, lengths):
    total = float(sum(probs))
    if total <= 0.0:
        return 0.0
    p = [x / total for x in probs]
    h = 0.0
    l_avg = 0.0
    for pi, li in zip(p, lengths):
        if pi > 0.0:
            h -= pi * math.log2(pi)
        l_avg += pi * li
    if l_avg == 0.0:
        return 0.0
    return (l_avg - h) / l_avg`,
    testCases: [
      { input: [[0.5, 0.25, 0.25], [1, 2, 2]], expected: 0.0 },
      { input: [[0.5, 0.5], [1, 2]], expected: 0.3333333333333333 },
      { input: [[1.0], [0]], expected: 0.0 },
      { input: [[1, 1], [2, 2]], expected: 0.5 },
    ],
    hint: "Compute H and L over the normalized probabilities, then divide the gap by L.",
  },
  {
    id: "info-323",
    title: "Code Efficiency Ratio",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the efficiency of a code as H / L, the ratio of the source entropy in bits to the expected codeword length. Probabilities are normalized before use and zero-probability symbols are skipped. Return 1.0 when L equals 0, which covers the single-symbol case.",
    starterCode: `import math
def code_efficiency(probs, lengths):
    # Your code here
    pass`,
    solution: `import math
def code_efficiency(probs, lengths):
    total = float(sum(probs))
    if total <= 0.0:
        return 1.0
    p = [x / total for x in probs]
    h = 0.0
    l_avg = 0.0
    for pi, li in zip(p, lengths):
        if pi > 0.0:
            h -= pi * math.log2(pi)
        l_avg += pi * li
    if l_avg == 0.0:
        return 1.0
    return h / l_avg`,
    testCases: [
      { input: [[0.25, 0.25, 0.25, 0.25], [2, 2, 2, 2]], expected: 1.0 },
      { input: [[0.5, 0.5], [1, 2]], expected: 0.6666666666666666 },
      { input: [[1.0], [0]], expected: 1.0 },
      { input: [[1, 3], [1, 2]], expected: 0.46358749969093305 },
    ],
    hint: "Efficiency is entropy divided by expected length, never above 1 by Shannon's bound.",
  },
  {
    id: "info-324",
    title: "Huffman Maximum Codeword Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Build a Huffman code from a list of symbol frequencies using a min-heap keyed by frequency and then insertion order, and return the longest codeword length. Return 0 when fewer than two symbols are present.",
    starterCode: `import heapq
def huffman_max_length(freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_max_length(freqs):
    if len(freqs) <= 1:
        return 0
    lengths = [0] * len(freqs)
    heap = [(f, i, [i]) for i, f in enumerate(freqs)]
    heapq.heapify(heap)
    order = len(freqs)
    while len(heap) > 1:
        w1, _, a = heapq.heappop(heap)
        w2, _, b = heapq.heappop(heap)
        for idx in a + b:
            lengths[idx] += 1
        heapq.heappush(heap, (w1 + w2, order, a + b))
        order += 1
    return max(lengths)`,
    testCases: [
      { input: [[5, 2, 1]], expected: 2 },
      { input: [[1, 1, 1, 1]], expected: 2 },
      { input: [[8]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[3, 3, 3, 1, 1]], expected: 3 },
    ],
    hint: "Repeatedly merge the two lightest subtrees and track how deep each original symbol ends up.",
  },
  {
    id: "info-325",
    title: "Perplexity Ratio of Two Models",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Given two lists of per-token negative log-likelihoods in nats, return the perplexity ratio of model B over model A. The ratio equals exp(mean(NLL_B) - mean(NLL_A)). Return 1.0 if either list is empty.",
    starterCode: `import math
def perplexity_ratio(nll_a, nll_b):
    # Your code here
    pass`,
    solution: `import math
def perplexity_ratio(nll_a, nll_b):
    if not nll_a or not nll_b:
        return 1.0
    mean_a = sum(nll_a) / len(nll_a)
    mean_b = sum(nll_b) / len(nll_b)
    return math.exp(mean_b - mean_a)`,
    testCases: [
      { input: [[1.0, 1.0], [2.0, 2.0]], expected: 2.718281828459045 },
      { input: [[0.0, 0.0], [0.0, 0.0]], expected: 1.0 },
      { input: [[2.0], [0.0]], expected: 0.1353352832366127 },
      { input: [[], [1.0]], expected: 1.0 },
      { input: [[1.0, 3.0], [2.0, 2.0]], expected: 1.0 },
    ],
    hint: "Perplexity is exp of the mean negative log-likelihood, so the ratio is exp of the difference of means.",
  },
  {
    id: "info-326",
    title: "Entropy of a Zipf Source",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the entropy in bits of a Zipf distribution over n symbols, where the probability of rank i is proportional to 1/i. Return 0.0 for n <= 0.",
    starterCode: `import math
def zipf_entropy(n):
    # Your code here
    pass`,
    solution: `import math
def zipf_entropy(n):
    if n <= 0:
        return 0.0
    weights = [1.0 / i for i in range(1, n + 1)]
    total = sum(weights)
    h = 0.0
    for w in weights:
        p = w / total
        h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 0.9182958340544896 },
      { input: [4], expected: 1.7924876891689534 },
      { input: [10], expected: 2.876453681363911 },
      { input: [0], expected: 0.0 },
    ],
    hint: "Build the unnormalized weights 1/i, normalize by their sum, then take the Shannon entropy.",
  },
  {
    id: "info-327",
    title: "Jensen-Shannon Distance",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the Jensen-Shannon distance between two distributions, the square root of the Jensen-Shannon divergence in bits. The divergence is 0.5*KL(p||m) + 0.5*KL(q||m) with the mixture m = (p + q)/2, and zero entries are skipped.",
    starterCode: `import math
def js_distance(p, q):
    # Your code here
    pass`,
    solution: `import math
def js_distance(p, q):
    m = [0.5 * (pi + qi) for pi, qi in zip(p, q)]
    total = 0.0
    for pi, mi in zip(p, m):
        if pi > 0.0 and mi > 0.0:
            total += 0.5 * pi * math.log2(pi / mi)
    for qi, mi in zip(q, m):
        if qi > 0.0 and mi > 0.0:
            total += 0.5 * qi * math.log2(qi / mi)
    return math.sqrt(total)`,
    testCases: [
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.22089576884901735 },
      { input: [[0.9, 0.1], [0.1, 0.9]], expected: 0.7287004915675019 },
    ],
    hint: "Build the average distribution first, then measure both KL terms relative to it.",
  },
  {
    id: "info-328",
    title: "KL Divergence of Two Bernoullis",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the KL divergence in bits between two Bernoulli distributions with success probabilities p and q. Terms with zero probability follow the convention 0 log 0 = 0, and the function assumes 0 < q < 1.",
    starterCode: `import math
def bernoulli_kl(p, q):
    # Your code here
    pass`,
    solution: `import math
def bernoulli_kl(p, q):
    total = 0.0
    if p > 0.0:
        total += p * math.log2(p / q)
    if p < 1.0:
        total += (1.0 - p) * math.log2((1.0 - p) / (1.0 - q))
    return total`,
    testCases: [
      { input: [0.5, 0.5], expected: 0.0 },
      { input: [0.75, 0.5], expected: 0.18872187554086717 },
      { input: [0.0, 0.5], expected: 1.0 },
      { input: [1.0, 0.25], expected: 2.0 },
      { input: [0.25, 0.75], expected: 0.792481250360578 },
    ],
    hint: "Sum the two contributions p*log2(p/q) and (1-p)*log2((1-p)/(1-q)), skipping zero-probability terms.",
  },
  {
    id: "info-329",
    title: "BSC Rate Feasibility Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True when a rate is achievable on a binary symmetric channel with crossover probability p, that is when rate < 1 - H2(p). The binary entropy H2(p) is 0 when p equals 0 or 1.",
    starterCode: `import math
def bsc_rate_feasible(p, rate):
    # Your code here
    pass`,
    solution: `import math
def bsc_rate_feasible(p, rate):
    if p <= 0.0 or p >= 1.0:
        h = 0.0
    else:
        h = -p * math.log2(p) - (1.0 - p) * math.log2(1.0 - p)
    return rate < 1.0 - h`,
    testCases: [
      { input: [0.1, 0.5], expected: true },
      { input: [0.1, 0.6], expected: false },
      { input: [0.0, 1.0], expected: false },
      { input: [0.5, 0.0], expected: false },
      { input: [0.25, 0.2], expected: false },
    ],
    hint: "Compute the capacity 1 - H2(p) and compare it strictly with the requested rate.",
  },
  {
    id: "info-330",
    title: "Entropy Lower Bound Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Check Shannon's source-coding bound for a set of symbol probabilities and proposed code lengths. Normalize the probabilities and return True when the expected length L is at least the entropy H, allowing a tolerance of 1e-9. Return True for an empty or all-zero distribution.",
    starterCode: `import math
def entropy_bound_holds(probs, lengths):
    # Your code here
    pass`,
    solution: `import math
def entropy_bound_holds(probs, lengths):
    total = float(sum(probs))
    if total <= 0.0:
        return True
    p = [x / total for x in probs]
    h = 0.0
    l_avg = 0.0
    for pi, li in zip(p, lengths):
        if pi > 0.0:
            h -= pi * math.log2(pi)
        l_avg += pi * li
    return l_avg >= h - 1e-9`,
    testCases: [
      { input: [[0.5, 0.5], [1, 2]], expected: true },
      { input: [[0.5, 0.5], [0, 1]], expected: false },
      { input: [[1.0], [0]], expected: true },
      { input: [[1, 1, 1, 1], [1, 1, 1, 1]], expected: false },
      { input: [[0.75, 0.25], [1, 2]], expected: true },
    ],
    hint: "Expected length can never beat the entropy, so violations mean the lengths are impossible.",
  },
  {
    id: "info-331",
    title: "Undetected Error Fraction",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "For a binary linear (n, k) code, return the fraction of nonzero error patterns that pass undetected, which is (2^k - 1)/(2^n - 1). Every nonzero codeword is an undetected error pattern. Assume n >= k >= 1.",
    starterCode: `def undetected_error_fraction(n, k):
    # Your code here
    pass`,
    solution: `def undetected_error_fraction(n, k):
    return (2 ** k - 1) / (2 ** n - 1)`,
    testCases: [
      { input: [7, 4], expected: 0.11811023622047244 },
      { input: [3, 1], expected: 0.14285714285714285 },
      { input: [4, 2], expected: 0.2 },
      { input: [1, 1], expected: 1.0 },
      { input: [8, 4], expected: 0.058823529411764705 },
    ],
    hint: "Undetected patterns are exactly the nonzero codewords out of all nonzero words.",
  },
  {
    id: "info-332",
    title: "Joint Entropy from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the joint entropy H(X, Y) in bits from a 2D table of counts. Normalize by the grand total and skip zero entries in the sum. Return 0.0 for an empty or all-zero table.",
    starterCode: `import math
def joint_entropy_counts(counts):
    # Your code here
    pass`,
    solution: `import math
def joint_entropy_counts(counts):
    total = 0.0
    for row in counts:
        for c in row:
            total += c
    if total <= 0.0:
        return 0.0
    h = 0.0
    for row in counts:
        for c in row:
            if c > 0:
                p = c / total
                h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [[[1, 1], [1, 1]]], expected: 2.0 },
      { input: [[[2, 0], [0, 2]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]]], expected: 1.8464393446710154 },
      { input: [[[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[[3]]], expected: 0.0 },
    ],
    hint: "Convert every cell to a probability and add -p log2 p.",
  },
  {
    id: "info-333",
    title: "Conditional Entropy from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the conditional entropy H(Y|X) in bits from a 2D table of counts, where rows index the values of X and columns the values of Y. Each row contributes its probability mass times the entropy of its conditional distribution. Return 0.0 for an empty or all-zero table.",
    starterCode: `import math
def conditional_entropy_counts(counts):
    # Your code here
    pass`,
    solution: `import math
def conditional_entropy_counts(counts):
    total = 0.0
    for row in counts:
        for c in row:
            total += c
    if total <= 0.0:
        return 0.0
    h = 0.0
    for row in counts:
        row_sum = float(sum(row))
        if row_sum <= 0.0:
            continue
        for c in row:
            if c > 0:
                p = c / total
                h -= p * math.log2(c / row_sum)
    return h`,
    testCases: [
      { input: [[[1, 1], [1, 1]]], expected: 1.0 },
      { input: [[[2, 0], [0, 2]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4]]], expected: 0.965148445440323 },
      { input: [[[0, 0], [0, 0]]], expected: 0.0 },
      { input: [[[3, 1], [1, 3]]], expected: 0.8112781244591329 },
    ],
    hint: "Use H(Y|X) = sum_x p(x) H(Y | X = x), skipping empty rows.",
  },
  {
    id: "info-334",
    title: "Mutual Information from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mutual information I(X; Y) in bits from a 2D table of counts, summing p(x, y) log2(p(x, y) / (p(x) p(y))). Zero rows, zero columns, and zero cells are skipped. Return 0.0 for an empty or all-zero table.",
    starterCode: `import math
def mutual_information_counts(counts):
    # Your code here
    pass`,
    solution: `import math
def mutual_information_counts(counts):
    total = 0.0
    for row in counts:
        for c in row:
            total += c
    if total <= 0.0:
        return 0.0
    row_sums = [float(sum(row)) for row in counts]
    ncols = 0
    for row in counts:
        if len(row) > ncols:
            ncols = len(row)
    col_sums = [0.0] * ncols
    for row in counts:
        for j, c in enumerate(row):
            col_sums[j] += c
    mi = 0.0
    for i, row in enumerate(counts):
        for j, c in enumerate(row):
            if c > 0 and row_sums[i] > 0.0 and col_sums[j] > 0.0:
                p = c / total
                px = row_sums[i] / total
                py = col_sums[j] / total
                mi += p * math.log2(p / (px * py))
    return mi`,
    testCases: [
      { input: [[[1, 1], [1, 1]]], expected: 0.0 },
      { input: [[[2, 0], [0, 2]]], expected: 1.0 },
      { input: [[[1, 2], [3, 4]]], expected: 0.005802149014345795 },
      { input: [[[4, 4], [4, 4]]], expected: 0.0 },
      { input: [[[0, 0], [0, 0]]], expected: 0.0 },
    ],
    hint: "Divide each joint probability by the product of its marginals before taking the logarithm.",
  },
  {
    id: "info-335",
    title: "KL Divergence from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Normalize two count lists into distributions and return the KL divergence D(p||q) in bits. Zero entries of p are skipped and mismatched lengths are truncated to the shorter list. Return 0.0 if either total is zero.",
    starterCode: `import math
def kl_from_counts(p_counts, q_counts):
    # Your code here
    pass`,
    solution: `import math
def kl_from_counts(p_counts, q_counts):
    sp = float(sum(p_counts))
    sq = float(sum(q_counts))
    if sp <= 0.0 or sq <= 0.0:
        return 0.0
    total = 0.0
    for a, b in zip(p_counts, q_counts):
        if a <= 0:
            continue
        p = a / sp
        q = b / sq
        if q <= 0.0:
            return float("inf")
        total += p * math.log2(p / q)
    return total`,
    testCases: [
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[1, 1], [1, 3]], expected: 0.20751874963942185 },
      { input: [[2, 1, 1], [1, 1, 2]], expected: 0.25 },
      { input: [[3, 0], [1, 1]], expected: 1.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "Normalize both count lists first, then sum p*log2(p/q) over the entries of p.",
  },
  {
    id: "info-336",
    title: "JS Divergence from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Normalize two count lists into distributions and return the Jensen-Shannon divergence in bits. The mixture is m = (p + q)/2 and the divergence is 0.5*KL(p||m) + 0.5*KL(q||m). Return 0.0 if either total is zero.",
    starterCode: `import math
def js_from_counts(p_counts, q_counts):
    # Your code here
    pass`,
    solution: `import math
def js_from_counts(p_counts, q_counts):
    sp = float(sum(p_counts))
    sq = float(sum(q_counts))
    if sp <= 0.0 or sq <= 0.0:
        return 0.0
    n = min(len(p_counts), len(q_counts))
    p = [p_counts[i] / sp for i in range(n)]
    q = [q_counts[i] / sq for i in range(n)]
    total = 0.0
    for i in range(n):
        m = 0.5 * (p[i] + q[i])
        if p[i] > 0.0 and m > 0.0:
            total += 0.5 * p[i] * math.log2(p[i] / m)
        if q[i] > 0.0 and m > 0.0:
            total += 0.5 * q[i] * math.log2(q[i] / m)
    return total`,
    testCases: [
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[1, 1], [1, 3]], expected: 0.0487949406953985 },
      { input: [[2, 0], [0, 2]], expected: 1.0 },
      { input: [[3, 0], [1, 1]], expected: 0.31127812445913283 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "Normalize both lists, average them, and average the two KL contributions.",
  },
  {
    id: "info-337",
    title: "Cross-Entropy Loss (One-Hot)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mean cross-entropy loss in nats for one-hot labelled samples. probs is a list of probability rows and labels holds the index of the correct class for each row. Each selected probability is floored at 1e-12, and the function returns 0.0 for empty input.",
    starterCode: `import math
def cross_entropy_one_hot(probs, labels):
    # Your code here
    pass`,
    solution: `import math
def cross_entropy_one_hot(probs, labels):
    if not probs or not labels:
        return 0.0
    total = 0.0
    for row, y in zip(probs, labels):
        p = row[y]
        if p < 1e-12:
            p = 1e-12
        total -= math.log(p)
    return total / len(labels)`,
    testCases: [
      { input: [[[0.8, 0.2], [0.1, 0.9]], [0, 1]], expected: 0.164252033486018 },
      { input: [[[0.5, 0.5], [0.25, 0.75]], [1, 0]], expected: 1.0397207708399179 },
      { input: [[[1.0, 0.0]], [0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Average -ln(p[label]) over all samples.",
  },
  {
    id: "info-338",
    title: "Mean Binary Cross-Entropy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mean binary cross-entropy loss in nats for predicted probabilities and binary targets. Each probability is clamped to [1e-12, 1 - 1e-12] so the logarithms stay finite. Return 0.0 for empty input.",
    starterCode: `import math
def mean_binary_cross_entropy(preds, targets):
    # Your code here
    pass`,
    solution: `import math
def mean_binary_cross_entropy(preds, targets):
    if not preds:
        return 0.0
    total = 0.0
    for p, y in zip(preds, targets):
        q = min(max(p, 1e-12), 1.0 - 1e-12)
        total -= y * math.log(q) + (1.0 - y) * math.log(1.0 - q)
    return total / len(preds)`,
    testCases: [
      { input: [[0.9, 0.2], [1, 0]], expected: 0.164252033486018 },
      { input: [[0.5, 0.5], [1, 0]], expected: 0.6931471805599453 },
      { input: [[0.5], [1]], expected: 0.6931471805599453 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.99, 0.01], [1, 0]], expected: 0.01005033585350145 },
    ],
    hint: "Average -(y ln p + (1-y) ln(1-p)) over the pairs.",
  },
  {
    id: "info-339",
    title: "Softmax Cross-Entropy Gradient",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the gradient of the softmax cross-entropy loss with respect to a single sample's logits as a list. With a stable softmax p the gradient is p with 1 subtracted at the true class index. Use the max-subtraction trick for numerical stability.",
    starterCode: `import math
def softmax_ce_gradient(logits, label):
    # Your code here
    pass`,
    solution: `import math
def softmax_ce_gradient(logits, label):
    m = max(logits)
    exps = [math.exp(x - m) for x in logits]
    s = sum(exps)
    p = [e / s for e in exps]
    p[label] -= 1.0
    return p`,
    testCases: [
      { input: [[2.0, 1.0, 0.0], 0], expected: [-0.3347590442251782, 0.24472847105479764, 0.09003057317038046] },
      { input: [[0.0, 0.0], 1], expected: [0.5, -0.5] },
      { input: [[1.0, 2.0, 3.0], 2], expected: [0.09003057317038046, 0.24472847105479764, -0.3347590442251782] },
      { input: [[5.0], 0], expected: [0.0] },
      { input: [[0.0, 0.0, 0.0, 0.0], 3], expected: [0.25, 0.25, 0.25, -0.75] },
    ],
    hint: "Softmax plus cross-entropy differentiates to predicted minus one-hot.",
  },
  {
    id: "info-340",
    title: "Log-Softmax Cross-Entropy from Logits",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the cross-entropy loss in nats directly from raw logits for one labelled sample using the log-sum-exp trick. The returned value is logsumexp(logits) - logits[label], evaluated stably by subtracting the maximum logit. This is the negative log-probability of the true class.",
    starterCode: `import math
def log_softmax_cross_entropy(logits, label):
    # Your code here
    pass`,
    solution: `import math
def log_softmax_cross_entropy(logits, label):
    m = max(logits)
    s = 0.0
    for x in logits:
        s += math.exp(x - m)
    return m + math.log(s) - logits[label]`,
    testCases: [
      { input: [[0.0, 0.0], 0], expected: 0.6931471805599453 },
      { input: [[2.0, 1.0, 0.0], 0], expected: 0.4076059644443806 },
      { input: [[1.0, 2.0, 3.0], 2], expected: 0.4076059644443806 },
      { input: [[1.0], 0], expected: 0.0 },
      { input: [[-1.0, -2.0], 1], expected: 1.3132616875182228 },
    ],
    hint: "Subtract the max logit before exponentiating, then add it back through the log-sum.",
  },
  {
    id: "info-341",
    title: "Information Gain of a Split",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the information gain in bits of a split defined by groups, where each group is a list of indices into labels. The gain is the parent entropy minus the size-weighted average of the child entropies. Return 0.0 when groups is empty or labels is empty.",
    starterCode: `import math
def information_gain(labels, groups):
    # Your code here
    pass`,
    solution: `import math
def information_gain(labels, groups):
    if not labels or not groups:
        return 0.0
    def entropy(values):
        if not values:
            return 0.0
        counts = {}
        for v in values:
            counts[v] = counts.get(v, 0) + 1
        h = 0.0
        n = len(values)
        for c in counts.values():
            p = c / n
            h -= p * math.log2(p)
        return h
    n = len(labels)
    children = 0.0
    for g in groups:
        vals = [labels[i] for i in g]
        children += len(vals) * entropy(vals)
    return entropy(labels) - children / n`,
    testCases: [
      { input: [["a", "a", "b", "b"], [[0, 1], [2, 3]]], expected: 1.0 },
      { input: [["a", "a", "b", "b", "c"], [[0, 1, 2], [3, 4]]], expected: 0.5709505944546684 },
      { input: [["a", "b"], []], expected: 0.0 },
      { input: [["a", "a", "a"], [[0, 1, 2]]], expected: 0.0 },
      { input: [["a", "b", "a", "c"], [[0, 2], [1, 3]]], expected: 1.0 },
    ],
    hint: "Weight each child entropy by that child's share of the samples.",
  },
  {
    id: "info-342",
    title: "Gini Gain of a Split",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Gini gain of a split defined by groups, where each group is a list of indices into labels. The gain is the parent Gini impurity minus the size-weighted average of the child impurities. Return 0.0 when groups is empty or labels is empty.",
    starterCode: `def gini_gain(labels, groups):
    # Your code here
    pass`,
    solution: `def gini_gain(labels, groups):
    if not labels or not groups:
        return 0.0
    def gini(values):
        if not values:
            return 0.0
        counts = {}
        for v in values:
            counts[v] = counts.get(v, 0) + 1
        total = 0.0
        n = len(values)
        for c in counts.values():
            p = c / n
            total += p * p
        return 1.0 - total
    n = len(labels)
    children = 0.0
    for g in groups:
        vals = [labels[i] for i in g]
        children += len(vals) * gini(vals)
    return gini(labels) - children / n`,
    testCases: [
      { input: [["a", "a", "b", "b"], [[0, 1], [2, 3]]], expected: 0.5 },
      { input: [["a", "a", "b", "b", "c"], [[0, 1, 2], [3, 4]]], expected: 0.17333333333333328 },
      { input: [["a", "b"], []], expected: 0.0 },
      { input: [["a", "a", "a"], [[0, 1, 2]]], expected: 0.0 },
      { input: [["a", "b", "c", "c"], [[0, 1], [2, 3]]], expected: 0.375 },
    ],
    hint: "Same weighting idea as information gain, but with the Gini impurity instead of entropy.",
  },
  {
    id: "info-343",
    title: "Entropy of a Distribution Mixture",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Shannon entropy in bits of the mixture w*p + (1-w)*q of two probability distributions. Zero mixture entries are skipped. Assume p and q have equal length and each sums to one.",
    starterCode: `import math
def mixture_entropy(p, q, w):
    # Your code here
    pass`,
    solution: `import math
def mixture_entropy(p, q, w):
    r = [w * pi + (1.0 - w) * qi for pi, qi in zip(p, q)]
    h = 0.0
    for x in r:
        if x > 0.0:
            h -= x * math.log2(x)
    return h`,
    testCases: [
      { input: [[1, 0], [0, 1], 0.5], expected: 1.0 },
      { input: [[1, 0], [1, 0], 0.3], expected: 0.0 },
      { input: [[1, 0], [0, 1], 0.9], expected: 0.4689955935892811 },
      { input: [[0.5, 0.5], [0.25, 0.75], 0.5], expected: 0.954434002924965 },
      { input: [[0.5, 0.5], [0.5, 0.5], 0.0], expected: 1.0 },
    ],
    hint: "Average the two distributions entry by entry, then take the usual entropy.",
  },
  {
    id: "info-344",
    title: "K-ary Symmetric Channel Capacity",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the capacity in bits of a k-ary symmetric channel with error probability p. With k >= 2 and 0 <= p <= 1, the formula is log2(k) + (1-p) log2(1-p) + p log2(p/(k-1)), and k = 2 reduces to the binary symmetric channel. Errors are uniform over the other k-1 symbols.",
    starterCode: `import math
def ksymmetric_capacity(k, p):
    # Your code here
    pass`,
    solution: `import math
def ksymmetric_capacity(k, p):
    c = math.log2(k)
    if p > 0.0:
        c += p * math.log2(p / (k - 1))
    if p < 1.0:
        c += (1.0 - p) * math.log2(1.0 - p)
    return c`,
    testCases: [
      { input: [2, 0.1], expected: 0.5310044064107188 },
      { input: [4, 0.15], expected: 1.1524153201754261 },
      { input: [3, 0.0], expected: 1.584962500721156 },
      { input: [2, 0.5], expected: 0.0 },
      { input: [7, 1.0], expected: 0.2223924213364481 },
    ],
    hint: "Start from log2(k) and subtract the two entropy-like correction terms.",
  },
  {
    id: "info-345",
    title: "Capacity of Cascaded BSCs",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Two binary symmetric channels with crossover probabilities p1 and p2 are used in series. Return the capacity in bits of the equivalent channel, whose combined crossover probability is p1(1-p2) + p2(1-p1) and whose capacity is 1 - H2(p). Assume probabilities lie in [0, 1].",
    starterCode: `import math
def cascaded_bsc_capacity(p1, p2):
    # Your code here
    pass`,
    solution: `import math
def cascaded_bsc_capacity(p1, p2):
    p = p1 * (1.0 - p2) + p2 * (1.0 - p1)
    if p <= 0.0 or p >= 1.0:
        h = 0.0
    else:
        h = -p * math.log2(p) - (1.0 - p) * math.log2(1.0 - p)
    return 1.0 - h`,
    testCases: [
      { input: [0.1, 0.2], expected: 0.17325362750738216 },
      { input: [0.0, 0.3], expected: 0.1187091007693073 },
      { input: [0.5, 0.5], expected: 0.0 },
      { input: [0.0, 0.0], expected: 1.0 },
      { input: [1.0, 0.4], expected: 0.02904940554533142 },
    ],
    hint: "Flipping twice is equivalent to a single flip with the combined probability.",
  },
  {
    id: "info-346",
    title: "Capacity of Cascaded Erasure Channels",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Two binary erasure channels with erasure probabilities e1 and e2 are used in series. Return the capacity in bits of the equivalent erasure channel, 1 - e with e = e1 + e2 - e1*e2. Assume e1 and e2 lie in [0, 1].",
    starterCode: `def cascaded_bec_capacity(e1, e2):
    # Your code here
    pass`,
    solution: `def cascaded_bec_capacity(e1, e2):
    e = e1 + e2 - e1 * e2
    return 1.0 - e`,
    testCases: [
      { input: [0.1, 0.2], expected: 0.72 },
      { input: [0.0, 0.5], expected: 0.5 },
      { input: [1.0, 0.5], expected: 0.0 },
      { input: [0.0, 0.0], expected: 1.0 },
      { input: [0.3, 0.3], expected: 0.49 },
    ],
    hint: "An erasure survives only if neither stage erases it, which gives the combined probability.",
  },
  {
    id: "info-347",
    title: "Deterministic Channel Capacity",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the capacity in bits of a deterministic channel given the output symbol produced by each input symbol. The capacity is log2 of the number of distinct outputs that can appear. Return 0.0 for an empty mapping.",
    starterCode: `import math
def deterministic_channel_capacity(mappings):
    # Your code here
    pass`,
    solution: `import math
def deterministic_channel_capacity(mappings):
    outputs = set()
    for m in mappings:
        outputs.add(m)
    if not outputs:
        return 0.0
    return math.log2(len(outputs))`,
    testCases: [
      { input: [[0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 2, 3]], expected: 2.0 },
      { input: [["a", "a"]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[2, 0, 1, 2, 0]], expected: 1.584962500721156 },
    ],
    hint: "A deterministic channel loses information only by mapping several inputs to the same output.",
  },
  {
    id: "info-348",
    title: "Hamming Ball Volume",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the number of binary words of length n within Hamming distance t of a fixed word, which is the sum of C(n, k) for k from 0 to t. Values of t above n are clamped to n. Return the count as an integer, and return 0 when t is negative.",
    starterCode: `import math
def hamming_ball_volume(n, t):
    # Your code here
    pass`,
    solution: `import math
def hamming_ball_volume(n, t):
    if t > n:
        t = n
    if t < 0:
        return 0
    return int(sum(math.comb(n, k) for k in range(t + 1)))`,
    testCases: [
      { input: [7, 1], expected: 8 },
      { input: [7, 0], expected: 1 },
      { input: [5, 5], expected: 32 },
      { input: [3, 2], expected: 7 },
      { input: [10, 2], expected: 56 },
    ],
    hint: "A word at distance k differs in exactly C(n, k) patterns.",
  },
  {
    id: "info-349",
    title: "Hamming (7,4) Payload Bits",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Correct at most one bit error in a received Hamming (7,4) word and return the four data bits. Positions 1 through 7 hold p1, p2, d1, p4, d2, d3, d4; the syndrome is the XOR of the 1-based positions of the set bits, and a nonzero syndrome flips that position. Return the data bits in order d1, d2, d3, d4.",
    starterCode: `def hamming74_payload(received):
    # Your code here
    pass`,
    solution: `def hamming74_payload(received):
    words = list(received[:7])
    syndrome = 0
    for i, b in enumerate(words):
        if b:
            syndrome ^= i + 1
    if syndrome != 0:
        words[syndrome - 1] ^= 1
    return [words[2], words[4], words[5], words[6]]`,
    testCases: [
      { input: [[0, 1, 1, 0, 0, 1, 1]], expected: [1, 0, 1, 1] },
      { input: [[0, 1, 1, 0, 1, 1, 1]], expected: [1, 0, 1, 1] },
      { input: [[1, 1, 1, 1, 1, 1, 1]], expected: [1, 1, 1, 1] },
      { input: [[0, 0, 0, 0, 0, 0, 0]], expected: [0, 0, 0, 0] },
      { input: [[0, 0, 1, 0, 0, 1, 1]], expected: [1, 0, 1, 1] },
    ],
    hint: "Compute the syndrome from the parity positions, fix the indicated bit, then read positions 3, 5, 6, and 7.",
  },
  {
    id: "info-350",
    title: "Huffman Codeword Dictionary",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Build a Huffman code table mapping each symbol to its codeword string. Repeatedly merge the two lightest subtrees from a min-heap keyed by weight and then creation order; the first popped subtree receives prefix 0 and the second receives prefix 1. Return an empty dictionary for no symbols and the single code 0 for one symbol.",
    starterCode: `import heapq
def huffman_code_table(symbols, freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_code_table(symbols, freqs):
    if not symbols:
        return {}
    if len(symbols) == 1:
        return {symbols[0]: "0"}
    heap = [(freqs[i], i, {symbols[i]: ""}) for i in range(len(symbols))]
    heapq.heapify(heap)
    order = len(symbols)
    while len(heap) > 1:
        w1, _, t1 = heapq.heappop(heap)
        w2, _, t2 = heapq.heappop(heap)
        merged = {}
        for s, code in t1.items():
            merged[s] = "0" + code
        for s, code in t2.items():
            merged[s] = "1" + code
        heapq.heappush(heap, (w1 + w2, order, merged))
        order += 1
    return heap[0][2]`,
    testCases: [
      { input: [["a", "b", "c"], [1, 1, 2]], expected: {"c": "0", "a": "10", "b": "11"} },
      { input: [["x"], [5]], expected: {"x": "0"} },
      { input: [[], []], expected: {} },
      { input: [["a", "b", "c", "d"], [1, 1, 1, 1]], expected: {"a": "00", "b": "01", "c": "10", "d": "11"} },
      { input: [["a", "b", "c", "d", "e"], [5, 4, 3, 2, 1]], expected: {"c": "00", "e": "010", "d": "011", "b": "10", "a": "11"} },
    ],
    hint: "Keep each subtree as a symbol-to-suffix dictionary and add one bit when merging.",
  },
  {
    id: "info-351",
    title: "Bayesian Surprise of an Observation",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Bayesian surprise, the KL divergence in bits from the prior to the posterior after observing one data point. likelihoods[i][o] is the probability of observation o under hypothesis i. Return 0.0 when the posterior cannot be normalized or the prior has zero mass.",
    starterCode: `import math
def bayesian_surprise(prior, likelihoods, observation):
    # Your code here
    pass`,
    solution: `import math
def bayesian_surprise(prior, likelihoods, observation):
    post = [prior[i] * likelihoods[i][observation] for i in range(len(prior))]
    total = sum(post)
    if total <= 0.0:
        return 0.0
    surprise = 0.0
    for i in range(len(prior)):
        pi = prior[i]
        qi = post[i] / total
        if qi > 0.0 and pi > 0.0:
            surprise += qi * math.log2(qi / pi)
    return surprise`,
    testCases: [
      { input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]], 0], expected: 0.3159615643609581 },
      { input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]], 1], expected: 0.4967416652243545 },
      { input: [[0.3, 0.7], [[0.5, 0.5], [0.5, 0.5]], 0], expected: 0.0 },
      { input: [[0.8, 0.2], [[0.9, 0.1], [0.1, 0.9]], 1], expected: 0.8160518392832559 },
    ],
    hint: "Multiply the prior by the likelihoods, normalize, then measure the divergence from the prior.",
  },
  {
    id: "info-352",
    title: "Expected Information from a Test",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the expected information in bits that an experiment provides about a hypothesis, which equals the mutual information between hypothesis and observation. For each observation, form the posterior from the prior and the likelihoods, then accumulate P(observation) times the KL divergence from prior to posterior.",
    starterCode: `import math
def expected_information(prior, likelihoods):
    # Your code here
    pass`,
    solution: `import math
def expected_information(prior, likelihoods):
    if not prior or not likelihoods:
        return 0.0
    nobs = len(likelihoods[0])
    total = 0.0
    for o in range(nobs):
        post = [prior[i] * likelihoods[i][o] for i in range(len(prior))]
        s = sum(post)
        if s <= 0.0:
            continue
        contribution = 0.0
        for i in range(len(prior)):
            q = post[i] / s
            if q > 0.0 and prior[i] > 0.0:
                contribution += q * math.log2(q / prior[i])
        total += s * contribution
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [[0.9, 0.1], [0.2, 0.8]]], expected: 0.3973126097494865 },
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[0.8, 0.2], [[0.9, 0.1], [0.1, 0.9]]], expected: 0.35775077890333656 },
      { input: [[0.25, 0.75], [[0.8, 0.2], [0.4, 0.6]]], expected: 0.09130503043715799 },
    ],
    hint: "Weight each posterior surprise by the probability of seeing that observation.",
  },
  {
    id: "info-353",
    title: "Best Threshold Split",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Find the threshold that maximizes information gain when splitting samples by feature value. Candidate thresholds are midpoints between consecutive distinct feature values, and a valid split needs samples on both sides; ties keep the smallest threshold. Return [threshold, gain] with entropy in bits, or [0.0, 0.0] when no valid split exists.",
    starterCode: `import math
def best_threshold_split(features, labels):
    # Your code here
    pass`,
    solution: `import math
def best_threshold_split(features, labels):
    if len(features) < 2:
        return [0.0, 0.0]
    values = sorted(set(features))
    if len(values) < 2:
        return [0.0, 0.0]
    def entropy(vals):
        if not vals:
            return 0.0
        counts = {}
        for v in vals:
            counts[v] = counts.get(v, 0) + 1
        h = 0.0
        n = len(vals)
        for c in counts.values():
            p = c / n
            h -= p * math.log2(p)
        return h
    base = entropy(labels)
    n = len(labels)
    best_t = 0.0
    best_gain = -1.0
    for i in range(len(values) - 1):
        t = (values[i] + values[i + 1]) / 2.0
        left = [labels[j] for j in range(n) if features[j] < t]
        right = [labels[j] for j in range(n) if features[j] >= t]
        gain = base - (len(left) * entropy(left) + len(right) * entropy(right)) / n
        if gain > best_gain + 1e-12:
            best_gain = gain
            best_t = t
    if best_gain < 0.0:
        best_gain = 0.0
    return [float(best_t), float(best_gain)]`,
    testCases: [
      { input: [[1, 2, 3, 4], ["a", "a", "b", "b"]], expected: [2.5, 1.0] },
      { input: [[1, 1, 1], ["a", "b", "a"]], expected: [0.0, 0.0] },
      { input: [[1, 2, 3, 4, 5, 6], ["a", "a", "a", "b", "b", "b"]], expected: [3.5, 1.0] },
      { input: [[1, 2, 3], ["a", "b", "a"]], expected: [1.5, 0.2516291673878229] },
      { input: [[5], ["a"]], expected: [0.0, 0.0] },
    ],
    hint: "Sort the distinct feature values, try each gap, and keep the best gain with a small epsilon for tie handling.",
  },
  {
    id: "info-354",
    title: "Information Gain Ratio of a Split",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the information gain ratio of a split, the information gain in bits divided by the split information, the entropy of the group-size proportions. This penalizes splits that create many small groups. Return 0.0 when groups is empty, labels is empty, or the split information is zero.",
    starterCode: `import math
def gain_ratio(labels, groups):
    # Your code here
    pass`,
    solution: `import math
def gain_ratio(labels, groups):
    if not labels or not groups:
        return 0.0
    def entropy(vals):
        if not vals:
            return 0.0
        counts = {}
        for v in vals:
            counts[v] = counts.get(v, 0) + 1
        h = 0.0
        n = len(vals)
        for c in counts.values():
            p = c / n
            h -= p * math.log2(p)
        return h
    n = len(labels)
    children = 0.0
    sizes = []
    for g in groups:
        vals = [labels[i] for i in g]
        sizes.append(len(vals))
        children += len(vals) * entropy(vals)
    gain = entropy(labels) - children / n
    split_info = 0.0
    for c in sizes:
        if c > 0:
            p = c / n
            split_info -= p * math.log2(p)
    if split_info <= 0.0:
        return 0.0
    return gain / split_info`,
    testCases: [
      { input: [["a", "a", "b", "b"], [[0, 1], [2, 3]]], expected: 1.0 },
      { input: [["a", "a", "b", "b"], [[0, 1, 2, 3]]], expected: 0.0 },
      { input: [["a", "a", "b", "b", "c"], [[0, 1, 2], [3, 4]]], expected: 0.5880325916843803 },
      { input: [["a", "b", "c", "d", "e"], [[0], [1], [2], [3], [4]]], expected: 1.0 },
      { input: [["a", "b"], []], expected: 0.0 },
    ],
    hint: "Compute the ordinary gain first, then divide by the entropy of the group-size distribution.",
  },
  {
    id: "info-355",
    title: "Cross-Entropy with Label Smoothing",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the mean cross-entropy loss in nats when one-hot targets are smoothed toward the uniform distribution. For K classes each target becomes 1-eps at the true class and eps/K elsewhere, and log probabilities are floored at 1e-12. Return 0.0 for empty input.",
    starterCode: `import math
def smoothed_cross_entropy(probs, labels, eps):
    # Your code here
    pass`,
    solution: `import math
def smoothed_cross_entropy(probs, labels, eps):
    if not probs or not labels:
        return 0.0
    k = len(probs[0])
    total = 0.0
    for row, y in zip(probs, labels):
        for j in range(k):
            target = eps / k
            if j == y:
                target += 1.0 - eps
            p = row[j]
            if p < 1e-12:
                p = 1e-12
            total -= target * math.log(p)
    return total / len(labels)`,
    testCases: [
      { input: [[[0.8, 0.2]], [0], 0.0], expected: 0.2231435513142097 },
      { input: [[[0.8, 0.2]], [0], 0.1], expected: 0.29245826937020425 },
      { input: [[[0.9, 0.1]], [1], 0.2], expected: 2.0828626352604234 },
      { input: [[[0.6, 0.4], [0.5, 0.5]], [0, 1], 0.1], expected: 0.6121230298656721 },
      { input: [[], [], 0.0], expected: 0.0 },
    ],
    hint: "Every class contributes, so sum the smoothed target times the negative log probability over all classes.",
  },
  {
    id: "info-356",
    title: "SECDED Double Error Detection",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Decode an 8-bit SECDED word holding one Hamming (7,4) codeword plus an even overall parity bit. Return the four data bits when there is no error or a correctable single-bit error, including an error confined to the overall parity bit, and return an empty list when a double-bit error is detected. Positions 1 through 7 hold p1, p2, d1, p4, d2, d3, d4 and index 7 holds the overall parity bit.",
    starterCode: `def secded_decode(received):
    # Your code here
    pass`,
    solution: `def secded_decode(received):
    bits = list(received)
    syndrome = 0
    for i in range(7):
        if bits[i]:
            syndrome ^= i + 1
    parity_bad = (sum(bits) % 2) == 1
    if parity_bad and syndrome == 0:
        pass
    elif parity_bad:
        bits[syndrome - 1] ^= 1
    elif syndrome != 0:
        return []
    return [bits[2], bits[4], bits[5], bits[6]]`,
    testCases: [
      { input: [[0, 1, 1, 0, 0, 1, 1, 0]], expected: [1, 0, 1, 1] },
      { input: [[0, 1, 1, 0, 1, 1, 1, 0]], expected: [1, 0, 1, 1] },
      { input: [[0, 1, 0, 0, 1, 1, 1, 0]], expected: [] },
      { input: [[0, 1, 1, 0, 0, 1, 1, 1]], expected: [1, 0, 1, 1] },
      { input: [[0, 0, 0, 0, 0, 0, 0, 0]], expected: [0, 0, 0, 0] },
    ],
    hint: "Combine the syndrome with the overall parity check: bad parity with a zero syndrome means only the parity bit flipped.",
  },
  {
    id: "info-357",
    title: "Crossover from Capacity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Invert the k-ary symmetric channel capacity formula to find the error probability producing a target capacity in bits. Capacity falls monotonically from log2(k) at p = 0 to 0 at p = (k-1)/k, so bisection applies. Return 0.0 when target >= log2(k) and (k-1)/k when target <= 0.",
    starterCode: `import math
def crossover_from_capacity(k, target):
    # Your code here
    pass`,
    solution: `import math
def crossover_from_capacity(k, target):
    hi = (k - 1.0) / k
    if target >= math.log2(k):
        return 0.0
    if target <= 0.0:
        return hi
    lo = 0.0
    for _ in range(100):
        mid = (lo + hi) / 2.0
        c = math.log2(k)
        if mid > 0.0:
            c += mid * math.log2(mid / (k - 1))
        if mid < 1.0:
            c += (1.0 - mid) * math.log2(1.0 - mid)
        if c > target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2.0`,
    testCases: [
      { input: [2, 0.5], expected: 0.11002786443835949 },
      { input: [2, 0.9], expected: 0.012986862055517776 },
      { input: [4, 1.0], expected: 0.18928962491523177 },
      { input: [2, 1.0], expected: 0.0 },
      { input: [2, 0.0], expected: 0.5 },
      { input: [3, 1.0], expected: 0.10385734171378519 },
    ],
    hint: "Bisect on the interval [0, (k-1)/k], always keeping the side whose capacity bracket contains the target.",
  },
  {
    id: "info-358",
    title: "AND Channel Capacity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the capacity in bits of the channel Y = X AND Z, where X is the binary input and Z is an independent Bernoulli noise bit with P(Z = 1) = q. When Z is 0 the output is forced to 0, so the channel is an erasure-like model whose capacity is 1.0 for q <= 0.5 and H2(1 - q) otherwise.",
    starterCode: `import math
def and_channel_capacity(q):
    # Your code here
    pass`,
    solution: `import math
def and_channel_capacity(q):
    if q <= 0.5:
        return 1.0
    r = 1.0 - q
    if r <= 0.0:
        return 0.0
    return -r * math.log2(r) - (1.0 - r) * math.log2(1.0 - r)`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.25], expected: 1.0 },
      { input: [0.75], expected: 0.8112781244591328 },
      { input: [1.0], expected: 0.0 },
      { input: [0.5], expected: 1.0 },
    ],
    hint: "Given X the output is deterministic, so maximize the entropy of P(Y = 1) = p(1 - q) over the input bias p.",
  },
  {
    id: "info-359",
    title: "Jensen Gap of Entropy",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the Jensen gap of the entropy function for the mixture w*p + (1-w)*q, that is the entropy of the mixture minus the same mixture of the individual entropies, measured in bits. Entropy is concave, so the gap is nonnegative and tiny negative rounding noise is clamped to 0.0.",
    starterCode: `import math
def jensen_gap(p, q, w):
    # Your code here
    pass`,
    solution: `import math
def jensen_gap(p, q, w):
    r = [w * pi + (1.0 - w) * qi for pi, qi in zip(p, q)]
    hp = 0.0
    hq = 0.0
    hr = 0.0
    for x in p:
        if x > 0.0:
            hp -= x * math.log2(x)
    for x in q:
        if x > 0.0:
            hq -= x * math.log2(x)
    for x in r:
        if x > 0.0:
            hr -= x * math.log2(x)
    return max(0.0, hr - (w * hp + (1.0 - w) * hq))`,
    testCases: [
      { input: [[1, 0], [0, 1], 0.5], expected: 1.0 },
      { input: [[1, 0], [1, 0], 0.3], expected: 0.0 },
      { input: [[1, 0], [0, 1], 0.25], expected: 0.8112781244591328 },
      { input: [[0.5, 0.5], [0.25, 0.75], 0.5], expected: 0.04879494069539858 },
      { input: [[0.5, 0.5], [0.5, 0.5], 0.4], expected: 0.0 },
    ],
    hint: "Mix the distributions first, then compare H(mixture) with the weighted average of H(p) and H(q).",
  },
  {
    id: "info-360",
    title: "Mixed Erasure-Flip Channel Capacity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the capacity in bits of a channel that flips each bit with probability p and erases it with probability e, independently, assuming p + e <= 1. Conditioning on the erasure indicator gives the capacity (1 - e) * (1 - H2(p / (1 - e))), which is 0.0 when e equals 1.",
    starterCode: `import math
def erasure_flip_capacity(p, e):
    # Your code here
    pass`,
    solution: `import math
def erasure_flip_capacity(p, e):
    q = 1.0 - e
    if q <= 0.0:
        return 0.0
    r = p / q
    if r <= 0.0:
        return q
    if r >= 1.0:
        return q
    return q * (1.0 + r * math.log2(r) + (1.0 - r) * math.log2(1.0 - r))`,
    testCases: [
      { input: [0.1, 0.2], expected: 0.3651484454403229 },
      { input: [0.0, 0.5], expected: 0.5 },
      { input: [0.0, 0.0], expected: 1.0 },
      { input: [0.25, 0.75], expected: 0.25 },
      { input: [0.1, 0.0], expected: 0.5310044064107188 },
    ],
    hint: "Ignore erased positions, then treat the surviving positions as a BSC with crossover p/(1-e).",
  },
];
