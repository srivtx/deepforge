import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-231",
    title: "PLU Reconstruct Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Verify a PLU factorization: return True if P*A equals L*U entrywise within 1e-9.\n\nP is a permutation matrix, L is unit lower triangular, U is upper triangular, and all matrices are square and the same size.",
    starterCode: `def plu_reconstruct_check(P, L, U, A):
    # Your code here
    pass`,
    solution: `def plu_reconstruct_check(P, L, U, A):
    n = len(A)
    def mul(X, Y):
        return [[sum(X[i][k] * Y[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
    PA = mul(P, A)
    LU = mul(L, U)
    for i in range(n):
        for j in range(n):
            if abs(PA[i][j] - LU[i][j]) > 1e-9:
                return False
    return True`,
    testCases: [
      {
        input: [[[1, 0], [0, 1]], [[1, 0], [0.5, 1]], [[2, 1], [0, 2.5]], [[2, 1], [1, 3]]],
        expected: true,
      },
      {
        input: [[[0, 1], [1, 0]], [[1, 0], [0, 1]], [[3, 4], [1, 2]], [[1, 2], [3, 4]]],
        expected: true,
      },
      {
        input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]], [[1, 2], [3, 4]], [[1, 2], [3, 5]]],
        expected: false,
      },
      {
        input: [[[0, 1], [1, 0]], [[1, 0], [0, 1]], [[1, 2], [3, 4]], [[1, 2], [3, 4]]],
        expected: false,
      },
    ],
    hint: "A valid factorization satisfies P*A = L*U exactly; any mismatch means the factors are wrong.",
  },
  {
    id: "la-232",
    title: "QR Rank-Revealing Diagonal",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Estimate the rank of a matrix from the diagonal of its R factor: count the diagonal entries of R whose absolute value exceeds 1e-9.\n\nR is square, as produced by QR with column pivoting where rank-deficient directions show up as tiny diagonal entries.",
    starterCode: `def rrqr_rank(R):
    # Your code here
    pass`,
    solution: `def rrqr_rank(R):
    return sum(1 for i in range(len(R)) if abs(R[i][i]) > 1e-9)`,
    testCases: [
      { input: [[[1, 2], [0, 3]]], expected: 2 },
      { input: [[[1, 2], [0, 0]]], expected: 1 },
      { input: [[[0, 2], [0, 0]]], expected: 0 },
      { input: [[[2, 0, 1], [0, 0, 3], [0, 0, 0]]], expected: 1 },
    ],
    hint: "Column pivoting pushes dependent directions to the end, making tiny diagonal entries visible.",
  },
  {
    id: "la-233",
    title: "Condition Number from SVD",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the 2-norm condition number of a matrix from its singular values:\n\ncond(A) = sigma_max / sigma_min\n\nReturn None if the smallest singular value is 0, since the matrix would be singular.",
    starterCode: `def condition_from_svd(singular_values):
    # Your code here
    pass`,
    solution: `def condition_from_svd(singular_values):
    smin = min(singular_values)
    smax = max(singular_values)
    if smin <= 0:
        return None
    return smax / smin`,
    testCases: [
      { input: [[5, 2, 1]], expected: 5.0 },
      { input: [[3, 3]], expected: 1.0 },
      { input: [[10, 0]], expected: null },
      { input: [[2]], expected: 1.0 },
    ],
    hint: "The condition number measures how much the matrix can stretch versus shrink vectors.",
  },
  {
    id: "la-234",
    title: "Low-Rank Truncation Error",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the Frobenius norm error of the best rank-r approximation of a matrix, from its singular values:\n\nerror = sqrt(sum of squares of the singular values after the first r)\n\nThis is the Eckart-Young theorem in error form.",
    starterCode: `def low_rank_error(singular_values, r):
    # Your code here
    pass`,
    solution: `def low_rank_error(singular_values, r):
    return sum(s * s for s in singular_values[r:]) ** 0.5`,
    testCases: [
      { input: [[5, 3, 1], 1], expected: 3.1622776601683795 },
      { input: [[5, 3, 1], 0], expected: 5.916079783099616 },
      { input: [[5, 3, 1], 3], expected: 0.0 },
      { input: [[4, 0, 0], 1], expected: 0.0 },
    ],
    hint: "Truncating at r leaves only the tail singular values as error.",
  },
  {
    id: "la-235",
    title: "Multigrid V-Cycle Cost",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Estimate the cost of a multigrid V-cycle given the grid sizes of each level from finest to coarsest.\n\nEach level is visited twice (once going down, once coming up) except the coarsest level, which is solved once. If one visit costs one unit per grid point, the total cost is 2*sum(sizes) - sizes[-1].",
    starterCode: `def v_cycle_cost(levels):
    # Your code here
    pass`,
    solution: `def v_cycle_cost(levels):
    return 2 * sum(levels) - levels[-1]`,
    testCases: [
      { input: [[8, 4, 2]], expected: 26 },
      { input: [[16, 8, 4, 2, 1]], expected: 61 },
      { input: [[1]], expected: 1 },
      { input: [[4, 2]], expected: 10 },
    ],
    hint: "The geometric series keeps the V-cycle cost proportional to the finest level.",
  },
  {
    id: "la-236",
    title: "Matrix-Free Matvec Count",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "In a matrix-free iterative solver, count total matrix-vector products with A.\n\nGiven a list of iteration counts for consecutive solves, each solve uses one matvec per iteration plus one extra to form the initial residual. Return the total count.",
    starterCode: `def matvec_count(iterations_per_solve):
    # Your code here
    pass`,
    solution: `def matvec_count(iterations_per_solve):
    return sum(iterations_per_solve) + len(iterations_per_solve)`,
    testCases: [
      { input: [[10, 5]], expected: 17 },
      { input: [[0]], expected: 1 },
      { input: [[3]], expected: 4 },
      { input: [[1, 1, 1]], expected: 6 },
    ],
    hint: "Each solve pays one residual computation plus one product per iteration.",
  },
  {
    id: "la-237",
    title: "Finite Difference Laplacian Build",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the 1D finite difference Laplacian matrix of size n:\n\ndiagonal entries are 2, the entries just above and below the diagonal are -1, and all others are 0.",
    starterCode: `def laplacian_1d(n):
    # Your code here
    pass`,
    solution: `def laplacian_1d(n):
    return [[2 if i == j else (-1 if abs(i - j) == 1 else 0) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [1], expected: [[2]] },
      { input: [2], expected: [[2, -1], [-1, 2]] },
      { input: [3], expected: [[2, -1, 0], [-1, 2, -1], [0, -1, 2]] },
      {
        input: [4],
        expected: [[2, -1, 0, 0], [-1, 2, -1, 0], [0, -1, 2, -1], [0, 0, -1, 2]],
      },
    ],
    hint: "This matrix discretizes the second derivative on a 1D grid.",
  },
  {
    id: "la-238",
    title: "Cycle Space Dimension",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the dimension of the cycle space of an undirected graph:\n\nm - n + c\n\nwhere m is the number of edges, n the number of vertices, and c the number of connected components. This is the nullity of the incidence matrix.",
    starterCode: `def cycle_space_dimension(num_vertices, edges):
    # Your code here
    pass`,
    solution: `def cycle_space_dimension(num_vertices, edges):
    parent = list(range(num_vertices))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
    comps = len({find(i) for i in range(num_vertices)})
    return len(edges) - num_vertices + comps`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2]]], expected: 0 },
      { input: [5, []], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]], expected: 2 },
    ],
    hint: "Every independent cycle contributes one dimension; a forest has cycle space dimension 0.",
  },
  {
    id: "la-239",
    title: "Cut Space Dimension",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the dimension of the cut space of an undirected graph:\n\nn - c\n\nwhere n is the number of vertices and c the number of connected components. This is the rank of the incidence matrix.",
    starterCode: `def cut_space_dimension(num_vertices, edges):
    # Your code here
    pass`,
    solution: `def cut_space_dimension(num_vertices, edges):
    parent = list(range(num_vertices))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
    comps = len({find(i) for i in range(num_vertices)})
    return num_vertices - comps`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 3 },
      { input: [3, [[0, 1], [1, 2]]], expected: 2 },
      { input: [5, []], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]], expected: 3 },
    ],
    hint: "For a connected graph the cut space dimension is n - 1.",
  },
  {
    id: "la-240",
    title: "M-matrix Inverse Positivity Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if the 2x2 matrix A is invertible and every entry of its inverse is non-negative (at least -1e-9).\n\nSuch matrices are M-matrices, and their inverses are entrywise non-negative under the usual sign conditions.",
    starterCode: `def is_inverse_nonnegative_2x2(A):
    # Your code here
    pass`,
    solution: `def is_inverse_nonnegative_2x2(A):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return False
    inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
    return all(x >= -1e-9 for row in inv for x in row)`,
    testCases: [
      { input: [[[2, -1], [-1, 2]]], expected: true },
      { input: [[[1, 2], [3, 4]]], expected: false },
      { input: [[[4, -1], [-1, 3]]], expected: true },
      { input: [[[1, 1], [1, 1]]], expected: false },
    ],
    hint: "M-matrices have positive diagonal, non-positive off-diagonal, and non-negative inverses.",
  },
  {
    id: "la-241",
    title: "Random Walk Stationary Distribution",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "For a simple random walk on an undirected graph given by adjacency matrix A, return its stationary distribution.\n\nIt is proportional to the degree of each vertex: pi[i] = deg(i) / sum(deg). Return None if every degree is 0.",
    starterCode: `def random_walk_stationary(A):
    # Your code here
    pass`,
    solution: `def random_walk_stationary(A):
    degrees = [sum(row) for row in A]
    total = sum(degrees)
    if total == 0:
        return None
    return [d / total for d in degrees]`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: [0.5, 0.5] },
      { input: [[[0, 1, 1], [1, 0, 0], [1, 0, 0]]], expected: [0.5, 0.25, 0.25] },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]]], expected: [0.25, 0.5, 0.25] },
      { input: [[[0, 0], [0, 0]]], expected: null },
    ],
    hint: "Detailed balance holds because each edge is traversed equally in both directions.",
  },
  {
    id: "la-242",
    title: "Adjacency Eigenvalue Bound Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Check the spectral bound for a graph with adjacency matrix A: every eigenvalue lambda must satisfy |lambda| <= max degree.\n\nReturn True if all given eigenvalues satisfy the bound within 1e-9, otherwise False.",
    starterCode: `def adjacency_bound_holds(A, eigenvalues):
    # Your code here
    pass`,
    solution: `def adjacency_bound_holds(A, eigenvalues):
    max_degree = max(sum(row) for row in A)
    return all(abs(lam) <= max_degree + 1e-9 for lam in eigenvalues)`,
    testCases: [
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], [2, -1, -1]], expected: true },
      { input: [[[0, 1], [1, 0]], [1, -1]], expected: true },
      { input: [[[0, 1], [1, 0]], [3, 0]], expected: false },
      { input: [[[0, 1], [1, 0]], [2, -2]], expected: false },
    ],
    hint: "This bound follows from the Gershgorin circle theorem applied to the adjacency matrix.",
  },
  {
    id: "la-243",
    title: "Spectral Clustering Cut Value",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Given an undirected graph adjacency matrix A and a labeling of its vertices with 0 or 1, return the cut value: the sum of edge weights between vertices with different labels.\n\nCount each undirected edge once.",
    starterCode: `def cut_value(A, labels):
    # Your code here
    pass`,
    solution: `def cut_value(A, labels):
    n = len(A)
    total = 0
    for i in range(n):
        for j in range(i + 1, n):
            if labels[i] != labels[j]:
                total += A[i][j]
    return total`,
    testCases: [
      { input: [[[0, 1, 1], [1, 0, 0], [1, 0, 0]], [0, 1, 1]], expected: 2 },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], [0, 0, 1]], expected: 1 },
      {
        input: [[[0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0]], [0, 0, 1, 1]],
        expected: 2,
      },
      { input: [[[0, 1], [1, 0]], [0, 0]], expected: 0 },
    ],
    hint: "A smaller cut for the same partition sizes indicates a stronger cluster structure.",
  },
  {
    id: "la-244",
    title: "Kernel Matrix RBF Build",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the Gaussian RBF kernel matrix for a list of points:\n\nK[i][j] = exp(-||x_i - x_j||_2^2 / (2 * sigma^2))\n\nThe result is symmetric with ones on the diagonal.",
    starterCode: `def rbf_kernel_matrix(X, sigma):
    # Your code here
    pass`,
    solution: `def rbf_kernel_matrix(X, sigma):
    import math
    n = len(X)
    return [
        [
            math.exp(
                -sum((X[i][t] - X[j][t]) ** 2 for t in range(len(X[0]))) / (2 * sigma * sigma)
            )
            for j in range(n)
        ]
        for i in range(n)
    ]`,
    testCases: [
      { input: [[[0, 0], [1, 0]], 1], expected: [[1.0, 0.6065306597126334], [0.6065306597126334, 1.0]] },
      { input: [[[0], [2]], 2], expected: [[1.0, 0.6065306597126334], [0.6065306597126334, 1.0]] },
      { input: [[[1, 1]], 1], expected: [[1.0]] },
      { input: [[[0, 0], [0, 0]], 1], expected: [[1.0, 1.0], [1.0, 1.0]] },
    ],
    hint: "The kernel is a decreasing function of squared distance; sigma controls the bandwidth.",
  },
  {
    id: "la-245",
    title: "Feature Map Dimension Count",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the dimension of the polynomial feature map of degree at most d in n variables.\n\nIt equals the number of monomials of total degree <= d, which is the binomial coefficient C(n + d, d).",
    starterCode: `def feature_map_dimension(n, d):
    # Your code here
    pass`,
    solution: `def feature_map_dimension(n, d):
    import math
    return math.comb(n + d, d)`,
    testCases: [
      { input: [2, 1], expected: 3 },
      { input: [2, 2], expected: 6 },
      { input: [3, 2], expected: 10 },
      { input: [1, 5], expected: 6 },
    ],
    hint: "This is the stars and bars count of monomials with total degree at most d.",
  },
  {
    id: "la-246",
    title: "Broadcasting Shape Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if two array shapes are compatible for NumPy-style broadcasting.\n\nAlign the shapes from the right; two dimensions are compatible when they are equal or one of them is 1, and missing leading dimensions are treated as 1.",
    starterCode: `def broadcast_ok(shape1, shape2):
    # Your code here
    pass`,
    solution: `def broadcast_ok(shape1, shape2):
    a = list(shape1)
    b = list(shape2)
    n = max(len(a), len(b))
    a = [1] * (n - len(a)) + a
    b = [1] * (n - len(b)) + b
    return all(x == y or x == 1 or y == 1 for x, y in zip(a, b))`,
    testCases: [
      { input: [[3, 1], [1, 4]], expected: true },
      { input: [[3, 4], [3, 4]], expected: true },
      { input: [[3, 4], [2, 4]], expected: false },
      { input: [[5, 1], [5, 3]], expected: true },
    ],
    hint: "Trailing dimensions must match or be 1; a shorter shape is padded with leading ones.",
  },
  {
    id: "la-247",
    title: "LU Pivot Swap Count",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform Gaussian elimination with partial pivoting on A and return the number of row swaps performed.\n\nAt each column choose the row with the largest absolute pivot and swap it into position before eliminating below it. The swap count determines the sign of the permutation in a PLU factorization.",
    starterCode: `def lu_pivot_swaps(A):
    # Your code here
    pass`,
    solution: `def lu_pivot_swaps(A):
    M = [row[:] for row in A]
    n = len(M)
    swaps = 0
    for col in range(n):
        p = max(range(col, n), key=lambda r: abs(M[r][col]))
        if p != col:
            M[col], M[p] = M[p], M[col]
            swaps += 1
        if abs(M[col][col]) < 1e-12:
            break
        for r in range(col + 1, n):
            f = M[r][col] / M[col][col]
            for c in range(col, n):
                M[r][c] -= f * M[col][c]
    return swaps`,
    testCases: [
      { input: [[[2, 1], [1, 3]]], expected: 0 },
      { input: [[[1, 3], [2, 1]]], expected: 1 },
      { input: [[[0, 1], [1, 0]]], expected: 1 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 2 },
    ],
    hint: "Each partial-pivot swap flips the sign of the determinant's permutation factor.",
  },
  {
    id: "la-248",
    title: "RRQR Pivot Selection",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one rank-revealing QR pivot selection step: find the column of A with the largest 2-norm and move it to the first column, shifting the columns before it to the right.\n\nIf several columns tie, choose the leftmost one. Return the reordered matrix.",
    starterCode: `def rrqr_select_column(A):
    # Your code here
    pass`,
    solution: `def rrqr_select_column(A):
    m = len(A)
    n = len(A[0])
    norms = [sum(A[i][j] * A[i][j] for i in range(m)) for j in range(n)]
    best = 0
    for j in range(1, n):
        if norms[j] > norms[best]:
            best = j
    out = [row[:] for row in A]
    if best != 0:
        for i in range(m):
            out[i][0], out[i][best] = out[i][best], out[i][0]
    return out`,
    testCases: [
      { input: [[[1, 0, 3], [0, 1, 4]]], expected: [[3, 0, 1], [4, 1, 0]] },
      { input: [[[2, 1], [0, 0]]], expected: [[2, 1], [0, 0]] },
      { input: [[[1, 2], [0, 0], [0, 0]]], expected: [[2, 1], [0, 0], [0, 0]] },
      { input: [[[0, 1], [1, 0]]], expected: [[0, 1], [1, 0]] },
    ],
    hint: "Moving the largest column to the front maximizes the first pivot in magnitude.",
  },
  {
    id: "la-249",
    title: "SVD Power Iteration for Singular Vectors",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Estimate the dominant singular triple of A with power iteration on B = A^T A.\n\nStart from v = [1, ..., 1] and repeatedly set v = (B*v) / ||B*v||. After num_iterations, set sigma = ||A*v||, u = A*v / sigma, and return [sigma, u, v]. If B*v is ever 0, return [0.0, zeros, zeros].",
    starterCode: `def dominant_singular_triple(A, num_iterations):
    # Your code here
    pass`,
    solution: `def dominant_singular_triple(A, num_iterations):
    n = len(A)
    m = len(A[0])
    B = [[sum(A[t][i] * A[t][j] for t in range(n)) for j in range(m)] for i in range(m)]
    v = [1.0] * m
    for _ in range(num_iterations):
        w = [sum(B[i][j] * v[j] for j in range(m)) for i in range(m)]
        norm = sum(x * x for x in w) ** 0.5
        if norm == 0:
            return [0.0, [0.0] * n, [0.0] * m]
        v = [x / norm for x in w]
    Av = [sum(A[i][j] * v[j] for j in range(m)) for i in range(n)]
    sigma = sum(x * x for x in Av) ** 0.5
    u = [x / sigma for x in Av] if sigma > 0 else [0.0] * n
    return [sigma, u, v]`,
    testCases: [
      { input: [[[3, 0], [0, 1]], 10], expected: [3.0, [1.0, 0.0], [1.0, 0.0]] },
      {
        input: [[[1, 2], [3, 4]], 20],
        expected: [
          5.464985704219043,
          [0.40455358483375686, 0.9145142956773044],
          [0.5760484367663208, 0.8174155604703632],
        ],
      },
      { input: [[[2, 0], [0, 0]], 5], expected: [2.0, [1.0, 0.0], [1.0, 0.0]] },
      {
        input: [[[1, 0], [0, 1]], 10],
        expected: [1.0, [0.7071067811865476, 0.7071067811865476], [0.7071067811865476, 0.7071067811865476]],
      },
    ],
    hint: "The right singular vectors are eigenvectors of A^T A; u is obtained by normalizing A*v.",
  },
  {
    id: "la-250",
    title: "Eckart-Young Rank-r Reconstruction",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Reconstruct the best rank-r approximation of a matrix from its SVD, given as U (m x k with singular vectors as columns), singular values S, and V (k right singular vectors of length n).\n\nReturn the sum over t < r of S[t] * outer(U[:, t], V[t]).",
    starterCode: `def eckart_young_rank_r(U, S, V, r):
    # Your code here
    pass`,
    solution: `def eckart_young_rank_r(U, S, V, r):
    m = len(U)
    n = len(V[0])
    out = [[0.0] * n for _ in range(m)]
    for t in range(min(r, len(S))):
        for i in range(m):
            for j in range(n):
                out[i][j] += S[t] * U[i][t] * V[t][j]
    return out`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [3, 1], [[1, 0], [0, 1]], 1], expected: [[3.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 0], [0, 1]], [3, 1], [[1, 0], [0, 1]], 2], expected: [[3.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]], [2, 0], [[1, 0], [0, 1]], 1], expected: [[2.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 0], [0, 1]], [3, 1], [[1, 0], [0, 1]], 0], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Keeping the first r singular triples minimizes the Frobenius error among rank-r matrices.",
  },
  {
    id: "la-251",
    title: "Pseudoinverse via SVD Formula",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the Moore-Penrose pseudoinverse from an SVD, given U (m x k, singular vectors as columns), singular values S, and V (k x n, right singular vectors as rows so V[t] is a vector of length n).\n\nReturn A+ = sum over t of (1/S[t]) * outer(V[t], U[:, t]), skipping singular values at most 1e-12.",
    starterCode: `def pinv_from_svd(U, S, V):
    # Your code here
    pass`,
    solution: `def pinv_from_svd(U, S, V):
    m = len(U)
    n = len(V)
    out = [[0.0] * m for _ in range(n)]
    for t in range(len(S)):
        if S[t] > 1e-12:
            inv = 1.0 / S[t]
            for i in range(n):
                for j in range(m):
                    out[i][j] += inv * V[t][i] * U[j][t]
    return out`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [3, 1], [[1, 0], [0, 1]]], expected: [[0.3333333333333333, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]], [2, 0], [[1, 0], [0, 1]]], expected: [[0.5, 0.0], [0.0, 0.0]] },
      { input: [[[1, 0], [0, 1]], [1, 1], [[0, 1], [1, 0]]], expected: [[0.0, 1.0], [1.0, 0.0]] },
      { input: [[[1, 0], [0, 1]], [0, 0], [[1, 0], [0, 1]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "The pseudoinverse inverts nonzero singular values and formally zeros out the rest.",
  },
  {
    id: "la-252",
    title: "Krylov Subspace Dimension",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the dimension of the Krylov subspace spanned by v, A*v, A^2*v, ... for matrix A and starting vector v.\n\nAdd vectors until the rank of the collected set stops increasing, using a tolerance of 1e-9; the dimension is at most n.",
    starterCode: `def krylov_dimension(A, v):
    # Your code here
    pass`,
    solution: `def krylov_dimension(A, v):
    n = len(v)
    def rank(vecs):
        M = [row[:] for row in vecs]
        rows = len(M)
        cols = len(M[0])
        r = 0
        for c in range(cols):
            pivot = -1
            for i in range(r, rows):
                if abs(M[i][c]) > 1e-9:
                    pivot = i
                    break
            if pivot == -1:
                continue
            M[r], M[pivot] = M[pivot], M[r]
            for i in range(r + 1, rows):
                f = M[i][c] / M[r][c]
                for j in range(c, cols):
                    M[i][j] -= f * M[r][j]
            r += 1
        return r
    cur = [float(x) for x in v]
    vecs = []
    for k in range(1, n + 1):
        vecs.append(cur)
        if rank(vecs) < k:
            return k - 1
        cur = [sum(A[i][j] * cur[j] for j in range(n)) for i in range(n)]
    return n`,
    testCases: [
      { input: [[[2, 0], [0, 2]], [1, 0]], expected: 1 },
      { input: [[[0, 1], [0, 0]], [0, 1]], expected: 2 },
      { input: [[[1, 0], [0, 1]], [1, 1]], expected: 1 },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 4]], [1, 1, 1]], expected: 3 },
    ],
    hint: "The Krylov dimension is the degree of the minimal polynomial of A with respect to v.",
  },
  {
    id: "la-253",
    title: "Chebyshev Iteration Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Perform one Chebyshev (optimal Richardson) iteration step for A*x = b given the spectral interval [lam_min, lam_max] of A.\n\nThe optimal constant step is tau = 2 / (lam_min + lam_max). Return [tau, x + tau*(b - A*x)].",
    starterCode: `def chebyshev_step(A, b, x, lam_min, lam_max):
    # Your code here
    pass`,
    solution: `def chebyshev_step(A, b, x, lam_min, lam_max):
    n = len(b)
    tau = 2.0 / (lam_min + lam_max)
    r = [b[i] - sum(A[i][j] * x[j] for j in range(n)) for i in range(n)]
    return [tau, [x[i] + tau * r[i] for i in range(n)]]`,
    testCases: [
      { input: [[[4, 1], [1, 3]], [1, 2], [0, 0], 2, 6], expected: [0.25, [0.25, 0.5]] },
      { input: [[[1, 0], [0, 1]], [2, 4], [1, 1], 1, 1], expected: [1.0, [2.0, 4.0]] },
      { input: [[[2, 0], [0, 2]], [0, 0], [1, 2], 1, 3], expected: [0.5, [0.0, 0.0]] },
      { input: [[[3, 0], [0, 5]], [3, 5], [0, 0], 3, 5], expected: [0.25, [0.75, 1.25]] },
    ],
    hint: "The optimal step is the reciprocal of the midpoint of the spectrum.",
  },
  {
    id: "la-254",
    title: "Incomplete LU Step",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the diagonal of U in the ILU(0) factorization of a tridiagonal matrix A.\n\nSet u[0] = A[0][0], then for each i > 0 use multiplier l = A[i][i-1] / u[i-1] and u[i] = A[i][i] - l * A[i-1][i]. Return the list of u values.",
    starterCode: `def ilu0_tridiagonal(A):
    # Your code here
    pass`,
    solution: `def ilu0_tridiagonal(A):
    n = len(A)
    u = [0.0] * n
    u[0] = A[0][0]
    for i in range(1, n):
        l = A[i][i - 1] / u[i - 1]
        u[i] = A[i][i] - l * A[i - 1][i]
    return u`,
    testCases: [
      { input: [[[4, 1, 0], [1, 4, 1], [0, 1, 4]]], expected: [4.0, 3.75, 3.7333333333333334] },
      { input: [[[2, 0], [0, 2]]], expected: [2.0, 2.0] },
      { input: [[[1, 1], [1, 2]]], expected: [1.0, 1.0] },
      { input: [[[4, 2], [2, 5]]], expected: [4.0, 4.0] },
    ],
    hint: "ILU(0) keeps the sparsity pattern of A while producing approximate factors.",
  },
  {
    id: "la-255",
    title: "Coarse-Grid Correction",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply a coarse-grid correction to the current fine-grid iterate x.\n\nSolve the coarse problem e = A_coarse_inv * r_coarse for the error, prolong it with x_new = x + P*e, and return the corrected vector.",
    starterCode: `def coarse_grid_correction(x, P, A_coarse_inv, r_coarse):
    # Your code here
    pass`,
    solution: `def coarse_grid_correction(x, P, A_coarse_inv, r_coarse):
    m = len(r_coarse)
    e = [sum(A_coarse_inv[i][j] * r_coarse[j] for j in range(m)) for i in range(m)]
    n = len(x)
    return [x[i] + sum(P[i][j] * e[j] for j in range(m)) for i in range(n)]`,
    testCases: [
      { input: [[1, 1], [[1], [0]], [[0.5]], [2]], expected: [2.0, 1.0] },
      { input: [[0, 0, 0], [[1], [0], [0]], [[2]], [1]], expected: [2.0, 0.0, 0.0] },
      { input: [[1, 2], [[1, 0], [0, 1]], [[1, 0], [0, 0.5]], [1, 2]], expected: [2.0, 3.0] },
      { input: [[0, 0], [[1], [1]], [[1]], [0]], expected: [0.0, 0.0] },
    ],
    hint: "The correction removes the smooth part of the error that the fine smoother cannot fix.",
  },
  {
    id: "la-256",
    title: "Stencil Operator Apply",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the 5-point Laplacian stencil to a 2D grid u with zero Dirichlet boundary:\n\n(Au)[i][j] = 4*u[i][j] - u[i-1][j] - u[i+1][j] - u[i][j-1] - u[i][j+1]\n\nOut-of-grid neighbors are treated as 0. Return the resulting matrix.",
    starterCode: `def apply_laplacian_stencil(u):
    # Your code here
    pass`,
    solution: `def apply_laplacian_stencil(u):
    n = len(u)
    out = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            s = 4 * u[i][j]
            if i > 0:
                s -= u[i - 1][j]
            if i < n - 1:
                s -= u[i + 1][j]
            if j > 0:
                s -= u[i][j - 1]
            if j < n - 1:
                s -= u[i][j + 1]
            out[i][j] = float(s)
    return out`,
    testCases: [
      { input: [[[1]]], expected: [[4.0]] },
      { input: [[[1, 0], [0, 0]]], expected: [[4.0, -1.0], [-1.0, 0.0]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[2.0, 2.0], [2.0, 2.0]] },
    ],
    hint: "The stencil is the discrete counterpart of the 2D Laplacian operator.",
  },
  {
    id: "la-257",
    title: "Normalized Graph Laplacian",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the symmetric normalized Laplacian of an undirected graph with adjacency matrix A:\n\nL = I - D^(-1/2) * A * D^(-1/2)\n\nwhere D is the degree matrix. Isolated vertices (degree 0) contribute a zero row and column.",
    starterCode: `def normalized_laplacian(A):
    # Your code here
    pass`,
    solution: `def normalized_laplacian(A):
    n = len(A)
    deg = [sum(row) for row in A]
    out = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j and deg[i] > 0:
                out[i][j] = 1.0
            if deg[i] > 0 and deg[j] > 0 and A[i][j] != 0:
                out[i][j] -= A[i][j] / (deg[i] ** 0.5 * deg[j] ** 0.5)
    return out`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: [[1.0, -1.0], [-1.0, 1.0]] },
      {
        input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]]],
        expected: [
          [1.0, -0.7071067811865475, 0.0],
          [-0.7071067811865475, 1.0, -0.7071067811865475],
          [0.0, -0.7071067811865475, 1.0],
        ],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      {
        input: [[[0, 1, 0], [1, 0, 0], [0, 0, 0]]],
        expected: [[1.0, -1.0, 0.0], [-1.0, 1.0, 0.0], [0.0, 0.0, 0.0]],
      },
    ],
    hint: "The normalized Laplacian has eigenvalues in [0, 2] and is scale-invariant.",
  },
  {
    id: "la-258",
    title: "Incidence Matrix Build",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the oriented incidence matrix B of an undirected graph: rows are vertices and columns are edges.\n\nFor edge e = (a, b), set B[a][e] = -1 and B[b][e] = 1, and leave all other entries 0.",
    starterCode: `def incidence_matrix(num_vertices, edges):
    # Your code here
    pass`,
    solution: `def incidence_matrix(num_vertices, edges):
    B = [[0] * len(edges) for _ in range(num_vertices)]
    for e in range(len(edges)):
        a, b = edges[e]
        B[a][e] = -1
        B[b][e] = 1
    return B`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[-1, 0], [1, -1], [0, 1]] },
      { input: [2, [[0, 1]]], expected: [[-1], [1]] },
      { input: [3, [[0, 1], [0, 2], [1, 2]]], expected: [[-1, -1, 0], [1, 0, -1], [0, 1, 1]] },
      { input: [3, [[0, 2]]], expected: [[-1], [0], [1]] },
    ],
    hint: "Each column has exactly one +1 and one -1, so the all-ones vector is always in its left null space.",
  },
  {
    id: "la-259",
    title: "Spanning Tree Count via Determinant",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Count the spanning trees of a connected undirected graph using the Matrix-Tree theorem.\n\nBuild the Laplacian L = D - A, delete its last row and column, and return the determinant of the resulting (n-1) x (n-1) minor.",
    starterCode: `def spanning_tree_count(num_vertices, edges):
    # Your code here
    pass`,
    solution: `def spanning_tree_count(num_vertices, edges):
    n = num_vertices
    L = [[0] * n for _ in range(n)]
    for a, b in edges:
        L[a][a] += 1
        L[b][b] += 1
        L[a][b] -= 1
        L[b][a] -= 1
    M = [row[:n - 1] for row in L[:n - 1]]
    def det(X):
        k = len(X)
        if k == 0:
            return 1
        if k == 1:
            return X[0][0]
        total = 0
        for j in range(k):
            minor = [[X[r][c] for c in range(k) if c != j] for r in range(1, k)]
            total += ((-1) ** j) * X[0][j] * det(minor)
        return total
    return det(M)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 4 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 16 },
    ],
    hint: "Cayley's formula says the complete graph on n vertices has n^(n-2) spanning trees.",
  },
  {
    id: "la-260",
    title: "Perron Eigenvector Sign Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Run power iteration on A starting from the all-ones vector for num_iterations steps, then return True only if every component of the final unit vector is positive (greater than 1e-9).\n\nFor positive matrices the Perron-Frobenius theorem guarantees a positive dominant eigenvector; other matrices may fail this test.",
    starterCode: `def perron_eigenvector_sign(A, num_iterations):
    # Your code here
    pass`,
    solution: `def perron_eigenvector_sign(A, num_iterations):
    n = len(A)
    v = [1.0] * n
    for _ in range(num_iterations):
        w = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
        norm = sum(x * x for x in w) ** 0.5
        if norm == 0:
            return False
        v = [x / norm for x in w]
    return all(x > 1e-9 for x in v)`,
    testCases: [
      { input: [[[2, 1], [1, 2]], 20], expected: true },
      { input: [[[1, 1], [1, 1]], 10], expected: true },
      { input: [[[1, 0], [0, -2]], 3], expected: false },
      { input: [[[0, 1], [1, 0]], 9], expected: true },
    ],
    hint: "Sign flips between iterations indicate that the dominant eigenvalue is negative or the matrix is not positive.",
  },
  {
    id: "la-261",
    title: "Fiedler Vector Sign Partition",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Partition the vertices of a graph using the signs of its Fiedler vector v.\n\nReturn [part0, part1], where part0 contains the indices with v[i] >= 0 and part1 the indices with v[i] < 0, both sorted in ascending order.",
    starterCode: `def fiedler_partition(v):
    # Your code here
    pass`,
    solution: `def fiedler_partition(v):
    part0 = [i for i in range(len(v)) if v[i] >= 0]
    part1 = [i for i in range(len(v)) if v[i] < 0]
    return [part0, part1]`,
    testCases: [
      { input: [[0.1, -0.2, 0.3, -0.4]], expected: [[0, 2], [1, 3]] },
      { input: [[1, 2, 3]], expected: [[0, 1, 2], []] },
      { input: [[-1, -2]], expected: [[], [0, 1]] },
      { input: [[0.0, 0.0]], expected: [[0, 1], []] },
    ],
    hint: "The sign pattern of the Fiedler vector gives a good 2-way spectral partition.",
  },
  {
    id: "la-262",
    title: "PSD Kernel Check 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if the 2x2 matrix K is a valid positive semidefinite kernel matrix: symmetric within 1e-9, trace >= 0, and determinant >= -1e-9.\n\nOtherwise return False.",
    starterCode: `def is_psd_kernel_2x2(K):
    # Your code here
    pass`,
    solution: `def is_psd_kernel_2x2(K):
    if abs(K[0][1] - K[1][0]) > 1e-9:
        return False
    trace = K[0][0] + K[1][1]
    det = K[0][0] * K[1][1] - K[0][1] * K[1][0]
    return trace >= -1e-9 and det >= -1e-9`,
    testCases: [
      { input: [[[1, 0.5], [0.5, 1]]], expected: true },
      { input: [[[1, 2], [2, 1]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: true },
      { input: [[[1, 2], [3, 1]]], expected: false },
    ],
    hint: "For a 2x2 symmetric matrix, PSD is equivalent to non-negative trace and determinant.",
  },
  {
    id: "la-263",
    title: "Representer Theorem Weight Solve",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the regularized kernel system (K + lam*I) * alpha = y for the 2x2 kernel matrix K.\n\nReturn the coefficient vector alpha as floats; these are the weights the representer theorem assigns to the training points.",
    starterCode: `def representer_weights(K, y, lam):
    # Your code here
    pass`,
    solution: `def representer_weights(K, y, lam):
    G = [[K[i][j] + (lam if i == j else 0) for j in range(2)] for i in range(2)]
    det = G[0][0] * G[1][1] - G[0][1] * G[1][0]
    return [
        (G[1][1] * y[0] - G[0][1] * y[1]) / det,
        (-G[1][0] * y[0] + G[0][0] * y[1]) / det,
    ]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 2], 0], expected: [1.0, 2.0] },
      { input: [[[1, 0.5], [0.5, 1]], [1, 0], 1], expected: [0.5333333333333333, -0.13333333333333333] },
      { input: [[[2, 0], [0, 2]], [2, 4], 2], expected: [0.5, 1.0] },
      { input: [[[1, 0], [0, 1]], [0, 0], 1], expected: [0.0, 0.0] },
    ],
    hint: "The ridge penalty lam keeps the kernel system well-conditioned.",
  },
  {
    id: "la-264",
    title: "Tensor Matricization Unfold",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the mode-1 unfolding of a 2x2x2 tensor T, indexed as T[i][j][k].\n\nThe unfolding has one row per mode-1 index i, with the remaining indices flattened in row-major order: U[i][j * 2 + k] = T[i][j][k].",
    starterCode: `def unfold_mode1(T):
    # Your code here
    pass`,
    solution: `def unfold_mode1(T):
    return [[x for row in T[i] for x in row] for i in range(len(T))]`,
    testCases: [
      { input: [[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]], expected: [[1, 2, 3, 4], [5, 6, 7, 8]] },
      { input: [[[[1, 0], [0, 1]], [[2, 0], [0, 2]]]], expected: [[1, 0, 0, 1], [2, 0, 0, 2]] },
      { input: [[[[1, 1], [1, 1]], [[1, 1], [1, 1]]]], expected: [[1, 1, 1, 1], [1, 1, 1, 1]] },
      { input: [[[[0, 1], [2, 3]], [[4, 5], [6, 7]]]], expected: [[0, 1, 2, 3], [4, 5, 6, 7]] },
    ],
    hint: "Matricization turns a tensor into a matrix so standard linear algebra can be applied to one mode.",
  },
  {
    id: "la-265",
    title: "Tensor Contraction Cost",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Count the scalar multiplications needed to contract two tensors: tensor 1 with the given shape contracts its dimension axis1 with dimension axis2 of tensor 2.\n\nThe cost is (product of all dimensions of shape1) * (product of the free dimensions of shape2).",
    starterCode: `def contraction_cost(shape1, shape2, axis1, axis2):
    # Your code here
    pass`,
    solution: `def contraction_cost(shape1, shape2, axis1, axis2):
    p1 = 1
    for d in shape1:
        p1 *= d
    p2 = 1
    for i in range(len(shape2)):
        if i != axis2:
            p2 *= shape2[i]
    return p1 * p2`,
    testCases: [
      { input: [[2, 3], [3, 4], 1, 0], expected: 24 },
      { input: [[5, 2], [2, 2], 1, 0], expected: 20 },
      { input: [[2, 2, 2], [2, 2], 2, 0], expected: 16 },
      { input: [[1, 1], [1, 1], 0, 0], expected: 1 },
    ],
    hint: "Matrix multiplication is the special case m*k times k*n, costing m*k*n multiplications.",
  },
  {
    id: "la-266",
    title: "Memory Layout Contiguity",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if an array with the given shape and strides is C-contiguous (row-major).\n\nRow-major strides satisfy stride[-1] = 1 and stride[i] = stride[i+1] * shape[i+1]. Dimensions of size 1 may have any stride and are ignored.",
    starterCode: `def is_c_contiguous(shape, strides):
    # Your code here
    pass`,
    solution: `def is_c_contiguous(shape, strides):
    expected = [0] * len(shape)
    acc = 1
    for i in range(len(shape) - 1, -1, -1):
        expected[i] = acc
        acc *= shape[i]
    for i in range(len(shape)):
        if shape[i] != 1 and strides[i] != expected[i]:
            return False
    return True`,
    testCases: [
      { input: [[2, 3], [3, 1]], expected: true },
      { input: [[2, 3], [1, 2]], expected: false },
      { input: [[3, 1], [1, 5]], expected: true },
      { input: [[], []], expected: true },
    ],
    hint: "Transposing a matrix typically changes its layout from C-contiguous to non-contiguous views.",
  },
  {
    id: "la-267",
    title: "One-Sided Jacobi SVD Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the rotation parameters [c, s] of a one-sided Jacobi step that orthogonalizes two column vectors p and q.\n\nWith a = p.p, b = q.q, d = p.q, set zeta = (b - a) / (2d), t = sign(zeta) / (|zeta| + sqrt(1 + zeta^2)), c = 1 / sqrt(1 + t^2), and s = c*t. Return [1.0, 0.0] when d == 0.",
    starterCode: `def jacobi_orthogonalize(p, q):
    # Your code here
    pass`,
    solution: `def jacobi_orthogonalize(p, q):
    a = sum(x * x for x in p)
    b = sum(x * x for x in q)
    d = sum(x * y for x, y in zip(p, q))
    if d == 0:
        return [1.0, 0.0]
    zeta = (b - a) / (2 * d)
    t = (1.0 if zeta >= 0 else -1.0) / (abs(zeta) + (1 + zeta * zeta) ** 0.5)
    c = 1.0 / (1 + t * t) ** 0.5
    return [c, c * t]`,
    testCases: [
      { input: [[1, 1], [1, 0]], expected: [0.8506508083520399, -0.5257311121191335] },
      { input: [[1, 0], [0, 1]], expected: [1.0, 0.0] },
      { input: [[2, 1], [1, 2]], expected: [0.7071067811865475, 0.7071067811865475] },
      { input: [[1, 1], [1, -1]], expected: [1.0, 0.0] },
    ],
    hint: "Applying the rotation (p, q) -> (c*p - s*q, s*p + c*q) makes the two columns orthogonal.",
  },
  {
    id: "la-268",
    title: "Golub-Kahan Bidiagonalization Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one Golub-Kahan bidiagonalization step on a 3x3 matrix A.\n\nFirst build the Householder vector for column 0 with alpha = -sign(A[0][0]) * ||column||, apply H = I - 2*v*v^T on the left to zero the entries below A[0][0]. Then build the Householder vector for row 0 restricted to columns 1..2 and apply the corresponding reflection on the right to zero A[0][2]. Return the transformed matrix.",
    starterCode: `def bidiagonal_step(A):
    # Your code here
    pass`,
    solution: `def bidiagonal_step(A):
    m = len(A)
    n = len(A[0])
    B = [row[:] for row in A]
    col = [B[i][0] for i in range(m)]
    norm = sum(x * x for x in col) ** 0.5
    if norm > 0:
        sign = 1.0 if col[0] >= 0 else -1.0
        alpha = -sign * norm
        v = list(col)
        v[0] -= alpha
        nv = sum(t * t for t in v) ** 0.5
        v = [t / nv for t in v]
        H = [[(1.0 if i == j else 0.0) - 2 * v[i] * v[j] for j in range(m)] for i in range(m)]
        B = [[sum(H[i][k] * B[k][j] for k in range(m)) for j in range(n)] for i in range(m)]
    row = B[0][1:]
    norm = sum(x * x for x in row) ** 0.5
    if norm > 0:
        sign = 1.0 if row[0] >= 0 else -1.0
        alpha = -sign * norm
        u = list(row)
        u[0] -= alpha
        nu = sum(t * t for t in u) ** 0.5
        u = [t / nu for t in u]
        Q = [[(1.0 if i == j else 0.0) - 2 * u[i] * u[j] for j in range(n - 1)] for i in range(n - 1)]
        out = [r[:] for r in B]
        for i in range(m):
            for jj in range(n - 1):
                out[i][1 + jj] = sum(B[i][1 + k] * Q[k][jj] for k in range(n - 1))
        B = out
    return B`,
    testCases: [
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [
          [-8.12403840463596, 14.659777996582722, 0.0],
          [0.0, 0.18622796258629076, -0.0476397113592843],
          [0.0, 1.9506304625241173, -0.4989984904131466],
        ],
      },
      {
        input: [[[2, 1, 0], [1, 3, 1], [0, 1, 2]]],
        expected: [
          [-2.23606797749979, 2.280350850198276, 0.0],
          [0.0, -2.368056652128979, 0.4385290096535146],
          [0.0, -1.3728129459672882, 1.7650452162436563],
        ],
      },
      {
        input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [[-1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
      },
      {
        input: [[[4, 1, 2], [1, 3, 0], [2, 0, 5]]],
        expected: [
          [-4.58257569495584, 4.214487485081046, 0.0],
          [0.0, -0.336871404178687, -2.771882313769431],
          [0.0, -3.1590885991341624, 1.8604947074836544],
        ],
      },
    ],
    hint: "Alternating left and right Householder reflections reduces a matrix toward bidiagonal form.",
  },
  {
    id: "la-269",
    title: "Total Least Squares Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the total least squares solution for A*x = b (with A of shape n x 2) from the smallest right singular vector v of the augmented matrix [A | b]:\n\nx = -v[0:2] / v[2]\n\nReturn None if v[2] is 0 within 1e-12, since the problem is then not solvable by TLS.",
    starterCode: `def tls_step(A, b, v_smallest):
    # Your code here
    pass`,
    solution: `def tls_step(A, b, v_smallest):
    if abs(v_smallest[2]) < 1e-12:
        return None
    return [-v_smallest[0] / v_smallest[2], -v_smallest[1] / v_smallest[2]]`,
    testCases: [
      {
        input: [
          [[1, 0], [0, 1], [1, 1]],
          [1, 2, 3],
          [-0.4082482904638631, -0.816496580927726, 0.4082482904638631],
        ],
        expected: [1.0, 2.0],
      },
      {
        input: [
          [[1, 0], [0, 1]],
          [2, 3],
          [-0.5345224838248488, -0.8017837257372732, 0.2672612419124244],
        ],
        expected: [2.0, 3.0],
      },
      { input: [[[1, 0], [0, 1]], [1, 1], [1, 0, 0]], expected: null },
      {
        input: [
          [[1, 1], [1, 2], [1, 3]],
          [1, 2, 3],
          [0.0, -0.7071067811865475, 0.7071067811865475],
        ],
        expected: [0.0, 1.0],
      },
    ],
    hint: "TLS minimizes the orthogonal distance to the data and reduces to the last singular vector's null direction.",
  },
  {
    id: "la-270",
    title: "Procrustes Rotation via SVD",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Given U and V from the SVD of the cross-covariance M = U*S*V^T, return the optimal orthogonal Procrustes rotation:\n\nR = U * diag(1, det(U*V^T)) * V^T\n\nThe determinant correction guarantees det(R) = 1, ruling out reflections.",
    starterCode: `def procrustes_rotation(U, V):
    # Your code here
    pass`,
    solution: `def procrustes_rotation(U, V):
    def mul(X, Y):
        return [[sum(X[i][k] * Y[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    def transpose(X):
        return [[X[j][i] for j in range(2)] for i in range(2)]
    VT = transpose(V)
    R0 = mul(U, VT)
    det = R0[0][0] * R0[1][1] - R0[0][1] * R0[1][0]
    if det < 0:
        D = [[1.0, 0.0], [0.0, -1.0]]
        return mul(mul(U, D), VT)
    return R0`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0], [0, 1]], [[0, -1], [1, 0]]], expected: [[0.0, 1.0], [-1.0, 0.0]] },
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, -1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0, 1], [1, 0]], [[0, 1], [1, 0]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Without the determinant correction, the SVD solution could be a reflection.",
  },
  {
    id: "la-271",
    title: "Orthogonal Iteration Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one step of orthogonal iteration (subspace iteration) on A with orthogonal matrix Q:\n\nCompute Z = A*Q, then orthonormalize the columns of Z with Gram-Schmidt and return the new orthogonal matrix Q_new.",
    starterCode: `def orthogonal_iteration_step(A, Q):
    # Your code here
    pass`,
    solution: `def orthogonal_iteration_step(A, Q):
    n = len(A)
    Z = [[sum(A[i][k] * Q[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
    basis = []
    for j in range(n):
        w = [Z[i][j] for i in range(n)]
        for b in basis:
            proj = sum(x * y for x, y in zip(w, b))
            w = [x - proj * y for x, y in zip(w, b)]
        norm = sum(x * x for x in w) ** 0.5
        basis.append([x / norm for x in w])
    return [[basis[j][i] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[2, 0], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 1], [0, 1]], [[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0, 1], [1, 0]], [[1, 0], [0, 1]]], expected: [[0.0, 1.0], [1.0, 0.0]] },
    ],
    hint: "Repeated orthogonal iteration converges to the dominant invariant subspace.",
  },
  {
    id: "la-272",
    title: "Lanczos Tridiagonal Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one Lanczos iteration step for symmetric A and unit vector v.\n\nCompute alpha = v^T * A * v, the residual w = A*v - alpha*v, and beta = ||w||_2. Return [alpha, beta].",
    starterCode: `def lanczos_step(A, v):
    # Your code here
    pass`,
    solution: `def lanczos_step(A, v):
    n = len(v)
    Av = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
    alpha = sum(v[i] * Av[i] for i in range(n))
    w = [Av[i] - alpha * v[i] for i in range(n)]
    beta = sum(x * x for x in w) ** 0.5
    return [alpha, beta]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [1, 0]], expected: [2.0, 0.0] },
      {
        input: [[[2, 0], [0, 3]], [0.7071067811865475, 0.7071067811865475]],
        expected: [2.5, 0.5],
      },
      { input: [[[2, 1], [1, 2]], [1, 0]], expected: [2.0, 1.0] },
      {
        input: [
          [[1, 0, 0], [0, 2, 0], [0, 0, 3]],
          [0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
        ],
        expected: [2.0, 0.816496580927726],
      },
    ],
    hint: "The alpha and beta values form the diagonal and off-diagonal of the tridiagonal Lanczos matrix.",
  },
  {
    id: "la-273",
    title: "Arnoldi Hessenberg Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one Arnoldi iteration step for matrix A and an orthonormal basis Q (list of orthonormal vectors).\n\nLet q be the last vector of Q, compute w = A*q, subtract the projections h[i] = Q[i].w from w, and return [h, beta] where beta = ||w||_2 after orthogonalization.",
    starterCode: `def arnoldi_step(A, Q):
    # Your code here
    pass`,
    solution: `def arnoldi_step(A, Q):
    n = len(A)
    q = Q[-1]
    w = [sum(A[i][j] * q[j] for j in range(n)) for i in range(n)]
    h = []
    for b in Q:
        hh = sum(b[i] * w[i] for i in range(n))
        h.append(hh)
        w = [w[i] - hh * b[i] for i in range(n)]
    beta = sum(x * x for x in w) ** 0.5
    return [h, beta]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[1, 0]]], expected: [[2.0], 0.0] },
      { input: [[[1, 2], [3, 4]], [[1, 0]]], expected: [[1.0], 3.0] },
      {
        input: [[[1, 2], [3, 4]], [[0.7071067811865475, 0.7071067811865475]]],
        expected: [[5.0], 2.0],
      },
      { input: [[[2, 1], [1, 2]], [[1, 0], [0, 1]]], expected: [[1.0, 2.0], 0.0] },
    ],
    hint: "The coefficients h fill one column of the upper Hessenberg matrix produced by Arnoldi.",
  },
  {
    id: "la-274",
    title: "Effective Resistance via Pseudoinverse",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the effective resistance between vertices i and j of an undirected graph given by adjacency matrix A.\n\nBuild the Laplacian L = D - A, compute its pseudoinverse with the formula L+ = inv(L + J/n) - J/n where J is the all-ones matrix, and return L+[i][i] + L+[j][j] - 2*L+[i][j]. Assume the graph is connected.",
    starterCode: `def effective_resistance(A, i, j):
    # Your code here
    pass`,
    solution: `def effective_resistance(A, i, j):
    n = len(A)
    deg = [sum(row) for row in A]
    L = [[(deg[r] if r == c else 0) - A[r][c] for c in range(n)] for r in range(n)]
    J = [[1.0 / n] * n for _ in range(n)]
    M = [[L[r][c] + J[r][c] for c in range(n)] for r in range(n)]
    aug = [M[r][:] + [1.0 if r == c else 0.0 for c in range(n)] for r in range(n)]
    for col in range(n):
        p = max(range(col, n), key=lambda r: abs(aug[r][col]))
        aug[col], aug[p] = aug[p], aug[col]
        pv = aug[col][col]
        aug[col] = [x / pv for x in aug[col]]
        for r in range(n):
            if r != col:
                f = aug[r][col]
                aug[r] = [aug[r][c] - f * aug[col][c] for c in range(2 * n)]
    Minv = [row[n:] for row in aug]
    Lp = [[Minv[r][c] - J[r][c] for c in range(n)] for r in range(n)]
    return Lp[i][i] + Lp[j][j] - 2 * Lp[i][j]`,
    testCases: [
      { input: [[[0, 1], [1, 0]], 0, 1], expected: 1.0 },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], 0, 2], expected: 2.0 },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], 0, 1], expected: 1.0 },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], 0, 1], expected: 0.6666666666666666 },
    ],
    hint: "Effective resistance equals the voltage difference when a unit current is injected at i and extracted at j.",
  },
  {
    id: "la-275",
    title: "Nystrom Approximation Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the Nystrom low-rank approximation of a kernel matrix K using the selected column indices cols (assume exactly two columns):\n\nK_approx = C * inv(W) * C^T\n\nwhere C = K[:, cols] and W = K[cols, :][:, cols].",
    starterCode: `def nystrom_approximation(K, cols):
    # Your code here
    pass`,
    solution: `def nystrom_approximation(K, cols):
    n = len(K)
    k = len(cols)
    C = [[K[i][c] for c in cols] for i in range(n)]
    W = [[K[cols[i]][cols[j]] for j in range(k)] for i in range(k)]
    det = W[0][0] * W[1][1] - W[0][1] * W[1][0]
    Wi = [[W[1][1] / det, -W[0][1] / det], [-W[1][0] / det, W[0][0] / det]]
    CW = [[sum(C[i][t] * Wi[t][j] for t in range(k)) for j in range(k)] for i in range(n)]
    return [[sum(CW[i][t] * C[j][t] for t in range(k)) for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0, 1]], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]] },
      {
        input: [[[1, 0.5, 0.2], [0.5, 1, 0.3], [0.2, 0.3, 1]], [0, 1]],
        expected: [[1.0, 0.5, 0.2], [0.5, 1.0, 0.3], [0.2, 0.3, 0.09333333333333331]],
      },
      {
        input: [[[2, 1, 0], [1, 2, 1], [0, 1, 2]], [1, 2]],
        expected: [[0.6666666666666666, 1.0, 0.0], [1.0, 2.0, 1.0], [0.0, 1.0, 2.0]],
      },
      { input: [[[1, 0], [0, 1]], [0, 1]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Nystrom sampling trades accuracy for speed by inverting only a small submatrix of K.",
  },
];

