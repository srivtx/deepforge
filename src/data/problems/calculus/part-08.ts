import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-276",
    title: "Leaky ReLU Derivative Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The leaky ReLU is f(z) = z for z > 0 and f(z) = alpha * z otherwise, with derivative 1 for positive inputs and alpha elsewhere.\n\nGiven a list of pre-activations and alpha (default 0.01), return the derivative for each entry.",
    starterCode: `def leaky_relu_derivative(values, alpha=0.01):
    # Your code here
    pass`,
    solution: `def leaky_relu_derivative(values, alpha=0.01):
    return [1.0 if v > 0 else alpha for v in values]`,
    testCases: [
      { input: [[1, -2, 3, 0]], expected: [1.0, 0.01, 1.0, 0.01] },
      { input: [[-1, -1]], expected: [0.01, 0.01] },
      { input: [[0.5, 0, -0.5], 0.1], expected: [1.0, 0.1, 0.1] },
    ],
    hint: "The derivative is piecewise constant; zero takes the negative branch.",
  },
  {
    id: "ca-277",
    title: "ELU Derivative Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The exponential linear unit is f(z) = z for z > 0 and f(z) = alpha * (exp(z) - 1) otherwise, so f'(z) = 1 for z > 0 and alpha * exp(z) otherwise.\n\nGiven the pre-activations and alpha (default 1.0), return the derivative list.",
    starterCode: `def elu_derivative(values, alpha=1.0):
    # Your code here
    pass`,
    solution: `def elu_derivative(values, alpha=1.0):
    import math
    return [1.0 if v > 0 else alpha * math.exp(v) for v in values]`,
    testCases: [
      { input: [[0, 1, -1]], expected: [1.0, 1.0, 0.36787944117144233] },
      { input: [[-2, -2]], expected: [0.1353352832366127, 0.1353352832366127] },
      { input: [[0.5, -0.5], 0.5], expected: [1.0, 0.3032653298563167] },
    ],
    hint: "For the negative side differentiate alpha * (exp(z) - 1).",
  },
  {
    id: "ca-278",
    title: "Softplus Derivative Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The softplus function f(z) = log(1 + exp(z)) has derivative sigmoid(z) = 1 / (1 + exp(-z)).\n\nReturn the derivative at each of the given values. Use a numerically stable sigmoid.",
    starterCode: `def softplus_derivative(values):
    # Your code here
    pass`,
    solution: `def softplus_derivative(values):
    import math
    out = []
    for v in values:
        if v >= 0:
            out.append(1.0 / (1.0 + math.exp(-v)))
        else:
            e = math.exp(v)
            out.append(e / (1.0 + e))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.5, 0.7310585786300049, 0.2689414213699951] },
      { input: [[10, -10]], expected: [0.9999546021312976, 4.5397868702434395e-05] },
      { input: [[0.5, -0.5, 2.0]], expected: [0.6224593312018546, 0.37754066879814546, 0.8807970779778823] },
    ],
    hint: "Softplus differentiates to the logistic function; branch to avoid overflow.",
  },
  {
    id: "ca-279",
    title: "Swish Derivative Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The swish activation is f(z) = z * sigmoid(z), whose derivative is sigmoid(z) + z * sigmoid(z) * (1 - sigmoid(z)) = sigmoid(z) * (1 + z * (1 - sigmoid(z))).\n\nReturn the derivative at each given value.",
    starterCode: `def swish_derivative(values):
    # Your code here
    pass`,
    solution: `def swish_derivative(values):
    import math
    out = []
    for v in values:
        s = 1.0 / (1.0 + math.exp(-v))
        out.append(s + v * s * (1.0 - s))
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.5, 0.9276705118714867, 0.07232948812851325] },
      { input: [[2, -2]], expected: [1.0907842487848955, -0.09078424878489547] },
      { input: [[0.5, 3.0]], expected: [0.7399611873026518, 1.0881041060151695] },
    ],
    hint: "Apply the product rule to z times sigmoid(z).",
  },
  {
    id: "ca-280",
    title: "GELU Tanh Derivative Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The tanh approximation of GELU is f(z) = 0.5 * z * (1 + tanh(u)) with u = sqrt(2/pi) * (z + 0.044715 * z^3).\n\nIts derivative is 0.5 * (1 + tanh(u)) + 0.5 * z * (1 - tanh(u)^2) * du/dz where du/dz = sqrt(2/pi) * (1 + 3 * 0.044715 * z^2).\n\nGiven the values, return the derivative list.",
    starterCode: `def gelu_tanh_derivative(values):
    # Your code here
    pass`,
    solution: `def gelu_tanh_derivative(values):
    import math
    c = math.sqrt(2.0 / math.pi)
    out = []
    for z in values:
        u = c * (z + 0.044715 * z ** 3)
        t = math.tanh(u)
        du = c * (1.0 + 3.0 * 0.044715 * z * z)
        out.append(0.5 * (1.0 + t) + 0.5 * z * (1.0 - t * t) * du)
    return out`,
    testCases: [
      { input: [[0, 1, -1]], expected: [0.5, 1.0829640838457826, -0.08296408384578258] },
      { input: [[0.5, 2.0]], expected: [0.8673699035346424, 1.0860992566236183] },
      { input: [[-3.0, 3.0]], expected: [-0.011584166630969516, 1.0115841666309695] },
    ],
    hint: "Differentiate tanh(u) as (1 - tanh(u)^2) * du/dz and apply the product rule.",
  },
  {
    id: "ca-281",
    title: "Sigmoid BCE Gradient with Logits",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For binary cross-entropy with a sigmoid output, the gradient with respect to the logit z is sigmoid(z) - y, where y is the target in {0, 1}.\n\nGiven the logits and targets, return the per-example gradient list.",
    starterCode: `def sigmoid_bce_gradient(logits, targets):
    # Your code here
    pass`,
    solution: `def sigmoid_bce_gradient(logits, targets):
    import math
    out = []
    for z, y in zip(logits, targets):
        p = 1.0 / (1.0 + math.exp(-z))
        out.append(p - y)
    return out`,
    testCases: [
      { input: [[0, 0], [0, 1]], expected: [0.5, -0.5] },
      { input: [[1, -1], [1, 0]], expected: [-0.2689414213699951, 0.2689414213699951] },
      { input: [[2, 2, 2], [1, 1, 0]], expected: [-0.11920292202211769, -0.11920292202211769, 0.8807970779778823] },
    ],
    hint: "The BCE and sigmoid derivatives cancel into p - y.",
  },
  {
    id: "ca-282",
    title: "Focal Loss Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For sigmoid focal loss with focusing parameter gamma, the gradient with respect to the logit z is:\n\ny = 1: (1 - p)^gamma * (gamma * p * log(p) - (1 - p))\ny = 0: p^gamma * (p - gamma * (1 - p) * log(1 - p))\n\nwhere p = sigmoid(z). Given logits, targets, and gamma, return the gradient list.",
    starterCode: `def focal_loss_gradient(logits, targets, gamma):
    # Your code here
    pass`,
    solution: `def focal_loss_gradient(logits, targets, gamma):
    import math
    out = []
    for z, y in zip(logits, targets):
        p = 1.0 / (1.0 + math.exp(-z))
        if y == 1:
            g = (1.0 - p) ** gamma * (gamma * p * math.log(p) - (1.0 - p))
        else:
            g = p ** gamma * (p - gamma * (1.0 - p) * math.log(1.0 - p))
        out.append(g)
    return out`,
    testCases: [
      { input: [[0, 0], [1, 0], 2], expected: [-0.29828679513998635, 0.29828679513998635] },
      { input: [[1, -1], [1, 0], 0], expected: [-0.2689414213699951, 0.2689414213699951] },
      { input: [[2, -2], [0, 1], 1], expected: [0.9991172903489263, -0.9991172903489264] },
    ],
    hint: "Differentiate -(1-p)^gamma log p through the sigmoid using dp/dz = p(1-p).",
  },
  {
    id: "ca-283",
    title: "Huber Loss Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For residuals r = pred - target, the Huber loss uses gradient r when |r| <= delta and delta * sign(r) otherwise.\n\nGiven predictions, targets, and delta, return the gradient list.",
    starterCode: `def huber_gradient(preds, targets, delta=1.0):
    # Your code here
    pass`,
    solution: `def huber_gradient(preds, targets, delta=1.0):
    out = []
    for p, t in zip(preds, targets):
        r = p - t
        if abs(r) <= delta:
            out.append(r)
        else:
            out.append(delta if r > 0 else -delta)
    return out`,
    testCases: [
      { input: [[1, 5], [2, 2]], expected: [-1, 1.0] },
      { input: [[1.5, 1.5], [0, 3], 1.0], expected: [1.0, -1.0] },
      { input: [[3, -3], [0, 0], 2.0], expected: [2.0, -2.0] },
    ],
    hint: "Huber is quadratic near zero and linear outside the delta band.",
  },
  {
    id: "ca-284",
    title: "MAE Subgradient Sign Rule",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The mean absolute error has subgradient sign(pred - target) at nonzero residuals and any value in [-1, 1] at zero; use 0 at exact equality.\n\nGiven predictions and targets, return the per-example subgradient list with this convention.",
    starterCode: `def mae_subgradient(preds, targets):
    # Your code here
    pass`,
    solution: `def mae_subgradient(preds, targets):
    out = []
    for p, t in zip(preds, targets):
        if p > t:
            out.append(1.0)
        elif p < t:
            out.append(-1.0)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1, 2], [2, 2]], expected: [-1.0, 0.0] },
      { input: [[0, 5, -5], [0, 5, 5]], expected: [0.0, 0.0, -1.0] },
      { input: [[1, -1], [-1, 1]], expected: [1.0, -1.0] },
    ],
    hint: "Compare elementwise and return the sign with a zero convention at ties.",
  },
  {
    id: "ca-285",
    title: "Multiclass Hinge Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the multiclass hinge loss with scores s and correct label index y, the loss is max_j (1 + s_j - s_y) over j != y, capped at zero.\n\nThe gradient with respect to s is +1 at the best violating class, -1 at the correct class (when a violation exists), and zeros elsewhere. Given scores and the label index, return the gradient list.",
    starterCode: `def multiclass_hinge_gradient(scores, label):
    # Your code here
    pass`,
    solution: `def multiclass_hinge_gradient(scores, label):
    n = len(scores)
    best = -1
    best_gap = 0.0
    for j in range(n):
        if j == label:
            continue
        gap = 1.0 + scores[j] - scores[label]
        if gap > best_gap:
            best_gap = gap
            best = j
    grad = [0.0] * n
    if best >= 0:
        grad[best] = 1.0
        grad[label] = -1.0
    return grad`,
    testCases: [
      { input: [[3, 1, 0], 0], expected: [0.0, 0.0, 0.0] },
      { input: [[1, 3, 0], 0], expected: [-1.0, 1.0, 0.0] },
      { input: [[0, 0, 0], 1], expected: [1.0, -1.0, 0.0] },
    ],
    hint: "Only the single highest-scoring violator receives the positive gradient.",
  },
  {
    id: "ca-286",
    title: "MSE Gradient Per Element",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For mean squared error L = (1/n) * sum_i (pred_i - target_i)^2, the gradient with respect to each prediction is 2 * (pred_i - target_i) / n.\n\nGiven predictions and targets, return the gradient list.",
    starterCode: `def mse_gradient_per_element(preds, targets):
    # Your code here
    pass`,
    solution: `def mse_gradient_per_element(preds, targets):
    n = len(preds)
    return [2.0 * (p - t) / n for p, t in zip(preds, targets)]`,
    testCases: [
      { input: [[1, 2], [0, 0]], expected: [1.0, 2.0] },
      { input: [[1, 1, 1], [1, 1, 1]], expected: [0.0, 0.0, 0.0] },
      { input: [[0, 3], [1, 1]], expected: [-1.0, 2.0] },
    ],
    hint: "The 1/n from the mean scales every element.",
  },
  {
    id: "ca-287",
    title: "Temperature Softmax Jacobian Diagonal",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For temperature-scaled softmax s = softmax(logits / T), the Jacobian with respect to logits has diagonal entries (1/T) * s_i * (1 - s_i).\n\nGiven logits and temperature, return this diagonal list. Subtract the max logit before exponentiating.",
    starterCode: `def temperature_softmax_diag(logits, temperature):
    # Your code here
    pass`,
    solution: `def temperature_softmax_diag(logits, temperature):
    import math
    scaled = [v / temperature for v in logits]
    m = max(scaled)
    e = [math.exp(v - m) for v in scaled]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] * (1.0 - p[i]) / temperature for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0], 1.0], expected: [0.25, 0.25] },
      { input: [[0, 0], 2.0], expected: [0.125, 0.125] },
      { input: [[1, 2, 3], 0.5], expected: [0.031248369961352808, 0.20709738269886538, 0.23089595864457524] },
    ],
    hint: "Chain rule with u = logits / T brings a 1/T factor into every entry.",
  },
  {
    id: "ca-288",
    title: "Log-Sum-Exp Gradient Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The gradient of log-sum-exp, LSE(z) = log(sum_i exp(z_i)), is the softmax of z.\n\nGiven logits, return the gradient list computed stably by subtracting the maximum logit first.",
    starterCode: `def logsumexp_gradient(logits):
    # Your code here
    pass`,
    solution: `def logsumexp_gradient(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    return [v / s for v in e]`,
    testCases: [
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[1, 2, 3]], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[1000, 1000, 1000]], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "This is the same vector as softmax(z).",
  },
  {
    id: "ca-289",
    title: "Complex-Step Polynomial Gradient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Complex-step differentiation evaluates a polynomial at x + i*h and reads the derivative from the imaginary part: f'(x) approximately imag(f(x + i*h)) / h, accurate to machine precision without cancellation.\n\nGiven polynomial coefficients (coeffs[i] is the coefficient of x^i), x, and h (default 1e-20), return the complex-step derivative.",
    starterCode: `def complex_step_polynomial_gradient(coeffs, x, h=1e-20):
    # Your code here
    pass`,
    solution: `def complex_step_polynomial_gradient(coeffs, x, h=1e-20):
    z = complex(x, h)
    value = 0j
    power = 1 + 0j
    for c in coeffs:
        value += c * power
        power *= z
    return value.imag / h`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 13.999999999999998 },
      { input: [[0, 0, 0, 1], 3], expected: 26.999999999999996 },
      { input: [[5], 7], expected: 0.0 },
    ],
    hint: "Accumulate powers of z = x + ih and take the imaginary part divided by h.",
  },
  {
    id: "ca-290",
    title: "Richardson Extrapolated Derivative",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Richardson extrapolation combines central differences at step h and h/2 as R = (4 * D(h/2) - D(h)) / 3, cancelling the leading O(h^2) error term.\n\nGiven polynomial coefficients, x, and h (default 1e-3), return the extrapolated derivative using central differences for D.",
    starterCode: `def richardson_extrapolated_derivative(coeffs, x, h=1e-3):
    # Your code here
    pass`,
    solution: `def richardson_extrapolated_derivative(coeffs, x, h=1e-3):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def d(step):
        return (f(x + step) - f(x - step)) / (2.0 * step)
    return (4.0 * d(h / 2.0) - d(h)) / 3.0`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 14.000000000004675 },
      { input: [[0, 1, 0, 4], 1.5], expected: 27.999999999997215 },
      { input: [[0, 0, 1, 1], -2], expected: 8.000000000001043 },
    ],
    hint: "Compute two central differences, then apply the 4-to-1 weighted combination.",
  },
  {
    id: "ca-291",
    title: "Five-Point Stencil Derivative",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The five-point central stencil approximates the first derivative with error O(h^4):\n\nf'(x) \u2248 (-f(x + 2h) + 8 f(x + h) - 8 f(x - h) + f(x - 2h)) / (12 h)\n\nGiven polynomial coefficients, x, and h (default 1e-3), return the estimate.",
    starterCode: `def five_point_stencil_derivative(coeffs, x, h=1e-3):
    # Your code here
    pass`,
    solution: `def five_point_stencil_derivative(coeffs, x, h=1e-3):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (-f(x + 2 * h) + 8.0 * f(x + h) - 8.0 * f(x - h) + f(x - 2 * h)) / (12.0 * h)`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 13.99999999999757 },
      { input: [[0, 1, 0, 0], 4], expected: 1.00000000000026 },
      { input: [[0, 0, 5], -1], expected: -9.999999999998824 },
    ],
    hint: "The weights -1, 8, -8, 1 over a span of 2h each side give fourth-order accuracy.",
  },
  {
    id: "ca-292",
    title: "Power Rule Derivative Coefficients",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Differentiate a polynomial given its coefficients in ascending order: if f(x) = sum_i coeffs[i] * x^i then f'(x) = sum_i (i * coeffs[i]) * x^(i-1).\n\nReturn the derivative coefficients in ascending order, dropping the constant term.",
    starterCode: `def power_rule_derivative_coeffs(coeffs):
    # Your code here
    pass`,
    solution: `def power_rule_derivative_coeffs(coeffs):
    return [i * c for i, c in enumerate(coeffs) if i > 0]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [2, 6] },
      { input: [[5]], expected: [] },
      { input: [[0, 0, 0, 4]], expected: [0, 0, 12] },
    ],
    hint: "Index i becomes the multiplier and the degree drops by one.",
  },
  {
    id: "ca-293",
    title: "Power Rule Antiderivative Coefficients",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Integrate a polynomial term by term with zero constant: if f(x) = sum_i coeffs[i] * x^i then F(x) = sum_i coeffs[i] * x^(i+1) / (i+1).\n\nReturn the antiderivative coefficients in ascending order with a leading 0.0 constant term.",
    starterCode: `def power_rule_antiderivative_coeffs(coeffs):
    # Your code here
    pass`,
    solution: `def power_rule_antiderivative_coeffs(coeffs):
    return [0.0] + [c / (i + 1) for i, c in enumerate(coeffs)]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [0.0, 1.0, 1.0, 1.0] },
      { input: [[4]], expected: [0.0, 4.0] },
      { input: [[0, 1]], expected: [0.0, 0.0, 0.5] },
    ],
    hint: "Divide each coefficient by its new exponent and prepend the integration constant.",
  },
  {
    id: "ca-294",
    title: "Chain Rule Through Two Linear Maps",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the composition y = W2 @ (W1 @ x) with constant matrices, the Jacobian with respect to x is the product W2 @ W1.\n\nGiven W1 as a list of rows (m x n) and W2 as a list of rows (k x m), return the k x n Jacobian as a nested list.",
    starterCode: `def chain_rule_linear_jacobian(w1, w2):
    # Your code here
    pass`,
    solution: `def chain_rule_linear_jacobian(w1, w2):
    k = len(w2)
    m = len(w2[0])
    n = len(w1[0])
    J = [[0.0] * n for _ in range(k)]
    for i in range(k):
        for j in range(n):
            J[i][j] = sum(w2[i][p] * w1[p][j] for p in range(m))
    return J`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 0]]], expected: [[1, 2]] },
      { input: [[[1, 0], [0, 1]], [[2, 3], [4, 5]]], expected: [[2, 3], [4, 5]] },
      { input: [[[2]], [[3]]], expected: [[6]] },
    ],
    hint: "Compose the linear maps by multiplying the matrices in order.",
  },
  {
    id: "ca-295",
    title: "Softmax Cross-Entropy Hessian Matrix",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For softmax probabilities p, the Hessian of the cross-entropy loss with respect to the logits is diag(p) - p p^T: diagonal entries p_i (1 - p_i) and off-diagonal entries -p_i p_j.\n\nGiven the logits, return this Hessian as a nested list. Subtract the max logit before exponentiating.",
    starterCode: `def softmax_ce_hessian_matrix(logits):
    # Your code here
    pass`,
    solution: `def softmax_ce_hessian_matrix(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    p = [v / s for v in e]
    n = len(p)
    H = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            H[i][j] = (p[i] * (1.0 - p[i]) if i == j else -p[i] * p[j])
    return H`,
    testCases: [
      { input: [[0, 0]], expected: [[0.25, -0.25], [-0.25, 0.25]] },
      { input: [[1, 2, 3]], expected: [[0.08192506906499324, -0.022033044520174298, -0.05989202454481893], [-0.022033044520174298, 0.1848364465099787, -0.1628034019898044], [-0.05989202454481893, -0.1628034019898044, 0.2226954265346234]] },
      { input: [[0, 0, 0, 0]], expected: [[0.1875, -0.0625, -0.0625, -0.0625], [-0.0625, 0.1875, -0.0625, -0.0625], [-0.0625, -0.0625, 0.1875, -0.0625], [-0.0625, -0.0625, -0.0625, 0.1875]] },
    ],
    hint: "Start from diag(p) and subtract the outer product p p^T.",
  },
];
