import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "st-231",
    title: "Pass@k Unbiased Estimator",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Given n sampled completions, c correct ones, and k draws, return the unbiased pass@k estimate 1 - C(n-c, k) / C(n, k), where C is the binomial coefficient. Return 0.0 when n <= 0, k <= 0, or c <= 0, and 1.0 when k >= n or n - c < k.",
    starterCode: `import math
def pass_at_k(n, c, k):
    # Your code here
    pass`,
    solution: `import math
def pass_at_k(n, c, k):
    if n <= 0 or k <= 0 or c <= 0:
        return 0.0
    if k >= n:
        return 1.0
    m = n - c
    if m < k:
        return 1.0
    return 1.0 - math.comb(m, k) / math.comb(n, k)`,
    testCases: [
      { input: [10, 2, 5], expected: 0.7777777777777778 },
      { input: [5, 1, 1], expected: 0.19999999999999996 },
      { input: [5, 0, 3], expected: 0.0 },
      { input: [4, 4, 2], expected: 1.0 },
      { input: [6, 3, 2], expected: 0.8 },
    ],
    hint: "C(n-c, k) is zero whenever k exceeds n - c.",
  },
  {
    id: "st-232",
    title: "Pass@k from Correct Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Given c correct completions out of n samples, treat p = c / n as the per-sample success probability and return the binomial pass@k probability 1 - (1 - p)^k. Return 0.0 when n <= 0, k <= 0, or c <= 0, and 1.0 when c >= n.",
    starterCode: `def pass_at_k_rate(c, n, k):
    # Your code here
    pass`,
    solution: `def pass_at_k_rate(c, n, k):
    if n <= 0 or k <= 0 or c <= 0:
        return 0.0
    if c >= n:
        return 1.0
    return 1.0 - (1.0 - c / n) ** k`,
    testCases: [
      { input: [2, 10, 5], expected: 0.6723199999999999 },
      { input: [1, 4, 2], expected: 0.4375 },
      { input: [0, 5, 3], expected: 0.0 },
      { input: [5, 5, 2], expected: 1.0 },
      { input: [3, 4, 1], expected: 0.75 },
    ],
  },
  {
    id: "st-233",
    title: "Exact Match Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the fraction of predictions that exactly equal their references, comparing element by element. Return 0.0 for an empty prediction list. Assumes the two lists have the same length.",
    starterCode: `def exact_match_rate(preds, refs):
    # Your code here
    pass`,
    solution: `def exact_match_rate(preds, refs):
    n = len(preds)
    if n == 0:
        return 0.0
    correct = 0
    for p, r in zip(preds, refs):
        if p == r:
            correct += 1
    return correct / n`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "x", "c"]], expected: 0.6666666666666666 },
      { input: [["yes"], ["no"]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
      { input: [["1", "2"], ["1", "2"]], expected: 1.0 },
    ],
  },
  {
    id: "st-234",
    title: "Token-Level F1 for Generation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Tokenize the prediction and reference on whitespace and compute their multiset overlap. Precision is overlap / len(prediction tokens), recall is overlap / len(reference tokens), and the returned F1 is their harmonic mean. Return 0.0 if either side is empty or the overlap is zero.",
    starterCode: `def token_f1(pred, ref):
    # Your code here
    pass`,
    solution: `def token_f1(pred, ref):
    pt = pred.split()
    rt = ref.split()
    if not pt or not rt:
        return 0.0
    counts = {}
    for t in pt:
        counts[t] = counts.get(t, 0) + 1
    overlap = 0
    for t in rt:
        if counts.get(t, 0) > 0:
            counts[t] -= 1
            overlap += 1
    if overlap == 0:
        return 0.0
    p = overlap / len(pt)
    r = overlap / len(rt)
    return 2.0 * p * r / (p + r)`,
    testCases: [
      { input: ["the cat sat", "the cat"], expected: 0.8 },
      { input: ["a b c", "a b c"], expected: 1.0 },
      { input: ["x", "y"], expected: 0.0 },
      { input: ["", "hello"], expected: 0.0 },
      { input: ["the the cat", "the cat cat"], expected: 0.6666666666666666 },
    ],
  },
  {
    id: "st-235",
    title: "ROUGE-L LCS Length",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the length of the longest common subsequence between token lists a and b using dynamic programming. This is the LCS term that ROUGE-L turns into precision, recall, and an F-score. Return 0 when either list is empty.",
    starterCode: `def rouge_l_lcs(a, b):
    # Your code here
    pass`,
    solution: `def rouge_l_lcs(a, b):
    m, n = len(a), len(b)
    dp = [0] * (n + 1)
    for i in range(1, m + 1):
        prev = 0
        for j in range(1, n + 1):
            tmp = dp[j]
            if a[i - 1] == b[j - 1]:
                dp[j] = prev + 1
            elif dp[j - 1] > dp[j]:
                dp[j] = dp[j - 1]
            prev = tmp
    return dp[n]`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c"]], expected: 2 },
      { input: [["a", "b", "c"], ["d", "e"]], expected: 0 },
      { input: [[], []], expected: 0 },
      { input: [["x", "y", "z"], ["x", "y", "z"]], expected: 3 },
      { input: [["a", "c", "b"], ["a", "b", "c"]], expected: 2 },
    ],
    hint: "The subsequence need not be contiguous; reuse a rolling DP row.",
  },
  {
    id: "st-236",
    title: "BLEU Score Lite",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute a BLEU-lite score from clipped unigram and bigram precisions, using only unigrams when the candidate has a single token. The score is the brevity penalty times the geometric mean of the precisions, where BP = 1 when the candidate is at least as long as the reference, else exp(1 - ref_len / cand_len). Return 0.0 if the candidate is empty or any precision is zero.",
    starterCode: `import math
def bleu_lite(candidate, reference):
    # Your code here
    pass`,
    solution: `import math
def bleu_lite(candidate, reference):
    cand = candidate.split()
    ref = reference.split()
    if not cand:
        return 0.0
    log_sum = 0.0
    for n in range(1, min(2, len(cand)) + 1):
        cand_grams = {}
        for i in range(len(cand) - n + 1):
            g = tuple(cand[i:i + n])
            cand_grams[g] = cand_grams.get(g, 0) + 1
        ref_grams = {}
        for i in range(len(ref) - n + 1):
            g = tuple(ref[i:i + n])
            ref_grams[g] = ref_grams.get(g, 0) + 1
        total = sum(cand_grams.values())
        if total == 0:
            return 0.0
        clipped = 0
        for g, count in cand_grams.items():
            clipped += min(count, ref_grams.get(g, 0))
        p = clipped / total
        if p == 0:
            return 0.0
        log_sum += math.log(p)
    if len(cand) > len(ref):
        bp = 1.0
    else:
        bp = math.exp(1.0 - len(ref) / len(cand))
    return bp * math.exp(log_sum / min(2, len(cand)))`,
    testCases: [
      { input: ["the cat sat on the mat", "the cat sat on the mat"], expected: 1.0 },
      { input: ["the cat sat", "the cat"], expected: 0.5773502691896257 },
      { input: ["a b c d", "a b c"], expected: 0.7071067811865475 },
      { input: ["x y", "a b"], expected: 0.0 },
    ],
    hint: "Clip each candidate n-gram count at its reference count before dividing.",
  },
  {
    id: "st-237",
    title: "chrF Lite (Character Bigram F1)",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute character bigram precision, recall, and their F1 between pred and ref using multiset overlap. Return 0.0 when either string is too short to form a bigram or nothing matches. The beta weight is fixed at 1.",
    starterCode: `def chrf_lite(pred, ref):
    # Your code here
    pass`,
    solution: `def chrf_lite(pred, ref):
    pb = [pred[i:i + 2] for i in range(len(pred) - 1)]
    rb = [ref[i:i + 2] for i in range(len(ref) - 1)]
    if not pb or not rb:
        return 0.0
    counts = {}
    for g in pb:
        counts[g] = counts.get(g, 0) + 1
    overlap = 0
    for g in rb:
        if counts.get(g, 0) > 0:
            counts[g] -= 1
            overlap += 1
    if overlap == 0:
        return 0.0
    p = overlap / len(pb)
    r = overlap / len(rb)
    return 2.0 * p * r / (p + r)`,
    testCases: [
      { input: ["hello", "hello"], expected: 1.0 },
      { input: ["hello", "hallo"], expected: 0.5 },
      { input: ["abc", "xyz"], expected: 0.0 },
      { input: ["ab", "ab"], expected: 1.0 },
    ],
  },
  {
    id: "st-238",
    title: "Perplexity from Mean NLL",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return perplexity = exp(mean_nll) for a language model's mean negative log-likelihood measured in nats. Return 0.0 when mean_nll is negative.",
    starterCode: `import math
def perplexity_from_nll(mean_nll):
    # Your code here
    pass`,
    solution: `import math
def perplexity_from_nll(mean_nll):
    if mean_nll < 0:
        return 0.0
    return math.exp(mean_nll)`,
    testCases: [
      { input: [2.302585092994046], expected: 10.000000000000002 },
      { input: [0.0], expected: 1.0 },
      { input: [2.0], expected: 7.38905609893065 },
      { input: [0.6931471805599453], expected: 2.0 },
    ],
  },
  {
    id: "st-239",
    title: "Bits per Byte from NLL",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Convert a total negative log-likelihood in nats to bits per byte: total_nll / (ln(2) * num_bytes). Return 0.0 when num_bytes <= 0.",
    starterCode: `import math
def bits_per_byte(total_nll_nats, num_bytes):
    # Your code here
    pass`,
    solution: `import math
def bits_per_byte(total_nll_nats, num_bytes):
    if num_bytes <= 0:
        return 0.0
    return total_nll_nats / (math.log(2.0) * num_bytes)`,
    testCases: [
      { input: [5.545177444479562, 8], expected: 1.0 },
      { input: [10.0, 0], expected: 0.0 },
      { input: [0.0, 4], expected: 0.0 },
      { input: [22.180709777918248, 4], expected: 8.0 },
    ],
  },
  {
    id: "st-240",
    title: "Bits per Character from Perplexity",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Convert perplexity measured per token into bits per character: log2(perplexity) * num_tokens / num_chars. This normalizes across tokenizers so models with different vocabularies are comparable. Return 0.0 when perplexity <= 0, num_tokens < 0, or num_chars <= 0.",
    starterCode: `import math
def bits_per_char(perplexity, num_tokens, num_chars):
    # Your code here
    pass`,
    solution: `import math
def bits_per_char(perplexity, num_tokens, num_chars):
    if perplexity <= 0 or num_chars <= 0 or num_tokens < 0:
        return 0.0
    return math.log(perplexity, 2.0) * num_tokens / num_chars`,
    testCases: [
      { input: [16.0, 8, 16], expected: 2.0 },
      { input: [2.0, 4, 8], expected: 0.5 },
      { input: [0.0, 5, 5], expected: 0.0 },
      { input: [1024.0, 10, 10], expected: 10.0 },
    ],
  },
  {
    id: "st-241",
    title: "Expected Calibration Error",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Bin confidences into num_bins equal-width bins using int(p * num_bins) clipped to the final bin, then return the sample-weighted average of |mean_confidence - mean_accuracy| over non-empty bins. correct holds 0/1 correctness labels. Return 0.0 when there are no samples or num_bins <= 0.",
    starterCode: `def expected_calibration_error(confidences, correct, num_bins):
    # Your code here
    pass`,
    solution: `def expected_calibration_error(confidences, correct, num_bins):
    n = len(confidences)
    if n == 0 or num_bins <= 0:
        return 0.0
    totals = [0] * num_bins
    conf_sums = [0.0] * num_bins
    acc_sums = [0] * num_bins
    for p, y in zip(confidences, correct):
        b = int(p * num_bins)
        if b < 0:
            b = 0
        if b >= num_bins:
            b = num_bins - 1
        totals[b] += 1
        conf_sums[b] += p
        acc_sums[b] += y
    ece = 0.0
    for b in range(num_bins):
        if totals[b]:
            gap = abs(conf_sums[b] / totals[b] - acc_sums[b] / totals[b])
            ece += totals[b] / n * gap
    return ece`,
    testCases: [
      { input: [[0.9, 0.8, 0.3, 0.1], [1, 1, 0, 0], 5], expected: 0.17499999999999996 },
      { input: [[0.5, 0.5], [1, 0], 2], expected: 0.0 },
      { input: [[], [], 5], expected: 0.0 },
      { input: [[0.2, 0.4, 0.6, 0.8], [0, 0, 1, 1], 4], expected: 0.3 },
    ],
    hint: "Weight each bin gap by the fraction of samples that landed in it.",
  },
  {
    id: "st-242",
    title: "Brier Score Decomposition",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the mean squared error between predicted probabilities and 0/1 labels: mean((prob - label)^2). Return 0.0 for empty input.",
    starterCode: `def brier_score(probs, labels):
    # Your code here
    pass`,
    solution: `def brier_score(probs, labels):
    n = len(probs)
    if n == 0:
        return 0.0
    return sum((p - y) ** 2 for p, y in zip(probs, labels)) / n`,
    testCases: [
      { input: [[0.9, 0.1], [1, 0]], expected: 0.009999999999999998 },
      { input: [[0.5], [0]], expected: 0.25 },
      { input: [[], []], expected: 0.0 },
      { input: [[1.0, 0.0], [1, 0]], expected: 0.0 },
    ],
  },
  {
    id: "st-243",
    title: "Reliability Diagram Binning",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the bin index for each probability using int(p * num_bins), clipped to [0, num_bins - 1] so that 1.0 falls in the final bin. Return an empty list when num_bins <= 0.",
    starterCode: `def reliability_bins(probs, num_bins):
    # Your code here
    pass`,
    solution: `def reliability_bins(probs, num_bins):
    if num_bins <= 0:
        return []
    out = []
    for p in probs:
        b = int(p * num_bins)
        if b < 0:
            b = 0
        if b >= num_bins:
            b = num_bins - 1
        out.append(b)
    return out`,
    testCases: [
      { input: [[0.0, 0.5, 0.999, 1.0], 5], expected: [0, 2, 4, 4] },
      { input: [[], 4], expected: [] },
      { input: [[0.2], 0], expected: [] },
      { input: [[0.4, 0.6], 2], expected: [0, 1] },
    ],
  },
  {
    id: "st-244",
    title: "Temperature Scaling on Logits",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Apply temperature scaling and return softmax(logits / temperature) as a list of probabilities. Use the max-subtraction trick for numerical stability. Return an empty list when logits is empty or temperature <= 0.",
    starterCode: `import math
def temperature_scale(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_scale(logits, temperature):
    if temperature <= 0 or not logits:
        return []
    scaled = [x / temperature for x in logits]
    m = max(scaled)
    exps = [math.exp(x - m) for x in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      {
        input: [[1.0, 2.0, 3.0], 1.0],
        expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
      },
      { input: [[0.0, 0.0], 2.0], expected: [0.5, 0.5] },
      { input: [[1.0, 1.0], 2.0], expected: [0.5, 0.5] },
      { input: [[], 1.0], expected: [] },
      { input: [[2.0], 0.0], expected: [] },
    ],
  },
  {
    id: "st-245",
    title: "Platt Scaling Parameters",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the parameters [A, B] of the logistic calibration p = 1 / (1 + exp(-(A * score + B))) placed so the decision boundary sits at the midpoint of the two class means: A = 1 / (mean_pos - mean_neg) and B = -A * (mean_pos + mean_neg) / 2. Return [0.0, 0.0] when either class is empty or the means are equal.",
    starterCode: `def platt_parameters(pos_scores, neg_scores):
    # Your code here
    pass`,
    solution: `def platt_parameters(pos_scores, neg_scores):
    if not pos_scores or not neg_scores:
        return [0.0, 0.0]
    mp = sum(pos_scores) / len(pos_scores)
    mn = sum(neg_scores) / len(neg_scores)
    if mp == mn:
        return [0.0, 0.0]
    a = 1.0 / (mp - mn)
    b = -a * (mp + mn) / 2.0
    return [a, b]`,
    testCases: [
      { input: [[0.8, 0.9], [0.1, 0.2]], expected: [1.4285714285714284, -0.7142857142857142] },
      { input: [[1.0], [1.0]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [0.0, 0.0] },
      { input: [[0.5, 0.7], [0.3, 0.5]], expected: [5.000000000000001, -2.5000000000000004] },
    ],
  },
  {
    id: "st-246",
    title: "Win Rate from Pairwise Outcomes",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the win rate from outcomes coded 1 for a win, 0 for a tie, and -1 for a loss, counting a tie as half a win: (wins + 0.5 * ties) / n. Return 0.0 for an empty list.",
    starterCode: `def win_rate(outcomes):
    # Your code here
    pass`,
    solution: `def win_rate(outcomes):
    if not outcomes:
        return 0.0
    score = 0.0
    for o in outcomes:
        if o > 0:
            score += 1.0
        elif o == 0:
            score += 0.5
    return score / len(outcomes)`,
    testCases: [
      { input: [[1, 1, -1, 0]], expected: 0.625 },
      { input: [[0, 0, 0]], expected: 0.5 },
      { input: [[]], expected: 0.0 },
      { input: [[-1, -1]], expected: 0.0 },
      { input: [[1, -1]], expected: 0.5 },
    ],
  },
  {
    id: "st-247",
    title: "Elo Expected Score",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Elo expected score of player A against player B: 1 / (1 + 10^((rb - ra) / 400)). The result is between 0 and 1 and equals 0.5 for equal ratings.",
    starterCode: `def elo_expected(ra, rb):
    # Your code here
    pass`,
    solution: `def elo_expected(ra, rb):
    return 1.0 / (1.0 + 10.0 ** ((rb - ra) / 400.0))`,
    testCases: [
      { input: [1500, 1500], expected: 0.5 },
      { input: [1600, 1400], expected: 0.7597469266479578 },
      { input: [1400, 1600], expected: 0.2402530733520421 },
    ],
  },
  {
    id: "st-248",
    title: "Elo Update Magnitude",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the Elo rating change k * (score - expected) for a game where score is 1.0 for a win, 0.5 for a draw, and 0.0 for a loss. The expected score uses the standard 400-point logistic scale.",
    starterCode: `def elo_update(ra, rb, score, k):
    # Your code here
    pass`,
    solution: `def elo_update(ra, rb, score, k):
    expected = 1.0 / (1.0 + 10.0 ** ((rb - ra) / 400.0))
    return k * (score - expected)`,
    testCases: [
      { input: [1500, 1500, 1, 32], expected: 16.0 },
      { input: [1500, 1500, 0, 32], expected: -16.0 },
      { input: [1600, 1400, 1, 16], expected: 3.8440491736326745 },
      { input: [1600, 1400, 1, 0], expected: 0.0 },
    ],
  },
  {
    id: "st-249",
    title: "Bradley-Terry MLE Step",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Perform one MM (minorization-maximization) update for the Bradley-Terry model and normalize the strengths to sum to 1. wins[i][j] counts how often player i beat player j, and strengths holds the current positive values. The update is s_i' = W_i / sum over j != i of (wins[i][j] + wins[j][i]) / (s_i + s_j), with winless players left at 0.0. Return [] for empty input.",
    starterCode: `def bt_mle_step(strengths, wins):
    # Your code here
    pass`,
    solution: `def bt_mle_step(strengths, wins):
    m = len(strengths)
    if m == 0:
        return []
    updated = []
    for i in range(m):
        num = 0
        den = 0.0
        for j in range(m):
            if i == j:
                continue
            num += wins[i][j]
            games = wins[i][j] + wins[j][i]
            if games > 0:
                den += games / (strengths[i] + strengths[j])
        if num == 0 or den == 0:
            updated.append(0.0)
        else:
            updated.append(num / den)
    total = sum(updated)
    if total == 0:
        return [0.0] * m
    return [x / total for x in updated]`,
    testCases: [
      { input: [[1, 1], [[0, 2], [1, 0]]], expected: [0.6666666666666666, 0.3333333333333333] },
      {
        input: [[1, 1, 1], [[0, 1, 0], [0, 0, 1], [1, 0, 0]]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      { input: [[], []], expected: [] },
      { input: [[1, 2], [[0, 0], [0, 0]]], expected: [0.0, 0.0] },
    ],
    hint: "The denominator sums games played scaled by the current strength sum for each opponent.",
  },
  {
    id: "st-250",
    title: "Annotator Agreement Percent",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the percent agreement between two equal-length label lists: 100 * matches / n. Return 0.0 when the lists are empty or their lengths differ.",
    starterCode: `def agreement_percent(a, b):
    # Your code here
    pass`,
    solution: `def agreement_percent(a, b):
    n = len(a)
    if n == 0 or len(b) != n:
        return 0.0
    agree = sum(1 for x, y in zip(a, b) if x == y)
    return 100.0 * agree / n`,
    testCases: [
      { input: [["a", "b", "a"], ["a", "b", "b"]], expected: 66.66666666666667 },
      { input: [[], []], expected: 0.0 },
      { input: [["x"], ["x"]], expected: 100.0 },
      { input: [["a", "b"], ["b", "a"]], expected: 0.0 },
    ],
  },
  {
    id: "st-251",
    title: "Cohen's Kappa Agreement",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return Cohen's kappa (po - pe) / (1 - pe) for two raters, where po is observed agreement and pe is the sum over labels of the product of each rater's label marginals. Return 0.0 when the inputs are empty, have different lengths, or pe equals 1.0.",
    starterCode: `def cohens_kappa(a, b):
    # Your code here
    pass`,
    solution: `def cohens_kappa(a, b):
    n = len(a)
    if n == 0 or len(b) != n:
        return 0.0
    labels = set(a) | set(b)
    po = sum(1 for x, y in zip(a, b) if x == y) / n
    pe = 0.0
    for k in labels:
        ca = sum(1 for x in a if x == k) / n
        cb = sum(1 for y in b if y == k) / n
        pe += ca * cb
    if abs(1.0 - pe) < 1e-12:
        return 0.0
    return (po - pe) / (1.0 - pe)`,
    testCases: [
      { input: [["a", "b", "a", "b"], ["a", "b", "b", "b"]], expected: 0.5 },
      { input: [["a", "a"], ["a", "a"]], expected: 0.0 },
      { input: [["a", "b"], ["b", "a"]], expected: -1.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "st-252",
    title: "Krippendorff Alpha Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Compute nominal Krippendorff's alpha for a list of units, where each unit is a list of ratings from different coders. Build the coincidence matrix with weight 1 / (m_u - 1) per ordered within-unit pair, then return 1 - Do / De, where Do is off-diagonal coincidence mass divided by the total number of ratings and De is the expected off-diagonal mass under independence. Return 0.0 when fewer than two ratings exist or De is zero.",
    starterCode: `def krippendorff_alpha_lite(units):
    # Your code here
    pass`,
    solution: `def krippendorff_alpha_lite(units):
    n = sum(len(u) for u in units)
    if n < 2:
        return 0.0
    coincidences = {}
    for u in units:
        m = len(u)
        if m < 2:
            continue
        weight = 1.0 / (m - 1)
        for i in range(m):
            for j in range(m):
                if i != j:
                    key = (u[i], u[j])
                    coincidences[key] = coincidences.get(key, 0.0) + weight
    marginals = {}
    for (c, k), v in coincidences.items():
        marginals[c] = marginals.get(c, 0.0) + v
    do = 0.0
    for (c, k), v in coincidences.items():
        if c != k:
            do += v
    do /= n
    de = 0.0
    for c in marginals:
        for k in marginals:
            if c != k:
                de += marginals[c] * marginals[k]
    de /= n * (n - 1)
    if de == 0:
        return 0.0
    return 1.0 - do / de`,
    testCases: [
      { input: [[["a", "a"], ["b", "b"], ["a", "b"]]], expected: 0.4444444444444444 },
      { input: [[["a", "a"], ["a", "a"]]], expected: 0.0 },
      { input: [[["a"], ["b"]]], expected: 0.0 },
      { input: [[["a", "b"], ["b", "a"], ["a", "a"]]], expected: -0.25 },
    ],
    hint: "The coincidence matrix mass equals the number of ratings when units are complete.",
  },
  {
    id: "st-253",
    title: "Majority Vote Accuracy",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For each item, pick the most frequent answer in its sample list (ties broken by the lexicographically smallest label) and compare it with the gold answer. Return the fraction of items where the majority answer is correct. Return 0.0 for an empty sample list, and count empty per-item lists as incorrect.",
    starterCode: `def majority_vote_accuracy(samples, gold):
    # Your code here
    pass`,
    solution: `def majority_vote_accuracy(samples, gold):
    if not samples:
        return 0.0
    correct = 0
    for preds, truth in zip(samples, gold):
        if not preds:
            continue
        counts = {}
        for p in preds:
            counts[p] = counts.get(p, 0) + 1
        best = None
        best_count = -1
        for label in sorted(counts):
            if counts[label] > best_count:
                best_count = counts[label]
                best = label
        if best == truth:
            correct += 1
    return correct / len(samples)`,
    testCases: [
      { input: [[["a", "a", "b"], ["b", "b", "a"]], ["a", "b"]], expected: 1.0 },
      { input: [[[], ["a"]], ["a", "a"]], expected: 0.5 },
      { input: [[["x", "y"]], ["z"]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "st-254",
    title: "Judge Position Bias Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Given outcomes where 1 means the response shown first was selected and 0 means the second was selected, return the position bias (first_rate - second_rate) = (2 * first - n) / n. Return 0.0 for an empty list.",
    starterCode: `def position_bias_rate(outcomes):
    # Your code here
    pass`,
    solution: `def position_bias_rate(outcomes):
    if not outcomes:
        return 0.0
    first = sum(1 for o in outcomes if o == 1)
    return (2.0 * first - len(outcomes)) / len(outcomes)`,
    testCases: [
      { input: [[1, 1, 0, 1]], expected: 0.5 },
      { input: [[1, 0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[1, 1, 1, 1]], expected: 1.0 },
    ],
  },
  {
    id: "st-255",
    title: "Judge Verbosity Bias",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Sort items by response length, split into the shorter half and the longer half (dropping the middle item when n is odd), and return the mean score of the longer half minus the mean score of the shorter half. Return 0.0 when fewer than two items are given or the two input lengths disagree.",
    starterCode: `def verbosity_bias(lengths, scores):
    # Your code here
    pass`,
    solution: `def verbosity_bias(lengths, scores):
    n = len(lengths)
    if n < 2 or len(scores) != n:
        return 0.0
    pairs = sorted(zip(lengths, scores))
    k = n // 2
    short = [s for _, s in pairs[:k]]
    long = [s for _, s in pairs[n - k:]]
    return sum(long) / k - sum(short) / k`,
    testCases: [
      { input: [[10, 20, 30, 40], [1.0, 2.0, 3.0, 9.0]], expected: 4.5 },
      { input: [[5, 5], [1.0, 2.0]], expected: 1.0 },
      { input: [[1], [1.0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "st-256",
    title: "Self-Consistency Majority Gain",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "For each item, compare greedy accuracy (the first sample) with majority accuracy (the most frequent sample, ties broken by the lexicographically smallest label). Return majority accuracy minus greedy accuracy averaged over all items. Return 0.0 when samples is empty, and count empty sample lists as incorrect for both strategies.",
    starterCode: `def self_consistency_gain(samples, gold):
    # Your code here
    pass`,
    solution: `def self_consistency_gain(samples, gold):
    if not samples:
        return 0.0
    greedy = 0
    majority = 0
    for preds, truth in zip(samples, gold):
        if not preds:
            continue
        if preds[0] == truth:
            greedy += 1
        counts = {}
        for p in preds:
            counts[p] = counts.get(p, 0) + 1
        best = None
        best_count = -1
        for label in sorted(counts):
            if counts[label] > best_count:
                best_count = counts[label]
                best = label
        if best == truth:
            majority += 1
    return (majority - greedy) / len(samples)`,
    testCases: [
      { input: [[["a", "a", "b"], ["b", "b", "a"]], ["a", "a"]], expected: 0.0 },
      { input: [[["a", "b", "b"]], ["b"]], expected: 1.0 },
      { input: [[[], ["a"]], ["x", "a"]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "st-257",
    title: "Bootstrap CI for Eval Accuracy",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Seed random with seed, draw n_boot bootstrap resamples of the 0/1 outcomes with replacement, and return the percentile interval [low, high] at alpha/2 and 1 - alpha/2 using linear interpolation between closest ranks. Return [0.0, 0.0] when outcomes is empty, n_boot <= 0, or alpha lies outside (0, 1).",
    starterCode: `import random
def bootstrap_accuracy_ci(outcomes, n_boot, seed, alpha):
    # Your code here
    pass`,
    solution: `import random
def bootstrap_accuracy_ci(outcomes, n_boot, seed, alpha):
    n = len(outcomes)
    if n == 0 or n_boot <= 0 or alpha <= 0 or alpha >= 1:
        return [0.0, 0.0]
    random.seed(seed)
    accs = []
    for _ in range(n_boot):
        s = 0
        for _ in range(n):
            s += outcomes[int(random.random() * n)]
        accs.append(s / n)
    accs.sort()
    def pct(p):
        rank = (p / 100.0) * (len(accs) - 1)
        lo = int(rank)
        frac = rank - lo
        if lo >= len(accs) - 1:
            return accs[-1]
        return accs[lo] * (1.0 - frac) + accs[lo + 1] * frac
    return [pct(100.0 * alpha / 2.0), pct(100.0 * (1.0 - alpha / 2.0))]`,
    testCases: [
      { input: [[1, 1, 0, 1, 0, 1, 1, 0], 2000, 42, 0.05], expected: [0.25, 1.0] },
      { input: [[1, 0], 500, 7, 0.1], expected: [0.0, 1.0] },
      { input: [[], 100, 1, 0.05], expected: [0.0, 0.0] },
      { input: [[1, 1, 1], 100, 3, 0.2], expected: [1.0, 1.0] },
    ],
    hint: "Resample indices with int(random.random() * n) using the seeded global RNG.",
  },
  {
    id: "st-258",
    title: "Wilson Interval Bounds",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Wilson score interval [low, high] for successes out of n with critical value z, clamping the bounds to [0, 1]. The center is (p + z^2 / (2n)) / (1 + z^2 / n) and the half-width is z * sqrt(p(1-p)/n + z^2/(4n^2)) / (1 + z^2 / n). Return [0.0, 0.0] when n <= 0.",
    starterCode: `def wilson_bounds(successes, n, z):
    # Your code here
    pass`,
    solution: `def wilson_bounds(successes, n, z):
    if n <= 0:
        return [0.0, 0.0]
    p = successes / n
    z2 = z * z
    denom = 1.0 + z2 / n
    center = (p + z2 / (2.0 * n)) / denom
    half = z * (p * (1.0 - p) / n + z2 / (4.0 * n * n)) ** 0.5 / denom
    lo = center - half
    hi = center + half
    if lo < 0.0:
        lo = 0.0
    if hi > 1.0:
        hi = 1.0
    return [lo, hi]`,
    testCases: [
      { input: [10, 20, 1.96], expected: [0.2992949144298199, 0.7007050855701801] },
      { input: [0, 10, 1.96], expected: [0.0, 0.2775401687666166] },
      { input: [10, 10, 1.96], expected: [0.7224598312333834, 1.0] },
      { input: [0, 0, 1.96], expected: [0.0, 0.0] },
    ],
  },
  {
    id: "st-259",
    title: "Clopper-Pearson Lite",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the exact Clopper-Pearson interval [low, high] for k successes in n trials at significance alpha. Solve the binomial tail equations by bisection over p in [0, 1] using the exact binomial CDF built from math.comb. Return [0.0, 0.0] when n <= 0 and [0.0, 1.0] when alpha lies outside (0, 1).",
    starterCode: `import math
def clopper_pearson(k, n, alpha):
    # Your code here
    pass`,
    solution: `import math
def clopper_pearson(k, n, alpha):
    if n <= 0:
        return [0.0, 0.0]
    if alpha <= 0 or alpha >= 1:
        return [0.0, 1.0]
    def binom_cdf(x, p):
        if x < 0:
            return 0.0
        if x >= n:
            return 1.0
        total = 0.0
        for i in range(0, int(x) + 1):
            total += math.comb(n, i) * (p ** i) * ((1.0 - p) ** (n - i))
        return total
    lo = 0.0
    if k > 0:
        a, b = 0.0, 1.0
        for _ in range(100):
            mid = (a + b) / 2.0
            if 1.0 - binom_cdf(k - 1, mid) < alpha / 2.0:
                a = mid
            else:
                b = mid
        lo = (a + b) / 2.0
    hi = 1.0
    if k < n:
        a, b = 0.0, 1.0
        for _ in range(100):
            mid = (a + b) / 2.0
            if binom_cdf(k, mid) > alpha / 2.0:
                a = mid
            else:
                b = mid
        hi = (a + b) / 2.0
    return [lo, hi]`,
    testCases: [
      { input: [10, 20, 0.05], expected: [0.2719578495607916, 0.7280421504392083] },
      { input: [0, 10, 0.05], expected: [0.0, 0.3084971078187607] },
      { input: [10, 10, 0.05], expected: [0.6915028921812392, 1.0] },
      { input: [3, 10, 0.1], expected: [0.08726443391415034, 0.6066242161054134] },
    ],
    hint: "The lower bound solves P(X >= k; n, p) = alpha/2 and the upper bound solves P(X <= k; n, p) = alpha/2.",
  },
  {
    id: "st-260",
    title: "McNemar Exact p-Value",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the exact two-sided McNemar p-value for b and c discordant pairs: 2 * P(X <= min(b, c)) for X ~ Binomial(b + c, 0.5), capped at 1.0. Use exact binomial coefficients. Return 1.0 when b + c is zero.",
    starterCode: `import math
def mcnemar_exact_p(b, c):
    # Your code here
    pass`,
    solution: `import math
def mcnemar_exact_p(b, c):
    n = b + c
    if n == 0:
        return 1.0
    m = b if b < c else c
    tail = 0.0
    for i in range(m + 1):
        tail += math.comb(n, i)
    tail *= 0.5 ** n
    p = 2.0 * tail
    return p if p < 1.0 else 1.0`,
    testCases: [
      { input: [10, 2], expected: 0.03857421875 },
      { input: [5, 5], expected: 1.0 },
      { input: [0, 0], expected: 1.0 },
      { input: [20, 8], expected: 0.03569813817739487 },
    ],
  },
  {
    id: "st-261",
    title: "Paired Bootstrap Delta",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Seed random with seed, resample item indices with replacement n_boot times, and return the percentile interval of mean(a) - mean(b) at alpha/2 and 1 - alpha/2 using linear interpolation. a and b are paired 0/1 outcome lists of equal length. Return [0.0, 0.0] when the inputs are empty, misaligned, or the parameters are invalid.",
    starterCode: `import random
def paired_bootstrap_delta(a, b, n_boot, seed, alpha):
    # Your code here
    pass`,
    solution: `import random
def paired_bootstrap_delta(a, b, n_boot, seed, alpha):
    n = len(a)
    if n == 0 or n != len(b) or n_boot <= 0 or alpha <= 0 or alpha >= 1:
        return [0.0, 0.0]
    random.seed(seed)
    deltas = []
    for _ in range(n_boot):
        sa = 0
        sb = 0
        for _ in range(n):
            i = int(random.random() * n)
            sa += a[i]
            sb += b[i]
        deltas.append((sa - sb) / n)
    deltas.sort()
    def pct(p):
        rank = (p / 100.0) * (len(deltas) - 1)
        lo = int(rank)
        frac = rank - lo
        if lo >= len(deltas) - 1:
            return deltas[-1]
        return deltas[lo] * (1.0 - frac) + deltas[lo + 1] * frac
    return [pct(100.0 * alpha / 2.0), pct(100.0 * (1.0 - alpha / 2.0))]`,
    testCases: [
      { input: [[1, 1, 0, 1, 0, 1], [1, 0, 0, 1, 0, 1], 1000, 99, 0.05], expected: [0.0, 0.5] },
      { input: [[1, 0], [0, 1], 500, 5, 0.1], expected: [-1.0, 1.0] },
      { input: [[], [], 100, 1, 0.05], expected: [0.0, 0.0] },
      { input: [[1, 1], [1, 1], 200, 2, 0.05], expected: [0.0, 0.0] },
    ],
    hint: "Use the same resampled index for both models so the comparison stays paired.",
  },
  {
    id: "st-262",
    title: "Minimum Detectable Effect",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the minimum detectable effect for a two-sided test: (z(1 - alpha/2) + z(power)) * sqrt(2 * variance / n), where z is the standard normal quantile obtained by bisecting the normal CDF. Return 0.0 when n <= 0, variance <= 0, or alpha or power lie outside (0, 1).",
    starterCode: `import math
def minimum_detectable_effect(n, variance, alpha, power):
    # Your code here
    pass`,
    solution: `import math
def minimum_detectable_effect(n, variance, alpha, power):
    if n <= 0 or variance <= 0 or alpha <= 0 or alpha >= 1 or power <= 0 or power >= 1:
        return 0.0
    def inv_norm(p):
        a, b = -10.0, 10.0
        for _ in range(200):
            mid = (a + b) / 2.0
            cdf = 0.5 * (1.0 + math.erf(mid / math.sqrt(2.0)))
            if cdf < p:
                a = mid
            else:
                b = mid
        return (a + b) / 2.0
    z_alpha = inv_norm(1.0 - alpha / 2.0)
    z_power = inv_norm(power)
    return (z_alpha + z_power) * math.sqrt(2.0 * variance / n)`,
    testCases: [
      { input: [100, 0.25, 0.05, 0.8], expected: 0.19810199057996716 },
      { input: [400, 1.0, 0.05, 0.9], expected: 0.22920976267865004 },
      { input: [0, 1.0, 0.05, 0.8], expected: 0.0 },
      { input: [100, 0.0, 0.05, 0.8], expected: 0.0 },
    ],
    hint: "Bisect the normal CDF, which is 0.5 * (1 + erf(x / sqrt(2))).",
  },
  {
    id: "st-263",
    title: "Sample Size for an Eval Rate",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the required sample size ceiling for estimating a rate p within absolute error using critical value z: ceil(z^2 * p * (1 - p) / error^2). Return 0 when p is not strictly between 0 and 1, or when error or z is non-positive.",
    starterCode: `import math
def eval_sample_size(p, error, z):
    # Your code here
    pass`,
    solution: `import math
def eval_sample_size(p, error, z):
    if p <= 0 or p >= 1 or error <= 0 or z <= 0:
        return 0
    return int(math.ceil(z * z * p * (1.0 - p) / (error * error)))`,
    testCases: [
      { input: [0.5, 0.05, 1.96], expected: 385 },
      { input: [0.8, 0.02, 2.576], expected: 2655 },
      { input: [0.5, 0.0, 1.96], expected: 0 },
      { input: [0.0, 0.05, 1.96], expected: 0 },
    ],
  },
  {
    id: "st-264",
    title: "Power of a Two-Sided Eval",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Return the power Phi(shift - z) + Phi(-shift - z) of a two-sided test, where shift = |delta| * sqrt(n / variance) and z is the 1 - alpha/2 normal quantile. Phi is the standard normal CDF computed with math.erf. Return 0.0 when n <= 0, variance <= 0, or alpha lies outside (0, 1), and clamp the result to [0, 1].",
    starterCode: `import math
def eval_power(delta, n, variance, alpha):
    # Your code here
    pass`,
    solution: `import math
def eval_power(delta, n, variance, alpha):
    if n <= 0 or variance <= 0 or alpha <= 0 or alpha >= 1:
        return 0.0
    if delta < 0:
        delta = -delta
    def inv_norm(p):
        a, b = -10.0, 10.0
        for _ in range(200):
            mid = (a + b) / 2.0
            cdf = 0.5 * (1.0 + math.erf(mid / math.sqrt(2.0)))
            if cdf < p:
                a = mid
            else:
                b = mid
        return (a + b) / 2.0
    def phi(x):
        return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    z = inv_norm(1.0 - alpha / 2.0)
    shift = delta * math.sqrt(n / variance)
    power = phi(shift - z) + phi(-shift - z)
    if power < 0.0:
        return 0.0
    if power > 1.0:
        return 1.0
    return power`,
    testCases: [
      { input: [0.05, 400, 0.25, 0.05], expected: 0.5160052739761751 },
      { input: [0.1, 100, 1.0, 0.05], expected: 0.17007504575308774 },
      { input: [0.0, 100, 1.0, 0.05], expected: 0.050000000000000155 },
      { input: [0.05, 0, 1.0, 0.05], expected: 0.0 },
    ],
    hint: "At delta = 0 the two-sided power equals alpha.",
  },
  {
    id: "st-265",
    title: "Variance of a Rate Estimate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the variance p * (1 - p) / n of a binomial rate estimate. Return 0.0 when n <= 0.",
    starterCode: `def rate_variance(p, n):
    # Your code here
    pass`,
    solution: `def rate_variance(p, n):
    if n <= 0:
        return 0.0
    return p * (1.0 - p) / n`,
    testCases: [
      { input: [0.5, 100], expected: 0.0025 },
      { input: [0.8, 0], expected: 0.0 },
      { input: [1.0, 50], expected: 0.0 },
      { input: [0.0, 10], expected: 0.0 },
    ],
  },
  {
    id: "st-266",
    title: "Stratified Eval Weights",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the sample-size-weighted average of per-stratum accuracies: sum(acc_i * size_i) / sum(size_i). Return 0.0 when the inputs are empty, have different lengths, or the total size is zero.",
    starterCode: `def stratified_accuracy(accs, sizes):
    # Your code here
    pass`,
    solution: `def stratified_accuracy(accs, sizes):
    total = sum(sizes)
    if not accs or len(accs) != len(sizes) or total == 0:
        return 0.0
    return sum(a * s for a, s in zip(accs, sizes)) / total`,
    testCases: [
      { input: [[0.8, 0.5], [100, 100]], expected: 0.65 },
      { input: [[0.9], [0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.6, 0.7, 0.8], [10, 20, 70]], expected: 0.76 },
    ],
  },
  {
    id: "st-267",
    title: "Contamination Overlap Rate",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the fraction of eval items whose exact string appears in the training item list. Return 0.0 when the eval list is empty.",
    starterCode: `def contamination_rate(eval_items, train_items):
    # Your code here
    pass`,
    solution: `def contamination_rate(eval_items, train_items):
    if not eval_items:
        return 0.0
    train = set(train_items)
    hits = sum(1 for x in eval_items if x in train)
    return hits / len(eval_items)`,
    testCases: [
      { input: [["a", "b", "c"], ["b", "c", "d"]], expected: 0.6666666666666666 },
      { input: [["x"], []], expected: 0.0 },
      { input: [[], ["a"]], expected: 0.0 },
      { input: [["a", "a"], ["a"]], expected: 1.0 },
    ],
  },
  {
    id: "st-268",
    title: "MinHash Jaccard Estimate",
    category: "Statistics",
    difficulty: "Hard",
    description:
      "Estimate the Jaccard similarity of two string collections with num_hashes independent MinHash functions and return the fraction of matching signature minima. Hash each string with a deterministic FNV-style rolling hash, then for each seed i compute min over elements of (x * (i + 1) + offset) mod 1000000007 as that signature position. Return 0.0 when num_hashes <= 0 or either collection is empty.",
    starterCode: `def minhash_jaccard(a, b, num_hashes):
    # Your code here
    pass`,
    solution: `def minhash_jaccard(a, b, num_hashes):
    if num_hashes <= 0:
        return 0.0
    def base_hash(s):
        mod = 1000000007
        h = 2166136261
        for ch in s:
            h = ((h ^ ord(ch)) * 16777619) % mod
        return h
    ha = [base_hash(s) for s in set(a)]
    hb = [base_hash(s) for s in set(b)]
    if not ha or not hb:
        return 0.0
    mod = 1000000007
    matches = 0
    for i in range(num_hashes):
        mul = i + 1
        add = (i * 2654435761 + 12345) % mod
        ma = min((x * mul + add) % mod for x in ha)
        mb = min((x * mul + add) % mod for x in hb)
        if ma == mb:
            matches += 1
    return matches / num_hashes`,
    testCases: [
      { input: [["the", "cat", "sat"], ["the", "cat", "ran"], 4], expected: 0.5 },
      { input: [["a", "b"], ["a", "b"], 8], expected: 1.0 },
      { input: [["a"], ["b"], 5], expected: 0.0 },
      { input: [["a", "b", "c"], ["c", "b", "a"], 10], expected: 1.0 },
    ],
    hint: "Identical sets always produce identical minima, so every signature position matches.",
  },
  {
    id: "st-269",
    title: "Dedup Threshold Decision",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return a list of booleans marking which similarity scores are greater than or equal to the threshold. Return an empty list for empty input.",
    starterCode: `def dedup_flags(similarities, threshold):
    # Your code here
    pass`,
    solution: `def dedup_flags(similarities, threshold):
    return [s >= threshold for s in similarities]`,
    testCases: [
      { input: [[0.9, 0.8, 0.95], 0.9], expected: [true, false, true] },
      { input: [[], 0.5], expected: [] },
      { input: [[0.1], 0.0], expected: [true] },
      { input: [[1.0, 0.99], 0.995], expected: [true, false] },
    ],
  },
  {
    id: "st-270",
    title: "N-gram Overlap Dedup",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the Jaccard similarity between the sets of whitespace-token n-grams of strings a and b. Return 0.0 when n <= 0 or either string produces no n-grams.",
    starterCode: `def ngram_jaccard(a, b, n):
    # Your code here
    pass`,
    solution: `def ngram_jaccard(a, b, n):
    if n <= 0:
        return 0.0
    ta = a.split()
    tb = b.split()
    ga = set(tuple(ta[i:i + n]) for i in range(len(ta) - n + 1))
    gb = set(tuple(tb[i:i + n]) for i in range(len(tb) - n + 1))
    if not ga or not gb:
        return 0.0
    return len(ga & gb) / len(ga | gb)`,
    testCases: [
      { input: ["the cat sat", "the cat ran", 1], expected: 0.5 },
      { input: ["a b c", "a b c", 2], expected: 1.0 },
      { input: ["a b", "c d", 1], expected: 0.0 },
      { input: ["a b c d", "a b c e", 3], expected: 0.3333333333333333 },
    ],
  },
  {
    id: "st-271",
    title: "Data Mixing Weight Effect",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the change in loss when mixing weights are sharpened by a temperature: L(mix) - L(base), where L(mix) uses weights normalized after raising them to the temperature and L(base) uses the raw normalized weights. Return 0.0 when the inputs are empty or misaligned, temperature <= 0, or the total weight is zero.",
    starterCode: `def mix_loss_effect(losses, weights, temperature):
    # Your code here
    pass`,
    solution: `def mix_loss_effect(losses, weights, temperature):
    if not losses or len(losses) != len(weights) or temperature <= 0:
        return 0.0
    total_w = sum(weights)
    if total_w == 0:
        return 0.0
    base = sum(l * w for l, w in zip(losses, weights)) / total_w
    powered = []
    for w in weights:
        if w <= 0:
            powered.append(0.0)
        else:
            powered.append(w ** temperature)
    total = sum(powered)
    if total == 0:
        return 0.0
    mixed = sum(l * p for l, p in zip(losses, powered)) / total
    return mixed - base`,
    testCases: [
      { input: [[1.0, 3.0], [0.5, 0.5], 2.0], expected: 0.0 },
      { input: [[1.0, 10.0], [0.9, 0.1], 2.0], expected: -0.7902439024390244 },
      { input: [[2.0, 4.0], [0.5, 0.5], 1.0], expected: 0.0 },
      { input: [[], [], 2.0], expected: 0.0 },
    ],
  },
  {
    id: "st-272",
    title: "Curriculum Mixing Ratio",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return a linearly ramped mixing ratio: start at step 0, reach end at step = warmup, and stay clamped to [start, end] afterwards. A non-positive warmup jumps straight to end.",
    starterCode: `def curriculum_ratio(step, warmup, start, end):
    # Your code here
    pass`,
    solution: `def curriculum_ratio(step, warmup, start, end):
    if warmup <= 0:
        frac = 1.0
    else:
        frac = step / warmup
        if frac < 0.0:
            frac = 0.0
        if frac > 1.0:
            frac = 1.0
    return start + (end - start) * frac`,
    testCases: [
      { input: [0, 100, 0.1, 0.9], expected: 0.1 },
      { input: [50, 100, 0.1, 0.9], expected: 0.5 },
      { input: [100, 100, 0.1, 0.9], expected: 0.9 },
      { input: [150, 100, 0.1, 0.9], expected: 0.9 },
      { input: [10, 0, 0.2, 0.8], expected: 0.8 },
    ],
  },
  {
    id: "st-273",
    title: "Drift Detection Threshold",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Return the upper control limit mean + k * population_std for a reference sample, where population std divides the sum of squared deviations by n. Return 0.0 when the reference is empty.",
    starterCode: `def drift_threshold(reference, k):
    # Your code here
    pass`,
    solution: `def drift_threshold(reference, k):
    n = len(reference)
    if n == 0:
        return 0.0
    mean = sum(reference) / n
    var = sum((x - mean) ** 2 for x in reference) / n
    return mean + k * var ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3.0], expected: 7.242640687119286 },
      { input: [[5, 5, 5], 2.0], expected: 5.0 },
      { input: [[], 2.0], expected: 0.0 },
      { input: [[0, 10], 1.0], expected: 10.0 },
    ],
  },
  {
    id: "st-274",
    title: "PSI Computation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the population stability index between two aligned lists of bin proportions: sum((actual - expected) * ln(actual / expected)). Proportions at or below 1e-6 are smoothed to 1e-6, and bins where both are non-positive are skipped. Return 0.0 when the inputs are empty or their lengths differ.",
    starterCode: `import math
def psi(expected, actual):
    # Your code here
    pass`,
    solution: `import math
def psi(expected, actual):
    if not expected or len(expected) != len(actual):
        return 0.0
    eps = 1e-6
    total = 0.0
    for e, a in zip(expected, actual):
        if e <= 0 and a <= 0:
            continue
        e2 = e if e > eps else eps
        a2 = a if a > eps else eps
        total += (a2 - e2) * math.log(a2 / e2)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.6, 0.4]], expected: 0.04054651081081642 },
      { input: [[0.25, 0.25, 0.5], [0.2, 0.3, 0.5]], expected: 0.02027325540540821 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.5], [0.5]], expected: 0.0 },
    ],
  },
  {
    id: "st-275",
    title: "One-Sample KS Drift Statistic",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Return the one-sample Kolmogorov-Smirnov statistic of data against the Uniform(0, 1) distribution: the maximum of |(i + 1) / n - x_(i)| and |x_(i) - i / n| over sorted values x_(i). Return 0.0 for empty data.",
    starterCode: `def ks_uniform(data):
    # Your code here
    pass`,
    solution: `def ks_uniform(data):
    n = len(data)
    if n == 0:
        return 0.0
    xs = sorted(data)
    d = 0.0
    for i, x in enumerate(xs):
        lo = i / n
        hi = (i + 1) / n
        if abs(hi - x) > d:
            d = abs(hi - x)
        if abs(x - lo) > d:
            d = abs(x - lo)
    return d`,
    testCases: [
      { input: [[0.1, 0.4, 0.35, 0.8]], expected: 0.35 },
      { input: [[0.5, 0.5]], expected: 0.5 },
      { input: [[]], expected: 0.0 },
      { input: [[0.0, 1.0]], expected: 0.5 },
    ],
  },
];
