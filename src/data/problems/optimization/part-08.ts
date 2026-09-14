import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-276",
    title: "Quadratic Stability Upper Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Gradient descent on f(x) = 0.5 * a * x^2 oscillates unless the learning rate satisfies 0 < lr < 2 / a.\n\nGiven the curvature a > 0, return the upper stability bound 2 / a.",
    starterCode: `def quadratic_stability_upper_step(a):
    # Your code here
    pass`,
    solution: `def quadratic_stability_upper_step(a):
    return 2.0 / a`,
    testCases: [
      { input: [1], expected: 2.0 },
      { input: [4], expected: 0.5 },
      { input: [0.5], expected: 4.0 },
    ],
    hint: "The iterate multiplier is 1 - lr * a; keep its magnitude below one.",
  },
  {
    id: "op-277",
    title: "Quadratic Minimum Value",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For f(x) = a x^2 + b x + c with a > 0, the minimizer is x* = -b / (2a) and the minimum value is c - b^2 / (4a).\n\nGiven a, b, and c, return the minimum value.",
    starterCode: `def quadratic_minimum_value(a, b, c):
    # Your code here
    pass`,
    solution: `def quadratic_minimum_value(a, b, c):
    return c - b * b / (4.0 * a)`,
    testCases: [
      { input: [1, 2, 3], expected: 2.0 },
      { input: [2, -4, 1], expected: -1.0 },
      { input: [0.5, 1, 0], expected: -0.5 },
    ],
    hint: "Complete the square or substitute the vertex into f.",
  },
  {
    id: "op-278",
    title: "GD Iteration Count Bound",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For an L-smooth, mu-strongly convex function, gradient descent contracts the distance to the optimum by (1 - mu/L) per step, so reaching accuracy eps from x0 takes at least log(eps / |x0|) / log(1 - mu / L) steps.\n\nGiven L, mu, eps, and x0, return the ceiling of that bound; return 0 when x0 is zero.",
    starterCode: `def gd_iteration_count_bound(l, mu, eps, x0):
    # Your code here
    pass`,
    solution: `def gd_iteration_count_bound(l, mu, eps, x0):
    import math
    if x0 == 0:
        return 0
    return math.ceil(math.log(eps / abs(x0)) / math.log(1.0 - mu / l))`,
    testCases: [
      { input: [10, 1, 0.001, 1.0], expected: 66 },
      { input: [4, 2, 1e-06, 5.0], expected: 23 },
      { input: [100, 1, 0.5, 1.0], expected: 69 },
    ],
    hint: "Solve (1 - mu/L)^k * |x0| = eps for k and round up.",
  },
  {
    id: "op-279",
    title: "Quadratic Minimizer Existence",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For f(x) = a x^2 + b x + c, a finite minimizer exists only when a > 0, and then x* = -b / (2a).\n\nGiven a, b, and c, return the minimizer, or None when a <= 0.",
    starterCode: `def quadratic_minimizer_existence(a, b, c):
    # Your code here
    pass`,
    solution: `def quadratic_minimizer_existence(a, b, c):
    if a <= 0:
        return None
    return -b / (2.0 * a)`,
    testCases: [
      { input: [1, 4, 0], expected: -2.0 },
      { input: [-1, 2, 0], expected: null },
      { input: [2, -8, 3], expected: 2.0 },
    ],
    hint: "A concave or linear objective diverges to -infinity.",
  },
  {
    id: "op-280",
    title: "Steepest Descent Contraction Ratio",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For a quadratic with smoothness L and strong convexity mu, the steepest descent method contracts the error by ((L - mu) / (L + mu))^2 per iteration.\n\nGiven L and mu with L > mu > 0, return this contraction factor.",
    starterCode: `def steepest_descent_contraction_ratio(l, mu):
    # Your code here
    pass`,
    solution: `def steepest_descent_contraction_ratio(l, mu):
    return ((l - mu) / (l + mu)) ** 2`,
    testCases: [
      { input: [10, 1], expected: 0.6694214876033059 },
      { input: [4, 2], expected: 0.1111111111111111 },
      { input: [100, 50], expected: 0.1111111111111111 },
    ],
    hint: "It depends only on the condition number through the ratio of L - mu to L + mu.",
  },
  {
    id: "op-281",
    title: "Armijo Backtracking Halving Count",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Along a direction with initial local model f(lr) = f0 + slope * lr + 0.5 * curvature * lr^2, backtracking halves the step until f(lr) <= f0 + c * slope * lr (Armijo).\n\nGiven f0, slope (negative), curvature, initial lr, the halving factor rho, and c, return [halvings, final_lr, final_f].",
    starterCode: `def armijo_backtracking_halving_count(f0, slope, curvature, lr, rho, c):
    # Your code here
    pass`,
    solution: `def armijo_backtracking_halving_count(f0, slope, curvature, lr, rho, c):
    count = 0
    while True:
        f = f0 + slope * lr + 0.5 * curvature * lr * lr
        if f <= f0 + c * slope * lr:
            return [count, lr, f]
        lr *= rho
        count += 1`,
    testCases: [
      { input: [1, -2, 1, 1.0, 0.5, 0.1], expected: [0, 1.0, -0.5] },
      { input: [5, -1, 10, 2.0, 0.5, 0.5], expected: [5, 0.0625, 4.95703125] },
      { input: [0, -4, 0, 1.0, 0.5, 0.25], expected: [0, 1.0, -4.0] },
    ],
    hint: "Evaluate the quadratic model at the trial step before every shrink.",
  },
  {
    id: "op-282",
    title: "Strong Convexity Modulus 2x2",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For the quadratic f(x) = 0.5 x^T A x with symmetric A = [[a, b], [b, d]], the strong convexity modulus is the smaller eigenvalue (a + d - sqrt((a - d)^2 + 4 b^2)) / 2.\n\nGiven the entries, return the modulus.",
    starterCode: `def strong_convexity_modulus_2x2(a, b, d):
    # Your code here
    pass`,
    solution: `def strong_convexity_modulus_2x2(a, b, d):
    import math
    return 0.5 * (a + d - math.sqrt((a - d) ** 2 + 4.0 * b * b))`,
    testCases: [
      { input: [2, 0, 4], expected: 2.0 },
      { input: [3, 1, 3], expected: 2.0 },
      { input: [5, -2, 5], expected: 3.0 },
    ],
    hint: "Use the closed-form eigenvalues of a symmetric 2x2 matrix.",
  },
  {
    id: "op-283",
    title: "Smoothness Constant 2x2 Quadratic",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For f(x) = 0.5 x^T A x with symmetric A = [[a, b], [b, d]], the smoothness constant is the larger eigenvalue (a + d + sqrt((a - d)^2 + 4 b^2)) / 2, which bounds the local curvature of the gradient.\n\nGiven the entries, return the constant.",
    starterCode: `def smoothness_constant_2x2_quadratic(a, b, d):
    # Your code here
    pass`,
    solution: `def smoothness_constant_2x2_quadratic(a, b, d):
    import math
    return 0.5 * (a + d + math.sqrt((a - d) ** 2 + 4.0 * b * b))`,
    testCases: [
      { input: [2, 0, 4], expected: 4.0 },
      { input: [1, 1, 1], expected: 2.0 },
      { input: [0, 2, 0], expected: 2.0 },
    ],
    hint: "The top eigenvalue of the Hessian controls the gradient Lipschitz bound.",
  },
  {
    id: "op-284",
    title: "Saddle Negative Curvature Direction",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "At a saddle point of f(x) = 0.5 x^T A x with symmetric A = [[a, b], [b, d]], the escape direction is the unit eigenvector of the smaller eigenvalue lambda_min = (a + d - sqrt((a - d)^2 + 4 b^2)) / 2.\n\nGiven a, b, and d, return the normalized eigenvector [b, lambda_min - a] when b is nonzero, otherwise [1, 0] if a <= d else [0, 1].",
    starterCode: `def saddle_negative_curvature_direction(a, b, d):
    # Your code here
    pass`,
    solution: `def saddle_negative_curvature_direction(a, b, d):
    import math
    lam = 0.5 * (a + d - math.sqrt((a - d) ** 2 + 4.0 * b * b))
    if abs(b) > 1e-12:
        v = [b, lam - a]
    elif a <= d:
        v = [1.0, 0.0]
    else:
        v = [0.0, 1.0]
    norm = math.sqrt(v[0] ** 2 + v[1] ** 2)
    return [v[0] / norm, v[1] / norm]`,
    testCases: [
      { input: [2, 0, 4], expected: [1.0, 0.0] },
      { input: [1, 1, 1], expected: [0.7071067811865475, -0.7071067811865475] },
      { input: [1, 0, 1], expected: [1.0, 0.0] },
    ],
    hint: "Solve (A - lambda I) v = 0 for the smaller eigenvalue and normalize.",
  },
  {
    id: "op-285",
    title: "Projection Onto a Box",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The Euclidean projection of a point onto the box [lo, hi] clips each coordinate to the interval.\n\nGiven the point and the lower and upper bounds (lo <= hi), return the projected point.",
    starterCode: `def projection_onto_box(x, lo, hi):
    # Your code here
    pass`,
    solution: `def projection_onto_box(x, lo, hi):
    return [min(max(v, lo), hi) for v in x]`,
    testCases: [
      { input: [[2, -1, 5], 0, 3], expected: [2, 0, 3] },
      { input: [[0.5, 0.5], 0.4, 0.6], expected: [0.5, 0.5] },
      { input: [[-2, -2], -1, 1], expected: [-1, -1] },
    ],
    hint: "Clamp each coordinate independently.",
  },
  {
    id: "op-286",
    title: "Projection Onto Nonnegative Orthant",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The Euclidean projection onto the nonnegative orthant replaces negative coordinates with zero.\n\nGiven the point, return the projected point.",
    starterCode: `def projection_onto_nonnegative_orthant(x):
    # Your code here
    pass`,
    solution: `def projection_onto_nonnegative_orthant(x):
    return [v if v > 0 else 0.0 for v in x]`,
    testCases: [
      { input: [[1, -2, 3]], expected: [1, 0.0, 3] },
      { input: [[-1, -1]], expected: [0.0, 0.0] },
      { input: [[0, 4]], expected: [0.0, 4] },
    ],
    hint: "Take the positive part of every coordinate.",
  },
  {
    id: "op-287",
    title: "Projection Onto L2 Ball",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The Euclidean projection onto the ball of radius r keeps points already inside and rescales outside points by r / ||x||.\n\nGiven the point and the radius r > 0, return the projection. Return the input copy when the norm is zero.",
    starterCode: `def projection_onto_l2_ball(x, radius):
    # Your code here
    pass`,
    solution: `def projection_onto_l2_ball(x, radius):
    import math
    norm = math.sqrt(sum(v * v for v in x))
    if norm <= radius:
        return list(x)
    scale = radius / norm
    return [v * scale for v in x]`,
    testCases: [
      { input: [[1, 0], 2.0], expected: [1, 0] },
      { input: [[3, 4], 2.0], expected: [1.2000000000000002, 1.6] },
      { input: [[0, 0], 1.0], expected: [0, 0] },
    ],
    hint: "Only the radial component scales; direction is preserved.",
  },
  {
    id: "op-288",
    title: "Projection Onto Probability Simplex",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Projecting y onto the probability simplex (nonnegative entries summing to one) uses the sorted-threshold algorithm: sort y descending, find the largest rho with y_sorted[rho-1] + (1 - sum of the top rho) / rho > 0, then return max(y_i - theta, 0) with theta = (sum of the top rho - 1) / rho.\n\nGiven y, return the projected vector.",
    starterCode: `def projection_onto_probability_simplex(y):
    # Your code here
    pass`,
    solution: `def projection_onto_probability_simplex(y):
    n = len(y)
    order = sorted(range(n), key=lambda i: y[i], reverse=True)
    sorted_y = [y[i] for i in order]
    cumulative = 0.0
    rho = 0
    theta = 0.0
    for k in range(1, n + 1):
        cumulative += sorted_y[k - 1]
        t = (cumulative - 1.0) / k
        if sorted_y[k - 1] - t > 0:
            rho = k
            theta = t
    out = [0.0] * n
    for i in range(n):
        v = y[i] - theta
        out[i] = v if v > 0 else 0.0
    return out`,
    testCases: [
      { input: [[0.5, 0.5]], expected: [0.5, 0.5] },
      { input: [[2, 1, 0]], expected: [1.0, 0.0, 0.0] },
      { input: [[-1, 4, -2, 1]], expected: [0.0, 1.0, 0.0, 0.0] },
    ],
    hint: "The threshold is the average excess of the active top block above one.",
  },
  {
    id: "op-289",
    title: "Quadratic Gradient Descent Two Steps",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Starting from x0, apply two gradient descent steps with learning rate lr on f(x) = 0.5 * a * x^2, whose gradient is a * x.\n\nGiven x0, lr, and a, return the value after two steps.",
    starterCode: `def quadratic_gradient_descent_two_steps(x0, lr, a):
    # Your code here
    pass`,
    solution: `def quadratic_gradient_descent_two_steps(x0, lr, a):
    x1 = x0 - lr * a * x0
    return x1 - lr * a * x1`,
    testCases: [
      { input: [1.0, 0.1, 2.0], expected: 0.64 },
      { input: [2.0, 0.5, 1.0], expected: 0.5 },
      { input: [0.5, 0.25, 4.0], expected: 0.0 },
    ],
    hint: "Each step multiplies the current value by (1 - lr * a).",
  },
  {
    id: "op-290",
    title: "Exact Line Search Quadratic Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For f(x) = 0.5 x^T A x - b^T x, the exact minimizer along the steepest descent direction d = -(A x - b) is lr = ||g||^2 / (g^T A g) with g = A x - b.\n\nGiven A as nested rows, b, and the current point x, return the optimal step size.",
    starterCode: `def exact_line_search_quadratic_step(a, b, x):
    # Your code here
    pass`,
    solution: `def exact_line_search_quadratic_step(a, b, x):
    n = len(x)
    g = [sum(a[i][j] * x[j] for j in range(n)) - b[i] for i in range(n)]
    ag = [sum(a[i][j] * g[j] for j in range(n)) for i in range(n)]
    return sum(v * v for v in g) / sum(g[i] * ag[i] for i in range(n))`,
    testCases: [
      { input: [[[2, 0], [0, 2]], [0, 0], [1, 1]], expected: 0.5 },
      { input: [[[1, 0], [0, 4]], [1, 0], [0, 0]], expected: 1.0 },
      { input: [[[3, 1], [1, 3]], [1, 1], [1, -1]], expected: 0.4166666666666667 },
    ],
    hint: "Set the directional derivative along the descent direction to zero.",
  },
  {
    id: "op-291",
    title: "First Order Optimality Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "An unconstrained differentiable objective is numerically stationary at a point when the Euclidean norm of the gradient is below a tolerance.\n\nGiven the gradient and the tolerance, return True when the point passes the first-order optimality check.",
    starterCode: `def first_order_optimality_check(grad, tol):
    # Your code here
    pass`,
    solution: `def first_order_optimality_check(grad, tol):
    import math
    return math.sqrt(sum(v * v for v in grad)) < tol`,
    testCases: [
      { input: [[1e-09, -1e-09], 1e-06], expected: true },
      { input: [[0.1, 0], 0.05], expected: false },
      { input: [[0, 0], 0.0], expected: false },
    ],
    hint: "This is only necessary, not sufficient, for a minimum.",
  },
  {
    id: "op-292",
    title: "Lagrange Equality Minimum Point",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimizing x^2 + y^2 subject to x + y = c gives the symmetric solution (c/2, c/2): the constraint plane meets the circular level sets tangentially.\n\nGiven c, return the minimizer [x, y].",
    starterCode: `def lagrange_equality_minimum_point(c):
    # Your code here
    pass`,
    solution: `def lagrange_equality_minimum_point(c):
    return [c / 2.0, c / 2.0]`,
    testCases: [
      { input: [2], expected: [1.0, 1.0] },
      { input: [0], expected: [0.0, 0.0] },
      { input: [-4], expected: [-2.0, -2.0] },
    ],
    hint: "Stationarity of x^2 + y^2 + lambda (x + y - c) forces x = y.",
  },
  {
    id: "op-293",
    title: "KKT Point For One Sided Bound",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Minimize (x - a)^2 subject to x <= c. When a <= c the unconstrained point is feasible with multiplier 0; otherwise the boundary x = c is active with multiplier 2 (c - a).\n\nGiven a and c, return [x, lambda].",
    starterCode: `def kkt_point_one_sided_bound(a, c):
    # Your code here
    pass`,
    solution: `def kkt_point_one_sided_bound(a, c):
    if a <= c:
        return [a, 0.0]
    return [c, 2.0 * (c - a)]`,
    testCases: [
      { input: [0, 2], expected: [0, 0.0] },
      { input: [5, 1], expected: [1, -8.0] },
      { input: [3, 3], expected: [3, 0.0] },
    ],
    hint: "Stationarity gives 2(x - a) + lambda = 0 with lambda >= 0 for x = c active.",
  },
  {
    id: "op-294",
    title: "Quadratic Penalty Gradient Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For the penalized objective f(x) = x^2 + mu * max(0, g)^2 with a scalar constraint value g, the gradient is 2x + 2 mu g when g > 0 and 2x otherwise.\n\nGiven x, the learning rate lr, the penalty mu, and g, return the updated x after one step.",
    starterCode: `def quadratic_penalty_gradient_step(x, lr, mu, g):
    # Your code here
    pass`,
    solution: `def quadratic_penalty_gradient_step(x, lr, mu, g):
    grad = 2.0 * x + (2.0 * mu * g if g > 0 else 0.0)
    return x - lr * grad`,
    testCases: [
      { input: [1.0, 0.1, 2.0, 1.0], expected: 0.3999999999999999 },
      { input: [0.0, 0.5, 1.0, -3.0], expected: 0.0 },
      { input: [2.0, 0.25, 4.0, 0.5], expected: 0.0 },
    ],
    hint: "The penalty term only contributes inside the feasible violation.",
  },
  {
    id: "op-295",
    title: "Quadratic Closed Form Iterate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For f(x) = 0.5 * a * x^2, gradient descent with step lr produces x_k = x0 * (1 - lr * a)^k.\n\nGiven x0, lr, a, and the number of steps k, return x_k.",
    starterCode: `def quadratic_closed_form_iterate(x0, lr, a, steps):
    # Your code here
    pass`,
    solution: `def quadratic_closed_form_iterate(x0, lr, a, steps):
    return x0 * (1.0 - lr * a) ** steps`,
    testCases: [
      { input: [1.0, 0.1, 2.0, 5], expected: 0.3276800000000001 },
      { input: [2.0, 0.5, 1.0, 3], expected: 0.25 },
      { input: [1.0, 1.0, 2.0, 4], expected: 1.0 },
    ],
    hint: "The iterate is geometric in the factor (1 - lr * a).",
  },
];
