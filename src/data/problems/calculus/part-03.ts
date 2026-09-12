import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-051",
    title: "Total Differential Estimate",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For f(x, y) = a*x^2 + b*y^2 + c*x*y, estimate the change in f for a small step (dx, dy) with the total differential:\n\ndf ≈ f_x * dx + f_y * dy\n\nwhere f_x = 2*a*x + c*y and f_y = 2*b*y + c*x. Evaluate the differential at (x, y).",
    starterCode: `def total_differential(a, b, c, x, y, dx, dy):
    # Your code here
    pass`,
    solution: `def total_differential(a, b, c, x, y, dx, dy):
    fx = 2 * a * x + c * y
    fy = 2 * b * y + c * x
    return fx * dx + fy * dy`,
    testCases: [
      { input: [1, 1, 0, 1, 1, 0.1, 0.2], expected: 0.6000000000000001 },
      { input: [1, 0, 1, 0, 0, 0.5, 1], expected: 0.0 },
      { input: [2, 3, 1, 1, 2, 0.01, -0.02], expected: -0.2 },
      { input: [0, 0, 0, 3, 4, 1, 1], expected: 0.0 },
    ],
    hint: "The total differential is the dot product of the gradient with the displacement.",
  },
  {
    id: "ca-052",
    title: "Hessian Trace",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the trace of the Hessian (the Laplacian) of the 3D quadratic f(x, y, z) = a*x^2 + b*y^2 + c*z^2 + d*x*y + e*y*z + f*z*x.\n\nThe mixed terms do not contribute to the diagonal, so the trace is 2*a + 2*b + 2*c. The inputs d, e, f are accepted to show that they are irrelevant here.",
    starterCode: `def hessian_trace(a, b, c, d, e, f):
    # Your code here
    pass`,
    solution: `def hessian_trace(a, b, c, d, e, f):
    return 2.0 * a + 2.0 * b + 2.0 * c`,
    testCases: [
      { input: [1, 2, 3, 0, 0, 0], expected: 12.0 },
      { input: [1, 1, 1, 5, -2, 7], expected: 6.0 },
      { input: [0, 0, 0, 1, 1, 1], expected: 0.0 },
      { input: [-1, 2, 0, 0, 0, 0], expected: 2.0 },
      { input: [2.5, -0.5, 1, 0, 0, 0], expected: 6.0 },
    ],
    hint: "The trace sums H_xx + H_yy + H_zz, and each pure second derivative is twice its coefficient.",
  },
  {
    id: "ca-053",
    title: "Gradient of Log-Sum-Exp",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Compute the gradient of the log-sum-exp function L(x) = log(sum(exp(x_i))) at a point x.\n\nThe gradient is the softmax vector: grad_i = exp(x_i) / sum(exp(x_j)). Subtract the maximum entry before exponentiating for numerical stability; the result is unchanged.",
    starterCode: `def lse_gradient(x):
    # Return the gradient vector
    # Your code here
    pass`,
    solution: `def lse_gradient(x):
    import math
    m = max(x)
    e = [math.exp(v - m) for v in x]
    s = sum(e)
    return [v / s for v in e]`,
    testCases: [
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[0, 1]], expected: [0.2689414213699951, 0.7310585786300049] },
      { input: [[-1, 1]], expected: [0.11920292202211755, 0.8807970779778823] },
      {
        input: [[2, 2, 2]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
    ],
    hint: "The gradient of log-sum-exp is the softmax of the inputs.",
  },
  {
    id: "ca-054",
    title: "Max Directional Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The maximum possible directional derivative of a scalar field at a point equals the norm of its gradient, attained in the direction of the gradient.\n\nGiven the gradient vector grad, return ||grad||.",
    starterCode: `def max_directional_derivative(grad):
    # Your code here
    pass`,
    solution: `def max_directional_derivative(grad):
    return sum(v * v for v in grad) ** 0.5`,
    testCases: [
      { input: [[3, 4]], expected: 5.0 },
      { input: [[0, 0]], expected: 0.0 },
      { input: [[1, 2, 2]], expected: 3.0 },
      { input: [[-5, 12]], expected: 13.0 },
      { input: [[1]], expected: 1.0 },
    ],
    hint: "This is the steepest ascent rate; take the Euclidean length of the gradient.",
  },
  {
    id: "ca-055",
    title: "Laplace Transform of Exponential",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the Laplace transform of f(t) = e^(a*t) evaluated at s:\n\nF(s) = integral from 0 to infinity of e^(-s*t) * e^(a*t) dt = 1 / (s - a)\n\nAssume s > a so the integral converges.",
    starterCode: `def laplace_exp(a, s):
    # Your code here
    pass`,
    solution: `def laplace_exp(a, s):
    return 1.0 / (s - a)`,
    testCases: [
      { input: [2, 3], expected: 1.0 },
      { input: [0, 1], expected: 1.0 },
      { input: [-1, 2], expected: 0.3333333333333333 },
      { input: [2.5, 5], expected: 0.4 },
    ],
    hint: "Combine the exponentials into e^(-(s - a)t) and integrate.",
  },
  {
    id: "ca-056",
    title: "Laplace Transform of Power",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the Laplace transform of f(t) = t^n evaluated at s:\n\nF(s) = n! / s^(n+1)\n\nfor integer n >= 0 and s > 0.",
    starterCode: `def laplace_power(n, s):
    # Your code here
    pass`,
    solution: `def laplace_power(n, s):
    fact = 1
    for i in range(1, n + 1):
        fact *= i
    return fact / (s ** (n + 1))`,
    testCases: [
      { input: [0, 1], expected: 1.0 },
      { input: [1, 1], expected: 1.0 },
      { input: [2, 1], expected: 2.0 },
      { input: [3, 2], expected: 0.375 },
      { input: [4, 0.5], expected: 768.0 },
    ],
    hint: "Build n! with a loop, then divide by s raised to n + 1.",
  },
  {
    id: "ca-057",
    title: "Marginal Cost",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The marginal cost is the derivative of the total cost function with respect to quantity.\n\nGiven cost coefficients as a polynomial C(q) = sum(coeffs[i] * q^i), return C'(q) evaluated at q. Assume q >= 0.",
    starterCode: `def marginal_cost(coeffs, q):
    # Your code here
    pass`,
    solution: `def marginal_cost(coeffs, q):
    return sum(i * c * q ** (i - 1) for i, c in enumerate(coeffs) if i > 0)`,
    testCases: [
      { input: [[100, 5, 1], 10], expected: 25.0 },
      { input: [[50, 2], 3], expected: 2.0 },
      { input: [[0, 0, 0, 1], 2], expected: 12.0 },
      { input: [[1000], 5], expected: 0.0 },
    ],
    hint: "Differentiate each term of the cost polynomial and evaluate at q.",
  },
  {
    id: "ca-058",
    title: "Related Rates Circle Area",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A circle has radius r and its radius is changing at rate drdt.\n\nSince A = pi * r^2, the chain rule gives dA/dt = 2 * pi * r * (dr/dt). Return that rate, using pi = 3.141592653589793.",
    starterCode: `def related_rates_area(r, drdt):
    # Your code here
    pass`,
    solution: `def related_rates_area(r, drdt):
    return 2.0 * 3.141592653589793 * r * drdt`,
    testCases: [
      { input: [5, 0.1], expected: 3.141592653589793 },
      { input: [1, 1], expected: 6.283185307179586 },
      { input: [0, 5], expected: 0.0 },
      { input: [2.5, -0.4], expected: -6.283185307179586 },
    ],
    hint: "Differentiate A = pi r^2 with respect to time and use the chain rule.",
  },
  {
    id: "ca-059",
    title: "Characteristic Equation Roots",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Find the roots of the characteristic equation lambda^2 + b*lambda + c = 0.\n\nReturn both real roots sorted in ascending order. If the discriminant b^2 - 4*c is negative, return an empty list. A repeated root is returned twice.",
    starterCode: `def char_roots(b, c):
    # Your code here
    pass`,
    solution: `def char_roots(b, c):
    disc = b * b - 4 * c
    if disc < 0:
        return []
    s = disc ** 0.5
    roots = [(-b - s) / 2.0, (-b + s) / 2.0]
    roots.sort()
    return roots`,
    testCases: [
      { input: [-5, 6], expected: [2.0, 3.0] },
      { input: [0, 1], expected: [] },
      { input: [2, 1], expected: [-1.0, -1.0] },
      { input: [-4, 4], expected: [2.0, 2.0] },
      { input: [3, 2], expected: [-2.0, -1.0] },
    ],
    hint: "Use the quadratic formula; the discriminant decides how many real roots exist.",
  },
  {
    id: "ca-060",
    title: "Maclaurin Polynomial for Exponential",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the degree-n Maclaurin polynomial of f(x) = e^x at the point x:\n\nP_n(x) = sum from k = 0 to n of x^k / k!\n\nBuild the terms iteratively rather than using a factorial library.",
    starterCode: `def maclaurin_exp(x, n):
    # Your code here
    pass`,
    solution: `def maclaurin_exp(x, n):
    total = 0.0
    term = 1.0
    for k in range(n + 1):
        total += term
        term *= x / (k + 1)
    return total`,
    testCases: [
      { input: [1, 5], expected: 2.7166666666666663 },
      { input: [0, 3], expected: 1.0 },
      { input: [2, 0], expected: 1.0 },
      { input: [-1, 4], expected: 0.37500000000000006 },
      { input: [1, 10], expected: 2.7182818011463845 },
    ],
    hint: "Each new term is the previous term times x / k; add as you go.",
  },
  {
    id: "ca-061",
    title: "Elasticity of Demand",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The price elasticity of demand is E(p) = (p / q(p)) * q'(p), where q(p) is the demand function.\n\nGiven q as a polynomial in p via coefficient list, return E(p). Assume q(p) != 0.",
    starterCode: `def elasticity(coeffs, p):
    # Your code here
    pass`,
    solution: `def elasticity(coeffs, p):
    q = sum(c * p ** i for i, c in enumerate(coeffs))
    dq = sum(i * c * p ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return p * dq / q`,
    testCases: [
      { input: [[100, -2], 20], expected: -0.6666666666666666 },
      { input: [[0, -1], 5], expected: 1.0 },
      { input: [[50, 0, -1], 5], expected: -2.0 },
      { input: [[10], 2], expected: 0.0 },
    ],
    hint: "It is the ratio of the percentage change in quantity to the percentage change in price.",
  },
  {
    id: "ca-062",
    title: "Rectangle Max Area",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A rectangle has a fixed perimeter P. Maximize its area A = w * h subject to 2*(w + h) = P.\n\nThe optimum is a square, so return (P / 4)^2. Assume P >= 0.",
    starterCode: `def max_rectangle_area(perimeter):
    # Your code here
    pass`,
    solution: `def max_rectangle_area(perimeter):
    return (perimeter / 4.0) ** 2`,
    testCases: [
      { input: [20], expected: 25.0 },
      { input: [4], expected: 1.0 },
      { input: [0], expected: 0.0 },
      { input: [10], expected: 6.25 },
      { input: [2.4], expected: 0.36 },
    ],
    hint: "Substitute h = P/2 - w into the area and maximize the resulting quadratic.",
  },
  {
    id: "ca-063",
    title: "Newton Cooling Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Newton's law of cooling gives T(t) = T_a + (T_0 - T_a) * e^(-k*t), where T_a is the ambient temperature and k the cooling constant.\n\nGiven t, initial temperature t0, ambient temperature ta, and rate k, return T(t).",
    starterCode: `def newton_cooling(t, t0, ta, k):
    # Your code here
    pass`,
    solution: `def newton_cooling(t, t0, ta, k):
    import math
    return ta + (t0 - ta) * math.exp(-k * t)`,
    testCases: [
      { input: [0, 100, 20, 0.1], expected: 100.0 },
      { input: [10, 100, 20, 0.1], expected: 49.43035529371539 },
      { input: [5, 50, 25, 0], expected: 50.0 },
      { input: [2, 30, 30, 1], expected: 30.0 },
    ],
    hint: "At t = 0 the temperature is t0, and as t grows it approaches the ambient temperature.",
  },
  {
    id: "ca-064",
    title: "Logistic Growth Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The logistic model has the closed-form solution y(t) = K / (1 + ((K - y0) / y0) * e^(-r*t)), where K is the carrying capacity and r the growth rate.\n\nGiven t, initial population y0 > 0, capacity k, and rate r, return y(t).",
    starterCode: `def logistic_value(t, y0, k, r):
    # Your code here
    pass`,
    solution: `def logistic_value(t, y0, k, r):
    import math
    return k / (1.0 + ((k - y0) / y0) * math.exp(-r * t))`,
    testCases: [
      { input: [0, 10, 100, 1], expected: 10.0 },
      { input: [10, 100, 100, 1], expected: 100.0 },
      { input: [1, 10, 100, 1], expected: 23.19693166840739 },
      { input: [5, 50, 100, 0.5], expected: 92.41418199787564 },
    ],
    hint: "At t = 0 the exponential equals 1, so y = y0; large t drives y toward K.",
  },
  {
    id: "ca-065",
    title: "ODE Separation Solution Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Solve the separable ODE y' = k*y with y(0) = y0 and evaluate the solution at x.\n\nSeparating variables gives y(x) = y0 * e^(k*x). Use the given initial value y0.",
    starterCode: `def separation_value(y0, k, x):
    # Your code here
    pass`,
    solution: `def separation_value(y0, k, x):
    import math
    return y0 * math.exp(k * x)`,
    testCases: [
      { input: [1, 1, 0], expected: 1.0 },
      { input: [2, 0, 5], expected: 2.0 },
      { input: [1, -1, 1], expected: 0.36787944117144233 },
      { input: [3, 2, 0.5], expected: 8.154845485377136 },
      { input: [0, 5, 3], expected: 0.0 },
    ],
    hint: "Integrate dy / y = k dx and exponentiate both sides.",
  },
  {
    id: "ca-066",
    title: "Jacobian of Affine Map",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The affine map T(x, y) = (a*x + b*y + e, c*x + d*y + f) has a constant Jacobian matrix, since translations do not affect derivatives.\n\nReturn the 2x2 Jacobian [[dT1/dx, dT1/dy], [dT2/dx, dT2/dy]] as a nested list of floats.",
    starterCode: `def jacobian_affine(a, b, c, d, e, f):
    # Return [[a, b], [c, d]] as floats
    # Your code here
    pass`,
    solution: `def jacobian_affine(a, b, c, d, e, f):
    return [[float(a), float(b)], [float(c), float(d)]]`,
    testCases: [
      { input: [1, 2, 3, 4, 5, 6], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [1, 0, 0, 1, 0, 0], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [0, 0, 0, 0, 7, -3], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [-1, 2.5, 0, 3, 1, 1], expected: [[-1.0, 2.5], [0.0, 3.0]] },
    ],
    hint: "Differentiate each output component with respect to each input variable.",
  },
  {
    id: "ca-067",
    title: "Mixed Partial Finite Difference",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the mixed partial derivative of f(x, y) = x^m * y^n at (x, y) with the four-point central stencil:\n\nf_xy ≈ (f(x+h, y+h) - f(x+h, y-h) - f(x-h, y+h) + f(x-h, y-h)) / (4*h^2)\n\nUse h = 1e-4. The analytic value is m*n*x^(m-1)*y^(n-1).",
    starterCode: `def mixed_partial(m, n, x, y, h=1e-4):
    # f(x, y) = x**m * y**n
    # Your code here
    pass`,
    solution: `def mixed_partial(m, n, x, y, h=1e-4):
    def f(u, v):
        return u ** m * v ** n
    return (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h)`,
    testCases: [
      { input: [2, 3, 1, 2], expected: 24.00000003177638 },
      { input: [1, 1, 3, 4], expected: 1.00000003833145 },
      { input: [2, 2, 0, 5], expected: 0.0 },
      { input: [3, 1, 2, 1], expected: 12.00000001588819 },
    ],
    hint: "The stencil is a symmetric cross difference; divide by 4 h squared.",
  },
  {
    id: "ca-068",
    title: "Gradient Descent Two Steps",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Run two gradient descent steps on f(x, y) = a*x^2 + b*y^2 + c*x*y starting from point, with learning rate lr.\n\nThe gradient is [2*a*x + c*y, 2*b*y + c*x]. At each step move the point against the gradient computed at the current location, and return the final point as [x, y].",
    starterCode: `def gradient_descent_two(point, lr, a, b, c):
    # Return the point after two steps
    # Your code here
    pass`,
    solution: `def gradient_descent_two(point, lr, a, b, c):
    x = point[0]
    y = point[1]
    for _ in range(2):
        gx = 2 * a * x + c * y
        gy = 2 * b * y + c * x
        x = x - lr * gx
        y = y - lr * gy
    return [x, y]`,
    testCases: [
      { input: [[1, 1], 0.1, 1, 1, 0], expected: [0.64, 0.64] },
      { input: [[2, 0], 0.25, 1, 1, 0], expected: [0.5, 0.0] },
      { input: [[0, 0], 0.5, 1, 1, 0], expected: [0.0, 0.0] },
      { input: [[1, 2], 0, 1, 1, 0], expected: [1.0, 2.0] },
      { input: [[1, 1], 0.5, 0, 0, 1], expected: [0.25, 0.25] },
    ],
    hint: "Recompute the gradient at the new point before taking the second step.",
  },
  {
    id: "ca-069",
    title: "Hessian Determinant",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x, y) = a*x^2 + b*x*y + c*y^2 the Hessian is the constant matrix [[2a, b], [b, 2c]].\n\nReturn its determinant 4*a*c - b^2, which distinguishes minima, maxima, and saddle points.",
    starterCode: `def hessian_determinant(a, b, c):
    # Your code here
    pass`,
    solution: `def hessian_determinant(a, b, c):
    return 4 * a * c - b * b`,
    testCases: [
      { input: [1, 2, 3], expected: 8.0 },
      { input: [1, 0, 1], expected: 4.0 },
      { input: [1, 2, 2], expected: 4.0 },
      { input: [0, 1, 0], expected: -1.0 },
      { input: [2, 4, 2], expected: 0.0 },
    ],
    hint: "For a 2x2 matrix [[p, q], [q, r]] the determinant is p*r - q^2.",
  },
  {
    id: "ca-070",
    title: "Eigenvalues of 2x2 Hessian",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the eigenvalues of the symmetric matrix H = [[p, q], [q, r]].\n\nThey are (p + r ± sqrt((p - r)^2 + 4*q^2)) / 2. Return them sorted in ascending order.",
    starterCode: `def hessian_eigenvalues(p, q, r):
    # Return [smaller, larger]
    # Your code here
    pass`,
    solution: `def hessian_eigenvalues(p, q, r):
    disc = ((p - r) ** 2 + 4 * q * q) ** 0.5
    return [(p + r - disc) / 2.0, (p + r + disc) / 2.0]`,
    testCases: [
      { input: [2, 0, 2], expected: [2.0, 2.0] },
      { input: [4, 1, 4], expected: [3.0, 5.0] },
      { input: [1, 2, 1], expected: [-1.0, 3.0] },
      { input: [-2, 0, -8], expected: [-8.0, -2.0] },
      { input: [3, 4, 3], expected: [-1.0, 7.0] },
    ],
    hint: "Symmetric matrices have real eigenvalues; use the discriminant formula and sort.",
  },
  {
    id: "ca-071",
    title: "Saddle Point Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Classify the critical point of a quadratic whose Hessian is H = [[p, q], [q, r]] at that point.\n\nLet det = p*r - q^2. Return \"saddle\" if det < 0, \"minimum\" if det > 0 and p > 0, \"maximum\" if det > 0 and p < 0, and \"degenerate\" if det == 0.",
    starterCode: `def saddle_check(p, q, r):
    # Return "minimum", "maximum", "saddle", or "degenerate"
    # Your code here
    pass`,
    solution: `def saddle_check(p, q, r):
    det = p * r - q * q
    if det < 0:
        return "saddle"
    if det > 0:
        if p > 0:
            return "minimum"
        return "maximum"
    return "degenerate"`,
    testCases: [
      { input: [2, 0, 2], expected: "minimum" },
      { input: [-2, 0, -2], expected: "maximum" },
      { input: [1, 2, 1], expected: "saddle" },
      { input: [0, 0, 0], expected: "degenerate" },
      { input: [3, 1, 1], expected: "minimum" },
    ],
    hint: "The second derivative test uses the determinant and the sign of H_xx.",
  },
  {
    id: "ca-072",
    title: "Convexity Check via Hessian",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "A twice-differentiable function of two variables is convex when its Hessian is positive semidefinite everywhere.\n\nFor the constant Hessian H = [[p, q], [q, r]], this holds exactly when p >= 0, r >= 0, and p*r - q^2 >= 0. Return a boolean.",
    starterCode: `def is_convex_hessian(p, q, r):
    # Return True if H is positive semidefinite
    # Your code here
    pass`,
    solution: `def is_convex_hessian(p, q, r):
    return p >= 0 and r >= 0 and p * r - q * q >= 0`,
    testCases: [
      { input: [2, 0, 2], expected: true },
      { input: [2, 3, 2], expected: false },
      { input: [0, 0, 0], expected: true },
      { input: [1, 1, 1], expected: true },
      { input: [-1, 0, 1], expected: false },
    ],
    hint: "Sylvester's criterion for a 2x2 symmetric matrix: all leading principal minors are nonnegative.",
  },
  {
    id: "ca-073",
    title: "Gradient of Softmax Row",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the softmax vector s(x) with s_i = exp(x_i) / sum(exp(x_j)), the derivative of component i with respect to component j is s_i * (delta_ij - s_j).\n\nReturn row i of the Jacobian as a list over j, where delta_ij is 1 when i == j and 0 otherwise. Use max subtraction for stability.",
    starterCode: `def softmax_gradient_row(x, i):
    # Return [ds_i/dx_j for each j]
    # Your code here
    pass`,
    solution: `def softmax_gradient_row(x, i):
    import math
    m = max(x)
    e = [math.exp(v - m) for v in x]
    s = sum(e)
    sm = [v / s for v in e]
    si = sm[i]
    return [si * ((1.0 if i == j else 0.0) - sm[j]) for j in range(len(x))]`,
    testCases: [
      { input: [[0, 0], 0], expected: [0.25, -0.25] },
      { input: [[0, 1], 1], expected: [-0.19661193324148185, 0.19661193324148185] },
      {
        input: [[1, 1, 1], 2],
        expected: [-0.1111111111111111, -0.1111111111111111, 0.22222222222222224],
      },
      { input: [[2, -1], 0], expected: [0.045176659730912, -0.045176659730912144] },
    ],
    hint: "Compute the full softmax first, then apply s_i * (delta - s_j) entrywise.",
  },
  {
    id: "ca-074",
    title: "Jacobian of Polar Coordinates",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The polar map is (r, theta) -> (x, y) = (r*cos(theta), r*sin(theta)).\n\nReturn its 2x2 Jacobian [[dx/dr, dx/dtheta], [dy/dr, dy/dtheta]] = [[cos(theta), -r*sin(theta)], [sin(theta), r*cos(theta)]] evaluated at (r, theta). Theta is in radians.",
    starterCode: `def polar_jacobian(r, theta):
    # Return the 2x2 Jacobian
    # Your code here
    pass`,
    solution: `def polar_jacobian(r, theta):
    import math
    return [[math.cos(theta), -r * math.sin(theta)], [math.sin(theta), r * math.cos(theta)]]`,
    testCases: [
      { input: [2, 0], expected: [[1.0, 0.0], [0.0, 2.0]] },
      { input: [1, 1.5707963267948966], expected: [[0.0, -1.0], [1.0, 0.0]] },
      { input: [3, 3.141592653589793], expected: [[-1.0, 0.0], [0.0, -3.0]] },
      {
        input: [0, 1],
        expected: [[0.5403023058681398, 0.0], [0.8414709848078965, 0.0]],
      },
    ],
    hint: "Differentiate x and y with respect to r and theta; the determinant equals r.",
  },
  {
    id: "ca-075",
    title: "Change of Variables Integral",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Integrate the linear function f(x, y) = a*x + b*y over the parallelogram spanned by the vectors u = (u1, u2) and v = (v1, v2) from the origin.\n\nThe substitution (x, y) = s*u + t*v maps the unit square to the parallelogram with Jacobian determinant |u1*v2 - u2*v1|. Since f is linear, the average over the unit square is (f(u) + f(v)) / 2.",
    starterCode: `def change_of_variables(a, b, u1, u2, v1, v2):
    # Your code here
    pass`,
    solution: `def change_of_variables(a, b, u1, u2, v1, v2):
    det = u1 * v2 - u2 * v1
    fu = a * u1 + b * u2
    fv = a * v1 + b * v2
    return abs(det) * (fu + fv) / 2.0`,
    testCases: [
      { input: [1, 0, 1, 0, 0, 1], expected: 0.5 },
      { input: [1, 0, 2, 0, 0, 3], expected: 6.0 },
      { input: [1, 1, 1, 1, 1, -1], expected: 2.0 },
      { input: [0, 1, 1, 0, 0, 2], expected: 2.0 },
    ],
    hint: "Multiply the average value of f on the unit square by the absolute Jacobian determinant.",
  },
  {
    id: "ca-076",
    title: "Curl of 3D Vector Field",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the vector field F(x, y, z) = [a*y*z, b*z*x, c*x*y], compute the full curl vector at (x, y, z).\n\ncurl F = [dR/dy - dQ/dz, dP/dz - dR/dx, dQ/dx - dP/dy] = [x*(c - b), y*(a - c), z*(b - a)].",
    starterCode: `def curl3d(a, b, c, x, y, z):
    # Return the curl vector
    # Your code here
    pass`,
    solution: `def curl3d(a, b, c, x, y, z):
    return [x * (c - b), y * (a - c), z * (b - a)]`,
    testCases: [
      { input: [1, 1, 1, 2, 3, 4], expected: [0.0, 0.0, 0.0] },
      { input: [1, 2, 3, 1, 1, 1], expected: [1.0, -2.0, 1.0] },
      { input: [0, 0, 1, 2, 0, 5], expected: [2.0, 0.0, 0.0] },
      { input: [2, -1, 4, 0, 3, 2], expected: [0.0, -6.0, -6.0] },
    ],
    hint: "Each curl component pairs one partial of the field components in cyclic order.",
  },
  {
    id: "ca-077",
    title: "Divergence Theorem Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The divergence theorem says the outward flux of F across a closed surface equals the integral of div F over the enclosed region.\n\nFor F(x, y) = [a*x + b*y, c*x + d*y] and the rectangle [0, w] x [0, h], the divergence is the constant a + d, so the flux is (a + d) * w * h.",
    starterCode: `def divergence_theorem_check(a, b, c, d, w, h):
    # Return the flux through the rectangle boundary
    # Your code here
    pass`,
    solution: `def divergence_theorem_check(a, b, c, d, w, h):
    return (a + d) * w * h`,
    testCases: [
      { input: [1, 0, 0, 1, 1, 1], expected: 2.0 },
      { input: [2, 5, -3, 1, 3, 2], expected: 18.0 },
      { input: [0, 0, 0, 0, 5, 5], expected: 0.0 },
      { input: [-1, 0, 0, 1, 2, 4], expected: 0.0 },
    ],
    hint: "Integrate the constant divergence over the area of the rectangle.",
  },
  {
    id: "ca-078",
    title: "Conservative Potential Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The field F(x, y) = [a*x + b*y, b*x + c*y] is conservative because its Jacobian is symmetric.\n\nFind the potential phi with phi(0, 0) = 0 and return phi(x, y) = 0.5*a*x^2 + b*x*y + 0.5*c*y^2.",
    starterCode: `def potential_value(a, b, c, x, y):
    # Your code here
    pass`,
    solution: `def potential_value(a, b, c, x, y):
    return 0.5 * a * x * x + b * x * y + 0.5 * c * y * y`,
    testCases: [
      { input: [2, 0, 2, 1, 1], expected: 2.0 },
      { input: [4, 1, 2, 2, 3], expected: 23.0 },
      { input: [0, 0, 0, 5, 5], expected: 0.0 },
      { input: [-2, 3, 1, 1, -1], expected: -3.5 },
    ],
    hint: "Integrate the first component with respect to x, then match the second component.",
  },
  {
    id: "ca-079",
    title: "Shell Method",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The volume of the solid formed by rotating y = f(x) about the y-axis is V = 2*pi*integral of x*f(x) dx over [a, b].\n\nApproximate it with n midpoint rectangles: V ≈ 2*pi*dx*sum(x_mid * f(x_mid)) where f(x) = sum(coeffs[i] * x^i) and dx = (b - a) / n. Return 0.0 when n <= 0 and use 3.141592653589793 for pi.",
    starterCode: `def shell_method(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def shell_method(coeffs, a, b, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    if n <= 0:
        return 0.0
    dx = (b - a) / n
    total = 0.0
    for i in range(n):
        mid = a + (i + 0.5) * dx
        total += mid * f(mid)
    return 2.0 * 3.141592653589793 * total * dx`,
    testCases: [
      { input: [[2], 0, 3, 4], expected: 56.548667764616276 },
      { input: [[0, 1], 0, 2, 4], expected: 16.493361431346415 },
      { input: [[0], 0, 3, 4], expected: 0.0 },
      { input: [[1], 1, 3, 8], expected: 25.132741228718345 },
    ],
    hint: "Cylindrical shells have circumference 2 pi x, height f(x), and thickness dx.",
  },
  {
    id: "ca-080",
    title: "Improper Integral Quadrature",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the improper integral from 0 to infinity of e^(-a*x) dx by the trapezoidal rule on the truncated interval [0, t_max] with n equal subintervals.\n\nEndpoints get weight 0.5 and interior points weight 1; multiply the weighted sum by dx = t_max / n. Assume a > 0.",
    starterCode: `def improper_integral_exp(a, n, t_max):
    # Your code here
    pass`,
    solution: `def improper_integral_exp(a, n, t_max):
    import math
    dx = t_max / n
    total = 0.0
    for i in range(n + 1):
        w = 0.5 if (i == 0 or i == n) else 1.0
        total += w * math.exp(-a * i * dx)
    return total * dx`,
    testCases: [
      { input: [1, 100000, 50], expected: 1.000000020833246 },
      { input: [2, 100000, 50], expected: 0.5000000416666464 },
      { input: [0.5, 100000, 50], expected: 2.000000010388875 },
      { input: [3, 100000, 50], expected: 0.3333333958333172 },
    ],
    hint: "The exact value is 1 / a, and the truncation error decays like e^(-a * t_max).",
  },
  {
    id: "ca-081",
    title: "Gamma Function Values",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the gamma function at positive integers and half-integers using the recursion Gamma(x + 1) = x * Gamma(x) with base values Gamma(1) = 1 and Gamma(0.5) = sqrt(pi).\n\nReduce x by whole steps until x is 1 or 0.5, then return the accumulated product.",
    starterCode: `def gamma_value(x):
    # Only integer and half-integer inputs are supported
    # Your code here
    pass`,
    solution: `def gamma_value(x):
    import math
    result = 1.0
    while x > 1.0:
        x -= 1.0
        result *= x
    if x == 0.5:
        result *= math.sqrt(math.pi)
    return result`,
    testCases: [
      { input: [0.5], expected: 1.7724538509055159 },
      { input: [5], expected: 24.0 },
      { input: [2.5], expected: 1.329340388179137 },
      { input: [1], expected: 1.0 },
      { input: [3.5], expected: 3.323350970447842 },
    ],
    hint: "Gamma(n) = (n-1)! for integers, and each half-step multiplies by the preceding half-integer.",
  },
  {
    id: "ca-082",
    title: "Beta Function Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the beta function B(a, b) = Gamma(a) * Gamma(b) / Gamma(a + b) using the gamma recursion for integer and half-integer arguments.\n\nDefine a local gamma helper with Gamma(1) = 1 and Gamma(0.5) = sqrt(pi), then combine the three values.",
    starterCode: `def beta_value(a, b):
    # Your code here
    pass`,
    solution: `def beta_value(a, b):
    import math
    def gamma(x):
        result = 1.0
        while x > 1.0:
            x -= 1.0
            result *= x
        if x == 0.5:
            result *= math.sqrt(math.pi)
        return result
    return gamma(a) * gamma(b) / gamma(a + b)`,
    testCases: [
      { input: [1, 1], expected: 1.0 },
      { input: [2, 3], expected: 0.08333333333333333 },
      { input: [0.5, 0.5], expected: 3.1415926535897927 },
      { input: [3, 3], expected: 0.03333333333333333 },
      { input: [1, 5], expected: 0.2 },
    ],
    hint: "For integers, B(a, b) reduces to (a-1)! (b-1)! / (a+b-1)!.",
  },
  {
    id: "ca-083",
    title: "Error Function Series",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the error function with its Maclaurin series to n terms:\n\nerf(x) ≈ (2 / sqrt(pi)) * sum from k = 0 to n-1 of (-1)^k * x^(2k+1) / (k! * (2k+1))\n\nAccumulate the terms iteratively. Large x or small n will be inaccurate because the series converges slowly.",
    starterCode: `def erf_series(x, n):
    # Your code here
    pass`,
    solution: `def erf_series(x, n):
    import math
    total = 0.0
    term = x
    for k in range(n):
        total += term / (2 * k + 1)
        term *= -(x * x) / (k + 1)
    return 2.0 * total / math.sqrt(math.pi)`,
    testCases: [
      { input: [0, 5], expected: 0.0 },
      { input: [1, 20], expected: 0.8427007929497149 },
      { input: [-1, 20], expected: -0.8427007929497149 },
      { input: [0.5, 15], expected: 0.5204998778130466 },
    ],
    hint: "Each term changes by a factor of -x^2 / (k+1); divide by 2k+1 before adding.",
  },
  {
    id: "ca-084",
    title: "Taylor Series ln(1+x)",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the degree-n Taylor polynomial of ln(1 + x) about 0:\n\nP_n(x) = sum from k = 1 to n of (-1)^(k+1) * x^k / k\n\nThe series converges for -1 < x <= 1; for x = 1 convergence is slow, so the partial sum may differ noticeably from ln(2).",
    starterCode: `def ln1p_series(x, n):
    # Your code here
    pass`,
    solution: `def ln1p_series(x, n):
    total = 0.0
    power = x
    for k in range(1, n + 1):
        total += ((-1) ** (k + 1)) * power / k
        power *= x
    return total`,
    testCases: [
      { input: [0, 10], expected: 0.0 },
      { input: [0.5, 20], expected: 0.4054650927341771 },
      { input: [-0.5, 20], expected: -0.6931471370510288 },
      { input: [0.25, 15], expected: 0.22314355132599137 },
      { input: [0.5, 4], expected: 0.4010416666666667 },
    ],
    hint: "Track the running power of x and alternate the sign of each term.",
  },
  {
    id: "ca-085",
    title: "Arctan Series",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the Gregory series for arctan(x) to n terms:\n\narctan(x) ≈ sum from k = 0 to n-1 of (-1)^k * x^(2k+1) / (2k+1)\n\nThe series converges quickly for |x| < 1 but very slowly near x = 1, so partial sums there lag the true value.",
    starterCode: `def arctan_series(x, n):
    # Your code here
    pass`,
    solution: `def arctan_series(x, n):
    total = 0.0
    power = x
    for k in range(n):
        total += ((-1) ** k) * power / (2 * k + 1)
        power *= x * x
    return total`,
    testCases: [
      { input: [0, 5], expected: 0.0 },
      { input: [0.5, 20], expected: 0.46364760900079693 },
      { input: [-0.5, 20], expected: -0.46364760900079693 },
      { input: [0.25, 10], expected: 0.24497866312685385 },
      { input: [1, 10], expected: 0.7604599047323508 },
    ],
    hint: "Only odd powers appear; multiply the running power by x squared each step.",
  },
  {
    id: "ca-086",
    title: "Fourier Sine Coefficient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x) = x on the interval (0, pi), the Fourier sine coefficients are b_n = (2/pi) * integral from 0 to pi of x*sin(n*x) dx.\n\nIntegration by parts gives b_n = 2 * (-1)^(n+1) / n. Return b_n for a given positive integer n.",
    starterCode: `def fourier_sine_x(n):
    # Your code here
    pass`,
    solution: `def fourier_sine_x(n):
    return 2.0 * ((-1) ** (n + 1)) / n`,
    testCases: [
      { input: [1], expected: 2.0 },
      { input: [2], expected: -1.0 },
      { input: [3], expected: 0.6666666666666666 },
      { input: [4], expected: -0.5 },
      { input: [5], expected: 0.4 },
    ],
    hint: "The integral of x sin(nx) over one period produces a factor cos(n*pi) = (-1)^n.",
  },
  {
    id: "ca-087",
    title: "Double Integral Polar Midpoint",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Approximate a double integral in polar coordinates with the midpoint rule.\n\ngrid[i][j] holds f sampled at the midpoint of radial cell i and angular cell j, where radial midpoints are r0 + (i + 0.5)*dr. In polar coordinates dA = r dr dtheta, so the sum is multiplied by r_mid * dr * dtheta. Return 0.0 for an empty grid.",
    starterCode: `def double_polar_midpoint(grid, r0, dr, dtheta):
    # Your code here
    pass`,
    solution: `def double_polar_midpoint(grid, r0, dr, dtheta):
    total = 0.0
    for i, row in enumerate(grid):
        r_mid = r0 + (i + 0.5) * dr
        for value in row:
            total += value * r_mid
    return total * dr * dtheta`,
    testCases: [
      { input: [[[1, 1], [1, 1]], 0, 1, 1.5707963267948966], expected: 6.283185307179586 },
      { input: [[[1]], 0, 1, 6.283185307179586], expected: 3.141592653589793 },
      { input: [[[1, 1]], 1, 1, 3.141592653589793], expected: 9.42477796076938 },
      { input: [[[0, 0], [0, 0]], 0, 1, 1], expected: 0.0 },
      { input: [[[1, 2], [3, 4]], 0, 0.5, 1], expected: 3.0 },
    ],
    hint: "The Jacobian factor r depends on the radial cell, not on the angle.",
  },
  {
    id: "ca-088",
    title: "Lagrange Multiplier on a Circle",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Maximize f(x, y) = a*x + b*y on the circle x^2 + y^2 = r^2.\n\nThe Lagrange condition makes the gradient (a, b) parallel to (x, y), so the maximizer is (r*a, r*b) / sqrt(a^2 + b^2) and the maximum value is r * sqrt(a^2 + b^2). Return [x, y, max]. If a = b = 0, return [0.0, 0.0, 0.0].",
    starterCode: `def lagrange_circle(a, b, r):
    # Return [x, y, max_value]
    # Your code here
    pass`,
    solution: `def lagrange_circle(a, b, r):
    norm = (a * a + b * b) ** 0.5
    if norm == 0:
        return [0.0, 0.0, 0.0]
    return [r * a / norm, r * b / norm, r * norm]`,
    testCases: [
      { input: [3, 4, 1], expected: [0.6, 0.8, 5.0] },
      { input: [1, 0, 2], expected: [2.0, 0.0, 2.0] },
      { input: [0, 1, 3], expected: [0.0, 3.0, 3.0] },
      {
        input: [1, 1, 2],
        expected: [1.414213562373095, 1.414213562373095, 2.8284271247461903],
      },
      { input: [0, 0, 5], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The maximum of a linear function on a circle is the radius times the gradient norm.",
  },
  {
    id: "ca-089",
    title: "Cylinder Min Surface",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Minimize the total surface area S = 2*pi*r^2 + 2*pi*r*h of a closed cylinder with fixed volume V = pi*r^2*h.\n\nSubstituting h = V / (pi*r^2) gives S(r) = 2*pi*r^2 + 2*V/r, minimized at r = (V / (2*pi))^(1/3). Return [r, h, S_min]. For V <= 0 return [0.0, 0.0, 0.0]. Use 3.141592653589793 for pi.",
    starterCode: `def cylinder_min_surface(v):
    # Return [radius, height, min_surface_area]
    # Your code here
    pass`,
    solution: `def cylinder_min_surface(v):
    if v <= 0:
        return [0.0, 0.0, 0.0]
    pi = 3.141592653589793
    r = (v / (2.0 * pi)) ** (1.0 / 3.0)
    h = v / (pi * r * r)
    s = 2.0 * pi * r * r + 2.0 * pi * r * h
    return [r, h, s]`,
    testCases: [
      { input: [6.283185307179586], expected: [1.0, 2.0, 18.84955592153876] },
      { input: [50.26548245743669], expected: [2.0, 4.0, 75.39822368615503] },
      { input: [169.64600329384882], expected: [3.0, 6.0, 169.64600329384882] },
      { input: [0], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "At the optimum the height equals the diameter, h = 2r.",
  },
  {
    id: "ca-090",
    title: "Convolution Numeric",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Approximate the convolution (f * g)(t) = integral of f(tau) * g(t - tau) dtau at the grid point t = k*dt.\n\nf[i] = f(i*dt) and g[j] = g(j*dt). Sum f[i] * g[k-i] over all i where 0 <= k - i < len(g), then multiply by dt to approximate the integral.",
    starterCode: `def convolution_sample(f, g, dt, k):
    # Your code here
    pass`,
    solution: `def convolution_sample(f, g, dt, k):
    total = 0.0
    for i in range(len(f)):
        j = k - i
        if 0 <= j < len(g):
            total += f[i] * g[j]
    return total * dt`,
    testCases: [
      { input: [[1, 2, 3], [1, 1, 1], 1, 2], expected: 6.0 },
      { input: [[1, 0, 0], [1, 2, 3], 1, 1], expected: 2.0 },
      { input: [[1, 2], [3, 4], 0.5, 1], expected: 5.0 },
      { input: [[1, 1, 1, 1], [1, 1], 0.25, 3], expected: 0.5 },
      { input: [[0, 0], [1, 1], 1, 0], expected: 0.0 },
    ],
    hint: "Only index pairs that stay inside both arrays contribute to the sum.",
  },
  {
    id: "ca-091",
    title: "Fourier Series Square Wave Value",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The square wave of amplitude 1 has the Fourier series (4/pi) * sum over odd k of sin(k*x) / k.\n\nEvaluate the partial sum including all odd k from 1 through n at the point x (radians). Near the jump the partial sum overshoots (the Gibbs phenomenon).",
    starterCode: `def square_wave_value(x, n):
    # Your code here
    pass`,
    solution: `def square_wave_value(x, n):
    import math
    total = 0.0
    k = 1
    while k <= n:
        total += math.sin(k * x) / k
        k += 2
    return 4.0 * total / math.pi`,
    testCases: [
      { input: [0, 99], expected: 0.0 },
      { input: [1.5707963267948966, 99], expected: 0.9936344385781744 },
      { input: [0.5235987755982988, 9], expected: 0.9559401661265586 },
      { input: [3.141592653589793, 99], expected: 0.0 },
    ],
    hint: "Iterate k = 1, 3, 5, ... up to n and accumulate sin(k x) / k.",
  },
  {
    id: "ca-092",
    title: "Fourier Cosine Coefficient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x) = x on the interval (0, pi), the Fourier cosine coefficients are a_n = (2/pi) * integral from 0 to pi of x*cos(n*x) dx.\n\nIntegration by parts gives a_n = 2 * ((-1)^n - 1) / (pi * n^2). Return a_n for a given positive integer n, using 3.141592653589793 for pi.",
    starterCode: `def fourier_cosine_x(n):
    # Your code here
    pass`,
    solution: `def fourier_cosine_x(n):
    return 2.0 * (((-1) ** n) - 1) / (3.141592653589793 * n * n)`,
    testCases: [
      { input: [1], expected: -1.2732395447351628 },
      { input: [2], expected: 0.0 },
      { input: [3], expected: -0.1414710605261292 },
      { input: [4], expected: 0.0 },
      { input: [5], expected: -0.05092958178940651 },
    ],
    hint: "Odd coefficients vanish because the boundary term alternates sign: cos(n*pi) - 1.",
  },
  {
    id: "ca-093",
    title: "Inverse Laplace Two Poles",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The inverse Laplace transform of F(s) = 1 / ((s - a) * (s - b)) with a != b is\n\nf(t) = (e^(a*t) - e^(b*t)) / (a - b)\n\nThis comes from partial fractions. Given a, b, and t, return f(t).",
    starterCode: `def inverse_laplace_two_poles(a, b, t):
    # Your code here
    pass`,
    solution: `def inverse_laplace_two_poles(a, b, t):
    import math
    return (math.exp(a * t) - math.exp(b * t)) / (a - b)`,
    testCases: [
      { input: [1, -2, 0], expected: 0.0 },
      { input: [1, -2, 1], expected: 0.8609821817408108 },
      { input: [0, -1, 1], expected: 0.6321205588285577 },
      { input: [1, 3, 2], expected: 198.01986869690222 },
    ],
    hint: "Split 1 / ((s-a)(s-b)) into two simple poles before inverting.",
  },
  {
    id: "ca-094",
    title: "Damped Oscillator Value",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "The underdamped oscillator x'' + 2*zeta*omega*x' + omega^2*x = 0 with x(0) = x0, x'(0) = v0 has the solution\n\nx(t) = e^(-zeta*omega*t) * (x0*cos(wd*t) + ((v0 + zeta*omega*x0) / wd)*sin(wd*t))\n\nwhere the damped frequency is wd = omega*sqrt(1 - zeta^2). Assume 0 <= zeta < 1 and omega > 0.",
    starterCode: `def damped_value(t, x0, v0, zeta, omega):
    # Your code here
    pass`,
    solution: `def damped_value(t, x0, v0, zeta, omega):
    import math
    wd = omega * (1.0 - zeta * zeta) ** 0.5
    return math.exp(-zeta * omega * t) * (
        x0 * math.cos(wd * t) + ((v0 + zeta * omega * x0) / wd) * math.sin(wd * t)
    )`,
    testCases: [
      { input: [0, 1, 0, 0.5, 2], expected: 1.0 },
      { input: [1.5707963267948966, 1, 0, 0, 1], expected: 0.0 },
      { input: [0.7853981633974483, 0, 1, 0, 2], expected: 0.5 },
      { input: [1, 1, 0, 0.5, 2], expected: 0.15057436514588768 },
      { input: [0.5, 2, 1, 0.25, 4], expected: 0.004960951560242762 },
    ],
    hint: "When zeta = 0 the formula reduces to simple harmonic motion with wd = omega.",
  },
  {
    id: "ca-095",
    title: "Homogeneous ODE Solution Value",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Solve y'' + p*y' + q*y = 0 for the real distinct characteristic roots r1 != r2 with initial conditions y(0) = y0 and y'(0) = v0.\n\nThe solution is y(t) = C1*e^(r1*t) + C2*e^(r2*t) with C1 = (v0 - r2*y0) / (r1 - r2) and C2 = y0 - C1. Return y(t).",
    starterCode: `def homogeneous_ode_value(t, y0, v0, r1, r2):
    # Your code here
    pass`,
    solution: `def homogeneous_ode_value(t, y0, v0, r1, r2):
    import math
    c1 = (v0 - r2 * y0) / (r1 - r2)
    c2 = y0 - c1
    return c1 * math.exp(r1 * t) + c2 * math.exp(r2 * t)`,
    testCases: [
      { input: [0, 1, 0, -1, -2], expected: 1.0 },
      { input: [1, 1, 0, -1, -2], expected: 0.600423599106272 },
      { input: [1, 0, 1, 1, 3], expected: 8.683627547364312 },
      { input: [2, 2, -1, -1, 1], expected: 3.897530974320244 },
    ],
    hint: "The constants follow from y(0) = C1 + C2 and y'(0) = r1*C1 + r2*C2.",
  },
];
