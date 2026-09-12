import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-051",
    title: "Polynomial Design Matrix",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Build the polynomial regression design matrix for a 1D input x and a given degree: each output row is [1, x_i, x_i^2, ..., x_i^degree].\n\nReturn the list of rows; empty x returns [].",
    starterCode: `def polynomial_design_matrix(x, degree):
    # Your code here
    pass`,
    solution: `def polynomial_design_matrix(x, degree):
    result = []
    for xi in x:
        row = [1]
        for p in range(1, degree + 1):
            row.append(xi ** p)
        result.append(row)
    return result`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: [[1, 1, 1], [1, 2, 4], [1, 3, 9]] },
      { input: [[0, 2], 3], expected: [[1, 0, 0, 0], [1, 2, 4, 8]] },
      { input: [[-1, 1], 2], expected: [[1, -1, 1], [1, 1, 1]] },
      { input: [[], 2], expected: [] },
    ],
    hint: "Prepend the bias column of ones, then append powers 1..degree for each value.",
  },
  {
    id: "ml-052",
    title: "Weighted Least Squares",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Fit y = a + b*x by weighted least squares, minimizing sum(w_i * (y_i - a - b*x_i)^2).\n\nWith W = sum(w_i), use the weighted means mx = sum(w_i*x_i)/W and my = sum(w_i*y_i)/W, then b = sum(w_i*(x_i - mx)*(y_i - my)) / sum(w_i*(x_i - mx)^2) and a = my - b*mx. Return [a, b]; if W is 0 or the input is empty return [0.0, 0.0], and if the weighted denominator is 0 return [my, 0.0].",
    starterCode: `def weighted_least_squares(X, y, weights):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def weighted_least_squares(X, y, weights):
    n = len(X)
    if n == 0:
        return [0.0, 0.0]
    W = sum(weights)
    if W == 0:
        return [0.0, 0.0]
    mx = sum(weights[i] * X[i] for i in range(n)) / W
    my = sum(weights[i] * y[i] for i in range(n)) / W
    num = sum(weights[i] * (X[i] - mx) * (y[i] - my) for i in range(n))
    den = sum(weights[i] * (X[i] - mx) ** 2 for i in range(n))
    if den == 0:
        return [my, 0.0]
    b = num / den
    a = my - b * mx
    return [a, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 5, 7, 9, 11], [1, 1, 1, 1, 1]], expected: [1.0, 2.0] },
      { input: [[1, 2, 3], [1, 2, 10], [1, 1, 1]], expected: [-4.666666666666667, 4.5] },
      { input: [[1, 2, 3], [1, 2, 10], [1, 1, 9]], expected: [-5.478260869565219, 5.108695652173914] },
      { input: [[2], [5], [3]], expected: [5.0, 0.0] },
    ],
    hint: "Everything is the simple linear regression formula with each observation scaled by its weight.",
  },
  {
    id: "ml-053",
    title: "Exponential Smoothing",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Apply simple exponential smoothing to a sequence: s_0 = x_0 and s_t = alpha * x_t + (1 - alpha) * s_{t-1}.\n\nReturn the smoothed values as a list; empty input returns [].",
    starterCode: `def exponential_smoothing(values, alpha):
    # Your code here
    pass`,
    solution: `def exponential_smoothing(values, alpha):
    if not values:
        return []
    result = [float(values[0])]
    for i in range(1, len(values)):
        result.append(alpha * values[i] + (1 - alpha) * result[-1])
    return result`,
    testCases: [
      { input: [[1, 2, 3], 0.5], expected: [1.0, 1.5, 2.25] },
      { input: [[10, 20, 30], 1.0], expected: [10.0, 20.0, 30.0] },
      { input: [[5, 5, 5], 0.3], expected: [5.0, 5.0, 5.0] },
      { input: [[4], 0.9], expected: [4.0] },
    ],
    hint: "Each smoothed value blends the current observation with the previous smoothed value.",
  },
  {
    id: "ml-054",
    title: "Moving Average Forecast",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the trailing moving average of values with the given window size: the mean of each contiguous window of length window.\n\nReturn one average per complete window. If window is not positive or there are fewer values than the window, return [].",
    starterCode: `def moving_average(values, window):
    # Your code here
    pass`,
    solution: `def moving_average(values, window):
    n = len(values)
    if window <= 0 or n < window:
        return []
    result = []
    for i in range(n - window + 1):
        result.append(sum(values[i:i + window]) / window)
    return result`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 3.0, 4.0] },
      { input: [[1, 2], 2], expected: [1.5] },
      { input: [[1, 2], 3], expected: [] },
      { input: [[2, 4, 6, 8], 2], expected: [3.0, 5.0, 7.0] },
    ],
    hint: "Slide a fixed-size window and average each slice.",
  },
  {
    id: "ml-055",
    title: "Residuals",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the residuals y_true - y_pred element-wise.\n\nReturn the list of residuals; empty input returns [].",
    starterCode: `def residuals(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def residuals(y_true, y_pred):
    return [t - p for t, p in zip(y_true, y_pred)]`,
    testCases: [
      { input: [[3, 5, 7], [2, 4, 9]], expected: [1, 1, -2] },
      { input: [[1, 2, 3], [1, 2, 3]], expected: [0, 0, 0] },
      { input: [[-1, -2], [1, 2]], expected: [-2, -4] },
      { input: [[], []], expected: [] },
    ],
    hint: "Subtract each prediction from the corresponding true value.",
  },
  {
    id: "ml-056",
    title: "Hat Matrix Leverage",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "For simple linear regression with an intercept, compute the leverage (hat matrix diagonal) of each observation: h_i = 1/n + (x_i - mean_x)^2 / Sxx, where Sxx = sum((x_j - mean_x)^2).\n\nIf Sxx is 0, return 1/n for every point. Empty input returns [].",
    starterCode: `def leverage_values(X):
    # Your code here
    pass`,
    solution: `def leverage_values(X):
    n = len(X)
    if n == 0:
        return []
    mean = sum(X) / n
    sxx = sum((x - mean) ** 2 for x in X)
    if sxx == 0:
        return [1.0 / n for _ in X]
    return [1.0 / n + (x - mean) ** 2 / sxx for x in X]`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [0.7, 0.3, 0.3, 0.7] },
      { input: [[5, 5, 5]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[0, 1]], expected: [1.0, 1.0] },
      { input: [[7]], expected: [1.0] },
    ],
    hint: "Leverage grows with the squared distance of x_i from the mean; all leverages sum to the number of parameters.",
  },
  {
    id: "ml-057",
    title: "Adjusted R-Squared from Predictions",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the adjusted R^2: 1 - (1 - R^2) * (n - 1) / (n - p - 1), where p = n_features is the number of predictors and R^2 = 1 - SS_res/SS_tot (using 1.0 when SS_tot is 0 and SS_res is also 0, else 0.0).\n\nIf n - p - 1 <= 0 or the input is empty, return 0.0.",
    starterCode: `def adjusted_r2(y_true, y_pred, n_features):
    # Your code here
    pass`,
    solution: `def adjusted_r2(y_true, y_pred, n_features):
    n = len(y_true)
    if n == 0:
        return 0.0
    mean = sum(y_true) / n
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    ss_tot = sum((t - mean) ** 2 for t in y_true)
    if ss_tot == 0:
        r2 = 1.0 if ss_res == 0 else 0.0
    else:
        r2 = 1.0 - ss_res / ss_tot
    denom = n - n_features - 1
    if denom <= 0:
        return 0.0
    return 1.0 - (1.0 - r2) * (n - 1) / denom`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3], 1], expected: 1.0 },
      { input: [[1, 2, 3], [2, 2, 2], 1], expected: -1.0 },
      { input: [[1, 2, 3], [2, 2, 2], 0], expected: 0.0 },
      { input: [[1, 2, 3, 4], [1, 2, 3, 5], 1], expected: 0.7000000000000001 },
    ],
    hint: "Penalize R^2 by the ratio of residual degrees of freedom to total degrees of freedom.",
  },
  {
    id: "ml-058",
    title: "AIC and BIC",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Akaike and Bayesian information criteria for a linear model: AIC = n*ln(RSS/n) + 2k and BIC = n*ln(RSS/n) + k*ln(n), where k is the number of parameters.\n\nClip RSS to at least 1e-12 before taking the log. Return [aic, bic]; n <= 0 returns [0.0, 0.0].",
    starterCode: `import math
def aic_bic(n, rss, k):
    # Returns [aic, bic]
    # Your code here
    pass`,
    solution: `import math
def aic_bic(n, rss, k):
    if n <= 0:
        return [0.0, 0.0]
    rss = max(rss, 1e-12)
    aic = n * math.log(rss / n) + 2 * k
    bic = n * math.log(rss / n) + k * math.log(n)
    return [aic, bic]`,
    testCases: [
      { input: [10, 2, 3], expected: [-10.094379124341003, -9.186623845358866] },
      { input: [100, 50, 2], expected: [-65.31471805599453, -60.104377684018345] },
      { input: [5, 0, 1], expected: [-144.20229514181324, -144.59285722937915] },
      { input: [0, 1, 1], expected: [0.0, 0.0] },
    ],
    hint: "Both criteria reward fit through ln(RSS/n); BIC punishes parameters more heavily via ln(n).",
  },
  {
    id: "ml-059",
    title: "Correlation Feature Selection",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Select the feature most correlated with y by absolute Pearson correlation.\n\nReturn the index of the feature with the largest |corr|, breaking ties by the smallest index; a constant feature or constant y gives correlation 0.0. Empty X returns -1.",
    starterCode: `def select_feature_by_correlation(X, y):
    # Your code here
    pass`,
    solution: `def select_feature_by_correlation(X, y):
    if not X:
        return -1
    n = len(X)
    d = len(X[0])
    my = sum(y) / n
    sy = sum((yy - my) ** 2 for yy in y)
    best_idx = 0
    best_corr = -1.0
    for j in range(d):
        col = [row[j] for row in X]
        mx = sum(col) / n
        sxx = sum((x - mx) ** 2 for x in col)
        sxy = sum((col[i] - mx) * (y[i] - my) for i in range(n))
        if sxx == 0 or sy == 0:
            corr = 0.0
        else:
            corr = abs(sxy / (sxx ** 0.5 * sy ** 0.5))
        if corr > best_corr + 1e-12:
            best_corr = corr
            best_idx = j
    return best_idx`,
    testCases: [
      { input: [[[1, 10], [2, 9], [3, 8], [4, 7]], [2, 4, 6, 8]], expected: 0 },
      { input: [[[1, 1], [2, 3], [3, 2], [4, 5]], [1, 2, 3, 4]], expected: 0 },
      { input: [[[2, 2], [2, 2]], [1, 2]], expected: 0 },
      { input: [[], []], expected: -1 },
    ],
    hint: "Pearson correlation is the covariance of the column and y divided by the product of their standard deviations.",
  },
  {
    id: "ml-060",
    title: "Variance Threshold",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the indices of features whose population variance (divide by n) is strictly greater than threshold.\n\nEmpty input returns [].",
    starterCode: `def variance_threshold(X, threshold):
    # Your code here
    pass`,
    solution: `def variance_threshold(X, threshold):
    if not X:
        return []
    n = len(X)
    d = len(X[0])
    kept = []
    for j in range(d):
        col = [row[j] for row in X]
        mean = sum(col) / n
        var = sum((v - mean) ** 2 for v in col) / n
        if var > threshold:
            kept.append(j)
    return kept`,
    testCases: [
      { input: [[[1, 1], [2, 1], [3, 1]], 0.1], expected: [0] },
      { input: [[[0, 1, 5], [2, 1, 5], [4, 1, 6]], 0.5], expected: [0] },
      { input: [[[1, 2], [3, 4]], 10], expected: [] },
      { input: [[], 0], expected: [] },
    ],
    hint: "Compute each column's variance and keep columns above the threshold.",
  },
  {
    id: "ml-061",
    title: "Chi-Square Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the chi-square statistic of association between two categorical label lists. Build the contingency table over the values that appear and sum (observed - expected)^2 / expected for cells with expected > 0, where expected = row_total * col_total / n.\n\nEmpty input returns 0.0.",
    starterCode: `def chi_square_score(a, b):
    # Your code here
    pass`,
    solution: `def chi_square_score(a, b):
    n = len(a)
    if n == 0:
        return 0.0
    vals_a = sorted(set(a))
    vals_b = sorted(set(b))
    score = 0.0
    for va in vals_a:
        row = sum(1 for i in range(n) if a[i] == va)
        for vb in vals_b:
            observed = sum(1 for i in range(n) if a[i] == va and b[i] == vb)
            col = sum(1 for i in range(n) if b[i] == vb)
            expected = row * col / n
            if expected > 0:
                score += (observed - expected) ** 2 / expected
    return score`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 4.0 },
      { input: [[0, 1, 0, 1], [0, 0, 1, 1]], expected: 0.0 },
      { input: [[0, 0, 0, 1, 1, 1], [0, 0, 1, 1, 1, 1]], expected: 3.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Cells where row_total or col_total is 0 are skipped because their expected count is 0.",
  },
  {
    id: "ml-062",
    title: "Mutual Information (Discrete)",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the mutual information in bits between two discrete label lists: sum p(x, y) * log2(p(x, y) / (p(x) * p(y))) over all observed pairs with p(x, y) > 0.\n\nEmpty input returns 0.0.",
    starterCode: `import math
def mutual_information(a, b):
    # Your code here
    pass`,
    solution: `import math
def mutual_information(a, b):
    n = len(a)
    if n == 0:
        return 0.0
    values_a = sorted(set(a))
    values_b = sorted(set(b))
    mi = 0.0
    for va in values_a:
        pa = sum(1 for x in a if x == va) / n
        for vb in values_b:
            pb = sum(1 for x in b if x == vb) / n
            pab = sum(1 for i in range(n) if a[i] == va and b[i] == vb) / n
            if pab > 0:
                mi += pab * math.log2(pab / (pa * pb))
    return mi`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 0, 1], [0, 0, 1, 1]], expected: 0.0 },
      { input: [[0, 0, 1, 1], [0, 1, 1, 1]], expected: 0.31127812445913283 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "MI is zero when the joint distribution factorizes into the product of the marginals.",
  },
  {
    id: "ml-063",
    title: "One-vs-Rest Prediction",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "One-vs-rest prediction: for each row of per-class classifier scores, return the index of the largest score.\n\nTies go to the smallest index. Empty input returns [].",
    starterCode: `def ovr_predict(scores):
    # Your code here
    pass`,
    solution: `def ovr_predict(scores):
    result = []
    for row in scores:
        best = 0
        for j in range(1, len(row)):
            if row[j] > row[best]:
                best = j
        result.append(best)
    return result`,
    testCases: [
      { input: [[[0.2, 0.7, 0.1], [0.9, 0.05, 0.05]]], expected: [1, 0] },
      { input: [[[1, 1, 1]]], expected: [0] },
      { input: [[[-1, -2]]], expected: [0] },
      { input: [[[-3, -1, -2]]], expected: [1] },
    ],
    hint: "Use a strict greater-than comparison so ties keep the earlier class.",
  },
  {
    id: "ml-064",
    title: "Softmax of Logits",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the softmax of a list of logits: exp(z_i - max(z)) / sum(exp(z_j - max(z))).\n\nReturn the probability list; empty input returns [].",
    starterCode: `import math
def softmax(logits):
    # Your code here
    pass`,
    solution: `import math
def softmax(logits):
    if not logits:
        return []
    m = max(logits)
    exps = [math.exp(z - m) for z in logits]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1, 1, 1]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[0, 1]], expected: [0.2689414213699951, 0.7310585786300049] },
      { input: [[1000, 1000]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
    ],
    hint: "Subtract the maximum logit first to avoid overflow, then normalize.",
  },
  {
    id: "ml-065",
    title: "Temperature Scaling",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Apply temperature scaling to logits: return the probabilities softmax(logits / temperature).\n\nIf logits is empty or temperature <= 0, return [].",
    starterCode: `import math
def temperature_scaled_softmax(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_scaled_softmax(logits, temperature):
    if not logits or temperature <= 0:
        return []
    scaled = [z / temperature for z in logits]
    m = max(scaled)
    exps = [math.exp(s - m) for s in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[2, 0], 0.5], expected: [0.9820137900379085, 0.017986209962091555] },
      { input: [[2, 0], 10], expected: [0.549833997312478, 0.4501660026875221] },
      { input: [[1, 1], 5], expected: [0.5, 0.5] },
      { input: [[2, 0], 1], expected: [0.8807970779778823, 0.11920292202211755] },
    ],
    hint: "Divide every logit by the temperature before applying a numerically stable softmax.",
  },
  {
    id: "ml-066",
    title: "Top-K Accuracy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute top-k accuracy: the fraction of samples whose true label appears among the k classes with the highest predicted probability.\n\nTies in probability are ordered by the smallest class index. If k is at least the number of classes, every sample counts as correct. Empty input returns 0.0.",
    starterCode: `def top_k_accuracy(y_true, y_pred_probs, k):
    # Your code here
    pass`,
    solution: `def top_k_accuracy(y_true, y_pred_probs, k):
    n = len(y_true)
    if n == 0:
        return 0.0
    correct = 0
    for i in range(n):
        row = y_pred_probs[i]
        order = sorted(range(len(row)), key=lambda j: (-row[j], j))
        if y_true[i] in order[:k]:
            correct += 1
    return correct / n`,
    testCases: [
      { input: [[0, 1, 2], [[0.7, 0.2, 0.1], [0.1, 0.6, 0.3], [0.2, 0.3, 0.5]], 1], expected: 1.0 },
      { input: [[2, 0], [[0.5, 0.4, 0.1], [0.6, 0.3, 0.1]], 2], expected: 0.5 },
      { input: [[2, 0], [[0.5, 0.4, 0.1], [0.6, 0.3, 0.1]], 3], expected: 1.0 },
      { input: [[1], [[0.5, 0.5, 0.0]], 1], expected: 0.0 },
    ],
    hint: "Sort classes by (-probability, index) and check the first k entries.",
  },
  {
    id: "ml-067",
    title: "Balanced Accuracy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute balanced accuracy: the unweighted mean of recall over the classes present in y_true.\n\nFor each class, recall = TP / (TP + FN) counting that class as positive against all others. Empty input returns 0.0.",
    starterCode: `def balanced_accuracy(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def balanced_accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    classes = sorted(set(y_true))
    recalls = []
    for c in classes:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == c and p == c)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == c and p != c)
        recalls.append(tp / (tp + fn) if (tp + fn) > 0 else 0.0)
    return sum(recalls) / len(recalls)`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 0, 0, 0]], expected: 0.75 },
      { input: [[1, 0, 1, 0], [1, 0, 1, 0]], expected: 1.0 },
      { input: [[0, 1, 2, 2], [0, 1, 1, 2]], expected: 0.8333333333333334 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "It is macro recall: average the per-class recalls equally, regardless of support.",
  },
  {
    id: "ml-068",
    title: "Weighted F1 Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the support-weighted F1 score over the classes present in y_true.\n\nFor each class compute F1 = 2*p*r/(p+r) using 0.0 when a denominator is zero, weight it by support_c / n, and sum the contributions. Empty input returns 0.0.",
    starterCode: `def weighted_f1(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def weighted_f1(y_true, y_pred):
    if not y_true:
        return 0.0
    n = len(y_true)
    classes = sorted(set(y_true))
    total = 0.0
    for c in classes:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == c and p == c)
        fp = sum(1 for t, p in zip(y_true, y_pred) if t != c and p == c)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == c and p != c)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
        support = sum(1 for t in y_true if t == c)
        total += support / n * f1
    return total`,
    testCases: [
      { input: [[0, 0, 0, 1], [0, 0, 1, 1]], expected: 0.7666666666666667 },
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[0, 1, 2, 0, 1, 2], [0, 1, 2, 0, 1, 2]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Weight each class F1 by its share of the true labels rather than averaging equally.",
  },
  {
    id: "ml-069",
    title: "Matthews Correlation Coefficient",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Matthews correlation coefficient for binary labels with positive class 1: (TP*TN - FP*FN) / sqrt((TP+FP)*(TP+FN)*(TN+FP)*(TN+FN)).\n\nReturn 0.0 when the denominator is zero. Empty input returns 0.0.",
    starterCode: `import math
def matthews_corrcoef(y_true, y_pred):
    # Your code here
    pass`,
    solution: `import math
def matthews_corrcoef(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    denom = (tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)
    if denom == 0:
        return 0.0
    return (tp * tn - fp * fn) / math.sqrt(denom)`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[1, 1, 0, 0], [0, 0, 1, 1]], expected: -1.0 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 0.0 },
      { input: [[1, 0, 1, 0, 1], [1, 1, 0, 1, 0]], expected: -0.6666666666666666 },
    ],
    hint: "The numerator compares correct and incorrect counts; +1 means perfect agreement and -1 total disagreement.",
  },
  {
    id: "ml-070",
    title: "Cohen's Kappa",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute Cohen's kappa: (p_o - p_e) / (1 - p_e), where p_o is the observed agreement and p_e = sum over the union of labels of (true_count_c / n) * (pred_count_c / n).\n\nIf p_e == 1.0 or the input is empty, return 0.0.",
    starterCode: `def cohens_kappa(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def cohens_kappa(y_true, y_pred):
    n = len(y_true)
    if n == 0:
        return 0.0
    p_o = sum(1 for t, p in zip(y_true, y_pred) if t == p) / n
    classes = sorted(set(y_true) | set(y_pred))
    p_e = 0.0
    for c in classes:
        ct = sum(1 for t in y_true if t == c)
        cp = sum(1 for p in y_pred if p == c)
        p_e += (ct / n) * (cp / n)
    if p_e == 1.0:
        return 0.0
    return (p_o - p_e) / (1.0 - p_e)`,
    testCases: [
      { input: [[1, 1, 0, 0], [1, 1, 0, 0]], expected: 1.0 },
      { input: [[1, 1, 0, 0], [1, 0, 1, 0]], expected: 0.0 },
      { input: [[1, 1, 1, 0], [1, 1, 0, 1]], expected: -0.3333333333333333 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
    ],
    hint: "Kappa measures agreement above the agreement expected by chance.",
  },
  {
    id: "ml-071",
    title: "Brier Score",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Brier score for binary probability predictions: (1/n) * sum((p_i - y_i)^2).\n\nEmpty input returns 0.0.",
    starterCode: `def brier_score(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def brier_score(y_true, y_pred):
    if not y_true:
        return 0.0
    return sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true)`,
    testCases: [
      { input: [[1, 0, 1, 0], [0.9, 0.1, 0.8, 0.2]], expected: 0.024999999999999994 },
      { input: [[1, 1], [0.5, 0.5]], expected: 0.25 },
      { input: [[0, 0], [0.0, 1.0]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "It is the mean squared error between predicted probabilities and 0/1 labels.",
  },
  {
    id: "ml-072",
    title: "Calibration Bins",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Bin probability predictions and report calibration statistics.\n\nThe bin index is min(int(p * num_bins), num_bins - 1); for each bin return [count, mean predicted probability, mean true label], using [0, 0.0, 0.0] for empty bins. Empty input returns num_bins empty bins.",
    starterCode: `def calibration_bins(y_true, probs, num_bins):
    # Your code here
    pass`,
    solution: `def calibration_bins(y_true, probs, num_bins):
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
    result = []
    for b in range(num_bins):
        if counts[b] == 0:
            result.append([0, 0.0, 0.0])
        else:
            result.append([counts[b], sum_p[b] / counts[b], sum_y[b] / counts[b]])
    return result`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.05, 0.15, 0.85, 0.95], 2], expected: [[2, 0.1, 0.0], [2, 0.8999999999999999, 1.0]] },
      { input: [[1, 1, 0], [0.1, 0.9, 0.5], 3], expected: [[1, 0.1, 1.0], [1, 0.5, 0.0], [1, 0.9, 1.0]] },
      { input: [[1, 0], [0.2, 0.8], 5], expected: [[0, 0.0, 0.0], [1, 0.2, 1.0], [0, 0.0, 0.0], [0, 0.0, 0.0], [1, 0.8, 0.0]] },
      { input: [[], [], 3], expected: [[0, 0.0, 0.0], [0, 0.0, 0.0], [0, 0.0, 0.0]] },
    ],
    hint: "Accumulate count, probability sum, and label sum per bin, then divide by the count.",
  },
  {
    id: "ml-073",
    title: "ROC Curve Points",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute ROC curve points for binary labels. Start at [0.0, 0.0] (threshold above every score), then for each unique score in descending order predict positive when score >= threshold and append [FPR, TPR].\n\nIf there are no positive or no negative labels, the corresponding rate is 0.0. Empty input returns [].",
    starterCode: `def roc_curve_points(y_true, scores):
    # Your code here
    pass`,
    solution: `def roc_curve_points(y_true, scores):
    n = len(y_true)
    if n == 0:
        return []
    P = sum(1 for t in y_true if t == 1)
    N = n - P
    points = [[0.0, 0.0]]
    for thr in sorted(set(scores), reverse=True):
        preds = [1 if s >= thr else 0 for s in scores]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        fp = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 1)
        tpr = tp / P if P > 0 else 0.0
        fpr = fp / N if N > 0 else 0.0
        points.append([fpr, tpr])
    return points`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]], expected: [[0.0, 0.0], [0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [1.0, 1.0]] },
      { input: [[1, 1, 0, 0], [0.9, 0.8, 0.4, 0.1]], expected: [[0.0, 0.0], [0.0, 0.5], [0.0, 1.0], [0.5, 1.0], [1.0, 1.0]] },
      { input: [[1, 1], [0.5, 0.5]], expected: [[0.0, 0.0], [0.0, 1.0]] },
      { input: [[], []], expected: [] },
    ],
    hint: "Sweep the unique scores from high to low and track cumulative TP and FP fractions.",
  },
  {
    id: "ml-074",
    title: "AUC by Trapezoid",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the area under a curve given its points using the trapezoidal rule: sum over consecutive segments of (x1 - x0) * (y0 + y1) / 2.\n\nReturn 0.0 if there are fewer than two points.",
    starterCode: `def auc_trapezoid(roc_points):
    # Your code here
    pass`,
    solution: `def auc_trapezoid(roc_points):
    if len(roc_points) < 2:
        return 0.0
    area = 0.0
    for i in range(len(roc_points) - 1):
        x0, y0 = roc_points[i]
        x1, y1 = roc_points[i + 1]
        area += (x1 - x0) * (y0 + y1) / 2.0
    return area`,
    testCases: [
      { input: [[[0, 0], [0, 1], [1, 1]]], expected: 1.0 },
      { input: [[[0, 0], [1, 1]]], expected: 0.5 },
      { input: [[[0, 0], [0.5, 0.5], [1, 1]]], expected: 0.5 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Add the area of a trapezoid for every pair of neighboring points.",
  },
  {
    id: "ml-075",
    title: "Precision-Recall Curve Points",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute precision-recall curve points. For each unique score in descending order, predict positive when score >= threshold and append [precision, recall]; precision is 0.0 when nothing is predicted positive.\n\nIf there are no positive labels, recall is 0.0. Empty input returns [].",
    starterCode: `def pr_curve_points(y_true, scores):
    # Your code here
    pass`,
    solution: `def pr_curve_points(y_true, scores):
    n = len(y_true)
    if n == 0:
        return []
    P = sum(1 for t in y_true if t == 1)
    points = []
    for thr in sorted(set(scores), reverse=True):
        preds = [1 if s >= thr else 0 for s in scores]
        tp = sum(1 for t, p in zip(y_true, preds) if t == 1 and p == 1)
        fp = sum(1 for t, p in zip(y_true, preds) if t == 0 and p == 1)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / P if P > 0 else 0.0
        points.append([prec, rec])
    return points`,
    testCases: [
      { input: [[0, 0, 1, 1], [0.1, 0.4, 0.35, 0.8]], expected: [[1.0, 0.5], [0.5, 0.5], [0.6666666666666666, 1.0], [0.5, 1.0]] },
      { input: [[1, 1, 0, 1], [0.9, 0.8, 0.7, 0.6]], expected: [[1.0, 0.3333333333333333], [1.0, 0.6666666666666666], [0.6666666666666666, 0.6666666666666666], [0.75, 1.0]] },
      { input: [[1, 1], [0.5, 0.5]], expected: [[1.0, 1.0]] },
      { input: [[], []], expected: [] },
    ],
    hint: "For each threshold, precision = TP/(TP+FP) and recall = TP/P over the whole dataset.",
  },
  {
    id: "ml-076",
    title: "Average Precision",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute average precision from precision-recall points.\n\nFor each distinct recall value keep the largest precision, then integrate over increasing recall: AP = sum of (recall - prev_recall) * precision. Empty input returns 0.0.",
    starterCode: `def average_precision(pr_points):
    # Your code here
    pass`,
    solution: `def average_precision(pr_points):
    if not pr_points:
        return 0.0
    best = {}
    for p, r in pr_points:
        if r not in best or p > best[r]:
            best[r] = p
    ap = 0.0
    prev_r = 0.0
    for r in sorted(best.keys()):
        ap += (r - prev_r) * best[r]
        prev_r = r
    return ap`,
    testCases: [
      { input: [[[1.0, 0.5], [0.5, 0.5], [0.6666666666666666, 1.0], [0.5, 1.0]]], expected: 0.8333333333333333 },
      { input: [[[1.0, 1.0]]], expected: 1.0 },
      { input: [[[0.5, 0.5], [0.6666666666666666, 0.6666666666666666], [0.75, 1.0]]], expected: 0.611111111111111 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Collapse duplicate recalls to their best precision, then accumulate precision times the recall increase.",
  },
  {
    id: "ml-077",
    title: "Multiclass Log Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute multiclass log loss: -(1/n) * sum(log(p_i[true_i])) over samples, clipping each predicted probability to at least 1e-15.\n\nEmpty input returns 0.0.",
    starterCode: `import math
def multiclass_log_loss(y_true, probs):
    # Your code here
    pass`,
    solution: `import math
def multiclass_log_loss(y_true, probs):
    if not y_true:
        return 0.0
    total = 0.0
    for t, row in zip(y_true, probs):
        p = min(max(row[t], 1e-15), 1.0)
        total -= math.log(p)
    return total / len(y_true)`,
    testCases: [
      { input: [[0, 1, 2], [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]], expected: 0.0 },
      { input: [[0, 1, 2], [[0.3333333333333333, 0.3333333333333333, 0.3333333333333333], [0.3333333333333333, 0.3333333333333333, 0.3333333333333333], [0.3333333333333333, 0.3333333333333333, 0.3333333333333333]]], expected: 1.0986122886681098 },
      { input: [[0, 1], [[0.0, 1.0], [0.4, 0.6]]], expected: 17.524801009338336 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Only the predicted probability of the true class matters for each sample.",
  },
  {
    id: "ml-078",
    title: "Hinge Loss",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the mean hinge loss for labels in {-1, +1}: (1/n) * sum(max(0, 1 - y_i * score_i)).\n\nEmpty input returns 0.0.",
    starterCode: `def hinge_loss(y_true, scores):
    # Your code here
    pass`,
    solution: `def hinge_loss(y_true, scores):
    if not y_true:
        return 0.0
    return sum(max(0.0, 1.0 - t * s) for t, s in zip(y_true, scores)) / len(y_true)`,
    testCases: [
      { input: [[1, -1], [0.5, 0.5]], expected: 1.0 },
      { input: [[1, 1], [2, 3]], expected: 0.0 },
      { input: [[1, -1], [-1, -2]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "A sample is penalized only when its margin y*score is less than one.",
  },
  {
    id: "ml-079",
    title: "Huber Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean Huber loss with parameter delta. For residual r = y - pred use 0.5*r^2 when |r| <= delta, otherwise delta*(|r| - 0.5*delta).\n\nEmpty input returns 0.0.",
    starterCode: `def huber_loss(y_true, y_pred, delta):
    # Your code here
    pass`,
    solution: `def huber_loss(y_true, y_pred, delta):
    if not y_true:
        return 0.0
    total = 0.0
    for t, p in zip(y_true, y_pred):
        r = t - p
        if abs(r) <= delta:
            total += 0.5 * r * r
        else:
            total += delta * (abs(r) - 0.5 * delta)
    return total / len(y_true)`,
    testCases: [
      { input: [[1, 2], [1, 2], 1], expected: 0.0 },
      { input: [[0], [3], 1], expected: 2.5 },
      { input: [[0, 0], [0.5, 3], 2], expected: 2.0625 },
      { input: [[], [], 1], expected: 0.0 },
    ],
    hint: "Quadratic for small residuals, linear beyond delta so outliers do not dominate.",
  },
  {
    id: "ml-080",
    title: "Quantile Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean quantile (pinball) loss for quantile q: q*r when r >= 0 and (1 - q)*(-r) otherwise, where r = y - pred.\n\nEmpty input returns 0.0.",
    starterCode: `def quantile_loss(y_true, y_pred, q):
    # Your code here
    pass`,
    solution: `def quantile_loss(y_true, y_pred, q):
    if not y_true:
        return 0.0
    total = 0.0
    for t, p in zip(y_true, y_pred):
        r = t - p
        if r >= 0:
            total += q * r
        else:
            total += (1.0 - q) * (-r)
    return total / len(y_true)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1.5, 1.5, 1.5, 1.5], 0.5], expected: 0.625 },
      { input: [[1, 2, 3, 4], [1.5, 1.5, 1.5, 1.5], 0.9], expected: 1.025 },
      { input: [[2, 4], [1, 1], 0.25], expected: 0.5 },
      { input: [[], [], 0.5], expected: 0.0 },
    ],
    hint: "Over-predictions and under-predictions are penalized with different weights q and 1-q.",
  },
  {
    id: "ml-081",
    title: "Elastic Net Objective",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the elastic net objective for linear regression without an intercept: (1/(2n)) * ||Xw - y||^2 + alpha * l1_ratio * sum(|w_j|) + alpha * (1 - l1_ratio) / 2 * sum(w_j^2).\n\nEmpty X returns 0.0.",
    starterCode: `def elastic_net_objective(X, y, w, alpha, l1_ratio):
    # Your code here
    pass`,
    solution: `def elastic_net_objective(X, y, w, alpha, l1_ratio):
    n = len(X)
    if n == 0:
        return 0.0
    rss = 0.0
    for i in range(n):
        pred = sum(X[i][j] * w[j] for j in range(len(w)))
        rss += (pred - y[i]) ** 2
    l1 = sum(abs(wi) for wi in w)
    l2 = sum(wi * wi for wi in w)
    return rss / (2.0 * n) + alpha * l1_ratio * l1 + alpha * (1.0 - l1_ratio) * 0.5 * l2`,
    testCases: [
      { input: [[[1], [2]], [2, 4], [2], 0.1, 0.5], expected: 0.2 },
      { input: [[[1], [2]], [1, 2], [0], 0.1, 0.5], expected: 1.25 },
      { input: [[[1, 0], [0, 1]], [1, 1], [1, -1], 0.2, 0.5], expected: 1.3 },
      { input: [[], [], [1], 0.1, 0.5], expected: 0.0 },
    ],
    hint: "l1_ratio blends the L1 and L2 penalties; the first term is the mean squared error over 2.",
  },
  {
    id: "ml-082",
    title: "L1 Soft Thresholding",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Apply the L1 soft-thresholding operator element-wise: sign(v) * max(|v| - lam, 0).\n\nReturn the transformed list; empty input returns [].",
    starterCode: `def soft_threshold(values, lam):
    # Your code here
    pass`,
    solution: `def soft_threshold(values, lam):
    result = []
    for v in values:
        if v > lam:
            result.append(v - lam)
        elif v < -lam:
            result.append(v + lam)
        else:
            result.append(0.0)
    return result`,
    testCases: [
      { input: [[3, -2, 0.5], 1], expected: [2, -1, 0.0] },
      { input: [[1], 2], expected: [0.0] },
      { input: [[-5, 5], 0], expected: [-5, 5] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Shrink values toward zero by lam and clamp anything inside [-lam, lam] to zero.",
  },
  {
    id: "ml-083",
    title: "Gradient Descent Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one gradient descent step for linear regression with intercept. With predictions pred_i = w0 + w1*x_i and residuals r_i = pred_i - y_i, the gradients are (2/n)*sum(r_i) for w0 and (2/n)*sum(r_i*x_i) for w1.\n\nReturn [w0 - lr*grad0, w1 - lr*grad1]; empty X returns [w0, w1].",
    starterCode: `def gd_step_linear(X, y, w0, w1, lr):
    # Returns [new_w0, new_w1]
    # Your code here
    pass`,
    solution: `def gd_step_linear(X, y, w0, w1, lr):
    n = len(X)
    if n == 0:
        return [w0, w1]
    preds = [w0 + w1 * x for x in X]
    resid = [preds[i] - y[i] for i in range(n)]
    grad0 = 2.0 / n * sum(resid)
    grad1 = 2.0 / n * sum(resid[i] * X[i] for i in range(n))
    return [w0 - lr * grad0, w1 - lr * grad1]`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6], 0, 0, 0.1], expected: [0.8, 1.8666666666666665] },
      { input: [[1, 2, 3], [2, 4, 6], 1, 2, 0.1], expected: [0.8, 1.6] },
      { input: [[0], [1], 1, 0, 0.5], expected: [1.0, 0.0] },
      { input: [[], [], 3, 4, 0.1], expected: [3, 4] },
    ],
    hint: "Compute residuals once, then use them for both the intercept and slope gradients.",
  },
  {
    id: "ml-084",
    title: "Feature Interaction Product",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Build an interaction feature by multiplying two feature lists element-wise: a_i * b_i.\n\nReturn the product list; empty input returns [].",
    starterCode: `def interaction_feature(a, b):
    # Your code here
    pass`,
    solution: `def interaction_feature(a, b):
    return [x * y for x, y in zip(a, b)]`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [4, 10, 18] },
      { input: [[-1, 0, 2], [3, -2, 4]], expected: [-3, 0, 8] },
      { input: [[1.5, 2.5], [2, 4]], expected: [3.0, 10.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "Multiply the values pairwise.",
  },
  {
    id: "ml-085",
    title: "Quadratic Features",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Build degree-2 polynomial features for a single variable: each row is [x_i, x_i^2].\n\nReturn the list of rows; empty input returns [].",
    starterCode: `def quadratic_features(x):
    # Your code here
    pass`,
    solution: `def quadratic_features(x):
    return [[xi, xi * xi] for xi in x]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [[1, 1], [2, 4], [3, 9]] },
      { input: [[-2, 0, 2]], expected: [[-2, 4], [0, 0], [2, 4]] },
      { input: [[0.5]], expected: [[0.5, 0.25]] },
      { input: [[]], expected: [] },
    ],
    hint: "Emit the original value and its square for each input.",
  },
  {
    id: "ml-086",
    title: "Binning Continuous Features",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Bin continuous values given sorted interior edges: the bin index of v is the number of edges that are <= v.\n\nReturn the list of indices; empty values returns [].",
    starterCode: `def bin_values(values, edges):
    # Your code here
    pass`,
    solution: `def bin_values(values, edges):
    result = []
    for v in values:
        idx = 0
        for e in edges:
            if v >= e:
                idx += 1
        result.append(idx)
    return result`,
    testCases: [
      { input: [[0, 1, 2, 3, 4], [1, 3]], expected: [0, 1, 1, 2, 2] },
      { input: [[5], [1, 2, 3]], expected: [3] },
      { input: [[-1, 0, 0.5], [0.0, 0.5]], expected: [0, 1, 2] },
      { input: [[], [1]], expected: [] },
    ],
    hint: "Count how many edges are less than or equal to the value.",
  },
  {
    id: "ml-087",
    title: "Target Encoding with Smoothing",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Target-encode categories with additive smoothing: encoding(c) = (sum of targets in c + m * prior) / (count_c + m), where prior is the global target mean and m is the smoothing strength.\n\nReturn a dict mapping str(category) to encoding. Empty input returns {}.",
    starterCode: `def target_encode(categories, targets, smoothing):
    # Your code here
    pass`,
    solution: `def target_encode(categories, targets, smoothing):
    n = len(categories)
    if n == 0:
        return {}
    prior = sum(targets) / n
    totals = {}
    counts = {}
    for c, t in zip(categories, targets):
        totals[c] = totals.get(c, 0.0) + t
        counts[c] = counts.get(c, 0) + 1
    return {str(c): (totals[c] + smoothing * prior) / (counts[c] + smoothing) for c in totals}`,
    testCases: [
      { input: [["a", "a", "b", "b", "b"], [1, 0, 1, 1, 0], 2], expected: { a: 0.55, b: 0.64 } },
      { input: [["a", "a", "b", "b", "b"], [1, 0, 1, 1, 0], 0], expected: { a: 0.5, b: 0.6666666666666666 } },
      { input: [["x"], [2], 1], expected: { x: 2.0 } },
      { input: [[], [], 1], expected: {} },
    ],
    hint: "Smoothing pulls rare categories toward the global mean; keys are stringified labels.",
  },
  {
    id: "ml-088",
    title: "Frequency Encoding",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Frequency-encode categories by their occurrence count.\n\nReturn a dict mapping str(category) to its count. Empty input returns {}.",
    starterCode: `def frequency_encode(categories):
    # Your code here
    pass`,
    solution: `def frequency_encode(categories):
    counts = {}
    for c in categories:
        counts[c] = counts.get(c, 0) + 1
    return {str(c): counts[c] for c in counts}`,
    testCases: [
      { input: [["a", "b", "a", "c", "a"]], expected: { a: 3, b: 1, c: 1 } },
      { input: [[1, 1, 1]], expected: { "1": 3 } },
      { input: [["x", "y", "x"]], expected: { x: 2, y: 1 } },
      { input: [[]], expected: {} },
    ],
    hint: "Count each distinct category and stringify the keys.",
  },
  {
    id: "ml-089",
    title: "Hashing Trick Bucket",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute a deterministic hash bucket for a string key using h = (h * 31 + ord(ch)) mod num_buckets over the characters.\n\nReturn the bucket index; a non-positive num_buckets returns 0.",
    starterCode: `def hash_bucket(key, num_buckets):
    # Your code here
    pass`,
    solution: `def hash_bucket(key, num_buckets):
    if num_buckets <= 0:
        return 0
    h = 0
    for ch in key:
        h = (h * 31 + ord(ch)) % num_buckets
    return h`,
    testCases: [
      { input: ["cat", 10], expected: 2 },
      { input: ["dog", 10], expected: 4 },
      { input: ["", 5], expected: 0 },
      { input: ["apple", 7], expected: 1 },
    ],
    hint: "Fold each character code into the running hash with multiplication by 31.",
  },
  {
    id: "ml-090",
    title: "Mahalanobis Distance in 2D",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the Mahalanobis distance in 2D: sqrt(d^T * inv_cov * d), where d = x - mean and inv_cov is the 2x2 inverse covariance matrix.\n\nReturn 0.0 if the quadratic form is non-positive.",
    starterCode: `import math
def mahalanobis_distance_2d(x, mean, inv_cov):
    # Your code here
    pass`,
    solution: `import math
def mahalanobis_distance_2d(x, mean, inv_cov):
    d0 = x[0] - mean[0]
    d1 = x[1] - mean[1]
    quad = d0 * (inv_cov[0][0] * d0 + inv_cov[0][1] * d1) + d1 * (inv_cov[1][0] * d0 + inv_cov[1][1] * d1)
    if quad <= 0:
        return 0.0
    return math.sqrt(quad)`,
    testCases: [
      { input: [[3, 4], [0, 0], [[1, 0], [0, 1]]], expected: 5.0 },
      { input: [[1, 1], [0, 0], [[2, 0], [0, 2]]], expected: 2.0 },
      { input: [[1, -1], [0, 0], [[1, -0.5], [-0.5, 1]]], expected: 1.7320508075688772 },
      { input: [[2, 3], [2, 3], [[1, 0], [0, 1]]], expected: 0.0 },
    ],
    hint: "Expand d^T * inv_cov * d as a quadratic form in d0 and d1.",
  },
];
