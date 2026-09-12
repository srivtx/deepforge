import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
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
      { input: [[0, 1, 4, 9, 16], 0, 2], expected: 11.0 },
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
      "Compute the Hessian matrix of f(x) = sum(x_i^2) at a given point using second-order central differences (h = 1e-3).\n\nH is n x n where:\n  H[i][i] = (f(x + h*e_i) - 2*f(x) + f(x - h*e_i)) / h^2\n  H[i][j] = (f(x+h*e_i+h*e_j) - f(x+h*e_i-h*e_j) - f(x-h*e_i+h*e_j) + f(x-h*e_i-h*e_j)) / (4 h^2)",
    starterCode: `def hessian(point, h=1e-3):
    # f(x) = sum(x_i ** 2)
    # Returns n x n Hessian
    # Your code here
    pass`,
    solution: `def hessian(point, h=1e-3):
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
];
