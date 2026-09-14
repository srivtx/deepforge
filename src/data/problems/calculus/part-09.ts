import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-296",
    title: "Cumulative Trapezoid Integration",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Given function values on a uniform grid with spacing dx, return the running trapezoidal integral after each interval: F_k = F_{k-1} + 0.5 * (v[k-1] + v[k]) * dx for k = 1..n-1.\n\nReturn a list of n-1 prefix integrals; return [] when fewer than two samples are given.",
    starterCode: `def cumulative_trapezoid_integral(values, dx):
    # Your code here
    pass`,
    solution: `def cumulative_trapezoid_integral(values, dx):
    out = []
    total = 0.0
    for i in range(1, len(values)):
        total += 0.5 * (values[i - 1] + values[i]) * dx
        out.append(total)
    return out`,
    testCases: [
      { input: [[1, 1, 1, 1], 0.5], expected: [0.5, 1.0, 1.5] },
      { input: [[0, 1, 2, 3], 1], expected: [0.5, 2.0, 4.5] },
      { input: [[2, 4], 0.25], expected: [0.75] },
    ],
    hint: "Accumulate each trapezoid contribution into a running total.",
  },
  {
    id: "ca-297",
    title: "Trapezoid Weight Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The composite trapezoidal rule can be written as a dot product with a weight vector: weights are 0.5 at both endpoints and 1 at every interior node, all scaled by dx.\n\nGiven the number of nodes n and dx, return the weight list of length n. Return [] when n < 2.",
    starterCode: `def trapezoid_weight_vector(n, dx):
    # Your code here
    pass`,
    solution: `def trapezoid_weight_vector(n, dx):
    if n < 2:
        return []
    return [0.5 * dx] + [dx] * (n - 2) + [0.5 * dx]`,
    testCases: [
      { input: [5, 0.5], expected: [0.25, 0.5, 0.5, 0.5, 0.25] },
      { input: [2, 2.0], expected: [1.0, 1.0] },
      { input: [3, 1.0], expected: [0.5, 1.0, 0.5] },
    ],
    hint: "Only the two endpoints carry the half weight.",
  },
  {
    id: "ca-298",
    title: "Gauss-Legendre 3-Point Integral",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Three-point Gauss-Legendre quadrature on [-1, 1] evaluates a polynomial at the nodes -sqrt(3/5), 0, sqrt(3/5) with weights 5/9, 8/9, 5/9.\n\nGiven polynomial coefficients in ascending order, return the quadrature estimate.",
    starterCode: `def gauss_legendre_3_point(coeffs):
    # Your code here
    pass`,
    solution: `def gauss_legendre_3_point(coeffs):
    import math
    r = math.sqrt(3.0 / 5.0)
    nodes = [-r, 0.0, r]
    weights = [5.0 / 9.0, 8.0 / 9.0, 5.0 / 9.0]
    total = 0.0
    for node, w in zip(nodes, weights):
        total += w * sum(c * node ** i for i, c in enumerate(coeffs))
    return total`,
    testCases: [
      { input: [[0, 0, 1]], expected: 0.6666666666666667 },
      { input: [[1, 2, 3]], expected: 4.000000000000001 },
      { input: [[0, 1, 0, 0, 0, 1]], expected: 0.0 },
    ],
    hint: "Weighted sum of the polynomial at the three symmetric nodes.",
  },
  {
    id: "ca-299",
    title: "Gauss-Legendre 2-Point on Interval",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Map two-point Gauss-Legendre to a general interval [a, b]: nodes are c +/- (b - a) / (2 * sqrt(3)) with c = (a + b) / 2, and each weight is (b - a) / 2.\n\nGiven polynomial coefficients and the interval bounds, return the quadrature estimate.",
    starterCode: `def gauss_legendre_2_interval(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def gauss_legendre_2_interval(coeffs, a, b):
    import math
    c = 0.5 * (a + b)
    half = 0.5 * (b - a)
    d = half / math.sqrt(3.0)
    total = 0.0
    for node in (c - d, c + d):
        total += half * sum(coef * node ** i for i, coef in enumerate(coeffs))
    return total`,
    testCases: [
      { input: [[0, 0, 1], 0, 1], expected: 0.3333333333333333 },
      { input: [[1, 1], -1, 1], expected: 2.0 },
      { input: [[0, 0, 0, 2], 0, 2], expected: 7.999999999999999 },
    ],
    hint: "Affine-map the standard nodes and scale the weights by half the interval length.",
  },
  {
    id: "ca-300",
    title: "Romberg Table Two Levels",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Build the first two levels of a Romberg table for the integral of a polynomial on [a, b]: T(h) is the trapezoidal estimate with spacing b - a, and T(h/2) uses two subintervals. Richardson extrapolation gives R = (4 * T(h/2) - T(h)) / 3.\n\nReturn the nested list [[T(h)], [T(h/2), R]].",
    starterCode: `def romberg_table_two_levels(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def romberg_table_two_levels(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    t1 = 0.5 * (f(a) + f(b)) * (b - a)
    h = 0.5 * (b - a)
    t2 = 0.5 * (f(a) + f(b) + 2.0 * f(a + h)) * h
    r = (4.0 * t2 - t1) / 3.0
    return [[t1], [t2, r]]`,
    testCases: [
      { input: [[0, 0, 1], 0, 1], expected: [[0.5], [0.375, 0.3333333333333333]] },
      { input: [[0, 0, 0, 1], 0, 2], expected: [[8.0], [5.0, 4.0]] },
      { input: [[1, 0, 0, 1], 0, 1], expected: [[1.5], [1.3125, 1.25]] },
    ],
    hint: "Halve the spacing, then combine the two trapezoid estimates with 4/3 and 1/3.",
  },
  {
    id: "ca-301",
    title: "Midpoint versus Trapezoid Estimate",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compare the composite midpoint and trapezoidal rules on n equal subintervals of [a, b] for a polynomial: the midpoint rule samples at subinterval centers, the trapezoid rule at the nodes.\n\nReturn [midpoint, trapezoid].",
    starterCode: `def midpoint_versus_trapezoid(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def midpoint_versus_trapezoid(coeffs, a, b, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    h = (b - a) / n
    mid = 0.0
    for i in range(n):
        mid += f(a + (i + 0.5) * h)
    mid *= h
    trap = 0.5 * (f(a) + f(b))
    for i in range(1, n):
        trap += f(a + i * h)
    trap *= h
    return [mid, trap]`,
    testCases: [
      { input: [[0, 0, 1], 0, 1, 2], expected: [0.3125, 0.375] },
      { input: [[1], 0, 2, 4], expected: [2.0, 2.0] },
      { input: [[0, 0, 0, 1], 0, 2, 2], expected: [3.5, 5.0] },
    ],
    hint: "Midpoint uses (i + 0.5) * h; trapezoid sums interior nodes with full weight.",
  },
  {
    id: "ca-302",
    title: "Derivative of Integral Upper Limit",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "By the fundamental theorem of calculus, d/dx of the integral from a constant to x of f(t) equals f(x).\n\nGiven polynomial coefficients and the value x, return f(x).",
    starterCode: `def integral_upper_limit_derivative(coeffs, x):
    # Your code here
    pass`,
    solution: `def integral_upper_limit_derivative(coeffs, x):
    return sum(c * x ** i for i, c in enumerate(coeffs))`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: 17 },
      { input: [[0, 0, 1], -3], expected: 9 },
      { input: [[5], 7], expected: 5 },
    ],
    hint: "The rate of change of the accumulated area is the integrand height.",
  },
  {
    id: "ca-303",
    title: "Leibniz Rule Moving Limits",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "When both integration limits depend on x, d/dx of the integral from a(x) to b(x) of f(t) dt = f(b(x)) * b'(x) - f(a(x)) * a'(x).\n\nGiven coefficients of the polynomial integrand f, coefficients of the linear limits a and b, and x, return the derivative value. Coeffs lists are in ascending order.",
    starterCode: `def leibniz_rule_value(f_coeffs, a_coeffs, b_coeffs, x):
    # Your code here
    pass`,
    solution: `def leibniz_rule_value(f_coeffs, a_coeffs, b_coeffs, x):
    def val(cs, t):
        return sum(c * t ** i for i, c in enumerate(cs))
    def deriv(cs, t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(cs) if i > 0)
    return val(f_coeffs, val(b_coeffs, x)) * deriv(b_coeffs, x) - val(f_coeffs, val(a_coeffs, x)) * deriv(a_coeffs, x)`,
    testCases: [
      { input: [[1], [0, 2], [1, 1], 3], expected: -1 },
      { input: [[0, 1], [1], [0, 1], 2], expected: 2 },
      { input: [[2, 0, 1], [0, 0, 1], [1], 1], expected: -6 },
    ],
    hint: "Evaluate the integrand at each moving endpoint, then multiply by that endpoint's derivative.",
  },
  {
    id: "ca-304",
    title: "Numerical Arc Length of a Polynomial",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the arc length of y = f(x) on [a, b] with the midpoint sum of sqrt(1 + f'(x)^2) * dx over n equal subintervals.\n\nGiven polynomial coefficients, a, b, and n, return the estimate.",
    starterCode: `def numerical_arc_length(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def numerical_arc_length(coeffs, a, b, n):
    import math
    def fprime(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    dx = (b - a) / n
    total = 0.0
    for k in range(n):
        x = a + (k + 0.5) * dx
        total += math.sqrt(1.0 + fprime(x) ** 2)
    return total * dx`,
    testCases: [
      { input: [[0, 0, 1], 0, 1, 100], expected: 1.4789354039742377 },
      { input: [[1, 1], 0, 2, 4], expected: 2.8284271247461903 },
      { input: [[0, 0, 0], 0, 1, 10], expected: 1.0 },
    ],
    hint: "Integrate the speed sqrt(1 + (f')^2); a flat line gives the plain distance.",
  },
  {
    id: "ca-305",
    title: "Surface Area of Revolution Numeric",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The surface area of the solid formed by rotating y = f(x) about the x-axis is the integral of 2 * pi * f(x) * sqrt(1 + f'(x)^2) dx.\n\nApproximate it with the midpoint rule over n equal subintervals. Given polynomial coefficients, a, b, and n, return the estimate.",
    starterCode: `def surface_area_revolution(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def surface_area_revolution(coeffs, a, b, n):
    import math
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def fprime(t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    dx = (b - a) / n
    total = 0.0
    for k in range(n):
        x = a + (k + 0.5) * dx
        total += f(x) * math.sqrt(1.0 + fprime(x) ** 2)
    return 2.0 * math.pi * total * dx`,
    testCases: [
      { input: [[0, 1], 0, 2, 50], expected: 17.771531752633464 },
      { input: [[1], 0, 3, 6], expected: 18.84955592153876 },
      { input: [[0, 0, 0], 0, 1, 5], expected: 0.0 },
    ],
    hint: "The integrand is circumference 2*pi*f(x) times the arc-length factor.",
  },
  {
    id: "ca-306",
    title: "Fundamental Theorem Net Change",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The fundamental theorem of calculus gives the integral of f' over [a, b] as f(b) - f(a).\n\nGiven polynomial coefficients, a, and b, return the net change.",
    starterCode: `def ftc_net_change(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def ftc_net_change(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return f(b) - f(a)`,
    testCases: [
      { input: [[1, 2, 3], 0, 2], expected: 16 },
      { input: [[0, 0, 1], -1, 1], expected: 0 },
      { input: [[4], 1, 9], expected: 0 },
    ],
    hint: "Evaluate the antiderivative at both endpoints and subtract.",
  },
  {
    id: "ca-307",
    title: "Average Value Point for a Line",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a linear function f(x) = c0 + c1 * x on [a, b], the average value is attained at the midpoint of the interval.\n\nGiven c0, c1, a, and b, return the point c where f(c) equals the average value.",
    starterCode: `def average_value_point_linear(c0, c1, a, b):
    # Your code here
    pass`,
    solution: `def average_value_point_linear(c0, c1, a, b):
    return 0.5 * (a + b)`,
    testCases: [
      { input: [1, 2, 0, 4], expected: 2.0 },
      { input: [0, 5, -3, 7], expected: 2.0 },
      { input: [10, -1, 2, 6], expected: 4.0 },
    ],
    hint: "A line is symmetric about its midpoint.",
  },
  {
    id: "ca-308",
    title: "Taylor Coefficients from Derivatives",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "If f has derivatives d_k = f^(k)(0) at zero, its Maclaurin series is sum_k (d_k / k!) x^k.\n\nGiven the list of derivatives in order k = 0, 1, 2, ..., return the corresponding Taylor coefficients.",
    starterCode: `def taylor_coefficients_from_derivatives(derivatives):
    # Your code here
    pass`,
    solution: `def taylor_coefficients_from_derivatives(derivatives):
    import math
    return [d / math.factorial(k) for k, d in enumerate(derivatives)]`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: [1.0, 1.0, 0.5, 0.16666666666666666] },
      { input: [[0, 2, 0, 6]], expected: [0.0, 2.0, 0.0, 1.0] },
      { input: [[1, 0, -1]], expected: [1.0, 0.0, -0.5] },
    ],
    hint: "Divide the k-th derivative by k factorial.",
  },
  {
    id: "ca-309",
    title: "Taylor Sine Series Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Maclaurin series of sin(x) is sum_{k>=0} (-1)^k x^(2k+1) / (2k+1)!.\n\nGiven x and the number of terms, return the partial sum.",
    starterCode: `def taylor_sine_series_value(x, terms):
    # Your code here
    pass`,
    solution: `def taylor_sine_series_value(x, terms):
    import math
    total = 0.0
    for k in range(terms):
        total += ((-1) ** k) * x ** (2 * k + 1) / math.factorial(2 * k + 1)
    return total`,
    testCases: [
      { input: [1.0, 5], expected: 0.8414710097001764 },
      { input: [0.5, 3], expected: 0.47942708333333334 },
      { input: [-2.0, 8], expected: -0.9092974264614476 },
    ],
    hint: "Alternate signs and use odd factorials.",
  },
  {
    id: "ca-310",
    title: "Taylor Remainder Bound Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "If |f^(n+1)| <= M on an interval, the Taylor remainder after n terms is bounded by M * |x - a|^(n+1) / (n+1)!.\n\nGiven M, x, a, and the order n, return the bound.",
    starterCode: `def taylor_remainder_bound_value(m, x, a, order):
    # Your code here
    pass`,
    solution: `def taylor_remainder_bound_value(m, x, a, order):
    import math
    return m * abs(x - a) ** (order + 1) / math.factorial(order + 1)`,
    testCases: [
      { input: [1.0, 0.5, 0.0, 3], expected: 0.0026041666666666665 },
      { input: [2.0, 1.0, 0.0, 4], expected: 0.016666666666666666 },
      { input: [5.0, 3.0, 1.0, 2], expected: 6.666666666666667 },
    ],
    hint: "Raise the displacement to one power beyond the last included term.",
  },
  {
    id: "ca-311",
    title: "Newton Step for a Nonlinear System",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For the system f1(x, y) = x^2 + y - 3 and f2(x, y) = x - y^2 + 2, the Jacobian is [[2x, 1], [1, -2y]].\n\nA Newton step is p - J^{-1} F(p). Given the point [x, y], return the updated point. Assume the Jacobian is invertible there.",
    starterCode: `def newton_step_nonlinear_system(point):
    # Your code here
    pass`,
    solution: `def newton_step_nonlinear_system(point):
    x, y = point
    f = [x * x + y - 3.0, x - y * y + 2.0]
    j = [[2.0 * x, 1.0], [1.0, -2.0 * y]]
    det = j[0][0] * j[1][1] - j[0][1] * j[1][0]
    inv = [[j[1][1] / det, -j[0][1] / det], [-j[1][0] / det, j[0][0] / det]]
    step = [inv[0][0] * f[0] + inv[0][1] * f[1], inv[1][0] * f[0] + inv[1][1] * f[1]]
    return [x - step[0], y - step[1]]`,
    testCases: [
      { input: [[1, 1]], expected: [1.0, 2.0] },
      { input: [[2, 0]], expected: [-2.0, 15.0] },
      { input: [[0, 2]], expected: [6.0, 3.0] },
    ],
    hint: "Build F and J at the point, invert the 2x2 Jacobian, then subtract J^{-1}F.",
  },
  {
    id: "ca-312",
    title: "Halley Method Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Halley's method uses the second derivative for cubic convergence: x_new = x - 2 f f' / (2 (f')^2 - f f'').\n\nGiven polynomial coefficients and the point x, return the updated point.",
    starterCode: `def halley_method_step(coeffs, x):
    # Your code here
    pass`,
    solution: `def halley_method_step(coeffs, x):
    f = sum(c * x ** i for i, c in enumerate(coeffs))
    fp = sum(i * c * x ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    fpp = sum(i * (i - 1) * c * x ** (i - 2) for i, c in enumerate(coeffs) if i > 1)
    return x - 2.0 * f * fp / (2.0 * fp * fp - f * fpp)`,
    testCases: [
      { input: [[1, 0, 1], 1.0], expected: -1.0 },
      { input: [[-2, 0, 1], 2.0], expected: 1.4285714285714286 },
      { input: [[-1, 0, 1], 0.5], expected: 0.9285714285714286 },
    ],
    hint: "Evaluate f, f', and f'' at x, then apply the Halley update.",
  },
  {
    id: "ca-313",
    title: "Secant Method Two Steps",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The secant method iterates x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1})).\n\nGiven polynomial coefficients and two starting points x0, x1, return the point after two iterations.",
    starterCode: `def secant_method_two_steps(coeffs, x0, x1):
    # Your code here
    pass`,
    solution: `def secant_method_two_steps(coeffs, x0, x1):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    a, b = x0, x1
    for _ in range(2):
        fa, fb = f(a), f(b)
        nxt = b - fb * (b - a) / (fb - fa)
        a, b = b, nxt
    return b`,
    testCases: [
      { input: [[-2, 0, 1], 0.0, 1.0], expected: 1.3333333333333335 },
      { input: [[-1, 0, 0, 1], 1.0, 2.0], expected: 1.0 },
      { input: [[-4, 0, 1], 1.0, 3.0], expected: 1.9473684210526316 },
    ],
    hint: "Update the pair (x_{n-1}, x_n) twice in a loop.",
  },
  {
    id: "ca-314",
    title: "Rational Function Limit at Infinity",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a rational function num(x) / den(x), the limit at infinity depends on the degrees: 0.0 when the denominator degree is larger, the ratio of leading coefficients when they match, and None when the numerator degree is larger (the limit diverges).\n\nGiven coefficient lists in ascending order, return the limit or None.",
    starterCode: `def rational_limit_at_infinity(num, den):
    # Your code here
    pass`,
    solution: `def rational_limit_at_infinity(num, den):
    dn = len(num) - 1
    dd = len(den) - 1
    while dn > 0 and num[dn] == 0:
        dn -= 1
    while dd > 0 and den[dd] == 0:
        dd -= 1
    if dn < dd:
        return 0.0
    if dn == dd:
        return num[dn] / den[dd]
    return None`,
    testCases: [
      { input: [[1, 2], [1, 0, 1]], expected: 0.0 },
      { input: [[3, 0, 2], [1, 1]], expected: null },
      { input: [[5, 1, 0, 0], [2, 1]], expected: 1.0 },
    ],
    hint: "Compare the highest nonzero degrees, then the leading coefficients.",
  },
  {
    id: "ca-315",
    title: "L Hopital Iteration Count",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "To evaluate the limit of num(x) / den(x) at x0, apply L'Hopital's rule repeatedly until the denominator is nonzero at x0, then evaluate the ratio of derivatives.\n\nGiven coefficient lists in ascending order and x0, return [applications, limit], where applications is the number of differentiations (capped at 10) and limit is None if the denominator remains zero after the cap.",
    starterCode: `def lhopital_iteration_count(num, den, x0):
    # Your code here
    pass`,
    solution: `def lhopital_iteration_count(num, den, x0):
    def val(cs):
        return sum(c * x0 ** i for i, c in enumerate(cs))
    def deriv(cs):
        return [i * c for i, c in enumerate(cs) if i > 0]
    k = 0
    while k < 10 and val(den) == 0:
        num = deriv(num)
        den = deriv(den)
        k += 1
    if val(den) == 0 or not den:
        return [k, None]
    return [k, val(num) / val(den)]`,
    testCases: [
      { input: [[-1, 0, 1], [-1, 1], 1.0], expected: [1, 2.0] },
      { input: [[-2, 0, 0, 1], [-1, 0, 1], 1.0], expected: [1, 1.5] },
      { input: [[1, 0, 0], [1, 0], 0.0], expected: [0, 1.0] },
    ],
    hint: "Differentiate numerator and denominator together and count the rounds.",
  },
];
