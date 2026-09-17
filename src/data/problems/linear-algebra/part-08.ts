import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-276",
    title: "Vector Subtraction",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Subtract two equal-length vectors elementwise.\n\nReturn a new list where the i-th entry is a[i] - b[i]. Both inputs always have the same length.",
    starterCode: `def vector_subtract(a, b):
    # Your code here
    pass`,
    solution: `def vector_subtract(a, b):
    return [x - y for x, y in zip(a, b)]`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [-3, -3, -3] },
      { input: [[0, 0], [0, 0]], expected: [0, 0] },
      { input: [[5], [7]], expected: [-2] },
      { input: [[1.5, -2], [0.5, 0.5]], expected: [1.0, -2.5] },
      { input: [[-1, 0, 2], [-3, -4, -5]], expected: [2, 4, 7] },
    ],
    hint: "Zip the vectors and subtract the paired entries.",
  },
  {
    id: "la-277",
    title: "Scalar Projection Component",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the scalar projection (signed component) of vector u onto vector v:\n\ncomp_v(u) = (u . v) / ||v||\n\nReturn None if v is the zero vector.",
    starterCode: `def scalar_projection(u, v):
    # Your code here
    pass`,
    solution: `def scalar_projection(u, v):
    n2 = sum(x * x for x in v)
    if n2 == 0:
        return None
    return sum(x * y for x, y in zip(u, v)) / (n2 ** 0.5)`,
    testCases: [
      { input: [[3, 4], [1, 0]], expected: 3.0 },
      { input: [[1, 1], [1, 1]], expected: 1.414213562373095 },
      { input: [[0, 5], [0, 0]], expected: null },
      { input: [[-2, 0], [0, 3]], expected: 0.0 },
      { input: [[1, 2, 3], [0, 3, 4]], expected: 3.6 },
    ],
    hint: "Divide the dot product by the norm of v; the sign follows the angle.",
  },
  {
    id: "la-278",
    title: "Matrix Column Extraction",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Extract column j from a matrix A as a list.\n\nA is given as a list of rows, so return [A[0][j], A[1][j], ...] with one entry per row.",
    starterCode: `def matrix_column(A, j):
    # Your code here
    pass`,
    solution: `def matrix_column(A, j):
    return [row[j] for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 1], expected: [2, 4] },
      { input: [[[1, 2], [3, 4]], 0], expected: [1, 3] },
      { input: [[[5, 6, 7]], 2], expected: [7] },
      { input: [[[1], [2]], 0], expected: [1, 2] },
      { input: [[[0.5, -1.5], [2.5, 3.5]], 1], expected: [-1.5, 3.5] },
    ],
    hint: "Index the same position in every row.",
  },
  {
    id: "la-279",
    title: "Matrix Subtraction",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Subtract matrix B from matrix A entrywise.\n\nReturn a new matrix where each entry is A[i][j] - B[i][j]. Both matrices have the same shape.",
    starterCode: `def matrix_subtract(A, B):
    # Your code here
    pass`,
    solution: `def matrix_subtract(A, B):
    return [[A[i][j] - B[i][j] for j in range(len(A[0]))] for i in range(len(A))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [[-4, -4], [-4, -4]] },
      { input: [[[0, 0], [0, 0]], [[1, -1], [-1, 1]]], expected: [[-1, 1], [1, -1]] },
      { input: [[[10]], [[4]]], expected: [[6]] },
      { input: [[[1.5, 2.5], [3.5, 4.5]], [[0.5, 0.5], [0.5, 0.5]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1, 2, 3], [4, 5, 6]], [[6, 5, 4], [3, 2, 1]]], expected: [[-5, -3, -1], [1, 3, 5]] },
    ],
    hint: "Subtract entrywise with a nested list comprehension.",
  },
  {
    id: "la-280",
    title: "Area Scale Factor 2x2",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the area scale factor of the 2x2 linear map given by A, which is the absolute determinant:\n\n|det(A)| = |a*d - b*c|\n\nThis is the factor by which the map scales areas.",
    starterCode: `def area_scale_factor(A):
    # Your code here
    pass`,
    solution: `def area_scale_factor(A):
    return abs(A[0][0] * A[1][1] - A[0][1] * A[1][0])`,
    testCases: [
      { input: [[[2, 0], [0, 3]]], expected: 6 },
      { input: [[[1, 1], [1, 1]]], expected: 0 },
      { input: [[[0, -1], [1, 0]]], expected: 1 },
      { input: [[[2, 4], [1, 3]]], expected: 2 },
      { input: [[[-3, 0], [0, -2]]], expected: 6 },
    ],
    hint: "A singular map collapses areas to zero, so the factor is 0.",
  },
  {
    id: "la-281",
    title: "Zero Vector Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Check whether a vector is (numerically) the zero vector.\n\nReturn True if every entry has absolute value below 1e-9, and False otherwise. The empty vector counts as zero.",
    starterCode: `def zero_vector_check(v):
    # Your code here
    pass`,
    solution: `def zero_vector_check(v):
    return all(abs(x) < 1e-9 for x in v)`,
    testCases: [
      { input: [[0, 0, 0]], expected: true },
      { input: [[0, 1e-10]], expected: true },
      { input: [[0, 0.001]], expected: false },
      { input: [[]], expected: true },
      { input: [[1e-10, -1e-10, 0]], expected: true },
    ],
    hint: "Use a small tolerance rather than exact equality.",
  },
  {
    id: "la-282",
    title: "Trace of Matrix Product",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the trace of the matrix product A*B without forming the full product:\n\ntr(A*B) = sum_i sum_k A[i][k] * B[k][i]\n\nA is n x m and B is m x n, so the product is square.",
    starterCode: `def trace_of_product(A, B):
    # Your code here
    pass`,
    solution: `def trace_of_product(A, B):
    n = len(A)
    m = len(B)
    return sum(A[i][k] * B[k][i] for i in range(n) for k in range(m))`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: 69 },
      { input: [[[1, 2, 3], [4, 5, 6]], [[1, 0], [0, 1], [1, 1]]], expected: 15 },
      { input: [[[1, 0], [0, 1]], [[7, 8], [9, 10]]], expected: 17 },
      { input: [[[0, 0], [0, 0]], [[5, 6], [7, 8]]], expected: 0 },
      { input: [[[2.5, 1.0], [0.5, 2.0]], [[1.0, 0.5], [0.25, 2.0]]], expected: 7.0 },
    ],
    hint: "Only diagonal entries of the product matter, so skip the rest.",
  },
  {
    id: "la-283",
    title: "Orthogonal Set Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Check whether a collection of equal-length vectors forms an orthogonal set.\n\nAll vectors must be nonzero and every pair must satisfy v_i . v_j = 0 within 1e-9. Return True only if both conditions hold.",
    starterCode: `def orthogonal_set_check(vectors):
    # Your code here
    pass`,
    solution: `def orthogonal_set_check(vectors):
    n = len(vectors)
    for i in range(n):
        if all(abs(x) < 1e-9 for x in vectors[i]):
            return False
        for j in range(i + 1, n):
            if abs(sum(x * y for x, y in zip(vectors[i], vectors[j]))) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[1, 1], [1, -1]]], expected: true },
      { input: [[[1, 0], [1, 1]]], expected: false },
      { input: [[[1, 0], [0, 1], [1, 1]]], expected: false },
      { input: [[[0, 0], [1, 0]]], expected: false },
      { input: [[[1, 1], [1, -1.0000000001]]], expected: true },
    ],
    hint: "An orthogonal set cannot contain the zero vector, because 0 is orthogonal to everything.",
  },
  {
    id: "la-284",
    title: "Vector Rejection from Another",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the rejection of vector u from vector v: the component of u orthogonal to v.\n\nrej_v(u) = u - proj_v(u) = u - ((u . v) / (v . v)) * v\n\nReturn None if v is the zero vector.",
    starterCode: `def vector_rejection(u, v):
    # Your code here
    pass`,
    solution: `def vector_rejection(u, v):
    n2 = sum(x * x for x in v)
    if n2 == 0:
        return None
    s = sum(x * y for x, y in zip(u, v)) / n2
    return [x - s * y for x, y in zip(u, v)]`,
    testCases: [
      { input: [[3, 3], [1, 0]], expected: [0.0, 3.0] },
      { input: [[1, 2], [1, 1]], expected: [-0.5, 0.5] },
      { input: [[1, 2], [0, 0]], expected: null },
      { input: [[0, 5], [1, 0]], expected: [0.0, 5.0] },
      { input: [[2, 4, 6], [1, 0, 0]], expected: [0.0, 4.0, 6.0] },
    ],
    hint: "The rejection plus the projection reconstructs u exactly.",
  },
  {
    id: "la-285",
    title: "Gram-Schmidt Next Orthonormal Vector",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Extend an orthonormal pair q1, q2 to include vector a by one step of Gram-Schmidt.\n\nSubtract the projections of a onto q1 and q2, normalize the residual, and return the resulting unit vector. Return None if a lies in span(q1, q2), meaning the residual norm is below 1e-12.",
    starterCode: `def gram_schmidt_next(q1, q2, a):
    # Your code here
    pass`,
    solution: `def gram_schmidt_next(q1, q2, a):
    w = [float(x) for x in a]
    for q in (q1, q2):
        s = sum(x * y for x, y in zip(w, q))
        w = [x - s * y for x, y in zip(w, q)]
    norm = sum(x * x for x in w) ** 0.5
    if norm < 1e-12:
        return None
    return [x / norm for x in w]`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0], [1, 1, 1]], expected: [0.0, 0.0, 1.0] },
      { input: [[1, 0, 0], [0, 1, 0], [2, 0, 0]], expected: null },
      { input: [[1, 0, 0], [0, 1, 0], [0, 3, 4]], expected: [0.0, 0.0, 1.0] },
      {
        input: [[0.7071067811865476, 0.7071067811865476, 0.0], [0, 0, 1], [1, 1, 1]],
        expected: null,
      },
      { input: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], expected: null },
    ],
    hint: "Assume q1 and q2 are already orthonormal; only one vector needs to be produced.",
  },
  {
    id: "la-286",
    title: "Block Diagonal Eigenvalues",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the eigenvalues of a block diagonal matrix given as a list of diagonal blocks.\n\nEach block is either 1x1 (its scalar) or 2x2, solved from lambda^2 - tr*lambda + det = 0. Return all eigenvalues sorted ascending, or None if any 2x2 block has complex eigenvalues (negative discriminant).",
    starterCode: `def block_diagonal_eigenvalues(blocks):
    # Your code here
    pass`,
    solution: `def block_diagonal_eigenvalues(blocks):
    vals = []
    for B in blocks:
        if len(B) == 1:
            vals.append(float(B[0][0]))
        else:
            a, b = B[0][0], B[0][1]
            c, d = B[1][0], B[1][1]
            tr = a + d
            det = a * d - b * c
            disc = tr * tr - 4 * det
            if disc < -1e-9:
                return None
            if disc < 0:
                disc = 0.0
            root = disc ** 0.5
            vals.append((tr + root) / 2)
            vals.append((tr - root) / 2)
    return sorted(vals)`,
    testCases: [
      { input: [[[[2, 0], [0, 3]], [[4]]]], expected: [2.0, 3.0, 4.0] },
      { input: [[[[1, 1], [0, 2]]]], expected: [1.0, 2.0] },
      { input: [[[[0, -1], [1, 0]]]], expected: null },
      { input: [[[[5]]]], expected: [5.0] },
      { input: [[[[3, 0], [0, 3]], [[-1]]]], expected: [-1.0, 3.0, 3.0] },
    ],
    hint: "Eigenvalues of a block diagonal matrix are the union of the blocks' eigenvalues.",
  },
  {
    id: "la-287",
    title: "Determinant of Scaled Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of c*A for a square matrix A of size 1, 2, or 3.\n\nScaling an n x n matrix by c multiplies its determinant by c^n. Return the determinant as a number.",
    starterCode: `def determinant_scaled_matrix(A, c):
    # Your code here
    pass`,
    solution: `def determinant_scaled_matrix(A, c):
    n = len(A)
    if n == 1:
        return c * A[0][0]
    if n == 2:
        return c * c * (A[0][0] * A[1][1] - A[0][1] * A[1][0])
    d = 0
    for j in range(3):
        sub = [[A[i][k] for k in range(3) if k != j] for i in range(1, 3)]
        d += ((-1) ** j) * A[0][j] * (sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0])
    return c ** 3 * d`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: -8 },
      { input: [[[1, 2], [3, 4]], 0], expected: 0 },
      { input: [[[2, 0, 1], [0, 3, 0], [1, 0, 2]], -1], expected: -9 },
      { input: [[[3]], 5], expected: 15 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 10]], 1], expected: -3 },
    ],
    hint: "det(c*A) = c^n * det(A) for an n x n matrix.",
  },
  {
    id: "la-288",
    title: "Rank-Nullity Count",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the rank-nullity theorem to a matrix A with n columns.\n\nCompute the rank by Gauss-Jordan elimination and return [rank, n - rank], where n - rank is the nullity (dimension of the null space).",
    starterCode: `def rank_nullity(A):
    # Your code here
    pass`,
    solution: `def rank_nullity(A):
    M = [[float(x) for x in row] for row in A]
    rows = len(M)
    cols = len(M[0])
    rank = 0
    for col in range(cols):
        piv = None
        for r in range(rank, rows):
            if abs(M[r][col]) > 1e-9:
                piv = r
                break
        if piv is None:
            continue
        M[rank], M[piv] = M[piv], M[rank]
        pv = M[rank][col]
        M[rank] = [x / pv for x in M[rank]]
        for r in range(rows):
            if r != rank:
                f = M[r][col]
                M[r] = [x - f * y for x, y in zip(M[r], M[rank])]
        rank += 1
    return [rank, cols - rank]`,
    testCases: [
      { input: [[[1, 2], [3, 6]]], expected: [1, 1] },
      { input: [[[1, 0], [0, 1]]], expected: [2, 0] },
      { input: [[[0, 0], [0, 0]]], expected: [0, 2] },
      { input: [[[1, 2], [2, 4], [0, 1]]], expected: [2, 0] },
      { input: [[[1, 0, 1], [0, 1, 1]]], expected: [2, 1] },
    ],
    hint: "Count pivot columns during elimination; every column is either a pivot or a free variable.",
  },
  {
    id: "la-289",
    title: "Quadratic Least Squares Fit",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Fit a quadratic y = a + b*x + c*x^2 to data by least squares.\n\nSolve the 3x3 normal equations built from the power sums, using Gaussian elimination with partial pivoting. Return [a, b, c], or None if the normal matrix is singular (fewer than three distinct x values).",
    starterCode: `def quadratic_fit(xs, ys):
    # Your code here
    pass`,
    solution: `def quadratic_fit(xs, ys):
    S = [sum(x ** k for x in xs) for k in range(5)]
    T = [sum(y * x ** j for x, y in zip(xs, ys)) for j in range(3)]
    M = [[S[0], S[1], S[2], T[0]],
         [S[1], S[2], S[3], T[1]],
         [S[2], S[3], S[4], T[2]]]
    for col in range(3):
        piv = max(range(col, 3), key=lambda r: abs(M[r][col]))
        if abs(M[piv][col]) < 1e-12:
            return None
        M[col], M[piv] = M[piv], M[col]
        pv = M[col][col]
        M[col] = [v / pv for v in M[col]]
        for r in range(3):
            if r != col:
                f = M[r][col]
                M[r] = [a - f * b for a, b in zip(M[r], M[col])]
    return [M[0][3], M[1][3], M[2][3]]`,
    testCases: [
      { input: [[0, 1, 2], [1, 2, 5]], expected: [1.0000000000000009, -8.881784197001252e-15, 1.0000000000000044] },
      { input: [[0, 1, 2, 3], [2, 3, 4, 5]], expected: [1.9999999999999978, 1.0000000000000067, -2.1649348980190643e-15] },
      { input: [[0, 1, 2], [0, 0, 3]], expected: [3.3306690738754696e-16, -1.5000000000000049, 1.5000000000000024] },
      { input: [[1, 1, 1], [1, 2, 4]], expected: null },
      { input: [[0, 0, 1], [1, 2, 4]], expected: null },
    ],
    hint: "The normal equations for y = a + b*x + c*x^2 form a symmetric 3x3 system of power sums.",
  },
  {
    id: "la-290",
    title: "Eigenvalue Pair Certificate Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Check whether a pair of numbers are the eigenvalues of the 2x2 matrix A.\n\nTwo numbers are exactly the eigenvalues when their sum equals tr(A) and their product equals det(A), so test both identities within 1e-9. Return True if both hold.",
    starterCode: `def eigenvalue_pair_check(A, eigenvalues):
    # Your code here
    pass`,
    solution: `def eigenvalue_pair_check(A, eigenvalues):
    l1, l2 = eigenvalues
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    return abs(l1 + l2 - tr) < 1e-9 and abs(l1 * l2 - det) < 1e-9`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [3, 2]], expected: true },
      { input: [[[1, 2], [2, 1]], [3, -1]], expected: true },
      { input: [[[1, 2], [3, 4]], [5, -2]], expected: false },
      { input: [[[1, 2], [3, 4]], [4, -2]], expected: false },
      { input: [[[0, -1], [1, 0]], [1, -1]], expected: false },
    ],
    hint: "The characteristic polynomial is lambda^2 - tr(A)*lambda + det(A), so sum and product certify the roots.",
  },
  {
    id: "la-291",
    title: "L1 Distance Between Vectors",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Sum the absolute differences of two equal-length vectors:\n\nsum_i |a[i] - b[i]|\n\nThis is the L1 distance between the points. Empty inputs return 0.",
    starterCode: `def manhattan_distance(a, b):
    # Your code here
    pass`,
    solution: `def manhattan_distance(a, b):
    return sum(abs(x - y) for x, y in zip(a, b))`,
    testCases: [
      { input: [[1, 2, 3], [4, 6, 8]], expected: 12 },
      { input: [[0, 0], [0, 0]], expected: 0 },
      { input: [[], []], expected: 0 },
      { input: [[-1, -2], [1, 2]], expected: 6 },
      { input: [[2.5, 0], [0, 2.5]], expected: 5.0 },
    ],
    hint: "Zip the vectors and accumulate absolute differences.",
  },
  {
    id: "la-292",
    title: "General p-Norm of a Vector",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the p-norm of a vector:\n\n||v||_p = (sum_i |v[i]|^p)^(1/p)\n\nReturn None if p <= 0. For p = 1 this is the taxicab norm and for p = 2 the Euclidean norm.",
    starterCode: `def general_p_norm(v, p):
    # Your code here
    pass`,
    solution: `def general_p_norm(v, p):
    if p <= 0:
        return None
    return sum(abs(x) ** p for x in v) ** (1.0 / p)`,
    testCases: [
      { input: [[3, 4], 2], expected: 5.0 },
      { input: [[1, -2, 2], 1], expected: 5.0 },
      { input: [[1], 5], expected: 1.0 },
      { input: [[0, 0], 3], expected: 0.0 },
      { input: [[1, 2], 0], expected: null },
    ],
    hint: "Raise absolute values to p, sum, then take the p-th root.",
  },
  {
    id: "la-293",
    title: "Unit Vector Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Check whether a vector has unit length.\n\nReturn True when the squared norm is within 1e-9 of 1. The zero vector and any non-unit vector return False.",
    starterCode: `def unit_vector_check(v):
    # Your code here
    pass`,
    solution: `def unit_vector_check(v):
    n2 = sum(x * x for x in v)
    return abs(n2 - 1.0) < 1e-9`,
    testCases: [
      { input: [[1, 0, 0]], expected: true },
      { input: [[0.6, 0.8]], expected: true },
      { input: [[0, 0]], expected: false },
      { input: [[1, 1]], expected: false },
      { input: [[0.6, 0.8000000001]], expected: true },
    ],
    hint: "Compare the squared norm to 1; this avoids computing a square root.",
  },
  {
    id: "la-294",
    title: "Eigenvalue Certificate Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Check whether lam is an eigenvalue of A by testing whether det(A - lam*I) is zero.\n\nSubtract lam along the diagonal, compute the determinant for matrices of size 1, 2, or 3 by cofactor expansion, and return True if the absolute determinant is below 1e-9.",
    starterCode: `def eigenvalue_certificate(A, lam):
    # Your code here
    pass`,
    solution: `def eigenvalue_certificate(A, lam):
    n = len(A)
    M = [[A[i][j] - (lam if i == j else 0) for j in range(n)] for i in range(n)]
    if n == 1:
        return abs(M[0][0]) < 1e-9
    if n == 2:
        det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
    else:
        det = 0
        for j in range(3):
            sub = [[M[i][k] for k in range(3) if k != j] for i in range(1, 3)]
            det += ((-1) ** j) * M[0][j] * (sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0])
    return abs(det) < 1e-9`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 2], expected: true },
      { input: [[[2, 0], [0, 3]], 4], expected: false },
      { input: [[[1, 2, 3], [0, 4, 5], [0, 0, 6]], 4], expected: true },
      { input: [[[1, 2, 3], [0, 4, 5], [0, 0, 6]], 2], expected: false },
      { input: [[[7]], 7], expected: true },
    ],
    hint: "lam is an eigenvalue exactly when A - lam*I is singular.",
  },
  {
    id: "la-295",
    title: "Apply Affine Matrix to Point",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Apply a 2D affine transform to a point.\n\nM is a 2x3 matrix storing the linear part and translation, and p = [x, y]. Return [M[0][0]*x + M[0][1]*y + M[0][2], M[1][0]*x + M[1][1]*y + M[1][2]].",
    starterCode: `def apply_affine_matrix(M, p):
    # Your code here
    pass`,
    solution: `def apply_affine_matrix(M, p):
    x, y = p[0], p[1]
    return [M[0][0] * x + M[0][1] * y + M[0][2],
            M[1][0] * x + M[1][1] * y + M[1][2]]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0]], [3, 4]], expected: [3, 4] },
      { input: [[[1, 0, 5], [0, 1, -3]], [2, 1]], expected: [7, -2] },
      { input: [[[0, -1, 0], [1, 0, 0]], [1, 0]], expected: [0, 1] },
      { input: [[[2, 0, 1], [0, 3, -2]], [2, 1]], expected: [5, 1] },
      { input: [[[1, 0.5, 0], [0, 1, 0]], [2, 2]], expected: [3.0, 2] },
    ],
    hint: "The third column of M is the translation applied after the linear part.",
  },
  {
    id: "la-296",
    title: "Weighted L2 Norm",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the weighted L2 norm of a vector with nonnegative weights w:\n\n||v||_w = sqrt(sum_i w[i] * v[i]^2)\n\nReturn None if any weight is negative, since the weighted quadratic form would not define a norm.",
    starterCode: `def weighted_l2_norm(v, w):
    # Your code here
    pass`,
    solution: `def weighted_l2_norm(v, w):
    total = sum(wi * xi * xi for wi, xi in zip(w, v))
    if total < 0:
        return None
    return total ** 0.5`,
    testCases: [
      { input: [[3, 4], [1, 1]], expected: 5.0 },
      { input: [[3, 4], [2, 0.5]], expected: 5.0990195135927845 },
      { input: [[3, 4], [0, 0]], expected: 0.0 },
      { input: [[1, 0], [-1, 1]], expected: null },
      { input: [[1, 2, 2], [4, 1, 1]], expected: 3.4641016151377544 },
    ],
    hint: "Square the entries, scale by the weights, sum, and take the square root.",
  },
  {
    id: "la-297",
    title: "Project Vector onto Plane",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Project vector v onto the plane through the origin with normal n.\n\nRemove the component along the normal:\n\nv - ((v . n) / (n . n)) * n\n\nReturn None if n is the zero vector.",
    starterCode: `def project_onto_plane(v, n):
    # Your code here
    pass`,
    solution: `def project_onto_plane(v, n):
    n2 = sum(x * x for x in n)
    if n2 == 0:
        return None
    s = sum(x * y for x, y in zip(v, n)) / n2
    return [x - s * y for x, y in zip(v, n)]`,
    testCases: [
      { input: [[1, 2, 3], [0, 0, 1]], expected: [1.0, 2.0, 0.0] },
      { input: [[2, 3, 4], [1, 1, 1]], expected: [-1.0, 0.0, 1.0] },
      { input: [[1, -1, 5], [1, 1, 0]], expected: [1.0, -1.0, 5.0] },
      { input: [[1, 2, 3], [0, 0, 0]], expected: null },
      { input: [[1, 1, 1], [0, 0, 2]], expected: [1.0, 1.0, 0.0] },
    ],
    hint: "Subtract the projection onto the normal; the normal direction is the only one removed.",
  },
  {
    id: "la-298",
    title: "Reflect Vector across Plane",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Reflect vector v across the plane through the origin with normal n.\n\nThe reflection flips the normal component:\n\nv - 2 * ((v . n) / (n . n)) * n\n\nReturn None if n is the zero vector.",
    starterCode: `def reflect_across_plane(v, n):
    # Your code here
    pass`,
    solution: `def reflect_across_plane(v, n):
    n2 = sum(x * x for x in n)
    if n2 == 0:
        return None
    s = 2 * sum(x * y for x, y in zip(v, n)) / n2
    return [x - s * y for x, y in zip(v, n)]`,
    testCases: [
      { input: [[1, 2, 3], [0, 0, 1]], expected: [1.0, 2.0, -3.0] },
      { input: [[2, 0, 0], [1, 0, 0]], expected: [-2.0, 0.0, 0.0] },
      { input: [[1, -1, 5], [1, 1, 0]], expected: [1.0, -1.0, 5.0] },
      { input: [[1, 2, 3], [0, 0, 0]], expected: null },
      { input: [[1, 1, 1], [0, 1, 1]], expected: [1.0, -1.0, -1.0] },
    ],
    hint: "A reflection is the identity minus twice the projection onto the normal.",
  },
  {
    id: "la-299",
    title: "Basis Transition Matrix 2D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the change-of-basis matrix from basis B to basis C in 2D.\n\nB and C are pairs of basis vectors; return the 2x2 matrix whose columns are the coordinates of B[0] and B[1] expressed in C. Return None if C is linearly dependent.",
    starterCode: `def basis_transition_matrix(B, C):
    # Your code here
    pass`,
    solution: `def basis_transition_matrix(B, C):
    b1, b2 = B
    c1, c2 = C
    det = c1[0] * c2[1] - c2[0] * c1[1]
    if det == 0:
        return None
    def coords(v):
        return [(v[0] * c2[1] - c2[0] * v[1]) / det,
                (c1[0] * v[1] - v[0] * c1[1]) / det]
    p1 = coords(b1)
    p2 = coords(b2)
    return [[p1[0], p2[0]], [p1[1], p2[1]]]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]], [[2, 0], [0, 2]]], expected: [[0.5, 0.0], [0.0, 0.5]] },
      { input: [[[1, 1], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [1.0, 1.0]] },
      { input: [[[1, 1], [0, 1]], [[1, 1], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]], [[1, 1], [1, 1]]], expected: null },
    ],
    hint: "Each column of the transition matrix solves a 2x2 system for one basis vector of B.",
  },
  {
    id: "la-300",
    title: "Eigenvector via Row Cross Product",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Find an eigenvector of an integer 3x3 matrix A for the given eigenvalue lam.\n\nForm M = A - lam*I and take the cross product of two rows of M, which lies in the null space when those rows span the row space. Try row pairs (0,1), (0,2), (1,2) in order, returning the first nonzero cross product w with M*w exactly zero, or None if no pair works.",
    starterCode: `def eigenvector_row_cross(A, lam):
    # Your code here
    pass`,
    solution: `def eigenvector_row_cross(A, lam):
    M = [[A[i][j] - (lam if i == j else 0) for j in range(3)] for i in range(3)]
    def cross(u, v):
        return [u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]]
    for i, j in ((0, 1), (0, 2), (1, 2)):
        w = cross(M[i], M[j])
        if sum(x * x for x in w) == 0:
            continue
        r = [sum(M[a][k] * w[k] for k in range(3)) for a in range(3)]
        if sum(x * x for x in r) == 0:
            return w
    return None`,
    testCases: [
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], 2], expected: [2, 0, 0] },
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], 3], expected: [1, 1, 0] },
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], 4], expected: [0, 0, 2] },
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], 1], expected: null },
      { input: [[[3, 1, 0], [0, 3, 0], [0, 0, 1]], 1], expected: [0, 0, 4] },
    ],
    hint: "The cross product of two rows of M = A - lam*I is orthogonal to the row space, hence in the null space.",
  },
  {
    id: "la-301",
    title: "Nullity of a 3x3 Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the nullity of a 3x3 matrix: the dimension of its null space.\n\nCompute the rank by Gauss-Jordan elimination with partial pivoting and return 3 - rank.",
    starterCode: `def nullity_3x3(A):
    # Your code here
    pass`,
    solution: `def nullity_3x3(A):
    M = [[float(x) for x in row] for row in A]
    rank = 0
    for col in range(3):
        piv = None
        for r in range(rank, 3):
            if abs(M[r][col]) > 1e-9:
                piv = r
                break
        if piv is None:
            continue
        M[rank], M[piv] = M[piv], M[rank]
        pv = M[rank][col]
        M[rank] = [x / pv for x in M[rank]]
        for r in range(3):
            if r != rank:
                f = M[r][col]
                M[r] = [x - f * y for x, y in zip(M[r], M[rank])]
        rank += 1
    return 3 - rank`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 0 },
      { input: [[[1, 2, 3], [2, 4, 6], [0, 0, 0]]], expected: 2 },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 3 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 1 },
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 2 },
    ],
    hint: "Count pivot columns and subtract from 3; each missing pivot is a free variable.",
  },
  {
    id: "la-302",
    title: "Weighted Least Squares Diagonal",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve weighted least squares min ||W^(1/2)(A*x - b)||^2 for A of shape n x 2 with diagonal weight matrix W = diag(w).\n\nBuild the normal equations (A^T W A) x = A^T W b and solve the 2x2 system. Return [x0, x1], or None if any weight is negative or A^T W A is singular.",
    starterCode: `def weighted_least_squares(A, b, w):
    # Your code here
    pass`,
    solution: `def weighted_least_squares(A, b, w):
    if any(wi < 0 for wi in w):
        return None
    ata = [[0.0, 0.0], [0.0, 0.0]]
    atb = [0.0, 0.0]
    for i in range(len(A)):
        for j in range(2):
            atb[j] += w[i] * A[i][j] * b[i]
            for k in range(2):
                ata[j][k] += w[i] * A[i][j] * A[i][k]
    det = ata[0][0] * ata[1][1] - ata[0][1] * ata[1][0]
    if abs(det) < 1e-12:
        return None
    return [(atb[0] * ata[1][1] - ata[0][1] * atb[1]) / det,
            (ata[0][0] * atb[1] - atb[0] * ata[1][0]) / det]`,
    testCases: [
      { input: [[[1, 0], [0, 1], [1, 1]], [1, 2, 3], [1, 1, 1]], expected: [1.0, 2.0] },
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3], [1, 1, 1]], expected: [0.0, 1.0] },
      { input: [[[1, 1], [2, 1], [3, 1]], [2, 3, 4], [2, 1, 2]], expected: [1.0, 1.0] },
      { input: [[[1, 0], [1, 0]], [1, 2], [1, 1]], expected: null },
      { input: [[[1, 0], [0, 1]], [1, 1], [-1, 1]], expected: null },
    ],
    hint: "Weights enter both sides of the normal equations; zero weights ignore those rows entirely.",
  },
  {
    id: "la-303",
    title: "Reflection Matrix across Plane",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 3x3 reflection matrix across the plane through the origin with normal n:\n\nH = I - 2 * (n n^T) / (n . n)\n\nReturn None if n is the zero vector.",
    starterCode: `def reflection_matrix_plane(n):
    # Your code here
    pass`,
    solution: `def reflection_matrix_plane(n):
    n2 = sum(x * x for x in n)
    if n2 == 0:
        return None
    return [[(1.0 if i == j else 0.0) - 2.0 * n[i] * n[j] / n2 for j in range(3)]
            for i in range(3)]`,
    testCases: [
      { input: [[0, 0, 1]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, -1.0]] },
      { input: [[1, 0, 0]], expected: [[-1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
      {
        input: [[1, 1, 1]],
        expected: [
          [0.33333333333333337, -0.6666666666666666, -0.6666666666666666],
          [-0.6666666666666666, 0.33333333333333337, -0.6666666666666666],
          [-0.6666666666666666, -0.6666666666666666, 0.33333333333333337],
        ],
      },
      { input: [[0, 0, 2]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, -1.0]] },
      { input: [[0, 0, 0]], expected: null },
    ],
    hint: "The matrix is symmetric and satisfies H*H = I, so it is its own inverse.",
  },
  {
    id: "la-304",
    title: "Minimum Norm Solution 2x3",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve the underdetermined system A*x = b with A of shape 2x3 and linearly independent rows.\n\nThe minimum-norm solution is x = A^T (A A^T)^(-1) b. Return None if A A^T is singular.",
    starterCode: `def minimum_norm_solution(A, b):
    # Your code here
    pass`,
    solution: `def minimum_norm_solution(A, b):
    m = len(A)
    n = len(A[0])
    G = [[sum(A[i][k] * A[j][k] for k in range(n)) for j in range(m)] for i in range(m)]
    det = G[0][0] * G[1][1] - G[0][1] * G[1][0]
    if abs(det) < 1e-12:
        return None
    y = [(b[0] * G[1][1] - G[0][1] * b[1]) / det,
         (G[0][0] * b[1] - b[0] * G[1][0]) / det]
    return [sum(A[i][k] * y[i] for i in range(m)) for k in range(n)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0]], [2, 3]], expected: [2.0, 3.0, 0.0] },
      { input: [[[1, 1, 1], [1, -1, 0]], [3, 0]], expected: [1.0, 1.0, 1.0] },
      { input: [[[1, 0, 1], [0, 1, 1]], [1, 1]], expected: [0.3333333333333333, 0.3333333333333333, 0.6666666666666666] },
      { input: [[[1, 2, 3], [2, 4, 6]], [1, 2]], expected: null },
      { input: [[[1, 0, 1], [0, 1, 1]], [0, 0]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "The row-space formula picks the solution orthogonal to the null space, which is the shortest one.",
  },
  {
    id: "la-305",
    title: "Modified Gram-Schmidt QR",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the QR decomposition A = Q*R of an n x 3 matrix A with linearly independent columns using modified Gram-Schmidt.\n\nQ is n x 3 with orthonormal columns and R is 3x3 upper triangular: R[k][j] is the projection of column j onto q_k, and R[j][j] is the residual norm. Return None if some column reduces to norm below 1e-12.",
    starterCode: `def modified_gram_schmidt_qr(A):
    # Your code here
    pass`,
    solution: `def modified_gram_schmidt_qr(A):
    n = len(A)
    m = len(A[0])
    Q = [[0.0] * m for _ in range(n)]
    R = [[0.0] * m for _ in range(m)]
    for j in range(m):
        v = [A[i][j] for i in range(n)]
        for k in range(j):
            r = sum(Q[i][k] * v[i] for i in range(n))
            R[k][j] = r
            v = [v[i] - r * Q[i][k] for i in range(n)]
        norm = sum(x * x for x in v) ** 0.5
        if norm < 1e-12:
            return None
        R[j][j] = norm
        for i in range(n):
            Q[i][j] = v[i] / norm
    return [Q, R]`,
    testCases: [
      {
        input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [
          [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
          [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        ],
      },
      {
        input: [[[1, 0, 0], [1, 1, 0], [1, 1, 1]]],
        expected: [
          [
            [0.5773502691896258, -0.8164965809277263, 0.0],
            [0.5773502691896258, 0.4082482904638628, -0.7071067811865476],
            [0.5773502691896258, 0.4082482904638628, 0.7071067811865475],
          ],
          [
            [1.7320508075688772, 1.1547005383792517, 0.5773502691896258],
            [0.0, 0.816496580927726, 0.408248290463863],
            [0.0, 0.0, 0.7071067811865475],
          ],
        ],
      },
      {
        input: [[[1, 1, 0], [0, 1, 1], [1, 0, 1]]],
        expected: [
          [
            [0.7071067811865475, 0.40824829046386313, -0.5773502691896257],
            [0.0, 0.8164965809277261, 0.5773502691896256],
            [0.7071067811865475, -0.40824829046386296, 0.5773502691896258],
          ],
          [
            [1.4142135623730951, 0.7071067811865475, 0.7071067811865475],
            [0.0, 1.224744871391589, 0.40824829046386313],
            [0.0, 0.0, 1.1547005383792515],
          ],
        ],
      },
      { input: [[[1, 0, 0], [2, 0, 0], [0, 1, 1]]], expected: null },
      {
        input: [[[2, 0, 0], [0, 3, 0], [1, 1, 5]]],
        expected: [
          [
            [0.8944271909999159, -0.12777531299998798, -0.4285714285714286],
            [0.0, 0.9583148474999099, -0.28571428571428575],
            [0.4472135954999579, 0.25555062599997597, 0.8571428571428572],
          ],
          [
            [2.23606797749979, 0.4472135954999579, 2.23606797749979],
            [0.0, 3.1304951684997055, 1.2777531299998799],
            [0.0, 0.0, 4.285714285714286],
          ],
        ],
      },
    ],
    hint: "Modified Gram-Schmidt subtracts projections from the current residual rather than the original column.",
  },
  {
    id: "la-306",
    title: "Sum of All Matrix Entries",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Sum every entry of a matrix A.\n\nReturn the total of all elements across all rows and columns. The empty matrix sums to 0.",
    starterCode: `def matrix_entry_sum(A):
    # Your code here
    pass`,
    solution: `def matrix_entry_sum(A):
    return sum(sum(row) for row in A)`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 10 },
      { input: [[[1, -2, 3], [-4, 5, -6]]], expected: -3 },
      { input: [[[7]]], expected: 7 },
      { input: [[[0.5, 1.5], [2.5, 3.5]]], expected: 8.0 },
      { input: [[]], expected: 0 },
    ],
    hint: "Sum each row first, then sum the row totals.",
  },
  {
    id: "la-307",
    title: "Vector Elementwise Maximum",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Take the elementwise maximum of two equal-length vectors.\n\nReturn a list where entry i is max(a[i], b[i]). Ties keep the value from a, which only matters for the exact comparison.",
    starterCode: `def elementwise_max(a, b):
    # Your code here
    pass`,
    solution: `def elementwise_max(a, b):
    return [x if x >= y else y for x, y in zip(a, b)]`,
    testCases: [
      { input: [[1, 2, 3], [4, 0, 3]], expected: [4, 2, 3] },
      { input: [[-1, -5], [-2, -3]], expected: [-1, -3] },
      { input: [[7], [7]], expected: [7] },
      { input: [[2, 2], [2, 2]], expected: [2, 2] },
      { input: [[], []], expected: [] },
    ],
    hint: "Compare paired entries and keep the larger one.",
  },
  {
    id: "la-308",
    title: "Diagonal Matrix Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Check whether a square matrix is diagonal.\n\nReturn True when every off-diagonal entry has absolute value below 1e-9. Diagonal entries themselves can be anything, including zero.",
    starterCode: `def diagonal_matrix_check(A):
    # Your code here
    pass`,
    solution: `def diagonal_matrix_check(A):
    n = len(A)
    for i in range(n):
        for j in range(n):
            if i != j and abs(A[i][j]) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[1, 0], [0, 2]]], expected: true },
      { input: [[[1, 0], [0, 1]]], expected: true },
      { input: [[[1, 1], [0, 1]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: true },
      { input: [[[1, 1e-10, 0], [0, 2, 0], [0, 0, 3]]], expected: true },
    ],
    hint: "Only entries where row index differs from column index need checking.",
  },
  {
    id: "la-309",
    title: "Dot Product of Matrix Columns",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the dot product of columns i and j of a matrix A.\n\nSum the products of paired entries down the two columns. When i = j this returns the squared norm of that column.",
    starterCode: `def matrix_columns_dot(A, i, j):
    # Your code here
    pass`,
    solution: `def matrix_columns_dot(A, i, j):
    return sum(row[i] * row[j] for row in A)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 0, 1], expected: 14 },
      { input: [[[1, 2], [3, 4]], 0, 0], expected: 10 },
      { input: [[[1, 0], [1, 0]], 0, 1], expected: 0 },
      { input: [[[1, 2], [3, 4], [5, 6]], 0, 1], expected: 44 },
    ],
    hint: "Walk down the rows and accumulate row[i] * row[j].",
  },
  {
    id: "la-310",
    title: "Projection Matrix onto Plane",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 3x3 matrix that projects onto the plane through the origin with normal n:\n\nP = I - (n n^T) / (n . n)\n\nReturn None if n is the zero vector. P is symmetric, idempotent, and maps n to zero.",
    starterCode: `def projection_matrix_plane(n):
    # Your code here
    pass`,
    solution: `def projection_matrix_plane(n):
    n2 = sum(x * x for x in n)
    if n2 == 0:
        return None
    return [[(1.0 if i == j else 0.0) - n[i] * n[j] / n2 for j in range(3)]
            for i in range(3)]`,
    testCases: [
      { input: [[0, 0, 1]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]] },
      { input: [[0, 0, 2]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]] },
      {
        input: [[1, 1, 1]],
        expected: [
          [0.6666666666666667, -0.3333333333333333, -0.3333333333333333],
          [-0.3333333333333333, 0.6666666666666667, -0.3333333333333333],
          [-0.3333333333333333, -0.3333333333333333, 0.6666666666666667],
        ],
      },
      { input: [[1, 0, 0]], expected: [[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
      { input: [[0, 0, 0]], expected: null },
    ],
    hint: "Subtract from the identity the rank-1 matrix that projects onto the normal.",
  },
  {
    id: "la-311",
    title: "Least Squares Residual Sum of Squares",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the residual sum of squares for a candidate solution x of A*x = b:\n\nRSS = ||A*x - b||^2\n\nReturn the scalar sum of squared residuals. A zero result means x solves the system exactly.",
    starterCode: `def least_squares_rss(A, b, x):
    # Your code here
    pass`,
    solution: `def least_squares_rss(A, b, x):
    m = len(A)
    n = len(x)
    r = [b[i] - sum(A[i][j] * x[j] for j in range(n)) for i in range(m)]
    return sum(v * v for v in r)`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [2, 3], [2, 3]], expected: 0 },
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3], [0, 1]], expected: 0 },
      { input: [[[1], [1]], [1, 3], [1]], expected: 4 },
      { input: [[[1, 0], [0, 1]], [1, 1], [2, 2]], expected: 2 },
      { input: [[[1, 2], [3, 4]], [0, 0], [0, 0]], expected: 0 },
    ],
    hint: "Form the residual vector first, then square and sum its entries.",
  },
  {
    id: "la-312",
    title: "Singular Values of 3x2 via A^T A",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the two singular values of a 3x2 matrix A as square roots of the eigenvalues of A^T A.\n\nA^T A is 2x2, so its eigenvalues come from the quadratic formula. Return [larger, smaller] as floats, clamping tiny negative numerical eigenvalues to zero.",
    starterCode: `def singular_values_3x2(A):
    # Your code here
    pass`,
    solution: `def singular_values_3x2(A):
    ata = [[sum(A[k][i] * A[k][j] for k in range(len(A))) for j in range(2)] for i in range(2)]
    tr = ata[0][0] + ata[1][1]
    det = ata[0][0] * ata[1][1] - ata[0][1] * ata[1][0]
    disc = tr * tr - 4 * det
    if disc < 0:
        disc = 0.0
    root = disc ** 0.5
    l1 = max(0.0, (tr + root) / 2)
    l2 = max(0.0, (tr - root) / 2)
    return [l1 ** 0.5, l2 ** 0.5]`,
    testCases: [
      { input: [[[1, 0], [0, 1], [0, 0]]], expected: [1.0, 1.0] },
      { input: [[[3, 0], [0, 0], [0, 0]]], expected: [3.0, 0.0] },
      { input: [[[1, 1], [0, 0], [1, 1]]], expected: [2.0, 0.0] },
      { input: [[[1, 0], [1, 0], [0, 1]]], expected: [1.4142135623730951, 1.0] },
      { input: [[[2, 1], [0, 0], [0, 0]]], expected: [2.23606797749979, 0.0] },
    ],
    hint: "Singular values are the square roots of the eigenvalues of the Gram matrix A^T A.",
  },
  {
    id: "la-313",
    title: "Affine Matrix Decomposition",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Split a 3x3 affine matrix into its translation and linear parts.\n\nThe last row must be [0, 0, 1] within 1e-9; otherwise return None. Return [t, L] where t is the translation [M[0][2], M[1][2]] and L is the leading 2x2 block.",
    starterCode: `def affine_matrix_decomposition(M):
    # Your code here
    pass`,
    solution: `def affine_matrix_decomposition(M):
    if abs(M[2][0]) > 1e-9 or abs(M[2][1]) > 1e-9 or abs(M[2][2] - 1.0) > 1e-9:
        return None
    t = [M[0][2], M[1][2]]
    L = [[M[0][0], M[0][1]], [M[1][0], M[1][1]]]
    return [t, L]`,
    testCases: [
      { input: [[[1, 0, 5], [0, 1, -2], [0, 0, 1]]], expected: [[5, -2], [[1, 0], [0, 1]]] },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 1]]], expected: [[0, 0], [[2, 0], [0, 3]]] },
      { input: [[[0, -1, 4], [1, 0, 7], [0, 0, 1]]], expected: [[4, 7], [[0, -1], [1, 0]]] },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: [[0, 0], [[1, 0], [0, 1]]] },
      { input: [[[1, 0, 0], [0, 1, 0], [1, 0, 1]]], expected: null },
    ],
    hint: "The translation lives in the third column; the linear map lives in the top-left 2x2 block.",
  },
  {
    id: "la-314",
    title: "Distance Between Skew Lines",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the distance between two lines in 3D: L1 = p1 + t*d1 and L2 = p2 + s*d2.\n\nUse the common perpendicular direction n = d1 x d2:\n\ndist = |(p2 - p1) . n| / ||n||\n\nReturn None if n is (nearly) zero, meaning the directions are parallel.",
    starterCode: `def distance_skew_lines(p1, d1, p2, d2):
    # Your code here
    pass`,
    solution: `def distance_skew_lines(p1, d1, p2, d2):
    def cross(u, v):
        return [u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]]
    n = cross(d1, d2)
    norm = sum(x * x for x in n) ** 0.5
    if norm < 1e-12:
        return None
    w = [p2[i] - p1[i] for i in range(3)]
    return abs(sum(w[i] * n[i] for i in range(3))) / norm`,
    testCases: [
      { input: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]], expected: 1.0 },
      { input: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [2, 0, 0]], expected: null },
      { input: [[1, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 0]], expected: 1.0 },
      { input: [[0, 0, 0], [1, 0, 0], [0, 0, 0], [0, 1, 0]], expected: 0.0 },
      { input: [[1, 1, 1], [1, 1, 0], [0, 0, 2], [0, 1, 1]], expected: 0.5773502691896258 },
    ],
    hint: "The shortest segment joining two skew lines is parallel to their cross product.",
  },
  {
    id: "la-315",
    title: "Pseudoinverse via Normal Equations",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the Moore-Penrose pseudoinverse of an n x 2 matrix A with independent columns:\n\nA+ = (A^T A)^(-1) A^T\n\nReturn a 2 x n matrix, or None if A^T A is singular.",
    starterCode: `def pseudoinverse_normal(A):
    # Your code here
    pass`,
    solution: `def pseudoinverse_normal(A):
    n = len(A)
    ata = [[sum(A[k][i] * A[k][j] for k in range(n)) for j in range(2)] for i in range(2)]
    det = ata[0][0] * ata[1][1] - ata[0][1] * ata[1][0]
    if abs(det) < 1e-12:
        return None
    inv = [[ata[1][1] / det, -ata[0][1] / det], [-ata[1][0] / det, ata[0][0] / det]]
    return [[sum(inv[i][k] * A[j][k] for k in range(2)) for j in range(n)] for i in range(2)]`,
    testCases: [
      { input: [[[1, 0], [0, 1], [0, 0]]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]] },
      {
        input: [[[1, 1], [0, 1], [1, 0]]],
        expected: [
          [0.3333333333333333, -0.3333333333333333, 0.6666666666666666],
          [0.3333333333333333, 0.6666666666666666, -0.3333333333333333],
        ],
      },
      { input: [[[1, 1], [1, 1], [1, 1]]], expected: null },
      { input: [[[1, 0], [0, 2]]], expected: [[1.0, 0.0], [0.0, 0.5]] },
      {
        input: [[[2, 1], [0, 1], [1, 1]]],
        expected: [
          [0.5, -0.5, 0.0],
          [-0.16666666666666663, 0.8333333333333334, 0.33333333333333337],
        ],
      },
    ],
    hint: "For full column rank, the pseudoinverse is the least squares operator (A^T A)^(-1) A^T.",
  },
  {
    id: "la-316",
    title: "Integer Eigenvectors of 3x3",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Find an integer eigenvector of a 3x3 integer matrix A for each given eigenvalue, in order.\n\nFor each lam, form M = A - lam*I and take the cross product of two rows of M, accepting the first pair whose cross product w satisfies M*w = 0 exactly. Reduce w by the gcd of its entries and flip the sign so its first nonzero entry is positive. Return the list of eigenvectors, or None if some eigenvalue has no such direction.",
    starterCode: `def integer_eigenvectors(A, eigenvalues):
    # Your code here
    pass`,
    solution: `def integer_eigenvectors(A, eigenvalues):
    def cross(u, v):
        return [u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]]
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return abs(a)
    result = []
    for lam in eigenvalues:
        M = [[A[i][j] - (lam if i == j else 0) for j in range(3)] for i in range(3)]
        found = None
        for i, j in ((0, 1), (0, 2), (1, 2)):
            w = cross(M[i], M[j])
            if sum(x * x for x in w) == 0:
                continue
            r = [sum(M[a][k] * w[k] for k in range(3)) for a in range(3)]
            if sum(x * x for x in r) == 0:
                found = w
                break
        if found is None:
            return None
        g = 0
        for x in found:
            g = gcd(g, x)
        w = [x // g for x in found]
        for x in w:
            if x != 0:
                if x < 0:
                    w = [-y for y in w]
                break
        result.append(w)
    return result`,
    testCases: [
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], [2, 3, 4]], expected: [[1, 0, 0], [1, 1, 0], [0, 0, 1]] },
      { input: [[[1, 0, 0], [0, 2, 0], [0, 0, 3]], [3, 2, 1]], expected: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] },
      { input: [[[3, 1, 0], [0, 3, 0], [0, 0, 1]], [1, 3, 3]], expected: [[0, 0, 1], [1, 0, 0], [1, 0, 0]] },
      { input: [[[2, 1, 0], [0, 3, 0], [0, 0, 4]], [2, 3, 5]], expected: null },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 1, 1]], expected: null },
    ],
    hint: "A cross product of two rows of A - lam*I is orthogonal to the row space, so it lies in the null space when the rows span it.",
  },
  {
    id: "la-317",
    title: "Span Membership 3D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Decide whether a vector v lies in the span of a list of 3D vectors.\n\nBuild the augmented matrix with the spanning vectors as columns and v as the last column, then row reduce. Return False if an inconsistent row (all zeros except the last entry) appears, and True otherwise.",
    starterCode: `def span_membership_3d(vectors, v):
    # Your code here
    pass`,
    solution: `def span_membership_3d(vectors, v):
    cols = len(vectors)
    M = [[vectors[j][i] for j in range(cols)] + [v[i]] for i in range(3)]
    rank = 0
    for col in range(cols):
        piv = None
        for r in range(rank, 3):
            if abs(M[r][col]) > 1e-9:
                piv = r
                break
        if piv is None:
            continue
        M[rank], M[piv] = M[piv], M[rank]
        pv = M[rank][col]
        M[rank] = [x / pv for x in M[rank]]
        for r in range(3):
            if r != rank:
                f = M[r][col]
                M[r] = [x - f * y for x, y in zip(M[r], M[rank])]
        rank += 1
    for r in range(3):
        if all(abs(M[r][c]) < 1e-9 for c in range(cols)) and abs(M[r][cols]) > 1e-9:
            return False
    return True`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0]], [0, 0, 1]], expected: false },
      { input: [[[1, 1, 0], [0, 0, 1]], [2, 2, 5]], expected: true },
      { input: [[[1, 1, 0], [0, 0, 1]], [1, 0, 1]], expected: false },
      { input: [[], [0, 0, 0]], expected: true },
      { input: [[[1, 2, 3], [2, 4, 6]], [3, 6, 9]], expected: true },
    ],
    hint: "v is in the span exactly when the augmented system is consistent.",
  },
  {
    id: "la-318",
    title: "Project Point onto Line 3D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Project a point p onto the line through q with direction d in 3D.\n\nThe closest point is q + s*d with s = (p - q) . d / (d . d). Return the projected point as a list, or None if d is the zero vector.",
    starterCode: `def project_point_line_3d(p, q, d):
    # Your code here
    pass`,
    solution: `def project_point_line_3d(p, q, d):
    d2 = sum(x * x for x in d)
    if d2 == 0:
        return None
    s = sum((p[i] - q[i]) * d[i] for i in range(3)) / d2
    return [q[i] + s * d[i] for i in range(3)]`,
    testCases: [
      { input: [[1, 1, 1], [0, 0, 0], [1, 0, 0]], expected: [1.0, 0.0, 0.0] },
      { input: [[2, 3, 4], [1, 1, 1], [1, 1, 1]], expected: [3.0, 3.0, 3.0] },
      { input: [[1, 2, 3], [1, 2, 3], [5, 0, 0]], expected: [1.0, 2.0, 3.0] },
      { input: [[1, 2, 3], [0, 0, 0], [0, 0, 0]], expected: null },
      { input: [[0, 0, 5], [0, 0, 1], [0, 0, 2]], expected: [0.0, 0.0, 5.0] },
    ],
    hint: "The offset from q must be parallel to d, so rescale d by the signed length.",
  },
  {
    id: "la-319",
    title: "Schur Complement Determinant",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the determinant of the 4x4 block matrix [[A, B], [C, D]] using the Schur complement with A as a 2x2 invertible block:\n\ndet = det(A) * det(D - C A^(-1) B)\n\nReturn None if det(A) is zero within 1e-12.",
    starterCode: `def schur_complement_determinant(A, B, C, D):
    # Your code here
    pass`,
    solution: `def schur_complement_determinant(A, B, C, D):
    detA = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if abs(detA) < 1e-12:
        return None
    invA = [[A[1][1] / detA, -A[0][1] / detA], [-A[1][0] / detA, A[0][0] / detA]]
    def mul(X, Y):
        return [[sum(X[i][k] * Y[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    def sub(X, Y):
        return [[X[i][j] - Y[i][j] for j in range(2)] for i in range(2)]
    S = sub(D, mul(mul(C, invA), B))
    detS = S[0][0] * S[1][1] - S[0][1] * S[1][0]
    return detA * detS`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 0], [0, 1]]], expected: 1.0 },
      { input: [[[2, 0], [0, 2]], [[1, 0], [0, 1]], [[0, 0], [0, 0]], [[1, 0], [0, 1]]], expected: 4.0 },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 0]], [[0, 1], [1, 0]], [[2, 0], [0, 2]]], expected: 4.0 },
      { input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]], [[1, 1], [0, 1]], [[0, 0], [0, 0]]], expected: 1.0 },
      { input: [[[1, 1], [2, 2]], [[1, 0], [0, 1]], [[0, 0], [0, 0]], [[1, 0], [0, 1]]], expected: null },
    ],
    hint: "The Schur complement eliminates the top-left block and reduces the 4x4 determinant to a 2x2 one.",
  },
  {
    id: "la-320",
    title: "Null Space Projection 3x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the 3x3 matrix that projects vectors onto the null space of a 3x2 matrix A with independent columns.\n\nThe projector is P = I - A (A^T A)^(-1) A^T, which removes the column-space component. Return None if A^T A is singular.",
    starterCode: `def null_space_projection(A):
    # Your code here
    pass`,
    solution: `def null_space_projection(A):
    n = len(A)
    ata = [[sum(A[k][i] * A[k][j] for k in range(n)) for j in range(2)] for i in range(2)]
    det = ata[0][0] * ata[1][1] - ata[0][1] * ata[1][0]
    if abs(det) < 1e-12:
        return None
    inv = [[ata[1][1] / det, -ata[0][1] / det], [-ata[1][0] / det, ata[0][0] / det]]
    def mul(X, Y):
        return [[sum(X[i][k] * Y[k][j] for k in range(len(Y))) for j in range(len(Y[0]))]
                for i in range(len(X))]
    def transpose(X):
        return [[X[j][i] for j in range(len(X))] for i in range(len(X[0]))]
    AT = transpose(A)
    fitted = mul(mul(A, inv), AT)
    return [[(1.0 if i == j else 0.0) - fitted[i][j] for j in range(3)] for i in range(3)]`,
    testCases: [
      {
        input: [[[1, 0], [0, 1], [0, 0]]],
        expected: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 1.0]],
      },
      {
        input: [[[1, 0], [1, 0], [0, 1]]],
        expected: [[0.5, -0.5, 0.0], [-0.5, 0.5, 0.0], [0.0, 0.0, 0.0]],
      },
      { input: [[[1, 1], [1, 1], [1, 1]]], expected: null },
      {
        input: [[[1, 0], [0, 1], [1, 1]]],
        expected: [
          [0.33333333333333337, 0.3333333333333333, -0.3333333333333333],
          [0.3333333333333333, 0.33333333333333337, -0.3333333333333333],
          [-0.3333333333333333, -0.3333333333333333, 0.33333333333333337],
        ],
      },
      {
        input: [[[0, 1], [0, 0], [1, 0]]],
        expected: [[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]],
      },
    ],
    hint: "The fitted projector A (A^T A)^(-1) A^T is symmetric and idempotent, so P = I - fitted projects onto the orthogonal complement.",
  },
];
