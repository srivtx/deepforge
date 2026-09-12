import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-096",
    title: "Group Soft Threshold",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the group soft-thresholding (group lasso proximal) operator to a coefficient vector.\n\nCompute norm = sqrt(sum(x ** 2)). If norm <= lam, return all zeros; otherwise return every component scaled by 1 - lam / norm.",
    starterCode: `def group_soft_threshold(v, lam):
    # Your code here
    pass`,
    solution: `def group_soft_threshold(v, lam):
    total = 0.0
    for x in v:
        total = total + x * x
    norm = total ** 0.5
    if norm <= lam or norm == 0:
        return [0.0 for _ in v]
    scale = 1 - lam / norm
    return [x * scale for x in v]`,
    testCases: [
      { input: [[3.0, 4.0], 2.0], expected: [1.7999999999999998, 2.4] },
      { input: [[0.3, 0.4], 0.5], expected: [0.0, 0.0] },
      { input: [[0.0, 0.0], 0.1], expected: [0.0, 0.0] },
      { input: [[5.0], 1.0], expected: [4.0] },
    ],
    hint: "Shrink the whole group by a single factor, or zero it out entirely.",
  },
  {
    id: "op-097",
    title: "Perceptron Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply one perceptron update.\n\nIf y * (w dot x) <= 0 the point is misclassified, so return w + lr * y * x elementwise. Otherwise return w unchanged.",
    starterCode: `def perceptron_update(w, x, y, lr):
    # Your code here
    pass`,
    solution: `def perceptron_update(w, x, y, lr):
    dot = 0.0
    for i in range(len(w)):
        dot = dot + w[i] * x[i]
    if y * dot <= 0:
        return [w[i] + lr * y * x[i] for i in range(len(w))]
    return list(w)`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], 1, 0.5], expected: [0.5, 1.0] },
      { input: [[1.0, 1.0], [1.0, 1.0], 1, 0.1], expected: [1.0, 1.0] },
      { input: [[0.5, -0.5], [1.0, 1.0], -1, 0.2], expected: [0.3, -0.7] },
      { input: [[1.0, 2.0], [1.0, 1.0], 1, 0.5], expected: [1.0, 2.0] },
    ],
    hint: "Only update on a mistake; a prediction exactly on the boundary counts as a mistake.",
  },
  {
    id: "op-098",
    title: "Huber IRLS Weight",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Huber IRLS weight for a residual.\n\nReturn 1.0 when abs(residual) <= delta, otherwise delta / abs(residual). Outliers receive a weight that decays like the reciprocal of their residual.",
    starterCode: `def huber_irls_weight(residual, delta):
    # Your code here
    pass`,
    solution: `def huber_irls_weight(residual, delta):
    if abs(residual) <= delta:
        return 1.0
    return delta / abs(residual)`,
    testCases: [
      { input: [0.5, 1.0], expected: 1.0 },
      { input: [2.0, 1.0], expected: 0.5 },
      { input: [-3.0, 2.0], expected: 0.6666666666666666 },
      { input: [0.0, 1.0], expected: 1.0 },
    ],
    hint: "Inliers are weighted fully; outliers are downweighted proportionally.",
  },
  {
    id: "op-099",
    title: "L-BFGS Memory Shift",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Shift an L-BFGS correction history by appending a new pair.\n\nAppend s_new and y_new to the histories, then keep only the m most recent pairs. Return [s_list_new, y_list_new] as two lists of vectors.",
    starterCode: `def lbfgs_memory_shift(s_list, y_list, s_new, y_new, m):
    # Returns [s_list_new, y_list_new]
    # Your code here
    pass`,
    solution: `def lbfgs_memory_shift(s_list, y_list, s_new, y_new, m):
    s2 = list(s_list) + [s_new]
    y2 = list(y_list) + [y_new]
    if m >= 0 and len(s2) > m:
        s2 = s2[len(s2) - m:]
        y2 = y2[len(y2) - m:]
    return [s2, y2]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[2.0, 0.0], [0.0, 2.0]], [1.0, 1.0], [3.0, 3.0], 2], expected: [[[0.0, 1.0], [1.0, 1.0]], [[0.0, 2.0], [3.0, 3.0]]] },
      { input: [[], [], [1.0], [2.0], 3], expected: [[[1.0]], [[2.0]]] },
      { input: [[[1.0]], [[2.0]], [3.0], [4.0], 1], expected: [[[3.0]], [[4.0]]] },
      { input: [[[1.0]], [[2.0]], [3.0], [4.0], 0], expected: [[], []] },
    ],
    hint: "Keep the newest pairs at the end and drop from the front.",
  },
  {
    id: "op-100",
    title: "Adam Epsilon Effect",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compare the two common placements of the Adam epsilon.\n\nBias-correct to m_hat and v_hat, then return [lr * m_hat / (sqrt(v_hat) + eps), lr * m_hat / sqrt(v_hat + eps)]: once with eps outside the square root and once inside it.",
    starterCode: `def adam_epsilon_effect(m, v, t, lr, beta1, beta2, eps):
    # Returns [eps_outside, eps_inside]
    # Your code here
    pass`,
    solution: `def adam_epsilon_effect(m, v, t, lr, beta1, beta2, eps):
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    inside = lr * m_hat / (v_hat ** 0.5 + eps)
    outside = lr * m_hat / ((v_hat + eps) ** 0.5)
    return [inside, outside]`,
    testCases: [
      { input: [0.5, 0.25, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.03162277658168381, 0.03162277660105136] },
      { input: [0.1, 0.01, 5, 0.01, 0.9, 0.999, 1e-4], expected: [0.001724866624462107, 0.0017249454321074265] },
      { input: [-0.3, 0.4, 10, 0.05, 0.8, 0.99, 1e-3], expected: [-0.008212004764114034, -0.008215037972232048] },
    ],
    hint: "Adding eps before the root changes the effective step most when v_hat is tiny.",
  },
  {
    id: "op-101",
    title: "Factorial Effect Estimate 2x2",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Estimate main effects and the interaction from a 2x2 factorial design.\n\nWith y00, y01, y10, y11 the responses for (A low, B low) through (A high, B high), main_a = mean of the A-high runs minus the A-low runs, main_b is the same for B, and the interaction is (y11 - y10) - (y01 - y00). Return [main_a, main_b, inter].",
    starterCode: `def factorial_effect_2x2(y00, y01, y10, y11):
    # Returns [main_a, main_b, inter]
    # Your code here
    pass`,
    solution: `def factorial_effect_2x2(y00, y01, y10, y11):
    main_a = (y10 + y11) / 2 - (y00 + y01) / 2
    main_b = (y01 + y11) / 2 - (y00 + y10) / 2
    inter = (y11 - y10) - (y01 - y00)
    return [main_a, main_b, inter]`,
    testCases: [
      { input: [1.0, 2.0, 3.0, 4.0], expected: [2.0, 1.0, 0.0] },
      { input: [5.0, 3.0, 2.0, 6.0], expected: [0.0, 1.0, 6.0] },
      { input: [0.0, 0.0, 0.0, 1.0], expected: [0.5, 0.5, 1.0] },
    ],
    hint: "The interaction is the difference of the B effects at the two A levels.",
  },
  {
    id: "op-102",
    title: "Response Surface Steepest Path",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take a steepest-ascent step along the gradient direction.\n\nReturn step * grad / ||grad||. If the gradient is the zero vector, return a list of zeros with the same length.",
    starterCode: `def response_surface_steepest(grad, step):
    # Your code here
    pass`,
    solution: `def response_surface_steepest(grad, step):
    total = 0.0
    for g in grad:
        total = total + g * g
    norm = total ** 0.5
    if norm == 0:
        return [0.0 for _ in grad]
    return [step * g / norm for g in grad]`,
    testCases: [
      { input: [[3.0, 4.0], 2.0], expected: [1.2, 1.6] },
      { input: [[1.0, 0.0, 0.0], 5.0], expected: [5.0, 0.0, 0.0] },
      { input: [[0.0, 0.0], 1.0], expected: [0.0, 0.0] },
    ],
    hint: "Normalize the gradient before scaling by the path length.",
  },
  {
    id: "op-103",
    title: "Taguchi Orthogonal Array Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Check whether a design matrix is a balanced orthogonal array.\n\nFor every pair of columns, each combination of their level values must occur exactly rows / (levels_i * levels_j) times. Return True when every pair passes; a matrix with fewer than two columns trivially returns True.",
    starterCode: `def taguchi_orthogonal_check(array):
    # Your code here
    pass`,
    solution: `def taguchi_orthogonal_check(array):
    if not array:
        return True
    rows = len(array)
    cols = len(array[0])
    if rows == 0 or cols < 2:
        return True
    for i in range(cols):
        for j in range(i + 1, cols):
            li = sorted(set(array[r][i] for r in range(rows)))
            lj = sorted(set(array[r][j] for r in range(rows)))
            expected = rows / (len(li) * len(lj))
            for a in li:
                for b in lj:
                    cnt = 0
                    for r in range(rows):
                        if array[r][i] == a and array[r][j] == b:
                            cnt = cnt + 1
                    if cnt != expected:
                        return False
    return True`,
    testCases: [
      { input: [[[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]]], expected: true },
      { input: [[[0, 0], [0, 0], [1, 1], [1, 1]]], expected: false },
      { input: [[[0], [1], [0], [1]]], expected: true },
      { input: [[[0, 0], [0, 1], [1, 0], [1, 1]]], expected: true },
    ],
    hint: "Missing level combinations count as zero occurrences and fail the check.",
  },
  {
    id: "op-104",
    title: "DOE Main Effect",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Estimate the main effect of a two-level factor from experimental data.\n\nReturn mean(response at level 1) - mean(response at level 0). If one of the levels never appears, return 0.0.",
    starterCode: `def doe_main_effect(levels, responses):
    # Your code here
    pass`,
    solution: `def doe_main_effect(levels, responses):
    hi = 0.0
    lo = 0.0
    nh = 0
    nl = 0
    for lv, r in zip(levels, responses):
        if lv == 1:
            hi = hi + r
            nh = nh + 1
        else:
            lo = lo + r
            nl = nl + 1
    if nh == 0 or nl == 0:
        return 0.0
    return hi / nh - lo / nl`,
    testCases: [
      { input: [[0, 0, 1, 1], [1.0, 2.0, 3.0, 5.0]], expected: 2.5 },
      { input: [[1, 0, 1, 0], [4.0, 1.0, 6.0, 3.0]], expected: 3.0 },
      { input: [[0, 0], [2.0, 4.0]], expected: 0.0 },
      { input: [[1, 1], [2.0, 4.0]], expected: 0.0 },
    ],
    hint: "The main effect is a difference of group means.",
  },
  {
    id: "op-105",
    title: "Expert Advice Weighted Average",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Combine expert predictions with a weighted average.\n\nReturn sum(w_i * p_i) / sum(w_i), or 0.0 when the weights sum to zero.",
    starterCode: `def expert_weighted_average(predictions, weights):
    # Your code here
    pass`,
    solution: `def expert_weighted_average(predictions, weights):
    num = 0.0
    den = 0.0
    for p, w in zip(predictions, weights):
        num = num + p * w
        den = den + w
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1.0, 3.0], [1.0, 1.0]], expected: 2.0 },
      { input: [[2.0, 4.0, 6.0], [0.5, 0.25, 0.25]], expected: 3.5 },
      { input: [[5.0, 1.0], [3.0, 1.0]], expected: 4.0 },
      { input: [[1.0, 2.0], [0.0, 0.0]], expected: 0.0 },
    ],
    hint: "This is the exponentially weighted forecaster's prediction.",
  },
  {
    id: "op-106",
    title: "UCB1 Average Reward",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute an arm's average reward and its UCB1 index.\n\nWith n = len(rewards), avg = mean(rewards), and bonus = c * sqrt(log(total + 1) / n), return [avg, avg + bonus]. An empty reward list or a non-positive total returns [0.0, 0.0].",
    starterCode: `def ucb1_average(rewards, total, c):
    # Returns [avg, ucb]
    # Your code here
    pass`,
    solution: `def ucb1_average(rewards, total, c):
    import math
    n = len(rewards)
    if n == 0 or total <= 0:
        return [0.0, 0.0]
    avg = sum(rewards) / n
    bonus = c * math.sqrt(math.log(total + 1) / n)
    return [avg, avg + bonus]`,
    testCases: [
      { input: [[1.0, 0.5, 0.5], 10, 1.0], expected: [0.6666666666666666, 1.5607015788854923] },
      { input: [[2.0], 100, 2.0], expected: [2.0, 6.296566311296154] },
      { input: [[], 5, 1.0], expected: [0.0, 0.0] },
    ],
    hint: "The bonus term grows with log(total) and shrinks with the arm's pull count.",
  },
  {
    id: "op-107",
    title: "MOSS Index",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the MOSS index for an arm.\n\nWith n = len(rewards) and ratio = max(1, total / n), return mean(rewards) + sqrt(c * log(ratio) / n). An empty reward list or a non-positive total returns 0.0.",
    starterCode: `def moss_index(rewards, total, c):
    # Your code here
    pass`,
    solution: `def moss_index(rewards, total, c):
    import math
    n = len(rewards)
    if n == 0 or total <= 0:
        return 0.0
    avg = sum(rewards) / n
    ratio = total / n
    if ratio < 1:
        ratio = 1.0
    return avg + ((c * math.log(ratio)) / n) ** 0.5`,
    testCases: [
      { input: [[1.0, 0.5, 0.5], 30, 2.0], expected: 1.905640729616613 },
      { input: [[2.0], 1, 2.0], expected: 2.0 },
      { input: [[0.0, 1.0], 10, 1.0], expected: 1.3970612889970506 },
    ],
    hint: "The ratio is clamped at 1 so the log is never negative.",
  },
  {
    id: "op-108",
    title: "Stochastic Approximation Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one stochastic approximation step with a decreasing gain.\n\nReturn x - (a / (k + b)) * grad, where k is the iteration index.",
    starterCode: `def stochastic_approximation_step(x, grad, a, b, k):
    # Your code here
    pass`,
    solution: `def stochastic_approximation_step(x, grad, a, b, k):
    step = a / (k + b)
    return x - step * grad`,
    testCases: [
      { input: [1.0, 2.0, 0.5, 1.0, 0], expected: 0.0 },
      { input: [1.0, 2.0, 0.5, 1.0, 4], expected: 0.8 },
      { input: [0.0, -1.0, 1.0, 2.0, 3], expected: 0.2 },
      { input: [2.0, 0.0, 0.1, 1.0, 9], expected: 2.0 },
    ],
    hint: "The gain a / (k + b) must shrink over iterations for convergence.",
  },
  {
    id: "op-109",
    title: "Robbins-Monro Schedule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Evaluate the Robbins-Monro gain at iteration k.\n\nReturn a / (k + c), a classic diminishing step-size sequence for stochastic root finding.",
    starterCode: `def robbins_monro_schedule(a, c, k):
    # Your code here
    pass`,
    solution: `def robbins_monro_schedule(a, c, k):
    return a / (k + c)`,
    testCases: [
      { input: [1.0, 1.0, 0], expected: 1.0 },
      { input: [1.0, 1.0, 9], expected: 0.1 },
      { input: [0.5, 2.0, 3], expected: 0.1 },
      { input: [2.0, 0.0, 4], expected: 0.5 },
    ],
    hint: "The gain is harmonic in k.",
  },
  {
    id: "op-110",
    title: "Population Diversity Metric",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Measure population diversity as the mean per-coordinate standard deviation.\n\nFor each coordinate compute the population standard deviation (dividing by n), then average across coordinates. Return 0.0 for fewer than 2 individuals or an empty population.",
    starterCode: `def population_diversity(population):
    # Your code here
    pass`,
    solution: `def population_diversity(population):
    n = len(population)
    if n < 2:
        return 0.0
    d = len(population[0])
    total = 0.0
    for j in range(d):
        mean = 0.0
        for x in population:
            mean = mean + x[j]
        mean = mean / n
        var = 0.0
        for x in population:
            var = var + (x[j] - mean) ** 2
        total = total + (var / n) ** 0.5
    return total / d`,
    testCases: [
      { input: [[[1.0, 2.0], [1.0, 2.0]]], expected: 0.0 },
      { input: [[[0.0, 0.0], [2.0, 0.0]]], expected: 0.5 },
      { input: [[[0.0, 0.0], [0.0, 2.0], [0.0, 4.0]]], expected: 0.816496580927726 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Compute a standard deviation per coordinate, then average them.",
  },
  {
    id: "op-111",
    title: "Novelty Search Score",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the novelty score of an individual against an archive.\n\nReturn the average Euclidean distance to the k nearest archive points, using all points when the archive holds fewer than k. Return 0.0 for an empty archive or a non-positive k.",
    starterCode: `def novelty_score(individual, archive, k):
    # Your code here
    pass`,
    solution: `def novelty_score(individual, archive, k):
    if not archive or k <= 0:
        return 0.0
    dists = []
    for a in archive:
        total = 0.0
        for i in range(len(individual)):
            total = total + (individual[i] - a[i]) ** 2
        dists.append(total ** 0.5)
    dists.sort()
    m = k
    if m > len(dists):
        m = len(dists)
    return sum(dists[:m]) / m`,
    testCases: [
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 2.0], [3.0, 4.0]], 2], expected: 1.5 },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 2.0], [3.0, 4.0]], 1], expected: 1.0 },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 2.0], [3.0, 4.0]], 10], expected: 2.6666666666666665 },
      { input: [[0.0, 0.0], [], 3], expected: 0.0 },
    ],
    hint: "Sort the distances and average the smallest k.",
  },
  {
    id: "op-112",
    title: "Fused Lasso One Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one proximal step for the fused lasso in 1D.\n\nFirst do a gradient step z_i = x_i - lr * (x_i - y_i), then process i = 1 .. n-1 and replace z_i by z_{i-1} + soft(z_i - z_{i-1}, lr * lam). Return the resulting list.",
    starterCode: `def fused_lasso_step(x, y, lr, lam):
    # Your code here
    pass`,
    solution: `def fused_lasso_step(x, y, lr, lam):
    out = []
    for i in range(len(x)):
        out.append(x[i] - lr * (x[i] - y[i]))
    t = lr * lam
    for i in range(1, len(out)):
        d = out[i] - out[i - 1]
        if d > t:
            out[i] = out[i - 1] + d - t
        elif d < -t:
            out[i] = out[i - 1] + d + t
        else:
            out[i] = out[i - 1]
    return out`,
    testCases: [
      { input: [[0.0, 1.0, 0.0], [0.0, 1.0, 0.0], 0.5, 0.2], expected: [0.0, 0.9, 0.1] },
      { input: [[1.0, 2.0], [0.0, 0.0], 0.1, 0.5], expected: [0.9, 1.75] },
      { input: [[3.0], [3.0], 0.5, 1.0], expected: [3.0] },
    ],
    hint: "Soft threshold each successive difference against lam * lr.",
  },
  {
    id: "op-113",
    title: "Total Variation Denoise One Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one explicit gradient step on the 1D total variation penalty lam * sum(abs(x_{i+1} - x_i)).\n\nThe penalty gradient at x_i is lam * (sign(x_i - x_{i-1}) - sign(x_{i+1} - x_i)), where missing neighbours contribute 0. Return x minus lr times the gradient as a list.",
    starterCode: `def tv_denoise_step(x, lr, lam):
    # Your code here
    pass`,
    solution: `def tv_denoise_step(x, lr, lam):
    n = len(x)
    out = []
    for i in range(n):
        g = 0.0
        if i > 0:
            if x[i] > x[i - 1]:
                g = g + 1.0
            elif x[i] < x[i - 1]:
                g = g - 1.0
        if i < n - 1:
            if x[i + 1] > x[i]:
                g = g - 1.0
            elif x[i + 1] < x[i]:
                g = g + 1.0
        out.append(x[i] - lr * lam * g)
    return out`,
    testCases: [
      { input: [[0.0, 1.0, 3.0], 0.1, 0.5], expected: [0.05, 1.0, 2.95] },
      { input: [[2.0, 1.0, 2.0], 0.2, 1.0], expected: [1.8, 1.4, 1.8] },
      { input: [[1.0], 0.5, 2.0], expected: [1.0] },
      { input: [[0.0, 0.0, 0.0], 0.1, 0.5], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The TV gradient is a difference of neighbouring signs.",
  },
  {
    id: "op-114",
    title: "Sparse Group Lasso Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Apply the sparse group lasso proximal operator to a coefficient vector.\n\nFirst treat the whole vector as a group and soft-threshold it at lam2 (scale by 1 - lam2 / ||x||, or zero it when ||x|| <= lam2). Then apply elementwise soft thresholding at lam1. Return the result.",
    starterCode: `def sparse_group_lasso_step(x, lam1, lam2):
    # Your code here
    pass`,
    solution: `def sparse_group_lasso_step(x, lam1, lam2):
    total = 0.0
    for v in x:
        total = total + v * v
    norm = total ** 0.5
    if norm <= lam2 or norm == 0:
        base = [0.0 for _ in x]
    else:
        scale = 1 - lam2 / norm
        base = [v * scale for v in x]
    out = []
    for v in base:
        if v > lam1:
            out.append(v - lam1)
        elif v < -lam1:
            out.append(v + lam1)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[3.0, 4.0], 0.5, 1.0], expected: [1.9000000000000004, 2.7] },
      { input: [[0.1, 0.2], 0.05, 1.0], expected: [0.0, 0.0] },
      { input: [[10.0, 0.0], 1.0, 2.0], expected: [7.0, 0.0] },
      { input: [[5.0], 6.0, 1.0], expected: [0.0] },
    ],
    hint: "Group shrinkage runs first, then the elementwise L1 shrinkage.",
  },
  {
    id: "op-115",
    title: "NMF Multiplicative Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Run one multiplicative update of the NMF factor H with V of shape n x m, W of shape n x k, and H of shape k x m.\n\nEach H[a][b] is multiplied by (W^T V)[a][b] divided by (W^T W H)[a][b]. Keep the old value when that denominator is not positive. Return the new H as a list of rows.",
    starterCode: `def nmf_multiplicative_update(V, W, H):
    # Your code here
    pass`,
    solution: `def nmf_multiplicative_update(V, W, H):
    n = len(V)
    m = len(V[0])
    k = len(H)
    num = [[0.0] * m for _ in range(k)]
    den = [[0.0] * m for _ in range(k)]
    for a in range(k):
        for b in range(m):
            s = 0.0
            for i in range(n):
                s = s + W[i][a] * V[i][b]
            num[a][b] = s
            d = 0.0
            for i in range(n):
                wh = 0.0
                for kk in range(k):
                    wh = wh + W[i][kk] * H[kk][b]
                d = d + W[i][a] * wh
            den[a][b] = d
    out = []
    for a in range(k):
        row = []
        for b in range(m):
            if den[a][b] <= 0:
                row.append(H[a][b])
            else:
                row.append(H[a][b] * num[a][b] / den[a][b])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0], [1.0]], [[0.5, 0.5]]], expected: [[2.0, 3.0]] },
      { input: [[[2.0, 1.0], [1.0, 2.0]], [[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [0.5, 0.5]]], expected: [[2.0, 1.0], [1.0, 2.0]] },
      { input: [[[1.0, 2.0], [2.0, 1.0]], [[1.0], [2.0]], [[0.5, 0.5]]], expected: [[1.0, 0.8]] },
    ],
    hint: "The ratio W^T V over W^T W H keeps H non-negative when W and V are non-negative.",
  },
  {
    id: "op-116",
    title: "Alternating Least Squares Scalar Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one alternating-least-squares step for a scalar latent factor.\n\nGiven user factors U and ratings r, return sum(u_i * r_i) / (sum(u_i ** 2) + lam). An empty input with zero lam returns 0.0.",
    starterCode: `def als_scalar_step(U, r, lam):
    # Your code here
    pass`,
    solution: `def als_scalar_step(U, r, lam):
    num = 0.0
    den = 0.0
    for u, ri in zip(U, r):
        num = num + u * ri
        den = den + u * u
    if den + lam == 0:
        return 0.0
    return num / (den + lam)`,
    testCases: [
      { input: [[1.0, 2.0], [2.0, 4.0], 0.0], expected: 2.0 },
      { input: [[1.0, 2.0], [2.0, 4.0], 5.0], expected: 1.0 },
      { input: [[1.0, -1.0], [3.0, 1.0], 1.0], expected: 0.6666666666666666 },
      { input: [[], [], 0.5], expected: 0.0 },
    ],
    hint: "This is ridge regression with a single feature, solved in closed form.",
  },
  {
    id: "op-117",
    title: "SVM Dual Coordinate Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one projected coordinate step on the SVM dual.\n\nCompute grad = 1 - y[j] * sum_i(alpha[i] * y[i] * K[i][j]), then set alpha[j] to alpha[j] - lr * grad clipped into [0, C]. Return the updated alpha list.",
    starterCode: `def svm_dual_coordinate_step(alpha, y, K, j, C, lr):
    # Your code here
    pass`,
    solution: `def svm_dual_coordinate_step(alpha, y, K, j, C, lr):
    n = len(alpha)
    s = 0.0
    for i in range(n):
        s = s + alpha[i] * y[i] * K[i][j]
    grad = 1 - y[j] * s
    a = alpha[j] - lr * grad
    if a < 0:
        a = 0.0
    if a > C:
        a = C
    out = list(alpha)
    out[j] = a
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [1, -1], [[1.0, 0.5], [0.5, 1.0]], 0, 1.0, 0.5], expected: [0.0, 0.0] },
      { input: [[0.5, 0.5], [1, 1], [[2.0, 0.0], [0.0, 2.0]], 1, 1.0, 0.5], expected: [0.5, 0.5] },
      { input: [[1.0, 0.2], [1, -1], [[1.0, 0.0], [0.0, 1.0]], 1, 0.5, 1.0], expected: [1.0, 0.0] },
    ],
    hint: "Clip the updated multiplier into the box [0, C].",
  },
  {
    id: "op-118",
    title: "Pegasos SVM Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one Pegasos stochastic subgradient step for an SVM.\n\nFirst shrink w by the factor (1 - eta * lam). If y * (w dot x) < 1, also add eta * y * x. Return the new weight vector.",
    starterCode: `def pegasos_step(w, x, y, lam, eta):
    # Your code here
    pass`,
    solution: `def pegasos_step(w, x, y, lam, eta):
    dot = 0.0
    for i in range(len(w)):
        dot = dot + w[i] * x[i]
    factor = 1 - eta * lam
    out = [factor * w[i] for i in range(len(w))]
    if y * dot < 1:
        out = [out[i] + eta * y * x[i] for i in range(len(w))]
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], 1, 0.1, 0.1], expected: [0.1, 0.2] },
      { input: [[1.0, 1.0], [1.0, 1.0], 1, 0.1, 0.5], expected: [0.95, 0.95] },
      { input: [[0.5, -0.5], [1.0, 2.0], -1, 0.2, 0.1], expected: [0.39, -0.69] },
    ],
    hint: "The loss is the hinge function max(0, 1 - y * (w dot x)).",
  },
  {
    id: "op-119",
    title: "Passive-Aggressive Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one passive-aggressive update.\n\nWith margin loss = 1 - y * (w dot x), return w unchanged when the loss is non-positive. Otherwise return w + tau * y * x with tau = loss / (||x|| ** 2 + 1 / (2C)).",
    starterCode: `def passive_aggressive_update(w, x, y, C):
    # Your code here
    pass`,
    solution: `def passive_aggressive_update(w, x, y, C):
    dot = 0.0
    xsq = 0.0
    for i in range(len(w)):
        dot = dot + w[i] * x[i]
        xsq = xsq + x[i] * x[i]
    loss = 1 - y * dot
    if loss <= 0:
        return list(w)
    tau = loss / (xsq + 1.0 / (2.0 * C))
    return [w[i] + tau * y * x[i] for i in range(len(w))]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 1.0], 1, 1.0], expected: [0.4, 0.4] },
      { input: [[1.0, 1.0], [1.0, 1.0], 1, 0.5], expected: [1.0, 1.0] },
      { input: [[0.2, -0.2], [1.0, 2.0], -1, 2.0], expected: [0.047619047619047616, -0.5047619047619047] },
    ],
    hint: "The step size tau adapts to the feature norm and the aggressiveness C.",
  },
  {
    id: "op-120",
    title: "Logistic Coordinate Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one gradient step for logistic regression on a single feature.\n\nWith p = 1 / (1 + exp(-w * x)) and grad = (p - y) * x, return w - lr * grad. The label y is 0 or 1.",
    starterCode: `def logistic_coordinate_step(w, x, y, lr):
    # Your code here
    pass`,
    solution: `def logistic_coordinate_step(w, x, y, lr):
    import math
    z = w * x
    p = 1.0 / (1.0 + math.exp(-z))
    grad = (p - y) * x
    return w - lr * grad`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 0.5], expected: 0.25 },
      { input: [1.0, 2.0, 0.0, 0.1], expected: 0.8238405844044235 },
      { input: [-1.0, 1.0, 1.0, 0.2], expected: -0.853788284273999 },
      { input: [0.5, 0.0, 1.0, 0.5], expected: 0.5 },
    ],
    hint: "The logistic gradient is (p - y) * x.",
  },
  {
    id: "op-121",
    title: "IRLS One Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Run one IRLS (Fisher scoring) step for logistic regression.\n\nFor each observation compute p_i = sigmoid(w * x_i), weight W_i = p_i * (1 - p_i), and working response z_i = w * x_i + (y_i - p_i) / W_i. Return sum(W_i * x_i * z_i) / sum(W_i * x_i ** 2); skip zero-weight observations and return w when the denominator is zero.",
    starterCode: `def irls_step(w, X, y):
    # Your code here
    pass`,
    solution: `def irls_step(w, X, y):
    import math
    num = 0.0
    den = 0.0
    for xi, yi in zip(X, y):
        z0 = w * xi
        p = 1.0 / (1.0 + math.exp(-z0))
        wt = p * (1 - p)
        if wt == 0:
            continue
        resp = z0 + (yi - p) / wt
        num = num + wt * xi * resp
        den = den + wt * xi * xi
    if den == 0:
        return w
    return num / den`,
    testCases: [
      { input: [0.0, [1.0, 2.0], [1.0, 1.0]], expected: 1.2 },
      { input: [0.5, [1.0, 2.0, 3.0], [1.0, 0.0, 1.0]], expected: 0.2726936091248113 },
      { input: [1.0, [1.0], [0.0]], expected: -2.7182818284590455 },
    ],
    hint: "IRLS reweights each observation by the logistic variance p(1 - p).",
  },
  {
    id: "op-122",
    title: "Poisson Regression IRLS Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Run one IRLS step for Poisson regression with a log link.\n\nFor each observation compute mu_i = exp(w * x_i), working response z_i = w * x_i + (y_i - mu_i) / mu_i, and weight W_i = mu_i. Return sum(W_i * x_i * z_i) / sum(W_i * x_i ** 2), or w when the denominator is zero.",
    starterCode: `def poisson_irls_step(w, X, y):
    # Your code here
    pass`,
    solution: `def poisson_irls_step(w, X, y):
    import math
    num = 0.0
    den = 0.0
    for xi, yi in zip(X, y):
        z0 = w * xi
        mu = math.exp(z0)
        if mu <= 0:
            continue
        resp = z0 + (yi - mu) / mu
        num = num + mu * xi * resp
        den = den + mu * xi * xi
    if den == 0:
        return w
    return num / den`,
    testCases: [
      { input: [0.0, [1.0, 2.0], [1.0, 2.0]], expected: 0.4 },
      { input: [0.5, [1.0, 2.0], [1.0, 3.0]], expected: 0.49318911045422326 },
      { input: [-1.0, [1.0], [1.0]], expected: 0.7182818284590451 },
    ],
    hint: "For a log link the IRLS weights equal the Poisson means.",
  },
  {
    id: "op-123",
    title: "Quantile Regression ADMM Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one ADMM iteration for 1D quantile regression with quantile q.\n\nThe x update is (a_val + rho * (z - u)) / (1 + rho). The z update applies an asymmetric soft threshold to v = x + u with thresholds lam * q / rho above and lam * (1 - q) / rho below. Then u = u + x - z. Return [x, z, u].",
    starterCode: `def quantile_admm_step(x, z, u, a_val, q, lam, rho):
    # Returns [x, z, u]
    # Your code here
    pass`,
    solution: `def quantile_admm_step(x, z, u, a_val, q, lam, rho):
    x = (a_val + rho * (z - u)) / (1 + rho)
    v = x + u
    t_pos = lam * q / rho
    t_neg = lam * (1 - q) / rho
    if v > t_pos:
        z = v - t_pos
    elif v < -t_neg:
        z = v + t_neg
    else:
        z = 0.0
    u = u + x - z
    return [x, z, u]`,
    testCases: [
      { input: [0.0, 0.0, 0.0, 3.0, 0.5, 0.6, 1.0], expected: [1.5, 1.2, 0.30000000000000004] },
      { input: [1.0, 0.0, 0.0, 2.0, 0.9, 0.2, 2.0], expected: [0.6666666666666666, 0.5766666666666667, 0.08999999999999997] },
      { input: [0.0, 0.5, 0.2, -1.0, 0.5, 1.0, 0.5], expected: [-0.5666666666666667, 0.0, -0.36666666666666664] },
    ],
    hint: "The pinball loss prox shrinks positive and negative sides by different amounts.",
  },
  {
    id: "op-124",
    title: "Fletcher-Reeves CG Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one nonlinear conjugate gradient step with the Fletcher-Reeves formula.\n\nCompute beta = (grad dot grad) / (grad_old dot grad_old), set the new direction p = -grad + beta * p_old, and return [x + lr * p, p]. Use beta = 0 when the old gradient is zero.",
    starterCode: `def fletcher_reeves_step(x, grad, p_old, grad_old, lr):
    # Returns [x_new, p_new]
    # Your code here
    pass`,
    solution: `def fletcher_reeves_step(x, grad, p_old, grad_old, lr):
    gg = 0.0
    gogo = 0.0
    for i in range(len(grad)):
        gg = gg + grad[i] * grad[i]
        gogo = gogo + grad_old[i] * grad_old[i]
    if gogo == 0:
        beta = 0.0
    else:
        beta = gg / gogo
    p = [-grad[i] + beta * p_old[i] for i in range(len(grad))]
    x_new = [x[i] + lr * p[i] for i in range(len(x))]
    return [x_new, p]`,
    testCases: [
      { input: [[1.0, 1.0], [1.0, 0.0], [-1.0, 0.0], [1.0, 1.0], 0.1], expected: [[0.85, 1.0], [-1.5, 0.0]] },
      { input: [[0.0, 0.0], [2.0, -2.0], [1.0, 1.0], [1.0, 1.0], 0.5], expected: [[1.0, 3.0], [2.0, 6.0]] },
      { input: [[1.0, 2.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], 1.0], expected: [[1.0, 2.0], [0.0, 0.0]] },
    ],
    hint: "Fletcher-Reeves resets the momentum when the previous gradient is zero.",
  },
  {
    id: "op-125",
    title: "AdaBelief Belief Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one AdaBelief update on a scalar parameter.\n\nUpdate m = beta1 * m + (1 - beta1) * g and s = beta2 * s + (1 - beta2) * (g - m) ** 2 + eps, bias-correct both, then set x = x - lr * m_hat / (sqrt(s_hat) + eps). Return [x, m, s].",
    starterCode: `def adabelief_update(x, m, s, g, t, lr, beta1, beta2, eps):
    # Returns [x, m, s]
    # Your code here
    pass`,
    solution: `def adabelief_update(x, m, s, g, t, lr, beta1, beta2, eps):
    m = beta1 * m + (1 - beta1) * g
    s = beta2 * s + (1 - beta2) * (g - m) ** 2 + eps
    m_hat = m / (1 - beta1 ** t)
    s_hat = s / (1 - beta2 ** t)
    x = x - lr * m_hat / (s_hat ** 0.5 + eps)
    return [x, m, s]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.8888916347405214, 0.04999999999999999, 0.0002025100000000002] },
      { input: [1.0, 0.1, 0.01, 0.5, 5, 0.01, 0.9, 0.999, 1e-8], expected: [0.9975993306863485, 0.14, 0.010119610000000001] },
      { input: [-2.0, -0.3, 0.4, 1.2, 10, 0.05, 0.8, 0.99, 1e-8], expected: [-2.0, -5.551115123125783e-17, 0.41040001000000004] },
    ],
    hint: "The belief variance tracks the surprise (g - m) squared, not g squared.",
  },
  {
    id: "op-126",
    title: "Yogi Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Yogi update on a scalar parameter.\n\nUpdate m as usual, then update v with v - (1 - beta2) * g ** 2 when v - g ** 2 > 0, otherwise v + (1 - beta2) * g ** 2. Bias-correct both moments and set x = x - lr * m_hat / (sqrt(v_hat) + eps). Return [x, m, v].",
    starterCode: `def yogi_update(x, m, v, g, t, lr, beta1, beta2, eps):
    # Returns [x, m, v]
    # Your code here
    pass`,
    solution: `def yogi_update(x, m, v, g, t, lr, beta1, beta2, eps):
    m = beta1 * m + (1 - beta1) * g
    gg = g * g
    if v - gg > 0:
        v = v - (1 - beta2) * gg
    else:
        v = v + (1 - beta2) * gg
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    x = x - lr * m_hat / (v_hat ** 0.5 + eps)
    return [x, m, v]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.900000002, 0.04999999999999999, 0.0002500000000000002] },
      { input: [1.0, 0.1, 0.01, 0.5, 5, 0.01, 0.9, 0.999, 1e-8], expected: [0.997614648985986, 0.14, 0.01025] },
      { input: [-2.0, -0.3, 0.4, 1.2, 10, 0.05, 0.8, 0.99, 1e-8], expected: [-2.0, -5.551115123125783e-17, 0.41440000000000005] },
    ],
    hint: "Yogi replaces the squared-gradient accumulation with a sign-based update.",
  },
  {
    id: "op-127",
    title: "LAMB Layerwise Scaling",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one LAMB update on a scalar parameter.\n\nBuild the Adam-style update m_hat / (sqrt(v_hat) + eps) + weight_decay * w, then multiply it by the trust ratio ||w|| / ||update|| (1.0 when either norm is zero). Return [w - lr * ratio * update, ratio].",
    starterCode: `def lamb_update(w, m, v, g, t, lr, beta1, beta2, eps, weight_decay):
    # Returns [w_new, ratio]
    # Your code here
    pass`,
    solution: `def lamb_update(w, m, v, g, t, lr, beta1, beta2, eps, weight_decay):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    update = m_hat / (v_hat ** 0.5 + eps) + weight_decay * w
    wn = (w * w) ** 0.5
    un = (update * update) ** 0.5
    if wn > 0 and un > 0:
        ratio = wn / un
    else:
        ratio = 1.0
    w_new = w - lr * ratio * update
    return [w_new, ratio]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8, 0.01], expected: [0.9, 0.9900990295069111] },
      { input: [0.5, 0.1, 0.01, 0.5, 5, 0.01, 0.9, 0.999, 1e-8, 0.0], expected: [0.495, 2.0951048089323248] },
      { input: [0.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8, 0.0], expected: [-0.09999999800000003, 1.0] },
    ],
    hint: "The trust ratio equalizes the update magnitude across layers.",
  },
  {
    id: "op-128",
    title: "LARS Trust Ratio",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the LARS trust ratio for a weight vector and an update.\n\nReturn ||w|| / (||update|| + eps). This scales the update so its norm matches the weight norm.",
    starterCode: `def lars_trust_ratio(w, update, eps):
    # Your code here
    pass`,
    solution: `def lars_trust_ratio(w, update, eps):
    wn = 0.0
    un = 0.0
    for i in range(len(w)):
        wn = wn + w[i] * w[i]
        un = un + update[i] * update[i]
    return (wn ** 0.5) / (un ** 0.5 + eps)`,
    testCases: [
      { input: [[3.0, 4.0], [1.0, 0.0], 1e-8], expected: 4.999999950000001 },
      { input: [[1.0, 1.0], [2.0, 2.0], 0.0], expected: 0.5 },
      { input: [[0.0, 0.0], [1.0, 1.0], 1e-8], expected: 0.0 },
    ],
    hint: "eps keeps the ratio finite when the update is the zero vector.",
  },
  {
    id: "op-129",
    title: "NovoGrad Second Moment",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one NovoGrad update on a scalar parameter.\n\nUpdate m = beta1 * m + (1 - beta1) * g and the scalar second moment v = beta2 * v + (1 - beta2) * g ** 2, then return [w - lr * m / (sqrt(v) + eps), m, v]. NovoGrad uses the gradient norm rather than its square as the second moment.",
    starterCode: `def novograd_update(w, m, v, g, lr, beta1, beta2, eps):
    # Returns [w_new, m, v]
    # Your code here
    pass`,
    solution: `def novograd_update(w, m, v, g, lr, beta1, beta2, eps):
    m = beta1 * m + (1 - beta1) * g
    gg = g * g
    v = beta2 * v + (1 - beta2) * gg
    return [w - lr * m / (v ** 0.5 + eps), m, v]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 0.1, 0.9, 0.999, 1e-8], expected: [0.6837724339830358, 0.04999999999999999, 0.0002500000000000002] },
      { input: [1.0, 0.1, 0.01, 0.5, 0.01, 0.9, 0.999, 1e-8], expected: [0.9861650366039507, 0.14, 0.01024] },
      { input: [-2.0, -0.3, 0.4, 1.2, 0.05, 0.8, 0.99, 1e-8], expected: [-2.0, -5.551115123125783e-17, 0.41040000000000004] },
    ],
    hint: "Without bias correction the first step is scaled by sqrt(0.001).",
  },
  {
    id: "op-130",
    title: "SM3 Memory Sketch Lite",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one SM3-style update with a fixed coordinate subset.\n\nFor each index in subset, replace acc[i] with min(acc[i], g[i] ** 2). Then update w[i] = w[i] - lr * g[i] / (sqrt(acc[i]) + eps) when acc[i] > 0, otherwise w[i] - lr * g[i]. Return [w_new, acc_new].",
    starterCode: `def sm3_update(w, g, acc, lr, eps, subset):
    # Returns [w_new, acc_new]
    # Your code here
    pass`,
    solution: `def sm3_update(w, g, acc, lr, eps, subset):
    new_w = []
    new_acc = list(acc)
    for i in range(len(w)):
        if i in subset:
            if g[i] * g[i] < new_acc[i]:
                new_acc[i] = g[i] * g[i]
        if new_acc[i] > 0:
            new_w.append(w[i] - lr * g[i] / (new_acc[i] ** 0.5 + eps))
        else:
            new_w.append(w[i] - lr * g[i])
    return [new_w, new_acc]`,
    testCases: [
      { input: [[1.0, 1.0], [0.5, 2.0], [1.0, 1.0], 0.1, 1e-8, [0, 1]], expected: [[0.900000002, 0.800000002], [0.25, 1.0]] },
      { input: [[1.0, 1.0], [0.5, 2.0], [0.1, 4.0], 0.1, 1e-8, [0]], expected: [[0.8418861219915809, 0.9000000005], [0.1, 4.0]] },
      { input: [[0.0], [3.0], [0.0], 0.5, 1e-8, [0]], expected: [[-1.5], [0.0]] },
    ],
    hint: "Only the selected coordinates refresh their accumulator.",
  },
  {
    id: "op-131",
    title: "Adafactor Factored Second Moment",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Adafactor update with factored second moments on a 2D parameter.\n\nrow_i = beta2 * row_i + (1 - beta2) * mean_j(g_ij ** 2) and col_j = beta2 * col_j + (1 - beta2) * mean_i(g_ij ** 2); the per-entry variance is row_i * col_j. Return [w_new, row_new, col_new] with w_ij -= lr * g_ij / (sqrt(row_i * col_j) + eps).",
    starterCode: `def adafactor_update(w, g, row, col, lr, beta2, eps):
    # Returns [w_new, row_new, col_new]
    # Your code here
    pass`,
    solution: `def adafactor_update(w, g, row, col, lr, beta2, eps):
    nrows = len(w)
    ncols = len(w[0])
    new_row = []
    for i in range(nrows):
        s = 0.0
        for j in range(ncols):
            s = s + g[i][j] * g[i][j]
        new_row.append(beta2 * row[i] + (1 - beta2) * s / ncols)
    new_col = []
    for j in range(ncols):
        s = 0.0
        for i in range(nrows):
            s = s + g[i][j] * g[i][j]
        new_col.append(beta2 * col[j] + (1 - beta2) * s / nrows)
    new_w = []
    for i in range(nrows):
        r = []
        for j in range(ncols):
            v = new_row[i] * new_col[j]
            r.append(w[i][j] - lr * g[i][j] / (v ** 0.5 + eps))
        new_w.append(r)
    return [new_w, new_row, new_col]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.5], [0.5, 0.5]], [1.0, 1.0], [1.0, 1.0], 0.1, 0.9, 1e-8], expected: [[[0.945945946530314, 1.9459459465303142], [2.945945946530314, 3.945945946530314]], [0.925, 0.925], [0.925, 0.925]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 2.0], [3.0, 4.0]], [0.0, 0.0], [0.0, 0.0], 0.05, 0.0, 1e-8], expected: [[[0.9858578644162691, -0.01999999996], [-0.01897366593701028, 0.9821114561960017]], [2.5, 12.5], [5.0, 10.0]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, -0.5], [1.0, 0.0]], [1.0, 1.0], [1.0, 1.0], 0.1, 0.5, 1e-8], expected: [[[0.929835359440053, 0.08432740284893459], [-0.1281025214030441, 1.0]], [0.625, 0.75], [0.8125, 0.5625]] },
    ],
    hint: "The outer product of row and column moments approximates the full second-moment matrix.",
  },
  {
    id: "op-132",
    title: "Trust-Region Newton 1D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take a trust-region-clipped Newton step in 1D.\n\nWhen hess > 0 the step is -grad / hess clipped to [-radius, radius]. When hess <= 0 move against the gradient by radius, or use delta = 0 when grad is 0. Return [x + delta, delta].",
    starterCode: `def trust_region_newton_1d(x, grad, hess, radius):
    # Returns [x_new, delta]
    # Your code here
    pass`,
    solution: `def trust_region_newton_1d(x, grad, hess, radius):
    if hess <= 0:
        if grad > 0:
            delta = -radius
        elif grad < 0:
            delta = radius
        else:
            delta = 0.0
    else:
        delta = -grad / hess
        if delta > radius:
            delta = radius
        if delta < -radius:
            delta = -radius
    return [x + delta, delta]`,
    testCases: [
      { input: [1.0, 2.0, 4.0, 10.0], expected: [0.5, -0.5] },
      { input: [1.0, 8.0, 2.0, 2.0], expected: [-1.0, -2.0] },
      { input: [0.0, -3.0, -1.0, 1.0], expected: [1.0, 1.0] },
      { input: [1.0, 0.0, 0.0, 1.0], expected: [1.0, 0.0] },
    ],
    hint: "Negative curvature means the quadratic is unbounded below; walk to the trust boundary.",
  },
  {
    id: "op-133",
    title: "Dogleg Step Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the dogleg step for a 2D quadratic with diagonal Hessian diag(b0, b1).\n\nThe Newton point is pB = -g / diag(b0, b1). If ||pB|| <= radius use it. Otherwise compute the Cauchy point pU = -(g dot g / g dot B g) * g; if ||pU|| >= radius scale it to the boundary, else find the positive tau with ||pU + tau * (pB - pU)|| = radius and return that point. Return the step as a two-element list.",
    starterCode: `def dogleg_step_lite(g, b0, b1, radius):
    # Your code here
    pass`,
    solution: `def dogleg_step_lite(g, b0, b1, radius):
    pB0 = -g[0] / b0 if b0 > 0 else 0.0
    pB1 = -g[1] / b1 if b1 > 0 else 0.0
    nB = (pB0 * pB0 + pB1 * pB1) ** 0.5
    if nB <= radius:
        return [pB0, pB1]
    gBg = b0 * g[0] * g[0] + b1 * g[1] * g[1]
    if gBg <= 0:
        alpha = 0.0
    else:
        alpha = (g[0] * g[0] + g[1] * g[1]) / gBg
    pU0 = -alpha * g[0]
    pU1 = -alpha * g[1]
    nU = (pU0 * pU0 + pU1 * pU1) ** 0.5
    if nU >= radius:
        if nU == 0:
            return [0.0, 0.0]
        return [pU0 * radius / nU, pU1 * radius / nU]
    d0 = pB0 - pU0
    d1 = pB1 - pU1
    a = d0 * d0 + d1 * d1
    b = 2 * (pU0 * d0 + pU1 * d1)
    c = pU0 * pU0 + pU1 * pU1 - radius * radius
    disc = b * b - 4 * a * c
    if disc < 0:
        disc = 0.0
    tau = (-b + disc ** 0.5) / (2 * a)
    return [pU0 + tau * d0, pU1 + tau * d1]`,
    testCases: [
      { input: [[0.5, 0.5], 1.0, 1.0, 10.0], expected: [-0.5, -0.5] },
      { input: [[4.0, 3.0], 1.0, 1.0, 1.0], expected: [-0.8, -0.6] },
      { input: [[10.0, 10.0], 1.0, 1.0, 0.5], expected: [-0.35355339059327373, -0.35355339059327373] },
      { input: [[6.0, 0.0], 2.0, 3.0, 1.0], expected: [-1.0, -0.0] },
    ],
    hint: "The dogleg path runs from the origin to the Cauchy point to the Newton point.",
  },
  {
    id: "op-134",
    title: "SMO Pair Update Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform the SMO update of a pair of SVM dual variables.\n\nFor y_i != y_j, L = max(0, a_j - a_i) and H = min(C, C + a_j - a_i); otherwise L = max(0, a_i + a_j - C) and H = min(C, a_i + a_j). Set a_j_new = clip(a_j + y_j * (E_i - E_j) / eta, L, H) and a_i_new = a_i + y_i * y_j * (a_j - a_j_new). Return [a_i_new, a_j_new].",
    starterCode: `def smo_pair_update(a_i, a_j, y_i, y_j, E_i, E_j, eta, C):
    # Returns [a_i_new, a_j_new]
    # Your code here
    pass`,
    solution: `def smo_pair_update(a_i, a_j, y_i, y_j, E_i, E_j, eta, C):
    if y_i != y_j:
        L = a_j - a_i
        if L < 0:
            L = 0.0
        H = C + a_j - a_i
        if H > C:
            H = C
    else:
        L = a_i + a_j - C
        if L < 0:
            L = 0.0
        H = a_i + a_j
        if H > C:
            H = C
    a_j_new = a_j + y_j * (E_i - E_j) / eta
    if a_j_new > H:
        a_j_new = H
    if a_j_new < L:
        a_j_new = L
    a_i_new = a_i + y_i * y_j * (a_j - a_j_new)
    return [a_i_new, a_j_new]`,
    testCases: [
      { input: [0.2, 0.3, 1, -1, 0.5, -0.2, 2.0, 1.0], expected: [0.0, 0.09999999999999998] },
      { input: [0.5, 0.5, 1, 1, 0.4, 0.1, 1.0, 1.0], expected: [0.19999999999999996, 0.8] },
      { input: [0.9, 0.9, 1, 1, 1.0, 0.0, 0.5, 1.0], expected: [0.8, 1.0] },
      { input: [0.2, 0.6, 1, -1, 0.1, 0.05, 2.0, 1.0], expected: [0.175, 0.575] },
    ],
    hint: "The box constraints keep the updated multipliers feasible for the equality constraint.",
  },
  {
    id: "op-135",
    title: "Shampoo Preconditioner One Block",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one Shampoo update with diagonal preconditioners.\n\nAccumulate L_i = L_i + sum_j(g_ij ** 2) and R_j = R_j + sum_i(g_ij ** 2), then update w_ij -= lr * g_ij / (L_i ** 0.25 * R_j ** 0.25 + eps). Return [w_new, L_new, R_new].",
    starterCode: `def shampoo_step(w, g, L, R, lr, eps):
    # Returns [w_new, L_new, R_new]
    # Your code here
    pass`,
    solution: `def shampoo_step(w, g, L, R, lr, eps):
    nrows = len(w)
    ncols = len(w[0])
    new_L = list(L)
    for i in range(nrows):
        s = 0.0
        for j in range(ncols):
            s = s + g[i][j] * g[i][j]
        new_L[i] = L[i] + s
    new_R = list(R)
    for j in range(ncols):
        s = 0.0
        for i in range(nrows):
            s = s + g[i][j] * g[i][j]
        new_R[j] = R[j] + s
    new_w = []
    for i in range(nrows):
        row = []
        for j in range(ncols):
            p = (new_L[i] ** 0.25) * (new_R[j] ** 0.25) + eps
            row.append(w[i][j] - lr * g[i][j] / p)
        new_w.append(row)
    return [new_w, new_L, new_R]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.5], [0.5, 0.5]], [1.0, 1.0], [1.0, 1.0], 0.1, 1e-8], expected: [[[0.959175171286947, 1.959175171286947], [2.959175171286947, 3.959175171286947]], [1.5, 1.5], [1.5, 1.5]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[1.0, 2.0], [3.0, 4.0]], [0.0, 0.0], [0.0, 0.0], 0.5, 1e-8], expected: [[[-0.1880301539472129, -0.31622776501683797], [-0.3772300279561973, -0.42294850448179844]], [5.0, 25.0], [10.0, 20.0]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0], [0.0, 0.0], 0.1, 1e-8], expected: [[[0.900000001, 1.0], [1.0, 0.900000001]], [1.0, 1.0], [1.0, 1.0]] },
    ],
    hint: "The fourth root of each accumulated row and column scale is the preconditioner.",
  },
  {
    id: "op-136",
    title: "Natural Gradient Fisher Diagonal",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one natural gradient step for a Gaussian model with parameters x = [mu, log_sigma].\n\nThe diagonal Fisher information is [1 / sigma ** 2, 2] with sigma = exp(x[1]). Return [x_0 - lr * grad_0 / f_0, x_1 - lr * grad_1 / f_1].",
    starterCode: `def natural_gradient_fisher_diagonal(x, grad, lr):
    # Your code here
    pass`,
    solution: `def natural_gradient_fisher_diagonal(x, grad, lr):
    import math
    sigma = math.exp(x[1])
    f0 = 1.0 / (sigma * sigma)
    f1 = 2.0
    return [x[0] - lr * grad[0] / f0, x[1] - lr * grad[1] / f1]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 1.0], 0.1], expected: [-0.1, -0.05] },
      { input: [[1.0, 0.5], [0.5, 0.5], 0.2], expected: [0.7281718171540954, 0.45] },
      { input: [[-1.0, -0.5], [2.0, 1.0], 0.05], expected: [-1.0367879441171441, -0.525] },
    ],
    hint: "The Fisher diagonal rescales each parameter by its own curvature.",
  },
  {
    id: "op-137",
    title: "FTRL-Proximal Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one FTRL-Proximal update for a single coordinate.\n\nWith n_old = n, set n = n + g ** 2, sigma = (sqrt(n) - sqrt(n_old)) / lr, and z = z + g - sigma * w. With denom = l2 + sqrt(n) / lr, return w_new = -(z - l1) / denom when z > l1, -(z + l1) / denom when z < -l1, and 0.0 otherwise. Return [w_new, z, n].",
    starterCode: `def ftrl_step(w, z, n, g, lr, l1, l2):
    # Returns [w_new, z, n]
    # Your code here
    pass`,
    solution: `def ftrl_step(w, z, n, g, lr, l1, l2):
    n_old = n
    n = n + g * g
    sigma = (n ** 0.5 - n_old ** 0.5) / lr
    z = z + g - sigma * w
    denom = l2 + (n ** 0.5) / lr
    if z > l1:
        w_new = -(z - l1) / denom
    elif z < -l1:
        w_new = -(z + l1) / denom
    else:
        w_new = 0.0
    return [w_new, z, n]`,
    testCases: [
      { input: [0.0, 0.0, 0.0, 1.0, 1.0, 0.5, 1.0], expected: [-0.25, 1.0, 1.0] },
      { input: [1.0, 0.5, 4.0, 0.5, 0.5, 0.1, 0.0], expected: [-0.18842456267803157, 0.8768943743823394, 4.25] },
      { input: [-1.0, -0.2, 1.0, 0.3, 1.0, 0.5, 0.0], expected: [0.0, 0.14403065089105505, 1.09] },
    ],
    hint: "FTRL lazily accumulates gradients and only produces a weight when z escapes the L1 dead zone.",
  },
  {
    id: "op-138",
    title: "SPSA Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one SPSA (simultaneous perturbation stochastic approximation) step.\n\nAfter random.seed(seed), draw delta_i = +1 when random.random() < 0.5 and -1 otherwise. With step = a / (k + 1) ** 0.602, return x_i - step * (loss_plus - loss_minus) / (2 * c * delta_i).",
    starterCode: `def spsa_update(x, loss_plus, loss_minus, a, c, k, seed):
    # Your code here
    pass`,
    solution: `def spsa_update(x, loss_plus, loss_minus, a, c, k, seed):
    import random
    random.seed(seed)
    delta = [1.0 if random.random() < 0.5 else -1.0 for _ in range(len(x))]
    step = a / ((k + 1) ** 0.602)
    out = []
    for i in range(len(x)):
        g = (loss_plus - loss_minus) / (2.0 * c * delta[i])
        out.append(x[i] - step * g)
    return out`,
    testCases: [
      { input: [[1.0, 2.0], 3.0, 2.5, 0.1, 0.05, 0, 0], expected: [1.5, 2.5] },
      { input: [[0.0, 0.0, 0.0], 1.5, 1.0, 0.2, 0.1, 5, 42], expected: [0.17002898082240728, -0.17002898082240728, -0.17002898082240728] },
      { input: [[1.0], 2.0, 4.0, 0.5, 0.25, 10, 7], expected: [1.472184361309482] },
    ],
    hint: "A single pair of loss evaluations yields a gradient estimate for all coordinates.",
  },
  {
    id: "op-139",
    title: "CMA-ES Mean Update Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the CMA-ES weighted mean update from a ranked population.\n\nSort indices by fitness descending, with the lower index winning ties. For ranks 0 .. mu-1 use weight log(mu + 0.5) - log(rank + 1), and normalize the selected weights to sum to 1. Return the weighted average of the selected individuals.",
    starterCode: `def cma_mean_update(population, fitness, mu):
    # Your code here
    pass`,
    solution: `def cma_mean_update(population, fitness, mu):
    import math
    n = len(population)
    order = sorted(range(n), key=lambda i: (-fitness[i], i))
    weights = [0.0] * n
    total = 0.0
    for rank in range(mu):
        w = math.log(mu + 0.5) - math.log(rank + 1)
        idx = order[rank]
        weights[idx] = w
        total = total + w
    d = len(population[0])
    new_mean = [0.0] * d
    for i in range(n):
        if weights[i] != 0:
            for k in range(d):
                new_mean[k] = new_mean[k] + weights[i] * population[i][k]
    return [v / total for v in new_mean]`,
    testCases: [
      { input: [[[0.0], [2.0], [4.0], [10.0]], [1.0, 4.0, 2.0, 0.5], 2], expected: [2.3916742801345414] },
      { input: [[[1.0, 1.0], [2.0, 0.0], [0.0, 3.0]], [3.0, 1.0, 2.0], 2], expected: [0.8041628599327295, 1.3916742801345412] },
      { input: [[[5.0], [1.0]], [0.1, 0.9], 1], expected: [1.0] },
    ],
    hint: "Log-decreasing weights favor the best individuals but never assign zero to the runners-up.",
  },
  {
    id: "op-140",
    title: "QD Grid Coverage",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Measure the coverage of a 2D quality-diversity archive.\n\nMap each point into a bins[0] x bins[1] grid over the ranges [mins, maxs], clamping points outside the range into the boundary cells, and return the fraction of grid cells that contain at least one point. An empty point list or non-positive cell count returns 0.0.",
    starterCode: `def qd_grid_coverage(points, mins, maxs, bins):
    # Your code here
    pass`,
    solution: `def qd_grid_coverage(points, mins, maxs, bins):
    total_cells = bins[0] * bins[1]
    if total_cells <= 0 or not points:
        return 0.0
    cells = set()
    for p in points:
        i0 = int((p[0] - mins[0]) / (maxs[0] - mins[0]) * bins[0])
        i1 = int((p[1] - mins[1]) / (maxs[1] - mins[1]) * bins[1])
        if i0 < 0:
            i0 = 0
        if i0 >= bins[0]:
            i0 = bins[0] - 1
        if i1 < 0:
            i1 = 0
        if i1 >= bins[1]:
            i1 = bins[1] - 1
        cells.add((i0, i1))
    return len(cells) / total_cells`,
    testCases: [
      { input: [[[0.0, 0.0], [1.0, 1.0], [0.0, 1.0]], [0.0, 0.0], [2.0, 2.0], [2, 2]], expected: 0.75 },
      { input: [[[0.1, 0.1], [0.2, 0.2], [1.5, 1.5]], [0.0, 0.0], [2.0, 2.0], [2, 2]], expected: 0.5 },
      { input: [[[0.0, 0.0], [4.0, 4.0]], [0.0, 0.0], [2.0, 2.0], [2, 2]], expected: 0.5 },
      { input: [[], [0.0, 0.0], [1.0, 1.0], [2, 2]], expected: 0.0 },
    ],
    hint: "Use a set of cell indices so duplicates do not inflate coverage.",
  },
];
