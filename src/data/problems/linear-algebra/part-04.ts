import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-096",
    title: "Eigenvalues of Triangular Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the eigenvalues of a square triangular matrix A (upper or lower triangular).\n\nThe eigenvalues are exactly the diagonal entries, returned in order as a list.",
    starterCode: `def triangular_eigenvalues(A):
    # Your code here
    pass`,
    solution: `def triangular_eigenvalues(A):
    return [A[i][i] for i in range(len(A))]`,
    testCases: [
      { input: [[[2, 5, 7], [0, 3, 9], [0, 0, 4]]], expected: [2, 3, 4] },
      { input: [[[1, 0, 0], [2, 3, 0], [4, 5, 6]]], expected: [1, 3, 6] },
      { input: [[[5, 0], [0, 7]]], expected: [5, 7] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [1, 1, 1] },
    ],
    hint: "The characteristic polynomial of a triangular matrix is the product of (lambda - A[i][i]).",
  },
  {
    id: "la-097",
    title: "Nuclear Norm from Singular Values",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the nuclear norm (trace norm) of a matrix from its singular values:\n\n||A||_* = sum(sigma_i)\n\nThe input is a list of non-negative singular values.",
    starterCode: `def nuclear_norm(singular_values):
    # Your code here
    pass`,
    solution: `def nuclear_norm(singular_values):
    return float(sum(singular_values))`,
    testCases: [
      { input: [[3, 0, 0]], expected: 3.0 },
      { input: [[5, 3, 1]], expected: 9.0 },
      { input: [[2.5, 1.5]], expected: 4.0 },
      { input: [[0, 0]], expected: 0.0 },
    ],
    hint: "The nuclear norm is the L1 norm of the singular value vector.",
  },
  {
    id: "la-098",
    title: "Strict Diagonal Dominance Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if matrix A is strictly diagonally dominant: in every row, the absolute diagonal entry is greater than the sum of the absolute off-diagonal entries.\n\nReturn False if A is not square or any row fails the test.",
    starterCode: `def is_diagonally_dominant(A):
    # Your code here
    pass`,
    solution: `def is_diagonally_dominant(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    for i in range(n):
        diag = abs(A[i][i])
        off = sum(abs(A[i][j]) for j in range(n) if j != i)
        if diag <= off:
            return False
    return True`,
    testCases: [
      { input: [[[2, 1], [1, 2]]], expected: true },
      { input: [[[1, 2], [3, 4]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: false },
      { input: [[[5, 1, -1], [0, 3, 1], [1, 0, 4]]], expected: true },
    ],
    hint: "The inequality must be strict in every row; zero rows always fail.",
  },
  {
    id: "la-099",
    title: "Cauchy-Schwarz Gap",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the non-negative gap in the Cauchy-Schwarz inequality:\n\ngap = ||a||_2 * ||b||_2 - |a . b|\n\nA gap of 0 means the vectors are linearly dependent (parallel).",
    starterCode: `def cauchy_schwarz_gap(a, b):
    # Your code here
    pass`,
    solution: `def cauchy_schwarz_gap(a, b):
    dot = abs(sum(x * y for x, y in zip(a, b)))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    return na * nb - dot`,
    testCases: [
      { input: [[3, 4], [6, 8]], expected: 0.0 },
      { input: [[1, 0], [0, 1]], expected: 1.0 },
      { input: [[1, 2], [2, 1]], expected: 1.0 },
      { input: [[0, 0], [1, 2]], expected: 0.0 },
    ],
    hint: "The gap is zero exactly when one vector is a scalar multiple of the other.",
  },
  {
    id: "la-100",
    title: "Frobenius Inner Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the Frobenius inner product of two matrices of the same shape:\n\n<A, B> = sum_ij A[i][j] * B[i][j]",
    starterCode: `def frobenius_inner_product(A, B):
    # Your code here
    pass`,
    solution: `def frobenius_inner_product(A, B):
    return sum(A[i][j] * B[i][j] for i in range(len(A)) for j in range(len(A[0])))`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: 70 },
      { input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]]], expected: 5 },
      { input: [[[1, -1]], [[2, 3]]], expected: -1 },
      { input: [[[0]], [[5]]], expected: 0 },
    ],
    hint: "This is the dot product after flattening both matrices.",
  },
  {
    id: "la-101",
    title: "Matrix Max Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the entrywise max norm of matrix A: the largest absolute entry.\n\n||A||_max = max_ij |A[i][j]|",
    starterCode: `def matrix_max_norm(A):
    # Your code here
    pass`,
    solution: `def matrix_max_norm(A):
    return max(abs(x) for row in A for x in row)`,
    testCases: [
      { input: [[[1, -7], [3, 2]]], expected: 7 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1.5, -2.5]]], expected: 2.5 },
      { input: [[[-4]]], expected: 4 },
    ],
    hint: "Flatten the matrix in your mind and take the largest absolute value.",
  },
  {
    id: "la-102",
    title: "Matrix Infinity Norm",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the induced matrix infinity norm: the maximum over rows of the sum of absolute entries in that row.\n\n||A||_inf = max_i sum_j |A[i][j]|",
    starterCode: `def matrix_inf_norm(A):
    # Your code here
    pass`,
    solution: `def matrix_inf_norm(A):
    return max(sum(abs(x) for x in row) for row in A)`,
    testCases: [
      { input: [[[1, -2], [3, -4]]], expected: 7 },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: 15 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[-1.5, 2.0]]], expected: 3.5 },
    ],
    hint: "Sum across each row, then take the largest row total.",
  },
  {
    id: "la-103",
    title: "Diagonal Matrix from Vector",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the n x n diagonal matrix whose diagonal is the vector v.\n\nReturn D with D[i][j] = v[i] if i == j and 0 otherwise.",
    starterCode: `def diag_matrix(v):
    # Your code here
    pass`,
    solution: `def diag_matrix(v):
    n = len(v)
    return [[v[i] if i == j else 0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [[1, 0, 0], [0, 2, 0], [0, 0, 3]] },
      { input: [[5]], expected: [[5]] },
      { input: [[0, 0]], expected: [[0, 0], [0, 0]] },
      { input: [[1.5, -2.5]], expected: [[1.5, 0], [0, -2.5]] },
    ],
    hint: "This is the inverse operation of extracting the main diagonal.",
  },
  {
    id: "la-104",
    title: "Anti-Diagonal Extraction",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the anti-diagonal of a square matrix A: the entries from the top-right corner to the bottom-left.\n\nd[k] = A[k][n - 1 - k] for k = 0, ..., n - 1.",
    starterCode: `def anti_diagonal(A):
    # Your code here
    pass`,
    solution: `def anti_diagonal(A):
    n = len(A)
    return [A[i][n - 1 - i] for i in range(n)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [2, 3] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [3, 5, 7] },
      { input: [[[5]]], expected: [5] },
      {
        input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]],
        expected: [4, 7, 10, 13],
      },
    ],
    hint: "As the row index increases, the column index decreases.",
  },
  {
    id: "la-105",
    title: "Row Sums",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the vector of row sums of matrix A: entry i of the result is the sum of row i.",
    starterCode: `def row_sums(A):
    # Your code here
    pass`,
    solution: `def row_sums(A):
    return [sum(row) for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [3, 7] },
      { input: [[[1, -1], [0, 0]]], expected: [0, 0] },
      { input: [[[1, 2, 3]]], expected: [6] },
      { input: [[[1.5, 2.5], [0.5, -1.5]]], expected: [4.0, -1.0] },
    ],
    hint: "A row sum is a dot product with the all-ones vector.",
  },
  {
    id: "la-106",
    title: "Normalize Matrix Rows",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Normalize every row of matrix A to unit L2 length.\n\nIf a row is the zero vector, leave it as zeros. Return a list of rows of floats.",
    starterCode: `def normalize_rows(A):
    # Your code here
    pass`,
    solution: `def normalize_rows(A):
    out = []
    for row in A:
        norm = sum(x * x for x in row) ** 0.5
        if norm == 0:
            out.append([0.0 for _ in row])
        else:
            out.append([x / norm for x in row])
    return out`,
    testCases: [
      { input: [[[3, 4], [0, 0]]], expected: [[0.6, 0.8], [0.0, 0.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 1]]], expected: [[0.7071067811865475, 0.7071067811865475]] },
      { input: [[[0, 0], [5, 0]]], expected: [[0.0, 0.0], [1.0, 0.0]] },
    ],
    hint: "Treat each row as an independent vector and reuse the L2 norm formula.",
  },
  {
    id: "la-107",
    title: "Flatten Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Flatten matrix A into a single list in row-major order.\n\nRows are concatenated from top to bottom, and entries within a row from left to right.",
    starterCode: `def flatten_matrix(A):
    # Your code here
    pass`,
    solution: `def flatten_matrix(A):
    return [x for row in A for x in row]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
      { input: [[[1, 2, 3]]], expected: [1, 2, 3] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[5]]], expected: [5] },
    ],
    hint: "A double comprehension over rows and then entries gives row-major order.",
  },
  {
    id: "la-108",
    title: "Swap Matrix Rows",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return a copy of matrix A with rows i and j swapped.\n\nIf i == j, return the matrix unchanged.",
    starterCode: `def swap_rows(A, i, j):
    # Your code here
    pass`,
    solution: `def swap_rows(A, i, j):
    M = [row[:] for row in A]
    M[i], M[j] = M[j], M[i]
    return M`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 0, 1], expected: [[3, 4], [1, 2]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0, 2], expected: [[7, 8, 9], [4, 5, 6], [1, 2, 3]] },
      { input: [[[1, 2], [3, 4]], 1, 1], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2], [3, 4]], 1, 0], expected: [[3, 4], [1, 2]] },
    ],
    hint: "Copy first so the input matrix is not mutated.",
  },
  {
    id: "la-109",
    title: "Flip Matrix Vertically",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return matrix A with its rows reversed (flip upside down), also known as flipud.\n\nThe first row becomes the last and vice versa.",
    starterCode: `def flip_vertical(A):
    # Your code here
    pass`,
    solution: `def flip_vertical(A):
    return [row[:] for row in A[::-1]]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[3, 4], [1, 2]] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 8, 9], [4, 5, 6], [1, 2, 3]] },
      { input: [[[1]]], expected: [[1]] },
      { input: [[[1, 2, 3]]], expected: [[1, 2, 3]] },
    ],
    hint: "Reverse the order of the rows without touching entries inside rows.",
  },
  {
    id: "la-110",
    title: "Span Membership 2D",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if vector w lies in the span of vector v in R^2, meaning w is a scalar multiple of v.\n\nHandle the zero vector: if v is [0, 0], the only member of its span is w = [0, 0].",
    starterCode: `def is_scalar_multiple_2d(v, w):
    # Your code here
    pass`,
    solution: `def is_scalar_multiple_2d(v, w):
    if v[0] == 0 and v[1] == 0:
        return w[0] == 0 and w[1] == 0
    return v[0] * w[1] - v[1] * w[0] == 0`,
    testCases: [
      { input: [[1, 2], [2, 4]], expected: true },
      { input: [[1, 2], [2, 3]], expected: false },
      { input: [[0, 0], [0, 0]], expected: true },
      { input: [[0, 0], [1, 1]], expected: false },
    ],
    hint: "Two 2D vectors are parallel exactly when their cross product is zero.",
  },
  {
    id: "la-111",
    title: "Permanent 2x2",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the permanent of a 2x2 matrix: like the determinant but with all signs positive.\n\nperm(A) = A[0][0]*A[1][1] + A[0][1]*A[1][0]",
    starterCode: `def permanent_2x2(A):
    # Your code here
    pass`,
    solution: `def permanent_2x2(A):
    return A[0][0] * A[1][1] + A[0][1] * A[1][0]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 10 },
      { input: [[[2, 0], [0, 3]]], expected: 6 },
      { input: [[[1, -1], [2, 3]]], expected: 1 },
      { input: [[[0, 1], [0, 0]]], expected: 0 },
    ],
    hint: "Only the sign of the second term differs from the determinant.",
  },
  {
    id: "la-112",
    title: "Similarity Transform",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the similarity transform B = inv(P) * A * P to a 2x2 matrix A.\n\nSimilar matrices share the same eigenvalues. Return None if P is singular.",
    starterCode: `def similarity_transform(A, P):
    # Your code here
    pass`,
    solution: `def similarity_transform(A, P):
    det = P[0][0] * P[1][1] - P[0][1] * P[1][0]
    if det == 0:
        return None
    inv = [[P[1][1] / det, -P[0][1] / det], [-P[1][0] / det, P[0][0] / det]]
    AP = [[sum(A[i][k] * P[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    return [[sum(inv[i][k] * AP[k][j] for k in range(2)) for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[1, 0], [0, 1]]], expected: [[2.0, 0.0], [0.0, 3.0]] },
      { input: [[[1, 2], [3, 4]], [[2, 0], [0, 1]]], expected: [[1.0, 1.0], [6.0, 4.0]] },
      { input: [[[4, 1], [2, 3]], [[1, 1], [1, -2]]], expected: [[5.0, 0.0], [0.0, 2.0]] },
      { input: [[[1, 2], [2, 4]], [[1, 1], [1, 1]]], expected: null },
    ],
    hint: "If P diagonalizes A, the transformed matrix becomes diagonal.",
  },
  {
    id: "la-113",
    title: "Jacobi Iteration One Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one Jacobi iteration step for the system A*x = b from the current guess x0:\n\nx_new[i] = (b[i] - sum over j != i of A[i][j] * x0[j]) / A[i][i]\n\nAssume all diagonal entries are nonzero. Return the updated vector as floats.",
    starterCode: `def jacobi_step(A, b, x0):
    # Your code here
    pass`,
    solution: `def jacobi_step(A, b, x0):
    n = len(b)
    return [(b[i] - sum(A[i][j] * x0[j] for j in range(n) if j != i)) / A[i][i] for i in range(n)]`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0]], expected: [0.25, 0.6666666666666666] },
      { input: [[[2, 0], [0, 4]], [4, 8], [0, 0]], expected: [2.0, 2.0] },
      { input: [[[4, 1], [1, 3]], [1, 2], [1, 1]], expected: [0.0, 0.3333333333333333] },
      { input: [[[3, -1], [-1, 2]], [5, 3], [0, 0]], expected: [1.6666666666666667, 1.5] },
    ],
    hint: "Every component is updated using only the old vector x0.",
  },
  {
    id: "la-114",
    title: "Gauss-Seidel Iteration One Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one Gauss-Seidel iteration step for A*x = b from the guess x0, updating in place:\n\nx_new[i] = (b[i] - sum over j != i of A[i][j] * x[j]) / A[i][i]\n\nAlready updated components are used immediately. Assume nonzero diagonal.",
    starterCode: `def gauss_seidel_step(A, b, x0):
    # Your code here
    pass`,
    solution: `def gauss_seidel_step(A, b, x0):
    n = len(b)
    x = list(x0)
    for i in range(n):
        s = sum(A[i][j] * x[j] for j in range(n) if j != i)
        x[i] = (b[i] - s) / A[i][i]
    return x`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0]], expected: [0.25, 0.5833333333333334] },
      { input: [[[2, 0], [0, 4]], [4, 8], [0, 0]], expected: [2.0, 2.0] },
      { input: [[[3, -1], [-1, 2]], [5, 3], [0, 0]], expected: [1.6666666666666667, 2.3333333333333335] },
      { input: [[[4, 1], [1, 3]], [1, 2], [1, 1]], expected: [0.0, 0.6666666666666666] },
    ],
    hint: "Unlike Jacobi, the first updated entry is immediately used by later rows.",
  },
  {
    id: "la-115",
    title: "Nilpotent Matrix Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if A is nilpotent, meaning some power of A is the zero matrix.\n\nFor an n x n matrix it is enough to check A^n, within a tolerance of 1e-9. Otherwise return False.",
    starterCode: `def is_nilpotent(A):
    # Your code here
    pass`,
    solution: `def is_nilpotent(A):
    n = len(A)
    M = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    for _ in range(n):
        M = [[sum(M[i][k] * A[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
    return all(abs(x) < 1e-9 for row in M for x in row)`,
    testCases: [
      { input: [[[0, 1], [0, 0]]], expected: true },
      { input: [[[0, 1, 0], [0, 0, 1], [0, 0, 0]]], expected: true },
      { input: [[[1, 0], [0, 0]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: true },
    ],
    hint: "Nilpotency index is at most n; the zero matrix is trivially nilpotent.",
  },
  {
    id: "la-116",
    title: "Positive Definite via Leading Minors",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if A is symmetric positive definite using Sylvester's criterion: A must be symmetric and every leading principal minor must be positive (greater than 1e-9).\n\nOtherwise return False.",
    starterCode: `def is_positive_definite(A):
    # Your code here
    pass`,
    solution: `def is_positive_definite(A):
    n = len(A)
    for i in range(n):
        for j in range(n):
            if abs(A[i][j] - A[j][i]) > 1e-9:
                return False
    def det(M):
        m = len(M)
        if m == 1:
            return M[0][0]
        total = 0
        for j in range(m):
            minor = [[M[r][c] for c in range(m) if c != j] for r in range(1, m)]
            total += ((-1) ** j) * M[0][j] * det(minor)
        return total
    for k in range(1, n + 1):
        if det([A[i][:k] for i in range(k)]) <= 1e-9:
            return False
    return True`,
    testCases: [
      { input: [[[2, 0], [0, 3]]], expected: true },
      { input: [[[2, 1], [1, 2]]], expected: true },
      { input: [[[1, 2], [2, 1]]], expected: false },
      { input: [[[1, 0], [0, -1]]], expected: false },
    ],
    hint: "Sylvester's criterion requires all leading principal minors to be positive, not just the determinant.",
  },
  {
    id: "la-117",
    title: "Rayleigh Quotient",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the Rayleigh quotient of matrix A with respect to nonzero vector v:\n\nR(A, v) = (v . (A*v)) / (v . v)\n\nReturn None if v is the zero vector.",
    starterCode: `def rayleigh_quotient(A, v):
    # Your code here
    pass`,
    solution: `def rayleigh_quotient(A, v):
    vv = sum(x * x for x in v)
    if vv == 0:
        return None
    Av = [sum(A[i][j] * v[j] for j in range(len(v))) for i in range(len(A))]
    return sum(v[i] * Av[i] for i in range(len(v))) / vv`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [1, 0]], expected: 2.0 },
      { input: [[[2, 0], [0, 3]], [1, 1]], expected: 2.5 },
      { input: [[[4, 1], [2, 3]], [1, 1]], expected: 5.0 },
      { input: [[[1, 0], [0, 1]], [0, 0]], expected: null },
    ],
    hint: "For an eigenvector the Rayleigh quotient equals its eigenvalue.",
  },
  {
    id: "la-118",
    title: "Characteristic Polynomial 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the coefficients [1.0, b, c] of the characteristic polynomial of a 2x2 matrix A:\n\nlambda^2 - trace(A)*lambda + det(A)\n\nSo b = -trace(A) and c = det(A).",
    starterCode: `def char_poly_2x2(A):
    # Your code here
    pass`,
    solution: `def char_poly_2x2(A):
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    return [1.0, -float(tr), float(det)]`,
    testCases: [
      { input: [[[2, 0], [0, 3]]], expected: [1.0, -5.0, 6.0] },
      { input: [[[4, 1], [2, 3]]], expected: [1.0, -7.0, 10.0] },
      { input: [[[0, 1], [-2, -3]]], expected: [1.0, 3.0, 2.0] },
      { input: [[[1, 1], [-1, 1]]], expected: [1.0, -2.0, 2.0] },
    ],
    hint: "The leading coefficient of a monic characteristic polynomial is always 1.",
  },
  {
    id: "la-119",
    title: "k-th Diagonal Extraction",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Extract the k-th diagonal of a square matrix A.\n\nk = 0 is the main diagonal, k > 0 is above it (entries A[i][i + k]), and k < 0 is below it (entries A[i][i + k]). Return the entries in order.",
    starterCode: `def diagonal_k(A, k):
    # Your code here
    pass`,
    solution: `def diagonal_k(A, k):
    n = len(A)
    out = []
    for i in range(n):
        j = i + k
        if 0 <= j < n:
            out.append(A[i][j])
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1], expected: [2, 6] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], -1], expected: [4, 8] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2], expected: [3] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0], expected: [1, 5, 9] },
    ],
    hint: "Slide the diagonal by k columns; only indices inside the matrix count.",
  },
  {
    id: "la-120",
    title: "Toeplitz Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build a Toeplitz matrix from its first row and first column. A Toeplitz matrix is constant along each diagonal.\n\nSet T[i][j] = first_row[j - i] when j >= i, and T[i][j] = first_col[i - j] otherwise. Assume first_row[0] == first_col[0].",
    starterCode: `def toeplitz_matrix(first_row, first_col):
    # Your code here
    pass`,
    solution: `def toeplitz_matrix(first_row, first_col):
    rows = len(first_col)
    cols = len(first_row)
    return [
        [first_row[j - i] if j >= i else first_col[i - j] for j in range(cols)]
        for i in range(rows)
    ]`,
    testCases: [
      { input: [[1, 2, 3], [1, 4, 5]], expected: [[1, 2, 3], [4, 1, 2], [5, 4, 1]] },
      { input: [[1, 2], [1, 3]], expected: [[1, 2], [3, 1]] },
      { input: [[7], [7]], expected: [[7]] },
      { input: [[1, 2, 3], [1, 2, 3]], expected: [[1, 2, 3], [2, 1, 2], [3, 2, 1]] },
    ],
    hint: "The first row fills diagonals going up-right; the first column fills diagonals going down-left.",
  },
  {
    id: "la-121",
    title: "Vandermonde Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the Vandermonde matrix of the values x with n columns:\n\nV[i][j] = x[i]^j for j = 0, ..., n - 1.\n\nThe first column is all ones, and each row is a geometric progression.",
    starterCode: `def vandermonde_matrix(x, n):
    # Your code here
    pass`,
    solution: `def vandermonde_matrix(x, n):
    return [[x[i] ** j for j in range(n)] for i in range(len(x))]`,
    testCases: [
      { input: [[1, 2, 3], 3], expected: [[1, 1, 1], [1, 2, 4], [1, 3, 9]] },
      { input: [[0, 1], 2], expected: [[1, 0], [1, 1]] },
      { input: [[2], 4], expected: [[1, 2, 4, 8]] },
      { input: [[-1, 0, 1], 3], expected: [[1, -1, 1], [1, 0, 0], [1, 1, 1]] },
    ],
    hint: "Vandermonde matrices appear when fitting polynomials to data points.",
  },
  {
    id: "la-122",
    title: "Circulant Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the circulant matrix whose first row is the vector v.\n\nEach subsequent row is the previous row shifted right by one, wrapping around: C[i][j] = v[(j - i) % n].",
    starterCode: `def circulant_matrix(v):
    # Your code here
    pass`,
    solution: `def circulant_matrix(v):
    n = len(v)
    return [[v[(j - i) % n] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[1, 2, 3]], expected: [[1, 2, 3], [3, 1, 2], [2, 3, 1]] },
      { input: [[1, 0]], expected: [[1, 0], [0, 1]] },
      { input: [[5]], expected: [[5]] },
      { input: [[1, 2, 3, 4]], expected: [[1, 2, 3, 4], [4, 1, 2, 3], [3, 4, 1, 2], [2, 3, 4, 1]] },
    ],
    hint: "The matrix is uniquely determined by its first row because each diagonal is constant.",
  },
  {
    id: "la-123",
    title: "Companion Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the companion matrix of a monic polynomial from coefficients coeffs = [c0, c1, ..., c_{n-1}], representing x^n + c_{n-1}*x^(n-1) + ... + c0.\n\nThe last column is [-c0, -c1, ..., -c_{n-1}] and the subdiagonal is 1. The eigenvalues are the polynomial roots.",
    starterCode: `def companion_matrix(coeffs):
    # Your code here
    pass`,
    solution: `def companion_matrix(coeffs):
    n = len(coeffs)
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        C[i][n - 1] = -coeffs[i]
    for i in range(1, n):
        C[i][i - 1] = 1
    return C`,
    testCases: [
      { input: [[2, 1]], expected: [[0, -2], [1, -1]] },
      { input: [[0, 0, 1]], expected: [[0, 0, 0], [1, 0, 0], [0, 1, -1]] },
      { input: [[1]], expected: [[-1]] },
      { input: [[-2, 0, 1]], expected: [[0, 0, 2], [1, 0, 0], [0, 1, -1]] },
    ],
    hint: "Put the negated coefficients in the last column and ones directly below the diagonal.",
  },
  {
    id: "la-124",
    title: "Solve XA = B",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the matrix equation X*A = B for the 2x2 matrix X, where A is invertible.\n\nReturn X = B * inv(A) as a matrix of floats, or None if det(A) == 0.",
    starterCode: `def solve_xa(A, B):
    # Your code here
    pass`,
    solution: `def solve_xa(A, B):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
    return [[sum(B[i][k] * inv[k][j] for k in range(2)) for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 2], [3, 4]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[2, 0], [0, 3]], [[2, 6], [6, 12]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]]], expected: [[-2.0, 1.0], [1.5, -0.5]] },
      { input: [[[1, 2], [2, 4]], [[1, 1], [1, 1]]], expected: null },
    ],
    hint: "Multiply on the right by the inverse of A, not the left.",
  },
  {
    id: "la-125",
    title: "Ridge Regression Solve",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the ridge regression normal equations for design matrix A (n x 2) and response b (length n):\n\n(A^T A + lam*I) x = A^T b\n\nReturn the coefficients [x0, x1]. lam = 0 reduces to ordinary least squares.",
    starterCode: `def ridge_regression(A, b, lam):
    # Your code here
    pass`,
    solution: `def ridge_regression(A, b, lam):
    n = len(A)
    G = [
        [sum(A[k][i] * A[k][j] for k in range(n)) + (lam if i == j else 0) for j in range(2)]
        for i in range(2)
    ]
    rhs = [sum(A[k][i] * b[k] for k in range(n)) for i in range(2)]
    det = G[0][0] * G[1][1] - G[0][1] * G[1][0]
    return [
        (G[1][1] * rhs[0] - G[0][1] * rhs[1]) / det,
        (-G[1][0] * rhs[0] + G[0][0] * rhs[1]) / det,
    ]`,
    testCases: [
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3], 0], expected: [0.0, 1.0] },
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3], 1], expected: [0.25, 0.8333333333333334] },
      { input: [[[1, 0], [0, 1]], [3, 4], 0], expected: [3.0, 4.0] },
      { input: [[[1, 0], [1, 0]], [1, 3], 1], expected: [1.3333333333333333, 0.0] },
    ],
    hint: "The ridge penalty adds lam to the diagonal of the Gram matrix A^T A.",
  },
  {
    id: "la-126",
    title: "Pseudoinverse of Outer Product",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the Moore-Penrose pseudoinverse of the rank-1 outer product A = a*b^T, where a has length m and b has length n.\n\nUsing the formula inv(A^T A) A^T, the pseudoinverse reduces to the n x m matrix (b*a^T) / (||a||^2 * ||b||^2). Return an n x m zero matrix if a or b is the zero vector.",
    starterCode: `def pinv_outer_product(a, b):
    # Your code here
    pass`,
    solution: `def pinv_outer_product(a, b):
    na = sum(x * x for x in a)
    nb = sum(x * x for x in b)
    if na == 0 or nb == 0:
        return [[0.0 for _ in a] for _ in b]
    return [[b[i] * a[j] / (na * nb) for j in range(len(a))] for i in range(len(b))]`,
    testCases: [
      { input: [[1, 0], [1, 1]], expected: [[0.5, 0.0], [0.5, 0.0]] },
      { input: [[2, 0], [1, 0]], expected: [[0.5, 0.0], [0.0, 0.0]] },
      { input: [[1, 1], [1, 1]], expected: [[0.25, 0.25], [0.25, 0.25]] },
      { input: [[0, 0], [1, 1]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "For a rank-1 matrix, the pseudoinverse is another scaled outer product.",
  },
  {
    id: "la-127",
    title: "Determinant by Expansion along a Row",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the determinant of a square matrix A by cofactor expansion along the given row index:\n\ndet(A) = sum_j (-1)^(row + j) * A[row][j] * det(minor(row, j))\n\nUse recursive expansion of the minors.",
    starterCode: `def det_expand_row(A, row):
    # Your code here
    pass`,
    solution: `def det_expand_row(A, row):
    n = len(A)
    if n == 1:
        return A[0][0]
    total = 0
    for j in range(n):
        minor = [[A[r][c] for c in range(n) if c != j] for r in range(n) if r != row]
        total += ((-1) ** (row + j)) * A[row][j] * det_expand_row(minor, 0)
    return total`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 0], expected: -2 },
      { input: [[[1, 2], [3, 4]], 1], expected: -2 },
      { input: [[[2, 1, 3], [0, 4, 5], [1, 0, 6]], 0], expected: 41 },
      { input: [[[2, 1, 3], [0, 4, 5], [1, 0, 6]], 2], expected: 41 },
    ],
    hint: "The answer is the same for every row; only the amount of arithmetic changes.",
  },
  {
    id: "la-128",
    title: "Diagonalizability via Distinct Eigenvalues",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Decide whether a 2x2 matrix A is diagonalizable over the reals.\n\nIf the eigenvalues are real and distinct (discriminant > 1e-9), return True. If the eigenvalue is repeated, A is diagonalizable only when A is that scalar multiple of the identity. Otherwise return False.",
    starterCode: `def is_diagonalizable_2x2(A):
    # Your code here
    pass`,
    solution: `def is_diagonalizable_2x2(A):
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    disc = tr * tr - 4 * det
    if disc > 1e-9:
        return True
    lam = tr / 2
    return (
        abs(A[0][0] - lam) <= 1e-9
        and abs(A[1][1] - lam) <= 1e-9
        and abs(A[0][1]) <= 1e-9
        and abs(A[1][0]) <= 1e-9
    )`,
    testCases: [
      { input: [[[2, 0], [0, 3]]], expected: true },
      { input: [[[1, 1], [0, 1]]], expected: false },
      { input: [[[2, 0], [0, 2]]], expected: true },
      { input: [[[1, 1], [-1, 1]]], expected: false },
    ],
    hint: "A repeated eigenvalue needs a full set of two independent eigenvectors.",
  },
  {
    id: "la-129",
    title: "Change of Basis Coordinates",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Express vector v in the basis formed by the two vectors in basis = [b1, b2].\n\nReturn coordinates [c1, c2] such that v = c1*b1 + c2*b2. Return None if the basis vectors are linearly dependent.",
    starterCode: `def change_of_basis(basis, v):
    # Your code here
    pass`,
    solution: `def change_of_basis(basis, v):
    b1, b2 = basis
    det = b1[0] * b2[1] - b2[0] * b1[1]
    if det == 0:
        return None
    c1 = (v[0] * b2[1] - b2[0] * v[1]) / det
    c2 = (b1[0] * v[1] - v[0] * b1[1]) / det
    return [c1, c2]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [3, 4]], expected: [3.0, 4.0] },
      { input: [[[1, 1], [1, -1]], [2, 0]], expected: [1.0, 1.0] },
      { input: [[[2, 0], [0, 3]], [4, 9]], expected: [2.0, 3.0] },
      { input: [[[1, 1], [2, 2]], [1, 1]], expected: null },
    ],
    hint: "Solve the 2x2 system whose columns are the basis vectors using the cross formula.",
  },
  {
    id: "la-130",
    title: "Cosine Similarity Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Given a matrix X whose rows are vectors, return the Gram-style cosine similarity matrix:\n\nS[i][j] = (X[i] . X[j]) / (||X[i]||_2 * ||X[j]||_2)\n\nIf either row is the zero vector, set the corresponding entry to 0.0.",
    starterCode: `def cosine_similarity_matrix(X):
    # Your code here
    pass`,
    solution: `def cosine_similarity_matrix(X):
    n = len(X)
    S = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            dot = sum(a * b for a, b in zip(X[i], X[j]))
            ni = sum(a * a for a in X[i]) ** 0.5
            nj = sum(b * b for b in X[j]) ** 0.5
            if ni == 0 or nj == 0:
                S[i][j] = 0.0
            else:
                S[i][j] = dot / (ni * nj)
    return S`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [1, 0]]], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[[1, 1], [1, -1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0, 0], [1, 1]]], expected: [[0.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Compute pairwise cosine similarities; the diagonal is 1 for nonzero rows.",
  },
  {
    id: "la-131",
    title: "Cramer's Rule 3x3",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the 3x3 linear system A*x = b using Cramer's rule:\n\nx[i] = det(A_i) / det(A)\n\nwhere A_i is A with column i replaced by b. Return x as a list of floats, or None if det(A) == 0.",
    starterCode: `def cramer_3x3(A, b):
    # Your code here
    pass`,
    solution: `def cramer_3x3(A, b):
    def det3(M):
        return (
            M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
            - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
            + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
        )
    D = det3(A)
    if D == 0:
        return None
    x = []
    for col in range(3):
        M = [[b[r] if c == col else A[r][c] for c in range(3)] for r in range(3)]
        x.append(det3(M) / D)
    return x`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3]], expected: [1.0, 2.0, 3.0] },
      { input: [[[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3]], expected: [2.0, 3.0, -1.0] },
      { input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]], [5, 6, 5]], expected: [13.0, -10.0, 4.0] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 1, 1]], expected: null },
    ],
    hint: "Replace one column at a time and take determinant ratios.",
  },
  {
    id: "la-132",
    title: "Spectral Norm by Power Iteration",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Estimate the spectral norm ||A||_2 of matrix A using power iteration on B = A^T A.\n\nStart with v = [1.0, ..., 1.0]. Each iteration computes w = B*v and sets v = w / ||w||_2. After num_iterations, return sqrt(v . (B*v)). Return 0.0 if a normalization step hits the zero vector.",
    starterCode: `def spectral_norm(A, num_iterations):
    # Your code here
    pass`,
    solution: `def spectral_norm(A, num_iterations):
    n = len(A)
    m = len(A[0])
    B = [[sum(A[t][i] * A[t][j] for t in range(n)) for j in range(m)] for i in range(m)]
    v = [1.0] * m
    for _ in range(num_iterations):
        w = [sum(B[i][j] * v[j] for j in range(m)) for i in range(m)]
        norm = sum(x * x for x in w) ** 0.5
        if norm == 0:
            return 0.0
        v = [x / norm for x in w]
    Bv = [sum(B[i][j] * v[j] for j in range(m)) for i in range(m)]
    return sum(v[i] * Bv[i] for i in range(m)) ** 0.5`,
    testCases: [
      { input: [[[2, 0], [0, 1]], 10], expected: 1.9999999999993179 },
      { input: [[[1, 2], [3, 4]], 20], expected: 5.464985704219043 },
      { input: [[[0]], 1], expected: 0.0 },
      { input: [[[1, 0], [0, 1]], 5], expected: 1.0 },
    ],
    hint: "||A||_2 is the square root of the largest eigenvalue of A^T A.",
  },
  {
    id: "la-133",
    title: "LU Partial Pivot Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one step of LU decomposition with partial pivoting on matrix A.\n\nFind the entry of largest magnitude in the first column, swap that row to the top, then store the multipliers that eliminate the first column below the pivot in column 0. Return the updated matrix, or None if the first column is entirely zero (within 1e-12).",
    starterCode: `def lu_pivot_step(A):
    # Your code here
    pass`,
    solution: `def lu_pivot_step(A):
    n = len(A)
    M = [row[:] for row in A]
    p = max(range(n), key=lambda r: abs(M[r][0]))
    if abs(M[p][0]) < 1e-12:
        return None
    M[0], M[p] = M[p], M[0]
    for i in range(1, n):
        factor = M[i][0] / M[0][0]
        M[i][0] = factor
        for j in range(1, n):
            M[i][j] -= factor * M[0][j]
    return M`,
    testCases: [
      { input: [[[2, 1], [1, 3]]], expected: [[2.0, 1.0], [0.5, 2.5]] },
      { input: [[[1, 3], [2, 1]]], expected: [[2.0, 1.0], [0.5, 2.5]] },
      { input: [[[4, 3], [2, 1]]], expected: [[4.0, 3.0], [0.5, -0.5]] },
      { input: [[[0, 1], [0, 2]]], expected: null },
    ],
    hint: "After swapping, the multipliers replace column 0 below the pivot.",
  },
  {
    id: "la-134",
    title: "Rodrigues Rotation Matrix",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Build the 3x3 rotation matrix for rotating by theta degrees around the axis a, using Rodrigues' formula:\n\nR = I + sin(t)*K + (1 - cos(t))*K^2\n\nwhere t = radians(theta), a is normalized, and K is the cross-product matrix of a. Return None if a is the zero vector.",
    starterCode: `def rodrigues_rotation(axis, theta_degrees):
    # Your code here
    pass`,
    solution: `def rodrigues_rotation(axis, theta_degrees):
    import math
    norm = sum(x * x for x in axis) ** 0.5
    if norm == 0:
        return None
    u = [x / norm for x in axis]
    t = math.radians(theta_degrees)
    c = math.cos(t)
    s = math.sin(t)
    K = [[0.0, -u[2], u[1]], [u[2], 0.0, -u[0]], [-u[1], u[0], 0.0]]
    K2 = [[sum(K[i][k] * K[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
    return [
        [(1.0 if i == j else 0.0) + s * K[i][j] + (1 - c) * K2[i][j] for j in range(3)]
        for i in range(3)
    ]`,
    testCases: [
      { input: [[0, 0, 1], 90], expected: [[0.0, -1.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[1, 0, 0], 180], expected: [[1.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, -1.0]] },
      { input: [[0, 1, 0], 0], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[0, 0, 1], 180], expected: [[-1.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, 1.0]] },
    ],
    hint: "The cross-product matrix K satisfies K*v = a x v.",
  },
  {
    id: "la-135",
    title: "Householder Reflector Vector",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Return the unit Householder vector v that reflects x onto the first coordinate axis.\n\nWith alpha = -sign(x[0]) * ||x||_2 (sign(0) treated as positive), set v = (x - alpha*e1) / ||x - alpha*e1||_2, so that H = I - 2*v*v^T maps x to alpha*e1. If x is the zero vector, return zeros.",
    starterCode: `def householder_vector(x):
    # Your code here
    pass`,
    solution: `def householder_vector(x):
    norm = sum(t * t for t in x) ** 0.5
    if norm == 0:
        return [0.0 for _ in x]
    sign = 1.0 if x[0] >= 0 else -1.0
    alpha = -sign * norm
    v = list(x)
    v[0] -= alpha
    nv = sum(t * t for t in v) ** 0.5
    return [t / nv for t in v]`,
    testCases: [
      { input: [[3, 4]], expected: [0.8944271909999159, 0.4472135954999579] },
      { input: [[1, 0]], expected: [1.0, 0.0] },
      { input: [[-3, 4]], expected: [-0.8944271909999159, 0.4472135954999579] },
      { input: [[0, 0]], expected: [0.0, 0.0] },
    ],
    hint: "Choose the sign of alpha to avoid cancellation with x[0]; the result has unit norm.",
  },
  {
    id: "la-136",
    title: "Conjugate Gradient Step from Residual",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one iteration of the conjugate gradient method for A*x = b starting from x.\n\nCompute the residual r = b - A*x, set the direction p = r, and the step alpha = (r . r) / (p . A*p). Return x + alpha*p. If p . A*p is 0, return x unchanged.",
    starterCode: `def conjugate_gradient_step(A, b, x):
    # Your code here
    pass`,
    solution: `def conjugate_gradient_step(A, b, x):
    n = len(b)
    r = [b[i] - sum(A[i][j] * x[j] for j in range(n)) for i in range(n)]
    p = list(r)
    Ap = [sum(A[i][j] * p[j] for j in range(n)) for i in range(n)]
    pAp = sum(p[i] * Ap[i] for i in range(n))
    if pAp == 0:
        return [float(v) for v in x]
    rr = sum(t * t for t in r)
    alpha = rr / pAp
    return [float(x[i] + alpha * p[i]) for i in range(n)]`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0]], expected: [0.25, 0.5] },
      { input: [[[2, 0], [0, 2]], [2, 4], [0, 0]], expected: [1.0, 2.0] },
      { input: [[[1, 0], [0, 1]], [1, 1], [0, 0]], expected: [1.0, 1.0] },
      { input: [[[4, 1], [1, 3]], [5, 4], [1, 1]], expected: [1.0, 1.0] },
    ],
    hint: "The first conjugate direction is just the residual; the optimal step minimizes the energy norm.",
  },
  {
    id: "la-137",
    title: "QR Decomposition",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the reduced QR decomposition A = Q*R of an n x 2 matrix A with linearly independent columns.\n\nBuild the two orthonormal columns of Q (n x 2) with Gram-Schmidt and the upper triangular R (2 x 2). Return [Q, R], with entries as floats.",
    starterCode: `def qr_decomposition(A):
    # Your code here
    pass`,
    solution: `def qr_decomposition(A):
    n = len(A)
    c0 = [A[i][0] for i in range(n)]
    c1 = [A[i][1] for i in range(n)]
    r00 = sum(x * x for x in c0) ** 0.5
    q0 = [x / r00 for x in c0]
    r01 = sum(q0[i] * c1[i] for i in range(n))
    w = [c1[i] - r01 * q0[i] for i in range(n)]
    r11 = sum(x * x for x in w) ** 0.5
    q1 = [x / r11 for x in w]
    Q = [[q0[i], q1[i]] for i in range(n)]
    R = [[r00, r01], [0.0, r11]]
    return [Q, R]`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [[[1.0, 0.0], [0.0, 1.0]], [[1.0, 0.0], [0.0, 1.0]]] },
      {
        input: [[[1, 1], [1, 2], [1, 3]]],
        expected: [
          [
            [0.5773502691896258, -0.7071067811865475],
            [0.5773502691896258, 0.0],
            [0.5773502691896258, 0.7071067811865475],
          ],
          [[1.7320508075688772, 3.4641016151377553], [0.0, 1.4142135623730951]],
        ],
      },
      {
        input: [[[1, 1], [1, -1]]],
        expected: [
          [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, -0.7071067811865475]],
          [[1.4142135623730951, 0.0], [0.0, 1.4142135623730951]],
        ],
      },
      { input: [[[2, 0], [0, 1]]], expected: [[[1.0, 0.0], [0.0, 1.0]], [[2.0, 0.0], [0.0, 1.0]]] },
    ],
    hint: "R stores the projection coefficients r01 and the residual norm r11.",
  },
  {
    id: "la-138",
    title: "Cholesky Solve",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve A*x = b for symmetric positive definite A using its Cholesky factorization A = L*L^T.\n\nFactor A into lower triangular L, solve L*y = b by forward substitution, then L^T*x = y by back substitution. Return x as a list of floats.",
    starterCode: `def cholesky_solve(A, b):
    # Your code here
    pass`,
    solution: `def cholesky_solve(A, b):
    n = len(A)
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            s = A[i][j] - sum(L[i][k] * L[j][k] for k in range(j))
            if i == j:
                L[i][j] = s ** 0.5
            else:
                L[i][j] = s / L[j][j]
    y = [0.0] * n
    for i in range(n):
        y[i] = (b[i] - sum(L[i][j] * y[j] for j in range(i))) / L[i][i]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        x[i] = (y[i] - sum(L[j][i] * x[j] for j in range(i + 1, n))) / L[i][i]
    return x`,
    testCases: [
      { input: [[[4, 2], [2, 3]], [1, 2]], expected: [-0.125, 0.75] },
      {
        input: [[[25, 15, 5], [15, 18, 0], [5, 0, 11]], [1, 2, 3]],
        expected: [-0.19851851851851848, 0.2765432098765432, 0.36296296296296293],
      },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3]], expected: [1.0, 2.0, 3.0] },
      { input: [[[9, 0], [0, 16]], [18, 32]], expected: [2.0, 2.0] },
    ],
    hint: "Forward substitution uses L; back substitution uses the transpose via L[j][i].",
  },
  {
    id: "la-139",
    title: "Rank-1 Approximation",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the best rank-1 approximation of a 2x2 matrix A using its dominant singular pair.\n\nForm B = A^T A, take its largest eigenvalue lambda1 and a corresponding unit eigenvector v (positive convention), set sigma = sqrt(lambda1), u = A*v / sigma, and return sigma * u*v^T. Return the zero matrix if sigma is 0.",
    starterCode: `def rank1_approximation(A):
    # Your code here
    pass`,
    solution: `def rank1_approximation(A):
    B = [[sum(A[k][i] * A[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    a, b, c, d = B[0][0], B[0][1], B[1][0], B[1][1]
    tr = a + d
    det = a * d - b * c
    disc = (tr * tr - 4 * det) ** 0.5
    l1 = (tr + disc) / 2
    if abs(b) > 1e-12:
        v = [b, l1 - a]
        norm = (v[0] * v[0] + v[1] * v[1]) ** 0.5
        v = [v[0] / norm, v[1] / norm]
    elif a >= d:
        v = [1.0, 0.0]
    else:
        v = [0.0, 1.0]
    sigma = max(0.0, l1) ** 0.5
    if sigma == 0:
        return [[0.0, 0.0], [0.0, 0.0]]
    Av = [sum(A[i][j] * v[j] for j in range(2)) for i in range(2)]
    u = [Av[i] / sigma for i in range(2)]
    return [[sigma * u[i] * v[j] for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [[[3, 0], [0, 1]]], expected: [[3.0, 0.0], [0.0, 0.0]] },
      { input: [[[2, 0], [0, 0]]], expected: [[2.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 1], [0, 0]]], expected: [[1.0, 1.0], [0.0, 0.0]] },
      { input: [[[2, 1], [1, 2]]], expected: [[1.5, 1.5], [1.5, 1.5]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "This is the Eckart-Young theorem for rank 1: keep only the leading singular triple.",
  },
  {
    id: "la-140",
    title: "Matrix Square Root 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the unique symmetric positive definite square root S of a symmetric positive definite 2x2 matrix A, so that S*S = A.\n\nUse the eigendecomposition A = Q*Lambda*Q^T with orthonormal Q and return S = Q*sqrt(Lambda)*Q^T.",
    starterCode: `def matrix_sqrt_2x2(A):
    # Your code here
    pass`,
    solution: `def matrix_sqrt_2x2(A):
    import math
    a, b, c, d = A[0][0], A[0][1], A[1][0], A[1][1]
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
    s1 = math.sqrt(l1)
    s2 = math.sqrt(l2)
    return [
        [s1 * v[0] * v[0] + s2 * w[0] * w[0], s1 * v[0] * v[1] + s2 * w[0] * w[1]],
        [s1 * v[1] * v[0] + s2 * w[1] * w[0], s1 * v[1] * v[1] + s2 * w[1] * w[1]],
    ]`,
    testCases: [
      { input: [[[4, 0], [0, 9]]], expected: [[2.0, 0.0], [0.0, 3.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      {
        input: [[[2, 1], [1, 2]]],
        expected: [[1.3660254037844384, 0.3660254037844386], [0.3660254037844386, 1.3660254037844384]],
      },
      { input: [[[5, 4], [4, 5]]], expected: [[2.0, 1.0], [1.0, 2.0]] },
    ],
    hint: "Take square roots of the eigenvalues while keeping the eigenvectors unchanged.",
  },
];
