import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-316",
    title: "L2 Regularized Gradient",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Adding an L2 penalty (lambda / 2) * ||w||^2 to a loss adds lambda * w to the gradient.\n\nGiven the data gradient and the weights, return the regularized gradient for the supplied lambda.",
    starterCode: `def l2_regularized_gradient(grad, weights, lam):
    # Your code here
    pass`,
    solution: `def l2_regularized_gradient(grad, weights, lam):
    return [g + lam * w for g, w in zip(grad, weights)]`,
    testCases: [
      { input: [[1, 2], [3, 4], 0.1], expected: [1.3, 2.4] },
      { input: [[0, 0], [1, -1], 1.0], expected: [1.0, -1.0] },
      { input: [[2], [0], 5.0], expected: [2.0] },
    ],
    hint: "The penalty gradient is linear in the weights.",
  },
  {
    id: "op-317",
    title: "L1 Regularized Subgradient",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Adding an L1 penalty lambda * ||w||_1 adds lambda * sign(w) to the gradient, using the subgradient 0 at w = 0.\n\nGiven the data gradient and the weights, return the regularized subgradient.",
    starterCode: `def l1_regularized_subgradient(grad, weights, lam):
    # Your code here
    pass`,
    solution: `def l1_regularized_subgradient(grad, weights, lam):
    out = []
    for g, w in zip(grad, weights):
        if w > 0:
            out.append(g + lam)
        elif w < 0:
            out.append(g - lam)
        else:
            out.append(g)
    return out`,
    testCases: [
      { input: [[1, 2], [3, 4], 0.5], expected: [1.5, 2.5] },
      { input: [[0, 0, 0], [0, -2, 0], 1.0], expected: [0, -1.0, 0] },
      { input: [[-1], [5], 0.25], expected: [-0.75] },
    ],
    hint: "The subgradient of |w| is the sign of w, with zero chosen at the kink.",
  },
  {
    id: "op-318",
    title: "Elastic Net Gradient Vector",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The elastic net penalty combines L1 and L2: lambda1 * ||w||_1 + (lambda2 / 2) * ||w||^2, whose gradient adds lambda1 * sign(w) + lambda2 * w.\n\nGiven the data gradient, the weights, lambda1, and lambda2, return the penalized gradient.",
    starterCode: `def elastic_net_gradient_vector(grad, weights, lambda1, lambda2):
    # Your code here
    pass`,
    solution: `def elastic_net_gradient_vector(grad, weights, lambda1, lambda2):
    out = []
    for g, w in zip(grad, weights):
        s = 1.0 if w > 0 else (-1.0 if w < 0 else 0.0)
        out.append(g + lambda1 * s + lambda2 * w)
    return out`,
    testCases: [
      { input: [[1, 2], [1, 1], 0.1, 0.2], expected: [1.3, 2.3000000000000003] },
      { input: [[0, 0], [-1, 0], 0.5, 0.5], expected: [-1.0, 0.0] },
      { input: [[3], [0], 1.0, 0.0], expected: [3.0] },
    ],
    hint: "Combine both penalty gradients term by term.",
  },
  {
    id: "op-319",
    title: "Proximal Gradient L1 Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "One proximal gradient step for an L1-penalized objective evaluates z = w - lr * grad, then applies the soft threshold with parameter lr * lambda.\n\nGiven w, grad, lr, and lambda, return the updated vector.",
    starterCode: `def proximal_gradient_l1_step(w, grad, lr, lam):
    # Your code here
    pass`,
    solution: `def proximal_gradient_l1_step(w, grad, lr, lam):
    out = []
    for wi, gi in zip(w, grad):
        z = wi - lr * gi
        t = lr * lam
        if z > t:
            out.append(z - t)
        elif z < -t:
            out.append(z + t)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1, 2], [0.5, -0.5], 0.1, 0.5], expected: [0.8999999999999999, 1.9999999999999998] },
      { input: [[0, 0], [1, 1], 1.0, 0.5], expected: [-0.5, -0.5] },
      { input: [[3, -3], [0, 0], 0.1, 0.5], expected: [2.95, -2.95] },
    ],
    hint: "Soft threshold each coordinate after the gradient step.",
  },
  {
    id: "op-320",
    title: "Proximal Operator of L1 Vector",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The proximal operator of t * ||v||_1 is the soft threshold sign(v) * max(|v| - t, 0) applied coordinatewise.\n\nGiven the vector and threshold t, return the prox.",
    starterCode: `def proximal_operator_l1_vector(v, t):
    # Your code here
    pass`,
    solution: `def proximal_operator_l1_vector(v, t):
    out = []
    for vi in v:
        if vi > t:
            out.append(vi - t)
        elif vi < -t:
            out.append(vi + t)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1, -2, 0.1], 0.5], expected: [0.5, -1.5, 0.0] },
      { input: [[3, -4], 1.0], expected: [2.0, -3.0] },
      { input: [[2, 2], 2.0], expected: [0.0, 0.0] },
    ],
    hint: "Shrink every coordinate toward zero by t, flooring at zero.",
  },
  {
    id: "op-321",
    title: "Lasso Coordinate Descent Sweep",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "For a Lasso objective 0.5 * ||A x - b||^2 + lambda * ||x||_1, one coordinate update sets x_j = soft(a_j dot r_j, lambda) / ||a_j||^2, where a_j is column j and r_j = b - sum_{k != j} a_k x_k.\n\nGiven A as nested rows, b, x, and lambda, perform one full sweep in order and return the updated x.",
    starterCode: `def lasso_coordinate_descent_sweep(a, b, x, lam):
    # Your code here
    pass`,
    solution: `def lasso_coordinate_descent_sweep(a, b, x, lam):
    m = len(a)
    n = len(a[0])
    out = list(x)
    for j in range(n):
        partial = [b[i] - sum(a[i][k] * out[k] for k in range(n) if k != j) for i in range(m)]
        rho = sum(a[i][j] * partial[i] for i in range(m))
        norm = sum(a[i][j] * a[i][j] for i in range(m))
        if rho > lam:
            out[j] = (rho - lam) / norm
        elif rho < -lam:
            out[j] = (rho + lam) / norm
        else:
            out[j] = 0.0
    return out`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, -2], [0.5, 0.5], 0.1], expected: [0.9, -1.9] },
      { input: [[[1, 1]], [2], [1, 0], 0.5], expected: [1.5, 0.0] },
      { input: [[[2, 0], [0, 2]], [3, 4], [0, 0], 0.25], expected: [1.4375, 1.9375] },
    ],
    hint: "Use the partial residual with all other coordinates fixed.",
  },
  {
    id: "op-322",
    title: "Soft Threshold Scalar Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The scalar soft threshold operator is sign(v) * max(|v| - t, 0).\n\nGiven v and t >= 0, return the thresholded value.",
    starterCode: `def soft_threshold_scalar_value(v, t):
    # Your code here
    pass`,
    solution: `def soft_threshold_scalar_value(v, t):
    if v > t:
        return v - t
    if v < -t:
        return v + t
    return 0.0`,
    testCases: [
      { input: [1.5, 0.5], expected: 1.0 },
      { input: [-3.0, 1.0], expected: -2.0 },
      { input: [0.25, 0.5], expected: 0.0 },
    ],
    hint: "Values within the threshold band collapse to zero.",
  },
  {
    id: "op-323",
    title: "Hard Threshold Scalar Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The hard threshold operator keeps v when |v| > t and returns zero otherwise.\n\nGiven v and t >= 0, return the thresholded value.",
    starterCode: `def hard_threshold_scalar_value(v, t):
    # Your code here
    pass`,
    solution: `def hard_threshold_scalar_value(v, t):
    return v if abs(v) > t else 0.0`,
    testCases: [
      { input: [2.0, 0.5], expected: 2.0 },
      { input: [-1.0, 1.0], expected: 0.0 },
      { input: [0.5, 0.5], expected: 0.0 },
    ],
    hint: "Strict inequality: equality maps to zero.",
  },
  {
    id: "op-324",
    title: "Newton Step for Quadratic 2D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "For f(x) = 0.5 x^T A x - b^T x, the Newton step from x is x_new = x - A^{-1} (A x - b), which reaches the minimizer in one step for a symmetric positive definite A.\n\nGiven A as nested rows, b, and x, return the updated point.",
    starterCode: `def newton_step_quadratic_2d(a, b, x):
    # Your code here
    pass`,
    solution: `def newton_step_quadratic_2d(a, b, x):
    g = [a[0][0] * x[0] + a[0][1] * x[1] - b[0], a[1][0] * x[0] + a[1][1] * x[1] - b[1]]
    det = a[0][0] * a[1][1] - a[0][1] * a[1][0]
    inv = [[a[1][1] / det, -a[0][1] / det], [-a[1][0] / det, a[0][0] / det]]
    step = [inv[0][0] * g[0] + inv[0][1] * g[1], inv[1][0] * g[0] + inv[1][1] * g[1]]
    return [x[0] - step[0], x[1] - step[1]]`,
    testCases: [
      { input: [[[2, 0], [0, 4]], [2, 8], [0, 0]], expected: [1.0, 2.0] },
      { input: [[[1, 0], [0, 1]], [1, 1], [3, -2]], expected: [1.0, 1.0] },
      { input: [[[2, 1], [1, 2]], [1, 1], [0, 0]], expected: [0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "Compute the gradient, invert the 2x2 Hessian, and subtract.",
  },
  {
    id: "op-325",
    title: "Gauss Newton Exponential Fit Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For the model y = a * exp(b t) with residuals r_i = a exp(b t_i) - y_i, the Jacobian rows are [exp(b t_i), a t_i exp(b t_i)]. One Gauss-Newton step solves (J^T J) delta = -J^T r and returns [a, b] + delta.\n\nGiven the current parameters [a, b], the times, and the observed values, return the updated parameters.",
    starterCode: `def gauss_newton_exponential_fit_step(params, times, values):
    # Your code here
    pass`,
    solution: `def gauss_newton_exponential_fit_step(params, times, values):
    import math
    a, b = params
    r = []
    j = []
    for t, y in zip(times, values):
        e = math.exp(b * t)
        r.append(a * e - y)
        j.append([e, a * t * e])
    jtj = [[sum(j[k][p] * j[k][q] for k in range(len(j))) for q in range(2)] for p in range(2)]
    jtr = [sum(j[k][p] * r[k] for k in range(len(j))) for p in range(2)]
    det = jtj[0][0] * jtj[1][1] - jtj[0][1] * jtj[1][0]
    inv = [[jtj[1][1] / det, -jtj[0][1] / det], [-jtj[1][0] / det, jtj[0][0] / det]]
    delta = [-(inv[0][0] * jtr[0] + inv[0][1] * jtr[1]), -(inv[1][0] * jtr[0] + inv[1][1] * jtr[1])]
    return [a + delta[0], b + delta[1]]`,
    testCases: [
      { input: [[1.0, 0.5], [0, 1, 2], [1.0, 1.6487212707, 2.7182818285]], expected: [0.9999999999941608, 0.5000000000100576] },
      { input: [[2.0, -0.5], [0, 1], [2.0, 1.2130613194]], expected: [2.0, -0.500000000020829] },
      { input: [[1.5, 0.1], [0, 2, 4], [1.5, 1.8321552334, 2.2378621183]], expected: [1.499999958803758, 0.10001397680764107] },
    ],
    hint: "Build J from the partial derivatives, then solve the normal equations.",
  },
  {
    id: "op-326",
    title: "Secant Hessian Approximation",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The secant equation in one dimension approximates the second derivative by the slope of the gradient: H \u2248 (g(x1) - g(x0)) / (x1 - x0).\n\nGiven the two gradient values and the two points, return the approximation.",
    starterCode: `def secant_hessian_approximation(g1, g0, x1, x0):
    # Your code here
    pass`,
    solution: `def secant_hessian_approximation(g1, g0, x1, x0):
    return (g1 - g0) / (x1 - x0)`,
    testCases: [
      { input: [6, 2, 2, 0], expected: 2.0 },
      { input: [-1, 1, 1, 0], expected: -2.0 },
      { input: [0, 0, 5, 1], expected: 0.0 },
    ],
    hint: "This is the finite-difference slope of the gradient function.",
  },
  {
    id: "op-327",
    title: "BFGS Scalar Inverse Hessian Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "In one dimension the BFGS inverse Hessian update reduces to H_new = s / y with s = x_new - x_old and y = g_new - g_old; return the previous H when y is zero.\n\nGiven s, y, and the previous inverse Hessian h0, return the updated value.",
    starterCode: `def bfgs_scalar_inverse_hessian_update(s, y, h0):
    # Your code here
    pass`,
    solution: `def bfgs_scalar_inverse_hessian_update(s, y, h0):
    if y == 0:
        return h0
    return s / y`,
    testCases: [
      { input: [1.0, 2.0, 1.0], expected: 0.5 },
      { input: [0.5, 0.0, 3.0], expected: 3.0 },
      { input: [-0.25, -0.5, 2.0], expected: 0.5 },
    ],
    hint: "The curvature condition y > 0 keeps the estimate positive.",
  },
  {
    id: "op-328",
    title: "Coordinate Descent Quadratic Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For the 1D restriction f(x) = 0.5 * a * x^2 - b * x with a > 0, the coordinate-wise minimizer is x* = b / a.\n\nGiven a and b, return the update.",
    starterCode: `def coordinate_descent_quadratic_update(a, b):
    # Your code here
    pass`,
    solution: `def coordinate_descent_quadratic_update(a, b):
    return b / a`,
    testCases: [
      { input: [2, 4], expected: 2.0 },
      { input: [1, -3], expected: -3.0 },
      { input: [0.5, 1], expected: 2.0 },
    ],
    hint: "Set the scalar derivative a x - b to zero.",
  },
  {
    id: "op-329",
    title: "Proximal Operator of Quadratic",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The proximal operator of t * 0.5 * a * (x - c)^2 is (v + t a c) / (1 + t a).\n\nGiven v, c, the step t, and the curvature a > 0, return the prox value.",
    starterCode: `def proximal_operator_quadratic(v, c, t, a):
    # Your code here
    pass`,
    solution: `def proximal_operator_quadratic(v, c, t, a):
    return (v + t * a * c) / (1.0 + t * a)`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 2.0], expected: 0.5 },
      { input: [3.0, 1.0, 1.0, 1.0], expected: 2.0 },
      { input: [0.0, 5.0, 2.0, 0.5], expected: 2.5 },
    ],
    hint: "Solve the scalar problem min_x 0.5 (x - v)^2 + t * 0.5 * a (x - c)^2.",
  },
  {
    id: "op-330",
    title: "Lasso Coordinate Step Scalar",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "In coordinate descent for the Lasso, the scalar update is soft(b, lambda) / a where a is the squared column norm and b the partial correlation.\n\nGiven a > 0, b, and lambda, return the coordinate update.",
    starterCode: `def lasso_coordinate_step_scalar(a, b, lam):
    # Your code here
    pass`,
    solution: `def lasso_coordinate_step_scalar(a, b, lam):
    if b > lam:
        return (b - lam) / a
    if b < -lam:
        return (b + lam) / a
    return 0.0`,
    testCases: [
      { input: [2.0, 3.0, 0.5], expected: 1.25 },
      { input: [1.0, 0.25, 0.5], expected: 0.0 },
      { input: [4.0, -2.0, 1.0], expected: -0.25 },
    ],
    hint: "Soft threshold the partial correlation, then divide by the column norm.",
  },
  {
    id: "op-331",
    title: "Dual Ascent Multiplier Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For a constraint g(x) <= 0, dual ascent updates the multiplier as max(0, lambda + lr * g(x)).\n\nGiven the multiplier, the constraint value, and lr, return the updated multiplier.",
    starterCode: `def dual_ascent_multiplier_step(multiplier, violation, lr):
    # Your code here
    pass`,
    solution: `def dual_ascent_multiplier_step(multiplier, violation, lr):
    return max(0.0, multiplier + lr * violation)`,
    testCases: [
      { input: [0.0, 1.0, 0.5], expected: 0.5 },
      { input: [2.0, -1.0, 1.0], expected: 1.0 },
      { input: [1.0, 0.0, 3.0], expected: 1.0 },
    ],
    hint: "Project the dual update onto the nonnegative orthant.",
  },
  {
    id: "op-332",
    title: "Augmented Lagrangian Multiplier Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The augmented Lagrangian method updates the multiplier as lambda + rho * g(x), where g(x) is the equality constraint violation and rho the penalty parameter.\n\nGiven the multiplier, the violation, and rho, return the updated multiplier.",
    starterCode: `def augmented_lagrangian_multiplier_update(multiplier, violation, rho):
    # Your code here
    pass`,
    solution: `def augmented_lagrangian_multiplier_update(multiplier, violation, rho):
    return multiplier + rho * violation`,
    testCases: [
      { input: [0.0, 1.0, 10.0], expected: 10.0 },
      { input: [2.0, -0.5, 4.0], expected: 0.0 },
      { input: [-1.0, 0.25, 8.0], expected: 1.0 },
    ],
    hint: "The dual variable accumulates the scaled violation.",
  },
  {
    id: "op-333",
    title: "Box Constrained Projected Gradient Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "A projected gradient step moves along -grad with step lr, then projects the result onto the box [lo, hi].\n\nGiven x, grad, lr, lo, and hi, return the updated point.",
    starterCode: `def projected_gradient_box_step(x, grad, lr, lo, hi):
    # Your code here
    pass`,
    solution: `def projected_gradient_box_step(x, grad, lr, lo, hi):
    return [min(max(v - lr * g, lo), hi) for v, g in zip(x, grad)]`,
    testCases: [
      { input: [[0, 0], [1, -1], 0.5, -0.2, 0.2], expected: [-0.2, 0.2] },
      { input: [[0.5], [2], 1.0, 0.0, 1.0], expected: [0.0] },
      { input: [[1, 1], [-1, -1], 2.0, 0.0, 3.0], expected: [3.0, 3.0] },
    ],
    hint: "Gradient step first, clipping second.",
  },
  {
    id: "op-334",
    title: "Log Barrier Objective Value",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The logarithmic barrier for constraints g_i(x) < 0 is -sum_i log(-g_i(x)).\n\nGiven the constraint values, return the barrier value, or None when any constraint value is nonnegative.",
    starterCode: `def log_barrier_objective_value(constraints):
    # Your code here
    pass`,
    solution: `def log_barrier_objective_value(constraints):
    import math
    total = 0.0
    for g in constraints:
        if g >= 0:
            return None
        total += -math.log(-g)
    return total`,
    testCases: [
      { input: [[-1.0, -2.0]], expected: -0.6931471805599453 },
      { input: [[-0.5]], expected: 0.6931471805599453 },
      { input: [[-1.0, 0.0, -2.0]], expected: null },
    ],
    hint: "The barrier is finite only strictly inside the feasible region.",
  },
  {
    id: "op-335",
    title: "Trust Region Radius Contraction",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Standard trust-region radius rules: shrink to 0.25 * radius when the gain ratio is below 0.25, double the radius when the ratio exceeds 0.75 and the step is on the boundary, and keep it otherwise.\n\nGiven the current radius, the gain ratio rho, and a boolean for boundary contact, return the new radius.",
    starterCode: `def trust_region_radius_contraction(radius, rho, at_boundary):
    # Your code here
    pass`,
    solution: `def trust_region_radius_contraction(radius, rho, at_boundary):
    if rho < 0.25:
        return 0.25 * radius
    if rho > 0.75 and at_boundary:
        return 2.0 * radius
    return radius`,
    testCases: [
      { input: [1.0, 0.1, true], expected: 0.25 },
      { input: [1.0, 0.9, true], expected: 2.0 },
      { input: [2.0, 0.9, false], expected: 2.0 },
    ],
    hint: "Order the checks so poor agreement dominates.",
  },
];
