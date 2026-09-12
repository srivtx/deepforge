import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-006",
    title: "Forward Difference Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate the derivative of f(x) = sum(coeffs[i] * x^i) at x using the forward difference quotient:\n\nf'(x) ≈ (f(x + h) - f(x)) / h\n\ncoeffs[i] is the coefficient of x^i and h defaults to 1e-6.",
    starterCode: `def forward_difference(coeffs, x, h=1e-6):
    # coeffs[i] is the coefficient of x^i
    # Your code here
    pass`,
    solution: `def forward_difference(coeffs, x, h=1e-6):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (f(x + h) - f(x)) / h`,
    testCases: [
      { input: [[1, 2, 1], 2], expected: 6.000001 },
      { input: [[0, 0, 2], -1], expected: -3.999998 },
      { input: [[7], 5], expected: 0.0 },
      { input: [[0, 3], 10], expected: 3.0 },
    ],
    hint: "Evaluate the polynomial at x and at x + h, then divide the difference by h.",
  },
  {
    id: "ca-007",
    title: "Second Derivative Central Difference",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate the second derivative of f(x) = sum(coeffs[i] * x^i) at x with the central difference formula:\n\nf''(x) ≈ (f(x + h) - 2 * f(x) + f(x - h)) / h^2\n\nUse the default step h = 1e-3.",
    starterCode: `def second_derivative(coeffs, x, h=1e-3):
    # coeffs[i] is the coefficient of x^i
    # Your code here
    pass`,
    solution: `def second_derivative(coeffs, x, h=1e-3):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h)`,
    testCases: [
      { input: [[1, 0, 1], 4], expected: 2.0 },
      { input: [[0, 0, 0, 2], 1], expected: 12.0 },
      { input: [[0, 0, 0, 1], 0], expected: 0.0 },
      { input: [[5], 3], expected: 0.0 },
    ],
    hint: "The numerator is a centered second difference; divide it by h squared.",
  },
  {
    id: "ca-008",
    title: "Riemann Sums Left and Right",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Given sampled function values on a uniform grid with spacing dx, return both the left and right Riemann sums as a list [left, right].\n\nleft = dx * sum(values[0:-1]) and right = dx * sum(values[1:]).\n\nIf fewer than two samples are supplied, both sums are 0.0.",
    starterCode: `def riemann_sums(values, dx):
    # Return [left_sum, right_sum]
    # Your code here
    pass`,
    solution: `def riemann_sums(values, dx):
    left = sum(values[:-1]) * dx
    right = sum(values[1:]) * dx
    return [left, right]`,
    testCases: [
      { input: [[1, 1, 1, 1], 0.5], expected: [1.5, 1.5] },
      { input: [[0, 1, 4, 9], 1], expected: [5.0, 14.0] },
      { input: [[2, 4, 8], 0.25], expected: [1.5, 3.0] },
      { input: [[3], 1], expected: [0.0, 0.0] },
    ],
    hint: "The left sum drops the final sample; the right sum drops the first sample.",
  },
  {
    id: "ca-009",
    title: "Midpoint Rule",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate a definite integral from function values sampled at the midpoints of n uniform subintervals.\n\nWith uniform spacing dx, midpoint = dx * sum(values).\n\nReturn 0.0 for an empty sample list.",
    starterCode: `def midpoint_rule(values, dx):
    # values are samples at subinterval midpoints
    # Your code here
    pass`,
    solution: `def midpoint_rule(values, dx):
    return sum(values) * dx`,
    testCases: [
      { input: [[1, 1, 1, 1], 0.25], expected: 1.0 },
      { input: [[0, 1, 4, 9], 1], expected: 14.0 },
      { input: [[1, 2, 3], 0.5], expected: 3.0 },
      { input: [[], 1.0], expected: 0.0 },
    ],
    hint: "Every sample already represents a whole subinterval, so just sum and scale by dx.",
  },
  {
    id: "ca-010",
    title: "Simpson Rule",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Apply Simpson's rule to uniformly spaced samples:\n\nintegral ≈ (dx / 3) * (v[0] + 4*v[1] + 2*v[2] + 4*v[3] + ... + v[n])\n\nwhere values has n + 1 entries and n is even. Return 0.0 when n <= 0 or n is odd.",
    starterCode: `def simpson_rule(values, dx):
    # values has an even number of intervals
    # Your code here
    pass`,
    solution: `def simpson_rule(values, dx):
    n = len(values) - 1
    if n <= 0 or n % 2 == 1:
        return 0.0
    total = values[0] + values[-1]
    for i in range(1, n):
        if i % 2 == 1:
            total += 4 * values[i]
        else:
            total += 2 * values[i]
    return total * dx / 3`,
    testCases: [
      { input: [[0, 0.25, 1, 2.25, 4], 0.5], expected: 2.6666666666666665 },
      { input: [[1, 1, 1, 1, 1], 0.5], expected: 2.0 },
      { input: [[0, 0, 0, 0, 0], 1], expected: 0.0 },
      { input: [[1, 1, 1], 1], expected: 2.0 },
      { input: [[1, 1], 1], expected: 0.0 },
    ],
    hint: "Odd-indexed interior samples get weight 4, even-indexed interior samples get weight 2.",
  },
  {
    id: "ca-011",
    title: "Average Value of a Function",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Compute the average value of the polynomial f(x) = sum(coeffs[i] * x^i) on [a, b]:\n\navg = (1 / (b - a)) * integral of f from a to b\n\nIntegrate term by term using the power rule. Assume a != b.",
    starterCode: `def average_value(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def average_value(coeffs, a, b):
    total = 0.0
    for i, c in enumerate(coeffs):
        total += c * (b ** (i + 1) - a ** (i + 1)) / (i + 1)
    return total / (b - a)`,
    testCases: [
      { input: [[0, 0, 3], 0, 2], expected: 4.0 },
      { input: [[1, 2, 1], 0, 1], expected: 2.3333333333333335 },
      { input: [[4], 1, 5], expected: 4.0 },
      { input: [[0, 1], -1, 1], expected: 0.0 },
      { input: [[0, 0, 0, 1], 0, 2], expected: 2.0 },
    ],
    hint: "The antiderivative term for c * x^i is c * x^(i+1) / (i+1).",
  },
  {
    id: "ca-012",
    title: "Tangent Line at a Point",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the tangent line to f(x) = sum(coeffs[i] * x^i) at x0 as [slope, intercept].\n\nslope = f'(x0) and intercept = f(x0) - slope * x0, so the line is y = slope * x + intercept.",
    starterCode: `def tangent_line(coeffs, x0):
    # Return [slope, intercept]
    # Your code here
    pass`,
    solution: `def tangent_line(coeffs, x0):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def df(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    slope = df(x0)
    intercept = f(x0) - slope * x0
    return [slope, intercept]`,
    testCases: [
      { input: [[0, 0, 1], 3], expected: [6.0, -9.0] },
      { input: [[1, 2, 3], 2], expected: [14.0, -11.0] },
      { input: [[5], 1], expected: [0.0, 5.0] },
      { input: [[0, 1], 0], expected: [1.0, 0.0] },
    ],
    hint: "Differentiate term by term, then shift the line down by slope * x0 to get the intercept.",
  },
  {
    id: "ca-013",
    title: "Normal Line Slope",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the slope of the line normal to f(x) = sum(coeffs[i] * x^i) at x0.\n\nThe normal slope is -1 / f'(x0). If f'(x0) == 0 the normal is vertical and the function returns None.",
    starterCode: `def normal_slope(coeffs, x0):
    # Return None when f'(x0) == 0
    # Your code here
    pass`,
    solution: `def normal_slope(coeffs, x0):
    def df(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    d = df(x0)
    if d == 0:
        return None
    return -1.0 / d`,
    testCases: [
      { input: [[0, 0, 1], 2], expected: -0.25 },
      { input: [[1, 2, 1], 0], expected: -0.5 },
      { input: [[5], 1], expected: null },
      { input: [[0, 3], 4], expected: -0.3333333333333333 },
    ],
    hint: "Perpendicular slopes multiply to -1, so take the negative reciprocal.",
  },
  {
    id: "ca-014",
    title: "Linearization Approximation",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the linearization (tangent line approximation) of f(x) = sum(coeffs[i] * x^i) centered at a, at the point x:\n\nL(x) = f(a) + f'(a) * (x - a)",
    starterCode: `def linearization(coeffs, a, x):
    # Your code here
    pass`,
    solution: `def linearization(coeffs, a, x):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def df(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return f(a) + df(a) * (x - a)`,
    testCases: [
      { input: [[0, 0, 1], 4, 4.1], expected: 16.8 },
      { input: [[1, 0, 0, 1], 2, 2.5], expected: 15.0 },
      { input: [[0, 0, 0, 1], 0, 0.1], expected: 0.0 },
      { input: [[2, 3], 0, 5], expected: 17.0 },
    ],
    hint: "This is just the tangent line evaluated at x instead of returned as coefficients.",
  },
  {
    id: "ca-015",
    title: "Directional Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Compute the directional derivative of a scalar field at a point given its gradient and a direction vector.\n\nNormalize the direction and take the dot product: D = (grad · direction) / ||direction||.\n\nIf the direction vector is the zero vector, return 0.0.",
    starterCode: `def directional_derivative(grad, direction):
    # Your code here
    pass`,
    solution: `def directional_derivative(grad, direction):
    norm = sum(v * v for v in direction) ** 0.5
    if norm == 0.0:
        return 0.0
    return sum(g * d for g, d in zip(grad, direction)) / norm`,
    testCases: [
      { input: [[2, 4, 6], [1, 0, 0]], expected: 2.0 },
      { input: [[1, 1], [3, 4]], expected: 1.4 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
      { input: [[2, -3], [0, -2]], expected: 3.0 },
      { input: [[1, 2], [0, 0]], expected: 0.0 },
    ],
    hint: "The direction must be a unit vector before dotting it with the gradient.",
  },
  {
    id: "ca-016",
    title: "Arc Length of a Polyline",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Compute the total length of a polyline through consecutive 2D points.\n\nSum the Euclidean distance between each pair of adjacent points. A polyline with fewer than two points has length 0.0.",
    starterCode: `def polyline_length(points):
    # points is a list of [x, y] pairs
    # Your code here
    pass`,
    solution: `def polyline_length(points):
    total = 0.0
    for i in range(1, len(points)):
        dx = points[i][0] - points[i - 1][0]
        dy = points[i][1] - points[i - 1][1]
        total += (dx * dx + dy * dy) ** 0.5
    return total`,
    testCases: [
      { input: [[[0, 0], [3, 4]]], expected: 5.0 },
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 3.0 },
      { input: [[[0, 0]]], expected: 0.0 },
      { input: [[[1, 1], [4, 5], [4, 5]]], expected: 5.0 },
    ],
    hint: "Use the Pythagorean distance sqrt(dx * dx + dy * dy) for each segment.",
  },
  {
    id: "ca-017",
    title: "Fixed-Point Iteration Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Apply n steps of the fixed-point iteration x_{k+1} = g(x_k), starting from x, where g(x) = sum(coeffs[i] * x^i).\n\nReturn the resulting value; with n = 0 return x unchanged.",
    starterCode: `def fixed_point_step(coeffs, x, n=1):
    # Your code here
    pass`,
    solution: `def fixed_point_step(coeffs, x, n=1):
    for _ in range(n):
        x = sum(c * x ** i for i, c in enumerate(coeffs))
    return x`,
    testCases: [
      { input: [[0, 0.5], 4, 3], expected: 0.5 },
      { input: [[0, 0, 1], 0.5, 2], expected: 0.0625 },
      { input: [[0, 0, 1], 3, 0], expected: 3.0 },
      { input: [[0.25], 8, 2], expected: 0.25 },
    ],
    hint: "Repeatedly overwrite x with g(x); the coefficient array defines g.",
  },
  {
    id: "ca-018",
    title: "Bisection Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Perform one step of the bisection method on the continuous function f(x) = sum(coeffs[i] * x^i) with bracket [a, b].\n\nReturn the new bracket [lo, hi] as a two-element list. If f at the midpoint is exactly 0.0, return [midpoint, midpoint].",
    starterCode: `def bisection_step(coeffs, a, b):
    # Return the new bracket [lo, hi]
    # Your code here
    pass`,
    solution: `def bisection_step(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    fa = f(a)
    mid = (a + b) / 2.0
    fm = f(mid)
    if fm == 0.0:
        return [mid, mid]
    if fa * fm < 0:
        return [a, mid]
    return [mid, b]`,
    testCases: [
      { input: [[-2, 0, 1], 1, 2], expected: [1.0, 1.5] },
      { input: [[-2, -1, 0, 1], 1, 2], expected: [1.5, 2.0] },
      { input: [[0, 1], -1, 1], expected: [0.0, 0.0] },
      { input: [[-4, 0, 1], 0, 3], expected: [1.5, 3.0] },
    ],
    hint: "Keep the half where f changes sign by comparing f(a) * f(mid) with 0.",
  },
  {
    id: "ca-019",
    title: "Euler Method One Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Take one explicit Euler step for the ODE y' = a * y + b * t.\n\nGiven the current state (y, t) and step size dt, return y + dt * (a * y + b * t).",
    starterCode: `def euler_step(y, t, dt, a, b):
    # Your code here
    pass`,
    solution: `def euler_step(y, t, dt, a, b):
    return y + dt * (a * y + b * t)`,
    testCases: [
      { input: [1, 0, 0.1, 1, 0], expected: 1.1 },
      { input: [2, 1, 0.5, 0, 1], expected: 2.5 },
      { input: [0, 1, 1, 5, 3], expected: 3.0 },
      { input: [-1, 2, 0.25, -2, 1], expected: 0.0 },
    ],
    hint: "Evaluate the right-hand side at the current point and add dt times that slope.",
  },
  {
    id: "ca-020",
    title: "Taylor Coefficients of Exponential",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the Taylor coefficients of e^x expanded about 0 (Maclaurin coefficients) up to and including degree n.\n\nThe coefficient of x^k is 1 / k!, so the result has n + 1 entries starting with 1.0 for k = 0.",
    starterCode: `def taylor_coeffs_exp(n):
    # Return n + 1 coefficients
    # Your code here
    pass`,
    solution: `def taylor_coeffs_exp(n):
    coeffs = []
    fact = 1
    for k in range(n + 1):
        if k > 0:
            fact *= k
        coeffs.append(1.0 / fact)
    return coeffs`,
    testCases: [
      { input: [3], expected: [1.0, 1.0, 0.5, 0.16666666666666666] },
      { input: [0], expected: [1.0] },
      { input: [1], expected: [1.0, 1.0] },
      {
        input: [5],
        expected: [
          1.0,
          1.0,
          0.5,
          0.16666666666666666,
          0.041666666666666664,
          0.008333333333333333,
        ],
      },
    ],
    hint: "Build the running factorial iteratively instead of importing math.factorial.",
  },
  {
    id: "ca-021",
    title: "One-Sided Limit Estimate",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Estimate the limit of the rational function f(x) = P(x) / Q(x) at a from one side, where P and Q are polynomials given by coefficient lists.\n\nEvaluate f(a - h) when side is \"left\" and f(a + h) when side is \"right\", with h = 1e-7. This is meant for 0/0 forms where the limit exists.",
    starterCode: `def one_sided_limit(num_coeffs, den_coeffs, a, side, h=1e-7):
    # side is "left" or "right"
    # Your code here
    pass`,
    solution: `def one_sided_limit(num_coeffs, den_coeffs, a, side, h=1e-7):
    def p(t):
        return sum(c * t ** i for i, c in enumerate(num_coeffs))
    def q(t):
        return sum(c * t ** i for i, c in enumerate(den_coeffs))
    if side == "left":
        t = a - h
    else:
        t = a + h
    return p(t) / q(t)`,
    testCases: [
      { input: [[-1, 0, 1], [-1, 1], 1, "right"], expected: 2.0 },
      { input: [[-1, 0, 1], [-1, 1], 1, "left"], expected: 2.0 },
      { input: [[-4, 0, 1], [-2, 1], 2, "right"], expected: 4.0 },
      { input: [[-8, 0, 0, 1], [-2, 1], 2, "right"], expected: 12.0 },
    ],
    hint: "For a 0/0 form, the values just to either side approach the same finite limit.",
  },
  {
    id: "ca-022",
    title: "Newton Method One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one Newton-Raphson step for the polynomial f(x) = sum(coeffs[i] * x^i), starting at x0:\n\nx1 = x0 - f(x0) / f'(x0)\n\nReturn x1 as a float. Assume f'(x0) != 0.",
    starterCode: `def newton_step(coeffs, x0):
    # Your code here
    pass`,
    solution: `def newton_step(coeffs, x0):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def df(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return x0 - f(x0) / df(x0)`,
    testCases: [
      { input: [[-2, 0, 1], 1], expected: 1.5 },
      { input: [[-2, 0, 1], 2], expected: 1.5 },
      { input: [[-2, -1, 0, 1], 2], expected: 1.6363636363636365 },
      { input: [[0, 0, 1], 3], expected: 1.5 },
      { input: [[5, 2], 0], expected: -2.5 },
    ],
    hint: "Differentiate term by term, then subtract the ratio f / f' from x0.",
  },
  {
    id: "ca-023",
    title: "Newton Method n Steps",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Run n iterations of the Newton-Raphson update x = x - f(x) / f'(x) for f(x) = sum(coeffs[i] * x^i), starting from x0.\n\nReturn the final iterate. With n = 0 the starting point is returned unchanged.",
    starterCode: `def newton_iterate(coeffs, x0, n):
    # Your code here
    pass`,
    solution: `def newton_iterate(coeffs, x0, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def df(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    x = x0
    for _ in range(n):
        x = x - f(x) / df(x)
    return x`,
    testCases: [
      { input: [[-2, 0, 1], 1, 3], expected: 1.4142156862745099 },
      { input: [[-2, -1, 0, 1], 1, 2], expected: 1.6363636363636365 },
      { input: [[0, 0, 1], 3, 0], expected: 3.0 },
      { input: [[-9, 0, 1], 1, 5], expected: 3.0 },
    ],
    hint: "Newton's method converges quadratically, so a handful of steps gets very close to the root.",
  },
  {
    id: "ca-024",
    title: "Secant Method One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one secant-method step for f(x) = sum(coeffs[i] * x^i) using the two starting points x0 and x1:\n\nx2 = x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))\n\nIf f(x1) == f(x0), return x1 unchanged.",
    starterCode: `def secant_step(coeffs, x0, x1):
    # Your code here
    pass`,
    solution: `def secant_step(coeffs, x0, x1):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    f0 = f(x0)
    f1 = f(x1)
    if f1 == f0:
        return x1
    return x1 - f1 * (x1 - x0) / (f1 - f0)`,
    testCases: [
      { input: [[-2, 0, 1], 1, 2], expected: 1.3333333333333333 },
      { input: [[-2, -1, 0, 1], 1, 2], expected: 1.3333333333333333 },
      { input: [[-1, 0, 1], 0, 1], expected: 1.0 },
      { input: [[0, 0, 1], 1, -1], expected: -1.0 },
    ],
    hint: "The secant method replaces the derivative with a finite-difference slope.",
  },
  {
    id: "ca-025",
    title: "Partial Derivatives of a Quadratic Form",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x, y) = a * x^2 + b * x * y + c * y^2, return the gradient [df/dx, df/dy] evaluated at (x, y).\n\ndf/dx = 2 * a * x + b * y and df/dy = b * x + 2 * c * y.",
    starterCode: `def partial_derivatives(a, b, c, x, y):
    # Return [df_dx, df_dy]
    # Your code here
    pass`,
    solution: `def partial_derivatives(a, b, c, x, y):
    fx = 2 * a * x + b * y
    fy = b * x + 2 * c * y
    return [fx, fy]`,
    testCases: [
      { input: [1, 2, 3, 1, 2], expected: [6.0, 14.0] },
      { input: [0, 0, 1, 5, -3], expected: [0.0, -6.0] },
      { input: [2, -1, 0, 0, 0], expected: [0.0, 0.0] },
      { input: [1, 1, 1, -2, 4], expected: [0.0, 6.0] },
    ],
    hint: "Treat the other variable as a constant when differentiating.",
  },
  {
    id: "ca-026",
    title: "Numerical Gradient of 2D Function",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the numerical gradient of f(x, y) = x^3 + a * x * y^2 at (x, y) using central differences with h = 1e-6.\n\nReturn [df/dx, df/dy] where each partial uses the symmetric difference quotient. The analytic gradient is [3*x^2 + a*y^2, 2*a*x*y].",
    starterCode: `def numerical_gradient_2d(a, x, y, h=1e-6):
    # Return [df_dx, df_dy]
    # Your code here
    pass`,
    solution: `def numerical_gradient_2d(a, x, y, h=1e-6):
    def f(u, v):
        return u ** 3 + a * u * v ** 2
    gx = (f(x + h, y) - f(x - h, y)) / (2 * h)
    gy = (f(x, y + h) - f(x, y - h)) / (2 * h)
    return [gx, gy]`,
    testCases: [
      { input: [1, 2, 1], expected: [13.0, 4.0] },
      { input: [0, -2, 3], expected: [12.0, 0.0] },
      { input: [2, 0, 5], expected: [50.0, 0.0] },
      { input: [-1, 1, 2], expected: [-1.0, -4.0] },
    ],
    hint: "Perturb one variable at a time and keep the step symmetric around the point.",
  },
  {
    id: "ca-027",
    title: "Product Rule Evaluation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the derivative of the product f(x) = P(x) * Q(x) at x, where P and Q are polynomials given by coefficient lists.\n\nUse the product rule: (P * Q)'(x) = P'(x) * Q(x) + P(x) * Q'(x).",
    starterCode: `def product_rule(p_coeffs, q_coeffs, x):
    # Your code here
    pass`,
    solution: `def product_rule(p_coeffs, q_coeffs, x):
    def ev(coeffs, t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def dv(coeffs, t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return dv(p_coeffs, x) * ev(q_coeffs, x) + ev(p_coeffs, x) * dv(q_coeffs, x)`,
    testCases: [
      { input: [[0, 1], [0, 1], 3], expected: 6.0 },
      { input: [[1, 1], [1, -1], 2], expected: -4.0 },
      { input: [[0, 0, 1], [1, 0, 1], 1], expected: 6.0 },
      { input: [[5], [0, 0, 1], 2], expected: 20.0 },
    ],
    hint: "Differentiate each factor separately and combine the two cross terms.",
  },
  {
    id: "ca-028",
    title: "Quotient Rule Evaluation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the derivative of the quotient f(x) = P(x) / Q(x) at x, where P and Q are polynomials given by coefficient lists.\n\nUse the quotient rule: (P / Q)'(x) = (P'(x) * Q(x) - P(x) * Q'(x)) / Q(x)^2. Assume Q(x) != 0.",
    starterCode: `def quotient_rule(p_coeffs, q_coeffs, x):
    # Your code here
    pass`,
    solution: `def quotient_rule(p_coeffs, q_coeffs, x):
    def ev(coeffs, t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def dv(coeffs, t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    num = dv(p_coeffs, x) * ev(q_coeffs, x) - ev(p_coeffs, x) * dv(q_coeffs, x)
    den = ev(q_coeffs, x) ** 2
    return num / den`,
    testCases: [
      { input: [[1, 0, 1], [0, 1], 1], expected: 0.0 },
      { input: [[0, 0, 1], [1, 1], 1], expected: 0.75 },
      { input: [[0, 1], [0, 1], 2], expected: 0.0 },
      { input: [[1], [0, 0, 1], 2], expected: -0.25 },
    ],
    hint: "The numerator follows the product rule order: derivative of top times bottom minus top times derivative of bottom.",
  },
  {
    id: "ca-029",
    title: "Chain Rule Evaluation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the derivative of the composite f(g(x)) at x, where f(u) = u^3 + 2 * u and g is a polynomial given by coefficients.\n\nBy the chain rule, the derivative is (3 * g(x)^2 + 2) * g'(x).",
    starterCode: `def chain_rule(coeffs, x):
    # f(u) = u**3 + 2*u, g is the polynomial
    # Your code here
    pass`,
    solution: `def chain_rule(coeffs, x):
    def g(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def dg(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    u = g(x)
    return (3 * u * u + 2) * dg(x)`,
    testCases: [
      { input: [[0, 1], 2], expected: 14.0 },
      { input: [[0, 0, 1], 2], expected: 200.0 },
      { input: [[3], 5], expected: 0.0 },
      { input: [[1, 0, 1], 0], expected: 0.0 },
      { input: [[0, 0, 0, 1], 1], expected: 15.0 },
    ],
    hint: "Differentiate the outer function at g(x) and multiply by the inner derivative.",
  },
  {
    id: "ca-030",
    title: "Implicit Differentiation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The curve x^2 + y^2 + a * x + b * y + c = 0 defines y implicitly as a function of x.\n\nDifferentiating implicitly gives dy/dx = -(2 * x + a) / (2 * y + b). Return that slope at (x, y), or None when 2 * y + b == 0 (vertical tangent).",
    starterCode: `def implicit_derivative(a, b, x, y):
    # Return None when 2*y + b == 0
    # Your code here
    pass`,
    solution: `def implicit_derivative(a, b, x, y):
    den = 2 * y + b
    if den == 0:
        return None
    return -(2 * x + a) / den`,
    testCases: [
      { input: [0, 0, 1, 1], expected: -1.0 },
      { input: [0, 0, 3, 4], expected: -0.75 },
      { input: [2, -4, 0, 0], expected: 0.5 },
      { input: [0, 0, 1, 0], expected: null },
    ],
    hint: "Differentiate every term with respect to x, treating y as y(x) and dy/dx as the unknown.",
  },
  {
    id: "ca-031",
    title: "Hessian of a Quadratic Form",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Return the constant Hessian matrix of f(x, y) = a * x^2 + b * x * y + c * y^2 as a 2x2 nested list.\n\nThe matrix is [[2a, b], [b, 2c]] since all second partials are constants.",
    starterCode: `def quadratic_hessian(a, b, c):
    # Return [[H_xx, H_xy], [H_yx, H_yy]]
    # Your code here
    pass`,
    solution: `def quadratic_hessian(a, b, c):
    return [[2.0 * a, 1.0 * b], [1.0 * b, 2.0 * c]]`,
    testCases: [
      { input: [1, 2, 3], expected: [[2.0, 2.0], [2.0, 6.0]] },
      { input: [-1, 0, 2], expected: [[-2.0, 0.0], [0.0, 4.0]] },
      { input: [0, 5, 0], expected: [[0.0, 5.0], [5.0, 0.0]] },
      { input: [2, -3, 2], expected: [[4.0, -3.0], [-3.0, 4.0]] },
    ],
    hint: "Mixed partials are equal for this smooth function, so the Hessian is symmetric.",
  },
  {
    id: "ca-032",
    title: "Laplacian of 2D Polynomial",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the Laplacian of f(x, y) = a * x^3 + b * y^3 + c * x * y^2 at (x, y):\n\nLaplacian = f_xx + f_yy = 6 * a * x + 6 * b * y + 2 * c * x",
    starterCode: `def laplacian(a, b, c, x, y):
    # Your code here
    pass`,
    solution: `def laplacian(a, b, c, x, y):
    f_xx = 6 * a * x
    f_yy = 6 * b * y + 2 * c * x
    return f_xx + f_yy`,
    testCases: [
      { input: [1, 0, 1, 2, 3], expected: 16.0 },
      { input: [0, 1, 0, 1, -1], expected: -6.0 },
      { input: [2, 3, 5, 1, 1], expected: 40.0 },
      { input: [0, 0, 7, 5, 1], expected: 70.0 },
    ],
    hint: "Differentiate twice in x, twice in y, then add the two results.",
  },
  {
    id: "ca-033",
    title: "Divergence of 2D Vector Field",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the vector field F(x, y) = [a*x^2 + b*x*y, c*x*y + d*y^2], compute its divergence at (x, y):\n\ndiv F = dP/dx + dQ/dy = (2*a*x + b*y) + (c*x + 2*d*y)",
    starterCode: `def divergence(a, b, c, d, x, y):
    # Your code here
    pass`,
    solution: `def divergence(a, b, c, d, x, y):
    dP_dx = 2 * a * x + b * y
    dQ_dy = c * x + 2 * d * y
    return dP_dx + dQ_dy`,
    testCases: [
      { input: [1, 0, 0, 1, 2, 3], expected: 10.0 },
      { input: [0, 1, 1, 0, 1, 4], expected: 5.0 },
      { input: [1, 2, 3, 4, 0, 0], expected: 0.0 },
      { input: [-1, 1, 2, -2, 2, -1], expected: 3.0 },
    ],
    hint: "The divergence of a 2D field is the trace of its Jacobian.",
  },
  {
    id: "ca-034",
    title: "Curl of 2D Vector Field",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the vector field F(x, y) = [a*x^2 + b*x*y, c*x*y + d*y^2], compute the scalar curl at (x, y):\n\ncurl F = dQ/dx - dP/dy = c*y - b*x",
    starterCode: `def curl2d(a, b, c, d, x, y):
    # Your code here
    pass`,
    solution: `def curl2d(a, b, c, d, x, y):
    dQ_dx = c * y
    dP_dy = b * x
    return dQ_dx - dP_dy`,
    testCases: [
      { input: [1, 0, 1, 0, 2, 3], expected: 3.0 },
      { input: [0, 1, 0, 0, 5, 1], expected: -5.0 },
      { input: [2, 2, 2, 2, 1, 1], expected: 0.0 },
      { input: [1, -2, 3, 1, 2, 4], expected: 16.0 },
    ],
    hint: "Only the cross derivatives matter for the curl of a planar field.",
  },
  {
    id: "ca-035",
    title: "Critical Points of a Cubic",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Find all real critical points of the cubic f(x) = a*x^3 + b*x^2 + c*x + d by solving f'(x) = 3*a*x^2 + 2*b*x + c = 0.\n\nReturn the distinct real roots sorted in ascending order (an empty list if there are none). The constant d does not affect the result.",
    starterCode: `def critical_points(a, b, c, d):
    # Return a sorted list of critical x values
    # Your code here
    pass`,
    solution: `def critical_points(a, b, c, d):
    A = 3 * a
    B = 2 * b
    C = c
    if A == 0:
        if B == 0:
            return []
        return [-C / B]
    disc = B * B - 4 * A * C
    if disc < 0:
        return []
    roots = []
    if disc == 0:
        roots.append(-B / (2 * A))
    else:
        s = disc ** 0.5
        roots.append((-B - s) / (2 * A))
        roots.append((-B + s) / (2 * A))
    roots.sort()
    return roots`,
    testCases: [
      { input: [1, 0, -3, 0], expected: [-1.0, 1.0] },
      { input: [1, -3, 2, 0], expected: [0.42264973081037427, 1.5773502691896257] },
      { input: [0, 1, -4, 5], expected: [2.0] },
      { input: [1, 0, 1, 0], expected: [] },
      { input: [1, 0, 0, 0], expected: [0.0] },
    ],
    hint: "Solve the quadratic f'(x) = 0 with the discriminant and keep only real roots.",
  },
  {
    id: "ca-036",
    title: "Inflection Point of a Cubic",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Find the x-coordinate of the inflection point of f(x) = a*x^3 + b*x^2 + c*x + d.\n\nThe second derivative is f''(x) = 6*a*x + 2*b, which vanishes at x = -b / (3*a). Return None when a == 0, since then the function is not a cubic.",
    starterCode: `def inflection_point(a, b, c, d):
    # Return None when a == 0
    # Your code here
    pass`,
    solution: `def inflection_point(a, b, c, d):
    if a == 0:
        return None
    return -b / (3.0 * a)`,
    testCases: [
      { input: [1, -3, 0, 0], expected: 1.0 },
      { input: [2, 6, 0, 0], expected: -1.0 },
      { input: [-1, 0, 0, 0], expected: 0.0 },
      { input: [0, 5, 1, 0], expected: null },
    ],
    hint: "Set the second derivative to zero and solve the resulting linear equation.",
  },
  {
    id: "ca-037",
    title: "Extrema of Quadratic on Interval",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Find the minimum and maximum values of f(x) = a*x^2 + b*x + c on the closed interval [lo, hi].\n\nCheck the endpoints and the vertex x = -b / (2*a) when the vertex lies inside the interval, then return [min_value, max_value]. For a == 0 the function is linear.",
    starterCode: `def quadratic_extrema(a, b, c, lo, hi):
    # Return [min_value, max_value]
    # Your code here
    pass`,
    solution: `def quadratic_extrema(a, b, c, lo, hi):
    def f(t):
        return a * t * t + b * t + c
    candidates = [lo, hi]
    if a != 0:
        vertex = -b / (2.0 * a)
        if lo <= vertex <= hi:
            candidates.append(vertex)
    values = [f(t) for t in candidates]
    return [min(values), max(values)]`,
    testCases: [
      { input: [1, 0, 0, -1, 2], expected: [0.0, 4.0] },
      { input: [-1, 2, 0, 0, 3], expected: [-3.0, 1.0] },
      { input: [0, 2, 1, -1, 1], expected: [-1.0, 3.0] },
      { input: [1, -4, 4, 0, 1], expected: [1.0, 4.0] },
      { input: [2, 0, -8, -2, 1], expected: [-8.0, 0.0] },
    ],
    hint: "An extreme value on a closed interval occurs at an endpoint or at an interior critical point.",
  },
  {
    id: "ca-038",
    title: "Mean Value Theorem Point",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Find the smallest point c in [a, b] guaranteed by the Mean Value Theorem for the polynomial f(x) = sum(coeffs[i] * x^i), so that f'(c) equals the average slope (f(b) - f(a)) / (b - a).\n\nSolve the quadratic f'(c) - slope = 0 exactly and return the smallest valid root, or None if no root lies in the interval.",
    starterCode: `def mvt_point(coeffs, a, b):
    # Return the smallest valid c, or None
    # Your code here
    pass`,
    solution: `def mvt_point(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    slope = (f(b) - f(a)) / (b - a)
    A = 3 * coeffs[3] if len(coeffs) > 3 else 0.0
    B = 2 * coeffs[2] if len(coeffs) > 2 else 0.0
    C = (coeffs[1] if len(coeffs) > 1 else 0.0) - slope
    if A == 0:
        if B == 0:
            return (a + b) / 2.0
        return -C / B
    disc = B * B - 4 * A * C
    if disc < 0:
        return None
    s = disc ** 0.5
    roots = [(-B - s) / (2 * A), (-B + s) / (2 * A)]
    valid = [r for r in roots if a - 1e-9 <= r <= b + 1e-9]
    if not valid:
        return None
    return min(valid)`,
    testCases: [
      { input: [[0, -3, 0, 1], 0, 2], expected: 1.1547005383792517 },
      { input: [[0, 0, 0, 1], 0, 3], expected: 1.7320508075688772 },
      { input: [[0, 1, 0, 1], 0, 1], expected: 0.5773502691896258 },
      { input: [[0, -3, 0, 1], -2, 2], expected: -1.1547005383792517 },
      { input: [[0, 0, 1], 0, 2], expected: 1.0 },
    ],
    hint: "Set f'(c) equal to the secant slope and solve the resulting polynomial equation.",
  },
  {
    id: "ca-039",
    title: "Arc Length Numeric",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the arc length of y = f(x) over [a, b] with n straight segments, where f(x) = sum(coeffs[i] * x^i).\n\nSample n + 1 equally spaced points and sum sqrt(dx^2 + dy^2) over consecutive pairs. Return 0.0 when n <= 0.",
    starterCode: `def arc_length(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def arc_length(coeffs, a, b, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    if n <= 0:
        return 0.0
    dx = (b - a) / n
    total = 0.0
    x_prev = a
    y_prev = f(a)
    for i in range(1, n + 1):
        x_cur = a + i * dx
        y_cur = f(x_cur)
        total += ((x_cur - x_prev) ** 2 + (y_cur - y_prev) ** 2) ** 0.5
        x_prev = x_cur
        y_prev = y_cur
    return total`,
    testCases: [
      { input: [[3], 0, 4, 8], expected: 4.0 },
      { input: [[0, 2], 0, 3, 3], expected: 6.708203932499369 },
      { input: [[0, 0, 1], 0, 2, 4], expected: 4.6267234873447 },
      { input: [[0, 0, 1], 0, 1, 1], expected: 1.4142135623730951 },
    ],
    hint: "A piecewise-linear approximation converges to the true arc length as n grows.",
  },
  {
    id: "ca-040",
    title: "Volume of Revolution Disk Method",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the volume of the solid formed by rotating y = f(x) about the x-axis over [a, b] with n disks, where f(x) = sum(coeffs[i] * x^i).\n\nUse midpoint sampling: V = pi * dx * sum(f(midpoint)^2) with dx = (b - a) / n. Return 0.0 when n <= 0. Use 3.141592653589793 for pi.",
    starterCode: `def volume_disk(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def volume_disk(coeffs, a, b, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    if n <= 0:
        return 0.0
    dx = (b - a) / n
    total = 0.0
    for i in range(n):
        mid = a + (i + 0.5) * dx
        y = f(mid)
        total += y * y
    return 3.141592653589793 * total * dx`,
    testCases: [
      { input: [[2], 0, 3, 6], expected: 37.69911184307752 },
      { input: [[0, 1], 0, 2, 4], expected: 8.246680715673207 },
      { input: [[0, 0, 1], 0, 1, 2], expected: 0.5031456984264903 },
      { input: [[0], 0, 5, 5], expected: 0.0 },
    ],
    hint: "Each disk has radius f(midpoint) and thickness dx, so its volume is pi * r^2 * dx.",
  },
  {
    id: "ca-041",
    title: "Gradient Descent One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one gradient descent step on f(x, y) = a*x^2 + b*y^2 + c*x*y from the given point with learning rate lr.\n\nThe gradient is [2*a*x + c*y, 2*b*y + c*x]. Return the updated point [x - lr * gx, y - lr * gy].",
    starterCode: `def gradient_descent_step(point, lr, a, b, c):
    # Return the updated [x, y]
    # Your code here
    pass`,
    solution: `def gradient_descent_step(point, lr, a, b, c):
    x = point[0]
    y = point[1]
    gx = 2 * a * x + c * y
    gy = 2 * b * y + c * x
    return [x - lr * gx, y - lr * gy]`,
    testCases: [
      { input: [[1, 1], 0.1, 1, 1, 0], expected: [0.8, 0.8] },
      { input: [[2, -1], 0.5, 1, 2, 1], expected: [0.5, 0.0] },
      { input: [[3, -2], 0, 1, 1, 0], expected: [3.0, -2.0] },
      { input: [[0, 0], 1, 1, 1, 1], expected: [0.0, 0.0] },
    ],
    hint: "Step against the gradient: new_point = point - lr * gradient.",
  },
  {
    id: "ca-042",
    title: "Lagrange Multiplier Product",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Maximize f(x, y) = a*x*y subject to the linear constraint b*x + c*y = d, with b and c nonzero.\n\nThe Lagrange conditions give x = d / (2*b) and y = d / (2*c). Return [x, y, f_max] where f_max = a * x * y.",
    starterCode: `def lagrange_product(a, b, c, d):
    # Return [x, y, f_max]
    # Your code here
    pass`,
    solution: `def lagrange_product(a, b, c, d):
    x = d / (2.0 * b)
    y = d / (2.0 * c)
    return [x, y, a * x * y]`,
    testCases: [
      { input: [1, 1, 1, 10], expected: [5.0, 5.0, 25.0] },
      { input: [2, 1, 2, 8], expected: [4.0, 2.0, 16.0] },
      { input: [-1, 2, 5, 20], expected: [5.0, 2.0, -10.0] },
      { input: [3, 4, 6, 24], expected: [3.0, 2.0, 18.0] },
    ],
    hint: "Set the gradients of f and the constraint proportional and use the constraint to pin down the multiplier.",
  },
  {
    id: "ca-043",
    title: "Double Integral Midpoint Rule",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Approximate a double integral over a rectangle with the 2D midpoint rule.\n\ngrid[j][i] holds f sampled at the midpoint of cell (i, j), with uniform cell sizes dx and dy. Return the sum of all grid values times dx * dy.",
    starterCode: `def double_midpoint(grid, dx, dy):
    # Your code here
    pass`,
    solution: `def double_midpoint(grid, dx, dy):
    total = 0.0
    for row in grid:
        for value in row:
            total += value
    return total * dx * dy`,
    testCases: [
      { input: [[[1, 1], [1, 1]], 0.5, 0.5], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], 1, 1], expected: 10.0 },
      { input: [[[0.5, 1.5], [2.5, 3.5]], 2, 0.5], expected: 8.0 },
      { input: [[], 1, 1], expected: 0.0 },
      { input: [[[], []], 1, 1], expected: 0.0 },
    ],
    hint: "Sum every cell value, then multiply once by the cell area dx * dy.",
  },
  {
    id: "ca-044",
    title: "Triple Integral Midpoint Rule",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Approximate a triple integral over a box with the 3D midpoint rule.\n\ngrid[k][j][i] holds f sampled at the midpoint of cell (i, j, k) with uniform spacings dx, dy, dz. Sum all values and multiply by the cell volume dx * dy * dz.",
    starterCode: `def triple_midpoint(grid, dx, dy, dz):
    # Your code here
    pass`,
    solution: `def triple_midpoint(grid, dx, dy, dz):
    total = 0.0
    for plane in grid:
        for row in plane:
            for value in row:
                total += value
    return total * dx * dy * dz`,
    testCases: [
      { input: [[[[1, 1], [1, 1]], [[1, 1], [1, 1]]], 0.5, 0.5, 0.5], expected: 1.0 },
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]], 1, 1, 1], expected: 36.0 },
      { input: [[[[2]]], 1, 2, 3], expected: 12.0 },
      { input: [[], 1, 1, 1], expected: 0.0 },
    ],
    hint: "This is the same averaging idea as the 2D rule, with one more nested loop.",
  },
  {
    id: "ca-045",
    title: "Line Integral on a Segment",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the line integral of the linear field F(x, y) = [a*x + b*y, c*x + d*y] along the straight segment from P = (x0, y0) to Q = (x1, y1).\n\nParameterize r(t) = P + t*(Q - P) for t in [0, 1]. Because F is linear, the integrand F(r(t)) · (Q - P) is linear in t, so the integral equals the average of its endpoint values.",
    starterCode: `def line_integral(a, b, c, d, x0, y0, x1, y1):
    # Your code here
    pass`,
    solution: `def line_integral(a, b, c, d, x0, y0, x1, y1):
    vx = x1 - x0
    vy = y1 - y0
    f0 = (a * x0 + b * y0) * vx + (c * x0 + d * y0) * vy
    f1 = (a * x1 + b * y1) * vx + (c * x1 + d * y1) * vy
    return 0.5 * (f0 + f1)`,
    testCases: [
      { input: [1, 0, 0, 1, 0, 0, 2, 3], expected: 6.5 },
      { input: [0, 1, 1, 0, 0, 0, 1, 1], expected: 1.0 },
      { input: [0, -1, 1, 0, 0, 0, 1, 0], expected: 0.0 },
      { input: [1, 0, 0, 0, 1, 1, 4, 5], expected: 7.5 },
    ],
    hint: "The average of the integrand at the two endpoints is exact when the integrand is linear in t.",
  },
  {
    id: "ca-046",
    title: "RK2 Midpoint Method One Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Take one step of the second-order Runge-Kutta midpoint method for the ODE y' = a*y + b*t.\n\nk1 = f(t, y), y_mid = y + 0.5*dt*k1, k2 = f(t + 0.5*dt, y_mid), y_next = y + dt*k2.\n\nReturn y_next.",
    starterCode: `def rk2_step(y, t, dt, a, b):
    # Your code here
    pass`,
    solution: `def rk2_step(y, t, dt, a, b):
    k1 = a * y + b * t
    y_mid = y + 0.5 * dt * k1
    t_mid = t + 0.5 * dt
    k2 = a * y_mid + b * t_mid
    return y + dt * k2`,
    testCases: [
      { input: [1, 0, 0.1, 1, 0], expected: 1.105 },
      { input: [0, 1, 0.5, 0, 1], expected: 0.625 },
      { input: [2, 0, 0.25, -1, 0], expected: 1.5625 },
      { input: [1, 0.5, 0.2, 2, -1], expected: 1.34 },
    ],
    hint: "Evaluate the slope twice: once at the start and once at the predicted midpoint.",
  },
  {
    id: "ca-047",
    title: "Logistic ODE Euler Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Take one explicit Euler step for the logistic ODE y' = r * y * (1 - y / k), where r is the growth rate and k is the carrying capacity.\n\nGiven the current population y and step size dt, return y + dt * r * y * (1 - y / k). Assume k != 0.",
    starterCode: `def logistic_euler_step(y, r, k, dt):
    # Your code here
    pass`,
    solution: `def logistic_euler_step(y, r, k, dt):
    return y + dt * r * y * (1 - y / k)`,
    testCases: [
      { input: [1, 1, 10, 0.5], expected: 1.45 },
      { input: [5, 0.2, 10, 1], expected: 5.5 },
      { input: [0, 1, 10, 0.5], expected: 0.0 },
      { input: [10, 1, 10, 0.5], expected: 10.0 },
      { input: [2, -1, 10, 0.5], expected: 1.2 },
    ],
    hint: "At y = 0 and y = k the growth term is zero, so the state does not move.",
  },
  {
    id: "ca-048",
    title: "Harmonic Oscillator Euler Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Take one explicit Euler step for the harmonic oscillator x'' = -w^2 * x, written as the first-order system x' = v, v' = -w^2 * x.\n\nGiven position x, velocity v, frequency w, and step dt, return [x + dt*v, v - dt*w^2*x].",
    starterCode: `def harmonic_euler_step(x, v, w, dt):
    # Return [x_new, v_new]
    # Your code here
    pass`,
    solution: `def harmonic_euler_step(x, v, w, dt):
    x_new = x + dt * v
    v_new = v - dt * w * w * x
    return [x_new, v_new]`,
    testCases: [
      { input: [1, 0, 1, 0.1], expected: [1.0, -0.1] },
      { input: [0, 2, 2, 0.25], expected: [0.5, 2.0] },
      { input: [2, -1, 0.5, 0.5], expected: [1.5, -1.25] },
      { input: [1, 1, 0, 0.5], expected: [1.5, 1.0] },
    ],
    hint: "Update the velocity with the old position, then update the position with the old velocity.",
  },
  {
    id: "ca-049",
    title: "Stiffness Ratio",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the stiffness ratio of a linear ODE system y' = A*y from its real eigenvalues: max(|lambda_i|) / min(|lambda_i|).\n\nAssume no eigenvalue is zero and eigenvalues may be negative (only magnitudes matter). Return the ratio as a float.",
    starterCode: `def stiffness_ratio(eigenvalues):
    # Your code here
    pass`,
    solution: `def stiffness_ratio(eigenvalues):
    magnitudes = [abs(e) for e in eigenvalues]
    return max(magnitudes) / min(magnitudes)`,
    testCases: [
      { input: [[1, 100, 3]], expected: 100.0 },
      { input: [[-200, 0.5, 4]], expected: 400.0 },
      { input: [[5, 5]], expected: 1.0 },
      { input: [[-1, -2, -4]], expected: 4.0 },
      { input: [[0.25]], expected: 1.0 },
    ],
    hint: "A large ratio means explicit methods are forced to take very small steps.",
  },
  {
    id: "ca-050",
    title: "Differentiability Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Check whether the piecewise function f(x) = P(x) for x < a and f(x) = Q(x) for x >= a is differentiable at a, where P and Q are polynomials given by coefficient lists.\n\nEstimate the left derivative with (f(a) - f(a - h)) / h and the right derivative with (f(a + h) - f(a)) / h using h = 1e-6. Return True when the two one-sided derivatives differ by less than tol (default 1e-4).",
    starterCode: `def is_differentiable(p_coeffs, q_coeffs, a, tol=1e-4):
    # Your code here
    pass`,
    solution: `def is_differentiable(p_coeffs, q_coeffs, a, tol=1e-4):
    def p(t):
        return sum(c * t ** i for i, c in enumerate(p_coeffs))
    def q(t):
        return sum(c * t ** i for i, c in enumerate(q_coeffs))
    def f(t):
        if t < a:
            return p(t)
        return q(t)
    h = 1e-6
    left = (f(a) - f(a - h)) / h
    right = (f(a + h) - f(a)) / h
    return abs(left - right) < tol`,
    testCases: [
      { input: [[0, 0, 1], [-1, 2], 1], expected: true },
      { input: [[0, 0, 1], [0, 1, 0], 0], expected: false },
      { input: [[1], [2], 0], expected: false },
      { input: [[0, 3], [0, 3], 2], expected: true },
      { input: [[0, 0, 0, 1], [0, 0, 1, 0], 0], expected: true },
    ],
    hint: "The function must be continuous and the left and right slopes must agree at a.",
  },
];
