import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ml-136",
    title: "Gradient Boosting Stump",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Fit a depth-1 regression stump to gradients (residuals). For each threshold midway between consecutive unique feature values, split X into left (x <= t) and right (x > t) and predict each side's mean gradient.\n\nReturn [threshold, left_mean, right_mean] for the split with the lowest total squared error; if no split exists, return [0.0, mean, mean]. Empty input returns [0.0, 0.0, 0.0].",
    starterCode: `def gradient_boosting_stump(X, gradients):
    # Returns [threshold, left_mean, right_mean]
    # Your code here
    pass`,
    solution: `def gradient_boosting_stump(X, gradients):
    n = len(X)
    if n == 0:
        return [0.0, 0.0, 0.0]
    mean_all = sum(gradients) / n
    values = sorted(set(X))
    best_sse = None
    best = [0.0, mean_all, mean_all]
    for i in range(len(values) - 1):
        thr = (values[i] + values[i + 1]) / 2.0
        left = [gradients[k] for k in range(n) if X[k] <= thr]
        right = [gradients[k] for k in range(n) if X[k] > thr]
        lm = sum(left) / len(left)
        rm = sum(right) / len(right)
        sse = sum((g - lm) ** 2 for g in left) + sum((g - rm) ** 2 for g in right)
        if best_sse is None or sse < best_sse:
            best_sse = sse
            best = [thr, lm, rm]
    return best`,
    testCases: [
      { input: [[1, 2, 3, 4], [1, 1, -1, -1]], expected: [2.5, 1.0, -1.0] },
      { input: [[1, 2, 3], [3, 1, 2]], expected: [1.5, 3.0, 1.5] },
      { input: [[1, 1, 2, 3], [1, 3, 2, 4]], expected: [2.5, 2.0, 4.0] },
      { input: [[5], [2]], expected: [0.0, 2.0, 2.0] },
      { input: [[], []], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "A stump predicts the mean gradient in each leaf; the best threshold minimizes the total squared error.",
  },
  {
    id: "ml-137",
    title: "AdaBoost Weight Update",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one AdaBoost weight update: w_i = w_i * exp(-alpha * y_i * pred_i), then normalize the weights to sum to 1.\n\nLabels and predictions are in {-1, +1}. Empty input returns []; if the new weights sum to 0, return all zeros.",
    starterCode: `import math
def adaboost_weight_update(weights, y_true, y_pred, alpha):
    # Your code here
    pass`,
    solution: `import math
def adaboost_weight_update(weights, y_true, y_pred, alpha):
    if not weights:
        return []
    new_w = [weights[i] * math.exp(-alpha * y_true[i] * y_pred[i]) for i in range(len(weights))]
    total = sum(new_w)
    if total == 0:
        return [0.0 for _ in weights]
    return [w / total for w in new_w]`,
    testCases: [
      { input: [[0.5, 0.5], [1, 1], [1, -1], 0.5], expected: [0.26894142136999516, 0.731058578630005] },
      { input: [[0.5, 0.5], [1, 1], [1, 1], 0.5], expected: [0.5, 0.5] },
      { input: [[0.2, 0.3, 0.5], [1, -1, 1], [-1, -1, 1], 1.0], expected: [0.6487856442839394, 0.13170538339352275, 0.21950897232253794] },
      { input: [[], [], [], 1.0], expected: [] },
    ],
    hint: "Misclassified samples get their weight multiplied by exp(alpha), correct ones by exp(-alpha).",
  },
  {
    id: "ml-138",
    title: "Bagging Vote Prediction",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Majority vote of bagged models on each sample. predictions is a list of models, each with one predicted label per sample; for each sample take the most common label across models.\n\nTies are broken by the smallest label. Empty input returns [].",
    starterCode: `def bagging_vote(predictions):
    # Your code here
    pass`,
    solution: `def bagging_vote(predictions):
    if not predictions:
        return []
    n = len(predictions[0])
    result = []
    for j in range(n):
        counts = {}
        for m in range(len(predictions)):
            label = predictions[m][j]
            counts[label] = counts.get(label, 0) + 1
        best = None
        best_c = -1
        for label in sorted(counts.keys()):
            if counts[label] > best_c:
                best_c = counts[label]
                best = label
        result.append(best)
    return result`,
    testCases: [
      { input: [[["a", "b", "a"], ["a", "b", "b"]]], expected: ["a", "b", "a"] },
      { input: [[[1, 0], [1, 1], [0, 1]]], expected: [1, 1] },
      { input: [[[3, 1, 2]]], expected: [3, 1, 2] },
      { input: [[]], expected: [] },
    ],
    hint: "Count labels per sample and pick the leader, breaking ties by the smallest label.",
  },
  {
    id: "ml-139",
    title: "Random Forest Probability Vote",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Random forest probability vote. tree_probs[t][j] is tree t's class probability vector for sample j; average the probabilities across trees and pick the class with the largest mean probability.\n\nTies are broken by the smallest class index. Empty input returns [].",
    starterCode: `def random_forest_prob_vote(tree_probs):
    # Your code here
    pass`,
    solution: `def random_forest_prob_vote(tree_probs):
    if not tree_probs:
        return []
    n = len(tree_probs[0])
    k = len(tree_probs[0][0])
    result = []
    for j in range(n):
        avg = [sum(tree_probs[t][j][c] for t in range(len(tree_probs))) / len(tree_probs) for c in range(k)]
        best = 0
        for c in range(1, k):
            if avg[c] > avg[best]:
                best = c
        result.append(best)
    return result`,
    testCases: [
      { input: [[[[0.6, 0.4], [0.3, 0.7]], [[0.5, 0.5], [0.2, 0.8]]]], expected: [0, 1] },
      { input: [[[[0.5, 0.5]], [[0.5, 0.5]]]], expected: [0] },
      { input: [[[[0.2, 0.3, 0.5]], [[0.5, 0.3, 0.2]]]], expected: [0] },
      { input: [[]], expected: [] },
    ],
    hint: "Average the per-tree probabilities first, then take the argmax per sample.",
  },
  {
    id: "ml-140",
    title: "Feature Importance from Split Gains",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Aggregate split gains into feature importances. Sum the gain of all splits per feature, then normalize by the total gain.\n\nReturn a dict mapping str(feature) to its share; if the total gain is 0, all shares are 0.0. Empty input returns {}.",
    starterCode: `def feature_importance(splits):
    # Your code here
    pass`,
    solution: `def feature_importance(splits):
    gains = {}
    for feat, gain in splits:
        gains[feat] = gains.get(feat, 0.0) + gain
    total = sum(gains.values())
    if total == 0:
        return {str(f): 0.0 for f in gains}
    return {str(f): gains[f] / total for f in gains}`,
    testCases: [
      { input: [[[0, 2], [1, 1], [0, 1]]], expected: { "0": 0.75, "1": 0.25 } },
      { input: [[[0, 0.5], [1, 0.5]]], expected: { "0": 0.5, "1": 0.5 } },
      { input: [[[0, 0.0]]], expected: { "0": 0.0 } },
      { input: [[]], expected: {} },
    ],
    hint: "Sum gains per feature, then divide by the total gain across all splits.",
  },
  {
    id: "ml-141",
    title: "Permutation Importance MSE",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Measure permutation importance as the MSE increase when a feature column is shuffled. Build base predictions w0 + x . w, then shuffle column `feature` with random.seed(seed) and random.shuffle, recompute the MSE, and return permuted_mse - base_mse.\n\nEmpty X returns 0.0.",
    starterCode: `import random
def permutation_importance_mse(X, y, w0, w, feature, seed):
    # Your code here
    pass`,
    solution: `import random
def permutation_importance_mse(X, y, w0, w, feature, seed):
    n = len(X)
    if n == 0:
        return 0.0
    d = len(w)
    def mse_for(col_values):
        total = 0.0
        for i in range(n):
            pred = w0
            for j in range(d):
                v = col_values[i] if j == feature else X[i][j]
                pred += v * w[j]
            total += (pred - y[i]) ** 2
        return total / n
    base_col = [X[i][feature] for i in range(n)]
    base = mse_for(base_col)
    perm = list(range(n))
    random.seed(seed)
    random.shuffle(perm)
    perm_col = [X[perm[i]][feature] for i in range(n)]
    return mse_for(perm_col) - base`,
    testCases: [
      { input: [[[1], [2], [3], [4]], [2, 4, 6, 8], 0, [2], 0, 42], expected: 14.0 },
      { input: [[[1], [2], [3], [4]], [3, 5, 7, 9], 0, [2], 0, 7], expected: 14.0 },
      { input: [[[1, 2], [2, 1], [3, 4], [4, 3]], [1, 1, 2, 2], 0.5, [0.5, 0.5], 1, 0], expected: 0.125 },
      { input: [[], [], 0, [1], 0, 1], expected: 0.0 },
    ],
    hint: "Break the relationship between the feature and the target by shuffling, then measure the harm.",
  },
  {
    id: "ml-142",
    title: "Linear SHAP Contribution",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute linear SHAP contributions for one point: phi_j = w_j * (x_j - background_mean_j).\n\nReturn the list of contributions; empty input returns [].",
    starterCode: `def linear_shap_values(x, w, background_means):
    # Your code here
    pass`,
    solution: `def linear_shap_values(x, w, background_means):
    return [w[j] * (x[j] - background_means[j]) for j in range(len(w))]`,
    testCases: [
      { input: [[5, 10], [2, -1], [3, 8]], expected: [4.0, -2.0] },
      { input: [[1], [3], [2]], expected: [-3.0] },
      { input: [[0.5, 1.5], [-2, 4], [0.5, 0.5]], expected: [0.0, 4.0] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "For a linear model each feature's SHAP value is its weight times its deviation from the background mean.",
  },
  {
    id: "ml-143",
    title: "Best Epoch from Loss Curve",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the index of the epoch with the lowest validation loss (ties go to the earliest epoch).\n\nEmpty input returns -1.",
    starterCode: `def best_epoch(val_losses):
    # Your code here
    pass`,
    solution: `def best_epoch(val_losses):
    if not val_losses:
        return -1
    best = 0
    for i in range(1, len(val_losses)):
        if val_losses[i] < val_losses[best]:
            best = i
    return best`,
    testCases: [
      { input: [[0.9, 0.7, 0.5, 0.6]], expected: 2 },
      { input: [[1.0, 1.0, 1.0]], expected: 0 },
      { input: [[0.4]], expected: 0 },
      { input: [[]], expected: -1 },
    ],
    hint: "Scan for the minimum with a strict less-than so the first minimum wins.",
  },
  {
    id: "ml-144",
    title: "Overfitting Gap",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the gap between validation and training loss at the best epoch, i.e. the epoch with the lowest validation loss (ties go to the earliest).\n\nEmpty input returns 0.0.",
    starterCode: `def overfitting_gap(train_losses, val_losses):
    # Your code here
    pass`,
    solution: `def overfitting_gap(train_losses, val_losses):
    if not val_losses:
        return 0.0
    best = 0
    for i in range(1, len(val_losses)):
        if val_losses[i] < val_losses[best]:
            best = i
    return val_losses[best] - train_losses[best]`,
    testCases: [
      { input: [[0.5, 0.4, 0.3], [0.6, 0.5, 0.55]], expected: 0.09999999999999998 },
      { input: [[0.9, 0.7], [0.95, 0.6]], expected: -0.09999999999999998 },
      { input: [[0.2], [0.3]], expected: 0.09999999999999998 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Evaluate the generalization gap at the best validation epoch, not at the last epoch.",
  },
  {
    id: "ml-145",
    title: "K-Means++ Init",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Run k-means++ seeding for the first two centroids. With random.seed(seed), pick the first centroid uniformly at random, then pick the second with probability proportional to its squared distance from the first (using a single random.random() draw over the cumulative distribution).\n\nReturn [index0, index1]; if all points coincide, pick the second uniformly at random. Empty input returns [].",
    starterCode: `import random
def kmeans_plus_plus_init(points, seed):
    # Returns [index0, index1]
    # Your code here
    pass`,
    solution: `import random
def kmeans_plus_plus_init(points, seed):
    n = len(points)
    if n == 0:
        return []
    random.seed(seed)
    i0 = random.randrange(n)
    dists = []
    for p in points:
        d = sum((p[j] - points[i0][j]) ** 2 for j in range(len(p)))
        dists.append(d)
    total = sum(dists)
    if total == 0:
        return [i0, random.randrange(n)]
    r = random.random() * total
    cum = 0.0
    i1 = n - 1
    for i in range(n):
        cum += dists[i]
        if cum >= r:
            i1 = i
            break
    return [i0, i1]`,
    testCases: [
      { input: [[[0, 0], [1, 1], [5, 5], [10, 10]], 42], expected: [0, 2] },
      { input: [[[0], [1], [2], [10]], 7], expected: [2, 3] },
      { input: [[[3, 3], [3, 3], [3, 3]], 1], expected: [0, 2] },
      { input: [[[1], [9]], 0], expected: [1, 0] },
    ],
    hint: "D-squared weighting spreads out the initial centroids; compare the cumulative distance to a uniform draw scaled by the total.",
  },
  {
    id: "ml-146",
    title: "Inertia List",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute k-means inertia for several candidate centroid sets. For each centroid list, sum over points the squared Euclidean distance to the nearest centroid.\n\nReturn one inertia per centroid set in order; empty points yields zeros.",
    starterCode: `def inertia_list(points, centroids_per_k):
    # Your code here
    pass`,
    solution: `def inertia_list(points, centroids_per_k):
    result = []
    for centroids in centroids_per_k:
        total = 0.0
        for p in points:
            best = None
            for c in centroids:
                d = sum((p[j] - c[j]) ** 2 for j in range(len(p)))
                if best is None or d < best:
                    best = d
            total += best
        result.append(total)
    return result`,
    testCases: [
      { input: [[[0, 0], [2, 0], [10, 10]], [[[0, 0]], [[0, 0], [10, 10]], [[0, 0], [2, 0], [10, 10]]]], expected: [204.0, 4.0, 0.0] },
      { input: [[[1], [5]], [[[1]], [[1], [5]]]], expected: [16.0, 0.0] },
      { input: [[], [[[0, 0]]]], expected: [0.0] },
    ],
    hint: "Inertia is the total squared distance from each point to its closest centroid.",
  },
  {
    id: "ml-147",
    title: "Silhouette Score Single Point",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the silhouette score of point i: a = mean distance to the other points in its own cluster, b = smallest mean distance to any other cluster, score = (b - a) / max(a, b).\n\nReturn 0.0 if the point's cluster is a singleton, there is no other cluster, or max(a, b) is 0.",
    starterCode: `def silhouette_point(points, labels, i):
    # Your code here
    pass`,
    solution: `def silhouette_point(points, labels, i):
    own = [j for j in range(len(points)) if labels[j] == labels[i] and j != i]
    if not own:
        return 0.0
    a = sum(sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5 for j in own) / len(own)
    b = None
    for lab in sorted(set(labels)):
        if lab == labels[i]:
            continue
        members = [j for j in range(len(points)) if labels[j] == lab]
        mean_d = sum(sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5 for j in members) / len(members)
        if b is None or mean_d < b:
            b = mean_d
    if b is None:
        return 0.0
    denom = max(a, b)
    if denom == 0:
        return 0.0
    return (b - a) / denom`,
    testCases: [
      { input: [[[0, 0], [1, 0], [10, 0], [11, 0]], [0, 0, 1, 1], 0], expected: 0.9047619047619048 },
      { input: [[[0, 0], [1, 0], [10, 0], [11, 0]], [0, 0, 1, 1], 2], expected: 0.8947368421052632 },
      { input: [[[0], [5]], [0, 1], 0], expected: 0.0 },
      { input: [[[0, 0], [5, 5]], [0, 0], 0], expected: 0.0 },
    ],
    hint: "a measures cohesion, b measures separation; values near 1 mean the point fits its own cluster well.",
  },
  {
    id: "ml-148",
    title: "Davies-Bouldin Lite",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the Davies-Bouldin index for exactly two clusters: (spread_0 + spread_1) / distance(centroid_0, centroid_1), where spread is the mean Euclidean distance of cluster members to their centroid.\n\nReturn 0.0 if there are not exactly two clusters, the centroids coincide, or input is empty.",
    starterCode: `def davies_bouldin_2(points, labels):
    # Your code here
    pass`,
    solution: `def davies_bouldin_2(points, labels):
    clusters = sorted(set(labels))
    if len(clusters) != 2:
        return 0.0
    cents = []
    spreads = []
    for c in clusters:
        members = [p for p, l in zip(points, labels) if l == c]
        if not members:
            return 0.0
        dim = len(members[0])
        cent = [sum(p[j] for p in members) / len(members) for j in range(dim)]
        spread = sum(sum((p[j] - cent[j]) ** 2 for j in range(dim)) ** 0.5 for p in members) / len(members)
        cents.append(cent)
        spreads.append(spread)
    dist = sum((cents[0][j] - cents[1][j]) ** 2 for j in range(len(cents[0]))) ** 0.5
    if dist == 0:
        return 0.0
    return (spreads[0] + spreads[1]) / dist`,
    testCases: [
      { input: [[[0, 0], [1, 0], [10, 0], [11, 0]], [0, 0, 1, 1]], expected: 0.1 },
      { input: [[[0], [1], [2], [10]], [0, 0, 0, 1]], expected: 0.07407407407407407 },
      { input: [[[0, 0], [1, 1]], [0, 0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Compact, well-separated clusters give a small Davies-Bouldin index.",
  },
  {
    id: "ml-149",
    title: "Cluster Purity",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute cluster purity: for each cluster count how many points belong to each true class, add the largest count, and divide by n.\n\nEmpty input returns 0.0.",
    starterCode: `def cluster_purity(cluster_ids, true_labels):
    # Your code here
    pass`,
    solution: `def cluster_purity(cluster_ids, true_labels):
    n = len(true_labels)
    if n == 0:
        return 0.0
    groups = {}
    for c, t in zip(cluster_ids, true_labels):
        if c not in groups:
            groups[c] = {}
        counts = groups[c]
        counts[t] = counts.get(t, 0) + 1
    total = 0
    for c in groups:
        total += max(groups[c].values())
    return total / n`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 0, 1]], expected: 0.75 },
      { input: [[0, 0, 0, 1, 1, 1], [0, 1, 0, 1, 1, 2]], expected: 0.6666666666666666 },
      { input: [[7, 7, 7], [1, 2, 3]], expected: 0.3333333333333333 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Each cluster votes with its most frequent true class; sum those votes and normalize.",
  },
  {
    id: "ml-150",
    title: "Adjusted Rand Index",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the adjusted Rand index between two label lists using pair counts:\n\nARI = (sum_ij C(n_ij, 2) - E) / (0.5 * (sum_i C(a_i, 2) + sum_j C(b_j, 2)) - E), where E = sum_i C(a_i, 2) * sum_j C(b_j, 2) / C(n, 2).\n\nReturn 1.0 when the denominator is 0, and 0.0 for empty input.",
    starterCode: `def adjusted_rand_index(a, b):
    # Your code here
    pass`,
    solution: `def adjusted_rand_index(a, b):
    n = len(a)
    if n == 0:
        return 0.0
    def comb2(x):
        return x * (x - 1) // 2
    pairs_a = {}
    pairs_b = {}
    pairs_ab = {}
    for i in range(n):
        pairs_a[a[i]] = pairs_a.get(a[i], 0) + 1
        pairs_b[b[i]] = pairs_b.get(b[i], 0) + 1
        key = (a[i], b[i])
        pairs_ab[key] = pairs_ab.get(key, 0) + 1
    sum_ab = sum(comb2(v) for v in pairs_ab.values())
    sum_a = sum(comb2(v) for v in pairs_a.values())
    sum_b = sum(comb2(v) for v in pairs_b.values())
    total = comb2(n)
    expected = sum_a * sum_b / total if total > 0 else 0.0
    denom = 0.5 * (sum_a + sum_b) - expected
    if denom == 0:
        return 1.0
    return (sum_ab - expected) / denom`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 0, 1, 1], [0, 1, 0, 1]], expected: -0.49999999999999994 },
      { input: [[0, 0, 1, 1, 2, 2], [0, 0, 1, 2, 1, 2]], expected: 0.16666666666666669 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "ARI corrects the Rand index for chance using counting pairs that fall in the same cluster.",
  },
  {
    id: "ml-151",
    title: "Normalized Mutual Information",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the normalized mutual information between two label lists in bits: NMI = 2 * MI / (H(a) + H(b)), where MI uses joint and marginal probabilities and H is Shannon entropy base 2.\n\nReturn 0.0 if the entropies sum to 0 or the input is empty.",
    starterCode: `import math
def normalized_mutual_information(a, b):
    # Your code here
    pass`,
    solution: `import math
def normalized_mutual_information(a, b):
    n = len(a)
    if n == 0:
        return 0.0
    def entropy(vals):
        counts = {}
        for v in vals:
            counts[v] = counts.get(v, 0) + 1
        h = 0.0
        for c in counts.values():
            p = c / n
            h -= p * math.log2(p)
        return h
    ha = entropy(a)
    hb = entropy(b)
    if ha + hb == 0:
        return 0.0
    mi = 0.0
    for va in sorted(set(a)):
        pa = sum(1 for x in a if x == va) / n
        for vb in sorted(set(b)):
            pb = sum(1 for x in b if x == vb) / n
            pab = sum(1 for i in range(n) if a[i] == va and b[i] == vb) / n
            if pab > 0:
                mi += pab * math.log2(pab / (pa * pb))
    return 2.0 * mi / (ha + hb)`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 0, 1], [0, 0, 1, 1]], expected: 0.0 },
      { input: [[0, 0, 1, 1], [0, 1, 1, 1]], expected: 0.34371101848545077 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Normalizing by the average entropy keeps NMI between 0 and 1.",
  },
  {
    id: "ml-152",
    title: "Single-Link Merge Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Find the single-link merge step: the pair of distinct clusters with the smallest minimum pairwise Euclidean distance between their members.\n\nReturn [label_a, label_b, distance] with label_a < label_b; ties in distance keep the first pair in sorted cluster order. Fewer than two clusters returns [].",
    starterCode: `def single_link_merge(points, labels):
    # Returns [label_a, label_b, distance]
    # Your code here
    pass`,
    solution: `def single_link_merge(points, labels):
    clusters = sorted(set(labels))
    if len(clusters) < 2:
        return []
    best_pair = None
    best_d = None
    for ci in range(len(clusters)):
        for cj in range(ci + 1, len(clusters)):
            ca = clusters[ci]
            cb = clusters[cj]
            d = None
            for i in range(len(points)):
                if labels[i] != ca:
                    continue
                for j in range(len(points)):
                    if labels[j] != cb:
                        continue
                    dist = sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5
                    if d is None or dist < d:
                        d = dist
            if best_d is None or d < best_d:
                best_d = d
                best_pair = [ca, cb]
    return [best_pair[0], best_pair[1], best_d]`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1.5, 0], [5, 5]], ["a", "a", "b", "c"]], expected: ["a", "b", 0.5] },
      { input: [[[0, 0], [1, 1], [4, 4], [5, 5]], [0, 0, 1, 1]], expected: [0, 1, 4.242640687119285] },
      { input: [[[0, 0], [1, 1]], [9, 9]], expected: [] },
      { input: [[], []], expected: [] },
    ],
    hint: "Single linkage uses the closest pair of points across two clusters.",
  },
  {
    id: "ml-153",
    title: "DBSCAN Neighbors Within Eps",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the sorted indices of all points within Euclidean distance eps of point i (including i itself).\n\nEmpty points returns [].",
    starterCode: `def dbscan_neighbors(points, i, eps):
    # Your code here
    pass`,
    solution: `def dbscan_neighbors(points, i, eps):
    result = []
    for j in range(len(points)):
        d = sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5
        if d <= eps:
            result.append(j)
    return result`,
    testCases: [
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 0, 1.0], expected: [0, 1] },
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 3, 0.6], expected: [2, 3] },
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 0, 0.1], expected: [0] },
      { input: [[], 0, 1.0], expected: [] },
    ],
    hint: "Use a less-than-or-equal comparison so boundary points still count as neighbors.",
  },
  {
    id: "ml-154",
    title: "DBSCAN Core Point Check",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "A point is a core point when its eps-neighborhood (including itself) contains at least min_pts points.\n\nReturn True or False.",
    starterCode: `def is_core_point(points, i, eps, min_pts):
    # Your code here
    pass`,
    solution: `def is_core_point(points, i, eps, min_pts):
    count = 0
    for j in range(len(points)):
        d = sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5
        if d <= eps:
            count += 1
    return count >= min_pts`,
    testCases: [
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 0, 1.0, 2], expected: true },
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 3, 0.1, 2], expected: false },
      { input: [[[0, 0], [0.5, 0], [2, 0], [2.5, 0]], 3, 0.1, 1], expected: true },
    ],
    hint: "The neighborhood always includes the point itself.",
  },
  {
    id: "ml-155",
    title: "Label Propagation Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one synchronous label propagation step. For each node with label -1, take the majority label among its labeled neighbors (ties go to the smallest label); labeled nodes keep their label.\n\nneighbors[i] lists the neighbor indices of node i. Return the updated labels; empty input returns [].",
    starterCode: `def label_propagation_step(neighbors, labels):
    # Your code here
    pass`,
    solution: `def label_propagation_step(neighbors, labels):
    n = len(labels)
    new_labels = list(labels)
    for i in range(n):
        if labels[i] != -1:
            continue
        counts = {}
        for j in neighbors[i]:
            if labels[j] != -1:
                counts[labels[j]] = counts.get(labels[j], 0) + 1
        if counts:
            best = None
            best_c = -1
            for label in sorted(counts.keys()):
                if counts[label] > best_c:
                    best_c = counts[label]
                    best = label
            new_labels[i] = best
    return new_labels`,
    testCases: [
      { input: [[[1], [0, 2], [1, 3], [2]], [0, -1, -1, -1]], expected: [0, 0, -1, -1] },
      { input: [[[1, 2], [0, 2], [0, 1]], [-1, -1, 1]], expected: [1, 1, 1] },
      { input: [[[1, 2], [0], [0]], [-1, 0, 1]], expected: [0, 0, 1] },
      { input: [[], []], expected: [] },
    ],
    hint: "All unlabeled nodes read the previous label vector, so the update is synchronous.",
  },
  {
    id: "ml-156",
    title: "GMM Responsibility",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the responsibility of each 1D Gaussian component for point x: prior_k * N(x | mean_k, var_k), normalized to sum to 1.\n\nIf a variance is <= 0, the component density is 1.0 at its mean and 0.0 elsewhere. Return 0.0 for every component when the total weight is 0; empty components return [].",
    starterCode: `import math
def gmm_responsibility(x, means, variances, priors):
    # Your code here
    pass`,
    solution: `import math
def gmm_responsibility(x, means, variances, priors):
    k = len(means)
    if k == 0:
        return []
    weights = []
    for c in range(k):
        var = variances[c]
        if var <= 0:
            density = 1.0 if x == means[c] else 0.0
        else:
            density = math.exp(-((x - means[c]) ** 2) / (2.0 * var)) / math.sqrt(2.0 * math.pi * var)
        weights.append(priors[c] * density)
    total = sum(weights)
    if total == 0:
        return [0.0 for _ in range(k)]
    return [w / total for w in weights]`,
    testCases: [
      { input: [0.5, [0, 2], [1, 1], [0.5, 0.5]], expected: [0.7310585786300048, 0.2689414213699951] },
      { input: [0, [0, 1], [1, 1], [0.5, 0.5]], expected: [0.6224593312018546, 0.37754066879814546] },
      { input: [2, [0, 2], [1, 1], [0.3, 0.7]], expected: [0.054821162438825934, 0.945178837561174] },
      { input: [1, [], [], []], expected: [] },
    ],
    hint: "Responsibility is the posterior probability of the component given the point.",
  },
  {
    id: "ml-157",
    title: "EM Mean Update 1D",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform the 1D EM mean update for each component: new_mean_k = sum_i r_ik * x_i / sum_i r_ik, keeping old_means[k] when the responsibility sum is 0.\n\nresponsibilities is an n x K matrix. Empty old_means returns [].",
    starterCode: `def em_mean_update(x, responsibilities, old_means):
    # Your code here
    pass`,
    solution: `def em_mean_update(x, responsibilities, old_means):
    k = len(old_means)
    if k == 0:
        return []
    new_means = []
    for c in range(k):
        num = 0.0
        den = 0.0
        for i in range(len(x)):
            r = responsibilities[i][c]
            num += r * x[i]
            den += r
        if den == 0:
            new_means.append(old_means[c])
        else:
            new_means.append(num / den)
    return new_means`,
    testCases: [
      { input: [[1, 2, 3], [[1.0, 0.0], [0.5, 0.5], [0.0, 1.0]], [0, 0]], expected: [1.3333333333333333, 2.6666666666666665] },
      { input: [[1, 2], [[0.0, 1.0], [0.0, 1.0]], [5, 5]], expected: [5, 1.5] },
      { input: [[1], [[1.0]], [3]], expected: [1.0] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "The new mean is the responsibility-weighted average; an all-zero column leaves the old mean untouched.",
  },
  {
    id: "ml-158",
    title: "Isolation Path Length Factor",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the isolation forest path-length normalization c(n) = 2*H(n-1) - 2*(n-1)/n, where H(m) is the m-th harmonic number.\n\nReturn 0.0 for n <= 1.",
    starterCode: `def isolation_path_factor(n):
    # Your code here
    pass`,
    solution: `def isolation_path_factor(n):
    if n <= 1:
        return 0.0
    h = 0.0
    for i in range(1, n):
        h += 1.0 / i
    return 2.0 * h - 2.0 * (n - 1) / n`,
    testCases: [
      { input: [2], expected: 1.0 },
      { input: [3], expected: 1.6666666666666667 },
      { input: [5], expected: 2.566666666666666 },
      { input: [1], expected: 0.0 },
      { input: [0], expected: 0.0 },
    ],
    hint: "c(n) normalizes the average path length of an unsuccessful search in a binary search tree.",
  },
  {
    id: "ml-159",
    title: "Huber Gradient Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one gradient descent step for the Huber loss with a single weight w. With residuals r_i = w*x_i - y_i, the gradient is mean(x_i * r_i) when |r_i| <= delta and mean(x_i * delta * sign(r_i)) otherwise.\n\nReturn w - lr * gradient; empty X returns w.",
    starterCode: `def huber_gradient_step(X, y, w, delta, lr):
    # Your code here
    pass`,
    solution: `def huber_gradient_step(X, y, w, delta, lr):
    n = len(X)
    if n == 0:
        return w
    grad = 0.0
    for i in range(n):
        r = w * X[i] - y[i]
        if abs(r) <= delta:
            g = r
        else:
            g = delta if r > 0 else -delta
        grad += X[i] * g
    grad /= n
    return w - lr * grad`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6], 2, 1, 0.1], expected: 2.0 },
      { input: [[1], [3], 0, 1, 0.5], expected: 0.5 },
      { input: [[1, 2], [0, 0], 1, 1, 0.1], expected: 0.85 },
      { input: [[], [], 3, 1, 0.1], expected: 3 },
    ],
    hint: "Inside delta the gradient is linear in the residual; outside it is clipped to +/- delta.",
  },
  {
    id: "ml-160",
    title: "Theil-Sen Slope",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Compute the Theil-Sen slope: the median of all pairwise slopes (y_j - y_i) / (x_j - x_i) for i < j with distinct x values (average the two middle slopes for an even count).\n\nReturn 0.0 when no valid pair exists.",
    starterCode: `def theil_sen_slope(X, y):
    # Your code here
    pass`,
    solution: `def theil_sen_slope(X, y):
    slopes = []
    n = len(X)
    for i in range(n):
        for j in range(i + 1, n):
            if X[j] != X[i]:
                slopes.append((y[j] - y[i]) / (X[j] - X[i]))
    if not slopes:
        return 0.0
    slopes.sort()
    m = len(slopes)
    if m % 2 == 1:
        return slopes[m // 2]
    return (slopes[m // 2 - 1] + slopes[m // 2]) / 2.0`,
    testCases: [
      { input: [[1, 2, 3], [2, 4, 6]], expected: 2.0 },
      { input: [[1, 2, 3, 4], [1, 2, 10, 4]], expected: 1.0 },
      { input: [[1, 1, 2], [1, 2, 3]], expected: 1.5 },
      { input: [[5], [3]], expected: 0.0 },
    ],
    hint: "The median of pairwise slopes is robust to outliers, unlike ordinary least squares.",
  },
  {
    id: "ml-161",
    title: "RANSAC Line Inliers",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Run RANSAC iterations to fit a line. Each iteration picks two distinct points with random.seed(seed), counts points whose perpendicular distance to the line is within threshold, and keeps the model with the most inliers (ties keep the earliest).\n\nReturn the sorted inlier indices of the best model. Fewer than two points or iterations <= 0 returns [].",
    starterCode: `import math
import random
def ransac_line_inliers(X, y, seed, threshold, iterations):
    # Your code here
    pass`,
    solution: `import math
import random
def ransac_line_inliers(X, y, seed, threshold, iterations):
    n = len(X)
    if n < 2 or iterations <= 0:
        return []
    random.seed(seed)
    best_inliers = []
    best_count = -1
    for _ in range(iterations):
        i = random.randrange(n)
        j = random.randrange(n - 1)
        if j >= i:
            j += 1
        x1, y1 = X[i], y[i]
        x2, y2 = X[j], y[j]
        denom = math.hypot(x2 - x1, y2 - y1)
        inliers = []
        for k in range(n):
            if denom == 0:
                d = math.hypot(X[k] - x1, y[k] - y1)
            else:
                d = abs((y2 - y1) * (X[k] - x1) - (x2 - x1) * (y[k] - y1)) / denom
            if d <= threshold:
                inliers.append(k)
        if len(inliers) > best_count:
            best_count = len(inliers)
            best_inliers = inliers
    return best_inliers`,
    testCases: [
      { input: [[0, 1, 2, 3, 10], [0, 2, 4, 6, 5], 42, 0.5, 10], expected: [0, 1, 2, 3] },
      { input: [[0, 1, 2, 3, 10], [0, 2, 4, 6, 5], 7, 0.5, 5], expected: [0, 1, 2, 3] },
      { input: [[1, 2], [1, 2], 0, 1.0, 3], expected: [0, 1] },
      { input: [[1], [1], 0, 0.5, 5], expected: [] },
    ],
    hint: "Sample minimal subsets, count consensus, and keep the largest inlier set.",
  },
  {
    id: "ml-162",
    title: "Quadratic Fit via Sums",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Fit y = a + b*x + c*x^2 by least squares using the 3x3 normal equations (built from power sums and solved by Gaussian elimination).\n\nReturn [a, b, c]; fewer than three points or a singular system returns [0.0, 0.0, 0.0].",
    starterCode: `def quadratic_fit(X, y):
    # Returns [a, b, c]
    # Your code here
    pass`,
    solution: `def quadratic_fit(X, y):
    n = len(X)
    if n < 3:
        return [0.0, 0.0, 0.0]
    s1 = sum(X)
    s2 = sum(x * x for x in X)
    s3 = sum(x ** 3 for x in X)
    s4 = sum(x ** 4 for x in X)
    t0 = sum(y)
    t1 = sum(X[i] * y[i] for i in range(n))
    t2 = sum(X[i] * X[i] * y[i] for i in range(n))
    A = [[n, s1, s2, t0], [s1, s2, s3, t1], [s2, s3, s4, t2]]
    for col in range(3):
        pivot = col
        for r in range(col + 1, 3):
            if abs(A[r][col]) > abs(A[pivot][col]):
                pivot = r
        if abs(A[pivot][col]) < 1e-12:
            return [0.0, 0.0, 0.0]
        A[col], A[pivot] = A[pivot], A[col]
        pv = A[col][col]
        for k in range(col, 4):
            A[col][k] /= pv
        for r in range(3):
            if r != col:
                factor = A[r][col]
                for k in range(col, 4):
                    A[r][k] -= factor * A[col][k]
    return [A[0][3], A[1][3], A[2][3]]`,
    testCases: [
      { input: [[0, 1, 2], [1, 6, 17]], expected: [1.0000000000000022, 1.9999999999999671, 3.000000000000017] },
      { input: [[-1, 0, 1, 2], [2, 1, 6, 17]], expected: [1.0, 2.000000000000001, 2.9999999999999996] },
      { input: [[0, 1, 2], [2, 5, 10]], expected: [2.0, 1.9999999999999991, 1.0000000000000004] },
      { input: [[0], [1]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The normal equations are [[n, S1, S2], [S1, S2, S3], [S2, S3, S4]] times [a, b, c] equals [Sy, Sxy, Sx2y].",
  },
  {
    id: "ml-163",
    title: "Regularized Logistic Step",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Perform one gradient descent step for L2-regularized logistic regression without an intercept: w = w - lr * ((1/n) * X^T (sigmoid(Xw) - y) + lam * w).\n\nReturn the new weight list; empty X returns a copy of w.",
    starterCode: `import math
def regularized_logistic_step(X, y, w, lr, lam):
    # Your code here
    pass`,
    solution: `import math
def regularized_logistic_step(X, y, w, lr, lam):
    n = len(X)
    d = len(w)
    if n == 0:
        return list(w)
    preds = []
    for i in range(n):
        z = sum(X[i][j] * w[j] for j in range(d))
        if z >= 0:
            preds.append(1.0 / (1.0 + math.exp(-z)))
        else:
            ez = math.exp(z)
            preds.append(ez / (1.0 + ez))
    new_w = []
    for j in range(d):
        grad = sum(X[i][j] * (preds[i] - y[i]) for i in range(n)) / n + lam * w[j]
        new_w.append(w[j] - lr * grad)
    return new_w`,
    testCases: [
      { input: [[[1], [2]], [0, 1], [0], 0.1, 0.1], expected: [0.025] },
      { input: [[[1], [2]], [1, 1], [0], 0.5, 0], expected: [0.375] },
      { input: [[[1]], [1], [1], 0.1, 0.1], expected: [1.0168941421369995] },
      { input: [[], [], [1, 2], 0.1, 0.1], expected: [1, 2] },
    ],
    hint: "The L2 term contributes lam * w to the gradient, shrinking weights toward zero.",
  },
  {
    id: "ml-164",
    title: "Class-Weighted Log Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute binary cross-entropy with class weights: each sample is weighted by w1 if y = 1 and w0 if y = 0, and the total is divided by the sum of weights.\n\nProbabilities are clipped to [1e-15, 1 - 1e-15]. Empty input or zero total weight returns 0.0.",
    starterCode: `import math
def weighted_log_loss(y_true, y_pred, w0, w1):
    # Your code here
    pass`,
    solution: `import math
def weighted_log_loss(y_true, y_pred, w0, w1):
    if not y_true:
        return 0.0
    total_w = 0.0
    total = 0.0
    for t, p in zip(y_true, y_pred):
        p = min(max(p, 1e-15), 1.0 - 1e-15)
        w = w1 if t == 1 else w0
        total_w += w
        total -= w * (t * math.log(p) + (1 - t) * math.log(1 - p))
    if total_w == 0:
        return 0.0
    return total / total_w`,
    testCases: [
      { input: [[1, 0], [0.9, 0.1], 2, 1], expected: 0.10536051565782628 },
      { input: [[1, 1, 0, 0], [0.5, 0.5, 0.5, 0.5], 1, 1], expected: 0.6931471805599453 },
      { input: [[0, 0], [0.2, 0.8], 1, 3], expected: 0.9162907318741551 },
      { input: [[], [], 1, 1], expected: 0.0 },
    ],
    hint: "Upweighting a class makes errors on that class cost more in the loss.",
  },
  {
    id: "ml-165",
    title: "Focal Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the mean binary focal loss: -alpha_t * (1 - p_t)^gamma * log(p_t), where p_t = p for y = 1 else 1 - p, and alpha_t = alpha for y = 1 else 1 - alpha.\n\nProbabilities are clipped to [1e-15, 1 - 1e-15]. Empty input returns 0.0.",
    starterCode: `import math
def focal_loss(y_true, y_pred, gamma, alpha):
    # Your code here
    pass`,
    solution: `import math
def focal_loss(y_true, y_pred, gamma, alpha):
    if not y_true:
        return 0.0
    total = 0.0
    for t, p in zip(y_true, y_pred):
        p = min(max(p, 1e-15), 1.0 - 1e-15)
        pt = p if t == 1 else 1 - p
        at = alpha if t == 1 else 1 - alpha
        total -= at * (1 - pt) ** gamma * math.log(pt)
    return total / len(y_true)`,
    testCases: [
      { input: [[1, 0], [0.9, 0.9], 2, 0.25], expected: 0.6995419226415137 },
      { input: [[1, 1], [0.6, 0.6], 0, 0.5], expected: 0.25541281188299536 },
      { input: [[0, 1], [0.3, 0.3], 1, 0.5], expected: 0.23744586155244374 },
      { input: [[], [], 2, 0.25], expected: 0.0 },
    ],
    hint: "The (1 - p_t)^gamma factor down-weights easy, well-classified examples.",
  },
  {
    id: "ml-166",
    title: "Label-Smoothed Cross-Entropy",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute label-smoothed cross-entropy: the true class gets probability mass 1 - epsilon + epsilon/K and every other class gets epsilon/K, and the loss is -sum(mass * log(p)).\n\nProbabilities are clipped to at least 1e-15. Return the mean over samples; empty input returns 0.0.",
    starterCode: `import math
def label_smoothed_cross_entropy(y_true, probs, epsilon):
    # Your code here
    pass`,
    solution: `import math
def label_smoothed_cross_entropy(y_true, probs, epsilon):
    if not y_true:
        return 0.0
    total = 0.0
    for t, row in zip(y_true, probs):
        k = len(row)
        true_mass = 1.0 - epsilon + epsilon / k
        other_mass = epsilon / k
        loss = 0.0
        for c in range(k):
            p = min(max(row[c], 1e-15), 1.0)
            mass = true_mass if c == t else other_mass
            loss -= mass * math.log(p)
        total += loss
    return total / len(y_true)`,
    testCases: [
      { input: [[0, 1], [[0.8, 0.2], [0.3, 0.7]], 0.1], expected: 0.34574905316414845 },
      { input: [[0], [[0.9, 0.05, 0.05]], 0.3], expected: 0.6834348672370592 },
      { input: [[1], [[1.0, 0.0]], 0.0], expected: 34.538776394910684 },
      { input: [[], [], 0.1], expected: 0.0 },
    ],
    hint: "Smoothing spreads a little target mass onto every class, penalizing overconfident predictions.",
  },
  {
    id: "ml-167",
    title: "Mixup Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute mixup loss for a pair of samples: mix the probability vectors as lam*probs_a + (1-lam)*probs_b, then return lam*CE(y_a) + (1-lam)*CE(y_b) on the mixed distribution, clipping probabilities to at least 1e-15.\n\nlam is the mixing weight in [0, 1].",
    starterCode: `import math
def mixup_loss(y_a, y_b, probs_a, probs_b, lam):
    # Your code here
    pass`,
    solution: `import math
def mixup_loss(y_a, y_b, probs_a, probs_b, lam):
    mixed = [lam * probs_a[c] + (1 - lam) * probs_b[c] for c in range(len(probs_a))]
    def ce(target, probs):
        p = min(max(probs[target], 1e-15), 1.0)
        return -math.log(p)
    return lam * ce(y_a, mixed) + (1 - lam) * ce(y_b, mixed)`,
    testCases: [
      { input: [0, 1, [0.8, 0.2], [0.1, 0.9], 0.7], expected: 0.6368223552427954 },
      { input: [0, 1, [0.8, 0.2], [0.1, 0.9], 1.0], expected: 0.2231435513142097 },
      { input: [1, 0, [0.3, 0.7], [0.6, 0.4], 0.5], expected: 0.6981723484866961 },
    ],
    hint: "Mix both the inputs (proxied by the probabilities) and the targets with the same lambda.",
  },
  {
    id: "ml-168",
    title: "Distillation Loss",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute knowledge-distillation loss: soften student and teacher logits with softmax(logits / temperature), then return the cross-entropy -sum(teacher_soft * log(student_soft)) with student probabilities clipped to at least 1e-15.\n\nUse a numerically stable softmax.",
    starterCode: `import math
def distillation_loss(student_logits, teacher_logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def distillation_loss(student_logits, teacher_logits, temperature):
    def softmax(logits):
        scaled = [z / temperature for z in logits]
        m = max(scaled)
        exps = [math.exp(s - m) for s in scaled]
        total = sum(exps)
        return [e / total for e in exps]
    ps = softmax(student_logits)
    pt = softmax(teacher_logits)
    loss = 0.0
    for c in range(len(pt)):
        p = min(max(ps[c], 1e-15), 1.0)
        loss -= pt[c] * math.log(p)
    return loss`,
    testCases: [
      { input: [[2, 0], [2, 0], 1], expected: 0.3653338550872077 },
      { input: [[1, 0], [0, 1], 1], expected: 1.0443202661482278 },
      { input: [[1, 0], [0, 1], 2], expected: 0.7853066497810339 },
      { input: [[0, 0], [0, 0], 1], expected: 0.6931471805599453 },
    ],
    hint: "Higher temperature softens the teacher's distribution, exposing dark knowledge.",
  },
  {
    id: "ml-169",
    title: "Contrastive Loss",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the mean contrastive loss over pairs. For similar pairs (label 1) add d^2; for dissimilar pairs (label 0) add max(0, margin - d)^2.\n\nEmpty input returns 0.0.",
    starterCode: `def contrastive_loss(distances, labels, margin):
    # Your code here
    pass`,
    solution: `def contrastive_loss(distances, labels, margin):
    if not distances:
        return 0.0
    total = 0.0
    for d, y in zip(distances, labels):
        if y == 1:
            total += d * d
        else:
            total += max(0.0, margin - d) ** 2
    return total / len(distances)`,
    testCases: [
      { input: [[0.5, 2.0], [1, 0], 1.0], expected: 0.125 },
      { input: [[0.2, 0.2], [1, 0], 1.0], expected: 0.3400000000000001 },
      { input: [[0.5], [1], 1.0], expected: 0.25 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "Similar pairs are pulled together; dissimilar pairs are pushed at least margin apart.",
  },
  {
    id: "ml-170",
    title: "Triplet Loss",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the mean triplet loss over pairs of [d_ap, d_an]: max(0, d_ap - d_an + margin).\n\nEmpty input returns 0.0.",
    starterCode: `def triplet_loss(pairs, margin):
    # Your code here
    pass`,
    solution: `def triplet_loss(pairs, margin):
    if not pairs:
        return 0.0
    return sum(max(0.0, ap - an + margin) for ap, an in pairs) / len(pairs)`,
    testCases: [
      { input: [[[0.2, 0.8], [1.0, 0.5]], 0.3], expected: 0.4 },
      { input: [[[0.1, 0.2], [0.5, 0.1]], 1.0], expected: 1.15 },
      { input: [[[0.0, 0.0]], 0.5], expected: 0.5 },
      { input: [[], 0.5], expected: 0.0 },
    ],
    hint: "The anchor-negative distance must exceed the anchor-positive distance by at least the margin.",
  },
  {
    id: "ml-171",
    title: "Hard Negative Mining",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Return the index of the hardest negative: among samples with label 0, the one with the smallest distance (ties keep the smallest index).\n\nReturn -1 if there is no negative sample.",
    starterCode: `def hard_negative_index(distances, labels):
    # Your code here
    pass`,
    solution: `def hard_negative_index(distances, labels):
    best = -1
    best_d = None
    for i in range(len(distances)):
        if labels[i] == 0:
            if best_d is None or distances[i] < best_d:
                best_d = distances[i]
                best = i
    return best`,
    testCases: [
      { input: [[0.9, 0.2, 0.5, 0.1], [0, 1, 0, 0]], expected: 3 },
      { input: [[0.1, 0.2], [1, 1]], expected: -1 },
      { input: [[0.5, 0.5], [0, 0]], expected: 0 },
    ],
    hint: "The hardest negative is the one that is closest to the anchor.",
  },
  {
    id: "ml-172",
    title: "Expanding Window Mean Forecast",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute expanding-window mean forecasts: for each time step t from initial to n-1, forecast the mean of values[0:t].\n\nReturn [] if initial < 1 or initial >= n.",
    starterCode: `def expanding_window_mean_forecast(values, initial):
    # Your code here
    pass`,
    solution: `def expanding_window_mean_forecast(values, initial):
    n = len(values)
    if initial < 1 or initial >= n:
        return []
    result = []
    for t in range(initial, n):
        result.append(sum(values[:t]) / t)
    return result`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: [2.0, 2.5] },
      { input: [[10, 20], 1], expected: [10.0] },
      { input: [[1, 2], 2], expected: [] },
      { input: [[1, 2], 0], expected: [] },
    ],
    hint: "Each forecast uses only the data available before the predicted time step.",
  },
  {
    id: "ml-173",
    title: "Walk-Forward Window Count",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Count walk-forward windows: starting at initial, count windows while t + horizon <= n and advance t by step.\n\nReturn 0 if step <= 0 or horizon <= 0.",
    starterCode: `def walk_forward_count(n, initial, horizon, step):
    # Your code here
    pass`,
    solution: `def walk_forward_count(n, initial, horizon, step):
    if step <= 0 or horizon <= 0:
        return 0
    count = 0
    t = initial
    while t + horizon <= n:
        count += 1
        t += step
    return count`,
    testCases: [
      { input: [10, 3, 2, 1], expected: 6 },
      { input: [10, 3, 2, 2], expected: 3 },
      { input: [5, 0, 2, 1], expected: 4 },
      { input: [4, 2, 5, 1], expected: 0 },
    ],
    hint: "A window fits whenever its start plus horizon does not exceed the series length.",
  },
  {
    id: "ml-174",
    title: "Population Stability Index",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute the population stability index between expected and actual bin counts: normalize each list, clip each bin share to at least 1e-4, and sum (actual - expected) * ln(actual / expected).\n\nReturn 0.0 if either total is 0.",
    starterCode: `import math
def population_stability_index(expected_counts, actual_counts):
    # Your code here
    pass`,
    solution: `import math
def population_stability_index(expected_counts, actual_counts):
    total_e = sum(expected_counts)
    total_a = sum(actual_counts)
    if total_e == 0 or total_a == 0:
        return 0.0
    psi = 0.0
    for e, a in zip(expected_counts, actual_counts):
        pe = max(e / total_e, 1e-4)
        pa = max(a / total_a, 1e-4)
        psi += (pa - pe) * math.log(pa / pe)
    return psi`,
    testCases: [
      { input: [[20, 30, 50], [10, 30, 60]], expected: 0.08754687373538998 },
      { input: [[50, 50], [0, 100]], expected: 4.60431846666895 },
      { input: [[10, 10], [10, 10]], expected: 0.0 },
    ],
    hint: "PSI is symmetric-ish divergence that grows when the actual distribution drifts from expected.",
  },
  {
    id: "ml-175",
    title: "KS Statistic",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the KS statistic from binned counts: normalize both count lists, accumulate the CDFs, and return the maximum absolute gap between them.\n\nReturn 0.0 if either total is 0.",
    starterCode: `def ks_statistic(expected_counts, actual_counts):
    # Your code here
    pass`,
    solution: `def ks_statistic(expected_counts, actual_counts):
    total_e = sum(expected_counts)
    total_a = sum(actual_counts)
    if total_e == 0 or total_a == 0:
        return 0.0
    ce = 0.0
    ca = 0.0
    best = 0.0
    for e, a in zip(expected_counts, actual_counts):
        ce += e / total_e
        ca += a / total_a
        best = max(best, abs(ce - ca))
    return best`,
    testCases: [
      { input: [[20, 30, 50], [10, 30, 60]], expected: 0.1 },
      { input: [[50, 50], [0, 100]], expected: 0.5 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "The KS statistic is the largest vertical distance between the two empirical CDFs.",
  },
  {
    id: "ml-176",
    title: "Hamming Loss",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Hamming loss for a multilabel matrix: the fraction of entries where y_true and y_pred disagree.\n\nEmpty input returns 0.0.",
    starterCode: `def hamming_loss(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def hamming_loss(y_true, y_pred):
    total = 0
    wrong = 0
    for t_row, p_row in zip(y_true, y_pred):
        for t, p in zip(t_row, p_row):
            total += 1
            if t != p:
                wrong += 1
    if total == 0:
        return 0.0
    return wrong / total`,
    testCases: [
      { input: [[[1, 0, 1], [0, 1, 0]], [[1, 1, 1], [0, 1, 1]]], expected: 0.3333333333333333 },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: 0.0 },
      { input: [[[1, 1]], [[0, 0]]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Count all mismatched label entries and divide by the total number of entries.",
  },
  {
    id: "ml-177",
    title: "Top-2 Margin",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the top-2 margin of each probability row: the largest value minus the second largest (0.0 for rows with fewer than two entries).\n\nReturn the list of margins; empty input returns [].",
    starterCode: `def top2_margin(probs):
    # Your code here
    pass`,
    solution: `def top2_margin(probs):
    result = []
    for row in probs:
        s = sorted(row, reverse=True)
        if len(s) < 2:
            result.append(0.0)
        else:
            result.append(s[0] - s[1])
    return result`,
    testCases: [
      { input: [[[0.7, 0.2, 0.1], [0.5, 0.5, 0.0], [0.3, 0.3, 0.3]]], expected: [0.49999999999999994, 0.0, 0.0] },
      { input: [[[0.9]]], expected: [0.0] },
      { input: [[[0.2, 0.8]]], expected: [0.6000000000000001] },
      { input: [[]], expected: [] },
    ],
    hint: "A small margin means the model is uncertain between the top two classes.",
  },
  {
    id: "ml-178",
    title: "Prediction Agreement Rate",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the fraction of samples where two prediction lists agree.\n\nEmpty input returns 0.0.",
    starterCode: `def agreement_rate(pred_a, pred_b):
    # Your code here
    pass`,
    solution: `def agreement_rate(pred_a, pred_b):
    if not pred_a:
        return 0.0
    return sum(1 for a, b in zip(pred_a, pred_b) if a == b) / len(pred_a)`,
    testCases: [
      { input: [[1, 0, 1], [1, 1, 1]], expected: 0.6666666666666666 },
      { input: [[0, 0], [0, 0]], expected: 1.0 },
      { input: [[1], [0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Agreement rate is the pairwise accuracy between two models.",
  },
  {
    id: "ml-179",
    title: "Ensemble Probability Average",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Average several probability vectors element-wise: given a list of per-model probability vectors for one sample, return their mean vector.\n\nEmpty input returns [].",
    starterCode: `def average_ensemble_probs(prob_lists):
    # Your code here
    pass`,
    solution: `def average_ensemble_probs(prob_lists):
    if not prob_lists:
        return []
    k = len(prob_lists[0])
    return [sum(p[c] for p in prob_lists) / len(prob_lists) for c in range(k)]`,
    testCases: [
      { input: [[[0.2, 0.8], [0.4, 0.6]]], expected: [0.30000000000000004, 0.7] },
      { input: [[[0.1, 0.2, 0.7], [0.3, 0.3, 0.4], [0.5, 0.25, 0.25]]], expected: [0.3, 0.25, 0.45] },
      { input: [[[0.5, 0.5]]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
    ],
    hint: "Average each class probability across all models independently.",
  },
  {
    id: "ml-180",
    title: "Weighted Ensemble Vote",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Weighted majority vote across models per sample. predictions[m][j] is model m's label for sample j and weights[m] is the model weight; for each sample sum the weights per label and pick the largest total.\n\nTies go to the smallest label. Empty predictions returns [].",
    starterCode: `def weighted_ensemble_vote(predictions, weights):
    # Your code here
    pass`,
    solution: `def weighted_ensemble_vote(predictions, weights):
    if not predictions:
        return []
    n = len(predictions[0])
    result = []
    for j in range(n):
        totals = {}
        for m in range(len(predictions)):
            label = predictions[m][j]
            totals[label] = totals.get(label, 0.0) + weights[m]
        best = None
        best_w = -1.0
        for label in sorted(totals.keys()):
            if totals[label] > best_w:
                best_w = totals[label]
                best = label
        result.append(best)
    return result`,
    testCases: [
      { input: [[["a", "b"], ["b", "b"], ["a", "a"]], [1, 2, 1]], expected: ["a", "b"] },
      { input: [[[1, 0, 1], [0, 0, 1]], [3, 1]], expected: [1, 0, 1] },
      { input: [[[2, 1]], [0.5]], expected: [2, 1] },
      { input: [[], []], expected: [] },
    ],
    hint: "Weighted voting lets stronger models dominate the ensemble decision.",
  },
];
