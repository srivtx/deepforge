import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-336",
    title: "Condition Number Ratio",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The condition number of a strongly convex quadratic with smoothness L and strong convexity mu is kappa = L / mu.\n\nGiven L and mu > 0, return the condition number.",
    starterCode: `def condition_number_ratio(l, mu):
    # Your code here
    pass`,
    solution: `def condition_number_ratio(l, mu):
    return l / mu`,
    testCases: [
      { input: [10, 2], expected: 5.0 },
      { input: [1, 1], expected: 1.0 },
      { input: [100, 0.5], expected: 200.0 },
    ],
    hint: "It is the ratio of largest to smallest curvature.",
  },
  {
    id: "op-337",
    title: "GD Error After K Steps",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For an L-smooth, mu-strongly convex quadratic, gradient descent with the optimal step shrinks the error by ((L - mu) / (L + mu))^k after k iterations.\n\nGiven the initial error, L, mu, and k, return the error estimate after k steps.",
    starterCode: `def gd_error_after_k_steps(err0, l, mu, k):
    # Your code here
    pass`,
    solution: `def gd_error_after_k_steps(err0, l, mu, k):
    return err0 * ((l - mu) / (l + mu)) ** k`,
    testCases: [
      { input: [1.0, 10, 1, 5], expected: 0.3666478320532007 },
      { input: [2.0, 4, 2, 10], expected: 3.387017561686056e-05 },
      { input: [5.0, 3, 1, 0], expected: 5.0 },
    ],
    hint: "Raise the contraction ratio to the number of steps.",
  },
  {
    id: "op-338",
    title: "Newton Decrement Value 2D",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The Newton decrement squared is g^T H^{-1} g, a measure of proximity to the minimum; the decrement itself is half of it for the standard convention used here: 0.5 * g^T H^{-1} g.\n\nGiven the gradient and the inverse Hessian as nested rows, return the decrement value.",
    starterCode: `def newton_decrement_value_2d(g, h_inv):
    # Your code here
    pass`,
    solution: `def newton_decrement_value_2d(g, h_inv):
    return 0.5 * (g[0] * (h_inv[0][0] * g[0] + h_inv[0][1] * g[1]) + g[1] * (h_inv[1][0] * g[0] + h_inv[1][1] * g[1]))`,
    testCases: [
      { input: [[1, 1], [[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[2, 0], [[0.5, 0], [0, 0.5]]], expected: 1.0 },
      { input: [[0, 3], [[1, 0], [0, 1]]], expected: 4.5 },
    ],
    hint: "Compute H^{-1} g first, then take half the dot product with g.",
  },
  {
    id: "op-339",
    title: "Wolfe Curvature Condition Check",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The Wolfe curvature condition requires |g_new dot d| <= c2 * |g_old dot d| for a descent direction d and 0 < c2 < 1.\n\nGiven the new and old gradients, the direction, and c2, return True when the condition holds.",
    starterCode: `def wolfe_curvature_condition_check(g_new, g_old, direction, c2):
    # Your code here
    pass`,
    solution: `def wolfe_curvature_condition_check(g_new, g_old, direction, c2):
    new_slope = abs(sum(a * b for a, b in zip(g_new, direction)))
    old_slope = abs(sum(a * b for a, b in zip(g_old, direction)))
    return new_slope <= c2 * old_slope`,
    testCases: [
      { input: [[0.5, 0], [1, 0], [-1, 0], 0.9], expected: true },
      { input: [[2, 0], [1, 0], [-1, 0], 0.5], expected: false },
      { input: [[0, 0], [1, 2], [1, 1], 0.1], expected: true },
    ],
    hint: "Compare absolute directional derivatives of the old and new points.",
  },
  {
    id: "op-340",
    title: "Golden Section Reduction Factor",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Golden section search shrinks the bracket by the factor r = (sqrt(5) - 1) / 2 per iteration.\n\nGiven the number of iterations, return r raised to that power.",
    starterCode: `def golden_section_reduction_factor(iterations):
    # Your code here
    pass`,
    solution: `def golden_section_reduction_factor(iterations):
    r = (5 ** 0.5 - 1.0) / 2.0
    return r ** iterations`,
    testCases: [
      { input: [1], expected: 0.6180339887498949 },
      { input: [5], expected: 0.09016994374947428 },
      { input: [10], expected: 0.008130618755783355 },
    ],
    hint: "r is the reciprocal of the golden ratio.",
  },
  {
    id: "op-341",
    title: "Golden Section Interval Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Given a bracket [a, b] with interior probe points, one golden section iteration keeps the subinterval around the smaller probe: keep [a, d] when f(c) < f(d) and [c, b] otherwise, where c and d are the probes.\n\nThe probe offsets are r * (b - a) with r = (sqrt(5) - 1) / 2. Given a, b, f(c), and f(d), return the new bracket [lo, hi].",
    starterCode: `def golden_section_interval_update(a, b, fc, fd):
    # Your code here
    pass`,
    solution: `def golden_section_interval_update(a, b, fc, fd):
    r = (5 ** 0.5 - 1.0) / 2.0
    c = b - r * (b - a)
    d = a + r * (b - a)
    if fc < fd:
        return [a, d]
    return [c, b]`,
    testCases: [
      { input: [0, 1, 1.0, 2.0], expected: [0, 0.6180339887498949] },
      { input: [0, 1, 3.0, 2.0], expected: [0.3819660112501051, 1] },
      { input: [-2, 2, 0.5, 0.5], expected: [-0.4721359549995796, 2] },
    ],
    hint: "The probe ordering depends on the interval orientation; use b - r*(b-a) and a + r*(b-a).",
  },
  {
    id: "op-342",
    title: "Square Root Inverse Schedule",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The square root schedule scales the learning rate as lr_t = lr0 / sqrt(t + 1).\n\nGiven lr0 and the step t, return the learning rate.",
    starterCode: `def square_root_inverse_schedule(lr0, t):
    # Your code here
    pass`,
    solution: `def square_root_inverse_schedule(lr0, t):
    import math
    return lr0 / math.sqrt(t + 1)`,
    testCases: [
      { input: [0.1, 0], expected: 0.1 },
      { input: [0.1, 99], expected: 0.01 },
      { input: [1.0, 15], expected: 0.25 },
    ],
    hint: "The offset keeps the first step at the base rate.",
  },
  {
    id: "op-343",
    title: "Warm Restart Cosine Period Length",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "In cosine annealing with warm restarts, the i-th period length is T_i = T_0 * T_mult^i.\n\nGiven the base period T_0, the multiplier T_mult, and the restart index i, return the period length.",
    starterCode: `def warm_restart_cosine_period_length(t0, t_mult, i):
    # Your code here
    pass`,
    solution: `def warm_restart_cosine_period_length(t0, t_mult, i):
    return t0 * t_mult ** i`,
    testCases: [
      { input: [10, 1, 3], expected: 10 },
      { input: [10, 2, 3], expected: 80 },
      { input: [100, 0.5, 2], expected: 25.0 },
    ],
    hint: "Periods grow geometrically when T_mult exceeds one.",
  },
  {
    id: "op-344",
    title: "Warmup Linear Scale Factor",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Linear warmup scales the peak learning rate by t / T_warm, capped at one once the warmup horizon is passed.\n\nGiven t and T_warm > 0, return the scale factor min(1, t / T_warm).",
    starterCode: `def warmup_linear_scale_factor(t, warmup):
    # Your code here
    pass`,
    solution: `def warmup_linear_scale_factor(t, warmup):
    if warmup <= 0:
        return 1.0
    return min(1.0, t / warmup)`,
    testCases: [
      { input: [5, 10], expected: 0.5 },
      { input: [10, 10], expected: 1.0 },
      { input: [20, 10], expected: 1.0 },
    ],
    hint: "The factor saturates at one.",
  },
  {
    id: "op-345",
    title: "Adam Full Update Scalar",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "One full Adam update: m_new = b1 m + (1 - b1) g, v_new = b2 v + (1 - b2) g^2, m_hat = m_new / (1 - b1^t), v_hat = v_new / (1 - b2^t), x_new = x - lr * m_hat / (sqrt(v_hat) + eps).\n\nGiven x, m, v, g, b1, b2, t, lr, and eps, return [x_new, m_new, v_new].",
    starterCode: `def adam_full_update_scalar(x, m, v, g, b1, b2, t, lr, eps):
    # Your code here
    pass`,
    solution: `def adam_full_update_scalar(x, m, v, g, b1, b2, t, lr, eps):
    import math
    m_new = b1 * m + (1.0 - b1) * g
    v_new = b2 * v + (1.0 - b2) * g * g
    m_hat = m_new / (1.0 - b1 ** t)
    v_hat = v_new / (1.0 - b2 ** t)
    return [x - lr * m_hat / (math.sqrt(v_hat) + eps), m_new, v_new]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 0.9, 0.999, 1, 0.1, 1e-08], expected: [0.900000002, 0.04999999999999999, 0.0002500000000000002] },
      { input: [0.0, 1.0, 1.0, -1.0, 0.9, 0.9, 5, 0.01, 1e-08], expected: [-0.012501373437368462, 0.8, 1.0] },
      { input: [2.0, 0.5, 0.25, 2.0, 0.5, 0.5, 3, 0.5, 0.0], expected: [1.5416507514858944, 1.25, 2.125] },
    ],
    hint: "Bias-correct both moments before forming the ratio.",
  },
  {
    id: "op-346",
    title: "Nesterov Lookahead Point",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Nesterov momentum evaluates the gradient at the lookahead point y = x + beta * v.\n\nGiven x, the velocity v, and beta, return the lookahead point.",
    starterCode: `def nesterov_lookahead_point(x, v, beta):
    # Your code here
    pass`,
    solution: `def nesterov_lookahead_point(x, v, beta):
    return [xi + beta * vi for xi, vi in zip(x, v)]`,
    testCases: [
      { input: [[1, 1], [1, -1], 0.9], expected: [1.9, 0.09999999999999998] },
      { input: [[0, 0], [1, 1], 0.5], expected: [0.5, 0.5] },
      { input: [[2], [0.5], 1.0], expected: [2.5] },
    ],
    hint: "Extrapolate along the current velocity.",
  },
  {
    id: "op-347",
    title: "Lookahead Interpolation Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The Lookahead optimizer moves the slow weights toward the fast weights: slow_new = slow + alpha * (fast - slow).\n\nGiven the slow weights, fast weights, and alpha, return the updated slow weights.",
    starterCode: `def lookahead_interpolation_step(slow, fast, alpha):
    # Your code here
    pass`,
    solution: `def lookahead_interpolation_step(slow, fast, alpha):
    return [s + alpha * (f - s) for s, f in zip(slow, fast)]`,
    testCases: [
      { input: [[0, 0], [2, 4], 0.5], expected: [1.0, 2.0] },
      { input: [[1, 1], [1, 1], 0.9], expected: [1.0, 1.0] },
      { input: [[0], [10], 0.25], expected: [2.5] },
    ],
    hint: "Interpolate between the two parameter copies.",
  },
  {
    id: "op-348",
    title: "SWA Model Average",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Stochastic weight averaging takes the elementwise mean of a list of parameter vectors.\n\nGiven the list of models, return the averaged model.",
    starterCode: `def swa_model_average(models):
    # Your code here
    pass`,
    solution: `def swa_model_average(models):
    n = len(models)
    dim = len(models[0])
    return [sum(m[i] for m in models) / n for i in range(dim)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [2.0, 3.0] },
      { input: [[[1, 0], [0, 1], [2, 2]]], expected: [1.0, 1.0] },
      { input: [[[2], [4]]], expected: [3.0] },
    ],
    hint: "Every checkpoint contributes equally.",
  },
  {
    id: "op-349",
    title: "Ensemble Prediction Variance",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The disagreement among ensemble members is measured by the population variance of their scalar predictions.\n\nGiven the prediction list, return the variance.",
    starterCode: `def ensemble_prediction_variance(preds):
    # Your code here
    pass`,
    solution: `def ensemble_prediction_variance(preds):
    n = len(preds)
    mean = sum(preds) / n
    return sum((p - mean) ** 2 for p in preds) / n`,
    testCases: [
      { input: [[1, 2, 3]], expected: 0.6666666666666666 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[2, 4, 6, 8]], expected: 5.0 },
    ],
    hint: "Average the squared deviations from the mean prediction.",
  },
  {
    id: "op-350",
    title: "Elastic Net Composite Proximal Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The proximal operator of t * (lambda1 ||x||_1 + (lambda2 / 2) ||x||^2) applies soft thresholding with t * lambda1 to v, then divides by (1 + t * lambda2).\n\nGiven v, t, lambda1, and lambda2, return the prox value.",
    starterCode: `def elastic_net_proximal_step(v, t, lambda1, lambda2):
    # Your code here
    pass`,
    solution: `def elastic_net_proximal_step(v, t, lambda1, lambda2):
    z = v
    thresh = t * lambda1
    if z > thresh:
        z = z - thresh
    elif z < -thresh:
        z = z + thresh
    else:
        z = 0.0
    return z / (1.0 + t * lambda2)`,
    testCases: [
      { input: [2.0, 0.5, 1.0, 2.0], expected: 0.75 },
      { input: [0.1, 1.0, 0.5, 0.0], expected: 0.0 },
      { input: [-3.0, 0.25, 0.5, 1.0], expected: -2.3 },
    ],
    hint: "Compose the L1 prox with the scaling induced by the quadratic term.",
  },
  {
    id: "op-351",
    title: "Subgradient Absolute Value Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For f(x) = |x|, a subgradient at x is sign(x) with 0 chosen at the kink. One subgradient step is x_new = x - lr * sign(x).\n\nGiven x and lr, return x_new.",
    starterCode: `def subgradient_absolute_value_step(x, lr):
    # Your code here
    pass`,
    solution: `def subgradient_absolute_value_step(x, lr):
    if x > 0:
        return x - lr
    if x < 0:
        return x + lr
    return 0.0`,
    testCases: [
      { input: [2.0, 0.5], expected: 1.5 },
      { input: [-1.0, 2.0], expected: 1.0 },
      { input: [0.0, 1.0], expected: 0.0 },
    ],
    hint: "The kink is already a minimum, so it stays put.",
  },
  {
    id: "op-352",
    title: "Augmented Lagrangian One Step 1D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Minimize x^2 subject to x = 1 with the augmented Lagrangian. With multiplier lambda and penalty rho, the primal update is x_new = (lambda + rho) / (2 + rho) and the multiplier update is lambda_new = lambda + rho * (x_new - 1).\n\nGiven lambda and rho, return [x_new, lambda_new].",
    starterCode: `def augmented_lagrangian_one_step_1d(multiplier, rho):
    # Your code here
    pass`,
    solution: `def augmented_lagrangian_one_step_1d(multiplier, rho):
    x_new = (multiplier + rho) / (2.0 + rho)
    lambda_new = multiplier + rho * (x_new - 1.0)
    return [x_new, lambda_new]`,
    testCases: [
      { input: [0.0, 1.0], expected: [0.3333333333333333, -0.6666666666666667] },
      { input: [2.0, 4.0], expected: [1.0, 2.0] },
      { input: [-1.0, 10.0], expected: [0.75, -3.5] },
    ],
    hint: "Minimize x^2 + lambda (x - 1) + (rho / 2) (x - 1)^2 over x.",
  },
  {
    id: "op-353",
    title: "Projection Onto L1 Ball",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The Euclidean projection onto the L1 ball of radius r keeps points with ||x||_1 <= r and otherwise soft-thresholds with the threshold tau chosen so the sum of the positive parts equals r: sort |x| descending, find the largest count with u_j - (cumulative - r) / j > 0, and shrink by tau = (cumulative - r) / j preserving signs.\n\nGiven x and r > 0, return the projection.",
    starterCode: `def projection_onto_l1_ball(x, radius):
    # Your code here
    pass`,
    solution: `def projection_onto_l1_ball(x, radius):
    import math
    total = sum(abs(v) for v in x)
    if total <= radius:
        return list(x)
    u = sorted((abs(v) for v in x), reverse=True)
    cumulative = 0.0
    tau = 0.0
    for j in range(1, len(u) + 1):
        cumulative += u[j - 1]
        t = (cumulative - radius) / j
        if u[j - 1] - t > 0:
            tau = t
    out = []
    for v in x:
        a = abs(v) - tau
        if a <= 0:
            out.append(0.0)
        else:
            out.append(math.copysign(a, v))
    return out`,
    testCases: [
      { input: [[3, 0], 1.0], expected: [1.0, 0.0] },
      { input: [[1, 1], 1.0], expected: [0.5, 0.5] },
      { input: [[2, -2, 1], 2.0], expected: [1.0, -1.0, 0.0] },
    ],
    hint: "Find the threshold from the sorted magnitudes, then shrink while keeping signs.",
  },
  {
    id: "op-354",
    title: "Loss Plateau Detection",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "A training loss has plateaued when the latest value is within tol of the mean of the preceding values.\n\nGiven the loss history (at least two entries) and tol, return True when abs(last - mean(previous)) < tol.",
    starterCode: `def loss_plateau_detection(losses, tol):
    # Your code here
    pass`,
    solution: `def loss_plateau_detection(losses, tol):
    previous = losses[:-1]
    mean = sum(previous) / len(previous)
    return abs(losses[-1] - mean) < tol`,
    testCases: [
      { input: [[1.0, 1.0, 1.0001], 0.001], expected: true },
      { input: [[1.0, 2.0, 5.0], 0.001], expected: false },
      { input: [[2.0, 2.0], 0.0], expected: false },
    ],
    hint: "Exclude the latest value from the reference mean.",
  },
  {
    id: "op-355",
    title: "Gradient Estimator Cosine Agreement",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Two gradient estimates agree in direction when their cosine similarity is high. Return the cosine similarity g1 dot g2 / (||g1|| ||g2||), or 0.0 when either norm is zero.\n\nGiven the two vectors, return the cosine similarity.",
    starterCode: `def gradient_estimator_cosine_agreement(g1, g2):
    # Your code here
    pass`,
    solution: `def gradient_estimator_cosine_agreement(g1, g2):
    import math
    n1 = math.sqrt(sum(v * v for v in g1))
    n2 = math.sqrt(sum(v * v for v in g2))
    if n1 == 0 or n2 == 0:
        return 0.0
    return sum(a * b for a, b in zip(g1, g2)) / (n1 * n2)`,
    testCases: [
      { input: [[1, 0], [1, 0]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[2, 2], [-2, -2]], expected: -0.9999999999999998 },
    ],
    hint: "Normalize both vectors before taking the dot product.",
  },
];
