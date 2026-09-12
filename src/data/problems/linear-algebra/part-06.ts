import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-186",
    title: "Quadratic Form Value",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the quadratic form x^T A x for a square matrix A and vector x:\n\nsum over i, j of x[i] * A[i][j] * x[j]\n\nThe result is a scalar; A and x may contain negative entries.",
    starterCode: `def quadratic_form(A, x):
    # Your code here
    pass`,
    solution: `def quadratic_form(A, x):
    return sum(x[i] * A[i][j] * x[j] for i in range(len(x)) for j in range(len(x)))`,
    testCases: [
      { input: [[[2, 1], [1, 3]], [1, 2]], expected: 18 },
      { input: [[[1, 0], [0, 1]], [3, 4]], expected: 25 },
      { input: [[[0, 1], [-1, 0]], [1, 2]], expected: 0 },
      { input: [[[2, 0], [0, 5]], [0, 0]], expected: 0 },
    ],
    hint: "It is equivalent to the dot product of x with A*x.",
  },
  {
    id: "la-187",
    title: "Gradient of Quadratic Form",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the gradient of the scalar function f(x) = x^T A x with respect to x:\n\nnabla f = (A + A^T) x\n\nFor symmetric A this simplifies to 2*A*x.",
    starterCode: `def grad_quadratic(A, x):
    # Your code here
    pass`,
    solution: `def grad_quadratic(A, x):
    n = len(x)
    return [sum((A[i][j] + A[j][i]) * x[j] for j in range(n)) for i in range(n)]`,
    testCases: [
      { input: [[[2, 1], [0, 3]], [1, 1]], expected: [5, 7] },
      { input: [[[1, 0], [0, 1]], [3, 4]], expected: [6, 8] },
      { input: [[[1, 2], [3, 4]], [1, 0]], expected: [2, 5] },
      { input: [[[0, 1], [-1, 0]], [1, 2]], expected: [0, 0] },
    ],
    hint: "The gradient of x^T A x is (A + A^T)x, since only the symmetric part contributes.",
  },
  {
    id: "la-188",
    title: "Gradient of Frobenius Norm Squared",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the gradient of the squared Frobenius norm f(A) = sum over i, j of A[i][j]^2 with respect to A:\n\ngrad = 2 * A\n\nThis is the matrix analogue of d/dx of x^2.",
    starterCode: `def grad_frobenius_sq(A):
    # Your code here
    pass`,
    solution: `def grad_frobenius_sq(A):
    return [[2 * x for x in row] for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[2, 4], [6, 8]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
      { input: [[[-1, 0], [0, 1]]], expected: [[-2, 0], [0, 2]] },
      { input: [[[1.5]]], expected: [[3.0]] },
    ],
    hint: "Differentiate each entry independently; the result scales A by 2.",
  },
  {
    id: "la-189",
    title: "Gradient of trace(AX)",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "For the scalar function f(X) = trace(A*X), return its gradient with respect to X:\n\ngrad = A^T\n\nA and X have compatible square shapes.",
    starterCode: `def grad_trace_ax(A):
    # Your code here
    pass`,
    solution: `def grad_trace_ax(A):
    return [[A[j][i] for j in range(len(A))] for i in range(len(A[0]))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[1, 3], [2, 4]] },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1, 0], [0, 1]] },
      { input: [[[0]]], expected: [[0]] },
    ],
    hint: "trace(AX) = sum_ij A[i][j] X[j][i], so the derivative with respect to X[j][i] is A[i][j].",
  },
  {
    id: "la-190",
    title: "Jacobian of Matrix-Vector Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "The linear map x -> A*x has a constant Jacobian equal to A itself.\n\nReturn A as the Jacobian matrix of the product with respect to x.",
    starterCode: `def jacobian_matvec(A):
    # Your code here
    pass`,
    solution: `def jacobian_matvec(A):
    return [row[:] for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 0, 0]]], expected: [[1, 0, 0]] },
      { input: [[[0], [1]]], expected: [[0], [1]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1, 0], [0, 1]] },
    ],
    hint: "Every component of A*x is linear in x, with coefficients taken from the corresponding row of A.",
  },
  {
    id: "la-191",
    title: "Quaternion Conjugate",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the conjugate of the quaternion q = [w, x, y, z], which negates the vector part:\n\nconj(q) = [w, -x, -y, -z]",
    starterCode: `def quaternion_conjugate(q):
    # Your code here
    pass`,
    solution: `def quaternion_conjugate(q):
    return [q[0], -q[1], -q[2], -q[3]]`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [1, -2, -3, -4] },
      { input: [[0, 0, 0, 0]], expected: [0, 0, 0, 0] },
      { input: [[1.5, -2.5, 3.5, -4.5]], expected: [1.5, 2.5, -3.5, 4.5] },
      { input: [[2, 0, 0, 0]], expected: [2, 0, 0, 0] },
    ],
    hint: "For unit quaternions the conjugate is the inverse rotation.",
  },
  {
    id: "la-192",
    title: "Hadamard Transform 4-point",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Multiply a length-4 vector v by the 4-point Hadamard matrix:\n\nH4 = [[1,1,1,1],[1,-1,1,-1],[1,1,-1,-1],[1,-1,-1,1]]\n\nReturn H4 * v as a list of four values.",
    starterCode: `def hadamard_transform_4(v):
    # Your code here
    pass`,
    solution: `def hadamard_transform_4(v):
    H = [[1, 1, 1, 1], [1, -1, 1, -1], [1, 1, -1, -1], [1, -1, -1, 1]]
    return [sum(H[i][j] * v[j] for j in range(4)) for i in range(4)]`,
    testCases: [
      { input: [[1, 0, 0, 0]], expected: [1, 1, 1, 1] },
      { input: [[1, 1, 1, 1]], expected: [4, 0, 0, 0] },
      { input: [[1, 2, 3, 4]], expected: [10, -2, -4, 0] },
      { input: [[0, 0, 0, 1]], expected: [1, -1, -1, 1] },
    ],
    hint: "Each output is a signed sum of the inputs with signs given by a row of H4.",
  },
  {
    id: "la-193",
    title: "Hilbert Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the n x n Hilbert matrix:\n\nH[i][j] = 1 / (i + j + 1)\n\nThe matrix is symmetric positive definite and famously ill-conditioned.",
    starterCode: `def hilbert_matrix(n):
    # Your code here
    pass`,
    solution: `def hilbert_matrix(n):
    return [[1.0 / (i + j + 1) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [1], expected: [[1.0]] },
      { input: [2], expected: [[1.0, 0.5], [0.5, 0.3333333333333333]] },
      {
        input: [3],
        expected: [
          [1.0, 0.5, 0.3333333333333333],
          [0.5, 0.3333333333333333, 0.25],
          [0.3333333333333333, 0.25, 0.2],
        ],
      },
      {
        input: [4],
        expected: [
          [1.0, 0.5, 0.3333333333333333, 0.25],
          [0.5, 0.3333333333333333, 0.25, 0.2],
          [0.3333333333333333, 0.25, 0.2, 0.16666666666666666],
          [0.25, 0.2, 0.16666666666666666, 0.14285714285714285],
        ],
      },
    ],
    hint: "Use floating-point division so every entry is a float.",
  },
  {
    id: "la-194",
    title: "Cauchy Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the Cauchy matrix from two lists:\n\nC[i][j] = 1 / (x[i] + y[j])\n\nAssume x and y are real lists with no zero denominators.",
    starterCode: `def cauchy_matrix(x, y):
    # Your code here
    pass`,
    solution: `def cauchy_matrix(x, y):
    return [[1.0 / (x[i] + y[j]) for j in range(len(y))] for i in range(len(x))]`,
    testCases: [
      { input: [[1, 2], [3, 4]], expected: [[0.25, 0.2], [0.2, 0.16666666666666666]] },
      { input: [[0, 1], [1, 2]], expected: [[1.0, 0.5], [0.5, 0.3333333333333333]] },
      { input: [[2], [2, 3, 4]], expected: [[0.25, 0.2, 0.16666666666666666]] },
      {
        input: [[1, 2, 3], [1, 2, 3]],
        expected: [
          [0.5, 0.3333333333333333, 0.25],
          [0.3333333333333333, 0.25, 0.2],
          [0.25, 0.2, 0.16666666666666666],
        ],
      },
    ],
    hint: "Cauchy matrices are symmetric when x == y and have a closed-form determinant.",
  },
  {
    id: "la-195",
    title: "Pascal Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the n x n symmetric Pascal matrix:\n\nP[i][j] = C(i + j, i)\n\nwhere C is the binomial coefficient. Its rows follow the diagonals of Pascal's triangle.",
    starterCode: `def pascal_matrix(n):
    # Your code here
    pass`,
    solution: `def pascal_matrix(n):
    import math
    return [[math.comb(i + j, i) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [1], expected: [[1]] },
      { input: [2], expected: [[1, 1], [1, 2]] },
      { input: [3], expected: [[1, 1, 1], [1, 2, 3], [1, 3, 6]] },
      {
        input: [4],
        expected: [[1, 1, 1, 1], [1, 2, 3, 4], [1, 3, 6, 10], [1, 4, 10, 20]],
      },
    ],
    hint: "math.comb(k, r) gives the binomial coefficient directly.",
  },
  {
    id: "la-196",
    title: "Vandermonde Determinant",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of the Vandermonde matrix built from the values x without forming the matrix:\n\ndet = product over i < j of (x[j] - x[i])\n\nRepeated values make the determinant 0.",
    starterCode: `def vandermonde_det(x):
    # Your code here
    pass`,
    solution: `def vandermonde_det(x):
    result = 1
    for i in range(len(x)):
        for j in range(i + 1, len(x)):
            result *= x[j] - x[i]
    return result`,
    testCases: [
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[0, 1]], expected: 1 },
      { input: [[2, 2, 3]], expected: 0 },
      { input: [[1, 2, 3, 4]], expected: 12 },
    ],
    hint: "Each pair of values contributes a difference factor.",
  },
  {
    id: "la-197",
    title: "Jordan Block",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the n x n Jordan block with eigenvalue lam: lam on the diagonal, 1 on the superdiagonal, and 0 elsewhere.\n\nJordan blocks are the building blocks of the Jordan canonical form.",
    starterCode: `def jordan_block(lam, n):
    # Your code here
    pass`,
    solution: `def jordan_block(lam, n):
    return [[lam if i == j else (1 if j == i + 1 else 0) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [2, 3], expected: [[2, 1, 0], [0, 2, 1], [0, 0, 2]] },
      { input: [5, 1], expected: [[5]] },
      { input: [0, 2], expected: [[0, 1], [0, 0]] },
      { input: [3, 2], expected: [[3, 1], [0, 3]] },
    ],
    hint: "A Jordan block has a single eigenvalue but is not diagonalizable unless n == 1.",
  },
  {
    id: "la-198",
    title: "Totally Unimodular Check 2x2",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if the 2x2 integer matrix A is totally unimodular: every entry must lie in {-1, 0, 1} and the determinant must lie in {-1, 0, 1}.\n\nOtherwise return False.",
    starterCode: `def is_totally_unimodular_2x2(A):
    # Your code here
    pass`,
    solution: `def is_totally_unimodular_2x2(A):
    for row in A:
        for x in row:
            if x not in (-1, 0, 1):
                return False
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    return det in (-1, 0, 1)`,
    testCases: [
      { input: [[[1, 1], [1, 0]]], expected: true },
      { input: [[[1, 1], [1, -1]]], expected: false },
      { input: [[[1, 2], [0, 1]]], expected: false },
      { input: [[[1, 1], [1, 1]]], expected: true },
    ],
    hint: "Total unimodularity requires every square submatrix determinant to be 0, 1, or -1.",
  },
  {
    id: "la-199",
    title: "Diagonal Preconditioner Apply",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Apply the diagonal (Jacobi) preconditioner to residual r, returning z with\n\nz[i] = r[i] / A[i][i]\n\nAssume all diagonal entries of A are nonzero.",
    starterCode: `def apply_diagonal_preconditioner(A, r):
    # Your code here
    pass`,
    solution: `def apply_diagonal_preconditioner(A, r):
    return [r[i] / A[i][i] for i in range(len(r))]`,
    testCases: [
      { input: [[[2, 0], [0, 4]], [2, 8]], expected: [1.0, 2.0] },
      { input: [[[1, 1], [1, 3]], [4, 8]], expected: [4.0, 2.6666666666666665] },
      { input: [[[5]], [10]], expected: [2.0] },
      { input: [[[-2, 0], [0, 1]], [1, -1]], expected: [-0.5, -1.0] },
    ],
    hint: "This is one application of the inverse diagonal of A to a vector.",
  },
  {
    id: "la-200",
    title: "Tournament Score Vector",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "In a tournament matrix A[i][j] = 1 means player i beat player j; otherwise it is 0.\n\nReturn the score vector: the number of wins (row sums) for each player.",
    starterCode: `def tournament_scores(A):
    # Your code here
    pass`,
    solution: `def tournament_scores(A):
    return [sum(row) for row in A]`,
    testCases: [
      { input: [[[0, 1, 1], [0, 0, 1], [0, 0, 0]]], expected: [2, 1, 0] },
      { input: [[[0, 1], [0, 0]]], expected: [1, 0] },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [0, 0, 0] },
      { input: [[[0, 1, 0], [0, 0, 1], [1, 0, 0]]], expected: [1, 1, 1] },
    ],
    hint: "A valid tournament matrix has zeros on the diagonal and A[i][j] + A[j][i] = 1 off it.",
  },
  {
    id: "la-201",
    title: "Adjacency Matrix Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if A is a valid adjacency matrix for a simple undirected graph: square with entries in {0, 1}, zero diagonal, and symmetric.\n\nOtherwise return False.",
    starterCode: `def is_valid_adjacency(A):
    # Your code here
    pass`,
    solution: `def is_valid_adjacency(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    for i in range(n):
        if A[i][i] != 0:
            return False
        for j in range(n):
            if A[i][j] not in (0, 1):
                return False
            if A[i][j] != A[j][i]:
                return False
    return True`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: true },
      { input: [[[0, 1], [0, 0]]], expected: false },
      { input: [[[1, 0], [0, 1]]], expected: false },
      { input: [[[0, 2], [2, 0]]], expected: false },
    ],
    hint: "Simple graphs have no self-loops and no multi-edges, so the diagonal is 0 and entries are 0 or 1.",
  },
  {
    id: "la-202",
    title: "Gradient of Determinant",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the gradient of det(A) with respect to the 2x2 matrix A.\n\nFor A = [[a, b], [c, d]] the gradient is the cofactor matrix [[d, -c], [-b, a]].",
    starterCode: `def grad_det_2x2(A):
    # Your code here
    pass`,
    solution: `def grad_det_2x2(A):
    a, b = A[0]
    c, d = A[1]
    return [[d, -c], [-b, a]]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[4, -3], [-2, 1]] },
      { input: [[[2, 0], [0, 3]]], expected: [[3, 0], [0, 2]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1, 0], [0, 1]] },
      { input: [[[1, 2], [2, 4]]], expected: [[4, -2], [-2, 1]] },
    ],
    hint: "The derivative of det(A) is the adjugate transpose, which for 2x2 is the cofactor matrix.",
  },
  {
    id: "la-203",
    title: "Gradient of Log-Determinant",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the gradient of the log-determinant f(A) = log(det(A)) with respect to the 2x2 matrix A:\n\ngrad = inv(A)^T\n\nReturn None if det(A) == 0.",
    starterCode: `def grad_log_det_2x2(A):
    # Your code here
    pass`,
    solution: `def grad_log_det_2x2(A):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    return [[A[1][1] / det, -A[1][0] / det], [-A[0][1] / det, A[0][0] / det]]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[-2.0, 1.5], [1.0, -0.5]] },
      { input: [[[2, 0], [0, 3]]], expected: [[0.5, 0.0], [0.0, 0.3333333333333333]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 2], [2, 4]]], expected: null },
    ],
    hint: "d/dA log det(A) = A^-T, the inverse transpose.",
  },
  {
    id: "la-204",
    title: "Hessian of Least Squares",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the Hessian of the least squares objective f(x) = ||A*x - b||_2^2 with respect to x:\n\nH = 2 * A^T A\n\nThe Hessian is independent of b and is positive semidefinite.",
    starterCode: `def hessian_least_squares(A):
    # Your code here
    pass`,
    solution: `def hessian_least_squares(A):
    n = len(A)
    m = len(A[0])
    return [[2 * sum(A[k][i] * A[k][j] for k in range(n)) for j in range(m)] for i in range(m)]`,
    testCases: [
      { input: [[[1, 1], [1, 2], [1, 3]]], expected: [[6, 12], [12, 28]] },
      { input: [[[1, 0], [0, 1]]], expected: [[2, 0], [0, 2]] },
      { input: [[[1, 0], [0, 1], [0, 0]]], expected: [[2, 0], [0, 2]] },
      { input: [[[2], [3]]], expected: [[26]] },
    ],
    hint: "Expanding ||Ax - b||^2 gives x^T A^T A x minus linear terms, so the Hessian is 2 A^T A.",
  },
  {
    id: "la-205",
    title: "Softmax Jacobian",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the Jacobian of the softmax function at vector v:\n\nJ = diag(s) - s*s^T\n\nwhere s = softmax(v), so J[i][j] = s[i] * (delta_ij - s[j]) with delta the Kronecker delta. Use a stable softmax.",
    starterCode: `def softmax_jacobian(v):
    # Your code here
    pass`,
    solution: `def softmax_jacobian(v):
    import math
    m = max(v)
    exps = [math.exp(x - m) for x in v]
    total = sum(exps)
    s = [x / total for x in exps]
    n = len(v)
    return [[(s[i] if i == j else 0.0) - s[i] * s[j] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[0, 0]], expected: [[0.25, -0.25], [-0.25, 0.25]] },
      {
        input: [[0, 1]],
        expected: [[0.19661193324148185, -0.19661193324148185], [-0.19661193324148185, 0.19661193324148185]],
      },
      { input: [[1000, 1000]], expected: [[0.25, -0.25], [-0.25, 0.25]] },
      {
        input: [[1, 2, 3]],
        expected: [
          [0.08192506906499324, -0.022033044520174298, -0.05989202454481893],
          [-0.022033044520174298, 0.1848364465099787, -0.1628034019898044],
          [-0.05989202454481893, -0.1628034019898044, 0.22269542653462338],
        ],
      },
    ],
    hint: "The softmax Jacobian is symmetric and every row sums to 0.",
  },
  {
    id: "la-206",
    title: "Backprop Through Linear Layer",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Backpropagate through the linear layer y = W*x. Given the upstream gradient grad_out = dL/dy, return [grad_W, grad_x] where\n\ngrad_W[i][j] = grad_out[i] * x[j]  (outer product)\n\ngrad_x = W^T * grad_out.",
    starterCode: `def backprop_linear(W, x, grad_out):
    # Your code here
    pass`,
    solution: `def backprop_linear(W, x, grad_out):
    grad_W = [[grad_out[i] * x[j] for j in range(len(x))] for i in range(len(grad_out))]
    grad_x = [sum(W[i][j] * grad_out[i] for i in range(len(grad_out))) for j in range(len(x))]
    return [grad_W, grad_x]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [1, 0], [1, 1]], expected: [[[1, 0], [1, 0]], [4, 6]] },
      { input: [[[1, 0], [0, 1]], [2, 3], [1, -1]], expected: [[[2, 3], [-2, -3]], [1, -1]] },
      {
        input: [[[1, 0, 0], [0, 1, 0]], [1, 2, 3], [2, 1]],
        expected: [[[2, 4, 6], [1, 2, 3]], [2, 1, 0]],
      },
      { input: [[[1]], [5], [3]], expected: [[[15]], [3]] },
    ],
    hint: "grad_W is the outer product of the upstream gradient with the input; grad_x is the transpose product.",
  },
  {
    id: "la-207",
    title: "BatchNorm Forward",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Normalize vector x to zero mean and unit variance, then scale and shift:\n\ny[i] = gamma * (x[i] - mean) / sqrt(var + eps) + beta\n\nwhere var is the biased (population) variance. If var + eps is 0, treat the normalized value as 0.",
    starterCode: `def batchnorm_forward(x, gamma, beta, eps):
    # Your code here
    pass`,
    solution: `def batchnorm_forward(x, gamma, beta, eps):
    n = len(x)
    mean = sum(x) / n
    var = sum((v - mean) ** 2 for v in x) / n
    denom = (var + eps) ** 0.5
    out = []
    for v in x:
        x_hat = 0.0 if denom == 0 else (v - mean) / denom
        out.append(gamma * x_hat + beta)
    return out`,
    testCases: [
      { input: [[1, 2, 3], 1, 0, 0], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
      { input: [[1, 1], 1, 0, 0], expected: [0.0, 0.0] },
      { input: [[1, 2, 3], 2, 1, 0], expected: [-1.4494897427831779, 1.0, 3.449489742783178] },
      { input: [[0, 2], 1, 1, 1], expected: [0.29289321881345254, 1.7071067811865475] },
    ],
    hint: "The epsilon inside the square root keeps the division safe when variance is small.",
  },
  {
    id: "la-208",
    title: "LDL^T Decomposition 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the LDL^T decomposition A = L*D*L^T of a symmetric 2x2 matrix, with unit lower triangular L and diagonal D.\n\nUse L[1][0] = A[1][0] / A[0][0] and D[1][1] = A[1][1] - L[1][0]^2 * A[0][0]. Return [L, D].",
    starterCode: `def ldl_decompose_2x2(A):
    # Your code here
    pass`,
    solution: `def ldl_decompose_2x2(A):
    l10 = A[1][0] / A[0][0]
    L = [[1.0, 0.0], [l10, 1.0]]
    D = [[float(A[0][0]), 0.0], [0.0, A[1][1] - l10 * l10 * A[0][0]]]
    return [L, D]`,
    testCases: [
      { input: [[[4, 2], [2, 3]]], expected: [[[1.0, 0.0], [0.5, 1.0]], [[4.0, 0.0], [0.0, 2.0]]] },
      { input: [[[1, 0], [0, 1]]], expected: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]] },
      {
        input: [[[9, 6], [6, 5]]],
        expected: [[[1.0, 0.0], [0.6666666666666666, 1.0]], [[9.0, 0.0], [0.0, 1.0]]],
      },
      { input: [[[2, 1], [1, 2]]], expected: [[[1.0, 0.0], [0.5, 1.0]], [[2.0, 0.0], [0.0, 1.5]]] },
    ],
    hint: "LDL^T avoids square roots; D can have negative entries for indefinite matrices.",
  },
  {
    id: "la-209",
    title: "Givens Rotation Parameters",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the Givens rotation parameters [c, s] that zero out the second component of [a, b]:\n\n[[c, s], [-s, c]] * [a, b] = [r, 0], with r = sqrt(a^2 + b^2)\n\nReturn [1.0, 0.0] if both inputs are 0.",
    starterCode: `def givens_parameters(a, b):
    # Your code here
    pass`,
    solution: `def givens_parameters(a, b):
    r = (a * a + b * b) ** 0.5
    if r == 0:
        return [1.0, 0.0]
    return [a / r, b / r]`,
    testCases: [
      { input: [3, 4], expected: [0.6, 0.8] },
      { input: [0, 1], expected: [0.0, 1.0] },
      { input: [0, 0], expected: [1.0, 0.0] },
      { input: [-3, 4], expected: [-0.6, 0.8] },
    ],
    hint: "The resulting matrix is orthogonal with determinant 1 and c^2 + s^2 = 1.",
  },
  {
    id: "la-210",
    title: "Richardson Iteration Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one Richardson iteration step for the system A*x = b:\n\nx_new = x + omega * (b - A*x)\n\nThe scalar omega controls the step size and convergence.",
    starterCode: `def richardson_step(A, b, x, omega):
    # Your code here
    pass`,
    solution: `def richardson_step(A, b, x, omega):
    n = len(b)
    r = [b[i] - sum(A[i][j] * x[j] for j in range(n)) for i in range(n)]
    return [x[i] + omega * r[i] for i in range(n)]`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0], 0.25], expected: [0.25, 0.5] },
      { input: [[[1, 0], [0, 1]], [2, 4], [1, 1], 0.5], expected: [1.5, 2.5] },
      { input: [[[2, 0], [0, 2]], [0, 0], [1, 2], 1], expected: [-1.0, -2.0] },
      { input: [[[1, 0], [0, 1]], [1, 1], [3, 4], 0], expected: [3.0, 4.0] },
    ],
    hint: "The update is a step of size omega along the residual direction.",
  },
  {
    id: "la-211",
    title: "SOR Iteration Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one successive over-relaxation (SOR) step for A*x = b:\n\nx_new[i] = (1 - omega) * x[i] + omega * (b[i] - sum over j != i of A[i][j] * x[j]) / A[i][i]\n\nAlready updated components are used immediately. Assume nonzero diagonal.",
    starterCode: `def sor_step(A, b, x0, omega):
    # Your code here
    pass`,
    solution: `def sor_step(A, b, x0, omega):
    n = len(b)
    x = list(x0)
    for i in range(n):
        s = sum(A[i][j] * x[j] for j in range(n) if j != i)
        x[i] = (1 - omega) * x[i] + omega * (b[i] - s) / A[i][i]
    return x`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0], 1], expected: [0.25, 0.5833333333333334] },
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0], 0.5], expected: [0.125, 0.3125] },
      { input: [[[2, 0], [0, 4]], [4, 8], [1, 1], 1.5], expected: [2.5, 2.5] },
      { input: [[[3, -1], [-1, 2]], [5, 3], [0, 0], 1], expected: [1.6666666666666667, 2.3333333333333335] },
    ],
    hint: "omega = 1 recovers Gauss-Seidel; 1 < omega < 2 is over-relaxation.",
  },
  {
    id: "la-212",
    title: "Multigrid Restriction Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the 1D multigrid restriction operator to a fine-grid vector of odd length 2m+1, producing a coarse vector of length m:\n\ncoarse[i] = 0.25*fine[2i] + 0.5*fine[2i+1] + 0.25*fine[2i+2]",
    starterCode: `def multigrid_restrict(fine):
    # Your code here
    pass`,
    solution: `def multigrid_restrict(fine):
    m = (len(fine) - 1) // 2
    return [0.25 * fine[2 * i] + 0.5 * fine[2 * i + 1] + 0.25 * fine[2 * i + 2] for i in range(m)]`,
    testCases: [
      { input: [[1, 0, 1, 0, 1]], expected: [0.5, 0.5] },
      { input: [[0, 0, 0]], expected: [0.0] },
      { input: [[1, 2, 3, 4, 5]], expected: [2.0, 4.0] },
      { input: [[2, 1, 2]], expected: [1.5] },
    ],
    hint: "The stencil [1/4, 1/2, 1/4] smooths the residual onto the coarser grid.",
  },
  {
    id: "la-213",
    title: "Multigrid Prolongation Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the 1D multigrid prolongation (linear interpolation) operator to a coarse vector of length m+1, producing a fine vector of length 2m+1:\n\nfine[2i] = coarse[i] and fine[2i+1] = 0.5*(coarse[i] + coarse[i+1])",
    starterCode: `def multigrid_prolong(coarse):
    # Your code here
    pass`,
    solution: `def multigrid_prolong(coarse):
    m = len(coarse) - 1
    out = []
    for i in range(m):
        out.append(float(coarse[i]))
        out.append(0.5 * (coarse[i] + coarse[i + 1]))
    out.append(float(coarse[m]))
    return out`,
    testCases: [
      { input: [[1, 1]], expected: [1.0, 1.0, 1.0] },
      { input: [[0, 2]], expected: [0.0, 1.0, 2.0] },
      { input: [[1, 2, 3]], expected: [1.0, 1.5, 2.0, 2.5, 3.0] },
      { input: [[5]], expected: [5.0] },
    ],
    hint: "Fine-grid odd positions are averages of neighboring coarse values.",
  },
  {
    id: "la-214",
    title: "Toeplitz Matrix-Vector Multiply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Multiply a Toeplitz matrix, given by its first row and first column, by a vector without forming the matrix:\n\nresult[i] = sum_j T[i][j] * x[j], where T[i][j] = first_row[j - i] for j >= i and first_col[i - j] otherwise.",
    starterCode: `def toeplitz_matvec(first_row, first_col, x):
    # Your code here
    pass`,
    solution: `def toeplitz_matvec(first_row, first_col, x):
    n = len(x)
    out = []
    for i in range(n):
        s = 0
        for j in range(n):
            t = first_row[j - i] if j >= i else first_col[i - j]
            s += t * x[j]
        out.append(s)
    return out`,
    testCases: [
      { input: [[1, 2, 3], [1, 4, 5], [1, 0, 0]], expected: [1, 4, 5] },
      { input: [[1, 2, 3], [1, 4, 5], [0, 1, 0]], expected: [2, 1, 4] },
      { input: [[1, 2, 3], [1, 4, 5], [1, 1, 1]], expected: [6, 7, 10] },
      { input: [[1, 2, 3], [1, 4, 5], [0, 0, 0]], expected: [0, 0, 0] },
    ],
    hint: "Pick the entry from the first row when the column index is at least the row index.",
  },
  {
    id: "la-215",
    title: "Convolution Matrix Build",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the n x n lower-triangular Toeplitz matrix that performs causal convolution with the given kernel:\n\nC[i][j] = kernel[i - j] when 0 <= i - j < len(kernel), else 0.",
    starterCode: `def convolution_matrix(kernel, n):
    # Your code here
    pass`,
    solution: `def convolution_matrix(kernel, n):
    return [[kernel[i - j] if 0 <= i - j < len(kernel) else 0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[1, 2], 3], expected: [[1, 0, 0], [2, 1, 0], [0, 2, 1]] },
      { input: [[1], 2], expected: [[1, 0], [0, 1]] },
      { input: [[1, 2, 3], 3], expected: [[1, 0, 0], [2, 1, 0], [3, 2, 1]] },
      { input: [[2, 0, 1], 4], expected: [[2, 0, 0, 0], [0, 2, 0, 0], [1, 0, 2, 0], [0, 1, 0, 2]] },
    ],
    hint: "Each column of the convolution matrix is a shifted copy of the kernel.",
  },
  {
    id: "la-216",
    title: "DCT Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the orthonormal DCT-II transform to vector x of length n:\n\nout[k] = alpha_k * sum_i x[i] * cos(pi * (2i + 1) * k / (2n))\n\nwith alpha_0 = sqrt(1/n) and alpha_k = sqrt(2/n) for k > 0.",
    starterCode: `def dct_apply(x):
    # Your code here
    pass`,
    solution: `def dct_apply(x):
    import math
    n = len(x)
    out = []
    for k in range(n):
        alpha = math.sqrt(1.0 / n) if k == 0 else math.sqrt(2.0 / n)
        s = sum(x[i] * math.cos(math.pi * (2 * i + 1) * k / (2 * n)) for i in range(n))
        out.append(alpha * s)
    return out`,
    testCases: [
      { input: [[1, 0, 0, 0]], expected: [0.5, 0.6532814824381883, 0.5, 0.27059805007309856] },
      { input: [[1, 1, 1, 1]], expected: [2.0, 0.0, 0.0, 0.0] },
      { input: [[1, 2, 3, 4]], expected: [5.0, -2.230442497387663, 0.0, -0.15851266778110815] },
      { input: [[1, 0]], expected: [0.7071067811865476, 0.7071067811865476] },
    ],
    hint: "The DCT is a real orthogonal transform; the k = 0 coefficient is the mean times sqrt(n).",
  },
  {
    id: "la-217",
    title: "Haar Wavelet Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply one level of the orthonormal Haar wavelet transform to a vector of even length:\n\ncoarse[i] = (x[2i] + x[2i+1]) / sqrt(2), detail[i] = (x[2i] - x[2i+1]) / sqrt(2)\n\nReturn the coarse coefficients followed by the detail coefficients.",
    starterCode: `def haar_step(x):
    # Your code here
    pass`,
    solution: `def haar_step(x):
    import math
    n = len(x)
    half = n // 2
    coarse = [(x[2 * i] + x[2 * i + 1]) / math.sqrt(2) for i in range(half)]
    detail = [(x[2 * i] - x[2 * i + 1]) / math.sqrt(2) for i in range(half)]
    return coarse + detail`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: [1.4142135623730951, 1.4142135623730951, 0.0, 0.0] },
      { input: [[1, 0]], expected: [0.7071067811865476, 0.7071067811865476] },
      {
        input: [[1, 2, 3, 4]],
        expected: [2.1213203435596424, 4.949747468305833, -0.7071067811865476, -0.7071067811865476],
      },
      { input: [[0, 0, 0, 0]], expected: [0.0, 0.0, 0.0, 0.0] },
    ],
    hint: "The transform is orthogonal, so energy is preserved between the coarse and detail parts.",
  },
  {
    id: "la-218",
    title: "Characteristic Polynomial 3x3",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the coefficients [1.0, b, c, d] of the characteristic polynomial of a 3x3 matrix:\n\nlambda^3 - tr(A)*lambda^2 + c2*lambda - det(A)\n\nwhere c2 = (tr(A)^2 - tr(A^2)) / 2. So b = -tr(A), c = c2, d = -det(A).",
    starterCode: `def char_poly_3x3(A):
    # Your code here
    pass`,
    solution: `def char_poly_3x3(A):
    n = 3
    tr = sum(A[i][i] for i in range(n))
    A2 = [[sum(A[i][k] * A[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
    tr2 = sum(A2[i][i] for i in range(n))
    c2 = (tr * tr - tr2) / 2
    def det3(M):
        return (
            M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
            - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
            + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
        )
    c3 = det3(A)
    return [1.0, -float(tr), float(c2), -float(c3)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [1.0, -3.0, 3.0, -1.0] },
      { input: [[[2, 1, 0], [0, 3, 1], [0, 0, 4]]], expected: [1.0, -9.0, 26.0, -24.0] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1.0, -15.0, -18.0, 0.0] },
      { input: [[[1, 0, 1], [0, 1, 0], [-1, 0, 1]]], expected: [1.0, -3.0, 4.0, -2.0] },
    ],
    hint: "Newton's identities relate the power sums tr(A), tr(A^2) to the elementary symmetric coefficients.",
  },
  {
    id: "la-219",
    title: "Minimal Polynomial 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the coefficients of the minimal polynomial of a 2x2 matrix A.\n\nIf A = lam*I, the minimal polynomial is degree 1 and the coefficients are [1.0, -lam]. Otherwise it equals the characteristic polynomial [1.0, -tr(A), det(A)].",
    starterCode: `def minimal_polynomial_2x2(A):
    # Your code here
    pass`,
    solution: `def minimal_polynomial_2x2(A):
    if A[0][1] == 0 and A[1][0] == 0 and A[0][0] == A[1][1]:
        return [1.0, -float(A[0][0])]
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    return [1.0, -float(tr), float(det)]`,
    testCases: [
      { input: [[[2, 0], [0, 2]]], expected: [1.0, -2.0] },
      { input: [[[2, 0], [0, 3]]], expected: [1.0, -5.0, 6.0] },
      { input: [[[1, 1], [0, 1]]], expected: [1.0, -2.0, 1.0] },
      { input: [[[0, 0], [0, 0]]], expected: [1.0, 0.0] },
    ],
    hint: "Scalar matrices are the only 2x2 matrices whose minimal polynomial has degree 1.",
  },
  {
    id: "la-220",
    title: "Fibonacci Matrix Power",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the n-th Fibonacci number F(n) with F(0) = 0 and F(1) = 1 using fast exponentiation of the matrix [[1, 1], [1, 0]].\n\nSince the matrix raised to n has F(n) in its top-right corner, return that entry.",
    starterCode: `def fibonacci_matrix(n):
    # Your code here
    pass`,
    solution: `def fibonacci_matrix(n):
    def mul(X, Y):
        return [[sum(X[i][k] * Y[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    R = [[1, 0], [0, 1]]
    M = [[1, 1], [1, 0]]
    while n > 0:
        if n % 2 == 1:
            R = mul(R, M)
        M = mul(M, M)
        n //= 2
    return R[0][1]`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [10], expected: 55 },
      { input: [20], expected: 6765 },
    ],
    hint: "Binary exponentiation makes F(n) computable in O(log n) matrix multiplies.",
  },
  {
    id: "la-221",
    title: "Markov Chain Mixing Rate",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the mixing rate of a 2x2 row-stochastic matrix P: the absolute value of its second eigenvalue.\n\nOne eigenvalue is always 1, so the second is trace(P) - 1 and the mixing rate is |trace(P) - 1|.",
    starterCode: `def markov_mixing_rate(P):
    # Your code here
    pass`,
    solution: `def markov_mixing_rate(P):
    return abs((P[0][0] + P[1][1]) - 1)`,
    testCases: [
      { input: [[[0.5, 0.5], [1, 0]]], expected: 0.5 },
      { input: [[[0.9, 0.1], [0.3, 0.7]]], expected: 0.6 },
      { input: [[[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
    ],
    hint: "A smaller mixing rate means faster convergence to the stationary distribution.",
  },
  {
    id: "la-222",
    title: "Householder QR Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Apply one Householder QR step to the first column of matrix A (n x 2).\n\nBuild the unit Householder vector from the first column with alpha = -sign(col[0]) * ||col||_2, form H = I - 2*v*v^T, and return H*A with zeros below the first entry of column 0.",
    starterCode: `def householder_qr_step(A):
    # Your code here
    pass`,
    solution: `def householder_qr_step(A):
    n = len(A)
    col = [A[i][0] for i in range(n)]
    norm = sum(x * x for x in col) ** 0.5
    sign = 1.0 if col[0] >= 0 else -1.0
    alpha = -sign * norm
    v = list(col)
    v[0] -= alpha
    nv = sum(t * t for t in v) ** 0.5
    v = [t / nv for t in v]
    H = [[(1.0 if i == j else 0.0) - 2 * v[i] * v[j] for j in range(n)] for i in range(n)]
    return [[sum(H[i][k] * A[k][j] for k in range(n)) for j in range(len(A[0]))] for i in range(n)]`,
    testCases: [
      { input: [[[3, 4], [0, 0], [0, 0]]], expected: [[-3.0, -4.0], [0.0, 0.0], [0.0, 0.0]] },
      {
        input: [[[1, 1], [1, 2], [1, 3]]],
        expected: [[-1.7320508075688772, -3.4641016151377544], [0.0, 0.3660254037844386], [0.0, 1.3660254037844384]],
      },
      { input: [[[1, 0], [0, 1], [0, 0]]], expected: [[-1.0, 0.0], [0.0, 1.0], [0.0, 0.0]] },
      {
        input: [[[2, 3], [2, 1], [0, 0]]],
        expected: [[-2.828427124746189, -2.8284271247461885], [0.0, -1.414213562373095], [0.0, 0.0]],
      },
    ],
    hint: "The Householder reflection maps the first column to a multiple of e1, producing a triangular first column.",
  },
  {
    id: "la-223",
    title: "Schur Form 2x2 Check",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Check whether Q puts the 2x2 matrix A into Schur form: Q must be orthogonal and T = Q^T*A*Q must be upper triangular (all within 1e-9).\n\nIf both conditions hold, return T; otherwise return None.",
    starterCode: `def schur_check_2x2(A, Q):
    # Your code here
    pass`,
    solution: `def schur_check_2x2(A, Q):
    for i in range(2):
        for j in range(2):
            s = sum(Q[k][i] * Q[k][j] for k in range(2))
            target = 1.0 if i == j else 0.0
            if abs(s - target) > 1e-9:
                return None
    T = [
        [sum(Q[k][i] * A[k][l] * Q[l][j] for k in range(2) for l in range(2)) for j in range(2)]
        for i in range(2)
    ]
    if abs(T[1][0]) > 1e-9:
        return None
    return T`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[1, 0], [0, 1]]], expected: [[2.0, 0.0], [0.0, 3.0]] },
      {
        input: [
          [[4, 1], [2, 3]],
          [[0.7071067811865475, -0.7071067811865475], [0.7071067811865475, 0.7071067811865475]],
        ],
        expected: [[5.0, -1.0], [0.0, 2.0]],
      },
      { input: [[[2, 1], [1, 2]], [[1, 0], [0, 1]]], expected: null },
      { input: [[[2, 0], [0, 3]], [[1, 1], [0, 1]]], expected: null },
    ],
    hint: "The Schur decomposition always exists for real matrices with real eigenvalues; Q's first column is an eigenvector.",
  },
  {
    id: "la-224",
    title: "Quaternion to Rotation Matrix",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Convert the quaternion q = [w, x, y, z] into a 3x3 rotation matrix.\n\nNormalize q first, then use\n\nR = [[1-2(y^2+z^2), 2(xy-wz), 2(xz+wy)], [2(xy+wz), 1-2(x^2+z^2), 2(yz-wx)], [2(xz-wy), 2(yz+wx), 1-2(x^2+y^2)]]",
    starterCode: `def quaternion_to_rotation(q):
    # Your code here
    pass`,
    solution: `def quaternion_to_rotation(q):
    w, x, y, z = q
    norm = (w * w + x * x + y * y + z * z) ** 0.5
    w, x, y, z = w / norm, x / norm, y / norm, z / norm
    return [
        [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
        [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
        [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
    ]`,
    testCases: [
      { input: [[1, 0, 0, 0]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[0, 0, 0, 1]], expected: [[-1.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, 1.0]] },
      {
        input: [[0.7071067811865476, 0, 0, 0.7071067811865476]],
        expected: [[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]],
      },
      { input: [[0, 1, 0, 0]], expected: [[1.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, -1.0]] },
    ],
    hint: "The quaternion (cos(theta/2), axis*sin(theta/2)) rotates by theta about the normalized axis.",
  },
  {
    id: "la-225",
    title: "Quaternion SLERP",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Spherical linear interpolation between unit quaternions q1 and q2 at parameter t:\n\nIf dot(q1, q2) < 0, negate q2 for the shortest path. If the adjusted dot exceeds 0.9995, normalize the linear interpolation; otherwise use theta = acos(dot) and interpolate with sin weights. Return a unit quaternion.",
    starterCode: `def quaternion_slerp(q1, q2, t):
    # Your code here
    pass`,
    solution: `def quaternion_slerp(q1, q2, t):
    import math
    d = sum(q1[i] * q2[i] for i in range(4))
    q2 = list(q2)
    if d < 0:
        d = -d
        q2 = [-x for x in q2]
    if d > 0.9995:
        r = [(1 - t) * q1[i] + t * q2[i] for i in range(4)]
        norm = sum(x * x for x in r) ** 0.5
        return [x / norm for x in r]
    theta = math.acos(d)
    return [
        (math.sin((1 - t) * theta) * q1[i] + math.sin(t * theta) * q2[i]) / math.sin(theta)
        for i in range(4)
    ]`,
    testCases: [
      { input: [[1, 0, 0, 0], [0, 0, 0, 1], 0.5], expected: [0.7071067811865475, 0.0, 0.0, 0.7071067811865475] },
      { input: [[1, 0, 0, 0], [0, 0, 0, 1], 0], expected: [1.0, 0.0, 0.0, 0.0] },
      { input: [[1, 0, 0, 0], [0, 0, 0, 1], 1], expected: [0.0, 0.0, 0.0, 1.0] },
      {
        input: [
          [0.7071067811865476, 0, 0, 0.7071067811865476],
          [-0.7071067811865476, 0, 0, -0.7071067811865476],
          0.5,
        ],
        expected: [0.7071067811865476, 0.0, 0.0, 0.7071067811865476],
      },
    ],
    hint: "Negating a quaternion represents the same rotation, so pick the hemisphere closer to q1.",
  },
  {
    id: "la-226",
    title: "Polar Decomposition 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the polar decomposition A = U*P of a nonsingular 2x2 matrix, where U is orthogonal and P is symmetric positive definite.\n\nSet P to the symmetric square root of A^T A and U = A * inv(P). Return [U, P], or None if P is singular.",
    starterCode: `def polar_decomposition_2x2(A):
    # Your code here
    pass`,
    solution: `def polar_decomposition_2x2(A):
    ATA = [[sum(A[k][i] * A[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    a, b, c, d = ATA[0][0], ATA[0][1], ATA[1][0], ATA[1][1]
    tr = a + d
    det = a * d - b * c
    disc = (tr * tr / 4 - det) ** 0.5
    l1 = tr / 2 + disc
    l2 = tr / 2 - disc
    if abs(b) > 1e-12:
        v = [b, l1 - a]
        norm = (v[0] * v[0] + v[1] * v[1]) ** 0.5
        v = [v[0] / norm, v[1] / norm]
    elif a >= d:
        v = [1.0, 0.0]
    else:
        v = [0.0, 1.0]
    w = [-v[1], v[0]]
    s1 = l1 ** 0.5
    s2 = l2 ** 0.5
    P = [
        [s1 * v[0] * v[0] + s2 * w[0] * w[0], s1 * v[0] * v[1] + s2 * w[0] * w[1]],
        [s1 * v[1] * v[0] + s2 * w[1] * w[0], s1 * v[1] * v[1] + s2 * w[1] * w[1]],
    ]
    pdet = P[0][0] * P[1][1] - P[0][1] * P[1][0]
    if abs(pdet) < 1e-15:
        return None
    Pi = [[P[1][1] / pdet, -P[0][1] / pdet], [-P[1][0] / pdet, P[0][0] / pdet]]
    U = [[sum(A[i][k] * Pi[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    return [U, P]`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]] },
      { input: [[[2, 0], [0, 3]]], expected: [[[1.0, 0.0], [0.0, 1.0]], [[2.0, 0.0], [0.0, 3.0]]] },
      { input: [[[0, -1], [1, 0]]], expected: [[[0.0, -1.0], [1.0, 0.0]], [[1.0, 0.0], [0.0, 1.0]]] },
      {
        input: [[[1, 1], [0, 1]]],
        expected: [
          [[0.8944271909999157, 0.4472135954999578], [-0.4472135954999578, 0.8944271909999157]],
          [[0.894427190999916, 0.44721359549995804], [0.4472135954999579, 1.3416407864998738]],
        ],
      },
    ],
    hint: "P captures the stretching and U the rotation/reflection of the linear map.",
  },
  {
    id: "la-227",
    title: "Log-Euclidean Distance 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the log-Euclidean distance between two symmetric positive definite 2x2 matrices:\n\nd(A, B) = ||log(A) - log(B)||_F\n\nwhere log of a SPD matrix is computed from its eigendecomposition (orthonormal eigenvectors).",
    starterCode: `def log_euclidean_distance_2x2(A, B):
    # Your code here
    pass`,
    solution: `def log_euclidean_distance_2x2(A, B):
    import math
    def sym_log(M):
        a, b, c, d = M[0][0], M[0][1], M[1][0], M[1][1]
        tr = a + d
        det = a * d - b * c
        disc = (tr * tr / 4 - det) ** 0.5
        l1 = tr / 2 + disc
        l2 = tr / 2 - disc
        if abs(b) > 1e-12:
            v = [b, l1 - a]
            norm = (v[0] * v[0] + v[1] * v[1]) ** 0.5
            v = [v[0] / norm, v[1] / norm]
        elif a >= d:
            v = [1.0, 0.0]
        else:
            v = [0.0, 1.0]
        w = [-v[1], v[0]]
        s1 = math.log(l1)
        s2 = math.log(l2)
        return [
            [s1 * v[0] * v[0] + s2 * w[0] * w[0], s1 * v[0] * v[1] + s2 * w[0] * w[1]],
            [s1 * v[1] * v[0] + s2 * w[1] * w[0], s1 * v[1] * v[1] + s2 * w[1] * w[1]],
        ]
    LA = sym_log(A)
    LB = sym_log(B)
    return sum((LA[i][j] - LB[i][j]) ** 2 for i in range(2) for j in range(2)) ** 0.5`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[2, 0], [0, 3]]], expected: 0.0 },
      { input: [[[1, 0], [0, 1]], [[2, 0], [0, 4]]], expected: 1.5499242141443583 },
      { input: [[[1, 0], [0, 1]], [[2.718281828459045, 0], [0, 2.718281828459045]]], expected: 1.4142135623730951 },
      { input: [[[2, 1], [1, 2]], [[3, 1], [1, 3]]], expected: 0.7504758415354572 },
    ],
    hint: "Log-Euclidean distances respect the manifold geometry of SPD matrices.",
  },
  {
    id: "la-228",
    title: "Hilbert 2x2 Condition Number",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Return the 2-norm condition number of the n x n Hilbert matrix, for n = 1 or 2.\n\nFor n = 2, the matrix [[1, 1/2], [1/2, 1/3]] is symmetric positive definite with eigenvalues (4 +/- sqrt(13)) / 6, so the condition number is their ratio. Return None for any other n.",
    starterCode: `def hilbert_condition(n):
    # Your code here
    pass`,
    solution: `def hilbert_condition(n):
    if n == 1:
        return 1.0
    if n != 2:
        return None
    tr = 1.0 + 1.0 / 3.0
    det = 1.0 / 3.0 - 1.0 / 4.0
    disc = (tr * tr - 4 * det) ** 0.5
    l1 = (tr + disc) / 2
    l2 = (tr - disc) / 2
    return l1 / l2`,
    testCases: [
      { input: [1], expected: 1.0 },
      { input: [2], expected: 19.281470067903985 },
      { input: [0], expected: null },
      { input: [3], expected: null },
    ],
    hint: "For a symmetric positive definite matrix, the 2-norm condition number is the ratio of extreme eigenvalues.",
  },
  {
    id: "la-229",
    title: "Complex Matrix Multiply",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Multiply two complex matrices A and B, where each entry is a pair [real, imaginary].\n\nUse (a+bi)(c+di) = (ac - bd) + (ad + bc)i and return the product as a matrix of [real, imaginary] pairs.",
    starterCode: `def complex_matrix_multiply(A, B):
    # Your code here
    pass`,
    solution: `def complex_matrix_multiply(A, B):
    n = len(A)
    m = len(B[0])
    k = len(B)
    out = [[[0.0, 0.0] for _ in range(m)] for _ in range(n)]
    for i in range(n):
        for j in range(m):
            re = 0.0
            im = 0.0
            for t in range(k):
                a, b = A[i][t]
                c, d = B[t][j]
                re += a * c - b * d
                im += a * d + b * c
            out[i][j] = [re, im]
    return out`,
    testCases: [
      {
        input: [[[[1, 1], [0, 0]], [[0, 0], [1, -1]]], [[[1, 0], [0, 0]], [[0, 0], [1, 0]]]],
        expected: [[[1.0, 1.0], [0.0, 0.0]], [[0.0, 0.0], [1.0, -1.0]]],
      },
      { input: [[[[0, 1]]], [[[0, 1]]]], expected: [[[-1.0, 0.0]]] },
      { input: [[[[1, 1]]], [[[1, -1]]]], expected: [[[2.0, 0.0]]] },
      {
        input: [
          [[[1, 0], [2, -1]], [[0, 1], [3, 0]]],
          [[[2, 1], [0, 0]], [[-1, 2], [1, 1]]],
        ],
        expected: [[[2.0, 6.0], [3.0, 1.0]], [[-4.0, 8.0], [3.0, 3.0]]],
      },
    ],
    hint: "Track real and imaginary parts separately with the complex multiplication rule.",
  },
  {
    id: "la-230",
    title: "Unitary Check 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Return True if the complex 2x2 matrix A is unitary: A^H * A must equal the identity within 1e-9.\n\nEntries are [real, imaginary] pairs; A^H is the conjugate transpose.",
    starterCode: `def is_unitary_2x2(A):
    # Your code here
    pass`,
    solution: `def is_unitary_2x2(A):
    def conj(z):
        return [z[0], -z[1]]
    for i in range(2):
        for j in range(2):
            re = 0.0
            im = 0.0
            for k in range(2):
                a = conj(A[k][i])
                b = A[k][j]
                re += a[0] * b[0] - a[1] * b[1]
                im += a[0] * b[1] + a[1] * b[0]
            target = 1.0 if i == j else 0.0
            if abs(re - target) > 1e-9 or abs(im) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[[1, 0], [0, 0]], [[0, 0], [1, 0]]]], expected: true },
      { input: [[[[0, 1], [0, 0]], [[0, 0], [0, 1]]]], expected: true },
      { input: [[[[1, 1], [0, 0]], [[0, 0], [1, 0]]]], expected: false },
      { input: [[[[0, 1], [0, 0]], [[1, 0], [0, 0]]]], expected: false },
    ],
    hint: "Unitary matrices preserve the complex inner product; their columns form an orthonormal basis.",
  },
];

