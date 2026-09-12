import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-011",
    title: "2D Linear Regression via Normal Equation",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Fit y = w1*x1 + w2*x2 (no intercept) by solving the 2x2 normal equation (X^T X) w = X^T y, where X is a list of [x1, x2] rows.\n\nReturn [w1, w2] using Cramer's rule. If the determinant of X^T X is 0 (within 1e-12), return [0.0, 0.0]. Empty X also returns [0.0, 0.0].",
    starterCode: `def fit_2d_normal_equation(X, y):
    # Returns [w1, w2]
    # Your code here
    pass`,
    solution: `def fit_2d_normal_equation(X, y):
    if not X:
        return [0.0, 0.0]
    s11 = sum(x[0] * x[0] for x in X)
    s12 = sum(x[0] * x[1] for x in X)
    s22 = sum(x[1] * x[1] for x in X)
    t1 = sum(x[0] * yy for x, yy in zip(X, y))
    t2 = sum(x[1] * yy for x, yy in zip(X, y))
    det = s11 * s22 - s12 * s12
    if abs(det) < 1e-12:
        return [0.0, 0.0]
    w1 = (t1 * s22 - s12 * t2) / det
    w2 = (s11 * t2 - s12 * t1) / det
    return [w1, w2]`,
    testCases: [
      { input: [[[1, 0], [0, 1], [1, 1]], [1, 2, 3]], expected: [1.0, 2.0] },
      { input: [[[1, 2], [2, 1], [3, 3]], [5, 4, 9]], expected: [1.0, 2.0] },
      { input: [[[2, 0], [0, 2], [1, 1]], [4, 2, 3]], expected: [2.0, 1.0] },
      { input: [[[1, 1], [2, 2], [3, 3]], [1, 2, 3]], expected: [0.0, 0.0] },
    ],
    hint: "Build s11, s12, s22 from X and t1, t2 from X^T y, then solve the 2x2 system with Cramer's rule.",
  },
  {
    id: "ml-012",
    title: "MSE Gradient",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the gradient of the mean squared error J(w) = (1/n) * sum((x_i . w - y_i)^2) with respect to the weight vector w.\n\ngrad = (2/n) * X^T (X w - y). X is a list of feature rows and w is a weight vector of the same dimension. Return the gradient as a list; empty X returns a zero vector of length len(w).",
    starterCode: `def mse_gradient(X, y, w):
    # Returns the gradient as a list
    # Your code here
    pass`,
    solution: `def mse_gradient(X, y, w):
    n = len(X)
    if n == 0:
        return [0.0] * len(w)
    preds = [sum(x[j] * w[j] for j in range(len(w))) for x in X]
    resid = [preds[i] - y[i] for i in range(n)]
    d = len(w)
    grad = [0.0] * d
    for j in range(d):
        grad[j] = 2.0 / n * sum(X[i][j] * resid[i] for i in range(n))
    return grad`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 1], [0, 0]], expected: [-1.0, -1.0] },
      { input: [[[1], [2], [3]], [2, 4, 6], [1]], expected: [-9.333333333333332] },
      { input: [[[1], [2]], [2, 4], [2]], expected: [0.0] },
      { input: [[[1, 2], [3, 4]], [1, 2], [0.5, -0.5]], expected: [-9.0, -13.0] },
    ],
    hint: "Compute residuals Xw - y first, then multiply residuals by the columns of X.",
  },
  {
    id: "ml-013",
    title: "Ridge Regression Closed Form",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Fit a ridge regression with one feature and an intercept: minimize sum((y_i - a - b*x_i)^2) + alpha * b^2.\n\nThe closed form is b = Sxy / (Sxx + alpha) and a = mean_y - b * mean_x, where Sxy = sum((x_i - mean_x) * (y_i - mean_y)) and Sxx = sum((x_i - mean_x)^2). Return [a, b]; empty input returns [0.0, 0.0].",
    starterCode: `def ridge_regression_fit(X, y, alpha):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def ridge_regression_fit(X, y, alpha):
    n = len(X)
    if n == 0:
        return [0.0, 0.0]
    mx = sum(X) / n
    my = sum(y) / n
    sxx = sum((x - mx) ** 2 for x in X)
    sxy = sum((x - mx) * (yy - my) for x, yy in zip(X, y))
    den = sxx + alpha
    b = sxy / den if den != 0 else 0.0
    a = my - b * mx
    return [a, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 5, 7, 9, 11], 1], expected: [1.5454545454545459, 1.8181818181818181] },
      { input: [[1, 2, 3, 4, 5], [3, 5, 7, 9, 11], 0], expected: [1.0, 2.0] },
      { input: [[1, 2, 3], [2, 4, 6], 3], expected: [2.4, 0.8] },
      { input: [[2, 2, 2], [3, 4, 5], 1], expected: [4.0, 0.0] },
    ],
    hint: "Ridge adds alpha to the slope denominator only; the intercept still passes through (mean_x, mean_y) minus the penalty.",
  },
  {
    id: "ml-014",
    title: "Binary Cross-Entropy Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the binary cross-entropy loss: -(1/n) * sum(y_i * log(p_i) + (1 - y_i) * log(1 - p_i)).\n\nClip every predicted probability to [1e-15, 1 - 1e-15] before taking the log. Empty input returns 0.0.",
    starterCode: `import math
def binary_cross_entropy(y_true, y_pred):
    # Your code here
    pass`,
    solution: `import math
def binary_cross_entropy(y_true, y_pred):
    if not y_true:
        return 0.0
    total = 0.0
    for t, p in zip(y_true, y_pred):
        p = min(max(p, 1e-15), 1.0 - 1e-15)
        total -= t * math.log(p) + (1 - t) * math.log(1 - p)
    return total / len(y_true)`,
    testCases: [
      { input: [[1, 0, 1, 1], [0.9, 0.1, 0.8, 0.7]], expected: 0.19763488164214868 },
      { input: [[1, 1, 0, 0], [0.5, 0.5, 0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[1, 0], [0.0, 1.0]], expected: 34.53917619362578 },
      { input: [[1, 0, 1], [0.6, 0.6, 0.6]], expected: 0.6459806598020454 },
    ],
    hint: "Clamp p before logging; the loss is the negative average log-likelihood of the true labels.",
  },
  {
    id: "ml-015",
    title: "Macro F1 Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute macro-averaged F1 across the classes present in y_true.\n\nFor each class compute precision, recall, and F1 = 2*p*r/(p+r), using 0.0 whenever a denominator is zero. Return the unweighted mean of the per-class F1 values. Empty input returns 0.0.",
    starterCode: `def macro_f1(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def macro_f1(y_true, y_pred):
    if not y_true:
        return 0.0
    classes = sorted(set(y_true))
    scores = []
    for c in classes:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == c and p == c)
        fp = sum(1 for t, p in zip(y_true, y_pred) if t != c and p == c)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == c and p != c)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
        scores.append(f1)
    return sum(scores) / len(scores)`,
    testCases: [
      { input: [[0, 1, 2, 0, 1, 2], [0, 1, 2, 0, 1, 2]], expected: 1.0 },
      { input: [[0, 0, 1, 1, 2, 2], [0, 1, 1, 2, 2, 0]], expected: 0.5 },
      { input: [[0, 1, 0, 1], [1, 0, 1, 0]], expected: 0.0 },
      { input: [[0, 0, 0], [0, 0, 1]], expected: 0.8 },
    ],
    hint: "Treat each class as positive versus the rest, then average the F1 scores equally.",
  },
  {
    id: "ml-016",
    title: "Confusion Matrix Counts",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the four counts of a binary confusion matrix for positive label 1.\n\nReturn [TP, FP, FN, TN], where TP has true=1 and pred=1, FP has true=0 and pred=1, FN has true=1 and pred=0, and TN has true=0 and pred=0.",
    starterCode: `def confusion_matrix_counts(y_true, y_pred):
    # Returns [TP, FP, FN, TN]
    # Your code here
    pass`,
    solution: `def confusion_matrix_counts(y_true, y_pred):
    tp = 0
    fp = 0
    fn = 0
    tn = 0
    for t, p in zip(y_true, y_pred):
        if t == 1 and p == 1:
            tp += 1
        elif t == 0 and p == 1:
            fp += 1
        elif t == 1 and p == 0:
            fn += 1
        else:
            tn += 1
    return [tp, fp, fn, tn]`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [1, 0, 1, 0, 0]], expected: [2, 0, 1, 2] },
      { input: [[1, 1, 1], [1, 1, 1]], expected: [3, 0, 0, 0] },
      { input: [[1, 1, 1], [0, 0, 0]], expected: [0, 0, 3, 0] },
      { input: [[0, 0, 0, 1], [1, 0, 1, 1]], expected: [1, 2, 0, 1] },
    ],
    hint: "Walk through the pairs once and bucket each into one of the four quadrants.",
  },
  {
    id: "ml-017",
    title: "Mean Squared Error",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the mean squared error: MSE = (1/n) * sum((y_true_i - y_pred_i)^2).\n\nEmpty input returns 0.0.",
    starterCode: `def mean_squared_error(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def mean_squared_error(y_true, y_pred):
    if not y_true:
        return 0.0
    return sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, 2, 3], [1, 2, 5]], expected: 1.3333333333333333 },
      { input: [[0, 0], [3, 4]], expected: 12.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Average the squared residuals.",
  },
  {
    id: "ml-018",
    title: "Mean Absolute Error",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the mean absolute error: MAE = (1/n) * sum(|y_true_i - y_pred_i|).\n\nEmpty input returns 0.0.",
    starterCode: `def mean_absolute_error(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def mean_absolute_error(y_true, y_pred):
    if not y_true:
        return 0.0
    return sum(abs(t - p) for t, p in zip(y_true, y_pred)) / len(y_true)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 2, 3, 4]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 4, 1]], expected: 1.6666666666666667 },
      { input: [[-1, -2], [1, 2]], expected: 3.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Average the absolute residuals.",
  },
  {
    id: "ml-019",
    title: "Root Mean Squared Error",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the root mean squared error: RMSE = sqrt((1/n) * sum((y_true_i - y_pred_i)^2)).\n\nEmpty input returns 0.0.",
    starterCode: `import math
def root_mean_squared_error(y_true, y_pred):
    # Your code here
    pass`,
    solution: `import math
def root_mean_squared_error(y_true, y_pred):
    if not y_true:
        return 0.0
    mse = sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true)
    return math.sqrt(mse)`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.0 },
      { input: [[0, 0], [3, 4]], expected: 3.5355339059327378 },
      { input: [[2, 4, 6], [1, 2, 3]], expected: 2.160246899469287 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Take the square root of the MSE.",
  },
  {
    id: "ml-020",
    title: "R-Squared Score",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the coefficient of determination R^2 = 1 - SS_res / SS_tot, where SS_res = sum((y_i - pred_i)^2) and SS_tot = sum((y_i - mean_y)^2).\n\nIf SS_tot is 0, return 1.0 when SS_res is also 0 and 0.0 otherwise. Empty input returns 0.0.",
    starterCode: `def r2_score(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def r2_score(y_true, y_pred):
    if not y_true:
        return 0.0
    mean = sum(y_true) / len(y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    ss_tot = sum((t - mean) ** 2 for t in y_true)
    if ss_tot == 0:
        return 1.0 if ss_res == 0 else 0.0
    return 1.0 - ss_res / ss_tot`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 1.0 },
      { input: [[1, 2, 3], [2, 2, 2]], expected: 0.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -3.0 },
      { input: [[5, 5, 5], [5, 5, 6]], expected: 0.0 },
    ],
    hint: "Compare the residual sum of squares to the variance of y_true.",
  },
  {
    id: "ml-021",
    title: "Deterministic Train/Test Split",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Split the ordered indices 0..n-1 into train and test sets without shuffling.\n\nn_test = int(n * test_fraction) (floor) indices go to the test set at the end, and the rest go to train. Return [train_indices, test_indices] in ascending order.",
    starterCode: `def train_test_split_ordered(n, test_fraction):
    # Returns [train_indices, test_indices]
    # Your code here
    pass`,
    solution: `def train_test_split_ordered(n, test_fraction):
    n_test = int(n * test_fraction)
    n_train = n - n_test
    return [list(range(n_train)), list(range(n_train, n))]`,
    testCases: [
      { input: [10, 0.2], expected: [[0, 1, 2, 3, 4, 5, 6, 7], [8, 9]] },
      { input: [5, 0.5], expected: [[0, 1, 2], [3, 4]] },
      { input: [7, 0.3], expected: [[0, 1, 2, 3, 4], [5, 6]] },
      { input: [4, 0.0], expected: [[0, 1, 2, 3], []] },
    ],
    hint: "Compute the test size with int(), then slice the index range.",
  },
  {
    id: "ml-022",
    title: "Shuffled Train/Test Split",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Split indices 0..n-1 after a seeded shuffle. Call random.seed(seed), shuffle the index list, then assign the first n_test = int(n * test_fraction) shuffled indices to the test set and the remainder to train.\n\nReturn [train_indices, test_indices], both sorted in ascending order.",
    starterCode: `import random
def shuffled_split_indices(n, test_fraction, seed):
    # Returns [train_indices, test_indices]
    # Your code here
    pass`,
    solution: `import random
def shuffled_split_indices(n, test_fraction, seed):
    indices = list(range(n))
    random.seed(seed)
    random.shuffle(indices)
    n_test = int(n * test_fraction)
    return [sorted(indices[n_test:]), sorted(indices[:n_test])]`,
    testCases: [
      { input: [10, 0.3, 42], expected: [[0, 1, 4, 5, 6, 8, 9], [2, 3, 7]] },
      { input: [8, 0.25, 7], expected: [[0, 1, 2, 3, 4, 5], [6, 7]] },
      { input: [6, 0.5, 0], expected: [[0, 3, 5], [1, 2, 4]] },
      { input: [5, 0.4, 123], expected: [[0, 2, 4], [1, 3]] },
    ],
    hint: "Seed first, shuffle in place, then slice with n_test and sort each side.",
  },
  {
    id: "ml-023",
    title: "Standardization (Z-Score)",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Standardize values to zero mean and unit variance using the population variance (divide by n): z_i = (x_i - mean) / std.\n\nIf the variance is 0, return a list of zeros. Empty input returns [].",
    starterCode: `def standardize(values):
    # Your code here
    pass`,
    solution: `def standardize(values):
    n = len(values)
    if n == 0:
        return []
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    if var == 0:
        return [0.0 for _ in values]
    std = var ** 0.5
    return [(v - mean) / std for v in values]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
      { input: [[0, 0, 10, 10]], expected: [-1.0, -1.0, 1.0, 1.0] },
      { input: [[5, 5, 5]], expected: [0.0, 0.0, 0.0] },
      { input: [[]], expected: [] },
    ],
    hint: "The population standard deviation divides the squared deviations by n, not n-1.",
  },
  {
    id: "ml-024",
    title: "Min-Max Scaling",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Scale values to the [0, 1] range: (x_i - min) / (max - min).\n\nIf all values are equal (max == min), return a list of zeros. Empty input returns [].",
    starterCode: `def min_max_scale(values):
    # Your code here
    pass`,
    solution: `def min_max_scale(values):
    if not values:
        return []
    lo = min(values)
    hi = max(values)
    if hi == lo:
        return [0.0 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [0.0, 0.25, 0.5, 0.75, 1.0] },
      { input: [[5, 5, 5]], expected: [0.0, 0.0, 0.0] },
      { input: [[-1, 0, 1]], expected: [0.0, 0.5, 1.0] },
      { input: [[10, 0, 5]], expected: [1.0, 0.0, 0.5] },
    ],
    hint: "Subtract the minimum, then divide by the range.",
  },
  {
    id: "ml-025",
    title: "Robust Scaling",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Scale values robustly: (x_i - median) / IQR, where IQR = Q3 - Q1. Q1 is the median of the lower half of the sorted values and Q3 is the median of the upper half; for an odd count, exclude the median element itself from both halves.\n\nIf the IQR is 0, return a list of zeros. Empty input returns [].",
    starterCode: `def robust_scale(values):
    # Your code here
    pass`,
    solution: `def robust_scale(values):
    if not values:
        return []
    def median(arr):
        s = sorted(arr)
        m = len(s)
        if m % 2 == 1:
            return float(s[m // 2])
        return (s[m // 2 - 1] + s[m // 2]) / 2.0
    med = median(values)
    s = sorted(values)
    m = len(s)
    if m % 2 == 1:
        lower = s[:m // 2]
        upper = s[m // 2 + 1:]
    else:
        lower = s[:m // 2]
        upper = s[m // 2:]
    q1 = median(lower) if lower else med
    q3 = median(upper) if upper else med
    iqr = q3 - q1
    if iqr == 0:
        return [0.0 for _ in values]
    return [(v - med) / iqr for v in values]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: [-0.875, -0.625, -0.375, -0.125, 0.125, 0.375, 0.625, 0.875] },
      { input: [[1, 2, 3, 4, 5]], expected: [-0.6666666666666666, -0.3333333333333333, 0.0, 0.3333333333333333, 0.6666666666666666] },
      { input: [[7, 7, 7]], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 2, 3, 4]], expected: [-0.75, -0.25, 0.25, 0.75] },
    ],
    hint: "Median-center, then divide by the interquartile range.",
  },
  {
    id: "ml-026",
    title: "One-Hot Encoding",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "One-hot encode integer labels into rows of length num_classes, setting row[label] = 1.\n\nA label outside [0, num_classes) produces an all-zero row. Empty input returns [].",
    starterCode: `def one_hot_encode(labels, num_classes):
    # Your code here
    pass`,
    solution: `def one_hot_encode(labels, num_classes):
    result = []
    for label in labels:
        row = [0] * num_classes
        if 0 <= label < num_classes:
            row[label] = 1
        result.append(row)
    return result`,
    testCases: [
      { input: [[0, 2, 1], 3], expected: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] },
      { input: [[1, 1, 0], 2], expected: [[0, 1], [0, 1], [1, 0]] },
      { input: [[2, 0], 4], expected: [[0, 0, 1, 0], [1, 0, 0, 0]] },
      { input: [[], 3], expected: [] },
    ],
    hint: "Build a zero row, flip one position, and append it.",
  },
  {
    id: "ml-027",
    title: "Label Encoding",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Encode labels as integers 0, 1, 2, ... in order of first appearance.\n\nReturn the encoded list; empty input returns [].",
    starterCode: `def label_encode(labels):
    # Your code here
    pass`,
    solution: `def label_encode(labels):
    mapping = {}
    result = []
    for label in labels:
        if label not in mapping:
            mapping[label] = len(mapping)
        result.append(mapping[label])
    return result`,
    testCases: [
      { input: [["cat", "dog", "cat", "bird"]], expected: [0, 1, 0, 2] },
      { input: [[3, 1, 3, 2, 1]], expected: [0, 1, 0, 2, 1] },
      { input: [[5, 5, 5]], expected: [0, 0, 0] },
      { input: [[]], expected: [] },
    ],
    hint: "Assign the next integer whenever you see an unseen label.",
  },
  {
    id: "ml-028",
    title: "KNN Regression",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict a value for x_test as the mean of the target values of its k nearest neighbors in X_train, using Euclidean distance.\n\nIf k exceeds the number of training points, use all of them. Empty training data returns 0.0.",
    starterCode: `def knn_regression(X_train, y_train, x_test, k):
    # Your code here
    pass`,
    solution: `def knn_regression(X_train, y_train, x_test, k):
    distances = []
    for i, x in enumerate(X_train):
        d = sum((a - b) ** 2 for a, b in zip(x, x_test))
        distances.append((d, y_train[i]))
    distances.sort(key=lambda t: t[0])
    k = min(k, len(distances))
    if k == 0:
        return 0.0
    return sum(distances[i][1] for i in range(k)) / k`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], [0, 1, 10, 11], [1, 0], 2], expected: 0.5 },
      { input: [[[1], [2], [3], [10]], [2, 4, 6, 20], [4], 3], expected: 4.0 },
      { input: [[[0, 0], [1, 1], [2, 2]], [0, 2, 4], [0, 0], 5], expected: 2.0 },
      { input: [[[5, 5], [6, 5]], [10, 16], [4, 4], 1], expected: 10.0 },
    ],
    hint: "Sort by squared distance, take the first k targets, and average them.",
  },
  {
    id: "ml-029",
    title: "Euclidean Distance",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Euclidean distance between two vectors: sqrt(sum((a_i - b_i)^2)).\n\nEmpty vectors return 0.0.",
    starterCode: `import math
def euclidean_distance(a, b):
    # Your code here
    pass`,
    solution: `import math
def euclidean_distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))`,
    testCases: [
      { input: [[3, 4], [0, 0]], expected: 5.0 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 5.196152422706632 },
      { input: [[-1, -1], [2, 3]], expected: 5.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Sum the squared coordinate differences, then take the square root.",
  },
  {
    id: "ml-030",
    title: "Manhattan Distance",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Manhattan (city-block) distance between two vectors: sum(|a_i - b_i|).\n\nEmpty vectors return 0.",
    starterCode: `def manhattan_distance(a, b):
    # Your code here
    pass`,
    solution: `def manhattan_distance(a, b):
    return sum(abs(x - y) for x, y in zip(a, b))`,
    testCases: [
      { input: [[3, 4], [0, 0]], expected: 7 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 9 },
      { input: [[-1, -1], [2, 3]], expected: 7 },
      { input: [[5], [5]], expected: 0 },
    ],
    hint: "Sum the absolute coordinate differences.",
  },
  {
    id: "ml-031",
    title: "Minkowski Distance",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Minkowski distance of order p >= 1: (sum(|a_i - b_i|^p))^(1/p).\n\np = 1 gives Manhattan distance and p = 2 gives Euclidean distance. Empty vectors return 0.0.",
    starterCode: `def minkowski_distance(a, b, p):
    # Your code here
    pass`,
    solution: `def minkowski_distance(a, b, p):
    if not a:
        return 0.0
    return sum(abs(x - y) ** p for x, y in zip(a, b)) ** (1.0 / p)`,
    testCases: [
      { input: [[0, 0], [3, 4], 2], expected: 5.0 },
      { input: [[2, 2], [5, 6], 1], expected: 7.0 },
      { input: [[1, 2], [4, 6], 3], expected: 4.497941445275415 },
      { input: [[1, 2, 3], [1, 2, 3], 5], expected: 0.0 },
    ],
    hint: "Raise coordinate differences to p, sum, then take the p-th root.",
  },
  {
    id: "ml-032",
    title: "K-Means Assignment Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Assignment step of k-means: assign each point to the index of its nearest centroid by Euclidean distance (comparing squared distances is equivalent).\n\nReturn one cluster index per point; ties go to the smallest centroid index.",
    starterCode: `def kmeans_assign(points, centroids):
    # Your code here
    pass`,
    solution: `def kmeans_assign(points, centroids):
    assignments = []
    for p in points:
        best = 0
        best_d = None
        for i, c in enumerate(centroids):
            d = sum((p[j] - c[j]) ** 2 for j in range(len(p)))
            if best_d is None or d < best_d:
                best_d = d
                best = i
        assignments.append(best)
    return assignments`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], [[0, 0], [10, 10]]], expected: [0, 0, 1, 1] },
      { input: [[[1, 1], [8, 8], [9, 10]], [[0, 0], [5, 5], [10, 10]]], expected: [0, 2, 2] },
      { input: [[[3, 3]], [[0, 0], [10, 10]]], expected: [0] },
      { input: [[[1, 1], [2, 2]], [[2, 2], [1, 1]]], expected: [1, 0] },
    ],
    hint: "Use strict less-than when updating the best centroid so ties keep the smallest index.",
  },
  {
    id: "ml-033",
    title: "K-Means Centroid Update",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Centroid update step of k-means: average the points assigned to each of k clusters.\n\nIf a cluster has no assigned points, keep old_centroids[i] unchanged. Return the list of k new centroids.",
    starterCode: `def kmeans_update_centroids(points, assignments, k, old_centroids):
    # Your code here
    pass`,
    solution: `def kmeans_update_centroids(points, assignments, k, old_centroids):
    dim = len(points[0]) if points else (len(old_centroids[0]) if old_centroids else 0)
    new_centroids = []
    for i in range(k):
        group = [p for p, a in zip(points, assignments) if a == i]
        if group:
            new_centroids.append([sum(p[j] for p in group) / len(group) for j in range(dim)])
        else:
            new_centroids.append(list(old_centroids[i]))
    return new_centroids`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], [0, 0, 1, 1], 2, [[0, 0], [10, 10]]], expected: [[0.0, 0.5], [10.0, 10.5]] },
      { input: [[[1, 1], [8, 8], [9, 10]], [0, 1, 1], 2, [[0, 0], [5, 5]]], expected: [[1.0, 1.0], [8.5, 9.0]] },
      { input: [[[2, 2], [4, 4]], [0, 0], 3, [[0, 0], [5, 5], [9, 9]]], expected: [[3.0, 3.0], [5, 5], [9, 9]] },
      { input: [[[1], [3], [10]], [0, 1, 1], 2, [[0], [0]]], expected: [[1.0], [6.5]] },
    ],
    hint: "Group by assignment, average each group coordinate-wise, and copy old centroids for empty clusters.",
  },
  {
    id: "ml-034",
    title: "K-Means Inertia",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute k-means inertia: the sum over all points of the squared Euclidean distance to the nearest centroid.\n\nEmpty points return 0.0.",
    starterCode: `def kmeans_inertia(points, centroids):
    # Your code here
    pass`,
    solution: `def kmeans_inertia(points, centroids):
    total = 0.0
    for p in points:
        best_d = None
        for c in centroids:
            d = sum((p[j] - c[j]) ** 2 for j in range(len(p)))
            if best_d is None or d < best_d:
                best_d = d
        total += best_d
    return total`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10]], [[0, 0.5], [10, 10]]], expected: 0.5 },
      { input: [[[1, 1], [2, 2], [10, 10]], [[1.5, 1.5], [10, 10]]], expected: 1.0 },
      { input: [[[5, 5]], [[0, 0], [5, 5]]], expected: 0.0 },
      { input: [[], [[0, 0]]], expected: 0.0 },
    ],
    hint: "For each point add the smallest squared distance over all centroids.",
  },
  {
    id: "ml-035",
    title: "Information Gain",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the information gain (base 2) of a split of labels into left_idx and right_idx.\n\nIG = H(parent) - (n_left/n) * H(left) - (n_right/n) * H(right), where H is Shannon entropy and an empty child has entropy 0. Empty labels return 0.0.",
    starterCode: `import math
def information_gain(labels, left_idx, right_idx):
    # Your code here
    pass`,
    solution: `import math
def information_gain(labels, left_idx, right_idx):
    def ent(items):
        if not items:
            return 0.0
        counts = {}
        for l in items:
            counts[l] = counts.get(l, 0) + 1
        h = 0.0
        for c in counts.values():
            p = c / len(items)
            h -= p * math.log2(p)
        return h
    n = len(labels)
    if n == 0:
        return 0.0
    left = [labels[i] for i in left_idx]
    right = [labels[i] for i in right_idx]
    return ent(labels) - (len(left) / n) * ent(left) - (len(right) / n) * ent(right)`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 1], [2, 3]], expected: 1.0 },
      { input: [[0, 0, 0, 1], [0, 1, 2], [3]], expected: 0.8112781244591328 },
      { input: [[0, 1, 0, 1], [0, 2], [1, 3]], expected: 1.0 },
      { input: [[0, 1, 2, 3], [0, 1], [2, 3]], expected: 1.0 },
    ],
    hint: "Weight each child's entropy by its share of the samples and subtract from the parent entropy.",
  },
  {
    id: "ml-036",
    title: "Majority Class",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the most frequent label in labels, breaking ties by choosing the smallest label. Empty input returns None.",
    starterCode: `def majority_class(labels):
    # Your code here
    pass`,
    solution: `def majority_class(labels):
    if not labels:
        return None
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    best = None
    best_count = -1
    for l in sorted(counts.keys()):
        if counts[l] > best_count:
            best_count = counts[l]
            best = l
    return best`,
    testCases: [
      { input: [[1, 1, 0, 0, 1]], expected: 1 },
      { input: [["b", "a", "b", "a"]], expected: "a" },
      { input: [[3]], expected: 3 },
      { input: [[]], expected: null },
    ],
    hint: "Count labels, iterate keys in sorted order, and keep the count leader.",
  },
  {
    id: "ml-037",
    title: "Gaussian Naive Bayes Likelihood",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the Gaussian (normal) probability density at x for the given mean and variance: (1 / sqrt(2*pi*variance)) * exp(-(x - mean)^2 / (2*variance)).\n\nIf variance <= 0, return 1.0 when x == mean and 0.0 otherwise.",
    starterCode: `import math
def gaussian_likelihood(x, mean, variance):
    # Your code here
    pass`,
    solution: `import math
def gaussian_likelihood(x, mean, variance):
    if variance <= 0:
        return 1.0 if x == mean else 0.0
    coeff = 1.0 / math.sqrt(2.0 * math.pi * variance)
    return coeff * math.exp(-((x - mean) ** 2) / (2.0 * variance))`,
    testCases: [
      { input: [0, 0, 1], expected: 0.3989422804014327 },
      { input: [2, 2, 4], expected: 0.19947114020071635 },
      { input: [1, 0, 0], expected: 0.0 },
      { input: [0.5, 0, 0], expected: 0.0 },
    ],
    hint: "Normalization constant times the exponential of the negative squared z-score over 2.",
  },
  {
    id: "ml-038",
    title: "Naive Bayes Predict",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Predict a class with Gaussian naive Bayes for a single point x.\n\nclasses, priors, means, and variances are parallel per-class lists; means[ci][j] and variances[ci][j] are the mean and variance of feature j for class ci. Score each class as log(prior) plus the sum of log Gaussian densities, then return the class with the highest score, breaking ties by the earlier entry in classes.",
    starterCode: `import math
def naive_bayes_predict(x, classes, priors, means, variances):
    # Your code here
    pass`,
    solution: `import math
def naive_bayes_predict(x, classes, priors, means, variances):
    best_class = None
    best_score = None
    for ci in range(len(classes)):
        score = math.log(priors[ci]) if priors[ci] > 0 else float("-inf")
        for j in range(len(x)):
            var = variances[ci][j]
            mu = means[ci][j]
            if var <= 0:
                if x[j] != mu:
                    score = float("-inf")
            else:
                score += -0.5 * math.log(2.0 * math.pi * var) - ((x[j] - mu) ** 2) / (2.0 * var)
        if best_score is None or score > best_score:
            best_score = score
            best_class = classes[ci]
    return best_class`,
    testCases: [
      { input: [[5.1, 3.5], ["A", "B"], [0.5, 0.5], [[5.0, 3.4], [6.0, 2.8]], [[0.04, 0.09], [0.25, 0.16]]], expected: "A" },
      { input: [[6.2, 3.0], ["A", "B"], [0.5, 0.5], [[5.0, 3.4], [6.0, 2.8]], [[0.04, 0.09], [0.25, 0.16]]], expected: "B" },
      { input: [[5.0, 3.4], ["A", "B"], [0.8, 0.2], [[5.0, 3.4], [6.0, 2.8]], [[1.0, 1.0], [1.0, 1.0]]], expected: "A" },
      { input: [[0, 0], ["neg", "pos"], [0.5, 0.5], [[0, 0], [5, 5]], [[1, 1], [1, 1]]], expected: "neg" },
    ],
    hint: "Work in log space: log prior plus the sum of per-feature log densities.",
  },
  {
    id: "ml-039",
    title: "Bootstrap Sample",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Draw a bootstrap sample (sampling with replacement) from data. Call random.seed(seed), then pick random.randrange(len(data)) for each of n draws.\n\nn defaults to len(data) when it is None. Return the list of drawn elements in draw order (do not sort).",
    starterCode: `import random
def bootstrap_sample(data, seed, n=None):
    # Your code here
    pass`,
    solution: `import random
def bootstrap_sample(data, seed, n=None):
    if n is None:
        n = len(data)
    random.seed(seed)
    result = []
    for _ in range(n):
        result.append(data[random.randrange(len(data))])
    return result`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 42, 5], expected: [1, 1, 3, 2, 2] },
      { input: [["a", "b", "c"], 7, 4], expected: ["b", "a", "b", "c"] },
      { input: [[[1, 0], [0, 1], [1, 1]], 1, 3], expected: [[1, 0], [1, 1], [1, 0]] },
      { input: [[10, 20, 30], 0, 6], expected: [20, 20, 10, 20, 30, 20] },
    ],
    hint: "Seed the generator, then append data[random.randrange(len(data))] n times.",
  },
  {
    id: "ml-040",
    title: "Bagging Feature Subset",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Select k distinct feature indices at random (without replacement) from range(n_features) using a seeded shuffle.\n\nCall random.seed(seed), shuffle the list of indices, take the first k, and return them sorted in ascending order.",
    starterCode: `import random
def bagging_feature_subset(n_features, k, seed):
    # Your code here
    pass`,
    solution: `import random
def bagging_feature_subset(n_features, k, seed):
    indices = list(range(n_features))
    random.seed(seed)
    random.shuffle(indices)
    return sorted(indices[:k])`,
    testCases: [
      { input: [5, 3, 42], expected: [1, 2, 3] },
      { input: [4, 4, 0], expected: [0, 1, 2, 3] },
      { input: [6, 2, 7], expected: [0, 4] },
      { input: [3, 1, 1], expected: [1] },
    ],
    hint: "Shuffle all indices, take a prefix, and sort the result.",
  },
  {
    id: "ml-041",
    title: "PCA Mean Centering",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Center each column of X by subtracting its column mean, producing data with zero mean per feature.\n\nX is a list of rows; return a new matrix of the same shape. Empty input returns [].",
    starterCode: `def mean_center(X):
    # Your code here
    pass`,
    solution: `def mean_center(X):
    if not X:
        return []
    n = len(X)
    d = len(X[0])
    means = [sum(row[j] for row in X) / n for j in range(d)]
    return [[row[j] - means[j] for j in range(d)] for row in X]`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]] },
      { input: [[[0, 0], [10, 20], [20, 40]]], expected: [[-10.0, -20.0], [0.0, 0.0], [10.0, 20.0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[]], expected: [] },
    ],
    hint: "Compute column means first, then subtract element-wise.",
  },
  {
    id: "ml-042",
    title: "Covariance Matrix",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the population covariance matrix of X (n rows, d columns): subtract the column means, then set entry (a, b) to (1/n) * sum_i centered[i][a] * centered[i][b].\n\nReturn a d x d matrix (divide by n, not n-1). Empty input returns [].",
    starterCode: `def covariance_matrix(X):
    # Your code here
    pass`,
    solution: `def covariance_matrix(X):
    if not X:
        return []
    n = len(X)
    d = len(X[0])
    means = [sum(row[j] for row in X) / n for j in range(d)]
    centered = [[row[j] - means[j] for j in range(d)] for row in X]
    cov = []
    for a in range(d):
        row = []
        for b in range(d):
            row.append(sum(centered[i][a] * centered[i][b] for i in range(n)) / n)
        cov.append(row)
    return cov`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[2.6666666666666665, 2.6666666666666665], [2.6666666666666665, 2.6666666666666665]] },
      { input: [[[0, 1], [1, 0], [0, -1], [-1, 0]]], expected: [[0.5, 0.0], [0.0, 0.5]] },
      { input: [[[2, 0], [0, 2]]], expected: [[1.0, -1.0], [-1.0, 1.0]] },
      { input: [[[1], [2], [3]]], expected: [[0.6666666666666666]] },
    ],
    hint: "Cov(a, b) is the mean product of the centered columns a and b.",
  },
  {
    id: "ml-043",
    title: "Power Iteration",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Estimate the leading eigenvector of a symmetric matrix A with power iteration.\n\nStart from the unit vector with all entries 1/sqrt(n), repeatedly set v = A v and renormalize to unit length num_iters times. Return [eigenvector, rayleigh] where rayleigh = v^T A v. If A v becomes the zero vector, stop and return the current vector with 0.0. Empty A returns [[], 0.0].",
    starterCode: `def power_iteration(A, num_iters):
    # Returns [eigenvector, rayleigh_quotient]
    # Your code here
    pass`,
    solution: `def power_iteration(A, num_iters):
    n = len(A)
    if n == 0:
        return [[], 0.0]
    v = [1.0 / (n ** 0.5)] * n
    for _ in range(num_iters):
        w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
        norm = sum(x * x for x in w) ** 0.5
        if norm == 0:
            return [v, 0.0]
        v = [x / norm for x in w]
    rayleigh = sum(v[i] * sum(A[i][j] * v[j] for j in range(n)) for i in range(n))
    return [v, rayleigh]`,
    testCases: [
      { input: [[[2, 0], [0, 1]], 50], expected: [[1.0, 8.881784197001252e-16], 2.0] },
      { input: [[[4, 1], [1, 3]], 100], expected: [[0.85065080835204, 0.5257311121191337], 4.618033988749896] },
      { input: [[[2, 1], [1, 2]], 10], expected: [[0.7071067811865475, 0.7071067811865475], 2.9999999999999996] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], 5], expected: [[0.5773502691896258, 0.5773502691896258, 0.5773502691896258], 1.0000000000000002] },
    ],
    hint: "Multiply by A, divide by the vector norm, and after the loop compute v^T A v.",
  },
  {
    id: "ml-044",
    title: "Projection onto a Principal Component",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Project X onto the unit principal component vector v: subtract the column means, then compute the dot product of each centered row with v.\n\nReturn the list of 1D projected coordinates. Empty X returns [].",
    starterCode: `def project_onto_pc(X, v):
    # Your code here
    pass`,
    solution: `def project_onto_pc(X, v):
    if not X:
        return []
    n = len(X)
    d = len(X[0])
    means = [sum(row[j] for row in X) / n for j in range(d)]
    result = []
    for row in X:
        result.append(sum((row[j] - means[j]) * v[j] for j in range(d)))
    return result`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]], [0.7071067811865476, 0.7071067811865476]], expected: [-2.8284271247461903, 0.0, 2.8284271247461903] },
      { input: [[[1, 2], [3, 4], [5, 6]], [1.0, 0.0]], expected: [-2.0, 0.0, 2.0] },
      { input: [[[0, 0], [1, 0], [2, 0]], [0.0, 1.0]], expected: [0.0, 0.0, 0.0] },
      { input: [[[1, 1], [2, 2]], [0.6, 0.8]], expected: [-0.7, 0.7] },
    ],
    hint: "Center first, then dot each row with v.",
  },
  {
    id: "ml-045",
    title: "Explained Variance Ratio",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the explained variance ratio of a unit principal component v: the population variance of the projected (mean-centered) data divided by the total variance, which is the sum of the per-feature population variances.\n\nIf the total variance is 0, return 0.0. Empty X returns 0.0.",
    starterCode: `def explained_variance_ratio(X, v):
    # Your code here
    pass`,
    solution: `def explained_variance_ratio(X, v):
    if not X:
        return 0.0
    n = len(X)
    d = len(X[0])
    means = [sum(row[j] for row in X) / n for j in range(d)]
    proj = [sum((row[j] - means[j]) * v[j] for j in range(d)) for row in X]
    pmean = sum(proj) / n
    pvar = sum((p - pmean) ** 2 for p in proj) / n
    total = 0.0
    for j in range(d):
        mj = means[j]
        total += sum((row[j] - mj) ** 2 for row in X) / n
    if total == 0:
        return 0.0
    return pvar / total`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]], [0.7071067811865476, 0.7071067811865476]], expected: 1.0000000000000004 },
      { input: [[[1, 2], [3, 4], [5, 6]], [0.7071067811865476, -0.7071067811865476]], expected: 0.0 },
      { input: [[[2, 0], [0, 1], [-2, 0], [0, -1]], [1.0, 0.0]], expected: 0.8 },
      { input: [[[5, 5], [5, 5]], [1.0, 0.0]], expected: 0.0 },
    ],
    hint: "Ratio = variance of projected coordinates / sum of per-feature variances.",
  },
  {
    id: "ml-046",
    title: "Cosine Similarity",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the cosine similarity between two vectors: (a . b) / (||a|| * ||b||).\n\nIf the lengths differ or either vector has zero norm, return 0.0.",
    starterCode: `import math
def cosine_similarity(a, b):
    # Your code here
    pass`,
    solution: `import math
def cosine_similarity(a, b):
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[1, 2], [2, 4]], expected: 0.9999999999999998 },
      { input: [[1, 2, 3], [-1, -2, -3]], expected: -1.0 },
    ],
    hint: "Normalize the dot product by both vector norms.",
  },
  {
    id: "ml-047",
    title: "Z-Score Outlier Detection",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Detect outliers by z-score using the population standard deviation: return the indices i (ascending) where |(x_i - mean) / std| > threshold.\n\nIf the variance is 0 or the input is empty, return [].",
    starterCode: `def zscore_outliers(values, threshold):
    # Your code here
    pass`,
    solution: `def zscore_outliers(values, threshold):
    n = len(values)
    if n == 0:
        return []
    mean = sum(values) / n
    var = sum((v - mean) ** 2 for v in values) / n
    if var == 0:
        return []
    std = var ** 0.5
    return [i for i, v in enumerate(values) if abs((v - mean) / std) > threshold]`,
    testCases: [
      { input: [[10, 12, 11, 13, 12, 100], 2.0], expected: [5] },
      { input: [[1, 2, 3, 4, 5], 1.5], expected: [] },
      { input: [[0, 0, 0, 10], 1.5], expected: [3] },
      { input: [[7, 7, 7], 1.0], expected: [] },
    ],
    hint: "Use the population standard deviation, then compare |z| against the threshold.",
  },
  {
    id: "ml-048",
    title: "Inverse-Frequency Class Weights",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute inverse-frequency class weights. For each label c, weight = n / (k * count_c), where n is the number of samples and k is the number of distinct labels.\n\nReturn a dict mapping str(label) to its weight. Empty input returns {}.",
    starterCode: `def inverse_frequency_weights(labels):
    # Your code here
    pass`,
    solution: `def inverse_frequency_weights(labels):
    n = len(labels)
    if n == 0:
        return {}
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    k = len(counts)
    return {str(l): n / (k * counts[l]) for l in counts}`,
    testCases: [
      { input: [["a", "a", "a", "b", "b", "c"]], expected: { a: 0.6666666666666666, b: 1.0, c: 2.0 } },
      { input: [[0, 0, 1, 1, 1, 1]], expected: { "0": 1.5, "1": 0.75 } },
      { input: [["x"]], expected: { x: 1.0 } },
      { input: [[]], expected: {} },
    ],
    hint: "Rarer classes get larger weights; keys are stringified labels.",
  },
  {
    id: "ml-049",
    title: "Stratified Train/Test Split",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Build a deterministic stratified train/test split. For each label (processed in sorted order), let idx be its positions in the original order; the first int(len(idx) * test_fraction) positions go to the test set and the rest go to train.\n\nReturn [train_indices, test_indices], both sorted in ascending order.",
    starterCode: `def stratified_split_indices(labels, test_fraction):
    # Returns [train_indices, test_indices]
    # Your code here
    pass`,
    solution: `def stratified_split_indices(labels, test_fraction):
    n = len(labels)
    train = []
    test = []
    seen = []
    for l in labels:
        if l not in seen:
            seen.append(l)
    for l in sorted(seen):
        idx = [i for i in range(n) if labels[i] == l]
        n_test = int(len(idx) * test_fraction)
        test.extend(idx[:n_test])
        train.extend(idx[n_test:])
    return [sorted(train), sorted(test)]`,
    testCases: [
      { input: [[0, 0, 0, 1, 1, 1], 0.5], expected: [[1, 2, 4, 5], [0, 3]] },
      { input: [[0, 1, 0, 1, 0], 0.4], expected: [[1, 2, 3, 4], [0]] },
      { input: [[2, 2, 1, 1, 1], 0.34], expected: [[0, 1, 3, 4], [2]] },
      { input: [["a", "b", "a", "b"], 0.5], expected: [[2, 3], [0, 1]] },
    ],
    hint: "Per class, floor the test count and take indices from the front of that class's position list.",
  },
  {
    id: "ml-050",
    title: "Bootstrap Confidence Interval",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute a bootstrap confidence interval for the mean. Call random.seed(seed) and draw num_samples bootstrap resamples of size n with replacement using random.randrange(n), recording each resample mean.\n\nSort the means, then take the values at indices int((1 - confidence) / 2 * num_samples) and int((1 + confidence) / 2 * num_samples), clamping both to num_samples - 1. Return [lower, upper]. Empty data returns [0.0, 0.0].",
    starterCode: `import random
def bootstrap_mean_ci(data, num_samples, confidence, seed):
    # Returns [lower, upper]
    # Your code here
    pass`,
    solution: `import random
def bootstrap_mean_ci(data, num_samples, confidence, seed):
    n = len(data)
    if n == 0:
        return [0.0, 0.0]
    random.seed(seed)
    means = []
    for _ in range(num_samples):
        total = 0.0
        for _ in range(n):
            total += data[random.randrange(n)]
        means.append(total / n)
    means.sort()
    lo_idx = int((1.0 - confidence) / 2.0 * num_samples)
    hi_idx = int((1.0 + confidence) / 2.0 * num_samples)
    if lo_idx >= num_samples:
        lo_idx = num_samples - 1
    if hi_idx >= num_samples:
        hi_idx = num_samples - 1
    return [means[lo_idx], means[hi_idx]]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8], 200, 0.95, 42], expected: [3.0, 6.25] },
      { input: [[10, 12, 11, 13, 12], 100, 0.9, 7], expected: [10.8, 12.2] },
      { input: [[10, 20, 30], 50, 0.8, 1], expected: [16.666666666666668, 26.666666666666668] },
      { input: [[5, 5, 5, 5], 20, 0.5, 0], expected: [5.0, 5.0] },
    ],
    hint: "Build the sorted list of resample means, then index it at the two percentile positions.",
  },
];
