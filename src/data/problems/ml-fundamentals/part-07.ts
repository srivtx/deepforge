import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-226",
    title: "Feature Crossing Hash",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Hash a crossed categorical pair into a bucket. Build the key str(a) + '_' + str(b) and fold each character with h = (h * 31 + ord(ch)) mod num_buckets.\n\nReturn the bucket index; a non-positive num_buckets returns 0.",
    starterCode: `def feature_cross_hash(a, b, num_buckets):
    # Your code here
    pass`,
    solution: `def feature_cross_hash(a, b, num_buckets):
    if num_buckets <= 0:
        return 0
    key = str(a) + "_" + str(b)
    h = 0
    for ch in key:
        h = (h * 31 + ord(ch)) % num_buckets
    return h`,
    testCases: [
      { input: ["red", "S", 10], expected: 3 },
      { input: [1, 2, 10], expected: 4 },
      { input: ["cat", "dog", 7], expected: 0 },
      { input: ["x", "y", 5], expected: 1 },
    ],
    hint: "Crossing two categoricals then hashing keeps the feature space bounded.",
  },
  {
    id: "ml-227",
    title: "Weight of Evidence",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the weight of evidence for one bin: ln((good_c/good_total) / (bad_c/bad_total)), clipping each distribution share to at least 1e-6.\n\nReturn 0.0 if a total is 0.",
    starterCode: `import math
def woe(good_c, bad_c, good_total, bad_total):
    # Your code here
    pass`,
    solution: `import math
def woe(good_c, bad_c, good_total, bad_total):
    if good_total == 0 or bad_total == 0:
        return 0.0
    dist_good = max(good_c / good_total, 1e-6)
    dist_bad = max(bad_c / bad_total, 1e-6)
    return math.log(dist_good / dist_bad)`,
    testCases: [
      { input: [30, 10, 100, 100], expected: 1.0986122886681096 },
      { input: [20, 40, 100, 100], expected: -0.6931471805599453 },
      { input: [50, 50, 100, 100], expected: 0.0 },
      { input: [0, 10, 100, 100], expected: -11.512925464970229 },
    ],
    hint: "WOE compares the good and bad distributions inside a bin.",
  },
  {
    id: "ml-228",
    title: "Information Value",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the information value of a binned feature: sum over bins of (good_share - bad_share) * ln(good_share / bad_share), clipping shares to at least 1e-6.\n\nReturn 0.0 if a total is 0.",
    starterCode: `import math
def information_value(good_counts, bad_counts):
    # Your code here
    pass`,
    solution: `import math
def information_value(good_counts, bad_counts):
    good_total = sum(good_counts)
    bad_total = sum(bad_counts)
    if good_total == 0 or bad_total == 0:
        return 0.0
    iv = 0.0
    for i in range(len(good_counts)):
        dist_good = max(good_counts[i] / good_total, 1e-6)
        dist_bad = max(bad_counts[i] / bad_total, 1e-6)
        iv += (dist_good - dist_bad) * math.log(dist_good / dist_bad)
    return iv`,
    testCases: [
      { input: [[30, 20, 50], [10, 40, 50]], expected: 0.35835189384561095 },
      { input: [[50, 50], [50, 50]], expected: 0.0 },
      { input: [[80, 20], [20, 80]], expected: 1.663553233343869 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "IV sums each bin's share difference weighted by its WOE.",
  },
  {
    id: "ml-229",
    title: "Monotonic Binning Check",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Check whether a sequence of WOE values is monotonic: either non-decreasing or non-increasing throughout.\n\nSequences with fewer than two values return True.",
    starterCode: `def is_monotonic(woe_values):
    # Your code here
    pass`,
    solution: `def is_monotonic(woe_values):
    n = len(woe_values)
    if n < 2:
        return True
    non_dec = all(woe_values[i] <= woe_values[i + 1] for i in range(n - 1))
    non_inc = all(woe_values[i] >= woe_values[i + 1] for i in range(n - 1))
    return non_dec or non_inc`,
    testCases: [
      { input: [[0.1, 0.2, 0.3]], expected: true },
      { input: [[0.3, 0.2, 0.1]], expected: true },
      { input: [[0.1, 0.3, 0.2]], expected: false },
      { input: [[]], expected: true },
      { input: [[0.5]], expected: true },
    ],
    hint: "Monotonic WOE across bins is a common scorecard requirement.",
  },
  {
    id: "ml-230",
    title: "Scorecard PDO Scaling",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Convert odds to a scorecard score using points to double the odds: factor = pdo / ln(2), offset = base_score - factor * ln(base_odds), score = offset + factor * ln(odds).\n\nReturn 0.0 if odds or base_odds is not positive.",
    starterCode: `import math
def scorecard_score(odds, pdo, base_score, base_odds):
    # Your code here
    pass`,
    solution: `import math
def scorecard_score(odds, pdo, base_score, base_odds):
    if odds <= 0 or base_odds <= 0:
        return 0.0
    factor = pdo / math.log(2.0)
    offset = base_score - factor * math.log(base_odds)
    return offset + factor * math.log(odds)`,
    testCases: [
      { input: [1, 20, 600, 1], expected: 600.0 },
      { input: [2, 20, 600, 1], expected: 620.0 },
      { input: [0.5, 20, 600, 1], expected: 580.0 },
      { input: [10, 20, 600, 1], expected: 666.4385618977473 },
    ],
    hint: "Doubling the odds should add exactly PDO points to the score.",
  },
  {
    id: "ml-231",
    title: "KS Statistic from Scores",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the KS statistic from a binary label list and scores: the maximum absolute gap between the cumulative TPR and FPR over all thresholds.\n\nReturn 0.0 when the input is empty or a class is missing.",
    starterCode: `def ks_from_scores(y_true, scores):
    # Your code here
    pass`,
    solution: `def ks_from_scores(y_true, scores):
    n = len(y_true)
    if n == 0:
        return 0.0
    P = sum(1 for t in y_true if t == 1)
    N = n - P
    if P == 0 or N == 0:
        return 0.0
    best = 0.0
    points = [[0.0, 0.0]]
    for thr in sorted(set(scores), reverse=True):
        preds = [1 if s >= thr else 0 for s in scores]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        fp = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 1)
        points.append([fp / N, tp / P])
    for fpr, tpr in points:
        best = max(best, abs(tpr - fpr))
    return best`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]], expected: 0.5 },
      { input: [[0, 1, 0, 1], [0.9, 0.8, 0.2, 0.7]], expected: 0.5 },
      { input: [[1, 1, 1], [0.1, 0.5, 0.9]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "KS is the maximum separation between the TPR and FPR curves.",
  },
  {
    id: "ml-232",
    title: "Gini from AUC",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Convert AUC to the Gini coefficient: Gini = 2 * AUC - 1.",
    starterCode: `def gini_from_auc(auc):
    # Your code here
    pass`,
    solution: `def gini_from_auc(auc):
    return 2.0 * auc - 1.0`,
    testCases: [
      { input: [0.5], expected: 0.0 },
      { input: [0.7], expected: 0.3999999999999999 },
      { input: [1.0], expected: 1.0 },
      { input: [0.0], expected: -1.0 },
    ],
    hint: "The Gini coefficient rescales AUC so that random is 0 and perfect is 1.",
  },
  {
    id: "ml-233",
    title: "Cumulative Gains",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the cumulative gains curve: sort by score descending (ties by original index) and return the cumulative share of positives captured after each sample.\n\nReturn [] when there are no positive labels or the input is empty.",
    starterCode: `def cumulative_gains(y_true, scores):
    # Your code here
    pass`,
    solution: `def cumulative_gains(y_true, scores):
    n = len(y_true)
    total_pos = sum(y_true)
    if n == 0 or total_pos == 0:
        return []
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    hits = 0
    result = []
    for i in order:
        if y_true[i] == 1:
            hits += 1
        result.append(hits / total_pos)
    return result`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.8, 0.9]], expected: [0.5, 1.0, 1.0, 1.0] },
      { input: [[1, 0, 1], [0.5, 0.9, 0.5]], expected: [0.0, 0.5, 1.0] },
      { input: [[0, 0], [0.1, 0.2]], expected: [] },
      { input: [[], []], expected: [] },
    ],
    hint: "Gains rise fastest when the highest-scored samples are the true positives.",
  },
  {
    id: "ml-234",
    title: "Decile Response Rate",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the response rate per decile. Sort by score descending (ties by original index) and split into min(10, n) equal contiguous chunks.\n\nReturn the mean label of each chunk; empty input returns [].",
    starterCode: `def decile_response_rate(y_true, scores):
    # Your code here
    pass`,
    solution: `def decile_response_rate(y_true, scores):
    n = len(y_true)
    if n == 0:
        return []
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    g = min(10, n)
    result = []
    for d in range(g):
        start = d * n // g
        end = (d + 1) * n // g
        members = order[start:end]
        if members:
            result.append(sum(y_true[i] for i in members) / len(members))
    return result`,
    testCases: [
      { input: [[1, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]], expected: [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0] },
      { input: [[1, 1, 1, 1, 0, 0, 0, 0], [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]], expected: [1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0] },
      { input: [[1, 0, 1], [0.9, 0.5, 0.1]], expected: [1.0, 0.0, 1.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "Response rates should generally decline across ranked deciles for a useful model.",
  },
  {
    id: "ml-235",
    title: "Response Rate Uplift by Decile",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the response-rate uplift per decile: the decile response rate minus the overall response rate, using the same sorting and chunking as decile rates.\n\nEmpty input returns [].",
    starterCode: `def response_rate_uplift(y_true, scores):
    # Your code here
    pass`,
    solution: `def response_rate_uplift(y_true, scores):
    n = len(y_true)
    if n == 0:
        return []
    overall = sum(y_true) / n
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    g = min(10, n)
    result = []
    for d in range(g):
        start = d * n // g
        end = (d + 1) * n // g
        members = order[start:end]
        if members:
            result.append(sum(y_true[i] for i in members) / len(members) - overall)
    return result`,
    testCases: [
      { input: [[1, 0, 1, 0, 1, 0, 1, 0, 1, 0], [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]], expected: [0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5] },
      { input: [[1, 1, 0, 0], [0.9, 0.8, 0.7, 0.6]], expected: [0.5, 0.5, -0.5, -0.5] },
      { input: [[], []], expected: [] },
    ],
    hint: "Uplift compares each decile's response against the base rate.",
  },
  {
    id: "ml-236",
    title: "Revenue Optimization Threshold",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Choose the probability threshold that maximizes expected profit. For each unique probability t, act on samples with p >= t and earn p * value - cost per action.\n\nReturn [best_threshold, best_profit]; ties keep the smallest threshold and empty input returns [0.0, 0.0].",
    starterCode: `def revenue_optimization(probs, values, cost):
    # Returns [best_threshold, best_profit]
    # Your code here
    pass`,
    solution: `def revenue_optimization(probs, values, cost):
    if not probs:
        return [0.0, 0.0]
    best_thr = 0.0
    best_profit = None
    for thr in sorted(set(probs)):
        profit = 0.0
        for p, v in zip(probs, values):
            if p >= thr:
                profit += p * v - cost
        if best_profit is None or profit > best_profit:
            best_profit = profit
            best_thr = thr
    return [best_thr, best_profit]`,
    testCases: [
      { input: [[0.9, 0.6, 0.3], [10, 10, 10], 2], expected: [0.3, 12.0] },
      { input: [[0.2, 0.25], [100, 100], 10], expected: [0.2, 25.0] },
      { input: [[0.1], [100], 5], expected: [0.1, 5.0] },
      { input: [[0.01], [1], 10], expected: [0.01, -9.99] },
    ],
    hint: "Act whenever the expected value p * value exceeds the action cost.",
  },
  {
    id: "ml-237",
    title: "Expected Value Decision Threshold",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the break-even probability for acting: cost / value.\n\nReturn 0.0 when value <= 0.",
    starterCode: `def expected_value_threshold(cost, value):
    # Your code here
    pass`,
    solution: `def expected_value_threshold(cost, value):
    if value <= 0:
        return 0.0
    return cost / value`,
    testCases: [
      { input: [2, 10], expected: 0.2 },
      { input: [5, 5], expected: 1.0 },
      { input: [0, 10], expected: 0.0 },
      { input: [3, 0], expected: 0.0 },
    ],
    hint: "Above the break-even probability the action has positive expected value.",
  },
  {
    id: "ml-238",
    title: "Cost Matrix Prediction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict the class with the lowest expected cost. cost_matrix[true][pred]; for probability p of class 1, compare p*C[1][0] + (1-p)*C[0][0] against p*C[1][1] + (1-p)*C[0][1].\n\nReturn 1 when predicting 1 is no more costly, else 0; empty input returns [].",
    starterCode: `def cost_matrix_predict(probs, cost_matrix):
    # Your code here
    pass`,
    solution: `def cost_matrix_predict(probs, cost_matrix):
    result = []
    for p in probs:
        cost_0 = p * cost_matrix[1][0] + (1 - p) * cost_matrix[0][0]
        cost_1 = p * cost_matrix[1][1] + (1 - p) * cost_matrix[0][1]
        result.append(1 if cost_1 <= cost_0 else 0)
    return result`,
    testCases: [
      { input: [[0.2, 0.5, 0.8], [[0, 1], [1, 0]]], expected: [0, 1, 1] },
      { input: [[0.2, 0.8, 0.9], [[0, 5], [1, 0]]], expected: [0, 0, 1] },
      { input: [[0.5], [[0, 2], [4, 0]]], expected: [1] },
      { input: [[], [[0, 1], [1, 0]]], expected: [] },
    ],
    hint: "Asymmetric misclassification costs shift the effective decision threshold away from 0.5.",
  },
  {
    id: "ml-239",
    title: "Threshold Sweep Best F1",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Find the probability threshold maximizing F1. Sweep unique probabilities from high to low, predicting positive when p >= t, and keep the best F1 (ties keep the highest threshold).\n\nReturn [threshold, f1]; no positive labels or empty input returns [0.0, 0.0].",
    starterCode: `def best_f1_threshold(y_true, probs):
    # Returns [threshold, f1]
    # Your code here
    pass`,
    solution: `def best_f1_threshold(y_true, probs):
    if not y_true or sum(y_true) == 0:
        return [0.0, 0.0]
    best_thr = 0.0
    best_f1 = -1.0
    for thr in sorted(set(probs), reverse=True):
        preds = [1 if p >= thr else 0 for p in probs]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        fp = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 1)
        fn = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 0)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
        if f1 > best_f1:
            best_f1 = f1
            best_thr = thr
    return [best_thr, best_f1]`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]], expected: [0.35, 0.8] },
      { input: [[1, 1, 1], [0.2, 0.5, 0.8]], expected: [0.2, 1.0] },
      { input: [[0, 0], [0.1, 0.9]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [0.0, 0.0] },
    ],
    hint: "F1 balances precision and recall, so the best threshold need not be 0.5.",
  },
  {
    id: "ml-240",
    title: "Threshold for Given Precision",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Find the threshold with the highest recall subject to precision >= target. Sweep unique probabilities from high to low.\n\nReturn the threshold (0.0 if none qualifies), with ties keeping the higher threshold.",
    starterCode: `def threshold_for_precision(y_true, probs, target):
    # Your code here
    pass`,
    solution: `def threshold_for_precision(y_true, probs, target):
    if not y_true or sum(y_true) == 0:
        return 0.0
    best_thr = 0.0
    best_rec = -1.0
    for thr in sorted(set(probs), reverse=True):
        preds = [1 if p >= thr else 0 for p in probs]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        fp = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 1)
        fn = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 0)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        if prec >= target and rec > best_rec:
            best_rec = rec
            best_thr = thr
    return best_thr`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.8], expected: 0.8 },
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.6], expected: 0.35 },
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.5], expected: 0.35 },
      { input: [[0, 0], [0.1, 0.9], 0.5], expected: 0.0 },
    ],
    hint: "Lower thresholds raise recall but erode precision; pick the most permissive feasible one.",
  },
  {
    id: "ml-241",
    title: "Threshold for Given Recall",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Find the highest threshold whose recall is at least target. Sweep unique probabilities from high to low and return the first feasible threshold.\n\nReturn 0.0 if none qualifies or there are no positive labels.",
    starterCode: `def threshold_for_recall(y_true, probs, target):
    # Your code here
    pass`,
    solution: `def threshold_for_recall(y_true, probs, target):
    if not y_true or sum(y_true) == 0:
        return 0.0
    P = sum(y_true)
    for thr in sorted(set(probs), reverse=True):
        preds = [1 if p >= thr else 0 for p in probs]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        if tp / P >= target:
            return thr
    return 0.0`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 1.0], expected: 0.35 },
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.5], expected: 0.8 },
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.6], expected: 0.35 },
      { input: [[0, 0], [0.1, 0.9], 0.5], expected: 0.0 },
    ],
    hint: "A higher threshold is preferable when it still meets the recall requirement.",
  },
  {
    id: "ml-242",
    title: "Sensitivity at Specificity",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Find the threshold with the highest sensitivity subject to specificity >= target_specificity. Sweep unique probabilities from high to low.\n\nReturn [threshold, sensitivity]; ties keep the higher threshold, and [0.0, 0.0] when nothing qualifies.",
    starterCode: `def sensitivity_at_specificity(y_true, probs, target_specificity):
    # Returns [threshold, sensitivity]
    # Your code here
    pass`,
    solution: `def sensitivity_at_specificity(y_true, probs, target_specificity):
    if not y_true or sum(y_true) == 0:
        return [0.0, 0.0]
    n = len(y_true)
    P = sum(y_true)
    N = n - P
    if N == 0:
        return [0.0, 0.0]
    best_thr = 0.0
    best_sens = -1.0
    for thr in sorted(set(probs), reverse=True):
        preds = [1 if p >= thr else 0 for p in probs]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        tn = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 0)
        spec = tn / N
        sens = tp / P
        if spec >= target_specificity and sens > best_sens:
            best_sens = sens
            best_thr = thr
    return [best_thr, best_sens]`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 1.0], expected: [0.8, 0.5] },
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 0.5], expected: [0.35, 1.0] },
      { input: [[1, 1], [0.2, 0.8], 1.0], expected: [0.0, 0.0] },
      { input: [[], [], 1.0], expected: [0.0, 0.0] },
    ],
    hint: "Trading specificity for sensitivity traces the ROC curve from the conservative end.",
  },
  {
    id: "ml-243",
    title: "PR AUC Trapezoid",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the area under a precision-recall curve with the trapezoidal rule. For each distinct recall keep the maximum precision, sort by recall, and sum (r1 - r0) * (p0 + p1) / 2.\n\nReturn 0.0 with fewer than two distinct recall values.",
    starterCode: `def pr_auc_trapezoid(pr_points):
    # Your code here
    pass`,
    solution: `def pr_auc_trapezoid(pr_points):
    if len(pr_points) < 2:
        return 0.0
    best = {}
    for p, r in pr_points:
        if r not in best or p > best[r]:
            best[r] = p
    recalls = sorted(best.keys())
    area = 0.0
    for i in range(len(recalls) - 1):
        r0 = recalls[i]
        r1 = recalls[i + 1]
        area += (r1 - r0) * (best[r0] + best[r1]) / 2.0
    return area`,
    testCases: [
      { input: [[[1.0, 0.5], [0.5, 0.5], [0.6666666666666666, 1.0], [0.5, 1.0]]], expected: 0.41666666666666663 },
      { input: [[[1.0, 1.0]]], expected: 0.0 },
      { input: [[[0.9, 0.2], [0.7, 0.5], [0.5, 1.0]]], expected: 0.54 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Keeping one precision per recall first removes vertical segments from the curve.",
  },
  {
    id: "ml-244",
    title: "Brier Skill Score",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Brier skill score versus a reference: 1 - brier_model / brier_reference.\n\nReturn 0.0 when the reference score is 0.",
    starterCode: `def brier_skill_score(brier_model, brier_reference):
    # Your code here
    pass`,
    solution: `def brier_skill_score(brier_model, brier_reference):
    if brier_reference == 0:
        return 0.0
    return 1.0 - brier_model / brier_reference`,
    testCases: [
      { input: [0.1, 0.25], expected: 0.6 },
      { input: [0.3, 0.2], expected: -0.4999999999999998 },
      { input: [0.2, 0.0], expected: 0.0 },
      { input: [0.5, 0.5], expected: 0.0 },
    ],
    hint: "Positive skill means the model beats the reference forecast.",
  },
  {
    id: "ml-245",
    title: "Log Loss Skill Score",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the log-loss skill score versus a reference: 1 - logloss_model / logloss_reference.\n\nReturn 0.0 when the reference score is 0.",
    starterCode: `def log_loss_skill_score(logloss_model, logloss_reference):
    # Your code here
    pass`,
    solution: `def log_loss_skill_score(logloss_model, logloss_reference):
    if logloss_reference == 0:
        return 0.0
    return 1.0 - logloss_model / logloss_reference`,
    testCases: [
      { input: [0.2, 0.5], expected: 0.6 },
      { input: [0.6, 0.4], expected: -0.4999999999999998 },
      { input: [0.3, 0.0], expected: 0.0 },
      { input: [0.1, 0.1], expected: 0.0 },
    ],
    hint: "The skill score expresses improvement relative to a baseline such as the base rate.",
  },
  {
    id: "ml-246",
    title: "Isotonic Step",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Apply one pool-adjacent-violators pass to values with weights, enforcing a non-decreasing fit. Merge adjacent blocks while the previous block mean exceeds the current one.\n\nReturn the expanded fitted values (same length as the input); empty input returns [].",
    starterCode: `def isotonic_step(values, weights):
    # Your code here
    pass`,
    solution: `def isotonic_step(values, weights):
    n = len(values)
    if n == 0:
        return []
    blocks = []
    for i in range(n):
        blocks.append([values[i] * weights[i], weights[i], 1])
        while len(blocks) >= 2:
            prev = blocks[-2]
            cur = blocks[-1]
            if prev[0] / prev[1] > cur[0] / cur[1]:
                blocks[-2] = [prev[0] + cur[0], prev[1] + cur[1], prev[2] + cur[2]]
                blocks.pop()
            else:
                break
    result = []
    for b in blocks:
        result.extend([b[0] / b[1]] * b[2])
    return result`,
    testCases: [
      { input: [[0.2, 0.5, 0.4], [1, 1, 1]], expected: [0.2, 0.45, 0.45] },
      { input: [[0.5, 0.4, 0.3], [1, 1, 1]], expected: [0.39999999999999997, 0.39999999999999997, 0.39999999999999997] },
      { input: [[0.1, 0.2, 0.3], [1, 1, 1]], expected: [0.1, 0.2, 0.3] },
      { input: [[3, 1], [1, 3]], expected: [1.5, 1.5] },
      { input: [[], []], expected: [] },
    ],
    hint: "Whenever a block mean drops below its predecessor, average the two blocks together.",
  },
  {
    id: "ml-247",
    title: "Temperature from NLL Grid",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Choose the temperature minimizing the multiclass negative log-likelihood. For each temperature compute softmax(logits / T) per sample and average -log p[true].\n\nReturn [best_temperature, best_nll]; ties keep the earlier candidate, and empty input returns [0.0, 0.0].",
    starterCode: `import math
def temperature_from_nll(logits, y_true, temperatures):
    # Returns [best_temperature, best_nll]
    # Your code here
    pass`,
    solution: `import math
def temperature_from_nll(logits, y_true, temperatures):
    if len(logits) == 0 or len(temperatures) == 0:
        return [0.0, 0.0]
    best_t = temperatures[0]
    best_nll = None
    for t in temperatures:
        total = 0.0
        for i in range(len(logits)):
            scaled = [z / t for z in logits[i]]
            m = max(scaled)
            exps = [math.exp(s - m) for s in scaled]
            denom = sum(exps)
            p = max(exps[y_true[i]] / denom, 1e-15)
            total -= math.log(p)
        nll = total / len(logits)
        if best_nll is None or nll < best_nll:
            best_nll = nll
            best_t = t
    return [best_t, best_nll]`,
    testCases: [
      { input: [[[2, 0], [0, 2]], [0, 1], [0.5, 1, 2]], expected: [0.5, 0.01814992791780973] },
      { input: [[[1, 0]], [1], [0.5, 1, 2, 5]], expected: [5, 0.7981388693815918] },
      { input: [[[0, 0]], [0], [1, 2]], expected: [1, 0.6931471805599453] },
      { input: [[], [], [1]], expected: [0.0, 0.0] },
    ],
    hint: "Evaluate the NLL on a grid of candidate temperatures and keep the minimum.",
  },
  {
    id: "ml-248",
    title: "Winkler Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Winkler interval score for an interval [lower, upper] with significance alpha: the width plus (2/alpha) times the distance outside the interval.\n\nReturn the width when y lies inside.",
    starterCode: `def winkler_score(lower, upper, y, alpha):
    # Your code here
    pass`,
    solution: `def winkler_score(lower, upper, y, alpha):
    width = upper - lower
    if y < lower:
        return width + (2.0 / alpha) * (lower - y)
    if y > upper:
        return width + (2.0 / alpha) * (y - upper)
    return width`,
    testCases: [
      { input: [0, 1, 0.5, 0.1], expected: 1 },
      { input: [0, 1, -1, 0.1], expected: 21.0 },
      { input: [0, 1, 2, 0.1], expected: 21.0 },
      { input: [0, 1, 0, 0.5], expected: 1 },
    ],
    hint: "Narrow intervals are rewarded, but missing the observation is heavily penalized.",
  },
  {
    id: "ml-249",
    title: "Interval Sharpness",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Compute the mean interval width (upper - lower).\n\nEmpty input returns 0.0.",
    starterCode: `def interval_sharpness(intervals):
    # Your code here
    pass`,
    solution: `def interval_sharpness(intervals):
    if not intervals:
        return 0.0
    return sum(u - l for l, u in intervals) / len(intervals)`,
    testCases: [
      { input: [[[0, 1], [2, 4]]], expected: 1.5 },
      { input: [[[0, 2]]], expected: 2.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Sharper intervals are more informative when coverage is maintained.",
  },
  {
    id: "ml-250",
    title: "Prediction Interval Coverage",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the fraction of observations inside their prediction intervals [lower, upper] (inclusive).\n\nEmpty input returns 0.0.",
    starterCode: `def interval_coverage(intervals, y_true):
    # Your code here
    pass`,
    solution: `def interval_coverage(intervals, y_true):
    if not intervals:
        return 0.0
    hits = sum(1 for i in range(len(intervals)) if intervals[i][0] <= y_true[i] <= intervals[i][1])
    return hits / len(intervals)`,
    testCases: [
      { input: [[[0, 1], [2, 3]], [0.5, 2.5]], expected: 1.0 },
      { input: [[[0, 1], [2, 3]], [0.5, 4]], expected: 0.5 },
      { input: [[[0, 1]], [1.5]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Empirical coverage should roughly match the nominal confidence level.",
  },
  {
    id: "ml-251",
    title: "Forecast Bias Correction",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Estimate the additive forecast bias: mean(actuals) - mean(forecasts).\n\nEmpty input returns 0.0.",
    starterCode: `def bias_correction(forecasts, actuals):
    # Your code here
    pass`,
    solution: `def bias_correction(forecasts, actuals):
    if not forecasts:
        return 0.0
    return sum(actuals) / len(actuals) - sum(forecasts) / len(forecasts)`,
    testCases: [
      { input: [[10, 12, 14], [11, 13, 15]], expected: 1.0 },
      { input: [[5, 5], [5, 5]], expected: 0.0 },
      { input: [[10], [8]], expected: -2.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Adding this bias to future forecasts centers them on the actuals.",
  },
  {
    id: "ml-252",
    title: "Residual Skewness",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the population skewness of residuals: mean(((r - mean) / std)^3) using the population standard deviation.\n\nReturn 0.0 when the variance is 0 or input is empty.",
    starterCode: `def residual_skewness(residuals):
    # Your code here
    pass`,
    solution: `def residual_skewness(residuals):
    n = len(residuals)
    if n == 0:
        return 0.0
    mean = sum(residuals) / n
    var = sum((r - mean) ** 2 for r in residuals) / n
    if var == 0:
        return 0.0
    std = var ** 0.5
    return sum(((r - mean) / std) ** 3 for r in residuals) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.0 },
      { input: [[1, 1, 1, 5]], expected: 1.1547005383792517 },
      { input: [[5, 5, 5, 1]], expected: -1.1547005383792517 },
      { input: [[2, 2, 2]], expected: 0.0 },
    ],
    hint: "Symmetric residuals have near-zero skewness.",
  },
  {
    id: "ml-253",
    title: "Heteroscedastic Residual Correlation",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Measure heteroscedasticity as the absolute Pearson correlation between |residual| and the fitted values.\n\nReturn 0.0 when a variance is 0 or input is empty.",
    starterCode: `def heteroscedastic_correlation(residuals, fitted):
    # Your code here
    pass`,
    solution: `def heteroscedastic_correlation(residuals, fitted):
    n = len(residuals)
    if n == 0:
        return 0.0
    abs_r = [abs(r) for r in residuals]
    ma = sum(abs_r) / n
    mf = sum(fitted) / n
    cov = sum((abs_r[i] - ma) * (fitted[i] - mf) for i in range(n)) / n
    va = sum((v - ma) ** 2 for v in abs_r) / n
    vf = sum((v - mf) ** 2 for v in fitted) / n
    if va == 0 or vf == 0:
        return 0.0
    return abs(cov / (va ** 0.5 * vf ** 0.5))`,
    testCases: [
      { input: [[1, -1, 2, -2], [1, 2, 3, 4]], expected: 0.8944271909999159 },
      { input: [[1, 1, 1], [1, 2, 3]], expected: 0.0 },
      { input: [[1, -1], [1, 2]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "A growing spread of residuals with fitted values signals heteroscedasticity.",
  },
  {
    id: "ml-254",
    title: "Durbin-Watson",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Durbin-Watson statistic: sum((e_t - e_{t-1})^2) / sum(e_t^2).\n\nReturn 0.0 with fewer than two residuals or a zero denominator.",
    starterCode: `def durbin_watson(residuals):
    # Your code here
    pass`,
    solution: `def durbin_watson(residuals):
    n = len(residuals)
    if n < 2:
        return 0.0
    denom = sum(e * e for e in residuals)
    if denom == 0:
        return 0.0
    num = sum((residuals[i] - residuals[i - 1]) ** 2 for i in range(1, n))
    return num / denom`,
    testCases: [
      { input: [[1, -1, 1, -1]], expected: 3.0 },
      { input: [[1, 2, 3]], expected: 0.14285714285714285 },
      { input: [[0, 0, 0]], expected: 0.0 },
      { input: [[2, 1, 2, 1]], expected: 0.3 },
    ],
    hint: "Values near 2 indicate no autocorrelation; near 0 suggests positive autocorrelation.",
  },
  {
    id: "ml-255",
    title: "VIF for Two Variables",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the variance inflation factor for two variables: 1 / (1 - r^2) where r is their Pearson correlation.\n\nReturn 0.0 if a variance is 0 or |r| = 1.",
    starterCode: `def vif_two_variables(x1, x2):
    # Your code here
    pass`,
    solution: `def vif_two_variables(x1, x2):
    n = len(x1)
    if n == 0:
        return 0.0
    m1 = sum(x1) / n
    m2 = sum(x2) / n
    v1 = sum((v - m1) ** 2 for v in x1) / n
    v2 = sum((v - m2) ** 2 for v in x2) / n
    if v1 == 0 or v2 == 0:
        return 0.0
    cov = sum((x1[i] - m1) * (x2[i] - m2) for i in range(n)) / n
    r2 = (cov / (v1 ** 0.5 * v2 ** 0.5)) ** 2
    if r2 >= 1.0:
        return 0.0
    return 1.0 / (1.0 - r2)`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 3, 2, 5]], expected: 3.240740740740738 },
      { input: [[1, 1, 1], [1, 2, 3]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "VIF explodes as the two predictors become collinear.",
  },
  {
    id: "ml-256",
    title: "Condition Number",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the condition number of a design matrix X with two columns: sqrt(lambda_max / lambda_min) where the lambdas are the eigenvalues of X^T X.\n\nReturn 0.0 when the smaller eigenvalue is non-positive.",
    starterCode: `def condition_number(X):
    # Your code here
    pass`,
    solution: `def condition_number(X):
    n = len(X)
    if n == 0:
        return 0.0
    a = sum(row[0] * row[0] for row in X)
    b = sum(row[0] * row[1] for row in X)
    d = sum(row[1] * row[1] for row in X)
    tr = a + d
    disc = ((a - d) ** 2 + 4 * b * b) ** 0.5
    lam_max = (tr + disc) / 2.0
    lam_min = (tr - disc) / 2.0
    if lam_min <= 0 or lam_max <= 0:
        return 0.0
    return (lam_max / lam_min) ** 0.5`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[[1, 0], [0, 2]]], expected: 2.0 },
      { input: [[[1, 1], [1, 1]]], expected: 0.0 },
      { input: [[[1, 1], [1, 2]]], expected: 6.854101966249688 },
    ],
    hint: "Large condition numbers mean the normal equations are poorly conditioned.",
  },
  {
    id: "ml-257",
    title: "Group Lasso Penalty",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the group lasso penalty: the sum over groups of the Euclidean norm sqrt(sum(w_j^2)).",
    starterCode: `def group_lasso_penalty(groups):
    # Your code here
    pass`,
    solution: `def group_lasso_penalty(groups):
    total = 0.0
    for g in groups:
        total += sum(w * w for w in g) ** 0.5
    return total`,
    testCases: [
      { input: [[[3, 4]]], expected: 5.0 },
      { input: [[[1, 0], [0, 1]]], expected: 2.0 },
      { input: [[[2, 2, 1]]], expected: 3.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Groups of coefficients are regularized jointly with an L2 norm.",
  },
  {
    id: "ml-258",
    title: "Feature Bagging Indices",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Split feature indices into random subsets. Call random.seed(seed), shuffle range(n_features), and cut it into consecutive chunks of size k.\n\nReturn each chunk sorted; a non-positive k returns [].",
    starterCode: `import random
def feature_bagging_indices(n_features, k, seed):
    # Your code here
    pass`,
    solution: `import random
def feature_bagging_indices(n_features, k, seed):
    if k <= 0:
        return []
    indices = list(range(n_features))
    random.seed(seed)
    random.shuffle(indices)
    return [sorted(indices[i:i + k]) for i in range(0, n_features, k)]`,
    testCases: [
      { input: [6, 3, 42], expected: [[1, 2, 3], [0, 4, 5]] },
      { input: [5, 2, 7], expected: [[0, 4], [1, 3], [2]] },
      { input: [4, 4, 0], expected: [[0, 1, 2, 3]] },
      { input: [3, 1, 1], expected: [[1], [2], [0]] },
    ],
    hint: "Random feature subsets decorrelate the trees in a forest.",
  },
  {
    id: "ml-259",
    title: "Random Subspace Count",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Count the number of feature subsets of size m from d features: C(d, m).\n\nReturn 0 when m is negative or larger than d.",
    starterCode: `def random_subspace_count(d, m):
    # Your code here
    pass`,
    solution: `def random_subspace_count(d, m):
    if m < 0 or m > d:
        return 0
    result = 1
    for i in range(m):
        result = result * (d - i) // (i + 1)
    return result`,
    testCases: [
      { input: [5, 3], expected: 10 },
      { input: [4, 2], expected: 6 },
      { input: [3, 0], expected: 1 },
      { input: [3, 4], expected: 0 },
    ],
    hint: "The number of subspaces grows combinatorially with the feature count.",
  },
  {
    id: "ml-260",
    title: "Base Learner Weights by Inverse Error",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Weight base learners inversely by their errors: w_i = (1/err_i) / sum(1/err_j), clipping each error to at least 1e-12.\n\nEmpty input returns [].",
    starterCode: `def inverse_error_weights(errors):
    # Your code here
    pass`,
    solution: `def inverse_error_weights(errors):
    if not errors:
        return []
    inv = [1.0 / max(e, 1e-12) for e in errors]
    total = sum(inv)
    return [v / total for v in inv]`,
    testCases: [
      { input: [[0.1, 0.2, 0.2]], expected: [0.5, 0.25, 0.25] },
      { input: [[1, 1, 2]], expected: [0.4, 0.4, 0.2] },
      { input: [[0, 1]], expected: [0.999999999999, 9.99999999999e-13] },
      { input: [[]], expected: [] },
    ],
    hint: "Lower-error learners earn larger ensemble weight.",
  },
  {
    id: "ml-261",
    title: "Stacking Meta-Features",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Build the meta-feature matrix for stacking by transposing predictions so each sample becomes a row with one column per base model.\n\nEmpty input returns [].",
    starterCode: `def stacking_meta_features(predictions):
    # Your code here
    pass`,
    solution: `def stacking_meta_features(predictions):
    if not predictions:
        return []
    n = len(predictions[0])
    return [[predictions[m][i] for m in range(len(predictions))] for i in range(n)]`,
    testCases: [
      { input: [[[0.1, 0.2, 0.3], [0.9, 0.8, 0.7]]], expected: [[0.1, 0.9], [0.2, 0.8], [0.3, 0.7]] },
      { input: [[[1, 2]]], expected: [[1], [2]] },
      { input: [[]], expected: [] },
    ],
    hint: "The meta-model learns from out-of-fold base predictions as features.",
  },
  {
    id: "ml-262",
    title: "Out-of-Fold Predictions",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Collect out-of-fold predictions. For each fold f, fold_predictions[f] holds predictions for the samples whose fold_of_sample equals f, in ascending sample order; assemble them back in the original sample order.",
    starterCode: `def out_of_fold_predictions(n, fold_of_sample, fold_predictions):
    # Your code here
    pass`,
    solution: `def out_of_fold_predictions(n, fold_of_sample, fold_predictions):
    if n == 0:
        return []
    result = [0.0] * n
    for f in range(len(fold_predictions)):
        members = [i for i in range(n) if fold_of_sample[i] == f]
        for j in range(len(members)):
            result[members[j]] = fold_predictions[f][j]
    return result`,
    testCases: [
      { input: [4, [0, 0, 1, 1], [[0.1, 0.2], [0.8, 0.9]]], expected: [0.1, 0.2, 0.8, 0.9] },
      { input: [3, [1, 0, 1], [[0.5], [0.7, 0.9]]], expected: [0.7, 0.5, 0.9] },
      { input: [0, [], []], expected: [] },
    ],
    hint: "Each sample's prediction comes from the model that did not train on it.",
  },
  {
    id: "ml-263",
    title: "Target Encoding Leakage Check",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Flag a target-encoding leakage risk: return True when the fraction of unique categories exceeds threshold.\n\nEmpty input returns False.",
    starterCode: `def target_encoding_leakage(categories, threshold):
    # Your code here
    pass`,
    solution: `def target_encoding_leakage(categories, threshold):
    n = len(categories)
    if n == 0:
        return False
    unique = len(set(categories))
    return unique / n > threshold`,
    testCases: [
      { input: [["a", "a", "b", "b"], 0.4], expected: true },
      { input: [["a", "a", "b", "b"], 0.6], expected: false },
      { input: [["a", "a", "b", "b"], 0.5], expected: false },
      { input: [[], 0.4], expected: false },
    ],
    hint: "High-cardinality features memorized by target encoding can leak labels.",
  },
  {
    id: "ml-264",
    title: "Chi-Square Drift Test",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the chi-square drift statistic between expected and actual counts: sum over bins with expected > 0 of (actual - expected)^2 / expected.\n\nEmpty input returns 0.0.",
    starterCode: `def chi_square_drift(expected_counts, actual_counts):
    # Your code here
    pass`,
    solution: `def chi_square_drift(expected_counts, actual_counts):
    total = 0.0
    for e, a in zip(expected_counts, actual_counts):
        if e > 0:
            total += (a - e) ** 2 / e
    return total`,
    testCases: [
      { input: [[50, 30, 20], [40, 40, 20]], expected: 5.333333333333334 },
      { input: [[50, 30, 20], [50, 30, 20]], expected: 0.0 },
      { input: [[0, 10], [5, 5]], expected: 2.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Large statistics indicate the actual distribution has drifted from expected.",
  },
  {
    id: "ml-265",
    title: "Linear MMD",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the squared maximum mean discrepancy with a linear kernel: the squared Euclidean distance between the sample means.\n\nReturn 0.0 if either sample is empty.",
    starterCode: `def linear_mmd(x, y):
    # Your code here
    pass`,
    solution: `def linear_mmd(x, y):
    if not x or not y:
        return 0.0
    dim = len(x[0])
    total = 0.0
    for d in range(dim):
        mx = sum(p[d] for p in x) / len(x)
        my = sum(p[d] for p in y) / len(y)
        total += (mx - my) ** 2
    return total`,
    testCases: [
      { input: [[[0, 0], [1, 1]], [[2, 2], [3, 4]]], expected: 10.25 },
      { input: [[[1], [2]], [[4], [5]]], expected: 9.0 },
      { input: [[[0, 0]], [[0, 0]]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Linear MMD only compares first moments, so mean shifts dominate.",
  },
  {
    id: "ml-266",
    title: "Covariate Shift Weights",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute covariate shift importance weights for training samples: (n_train/n_test) * p / (1 - p), where p is the adversarial probability of belonging to the test set, clipping p to [1e-12, 1 - 1e-12].\n\nReturn zeros if n_test is 0; empty input returns [].",
    starterCode: `def covariate_shift_weights(probs, n_train, n_test):
    # Your code here
    pass`,
    solution: `def covariate_shift_weights(probs, n_train, n_test):
    if n_test == 0:
        return [0.0 for _ in probs]
    ratio = n_train / n_test
    result = []
    for p in probs:
        p = min(max(p, 1e-12), 1.0 - 1e-12)
        result.append(ratio * p / (1.0 - p))
    return result`,
    testCases: [
      { input: [[0.5, 0.8], 100, 50], expected: [2.0, 8.000000000000002] },
      { input: [[0.2], 200, 100], expected: [0.5] },
      { input: [[0.5], 10, 5], expected: [2.0] },
      { input: [[], 10, 5], expected: [] },
    ],
    hint: "Samples that look like the test set get larger training weight.",
  },
  {
    id: "ml-267",
    title: "Retraining Cost-Benefit",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the expected net benefit of retraining: drift_prob * daily_loss * days_saved - retrain_cost.",
    starterCode: `def retraining_cost_benefit(drift_prob, daily_loss, days_saved, retrain_cost):
    # Your code here
    pass`,
    solution: `def retraining_cost_benefit(drift_prob, daily_loss, days_saved, retrain_cost):
    return drift_prob * daily_loss * days_saved - retrain_cost`,
    testCases: [
      { input: [0.8, 100, 3, 200], expected: 40.0 },
      { input: [0.1, 100, 2, 500], expected: -480.0 },
      { input: [0.0, 5, 1, 10], expected: -10.0 },
    ],
    hint: "Retrain only when expected avoided loss exceeds the retraining cost.",
  },
  {
    id: "ml-268",
    title: "Sequential Stopping",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Find the first look where the absolute z-score exceeds its threshold; return that index, or -1 if the test never stops.",
    starterCode: `def sequential_stopping(z_scores, thresholds):
    # Your code here
    pass`,
    solution: `def sequential_stopping(z_scores, thresholds):
    for i in range(len(z_scores)):
        if abs(z_scores[i]) > thresholds[i]:
            return i
    return -1`,
    testCases: [
      { input: [[1.0, 2.5, 3.0], [2.0, 2.2, 2.8]], expected: 1 },
      { input: [[1.0, 1.0], [1.5, 1.5]], expected: -1 },
      { input: [[-3.0], [2.0]], expected: 0 },
      { input: [[], []], expected: -1 },
    ],
    hint: "Sequential tests stop as soon as evidence crosses an interim boundary.",
  },
  {
    id: "ml-269",
    title: "Epsilon-Greedy Choice",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Choose an arm with epsilon-greedy. Call random.seed(seed); with probability epsilon pick a uniformly random arm, otherwise pick the arm with the largest value (ties keep the smallest index).\n\nEmpty values return -1.",
    starterCode: `import random
def epsilon_greedy_choice(values, epsilon, seed):
    # Your code here
    pass`,
    solution: `import random
def epsilon_greedy_choice(values, epsilon, seed):
    if not values:
        return -1
    random.seed(seed)
    r = random.random()
    if r < epsilon:
        return random.randrange(len(values))
    best = 0
    for i in range(1, len(values)):
        if values[i] > values[best]:
            best = i
    return best`,
    testCases: [
      { input: [[1, 3, 2], 0.1, 42], expected: 1 },
      { input: [[1, 3, 2], 1.0, 7], expected: 0 },
      { input: [[1, 3, 2], 0.5, 0], expected: 1 },
      { input: [[5, 5], 0.0, 7], expected: 0 },
    ],
    hint: "Epsilon controls how often the policy explores instead of exploiting.",
  },
  {
    id: "ml-270",
    title: "Sample Ratio Mismatch",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the sample ratio mismatch chi-square: expected_i = total * ratio_i, statistic = sum((observed - expected)^2 / expected).\n\nReturn 0.0 when the total is 0.",
    starterCode: `def sample_ratio_mismatch(observed, expected_ratios):
    # Your code here
    pass`,
    solution: `def sample_ratio_mismatch(observed, expected_ratios):
    total = sum(observed)
    if total == 0:
        return 0.0
    chi = 0.0
    for o, ratio in zip(observed, expected_ratios):
        e = total * ratio
        if e > 0:
            chi += (o - e) ** 2 / e
    return chi`,
    testCases: [
      { input: [[45, 55], [0.5, 0.5]], expected: 1.0 },
      { input: [[50, 50], [0.5, 0.5]], expected: 0.0 },
      { input: [[30, 70], [0.5, 0.5]], expected: 16.0 },
      { input: [[10], [1.0]], expected: 0.0 },
    ],
    hint: "A large sample ratio mismatch invalidates the randomization of the experiment.",
  },
];
