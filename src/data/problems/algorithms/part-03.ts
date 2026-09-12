import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-081",
    title: "Stock Profit with One Transaction",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given daily prices, return the maximum profit from buying one share on some day and selling it on a later day, or 0 if no profit is possible.\n\nTrack the minimum price seen so far and the best profit from selling today. The list may be empty or strictly decreasing.",
    starterCode: `def max_profit_one(prices):
    # Your code here
    pass`,
    solution: `def max_profit_one(prices):
    best = 0
    low = None
    for p in prices:
        if low is None or p < low:
            low = p
        if p - low > best:
            best = p - low
    return best`,
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 0 },
      { input: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 4 },
    ],
    hint: "The best sale today uses the cheapest price seen before today.",
  },
  {
    id: "al-082",
    title: "Stock Profit with Unlimited Transactions",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given daily prices, return the maximum profit from any number of buy-then-sell transactions, holding at most one share at a time.\n\nEvery upward step prices[i] - prices[i-1] can be captured independently, so sum all positive daily differences. Return 0 for empty or decreasing prices.",
    starterCode: `def max_profit_unlimited(prices):
    # Your code here
    pass`,
    solution: `def max_profit_unlimited(prices):
    total = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            total += prices[i] - prices[i - 1]
    return total`,
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 7 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[2, 2, 2]], expected: 0 },
    ],
    hint: "Buy before each rise and sell at its top; only the positive daily changes matter.",
  },
  {
    id: "al-083",
    title: "Count Boomerangs",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the ordered triples (i, j, k) of distinct points where the distance from i to j equals the distance from i to k, making i the boomerang tip.\n\nFor each point i, group all squared distances to the other points and add c * (c - 1) for every distance with count c. Squared distances avoid floating point errors.",
    starterCode: `def count_boomerangs(points):
    # Your code here
    pass`,
    solution: `def count_boomerangs(points):
    total = 0
    for i, (x1, y1) in enumerate(points):
        groups = {}
        for j, (x2, y2) in enumerate(points):
            if i == j:
                continue
            d = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
            groups[d] = groups.get(d, 0) + 1
        for count in groups.values():
            total += count * (count - 1)
    return total`,
    testCases: [
      { input: [[[0, 0], [1, 0], [2, 0]]], expected: 2 },
      { input: [[[1, 1], [1, 1], [1, 1]]], expected: 6 },
      { input: [[[0, 0], [1, 0]]], expected: 0 },
      { input: [[[1, 1], [2, 2], [3, 3]]], expected: 2 },
    ],
    hint: "For a fixed tip, any two points at the same distance form two ordered boomerangs.",
  },
  {
    id: "al-084",
    title: "Connected Components",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given n nodes labelled 0 to n-1 and undirected edges as [u, v] pairs, return the number of connected components including isolated nodes.\n\nUse union-find to merge the endpoints of every edge, then count the distinct roots. Return 0 when n is 0.",
    starterCode: `def count_components(n, edges):
    # Your code here
    pass`,
    solution: `def count_components(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
    return len({find(i) for i in range(n)})`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { input: [5, []], expected: 5 },
      { input: [1, []], expected: 1 },
      { input: [0, []], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
    ],
    hint: "Nodes with no edges are each their own component.",
  },
  {
    id: "al-085",
    title: "Bipartite Graph Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the undirected graph can be coloured with two colours so that every edge joins different colours, and False otherwise.\n\nRun BFS from every unvisited node, assigning the opposite colour to each neighbour and failing on any conflict. An empty graph is bipartite, and the graph may be disconnected.",
    starterCode: `def is_bipartite(graph):
    # Your code here
    pass`,
    solution: `def is_bipartite(graph):
    color = {}
    for start in range(len(graph)):
        if start in color:
            continue
        color[start] = 0
        queue = [start]
        head = 0
        while head < len(queue):
            node = queue[head]
            head += 1
            for neighbor in graph[node]:
                if neighbor not in color:
                    color[neighbor] = 1 - color[node]
                    queue.append(neighbor)
                elif color[neighbor] == color[node]:
                    return False
    return True`,
    testCases: [
      { input: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], expected: false },
      { input: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expected: true },
      { input: [[]], expected: true },
      { input: [[[]]], expected: true },
      { input: [[[1], [0]]], expected: true },
    ],
    hint: "A graph is bipartite exactly when it has no odd-length cycle.",
  },
  {
    id: "al-086",
    title: "Grid Shortest Path",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given a grid of 0 open cells and 1 walls, return the minimum number of steps from start to end moving up, down, left or right, or -1 if no path exists.\n\nRun breadth-first search from start, recording the distance when a cell is first reached. Return -1 if start or end is a wall, and 0 when start equals end.",
    starterCode: `def shortest_path_grid(grid, start, end):
    # Your code here
    pass`,
    solution: `def shortest_path_grid(grid, start, end):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    sr, sc = start
    er, ec = end
    if rows == 0 or cols == 0 or grid[sr][sc] == 1 or grid[er][ec] == 1:
        return -1
    if sr == er and sc == ec:
        return 0
    dist = [[-1] * cols for _ in range(rows)]
    dist[sr][sc] = 0
    queue = [(sr, sc)]
    head = 0
    while head < len(queue):
        r, c = queue[head]
        head += 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                if nr == er and nc == ec:
                    return dist[nr][nc]
                queue.append((nr, nc))
    return -1`,
    testCases: [
      { input: [[[0, 0, 1], [0, 1, 0], [0, 0, 0]], [0, 0], [2, 2]], expected: 4 },
      { input: [[[0, 1], [1, 0]], [0, 0], [1, 1]], expected: -1 },
      { input: [[[0]], [0, 0], [0, 0]], expected: 0 },
      { input: [[[1, 0], [0, 0]], [0, 0], [1, 1]], expected: -1 },
      { input: [[[0, 0], [0, 0]], [0, 0], [1, 1]], expected: 2 },
    ],
    hint: "BFS explores cells in order of increasing distance, so the first time you reach the end is optimal.",
  },
  {
    id: "al-087",
    title: "Spiral Matrix Generation",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Generate an n by n matrix filled with the numbers 1 to n squared in clockwise spiral order starting at the top-left corner.\n\nMaintain top, bottom, left and right boundaries, walking each side and shrinking that boundary after every pass. Return an empty list for n <= 0.",
    starterCode: `def generate_spiral_matrix(n):
    # Your code here
    pass`,
    solution: `def generate_spiral_matrix(n):
    if n <= 0:
        return []
    matrix = [[0] * n for _ in range(n)]
    top, bottom, left, right = 0, n - 1, 0, n - 1
    value = 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            matrix[top][c] = value
            value += 1
        top += 1
        for r in range(top, bottom + 1):
            matrix[r][right] = value
            value += 1
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                matrix[bottom][c] = value
                value += 1
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                matrix[r][left] = value
                value += 1
            left += 1
    return matrix`,
    testCases: [
      { input: [1], expected: [[1]] },
      { input: [2], expected: [[1, 2], [4, 3]] },
      {
        input: [3],
        expected: [[1, 2, 3], [8, 9, 4], [7, 6, 5]],
      },
      { input: [0], expected: [] },
    ],
    hint: "After each side, move its boundary inward; guard the last row and column when the center is reached.",
  },
  {
    id: "al-088",
    title: "Set Matrix Zeroes",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return a copy of matrix where every row and column that contains a 0 is filled with zeros.\n\nRecord all zero rows and zero columns in sets during a first pass, then build the result so untouched cells keep their original values. The input matrix must not be modified.",
    starterCode: `def set_matrix_zeroes(matrix):
    # Your code here
    pass`,
    solution: `def set_matrix_zeroes(matrix):
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    zero_rows = set()
    zero_cols = set()
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                zero_rows.add(r)
                zero_cols.add(c)
    out = []
    for r in range(rows):
        row = []
        for c in range(cols):
            if r in zero_rows or c in zero_cols:
                row.append(0)
            else:
                row.append(matrix[r][c])
        out.append(row)
    return out`,
    testCases: [
      {
        input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]],
        expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
      },
      {
        input: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]],
        expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]],
      },
      { input: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] },
      { input: [[[0]]], expected: [[0]] },
    ],
    hint: "Collect all zero positions before writing anything, otherwise newly written zeros spread incorrectly.",
  },
  {
    id: "al-089",
    title: "Valid Sudoku Board",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if a partially filled 9 by 9 Sudoku board has no duplicate digits in any row, column or 3 by 3 box, where empty cells are the character dot.\n\nValidate the three constraint types independently using sets. The board is considered valid regardless of whether it can be completed.",
    starterCode: `def is_valid_sudoku(board):
    # Your code here
    pass`,
    solution: `def is_valid_sudoku(board):
    for i in range(9):
        seen = set()
        for j in range(9):
            ch = board[i][j]
            if ch != ".":
                if ch in seen:
                    return False
                seen.add(ch)
    for j in range(9):
        seen = set()
        for i in range(9):
            ch = board[i][j]
            if ch != ".":
                if ch in seen:
                    return False
                seen.add(ch)
    for box in range(9):
        seen = set()
        br = (box // 3) * 3
        bc = (box % 3) * 3
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                ch = board[i][j]
                if ch != ".":
                    if ch in seen:
                        return False
                    seen.add(ch)
    return True`,
    testCases: [
      {
        input: [[
          ["5", "3", ".", ".", "7", ".", ".", ".", "."],
          ["6", ".", ".", "1", "9", "5", ".", ".", "."],
          [".", "9", "8", ".", ".", ".", ".", "6", "."],
          ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
          ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
          ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
          [".", "6", ".", ".", ".", ".", "2", "8", "."],
          [".", ".", ".", "4", "1", "9", ".", ".", "5"],
          [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ]],
        expected: true,
      },
      {
        input: [[
          ["8", "3", ".", ".", "7", ".", ".", ".", "."],
          ["6", ".", ".", "1", "9", "5", ".", ".", "."],
          [".", "9", "8", ".", ".", ".", ".", "6", "."],
          ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
          ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
          ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
          [".", "6", ".", ".", ".", ".", "2", "8", "."],
          [".", ".", ".", "4", "1", "9", ".", ".", "5"],
          [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ]],
        expected: false,
      },
      {
        input: [[
          ["5", "3", ".", ".", "7", ".", ".", ".", "."],
          ["6", ".", ".", "1", "9", "5", ".", ".", "."],
          ["5", "9", "8", ".", ".", ".", ".", "6", "."],
          ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
          ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
          ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
          [".", "6", ".", ".", ".", ".", "2", "8", "."],
          [".", ".", ".", "4", "1", "9", ".", ".", "5"],
          [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ]],
        expected: false,
      },
      {
        input: [[
          ["5", "3", ".", ".", "7", ".", ".", ".", "."],
          ["6", ".", ".", "1", "9", "5", ".", ".", "."],
          [".", "9", "8", ".", ".", ".", ".", "6", "."],
          ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
          ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
          ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
          [".", "6", ".", ".", ".", ".", "2", "8", "."],
          [".", ".", ".", "4", "1", "9", ".", ".", "5"],
          ["5", ".", ".", ".", "8", ".", ".", "7", "9"],
        ]],
        expected: false,
      },
      {
        input: [[
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
          [".", ".", ".", ".", ".", ".", ".", ".", "."],
        ]],
        expected: true,
      },
    ],
    hint: "A 3 by 3 box index is (row // 3) * 3 + column // 3; validate rows, columns and boxes separately.",
  },
  {
    id: "al-090",
    title: "Island Counting with BFS",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the islands in a grid of string 1 land cells and string 0 water cells, where an island is a group of land cells connected horizontally or vertically.\n\nScan every cell and run BFS from each unvisited land cell, marking the whole island as visited. Return 0 for an empty grid.",
    starterCode: `def count_islands(grid):
    # Your code here
    pass`,
    solution: `def count_islands(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    seen = [[False] * cols for _ in range(rows)]
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and not seen[r][c]:
                islands += 1
                queue = [(r, c)]
                seen[r][c] = True
                head = 0
                while head < len(queue):
                    cr, cc = queue[head]
                    head += 1
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1" and not seen[nr][nc]:
                            seen[nr][nc] = True
                            queue.append((nr, nc))
    return islands`,
    testCases: [
      {
        input: [[
          ["1", "1", "1", "1", "0"],
          ["1", "1", "0", "1", "0"],
          ["1", "1", "0", "0", "0"],
          ["0", "0", "0", "0", "0"],
        ]],
        expected: 1,
      },
      {
        input: [[
          ["1", "1", "0", "0", "0"],
          ["1", "1", "0", "0", "0"],
          ["0", "0", "1", "0", "0"],
          ["0", "0", "0", "1", "1"],
        ]],
        expected: 3,
      },
      { input: [[["0"]]], expected: 0 },
      { input: [[["1"]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Each BFS flood fill removes exactly one whole island from future consideration.",
  },
  {
    id: "al-091",
    title: "Unique Paths with Obstacles",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the paths from the top-left to the bottom-right of a grid moving only right or down, where cells containing 1 are obstacles that cannot be entered.\n\nUse dynamic programming with dp[0][0] = 1 and zeroing every obstacle cell as you sweep. If the start or end cell is blocked, return 0.",
    starterCode: `def unique_paths_with_obstacles(grid):
    # Your code here
    pass`,
    solution: `def unique_paths_with_obstacles(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    if rows == 0 or cols == 0 or grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return 0
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = 1
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                dp[r][c] = 0
                continue
            if r > 0:
                dp[r][c] += dp[r - 1][c]
            if c > 0:
                dp[r][c] += dp[r][c - 1]
    return dp[rows - 1][cols - 1]`,
    testCases: [
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { input: [[[0, 1], [0, 0]]], expected: 1 },
      { input: [[[1]]], expected: 0 },
      { input: [[[0]]], expected: 1 },
      { input: [[[0, 0], [0, 0]]], expected: 2 },
      { input: [[[0, 0], [1, 0]]], expected: 1 },
    ],
    hint: "An obstacle contributes zero paths; everything else is the sum of paths from above and from the left.",
  },
  {
    id: "al-092",
    title: "Top K Frequent Elements",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the k values that appear most often in nums.\n\nCount frequencies with a dictionary, then order values by descending count and break ties by ascending value so the output is deterministic. Return an empty list when k is 0.",
    starterCode: `def top_k_frequent(nums, k):
    # Your code here
    pass`,
    solution: `def top_k_frequent(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    ordered = sorted(counts.keys(), key=lambda x: (-counts[x], x))
    return ordered[:k]`,
    testCases: [
      { input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { input: [[1], 1], expected: [1] },
      { input: [[4, 4, 4, 2, 2, 3, 3, 3], 2], expected: [3, 4] },
      { input: [[1, 2, 3], 3], expected: [1, 2, 3] },
      { input: [[5, 5], 1], expected: [5] },
    ],
    hint: "Sort by the tuple (negative frequency, value) for a stable, deterministic order.",
  },
  {
    id: "al-093",
    title: "Kth Smallest in Sorted Matrix",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the k-th smallest value (1-indexed) in a matrix whose rows and columns are each sorted in ascending order.\n\nUse a min-heap seeded with the first element of every row, then pop k times, pushing the next element from the same row after each pop. Assume k is between 1 and the total number of elements.",
    starterCode: `def kth_smallest_matrix(matrix, k):
    # Your code here
    pass`,
    solution: `import heapq

def kth_smallest_matrix(matrix, k):
    heap = []
    for i, row in enumerate(matrix):
        if row:
            heap.append((row[0], i, 0))
    heapq.heapify(heap)
    for _ in range(k):
        value, i, j = heapq.heappop(heap)
        if j + 1 < len(matrix[i]):
            heapq.heappush(heap, (matrix[i][j + 1], i, j + 1))
    return value`,
    testCases: [
      { input: [[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8], expected: 13 },
      { input: [[[1, 2], [3, 4]], 2], expected: 2 },
      { input: [[[1]], 1], expected: 1 },
      { input: [[[-5]], 1], expected: -5 },
      { input: [[[1, 3], [2, 4]], 3], expected: 3 },
    ],
    hint: "The heap is a merge of the sorted rows; the k-th pop is the answer.",
  },
  {
    id: "al-094",
    title: "Majority Element II",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return all values that appear more than floor(n / 3) times in nums, sorted in ascending order.\n\nCount occurrences with a dictionary and keep every value whose count exceeds n // 3. Return an empty list for empty input.",
    starterCode: `def majority_element_ii(nums):
    # Your code here
    pass`,
    solution: `def majority_element_ii(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    threshold = len(nums) // 3
    return sorted(x for x, c in counts.items() if c > threshold)`,
    testCases: [
      { input: [[3, 2, 3]], expected: [3] },
      { input: [[1, 1, 1, 3, 3, 2, 2, 2]], expected: [1, 2] },
      { input: [[1]], expected: [1] },
      { input: [[]], expected: [] },
      { input: [[1, 2]], expected: [1, 2] },
    ],
    hint: "At most two values can appear more than n/3 times, but counting is simpler than the Boyer-Moore variant.",
  },
  {
    id: "al-095",
    title: "Floyd-Warshall Shortest Paths",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given n nodes and directed edges as [u, v, w] triples with no negative cycles, return the n by n matrix of shortest distances, using -1 for unreachable pairs and 0 on the diagonal.\n\nRun the Floyd-Warshall triple loop, relaxing dist[i][j] through every possible intermediate node. Parallel edges keep the smaller weight.",
    starterCode: `def floyd_warshall(n, edges):
    # Your code here
    pass`,
    solution: `from math import inf

def floyd_warshall(n, edges):
    dist = [[inf] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
    for mid in range(n):
        for i in range(n):
            if dist[i][mid] == inf:
                continue
            for j in range(n):
                if dist[mid][j] != inf and dist[i][mid] + dist[mid][j] < dist[i][j]:
                    dist[i][j] = dist[i][mid] + dist[mid][j]
    return [[-1 if d == inf else d for d in row] for row in dist]`,
    testCases: [
      {
        input: [4, [[0, 1, 1], [0, 3, 4], [1, 2, 2], [2, 3, 1], [3, 1, 3]]],
        expected: [[0, 1, 3, 4], [-1, 0, 2, 3], [-1, 4, 0, 1], [-1, 3, 5, 0]],
      },
      { input: [1, []], expected: [[0]] },
      { input: [2, [[0, 1, 5]]], expected: [[0, 5], [-1, 0]] },
      {
        input: [3, [[0, 1, 2], [1, 2, 3]]],
        expected: [[0, 2, 5], [-1, 0, 3], [-1, -1, 0]],
      },
      { input: [2, [[0, 1, 2], [1, 0, 2]]], expected: [[0, 2], [2, 0]] },
    ],
    hint: "The middle loop is the intermediate node; skip pairs involving an infinite distance.",
  },
  {
    id: "al-096",
    title: "Graph BFS Traversal",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the order in which nodes are visited by a breadth-first traversal of adj starting at start, visiting neighbours in the order they appear in each adjacency list.\n\nUse a queue and a visited set, appending a node when it is first discovered. Only nodes reachable from start appear in the result.",
    starterCode: `def bfs_order(adj, start):
    # Your code here
    pass`,
    solution: `def bfs_order(adj, start):
    seen = {start}
    queue = [start]
    order = []
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        order.append(node)
        for neighbor in adj[node]:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    return order`,
    testCases: [
      { input: [[[1, 2], [0, 2, 3], [0, 1], [1]], 0], expected: [0, 1, 2, 3] },
      { input: [[[1], [0, 2], [1], [4], [3]], 0], expected: [0, 1, 2] },
      { input: [[[]], 0], expected: [0] },
      { input: [[[1, 2], [0], [0]], 0], expected: [0, 1, 2] },
      { input: [[[1], [0]], 0], expected: [0, 1] },
    ],
    hint: "Mark nodes when you enqueue them, not when you dequeue, so they are never queued twice.",
  },
  {
    id: "al-097",
    title: "Rotting Oranges",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a grid where 0 is empty, 1 is a fresh orange and 2 is a rotten orange, return the number of minutes until no fresh orange remains, or -1 if that is impossible.\n\nRun a multi-source BFS from all initially rotten oranges, spreading to four-directional fresh neighbours one layer per minute. Return 0 when there are no fresh oranges.",
    starterCode: `def oranges_rotten_minutes(grid):
    # Your code here
    pass`,
    solution: `def oranges_rotten_minutes(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    queue = []
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    if fresh == 0:
        return 0
    minutes = 0
    head = 0
    while head < len(queue):
        size = len(queue) - head
        spread = False
        for _ in range(size):
            r, c = queue[head]
            head += 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    spread = True
                    queue.append((nr, nc))
        if spread:
            minutes += 1
    return minutes if fresh == 0 else -1`,
    testCases: [
      { input: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { input: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
      { input: [[[0, 2]]], expected: 0 },
      { input: [[[1]]], expected: -1 },
      { input: [[[2]]], expected: 0 },
      { input: [[[2, 2], [1, 1]]], expected: 1 },
    ],
    hint: "Process the queue layer by layer so each full round of spreading counts as one minute.",
  },
  {
    id: "al-098",
    title: "Dijkstra Shortest Paths",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n nodes, directed edges as [u, v, w] triples with non-negative weights, and a source node, return the shortest distance from the source to every node, using -1 for unreachable nodes.\n\nUse a min-heap of (distance, node) pairs and settle a node the first time it is popped. Parallel edges are allowed.",
    starterCode: `def dijkstra(n, edges, src):
    # Your code here
    pass`,
    solution: `import heapq

def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [-1] * n
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if dist[u] != -1:
            continue
        dist[u] = d
        for v, w in adj[u]:
            if dist[v] == -1:
                heapq.heappush(heap, (d + w, v))
    return dist`,
    testCases: [
      {
        input: [5, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]], 0],
        expected: [0, 3, 1, 4, 7],
      },
      { input: [1, [], 0], expected: [0] },
      { input: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 5]], 0], expected: [0, 1, 2] },
      { input: [4, [[0, 1, 1]], 3], expected: [-1, -1, -1, 0] },
      { input: [3, [], 1], expected: [-1, 0, -1] },
    ],
    hint: "A node is final when it is popped; later heap entries for it can be ignored.",
  },
  {
    id: "al-099",
    title: "Bellman-Ford Shortest Paths",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n nodes, directed edges as [u, v, w] triples that may include negative weights, and a source node, return the shortest distance from the source to every node, using -1 for unreachable nodes.\n\nRelax every edge n - 1 times, stopping early when a full pass makes no change. Assume there are no negative-weight cycles reachable from the source.",
    starterCode: `def bellman_ford(n, edges, src):
    # Your code here
    pass`,
    solution: `def bellman_ford(n, edges, src):
    dist = [None] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] is not None and (dist[v] is None or dist[u] + w < dist[v]):
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    return [-1 if d is None else d for d in dist]`,
    testCases: [
      {
        input: [
          5,
          [[0, 1, -1], [0, 2, 4], [1, 2, 3], [1, 3, 2], [1, 4, 2], [3, 2, 5], [3, 1, 1], [4, 3, -3]],
          0,
        ],
        expected: [0, -1, 2, -2, 1],
      },
      { input: [1, [], 0], expected: [0] },
      { input: [2, [[0, 1, 5]], 0], expected: [0, 5] },
      { input: [3, [], 2], expected: [-1, -1, 0] },
      { input: [3, [[0, 1, 3], [1, 2, -2]], 0], expected: [0, 3, 1] },
    ],
    hint: "In the worst case each relaxation round extends the shortest path by one edge.",
  },
  {
    id: "al-100",
    title: "Course Schedule",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given num_courses and prerequisite pairs [a, b] meaning course b must be taken before course a, return True if all courses can be finished.\n\nBuild the directed graph and indegrees, then repeatedly remove zero-indegree nodes; if fewer than num_courses nodes are removed, a cycle exists. An empty prerequisite list is always feasible.",
    starterCode: `def can_finish_courses(num_courses, prerequisites):
    # Your code here
    pass`,
    solution: `def can_finish_courses(num_courses, prerequisites):
    adj = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    queue = [i for i in range(num_courses) if indeg[i] == 0]
    head = 0
    seen = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        seen += 1
        for nxt in adj[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)
    return seen == num_courses`,
    testCases: [
      { input: [2, [[1, 0]]], expected: true },
      { input: [2, [[1, 0], [0, 1]]], expected: false },
      { input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
      { input: [3, []], expected: true },
      { input: [1, []], expected: true },
    ],
    hint: "If Kahn's algorithm cannot remove every node, the remaining nodes form at least one cycle.",
  },
  {
    id: "al-101",
    title: "Kruskal Minimum Spanning Tree",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n nodes and undirected weighted edges as [u, v, w] triples, return the total weight of a minimum spanning tree, or -1 if the graph is disconnected.\n\nSort edges by weight and add each edge whose endpoints lie in different union-find components, stopping after n - 1 edges. A single node has an empty spanning tree of weight 0.",
    starterCode: `def kruskal_mst(n, edges):
    # Your code here
    pass`,
    solution: `def kruskal_mst(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = 0
    used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            used += 1
    return total if used == n - 1 else -1`,
    testCases: [
      { input: [4, [[0, 1, 1], [0, 2, 4], [1, 2, 2], [1, 3, 5], [2, 3, 3]]], expected: 6 },
      { input: [1, []], expected: 0 },
      { input: [3, [[0, 1, 1]]], expected: -1 },
      {
        input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10], [1, 3, 5]]],
        expected: 6,
      },
      { input: [2, [[0, 1, 7]]], expected: 7 },
    ],
    hint: "A minimum spanning tree on n nodes uses exactly n - 1 edges.",
  },
  {
    id: "al-102",
    title: "Prim Minimum Spanning Tree",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n nodes and undirected weighted edges as [u, v, w] triples, return the total weight of a minimum spanning tree, or -1 if the graph is disconnected.\n\nGrow the tree from node 0 using a min-heap of candidate edges, skipping nodes already in the tree. A single node has weight 0.",
    starterCode: `def prim_mst(n, edges):
    # Your code here
    pass`,
    solution: `import heapq

def prim_mst(n, edges):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    seen = [False] * n
    heap = [(0, 0)]
    total = 0
    count = 0
    while heap:
        w, u = heapq.heappop(heap)
        if seen[u]:
            continue
        seen[u] = True
        total += w
        count += 1
        for v, weight in adj[u]:
            if not seen[v]:
                heapq.heappush(heap, (weight, v))
    return total if count == n else -1`,
    testCases: [
      { input: [4, [[0, 1, 1], [0, 2, 4], [1, 2, 2], [1, 3, 5], [2, 3, 3]]], expected: 6 },
      { input: [1, []], expected: 0 },
      { input: [3, [[0, 1, 1]]], expected: -1 },
      {
        input: [5, [[0, 1, 2], [0, 2, 3], [1, 2, 1], [2, 3, 4], [3, 4, 5], [2, 4, 6]]],
        expected: 12,
      },
      { input: [2, [[0, 1, 7]]], expected: 7 },
    ],
    hint: "The starting node is free; every later pop adds one new node and its cheapest connecting edge.",
  },
  {
    id: "al-103",
    title: "Longest Palindromic Subsequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the length of the longest palindromic subsequence of s, where characters need not be contiguous.\n\nUse interval dynamic programming: matching end characters add 2 to the inside answer, otherwise the best drops one end. An empty string gives length 0.",
    starterCode: `def longest_palindromic_subsequence(s):
    # Your code here
    pass`,
    solution: `def longest_palindromic_subsequence(s):
    n = len(s)
    if n == 0:
        return 0
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
    testCases: [
      { input: ["bbbab"], expected: 4 },
      { input: ["cbbd"], expected: 2 },
      { input: [""], expected: 0 },
      { input: ["a"], expected: 1 },
      { input: ["abcabcabc"], expected: 5 },
    ],
    hint: "Fill intervals by increasing length so the inside interval is always ready.",
  },
  {
    id: "al-104",
    title: "Longest Bitonic Subsequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the length of the longest subsequence of arr that first strictly increases and then strictly decreases; a purely increasing or purely decreasing run also counts.\n\nCompute increasing lengths from the left and decreasing lengths from the right, then maximise inc[i] + dec[i] - 1 over every center. Return 0 for an empty list.",
    starterCode: `def longest_bitonic_subsequence(arr):
    # Your code here
    pass`,
    solution: `def longest_bitonic_subsequence(arr):
    n = len(arr)
    if n == 0:
        return 0
    inc = [1] * n
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i] and inc[j] + 1 > inc[i]:
                inc[i] = inc[j] + 1
    dec = [1] * n
    for i in range(n - 2, -1, -1):
        for j in range(i + 1, n):
            if arr[j] < arr[i] and dec[j] + 1 > dec[i]:
                dec[i] = dec[j] + 1
    return max(inc[i] + dec[i] - 1 for i in range(n))`,
    testCases: [
      { input: [[1, 11, 2, 10, 4, 5, 2, 1]], expected: 6 },
      { input: [[1, 2, 3, 4, 5]], expected: 5 },
      { input: [[5, 4, 3, 2, 1]], expected: 5 },
      { input: [[1, 2, 3, 2, 1]], expected: 5 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
    ],
    hint: "The peak element is counted in both tables, so subtract 1.",
  },
  {
    id: "al-105",
    title: "Count Word Break Ways",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of ways to split s into a sequence of one or more dictionary words from words, reusing words freely.\n\nLet dp[i] be the number of segmentations of the prefix of length i, and add dp[j] for every split point j where s[j:i] is in the dictionary. An empty string has exactly one segmentation.",
    starterCode: `def count_word_breaks(s, words):
    # Your code here
    pass`,
    solution: `def count_word_breaks(s, words):
    word_set = set(words)
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] += dp[j]
    return dp[n]`,
    testCases: [
      {
        input: ["catsanddog", ["cat", "cats", "and", "sand", "dog"]],
        expected: 2,
      },
      { input: ["aaaa", ["a", "aa"]], expected: 5 },
      { input: ["", ["a"]], expected: 1 },
      { input: ["a", ["b"]], expected: 0 },
      { input: ["leetcode", ["leet", "code"]], expected: 1 },
    ],
    hint: "For each prefix ending at i, sum the ways of every earlier prefix whose suffix is a word.",
  },
  {
    id: "al-106",
    title: "Count Longest Increasing Subsequences",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the number of longest strictly increasing subsequences of arr, counted by index choices.\n\nTrack lengths[i] and counts[i] for subsequences ending at each index, adding counts[j] to counts[i] whenever j extends the same best length. Equal values do not extend each other, and an empty list gives 0.",
    starterCode: `def count_lis(arr):
    # Your code here
    pass`,
    solution: `def count_lis(arr):
    if not arr:
        return 0
    n = len(arr)
    lengths = [1] * n
    counts = [1] * n
    for i in range(n):
        for j in range(i):
            if arr[j] < arr[i]:
                if lengths[j] + 1 > lengths[i]:
                    lengths[i] = lengths[j] + 1
                    counts[i] = counts[j]
                elif lengths[j] + 1 == lengths[i]:
                    counts[i] += counts[j]
    best = max(lengths)
    return sum(counts[i] for i in range(n) if lengths[i] == best)`,
    testCases: [
      { input: [[1, 3, 5, 4, 7]], expected: 2 },
      { input: [[2, 2, 2, 2, 2]], expected: 5 },
      { input: [[1, 2, 3]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[1, 1, 2, 2, 3, 3]], expected: 8 },
    ],
    hint: "When a new predecessor ties the best length, inherit its count instead of resetting.",
  },
  {
    id: "al-107",
    title: "Weighted Interval Scheduling",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given intervals as [start, end, weight] triples, return the maximum total weight of a set of mutually non-overlapping intervals.\n\nSort by end time and let dp[i] be the best using the first i intervals; for each interval find the last compatible earlier interval and choose between skipping or taking it. Touching endpoints are compatible.",
    starterCode: `def weighted_interval_scheduling(intervals):
    # Your code here
    pass`,
    solution: `def weighted_interval_scheduling(intervals):
    if not intervals:
        return 0
    ordered = sorted(intervals, key=lambda x: x[1])
    n = len(ordered)
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        start, end, weight = ordered[i - 1]
        j = i - 1
        while j > 0 and ordered[j - 1][1] > start:
            j -= 1
        take = dp[j] + weight
        dp[i] = max(dp[i - 1], take)
    return dp[n]`,
    testCases: [
      {
        input: [[[1, 3, 5], [2, 5, 6], [4, 6, 5], [6, 7, 4], [5, 8, 11], [7, 9, 2]]],
        expected: 17,
      },
      { input: [[]], expected: 0 },
      { input: [[[1, 2, 3]]], expected: 3 },
      { input: [[[1, 4, 5], [2, 3, 10]]], expected: 10 },
      { input: [[[1, 2, 3], [2, 3, 4], [3, 4, 5]]], expected: 12 },
    ],
    hint: "j is the number of intervals that end at or before the current start.",
  },
  {
    id: "al-108",
    title: "Task Scheduler",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given task labels and a cooldown n that must separate two runs of the same task, return the minimum number of time slots needed to run all tasks.\n\nLet max_count be the highest frequency and num_max how many tasks share it; the answer is the larger of the task count and (max_count - 1) * (n + 1) + num_max. Return 0 when there are no tasks.",
    starterCode: `def least_interval(tasks, n):
    # Your code here
    pass`,
    solution: `def least_interval(tasks, n):
    counts = {}
    for t in tasks:
        counts[t] = counts.get(t, 0) + 1
    if not counts:
        return 0
    max_count = max(counts.values())
    num_max = sum(1 for c in counts.values() if c == max_count)
    return max(len(tasks), (max_count - 1) * (n + 1) + num_max)`,
    testCases: [
      { input: [["A", "A", "A", "B", "B", "B"], 2], expected: 8 },
      { input: [["A", "A", "A", "B", "B", "B"], 0], expected: 6 },
      {
        input: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2],
        expected: 16,
      },
      { input: [["A"], 3], expected: 1 },
      { input: [["A", "A", "A"], 3], expected: 9 },
    ],
    hint: "The most frequent task defines the frame; idle slots can be filled by other tasks.",
  },
  {
    id: "al-109",
    title: "Jump Game II",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given nums where nums[i] is the maximum jump length from index i, return the minimum number of jumps needed to reach the last index; assume the end is always reachable.\n\nUse a greedy layer expansion: scan positions up to the current jump boundary while tracking the farthest reachable index, then jump when the boundary is crossed. A single-element list needs 0 jumps.",
    starterCode: `def min_jumps(nums):
    # Your code here
    pass`,
    solution: `def min_jumps(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        if i + nums[i] > farthest:
            farthest = i + nums[i]
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps`,
    testCases: [
      { input: [[2, 3, 1, 1, 4]], expected: 2 },
      { input: [[2, 3, 0, 1, 4]], expected: 2 },
      { input: [[0]], expected: 0 },
      { input: [[1, 1, 1, 1]], expected: 3 },
      { input: [[5]], expected: 0 },
    ],
    hint: "All positions within the current boundary cost the same number of jumps.",
  },
  {
    id: "al-110",
    title: "Gas Station Circuit",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given gas available at each station and the cost to travel to the next station, return the index of the unique starting station that completes the circuit, or -1 if none exists.\n\nIf total gas is less than total cost the answer is -1; otherwise scan once, resetting the candidate start whenever the running tank goes negative. Ties cannot occur.",
    starterCode: `def can_complete_circuit(gas, cost):
    # Your code here
    pass`,
    solution: `def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = 0
    tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { input: [[2, 3, 4], [3, 4, 3]], expected: -1 },
      { input: [[1], [1]], expected: 0 },
      { input: [[1, 1], [1, 1]], expected: 0 },
      { input: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expected: 4 },
    ],
    hint: "If the tank empties at i, no start between the previous start and i can work either.",
  },
  {
    id: "al-111",
    title: "Painters Partition",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given board lengths and k painters, return the minimum possible time for k painters to paint all boards, where each painter paints a contiguous segment and the finish time is the largest segment sum. Return -1 when k < 1.\n\nBinary search the answer between the longest board and the total length, checking feasibility by greedily counting how many painters a candidate limit requires.",
    starterCode: `def painters_partition(boards, k):
    # Your code here
    pass`,
    solution: `def painters_partition(boards, k):
    if k < 1:
        return -1
    if k >= len(boards):
        return max(boards)
    lo, hi = max(boards), sum(boards)
    while lo < hi:
        mid = (lo + hi) // 2
        painters = 1
        current = 0
        for b in boards:
            if current + b > mid:
                painters += 1
                current = b
            else:
                current += b
        if painters <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    testCases: [
      { input: [[10, 20, 30, 40], 2], expected: 60 },
      { input: [[10, 20, 30, 40], 1], expected: 100 },
      { input: [[10, 20, 30, 40], 4], expected: 40 },
      { input: [[5], 1], expected: 5 },
      { input: [[1, 2, 3, 4, 5], 3], expected: 6 },
    ],
    hint: "A limit is feasible when the greedy painter count does not exceed k.",
  },
  {
    id: "al-112",
    title: "Allocate Books",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given page counts of books in order and a number of students, return the minimum possible maximum pages assigned to a student, where each student receives a contiguous run of books. Return -1 when students < 1 or students > len(pages).\n\nBinary search the limit and greedily check whether the books can be allocated with at most the allowed number of students.",
    starterCode: `def allocate_books(pages, students):
    # Your code here
    pass`,
    solution: `def allocate_books(pages, students):
    if students < 1 or students > len(pages):
        return -1
    lo, hi = max(pages), sum(pages)
    while lo < hi:
        mid = (lo + hi) // 2
        used = 1
        current = 0
        for p in pages:
            if current + p > mid:
                used += 1
                current = p
            else:
                current += p
        if used <= students:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    testCases: [
      { input: [[12, 34, 67, 90], 2], expected: 113 },
      { input: [[12, 34, 67, 90], 3], expected: 90 },
      { input: [[10, 20, 30], 1], expected: 60 },
      { input: [[10, 20, 30], 3], expected: 30 },
      { input: [[10, 20, 30], 4], expected: -1 },
    ],
    hint: "More students than books is impossible; otherwise binary search the page limit.",
  },
  {
    id: "al-113",
    title: "Aggressive Cows",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given stall positions and a number of cows, return the maximum possible minimum distance between any two cows when all cows are placed in distinct stalls. Return -1 when cows < 2 or cows > len(stalls).\n\nBinary search the distance and greedily place a cow whenever the gap from the last placed stall is at least the candidate.",
    starterCode: `def aggressive_cows(stalls, cows):
    # Your code here
    pass`,
    solution: `def aggressive_cows(stalls, cows):
    if cows < 2 or cows > len(stalls):
        return -1
    positions = sorted(stalls)
    lo, hi = 1, positions[-1] - positions[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        count = 1
        last = positions[0]
        for p in positions[1:]:
            if p - last >= mid:
                count += 1
                last = p
        if count >= cows:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    testCases: [
      { input: [[1, 2, 8, 4, 9], 3], expected: 3 },
      { input: [[1, 2, 4, 8, 9], 3], expected: 3 },
      { input: [[1, 2, 8, 4, 9], 4], expected: 1 },
      { input: [[1, 5], 2], expected: 4 },
      { input: [[1, 2, 3, 4, 5], 2], expected: 4 },
    ],
    hint: "The upper bound for the gap is the distance between the first and last stall.",
  },
  {
    id: "al-114",
    title: "Koko Eating Bananas",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given piles of bananas and h hours available, return the minimum integer eating speed that finishes all piles within h hours, where only one pile can be eaten per hour. Assume h >= len(piles).\n\nBinary search the speed, summing ceil(p / speed) hours for every pile to test feasibility.",
    starterCode: `def min_eating_speed(piles, h):
    # Your code here
    pass`,
    solution: `def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        hours = 0
        for p in piles:
            hours += (p + mid - 1) // mid
        if hours <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    testCases: [
      { input: [[3, 6, 7, 11], 8], expected: 4 },
      { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { input: [[1], 1], expected: 1 },
      { input: [[1, 1, 1, 1], 4], expected: 1 },
    ],
    hint: "Integer ceiling division is (p + speed - 1) // speed.",
  },
  {
    id: "al-115",
    title: "Ship Packages Within Days",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given package weights in order and a number of days, return the minimum ship capacity that ships all packages within the days while preserving order. Assume days >= len(weights).\n\nBinary search the capacity between the heaviest package and the total weight, greedily loading packages until the next one would overflow into a new day.",
    starterCode: `def ship_within_days(weights, days):
    # Your code here
    pass`,
    solution: `def ship_within_days(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        used = 1
        current = 0
        for w in weights:
            if current + w > mid:
                used += 1
                current = w
            else:
                current += w
        if used <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { input: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
      { input: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { input: [[1], 1], expected: 1 },
      { input: [[10], 5], expected: 10 },
    ],
    hint: "The capacity can never be smaller than the heaviest single package.",
  },
  {
    id: "al-116",
    title: "Stock Profit with At Most Two Transactions",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given daily prices, return the maximum profit from at most two non-overlapping buy-then-sell transactions.\n\nTrack four state variables in a single pass: the best first buy, first sell, second buy and second sell. Return 0 when no profitable pair of transactions exists.",
    starterCode: `def max_profit_at_most_two(prices):
    # Your code here
    pass`,
    solution: `def max_profit_at_most_two(prices):
    buy1 = float("-inf")
    buy2 = float("-inf")
    sell1 = 0
    sell2 = 0
    for p in prices:
        if -p > buy1:
            buy1 = -p
        if buy1 + p > sell1:
            sell1 = buy1 + p
        if sell1 - p > buy2:
            buy2 = sell1 - p
        if buy2 + p > sell2:
            sell2 = buy2 + p
    return sell2`,
    testCases: [
      { input: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 6 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 0 },
    ],
    hint: "sell1 - p is the effective cost of the second buy after banking the first profit.",
  },
  {
    id: "al-117",
    title: "Word Ladder",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given begin and end words of equal length and a dictionary words, return the number of words in the shortest transformation sequence from begin to end, changing one letter at a time so every intermediate word is in the dictionary.\n\nRun BFS over the word set, expanding only candidates at Hamming distance 1. Return 1 when begin equals end and 0 when end is not in the dictionary.",
    starterCode: `def ladder_length(begin, end, words):
    # Your code here
    pass`,
    solution: `def ladder_length(begin, end, words):
    if begin == end:
        return 1
    word_set = set(words)
    if end not in word_set:
        return 0
    queue = [begin]
    visited = {begin}
    steps = 1
    while queue:
        nxt = []
        for word in queue:
            for candidate in list(word_set):
                if candidate in visited or len(candidate) != len(word):
                    continue
                diff = sum(1 for a, b in zip(word, candidate) if a != b)
                if diff == 1:
                    if candidate == end:
                        return steps + 1
                    visited.add(candidate)
                    nxt.append(candidate)
        queue = nxt
        steps += 1
    return 0`,
    testCases: [
      {
        input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
        expected: 5,
      },
      { input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], expected: 0 },
      { input: ["a", "c", ["a", "b", "c"]], expected: 2 },
      { input: ["hot", "hot", ["hot"]], expected: 1 },
      { input: ["a", "b", []], expected: 0 },
    ],
    hint: "The sequence length counts both endpoints; each BFS layer is one more letter change.",
  },
  {
    id: "al-118",
    title: "Alien Dictionary",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given words sorted by an alien alphabet, return a string of the unique letters in a valid order, or the empty string if no valid order exists.\n\nDerive precedence edges from the first differing character of each adjacent pair, and reject a longer word that appears before its own prefix. Use Kahn's algorithm with a min-heap for the lexicographically smallest order.",
    starterCode: `def alien_order(words):
    # Your code here
    pass`,
    solution: `import heapq

def alien_order(words):
    letters = set()
    for word in words:
        letters.update(word)
    adj = {ch: set() for ch in letters}
    indeg = {ch: 0 for ch in letters}
    for first, second in zip(words, words[1:]):
        for a, b in zip(first, second):
            if a != b:
                if b not in adj[a]:
                    adj[a].add(b)
                    indeg[b] += 1
                break
        else:
            if len(first) > len(second):
                return ""
    heap = [ch for ch in letters if indeg[ch] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        ch = heapq.heappop(heap)
        order.append(ch)
        for nxt in adj[ch]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    if len(order) != len(letters):
        return ""
    return "".join(order)`,
    testCases: [
      { input: [["wrt", "wrf", "er", "ett", "rftt"]], expected: "wertf" },
      { input: [["z", "x"]], expected: "zx" },
      { input: [["z", "x", "z"]], expected: "" },
      { input: [["abc", "ab"]], expected: "" },
      { input: [["a"]], expected: "a" },
      { input: [["ab", "adc"]], expected: "abcd" },
    ],
    hint: "A word appearing before its own prefix makes the ordering impossible, and leftover letters mean a cycle.",
  },
  {
    id: "al-119",
    title: "Distinct Subsequences",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the number of distinct subsequences of s that equal t, counted by index choices.\n\nUse dynamic programming where dp[i][j] counts subsequences of the first i characters of s matching the first j of t: skip s[i-1], plus add dp[i-1][j-1] when the characters match. An empty t has exactly one subsequence.",
    starterCode: `def num_distinct_subsequences(s, t):
    # Your code here
    pass`,
    solution: `def num_distinct_subsequences(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp[m][n]`,
    testCases: [
      { input: ["rabbbit", "rabbit"], expected: 3 },
      { input: ["babgbag", "bag"], expected: 5 },
      { input: ["", ""], expected: 1 },
      { input: ["abc", ""], expected: 1 },
      { input: ["abc", "d"], expected: 0 },
    ],
    hint: "Every matching character can either be used in the subsequence or skipped.",
  },
  {
    id: "al-120",
    title: "Palindrome Partitioning Minimum Cuts",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the minimum number of cuts needed so that every resulting substring of s is a palindrome.\n\nPrecompute which substrings are palindromes in O(n squared), then let dp[i] be the minimum cuts for the prefix ending at i, using 0 when the whole prefix is a palindrome. An empty string needs 0 cuts.",
    starterCode: `def min_cut_palindrome_partition(s):
    # Your code here
    pass`,
    solution: `def min_cut_palindrome_partition(s):
    n = len(s)
    if n == 0:
        return 0
    is_pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or is_pal[i + 1][j - 1]):
                is_pal[i][j] = True
    dp = [0] * n
    for i in range(1, n):
        best = i
        for j in range(i + 1):
            if is_pal[j][i] and (j == 0 or dp[j - 1] + 1 < best):
                best = 0 if j == 0 else dp[j - 1] + 1
        dp[i] = best
    return dp[n - 1]`,
    testCases: [
      { input: ["aab"], expected: 1 },
      { input: ["a"], expected: 0 },
      { input: ["ab"], expected: 1 },
      { input: ["ababbbabbababa"], expected: 3 },
      { input: ["abcba"], expected: 0 },
    ],
    hint: "A palindrome prefix costs zero cuts; otherwise try every palindromic suffix of the current prefix.",
  },
  {
    id: "al-121",
    title: "Burst Balloons",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given balloon values, return the maximum coins from bursting every balloon, where bursting balloon i earns left * values[i] * right based on its current neighbours, and the outside is treated as value 1.\n\nUse interval dynamic programming with virtual 1s at both ends: for each interval choose which balloon is burst last. Return 0 when there are no balloons.",
    starterCode: `def max_coins_balloons(nums):
    # Your code here
    pass`,
    solution: `def max_coins_balloons(nums):
    if not nums:
        return 0
    values = [1] + list(nums) + [1]
    n = len(values)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for left in range(0, n - length):
            right = left + length
            best = 0
            for k in range(left + 1, right):
                coins = dp[left][k] + dp[k][right] + values[left] * values[k] * values[right]
                if coins > best:
                    best = coins
            dp[left][right] = best
    return dp[0][n - 1]`,
    testCases: [
      { input: [[3, 1, 5, 8]], expected: 167 },
      { input: [[1, 5]], expected: 10 },
      { input: [[5]], expected: 5 },
      { input: [[]], expected: 0 },
      { input: [[1, 2, 3]], expected: 12 },
    ],
    hint: "Thinking about the last balloon burst in an interval avoids the changing-neighbour problem.",
  },
  {
    id: "al-122",
    title: "Super Egg Drop",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given k eggs and n floors of identical critical height, return the minimum number of moves needed in the worst case to determine the highest safe floor.\n\nWith m moves and e eggs you can test C(m, 1) + ... + C(m, k) floors, so grow m until the coverage reaches n. Return 0 when n is 0.",
    starterCode: `def super_egg_drop(k, n):
    # Your code here
    pass`,
    solution: `def super_egg_drop(k, n):
    moves = 0
    floors = 0
    while floors < n:
        moves += 1
        floors = 0
        term = 1
        for e in range(1, k + 1):
            term = term * (moves - e + 1) // e
            floors += term
            if floors >= n:
                break
    return moves`,
    testCases: [
      { input: [1, 2], expected: 2 },
      { input: [2, 6], expected: 3 },
      { input: [3, 14], expected: 4 },
      { input: [1, 1], expected: 1 },
      { input: [2, 1], expected: 1 },
      { input: [3, 0], expected: 0 },
    ],
    hint: "The binomial term C(m, e) counts the floors that can be resolved with e eggs and m moves.",
  },
  {
    id: "al-123",
    title: "Decode Ways II",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the ways to decode a string of digits and star wildcards, where a star matches any digit 1 to 9 and letters map from 1 to 26.\n\nUse dynamic programming with helper counts: a wildcard single digit gives 9 choices, and a leading wildcard contributes 15 valid two-digit groups. Return 0 for the empty string.",
    starterCode: `def num_decodings_ii(s):
    # Your code here
    pass`,
    solution: `def num_decodings_ii(s):
    if not s:
        return 0
    def one(c):
        if c == "*":
            return 9
        if c == "0":
            return 0
        return 1
    def two(a, b):
        if a == "*":
            if b == "*":
                return 15
            if b <= "6":
                return 2
            return 1
        if a == "1":
            if b == "*":
                return 9
            return 1
        if a == "2":
            if b == "*":
                return 6
            if b <= "6":
                return 1
            return 0
        return 0
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] += one(s[i - 1]) * dp[i - 1]
        if i >= 2:
            dp[i] += two(s[i - 2], s[i - 1]) * dp[i - 2]
    return dp[n]`,
    testCases: [
      { input: ["*"], expected: 9 },
      { input: ["1*"], expected: 18 },
      { input: ["2*"], expected: 15 },
      { input: ["**"], expected: 96 },
      { input: ["0"], expected: 0 },
      { input: ["11106"], expected: 2 },
    ],
    hint: "Count single-digit and two-digit transitions separately, using the previous two dp values.",
  },
  {
    id: "al-124",
    title: "Cherry Pickup",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given an n by n grid where 1 is a cherry, 0 is empty and -1 is a thorn, return the maximum cherries collected on a round trip from (0,0) to (n-1,n-1) and back, counting each cell once.\n\nSimulate two walkers moving simultaneously from the top-left, memoising states by (r1, c1, r2) and adding both cells when the walkers occupy different squares. Return -1 if the trip is impossible.",
    starterCode: `def cherry_pickup(grid):
    # Your code here
    pass`,
    solution: `def cherry_pickup(grid):
    n = len(grid)
    if grid[0][0] == -1 or grid[n - 1][n - 1] == -1:
        return -1
    NEG = float("-inf")
    memo = {}
    def best(r1, c1, r2):
        c2 = r1 + c1 - r2
        if r1 >= n or c1 >= n or r2 >= n or c2 >= n or c2 < 0:
            return NEG
        if grid[r1][c1] == -1 or grid[r2][c2] == -1:
            return NEG
        if r1 == n - 1 and c1 == n - 1:
            return grid[r1][c1]
        key = (r1, c1, r2)
        if key in memo:
            return memo[key]
        gained = grid[r1][c1]
        if r1 != r2 or c1 != c2:
            gained += grid[r2][c2]
        result = gained + max(
            best(r1 + 1, c1, r2 + 1),
            best(r1 + 1, c1, r2),
            best(r1, c1 + 1, r2 + 1),
            best(r1, c1 + 1, r2),
        )
        memo[key] = result
        return result
    result = best(0, 0, 0)
    return result if result != NEG else -1`,
    testCases: [
      { input: [[[0, 1, -1], [1, 0, -1], [1, 1, 1]]], expected: 5 },
      { input: [[[1, 1, -1], [1, -1, 1], [-1, 1, 1]]], expected: -1 },
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 1], [1, 1]]], expected: 4 },
    ],
    hint: "Because c2 = r1 + c1 - r2, each state needs only three coordinates.",
  },
  {
    id: "al-125",
    title: "Merge K Sorted Lists",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Merge k sorted lists into one sorted list.\n\nUse a min-heap of (value, list index, element index) seeded with the first element of every non-empty list, popping the smallest and pushing the next element from the same list. Return an empty list when there are no elements.",
    starterCode: `def merge_k_sorted(lists):
    # Your code here
    pass`,
    solution: `import heapq

def merge_k_sorted(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heap.append((lst[0], i, 0))
    heapq.heapify(heap)
    out = []
    while heap:
        value, i, j = heapq.heappop(heap)
        out.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out`,
    testCases: [
      {
        input: [[[1, 4, 5], [1, 3, 4], [2, 6]]],
        expected: [1, 1, 2, 3, 4, 4, 5, 6],
      },
      { input: [[]], expected: [] },
      { input: [[[]]], expected: [] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[-3, -1], [0, 2]]], expected: [-3, -1, 0, 2] },
    ],
    hint: "The list and element indices in the heap tuple keep equal values ordered deterministically.",
  },
];
