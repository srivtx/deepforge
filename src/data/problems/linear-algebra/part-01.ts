import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
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
];
