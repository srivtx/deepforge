import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-051",
    title: "Vector Triple Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the vector triple product a x (b x c) using the identity\n\na x (b x c) = b * (a . c) - c * (a . b)\n\nAll vectors are 3D.",
    starterCode: `def vector_triple_product(a, b, c):
    # Your code here
    pass`,
    solution: `def vector_triple_product(a, b, c):
    ac = sum(x * y for x, y in zip(a, c))
    ab = sum(x * y for x, y in zip(a, b))
    return [b[i] * ac - c[i] * ab for i in range(3)]`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], expected: [-24, -6, 12] },
      { input: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], expected: [0, 0, 0] },
      { input: [[1, 1, 1], [1, 0, 0], [0, 1, 0]], expected: [1, -1, 0] },
      { input: [[2, 0, 1], [1, 3, 0], [0, 1, 4]], expected: [4, 10, -8] },
    ],
    hint: "Use the BAC-CAB identity so no cross product computation is needed.",
  },
  {
    id: "la-052",
    title: "Scalar Triple Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the scalar triple product a . (b x c), the signed volume of the parallelepiped spanned by a, b, and c.\n\nUse the determinant formula with the three rows a, b, c.",
    starterCode: `def scalar_triple_product(a, b, c):
    # Your code here
    pass`,
    solution: `def scalar_triple_product(a, b, c):
    return (
        a[0] * (b[1] * c[2] - b[2] * c[1])
        - a[1] * (b[0] * c[2] - b[2] * c[0])
        + a[2] * (b[0] * c[1] - b[1] * c[0])
    )`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], expected: 1 },
      { input: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], expected: 0 },
      { input: [[2, 0, 0], [0, 3, 0], [0, 0, 4]], expected: 24 },
      { input: [[1, 1, 0], [0, 1, 1], [1, 0, 1]], expected: 2 },
    ],
    hint: "The result is the determinant of the matrix whose rows are a, b, c.",
  },
  {
    id: "la-053",
    title: "Vector Normalization",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the unit vector in the direction of v: v / ||v||_2.\n\nIf v is the zero vector, return a list of zeros with the same length.",
    starterCode: `def normalize(v):
    # Your code here
    pass`,
    solution: `def normalize(v):
    norm = sum(x * x for x in v) ** 0.5
    if norm == 0:
        return [0.0 for _ in v]
    return [x / norm for x in v]`,
    testCases: [
      { input: [[3, 4]], expected: [0.6, 0.8] },
      { input: [[1, 0, 0]], expected: [1.0, 0.0, 0.0] },
      { input: [[0, 0]], expected: [0.0, 0.0] },
      { input: [[1, 1, 1]], expected: [0.5773502691896258, 0.5773502691896258, 0.5773502691896258] },
    ],
    hint: "Divide each component by the L2 norm.",
  },
  {
    id: "la-054",
    title: "Distance Between Points",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the Euclidean distance between points p and q:\n\nsqrt(sum((p[i] - q[i])^2))\n\nThe two vectors must have the same length.",
    starterCode: `def point_distance(p, q):
    # Your code here
    pass`,
    solution: `def point_distance(p, q):
    return sum((p[i] - q[i]) ** 2 for i in range(len(p))) ** 0.5`,
    testCases: [
      { input: [[0, 0], [3, 4]], expected: 5.0 },
      { input: [[1, 1], [1, 1]], expected: 0.0 },
      { input: [[-1, -2], [2, 2]], expected: 5.0 },
      { input: [[0, 0, 0], [1, 2, 2]], expected: 3.0 },
    ],
    hint: "This is the L2 norm of the difference p - q.",
  },
  {
    id: "la-055",
    title: "Midpoint of Two Points",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the midpoint of points p and q, computed componentwise as (p[i] + q[i]) / 2.\n\nReturn the coordinates as floats.",
    starterCode: `def midpoint(p, q):
    # Your code here
    pass`,
    solution: `def midpoint(p, q):
    return [(p[i] + q[i]) / 2 for i in range(len(p))]`,
    testCases: [
      { input: [[0, 0], [4, 6]], expected: [2.0, 3.0] },
      { input: [[1, 2], [3, 4]], expected: [2.0, 3.0] },
      { input: [[-2, 5], [2, -5]], expected: [0.0, 0.0] },
      { input: [[1.5, 2.5], [2.5, 3.5]], expected: [2.0, 3.0] },
    ],
    hint: "The midpoint is the average of the two points.",
  },
  {
    id: "la-056",
    title: "Vector Linear Interpolation",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Linearly interpolate between vectors a and b with parameter t:\n\nlerp(a, b, t) = a + t * (b - a)\n\nReturn a list of floats; t = 0 gives a and t = 1 gives b.",
    starterCode: `def lerp_vectors(a, b, t):
    # Your code here
    pass`,
    solution: `def lerp_vectors(a, b, t):
    return [x + t * (y - x) for x, y in zip(a, b)]`,
    testCases: [
      { input: [[0, 0], [10, 20], 0.5], expected: [5.0, 10.0] },
      { input: [[1, 1], [3, 5], 0.25], expected: [1.5, 2.0] },
      { input: [[2, 4], [2, 4], 0.7], expected: [2.0, 4.0] },
      { input: [[0, 0], [4, 8], 0], expected: [0.0, 0.0] },
    ],
    hint: "Interpolate each component independently.",
  },
  {
    id: "la-057",
    title: "Triangle Area via Cross Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the area of the triangle with 3D vertices p, q, r:\n\narea = 0.5 * ||(q - p) x (r - p)||_2\n\nA degenerate (collinear) triangle has area 0.0.",
    starterCode: `def triangle_area(p, q, r):
    # Your code here
    pass`,
    solution: `def triangle_area(p, q, r):
    u = [q[i] - p[i] for i in range(3)]
    w = [r[i] - p[i] for i in range(3)]
    c = [
        u[1] * w[2] - u[2] * w[1],
        u[2] * w[0] - u[0] * w[2],
        u[0] * w[1] - u[1] * w[0],
    ]
    return 0.5 * sum(x * x for x in c) ** 0.5`,
    testCases: [
      { input: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], expected: 0.5 },
      { input: [[1, 1, 1], [2, 1, 1], [1, 3, 1]], expected: 1.0 },
      { input: [[0, 0, 0], [1, 1, 1], [2, 2, 2]], expected: 0.0 },
      { input: [[0, 0, 0], [2, 0, 0], [0, 2, 0]], expected: 2.0 },
    ],
    hint: "Half the area of the parallelogram spanned by q - p and r - p.",
  },
  {
    id: "la-058",
    title: "Parallelogram Area via Cross Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the area of the parallelogram spanned by 3D vectors u and v:\n\narea = ||u x v||_2",
    starterCode: `def parallelogram_area(u, v):
    # Your code here
    pass`,
    solution: `def parallelogram_area(u, v):
    c = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
    ]
    return sum(x * x for x in c) ** 0.5`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0]], expected: 1.0 },
      { input: [[2, 0, 0], [0, 3, 0]], expected: 6.0 },
      { input: [[1, 1, 0], [1, -1, 0]], expected: 2.0 },
      { input: [[1, 2, 3], [4, 5, 6]], expected: 7.3484692283495345 },
    ],
    hint: "The cross product magnitude equals base times height.",
  },
  {
    id: "la-059",
    title: "Affine Combination Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if the given weights form an affine combination, meaning they sum to 1 within a tolerance of 1e-9. Otherwise return False.",
    starterCode: `def is_affine_combination(weights):
    # Your code here
    pass`,
    solution: `def is_affine_combination(weights):
    return abs(sum(weights) - 1) <= 1e-9`,
    testCases: [
      { input: [[0.5, 0.5]], expected: true },
      { input: [[0.2, 0.3, 0.5]], expected: true },
      { input: [[1, 1]], expected: false },
      { input: [[1.0]], expected: true },
    ],
    hint: "Only the sum of the weights matters for an affine combination.",
  },
  {
    id: "la-060",
    title: "Convex Combination Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if the weights form a convex combination: every weight is non-negative and the weights sum to 1, both within a tolerance of 1e-9. Otherwise return False.",
    starterCode: `def is_convex_combination(weights):
    # Your code here
    pass`,
    solution: `def is_convex_combination(weights):
    if any(w < -1e-9 for w in weights):
        return False
    return abs(sum(weights) - 1) <= 1e-9`,
    testCases: [
      { input: [[0.5, 0.5]], expected: true },
      { input: [[0.2, 0.3, 0.5]], expected: true },
      { input: [[1.2, -0.2]], expected: false },
      { input: [[0.5, 0.6]], expected: false },
      { input: [[1.0]], expected: true },
    ],
    hint: "A convex combination is an affine combination with no negative weights.",
  },
  {
    id: "la-061",
    title: "Trace of A Transpose A",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the trace of A^T A, which equals the sum of the squares of every entry of A and also the squared Frobenius norm of A.",
    starterCode: `def trace_ata(A):
    # Your code here
    pass`,
    solution: `def trace_ata(A):
    return sum(x * x for row in A for x in row)`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: 30 },
      { input: [[[1, 0], [0, 1]]], expected: 2 },
      { input: [[[2, -1], [0, 3]]], expected: 14 },
      { input: [[[0]]], expected: 0 },
    ],
    hint: "trace(A^T A) = sum_ij A[i][j]^2.",
  },
  {
    id: "la-062",
    title: "Determinant of Transpose",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of the transpose of a 3x3 matrix A by expanding along the first row of A^T.\n\nThe result equals det(A), but the work is done on the transposed rows.",
    starterCode: `def det_transpose(A):
    # Your code here
    pass`,
    solution: `def det_transpose(A):
    B = [[A[j][i] for j in range(3)] for i in range(3)]
    a, b, c = B[0]
    d, e, f = B[1]
    g, h, i = B[2]
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 0 },
      { input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]]], expected: 1 },
      { input: [[[2, 0, 0], [0, 3, 0], [0, 0, 4]]], expected: 24 },
      { input: [[[1, 0, 1], [0, 1, 0], [-1, 0, 1]]], expected: 2 },
    ],
    hint: "Transpose first, then apply the standard 3x3 cofactor expansion.",
  },
  {
    id: "la-063",
    title: "Determinant of Triangular Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of a square triangular matrix (upper or lower triangular) as the product of its diagonal entries.\n\nYou may assume the input is triangular.",
    starterCode: `def det_triangular(A):
    # Your code here
    pass`,
    solution: `def det_triangular(A):
    product = 1
    for i in range(len(A)):
        product *= A[i][i]
    return product`,
    testCases: [
      { input: [[[2, 5, 7], [0, 3, 9], [0, 0, 4]]], expected: 24 },
      { input: [[[1, 0, 0], [2, 3, 0], [4, 5, 6]]], expected: 18 },
      { input: [[[5, 0], [0, 7]]], expected: 35 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 1 },
    ],
    hint: "All entries above (or below) the diagonal are zero, so only the diagonal matters.",
  },
  {
    id: "la-064",
    title: "Inverse of Diagonal Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the inverse of a square diagonal matrix: reciprocals on the diagonal and zeros elsewhere.\n\nIf any diagonal entry is 0, the matrix is singular; return None.",
    starterCode: `def inverse_diagonal(A):
    # Your code here
    pass`,
    solution: `def inverse_diagonal(A):
    n = len(A)
    for i in range(n):
        if A[i][i] == 0:
            return None
    return [[1.0 / A[i][i] if i == j else 0.0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[2, 0], [0, 4]]], expected: [[0.5, 0.0], [0.0, 0.25]] },
      {
        input: [[[1, 0, 0], [0, 2, 0], [0, 0, 5]]],
        expected: [[1.0, 0.0, 0.0], [0.0, 0.5, 0.0], [0.0, 0.0, 0.2]],
      },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0, 0], [0, 2]]], expected: null },
    ],
    hint: "Invert each nonzero diagonal entry; off-diagonal entries stay 0.",
  },
  {
    id: "la-065",
    title: "Determinant of Product",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of the product A*B of two 2x2 matrices using the identity\n\ndet(A*B) = det(A) * det(B)",
    starterCode: `def det_product(A, B):
    # Your code here
    pass`,
    solution: `def det_product(A, B):
    def det2(M):
        return M[0][0] * M[1][1] - M[0][1] * M[1][0]
    return det2(A) * det2(B)`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: 4 },
      { input: [[[2, 0], [0, 3]], [[1, 1], [0, 1]]], expected: 6 },
      { input: [[[1, 2], [2, 4]], [[3, 1], [1, 3]]], expected: 0 },
      { input: [[[1, 0], [0, 1]], [[4, 7], [2, 6]]], expected: 10 },
    ],
    hint: "No need to multiply the matrices; multiply their determinants.",
  },
  {
    id: "la-066",
    title: "Determinant of Inverse",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the determinant of the inverse of a 2x2 matrix A using\n\ndet(inv(A)) = 1 / det(A)\n\nReturn None if det(A) == 0.",
    starterCode: `def det_inverse(A):
    # Your code here
    pass`,
    solution: `def det_inverse(A):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    return 1.0 / det`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: -0.5 },
      { input: [[[2, 0], [0, 4]]], expected: 0.125 },
      { input: [[[4, 7], [2, 6]]], expected: 0.1 },
      { input: [[[1, 2], [2, 4]]], expected: null },
    ],
    hint: "Invertible matrices have nonzero determinant.",
  },
  {
    id: "la-067",
    title: "Distance from Point to Line 2D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the distance from point p to the line through points a and b in 2D:\n\nd = |cross(b - a, p - a)| / ||b - a||_2\n\nIf a == b, return the point distance ||p - a||_2.",
    starterCode: `def point_line_distance(p, a, b):
    # Your code here
    pass`,
    solution: `def point_line_distance(p, a, b):
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    if dx == 0 and dy == 0:
        return ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** 0.5
    cross = dx * (p[1] - a[1]) - dy * (p[0] - a[0])
    return abs(cross) / (dx * dx + dy * dy) ** 0.5`,
    testCases: [
      { input: [[2, 3], [0, 0], [4, 0]], expected: 3.0 },
      { input: [[1, 0], [0, 0], [1, 1]], expected: 0.7071067811865475 },
      { input: [[4, 5], [1, 1], [1, 1]], expected: 5.0 },
      { input: [[0, 0], [0, 0], [3, 4]], expected: 0.0 },
    ],
    hint: "The cross product gives twice the triangle area; divide by the base length.",
  },
  {
    id: "la-068",
    title: "Distance from Point to Plane",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the distance from point p to the plane through point q with normal vector n:\n\nd = |n . (p - q)| / ||n||_2\n\nIf n is the zero vector, return None.",
    starterCode: `def point_plane_distance(p, n, q):
    # Your code here
    pass`,
    solution: `def point_plane_distance(p, n, q):
    norm_sq = sum(x * x for x in n)
    if norm_sq == 0:
        return None
    return abs(sum(n[i] * (p[i] - q[i]) for i in range(len(n)))) / norm_sq ** 0.5`,
    testCases: [
      { input: [[1, 2, 3], [0, 0, 1], [0, 0, 0]], expected: 3.0 },
      { input: [[1, 1, 1], [1, 1, 1], [0, 0, 0]], expected: 1.7320508075688774 },
      { input: [[4, 0, 0], [2, 0, 0], [1, 0, 0]], expected: 3.0 },
      { input: [[1, 1, 1], [0, 0, 0], [0, 0, 0]], expected: null },
    ],
    hint: "Project p - q onto the unit normal and take the absolute value.",
  },
  {
    id: "la-069",
    title: "Plane Equation from Three Points",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the plane equation [a, b, c, d] for the plane through points p, q, r, where a*x + b*y + c*z + d = 0.\n\nSet [a, b, c] = (q - p) x (r - p) and d = -(a*p[0] + b*p[1] + c*p[2]). Return None if the points are collinear.",
    starterCode: `def plane_from_points(p, q, r):
    # Your code here
    pass`,
    solution: `def plane_from_points(p, q, r):
    u = [q[i] - p[i] for i in range(3)]
    w = [r[i] - p[i] for i in range(3)]
    n = [
        u[1] * w[2] - u[2] * w[1],
        u[2] * w[0] - u[0] * w[2],
        u[0] * w[1] - u[1] * w[0],
    ]
    if n[0] == 0 and n[1] == 0 and n[2] == 0:
        return None
    d = -(n[0] * p[0] + n[1] * p[1] + n[2] * p[2])
    return n + [d]`,
    testCases: [
      { input: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], expected: [0, 0, 1, 0] },
      { input: [[0, 0, 0], [1, 0, 0], [0, 0, 1]], expected: [0, -1, 0, 0] },
      { input: [[1, 1, 1], [2, 1, 1], [1, 3, 1]], expected: [0, 0, 2, -2] },
      { input: [[0, 0, 0], [1, 1, 1], [2, 2, 2]], expected: null },
    ],
    hint: "The cross product of two edge vectors is a normal; plug in p to find d.",
  },
  {
    id: "la-070",
    title: "Line Intersection 2D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Find the intersection of two lines in 2D. Line 1 passes through p with direction r and line 2 passes through q with direction s.\n\nWith cross(u, v) = u[0]*v[1] - u[1]*v[0], compute t = cross(q - p, s) / cross(r, s); the point is p + t*r. Return None if cross(r, s) == 0 (parallel or collinear lines).",
    starterCode: `def line_intersection(p, r, q, s):
    # Your code here
    pass`,
    solution: `def line_intersection(p, r, q, s):
    rxs = r[0] * s[1] - r[1] * s[0]
    if rxs == 0:
        return None
    qp = [q[0] - p[0], q[1] - p[1]]
    t = (qp[0] * s[1] - qp[1] * s[0]) / rxs
    return [p[0] + t * r[0], p[1] + t * r[1]]`,
    testCases: [
      { input: [[0, 0], [1, 1], [0, 1], [1, -1]], expected: [0.5, 0.5] },
      { input: [[0, 0], [2, 0], [1, -1], [0, 1]], expected: [1.0, 0.0] },
      { input: [[0, 0], [1, 0], [0, 1], [1, 0]], expected: null },
      { input: [[0, 0], [1, 0], [0, 0], [0, 1]], expected: [0.0, 0.0] },
    ],
    hint: "Use the 2D cross product to find the parameter t along the first line.",
  },
  {
    id: "la-071",
    title: "Angle Between Planes",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the acute angle between two planes in degrees from their normals n1 and n2:\n\ntheta = degrees(acos(|n1 . n2| / (||n1||_2 * ||n2||_2)))\n\nReturn None if either normal is the zero vector.",
    starterCode: `def angle_between_planes(n1, n2):
    # Your code here
    pass`,
    solution: `def angle_between_planes(n1, n2):
    import math
    d = sum(x * y for x, y in zip(n1, n2))
    a = sum(x * x for x in n1) ** 0.5
    b = sum(x * x for x in n2) ** 0.5
    if a == 0 or b == 0:
        return None
    cos_theta = abs(d) / (a * b)
    cos_theta = max(-1.0, min(1.0, cos_theta))
    return math.degrees(math.acos(cos_theta))`,
    testCases: [
      { input: [[1, 0, 0], [0, 1, 0]], expected: 90.0 },
      { input: [[1, 0, 0], [1, 0, 0]], expected: 0.0 },
      { input: [[1, 0, 0], [-1, 0, 0]], expected: 0.0 },
      { input: [[1, 1, 0], [1, 0, 0]], expected: 45.0 },
      { input: [[1, 1, 1], [1, 1, 0]], expected: 35.26438968275466 },
    ],
    hint: "The angle between planes is the angle between their normals, taken as acute.",
  },
  {
    id: "la-072",
    title: "Barycentric Coordinates 2D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the barycentric coordinates [u, v, w] of point p with respect to triangle abc, so that p = u*a + v*b + w*c and u + v + w = 1.\n\nUse v0 = b - a, v1 = c - a, v2 = p - a and the standard dot-product formulas. Return None if the triangle is degenerate.",
    starterCode: `def barycentric_2d(p, a, b, c):
    # Your code here
    pass`,
    solution: `def barycentric_2d(p, a, b, c):
    v0 = [b[0] - a[0], b[1] - a[1]]
    v1 = [c[0] - a[0], c[1] - a[1]]
    v2 = [p[0] - a[0], p[1] - a[1]]
    d00 = v0[0] * v0[0] + v0[1] * v0[1]
    d01 = v0[0] * v1[0] + v0[1] * v1[1]
    d11 = v1[0] * v1[0] + v1[1] * v1[1]
    d20 = v2[0] * v0[0] + v2[1] * v0[1]
    d21 = v2[0] * v1[0] + v2[1] * v1[1]
    denom = d00 * d11 - d01 * d01
    if denom == 0:
        return None
    v = (d11 * d20 - d01 * d21) / denom
    w = (d00 * d21 - d01 * d20) / denom
    return [1 - v - w, v, w]`,
    testCases: [
      { input: [[0.5, 0.5], [0, 0], [1, 0], [0, 1]], expected: [0.0, 0.5, 0.5] },
      { input: [[0, 0], [0, 0], [1, 0], [0, 1]], expected: [1.0, 0.0, 0.0] },
      { input: [[1, 1], [0, 0], [1, 0], [0, 1]], expected: [-1.0, 1.0, 1.0] },
      { input: [[1, 1], [0, 0], [1, 1], [2, 2]], expected: null },
    ],
    hint: "Compute v and w from dot products, then u = 1 - v - w.",
  },
  {
    id: "la-073",
    title: "Gram Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the Gram matrix G of a list of vectors, where G[i][j] is the dot product of vectors[i] and vectors[j].\n\nAll vectors have the same length.",
    starterCode: `def gram_matrix(vectors):
    # Your code here
    pass`,
    solution: `def gram_matrix(vectors):
    n = len(vectors)
    return [
        [sum(vectors[i][k] * vectors[j][k] for k in range(len(vectors[i]))) for j in range(n)]
        for i in range(n)
    ]`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: [[1, 0], [0, 1]] },
      { input: [[[1, 2], [3, 4]]], expected: [[5, 11], [11, 25]] },
      { input: [[[1, 1, 1], [1, -1, 0]]], expected: [[3, 0], [0, 2]] },
      { input: [[[2], [3]]], expected: [[4, 6], [6, 9]] },
    ],
    hint: "The Gram matrix is symmetric with the squared norms on its diagonal.",
  },
  {
    id: "la-074",
    title: "Covariance Matrix from Data",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the sample covariance matrix of data, given as a list of samples (rows) with one feature per column, using the unbiased denominator n - 1:\n\nC[i][j] = sum_k (x[k][i] - mean_i) * (x[k][j] - mean_j) / (n - 1)\n\nAssume at least two samples.",
    starterCode: `def covariance_matrix(data):
    # Your code here
    pass`,
    solution: `def covariance_matrix(data):
    n = len(data)
    d = len(data[0])
    means = [sum(row[j] for row in data) / n for j in range(d)]
    return [
        [sum((row[i] - means[i]) * (row[j] - means[j]) for row in data) / (n - 1) for j in range(d)]
        for i in range(d)
    ]`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[4.0, 4.0], [4.0, 4.0]] },
      { input: [[[1, 2], [2, 4], [3, 6]]], expected: [[1.0, 2.0], [2.0, 4.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[0.5, -0.5], [-0.5, 0.5]] },
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: [[1.0, 1.0], [1.0, 1.0]] },
    ],
    hint: "Subtract column means first, then average outer products over n - 1.",
  },
  {
    id: "la-075",
    title: "Correlation Matrix from Covariance",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Convert a covariance matrix C into a correlation matrix:\n\nR[i][j] = C[i][j] / sqrt(C[i][i] * C[j][j])\n\nReturn None if any variance C[i][i] is 0.",
    starterCode: `def correlation_matrix(C):
    # Your code here
    pass`,
    solution: `def correlation_matrix(C):
    d = len(C)
    for i in range(d):
        if C[i][i] == 0:
            return None
    return [
        [C[i][j] / (C[i][i] * C[j][j]) ** 0.5 for j in range(d)]
        for i in range(d)
    ]`,
    testCases: [
      { input: [[[4, 2], [2, 4]]], expected: [[1.0, 0.5], [0.5, 1.0]] },
      { input: [[[1, 2], [2, 4]]], expected: [[1.0, 1.0], [1.0, 1.0]] },
      { input: [[[1, 0], [0, 4]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[1, 0.5], [0.5, 0]]], expected: null },
    ],
    hint: "The result is the covariance rescaled by the standard deviations.",
  },
  {
    id: "la-076",
    title: "Center Columns",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Center each column of data by subtracting its column mean, the effect of multiplying by the centering matrix.\n\nReturn the centered data as a list of rows of floats.",
    starterCode: `def center_columns(data):
    # Your code here
    pass`,
    solution: `def center_columns(data):
    n = len(data)
    d = len(data[0])
    means = [sum(row[j] for row in data) / n for j in range(d)]
    return [[row[j] - means[j] for j in range(d)] for row in data]`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]] },
      { input: [[[1, 2], [2, 4]]], expected: [[-0.5, -1.0], [0.5, 1.0]] },
      { input: [[[5, 5], [5, 5]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 3, 5]]], expected: [[0.0, 0.0, 0.0]] },
    ],
    hint: "Every centered column sums to zero.",
  },
  {
    id: "la-077",
    title: "Standardize Columns",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Standardize each column of data to zero mean and unit sample variance (denominator n - 1).\n\nIf a column has zero variance, output 0.0 for every entry in that column. Return a list of rows of floats.",
    starterCode: `def standardize_columns(data):
    # Your code here
    pass`,
    solution: `def standardize_columns(data):
    n = len(data)
    d = len(data[0])
    means = [sum(row[j] for row in data) / n for j in range(d)]
    out = [[0.0] * d for _ in range(n)]
    for j in range(d):
        var = sum((row[j] - means[j]) ** 2 for row in data) / (n - 1)
        std = var ** 0.5
        for i in range(n):
            out[i][j] = 0.0 if std == 0 else (data[i][j] - means[j]) / std
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]] },
      { input: [[[1, 10], [2, 20], [3, 30]]], expected: [[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]] },
      { input: [[[5, 5], [5, 5]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      {
        input: [[[1, 0], [0, 1]]],
        expected: [[0.7071067811865475, -0.7071067811865475], [-0.7071067811865475, 0.7071067811865475]],
      },
    ],
    hint: "Divide the centered values by the sample standard deviation.",
  },
  {
    id: "la-078",
    title: "Orthogonal Projection Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the orthogonal projection matrix onto the subspace spanned by basis, a list of one or two vectors in R^2:\n\nP = A * inv(A^T A) * A^T\n\nwhere A has the basis vectors as columns. Return None if the basis is empty or linearly dependent.",
    starterCode: `def projection_matrix(basis):
    # Your code here
    pass`,
    solution: `def projection_matrix(basis):
    if not basis:
        return None
    A = [[basis[k][i] for k in range(len(basis))] for i in range(len(basis[0]))]
    dim = len(A)
    k = len(A[0])
    G = [[sum(A[r][i] * A[r][j] for r in range(dim)) for j in range(k)] for i in range(k)]
    if k == 1:
        if G[0][0] == 0:
            return None
        Ginv = [[1.0 / G[0][0]]]
    elif k == 2:
        det = G[0][0] * G[1][1] - G[0][1] * G[1][0]
        if det == 0:
            return None
        Ginv = [[G[1][1] / det, -G[0][1] / det], [-G[1][0] / det, G[0][0] / det]]
    else:
        return None
    return [
        [sum(A[i][a] * Ginv[a][b] * A[j][b] for a in range(k) for b in range(k)) for j in range(dim)]
        for i in range(dim)
    ]`,
    testCases: [
      { input: [[[1, 1]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [[[1, 0]]], expected: [[1.0, 0.0], [0.0, 0.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[2, 0]]], expected: [[1.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "P is symmetric and idempotent; projecting onto a full basis gives the identity.",
  },
  {
    id: "la-079",
    title: "Least Squares Through the Origin",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Fit the model y = k*x through the origin to paired data by least squares, where\n\nk = (x . y) / (x . x)\n\nReturn the predicted values [k*x[0], k*x[1], ...]. If x is the zero vector, return zeros.",
    starterCode: `def least_squares_1d(x, y):
    # Your code here
    pass`,
    solution: `def least_squares_1d(x, y):
    xx = sum(a * a for a in x)
    if xx == 0:
        return [0.0 for _ in x]
    k = sum(a * b for a, b in zip(x, y)) / xx
    return [k * a for a in x]`,
    testCases: [
      { input: [[1, 2], [2, 4]], expected: [2.0, 4.0] },
      { input: [[1, 2, 3], [1, 2, 3]], expected: [1.0, 2.0, 3.0] },
      { input: [[1, 1], [1, 2]], expected: [1.5, 1.5] },
      { input: [[0, 0], [1, 2]], expected: [0.0, 0.0] },
    ],
    hint: "The slope estimate is the projection of y onto the direction x.",
  },
  {
    id: "la-080",
    title: "Normal Equations 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Solve the linear least squares problem for a design matrix A (n x 2) and response b (length n) via the normal equations:\n\n(A^T A) x = A^T b\n\nReturn the coefficients [x0, x1], or None if A^T A is singular.",
    starterCode: `def normal_equations(A, b):
    # Your code here
    pass`,
    solution: `def normal_equations(A, b):
    n = len(A)
    G = [[sum(A[k][i] * A[k][j] for k in range(n)) for j in range(2)] for i in range(2)]
    rhs = [sum(A[k][i] * b[k] for k in range(n)) for i in range(2)]
    det = G[0][0] * G[1][1] - G[0][1] * G[1][0]
    if det == 0:
        return None
    return [
        (G[1][1] * rhs[0] - G[0][1] * rhs[1]) / det,
        (-G[1][0] * rhs[0] + G[0][0] * rhs[1]) / det,
    ]`,
    testCases: [
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3]], expected: [0.0, 1.0] },
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 3, 4]], expected: [-0.3333333333333333, 1.5] },
      { input: [[[1, 0], [1, 1]], [0, 1]], expected: [0.0, 1.0] },
      { input: [[[1, 1], [1, 1]], [1, 2]], expected: null },
    ],
    hint: "Build the 2x2 Gram matrix A^T A and the right-hand side A^T b, then solve.",
  },
  {
    id: "la-081",
    title: "Residual Vector",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the residual vector r = b - A*x for a matrix A and vectors x and b with matching dimensions.\n\nReturn the residual as a list.",
    starterCode: `def residual_vector(A, x, b):
    # Your code here
    pass`,
    solution: `def residual_vector(A, x, b):
    return [b[i] - sum(A[i][j] * x[j] for j in range(len(x))) for i in range(len(b))]`,
    testCases: [
      { input: [[[1, 1], [1, 2], [1, 3]], [0, 1], [1, 2, 3]], expected: [0, 0, 0] },
      { input: [[[1, 0], [0, 1]], [3, -4], [1, 1]], expected: [-2, 5] },
      { input: [[[2, 0], [0, 3]], [1, 1], [4, 4]], expected: [2, 1] },
      { input: [[[1, 1], [1, 1]], [2, 3], [5, 5]], expected: [0, 0] },
    ],
    hint: "The residual is zero exactly when A*x equals b.",
  },
  {
    id: "la-082",
    title: "Orthogonal Complement Basis 2D",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return a basis vector for the orthogonal complement of v in R^2, namely [-v[1], v[0]].\n\nReturn None if v is the zero vector.",
    starterCode: `def orthogonal_complement_basis_2d(v):
    # Your code here
    pass`,
    solution: `def orthogonal_complement_basis_2d(v):
    if v[0] == 0 and v[1] == 0:
        return None
    return [-v[1], v[0]]`,
    testCases: [
      { input: [[1, 0]], expected: [0, 1] },
      { input: [[1, 1]], expected: [-1, 1] },
      { input: [[2, -3]], expected: [3, 2] },
      { input: [[0, 0]], expected: null },
    ],
    hint: "Rotating a 2D vector by 90 degrees gives a vector orthogonal to it.",
  },
  {
    id: "la-083",
    title: "Eigenvalues 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the real eigenvalues of a 2x2 matrix from the characteristic polynomial\n\nlambda^2 - tr(A)*lambda + det(A) = 0\n\nReturn [larger, smaller] as floats, or None if the discriminant tr^2 - 4*det is negative.",
    starterCode: `def eigenvalues_2x2(A):
    # Your code here
    pass`,
    solution: `def eigenvalues_2x2(A):
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    disc = tr * tr - 4 * det
    if disc < 0:
        return None
    root = disc ** 0.5
    l1 = (tr + root) / 2
    l2 = (tr - root) / 2
    return [l1, l2] if l1 >= l2 else [l2, l1]`,
    testCases: [
      { input: [[[2, 0], [0, 3]]], expected: [3.0, 2.0] },
      { input: [[[4, 1], [2, 3]]], expected: [5.0, 2.0] },
      { input: [[[0, 1], [-2, -3]]], expected: [-1.0, -2.0] },
      { input: [[[1, 1], [-1, 1]]], expected: null },
    ],
    hint: "The trace is the sum of the eigenvalues and the determinant is their product.",
  },
  {
    id: "la-084",
    title: "Normalized Eigenvector 2x2",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return a unit eigenvector of the 2x2 matrix A for the given eigenvalue lam.\n\nForm M = A - lam*I. Take the first row [a, b] of M with a nonzero entry, use [-b, a], and normalize it to unit L2 length. If M is the zero matrix, return [1.0, 0.0].",
    starterCode: `def normalized_eigenvector(A, lam):
    # Your code here
    pass`,
    solution: `def normalized_eigenvector(A, lam):
    M = [[A[i][j] - (lam if i == j else 0) for j in range(2)] for i in range(2)]
    row = None
    for r in M:
        if abs(r[0]) > 1e-12 or abs(r[1]) > 1e-12:
            row = r
            break
    if row is None:
        return [1.0, 0.0]
    a, b = row
    v = [-b, a]
    norm = (v[0] * v[0] + v[1] * v[1]) ** 0.5
    return [v[0] / norm, v[1] / norm]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 2], expected: [-1.0, 0.0] },
      { input: [[[4, 1], [2, 3]], 5], expected: [-0.7071067811865475, -0.7071067811865475] },
      { input: [[[4, 1], [2, 3]], 2], expected: [-0.4472135954999579, 0.8944271909999159] },
      { input: [[[1, 0], [0, 1]], 1], expected: [1.0, 0.0] },
    ],
    hint: "Any vector in the null space of A - lam*I is an eigenvector for lam.",
  },
  {
    id: "la-085",
    title: "Diagonalization Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Check whether A = P*D*inv(P) holds for 2x2 matrices A, P, and D, comparing entries within a tolerance of 1e-9.\n\nReturn False if P is singular.",
    starterCode: `def diagonalization_check(A, P, D):
    # Your code here
    pass`,
    solution: `def diagonalization_check(A, P, D):
    det = P[0][0] * P[1][1] - P[0][1] * P[1][0]
    if det == 0:
        return False
    P_inv = [[P[1][1] / det, -P[0][1] / det], [-P[1][0] / det, P[0][0] / det]]
    PD = [[sum(P[i][k] * D[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    R = [[sum(PD[i][k] * P_inv[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    for i in range(2):
        for j in range(2):
            if abs(R[i][j] - A[i][j]) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[1, 0], [0, 1]], [[2, 0], [0, 3]]], expected: true },
      { input: [[[4, 1], [2, 3]], [[1, 1], [1, -2]], [[5, 0], [0, 2]]], expected: true },
      { input: [[[4, 1], [2, 3]], [[1, 1], [1, -2]], [[2, 0], [0, 5]]], expected: false },
      { input: [[[1, 0], [0, 1]], [[1, 1], [1, 1]], [[1, 0], [0, 1]]], expected: false },
    ],
    hint: "The columns of P must be eigenvectors matched to the diagonal entries of D.",
  },
  {
    id: "la-086",
    title: "Idempotent Matrix Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if A*A equals A entrywise within a tolerance of 1e-9 (A is idempotent). Otherwise return False.\n\nProjection matrices are the most common idempotent matrices.",
    starterCode: `def is_idempotent(A):
    # Your code here
    pass`,
    solution: `def is_idempotent(A):
    n = len(A)
    for i in range(n):
        for j in range(n):
            s = sum(A[i][k] * A[k][j] for k in range(n))
            if abs(s - A[i][j]) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[1, 0], [0, 0]]], expected: true },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: true },
      { input: [[[1, 1], [0, 1]]], expected: false },
      { input: [[[0, 0], [0, 0]]], expected: true },
    ],
    hint: "Apply A twice and compare with A; the identity matrix is also idempotent.",
  },
  {
    id: "la-087",
    title: "QR Solve Small System",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve the least squares problem A*x = b for a matrix A (n x 2) with linearly independent columns using the QR factorization A = Q*R.\n\nBuild Q from the columns of A with Gram-Schmidt, then solve R*x = Q^T*b by back substitution. Return [x0, x1].",
    starterCode: `def qr_solve(A, b):
    # Your code here
    pass`,
    solution: `def qr_solve(A, b):
    n = len(A)
    c0 = [A[i][0] for i in range(n)]
    c1 = [A[i][1] for i in range(n)]
    r00 = sum(x * x for x in c0) ** 0.5
    q0 = [x / r00 for x in c0]
    r01 = sum(q0[i] * c1[i] for i in range(n))
    w = [c1[i] - r01 * q0[i] for i in range(n)]
    r11 = sum(x * x for x in w) ** 0.5
    q1 = [x / r11 for x in w]
    q0tb = sum(q0[i] * b[i] for i in range(n))
    q1tb = sum(q1[i] * b[i] for i in range(n))
    x1 = q1tb / r11
    x0 = (q0tb - r01 * x1) / r00
    return [x0, x1]`,
    testCases: [
      { input: [[[1, 1], [1, 2], [1, 3]], [1, 2, 3]], expected: [0.0, 1.0] },
      { input: [[[1, 0], [0, 1]], [3, 4]], expected: [3.0, 4.0] },
      { input: [[[1, 1], [1, -1]], [2, 0]], expected: [1.0, 1.0] },
      { input: [[[1, 0], [1, 1], [1, 2]], [1, 2, 2]], expected: [1.1666666666666667, 0.5] },
    ],
    hint: "For full column rank A, Q spans the same column space, so the normal equations become R*x = Q^T*b.",
  },
  {
    id: "la-088",
    title: "Whitening Transform 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the symmetric whitening matrix W = inv(C)^(1/2) for a symmetric positive definite 2x2 covariance matrix C.\n\nUse the eigendecomposition C = Q*Lambda*Q^T with orthonormal Q and return W = Q*Lambda^(-1/2)*Q^T, so that W*C*W = I.",
    starterCode: `def whitening_2x2(C):
    # Your code here
    pass`,
    solution: `def whitening_2x2(C):
    import math
    a, b, c, d = C[0][0], C[0][1], C[1][0], C[1][1]
    tr = a + d
    det = a * d - b * c
    disc = tr * tr / 4 - det
    l1 = tr / 2 + disc ** 0.5
    l2 = tr / 2 - disc ** 0.5
    if abs(b) > 1e-12:
        v = [b, l1 - a]
        n = (v[0] * v[0] + v[1] * v[1]) ** 0.5
        v = [v[0] / n, v[1] / n]
    elif a >= d:
        v = [1.0, 0.0]
    else:
        v = [0.0, 1.0]
    w = [-v[1], v[0]]
    s1 = 1 / math.sqrt(l1)
    s2 = 1 / math.sqrt(l2)
    return [
        [s1 * v[0] * v[0] + s2 * w[0] * w[0], s1 * v[0] * v[1] + s2 * w[0] * w[1]],
        [s1 * v[1] * v[0] + s2 * w[1] * w[0], s1 * v[1] * v[1] + s2 * w[1] * w[1]],
    ]`,
    testCases: [
      { input: [[[4, 0], [0, 9]]], expected: [[0.5, 0.0], [0.0, 0.3333333333333333]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      {
        input: [[[2, 1], [1, 2]]],
        expected: [[0.7886751345948128, -0.21132486540518702], [-0.21132486540518702, 0.7886751345948128]],
      },
      {
        input: [[[3, 1], [1, 3]]],
        expected: [[0.6035533905932736, -0.10355339059327373], [-0.10355339059327373, 0.6035533905932736]],
      },
    ],
    hint: "Invert the square roots of the eigenvalues in the diagonal factor.",
  },
  {
    id: "la-089",
    title: "Singular Values 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the singular values of a 2x2 matrix A as the square roots of the eigenvalues of A^T A.\n\nReturn [larger, smaller] as floats. Singular values are non-negative even when a numerical eigenvalue is slightly negative.",
    starterCode: `def singular_values_2x2(A):
    # Your code here
    pass`,
    solution: `def singular_values_2x2(A):
    ata = [[sum(A[k][i] * A[k][j] for k in range(len(A))) for j in range(2)] for i in range(2)]
    tr = ata[0][0] + ata[1][1]
    det = ata[0][0] * ata[1][1] - ata[0][1] * ata[1][0]
    disc = tr * tr - 4 * det
    if disc < 0:
        disc = 0.0
    root = disc ** 0.5
    l1 = (tr + root) / 2
    l2 = (tr - root) / 2
    s1 = max(0.0, l1) ** 0.5
    s2 = max(0.0, l2) ** 0.5
    return [s1, s2] if s1 >= s2 else [s2, s1]`,
    testCases: [
      { input: [[[1, 0], [0, 2]]], expected: [2.0, 1.0] },
      { input: [[[3, 0], [0, 4]]], expected: [4.0, 3.0] },
      { input: [[[1, 1], [0, 0]]], expected: [1.4142135623730951, 0.0] },
      { input: [[[1, 2], [3, 4]]], expected: [5.464985704219043, 0.3659661906262571] },
    ],
    hint: "A^T A is symmetric positive semidefinite, so its eigenvalues are non-negative.",
  },
  {
    id: "la-090",
    title: "Matrix Equation AX=B",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve the matrix equation A*X = B for X, where A and B are 2x2 matrices and A is invertible.\n\nReturn X = inv(A)*B, or None if det(A) == 0.",
    starterCode: `def solve_axb(A, B):
    # Your code here
    pass`,
    solution: `def solve_axb(A, B):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
    return [[sum(inv[i][k] * B[k][j] for k in range(2)) for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[1, 2], [3, 4]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[2, 0], [0, 3]], [[2, 4], [9, 12]]], expected: [[1.0, 2.0], [3.0, 4.0]] },
      { input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]]], expected: [[-2.0, 1.0], [1.5, -0.5]] },
      { input: [[[1, 2], [2, 4]], [[1, 1], [1, 1]]], expected: null },
    ],
    hint: "X has the same number of columns as B; invert A once and multiply.",
  },
  {
    id: "la-091",
    title: "Solve 3x3 System by Gaussian Elimination",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Solve the 3x3 linear system A*x = b using Gaussian elimination with partial pivoting.\n\nReturn x as a list of floats, or None if A is singular (some pivot has magnitude below 1e-12).",
    starterCode: `def solve_3x3(A, b):
    # Your code here
    pass`,
    solution: `def solve_3x3(A, b):
    M = [A[i][:] + [b[i]] for i in range(3)]
    for col in range(3):
        pivot = max(range(col, 3), key=lambda r: abs(M[r][col]))
        if abs(M[pivot][col]) < 1e-12:
            return None
        M[col], M[pivot] = M[pivot], M[col]
        for r in range(col + 1, 3):
            factor = M[r][col] / M[col][col]
            for c in range(col, 4):
                M[r][c] -= factor * M[col][c]
    x = [0.0, 0.0, 0.0]
    for i in range(2, -1, -1):
        s = M[i][3] - sum(M[i][j] * x[j] for j in range(i + 1, 3))
        x[i] = s / M[i][i]
    return x`,
    testCases: [
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3]], expected: [1.0, 2.0, 3.0] },
      { input: [[[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3]], expected: [2.0, 3.0, -1.0] },
      { input: [[[1, 2, 3], [0, 1, 4], [5, 6, 0]], [5, 6, 5]], expected: [13.0, -10.0, 4.0] },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 1, 1]], expected: null },
    ],
    hint: "Eliminate below each pivot, then back-substitute from the last row up.",
  },
  {
    id: "la-092",
    title: "Matrix Exponential via Series",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Approximate the matrix exponential of a 2x2 matrix A with a truncated power series including terms k = 0 through num_terms - 1:\n\nexp(A) = sum over k of A^k / k!\n\nReturn the resulting matrix of floats.",
    starterCode: `def matrix_exponential(A, num_terms):
    # Your code here
    pass`,
    solution: `def matrix_exponential(A, num_terms):
    n = len(A)
    R = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    T = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    for k in range(1, num_terms):
        T = [[sum(T[i][t] * A[t][j] for t in range(n)) / k for j in range(n)] for i in range(n)]
        R = [[R[i][j] + T[i][j] for j in range(n)] for i in range(n)]
    return R`,
    testCases: [
      { input: [[[0, 0], [0, 0]], 5], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [[[0, 1], [0, 0]], 5], expected: [[1.0, 1.0], [0.0, 1.0]] },
      {
        input: [[[1, 0], [0, 1]], 10],
        expected: [[2.7182815255731922, 0.0], [0.0, 2.7182815255731922]],
      },
      {
        input: [[[0, -1], [1, 0]], 20],
        expected: [[0.5403023058681397, -0.8414709848078965], [0.8414709848078965, 0.5403023058681397]],
      },
    ],
    hint: "Keep the current term T = A^k / k! and update T = (T*A)/k each step.",
  },
  {
    id: "la-093",
    title: "Inverse Power Method Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one inverse power iteration step on the 2x2 matrix A with shift mu and vector v:\n\nSolve (A - mu*I) * y = v, then return the unit vector y / ||y||_2.\n\nReturn None if (A - mu*I) is singular.",
    starterCode: `def inverse_power_step(A, mu, v):
    # Your code here
    pass`,
    solution: `def inverse_power_step(A, mu, v):
    M = [[A[i][j] - (mu if i == j else 0) for j in range(2)] for i in range(2)]
    det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
    if det == 0:
        return None
    inv = [[M[1][1] / det, -M[0][1] / det], [-M[1][0] / det, M[0][0] / det]]
    y = [sum(inv[i][k] * v[k] for k in range(2)) for i in range(2)]
    norm = sum(x * x for x in y) ** 0.5
    return [y[0] / norm, y[1] / norm]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 1.9, [1, 0]], expected: [1.0, 0.0] },
      { input: [[[2, 0], [0, 3]], 1.9, [1, 1]], expected: [0.9958932064677037, 0.09053574604251859] },
      { input: [[[3, 1], [1, 3]], 1.5, [1, 1]], expected: [0.7071067811865475, 0.7071067811865475] },
      { input: [[[2, 0], [0, 3]], 2, [1, 0]], expected: null },
    ],
    hint: "The inverse iteration converges to the eigenvector of the eigenvalue closest to mu.",
  },
  {
    id: "la-094",
    title: "Shifted Power Method Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one shifted power iteration step on matrix A with shift mu and nonzero vector v.\n\nCompute w = (A - mu*I)*v, the Rayleigh estimate lam = mu + (w . v) / (v . v), and return [lam, w / ||w||_2].",
    starterCode: `def shifted_power_step(A, mu, v):
    # Your code here
    pass`,
    solution: `def shifted_power_step(A, mu, v):
    n = len(v)
    M = [[A[i][j] - (mu if i == j else 0) for j in range(n)] for i in range(n)]
    w = [sum(M[i][k] * v[k] for k in range(n)) for i in range(n)]
    num = sum(w[i] * v[i] for i in range(n))
    den = sum(x * x for x in v)
    lam = mu + num / den
    norm = sum(x * x for x in w) ** 0.5
    return [lam, [x / norm for x in w]]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 0, [1, 1]], expected: [2.5, [0.5547001962252291, 0.8320502943378437]] },
      { input: [[[2, 0], [0, 3]], 1, [1, 1]], expected: [2.5, [0.4472135954999579, 0.8944271909999159]] },
      {
        input: [[[4, 1], [2, 3]], 0, [1, 1]],
        expected: [5.0, [0.7071067811865475, 0.7071067811865475]],
      },
      {
        input: [[[4, 1], [2, 3]], 2, [1, 0]],
        expected: [4.0, [0.7071067811865475, 0.7071067811865475]],
      },
    ],
    hint: "The Rayleigh quotient is w . v over v . v before adding the shift back.",
  },
  {
    id: "la-095",
    title: "Orthogonal Diagonalization Check",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Check whether the 2x2 matrix A is orthogonally diagonalized by Q: Q must be orthogonal and Q^T*A*Q must be diagonal, all within 1e-9.\n\nIf both conditions hold, return the diagonal entries in order; otherwise return None.",
    starterCode: `def orthogonal_diagonalization(A, Q):
    # Your code here
    pass`,
    solution: `def orthogonal_diagonalization(A, Q):
    n = len(A)
    for i in range(n):
        for j in range(n):
            s = sum(Q[k][i] * Q[k][j] for k in range(n))
            target = 1.0 if i == j else 0.0
            if abs(s - target) > 1e-9:
                return None
    D = [
        [sum(Q[k][i] * A[k][l] * Q[l][j] for k in range(n) for l in range(n)) for j in range(n)]
        for i in range(n)
    ]
    for i in range(n):
        for j in range(n):
            if i != j and abs(D[i][j]) > 1e-9:
                return None
    return [D[i][i] for i in range(n)]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], [[1, 0], [0, 1]]], expected: [2.0, 3.0] },
      {
        input: [
          [[2, 1], [1, 2]],
          [[0.7071067811865475, -0.7071067811865475], [0.7071067811865475, 0.7071067811865475]],
        ],
        expected: [3.0, 1.0],
      },
      { input: [[[2, 1], [1, 2]], [[1, 0], [0, 1]]], expected: null },
      { input: [[[2, 0], [0, 3]], [[1, 1], [0, 1]]], expected: null },
    ],
    hint: "A symmetric matrix is orthogonally diagonalizable; a non-orthogonal Q fails the first check.",
  },
];
