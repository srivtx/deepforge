import type { Problem, LearningPath, CategoryMeta, Category } from "@/types/problem";

export const CATEGORIES: CategoryMeta[] = [
  { name: "Linear Algebra", blurb: "Vectors, matrices, decompositions. The bedrock of every ML primitive.", icon: "matrix" },
  { name: "Calculus", blurb: "Derivatives, gradients, Jacobians, Hessians. How things change.", icon: "gradient" },
  { name: "Statistics", blurb: "Mean, variance, covariance, distributions. What the data tells you.", icon: "histogram" },
  { name: "Probability", blurb: "Bayes, expectation, counting. The language of uncertainty.", icon: "dice" },
  { name: "ML Fundamentals", blurb: "Regressions, trees, clustering, metrics. The classic toolkit, from scratch.", icon: "tree" },
  { name: "Deep Learning", blurb: "Activations, forward pass, backprop. The core of every neural net.", icon: "neuron" },
  { name: "NLP", blurb: "Tokenize, embed, compare. Text into numbers.", icon: "text" },
  { name: "Optimization", blurb: "GD, momentum, Adam, schedules. How models actually learn.", icon: "descent" },
];

export const PROBLEMS: Problem[] = [
  // ── Linear Algebra ──────────────────────────────────────────────────────
  {
    id: "la-001",
    title: "Matrix Multiplication",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Multiply two matrices A (m×n) and B (n×p) to produce C (m×p).\n\nC[i][j] = sum(A[i][k] * B[k][j] for k in range(n)).\n\nYou may assume the inner dimensions match (A's column count equals B's row count).",
    starterCode: `def matrix_multiply(A, B):
    # Your code here
    pass`,
    solution: `def matrix_multiply(A, B):
    m, n = len(A), len(A[0])
    n2, p = len(B), len(B[0])
    assert n == n2, "inner dimensions must match"
    C = [[0] * p for _ in range(m)]
    for i in range(m):
        for j in range(p):
            s = 0
            for k in range(n):
                s += A[i][k] * B[k][j]
            C[i][j] = s
    return C`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [[19, 22], [43, 50]] },
      { input: [[[1, 0], [0, 1]], [[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2, 3]], [[4], [5], [6]]], expected: [[32]] },
      { input: [[[2, 0], [0, 3]], [[1, 0], [0, 1]]], expected: [[2, 0], [0, 3]] },
    ],
    hint: "Triple nested loop: i over rows of A, j over cols of B, k over the shared dimension.",
  },
  {
    id: "la-002",
    title: "Matrix Transpose",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the transpose of matrix A. Element (i, j) becomes (j, i).",
    starterCode: `def transpose(A):
    # Your code here
    pass`,
    solution: `def transpose(A):
    if not A or not A[0]:
        return []
    m, n = len(A), len(A[0])
    return [[A[i][j] for i in range(m)] for j in range(n)]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { input: [[[1, 2], [3, 4]]], expected: [[1, 3], [2, 4]] },
      { input: [[[1, 2, 3]]], expected: [[1], [2], [3]] },
    ],
    hint: "The element at A[i][j] in the original becomes T[j][i].",
  },
  {
    id: "la-003",
    title: "Matrix Trace",
    category: "Linear Algebra",
    difficulty: "Easy",
    description: "Compute the trace of a square matrix A (sum of diagonal elements).",
    starterCode: `def trace(A):
    # Your code here
    pass`,
    solution: `def trace(A):
    return sum(A[i][i] for i in range(len(A)))`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 5 },
      { input: [[[5, 0, 0], [0, 6, 0], [0, 0, 7]]], expected: 18 },
      { input: [[[42]]], expected: 42 },
    ],
  },
  {
    id: "la-004",
    title: "Vector Dot Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description: "Compute the dot product of two equal-length vectors a and b: sum(a[i] * b[i]).",
    starterCode: `def dot(a, b):
    # Your code here
    pass`,
    solution: `def dot(a, b):
    return sum(x * y for x, y in zip(a, b))`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: 32 },
      { input: [[0, 0, 0], [1, 2, 3]], expected: 0 },
      { input: [[2, 2], [3, 3]], expected: 12 },
    ],
  },
  {
    id: "la-005",
    title: "Vector Cross Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the cross product of two 3D vectors a and b:\n\nc = [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]",
    starterCode: `def cross(a, b):
    # Your code here
    pass`,
    solution: `def cross(a, b):
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0]], expected: [0, 0, 1] },
      { input: [[1, 2, 3], [4, 5, 6]], expected: [-3, 6, -3] },
      { input: [[2, 0, 0], [0, 3, 0]], expected: [0, 0, 6] },
    ],
  },
  {
    id: "la-006",
    title: "L2 Vector Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description: "Compute the L2 (Euclidean) norm of a vector v: sqrt(sum(v[i]^2)).",
    starterCode: `def l2_norm(v):
    # Your code here
    pass`,
    solution: `def l2_norm(v):
    return sum(x * x for x in v) ** 0.5`,
    testCases: [
      { input: [[3, 4]], expected: 5.0 },
      { input: [[1, 0, 0]], expected: 1.0 },
      { input: [[1, 1, 1, 1]], expected: 2.0 },
      { input: [[0, 0, 0]], expected: 0.0 },
    ],
  },
  {
    id: "la-007",
    title: "Vector Projection",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Project vector a onto vector b. Returns the projected vector (same direction as b).\n\nproj_b(a) = (a·b / b·b) * b\n\nIf b is the zero vector, return a list of zeros with the same length as a.",
    starterCode: `def project(a, b):
    # Your code here
    pass`,
    solution: `def project(a, b):
    dot_ab = sum(x * y for x, y in zip(a, b))
    dot_bb = sum(y * y for y in b)
    if dot_bb == 0:
        return [0.0 for _ in a]
    scalar = dot_ab / dot_bb
    return [scalar * y for y in b]`,
    testCases: [
      { input: [[3, 4], [1, 0]], expected: [3.0, 0.0] },
      { input: [[1, 2, 3], [0, 0, 1]], expected: [0.0, 0.0, 3.0] },
      { input: [[2, 2], [1, 1]], expected: [2.0, 2.0] },
      { input: [[1, 1], [0, 0]], expected: [0.0, 0.0] },
    ],
    hint: "The scalar projection is (a·b)/(b·b); multiply by b componentwise.",
  },
  {
    id: "la-008",
    title: "2x2 Matrix Determinant",
    category: "Linear Algebra",
    difficulty: "Easy",
    description: "Compute the determinant of a 2x2 matrix: det = A[0][0]*A[1][1] - A[0][1]*A[1][0].",
    starterCode: `def det_2x2(A):
    # Your code here
    pass`,
    solution: `def det_2x2(A):
    return A[0][0] * A[1][1] - A[0][1] * A[1][0]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: -2 },
      { input: [[[2, 0], [0, 3]]], expected: 6 },
      { input: [[[1, 0], [0, 1]]], expected: 1 },
      { input: [[[0, 1], [0, 0]]], expected: 0 },
    ],
  },
  {
    id: "la-009",
    title: "3x3 Matrix Determinant",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the determinant of a 3x3 matrix using cofactor expansion along the first row:\n\ndet = A[0][0] * M00 - A[0][1] * M01 + A[0][2] * M02\n\nwhere M0j is the 2x2 minor obtained by deleting row 0 and column j.",
    starterCode: `def det_3x3(A):
    # Your code here
    pass`,
    solution: `def det_3x3(A):
    a, b, c = A[0]
    d, e, f = A[1]
    g, h, i = A[2]
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 0 },
      { input: [[[6, 1, 1], [4, -2, 5], [2, 8, 7]]], expected: -306 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 1 },
    ],
    hint: "Expand along the first row, alternating signs.",
  },
  {
    id: "la-010",
    title: "2x2 Matrix Inverse",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the inverse of a 2x2 matrix. If the determinant is 0, return None.\n\ninv(A) = (1/det) * [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]]",
    starterCode: `def inverse_2x2(A):
    # Your code here
    pass`,
    solution: `def inverse_2x2(A):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    inv_det = 1.0 / det
    return [
        [A[1][1] * inv_det, -A[0][1] * inv_det],
        [-A[1][0] * inv_det, A[0][0] * inv_det],
    ]`,
    testCases: [
      { input: [[[4, 7], [2, 6]]], expected: [[0.6, -0.7], [-0.2, 0.4]] },
      { input: [[[1, 2], [3, 4]]], expected: [[-2.0, 1.0], [1.5, -0.5]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 2], [2, 4]]], expected: null },
    ],
    hint: "Swap the diagonal elements, negate the off-diagonal, divide by det.",
  },

  // ── Calculus ────────────────────────────────────────────────────────────
  {
    id: "ca-001",
    title: "Numerical Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate the derivative of the polynomial f(x) = sum(coeffs[i] * x^i) at the point x using central differences:\n\nf'(x) ≈ (f(x + h) - f(x - h)) / (2 * h)\n\nUse h = 1e-6.",
    starterCode: `def numerical_derivative(coeffs, x, h=1e-6):
    # coeffs[i] is the coefficient of x^i
    # Your code here
    pass`,
    solution: `def numerical_derivative(coeffs, x, h=1e-6):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (f(x + h) - f(x - h)) / (2 * h)`,
    testCases: [
      { input: [[0, 0, 1], 3], expected: 6.0 },
      { input: [[1, 2, 3], 2], expected: 14.0 },
      { input: [[5], 10], expected: 0.0 },
      { input: [[0, 1], 7], expected: 1.0 },
    ],
    hint: "Define a local helper f(t) that evaluates the polynomial at t, then apply central differences.",
  },
  {
    id: "ca-002",
    title: "Numerical Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the numerical gradient of f(x) = sum(x_i^2) at a given point using central differences with h = 1e-6.\n\nReturns a list grad where grad[i] = (f(point + h*e_i) - f(point - h*e_i)) / (2h).",
    starterCode: `def numerical_gradient(point, h=1e-6):
    # f(x) = sum(x_i ** 2)
    # Your code here
    pass`,
    solution: `def numerical_gradient(point, h=1e-6):
    def f(p):
        return sum(v * v for v in p)
    n = len(point)
    grad = []
    for i in range(n):
        p_plus = list(point)
        p_minus = list(point)
        p_plus[i] += h
        p_minus[i] -= h
        grad.append((f(p_plus) - f(p_minus)) / (2 * h))
    return grad`,
    testCases: [
      { input: [[1, 2, 3]], expected: [2.0, 4.0, 6.0] },
      { input: [[0, 0]], expected: [0.0, 0.0] },
      { input: [[5]], expected: [10.0] },
      { input: [[1, 1, 1, 1]], expected: [2.0, 2.0, 2.0, 2.0] },
    ],
    hint: "For each dimension i, perturb only that coordinate by ±h.",
  },
  {
    id: "ca-003",
    title: "Trapezoidal Integration",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate the definite integral using the trapezoidal rule given evenly-spaced samples.\n\nf_samples is a list of y-values at x positions from x_start to x_end (inclusive).\n\nintegral ≈ (dx/2) * (f[0] + 2*f[1] + ... + 2*f[n-1] + f[n])\n\nwhere dx = (x_end - x_start) / (len(f_samples) - 1).",
    starterCode: `def trapezoidal_integral(f_samples, x_start, x_end):
    # Your code here
    pass`,
    solution: `def trapezoidal_integral(f_samples, x_start, x_end):
    n = len(f_samples) - 1
    if n <= 0:
        return 0.0
    dx = (x_end - x_start) / n
    total = 0.5 * (f_samples[0] + f_samples[-1])
    for i in range(1, n):
        total += f_samples[i]
    return total * dx`,
    testCases: [
      { input: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 0, 1], expected: 1.0 },
      { input: [[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], 0, 1], expected: 0.5 },
      { input: [[0, 1, 4, 9, 16], 0, 2], expected: 5.0 },
    ],
    hint: "First and last samples have weight 1/2, all interior samples have weight 1, then multiply by dx.",
  },
  {
    id: "ca-004",
    title: "Jacobian Matrix",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the Jacobian matrix of the vector-valued function f(x1, x2) = [x1^2, x1*x2] at a given point using central differences (h = 1e-6).\n\nJ is a 2x2 matrix where J[j][i] = d f_j / d x_i.",
    starterCode: `def jacobian(point, h=1e-6):
    # f(x1, x2) = [x1**2, x1*x2]
    # Returns 2x2 Jacobian J[j][i] = d(f_j)/d(x_i)
    # Your code here
    pass`,
    solution: `def jacobian(point, h=1e-6):
    def f(p):
        return [p[0] ** 2, p[0] * p[1]]
    n = len(point)
    f_at = f(point)
    m = len(f_at)
    J = [[0.0] * n for _ in range(m)]
    for i in range(n):
        p_plus = list(point)
        p_minus = list(point)
        p_plus[i] += h
        p_minus[i] -= h
        f_plus = f(p_plus)
        f_minus = f(p_minus)
        for j in range(m):
            J[j][i] = (f_plus[j] - f_minus[j]) / (2 * h)
    return J`,
    testCases: [
      { input: [[2, 3]], expected: [[4.0, 0.0], [3.0, 2.0]] },
      { input: [[1, 1]], expected: [[2.0, 0.0], [1.0, 1.0]] },
      { input: [[0, 5]], expected: [[0.0, 0.0], [5.0, 0.0]] },
    ],
    hint: "Perturb each input dimension independently; record how each output component changes.",
  },
  {
    id: "ca-005",
    title: "Hessian Matrix",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the Hessian matrix of f(x) = sum(x_i^2) at a given point using second-order central differences (h = 1e-5).\n\nH is n x n where:\n  H[i][i] = (f(x + h*e_i) - 2*f(x) + f(x - h*e_i)) / h^2\n  H[i][j] = (f(x+h*e_i+h*e_j) - f(x+h*e_i-h*e_j) - f(x-h*e_i+h*e_j) + f(x-h*e_i-h*e_j)) / (4 h^2)",
    starterCode: `def hessian(point, h=1e-5):
    # f(x) = sum(x_i ** 2)
    # Returns n x n Hessian
    # Your code here
    pass`,
    solution: `def hessian(point, h=1e-5):
    def f(p):
        return sum(v * v for v in p)
    n = len(point)
    H = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                p_p = list(point); p_p[i] += h
                p_m = list(point); p_m[i] -= h
                H[i][i] = (f(p_p) - 2 * f(point) + f(p_m)) / (h * h)
            else:
                p_pp = list(point); p_pp[i] += h; p_pp[j] += h
                p_pm = list(point); p_pm[i] += h; p_pm[j] -= h
                p_mp = list(point); p_mp[i] -= h; p_mp[j] += h
                p_mm = list(point); p_mm[i] -= h; p_mm[j] -= h
                H[i][j] = (f(p_pp) - f(p_pm) - f(p_mp) + f(p_mm)) / (4 * h * h)
    return H`,
    testCases: [
      { input: [[1, 2, 3]], expected: [[2.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 2.0]] },
      { input: [[0, 0]], expected: [[2.0, 0.0], [0.0, 2.0]] },
      { input: [[5]], expected: [[2.0]] },
    ],
    hint: "For diagonal: second difference. For off-diagonal: 4-point cross stencil.",
  },

  // ── Statistics ──────────────────────────────────────────────────────────
  {
    id: "st-001",
    title: "Mean",
    category: "Statistics",
    difficulty: "Easy",
    description: "Compute the arithmetic mean of a list of numbers: sum(data) / len(data).",
    starterCode: `def mean(data):
    # Your code here
    pass`,
    solution: `def mean(data):
    if not data:
        return 0.0
    return sum(data) / len(data)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 3.0 },
      { input: [[10, 20, 30]], expected: 20.0 },
      { input: [[7]], expected: 7.0 },
      { input: [[1, 1, 1, 1]], expected: 1.0 },
    ],
  },
  {
    id: "st-002",
    title: "Variance",
    category: "Statistics",
    difficulty: "Easy",
    description:
      "Compute the population variance of a list of numbers:\n\nvar = sum((x - mean)^2) / N",
    starterCode: `def variance(data):
    # Your code here
    pass`,
    solution: `def variance(data):
    n = len(data)
    if n == 0:
        return 0.0
    m = sum(data) / n
    return sum((x - m) ** 2 for x in data) / n`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 2.0 },
      { input: [[10, 10, 10]], expected: 0.0 },
      { input: [[1, 3]], expected: 1.0 },
      { input: [[0, 5]], expected: 6.25 },
    ],
    hint: "Don't forget to subtract the mean before squaring.",
  },
  {
    id: "st-003",
    title: "Covariance",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the population covariance of two equal-length lists x and y:\n\ncov = sum((x_i - mean_x) * (y_i - mean_y)) / N",
    starterCode: `def covariance(x, y):
    # Your code here
    pass`,
    solution: `def covariance(x, y):
    n = len(x)
    if n == 0:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    return sum((xi - mx) * (yi - my) for xi, yi in zip(x, y)) / n`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 2.5 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -0.6666666666666666 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 0.6666666666666666 },
    ],
    hint: "Positive when x and y move together; negative when they move opposite.",
  },
  {
    id: "st-004",
    title: "Pearson Correlation",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the Pearson correlation coefficient between x and y:\n\nr = cov(x, y) / (std(x) * std(y))\n\nReturn 0.0 if either standard deviation is 0.",
    starterCode: `def pearson_correlation(x, y):
    # Your code here
    pass`,
    solution: `def pearson_correlation(x, y):
    n = len(x)
    if n == 0:
        return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    den_x = sum((xi - mx) ** 2 for xi in x) ** 0.5
    den_y = sum((yi - my) ** 2 for yi in y) ** 0.5
    if den_x == 0 or den_y == 0:
        return 0.0
    return num / (den_x * den_y)`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8]], expected: 1.0 },
      { input: [[1, 2, 3], [3, 2, 1]], expected: -1.0 },
      { input: [[1, 2, 3, 4, 5], [2, 4, 1, 3, 5]], expected: 0.3 },
      { input: [[5, 5, 5], [1, 2, 3]], expected: 0.0 },
    ],
    hint: "Covariance divided by the product of standard deviations. Range: [-1, 1].",
  },
  {
    id: "st-005",
    title: "Normal Distribution PDF",
    category: "Statistics",
    difficulty: "Medium",
    description:
      "Compute the probability density function of a normal distribution with mean mu and standard deviation sigma at point x:\n\npdf(x) = (1 / (sigma * sqrt(2π))) * exp(-(x - mu)^2 / (2 * sigma^2))\n\nIf sigma <= 0, return 0.0.",
    starterCode: `import math
def normal_pdf(x, mu, sigma):
    # Your code here
    pass`,
    solution: `import math
def normal_pdf(x, mu, sigma):
    if sigma <= 0:
        return 0.0
    coeff = 1.0 / (sigma * (2 * math.pi) ** 0.5)
    exponent = -((x - mu) ** 2) / (2 * sigma * sigma)
    return coeff * math.exp(exponent)`,
    testCases: [
      { input: [0, 0, 1], expected: 0.3989422804014327 },
      { input: [1, 0, 1], expected: 0.24197072451914337 },
      { input: [0, 0, 2], expected: 0.19947114020071635 },
      { input: [5, 5, 1], expected: 0.3989422804014327 },
      { input: [0, 0, 0], expected: 0.0 },
    ],
    hint: "Don't forget to square sigma in the denominator of the exponent.",
  },

  // ── Probability ─────────────────────────────────────────────────────────
  {
    id: "pr-001",
    title: "Bayes Theorem",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Apply Bayes' theorem to compute P(A|B):\n\nP(A|B) = (P(B|A) * P(A)) / P(B)\n\nwhere P(B) = P(B|A) * P(A) + P(B|¬A) * P(¬A).\n\nInputs: P(A), P(B|A), P(B|¬A). Return 0.0 if P(B) is 0.",
    starterCode: `def bayes_theorem(p_a, p_b_given_a, p_b_given_not_a):
    # Your code here
    pass`,
    solution: `def bayes_theorem(p_a, p_b_given_a, p_b_given_not_a):
    p_not_a = 1 - p_a
    p_b = p_b_given_a * p_a + p_b_given_not_a * p_not_a
    if p_b == 0:
        return 0.0
    return (p_b_given_a * p_a) / p_b`,
    testCases: [
      { input: [0.01, 0.9, 0.05], expected: 0.15384615384615385 },
      { input: [0.5, 0.8, 0.2], expected: 0.8 },
      { input: [0.1, 1.0, 0.0], expected: 1.0 },
      { input: [0.0, 0.9, 0.1], expected: 0.0 },
    ],
    hint: "Total probability of B uses both branches (A and ¬A).",
  },
  {
    id: "pr-002",
    title: "Expected Value",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the expected value of a discrete random variable:\n\nE[X] = sum(values[i] * probabilities[i])\n\nYou may assume the probabilities sum to 1.",
    starterCode: `def expected_value(values, probabilities):
    # Your code here
    pass`,
    solution: `def expected_value(values, probabilities):
    return sum(v * p for v, p in zip(values, probabilities))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]], expected: 3.5 },
      { input: [[0, 1], [0.5, 0.5]], expected: 0.5 },
      { input: [[10, 0], [0.1, 0.9]], expected: 1.0 },
    ],
  },
  {
    id: "pr-003",
    title: "Combinations (nCr)",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the number of ways to choose r items from n items without regard to order:\n\nC(n, r) = n! / (r! * (n-r)!)\n\nReturn 0 if r < 0 or r > n.",
    starterCode: `def combinations(n, r):
    # Your code here
    pass`,
    solution: `def combinations(n, r):
    if r < 0 or r > n:
        return 0
    if r == 0 or r == n:
        return 1
    r = min(r, n - r)
    result = 1
    for i in range(r):
        result = result * (n - i) // (i + 1)
    return result`,
    testCases: [
      { input: [5, 2], expected: 10 },
      { input: [10, 3], expected: 120 },
      { input: [7, 0], expected: 1 },
      { input: [0, 0], expected: 1 },
      { input: [5, 6], expected: 0 },
    ],
    hint: "Use the multiplicative formula: product of (n-i)/(i+1) for i in [0, r).",
  },
  {
    id: "pr-004",
    title: "Permutations (nPr)",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Compute the number of ways to arrange r items from n items (order matters):\n\nP(n, r) = n! / (n-r)!\n\nReturn 0 if r < 0 or r > n.",
    starterCode: `def permutations(n, r):
    # Your code here
    pass`,
    solution: `def permutations(n, r):
    if r < 0 or r > n:
        return 0
    result = 1
    for i in range(n, n - r, -1):
        result *= i
    return result`,
    testCases: [
      { input: [5, 2], expected: 20 },
      { input: [10, 3], expected: 720 },
      { input: [5, 0], expected: 1 },
      { input: [5, 5], expected: 120 },
      { input: [3, 5], expected: 0 },
    ],
    hint: "Product of the top r terms of n!: n * (n-1) * ... * (n-r+1).",
  },
  {
    id: "pr-005",
    title: "Variance of Discrete RV",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Compute the variance of a discrete random variable:\n\nVar(X) = sum((v_i - E[X])^2 * p_i)\n\nwhere E[X] = sum(v_i * p_i).",
    starterCode: `def variance_discrete_rv(values, probabilities):
    # Your code here
    pass`,
    solution: `def variance_discrete_rv(values, probabilities):
    exp_val = sum(v * p for v, p in zip(values, probabilities))
    return sum((v - exp_val) ** 2 * p for v, p in zip(values, probabilities))`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6], [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]], expected: 2.9166666666666665 },
      { input: [[0, 1], [0.5, 0.5]], expected: 0.25 },
      { input: [[5, 5, 5], [1/3, 1/3, 1/3]], expected: 0.0 },
    ],
    hint: "E[X^2] - (E[X])^2 also works, but the direct definition is cleaner here.",
  },

  // ── ML Fundamentals ─────────────────────────────────────────────────────
  {
    id: "ml-001",
    title: "Linear Regression",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Fit a simple linear regression y = a + b*x using least squares.\n\nb = sum((x_i - mean_x) * (y_i - mean_y)) / sum((x_i - mean_x)^2)\na = mean_y - b * mean_x\n\nReturn [a, b] = [intercept, slope]. If the denominator is 0, return [mean_y, 0.0].",
    starterCode: `def linear_regression_fit(X, y):
    # Returns [intercept, slope]
    # Your code here
    pass`,
    solution: `def linear_regression_fit(X, y):
    n = len(X)
    mx = sum(X) / n
    my = sum(y) / n
    num = sum((xi - mx) * (yi - my) for xi, yi in zip(X, y))
    den = sum((xi - mx) ** 2 for xi in X)
    if den == 0:
        return [my, 0.0]
    b = num / den
    a = my - b * mx
    return [a, b]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 5, 7, 9, 11]], expected: [1.0, 2.0] },
      { input: [[0, 1, 2, 3], [1, 3, 5, 7]], expected: [1.0, 2.0] },
      { input: [[1, 2, 3], [2, 4, 6]], expected: [0.0, 2.0] },
      { input: [[5, 5, 5], [3, 4, 5]], expected: [4.0, 0.0] },
    ],
    hint: "b is the slope (cov(x,y) / var(x)); a is the intercept that makes the line pass through (mean_x, mean_y).",
  },
  {
    id: "ml-002",
    title: "Logistic Sigmoid",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the logistic sigmoid function: σ(z) = 1 / (1 + exp(-z)).\n\nHandle large positive and negative z correctly (avoid overflow).",
    starterCode: `import math
def sigmoid(z):
    # Your code here
    pass`,
    solution: `import math
def sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    ez = math.exp(z)
    return ez / (1.0 + ez)`,
    testCases: [
      { input: [0], expected: 0.5 },
      { input: [100], expected: 1.0 },
      { input: [-100], expected: 0.0 },
      { input: [2], expected: 0.8807970779778823 },
      { input: [-2], expected: 0.11920292202211755 },
    ],
    hint: "Branch on the sign of z to avoid exp() overflow.",
  },
  {
    id: "ml-003",
    title: "K-Means One Iteration",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Perform one iteration of k-means:\n  1. Assign each point to its nearest centroid (Euclidean distance).\n  2. Recompute each centroid as the mean of the points assigned to it.\n\nIf a centroid has no points assigned, keep it unchanged.\n\npoints is a list of [x, y, ...] vectors. centroids is a list of same-shape vectors. Returns the new list of centroids.",
    starterCode: `def kmeans_one_iter(points, centroids):
    # Your code here
    pass`,
    solution: `def kmeans_one_iter(points, centroids):
    n_c = len(centroids)
    dim = len(centroids[0]) if centroids else 0
    clusters = [[] for _ in range(n_c)]
    for p in points:
        best = 0
        best_d = float('inf')
        for i, c in enumerate(centroids):
            d = sum((p[j] - c[j]) ** 2 for j in range(dim))
            if d < best_d:
                best_d = d
                best = i
        clusters[best].append(p)
    new_c = []
    for i, cluster in enumerate(clusters):
        if not cluster:
            new_c.append(list(centroids[i]))
        else:
            new_c.append([sum(p[j] for p in cluster) / len(cluster) for j in range(dim)])
    return new_c`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], [[0, 0], [10, 10]]], expected: [[0.0, 0.5], [10.0, 10.5]] },
      { input: [[[1, 1], [2, 2], [9, 9], [10, 10]], [[0, 0], [5, 5]]], expected: [[1.5, 1.5], [9.5, 9.5]] },
      { input: [[[1], [2], [9], [10]], [[0], [5]]], expected: [[1.5], [9.5]] },
    ],
    hint: "First pass: assignment. Second pass: recompute means.",
  },
  {
    id: "ml-004",
    title: "K-Nearest Neighbors",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Predict the class label of x_test by majority vote among its k nearest neighbors in X_train.\n\nDistance is Euclidean. Ties in the vote are broken by choosing the smallest label.",
    starterCode: `def knn_predict(X_train, y_train, x_test, k):
    # Your code here
    pass`,
    solution: `def knn_predict(X_train, y_train, x_test, k):
    distances = []
    for i, x in enumerate(X_train):
        d = sum((a - b) ** 2 for a, b in zip(x, x_test))
        distances.append((d, y_train[i]))
    distances.sort(key=lambda t: t[0])
    votes = {}
    for i in range(min(k, len(distances))):
        label = distances[i][1]
        votes[label] = votes.get(label, 0) + 1
    max_count = max(votes.values())
    winners = sorted([l for l, c in votes.items() if c == max_count])
    return winners[0]`,
    testCases: [
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], ["a", "a", "b", "b"], [1, 0], 2], expected: "a" },
      { input: [[[0, 0], [0, 1], [10, 10], [10, 11]], ["a", "a", "b", "b"], [9, 10], 2], expected: "b" },
      { input: [[[1], [2], [3], [10]], [0, 0, 0, 1], [4], 3], expected: 0 },
    ],
    hint: "Sort by distance, take top k, count labels, break ties by smallest label.",
  },
  {
    id: "ml-005",
    title: "Best Decision Tree Split",
    category: "ML Fundamentals",
    difficulty: "Hard",
    description:
      "Find the (feature_index, threshold) split that minimizes the weighted Gini impurity of the two children.\n\nFor each feature, consider thresholds midway between consecutive unique values. Return [feature_index, threshold] of the best split.\n\nIf no split improves (only one unique value per feature), return [0, 0.0].",
    starterCode: `def best_split_gini(X, y):
    # Returns [feature_index, threshold]
    # Your code here
    pass`,
    solution: `def best_split_gini(X, y):
    def gini(labels):
        n = len(labels)
        if n == 0:
            return 0.0
        counts = {}
        for l in labels:
            counts[l] = counts.get(l, 0) + 1
        return 1.0 - sum((c / n) ** 2 for c in counts.values())
    n = len(y)
    n_features = len(X[0])
    best_gini = float('inf')
    best_feat = 0
    best_thr = 0.0
    for feat in range(n_features):
        values = sorted(set(x[feat] for x in X))
        for i in range(len(values) - 1):
            thr = (values[i] + values[i + 1]) / 2.0
            left = [y[j] for j in range(n) if X[j][feat] <= thr]
            right = [y[j] for j in range(n) if X[j][feat] > thr]
            if not left or not right:
                continue
            w = len(left) / n * gini(left) + len(right) / n * gini(right)
            if w < best_gini:
                best_gini = w
                best_feat = feat
                best_thr = thr
    return [best_feat, best_thr]`,
    testCases: [
      { input: [[[1, 2], [2, 3], [3, 4], [8, 9], [9, 10]], [0, 0, 0, 1, 1]], expected: [0, 5.5] },
      { input: [[[1], [2], [10], [11]], [0, 0, 1, 1]], expected: [0, 6.0] },
      { input: [[[1, 1], [1, 2], [2, 1], [2, 2]], [0, 1, 1, 0]], expected: [0, 1.5] },
    ],
    hint: "Gini of a node = 1 - sum(p_i^2). Weighted by node size.",
  },
  {
    id: "ml-006",
    title: "Entropy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Shannon entropy (base 2) of a list of class labels:\n\nH = -sum(p_i * log2(p_i))\n\nwhere p_i is the proportion of label i. Empty input returns 0.0.",
    starterCode: `import math
def entropy(labels):
    # Your code here
    pass`,
    solution: `import math
def entropy(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    h = 0.0
    for c in counts.values():
        p = c / n
        if p > 0:
            h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [[0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 0, 0, 0]], expected: 0.0 },
      { input: [[0, 1, 2, 3]], expected: 2.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Use math.log2 for base-2 entropy.",
  },
  {
    id: "ml-007",
    title: "Gini Impurity",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description:
      "Compute the Gini impurity of a list of class labels:\n\nGini = 1 - sum(p_i^2)\n\nEmpty input returns 0.0.",
    starterCode: `def gini_impurity(labels):
    # Your code here
    pass`,
    solution: `def gini_impurity(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = {}
    for l in labels:
        counts[l] = counts.get(l, 0) + 1
    return 1.0 - sum((c / n) ** 2 for c in counts.values())`,
    testCases: [
      { input: [[0, 0, 1, 1]], expected: 0.5 },
      { input: [[0, 0, 0, 0]], expected: 0.0 },
      { input: [[0, 1, 2, 3]], expected: 0.75 },
      { input: [[]], expected: 0.0 },
    ],
  },
  {
    id: "ml-008",
    title: "Accuracy",
    category: "ML Fundamentals",
    difficulty: "Easy",
    description: "Compute classification accuracy: fraction of y_true[i] that equal y_pred[i]. Empty input returns 0.0.",
    starterCode: `def accuracy(y_true, y_pred):
    # Your code here
    pass`,
    solution: `def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)`,
    testCases: [
      { input: [[1, 0, 1, 1], [1, 0, 0, 1]], expected: 0.75 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 0], [1, 0, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
  },
  {
    id: "ml-009",
    title: "Precision, Recall, F1",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Compute precision, recall, and F1 score for binary classification.\n\nA positive label is 1 by default. Return [precision, recall, f1].\n\nprecision = TP / (TP + FP)\nrecall = TP / (TP + FN)\nF1 = 2 * precision * recall / (precision + recall)\n\nAny undefined value (zero denominator) is 0.0.",
    starterCode: `def precision_recall_f1(y_true, y_pred, positive=1):
    # Returns [precision, recall, f1]
    # Your code here
    pass`,
    solution: `def precision_recall_f1(y_true, y_pred, positive=1):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == positive and p == positive)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t != positive and p == positive)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == positive and p != positive)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return [precision, recall, f1]`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [1, 0, 0, 1, 0]], expected: [1.0, 0.6666666666666666, 0.8] },
      { input: [[1, 1, 0, 0], [1, 1, 1, 0]], expected: [0.6666666666666666, 1.0, 0.8] },
      { input: [[1, 1, 1], [0, 0, 0]], expected: [0.0, 0.0, 0.0] },
      { input: [[0, 0, 0], [1, 1, 1]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "TP = both true and pred are positive. FP = pred positive but true negative. FN = pred negative but true positive.",
  },
  {
    id: "ml-010",
    title: "K-Fold Split Indices",
    category: "ML Fundamentals",
    difficulty: "Medium",
    description:
      "Generate k-fold cross-validation splits for n samples (indices 0..n-1).\n\nReturn a list of k entries, each of the form [train_indices, val_indices].\n\nDistribute samples so that the first (n % k) folds get one extra sample. Train indices are everything except the validation indices for that fold.",
    starterCode: `def kfold_indices(n, k):
    # Returns list of [train_indices, val_indices]
    # Your code here
    pass`,
    solution: `def kfold_indices(n, k):
    indices = list(range(n))
    fold_size = n // k
    remainder = n % k
    folds = []
    start = 0
    for i in range(k):
        size = fold_size + (1 if i < remainder else 0)
        val = indices[start:start + size]
        train = indices[:start] + indices[start + size:]
        folds.append([train, val])
        start += size
    return folds`,
    testCases: [
      { input: [6, 3], expected: [[[2, 3, 4, 5], [0, 1]], [[0, 1, 4, 5], [2, 3]], [[0, 1, 2, 3], [4, 5]]] },
      { input: [4, 2], expected: [[[2, 3], [0, 1]], [[0, 1], [2, 3]]] },
      { input: [5, 5], expected: [[[1, 2, 3, 4], [0]], [[0, 2, 3, 4], [1]], [[0, 1, 3, 4], [2]], [[0, 1, 2, 4], [3]], [[0, 1, 2, 3], [4]]] },
    ],
    hint: "Slice the indices into k contiguous chunks; train is the complement of val.",
  },

  // ── Deep Learning ───────────────────────────────────────────────────────
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
    ],
    hint: "Work backwards from dz2 = y_pred - y_true. Multiply by local Jacobians at each layer.",
  },

  // ── NLP ─────────────────────────────────────────────────────────────────
  {
    id: "nlp-001",
    title: "Tokenization",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Tokenize text into lowercase alphanumeric tokens.\n\nLowercase the text, replace any non-alphanumeric non-whitespace character with a space, then split on whitespace.",
    starterCode: `def tokenize(text):
    # Your code here
    pass`,
    solution: `def tokenize(text):
    text = text.lower()
    cleaned = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in text)
    return cleaned.split()`,
    testCases: [
      { input: ["Hello, World!"], expected: ["hello", "world"] },
      { input: ["The quick brown fox."], expected: ["the", "quick", "brown", "fox"] },
      { input: ["Don't stop!"], expected: ["don", "t", "stop"] },
      { input: ["One2Three4"], expected: ["one2three4"] },
    ],
  },
  {
    id: "nlp-002",
    title: "Bag of Words",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Build a bag-of-words vector for a list of tokens given a fixed vocabulary.\n\nReturn a list where index i is the count of vocab[i] in tokens.",
    starterCode: `def bag_of_words(tokens, vocab):
    # Your code here
    pass`,
    solution: `def bag_of_words(tokens, vocab):
    counts = {w: 0 for w in vocab}
    for t in tokens:
        if t in counts:
            counts[t] += 1
    return [counts[w] for w in vocab]`,
    testCases: [
      { input: [["a", "b", "a"], ["a", "b", "c"]], expected: [2, 1, 0] },
      { input: [["the", "cat", "sat"], ["the", "cat", "dog"]], expected: [1, 1, 0, 1] },
      { input: [[], ["a", "b"]], expected: [0, 0] },
      { input: [["x", "y", "z"], ["a", "b", "c"]], expected: [0, 0, 0] },
    ],
  },
  {
    id: "nlp-003",
    title: "TF-IDF",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute the TF-IDF matrix for a list of documents.\n\ndocs is a list of token lists. vocab is a list of unique terms.\n\nFor term t and document d:\n  tf(t, d) = count(t in d) / len(d)   (0 if len(d) == 0)\n  idf(t) = log(N / df(t))              (N = number of docs, df(t) = number of docs containing t)\n  tfidf(t, d) = tf(t, d) * idf(t)\n\nReturn an n_docs x n_vocab matrix.",
    starterCode: `import math
def tfidf(docs, vocab):
    # Your code here
    pass`,
    solution: `import math
def tfidf(docs, vocab):
    n_docs = len(docs)
    n_vocab = len(vocab)
    df = [0] * n_vocab
    for d in docs:
        for i, w in enumerate(vocab):
            if w in d:
                df[i] += 1
    idf = [math.log(n_docs / df[i]) if df[i] > 0 else 0.0 for i in range(n_vocab)]
    result = []
    for d in docs:
        total = len(d) if d else 0
        row = []
        for i, w in enumerate(vocab):
            tf = d.count(w) / total if total > 0 else 0.0
            row.append(tf * idf[i])
        result.append(row)
    return result`,
    testCases: [
      {
        input: [
          [["the", "cat", "sat"], ["the", "dog", "ran"], ["the", "bird"]],
          ["the", "cat", "dog", "ran", "bird", "sat"],
        ],
        expected: [
          [0.0, 0.3662040962227032, 0.0, 0.0, 0.0, 0.3662040962227032],
          [0.0, 0.0, 0.3662040962227032, 0.3662040962227032, 0.0, 0.0],
          [0.0, 0.0, 0.0, 0.0, 0.549306144333982, 0.0],
        ],
      },
      {
        input: [
          [["a", "b"], ["a", "c"]],
          ["a", "b", "c"],
        ],
        expected: [
          [0.0, 0.34657359027997264, 0.0],
          [0.0, 0.0, 0.34657359027997264],
        ],
      },
    ],
    hint: "df(t) counts docs containing t (not total occurrences). log is natural log.",
  },
  {
    id: "nlp-004",
    title: "N-grams",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Generate all n-grams of length n from a list of tokens.\n\nReturn a list of lists, where each inner list is a slice of n consecutive tokens.\n\nIf n <= 0 or len(tokens) < n, return an empty list.",
    starterCode: `def ngrams(tokens, n):
    # Your code here
    pass`,
    solution: `def ngrams(tokens, n):
    if n <= 0 or len(tokens) < n:
        return []
    return [tokens[i:i + n] for i in range(len(tokens) - n + 1)]`,
    testCases: [
      { input: [["a", "b", "c", "d"], 2], expected: [["a", "b"], ["b", "c"], ["c", "d"]] },
      { input: [["a", "b", "c"], 3], expected: [["a", "b", "c"]] },
      { input: [["a", "b"], 3], expected: [] },
      { input: [["a", "b", "c"], 1], expected: [["a"], ["b"], ["c"]] },
    ],
  },
  {
    id: "nlp-005",
    title: "Cosine Similarity",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Compute the cosine similarity between two equal-length vectors:\n\ncos(v1, v2) = (v1 · v2) / (||v1|| * ||v2||)\n\nReturn 0.0 if either vector has zero norm.",
    starterCode: `def cosine_similarity(v1, v2):
    # Your code here
    pass`,
    solution: `def cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = sum(a * a for a in v1) ** 0.5
    n2 = sum(b * b for b in v2) ** 0.5
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)`,
    testCases: [
      { input: [[1, 0, 1], [1, 1, 0]], expected: 0.5 },
      { input: [[1, 1], [1, 1]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[1, 2, 3], [2, 4, 6]], expected: 1.0 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "Dot product over the product of L2 norms. Range: [-1, 1].",
  },

  // ── Optimization ────────────────────────────────────────────────────────
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
      { input: [[1, 2, 3, 4, 5, 6], [2, 4, 6, 8, 10, 12], 0.01, 500, 2], expected: [2.0, 0.0] },
      { input: [[1, 2, 3], [3, 5, 7], 0.05, 1000, 1], expected: [2.0, 1.0] },
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
      { input: [10, 0.01, 0.9, 200], expected: 0.0 },
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
      { input: [5, 0.5, 0.9, 0.999, 1e-8, 100], expected: 0.0 },
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

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "math-foundations",
    title: "Math Foundations",
    description:
      "Build the linear algebra, calculus, statistics, and probability intuition you need before touching ML. Start with vectors and matrices, end with Hessians and Bayes.",
    problemIds: [
      "la-004", "la-001", "la-002", "la-003",
      "la-006", "la-005", "la-008", "la-007",
      "st-001", "st-002", "st-003", "st-004", "st-005",
      "pr-002", "pr-003", "pr-004", "pr-001", "pr-005",
      "ca-001", "ca-003", "ca-002", "ca-004", "ca-005",
    ],
    estimatedHours: 8,
  },
  {
    id: "ml-from-scratch",
    title: "ML From Scratch",
    description:
      "Implement the classic ML algorithms with no libraries. Linear regression, k-means, k-NN, decision trees, and the metrics that tell you if they work.",
    problemIds: [
      "ml-006", "ml-007", "ml-008", "ml-001",
      "ml-002", "ml-009", "ml-010",
      "ml-004", "ml-003", "ml-005",
    ],
    estimatedHours: 6,
  },
  {
    id: "deep-learning-essentials",
    title: "Deep Learning Essentials",
    description:
      "Activations, forward pass, backprop. Build the primitives that every framework gives you, then chain them into a real MLP.",
    problemIds: [
      "dl-001", "ml-002", "dl-002", "dl-003",
      "dl-004", "dl-005",
      "nlp-001", "nlp-002", "nlp-004", "nlp-005", "nlp-003",
    ],
    estimatedHours: 5,
  },
  {
    id: "optimization-mastery",
    title: "Optimization Mastery",
    description:
      "How models actually learn. From vanilla GD through momentum to Adam, plus the LR schedules that decide whether training converges.",
    problemIds: [
      "op-005",
      "ca-001", "ca-002",
      "op-001", "op-003", "op-004", "op-002",
    ],
    estimatedHours: 4,
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export function getProblemsByCategory(cat: Category): Problem[] {
  return PROBLEMS.filter((p) => p.category === cat);
}

export function getCategoryCounts(): Record<Category, number> {
  const counts = {} as Record<Category, number>;
  for (const c of CATEGORIES) counts[c.name] = 0;
  for (const p of PROBLEMS) counts[p.category] += 1;
  return counts;
}
