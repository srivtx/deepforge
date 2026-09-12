import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-001",
    title: "Linear Regression",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Fit a simple linear regression y = a + b*x using least squares.\n\nb = sum((x_i - mean_x) * (y_i - mean_y)) / sum((x_i - mean_x)^2)\na = mean_y - b * mean_x\n\nReturn [a, b] = [intercept, slope]. If the denominator is 0, return [mean_y, 0.0].",
    starterCode: `def linear_regression_fit(X, y):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def linear_regression_fit(X, y):
    n = len(X)
    mx = sum(X) / n
    my = sum(y) / n
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(X, y))
    den = sum((xi - mx) ** 2 for xi in X)
    if den == 0:
        return [my, 0.0]
    b = num / den
    a = my - b * mx
    return [a, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 5, 7, 9, 11]], expected: [1.0, 2.0] },
      { input: [[0, 1, 2, 3], [1, 3, 5, 7]], expected: [1.0, 2.0] },
      { input: [[1, 2, 3], [2, 4, 6]], expected: [0.0, 2.0] },
      { input: [[5, 5, 5], [3, 4, 5]], expected: [4.0, 0.0] },
    ],
    hint: "b is the slope (cov(x,y) / var(x)); a is the intercept that makes the line pass through (mean_x, mean_y).",
  },
  {
    id: "ml-002",
    title: "Logistic Sigmoid",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the logistic sigmoid function: σ(z) = 1 / (1 + exp(-z)).\n\nHandle large positive and negative z correctly (avoid overflow).",
    starterCode: `import math
def sigmoid(z):
    # Your code here
    pass`,
    solution: `import math
def sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    ez = math.exp(z)
    return ez / (1.0 + ez)`,
    testCases: [
      { input: [0], expected: 0.5 },
      { input: [100], expected: 1.0 },
      { input: [-100], expected: 0.0 },
      { input: [2], expected: 0.8807970779778823 },
      { input: [-2], expected: 0.11920292202211755 },
    ],
    hint: "Branch on the sign of z to avoid exp() overflow.",
  },
  {
    id: "ml-003",
    title: "K-Means One Iteration",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one iteration of k-means:\n  1. Assign each point to its nearest centroid (Euclidean distance).\n  2. Recompute each centroid as the mean of the points assigned to it.\n\nIf a centroid has no points assigned, keep it unchanged.\n\npoints is a list of [x, y, ...] vectors. centroids is a list of same-shape vectors. Returns the new list of centroids.",
    starterCode: `def kmeans_one_iter(points, centroids):
    # Your code here
    pass`,
    solution: `def kmeans_one_iter(points, centroids):
    n_c = len(centroids)
    dim = len(centroids[0]) if centroids else 0
    clusters = [[] for _ in range(n_c)]
    for p in points:
        best = 0
        best_d = float('inf')
        for i, c in enumerate(centroids):
            d = sum((p[j] - c[j]) ** 2 for j in range(dim))
            if d < best_d:
                best_d = d
                best = i
        clusters[best].append(p)
    new_c = []
    for i, cluster in enumerate(clusters):
        if not cluster:
            new_c.append(list(centroids[i]))
        else:
            new_c.append([sum(p[j] for p in cluster) / len(cluster) for j in range(dim)])
    return new_c`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], [[0, 0], [10, 10]]], expected: [[0.0, 0.5], [10.0, 10.5]] },
      { input: [[[1, 1], [2, 2], [9, 9], [10, 10]], [[0, 0], [5, 5]]], expected: [[1.5, 1.5], [9.5, 9.5]] },
      { input: [[[1], [2], [9], [10]], [[0], [5]]], expected: [[1.5], [9.5]] },
    ],
    hint: "First pass: assignment. Second pass: recompute means.",
  },
  {
    id: "ml-004",
    title: "K-Nearest Neighbors",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict the class label of x_test by majority vote among its k nearest neighbors in X_train.\n\nDistance is Euclidean. Ties in the vote are broken by choosing the smallest label.",
    starterCode: `def knn_predict(X_train, y_train, x_test, k):
    # Your code here
    pass`,
    solution: `def knn_predict(X_train, y_train, x_test, k):
    distances = []
    for i, x in enumerate(X_train):
        d = sum((a - b) ** 2 for a, b in zip(x, x_test))
        distances.append((d, y_train[i]))
    distances.sort(key=lambda t: t[0])
    votes = {}
    for i in range(min(k, len(distances))):
        label = distances[i][1]
        votes[label] = votes.get(label, 0) + 1
    max_count = max(votes.values())
    winners = sorted([l for l, c in votes.items() if c == max_count])
    return winners[0]`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], ["a", "a", "b", "b"], [1, 0], 2], expected: "a" },
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], ["a", "a", "b", "b"], [9, 10], 2], expected: "b" },
      { input: [[[1], [2], [3], [10]], [0, 0, 0, 1], [4], 3], expected: 0 },
    ],
    hint: "Sort by distance, take top k, count labels, break ties by smallest label.",
  },
  {
    id: "ml-005",
    title: "Best Decision Tree Split",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Find the (feature_index, threshold) split that minimizes the weighted Gini impurity of the two children.\n\nFor each feature, consider thresholds midway between consecutive unique values. Return [feature_index, threshold] of the best split.\n\nIf no split improves (only one unique value per feature), return [0, 0.0].",
    starterCode: `def best_split_gini(X, y):
    # Returns [feature_index, threshold]
    # Your code here
    pass`,
    solution: `def best_split_gini(X, y):
    def gini(labels):
        n = len(labels)
        if n == 0:
            return 0.0
        counts = {}
        for l in labels:
            counts[l] = counts.get(l, 0) + 1
        return 1.0 - sum((c / n) ** 2 for c in counts.values())
    n = len(y)
    n_features = len(X[0])
    best_gini = float('inf')
    best_feat = 0
    best_thr = 0.0
    for feat in range(n_features):
        values = sorted(set(x[feat] for x in X))
        for i in range(len(values) - 1):
            thr = (values[i] + values[i + 1]) / 2.0
            left = [y[j] for j in range(n) if X[j][feat] <= thr]
            right = [y[j] for j in range(n) if X[j][feat] > thr]
            if not left or not right:
                continue
            w = len(left) / n * gini(left) + len(right) / n * gini(right)
            if w < best_gini:
                best_gini = w
                best_feat = feat
                best_thr = thr
    return [best_feat, best_thr]`,
    testCases: [
      { input: [[[1, 2], [2, 3], [3, 4], [8, 9], [9, 10]], [0, 0, 0, 1, 1]], expected: [0, 5.5] },
      { input: [[[1], [2], [10], [11]], [0, 0, 1, 1]], expected: [0, 6.0] },
      { input: [[[1, 1], [1, 2], [2, 1], [2, 2]], [0, 1, 1, 0]], expected: [0, 1.5] },
    ],
    hint: "Gini of a node = 1 - sum(p_i^2). Weighted by node size.",
  },
  {
    id: "ml-006",
    title: "Entropy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Shannon entropy (base 2) of a list of class labels:\n\nH = -sum(p_i * log2(p_i))\n\nwhere p_i is the proportion of label i. Empty input returns 0.0.",
    starterCode: `import math
def entropy(labels):
    # Your code here
    pass`,
    solution: `import math
def entropy(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    h = 0.0
    for c in counts.values():
        p = c / n
        if p > 0:
            h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [[0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 0, 0, 0]], expected: 0.0 },
      { input: [[0, 1, 2, 3]], expected: 2.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Use math.log2 for base-2 entropy.",
  },
  {
    id: "ml-007",
    title: "Gini Impurity",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Gini impurity of a list of class labels:\n\nGini = 1 - sum(p_i^2)\n\nEmpty input returns 0.0.",
    starterCode: `def gini_impurity(labels):
    # Your code here
    pass`,
    solution: `def gini_impurity(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c / n) ** 2 for c in counts.values())`,
    testCases: [
      { input: [[0, 0, 1, 1]], expected: 0.5 },
      { input: [[0, 0, 0, 0]], expected: 0.0 },
      { input: [[0, 1, 2, 3]], expected: 0.75 },
      { input: [[]], expected: 0.0 },
    ],
  },
  {
    id: "ml-008",
    title: "Accuracy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Compute classification accuracy: fraction of y_true[i] that equal y_pred[i]. Empty input returns 0.0.",
    starterCode: `def accuracy(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)`,
    testCases: [
      { input: [[1, 0, 1, 1], [1, 0, 0, 1]], expected: 0.75 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 0], [1, 0, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "ml-009",
    title: "Precision, Recall, F1",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute precision, recall, and F1 score for binary classification.\n\nA positive label is 1 by default. Return [precision, recall, f1].\n\nprecision = TP / (TP + FP)\nrecall = TP / (TP + FN)\nF1 = 2 * precision * recall / (precision + recall)\n\nAny undefined value (zero denominator) is 0.0.",
    starterCode: `def precision_recall_f1(y_true, y_pred, positive=1):
    # Returns [precision, recall, f1]
    # Your code here
    pass`,
    solution: `def precision_recall_f1(y_true, y_pred, positive=1):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == positive and p == positive)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t != positive and p == positive)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == positive and p != positive)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return [precision, recall, f1]`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [1, 0, 0, 1, 0]], expected: [1.0, 0.6666666666666666, 0.8] },
      { input: [[1, 1, 0, 0], [1, 1, 1, 0]], expected: [0.6666666666666666, 1.0, 0.8] },
      { input: [[1, 1, 1], [0, 0, 0]], expected: [0.0, 0.0, 0.0] },
      { input: [[0, 0, 0], [1, 1, 1]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "TP = both true and pred are positive. FP = pred positive but true negative. FN = pred negative but true positive.",
  },
  {
    id: "ml-010",
    title: "K-Fold Split Indices",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Generate k-fold cross-validation splits for n samples (indices 0..n-1).\n\nReturn a list of k entries, each of the form [train_indices, val_indices].\n\nDistribute samples so that the first (n % k) folds get one extra sample. Train indices are everything except the validation indices for that fold.",
    starterCode: `def kfold_indices(n, k):
    # Returns list of [train_indices, val_indices]
    # Your code here
    pass`,
    solution: `def kfold_indices(n, k):
    indices = list(range(n))
    fold_size = n // k
    remainder = n % k
    folds = []
    start = 0
    for i in range(k):
        size = fold_size + (1 if i < remainder else 0)
        val = indices[start:start + size]
        train = indices[:start] + indices[start + size:]
        folds.append([train, val])
        start += size
    return folds`,
    testCases: [
      { input: [6, 3], expected: [[[2, 3, 4, 5], [0, 1]], [[0, 1, 4, 5], [2, 3]], [[0, 1, 2, 3], [4, 5]]] },
      { input: [4, 2], expected: [[[2, 3], [0, 1]], [[0, 1], [2, 3]]] },
      { input: [5, 5], expected: [[[1, 2, 3, 4], [0]], [[0, 2, 3, 4], [1]], [[0, 1, 3, 4], [2]], [[0, 1, 2, 4], [3]], [[0, 1, 2, 3], [4]]] },
    ],
    hint: "Slice the indices into k contiguous chunks; train is the complement of val.",
  },
];
