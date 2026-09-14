import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-356",
    title: "Polynomial Nth Derivative Coefficients",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Differentiating a polynomial repeatedly multiplies coefficient i by the falling factorial i (i-1) ... (i-order+1) and shifts indices down by the order.\n\nGiven coefficients in ascending order and the derivative order, return the resulting coefficients; return [] when the order exceeds the degree.",
    starterCode: `def polynomial_nth_derivative_coeffs(coeffs, order):
    # Your code here
    pass`,
    solution: `def polynomial_nth_derivative_coeffs(coeffs, order):
    out = list(coeffs)
    for _ in range(order):
        if len(out) <= 1:
            return []
        out = [i * out[i] for i in range(1, len(out))]
    return out`,
    testCases: [
      { input: [[1, 2, 3], 1], expected: [2, 6] },
      { input: [[1, 2, 3], 2], expected: [6] },
      { input: [[5], 1], expected: [] },
      { input: [[0, 0, 0, 2], 3], expected: [12] },
    ],
    hint: "Repeat the power rule once per order, dropping the constant each round.",
  },
  {
    id: "ca-357",
    title: "Product Polynomial Derivative Coefficients",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The derivative of a product of two polynomials is f' g + f g', and polynomial multiplication is coefficient convolution.\n\nGiven the coefficient lists of f and g in ascending order, return the coefficients of (f g)' in ascending order.",
    starterCode: `def product_polynomial_derivative_coeffs(f, g):
    # Your code here
    pass`,
    solution: `def product_polynomial_derivative_coeffs(f, g):
    conv = [0.0] * (len(f) + len(g) - 1)
    for i, a in enumerate(f):
        for j, b in enumerate(g):
            conv[i + j] += a * b
    return [i * conv[i] for i in range(1, len(conv))]`,
    testCases: [
      { input: [[1, 1], [1, -1]], expected: [0.0, -2.0] },
      { input: [[2], [1, 2, 3]], expected: [4.0, 12.0] },
      { input: [[0, 0, 1], [1, 0, 0, 4]], expected: [0.0, 2.0, 0.0, 0.0, 20.0] },
    ],
    hint: "Convolve the coefficients first, then differentiate the product.",
  },
  {
    id: "ca-358",
    title: "Polynomial Composition Derivative",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For h(x) = f(g(x)) with polynomials f and g, the derivative at x is f'(g(x)) * g'(x).\n\nGiven coefficient lists of f and g in ascending order and the point x, return h'(x).",
    starterCode: `def polynomial_composition_derivative(f, g, x):
    # Your code here
    pass`,
    solution: `def polynomial_composition_derivative(f, g, x):
    def val(cs, t):
        return sum(c * t ** i for i, c in enumerate(cs))
    def deriv(cs, t):
        return sum(i * c * t ** (i - 1) for i, c in enumerate(cs) if i > 0)
    return deriv(f, val(g, x)) * deriv(g, x)`,
    testCases: [
      { input: [[0, 0, 1], [1, 1], 1], expected: 4 },
      { input: [[1, 2], [0, 3], 2], expected: 6 },
      { input: [[0, 1], [2, -1], 0], expected: -1 },
    ],
    hint: "Evaluate the inner polynomial first, then multiply the two derivatives.",
  },
  {
    id: "ca-359",
    title: "Implicit Circle Slope",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For the circle x^2 + y^2 = r^2, implicit differentiation gives dy/dx = -x / y.\n\nGiven the coordinates of a point on the circle, return the tangent slope. Return None when y is zero (the tangent is vertical).",
    starterCode: `def implicit_circle_slope(x, y):
    # Your code here
    pass`,
    solution: `def implicit_circle_slope(x, y):
    if y == 0:
        return None
    return -x / y`,
    testCases: [
      { input: [1, 1], expected: -1.0 },
      { input: [2, 0], expected: null },
      { input: [3, 4], expected: -0.75 },
    ],
    hint: "Differentiate both sides with respect to x and solve for dy/dx.",
  },
  {
    id: "ca-360",
    title: "Tangent Plane Normal Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For a surface z = f(x, y), the tangent plane at a point has normal vector [-f_x, -f_y, 1].\n\nGiven the two partial derivatives at the point, return the normal vector.",
    starterCode: `def tangent_plane_normal(fx, fy):
    # Your code here
    pass`,
    solution: `def tangent_plane_normal(fx, fy):
    return [-fx, -fy, 1.0]`,
    testCases: [
      { input: [1, 2], expected: [-1, -2, 1.0] },
      { input: [0, 0], expected: [0, 0, 1.0] },
      { input: [-3, 0.5], expected: [3, -0.5, 1.0] },
    ],
    hint: "Move the partial derivatives to the left side of z - f(x, y) = 0.",
  },
  {
    id: "ca-361",
    title: "Momentum Velocity and Parameter Update",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "One momentum update computes v_new = beta * v - lr * grad and w_new = w + v_new.\n\nGiven w, grad, the previous velocity v, the learning rate lr, and beta, return [w_new, v_new].",
    starterCode: `def momentum_update_step(w, grad, v, lr, beta):
    # Your code here
    pass`,
    solution: `def momentum_update_step(w, grad, v, lr, beta):
    v_new = [beta * vi - lr * gi for vi, gi in zip(v, grad)]
    w_new = [wi + vi for wi, vi in zip(w, v_new)]
    return [w_new, v_new]`,
    testCases: [
      { input: [[1, 1], [0.1, -0.2], [0, 0], 0.5, 0.9], expected: [[0.95, 1.1], [-0.05, 0.1]] },
      { input: [[0, 0], [1, 1], [1, 1], 0.1, 0.5], expected: [[0.4, 0.4], [0.4, 0.4]] },
      { input: [[2], [4], [1], 0.25, 0.8], expected: [[1.8], [-0.19999999999999996]] },
    ],
    hint: "Update the velocity from the previous velocity, then move the parameters.",
  },
  {
    id: "ca-362",
    title: "Maximum Directional Derivative Magnitude",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The largest directional derivative of a differentiable function at a point equals the Euclidean norm of its gradient, attained in the gradient direction.\n\nGiven the gradient, return the maximum directional derivative.",
    starterCode: `def max_directional_derivative_magnitude(grad):
    # Your code here
    pass`,
    solution: `def max_directional_derivative_magnitude(grad):
    import math
    return math.sqrt(sum(v * v for v in grad))`,
    testCases: [
      { input: [[3, 4]], expected: 5.0 },
      { input: [[1, 0, 0]], expected: 1.0 },
      { input: [[0, -5, 12]], expected: 13.0 },
    ],
    hint: "It is the length of the gradient vector.",
  },
  {
    id: "ca-363",
    title: "Second Directional Derivative Value",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For a twice differentiable function, the second derivative along a direction v is (v^T H v) / (v^T v), where H is the Hessian at the point.\n\nGiven the Hessian as nested rows and a nonzero direction vector, return the second directional derivative.",
    starterCode: `def second_directional_derivative(h, v):
    # Your code here
    pass`,
    solution: `def second_directional_derivative(h, v):
    n = len(v)
    hv = [sum(h[i][j] * v[j] for j in range(n)) for i in range(n)]
    quad = sum(v[i] * hv[i] for i in range(n))
    norm = sum(x * x for x in v)
    return quad / norm`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 0]], expected: 1.0 },
      { input: [[[2, 1], [1, 2]], [1, 1]], expected: 3.0 },
      { input: [[[0, 1], [1, 0]], [1, -1]], expected: -1.0 },
    ],
    hint: "Form H v, then dot it with v and normalize by v dot v.",
  },
  {
    id: "ca-364",
    title: "2x2 Hessian Eigenvalue Product",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For a 2x2 matrix, the product of the eigenvalues equals the determinant. For a Hessian [[a, b], [c, d]], that product classifies local curvature: positive for a definite saddle-free point, negative at a saddle.\n\nGiven the four entries, return the eigenvalue product.",
    starterCode: `def hessian_eigenvalue_product_2x2(a, b, c, d):
    # Your code here
    pass`,
    solution: `def hessian_eigenvalue_product_2x2(a, b, c, d):
    return a * d - b * c`,
    testCases: [
      { input: [1, 0, 0, 2], expected: 2 },
      { input: [0, 1, 1, 0], expected: -1 },
      { input: [3, 1, 1, 0.5], expected: 0.5 },
    ],
    hint: "Compute the determinant of the Hessian.",
  },
  {
    id: "ca-365",
    title: "Convexity via Second Derivative Sign",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A twice differentiable function is convex at a point when its second derivative is nonnegative there.\n\nGiven polynomial coefficients and the point x, return True when f''(x) >= 0.",
    starterCode: `def convexity_second_derivative_check(coeffs, x):
    # Your code here
    pass`,
    solution: `def convexity_second_derivative_check(coeffs, x):
    fpp = sum(i * (i - 1) * c * x ** (i - 2) for i, c in enumerate(coeffs) if i > 1)
    return fpp >= 0`,
    testCases: [
      { input: [[0, 0, 1], 0], expected: true },
      { input: [[0, 1, 1], -2], expected: true },
      { input: [[0, 0, -1], 3], expected: false },
    ],
    hint: "Only terms of degree two and higher contribute to f''.",
  },
  {
    id: "ca-366",
    title: "Inflection Sign Change Detection",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "A function has an inflection between a and b when f'' changes sign across the interval; detect this by checking f''(a) * f''(b) < 0.\n\nGiven polynomial coefficients and the two endpoints, return True when the strict sign change occurs.",
    starterCode: `def inflection_sign_change_detection(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def inflection_sign_change_detection(coeffs, a, b):
    def fpp(t):
        return sum(i * (i - 1) * c * t ** (i - 2) for i, c in enumerate(coeffs) if i > 1)
    return fpp(a) * fpp(b) < 0`,
    testCases: [
      { input: [[0, 0, 0, 1], -1, 1], expected: true },
      { input: [[0, 0, 1], -2, 2], expected: false },
      { input: [[0, 0, 0, 1], 1, 2], expected: false },
    ],
    hint: "For a cubic, f'' is linear and flips sign around the inflection.",
  },
  {
    id: "ca-367",
    title: "Normalized Linear Norm Gradient",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x) = ||W x|| with a constant matrix W, the gradient with respect to x is W^T W x / ||W x||.\n\nGiven W as nested rows and a nonzero x, return the gradient list.",
    starterCode: `def normalized_linear_norm_gradient(w, x):
    # Your code here
    pass`,
    solution: `def normalized_linear_norm_gradient(w, x):
    import math
    rows = len(w)
    cols = len(w[0])
    y = [sum(w[i][j] * x[j] for j in range(cols)) for i in range(rows)]
    norm = math.sqrt(sum(v * v for v in y))
    wtw = [[sum(w[i][p] * w[i][q] for i in range(rows)) for q in range(cols)] for p in range(cols)]
    return [sum(wtw[p][q] * x[q] for q in range(cols)) / norm for p in range(cols)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 1]], expected: [0.7071067811865475, 0.7071067811865475] },
      { input: [[[1, 2]], [1, 0]], expected: [1.0, 2.0] },
      { input: [[[2, 0], [0, 1]], [0, 3]], expected: [0.0, 1.0] },
    ],
    hint: "Differentiate the norm as (Wx)/||Wx|| and apply the chain rule for W.",
  },
  {
    id: "ca-368",
    title: "Trapezoid on Exponential Samples",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Sample f(x) = exp(x) at n + 1 equally spaced points on [a, b] and integrate with the trapezoidal rule.\n\nGiven a, b, and n, return the estimate. Return 0.0 when n < 1.",
    starterCode: `def trapezoid_on_exponential_samples(a, b, n):
    # Your code here
    pass`,
    solution: `def trapezoid_on_exponential_samples(a, b, n):
    import math
    if n < 1:
        return 0.0
    h = (b - a) / n
    total = 0.5 * (math.exp(a) + math.exp(b))
    for i in range(1, n):
        total += math.exp(a + i * h)
    return total * h`,
    testCases: [
      { input: [0, 1, 10], expected: 1.7197134913893146 },
      { input: [0, 2, 4], expected: 6.521610109481282 },
      { input: [-1, 1, 100], expected: 2.3504807335115396 },
    ],
    hint: "Build the sample heights analytically instead of a list first.",
  },
  {
    id: "ca-369",
    title: "Average Rate of Change Polynomial",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "The average rate of change of a function on [a, b] is (f(b) - f(a)) / (b - a).\n\nGiven polynomial coefficients, a, and b, return the average rate of change. Assume a != b.",
    starterCode: `def average_rate_of_change_polynomial(coeffs, a, b):
    # Your code here
    pass`,
    solution: `def average_rate_of_change_polynomial(coeffs, a, b):
    def f(t):
        return sum(c * t ** i for i, c in enumerate(coeffs))
    return (f(b) - f(a)) / (b - a)`,
    testCases: [
      { input: [[1, 2, 3], 0, 2], expected: 8.0 },
      { input: [[0, 0, 1], 1, 3], expected: 4.0 },
      { input: [[4], 1, 5], expected: 0.0 },
    ],
    hint: "This is the slope of the secant line.",
  },
  {
    id: "ca-370",
    title: "Entropy Gradient in Probabilities",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the entropy H(p) = -sum_i p_i log(p_i), the partial derivative with respect to p_i is -log(p_i) - 1.\n\nGiven a strictly positive probability vector, return the gradient list.",
    starterCode: `def entropy_gradient_in_probabilities(probs):
    # Your code here
    pass`,
    solution: `def entropy_gradient_in_probabilities(probs):
    import math
    return [-math.log(p) - 1.0 for p in probs]`,
    testCases: [
      { input: [[0.5, 0.5]], expected: [-0.3068528194400547, -0.3068528194400547] },
      { input: [[0.25, 0.75]], expected: [0.3862943611198906, -0.7123179275482191] },
      { input: [[0.2, 0.3, 0.5]], expected: [0.6094379124341003, 0.20397280432593612, -0.3068528194400547] },
    ],
    hint: "Differentiate p log p with the product rule.",
  },
  {
    id: "ca-371",
    title: "Jensen Gap for Sigmoid Samples",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The Jensen gap is E[f(X)] - f(E[X]). For the sigmoid f and a list of equally weighted samples, compute both the average of the sigmoid values and the sigmoid of the average, then return the gap.\n\nGiven the sample list, return E[sigmoid(X)] - sigmoid(E[X]).",
    starterCode: `def jensen_gap_sigmoid_samples(samples):
    # Your code here
    pass`,
    solution: `def jensen_gap_sigmoid_samples(samples):
    import math
    n = len(samples)
    mean = sum(samples) / n
    avg_f = sum(1.0 / (1.0 + math.exp(-v)) for v in samples) / n
    f_mean = 1.0 / (1.0 + math.exp(-mean))
    return avg_f - f_mean`,
    testCases: [
      { input: [[0, 2]], expected: -0.040660039641063794 },
      { input: [[-1, 1]], expected: 0.0 },
      { input: [[1, 1, 1]], expected: 0.0 },
    ],
    hint: "Average the transformed values, then subtract the transform of the average.",
  },
  {
    id: "ca-372",
    title: "Mixed Partial of a Bivariate Quadratic",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x, y) = a x^2 + b x y + c y^2, estimate the mixed partial f_xy with the central difference (f(x+h, y+h) - f(x+h, y-h) - f(x-h, y+h) + f(x-h, y-h)) / (4 h^2).\n\nGiven a, b, c, the point [x, y], and h (default 1e-3), return the estimate (exactly b for this quadratic up to rounding).",
    starterCode: `def mixed_partial_bivariate_quadratic(a, b, c, point, h=1e-3):
    # Your code here
    pass`,
    solution: `def mixed_partial_bivariate_quadratic(a, b, c, point, h=1e-3):
    x, y = point
    def f(u, v):
        return a * u * u + b * u * v + c * v * v
    return (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4.0 * h * h)`,
    testCases: [
      { input: [1, 2, 3, [0, 0]], expected: 2.0 },
      { input: [2, -1, 0.5, [1, 2]], expected: -1.0000000000287557 },
      { input: [0, 4, 1, [-1, 1]], expected: 4.000000000004 },
    ],
    hint: "Only the cross term contributes to the mixed partial.",
  },
  {
    id: "ca-373",
    title: "Exact Differential Form Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "Write M(x, y) = m0 + m1 x + m2 y + m3 x^2 + m4 x y + m5 y^2 and N similarly with coefficients n0..n5. The form M dx + N dy is exact when dM/dy = dN/dx, that is when m2 = n1, m4 = 2 n3, and 2 m5 = n4.\n\nGiven the six coefficients of M and of N, return True when the form is exact.",
    starterCode: `def exact_differential_form_check(m, n):
    # Your code here
    pass`,
    solution: `def exact_differential_form_check(m, n):
    dm_dy = [m[2], m[4], 2.0 * m[5]]
    dn_dx = [n[1], 2.0 * n[3], n[4]]
    return dm_dy == dn_dx`,
    testCases: [
      { input: [[0, 0, 2, 0, 0, 0], [0, 2, 0, 0, 0, 0]], expected: true },
      { input: [[0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 2, 0]], expected: false },
      { input: [[0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 2, 0]], expected: true },
    ],
    hint: "Differentiate M by y and N by x on the common monomial basis.",
  },
  {
    id: "ca-374",
    title: "Quadratic Taylor Linearization Error",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x) = x^T A x, the error of the first-order Taylor approximation at x0 evaluated at x is exactly d^T A d, where d = x - x0 and A must be symmetrized.\n\nGiven A as nested rows, x0, and x, return f(x) - f(x0) - grad f(x0) dot d.",
    starterCode: `def quadratic_taylor_linearization_error(a, x0, x):
    # Your code here
    pass`,
    solution: `def quadratic_taylor_linearization_error(a, x0, x):
    n = len(x0)
    d = [x[i] - x0[i] for i in range(n)]
    def quad(y):
        return sum(y[i] * a[i][j] * y[j] for i in range(n) for j in range(n))
    def grad(y):
        return [sum((a[i][j] + a[j][i]) * y[j] for j in range(n)) for i in range(n)]
    g0 = grad(x0)
    return quad(x) - quad(x0) - sum(g0[i] * d[i] for i in range(n))`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [0, 0], [1, 2]], expected: 5 },
      { input: [[[0, 1], [0, 0]], [1, 1], [2, 3]], expected: 2 },
      { input: [[[2, 0], [0, 2]], [0, 0], [0, 1]], expected: 2 },
    ],
    hint: "For a quadratic the residual equals d^T A d regardless of the base point.",
  },
  {
    id: "ca-375",
    title: "Vanishing Gradient Check",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "A point is flagged as a vanishing-gradient candidate when the Euclidean norm of the gradient falls below a tolerance.\n\nGiven the gradient vector and the tolerance, return True when the norm is strictly less than the tolerance.",
    starterCode: `def vanishing_gradient_check(grad, tol):
    # Your code here
    pass`,
    solution: `def vanishing_gradient_check(grad, tol):
    import math
    return math.sqrt(sum(v * v for v in grad)) < tol`,
    testCases: [
      { input: [[1e-08, 1e-08], 1e-06], expected: true },
      { input: [[1, 1], 0.5], expected: false },
      { input: [[0, 0], 0.0], expected: false },
    ],
    hint: "Compute the norm first and compare with a strict inequality.",
  },
];
