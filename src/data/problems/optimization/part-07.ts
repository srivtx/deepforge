import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-231",
    title: "Lion Vector Sign Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Lion update on a weight vector with decoupled weight decay.\n\nFor each coordinate let c_i = beta1 * m_i + (1 - beta1) * g_i and take u_i = sign(c_i). Update w_i = w_i - lr * (u_i + wd * w_i), then set m_i = beta2 * m_i + (1 - beta2) * g_i. Return [w_new, m_new] as two lists.",
    starterCode: `def lion_vector_step(w, m, g, lr, beta1, beta2, wd):
    # Returns [w_new, m_new]
    # Your code here
    pass`,
    solution: `def lion_vector_step(w, m, g, lr, beta1, beta2, wd):
    new_w = []
    new_m = []
    for i in range(len(w)):
        c = beta1 * m[i] + (1 - beta1) * g[i]
        if c > 0:
            u = 1.0
        elif c < 0:
            u = -1.0
        else:
            u = 0.0
        new_w.append(w[i] - lr * (u + wd * w[i]))
        new_m.append(beta2 * m[i] + (1 - beta2) * g[i])
    return [new_w, new_m]`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 0.0], [0.5, -0.5], 0.1, 0.9, 0.99, 0.0], expected: [[0.9, 2.1], [0.0050000000000000044, -0.0050000000000000044]] },
      { input: [[0.5, -0.5], [0.1, -0.2], [0.0, 0.0], 0.01, 0.9, 0.99, 0.1], expected: [[0.4895, -0.4895], [0.099, -0.198]] },
      { input: [[1.0, 1.0], [0.0, 0.0], [0.0, 0.0], 0.1, 0.9, 0.99, 0.05], expected: [[0.995, 0.995], [0.0, 0.0]] },
      { input: [[-1.0], [-0.5], [-2.0], 0.2, 0.8, 0.9, 0.0], expected: [[-0.8], [-0.6499999999999999]] },
    ],
    hint: "Only the sign of the interpolated momentum enters the update; decay is decoupled.",
  },
  {
    id: "op-232",
    title: "Muon Newton-Schulz Iteration",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Orthogonalize a small square matrix with the Muon Newton-Schulz iteration.\n\nNormalize g by its Frobenius norm to get X, then repeat steps times: A = X X^T followed by X = 1.5 * X - 0.5 * A X. Return the final matrix as a list of rows. If the input has zero norm, return a zero matrix.",
    starterCode: `def muon_newton_schulz(g, steps):
    # Your code here
    pass`,
    solution: `def muon_newton_schulz(g, steps):
    norm = 0.0
    for row in g:
        for v in row:
            norm = norm + v * v
    norm = norm ** 0.5
    n = len(g)
    m = len(g[0])
    if norm == 0:
        return [[0.0 for _ in range(m)] for _ in range(n)]
    x = [[v / norm for v in row] for row in g]
    for _ in range(steps):
        a = []
        for i in range(n):
            row = []
            for j in range(n):
                s = 0.0
                for k in range(m):
                    s = s + x[i][k] * x[j][k]
                row.append(s)
            a.append(row)
        nx = []
        for i in range(n):
            row = []
            for j in range(m):
                s = 0.0
                for k in range(n):
                    s = s + a[i][k] * x[k][j]
                row.append(1.5 * x[i][j] - 0.5 * s)
            nx.append(row)
        x = nx
    return x`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 2.0]], 2], expected: [[0.8164331399447233, 0.0], [0.0, 0.9996118286615059]] },
      { input: [[[0.5, -0.5], [1.0, 0.0]], 1], expected: [[0.408248290463863, -0.5443310539518174], [0.8845379626717031, 0.0680413817439772]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], 3], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[3.0, 4.0], [0.0, 0.0]], 1], expected: [[0.5999999999999999, 0.8000000000000002], [0.0, 0.0]] },
    ],
    hint: "The iteration pushes every singular value of the normalized matrix toward 1.",
  },
  {
    id: "op-233",
    title: "Shampoo Factor Shapes",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute Shampoo factor shapes and storage for a tensor shape.\n\nA weight of shape (d1, d2, ...) keeps one d_i x d_i preconditioner factor per dimension. Return [factors, storage, ratio], where factors is the list of [d_i, d_i] pairs, storage is the total number of factor entries, and ratio is the dense Kronecker size prod(d_i)^2 divided by storage.",
    starterCode: `def shampoo_factor_shapes(shape):
    # Returns [factors, storage, ratio]
    # Your code here
    pass`,
    solution: `def shampoo_factor_shapes(shape):
    factors = []
    storage = 0
    prod = 1
    for d in shape:
        factors.append([d, d])
        storage = storage + d * d
        prod = prod * d
    if storage == 0:
        return [factors, 0, 0.0]
    return [factors, storage, (prod * prod) / storage]`,
    testCases: [
      { input: [[4, 3]], expected: [[[4, 4], [3, 3]], 25, 5.76] },
      { input: [[10, 5]], expected: [[[10, 10], [5, 5]], 125, 20.0] },
      { input: [[3, 3]], expected: [[[3, 3], [3, 3]], 18, 4.5] },
      { input: [[2, 3, 4]], expected: [[[2, 2], [3, 3], [4, 4]], 29, 19.862068965517242] },
    ],
    hint: "Sum d squared over dimensions; the ratio grows quickly with tensor order.",
  },
  {
    id: "op-234",
    title: "Adafactor Relative Step Size",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Adafactor update with factored second moments and relative step sizes.\n\nUpdate row_i = beta2 * row_i + (1 - beta2) * mean_j(g_ij^2) and col_j = beta2 * col_j + (1 - beta2) * mean_i(g_ij^2). For each row take clip = max(eps2, RMS(w_i)) and set w_ij = w_ij - lr * clip * g_ij / (sqrt(row_i * col_j) + eps). Return [w_new, row_new, col_new].",
    starterCode: `def adafactor_relative_step(w, g, row, col, lr, beta2, eps, eps2):
    # Returns [w_new, row_new, col_new]
    # Your code here
    pass`,
    solution: `def adafactor_relative_step(w, g, row, col, lr, beta2, eps, eps2):
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
        rms = 0.0
        for j in range(ncols):
            rms = rms + w[i][j] * w[i][j]
        rms = (rms / ncols) ** 0.5
        clip = rms
        if clip < eps2:
            clip = eps2
        r = []
        for j in range(ncols):
            v = new_row[i] * new_col[j]
            r.append(w[i][j] - lr * clip * g[i][j] / (v ** 0.5 + eps))
        new_w.append(r)
    return [new_w, new_row, new_col]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.5], [0.5, 0.5]], [1.0, 1.0], [1.0, 1.0], 0.1, 0.9, 1e-8, 1e-3], expected: [[[0.9145330371356326, 1.9145330371356326], [2.808890061204824, 3.808890061204824]], [0.925, 0.925], [0.925, 0.925]] },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[1.0, 2.0], [3.0, 4.0]], [0.0, 0.0], [0.0, 0.0], 0.05, 0.0, 1e-8, 1e-3], expected: [[[0.4950000000141421, -0.007071067797723341], [-0.006708203924014089, 0.4936754446853201]], [2.5, 12.5], [5.0, 10.0]] },
      { input: [[[0.01, 0.02], [0.03, 0.04]], [[0.1, 0.1], [0.1, 0.1]], [1.0, 1.0], [1.0, 1.0], 0.1, 0.5, 1e-8, 1e-2], expected: [[[0.009686903208163464, 0.019686903208163464], [0.0292998942899164, 0.039299894289916405]], [0.505, 0.505], [0.505, 0.505]] },
    ],
    hint: "The row RMS scales the step so small weights still move relative to their size.",
  },
  {
    id: "op-235",
    title: "Sophia Clipped Ratio Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one Sophia optimizer update with a clipped ratio and a Hessian EMA.\n\nUpdate m = beta1 * m + (1 - beta1) * g and h = beta2 * h + (1 - beta2) * g^2, then compute ratio = m / max(rho * h, eps), clip it to [-1, 1], and set x = x - lr * ratio. Return [x, m, h].",
    starterCode: `def sophia_update(x, m, h, g, lr, beta1, beta2, rho, eps):
    # Returns [x, m, h]
    # Your code here
    pass`,
    solution: `def sophia_update(x, m, h, g, lr, beta1, beta2, rho, eps):
    m = beta1 * m + (1 - beta1) * g
    h = beta2 * h + (1 - beta2) * g * g
    ratio = m / max(rho * h, eps)
    if ratio > 1.0:
        ratio = 1.0
    if ratio < -1.0:
        ratio = -1.0
    x = x - lr * ratio
    return [x, m, h]`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5, 0.1, 0.9, 0.99, 0.05, 1e-8], expected: [0.9, 0.04999999999999999, 0.0025000000000000022] },
      { input: [1.0, 0.1, 2.0, 0.5, 0.01, 0.9, 0.99, 0.1, 1e-8], expected: [0.992938209331652, 0.14, 1.9825] },
      { input: [-2.0, -0.3, 0.4, -1.2, 0.05, 0.8, 0.95, 0.2, 1e-8], expected: [-1.95, -0.4799999999999999, 0.45200000000000007] },
      { input: [0.0, 0.0, 0.0, 0.0, 0.1, 0.9, 0.99, 0.1, 1e-8], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The Hessian EMA in the denominator makes the clipped ratio curvature-aware.",
  },
  {
    id: "op-236",
    title: "LAMB Trust Ratio Clamp",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the LAMB trust ratio and clamp it to a maximum.\n\nReturn min(max_ratio, ||w|| / (||u|| + eps)), where w is the weight vector and u is the raw update vector. Clamping stops a single layer from taking an oversized coordinated step.",
    starterCode: `def lamb_trust_ratio_clamp(w, u, eps, max_ratio):
    # Your code here
    pass`,
    solution: `def lamb_trust_ratio_clamp(w, u, eps, max_ratio):
    wn = 0.0
    un = 0.0
    for i in range(len(w)):
        wn = wn + w[i] * w[i]
        un = un + u[i] * u[i]
    ratio = (wn ** 0.5) / (un ** 0.5 + eps)
    if ratio > max_ratio:
        ratio = max_ratio
    return ratio`,
    testCases: [
      { input: [[3.0, 4.0], [0.0, 1.0], 1e-8, 5.0], expected: 4.999999950000001 },
      { input: [[1.0, 1.0], [2.0, 2.0], 0.0, 10.0], expected: 0.5 },
      { input: [[1.0, 1.0], [0.01, 0.01], 1e-8, 2.0], expected: 2.0 },
      { input: [[0.0, 0.0], [1.0, 1.0], 1e-8, 4.0], expected: 0.0 },
    ],
    hint: "Only the ratio above max_ratio is clipped; small ratios pass through.",
  },
  {
    id: "op-237",
    title: "LARS Layerwise Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform one LARS layer update with a local learning rate.\n\nCompute eta = trust_coef * lr * ||w|| / (||g|| + wd * ||w|| + eps), then return w - eta * (g + wd * w) elementwise. The trust coefficient keeps the update norm proportional to the weight norm.",
    starterCode: `def lars_layer_update(w, g, lr, trust_coef, wd, eps):
    # Your code here
    pass`,
    solution: `def lars_layer_update(w, g, lr, trust_coef, wd, eps):
    wn = 0.0
    gn = 0.0
    for i in range(len(w)):
        wn = wn + w[i] * w[i]
        gn = gn + g[i] * g[i]
    wn = wn ** 0.5
    gn = gn ** 0.5
    eta = trust_coef * lr * wn / (gn + wd * wn + eps)
    return [w[i] - eta * (g[i] + wd * w[i]) for i in range(len(w))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, -0.5], 0.1, 0.9, 0.0, 1e-8], expected: [0.857697507304884, 2.1423024926951157] },
      { input: [[1.0, 1.0], [0.2, 0.2], 0.05, 1.0, 0.01, 1e-8], expected: [0.9500000016835876, 0.9500000016835876] },
      { input: [[3.0, 4.0], [0.0, 0.0], 0.2, 0.8, 0.0, 1e-8], expected: [3.0, 4.0] },
    ],
    hint: "The denominator adds the decay-scaled weight norm to the gradient norm.",
  },
  {
    id: "op-238",
    title: "Centralized Gradient Norm",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Euclidean norm of a gradient vector after gradient centralization.\n\nSubtract the mean of the components from each component, then return the norm of the centered vector. An empty input returns 0.0, and a constant vector centers to the zero vector.",
    starterCode: `def centralized_grad_norm(g):
    # Your code here
    pass`,
    solution: `def centralized_grad_norm(g):
    if not g:
        return 0.0
    mean = sum(g) / len(g)
    total = 0.0
    for v in g:
        total = total + (v - mean) * (v - mean)
    return total ** 0.5`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: 1.4142135623730951 },
      { input: [[-1.0, 0.0, 1.0, 2.0]], expected: 2.23606797749979 },
      { input: [[4.0, 4.0, 4.0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[5.0]], expected: 0.0 },
    ],
    hint: "Centralization removes the projection onto the all-ones direction.",
  },
  {
    id: "op-239",
    title: "Decoupled Decay With Step Schedule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply one decoupled weight decay step with a step-decayed coefficient.\n\nLet wd_t = wd * decay^step, then return x - lr * grad_step - lr * wd_t * x. The optimizer step and the decay are applied separately, as in AdamW-style optimizers.",
    starterCode: `def decoupled_decay_scheduled(x, grad_step, lr, wd, decay, step):
    # Your code here
    pass`,
    solution: `def decoupled_decay_scheduled(x, grad_step, lr, wd, decay, step):
    wd_t = wd * (decay ** step)
    return x - lr * grad_step - lr * wd_t * x`,
    testCases: [
      { input: [2.0, 0.5, 0.1, 0.01, 0.5, 0], expected: 1.948 },
      { input: [2.0, 0.5, 0.1, 0.01, 0.5, 2], expected: 1.9495 },
      { input: [0.0, -1.0, 0.2, 0.05, 0.9, 3], expected: 0.2 },
      { input: [-1.0, 0.0, 0.1, 0.1, 0.0, 5], expected: -1.0 },
    ],
    hint: "decay^step shrinks the decay coefficient over training.",
  },
  {
    id: "op-240",
    title: "Cosine Schedule Mean Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the mean learning rate of a cosine annealing schedule over discrete steps.\n\nFor step = 0 through total inclusive evaluate lr(step) = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * step / total)) and return the arithmetic mean of those total + 1 values. If total is not positive, return min_lr.",
    starterCode: `def cosine_schedule_mean(base_lr, min_lr, total):
    # Your code here
    pass`,
    solution: `def cosine_schedule_mean(base_lr, min_lr, total):
    import math
    if total <= 0:
        return min_lr
    s = 0.0
    for step in range(total + 1):
        s = s + min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * step / total))
    return s / (total + 1)`,
    testCases: [
      { input: [0.1, 0.0, 4], expected: 0.05 },
      { input: [0.1, 0.01, 10], expected: 0.05500000000000001 },
      { input: [1.0, 0.0, 100], expected: 0.49999999999999983 },
      { input: [0.1, 0.0, 0], expected: 0.0 },
    ],
    hint: "The discrete average of the cosine curve sits near the midpoint of the range.",
  },
  {
    id: "op-241",
    title: "Warmup-Stable-Decay Learning Rate",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the learning rate of a warmup-stable-decay (WSD) schedule.\n\nDuring the first warmup_steps the rate rises linearly from 0 to base_lr, then stays at base_lr for stable_steps, then decays linearly to 0 over decay_steps, and is 0 afterwards. Steps before 0 are treated as 0.",
    starterCode: `def wsd_lr(base_lr, warmup_steps, stable_steps, decay_steps, step):
    # Your code here
    pass`,
    solution: `def wsd_lr(base_lr, warmup_steps, stable_steps, decay_steps, step):
    if step < 0:
        step = 0
    if warmup_steps > 0 and step < warmup_steps:
        return base_lr * step / warmup_steps
    if step < warmup_steps + stable_steps:
        return base_lr
    if decay_steps > 0 and step < warmup_steps + stable_steps + decay_steps:
        return base_lr * (1.0 - (step - warmup_steps - stable_steps) / decay_steps)
    return 0.0`,
    testCases: [
      { input: [0.1, 10, 20, 30, 0], expected: 0.0 },
      { input: [0.1, 10, 20, 30, 5], expected: 0.05 },
      { input: [0.1, 10, 20, 30, 10], expected: 0.1 },
      { input: [0.1, 10, 20, 30, 30], expected: 0.1 },
      { input: [0.1, 10, 20, 30, 45], expected: 0.05 },
      { input: [0.1, 10, 20, 30, 60], expected: 0.0 },
    ],
    hint: "The three phases are contiguous at step values warmup, warmup + stable, and the end.",
  },
  {
    id: "op-242",
    title: "Linear Batch Scaling Rule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Apply the linear batch scaling rule for learning rates.\n\nReturn base_lr * new_batch / base_batch so the learning rate grows in proportion to the batch size. If base_batch is not positive, return base_lr unchanged.",
    starterCode: `def linear_scaling_lr(base_lr, base_batch, new_batch):
    # Your code here
    pass`,
    solution: `def linear_scaling_lr(base_lr, base_batch, new_batch):
    if base_batch <= 0:
        return base_lr
    return base_lr * new_batch / base_batch`,
    testCases: [
      { input: [0.1, 32, 128], expected: 0.4 },
      { input: [0.1, 32, 32], expected: 0.1 },
      { input: [0.2, 64, 16], expected: 0.05 },
      { input: [0.1, 0, 5], expected: 0.1 },
    ],
    hint: "Doubling the batch doubles the learning rate under this rule.",
  },
  {
    id: "op-243",
    title: "Sqrt Scaling Inferred Batch",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Invert the square-root batch scaling rule to infer a batch size.\n\nGiven a base learning rate and base batch, return base_batch * (lr_new / base_lr)^2, the batch size that would justify lr_new under sqrt scaling. If base_lr is not positive, return 0.0.",
    starterCode: `def sqrt_scaling_batch(lr_new, base_lr, base_batch):
    # Your code here
    pass`,
    solution: `def sqrt_scaling_batch(lr_new, base_lr, base_batch):
    if base_lr <= 0:
        return 0.0
    return base_batch * (lr_new / base_lr) ** 2`,
    testCases: [
      { input: [0.2, 0.1, 32], expected: 128.0 },
      { input: [0.05, 0.1, 32], expected: 8.0 },
      { input: [0.1, 0.1, 64], expected: 64.0 },
      { input: [0.0, 0.0, 8], expected: 0.0 },
    ],
    hint: "Squaring the learning-rate ratio recovers the batch-size ratio.",
  },
  {
    id: "op-244",
    title: "Critical Batch Size Estimate",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Estimate the critical batch size from gradient norms measured at two batch sizes.\n\nUsing E||g_B||^2 = ||G||^2 + sigma^2 / B, solve sigma^2 = (gs_norm_sq - gb_norm_sq) * bs * bb / (bb - bs) and ||G||^2 = gb_norm_sq - sigma^2 / bb, then return sigma^2 / ||G||^2. Return 0.0 when bb <= bs, gs_norm_sq <= gb_norm_sq, or the signal is not positive.",
    starterCode: `def critical_batch_size(gs_norm_sq, gb_norm_sq, bs, bb):
    # Your code here
    pass`,
    solution: `def critical_batch_size(gs_norm_sq, gb_norm_sq, bs, bb):
    if bb <= bs or gs_norm_sq <= gb_norm_sq:
        return 0.0
    sigma_sq = (gs_norm_sq - gb_norm_sq) * bs * bb / (bb - bs)
    signal = gb_norm_sq - sigma_sq / bb
    if signal <= 0:
        return 0.0
    return sigma_sq / signal`,
    testCases: [
      { input: [3.0, 1.25, 32, 256], expected: 64.0 },
      { input: [5.0, 2.0, 16, 128], expected: 34.90909090909091 },
      { input: [1.0, 1.0, 32, 64], expected: 0.0 },
      { input: [2.0, 3.0, 64, 32], expected: 0.0 },
    ],
    hint: "The noise estimate is amplified by the harmonic difference of the two batch sizes.",
  },
  {
    id: "op-245",
    title: "Noise Scale From Gradient Norms",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate the gradient noise scale from aggregate gradient norms.\n\nGiven the sum of per-sample squared gradient norms, the sample count n, and the squared norm of the full-batch gradient, estimate the per-sample variance as (sum_sq_norms - n * mean_norm_sq) / (n - 1), clamp it at 0, and return variance / mean_norm_sq. Return 0.0 when n < 2 or mean_norm_sq <= 0.",
    starterCode: `def noise_scale_from_norms(sum_sq_norms, n, mean_norm_sq):
    # Your code here
    pass`,
    solution: `def noise_scale_from_norms(sum_sq_norms, n, mean_norm_sq):
    if n < 2 or mean_norm_sq <= 0:
        return 0.0
    var = (sum_sq_norms - n * mean_norm_sq) / (n - 1)
    if var < 0:
        var = 0.0
    return var / mean_norm_sq`,
    testCases: [
      { input: [12.0, 6, 1.0], expected: 1.2 },
      { input: [40.0, 5, 4.0], expected: 1.25 },
      { input: [1.0, 1, 1.0], expected: 0.0 },
      { input: [4.0, 4, 2.0], expected: 0.0 },
    ],
    hint: "The n - 1 divisor makes the variance estimate unbiased.",
  },
  {
    id: "op-246",
    title: "Bias-Corrected EMA Weights",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Debias an exponential moving average of the weights.\n\nGiven the current EMA vector, the decay factor, and the step count t, return each ema_i / (1 - decay^t). The correction compensates for the EMA starting at zero. If the denominator is zero, return the EMA unchanged.",
    starterCode: `def ema_bias_corrected(ema, decay, t):
    # Your code here
    pass`,
    solution: `def ema_bias_corrected(ema, decay, t):
    denom = 1 - decay ** t
    if denom == 0:
        return list(ema)
    return [e / denom for e in ema]`,
    testCases: [
      { input: [[1.0, 2.0], 0.9, 1], expected: [10.000000000000002, 20.000000000000004] },
      { input: [[0.5, 0.5], 0.9, 3], expected: [1.8450184501845024, 1.8450184501845024] },
      { input: [[1.0], 0.999, 10], expected: [100.45082541138463] },
      { input: [[2.0, -2.0], 0.5, 2], expected: [2.6666666666666665, -2.6666666666666665] },
    ],
    hint: "Early EMA values are too small because they start from zero.",
  },
  {
    id: "op-247",
    title: "Lookahead Multi-Step Averaging",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Apply several Lookahead interpolations to a slow weight vector.\n\nStarting from slow, process each fast vector in fast_history in order with slow = slow + alpha * (fast - slow). Return [slow_final, fast_final] where fast_final is a copy of the final slow weights. An empty history returns the starting weights unchanged.",
    starterCode: `def lookahead_multistep(slow, fast_history, alpha):
    # Returns [slow_final, fast_final]
    # Your code here
    pass`,
    solution: `def lookahead_multistep(slow, fast_history, alpha):
    cur = list(slow)
    for fast in fast_history:
        cur = [cur[i] + alpha * (fast[i] - cur[i]) for i in range(len(cur))]
    return [cur, list(cur)]`,
    testCases: [
      { input: [[0.0, 0.0], [[2.0, 4.0], [3.0, 1.0]], 0.5], expected: [[2.0, 1.5], [2.0, 1.5]] },
      { input: [[1.0, 1.0], [[1.0, 1.0]], 0.9], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[0.0], [[10.0], [0.0], [10.0]], 0.25], expected: [[3.90625], [3.90625]] },
    ],
    hint: "Each interpolation moves the slow weights a fraction alpha toward the observed fast weights.",
  },
  {
    id: "op-248",
    title: "SAM Perturbation Norm",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the norm of a Sharpness-Aware Minimization perturbation.\n\nNormalizing the gradient by its Euclidean norm gives a perturbation rho * g / (||g|| + eps); return its norm, which equals rho * ||g|| / (||g|| + eps). A zero gradient yields 0.0.",
    starterCode: `def sam_perturbation_norm(grad, rho, eps):
    # Your code here
    pass`,
    solution: `def sam_perturbation_norm(grad, rho, eps):
    norm = 0.0
    for v in grad:
        norm = norm + v * v
    norm = norm ** 0.5
    return rho * norm / (norm + eps)`,
    testCases: [
      { input: [[3.0, 4.0], 0.05, 1e-8], expected: 0.0499999999 },
      { input: [[0.0, 0.0], 0.1, 1e-8], expected: 0.0 },
      { input: [[1.0, 1.0, 1.0, 1.0], 0.2, 1e-8], expected: 0.199999999 },
      { input: [[1.0, 0.0], 0.1, 1.0], expected: 0.05 },
    ],
    hint: "The perturbation has norm just under rho when the gradient is large.",
  },
  {
    id: "op-249",
    title: "SAM Sharpness Estimate",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Estimate the local sharpness of the loss from a SAM ascent step.\n\nReturn (loss_adv - loss_clean) / rho, the loss increase per unit perturbation. If rho is not positive, return 0.0.",
    starterCode: `def sam_sharpness_estimate(loss_clean, loss_adv, rho):
    # Your code here
    pass`,
    solution: `def sam_sharpness_estimate(loss_clean, loss_adv, rho):
    if rho <= 0:
        return 0.0
    return (loss_adv - loss_clean) / rho`,
    testCases: [
      { input: [0.5, 0.7, 0.1], expected: 1.9999999999999996 },
      { input: [1.0, 0.9, 0.05], expected: -1.9999999999999996 },
      { input: [2.0, 2.0, 0.2], expected: 0.0 },
      { input: [1.0, 1.5, 0.0], expected: 0.0 },
    ],
    hint: "A larger loss increase over the same perturbation means a sharper minimum.",
  },
  {
    id: "op-250",
    title: "SignSGD Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Perform one SignSGD update on a parameter vector.\n\nReturn w_i - lr * sign(g_i) elementwise, where sign is 1 for positive gradients, -1 for negative gradients, and 0 for zero gradients. Every coordinate moves by the same amount lr.",
    starterCode: `def signsgd_update(w, g, lr):
    # Your code here
    pass`,
    solution: `def signsgd_update(w, g, lr):
    out = []
    for i in range(len(w)):
        if g[i] > 0:
            s = 1.0
        elif g[i] < 0:
            s = -1.0
        else:
            s = 0.0
        out.append(w[i] - lr * s)
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0.5, -0.5, 0.0], 0.1], expected: [0.9, 2.1, 3.0] },
      { input: [[0.0], [-2.0], 0.5], expected: [0.5] },
      { input: [[5.0, -5.0], [1.0, 1.0], 1.0], expected: [4.0, -6.0] },
    ],
    hint: "SignSGD discards the gradient magnitude, so only the sign drives each step.",
  },
  {
    id: "op-251",
    title: "AdaBelief Corrected Variance",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Update the AdaBelief belief variance and bias-correct it.\n\nGiven the running variance s, the current gradient g, the first moment m, step t, decay beta2, and eps, compute s_new = beta2 * s + (1 - beta2) * (g - m)^2 + eps, then return [s_new, s_new / (1 - beta2^t)]. If the correction denominator is zero, return s_new for both entries.",
    starterCode: `def adabelief_corrected_variance(s, g, m, t, beta2, eps):
    # Returns [s_new, s_hat]
    # Your code here
    pass`,
    solution: `def adabelief_corrected_variance(s, g, m, t, beta2, eps):
    s_new = beta2 * s + (1 - beta2) * (g - m) ** 2 + eps
    denom = 1 - beta2 ** t
    if denom == 0:
        return [s_new, s_new]
    return [s_new, s_new / denom]`,
    testCases: [
      { input: [0.0, 0.5, 0.0, 1, 0.999, 1e-8], expected: [0.0002500100000000002, 0.25001] },
      { input: [0.01, 0.5, 0.1, 5, 0.999, 1e-8], expected: [0.010150010000000001, 2.0340660660335996] },
      { input: [0.4, -1.2, -0.3, 10, 0.99, 1e-8], expected: [0.40410001, 4.226195141101516] },
    ],
    hint: "The belief variance tracks the surprise (g - m) squared, not the raw gradient squared.",
  },
  {
    id: "op-252",
    title: "RAdam Rectification Term",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute the RAdam rectification term.\n\nWith rho_inf = 2 / (1 - beta2) - 1 and rho_t = rho_inf - 2 * t * beta2^t / (1 - beta2^t), return [rho_t, rect] where rect = sqrt(((rho_t - 4) * (rho_t - 2) * rho_inf) / ((rho_inf - 4) * (rho_inf - 2) * rho_t)) when rho_t > 4, and 0.0 otherwise. The term scales the adaptive step early in training.",
    starterCode: `def radam_rectification(t, beta2):
    # Returns [rho_t, rect]
    # Your code here
    pass`,
    solution: `def radam_rectification(t, beta2):
    rho_inf = 2.0 / (1 - beta2) - 1.0
    rho_t = rho_inf - 2.0 * t * (beta2 ** t) / (1 - beta2 ** t)
    if rho_t > 4:
        rect = ((rho_t - 4) * (rho_t - 2) * rho_inf / ((rho_inf - 4) * (rho_inf - 2) * rho_t)) ** 0.5
    else:
        rect = 0.0
    return [rho_t, rect]`,
    testCases: [
      { input: [1, 0.999], expected: [1.0, 0.0] },
      { input: [5, 0.999], expected: [4.995998000395048, 0.017311503166315034] },
      { input: [10, 0.99], expected: [9.83419764817532, 0.15516525667773864] },
      { input: [100, 0.9], expected: [18.994687579117155, 0.999806454677178] },
    ],
    hint: "The rectification term stays zero until rho_t exceeds 4.",
  },
  {
    id: "op-253",
    title: "Nesterov Momentum Single Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one Nesterov momentum step given the gradient at the lookahead point.\n\nUpdate v_new = mu * v - lr * g and x_new = x + v_new, returning [x_new, v_new]. The gradient g is assumed to already be evaluated at x + mu * v.",
    starterCode: `def nesterov_single_step(x, v, g, lr, mu):
    # Returns [x_new, v_new]
    # Your code here
    pass`,
    solution: `def nesterov_single_step(x, v, g, lr, mu):
    v_new = mu * v - lr * g
    return [x + v_new, v_new]`,
    testCases: [
      { input: [1.0, 0.0, 2.0, 0.1, 0.9], expected: [0.8, -0.2] },
      { input: [0.0, 1.0, -1.0, 0.05, 0.5], expected: [0.55, 0.55] },
      { input: [-2.0, -1.0, 0.5, 0.2, 0.8], expected: [-2.9, -0.9] },
    ],
    hint: "Velocity accumulates the momentum term and the negative gradient.",
  },
  {
    id: "op-254",
    title: "Polyak Window Average",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Average only the most recent parameter values.\n\nReturn the arithmetic mean of the last min(k, len(values)) entries. An empty list or a non-positive window returns 0.0.",
    starterCode: `def polyak_window_average(values, k):
    # Your code here
    pass`,
    solution: `def polyak_window_average(values, k):
    if not values or k <= 0:
        return 0.0
    win = values[-k:]
    return sum(win) / len(win)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], 2], expected: 3.5 },
      { input: [[1.0, 2.0], 5], expected: 1.5 },
      { input: [[], 3], expected: 0.0 },
      { input: [[5.0], 0], expected: 0.0 },
    ],
    hint: "Slicing from the end keeps the newest values and drops the oldest.",
  },
  {
    id: "op-255",
    title: "SWA Cyclic Phase LR",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the SWA learning rate with a cyclic phase after the switch point.\n\nBefore swa_start (or when period is not positive) return base_lr. Afterwards let phase = (step - swa_start) % period and return swa_lr * 0.5 * (1 + cos(pi * phase / period)), a cosine cycle running from swa_lr down to 0.",
    starterCode: `def swa_cyclic_phase_lr(step, swa_start, period, base_lr, swa_lr):
    # Your code here
    pass`,
    solution: `def swa_cyclic_phase_lr(step, swa_start, period, base_lr, swa_lr):
    import math
    if step < swa_start or period <= 0:
        return base_lr
    phase = (step - swa_start) % period
    return swa_lr * 0.5 * (1 + math.cos(math.pi * phase / period))`,
    testCases: [
      { input: [0, 10, 5, 0.1, 0.05], expected: 0.1 },
      { input: [10, 10, 5, 0.1, 0.05], expected: 0.05 },
      { input: [12, 10, 5, 0.1, 0.05], expected: 0.032725424859373686 },
      { input: [15, 10, 5, 0.1, 0.05], expected: 0.05 },
      { input: [17, 10, 5, 0.1, 0.05], expected: 0.032725424859373686 },
      { input: [20, 10, 0, 0.1, 0.05], expected: 0.1 },
    ],
    hint: "The cycle length period resets the cosine every period steps.",
  },
  {
    id: "op-256",
    title: "Model Soup Mean And Spread",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Average a list of model parameter vectors and measure their spread.\n\nAll models are flat lists of the same length. Return [mean, max_deviation] where mean is the coordinatewise average and max_deviation is the largest absolute difference between any model coordinate and its mean. An empty list returns [[], 0.0].",
    starterCode: `def model_soup_mean_and_spread(models):
    # Returns [mean, max_deviation]
    # Your code here
    pass`,
    solution: `def model_soup_mean_and_spread(models):
    if not models:
        return [[], 0.0]
    k = len(models)
    n = len(models[0])
    mean = []
    for i in range(n):
        total = 0.0
        for m in models:
            total = total + m[i]
        mean.append(total / k)
    dev = 0.0
    for m in models:
        for i in range(n):
            d = abs(m[i] - mean[i])
            if d > dev:
                dev = d
    return [mean, dev]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[3.0, 4.0], 2.0] },
      { input: [[[0.0, 0.0], [2.0, 4.0]]], expected: [[1.0, 2.0], 2.0] },
      { input: [[[1.0], [1.0]]], expected: [[1.0], 0.0] },
      { input: [[]], expected: [[], 0.0] },
    ],
    hint: "The spread tells you how far the soup ingredients are from the final average.",
  },
  {
    id: "op-257",
    title: "Trust Region Gain Ratio",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the gain ratio of a trust-region step.\n\nIf predicted <= 0 use ratio 0.0, otherwise ratio = actual / predicted. Return [ratio, accepted, shrink] where accepted is ratio > eta and shrink is ratio < 0.25.",
    starterCode: `def trust_region_ratio(actual, predicted, eta):
    # Returns [ratio, accepted, shrink]
    # Your code here
    pass`,
    solution: `def trust_region_ratio(actual, predicted, eta):
    if predicted <= 0:
        ratio = 0.0
    else:
        ratio = actual / predicted
    return [ratio, ratio > eta, ratio < 0.25]`,
    testCases: [
      { input: [0.1, 1.0, 0.1], expected: [0.1, false, true] },
      { input: [0.9, 1.0, 0.1], expected: [0.9, true, false] },
      { input: [0.2, 0.0, 0.1], expected: [0.0, false, true] },
      { input: [0.05, 1.0, 0.25], expected: [0.05, false, true] },
    ],
    hint: "A poor ratio means the model predicted more reduction than reality delivered.",
  },
  {
    id: "op-258",
    title: "KL Trust Region Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform a KL-constrained update on the probability simplex.\n\nCompute q_i proportional to p_i * exp(-lr * g_i), normalize q to sum to 1, then return [q, kl] where kl = sum_i p_i * log(p_i / q_i) over entries with p_i > 0. This is the closed form of a linear objective with a KL trust region.",
    starterCode: `def kl_constrained_step(p, g, lr):
    # Returns [q, kl]
    # Your code here
    pass`,
    solution: `def kl_constrained_step(p, g, lr):
    import math
    q = []
    total = 0.0
    for i in range(len(p)):
        v = p[i] * math.exp(-lr * g[i])
        q.append(v)
        total = total + v
    q = [v / total for v in q]
    kl = 0.0
    for i in range(len(p)):
        if p[i] > 0:
            kl = kl + p[i] * math.log(p[i] / q[i])
    return [q, kl]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, -1.0], 0.1], expected: [[0.4501660026875221, 0.549833997312478], 0.004991688821646446] },
      { input: [[0.2, 0.3, 0.5], [0.0, 0.0, 0.0], 1.0], expected: [[0.2, 0.3, 0.5], 0.0] },
      { input: [[0.9, 0.1], [-2.0, 1.0], 0.5], expected: [[0.9758075451312032, 0.02419245486879684], 0.06912938372077355] },
    ],
    hint: "The exponential tilt is the prox of the negative entropy, and the KL measures how far it moved.",
  },
  {
    id: "op-259",
    title: "Diagonal Natural Gradient Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take a natural gradient step with a diagonal Fisher approximation.\n\nReturn x_i - lr * grad_i / (fisher_i + eps) elementwise. If a corrected Fisher entry is not positive, leave that coordinate unchanged.",
    starterCode: `def diag_natural_gradient_step(x, grad, fisher, lr, eps):
    # Your code here
    pass`,
    solution: `def diag_natural_gradient_step(x, grad, fisher, lr, eps):
    out = []
    for i in range(len(x)):
        denom = fisher[i] + eps
        if denom <= 0:
            out.append(x[i])
        else:
            out.append(x[i] - lr * grad[i] / denom)
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 1.0], [0.25, 4.0], 0.1, 1e-8], expected: [-0.3999999840000007, -0.024999999937500003] },
      { input: [[1.0, -1.0], [0.5, 2.0], [1.0, 1.0], 0.5, 0.0], expected: [0.75, -2.0] },
      { input: [[2.0], [0.0], [0.0], 0.1, 0.0], expected: [2.0] },
    ],
    hint: "Curvature-heavy coordinates receive proportionally smaller steps.",
  },
  {
    id: "op-260",
    title: "K-FAC Factor Shapes",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Report the Kronecker factor shapes used by K-FAC for a dense layer with in_dim inputs and out_dim outputs.\n\nThe activation covariance has shape in_dim x in_dim and the gradient covariance has shape out_dim x out_dim. Return [a_shape, g_shape, overhead] where overhead is the factor storage (in_dim^2 + out_dim^2) divided by the weight storage in_dim * out_dim. Return overhead 0.0 for non-positive dimensions.",
    starterCode: `def kfac_factor_shapes(in_dim, out_dim):
    # Returns [a_shape, g_shape, overhead]
    # Your code here
    pass`,
    solution: `def kfac_factor_shapes(in_dim, out_dim):
    a_shape = [in_dim, in_dim]
    g_shape = [out_dim, out_dim]
    if in_dim <= 0 or out_dim <= 0:
        return [a_shape, g_shape, 0.0]
    overhead = (in_dim * in_dim + out_dim * out_dim) / (in_dim * out_dim)
    return [a_shape, g_shape, overhead]`,
    testCases: [
      { input: [4, 3], expected: [[4, 4], [3, 3], 2.0833333333333335] },
      { input: [10, 5], expected: [[10, 10], [5, 5], 2.5] },
      { input: [1, 1], expected: [[1, 1], [1, 1], 2.0] },
      { input: [8, 2], expected: [[8, 8], [2, 2], 4.25] },
    ],
    hint: "Factor storage is quadratic in each dimension rather than the product.",
  },
  {
    id: "op-261",
    title: "Preconditioned Conjugate Gradient Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform one preconditioned conjugate gradient step on a quadratic.\n\nWith diagonal preconditioner minv, compute z = minv * r, alpha = (r dot z) / (p dot A p), x_new = x + alpha * p, r_new = r - alpha * A p, z_new = minv * r_new, and beta = (r_new dot z_new) / (r dot z). Return [x_new, r_new, p_new] with p_new = z_new + beta * p. Use 0 for alpha or beta when the corresponding denominator is zero.",
    starterCode: `def pcg_step(x, r, p, A, minv):
    # Returns [x_new, r_new, p_new]
    # Your code here
    pass`,
    solution: `def pcg_step(x, r, p, A, minv):
    n = len(x)
    z = [minv[i] * r[i] for i in range(n)]
    Ap = [sum(A[i][j] * p[j] for j in range(n)) for i in range(n)]
    rz = sum(r[i] * z[i] for i in range(n))
    pAp = sum(p[i] * Ap[i] for i in range(n))
    if pAp == 0:
        alpha = 0.0
    else:
        alpha = rz / pAp
    x_new = [x[i] + alpha * p[i] for i in range(n)]
    r_new = [r[i] - alpha * Ap[i] for i in range(n)]
    z_new = [minv[i] * r_new[i] for i in range(n)]
    rz_new = sum(r_new[i] * z_new[i] for i in range(n))
    if rz == 0:
        beta = 0.0
    else:
        beta = rz_new / rz
    p_new = [z_new[i] + beta * p[i] for i in range(n)]
    return [x_new, r_new, p_new]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], [1.0, 2.0], [[4.0, 1.0], [1.0, 3.0]], [0.5, 0.25]], expected: [[0.075, 0.15], [0.55, 1.475], [0.7384375000000001, 1.295625]] },
      { input: [[1.0, 1.0], [0.0, 2.0], [0.0, 2.0], [[2.0, 0.0], [0.0, 2.0]], [1.0, 1.0]], expected: [[1.0, 2.0], [0.0, 0.0], [0.0, 0.0]] },
      { input: [[0.5, -0.5], [1.0, 1.0], [1.0, 1.0], [[3.0, 0.0], [0.0, 2.0]], [1.0, 0.5]], expected: [[0.8, -0.2], [0.10000000000000009, 0.4], [0.16000000000000011, 0.26]] },
    ],
    hint: "The preconditioner turns the residual into z; alpha and beta use r dot z, not r dot r.",
  },
  {
    id: "op-262",
    title: "Fletcher-Reeves Beta With Restart",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the Fletcher-Reeves conjugate gradient coefficient with a restart test.\n\nReturn (grad dot grad) / (grad_old dot grad_old), but return 0.0 when the old gradient is zero or when grad dot p_old is not negative, meaning the previous direction is no longer a descent direction.",
    starterCode: `def fletcher_reeves_beta(grad, grad_old, p_old):
    # Your code here
    pass`,
    solution: `def fletcher_reeves_beta(grad, grad_old, p_old):
    gg = 0.0
    gogo = 0.0
    gp = 0.0
    for i in range(len(grad)):
        gg = gg + grad[i] * grad[i]
        gogo = gogo + grad_old[i] * grad_old[i]
        gp = gp + grad[i] * p_old[i]
    if gogo == 0 or gp >= 0:
        return 0.0
    return gg / gogo`,
    testCases: [
      { input: [[2.0, -2.0], [1.0, 1.0], [-1.0, 0.0]], expected: 4.0 },
      { input: [[1.0, 0.0], [1.0, 1.0], [1.0, 0.0]], expected: 0.0 },
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, 1.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [0.5, 0.5], [-2.0, -4.0]], expected: 10.0 },
    ],
    hint: "A non-negative gradient-direction dot product triggers a restart to steepest descent.",
  },
  {
    id: "op-263",
    title: "BFGS Curvature Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Check the curvature condition before a BFGS update.\n\nGiven s = x_new - x and y = grad_new - grad_old, return [ys, yy_ss, passed] where ys = s dot y, yy_ss = (y dot y) / (s dot s) with 0.0 when s is zero, and passed is the boolean ys > eps. A positive ys keeps the updated inverse Hessian positive definite.",
    starterCode: `def bfgs_curvature_check(s, y, eps):
    # Returns [ys, yy_ss, passed]
    # Your code here
    pass`,
    solution: `def bfgs_curvature_check(s, y, eps):
    ys = 0.0
    yy = 0.0
    ss = 0.0
    for i in range(len(s)):
        ys = ys + s[i] * y[i]
        yy = yy + y[i] * y[i]
        ss = ss + s[i] * s[i]
    if ss == 0:
        return [ys, 0.0, ys > eps]
    return [ys, yy / ss, ys > eps]`,
    testCases: [
      { input: [[1.0, 1.0], [2.0, 3.0], 1e-8], expected: [5.0, 6.5, true] },
      { input: [[1.0, -2.0], [0.5, 1.5], 0.0], expected: [-2.5, 0.5, false] },
      { input: [[0.0, 0.0], [1.0, 1.0], 0.1], expected: [0.0, 0.0, false] },
      { input: [[2.0, 0.0], [-1.0, 1.0], 0.5], expected: [-2.0, 0.5, false] },
    ],
    hint: "If the curvature condition fails, skip the update or damp the pair.",
  },
  {
    id: "op-264",
    title: "L-BFGS Memory Scaling",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the L-BFGS initial Hessian scaling from the newest correction pair.\n\nReturn (s dot y) / (y dot y), the gamma that multiplies the identity before the two-loop recursion. If y is the zero vector, return 1.0.",
    starterCode: `def lbfgs_memory_scaling(s, y):
    # Your code here
    pass`,
    solution: `def lbfgs_memory_scaling(s, y):
    ys = 0.0
    yy = 0.0
    for i in range(len(s)):
        ys = ys + s[i] * y[i]
        yy = yy + y[i] * y[i]
    if yy == 0:
        return 1.0
    return ys / yy`,
    testCases: [
      { input: [[1.0, 2.0], [2.0, 4.0]], expected: 0.5 },
      { input: [[1.0, 1.0], [1.0, -1.0]], expected: 0.0 },
      { input: [[0.5], [0.0]], expected: 1.0 },
      { input: [[-1.0, 2.0], [0.5, 1.5]], expected: 1.0 },
    ],
    hint: "This scalar keeps the scaled identity consistent with the local curvature.",
  },
  {
    id: "op-265",
    title: "Newton Step 2D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take a full Newton step for a two-dimensional problem.\n\nCompute delta = -H^{-1} grad using the 2x2 inverse and return [x + delta, delta]. If det(H) is zero, return [x, [0.0, 0.0]] with x unchanged.",
    starterCode: `def newton_step_2d(x, grad, H):
    # Returns [x_new, delta]
    # Your code here
    pass`,
    solution: `def newton_step_2d(x, grad, H):
    det = H[0][0] * H[1][1] - H[0][1] * H[1][0]
    if det == 0:
        return [list(x), [0.0, 0.0]]
    inv00 = H[1][1] / det
    inv01 = -H[0][1] / det
    inv10 = -H[1][0] / det
    inv11 = H[0][0] / det
    d0 = -(inv00 * grad[0] + inv01 * grad[1])
    d1 = -(inv10 * grad[0] + inv11 * grad[1])
    return [[x[0] + d0, x[1] + d1], [d0, d1]]`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 1.0], [[2.0, 0.0], [0.0, 4.0]]], expected: [[0.5, 1.75], [-0.5, -0.25]] },
      { input: [[0.0, 0.0], [2.0, -2.0], [[3.0, 1.0], [1.0, 2.0]]], expected: [[-1.2000000000000002, 1.6], [-1.2000000000000002, 1.6]] },
      { input: [[1.0, 1.0], [0.0, 0.0], [[1.0, 2.0], [2.0, 4.0]]], expected: [[1.0, 1.0], [0.0, 0.0]] },
      { input: [[-1.0, 0.5], [0.5, 0.5], [[1.0, 0.0], [0.0, 1.0]]], expected: [[-1.5, 0.0], [-0.5, -0.5]] },
    ],
    hint: "The 2x2 inverse swaps the diagonal, negates the off-diagonals, and divides by the determinant.",
  },
  {
    id: "op-266",
    title: "Gauss-Newton Step 2D",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one Gauss-Newton step for a two-dimensional least-squares problem.\n\nGiven the 2x2 Jacobian J and residual vector r, solve (J^T J) delta = J^T r and return [x - delta, delta]. If J^T J is singular, return [x, [0.0, 0.0]].",
    starterCode: `def gauss_newton_step_2d(x, J, r):
    # Returns [x_new, delta]
    # Your code here
    pass`,
    solution: `def gauss_newton_step_2d(x, J, r):
    a = J[0][0] * J[0][0] + J[1][0] * J[1][0]
    b = J[0][0] * J[0][1] + J[1][0] * J[1][1]
    c = b
    d = J[0][1] * J[0][1] + J[1][1] * J[1][1]
    g0 = J[0][0] * r[0] + J[1][0] * r[1]
    g1 = J[0][1] * r[0] + J[1][1] * r[1]
    det = a * d - b * c
    if det == 0:
        return [list(x), [0.0, 0.0]]
    d0 = (d * g0 - b * g1) / det
    d1 = (a * g1 - c * g0) / det
    return [[x[0] - d0, x[1] - d1], [d0, d1]]`,
    testCases: [
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [1.0, -2.0]], expected: [[-1.0, 2.0], [1.0, -2.0]] },
      { input: [[1.0, 1.0], [[1.0, 2.0], [3.0, 4.0]], [1.0, 1.0]], expected: [[2.0, 0.0], [-1.0, 1.0]] },
      { input: [[0.5, -0.5], [[1.0, 0.0], [0.0, 0.0]], [2.0, 3.0]], expected: [[0.5, -0.5], [0.0, 0.0]] },
      { input: [[1.0, 2.0], [[2.0, 0.0], [1.0, 1.0]], [0.0, 0.0]], expected: [[1.0, 2.0], [0.0, 0.0]] },
    ],
    hint: "Assemble J^T J and J^T r, then solve the 2x2 system for delta.",
  },
  {
    id: "op-267",
    title: "LM Damping Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Adjust the Levenberg-Marquardt damping parameter after a trial step.\n\nIf ratio < 0.25 multiply lam by grow; if ratio > 0.75 multiply lam by shrink; otherwise keep lam unchanged. Return [lam_new, accepted] where accepted is the boolean ratio > 0.0.",
    starterCode: `def lm_damping_update(lam, ratio, grow, shrink):
    # Returns [lam_new, accepted]
    # Your code here
    pass`,
    solution: `def lm_damping_update(lam, ratio, grow, shrink):
    if ratio < 0.25:
        lam = lam * grow
    elif ratio > 0.75:
        lam = lam * shrink
    return [lam, ratio > 0.0]`,
    testCases: [
      { input: [1.0, 0.1, 2.0, 0.5], expected: [2.0, true] },
      { input: [1.0, 0.9, 2.0, 0.5], expected: [0.5, true] },
      { input: [1.0, 0.5, 2.0, 0.5], expected: [1.0, true] },
      { input: [4.0, -0.2, 10.0, 0.1], expected: [40.0, false] },
    ],
    hint: "Poor steps increase damping; very good steps decrease it.",
  },
  {
    id: "op-268",
    title: "Elastic Net Proximal Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Apply the proximal operator of the elastic net after a gradient step.\n\nCompute z = (w - lr * grad) / (1 + lr * l2), then soft-threshold z at t = lr * l1. Return z - t when z > t, z + t when z < -t, and 0.0 otherwise.",
    starterCode: `def elastic_net_prox(w, grad, lr, l1, l2):
    # Your code here
    pass`,
    solution: `def elastic_net_prox(w, grad, lr, l1, l2):
    z = (w - lr * grad) / (1 + lr * l2)
    t = lr * l1
    if z > t:
        return z - t
    if z < -t:
        return z + t
    return 0.0`,
    testCases: [
      { input: [1.0, 0.5, 0.1, 0.1, 0.2], expected: 0.9213725490196077 },
      { input: [0.05, 0.0, 0.1, 1.0, 0.0], expected: 0.0 },
      { input: [-2.0, -0.5, 0.1, 0.2, 0.5], expected: -1.837142857142857 },
      { input: [0.0, 0.0, 0.1, 0.5, 1.0], expected: 0.0 },
    ],
    hint: "The L2 part shrinks multiplicatively before the L1 soft threshold.",
  },
  {
    id: "op-269",
    title: "FISTA Momentum Coefficient",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the next FISTA momentum coefficient from the current scalar t_k.\n\nSet t_next = (1 + sqrt(1 + 4 * t_k^2)) / 2 and return [t_next, (t_k - 1) / t_next], the coefficient used to extrapolate the next FISTA iterate. Starting from t_0 = 1 gives the familiar 2/3 style acceleration schedule.",
    starterCode: `def fista_momentum(t_k):
    # Returns [t_next, momentum]
    # Your code here
    pass`,
    solution: `def fista_momentum(t_k):
    t_next = (1 + (1 + 4 * t_k * t_k) ** 0.5) / 2
    return [t_next, (t_k - 1) / t_next]`,
    testCases: [
      { input: [1.0], expected: [1.618033988749895, 0.0] },
      { input: [2.0], expected: [2.5615528128088303, 0.3903882032022076] },
      { input: [0.5], expected: [1.2071067811865475, -0.4142135623730951] },
      { input: [10.0], expected: [10.512492197250394, 0.8561242977525353] },
    ],
    hint: "The sequence approaches momentum 1 as t_k grows.",
  },
  {
    id: "op-270",
    title: "ADMM Residual Norms",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the primal and dual residuals of an ADMM step.\n\nReturn [primal, dual] where primal = ||x - z|| and dual = rho * ||z - z_prev||. These are the standard quantities compared against tolerances for stopping.",
    starterCode: `def admm_residual_norms(x, z, z_prev, rho):
    # Returns [primal, dual]
    # Your code here
    pass`,
    solution: `def admm_residual_norms(x, z, z_prev, rho):
    pr = 0.0
    dr = 0.0
    for i in range(len(x)):
        pr = pr + (x[i] - z[i]) ** 2
        dr = dr + (z[i] - z_prev[i]) ** 2
    return [pr ** 0.5, rho * (dr ** 0.5)]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 1.5], [0.0, 1.0], 1.0], expected: [0.7071067811865476, 0.7071067811865476] },
      { input: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 2.0], expected: [0.0, 0.0] },
      { input: [[1.0, -1.0], [1.0, -1.0], [0.5, -0.5], 0.5], expected: [0.0, 0.3535533905932738] },
    ],
    hint: "The dual residual measures how much z changed from the previous iteration.",
  },
  {
    id: "op-271",
    title: "Projected Mirror Descent Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform a mirror descent step with the Euclidean mirror map, then project onto the probability simplex.\n\nCompute y = x - lr * g and return the Euclidean projection of y onto the set of non-negative vectors summing to 1. The projection subtracts a threshold computed from the sorted coordinates; if every sorted test fails, return the one-hot vector at the largest coordinate.",
    starterCode: `def projected_mirror_descent_step(x, g, lr):
    # Your code here
    pass`,
    solution: `def projected_mirror_descent_step(x, g, lr):
    y = [x[i] - lr * g[i] for i in range(len(x))]
    u = sorted(y, reverse=True)
    css = 0.0
    rho = 0
    theta = 0.0
    for i in range(len(u)):
        css = css + u[i]
        if u[i] - (css - 1.0) / (i + 1) > 0:
            rho = i + 1
            theta = (css - 1.0) / rho
        else:
            break
    if rho == 0:
        best = 0
        for i in range(1, len(y)):
            if y[i] > y[best]:
                best = i
        return [1.0 if i == best else 0.0 for i in range(len(y))]
    return [max(y[i] - theta, 0.0) for i in range(len(y))]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, -1.0], 0.2], expected: [0.3, 0.7] },
      { input: [[0.2, 0.3, 0.5], [0.0, 0.0, 0.0], 0.5], expected: [0.2, 0.3, 0.5] },
      { input: [[0.9, 0.1], [-2.0, 1.0], 0.3], expected: [1.0, 0.0] },
      { input: [[0.4, 0.4, 0.2], [0.1, 0.1, 0.1], 0.5], expected: [0.4, 0.4, 0.19999999999999998] },
    ],
    hint: "Sort descending, find the largest active prefix, and subtract its threshold.",
  },
  {
    id: "op-272",
    title: "Exponentiated Gradient Time-Varying",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Perform an exponentiated gradient update with a time-varying learning rate.\n\nUse eta = eta0 / sqrt(t) with t at least 1, compute u_i proportional to w_i * exp(-eta * g_i), and return the normalized weights, which stay on the probability simplex. A larger t means a smaller step.",
    starterCode: `def exp_gradient_tv(w, g, eta0, t):
    # Your code here
    pass`,
    solution: `def exp_gradient_tv(w, g, eta0, t):
    import math
    if t < 1:
        t = 1
    eta = eta0 / (t ** 0.5)
    u = [w[i] * math.exp(-eta * g[i]) for i in range(len(w))]
    total = sum(u)
    return [v / total for v in u]`,
    testCases: [
      { input: [[0.5, 0.5], [0.4, -0.4], 0.1, 1], expected: [0.4800106598444182, 0.5199893401555817] },
      { input: [[0.2, 0.3, 0.5], [0.0, 0.0, 0.0], 1.0, 4], expected: [0.2, 0.3, 0.5] },
      { input: [[0.9, 0.1], [-2.0, 1.0], 0.5, 16], expected: [0.9290524666899646, 0.0709475333100355] },
    ],
    hint: "The multiplicative update is the mirror descent step under the KL divergence.",
  },
  {
    id: "op-273",
    title: "OMD Regret Term",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the linearized regret accumulated by an online mirror descent player.\n\nGiven per-round gradient vectors grads, the played weights weights, and a fixed comparator u, return the sum over rounds t and coordinates i of grads[t][i] * (weights[t][i] - u[i]).",
    starterCode: `def omd_regret_term(grads, weights, u):
    # Your code here
    pass`,
    solution: `def omd_regret_term(grads, weights, u):
    total = 0.0
    for t in range(len(grads)):
        for i in range(len(grads[t])):
            total = total + grads[t][i] * (weights[t][i] - u[i])
    return total`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [0.4, 0.6]], [0.5, 0.5]], expected: 0.09999999999999998 },
      { input: [[[1.0, 2.0]], [[0.2, 0.8]], [0.5, 0.5]], expected: 0.3000000000000001 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0.1, 0.9], [0.3, 0.7]], [0.5, 0.5]], expected: 0.0 },
    ],
    hint: "This is the linearized regret, where each round charges the gradient at the played point.",
  },
  {
    id: "op-274",
    title: "Online Gradient Descent Regret Bound",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the standard online gradient descent regret bound.\n\nReturn D * G * sqrt(T) for a convex domain of diameter D, a gradient norm bound G, and T rounds. Return 0.0 when T < 1, D <= 0, or G <= 0.",
    starterCode: `def ogd_regret_bound(D, G, T):
    # Your code here
    pass`,
    solution: `def ogd_regret_bound(D, G, T):
    if T < 1 or D <= 0 or G <= 0:
        return 0.0
    return D * G * (T ** 0.5)`,
    testCases: [
      { input: [1.0, 2.0, 100], expected: 20.0 },
      { input: [0.5, 1.0, 10], expected: 1.5811388300841898 },
      { input: [1.0, 1.0, 0], expected: 0.0 },
      { input: [2.0, 0.0, 50], expected: 0.0 },
    ],
    hint: "The bound grows with the square root of the horizon.",
  },
  {
    id: "op-275",
    title: "AdaGrad Regret Bound",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the AdaGrad regret bound for convex Lipschitz losses.\n\nReturn 2 * D * sqrt(sum of squared gradient norms), where D is the diameter and grad_norms_sq lists the squared norm ||g_t||^2 of each round. Return 0.0 when D <= 0 or the list is empty.",
    starterCode: `def adagrad_regret_bound(D, grad_norms_sq):
    # Your code here
    pass`,
    solution: `def adagrad_regret_bound(D, grad_norms_sq):
    if D <= 0 or not grad_norms_sq:
        return 0.0
    total = 0.0
    for v in grad_norms_sq:
        total = total + v
    return 2.0 * D * (total ** 0.5)`,
    testCases: [
      { input: [1.0, [1.0, 1.0, 1.0, 1.0]], expected: 4.0 },
      { input: [0.5, [4.0, 9.0]], expected: 3.605551275463989 },
      { input: [1.0, []], expected: 0.0 },
      { input: [0.0, [1.0]], expected: 0.0 },
    ],
    hint: "AdaGrad replaces the T factor with the accumulated squared gradient norms.",
  },
];
