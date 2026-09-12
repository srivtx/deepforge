import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-001",
    title: "Gradient Descent",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimize f(x) = x^2 using gradient descent.\n\nStart at x = start. For n_iters iterations:\n  grad = 2 * x\n  x = x - learning_rate * grad\n\nReturn the final value of x.",
    starterCode: `def gradient_descent(start, learning_rate, n_iters):
    # Minimize f(x) = x ** 2
    # Your code here
    pass`,
    solution: `def gradient_descent(start, learning_rate, n_iters):
    x = start
    for _ in range(n_iters):
        grad = 2 * x
        x = x - learning_rate * grad
    return x`,
    testCases: [
      { input: [10, 0.1, 100], expected: 0.0 },
      { input: [5, 0.05, 50], expected: 0.02576887603660058 },
      { input: [1, 0.5, 1], expected: 0.0 },
      { input: [0, 0.1, 100], expected: 0.0 },
    ],
    hint: "df/dx = 2x. Update rule: x = x - lr * 2x.",
  },
  {
    id: "op-002",
    title: "Mini-Batch SGD for Linear Regression",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Fit y = w*x + b using mini-batch stochastic gradient descent with MSE loss.\n\nInitialize w = 0, b = 0. For n_epochs epochs, iterate over X in batches of batch_size (no shuffling).\n\nPer batch of m samples:\n  gw = (2/m) * sum((w*xi + b - yi) * xi)\n  gb = (2/m) * sum(w*xi + b - yi)\n  w = w - lr * gw\n  b = b - lr * gb\n\nReturn [w, b].",
    starterCode: `def sgd_linear(X, y, lr, n_epochs, batch_size):
    # Returns [w, b]
    # Your code here
    pass`,
    solution: `def sgd_linear(X, y, lr, n_epochs, batch_size):
    n = len(X)
    w = 0.0
    b = 0.0
    for _ in range(n_epochs):
        for start in range(0, n, batch_size):
            end = min(start + batch_size, n)
            Xb = X[start:end]
            yb = y[start:end]
            gw = 0.0
            gb = 0.0
            for xi, yi in zip(Xb, yb):
                err = w * xi + b - yi
                gw += 2 * err * xi
                gb += 2 * err
            m = len(Xb)
            w -= lr * gw / m
            b -= lr * gb / m
    return [w, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [2, 4, 6, 8, 10, 12], 0.01, 2000, 2], expected: [2.0, 0.0] },
      { input: [[1, 2, 3], [3, 5, 7], 0.05, 1000, 1], expected: [2.0, 1.0] },
      { input: [[1, 2, 3], [1, 3, 5], 0.05, 2000, 1], expected: [2.0, -1.0] },
    ],
    hint: "Standard gradient: dL/dw = 2*err*xi, dL/db = 2*err. Average over the batch.",
  },
  {
    id: "op-003",
    title: "Momentum Optimizer",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Minimize f(x) = x^2 using gradient descent with momentum.\n\nv starts at 0. For n_iters iterations:\n  grad = 2 * x\n  v = momentum * v - learning_rate * grad\n  x = x + v\n\nReturn the final value of x.",
    starterCode: `def momentum_gradient_descent(start, learning_rate, momentum, n_iters):
    # Minimize f(x) = x ** 2
    # Your code here
    pass`,
    solution: `def momentum_gradient_descent(start, learning_rate, momentum, n_iters):
    x = start
    v = 0.0
    for _ in range(n_iters):
        grad = 2 * x
        v = momentum * v - learning_rate * grad
        x = x + v
    return x`,
    testCases: [
      { input: [10, 0.01, 0.9, 2000], expected: 0.0 },
      { input: [5, 0.1, 0.5, 50], expected: 0.0 },
      { input: [0, 0.1, 0.9, 100], expected: 0.0 },
    ],
    hint: "Velocity is a running average of past gradients. x += v, not x -= lr*grad.",
  },
  {
    id: "op-004",
    title: "Adam Optimizer",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Minimize f(x) = x^2 using the Adam optimizer.\n\nInitialize m = 0, v = 0. For t = 1 to n_iters:\n  grad = 2 * x\n  m = beta1 * m + (1 - beta1) * grad\n  v = beta2 * v + (1 - beta2) * grad^2\n  m_hat = m / (1 - beta1^t)\n  v_hat = v / (1 - beta2^t)\n  x = x - lr * m_hat / (sqrt(v_hat) + eps)\n\nReturn the final value of x.",
    starterCode: `def adam_gradient_descent(start, lr, beta1, beta2, eps, n_iters):
    # Minimize f(x) = x ** 2
    # Your code here
    pass`,
    solution: `def adam_gradient_descent(start, lr, beta1, beta2, eps, n_iters):
    x = start
    m = 0.0
    v = 0.0
    for t in range(1, n_iters + 1):
        grad = 2 * x
        m = beta1 * m + (1 - beta1) * grad
        v = beta2 * v + (1 - beta2) * grad * grad
        m_hat = m / (1 - beta1 ** t)
        v_hat = v / (1 - beta2 ** t)
        x = x - lr * m_hat / (v_hat ** 0.5 + eps)
    return x`,
    testCases: [
      { input: [10, 0.1, 0.9, 0.999, 1e-8, 500], expected: 0.0 },
      { input: [5, 0.1, 0.9, 0.999, 1e-8, 1000], expected: 0.0 },
      { input: [0, 0.1, 0.9, 0.999, 1e-8, 100], expected: 0.0 },
    ],
    hint: "Bias-correct m and v by dividing by (1 - beta^t). Watch the order: v_hat ** 0.5 + eps.",
  },
  {
    id: "op-005",
    title: "Exponential LR Schedule",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the learning rate at a given step using exponential decay:\n\nlr(step) = initial_lr * decay_rate^step",
    starterCode: `def exponential_lr_schedule(initial_lr, decay_rate, step):
    # Your code here
    pass`,
    solution: `def exponential_lr_schedule(initial_lr, decay_rate, step):
    return initial_lr * (decay_rate ** step)`,
    testCases: [
      { input: [0.1, 0.95, 10], expected: 0.059873693923683786 },
      { input: [0.01, 0.9, 0], expected: 0.01 },
      { input: [1.0, 0.5, 5], expected: 0.03125 },
      { input: [0.1, 1.0, 100], expected: 0.1 },
    ],
  },
];
