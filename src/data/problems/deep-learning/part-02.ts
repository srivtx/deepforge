import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-006",
    title: "Leaky ReLU",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the leaky ReLU activation element-wise to a list: f(x) = x if x > 0, else alpha * x.\n\nThe signature is leaky_relu(x, alpha=0.01). Return a new list of the same length.",
    starterCode: `def leaky_relu(x, alpha=0.01):
    # Your code here
    pass`,
    solution: `def leaky_relu(x, alpha=0.01):
    return [v if v > 0 else alpha * v for v in x]`,
    testCases: [
      { input: [[-2.0, -1.0, 0.0, 1.0, 2.0], 0.01], expected: [-0.02, -0.01, 0.0, 1.0, 2.0] },
      { input: [[-4.0, 4.0], 0.1], expected: [-0.4, 4.0] },
      { input: [[0.0], 0.5], expected: [0.0] },
      { input: [[-0.5, 0.5]], expected: [-0.005, 0.5] },
    ],
    hint: "Compare each value against zero and multiply the negatives by alpha.",
  },
  {
    id: "dl-007",
    title: "ELU",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the exponential linear unit element-wise: f(x) = x if x >= 0, else alpha * (exp(x) - 1).\n\nThe signature is elu(x, alpha=1.0). Return a list.",
    starterCode: `import math
def elu(x, alpha=1.0):
    # Your code here
    pass`,
    solution: `import math
def elu(x, alpha=1.0):
    out = []
    for v in x:
        if v >= 0:
            out.append(v)
        else:
            out.append(alpha * (math.exp(v) - 1.0))
    return out`,
    testCases: [
      { input: [[0.0, 1.0, 2.0]], expected: [0.0, 1.0, 2.0] },
      { input: [[-1.0], 1.0], expected: [-0.6321205588] },
      { input: [[-2.0, -0.5], 2.0], expected: [-1.7293294335, -0.7869386806] },
      { input: [[-3.0], 1.5], expected: [-1.4253193974] },
    ],
    hint: "Non-negative values pass through unchanged; negatives follow alpha * (exp(x) - 1).",
  },
  {
    id: "dl-008",
    title: "Tanh (Vector)",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the hyperbolic tangent element-wise: tanh(x) = (exp(x) - exp(-x)) / (exp(x) + exp(-x)).\n\nThe signature is tanh_vector(x). Use a numerically stable branch so that large magnitudes saturate to 1.0 or -1.0 instead of overflowing.",
    starterCode: `import math
def tanh_vector(x):
    # Your code here
    pass`,
    solution: `import math
def tanh_vector(x):
    out = []
    for v in x:
        if v >= 0:
            e = math.exp(-2.0 * v)
            out.append((1.0 - e) / (1.0 + e))
        else:
            e = math.exp(2.0 * v)
            out.append((e - 1.0) / (e + 1.0))
    return out`,
    testCases: [
      { input: [[0.0]], expected: [0.0] },
      { input: [[1000.0, -1000.0]], expected: [1.0, -1.0] },
      { input: [[1.0, -1.0]], expected: [0.761594156, -0.761594156] },
      { input: [[0.5, 2.0, -0.25]], expected: [0.4621171573, 0.9640275801, -0.2449186624] },
    ],
    hint: "Use exp(-2x) for x >= 0 so the exponent never overflows.",
  },
  {
    id: "dl-009",
    title: "One-Hot Encode",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Build a one-hot vector of length num_classes with a 1.0 at position index and 0.0 everywhere else.\n\nThe signature is one_hot(index, num_classes). Assume 0 <= index < num_classes.",
    starterCode: `def one_hot(index, num_classes):
    # Your code here
    pass`,
    solution: `def one_hot(index, num_classes):
    return [1.0 if i == index else 0.0 for i in range(num_classes)]`,
    testCases: [
      { input: [0, 3], expected: [1.0, 0.0, 0.0] },
      { input: [2, 4], expected: [0.0, 0.0, 1.0, 0.0] },
      { input: [0, 1], expected: [1.0] },
      { input: [1, 1], expected: [0.0] },
      { input: [4, 5], expected: [0.0, 0.0, 0.0, 0.0, 1.0] },
    ],
    hint: "Emit 1.0 when the running position equals index.",
  },
  {
    id: "dl-010",
    title: "Dense Layer Forward",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute one dense (fully connected) layer without an activation: y = W @ x + b.\n\nThe signature is dense_forward(x, W, b). W has shape (output_dim, input_dim), x has length input_dim and b has length output_dim.",
    starterCode: `def dense_forward(x, W, b):
    # Your code here
    pass`,
    solution: `def dense_forward(x, W, b):
    return [sum(W[i][j] * x[j] for j in range(len(x))) + b[i] for i in range(len(W))]`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0, 0.0], [0.0, 1.0]], [0.5, -0.5]], expected: [1.5, 1.5] },
      { input: [[2.0], [[3.0]], [1.0]], expected: [7.0] },
      { input: [[1.0, -1.0], [[2.0, 3.0]], [0.0]], expected: [-1.0] },
      { input: [[0.5, 0.5], [[1.0, 1.0], [2.0, 2.0]], [0.0, 0.0]], expected: [1.0, 2.0] },
      { input: [[1.0, 2.0, 3.0], [[1.0, -1.0, 0.5]], [2.0]], expected: [2.5] },
    ],
    hint: "One dot product per output row of W, then add the bias.",
  },
  {
    id: "dl-011",
    title: "Conv Output Dimension",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute the spatial output size of a convolution: floor((n + 2 * padding - dilation * (k - 1) - 1) / stride) + 1.\n\nThe signature is conv_output_dim(n, k, stride=1, padding=0, dilation=1). Return an integer.",
    starterCode: `def conv_output_dim(n, k, stride=1, padding=0, dilation=1):
    # Your code here
    pass`,
    solution: `def conv_output_dim(n, k, stride=1, padding=0, dilation=1):
    return (n + 2 * padding - dilation * (k - 1) - 1) // stride + 1`,
    testCases: [
      { input: [28, 3], expected: 26 },
      { input: [28, 3, 2, 1], expected: 14 },
      { input: [32, 5, 1, 2], expected: 32 },
      { input: [7, 3, 1, 0, 2], expected: 3 },
      { input: [10, 3, 3, 0], expected: 3 },
    ],
    hint: "Use integer division for the floor, and remember dilation widens the effective kernel.",
  },
  {
    id: "dl-012",
    title: "ReLU Backward",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Backpropagate through a ReLU. Given the upstream gradient dout and the pre-activation z, return dout[i] where z[i] > 0 and 0.0 otherwise.\n\nThe signature is relu_grad(dout, z).",
    starterCode: `def relu_grad(dout, z):
    # Your code here
    pass`,
    solution: `def relu_grad(dout, z):
    return [dout[i] if z[i] > 0 else 0.0 for i in range(len(z))]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [-1.0, 2.0, -3.0]], expected: [0.0, 2.0, 0.0] },
      { input: [[5.0], [0.0]], expected: [0.0] },
      { input: [[1.0, 1.0], [0.5, 0.25]], expected: [1.0, 1.0] },
      { input: [[2.0, -2.0], [1e-09, -1e-09]], expected: [2.0, 0.0] },
    ],
    hint: "The ReLU derivative is 1 for strictly positive pre-activations, 0 otherwise.",
  },
  {
    id: "dl-013",
    title: "Sigmoid Backward",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Backpropagate through a sigmoid. For each pre-activation z[i], compute s = sigmoid(z[i]) and return dout[i] * s * (1 - s).\n\nThe signature is sigmoid_grad(dout, z). Use a numerically stable sigmoid.",
    starterCode: `import math
def sigmoid_grad(dout, z):
    # Your code here
    pass`,
    solution: `import math
def sigmoid_grad(dout, z):
    out = []
    for i in range(len(z)):
        v = z[i]
        if v >= 0:
            s = 1.0 / (1.0 + math.exp(-v))
        else:
            e = math.exp(v)
            s = e / (1.0 + e)
        out.append(dout[i] * s * (1.0 - s))
    return out`,
    testCases: [
      { input: [[1.0], [0.0]], expected: [0.25] },
      { input: [[1.0, 2.0], [0.0, 0.0]], expected: [0.25, 0.5] },
      { input: [[2.0], [1.0]], expected: [0.3932238665] },
      { input: [[1.0], [-1.0]], expected: [0.1966119332] },
      { input: [[1.0, 1.0], [-1000.0, 1000.0]], expected: [0.0, 0.0] },
    ],
    hint: "The sigmoid derivative is s * (1 - s); multiply by the upstream gradient.",
  },
  {
    id: "dl-014",
    title: "Tanh Backward",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Backpropagate through tanh. For each pre-activation z[i], return dout[i] * (1 - tanh(z[i])^2).\n\nThe signature is tanh_grad(dout, z).",
    starterCode: `import math
def tanh_grad(dout, z):
    # Your code here
    pass`,
    solution: `import math
def tanh_grad(dout, z):
    out = []
    for i in range(len(z)):
        v = z[i]
        if v >= 0:
            e = math.exp(-2.0 * v)
            t = (1.0 - e) / (1.0 + e)
        else:
            e = math.exp(2.0 * v)
            t = (e - 1.0) / (e + 1.0)
        out.append(dout[i] * (1.0 - t * t))
    return out`,
    testCases: [
      { input: [[1.0], [0.0]], expected: [1.0] },
      { input: [[1.0], [1.0]], expected: [0.4199743416] },
      { input: [[2.0, 3.0], [-1.0, 0.5]], expected: [0.8399486832, 2.3593431989] },
      { input: [[1.0, 1.0], [1000.0, -1000.0]], expected: [0.0, 0.0] },
    ],
    hint: "Compute tanh(z) once per element, then use 1 - tanh(z)^2.",
  },
  {
    id: "dl-015",
    title: "Causal Mask",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply a causal (lower-triangular) mask to an attention score matrix: keep entries on or below the diagonal and replace every entry strictly above the diagonal with -1e9.\n\nThe signature is causal_mask(scores). Scores may be rectangular; row i masks columns j > i.",
    starterCode: `def causal_mask(scores):
    # Your code here
    pass`,
    solution: `def causal_mask(scores):
    n = len(scores)
    return [[scores[i][j] if j <= i else -1e9 for j in range(len(scores[i]))] for i in range(n)]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]]], expected: [[1.0, -1e9], [3.0, 4.0]] },
      { input: [[[0.0]]], expected: [[0.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]], expected: [[1.0, -1e9, -1e9], [4.0, 5.0, -1e9], [7.0, 8.0, 9.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]], expected: [[1.0, -1e9, -1e9], [4.0, 5.0, -1e9]] },
    ],
    hint: "Compare the column index with the row index; -1e9 acts as a masked-out score.",
  },
  {
    id: "dl-016",
    title: "SGD Weight Update",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply one plain stochastic gradient descent step: w_new = w - lr * grad.\n\nThe signature is sgd_update(w, grad, lr). w and grad are lists of the same length.",
    starterCode: `def sgd_update(w, grad, lr):
    # Your code here
    pass`,
    solution: `def sgd_update(w, grad, lr):
    return [w[i] - lr * grad[i] for i in range(len(w))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.1, 0.2], 0.5], expected: [0.95, 1.9] },
      { input: [[0.0], [-1.0], 0.1], expected: [0.1] },
      { input: [[1.0, -1.0], [0.0, 0.0], 1.0], expected: [1.0, -1.0] },
      { input: [[5.0, 5.0], [1.0, -1.0], 2.0], expected: [3.0, 7.0] },
    ],
    hint: "Move each parameter opposite to its gradient, scaled by the learning rate.",
  },
  {
    id: "dl-017",
    title: "Warmup LR",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Linear learning-rate warmup: return base_lr * min(1.0, step / warmup_steps), or base_lr when warmup_steps <= 0.\n\nThe signature is warmup_lr(step, warmup_steps, base_lr).",
    starterCode: `def warmup_lr(step, warmup_steps, base_lr):
    # Your code here
    pass`,
    solution: `def warmup_lr(step, warmup_steps, base_lr):
    if warmup_steps <= 0:
        return base_lr
    return base_lr * min(1.0, step / warmup_steps)`,
    testCases: [
      { input: [0, 100, 0.001], expected: 0.0 },
      { input: [50, 100, 0.001], expected: 0.0005 },
      { input: [100, 100, 0.001], expected: 0.001 },
      { input: [200, 100, 0.001], expected: 0.001 },
      { input: [10, 0, 0.01], expected: 0.01 },
    ],
    hint: "Clamp the step fraction at 1.0 so the rate plateaus after warmup.",
  },
  {
    id: "dl-018",
    title: "Xavier Init Std",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the Xavier/Glorot normal initialization standard deviation sqrt(2 / (fan_in + fan_out)).\n\nThe signature is xavier_std(fan_in, fan_out).",
    starterCode: `import math
def xavier_std(fan_in, fan_out):
    # Your code here
    pass`,
    solution: `import math
def xavier_std(fan_in, fan_out):
    return math.sqrt(2.0 / (fan_in + fan_out))`,
    testCases: [
      { input: [100, 100], expected: 0.1 },
      { input: [1, 1], expected: 1.0 },
      { input: [3, 12], expected: 0.3651483717 },
      { input: [256, 512], expected: 0.0510310363 },
    ],
    hint: "Average the fan-in and fan-out inside the denominator.",
  },
  {
    id: "dl-019",
    title: "He Init Std",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Return the He/Kaiming normal initialization standard deviation sqrt(2 / fan_in).\n\nThe signature is he_std(fan_in).",
    starterCode: `import math
def he_std(fan_in):
    # Your code here
    pass`,
    solution: `import math
def he_std(fan_in):
    return math.sqrt(2.0 / fan_in)`,
    testCases: [
      { input: [2], expected: 1.0 },
      { input: [100], expected: 0.1414213562 },
      { input: [128], expected: 0.125 },
      { input: [512], expected: 0.0625 },
    ],
    hint: "ReLU networks only need the fan-in correction factor of 2.",
  },
  {
    id: "dl-020",
    title: "Embedding Lookup",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Look up embedding rows for a list of token indices. Return a list containing table[indices[k]] for each k, preserving order.\n\nThe signature is embedding_lookup(indices, table). Return copies of the rows, not aliases.",
    starterCode: `def embedding_lookup(indices, table):
    # Your code here
    pass`,
    solution: `def embedding_lookup(indices, table):
    return [list(table[i]) for i in indices]`,
    testCases: [
      { input: [[0, 2], [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[1.0, 2.0], [5.0, 6.0]] },
      { input: [[1, 1], [[9.0], [8.0]]], expected: [[8.0], [8.0]] },
      { input: [[0], [[0.5, -0.5]]], expected: [[0.5, -0.5]] },
      { input: [[], [[1.0]]], expected: [] },
    ],
    hint: "Index the table directly; repeated indices produce repeated rows.",
  },
  {
    id: "dl-021",
    title: "Temperature Softmax",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Compute softmax with temperature: softmax(logits / temperature), computed stably by subtracting the maximum scaled logit before exponentiating.\n\nThe signature is temperature_softmax(logits, temperature). Assume temperature > 0. The returned probabilities sum to 1.0.",
    starterCode: `import math
def temperature_softmax(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_softmax(logits, temperature):
    scaled = [v / temperature for v in logits]
    m = max(scaled)
    exps = [math.exp(v - m) for v in scaled]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0.0900305732, 0.2447284711, 0.6652409558] },
      { input: [[1.0, 1.0], 0.5], expected: [0.5, 0.5] },
      { input: [[0.0, 0.0, 0.0], 100.0], expected: [0.3333333333, 0.3333333333, 0.3333333333] },
      { input: [[2.0, 0.0], 2.0], expected: [0.7310585786, 0.2689414214] },
      { input: [[1.0, 2.0], 0.1], expected: [4.53979e-05, 0.9999546021] },
    ],
    hint: "Divide the logits by the temperature first, then run stable softmax.",
  },
  {
    id: "dl-022",
    title: "Conv2D Single Channel Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Forward pass of a 2D convolution with one input channel and one output channel, no bias. Slide the kernel over the optionally zero-padded image using the given stride and return the output feature map.\n\nThe signature is conv2d_forward(image, kernel, stride=1, padding=0). Assume a square image and square kernel with a valid output size.",
    starterCode: `def conv2d_forward(image, kernel, stride=1, padding=0):
    # Your code here
    pass`,
    solution: `def conv2d_forward(image, kernel, stride=1, padding=0):
    n = len(image)
    k = len(kernel)
    if padding > 0:
        n2 = n + 2 * padding
        padded = [[0.0] * n2 for _ in range(n2)]
        for i in range(n):
            for j in range(n):
                padded[i + padding][j + padding] = image[i][j]
        image = padded
        n = n2
    out_size = (n - k) // stride + 1
    out = []
    for i in range(out_size):
        row = []
        for j in range(out_size):
            s = 0.0
            for a in range(k):
                for b in range(k):
                    s += image[i * stride + a][j * stride + b] * kernel[a][b]
            row.append(s)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], [[1.0, 1.0], [1.0, 1.0]], 1, 0], expected: [[12.0, 16.0], [24.0, 28.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], [[1.0, 0.0], [0.0, -1.0]], 1, 0], expected: [[-4.0, -4.0], [-4.0, -4.0]] },
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0], [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]], [[1.0, 1.0], [1.0, 1.0]], 2, 0], expected: [[14.0, 22.0], [46.0, 54.0]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]], 1, 1], expected: [[1.0, 1.0, 0.0], [1.0, 2.0, 1.0], [0.0, 1.0, 1.0]] },
    ],
    hint: "Zero-pad the image first, then slide the kernel with the stride and sum element-wise products.",
  },
  {
    id: "dl-023",
    title: "SAME Padding Sizes",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the asymmetric padding needed for SAME padding with a stride. The output length is ceil(n / stride); total padding is max(0, (output - 1) * stride + dilation * (k - 1) + 1 - n), split as floor(total / 2) before and the remainder after.\n\nThe signature is same_padding(n, k, stride=1, dilation=1). Return [pad_before, pad_after].",
    starterCode: `def same_padding(n, k, stride=1, dilation=1):
    # Your code here
    pass`,
    solution: `def same_padding(n, k, stride=1, dilation=1):
    out = (n + stride - 1) // stride
    total = max(0, (out - 1) * stride + dilation * (k - 1) + 1 - n)
    before = total // 2
    return [before, total - before]`,
    testCases: [
      { input: [5, 3], expected: [1, 1] },
      { input: [6, 3, 2], expected: [0, 1] },
      { input: [7, 3, 2], expected: [1, 1] },
      { input: [4, 3, 3], expected: [1, 1] },
      { input: [5, 3, 1, 2], expected: [2, 2] },
    ],
    hint: "Extra padding on odd totals goes after the input, matching common framework behavior.",
  },
  {
    id: "dl-024",
    title: "Max Pooling Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Forward pass of 2D max pooling over a square matrix using a k x k window and the given stride, without padding.\n\nThe signature is max_pool(x, k, stride). The output size per dimension is (n - k) // stride + 1.",
    starterCode: `def max_pool(x, k, stride):
    # Your code here
    pass`,
    solution: `def max_pool(x, k, stride):
    n = len(x)
    out_size = (n - k) // stride + 1
    out = []
    for i in range(out_size):
        row = []
        for j in range(out_size):
            best = x[i * stride][j * stride]
            for a in range(k):
                for b in range(k):
                    v = x[i * stride + a][j * stride + b]
                    if v > best:
                        best = v
            row.append(best)
        out.append(row)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0], [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]], 2, 2], expected: [[6.0, 8.0], [14.0, 16.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], 2, 1], expected: [[5.0, 6.0], [8.0, 9.0]] },
      { input: [[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]], 3, 3], expected: [[9.0]] },
      { input: [[[-1.0, -2.0], [-3.0, -4.0]], 2, 2], expected: [[-1.0]] },
    ],
    hint: "Initialize the running maximum from the window's top-left element, not from zero.",
  },
  {
    id: "dl-025",
    title: "BatchNorm Forward (Train)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Training-mode batch normalization for a single feature over a batch: y_i = gamma * (x_i - mean) / sqrt(var + eps) + beta, using the biased batch variance (divide by n).\n\nThe signature is batchnorm_forward(x, gamma, beta, eps=1e-5).",
    starterCode: `import math
def batchnorm_forward(x, gamma, beta, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def batchnorm_forward(x, gamma, beta, eps=1e-5):
    n = len(x)
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    inv = 1.0 / math.sqrt(var + eps)
    return [gamma * (v - mean) * inv + beta for v in x]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], 1.0, 0.0], expected: [-1.34163542, -0.4472118067, 0.4472118067, 1.34163542] },
      { input: [[0.0, 0.0, 0.0], 2.0, 1.0], expected: [1.0, 1.0, 1.0] },
      { input: [[1.0, 1.0], 1.0, -1.0], expected: [-1.0, -1.0] },
      { input: [[1.0, -1.0], 3.0, 0.0], expected: [2.9999850001, -2.9999850001] },
      { input: [[2.0, 4.0], 1.0, 2.0], expected: [1.000005, 2.999995] },
    ],
    hint: "Compute the mean and variance over the batch, then normalize with eps inside the square root.",
  },
  {
    id: "dl-026",
    title: "BatchNorm Inference",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Inference-mode batch normalization using running statistics: y_i = gamma * (x_i - running_mean) / sqrt(running_var + eps) + beta.\n\nThe signature is batchnorm_inference(x, gamma, beta, running_mean, running_var, eps=1e-5).",
    starterCode: `import math
def batchnorm_inference(x, gamma, beta, running_mean, running_var, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def batchnorm_inference(x, gamma, beta, running_mean, running_var, eps=1e-5):
    inv = 1.0 / math.sqrt(running_var + eps)
    return [gamma * (v - running_mean) * inv + beta for v in x]`,
    testCases: [
      { input: [[1.0, 2.0], 1.0, 0.0, 1.5, 0.25], expected: [-0.9999800006, 0.9999800006] },
      { input: [[0.0], 1.0, 0.0, 0.0, 1.0], expected: [0.0] },
      { input: [[1.0, 2.0, 3.0], 2.0, 1.0, 2.0, 4.0], expected: [1.25e-06, 1.0, 1.99999875] },
      { input: [[4.0, 6.0], 2.0, 1.0, 5.0, 1.0], expected: [-0.9999900001, 2.9999900001] },
    ],
    hint: "At inference time no batch statistics are computed; use the stored running values.",
  },
  {
    id: "dl-027",
    title: "LayerNorm Forward",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Layer normalization over the last dimension. For each row compute the mean and biased variance, normalize, then scale by gamma and shift by beta.\n\nThe signature is layernorm_forward(x, gamma, beta, eps=1e-5) where x is a 2D matrix and gamma/beta are vectors with the row length.",
    starterCode: `import math
def layernorm_forward(x, gamma, beta, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def layernorm_forward(x, gamma, beta, eps=1e-5):
    out = []
    for row in x:
        n = len(row)
        mean = sum(row) / n
        var = sum((v - mean) ** 2 for v in row) / n
        inv = 1.0 / math.sqrt(var + eps)
        out.append([gamma[j] * (row[j] - mean) * inv + beta[j] for j in range(n)])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0]], [1.0, 1.0, 1.0], [0.0, 0.0, 0.0]], expected: [[-1.2247356859, 0.0, 1.2247356859]] },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [1.0, 1.0], [0.0, 0.0]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1.0, -1.0]], [2.0, 3.0], [1.0, 0.0]], expected: [[2.9999900001, -2.9999850001]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [1.0, 1.0], [0.0, 0.0]], expected: [[-0.9999800006, 0.9999800006], [-0.9999800006, 0.9999800006]] },
    ],
    hint: "Normalize each row independently so rows with the same shape normalize identically.",
  },
  {
    id: "dl-028",
    title: "Inverted Dropout (Seeded)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Inverted dropout in training mode: call random.seed(seed), then keep each element with probability 1 - p and scale survivors by 1 / (1 - p); dropped elements become 0.0.\n\nThe signature is inverted_dropout(x, p, seed). Iterate the elements in order so the output is reproducible.",
    starterCode: `import random
def inverted_dropout(x, p, seed):
    # Your code here
    pass`,
    solution: `import random
def inverted_dropout(x, p, seed):
    random.seed(seed)
    out = []
    for v in x:
        if random.random() < p:
            out.append(0.0)
        else:
            out.append(v / (1.0 - p))
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.5, 0], expected: [2.0, 4.0, 0.0, 0.0, 10.0] },
      { input: [[1.0, 2.0, 3.0], 0.0, 42], expected: [1.0, 2.0, 3.0] },
      { input: [[0.5, 1.5, 2.5], 0.25, 7], expected: [0.6666666667, 0.0, 3.3333333333] },
      { input: [[-1.0, 2.0], 0.8, 123], expected: [0.0, 0.0] },
    ],
    hint: "Seed first, draw one random number per element, and scale kept values to preserve expectation.",
  },
  {
    id: "dl-029",
    title: "Momentum Update",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "One step of SGD with momentum: v_new = momentum * velocity - lr * grad and w_new = w + v_new.\n\nThe signature is momentum_update(w, grad, velocity, lr, momentum). Return [w_new, velocity_new].",
    starterCode: `def momentum_update(w, grad, velocity, lr, momentum):
    # Your code here
    pass`,
    solution: `def momentum_update(w, grad, velocity, lr, momentum):
    v_new = [momentum * velocity[i] - lr * grad[i] for i in range(len(w))]
    w_new = [w[i] + v_new[i] for i in range(len(w))]
    return [w_new, v_new]`,
    testCases: [
      { input: [[1.0, 2.0], [0.1, 0.2], [0.0, 0.0], 0.1, 0.9], expected: [[0.99, 1.98], [-0.01, -0.02]] },
      { input: [[0.0], [1.0], [1.0], 0.5, 0.9], expected: [[0.4], [0.4]] },
      { input: [[-1.0, 0.0, 1.0], [0.0, 1.0, 2.0], [0.5, 0.5, 0.5], 0.01, 0.5], expected: [[-0.75, 0.24, 1.23], [0.25, 0.24, 0.23]] },
      { input: [[5.0], [0.0], [2.0], 0.1, 0.9], expected: [[6.8], [1.8]] },
    ],
    hint: "Decay the old velocity, subtract the scaled gradient, then add the new velocity to the weights.",
  },
  {
    id: "dl-030",
    title: "Cosine Annealing LR",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Cosine annealing schedule: lr = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(pi * step / total_steps)). Clamp step to total_steps before computing.\n\nThe signature is cosine_lr(step, total_steps, base_lr, min_lr=0.0).",
    starterCode: `import math
def cosine_lr(step, total_steps, base_lr, min_lr=0.0):
    # Your code here
    pass`,
    solution: `import math
def cosine_lr(step, total_steps, base_lr, min_lr=0.0):
    if step > total_steps:
        step = total_steps
    return min_lr + 0.5 * (base_lr - min_lr) * (1.0 + math.cos(math.pi * step / total_steps))`,
    testCases: [
      { input: [0, 100, 0.001], expected: 0.001 },
      { input: [50, 100, 0.001], expected: 0.0005 },
      { input: [100, 100, 0.001], expected: 0.0 },
      { input: [100, 100, 0.001, 0.0001], expected: 0.0001 },
      { input: [0, 100, 0.001, 0.0001], expected: 0.001 },
    ],
    hint: "At step 0 the cosine term is 1, so the rate starts at base_lr and ends at min_lr.",
  },
  {
    id: "dl-031",
    title: "Linear Layer Backward dW",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Gradient of a linear layer with respect to its weight matrix for a single vector input: dW = outer(dout, x), with shape (output_dim, input_dim).\n\nThe signature is linear_dw(dout, x). dout is the upstream gradient vector and x is the layer input vector.",
    starterCode: `def linear_dw(dout, x):
    # Your code here
    pass`,
    solution: `def linear_dw(dout, x):
    return [[dout[i] * x[j] for j in range(len(x))] for i in range(len(dout))]`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 4.0, 5.0]], expected: [[3.0, 4.0, 5.0], [6.0, 8.0, 10.0]] },
      { input: [[2.0], [1.0, -1.0]], expected: [[2.0, -2.0]] },
      { input: [[-1.0, 0.5], [2.0]], expected: [[-2.0], [1.0]] },
      { input: [[1.0], [0.0]], expected: [[0.0]] },
    ],
    hint: "dW[i][j] = dout[i] * x[j]; no summation is needed for a single example.",
  },
  {
    id: "dl-032",
    title: "Embedding Backward Scatter-Add",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Backward pass of an embedding lookup. Build a (vocab_size, dim) zero gradient table and scatter-add each upstream row dout[k] into the row at indices[k]. Repeated indices accumulate.\n\nThe signature is embedding_backward(indices, dout, vocab_size).",
    starterCode: `def embedding_backward(indices, dout, vocab_size):
    # Your code here
    pass`,
    solution: `def embedding_backward(indices, dout, vocab_size):
    grad = [[0.0] * len(dout[0]) for _ in range(vocab_size)]
    for i, idx in enumerate(indices):
        for j in range(len(dout[0])):
            grad[idx][j] += dout[i][j]
    return grad`,
    testCases: [
      { input: [[0, 2, 0], [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], 3], expected: [[6.0, 8.0], [0.0, 0.0], [3.0, 4.0]] },
      { input: [[1], [[0.5]], 2], expected: [[0.0], [0.5]] },
      { input: [[0, 1, 2, 1], [[1.0, 1.0], [1.0, 1.0], [1.0, 1.0], [2.0, 2.0]], 3], expected: [[1.0, 1.0], [3.0, 3.0], [1.0, 1.0]] },
      { input: [[2, 2], [[1.0], [2.0]], 3], expected: [[0.0], [0.0], [3.0]] },
    ],
    hint: "Use += so repeated token indices accumulate gradient rather than overwrite.",
  },
  {
    id: "dl-033",
    title: "Sinusoidal Positional Encoding",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Build the sinusoidal positional encoding matrix of shape (seq_len, d_model): PE[pos, 2k] = sin(pos / 10000^(2k / d_model)) and PE[pos, 2k + 1] = cos(pos / 10000^(2k / d_model)).\n\nThe signature is sinusoidal_positional_encoding(seq_len, d_model).",
    starterCode: `import math
def sinusoidal_positional_encoding(seq_len, d_model):
    # Your code here
    pass`,
    solution: `import math
def sinusoidal_positional_encoding(seq_len, d_model):
    pe = []
    for pos in range(seq_len):
        row = []
        for i in range(d_model):
            k = i // 2
            angle = pos / (10000.0 ** (2.0 * k / d_model))
            if i % 2 == 0:
                row.append(math.sin(angle))
            else:
                row.append(math.cos(angle))
        pe.append(row)
    return pe`,
    testCases: [
      { input: [3, 4], expected: [[0.0, 1.0, 0.0, 1.0], [0.8414709848, 0.5403023059, 0.0099998333, 0.9999500004], [0.9092974268, -0.4161468365, 0.0199986667, 0.9998000067]] },
      { input: [1, 2], expected: [[0.0, 1.0]] },
      { input: [2, 6], expected: [[0.0, 1.0, 0.0, 1.0, 0.0, 1.0], [0.8414709848, 0.5403023059, 0.0463992235, 0.998922976, 0.002154433, 0.9999976792]] },
      { input: [4, 2], expected: [[0.0, 1.0], [0.8414709848, 0.5403023059], [0.9092974268, -0.4161468365], [0.1411200081, -0.9899924966]] },
    ],
    hint: "Even feature indices use sine, odd indices use cosine, with the frequency halving every pair.",
  },
  {
    id: "dl-034",
    title: "Scaled Attention Scores",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute scaled dot-product attention scores: Q @ K^T / sqrt(d_k) where d_k is the feature dimension of Q and K.\n\nThe signature is attention_scores(Q, K). Q has shape (seq_q, d_k), K has shape (seq_k, d_k) and the result has shape (seq_q, seq_k).",
    starterCode: `import math
def attention_scores(Q, K):
    # Your code here
    pass`,
    solution: `import math
def attention_scores(Q, K):
    d = len(Q[0])
    scale = 1.0 / math.sqrt(d)
    return [[sum(Q[i][k] * K[j][k] for k in range(d)) * scale for j in range(len(K))] for i in range(len(Q))]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]], expected: [[0.7071067812, 0.0], [0.0, 0.7071067812]] },
      { input: [[[1.0, 2.0]], [[1.0, 2.0]]], expected: [[3.5355339059]] },
      { input: [[[1.0, 0.0], [0.0, 2.0]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]], expected: [[0.7071067812, 0.0, 0.7071067812], [0.0, 1.4142135624, 1.4142135624]] },
      { input: [[[2.0]], [[3.0]]], expected: [[6.0]] },
    ],
    hint: "Dot each query row with every key row, then divide by the square root of the key dimension.",
  },
  {
    id: "dl-035",
    title: "Attention Softmax Weights",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Turn attention score rows into probability distributions with a numerically stable row-wise softmax: subtract each row's maximum before exponentiating.\n\nThe signature is attention_weights(scores). Each output row sums to 1.0.",
    starterCode: `import math
def attention_weights(scores):
    # Your code here
    pass`,
    solution: `import math
def attention_weights(scores):
    out = []
    for row in scores:
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        total = sum(exps)
        out.append([e / total for e in exps])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0]]], expected: [[0.0900305732, 0.2447284711, 0.6652409558]] },
      { input: [[[0.0, 0.0], [1.0, 1.0]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [[[-1.0, 0.0, 1.0]]], expected: [[0.0900305732, 0.2447284711, 0.6652409558]] },
      { input: [[[0.0]]], expected: [[1.0]] },
      { input: [[[1000.0, 1000.0]]], expected: [[0.5, 0.5]] },
    ],
    hint: "Normalize independently per row; the max subtraction keeps large scores from overflowing.",
  },
  {
    id: "dl-036",
    title: "Attention Weighted Sum",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the attention output as the weighted sum of value vectors: output[i] = sum over j of weights[i][j] * V[j].\n\nThe signature is attention_weighted_sum(weights, V) where weights has shape (seq_q, seq_k) and V has shape (seq_k, d_v).",
    starterCode: `def attention_weighted_sum(weights, V):
    # Your code here
    pass`,
    solution: `def attention_weighted_sum(weights, V):
    n = len(weights)
    d = len(V[0])
    return [[sum(weights[i][j] * V[j][k] for j in range(len(V))) for k in range(d)] for i in range(n)]`,
    testCases: [
      { input: [[[0.5, 0.5]], [[1.0, 2.0], [3.0, 4.0]]], expected: [[2.0, 3.0]] },
      { input: [[[1.0, 0.0, 0.0]], [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[1.0, 2.0]] },
      { input: [[[0.25, 0.25, 0.5]], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]], expected: [[0.75, 0.75]] },
      { input: [[[1.0], [0.0]], [[5.0, 6.0]]], expected: [[5.0, 6.0], [0.0, 0.0]] },
    ],
    hint: "Each output row is a convex combination of the value rows weighted by the attention row.",
  },
  {
    id: "dl-037",
    title: "Multi-Head Split",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Split a (seq_len, d_model) matrix into num_heads attention heads of shape (seq_len, d_model / num_heads) by slicing contiguous column chunks.\n\nThe signature is split_heads(x, num_heads). Return a list of head matrices; head h uses columns [h * head_dim, (h + 1) * head_dim).",
    starterCode: `def split_heads(x, num_heads):
    # Your code here
    pass`,
    solution: `def split_heads(x, num_heads):
    seq = len(x)
    dim = len(x[0])
    head_dim = dim // num_heads
    heads = []
    for h in range(num_heads):
        head = []
        for i in range(seq):
            head.append([x[i][h * head_dim + j] for j in range(head_dim)])
        heads.append(head)
    return heads`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]], 2], expected: [[[1.0, 2.0], [5.0, 6.0]], [[3.0, 4.0], [7.0, 8.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1], expected: [[[1.0, 2.0], [3.0, 4.0]]] },
      { input: [[[1.0, 2.0, 3.0, 4.0]], 4], expected: [[[1.0]], [[2.0]], [[3.0]], [[4.0]]] },
      { input: [[[1.0, 2.0, 3.0, 4.0, 5.0, 6.0]], 3], expected: [[[1.0, 2.0]], [[3.0, 4.0]], [[5.0, 6.0]]] },
    ],
    hint: "Head h takes the contiguous column block starting at h * (d_model // num_heads).",
  },
  {
    id: "dl-038",
    title: "Multi-Head Merge",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Merge a list of attention heads, each shaped (seq_len, head_dim), back into one (seq_len, d_model) matrix by concatenating their columns in order.\n\nThe signature is merge_heads(heads). This is the inverse of split_heads.",
    starterCode: `def merge_heads(heads):
    # Your code here
    pass`,
    solution: `def merge_heads(heads):
    seq = len(heads[0])
    out = []
    for i in range(seq):
        row = []
        for h in range(len(heads)):
            row.extend(heads[h][i])
        out.append(row)
    return out`,
    testCases: [
      { input: [[[[1.0, 2.0], [5.0, 6.0]], [[3.0, 4.0], [7.0, 8.0]]]], expected: [[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]] },
      { input: [[[[1.0]], [[2.0]], [[3.0]]]], expected: [[1.0, 2.0, 3.0]] },
      { input: [[[[1.0, 2.0, 3.0]]]], expected: [[1.0, 2.0, 3.0]] },
      { input: [[[[1.0], [2.0]], [[3.0], [4.0]]]], expected: [[1.0, 3.0], [2.0, 4.0]] },
    ],
    hint: "For each position concatenate the same row from every head in head order.",
  },
  {
    id: "dl-039",
    title: "RNN Forward One Step",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "One step of a vanilla RNN: h = tanh(Wx @ x + Wh @ h_prev + b).\n\nThe signature is rnn_step(x, h_prev, Wx, Wh, b). Wx has shape (hidden, input_dim), Wh has shape (hidden, hidden) and b has length hidden.",
    starterCode: `import math
def rnn_step(x, h_prev, Wx, Wh, b):
    # Your code here
    pass`,
    solution: `import math
def rnn_step(x, h_prev, Wx, Wh, b):
    z = []
    for i in range(len(b)):
        s = b[i]
        for j in range(len(x)):
            s += Wx[i][j] * x[j]
        for j in range(len(h_prev)):
            s += Wh[i][j] * h_prev[j]
        z.append(math.tanh(s))
    return z`,
    testCases: [
      { input: [[1.0], [0.0], [[0.5]], [[0.5]], [0.0]], expected: [0.4621171573] },
      { input: [[0.0, 0.0], [0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[0.0, 0.0], [0.0, 0.0]], [0.0, 0.0]], expected: [0.0, 0.0] },
      { input: [[1.0, 2.0], [0.5, -0.5], [[1.0, 0.0], [0.0, 1.0]], [[0.1, 0.0], [0.0, 0.1]], [0.0, 0.0]], expected: [0.7818063576, 0.9603193885] },
      { input: [[], [1.0], [[]], [[0.5]], [0.0]], expected: [0.4621171573] },
    ],
    hint: "Compute the affine pre-activation for every hidden unit, then apply tanh.",
  },
  {
    id: "dl-040",
    title: "Gradient Clipping (Global Norm)",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Clip a list of gradient rows by their global L2 norm: if the norm of all entries exceeds max_norm, scale every entry by max_norm / norm; otherwise return the gradients unchanged.\n\nThe signature is clip_global_norm(grads, max_norm). grads is a list of equal-length rows.",
    starterCode: `import math
def clip_global_norm(grads, max_norm):
    # Your code here
    pass`,
    solution: `import math
def clip_global_norm(grads, max_norm):
    total = 0.0
    for row in grads:
        for v in row:
            total += v * v
    norm = math.sqrt(total)
    if norm > max_norm:
        scale = max_norm / norm
        return [[v * scale for v in row] for row in grads]
    return [list(row) for row in grads]`,
    testCases: [
      { input: [[[3.0, 4.0]], 5.0], expected: [[3.0, 4.0]] },
      { input: [[[3.0, 4.0]], 2.5], expected: [[1.5, 2.0]] },
      { input: [[[1.0, 1.0], [1.0, 1.0]], 10.0], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[[0.0, 0.0]], 1.0], expected: [[0.0, 0.0]] },
      { input: [[[6.0, 8.0], [0.0, 0.0]], 5.0], expected: [[3.0, 4.0], [0.0, 0.0]] },
    ],
    hint: "Square every element to get the global norm, then rescale the whole gradient by one shared factor.",
  },
  {
    id: "dl-041",
    title: "Perplexity From Logits",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute perplexity from logits and target token ids: perplexity = exp(mean over positions of the negative log softmax probability of the target). Use the log-sum-exp trick for stability.\n\nThe signature is perplexity(logits, targets). logits has shape (seq_len, vocab_size) and targets has length seq_len.",
    starterCode: `import math
def perplexity(logits, targets):
    # Your code here
    pass`,
    solution: `import math
def perplexity(logits, targets):
    total = 0.0
    for i, t in enumerate(targets):
        row = logits[i]
        m = max(row)
        lse = m + math.log(sum(math.exp(v - m) for v in row))
        total += lse - row[t]
    return math.exp(total / len(targets))`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0]], [2]], expected: 1.5032147244 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [0, 1]], expected: 2.0 },
      { input: [[[10.0, 0.0], [0.0, 10.0]], [0, 1]], expected: 1.0000453999 },
      { input: [[[2.0, 2.0, 2.0], [0.0, 0.0, 0.0]], [1, 2]], expected: 3.0 },
    ],
    hint: "A uniform distribution over V classes gives perplexity V; confident correct predictions give near 1.",
  },
  {
    id: "dl-042",
    title: "GELU (Tanh Approximation)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Apply the tanh approximation of GELU element-wise: 0.5 * x * (1 + tanh(sqrt(2 / pi) * (x + 0.044715 * x^3))).\n\nThe signature is gelu(x). Return a list of the same length.",
    starterCode: `import math
def gelu(x):
    # Your code here
    pass`,
    solution: `import math
def gelu(x):
    out = []
    c = math.sqrt(2.0 / math.pi)
    for v in x:
        inner = c * (v + 0.044715 * v * v * v)
        out.append(0.5 * v * (1.0 + math.tanh(inner)))
    return out`,
    testCases: [
      { input: [[0.0]], expected: [0.0] },
      { input: [[1.0, -1.0]], expected: [0.8411919906, -0.1588080094] },
      { input: [[2.0, -2.0, 0.5]], expected: [1.9545976941, -0.0454023059, 0.3457140098] },
      { input: [[100.0, -100.0]], expected: [100.0, 0.0] },
    ],
    hint: "The cubic term inside tanh is what distinguishes this approximation from plain tanh gating.",
  },
  {
    id: "dl-043",
    title: "Softmax + Cross-Entropy Backward",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Gradient of the cross-entropy loss with a softmax output with respect to the logits: p - one_hot(label), where p = softmax(logits).\n\nThe signature is softmax_ce_backward(logits, label). Return the gradient vector.",
    starterCode: `import math
def softmax_ce_backward(logits, label):
    # Your code here
    pass`,
    solution: `import math
def softmax_ce_backward(logits, label):
    m = max(logits)
    exps = [math.exp(v - m) for v in logits]
    total = sum(exps)
    p = [e / total for e in exps]
    p[label] -= 1.0
    return p`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2], expected: [0.0900305732, 0.2447284711, -0.3347590442] },
      { input: [[0.0, 0.0], 0], expected: [-0.5, 0.5] },
      { input: [[5.0, 5.0, 5.0], 1], expected: [0.3333333333, -0.6666666667, 0.3333333333] },
      { input: [[1000.0, 1000.0], 1], expected: [0.5, -0.5] },
    ],
    hint: "The softmax and cross-entropy derivatives cancel beautifully: subtract 1 from the target class probability.",
  },
  {
    id: "dl-044",
    title: "BatchNorm Backward (Simplified)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Backward pass through training-mode batch normalization for one feature with gamma = 1 and beta = 0. Given the upstream gradient dout and the input batch x, return dx_i = (1 / (n * std)) * (n * dout_i - sum(dout) - x_hat_i * sum(dout * x_hat)), where x_hat is the normalized input and std = sqrt(var + eps).\n\nThe signature is batchnorm_backward(dout, x, eps=1e-5).",
    starterCode: `import math
def batchnorm_backward(dout, x, eps=1e-5):
    # Your code here
    pass`,
    solution: `import math
def batchnorm_backward(dout, x, eps=1e-5):
    n = len(x)
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    inv = 1.0 / math.sqrt(var + eps)
    xhat = [(v - mean) * inv for v in x]
    s = sum(dout)
    s2 = sum(dout[i] * xhat[i] for i in range(n))
    return [inv / n * (n * dout[i] - s - xhat[i] * s2) for i in range(n)]`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], [1.0, 2.0, 3.0]], expected: [0.0, 0.0, 0.0] },
      { input: [[1.0, -1.0], [0.0, 2.0]], expected: [9.9999e-06, -9.9999e-06] },
      { input: [[2.0, -1.0, 0.5], [1.0, 3.0, 5.0]], expected: [0.4592801879, -0.9185569313, 0.4592767433] },
      { input: [[1.0, 2.0], [-1.0, 1.0]], expected: [-4.9999e-06, 4.9999e-06] },
    ],
    hint: "There are three terms: the upstream gradient, a mean correction and a variance correction.",
  },
  {
    id: "dl-045",
    title: "LSTM Gates Forward",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One LSTM cell step. W is a list of four weight matrices [Wf, Wi, Wg, Wo], each shaped (units, input_dim + units), and b is a list of four bias vectors [bf, bi, bg, bo]. Each matrix concatenates input weights and recurrent weights, so the pre-activation is W @ [x, h_prev] + b.\n\nWith f, i, o the sigmoids of the forget, input and output gates and g = tanh of the cell gate: c = f * c_prev + i * g and h = o * tanh(c). The signature is lstm_cell(x, h_prev, c_prev, W, b). Return [h, c].",
    starterCode: `import math
def lstm_cell(x, h_prev, c_prev, W, b):
    # Your code here
    pass`,
    solution: `import math
def lstm_cell(x, h_prev, c_prev, W, b):
    def affine(Wm, bv):
        out = []
        for i in range(len(bv)):
            s = bv[i]
            for j in range(len(x)):
                s += Wm[i][j] * x[j]
            for j in range(len(h_prev)):
                s += Wm[i][len(x) + j] * h_prev[j]
            out.append(s)
        return out

    def sig(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    f = [sig(v) for v in affine(W[0], b[0])]
    i = [sig(v) for v in affine(W[1], b[1])]
    g = [math.tanh(v) for v in affine(W[2], b[2])]
    o = [sig(v) for v in affine(W[3], b[3])]
    c = [f[k] * c_prev[k] + i[k] * g[k] for k in range(len(c_prev))]
    h = [o[k] * math.tanh(c[k]) for k in range(len(c))]
    return [h, c]`,
    testCases: [
      { input: [[1.0], [0.0], [0.0], [[[0.0, 0.0]], [[0.0, 0.0]], [[0.0, 0.0]], [[0.0, 0.0]]], [[0.0], [0.0], [0.0], [0.0]]], expected: [[0.0], [0.0]] },
      { input: [[1.0], [0.0], [1.0], [[[5.0, 0.0]], [[0.0, 0.0]], [[0.0, 0.0]], [[0.0, 0.0]]], [[0.0], [0.0], [0.0], [0.0]]], expected: [[0.3793844859], [0.9933071491]] },
      { input: [[2.0], [0.0], [0.0], [[[0.0, 0.0]], [[0.0, 0.0]], [[1.0, 0.0]], [[0.0, 0.0]]], [[0.0], [0.0], [0.0], [0.0]]], expected: [[0.2239274687], [0.48201379]] },
      { input: [[1.0, 2.0], [0.5], [0.5], [[[0.5, 0.5, 0.1]], [[0.5, 0.5, 0.1]], [[0.5, 0.5, 0.1]], [[0.5, 0.5, 0.1]]], [[0.1], [0.1], [0.1], [0.1]]], expected: [[0.6990010696], [1.198655871]] },
    ],
    hint: "The gate order is forget, input, cell, output; the cell state uses a running sum, not a dot product.",
  },
  {
    id: "dl-046",
    title: "GRU Gates Forward",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "One GRU cell step with reset and update gates. W = [Wz, Wr, Wh] and U = [Uz, Ur, Uh] hold the input and recurrent weight matrices, and b = [bz, br, bh] the biases.\n\nCompute z = sigmoid(Wz x + Uz h + bz), r = sigmoid(Wr x + Ur h + br), n = tanh(Wh x + Uh (r * h) + bh) and h_new = (1 - z) * h + z * n, where * is element-wise. The signature is gru_cell(x, h_prev, W, U, b). Return the new hidden vector.",
    starterCode: `import math
def gru_cell(x, h_prev, W, U, b):
    # Your code here
    pass`,
    solution: `import math
def gru_cell(x, h_prev, W, U, b):
    def sig(z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        e = math.exp(z)
        return e / (1.0 + e)

    def affine(Wm, Um, bv, hh):
        out = []
        for i in range(len(bv)):
            s = bv[i]
            for j in range(len(x)):
                s += Wm[i][j] * x[j]
            for j in range(len(hh)):
                s += Um[i][j] * hh[j]
            out.append(s)
        return out

    z = [sig(v) for v in affine(W[0], U[0], b[0], h_prev)]
    r = [sig(v) for v in affine(W[1], U[1], b[1], h_prev)]
    rh = [r[j] * h_prev[j] for j in range(len(h_prev))]
    n = [math.tanh(v) for v in affine(W[2], U[2], b[2], rh)]
    return [(1.0 - z[j]) * h_prev[j] + z[j] * n[j] for j in range(len(h_prev))]`,
    testCases: [
      { input: [[1.0], [1.0], [[[0.0, 0.0]], [[0.0, 0.0]], [[0.0, 0.0]]], [[[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0]]], expected: [0.5] },
      { input: [[1.0], [0.0], [[[10.0, 0.0]], [[0.0, 0.0]], [[1.0, 0.0]]], [[[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0]]], expected: [0.7615595812] },
      { input: [[1.0], [1.0], [[[0.0, 0.0]], [[10.0, 0.0]], [[1.0, 0.0]]], [[[0.0]], [[0.0]], [[0.0]]], [[0.0], [0.0], [0.0]]], expected: [0.880797078] },
      { input: [[0.5, -0.5], [0.2], [[[0.1, 0.2, 0.3]], [[0.1, 0.2, 0.3]], [[0.1, 0.2, 0.3]]], [[[0.5]], [[0.5]], [[0.5]]], [[0.0], [0.0], [0.0]]], expected: [0.0981410087] },
    ],
    hint: "The reset gate scales the previous hidden state only inside the candidate pre-activation.",
  },
  {
    id: "dl-047",
    title: "Beam Search One Step (Beam 2)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Expand a beam by combining each beam's cumulative score with its per-token log-probabilities: candidate score = beam_scores[b] + token_logprobs[b][t]. Return the top two candidates sorted by score descending, breaking ties by smaller beam index and then smaller token index.\n\nThe signature is beam_search_step(beam_scores, token_logprobs). Return a list of [beam_index, token_index, score].",
    starterCode: `def beam_search_step(beam_scores, token_logprobs):
    # Your code here
    pass`,
    solution: `def beam_search_step(beam_scores, token_logprobs):
    cands = []
    for bi in range(len(beam_scores)):
        for ti in range(len(token_logprobs[bi])):
            cands.append((beam_scores[bi] + token_logprobs[bi][ti], bi, ti))
    cands.sort(key=lambda t: (-t[0], t[1], t[2]))
    return [[bi, ti, sc] for sc, bi, ti in cands[:2]]`,
    testCases: [
      { input: [[0.0, -1.0], [[-0.5, -2.0], [-0.5, -3.0]]], expected: [[0, 0, -0.5], [1, 0, -1.5]] },
      { input: [[0.0, 0.0], [[-1.0, -1.0], [-1.0, -1.0]]], expected: [[0, 0, -1.0], [0, 1, -1.0]] },
      { input: [[-0.1, -0.2], [[-0.1, -5.0], [-0.05, -5.0]]], expected: [[0, 0, -0.2], [1, 0, -0.25]] },
      { input: [[-1.0, -2.0, -3.0], [[-1.0], [-0.5], [-0.1]]], expected: [[0, 0, -2.0], [1, 0, -2.5]] },
    ],
    hint: "Enumerate beam-token pairs, add the log-probabilities to the beam scores, then sort with a deterministic tie-break.",
  },
  {
    id: "dl-048",
    title: "Label Smoothing Cross-Entropy",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Cross-entropy with label smoothing for a single example: (1 - smoothing) * (-log p_target) + (smoothing / (num_classes - 1)) * sum over k != target of (-log p_k), where p is the softmax of the logits. Use a stable log-softmax.\n\nThe signature is label_smoothing_ce(logits, target, smoothing). Assume at least two classes.",
    starterCode: `import math
def label_smoothing_ce(logits, target, smoothing):
    # Your code here
    pass`,
    solution: `import math
def label_smoothing_ce(logits, target, smoothing):
    n = len(logits)
    m = max(logits)
    lse = m + math.log(sum(math.exp(v - m) for v in logits))
    logp = [v - lse for v in logits]
    loss = 0.0
    for k in range(n):
        if k == target:
            loss += (1.0 - smoothing) * (-logp[k])
        else:
            loss += (smoothing / (n - 1)) * (-logp[k])
    return loss`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2, 0.0], expected: 0.4076059644 },
      { input: [[1.0, 2.0, 3.0], 2, 0.1], expected: 0.5576059644 },
      { input: [[0.0, 0.0], 0, 0.2], expected: 0.6931471806 },
      { input: [[2.0, 1.0, 0.0], 0, 0.3], expected: 0.8576059644 },
    ],
    hint: "Smoothing adds a small uniform target mass to every incorrect class, all sharing one coefficient.",
  },
  {
    id: "dl-049",
    title: "Numeric Gradient Check (L2 Error)",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Relative L2 error between an analytic and a numeric gradient: ||a - n||_2 / (||a||_2 + ||n||_2 + 1e-8).\n\nThe signature is gradient_check_error(analytic, numeric). Near 0 means the gradients agree.",
    starterCode: `import math
def gradient_check_error(analytic, numeric):
    # Your code here
    pass`,
    solution: `import math
def gradient_check_error(analytic, numeric):
    diff = math.sqrt(sum((a - b) ** 2 for a, b in zip(analytic, numeric)))
    denom = math.sqrt(sum(a * a for a in analytic)) + math.sqrt(sum(b * b for b in numeric)) + 1e-8
    return diff / denom`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 0.7071067777 },
      { input: [[0.5, -0.5], [0.5, -0.5]], expected: 0.0 },
      { input: [[3.0, 4.0], [3.0001, 4.0]], expected: 9.9999e-06 },
      { input: [[1e-08, 0.0], [0.0, 1e-08]], expected: 0.4714045208 },
    ],
    hint: "Normalize the difference norm by the sum of the two gradient norms plus a small constant.",
  },
  {
    id: "dl-050",
    title: "MLP FLOPs",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Count the multiply-add FLOPs of a forward pass through a 2-layer MLP, treating one multiply-add as 2 FLOPs: 2 * input_dim * hidden_dim + 2 * hidden_dim * output_dim.\n\nThe signature is mlp_flops(input_dim, hidden_dim, output_dim). Return an integer.",
    starterCode: `def mlp_flops(input_dim, hidden_dim, output_dim):
    # Your code here
    pass`,
    solution: `def mlp_flops(input_dim, hidden_dim, output_dim):
    return 2 * input_dim * hidden_dim + 2 * hidden_dim * output_dim`,
    testCases: [
      { input: [4, 8, 2], expected: 96 },
      { input: [784, 128, 10], expected: 203264 },
      { input: [1, 1, 1], expected: 4 },
      { input: [3, 3, 3], expected: 36 },
    ],
    hint: "Each layer contributes twice the product of its input and output sizes; biases are ignored.",
  },
];
