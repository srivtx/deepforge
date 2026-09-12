import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-091",
    title: "Micro Precision",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute micro-averaged precision over the labels present in y_true or y_pred. Micro precision pools all decisions: the total number of true positives divided by the total number of positive predictions.\n\nReturn 0.0 if nothing is predicted positive or the input is empty.",
    starterCode: `def micro_precision(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def micro_precision(y_true, y_pred):
    if not y_true:
        return 0.0
    classes = sorted(set(y_true) | set(y_pred))
    tp = 0
    fp = 0
    for c in classes:
        tp += sum(1 for t, p in zip(y_true, y_pred) if t == c and p == c)
        fp += sum(1 for t, p in zip(y_true, y_pred) if t != c and p == c)
    denom = tp + fp
    return tp / denom if denom > 0 else 0.0`,
    testCases: [
      { input: [[0, 1, 2, 0], [0, 1, 2, 1]], expected: 0.75 },
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[0, 0, 1, 1], [1, 1, 0, 0]], expected: 0.0 },
      { input: [[0, 1], [2, 1]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Pool every class's TP and FP counts instead of averaging per-class precisions.",
  },
  {
    id: "ml-092",
    title: "Specificity",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute specificity (true negative rate) for binary labels with positive class 1: TN / (TN + FP).\n\nReturn 0.0 when the denominator is zero or the input is empty.",
    starterCode: `def specificity(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def specificity(y_true, y_pred):
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    denom = tn + fp
    return tn / denom if denom > 0 else 0.0`,
    testCases: [
      { input: [[1, 0, 0, 1, 0], [1, 1, 0, 1, 0]], expected: 0.6666666666666666 },
      { input: [[1, 0, 1, 0], [1, 0, 1, 0]], expected: 1.0 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Specificity is recall for the negative class.",
  },
  {
    id: "ml-093",
    title: "Negative Predictive Value",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the negative predictive value: TN / (TN + FN), the share of negative predictions that are correct.\n\nReturn 0.0 when the denominator is zero or the input is empty.",
    starterCode: `def negative_predictive_value(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def negative_predictive_value(y_true, y_pred):
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    denom = tn + fn
    return tn / denom if denom > 0 else 0.0`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 0, 1]], expected: 0.6666666666666666 },
      { input: [[0, 0], [0, 0]], expected: 1.0 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "It is precision applied to the negative class.",
  },
  {
    id: "ml-094",
    title: "F-Beta Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the F-beta score: (1 + beta^2) * precision * recall / (beta^2 * precision + recall), where precision = TP/(TP+FP) and recall = TP/(TP+FN) and both are 0.0 when their denominator is zero.\n\nReturn 0.0 if the F-beta denominator is 0. Empty input returns 0.0.",
    starterCode: `def fbeta_score(y_true, y_pred, beta):
    # Your code here
    pass`,
    solution: `def fbeta_score(y_true, y_pred, beta):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    denom = beta * beta * prec + rec
    if denom == 0:
        return 0.0
    return (1 + beta * beta) * prec * rec / denom`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [1, 0, 0, 1, 0], 1], expected: 0.8 },
      { input: [[1, 0, 1, 1, 0], [1, 0, 0, 1, 0], 2], expected: 0.7142857142857142 },
      { input: [[1, 0, 1, 1, 0], [1, 0, 0, 1, 0], 0.5], expected: 0.9090909090909091 },
      { input: [[0, 0], [1, 1], 1], expected: 0.0 },
      { input: [[], [], 1], expected: 0.0 },
    ],
    hint: "beta > 1 favors recall; beta < 1 favors precision; beta = 1 is the harmonic mean of the two.",
  },
  {
    id: "ml-095",
    title: "Jaccard Index",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Jaccard index (intersection over union) for binary labels with positive class 1: TP / (TP + FP + FN).\n\nReturn 0.0 when the denominator is zero or the input is empty.",
    starterCode: `def jaccard_index(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def jaccard_index(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    denom = tp + fp + fn
    return tp / denom if denom > 0 else 0.0`,
    testCases: [
      { input: [[1, 0, 1, 1], [1, 0, 0, 1]], expected: 0.6666666666666666 },
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Intersection over union of the predicted and true positive sets.",
  },
  {
    id: "ml-096",
    title: "Dice Coefficient for Binary Labels",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Dice coefficient for binary labels with positive class 1: 2*TP / (2*TP + FP + FN).\n\nReturn 0.0 when the denominator is zero or the input is empty.",
    starterCode: `def dice_coefficient(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def dice_coefficient(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    denom = 2 * tp + fp + fn
    return 2 * tp / denom if denom > 0 else 0.0`,
    testCases: [
      { input: [[1, 0, 1, 1], [1, 0, 0, 1]], expected: 0.8 },
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[1, 1], [0, 0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "The Dice coefficient is the F1 score of the positive class.",
  },
  {
    id: "ml-097",
    title: "Mean Squared Logarithmic Error",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean squared logarithmic error: mean((log1p(y_i) - log1p(pred_i))^2).\n\nTargets and predictions are assumed non-negative. Empty input returns 0.0.",
    starterCode: `import math
def mean_squared_log_error(y_true, y_pred):
    # Your code here
    pass`,
    solution: `import math
def mean_squared_log_error(y_true, y_pred):
    if not y_true:
        return 0.0
    return sum((math.log1p(t) - math.log1p(p)) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true)`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[0, 0], [1, 1]], expected: 0.4804530139182014 },
      { input: [[1, 3], [2, 1]], expected: 0.32242748390568343 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Apply log1p to both sides before squaring, so ratios matter more than absolute gaps.",
  },
  {
    id: "ml-098",
    title: "Mean Absolute Percentage Error with Zero Handling",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean absolute percentage error in percent. Terms with an actual value of 0 are skipped and the mean is taken over the remaining samples; if all actuals are 0, return 0.0.\n\nEmpty input returns 0.0.",
    starterCode: `def mean_absolute_percentage_error(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def mean_absolute_percentage_error(y_true, y_pred):
    if not y_true:
        return 0.0
    total = 0.0
    count = 0
    for t, p in zip(y_true, y_pred):
        if t != 0:
            total += abs((t - p) / t)
            count += 1
    if count == 0:
        return 0.0
    return 100.0 * total / count`,
    testCases: [
      { input: [[100, 200], [110, 190]], expected: 7.500000000000001 },
      { input: [[10], [12]], expected: 20.0 },
      { input: [[0, 10], [0, 5]], expected: 50.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Divide the absolute error by the actual value and report a percentage.",
  },
  {
    id: "ml-099",
    title: "Explained Sum of Squares",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the explained sum of squares of a regression: sum((pred_i - mean(y_true))^2).\n\nEmpty input returns 0.0.",
    starterCode: `def explained_sum_of_squares(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def explained_sum_of_squares(y_true, y_pred):
    n = len(y_true)
    if n == 0:
        return 0.0
    mean = sum(y_true) / n
    return sum((p - mean) ** 2 for p in y_pred)`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 2.0 },
      { input: [[1, 2, 3], [2, 2, 2]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 3, 3, 3]], expected: 3.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Measure how far predictions spread around the mean of the true values.",
  },
  {
    id: "ml-100",
    title: "Youden's J Statistic",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute Youden's J statistic: TPR - FPR, where TPR = TP/(TP+FN) and FPR = FP/(FP+TN) for positive class 1.\n\nEach rate is 0.0 when its denominator is zero. Empty input returns 0.0.",
    starterCode: `def youdens_j(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def youdens_j(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    return tpr - fpr`,
    testCases: [
      { input: [[1, 0, 1, 0], [1, 0, 1, 1]], expected: 0.5 },
      { input: [[1, 0, 1, 0], [1, 0, 1, 0]], expected: 1.0 },
      { input: [[1, 0, 1, 0], [0, 1, 0, 1]], expected: -1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "J equals recall + specificity - 1.",
  },
  {
    id: "ml-101",
    title: "Expected Calibration Error by Probability Bins",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the expected calibration error with equal-width bins. Assign p to bin min(int(p * num_bins), num_bins - 1), then return the sum over non-empty bins of (count/n) * |mean_true - mean_pred|.\n\nEmpty input returns 0.0.",
    starterCode: `def expected_calibration_error(y_true, probs, num_bins):
    # Your code here
    pass`,
    solution: `def expected_calibration_error(y_true, probs, num_bins):
    n = len(y_true)
    if n == 0:
        return 0.0
    counts = [0] * num_bins
    sum_p = [0.0] * num_bins
    sum_y = [0.0] * num_bins
    for t, p in zip(y_true, probs):
        idx = int(p * num_bins)
        if idx >= num_bins:
            idx = num_bins - 1
        if idx < 0:
            idx = 0
        counts[idx] += 1
        sum_p[idx] += p
        sum_y[idx] += t
    ece = 0.0
    for b in range(num_bins):
        if counts[b] > 0:
            ece += counts[b] / n * abs(sum_y[b] / counts[b] - sum_p[b] / counts[b])
    return ece`,
    testCases: [
      { input: [[0, 0, 0, 1, 1, 1], [0.1, 0.2, 0.3, 0.7, 0.8, 0.9], 3], expected: 0.20000000000000007 },
      { input: [[1, 1, 0, 0], [1.0, 1.0, 0.0, 0.0], 2], expected: 0.0 },
      { input: [[0, 1], [0.3, 0.7], 1], expected: 0.0 },
      { input: [[], [], 3], expected: 0.0 },
    ],
    hint: "Each bin contributes its share of samples times the gap between average confidence and accuracy.",
  },
  {
    id: "ml-102",
    title: "Lift at K",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute lift at k: the precision among the k highest-scored samples divided by the overall positive rate.\n\nSort by score descending, breaking ties by the original index. Return 0.0 if k is not in [1, n], the base rate is 0, or the input is empty.",
    starterCode: `def lift_at_k(y_true, scores, k):
    # Your code here
    pass`,
    solution: `def lift_at_k(y_true, scores, k):
    n = len(y_true)
    if n == 0 or k <= 0 or k > n:
        return 0.0
    base = sum(1 for t in y_true if t == 1) / n
    if base == 0:
        return 0.0
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    top = order[:k]
    hits = sum(1 for i in top if y_true[i] == 1)
    return (hits / k) / base`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.8, 0.9], 2], expected: 2.0 },
      { input: [[0, 1, 1, 0], [0.9, 0.8, 0.2, 0.1], 1], expected: 0.0 },
      { input: [[0, 1, 1, 0], [0.9, 0.8, 0.2, 0.1], 2], expected: 1.0 },
      { input: [[0, 1, 1, 0], [0.9, 0.8, 0.2, 0.1], 5], expected: 0.0 },
      { input: [[], [], 1], expected: 0.0 },
    ],
    hint: "Lift compares top-k precision against what random selection would achieve.",
  },
  {
    id: "ml-103",
    title: "Logistic Regression Gradient",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the batch gradient of the average logistic log-loss with respect to weights w and intercept b.\n\nWith p_i = sigmoid(b + x_i . w), grad_b = mean(p_i - y_i) and grad_j = mean((p_i - y_i) * x_ij). Return [grad_b, grad_w]; empty X returns [0.0, [0.0] * len(w)].",
    starterCode: `import math
def logistic_gradient(X, y, w, b):
    # Returns [grad_b, grad_w]
    # Your code here
    pass`,
    solution: `import math
def logistic_gradient(X, y, w, b):
    n = len(X)
    d = len(w)
    if n == 0:
        return [0.0, [0.0] * d]
    preds = []
    for i in range(n):
        z = b + sum(X[i][j] * w[j] for j in range(d))
        if z >= 0:
            preds.append(1.0 / (1.0 + math.exp(-z)))
        else:
            ez = math.exp(z)
            preds.append(ez / (1.0 + ez))
    resid = [preds[i] - y[i] for i in range(n)]
    grad_b = sum(resid) / n
    grad_w = [sum(X[i][j] * resid[i] for i in range(n)) / n for j in range(d)]
    return [grad_b, grad_w]`,
    testCases: [
      { input: [[[1], [2], [3]], [0, 1, 1], [0], 0], expected: [-0.16666666666666666, [-0.6666666666666666]] },
      { input: [[[0], [1]], [1, 1], [0], 1], expected: [-0.2689414213699951, [-0.13447071068499755]] },
      { input: [[[1, 0], [0, 1]], [1, 0], [0, 0], 0], expected: [0.0, [-0.25, 0.25]] },
      { input: [[], [], [2, 3], 0], expected: [0.0, [0.0, 0.0]] },
    ],
    hint: "The logistic log-loss gradient is the average of (sigmoid score - label) times each feature.",
  },
  {
    id: "ml-104",
    title: "Perceptron Update Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one perceptron update. Predict 1 when b + w . x >= 0, else 0. If the prediction is correct, return [list(w), b] unchanged; otherwise update w_j += lr * (y - pred) * x_j and b += lr * (y - pred).\n\nReturn [new_w, new_b].",
    starterCode: `def perceptron_update(x, y, w, b, lr):
    # Returns [new_w, new_b]
    # Your code here
    pass`,
    solution: `def perceptron_update(x, y, w, b, lr):
    z = b + sum(w[j] * x[j] for j in range(len(w)))
    pred = 1 if z >= 0 else 0
    if pred == y:
        return [list(w), b]
    err = y - pred
    new_w = [w[j] + lr * err * x[j] for j in range(len(w))]
    return [new_w, b + lr * err]`,
    testCases: [
      { input: [[1, 2], 1, [0, 0], 0, 0.5], expected: [[0, 0], 0] },
      { input: [[1, 2], 0, [0, 0], 0, 0.5], expected: [[-0.5, -1.0], -0.5] },
      { input: [[1, -1], 1, [1, 1], -0.5, 0.1], expected: [[1.1, 0.9], -0.4] },
      { input: [[0, 0], 0, [1, 1], 0, 0.1], expected: [[1.0, 1.0], -0.1] },
    ],
    hint: "Only misclassified points move the decision boundary.",
  },
  {
    id: "ml-105",
    title: "Hinge Loss Subgradient",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the mean subgradient of the hinge loss with respect to w and b for labels in {-1, +1}.\n\nFor each sample with margin y_i * (b + x_i . w) < 1, subtract y_i / n from grad_b and y_i * x_ij / n from grad_w[j]. Return [grad_b, grad_w]; empty X returns [0.0, [0.0] * len(w)].",
    starterCode: `def hinge_subgradient(X, y, w, b):
    # Returns [grad_b, grad_w]
    # Your code here
    pass`,
    solution: `def hinge_subgradient(X, y, w, b):
    n = len(X)
    d = len(w)
    if n == 0:
        return [0.0, [0.0] * d]
    grad_b = 0.0
    grad_w = [0.0] * d
    for i in range(n):
        margin = y[i] * (b + sum(X[i][j] * w[j] for j in range(d)))
        if margin < 1:
            grad_b -= y[i] / n
            for j in range(d):
                grad_w[j] -= y[i] * X[i][j] / n
    return [grad_b, grad_w]`,
    testCases: [
      { input: [[[1], [2]], [1, -1], [0], 0], expected: [0.0, [0.5]] },
      { input: [[[1]], [1], [2], 0], expected: [0.0, [0.0]] },
      { input: [[[1, 1], [2, -1]], [1, 1], [0, 0], 0], expected: [-1.0, [-1.5, 0.0]] },
      { input: [[], [], [1, 2], 0], expected: [0.0, [0.0, 0.0]] },
    ],
    hint: "Samples with margin at least 1 contribute nothing to the subgradient.",
  },
  {
    id: "ml-106",
    title: "Decision Stump Predict",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Predict with a one-level decision stump. For each value in X, return left_label when x <= threshold and right_label otherwise.\n\nEmpty X returns [].",
    starterCode: `def decision_stump_predict(X, threshold, left_label, right_label):
    # Your code here
    pass`,
    solution: `def decision_stump_predict(X, threshold, left_label, right_label):
    return [left_label if x <= threshold else right_label for x in X]`,
    testCases: [
      { input: [[1, 2, 3, 4], 2.5, "A", "B"], expected: ["A", "A", "B", "B"] },
      { input: [[0, 0.5, 1], 0.5, 0, 1], expected: [0, 0, 1] },
      { input: [[5], 5, "yes", "no"], expected: ["yes"] },
      { input: [[], 1, 0, 1], expected: [] },
    ],
    hint: "Compare each value to the threshold and emit the matching label.",
  },
  {
    id: "ml-107",
    title: "Distance-Weighted KNN Vote",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Predict a label by distance-weighted k-nearest-neighbor voting using Euclidean distance. Weight each neighbor by 1/d; if a zero distance is found, immediately return that neighbor's label.\n\nTies are broken by the smallest label. If there are no neighbors to vote, return None.",
    starterCode: `def knn_weighted_vote(X_train, y_train, x_test, k):
    # Your code here
    pass`,
    solution: `def knn_weighted_vote(X_train, y_train, x_test, k):
    distances = []
    for i, x in enumerate(X_train):
        d = sum((a - b) ** 2 for a, b in zip(x, x_test)) ** 0.5
        distances.append((d, y_train[i]))
    distances.sort(key=lambda t: t[0])
    weights = {}
    for i in range(min(k, len(distances))):
        d, label = distances[i]
        if d == 0:
            return label
        weights[label] = weights.get(label, 0.0) + 1.0 / d
    if not weights:
        return None
    best = None
    best_w = -1.0
    for label in sorted(weights.keys()):
        if weights[label] > best_w:
            best_w = weights[label]
            best = label
    return best`,
    testCases: [
      { input: [[[0], [1], [3]], ["a", "b", "b"], [0.5], 3], expected: "b" },
      { input: [[[1], [2]], [5, 9], [1], 2], expected: 5 },
      { input: [[[0], [10]], [1, 2], [1], 1], expected: 1 },
      { input: [[], [], [0], 1], expected: null },
    ],
    hint: "Nearer neighbors get larger 1/d weights; an exact match short-circuits the vote.",
  },
  {
    id: "ml-108",
    title: "Laplace Smoothing",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Apply Laplace (add-alpha) smoothing to a list of counts: (c_i + alpha) / (sum(c) + alpha * K).\n\nEmpty counts returns []; if the smoothed denominator is 0, return all zeros.",
    starterCode: `def laplace_smoothing(counts, alpha):
    # Your code here
    pass`,
    solution: `def laplace_smoothing(counts, alpha):
    k = len(counts)
    if k == 0:
        return []
    denom = sum(counts) + alpha * k
    if denom == 0:
        return [0.0 for _ in counts]
    return [(c + alpha) / denom for c in counts]`,
    testCases: [
      { input: [[0, 0, 0], 1], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[10, 0], 1], expected: [0.9166666666666666, 0.08333333333333333] },
      { input: [[3, 1, 1], 0.5], expected: [0.5384615384615384, 0.23076923076923078, 0.23076923076923078] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Add alpha to every count and alpha times K to the denominator.",
  },
  {
    id: "ml-109",
    title: "Label Smoothing",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Build smoothed one-hot targets: the true class gets 1 - epsilon and every other class gets epsilon / (num_classes - 1).\n\nReturn the list of rows; empty input returns [].",
    starterCode: `def label_smoothing(y_true, num_classes, epsilon):
    # Your code here
    pass`,
    solution: `def label_smoothing(y_true, num_classes, epsilon):
    result = []
    for t in y_true:
        row = []
        for c in range(num_classes):
            if c == t:
                row.append(1.0 - epsilon)
            else:
                row.append(epsilon / (num_classes - 1) if num_classes > 1 else epsilon)
        result.append(row)
    return result`,
    testCases: [
      { input: [[0, 2], 3, 0.3], expected: [[0.7, 0.15, 0.15], [0.15, 0.15, 0.7]] },
      { input: [[1], 2, 0.2], expected: [[0.2, 0.8]] },
      { input: [[0], 1, 0.1], expected: [[0.9]] },
      { input: [[], 3, 0.1], expected: [] },
    ],
    hint: "Redistribute epsilon mass equally to the non-target classes.",
  },
  {
    id: "ml-110",
    title: "Class-Weighted Accuracy",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute accuracy weighted by class weights. Each sample contributes the weight of its true label from the weights dict, keyed by str(label); correct predictions accumulate weighted credit.\n\nReturn correct weight / total weight, or 0.0 when the total weight is 0 or the input is empty.",
    starterCode: `def weighted_accuracy(y_true, y_pred, weights):
    # Your code here
    pass`,
    solution: `def weighted_accuracy(y_true, y_pred, weights):
    total = 0.0
    correct = 0.0
    for t, p in zip(y_true, y_pred):
        w = weights.get(str(t), weights.get(t, 0.0))
        total += w
        if t == p:
            correct += w
    if total == 0:
        return 0.0
    return correct / total`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 0, 0], { "0": 1, "1": 3 }], expected: 0.625 },
      { input: [[1, 1, 1], [0, 0, 0], { "1": 1 }], expected: 0.0 },
      { input: [[0, 0], [0, 1], { "0": 2 }], expected: 0.5 },
      { input: [[], [], {}], expected: 0.0 },
    ],
    hint: "Weights are looked up by the string form of each true label.",
  },
  {
    id: "ml-111",
    title: "Sample Weight Normalization",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Normalize sample weights so they sum to 1. If the sum is 0, return equal weights 1/n.\n\nEmpty input returns [].",
    starterCode: `def normalize_weights(weights):
    # Your code here
    pass`,
    solution: `def normalize_weights(weights):
    if not weights:
        return []
    total = sum(weights)
    if total == 0:
        return [1.0 / len(weights) for _ in weights]
    return [w / total for w in weights]`,
    testCases: [
      { input: [[1, 1, 2]], expected: [0.25, 0.25, 0.5] },
      { input: [[0, 0, 0]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[2]], expected: [1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Divide each weight by the total, falling back to uniform weights for an all-zero vector.",
  },
  {
    id: "ml-112",
    title: "Log Transform Feature",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Apply the natural logarithm element-wise; inputs are assumed positive.\n\nEmpty input returns [].",
    starterCode: `import math
def log_transform(values):
    # Your code here
    pass`,
    solution: `import math
def log_transform(values):
    return [math.log(v) for v in values]`,
    testCases: [
      { input: [[1, 2.718281828459045, 10]], expected: [0.0, 1.0, 2.302585092994046] },
      { input: [[0.5]], expected: [-0.6931471805599453] },
      { input: [[1, 1]], expected: [0.0, 0.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Use math.log (base e), not log2 or log10.",
  },
  {
    id: "ml-113",
    title: "Lag-1 Difference Feature",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Build the lag-1 difference feature: x_i - x_{i-1} for i >= 1.\n\nReturn [] when there are fewer than two values.",
    starterCode: `def difference_feature(values):
    # Your code here
    pass`,
    solution: `def difference_feature(values):
    return [values[i] - values[i - 1] for i in range(1, len(values))]`,
    testCases: [
      { input: [[1, 3, 6, 10]], expected: [2, 3, 4] },
      { input: [[5]], expected: [] },
      { input: [[2, 2, 2]], expected: [0, 0] },
      { input: [[]], expected: [] },
    ],
    hint: "Each output element is the change from the previous step.",
  },
  {
    id: "ml-114",
    title: "Rank Transform with Average Ties",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Rank values in ascending order, assigning tied values the average of their 1-based positions.\n\nReturn the rank list; empty input returns [].",
    starterCode: `def rank_transform(values):
    # Your code here
    pass`,
    solution: `def rank_transform(values):
    n = len(values)
    if n == 0:
        return []
    order = sorted(range(n), key=lambda i: values[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and values[order[j + 1]] == values[order[i]]:
            j += 1
        avg = (i + 1 + j + 1) / 2.0
        for k in range(i, j + 1):
            ranks[order[k]] = avg
        i = j + 1
    return ranks`,
    testCases: [
      { input: [[3, 1, 2]], expected: [3.0, 1.0, 2.0] },
      { input: [[10, 20, 20, 30]], expected: [1.0, 2.5, 2.5, 4.0] },
      { input: [[5, 5, 5]], expected: [2.0, 2.0, 2.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Sort indices, find runs of equal values, and give each run the mean of its positions.",
  },
  {
    id: "ml-115",
    title: "Winsorize Percentile Bounds",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Winsorize values by clipping them to the [lower, upper] quantiles. Quantiles use linear interpolation between order statistics at position q * (n - 1).\n\nReturn the clipped list; empty input returns [].",
    starterCode: `def winsorize(values, lower, upper):
    # Your code here
    pass`,
    solution: `def winsorize(values, lower, upper):
    if not values:
        return []
    s = sorted(values)
    n = len(s)
    def quantile(q):
        if n == 1:
            return float(s[0])
        pos = q * (n - 1)
        lo = int(pos)
        hi = min(lo + 1, n - 1)
        frac = pos - lo
        return s[lo] * (1 - frac) + s[hi] * frac
    lo_val = quantile(lower)
    hi_val = quantile(upper)
    return [min(max(v, lo_val), hi_val) for v in values]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.1, 0.9], expected: [1.9, 2, 3, 4, 5, 6, 7, 8, 9, 9.1] },
      { input: [[1, 2, 3, 4], 0.0, 1.0], expected: [1, 2, 3, 4] },
      { input: [[5, 5, 5], 0.1, 0.9], expected: [5, 5, 5] },
      { input: [[], 0.1, 0.9], expected: [] },
    ],
    hint: "Find the interpolated quantile values first, then clamp every element into that range.",
  },
  {
    id: "ml-116",
    title: "Multiclass Confusion Matrix",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Build a multiclass confusion matrix: counts[i][j] is the number of samples with true label i and predicted label j.\n\nPairs outside [0, num_classes) are ignored. Empty input returns a num_classes x num_classes matrix of zeros.",
    starterCode: `def multiclass_confusion_matrix(y_true, y_pred, num_classes):
    # Your code here
    pass`,
    solution: `def multiclass_confusion_matrix(y_true, y_pred, num_classes):
    matrix = [[0] * num_classes for _ in range(num_classes)]
    for t, p in zip(y_true, y_pred):
        if 0 <= t < num_classes and 0 <= p < num_classes:
            matrix[t][p] += 1
    return matrix`,
    testCases: [
      { input: [[0, 1, 2, 1, 0], [0, 2, 2, 1, 1], 3], expected: [[1, 1, 0], [0, 1, 1], [0, 0, 1]] },
      { input: [[0, 1, 2], [0, 1, 2], 3], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      { input: [[0, 3], [0, 0], 2], expected: [[1, 0], [0, 0]] },
      { input: [[], [], 2], expected: [[0, 0], [0, 0]] },
    ],
    hint: "Row index is the true class and column index is the predicted class.",
  },
  {
    id: "ml-117",
    title: "Feature Crossing",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Cross two categorical features by concatenating each pair as 'a_b' strings.\n\nReturn the crossed list; empty input returns [].",
    starterCode: `def feature_cross(a, b):
    # Your code here
    pass`,
    solution: `def feature_cross(a, b):
    return [str(x) + "_" + str(y) for x, y in zip(a, b)]`,
    testCases: [
      { input: [["red", "blue"], ["S", "M"]], expected: ["red_S", "blue_M"] },
      { input: [[1, 2], [3, 4]], expected: ["1_3", "2_4"] },
      { input: [["x"], ["y"]], expected: ["x_y"] },
      { input: [[], []], expected: [] },
    ],
    hint: "Convert both values to strings and join them with an underscore.",
  },
  {
    id: "ml-118",
    title: "Cross-Validation Mean Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean cross-validation score across folds: average each fold's scores, then average the fold means (empty folds are ignored).\n\nEmpty input or only empty folds returns 0.0.",
    starterCode: `def cv_mean_score(fold_scores):
    # Your code here
    pass`,
    solution: `def cv_mean_score(fold_scores):
    if not fold_scores:
        return 0.0
    means = [sum(f) / len(f) for f in fold_scores if f]
    if not means:
        return 0.0
    return sum(means) / len(means)`,
    testCases: [
      { input: [[[0.8, 0.9], [1.0], [0.6, 0.7]]], expected: 0.8333333333333334 },
      { input: [[[1, 1], [0, 0]]], expected: 0.5 },
      { input: [[[0.5], []]], expected: 0.5 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Average within folds first so each fold gets equal weight, then average across folds.",
  },
  {
    id: "ml-119",
    title: "Cross-Validation Score Std",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the population standard deviation of per-fold cross-validation scores.\n\nEmpty input or a single score returns 0.0.",
    starterCode: `def cv_score_std(fold_scores):
    # Your code here
    pass`,
    solution: `def cv_score_std(fold_scores):
    n = len(fold_scores)
    if n == 0:
        return 0.0
    mean = sum(fold_scores) / n
    var = sum((s - mean) ** 2 for s in fold_scores) / n
    return var ** 0.5`,
    testCases: [
      { input: [[0.8, 0.9, 1.0]], expected: 0.08164965809277258 },
      { input: [[1, 1, 1]], expected: 0.0 },
      { input: [[0.5]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Use the population variance (divide by n) and take the square root.",
  },
  {
    id: "ml-120",
    title: "Out-of-Bag Indices",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Generate out-of-bag indices for bootstrap rounds. For each round draw n indices with replacement using random.seed(seed) and random.randrange(n); the OOB indices are the sorted indices never drawn that round.\n\nReturn one sorted list per round; n = 0 yields empty lists.",
    starterCode: `import random
def out_of_bag_indices(n, num_rounds, seed):
    # Your code here
    pass`,
    solution: `import random
def out_of_bag_indices(n, num_rounds, seed):
    random.seed(seed)
    result = []
    for _ in range(num_rounds):
        drawn = set()
        for _ in range(n):
            drawn.add(random.randrange(n))
        result.append([i for i in range(n) if i not in drawn])
    return result`,
    testCases: [
      { input: [5, 3, 42], expected: [[3, 4], [2, 3], [2, 4]] },
      { input: [3, 2, 7], expected: [[2], [1]] },
      { input: [4, 1, 0], expected: [[1]] },
      { input: [0, 2, 1], expected: [[], []] },
    ],
    hint: "Track the set of indices drawn in each bootstrap round, then collect the complement.",
  },
  {
    id: "ml-121",
    title: "Learning Curve Gap",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the gap between validation and training error at each learning-curve size: val_error - train_error element-wise.\n\nEmpty input returns [].",
    starterCode: `def learning_curve_gap(train_errors, val_errors):
    # Your code here
    pass`,
    solution: `def learning_curve_gap(train_errors, val_errors):
    return [v - t for t, v in zip(train_errors, val_errors)]`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], [0.6, 0.5, 0.45]], expected: [0.09999999999999998, 0.2, 0.25] },
      { input: [[1, 2], [1, 2]], expected: [0, 0] },
      { input: [[0.9], [0.1]], expected: [-0.8] },
      { input: [[], []], expected: [] },
    ],
    hint: "A shrinking positive gap suggests the model is starting to generalize.",
  },
  {
    id: "ml-122",
    title: "Grid Search Best Params",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Search a parameter grid and return the parameter set with the highest score.\n\nparams_list is a list of parameter dicts and scores holds the parallel scores; ties keep the earliest entry. Empty input returns {}.",
    starterCode: `def grid_search_best(params_list, scores):
    # Your code here
    pass`,
    solution: `def grid_search_best(params_list, scores):
    if not params_list:
        return {}
    best_idx = 0
    for i in range(1, len(params_list)):
        if scores[i] > scores[best_idx]:
            best_idx = i
    return dict(params_list[best_idx])`,
    testCases: [
      { input: [[{ lr: 0.1, depth: 2 }, { lr: 0.01, depth: 3 }, { lr: 0.1, depth: 3 }], [0.8, 0.9, 0.85]], expected: { lr: 0.01, depth: 3 } },
      { input: [[{ a: 1 }, { a: 2 }], [0.7, 0.7]], expected: { a: 1 } },
      { input: [[{ x: "only" }], [0.5]], expected: { x: "only" } },
      { input: [[], []], expected: {} },
    ],
    hint: "Track the best index with a strict greater-than so ties keep the first candidate.",
  },
  {
    id: "ml-123",
    title: "Random Search Picks",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Pick k distinct candidate indices for random search. Call random.seed(seed), shuffle range(n_candidates), and return the first k indices sorted ascending.\n\nReturn [] if k <= 0.",
    starterCode: `import random
def random_search_picks(n_candidates, k, seed):
    # Your code here
    pass`,
    solution: `import random
def random_search_picks(n_candidates, k, seed):
    indices = list(range(n_candidates))
    random.seed(seed)
    random.shuffle(indices)
    return sorted(indices[:k])`,
    testCases: [
      { input: [10, 3, 42], expected: [2, 3, 7] },
      { input: [6, 2, 7], expected: [0, 4] },
      { input: [4, 4, 0], expected: [0, 1, 2, 3] },
      { input: [5, 1, 123], expected: [3] },
    ],
    hint: "Seeded shuffling gives reproducible random subsets without replacement.",
  },
  {
    id: "ml-124",
    title: "Early Stopping Patience",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Determine the epoch where early stopping triggers. Track the best (lowest) validation loss seen; count consecutive epochs without a strict improvement and return the first index where that count reaches patience.\n\nReturn -1 if the run never triggers or the input is empty.",
    starterCode: `def early_stopping_epoch(val_losses, patience):
    # Your code here
    pass`,
    solution: `def early_stopping_epoch(val_losses, patience):
    if not val_losses:
        return -1
    best = val_losses[0]
    bad = 0
    for i in range(1, len(val_losses)):
        if val_losses[i] < best:
            best = val_losses[i]
            bad = 0
        else:
            bad += 1
            if bad >= patience:
                return i
    return -1`,
    testCases: [
      { input: [[1.0, 0.9, 0.85, 0.87, 0.88, 0.89], 2], expected: 4 },
      { input: [[1.0, 0.9, 0.8], 3], expected: -1 },
      { input: [[1.0, 1.0, 1.0], 1], expected: 1 },
      { input: [[], 2], expected: -1 },
    ],
    hint: "Reset the patience counter whenever a new best loss appears.",
  },
  {
    id: "ml-125",
    title: "Class Imbalance Ratio",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the class imbalance ratio: count of the majority class divided by count of the minority class.\n\nA single class gives 1.0; empty input returns 0.0.",
    starterCode: `def imbalance_ratio(labels):
    # Your code here
    pass`,
    solution: `def imbalance_ratio(labels):
    if not labels:
        return 0.0
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    return max(counts.values()) / min(counts.values())`,
    testCases: [
      { input: [["a", "a", "a", "b"]], expected: 3.0 },
      { input: [[1, 1, 2, 2]], expected: 1.0 },
      { input: [[5]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Ratio of the largest class count to the smallest.",
  },
  {
    id: "ml-126",
    title: "Oversampling Indices",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute extra indices needed to oversample every class up to the majority count. Call random.seed(seed) and, for each class in sorted label order, draw random existing indices of that class with random.randrange until the shortfall is filled.\n\nReturn the extra indices sorted ascending; no extras returns [].",
    starterCode: `import random
def oversample_indices(labels, seed):
    # Your code here
    pass`,
    solution: `import random
def oversample_indices(labels, seed):
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    if not counts:
        return []
    max_count = max(counts.values())
    random.seed(seed)
    extra = []
    for l in sorted(counts.keys()):
        pool = [i for i in range(len(labels)) if labels[i] == l]
        need = max_count - counts[l]
        for _ in range(need):
            extra.append(pool[random.randrange(len(pool))])
    return sorted(extra)`,
    testCases: [
      { input: [["a", "a", "b"], 42], expected: [2] },
      { input: [[0, 0, 1, 1, 2], 7], expected: [4] },
      { input: [[0, 1], 0], expected: [] },
      { input: [["x", "x", "x", "y", "y", "z"], 1], expected: [3, 5, 5] },
    ],
    hint: "Duplicate existing minority indices (with replacement) until each class matches the majority count.",
  },
  {
    id: "ml-127",
    title: "Anomaly Bounds by IQR",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute IQR anomaly bounds: [Q1 - k*IQR, Q3 + k*IQR]. Q1 is the median of the lower half and Q3 the median of the upper half (for odd length, exclude the median element).\n\nEmpty input returns [0.0, 0.0].",
    starterCode: `def iqr_bounds(values, k):
    # Returns [lower, upper]
    # Your code here
    pass`,
    solution: `def iqr_bounds(values, k):
    if not values:
        return [0.0, 0.0]
    s = sorted(values)
    m = len(s)
    def median(arr):
        mm = len(arr)
        if mm % 2 == 1:
            return float(arr[mm // 2])
        return (arr[mm // 2 - 1] + arr[mm // 2]) / 2.0
    med = median(s)
    if m % 2 == 1:
        lower_half = s[:m // 2]
        upper_half = s[m // 2 + 1:]
    else:
        lower_half = s[:m // 2]
        upper_half = s[m // 2:]
    q1 = median(lower_half) if lower_half else med
    q3 = median(upper_half) if upper_half else med
    iqr = q3 - q1
    return [q1 - k * iqr, q3 + k * iqr]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], 1.5], expected: [-3.5, 12.5] },
      { input: [[1, 2, 3, 4, 5], 1.5], expected: [-3.0, 9.0] },
      { input: [[7, 7, 7], 1.5], expected: [7.0, 7.0] },
      { input: [[1, 2, 3, 4], 1.5], expected: [-1.5, 6.5] },
      { input: [[], 1.5], expected: [0.0, 0.0] },
    ],
    hint: "The usual k is 1.5; values outside the returned interval are flagged as anomalies.",
  },
  {
    id: "ml-128",
    title: "Train/Validation/Test Sizes",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute train/validation/test sizes for a deterministic split: n_test = int(n * test_fraction), n_val = int(n * val_fraction), and n_train is the remainder.\n\nReturn [n_train, n_val, n_test].",
    starterCode: `def split_sizes(n, val_fraction, test_fraction):
    # Returns [n_train, n_val, n_test]
    # Your code here
    pass`,
    solution: `def split_sizes(n, val_fraction, test_fraction):
    n_test = int(n * test_fraction)
    n_val = int(n * val_fraction)
    n_train = n - n_test - n_val
    return [n_train, n_val, n_test]`,
    testCases: [
      { input: [100, 0.1, 0.2], expected: [70, 10, 20] },
      { input: [10, 0.2, 0.3], expected: [5, 2, 3] },
      { input: [5, 0.0, 0.4], expected: [3, 0, 2] },
      { input: [7, 0.5, 0.5], expected: [1, 3, 3] },
    ],
    hint: "Floor each split size independently and give the remainder to training.",
  },
  {
    id: "ml-129",
    title: "Expanding Window Splits",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Generate expanding-window time series splits. For each t from initial_train to n-1, the training set is range(t) and the test set is [t].\n\nReturn the list of [train_indices, test_indices]; if initial_train is negative or at least n, return [].",
    starterCode: `def expanding_window_splits(n, initial_train):
    # Returns list of [train_indices, test_indices]
    # Your code here
    pass`,
    solution: `def expanding_window_splits(n, initial_train):
    if initial_train < 0 or initial_train >= n:
        return []
    result = []
    for t in range(initial_train, n):
        result.append([list(range(t)), [t]])
    return result`,
    testCases: [
      { input: [5, 3], expected: [[[0, 1, 2], [3]], [[0, 1, 2, 3], [4]]] },
      { input: [4, 1], expected: [[[0], [1]], [[0, 1], [2]], [[0, 1, 2], [3]]] },
      { input: [3, 3], expected: [] },
      { input: [3, 4], expected: [] },
    ],
    hint: "The training window grows by one sample as the test point moves forward.",
  },
  {
    id: "ml-130",
    title: "Mini-Batch Indices",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Generate mini-batch indices: call random.seed(seed), shuffle range(n), and cut the shuffled order into consecutive batches of size batch_size (the last batch may be shorter).\n\nReturn the list of batches; a non-positive batch_size returns [].",
    starterCode: `import random
def mini_batch_indices(n, batch_size, seed):
    # Your code here
    pass`,
    solution: `import random
def mini_batch_indices(n, batch_size, seed):
    if batch_size <= 0:
        return []
    indices = list(range(n))
    random.seed(seed)
    random.shuffle(indices)
    return [indices[i:i + batch_size] for i in range(0, n, batch_size)]`,
    testCases: [
      { input: [5, 2, 42], expected: [[3, 1], [2, 4], [0]] },
      { input: [6, 4, 7], expected: [[4, 0, 5, 3], [1, 2]] },
      { input: [4, 1, 0], expected: [[2], [0], [1], [3]] },
      { input: [3, 5, 1], expected: [[1, 2, 0]] },
    ],
    hint: "Shuffle once, then slice the shuffled order into fixed-size chunks.",
  },
  {
    id: "ml-131",
    title: "Momentum Update Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one momentum update step element-wise: v_new = momentum * v + grad and param_new = param - lr * v_new.\n\nReturn [new_params, new_velocities]; empty vectors return [[], []].",
    starterCode: `def momentum_update(params, grads, velocities, lr, momentum):
    # Returns [new_params, new_velocities]
    # Your code here
    pass`,
    solution: `def momentum_update(params, grads, velocities, lr, momentum):
    new_v = [momentum * velocities[i] + grads[i] for i in range(len(params))]
    new_p = [params[i] - lr * new_v[i] for i in range(len(params))]
    return [new_p, new_v]`,
    testCases: [
      { input: [[1, 2], [0.1, 0.2], [0, 0], 0.1, 0.9], expected: [[0.99, 1.98], [0.1, 0.2]] },
      { input: [[0], [1], [0.5], 0.1, 0.9], expected: [[-0.145], [1.45]] },
      { input: [[1], [-1], [1], 1, 0], expected: [[2], [-1]] },
      { input: [[], [], [], 0.1, 0.9], expected: [[], []] },
    ],
    hint: "Update the velocity first, then apply it to the parameters.",
  },
  {
    id: "ml-132",
    title: "Adam Optimizer Step",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one Adam optimizer step. At step t with gradients g and moment estimates m and v: m = beta1*m + (1-beta1)*g, v = beta2*v + (1-beta2)*g^2, then use bias-corrected m_hat = m/(1-beta1^t), v_hat = v/(1-beta2^t) and update p = p - lr*m_hat/(sqrt(v_hat) + eps).\n\nReturn [new_params, new_m, new_v]; empty vectors return [[], [], []].",
    starterCode: `import math
def adam_step(params, grads, m, v, t, lr, beta1, beta2, eps):
    # Returns [new_params, new_m, new_v]
    # Your code here
    pass`,
    solution: `import math
def adam_step(params, grads, m, v, t, lr, beta1, beta2, eps):
    d = len(params)
    new_m = [beta1 * m[i] + (1 - beta1) * grads[i] for i in range(d)]
    new_v = [beta2 * v[i] + (1 - beta2) * grads[i] * grads[i] for i in range(d)]
    new_p = []
    for i in range(d):
        m_hat = new_m[i] / (1 - beta1 ** t)
        v_hat = new_v[i] / (1 - beta2 ** t)
        new_p.append(params[i] - lr * m_hat / (math.sqrt(v_hat) + eps))
    return [new_p, new_m, new_v]`,
    testCases: [
      { input: [[1.0], [0.1], [0], [0], 1, 0.01, 0.9, 0.999, 1e-08], expected: [[0.9900000009999999], [0.009999999999999998], [1.0000000000000011e-05]] },
      { input: [[1, 2], [0.5, -0.5], [0, 0], [0, 0], 1, 0.1, 0.9, 0.999, 1e-08], expected: [[0.900000002, 2.099999998], [0.04999999999999999, -0.04999999999999999], [0.0002500000000000002, 0.0002500000000000002]] },
      { input: [[1.0], [0.2], [0.1], [0.01], 2, 0.01, 0.9, 0.999, 1e-08], expected: [[0.9974153900445542], [0.11000000000000001], [0.01003]] },
      { input: [[], [], [], [], 1, 0.01, 0.9, 0.999, 1e-08], expected: [[], [], []] },
    ],
    hint: "Update moments, correct for initialization bias, then take the step.",
  },
  {
    id: "ml-133",
    title: "Gradient Clipping",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Clip gradients by global L2 norm. If the norm of the gradient vector exceeds max_norm, scale it down to exactly max_norm; otherwise return it unchanged.\n\nEmpty input returns [].",
    starterCode: `import math
def clip_gradients(grads, max_norm):
    # Your code here
    pass`,
    solution: `import math
def clip_gradients(grads, max_norm):
    if not grads:
        return []
    norm = math.sqrt(sum(g * g for g in grads))
    if norm == 0 or norm <= max_norm:
        return list(grads)
    scale = max_norm / norm
    return [g * scale for g in grads]`,
    testCases: [
      { input: [[3, 4], 5], expected: [3, 4] },
      { input: [[3, 4], 2.5], expected: [1.5, 2.0] },
      { input: [[0, 0], 1], expected: [0, 0] },
      { input: [[6, 8], 5], expected: [3.0, 4.0] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Compute the vector norm once and scale every component by the same factor.",
  },
  {
    id: "ml-134",
    title: "L2 Gradient Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one gradient descent step for ridge regression without an intercept. The gradient is (2/n) * X^T (X w - y) + 2 * lam * w, and the new weights are w - lr * grad.\n\nReturn the updated weight list; empty X returns a copy of w.",
    starterCode: `def l2_gradient_step(X, y, w, lr, lam):
    # Your code here
    pass`,
    solution: `def l2_gradient_step(X, y, w, lr, lam):
    n = len(X)
    d = len(w)
    if n == 0:
        return list(w)
    preds = [sum(X[i][j] * w[j] for j in range(d)) for i in range(n)]
    resid = [preds[i] - y[i] for i in range(n)]
    grad = [2.0 / n * sum(X[i][j] * resid[i] for i in range(n)) + 2.0 * lam * w[j] for j in range(d)]
    return [w[j] - lr * grad[j] for j in range(d)]`,
    testCases: [
      { input: [[[1], [2]], [2, 4], [1], 0.1, 0.1], expected: [1.48] },
      { input: [[[1]], [1], [0], 0.5, 1], expected: [1.0] },
      { input: [[[1], [2]], [2, 4], [2], 0.1, 0], expected: [2.0] },
      { input: [[], [], [1, 2], 0.1, 0.1], expected: [1, 2] },
    ],
    hint: "The L2 penalty adds 2*lam*w to the ordinary least-squares gradient.",
  },
  {
    id: "ml-135",
    title: "Bootstrap Standard Error",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the bootstrap standard error of the mean. Call random.seed(seed) and draw num_samples resamples of size n with replacement (random.randrange), then return the population standard deviation of the resample means.\n\nEmpty data or non-positive num_samples returns 0.0.",
    starterCode: `import random
def bootstrap_standard_error(data, num_samples, seed):
    # Your code here
    pass`,
    solution: `import random
def bootstrap_standard_error(data, num_samples, seed):
    n = len(data)
    if n == 0 or num_samples <= 0:
        return 0.0
    random.seed(seed)
    means = []
    for _ in range(num_samples):
        total = 0.0
        for _ in range(n):
            total += data[random.randrange(n)]
        means.append(total / n)
    mean = sum(means) / len(means)
    var = sum((m - mean) ** 2 for m in means) / len(means)
    return var ** 0.5`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], 200, 42], expected: 0.8154140052758475 },
      { input: [[10, 12, 11, 13, 12], 100, 7], expected: 0.4281074631444773 },
      { input: [[5], 50, 1], expected: 0.0 },
      { input: [[], 10, 0], expected: 0.0 },
    ],
    hint: "Standard error is the standard deviation of the bootstrap distribution of the mean.",
  },
];
