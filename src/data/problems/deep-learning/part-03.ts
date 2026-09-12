import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-051",
    title: "SiLU (Swish)",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the SiLU (swish) activation element-wise: f(x) = x * sigmoid(x).\n\nThe signature is silu(x). Use a numerically stable sigmoid and return a list of the same length.",
    starterCode: `import math
def silu(x):
    # Your code here
    pass`,
    solution: `import math
def silu(x):
    out = []
    for v in x:
        if v >= 0:
            s = 1.0 / (1.0 + math.exp(-v))
        else:
            e = math.exp(v)
            s = e / (1.0 + e)
        out.append(v * s)
    return out`,
    testCases: [
      { input: [[0.0]], expected: [0.0] },
      { input: [[1.0, -1.0]], expected: [0.7310585786, -0.2689414214] },
      { input: [[2.0, -2.0, 0.5]], expected: [1.761594156, -0.238405844, 0.3112296656] },
      { input: [[100.0, -100.0]], expected: [100.0, 0.0] },
    ],
    hint: "Multiply each value by its sigmoid; for large negatives the product vanishes.",
  },
  {
    id: "dl-052",
    title: "Softplus",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the softplus activation element-wise: softplus(x) = log(1 + exp(x)), computed as max(x, 0) + log1p(exp(-|x|)) so large magnitudes do not overflow.\n\nThe signature is softplus(x).",
    starterCode: `import math
def softplus(x):
    # Your code here
    pass`,
    solution: `import math
def softplus(x):
    return [max(v, 0.0) + math.log1p(math.exp(-abs(v))) for v in x]`,
    testCases: [
      { input: [[0.0]], expected: [0.6931471806] },
      { input: [[1.0, -1.0]], expected: [1.3132616875, 0.3132616875] },
      { input: [[1000.0, -1000.0]], expected: [1000.0, 0.0] },
      { input: [[2.0, 3.0]], expected: [2.126928011, 3.0485873516] },
    ],
    hint: "Softplus is a smooth ReLU; use log1p and the absolute value to stay stable.",
  },
  {
    id: "dl-053",
    title: "Running Variance Update",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Update a running variance estimate with exponential moving averaging: new_var = (1 - momentum) * running_var + momentum * batch_var.\n\nThe signature is running_var_update(running_var, batch_var, momentum).",
    starterCode: `def running_var_update(running_var, batch_var, momentum):
    # Your code here
    pass`,
    solution: `def running_var_update(running_var, batch_var, momentum):
    return (1.0 - momentum) * running_var + momentum * batch_var`,
    testCases: [
      { input: [0.0, 1.0, 0.1], expected: 0.1 },
      { input: [1.0, 0.0, 0.1], expected: 0.9 },
      { input: [0.5, 0.5, 0.9], expected: 0.5 },
      { input: [0.0, 4.0, 0.25], expected: 1.0 },
    ],
    hint: "Blend the old statistic with the batch statistic using the momentum coefficient.",
  },
  {
    id: "dl-054",
    title: "BatchNorm Momentum Update",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Update batch-norm running statistics: new = (1 - momentum) * old + momentum * batch, applied to both the mean and the variance.\n\nThe signature is batchnorm_momentum_update(running_mean, running_var, batch_mean, batch_var, momentum). Return [new_mean, new_var].",
    starterCode: `def batchnorm_momentum_update(running_mean, running_var, batch_mean, batch_var, momentum):
    # Your code here
    pass`,
    solution: `def batchnorm_momentum_update(running_mean, running_var, batch_mean, batch_var, momentum):
    r_mean = (1.0 - momentum) * running_mean + momentum * batch_mean
    r_var = (1.0 - momentum) * running_var + momentum * batch_var
    return [r_mean, r_var]`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 2.0, 0.1], expected: [0.1, 1.1] },
      { input: [0.0, 0.0, 0.0, 0.0, 0.5], expected: [0.0, 0.0] },
      { input: [2.0, 4.0, 3.0, 9.0, 0.25], expected: [2.25, 5.25] },
      { input: [1.0, 0.5, -1.0, 0.1, 0.9], expected: [-0.8, 0.14] },
    ],
    hint: "The same momentum coefficient is applied to the mean update and the variance update.",
  },
  {
    id: "dl-055",
    title: "He Init Variance",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the He/Kaiming normal initialization variance 2 / fan_in, which keeps activations well-scaled in ReLU networks.\n\nThe signature is he_variance(fan_in).",
    starterCode: `def he_variance(fan_in):
    # Your code here
    pass`,
    solution: `def he_variance(fan_in):
    return 2.0 / fan_in`,
    testCases: [
      { input: [2], expected: 1.0 },
      { input: [100], expected: 0.02 },
      { input: [128], expected: 0.015625 },
      { input: [512], expected: 0.00390625 },
    ],
    hint: "He variance is the square of the He standard deviation.",
  },
  {
    id: "dl-056",
    title: "Sparsity Ratio",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of zero entries in a 2D weight matrix: the count of entries equal to 0 divided by the total number of entries.\n\nThe signature is sparsity_ratio(weights).",
    starterCode: `def sparsity_ratio(weights):
    # Your code here
    pass`,
    solution: `def sparsity_ratio(weights):
    zeros = 0
    total = 0
    for row in weights:
        for v in row:
            total += 1
            if v == 0.0:
                zeros += 1
    return zeros / total`,
    testCases: [
      { input: [[[0.0, 1.0], [2.0, 0.0]]], expected: 0.5 },
      { input: [[[0.0, 0.0, 0.0]]], expected: 1.0 },
      { input: [[[1.0, 2.0], [3.0, 4.0]]], expected: 0.0 },
      { input: [[[0.0, 1.0], [0.0, 1.0], [1.0, 1.0]]], expected: 0.3333333333 },
    ],
    hint: "Pruning creates sparsity; count exact zeros and divide by the total count.",
  },
  {
    id: "dl-057",
    title: "Model Size (MB)",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Estimate the storage size of a model in mebibytes: num_params * bytes_per_param / (1024 * 1024).\n\nThe signature is model_size_mb(num_params, bytes_per_param).",
    starterCode: `def model_size_mb(num_params, bytes_per_param):
    # Your code here
    pass`,
    solution: `def model_size_mb(num_params, bytes_per_param):
    return num_params * bytes_per_param / (1024.0 * 1024.0)`,
    testCases: [
      { input: [1000000, 4], expected: 3.8146972656 },
      { input: [7000000000.0, 2], expected: 13351.4404296875 },
      { input: [1024, 4], expected: 0.00390625 },
      { input: [1, 1], expected: 9.537e-07 },
    ],
    hint: "Float32 uses 4 bytes and float16 uses 2 bytes per parameter.",
  },
  {
    id: "dl-058",
    title: "Int8 Quantization Scale",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute a symmetric int8 quantization scale: max_abs / qmax, where qmax defaults to 127.\n\nThe signature is int8_scale(max_abs, qmax=127).",
    starterCode: `def int8_scale(max_abs, qmax=127):
    # Your code here
    pass`,
    solution: `def int8_scale(max_abs, qmax=127):
    return max_abs / qmax`,
    testCases: [
      { input: [1.0], expected: 0.0078740157 },
      { input: [2.55], expected: 0.0200787402 },
      { input: [0.0], expected: 0.0 },
      { input: [127.0, 127], expected: 1.0 },
    ],
    hint: "One scale maps the largest magnitude to the largest int8 code.",
  },
  {
    id: "dl-059",
    title: "Quantize Int8",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Quantize a list of floats to int8 with a symmetric scale: q_i = round(x_i / scale), clamped to [-128, 127].\n\nThe signature is quantize_int8(x, scale). Return the integer codes.",
    starterCode: `def quantize_int8(x, scale):
    # Your code here
    pass`,
    solution: `def quantize_int8(x, scale):
    out = []
    for v in x:
        q = int(round(v / scale))
        if q > 127:
            q = 127
        if q < -128:
            q = -128
        out.append(q)
    return out`,
    testCases: [
      { input: [[0.0, 0.1, -0.1], 0.1], expected: [0, 1, -1] },
      { input: [[100.0, -100.0], 0.5], expected: [127, -128] },
      { input: [[3.0, -3.0, 0.4], 1.0], expected: [3, -3, 0] },
      { input: [[1.4, -1.6], 0.5], expected: [3, -3] },
    ],
    hint: "Round first, then saturate at the int8 bounds.",
  },
  {
    id: "dl-060",
    title: "Dequantize Int8",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Dequantize a list of int8 codes back to floats: x_i = q_i * scale.\n\nThe signature is dequantize_int8(q, scale).",
    starterCode: `def dequantize_int8(q, scale):
    # Your code here
    pass`,
    solution: `def dequantize_int8(q, scale):
    return [v * scale for v in q]`,
    testCases: [
      { input: [[0, 1, -1], 0.1], expected: [0.0, 0.1, -0.1] },
      { input: [[127, -128], 0.5], expected: [63.5, -64.0] },
      { input: [[2], 0.25], expected: [0.5] },
      { input: [[0], 1.0], expected: [0.0] },
    ],
    hint: "Dequantization is a single multiply per code, undoing the quantization scale.",
  },
  {
    id: "dl-061",
    title: "Top-3 Accuracy",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute top-3 accuracy: the fraction of rows whose target index is among the three largest logits. Break ties in favor of the smaller index.\n\nThe signature is top3_accuracy(logits, targets). logits is a 2D matrix and targets has one id per row.",
    starterCode: `def top3_accuracy(logits, targets):
    # Your code here
    pass`,
    solution: `def top3_accuracy(logits, targets):
    correct = 0
    for i, row in enumerate(logits):
        order = sorted(range(len(row)), key=lambda j: (-row[j], j))
        if targets[i] in order[:3]:
            correct += 1
    return correct / len(targets)`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]], [2, 0]], expected: 1.0 },
      { input: [[[1.0, 2.0, 3.0, 4.0], [4.0, 3.0, 2.0, 1.0]], [0, 0]], expected: 0.5 },
      { input: [[[0.0, 0.0, 0.0]], [2]], expected: 1.0 },
      { input: [[[5.0]], [0]], expected: 1.0 },
    ],
    hint: "Sort indices by descending logit with index as the deterministic tie-breaker, then keep the first three.",
  },
  {
    id: "dl-062",
    title: "Confidence Margin",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the confidence margin: the largest softmax probability minus the second largest for a vector of logits. Use a stable softmax.\n\nThe signature is confidence_margin(logits).",
    starterCode: `import math
def confidence_margin(logits):
    # Your code here
    pass`,
    solution: `import math
def confidence_margin(logits):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    p = sorted([e / total for e in exps], reverse=True)
    return p[0] - p[1]`,
    testCases: [
      { input: [[1.0, 1.0]], expected: 0.0 },
      { input: [[2.0, 0.0]], expected: 0.761594156 },
      { input: [[0.0, 0.0, 0.0]], expected: 0.0 },
      { input: [[10.0, 0.0]], expected: 0.9999092043 },
    ],
    hint: "A large margin means the model strongly prefers one class over the runner-up.",
  },
  {
    id: "dl-063",
    title: "Parameter Norm L2",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the global L2 norm of a 2D parameter matrix: the square root of the sum of squared entries.\n\nThe signature is param_norm_l2(params).",
    starterCode: `import math
def param_norm_l2(params):
    # Your code here
    pass`,
    solution: `import math
def param_norm_l2(params):
    total = 0.0
    for row in params:
        for v in row:
            total += v * v
    return math.sqrt(total)`,
    testCases: [
      { input: [[[3.0, 4.0]]], expected: 5.0 },
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: 1.4142135624 },
      { input: [[[0.0, 0.0], [0.0, 0.0]]], expected: 0.0 },
      { input: [[[1.0, -2.0, 2.0]]], expected: 3.0 },
    ],
    hint: "Sum the squares of every entry before taking the square root.",
  },
  {
    id: "dl-064",
    title: "Checkpoint Averaging",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Average a list of weight checkpoints element-wise (a simple model soup): the mean over checkpoints for each parameter position.\n\nThe signature is checkpoint_average(checkpoints). Each checkpoint is a vector of the same length.",
    starterCode: `def checkpoint_average(checkpoints):
    # Your code here
    pass`,
    solution: `def checkpoint_average(checkpoints):
    n = len(checkpoints[0])
    out = []
    for j in range(n):
        out.append(sum(c[j] for c in checkpoints) / len(checkpoints))
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]]], expected: [2.0, 3.0] },
      { input: [[[0.0, 0.0], [2.0, 2.0], [4.0, 4.0]]], expected: [2.0, 2.0] },
      { input: [[[1.0]]], expected: [1.0] },
      { input: [[[1.0, 2.0], [5.0, 5.0], [-3.0, -4.0]]], expected: [1.0, 1.0] },
    ],
    hint: "Average parameter by parameter across the checkpoint list.",
  },
  {
    id: "dl-065",
    title: "EMA of Weights",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Update an exponential moving average of the weights: ema_new = decay * ema + (1 - decay) * new_weights.\n\nThe signature is ema_update(ema_weights, new_weights, decay).",
    starterCode: `def ema_update(ema_weights, new_weights, decay):
    # Your code here
    pass`,
    solution: `def ema_update(ema_weights, new_weights, decay):
    return [decay * ema_weights[i] + (1.0 - decay) * new_weights[i] for i in range(len(ema_weights))]`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 4.0], 0.9], expected: [1.2, 2.2] },
      { input: [[0.0], [1.0], 0.5], expected: [0.5] },
      { input: [[1.0, 1.0], [0.0, 0.0], 0.25], expected: [0.25, 0.25] },
      { input: [[0.0, 0.0], [1.0, 1.0], 1.0], expected: [0.0, 0.0] },
    ],
    hint: "A decay near 1 keeps the old average while slowly tracking new weights.",
  },
  {
    id: "dl-066",
    title: "Gradient Accumulation Steps",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the number of optimizer steps per epoch with gradient accumulation: first micro_batches = ceil(total_samples / batch_size), then optimizer_steps = ceil(micro_batches / accum_steps).\n\nThe signature is grad_accum_steps(total_samples, batch_size, accum_steps). Return an integer.",
    starterCode: `def grad_accum_steps(total_samples, batch_size, accum_steps):
    # Your code here
    pass`,
    solution: `def grad_accum_steps(total_samples, batch_size, accum_steps):
    micro = (total_samples + batch_size - 1) // batch_size
    return (micro + accum_steps - 1) // accum_steps`,
    testCases: [
      { input: [1000, 10, 4], expected: 25 },
      { input: [1001, 10, 4], expected: 26 },
      { input: [8, 4, 2], expected: 1 },
      { input: [0, 10, 4], expected: 0 },
      { input: [7, 3, 2], expected: 2 },
    ],
    hint: "Round up twice: once for micro-batches and once for accumulation groups.",
  },
  {
    id: "dl-067",
    title: "GELU Exact (Erf)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the exact GELU activation element-wise: f(x) = 0.5 * x * (1 + erf(x / sqrt(2))), using math.erf.\n\nThe signature is exact_gelu(x). Return a list.",
    starterCode: `import math
def exact_gelu(x):
    # Your code here
    pass`,
    solution: `import math
def exact_gelu(x):
    return [0.5 * v * (1.0 + math.erf(v / math.sqrt(2.0))) for v in x]`,
    testCases: [
      { input: [[0.0]], expected: [0.0] },
      { input: [[1.0, -1.0]], expected: [0.8413447461, -0.1586552539] },
      { input: [[2.0, -2.0, 0.5]], expected: [1.9544997361, -0.0455002639, 0.3457312306] },
      { input: [[3.0, -3.0]], expected: [2.9959503059, -0.0040496941] },
    ],
    hint: "The exact GELU uses the error function, not tanh; the CDF of a standard normal appears here.",
  },
  {
    id: "dl-068",
    title: "Mish",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the mish activation element-wise: f(x) = x * tanh(softplus(x)), where softplus is computed stably as max(x, 0) + log1p(exp(-|x|)).\n\nThe signature is mish(x).",
    starterCode: `import math
def mish(x):
    # Your code here
    pass`,
    solution: `import math
def mish(x):
    out = []
    for v in x:
        sp = max(v, 0.0) + math.log1p(math.exp(-abs(v)))
        out.append(v * math.tanh(sp))
    return out`,
    testCases: [
      { input: [[0.0]], expected: [0.0] },
      { input: [[1.0, -1.0]], expected: [0.8650983883, -0.3034014614] },
      { input: [[2.0, -2.0, 0.5]], expected: [1.9439589595, -0.2525014827, 0.3752452113] },
      { input: [[100.0, -100.0]], expected: [100.0, 0.0] },
    ],
    hint: "Mish is x times the tanh of softplus, so it is smooth and non-monotonic near zero.",
  },
  {
    id: "dl-069",
    title: "GELU Derivative (Approx)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Derivative of the tanh-approximated GELU: with u = sqrt(2/pi) * (x + 0.044715 * x^3) and t = tanh(u), the derivative is 0.5 * (1 + t) + 0.5 * x * (1 - t^2) * du/dx, where du/dx = sqrt(2/pi) * (1 + 3 * 0.044715 * x^2).\n\nThe signature is gelu_derivative(x).",
    starterCode: `import math
def gelu_derivative(x):
    # Your code here
    pass`,
    solution: `import math
def gelu_derivative(x):
    c = math.sqrt(2.0 / math.pi)
    out = []
    for v in x:
        u = c * (v + 0.044715 * v * v * v)
        t = math.tanh(u)
        du = c * (1.0 + 3.0 * 0.044715 * v * v)
        out.append(0.5 * (1.0 + t) + 0.5 * v * (1.0 - t * t) * du)
    return out`,
    testCases: [
      { input: [[0.0]], expected: [0.5] },
      { input: [[1.0, -1.0]], expected: [1.0829640838, -0.0829640838] },
      { input: [[2.0, -2.0, 0.5]], expected: [1.0860992566, -0.0860992566, 0.8673699035] },
      { input: [[-3.0]], expected: [-0.0115841666] },
    ],
    hint: "Differentiate the product 0.5*x*(1+tanh(u)) with the chain rule on u.",
  },
  {
    id: "dl-070",
    title: "Group Norm Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Group normalization over channel groups. Split the channels into num_groups contiguous groups, compute the mean and biased variance over all features in each group, normalize, then scale by per-channel gamma and shift by per-channel beta.\n\nThe signature is group_norm_forward(x, gamma, beta, num_groups, eps=1e-5). x has shape (channels, features) and gamma/beta have length channels.",
    starterCode: `import math
def group_norm_forward(x, gamma, beta, num_groups, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def group_norm_forward(x, gamma, beta, num_groups, eps=1e-5):
    c = len(x)
    per = c // num_groups
    out = [[0.0] * len(x[row]) for row in range(c)]
    for g in range(num_groups):
        vals = []
        for ch in range(g * per, (g + 1) * per):
            vals.extend(x[ch])
        n = len(vals)
        mean = sum(vals) / n
        var = sum((v - mean) ** 2 for v in vals) / n
        inv = 1.0 / math.sqrt(var + eps)
        for ch in range(g * per, (g + 1) * per):
            for j in range(len(x[ch])):
                out[ch][j] = gamma[ch] * (x[ch][j] - mean) * inv + beta[ch]
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [1.0, 1.0], [0.0, 0.0], 2], expected: [[-0.9999800006, 0.9999800006], [-0.9999800006, 0.9999800006]] },
      { input: [[[1.0, 2.0, 3.0, 4.0]], [1.0], [0.0], 1], expected: [[-1.34163542, -0.4472118067, 0.4472118067, 1.34163542]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [2.0, 3.0], [0.0, 0.0], 1], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [1.0, 1.0], [1.0, 0.0], 2], expected: [[1.99994e-05, 1.9999800006], [-0.9999800006, 0.9999800006]] },
    ],
    hint: "All channels in a group share one mean and variance; gamma and beta are still per channel.",
  },
  {
    id: "dl-071",
    title: "Instance Norm Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Instance normalization: normalize each channel independently over its features using the biased mean and variance, then scale by gamma[c] and shift by beta[c].\n\nThe signature is instance_norm_forward(x, gamma, beta, eps=1e-5). x has shape (channels, features).",
    starterCode: `import math
def instance_norm_forward(x, gamma, beta, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def instance_norm_forward(x, gamma, beta, eps=1e-5):
    out = []
    for c in range(len(x)):
        row = x[c]
        n = len(row)
        mean = sum(row) / n
        var = sum((v - mean) ** 2 for v in row) / n
        inv = 1.0 / math.sqrt(var + eps)
        out.append([gamma[c] * (row[j] - mean) * inv + beta[c] for j in range(n)])
    return out`,
    testCases: [
      { input: [[[0.0, 2.0], [4.0, 6.0]], [1.0, 1.0], [0.0, 0.0]], expected: [[-0.999995, 0.999995], [-0.999995, 0.999995]] },
      { input: [[[1.0, 2.0, 3.0]], [2.0], [1.0]], expected: [[-1.4494713718, 1.0, 3.4494713718]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [1.0, 1.0], [0.0, 0.0]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0.5, 2.0], [1.0, -1.0]], expected: [[0.5000099997, 1.4999900003], [-2.9999600012, 0.9999600012]] },
    ],
    hint: "Instance norm is exactly group norm with one group per channel.",
  },
  {
    id: "dl-072",
    title: "Layer Scale Apply",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply LayerScale to a matrix: multiply each column j by the learned per-channel scale gamma[j], which is typically initialized near zero so residual branches start as identity.\n\nThe signature is layer_scale_apply(x, gamma). x has shape (rows, features) and gamma has length features.",
    starterCode: `def layer_scale_apply(x, gamma):
    # Your code here
    pass`,
    solution: `def layer_scale_apply(x, gamma):
    return [[x[i][j] * gamma[j] for j in range(len(gamma))] for i in range(len(x))]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [0.1, 0.2]], expected: [[0.1, 0.4], [0.3, 0.8]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [1.0, 1.0]], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[[-1.0, 2.0]], [0.5, -2.0]], expected: [[-0.5, -4.0]] },
      { input: [[[0.0, 0.0], [5.0, 6.0]], [2.0, 3.0]], expected: [[0.0, 0.0], [10.0, 18.0]] },
    ],
    hint: "This is a column-wise multiply by the gamma vector, applied to every row.",
  },
  {
    id: "dl-073",
    title: "Multi-Query Attention Repeat KV",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Expand grouped-query / multi-query key-value heads. Each KV head is a matrix of shape (seq_len, head_dim); repeat each head consecutively num_repeats times so the result lines up with the query heads.\n\nThe signature is repeat_kv(kv_heads, num_repeats). Return a list of head matrices.",
    starterCode: `def repeat_kv(kv_heads, num_repeats):
    # Your code here
    pass`,
    solution: `def repeat_kv(kv_heads, num_repeats):
    out = []
    for head in kv_heads:
        for _ in range(num_repeats):
            out.append([list(row) for row in head])
    return out`,
    testCases: [
      { input: [[[[1.0, 2.0]]], 2], expected: [[[1.0, 2.0]], [[1.0, 2.0]]] },
      { input: [[[[1.0], [2.0]]], 3], expected: [[[1.0], [2.0]], [[1.0], [2.0]], [[1.0], [2.0]]] },
      { input: [[[[1.0, 2.0], [3.0, 4.0]]], 1], expected: [[[1.0, 2.0], [3.0, 4.0]]] },
      { input: [[[[1.0, 2.0]], [[3.0, 4.0]]], 2], expected: [[[1.0, 2.0]], [[1.0, 2.0]], [[3.0, 4.0]], [[3.0, 4.0]]] },
    ],
    hint: "Each KV head serves num_repeats consecutive query heads, so copies stay adjacent.",
  },
  {
    id: "dl-074",
    title: "Embedding Bag Sum",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Sum embedding rows per bag. Bag k covers indices from offsets[k] up to offsets[k + 1], or to the end for the last bag. Return one summed vector per bag.\n\nThe signature is embedding_bag_sum(indices, offsets, table).",
    starterCode: `def embedding_bag_sum(indices, offsets, table):
    # Your code here
    pass`,
    solution: `def embedding_bag_sum(indices, offsets, table):
    out = []
    dim = len(table[0])
    for k, start in enumerate(offsets):
        end = offsets[k + 1] if k + 1 < len(offsets) else len(indices)
        row = [0.0] * dim
        for idx in indices[start:end]:
            for j in range(dim):
                row[j] += table[idx][j]
        out.append(row)
    return out`,
    testCases: [
      { input: [[0, 1, 2, 1], [0, 2], [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[4.0, 6.0], [8.0, 10.0]] },
      { input: [[0, 0], [0], [[1.0, 2.0]]], expected: [[2.0, 4.0]] },
      { input: [[1, 0, 1], [0, 1], [[1.0, 0.0], [0.0, 1.0]]], expected: [[0.0, 1.0], [1.0, 1.0]] },
      { input: [[2, 2, 2], [0, 1, 2], [[1.0], [2.0], [3.0]]], expected: [[3.0], [3.0], [3.0]] },
    ],
    hint: "Offsets mark bag starts; sliced ranges are contiguous in the indices list.",
  },
  {
    id: "dl-075",
    title: "KV Cache Size",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the byte size of the key-value cache: 2 (K and V) * num_layers * batch_size * num_kv_heads * seq_len * head_dim * bytes_per_value.\n\nThe signature is kv_cache_bytes(num_layers, num_kv_heads, head_dim, seq_len, batch_size=1, bytes_per_value=2). Return an integer.",
    starterCode: `def kv_cache_bytes(num_layers, num_kv_heads, head_dim, seq_len, batch_size=1, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def kv_cache_bytes(num_layers, num_kv_heads, head_dim, seq_len, batch_size=1, bytes_per_value=2):
    return 2 * num_layers * batch_size * num_kv_heads * seq_len * head_dim * bytes_per_value`,
    testCases: [
      { input: [12, 12, 64, 512], expected: 18874368 },
      { input: [32, 8, 128, 2048, 1, 2], expected: 268435456 },
      { input: [1, 1, 4, 10, 1, 4], expected: 320 },
      { input: [6, 6, 32, 100, 2, 2], expected: 921600 },
    ],
    hint: "The cache stores both keys and values for every layer and KV head.",
  },
  {
    id: "dl-076",
    title: "Pruning Mask Apply",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply a pruning mask to a weight matrix element-wise: pruned_weights[i][j] = weights[i][j] * mask[i][j].\n\nThe signature is apply_pruning_mask(weights, mask). Both matrices have the same shape.",
    starterCode: `def apply_pruning_mask(weights, mask):
    # Your code here
    pass`,
    solution: `def apply_pruning_mask(weights, mask):
    return [[weights[i][j] * mask[i][j] for j in range(len(weights[i]))] for i in range(len(weights))]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[1.0, 0.0], [0.0, 4.0]] },
      { input: [[[1.0, 2.0]], [[0.0, 0.0]]], expected: [[0.0, 0.0]] },
      { input: [[[-1.0, 2.0], [3.0, -4.0]], [[1.0, 1.0], [1.0, 1.0]]], expected: [[-1.0, 2.0], [3.0, -4.0]] },
      { input: [[[2.0, 3.0], [-5.0, 6.0]], [[0.0, 1.0], [0.0, 0.0]]], expected: [[0.0, 3.0], [0.0, 0.0]] },
    ],
    hint: "A mask entry of 1 keeps the weight and 0 zeroes it out.",
  },
  {
    id: "dl-077",
    title: "Per-Channel Quant Scale",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute per-channel symmetric int8 quantization scales: for each row (channel) of the weight matrix, return max(abs(row)) / qmax.\n\nThe signature is per_channel_quant_scale(weights, qmax=127).",
    starterCode: `def per_channel_quant_scale(weights, qmax=127):
    # Your code here
    pass`,
    solution: `def per_channel_quant_scale(weights, qmax=127):
    return [max(abs(v) for v in row) / qmax for row in weights]`,
    testCases: [
      { input: [[[1.0, -2.0], [4.0, 4.0]]], expected: [0.0157480315, 0.031496063] },
      { input: [[[0.0, 0.0]]], expected: [0.0] },
      { input: [[[3.0, 4.0], [-1.0, 0.5]]], expected: [0.031496063, 0.0078740157] },
      { input: [[[1.0, 0.0], [0.0, 8.0]], 100], expected: [0.01, 0.08] },
    ],
    hint: "Per-channel scales give each output channel its own dynamic range.",
  },
  {
    id: "dl-078",
    title: "Top-P Nucleus Filter",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Nucleus (top-p) sampling filter. Compute the stable softmax over the logits, sort indices by descending probability (ties by smaller index), and keep the smallest prefix whose cumulative probability reaches p. Return the kept indices sorted in ascending order.\n\nThe signature is top_p_filter(logits, p).",
    starterCode: `import math
def top_p_filter(logits, p):
    # Your code here
    pass`,
    solution: `import math
def top_p_filter(logits, p):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    probs = [e / total for e in exps]
    order = sorted(range(len(logits)), key=lambda i: (-probs[i], i))
    keep = []
    cum = 0.0
    for i in order:
        keep.append(i)
        cum += probs[i]
        if cum >= p:
            break
    return sorted(keep)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.9], expected: [1, 2] },
      { input: [[1.0, 2.0, 3.0], 0.5], expected: [2] },
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0, 1, 2] },
      { input: [[0.0, 0.0, 0.0], 0.7], expected: [0, 1, 2] },
      { input: [[0.0, 0.0, 0.0], 0.5], expected: [0, 1] },
    ],
    hint: "Always keep at least the most likely token, even when its probability already exceeds p.",
  },
  {
    id: "dl-079",
    title: "CTRL-Style Repetition Penalty",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Apply the CTRL-style repetition penalty to logits: for each token id already generated, divide its logit by penalty when positive and multiply it by penalty when negative; other logits stay unchanged.\n\nThe signature is repetition_penalty(logits, generated_ids, penalty). Return a copy of the logits.",
    starterCode: `def repetition_penalty(logits, generated_ids, penalty):
    # Your code here
    pass`,
    solution: `def repetition_penalty(logits, generated_ids, penalty):
    out = list(logits)
    for t in generated_ids:
        if 0 <= t < len(out):
            if out[t] > 0:
                out[t] = out[t] / penalty
            else:
                out[t] = out[t] * penalty
    return out`,
    testCases: [
      { input: [[1.0, -1.0, 0.5], [0, 1], 2.0], expected: [0.5, -2.0, 0.5] },
      { input: [[2.0, 2.0], [1], 1.0], expected: [2.0, 2.0] },
      { input: [[0.0, -3.0], [0], 1.5], expected: [0.0, -3.0] },
      { input: [[4.0, 2.0, -2.0], [0, 2], 2.0], expected: [2.0, 2.0, -4.0] },
    ],
    hint: "Positive logits shrink and negative logits grow more negative, both discouraging repeats.",
  },
  {
    id: "dl-080",
    title: "No-Repeat N-Gram Block",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Ban tokens that would repeat an n-gram. Look at the last n - 1 generated tokens as the suffix; for every earlier occurrence of that suffix, ban the token that followed it by setting its logit to -1e9. For n = 1, ban every already-generated token.\n\nThe signature is no_repeat_ngram_block(logits, generated_ids, n). Return a copy of the logits.",
    starterCode: `def no_repeat_ngram_block(logits, generated_ids, n):
    # Your code here
    pass`,
    solution: `def no_repeat_ngram_block(logits, generated_ids, n):
    banned = set()
    if n == 1:
        banned.update(generated_ids)
    else:
        prefix = tuple(generated_ids[-(n - 1):])
        for i in range(len(generated_ids) - (n - 1)):
            if tuple(generated_ids[i:i + (n - 1)]) == prefix:
                nxt = i + (n - 1)
                if nxt < len(generated_ids):
                    banned.add(generated_ids[nxt])
    out = list(logits)
    for t in banned:
        if 0 <= t < len(out):
            out[t] = -1e9
    return out`,
    testCases: [
      { input: [[0.0, 0.0, 0.0, 0.0], [1, 2, 1], 2], expected: [0.0, 0.0, -1e9, 0.0] },
      { input: [[0.0, 0.0, 0.0], [0, 1], 1], expected: [-1e9, -1e9, 0.0] },
      { input: [[0.0, 0.0, 0.0, 0.0], [1, 2, 3], 3], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[0.0, 0.0, 0.0], [1, 1, 1], 2], expected: [0.0, -1e9, 0.0] },
    ],
    hint: "Compare the trailing (n - 1)-gram with every earlier window of the same length.",
  },
  {
    id: "dl-081",
    title: "Focal Loss (Multiclass)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the multiclass focal loss for one example: FL = -(1 - p_t)^gamma * log(p_t), where p_t is the stable-softmax probability of the target class.\n\nThe signature is multiclass_focal_loss(logits, target, gamma). gamma = 0 recovers plain cross-entropy.",
    starterCode: `import math
def multiclass_focal_loss(logits, target, gamma):
    # Your code here
    pass`,
    solution: `import math
def multiclass_focal_loss(logits, target, gamma):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    p = exps[target] / total
    return -((1.0 - p) ** gamma) * math.log(p)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2, 0.0], expected: 0.4076059644 },
      { input: [[1.0, 2.0, 3.0], 2, 2.0], expected: 0.045677799 },
      { input: [[0.0, 0.0, 0.0], 1, 1.0], expected: 0.7324081924 },
      { input: [[2.0, 1.0, 0.0], 0, 2.0], expected: 0.045677799 },
    ],
    hint: "The modulating factor (1 - p_t)^gamma down-weights easy, well-classified examples.",
  },
  {
    id: "dl-082",
    title: "Distillation KL",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Knowledge distillation loss: T^2 * KL(teacher || student), where KL = sum_k p_t[k] * (log p_t[k] - log p_s[k]) and both distributions come from stable log-softmax applied to logits / T.\n\nThe signature is distillation_kl(student_logits, teacher_logits, temperature).",
    starterCode: `import math
def distillation_kl(student_logits, teacher_logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def distillation_kl(student_logits, teacher_logits, temperature):
    def log_softmax(z):
        m = max(z)
        lse = m + math.log(sum(math.exp(v - m) for v in z))
        return [v - lse for v in z]

    s = log_softmax([v / temperature for v in student_logits])
    t = log_softmax([v / temperature for v in teacher_logits])
    kl = sum(math.exp(t[k]) * (t[k] - s[k]) for k in range(len(t)))
    return temperature * temperature * kl`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0], 1.0], expected: 0.0 },
      { input: [[0.0, 2.0], [2.0, 0.0], 1.0], expected: 1.5231883119 },
      { input: [[0.0, 0.0], [0.0, 0.0], 2.0], expected: 0.0 },
      { input: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], 2.0], expected: 0.3555882856 },
    ],
    hint: "The T^2 factor keeps the gradient magnitude comparable when softening with temperature.",
  },
  {
    id: "dl-083",
    title: "Mixup Loss from Logits",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Mixup training loss for one example: lam * CE(logits, y_a) + (1 - lam) * CE(logits, y_b), using stable cross-entropy for each label.\n\nThe signature is mixup_loss(logits, y_a, y_b, lam).",
    starterCode: `import math
def mixup_loss(logits, y_a, y_b, lam):
    # Your code here
    pass`,
    solution: `import math
def mixup_loss(logits, y_a, y_b, lam):
    def ce(target):
        m = max(logits)
        lse = m + math.log(sum(math.exp(v - m) for v in logits))
        return lse - logits[target]

    return lam * ce(y_a) + (1.0 - lam) * ce(y_b)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2, 0, 0.7], expected: 1.0076059644 },
      { input: [[1.0, 2.0, 3.0], 2, 0, 1.0], expected: 0.4076059644 },
      { input: [[1.0, 2.0, 3.0], 2, 0, 0.0], expected: 2.4076059644 },
      { input: [[0.0, 0.0], 0, 1, 0.5], expected: 0.6931471806 },
    ],
    hint: "The mixup coefficient blends the two one-hot cross-entropy terms.",
  },
  {
    id: "dl-084",
    title: "FGSM Attack Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "One fast gradient sign method step: x_adv = x + epsilon * sign(grad), where sign(0) = 0. Both x and grad are 2D matrices of the same shape.\n\nThe signature is fgsm_step(x, grad, epsilon).",
    starterCode: `def fgsm_step(x, grad, epsilon):
    # Your code here
    pass`,
    solution: `def fgsm_step(x, grad, epsilon):
    out = []
    for i in range(len(x)):
        row = []
        for j in range(len(x[i])):
            g = grad[i][j]
            sign = 1.0 if g > 0 else (-1.0 if g < 0 else 0.0)
            row.append(x[i][j] + epsilon * sign)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [1.0, -1.0]], [[1.0, 1.0], [1.0, -1.0]], 0.1], expected: [[1.1, 2.1], [1.1, -1.1]] },
      { input: [[[0.0], [5.0]], [[1.0], [1.0]], 0.5], expected: [[0.5], [5.5]] },
      { input: [[[-1.0, 1.0], [-1.0, 1.0]], [[-1.0, 1.0], [-1.0, 1.0]], 1.0], expected: [[-2.0, 2.0], [-2.0, 2.0]] },
      { input: [[[1.0], [0.0]], [[0.0], [0.0]], 0.5], expected: [[1.0], [0.0]] },
    ],
    hint: "FGSM moves every input in the direction that most increases the loss, by a fixed step.",
  },
  {
    id: "dl-085",
    title: "PGD Attack Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "One projected gradient descent attack step: x_adv = x + alpha * sign(grad), then project each entry back into the epsilon ball [x - epsilon, x + epsilon].\n\nThe signature is pgd_step(x, grad, epsilon, alpha). Both x and grad are 2D matrices.",
    starterCode: `def pgd_step(x, grad, epsilon, alpha):
    # Your code here
    pass`,
    solution: `def pgd_step(x, grad, epsilon, alpha):
    out = []
    for i in range(len(x)):
        row = []
        for j in range(len(x[i])):
            g = grad[i][j]
            sign = 1.0 if g > 0 else (-1.0 if g < 0 else 0.0)
            v = x[i][j] + alpha * sign
            lo = x[i][j] - epsilon
            hi = x[i][j] + epsilon
            if v < lo:
                v = lo
            if v > hi:
                v = hi
            row.append(v)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0], [1.0]], [[1.0], [1.0]], 0.1, 0.05], expected: [[1.05], [1.05]] },
      { input: [[[0.0], [1.0]], [[1.0], [1.0]], 0.5, 1.0], expected: [[0.5], [1.5]] },
      { input: [[[1.0], [0.0]], [[0.0], [0.0]], 0.2, 0.1], expected: [[1.0], [0.0]] },
      { input: [[[0.2], [1.0]], [[1.0], [1.0]], 0.5, 0.4], expected: [[0.6], [1.4]] },
    ],
    hint: "PGD is FGSM followed by a projection back into the allowed epsilon ball.",
  },
  {
    id: "dl-086",
    title: "Expected Calibration Error for Confidence Scores",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute expected calibration error with equal-width bins. Bin index is int(conf * num_bins) clamped to the last bin, each bin contributes (count / N) * |avg_confidence - avg_accuracy|.\n\nThe signature is expected_calibration_error(confidences, correct, num_bins=10). confidences are floats in [0, 1] and correct holds 0/1 values.",
    starterCode: `def expected_calibration_error(confidences, correct, num_bins=10):
    # Your code here
    pass`,
    solution: `def expected_calibration_error(confidences, correct, num_bins=10):
    bins = [[0.0, 0.0, 0] for _ in range(num_bins)]
    n = len(confidences)
    for i in range(n):
        b = int(confidences[i] * num_bins)
        if b >= num_bins:
            b = num_bins - 1
        if b < 0:
            b = 0
        bins[b][0] += confidences[i]
        bins[b][1] += correct[i]
        bins[b][2] += 1
    ece = 0.0
    for conf_sum, acc_sum, count in bins:
        if count > 0:
            ece += (count / n) * abs(conf_sum / count - acc_sum / count)
    return ece`,
    testCases: [
      { input: [[0.9, 0.8, 0.6], [1, 0, 1], 5], expected: 0.3666666667 },
      { input: [[0.5, 0.5], [1, 0], 10], expected: 0.0 },
      { input: [[0.1, 0.9], [0, 1], 10], expected: 0.1 },
      { input: [[1.0, 1.0], [1, 0], 2], expected: 0.5 },
    ],
    hint: "Within each bin compare the average confidence with the observed accuracy.",
  },
  {
    id: "dl-087",
    title: "Transformer Encoder Block Forward",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Forward pass of a tiny pre-LN transformer encoder block. With h = LayerNorm(x), compute single-head attention Q = hWq, K = hWk, V = hWv, A = softmax(QK^T / sqrt(d)) V, and the residual a = x + A Wo. Then apply a second LayerNorm, an MLP with ReLU and biases, and the second residual: out = a + relu(LN(a) W1 + b1) W2 + b2.\n\nThe signature is encoder_block_forward(x, Wq, Wk, Wv, Wo, W1, b1, W2, b2, eps=1e-5). All projection matrices are square d x d.",
    starterCode: `import math
def encoder_block_forward(x, Wq, Wk, Wv, Wo, W1, b1, W2, b2, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def encoder_block_forward(x, Wq, Wk, Wv, Wo, W1, b1, W2, b2, eps=1e-5):
    def ln(row):
        n = len(row)
        mean = sum(row) / n
        var = sum((v - mean) ** 2 for v in row) / n
        inv = 1.0 / math.sqrt(var + eps)
        return [(v - mean) * inv for v in row]

    seq = len(x)
    d = len(x[0])
    h = [ln(row) for row in x]
    Q = [[sum(h[i][k] * Wq[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    K = [[sum(h[i][k] * Wk[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    V = [[sum(h[i][k] * Wv[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    scale = 1.0 / math.sqrt(d)
    scores = [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(seq)] for i in range(seq)]
    weights = []
    for row in scores:
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        total = sum(exps)
        weights.append([e / total for e in exps])
    attn = [[sum(weights[i][j] * V[j][k] for j in range(seq)) for k in range(d)] for i in range(seq)]
    proj = [[sum(attn[i][k] * Wo[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    a = [[x[i][j] + proj[i][j] for j in range(d)] for i in range(seq)]
    g = [ln(row) for row in a]
    hidden = []
    for i in range(seq):
        z = [sum(g[i][k] * W1[k][j] for k in range(d)) + b1[j] for j in range(len(b1))]
        hidden.append([max(0.0, v) for v in z])
    out = []
    for i in range(seq):
        z = [sum(hidden[i][k] * W2[k][j] for k in range(len(hidden[i]))) + b2[j] for j in range(len(b2))]
        out.append([a[i][j] + z[j] for j in range(d)])
    return out`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [[2.8883532775, -0.8883558715], [-0.8883558715, 2.8883532775]] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], [0.0, 0.0], [[0.0, 0.0], [0.0, 0.0]], [0.0, 0.0]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, -1.0], [0.0, 1.0]], [0.5, -0.5], [[1.0, 0.0], [0.0, -1.0]], [0.1, 0.1]], expected: [[0.1000199994, 1.5999844451], [2.1000199994, 3.5999844451]] },
      { input: [[[2.0, 0.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [[3.99999375, -0.999995]] },
    ],
    hint: "Pre-LN means normalize before attention and before the MLP; both sublayers add back the residual.",
  },
  {
    id: "dl-088",
    title: "Pre-LN vs Post-LN Order",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compare pre-LN and post-LN transformer sublayer orderings for single-head attention. Pre-LN: h = LN(x), attn = softmax(hWq (hWk)^T / sqrt(d)) (hWv), out = x + attn Wo. Post-LN: compute attention from raw x, add the residual, then normalize: out = LN(x + attn Wo).\n\nThe signature is pre_post_ln_order(x, Wq, Wk, Wv, Wo, eps=1e-5). Return [pre_ln_output, post_ln_output].",
    starterCode: `import math
def pre_post_ln_order(x, Wq, Wk, Wv, Wo, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def pre_post_ln_order(x, Wq, Wk, Wv, Wo, eps=1e-5):
    def ln(row):
        n = len(row)
        mean = sum(row) / n
        var = sum((v - mean) ** 2 for v in row) / n
        inv = 1.0 / math.sqrt(var + eps)
        return [(v - mean) * inv for v in row]

    def attention(inp):
        seq = len(inp)
        d = len(inp[0])
        Q = [[sum(inp[i][k] * Wq[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
        K = [[sum(inp[i][k] * Wk[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
        V = [[sum(inp[i][k] * Wv[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
        scale = 1.0 / math.sqrt(d)
        scores = [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(seq)] for i in range(seq)]
        weights = []
        for row in scores:
            m = max(row)
            exps = [math.exp(v - m) for v in row]
            total = sum(exps)
            weights.append([e / total for e in exps])
        return [[sum(weights[i][j] * V[j][k] for j in range(seq)) for k in range(d)] for i in range(seq)]

    seq = len(x)
    d = len(x[0])
    h = [ln(row) for row in x]
    attn_pre = attention(h)
    proj_pre = [[sum(attn_pre[i][k] * Wo[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    pre_out = [[x[i][j] + proj_pre[i][j] for j in range(d)] for i in range(seq)]
    attn_post = attention(x)
    proj_post = [[sum(attn_post[i][k] * Wo[k][j] for k in range(d)) for j in range(d)] for i in range(seq)]
    post_raw = [[x[i][j] + proj_post[i][j] for j in range(d)] for i in range(seq)]
    post_out = [ln(row) for row in post_raw]
    return [pre_out, post_out]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[[1.8883558715, -0.8883558715], [-0.8883558715, 1.8883558715]], [[0.9999888539, -0.9999888539], [-0.9999888539, 0.9999888539]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[[1.99994e-05, 2.9999800006], [2.0000199994, 4.9999800006]], [[-0.999995, 0.999995], [-0.999995, 0.999995]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[1.0, 0.0], [0.0, 1.0]], [[0.0, 1.0], [1.0, 0.0]], [[1.0, 1.0], [0.0, 1.0]], [[2.0, 0.0], [0.0, 0.5]]], expected: [[[-0.9999600012, 2.0], [1.0000399988, 4.0]], [[0.9999907657, -0.9999907657], [0.99999111, -0.99999111]]] },
      { input: [[[3.0, -1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[[3.99999875, -1.99999875]], [[0.9999996875, -0.9999996875]]] },
    ],
    hint: "Pre-LN normalizes the sublayer input; post-LN normalizes the sublayer output after the residual add.",
  },
  {
    id: "dl-089",
    title: "Spectral Norm Power Iteration",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One power-iteration step for spectral normalization. Compute v_new = normalize(W^T u), then u_new = normalize(W v_new), and return the spectral norm estimate sigma = ||W v_new||_2.\n\nThe signature is spectral_norm_step(W, u, v). u is the current left singular vector estimate and v the right one; return [sigma, u_new, v_new].",
    starterCode: `import math
def spectral_norm_step(W, u, v):
    # Your code here
    pass`,
    solution: `import math
def spectral_norm_step(W, u, v):
    d = len(W)
    wtu = [sum(W[i][j] * u[i] for i in range(d)) for j in range(len(W[0]))]
    n1 = math.sqrt(sum(t * t for t in wtu))
    v_new = [t / n1 for t in wtu]
    wv = [sum(W[i][j] * v_new[j] for j in range(len(v_new))) for i in range(d)]
    n2 = math.sqrt(sum(t * t for t in wv))
    u_new = [t / n2 for t in wv]
    return [n2, u_new, v_new]`,
    testCases: [
      { input: [[[3.0, 0.0], [0.0, 4.0]], [1.0, 0.0], [1.0, 0.0]], expected: [3.0, [1.0, 0.0], [1.0, 0.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [1.0, 0.0], [1.0, 0.0]], expected: [5.4037024344, [0.4138029443, 0.9103664775], [0.4472135955, 0.894427191]] },
      { input: [[[2.0, 0.0], [0.0, 2.0]], [1.0, 1.0], [1.0, 1.0]], expected: [2.0, [0.7071067812, 0.7071067812], [0.7071067812, 0.7071067812]] },
      { input: [[[0.0, 1.0], [1.0, 0.0]], [1.0, 0.0], [1.0, 0.0]], expected: [1.0, [1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Normalize after each matrix-vector product; the sigma estimate is the norm of W v_new.",
  },
  {
    id: "dl-090",
    title: "Gradient Penalty (Finite Difference)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the WGAN gradient penalty with a central finite difference: g_i = (d_plus_i - d_minus_i) / (2 * epsilon), then return the mean of g_i^2 over all i.\n\nThe signature is gradient_penalty_finite_difference(d_plus, d_minus, epsilon). d_plus and d_minus are critic scores at perturbed points.",
    starterCode: `def gradient_penalty_finite_difference(d_plus, d_minus, epsilon):
    # Your code here
    pass`,
    solution: `def gradient_penalty_finite_difference(d_plus, d_minus, epsilon):
    total = 0.0
    for i in range(len(d_plus)):
        g = (d_plus[i] - d_minus[i]) / (2.0 * epsilon)
        total += g * g
    return total / len(d_plus)`,
    testCases: [
      { input: [[1.0, 0.0], [0.0, 0.0], 0.1], expected: 12.5 },
      { input: [[0.5, 0.5], [0.5, 0.5], 0.05], expected: 0.0 },
      { input: [[1.0, 2.0], [0.5, 1.5], 0.5], expected: 0.25 },
      { input: [[3.0, 1.0], [1.0, 3.0], 0.25], expected: 16.0 },
    ],
    hint: "The penalty pushes the critic's gradient norm toward 1, so the squared slopes are averaged.",
  },
  {
    id: "dl-091",
    title: "Transformer Encoder Block Parameter Count",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Count the parameters of one post-LN transformer encoder block, including biases and both LayerNorms. Attention: 4 * (d_model^2 + d_model). MLP: d_model * d_ff + d_ff + d_ff * d_model + d_model. LayerNorms: 2 * 2 * d_model.\n\nThe signature is transformer_block_params(d_model, d_ff). Return an integer.",
    starterCode: `def transformer_block_params(d_model, d_ff):
    # Your code here
    pass`,
    solution: `def transformer_block_params(d_model, d_ff):
    attn = 4 * (d_model * d_model + d_model)
    mlp = d_model * d_ff + d_ff + d_ff * d_model + d_model
    norms = 2 * 2 * d_model
    return attn + mlp + norms`,
    testCases: [
      { input: [512, 2048], expected: 3152384 },
      { input: [768, 3072], expected: 7087872 },
      { input: [64, 256], expected: 49984 },
      { input: [128, 512], expected: 198272 },
    ],
    hint: "Four attention projections plus a two-layer MLP plus two LayerNorms, all with biases.",
  },
  {
    id: "dl-092",
    title: "Multi-Head Attention Parameter Count with Bias",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Count the parameters of a multi-head attention module: four projections Wq, Wk, Wv and Wo each with d_model x d_model weights, plus one bias vector of length d_model per projection when bias is enabled. The number of heads does not change the total.\n\nThe signature is mha_param_count(d_model, num_heads, bias=True). Return an integer.",
    starterCode: `def mha_param_count(d_model, num_heads, bias=True):
    # Your code here
    pass`,
    solution: `def mha_param_count(d_model, num_heads, bias=True):
    params = 4 * d_model * d_model
    if bias:
        params += 4 * d_model
    return params`,
    testCases: [
      { input: [512, 8], expected: 1050624 },
      { input: [768, 12, false], expected: 2359296 },
      { input: [64, 4], expected: 16640 },
      { input: [128, 8, true], expected: 66048 },
    ],
    hint: "Splitting into heads partitions each projection; it does not add parameters.",
  },
  {
    id: "dl-093",
    title: "Inference FLOPs Estimate",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the multiply-add FLOPs of one transformer forward pass. Per layer: QKV projections 6 * seq * d^2, output projection 2 * seq * d^2, attention scores and weighted sum 4 * seq^2 * d, and the two MLP matrices 4 * seq * d * d_ff. Sum these and multiply by num_layers.\n\nThe signature is inference_flops(seq_len, d_model, num_layers, d_ff). Return an integer.",
    starterCode: `def inference_flops(seq_len, d_model, num_layers, d_ff):
    # Your code here
    pass`,
    solution: `def inference_flops(seq_len, d_model, num_layers, d_ff):
    per_layer = 8 * seq_len * d_model * d_model + 4 * seq_len * seq_len * d_model + 4 * seq_len * d_model * d_ff
    return num_layers * per_layer`,
    testCases: [
      { input: [128, 512, 12, 2048], expected: 10066329600 },
      { input: [1, 512, 12, 2048], expected: 75522048 },
      { input: [512, 768, 12, 3072], expected: 96636764160 },
      { input: [32, 64, 2, 256], expected: 6815744 },
    ],
    hint: "One multiply-add counts as 2 FLOPs; the attention term grows quadratically with sequence length.",
  },
  {
    id: "dl-094",
    title: "Context Memory Estimate",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Estimate the memory of the attention probability tensor for a full context window: batch_size * num_heads * seq_len^2 * bytes_per_value.\n\nThe signature is attention_memory_bytes(batch_size, num_heads, seq_len, bytes_per_value=2). Return an integer.",
    starterCode: `def attention_memory_bytes(batch_size, num_heads, seq_len, bytes_per_value=2):
    # Your code here
    pass`,
    solution: `def attention_memory_bytes(batch_size, num_heads, seq_len, bytes_per_value=2):
    return batch_size * num_heads * seq_len * seq_len * bytes_per_value`,
    testCases: [
      { input: [1, 12, 512], expected: 6291456 },
      { input: [8, 16, 1024, 2], expected: 268435456 },
      { input: [1, 8, 2048, 4], expected: 134217728 },
      { input: [2, 4, 128, 2], expected: 262144 },
    ],
    hint: "The seq_len^2 attention matrix is why long-context inference scales quadratically.",
  },
  {
    id: "dl-095",
    title: "Mixed Precision Loss Scale Update",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Update a mixed-precision loss scale for one optimizer step. If any gradient overflowed (found_inf truthy), multiply the loss scale by the backoff factor; otherwise multiply it by the growth factor.\n\nThe signature is mixed_precision_loss_scale(loss_scale, found_inf, growth_factor=2.0, backoff_factor=0.5). Return the new loss scale.",
    starterCode: `def mixed_precision_loss_scale(loss_scale, found_inf, growth_factor=2.0, backoff_factor=0.5):
    # Your code here
    pass`,
    solution: `def mixed_precision_loss_scale(loss_scale, found_inf, growth_factor=2.0, backoff_factor=0.5):
    if found_inf:
        return loss_scale * backoff_factor
    return loss_scale * growth_factor`,
    testCases: [
      { input: [1024.0, 1], expected: 512.0 },
      { input: [1024.0, 0], expected: 2048.0 },
      { input: [65536.0, 0, 1.5], expected: 98304.0 },
      { input: [100.0, 1, 2.0, 0.1], expected: 10.0 },
    ],
    hint: "Overflow backs the scale off; a clean step lets it grow again.",
  },
];
