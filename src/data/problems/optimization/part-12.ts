import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-356",
    title: "Pareto Dominance Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "In a minimization setting, point a dominates point b when every objective of a is at most that of b and at least one is strictly smaller.\n\nGiven the two objective vectors, return True when a dominates b.",
    starterCode: `def pareto_dominance_check(a, b):
    # Your code here
    pass`,
    solution: `def pareto_dominance_check(a, b):
    if all(x <= y for x, y in zip(a, b)) and any(x < y for x, y in zip(a, b)):
        return True
    return False`,
    testCases: [
      { input: [[1, 2], [2, 3]], expected: true },
      { input: [[1, 1], [1, 2]], expected: true },
      { input: [[2, 3], [1, 2]], expected: false },
    ],
    hint: "Weak inequality everywhere plus strict inequality somewhere.",
  },
  {
    id: "op-357",
    title: "Pareto Front Indices",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The Pareto front of a set of objective vectors contains the points that are not dominated by any other point (minimization in every coordinate).\n\nGiven the list of points, return the sorted indices of the non-dominated points.",
    starterCode: `def pareto_front_indices(points):
    # Your code here
    pass`,
    solution: `def pareto_front_indices(points):
    n = len(points)
    front = []
    for i in range(n):
        dominated = False
        for j in range(n):
            if i == j:
                continue
            if all(points[j][k] <= points[i][k] for k in range(len(points[i]))) and any(points[j][k] < points[i][k] for k in range(len(points[i]))):
                dominated = True
                break
        if not dominated:
            front.append(i)
    return front`,
    testCases: [
      { input: [[[1, 2], [2, 3]]], expected: [0] },
      { input: [[[1, 1], [1, 2], [2, 1], [3, 3]]], expected: [0] },
      { input: [[[1, 5], [5, 1], [3, 3]]], expected: [0, 1, 2] },
    ],
    hint: "A point survives when no other point weakly beats it everywhere and strictly beats it somewhere.",
  },
  {
    id: "op-358",
    title: "Weighted Sum Scalarization",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Weighted sum scalarization combines a multi-objective vector into a single value sum_i w_i f_i.\n\nGiven the objectives and nonnegative weights, return the scalarized value.",
    starterCode: `def weighted_sum_scalarization(values, weights):
    # Your code here
    pass`,
    solution: `def weighted_sum_scalarization(values, weights):
    return sum(w * v for v, w in zip(values, weights))`,
    testCases: [
      { input: [[1, 2], [0.5, 0.5]], expected: 1.5 },
      { input: [[3, 1, 4], [1, 0, 2]], expected: 11 },
      { input: [[0], [5]], expected: 0 },
    ],
    hint: "A plain dot product of objectives and weights.",
  },
  {
    id: "op-359",
    title: "Chebyshev Scalarization Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The weighted Chebyshev scalarization of a multi-objective vector around an ideal point z is max_i w_i * |f_i - z_i|.\n\nGiven the objectives, weights, and the ideal point, return the scalarized value.",
    starterCode: `def chebyshev_scalarization_value(values, weights, ideal):
    # Your code here
    pass`,
    solution: `def chebyshev_scalarization_value(values, weights, ideal):
    return max(w * abs(v - z) for v, w, z in zip(values, weights, ideal))`,
    testCases: [
      { input: [[1, 2], [1, 1], [0, 0]], expected: 2 },
      { input: [[3, 1, 4], [2, 1, 0.5], [1, 1, 1]], expected: 4 },
      { input: [[0, 5], [1, 1], [0, 0]], expected: 5 },
    ],
    hint: "Take the maximum weighted deviation from the ideal point.",
  },
  {
    id: "op-360",
    title: "Penalty Parameter Increase Rule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Penalty methods double the penalty parameter when the constraint violation exceeds a tolerance.\n\nGiven the current rho, the violation, and the tolerance, return rho doubled when violation > tol and unchanged otherwise.",
    starterCode: `def penalty_parameter_increase_rule(rho, violation, tol):
    # Your code here
    pass`,
    solution: `def penalty_parameter_increase_rule(rho, violation, tol):
    if violation > tol:
        return 2.0 * rho
    return rho`,
    testCases: [
      { input: [1.0, 0.5, 0.1], expected: 2.0 },
      { input: [2.0, 0.05, 0.1], expected: 2.0 },
      { input: [10.0, 1.0, 1.0], expected: 10.0 },
    ],
    hint: "Only strict violations trigger the increase.",
  },
  {
    id: "op-361",
    title: "Barrier Duality Gap Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "For a logarithmic barrier with m constraints and parameter t, the duality gap is m / t.\n\nGiven the number of constraints and t > 0, return the gap.",
    starterCode: `def barrier_duality_gap_value(constraints, t):
    # Your code here
    pass`,
    solution: `def barrier_duality_gap_value(constraints, t):
    return constraints / t`,
    testCases: [
      { input: [3, 1.0], expected: 3.0 },
      { input: [5, 10.0], expected: 0.5 },
      { input: [1, 0.5], expected: 2.0 },
    ],
    hint: "The gap shrinks as the barrier parameter grows.",
  },
  {
    id: "op-362",
    title: "Central Path Point on Probability Simplex",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimizing -sum_i log(x_i) over the probability simplex has the symmetric central path point x_i = 1 / n.\n\nGiven n > 0, return the point as a list of n equal values.",
    starterCode: `def central_path_point_probability_simplex(n):
    # Your code here
    pass`,
    solution: `def central_path_point_probability_simplex(n):
    return [1.0 / n] * n`,
    testCases: [
      { input: [1], expected: [1.0] },
      { input: [2], expected: [0.5, 0.5] },
      { input: [5], expected: [0.2, 0.2, 0.2, 0.2, 0.2] },
    ],
    hint: "Symmetry of the barrier and the constraint forces equal coordinates.",
  },
  {
    id: "op-363",
    title: "KKT Point for Diagonal Quadratic",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Minimize x^2 + y^2 subject to x + 2y = c. Stationarity gives 2x = lambda and 2y = 2 lambda, so x = c/5 and y = 2c/5 with lambda = 2c/5.\n\nGiven c, return [x, y, lambda].",
    starterCode: `def kkt_point_diagonal_quadratic(c):
    # Your code here
    pass`,
    solution: `def kkt_point_diagonal_quadratic(c):
    return [c / 5.0, 2.0 * c / 5.0, 2.0 * c / 5.0]`,
    testCases: [
      { input: [5], expected: [1.0, 2.0, 2.0] },
      { input: [0], expected: [0.0, 0.0, 0.0] },
      { input: [-10], expected: [-2.0, -4.0, -4.0] },
    ],
    hint: "Solve the linear system from the two stationarity equations and the constraint.",
  },
  {
    id: "op-364",
    title: "SVM Dual Objective Value",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "The dual objective of a hard-margin SVM is sum_i alpha_i - 0.5 * sum_ij alpha_i alpha_j y_i y_j (x_i dot x_j).\n\nGiven the feature vectors, the labels, and the dual coefficients, return the objective value.",
    starterCode: `def svm_dual_objective_value(xs, ys, alpha):
    # Your code here
    pass`,
    solution: `def svm_dual_objective_value(xs, ys, alpha):
    total = sum(alpha)
    quad = 0.0
    for i in range(len(xs)):
        for j in range(len(xs)):
            dot = sum(a * b for a, b in zip(xs[i], xs[j]))
            quad += alpha[i] * alpha[j] * ys[i] * ys[j] * dot
    return total - 0.5 * quad`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, -1], [1, 1]], expected: 1.0 },
      { input: [[[1, 1], [2, 2]], [1, 1], [0.5, 0.5]], expected: -1.25 },
      { input: [[[1, 0], [-1, 0]], [1, -1], [1, 1]], expected: 0.0 },
    ],
    hint: "Sum the coefficients, then subtract half the quadratic form.",
  },
  {
    id: "op-365",
    title: "Gradient Norm Relative Change",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "A convergence diagnostic compares successive gradient norms by the relative change |new - old| / max(old, eps).\n\nGiven the old and new norms and eps, return the relative change.",
    starterCode: `def gradient_norm_relative_change(old_norm, new_norm, eps=1e-12):
    # Your code here
    pass`,
    solution: `def gradient_norm_relative_change(old_norm, new_norm, eps=1e-12):
    return abs(new_norm - old_norm) / max(old_norm, eps)`,
    testCases: [
      { input: [1.0, 0.1], expected: 0.9 },
      { input: [10.0, 10.0], expected: 0.0 },
      { input: [0.0, 1.0], expected: 1000000000000.0 },
    ],
    hint: "The epsilon guard avoids division by an exactly zero old norm.",
  },
  {
    id: "op-366",
    title: "Simulated Annealing Acceptance Probability",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Simulated annealing accepts a worse solution with probability exp(-delta / T) where delta > 0 is the objective increase, and always accepts improvements.\n\nGiven delta and the temperature T > 0, return the acceptance probability.",
    starterCode: `def simulated_annealing_acceptance_probability(delta, temperature):
    # Your code here
    pass`,
    solution: `def simulated_annealing_acceptance_probability(delta, temperature):
    import math
    if delta <= 0:
        return 1.0
    return math.exp(-delta / temperature)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.36787944117144233 },
      { input: [-2.0, 0.5], expected: 1.0 },
      { input: [4.0, 10.0], expected: 0.6703200460356393 },
    ],
    hint: "Improvements have unit probability; only uphill moves are tempered.",
  },
  {
    id: "op-367",
    title: "Geometric Temperature Cooling",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Geometric cooling multiplies the temperature by alpha each step: T_k = T_0 * alpha^k.\n\nGiven the initial temperature, alpha in (0, 1), and k, return the temperature after k steps.",
    starterCode: `def geometric_temperature_cooling(t0, alpha, k):
    # Your code here
    pass`,
    solution: `def geometric_temperature_cooling(t0, alpha, k):
    return t0 * alpha ** k`,
    testCases: [
      { input: [100.0, 0.9, 10], expected: 34.86784401000001 },
      { input: [1.0, 0.5, 1], expected: 0.5 },
      { input: [10.0, 0.99, 100], expected: 3.660323412732292 },
    ],
    hint: "Each step applies the same multiplicative factor.",
  },
  {
    id: "op-368",
    title: "Metropolis Hastings Acceptance Ratio",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The Metropolis-Hastings acceptance ratio is min(1, p_new * q_forward / (p_old * q_reverse)), where p are target densities and q are proposal densities.\n\nGiven the target densities and proposal densities, return the ratio.",
    starterCode: `def metropolis_acceptance_ratio(p_new, p_old, q_forward, q_reverse):
    # Your code here
    pass`,
    solution: `def metropolis_acceptance_ratio(p_new, p_old, q_forward, q_reverse):
    return min(1.0, p_new * q_forward / (p_old * q_reverse))`,
    testCases: [
      { input: [1.0, 2.0, 1.0, 1.0], expected: 0.5 },
      { input: [0.5, 1.0, 1.0, 2.0], expected: 0.25 },
      { input: [3.0, 1.0, 0.5, 0.5], expected: 1.0 },
    ],
    hint: "The ratio is capped at one for certain acceptance.",
  },
  {
    id: "op-369",
    title: "Random Restart Selection Index",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "When several random restarts each produce a final validation score, the best run is the one with the lowest score (minimization).\n\nGiven the scores, return the index of the best restart, breaking ties toward the earliest index.",
    starterCode: `def random_restart_selection_index(scores):
    # Your code here
    pass`,
    solution: `def random_restart_selection_index(scores):
    best = 0
    for i in range(1, len(scores)):
        if scores[i] < scores[best]:
            best = i
    return best`,
    testCases: [
      { input: [[3.0, 1.0, 2.0]], expected: 1 },
      { input: [[5.0, 5.0, 5.0]], expected: 0 },
      { input: [[1.0, 0.5, 0.75]], expected: 1 },
    ],
    hint: "Strict comparison keeps the earliest index on ties.",
  },
  {
    id: "op-370",
    title: "Grid Search Best Combination",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Grid search evaluates every combination of two hyperparameters, recorded as a score matrix, and picks the entry with the lowest validation loss.\n\nGiven the score matrix, return [i, j] of the minimum, breaking ties toward the first row and column encountered.",
    starterCode: `def grid_search_best_combination(scores):
    # Your code here
    pass`,
    solution: `def grid_search_best_combination(scores):
    best_i = 0
    best_j = 0
    for i in range(len(scores)):
        for j in range(len(scores[i])):
            if scores[i][j] < scores[best_i][best_j]:
                best_i = i
                best_j = j
    return [best_i, best_j]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 0.5]]], expected: [1, 1] },
      { input: [[[4.0, 3.0, 5.0], [2.0, 2.0, 6.0]]], expected: [1, 0] },
      { input: [[[1.0, 1.0], [1.0, 1.0]]], expected: [0, 0] },
    ],
    hint: "Scan in row-major order with a strict less-than test.",
  },
  {
    id: "op-371",
    title: "Relative Improvement Percentage",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The relative improvement from an old value to a new value is (old - new) / old * 100 percent.\n\nGiven old and new (old nonzero), return the percentage.",
    starterCode: `def relative_improvement_percentage(old, new):
    # Your code here
    pass`,
    solution: `def relative_improvement_percentage(old, new):
    return (old - new) / old * 100.0`,
    testCases: [
      { input: [100.0, 90.0], expected: 10.0 },
      { input: [2.0, 1.0], expected: 50.0 },
      { input: [50.0, 75.0], expected: -50.0 },
    ],
    hint: "A larger positive number means a bigger gain.",
  },
  {
    id: "op-372",
    title: "Early Stopping Patience Decision",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Training should stop when no new best loss has appeared for `patience` consecutive epochs. Find the earliest index of the minimum loss and check whether it is at least patience steps behind the latest epoch.\n\nGiven the loss history, patience, and min_delta (which are ignored beyond the argmin rule here), return True when the stopping criterion is met.",
    starterCode: `def early_stopping_patience_decision(losses, patience, min_delta):
    # Your code here
    pass`,
    solution: `def early_stopping_patience_decision(losses, patience, min_delta):
    best = min(losses)
    best_index = losses.index(best)
    return (len(losses) - 1 - best_index) >= patience`,
    testCases: [
      { input: [[1.0, 0.9, 0.9, 0.9], 2, 0.0], expected: true },
      { input: [[1.0, 2.0, 3.0], 2, 0.0], expected: true },
      { input: [[0.5, 0.4, 0.3, 0.4, 0.4], 3, 0.01], expected: false },
    ],
    hint: "The count of epochs since the best value determines the decision.",
  },
  {
    id: "op-373",
    title: "Gradient Accumulation Mean",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Gradient accumulation sums micro-batch gradients and divides by the number of accumulation steps to match a large batch.\n\nGiven a list of micro-batch gradients and the number of accumulation steps, return the averaged gradient computed as the sum divided by the step count.",
    starterCode: `def gradient_accumulation_mean(grads, steps):
    # Your code here
    pass`,
    solution: `def gradient_accumulation_mean(grads, steps):
    dim = len(grads[0])
    return [sum(g[i] for g in grads) / steps for i in range(dim)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: [2.0, 3.0] },
      { input: [[[2], [4], [6]], 3], expected: [4.0] },
      { input: [[[1, 1], [1, 1]], 4], expected: [0.5, 0.5] },
    ],
    hint: "Divide the accumulated sum by the configured step count, not the list length.",
  },
  {
    id: "op-374",
    title: "Mixed Precision Dynamic Loss Scale Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Dynamic loss scaling halves the scale on overflow and doubles it after a window of consecutive finite steps without overflow.\n\nGiven the current scale, an overflow flag, the count of consecutive finite steps, and the window, return the updated scale.",
    starterCode: `def mixed_precision_loss_scale_update(scale, overflow, stable_steps, window):
    # Your code here
    pass`,
    solution: `def mixed_precision_loss_scale_update(scale, overflow, stable_steps, window):
    if overflow:
        return scale / 2.0
    if stable_steps >= window:
        return scale * 2.0
    return scale`,
    testCases: [
      { input: [1024.0, true, 0, 2000], expected: 512.0 },
      { input: [1024.0, false, 2000, 2000], expected: 2048.0 },
      { input: [512.0, false, 500, 2000], expected: 512.0 },
    ],
    hint: "Overflow takes priority over the stability window.",
  },
  {
    id: "op-375",
    title: "Parameter Update Relative Change",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The relative parameter change is ||w_new - w_old|| / max(||w_old||, eps).\n\nGiven the two parameter vectors and eps, return the relative change.",
    starterCode: `def parameter_update_relative_change(w_old, w_new, eps=1e-12):
    # Your code here
    pass`,
    solution: `def parameter_update_relative_change(w_old, w_new, eps=1e-12):
    import math
    diff = math.sqrt(sum((a - b) ** 2 for a, b in zip(w_old, w_new)))
    norm = math.sqrt(sum(a * a for a in w_old))
    return diff / max(norm, eps)`,
    testCases: [
      { input: [[1, 0], [1, 1]], expected: 1.0 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[0, 0], [3, 4]], expected: 5000000000000.0 },
    ],
    hint: "Use the Euclidean norms of the update and of the old parameters.",
  },
];
