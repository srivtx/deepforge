import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-131",
    title: "Segment Tree Range Minimum",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Support range-minimum queries and point updates on a list with a recursive segment tree.\n\nnums is the initial array. queries is a list of [\"query\", l, r] (minimum of nums[l] through nums[r] inclusive) or [\"update\", i, val] (set nums[i] = val), using 0-based indices. Each node stores the minimum of its segment.\n\nReturn the list of query results in order.",
    starterCode: `def segment_tree_range_min(nums, queries):
    # Your code here
    pass`,
    solution: `def segment_tree_range_min(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        tree[node] = min(tree[2 * node + 1], tree[2 * node + 2])

    if n:
        build(0, 0, n - 1)

    def update(node, lo, hi, idx, val):
        if lo == hi:
            tree[node] = val
            return
        mid = (lo + hi) // 2
        if idx <= mid:
            update(2 * node + 1, lo, mid, idx, val)
        else:
            update(2 * node + 2, mid + 1, hi, idx, val)
        tree[node] = min(tree[2 * node + 1], tree[2 * node + 2])

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return float("inf")
        if l <= lo and hi <= r:
            return tree[node]
        mid = (lo + hi) // 2
        return min(query(2 * node + 1, lo, mid, l, r), query(2 * node + 2, mid + 1, hi, l, r))

    out = []
    for q in queries:
        if q[0] == "query":
            out.append(query(0, 0, n - 1, q[1], q[2]))
        else:
            update(0, 0, n - 1, q[1], q[2])
    return out`,
    testCases: [
      { input: [[5, 2, 4, 1], [["query", 1, 3], ["update", 1, 0], ["query", 0, 3]]], expected: [1, 0] },
      { input: [[3], [["query", 0, 0]]], expected: [3] },
      { input: [[2, 4], [["update", 0, 9], ["query", 0, 1]]], expected: [4] },
      { input: [[7, 7, 7], [["query", 0, 2], ["update", 1, -5], ["query", 0, 2]]], expected: [7, -5] },
      { input: [[], []], expected: [] },
    ],
    hint: "Each internal node stores the minimum of its two children.",
  },
  {
    id: "ds-132",
    title: "Segment Tree Range Max with Index",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Support range-maximum queries that also report the leftmost index of the maximum.\n\nnums is the initial array. queries is a list of [\"query\", l, r] or [\"update\", i, val]. Each segment-tree node stores the index of the maximum in its segment, breaking ties toward the smaller index.\n\nReturn [maximum, index] for each query.",
    starterCode: `def range_max_index(nums, queries):
    # Your code here
    pass`,
    solution: `def range_max_index(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []

    def better(a, b):
        if a == -1:
            return b
        if b == -1:
            return a
        if nums[a] >= nums[b]:
            return a
        return b

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = lo
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        tree[node] = better(tree[2 * node + 1], tree[2 * node + 2])

    if n:
        build(0, 0, n - 1)

    def update(node, lo, hi, idx):
        if lo == hi:
            tree[node] = lo
            return
        mid = (lo + hi) // 2
        if idx <= mid:
            update(2 * node + 1, lo, mid, idx)
        else:
            update(2 * node + 2, mid + 1, hi, idx)
        tree[node] = better(tree[2 * node + 1], tree[2 * node + 2])

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return -1
        if l <= lo and hi <= r:
            return tree[node]
        mid = (lo + hi) // 2
        return better(query(2 * node + 1, lo, mid, l, r), query(2 * node + 2, mid + 1, hi, l, r))

    out = []
    for q in queries:
        if q[0] == "query":
            idx = query(0, 0, n - 1, q[1], q[2])
            out.append([nums[idx], idx])
        else:
            nums[q[1]] = q[2]
            update(0, 0, n - 1, q[1])
    return out`,
    testCases: [
      { input: [[1, 5, 3, 5], [["query", 0, 3]]], expected: [[5, 1]] },
      { input: [[1, 5, 3, 5], [["query", 1, 3]]], expected: [[5, 1]] },
      { input: [[2], [["query", 0, 0]]], expected: [[2, 0]] },
      { input: [[4, 4, 2], [["update", 0, 1], ["query", 0, 2]]], expected: [[4, 1]] },
      { input: [[5, 3, 8], [["query", 0, 2], ["update", 2, 1], ["query", 0, 2]]], expected: [[8, 2], [5, 0]] },
    ],
    hint: "Compare values, and on a tie keep the index that comes first.",
  },
  {
    id: "ds-133",
    title: "Segment Tree Lazy Propagation Range Add",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range addition and range-sum queries with a lazy segment tree.\n\nnums is the initial array. queries is a list of [\"add\", l, r, val] (add val to every element in nums[l..r]) or [\"query\", l, r] (sum over the inclusive range). A lazy value per node defers updates to children until they are needed.\n\nReturn the list of query results.",
    starterCode: `def lazy_range_add(nums, queries):
    # Your code here
    pass`,
    solution: `def lazy_range_add(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []
    lazy = [0] * (4 * n) if n else []

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2]

    if n:
        build(0, 0, n - 1)

    def apply(node, lo, hi, val):
        tree[node] += val * (hi - lo + 1)
        lazy[node] += val

    def push(node, lo, hi):
        if lazy[node] and lo != hi:
            mid = (lo + hi) // 2
            apply(2 * node + 1, lo, mid, lazy[node])
            apply(2 * node + 2, mid + 1, hi, lazy[node])
            lazy[node] = 0

    def add(node, lo, hi, l, r, val):
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            apply(node, lo, hi, val)
            return
        push(node, lo, hi)
        mid = (lo + hi) // 2
        add(2 * node + 1, lo, mid, l, r, val)
        add(2 * node + 2, mid + 1, hi, l, r, val)
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2]

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return tree[node]
        push(node, lo, hi)
        mid = (lo + hi) // 2
        return query(2 * node + 1, lo, mid, l, r) + query(2 * node + 2, mid + 1, hi, l, r)

    out = []
    for q in queries:
        if q[0] == "query":
            out.append(query(0, 0, n - 1, q[1], q[2]))
        else:
            add(0, 0, n - 1, q[1], q[2], q[3])
    return out`,
    testCases: [
      {
        input: [[1, 2, 3, 4], [["add", 1, 2, 5], ["query", 0, 3], ["add", 0, 3, 1], ["query", 1, 1]]],
        expected: [20, 8],
      },
      { input: [[5], [["query", 0, 0], ["add", 0, 0, -3], ["query", 0, 0]]], expected: [5, 2] },
      { input: [[0, 0, 0], [["add", 0, 2, 7], ["query", 1, 2]]], expected: [14] },
      { input: [[1, 2], [["add", 1, 1, 10], ["query", 0, 0], ["query", 1, 1]]], expected: [1, 12] },
      { input: [[], []], expected: [] },
    ],
    hint: "A pending add on a node can be applied to its whole segment in constant time.",
  },
  {
    id: "ds-134",
    title: "Fenwick Range Update Point Query",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range additions and point queries with a Fenwick tree over a difference array.\n\nnums is the initial array. queries is a list of [\"add\", l, r, val] (add val to nums[l..r]) or [\"point\", i] (current value at i). A range add becomes two point updates on the underlying binary indexed tree, and a point query is a prefix sum of differences.\n\nReturn the list of point-query results.",
    starterCode: `def fenwick_range_update_point_query(nums, queries):
    # Your code here
    pass`,
    solution: `def fenwick_range_update_point_query(nums, queries):
    n = len(nums)
    diff = [nums[i] - (nums[i - 1] if i > 0 else 0) for i in range(n)]
    tree = [0] * (n + 1)

    def add(i, delta):
        i += 1
        while i <= n:
            tree[i] += delta
            i += i & (-i)

    def prefix(i):
        i += 1
        s = 0
        while i > 0:
            s += tree[i]
            i -= i & (-i)
        return s

    for i, d in enumerate(diff):
        add(i, d)
    out = []
    for q in queries:
        if q[0] == "add":
            l, r, val = q[1], q[2], q[3]
            add(l, val)
            if r + 1 < n:
                add(r + 1, -val)
        else:
            out.append(prefix(q[1]))
    return out`,
    testCases: [
      {
        input: [
          [1, 2, 3],
          [["add", 0, 1, 5], ["point", 0], ["point", 1], ["point", 2], ["add", 1, 2, -2], ["point", 2]],
        ],
        expected: [6, 7, 3, 1],
      },
      { input: [[5], [["point", 0], ["add", 0, 0, 2], ["point", 0]]], expected: [5, 7] },
      { input: [[0, 0, 0, 0], [["add", 1, 3, 4], ["point", 0], ["point", 2]]], expected: [0, 4] },
      { input: [[1, 1], [["add", 0, 1, 0], ["point", 1]]], expected: [1] },
    ],
    hint: "Storing the difference array in a BIT turns a range add into two point adds.",
  },
  {
    id: "ds-135",
    title: "Fenwick 2D Prefix Sum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support point updates and prefix-rectangle sums on a small 2D grid with a 2D Fenwick tree.\n\ngrid is the initial matrix. queries is a list of [\"update\", r, c, delta] (add delta at row r, column c) or [\"prefix\", r, c] (sum of the rectangle from (0,0) to (r,c) inclusive).\n\nReturn the list of prefix results.",
    starterCode: `def fenwick_2d(grid, queries):
    # Your code here
    pass`,
    solution: `def fenwick_2d(grid, queries):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    tree = [[0] * (cols + 1) for _ in range(rows + 1)]

    def update(r, c, delta):
        i = r + 1
        while i <= rows:
            j = c + 1
            while j <= cols:
                tree[i][j] += delta
                j += j & (-j)
            i += i & (-i)

    def prefix(r, c):
        total = 0
        i = r + 1
        while i > 0:
            j = c + 1
            while j > 0:
                total += tree[i][j]
                j -= j & (-j)
            i -= i & (-i)
        return total

    for r in range(rows):
        for c in range(cols):
            if grid[r][c]:
                update(r, c, grid[r][c])
    out = []
    for q in queries:
        if q[0] == "update":
            update(q[1], q[2], q[3])
        else:
            out.append(prefix(q[1], q[2]))
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]], [["prefix", 1, 1]]], expected: [10] },
      { input: [[[1, 2], [3, 4]], [["prefix", 0, 1]]], expected: [3] },
      { input: [[[1, 2], [3, 4]], [["update", 0, 0, 5], ["prefix", 1, 1]]], expected: [15] },
      {
        input: [[[0, 0], [0, 0]], [["update", 1, 1, 3], ["prefix", 1, 1], ["prefix", 0, 0]]],
        expected: [3, 0],
      },
      {
        input: [[[2, 2], [2, 2]], [["prefix", 0, 0], ["update", 1, 0, -2], ["prefix", 1, 1]]],
        expected: [2, 6],
      },
    ],
    hint: "The 2D BIT nests two index loops, each walking i += i & -i.",
  },
  {
    id: "ds-136",
    title: "Sparse Table Range Minimum",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Answer static range-minimum queries with a sparse table.\n\nnums is fixed. queries is a list of [l, r] pairs and each answer is min(nums[l..r]). Precompute the minima of all intervals whose length is a power of two so each query needs only two overlapping blocks.\n\nReturn the list of answers.",
    starterCode: `def sparse_table_min(nums, queries):
    # Your code here
    pass`,
    solution: `def sparse_table_min(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    log = [0] * (n + 1)
    for i in range(2, n + 1):
        log[i] = log[i // 2] + 1
    table = [list(nums)]
    j = 1
    while (1 << j) <= n:
        half = 1 << (j - 1)
        row = [0] * n
        for i in range(n - (1 << j) + 1):
            row[i] = min(table[j - 1][i], table[j - 1][i + half])
        table.append(row)
        j += 1
    out = []
    for l, r in queries:
        length = r - l + 1
        k = log[length]
        out.append(min(table[k][l], table[k][r - (1 << k) + 1]))
    return out`,
    testCases: [
      { input: [[4, 2, 7, 1, 3], [[1, 3], [0, 4], [2, 2]]], expected: [1, 1, 7] },
      { input: [[5], [[0, 0]]], expected: [5] },
      { input: [[3, 1, 4, 1, 5, 9, 2, 6], [[0, 3], [4, 7], [2, 5]]], expected: [1, 2, 1] },
      { input: [[], []], expected: [] },
    ],
    hint: "The minimum of a range is the minimum of the two power-of-two blocks covering it.",
  },
  {
    id: "ds-137",
    title: "Binary Indexed Tree Count Inversions",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count the inversions in a list using a binary indexed tree.\n\nAn inversion is a pair i < j with nums[i] > nums[j] using strict comparison. Compress the values to ranks and use a BIT to track how many values have been seen so far. For each element, every previously seen value with a larger rank is an inversion.\n\nReturn the inversion count.",
    starterCode: `def count_inversions(nums):
    # Your code here
    pass`,
    solution: `def count_inversions(nums):
    if not nums:
        return 0
    ordered = sorted(set(nums))
    rank = {v: i + 1 for i, v in enumerate(ordered)}
    n = len(ordered)
    tree = [0] * (n + 1)

    def add(i):
        while i <= n:
            tree[i] += 1
            i += i & (-i)

    def prefix(i):
        s = 0
        while i > 0:
            s += tree[i]
            i -= i & (-i)
        return s

    inversions = 0
    seen = 0
    for x in nums:
        r = rank[x]
        inversions += seen - prefix(r)
        add(r)
        seen += 1
    return inversions`,
    testCases: [
      { input: [[2, 4, 1, 3, 5]], expected: 3 },
      { input: [[5, 4, 3, 2, 1]], expected: 10 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[1, 1]], expected: 0 },
    ],
    hint: "seen minus the count of values less than or equal to the current rank gives the inversions for that element.",
  },
  {
    id: "ds-138",
    title: "Sqrt Decomposition Block Sum",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Support point updates and range sums with square-root decomposition.\n\nnums is the initial array. queries is a list of [\"update\", i, val] or [\"query\", l, r] (inclusive sum). Elements are grouped into blocks of about sqrt(n), and each block keeps its running sum.\n\nReturn the list of query results.",
    starterCode: `def sqrt_block_sum(nums, queries):
    # Your code here
    pass`,
    solution: `import math


def sqrt_block_sum(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    block = math.isqrt(n) + 1
    blocks = [0] * ((n + block - 1) // block)
    for i, x in enumerate(nums):
        blocks[i // block] += x
    out = []
    for q in queries:
        if q[0] == "update":
            i, val = q[1], q[2]
            blocks[i // block] += val - nums[i]
            nums[i] = val
        else:
            l, r = q[1], q[2]
            bl = l // block
            br = r // block
            if bl == br:
                total = sum(nums[l:r + 1])
            else:
                total = sum(nums[l:(bl + 1) * block]) + sum(nums[br * block:r + 1])
                for b in range(bl + 1, br):
                    total += blocks[b]
            out.append(total)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [["query", 0, 4], ["update", 2, 10], ["query", 1, 3]]], expected: [15, 16] },
      { input: [[5], [["query", 0, 0], ["update", 0, -2], ["query", 0, 0]]], expected: [5, -2] },
      { input: [[], []], expected: [] },
      { input: [[0, 0, 0], [["update", 1, 7], ["query", 0, 2]]], expected: [7] },
      {
        input: [[2, 4, 6, 8], [["query", 1, 2], ["update", 3, 0], ["query", 0, 3], ["query", 2, 3]]],
        expected: [10, 12, 6],
      },
    ],
    hint: "A range sum touches at most two partial blocks plus a run of whole blocks.",
  },
  {
    id: "ds-139",
    title: "Circular Deque Rotation",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate rotations and end queries on a circular deque.\n\nnums is the starting sequence and operations contains \"rotate_left\", \"rotate_right\", \"front\", \"back\", or \"to_list\"; values gives the rotation step count (ignored otherwise). Rotations use k modulo the current length, and front and back return None when the deque is empty.\n\nReturn the list of recorded results.",
    starterCode: `def circular_deque_rotation(nums, operations, values):
    # Your code here
    pass`,
    solution: `def circular_deque_rotation(nums, operations, values):
    items = list(nums)
    out = []
    for op, val in zip(operations, values):
        if op == "rotate_left":
            if items:
                k = val % len(items)
                items = items[k:] + items[:k]
            out.append(None)
        elif op == "rotate_right":
            if items:
                k = val % len(items)
                items = items[-k:] + items[:-k] if k else items
            out.append(None)
        elif op == "front":
            out.append(items[0] if items else None)
        elif op == "back":
            out.append(items[-1] if items else None)
        else:
            out.append(list(items))
    return out`,
    testCases: [
      {
        input: [[1, 2, 3, 4], ["rotate_left", "to_list", "rotate_right", "front"], [1, 0, 2, 0]],
        expected: [null, [2, 3, 4, 1], null, 4],
      },
      {
        input: [[1, 2, 3], ["rotate_left", "rotate_left", "rotate_left", "to_list"], [1, 1, 1, 0]],
        expected: [null, null, null, [1, 2, 3]],
      },
      { input: [[], ["front", "back", "to_list"], [0, 0, 0]], expected: [null, null, []] },
      { input: [[1, 2, 3], ["rotate_right", "to_list"], [4, 0]], expected: [null, [3, 1, 2]] },
    ],
    hint: "Reduce the rotation count modulo the current length first.",
  },
  {
    id: "ds-140",
    title: "Min/Max Queue with Two Deques",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Maintain a queue that reports its minimum and maximum in O(1) amortized time.\n\noperations contains \"push\", \"pop\", \"get_min\", or \"get_max\"; values provides the pushed value. Two monotonic deques track the current minimum and maximum, and pop removes the front element.\n\nReturn the list of recorded results (None for push, the removed value or None for pop, and the current extreme or None for the queries).",
    starterCode: `def min_max_queue(operations, values):
    # Your code here
    pass`,
    solution: `def min_max_queue(operations, values):
    q = []
    mins = []
    maxs = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            q.append(val)
            while mins and mins[-1] > val:
                mins.pop()
            mins.append(val)
            while maxs and maxs[-1] < val:
                maxs.pop()
            maxs.append(val)
            out.append(None)
        elif op == "pop":
            if not q:
                out.append(None)
            else:
                v = q.pop(0)
                if mins and mins[0] == v:
                    mins.pop(0)
                if maxs and maxs[0] == v:
                    maxs.pop(0)
                out.append(v)
        elif op == "get_min":
            out.append(mins[0] if mins else None)
        else:
            out.append(maxs[0] if maxs else None)
    return out`,
    testCases: [
      {
        input: [["push", "push", "push", "get_min", "get_max", "pop", "get_min"], [3, 1, 2, 0, 0, 0, 0]],
        expected: [null, null, null, 1, 3, 3, 1],
      },
      { input: [["pop", "get_min", "get_max"], [0, 0, 0]], expected: [null, null, null] },
      { input: [["push", "get_min", "get_max"], [5, 0, 0]], expected: [null, 5, 5] },
      { input: [["push", "push", "pop", "get_min"], [2, 2, 0, 0]], expected: [null, null, 2, 2] },
    ],
    hint: "Each monotonic deque keeps only the candidates that can still become the extreme.",
  },
  {
    id: "ds-141",
    title: "Sliding Window Median with Two Heaps",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compute the median of every sliding window of size k.\n\nnums is the array. Maintain a max-heap for the lower half of each window and a min-heap for the upper half, removing the element that leaves the window and rebalancing after every change. Odd windows return the middle value and even windows the average of the two middle values, as floats.\n\nReturn one median per window ([] when k is not positive or exceeds the array length).",
    starterCode: `def sliding_window_median(nums, k):
    # Your code here
    pass`,
    solution: `import heapq


def sliding_window_median(nums, k):
    if k <= 0 or k > len(nums):
        return []
    lower = []
    upper = []

    def balance():
        if len(lower) > len(upper) + 1:
            heapq.heappush(upper, -heapq.heappop(lower))
        elif len(upper) > len(lower):
            heapq.heappush(lower, -heapq.heappop(upper))

    def add(v):
        if not lower or v <= -lower[0]:
            heapq.heappush(lower, -v)
        else:
            heapq.heappush(upper, v)
        balance()

    def remove(v):
        if lower and v <= -lower[0]:
            lower.remove(-v)
            heapq.heapify(lower)
        else:
            upper.remove(v)
            heapq.heapify(upper)
        balance()

    def median():
        if k % 2 == 1:
            return float(-lower[0])
        return (-lower[0] + upper[0]) / 2.0

    out = []
    for i in range(k):
        add(nums[i])
    out.append(median())
    for i in range(k, len(nums)):
        remove(nums[i - k])
        add(nums[i])
        out.append(median())
    return out`,
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [1.0, -1.0, -1.0, 3.0, 5.0, 6.0],
      },
      { input: [[1, 2], 1], expected: [1.0, 2.0] },
      { input: [[1, 2, 3, 4], 2], expected: [1.5, 2.5, 3.5] },
      { input: [[], 3], expected: [] },
      { input: [[5], 1], expected: [5.0] },
    ],
    hint: "Keep the lower half at most one element larger than the upper half.",
  },
  {
    id: "ds-142",
    title: "Order Statistics via Sorted List",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Maintain a sorted list supporting k-th smallest and rank queries.\n\noperations contains \"insert\" (values[i] is the value), \"kth\" (values[i] is the 1-based rank), or \"count_less\" (values[i]). insert records None, kth returns the element at that rank or None when out of range, and count_less returns how many stored values are strictly smaller.\n\nReturn the list of recorded results.",
    starterCode: `def sorted_list_ops(operations, values):
    # Your code here
    pass`,
    solution: `import bisect


def sorted_list_ops(operations, values):
    items = []
    out = []
    for op, val in zip(operations, values):
        if op == "insert":
            bisect.insort(items, val)
            out.append(None)
        elif op == "kth":
            out.append(items[val - 1] if 1 <= val <= len(items) else None)
        else:
            out.append(bisect.bisect_left(items, val))
    return out`,
    testCases: [
      {
        input: [
          ["insert", "insert", "insert", "kth", "kth", "count_less"],
          [5, 1, 3, 1, 3, 3],
        ],
        expected: [null, null, null, 1, 5, 1],
      },
      { input: [["kth"], [1]], expected: [null] },
      { input: [["insert", "insert", "count_less"], [2, 2, 2]], expected: [null, null, 0] },
      { input: [["insert", "kth", "insert", "kth"], [10, 1, 5, 2]], expected: [null, 10, null, 10] },
    ],
    hint: "bisect.insort keeps the list ordered, and bisect_left gives the count of smaller elements.",
  },
  {
    id: "ds-143",
    title: "Compressed Trie (Radix) Insert Count",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Count the nodes of a compressed (radix) trie after inserting all words.\n\nInsert the words into a standard trie, then merge every chain of single-child nodes that is not the end of a word. The remaining non-root nodes are exactly the branch points and word endings.\n\nReturn the number of nodes, which also equals the number of edges.",
    starterCode: `def radix_trie_nodes(words):
    # Your code here
    pass`,
    solution: `def radix_trie_nodes(words):
    root = {"end": False, "children": {}}
    for word in words:
        node = root
        for ch in word:
            if ch not in node["children"]:
                node["children"][ch] = {"end": False, "children": {}}
            node = node["children"][ch]
        node["end"] = True
    count = 0
    stack = [root]
    while stack:
        node = stack.pop()
        for child in node["children"].values():
            if child["end"] or len(child["children"]) >= 2:
                count += 1
            stack.append(child)
    return count`,
    testCases: [
      { input: [["apple", "app", "apricot"]], expected: 4 },
      { input: [[]], expected: 0 },
      { input: [["a"]], expected: 1 },
      { input: [["a", "b"]], expected: 2 },
      { input: [["ab", "ac"]], expected: 3 },
    ],
    hint: "A compressed trie keeps only nodes that end a word or have at least two children.",
  },
  {
    id: "ds-144",
    title: "Ternary Search Tree Lite",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a ternary search tree supporting insert and exact search.\n\noperations contains \"insert\" or \"search\" and words provides the argument. Each node holds one character plus left, middle, right, and end-of-word markers; the left and right pointers order characters and the middle pointer advances to the next character.\n\nReturn the list of recorded results (None for insert, a boolean for search).",
    starterCode: `def tst_ops(operations, words):
    # Your code here
    pass`,
    solution: `def tst_ops(operations, words):
    root = [None] * 5

    def insert(node, word, i):
        ch = word[i]
        if node[0] is None:
            node[0] = ch
        if ch < node[0]:
            if node[1] is None:
                node[1] = [None] * 5
            insert(node[1], word, i)
        elif ch > node[0]:
            if node[3] is None:
                node[3] = [None] * 5
            insert(node[3], word, i)
        else:
            if i == len(word) - 1:
                node[4] = True
            else:
                if node[2] is None:
                    node[2] = [None] * 5
                insert(node[2], word, i + 1)

    def search(node, word, i):
        if node is None or node[0] is None:
            return False
        ch = word[i]
        if ch < node[0]:
            return search(node[1], word, i)
        if ch > node[0]:
            return search(node[3], word, i)
        if i == len(word) - 1:
            return node[4] is True
        return search(node[2], word, i + 1)

    out = []
    for op, w in zip(operations, words):
        if op == "insert":
            insert(root, w, 0)
            out.append(None)
        else:
            out.append(search(root, w, 0))
    return out`,
    testCases: [
      { input: [["insert", "search", "search"], ["cat", "cat", "car"]], expected: [null, true, false] },
      {
        input: [["insert", "insert", "search", "search"], ["a", "ab", "a", "ab"]],
        expected: [null, null, true, true],
      },
      { input: [["search"], ["x"]], expected: [false] },
      { input: [["insert", "search", "search"], ["go", "go", "god"]], expected: [null, true, false] },
    ],
    hint: "Characters smaller go left, larger go right, and matching characters descend to the middle.",
  },
  {
    id: "ds-145",
    title: "Count Distinct Substrings with Suffix Array",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Build a suffix array and count distinct substrings without a trie.\n\nSort the starting indices of all suffixes lexicographically and compute the longest common prefix of each adjacent pair. The number of distinct substrings is n(n+1)/2 minus the sum of those LCP lengths, since repeated substrings are exactly the shared prefixes counted once per adjacent pair.\n\nReturn [suffix_array, distinct_substring_count].",
    starterCode: `def suffix_array_distinct(s):
    # Your code here
    pass`,
    solution: `def suffix_array_distinct(s):
    n = len(s)
    sa = sorted(range(n), key=lambda i: s[i:])
    total = 0
    for a, b in zip(sa, sa[1:]):
        i = 0
        while i < min(len(s) - a, len(s) - b) and s[a + i] == s[b + i]:
            i += 1
        total += i
    distinct = n * (n + 1) // 2 - total
    return [sa, distinct]`,
    testCases: [
      { input: ["aba"], expected: [[2, 0, 1], 5] },
      { input: ["aaa"], expected: [[2, 1, 0], 3] },
      { input: [""], expected: [[], 0] },
      { input: ["abc"], expected: [[0, 1, 2], 6] },
      { input: ["abab"], expected: [[2, 0, 3, 1], 7] },
    ],
    hint: "Every adjacent suffix pair contributes its longest common prefix as substrings already counted.",
  },
  {
    id: "ds-146",
    title: "Rolling Hash Structure",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Precompute polynomial hashes so any substring hash can be answered in O(1).\n\ns is the string, base and mod define the polynomial hash with characters weighted by growing powers, and queries is a list of [l, r] pairs (0-based, inclusive). Use prefix hashes and powers of base to extract each substring value.\n\nReturn the list of substring hashes.",
    starterCode: `def rolling_hash_queries(s, base, mod, queries):
    # Your code here
    pass`,
    solution: `def rolling_hash_queries(s, base, mod, queries):
    n = len(s)
    prefix = [0] * (n + 1)
    power = [1] * (n + 1)
    for i, ch in enumerate(s):
        prefix[i + 1] = (prefix[i] * base + ord(ch)) % mod
        power[i + 1] = (power[i] * base) % mod
    out = []
    for l, r in queries:
        out.append((prefix[r + 1] - prefix[l] * power[r - l + 1]) % mod)
    return out`,
    testCases: [
      { input: ["abcd", 31, 1000000007, [[0, 0], [0, 3], [1, 2]]], expected: [97, 2987074, 3137] },
      { input: ["a", 131, 97, [[0, 0]]], expected: [0] },
      { input: ["", 31, 1000000007, []], expected: [] },
      { input: ["hello", 131, 1000000007, [[0, 4], [1, 3]]], expected: [856916412, 1747517] },
    ],
    hint: "Subtract the shifted prefix hash of the previous position, then take the result modulo the field.",
  },
  {
    id: "ds-147",
    title: "Double Hashing Collision Check",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the first pair of strings that collide under two different hash functions.\n\nEach string is hashed with djb2 (start at 5381, then h = (h * 33 + ord(ch)) mod 2**32) and reduced modulo mod1 and mod2. Scan left to right storing the first index for each (mod1, mod2) bucket; a repeated bucket is a double-hash collision.\n\nReturn [i, j] with i < j, or [-1, -1] when no pair collides.",
    starterCode: `def first_collision_pair(keys, mod1, mod2):
    # Your code here
    pass`,
    solution: `def first_collision_pair(keys, mod1, mod2):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    seen = {}
    for i, k in enumerate(keys):
        bucket = (h(k) % mod1, h(k) % mod2)
        if bucket in seen:
            return [seen[bucket], i]
        seen[bucket] = i
    return [-1, -1]`,
    testCases: [
      { input: [["a", "b", "c", "d", "ad"], 3, 5], expected: [0, 4] },
      { input: [["a", "g"], 2, 3], expected: [0, 1] },
      { input: [["a", "b", "ca"], 7, 11], expected: [0, 2] },
      { input: [["x", "y", "z"], 3, 5], expected: [-1, -1] },
      { input: [["b", "c", "d", "a", "ad"], 3, 5], expected: [3, 4] },
    ],
    hint: "One dictionary keyed by the pair of remainders detects matches in a single pass.",
  },
  {
    id: "ds-148",
    title: "Bloom Filter Insert",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate inserting items into a Bloom filter and return the final bit array.\n\nThe filter has num_bits bits and uses num_hashes independent hash functions. Hash number seed is djb2 of the string \"seed:item\" (seed and item joined by a colon) reduced modulo num_bits, and each hash sets one bit. Inserting the same item twice changes nothing.\n\nReturn the bit list after all insertions.",
    starterCode: `def bloom_insert(num_bits, num_hashes, items):
    # Your code here
    pass`,
    solution: `def bloom_insert(num_bits, num_hashes, items):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    bits = [0] * num_bits
    for item in items:
        for seed in range(num_hashes):
            bits[h(str(seed) + ":" + item) % num_bits] = 1
    return bits`,
    testCases: [
      { input: [8, 2, ["a", "b"]], expected: [1, 1, 1, 0, 0, 0, 0, 0] },
      { input: [10, 1, []], expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { input: [1, 3, ["x"]], expected: [1] },
      { input: [8, 2, ["a", "a"]], expected: [1, 1, 0, 0, 0, 0, 0, 0] },
    ],
    hint: "Each of the k hashes sets a single bit, so repeated items set the same bits again.",
  },
  {
    id: "ds-149",
    title: "Bloom Filter Query",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Insert items into a Bloom filter and report membership queries.\n\nThe filter has num_bits bits and num_hashes hash functions using the same djb2 scheme as the insert problem. A query returns True only when every one of its hash bits is set, so false positives are possible but false negatives are not.\n\nReturn the list of query results.",
    starterCode: `def bloom_query(num_bits, num_hashes, items, queries):
    # Your code here
    pass`,
    solution: `def bloom_query(num_bits, num_hashes, items, queries):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    bits = [0] * num_bits
    for item in items:
        for seed in range(num_hashes):
            bits[h(str(seed) + ":" + item) % num_bits] = 1
    out = []
    for q in queries:
        ok = True
        for seed in range(num_hashes):
            if bits[h(str(seed) + ":" + q) % num_bits] == 0:
                ok = False
                break
        out.append(ok)
    return out`,
    testCases: [
      { input: [8, 2, ["a", "b"], ["a", "b", "c"]], expected: [true, true, false] },
      { input: [10, 1, ["x"], ["x", "y"]], expected: [true, false] },
      { input: [16, 3, [], ["z"]], expected: [false] },
      { input: [8, 2, ["ab", "cd"], ["ab", "ac"]], expected: [true, false] },
    ],
    hint: "Any zero bit immediately proves the item was never inserted.",
  },
  {
    id: "ds-150",
    title: "Bloom False Positive Probability",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the theoretical false positive probability of a Bloom filter.\n\nFor m bits, k hash functions, and n inserted items the probability is (1 - (1 - 1/m)^(k*n))^k, assuming uniform independent hashing. A non-positive bit count returns 1.0.\n\nReturn the probability as a float.",
    starterCode: `def bloom_false_positive_probability(num_bits, num_hashes, num_items):
    # Your code here
    pass`,
    solution: `def bloom_false_positive_probability(num_bits, num_hashes, num_items):
    if num_bits <= 0:
        return 1.0
    return (1 - (1 - 1 / num_bits) ** (num_hashes * num_items)) ** num_hashes`,
    testCases: [
      { input: [100, 3, 10], expected: 0.017636834329119114 },
      { input: [10, 1, 5], expected: 0.40950999999999993 },
      { input: [1000, 7, 100], expected: 0.008213554634050255 },
      { input: [10, 1, 0], expected: 0.0 },
      { input: [0, 1, 1], expected: 1.0 },
    ],
    hint: "Each of the k bits is set with probability 1 - (1 - 1/m)^(k*n).",
  },
  {
    id: "ds-151",
    title: "Count-Min Sketch Update",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Update a Count-Min sketch and return the final counter matrix.\n\nwidth is the number of counters per row and depth is the number of rows; seeds gives one hash seed per row. Each item increments the counter djb2(seed:item) mod width in every row, where seed and item are joined by a colon.\n\nReturn the matrix as a list of rows.",
    starterCode: `def cms_update(width, depth, seeds, items):
    # Your code here
    pass`,
    solution: `def cms_update(width, depth, seeds, items):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    matrix = [[0] * width for _ in range(depth)]
    for item in items:
        for r in range(depth):
            matrix[r][h(str(seeds[r]) + ":" + item) % width] += 1
    return matrix`,
    testCases: [
      { input: [4, 2, [1, 2], ["a", "b", "a"]], expected: [[0, 2, 1, 0], [0, 0, 2, 1]] },
      { input: [3, 1, [7], []], expected: [[0, 0, 0]] },
      { input: [5, 2, [10, 20], ["x"]], expected: [[0, 0, 0, 0, 1], [0, 1, 0, 0, 0]] },
      { input: [4, 3, [1, 2, 3], ["ab", "cd"]], expected: [[0, 0, 0, 2], [2, 0, 0, 0], [0, 2, 0, 0]] },
    ],
    hint: "Every item updates exactly one counter per row, chosen by that row's seed.",
  },
  {
    id: "ds-152",
    title: "Count-Min Estimate",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Estimate item frequencies from a Count-Min sketch.\n\nBuild the sketch from items exactly as in the update problem, then for each query return the minimum counter over all rows at djb2(seed:query) mod width. Count-Min estimates never underestimate a true count.\n\nReturn the list of estimates.",
    starterCode: `def cms_estimate(width, depth, seeds, items, queries):
    # Your code here
    pass`,
    solution: `def cms_estimate(width, depth, seeds, items, queries):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    matrix = [[0] * width for _ in range(depth)]
    for item in items:
        for r in range(depth):
            matrix[r][h(str(seeds[r]) + ":" + item) % width] += 1
    out = []
    for q in queries:
        out.append(min(matrix[r][h(str(seeds[r]) + ":" + q) % width] for r in range(depth)))
    return out`,
    testCases: [
      { input: [4, 2, [1, 2], ["a", "b", "a"], ["a", "b", "c"]], expected: [2, 1, 0] },
      { input: [3, 1, [7], [], ["x"]], expected: [0] },
      { input: [5, 2, [10, 20], ["x", "y", "x"], ["x", "z"]], expected: [2, 0] },
      { input: [4, 3, [1, 2, 3], ["ab", "cd", "ab"], ["ab", "cd"]], expected: [3, 3] },
    ],
    hint: "Taking the minimum over rows cancels most of the collision noise.",
  },
  {
    id: "ds-153",
    title: "HyperLogLog Bucket Update",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Update the registers of a HyperLogLog sketch and return the bucket list.\n\nnum_buckets registers each store the maximum rank observed. For each item, hash with djb2; the low bits choose the bucket (hash mod num_buckets) and the rank is the position of the leftmost 1-bit of the remaining value, capped at 32.\n\nReturn the register values.",
    starterCode: `def hll_buckets(num_buckets, items):
    # Your code here
    pass`,
    solution: `def hll_buckets(num_buckets, items):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    buckets = [0] * num_buckets
    for item in items:
        hv = h(item)
        idx = hv % num_buckets
        rest = hv // num_buckets
        rank = 33 - rest.bit_length()
        if rank > 32:
            rank = 32
        if rank > buckets[idx]:
            buckets[idx] = rank
    return buckets`,
    testCases: [
      { input: [4, ["a", "b", "c"]], expected: [17, 0, 17, 17] },
      { input: [8, []], expected: [0, 0, 0, 0, 0, 0, 0, 0] },
      { input: [1, ["x"]], expected: [15] },
      { input: [4, ["a", "a", "b"]], expected: [0, 0, 17, 17] },
    ],
    hint: "A register only ever grows: keep the maximum rank seen for each bucket.",
  },
  {
    id: "ds-154",
    title: "HyperLogLog Estimate Lite",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Estimate cardinality from a HyperLogLog sketch.\n\nBuild the registers as in the update problem, then compute the raw estimate alpha * m^2 / sum(2^-register) with alpha = 0.7213 / (1 + 1.079/m). When the raw estimate is small (at most 2.5m) and some registers are zero, use the linear-counting estimate m * ln(m / zeros) instead.\n\nReturn the estimate as a float.",
    starterCode: `def hll_estimate(num_buckets, items):
    # Your code here
    pass`,
    solution: `import math


def hll_estimate(num_buckets, items):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    buckets = [0] * num_buckets
    for item in items:
        hv = h(item)
        idx = hv % num_buckets
        rest = hv // num_buckets
        rank = 33 - rest.bit_length()
        if rank > 32:
            rank = 32
        if rank > buckets[idx]:
            buckets[idx] = rank
    m = num_buckets
    if m <= 0:
        return 0.0
    alpha = 0.7213 / (1 + 1.079 / m)
    raw = alpha * m * m / sum(2.0 ** (-b) for b in buckets)
    zeros = buckets.count(0)
    if zeros > 0 and raw <= 2.5 * m:
        return m * math.log(m / zeros)
    return raw`,
    testCases: [
      { input: [4, ["a", "b", "c"]], expected: 5.545177444479562 },
      { input: [8, ["a", "b", "c", "d", "e"]], expected: 7.8466340240938095 },
      { input: [16, []], expected: 0.0 },
      { input: [4, ["x", "x", "y"]], expected: 2.772588722239781 },
    ],
    hint: "Linear counting takes over for small cardinalities when zero registers remain.",
  },
  {
    id: "ds-155",
    title: "Reservoir in Stream",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Sample k items uniformly from a stream using reservoir sampling.\n\nProcess the stream in order; the first k items fill the reservoir, and item i (0-based, i >= k) replaces a random slot with probability k/(i+1) using random.Random(seed). The result is deterministic for a given seed.\n\nReturn the reservoir list in slot order.",
    starterCode: `def reservoir_sample(stream, k, seed):
    # Your code here
    pass`,
    solution: `import random


def reservoir_sample(stream, k, seed):
    rng = random.Random(seed)
    reservoir = []
    for i, x in enumerate(stream):
        if i < k:
            reservoir.append(x)
        else:
            j = rng.randrange(i + 1)
            if j < k:
                reservoir[j] = x
    return reservoir`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, 42], expected: [5, 2, 10] },
      { input: [[1, 2], 5, 0], expected: [1, 2] },
      { input: [[], 3, 1], expected: [] },
      { input: [[1, 2, 3, 4], 2, 7], expected: [1, 4] },
    ],
    hint: "Draw randrange(i + 1) for item i and swap it in when the draw falls under k.",
  },
  {
    id: "ds-156",
    title: "Top-K Heavy Hitters Space-Saving Step",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Run the Space-Saving algorithm to find heavy hitters in a stream.\n\nMaintain at most k counters. A tracked item increments its counter; an untracked item fills a free counter when one exists, otherwise it evicts the counter with the smallest count and takes over that count plus one (ties broken by the lexicographically smallest item).\n\nReturn the final counters as [item, count] pairs sorted by count descending then item ascending.",
    starterCode: `def space_saving(stream, k):
    # Your code here
    pass`,
    solution: `def space_saving(stream, k):
    counters = {}
    for item in stream:
        if item in counters:
            counters[item] += 1
        elif len(counters) < k:
            counters[item] = 1
        else:
            victim = min(counters, key=lambda it: (counters[it], it))
            c = counters.pop(victim)
            counters[item] = c + 1
    return [[it, counters[it]] for it in sorted(counters, key=lambda it: (-counters[it], it))]`,
    testCases: [
      { input: [["a", "b", "a", "c", "a", "b"], 2], expected: [["a", 3], ["b", 3]] },
      { input: [["x"], 1], expected: [["x", 1]] },
      { input: [[], 3], expected: [] },
      { input: [["a", "b", "c", "d"], 2], expected: [["c", 2], ["d", 2]] },
    ],
    hint: "The evicting item inherits the victim's count, giving an upper bound on its true frequency.",
  },
  {
    id: "ds-157",
    title: "Misra-Gries Decrement",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Run the Misra-Gries algorithm with k-1 counters.\n\nFor each stream item, increment its counter when present, add a new counter when fewer than k-1 exist, and otherwise decrement every counter by one, dropping any that reach zero. The surviving counters are candidates for items occurring more than n/k times.\n\nReturn the surviving counters as [item, count] pairs sorted by item.",
    starterCode: `def misra_gries(stream, k):
    # Your code here
    pass`,
    solution: `def misra_gries(stream, k):
    counters = {}
    limit = max(0, k - 1)
    for item in stream:
        if item in counters:
            counters[item] += 1
        elif len(counters) < limit:
            counters[item] = 1
        elif limit > 0:
            for key in list(counters):
                counters[key] -= 1
                if counters[key] == 0:
                    del counters[key]
    return [[key, counters[key]] for key in sorted(counters)]`,
    testCases: [
      { input: [["a", "b", "a", "c", "a", "b"], 3], expected: [["a", 2], ["b", 1]] },
      { input: [["x"], 2], expected: [["x", 1]] },
      { input: [[], 3], expected: [] },
      { input: [["a", "b", "c", "d"], 2], expected: [] },
    ],
    hint: "A full table triggers a global decrement instead of a new counter.",
  },
  {
    id: "ds-158",
    title: "Fixed Window Counter",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a fixed-window rate counter.\n\nwindow_size is the window length and operations contains \"hit\" (record a hit at timestamps[i]) or \"count\" (return the hits in the fixed window containing timestamps[i]). The window containing time t spans from (t // window_size) * window_size up to but not including start + window_size.\n\nReturn the list of recorded results (None for hit, an integer for count).",
    starterCode: `def fixed_window_counter(window_size, operations, timestamps):
    # Your code here
    pass`,
    solution: `def fixed_window_counter(window_size, operations, timestamps):
    hits = []
    out = []
    for op, t in zip(operations, timestamps):
        if op == "hit":
            hits.append(t)
            out.append(None)
        else:
            start = (t // window_size) * window_size
            out.append(sum(1 for x in hits if start <= x < start + window_size))
    return out`,
    testCases: [
      {
        input: [10, ["hit", "hit", "hit", "count", "hit", "count"], [1, 2, 11, 12, 11, 12]],
        expected: [null, null, null, 1, null, 2],
      },
      { input: [5, ["count"], [0]], expected: [0] },
      { input: [5, ["hit", "count"], [7, 7]], expected: [null, 1] },
      { input: [5, ["hit", "hit", "count"], [4, 5, 9]], expected: [null, null, 1] },
    ],
    hint: "Integer division by the window size gives the window start.",
  },
  {
    id: "ds-159",
    title: "Sliding Window Counter",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a sliding-window rate counter.\n\nwindow_size is the window length and operations contains \"hit\" (record a hit at timestamps[i]) or \"count\" (return the hits with timestamps in (t - window_size, t]). Unlike a fixed window, the boundary moves with every query.\n\nReturn the list of recorded results (None for hit, an integer for count).",
    starterCode: `def sliding_window_counter(window_size, operations, timestamps):
    # Your code here
    pass`,
    solution: `def sliding_window_counter(window_size, operations, timestamps):
    hits = []
    out = []
    for op, t in zip(operations, timestamps):
        if op == "hit":
            hits.append(t)
            out.append(None)
        else:
            out.append(sum(1 for x in hits if t - window_size < x <= t))
    return out`,
    testCases: [
      {
        input: [10, ["hit", "hit", "hit", "count", "count"], [1, 2, 11, 12, 25]],
        expected: [null, null, null, 1, 0],
      },
      { input: [5, ["hit", "hit", "count"], [1, 6, 6]], expected: [null, null, 1] },
      { input: [5, ["count"], [0]], expected: [0] },
      { input: [3, ["hit", "count"], [4, 4]], expected: [null, 1] },
    ],
    hint: "The window is open on the left and closed on the right: t - window_size < x <= t.",
  },
  {
    id: "ds-160",
    title: "Token Bucket Rate Limiter",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a token-bucket rate limiter.\n\nThe bucket starts full with capacity tokens and refills at refill_rate tokens per time unit, capped at capacity. operations contains \"request\" (consume one token if available, recording True or False) or \"tokens\" (return the whole tokens currently available).\n\nReturn the list of recorded results.",
    starterCode: `def token_bucket(capacity, refill_rate, operations, timestamps):
    # Your code here
    pass`,
    solution: `def token_bucket(capacity, refill_rate, operations, timestamps):
    tokens = float(capacity)
    last = 0
    out = []
    for op, t in zip(operations, timestamps):
        tokens = min(float(capacity), tokens + refill_rate * (t - last))
        last = t
        if op == "request":
            if tokens >= 1:
                tokens -= 1
                out.append(True)
            else:
                out.append(False)
        else:
            out.append(int(tokens))
    return out`,
    testCases: [
      {
        input: [3, 1, ["request", "request", "request", "request", "tokens", "tokens"], [0, 0, 0, 0, 1, 3]],
        expected: [true, true, true, false, 1, 3],
      },
      { input: [2, 1, ["request", "request", "request", "tokens"], [0, 0, 0, 1]], expected: [true, true, false, 1] },
      { input: [1, 0.5, ["tokens"], [0]], expected: [1] },
      { input: [2, 2, ["request", "tokens", "request", "tokens"], [0, 1, 1, 1]], expected: [true, 2, true, 1] },
    ],
    hint: "Refill lazily from the previous event time and cap at capacity.",
  },
  {
    id: "ds-161",
    title: "Leaky Bucket Level",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a leaky bucket that drains at a constant rate.\n\ncapacity is the maximum level, leak_rate is the units drained per time unit, and operations contains \"add\" (values[i] units at times[i]) or \"level\" (current level at times[i]). Between events the level drops by leak_rate times the elapsed time, never below zero, and an add caps the level at capacity.\n\nReturn the list of recorded results (None for add, an integer for level).",
    starterCode: `def leaky_bucket(capacity, leak_rate, operations, values, times):
    # Your code here
    pass`,
    solution: `def leaky_bucket(capacity, leak_rate, operations, values, times):
    level = 0
    last = 0
    out = []
    for op, val, t in zip(operations, values, times):
        level = max(0, level - leak_rate * (t - last))
        last = t
        if op == "add":
            level = min(capacity, level + val)
            out.append(None)
        else:
            out.append(level)
    return out`,
    testCases: [
      {
        input: [10, 2, ["add", "level", "level", "add", "level"], [5, 0, 0, 8, 0], [0, 1, 3, 4, 6]],
        expected: [null, 3, 0, null, 4],
      },
      { input: [10, 2, ["level"], [0], [5]], expected: [0] },
      { input: [5, 1, ["add", "add", "level"], [3, 3, 0], [0, 0, 0]], expected: [null, null, 5] },
      { input: [3, 1, ["add", "level", "level"], [5, 0, 0], [0, 0, 2]], expected: [null, 3, 1] },
    ],
    hint: "Drain before processing each event, then cap any addition at capacity.",
  },
  {
    id: "ds-162",
    title: "Two-Level Page Table Mapping",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Translate a virtual address to a physical address through a two-level page table.\n\nva is the virtual address, offset_bits is the page-offset width, and l2_bits is the number of bits indexing the second-level table. l1_table maps a first-level index to an l2 table index (or -1), and l2_tables holds lists mapping a second-level index to a frame number (or -1).\n\nReturn frame * page_size + offset, or -1 when any entry is missing or invalid.",
    starterCode: `def translate_address(va, offset_bits, l2_bits, l1_table, l2_tables):
    # Your code here
    pass`,
    solution: `def translate_address(va, offset_bits, l2_bits, l1_table, l2_tables):
    offset = va % (2 ** offset_bits)
    l2_index = (va // (2 ** offset_bits)) % (2 ** l2_bits)
    l1_index = va // (2 ** (offset_bits + l2_bits))
    if l1_index >= len(l1_table) or l1_table[l1_index] < 0:
        return -1
    table = l2_tables[l1_table[l1_index]]
    if l2_index >= len(table) or table[l2_index] < 0:
        return -1
    frame = table[l2_index]
    return frame * (2 ** offset_bits) + offset`,
    testCases: [
      { input: [9, 2, 2, [0], [[5, 6, 7, 8]]], expected: 29 },
      { input: [7, 2, 2, [0], [[5, 6, 7, 8]]], expected: 27 },
      { input: [0, 2, 2, [0], [[5, 6, 7, 8]]], expected: 20 },
      { input: [20, 2, 2, [0], [[5, 6, 7, 8]]], expected: -1 },
      { input: [4, 2, 2, [-1], [[5, 6, 7, 8]]], expected: -1 },
    ],
    hint: "Extract the offset first, then the second-level index, then the first-level index.",
  },
  {
    id: "ds-163",
    title: "Buddy Allocator Split",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate buddy allocation on a power-of-two heap.\n\nheap_size is the total size and requests is the list of requested sizes; each request is rounded up to a power of two. Allocate the first free block that fits, repeatedly halving it and returning the right half to the free list until it is exactly the requested size. Blocks are always taken from the left half of a split.\n\nReturn each allocated start index, or -1 when no block fits.",
    starterCode: `def buddy_allocate(heap_size, requests):
    # Your code here
    pass`,
    solution: `def buddy_allocate(heap_size, requests):
    free = [(0, heap_size)]
    out = []
    for req in requests:
        size = 1
        while size < req:
            size *= 2
        chosen = -1
        for i, (start, sz) in enumerate(free):
            if sz >= size:
                chosen = i
                break
        if chosen == -1:
            out.append(-1)
            continue
        start, sz = free.pop(chosen)
        while sz > size:
            sz //= 2
            free.append((start + sz, sz))
        free.sort()
        out.append(start)
    return out`,
    testCases: [
      { input: [8, [1, 2, 3]], expected: [0, 2, 4] },
      { input: [4, [3, 1]], expected: [0, -1] },
      { input: [8, [8, 1]], expected: [0, -1] },
      { input: [4, [2, 2, 2]], expected: [0, 2, -1] },
    ],
    hint: "Halving a block returns its right half to the free list; the left half stays allocatable.",
  },
  {
    id: "ds-164",
    title: "Disk Block Bitmap Allocation",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate disk block allocation with a bitmap and first-fit search.\n\nnum_blocks blocks start free. operations contains \"allocate\" (values[i] is the number of contiguous blocks wanted, first fit, returning the start index or -1), \"free\" (values[i] is [start, count], returning None), or \"bitmap\" (records the current bitmap).\n\nReturn the list of recorded results.",
    starterCode: `def bitmap_allocate(num_blocks, operations, values):
    # Your code here
    pass`,
    solution: `def bitmap_allocate(num_blocks, operations, values):
    bitmap = [0] * num_blocks
    out = []
    for op, val in zip(operations, values):
        if op == "allocate":
            count = val
            start = -1
            run = 0
            for i in range(num_blocks):
                if bitmap[i] == 0:
                    run += 1
                    if run == count:
                        start = i - count + 1
                        break
                else:
                    run = 0
            if start == -1:
                out.append(-1)
            else:
                for i in range(start, start + count):
                    bitmap[i] = 1
                out.append(start)
        elif op == "free":
            start, count = val
            for i in range(start, start + count):
                bitmap[i] = 0
            out.append(None)
        else:
            out.append(list(bitmap))
    return out`,
    testCases: [
      {
        input: [8, ["allocate", "allocate", "free", "allocate", "bitmap"], [3, 4, [0, 3], 3, 0]],
        expected: [0, 3, null, 0, [1, 1, 1, 1, 1, 1, 1, 0]],
      },
      { input: [4, ["allocate", "allocate"], [2, 3]], expected: [0, -1] },
      { input: [4, ["allocate", "free", "allocate"], [4, [1, 2], 3]], expected: [0, null, -1] },
      {
        input: [6, ["allocate", "allocate", "free", "allocate", "bitmap"], [2, 2, [0, 2], 2, 0]],
        expected: [0, 2, null, 0, [1, 1, 1, 1, 0, 0]],
      },
    ],
    hint: "Track the current run of free blocks and reset it at every allocated block.",
  },
  {
    id: "ds-165",
    title: "Inode Block Pointers Capacity",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the maximum file size addressable by an inode.\n\nEach inode has num_direct direct block pointers and block_size is the size of one disk block. The single, double, and triple indirect pointers each index a full block of pointers_per_block addresses. The capacity is block_size * (num_direct + p + p^2 + p^3).\n\nReturn the total number of addressable bytes.",
    starterCode: `def inode_capacity(block_size, num_direct, pointers_per_block):
    # Your code here
    pass`,
    solution: `def inode_capacity(block_size, num_direct, pointers_per_block):
    p = pointers_per_block
    return block_size * (num_direct + p + p * p + p * p * p)`,
    testCases: [
      { input: [1024, 10, 4], expected: 96256 },
      { input: [512, 0, 2], expected: 7168 },
      { input: [4096, 1, 1], expected: 16384 },
      { input: [4096, 12, 1024], expected: 4402345721856 },
    ],
    hint: "Indirect levels multiply: one indirect pointer addresses p blocks, two address p^2, three address p^3.",
  },
  {
    id: "ds-166",
    title: "B-tree Node Split Decision",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Decide whether a B-tree node must split after an insertion.\n\nmax_keys is the maximum number of keys a node may hold, keys is the current sorted key list, and insert_key is the new key. Merge the key into the sorted list; when the merged length exceeds max_keys the node splits and the promoted median sits at index len(merged) // 2.\n\nReturn the promoted index, or -1 when no split is needed.",
    starterCode: `def btree_split_decision(max_keys, keys, insert_key):
    # Your code here
    pass`,
    solution: `def btree_split_decision(max_keys, keys, insert_key):
    merged = sorted(keys + [insert_key])
    if len(merged) <= max_keys:
        return -1
    return len(merged) // 2`,
    testCases: [
      { input: [4, [1, 2, 3, 4], 5], expected: 2 },
      { input: [4, [1, 2, 3], 4], expected: -1 },
      { input: [3, [1, 3], 2], expected: -1 },
      { input: [3, [1, 3, 5], 2], expected: 2 },
      { input: [5, [], 1], expected: -1 },
    ],
    hint: "The median index is the integer division of the merged length by two.",
  },
  {
    id: "ds-167",
    title: "B+ Tree Leaf Order Keys",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate the leaf level of a B+ tree with insert and range queries.\n\noperations contains \"insert\" (values[i] is the key, kept in sorted order with duplicates allowed), \"keys\" (records the whole leaf), or \"range\" (values[i] is [lo, hi], records the keys in that inclusive range).\n\nReturn the list of recorded results.",
    starterCode: `def bplus_leaf_ops(operations, values):
    # Your code here
    pass`,
    solution: `import bisect


def bplus_leaf_ops(operations, values):
    leaf = []
    out = []
    for op, val in zip(operations, values):
        if op == "insert":
            bisect.insort(leaf, val)
            out.append(None)
        elif op == "keys":
            out.append(list(leaf))
        else:
            lo, hi = val
            out.append([x for x in leaf if lo <= x <= hi])
    return out`,
    testCases: [
      { input: [["insert", "insert", "insert", "keys"], [3, 1, 2, 0]], expected: [null, null, null, [1, 2, 3]] },
      {
        input: [["insert", "insert", "range", "range"], [5, 8, [4, 6], [8, 9]]],
        expected: [null, null, [5], [8]],
      },
      { input: [["range"], [[1, 3]]], expected: [[]] },
      {
        input: [["insert", "insert", "insert", "range"], [2, 2, 3, [2, 2]]],
        expected: [null, null, null, [2, 2]],
      },
    ],
    hint: "B+ tree leaves are a sorted list of keys, so range scans are contiguous.",
  },
  {
    id: "ds-168",
    title: "Hash Table Dynamic Resize Rehash Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count how many keys are rehashed when a hash table grows dynamically.\n\nThe table starts with initial_capacity buckets and doubles whenever inserting one more key would push count / capacity past load_factor. Every resize rehashes all currently stored keys. There are insert_count distinct insertions.\n\nReturn the total number of keys rehashed across all resizes.",
    starterCode: `def rehash_count(initial_capacity, load_factor, insert_count):
    # Your code here
    pass`,
    solution: `def rehash_count(initial_capacity, load_factor, insert_count):
    capacity = initial_capacity
    count = 0
    rehashed = 0
    for _ in range(insert_count):
        if count + 1 > capacity * load_factor:
            capacity *= 2
            rehashed += count
        count += 1
    return rehashed`,
    testCases: [
      { input: [4, 0.75, 10], expected: 9 },
      { input: [2, 1.0, 3], expected: 2 },
      { input: [10, 0.5, 5], expected: 0 },
      { input: [1, 0.5, 2], expected: 1 },
    ],
    hint: "Check the load before adding the new key, then resize and rehash the existing count.",
  },
  {
    id: "ds-169",
    title: "Consistent Hashing Add Node Key Move Fraction",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Measure how many keys move when a node joins a consistent hash ring.\n\nNodes and keys are hashed with djb2, and each key belongs to the first node whose hash is greater than or equal to the key hash, wrapping around. Compare ownership before and after adding new_node (an empty node list means every key moves).\n\nReturn the fraction of keys whose owner changed as a float, or 0.0 when there are no keys.",
    starterCode: `def key_move_fraction(nodes, new_node, keys):
    # Your code here
    pass`,
    solution: `def key_move_fraction(nodes, new_node, keys):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    def owner(ring, target):
        for hv, name in ring:
            if hv >= target:
                return name
        return ring[0][1]

    if not keys:
        return 0.0
    before = sorted((h(n), n) for n in nodes)
    after = sorted((h(n), n) for n in nodes + [new_node])
    moved = 0
    for k in keys:
        target = h(k)
        old = owner(before, target) if nodes else None
        new = owner(after, target)
        if old != new:
            moved += 1
    return moved / len(keys)`,
    testCases: [
      { input: [["a", "z"], "m", ["f", "g", "h", "z", "a"]], expected: 0.6 },
      { input: [["a", "z"], "f", ["b", "c", "m", "z"]], expected: 0.5 },
      { input: [["a"], "z", ["a", "z", "m"]], expected: 0.6666666666666666 },
      { input: [["a"], "b", []], expected: 0.0 },
    ],
    hint: "Only keys hashing between the new node and its counter-clockwise neighbor change owner.",
  },
  {
    id: "ds-170",
    title: "LRU with TTL Expiry",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate an LRU cache whose entries expire after a time-to-live.\n\ncapacity is the maximum number of entries and ttl is the maximum idle time: an entry expires when times[i] - last_access >= ttl. operations contains \"put\" (keys[i], values[i]) or \"get\" (keys[i]). Expired entries are purged on every operation, and eviction removes the least recently used entry.\n\nReturn the list of recorded results (None for put, the value or -1 for get).",
    starterCode: `def lru_ttl(capacity, ttl, operations, keys, values, times):
    # Your code here
    pass`,
    solution: `def lru_ttl(capacity, ttl, operations, keys, values, times):
    cache = {}
    stamp = {}
    order = []

    def purge(t):
        expired = [k for k in list(cache) if t - stamp[k] >= ttl]
        for k in expired:
            del cache[k]
            del stamp[k]
            order.remove(k)

    def touch(k):
        if k in order:
            order.remove(k)
        order.append(k)

    out = []
    for op, key, val, t in zip(operations, keys, values, times):
        purge(t)
        if op == "put":
            if key in cache:
                cache[key] = val
                stamp[key] = t
                touch(key)
            else:
                if len(cache) >= capacity:
                    victim = order.pop(0)
                    del cache[victim]
                    del stamp[victim]
                cache[key] = val
                stamp[key] = t
                order.append(key)
            out.append(None)
        else:
            if key in cache:
                stamp[key] = t
                touch(key)
                out.append(cache[key])
            else:
                out.append(-1)
    return out`,
    testCases: [
      {
        input: [
          2,
          5,
          ["put", "put", "get", "get", "get"],
          [1, 2, 1, 1, 1],
          [10, 20, 0, 0, 0],
          [0, 0, 1, 6, 7],
        ],
        expected: [null, null, 10, -1, -1],
      },
      {
        input: [1, 10, ["put", "put", "get", "get"], [1, 2, 1, 2], [10, 20, 0, 0], [0, 0, 1, 1]],
        expected: [null, null, -1, 20],
      },
      {
        input: [
          2,
          100,
          ["put", "get", "put", "get", "get"],
          [1, 1, 3, 1, 3],
          [10, 0, 30, 0, 0],
          [0, 1, 2, 3, 4],
        ],
        expected: [null, 10, null, 10, 30],
      },
      { input: [1, 3, ["put", "get", "get"], [5, 5, 5], [1, 0, 0], [0, 2, 4]], expected: [null, 1, 1] },
    ],
    hint: "A successful get refreshes both the expiry timestamp and the LRU position.",
  },
  {
    id: "ds-171",
    title: "Treap Insert by Priority Seeded",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Insert values into a treap and return the preorder traversal.\n\nvalues and priorities are parallel lists; each value is inserted as in a BST with the given priority, then rotated up while its priority exceeds its parent's (a max-heap on priorities). Duplicate values are ignored.\n\nReturn the preorder list of values (node, then left, then right).",
    starterCode: `def treap_insert(values, priorities):
    # Your code here
    pass`,
    solution: `def treap_insert(values, priorities):
    left = {}
    right = {}
    prio = {}
    root = None

    def rotate_right(node):
        child = left[node]
        left[node] = right[child]
        right[child] = node
        return child

    def rotate_left(node):
        child = right[node]
        right[node] = left[child]
        left[child] = node
        return child

    def insert(node, v, p):
        if node is None:
            left[v] = None
            right[v] = None
            prio[v] = p
            return v
        if v < node:
            left[node] = insert(left[node], v, p)
            if prio[left[node]] > prio[node]:
                node = rotate_right(node)
        elif v > node:
            right[node] = insert(right[node], v, p)
            if prio[right[node]] > prio[node]:
                node = rotate_left(node)
        return node

    for v, p in zip(values, priorities):
        root = insert(root, v, p)
    out = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        out.append(node)
        stack.append(right[node])
        stack.append(left[node])
    return out`,
    testCases: [
      { input: [[5, 3, 8], [1, 2, 3]], expected: [8, 3, 5] },
      { input: [[1, 2, 3], [1, 2, 3]], expected: [3, 2, 1] },
      { input: [[3, 2, 1], [1, 2, 3]], expected: [1, 2, 3] },
      { input: [[10], [5]], expected: [10] },
      { input: [[2, 1, 3], [3, 1, 2]], expected: [2, 1, 3] },
    ],
    hint: "After inserting into a subtree, rotate if the child's priority is now higher than the node's.",
  },
  {
    id: "ds-172",
    title: "Self-Organizing List Move-to-Front",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the total cost of move-to-front accesses on a list.\n\nitems is the initial list order and accesses is the sequence of requested items, all present in items. Each access costs the item's current 1-based position, then the item moves to the front.\n\nReturn the total access cost.",
    starterCode: `def move_to_front_cost(items, accesses):
    # Your code here
    pass`,
    solution: `def move_to_front_cost(items, accesses):
    order = list(items)
    total = 0
    for x in accesses:
        idx = order.index(x)
        total += idx + 1
        order.pop(idx)
        order.insert(0, x)
    return total`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: 6 },
      { input: [[1, 2, 3], [3, 2, 1, 3]], expected: 12 },
      { input: [[1, 2], [2, 2, 2]], expected: 4 },
      { input: [[5], [5]], expected: 1 },
    ],
    hint: "Frequently accessed items migrate to the front, making their later accesses cheaper.",
  },
  {
    id: "ds-173",
    title: "Transpose Heuristic",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the total cost of transpose-heuristic accesses on a list.\n\nitems is the initial list order and accesses is the sequence of requested items, all present in items. Each access costs the item's current 1-based position, and when the item is not first it swaps with the preceding element.\n\nReturn the total access cost.",
    starterCode: `def transpose_cost(items, accesses):
    # Your code here
    pass`,
    solution: `def transpose_cost(items, accesses):
    order = list(items)
    total = 0
    for x in accesses:
        idx = order.index(x)
        total += idx + 1
        if idx > 0:
            order[idx - 1], order[idx] = order[idx], order[idx - 1]
    return total`,
    testCases: [
      { input: [[1, 2, 3], [3, 2, 3]], expected: 9 },
      { input: [[1, 2, 3], [1, 2, 3]], expected: 6 },
      { input: [[1, 2], [2, 2]], expected: 3 },
      { input: [[1, 2, 3, 4], [4, 4, 3, 2]], expected: 15 },
    ],
    hint: "A requested item moves only one step toward the front.",
  },
  {
    id: "ds-174",
    title: "Queue from Two Stacks Amortized Cost Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the element moves when a queue is built from two stacks.\n\noperations contains \"push\", \"pop\", or \"peek\"; values provides pushed values. Elements enter an inbox stack and are transferred to an outbox stack only when an outbox operation finds it empty, and every transferred element counts as one move.\n\nReturn the total number of moves after all operations.",
    starterCode: `def two_stack_queue_moves(operations, values):
    # Your code here
    pass`,
    solution: `def two_stack_queue_moves(operations, values):
    inbox = []
    outbox = []
    moves = 0
    for op, val in zip(operations, values):
        if op == "push":
            inbox.append(val)
        else:
            if not outbox:
                while inbox:
                    outbox.append(inbox.pop())
                    moves += 1
            if op == "pop" and outbox:
                outbox.pop()
    return moves`,
    testCases: [
      { input: [["push", "push", "push", "pop", "pop", "pop"], [1, 2, 3, 0, 0, 0]], expected: 3 },
      { input: [["push", "pop", "push", "pop", "push", "pop"], [1, 0, 2, 0, 3, 0]], expected: 3 },
      { input: [["pop"], [0]], expected: 0 },
      { input: [["push", "peek", "pop"], [7, 0, 0]], expected: 1 },
    ],
    hint: "Each element is transferred from inbox to outbox at most once, giving amortized O(1) operations.",
  },
  {
    id: "ds-175",
    title: "First-Fit Pick",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Pick the first free block that fits a request.\n\nfree_blocks is the list of free block sizes in address order and request is the wanted size. First fit returns the index of the first block whose size is at least the request.\n\nReturn that index, or -1 when no block is large enough.",
    starterCode: `def first_fit_pick(free_blocks, request):
    # Your code here
    pass`,
    solution: `def first_fit_pick(free_blocks, request):
    for i, size in enumerate(free_blocks):
        if size >= request:
            return i
    return -1`,
    testCases: [
      { input: [[5, 2, 8, 3], 4], expected: 0 },
      { input: [[1, 2, 3], 3], expected: 2 },
      { input: [[1, 2], 5], expected: -1 },
      { input: [[], 1], expected: -1 },
    ],
    hint: "Scan from the beginning and stop at the first sufficiently large block.",
  },
];
