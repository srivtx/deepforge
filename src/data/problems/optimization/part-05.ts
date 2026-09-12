import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-141",
    title: "Convexity Check Quadratic",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Check whether a 2x2 quadratic has a positive semidefinite Hessian.\n\nWith A = [[a, b], [c, d]], symmetrize b = (b + c) / 2 and return True only when a >= 0, d >= 0, and a * d - b ** 2 >= 0. These are the Sylvester conditions for convexity.",
    starterCode: `def is_convex_quadratic(A):
    # Your code here
    pass`,
    solution: `def is_convex_quadratic(A):
    a = A[0][0]
    b = (A[0][1] + A[1][0]) / 2.0
    d = A[1][1]
    if a < 0 or d < 0:
        return False
    return a * d - b * b >= 0`,
    testCases: [
      { input: [[[2.0, 1.0], [1.0, 2.0]]], expected: true },
      { input: [[[2.0, 3.0], [3.0, 2.0]]], expected: false },
      { input: [[[0.0, 1.0], [1.0, 0.0]]], expected: false },
      { input: [[[1.0, 0.0], [0.0, 0.0]]], expected: true },
    ],
    hint: "A symmetric 2x2 matrix is PSD when its diagonal is non-negative and its determinant is non-negative.",
  },
  {
    id: "op-142",
    title: "Strong Convexity Modulus",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the strong convexity modulus of a 2x2 Hessian, which is its smallest eigenvalue.\n\nFor the symmetric matrix A = [[a, b], [b, d]] return mid - sqrt(((a - d) / 2) ** 2 + b ** 2) with mid = (a + d) / 2. The result can be negative when A is not positive semidefinite.",
    starterCode: `def strong_convexity_modulus(A):
    # Your code here
    pass`,
    solution: `def strong_convexity_modulus(A):
    import math
    a = A[0][0]
    b = (A[0][1] + A[1][0]) / 2.0
    d = A[1][1]
    mid = (a + d) / 2.0
    rad = math.sqrt(((a - d) / 2.0) ** 2 + b * b)
    return mid - rad`,
    testCases: [
      { input: [[[2.0, 1.0], [1.0, 2.0]]], expected: 1.0 },
      { input: [[[4.0, 1.0], [1.0, 3.0]]], expected: 2.381966011250105 },
      { input: [[[1.0, 2.0], [2.0, 1.0]]], expected: -1.0 },
      { input: [[[3.0, 0.0], [0.0, 3.0]]], expected: 3.0 },
    ],
    hint: "mid minus the eigenvalue spread gives the smaller eigenvalue.",
  },
  {
    id: "op-143",
    title: "Lipschitz Estimate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Estimate a Lipschitz constant for a gradient field from sampled gradients.\n\nReturn the largest Euclidean norm among the supplied gradient vectors, or 0.0 when the list is empty. Each gradient is given as a list of components.",
    starterCode: `def lipschitz_estimate(grads):
    # Your code here
    pass`,
    solution: `def lipschitz_estimate(grads):
    best = 0.0
    for g in grads:
        total = 0.0
        for v in g:
            total = total + v * v
        nrm = total ** 0.5
        if nrm > best:
            best = nrm
    return best`,
    testCases: [
      { input: [[[1.0, 2.0], [0.0, 1.0]]], expected: 2.23606797749979 },
      { input: [[[3.0, 4.0]]], expected: 5.0 },
      { input: [[]], expected: 0.0 },
      { input: [[[0.0, 0.0]]], expected: 0.0 },
    ],
    hint: "Take the maximum gradient norm over the sampled points.",
  },
  {
    id: "op-144",
    title: "Smoothness Constant",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate the smoothness constant from sampled Hessians.\n\nFor each symmetric 2x2 matrix compute the largest absolute eigenvalue as abs(mid) + sqrt(((a - d) / 2) ** 2 + b ** 2) and return the maximum over the list. An empty list returns 0.0.",
    starterCode: `def smoothness_constant(hessians):
    # Your code here
    pass`,
    solution: `def smoothness_constant(hessians):
    import math
    best = 0.0
    for A in hessians:
        a = A[0][0]
        b = (A[0][1] + A[1][0]) / 2.0
        d = A[1][1]
        mid = (a + d) / 2.0
        rad = math.sqrt(((a - d) / 2.0) ** 2 + b * b)
        s = abs(mid) + rad
        if s > best:
            best = s
    return best`,
    testCases: [
      { input: [[[[2.0, 1.0], [1.0, 2.0]], [[4.0, 1.0], [1.0, 3.0]]]], expected: 4.618033988749895 },
      { input: [[[[1.0, 0.0], [0.0, 1.0]]]], expected: 1.0 },
      { input: [[[[-3.0, 0.0], [0.0, 1.0]]]], expected: 3.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "The smoothness constant is the largest absolute Hessian eigenvalue.",
  },
  {
    id: "op-145",
    title: "Descent Lemma Bound",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Evaluate the descent lemma upper bound for a scalar step.\n\nReturn f_x + grad * delta + 0.5 * L * delta ** 2, where L is the gradient Lipschitz constant. This bounds f at the new point along the gradient direction.",
    starterCode: `def descent_lemma_bound(f_x, grad, delta, L):
    # Your code here
    pass`,
    solution: `def descent_lemma_bound(f_x, grad, delta, L):
    return f_x + grad * delta + 0.5 * L * delta * delta`,
    testCases: [
      { input: [1.0, 2.0, 0.1, 4.0], expected: 1.22 },
      { input: [0.0, -1.0, 0.5, 2.0], expected: -0.25 },
      { input: [3.0, 0.0, 1.0, 10.0], expected: 8.0 },
      { input: [2.0, 1.0, -0.5, 4.0], expected: 2.0 },
    ],
    hint: "The quadratic penalty 0.5 * L * delta ** 2 upper-bounds the curvature term.",
  },
  {
    id: "op-146",
    title: "Sublinear Rate Value",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Evaluate an O(1/T) sublinear convergence bound.\n\nReturn C / T, the optimization gap after T iterations of a subgradient-type method. Return 0.0 when T is not positive.",
    starterCode: `def sublinear_rate_value(C, T):
    # Your code here
    pass`,
    solution: `def sublinear_rate_value(C, T):
    if T <= 0:
        return 0.0
    return C / T`,
    testCases: [
      { input: [10.0, 2], expected: 5.0 },
      { input: [1.0, 100], expected: 0.01 },
      { input: [7.0, 1], expected: 7.0 },
      { input: [5.0, 0], expected: 0.0 },
    ],
    hint: "The bound improves linearly in the iteration count, hence the name 1/T rate.",
  },
  {
    id: "op-147",
    title: "Linear Rate Factor",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the contraction factor of a linearly convergent method.\n\nReturn (1 - mu / L) ** t for strong convexity modulus mu, smoothness L, and t iterations. Return 0.0 when L is not positive.",
    starterCode: `def linear_rate_factor(mu, L, t):
    # Your code here
    pass`,
    solution: `def linear_rate_factor(mu, L, t):
    if L <= 0:
        return 0.0
    return (1 - mu / L) ** t`,
    testCases: [
      { input: [1.0, 4.0, 5], expected: 0.2373046875 },
      { input: [2.0, 10.0, 10], expected: 0.10737418240000006 },
      { input: [1.0, 1.0, 3], expected: 0.0 },
      { input: [3.0, 4.0, 1], expected: 0.25 },
    ],
    hint: "The condition number mu / L controls how fast the gap shrinks.",
  },
  {
    id: "op-148",
    title: "Momentum Optimal Beta",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the optimal momentum coefficient for a quadratically convergent scheme.\n\nWith kappa = L / mu and r = sqrt(kappa), return (r - 1) / (r + 1). Return 0.0 when mu is not positive.",
    starterCode: `def momentum_optimal_beta(mu, L):
    # Your code here
    pass`,
    solution: `def momentum_optimal_beta(mu, L):
    if mu <= 0:
        return 0.0
    kappa = L / mu
    r = kappa ** 0.5
    return (r - 1) / (r + 1)`,
    testCases: [
      { input: [1.0, 4.0], expected: 0.3333333333333333 },
      { input: [0.5, 2.0], expected: 0.3333333333333333 },
      { input: [1.0, 1.0], expected: 0.0 },
      { input: [0.1, 10.0], expected: 0.8181818181818182 },
    ],
    hint: "The optimal momentum depends only on the square root of the condition number.",
  },
  {
    id: "op-149",
    title: "Nesterov Rate Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the Nesterov accelerated convergence rate after t iterations.\n\nReturn (1 - sqrt(mu / L)) ** t, clamping the base at 0 when it would be negative. Return 0.0 when mu or L is not positive.",
    starterCode: `def nesterov_rate_value(mu, L, t):
    # Your code here
    pass`,
    solution: `def nesterov_rate_value(mu, L, t):
    if mu <= 0 or L <= 0:
        return 0.0
    r = (mu / L) ** 0.5
    base = 1 - r
    if base < 0:
        base = 0.0
    return base ** t`,
    testCases: [
      { input: [1.0, 4.0, 10], expected: 0.0009765625 },
      { input: [0.25, 1.0, 5], expected: 0.03125 },
      { input: [1.0, 100.0, 3], expected: 0.7290000000000001 },
      { input: [0.0, 1.0, 5], expected: 0.0 },
    ],
    hint: "Acceleration replaces the condition number by its square root.",
  },
  {
    id: "op-150",
    title: "Polyak Restart Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Decide whether to restart momentum from the current iterate.\n\nReturn True when curr_loss is strictly greater than prev_loss, which signals that momentum has overshot. Otherwise return False.",
    starterCode: `def polyak_restart_check(prev_loss, curr_loss):
    # Your code here
    pass`,
    solution: `def polyak_restart_check(prev_loss, curr_loss):
    return curr_loss > prev_loss`,
    testCases: [
      { input: [1.0, 0.9], expected: false },
      { input: [0.5, 0.5], expected: false },
      { input: [1.0, 1.2], expected: true },
      { input: [2.0, 3.0], expected: true },
    ],
    hint: "Any increase in the loss triggers a restart in Polyak's scheme.",
  },
  {
    id: "op-151",
    title: "Gradient Flow Euler Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one explicit Euler step of the gradient flow dx/dt = -grad.\n\nReturn x - dt * grad, where dt is the step size.",
    starterCode: `def euler_step(x, grad, dt):
    # Your code here
    pass`,
    solution: `def euler_step(x, grad, dt):
    return x - dt * grad`,
    testCases: [
      { input: [1.0, 2.0, 0.1], expected: 0.8 },
      { input: [0.0, 1.0, 0.5], expected: -0.5 },
      { input: [2.0, -1.0, 0.25], expected: 2.25 },
      { input: [3.0, 0.0, 0.1], expected: 3.0 },
    ],
    hint: "Euler integration follows the negative gradient direction for one step.",
  },
  {
    id: "op-152",
    title: "RK4 Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one classical fourth-order Runge-Kutta step of the gradient flow on f(x) = x^2, where dx/dt = -2x.\n\nCompute k1 = -2x, k2 = -2(x + 0.5 * dt * k1), k3 = -2(x + 0.5 * dt * k2), and k4 = -2(x + dt * k3), then return x + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4).",
    starterCode: `def rk4_step(x, dt):
    # Your code here
    pass`,
    solution: `def rk4_step(x, dt):
    k1 = -2 * x
    k2 = -2 * (x + 0.5 * dt * k1)
    k3 = -2 * (x + 0.5 * dt * k2)
    k4 = -2 * (x + dt * k3)
    return x + dt / 6.0 * (k1 + 2 * k2 + 2 * k3 + k4)`,
    testCases: [
      { input: [1.0, 0.1], expected: 0.8187333333333333 },
      { input: [2.0, 0.5], expected: 0.75 },
      { input: [0.0, 0.3], expected: 0.0 },
      { input: [-1.0, 0.2], expected: -0.6704 },
    ],
    hint: "The four stages estimate the slope at the start, two midpoints, and the end.",
  },
  {
    id: "op-153",
    title: "Symplectic Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one velocity Verlet (symplectic) step for the oscillator with potential 0.5 * k * x ** 2.\n\nSet x_new = x + dt * v - 0.5 * dt ** 2 * k * x, v_half = v - 0.5 * dt * k * x, and v_new = v_half - 0.5 * dt * k * x_new. Return [x_new, v_new].",
    starterCode: `def symplectic_step(x, v, k, dt):
    # Returns [x_new, v_new]
    # Your code here
    pass`,
    solution: `def symplectic_step(x, v, k, dt):
    x_new = x + dt * v - 0.5 * dt * dt * k * x
    v_half = v - 0.5 * dt * k * x
    v_new = v_half - 0.5 * dt * k * x_new
    return [x_new, v_new]`,
    testCases: [
      { input: [1.0, 0.0, 1.0, 0.1], expected: [0.995, -0.09975] },
      { input: [0.0, 1.0, 2.0, 0.5], expected: [0.5, 0.75] },
      { input: [2.0, -1.0, 0.5, 0.2], expected: [1.78, -1.189] },
    ],
    hint: "Velocity Verlet splits the kick into two half-steps around the drift.",
  },
  {
    id: "op-154",
    title: "Langevin Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one Langevin dynamics step on a scalar parameter.\n\nAfter random.seed(seed), return x - lr * grad + noise_std * sqrt(lr) * random.gauss(0.0, 1.0). The noise is scaled by the square root of the step size.",
    starterCode: `def langevin_step(x, grad, lr, noise_std, seed):
    # Your code here
    pass`,
    solution: `def langevin_step(x, grad, lr, noise_std, seed):
    import random
    random.seed(seed)
    return x - lr * grad + noise_std * (lr ** 0.5) * random.gauss(0.0, 1.0)`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 1.0, 0], expected: 1.2477965586458089 },
      { input: [0.0, -1.0, 0.25, 0.5, 42], expected: 0.21397741760551792 },
      { input: [2.0, 0.0, 0.5, 2.0, 7], expected: 1.6381306257334638 },
    ],
    hint: "Reseed so the injected Gaussian draw is reproducible.",
  },
  {
    id: "op-155",
    title: "SGLD Noise Scale",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the SGLD noise standard deviation for a given step size.\n\nReturn sqrt(2 * lr * temperature), or 0.0 when lr or temperature is not positive. This is the amount of Gaussian noise added per coordinate.",
    starterCode: `def sgld_noise_scale(lr, temperature):
    # Your code here
    pass`,
    solution: `def sgld_noise_scale(lr, temperature):
    if lr <= 0 or temperature <= 0:
        return 0.0
    return (2.0 * lr * temperature) ** 0.5`,
    testCases: [
      { input: [0.1, 1.0], expected: 0.4472135954999579 },
      { input: [0.01, 2.0], expected: 0.2 },
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [0.5, 0.5], expected: 0.7071067811865476 },
    ],
    hint: "The noise scale grows with the square root of the step size and temperature.",
  },
  {
    id: "op-156",
    title: "Stochastic Gradient Variance",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate the total variance of a stochastic gradient from per-sample gradients.\n\nCompute the mean gradient over the samples and the trace of the unbiased sample covariance, dividing each coordinate's squared deviations by n - 1. Return the trace, or 0.0 for fewer than two samples.",
    starterCode: `def stochastic_gradient_variance(grads):
    # Your code here
    pass`,
    solution: `def stochastic_gradient_variance(grads):
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
        s = 0.0
        for g in grads:
            s = s + (g[j] - mean[j]) ** 2
        trace = trace + s / (n - 1)
    return trace`,
    testCases: [
      { input: [[[1.0, 2.0], [1.2, 1.8], [0.8, 2.2]]], expected: 0.08 },
      { input: [[[1.0], [5.0]]], expected: 8.0 },
      { input: [[[0.0, 0.0], [0.0, 0.0]]], expected: 0.0 },
      { input: [[[1.0, 0.0]]], expected: 0.0 },
    ],
    hint: "The trace of the covariance is the sum of per-coordinate variances.",
  },
  {
    id: "op-157",
    title: "Control Variate Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one gradient step with a control variate.\n\nForm the unbiased estimate est = grad_sample - grad_control + grad_control_mean, then return [w - lr * est, est]. The control variate reduces variance when grad_control tracks grad_sample.",
    starterCode: `def control_variate_step(w, grad_sample, grad_control, grad_control_mean, lr):
    # Returns [w_new, est]
    # Your code here
    pass`,
    solution: `def control_variate_step(w, grad_sample, grad_control, grad_control_mean, lr):
    est = [grad_sample[i] - grad_control[i] + grad_control_mean[i] for i in range(len(w))]
    return [[w[i] - lr * est[i] for i in range(len(w))], est]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 0.5], [0.4, 0.6], [0.45, 0.55], 0.1], expected: [[0.945, 1.955], [0.55, 0.45000000000000007]] },
      { input: [[0.0, 0.0], [1.0, -1.0], [0.5, -0.5], [0.25, -0.25], 0.5], expected: [[-0.375, 0.375], [0.75, -0.75]] },
      { input: [[2.0, -1.0], [1.0, 0.5], [0.5, 1.0], [0.25, 0.5], 0.2], expected: [[1.85, -1.0], [0.75, 0.0]] },
    ],
    hint: "The control variate is mean-zero, so the estimator stays unbiased.",
  },
  {
    id: "op-158",
    title: "SVRG Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Run the SVRG inner loop starting from a snapshot point.\n\nBeginning with w = w_tilde, for each sampled index k compute v = grads_current[k] - grads_snapshot[k] + grad_full and update w = w - lr * v. Return the final w after all inner steps.",
    starterCode: `def svrg_update(w_tilde, grad_full, grads_snapshot, grads_current, lr):
    # Your code here
    pass`,
    solution: `def svrg_update(w_tilde, grad_full, grads_snapshot, grads_current, lr):
    w = list(w_tilde)
    m = len(grads_current)
    for k in range(m):
        v = [grads_current[k][i] - grads_snapshot[k][i] + grad_full[i] for i in range(len(w))]
        w = [w[i] - lr * v[i] for i in range(len(w))]
    return w`,
    testCases: [
      { input: [[1.0, 1.0], [0.5, 0.5], [[0.4, 0.6]], [[0.5, 0.5]], 0.1], expected: [0.94, 0.96] },
      { input: [[0.0, 0.0], [1.0, -1.0], [[0.5, -0.5], [1.5, -1.5]], [[1.0, -1.0], [0.5, -0.5]], 0.2], expected: [-0.30000000000000004, 0.30000000000000004] },
      { input: [[1.0, 0.0], [0.5, 0.5], [[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]], 0.1], expected: [0.85, -0.15000000000000002] },
    ],
    hint: "The snapshot gradient corrects the per-sample gradient without extra full passes.",
  },
  {
    id: "op-159",
    title: "SAGA Table Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one SAGA update for a single coordinate group.\n\nCompute v = grad_i - table_i + avg_grad and w_new = w - lr * v. Replace the table entry with grad_i and update the running average as avg_grad + (grad_i - table_i) / n. Return [w_new, table_new, avg_new].",
    starterCode: `def saga_table_update(w, grad_i, table_i, avg_grad, lr, n):
    # Returns [w_new, table_new, avg_new]
    # Your code here
    pass`,
    solution: `def saga_table_update(w, grad_i, table_i, avg_grad, lr, n):
    v = grad_i - table_i + avg_grad
    w_new = w - lr * v
    table_new = grad_i
    avg_new = avg_grad + (grad_i - table_i) / n
    return [w_new, table_new, avg_new]`,
    testCases: [
      { input: [1.0, 0.5, 0.4, 0.45, 0.1, 4], expected: [0.945, 0.5, 0.475] },
      { input: [0.0, -1.0, 0.5, 0.0, 0.5, 2], expected: [0.75, -1.0, -0.75] },
      { input: [2.0, 0.0, 0.0, 0.25, 0.2, 5], expected: [1.95, 0.0, 0.25] },
    ],
    hint: "The table entry and the running average must both be refreshed.",
  },
  {
    id: "op-160",
    title: "SAG Average Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Update the running gradient sum used by the SAG method.\n\nReplace the stale gradient old_grad with new_grad and return [new_sum, new_sum / n], where new_sum = sum_grad - old_grad + new_grad. Return a zero average when n is not positive.",
    starterCode: `def sag_average_step(sum_grad, old_grad, new_grad, n):
    # Returns [new_sum, new_avg]
    # Your code here
    pass`,
    solution: `def sag_average_step(sum_grad, old_grad, new_grad, n):
    new_sum = sum_grad - old_grad + new_grad
    if n <= 0:
        return [new_sum, 0.0]
    return [new_sum, new_sum / n]`,
    testCases: [
      { input: [2.0, 0.5, 1.0, 4], expected: [2.5, 0.625] },
      { input: [0.0, 1.0, 1.0, 2], expected: [0.0, 0.0] },
      { input: [3.0, 0.0, 0.0, 0], expected: [3.0, 0.0] },
    ],
    hint: "Maintaining a sum avoids recomputing the average over all stored gradients.",
  },
  {
    id: "op-161",
    title: "Variance Reduction Factor",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the variance reduction factor achieved by an estimator.\n\nReturn 1 - var_after / var_before, or 0.0 when var_before is zero. A factor of 1 means the variance was completely eliminated.",
    starterCode: `def variance_reduction_factor(var_before, var_after):
    # Your code here
    pass`,
    solution: `def variance_reduction_factor(var_before, var_after):
    if var_before == 0:
        return 0.0
    return 1 - var_after / var_before`,
    testCases: [
      { input: [1.0, 0.25], expected: 0.75 },
      { input: [4.0, 1.0], expected: 0.75 },
      { input: [2.0, 2.0], expected: 0.0 },
      { input: [0.0, 1.0], expected: 0.0 },
    ],
    hint: "The factor is the fraction of variance removed relative to the baseline.",
  },
  {
    id: "op-162",
    title: "Importance Sampling Gradient",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate a target expectation by importance sampling.\n\nReturn (1 / n) * sum over i of (target_probs[i] / sample_probs[i]) * grads[i], skipping samples whose sampling probability is zero. This is the standard importance-weighted gradient estimator.",
    starterCode: `def importance_sampling_gradient(grads, target_probs, sample_probs):
    # Your code here
    pass`,
    solution: `def importance_sampling_gradient(grads, target_probs, sample_probs):
    n = len(grads)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        if sample_probs[i] == 0:
            continue
        total = total + (target_probs[i] / sample_probs[i]) * grads[i]
    return total / n`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 0.5], [0.5, 0.5]], expected: 1.5 },
      { input: [[1.0, 2.0], [0.25, 0.75], [0.5, 0.5]], expected: 1.75 },
      { input: [[4.0], [1.0], [0.0]], expected: 0.0 },
    ],
    hint: "Samples drawn from a skewed proposal are reweighted by the probability ratio.",
  },
  {
    id: "op-163",
    title: "Adaptive Batch Probability",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute per-sample sampling probabilities proportional to gradient norms.\n\nReturn [norm_i / sum(norms)]. If the total is zero, return uniform probabilities; an empty list returns [].",
    starterCode: `def adaptive_batch_probability(grad_norms):
    # Your code here
    pass`,
    solution: `def adaptive_batch_probability(grad_norms):
    total = 0.0
    for v in grad_norms:
        total = total + v
    if total == 0:
        return [1.0 / len(grad_norms) for _ in grad_norms] if grad_norms else []
    return [v / total for v in grad_norms]`,
    testCases: [
      { input: [[1.0, 3.0]], expected: [0.25, 0.75] },
      { input: [[0.0, 0.0]], expected: [0.5, 0.5] },
      { input: [[2.0]], expected: [1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Larger gradients are sampled more often to reduce variance.",
  },
  {
    id: "op-164",
    title: "Gradient Accumulation Equivalence",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the effective learning rate when using gradient accumulation.\n\nReturn micro_lr * accumulation_steps, the learning rate that matches one large-batch step under this convention.",
    starterCode: `def gradient_accumulation_equivalence(micro_lr, accumulation_steps):
    # Your code here
    pass`,
    solution: `def gradient_accumulation_equivalence(micro_lr, accumulation_steps):
    return micro_lr * accumulation_steps`,
    testCases: [
      { input: [0.01, 4], expected: 0.04 },
      { input: [0.1, 1], expected: 0.1 },
      { input: [0.02, 8], expected: 0.16 },
      { input: [0.0, 5], expected: 0.0 },
    ],
    hint: "Accumulating k micro-batches with the same lr is equivalent to a k-times larger step.",
  },
  {
    id: "op-165",
    title: "Distributed SGD Averaging",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Average parameter vectors from distributed SGD workers.\n\nReturn the elementwise mean of the worker parameter lists. An empty worker list returns [].",
    starterCode: `def distributed_sgd_average(worker_params):
    # Your code here
    pass`,
    solution: `def distributed_sgd_average(worker_params):
    if not worker_params:
        return []
    k = len(worker_params)
    d = len(worker_params[0])
    out = []
    for j in range(d):
        s = 0.0
        for p in worker_params:
            s = s + p[j]
        out.append(s / k)
    return out`,
    testCases: [
      { input: [[[1.0, 3.0], [2.0, 4.0], [3.0, 5.0]]], expected: [2.0, 4.0] },
      { input: [[[1.0], [2.0]]], expected: [1.5] },
      { input: [[[5.0, 5.0]]], expected: [5.0, 5.0] },
      { input: [[]], expected: [] },
    ],
    hint: "All-reduce averages each coordinate across workers.",
  },
  {
    id: "op-166",
    title: "Local SGD Communication Count",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Count the communication rounds in local SGD.\n\nReturn ceil(total_steps / local_steps), or 0 when either argument is not positive. Workers synchronize only when the local steps complete.",
    starterCode: `def local_sgd_communication_count(total_steps, local_steps):
    # Your code here
    pass`,
    solution: `def local_sgd_communication_count(total_steps, local_steps):
    import math
    if local_steps <= 0 or total_steps <= 0:
        return 0
    return int(math.ceil(total_steps / local_steps))`,
    testCases: [
      { input: [100, 10], expected: 10 },
      { input: [95, 10], expected: 10 },
      { input: [7, 3], expected: 3 },
      { input: [10, 0], expected: 0 },
    ],
    hint: "Round up because a partial final round still communicates.",
  },
  {
    id: "op-167",
    title: "Federated Averaging Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one federated averaging aggregation step.\n\nReturn the count-weighted mean of the client updates: sum(counts[k] * updates[k]) / sum(counts). Return [] when the total count is zero or there are no updates.",
    starterCode: `def federated_average(updates, counts):
    # Your code here
    pass`,
    solution: `def federated_average(updates, counts):
    total = 0.0
    for c in counts:
        total = total + c
    if total == 0 or not updates:
        return []
    d = len(updates[0])
    out = []
    for j in range(d):
        s = 0.0
        for k in range(len(updates)):
            s = s + updates[k][j] * counts[k]
        out.append(s / total)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [1.0, 3.0]], expected: [2.5, 3.5] },
      { input: [[[1.0], [3.0], [5.0]], [2, 1, 1]], expected: [2.5] },
      { input: [[[2.0, 0.0]], [5]], expected: [2.0, 0.0] },
    ],
    hint: "Clients are weighted by their number of local samples.",
  },
  {
    id: "op-168",
    title: "Differential Privacy Clip",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Clip a gradient and add calibrated Gaussian noise for DP-SGD.\n\nScale grad down when its norm exceeds clip_norm, then add random.gauss(0.0, 1.0) * noise_multiplier * clip_norm / batch_size to every coordinate after random.seed(seed). Return the noisy clipped gradient.",
    starterCode: `def dp_clip(grad, clip_norm, noise_multiplier, batch_size, seed):
    # Your code here
    pass`,
    solution: `def dp_clip(grad, clip_norm, noise_multiplier, batch_size, seed):
    import random
    total = 0.0
    for g in grad:
        total = total + g * g
    norm = total ** 0.5
    if norm > clip_norm and norm > 0:
        scale = clip_norm / norm
        grad = [g * scale for g in grad]
    random.seed(seed)
    noise = noise_multiplier * clip_norm / batch_size
    return [g + noise * random.gauss(0.0, 1.0) for g in grad]`,
    testCases: [
      { input: [[3.0, 4.0], 2.5, 1.0, 10, 0], expected: [1.735428851170166, 1.6508554738247125] },
      { input: [[0.1, 0.2], 5.0, 0.5, 4, 42], expected: [0.009943544013794783, 0.09193524979280045] },
      { input: [[1.0, 0.0], 1.0, 0.0, 8, 7], expected: [1.0, 0.0] },
    ],
    hint: "Clipping bounds each per-sample contribution before the noise is added.",
  },
  {
    id: "op-169",
    title: "DP Noise Multiplier",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the classic Gaussian mechanism noise multiplier.\n\nReturn sqrt(2 * ln(1.25 / delta)) / epsilon, the standard scale for an (epsilon, delta)-differentially private release. Return 0.0 when epsilon is not positive or delta is outside (0, 1).",
    starterCode: `def dp_noise_multiplier(epsilon, delta):
    # Your code here
    pass`,
    solution: `def dp_noise_multiplier(epsilon, delta):
    import math
    if epsilon <= 0 or delta <= 0 or delta >= 1:
        return 0.0
    return (2.0 * math.log(1.25 / delta)) ** 0.5 / epsilon`,
    testCases: [
      { input: [1.0, 1e-5], expected: 4.844805262605389 },
      { input: [0.5, 1e-6], expected: 10.597605053700947 },
      { input: [2.0, 1e-6], expected: 2.649401263425237 },
      { input: [0.0, 1e-5], expected: 0.0 },
    ],
    hint: "Smaller epsilon or delta demands a larger noise multiplier.",
  },
  {
    id: "op-170",
    title: "Privacy Budget Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Account for one private release in a privacy budget.\n\nReturn [eps_spent + eps_step, stop] where stop is True when the new total exceeds max_eps. Otherwise stop is False.",
    starterCode: `def privacy_budget_step(eps_spent, eps_step, max_eps):
    # Returns [new_eps, stop]
    # Your code here
    pass`,
    solution: `def privacy_budget_step(eps_spent, eps_step, max_eps):
    new_eps = eps_spent + eps_step
    return [new_eps, new_eps > max_eps]`,
    testCases: [
      { input: [0.5, 0.25, 1.0], expected: [0.75, false] },
      { input: [0.9, 0.2, 1.0], expected: [1.1, true] },
      { input: [0.0, 1.0, 1.0], expected: [1.0, false] },
      { input: [2.0, 0.0, 5.0], expected: [2.0, false] },
    ],
    hint: "Stop only when the budget is strictly exceeded.",
  },
  {
    id: "op-171",
    title: "Per-Sample Grad Norm",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Euclidean norm of a single per-sample gradient.\n\nReturn sqrt(sum(g ** 2)); an empty gradient returns 0.0. This value feeds per-sample clipping in differentially private training.",
    starterCode: `def per_sample_grad_norm(grad):
    # Your code here
    pass`,
    solution: `def per_sample_grad_norm(grad):
    total = 0.0
    for g in grad:
        total = total + g * g
    return total ** 0.5`,
    testCases: [
      { input: [[3.0, 4.0]], expected: 5.0 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[1.0, -1.0, 1.0]], expected: 1.7320508075688772 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "The norm is the Euclidean length of the gradient vector.",
  },
  {
    id: "op-172",
    title: "Clipping Bias Estimate",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the expected value of a Gaussian gradient after clipping to [-clip, clip].\n\nFor g ~ N(mu, sigma ** 2), return mu * (Phi(z1) - Phi(z2)) + sigma * (phi(z2) - phi(z1)) + clip * (1 - Phi(z1) - Phi(z2)) with z1 = (clip - mu) / sigma, z2 = (-clip - mu) / sigma, and Phi, phi the standard normal CDF and PDF. For sigma <= 0, clip mu directly.",
    starterCode: `def clipping_bias_estimate(mu, sigma, clip):
    # Your code here
    pass`,
    solution: `def clipping_bias_estimate(mu, sigma, clip):
    import math
    if sigma <= 0:
        if mu > clip:
            return clip
        if mu < -clip:
            return -clip
        return mu
    z1 = (clip - mu) / sigma
    z2 = (-clip - mu) / sigma
    cdf1 = 0.5 * (1 + math.erf(z1 / (2 ** 0.5)))
    cdf2 = 0.5 * (1 + math.erf(z2 / (2 ** 0.5)))
    pdf1 = math.exp(-0.5 * z1 * z1) / ((2 * math.pi) ** 0.5)
    pdf2 = math.exp(-0.5 * z2 * z2) / ((2 * math.pi) ** 0.5)
    return mu * (cdf1 - cdf2) + sigma * (pdf2 - pdf1) + clip * (1 - cdf1 - cdf2)`,
    testCases: [
      { input: [0.0, 1.0, 2.0], expected: 0.0 },
      { input: [1.0, 1.0, 2.0], expected: 0.9170666837293614 },
      { input: [3.0, 1.0, 2.0], expected: 1.916684582873969 },
      { input: [0.5, 2.0, 1.0], expected: 0.1896444392971461 },
    ],
    hint: "Split the expectation into the truncated body and the two clipped tails.",
  },
  {
    id: "op-173",
    title: "Normalized SGD Scale",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Scale a gradient to unit norm before stepping.\n\nReturn lr * g_i / (||g|| + eps) for each coordinate. A zero gradient returns all zeros.",
    starterCode: `def normalized_sgd_scale(grad, lr, eps):
    # Your code here
    pass`,
    solution: `def normalized_sgd_scale(grad, lr, eps):
    total = 0.0
    for g in grad:
        total = total + g * g
    norm = total ** 0.5
    return [lr * g / (norm + eps) for g in grad]`,
    testCases: [
      { input: [[3.0, 4.0], 0.1, 1e-8], expected: [0.05999999988000001, 0.07999999984] },
      { input: [[1.0, 0.0], 0.5, 0.0], expected: [0.5, 0.0] },
      { input: [[0.0, 0.0], 1.0, 1e-8], expected: [0.0, 0.0] },
    ],
    hint: "Normalized SGD makes the step length independent of the gradient magnitude.",
  },
  {
    id: "op-174",
    title: "Weight Decay Equivalence",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Convert an L2 regularization coefficient into an equivalent decoupled weight decay.\n\nUnder the SGDW convention the decay is applied outside the learning rate, so return l2_coef * lr. This reproduces the same per-step shrinkage as gradient-based L2 regularization.",
    starterCode: `def weight_decay_equivalence(l2_coef, lr):
    # Your code here
    pass`,
    solution: `def weight_decay_equivalence(l2_coef, lr):
    return l2_coef * lr`,
    testCases: [
      { input: [0.01, 0.1], expected: 0.001 },
      { input: [0.1, 0.01], expected: 0.001 },
      { input: [0.0, 0.5], expected: 0.0 },
      { input: [0.05, 1.0], expected: 0.05 },
    ],
    hint: "When decay is applied directly, it must absorb the learning rate factor.",
  },
  {
    id: "op-175",
    title: "Decoupled vs Coupled Decay Delta",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Measure the per-step difference between decoupled and coupled weight decay under an adaptive optimizer.\n\nCoupled decay is scaled by the adaptive denominator, giving lr * wd * w / denom, while decoupled decay gives lr * wd * w. Return decoupled - coupled, where denom is sqrt(v_hat) + eps.",
    starterCode: `def decoupled_vs_coupled_delta(w, lr, wd, denom):
    # Your code here
    pass`,
    solution: `def decoupled_vs_coupled_delta(w, lr, wd, denom):
    coupled = lr * wd * w / denom
    decoupled = lr * wd * w
    return decoupled - coupled`,
    testCases: [
      { input: [2.0, 0.1, 0.01, 2.0], expected: 0.001 },
      { input: [1.0, 0.5, 0.1, 1.0], expected: 0.0 },
      { input: [-3.0, 0.2, 0.05, 4.0], expected: -0.022500000000000006 },
      { input: [0.0, 0.1, 0.1, 1.0], expected: 0.0 },
    ],
    hint: "The adaptive denominator changes how much shrinkage a coupled penalty actually applies.",
  },
  {
    id: "op-176",
    title: "Cosine vs Linear Schedule Compare",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compare a cosine schedule with a linear schedule at the same step.\n\nClamp progress = step / total to [0, 1], evaluate both schedules from base_lr to min_lr, and return cosine - linear. Return 0.0 when total is not positive.",
    starterCode: `def cosine_vs_linear_diff(base_lr, min_lr, total, step):
    # Your code here
    pass`,
    solution: `def cosine_vs_linear_diff(base_lr, min_lr, total, step):
    import math
    if total <= 0:
        return 0.0
    progress = step / total
    if progress > 1:
        progress = 1.0
    if progress < 0:
        progress = 0.0
    cos = min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))
    lin = min_lr + (base_lr - min_lr) * (1 - progress)
    return cos - lin`,
    testCases: [
      { input: [0.1, 0.0, 100, 0], expected: 0.0 },
      { input: [0.1, 0.0, 100, 25], expected: 0.010355339059327368 },
      { input: [0.1, 0.0, 100, 50], expected: 0.0 },
      { input: [0.1, 0.0, 100, 100], expected: 0.0 },
      { input: [0.1, 0.0, 0, 5], expected: 0.0 },
    ],
    hint: "The cosine curve is above the linear one early and below it later.",
  },
  {
    id: "op-177",
    title: "Warmup Heuristic Length",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the recommended warmup length for Adam from the second-moment decay.\n\nReturn ceil(2 / (1 - beta2)) steps, the heuristic that lets the second moment approach its stationary value. Return 0 when beta2 is outside [0, 1).",
    starterCode: `def warmup_heuristic_length(beta2):
    # Your code here
    pass`,
    solution: `def warmup_heuristic_length(beta2):
    import math
    if beta2 >= 1.0 or beta2 < 0:
        return 0
    return int(math.ceil(2.0 / (1.0 - beta2)))`,
    testCases: [
      { input: [0.999], expected: 2000 },
      { input: [0.9], expected: 21 },
      { input: [0.99], expected: 200 },
      { input: [1.0], expected: 0 },
    ],
    hint: "Larger beta2 means a longer memory and a longer recommended warmup.",
  },
  {
    id: "op-178",
    title: "Batch Scaling Rule Lite",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the square-root batch scaling rule.\n\nReturn base_lr * sqrt(new_batch / base_batch), which keeps the gradient noise per step roughly constant as the batch grows.",
    starterCode: `def batch_scaling_lr(base_lr, base_batch, new_batch):
    # Your code here
    pass`,
    solution: `def batch_scaling_lr(base_lr, base_batch, new_batch):
    return base_lr * (new_batch / base_batch) ** 0.5`,
    testCases: [
      { input: [0.1, 32, 128], expected: 0.2 },
      { input: [0.01, 100, 100], expected: 0.01 },
      { input: [0.1, 16, 4], expected: 0.05 },
      { input: [0.2, 64, 1024], expected: 0.8 },
    ],
    hint: "Quadrupling the batch doubles the recommended learning rate.",
  },
  {
    id: "op-179",
    title: "LR Transfer Estimate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate an equivalent SGD learning rate from an Adam learning rate.\n\nReturn adam_lr / sqrt(1 - beta2), the common heuristic that rescales the adaptive step back to the raw gradient scale.",
    starterCode: `def adam_to_sgd_lr_transfer(adam_lr, beta2):
    # Your code here
    pass`,
    solution: `def adam_to_sgd_lr_transfer(adam_lr, beta2):
    return adam_lr / ((1 - beta2) ** 0.5)`,
    testCases: [
      { input: [0.001, 0.999], expected: 0.031622776601683784 },
      { input: [0.01, 0.9], expected: 0.0316227766016838 },
      { input: [0.1, 0.99], expected: 0.9999999999999996 },
      { input: [0.001, 0.0], expected: 0.001 },
    ],
    hint: "Dividing by sqrt(1 - beta2) undoes the RMS scaling of the adaptive step.",
  },
  {
    id: "op-180",
    title: "Sensitivity Rank",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Estimate the numerical rank of a 2x2 sensitivity matrix.\n\nCompute p = sum of squared entries, q = det(A), lmax = (p + sqrt(p ** 2 - 4 * q ** 2)) / 2, and lmin = (p - sqrt(p ** 2 - 4 * q ** 2)) / 2. The singular values are sqrt(lmax) and sqrt(lmin); return how many exceed tol.",
    starterCode: `def sensitivity_rank(A, tol):
    # Your code here
    pass`,
    solution: `def sensitivity_rank(A, tol):
    a = A[0][0]
    b = A[0][1]
    c = A[1][0]
    d = A[1][1]
    p = a * a + b * b + c * c + d * d
    q = a * d - b * c
    disc = p * p - 4 * q * q
    if disc < 0:
        disc = 0.0
    lmax = (p + disc ** 0.5) / 2.0
    lmin = (p - disc ** 0.5) / 2.0
    if lmin < 0:
        lmin = 0.0
    s1 = lmax ** 0.5
    s2 = lmin ** 0.5
    rank = 0
    if s1 > tol:
        rank = rank + 1
    if s2 > tol:
        rank = rank + 1
    return rank`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], 1e-6], expected: 2 },
      { input: [[[1.0, 2.0], [2.0, 4.0]], 1e-6], expected: 1 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 1e-6], expected: 0 },
      { input: [[[1.0, 0.0], [0.0, 1e-9]], 1e-6], expected: 1 },
    ],
    hint: "Singular values are square roots of the eigenvalues of A transpose A.",
  },
  {
    id: "op-181",
    title: "Random Search Budget",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the number of random samples needed to hit a target with a given confidence.\n\nReturn ceil(log(1 - target_conf) / log(1 - hit_prob)). Return 1 when hit_prob >= 1 and 0 when hit_prob or target_conf is not positive.",
    starterCode: `def random_search_budget(hit_prob, target_conf):
    # Your code here
    pass`,
    solution: `def random_search_budget(hit_prob, target_conf):
    import math
    if hit_prob >= 1.0:
        return 1
    if hit_prob <= 0.0 or target_conf <= 0.0:
        return 0
    return int(math.ceil(math.log(1.0 - target_conf) / math.log(1.0 - hit_prob)))`,
    testCases: [
      { input: [0.01, 0.95], expected: 299 },
      { input: [0.1, 0.9], expected: 22 },
      { input: [1.0, 0.9], expected: 1 },
      { input: [0.5, 0.5], expected: 1 },
    ],
    hint: "Each sample independently misses with probability 1 - hit_prob.",
  },
  {
    id: "op-182",
    title: "GP Acquisition Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute a Gaussian process posterior at a query point with a squared-exponential kernel.\n\nUsing k(a, b) = exp(-(a - b) ** 2 / (2 * lengthscale ** 2)) and adding the observation noise to the diagonal, compute the posterior mean and standard deviation and then the UCB acquisition mean + kappa * std. Return [mean, std, ucb].",
    starterCode: `def gp_acquisition_step(X, y, x_star, lengthscale, noise, kappa):
    # Returns [mean, std, ucb]
    # Your code here
    pass`,
    solution: `def gp_acquisition_step(X, y, x_star, lengthscale, noise, kappa):
    import math
    dx = X[0] - X[1]
    k01 = math.exp(-(dx * dx) / (2.0 * lengthscale * lengthscale))
    k00 = 1.0 + noise
    k11 = 1.0 + noise
    det = k00 * k11 - k01 * k01
    d0 = x_star - X[0]
    d1 = x_star - X[1]
    s0 = math.exp(-(d0 * d0) / (2.0 * lengthscale * lengthscale))
    s1 = math.exp(-(d1 * d1) / (2.0 * lengthscale * lengthscale))
    invy0 = (k11 * y[0] - k01 * y[1]) / det
    invy1 = (-k01 * y[0] + k00 * y[1]) / det
    mean = s0 * invy0 + s1 * invy1
    invs0 = (k11 * s0 - k01 * s1) / det
    invs1 = (-k01 * s0 + k00 * s1) / det
    var = 1.0 - (s0 * invs0 + s1 * invs1)
    if var < 0:
        var = 0.0
    std = var ** 0.5
    return [mean, std, mean + kappa * std]`,
    testCases: [
      { input: [[0.0, 1.0], [0.0, 1.0], 0.5, 1.0, 0.01, 2.0], expected: [0.5459202999227215, 0.19092944382753016, 0.9277791875777819] },
      { input: [[0.0, 1.0], [1.0, 2.0], 0.25, 0.5, 0.1, 1.5], expected: [1.1766363616344027, 0.49890091581250007, 1.9249877353531528] },
      { input: [[0.0, 2.0], [0.0, 0.0], 1.0, 1.0, 0.05, 1.0], expected: [0.0, 0.6158587938730616, 0.6158587938730616] },
    ],
    hint: "The posterior mean is k_star^T K^-1 y and the variance is k(x*, x*) minus k_star^T K^-1 k_star.",
  },
  {
    id: "op-183",
    title: "Expected Improvement",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the expected improvement acquisition for minimization.\n\nWith z = (best - mu) / sigma, return (best - mu) * Phi(z) + sigma * phi(z), where Phi is the standard normal CDF and phi its PDF. When sigma <= 0 return max(0, best - mu).",
    starterCode: `def expected_improvement(mu, sigma, best):
    # Your code here
    pass`,
    solution: `def expected_improvement(mu, sigma, best):
    import math
    if sigma <= 0:
        if best - mu > 0:
            return best - mu
        return 0.0
    z = (best - mu) / sigma
    cdf = 0.5 * (1 + math.erf(z / (2 ** 0.5)))
    pdf = math.exp(-0.5 * z * z) / ((2 * math.pi) ** 0.5)
    return (best - mu) * cdf + sigma * pdf`,
    testCases: [
      { input: [0.0, 1.0, 1.0], expected: 1.0833154705876864 },
      { input: [2.0, 0.5, 1.0], expected: 0.004245351308414823 },
      { input: [1.0, 0.0, 0.5], expected: 0.0 },
      { input: [3.0, 2.0, 1.0], expected: 0.16663094117537258 },
    ],
    hint: "The improvement is max(0, best - y), and its expectation has a closed form.",
  },
  {
    id: "op-184",
    title: "ASHA Rung Promotion",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Select the configurations promoted to the next ASHA rung.\n\nKeep k = max(1, int(len(scores) * keep_fraction)) configurations with the highest scores, breaking ties by the lower index. Return the selected indices in descending score order; an empty score list returns [].",
    starterCode: `def asha_rung_promotion(scores, keep_fraction):
    # Your code here
    pass`,
    solution: `def asha_rung_promotion(scores, keep_fraction):
    n = len(scores)
    if n == 0:
        return []
    k = int(n * keep_fraction)
    if k < 1:
        k = 1
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    return order[:k]`,
    testCases: [
      { input: [[0.5, 0.9, 0.1, 0.7], 0.5], expected: [1, 3] },
      { input: [[1.0, 1.0, 1.0], 0.34], expected: [0] },
      { input: [[0.2], 0.1], expected: [0] },
      { input: [[2.0, 2.0, 1.0], 0.5], expected: [0] },
    ],
    hint: "Even with a tiny keep fraction, at least one configuration advances.",
  },
  {
    id: "op-185",
    title: "Early-Stopping Bandit Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Decide whether arm A can be stopped because arm B dominates it statistically.\n\nCompute each arm's UCB as mean + c * sqrt(log(total + 1) / n), where total is the combined number of pulls. Return True when arm B's UCB is strictly greater than arm A's, and False when either arm has no pulls.",
    starterCode: `def early_stopping_bandit_check(rewards_a, rewards_b, c):
    # Your code here
    pass`,
    solution: `def early_stopping_bandit_check(rewards_a, rewards_b, c):
    import math
    na = len(rewards_a)
    nb = len(rewards_b)
    if na == 0 or nb == 0:
        return False
    total = na + nb
    ua = sum(rewards_a) / na + c * math.sqrt(math.log(total + 1) / na)
    ub = sum(rewards_b) / nb + c * math.sqrt(math.log(total + 1) / nb)
    return ub > ua`,
    testCases: [
      { input: [[1.0, 0.5], [2.0, 1.5], 1.0], expected: true },
      { input: [[2.0, 2.0], [1.0, 1.0], 0.5], expected: false },
      { input: [[1.0], [1.0], 1.0], expected: false },
      { input: [[], [1.0], 1.0], expected: false },
    ],
    hint: "The confidence bonus shrinks as an arm collects more pulls.",
  },
];
