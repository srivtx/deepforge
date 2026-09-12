import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-316",
    title: "Data Leakage Correlation Flags",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Flag features whose correlation with the target is high on the training split but collapses on the test split. A feature i is flagged when abs(train_corrs[i]) >= min_train_corr and abs(train_corrs[i]) - abs(test_corrs[i]) >= min_gap. Return the sorted indices, comparing only up to the shorter input; empty input returns [].",
    starterCode: `def leakage_flags(train_corrs, test_corrs, min_train_corr, min_gap):
    # Your code here
    pass`,
    solution: `def leakage_flags(train_corrs, test_corrs, min_train_corr, min_gap):
    flags = []
    for i in range(min(len(train_corrs), len(test_corrs))):
        train_abs = abs(train_corrs[i])
        test_abs = abs(test_corrs[i])
        if train_abs >= min_train_corr and train_abs - test_abs >= min_gap:
            flags.append(i)
    return flags`,
    testCases: [
      { input: [[0.9, 0.2, 0.75], [0.1, 0.3, 0.7], 0.7, 0.1], expected: [0] },
      { input: [[0.95, 0.85, 0.6], [0.2, 0.8, 0.1], 0.5, 0.2], expected: [0, 2] },
      { input: [[0.5], [0.5], 0.6, 0.0], expected: [] },
      { input: [[], [], 0.5, 0.1], expected: [] },
    ],
    hint: "A strong training correlation that vanishes out of sample is a classic leakage signature.",
  },
  {
    id: "ml-317",
    title: "Nested CV Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Evaluate a nested cross-validation run. For each outer fold, select the hyperparameter with the highest inner score (smallest index on ties) and read the outer score at that position. Return the mean of the selected outer scores, or 0.0 when no fold can be scored.",
    starterCode: `def nested_cv_score(inner_scores, outer_scores):
    # Your code here
    pass`,
    solution: `def nested_cv_score(inner_scores, outer_scores):
    selected = []
    for i in range(min(len(inner_scores), len(outer_scores))):
        row = inner_scores[i]
        if not row:
            continue
        best_j = 0
        for j in range(1, len(row)):
            if row[j] > row[best_j]:
                best_j = j
        outer = outer_scores[i]
        if best_j < len(outer):
            selected.append(outer[best_j])
    if not selected:
        return 0.0
    return sum(selected) / len(selected)`,
    testCases: [
      { input: [[[0.8, 0.9], [0.7, 0.6]], [[0.5, 0.4], [0.3, 0.2]]], expected: 0.35 },
      { input: [[[0.9, 0.9], [0.5]], [[1.0, 0.0], [0.5]]], expected: 0.75 },
      { input: [[[], [0.2]], [[9.9], [0.8]]], expected: 0.8 },
      { input: [[], []], expected: 0.0 },
      { input: [[[0.5, 0.6]], [[0.1]]], expected: 0.0 },
    ],
    hint: "The inner loop picks hyperparameters; the outer loop estimates how well that whole procedure generalizes.",
  },
  {
    id: "ml-318",
    title: "Stratified K-Fold Fold Sizes",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the sample count of every fold in a stratified k-fold split. For each class in sorted label order, fold f receives count // k samples plus one extra when f is among the first (count % k) folds, rotating the remainder start by the class position so remainder samples spread across folds. Return the list of k fold sizes; k <= 0 returns [].",
    starterCode: `def stratified_fold_sizes(labels, k):
    # Your code here
    pass`,
    solution: `def stratified_fold_sizes(labels, k):
    if k <= 0:
        return []
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    keys = sorted(counts.keys())
    sizes = [0] * k
    for idx in range(len(keys)):
        c = counts[keys[idx]]
        base = c // k
        rem = c % k
        for f in range(k):
            sizes[f] += base
        for r in range(rem):
            sizes[(idx + r) % k] += 1
    return sizes`,
    testCases: [
      { input: [[0, 0, 0, 1, 1, 1], 2], expected: [3, 3] },
      { input: [[0, 0, 0, 1, 1, 2], 2], expected: [4, 2] },
      { input: [[1, 1], 3], expected: [1, 1, 0] },
      { input: [[], 2], expected: [0, 0] },
      { input: [["a", "a", "a", "b"], 3], expected: [1, 2, 1] },
    ],
    hint: "Every class is split across folds as evenly as possible, so each fold gets a similar class mix.",
  },
  {
    id: "ml-319",
    title: "Grouped CV Fold Sizes",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the sample count of every fold in a grouped k-fold split. Sort the distinct groups and assign them to contiguous folds so the first (g % k) folds receive one extra group, where g is the number of groups. A fold's size is the total number of samples in its groups. Return [] when k <= 0.",
    starterCode: `def grouped_fold_sizes(groups, k):
    # Your code here
    pass`,
    solution: `def grouped_fold_sizes(groups, k):
    if k <= 0:
        return []
    counts = {}
    for g in groups:
        counts[g] = counts.get(g, 0) + 1
    keys = sorted(counts.keys())
    g_count = len(keys)
    sizes = [0] * k
    base = g_count // k
    rem = g_count % k
    idx = 0
    for f in range(k):
        n_groups = base + (1 if f < rem else 0)
        for _ in range(n_groups):
            if idx < g_count:
                sizes[f] += counts[keys[idx]]
                idx += 1
    return sizes`,
    testCases: [
      { input: [["a", "a", "b", "b", "c", "c"], 2], expected: [4, 2] },
      { input: [["a", "a", "a", "b", "c"], 2], expected: [4, 1] },
      { input: [["x", "y"], 5], expected: [1, 1, 0, 0, 0] },
      { input: [[], 2], expected: [0, 0] },
      { input: [["m", "m"], 0], expected: [] },
    ],
    hint: "Keeping every group inside one fold prevents the same entity leaking across train and validation.",
  },
  {
    id: "ml-320",
    title: "Time-Series Split Boundaries",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Return expanding time-series split boundaries. For the i-th of n_splits folds, the test window ends at n - (n_splits - 1 - i) * test_size and is test_size points long, while everything before it is training. Each entry is [train_end, test_start, test_end] with train_end equal to test_start. Return [] unless n_splits > 0, test_size > 0, and n_splits * test_size < n.",
    starterCode: `def time_series_split_bounds(n, n_splits, test_size):
    # Your code here
    pass`,
    solution: `def time_series_split_bounds(n, n_splits, test_size):
    if n_splits <= 0 or test_size <= 0 or n_splits * test_size >= n:
        return []
    result = []
    for i in range(n_splits):
        test_end = n - (n_splits - 1 - i) * test_size
        test_start = test_end - test_size
        result.append([test_start, test_start, test_end])
    return result`,
    testCases: [
      { input: [10, 3, 2], expected: [[4, 4, 6], [6, 6, 8], [8, 8, 10]] },
      { input: [6, 2, 2], expected: [[2, 2, 4], [4, 4, 6]] },
      { input: [5, 5, 1], expected: [] },
      { input: [4, 1, 1], expected: [[3, 3, 4]] },
    ],
    hint: "Each fold trains only on the past and tests on the next fixed-size block of the future.",
  },
  {
    id: "ml-321",
    title: "Purged CV Train Indices",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Return the training indices for a purged cross-validation split. Start from every index outside the test window [test_start, test_end), then purge earlier samples whose label horizon overlaps the window (i + horizon > test_start) and embargo samples in [test_end, test_end + embargo). Return the survivors sorted ascending, or [] when the bounds are invalid or outside [0, n].",
    starterCode: `def purged_train_indices(n, test_start, test_end, horizon, embargo):
    # Your code here
    pass`,
    solution: `def purged_train_indices(n, test_start, test_end, horizon, embargo):
    if test_start < 0 or test_end > n or test_start > test_end:
        return []
    keep = []
    for i in range(n):
        if test_start <= i < test_end:
            continue
        if i < test_start and horizon > 0 and i + horizon > test_start:
            continue
        if i >= test_end and embargo > 0 and i < test_end + embargo:
            continue
        keep.append(i)
    return keep`,
    testCases: [
      { input: [10, 4, 6, 2, 1], expected: [0, 1, 2, 7, 8, 9] },
      { input: [8, 3, 5, 0, 2], expected: [0, 1, 2, 7] },
      { input: [5, 0, 5, 1, 1], expected: [] },
      { input: [6, 2, 4, 10, 0], expected: [4, 5] },
      { input: [5, 4, 3, 1, 0], expected: [] },
    ],
    hint: "Purge overlapping labels before the test window and embargo the period right after it.",
  },
  {
    id: "ml-322",
    title: "Repeated CV Variance",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the between-repeat variance of repeated cross-validation. Average the fold scores inside each repeat, then return the population variance of those repeat means. Fewer than two non-empty repeats returns 0.0.",
    starterCode: `def repeated_cv_variance(repeat_scores):
    # Your code here
    pass`,
    solution: `def repeated_cv_variance(repeat_scores):
    means = []
    for row in repeat_scores:
        if row:
            means.append(sum(row) / len(row))
    if len(means) < 2:
        return 0.0
    m = sum(means) / len(means)
    return sum((x - m) ** 2 for x in means) / len(means)`,
    testCases: [
      { input: [[[0.8, 0.9], [0.7, 0.8], [0.75, 0.85]]], expected: 0.0016666666666666698 },
      { input: [[[1], [0], [0.5]]], expected: 0.16666666666666666 },
      { input: [[[0.5], []]], expected: 0.0 },
      { input: [[[]]], expected: 0.0 },
    ],
    hint: "High variance across repeats means the reported score depends heavily on the random split.",
  },
  {
    id: "ml-323",
    title: "Leave-One-Out MSE",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the leave-one-out mean squared error of a simple linear regression without refitting. Fit the OLS line, form residuals e_i, and use the PRESS shortcut sum((e_i / (1 - h_i))^2) / n with leverage h_i = 1/n + (x_i - mean_x)^2 / Sxx. Fewer than two points returns 0.0.",
    starterCode: `def loo_mse(x, y):
    # Your code here
    pass`,
    solution: `def loo_mse(x, y):
    n = len(x)
    if n < 2:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    sxx = sum((v - mx) ** 2 for v in x)
    if sxx == 0:
        slope = 0.0
    else:
        slope = sum((x[i] - mx) * (y[i] - my) for i in range(n)) / sxx
    intercept = my - slope * mx
    total = 0.0
    for i in range(n):
        resid = y[i] - (intercept + slope * x[i])
        if sxx > 0:
            h = 1.0 / n + ((x[i] - mx) ** 2) / sxx
        else:
            h = 1.0 / n
        total += (resid / (1.0 - h)) ** 2
    return total / n`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 3, 5, 8]], expected: 0.44784580498866317 },
      { input: [[5, 5, 5], [1, 2, 4]], expected: 3.4999999999999987 },
      { input: [[2, 4, 6, 8], [1, 5, 4, 8]], expected: 3.684807256235827 },
      { input: [[1], [2]], expected: 0.0 },
    ],
    hint: "The PRESS formula deletes each point analytically, so no OLS refits are needed.",
  },
  {
    id: "ml-324",
    title: "Bootstrap AUC Confidence Interval",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Bootstrap a confidence interval for the ROC AUC. Seed random, draw n_boot resamples that keep the positive and negative score lists separate, and compute a tie-aware AUC where ties count one half. Sort the replicates and return [lower, upper] at indices int(0.025 * n_boot) and int(0.975 * n_boot), clamped to the last index. Return [0.0, 0.0] when a class is missing.",
    starterCode: `import random

def bootstrap_auc_ci(y_true, scores, n_boot, seed):
    # Returns [lower, upper]
    # Your code here
    pass`,
    solution: `import random

def bootstrap_auc_ci(y_true, scores, n_boot, seed):
    n = len(y_true)
    pos = [i for i in range(n) if y_true[i] == 1]
    neg = [i for i in range(n) if y_true[i] == 0]
    p_count = len(pos)
    n_count = len(neg)
    if n == 0 or p_count == 0 or n_count == 0 or n_boot <= 0:
        return [0.0, 0.0]
    random.seed(seed)
    aucs = []
    for _ in range(n_boot):
        pos_sample = [pos[random.randrange(p_count)] for _ in range(p_count)]
        neg_sample = [neg[random.randrange(n_count)] for _ in range(n_count)]
        total = 0.0
        for pi in pos_sample:
            sp = scores[pi]
            for ni in neg_sample:
                sn = scores[ni]
                if sn < sp:
                    total += 1.0
                elif sn == sp:
                    total += 0.5
        aucs.append(total / (p_count * n_count))
    aucs.sort()
    lo_idx = int(0.025 * n_boot)
    hi_idx = int(0.975 * n_boot)
    if lo_idx >= n_boot:
        lo_idx = n_boot - 1
    if hi_idx >= n_boot:
        hi_idx = n_boot - 1
    return [aucs[lo_idx], aucs[hi_idx]]`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8], 200, 42], expected: [0.0, 1.0] },
      { input: [[1, 0, 1, 0], [0.9, 0.8, 0.7, 0.6], 100, 7], expected: [0.0, 1.0] },
      { input: [[1, 1, 1], [0.1, 0.5, 0.9], 50, 1], expected: [0.0, 0.0] },
      { input: [[], [], 50, 1], expected: [0.0, 0.0] },
      { input: [[1, 0], [0.5, 0.5], 100, 3], expected: [0.5, 0.5] },
    ],
    hint: "Resample positives and negatives separately so every replicate keeps the original class balance.",
  },
  {
    id: "ml-325",
    title: "ROC and PR Area Gap",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Return the difference between the trapezoidal PR area and the trapezoidal ROC area for the same curve. Precision at each point is tpr * prevalence / (tpr * prevalence + fpr * (1 - prevalence)), using 1.0 when the denominator is 0, and the PR area integrates precision over recall (tpr). Return pr_auc - roc_auc, or 0.0 when prevalence is not strictly between 0 and 1 or there are fewer than two points.",
    starterCode: `def roc_pr_area_gap(fpr, tpr, prevalence):
    # Your code here
    pass`,
    solution: `def roc_pr_area_gap(fpr, tpr, prevalence):
    if len(fpr) < 2 or prevalence <= 0 or prevalence >= 1:
        return 0.0
    roc = 0.0
    for i in range(len(fpr) - 1):
        roc += (fpr[i + 1] - fpr[i]) * (tpr[i + 1] + tpr[i]) / 2.0
    precisions = []
    for i in range(len(fpr)):
        denom = tpr[i] * prevalence + fpr[i] * (1.0 - prevalence)
        if denom <= 0:
            precisions.append(1.0)
        else:
            precisions.append(tpr[i] * prevalence / denom)
    pr = 0.0
    for i in range(len(fpr) - 1):
        pr += (tpr[i + 1] - tpr[i]) * (precisions[i + 1] + precisions[i]) / 2.0
    return pr - roc`,
    testCases: [
      { input: [[0, 0, 1], [0, 1, 1], 0.5], expected: 0.0 },
      { input: [[0, 0.5, 1], [0, 0.5, 1], 0.5], expected: 0.125 },
      { input: [[0, 1], [0, 1], 0.1], expected: 0.050000000000000044 },
      { input: [[0, 1], [0, 1], 0.0], expected: 0.0 },
      { input: [[0], [0], 0.5], expected: 0.0 },
    ],
    hint: "PR curves reward early precision and are much more sensitive to class imbalance than ROC curves.",
  },
  {
    id: "ml-326",
    title: "Cost-Sensitive Decision Threshold",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the cost-sensitive decision threshold for predicting the positive class: cost_fp / (cost_fp + cost_fn). Predict positive when the estimated probability exceeds this break-even point. Return 0.0 when the two costs sum to 0 or less.",
    starterCode: `def cost_sensitive_threshold(cost_fp, cost_fn):
    # Your code here
    pass`,
    solution: `def cost_sensitive_threshold(cost_fp, cost_fn):
    total = cost_fp + cost_fn
    if total <= 0:
        return 0.0
    return cost_fp / total`,
    testCases: [
      { input: [1, 4], expected: 0.2 },
      { input: [5, 5], expected: 0.5 },
      { input: [0, 3], expected: 0.0 },
      { input: [0, 0], expected: 0.0 },
      { input: [3, 1], expected: 0.75 },
    ],
    hint: "When false negatives are expensive the threshold drops below 0.5 to catch more positives.",
  },
  {
    id: "ml-327",
    title: "Minimum Expected Cost",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the minimum total expected cost over a list of probability predictions. For each p, the expected cost of predicting 0 is p*C[1][0] + (1-p)*C[0][0] and of predicting 1 is p*C[1][1] + (1-p)*C[0][1]; sum the smaller of the two. Empty input returns 0.0.",
    starterCode: `def minimum_expected_cost(probs, cost_matrix):
    # Your code here
    pass`,
    solution: `def minimum_expected_cost(probs, cost_matrix):
    c00 = cost_matrix[0][0]
    c01 = cost_matrix[0][1]
    c10 = cost_matrix[1][0]
    c11 = cost_matrix[1][1]
    total = 0.0
    for p in probs:
        cost0 = p * c10 + (1.0 - p) * c00
        cost1 = p * c11 + (1.0 - p) * c01
        total += min(cost0, cost1)
    return total`,
    testCases: [
      { input: [[0.2, 0.5, 0.8], [[0, 1], [1, 0]]], expected: 0.8999999999999999 },
      { input: [[0.2, 0.8], [[0, 5], [1, 0]]], expected: 1.0 },
      { input: [[], [[0, 1], [1, 0]]], expected: 0.0 },
      { input: [[0.5], [[1, 0], [0, 1]]], expected: 0.5 },
    ],
    hint: "The optimal policy picks whichever label minimizes expected cost for each sample independently.",
  },
  {
    id: "ml-328",
    title: "Effective Number Class Weights",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute class-balanced weights from the effective number of samples: raw weight (1 - beta) / (1 - beta^count) per class, then divide every raw weight by the smallest one. Return a dict mapping str(label) to weight; empty input returns {}. Assume 0 <= beta < 1.",
    starterCode: `def effective_number_weights(labels, beta):
    # Your code here
    pass`,
    solution: `def effective_number_weights(labels, beta):
    n = len(labels)
    if n == 0:
        return {}
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    raw = {}
    for l in counts:
        raw[l] = (1.0 - beta) / (1.0 - beta ** counts[l])
    smallest = min(raw.values())
    return {str(l): raw[l] / smallest for l in raw}`,
    testCases: [
      { input: [["a", "a", "a", "b", "b", "c"], 0.9], expected: {"a": 1.0, "b": 1.4263157894736842, "c": 2.7099999999999995} },
      { input: [[0, 0, 1, 1, 1, 1], 0.0], expected: {"0": 1.0, "1": 1.0} },
      { input: [["x"], 0.5], expected: {"x": 1.0} },
      { input: [[], 0.9], expected: {} },
    ],
    hint: "The effective number saturates as a class grows, so rare classes keep a larger weight.",
  },
  {
    id: "ml-329",
    title: "SMOTE Interpolation",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Generate a synthetic SMOTE point by interpolating between two minority samples: a[i] + lam * (b[i] - a[i]) for every coordinate. Return the new vector; empty input returns [].",
    starterCode: `def smote_interpolate(a, b, lam):
    # Your code here
    pass`,
    solution: `def smote_interpolate(a, b, lam):
    return [a[i] + lam * (b[i] - a[i]) for i in range(len(a))]`,
    testCases: [
      { input: [[0, 0], [2, 4], 0.5], expected: [1.0, 2.0] },
      { input: [[1, 1, 1], [3, 5, 7], 0.25], expected: [1.5, 2.0, 2.5] },
      { input: [[], [], 0.5], expected: [] },
      { input: [[5, 5], [5, 5], 0.9], expected: [5.0, 5.0] },
    ],
    hint: "SMOTE places new minority points on the segment between a seed and one of its neighbors.",
  },
  {
    id: "ml-330",
    title: "Focal Loss Gamma Reduction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute how much focal loss reduces the mean cross-entropy. Use mean CE minus mean focal loss with focusing parameter gamma and alpha 1, where p_t is p for y = 1 and 1 - p otherwise, with probabilities clipped to [1e-15, 1 - 1e-15]. Return 0.0 for empty input.",
    starterCode: `import math

def focal_gamma_reduction(y_true, probs, gamma):
    # Your code here
    pass`,
    solution: `import math

def focal_gamma_reduction(y_true, probs, gamma):
    if not y_true:
        return 0.0
    total_ce = 0.0
    total_fl = 0.0
    for t, p in zip(y_true, probs):
        p = min(max(p, 1e-15), 1.0 - 1e-15)
        pt = p if t == 1 else 1.0 - p
        ce = -math.log(pt)
        total_ce += ce
        total_fl += (1.0 - pt) ** gamma * ce
    n = len(y_true)
    return total_ce / n - total_fl / n`,
    testCases: [
      { input: [[1, 0], [0.9, 0.9], 2], expected: 0.2708990390850584 },
      { input: [[1, 1], [0.6, 0.6], 0], expected: 0.0 },
      { input: [[0, 1], [0.3, 0.3], 1], expected: 0.3054321510274468 },
      { input: [[], [], 2], expected: 0.0 },
    ],
    hint: "A larger gamma focuses more of the loss on hard, misclassified examples.",
  },
  {
    id: "ml-331",
    title: "Leave-One-Out Target Encoding",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Leave-one-out target encoding: for each sample whose category appears more than once, encode it as (sum of the category's targets minus its own target) / (count - 1). Categories seen once fall back to the global target mean. Return encodings in the original order; empty input returns [].",
    starterCode: `def loo_target_encode(categories, targets):
    # Your code here
    pass`,
    solution: `def loo_target_encode(categories, targets):
    n = len(categories)
    if n == 0:
        return []
    prior = sum(targets) / n
    totals = {}
    counts = {}
    for c, t in zip(categories, targets):
        totals[c] = totals.get(c, 0.0) + t
        counts[c] = counts.get(c, 0) + 1
    result = []
    for c, t in zip(categories, targets):
        if counts[c] > 1:
            result.append((totals[c] - t) / (counts[c] - 1))
        else:
            result.append(prior)
    return result`,
    testCases: [
      { input: [["a", "a", "b", "b", "b"], [1, 0, 1, 1, 0]], expected: [0.0, 1.0, 0.5, 0.5, 1.0] },
      { input: [["x"], [2]], expected: [2.0] },
      { input: [[], []], expected: [] },
      { input: [["a", "b", "a"], [1, 1, 1]], expected: [1.0, 1.0, 1.0] },
    ],
    hint: "Excluding the sample's own target prevents the encoding from leaking its label.",
  },
  {
    id: "ml-332",
    title: "WOE Information Contribution",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute each bin's contribution to information value: (good_share - bad_share) * ln(good_share / bad_share), clipping every share to at least 1e-6. Return one contribution per bin; if either total is 0 return a list of zeros and an empty input returns [].",
    starterCode: `import math

def woe_contributions(good_counts, bad_counts):
    # Your code here
    pass`,
    solution: `import math

def woe_contributions(good_counts, bad_counts):
    good_total = sum(good_counts)
    bad_total = sum(bad_counts)
    if good_total == 0 or bad_total == 0:
        return [0.0 for _ in good_counts]
    result = []
    for i in range(len(good_counts)):
        g = max(good_counts[i] / good_total, 1e-6)
        b = max(bad_counts[i] / bad_total, 1e-6)
        result.append((g - b) * math.log(g / b))
    return result`,
    testCases: [
      { input: [[30, 20, 50], [10, 40, 50]], expected: [0.2197224577336219, 0.13862943611198905, 0.0] },
      { input: [[50, 50], [50, 50]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [] },
      { input: [[0, 10, 0], [5, 0, 5]], expected: [6.561168566338787, 13.815496742453716, 6.561168566338787] },
    ],
    hint: "Summing these per-bin contributions recovers the information value of the feature.",
  },
  {
    id: "ml-333",
    title: "Two-Feature Shapley Values",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute exact Shapley values for a two-feature model with an interaction. The empty-set value is 0, the individual feature values are v1 and v2, and the joint value is v12. Feature 1 gets 0.5*v1 + 0.5*(v12 - v2) and feature 2 gets 0.5*v2 + 0.5*(v12 - v1). Return [shap1, shap2].",
    starterCode: `def shapley_two_features(v1, v2, v12):
    # Returns [shap1, shap2]
    # Your code here
    pass`,
    solution: `def shapley_two_features(v1, v2, v12):
    shap1 = 0.5 * v1 + 0.5 * (v12 - v2)
    shap2 = 0.5 * v2 + 0.5 * (v12 - v1)
    return [shap1, shap2]`,
    testCases: [
      { input: [1, 2, 4], expected: [1.5, 2.5] },
      { input: [0, 0, 0], expected: [0.0, 0.0] },
      { input: [3, 1, 3], expected: [2.5, 0.5] },
      { input: [-1, 2, 1], expected: [-1.0, 2.0] },
    ],
    hint: "With only two features each Shapley value averages the marginal contribution over both orderings.",
  },
  {
    id: "ml-334",
    title: "Permutation Importance Rank",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Rank features by mean permutation importance. Average each column of the matrix across repeats, then return feature indices ordered by descending mean, breaking ties by the smaller index. Empty input returns [].",
    starterCode: `def permutation_importance_rank(importance_matrix):
    # Your code here
    pass`,
    solution: `def permutation_importance_rank(importance_matrix):
    if not importance_matrix or not importance_matrix[0]:
        return []
    k = len(importance_matrix[0])
    means = []
    for j in range(k):
        total = 0.0
        for row in importance_matrix:
            total += row[j]
        means.append(total / len(importance_matrix))
    return sorted(range(k), key=lambda j: (-means[j], j))`,
    testCases: [
      { input: [[[0.1, 0.4, 0.2], [0.2, 0.5, 0.3]]], expected: [1, 2, 0] },
      { input: [[[0.5, 0.5, 0.1]]], expected: [0, 1, 2] },
      { input: [[[1, 2], [2, 1]]], expected: [0, 1] },
      { input: [[]], expected: [] },
      { input: [[[], []]], expected: [] },
    ],
    hint: "Averaging over repeats makes the ranking less sensitive to a single unlucky shuffle.",
  },
  {
    id: "ml-335",
    title: "Two-Feature Partial Dependence",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the two-feature partial dependence of a linear model. For every grid pair, replace features f1 and f2 with the grid values, keep the other features, and average the prediction over all rows. Return a list of lists indexed by grid1 then grid2; empty X or an empty grid returns [].",
    starterCode: `def partial_dependence_2d(X, w, f1, f2, grid1, grid2):
    # Your code here
    pass`,
    solution: `def partial_dependence_2d(X, w, f1, f2, grid1, grid2):
    if not X or not grid1 or not grid2:
        return []
    n = len(X)
    d = len(w)
    result = []
    for v1 in grid1:
        row_out = []
        for v2 in grid2:
            total = 0.0
            for row in X:
                pred = 0.0
                for k in range(d):
                    if k == f1:
                        pred += w[k] * v1
                    elif k == f2:
                        pred += w[k] * v2
                    else:
                        pred += w[k] * row[k]
                total += pred
            row_out.append(total / n)
        result.append(row_out)
    return result`,
    testCases: [
      { input: [[[1, 2]], [1, 1], 0, 1, [0, 10], [1, 2]], expected: [[1.0, 2.0], [11.0, 12.0]] },
      { input: [[[1, 2], [3, 4]], [0.5, 2], 0, 1, [0, 1], [0, 2]], expected: [[0.0, 4.0], [0.5, 4.5]] },
      { input: [[], [1, 1], 0, 1, [0], [0]], expected: [] },
      { input: [[[1, 2]], [1, 1], 0, 1, [], [0]], expected: [] },
    ],
    hint: "Partial dependence marginalizes the model over the other features while sweeping the chosen pair.",
  },
  {
    id: "ml-336",
    title: "Feature Importance Rank Stability",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Measure feature importance rank stability with Spearman's correlation. Convert both importance vectors to average ranks so ties share the mean rank, then return the Pearson correlation of the two rank vectors using population statistics. Return 0.0 for empty input, unequal lengths, or a constant vector.",
    starterCode: `def importance_rank_stability(importance_a, importance_b):
    # Your code here
    pass`,
    solution: `def importance_rank_stability(importance_a, importance_b):
    n = len(importance_a)
    if n == 0 or n != len(importance_b):
        return 0.0
    def ranks(values):
        order = sorted(range(n), key=lambda i: values[i])
        out = [0.0] * n
        i = 0
        while i < n:
            j = i
            while j + 1 < n and values[order[j + 1]] == values[order[i]]:
                j += 1
            avg = (i + j) / 2.0 + 1.0
            for t in range(i, j + 1):
                out[order[t]] = avg
            i = j + 1
        return out
    ra = ranks(importance_a)
    rb = ranks(importance_b)
    ma = sum(ra) / n
    mb = sum(rb) / n
    cov = sum((ra[i] - ma) * (rb[i] - mb) for i in range(n)) / n
    va = sum((v - ma) ** 2 for v in ra) / n
    vb = sum((v - mb) ** 2 for v in rb) / n
    if va == 0 or vb == 0:
        return 0.0
    return cov / (va ** 0.5 * vb ** 0.5)`,
    testCases: [
      { input: [[0.1, 0.5, 0.3], [0.2, 0.9, 0.4]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -1.0 },
      { input: [[1, 1, 2], [3, 1, 2]], expected: 0.0 },
      { input: [[5], [5]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Rank correlation tracks whether two explanations agree on ordering, even if scores are not comparable.",
  },
  {
    id: "ml-337",
    title: "Calibration Gap by Equal-Frequency Bins",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the worst calibration gap over equal-frequency probability bins. Sort samples by probability, split them into num_bins contiguous bins (earlier bins take the remainder first), and return the maximum absolute difference between the mean label and mean probability inside a bin. Empty input or num_bins <= 0 returns 0.0.",
    starterCode: `def calibration_gap_equal_freq(y_true, probs, num_bins):
    # Your code here
    pass`,
    solution: `def calibration_gap_equal_freq(y_true, probs, num_bins):
    n = len(y_true)
    if n == 0 or num_bins <= 0:
        return 0.0
    order = sorted(range(n), key=lambda i: (probs[i], i))
    base = n // num_bins
    rem = n % num_bins
    worst = 0.0
    idx = 0
    for b in range(num_bins):
        size = base + (1 if b < rem else 0)
        if size == 0:
            continue
        members = order[idx:idx + size]
        idx += size
        mp = sum(probs[i] for i in members) / size
        mt = sum(y_true[i] for i in members) / size
        gap = abs(mt - mp)
        if gap > worst:
            worst = gap
    return worst`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.2, 0.8, 0.9], 2], expected: 0.15000000000000002 },
      { input: [[1, 0, 1, 0], [0.9, 0.8, 0.7, 0.6], 2], expected: 0.3500000000000001 },
      { input: [[1, 0], [0.5, 0.5], 3], expected: 0.5 },
      { input: [[], [], 3], expected: 0.0 },
      { input: [[1], [0.5], 0], expected: 0.0 },
    ],
    hint: "Equal-frequency bins each hold the same number of samples, unlike equal-width probability bins.",
  },
  {
    id: "ml-338",
    title: "Reliability Slope",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Return the reliability slope: the OLS slope of the true labels regressed on the predicted probabilities, equal to cov(y, p) / var(p) with population statistics. A slope above 1 means predictions are under-confident and below 1 means over-confident. Return 0.0 when the input is empty or the probabilities are constant.",
    starterCode: `def reliability_slope(y_true, probs):
    # Your code here
    pass`,
    solution: `def reliability_slope(y_true, probs):
    n = len(y_true)
    if n == 0:
        return 0.0
    mp = sum(probs) / n
    my = sum(y_true) / n
    var = sum((p - mp) ** 2 for p in probs) / n
    if var == 0:
        return 0.0
    cov = sum((probs[i] - mp) * (y_true[i] - my) for i in range(n)) / n
    return cov / var`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.2, 0.8, 0.9]], expected: 1.4 },
      { input: [[0, 1], [0, 1]], expected: 1.0 },
      { input: [[1, 1], [0.5, 0.5]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Reliability slope rescales predicted probabilities so that a perfectly calibrated model has slope 1.",
  },
  {
    id: "ml-339",
    title: "Train-Serve Skew Ratio",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the worst relative train-serve feature skew: the maximum over features of abs(serve_mean - train_mean) / max(abs(train_mean), 1e-9). Compare only up to the shorter input; empty input returns 0.0.",
    starterCode: `def train_serve_skew(train_means, serve_means):
    # Your code here
    pass`,
    solution: `def train_serve_skew(train_means, serve_means):
    worst = 0.0
    for i in range(min(len(train_means), len(serve_means))):
        denom = max(abs(train_means[i]), 1e-9)
        skew = abs(serve_means[i] - train_means[i]) / denom
        if skew > worst:
            worst = skew
    return worst`,
    testCases: [
      { input: [[1, 2, 3], [1.1, 1.9, 3.3]], expected: 0.10000000000000009 },
      { input: [[0, 5], [0, 10]], expected: 1.0 },
      { input: [[2], [2]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Feature statistics that differ between training and serving pipelines cause silent degradation.",
  },
  {
    id: "ml-340",
    title: "Feature Drift KS Statistic",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the two-sample Kolmogorov-Smirnov statistic between raw reference and current feature values. Evaluate the empirical CDF gap at every distinct value from both samples and return the maximum absolute difference. Return 0.0 when either sample is empty.",
    starterCode: `def feature_drift_ks(reference, current):
    # Your code here
    pass`,
    solution: `def feature_drift_ks(reference, current):
    n = len(reference)
    m = len(current)
    if n == 0 or m == 0:
        return 0.0
    values = sorted(set(reference) | set(current))
    best = 0.0
    for v in values:
        fr = sum(1 for x in reference if x <= v) / n
        fc = sum(1 for x in current if x <= v) / m
        gap = abs(fr - fc)
        if gap > best:
            best = gap
    return best`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 5]], expected: 0.25 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 1.0 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[1, 2], [2, 3]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "The KS statistic is the largest vertical gap between the two empirical CDFs.",
  },
  {
    id: "ml-341",
    title: "Retention Curve Rates",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute a cohort retention curve as fractions of the initial cohort size: rates[i] = cohort_sizes[i] / cohort_sizes[0]. Return [] when the cohort is empty or starts at 0.",
    starterCode: `def retention_curve(cohort_sizes):
    # Your code here
    pass`,
    solution: `def retention_curve(cohort_sizes):
    if not cohort_sizes or cohort_sizes[0] == 0:
        return []
    return [s / cohort_sizes[0] for s in cohort_sizes]`,
    testCases: [
      { input: [[100, 60, 30, 15]], expected: [1.0, 0.6, 0.3, 0.15] },
      { input: [[50, 50]], expected: [1.0, 1.0] },
      { input: [[0, 5]], expected: [] },
      { input: [[]], expected: [] },
    ],
    hint: "Normalizing by the period-0 size makes cohorts of different sizes directly comparable.",
  },
  {
    id: "ml-342",
    title: "Cumulative Churn Rate",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the cumulative churn rate from monthly churn rates: 1 - product(1 - rate_i). Empty input returns 0.0.",
    starterCode: `def cumulative_churn(monthly_churn_rates):
    # Your code here
    pass`,
    solution: `def cumulative_churn(monthly_churn_rates):
    survival = 1.0
    for r in monthly_churn_rates:
        survival *= (1.0 - r)
    return 1.0 - survival`,
    testCases: [
      { input: [[0.1, 0.1]], expected: 0.18999999999999995 },
      { input: [[0.5, 0.5]], expected: 0.75 },
      { input: [[]], expected: 0.0 },
      { input: [[1.0, 0.2]], expected: 1.0 },
    ],
    hint: "Churn compounds: surviving each month requires surviving every earlier month too.",
  },
  {
    id: "ml-343",
    title: "Uplift Gain at Fraction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the uplift gain of the top fraction of a ranked list. Sort by predicted uplift descending (ties by index), take the top k = max(1, int(n * fraction)) samples, and subtract the overall treated-minus-control response difference from the top-k difference; a treatment group missing from the top k contributes a 0.0 rate. Return 0.0 for invalid fractions or a missing treatment group.",
    starterCode: `def uplift_gain_at_fraction(treatment, outcome, uplift_scores, fraction):
    # Your code here
    pass`,
    solution: `def uplift_gain_at_fraction(treatment, outcome, uplift_scores, fraction):
    n = len(treatment)
    nt = sum(treatment)
    nc = n - nt
    if n == 0 or nt == 0 or nc == 0 or fraction <= 0:
        return 0.0
    k = max(1, int(n * fraction))
    order = sorted(range(n), key=lambda i: (-uplift_scores[i], i))[:k]
    top_t = [outcome[i] for i in order if treatment[i] == 1]
    top_c = [outcome[i] for i in order if treatment[i] == 0]
    rate_t = sum(top_t) / len(top_t) if top_t else 0.0
    rate_c = sum(top_c) / len(top_c) if top_c else 0.0
    top_gain = rate_t - rate_c
    all_t = [outcome[i] for i in range(n) if treatment[i] == 1]
    all_c = [outcome[i] for i in range(n) if treatment[i] == 0]
    base = sum(all_t) / len(all_t) - sum(all_c) / len(all_c)
    return top_gain - base`,
    testCases: [
      { input: [[1, 0, 1, 0], [1, 1, 0, 1], [0.9, 0.8, 0.7, 0.6], 0.5], expected: 0.5 },
      { input: [[1, 0, 1, 0], [1, 1, 0, 1], [0.1, 0.2, 0.3, 0.4], 0.5], expected: -0.5 },
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.9, 0.1, 0.8, 0.2], 0.5], expected: 0.0 },
      { input: [[1, 1, 0, 0], [1, 0, 1, 0], [0.9, 0.1, 0.8, 0.2], 0], expected: 0.0 },
      { input: [[], [], [], 0.5], expected: 0.0 },
    ],
    hint: "Gain measures how much better the top-ranked segment responds compared with treating everyone at random.",
  },
  {
    id: "ml-344",
    title: "Self-Normalized IPS Estimate",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the self-normalized inverse propensity score estimate: sum(w * reward) / sum(w) with w = target_prob / behavior_prob and behavior_prob clipped to at least 1e-6. Return 0.0 when the weights sum to 0 or the input is empty.",
    starterCode: `def snips_estimate(rewards, behavior_probs, target_probs):
    # Your code here
    pass`,
    solution: `def snips_estimate(rewards, behavior_probs, target_probs):
    if not rewards:
        return 0.0
    num = 0.0
    den = 0.0
    for i in range(len(rewards)):
        w = target_probs[i] / max(behavior_probs[i], 1e-6)
        num += w * rewards[i]
        den += w
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 0, 2], [0.5, 0.5, 0.4], [0.7, 0.3, 0.5]], expected: 1.2 },
      { input: [[1], [0.25], [1.0]], expected: 1.0 },
      { input: [[0, 0], [1, 1], [0.5, 0.5]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Dividing by the sum of the weights keeps the estimate stable when importance weights explode.",
  },
  {
    id: "ml-345",
    title: "Propensity Trimming Fraction",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the fraction of propensity scores that need trimming: those strictly below epsilon or strictly above 1 - epsilon. Empty input returns 0.0.",
    starterCode: `def trimmed_propensity_fraction(propensities, epsilon):
    # Your code here
    pass`,
    solution: `def trimmed_propensity_fraction(propensities, epsilon):
    if not propensities:
        return 0.0
    count = 0
    for p in propensities:
        if p < epsilon or p > 1.0 - epsilon:
            count += 1
    return count / len(propensities)`,
    testCases: [
      { input: [[0.5, 0.1, 0.95, 0.9], 0.15], expected: 0.75 },
      { input: [[0.5, 0.5], 0.1], expected: 0.0 },
      { input: [[], 0.1], expected: 0.0 },
      { input: [[0.0, 1.0], 0.0], expected: 0.0 },
      { input: [[0.05, 0.95], 0.1], expected: 1.0 },
    ],
    hint: "Extreme propensities produce enormous weights, so samples near 0 or 1 are often dropped.",
  },
  {
    id: "ml-346",
    title: "ATT Propensity Weights",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute ATT propensity weights: treated units get weight 1.0 and control units get e / (1 - e) with the propensity e clipped to [1e-6, 1 - 1e-6]. Return the weights in input order; empty input returns [].",
    starterCode: `def att_weights(treatment, propensity):
    # Your code here
    pass`,
    solution: `def att_weights(treatment, propensity):
    result = []
    for i in range(len(treatment)):
        e = min(max(propensity[i], 1e-6), 1.0 - 1e-6)
        if treatment[i] == 1:
            result.append(1.0)
        else:
            result.append(e / (1.0 - e))
    return result`,
    testCases: [
      { input: [[1, 0, 0, 1], [0.8, 0.4, 0.9, 0.2]], expected: [1.0, 0.6666666666666667, 9.000000000000002, 1.0] },
      { input: [[1, 1, 0, 0], [0.5, 0.5, 0.5, 0.5]], expected: [1.0, 1.0, 1.0, 1.0] },
      { input: [[], []], expected: [] },
      { input: [[0], [0.5]], expected: [1.0] },
    ],
    hint: "ATT weights reweight controls to look like the treated group instead of the full population.",
  },
  {
    id: "ml-347",
    title: "Yates Sample Ratio Mismatch",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Yates-corrected sample ratio mismatch chi-square. With expected_i = total * ratio_i, add max(0, abs(observed_i - expected_i) - 0.5)^2 / expected_i for positive expected counts. Return 0.0 when the observed total is 0.",
    starterCode: `def yates_sample_ratio_mismatch(observed, expected_ratios):
    # Your code here
    pass`,
    solution: `def yates_sample_ratio_mismatch(observed, expected_ratios):
    total = sum(observed)
    if total == 0:
        return 0.0
    chi = 0.0
    for o, ratio in zip(observed, expected_ratios):
        e = total * ratio
        if e > 0:
            diff = abs(o - e) - 0.5
            if diff < 0:
                diff = 0.0
            chi += diff * diff / e
    return chi`,
    testCases: [
      { input: [[45, 55], [0.5, 0.5]], expected: 0.81 },
      { input: [[50, 50], [0.5, 0.5]], expected: 0.0 },
      { input: [[30, 70], [0.5, 0.5]], expected: 15.21 },
      { input: [[], []], expected: 0.0 },
      { input: [[10], [1.0]], expected: 0.0 },
    ],
    hint: "A large mismatch between observed and planned traffic share suggests the randomization is broken.",
  },
  {
    id: "ml-348",
    title: "O'Brien-Fleming Alpha Spending",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the O'Brien-Fleming alpha spending function at information fraction t: 2 * (1 - Phi(z / sqrt(t))), where Phi is the standard normal CDF and z is its inverse at 1 - alpha/2 (found by bisection). Return 0.0 for t <= 0 and alpha for t >= 1.",
    starterCode: `import math

def obf_alpha_spending(alpha, info_fraction):
    # Your code here
    pass`,
    solution: `import math

def obf_alpha_spending(alpha, info_fraction):
    if alpha <= 0 or info_fraction <= 0:
        return 0.0
    if info_fraction >= 1:
        return alpha
    target = 1.0 - alpha / 2.0
    lo = 0.0
    hi = 40.0
    for _ in range(200):
        mid = (lo + hi) / 2.0
        cdf = 0.5 * (1.0 + math.erf(mid / math.sqrt(2.0)))
        if cdf < target:
            lo = mid
        else:
            hi = mid
    z = (lo + hi) / 2.0
    x = z / math.sqrt(info_fraction)
    upper_tail = 1.0 - 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return 2.0 * upper_tail`,
    testCases: [
      { input: [0.05, 0.25], expected: 8.857543832130332e-05 },
      { input: [0.05, 0.5], expected: 0.005574596680784527 },
      { input: [0.01, 0.5], expected: 0.00026971695663147166 },
      { input: [0.05, 0.0], expected: 0.0 },
      { input: [0.05, 1.0], expected: 0.05 },
    ],
    hint: "The spending function releases very little alpha early and approaches the full alpha at the final look.",
  },
  {
    id: "ml-349",
    title: "Canary Traffic Split",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Split incoming traffic between a canary and the stable model. The canary receives int(total_requests * canary_percent / 100) requests and the remainder goes to stable. Return [canary, stable]; a non-positive total returns [0, 0] and a non-positive percent sends everything to stable.",
    starterCode: `def canary_split(total_requests, canary_percent):
    # Returns [canary, stable]
    # Your code here
    pass`,
    solution: `def canary_split(total_requests, canary_percent):
    if total_requests <= 0:
        return [0, 0]
    if canary_percent <= 0:
        return [0, total_requests]
    canary = int(total_requests * canary_percent / 100.0)
    return [canary, total_requests - canary]`,
    testCases: [
      { input: [1000, 10], expected: [100, 900] },
      { input: [333, 10], expected: [33, 300] },
      { input: [50, 0], expected: [0, 50] },
      { input: [0, 10], expected: [0, 0] },
      { input: [50, 100], expected: [50, 0] },
    ],
    hint: "Starting small limits the blast radius if the new model misbehaves.",
  },
  {
    id: "ml-350",
    title: "Shadow Latency Overhead",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute shadow deployment latency overhead as (mean_shadow - mean_primary) / mean_primary. Return 0.0 when either list is empty or the primary mean is 0.",
    starterCode: `def shadow_latency_overhead(primary_latencies, shadow_latencies):
    # Your code here
    pass`,
    solution: `def shadow_latency_overhead(primary_latencies, shadow_latencies):
    if not primary_latencies or not shadow_latencies:
        return 0.0
    mp = sum(primary_latencies) / len(primary_latencies)
    ms = sum(shadow_latencies) / len(shadow_latencies)
    if mp == 0:
        return 0.0
    return (ms - mp) / mp`,
    testCases: [
      { input: [[10, 20], [12, 26]], expected: 0.26666666666666666 },
      { input: [[5], [5]], expected: 0.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Shadow traffic does not affect users but still consumes serving capacity.",
  },
  {
    id: "ml-351",
    title: "Optimal Ensemble Weight",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the minimum-variance ensemble weight for model A: w = (var_b - cov) / (var_a + var_b - 2 * cov) using population statistics, clamped to [0, 1]. Return 0.5 when there are fewer than two paired errors, lengths differ, or the denominator is 0.",
    starterCode: `def optimal_ensemble_weight(errors_a, errors_b):
    # Your code here
    pass`,
    solution: `def optimal_ensemble_weight(errors_a, errors_b):
    n = len(errors_a)
    if n < 2 or n != len(errors_b):
        return 0.5
    ma = sum(errors_a) / n
    mb = sum(errors_b) / n
    va = sum((e - ma) ** 2 for e in errors_a) / n
    vb = sum((e - mb) ** 2 for e in errors_b) / n
    cov = sum((errors_a[i] - ma) * (errors_b[i] - mb) for i in range(n)) / n
    denom = va + vb - 2.0 * cov
    if denom == 0:
        return 0.5
    w = (vb - cov) / denom
    if w < 0:
        return 0.0
    if w > 1:
        return 1.0
    return w`,
    testCases: [
      { input: [[0, 0, 0, 0], [1, 2, 3, 4]], expected: 1.0 },
      { input: [[1, 2, 3, 4], [2, 3, 4, 5]], expected: 0.5 },
      { input: [[3, 1, 4, 1, 5, 9], [2, 7, 1, 8, 2, 8]], expected: 0.5520661157024793 },
      { input: [[1], [2]], expected: 0.5 },
      { input: [[], []], expected: 0.5 },
    ],
    hint: "The variance-minimizing weight leans on the more stable model and on whichever error is less correlated.",
  },
  {
    id: "ml-352",
    title: "Latency Budget Allocation",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Allocate a latency budget across stages by multiplying the total budget in milliseconds by each stage share. Return the list of per-stage budgets; empty shares return [].",
    starterCode: `def latency_budget_allocation(total_ms, shares):
    # Your code here
    pass`,
    solution: `def latency_budget_allocation(total_ms, shares):
    return [total_ms * s for s in shares]`,
    testCases: [
      { input: [200, [0.1, 0.2, 0.7]], expected: [20.0, 40.0, 140.0] },
      { input: [100, [1.0]], expected: [100.0] },
      { input: [50, []], expected: [] },
      { input: [0, [0.5, 0.5]], expected: [0.0, 0.0] },
    ],
    hint: "Splitting an end-to-end latency objective into per-stage budgets makes each team's target explicit.",
  },
  {
    id: "ml-353",
    title: "Batched Throughput",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute batching throughput. The number of batches is ceil(n_requests / batch_size), total time is batches * latency_ms, and throughput is n_requests per second. Return [batches, total_time_ms, throughput]; non-positive arguments return [0, 0.0, 0.0].",
    starterCode: `import math

def batched_throughput(n_requests, batch_size, latency_ms):
    # Returns [batches, total_time_ms, throughput]
    # Your code here
    pass`,
    solution: `import math

def batched_throughput(n_requests, batch_size, latency_ms):
    if n_requests <= 0 or batch_size <= 0 or latency_ms <= 0:
        return [0, 0.0, 0.0]
    batches = math.ceil(n_requests / batch_size)
    total_time = batches * latency_ms
    throughput = n_requests / (total_time / 1000.0)
    return [batches, total_time, throughput]`,
    testCases: [
      { input: [100, 32, 50], expected: [4, 200, 500.0] },
      { input: [10, 10, 100], expected: [1, 100, 100.0] },
      { input: [7, 3, 30], expected: [3, 90, 77.77777777777779] },
      { input: [0, 5, 10], expected: [0, 0.0, 0.0] },
    ],
    hint: "Larger batches raise throughput but add queueing delay for the first requests.",
  },
  {
    id: "ml-354",
    title: "Batch Padding Waste",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute wasted padding slots when batching: ceil(n_requests / batch_size) * batch_size - n_requests. Non-positive arguments return 0.",
    starterCode: `import math

def batch_padding_waste(n_requests, batch_size):
    # Your code here
    pass`,
    solution: `import math

def batch_padding_waste(n_requests, batch_size):
    if n_requests <= 0 or batch_size <= 0:
        return 0
    return math.ceil(n_requests / batch_size) * batch_size - n_requests`,
    testCases: [
      { input: [100, 32], expected: 28 },
      { input: [64, 8], expected: 0 },
      { input: [5, 7], expected: 2 },
      { input: [0, 4], expected: 0 },
    ],
    hint: "Padding keeps tensor shapes fixed but wastes compute on empty slots.",
  },
  {
    id: "ml-355",
    title: "Cold-Start User Share",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the cold-start user share: the fraction of users whose interaction count is below min_interactions. Empty input returns 0.0.",
    starterCode: `def cold_start_share(interaction_counts, min_interactions):
    # Your code here
    pass`,
    solution: `def cold_start_share(interaction_counts, min_interactions):
    if not interaction_counts:
        return 0.0
    cold = 0
    for c in interaction_counts:
        if c < min_interactions:
            cold += 1
    return cold / len(interaction_counts)`,
    testCases: [
      { input: [[1, 5, 0, 10], 3], expected: 0.5 },
      { input: [[5, 6], 3], expected: 0.0 },
      { input: [[0, 0], 1], expected: 1.0 },
      { input: [[], 3], expected: 0.0 },
    ],
    hint: "A large cold-start share means the recommender must lean on fallbacks and popularity priors.",
  },
  {
    id: "ml-356",
    title: "Popularity Bias Share",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the popularity bias share: the fraction of recommended item ids that appear in the popular item list. Empty recommendations return 0.0.",
    starterCode: `def popularity_bias_share(recommended_ids, popular_ids):
    # Your code here
    pass`,
    solution: `def popularity_bias_share(recommended_ids, popular_ids):
    if not recommended_ids:
        return 0.0
    popular = set(popular_ids)
    hits = 0
    for r in recommended_ids:
        if r in popular:
            hits += 1
    return hits / len(recommended_ids)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 3]], expected: 0.5 },
      { input: [[5, 6], [1, 2]], expected: 0.0 },
      { input: [[1, 1, 1], [1]], expected: 1.0 },
      { input: [[], [1]], expected: 0.0 },
    ],
    hint: "High popularity share can starve the long tail of exposure.",
  },
  {
    id: "ml-357",
    title: "Feedback Loop Amplification",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Estimate one step of feedback-loop amplification. Form next exposure as exposure_i * score_i normalized to sum to 1, then return the ratio of the largest next exposure share to the largest current exposure share. Return 0.0 when the input is empty or the relevant totals are 0.",
    starterCode: `def feedback_amplification(exposure, scores):
    # Your code here
    pass`,
    solution: `def feedback_amplification(exposure, scores):
    total = sum(exposure)
    if not exposure or total == 0:
        return 0.0
    raw = [exposure[i] * scores[i] for i in range(len(exposure))]
    z = sum(raw)
    if z == 0:
        return 0.0
    current_share = max(exposure) / total
    next_share = max(raw) / z
    return next_share / current_share`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], [1, 2, 3]], expected: 0.7058823529411765 },
      { input: [[0.2, 0.3, 0.5], [3, 2, 1]], expected: 0.7058823529411765 },
      { input: [[0.1, 0.2, 0.7], [1, 1, 1]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.5, 0.5], [0, 0]], expected: 0.0 },
    ],
    hint: "Training on data generated by the current model can amplify whatever it already over-exposes.",
  },
  {
    id: "ml-358",
    title: "Position Bias Correction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Correct click-through rate for position bias with inverse propensity weighting: the mean of clicks_i / max(examination_prob_i, 1e-6). Empty input returns 0.0.",
    starterCode: `def position_bias_corrected_ctr(clicks, examination_probs):
    # Your code here
    pass`,
    solution: `def position_bias_corrected_ctr(clicks, examination_probs):
    if not clicks:
        return 0.0
    total = 0.0
    for i in range(len(clicks)):
        e = max(examination_probs[i], 1e-6)
        total += clicks[i] / e
    return total / len(clicks)`,
    testCases: [
      { input: [[1, 0, 1], [1.0, 0.5, 0.25]], expected: 1.6666666666666667 },
      { input: [[1, 0], [0.5, 0.5]], expected: 1.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Dividing by the probability that a position was examined removes its advantage.",
  },
  {
    id: "ml-359",
    title: "Model Version Bump",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the next semantic version string after bumping major, minor, or patch. A major bump resets minor and patch to 0, a minor bump resets patch to 0, and a patch bump increments the third number. Unknown bump names or malformed versions return the version unchanged.",
    starterCode: `def bump_version(version, part):
    # Your code here
    pass`,
    solution: `def bump_version(version, part):
    nums = version.split(".")
    if len(nums) != 3:
        return version
    try:
        major = int(nums[0])
        minor = int(nums[1])
        patch = int(nums[2])
    except ValueError:
        return version
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    if part == "patch":
        return f"{major}.{minor}.{patch + 1}"
    return version`,
    testCases: [
      { input: ["1.4.9", "patch"], expected: "1.4.10" },
      { input: ["1.4.9", "minor"], expected: "1.5.0" },
      { input: ["1.4.9", "major"], expected: "2.0.0" },
      { input: ["2.0.0", "other"], expected: "2.0.0" },
      { input: ["1.4", "patch"], expected: "1.4" },
    ],
    hint: "A registry bump marks a new immutable artifact so rollbacks can point at the previous version.",
  },
  {
    id: "ml-360",
    title: "Rollback Trigger Index",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Find the first metric window that falls below a rollback threshold of baseline * (1 - max_degradation). Return the first failing index, or -1 when no window fails. Empty input returns -1.",
    starterCode: `def rollback_trigger_index(metrics, baseline, max_degradation):
    # Your code here
    pass`,
    solution: `def rollback_trigger_index(metrics, baseline, max_degradation):
    threshold = baseline * (1.0 - max_degradation)
    for i in range(len(metrics)):
        if metrics[i] < threshold:
            return i
    return -1`,
    testCases: [
      { input: [[0.9, 0.85, 0.7, 0.6], 0.9, 0.1], expected: 2 },
      { input: [[0.9, 0.88], 0.9, 0.05], expected: -1 },
      { input: [[0.5], 1.0, 0.5], expected: -1 },
      { input: [[], 1.0, 0.1], expected: -1 },
      { input: [[0.8], 0.9, 0.1], expected: 0 },
    ],
    hint: "An automated rollback fires as soon as a monitored window breaches its degradation budget.",
  },
];
