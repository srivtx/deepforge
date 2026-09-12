import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "dl-001",
    title: "ReLU",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the ReLU activation function element-wise.\n\nIf the input is a list, return a list where each element is max(0, x_i).\nIf the input is a number, return max(0, x).",
    starterCode: `def relu(x):
    # Your code here
    pass`,
    solution: `def relu(x):
    if isinstance(x, list):
        return [max(0.0, v) for v in x]
    return max(0.0, x)`,
    testCases: [
      { input: [[-1, 0, 1, 2]], expected: [0.0, 0.0, 1.0, 2.0] },
      { input: [-5], expected: 0.0 },
      { input: [5], expected: 5.0 },
      { input: [[3, -3, 0]], expected: [3.0, 0.0, 0.0] },
    ],
  },
  {
    id: "dl-002",
    title: "Sigmoid (Vector)",
    category: "Deep Learning",
    difficulty: "Easy",
    description:
      "Apply the logistic sigmoid function element-wise to a list of values: σ(z) = 1 / (1 + exp(-z)).\n\nHandle large positive and negative values without overflow.",
    starterCode: `import math
def sigmoid_vector(z):
    # Your code here
    pass`,
    solution: `import math
def sigmoid_vector(z):
    def s(v):
        if v >= 0:
            return 1.0 / (1.0 + math.exp(-v))
        ev = math.exp(v)
        return ev / (1.0 + ev)
    return [s(v) for v in z]`,
    testCases: [
      { input: [[0, 0, 0]], expected: [0.5, 0.5, 0.5] },
      { input: [[100, -100, 0]], expected: [1.0, 0.0, 0.5] },
      { input: [[1, 2]], expected: [0.7310585786300049, 0.8807970779778823] },
    ],
    hint: "Factor out the stable scalar sigmoid from ml-002.",
  },
  {
    id: "dl-003",
    title: "Softmax",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Compute the softmax of a vector x: softmax(x)_i = exp(x_i) / sum(exp(x_j)).\n\nSubtract the max of x before exponentiating for numerical stability.",
    starterCode: `import math
def softmax(x):
    # Your code here
    pass`,
    solution: `import math
def softmax(x):
    m = max(x)
    exps = [math.exp(v - m) for v in x]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748219] },
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[1000, 1000, 1000]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [[0]], expected: [1.0] },
    ],
    hint: "Subtract the max value from each element before exp() to prevent overflow.",
  },
  {
    id: "dl-004",
    title: "MLP Forward Pass",
    category: "Deep Learning",
    difficulty: "Medium",
    description:
      "Forward pass of a 2-layer MLP with ReLU hidden activation and linear output.\n\nz1 = W1 @ x + b1   (shape: hidden)\na1 = relu(z1)\nz2 = W2 @ a1 + b2  (shape: output)\n\nReturn z2 (the output layer pre-activation).\n\nW1 is shape (hidden, input), W2 is shape (output, hidden).",
    starterCode: `def mlp_forward(x, W1, b1, W2, b2):
    # Your code here
    pass`,
    solution: `def mlp_forward(x, W1, b1, W2, b2):
    z1 = [sum(W1[i][j] * x[j] for j in range(len(x))) + b1[i] for i in range(len(W1))]
    a1 = [max(0.0, v) for v in z1]
    z2 = [sum(W2[i][j] * a1[j] for j in range(len(a1))) + b2[i] for i in range(len(W2))]
    return z2`,
    testCases: [
      {
        input: [[1.0], [[0.5], [-0.5]], [0.0, 0.0], [[1.0, 1.0]], [0.0]],
        expected: [0.5],
      },
      {
        input: [[1.0, 2.0], [[1, 0], [0, 1]], [0.0, 0.0], [[1.0, 1.0]], [0.0]],
        expected: [3.0],
      },
      {
        input: [[2.0, -1.0], [[1, 1], [1, -1]], [0.0, 0.0], [[2, 0], [0, 1]], [0.0, 0.0]],
        expected: [2.0, 3.0],
      },
    ],
    hint: "Two matrix-vector products and a ReLU. Output is linear (no activation).",
  },
  {
    id: "dl-005",
    title: "Backprop Gradient",
    category: "Deep Learning",
    difficulty: "Hard",
    description:
      "Compute gradients of MSE loss (L = 0.5 * sum((y_pred - y_true)^2)) for a 2-layer MLP with ReLU hidden activation and linear output.\n\nForward:\n  z1 = W1 @ x + b1\n  a1 = relu(z1)\n  z2 = W2 @ a1 + b2 = y_pred\n\nBackward (let dz2 = y_pred - y_true):\n  gW2[i][j] = dz2[i] * a1[j]\n  gb2[i]    = dz2[i]\n  da1[j]    = sum_i(W2[i][j] * dz2[i])\n  dz1[j]    = da1[j] if z1[j] > 0 else 0\n  gW1[i][j] = dz1[i] * x[j]\n  gb1[i]    = dz1[i]\n\nReturn [gW2, gb2, gW1, gb1].",
    starterCode: `def backprop_gradient(x, y_true, W1, b1, W2, b2):
    # Returns [gW2, gb2, gW1, gb1]
    # Your code here
    pass`,
    solution: `def backprop_gradient(x, y_true, W1, b1, W2, b2):
    z1 = [sum(W1[i][j] * x[j] for j in range(len(x))) + b1[i] for i in range(len(W1))]
    a1 = [max(0.0, v) for v in z1]
    z2 = [sum(W2[i][j] * a1[j] for j in range(len(a1))) + b2[i] for i in range(len(W2))]
    dz2 = [z2[i] - y_true[i] for i in range(len(z2))]
    gW2 = [[dz2[i] * a1[j] for j in range(len(a1))] for i in range(len(W2))]
    gb2 = list(dz2)
    da1 = [sum(W2[k][i] * dz2[k] for k in range(len(W2))) for i in range(len(a1))]
    dz1 = [da1[i] if z1[i] > 0 else 0.0 for i in range(len(z1))]
    gW1 = [[dz1[i] * x[j] for j in range(len(x))] for i in range(len(W1))]
    gb1 = list(dz1)
    return [gW2, gb2, gW1, gb1]`,
    testCases: [
      {
        input: [
          [1.0],
          [1.0],
          [[0.5], [-0.5]],
          [0.0, 0.0],
          [[1.0, 1.0]],
          [0.0],
        ],
        expected: [[[-0.25, 0.0]], [-0.5], [[-0.5], [0.0]], [-0.5, 0.0]],
      },
      {
        input: [
          [1.0, 2.0],
          [5.0],
          [[1.0, 0.0], [0.0, 1.0]],
          [0.0, 0.0],
          [[1.0, 1.0]],
          [0.0],
        ],
        expected: [[[-2.0, -4.0]], [-2.0], [[-2.0, -4.0], [-2.0, -4.0]], [-2.0, -2.0]],
      },
      {
        input: [
          [2.0],
          [3.0],
          [[1.0]],
          [1.0],
          [[2.0]],
          [0.5],
        ],
        expected: [[[10.5]], [3.5], [[14.0]], [7.0]],
      },
    ],
    hint: "Work backwards from dz2 = y_pred - y_true. Multiply by local Jacobians at each layer.",
  },
];
