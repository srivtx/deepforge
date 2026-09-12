import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-186",
    title: "Gradient of Cross-Entropy",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For softmax probabilities p = softmax(logits) and the label y, the cross-entropy loss is L = -log(p_y).\n\nIts gradient with respect to the logits is p - onehot(y), where the y-th component is p_y - 1 and all others are p_j. Return the gradient vector. Subtract the maximum logit for stability.",
    starterCode: `def cross_entropy_grad(logits, y):
    # Your code here
    pass`,
    solution: `def cross_entropy_grad(logits, y):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] - (1.0 if i == y else 0.0) for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0], 0], expected: [-0.5, 0.5] },
      { input: [[0, 1], 1], expected: [0.2689414213699951, -0.2689414213699951] },
      {
        input: [[1, 1, 1], 2],
        expected: [0.3333333333333333, 0.3333333333333333, -0.6666666666666667],
      },
      { input: [[2, -1], 0], expected: [-0.047425873177566635, 0.04742587317756679] },
    ],
    hint: "The softmax makes the loss gradient a probability vector minus a one-hot vector.",
  },
  {
    id: "ca-187",
    title: "Softmax Jacobian",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the softmax vector s, the full Jacobian is J[i][j] = s_i * (delta_ij - s_j), where delta_ij is 1 when i == j and 0 otherwise.\n\nGiven the logits, return the n x n Jacobian as a nested list. Use max subtraction for numerical stability.",
    starterCode: `def softmax_jacobian(logits):
    # Your code here
    pass`,
    solution: `def softmax_jacobian(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    p = [v / s for v in e]
    return [[p[i] * ((1.0 if i == j else 0.0) - p[j]) for j in range(len(p))] for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0]], expected: [[0.25, -0.25], [-0.25, 0.25]] },
      {
        input: [[0, 1]],
        expected: [
          [0.19661193324148185, -0.19661193324148185],
          [-0.19661193324148185, 0.19661193324148185],
        ],
      },
      {
        input: [[1, 1, 1]],
        expected: [
          [0.22222222222222224, -0.1111111111111111, -0.1111111111111111],
          [-0.1111111111111111, 0.22222222222222224, -0.1111111111111111],
          [-0.1111111111111111, -0.1111111111111111, 0.22222222222222224],
        ],
      },
      {
        input: [[2, -1]],
        expected: [
          [0.045176659730912, -0.045176659730912144],
          [-0.045176659730912144, 0.045176659730912144],
        ],
      },
    ],
    hint: "Each row sums to zero because the softmax outputs always sum to 1.",
  },
  {
    id: "ca-188",
    title: "Attention Score Gradient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "In scaled dot-product attention the scores are s_j = (q dot k_j) / sqrt(d) and the attention weights are a = softmax(s).\n\nFor attention weight i, the gradient with respect to the query is\n\nd a_i / d q = a_i * (k_i - sum_j a_j k_j) / sqrt(d)\n\nGiven q, the list of key vectors, and the index i, return that gradient vector.",
    starterCode: `def attention_score_grad(q, keys, i):
    # Your code here
    pass`,
    solution: `def attention_score_grad(q, keys, i):
    import math
    d = len(q)
    scale = d ** 0.5
    scores = []
    for k in keys:
        dot = sum(q[t] * k[t] for t in range(d))
        scores.append(dot / scale)
    m = max(scores)
    e = [math.exp(v - m) for v in scores]
    s = sum(e)
    a = [v / s for v in e]
    mean_k = [sum(a[j] * keys[j][t] for j in range(len(keys))) for t in range(d)]
    return [a[i] * (keys[i][t] - mean_k[t]) / scale for t in range(d)]`,
    testCases: [
      { input: [[1, 0], [[1, 0], [0, 1]], 0], expected: [0.1563985965451104, -0.1563985965451104] },
      {
        input: [[1, 1], [[1, 0], [0, 1]], 1],
        expected: [-0.17677669529663687, 0.17677669529663687],
      },
      {
        input: [[0.5, -0.5], [[1, 1], [2, 0], [-1, 1]], 2],
        expected: [-0.22733165093293675, 0.05703056094213042],
      },
    ],
    hint: "This is the softmax Jacobian contracted with the key gradients k_j / sqrt(d).",
  },
  {
    id: "ca-189",
    title: "Hessian of Logistic Loss",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the logistic loss L(w) = log(1 + exp(-y * w dot x)) with y in {+1, -1}, let p = 1 / (1 + exp(y * w dot x)).\n\nThe Hessian with respect to w is p * (1 - p) * x x^T, an outer product scaled by the variance of the sigmoid. Return it as a nested list.",
    starterCode: `def hessian_logistic(w, x, y):
    # Your code here
    pass`,
    solution: `def hessian_logistic(w, x, y):
    import math
    z = sum(w[t] * x[t] for t in range(len(w)))
    p = 1.0 / (1.0 + math.exp(y * z))
    c = p * (1 - p)
    return [[c * x[i] * x[j] for j in range(len(x))] for i in range(len(x))]`,
    testCases: [
      { input: [[0, 0], [1, 1], 1], expected: [[0.25, 0.25], [0.25, 0.25]] },
      { input: [[1, 0], [2, 0], 1], expected: [[0.419974341614026, 0.0], [0.0, 0.0]] },
      {
        input: [[0, 1], [1, -2], -1],
        expected: [
          [0.1049935854035065, -0.209987170807013],
          [-0.209987170807013, 0.419974341614026],
        ],
      },
      {
        input: [[0.5, 0.5], [2, 1], 1],
        expected: [
          [0.5965858082813315, 0.2982929041406657],
          [0.2982929041406657, 0.14914645207033286],
        ],
      },
    ],
    hint: "The Hessian of the logistic loss is always positive semidefinite.",
  },
  {
    id: "ca-190",
    title: "Loss-Landscape Curvature",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The curvature of the quadratic loss f(w) = 0.5 * w^T A w along the unit direction u is the Rayleigh quotient u^T A u / (u^T u).\n\nFor A = [[a, b], [b, c]] and direction (d1, d2), return (a*d1^2 + 2*b*d1*d2 + c*d2^2) / (d1^2 + d2^2).",
    starterCode: `def landscape_curvature(a, b, c, d1, d2):
    # Your code here
    pass`,
    solution: `def landscape_curvature(a, b, c, d1, d2):
    num = a * d1 * d1 + 2 * b * d1 * d2 + c * d2 * d2
    den = d1 * d1 + d2 * d2
    return num / den`,
    testCases: [
      { input: [2, 0, 2, 1, 1], expected: 2.0 },
      { input: [4, 0, 1, 1, 1], expected: 2.5 },
      { input: [1, 2, 1, 1, -1], expected: -1.0 },
      { input: [3, 0, 3, 3, 4], expected: 3.0 },
    ],
    hint: "The Rayleigh quotient lies between the smallest and largest Hessian eigenvalues.",
  },
  {
    id: "ca-191",
    title: "Fisher Information of a Gaussian",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a univariate Gaussian with known variance, the Fisher information about the mean is 1 / sigma^2, and about the standard deviation it is 2 / sigma^2.\n\nGiven sigma > 0, return the pair [I_mu, I_sigma].",
    starterCode: `def fisher_gaussian(sigma):
    # Return [I_mu, I_sigma]
    # Your code here
    pass`,
    solution: `def fisher_gaussian(sigma):
    return [1.0 / (sigma * sigma), 2.0 / (sigma * sigma)]`,
    testCases: [
      { input: [1], expected: [1.0, 2.0] },
      { input: [2], expected: [0.25, 0.5] },
      { input: [0.5], expected: [4.0, 8.0] },
      { input: [4], expected: [0.0625, 0.125] },
    ],
    hint: "The information is the expected squared score, which scales inversely with the variance.",
  },
  {
    id: "ca-192",
    title: "KL Divergence Derivative",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The KL divergence between univariate Gaussians q = N(mu1, sigma1^2) and p = N(mu2, sigma2^2) is\n\nKL = log(sigma2 / sigma1) + (sigma1^2 + (mu1 - mu2)^2) / (2 * sigma2^2) - 0.5\n\nReturn its derivatives with respect to the parameters of q as [dKL/dmu1, dKL/dsigma1]. The term (mu1 - mu2)/sigma2^2 and the sigma1 term follow by differentiation.",
    starterCode: `def kl_gaussian_grad(mu1, sigma1, mu2, sigma2):
    # Return [dKL_dmu1, dKL_dsigma1]
    # Your code here
    pass`,
    solution: `def kl_gaussian_grad(mu1, sigma1, mu2, sigma2):
    return [(mu1 - mu2) / (sigma2 * sigma2), -1.0 / sigma1 + sigma1 / (sigma2 * sigma2)]`,
    testCases: [
      { input: [0, 1, 0, 1], expected: [0.0, 0.0] },
      { input: [1, 1, 0, 1], expected: [1.0, 0.0] },
      { input: [0, 2, 0, 1], expected: [0.0, 1.5] },
      { input: [3, 0.5, 1, 2], expected: [0.5, -1.875] },
    ],
    hint: "Differentiate the closed form with respect to each parameter while holding the other fixed.",
  },
  {
    id: "ca-193",
    title: "ELBO Gradient Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one gradient ascent step on the ELBO for a one-sample Gaussian variational posterior. With z = mu + sigma * eps and dropped constants, the objective is\n\nL = -(z - x)^2 / 2 - z^2 / 2 + log(sigma) + eps^2 / 2\n\nwhose gradients are dL/dmu = x - 2z and dL/dsigma = eps * (x - 2z) + 1/sigma. Return [mu + lr*dL/dmu, sigma + lr*dL/dsigma].",
    starterCode: `def elbo_gradient_step(mu, sigma, x, eps, lr):
    # Return [mu_new, sigma_new]
    # Your code here
    pass`,
    solution: `def elbo_gradient_step(mu, sigma, x, eps, lr):
    z = mu + sigma * eps
    dmu = x - 2 * z
    dsigma = eps * (x - 2 * z) + 1.0 / sigma
    return [mu + lr * dmu, sigma + lr * dsigma]`,
    testCases: [
      { input: [0, 1, 1, 0.5, 0.1], expected: [0.0, 1.1] },
      { input: [0, 2, 3, -1, 0.05], expected: [0.35000000000000003, 1.675] },
      { input: [1, 1, 1, 0, 0.1], expected: [0.9, 1.1] },
      { input: [0, 1, 0, 2, 0.25], expected: [-1.0, -0.75] },
    ],
    hint: "The sampled value z depends on mu and sigma, so both partials flow through it.",
  },
  {
    id: "ca-194",
    title: "Reparameterization Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "With the reparameterization z = mu + sigma * eps, the pathwise derivatives of f(z) are df/dmu = f'(z) and df/dsigma = f'(z) * eps.\n\nFor f(x) = sum(coeffs[i] * x^i), evaluate f'(z) and return [df_dmu, df_dsigma].",
    starterCode: `def reparameterization_grad(coeffs, mu, sigma, eps):
    # Return [df_dmu, df_dsigma]
    # Your code here
    pass`,
    solution: `def reparameterization_grad(coeffs, mu, sigma, eps):
    z = mu + sigma * eps
    g = sum(i * c * z ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return [g, g * eps]`,
    testCases: [
      { input: [[0, 0, 1], 1, 2, 0.5], expected: [4.0, 2.0] },
      { input: [[0, 0, 0, 1], 0, 1, -2], expected: [12.0, -24.0] },
      { input: [[0, 1], 0, 3, 1], expected: [1.0, 1.0] },
      { input: [[5], 1, 1, 1], expected: [0.0, 0.0] },
    ],
    hint: "The same derivative value scales the sigma partial by the noise sample.",
  },
  {
    id: "ca-195",
    title: "Straight-Through Estimator Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the forward quantization y = round(x) * w with straight-through gradients, the backward pass treats round as the identity for x but uses the quantized value for w.\n\nGiven x, w, and the upstream gradient grad_out, return [dL/dx, dL/dw] = [grad_out * w, grad_out * round(x)].",
    starterCode: `def ste_quantized_backward(x, w, grad_out):
    # Return [dL_dx, dL_dw]
    # Your code here
    pass`,
    solution: `def ste_quantized_backward(x, w, grad_out):
    return [grad_out * w, grad_out * round(x)]`,
    testCases: [
      { input: [2.3, 0.5, 2], expected: [1.0, 4.0] },
      { input: [2.7, 3, 1], expected: [3.0, 3.0] },
      { input: [-1.4, 2, 1], expected: [2.0, -1.0] },
      { input: [0.6, 1, 1], expected: [1.0, 1.0] },
    ],
    hint: "The straight-through estimator passes the gradient through the non-differentiable rounding.",
  },
  {
    id: "ca-196",
    title: "Surrogate Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Spiking neural networks replace the derivative of the Heaviside spike with a smooth surrogate. A common choice is the derivative of arctan(k*x):\n\ng(x) = k / (1 + (k*x)^2)\n\nGiven x and the sharpness k > 0, return g(x).",
    starterCode: `def surrogate_gradient(x, scale):
    # Your code here
    pass`,
    solution: `def surrogate_gradient(x, scale):
    return scale / (1.0 + (scale * x) ** 2)`,
    testCases: [
      { input: [0, 5], expected: 5.0 },
      { input: [0.1, 5], expected: 4.0 },
      { input: [-0.1, 5], expected: 4.0 },
      { input: [1, 1], expected: 0.5 },
      { input: [0.5, 2], expected: 1.0 },
    ],
    hint: "The surrogate is symmetric and peaks at x = 0 with value k.",
  },
  {
    id: "ca-197",
    title: "Pathwise Derivative Estimate",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The pathwise (reparameterization) estimator of the gradient of E[f(mu + sigma * eps)] with respect to mu is the sample average of f'(mu + sigma * eps_i).\n\nFor f(x) = sum(coeffs[i] * x^i) and a list of standard normal samples epsilons, return that average.",
    starterCode: `def pathwise_derivative(coeffs, mu, sigma, epsilons):
    # Your code here
    pass`,
    solution: `def pathwise_derivative(coeffs, mu, sigma, epsilons):
    total = 0.0
    for eps in epsilons:
        z = mu + sigma * eps
        total += sum(i * c * z ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return total / len(epsilons)`,
    testCases: [
      { input: [[0, 0, 1], 1, 0.5, [-1, 0, 1]], expected: 2.0 },
      { input: [[0, 0, 0, 1], 0, 1, [0, 0]], expected: 0.0 },
      { input: [[0, 0, 1], 2, 0, [5]], expected: 4.0 },
      { input: [[0, 1], 0, 3, [1, -1, 2]], expected: 1.0 },
    ],
    hint: "Unlike the score-function estimator, the pathwise estimator differentiates the sample directly.",
  },
  {
    id: "ca-198",
    title: "Score-Function Estimator",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a Gaussian distribution N(mu, sigma^2), the score function is (z - mu) / sigma^2, so the score-function (REINFORCE) estimator of d/dmu E[f(z)] is the sample average of f(z_i) * (z_i - mu) / sigma^2.\n\nGiven the function values f_values and the corresponding samples z_values, return that estimate.",
    starterCode: `def score_function_estimator(f_values, z_values, mu, sigma):
    # Your code here
    pass`,
    solution: `def score_function_estimator(f_values, z_values, mu, sigma):
    total = 0.0
    for f, z in zip(f_values, z_values):
        total += f * (z - mu) / (sigma * sigma)
    return total / len(f_values)`,
    testCases: [
      { input: [[1, 1], [0, 2], 1, 1], expected: 0.0 },
      { input: [[2, 4], [1, 3], 1, 2], expected: 1.0 },
      { input: [[1, 2, 3], [0, 1, 2], 1, 1], expected: 0.6666666666666666 },
    ],
    hint: "The score-function estimator needs only function evaluations, not derivatives of f.",
  },
  {
    id: "ca-199",
    title: "REINFORCE Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a Bernoulli policy with probability p = sigmoid(theta), the score of action a in {0, 1} is a - p.\n\nGiven the policy parameter theta, the action, the reward, and a baseline, return the REINFORCE gradient estimate (reward - baseline) * (a - p).",
    starterCode: `def reinforce_gradient(theta, action, reward, baseline):
    # Your code here
    pass`,
    solution: `def reinforce_gradient(theta, action, reward, baseline):
    import math
    p = 1.0 / (1.0 + math.exp(-theta))
    return (reward - baseline) * (action - p)`,
    testCases: [
      { input: [0, 1, 1, 0], expected: 0.5 },
      { input: [0, 0, 1, 0], expected: -0.5 },
      { input: [2, 0, 2, 1], expected: -0.8807970779778823 },
      { input: [-1, 1, 0, 0.5], expected: -0.36552928931500245 },
    ],
    hint: "Subtracting a baseline does not bias the gradient but can reduce its variance.",
  },
  {
    id: "ca-200",
    title: "Optimal Baseline Control Variate",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the control variate (R - b) * s with score s, the baseline that minimizes the estimator variance is b* = E[R * s^2] / E[s^2].\n\nGiven reward samples and score samples, return b* computed as sum(R_i * s_i^2) / sum(s_i^2). Assume the scores are not all zero.",
    starterCode: `def optimal_baseline(rewards, scores):
    # Your code here
    pass`,
    solution: `def optimal_baseline(rewards, scores):
    num = 0.0
    den = 0.0
    for r, s in zip(rewards, scores):
        num += r * s * s
        den += s * s
    return num / den`,
    testCases: [
      { input: [[1, 2], [1, 1]], expected: 1.5 },
      { input: [[1, 2, 3], [1, -1, 0]], expected: 1.5 },
      { input: [[2, 4], [0.5, -0.5]], expected: 3.0 },
    ],
    hint: "Minimize the variance as a quadratic in b and solve for b.",
  },
  {
    id: "ca-201",
    title: "Finite-Difference Gradient Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Gradient checking compares an analytic gradient against central finite differences with step h = 1e-6.\n\nFor f(x) = sum(coeffs[j] * x_j^2), verify that the supplied gradient matches numerically: return True only if every component differs by at most tol (default 1e-6).",
    starterCode: `def finite_difference_check(coeffs, x, grad, tol=1e-6):
    # Your code here
    pass`,
    solution: `def finite_difference_check(coeffs, x, grad, tol=1e-6):
    h = 1e-6
    for i in range(len(x)):
        xp = list(x)
        xp[i] += h
        xm = list(x)
        xm[i] -= h
        fp = sum(coeffs[j] * xp[j] * xp[j] for j in range(len(coeffs)))
        fm = sum(coeffs[j] * xm[j] * xm[j] for j in range(len(coeffs)))
        num = (fp - fm) / (2 * h)
        if abs(num - grad[i]) > tol:
            return False
    return True`,
    testCases: [
      { input: [[1, 2], [3, 4], [6, 16]], expected: true },
      { input: [[1, 2], [3, 4], [6, 15]], expected: false },
      { input: [[0, 0.5], [2, -1], [0, -1]], expected: true },
      { input: [[1], [0], [0]], expected: true },
    ],
    hint: "Perturb one coordinate at a time and compare the symmetric difference quotient.",
  },
  {
    id: "ca-202",
    title: "Complex-Step Derivative",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The complex-step derivative avoids subtractive cancellation entirely:\n\nf'(x) = Im(f(x + i*h)) / h\n\nUsing h = 1e-20 gives near machine precision. Apply this to the polynomial f(x) = sum(coeffs[i] * x^i) and return the derivative estimate.",
    starterCode: `def complex_step_derivative(coeffs, x, h=1e-20):
    # Your code here
    pass`,
    solution: `def complex_step_derivative(coeffs, x, h=1e-20):
    z = complex(x, h)
    val = sum(c * z ** i for i, c in enumerate(coeffs))
    return val.imag / h`,
    testCases: [
      { input: [[0, 0, 1], 3], expected: 6.0 },
      { input: [[0, 2, 0, 1], 2], expected: 13.999999999999998 },
      { input: [[5], 1], expected: 0.0 },
      { input: [[0, 1], 1], expected: 1.0 },
    ],
    hint: "The imaginary part of a complex evaluation carries the derivative with no cancellation error.",
  },
  {
    id: "ca-203",
    title: "Dual-Number Jacobian",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Forward-mode automatic differentiation evaluates a function on dual numbers (value, derivative).\n\nFor f(x, y) = [x*y + x, x^2 - y], seed x first and then y to assemble the Jacobian [[df1/dx, df1/dy], [df2/dx, df2/dy]]. Return the numeric matrix, which equals [[y + 1, x], [2x, -1]].",
    starterCode: `def dual_jacobian(x, y):
    # Return the 2x2 Jacobian
    # Your code here
    pass`,
    solution: `def dual_jacobian(x, y):
    return [[y + 1.0, x], [2.0 * x, -1.0]]`,
    testCases: [
      { input: [1, 2], expected: [[3.0, 1.0], [2.0, -1.0]] },
      { input: [0, 0], expected: [[1.0, 0.0], [0.0, -1.0]] },
      { input: [2, -1], expected: [[0.0, 2.0], [4.0, -1.0]] },
      { input: [-1, 3], expected: [[4.0, -1.0], [-2.0, -1.0]] },
    ],
    hint: "Each forward sweep computes one Jacobian column for the cost of one function evaluation.",
  },
  {
    id: "ca-204",
    title: "Forward-Mode AD Chain",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Propagate dual numbers through the composite h(g(f(x))) with f(x) = x^2, g(u) = u + 1, and h(v) = v^3.\n\nBy the chain rule the derivative is 3 * (x^2 + 1)^2 * 2x. Return the derivative at x.",
    starterCode: `def forward_ad_chain(x):
    # Your code here
    pass`,
    solution: `def forward_ad_chain(x):
    return 3.0 * (x * x + 1.0) ** 2 * (2.0 * x)`,
    testCases: [
      { input: [1], expected: 24.0 },
      { input: [0], expected: 0.0 },
      { input: [2], expected: 300.0 },
      { input: [-1], expected: -24.0 },
    ],
    hint: "Forward mode carries the derivative along with each intermediate value.",
  },
  {
    id: "ca-205",
    title: "Reverse-Mode AD Graph Cost",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a fully connected network with layer sizes layers = [n0, n1, ..., nL], the forward pass performs sum(n_i * n_{i+1}) multiply-adds.\n\nReverse-mode AD costs about twice the forward pass in the backward sweep, so the total is 3 * sum(n_i * n_{i+1}). Return the total operation count.",
    starterCode: `def reverse_ad_cost(layers):
    # Your code here
    pass`,
    solution: `def reverse_ad_cost(layers):
    total = 0
    for i in range(len(layers) - 1):
        total += layers[i] * layers[i + 1]
    return 3 * total`,
    testCases: [
      { input: [[2, 3]], expected: 18.0 },
      { input: [[3, 4, 2]], expected: 60.0 },
      { input: [[5]], expected: 0.0 },
      { input: [[1, 1, 1]], expected: 6.0 },
    ],
    hint: "Reverse mode costs roughly the same order as the forward pass, with about 2x the constant.",
  },
  {
    id: "ca-206",
    title: "Checkpoint Chain",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Gradient checkpointing stores activations every k of n layers instead of all of them, trading memory for recomputation.\n\nThe number of checkpoints is ceil(n / k), and backward recomputation adds one extra layer evaluation per checkpoint, so total forward-equivalent passes = n + ceil(n/k). Given n and k, return [checkpoints, total_passes].",
    starterCode: `def checkpoint_chain(n, k):
    # Return [checkpoints, total_passes]
    # Your code here
    pass`,
    solution: `def checkpoint_chain(n, k):
    c = (n + k - 1) // k
    return [c, n + c]`,
    testCases: [
      { input: [6, 2], expected: [3.0, 9.0] },
      { input: [10, 3], expected: [4.0, 14.0] },
      { input: [1, 1], expected: [1.0, 2.0] },
      { input: [7, 4], expected: [2.0, 9.0] },
    ],
    hint: "Smaller k saves more memory but costs more recomputation.",
  },
  {
    id: "ca-207",
    title: "Newton Decrement",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Newton decrement lambda^2 = g^T H^(-1) g measures how close a point is to the minimum of a self-concordant function.\n\nFor gradient g = (g1, g2) and Hessian H = [[ha, hb], [hb, hc]], solve H x = g and return g dot x. Assume H is positive definite.",
    starterCode: `def newton_decrement(g1, g2, ha, hb, hc):
    # Your code here
    pass`,
    solution: `def newton_decrement(g1, g2, ha, hb, hc):
    det = ha * hc - hb * hb
    x1 = (hc * g1 - hb * g2) / det
    x2 = (-hb * g1 + ha * g2) / det
    return g1 * x1 + g2 * x2`,
    testCases: [
      { input: [1, 1, 1, 0, 1], expected: 2.0 },
      { input: [2, 0, 2, 0, 4], expected: 2.0 },
      { input: [1, 2, 2, 0, 2], expected: 2.5 },
      { input: [3, 4, 5, 0, 5], expected: 5.0 },
      { input: [0, 0, 1, 0, 1], expected: 0.0 },
    ],
    hint: "This is the squared length of the Newton step measured in the Hessian norm.",
  },
  {
    id: "ca-208",
    title: "Damped Newton Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "A damped (Levenberg-Marquardt style) Newton step solves (H + lambda*I) d = g and moves x_new = x - d.\n\nFor the point (x, y), gradient (g1, g2), Hessian [[ha, hb], [hb, hc]], and damping lambda >= 0, return the updated point.",
    starterCode: `def damped_newton_step(point, g1, g2, ha, hb, hc, lam):
    # Return the updated [x, y]
    # Your code here
    pass`,
    solution: `def damped_newton_step(point, g1, g2, ha, hb, hc, lam):
    a = ha + lam
    c = hc + lam
    det = a * c - hb * hb
    dx = (c * g1 - hb * g2) / det
    dy = (-hb * g1 + a * g2) / det
    return [point[0] - dx, point[1] - dy]`,
    testCases: [
      { input: [[0, 0], 1, 1, 1, 0, 1, 0], expected: [-1.0, -1.0] },
      { input: [[0, 0], 1, 1, 1, 0, 1, 1], expected: [-0.5, -0.5] },
      { input: [[1, 1], 2, 2, 2, 0, 2, 0], expected: [0.0, 0.0] },
      { input: [[2, -1], 0, 0, 1, 0, 1, 0], expected: [2.0, -1.0] },
    ],
    hint: "Adding lambda*I shrinks the step and makes the system better conditioned.",
  },
  {
    id: "ca-209",
    title: "Proximal Operator of L1",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The proximal operator of the L1 norm is elementwise soft-thresholding:\n\nprox(v) = sign(v) * max(|v| - lambda, 0)\n\nGiven a list of values and lambda >= 0, return the prox result.",
    starterCode: `def prox_l1(values, lam):
    # Your code here
    pass`,
    solution: `def prox_l1(values, lam):
    return [(v - lam) if v > lam else ((v + lam) if v < -lam else 0.0) for v in values]`,
    testCases: [
      { input: [[3, -2], 1], expected: [2.0, -1.0] },
      { input: [[0.5], 1], expected: [0.0] },
      { input: [[1, 2, 3], 0], expected: [1.0, 2.0, 3.0] },
      { input: [[-0.5, 0.5], 0.5], expected: [0.0, 0.0] },
    ],
    hint: "Soft-thresholding drives small entries exactly to zero, which creates sparsity.",
  },
  {
    id: "ca-210",
    title: "Proximal Operator of L2",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The proximal operator of the L2 norm is block soft-thresholding:\n\nprox(v) = v * max(1 - lambda / ||v||, 0)\n\nGiven a list of values and lambda >= 0, return the prox result. A zero vector stays zero.",
    starterCode: `def prox_l2(values, lam):
    # Your code here
    pass`,
    solution: `def prox_l2(values, lam):
    norm = sum(v * v for v in values) ** 0.5
    if norm == 0:
        return [0.0 for _ in values]
    scale = max(1.0 - lam / norm, 0.0)
    return [scale * v for v in values]`,
    testCases: [
      { input: [[3, 4], 1], expected: [2.4000000000000004, 3.2] },
      { input: [[0, 0], 1], expected: [0.0, 0.0] },
      { input: [[1, 0], 2], expected: [0.0, 0.0] },
      { input: [[6, 8], 10], expected: [0.0, 0.0] },
      { input: [[1, 0], 0.5], expected: [0.5, 0.0] },
    ],
    hint: "Unlike L1, the L2 prox shrinks the whole vector without zeroing individual entries.",
  },
  {
    id: "ca-211",
    title: "Proximal Operator of Elastic Net",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The elastic net penalty is lambda1 * ||v||_1 + (lambda2 / 2) * ||v||_2^2, combining sparsity with shrinkage.\n\nIts proximal operator applies soft-thresholding and then divides by (1 + lambda2): prox(v_i) = soft(v_i, lambda1) / (1 + lambda2). Given the values and both penalties, return the result.",
    starterCode: `def prox_elastic_net(values, lam1, lam2):
    # Your code here
    pass`,
    solution: `def prox_elastic_net(values, lam1, lam2):
    outp = []
    for v in values:
        if v > lam1:
            s = v - lam1
        elif v < -lam1:
            s = v + lam1
        else:
            s = 0.0
        outp.append(s / (1.0 + lam2))
    return outp`,
    testCases: [
      { input: [[3, -2], 0.5, 1], expected: [1.25, -0.75] },
      { input: [[1], 1, 0], expected: [0.0] },
      { input: [[4], 0, 2], expected: [1.3333333333333333] },
      { input: [[0.3], 0.5, 1], expected: [0.0] },
    ],
    hint: "The L2 part rescales all surviving coefficients uniformly.",
  },
  {
    id: "ca-212",
    title: "Proximal Operator of Box",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The proximal operator of the indicator function of the box [lo, hi] is the projection onto that box, which is elementwise clipping.\n\nGiven a list of values and bounds lo <= hi, return [max(lo, min(hi, v)) for each v].",
    starterCode: `def prox_box(values, lo, hi):
    # Your code here
    pass`,
    solution: `def prox_box(values, lo, hi):
    return [min(max(v, lo), hi) for v in values]`,
    testCases: [
      { input: [[-2, 0.5, 3], 0, 1], expected: [0.0, 0.5, 1.0] },
      { input: [[5, 5], -1, 1], expected: [1.0, 1.0] },
      { input: [[0.2, 0.8], 0.3, 0.7], expected: [0.3, 0.7] },
      { input: [[], 0, 1], expected: [] },
    ],
    hint: "Projection onto a box clips every coordinate independently.",
  },
  {
    id: "ca-213",
    title: "Simplex Projection",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The Euclidean projection of a vector onto the probability simplex {x : x_i >= 0, sum(x) = 1} is computed by sorting the values in descending order, finding the largest rho with u_rho - (sum of top rho - 1) / rho > 0, setting theta to that value, and returning max(v_i - theta, 0).\n\nGiven the values, return the projected vector.",
    starterCode: `def simplex_projection(values):
    # Your code here
    pass`,
    solution: `def simplex_projection(values):
    n = len(values)
    if n == 0:
        return []
    u = sorted(values, reverse=True)
    css = 0.0
    rho = 0
    theta = 0.0
    for i in range(n):
        css += u[i]
        if u[i] - (css - 1.0) / (i + 1) > 0:
            rho = i + 1
            theta = (css - 1.0) / (i + 1)
    return [max(v - theta, 0.0) for v in values]`,
    testCases: [
      { input: [[0.5, 0.5]], expected: [0.5, 0.5] },
      { input: [[1, 0, 0]], expected: [1.0, 0.0, 0.0] },
      {
        input: [[0.2, 0.2, 0.2]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      { input: [[2, 0.5, 0.5]], expected: [1.0, 0.0, 0.0] },
      { input: [[-1, 2, 0.5]], expected: [0.0, 1.0, 0.0] },
    ],
    hint: "A single scalar shift makes all coordinates nonnegative and forces the sum to 1.",
  },
  {
    id: "ca-214",
    title: "Bregman Divergence",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the negative entropy generator phi(x) = sum(x_i * log(x_i)), the Bregman divergence is the KL divergence:\n\nD(p, q) = sum(p_i * log(p_i / q_i))\n\nTerms with p_i = 0 contribute zero. Given probability vectors p and q, return the divergence.",
    starterCode: `def bregman_kl(p, q):
    # Your code here
    pass`,
    solution: `def bregman_kl(p, q):
    import math
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total += pi * math.log(pi / qi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.14384103622589042 },
      { input: [[1, 0], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.25, 0.75], [0.5, 0.5]], expected: 0.13081203594113697 },
    ],
    hint: "KL divergence is nonnegative and equals zero only when the distributions match.",
  },
  {
    id: "ca-215",
    title: "Bregman Proximal Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Mirror descent with the negative entropy mirror map gives the exponentiated-gradient update:\n\nx_i proportional to q_i * exp(-eta * grad_i), normalized to sum to 1\n\nGiven the current point q, the gradient, and the step size eta, return the updated point.",
    starterCode: `def bregman_prox_step(q, grad, eta):
    # Your code here
    pass`,
    solution: `def bregman_prox_step(q, grad, eta):
    import math
    w = [q[i] * math.exp(-eta * grad[i]) for i in range(len(q))]
    s = sum(w)
    return [v / s for v in w]`,
    testCases: [
      { input: [[0.5, 0.5], [0, 0], 1], expected: [0.5, 0.5] },
      {
        input: [[0.5, 0.5], [1, -1], 0.5],
        expected: [0.26894142136999516, 0.731058578630005],
      },
      { input: [[1, 0], [0, 0], 1], expected: [1.0, 0.0] },
      {
        input: [[0.2, 0.8], [-1, 1], 1],
        expected: [0.6487856442839393, 0.3512143557160607],
      },
    ],
    hint: "Multiplicative updates keep the iterates nonnegative and on the simplex automatically.",
  },
  {
    id: "ca-216",
    title: "Conjugate Function Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The convex conjugate of f(x) = e^x is f*(y) = y * log(y) - y for y > 0, with f*(0) = 0.\n\nGiven y >= 0, return f*(y). The conjugate is always convex in y.",
    starterCode: `def conjugate_exp(y):
    # Your code here
    pass`,
    solution: `def conjugate_exp(y):
    import math
    if y <= 0:
        return 0.0
    return y * math.log(y) - y`,
    testCases: [
      { input: [1], expected: -1.0 },
      { input: [0], expected: 0.0 },
      { input: [2], expected: -0.6137056388801094 },
      { input: [0.5], expected: -0.8465735902799727 },
      { input: [2.718281828459045], expected: 0.0 },
    ],
    hint: "Maximize y*x - e^x over x; the optimizer is x = log(y).",
  },
  {
    id: "ca-217",
    title: "Fenchel Duality Gap",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Fenchel-Young inequality states f(x) + f*(y) >= x*y for all x, y, with equality when y is a subgradient of f at x.\n\nFor f(x) = 0.5*x^2 with f*(y) = 0.5*y^2, the gap is f(x) + f*(y) - x*y = 0.5*(x - y)^2. Given x and y, return this gap.",
    starterCode: `def fenchel_duality_gap(x, y):
    # Your code here
    pass`,
    solution: `def fenchel_duality_gap(x, y):
    return 0.5 * (x - y) ** 2`,
    testCases: [
      { input: [1, 1], expected: 0.0 },
      { input: [1, 0], expected: 0.5 },
      { input: [-2, 3], expected: 12.5 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "The gap is zero exactly when y = f'(x) = x.",
  },
  {
    id: "ca-218",
    title: "Subgradient of Hinge Loss",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The hinge loss is max(0, 1 - y * w dot x) with y in {+1, -1}.\n\nA subgradient with respect to w is -y*x when the margin y*w dot x is below 1, and 0 otherwise (choose 0 at the kink). Given w, x, and y, return the subgradient vector.",
    starterCode: `def subgradient_hinge(w, x, y):
    # Your code here
    pass`,
    solution: `def subgradient_hinge(w, x, y):
    margin = y * sum(w[i] * x[i] for i in range(len(w)))
    if margin < 1.0:
        return [-y * x[i] for i in range(len(x))]
    return [0.0 for _ in x]`,
    testCases: [
      { input: [[1, 0], [1, 0], 1], expected: [0.0, 0.0] },
      { input: [[0, 0], [1, 2], 1], expected: [-1.0, -2.0] },
      { input: [[0, 0], [1, 2], -1], expected: [1.0, 2.0] },
      { input: [[1, 1], [1, 1], 1], expected: [0.0, 0.0] },
    ],
    hint: "Only points inside or on the margin produce a nonzero subgradient.",
  },
  {
    id: "ca-219",
    title: "Subgradient of Max",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The subgradient of max_i x_i is a one-hot vector selecting an index that attains the maximum.\n\nGiven a list of values, return the one-hot vector choosing the first index with the largest value, which is a valid subgradient on ties.",
    starterCode: `def subgradient_max(values):
    # Your code here
    pass`,
    solution: `def subgradient_max(values):
    best = 0
    for i in range(1, len(values)):
        if values[i] > values[best]:
            best = i
    return [1.0 if i == best else 0.0 for i in range(len(values))]`,
    testCases: [
      { input: [[1, 3, 2]], expected: [0.0, 1.0, 0.0] },
      { input: [[5, 5, 1]], expected: [1.0, 0.0, 0.0] },
      { input: [[-1, -2]], expected: [1.0, 0.0] },
      { input: [[0]], expected: [1.0] },
    ],
    hint: "At a tie any convex combination of the maximizers is a valid subgradient.",
  },
  {
    id: "ca-220",
    title: "Smooth Approximation of Max",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The log-sum-exp function smooths the maximum:\n\nmax_i x_i <= (1/tau) * log(sum exp(tau * x_i)) <= max_i x_i + log(n)/tau\n\nGiven values and the temperature parameter tau > 0, return the smooth maximum. Subtract the max before exponentiating for stability.",
    starterCode: `def smooth_max(values, tau):
    # Your code here
    pass`,
    solution: `def smooth_max(values, tau):
    import math
    m = max(values)
    return m + math.log(sum(math.exp(tau * (v - m)) for v in values)) / tau`,
    testCases: [
      { input: [[0, 0], 1], expected: 0.6931471805599453 },
      { input: [[1, 2], 1], expected: 2.313261687518223 },
      { input: [[0], 5], expected: 0.0 },
      { input: [[0, 0], 0.5], expected: 1.3862943611198906 },
    ],
    hint: "As tau grows the approximation approaches the exact maximum.",
  },
  {
    id: "ca-221",
    title: "Log-Sum-Exp Hessian-Vector Product",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Hessian of the log-sum-exp function L(x) = log(sum exp(x_i)) is diag(s) - s s^T, where s is the softmax of x.\n\nCompute the Hessian-vector product H v efficiently as s_i * (v_i - s dot v) for each i, and return the result vector.",
    starterCode: `def logsumexp_hessian_vector(logits, v):
    # Your code here
    pass`,
    solution: `def logsumexp_hessian_vector(logits, v):
    import math
    m = max(logits)
    e = [math.exp(x - m) for x in logits]
    s = sum(e)
    p = [x / s for x in e]
    sv = sum(p[i] * v[i] for i in range(len(p)))
    return [p[i] * (v[i] - sv) for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0], [1, 0]], expected: [0.25, -0.25] },
      { input: [[1, 2, 3], [1, 1, 1]], expected: [0.0, 0.0, 0.0] },
      { input: [[0, 1], [1, -1]], expected: [0.3932238664829637, -0.3932238664829637] },
    ],
    hint: "The Hessian is positive semidefinite with the all-ones vector in its null space.",
  },
  {
    id: "ca-222",
    title: "Temperature-Scaled Softmax Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "With temperature scaling the probabilities are s = softmax(x / tau), and the Jacobian is (1/tau) * (diag(s) - s s^T).\n\nReturn row i of that Jacobian: (1/tau) * s_i * (delta_ij - s_j) for each j. Given the logits, the row index i, and tau > 0, return the row.",
    starterCode: `def temperature_softmax_grad(logits, i, tau):
    # Your code here
    pass`,
    solution: `def temperature_softmax_grad(logits, i, tau):
    import math
    scaled = [v / tau for v in logits]
    m = max(scaled)
    e = [math.exp(v - m) for v in scaled]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] * ((1.0 if i == j else 0.0) - p[j]) / tau for j in range(len(p))]`,
    testCases: [
      { input: [[0, 0], 0, 2], expected: [0.125, -0.125] },
      { input: [[1, 1, 1], 2, 1], expected: [-0.1111111111111111, -0.1111111111111111, 0.22222222222222224] },
      { input: [[2, -1], 0, 0.5], expected: [0.004933018582719862, -0.004933018582720097] },
      { input: [[0, 1], 0, 1], expected: [0.19661193324148185, -0.19661193324148185] },
    ],
    hint: "Low temperature sharpens the distribution and inflates the gradient by 1/tau.",
  },
  {
    id: "ca-223",
    title: "Gumbel-Softmax Sample",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "A Gumbel-softmax sample perturbs logits with Gumbel noise g_i = -log(-log(u_i)), u_i uniform, then applies a temperature-scaled softmax:\n\ny = softmax((logits + g) / tau)\n\nUse random.Random(seed) and draw the uniforms in order, one per logit. Return the sample vector.",
    starterCode: `def gumbel_softmax_sample(logits, tau, seed):
    # Your code here
    pass`,
    solution: `def gumbel_softmax_sample(logits, tau, seed):
    import math
    import random
    rng = random.Random(seed)
    g = []
    for _ in logits:
        u = rng.random()
        g.append(-math.log(-math.log(u)))
    scaled = [(logits[i] + g[i]) / tau for i in range(len(logits))]
    m = max(scaled)
    e = [math.exp(v - m) for v in scaled]
    s = sum(e)
    return [v / s for v in e]`,
    testCases: [
      { input: [[0, 0], 1, 42], expected: [0.8918706788632648, 0.10812932113673522] },
      {
        input: [[1, 2, 3], 0.5, 7],
        expected: [0.0026303955863455713, 0.0069065892697156425, 0.9904630151439388],
      },
      { input: [[0, -1], 2, 123], expected: [0.5999155108843205, 0.40008448911567956] },
    ],
    hint: "The Gumbel-max trick makes the argmax of the perturbed logits a categorical sample.",
  },
  {
    id: "ca-224",
    title: "Straight-Through Gumbel",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The straight-through Gumbel estimator uses a hard one-hot sample in the forward pass while backpropagating through the soft sample.\n\nGenerate the same seeded Gumbel-softmax sample, then take the one-hot vector of its argmax (first maximum wins). Return [hard_onehot, soft_sample].",
    starterCode: `def straight_through_gumbel(logits, tau, seed):
    # Return [hard_onehot, soft_sample]
    # Your code here
    pass`,
    solution: `def straight_through_gumbel(logits, tau, seed):
    import math
    import random
    rng = random.Random(seed)
    g = []
    for _ in logits:
        u = rng.random()
        g.append(-math.log(-math.log(u)))
    scaled = [(logits[i] + g[i]) / tau for i in range(len(logits))]
    m = max(scaled)
    e = [math.exp(v - m) for v in scaled]
    s = sum(e)
    soft = [v / s for v in e]
    best = 0
    for i in range(1, len(soft)):
        if soft[i] > soft[best]:
            best = i
    hard = [1.0 if i == best else 0.0 for i in range(len(soft))]
    return [hard, soft]`,
    testCases: [
      {
        input: [[0, 0], 1, 42],
        expected: [[1.0, 0.0], [0.8918706788632648, 0.10812932113673522]],
      },
      {
        input: [[1, 2, 3], 0.5, 7],
        expected: [
          [0.0, 0.0, 1.0],
          [0.0026303955863455713, 0.0069065892697156425, 0.9904630151439388],
        ],
      },
      {
        input: [[0, -1], 2, 123],
        expected: [[1.0, 0.0], [0.5999155108843205, 0.40008448911567956]],
      },
    ],
    hint: "In the backward pass the hard sample is treated as if it were the soft one.",
  },
  {
    id: "ca-225",
    title: "Sinkhorn One Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "One Sinkhorn iteration alternates scaling to match the marginals. With K = exp(-cost / eps) and initial row scaling u0:\n\nv_j = c_j / sum_i(u0_i * K_ij), then u_i = r_i / sum_j(K_ij * v_j)\n\nThe transport plan is P_ij = u_i * K_ij * v_j. Return the plan for one full iteration.",
    starterCode: `def sinkhorn_one_step(cost, r, c, eps, u0):
    # Your code here
    pass`,
    solution: `def sinkhorn_one_step(cost, r, c, eps, u0):
    import math
    n = len(cost)
    m = len(cost[0])
    K = [[math.exp(-cost[i][j] / eps) for j in range(m)] for i in range(n)]
    v = []
    for j in range(m):
        den = sum(u0[i] * K[i][j] for i in range(n))
        v.append(c[j] / den)
    u = []
    for i in range(n):
        den = sum(K[i][j] * v[j] for j in range(m))
        u.append(r[i] / den)
    return [[u[i] * K[i][j] * v[j] for j in range(m)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [0.5, 0.5], [0.5, 0.5], 1, [1, 1]], expected: [[0.25, 0.25], [0.25, 0.25]] },
      {
        input: [[[0, 1], [1, 0]], [0.5, 0.5], [0.5, 0.5], 0.5, [1, 1]],
        expected: [
          [0.44039853898894127, 0.05960146101105879],
          [0.05960146101105879, 0.44039853898894127],
        ],
      },
      { input: [[[1]], [1], [1], 1, [1]], expected: [[1.0]] },
      {
        input: [[[1, 2], [3, 4]], [0.4, 0.6], [0.3, 0.7], 2, [0.5, 0.5]],
        expected: [
          [0.12000000000000001, 0.27999999999999997],
          [0.18, 0.42000000000000004],
        ],
      },
    ],
    hint: "Entropic regularization turns optimal transport into alternating diagonal scalings.",
  },
  {
    id: "ca-226",
    title: "Optimal Transport Cost",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The cost of a transport plan P with cost matrix C is the Frobenius inner product:\n\ncost = sum over i, j of P_ij * C_ij\n\nGiven the plan and the cost matrix, return the total transport cost.",
    starterCode: `def optimal_transport_cost(plan, cost):
    # Your code here
    pass`,
    solution: `def optimal_transport_cost(plan, cost):
    total = 0.0
    for i in range(len(plan)):
        for j in range(len(plan[i])):
            total += plan[i][j] * cost[i][j]
    return total`,
    testCases: [
      { input: [[[0.5, 0.5], [0, 0]], [[1, 2], [3, 4]]], expected: 1.5 },
      { input: [[[0, 1], [1, 0]], [[2, 5], [7, 3]]], expected: 12.0 },
      { input: [[[1]], [[4]]], expected: 4.0 },
      { input: [[[0.25, 0.25], [0.25, 0.25]], [[1, 2], [3, 4]]], expected: 2.5 },
    ],
    hint: "The optimal plan minimizes this inner product subject to the marginal constraints.",
  },
  {
    id: "ca-227",
    title: "Wasserstein-1 Dual Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The Wasserstein-1 distance has the dual form sup over 1-Lipschitz f of E_mu[f] - E_nu[f].\n\nGiven sorted support points xs, potential values f_values, and the weights of mu and nu, compute the dual objective and check whether f is 1-Lipschitz: every secant slope |df/dx| must be at most 1 within 1e-9. Return [objective, feasible].",
    starterCode: `def wasserstein1_dual_check(xs, f_values, weights_mu, weights_nu):
    # Return [objective, feasible]
    # Your code here
    pass`,
    solution: `def wasserstein1_dual_check(xs, f_values, weights_mu, weights_nu):
    obj = 0.0
    for i in range(len(xs)):
        obj += weights_mu[i] * f_values[i] - weights_nu[i] * f_values[i]
    max_slope = 0.0
    for i in range(1, len(xs)):
        slope = abs(f_values[i] - f_values[i - 1]) / abs(xs[i] - xs[i - 1])
        if slope > max_slope:
            max_slope = slope
    return [obj, max_slope <= 1.0 + 1e-9]`,
    testCases: [
      { input: [[0, 1, 2], [0, 0.5, 1], [0.5, 0.5, 0], [0, 0.5, 0.5]], expected: [-0.5, true] },
      { input: [[0, 1], [0, 2], [1, 0], [0, 1]], expected: [-2.0, false] },
      { input: [[0, 1], [0, 1], [0.5, 0.5], [0.5, 0.5]], expected: [0.0, true] },
      {
        input: [[0, 1, 2], [1, 0, 1], [0.3333333333333333, 0.3333333333333333, 0.3333333333333333], [0, 0, 1]],
        expected: [-0.3333333333333334, true],
      },
    ],
    hint: "Kantorovich-Rubinstein duality turns the optimal transport problem into a Lipschitz-constrained optimization.",
  },
  {
    id: "ca-228",
    title: "Kantorovich Potential Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The c-transform of a Kantorovich potential g is f_i = min_j (C_ij - g_j), which is one step of the alternating dual ascent for optimal transport.\n\nGiven the cost matrix C and the current potential g, return the transformed potential f.",
    starterCode: `def kantorovich_ctransform(cost, g):
    # Your code here
    pass`,
    solution: `def kantorovich_ctransform(cost, g):
    return [min(cost[i][j] - g[j] for j in range(len(cost[i]))) for i in range(len(cost))]`,
    testCases: [
      { input: [[[0, 2], [3, 0]], [0, 0]], expected: [0.0, 0.0] },
      { input: [[[1, 2], [3, 4]], [0.5, 0]], expected: [0.5, 2.5] },
      { input: [[[5]], [1]], expected: [4.0] },
      { input: [[[1, 2], [3, 0]], [2, 1]], expected: [-1.0, -1.0] },
    ],
    hint: "Alternating c-transforms converge to the optimal dual potentials.",
  },
  {
    id: "ca-229",
    title: "Sinkhorn Divergence Gradient Lite",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The Sinkhorn divergence is S = OT(mu, nu) - 0.5*OT(mu, mu) - 0.5*OT(nu, nu), and by the envelope theorem the gradient with respect to a shared cost entry is the corresponding transport plan entry.\n\nGiven the three plans and indices (i, j), return P_munu[i][j] - 0.5*P_mumu[i][j] - 0.5*P_nunu[i][j].",
    starterCode: `def sinkhorn_divergence_grad(plan_munu, plan_mumu, plan_nunu, i, j):
    # Your code here
    pass`,
    solution: `def sinkhorn_divergence_grad(plan_munu, plan_mumu, plan_nunu, i, j):
    return plan_munu[i][j] - 0.5 * plan_mumu[i][j] - 0.5 * plan_nunu[i][j]`,
    testCases: [
      {
        input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]], [[1, 0], [0, 1]], 0, 0],
        expected: 0.0,
      },
      {
        input: [[[0.5, 0.5], [0, 0]], [[1, 0], [0, 0]], [[0, 0], [0, 1]], 0, 0],
        expected: 0.0,
      },
      {
        input: [[[0.5, 0.5], [0, 0]], [[1, 0], [0, 0]], [[0, 0], [0, 1]], 0, 1],
        expected: 0.5,
      },
      {
        input: [[[0.5, 0.5], [0, 0]], [[1, 0], [0, 0]], [[0, 0], [0, 1]], 1, 1],
        expected: -0.5,
      },
    ],
    hint: "The self-transport terms correct the entropic bias of Sinkhorn.",
  },
  {
    id: "ca-230",
    title: "Jensen Gap Estimate",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the convex function f(x) = e^x, Jensen's inequality gives E[f(X)] >= f(E[X]), with equality for constant samples.\n\nThe gap is E[exp(X)] - exp(E[X]). Given a list of samples, return the empirical gap.",
    starterCode: `def jensen_gap(samples):
    # Your code here
    pass`,
    solution: `def jensen_gap(samples):
    import math
    return sum(math.exp(v) for v in samples) / len(samples) - math.exp(sum(samples) / len(samples))`,
    testCases: [
      { input: [[0, 0]], expected: 0.0 },
      { input: [[0, 1]], expected: 0.21041964352939435 },
      { input: [[1, 1]], expected: 0.0 },
      { input: [[0, 2]], expected: 1.4762462210062801 },
    ],
    hint: "The gap grows with the variance of the samples for a strictly convex function.",
  },
];
