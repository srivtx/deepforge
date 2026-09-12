import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-231",
    title: "Softmax Jacobian Diagonal",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For softmax probabilities s = softmax(logits), the diagonal of the Jacobian contains the entries s_i * (1 - s_i).\n\nGiven the logits, return this diagonal as a list. Subtract the maximum logit before exponentiating for numerical stability.",
    starterCode: `def softmax_jacobian_diagonal(logits):
    # Your code here
    pass`,
    solution: `def softmax_jacobian_diagonal(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] * (1.0 - p[i]) for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0]], expected: [0.25, 0.25] },
      { input: [[0, 1]], expected: [0.19661193324148185, 0.19661193324148185] },
      {
        input: [[1, 1, 1]],
        expected: [0.22222222222222224, 0.22222222222222224, 0.22222222222222224],
      },
      { input: [[2, -1]], expected: [0.045176659730912, 0.045176659730912144] },
    ],
    hint: "Each diagonal entry is the variance of a Bernoulli with success probability s_i.",
  },
  {
    id: "ca-232",
    title: "Quadratic Form Hessian from Matrix",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the quadratic form f(x) = x^T A x with a general 2x2 matrix A, the Hessian with respect to x is the symmetric part A + A^T.\n\nGiven the entries a11, a12, a21, a22 of A, return the 2x2 Hessian as a nested list of floats. The diagonal entries are twice the diagonal of A.",
    starterCode: `def quadratic_hessian_from_matrix(a11, a12, a21, a22):
    # Return the 2x2 Hessian
    # Your code here
    pass`,
    solution: `def quadratic_hessian_from_matrix(a11, a12, a21, a22):
    return [[2.0 * a11, a12 + a21], [a12 + a21, 2.0 * a22]]`,
    testCases: [
      { input: [1, 2, 3, 4], expected: [[2.0, 5.0], [5.0, 8.0]] },
      { input: [1, 0, 0, 1], expected: [[2.0, 0.0], [0.0, 2.0]] },
      { input: [0, 1, -1, 0], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [2, -1, 4, 3], expected: [[4.0, 3.0], [3.0, 6.0]] },
    ],
    hint: "Only the symmetric part of A matters because x^T A x = x^T (A + A^T) x / 2.",
  },
  {
    id: "ca-233",
    title: "Logistic Hessian-Vector Product",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the logistic loss L(w) = log(1 + exp(-y * w dot x)) with label y in {+1, -1}, let p = 1 / (1 + exp(y * w dot x)) and c = p * (1 - p).\n\nThe Hessian is c * x x^T, so the Hessian-vector product with a vector v is c * (x dot v) * x. Given w, x, y, and v, return that product.",
    starterCode: `def logistic_hessian_vector_product(w, x, y, v):
    # Return H @ v
    # Your code here
    pass`,
    solution: `def logistic_hessian_vector_product(w, x, y, v):
    import math
    z = sum(w[t] * x[t] for t in range(len(w)))
    p = 1.0 / (1.0 + math.exp(y * z))
    c = p * (1 - p)
    xv = sum(x[t] * v[t] for t in range(len(x)))
    return [c * xv * x[t] for t in range(len(x))]`,
    testCases: [
      { input: [[0, 0], [1, 1], 1, [1, 0]], expected: [0.25, 0.25] },
      { input: [[1, 0], [2, 0], 1, [1, 1]], expected: [0.419974341614026, 0.0] },
      { input: [[0, 1], [1, -2], -1, [2, 1]], expected: [0.0, 0.0] },
      { input: [[0.5, -0.5], [1, 1], 1, [1, -1]], expected: [0.0, 0.0] },
    ],
    hint: "The Hessian is a rank-one outer product scaled by the sigmoid variance.",
  },
  {
    id: "ca-234",
    title: "Hessian Trace by Finite Differences",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Estimate the trace of the Hessian of f(x) = sum(coeffs[i] * x_i^3) with central second differences.\n\nEach diagonal entry is approximated by (f(x + h e_i) - 2 f(x) + f(x - h e_i)) / h^2, and the trace is their sum. Given the coefficients and the point x, return the estimate using h = 1e-3; the formula is exact for this cubic function.",
    starterCode: `def hessian_trace_fd(coeffs, x, h=1e-3):
    # Your code here
    pass`,
    solution: `def hessian_trace_fd(coeffs, x, h=1e-3):
    total = 0.0
    for i in range(len(x)):
        xp = list(x)
        xp[i] += h
        xm = list(x)
        xm[i] -= h
        fp = sum(coeffs[j] * xp[j] ** 3 for j in range(len(x)))
        f0 = sum(coeffs[j] * x[j] ** 3 for j in range(len(x)))
        fm = sum(coeffs[j] * xm[j] ** 3 for j in range(len(x)))
        total += (fp - 2.0 * f0 + fm) / (h * h)
    return total`,
    testCases: [
      { input: [[1, 1], [1, 2]], expected: 18.0 },
      { input: [[2, -1], [0, 1]], expected: -6.0 },
      { input: [[1], [0]], expected: 0.0 },
      { input: [[1, 2, 3], [1, 1, 1]], expected: 36.0 },
    ],
    hint: "The trace of the Hessian is the Laplacian, and the analytic value here is 6 * sum(coeffs[i] * x_i).",
  },
  {
    id: "ca-235",
    title: "Trace-Inverse Gradient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For L(A) = trace(C A^{-1}) with constant matrix C, the gradient with respect to A is -(A^{-1} C A^{-1})^T.\n\nGiven the entries of the 2x2 matrix A as a, b, c, d and the entries of C as p, q, r, s, return the 2x2 gradient as a nested list. Return None when det(A) == 0.",
    starterCode: `def trace_inverse_gradient(a, b, c, d, p, q, r, s):
    # Return the 2x2 gradient
    # Your code here
    pass`,
    solution: `def trace_inverse_gradient(a, b, c, d, p, q, r, s):
    det = a * d - b * c
    if det == 0:
        return None
    inv = [[d / det, -b / det], [-c / det, a / det]]
    C = [[p, q], [r, s]]
    ic = [[sum(inv[i][k] * C[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    M = [[sum(ic[i][k] * inv[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    return [[-M[j][i] for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [1, 0, 0, 1, 1, 2, 3, 4], expected: [[-1.0, -3.0], [-2.0, -4.0]] },
      { input: [2, 0, 0, 1, 1, 0, 0, 1], expected: [[-0.25, 0.0], [0.0, -1.0]] },
      { input: [1, 2, 3, 4, 1, 0, 0, 1], expected: [[-5.5, 3.75], [2.5, -1.75]] },
      { input: [1, 2, 3, 6, 1, 0, 0, 1], expected: null },
    ],
    hint: "Differentiate A A^{-1} = I to get d(A^{-1}) = -A^{-1} dA A^{-1}, then read off the gradient.",
  },
  {
    id: "ca-236",
    title: "Log-Determinant Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a 2x2 matrix A, the gradient of log(det(A)) with respect to the entries is the inverse transpose A^{-T}.\n\nGiven the entries a, b, c, d of A, return this 2x2 gradient as a nested list of floats. Return None when det(A) == 0.",
    starterCode: `def log_det_gradient(a, b, c, d):
    # Return the 2x2 gradient of log(det(A))
    # Your code here
    pass`,
    solution: `def log_det_gradient(a, b, c, d):
    det = a * d - b * c
    if det == 0:
        return None
    return [[d / det, -c / det], [-b / det, a / det]]`,
    testCases: [
      { input: [1, 2, 3, 4], expected: [[-2.0, 1.5], [1.0, -0.5]] },
      { input: [2, 0, 0, 4], expected: [[0.5, 0.0], [0.0, 0.25]] },
      { input: [1, 0, 0, 1], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [1, 2, 2, 4], expected: null },
    ],
    hint: "Log-determinant is a standard barrier function; its gradient is the inverse transpose.",
  },
  {
    id: "ca-237",
    title: "Trace AXB Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the scalar function f(X) = trace(A X B) with constant 2x2 matrices A and B, the gradient with respect to X is A^T B^T.\n\nGiven the entries of A (a, b, c, d) and B (e, f, g, h), return the 2x2 gradient as a nested list.",
    starterCode: `def trace_axb_gradient(a, b, c, d, e, f, g, h):
    # Return the 2x2 gradient
    # Your code here
    pass`,
    solution: `def trace_axb_gradient(a, b, c, d, e, f, g, h):
    return [[a * e + c * f, a * g + c * h], [b * e + d * f, b * g + d * h]]`,
    testCases: [
      { input: [1, 0, 0, 1, 1, 0, 0, 1], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [1, 2, 3, 4, 5, 6, 7, 8], expected: [[23.0, 31.0], [34.0, 46.0]] },
      { input: [0, 0, 0, 0, 1, 2, 3, 4], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [1, 0, 0, 2, 0, 1, 1, 0], expected: [[0.0, 1.0], [2.0, 0.0]] },
    ],
    hint: "Write the trace as a sum over indices and differentiate entry by entry.",
  },
  {
    id: "ca-238",
    title: "Gradient of the Frobenius Norm",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a nonzero matrix X, the gradient of the Frobenius norm ||X||_F = sqrt(sum of squared entries) is X / ||X||_F.\n\nGiven a matrix as a nested list, return the gradient with the same shape. Return the zero matrix when all entries are zero.",
    starterCode: `def frobenius_norm_gradient(matrix):
    # Your code here
    pass`,
    solution: `def frobenius_norm_gradient(matrix):
    nrm = sum(matrix[i][j] ** 2 for i in range(len(matrix)) for j in range(len(matrix[0]))) ** 0.5
    if nrm == 0:
        return [[0.0 for _ in row] for row in matrix]
    return [[matrix[i][j] / nrm for j in range(len(matrix[0]))] for i in range(len(matrix))]`,
    testCases: [
      { input: [[[3, 4], [0, 0]]], expected: [[0.6, 0.8], [0.0, 0.0]] },
      {
        input: [[[1, 0], [0, 1]]],
        expected: [[0.7071067811865475, 0.0], [0.0, 0.7071067811865475]],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[2]]], expected: [[1.0]] },
    ],
    hint: "The gradient points along the matrix itself with length one.",
  },
  {
    id: "ca-239",
    title: "Gradient of the Spectral Norm",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For a matrix A with a unique largest singular value, the gradient of the spectral norm ||A||_2 is u v^T, where u and v are the top left and right singular vectors.\n\nGiven the four entries of a 2x2 matrix, compute the top singular pair from the eigen-decomposition of A^T A and return u v^T as a nested list. When the top singular value is tied, use the first coordinate direction.",
    starterCode: `def spectral_norm_gradient(a, b, c, d):
    # Return u @ v^T
    # Your code here
    pass`,
    solution: `def spectral_norm_gradient(a, b, c, d):
    m11 = a * a + c * c
    m12 = a * b + c * d
    m22 = b * b + d * d
    tr = m11 + m22
    disc = (((m11 - m22) / 2.0) ** 2 + m12 * m12) ** 0.5
    lam = tr / 2.0 + disc
    if m12 != 0:
        v1 = m12
        v2 = lam - m11
    elif m11 >= m22:
        v1, v2 = 1.0, 0.0
    else:
        v1, v2 = 0.0, 1.0
    nv = (v1 * v1 + v2 * v2) ** 0.5
    v1, v2 = v1 / nv, v2 / nv
    u1 = a * v1 + b * v2
    u2 = c * v1 + d * v2
    nu = (u1 * u1 + u2 * u2) ** 0.5
    if nu == 0:
        return [[0.0, 0.0], [0.0, 0.0]]
    u1, u2 = u1 / nu, u2 / nu
    return [[u1 * v1, u1 * v2], [u2 * v1, u2 * v2]]`,
    testCases: [
      { input: [3, 0, 0, 1], expected: [[1.0, 0.0], [0.0, 0.0]] },
      { input: [0, 1, 0, 0], expected: [[0.0, 1.0], [0.0, 0.0]] },
      { input: [2, 0, 0, 2], expected: [[1.0, 0.0], [0.0, 0.0]] },
      {
        input: [1, 2, 3, 4],
        expected: [[0.2330424601316968, 0.3306883952871801], [0.526804530425364, 0.7475382155592233]],
      },
    ],
    hint: "The top right singular vector is the top eigenvector of A^T A, and u = A v / ||A v||.",
  },
  {
    id: "ca-240",
    title: "Backprop Through a Linear Layer",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a linear layer y = W x with weight matrix w (m x n), input x, and upstream gradient grad_out = dL/dy, the backward pass is dL/dW = grad_out x^T and dL/dx = W^T grad_out.\n\nGiven grad_out, w, and x, return [dW, dx] as a list containing a nested list and a flat list.",
    starterCode: `def linear_layer_backward(grad_out, w, x):
    # Return [dW, dx]
    # Your code here
    pass`,
    solution: `def linear_layer_backward(grad_out, w, x):
    m = len(grad_out)
    n = len(x)
    dW = [[grad_out[i] * x[j] for j in range(n)] for i in range(m)]
    dx = [sum(grad_out[i] * w[i][j] for i in range(m)) for j in range(n)]
    return [dW, dx]`,
    testCases: [
      { input: [[1, 2], [[1, 0], [0, 1]], [3, 4]], expected: [[[3.0, 4.0], [6.0, 8.0]], [1.0, 2.0]] },
      { input: [[1], [[2, 3]], [1, 1]], expected: [[[1.0, 1.0]], [2.0, 3.0]] },
      {
        input: [[1, -2], [[0.5, 1, -1], [2, -1, 0]], [2, 1, -1]],
        expected: [[[2.0, 1.0, -1.0], [-4.0, -2.0, 2.0]], [-3.5, 3.0, -1.0]],
      },
    ],
    hint: "The weight gradient is the outer product of the upstream gradient and the input.",
  },
  {
    id: "ca-241",
    title: "ReLU Backward Subgradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The ReLU activation is max(0, x) and its subgradient is 1 for x > 0 and 0 for x <= 0.\n\nGiven the upstream gradient vector grad and the pre-activation vector x, return the elementwise product of grad with this subgradient, choosing 0 at x == 0.",
    starterCode: `def relu_backward(grad, x):
    # Your code here
    pass`,
    solution: `def relu_backward(grad, x):
    return [grad[i] if x[i] > 0 else 0.0 for i in range(len(x))]`,
    testCases: [
      { input: [[1, -2, 3], [2, -1, 0]], expected: [1.0, 0.0, 0.0] },
      { input: [[2, 2, 2], [0, 0, 0]], expected: [0.0, 0.0, 0.0] },
      { input: [[-1, 5], [-3, 2]], expected: [0.0, 5.0] },
      { input: [[1], [0.5]], expected: [1.0] },
    ],
    hint: "The ReLU mask zeroes the gradient wherever the input is not strictly positive.",
  },
  {
    id: "ca-242",
    title: "Sigmoid Derivative Backprop",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The logistic sigmoid s(x) = 1 / (1 + exp(-x)) has derivative s(x) * (1 - s(x)).\n\nGiven an upstream gradient grad and a scalar pre-activation x, return grad * s(x) * (1 - s(x)).",
    starterCode: `def sigmoid_backward(grad, x):
    # Your code here
    pass`,
    solution: `def sigmoid_backward(grad, x):
    import math
    s = 1.0 / (1.0 + math.exp(-x))
    return grad * s * (1.0 - s)`,
    testCases: [
      { input: [1, 0], expected: 0.25 },
      { input: [2, 1], expected: 0.3932238664829637 },
      { input: [-1, -2], expected: -0.1049935854035065 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "The sigmoid derivative peaks at x = 0 with value 0.25.",
  },
  {
    id: "ca-243",
    title: "Tanh Derivative Backprop",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The hyperbolic tangent has derivative 1 - tanh(x)^2.\n\nGiven an upstream gradient grad and a scalar pre-activation x, return grad * (1 - tanh(x)^2).",
    starterCode: `def tanh_backward(grad, x):
    # Your code here
    pass`,
    solution: `def tanh_backward(grad, x):
    import math
    t = math.tanh(x)
    return grad * (1.0 - t * t)`,
    testCases: [
      { input: [1, 0], expected: 1.0 },
      { input: [2, 1], expected: 0.8399486832280523 },
      { input: [-1, 0.5], expected: -0.7864477329659274 },
      { input: [0, 2], expected: 0.0 },
    ],
    hint: "The tanh derivative is largest at the origin and decays toward zero at saturation.",
  },
  {
    id: "ca-244",
    title: "Second Derivative of Cross-Entropy",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the binary cross-entropy as a function of the predicted probability p, L(p) = -y log(p) - (1 - y) log(1 - p) with y in {0, 1}, the second derivative is y / p^2 + (1 - y) / (1 - p)^2.\n\nGiven y and p with 0 < p < 1, return L''(p).",
    starterCode: `def second_derivative_cross_entropy(y, p):
    # Your code here
    pass`,
    solution: `def second_derivative_cross_entropy(y, p):
    return y / (p * p) + (1 - y) / ((1 - p) * (1 - p))`,
    testCases: [
      { input: [1, 0.5], expected: 4.0 },
      { input: [0, 0.5], expected: 4.0 },
      { input: [1, 0.25], expected: 16.0 },
      { input: [0, 0.8], expected: 25.0 },
    ],
    hint: "The curvature is positive everywhere, so cross-entropy is convex in p.",
  },
  {
    id: "ca-245",
    title: "Diagonal Gaussian KL Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For diagonal Gaussians q = N(mu1, diag(v1)) and p = N(mu2, diag(v2)), the KL divergence has gradient with respect to mu1 equal to (mu1 - mu2) / v2, elementwise.\n\nGiven mu1, mu2, and the variances v2 of p as lists, return that gradient as a list.",
    starterCode: `def diagonal_gaussian_kl_grad(mu1, mu2, v2):
    # Your code here
    pass`,
    solution: `def diagonal_gaussian_kl_grad(mu1, mu2, v2):
    return [(mu1[i] - mu2[i]) / v2[i] for i in range(len(mu1))]`,
    testCases: [
      { input: [[0, 0], [0, 0], [1, 1]], expected: [0.0, 0.0] },
      { input: [[1, 2], [0, 0], [1, 1]], expected: [1.0, 2.0] },
      { input: [[0, 0], [1, 1], [2, 4]], expected: [-0.5, -0.25] },
      { input: [[3, 0], [1, 0], [0.5, 2]], expected: [4.0, 0.0] },
    ],
    hint: "The mean gradient of the Gaussian KL is the precision-weighted mean difference.",
  },
  {
    id: "ca-246",
    title: "Natural Gradient Direction",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The natural gradient precondition a Euclidean gradient by the Fisher information: d = F^{-1} g.\n\nGiven the gradient components g1, g2 and the symmetric Fisher matrix [[f11, f12], [f12, f22]], return the natural gradient as [d1, d2]. Return None when the Fisher matrix is singular.",
    starterCode: `def natural_gradient(g1, g2, f11, f12, f22):
    # Return [d1, d2]
    # Your code here
    pass`,
    solution: `def natural_gradient(g1, g2, f11, f12, f22):
    det = f11 * f22 - f12 * f12
    if det == 0:
        return None
    return [(f22 * g1 - f12 * g2) / det, (-f12 * g1 + f11 * g2) / det]`,
    testCases: [
      { input: [1, 1, 1, 0, 1], expected: [1.0, 1.0] },
      { input: [2, 4, 2, 0, 1], expected: [1.0, 4.0] },
      {
        input: [1, 0, 2, 1, 2],
        expected: [0.6666666666666666, -0.3333333333333333],
      },
      { input: [0, 0, 1, 0, 1], expected: [0.0, 0.0] },
    ],
    hint: "The natural gradient is the inverse Fisher matrix applied to the ordinary gradient.",
  },
  {
    id: "ca-247",
    title: "Fisher Information for Bernoulli",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a Bernoulli random variable with success probability p, the Fisher information is I(p) = 1 / (p * (1 - p)).\n\nGiven p with 0 < p < 1, return I(p). The information is symmetric about p = 0.5 and diverges at the boundaries.",
    starterCode: `def fisher_bernoulli(p):
    # Your code here
    pass`,
    solution: `def fisher_bernoulli(p):
    return 1.0 / (p * (1.0 - p))`,
    testCases: [
      { input: [0.5], expected: 4.0 },
      { input: [0.25], expected: 5.333333333333333 },
      { input: [0.1], expected: 11.111111111111109 },
      { input: [0.9], expected: 11.111111111111112 },
    ],
    hint: "The Fisher information is the expected squared score, which is largest near fair coins.",
  },
  {
    id: "ca-248",
    title: "Gaussian Mean Fisher Information Matrix",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For a multivariate Gaussian N(mu, Sigma), the Fisher information about the mean is the inverse covariance Sigma^{-1}.\n\nGiven the entries s11, s12, s22 of the symmetric 2x2 covariance, return the 2x2 Fisher matrix as a nested list. Return None when the determinant is not strictly positive.",
    starterCode: `def fisher_gaussian_mean(s11, s12, s22):
    # Return the 2x2 Fisher matrix
    # Your code here
    pass`,
    solution: `def fisher_gaussian_mean(s11, s12, s22):
    det = s11 * s22 - s12 * s12
    if det <= 0:
        return None
    return [[s22 / det, -s12 / det], [-s12 / det, s11 / det]]`,
    testCases: [
      { input: [1, 0, 1], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [2, 0, 4], expected: [[0.5, 0.0], [0.0, 0.25]] },
      {
        input: [4, 1, 2],
        expected: [[0.2857142857142857, -0.14285714285714285], [-0.14285714285714285, 0.5714285714285714]],
      },
      { input: [1, 1, 1], expected: null },
    ],
    hint: "The covariance inverse is the precision matrix, and it scales the mean information.",
  },
  {
    id: "ca-249",
    title: "Cramer-Rao Lower Bound",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For n independent samples from N(mu, sigma^2) with known variance, the Cramer-Rao lower bound on the variance of any unbiased estimator of mu is sigma^2 / n.\n\nGiven sigma and n, return that bound.",
    starterCode: `def cramer_rao_bound(sigma, n):
    # Your code here
    pass`,
    solution: `def cramer_rao_bound(sigma, n):
    return sigma * sigma / n`,
    testCases: [
      { input: [1, 1], expected: 1.0 },
      { input: [2, 4], expected: 1.0 },
      { input: [0.5, 10], expected: 0.025 },
      { input: [3, 2], expected: 4.5 },
    ],
    hint: "More samples or a smaller variance lower the bound quadratically.",
  },
  {
    id: "ca-250",
    title: "Taylor Truncation Error Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x) = e^x, the actual truncation error of the degree-n Taylor polynomial about 0 is E = e^x - sum from k = 0 to n of x^k / k!.\n\nGiven x and n, accumulate the polynomial terms and return the difference. The result is negative for negative x once the leading omitted term dominates.",
    starterCode: `def taylor_truncation_error(x, n):
    # Your code here
    pass`,
    solution: `def taylor_truncation_error(x, n):
    import math
    t = 0.0
    term = 1.0
    for k in range(n + 1):
        t += term
        term *= x / (k + 1)
    return math.exp(x) - t`,
    testCases: [
      { input: [1, 5], expected: 0.0016151617923787498 },
      { input: [0, 10], expected: 0.0 },
      { input: [2, 3], expected: 1.0557227655973174 },
      { input: [-1, 4], expected: -0.0071205588285577215 },
    ],
    hint: "Build the partial sum term by term to avoid recomputing factorials.",
  },
  {
    id: "ca-251",
    title: "Second-Order Taylor Approximation",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The second-order Taylor approximation of f about the point a is T(x) = f(a) + f'(a) * (x - a) + 0.5 * f''(a) * (x - a)^2.\n\nGiven a polynomial by its coefficient list (index i holds the coefficient of x^i), the expansion point a, and the evaluation point x, return T(x).",
    starterCode: `def second_order_taylor(coeffs, a, x):
    # Your code here
    pass`,
    solution: `def second_order_taylor(coeffs, a, x):
    f = sum(c * a ** i for i, c in enumerate(coeffs))
    fp = sum(i * c * a ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    fpp = sum(i * (i - 1) * c * a ** (i - 2) for i, c in enumerate(coeffs) if i > 1)
    return f + fp * (x - a) + 0.5 * fpp * (x - a) ** 2`,
    testCases: [
      { input: [[0, 0, 1], 1, 2], expected: 4.0 },
      { input: [[1, 1, 1], 0, 1], expected: 3.0 },
      { input: [[0, 0, 0, 1], 1, 1.1], expected: 1.3300000000000003 },
      { input: [[2], 0, 5], expected: 2.0 },
    ],
    hint: "For a quadratic polynomial the second-order approximation is exact.",
  },
  {
    id: "ca-252",
    title: "Newton Step for the Square Root",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "One Newton step for computing the square root of a solves z^2 - a = 0 and gives z_new = z - (z^2 - a) / (2z).\n\nGiven a > 0 and a nonzero current estimate x, return the updated estimate.",
    starterCode: `def newton_sqrt_step(a, x):
    # Your code here
    pass`,
    solution: `def newton_sqrt_step(a, x):
    return x - (x * x - a) / (2.0 * x)`,
    testCases: [
      { input: [2, 1], expected: 1.5 },
      { input: [4, 2], expected: 2.0 },
      { input: [9, 2], expected: 3.25 },
      { input: [1, 1], expected: 1.0 },
    ],
    hint: "The update averages the estimate with a / x, which converges quadratically.",
  },
  {
    id: "ca-253",
    title: "Directional Derivative in 3D",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The directional derivative of a differentiable function f at a point in the direction v is the gradient dotted with the unit vector v / ||v||.\n\nGiven the gradient components as the list g and the direction as the list v with ||v|| > 0, return that scalar.",
    starterCode: `def directional_derivative_3d(g, v):
    # Your code here
    pass`,
    solution: `def directional_derivative_3d(g, v):
    nrm = (v[0] ** 2 + v[1] ** 2 + v[2] ** 2) ** 0.5
    return (g[0] * v[0] + g[1] * v[1] + g[2] * v[2]) / nrm`,
    testCases: [
      { input: [[1, 2, 3], [1, 0, 0]], expected: 1.0 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 1.7320508075688774 },
      { input: [[2, 0, -1], [0, 0, 5]], expected: -1.0 },
      { input: [[1, 2, 2], [2, -1, 2]], expected: 1.3333333333333333 },
    ],
    hint: "The direction must be normalized before taking the dot product with the gradient.",
  },
  {
    id: "ca-254",
    title: "Divergence in Three Dimensions",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the vector field F(x, y, z) = [a*x^2*y, b*y^2*z, c*z^2*x], the divergence is 2*a*x*y + 2*b*y*z + 2*c*z*x.\n\nGiven the coefficients a, b, c and the point (x, y, z), return the divergence value.",
    starterCode: `def divergence_3d(a, b, c, x, y, z):
    # Your code here
    pass`,
    solution: `def divergence_3d(a, b, c, x, y, z):
    return 2.0 * a * x * y + 2.0 * b * y * z + 2.0 * c * z * x`,
    testCases: [
      { input: [1, 1, 1, 1, 1, 1], expected: 6.0 },
      { input: [1, 0, 0, 2, 3, 4], expected: 12.0 },
      { input: [2, 3, 4, 0, 0, 0], expected: 0.0 },
      { input: [1, 1, 0, 1, 2, 3], expected: 16.0 },
    ],
    hint: "Differentiate each component with respect to its own coordinate, then sum.",
  },
  {
    id: "ca-255",
    title: "Curl of a Trigonometric Field",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the planar field F(x, y) = [sin(a*x + b*y), cos(c*x - d*y)], the scalar curl is dQ/dx - dP/dy = -c*sin(c*x - d*y) - b*cos(a*x + b*y).\n\nGiven a, b, c, d and the point (x, y), return the curl value. Angles are in radians.",
    starterCode: `def curl_trig_2d(a, b, c, d, x, y):
    # Your code here
    pass`,
    solution: `def curl_trig_2d(a, b, c, d, x, y):
    import math
    return -c * math.sin(c * x - d * y) - b * math.cos(a * x + b * y)`,
    testCases: [
      { input: [1, 0, 1, 0, 0, 0], expected: 0.0 },
      { input: [1, 0, 1, 0, 1.5707963267948966, 0], expected: -1.0 },
      { input: [0, 1, 1, 0, 0, 0], expected: -1.0 },
      { input: [1, 1, 2, 1, 0.5, -0.5], expected: -2.994989973208109 },
    ],
    hint: "Only the cross partial derivatives contribute; each differentiates the inner linear form.",
  },
  {
    id: "ca-256",
    title: "Laplacian of a Gaussian (LoG)",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Laplacian of the 2D Gaussian G(x, y) = exp(-(x^2 + y^2) / (2*sigma^2)) is the Laplacian-of-Gaussian filter.\n\nIts value is ((x^2 + y^2) / sigma^4 - 2 / sigma^2) * G(x, y). Given x, y, and sigma > 0, return that value.",
    starterCode: `def laplacian_of_gaussian(x, y, sigma):
    # Your code here
    pass`,
    solution: `def laplacian_of_gaussian(x, y, sigma):
    import math
    r2 = x * x + y * y
    return (r2 / (sigma ** 4) - 2.0 / (sigma * sigma)) * math.exp(-r2 / (2.0 * sigma * sigma))`,
    testCases: [
      { input: [0, 0, 1], expected: -2.0 },
      { input: [1, 0, 1], expected: -0.6065306597126334 },
      { input: [0, 0, 2], expected: -0.5 },
      { input: [2, 0, 1], expected: 0.2706705664732254 },
    ],
    hint: "The LoG is rotationally symmetric and changes sign where x^2 + y^2 = 2*sigma^2.",
  },
  {
    id: "ca-257",
    title: "Inverse Polar Jacobian Determinant",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The inverse polar map (x, y) -> (r, theta) has Jacobian determinant 1 / sqrt(x^2 + y^2).\n\nGiven x and y not both zero, return that determinant. Return None at the origin, where the map is singular.",
    starterCode: `def inverse_polar_jacobian(x, y):
    # Return None at the origin
    # Your code here
    pass`,
    solution: `def inverse_polar_jacobian(x, y):
    r = (x * x + y * y) ** 0.5
    if r == 0:
        return None
    return 1.0 / r`,
    testCases: [
      { input: [3, 4], expected: 0.2 },
      { input: [1, 0], expected: 1.0 },
      { input: [0, 2], expected: 0.5 },
      { input: [0, 0], expected: null },
    ],
    hint: "This determinant is the reciprocal of the forward polar Jacobian determinant r.",
  },
  {
    id: "ca-258",
    title: "Density Under Linear Change of Variables",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "If X is normal with mean mu and standard deviation sigma, and Y = a*X + b with a != 0, then p_Y(y) = (1 / |a|) * phi((y - b) / a), where phi is the standard normal density.\n\nGiven y, mu, sigma > 0, a != 0, and b, return p_Y(y).",
    starterCode: `def density_linear_transform(y, mu, sigma, a, b):
    # Your code here
    pass`,
    solution: `def density_linear_transform(y, mu, sigma, a, b):
    import math
    z = (y - b) / a
    return math.exp(-0.5 * ((z - mu) / sigma) ** 2) / (abs(a) * sigma * math.sqrt(2.0 * math.pi))`,
    testCases: [
      { input: [0, 0, 1, 1, 0], expected: 0.3989422804014327 },
      { input: [0, 0, 1, 2, 0], expected: 0.19947114020071635 },
      { input: [1, 0, 1, 2, 1], expected: 0.19947114020071635 },
      { input: [0, 0, 1, -1, 0], expected: 0.3989422804014327 },
    ],
    hint: "The absolute scale factor keeps the transformed density integrated to one for shrinking maps.",
  },
  {
    id: "ca-259",
    title: "Scalar Line Integral on a Segment",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The scalar line integral of f(x, y) = alpha*x + beta*y + gamma along the straight segment from P to Q integrates f with respect to arc length.\n\nBecause f is linear along the segment, the integral equals length(P, Q) * (f(P) + f(Q)) / 2. Given the coefficients and the endpoints as [x, y] pairs, return the integral.",
    starterCode: `def scalar_line_integral(alpha, beta, gamma, p, q):
    # Your code here
    pass`,
    solution: `def scalar_line_integral(alpha, beta, gamma, p, q):
    fp = alpha * p[0] + beta * p[1] + gamma
    fq = alpha * q[0] + beta * q[1] + gamma
    length = ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2) ** 0.5
    return length * (fp + fq) / 2.0`,
    testCases: [
      { input: [1, 0, 0, [0, 0], [3, 4]], expected: 7.5 },
      { input: [0, 0, 1, [0, 0], [3, 4]], expected: 5.0 },
      { input: [1, 1, 0, [0, 0], [1, 1]], expected: 1.4142135623730951 },
      { input: [2, -1, 3, [1, 1], [1, 1]], expected: 0.0 },
    ],
    hint: "The trapezoid rule is exact when the integrand is linear in the parameter.",
  },
  {
    id: "ca-260",
    title: "Surface Area of a Spherical Cap",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The surface area element of a sphere of radius R is R^2 * sin(phi) dphi dtheta, with phi the polar angle.\n\nIntegrating from the pole to phi_max gives the area of a spherical cap: 2 * pi * R^2 * (1 - cos(phi_max)). Given the radius and phi_max in radians, return the cap area.",
    starterCode: `def spherical_cap_area(radius, phi_max):
    # Your code here
    pass`,
    solution: `def spherical_cap_area(radius, phi_max):
    import math
    return 2.0 * math.pi * radius * radius * (1.0 - math.cos(phi_max))`,
    testCases: [
      { input: [1, 1.5707963267948966], expected: 6.283185307179585 },
      { input: [1, 0], expected: 0.0 },
      { input: [2, 3.141592653589793], expected: 50.26548245743669 },
      { input: [1, 1.0471975511965976], expected: 3.1415926535897922 },
    ],
    hint: "A hemisphere is half the sphere area, matching the formula at phi_max = pi / 2.",
  },
  {
    id: "ca-261",
    title: "Euler-Lagrange Acceleration",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For the Lagrangian density F(y, y', x) = a*y'^2 + b*y^2 + c*y*x, the Euler-Lagrange equation requires the x-derivative of 2*a*y' to equal 2*b*y + c*x.\n\nSolving for the acceleration gives y'' = (2*b*y + c*x) / (2*a). Given a != 0, b, c, the current value y, and the coordinate x, return y''.",
    starterCode: `def euler_lagrange_acceleration(a, b, c, y, x):
    # Your code here
    pass`,
    solution: `def euler_lagrange_acceleration(a, b, c, y, x):
    return (2.0 * b * y + c * x) / (2.0 * a)`,
    testCases: [
      { input: [1, 0, 0, 5, 3], expected: 0.0 },
      { input: [1, 1, 0, 2, 0], expected: 2.0 },
      { input: [2, 1, 3, 1, 2], expected: 2.0 },
      { input: [1, 0, 4, 0, 1], expected: 2.0 },
    ],
    hint: "The Euler-Lagrange equation balances d/dx of the momentum against the force term.",
  },
  {
    id: "ca-262",
    title: "Geodesic Distance on a Sphere",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The geodesic or great-circle distance between two points on a sphere of radius R with unit position vectors u and v is R * arccos(u dot v).\n\nGiven the two unit vectors as lists and the radius, return the distance. Clamp the dot product to the interval [-1, 1] to guard against rounding.",
    starterCode: `def geodesic_sphere_distance(u, v, radius):
    # Your code here
    pass`,
    solution: `def geodesic_sphere_distance(u, v, radius):
    import math
    dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
    if dot > 1.0:
        dot = 1.0
    if dot < -1.0:
        dot = -1.0
    return radius * math.acos(dot)`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0], 1], expected: 1.5707963267948966 },
      { input: [[1, 0, 0], [1, 0, 0], 5], expected: 0.0 },
      { input: [[1, 0, 0], [-1, 0, 0], 2], expected: 6.283185307179586 },
      { input: [[0.6, 0.8, 0], [1, 0, 0], 2], expected: 1.8545904360032246 },
    ],
    hint: "The central angle is the arccosine of the dot product of unit vectors.",
  },
  {
    id: "ca-263",
    title: "Arc Length Parametrization Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "A curve is parametrized by arc length when its speed ||dr/dt|| equals 1 everywhere.\n\nSamples of the curve are given as 2D points with matching parameter values; estimate the speed on each segment by the secant length divided by the parameter gap. Given the points and parameters, return True when every speed is within tol (default 1e-6) of 1, and True vacuously for fewer than two points.",
    starterCode: `def is_unit_speed(points, params, tol=1e-6):
    # Your code here
    pass`,
    solution: `def is_unit_speed(points, params, tol=1e-6):
    for i in range(len(points) - 1):
        dx = points[i + 1][0] - points[i][0]
        dy = points[i + 1][1] - points[i][1]
        dt = params[i + 1] - params[i]
        speed = (dx * dx + dy * dy) ** 0.5 / dt
        if abs(speed - 1.0) > tol:
            return False
    return True`,
    testCases: [
      { input: [[[0, 0], [1, 0], [2, 0]], [0, 1, 2]], expected: true },
      { input: [[[0, 0], [2, 0], [4, 0]], [0, 1, 2]], expected: false },
      { input: [[[0, 0], [0, 1]], [0, 2]], expected: false },
      { input: [[[0, 0], [0, 0]], [0, 1]], expected: false },
      { input: [[[5, 5]], [0]], expected: true },
    ],
    hint: "Arc length parametrization travels one unit of distance per unit of parameter.",
  },
  {
    id: "ca-264",
    title: "Curvature of a Parabola",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the parabola y = a*x^2 + b*x, the curvature at the point x is |2*a| / (1 + (2*a*x + b)^2)^(3/2).\n\nGiven a, b, and x, return the curvature. A straight line with a = 0 has zero curvature everywhere.",
    starterCode: `def parabola_curvature(a, b, x):
    # Your code here
    pass`,
    solution: `def parabola_curvature(a, b, x):
    slope = 2.0 * a * x + b
    return abs(2.0 * a) / (1.0 + slope * slope) ** 1.5`,
    testCases: [
      { input: [1, 0, 0], expected: 2.0 },
      { input: [1, 0, 1], expected: 0.17888543819998318 },
      { input: [0, 5, 3], expected: 0.0 },
      { input: [2, 1, 0], expected: 1.414213562373095 },
    ],
    hint: "Curvature decreases as the slope grows because the denominator is the speed cubed.",
  },
  {
    id: "ca-265",
    title: "Gradient Flow on a Double-Well Potential",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Gradient flow on the double-well potential V(x) = (x^2 - 1)^2 follows x_new = x - lr * V'(x) with V'(x) = 4*x*(x^2 - 1).\n\nGiven the current point x and the learning rate lr, take one step and return [x_new, V(x_new)]. The potential has minima at x = -1 and x = 1.",
    starterCode: `def double_well_flow_step(x, lr):
    # Return [x_new, V(x_new)]
    # Your code here
    pass`,
    solution: `def double_well_flow_step(x, lr):
    grad = 4.0 * x * (x * x - 1.0)
    xn = x - lr * grad
    return [xn, (xn * xn - 1.0) ** 2]`,
    testCases: [
      { input: [2, 0.1], expected: [-0.4, 0.7056] },
      { input: [0, 0.5], expected: [0.0, 1.0] },
      { input: [1, 0.1], expected: [1.0, 0.0] },
      { input: [0.5, 0.2], expected: [0.8, 0.1296] },
    ],
    hint: "At the origin the gradient is zero, so the flow stays on the barrier top.",
  },
  {
    id: "ca-266",
    title: "Backward Euler Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The backward (implicit) Euler method applied to y' = lam*y gives y_next = y / (1 - h*lam).\n\nGiven the current value y, the step size h, and the rate lam with h*lam != 1, return y_next. Unlike forward Euler, the method is stable for any step size when lam < 0.",
    starterCode: `def backward_euler_step(y, h, lam):
    # Your code here
    pass`,
    solution: `def backward_euler_step(y, h, lam):
    return y / (1.0 - h * lam)`,
    testCases: [
      { input: [1, 0.1, -2], expected: 0.8333333333333334 },
      { input: [1, 0.1, 0], expected: 1.0 },
      { input: [2, 0.5, 1], expected: 4.0 },
      { input: [1, 0.1, 2], expected: 1.25 },
    ],
    hint: "The implicit update solves y_next = y + h*lam*y_next for y_next.",
  },
  {
    id: "ca-267",
    title: "RK4 One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one classical fourth-order Runge-Kutta step for the ODE y' = t + y starting at (t, y) with step size h.\n\nThe stage slopes are k1 = f(t, y), k2 = f(t + h/2, y + h*k1/2), k3 = f(t + h/2, y + h*k2/2), and k4 = f(t + h, y + h*k3). Return y + h*(k1 + 2*k2 + 2*k3 + k4)/6.",
    starterCode: `def rk4_step(t, y, h):
    # Your code here
    pass`,
    solution: `def rk4_step(t, y, h):
    k1 = t + y
    k2 = (t + h / 2.0) + (y + h * k1 / 2.0)
    k3 = (t + h / 2.0) + (y + h * k2 / 2.0)
    k4 = (t + h) + (y + h * k3)
    return y + h * (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0`,
    testCases: [
      { input: [0, 1, 0.1], expected: 1.1103416666666668 },
      { input: [0, 1, 0.5], expected: 1.796875 },
      { input: [1, 0, 0.2], expected: 0.24280000000000004 },
      { input: [0, 0, 0], expected: 0.0 },
    ],
    hint: "The weighted average of the four slopes has fourth-order accuracy.",
  },
  {
    id: "ca-268",
    title: "Euler Stability Condition",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Forward Euler applied to y' = lam*y multiplies the value by the amplification factor 1 + h*lam at every step.\n\nThe method is stable when |1 + h*lam| <= 1. Given lam and the step size h, return [factor, stable] where stable is a boolean.",
    starterCode: `def euler_stability(lam, h):
    # Return [factor, stable]
    # Your code here
    pass`,
    solution: `def euler_stability(lam, h):
    factor = 1.0 + h * lam
    return [factor, abs(factor) <= 1.0 + 1e-12]`,
    testCases: [
      { input: [-10, 0.1], expected: [0.0, true] },
      { input: [-10, 0.25], expected: [-1.5, false] },
      { input: [0, 5], expected: [1.0, true] },
      { input: [-2, 1], expected: [-1.0, true] },
    ],
    hint: "For negative lam the stability limit is h <= 2 / |lam|.",
  },
  {
    id: "ca-269",
    title: "Gradient Lipschitz Constant",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For the quadratic f(x, y) = 0.5*(a*x^2 + 2*b*x*y + c*y^2), the gradient is Lipschitz with constant equal to the largest eigenvalue of the Hessian [[a, b], [b, c]].\n\nThat eigenvalue is (a + c)/2 + sqrt(((a - c)/2)^2 + b^2). Given a, b, c, return the constant.",
    starterCode: `def gradient_lipschitz(a, b, c):
    # Your code here
    pass`,
    solution: `def gradient_lipschitz(a, b, c):
    return (a + c) / 2.0 + (((a - c) / 2.0) ** 2 + b * b) ** 0.5`,
    testCases: [
      { input: [4, 0, 1], expected: 4.0 },
      { input: [2, 1, 2], expected: 3.0 },
      { input: [1, 0, 1], expected: 1.0 },
      { input: [5, 0, 3], expected: 5.0 },
    ],
    hint: "The gradient of a quadratic is a linear map, so its Lipschitz constant is the spectral norm.",
  },
  {
    id: "ca-270",
    title: "Descent Lemma Smoothness Bound",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The descent lemma for an L-smooth function states f(y) <= f(x) + grad f(x) dot (y - x) + (L/2) * ||y - x||^2.\n\nGiven f_x = f(x), the gradient vector g at x, the points x and y, and the smoothness constant L, return the bound value.",
    starterCode: `def descent_lemma_bound(f_x, g, x, y, L):
    # Your code here
    pass`,
    solution: `def descent_lemma_bound(f_x, g, x, y, L):
    d = [y[i] - x[i] for i in range(len(x))]
    dot = sum(g[i] * d[i] for i in range(len(g)))
    sq = sum(v * v for v in d)
    return f_x + dot + 0.5 * L * sq`,
    testCases: [
      { input: [1, [0, 0], [0, 0], [1, 1], 2], expected: 3.0 },
      { input: [2, [1, 1], [0, 0], [1, 0], 1], expected: 3.5 },
      { input: [0, [1, -1], [1, 1], [1, 1], 4], expected: 0.0 },
      { input: [3, [0, 0], [2, 2], [2, 2], 5], expected: 3.0 },
    ],
    hint: "The quadratic term rewards smaller steps; the linear term uses the local gradient.",
  },
  {
    id: "ca-271",
    title: "PSD Check with Smallest Eigenvalue",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "A symmetric 2x2 matrix H = [[a, b], [b, c]] is positive semidefinite exactly when its smallest eigenvalue is nonnegative.\n\nThat eigenvalue is (a + c)/2 - sqrt(((a - c)/2)^2 + b^2). Given a, b, c, return [is_psd, lambda_min], which also certifies convexity of a quadratic with this Hessian.",
    starterCode: `def psd_check_2x2(a, b, c):
    # Return [is_psd, lambda_min]
    # Your code here
    pass`,
    solution: `def psd_check_2x2(a, b, c):
    lam_min = (a + c) / 2.0 - (((a - c) / 2.0) ** 2 + b * b) ** 0.5
    return [lam_min >= 0.0, lam_min]`,
    testCases: [
      { input: [2, 0, 2], expected: [true, 2.0] },
      { input: [2, 3, 2], expected: [false, -1.0] },
      { input: [0, 0, 0], expected: [true, 0.0] },
      { input: [1, 1, 1], expected: [true, 0.0] },
      { input: [-1, 0, 1], expected: [false, -1.0] },
    ],
    hint: "The eigenvalues of a symmetric 2x2 matrix have a closed form via the discriminant.",
  },
  {
    id: "ca-272",
    title: "Jensen Gap for the Square",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the convex function f(x) = x^2, Jensen's inequality gives E[f(X)] >= f(E[X]), and the gap equals the population variance.\n\nGiven a list of samples, return mean(x^2) - mean(x)^2.",
    starterCode: `def jensen_gap_square(samples):
    # Your code here
    pass`,
    solution: `def jensen_gap_square(samples):
    m = sum(samples) / len(samples)
    return sum(v * v for v in samples) / len(samples) - m * m`,
    testCases: [
      { input: [[0, 0]], expected: 0.0 },
      { input: [[0, 2]], expected: 1.0 },
      { input: [[1, 3]], expected: 1.0 },
      { input: [[-1, 1]], expected: 1.0 },
      { input: [[2, 2, 2]], expected: 0.0 },
    ],
    hint: "The Jensen gap for the square is the variance of the samples.",
  },
  {
    id: "ca-273",
    title: "Lagrange Multipliers with Two Constraints",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Minimize f(x, y, z) = x^2 + y^2 + z^2 subject to x + y + z = s1 and x - y = s2 using two Lagrange multipliers.\n\nThe optimum is at x = s1/3 + s2/2, y = s1/3 - s2/2, z = s1/3, and the minimum value is s1^2/3 + s2^2/2. Given s1 and s2, return the minimum value.",
    starterCode: `def lagrange_two_constraints(s1, s2):
    # Your code here
    pass`,
    solution: `def lagrange_two_constraints(s1, s2):
    return s1 * s1 / 3.0 + s2 * s2 / 2.0`,
    testCases: [
      { input: [3, 0], expected: 3.0 },
      { input: [0, 2], expected: 2.0 },
      { input: [3, 2], expected: 5.0 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "With two constraints the gradient is a combination of the two constraint normals.",
  },
  {
    id: "ca-274",
    title: "Complementary Slackness Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Complementary slackness for a KKT point requires lambda_i * g_i(x) = 0 for every inequality constraint, together with nonnegative multipliers.\n\nGiven the constraint values gaps = g_i(x) and the multipliers, return True when every multiplier is nonnegative and every product is within tol (default 1e-9) of zero.",
    starterCode: `def complementary_slackness(gaps, multipliers, tol=1e-9):
    # Your code here
    pass`,
    solution: `def complementary_slackness(gaps, multipliers, tol=1e-9):
    for i in range(len(gaps)):
        if multipliers[i] < -tol:
            return False
        if abs(multipliers[i] * gaps[i]) > tol:
            return False
    return True`,
    testCases: [
      { input: [[0, 1.5], [2, 0]], expected: true },
      { input: [[1, 1], [1, 1]], expected: false },
      { input: [[0, 0], [0, 0]], expected: true },
      { input: [[1, 0], [-1, 0]], expected: false },
    ],
    hint: "An inactive constraint must carry a zero multiplier, and an active one may carry a positive multiplier.",
  },
  {
    id: "ca-275",
    title: "Softmax Cross-Entropy Hessian",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For softmax probabilities p = softmax(logits) and the cross-entropy loss L = -log(p_y), the Hessian with respect to the logits is diag(p) - p p^T.\n\nGiven the logits, return this n x n Hessian as a nested list. Subtract the maximum logit before exponentiating for numerical stability.",
    starterCode: `def softmax_ce_hessian(logits):
    # Your code here
    pass`,
    solution: `def softmax_ce_hessian(logits):
    import math
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    s = sum(e)
    p = [v / s for v in e]
    return [[(p[i] if i == j else 0.0) - p[i] * p[j] for j in range(len(p))] for i in range(len(p))]`,
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
          [0.2222222222222222, -0.1111111111111111, -0.1111111111111111],
          [-0.1111111111111111, 0.2222222222222222, -0.1111111111111111],
          [-0.1111111111111111, -0.1111111111111111, 0.2222222222222222],
        ],
      },
      {
        input: [[2, -1]],
        expected: [
          [0.045176659730912005, -0.045176659730912144],
          [-0.045176659730912144, 0.04517665973091214],
        ],
      },
    ],
    hint: "The Hessian is the covariance of the one-hot label under the softmax distribution.",
  },
];
