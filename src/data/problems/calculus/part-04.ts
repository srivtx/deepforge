import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-096",
    title: "Gauss-Legendre 2-Point Integration",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Approximate the integral of f(x) = sum(coeffs[i] * x^i) over [a, b] with the 2-point Gauss-Legendre rule:\n\nintegral ≈ (b - a)/2 * (f(m - d) + f(m + d))\n\nwhere m = (a + b)/2 and d = (b - a)/(2*sqrt(3)). The rule is exact for polynomials up to degree 3.",
    starterCode: `def gauss_legendre_2(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def gauss_legendre_2(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    d = (b - a) / (2.0 * 3.0 ** 0.5)
    mid = (a + b) / 2.0
    return (b - a) / 2.0 * (f(mid - d) + f(mid + d))`,
    testCases: [
      { input: [[0, 0, 1], 0, 2], expected: 2.6666666666666665 },
      { input: [[0, 0, 0, 1], -1, 1], expected: 0.0 },
      { input: [[1], 0, 5], expected: 5.0 },
      { input: [[0, 1], 0, 4], expected: 8.0 },
      { input: [[0, 0, 0, 0, 1], -1, 1], expected: 0.22222222222222235 },
    ],
    hint: "Shift the standard nodes ±1/sqrt(3) from [-1, 1] onto the interval [a, b].",
  },
  {
    id: "ca-097",
    title: "Richardson Extrapolation",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Richardson extrapolation cancels the leading O(h^2) error term of a numerical approximation.\n\nGiven two estimates d_h and d_half computed with step sizes h and h/2, return the extrapolated value (4*d_half - d_h) / 3.",
    starterCode: `def richardson(d_h, d_half):
    # Your code here
    pass`,
    solution: `def richardson(d_h, d_half):
    return (4.0 * d_half - d_h) / 3.0`,
    testCases: [
      { input: [1.1, 1.025], expected: 0.9999999999999999 },
      { input: [0.26, 0.065], expected: 0.0 },
      { input: [1, 1], expected: 1.0 },
      { input: [2.0, 1.5], expected: 1.3333333333333333 },
    ],
    hint: "The weights 4/3 and -1/3 eliminate the h squared term.",
  },
  {
    id: "ca-098",
    title: "Fixed-Point Stability Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A fixed point x* of x = g(x) is locally attracting when |g'(x*)| < 1.\n\nGiven the polynomial coefficients of g(x) = sum(coeffs[i] * x^i) and the fixed point x, return True when the iteration is stable and False otherwise.",
    starterCode: `def fixed_point_stable(coeffs, x):
    # Return True when abs(g'(x)) < 1
    # Your code here
    pass`,
    solution: `def fixed_point_stable(coeffs, x):
    dg = sum(i * c * x ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    return abs(dg) < 1.0`,
    testCases: [
      { input: [[0, 0.5], 2], expected: true },
      { input: [[0, 2], 1], expected: false },
      { input: [[1, 0, -1], 0], expected: true },
      { input: [[3, 0, 0], 1], expected: true },
      { input: [[0, 1, -0.5], 0.5], expected: true },
    ],
    hint: "Differentiate g term by term and test the magnitude of the derivative at the point.",
  },
  {
    id: "ca-099",
    title: "Taylor Remainder Bound",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For f(x) = e^x expanded about 0, the Lagrange remainder after the degree-n term on [0, a] satisfies |R_n| <= e^a * a^(n+1) / (n+1)!.\n\nReturn this bound for a >= 0 and n >= 0.",
    starterCode: `def taylor_remainder_bound(a, n):
    # Your code here
    pass`,
    solution: `def taylor_remainder_bound(a, n):
    import math
    fact = 1
    for i in range(1, n + 2):
        fact *= i
    return math.exp(a) * a ** (n + 1) / fact`,
    testCases: [
      { input: [1, 5], expected: 0.0037753914284153404 },
      { input: [0, 10], expected: 0.0 },
      { input: [2, 3], expected: 4.9260373992871 },
      { input: [0.5, 4], expected: 0.0004293544975781584 },
    ],
    hint: "The bound uses the maximum of the (n+1)-th derivative on the interval, which is e^a for e^x.",
  },
  {
    id: "ca-100",
    title: "Lagrange Interpolation Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the Lagrange interpolating polynomial through the given points at x.\n\npoints is a list of [x_i, y_i] pairs and the result is sum over i of y_i times the product over j != i of (x - x_j) / (x_i - x_j). A single point returns its y value everywhere.",
    starterCode: `def lagrange_interpolate(points, x):
    # Your code here
    pass`,
    solution: `def lagrange_interpolate(points, x):
    total = 0.0
    for i in range(len(points)):
        term = points[i][1]
        for j in range(len(points)):
            if i != j:
                term *= (x - points[j][0]) / (points[i][0] - points[j][0])
        total += term
    return total`,
    testCases: [
      { input: [[[0, 1], [1, 3]], 2], expected: 5.0 },
      { input: [[[0, 0], [1, 1], [2, 4]], 3], expected: 9.0 },
      { input: [[[0, 0], [1, 1], [2, 4]], 0.5], expected: 0.25 },
      { input: [[[-1, 1], [1, 1]], 0], expected: 1.0 },
      { input: [[[2, 5]], 7], expected: 5.0 },
    ],
    hint: "Each basis polynomial equals 1 at its own node and 0 at every other node.",
  },
  {
    id: "ca-101",
    title: "Bezier Curve Point",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate a Bezier curve at parameter t in [0, 1] with de Casteljau's algorithm.\n\npoints is a list of 2D control points; repeatedly replace each consecutive pair by its linear interpolation at t until one point remains, and return that point as [x, y].",
    starterCode: `def bezier_point(points, t):
    # Your code here
    pass`,
    solution: `def bezier_point(points, t):
    pts = [[float(p[0]), float(p[1])] for p in points]
    while len(pts) > 1:
        nxt = []
        for i in range(len(pts) - 1):
            nxt.append([
                (1 - t) * pts[i][0] + t * pts[i + 1][0],
                (1 - t) * pts[i][1] + t * pts[i + 1][1],
            ])
        pts = nxt
    return pts[0]`,
    testCases: [
      { input: [[[0, 0], [1, 2], [2, 0]], 0.5], expected: [1.0, 1.0] },
      { input: [[[0, 0], [1, 2], [2, 0]], 0], expected: [0.0, 0.0] },
      { input: [[[0, 0], [1, 2], [2, 0]], 1], expected: [2.0, 0.0] },
      { input: [[[0, 0], [0, 1], [1, 1], [1, 0]], 0.5], expected: [0.5, 0.75] },
      { input: [[[1, 2], [3, 6]], 0.25], expected: [1.5, 3.0] },
    ],
    hint: "de Casteljau builds the point from repeated linear interpolations, which is numerically stable.",
  },
  {
    id: "ca-102",
    title: "Legendre Polynomial Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the Legendre polynomial P_n(x) with the Bonnet recurrence:\n\nP_0 = 1, P_1 = x, and (k+1) * P_{k+1} = (2k+1) * x * P_k - k * P_{k-1}\n\nAssume n >= 0.",
    starterCode: `def legendre_p(n, x):
    # Your code here
    pass`,
    solution: `def legendre_p(n, x):
    if n == 0:
        return 1.0
    p_prev = 1.0
    p_cur = x
    for k in range(1, n):
        p_next = ((2 * k + 1) * x * p_cur - k * p_prev) / (k + 1)
        p_prev = p_cur
        p_cur = p_next
    return p_cur`,
    testCases: [
      { input: [0, 0.5], expected: 1.0 },
      { input: [1, 0.5], expected: 0.5 },
      { input: [2, 0.5], expected: -0.125 },
      { input: [3, 1], expected: 1.0 },
      { input: [4, 0.5], expected: -0.2890625 },
    ],
    hint: "Carry the two previous polynomials and apply the three-term recurrence.",
  },
  {
    id: "ca-103",
    title: "Chebyshev Polynomial Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the Chebyshev polynomial of the first kind T_n(x) with the recurrence:\n\nT_0 = 1, T_1 = x, T_{k+1} = 2 * x * T_k - T_{k-1}\n\nAssume n >= 0.",
    starterCode: `def chebyshev_t(n, x):
    # Your code here
    pass`,
    solution: `def chebyshev_t(n, x):
    if n == 0:
        return 1.0
    t_prev = 1.0
    t_cur = x
    for k in range(1, n):
        t_next = 2 * x * t_cur - t_prev
        t_prev = t_cur
        t_cur = t_next
    return t_cur`,
    testCases: [
      { input: [0, 0.3], expected: 1.0 },
      { input: [2, 0.5], expected: -0.5 },
      { input: [3, 0], expected: 0.0 },
      { input: [4, 1], expected: 1.0 },
      { input: [5, -1], expected: -1.0 },
    ],
    hint: "On [-1, 1] this equals cos(n * arccos(x)), and T_n(-1) = (-1)^n.",
  },
  {
    id: "ca-104",
    title: "Hermite Polynomial Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Evaluate the physicists' Hermite polynomial H_n(x) with the recurrence:\n\nH_0 = 1, H_1 = 2x, H_{k+1} = 2 * x * H_k - 2 * k * H_{k-1}\n\nAssume n >= 0.",
    starterCode: `def hermite_h(n, x):
    # Your code here
    pass`,
    solution: `def hermite_h(n, x):
    if n == 0:
        return 1.0
    h_prev = 1.0
    h_cur = 2.0 * x
    for k in range(1, n):
        h_next = 2 * x * h_cur - 2 * k * h_prev
        h_prev = h_cur
        h_cur = h_next
    return h_cur`,
    testCases: [
      { input: [0, 3], expected: 1.0 },
      { input: [1, 3], expected: 6.0 },
      { input: [2, 0.5], expected: -1.0 },
      { input: [3, 1], expected: -4.0 },
      { input: [4, 0.5], expected: 1.0 },
    ],
    hint: "The recurrence coefficient 2k distinguishes this convention from the probabilists' version.",
  },
  {
    id: "ca-105",
    title: "Laplace Transform of Sine and Cosine",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Return the Laplace transforms of sin(a*t) and cos(a*t) at s as [L_sin, L_cos].\n\nL{sin(a t)} = a / (s^2 + a^2) and L{cos(a t)} = s / (s^2 + a^2). Assume s > 0; a may be zero.",
    starterCode: `def laplace_sin_cos(a, s):
    # Return [L_sin, L_cos]
    # Your code here
    pass`,
    solution: `def laplace_sin_cos(a, s):
    den = s * s + a * a
    return [a / den, s / den]`,
    testCases: [
      { input: [1, 1], expected: [0.5, 0.5] },
      { input: [2, 1], expected: [0.4, 0.2] },
      { input: [0, 1], expected: [0.0, 1.0] },
      { input: [3, 4], expected: [0.12, 0.16] },
      { input: [1, 2], expected: [0.2, 0.4] },
    ],
    hint: "Both transforms share the denominator s^2 + a^2.",
  },
  {
    id: "ca-106",
    title: "Logistic Derivative at Point",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The logistic solution is y(t) = k / (1 + ((k - y0) / y0) * e^(-r*t)). Its rate of change is y'(t) = r * y(t) * (1 - y(t) / k).\n\nGiven t, the initial population y0 > 0, the rate r, and the carrying capacity k, compute y(t) and return the derivative at that time.",
    starterCode: `def logistic_derivative(t, y0, r, k):
    # Your code here
    pass`,
    solution: `def logistic_derivative(t, y0, r, k):
    import math
    y = k / (1.0 + ((k - y0) / y0) * math.exp(-r * t))
    return r * y * (1 - y / k)`,
    testCases: [
      { input: [0, 10, 1, 100], expected: 9.0 },
      { input: [10, 10, 1, 100], expected: 0.04082656655153957 },
      { input: [1, 50, 1, 100], expected: 19.66119332414819 },
      { input: [0, 4, 0.5, 8], expected: 1.0 },
    ],
    hint: "First evaluate the closed-form population, then plug it into the logistic rate law.",
  },
  {
    id: "ca-107",
    title: "Gompertz Growth Value",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The Gompertz growth model has the solution y(t) = k * exp(-b * exp(-c * t)), where k is the asymptote and b, c control the shape.\n\nGiven t, k, b, and c, return y(t).",
    starterCode: `def gompertz_value(t, k, b, c):
    # Your code here
    pass`,
    solution: `def gompertz_value(t, k, b, c):
    import math
    return k * math.exp(-b * math.exp(-c * t))`,
    testCases: [
      { input: [0, 100, 1, 1], expected: 36.787944117144235 },
      { input: [1, 100, 1, 1], expected: 69.22006275553464 },
      { input: [10, 100, 1, 1], expected: 99.99546011007988 },
      { input: [0, 50, 0, 1], expected: 50.0 },
    ],
    hint: "As t grows, the inner exponential vanishes and y approaches k.",
  },
  {
    id: "ca-108",
    title: "Normal Tail Integral",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Compute the upper tail probability P(Z > z) of the standard normal distribution.\n\nThis equals 0.5 * erfc(z / sqrt(2)), where erfc is the complementary error function available in the math module. The value is finite for every finite z.",
    starterCode: `def normal_tail(z):
    # Your code here
    pass`,
    solution: `def normal_tail(z):
    import math
    return 0.5 * math.erfc(z / (2.0 ** 0.5))`,
    testCases: [
      { input: [0], expected: 0.5 },
      { input: [1], expected: 0.15865525393145705 },
      { input: [1.96], expected: 0.02499789514822043 },
      { input: [-1], expected: 0.8413447460685429 },
      { input: [3], expected: 0.0013498980316300957 },
    ],
    hint: "Convert the normal integral to the complementary error function by rescaling the variable.",
  },
  {
    id: "ca-109",
    title: "Euler-Lagrange Discrete Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The discrete Euler-Lagrange equation for L = 0.5*m*((x_k - x_{k-1})/dt)^2 - 0.5*k*x_k^2 gives the update:\n\nx_{k+1} = 2*x_k - x_{k-1} - (dt^2 * k / m) * x_k\n\nGiven the previous two positions and the parameters, return the next position.",
    starterCode: `def discrete_euler_lagrange(x_prev, x_curr, dt, m, k):
    # Your code here
    pass`,
    solution: `def discrete_euler_lagrange(x_prev, x_curr, dt, m, k):
    return 2 * x_curr - x_prev - (dt * dt * k / m) * x_curr`,
    testCases: [
      { input: [0, 1, 0.1, 1, 1], expected: 1.99 },
      { input: [1, 1, 0.1, 1, 1], expected: 0.99 },
      { input: [0, 1, 0, 1, 1], expected: 2.0 },
      { input: [2, 0, 0.5, 2, 4], expected: -2.0 },
    ],
    hint: "This is a discrete version of Newton's second law written as a two-step recurrence.",
  },
  {
    id: "ca-110",
    title: "Noether Conserved Quantity Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a 1D conservative system with L = 0.5*m*v^2 - 0.5*k*x^2, time-translation symmetry yields the conserved energy:\n\nE = 0.5*m*v^2 + 0.5*k*x^2\n\nGiven m, k, x, and v, return E.",
    starterCode: `def conserved_energy(m, k, x, v):
    # Your code here
    pass`,
    solution: `def conserved_energy(m, k, x, v):
    return 0.5 * m * v * v + 0.5 * k * x * x`,
    testCases: [
      { input: [1, 1, 1, 0], expected: 0.5 },
      { input: [2, 4, 0, 3], expected: 9.0 },
      { input: [1, 1, 0, 0], expected: 0.0 },
      { input: [1, 2, 3, 4], expected: 17.0 },
      { input: [2, 1, -1, -2], expected: 4.5 },
    ],
    hint: "Add the kinetic and potential energies; the sign on the potential flips relative to the Lagrangian.",
  },
  {
    id: "ca-111",
    title: "Gradient Flow Energy Step",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Take one gradient-flow (steepest descent) step on the energy V(x) = 0.5*a*x^2 + 0.25*b*x^4 and return the energy at the new point.\n\nThe update is x_new = x - lr * V'(x) with V'(x) = a*x + b*x^3, so the result is V(x_new).",
    starterCode: `def gradient_flow_energy(x, lr, a, b):
    # Your code here
    pass`,
    solution: `def gradient_flow_energy(x, lr, a, b):
    def v(t):
        return 0.5 * a * t * t + 0.25 * b * t ** 4
    grad = a * x + b * x ** 3
    x_new = x - lr * grad
    return v(x_new)`,
    testCases: [
      { input: [1, 0.1, 1, 0], expected: 0.405 },
      { input: [2, 0.25, 1, 1], expected: 0.140625 },
      { input: [0, 0.5, 1, 1], expected: 0.0 },
      { input: [1, 0, 1, 1], expected: 0.75 },
    ],
    hint: "Gradient flow moves down the energy; a small step should reduce V.",
  },
  {
    id: "ca-112",
    title: "Romberg One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Apply one step of Romberg integration to f(x) = sum(coeffs[i] * x^i) on [a, b].\n\nCompute the composite trapezoidal rule with n subintervals (t1) and with 2n subintervals (t2), then return the extrapolated value (4*t2 - t1) / 3. Assume n >= 1.",
    starterCode: `def romberg_one_step(coeffs, a, b, n):
    # Your code here
    pass`,
    solution: `def romberg_one_step(coeffs, a, b, n):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    def trap(intervals):
        if intervals <= 0:
            return 0.0
        dx = (b - a) / intervals
        total = 0.5 * (f(a) + f(b))
        for i in range(1, intervals):
            total += f(a + i * dx)
        return total * dx
    t1 = trap(n)
    t2 = trap(2 * n)
    return (4.0 * t2 - t1) / 3.0`,
    testCases: [
      { input: [[0, 0, 1], 0, 2, 2], expected: 2.6666666666666665 },
      { input: [[0, 0, 0, 1], 0, 1, 1], expected: 0.25 },
      { input: [[1], 0, 3, 1], expected: 3.0 },
      { input: [[0, 0, 0, 0, 1], 0, 1, 2], expected: 0.20052083333333334 },
    ],
    hint: "Romberg combines two trapezoidal approximations to cancel the leading error term.",
  },
  {
    id: "ca-113",
    title: "Adaptive Simpson Decision",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Decide whether an adaptive Simpson step can accept its refined estimate.\n\nf_vals holds f at [a, m_l, m, m_r, b] and width = b - a. Compute the whole-interval estimate S1 = width/6 * (fa + 4 fm + fb) and the refined estimate S2 = width/12 * (fa + 4 fam + 2 fm + 4 fmb + fb). Return [S2, accepted] where accepted is True when |S2 - S1| / 15 < tol.",
    starterCode: `def adaptive_simpson_decision(f_vals, width, tol):
    # Return [refined_estimate, accepted]
    # Your code here
    pass`,
    solution: `def adaptive_simpson_decision(f_vals, width, tol):
    fa, fam, fm, fmb, fb = f_vals
    s_whole = width / 6.0 * (fa + 4.0 * fm + fb)
    s_ref = width / 12.0 * (fa + 4.0 * fam + 2.0 * fm + 4.0 * fmb + fb)
    error = abs(s_ref - s_whole) / 15.0
    return [s_ref, error < tol]`,
    testCases: [
      { input: [[0, 0.0625, 0.25, 0.5625, 1], 1, 1e-6], expected: [0.3333333333333333, true] },
      {
        input: [[0, 0.00390625, 0.0625, 0.31640625, 1], 1, 1e-3],
        expected: [0.20052083333333331, true],
      },
      {
        input: [[0, 0.00390625, 0.0625, 0.31640625, 1], 1, 1e-4],
        expected: [0.20052083333333331, false],
      },
      { input: [[1, 1, 1, 1, 1], 2, 1e-6], expected: [2.0, true] },
    ],
    hint: "The factor 15 comes from Simpson's error expansion when halving the interval.",
  },
  {
    id: "ca-114",
    title: "Curvature of a Curve",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Compute the curvature of the parametric curve (x(t), y(t)) given by polynomial coefficient lists:\n\nkappa = |x' * y'' - y' * x''| / (x'^2 + y'^2)^(3/2)\n\nEvaluate all derivatives at the parameter t and return kappa.",
    starterCode: `def curvature(x_coeffs, y_coeffs, t):
    # Your code here
    pass`,
    solution: `def curvature(x_coeffs, y_coeffs, t):
    def d1(coeffs, u):
        return sum(i * c * u ** (i - 1) for i, c in enumerate(coeffs) if i > 0)
    def d2(coeffs, u):
        return sum(i * (i - 1) * c * u ** (i - 2) for i, c in enumerate(coeffs) if i > 1)
    xp = d1(x_coeffs, t)
    yp = d1(y_coeffs, t)
    xpp = d2(x_coeffs, t)
    ypp = d2(y_coeffs, t)
    return abs(xp * ypp - yp * xpp) / (xp * xp + yp * yp) ** 1.5`,
    testCases: [
      { input: [[0, 1], [0, 0, 1], 0], expected: 2.0 },
      { input: [[0, 1], [0, 0, 1], 1], expected: 0.17888543819998318 },
      { input: [[0, 1], [0, 3], 2], expected: 0.0 },
      { input: [[1, 0, -1], [0, 2], 0], expected: 0.5 },
    ],
    hint: "The numerator is the 2D cross product of the velocity and acceleration.",
  },
  {
    id: "ca-115",
    title: "Divergence and Curl Numeric Check",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Estimate the divergence and scalar curl of the 2D field F = [P(x, y), Q(x, y)] at a point with central differences (h = 1e-6).\n\nEach component is given as a coefficient grid where coeffs[i][j] multiplies x^i * y^j; ragged rows are allowed. Return [div, curl] = [dP/dx + dQ/dy, dQ/dx - dP/dy].",
    starterCode: `def div_curl_numeric(p_coeffs, q_coeffs, x, y, h=1e-6):
    # Return [divergence, curl]
    # Your code here
    pass`,
    solution: `def div_curl_numeric(p_coeffs, q_coeffs, x, y, h=1e-6):
    def ev(coeffs, u, v):
        total = 0.0
        for i, row in enumerate(coeffs):
            for j, c in enumerate(row):
                total += c * u ** i * v ** j
        return total
    dp_dx = (ev(p_coeffs, x + h, y) - ev(p_coeffs, x - h, y)) / (2 * h)
    dp_dy = (ev(p_coeffs, x, y + h) - ev(p_coeffs, x, y - h)) / (2 * h)
    dq_dx = (ev(q_coeffs, x + h, y) - ev(q_coeffs, x - h, y)) / (2 * h)
    dq_dy = (ev(q_coeffs, x, y + h) - ev(q_coeffs, x, y - h)) / (2 * h)
    return [dp_dx + dq_dy, dq_dx - dp_dy]`,
    testCases: [
      {
        input: [[[0, 0, 1], [0, 0], [1, 0]], [[0, 0, -1], [0, 0], [1, 0]], 1, 2],
        expected: [-2.0, -2.0],
      },
      { input: [[[0, 0], [0, 1]], [[0, 0], [0, 1]], 3, 4], expected: [7.0, 1.0] },
      { input: [[[0], [1]], [[0, 1]], 5, -2], expected: [2.0, 0.0] },
      { input: [[[0, -1]], [[0], [1]], 1, 1], expected: [0.0, 2.0] },
    ],
    hint: "Perturb one coordinate at a time for each component, then combine the four partials.",
  },
  {
    id: "ca-116",
    title: "Newton for 2x2 System One Step",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Take one Newton step for the system f1 = x^2 + y^2 - 25 = 0 and f2 = x - y - 1 = 0.\n\nThe Jacobian is [[2x, 2y], [1, -1]]. Solve J * [dx, dy] = -[f1, f2] with Cramer's rule and return the updated point [x + dx, y + dy].",
    starterCode: `def newton_system_2x2(point):
    # Your code here
    pass`,
    solution: `def newton_system_2x2(point):
    x = point[0]
    y = point[1]
    f1 = x * x + y * y - 25.0
    f2 = x - y - 1.0
    a = 2 * x
    b = 2 * y
    c = 1.0
    d = -1.0
    det = a * d - b * c
    dx = (-f1 * d + b * f2) / det
    dy = (-a * f2 + f1 * c) / det
    return [x + dx, y + dy]`,
    testCases: [
      { input: [[3, 4]], expected: [4.142857142857142, 3.142857142857143] },
      { input: [[4, 3]], expected: [4.0, 3.0] },
      { input: [[5, 0]], expected: [5.0, 4.0] },
      { input: [[1, 1]], expected: [7.25, 6.25] },
    ],
    hint: "Evaluate f and J at the current point, then solve the 2x2 linear system.",
  },
  {
    id: "ca-117",
    title: "Broyden 1D Update",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Apply one Broyden update to the secant slope estimate and take the next quasi-Newton step.\n\nGiven the previous points x0, x1, the old slope b0, and f(x) = sum(coeffs[i] * x^i), update b1 = b0 + (f(x1) - f(x0) - b0*(x1 - x0)) / (x1 - x0), then set x2 = x1 - f(x1) / b1. Return [b1, x2]. In 1D the update reduces to the secant slope, so b0 cancels out.",
    starterCode: `def broyden_update(coeffs, x0, x1, b0):
    # Return [b1, x2]
    # Your code here
    pass`,
    solution: `def broyden_update(coeffs, x0, x1, b0):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    f0 = f(x0)
    f1 = f(x1)
    b1 = b0 + (f1 - f0 - b0 * (x1 - x0)) / (x1 - x0)
    x2 = x1 - f1 / b1
    return [b1, x2]`,
    testCases: [
      { input: [[-2, 0, 1], 1, 2, 1], expected: [3.0, 1.3333333333333335] },
      { input: [[-2, 0, 1], 1, 2, 10], expected: [3.0, 1.3333333333333335] },
      { input: [[0, 0, 1], 1, 2, 2], expected: [3.0, 0.6666666666666667] },
      { input: [[-2, -1, 0, 1], 2, 1.5, 0], expected: [8.25, 1.5151515151515151] },
    ],
    hint: "The rank-one update enforces the secant condition at the new pair of points.",
  },
  {
    id: "ca-118",
    title: "Inverse Laplace Partial-Fraction Coefficients",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Decompose F(s) = (s + c) / ((s - a) * (s - b)) into partial fractions A / (s - a) + B / (s - b).\n\nCover-up gives A = (a + c) / (a - b) and B = (b + c) / (b - a). Return [A, B]. Assume a != b.",
    starterCode: `def partial_fraction_coeffs(a, b, c):
    # Return [A, B]
    # Your code here
    pass`,
    solution: `def partial_fraction_coeffs(a, b, c):
    return [(a + c) / (a - b), (b + c) / (b - a)]`,
    testCases: [
      { input: [1, -2, 3], expected: [1.3333333333333333, -0.3333333333333333] },
      { input: [0, -1, 0], expected: [0.0, 1.0] },
      { input: [2, 3, 5], expected: [-7.0, 8.0] },
      { input: [-1, 1, -1], expected: [1.0, 0.0] },
    ],
    hint: "Evaluate the numerator at each pole after cancelling the corresponding factor.",
  },
  {
    id: "ca-119",
    title: "Fourier Square-Wave Coefficient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the unit-amplitude square wave on (-pi, pi), the Fourier sine coefficient is b_n = 4 / (n * pi) for odd n and 0 for even n.\n\nGiven a positive integer n, return b_n using 3.141592653589793 for pi.",
    starterCode: `def square_wave_coefficient(n):
    # Your code here
    pass`,
    solution: `def square_wave_coefficient(n):
    if n % 2 == 0:
        return 0.0
    return 4.0 / (n * 3.141592653589793)`,
    testCases: [
      { input: [1], expected: 1.2732395447351628 },
      { input: [2], expected: 0.0 },
      { input: [3], expected: 0.4244131815783876 },
      { input: [5], expected: 0.25464790894703254 },
      { input: [7], expected: 0.18189136353359467 },
    ],
    hint: "Only odd harmonics appear because the square wave has half-wave symmetry.",
  },
  {
    id: "ca-120",
    title: "Gibbs Overshoot Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Gibbs overshoot of the Fourier partial sums of a unit square wave is G = (2/pi) * Si(pi), where Si is the sine integral.\n\nEvaluate Si(pi) with the series sum over k = 0 to n-1 of (-1)^k * pi^(2k+1) / ((2k+1)! * (2k+1)), then multiply by 2/pi. Use 3.141592653589793 for pi.",
    starterCode: `def gibbs_overshoot(n):
    # Your code here
    pass`,
    solution: `def gibbs_overshoot(n):
    pi = 3.141592653589793
    total = 0.0
    power = pi
    fact = 1
    for k in range(n):
        if k > 0:
            power *= pi * pi
            fact *= (2 * k) * (2 * k + 1)
        total += ((-1) ** k) * power / (fact * (2 * k + 1))
    return 2.0 * total / pi`,
    testCases: [
      { input: [1], expected: 2.0 },
      { input: [2], expected: 0.9033772887678492 },
      { input: [3], expected: 1.2280742588811906 },
      { input: [20], expected: 1.1789797444721675 },
    ],
    hint: "The limit is the Wilbraham-Gibbs constant, about 1.1789797.",
  },
  {
    id: "ca-121",
    title: "Bessel J0 Series Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Evaluate the Bessel function of the first kind J0(x) with its power series to n terms:\n\nJ0(x) ≈ sum from k = 0 to n-1 of (-1)^k * (x/2)^(2k) / (k!)^2\n\nAccumulate the terms iteratively using the ratio -(x^2/4) / (k+1)^2.",
    starterCode: `def bessel_j0(x, n):
    # Your code here
    pass`,
    solution: `def bessel_j0(x, n):
    total = 0.0
    term = 1.0
    for k in range(n):
        total += term
        term *= -(x * x) / (4.0 * (k + 1) * (k + 1))
    return total`,
    testCases: [
      { input: [0, 5], expected: 1.0 },
      { input: [1, 10], expected: 0.7651976865579666 },
      { input: [2, 15], expected: 0.22389077914123562 },
      { input: [5, 20], expected: -0.17759677131433846 },
      { input: [10, 25], expected: -0.24593576445137094 },
    ],
    hint: "J0 is an even function, so only even powers of x appear.",
  },
  {
    id: "ca-122",
    title: "Digamma Approximation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a positive integer n, the digamma function satisfies psi(n) = -gamma + H_{n-1}, where gamma = 0.5772156649015329 is the Euler-Mascheroni constant and H_{n-1} is the (n-1)-th harmonic number.\n\nGiven n >= 1, return psi(n) using this exact integer formula.",
    starterCode: `def digamma_integer(n):
    # Your code here
    pass`,
    solution: `def digamma_integer(n):
    total = -0.5772156649015329
    for i in range(1, n):
        total += 1.0 / i
    return total`,
    testCases: [
      { input: [1], expected: -0.5772156649015329 },
      { input: [2], expected: 0.42278433509846713 },
      { input: [5], expected: 1.5061176684318005 },
      { input: [10], expected: 2.2517525890667214 },
    ],
    hint: "psi(1) = -gamma and psi(n+1) = psi(n) + 1/n.",
  },
  {
    id: "ca-123",
    title: "Beta Function Derivative",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The derivative of the beta function with respect to its first argument is dB/da = B(a, b) * (psi(a) - psi(a + b)), where psi is the digamma function.\n\nGiven positive integers a and b, compute B(a, b) = Gamma(a)*Gamma(b)/Gamma(a+b) with math.gamma and evaluate digamma with psi(n) = -gamma + H_{n-1}. Return the derivative.",
    starterCode: `def beta_derivative(a, b):
    # Your code here
    pass`,
    solution: `def beta_derivative(a, b):
    import math
    def digamma(n):
        total = -0.5772156649015329
        for i in range(1, n):
            total += 1.0 / i
        return total
    beta = math.gamma(a) * math.gamma(b) / math.gamma(a + b)
    return beta * (digamma(a) - digamma(a + b))`,
    testCases: [
      { input: [1, 1], expected: -1.0 },
      { input: [2, 3], expected: -0.09027777777777779 },
      { input: [3, 3], expected: -0.02611111111111111 },
      { input: [1, 5], expected: -0.45666666666666667 },
    ],
    hint: "Differentiating under the integral sign brings down a factor log(t).",
  },
  {
    id: "ca-124",
    title: "Erf Inverse Approximation",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Approximate the inverse error function with n Newton iterations.\n\nStarting from x0, repeatedly update x = x - (erf(x) - y) / ((2/sqrt(pi)) * e^(-x^2)). Given y in (-1, 1), x0, and the iteration count n, return the final value.",
    starterCode: `def erfinv_newton(y, x0, n):
    # Your code here
    pass`,
    solution: `def erfinv_newton(y, x0, n):
    import math
    x = x0
    for _ in range(n):
        err = math.erf(x) - y
        deriv = 2.0 / math.sqrt(math.pi) * math.exp(-x * x)
        x = x - err / deriv
    return x`,
    testCases: [
      { input: [0, 0, 5], expected: 0.0 },
      { input: [0.5, 0.5, 6], expected: 0.4769362762044698 },
      { input: [0.8427007929497149, 0.5, 10], expected: 1.0 },
      { input: [-0.5, -0.5, 6], expected: -0.4769362762044698 },
      { input: [0.9, 1, 8], expected: 1.1630871536766743 },
    ],
    hint: "Newton converges quadratically here because the derivative erf'(x) is bounded away from zero.",
  },
  {
    id: "ca-125",
    title: "Exact ODE Potential",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The differential M(x, y) dx + N(x, y) dy = 0 with M = a*x + b*y and N = c*x + d*y is exact exactly when b == c.\n\nWhen it is exact, return the potential phi(x, y) = 0.5*a*x^2 + b*x*y + 0.5*d*y^2 with phi(0, 0) = 0. Otherwise return None.",
    starterCode: `def exact_ode_potential(a, b, c, d, x, y):
    # Return None when the equation is not exact
    # Your code here
    pass`,
    solution: `def exact_ode_potential(a, b, c, d, x, y):
    if b != c:
        return None
    return 0.5 * a * x * x + b * x * y + 0.5 * d * y * y`,
    testCases: [
      { input: [1, 1, 1, 1, 2, 3], expected: 12.5 },
      { input: [2, -3, -3, 4, 1, 1], expected: 0.0 },
      { input: [1, 2, 3, 4, 1, 1], expected: null },
      { input: [0, 0, 0, 0, 5, 5], expected: 0.0 },
    ],
    hint: "Exactness requires the cross partials to match: dM/dy = dN/dx.",
  },
  {
    id: "ca-126",
    title: "Nonhomogeneous Particular Solution",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the ODE y'' + p*y' + q*y = A*e^(r*x), a particular solution has the form y_p = A*e^(r*x) / (r^2 + p*r + q), provided the denominator is nonzero (no resonance).\n\nGiven p, q, A, r, and the evaluation point x, return y_p(x). If r^2 + p*r + q == 0, return None.",
    starterCode: `def particular_solution_value(p, q, big_a, r, x):
    # Return None on resonance
    # Your code here
    pass`,
    solution: `def particular_solution_value(p, q, big_a, r, x):
    import math
    den = r * r + p * r + q
    if den == 0:
        return None
    return big_a * math.exp(r * x) / den`,
    testCases: [
      { input: [3, 2, 1, 1, 0], expected: 0.16666666666666666 },
      { input: [0, 1, 2, 0, 0], expected: 2.0 },
      { input: [1, 1, 1, 0, 0], expected: 1.0 },
      { input: [3, 2, 1, 1, 1], expected: 0.45304697140984085 },
      { input: [2, 1, 1, -1, 0], expected: null },
    ],
    hint: "Substitute the exponential guess into the ODE and solve for the constant.",
  },
  {
    id: "ca-127",
    title: "Wronskian Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Wronskian of f = e^(r1*x) and g = e^(r2*x) is W = f*g' - f'*g = (r2 - r1) * e^((r1 + r2)*x).\n\nGiven the two rates and x, return W(x). Two equal rates make the functions linearly dependent and give 0.",
    starterCode: `def wronskian_exp(r1, r2, x):
    # Your code here
    pass`,
    solution: `def wronskian_exp(r1, r2, x):
    import math
    return (r2 - r1) * math.exp((r1 + r2) * x)`,
    testCases: [
      { input: [1, 2, 0], expected: 1.0 },
      { input: [1, 2, 1], expected: 20.085536923187668 },
      { input: [-1, -2, 2], expected: -0.0024787521766663585 },
      { input: [1, 1, 5], expected: 0.0 },
      { input: [0, 3, 1], expected: 60.256610769563004 },
    ],
    hint: "A nonzero Wronskian witnesses linear independence of the two solutions.",
  },
  {
    id: "ca-128",
    title: "Legendre Transform Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Legendre transform of f(x) = a*x^2 / 2 with a > 0 is f*(p) = sup over x of (p*x - f(x)).\n\nMaximizing gives x = p/a and f*(p) = p^2 / (2*a). Given a and p, return f*(p).",
    starterCode: `def legendre_transform(a, p):
    # Your code here
    pass`,
    solution: `def legendre_transform(a, p):
    return p * p / (2.0 * a)`,
    testCases: [
      { input: [1, 2], expected: 2.0 },
      { input: [2, 3], expected: 2.25 },
      { input: [4, 0], expected: 0.0 },
      { input: [0.5, 1], expected: 1.0 },
      { input: [1, -3], expected: 4.5 },
    ],
    hint: "Set f'(x) = p and substitute back into p*x - f(x).",
  },
  {
    id: "ca-129",
    title: "Hamiltonian from Lagrangian",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For L(q, qdot) = 0.5*m*qdot^2 + c*q*qdot - 0.5*k*q^2, the conjugate momentum is p = m*qdot + c*q.\n\nEliminating qdot = (p - c*q) / m gives H(q, p) = (p - c*q)^2 / (2*m) + 0.5*k*q^2. Given the parameters and (q, p), return H.",
    starterCode: `def hamiltonian_from_lagrangian(m, c, k, q, p):
    # Your code here
    pass`,
    solution: `def hamiltonian_from_lagrangian(m, c, k, q, p):
    return (p - c * q) ** 2 / (2.0 * m) + 0.5 * k * q * q`,
    testCases: [
      { input: [1, 0, 1, 1, 0], expected: 0.5 },
      { input: [2, 0, 0, 0, 4], expected: 4.0 },
      { input: [1, 1, 2, 1, 3], expected: 3.0 },
      { input: [2, -1, 4, 2, 1], expected: 10.25 },
    ],
    hint: "The Hamiltonian is the Legendre transform of the Lagrangian in the velocity.",
  },
  {
    id: "ca-130",
    title: "Phase Portrait Stability",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a 2D linear system x' = A*x with trace T and determinant D, the origin is classified by these invariants.\n\nReturn \"saddle\" when D < 0, \"stable\" when D > 0 and T < 0, \"unstable\" when D > 0 and T > 0, and \"center\" when D > 0 and T == 0. When D == 0, return \"degenerate\".",
    starterCode: `def phase_stability(trace, det):
    # Your code here
    pass`,
    solution: `def phase_stability(trace, det):
    if det < 0:
        return "saddle"
    if det > 0:
        if trace < 0:
            return "stable"
        if trace > 0:
            return "unstable"
        return "center"
    return "degenerate"`,
    testCases: [
      { input: [-2, 1], expected: "stable" },
      { input: [2, 1], expected: "unstable" },
      { input: [0, 4], expected: "center" },
      { input: [0, -1], expected: "saddle" },
      { input: [3, 0], expected: "degenerate" },
    ],
    hint: "The eigenvalues are the roots of lambda^2 - T*lambda + D, and their signs decide stability.",
  },
  {
    id: "ca-131",
    title: "Lagrange Multipliers 3-Variable",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "Maximize f(x, y, z) = x*y*z subject to x + y + z = s with s > 0 and x, y, z positive.\n\nBy symmetry the optimum is x = y = z = s/3, giving f_max = s^3 / 27. Return [x, y, z, f_max].",
    starterCode: `def lagrange_product_3(s):
    # Return [x, y, z, f_max]
    # Your code here
    pass`,
    solution: `def lagrange_product_3(s):
    v = s / 3.0
    return [v, v, v, v * v * v]`,
    testCases: [
      { input: [3], expected: [1.0, 1.0, 1.0, 1.0] },
      { input: [6], expected: [2.0, 2.0, 2.0, 8.0] },
      { input: [9], expected: [3.0, 3.0, 3.0, 27.0] },
      {
        input: [1],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333, 0.037037037037037035],
      },
    ],
    hint: "The Lagrange conditions x = y = z follow immediately from symmetry.",
  },
  {
    id: "ca-132",
    title: "Newton Divided Differences Coefficient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the divided difference f[x0, x1, ..., xk] of order k for the points [x_i, y_i].\n\nBuild the table in place: order 0 holds the y values, and each higher order entry is (v[i+1] - v[i]) / (x[i+order] - x[i]). Return the single top entry after k passes. Assume the x values are distinct.",
    starterCode: `def divided_difference(points, k):
    # Your code here
    pass`,
    solution: `def divided_difference(points, k):
    xs = [p[0] for p in points[:k + 1]]
    values = [p[1] for p in points[:k + 1]]
    for order in range(1, k + 1):
        values = [
            (values[i + 1] - values[i]) / (xs[i + order] - xs[i])
            for i in range(len(values) - 1)
        ]
    return values[0]`,
    testCases: [
      { input: [[[0, 1], [1, 2], [2, 5]], 0], expected: 1.0 },
      { input: [[[0, 1], [1, 2], [2, 5]], 2], expected: 1.0 },
      { input: [[[0, 0], [2, 1], [4, 8]], 2], expected: 0.75 },
      { input: [[[0, 0], [1, 1], [2, 8], [3, 27]], 3], expected: 1.0 },
      { input: [[[1, 2], [3, 4], [7, 20]], 2], expected: 0.5 },
    ],
    hint: "The order-k divided difference uses exactly the first k+1 points.",
  },
  {
    id: "ca-133",
    title: "Cubic Spline Segment Value",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Evaluate a cubic Hermite spline segment on [x0, x1] with endpoint values y0, y1 and endpoint slopes m0, m1.\n\nWith h = x1 - x0 and t = (x - x0)/h, use the basis S = h00*y0 + h10*h*m0 + h01*y1 + h11*h*m1, where h00 = 2t^3 - 3t^2 + 1, h10 = t^3 - 2t^2 + t, h01 = -2t^3 + 3t^2, h11 = t^3 - t^2. Return S(x).",
    starterCode: `def cubic_spline_value(x0, y0, m0, x1, y1, m1, x):
    # Your code here
    pass`,
    solution: `def cubic_spline_value(x0, y0, m0, x1, y1, m1, x):
    h = x1 - x0
    t = (x - x0) / h
    t2 = t * t
    t3 = t2 * t
    h00 = 2 * t3 - 3 * t2 + 1
    h10 = t3 - 2 * t2 + t
    h01 = -2 * t3 + 3 * t2
    h11 = t3 - t2
    return h00 * y0 + h10 * h * m0 + h01 * y1 + h11 * h * m1`,
    testCases: [
      { input: [0, 0, 1, 2, 4, 3, 1], expected: 1.5 },
      { input: [0, 1, 0, 1, 2, 0, 0.25], expected: 1.15625 },
      { input: [0, 1, 2, 1, 5, 6, 0], expected: 1.0 },
      { input: [0, 1, 2, 1, 5, 6, 1], expected: 5.0 },
      { input: [0, 0, 0, 1, 1, 0, 0.5], expected: 0.5 },
    ],
    hint: "At t = 0 the basis reduces to (y0, m0 h) and at t = 1 to (y1, m1 h).",
  },
  {
    id: "ca-134",
    title: "Lyapunov Quadratic Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For V(x) = x^T P x with P = [[p, q], [q, r]] and the linear system x' = A x with A = [[a, b], [c, d]], the derivative along trajectories is V-dot = x^T Q x with Q = P*A + A^T*P.\n\nReturn [q11, q12, q22, is_negative_definite], where Q = [[q11, q12], [q12, q22]]. A 2x2 symmetric matrix is negative definite when q11 < 0 and q11*q22 - q12^2 > 0.",
    starterCode: `def lyapunov_check(a, b, c, d, p, q, r):
    # Return [q11, q12, q22, flag]
    # Your code here
    pass`,
    solution: `def lyapunov_check(a, b, c, d, p, q, r):
    q11 = 2.0 * p * a + 2.0 * q * c
    q12 = p * b + q * d + a * q + c * r
    q22 = 2.0 * q * b + 2.0 * r * d
    flag = q11 < 0 and (q11 * q22 - q12 * q12) > 0
    return [q11, q12, q22, flag]`,
    testCases: [
      { input: [0, 1, -2, -3, 1, 0, 1], expected: [0.0, -1.0, -6.0, false] },
      { input: [0, 1, -2, -3, 3, 1, 1], expected: [-4.0, -2.0, -4.0, true] },
      { input: [1, 0, 0, 1, 1, 0, 1], expected: [2.0, 0.0, 2.0, false] },
      { input: [-1, 0, 0, -2, 1, 0, 1], expected: [-2.0, 0.0, -4.0, true] },
      { input: [0, 1, 1, 0, 1, 0, 1], expected: [0.0, 2.0, 0.0, false] },
    ],
    hint: "A negative definite Q proves asymptotic stability of the origin.",
  },
  {
    id: "ca-135",
    title: "Steepest Descent Path Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Take one exact-line-search steepest descent step on the quadratic f(x) = 0.5*x^T*A*x - b^T*x with A = [[a, b], [b, c]] and b_vec = (b1, b2).\n\nThe gradient is g = A*x - b_vec and the optimal step is alpha = (g^T g) / (g^T A g). Return x - alpha*g as [x1, x2].",
    starterCode: `def steepest_descent_step(point, a, b, c, b1, b2):
    # Return the updated [x, y]
    # Your code here
    pass`,
    solution: `def steepest_descent_step(point, a, b, c, b1, b2):
    x = point[0]
    y = point[1]
    gx = a * x + b * y - b1
    gy = b * x + c * y - b2
    gg = gx * gx + gy * gy
    agx = a * gx + b * gy
    agy = b * gx + c * gy
    gag = gx * agx + gy * agy
    alpha = gg / gag
    return [x - alpha * gx, y - alpha * gy]`,
    testCases: [
      { input: [[1, 1], 1, 0, 1, 0, 0], expected: [0.0, 0.0] },
      {
        input: [[1, 1], 2, 0, 8, 0, 0],
        expected: [0.7384615384615385, -0.04615384615384621],
      },
      { input: [[0, 0], 1, 0, 4, 1, 0], expected: [1.0, 0.0] },
      {
        input: [[0, 0], 2, 1, 2, 1, 2],
        expected: [0.35714285714285715, 0.7142857142857143],
      },
    ],
    hint: "For a quadratic, the exact line search minimizes f along the negative gradient direction.",
  },
  {
    id: "ca-136",
    title: "KKT Condition Check",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Check the KKT conditions for minimizing f(x, y) = 0.5*a*x^2 + 0.5*b*y^2 subject to g(x, y) = d - x - y <= 0.\n\nThe Lagrangian is f + lambda*g. Return True when all hold within the tolerance: a*x - lambda == 0, b*y - lambda == 0, g <= 0, lambda >= 0, and lambda*g == 0.",
    starterCode: `def kkt_check(a, b, d, x, y, lam, tol=1e-9):
    # Your code here
    pass`,
    solution: `def kkt_check(a, b, d, x, y, lam, tol=1e-9):
    g = d - x - y
    return (
        abs(a * x - lam) <= tol
        and abs(b * y - lam) <= tol
        and g <= tol
        and lam >= -tol
        and abs(lam * g) <= tol
    )`,
    testCases: [
      { input: [2, 2, 1, 0.5, 0.5, 1], expected: true },
      { input: [2, 2, 1, 0.5, 0.5, 0], expected: false },
      { input: [2, 2, 1, 0.3, 0.5, 1], expected: false },
      { input: [1, 3, 2, 1.5, 0.5, 1.5], expected: true },
      { input: [2, 2, 0, 0, 0, 0], expected: true },
    ],
    hint: "Stationarity, primal feasibility, dual feasibility, and complementary slackness must all hold.",
  },
  {
    id: "ca-137",
    title: "Bernoulli ODE Substitution Value",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Solve the Bernoulli equation y' + p*y = q*y^n with y(0) = y0 where n != 1 and y0 > 0.\n\nThe substitution v = y^(1-n) gives a linear equation whose solution is v = q/p + (v0 - q/p)*e^(-(1-n)*p*x) when p != 0, and v = v0 + (1-n)*q*x when p == 0, with v0 = y0^(1-n). Return y(x) = v^(1/(1-n)).",
    starterCode: `def bernoulli_value(x, y0, p, q, n):
    # Your code here
    pass`,
    solution: `def bernoulli_value(x, y0, p, q, n):
    import math
    v0 = y0 ** (1 - n)
    if p == 0:
        v = v0 + (1 - n) * q * x
    else:
        v = q / p + (v0 - q / p) * math.exp(-(1 - n) * p * x)
    return v ** (1.0 / (1 - n))`,
    testCases: [
      { input: [1, 1, 1, 0, 2], expected: 0.36787944117144233 },
      { input: [1, 0.5, 1, 1, 2], expected: 0.2689414213699951 },
      { input: [1, 1, 1, 2, 0], expected: 1.6321205588285577 },
      { input: [0.25, 1, 0, 1, 3], expected: 1.4142135623730951 },
    ],
    hint: "The substitution linearizes the equation, then invert it at the end.",
  },
  {
    id: "ca-138",
    title: "Variation of Parameters Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For y'' + y = f(x) with fundamental solutions y1 = cos(x) and y2 = sin(x), variation of parameters gives u1' = -y2*f / W and u2' = y1*f / W, where W = 1.\n\nGiven the value f_value = f(x) at the point x, return [u1', u2'] = [-sin(x)*f_value, cos(x)*f_value].",
    starterCode: `def variation_step(f_value, x):
    # Return [u1_prime, u2_prime]
    # Your code here
    pass`,
    solution: `def variation_step(f_value, x):
    import math
    return [-math.sin(x) * f_value, math.cos(x) * f_value]`,
    testCases: [
      { input: [1, 0], expected: [0.0, 1.0] },
      { input: [1, 1.5707963267948966], expected: [-1.0, 0.0] },
      { input: [2, 3.141592653589793], expected: [0.0, -2.0] },
      { input: [3, 0.5235987755982988], expected: [-1.5, 2.598076211353316] },
    ],
    hint: "The Wronskian of cos and sin is 1, which simplifies the formulas.",
  },
  {
    id: "ca-139",
    title: "Poisson Bracket",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Compute the Poisson bracket {f, g} = df/dq * dg/dp - df/dp * dg/dq at (q, p).\n\nf_coeffs and g_coeffs are coefficient grids where coeffs[i][j] multiplies q^i * p^j; ragged rows are allowed. Differentiate each polynomial analytically and combine the four partials.",
    starterCode: `def poisson_bracket(f_coeffs, g_coeffs, q, p):
    # Your code here
    pass`,
    solution: `def poisson_bracket(f_coeffs, g_coeffs, q, p):
    def partials(coeffs, u, v):
        dq = 0.0
        dp = 0.0
        for i, row in enumerate(coeffs):
            for j, c in enumerate(row):
                if i > 0:
                    dq += i * c * u ** (i - 1) * v ** j
                if j > 0:
                    dp += j * c * u ** i * v ** (j - 1)
        return dq, dp
    fq, fp = partials(f_coeffs, q, p)
    gq, gp = partials(g_coeffs, q, p)
    return fq * gp - fp * gq`,
    testCases: [
      { input: [[[0], [1]], [[0, 1]], 2, 3], expected: 1.0 },
      { input: [[[0], [1]], [[0, 0, 0.5], [0], [0.5]], 1, 1], expected: 1.0 },
      { input: [[[0, 1]], [[0, 0, 0.5], [0], [0.5]], 2, 1], expected: -2.0 },
      { input: [[[0, 0], [0, 1]], [[0, 0, 1], [0, 0], [1, 0]], 1, 2], expected: 6.0 },
    ],
    hint: "The bracket is antisymmetric, and {q, p} = 1 for canonical coordinates.",
  },
  {
    id: "ca-140",
    title: "Hamilton Equations Step",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Take one explicit Euler step of Hamilton's equations for H(q, p) = p^2/(2m) + 0.5*k*q^2 + 0.25*lam*q^4.\n\nThe equations are q' = p/m and p' = -(k*q + lam*q^3). Return [q + dt*q', p + dt*p'].",
    starterCode: `def hamilton_step(q, p, m, k, lam, dt):
    # Return [q_next, p_next]
    # Your code here
    pass`,
    solution: `def hamilton_step(q, p, m, k, lam, dt):
    q_next = q + dt * p / m
    p_next = p - dt * (k * q + lam * q ** 3)
    return [q_next, p_next]`,
    testCases: [
      { input: [1, 0, 1, 1, 0, 0.1], expected: [1.0, -0.1] },
      { input: [2, 1, 2, 3, 0.5, 0.25], expected: [2.125, -1.5] },
      { input: [0, 2, 1, 4, 1, 0.5], expected: [1.0, 2.0] },
      { input: [1, -1, 1, 1, 0, 0.5], expected: [0.5, -1.5] },
      { input: [0, 0, 1, 1, 1, 1], expected: [0.0, 0.0] },
    ],
    hint: "Update the position with the current momentum and the momentum with the current force.",
  },
];
