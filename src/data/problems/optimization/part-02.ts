import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-006",
    title: "Seeded Mini-Batch Indices",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Build the index batches for one epoch of mini-batch SGD.\n\nStart from indices [0, 1, ..., n-1], shuffle them after random.seed(seed) plus random.shuffle, then split them into consecutive chunks of batch_size. The last chunk may be shorter, and an empty input yields []. Return a list of index lists.",
    starterCode: `def mini_batch_indices(n, batch_size, seed):
    # Your code here
    pass`,
    solution: `def mini_batch_indices(n, batch_size, seed):
    import random
    indices = list(range(n))
    random.seed(seed)
    random.shuffle(indices)
    return [indices[i:i + batch_size] for i in range(0, n, batch_size)]`,
    testCases: [
      { input: [6, 2, 1], expected: [[2, 3], [5, 0], [4, 1]] },
      { input: [7, 3, 42], expected: [[1, 3, 4], [2, 6, 0], [5]] },
      { input: [3, 5, 0], expected: [[0, 2, 1]] },
      { input: [0, 4, 7], expected: [] },
    ],
    hint: "Reseed before shuffling so the batch order is reproducible for a given seed.",
  },
  {
    id: "op-007",
    title: "Nesterov Accelerated Descent",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimize f(x) = x^2 with Nesterov accelerated gradient descent.\n\nStart with x = start and velocity v = 0. For n_iters iterations compute the lookahead point look = x + mu * v, evaluate grad = 2 * look, update v = mu * v - lr * grad, then set x = x + v. Return the final value of x.",
    starterCode: `def nesterov_descent(start, lr, mu, n_iters):
    # Minimize f(x) = x ** 2
    # Your code here
    pass`,
    solution: `def nesterov_descent(start, lr, mu, n_iters):
    x = start
    v = 0.0
    for _ in range(n_iters):
        look = x + mu * v
        grad = 2 * look
        v = mu * v - lr * grad
        x = x + v
    return x`,
    testCases: [
      { input: [10, 0.01, 0.9, 2000], expected: 2.5781211955037704e-54 },
      { input: [5, 0.1, 0.5, 50], expected: -7.314645506403761e-10 },
      { input: [0, 0.1, 0.9, 100], expected: 0.0 },
      { input: [-3, 0.05, 0.8, 100], expected: -1.4750562658798427e-08 },
    ],
    hint: "The gradient is evaluated at x + mu * v, not at x.",
  },
  {
    id: "op-008",
    title: "Adagrad Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Perform one Adagrad update on a scalar parameter.\n\nGiven x, gradient g, and accumulated squared gradient accum, compute accum_new = accum + g * g and x_new = x - lr * g / (sqrt(accum_new) + eps). Return [x_new, accum_new].",
    starterCode: `def adagrad_update(x, g, accum, lr, eps):
    # Returns [x_new, accum_new]
    # Your code here
    pass`,
    solution: `def adagrad_update(x, g, accum, lr, eps):
    accum = accum + g * g
    x = x - lr * g / (accum ** 0.5 + eps)
    return [x, accum]`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.1, 1e-8], expected: [0.900000002, 0.25] },
      { input: [0.0, -2.0, 1.0, 0.01, 1e-8], expected: [0.00894427186999916, 5.0] },
      { input: [2.0, 0.0, 0.5, 0.1, 1e-8], expected: [2.0, 0.5] },
      { input: [-1.0, 3.0, 4.0, 0.05, 1e-8], expected: [-1.0416025146015075, 13.0] },
    ],
    hint: "Add g squared to the accumulator first, then take its square root.",
  },
  {
    id: "op-009",
    title: "RMSProp Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Perform one RMSProp update on a scalar parameter.\n\nGiven x, gradient g, running average avg_sq, learning rate lr, decay rho, and eps, compute avg_sq_new = rho * avg_sq + (1 - rho) * g * g and x_new = x - lr * g / (sqrt(avg_sq_new) + eps). Return [x_new, avg_sq_new].",
    starterCode: `def rmsprop_update(x, g, avg_sq, lr, rho, eps):
    # Returns [x_new, avg_sq]
    # Your code here
    pass`,
    solution: `def rmsprop_update(x, g, avg_sq, lr, rho, eps):
    avg_sq = rho * avg_sq + (1 - rho) * g * g
    x = x - lr * g / (avg_sq ** 0.5 + eps)
    return [x, avg_sq]`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 0.1, 0.9, 1e-8], expected: [0.6837722539831608, 0.024999999999999994] },
      { input: [0.0, -2.0, 1.0, 0.01, 0.95, 1e-8], expected: [0.018650095990893234, 1.1500000000000001] },
      { input: [2.0, 0.0, 0.5, 0.1, 0.9, 1e-8], expected: [2.0, 0.45] },
      { input: [-1.0, 3.0, 4.0, 0.05, 0.99, 1e-8], expected: [-1.0745355988796226, 4.05] },
    ],
    hint: "The running average uses rho on the old value and (1 - rho) on g * g.",
  },
  {
    id: "op-010",
    title: "Generic Adam Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Adam update on a scalar parameter at time step t (1-indexed).\n\nm_new = beta1 * m + (1 - beta1) * g, v_new = beta2 * v + (1 - beta2) * g * g, then bias-correct m_hat = m_new / (1 - beta1^t) and v_hat = v_new / (1 - beta2^t). Finally x_new = x - lr * m_hat / (sqrt(v_hat) + eps). Return [x_new, m_new, v_new].",
    starterCode: `def adam_update(x, m, v, g, t, lr, beta1, beta2, eps):
    # Returns [x_new, m_new, v_new]
    # Your code here
    pass`,
    solution: `def adam_update(x, m, v, g, t, lr, beta1, beta2, eps):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    x = x - lr * m_hat / (v_hat ** 0.5 + eps)
    return [x, m, v]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.900000002, 0.04999999999999999, 0.0002500000000000002] },
      { input: [1.0, 0.1, 0.01, 0.5, 5, 0.01, 0.9, 0.999, 1e-8], expected: [0.9976134845480366, 0.14, 0.01024] },
      { input: [-2.0, -0.3, 0.4, 1.2, 10, 0.05, 0.8, 0.99, 1e-8], expected: [-2.0, -5.551115123125783e-17, 0.41040000000000004] },
      { input: [0.0, 0.0, 0.0, 0.0, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Bias correction divides by 1 minus beta raised to t; update x using the corrected moments.",
  },
  {
    id: "op-011",
    title: "AdamW Decoupled Weight Decay",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one AdamW update with decoupled weight decay.\n\nCompute the Adam moments and bias-corrected estimates exactly as Adam, then update x_new = x - lr * (m_hat / (sqrt(v_hat) + eps) + weight_decay * x). Return [x_new, m_new, v_new]. Unlike Adam with L2 regularization, the decay is applied to x directly, not to the gradient.",
    starterCode: `def adamw_update(x, m, v, g, t, lr, beta1, beta2, eps, weight_decay):
    # Returns [x_new, m_new, v_new]
    # Your code here
    pass`,
    solution: `def adamw_update(x, m, v, g, t, lr, beta1, beta2, eps, weight_decay):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    x = x - lr * (m_hat / (v_hat ** 0.5 + eps) + weight_decay * x)
    return [x, m, v]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8, 0.01], expected: [0.899000002, 0.04999999999999999, 0.0002500000000000002] },
      { input: [1.0, 0.1, 0.01, 0.5, 5, 0.01, 0.9, 0.999, 1e-8, 0.1], expected: [0.9966134845480366, 0.14, 0.01024] },
      { input: [-2.0, -0.3, 0.4, 1.2, 10, 0.05, 0.8, 0.99, 1e-8, 0.02], expected: [-1.998, -5.551115123125783e-17, 0.41040000000000004] },
    ],
    hint: "Shrink x toward zero by lr * weight_decay * x in addition to the adaptive step.",
  },
  {
    id: "op-012",
    title: "AMSGrad Update",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one AMSGrad update on a scalar parameter.\n\nUpdate m and v as in Adam, then set v_max_new = max(v_max, v). Bias-correct with m_hat = m / (1 - beta1^t) and v_hat = v_max_new / (1 - beta2^t), and update x_new = x - lr * m_hat / (sqrt(v_hat) + eps). Return [x_new, m_new, v_new, v_max_new].",
    starterCode: `def amsgrad_update(x, m, v, v_max, g, t, lr, beta1, beta2, eps):
    # Returns [x_new, m_new, v_new, v_max_new]
    # Your code here
    pass`,
    solution: `def amsgrad_update(x, m, v, v_max, g, t, lr, beta1, beta2, eps):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    if v > v_max:
        v_max = v
    m_hat = m / (1 - beta1 ** t)
    v_hat = v_max / (1 - beta2 ** t)
    x = x - lr * m_hat / (v_hat ** 0.5 + eps)
    return [x, m, v, v_max]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.0, 0.5, 1, 0.1, 0.9, 0.999, 1e-8], expected: [0.900000002, 0.04999999999999999, 0.0002500000000000002, 0.0002500000000000002] },
      { input: [1.0, 0.1, 0.01, 0.02, 0.5, 5, 0.01, 0.9, 0.999, 1e-8], expected: [0.998292348547027, 0.14, 0.01024, 0.02] },
      { input: [-2.0, -0.3, 0.4, 1.0, 1.2, 10, 0.05, 0.8, 0.99, 1e-8], expected: [-2.0, -5.551115123125783e-17, 0.41040000000000004, 1.0] },
    ],
    hint: "The denominator always uses the running maximum of v, never letting it decrease.",
  },
  {
    id: "op-013",
    title: "Lion Sign Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Lion optimizer update on a scalar parameter.\n\nWith the interpolation c = beta1 * m + (1 - beta1) * g, take update = sign(c) and set x_new = x - lr * (update + weight_decay * x). Then update the momentum m_new = beta2 * m + (1 - beta2) * g. Return [x_new, m_new].",
    starterCode: `def lion_update(x, m, g, lr, beta1, beta2, weight_decay):
    # Returns [x_new, m_new]
    # Your code here
    pass`,
    solution: `def lion_update(x, m, g, lr, beta1, beta2, weight_decay):
    c = beta1 * m + (1 - beta1) * g
    if c > 0:
        update = 1.0
    elif c < 0:
        update = -1.0
    else:
        update = 0.0
    x = x - lr * (update + weight_decay * x)
    m = beta2 * m + (1 - beta2) * g
    return [x, m]`,
    testCases: [
      { input: [1.0, 0.0, 0.5, 0.1, 0.9, 0.99, 0.0], expected: [0.9, 0.0050000000000000044] },
      { input: [1.0, 0.1, 0.5, 0.01, 0.9, 0.99, 0.01], expected: [0.9899, 0.10400000000000001] },
      { input: [-2.0, -0.3, -1.2, 0.05, 0.9, 0.99, 0.0], expected: [-1.95, -0.309] },
      { input: [0.5, 0.0, 0.0, 0.1, 0.9, 0.99, 0.0], expected: [0.5, 0.0] },
    ],
    hint: "Only the sign of the update is used; momentum is updated after x.",
  },
  {
    id: "op-014",
    title: "Step-Decay Learning Rate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the learning rate at a given step with step decay:\n\nlr(step) = base_lr * drop^(step // every)\n\nIf every is not positive, return base_lr unchanged.",
    starterCode: `def step_decay_lr(base_lr, drop, every, step):
    # Your code here
    pass`,
    solution: `def step_decay_lr(base_lr, drop, every, step):
    if every <= 0:
        return base_lr
    return base_lr * (drop ** (step // every))`,
    testCases: [
      { input: [0.1, 0.5, 10, 0], expected: 0.1 },
      { input: [0.1, 0.5, 10, 9], expected: 0.1 },
      { input: [0.1, 0.5, 10, 10], expected: 0.05 },
      { input: [0.1, 0.5, 10, 25], expected: 0.025 },
      { input: [0.1, 0.5, 0, 7], expected: 0.1 },
    ],
    hint: "Integer division gives the number of completed decay periods.",
  },
  {
    id: "op-015",
    title: "Cosine Annealing Learning Rate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the cosine annealing learning rate:\n\nlr = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * step / total_steps))\n\nClamp the progress step / total_steps to [0, 1]. If total_steps is not positive, return min_lr.",
    starterCode: `def cosine_annealing_lr(base_lr, min_lr, total_steps, step):
    # Your code here
    pass`,
    solution: `def cosine_annealing_lr(base_lr, min_lr, total_steps, step):
    import math
    if total_steps <= 0:
        return min_lr
    progress = step / total_steps
    if progress > 1:
        progress = 1.0
    if progress < 0:
        progress = 0.0
    return min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))`,
    testCases: [
      { input: [0.1, 0.0, 100, 0], expected: 0.1 },
      { input: [0.1, 0.0, 100, 50], expected: 0.05 },
      { input: [0.1, 0.01, 100, 100], expected: 0.01 },
      { input: [0.1, 0.0, 100, 150], expected: 0.0 },
      { input: [0.2, 0.05, 50, 25], expected: 0.125 },
    ],
    hint: "At step = total_steps the cosine term is -1, giving exactly min_lr.",
  },
  {
    id: "op-016",
    title: "Linear Warmup Learning Rate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the learning rate during linear warmup:\n\nlr = base_lr * min(1, max(0, step / warmup_steps))\n\nIf warmup_steps is not positive, return base_lr immediately.",
    starterCode: `def linear_warmup_lr(base_lr, warmup_steps, step):
    # Your code here
    pass`,
    solution: `def linear_warmup_lr(base_lr, warmup_steps, step):
    if warmup_steps <= 0:
        return base_lr
    factor = step / warmup_steps
    if factor > 1:
        factor = 1.0
    if factor < 0:
        factor = 0.0
    return base_lr * factor`,
    testCases: [
      { input: [0.1, 10, 0], expected: 0.0 },
      { input: [0.1, 10, 5], expected: 0.05 },
      { input: [0.1, 10, 20], expected: 0.1 },
      { input: [0.1, 0, 7], expected: 0.1 },
      { input: [0.2, 4, -2], expected: 0.0 },
    ],
    hint: "The factor saturates at 1 after warmup_steps.",
  },
  {
    id: "op-017",
    title: "One-Cycle Learning Rate",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute a one-cycle learning rate with linear warmup followed by cosine decay.\n\nFor 0 <= step < warmup_steps return min_lr + (base_lr - min_lr) * step / warmup_steps. For later steps let progress = (step - warmup_steps) / (total_steps - warmup_steps) and return min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * progress)). If total_steps is not positive or step >= total_steps return min_lr. When warmup_steps is not positive, decay starts from step 0.",
    starterCode: `def one_cycle_lr(base_lr, min_lr, warmup_steps, total_steps, step):
    # Your code here
    pass`,
    solution: `def one_cycle_lr(base_lr, min_lr, warmup_steps, total_steps, step):
    import math
    if total_steps <= 0 or step >= total_steps:
        return min_lr
    if step < 0:
        step = 0
    if warmup_steps > 0 and step < warmup_steps:
        return min_lr + (base_lr - min_lr) * (step / warmup_steps)
    if warmup_steps > 0:
        progress = (step - warmup_steps) / (total_steps - warmup_steps)
    else:
        progress = step / total_steps
    if progress > 1:
        progress = 1.0
    if progress < 0:
        progress = 0.0
    return min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))`,
    testCases: [
      { input: [0.1, 0.001, 10, 100, 0], expected: 0.001 },
      { input: [0.1, 0.001, 10, 100, 10], expected: 0.1 },
      { input: [0.1, 0.001, 10, 100, 55], expected: 0.0505 },
      { input: [0.1, 0.001, 10, 100, 100], expected: 0.001 },
      { input: [0.1, 0.001, 10, 100, 20], expected: 0.09701478472890247 },
    ],
    hint: "Warmup ends at base_lr, then the cosine decay runs over the remaining steps.",
  },
  {
    id: "op-018",
    title: "Inverse-Square-Root Learning Rate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the inverse-square-root schedule used by Transformers:\n\nlr = base_lr * min(step^-0.5, step * warmup_steps^-1.5)\n\nReturn 0.0 when step <= 0, and skip the warmup term when warmup_steps is not positive.",
    starterCode: `def inverse_sqrt_lr(base_lr, warmup_steps, step):
    # Your code here
    pass`,
    solution: `def inverse_sqrt_lr(base_lr, warmup_steps, step):
    if step <= 0:
        return 0.0
    decay = step ** -0.5
    if warmup_steps <= 0:
        return base_lr * decay
    warm = step * (warmup_steps ** -1.5)
    if warm < decay:
        return base_lr * warm
    return base_lr * decay`,
    testCases: [
      { input: [0.1, 10, 0], expected: 0.0 },
      { input: [0.1, 10, 5], expected: 0.015811388300841896 },
      { input: [0.1, 10, 100], expected: 0.010000000000000002 },
      { input: [0.1, 0, 4], expected: 0.05 },
    ],
    hint: "The two terms swap dominance exactly at step = warmup_steps.",
  },
  {
    id: "op-019",
    title: "Polynomial Decay Learning Rate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute a polynomial learning-rate decay toward end_lr:\n\nlr = (base_lr - end_lr) * (1 - progress)^power + end_lr\n\nwhere progress = step / total_steps clamped to [0, 1]. If total_steps is not positive, return end_lr.",
    starterCode: `def polynomial_decay_lr(base_lr, end_lr, total_steps, power, step):
    # Your code here
    pass`,
    solution: `def polynomial_decay_lr(base_lr, end_lr, total_steps, power, step):
    if total_steps <= 0:
        return end_lr
    progress = step / total_steps
    if progress > 1:
        progress = 1.0
    if progress < 0:
        progress = 0.0
    return (base_lr - end_lr) * ((1 - progress) ** power) + end_lr`,
    testCases: [
      { input: [0.1, 0.0, 100, 1.0, 0], expected: 0.1 },
      { input: [0.1, 0.0, 100, 1.0, 50], expected: 0.05 },
      { input: [0.1, 0.0, 100, 2.0, 50], expected: 0.025 },
      { input: [0.1, 0.01, 100, 0.5, 100], expected: 0.01 },
      { input: [0.1, 0.0, 100, 1.0, 150], expected: 0.0 },
    ],
    hint: "power = 1 gives linear decay, power = 2 quadratic decay.",
  },
  {
    id: "op-020",
    title: "Reduce On Plateau Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Simulate a ReduceLROnPlateau scheduler over a sequence of losses.\n\nStart from best_loss and wait. For each loss: if loss < best_loss, set best_loss = loss and wait = 0; otherwise increment wait. Whenever wait > patience, multiply current_lr by factor (never below min_lr), set reduced = True, and reset wait = 0. Return [current_lr, best_loss, wait, reduced].",
    starterCode: `def reduce_on_plateau(losses, factor, patience, min_lr, current_lr, best_loss, wait):
    # Returns [current_lr, best_loss, wait, reduced]
    # Your code here
    pass`,
    solution: `def reduce_on_plateau(losses, factor, patience, min_lr, current_lr, best_loss, wait):
    reduced = False
    for loss in losses:
        if loss < best_loss:
            best_loss = loss
            wait = 0
        else:
            wait = wait + 1
        if wait > patience:
            current_lr = current_lr * factor
            if current_lr < min_lr:
                current_lr = min_lr
            reduced = True
            wait = 0
    return [current_lr, best_loss, wait, reduced]`,
    testCases: [
      { input: [[1.0, 0.9, 0.8, 0.85, 0.86, 0.87], 0.5, 2, 0.001, 0.1, 1.0, 0], expected: [0.05, 0.8, 0, true] },
      { input: [[1.0, 0.99, 0.98], 0.5, 5, 0.001, 0.1, 1.0, 0], expected: [0.1, 0.98, 0, false] },
      { input: [[5.0, 4.0, 3.0], 0.5, 1, 0.001, 0.1, 5.0, 0], expected: [0.1, 3.0, 0, false] },
      { input: [[2.0, 2.1, 2.2, 2.3], 0.5, 1, 0.01, 0.1, 2.0, 0], expected: [0.025, 2.0, 0, true] },
    ],
    hint: "A drop happens only when wait becomes strictly greater than patience.",
  },
  {
    id: "op-021",
    title: "Gradient Clipping By Value",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Clip every gradient component to the interval [-clip_value, clip_value].\n\nReturn a new list where each component g becomes clip_value if g is too large, -clip_value if it is too small, and otherwise stays unchanged. An empty input returns [].",
    starterCode: `def clip_by_value(grads, clip_value):
    # Your code here
    pass`,
    solution: `def clip_by_value(grads, clip_value):
    out = []
    for g in grads:
        if g > clip_value:
            out.append(clip_value)
        elif g < -clip_value:
            out.append(-clip_value)
        else:
            out.append(g)
    return out`,
    testCases: [
      { input: [[1.5, -0.5, 0.0, 5.0], 1.0], expected: [1.0, -0.5, 0.0, 1.0] },
      { input: [[0.4, -0.6], 1.0], expected: [0.4, -0.6] },
      { input: [[3.0, -4.0], 2.5], expected: [2.5, -2.5] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Clamp each component independently; no scaling is involved.",
  },
  {
    id: "op-022",
    title: "Gradient Clipping By Norm",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Clip a gradient vector by its global L2 norm.\n\nCompute norm = sqrt(sum(g * g)). If norm > max_norm and norm > 0, rescale every component by max_norm / norm. Otherwise return the original values unchanged. This preserves the gradient direction.",
    starterCode: `def clip_by_norm(grads, max_norm):
    # Your code here
    pass`,
    solution: `def clip_by_norm(grads, max_norm):
    total = 0.0
    for g in grads:
        total = total + g * g
    norm = total ** 0.5
    if norm > max_norm and norm > 0:
        scale = max_norm / norm
        return [g * scale for g in grads]
    return list(grads)`,
    testCases: [
      { input: [[3.0, 4.0], 2.5], expected: [1.5, 2.0] },
      { input: [[0.1, 0.2], 5.0], expected: [0.1, 0.2] },
      { input: [[0.0, 0.0], 1.0], expected: [0.0, 0.0] },
      { input: [[-3.0, 4.0], 10.0], expected: [-3.0, 4.0] },
      { input: [[1.0, 0.0], 1.0], expected: [1.0, 0.0] },
    ],
    hint: "If the norm is already within max_norm, return the vector untouched.",
  },
  {
    id: "op-023",
    title: "Gradient Centralization",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply gradient centralization to a gradient vector.\n\nCompute the mean of all components and subtract it from each component, so the returned vector sums to zero. An empty input returns [].",
    starterCode: `def gradient_centralization(grads):
    # Your code here
    pass`,
    solution: `def gradient_centralization(grads):
    if not grads:
        return []
    mean = sum(grads) / len(grads)
    return [g - mean for g in grads]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [-1.0, 0.0, 1.0] },
      { input: [[-1.0, 0.0, 1.0, 2.0]], expected: [-1.5, -0.5, 0.5, 1.5] },
      { input: [[]], expected: [] },
      { input: [[4.0, 4.0, 4.0]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The result has zero mean by construction.",
  },
  {
    id: "op-024",
    title: "L2 Weight Decay Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Perform one gradient step with L2 weight decay on a scalar weight.\n\nThe update is w_new = w - lr * (grad + weight_decay * w). Return the new weight.",
    starterCode: `def l2_weight_decay_step(w, grad, lr, weight_decay):
    # Your code here
    pass`,
    solution: `def l2_weight_decay_step(w, grad, lr, weight_decay):
    return w - lr * (grad + weight_decay * w)`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 0.01], expected: 0.949 },
      { input: [0.0, -2.0, 0.01, 0.1], expected: 0.02 },
      { input: [2.0, 0.0, 0.5, 0.2], expected: 1.8 },
    ],
    hint: "The decay term weight_decay * w is added to the gradient before the step.",
  },
  {
    id: "op-025",
    title: "L1 Proximal Soft-Threshold",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Apply the L1 proximal operator (soft thresholding) after a gradient step.\n\nFirst compute z = w - lr * grad, then shrink it by the threshold t = lr * lam: return z - t if z > t, z + t if z < -t, and 0.0 otherwise. This is the proximal step for L1-regularized objectives.",
    starterCode: `def l1_soft_threshold(w, grad, lr, lam):
    # Your code here
    pass`,
    solution: `def l1_soft_threshold(w, grad, lr, lam):
    z = w - lr * grad
    t = lr * lam
    if z > t:
        return z - t
    if z < -t:
        return z + t
    return 0.0`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 0.1], expected: 0.94 },
      { input: [0.05, 0.0, 0.1, 1.0], expected: 0.0 },
      { input: [-2.0, -0.5, 0.1, 0.2], expected: -1.93 },
      { input: [0.0, 0.0, 0.1, 0.5], expected: 0.0 },
    ],
    hint: "Values inside the threshold window collapse to exactly zero.",
  },
  {
    id: "op-026",
    title: "Early Stopping Patience Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Scan a list of validation losses with early stopping logic.\n\nStart with best = losses[0] and wait = 0. For each later loss, if loss < best - min_delta treat it as an improvement and reset wait to 0; otherwise increment wait. Stop at the first non-improvement that makes wait >= patience. Return [stop, best, wait], where stop is a boolean; an empty list returns [False, 0.0, 0].",
    starterCode: `def early_stopping_patience(losses, patience, min_delta):
    # Returns [stop, best, wait]
    # Your code here
    pass`,
    solution: `def early_stopping_patience(losses, patience, min_delta):
    if not losses:
        return [False, 0.0, 0]
    best = losses[0]
    wait = 0
    stop = False
    for loss in losses[1:]:
        if loss < best - min_delta:
            best = loss
            wait = 0
        else:
            wait = wait + 1
            if wait >= patience:
                stop = True
                break
    return [stop, best, wait]`,
    testCases: [
      { input: [[1.0, 0.9, 0.905, 0.91], 2, 0.0], expected: [true, 0.9, 2] },
      { input: [[1.0, 0.8, 0.7, 0.6], 3, 0.0], expected: [false, 0.6, 0] },
      { input: [[1.0, 1.1], 1, 0.05], expected: [true, 1.0, 1] },
      { input: [[], 3, 0.0], expected: [false, 0.0, 0] },
      { input: [[2.0, 1.97], 0, 0.01], expected: [false, 1.97, 0] },
    ],
    hint: "An improvement must beat the best by strictly more than min_delta.",
  },
  {
    id: "op-027",
    title: "Polyak Averaging Combine",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Fold a new parameter value into a running Polyak average.\n\nGiven the current average, the new value, and count (the number of values already averaged), return (current_avg * count + param) / (count + 1).",
    starterCode: `def polyak_average(current_avg, param, count):
    # Your code here
    pass`,
    solution: `def polyak_average(current_avg, param, count):
    return (current_avg * count + param) / (count + 1)`,
    testCases: [
      { input: [0.0, 1.0, 0], expected: 1.0 },
      { input: [0.5, 1.0, 1], expected: 0.75 },
      { input: [2.0, 0.0, 3], expected: 1.5 },
      { input: [1.0, 2.0, 9], expected: 1.1 },
    ],
    hint: "This is just the incremental mean formula.",
  },
  {
    id: "op-028",
    title: "EMA Weights Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Update exponential moving average weights elementwise.\n\nFor each coordinate return decay * ema_old + (1 - decay) * params. The two lists must be traversed in parallel.",
    starterCode: `def ema_update(ema, params, decay):
    # Your code here
    pass`,
    solution: `def ema_update(ema, params, decay):
    return [decay * e + (1 - decay) * p for e, p in zip(ema, params)]`,
    testCases: [
      { input: [[1.0, 1.0], [2.0, 0.0], 0.9], expected: [1.1, 0.9] },
      { input: [[0.0, 0.0, 0.0], [1.0, -1.0, 2.0], 0.5], expected: [0.5, -0.5, 1.0] },
      { input: [[5.0], [1.0], 0.0], expected: [1.0] },
    ],
    hint: "Higher decay keeps more of the old EMA.",
  },
  {
    id: "op-029",
    title: "SWA Average Of Iterates",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Average a list of parameter vectors from stochastic weight averaging.\n\nEach iterate is a list of coordinates; return a list whose i-th entry is the arithmetic mean of coordinate i across all iterates. An empty list of iterates returns [].",
    starterCode: `def swa_average(iterates):
    # Your code here
    pass`,
    solution: `def swa_average(iterates):
    if not iterates:
        return []
    k = len(iterates)
    n = len(iterates[0])
    out = []
    for i in range(n):
        total = 0.0
        for it in iterates:
            total = total + it[i]
        out.append(total / k)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [3.0, 4.0] },
      { input: [[[0.0, 0.0], [2.0, 4.0]]], expected: [1.0, 2.0] },
      { input: [[]], expected: [] },
      { input: [[[1.0], [2.0], [3.0], [4.0]]], expected: [2.5] },
    ],
    hint: "Average each coordinate independently over all iterates.",
  },
  {
    id: "op-030",
    title: "Lookahead Interpolation",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Lookahead interpolation step.\n\nGiven fast weights, slow weights, and alpha, compute slow_new = slow + alpha * (fast - slow) elementwise, and set fast_new = slow_new. Return [slow_new, fast_new] as two lists.",
    starterCode: `def lookahead_interpolate(fast, slow, alpha):
    # Returns [slow_new, fast_new]
    # Your code here
    pass`,
    solution: `def lookahead_interpolate(fast, slow, alpha):
    slow_new = [s + alpha * (f - s) for f, s in zip(fast, slow)]
    fast_new = list(slow_new)
    return [slow_new, fast_new]`,
    testCases: [
      { input: [[2.0, 4.0], [1.0, 1.0], 0.5], expected: [[1.5, 2.5], [1.5, 2.5]] },
      { input: [[0.0, 0.0], [2.0, -2.0], 0.25], expected: [[1.5, -1.5], [1.5, -1.5]] },
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0], 0.9], expected: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]] },
    ],
    hint: "Fast weights snap back to the interpolated slow weights after the update.",
  },
  {
    id: "op-031",
    title: "SAM Perturbation And Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one Sharpness-Aware Minimization (SAM) step.\n\nNormalize the gradient: norm = sqrt(sum(g * g)), then perturb w_adv = w + rho * grad / (norm + eps) elementwise. Update the weights with the gradient evaluated at the perturbed point: w_new = w - lr * grad_adv. Return [w_adv, w_new] as two lists.",
    starterCode: `def sam_update(w, grad, grad_adv, lr, rho, eps):
    # Returns [w_adv, w_new]
    # Your code here
    pass`,
    solution: `def sam_update(w, grad, grad_adv, lr, rho, eps):
    norm_sq = 0.0
    for g in grad:
        norm_sq = norm_sq + g * g
    norm = norm_sq ** 0.5
    w_adv = [w[i] + rho * grad[i] / (norm + eps) for i in range(len(w))]
    w_new = [w[i] - lr * grad_adv[i] for i in range(len(w))]
    return [w_adv, w_new]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, -0.5], [0.1, 0.1], 0.1, 0.05, 1e-8], expected: [[1.0353553385593275, 1.9646446614406725], [0.99, 1.99]] },
      { input: [[0.0, 0.0], [3.0, 4.0], [-1.0, -1.0], 0.01, 0.1, 1e-8], expected: [[0.05999999988000001, 0.07999999984], [0.01, 0.01]] },
      { input: [[-1.0, 0.5, 2.0], [1.0, 2.0, -2.0], [0.0, 0.0, 0.0], 0.2, 0.01, 1e-8], expected: [[-0.9966666666777778, 0.5066666666444445, 1.9933333333555556], [-1.0, 0.5, 2.0]] },
    ],
    hint: "The perturbation uses a unit vector; the final step uses grad_adv, not grad.",
  },
  {
    id: "op-032",
    title: "Gradient Noise Injection",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Add reproducible Gaussian noise to a gradient vector.\n\nCall random.seed(seed), then add an independent random.gauss(0.0, std) draw to every component. Return the noisy gradient as a list. An empty input returns [].",
    starterCode: `def add_gradient_noise(grads, std, seed):
    # Your code here
    pass`,
    solution: `def add_gradient_noise(grads, std, seed):
    import random
    random.seed(seed)
    return [g + random.gauss(0.0, std) for g in grads]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.1, 0], expected: [1.0941715404680665, 1.860342189529885, 2.932028555192158] },
      { input: [[0.5, -0.5], 0.2, 7], expected: [0.4488239423104799, -0.3977136974966972] },
      { input: [[0.0], 1.0, 42], expected: [-0.14409032957792836] },
      { input: [[], 0.1, 3], expected: [] },
    ],
    hint: "Reseeding with the same seed reproduces the exact same noise draws.",
  },
  {
    id: "op-033",
    title: "Relative Parameter Change",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Measure the relative change between two parameter vectors.\n\nReturn ||new - old||_2 / (||old||_2 + eps), where both norms are Euclidean over the components in common. This is a scale-free progress measure often used in convergence checks.",
    starterCode: `def relative_param_change(old, new, eps):
    # Your code here
    pass`,
    solution: `def relative_param_change(old, new, eps):
    diff = 0.0
    base = 0.0
    for a, b in zip(old, new):
        diff = diff + (b - a) ** 2
        base = base + a * a
    return (diff ** 0.5) / (base ** 0.5 + eps)`,
    testCases: [
      { input: [[1.0, 2.0], [1.1, 2.2], 1e-8], expected: 0.09999999955278649 },
      { input: [[0.0, 0.0], [1.0, 1.0], 0.5], expected: 2.8284271247461903 },
      { input: [[3.0, -4.0], [3.0, -4.0], 1e-8], expected: 0.0 },
      { input: [[0.5, 0.5], [0.0, 0.0], 0.01], expected: 0.9860550753913473 },
    ],
    hint: "eps guards against division by zero when old is the zero vector.",
  },
  {
    id: "op-034",
    title: "Loss Moving Average",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute a trailing moving average of a loss sequence.\n\nFor each index i, average losses[max(0, i - window + 1) .. i], so early entries use fewer values. Return the list of averages; an empty input returns [].",
    starterCode: `def loss_moving_average(losses, window):
    # Your code here
    pass`,
    solution: `def loss_moving_average(losses, window):
    out = []
    for i in range(len(losses)):
        start = i - window + 1
        if start < 0:
            start = 0
        total = 0.0
        for j in range(start, i + 1):
            total = total + losses[j]
        out.append(total / (i - start + 1))
    return out`,
    testCases: [
      { input: [[1.0, 3.0, 5.0, 7.0], 2], expected: [1.0, 2.0, 4.0, 6.0] },
      { input: [[2.0, 4.0], 3], expected: [2.0, 3.0] },
      { input: [[], 2], expected: [] },
      { input: [[5.0], 2], expected: [5.0] },
    ],
    hint: "At the start of the sequence the window is smaller than requested.",
  },
  {
    id: "op-035",
    title: "Divergence Detector",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Detect divergence in a loss sequence.\n\nReturn the first index i > 0 where losses[i] > factor * losses[i - 1], or -1 if the losses never jump by more than the factor. A list with fewer than two entries returns -1.",
    starterCode: `def divergence_detector(losses, factor):
    # Your code here
    pass`,
    solution: `def divergence_detector(losses, factor):
    for i in range(1, len(losses)):
        if losses[i] > losses[i - 1] * factor:
            return i
    return -1`,
    testCases: [
      { input: [[1.0, 1.1, 1.2], 2.0], expected: -1 },
      { input: [[1.0, 3.0, 3.1], 2.0], expected: 1 },
      { input: [[0.5, 0.5, 0.5], 1.0], expected: -1 },
      { input: [[], 2.0], expected: -1 },
      { input: [[1.0, 2.0, 4.0, 8.0], 1.5], expected: 1 },
    ],
    hint: "Compare each loss against factor times the immediately preceding loss.",
  },
  {
    id: "op-036",
    title: "LR Finder Best Rate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Choose the best learning rate from an exponential LR-finder probe.\n\nThe probed rates are start_lr * (end_lr / start_lr)^(i / (num_steps - 1)) for i = 0 .. num_steps - 1. Return the probed rate at the index of the smallest loss, with the first minimum winning ties. If num_steps <= 1, return start_lr.",
    starterCode: `def lr_finder_best(start_lr, end_lr, num_steps, losses):
    # Your code here
    pass`,
    solution: `def lr_finder_best(start_lr, end_lr, num_steps, losses):
    if num_steps <= 1:
        return start_lr
    ratio = (end_lr / start_lr) ** (1.0 / (num_steps - 1))
    best_i = 0
    best_loss = losses[0]
    for i in range(1, num_steps):
        if losses[i] < best_loss:
            best_loss = losses[i]
            best_i = i
    return start_lr * (ratio ** best_i)`,
    testCases: [
      { input: [0.001, 1.0, 5, [2.0, 1.5, 0.8, 1.2, 3.0]], expected: 0.0316227766016838 },
      { input: [0.01, 0.1, 3, [1.0, 0.5, 0.6]], expected: 0.0316227766016838 },
      { input: [0.1, 0.1, 4, [1.0, 1.0, 1.0, 1.0]], expected: 0.1 },
      { input: [0.001, 1.0, 1, [5.0]], expected: 0.001 },
    ],
    hint: "The probe grid is geometric, so index i maps to start_lr * ratio^i.",
  },
  {
    id: "op-037",
    title: "Momentum Warmup Factor",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Linearly warm up the momentum coefficient.\n\nReturn initial_momentum + (target_momentum - initial_momentum) * min(1, max(0, step / warmup_steps)). If warmup_steps is not positive, return target_momentum immediately.",
    starterCode: `def momentum_warmup(step, warmup_steps, target_momentum, initial_momentum):
    # Your code here
    pass`,
    solution: `def momentum_warmup(step, warmup_steps, target_momentum, initial_momentum):
    if warmup_steps <= 0:
        return target_momentum
    factor = step / warmup_steps
    if factor > 1:
        factor = 1.0
    if factor < 0:
        factor = 0.0
    return initial_momentum + (target_momentum - initial_momentum) * factor`,
    testCases: [
      { input: [0, 10, 0.9, 0.1], expected: 0.1 },
      { input: [5, 10, 0.9, 0.1], expected: 0.5 },
      { input: [10, 10, 0.9, 0.1], expected: 0.9 },
      { input: [20, 10, 0.9, 0.1], expected: 0.9 },
      { input: [3, 0, 0.9, 0.1], expected: 0.9 },
    ],
    hint: "Momentum ramps from initial_momentum to target_momentum over the warmup window.",
  },
  {
    id: "op-038",
    title: "Bias Correction First Moment",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Bias-correct the first moment estimate used by Adam:\n\nm_hat = m / (1 - beta1^t)\n\nwhere t is the 1-indexed step number. Return the corrected value.",
    starterCode: `def bias_correct_first(m, beta1, t):
    # Your code here
    pass`,
    solution: `def bias_correct_first(m, beta1, t):
    return m / (1 - beta1 ** t)`,
    testCases: [
      { input: [0.5, 0.9, 1], expected: 5.000000000000001 },
      { input: [0.5, 0.9, 10], expected: 0.7676699663938148 },
      { input: [0.0, 0.9, 5], expected: 0.0 },
      { input: [2.0, 0.5, 3], expected: 2.2857142857142856 },
    ],
    hint: "At t = 1 the divisor is 1 - beta1, which amplifies the raw moment.",
  },
  {
    id: "op-039",
    title: "Hessian-Vector Product Finite Difference",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Approximate a Hessian-vector product by central finite differences for f(x1, x2) = x1^2 + 3*x1*x2 + 2*x2^2.\n\nThe analytic gradient is grad(x) = [2*x1 + 3*x2, 3*x1 + 4*x2]. Return (grad(x + h*v) - grad(x - h*v)) / (2*h) as a two-element list, where v is the direction vector and h the difference step.",
    starterCode: `def hvp_finite_diff(x, v, h):
    # Your code here
    pass`,
    solution: `def hvp_finite_diff(x, v, h):
    xp0 = x[0] + h * v[0]
    xp1 = x[1] + h * v[1]
    xm0 = x[0] - h * v[0]
    xm1 = x[1] - h * v[1]
    gp0 = 2 * xp0 + 3 * xp1
    gp1 = 3 * xp0 + 4 * xp1
    gm0 = 2 * xm0 + 3 * xm1
    gm1 = 3 * xm0 + 4 * xm1
    return [(gp0 - gm0) / (2 * h), (gp1 - gm1) / (2 * h)]`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, -1.0], 1e-4], expected: [2.9999999999930083, 4.999999999988347] },
      { input: [[0.0, 0.0], [1.0, 0.0], 1e-4], expected: [2.0, 3.0] },
      { input: [[-2.0, 0.5], [0.0, 1.0], 1e-5], expected: [2.9999999999752442, 4.000000000004] },
      { input: [[1.0, 1.0], [1.0, 1.0], 1e-3], expected: [4.999999999999449, 6.999999999999673] },
    ],
    hint: "Perturb x along v in both directions and difference the gradients.",
  },
  {
    id: "op-040",
    title: "Newton Step 1D With Finite Differences",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one Newton step on f(x) = x^4 - 3*x^2 + 2*x using central finite differences.\n\nWith difference step h, estimate g = (f(x+h) - f(x-h)) / (2h) and curvature = (f(x+h) - 2*f(x) + f(x-h)) / h^2, then return x - g / curvature. Use the exact polynomial for the evaluations.",
    starterCode: `def newton_step_1d(x, h):
    # Your code here
    pass`,
    solution: `def newton_step_1d(x, h):
    fp = (x + h) ** 4 - 3 * (x + h) ** 2 + 2 * (x + h)
    fm = (x - h) ** 4 - 3 * (x - h) ** 2 + 2 * (x - h)
    f0 = x ** 4 - 3 * x ** 2 + 2 * x
    g = (fp - fm) / (2 * h)
    curv = (fp - 2 * f0 + fm) / (h * h)
    return x - g / curv`,
    testCases: [
      { input: [2.0, 1e-5], expected: 1.4761901871974508 },
      { input: [0.5, 1e-5], expected: 0.3333334088697898 },
      { input: [-1.5, 1e-5], expected: -1.3809523404207176 },
      { input: [0.0, 1e-5], expected: 0.33333333334389625 },
    ],
    hint: "The second difference divided by h squared estimates the curvature.",
  },
  {
    id: "op-041",
    title: "BFGS One Update (2x2)",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Apply one BFGS update to an inverse Hessian approximation.\n\nGiven H, the parameter change s, and the gradient change y, compute rho = 1 / (y dot s) and H_new = H - rho * (s y^T H + H y s^T) + rho^2 * (y^T H y) s s^T + rho * s s^T. Return the new matrix as a list of rows; if y dot s is zero, return H unchanged.",
    starterCode: `def bfgs_update(H, s, y):
    # Your code here
    pass`,
    solution: `def bfgs_update(H, s, y):
    n = len(s)
    ys = 0.0
    for i in range(n):
        ys = ys + y[i] * s[i]
    if ys == 0.0:
        return [list(row) for row in H]
    rho = 1.0 / ys
    Hy = []
    for i in range(n):
        total = 0.0
        for j in range(n):
            total = total + H[i][j] * y[j]
        Hy.append(total)
    yHy = 0.0
    for i in range(n):
        yHy = yHy + y[i] * Hy[i]
    out = []
    for i in range(n):
        row = []
        for j in range(n):
            val = H[i][j] - rho * (s[i] * Hy[j] + Hy[i] * s[j]) + rho * rho * yHy * s[i] * s[j] + rho * s[i] * s[j]
            row.append(val)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [1.0, 1.0], [2.0, 3.0]], expected: [[0.9200000000000002, -0.27999999999999986], [-0.27999999999999986, 0.52]] },
      { input: [[[2.0, 0.5], [0.5, 1.0]], [1.0, -2.0], [0.5, 1.5]], expected: [[3.5600000000000005, -0.5200000000000002], [-0.5200000000000002, -1.1600000000000001]] },
      { input: [[[1.5, 0.2], [0.2, 0.8]], [2.0, 1.0], [-1.0, 4.0]], expected: [[17.6, 4.9], [4.9, 1.4749999999999996]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [1.0, 1.0], [1.0, -1.0]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Compute Hy and yHy first, then combine the four matrix terms.",
  },
  {
    id: "op-042",
    title: "Projected Gradient Box Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Run projected gradient descent on the box-constrained quadratic f(x) = 0.5 * x^T A x + c^T x with A = [[3, 1], [1, 2]] and c = [-1, -2].\n\nStarting from x, repeat n_iters times: compute grad = A x + c, take the step x = x - lr * grad, then clip each coordinate into [lo, hi]. Return the final two-element list.",
    starterCode: `def projected_gradient_box(x, lr, n_iters, lo, hi):
    # Your code here
    pass`,
    solution: `def projected_gradient_box(x, lr, n_iters, lo, hi):
    x0 = float(x[0])
    x1 = float(x[1])
    for _ in range(n_iters):
        g0 = 3 * x0 + x1 - 1
        g1 = x0 + 2 * x1 - 2
        x0 = x0 - lr * g0
        x1 = x1 - lr * g1
        if x0 < lo:
            x0 = lo
        if x0 > hi:
            x0 = hi
        if x1 < lo:
            x1 = lo
        if x1 > hi:
            x1 = hi
    return [x0, x1]`,
    testCases: [
      { input: [[0.0, 0.0], 0.1, 100, -1.0, 1.0], expected: [1.553585843712981e-07, 0.9999997486245301] },
      { input: [[2.0, 2.0], 0.1, 50, -1.0, 2.0], expected: [6.22249483433113e-05, 0.9998993186679868] },
      { input: [[-3.0, -3.0], 0.05, 200, -0.5, 1.0], expected: [3.4536742144027475e-07, 0.9999994411837736] },
      { input: [[0.5, 0.5], 0.2, 0, -1.0, 1.0], expected: [0.5, 0.5] },
    ],
    hint: "The unconstrained minimum is (0, 1); the box only matters when it excludes that point.",
  },
  {
    id: "op-043",
    title: "Subgradient Step For Absolute Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimize f(x) = |x| with the subgradient method.\n\nFor n_iters iterations use g = 1 if x > 0, g = -1 if x < 0, and g = 0 when x is exactly 0, then update x = x - lr * g. Return the final value of x.",
    starterCode: `def subgradient_step_abs(x, lr, n_iters):
    # Minimize f(x) = |x|
    # Your code here
    pass`,
    solution: `def subgradient_step_abs(x, lr, n_iters):
    for _ in range(n_iters):
        if x > 0:
            g = 1.0
        elif x < 0:
            g = -1.0
        else:
            g = 0.0
        x = x - lr * g
    return x`,
    testCases: [
      { input: [3.0, 0.5, 10], expected: 0.0 },
      { input: [-2.5, 0.5, 4], expected: -0.5 },
      { input: [0.2, 0.1, 3], expected: 0.0 },
      { input: [0.0, 0.1, 5], expected: 0.0 },
    ],
    hint: "Once x reaches 0 the chosen subgradient is 0, so it stays there.",
  },
  {
    id: "op-044",
    title: "Coordinate Descent One Coordinate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one exact coordinate-descent update on f(x) = 0.5 * x^T A x - b^T x.\n\nSet coordinate j to the exact minimizer (b[j] - sum over k != j of A[j][k] * x[k]) / A[j][j], leaving all other coordinates unchanged. If A[j][j] is zero, leave x[j] unchanged. Return the updated list.",
    starterCode: `def coordinate_descent_step(x, A, b, j):
    # Your code here
    pass`,
    solution: `def coordinate_descent_step(x, A, b, j):
    n = len(x)
    total = b[j]
    for k in range(n):
        if k != j:
            total = total - A[j][k] * x[k]
    out = list(x)
    if A[j][j] != 0:
        out[j] = total / A[j][j]
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [[4.0, 1.0], [1.0, 3.0]], [1.0, 2.0], 0], expected: [0.25, 0.0] },
      { input: [[0.25, 0.0], [[4.0, 1.0], [1.0, 3.0]], [1.0, 2.0], 1], expected: [0.25, 0.5833333333333334] },
      { input: [[1.0, -1.0, 2.0], [[2.0, 0.0, 1.0], [0.0, 3.0, -1.0], [1.0, -1.0, 4.0]], [3.0, 0.0, 1.0], 2], expected: [1.0, -1.0, -0.25] },
      { input: [[1.0, 2.0], [[0.0, 1.0], [1.0, 2.0]], [1.0, 1.0], 0], expected: [1.0, 2.0] },
    ],
    hint: "The exact minimizer along one coordinate comes from setting the partial derivative to zero.",
  },
  {
    id: "op-045",
    title: "Simulated Annealing Accept Test",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Decide whether simulated annealing accepts a move with energy increase delta.\n\nMoves with delta <= 0 are always accepted. Otherwise accept with probability exp(-delta / temperature) after random.seed(seed) followed by random.random(). Return a boolean. If temperature is not positive, reject any positive delta.",
    starterCode: `def sa_accept(delta, temperature, seed):
    # Your code here
    pass`,
    solution: `def sa_accept(delta, temperature, seed):
    import math
    import random
    if delta <= 0:
        return True
    if temperature <= 0:
        return False
    random.seed(seed)
    return random.random() < math.exp(-delta / temperature)`,
    testCases: [
      { input: [1.0, 1.0, 0], expected: false },
      { input: [0.5, 1.0, 42], expected: false },
      { input: [-0.5, 1.0, 7], expected: true },
      { input: [2.0, 0.0, 3], expected: false },
      { input: [0.0, 1.0, 5], expected: true },
    ],
    hint: "Higher temperature makes uphill moves easier to accept.",
  },
  {
    id: "op-046",
    title: "Epsilon-Greedy Pick",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Pick an arm with epsilon-greedy exploration.\n\nAfter random.seed(seed), draw random.random(): if it is below epsilon return random.randrange(len(q_values)); otherwise return the index of the largest q value, with the lowest index winning ties. Exploration and exploitation draws come from the same seeded stream.",
    starterCode: `def epsilon_greedy_pick(q_values, epsilon, seed):
    # Your code here
    pass`,
    solution: `def epsilon_greedy_pick(q_values, epsilon, seed):
    import random
    random.seed(seed)
    if random.random() < epsilon:
        return random.randrange(len(q_values))
    best = 0
    for i in range(1, len(q_values)):
        if q_values[i] > q_values[best]:
            best = i
    return best`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.0, 1], expected: 2 },
      { input: [[1.0, 2.0, 3.0], 1.0, 1], expected: 0 },
      { input: [[0.5, 0.5, 0.1], 0.2, 42], expected: 0 },
      { input: [[3.0, 1.0], 0.5, 0], expected: 0 },
    ],
    hint: "epsilon = 0 is pure exploitation; epsilon = 1 is pure exploration.",
  },
  {
    id: "op-047",
    title: "Softmax Exploration Probabilities",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute softmax exploration probabilities over action values.\n\nReturn exp((q - max(q)) / temperature) normalized to sum to 1, subtracting the max for numerical stability. If temperature is not positive, return a one-hot list at the argmax with the lowest index winning ties. An empty input returns [].",
    starterCode: `def softmax_exploration(q_values, temperature):
    # Your code here
    pass`,
    solution: `def softmax_exploration(q_values, temperature):
    import math
    if not q_values:
        return []
    if temperature <= 0:
        best = 0
        for i in range(1, len(q_values)):
            if q_values[i] > q_values[best]:
                best = i
        return [1.0 if i == best else 0.0 for i in range(len(q_values))]
    m = max(q_values)
    exps = [math.exp((q - m) / temperature) for q in q_values]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[1.0, 1.0, 1.0], 1.0], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[-1.0, 0.0, 1.0], 0.5], expected: [0.015876239976466765, 0.11731042782619838, 0.8668133321973349] },
      { input: [[1.0, 2.0], 0.0], expected: [0.0, 1.0] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Lower temperature concentrates probability on the best action.",
  },
  {
    id: "op-048",
    title: "UCB Bandit Selection",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Select an arm with the UCB1 rule.\n\nAny arm with count 0 is selected first, smallest index winning. Otherwise pick the arm maximizing q_values[i] + c * sqrt(log(total) / counts[i]), where total is the sum of all counts. Ties go to the smallest index.",
    starterCode: `def ucb_select(q_values, counts, c):
    # Your code here
    pass`,
    solution: `def ucb_select(q_values, counts, c):
    import math
    n = len(q_values)
    total = 0
    for cnt in counts:
        total = total + cnt
    for i in range(n):
        if counts[i] == 0:
            return i
    best = 0
    best_score = -1.0
    for i in range(n):
        score = q_values[i] + c * math.sqrt(math.log(total) / counts[i])
        if score > best_score:
            best_score = score
            best = i
    return best`,
    testCases: [
      { input: [[1.0, 2.0, 2.0], [3, 1, 1], 1.0], expected: 1 },
      { input: [[0.0, 0.0, 0.0], [0, 5, 5], 1.0], expected: 0 },
      { input: [[1.0, 1.0], [10, 10], 0.0], expected: 0 },
      { input: [[2.0, 1.5, 1.0], [4, 4, 4], 2.0], expected: 0 },
      { input: [[1.0, 2.0], [0, 0], 1.0], expected: 0 },
    ],
    hint: "Unvisited arms always get pulled before any confidence bonus is computed.",
  },
  {
    id: "op-049",
    title: "Thompson Sampling Pick",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Pick an arm by Thompson sampling from Beta posteriors.\n\nAfter random.seed(seed), draw random.betavariate(successes[i] + 1, failures[i] + 1) for every arm and return the index of the largest sample, with the lowest index winning ties.",
    starterCode: `def thompson_sampling_pick(successes, failures, seed):
    # Your code here
    pass`,
    solution: `def thompson_sampling_pick(successes, failures, seed):
    import random
    random.seed(seed)
    best = 0
    best_sample = -1.0
    for i in range(len(successes)):
        sample = random.betavariate(successes[i] + 1, failures[i] + 1)
        if sample > best_sample:
            best_sample = sample
            best = i
    return best`,
    testCases: [
      { input: [[1, 10, 5], [10, 1, 5], 0], expected: 1 },
      { input: [[0, 0, 0], [0, 0, 0], 1], expected: 1 },
      { input: [[9, 1], [1, 9], 42], expected: 0 },
      { input: [[2, 2, 2], [8, 7, 6], 7], expected: 1 },
    ],
    hint: "Adding 1 to both counts gives a uniform Beta(1, 1) prior per arm.",
  },
  {
    id: "op-050",
    title: "Cross-Entropy Method Elite Mean",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Run one iteration of the cross-entropy method for f(x) = (x - 2.5)^2.\n\nAfter random.seed(seed), draw n_samples values from a Gaussian with the given mean and sigma. Keep the k = max(1, int(n_samples * elite_frac)) samples with the smallest objective, then return [mean of elites, population standard deviation of elites].",
    starterCode: `def cem_elite_mean(mean, sigma, n_samples, elite_frac, seed):
    # Returns [elite_mean, elite_std]
    # Your code here
    pass`,
    solution: `def cem_elite_mean(mean, sigma, n_samples, elite_frac, seed):
    import random
    random.seed(seed)
    samples = [random.gauss(mean, sigma) for _ in range(n_samples)]
    order = sorted(range(n_samples), key=lambda i: (samples[i] - 2.5) ** 2)
    k = int(n_samples * elite_frac)
    if k < 1:
        k = 1
    elite = [samples[i] for i in order[:k]]
    new_mean = sum(elite) / k
    var = sum((v - new_mean) ** 2 for v in elite) / k
    return [new_mean, var ** 0.5]`,
    testCases: [
      { input: [0.0, 2.0, 20, 0.5, 0], expected: [1.423804366158908, 1.5812932920080844] },
      { input: [1.0, 0.5, 10, 0.3, 42], expected: [1.191697809311239, 0.12099218802590447] },
      { input: [3.0, 1.0, 8, 0.25, 7], expected: [2.714525644610607, 0.029594066941792452] },
    ],
    hint: "Elite selection uses the objective, so samples closest to 2.5 are kept.",
  },
];
