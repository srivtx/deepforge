import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-216",
    title: "GCD of Strings",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given two strings, return the largest string x such that x divides both str1 and str2, where x divides a string when the string is x repeated some number of times.\n\nIf str1 + str2 differs from str2 + str1 the answer is the empty string. Otherwise the common divisor must have length gcd(len(str1), len(str2)), so return that prefix.",
    starterCode: `def gcd_of_strings(str1, str2):
    # Your code here
    pass`,
    solution: `from math import gcd

def gcd_of_strings(str1, str2):
    if str1 + str2 != str2 + str1:
        return ""
    g = gcd(len(str1), len(str2))
    return str1[:g]`,
    testCases: [
      { input: ["ABCABC", "ABC"], expected: "ABC" },
      { input: ["ABABAB", "ABAB"], expected: "AB" },
      { input: ["LEET", "CODE"], expected: "" },
      { input: ["", ""], expected: "" },
      { input: ["A", "A"], expected: "A" },
      { input: ["ABC", "ABCABC"], expected: "ABC" },
    ],
    hint: "If a common divisor exists, both strings are repetitions of the same block.",
  },
  {
    id: "al-217",
    title: "Toeplitz Matrix Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if every diagonal of the matrix running from top-left to bottom-right is constant, and False otherwise.\n\nCompare each cell with its upper-left neighbour, skipping the first row and column. Empty and single-row matrices are toeplitz by definition.",
    starterCode: `def is_toeplitz(matrix):
    # Your code here
    pass`,
    solution: `def is_toeplitz(matrix):
    for r in range(1, len(matrix)):
        for c in range(1, len(matrix[r])):
            if matrix[r][c] != matrix[r - 1][c - 1]:
                return False
    return True`,
    testCases: [
      { input: [[[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]], expected: true },
      { input: [[[1, 2], [2, 2]]], expected: false },
      { input: [[[1]]], expected: true },
      { input: [[]], expected: true },
      { input: [[[1, 2]]], expected: true },
    ],
    hint: "Cell (r, c) must equal cell (r - 1, c - 1).",
  },
  {
    id: "al-218",
    title: "Rectangle Overlap Area",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given two axis-aligned rectangles by their corners (ax1, ay1, ax2, ay2) and (bx1, by1, bx2, by2), return the area of their intersection, or 0 when they do not overlap.\n\nThe overlap width is the smaller right edge minus the larger left edge, and likewise for the height. Rectangles that only touch along an edge have zero overlap area.",
    starterCode: `def rectangle_overlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2):
    # Your code here
    pass`,
    solution: `def rectangle_overlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2):
    width = min(ax2, bx2) - max(ax1, bx1)
    height = min(ay2, by2) - max(ay1, by1)
    if width <= 0 or height <= 0:
        return 0
    return width * height`,
    testCases: [
      { input: [0, 0, 2, 2, 1, 1, 3, 3], expected: 1 },
      { input: [0, 0, 1, 1, 2, 2, 3, 3], expected: 0 },
      { input: [0, 0, 2, 2, 0, 0, 2, 2], expected: 4 },
      { input: [0, 0, 1, 1, 1, 1, 2, 2], expected: 0 },
      { input: [-1, -1, 1, 1, 0, 0, 2, 2], expected: 1 },
    ],
    hint: "Clamp the overlap to zero whenever the computed width or height is not positive.",
  },
  {
    id: "al-219",
    title: "Island Perimeter",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given a grid of 0 water and 1 land cells, return the total perimeter around all land.\n\nEach land cell contributes four edges, and every shared edge with the cell above or to the left removes two. Return 0 for empty or all-water grids.",
    starterCode: `def island_perimeter(grid):
    # Your code here
    pass`,
    solution: `def island_perimeter(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    total = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                total += 4
                if r > 0 and grid[r - 1][c] == 1:
                    total -= 2
                if c > 0 and grid[r][c - 1] == 1:
                    total -= 2
    return total`,
    testCases: [
      { input: [[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]], expected: 16 },
      { input: [[[1]]], expected: 4 },
      { input: [[[1, 0]]], expected: 4 },
      { input: [[[1, 1], [1, 1]]], expected: 8 },
      { input: [[[0]]], expected: 0 },
    ],
    hint: "Count each adjacency only once, using the top and left neighbours.",
  },
  {
    id: "al-220",
    title: "Flood Fill with BFS or DFS",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given an image grid, a starting pixel (sr, sc) and a new colour, return a copy of the image with the four-directionally connected region of the original colour recoloured.\n\nIf the starting colour already equals the new colour, return the image unchanged to avoid infinite spreading. Use BFS or DFS.",
    starterCode: `def flood_fill(image, sr, sc, color):
    # Your code here
    pass`,
    solution: `def flood_fill(image, sr, sc, color):
    rows = len(image)
    cols = len(image[0]) if rows else 0
    original = image[sr][sc]
    if original == color:
        return [row[:] for row in image]
    out = [row[:] for row in image]
    queue = [(sr, sc)]
    head = 0
    out[sr][sc] = color
    while head < len(queue):
        r, c = queue[head]
        head += 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and out[nr][nc] == original:
                out[nr][nc] = color
                queue.append((nr, nc))
    return out`,
    testCases: [
      { input: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { input: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
      { input: [[[0, 0, 0], [0, 1, 1]], 1, 1, 1], expected: [[0, 0, 0], [0, 1, 1]] },
      { input: [[[5]], 0, 0, 3], expected: [[3]] },
      { input: [[[1]], 0, 0, 1], expected: [[1]] },
    ],
    hint: "Mark cells with the new colour when enqueueing so they are never visited twice.",
  },
  {
    id: "al-221",
    title: "Max Area of Island",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the largest area of a four-directionally connected group of 1 cells in a grid of 0 and 1.\n\nRun BFS from every unvisited land cell and track the size of each flood fill. Return 0 when there is no land.",
    starterCode: `def max_area_of_island(grid):
    # Your code here
    pass`,
    solution: `def max_area_of_island(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    seen = [[False] * cols for _ in range(rows)]
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and not seen[r][c]:
                seen[r][c] = True
                queue = [(r, c)]
                head = 0
                while head < len(queue):
                    cr, cc = queue[head]
                    head += 1
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not seen[nr][nc]:
                            seen[nr][nc] = True
                            queue.append((nr, nc))
                if len(queue) > best:
                    best = len(queue)
    return best`,
    testCases: [
      { input: [[[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]]], expected: 6 },
      { input: [[[0, 0, 0, 0]]], expected: 0 },
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 1], [0, 1]]], expected: 3 },
      { input: [[]], expected: 0 },
    ],
    hint: "The queue length after a flood fill equals the island area.",
  },
  {
    id: "al-222",
    title: "Count Magic Squares",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the 3 by 3 contiguous subgrids of grid that are magic squares: they contain each digit from 1 to 9 exactly once and every row, column and diagonal sums to 15.\n\nCheck every possible top-left corner of a 3 by 3 window. Return 0 for grids smaller than 3 by 3.",
    starterCode: `def count_magic_squares(grid):
    # Your code here
    pass`,
    solution: `def count_magic_squares(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    total = 0
    for r in range(rows - 2):
        for c in range(cols - 2):
            values = [grid[r + i][c + j] for i in range(3) for j in range(3)]
            if sorted(values) != list(range(1, 10)):
                continue
            target = 15
            ok = True
            for i in range(3):
                if sum(grid[r + i][c + j] for j in range(3)) != target:
                    ok = False
                if sum(grid[r + j][c + i] for j in range(3)) != target:
                    ok = False
            if grid[r][c] + grid[r + 1][c + 1] + grid[r + 2][c + 2] != target:
                ok = False
            if grid[r][c + 2] + grid[r + 1][c + 1] + grid[r + 2][c] != target:
                ok = False
            if ok:
                total += 1
    return total`,
    testCases: [
      { input: [[[4, 3, 8, 4], [9, 5, 1, 9], [2, 7, 6, 2]]], expected: 1 },
      { input: [[[8]]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[[5, 5, 5], [5, 5, 5], [5, 5, 5]]], expected: 0 },
      { input: [[[4, 3, 8], [9, 5, 1], [2, 7, 6]]], expected: 1 },
    ],
    hint: "A 3 by 3 magic square must be a permutation of 1 through 9 and every line sums to 15.",
  },
  {
    id: "al-223",
    title: "Tic-Tac-Toe Winner",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given a 3 by 3 tic-tac-toe board of X, O and space characters, return the winning symbol, or the empty string when there is no winner.\n\nCheck all three rows, three columns and two diagonals for three equal non-space marks. Assume the position is valid with at most one winner.",
    starterCode: `def tic_tac_toe_winner(board):
    # Your code here
    pass`,
    solution: `def tic_tac_toe_winner(board):
    lines = []
    for i in range(3):
        lines.append([board[i][0], board[i][1], board[i][2]])
        lines.append([board[0][i], board[1][i], board[2][i]])
    lines.append([board[0][0], board[1][1], board[2][2]])
    lines.append([board[0][2], board[1][1], board[2][0]])
    for line in lines:
        if line[0] != " " and line[0] == line[1] == line[2]:
            return line[0]
    return ""`,
    testCases: [
      { input: [[["X", "X", "X"], [" ", " ", " "], ["O", " ", "O"]]], expected: "X" },
      { input: [[["O", "X", "X"], ["X", "O", "X"], [" ", " ", "O"]]], expected: "O" },
      { input: [[["X", "O", "X"], ["X", "O", "O"], ["O", "X", "X"]]], expected: "" },
      { input: [[[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]]], expected: "" },
      { input: [[["X", "X", "O"], ["X", "O", "X"], ["O", "X", "X"]]], expected: "O" },
    ],
    hint: "Only non-empty lines can win, so check the symbol of the first cell.",
  },
  {
    id: "al-224",
    title: "Count Battleships",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the battleships on a board of X and dot characters, where a ship is a maximal horizontal or vertical run of X and ships never touch each other.\n\nCount only the topmost or leftmost cell of each ship, detected by having no X above and no X to the left. Return 0 for an empty board.",
    starterCode: `def count_battleships(board):
    # Your code here
    pass`,
    solution: `def count_battleships(board):
    rows = len(board)
    cols = len(board[0]) if rows else 0
    ships = 0
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "X":
                if r > 0 and board[r - 1][c] == "X":
                    continue
                if c > 0 and board[r][c - 1] == "X":
                    continue
                ships += 1
    return ships`,
    testCases: [
      { input: [[["X", ".", ".", "X"], [".", ".", ".", "X"], [".", ".", ".", "X"]]], expected: 2 },
      { input: [[["."]]], expected: 0 },
      { input: [[["X"]]], expected: 1 },
      { input: [[["X", "X"], [".", "X"]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Each ship has exactly one cell with no ship part above or to its left.",
  },
  {
    id: "al-225",
    title: "Kth Factor",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the k-th smallest positive divisor of n, or -1 when n has fewer than k divisors.\n\nCollect divisors up to the square root, then append their partners in descending order to obtain the sorted divisor list. Return the k-th entry or -1.",
    starterCode: `def kth_factor(n, k):
    # Your code here
    pass`,
    solution: `def kth_factor(n, k):
    factors = []
    i = 1
    while i * i <= n:
        if n % i == 0:
            factors.append(i)
        i += 1
    for i in range(len(factors) - 1, -1, -1):
        partner = n // factors[i]
        if partner != factors[i]:
            factors.append(partner)
    if k < 1 or k > len(factors):
        return -1
    return factors[k - 1]`,
    testCases: [
      { input: [12, 3], expected: 3 },
      { input: [7, 2], expected: 7 },
      { input: [4, 4], expected: -1 },
      { input: [1, 1], expected: 1 },
      { input: [1000, 3], expected: 4 },
    ],
    hint: "Small divisors come in ascending order, their partners in descending order.",
  },
  {
    id: "al-226",
    title: "Add Fractions",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Add the fractions num1/den1 and num2/den2 and return the reduced result as [numerator, denominator] with a positive denominator.\n\nCross-multiply to add, then divide both parts by their greatest common divisor. A zero result is written as [0, 1].",
    starterCode: `def add_fractions(num1, den1, num2, den2):
    # Your code here
    pass`,
    solution: `from math import gcd

def add_fractions(num1, den1, num2, den2):
    num = num1 * den2 + num2 * den1
    den = den1 * den2
    g = gcd(abs(num), abs(den))
    if g:
        num //= g
        den //= g
    if den < 0:
        num = -num
        den = -den
    if num == 0:
        den = 1
    return [num, den]`,
    testCases: [
      { input: [1, 2, 1, 3], expected: [5, 6] },
      { input: [1, 4, 1, 4], expected: [1, 2] },
      { input: [1, 2, 1, 2], expected: [1, 1] },
      { input: [0, 5, 1, 5], expected: [1, 5] },
      { input: [1, 6, -1, 6], expected: [0, 1] },
    ],
    hint: "gcd(0, x) is x, so the same reduction code handles a zero numerator.",
  },
  {
    id: "al-227",
    title: "Simplify Fraction",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Reduce the fraction num/den and return it as [numerator, denominator] with a positive denominator.\n\nDivide both parts by their greatest common divisor and move any minus sign to the numerator. Zero is returned as [0, 1].",
    starterCode: `def simplify_fraction(num, den):
    # Your code here
    pass`,
    solution: `from math import gcd

def simplify_fraction(num, den):
    g = gcd(abs(num), abs(den))
    if g:
        num //= g
        den //= g
    if den < 0:
        num = -num
        den = -den
    if num == 0:
        den = 1
    return [num, den]`,
    testCases: [
      { input: [8, 12], expected: [2, 3] },
      { input: [4, -6], expected: [-2, 3] },
      { input: [-3, -9], expected: [1, 3] },
      { input: [0, 5], expected: [0, 1] },
      { input: [7, 1], expected: [7, 1] },
    ],
    hint: "Normalise the sign after dividing by the GCD so the denominator is always positive.",
  },
  {
    id: "al-228",
    title: "Divisors Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of positive divisors of n.\n\nLoop i up to the square root and count each divisor, adding two for its partner unless i is exactly the square root. Assume n >= 1.",
    starterCode: `def divisor_count(n):
    # Your code here
    pass`,
    solution: `def divisor_count(n):
    count = 0
    i = 1
    while i * i <= n:
        if n % i == 0:
            count += 1
            if i != n // i:
                count += 1
        i += 1
    return count`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [12], expected: 6 },
      { input: [36], expected: 9 },
      { input: [97], expected: 2 },
      { input: [1000], expected: 16 },
    ],
    hint: "Divisors pair up as i and n // i, except for a perfect square root.",
  },
  {
    id: "al-229",
    title: "Sum of Primes Below N",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the sum of all prime numbers strictly less than n.\n\nUse the sieve of Eratosthenes for values below n and sum the numbers still marked prime. Return 0 for n < 3.",
    starterCode: `def sum_primes_below(n):
    # Your code here
    pass`,
    solution: `def sum_primes_below(n):
    if n < 3:
        return 0
    sieve = [True] * n
    sieve[0] = False
    sieve[1] = False
    i = 2
    while i * i < n:
        if sieve[i]:
            for j in range(i * i, n, i):
                sieve[j] = False
        i += 1
    return sum(x for x in range(n) if sieve[x])`,
    testCases: [
      { input: [10], expected: 17 },
      { input: [2], expected: 0 },
      { input: [0], expected: 0 },
      { input: [100], expected: 1060 },
      { input: [1], expected: 0 },
      { input: [1000], expected: 76127 },
    ],
    hint: "2 + 3 + 5 + 7 equals 17, the sum of primes below 10.",
  },
  {
    id: "al-230",
    title: "Closest Pair Distance",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given points as [x, y] pairs, return the smallest squared Euclidean distance between any two points, or -1 when fewer than two points are given.\n\nComparing squared distances avoids floating point and keeps the answer an integer. A brute-force double loop is fine for these input sizes.",
    starterCode: `def closest_pair_distance(points):
    # Your code here
    pass`,
    solution: `def closest_pair_distance(points):
    if len(points) < 2:
        return -1
    best = None
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            dx = points[i][0] - points[j][0]
            dy = points[i][1] - points[j][1]
            d = dx * dx + dy * dy
            if best is None or d < best:
                best = d
    return best`,
    testCases: [
      { input: [[[0, 0], [3, 4], [1, 1]]], expected: 2 },
      { input: [[[1, 1]]], expected: -1 },
      { input: [[]], expected: -1 },
      { input: [[[0, 0], [0, 5]]], expected: 25 },
      { input: [[[0, 0], [1, 0], [2, 0]]], expected: 1 },
    ],
    hint: "Initialise the best with None or infinity so any first pair becomes the candidate.",
  },
  {
    id: "al-231",
    title: "Non-overlapping Intervals",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given intervals as [start, end] pairs, return the minimum number of intervals to remove so that the rest do not overlap.\n\nSort by end time and greedily keep every interval that starts at or after the last kept end. The answer is the total count minus the number kept; touching endpoints are compatible.",
    starterCode: `def min_remove_overlapping(intervals):
    # Your code here
    pass`,
    solution: `def min_remove_overlapping(intervals):
    if not intervals:
        return 0
    ordered = sorted(intervals, key=lambda x: x[1])
    kept = 0
    last_end = None
    for start, end in ordered:
        if last_end is None or start >= last_end:
            kept += 1
            last_end = end
    return len(intervals) - kept`,
    testCases: [
      { input: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { input: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { input: [[[1, 2], [2, 3]]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[[1, 10], [2, 3], [3, 4]]], expected: 1 },
    ],
    hint: "Keeping intervals that finish earliest maximises how many survive.",
  },
  {
    id: "al-232",
    title: "Fractional Knapsack",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given item weights, values and a capacity, return the maximum total value when fractions of items may be taken.\n\nSort items by value over weight and take as much as possible from the best ratio first, splitting the last item when the capacity runs out. Return 0.0 when there are no items or no capacity.",
    starterCode: `def fractional_knapsack(weights, values, capacity):
    # Your code here
    pass`,
    solution: `def fractional_knapsack(weights, values, capacity):
    items = sorted(zip(weights, values), key=lambda item: item[1] / item[0], reverse=True)
    total = 0.0
    remaining = capacity
    for weight, value in items:
        if remaining <= 0:
            break
        if weight <= remaining:
            total += value
            remaining -= weight
        else:
            total += value * remaining / weight
            remaining = 0
    return total`,
    testCases: [
      { input: [[10, 20, 30], [60, 100, 120], 50], expected: 240.0 },
      { input: [[5, 10], [10, 20], 5], expected: 10.0 },
      { input: [[], [], 0], expected: 0.0 },
      { input: [[1, 2, 3], [3, 4, 5], 3], expected: 7.0 },
      { input: [[10], [100], 5], expected: 50.0 },
    ],
    hint: "The greedy choice by value density is optimal when items can be split.",
  },
  {
    id: "al-233",
    title: "Minimum Arrows to Burst Balloons",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given balloons as [start, end] horizontal spans, return the minimum number of arrows needed to burst all of them, where an arrow at position x bursts every balloon whose span contains x.\n\nSort by right endpoint and shoot an arrow at the end of the first unburst balloon, skipping every balloon that this arrow covers. Return 0 for no balloons.",
    starterCode: `def min_arrows_balloons(points):
    # Your code here
    pass`,
    solution: `def min_arrows_balloons(points):
    if not points:
        return 0
    ordered = sorted(points, key=lambda x: x[1])
    arrows = 1
    position = ordered[0][1]
    for start, end in ordered[1:]:
        if start > position:
            arrows += 1
            position = end
    return arrows`,
    testCases: [
      { input: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
      { input: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 },
      { input: [[[1, 2]]], expected: 1 },
      { input: [[[2, 3], [1, 2]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Shooting at the earliest finishing end covers as many later balloons as possible.",
  },
  {
    id: "al-234",
    title: "Video Stitching",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given clips as [start, end] and a target time, return the minimum number of clips needed to cover the whole interval from 0 to time, or -1 if that is impossible.\n\nSort clips by start, then repeatedly extend the covered end as far as possible using all clips that start at or before it. If no remaining clip extends the coverage, return -1.",
    starterCode: `def video_stitching(clips, time):
    # Your code here
    pass`,
    solution: `def video_stitching(clips, time):
    ordered = sorted(clips)
    count = 0
    i = 0
    current_end = 0
    while current_end < time:
        furthest = current_end
        while i < len(ordered) and ordered[i][0] <= current_end:
            if ordered[i][1] > furthest:
                furthest = ordered[i][1]
            i += 1
        if furthest == current_end:
            return -1
        count += 1
        current_end = furthest
    return count`,
    testCases: [
      { input: [[[0, 2], [4, 6], [8, 10], [1, 9], [1, 5], [5, 9]], 10], expected: 3 },
      { input: [[[0, 1], [1, 2]], 5], expected: -1 },
      { input: [[[0, 1]], 1], expected: 1 },
      { input: [[[0, 2]], 1], expected: 1 },
      { input: [[], 5], expected: -1 },
    ],
    hint: "Each round consumes every clip starting at or before the current covered end.",
  },
  {
    id: "al-235",
    title: "Jump Game III",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given arr and a start index, return True if any index holding the value 0 can be reached, where from index i you may jump to i + arr[i] or i - arr[i].\n\nUse DFS or BFS with a visited set to avoid cycles. A start index whose value is 0 is an immediate success.",
    starterCode: `def can_reach_zero(arr, start):
    # Your code here
    pass`,
    solution: `def can_reach_zero(arr, start):
    seen = set()
    stack = [start]
    while stack:
        i = stack.pop()
        if arr[i] == 0:
            return True
        if i in seen:
            continue
        seen.add(i)
        if i + arr[i] < len(arr):
            stack.append(i + arr[i])
        if i - arr[i] >= 0:
            stack.append(i - arr[i])
    return False`,
    testCases: [
      { input: [[4, 2, 3, 0, 3, 1, 2], 5], expected: true },
      { input: [[4, 2, 3, 0, 3, 1, 2], 0], expected: true },
      { input: [[3, 0, 2, 1, 2], 2], expected: false },
      { input: [[0], 0], expected: true },
      { input: [[2, 0], 0], expected: false },
    ],
    hint: "Only jump to indices inside the array, and mark visited indices before expanding them.",
  },
  {
    id: "al-236",
    title: "Maze Nearest Exit",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a maze of dot and plus characters and an entrance cell, return the number of steps to the nearest exit, where an exit is any dot on the border other than the entrance, or -1 if none is reachable.\n\nRun BFS from the entrance and test for the border when expanding each neighbour. The entrance itself never counts as an exit.",
    starterCode: `def nearest_exit(maze, entrance):
    # Your code here
    pass`,
    solution: `from collections import deque

def nearest_exit(maze, entrance):
    rows = len(maze)
    cols = len(maze[0]) if rows else 0
    sr, sc = entrance
    queue = deque([(sr, sc)])
    visited = {(sr, sc)}
    steps = 0
    while queue:
        steps += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in visited and maze[nr][nc] == ".":
                    if nr == 0 or nr == rows - 1 or nc == 0 or nc == cols - 1:
                        return steps
                    visited.add((nr, nc))
                    queue.append((nr, nc))
    return -1`,
    testCases: [
      { input: [[["+", "+", ".", "+"], [".", ".", ".", "+"], ["+", "+", "+", "."]], [1, 2]], expected: 1 },
      { input: [[["+", "+", ".", "+"], [".", ".", ".", "+"], ["+", "+", "+", "."]], [0, 2]], expected: 3 },
      { input: [[[".", "+"]], [0, 0]], expected: -1 },
      { input: [[["."]], [0, 0]], expected: -1 },
      { input: [[["+", "+", "+"], ["+", ".", "+"], ["+", "+", "+"]], [1, 1]], expected: -1 },
    ],
    hint: "An exit is discovered while expanding a neighbour, so the current layer count is the distance.",
  },
  {
    id: "al-237",
    title: "01 Matrix",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a matrix of 0s and 1s, return a matrix where each cell holds the distance to the nearest 0, with distances measured by four-directional moves.\n\nSeed a multi-source BFS with every 0 at distance 0 and expand outward to unvisited cells. Assume the matrix contains at least one 0.",
    starterCode: `def update_matrix(mat):
    # Your code here
    pass`,
    solution: `from collections import deque

def update_matrix(mat):
    rows = len(mat)
    cols = len(mat[0]) if rows else 0
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if mat[r][c] == 0:
                dist[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    return dist`,
    testCases: [
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { input: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
      { input: [[[0]]], expected: [[0]] },
      { input: [[[1, 0]]], expected: [[1, 0]] },
      { input: [[[0, 1, 1], [1, 1, 1]]], expected: [[0, 1, 2], [1, 2, 3]] },
    ],
    hint: "Every cell is reached exactly once because BFS processes cells in increasing distance order.",
  },
  {
    id: "al-238",
    title: "Surrounded Regions",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a board of X and O characters, return a copy where every region of O completely surrounded by X is flipped to X, while regions touching the border stay O.\n\nFlood fill from all border Os marking them safe, then flip every unmarked O to X and restore the safe marks. Return the resulting board.",
    starterCode: `def solve_surrounded(board):
    # Your code here
    pass`,
    solution: `from collections import deque

def solve_surrounded(board):
    rows = len(board)
    cols = len(board[0]) if rows else 0
    out = [row[:] for row in board]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if (r == 0 or r == rows - 1 or c == 0 or c == cols - 1) and out[r][c] == "O":
                out[r][c] = "S"
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and out[nr][nc] == "O":
                out[nr][nc] = "S"
                queue.append((nr, nc))
    for r in range(rows):
        for c in range(cols):
            if out[r][c] == "O":
                out[r][c] = "X"
            elif out[r][c] == "S":
                out[r][c] = "O"
    return out`,
    testCases: [
      { input: [[["X", "X", "X", "X"], ["X", "O", "O", "X"], ["X", "X", "O", "X"], ["X", "O", "X", "X"]]], expected: [["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]] },
      { input: [[["X"]]], expected: [["X"]] },
      { input: [[["O"]]], expected: [["O"]] },
      { input: [[["O", "O"], ["O", "O"]]], expected: [["O", "O"], ["O", "O"]] },
      { input: [[["X", "X", "X"], ["X", "O", "X"], ["X", "X", "X"]]], expected: [["X", "X", "X"], ["X", "X", "X"], ["X", "X", "X"]] },
    ],
    hint: "A temporary marker distinguishes border-connected Os from captured ones.",
  },
  {
    id: "al-239",
    title: "Pacific Atlantic Water Flow",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given an island height matrix, return the coordinates [r, c] from which water can flow to both the Pacific (top and left edges) and Atlantic (bottom and right edges) oceans, moving to neighbours of equal or lower height.\n\nRun reverse BFS from each ocean border, moving to equal or higher neighbours, and intersect the reachable sets. Return coordinates sorted by row then column.",
    starterCode: `def pacific_atlantic(heights):
    # Your code here
    pass`,
    solution: `from collections import deque

def pacific_atlantic(heights):
    rows = len(heights)
    cols = len(heights[0]) if rows else 0
    if rows == 0 or cols == 0:
        return []
    def reachable(starts):
        seen = [[False] * cols for _ in range(rows)]
        queue = deque()
        for r, c in starts:
            seen[r][c] = True
            queue.append((r, c))
        while queue:
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc] and heights[nr][nc] >= heights[r][c]:
                    seen[nr][nc] = True
                    queue.append((nr, nc))
        return seen
    pacific = reachable([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
    atlantic = reachable([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
    result = []
    for r in range(rows):
        for c in range(cols):
            if pacific[r][c] and atlantic[r][c]:
                result.append([r, c])
    return result`,
    testCases: [
      { input: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] },
      { input: [[[1]]], expected: [[0, 0]] },
      { input: [[[2, 1], [1, 2]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
      { input: [[[3, 3], [3, 3]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    ],
    hint: "Reversing the flow means climbing to equal or taller neighbours from each coast.",
  },
  {
    id: "al-240",
    title: "Count Distinct Islands",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of distinct island shapes in a grid of 0 and 1, where two shapes are the same when one can be translated to match the other.\n\nFor each island collect its cells, normalise them by subtracting the minimum row and column, and add the resulting tuple to a set. Return the size of the set.",
    starterCode: `def count_distinct_islands(grid):
    # Your code here
    pass`,
    solution: `from collections import deque

def count_distinct_islands(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    seen = [[False] * cols for _ in range(rows)]
    shapes = set()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and not seen[r][c]:
                queue = deque([(r, c)])
                seen[r][c] = True
                cells = []
                while queue:
                    cr, cc = queue.popleft()
                    cells.append((cr, cc))
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not seen[nr][nc]:
                            seen[nr][nc] = True
                            queue.append((nr, nc))
                min_r = min(x for x, y in cells)
                min_c = min(y for x, y in cells)
                shapes.add(tuple(sorted((x - min_r, y - min_c) for x, y in cells)))
    return len(shapes)`,
    testCases: [
      { input: [[[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1]]], expected: 1 },
      { input: [[[1, 1, 0, 1, 1], [1, 0, 0, 0, 0], [0, 0, 0, 0, 1], [1, 1, 0, 1, 1]]], expected: 3 },
      { input: [[[0]]], expected: 0 },
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 0, 1]]], expected: 1 },
    ],
    hint: "Sorting the normalised cells makes the shape comparison order-independent.",
  },
  {
    id: "al-241",
    title: "Minesweeper Reveal",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a minesweeper board of E, M and digit characters, reveal the cell at click and return the new board.\n\nClicking a mine turns it into X. Clicking an empty cell with no adjacent mines reveals it as B and recursively reveals its neighbours, while an empty cell adjacent to mines shows the count. Do not modify the input board.",
    starterCode: `def minesweeper_reveal(board, click):
    # Your code here
    pass`,
    solution: `def minesweeper_reveal(board, click):
    rows = len(board)
    cols = len(board[0]) if rows else 0
    out = [row[:] for row in board]
    cr, cc = click
    if out[cr][cc] == "M":
        out[cr][cc] = "X"
        return out
    queue = [(cr, cc)]
    head = 0
    out[cr][cc] = "B"
    while head < len(queue):
        r, c = queue[head]
        head += 1
        mines = 0
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and out[nr][nc] == "M":
                    mines += 1
        if mines > 0:
            out[r][c] = str(mines)
            continue
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and out[nr][nc] == "E":
                    out[nr][nc] = "B"
                    queue.append((nr, nc))
    return out`,
    testCases: [
      { input: [[["E", "E", "E", "E", "E"], ["E", "E", "M", "E", "E"], ["E", "E", "E", "E", "E"], ["E", "E", "E", "E", "E"]], [3, 0]], expected: [["B", "1", "E", "1", "B"], ["B", "1", "M", "1", "B"], ["B", "1", "1", "1", "B"], ["B", "B", "B", "B", "B"]] },
      { input: [[["E", "E", "E", "E", "E"], ["E", "E", "M", "E", "E"], ["E", "E", "E", "E", "E"], ["E", "E", "E", "E", "E"]], [1, 2]], expected: [["E", "E", "E", "E", "E"], ["E", "E", "X", "E", "E"], ["E", "E", "E", "E", "E"], ["E", "E", "E", "E", "E"]] },
      { input: [[["M"]], [0, 0]], expected: [["X"]] },
      { input: [[["E"]], [0, 0]], expected: [["B"]] },
      { input: [[["E", "E", "E"], ["E", "M", "E"], ["E", "E", "E"]], [0, 0]], expected: [["1", "E", "E"], ["E", "M", "E"], ["E", "E", "E"]] },
    ],
    hint: "Mark neighbours as B when enqueueing so they are not queued twice.",
  },
  {
    id: "al-242",
    title: "Game of Life",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a board of 0 and 1, return the next state of Conway's Game of Life.\n\nA live cell survives with two or three live neighbours, a dead cell becomes live with exactly three, and every other cell dies or stays dead. Count all eight neighbours of each cell and build a new board.",
    starterCode: `def game_of_life(board):
    # Your code here
    pass`,
    solution: `def game_of_life(board):
    rows = len(board)
    cols = len(board[0]) if rows else 0
    out = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            live = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == 1:
                        live += 1
            if board[r][c] == 1:
                out[r][c] = 1 if live in (2, 3) else 0
            else:
                out[r][c] = 1 if live == 3 else 0
    return out`,
    testCases: [
      { input: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], expected: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { input: [[[1, 1], [1, 0]]], expected: [[1, 1], [1, 1]] },
      { input: [[[0]]], expected: [[0]] },
      { input: [[[1]]], expected: [[0]] },
      { input: [[[]]], expected: [[]] },
    ],
    hint: "Build a fresh board so updates do not affect neighbour counts within the same generation.",
  },
  {
    id: "al-243",
    title: "LRU Page Replacement",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Simulate least-recently-used page replacement and return the total number of page faults.\n\nKeep frames ordered from least to most recently used: a hit moves the page to the back, and a fault evicts the front page when all frames are full. An empty request sequence produces no faults.",
    starterCode: `def lru_page_faults(pages, capacity):
    # Your code here
    pass`,
    solution: `def lru_page_faults(pages, capacity):
    if capacity <= 0:
        return len(pages)
    frames = []
    faults = 0
    for page in pages:
        if page in frames:
            frames.remove(page)
            frames.append(page)
        else:
            faults += 1
            if len(frames) == capacity:
                frames.pop(0)
            frames.append(page)
    return faults`,
    testCases: [
      { input: [[1, 2, 3, 1, 4, 1, 2, 3, 4], 3], expected: 7 },
      { input: [[1, 2, 1, 2, 1, 2], 2], expected: 2 },
      { input: [[1, 1, 1], 1], expected: 1 },
      { input: [[], 3], expected: 0 },
      { input: [[1, 2, 3, 4], 4], expected: 4 },
      { input: [[1, 2, 3, 4, 1, 2], 4], expected: 4 },
    ],
    hint: "Removing and re-appending on a hit keeps the most recently used page at the back.",
  },
  {
    id: "al-244",
    title: "FIFO vs Optimal Page Faults",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compare two page replacement policies on the same reference string with a fixed number of frames and return [fifo_faults, optimal_faults].\n\nFIFO evicts the oldest loaded page, while the optimal policy evicts the page whose next use is farthest in the future, treating pages never used again as infinitely far. An empty reference string has zero faults.",
    starterCode: `def page_fault_comparison(pages, capacity):
    # Your code here
    pass`,
    solution: `def page_fault_comparison(pages, capacity):
    if capacity <= 0:
        return [len(pages), len(pages)]
    fifo_frames = []
    fifo_faults = 0
    for page in pages:
        if page not in fifo_frames:
            fifo_faults += 1
            if len(fifo_frames) == capacity:
                fifo_frames.pop(0)
            fifo_frames.append(page)
    optimal_frames = []
    optimal_faults = 0
    for i, page in enumerate(pages):
        if page in optimal_frames:
            continue
        optimal_faults += 1
        if len(optimal_frames) < capacity:
            optimal_frames.append(page)
            continue
        farthest = -1
        victim = None
        for frame_page in optimal_frames:
            try:
                next_use = pages.index(frame_page, i + 1)
            except ValueError:
                next_use = 10 ** 9
            if next_use > farthest:
                farthest = next_use
                victim = frame_page
        optimal_frames.remove(victim)
        optimal_frames.append(page)
    return [fifo_faults, optimal_faults]`,
    testCases: [
      { input: [[7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 0, 1, 7, 0, 1], 3], expected: [12, 9] },
      { input: [[1, 2, 3, 4, 1], 3], expected: [5, 4] },
      { input: [[1, 1, 1], 2], expected: [1, 1] },
      { input: [[], 3], expected: [0, 0] },
      { input: [[1, 2, 1, 2], 2], expected: [2, 2] },
    ],
    hint: "The optimal victim is the resident page whose next occurrence is latest, or infinity.",
  },
  {
    id: "al-245",
    title: "Round-Robin Scheduling",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Simulate round-robin scheduling and return the process ids in completion order.\n\nEach process runs for at most one quantum, and unfinished processes go to the back of the queue with their remaining time. Assume quantum >= 1 and process ids are unique.",
    starterCode: `def round_robin(processes, quantum):
    # Your code here
    pass`,
    solution: `def round_robin(processes, quantum):
    if quantum <= 0:
        return []
    queue = [[pid, burst] for pid, burst in processes]
    order = []
    head = 0
    while head < len(queue):
        pid, remaining = queue[head]
        head += 1
        if remaining <= quantum:
            order.append(pid)
        else:
            queue.append([pid, remaining - quantum])
    return order`,
    testCases: [
      { input: [[[1, 5], [2, 3], [3, 1]], 2], expected: [3, 2, 1] },
      { input: [[[1, 2]], 1], expected: [1] },
      { input: [[[1, 1], [2, 1]], 5], expected: [1, 2] },
      { input: [[], 2], expected: [] },
      { input: [[[1, 3], [2, 3]], 2], expected: [1, 2] },
    ],
    hint: "A queue with a moving head position avoids repeated list removals.",
  },
  {
    id: "al-246",
    title: "SCAN Disk Scheduling",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given the current head position, pending requests and a direction, return the order in which SCAN (elevator) scheduling services the requests.\n\nWhen the direction is up, serve all requests at or above the head in increasing order, then the lower requests in decreasing order; down is the mirror image. Requests exactly at the head are served first when moving up.",
    starterCode: `def scan_disk_order(head, requests, direction):
    # Your code here
    pass`,
    solution: `def scan_disk_order(head, requests, direction):
    lower = sorted([r for r in requests if r < head], reverse=True)
    upper = sorted([r for r in requests if r >= head])
    if direction == "up":
        return upper + lower
    return lower + upper`,
    testCases: [
      { input: [53, [98, 183, 37, 122, 14, 124, 65, 67], "up"], expected: [65, 67, 98, 122, 124, 183, 37, 14] },
      { input: [53, [98, 183, 37, 122, 14, 124, 65, 67], "down"], expected: [37, 14, 65, 67, 98, 122, 124, 183] },
      { input: [0, [1], "up"], expected: [1] },
      { input: [10, [], "up"], expected: [] },
      { input: [10, [5, 15, 7, 12], "down"], expected: [7, 5, 12, 15] },
    ],
    hint: "The head sweeps to the end in one direction before reversing to serve the other side.",
  },
  {
    id: "al-247",
    title: "Reservoir Sampling K Seeded",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return a uniform random sample of k elements from nums using reservoir sampling with a deterministic seeded generator.\n\nFill the reservoir with the first k elements, then for each later element choose an index from 0 through i and replace that slot when it is below k. When k is at least the length, return all elements in their original order.",
    starterCode: `def reservoir_sample_k(nums, k, seed):
    # Your code here
    pass`,
    solution: `def reservoir_sample_k(nums, k, seed):
    if k >= len(nums):
        return list(nums)
    state = seed & 0xFFFFFFFF
    reservoir = nums[:k]
    for i in range(k, len(nums)):
        state = (1103515245 * state + 12345) & 0x7FFFFFFF
        j = state % (i + 1)
        if j < k:
            reservoir[j] = nums[i]
    return reservoir`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2, 42], expected: [4, 2] },
      { input: [[1], 1, 0], expected: [1] },
      { input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 7], expected: [7, 1, 9] },
      { input: [[], 3, 1], expected: [] },
      { input: [[1, 2, 3], 5, 2], expected: [1, 2, 3] },
    ],
    hint: "Each new element enters the reservoir with probability k divided by its index plus one.",
  },
  {
    id: "al-248",
    title: "Shuffle Array Seeded",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return a shuffled copy of nums using the Fisher-Yates algorithm with a deterministic seeded generator, leaving the input unchanged.\n\nWalk from the last index down to 1, generate a pseudo-random index in the closed range from 0 to i, and swap. The same seed always produces the same permutation.",
    starterCode: `def shuffle_array(nums, seed):
    # Your code here
    pass`,
    solution: `def shuffle_array(nums, seed):
    a = list(nums)
    state = seed & 0xFFFFFFFF
    for i in range(len(a) - 1, 0, -1):
        state = (1103515245 * state + 12345) & 0x7FFFFFFF
        j = state % (i + 1)
        a[i], a[j] = a[j], a[i]
    return a`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 42], expected: [2, 4, 5, 1, 3] },
      { input: [[1], 7], expected: [1] },
      { input: [[], 0], expected: [] },
      { input: [[1, 2, 3], 1], expected: [3, 2, 1] },
      { input: [[1, 2, 3], 2], expected: [3, 1, 2] },
    ],
    hint: "Fisher-Yates is uniform only when the swap target is drawn uniformly from 0 through i.",
  },
  {
    id: "al-249",
    title: "Ugly Number II",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the n-th ugly number, where ugly numbers have only 2, 3 and 5 as prime factors and 1 is the first ugly number.\n\nMaintain three pointers into the growing list for the next multiples of 2, 3 and 5, always appending the smallest next value and advancing every pointer that produced it. This keeps the list sorted and duplicate-free.",
    starterCode: `def nth_ugly_number(n):
    # Your code here
    pass`,
    solution: `def nth_ugly_number(n):
    ugly = [1]
    i2 = i3 = i5 = 0
    while len(ugly) < n:
        next2 = ugly[i2] * 2
        next3 = ugly[i3] * 3
        next5 = ugly[i5] * 5
        nxt = min(next2, next3, next5)
        ugly.append(nxt)
        if nxt == next2:
            i2 += 1
        if nxt == next3:
            i3 += 1
        if nxt == next5:
            i5 += 1
    return ugly[n - 1]`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [10], expected: 12 },
      { input: [12], expected: 16 },
      { input: [15], expected: 24 },
      { input: [20], expected: 36 },
    ],
    hint: "Advance every pointer that matches the appended value so 6 is generated once, not twice.",
  },
  {
    id: "al-250",
    title: "Euler's Totient",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return Euler's totient of n: the count of integers from 1 through n that are coprime with n, with phi(1) = 1.\n\nFactor n by trial division and multiply the running result by one minus one over each distinct prime using integer arithmetic. Return 0 for n <= 0.",
    starterCode: `def euler_phi(n):
    # Your code here
    pass`,
    solution: `def euler_phi(n):
    if n <= 0:
        return 0
    result = n
    p = 2
    while p * p <= n:
        if n % p == 0:
            while n % p == 0:
                n //= p
            result -= result // p
        p += 1
    if n > 1:
        result -= result // n
    return result`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [9], expected: 6 },
      { input: [10], expected: 4 },
      { input: [36], expected: 12 },
      { input: [97], expected: 96 },
    ],
    hint: "For every distinct prime p dividing n, throw away result // p of the remaining count.",
  },
  {
    id: "al-251",
    title: "K Pairs with Smallest Sums",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given two sorted lists and k, return the k pairs [u, v] with the smallest sums, ordered by sum and then by index.\n\nSeed a min-heap with every (nums1[i], nums2[0]) pair and, after popping pair (i, j), push (i, j + 1), which visits each row in increasing order. Return fewer than k pairs when they are exhausted.",
    starterCode: `def k_smallest_pairs(nums1, nums2, k):
    # Your code here
    pass`,
    solution: `import heapq

def k_smallest_pairs(nums1, nums2, k):
    if not nums1 or not nums2 or k <= 0:
        return []
    heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(len(nums1), k))]
    heapq.heapify(heap)
    result = []
    while heap and len(result) < k:
        total, i, j = heapq.heappop(heap)
        result.append([nums1[i], nums2[j]])
        if j + 1 < len(nums2):
            heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
    return result`,
    testCases: [
      { input: [[1, 7, 11], [2, 4, 6], 3], expected: [[1, 2], [1, 4], [1, 6]] },
      { input: [[1, 1, 2], [1, 2, 3], 2], expected: [[1, 1], [1, 1]] },
      { input: [[1, 2], [3], 3], expected: [[1, 3], [2, 3]] },
      { input: [[], [], 3], expected: [] },
      { input: [[1], [2], 5], expected: [[1, 2]] },
    ],
    hint: "For each row of nums1 the sums increase along nums2, so one heap per row is enough.",
  },
  {
    id: "al-252",
    title: "Shortest Bridge",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a grid with exactly two islands of 1s, return the fewest 0 cells that must be flipped to connect them.\n\nFlood fill the first island, then run a multi-source BFS from all of its cells through water until land of the second island is reached. The number of expanding layers equals the number of flips.",
    starterCode: `def shortest_bridge(grid):
    # Your code here
    pass`,
    solution: `from collections import deque

def shortest_bridge(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    starts = []
    found = False
    for r in range(rows):
        if found:
            break
        for c in range(cols):
            if grid[r][c] == 1:
                queue = deque([(r, c)])
                grid[r][c] = 2
                starts.append((r, c))
                while queue:
                    cr, cc = queue.popleft()
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 2
                            queue.append((nr, nc))
                            starts.append((nr, nc))
                found = True
                break
    queue = deque(starts)
    steps = 0
    while queue:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    if grid[nr][nc] == 1:
                        return steps
                    if grid[nr][nc] == 0:
                        grid[nr][nc] = 2
                        queue.append((nr, nc))
        steps += 1
    return -1`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: 1 },
      { input: [[[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]], expected: 1 },
      { input: [[[1, 0, 1]]], expected: 1 },
      { input: [[[1, 0, 0], [0, 0, 0], [0, 0, 1]]], expected: 3 },
      { input: [[[1, 1, 0], [0, 0, 0], [0, 1, 1]]], expected: 1 },
    ],
    hint: "Marking visited cells as water prevents the BFS from entering the same cell twice.",
  },
  {
    id: "al-253",
    title: "Cut Off Trees for Golf Event",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a forest grid where 0 is blocked, 1 is grass and any value above 1 is a tree, return the minimum steps to cut all trees in increasing height order starting from (0, 0), or -1 if a tree is unreachable.\n\nSort the trees by height and run a BFS for each consecutive pair, computing the distance from the previously cut tree. Sum the distances.",
    starterCode: `def cut_off_trees_shortest(forest):
    # Your code here
    pass`,
    solution: `from collections import deque

def cut_off_trees_shortest(forest):
    rows = len(forest)
    cols = len(forest[0]) if rows else 0
    trees = []
    for r in range(rows):
        for c in range(cols):
            if forest[r][c] > 1:
                trees.append((forest[r][c], r, c))
    trees.sort()
    def bfs(start, target):
        queue = deque([start])
        seen = {start}
        steps = 0
        while queue:
            for _ in range(len(queue)):
                r, c = queue.popleft()
                if (r, c) == target:
                    return steps
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and forest[nr][nc] != 0:
                        seen.add((nr, nc))
                        queue.append((nr, nc))
            steps += 1
        return -1
    current = (0, 0)
    total = 0
    for _, r, c in trees:
        dist = bfs(current, (r, c))
        if dist == -1:
            return -1
        total += dist
        current = (r, c)
    return total`,
    testCases: [
      { input: [[[1, 2, 3], [0, 0, 4], [7, 6, 5]]], expected: 6 },
      { input: [[[1, 2, 3], [0, 0, 0], [7, 6, 5]]], expected: -1 },
      { input: [[[2, 3, 4], [0, 0, 5], [8, 7, 6]]], expected: 6 },
      { input: [[[1]]], expected: 0 },
    ],
    hint: "Grass cells are walkable, so only zeros block the BFS.",
  },
  {
    id: "al-254",
    title: "Jump Game IV",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given arr, return the minimum number of jumps to reach the last index, where from index i you may move to i - 1, i + 1, or any index j with arr[j] equal to arr[i].\n\nRun BFS layer by layer, using a map from value to indices and deleting each value's list after it is expanded so no group is processed twice. The first layer that reaches the last index is the answer.",
    starterCode: `def min_jumps_jump_game_iv(arr):
    # Your code here
    pass`,
    solution: `from collections import deque

def min_jumps_jump_game_iv(arr):
    n = len(arr)
    if n == 1:
        return 0
    positions = {}
    for i, x in enumerate(arr):
        positions.setdefault(x, []).append(i)
    visited = [False] * n
    visited[0] = True
    queue = deque([0])
    steps = 0
    while queue:
        steps += 1
        for _ in range(len(queue)):
            i = queue.popleft()
            jumps = [i - 1, i + 1]
            if arr[i] in positions:
                jumps.extend(positions[arr[i]])
                del positions[arr[i]]
            for j in jumps:
                if 0 <= j < n and not visited[j]:
                    if j == n - 1:
                        return steps
                    visited[j] = True
                    queue.append(j)
    return -1`,
    testCases: [
      { input: [[100, -23, -23, 404, 100, 23, 23, 23, 3, 404]], expected: 3 },
      { input: [[7]], expected: 0 },
      { input: [[7, 6, 9, 6, 9, 6, 9, 7]], expected: 1 },
      { input: [[6, 1, 9]], expected: 2 },
      { input: [[11, 22, 7, 7, 7, 7, 7, 7, 7, 22, 13]], expected: 3 },
    ],
    hint: "After expanding a value group, deleting it keeps the total work linear.",
  },
  {
    id: "al-255",
    title: "Course Schedule III",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given courses as [duration, last_day] pairs, return the maximum number of courses that can be taken so that each finishes by its last day, one course at a time.\n\nSort by deadline and greedily add each course, using a max-heap of durations to drop the longest course whenever the accumulated time exceeds the current deadline. The heap size is the answer.",
    starterCode: `def schedule_course_max(courses):
    # Your code here
    pass`,
    solution: `import heapq

def schedule_course_max(courses):
    ordered = sorted(courses, key=lambda c: c[1])
    heap = []
    time = 0
    for duration, deadline in ordered:
        time += duration
        heapq.heappush(heap, -duration)
        if time > deadline:
            time += heapq.heappop(heap)
    return len(heap)`,
    testCases: [
      { input: [[[100, 200], [200, 1300], [1000, 1250], [2000, 3200]]], expected: 3 },
      { input: [[[1, 2]]], expected: 1 },
      { input: [[[3, 2], [4, 3]]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[[1, 2], [2, 3], [3, 4]]], expected: 2 },
    ],
    hint: "Dropping the longest course when over time frees the most room for later ones.",
  },
  {
    id: "al-256",
    title: "Exam Room",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Simulate exam seating in a room with seats numbered 0 through n - 1. An operation equal to 0 seats a student as far as possible from any other student, choosing the smallest index on ties; a positive value means the student in that seat leaves.\n\nFor each seating, compare the distance available at seat 0, at the midpoint of every gap between seated students, and at the last seat. Return the list of newly assigned seats.",
    starterCode: `def exam_room_seats(n, operations):
    # Your code here
    pass`,
    solution: `def exam_room_seats(n, operations):
    seated = []
    result = []
    for op in operations:
        if op == 0:
            if not seated:
                best = 0
            else:
                best = 0
                best_dist = seated[0]
                for i in range(len(seated) - 1):
                    gap = seated[i + 1] - seated[i]
                    dist = gap // 2
                    if dist > best_dist:
                        best_dist = dist
                        best = seated[i] + gap // 2
                if n - 1 - seated[-1] > best_dist:
                    best = n - 1
            seated.append(best)
            seated.sort()
            result.append(best)
        else:
            seated.remove(op)
    return result`,
    testCases: [
      { input: [10, [0, 0, 0, 0, 4, 0]], expected: [0, 9, 4, 2, 5] },
      { input: [1, [0, 0, 0]], expected: [0, 0, 0] },
      { input: [2, [0, 0, 1, 0]], expected: [0, 1, 1] },
      { input: [6, [0, 0, 0, 2, 0]], expected: [0, 5, 2, 2] },
      { input: [4, [0, 0, 3, 0]], expected: [0, 3, 3] },
    ],
    hint: "Strict comparisons while scanning left to right make smaller indices win ties.",
  },
  {
    id: "al-257",
    title: "Kth Smallest Pair Sum",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given nums and k, return the k-th smallest sum of a pair at distinct indices, where every unordered pair forms one entry.\n\nBinary search the sum value and count how many pairs have a sum at most the candidate using a two-pointer sweep over the sorted array. Assume k does not exceed the number of pairs.",
    starterCode: `def kth_smallest_pair_sum(nums, k):
    # Your code here
    pass`,
    solution: `def kth_smallest_pair_sum(nums, k):
    ordered = sorted(nums)
    n = len(ordered)
    def count_le(limit):
        count = 0
        left, right = 0, n - 1
        while left < right:
            if ordered[left] + ordered[right] <= limit:
                count += right - left
                left += 1
            else:
                right -= 1
        return count
    lo = ordered[0] + ordered[1]
    hi = ordered[-2] + ordered[-1]
    while lo < hi:
        mid = (lo + hi) // 2
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    testCases: [
      { input: [[1, 1, 1], 2], expected: 2 },
      { input: [[1, 2, 3, 4], 4], expected: 5 },
      { input: [[1, 6, 1], 3], expected: 7 },
      { input: [[1, 2], 1], expected: 3 },
      { input: [[5, 6, 7], 2], expected: 12 },
    ],
    hint: "For a fixed left pointer, every right pointer down to the first valid one forms a pair under the limit.",
  },
  {
    id: "al-258",
    title: "Smallest Range Covering K Lists",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given k sorted lists, return the smallest range [start, end] containing at least one element from every list; on ties choose the smaller start.\n\nA heap holds the current element of each list along with the running maximum. Pop the smallest, record the range, push the next element from that list, and stop when a list is exhausted.",
    starterCode: `def smallest_range(nums_lists):
    # Your code here
    pass`,
    solution: `import heapq

def smallest_range(nums_lists):
    heap = []
    current_max = -10 ** 30
    for i, lst in enumerate(nums_lists):
        heapq.heappush(heap, (lst[0], i, 0))
        if lst[0] > current_max:
            current_max = lst[0]
    best_start = heap[0][0]
    best_end = current_max
    while True:
        value, i, j = heapq.heappop(heap)
        if current_max - value < best_end - best_start:
            best_start, best_end = value, current_max
        if j + 1 == len(nums_lists[i]):
            break
        nxt = nums_lists[i][j + 1]
        heapq.heappush(heap, (nxt, i, j + 1))
        if nxt > current_max:
            current_max = nxt
    return [best_start, best_end]`,
    testCases: [
      { input: [[[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]], expected: [20, 24] },
      { input: [[[1, 2, 3], [1, 2, 3], [1, 2, 3]]], expected: [1, 1] },
      { input: [[[10], [11]]], expected: [10, 11] },
      { input: [[[1]]], expected: [1, 1] },
      { input: [[[2, 3], [1, 4], [5, 6]]], expected: [3, 5] },
    ],
    hint: "Advancing the list that owns the current minimum is the only move that can shrink the range.",
  },
  {
    id: "al-259",
    title: "Max Points on a Line",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given points as [x, y] pairs, return the maximum number of points that lie on one straight line.\n\nFor each anchor point, normalise the slope to every other point by dividing the coordinate differences by their greatest common divisor and counting occurrences in a hash map, with duplicate anchors handled separately. Return the best total.",
    starterCode: `def max_points_on_line(points):
    # Your code here
    pass`,
    solution: `from math import gcd

def max_points_on_line(points):
    n = len(points)
    if n <= 2:
        return n
    best = 0
    for i in range(n):
        slopes = {}
        same = 0
        for j in range(i + 1, n):
            dx = points[j][0] - points[i][0]
            dy = points[j][1] - points[i][1]
            if dx == 0 and dy == 0:
                same += 1
                continue
            g = gcd(abs(dx), abs(dy))
            dx //= g
            dy //= g
            if dx < 0:
                dx, dy = -dx, -dy
            elif dx == 0:
                dy = 1
            key = (dy, dx)
            slopes[key] = slopes.get(key, 0) + 1
        local = same
        for count in slopes.values():
            if count + same > local:
                local = count + same
        if local + 1 > best:
            best = local + 1
    return best`,
    testCases: [
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: 3 },
      { input: [[[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]], expected: 4 },
      { input: [[[1, 1]]], expected: 1 },
      { input: [[[0, 0], [0, 0]]], expected: 2 },
      { input: [[[0, 0], [1, 1], [0, 1]]], expected: 2 },
    ],
    hint: "Normalising the sign of dx makes opposite directions share one slope key.",
  },
  {
    id: "al-260",
    title: "Convex Hull Perimeter",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given points as [x, y] pairs, return the perimeter of their convex hull as a float, 0.0 for a single point, and twice the segment length for two points.\n\nBuild the hull with the monotone chain algorithm, keeping only strict left turns using the cross product, then sum the Euclidean lengths of the hull edges. Duplicate points are removed first.",
    starterCode: `def convex_hull_perimeter(points):
    # Your code here
    pass`,
    solution: `def convex_hull_perimeter(points):
    pts = sorted(set(tuple(p) for p in points))
    if len(pts) <= 1:
        return 0.0
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    if len(hull) == 2:
        (x1, y1), (x2, y2) = hull
        return 2.0 * (((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5)
    perimeter = 0.0
    for i in range(len(hull)):
        x1, y1 = hull[i]
        x2, y2 = hull[(i + 1) % len(hull)]
        perimeter += ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
    return perimeter`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 4.0 },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2], [1, 1]]], expected: 8.0 },
      { input: [[[0, 0], [1, 0]]], expected: 2.0 },
      { input: [[[5, 5]]], expected: 0.0 },
      { input: [[[0, 0], [3, 0], [3, 4]]], expected: 12.0 },
    ],
    hint: "A cross product of zero or less means the middle point is not part of the convex hull.",
  },
];
