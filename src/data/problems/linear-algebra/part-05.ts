import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "la-141",
    title: "Matrix Negative",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the additive inverse of matrix A: every entry is negated.\n\nB[i][j] = -A[i][j], so A + B is the zero matrix.",
    starterCode: `def negate_matrix(A):
    # Your code here
    pass`,
    solution: `def negate_matrix(A):
    return [[-x for x in row] for row in A]`,
    testCases: [
      { input: [[[1, -2], [3, 4]]], expected: [[-1, 2], [-3, -4]] },
      { input: [[[0, 0]]], expected: [[0, 0]] },
      { input: [[[1.5, -2.5]]], expected: [[-1.5, 2.5]] },
      { input: [[[0]]], expected: [[0]] },
    ],
    hint: "Negate each entry; the shape stays the same.",
  },
  {
    id: "la-142",
    title: "Matrix Equality Check",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return True if matrices A and B have the same shape and all corresponding entries differ by at most 1e-9.\n\nOtherwise return False.",
    starterCode: `def matrices_equal(A, B):
    # Your code here
    pass`,
    solution: `def matrices_equal(A, B):
    if len(A) != len(B):
        return False
    for i in range(len(A)):
        if len(A[i]) != len(B[i]):
            return False
        for j in range(len(A[i])):
            if abs(A[i][j] - B[i][j]) > 1e-9:
                return False
    return True`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 4]]], expected: true },
      { input: [[[1, 2], [3, 4]], [[1, 2], [3, 5]]], expected: false },
      { input: [[[1, 2]], [[1, 2], [3, 4]]], expected: false },
      { input: [[[0.1 + 0.2]], [[0.3]]], expected: true },
    ],
    hint: "Shape mismatch is an immediate False; otherwise compare entrywise with a tolerance.",
  },
  {
    id: "la-143",
    title: "Batch Row Dot Products",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the dot product of each corresponding pair of rows of A and B.\n\nReturn a list where entry i is sum_j A[i][j] * B[i][j]. A and B must have the same shape.",
    starterCode: `def row_dot_products(A, B):
    # Your code here
    pass`,
    solution: `def row_dot_products(A, B):
    return [sum(a * b for a, b in zip(A[i], B[i])) for i in range(len(A))]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: [17, 53] },
      { input: [[[1, 2], [3, 4]], [[1, 0], [0, 1]]], expected: [1, 4] },
      { input: [[[1, -1]], [[-1, 1]]], expected: [-2] },
      { input: [[[0, 0], [2, 3]], [[5, 5], [1, 1]]], expected: [0, 5] },
    ],
    hint: "This is a row-wise generalization of the vector dot product.",
  },
  {
    id: "la-144",
    title: "Column Means",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the mean of each column of data, given as a list of samples (rows) with one feature per column.\n\nReturn the means in column order as floats.",
    starterCode: `def column_means(data):
    # Your code here
    pass`,
    solution: `def column_means(data):
    n = len(data)
    return [sum(row[j] for row in data) / n for j in range(len(data[0]))]`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [3.0, 4.0] },
      { input: [[[1, 2], [2, 4]]], expected: [1.5, 3.0] },
      { input: [[[5, 5], [5, 5]]], expected: [5.0, 5.0] },
      { input: [[[1, 3, 5]]], expected: [1.0, 3.0, 5.0] },
    ],
    hint: "Average down each column, not across each row.",
  },
  {
    id: "la-145",
    title: "Row Means",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the mean of each row of data.\n\nReturn a list where entry i is the arithmetic mean of row i, as floats.",
    starterCode: `def row_means(data):
    # Your code here
    pass`,
    solution: `def row_means(data):
    return [sum(row) / len(row) for row in data]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [2.0, 5.0] },
      { input: [[[1, 1], [0, 0]]], expected: [1.0, 0.0] },
      { input: [[[2.5, 3.5]]], expected: [3.0] },
      { input: [[[0]]], expected: [0.0] },
    ],
    hint: "Each row is averaged independently.",
  },
  {
    id: "la-146",
    title: "Center Rows",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Center each row of data by subtracting that row's mean.\n\nReturn the centered data as a list of rows of floats; every centered row sums to 0.",
    starterCode: `def center_rows(data):
    # Your code here
    pass`,
    solution: `def center_rows(data):
    out = []
    for row in data:
        mean = sum(row) / len(row)
        out.append([x - mean for x in row])
    return out`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[-1.0, 0.0, 1.0], [-1.0, 0.0, 1.0]] },
      { input: [[[1, 1], [0, 2]]], expected: [[0.0, 0.0], [-1.0, 1.0]] },
      { input: [[[5]]], expected: [[0.0]] },
      { input: [[[1, 3], [2, 4]]], expected: [[-1.0, 1.0], [-1.0, 1.0]] },
    ],
    hint: "This is the row-wise analogue of centering columns.",
  },
  {
    id: "la-147",
    title: "Normalize Columns L2",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Normalize every column of matrix A to unit L2 length.\n\nIf a column is the zero vector, leave it as zeros. Return a list of rows of floats.",
    starterCode: `def normalize_columns(A):
    # Your code here
    pass`,
    solution: `def normalize_columns(A):
    rows = len(A)
    cols = len(A[0])
    norms = [sum(A[i][j] * A[i][j] for i in range(rows)) ** 0.5 for j in range(cols)]
    return [
        [0.0 if norms[j] == 0 else A[i][j] / norms[j] for j in range(cols)]
        for i in range(rows)
    ]`,
    testCases: [
      { input: [[[3, 0], [4, 0]]], expected: [[0.6, 0.0], [0.8, 0.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      {
        input: [[[1, 1], [1, 1]]],
        expected: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, 0.7071067811865475]],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Compute each column norm first, then scale all entries in that column.",
  },
  {
    id: "la-148",
    title: "Log-Sum-Exp",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the numerically stable log-sum-exp of a vector:\n\nLSE(v) = m + log(sum(exp(v[i] - m))), where m = max(v)\n\nThis avoids overflow for large entries.",
    starterCode: `def log_sum_exp(v):
    # Your code here
    pass`,
    solution: `def log_sum_exp(v):
    import math
    m = max(v)
    return m + math.log(sum(math.exp(x - m) for x in v))`,
    testCases: [
      { input: [[0, 0]], expected: 0.6931471805599453 },
      { input: [[1, 2, 3]], expected: 3.4076059644443806 },
      { input: [[1000, 1000]], expected: 1000.6931471805599 },
      { input: [[-1, -2]], expected: -0.6867383124817772 },
    ],
    hint: "Subtract the maximum before exponentiating, then add it back.",
  },
  {
    id: "la-149",
    title: "Softmax of Vector",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Compute the softmax of a vector:\n\nsoftmax(v)[i] = exp(v[i] - m) / sum_j exp(v[j] - m)\n\nwith m = max(v) for numerical stability. The outputs are positive and sum to 1.",
    starterCode: `def softmax(v):
    # Your code here
    pass`,
    solution: `def softmax(v):
    import math
    m = max(v)
    exps = [math.exp(x - m) for x in v]
    total = sum(exps)
    return [x / total for x in exps]`,
    testCases: [
      { input: [[0, 0]], expected: [0.5, 0.5] },
      { input: [[1, 2, 3]], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[0, 1]], expected: [0.2689414213699951, 0.7310585786300049] },
      { input: [[1000, 1000]], expected: [0.5, 0.5] },
    ],
    hint: "Softmax is invariant to adding a constant to every input, which is why max subtraction is safe.",
  },
  {
    id: "la-150",
    title: "Argmax per Row",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Return the index of the maximum entry in each row of A.\n\nBreak ties by returning the smallest index. Return a list of integers.",
    starterCode: `def row_argmax(A):
    # Your code here
    pass`,
    solution: `def row_argmax(A):
    out = []
    for row in A:
        best = 0
        for j in range(1, len(row)):
            if row[j] > row[best]:
                best = j
        out.append(best)
    return out`,
    testCases: [
      { input: [[[1, 3, 2], [5, 0, 4]]], expected: [1, 0] },
      { input: [[[1, 1], [2, 2]]], expected: [0, 0] },
      { input: [[[-5, -2, -9]]], expected: [1] },
      { input: [[[0]]], expected: [0] },
    ],
    hint: "Scan left to right and only replace on a strict improvement to keep the first index.",
  },
  {
    id: "la-151",
    title: "Threshold Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Keep entries of A that are strictly greater than the threshold t, and replace all others with 0.\n\nReturn the thresholded matrix.",
    starterCode: `def threshold_matrix(A, t):
    # Your code here
    pass`,
    solution: `def threshold_matrix(A, t):
    return [[x if x > t else 0 for x in row] for row in A]`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 2], expected: [[0, 0], [3, 4]] },
      { input: [[[-1, 0], [1, 2]], 0], expected: [[0, 0], [1, 2]] },
      { input: [[[5]], 10], expected: [[0]] },
      { input: [[[1.5, 2.5]], 2.0], expected: [[0, 2.5]] },
    ],
    hint: "The comparison is strict: entries equal to t become 0.",
  },
  {
    id: "la-152",
    title: "Clip Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Clip every entry of matrix A to the interval [lo, hi].\n\nEntries below lo become lo, entries above hi become hi, and entries inside are unchanged.",
    starterCode: `def clip_matrix(A, lo, hi):
    # Your code here
    pass`,
    solution: `def clip_matrix(A, lo, hi):
    return [[min(hi, max(lo, x)) for x in row] for row in A]`,
    testCases: [
      { input: [[[1, 5], [10, 2]], 2, 8], expected: [[2, 5], [8, 2]] },
      { input: [[[0, 0]], -1, 1], expected: [[0, 0]] },
      { input: [[[-5, 5]], 0, 0], expected: [[0, 0]] },
      { input: [[[1.5, -2.5], [3.0, 0.0]], -1.0, 2.0], expected: [[1.5, -1.0], [2.0, 0.0]] },
    ],
    hint: "Clamp each entry with min(hi, max(lo, x)).",
  },
  {
    id: "la-153",
    title: "Inverse Permutation of Indices",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Given a permutation p of the indices 0 through n-1, return its inverse permutation q.\n\nq is defined by q[p[i]] = i, so applying p and then q returns the identity order.",
    starterCode: `def inverse_permutation(p):
    # Your code here
    pass`,
    solution: `def inverse_permutation(p):
    q = [0] * len(p)
    for i in range(len(p)):
        q[p[i]] = i
    return q`,
    testCases: [
      { input: [[0, 1, 2]], expected: [0, 1, 2] },
      { input: [[1, 2, 0]], expected: [2, 0, 1] },
      { input: [[2, 0, 1]], expected: [1, 2, 0] },
      { input: [[1, 0]], expected: [1, 0] },
    ],
    hint: "Swap the roles of index and value.",
  },
  {
    id: "la-154",
    title: "Permutation Matrix",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Build the permutation matrix P for the permutation p, where p[i] is the destination column of row i:\n\nP[i][j] = 1 if j == p[i] else 0.\n\nMultiplying P by a vector permutes its entries according to p.",
    starterCode: `def permutation_matrix(p):
    # Your code here
    pass`,
    solution: `def permutation_matrix(p):
    n = len(p)
    return [[1 if j == p[i] else 0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[0, 1]], expected: [[1, 0], [0, 1]] },
      { input: [[1, 0]], expected: [[0, 1], [1, 0]] },
      { input: [[1, 2, 0]], expected: [[0, 1, 0], [0, 0, 1], [1, 0, 0]] },
      { input: [[2, 1, 0]], expected: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] },
    ],
    hint: "Each row has exactly one 1, in column p[i].",
  },
  {
    id: "la-155",
    title: "Vectorize Column-Major",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Flatten matrix A into a single list in column-major (Fortran) order.\n\nColumns are concatenated from left to right, and entries within a column from top to bottom.",
    starterCode: `def vectorize_column_major(A):
    # Your code here
    pass`,
    solution: `def vectorize_column_major(A):
    rows = len(A)
    cols = len(A[0])
    return [A[i][j] for j in range(cols) for i in range(rows)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [1, 3, 2, 4] },
      { input: [[[1, 2, 3]]], expected: [1, 2, 3] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 3, 5, 2, 4, 6] },
    ],
    hint: "Loop over columns first, then rows, unlike row-major flattening.",
  },
  {
    id: "la-156",
    title: "Unvectorize Column-Major",
    category: "Linear Algebra",
    difficulty: "Easy",
    description:
      "Rebuild a rows x cols matrix from a flat vector stored in column-major order.\n\nColumn 0 occupies the first rows entries of vec, column 1 the next rows entries, and so on.",
    starterCode: `def unvectorize_column_major(vec, rows, cols):
    # Your code here
    pass`,
    solution: `def unvectorize_column_major(vec, rows, cols):
    return [[vec[j * rows + i] for j in range(cols)] for i in range(rows)]`,
    testCases: [
      { input: [[1, 3, 2, 4], 2, 2], expected: [[1, 2], [3, 4]] },
      { input: [[1, 2, 3], 1, 3], expected: [[1, 2, 3]] },
      { input: [[1, 2, 3], 3, 1], expected: [[1], [2], [3]] },
      { input: [[1, 3, 5, 2, 4, 6], 3, 2], expected: [[1, 2], [3, 4], [5, 6]] },
    ],
    hint: "Entry (i, j) lives at index j * rows + i in the flat vector.",
  },
  {
    id: "la-157",
    title: "Column Standard Deviation",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the sample standard deviation (denominator n - 1) of each column of data.\n\nReturn the standard deviations in column order as floats. Assume at least two samples.",
    starterCode: `def column_std(data):
    # Your code here
    pass`,
    solution: `def column_std(data):
    n = len(data)
    out = []
    for j in range(len(data[0])):
        mean = sum(row[j] for row in data) / n
        var = sum((row[j] - mean) ** 2 for row in data) / (n - 1)
        out.append(var ** 0.5)
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [2.0, 2.0] },
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: [1.0, 1.0] },
      { input: [[[1, 0], [0, 1]]], expected: [0.7071067811865476, 0.7071067811865476] },
      { input: [[[5, 5], [5, 5]]], expected: [0.0, 0.0] },
    ],
    hint: "A zero-variance column has standard deviation 0.0.",
  },
  {
    id: "la-158",
    title: "Row Standard Deviation",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the sample standard deviation (denominator n - 1) of each row of data.\n\nReturn a list of standard deviations, one per row.",
    starterCode: `def row_std(data):
    # Your code here
    pass`,
    solution: `def row_std(data):
    out = []
    for row in data:
        n = len(row)
        mean = sum(row) / n
        var = sum((x - mean) ** 2 for x in row) / (n - 1)
        out.append(var ** 0.5)
    return out`,
    testCases: [
      { input: [[[1, 2, 3]]], expected: [1.0] },
      { input: [[[1, 1], [2, 2]]], expected: [0.0, 0.0] },
      { input: [[[1, 3, 5, 7]]], expected: [2.581988897471611] },
      { input: [[[0, 2], [4, 6]]], expected: [1.4142135623730951, 1.4142135623730951] },
    ],
    hint: "Rows of length 1 would divide by zero; the inputs have at least two entries per row.",
  },
  {
    id: "la-159",
    title: "Stable Softmax Rows",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Apply the numerically stable softmax to each row of matrix A independently.\n\nFor every row, subtract the row maximum before exponentiating, then normalize so each output row sums to 1.",
    starterCode: `def softmax_rows(A):
    # Your code here
    pass`,
    solution: `def softmax_rows(A):
    import math
    out = []
    for row in A:
        m = max(row)
        exps = [math.exp(x - m) for x in row]
        total = sum(exps)
        out.append([x / total for x in exps])
    return out`,
    testCases: [
      { input: [[[0, 0], [1, 1]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [[[0, 1]]], expected: [[0.2689414213699951, 0.7310585786300049]] },
      { input: [[[0, 1000]]], expected: [[0.0, 1.0]] },
      {
        input: [[[1, 2, 3]]],
        expected: [[0.09003057317038046, 0.24472847105479764, 0.6652409557748218]],
      },
    ],
    hint: "Max subtraction per row prevents overflow when one entry is huge.",
  },
  {
    id: "la-160",
    title: "Top-K Values per Row",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return the k largest values of each row of A, sorted in descending order.\n\nIf k exceeds the row length, return all values. Result entry i is the top-k list for row i.",
    starterCode: `def top_k_rows(A, k):
    # Your code here
    pass`,
    solution: `def top_k_rows(A, k):
    return [sorted(row, reverse=True)[:k] for row in A]`,
    testCases: [
      { input: [[[3, 1, 2], [6, 5, 4]], 2], expected: [[3, 2], [6, 5]] },
      { input: [[[1, 2, 3]], 3], expected: [[3, 2, 1]] },
      { input: [[[5, 5, 4]], 2], expected: [[5, 5]] },
      { input: [[[1, 2], [3, 4]], 1], expected: [[2], [4]] },
    ],
    hint: "Sort each row descending, then slice the first k entries.",
  },
  {
    id: "la-161",
    title: "Sort Each Row",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Sort the entries of every row of matrix A in ascending order.\n\nReturn a new matrix with the same shape.",
    starterCode: `def sort_rows(A):
    # Your code here
    pass`,
    solution: `def sort_rows(A):
    return [sorted(row) for row in A]`,
    testCases: [
      { input: [[[3, 1, 2], [6, 4, 5]]], expected: [[1, 2, 3], [4, 5, 6]] },
      { input: [[[-1, -3, -2]]], expected: [[-3, -2, -1]] },
      { input: [[[1, 1, 1]]], expected: [[1, 1, 1]] },
      { input: [[[2], [1]]], expected: [[2], [1]] },
    ],
    hint: "Each row is reordered independently of the others.",
  },
  {
    id: "la-162",
    title: "Rank of Each Element per Row",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Replace every entry of A with its rank within its row, where rank = 1 + the number of entries strictly smaller than it.\n\nTied entries therefore receive the same rank. Return integer ranks.",
    starterCode: `def row_ranks(A):
    # Your code here
    pass`,
    solution: `def row_ranks(A):
    out = []
    for row in A:
        out.append([1 + sum(1 for y in row if y < x) for x in row])
    return out`,
    testCases: [
      { input: [[[3, 1, 2]]], expected: [[3, 1, 2]] },
      { input: [[[10, 20, 20]]], expected: [[1, 2, 2]] },
      { input: [[[5, 4, 3, 2, 1]]], expected: [[5, 4, 3, 2, 1]] },
      { input: [[[7, 7, 7]]], expected: [[1, 1, 1]] },
    ],
    hint: "Competition ranking: tied values share the rank of the first occurrence.",
  },
  {
    id: "la-163",
    title: "Symmetric Part",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the symmetric part of a square matrix A:\n\nsym(A) = (A + A^T) / 2\n\nThe result is always symmetric.",
    starterCode: `def symmetric_part(A):
    # Your code here
    pass`,
    solution: `def symmetric_part(A):
    n = len(A)
    return [[(A[i][j] + A[j][i]) / 2 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[1.0, 2.5], [2.5, 4.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[1.0, 3.0, 5.0], [3.0, 5.0, 7.0], [5.0, 7.0, 9.0]],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "The diagonal entries are unchanged; off-diagonal pairs are averaged.",
  },
  {
    id: "la-164",
    title: "Skew-Symmetric Part",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the skew-symmetric part of a square matrix A:\n\nskew(A) = (A - A^T) / 2\n\nThe result has zero diagonal and satisfies skew(A)^T = -skew(A).",
    starterCode: `def skew_symmetric_part(A):
    # Your code here
    pass`,
    solution: `def skew_symmetric_part(A):
    n = len(A)
    return [[(A[i][j] - A[j][i]) / 2 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[0.0, -0.5], [0.5, 0.0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[0, 2], [-2, 0]]], expected: [[0.0, 2.0], [-2.0, 0.0]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[0.0, -1.0, -2.0], [1.0, 0.0, -1.0], [2.0, 1.0, 0.0]],
      },
    ],
    hint: "Together, the symmetric and skew parts reconstruct A.",
  },
  {
    id: "la-165",
    title: "Rotation Matrix from Angle",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 2x2 counterclockwise rotation matrix for theta degrees:\n\nR = [[cos(t), -sin(t)], [sin(t), cos(t)]]\n\nwith t = radians(theta).",
    starterCode: `def rotation_matrix_2d(theta_degrees):
    # Your code here
    pass`,
    solution: `def rotation_matrix_2d(theta_degrees):
    import math
    t = math.radians(theta_degrees)
    c = math.cos(t)
    s = math.sin(t)
    return [[c, -s], [s, c]]`,
    testCases: [
      { input: [90], expected: [[0.0, -1.0], [1.0, 0.0]] },
      { input: [0], expected: [[1.0, 0.0], [0.0, 1.0]] },
      { input: [180], expected: [[-1.0, 0.0], [0.0, -1.0]] },
      { input: [45], expected: [[0.7071067811865476, -0.7071067811865476], [0.7071067811865476, 0.7071067811865476]] },
    ],
    hint: "The matrix is orthogonal with determinant 1.",
  },
  {
    id: "la-166",
    title: "Angle from Rotation Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Recover the rotation angle in degrees from a 2D rotation matrix R:\n\ntheta = degrees(atan2(R[1][0], R[0][0]))\n\nThe result lies between -180 and 180 degrees.",
    starterCode: `def rotation_angle(R):
    # Your code here
    pass`,
    solution: `def rotation_angle(R):
    import math
    return math.degrees(math.atan2(R[1][0], R[0][0]))`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: 0.0 },
      { input: [[[0, -1], [1, 0]]], expected: 90.0 },
      { input: [[[-1, 0], [0, -1]]], expected: 180.0 },
      { input: [[[0.7071067811865476, 0.7071067811865476], [-0.7071067811865476, 0.7071067811865476]]], expected: -45.0 },
    ],
    hint: "atan2 uses the sign of both components, so it distinguishes clockwise from counterclockwise.",
  },
  {
    id: "la-167",
    title: "Reflection Matrix across Line",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 2x2 matrix that reflects across the line through the origin at angle theta degrees:\n\nR = [[cos(2t), sin(2t)], [sin(2t), -cos(2t)]]\n\nwith t = radians(theta).",
    starterCode: `def reflection_matrix_2d(theta_degrees):
    # Your code here
    pass`,
    solution: `def reflection_matrix_2d(theta_degrees):
    import math
    t = math.radians(theta_degrees)
    c = math.cos(2 * t)
    s = math.sin(2 * t)
    return [[c, s], [s, -c]]`,
    testCases: [
      { input: [0], expected: [[1.0, 0.0], [0.0, -1.0]] },
      { input: [90], expected: [[-1.0, 0.0], [0.0, 1.0]] },
      { input: [45], expected: [[0.0, 1.0], [1.0, 0.0]] },
      { input: [30], expected: [[0.5, 0.8660254037844386], [0.8660254037844386, -0.5]] },
    ],
    hint: "A reflection matrix is symmetric with determinant -1 and has the line as its +1 eigenspace.",
  },
  {
    id: "la-168",
    title: "Projection Matrix onto Line",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Build the 2x2 orthogonal projection matrix onto the line through the origin at angle theta degrees.\n\nWith c = cos(t) and s = sin(t), P = [[c^2, c*s], [c*s, s^2]]. The matrix is symmetric and idempotent.",
    starterCode: `def projection_matrix_2d(theta_degrees):
    # Your code here
    pass`,
    solution: `def projection_matrix_2d(theta_degrees):
    import math
    t = math.radians(theta_degrees)
    c = math.cos(t)
    s = math.sin(t)
    return [[c * c, c * s], [c * s, s * s]]`,
    testCases: [
      { input: [0], expected: [[1.0, 0.0], [0.0, 0.0]] },
      { input: [90], expected: [[0.0, 0.0], [0.0, 1.0]] },
      { input: [45], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [30], expected: [[0.75, 0.4330127018922193], [0.4330127018922193, 0.25]] },
    ],
    hint: "P = u*u^T where u is the unit vector along the line.",
  },
  {
    id: "la-169",
    title: "Compose Homogeneous Transforms",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compose two 3x3 homogeneous transforms by matrix multiplication: result = T1 * T2.\n\nSince vectors are transformed as T*v, the transform T2 is applied first, then T1.",
    starterCode: `def compose_homogeneous(T1, T2):
    # Your code here
    pass`,
    solution: `def compose_homogeneous(T1, T2):
    n = len(T1)
    return [[sum(T1[i][k] * T2[k][j] for k in range(n)) for j in range(n)] for i in range(n)]`,
    testCases: [
      {
        input: [[[1, 0, 2], [0, 1, 3], [0, 0, 1]], [[1, 0, 1], [0, 1, 1], [0, 0, 1]]],
        expected: [[1, 0, 3], [0, 1, 4], [0, 0, 1]],
      },
      {
        input: [[[2, 0, 0], [0, 3, 0], [0, 0, 1]], [[1, 0, 1], [0, 1, 2], [0, 0, 1]]],
        expected: [[2, 0, 2], [0, 3, 6], [0, 0, 1]],
      },
      {
        input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[1, 0, 5], [0, 1, 7], [0, 0, 1]]],
        expected: [[1, 0, 5], [0, 1, 7], [0, 0, 1]],
      },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      },
    ],
    hint: "Transform composition is ordinary 3x3 matrix multiplication.",
  },
  {
    id: "la-170",
    title: "Inverse Homogeneous Transform",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Invert a 3x3 homogeneous transform T = [[A, t], [0, 0, 1]], where A is an invertible 2x2 linear part and t is a translation.\n\nReturn [[inv(A), -inv(A)*t], [0, 0, 1]], or None if det(A) == 0.",
    starterCode: `def inverse_homogeneous(T):
    # Your code here
    pass`,
    solution: `def inverse_homogeneous(T):
    det = T[0][0] * T[1][1] - T[0][1] * T[1][0]
    if det == 0:
        return None
    a = T[1][1] / det
    b = -T[0][1] / det
    c = -T[1][0] / det
    d = T[0][0] / det
    tx = -(a * T[0][2] + b * T[1][2])
    ty = -(c * T[0][2] + d * T[1][2])
    return [[a, b, tx], [c, d, ty], [0.0, 0.0, 1.0]]`,
    testCases: [
      {
        input: [[[1, 0, 2], [0, 1, 3], [0, 0, 1]]],
        expected: [[1.0, 0.0, -2.0], [0.0, 1.0, -3.0], [0.0, 0.0, 1.0]],
      },
      {
        input: [[[2, 0, 0], [0, 3, 0], [0, 0, 1]]],
        expected: [[0.5, 0.0, 0.0], [0.0, 0.3333333333333333, 0.0], [0.0, 0.0, 1.0]],
      },
      {
        input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
        expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
      },
      {
        input: [[[0, -1, 0], [1, 0, 1], [0, 0, 1]]],
        expected: [[0.0, 1.0, -1.0], [-1.0, 0.0, 0.0], [0.0, 0.0, 1.0]],
      },
    ],
    hint: "For a rotation plus translation, the inverse rotation is the transpose; here use the general 2x2 inverse.",
  },
  {
    id: "la-171",
    title: "Euclidean Distance Matrix",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Given a list of points, return the full pairwise Euclidean distance matrix:\n\nD[i][j] = ||points[i] - points[j]||_2\n\nThe matrix is symmetric with zero diagonal.",
    starterCode: `def distance_matrix(points):
    # Your code here
    pass`,
    solution: `def distance_matrix(points):
    n = len(points)
    out = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            out[i][j] = sum((points[i][k] - points[j][k]) ** 2 for k in range(len(points[i]))) ** 0.5
    return out`,
    testCases: [
      { input: [[[0, 0], [3, 4]]], expected: [[0.0, 5.0], [5.0, 0.0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      {
        input: [[[0, 0], [1, 0], [0, 1]]],
        expected: [[0.0, 1.0, 1.0], [1.0, 0.0, 1.4142135623730951], [1.0, 1.4142135623730951, 0.0]],
      },
      { input: [[[0, 0, 0], [1, 2, 2]]], expected: [[0.0, 3.0], [3.0, 0.0]] },
    ],
    hint: "Compute each pair independently; the diagonal is always zero.",
  },
  {
    id: "la-172",
    title: "Mahalanobis Distance (Diagonal Covariance)",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Compute the Mahalanobis distance between x and y under a diagonal covariance with variances given per dimension:\n\nd = sqrt(sum((x[i] - y[i])^2 / variances[i]))\n\nAssume all variances are positive.",
    starterCode: `def mahalanobis_diagonal(x, y, variances):
    # Your code here
    pass`,
    solution: `def mahalanobis_diagonal(x, y, variances):
    return sum((x[i] - y[i]) ** 2 / variances[i] for i in range(len(x))) ** 0.5`,
    testCases: [
      { input: [[1, 2], [2, 4], [1, 1]], expected: 2.23606797749979 },
      { input: [[1, 2], [2, 4], [1, 4]], expected: 1.4142135623730951 },
      { input: [[1, 1], [1, 1], [1, 1]], expected: 0.0 },
      { input: [[0, 0], [3, 4], [9, 16]], expected: 1.4142135623730951 },
    ],
    hint: "Scaling each axis by its standard deviation turns this into a Euclidean distance.",
  },
  {
    id: "la-173",
    title: "Apply Inverse Affine Transform",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Given a 2D affine transform defined by matrix A (2x2) and translation t, apply its inverse to point p:\n\np' = inv(A) * (p - t)\n\nReturn None if det(A) == 0.",
    starterCode: `def apply_affine_inverse(A, t, p):
    # Your code here
    pass`,
    solution: `def apply_affine_inverse(A, t, p):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    if det == 0:
        return None
    inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
    d = [p[0] - t[0], p[1] - t[1]]
    return [inv[0][0] * d[0] + inv[0][1] * d[1], inv[1][0] * d[0] + inv[1][1] * d[1]]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [1, 1], [3, 4]], expected: [2.0, 3.0] },
      { input: [[[2, 0], [0, 3]], [0, 0], [4, 9]], expected: [2.0, 3.0] },
      { input: [[[1, 1], [0, 1]], [1, 2], [2, 3]], expected: [0.0, 1.0] },
      { input: [[[1, 1], [2, 2]], [0, 0], [1, 1]], expected: null },
    ],
    hint: "Translate first, then undo the linear part with the 2x2 inverse.",
  },
  {
    id: "la-174",
    title: "Residual Norm of Eigenpair",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Measure how well the pair (lam, v) satisfies the eigenvalue equation for A:\n\nresidual = ||A*v - lam*v||_2\n\nA residual near 0 indicates an accurate eigenpair.",
    starterCode: `def eigenpair_residual(A, lam, v):
    # Your code here
    pass`,
    solution: `def eigenpair_residual(A, lam, v):
    n = len(v)
    Av = [sum(A[i][j] * v[j] for j in range(n)) for i in range(n)]
    return sum((Av[i] - lam * v[i]) ** 2 for i in range(n)) ** 0.5`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 2, [1, 0]], expected: 0.0 },
      { input: [[[2, 0], [0, 3]], 2, [1, 1]], expected: 1.0 },
      { input: [[[0, 1], [1, 0]], 1, [1, 1]], expected: 0.0 },
      { input: [[[4, 1], [2, 3]], 2, [1, 0]], expected: 2.8284271247461903 },
    ],
    hint: "This is the norm of the residual vector for a single eigenpair.",
  },
  {
    id: "la-175",
    title: "Stochastic Matrix Check",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "Return True if A is a row-stochastic matrix: it must be square, every entry must be non-negative (within 1e-9), and every row must sum to 1 (within 1e-9).\n\nOtherwise return False.",
    starterCode: `def is_stochastic(A):
    # Your code here
    pass`,
    solution: `def is_stochastic(A):
    n = len(A)
    if n == 0 or len(A[0]) != n:
        return False
    for row in A:
        if any(x < -1e-9 for x in row):
            return False
        if abs(sum(row) - 1) > 1e-9:
            return False
    return True`,
    testCases: [
      { input: [[[0.5, 0.5], [1, 0]]], expected: true },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: true },
      { input: [[[1.2, -0.2], [0.5, 0.5]]], expected: false },
      { input: [[[0.6, 0.6], [0, 1]]], expected: false },
    ],
    hint: "A Markov transition matrix is row-stochastic; check non-negativity and row sums.",
  },
  {
    id: "la-176",
    title: "Gershgorin Discs",
    category: "Linear Algebra",
    difficulty: "Medium",
    description:
      "For each row of square matrix A, return its Gershgorin disc as [center, radius], where\n\ncenter = A[i][i] and radius = sum of |A[i][j]| over j != i.\n\nEvery eigenvalue of A lies in the union of these discs.",
    starterCode: `def gershgorin_discs(A):
    # Your code here
    pass`,
    solution: `def gershgorin_discs(A):
    n = len(A)
    return [
        [float(A[i][i]), float(sum(abs(A[i][j]) for j in range(n) if j != i))]
        for i in range(n)
    ]`,
    testCases: [
      { input: [[[2, 1], [1, 3]]], expected: [[2.0, 1.0], [3.0, 1.0]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[1.0, 5.0], [5.0, 10.0], [9.0, 15.0]],
      },
      { input: [[[0, 0], [0, 0]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[1.5, -2.5], [0, 3.0]]], expected: [[1.5, 2.5], [3.0, 0.0]] },
    ],
    hint: "The Gershgorin circle theorem bounds the spectrum by row-wise discs.",
  },
  {
    id: "la-177",
    title: "Power Iteration Deflation Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Deflate the known eigenpair (lam, v) from matrix A, where v is a unit eigenvector:\n\nA' = A - lam * v*v^T\n\nThe largest eigenvalue of A' is then the second eigenvalue of A. Return the deflated matrix.",
    starterCode: `def deflation_step(A, lam, v):
    # Your code here
    pass`,
    solution: `def deflation_step(A, lam, v):
    n = len(v)
    return [[A[i][j] - lam * v[i] * v[j] for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [[[2, 0], [0, 3]], 2, [1, 0]], expected: [[0.0, 0.0], [0.0, 3.0]] },
      {
        input: [[[2, 1], [1, 2]], 3, [0.7071067811865475, 0.7071067811865475]],
        expected: [[0.5, -0.5], [-0.5, 0.5]],
      },
      {
        input: [[[4, 1], [2, 3]], 5, [0.7071067811865475, 0.7071067811865475]],
        expected: [[1.5, -1.5], [-0.5, 0.5]],
      },
      { input: [[[1, 0], [0, 1]], 1, [1, 0]], expected: [[0.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Subtract the rank-1 spectral component lam*v*v^T.",
  },
  {
    id: "la-178",
    title: "Markov Stationary Distribution",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Estimate the stationary distribution of a row-stochastic matrix P by power iteration.\n\nStart with the uniform row vector v = [1/n, ..., 1/n] and repeat v = v*P for num_iterations steps. Return the final row vector.",
    starterCode: `def stationary_distribution(P, num_iterations):
    # Your code here
    pass`,
    solution: `def stationary_distribution(P, num_iterations):
    n = len(P)
    v = [1.0 / n] * n
    for _ in range(num_iterations):
        v = [sum(v[i] * P[i][j] for i in range(n)) for j in range(n)]
    return v`,
    testCases: [
      { input: [[[0.5, 0.5], [1, 0]], 50], expected: [0.6666666666666667, 0.3333333333333333] },
      { input: [[[0, 1], [1, 0]], 10], expected: [0.5, 0.5] },
      { input: [[[1, 0], [0, 1]], 5], expected: [0.5, 0.5] },
      { input: [[[0.9, 0.1], [0.3, 0.7]], 50], expected: [0.75, 0.25] },
    ],
    hint: "Stationary distributions satisfy v*P = v, which power iteration converges to for nice chains.",
  },
  {
    id: "la-179",
    title: "PageRank Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one PageRank update from rank vector v (which sums to 1) on adjacency matrix A, with damping d.\n\nBuild the row-stochastic M where M[i][j] = A[i][j] / row_sum_i, distributing uniformly when a row has no outgoing links. Then return v*M scaled by d plus the teleportation term (1-d)/n in every entry.",
    starterCode: `def pagerank_step(A, d, v):
    # Your code here
    pass`,
    solution: `def pagerank_step(A, d, v):
    n = len(A)
    M = []
    for i in range(n):
        total = sum(A[i])
        if total == 0:
            M.append([1.0 / n] * n)
        else:
            M.append([A[i][j] / total for j in range(n)])
    vM = [sum(v[i] * M[i][j] for i in range(n)) for j in range(n)]
    return [d * vM[j] + (1 - d) / n for j in range(n)]`,
    testCases: [
      { input: [[[0, 1], [1, 0]], 0.85, [0.5, 0.5]], expected: [0.5, 0.5] },
      {
        input: [[[0, 1, 0], [0, 0, 1], [1, 0, 0]], 0.85, [0.3333333333333333, 0.3333333333333333, 0.3333333333333333]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      { input: [[[0, 1], [0, 0]], 0.5, [0.5, 0.5]], expected: [0.375, 0.625] },
      {
        input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], 0.85, [0.3333333333333333, 0.3333333333333333, 0.3333333333333333]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
    ],
    hint: "Dangling nodes (no outgoing links) jump uniformly; teleportation keeps the vector summing to 1.",
  },
  {
    id: "la-180",
    title: "Spectral Gap 2x2",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the spectral gap of a 2x2 matrix with real eigenvalues:\n\ngap = |lambda1| - |lambda2|, where lambda1 and lambda2 are the eigenvalues from the characteristic polynomial.\n\nReturn None if the discriminant is negative (complex eigenvalues).",
    starterCode: `def spectral_gap_2x2(A):
    # Your code here
    pass`,
    solution: `def spectral_gap_2x2(A):
    tr = A[0][0] + A[1][1]
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    disc = tr * tr - 4 * det
    if disc < 0:
        return None
    root = disc ** 0.5
    l1 = (tr + root) / 2
    l2 = (tr - root) / 2
    return abs(l1) - abs(l2)`,
    testCases: [
      { input: [[[3, 0], [0, 1]]], expected: 2.0 },
      { input: [[[2, 1], [1, 2]]], expected: 2.0 },
      { input: [[[4, 1], [2, 3]]], expected: 3.0 },
      { input: [[[1, 1], [-1, 1]]], expected: null },
    ],
    hint: "The gap determines how fast power iteration converges.",
  },
  {
    id: "la-181",
    title: "Kabsch Rotation 2D",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Find the 2D rotation matrix that best aligns point set P to point set Q under the Kabsch algorithm.\n\nCenter both sets by their centroids, compute num = sum(px*qy - py*qx) and den = sum(px*qx + py*qy), set theta = atan2(num, den), and return [[cos, -sin], [sin, cos]]. The two sets must have the same number of points.",
    starterCode: `def kabsch_rotation_2d(P, Q):
    # Your code here
    pass`,
    solution: `def kabsch_rotation_2d(P, Q):
    import math
    n = len(P)
    cp = [sum(p[0] for p in P) / n, sum(p[1] for p in P) / n]
    cq = [sum(q[0] for q in Q) / n, sum(q[1] for q in Q) / n]
    num = 0.0
    den = 0.0
    for i in range(n):
        px = P[i][0] - cp[0]
        py = P[i][1] - cp[1]
        qx = Q[i][0] - cq[0]
        qy = Q[i][1] - cq[1]
        num += px * qy - py * qx
        den += px * qx + py * qy
    t = math.atan2(num, den)
    c = math.cos(t)
    s = math.sin(t)
    return [[c, -s], [s, c]]`,
    testCases: [
      { input: [[[1, 0], [0, 1]], [[0, 1], [-1, 0]]], expected: [[0.0, -1.0], [1.0, 0.0]] },
      {
        input: [[[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [0, 1]]],
        expected: [[1.0, 0.0], [0.0, 1.0]],
      },
      { input: [[[-1, 0], [0, -1]], [[1, 0], [0, 1]]], expected: [[-1.0, 0.0], [0.0, -1.0]] },
      { input: [[[1, 0]], [[5, 5]]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Centering removes translation; the optimal angle comes from the cross-covariance terms.",
  },
  {
    id: "la-182",
    title: "Khatri-Rao Product",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Compute the Khatri-Rao product of A (m x k) and B (n x k): the column-wise Kronecker product.\n\nColumn j of the result is kron(A[:, j], B[:, j]), giving an (m*n) x k matrix with entries grouped by (i, r) row-major.",
    starterCode: `def khatri_rao(A, B):
    # Your code here
    pass`,
    solution: `def khatri_rao(A, B):
    m = len(A)
    k = len(A[0])
    n = len(B)
    out = [[0] * k for _ in range(m * n)]
    idx = 0
    for i in range(m):
        for r in range(n):
            for j in range(k):
                out[idx][j] = A[i][j] * B[r][j]
            idx += 1
    return out`,
    testCases: [
      {
        input: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
        expected: [[5, 12], [7, 16], [15, 24], [21, 32]],
      },
      { input: [[[1], [2]], [[3], [4]]], expected: [[3], [4], [6], [8]] },
      { input: [[[1, 0]], [[1, 1], [1, 1]]], expected: [[1, 0], [1, 0]] },
      { input: [[[2, 1], [0, 3]], [[1, 2]]], expected: [[2, 2], [0, 6]] },
    ],
    hint: "Match columns by index and apply the Kronecker product column by column.",
  },
  {
    id: "la-183",
    title: "Matrix Square Root Newton Step",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Perform one Newton iteration for the matrix square root of A, starting from X:\n\nX_new = 0.5 * (X + A * inv(X))\n\nA and X are 2x2 matrices. Return None if X is singular. For a good starting X this doubles the number of correct digits.",
    starterCode: `def sqrt_newton_step(A, X):
    # Your code here
    pass`,
    solution: `def sqrt_newton_step(A, X):
    det = X[0][0] * X[1][1] - X[0][1] * X[1][0]
    if det == 0:
        return None
    Xi = [[X[1][1] / det, -X[0][1] / det], [-X[1][0] / det, X[0][0] / det]]
    AX = [[sum(A[i][k] * Xi[k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    return [[0.5 * (X[i][j] + AX[i][j]) for j in range(2)] for i in range(2)]`,
    testCases: [
      { input: [[[4, 0], [0, 9]], [[2, 0], [0, 3]]], expected: [[2.0, 0.0], [0.0, 3.0]] },
      { input: [[[4, 0], [0, 9]], [[1, 0], [0, 1]]], expected: [[2.5, 0.0], [0.0, 5.0]] },
      { input: [[[5, 4], [4, 5]], [[2, 0], [0, 2]]], expected: [[2.25, 1.0], [1.0, 2.25]] },
      { input: [[[1, 0], [0, 1]], [[1, 1], [1, 1]]], expected: null },
    ],
    hint: "This is the matrix analogue of the scalar Newton iteration x <- (x + a/x) / 2.",
  },
  {
    id: "la-184",
    title: "Matrix Logarithm Series",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Approximate log(I + A) for a 2x2 matrix A with the truncated Mercator series:\n\nlog(I + A) = sum over k = 1..num_terms of (-1)^(k+1) * A^k / k\n\nReturn the resulting matrix of floats.",
    starterCode: `def matrix_log_series(A, num_terms):
    # Your code here
    pass`,
    solution: `def matrix_log_series(A, num_terms):
    n = len(A)
    R = [[0.0] * n for _ in range(n)]
    T = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    for k in range(1, num_terms + 1):
        T = [[sum(T[i][t] * A[t][j] for t in range(n)) for j in range(n)] for i in range(n)]
        sign = 1 if k % 2 == 1 else -1
        R = [[R[i][j] + sign * T[i][j] / k for j in range(n)] for i in range(n)]
    return R`,
    testCases: [
      { input: [[[0, 0], [0, 0]], 5], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[[0, 1], [0, 0]], 5], expected: [[0.0, 1.0], [0.0, 0.0]] },
      {
        input: [[[1, 0], [0, 1]], 10],
        expected: [[0.6456349206349207, 0.0], [0.0, 0.6456349206349207]],
      },
      {
        input: [[[0, -1], [1, 0]], 20],
        expected: [[0.32281746031746034, -0.7604599047323508], [0.7604599047323508, 0.32281746031746034]],
      },
    ],
    hint: "Maintain the running power T = A^k and alternate the sign each term.",
  },
  {
    id: "la-185",
    title: "Condition Estimate via Power Iterations",
    category: "Linear Algebra",
    difficulty: "Hard",
    description:
      "Estimate the 2-norm condition number of A as the ratio sigma_max / sigma_min.\n\nUse power iteration (starting from all ones) on B = A^T A to get sigma_max, and on inv(B) to get 1 / sigma_min; return their product. Return None if B is singular.",
    starterCode: `def condition_estimate(A, num_iterations):
    # Your code here
    pass`,
    solution: `def condition_estimate(A, num_iterations):
    n = len(A)
    m = len(A[0])
    B = [[sum(A[t][i] * A[t][j] for t in range(n)) for j in range(m)] for i in range(m)]
    def top(M):
        size = len(M)
        v = [1.0] * size
        for _ in range(num_iterations):
            w = [sum(M[i][j] * v[j] for j in range(size)) for i in range(size)]
            norm = sum(x * x for x in w) ** 0.5
            if norm == 0:
                return 0.0
            v = [x / norm for x in w]
        Mv = [sum(M[i][j] * v[j] for j in range(size)) for i in range(size)]
        return sum(v[i] * Mv[i] for i in range(size)) ** 0.5
    det = B[0][0] * B[1][1] - B[0][1] * B[1][0]
    if det == 0:
        return None
    Binv = [[B[1][1] / det, -B[0][1] / det], [-B[1][0] / det, B[0][0] / det]]
    return top(B) * top(Binv)`,
    testCases: [
      { input: [[[1, 0], [0, 2]], 10], expected: 2.0 },
      { input: [[[1, 0], [0, 1]], 10], expected: 1.0 },
      { input: [[[1, 2], [3, 4]], 30], expected: 14.933034373659252 },
      { input: [[[4, 1], [1, 3]], 20], expected: 1.9387489019317519 },
    ],
    hint: "The largest eigenvalue of inv(A^T A) is the reciprocal of the smallest eigenvalue of A^T A.",
  },
];
