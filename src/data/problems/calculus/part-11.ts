import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-336",
    title: "Sigmoid Second Derivative Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The sigmoid has second derivative sigmoid(z) * (1 - sigmoid(z)) * (1 - 2 * sigmoid(z)).\n\nGiven the values z, return the second derivative list.",
    starterCode: `def sigmoid_second_derivative(values):
    # Your code here
    pass`,
    solution: `def sigmoid_second_derivative(values):
    import math
    out = []
    for z in values:
        s = 1.0 / (1.0 + math.exp(-z))
        out.append(s * (1.0 - s) * (1.0 - 2.0 * s))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.0, -0.09085774767294842, 0.09085774767294842] },
      { input: [[2, -2]], expected: [-0.07996250105615312, 0.07996250105615305] },
      { input: [[0.5, 3.0]], expected: [-0.05755679485232076, -0.04089157466094337] },
    ],
    hint: "Differentiate s(1 - s) once more with the chain rule.",
  },
  {
    id: "ca-337",
    title: "Tanh Second Derivative Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The hyperbolic tangent has derivative 1 - tanh(z)^2 and second derivative -2 * tanh(z) * (1 - tanh(z)^2).\n\nGiven the values z, return the second derivative list.",
    starterCode: `def tanh_second_derivative(values):
    # Your code here
    pass`,
    solution: `def tanh_second_derivative(values):
    import math
    out = []
    for z in values:
        t = math.tanh(z)
        out.append(-2.0 * t * (1.0 - t * t))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [-0.0, -0.6397000084492246, 0.6397000084492246] },
      { input: [[2, -2]], expected: [-0.13621868742711296, 0.13621868742711296] },
      { input: [[0.5, 3.0]], expected: [-0.7268619813835873, -0.019634494363042477] },
    ],
    hint: "Differentiate t' = 1 - t^2 and use the chain rule with t' again.",
  },
  {
    id: "ca-338",
    title: "Softplus Second Derivative Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Softplus has first derivative sigmoid(z), so its second derivative is sigmoid(z) * (1 - sigmoid(z)).\n\nGiven the values z, return the second derivative list using a stable sigmoid.",
    starterCode: `def softplus_second_derivative(values):
    # Your code here
    pass`,
    solution: `def softplus_second_derivative(values):
    import math
    out = []
    for z in values:
        if z >= 0:
            s = 1.0 / (1.0 + math.exp(-z))
        else:
            e = math.exp(z)
            s = e / (1.0 + e)
        out.append(s * (1.0 - s))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.25, 0.19661193324148185, 0.19661193324148185] },
      { input: [[5, -5]], expected: [0.006648056670790033, 0.0066480566707901555] },
      { input: [[2.0, -2.0]], expected: [0.10499358540350662, 0.1049935854035065] },
    ],
    hint: "The second derivative of softplus is the derivative of the sigmoid.",
  },
  {
    id: "ca-339",
    title: "Swish Second Derivative Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For swish(z) = z * sigmoid(z), the second derivative is 2 s (1 - s) + z s (1 - s) (1 - 2 s) with s = sigmoid(z).\n\nGiven the values z, return the second derivative list.",
    starterCode: `def swish_second_derivative(values):
    # Your code here
    pass`,
    solution: `def swish_second_derivative(values):
    import math
    out = []
    for z in values:
        s = 1.0 / (1.0 + math.exp(-z))
        out.append(2.0 * s * (1.0 - s) + z * s * (1.0 - s) * (1.0 - 2.0 * s))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.5, 0.3023661188100153, 0.3023661188100153] },
      { input: [[2, -2]], expected: [0.050062168694707004, 0.05006216869470692] },
      { input: [[0.5, 3.0]], expected: [0.4412290269770286, -0.03232140452100614] },
    ],
    hint: "Differentiate f' = s + z s (1 - s) term by term.",
  },
  {
    id: "ca-340",
    title: "Bernoulli NLL Gradient in Probability",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the Bernoulli negative log-likelihood L(p) = -y log(p) - (1 - y) log(1 - p), the derivative with respect to p is -y / p + (1 - y) / (1 - p).\n\nGiven p and y, return the derivative value.",
    starterCode: `def bernoulli_nll_gradient(p, y):
    # Your code here
    pass`,
    solution: `def bernoulli_nll_gradient(p, y):
    return -y / p + (1.0 - y) / (1.0 - p)`,
    testCases: [
      { input: [0.5, 1], expected: -2.0 },
      { input: [0.25, 0], expected: 1.3333333333333333 },
      { input: [0.8, 1], expected: -1.25 },
    ],
    hint: "Differentiate each log separately; one term vanishes depending on y.",
  },
  {
    id: "ca-341",
    title: "Categorical Cross-Entropy Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For categorical cross-entropy L(p) = -sum_i y_i log(p_i), the gradient with respect to p is -y_i / p_i elementwise.\n\nGiven the probability vector and the one-hot target vector, return the gradient list.",
    starterCode: `def categorical_cross_entropy_gradient(probs, targets):
    # Your code here
    pass`,
    solution: `def categorical_cross_entropy_gradient(probs, targets):
    return [-t / p for p, t in zip(probs, targets)]`,
    testCases: [
      { input: [[0.5, 0.5], [1, 0]], expected: [-2.0, 0.0] },
      { input: [[0.2, 0.3, 0.5], [0, 0, 1]], expected: [0.0, 0.0, -2.0] },
      { input: [[0.25, 0.75], [0, 1]], expected: [0.0, -1.3333333333333333] },
    ],
    hint: "Only the target class contributes a nonzero gradient.",
  },
  {
    id: "ca-342",
    title: "Forward KL Gradient in q",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The forward KL divergence KL(p || q) = sum_i p_i log(p_i / q_i) has derivative with respect to q_i equal to -p_i / q_i.\n\nGiven the discrete distributions p and q, return the gradient vector with respect to q.",
    starterCode: `def forward_kl_gradient_q(p, q):
    # Your code here
    pass`,
    solution: `def forward_kl_gradient_q(p, q):
    return [-pi / qi for pi, qi in zip(p, q)]`,
    testCases: [
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: [-2.0, -0.6666666666666666] },
      { input: [[0.2, 0.8], [0.5, 0.5]], expected: [-0.4, -1.6] },
      { input: [[1.0, 0.0], [0.4, 0.6]], expected: [-2.5, -0.0] },
    ],
    hint: "log(p/q) is linear in log q, so only the -log q term differentiates.",
  },
  {
    id: "ca-343",
    title: "Reverse KL Gradient in q",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The reverse KL divergence KL(q || p) = sum_i q_i log(q_i / p_i) has derivative with respect to q_i equal to log(q_i / p_i) + 1.\n\nGiven the discrete distributions q and p, return the gradient vector with respect to q.",
    starterCode: `def reverse_kl_gradient_q(q, p):
    # Your code here
    pass`,
    solution: `def reverse_kl_gradient_q(q, p):
    import math
    return [math.log(qi / pi) + 1.0 for qi, pi in zip(q, p)]`,
    testCases: [
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: [1.6931471805599454, 0.5945348918918356] },
      { input: [[0.2, 0.8], [0.5, 0.5]], expected: [0.083709268125845, 1.4700036292457357] },
      { input: [[0.25, 0.75], [0.25, 0.75]], expected: [1.0, 1.0] },
    ],
    hint: "Apply the product rule to q log(q/p).",
  },
  {
    id: "ca-344",
    title: "Log-Softmax Jacobian Matrix",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For y = log softmax(z), the Jacobian is I - 1 s^T, where s = softmax(z): diagonal entries 1 - s_i and off-diagonal entries -s_j.\n\nGiven the logits, return the Jacobian as nested rows.",
    starterCode: `def log_softmax_jacobian(logits):
    # Your code here
    pass`,
    solution: `def log_softmax_jacobian(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    z = sum(e)
    s = [v / z for v in e]
    n = len(s)
    return [[(1.0 - s[j]) if i == j else -s[j] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[0, 0]], expected: [[0.5, -0.5], [-0.5, 0.5]] },
      { input: [[1, 2, 3]], expected: [[0.9099694268296196, -0.24472847105479764, -0.6652409557748218], [-0.09003057317038046, 0.7552715289452023, -0.6652409557748218], [-0.09003057317038046, -0.24472847105479764, 0.3347590442251782]] },
      { input: [[0, 0, 0, 0]], expected: [[0.75, -0.25, -0.25, -0.25], [-0.25, 0.75, -0.25, -0.25], [-0.25, -0.25, 0.75, -0.25], [-0.25, -0.25, -0.25, 0.75]] },
    ],
    hint: "Each row i subtracts the same softmax vector from the identity row.",
  },
  {
    id: "ca-345",
    title: "Softmax Cross-Entropy Logit Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the one-hot cross-entropy loss with softmax outputs, the gradient with respect to the logits is p - y, where p = softmax(logits).\n\nGiven the logits and the correct class index, return the gradient vector.",
    starterCode: `def softmax_cross_entropy_logit_gradient(logits, label):
    # Your code here
    pass`,
    solution: `def softmax_cross_entropy_logit_gradient(logits, label):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    z = sum(e)
    p = [v / z for v in e]
    p[label] -= 1.0
    return p`,
    testCases: [
      { input: [[0, 0], 0], expected: [-0.5, 0.5] },
      { input: [[1, 2, 3], 2], expected: [0.09003057317038046, 0.24472847105479764, -0.3347590442251782] },
      { input: [[0, 0, 0, 0], 1], expected: [0.25, -0.75, 0.25, 0.25] },
    ],
    hint: "The softmax cancels the log and leaves p minus the one-hot target.",
  },
  {
    id: "ca-346",
    title: "Taylor Cosine Series Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The Maclaurin series of cos(x) is sum_{k>=0} (-1)^k x^(2k) / (2k)!.\n\nGiven x and the number of terms, return the partial sum.",
    starterCode: `def taylor_cosine_series_value(x, terms):
    # Your code here
    pass`,
    solution: `def taylor_cosine_series_value(x, terms):
    import math
    total = 0.0
    for k in range(terms):
        total += ((-1) ** k) * x ** (2 * k) / math.factorial(2 * k)
    return total`,
    testCases: [
      { input: [1.0, 5], expected: 0.5403025793650793 },
      { input: [0.5, 3], expected: 0.8776041666666666 },
      { input: [-2.0, 8], expected: -0.4161468396389032 },
    ],
    hint: "Start from 1 at k = 0 and alternate signs with even factorials.",
  },
  {
    id: "ca-347",
    title: "Exponential Series Terms Needed",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Maclaurin series of exp(x) has terms |x|^k / k!. Return the smallest number of terms n (starting at k = 0) such that the first omitted term has magnitude below eps.\n\nFor x = 0 the answer is 1. Given x and eps, return n.",
    starterCode: `def exponential_series_terms_needed(x, eps):
    # Your code here
    pass`,
    solution: `def exponential_series_terms_needed(x, eps):
    term = 1.0
    k = 0
    while term >= eps:
        k += 1
        term = term * abs(x) / k
    return k`,
    testCases: [
      { input: [1.0, 0.01], expected: 5 },
      { input: [2.0, 1e-06], expected: 14 },
      { input: [0.0, 2.0], expected: 0 },
    ],
    hint: "Update each term from the previous one by multiplying by |x| and dividing by the new index.",
  },
  {
    id: "ca-348",
    title: "Alternating Series Remainder Bound",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For an alternating series with decreasing term magnitudes, the truncation error after using the first n terms is bounded by the magnitude of the next term.\n\nGiven the list of term magnitudes and the number of terms used, return the bound; return None when there is no next term.",
    starterCode: `def alternating_series_remainder_bound(terms, used):
    # Your code here
    pass`,
    solution: `def alternating_series_remainder_bound(terms, used):
    if used >= len(terms):
        return None
    return abs(terms[used])`,
    testCases: [
      { input: [[1.0, 0.5, 0.25, 0.125], 2], expected: 0.25 },
      { input: [[1.0, 0.1], 0], expected: 1.0 },
      { input: [[2.0, 1.0], 2], expected: null },
    ],
    hint: "The first omitted term controls the error.",
  },
  {
    id: "ca-349",
    title: "Adaptive Quadrature Decision",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compare Simpson estimates on the whole interval and on its two halves: S1 with two subintervals and S2 with four. If |S2 - S1| < 15 * tol, the corrected estimate is S2 + (S2 - S1) / 15; otherwise return None.\n\nGiven polynomial coefficients, a, b, and tol, return the corrected estimate or None.",
    starterCode: `def adaptive_quadrature_decision(coeffs, a, b, tol):
    # Your code here
    pass`,
    solution: `def adaptive_quadrature_decision(coeffs, a, b, tol):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def simpson(n):
        h = (b - a) / n
        total = f(a) + f(b)
        for i in range(1, n):
            total += (4.0 if i % 2 == 1 else 2.0) * f(a + i * h)
        return total * h / 3.0
    s1 = simpson(2)
    s2 = simpson(4)
    if abs(s2 - s1) < 15.0 * tol:
        return s2 + (s2 - s1) / 15.0
    return None`,
    testCases: [
      { input: [[0, 0, 1], 0, 1, 0.001], expected: 0.3333333333333333 },
      { input: [[0, 0, 1], 0, 1, 1e-12], expected: 0.3333333333333333 },
      { input: [[1, 1], 0, 2, 1e-06], expected: 4.0 },
    ],
    hint: "Richardson correction; strict inequality on the error test.",
  },
  {
    id: "ca-350",
    title: "Simpson with Odd Interval Fix",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Apply composite Simpson when the number of intervals n is even. When n is odd, apply Simpson on the first n-1 intervals and the trapezoid rule on the final interval. A single interval uses the trapezoid rule.\n\nGiven sampled values and spacing dx, return the estimate.",
    starterCode: `def simpson_odd_interval_fix(values, dx):
    # Your code here
    pass`,
    solution: `def simpson_odd_interval_fix(values, dx):
    n = len(values) - 1
    if n <= 0:
        return 0.0
    if n % 2 == 0:
        total = values[0] + values[-1]
        for i in range(1, n):
            total += (4.0 if i % 2 == 1 else 2.0) * values[i]
        return total * dx / 3.0
    even = n - 1
    head = values[: even + 1]
    total = head[0] + head[-1]
    for i in range(1, even):
        total += (4.0 if i % 2 == 1 else 2.0) * head[i]
    result = total * dx / 3.0
    result += 0.5 * (values[-2] + values[-1]) * dx
    return result`,
    testCases: [
      { input: [[0, 1, 4], 1.0], expected: 2.6666666666666665 },
      { input: [[0, 1, 4, 9], 1.0], expected: 9.166666666666666 },
      { input: [[2, 2], 0.5], expected: 1.6666666666666665 },
    ],
    hint: "Peel off the last interval and handle it as a trapezoid.",
  },
  {
    id: "ca-351",
    title: "Integral of Absolute Sample Values",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Given samples of |f| on a uniform grid with spacing dx, approximate the integral of |f| by the rectangle rule: dx * sum(|values|).\n\nReturn 0.0 for an empty list.",
    starterCode: `def integral_abs_values(values, dx):
    # Your code here
    pass`,
    solution: `def integral_abs_values(values, dx):
    return sum(abs(v) for v in values) * dx`,
    testCases: [
      { input: [[1, -2, 3], 0.5], expected: 3.0 },
      { input: [[-1, -1], 2.0], expected: 4.0 },
      { input: [[], 1.0], expected: 0.0 },
    ],
    hint: "Take magnitudes before summing.",
  },
  {
    id: "ca-352",
    title: "Weighted MAE Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a weighted mean absolute error, the subgradient for each pair is w_i * sign(pred_i - target_i) with sign 0 at exact ties.\n\nGiven predictions, targets, and per-example weights, return the subgradient list.",
    starterCode: `def weighted_mae_gradient(preds, targets, weights):
    # Your code here
    pass`,
    solution: `def weighted_mae_gradient(preds, targets, weights):
    out = []
    for p, t, w in zip(preds, targets, weights):
        if p > t:
            out.append(w)
        elif p < t:
            out.append(-w)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1, 2], [2, 2], [1, 1]], expected: [-1, 0.0] },
      { input: [[0, 5], [0, 0], [2, 3]], expected: [0.0, 3] },
      { input: [[1, -1], [-1, 1], [0.5, 0.5]], expected: [0.5, -0.5] },
    ],
    hint: "Compute the sign first, then scale by the example weight.",
  },
  {
    id: "ca-353",
    title: "Hessian-Vector Product by Finite Differences",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x) = 0.5 * x^T A x, the Hessian-vector product can be estimated from central differences of the gradient: H v approximately (grad(x + eps v) - grad(x - eps v)) / (2 eps), with analytic grad(y) = 0.5 (A + A^T) y.\n\nGiven A as nested rows, x, v, and eps (default 1e-5), return the estimate. Use the analytic gradient inside the difference.",
    starterCode: `def hessian_vector_fd(a, x, v, eps=1e-5):
    # Your code here
    pass`,
    solution: `def hessian_vector_fd(a, x, v, eps=1e-5):
    n = len(x)
    def grad(y):
        return [0.5 * sum((a[i][j] + a[j][i]) * y[j] for j in range(n)) for i in range(n)]
    xp = [x[i] + eps * v[i] for i in range(n)]
    xm = [x[i] - eps * v[i] for i in range(n)]
    gp = grad(xp)
    gm = grad(xm)
    return [(gp[i] - gm[i]) / (2.0 * eps) for i in range(n)]`,
    testCases: [
      { input: [[[1, 0], [0, 2]], [1, 1], [1, 0]], expected: [1.000000000001, 0.0] },
      { input: [[[0, 1], [2, 0]], [0.5, -0.5], [1, 1]], expected: [1.4999999999931732, 1.4999999999931732] },
      { input: [[[3, 0], [0, 1]], [0, 0], [0, 1]], expected: [0.0, 1.0] },
    ],
    hint: "The estimate is exact up to floating-point error because the gradient is linear.",
  },
  {
    id: "ca-354",
    title: "Normalized Descent Direction",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The steepest descent direction is -grad / ||grad||.\n\nGiven a nonzero gradient vector, return the unit descent direction.",
    starterCode: `def normalized_descent_direction(grad):
    # Your code here
    pass`,
    solution: `def normalized_descent_direction(grad):
    import math
    norm = math.sqrt(sum(v * v for v in grad))
    return [-v / norm for v in grad]`,
    testCases: [
      { input: [[3, 4]], expected: [-0.6, -0.8] },
      { input: [[1, 0, 0]], expected: [-1.0, 0.0, 0.0] },
      { input: [[0, -2]], expected: [0.0, 1.0] },
    ],
    hint: "Negate and divide by the Euclidean norm.",
  },
  {
    id: "ca-355",
    title: "Descent Direction Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A step direction d is a descent direction at a point with gradient g when the directional derivative g dot d is negative.\n\nGiven the gradient and the step, return [g dot d, boolean] where the boolean is true when the dot product is strictly negative.",
    starterCode: `def descent_direction_check(grad, step):
    # Your code here
    pass`,
    solution: `def descent_direction_check(grad, step):
    dot = sum(g * d for g, d in zip(grad, step))
    return [dot, dot < 0]`,
    testCases: [
      { input: [[1, 1], [-1, -1]], expected: [-2, true] },
      { input: [[1, 0], [1, 0]], expected: [1, false] },
      { input: [[2, -3], [-1, -1]], expected: [1, false] },
    ],
    hint: "Compute the dot product; a strict negative value signals descent.",
  },
];
