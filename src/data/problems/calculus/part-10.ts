import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ca-316",
    title: "Frobenius Norm Squared Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the squared Frobenius norm f(A) = sum_ij A_ij^2, the gradient with respect to A is 2A elementwise.\n\nGiven A as a nested list of rows, return the gradient in the same shape.",
    starterCode: `def frobenius_norm_squared_gradient(a):
    # Your code here
    pass`,
    solution: `def frobenius_norm_squared_gradient(a):
    return [[2.0 * v for v in row] for row in a]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[2.0, 4.0], [6.0, 8.0]] },
      { input: [[[0, -1], [2, 0]]], expected: [[0.0, -2.0], [4.0, 0.0]] },
      { input: [[[1.5]]], expected: [[3.0]] },
    ],
    hint: "Each entry of the gradient only depends on the matching entry of A.",
  },
  {
    id: "ca-317",
    title: "Sum of Squares Gradient Vector",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For f(w) = sum_i (w_i - t_i)^2, the gradient is 2 * (w_i - t_i) for each coordinate.\n\nGiven the parameter vector w and target vector t, return the gradient list.",
    starterCode: `def sum_of_squares_gradient_vector(w, t):
    # Your code here
    pass`,
    solution: `def sum_of_squares_gradient_vector(w, t):
    return [2.0 * (a - b) for a, b in zip(w, t)]`,
    testCases: [
      { input: [[1, 2], [0, 0]], expected: [2.0, 4.0] },
      { input: [[1, 1], [1, 1]], expected: [0.0, 0.0] },
      { input: [[0, 3, -2], [1, 1, 1]], expected: [-2.0, 4.0, -6.0] },
    ],
    hint: "Differentiate each squared residual independently.",
  },
  {
    id: "ca-318",
    title: "Bilinear Form Partial Gradients",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the scalar function f(p, q) = p^T A q with constant matrix A, the gradient with respect to p is A q and with respect to q is A^T p.\n\nGiven the vectors p and q and the matrix A as nested rows, return [A q, A^T p].",
    starterCode: `def bilinear_form_partial_gradients(p, q, a):
    # Your code here
    pass`,
    solution: `def bilinear_form_partial_gradients(p, q, a):
    m = len(a)
    n = len(a[0])
    aq = [sum(a[i][j] * q[j] for j in range(n)) for i in range(m)]
    atp = [sum(a[i][j] * p[i] for i in range(m)) for j in range(n)]
    return [aq, atp]`,
    testCases: [
      { input: [[1, 2], [3, 4], [[1, 0], [0, 1]]], expected: [[3, 4], [1, 2]] },
      { input: [[1, 0], [1, 1], [[2, 3], [4, 5]]], expected: [[5, 9], [2, 3]] },
      { input: [[2], [1, -1], [[1, 2]]], expected: [[-1], [2, 4]] },
    ],
    hint: "Treat A as constant and differentiate the scalar product in each vector.",
  },
  {
    id: "ca-319",
    title: "Linear Residual Gradient Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x) = ||A x - b||^2 with constant matrix A, the gradient with respect to x is 2 * A^T (A x - b).\n\nGiven A as nested rows, x, and b, return the gradient list.",
    starterCode: `def linear_residual_gradient_vector(a, x, b):
    # Your code here
    pass`,
    solution: `def linear_residual_gradient_vector(a, x, b):
    rows = len(a)
    cols = len(a[0])
    r = [sum(a[i][j] * x[j] for j in range(cols)) - b[i] for i in range(rows)]
    return [2.0 * sum(a[i][j] * r[i] for i in range(rows)) for j in range(cols)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 2], [0, 0]], expected: [2.0, 4.0] },
      { input: [[[2], [4]], [1], [2, 4]], expected: [0.0] },
      { input: [[[1, 2], [3, 4]], [1, 1], [1, 1]], expected: [40.0, 56.0] },
    ],
    hint: "Residual first, then multiply by twice the transpose of A.",
  },
  {
    id: "ca-320",
    title: "2x2 Determinant Gradient via Adjugate",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For det(A) with A = [[a, b], [c, d]], the gradient with respect to A is the adjugate [[d, -c], [-b, a]].\n\nGiven the four entries, return the 2x2 gradient.",
    starterCode: `def determinant_gradient_adjugate(a, b, c, d):
    # Your code here
    pass`,
    solution: `def determinant_gradient_adjugate(a, b, c, d):
    return [[d, -c], [-b, a]]`,
    testCases: [
      { input: [1, 2, 3, 4], expected: [[4, -3], [-2, 1]] },
      { input: [0, 1, 1, 0], expected: [[0, -1], [-1, 0]] },
      { input: [2, -1, 4, 3], expected: [[3, -4], [1, 2]] },
    ],
    hint: "Each partial derivative is the cofactor of the matching entry.",
  },
  {
    id: "ca-321",
    title: "Log-Determinant Gradient 2x2",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(A) = log det(A) with a nonsingular 2x2 matrix A = [[a, b], [c, d]], the gradient is A^{-T} = [[d, -c], [-b, a]] / det(A).\n\nGiven the entries, return the gradient matrix.",
    starterCode: `def logdet_gradient_2x2(a, b, c, d):
    # Your code here
    pass`,
    solution: `def logdet_gradient_2x2(a, b, c, d):
    det = a * d - b * c
    return [[d / det, -c / det], [-b / det, a / det]]`,
    testCases: [
      { input: [1, 0, 0, 1], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [2, 1, 0, 1], expected: [[0.5, 0.0], [-0.5, 1.0]] },
      { input: [1, 2, 3, 5], expected: [[-5.0, 3.0], [2.0, -1.0]] },
    ],
    hint: "Differentiate log det(A) to get the transpose of the inverse.",
  },
  {
    id: "ca-322",
    title: "Product of Sigmoids Gradient",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For f(w) = product_i sigmoid(w_i), the partial derivative with respect to w_i is f(w) * (1 - sigmoid(w_i)) because d(sigmoid)/dw = sigmoid * (1 - sigmoid).\n\nGiven the weight vector, return the gradient list.",
    starterCode: `def product_of_sigmoids_gradient(w):
    # Your code here
    pass`,
    solution: `def product_of_sigmoids_gradient(w):
    import math
    sig = [1.0 / (1.0 + math.exp(-v)) for v in w]
    f = 1.0
    for s in sig:
        f *= s
    return [f * (1.0 - s) for s in sig]`,
    testCases: [
      { input: [[0, 0]], expected: [0.125, 0.125] },
      { input: [[1, 2]], expected: [0.1731752162946797, 0.07675646131035557] },
      { input: [[0, 1, 2]], expected: [0.16097856497199306, 0.08658760814733985, 0.038378230655177786] },
    ],
    hint: "The log-derivative trick turns the product into a sum of terms.",
  },
  {
    id: "ca-323",
    title: "Directional Derivative with Normalized Vector",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "The directional derivative of a differentiable function at a point in direction v is grad dot v, and normalizing v gives the slope per unit distance.\n\nGiven the gradient and a nonzero direction vector, return grad dot (v / ||v||).",
    starterCode: `def directional_derivative_normalized(grad, direction):
    # Your code here
    pass`,
    solution: `def directional_derivative_normalized(grad, direction):
    import math
    norm = math.sqrt(sum(v * v for v in direction))
    return sum(g * v for g, v in zip(grad, direction)) / norm`,
    testCases: [
      { input: [[3, 4], [1, 0]], expected: 3.0 },
      { input: [[1, 0, 0], [2, 3, 6]], expected: 0.2857142857142857 },
      { input: [[1, -1], [1, 1]], expected: 0.0 },
    ],
    hint: "Divide the dot product by the Euclidean norm of the direction.",
  },
  {
    id: "ca-324",
    title: "Gradient Norm Under Scaling",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "If a gradient vector is uniformly scaled by a factor c, its Euclidean norm scales by |c|.\n\nGiven the unscaled gradient and the scale factor, return the norm of the scaled gradient.",
    starterCode: `def gradient_norm_under_scaling(grad, scale):
    # Your code here
    pass`,
    solution: `def gradient_norm_under_scaling(grad, scale):
    import math
    return abs(scale) * math.sqrt(sum(v * v for v in grad))`,
    testCases: [
      { input: [[3, 4], 2], expected: 10.0 },
      { input: [[1, 0, 0], -5], expected: 5.0 },
      { input: [[0, 0], 7], expected: 0.0 },
    ],
    hint: "Pull the absolute value of the scalar out of the norm.",
  },
  {
    id: "ca-325",
    title: "Scalar Chain Rule Product",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For the composition h(x) = g(f(x)), the derivative at a point is g'(f(x)) * f'(x).\n\nGiven the numeric values dfdx and dgdu, return the chain rule product.",
    starterCode: `def scalar_chain_rule_product(dfdx, dgdu):
    # Your code here
    pass`,
    solution: `def scalar_chain_rule_product(dfdx, dgdu):
    return dfdx * dgdu`,
    testCases: [
      { input: [2, 3], expected: 6 },
      { input: [-1, 4], expected: -4 },
      { input: [0, 5], expected: 0 },
    ],
    hint: "Multiply the outer derivative by the inner derivative.",
  },
  {
    id: "ca-326",
    title: "Quadratic Plus Linear Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x) = x^T A x + b^T x with constant A and b, the gradient is (A + A^T) x + b.\n\nGiven A as nested rows, x, and b, return the gradient list.",
    starterCode: `def quadratic_plus_linear_gradient(a, x, b):
    # Your code here
    pass`,
    solution: `def quadratic_plus_linear_gradient(a, x, b):
    n = len(x)
    out = []
    for i in range(n):
        total = b[i]
        for j in range(n):
            total += (a[i][j] + a[j][i]) * x[j]
        out.append(total)
    return out`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 2], [0, 0]], expected: [2, 4] },
      { input: [[[0, 1], [0, 0]], [3, 4], [1, 1]], expected: [5, 4] },
      { input: [[[2, 0], [0, 3]], [1, 1], [0, 1]], expected: [4, 7] },
    ],
    hint: "Symmetrize A by adding its transpose before multiplying by x.",
  },
  {
    id: "ca-327",
    title: "Softmax Linear Jacobian",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For y = softmax(W x) with a k x n weight matrix W, the Jacobian with respect to x is (diag(s) - s s^T) W, where s is the softmax of Wx.\n\nGiven W as nested rows and x, return the k x n Jacobian as nested rows.",
    starterCode: `def softmax_linear_jacobian(w, x):
    # Your code here
    pass`,
    solution: `def softmax_linear_jacobian(w, x):
    import math
    k = len(w)
    n = len(x)
    logits = [sum(w[i][j] * x[j] for j in range(n)) for i in range(k)]
    m = max(logits)
    e = [math.exp(v - m) for v in logits]
    z = sum(e)
    s = [v / z for v in e]
    jac = []
    for i in range(k):
        row = []
        for j in range(n):
            total = 0.0
            for p in range(k):
                factor = (s[i] * (1.0 - s[i]) if p == i else -s[i] * s[p])
                total += factor * w[p][j]
            row.append(total)
        jac.append(row)
    return jac`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [0, 0]], expected: [[0.25, -0.25], [-0.25, 0.25]] },
      { input: [[[1, 2]], [0.5]], expected: [[0.0]] },
      { input: [[[1, 0], [0, 1]], [1, -1]], expected: [[0.10499358540350662, -0.10499358540350649], [-0.10499358540350649, 0.1049935854035065]] },
    ],
    hint: "Build diag(s) - s s^T first, then multiply by W.",
  },
  {
    id: "ca-328",
    title: "Elementwise Square Jacobian",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For the elementwise square y_i = x_i^2, the Jacobian is the diagonal matrix with entries 2 x_i.\n\nGiven the vector x, return the n x n Jacobian as nested rows.",
    starterCode: `def elementwise_square_jacobian(x):
    # Your code here
    pass`,
    solution: `def elementwise_square_jacobian(x):
    n = len(x)
    return [[2.0 * x[i] if i == j else 0.0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [[2.0, 0.0, 0.0], [0.0, 4.0, 0.0], [0.0, 0.0, 6.0]] },
      { input: [[0, -1]], expected: [[0.0, 0.0], [0.0, -2.0]] },
      { input: [[2]], expected: [[4.0]] },
    ],
    hint: "Each output only depends on the matching input, so off-diagonal entries vanish.",
  },
  {
    id: "ca-329",
    title: "General Quadratic Form Hessian",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(x) = x^T A x with a general square matrix A, the Hessian is the symmetric part A + A^T, independent of x.\n\nGiven A as nested rows, return the Hessian.",
    starterCode: `def general_quadratic_hessian(a):
    # Your code here
    pass`,
    solution: `def general_quadratic_hessian(a):
    n = len(a)
    return [[a[i][j] + a[j][i] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[2, 5], [5, 8]] },
      { input: [[[0, 1, 0], [0, 0, 1], [0, 0, 0]]], expected: [[0, 1, 0], [1, 0, 1], [0, 1, 0]] },
      { input: [[[2, -1], [-1, 2]]], expected: [[4, -2], [-2, 4]] },
    ],
    hint: "Only the symmetric part of A survives in the second derivative.",
  },
  {
    id: "ca-330",
    title: "Weighted MSE Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(w) = sum_i c_i (w_i - t_i)^2 with per-coordinate weights c_i, the gradient entry is 2 c_i (w_i - t_i).\n\nGiven w, t, and the weights, return the gradient list.",
    starterCode: `def weighted_mse_gradient(w, t, weights):
    # Your code here
    pass`,
    solution: `def weighted_mse_gradient(w, t, weights):
    return [2.0 * c * (a - b) for a, b, c in zip(w, t, weights)]`,
    testCases: [
      { input: [[1, 2], [0, 0], [1, 1]], expected: [2.0, 4.0] },
      { input: [[1, 1], [0, 0], [2, 0.5]], expected: [4.0, 1.0] },
      { input: [[3], [1], [10]], expected: [40.0] },
    ],
    hint: "Each weight scales its own squared residual term.",
  },
  {
    id: "ca-331",
    title: "Weighted Log-Sum-Exp Gradient",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(w) = log(sum_i exp(a_i w_i)), the gradient is p_i * a_i where p is the softmax of the values a_i w_i.\n\nGiven the weight vector a and parameters w, return the gradient list.",
    starterCode: `def weighted_logsumexp_gradient(a, w):
    # Your code here
    pass`,
    solution: `def weighted_logsumexp_gradient(a, w):
    import math
    z = [ai * wi for ai, wi in zip(a, w)]
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] * a[i] for i in range(len(a))]`,
    testCases: [
      { input: [[1, 1], [0, 0]], expected: [0.5, 0.5] },
      { input: [[2, 0.5], [1, 2]], expected: [1.4621171572600098, 0.13447071068499755] },
      { input: [[-1, 3], [0, 1]], expected: [-0.04742587317756679, 2.8577223804673] },
    ],
    hint: "Chain rule: the log-sum-exp derivative is the softmax times the inner scale a_i.",
  },
  {
    id: "ca-332",
    title: "Weighted Log-Sum-Exp Hessian Diagonal",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "For f(w) = log(sum_i exp(a_i w_i)), the diagonal of the Hessian with respect to w is p_i (1 - p_i) a_i^2, where p is the softmax of a_i w_i.\n\nGiven a and w, return the diagonal list.",
    starterCode: `def weighted_logsumexp_hessian_diag(a, w):
    # Your code here
    pass`,
    solution: `def weighted_logsumexp_hessian_diag(a, w):
    import math
    z = [ai * wi for ai, wi in zip(a, w)]
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    p = [v / s for v in e]
    return [p[i] * (1.0 - p[i]) * a[i] * a[i] for i in range(len(a))]`,
    testCases: [
      { input: [[1, 1], [0, 0]], expected: [0.25, 0.25] },
      { input: [[2, 0.5], [1, 2]], expected: [0.7864477329659274, 0.04915298331037046] },
      { input: [[1, 1, 1], [1, 2, 3]], expected: [0.08192506906499324, 0.1848364465099787, 0.2226954265346234] },
    ],
    hint: "Differentiate each softmax entry once more and apply the chain rule factor a_i^2.",
  },
  {
    id: "ca-333",
    title: "Three Factor Product Derivative",
    category: "Calculus",
    difficulty: "Easy",
    description:
      "For h(x) = f(x) g(x) p(x), the derivative is f' g p + f g' p + f g p'.\n\nGiven the values f, g, p and their derivatives at a point, return h'.",
    starterCode: `def three_factor_product_derivative(f, fp, g, gp, p, pp):
    # Your code here
    pass`,
    solution: `def three_factor_product_derivative(f, fp, g, gp, p, pp):
    return fp * g * p + f * gp * p + f * g * pp`,
    testCases: [
      { input: [1, 2, 3, 4, 5, 6], expected: 68 },
      { input: [0, 1, 1, 1, 1, 1], expected: 1 },
      { input: [2, 3, 0, 5, 4, 1], expected: 40 },
    ],
    hint: "Differentiate one factor at a time and sum the three products.",
  },
  {
    id: "ca-334",
    title: "Total Derivative Along a Path",
    category: "Calculus",
    difficulty: "Medium",
    description:
      "For f(x(t), y(t)), the total derivative is df/dt = f_x * x'(t) + f_y * y'(t).\n\nGiven the partial derivatives and the coordinate velocities, return the total derivative.",
    starterCode: `def total_derivative_along_path(fx, fy, dx, dy):
    # Your code here
    pass`,
    solution: `def total_derivative_along_path(fx, fy, dx, dy):
    return fx * dx + fy * dy`,
    testCases: [
      { input: [1, 2, 3, 4], expected: 11 },
      { input: [2, -1, 0.5, 0.5], expected: 0.5 },
      { input: [-3, 4, 1, -2], expected: -11 },
    ],
    hint: "Sum the partial derivatives weighted by the corresponding velocities.",
  },
  {
    id: "ca-335",
    title: "Relative Gradient Check Error",
    category: "Calculus",
    difficulty: "Hard",
    description:
      "Gradient checks compare an analytic gradient a against a numerical gradient n using the relative error ||a - n|| / max(1e-8, ||a|| + ||n||), where the norm is Euclidean.\n\nGiven the two vectors, return the relative error.",
    starterCode: `def relative_gradient_check_error(analytic, numeric):
    # Your code here
    pass`,
    solution: `def relative_gradient_check_error(analytic, numeric):
    import math
    diff = math.sqrt(sum((x - y) ** 2 for x, y in zip(analytic, numeric)))
    denom = math.sqrt(sum(x * x for x in analytic)) + math.sqrt(sum(y * y for y in numeric))
    return diff / max(1e-8, denom)`,
    testCases: [
      { input: [[1, 2], [1, 2]], expected: 0.0 },
      { input: [[1, 0], [1.001, 0.001]], expected: 0.0007067532280607271 },
      { input: [[0, 0], [1, 1]], expected: 1.0 },
    ],
    hint: "Guard the denominator against two zero gradients.",
  },
];
