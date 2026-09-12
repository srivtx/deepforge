import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-011",
    title: "Vector Addition",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the elementwise sum of two vectors a and b.\n\nBoth vectors have the same length. Return a new list c where c[i] = a[i] + b[i].",
    starterCode: `def add_vectors(a, b):
    # Your code here
    pass`,
    solution: `def add_vectors(a, b):
    return [x + y for x, y in zip(a, b)]`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [5, 7, 9] },
      { input: [[0, 0], [1, -1]], expected: [1, -1] },
      { input: [[-2, 5], [2, -5]], expected: [0, 0] },
      { input: [[1.5, -2.5], [0.5, 1.5]], expected: [2.0, -1.0] },
    ],
    hint: "Pair the components with zip and add each pair.",
  },
  {
    id: "la-012",
    title: "Scalar-Vector Multiplication",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Multiply every component of vector v by the scalar s.\n\nReturn a new list w where w[i] = s * v[i].",
    starterCode: `def scale_vector(v, s):
    # Your code here
    pass`,
    solution: `def scale_vector(v, s):
    return [x * s for x in v]`,
    testCases: [
      { input: [[1, 2, 3], 2], expected: [2, 4, 6] },
      { input: [[1, -1, 0], -3], expected: [-3, 3, 0] },
      { input: [[2.5, 4.0], 0.5], expected: [1.25, 2.0] },
      { input: [[], 5], expected: [] },
    ],
    hint: "A list comprehension over v is enough.",
  },
  {
    id: "la-013",
    title: "L1 Vector Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the L1 (Manhattan) norm of a vector v: the sum of the absolute values of its components.\n\n||v||_1 = sum(|v[i]|).",
    starterCode: `def l1_norm(v):
    # Your code here
    pass`,
    solution: `def l1_norm(v):
    return sum(abs(x) for x in v)`,
    testCases: [
      { input: [[3, -4]], expected: 7 },
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[0, 0, 0]], expected: 0 },
      { input: [[-1.5, 2.5, -3.0]], expected: 7.0 },
    ],
    hint: "Use the built-in abs and sum.",
  },
  {
    id: "la-014",
    title: "Infinity Vector Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the infinity norm of a vector v: the maximum absolute component.\n\n||v||_inf = max(|v[i]|). Return 0.0 for an empty vector.",
    starterCode: `def inf_norm(v):
    # Your code here
    pass`,
    solution: `def inf_norm(v):
    if not v:
        return 0.0
    return max(abs(x) for x in v)`,
    testCases: [
      { input: [[3, -4, 2]], expected: 4 },
      { input: [[0, 0, 0]], expected: 0 },
      { input: [[-7]], expected: 7 },
      { input: [[1.5, -9.25, 3.0]], expected: 9.25 },
    ],
    hint: "Take the max of the absolute values.",
  },
  {
    id: "la-015",
    title: "Orthogonality Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if vectors a and b are orthogonal, that is, their dot product is exactly 0. Otherwise return False.",
    starterCode: `def is_orthogonal(a, b):
    # Your code here
    pass`,
    solution: `def is_orthogonal(a, b):
    return sum(x * y for x, y in zip(a, b)) == 0`,
    testCases: [
      { input: [[1, 0], [0, 1]], expected: true },
      { input: [[1, 2], [2, -1]], expected: true },
      { input: [[1, 2], [3, 4]], expected: false },
      { input: [[0, 0, 0], [5, 6, 7]], expected: true },
    ],
    hint: "The zero vector is orthogonal to everything.",
  },
  {
    id: "la-016",
    title: "Identity Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the n x n identity matrix I, where I[i][j] = 1 if i == j and 0 otherwise.\n\nIf n is 0, return an empty list.",
    starterCode: `def identity_matrix(n):
    # Your code here
    pass`,
    solution: `def identity_matrix(n):
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [1], expected: [[1]] },
      { input: [2], expected: [[1, 0], [0, 1]] },
      { input: [3], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      { input: [0], expected: [] },
    ],
    hint: "Nested comprehension with a conditional expression.",
  },
  {
    id: "la-017",
    title: "Main Diagonal Extraction",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the main diagonal of matrix A as a list: d[k] = A[k][k].\n\nA may be rectangular; stop when either index runs out.",
    starterCode: `def extract_diagonal(A):
    # Your code here
    pass`,
    solution: `def extract_diagonal(A):
    if not A or not A[0]:
        return []
    return [A[i][i] for i in range(min(len(A), len(A[0])))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1, 4] },
      { input: [[[5, 0, 0], [0, 6, 0], [0, 0, 7]]], expected: [5, 6, 7] },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [1, 5] },
      { input: [[[9]]], expected: [9] },
    ],
    hint: "The diagonal length is min(rows, columns).",
  },
  {
    id: "la-018",
    title: "Matrix Addition",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Add two matrices A and B of the same shape elementwise.\n\nReturn C with C[i][j] = A[i][j] + B[i][j].",
    starterCode: `def add_matrices(A, B):
    # Your code here
    pass`,
    solution: `def add_matrices(A, B):
    return [[A[i][j] + B[i][j] for j in range(len(A[0]))] for i in range(len(A))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [[6, 8], [10, 12]] },
      { input: [[[0, 0], [0, 0]], [[1, -1], [-2, 2]]], expected: [[1, -1], [-2, 2]] },
      { input: [[[-1, -2], [-3, -4]], [[1, 2], [3, 4]]], expected: [[0, 0], [0, 0]] },
      { input: [[[1.5, 2.5]], [[0.5, -1.5]]], expected: [[2.0, 1.0]] },
    ],
    hint: "Loop over each row and column index.",
  },
  {
    id: "la-019",
    title: "Matrix Scalar Multiplication",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Multiply every entry of matrix A by the scalar s.\n\nReturn B with B[i][j] = s * A[i][j].",
    starterCode: `def scale_matrix(A, s):
    # Your code here
    pass`,
    solution: `def scale_matrix(A, s):
    return [[x * s for x in row] for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: [[2, 4], [6, 8]] },
      { input: [[[1, -1], [-2, 2]], -1], expected: [[-1, 1], [2, -2]] },
      { input: [[[2, 4], [6, 8]], 0.5], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[0, 0], [0, 0]] },
    ],
    hint: "One comprehension over rows, one over entries.",
  },
  {
    id: "la-020",
    title: "Hadamard Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the elementwise (Hadamard) product of two matrices A and B of the same shape.\n\nC[i][j] = A[i][j] * B[i][j].",
    starterCode: `def hadamard_product(A, B):
    # Your code here
    pass`,
    solution: `def hadamard_product(A, B):
    return [[A[i][j] * B[i][j] for j in range(len(A[0]))] for i in range(len(A))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [[5, 12], [21, 32]] },
      { input: [[[2, 0], [1, -1]], [[0, 3], [4, 5]]], expected: [[0, 0], [4, -5]] },
      { input: [[[1, 1, 1]], [[2, 3, 4]]], expected: [[2, 3, 4]] },
      { input: [[[2]], [[3]]], expected: [[6]] },
    ],
    hint: "This is not matrix multiplication; multiply matching positions only.",
  },
  {
    id: "la-021",
    title: "Symmetric Matrix Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if matrix A is square and symmetric (A[i][j] == A[j][i] for all i, j).\n\nReturn False for any non-square matrix.",
    starterCode: `def is_symmetric(A):
    # Your code here
    pass`,
    solution: `def is_symmetric(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    return all(A[i][j] == A[j][i] for i in range(n) for j in range(n))`,
    testCases: [
      { input: [[[1, 2], [2, 3]]], expected: true },
      { input: [[[1, 2], [3, 4]]], expected: false },
      { input: [[[2, 0, 1], [0, -1, 3], [1, 3, 5]]], expected: true },
      { input: [[[1, 0], [0, 1], [2, 2]]], expected: false },
    ],
    hint: "Check the shape first, then compare mirrored entries.",
  },
  {
    id: "la-022",
    title: "2D Scaling Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the 2x2 scaling matrix with horizontal factor sx and vertical factor sy:\n\nS = [[sx, 0], [0, sy]]",
    starterCode: `def scaling_matrix(sx, sy):
    # Your code here
    pass`,
    solution: `def scaling_matrix(sx, sy):
    return [[sx, 0], [0, sy]]`,
    testCases: [
      { input: [2, 3], expected: [[2, 0], [0, 3]] },
      { input: [1, 1], expected: [[1, 0], [0, 1]] },
      { input: [-1, 2], expected: [[-1, 0], [0, 2]] },
      { input: [0.5, -1.5], expected: [[0.5, 0], [0, -1.5]] },
    ],
    hint: "The off-diagonal entries are always 0.",
  },
  {
    id: "la-023",
    title: "Frobenius Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the Frobenius norm of matrix A: the square root of the sum of squared entries.\n\n||A||_F = sqrt(sum(A[i][j]^2)).",
    starterCode: `def frobenius_norm(A):
    # Your code here
    pass`,
    solution: `def frobenius_norm(A):
    return sum(x * x for row in A for x in row) ** 0.5`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 5.477225575051661 },
      { input: [[[3, 0], [0, 4]]], expected: 5.0 },
      { input: [[[1, 1], [1, 1]]], expected: 2.0 },
      { input: [[[0]]], expected: 0.0 },
    ],
    hint: "Flatten the matrix and take the L2 norm of all entries.",
  },
  {
    id: "la-024",
    title: "Matrix 1-Norm (Max Column Sum)",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the induced matrix 1-norm: the maximum over columns of the sum of absolute entries in that column.\n\n||A||_1 = max_j sum_i |A[i][j]|.",
    starterCode: `def matrix_1_norm(A):
    # Your code here
    pass`,
    solution: `def matrix_1_norm(A):
    return max(sum(abs(A[i][j]) for i in range(len(A))) for j in range(len(A[0])))`,
    testCases: [
      { input: [[[1, -2], [3, -4]]], expected: 6 },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: 9 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[-1.5, 2.0]]], expected: 2.0 },
    ],
    hint: "Sum down each column, then take the largest column total.",
  },
  {
    id: "la-025",
    title: "Cosine Similarity",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the cosine similarity between vectors a and b:\n\ncos(a, b) = (a . b) / (||a||_2 * ||b||_2)\n\nIf either vector is the zero vector, return 0.0.",
    starterCode: `def cosine_similarity(a, b):
    # Your code here
    pass`,
    solution: `def cosine_similarity(a, b):
    dot_ab = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_ab / (norm_a * norm_b)`,
    testCases: [
      { input: [[1, 0], [1, 0]], expected: 1.0 },
      { input: [[1, 0], [0, 1]], expected: 0.0 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 0.9746318461970762 },
      { input: [[0, 0], [1, 1]], expected: 0.0 },
    ],
    hint: "The result lies in [-1, 1] for nonzero vectors.",
  },
  {
    id: "la-026",
    title: "Angle Between Vectors",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the angle between vectors a and b in degrees, using\n\ntheta = acos((a . b) / (||a||_2 * ||b||_2))\n\nClamp the cosine to [-1, 1] to avoid floating-point domain errors, and return 0.0 if either vector is zero.",
    starterCode: `def angle_between(a, b):
    # Your code here
    pass`,
    solution: `def angle_between(a, b):
    import math
    dot_ab = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    cos_theta = dot_ab / (norm_a * norm_b)
    cos_theta = max(-1.0, min(1.0, cos_theta))
    return math.degrees(math.acos(cos_theta))`,
    testCases: [
      { input: [[1, 0], [0, 1]], expected: 90.0 },
      { input: [[1, 0], [1, 0]], expected: 0.0 },
      { input: [[1, 0], [-1, 0]], expected: 180.0 },
      { input: [[1, 1], [1, 0]], expected: 45.0 },
    ],
    hint: "Convert radians to degrees with math.degrees.",
  },
  {
    id: "la-027",
    title: "Outer Product",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the outer product of vectors a (length m) and b (length n).\n\nThe result is an m x n matrix C with C[i][j] = a[i] * b[j].",
    starterCode: `def outer_product(a, b):
    # Your code here
    pass`,
    solution: `def outer_product(a, b):
    return [[x * y for y in b] for x in a]`,
    testCases: [
      { input: [[1, 2], [3, 4]], expected: [[3, 4], [6, 8]] },
      { input: [[1, 0], [2, 3, 4]], expected: [[2, 3, 4], [0, 0, 0]] },
      { input: [[2, -1], [1, 1]], expected: [[2, 2], [-1, -1]] },
      { input: [[0, 5], [7, 8]], expected: [[0, 0], [35, 40]] },
    ],
    hint: "Every row of the result is a scaled copy of b.",
  },
  {
    id: "la-028",
    title: "Kronecker Product",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the Kronecker product of A (m x n) and B (p x q), producing an (m*p) x (n*q) matrix.\n\nBlock (i, j) of the result is A[i][j] * B, laid out in row-major order.",
    starterCode: `def kronecker_product(A, B):
    # Your code here
    pass`,
    solution: `def kronecker_product(A, B):
    m, n = len(A), len(A[0])
    p, q = len(B), len(B[0])
    return [
        [A[i // p][j // q] * B[i % p][j % q] for j in range(n * q)]
        for i in range(m * p)
    ]`,
    testCases: [
      {
        input: [[[1, 2], [3, 4]], [[0, 5], [6, 7]]],
        expected: [[0, 5, 0, 10], [6, 7, 12, 14], [0, 15, 0, 20], [18, 21, 24, 28]],
      },
      {
        input: [[[1, 0], [0, 1]], [[1, 2], [3, 4]]],
        expected: [[1, 2, 0, 0], [3, 4, 0, 0], [0, 0, 1, 2], [0, 0, 3, 4]],
      },
      { input: [[[2]], [[3]]], expected: [[6]] },
      { input: [[[1, 1]], [[2, 3]]], expected: [[2, 3, 2, 3]] },
    ],
    hint: "Scale each entry of A by the whole matrix B and tile the blocks.",
  },
  {
    id: "la-029",
    title: "Matrix Minor",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the minor of matrix A obtained by deleting row i and column j.\n\nA is square; the result is (n-1) x (n-1).",
    starterCode: `def matrix_minor(A, i, j):
    # Your code here
    pass`,
    solution: `def matrix_minor(A, i, j):
    return [
        [A[r][c] for c in range(len(A[0])) if c != j]
        for r in range(len(A))
        if r != i
    ]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0, 0], expected: [[5, 6], [8, 9]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1, 2], expected: [[1, 2], [7, 8]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2, 1], expected: [[1, 3], [4, 6]] },
      { input: [[[5, 6], [7, 8]], 0, 1], expected: [[7]] },
    ],
    hint: "Keep rows except i and columns except j.",
  },
  {
    id: "la-030",
    title: "Cofactor Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the 3x3 cofactor matrix C of a 3x3 matrix A.\n\nC[i][j] = (-1)^(i+j) * det(minor(A, i, j)), where the minor deletes row i and column j.",
    starterCode: `def cofactor_matrix(A):
    # Your code here
    pass`,
    solution: `def cofactor_matrix(A):
    n = len(A)
    def det2(M):
        return M[0][0] * M[1][1] - M[0][1] * M[1][0]
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            minor = [[A[r][c] for c in range(n) if c != j] for r in range(n) if r != i]
            C[i][j] = ((-1) ** (i + j)) * det2(minor)
    return C`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[-3, 6, -3], [6, -12, 6], [-3, 6, -3]],
      },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 4]]], expected: [[12, 0, 0], [0, 8, 0], [0, 0, 6]] },
      {
        input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]]],
        expected: [[-24, 20, -5], [18, -15, 4], [5, -4, 1]],
      },
    ],
    hint: "Signs alternate like a checkerboard starting with + at (0, 0).",
  },
  {
    id: "la-031",
    title: "Matrix Power",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Raise a square matrix A to the non-negative integer power k.\n\nA^0 is the identity matrix of the same size. Use repeated multiplication for A^k.",
    starterCode: `def matrix_power(A, k):
    # Your code here
    pass`,
    solution: `def matrix_power(A, k):
    n = len(A)
    R = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    for _ in range(k):
        R = [[sum(R[i][t] * A[t][j] for t in range(n)) for j in range(n)] for i in range(n)]
    return R`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 3], expected: [[8, 0], [0, 27]] },
      { input: [[[1, 1], [0, 1]], 5], expected: [[1, 5], [0, 1]] },
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 0], [0, 1]] },
      { input: [[[0, 1], [1, 0]], 2], expected: [[1, 0], [0, 1]] },
    ],
    hint: "Start from the identity and multiply by A k times.",
  },
  {
    id: "la-032",
    title: "Skew-Symmetric Matrix Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if matrix A is square and skew-symmetric: A[i][j] == -A[j][i] for all i, j.\n\nA skew-symmetric matrix must have zeros on its diagonal.",
    starterCode: `def is_skew_symmetric(A):
    # Your code here
    pass`,
    solution: `def is_skew_symmetric(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    return all(A[i][j] == -A[j][i] for i in range(n) for j in range(n))`,
    testCases: [
      { input: [[[0, 1], [-1, 0]]], expected: true },
      { input: [[[0, 2, -1], [-2, 0, 3], [1, -3, 0]]], expected: true },
      { input: [[[1, 2], [3, 4]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: true },
    ],
    hint: "The condition at (i, i) forces each diagonal entry to be 0.",
  },
  {
    id: "la-033",
    title: "Orthogonal Matrix Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if the square matrix A is orthogonal, meaning its columns form an orthonormal set:\n\nsum_k A[k][i] * A[k][j] = 1 if i == j else 0.\n\nUse a tolerance of 1e-9 when comparing.",
    starterCode: `def is_orthogonal_matrix(A):
    # Your code here
    pass`,
    solution: `def is_orthogonal_matrix(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    for i in range(n):
        for j in range(n):
            s = sum(A[k][i] * A[k][j] for k in range(n))
            target = 1.0 if i == j else 0.0
            if abs(s - target) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: true },
      { input: [[[0, -1], [1, 0]]], expected: true },
      { input: [[[1, 1], [0, 1]]], expected: false },
      { input: [[[0.6, 0.8], [-0.8, 0.6]]], expected: true },
    ],
    hint: "An orthogonal matrix satisfies A^T A = I.",
  },
  {
    id: "la-034",
    title: "2D Rotation Matrix Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Rotate a 2D vector v counterclockwise by theta degrees about the origin.\n\nUse x' = x*cos(t) - y*sin(t) and y' = x*sin(t) + y*cos(t), with t = radians(theta).",
    starterCode: `def rotate_2d(v, theta_degrees):
    # Your code here
    pass`,
    solution: `def rotate_2d(v, theta_degrees):
    import math
    t = math.radians(theta_degrees)
    c = math.cos(t)
    s = math.sin(t)
    x, y = v
    return [x * c - y * s, x * s + y * c]`,
    testCases: [
      { input: [[1, 0], 90], expected: [0.0, 1.0] },
      { input: [[1, 0], 180], expected: [-1.0, 0.0] },
      { input: [[2, 3], 0], expected: [2.0, 3.0] },
      { input: [[1, 1], 45], expected: [0.0, 1.414213562373095] },
    ],
    hint: "Remember to convert degrees to radians before calling sin/cos.",
  },
  {
    id: "la-035",
    title: "2D Reflection Matrix Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Reflect a 2D vector v across the line through the origin at angle theta degrees.\n\nThe reflection matrix is [[cos(2t), sin(2t)], [sin(2t), -cos(2t)]] with t = radians(theta).",
    starterCode: `def reflect_2d(v, theta_degrees):
    # Your code here
    pass`,
    solution: `def reflect_2d(v, theta_degrees):
    import math
    t = math.radians(theta_degrees)
    c = math.cos(2 * t)
    s = math.sin(2 * t)
    x, y = v
    return [c * x + s * y, s * x - c * y]`,
    testCases: [
      { input: [[1, 1], 90], expected: [-1.0, 1.0] },
      { input: [[1, 0], 0], expected: [1.0, 0.0] },
      { input: [[0, 2], 0], expected: [0.0, -2.0] },
      { input: [[1, 1], 45], expected: [1.0, 1.0] },
    ],
    hint: "theta = 0 reflects across the x-axis; theta = 45 swaps coordinates.",
  },
  {
    id: "la-036",
    title: "2D Shear Matrix Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply a horizontal shear with factor k to a 2D vector v.\n\nx' = x + k*y and y' = y. The shear matrix is [[1, k], [0, 1]].",
    starterCode: `def shear_2d(v, k):
    # Your code here
    pass`,
    solution: `def shear_2d(v, k):
    x, y = v
    return [x + k * y, y]`,
    testCases: [
      { input: [[1, 1], 2], expected: [3, 1] },
      { input: [[0, 5], 3], expected: [15, 5] },
      { input: [[2, 3], 0], expected: [2, 3] },
      { input: [[1, 2], -1], expected: [-1, 2] },
    ],
    hint: "Only the x coordinate changes; it shifts in proportion to y.",
  },
  {
    id: "la-037",
    title: "Homogeneous Translation Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 3x3 homogeneous translation matrix that shifts a 2D point by (tx, ty):\n\nT = [[1, 0, tx], [0, 1, ty], [0, 0, 1]]",
    starterCode: `def translation_matrix(tx, ty):
    # Your code here
    pass`,
    solution: `def translation_matrix(tx, ty):
    return [[1, 0, tx], [0, 1, ty], [0, 0, 1]]`,
    testCases: [
      { input: [2, 3], expected: [[1, 0, 2], [0, 1, 3], [0, 0, 1]] },
      { input: [0, 0], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      { input: [-1, 4], expected: [[1, 0, -1], [0, 1, 4], [0, 0, 1]] },
      { input: [1.5, -2.5], expected: [[1, 0, 1.5], [0, 1, -2.5], [0, 0, 1]] },
    ],
    hint: "The translation lives in the last column of the homogeneous matrix.",
  },
  {
    id: "la-038",
    title: "Matrix Rank via Row Reduction",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the rank of a matrix A: the number of nonzero pivots after Gaussian elimination.\n\nUse a tolerance of 1e-9 when deciding whether a pivot is nonzero.",
    starterCode: `def matrix_rank(A):
    # Your code here
    pass`,
    solution: `def matrix_rank(A):
    M = [row[:] for row in A]
    rows = len(M)
    cols = len(M[0]) if rows else 0
    rank = 0
    for col in range(cols):
        pivot = -1
        for r in range(rank, rows):
            if abs(M[r][col]) > 1e-9:
                pivot = r
                break
        if pivot == -1:
            continue
        M[rank], M[pivot] = M[pivot], M[rank]
        pv = M[rank][col]
        for r in range(rank + 1, rows):
            factor = M[r][col] / pv
            for c in range(col, cols):
                M[r][c] -= factor * M[rank][c]
        rank += 1
        if rank == rows:
            break
    return rank`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 2 },
      { input: [[[1, 2], [2, 4]]], expected: 1 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 2 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
    ],
    hint: "Eliminate entries below each pivot, then count the pivots.",
  },
  {
    id: "la-039",
    title: "Forward and Back Substitution Solve",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the system L*U*x = b, where L is unit lower triangular and U is upper triangular.\n\nFirst solve L*y = b by forward substitution, then solve U*x = y by back substitution. Return x as a list of floats.",
    starterCode: `def lu_solve(L, U, b):
    # Your code here
    pass`,
    solution: `def lu_solve(L, U, b):
    n = len(b)
    y = [0.0] * n
    for i in range(n):
        s = b[i] - sum(L[i][j] * y[j] for j in range(i))
        y[i] = s / L[i][i]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = y[i] - sum(U[i][j] * x[j] for j in range(i + 1, n))
        x[i] = s / U[i][i]
    return x`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[2, 1], [0, 4]], [5, 8]], expected: [1.5, 2.0] },
      { input: [[[2, 0], [1, 3]], [[1, 2], [0, 1]], [2, 7]], expected: [-3.0, 2.0] },
      {
        input: [
          [[1, 0, 0], [2, 1, 0], [3, 4, 1]],
          [[1, 2, 3], [0, 2, 1], [0, 0, 5]],
          [6, 15, 35],
        ],
        expected: [1.0, 1.0, 1.0],
      },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]], [3, -4]], expected: [3.0, -4.0] },
    ],
    hint: "Forward substitution uses only previously computed y values; back substitution mirrors it.",
  },
  {
    id: "la-040",
    title: "Eigenvector Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Determine whether vector v is an eigenvector of square matrix A.\n\nIf A*v = lambda*v for some scalar lambda, return lambda as a float. If v is the zero vector or not an eigenvector, return None.",
    starterCode: `def is_eigenvector(A, v):
    # Your code here
    pass`,
    solution: `def is_eigenvector(A, v):
    n = len(v)
    w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
    if all(abs(x) < 1e-12 for x in v):
        return None
    lam = None
    for i in range(n):
        if abs(v[i]) > 1e-12:
            lam = w[i] / v[i]
            break
    if lam is None:
        return None
    for i in range(n):
        if abs(w[i] - lam * v[i]) > 1e-9:
            return None
    return lam`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [1, 0]], expected: 2.0 },
      { input: [[[2, 0], [0, 3]], [1, 1]], expected: null },
      { input: [[[0, 1], [1, 0]], [1, 1]], expected: 1.0 },
      { input: [[[0, 1], [1, 0]], [1, -1]], expected: -1.0 },
    ],
    hint: "Pick a nonzero component of v to read off lambda, then verify every component.",
  },
  {
    id: "la-041",
    title: "Cramer's Rule 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the 2x2 linear system A*x = b using Cramer's rule.\n\nx = det(Ax) / det(A) and y = det(Ay) / det(A), where Ax replaces column 0 of A with b and Ay replaces column 1. Return [x, y] as floats, or None if det(A) == 0.",
    starterCode: `def cramer_2x2(A, b):
    # Your code here
    pass`,
    solution: `def cramer_2x2(A, b):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    det_x = b[0] * A[1][1] - A[0][1] * b[1]
    det_y = A[0][0] * b[1] - b[0] * A[1][0]
    return [det_x / det, det_y / det]`,
    testCases: [
      { input: [[[2, 1], [1, 3]], [5, 10]], expected: [1.0, 3.0] },
      { input: [[[1, 2], [3, 4]], [5, 11]], expected: [1.0, 2.0] },
      { input: [[[1, 2], [2, 4]], [3, 6]], expected: null },
      { input: [[[3, 0], [0, 2]], [6, 4]], expected: [2.0, 2.0] },
    ],
    hint: "Compute the three 2x2 determinants with the cross formula.",
  },
  {
    id: "la-042",
    title: "Condition Number via 1-Norms",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Estimate the condition number of A in the 1-norm, given A and its inverse A_inv.\n\ncond_1(A) = ||A||_1 * ||A_inv||_1, where the matrix 1-norm is the maximum absolute column sum.",
    starterCode: `def condition_number_1norm(A, A_inv):
    # Your code here
    pass`,
    solution: `def condition_number_1norm(A, A_inv):
    def norm1(M):
        return max(sum(abs(M[i][j]) for i in range(len(M))) for j in range(len(M[0])))
    return norm1(A) * norm1(A_inv)`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[0.5, 0], [0, 0.3333333333333333]]], expected: 1.5 },
      { input: [[[1, 1], [0, 1]], [[1, -1], [0, 1]]], expected: 4.0 },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: 1.0 },
      {
        input: [
          [[4, 1], [1, 3]],
          [[0.2727272727272727, -0.09090909090909091], [-0.09090909090909091, 0.36363636363636365]],
        ],
        expected: 2.272727272727273,
      },
    ],
    hint: "The 1-norm of the identity is 1, so the condition number of I is 1.",
  },
  {
    id: "la-043",
    title: "Adjugate Matrix 3x3",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the adjugate (classical adjoint) of a 3x3 matrix A.\n\nadj(A) is the transpose of the cofactor matrix: adj(A)[i][j] = cofactor C[j][i], where C[i][j] = (-1)^(i+j) * det(minor(A, i, j)).",
    starterCode: `def adjugate_3x3(A):
    # Your code here
    pass`,
    solution: `def adjugate_3x3(A):
    n = 3
    def det2(M):
        return M[0][0] * M[1][1] - M[0][1] * M[1][0]
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            minor = [[A[r][c] for c in range(n) if c != j] for r in range(n) if r != i]
            C[i][j] = ((-1) ** (i + j)) * det2(minor)
    return [[C[j][i] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      {
        input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]]],
        expected: [[-24, 18, 5], [20, -15, -4], [-5, 4, 1]],
      },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 4]]], expected: [[12, 0, 0], [0, 8, 0], [0, 0, 6]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[-3, 6, -3], [6, -12, 6], [-3, 6, -3]],
      },
    ],
    hint: "Build the cofactor matrix first, then transpose it.",
  },
  {
    id: "la-044",
    title: "Inverse 3x3 via Adjugate",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the inverse of a 3x3 matrix A using the adjugate formula:\n\ninv(A) = adj(A) / det(A)\n\nwhere det(A) is the cofactor expansion along the first row. Return None if det(A) == 0.",
    starterCode: `def inverse_3x3(A):
    # Your code here
    pass`,
    solution: `def inverse_3x3(A):
    n = 3
    def det2(M):
        return M[0][0] * M[1][1] - M[0][1] * M[1][0]
    cof = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            minor = [[A[r][c] for c in range(n) if c != j] for r in range(n) if r != i]
            cof[i][j] = ((-1) ** (i + j)) * det2(minor)
    det = sum(A[0][j] * cof[0][j] for j in range(n))
    if det == 0:
        return None
    adj = [[cof[j][i] for j in range(n)] for i in range(n)]
    return [[adj[i][j] / det for j in range(n)] for i in range(n)]`,
    testCases: [
      {
        input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]]],
        expected: [[-24.0, 18.0, 5.0], [20.0, -15.0, -4.0], [-5.0, 4.0, 1.0]],
      },
      {
        input: [[[2, 0, 0], [0, 3, 0], [0, 0, 4]]],
        expected: [[0.5, 0.0, 0.0], [0.0, 0.3333333333333333, 0.0], [0.0, 0.0, 0.25]],
      },
      {
        input: [[[1, 0, 1], [0, 1, 0], [-1, 0, 1]]],
        expected: [[0.5, 0.0, -0.5], [0.0, 1.0, 0.0], [0.5, 0.0, 0.5]],
      },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: null },
    ],
    hint: "det(A) equals the dot product of the first row of A with the first row of the cofactor matrix.",
  },
  {
    id: "la-045",
    title: "Reduced Row Echelon Form",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Transform matrix A into reduced row echelon form (RREF) using Gauss-Jordan elimination.\n\nEach pivot is normalized to 1 and is the only nonzero entry in its column. Treat entries smaller than 1e-12 as zero. Return the result as a matrix of floats.",
    starterCode: `def rref(A):
    # Your code here
    pass`,
    solution: `def rref(A):
    M = [[float(x) for x in row] for row in A]
    rows = len(M)
    cols = len(M[0]) if rows else 0
    lead = 0
    for r in range(rows):
        if lead >= cols:
            break
        i = r
        while abs(M[i][lead]) < 1e-12:
            i += 1
            if i == rows:
                i = r
                lead += 1
                if lead == cols:
                    return M
        M[i], M[r] = M[r], M[i]
        pv = M[r][lead]
        M[r] = [x / pv for x in M[r]]
        for i2 in range(rows):
            if i2 != r:
                factor = M[i2][lead]
                M[i2] = [x - factor * y for x, y in zip(M[i2], M[r])]
        lead += 1
    return M`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 2], [2, 4]]], expected: [[1.0, 2.0], [0.0, 0.0]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[1.0, 0.0, -1.0], [0.0, 1.0, 2.0], [0.0, 0.0, 0.0]],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Normalize the pivot row, then clear the pivot column in every other row.",
  },
  {
    id: "la-046",
    title: "Null Space Basis",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Find a basis for the null space of matrix A (vectors x with A*x = 0).\n\nCompute the RREF, then for each free column build a basis vector with a 1 in that free position and the negated RREF pivot entries elsewhere. Return the basis in free-column order; return [] if the null space is trivial.",
    starterCode: `def null_space_basis(A):
    # Your code here
    pass`,
    solution: `def null_space_basis(A):
    from fractions import Fraction
    M = [[Fraction(x) for x in row] for row in A]
    rows = len(M)
    cols = len(M[0]) if rows else 0
    pivots = []
    r = 0
    for c in range(cols):
        pivot = -1
        for i in range(r, rows):
            if M[i][c] != 0:
                pivot = i
                break
        if pivot == -1:
            continue
        M[r], M[pivot] = M[pivot], M[r]
        pv = M[r][c]
        M[r] = [x / pv for x in M[r]]
        for i in range(rows):
            if i != r and M[i][c] != 0:
                factor = M[i][c]
                M[i] = [x - factor * y for x, y in zip(M[i], M[r])]
        pivots.append(c)
        r += 1
        if r == rows:
            break
    free = [c for c in range(cols) if c not in pivots]
    basis = []
    for f in free:
        v = [Fraction(0)] * cols
        v[f] = Fraction(1)
        for ri, pc in enumerate(pivots):
            v[pc] = -M[ri][f]
        basis.append([float(x) for x in v])
    return basis`,
    testCases: [
      { input: [[[1, 2], [2, 4]]], expected: [[-2.0, 1.0]] },
      { input: [[[1, 1, 1], [2, 2, 2]]], expected: [[-1.0, 1.0, 0.0], [-1.0, 0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[1.0, -2.0, 1.0]] },
    ],
    hint: "Each free variable produces one basis vector; read its coordinates from the RREF.",
  },
  {
    id: "la-047",
    title: "LU Decomposition (Doolittle)",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Factor square matrix A as A = L*U using Doolittle's method without pivoting.\n\nL is unit lower triangular (ones on the diagonal) and U is upper triangular. Return [L, U] with entries as floats. You may assume no zero pivot is encountered.",
    starterCode: `def lu_decompose(A):
    # Your code here
    pass`,
    solution: `def lu_decompose(A):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    U = [[0.0] * n for _ in range(n)]
    for i in range(n):
        L[i][i] = 1.0
        for j in range(i, n):
            U[i][j] = A[i][j] - sum(L[i][k] * U[k][j] for k in range(i))
        for j in range(i + 1, n):
            L[j][i] = (A[j][i] - sum(L[j][k] * U[k][i] for k in range(i))) / U[i][i]
    return [L, U]`,
    testCases: [
      { input: [[[2, 1], [4, 3]]], expected: [[[1.0, 0.0], [2.0, 1.0]], [[2.0, 1.0], [0.0, 1.0]]] },
      { input: [[[4, 3], [6, 3]]], expected: [[[1.0, 0.0], [1.5, 1.0]], [[4.0, 3.0], [0.0, -1.5]]] },
      {
        input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [
          [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
          [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        ],
      },
      {
        input: [[[2, 1, 1], [4, 3, 3], [8, 7, 9]]],
        expected: [
          [[1.0, 0.0, 0.0], [2.0, 1.0, 0.0], [4.0, 3.0, 1.0]],
          [[2.0, 1.0, 1.0], [0.0, 1.0, 1.0], [0.0, 0.0, 2.0]],
        ],
      },
    ],
    hint: "Compute U[i][j] with the current row of L, then the multipliers L[j][i] below it.",
  },
  {
    id: "la-048",
    title: "Cholesky Decomposition",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the lower-triangular Cholesky factor L of a symmetric positive definite matrix A, so that A = L*L^T.\n\nUse L[i][j] = (A[i][j] - sum_k L[i][k]*L[j][k]) / L[j][j] for i > j, and the square root of the reduced diagonal for i == j.",
    starterCode: `def cholesky(A):
    # Your code here
    pass`,
    solution: `def cholesky(A):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            s = A[i][j] - sum(L[i][k] * L[j][k] for k in range(j))
            if i == j:
                L[i][j] = s ** 0.5
            else:
                L[i][j] = s / L[j][j]
    return L`,
    testCases: [
      { input: [[[4, 2], [2, 3]]], expected: [[2.0, 0.0], [1.0, 1.4142135623730951]] },
      {
        input: [[[25, 15, 5], [15, 18, 0], [5, 0, 11]]],
        expected: [[5.0, 0.0, 0.0], [3.0, 3.0, 0.0], [1.0, -1.0, 3.0]],
      },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[9, 0], [0, 16]]], expected: [[3.0, 0.0], [0.0, 4.0]] },
    ],
    hint: "The inner sum runs over columns k < j; divide by the diagonal entry L[j][j].",
  },
  {
    id: "la-049",
    title: "Gram-Schmidt Orthonormalization",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Orthonormalize a list of vectors with the Gram-Schmidt process.\n\nFor each vector, subtract its projection onto every previously accepted basis vector, then normalize if the remaining norm exceeds 1e-12. Vectors that reduce to the zero vector are skipped. Return the orthonormal basis as a list of vectors.",
    starterCode: `def gram_schmidt(vectors):
    # Your code here
    pass`,
    solution: `def gram_schmidt(vectors):
    basis = []
    for v in vectors:
        w = [float(x) for x in v]
        for b in basis:
            proj = sum(x * y for x, y in zip(w, b))
            w = [x - proj * y for x, y in zip(w, b)]
        norm = sum(x * x for x in w) ** 0.5
        if norm > 1e-12:
            basis.append([x / norm for x in w])
    return basis`,
    testCases: [
      {
        input: [[[1, 1], [1, 0]]],
        expected: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865477, -0.7071067811865474]],
      },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      {
        input: [[[1, 1, 0], [1, 0, 1]]],
        expected: [
          [0.7071067811865475, 0.7071067811865475, 0.0],
          [0.40824829046386313, -0.40824829046386296, 0.8164965809277261],
        ],
      },
      { input: [[[0, 0], [1, 1]]], expected: [[0.7071067811865475, 0.7071067811865475]] },
      { input: [[[1, 1], [2, 2]]], expected: [[0.7071067811865475, 0.7071067811865475]] },
    ],
    hint: "A dependent vector subtracts away completely and should not be appended.",
  },
  {
    id: "la-050",
    title: "Power Iteration Dominant Eigenvalue",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Estimate the dominant eigenvalue and eigenvector of matrix A with power iteration.\n\nStart from v = [1.0, ..., 1.0]. Each of the num_iterations iterations performs: w = A*v, lam = ||w||_2, v = w / lam. Return [lam, v] after the final iteration.",
    starterCode: `def power_iteration(A, num_iterations):
    # Your code here
    pass`,
    solution: `def power_iteration(A, num_iterations):
    n = len(A)
    v = [1.0] * n
    lam = 0.0
    for _ in range(num_iterations):
        w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
        lam = sum(x * x for x in w) ** 0.5
        v = [x / lam for x in w]
    return [lam, v]`,
    testCases: [
      {
        input: [[[2, 0], [0, 1]], 10],
        expected: [1.9999971389859181, [0.9999995231631829, 0.0009765620343390458]],
      },
      {
        input: [[[4, 2], [1, 3]], 5],
        expected: [5.0075749527374835, [0.8930477200189154, 0.4499619648026008]],
      },
      { input: [[[3]], 4], expected: [3.0, [1.0]] },
      {
        input: [[[5, 0, 0], [0, 2, 1], [0, 1, 2]], 8],
        expected: [4.997495643621757, [0.999718008333068, 0.016791423622843537, 0.016791423622843537]],
      },
    ],
    hint: "The norm of w is the current eigenvalue estimate, so reuse it to normalize.",
  },
];
