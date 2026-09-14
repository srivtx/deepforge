import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-296",
    title: "Mini Batch Gradient Mean",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The mini-batch gradient is the elementwise mean of the per-sample gradients in the batch.\n\nGiven a list of gradient vectors, return their elementwise mean.",
    starterCode: `def mini_batch_gradient_mean(grads):
    # Your code here
    pass`,
    solution: `def mini_batch_gradient_mean(grads):
    n = len(grads)
    dim = len(grads[0])
    return [sum(g[i] for g in grads) / n for i in range(dim)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [2.0, 3.0] },
      { input: [[[1, 0], [0, 1], [2, 2]]], expected: [1.0, 1.0] },
      { input: [[[2, 2], [4, 4]]], expected: [3.0, 3.0] },
    ],
    hint: "Average each coordinate across the batch.",
  },
  {
    id: "op-297",
    title: "Mini Batch Gradient Variance",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The gradient noise in a mini-batch is captured by the population variance of the per-sample gradients, computed coordinatewise.\n\nGiven a list of gradient vectors, return a list with the variance of each coordinate.",
    starterCode: `def mini_batch_gradient_variance(grads):
    # Your code here
    pass`,
    solution: `def mini_batch_gradient_variance(grads):
    n = len(grads)
    dim = len(grads[0])
    means = [sum(g[i] for g in grads) / n for i in range(dim)]
    return [sum((g[i] - means[i]) ** 2 for g in grads) / n for i in range(dim)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1.0, 1.0] },
      { input: [[[0, 0], [0, 0], [0, 0]]], expected: [0.0, 0.0] },
      { input: [[[1, 1], [3, 1], [2, 4]]], expected: [0.6666666666666666, 2.0] },
    ],
    hint: "Compute the mean first, then average squared deviations per coordinate.",
  },
  {
    id: "op-298",
    title: "Control Variate Variance Ratio",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "With a control variate correlated at level rho with the target estimator, the optimal variance reduction leaves the ratio 1 - rho^2 of the original variance.\n\nGiven the correlation coefficient rho, return the variance ratio.",
    starterCode: `def control_variate_variance_ratio(rho):
    # Your code here
    pass`,
    solution: `def control_variate_variance_ratio(rho):
    return 1.0 - rho * rho`,
    testCases: [
      { input: [0.5], expected: 0.75 },
      { input: [0.99], expected: 0.01990000000000003 },
      { input: [0.0], expected: 1.0 },
    ],
    hint: "Perfect correlation annihilates the variance.",
  },
  {
    id: "op-299",
    title: "Control Variate Adjusted Estimate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "A control variate estimator is mean(f) - c * (mean(h) - mu_h), where mu_h is the known expectation of the control. For the optimal coefficient c = Cov(f, h) / Var(h), the covariance is Cov(f, h) / Var(h).\n\nGiven samples of f, samples of h, the known mean of h, and the coefficient c (default 1.0), return the adjusted estimate.",
    starterCode: `def control_variate_adjusted_estimate(f_samples, h_samples, h_mean, c=1.0):
    # Your code here
    pass`,
    solution: `def control_variate_adjusted_estimate(f_samples, h_samples, h_mean, c=1.0):
    n = len(f_samples)
    mean_f = sum(f_samples) / n
    mean_h = sum(h_samples) / n
    return mean_f - c * (mean_h - h_mean)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0.5, 1.0, 1.5], 1.0], expected: 2.0 },
      { input: [[2.0, 4.0], [1.0, 3.0], 3.0, 0.5], expected: 3.5 },
      { input: [[0.0, 0.0], [5.0, 5.0], 5.0], expected: 0.0 },
    ],
    hint: "Subtract the scaled discrepancy between the sample and known control means.",
  },
  {
    id: "op-300",
    title: "Antithetic Pair Mean",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Antithetic variates combine a sample with its mirror image. Given a list of primary values and the list of mirrored values, return the mean of the union of the two lists.\n\nBoth lists must have the same length.",
    starterCode: `def antithetic_pair_mean(primary, mirrored):
    # Your code here
    pass`,
    solution: `def antithetic_pair_mean(primary, mirrored):
    values = list(primary) + list(mirrored)
    return sum(values) / len(values)`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 4.0]], expected: 2.5 },
      { input: [[0.5], [0.5]], expected: 0.5 },
      { input: [[1.0, 2.0, 3.0], [1.0, 4.0, 2.0]], expected: 2.1666666666666665 },
    ],
    hint: "Average all samples together after concatenation.",
  },
  {
    id: "op-301",
    title: "Robbins Monro Stepsize",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "The Robbins-Monro schedule is lr_t = a / (t + b), which decays slowly enough to converge for stochastic approximation.\n\nGiven a, b, and the iteration index t (starting at 0), return the step size.",
    starterCode: `def robbins_monro_stepsize(a, b, t):
    # Your code here
    pass`,
    solution: `def robbins_monro_stepsize(a, b, t):
    return a / (t + b)`,
    testCases: [
      { input: [1.0, 1, 0], expected: 1.0 },
      { input: [2.0, 10, 5], expected: 0.13333333333333333 },
      { input: [0.5, 0.5, 4], expected: 0.1111111111111111 },
    ],
    hint: "The offset b keeps the first steps finite.",
  },
  {
    id: "op-302",
    title: "Polyak Averaging Uniform Weights",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Polyak-Ruppert averaging gives each of the k iterates weight 1/k.\n\nGiven k > 0, return the list of k uniform weights.",
    starterCode: `def polyak_averaging_uniform_weights(k):
    # Your code here
    pass`,
    solution: `def polyak_averaging_uniform_weights(k):
    return [1.0 / k] * k`,
    testCases: [
      { input: [1], expected: [1.0] },
      { input: [3], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [5], expected: [0.2, 0.2, 0.2, 0.2, 0.2] },
    ],
    hint: "All weights are equal and sum to one.",
  },
  {
    id: "op-303",
    title: "EMA Bias Corrected Mean",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "An exponential moving average initialized at zero is biased toward zero; the corrected estimate is m / (1 - beta^t) where t is the number of updates.\n\nGiven the raw EMA m, the decay beta, and t >= 1, return the bias-corrected mean.",
    starterCode: `def ema_bias_corrected_mean(m, beta, t):
    # Your code here
    pass`,
    solution: `def ema_bias_corrected_mean(m, beta, t):
    return m / (1.0 - beta ** t)`,
    testCases: [
      { input: [0.1, 0.9, 1], expected: 1.0000000000000002 },
      { input: [0.5, 0.9, 10], expected: 0.7676699663938148 },
      { input: [0.25, 0.5, 2], expected: 0.3333333333333333 },
    ],
    hint: "The correction divides out the geometric weight mass accumulated so far.",
  },
  {
    id: "op-304",
    title: "Gradient Clip by Global Norm Scale",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Global norm clipping rescales a gradient vector by threshold / ||g|| when its norm exceeds the threshold, and leaves it unchanged otherwise.\n\nGiven the gradient and the threshold, return the clipped gradient.",
    starterCode: `def gradient_clip_by_global_norm_scale(grad, threshold):
    # Your code here
    pass`,
    solution: `def gradient_clip_by_global_norm_scale(grad, threshold):
    import math
    norm = math.sqrt(sum(v * v for v in grad))
    if norm <= threshold:
        return list(grad)
    scale = threshold / norm
    return [v * scale for v in grad]`,
    testCases: [
      { input: [[3, 4], 2.0], expected: [1.2000000000000002, 1.6] },
      { input: [[0.1, 0.1], 1.0], expected: [0.1, 0.1] },
      { input: [[6, 8], 10.0], expected: [6, 8] },
    ],
    hint: "Only the overall scale changes, not the direction.",
  },
  {
    id: "op-305",
    title: "Gradient Clip by Value Vector",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Value clipping clamps each gradient coordinate into [-clip, clip] independently.\n\nGiven the gradient and the clip value, return the clipped gradient.",
    starterCode: `def gradient_clip_by_value_vector(grad, clip):
    # Your code here
    pass`,
    solution: `def gradient_clip_by_value_vector(grad, clip):
    return [min(max(v, -clip), clip) for v in grad]`,
    testCases: [
      { input: [[5, -5, 0], 2.0], expected: [2.0, -2.0, 0] },
      { input: [[0.5], 1.0], expected: [0.5] },
      { input: [[-3, 3], 3.0], expected: [-3, 3] },
    ],
    hint: "Apply the box projection coordinatewise.",
  },
  {
    id: "op-306",
    title: "AdaGrad Accumulator Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "AdaGrad accumulates squared gradients G_new = G + g^2 and takes the step x_new = x - lr * g / sqrt(G_new + eps).\n\nGiven x, g, the accumulator G, lr, and eps, return [x_new, G_new] for scalar parameters.",
    starterCode: `def adagrad_accumulator_step(x, g, accumulator, lr, eps):
    # Your code here
    pass`,
    solution: `def adagrad_accumulator_step(x, g, accumulator, lr, eps):
    import math
    acc = accumulator + g * g
    return [x - lr * g / math.sqrt(acc + eps), acc]`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.1, 1e-08], expected: [0.900000002, 0.25] },
      { input: [0.0, -2.0, 3.0, 0.5, 1e-08], expected: [0.3779644727392526, 7.0] },
      { input: [2.0, 1.0, 1.0, 1.0, 0.0], expected: [1.2928932188134525, 2.0] },
    ],
    hint: "Update the accumulator first, then scale the step by its square root.",
  },
  {
    id: "op-307",
    title: "RMSProp Single Scalar Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "RMSProp tracks v_new = rho * v + (1 - rho) * g^2 and updates x_new = x - lr * g / sqrt(v_new + eps).\n\nGiven x, g, v, rho, lr, and eps, return [x_new, v_new].",
    starterCode: `def rmsprop_single_scalar_step(x, g, v, rho, lr, eps):
    # Your code here
    pass`,
    solution: `def rmsprop_single_scalar_step(x, g, v, rho, lr, eps):
    import math
    v_new = rho * v + (1.0 - rho) * g * g
    return [x - lr * g / math.sqrt(v_new + eps), v_new]`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.9, 0.01, 1e-08], expected: [0.9683772297228697, 0.024999999999999994] },
      { input: [0.0, -1.0, 0.5, 0.5, 0.1, 1e-08], expected: [0.1154700530681248, 0.75] },
      { input: [3.0, 2.0, 4.0, 0.99, 1.0, 0.0], expected: [2.0, 4.0] },
    ],
    hint: "Update the running average of squares before dividing.",
  },
  {
    id: "op-308",
    title: "Inverse Time Decay Schedule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "The inverse time decay schedule is lr_t = lr0 / (1 + k * t).\n\nGiven the base rate lr0, the decay rate k, and the step t, return the learning rate.",
    starterCode: `def inverse_time_decay_schedule(lr0, k, t):
    # Your code here
    pass`,
    solution: `def inverse_time_decay_schedule(lr0, k, t):
    return lr0 / (1.0 + k * t)`,
    testCases: [
      { input: [0.1, 0.01, 100], expected: 0.05 },
      { input: [1.0, 1.0, 0], expected: 1.0 },
      { input: [0.5, 0.5, 3], expected: 0.2 },
    ],
    hint: "The denominator grows linearly with the step count.",
  },
  {
    id: "op-309",
    title: "Cosine Schedule Value at Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Cosine annealing sets lr_t = lr_min + 0.5 * (lr_max - lr_min) * (1 + cos(pi * t / T)).\n\nGiven lr_max, lr_min, t, and total steps T > 0, return the learning rate at step t.",
    starterCode: `def cosine_schedule_value_at_step(lr_max, lr_min, t, total):
    # Your code here
    pass`,
    solution: `def cosine_schedule_value_at_step(lr_max, lr_min, t, total):
    import math
    return lr_min + 0.5 * (lr_max - lr_min) * (1.0 + math.cos(math.pi * t / total))`,
    testCases: [
      { input: [0.1, 0.0, 0, 100], expected: 0.1 },
      { input: [0.1, 0.001, 50, 100], expected: 0.0505 },
      { input: [0.2, 0.0, 100, 100], expected: 0.0 },
    ],
    hint: "The cosine sweeps from 1 to -1 as t goes from 0 to T.",
  },
  {
    id: "op-310",
    title: "One Cycle Peak Fraction",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "A one-cycle schedule rises linearly from 0 to peak_step and falls linearly from peak_step to total, never below zero.\n\nGiven t, peak_step, and total (with 0 < peak_step <= total), return the cycle fraction max(0, ...) where it is t / peak_step on the way up and (total - t) / (total - peak_step) on the way down.",
    starterCode: `def one_cycle_peak_fraction(t, peak_step, total):
    # Your code here
    pass`,
    solution: `def one_cycle_peak_fraction(t, peak_step, total):
    if t <= peak_step:
        return t / peak_step
    return max(0.0, (total - t) / (total - peak_step))`,
    testCases: [
      { input: [10, 20, 100], expected: 0.5 },
      { input: [30, 20, 100], expected: 0.875 },
      { input: [150, 20, 100], expected: 0.0 },
    ],
    hint: "Two linear branches sharing the peak at t = peak_step.",
  },
  {
    id: "op-311",
    title: "Exponential Decay Half Life Steps",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "For exponential decay lr_t = lr0 * exp(-decay * t), the learning rate halves after ln(2) / decay steps.\n\nGiven the decay rate, return the number of steps to halve the learning rate.",
    starterCode: `def exponential_decay_half_life_steps(decay):
    # Your code here
    pass`,
    solution: `def exponential_decay_half_life_steps(decay):
    import math
    return math.log(2.0) / decay`,
    testCases: [
      { input: [0.1], expected: 6.931471805599452 },
      { input: [1.0], expected: 0.6931471805599453 },
      { input: [0.01], expected: 69.31471805599453 },
    ],
    hint: "Solve exp(-decay * t) = 1/2 for t.",
  },
  {
    id: "op-312",
    title: "Step Decay Milestone Factor",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Step decay multiplies the learning rate by gamma every step_size steps: lr_t = lr0 * gamma^(floor(t / step_size)).\n\nGiven lr0, gamma, step_size, and t, return the learning rate.",
    starterCode: `def step_decay_milestone_factor(lr0, gamma, step_size, t):
    # Your code here
    pass`,
    solution: `def step_decay_milestone_factor(lr0, gamma, step_size, t):
    return lr0 * gamma ** (t // step_size)`,
    testCases: [
      { input: [1.0, 0.5, 10, 25], expected: 0.25 },
      { input: [0.1, 0.1, 5, 5], expected: 0.010000000000000002 },
      { input: [2.0, 0.9, 20, 0], expected: 2.0 },
    ],
    hint: "Count completed milestones with integer division.",
  },
  {
    id: "op-313",
    title: "AdaDelta Accumulated Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "AdaDelta updates the gradient accumulator G_new = rho * G + (1 - rho) g^2 and the update accumulator D_new = rho * D + (1 - rho) delta^2, where delta = -sqrt(D + eps) / sqrt(G_new + eps) * g and x_new = x + delta.\n\nGiven x, g, G, D, rho, and eps, return [x_new, G_new, D_new].",
    starterCode: `def adadelta_accumulated_update(x, g, g_acc, d_acc, rho, eps):
    # Your code here
    pass`,
    solution: `def adadelta_accumulated_update(x, g, g_acc, d_acc, rho, eps):
    import math
    g_new = rho * g_acc + (1.0 - rho) * g * g
    delta = -math.sqrt(d_acc + eps) / math.sqrt(g_new + eps) * g
    x_new = x + delta
    d_new = rho * d_acc + (1.0 - rho) * delta * delta
    return [x_new, g_new, d_new]`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.0, 0.9, 1e-06], expected: [0.9968377855834876, 0.024999999999999994, 9.99960001599936e-07] },
      { input: [0.0, -2.0, 1.0, 0.25, 0.5, 1e-08], expected: [0.6324555434178754, 2.5, 0.3250000072] },
      { input: [2.0, 1.0, 4.0, 1.0, 0.9, 0.0], expected: [1.4801247550899637, 3.7, 0.927027027027027] },
    ],
    hint: "Use the old update accumulator in this step, then update it with the new delta.",
  },
  {
    id: "op-314",
    title: "Adam Moment Estimate Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Adam maintains m_new = beta1 * m + (1 - beta1) * g and v_new = beta2 * v + (1 - beta2) * g^2.\n\nGiven the current m, v, the gradient g, beta1, and beta2, return [m_new, v_new] for a scalar parameter.",
    starterCode: `def adam_moment_estimate_update(m, v, g, beta1, beta2):
    # Your code here
    pass`,
    solution: `def adam_moment_estimate_update(m, v, g, beta1, beta2):
    m_new = beta1 * m + (1.0 - beta1) * g
    v_new = beta2 * v + (1.0 - beta2) * g * g
    return [m_new, v_new]`,
    testCases: [
      { input: [0.0, 0.0, 1.0, 0.9, 0.999], expected: [0.09999999999999998, 0.0010000000000000009] },
      { input: [1.0, 2.0, -0.5, 0.5, 0.5], expected: [0.25, 1.125] },
      { input: [0.2, 0.1, 3.0, 0.99, 0.999], expected: [0.22800000000000004, 0.10890000000000001] },
    ],
    hint: "The first moment averages gradients, the second averages squared gradients.",
  },
  {
    id: "op-315",
    title: "Adam Bias Corrected Moments",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Adam corrects the moving averages with m_hat = m / (1 - beta1^t) and v_hat = v / (1 - beta2^t).\n\nGiven m, v, beta1, beta2, and the step t >= 1, return [m_hat, v_hat].",
    starterCode: `def adam_bias_corrected_moments(m, v, beta1, beta2, t):
    # Your code here
    pass`,
    solution: `def adam_bias_corrected_moments(m, v, beta1, beta2, t):
    return [m / (1.0 - beta1 ** t), v / (1.0 - beta2 ** t)]`,
    testCases: [
      { input: [0.1, 0.01, 0.9, 0.999, 1], expected: [1.0000000000000002, 9.999999999999991] },
      { input: [0.5, 0.5, 0.9, 0.9, 10], expected: [0.7676699663938148, 0.7676699663938148] },
      { input: [0.0, 0.0, 0.5, 0.5, 3], expected: [0.0, 0.0] },
    ],
    hint: "Divide each moment by one minus the decay raised to the step count.",
  },
];
