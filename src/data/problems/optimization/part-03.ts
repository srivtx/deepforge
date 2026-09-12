import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-051",
    title: "Backtracking Line Search Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Run backtracking line search on f(v) = v ** 2 along the descent direction -grad.\n\nStart with step = 1.0 and shrink it by factor rho while (x - step * grad) ** 2 > x * x - c * step * grad * grad (the Armijo condition). Return the first step size that satisfies the condition.",
    starterCode: `def backtracking_line_search(x, grad, rho, c):
    # Your code here
    pass`,
    solution: `def backtracking_line_search(x, grad, rho, c):
    step = 1.0
    f0 = x * x
    while (x - step * grad) ** 2 > f0 - c * step * grad * grad:
        step = step * rho
    return step`,
    testCases: [
      { input: [0.1, 1.0, 0.5, 0.1], expected: 0.0625 },
      { input: [0.5, 1.0, 0.5, 0.1], expected: 0.5 },
      { input: [1.0, 0.0, 0.5, 0.1], expected: 1.0 },
      { input: [3.0, 2.0, 0.5, 0.25], expected: 1.0 },
    ],
    hint: "Keep shrinking the step until the actual value lies under the Armijo line.",
  },
  {
    id: "op-052",
    title: "Armijo Condition Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Check the Armijo sufficient-decrease condition for a step of size step along the descent direction -grad. Return True when f_new <= f_current - c * step * grad ** 2, and False otherwise. Here grad is the current gradient component along that direction.",
    starterCode: `def armijo_condition(f_current, f_new, grad, step, c):
    # Your code here
    pass`,
    solution: `def armijo_condition(f_current, f_new, grad, step, c):
    return f_new <= f_current - c * step * grad * grad`,
    testCases: [
      { input: [1.0, 0.5, 1.0, 1.0, 0.1], expected: true },
      { input: [1.0, 0.85, 1.0, 1.0, 0.1], expected: true },
      { input: [4.0, 3.0, 2.0, 0.5, 0.25], expected: true },
      { input: [0.0, 0.001, 0.0, 1.0, 0.1], expected: false },
    ],
    hint: "Armijo compares the new value against the tangent line with slope -grad squared.",
  },
  {
    id: "op-053",
    title: "Wolfe Condition Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Check the strong Wolfe conditions for a step of size step along -gradient.\n\nThe Armijo part requires f_new <= f_current - c1 * step * g_current ** 2, and the curvature part requires abs(g_new) <= c2 * abs(g_current). Return True only when both inequalities hold.",
    starterCode: `def wolfe_condition(f_current, f_new, g_current, g_new, step, c1, c2):
    # Your code here
    pass`,
    solution: `def wolfe_condition(f_current, f_new, g_current, g_new, step, c1, c2):
    armijo = f_new <= f_current - c1 * step * g_current * g_current
    curvature = abs(g_new) <= c2 * abs(g_current)
    return armijo and curvature`,
    testCases: [
      { input: [1.0, 0.5, 1.0, 0.2, 1.0, 0.1, 0.9], expected: true },
      { input: [1.0, 0.85, 1.0, 0.2, 1.0, 0.1, 0.9], expected: true },
      { input: [1.0, 0.5, 2.0, 2.5, 1.0, 0.1, 0.9], expected: false },
      { input: [2.0, 1.0, -3.0, -1.0, 0.5, 0.2, 0.5], expected: true },
    ],
    hint: "Both the decrease and the curvature inequality must hold.",
  },
  {
    id: "op-054",
    title: "Conjugate Gradient One Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one conjugate gradient step on the quadratic f(x) = 0.5 * x^T A x - b^T x.\n\nCompute Ap = A p, then alpha = (r dot r) / (p dot Ap), x_new = x + alpha * p, r_new = r - alpha * Ap, and beta = (r_new dot r_new) / (r dot r). Return [x_new, r_new, p_new] with p_new = r_new + beta * p.",
    starterCode: `def cg_step(x, p, r, A, b):
    # Returns [x_new, r_new, p_new]
    # Your code here
    pass`,
    solution: `def cg_step(x, p, r, A, b):
    n = len(x)
    Ap = [sum(A[i][j] * p[j] for j in range(n)) for i in range(n)]
    pAp = sum(p[i] * Ap[i] for i in range(n))
    rr = sum(r[i] * r[i] for i in range(n))
    if pAp == 0:
        alpha = 0.0
    else:
        alpha = rr / pAp
    x_new = [x[i] + alpha * p[i] for i in range(n)]
    r_new = [r[i] - alpha * Ap[i] for i in range(n)]
    rr_new = sum(r_new[i] * r_new[i] for i in range(n))
    if rr == 0:
        beta = 0.0
    else:
        beta = rr_new / rr
    p_new = [r_new[i] + beta * p[i] for i in range(n)]
    return [x_new, r_new, p_new]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], [1.0, 2.0], [[4.0, 1.0], [1.0, 3.0]], [1.0, 2.0]], expected: [[0.25, 0.5], [-0.5, 0.25], [-0.4375, 0.375]] },
      { input: [[1.0, 1.0], [0.0, 2.0], [0.0, 2.0], [[2.0, 0.0], [0.0, 2.0]], [2.0, 4.0]], expected: [[1.0, 2.0], [0.0, 0.0], [0.0, 0.0]] },
      { input: [[0.5, -0.5], [1.0, 1.0], [1.0, 1.0], [[3.0, 0.0], [0.0, 2.0]], [1.0, -2.0]], expected: [[0.9, -0.09999999999999998], [-0.20000000000000018, 0.19999999999999996], [-0.16000000000000014, 0.24]] },
    ],
    hint: "alpha comes from r dot r over p dot Ap; update r before computing beta.",
  },
  {
    id: "op-055",
    title: "L-BFGS Two-Loop Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Run the L-BFGS two-loop recursion for a small history.\n\nStarting from p = q, loop over the correction pairs from newest to oldest applying p = p - alpha * y with alpha = (s dot p) / (y dot s), saving each alpha. Scale p by gamma, then loop oldest to newest applying p = p + s * (alpha - beta) with beta = (y dot p) / (y dot s). Return the resulting search direction.",
    starterCode: `def lbfgs_two_loop(q, s_list, y_list, gamma):
    # Your code here
    pass`,
    solution: `def lbfgs_two_loop(q, s_list, y_list, gamma):
    p = list(q)
    alphas = []
    m = len(s_list)
    for i in range(m - 1, -1, -1):
        s = s_list[i]
        y = y_list[i]
        rho = 1.0 / sum(y[k] * s[k] for k in range(len(y)))
        a = rho * sum(s[k] * p[k] for k in range(len(s)))
        alphas.append(a)
        p = [p[k] - a * y[k] for k in range(len(p))]
    p = [gamma * v for v in p]
    for i in range(m):
        s = s_list[i]
        y = y_list[i]
        rho = 1.0 / sum(y[k] * s[k] for k in range(len(y)))
        b = rho * sum(y[k] * p[k] for k in range(len(y)))
        a = alphas[m - 1 - i]
        p = [p[k] + s[k] * (a - b) for k in range(len(p))]
    return p`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0, 0.0]], [[2.0, 1.0]], 0.5], expected: [0.125, 0.75] },
      { input: [[0.5, -1.0, 2.0], [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]], [[2.0, 0.0, 0.0], [0.0, 3.0, 1.0]], 1.0], expected: [0.25, -1.1111111111111112, 2.3333333333333335] },
      { input: [[1.0, 1.0], [[2.0, 1.0]], [[1.0, 3.0]], 1.0], expected: [2.4000000000000004, 0.19999999999999996] },
    ],
    hint: "Save each alpha in the backward pass and reuse them reversed in the forward pass.",
  },
  {
    id: "op-056",
    title: "Trust Region Radius Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Update a trust-region radius from the ratio of actual to predicted reduction.\n\nIf predicted <= 0 use ratio 0.0, otherwise ratio = actual / predicted. Shrink the radius to 0.25 times its value when ratio < 0.25, double it when ratio > 0.75, clamp it to [min_r, max_r], and accept the step when ratio > eta. Return [radius_new, accepted].",
    starterCode: `def trust_region_radius_update(radius, actual, predicted, eta, min_r, max_r):
    # Returns [radius_new, accepted]
    # Your code here
    pass`,
    solution: `def trust_region_radius_update(radius, actual, predicted, eta, min_r, max_r):
    if predicted <= 0:
        ratio = 0.0
    else:
        ratio = actual / predicted
    accepted = ratio > eta
    if ratio < 0.25:
        radius = 0.25 * radius
    elif ratio > 0.75:
        radius = 2.0 * radius
    if radius < min_r:
        radius = min_r
    if radius > max_r:
        radius = max_r
    return [radius, accepted]`,
    testCases: [
      { input: [1.0, 0.1, 1.0, 0.1, 0.01, 10.0], expected: [0.25, false] },
      { input: [1.0, 0.9, 1.0, 0.1, 0.01, 10.0], expected: [2.0, true] },
      { input: [1.0, 0.5, 1.0, 0.1, 0.01, 10.0], expected: [1.0, true] },
      { input: [1.0, 0.05, 0.0, 0.1, 0.01, 10.0], expected: [0.25, false] },
      { input: [8.0, 0.95, 1.0, 0.1, 0.01, 10.0], expected: [10.0, true] },
    ],
    hint: "The ratio drives both the new radius and whether the step is accepted.",
  },
  {
    id: "op-057",
    title: "Levenberg-Marquardt Scalar Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one Levenberg-Marquardt step on a scalar parameter.\n\nCompute delta = -grad / (hess + lam) and return [x + delta, delta]. When lam is 0 this reduces to a Newton step; larger lam makes the step behave more like gradient descent.",
    starterCode: `def lm_step(x, grad, hess, lam):
    # Returns [x_new, delta]
    # Your code here
    pass`,
    solution: `def lm_step(x, grad, hess, lam):
    delta = -grad / (hess + lam)
    return [x + delta, delta]`,
    testCases: [
      { input: [1.0, 2.0, 4.0, 0.0], expected: [0.5, -0.5] },
      { input: [1.0, 2.0, 4.0, 1.0], expected: [0.6, -0.4] },
      { input: [0.0, -3.0, 2.0, 0.5], expected: [1.2, 1.2] },
      { input: [2.0, 0.0, 5.0, 1.0], expected: [2.0, -0.0] },
    ],
    hint: "lam interpolates between gradient descent and a Newton step.",
  },
  {
    id: "op-058",
    title: "Gauss-Newton Step 1D",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one Gauss-Newton step fitting y = a * x to data.\n\nReturn a + sum(xi * (yi - a * xi)) / sum(xi ** 2). If every xi is 0, return a unchanged. This is the exact least-squares slope update for a linear model through the origin.",
    starterCode: `def gauss_newton_step(a, X, y):
    # Your code here
    pass`,
    solution: `def gauss_newton_step(a, X, y):
    num = 0.0
    den = 0.0
    for xi, yi in zip(X, y):
        num = num + xi * (yi - a * xi)
        den = den + xi * xi
    if den == 0:
        return a
    return a + num / den`,
    testCases: [
      { input: [0.0, [1.0, 2.0, 3.0], [2.0, 4.0, 6.0]], expected: 2.0 },
      { input: [1.0, [1.0, 2.0], [3.0, 5.0]], expected: 2.6 },
      { input: [0.5, [1.0, 1.0], [1.0, 2.0]], expected: 1.5 },
      { input: [2.0, [], []], expected: 2.0 },
    ],
    hint: "The Jacobian entries are the xi values themselves.",
  },
  {
    id: "op-059",
    title: "Fisher Information 1D",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the Fisher information of a Bernoulli-logistic model with logit z.\n\nLet p = 1 / (1 + exp(-z)); the Fisher information with respect to z is p * (1 - p). Return that value, which peaks at z = 0.",
    starterCode: `def fisher_information_1d(z):
    # Your code here
    pass`,
    solution: `def fisher_information_1d(z):
    import math
    p = 1.0 / (1.0 + math.exp(-z))
    return p * (1 - p)`,
    testCases: [
      { input: [0.0], expected: 0.25 },
      { input: [1.0], expected: 0.19661193324148185 },
      { input: [-2.0], expected: 0.1049935854035065 },
      { input: [5.0], expected: 0.006648056670790033 },
    ],
    hint: "The Fisher information is the variance of the Bernoulli score.",
  },
  {
    id: "op-060",
    title: "Natural Gradient 1D Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one natural gradient step for a logistic model parameterized by logit z.\n\nWith p = 1 / (1 + exp(-z)), the Fisher information is p * (1 - p); return x - lr * grad / fisher. If the Fisher information is 0, return x unchanged.",
    starterCode: `def natural_gradient_step(x, grad, z, lr):
    # Your code here
    pass`,
    solution: `def natural_gradient_step(x, grad, z, lr):
    import math
    p = 1.0 / (1.0 + math.exp(-z))
    fisher = p * (1 - p)
    if fisher == 0:
        return x
    return x - lr * grad / fisher`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.1], expected: 0.8 },
      { input: [0.0, 1.0, 2.0, 0.05], expected: -0.4762195691083627 },
      { input: [2.0, -1.0, -1.0, 0.2], expected: 3.017232253926098 },
    ],
    hint: "Dividing by the Fisher information rescales the gradient by curvature.",
  },
  {
    id: "op-061",
    title: "Mirror Descent KL Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one mirror descent step with the KL divergence on the probability simplex.\n\nCompute q_i proportional to p_i * exp(-lr * g_i), then normalize so the entries sum to 1. Return the new probability list.",
    starterCode: `def mirror_descent_kl_step(p, g, lr):
    # Your code here
    pass`,
    solution: `def mirror_descent_kl_step(p, g, lr):
    import math
    q = [p[i] * math.exp(-lr * g[i]) for i in range(len(p))]
    total = sum(q)
    return [v / total for v in q]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, -1.0], 0.1], expected: [0.4501660026875221, 0.549833997312478] },
      { input: [[0.2, 0.3, 0.5], [0.0, 0.0, 0.0], 1.0], expected: [0.2, 0.3, 0.5] },
      { input: [[0.9, 0.1], [-2.0, 1.0], 0.5], expected: [0.9758075451312032, 0.02419245486879684] },
    ],
    hint: "The exponential tilt followed by renormalization is the KL prox.",
  },
  {
    id: "op-062",
    title: "Frank-Wolfe Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Frank-Wolfe step over the probability simplex.\n\nThe linear minimization oracle picks the one-hot vertex s at the smallest gradient component, with the lowest index winning ties. Return x_new = (1 - gamma) * x + gamma * s as a list.",
    starterCode: `def frank_wolfe_step(x, grad, gamma):
    # Your code here
    pass`,
    solution: `def frank_wolfe_step(x, grad, gamma):
    best = 0
    for i in range(1, len(grad)):
        if grad[i] < grad[best]:
            best = i
    s = [1.0 if i == best else 0.0 for i in range(len(x))]
    return [(1 - gamma) * x[i] + gamma * s[i] for i in range(len(x))]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, -1.0], 0.5], expected: [0.25, 0.75] },
      { input: [[0.2, 0.3, 0.5], [2.0, 1.0, 3.0], 0.25], expected: [0.15000000000000002, 0.475, 0.375] },
      { input: [[0.5, 0.5], [1.0, 1.0], 0.4], expected: [0.7, 0.3] },
    ],
    hint: "The simplex oracle is one-hot at the smallest gradient entry.",
  },
  {
    id: "op-063",
    title: "Proximal Gradient Step 1D",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one proximal gradient step with a squared L2 regularizer.\n\nCompute z = w - lr * grad, then apply the proximal operator of (lam / 2) * ||w||^2, which is z / (1 + 2 * lr * lam). Return the new value.",
    starterCode: `def proximal_gradient_step(w, grad, lr, lam):
    # Your code here
    pass`,
    solution: `def proximal_gradient_step(w, grad, lr, lam):
    z = w - lr * grad
    return z / (1 + 2 * lr * lam)`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 0.2], expected: 0.9134615384615384 },
      { input: [2.0, -1.0, 0.5, 0.1], expected: 2.2727272727272725 },
      { input: [0.0, 0.0, 0.3, 1.0], expected: 0.0 },
      { input: [-1.0, 2.0, 0.2, 0.0], expected: -1.4 },
    ],
    hint: "The squared L2 prox divides by 1 + 2 * lr * lam.",
  },
  {
    id: "op-064",
    title: "ADMM One Step 1D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one ADMM iteration minimizing 0.5 * (x - a_val) ** 2 + lam * abs(z) subject to x - z = 0, with scaled dual u and penalty rho.\n\nSet x to (a_val + rho * (z - u)) / (1 + rho), set z by soft-thresholding x + u at lam / rho, then set u = u + x - z. Return [x, z, u].",
    starterCode: `def admm_step(x, z, u, a_val, lam, rho):
    # Returns [x, z, u]
    # Your code here
    pass`,
    solution: `def admm_step(x, z, u, a_val, lam, rho):
    x = (a_val + rho * (z - u)) / (1 + rho)
    v = x + u
    t = lam / rho
    if v > t:
        z = v - t
    elif v < -t:
        z = v + t
    else:
        z = 0.0
    u = u + x - z
    return [x, z, u]`,
    testCases: [
      { input: [0.0, 0.0, 0.0, 3.0, 0.5, 1.0], expected: [1.5, 1.0, 0.5] },
      { input: [1.0, 0.0, 0.0, 2.0, 0.1, 2.0], expected: [0.6666666666666666, 0.6166666666666666, 0.050000000000000044] },
      { input: [0.0, 0.5, 0.2, -1.0, 1.0, 0.5], expected: [-0.5666666666666667, 0.0, -0.36666666666666664] },
    ],
    hint: "The z update is soft thresholding of x + u at lam / rho.",
  },
  {
    id: "op-065",
    title: "Coordinate Descent Sweep",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Run one full coordinate-descent sweep on f(x) = 0.5 * x^T A x - b^T x.\n\nVisit coordinates j = 0 .. n-1 in order and set each to the exact minimizer (b[j] - sum over k != j of A[j][k] * x[k]) / A[j][j] using the most recently updated values. Skip coordinates whose diagonal entry is 0. Return the updated list.",
    starterCode: `def coordinate_descent_sweep(x, A, b):
    # Your code here
    pass`,
    solution: `def coordinate_descent_sweep(x, A, b):
    n = len(x)
    out = list(x)
    for j in range(n):
        total = b[j]
        for k in range(n):
            if k != j:
                total = total - A[j][k] * out[k]
        if A[j][j] != 0:
            out[j] = total / A[j][j]
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [[4.0, 1.0], [1.0, 3.0]], [1.0, 2.0]], expected: [0.25, 0.5833333333333334] },
      { input: [[1.0, 1.0], [[2.0, 0.0], [0.0, 5.0]], [4.0, 5.0]], expected: [2.0, 1.0] },
      { input: [[0.0, 1.0], [[3.0, -1.0], [-1.0, 2.0]], [2.0, 1.0]], expected: [1.0, 1.0] },
    ],
    hint: "Later coordinates see the updates already made earlier in the sweep.",
  },
  {
    id: "op-066",
    title: "SGD With Decay",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one SGD step with inverse-time learning-rate decay.\n\nCompute lr = lr0 / (1 + decay * step) and return [w - lr * grad, lr], so the caller also sees the decayed rate.",
    starterCode: `def sgd_with_decay(w, grad, lr0, decay, step):
    # Returns [w_new, lr]
    # Your code here
    pass`,
    solution: `def sgd_with_decay(w, grad, lr0, decay, step):
    lr = lr0 / (1 + decay * step)
    return [w - lr * grad, lr]`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 0.01, 100], expected: [0.975, 0.05] },
      { input: [1.0, 0.5, 0.1, 0.1, 9], expected: [0.9736842105263158, 0.052631578947368425] },
      { input: [0.0, -2.0, 0.05, 0.5, 5], expected: [0.028571428571428574, 0.014285714285714287] },
      { input: [2.0, 0.0, 0.1, 1.0, 3], expected: [2.0, 0.025] },
    ],
    hint: "The effective learning rate shrinks as 1 / (1 + decay * step).",
  },
  {
    id: "op-067",
    title: "Cyclical Learning Rate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute a triangular cyclical learning rate.\n\nWith cycle = 1 + step // (2 * step_size) and x = abs(step / step_size - 2 * cycle + 1), return base_lr + (max_lr - base_lr) * max(0, 1 - x). If step_size is not positive, return base_lr.",
    starterCode: `def cyclical_lr(base_lr, max_lr, step_size, step):
    # Your code here
    pass`,
    solution: `def cyclical_lr(base_lr, max_lr, step_size, step):
    if step_size <= 0:
        return base_lr
    cycle = 1 + step // (2 * step_size)
    x = abs(step / step_size - 2 * cycle + 1)
    factor = 1 - x
    if factor < 0:
        factor = 0.0
    return base_lr + (max_lr - base_lr) * factor`,
    testCases: [
      { input: [0.001, 0.01, 5, 0], expected: 0.001 },
      { input: [0.001, 0.01, 5, 5], expected: 0.010000000000000002 },
      { input: [0.001, 0.01, 5, 2], expected: 0.0046 },
      { input: [0.001, 0.01, 5, 7], expected: 0.006400000000000001 },
      { input: [0.001, 0.01, 5, 10], expected: 0.001 },
    ],
    hint: "The cycle rises during the first half and falls during the second.",
  },
  {
    id: "op-068",
    title: "Cosine Restarts Learning Rate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the learning rate for cosine annealing with warm restarts.\n\nLet t = step % period and return min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * t / period)). If period is not positive, return base_lr.",
    starterCode: `def cosine_restarts_lr(base_lr, min_lr, period, step):
    # Your code here
    pass`,
    solution: `def cosine_restarts_lr(base_lr, min_lr, period, step):
    import math
    if period <= 0:
        return base_lr
    t = step % period
    return min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * t / period))`,
    testCases: [
      { input: [0.1, 0.001, 10, 0], expected: 0.1 },
      { input: [0.1, 0.001, 10, 5], expected: 0.0505 },
      { input: [0.1, 0.001, 10, 10], expected: 0.1 },
      { input: [0.1, 0.001, 10, 15], expected: 0.0505 },
      { input: [0.1, 0.001, 0, 3], expected: 0.1 },
    ],
    hint: "The modulo resets the cosine cycle every period steps.",
  },
  {
    id: "op-069",
    title: "Gradient Noise Scale Estimate",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Estimate the gradient noise scale from per-sample gradients.\n\nCompute the mean gradient and the unbiased per-coordinate variance dividing by n - 1, sum the variances into a trace, and return trace / (||mean||^2 + eps). Return 0.0 when fewer than 2 samples are given or the mean is the zero vector.",
    starterCode: `def gradient_noise_scale(grads, eps):
    # Your code here
    pass`,
    solution: `def gradient_noise_scale(grads, eps):
    n = len(grads)
    if n < 2:
        return 0.0
    d = len(grads[0])
    mean = [0.0] * d
    for g in grads:
        for j in range(d):
            mean[j] = mean[j] + g[j]
    for j in range(d):
        mean[j] = mean[j] / n
    trace = 0.0
    for j in range(d):
        var = 0.0
        for g in grads:
            var = var + (g[j] - mean[j]) ** 2
        trace = trace + var / (n - 1)
    norm_sq = 0.0
    for j in range(d):
        norm_sq = norm_sq + mean[j] * mean[j]
    if norm_sq == 0:
        return 0.0
    return trace / (norm_sq + eps)`,
    testCases: [
      { input: [[[1.0, 2.0], [1.2, 1.8], [0.8, 2.2]], 1e-12], expected: 0.0159999999999968 },
      { input: [[[1.0], [5.0]], 1e-12], expected: 0.8888888888887901 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 1e-12], expected: 0.0 },
    ],
    hint: "Use the unbiased variance with n - 1 and normalize by the squared gradient norm.",
  },
  {
    id: "op-070",
    title: "Polyak Step Size",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Polyak step size.\n\nReturn (f_current - f_best) / grad_norm_sq, or 0.0 if grad_norm_sq is not positive. This assumes the optimal objective value f_best is known.",
    starterCode: `def polyak_step_size(f_current, f_best, grad_norm_sq):
    # Your code here
    pass`,
    solution: `def polyak_step_size(f_current, f_best, grad_norm_sq):
    if grad_norm_sq <= 0:
        return 0.0
    return (f_current - f_best) / grad_norm_sq`,
    testCases: [
      { input: [10.0, 5.0, 4.0], expected: 1.25 },
      { input: [1.0, 1.0, 2.0], expected: 0.0 },
      { input: [3.0, 0.0, 0.0], expected: 0.0 },
      { input: [2.5, 1.0, 6.0], expected: 0.25 },
    ],
    hint: "The step shrinks as the current gap to the optimum shrinks.",
  },
  {
    id: "op-071",
    title: "Barzilai-Borwein Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute both Barzilai-Borwein step sizes from s = x_new - x_old and y = grad_new - grad_old.\n\nBB1 is (s dot s) / (s dot y) and BB2 is (s dot y) / (y dot y). Return [bb1, bb2], using 0.0 for either value whose denominator is zero.",
    starterCode: `def barzilai_borwein_step(s, y):
    # Returns [bb1, bb2]
    # Your code here
    pass`,
    solution: `def barzilai_borwein_step(s, y):
    sy = 0.0
    ss = 0.0
    yy = 0.0
    for i in range(len(s)):
        sy = sy + s[i] * y[i]
        ss = ss + s[i] * s[i]
        yy = yy + y[i] * y[i]
    if sy != 0:
        alpha1 = ss / sy
    else:
        alpha1 = 0.0
    if yy != 0:
        alpha2 = sy / yy
    else:
        alpha2 = 0.0
    return [alpha1, alpha2]`,
    testCases: [
      { input: [[1.0, 1.0], [2.0, 1.0]], expected: [0.6666666666666666, 0.6] },
      { input: [[0.5, -1.0], [1.0, -2.0]], expected: [0.5, 0.5] },
      { input: [[1.0, 2.0], [0.0, 0.0]], expected: [0.0, 0.0] },
      { input: [[2.0, 0.0], [1.0, 1.0]], expected: [2.0, 1.0] },
    ],
    hint: "BB1 and BB2 differ by which side of the secant equation they minimize.",
  },
  {
    id: "op-072",
    title: "Heavy Ball Stability Check",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Check the stability of heavy-ball momentum on a quadratic with curvature L.\n\nThe iteration converges when lr > 0, 0 <= mu < 1, and lr * L < 2 * (1 + mu) all hold. Return True only when every condition is satisfied.",
    starterCode: `def heavy_ball_stable(lr, L, mu):
    # Your code here
    pass`,
    solution: `def heavy_ball_stable(lr, L, mu):
    if lr <= 0:
        return False
    if mu < 0 or mu >= 1:
        return False
    return lr * L < 2 * (1 + mu)`,
    testCases: [
      { input: [0.1, 1.0, 0.9], expected: true },
      { input: [0.5, 1.0, 0.0], expected: true },
      { input: [2.5, 1.0, 0.5], expected: true },
      { input: [1.0, 1.0, 1.0], expected: false },
      { input: [-0.1, 1.0, 0.5], expected: false },
    ],
    hint: "Higher momentum buys a slightly larger stable step size.",
  },
  {
    id: "op-073",
    title: "Condition Number Estimate 2x2",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Estimate the condition number of a 2x2 matrix from its eigenvalues.\n\nFor A = [[a, b], [c, d]], the eigenvalues are mid +/- sqrt(((a - d) / 2) ** 2 + b * c) with mid = (a + d) / 2. Return the ratio of the largest absolute eigenvalue to the smallest, or -1.0 when the smallest is zero.",
    starterCode: `def condition_number_2x2(A):
    # Your code here
    pass`,
    solution: `def condition_number_2x2(A):
    import math
    a = A[0][0]
    b = A[0][1]
    c = A[1][0]
    d = A[1][1]
    mid = (a + d) / 2.0
    rad = math.sqrt(((a - d) / 2.0) ** 2 + b * c)
    lam1 = mid + rad
    lam2 = mid - rad
    lo = abs(lam1)
    hi = abs(lam1)
    if abs(lam2) < lo:
        lo = abs(lam2)
    if abs(lam2) > hi:
        hi = abs(lam2)
    if lo == 0:
        return -1.0
    return hi / lo`,
    testCases: [
      { input: [[[2.0, 1.0], [1.0, 2.0]]], expected: 3.0 },
      { input: [[[4.0, 1.0], [1.0, 3.0]]], expected: 1.9387489019317514 },
      { input: [[[1.0, 2.0], [2.0, 1.0]]], expected: 3.0 },
      { input: [[[1.0, 1.0], [1.0, 1.0]]], expected: -1.0 },
    ],
    hint: "The ratio of extreme absolute eigenvalues is the 2-norm condition number.",
  },
  {
    id: "op-074",
    title: "Ridge Path Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the 1D ridge regression solution along the regularization path.\n\nReturn sum(xi * yi) / (sum(xi ** 2) + lam). An empty input returns 0.0. Larger lam shrinks the coefficient toward zero.",
    starterCode: `def ridge_path_value(X, y, lam):
    # Your code here
    pass`,
    solution: `def ridge_path_value(X, y, lam):
    num = 0.0
    den = 0.0
    for xi, yi in zip(X, y):
        num = num + xi * yi
        den = den + xi * xi
    return num / (den + lam)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [2.0, 4.0, 6.0], 0.0], expected: 2.0 },
      { input: [[1.0, 2.0, 3.0], [2.0, 4.0, 6.0], 5.0], expected: 1.4736842105263157 },
      { input: [[1.0, 1.0], [1.0, -1.0], 2.0], expected: 0.0 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "Ridge adds lam to the Gram diagonal, which for one feature is sum(xi ** 2).",
  },
  {
    id: "op-075",
    title: "LASSO Coordinate Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute one coordinate-descent update for LASSO.\n\nGiven the partial residual inner product rho_j and z_j = ||X_j|| ** 2, return soft_threshold(rho_j, lam) / z_j: (rho_j - lam) / z_j when rho_j > lam, (rho_j + lam) / z_j when rho_j < -lam, and 0.0 in between. If z_j is not positive, return 0.0.",
    starterCode: `def lasso_coordinate_step(x_j, rho_j, z_j, lam):
    # Your code here
    pass`,
    solution: `def lasso_coordinate_step(x_j, rho_j, z_j, lam):
    if z_j <= 0:
        return 0.0
    if rho_j > lam:
        return (rho_j - lam) / z_j
    if rho_j < -lam:
        return (rho_j + lam) / z_j
    return 0.0`,
    testCases: [
      { input: [0.5, 1.0, 2.0, 0.25], expected: 0.375 },
      { input: [0.5, 0.1, 2.0, 0.25], expected: 0.0 },
      { input: [0.5, -1.0, 4.0, 0.5], expected: -0.125 },
      { input: [0.5, 0.3, 0.0, 0.1], expected: 0.0 },
    ],
    hint: "Soft threshold the inner product, then divide by the feature norm squared.",
  },
  {
    id: "op-076",
    title: "Elastic Net Coordinate Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute one coordinate-descent update for the elastic net.\n\nReturn soft_threshold(rho_j, lam1) / (z_j + lam2), applying the usual three-branch soft-threshold rule with threshold lam1. Return 0.0 when the denominator is not positive.",
    starterCode: `def elastic_net_coordinate_step(rho_j, z_j, lam1, lam2):
    # Your code here
    pass`,
    solution: `def elastic_net_coordinate_step(rho_j, z_j, lam1, lam2):
    den = z_j + lam2
    if den <= 0:
        return 0.0
    if rho_j > lam1:
        return (rho_j - lam1) / den
    if rho_j < -lam1:
        return (rho_j + lam1) / den
    return 0.0`,
    testCases: [
      { input: [1.0, 2.0, 0.25, 0.5], expected: 0.3 },
      { input: [0.1, 2.0, 0.25, 0.5], expected: 0.0 },
      { input: [-1.0, 4.0, 0.5, 1.0], expected: -0.1 },
      { input: [0.3, 0.0, 0.1, 0.0], expected: 0.0 },
    ],
    hint: "lam2 shrinks the denominator while lam1 soft-thresholds the numerator.",
  },
  {
    id: "op-077",
    title: "Soft Threshold Vector",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the elementwise soft-thresholding operator.\n\nFor each component return x - t if x > t, x + t if x < -t, and 0.0 otherwise. An empty list returns [].",
    starterCode: `def soft_threshold_vector(v, t):
    # Your code here
    pass`,
    solution: `def soft_threshold_vector(v, t):
    out = []
    for x in v:
        if x > t:
            out.append(x - t)
        elif x < -t:
            out.append(x + t)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1.5, -0.5, 3.0, 0.1], 1.0], expected: [0.5, 0.0, 2.0, 0.0] },
      { input: [[2.0, -2.0], 1.0], expected: [1.0, -1.0] },
      { input: [[], 0.5], expected: [] },
      { input: [[1.0, -1.0], 1.0], expected: [0.0, 0.0] },
    ],
    hint: "Small magnitudes collapse to zero; larger ones shrink by exactly t.",
  },
  {
    id: "op-078",
    title: "Hard Threshold Vector",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the elementwise hard-thresholding operator.\n\nKeep each component unchanged when abs(x) > t, otherwise return 0.0. Components exactly at the threshold are zeroed. An empty list returns [].",
    starterCode: `def hard_threshold_vector(v, t):
    # Your code here
    pass`,
    solution: `def hard_threshold_vector(v, t):
    out = []
    for x in v:
        if x > t or x < -t:
            out.append(x)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1.5, -0.5, 3.0, 0.1], 1.0], expected: [1.5, 0.0, 3.0, 0.0] },
      { input: [[2.0, -2.0], 1.0], expected: [2.0, -2.0] },
      { input: [[], 0.5], expected: [] },
      { input: [[1.0, -1.0], 1.0], expected: [0.0, 0.0] },
    ],
    hint: "Unlike soft thresholding, surviving values are not shrunk.",
  },
  {
    id: "op-079",
    title: "Non-Negative Least Squares Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one projected gradient step for non-negative least squares with a scalar weight.\n\nCompute grad = sum(xi * (w * xi - yi)), set w = w - lr * grad, then project back onto w >= 0. Return the new weight.",
    starterCode: `def nnls_step(w, X, y, lr):
    # Your code here
    pass`,
    solution: `def nnls_step(w, X, y, lr):
    grad = 0.0
    for xi, yi in zip(X, y):
        grad = grad + xi * (w * xi - yi)
    w = w - lr * grad
    if w < 0:
        w = 0.0
    return w`,
    testCases: [
      { input: [0.0, [1.0, 2.0], [2.0, 4.0], 0.1], expected: 1.0 },
      { input: [1.0, [1.0, 1.0], [0.0, 0.0], 0.5], expected: 0.0 },
      { input: [-0.5, [1.0], [2.0], 0.1], expected: 0.0 },
      { input: [2.0, [], [], 0.1], expected: 2.0 },
    ],
    hint: "Projection onto the non-negative orthant is just max(0, w).",
  },
  {
    id: "op-080",
    title: "Isotonic PAVA One Merge",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Fit an isotonic (non-decreasing) regression with the pool-adjacent-violators algorithm.\n\nProcess the values left to right, merging adjacent blocks whenever a block value exceeds the next one; a merged block takes the size-weighted average of its members. Return the fitted values with the same length as the input; an empty input returns [].",
    starterCode: `def isotonic_pava(y):
    # Your code here
    pass`,
    solution: `def isotonic_pava(y):
    vals = []
    sizes = []
    for v in y:
        vals.append(float(v))
        sizes.append(1)
        while len(vals) > 1 and vals[-2] > vals[-1]:
            v2 = vals.pop()
            s2 = sizes.pop()
            v1 = vals.pop()
            s1 = sizes.pop()
            vals.append((v1 * s1 + v2 * s2) / (s1 + s2))
            sizes.append(s1 + s2)
    out = []
    for i in range(len(vals)):
        for _ in range(sizes[i]):
            out.append(vals[i])
    return out`,
    testCases: [
      { input: [[1.0, 3.0, 2.0, 4.0]], expected: [1.0, 2.5, 2.5, 4.0] },
      { input: [[5.0, 4.0, 3.0, 2.0]], expected: [3.5, 3.5, 3.5, 3.5] },
      { input: [[1.0, 2.0, 3.0]], expected: [1.0, 2.0, 3.0] },
      { input: [[]], expected: [] },
      { input: [[2.0]], expected: [2.0] },
    ],
    hint: "Keep merging backwards while the previous block violates monotonicity.",
  },
  {
    id: "op-081",
    title: "Quantile Gradient Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one gradient step for the pinball (quantile) loss with target quantile q.\n\nLet residual = w * x - y; the subgradient factor is q - 1 when residual < 0 and q otherwise. Return w - lr * factor * x.",
    starterCode: `def quantile_gradient_step(w, x, y, q, lr):
    # Your code here
    pass`,
    solution: `def quantile_gradient_step(w, x, y, q, lr):
    residual = w * x - y
    if residual < 0:
        g = q - 1.0
    else:
        g = q
    return w - lr * g * x`,
    testCases: [
      { input: [1.0, 2.0, 1.0, 0.5, 0.1], expected: 0.9 },
      { input: [0.0, 1.0, 2.0, 0.5, 0.1], expected: 0.05 },
      { input: [1.0, 1.0, 1.0, 0.9, 0.2], expected: 0.82 },
      { input: [-1.0, 2.0, -3.0, 0.1, 0.1], expected: -1.02 },
    ],
    hint: "The pinball subgradient is q - 1 below the target and q above it.",
  },
  {
    id: "op-082",
    title: "Huber Threshold Apply",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the Huber gradient (clipped residual).\n\nReturn delta when residual > delta, -delta when residual < -delta, and residual itself inside the band. This caps the influence of large residuals.",
    starterCode: `def huber_gradient_apply(residual, delta):
    # Your code here
    pass`,
    solution: `def huber_gradient_apply(residual, delta):
    if residual > delta:
        return delta
    if residual < -delta:
        return -delta
    return residual`,
    testCases: [
      { input: [0.5, 1.0], expected: 0.5 },
      { input: [2.0, 1.0], expected: 1.0 },
      { input: [-3.0, 2.0], expected: -2.0 },
      { input: [0.0, 1.0], expected: 0.0 },
    ],
    hint: "Huber clips the residual into the interval [-delta, delta].",
  },
  {
    id: "op-083",
    title: "Tukey Bisquare Weight",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Tukey bisquare robust weight.\n\nReturn 0.0 when abs(residual) >= c or c is not positive; otherwise return (1 - (residual / c) ** 2) ** 2. The weight decreases smoothly to 0 at the cutoff c.",
    starterCode: `def tukey_bisquare_weight(residual, c):
    # Your code here
    pass`,
    solution: `def tukey_bisquare_weight(residual, c):
    if c <= 0 or abs(residual) >= c:
        return 0.0
    u = residual / c
    return (1 - u * u) ** 2`,
    testCases: [
      { input: [0.5, 4.0], expected: 0.968994140625 },
      { input: [0.0, 4.0], expected: 1.0 },
      { input: [4.0, 4.0], expected: 0.0 },
      { input: [-2.0, 4.0], expected: 0.5625 },
    ],
    hint: "The weight reaches zero exactly at the cutoff.",
  },
  {
    id: "op-084",
    title: "RANSAC Iterations Formula",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the RANSAC iteration count needed for a target success probability.\n\nWith w = inlier_ratio ** sample_size, return ceil(log(1 - success_prob) / log(1 - w)). Return 1 when w >= 1, so a perfect inlier ratio needs a single sample.",
    starterCode: `def ransac_iterations(success_prob, inlier_ratio, sample_size):
    # Your code here
    pass`,
    solution: `def ransac_iterations(success_prob, inlier_ratio, sample_size):
    import math
    w = inlier_ratio ** sample_size
    if w >= 1.0:
        return 1
    denom = math.log(1.0 - w)
    if denom == 0:
        return 1
    return int(math.ceil(math.log(1.0 - success_prob) / denom))`,
    testCases: [
      { input: [0.99, 0.5, 3], expected: 35 },
      { input: [0.999, 0.8, 2], expected: 7 },
      { input: [0.9, 1.0, 2], expected: 1 },
      { input: [0.5, 0.3, 4], expected: 86 },
    ],
    hint: "Take the ceiling of the log ratio to get an integer iteration count.",
  },
  {
    id: "op-085",
    title: "Annealing Temperature Schedule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the temperature of a geometric annealing schedule.\n\nClamp step to the interval [0, total_steps] and return t0 * (t1 / t0) ** (step / total_steps). If total_steps is not positive, return t1 immediately.",
    starterCode: `def annealing_temperature(t0, t1, total_steps, step):
    # Your code here
    pass`,
    solution: `def annealing_temperature(t0, t1, total_steps, step):
    if total_steps <= 0:
        return t1
    if step > total_steps:
        step = total_steps
    if step < 0:
        step = 0
    return t0 * ((t1 / t0) ** (step / total_steps))`,
    testCases: [
      { input: [1.0, 0.1, 100, 0], expected: 1.0 },
      { input: [1.0, 0.1, 100, 50], expected: 0.31622776601683794 },
      { input: [1.0, 0.1, 100, 100], expected: 0.1 },
      { input: [1.0, 0.1, 100, 150], expected: 0.1 },
      { input: [1.0, 0.1, 0, 5], expected: 0.1 },
    ],
    hint: "The temperature interpolates geometrically between t0 and t1.",
  },
  {
    id: "op-086",
    title: "Parallel Tempering Swap Accept",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Decide whether to swap two replicas in parallel tempering.\n\nWith log_ratio = (beta1 - beta2) * (e2 - e1), accept immediately when log_ratio >= 0; otherwise accept with probability exp(log_ratio) after random.seed(seed) followed by random.random(). Return a boolean.",
    starterCode: `def parallel_tempering_swap(beta1, e1, beta2, e2, seed):
    # Your code here
    pass`,
    solution: `def parallel_tempering_swap(beta1, e1, beta2, e2, seed):
    import math
    import random
    log_ratio = (beta1 - beta2) * (e2 - e1)
    if log_ratio >= 0:
        return True
    random.seed(seed)
    return random.random() < math.exp(log_ratio)`,
    testCases: [
      { input: [1.0, 0.5, 0.5, 2.0, 0], expected: true },
      { input: [0.5, 2.0, 1.0, 0.5, 0], expected: true },
      { input: [2.0, 1.0, 0.5, -1.0, 7], expected: false },
      { input: [1.0, 1.0, 1.0, 1.0, 3], expected: true },
    ],
    hint: "The swap is a Metropolis test on the combined energy difference.",
  },
  {
    id: "op-087",
    title: "Tournament Selection",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Select an individual by tournament selection.\n\nAfter random.seed(seed), draw k contender indices with random.randrange(len(fitness)), then return the contender with the largest fitness. When contenders tie, the one drawn earliest wins.",
    starterCode: `def tournament_selection(fitness, k, seed):
    # Your code here
    pass`,
    solution: `def tournament_selection(fitness, k, seed):
    import random
    random.seed(seed)
    contenders = [random.randrange(len(fitness)) for _ in range(k)]
    best = contenders[0]
    for idx in contenders[1:]:
        if fitness[idx] > fitness[best]:
            best = idx
    return best`,
    testCases: [
      { input: [[1.0, 5.0, 3.0], 3, 0], expected: 1 },
      { input: [[2.0, 2.0, 2.0], 2, 42], expected: 2 },
      { input: [[0.1, 0.9, 0.5, 0.7], 4, 7], expected: 1 },
    ],
    hint: "Sample contenders with replacement; only fitness decides the winner.",
  },
  {
    id: "op-088",
    title: "Roulette Selection Probabilities",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute roulette-wheel selection probabilities.\n\nReturn each fitness divided by the total fitness. If the total is 0, return equal probabilities; an empty list returns [].",
    starterCode: `def roulette_selection_probs(fitness):
    # Your code here
    pass`,
    solution: `def roulette_selection_probs(fitness):
    if not fitness:
        return []
    total = 0.0
    for f in fitness:
        total = total + f
    if total == 0:
        return [1.0 / len(fitness) for _ in fitness]
    return [f / total for f in fitness]`,
    testCases: [
      { input: [[1.0, 2.0, 1.0]], expected: [0.25, 0.5, 0.25] },
      { input: [[0.0, 0.0]], expected: [0.5, 0.5] },
      { input: [[4.0]], expected: [1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Normalize the fitness values so they sum to one.",
  },
  {
    id: "op-089",
    title: "Crossover Mask Seeded",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Generate a reproducible uniform crossover mask.\n\nAfter random.seed(seed), return a list of n entries: 1 when random.random() < rate, else 0. An n of 0 returns [].",
    starterCode: `def crossover_mask(n, rate, seed):
    # Your code here
    pass`,
    solution: `def crossover_mask(n, rate, seed):
    import random
    random.seed(seed)
    return [1 if random.random() < rate else 0 for _ in range(n)]`,
    testCases: [
      { input: [5, 0.5, 0], expected: [0, 0, 1, 1, 0] },
      { input: [8, 0.3, 42], expected: [0, 1, 1, 1, 0, 0, 0, 1] },
      { input: [0, 0.5, 7], expected: [] },
      { input: [4, 1.0, 1], expected: [1, 1, 1, 1] },
    ],
    hint: "Reseed before generating the mask so it is reproducible.",
  },
  {
    id: "op-090",
    title: "Mutation Apply Seeded",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Apply Gaussian mutation to an individual with a fixed seed.\n\nAfter random.seed(seed), for each gene draw random.random(): if it is below rate, add random.gauss(0.0, sigma) to the gene, otherwise keep it. Return the mutated list.",
    starterCode: `def mutation_apply(individual, rate, sigma, seed):
    # Your code here
    pass`,
    solution: `def mutation_apply(individual, rate, sigma, seed):
    import random
    random.seed(seed)
    out = []
    for gene in individual:
        if random.random() < rate:
            out.append(gene + random.gauss(0.0, sigma))
        else:
            out.append(gene)
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.5, 0.1, 0], expected: [1.0, 2.0, 2.993299348427094] },
      { input: [[0.0, 0.0], 1.0, 0.2, 7], expected: [0.1693037251631145, 0.2356605569278974] },
      { input: [[-1.0, 1.0], 0.0, 1.0, 3], expected: [-1.0, 1.0] },
    ],
    hint: "Decide the mutation first; only mutated genes consume a Gaussian draw.",
  },
  {
    id: "op-091",
    title: "PSO Velocity Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one PSO velocity update with seeded random coefficients.\n\nAfter random.seed(seed), draw r1 = random.random() then r2 = random.random() once per update. For each coordinate return w * v_i + c1 * r1 * (pbest_i - x_i) + c2 * r2 * (gbest_i - x_i).",
    starterCode: `def pso_velocity_update(v, x, pbest, gbest, w, c1, c2, seed):
    # Your code here
    pass`,
    solution: `def pso_velocity_update(v, x, pbest, gbest, w, c1, c2, seed):
    import random
    random.seed(seed)
    r1 = random.random()
    r2 = random.random()
    return [w * v[i] + c1 * r1 * (pbest[i] - x[i]) + c2 * r2 * (gbest[i] - x[i]) for i in range(len(v))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], [1.0, 1.0], [2.0, 2.0], 0.5, 1.0, 1.0, 0], expected: [2.860330657405653, 3.360330657405653] },
      { input: [[0.0, 0.0], [1.0, 2.0], [2.0, 1.0], [0.0, 0.0], 0.9, 1.5, 1.5, 42], expected: [0.9216240648528253, -1.0341724633548264] },
      { input: [[1.0, 0.0], [2.0, 1.0], [3.0, 3.0], [0.0, 0.0], 0.8, 1.0, 2.0, 3], expected: [-1.138952274091916, -0.612529196408121] },
      { input: [[2.0, -1.0, 0.5], [0.0, 0.0, 0.0], [1.0, 2.0, 3.0], [3.0, 2.0, 1.0], 1.0, 0.5, 0.5, 99], expected: [2.502102204334251, -0.39594648048138825, 1.2060048347029722] },
    ],
    hint: "Both random coefficients are drawn once per velocity update, not per coordinate.",
  },
  {
    id: "op-092",
    title: "DE Mutant Vector",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Build a differential evolution mutant vector for individual i.\n\nAfter random.seed(seed), sample three distinct indices a, b, c from all indices except i using random.sample, then return population[a] + f * (population[b] - population[c]) elementwise.",
    starterCode: `def de_mutant_vector(population, i, f, seed):
    # Your code here
    pass`,
    solution: `def de_mutant_vector(population, i, f, seed):
    import random
    random.seed(seed)
    n = len(population)
    candidates = [j for j in range(n) if j != i]
    picked = random.sample(candidates, 3)
    a = picked[0]
    b = picked[1]
    c = picked[2]
    return [population[a][k] + f * (population[b][k] - population[c][k]) for k in range(len(population[i]))]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [7.0, 8.0]], 0, 0.5, 0], expected: [7.0, 8.0] },
      { input: [[[0.0], [1.0], [2.0], [3.0]], 2, 0.8, 42], expected: [2.2] },
      { input: [[[1.0, 0.0], [0.0, 1.0], [2.0, 2.0], [-1.0, -1.0]], 3, 0.3, 7], expected: [-0.3, 0.4] },
    ],
    hint: "Indices a, b, and c must be distinct and different from i.",
  },
  {
    id: "op-093",
    title: "CEM Elite Count",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the number of elite samples in a cross-entropy method iteration.\n\nReturn max(1, int(n_samples * elite_frac)), where int truncates toward zero. At least one elite sample is always kept.",
    starterCode: `def cem_elite_count(n_samples, elite_frac):
    # Your code here
    pass`,
    solution: `def cem_elite_count(n_samples, elite_frac):
    k = int(n_samples * elite_frac)
    if k < 1:
        k = 1
    return k`,
    testCases: [
      { input: [20, 0.5], expected: 10 },
      { input: [10, 0.3], expected: 3 },
      { input: [8, 0.05], expected: 1 },
      { input: [1, 0.9], expected: 1 },
      { input: [100, 0.1], expected: 10 },
    ],
    hint: "int truncates, and the max with 1 prevents an empty elite set.",
  },
  {
    id: "op-094",
    title: "UCB Exploration Term",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the UCB exploration bonus for one arm.\n\nReturn c * sqrt(log(total) / count), or 0.0 when count <= 0 or total <= 1. Here total is the number of pulls across all arms and count is this arm's pull count.",
    starterCode: `def ucb_exploration_term(count, total, c):
    # Your code here
    pass`,
    solution: `def ucb_exploration_term(count, total, c):
    import math
    if count <= 0 or total <= 1:
        return 0.0
    return c * math.sqrt(math.log(total) / count)`,
    testCases: [
      { input: [5, 100, 1.0], expected: 0.9597051824376163 },
      { input: [1, 10, 2.0], expected: 3.034854258770293 },
      { input: [0, 10, 1.0], expected: 0.0 },
      { input: [3, 1, 1.0], expected: 0.0 },
    ],
    hint: "The bonus grows with log(total) and shrinks as the arm is pulled more.",
  },
  {
    id: "op-095",
    title: "Regret Bound Value",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the standard UCB regret bound for a single suboptimal arm with gap delta after T pulls.\n\nReturn 8 * log(T) / delta + (1 + pi ** 2 / 3) * delta, using the natural logarithm. Return 0.0 when delta <= 0 or T < 1.",
    starterCode: `def regret_bound_value(delta, T):
    # Your code here
    pass`,
    solution: `def regret_bound_value(delta, T):
    import math
    if delta <= 0 or T < 1:
        return 0.0
    return 8.0 * math.log(T) / delta + (1.0 + (math.pi ** 2) / 3.0) * delta`,
    testCases: [
      { input: [0.1, 1000], expected: 553.0494091319406 },
      { input: [1.0, 10], expected: 22.71054887764882 },
      { input: [0.5, 100], expected: 75.82765704265769 },
      { input: [0.0, 50], expected: 0.0 },
    ],
    hint: "The logarithmic term dominates as T grows; the linear term accounts for the gap.",
  },
];
