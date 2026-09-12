import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-221",
    title: "Bitset Popcount Range",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the set bits inside ranges of a bit list.\n\nbits is a list of 0s and 1s and queries is a list of [l, r] pairs. Each answer is the number of 1-bits at indices l through r inclusive.\n\nReturn the counts in query order.",
    starterCode: `def bitset_popcount_range(bits, queries):
    # Your code here
    pass`,
    solution: `def bitset_popcount_range(bits, queries):
    out = []
    for l, r in queries:
        out.append(sum(bits[l:r + 1]))
    return out`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [[0, 4], [1, 3], [2, 2]]], expected: [3, 2, 1] },
      { input: [[], []], expected: [] },
      { input: [[0, 0, 0], [[0, 2]]], expected: [0] },
      { input: [[1, 1], [[0, 1]]], expected: [2] },
    ],
    hint: "The number of set bits in a range is the sum of the slice.",
  },
  {
    id: "ds-222",
    title: "Bitset Rank Query",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute rank queries on a bitset.\n\nrank(i) is the number of 1-bits at positions 0 through i inclusive. bits is the bit list and queries holds the positions; an index past the end counts the whole array and an empty bitset returns 0.\n\nReturn the rank for each query.",
    starterCode: `def bitset_rank(bits, queries):
    # Your code here
    pass`,
    solution: `def bitset_rank(bits, queries):
    n = len(bits)
    out = []
    for i in queries:
        if n == 0:
            out.append(0)
        else:
            j = min(i, n - 1)
            out.append(sum(bits[:j + 1]))
    return out`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [0, 1, 2, 3, 4]], expected: [1, 1, 2, 3, 3] },
      { input: [[0, 0], [0, 1]], expected: [0, 0] },
      { input: [[], [0]], expected: [0] },
      { input: [[1, 1, 1], [2]], expected: [3] },
    ],
    hint: "Rank is the prefix sum up to the requested position, clamped to the last index.",
  },
  {
    id: "ds-223",
    title: "Bitset Select Query",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the position of the k-th set bit in a bitset.\n\nbits is a list of 0s and 1s and queries holds 1-based ranks. Scan left to right and report the index of the k-th 1-bit.\n\nReturn -1 when the bitset has fewer than k set bits.",
    starterCode: `def bitset_select(bits, queries):
    # Your code here
    pass`,
    solution: `def bitset_select(bits, queries):
    out = []
    for k in queries:
        count = 0
        found = -1
        for i, b in enumerate(bits):
            if b:
                count += 1
                if count == k:
                    found = i
                    break
        out.append(found)
    return out`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], [1, 2, 3, 4]], expected: [0, 2, 3, -1] },
      { input: [[0, 0], [1]], expected: [-1] },
      { input: [[], [1]], expected: [-1] },
      { input: [[1, 1, 1], [3]], expected: [2] },
    ],
    hint: "Select is the inverse of rank: count set bits until the k-th is found.",
  },
  {
    id: "ds-224",
    title: "Bitset Rotate",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Rotate a bitset left or right by k positions.\n\nbits is a list of 0s and 1s, k is the rotation distance, and direction is \"left\" or \"right\". Reduce k modulo the length first; an empty bitset stays empty.\n\nReturn the rotated list.",
    starterCode: `def bitset_rotate(bits, k, direction):
    # Your code here
    pass`,
    solution: `def bitset_rotate(bits, k, direction):
    n = len(bits)
    if n == 0:
        return []
    k = k % n
    if direction == "left":
        return bits[k:] + bits[:k]
    return bits[-k:] + bits[:-k] if k else list(bits)`,
    testCases: [
      { input: [[1, 0, 1, 1, 0], 2, "left"], expected: [1, 1, 0, 1, 0] },
      { input: [[1, 0, 1, 1, 0], 2, "right"], expected: [1, 0, 1, 0, 1] },
      { input: [[], 3, "left"], expected: [] },
      { input: [[1, 1, 1], 5, "right"], expected: [1, 1, 1] },
      { input: [[1, 0], 0, "left"], expected: [1, 0] },
    ],
    hint: "A left rotation by k moves the first k bits to the end; a right rotation does the reverse.",
  },
  {
    id: "ds-225",
    title: "Bitset AND OR XOR Different Sizes",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Apply bitwise operations to two bitsets of different lengths.\n\nShorter bitsets are padded with zeros at the high-index end so the operands align. Compute the AND, OR, and XOR over the padded length.\n\nReturn [and_bits, or_bits, xor_bits].",
    starterCode: `def bitset_logical(a, b):
    # Your code here
    pass`,
    solution: `def bitset_logical(a, b):
    n = max(len(a), len(b))
    pa = list(a) + [0] * (n - len(a))
    pb = list(b) + [0] * (n - len(b))
    return [
        [x & y for x, y in zip(pa, pb)],
        [x | y for x, y in zip(pa, pb)],
        [x ^ y for x, y in zip(pa, pb)],
    ]`,
    testCases: [
      { input: [[1, 0, 1], [1, 1]], expected: [[1, 0, 0], [1, 1, 1], [0, 1, 1]] },
      { input: [[], []], expected: [[], [], []] },
      { input: [[1, 1], [1, 1, 1]], expected: [[1, 1, 0], [1, 1, 1], [0, 0, 1]] },
      { input: [[0], [1]], expected: [[0], [1], [1]] },
    ],
    hint: "Padding with leading zeros is equivalent to treating missing positions as 0.",
  },
  {
    id: "ds-226",
    title: "Bit Array Set Range",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Maintain a bit array with range-set and range-clear operations.\n\nnum_bits is the array length. operations contains [\"set\", l, r], [\"clear\", l, r], or [\"count\"], which records the number of set bits.\n\nReturn the recorded counts.",
    starterCode: `def bit_array_set_range(num_bits, operations):
    # Your code here
    pass`,
    solution: `def bit_array_set_range(num_bits, operations):
    bits = [0] * num_bits
    out = []
    for op in operations:
        if op[0] == "set":
            for i in range(op[1], op[2] + 1):
                bits[i] = 1
        elif op[0] == "clear":
            for i in range(op[1], op[2] + 1):
                bits[i] = 0
        else:
            out.append(sum(bits))
    return out`,
    testCases: [
      { input: [5, [["set", 1, 3], ["count"], ["clear", 2, 4], ["count"]]], expected: [3, 1] },
      { input: [0, [["count"]]], expected: [0] },
      { input: [3, [["set", 0, 2], ["set", 1, 1], ["count"]]], expected: [3] },
      { input: [4, [["clear", 0, 3], ["count"]]], expected: [0] },
    ],
    hint: "Set overwrites clears, so process operations strictly in order.",
  },
  {
    id: "ds-227",
    title: "Bit Array Flip Range",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Maintain a bit array with range-flip operations.\n\nnum_bits is the array length. operations contains [\"flip\", l, r] (toggle every bit in the inclusive range) or [\"count\"] (record the number of set bits).\n\nReturn the recorded counts.",
    starterCode: `def bit_array_flip_range(num_bits, operations):
    # Your code here
    pass`,
    solution: `def bit_array_flip_range(num_bits, operations):
    bits = [0] * num_bits
    out = []
    for op in operations:
        if op[0] == "flip":
            for i in range(op[1], op[2] + 1):
                bits[i] ^= 1
        else:
            out.append(sum(bits))
    return out`,
    testCases: [
      { input: [4, [["flip", 1, 2], ["count"], ["flip", 0, 1], ["count"]]], expected: [2, 2] },
      { input: [0, [["count"]]], expected: [0] },
      { input: [3, [["flip", 0, 2], ["count"]]], expected: [3] },
      { input: [5, [["flip", 0, 4], ["flip", 0, 4], ["count"]]], expected: [0] },
    ],
    hint: "Flipping the same range twice restores the original bits.",
  },
  {
    id: "ds-228",
    title: "Sparse Set Iteration Order",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate the dense array of a sparse set and report its iteration order.\n\noperations contains \"add\" (record None), \"remove\" (record True or False), or \"to_list\" (record the current dense order). Removal swaps the removed value with the last dense element, which is exactly how a sparse set keeps O(1) deletes.\n\nReturn the list of recorded results.",
    starterCode: `def sparse_set_iteration(operations, values):
    # Your code here
    pass`,
    solution: `def sparse_set_iteration(operations, values):
    dense = []
    sparse = {}
    out = []
    for op, val in zip(operations, values):
        if op == "add":
            if val not in sparse:
                sparse[val] = len(dense)
                dense.append(val)
            out.append(None)
        elif op == "remove":
            if val in sparse:
                idx = sparse[val]
                last = dense[-1]
                dense[idx] = last
                sparse[last] = idx
                dense.pop()
                del sparse[val]
                out.append(True)
            else:
                out.append(False)
        else:
            out.append(list(dense))
    return out`,
    testCases: [
      {
        input: [["add", "add", "add", "remove", "to_list"], [1, 2, 3, 2, 0]],
        expected: [null, null, null, true, [1, 3]],
      },
      { input: [["to_list"], [0]], expected: [[]] },
      { input: [["remove", "to_list"], [5, 0]], expected: [false, []] },
      {
        input: [["add", "add", "remove", "add", "to_list"], [1, 2, 1, 1, 0]],
        expected: [null, null, true, null, [2, 1]],
      },
    ],
    hint: "Deleting swaps the removed value with the last dense element to keep the array packed.",
  },
  {
    id: "ds-229",
    title: "Interval Tree Point Query",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Check whether points fall inside any interval.\n\nintervals is a list of [start, end] inclusive intervals and points is the list of query values. A point is covered when it lies within at least one interval.\n\nReturn a list of booleans.",
    starterCode: `def interval_point_query(intervals, points):
    # Your code here
    pass`,
    solution: `def interval_point_query(intervals, points):
    out = []
    for p in points:
        covered = False
        for lo, hi in intervals:
            if lo <= p <= hi:
                covered = True
                break
        out.append(covered)
    return out`,
    testCases: [
      { input: [[[1, 3], [5, 7]], [2, 4, 6]], expected: [true, false, true] },
      { input: [[], [1]], expected: [false] },
      { input: [[[1, 1]], [1, 2]], expected: [true, false] },
      { input: [[[10, 20]], [5, 15, 25]], expected: [false, true, false] },
    ],
    hint: "Intervals are inclusive on both ends.",
  },
  {
    id: "ds-230",
    title: "Interval Tree Overlap Query",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the intervals that overlap a query range.\n\nintervals is a list of [start, end] inclusive intervals and query is [ql, qr]. Two intervals overlap when lo is at most qr and hi is at least ql.\n\nReturn the sorted indices of the overlapping intervals.",
    starterCode: `def interval_overlap_query(intervals, query):
    # Your code here
    pass`,
    solution: `def interval_overlap_query(intervals, query):
    ql, qr = query
    out = []
    for i, (lo, hi) in enumerate(intervals):
        if lo <= qr and hi >= ql:
            out.append(i)
    return out`,
    testCases: [
      { input: [[[1, 3], [5, 7], [6, 10]], [2, 6]], expected: [0, 1, 2] },
      { input: [[[1, 2]], [3, 4]], expected: [] },
      { input: [[], [0, 1]], expected: [] },
      { input: [[[1, 1], [2, 2]], [1, 2]], expected: [0, 1] },
    ],
    hint: "Two inclusive intervals overlap unless one ends before the other starts.",
  },
  {
    id: "ds-231",
    title: "Iterative Segment Tree Ancestor Path",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "List the ancestors of a leaf in an iterative segment tree.\n\nA 2n iterative segment tree stores leaf i at index n + i and each parent at index // 2, with the root at index 1. Return the path of indices starting at the leaf and ending at the root.\n\nReturn the list of ancestor indices.",
    starterCode: `def segtree_ancestor_path(n, i):
    # Your code here
    pass`,
    solution: `def segtree_ancestor_path(n, i):
    path = []
    idx = n + i
    while idx >= 1:
        path.append(idx)
        idx //= 2
    return path`,
    testCases: [
      { input: [4, 0], expected: [4, 2, 1] },
      { input: [4, 3], expected: [7, 3, 1] },
      { input: [1, 0], expected: [1] },
      { input: [8, 5], expected: [13, 6, 3, 1] },
      { input: [8, 7], expected: [15, 7, 3, 1] },
    ],
    hint: "Every parent index is the integer division of its child by two.",
  },
  {
    id: "ds-232",
    title: "Segment Tree Query Node Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count the canonical nodes used by a segment tree range query.\n\nFor n leaves, a query [l, r] decomposes into disjoint nodes whose segments are fully covered. Recurse as a segment tree would: a fully covered node contributes one, a disjoint node contributes zero, and a partial node splits.\n\nReturn the node count for each query.",
    starterCode: `def segtree_query_node_count(n, queries):
    # Your code here
    pass`,
    solution: `def segtree_query_node_count(n, queries):
    def count(lo, hi, l, r):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return 1
        mid = (lo + hi) // 2
        return count(lo, mid, l, r) + count(mid + 1, hi, l, r)

    out = []
    for l, r in queries:
        out.append(count(0, n - 1, l, r) if n > 0 else 0)
    return out`,
    testCases: [
      { input: [8, [[0, 7], [0, 0], [1, 6], [2, 5]]], expected: [1, 1, 4, 2] },
      { input: [1, [[0, 0]]], expected: [1] },
      { input: [0, [[0, 0]]], expected: [0] },
      { input: [5, [[0, 4], [1, 3]]], expected: [1, 3] },
    ],
    hint: "A query decomposes into at most two nodes per level of the tree.",
  },
  {
    id: "ds-233",
    title: "Fenwick Binary Lifting Find Kth",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Find the position of the k-th cumulative frequency using binary lifting on a Fenwick tree.\n\ninitial holds starting frequencies. operations contains [\"update\", i, delta] (add delta at index i) or [\"kth\", k] (smallest 0-based index whose prefix sum is at least k). Walking powers of two from the highest bit locates the answer in O(log n).\n\nReturn the answers, or -1 when the total frequency is less than k.",
    starterCode: `def fenwick_kth_ops(initial, queries):
    # Your code here
    pass`,
    solution: `def fenwick_kth_ops(initial, queries):
    n = len(initial)
    tree = [0] * (n + 1)

    def add(i, delta):
        i += 1
        while i <= n:
            tree[i] += delta
            i += i & (-i)

    for i, v in enumerate(initial):
        add(i, v)

    def find_kth(k):
        pos = 0
        bit = 1 << (n.bit_length())
        while bit > 0:
            nxt = pos + bit
            if nxt <= n and tree[nxt] < k:
                pos = nxt
                k -= tree[nxt]
            bit >>= 1
        return pos if pos < n else -1

    out = []
    for q in queries:
        if q[0] == "update":
            add(q[1], q[2])
        else:
            out.append(find_kth(q[1]))
    return out`,
    testCases: [
      {
        input: [[1, 3, 2, 4], [["kth", 1], ["kth", 4], ["kth", 8], ["update", 1, 5], ["kth", 9]]],
        expected: [0, 1, 3, 1],
      },
      { input: [[1], [["kth", 2]]], expected: [-1] },
      { input: [[0, 0, 1], [["kth", 1]]], expected: [2] },
      { input: [[2, 2], [["kth", 2], ["kth", 3], ["kth", 4], ["kth", 5]]], expected: [0, 1, 1, -1] },
    ],
    hint: "The binary lifting pointer tracks how many elements have been consumed so far.",
  },
  {
    id: "ds-234",
    title: "Fenwick 2D Range Update Point Query",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support rectangle additions and point queries on a 2D grid.\n\ngrid is the initial matrix. operations contains [\"add\", r1, c1, r2, c2, val] (add val to every cell of the inclusive rectangle) or [\"point\", r, c] (current value). A 2D difference array indexed by a 2D Fenwick tree turns each rectangle add into four corner updates.\n\nReturn the list of point queries.",
    starterCode: `def fenwick_2d_range_update(grid, queries):
    # Your code here
    pass`,
    solution: `def fenwick_2d_range_update(grid, queries):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    diff = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            v = grid[r][c]
            if r > 0:
                v -= grid[r - 1][c]
            if c > 0:
                v -= grid[r][c - 1]
            if r > 0 and c > 0:
                v += grid[r - 1][c - 1]
            diff[r][c] = v
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
            if diff[r][c]:
                update(r, c, diff[r][c])
    out = []
    for q in queries:
        if q[0] == "add":
            r1, c1, r2, c2, val = q[1], q[2], q[3], q[4], q[5]
            update(r1, c1, val)
            if c2 + 1 < cols:
                update(r1, c2 + 1, -val)
            if r2 + 1 < rows:
                update(r2 + 1, c1, -val)
            if r2 + 1 < rows and c2 + 1 < cols:
                update(r2 + 1, c2 + 1, val)
        else:
            out.append(prefix(q[1], q[2]))
    return out`,
    testCases: [
      {
        input: [[[1, 2], [3, 4]], [["point", 0, 0], ["add", 0, 0, 1, 1, 5], ["point", 1, 1]]],
        expected: [1, 9],
      },
      {
        input: [[[0, 0], [0, 0]], [["add", 0, 0, 0, 0, 3], ["point", 0, 0], ["point", 1, 1]]],
        expected: [3, 0],
      },
      { input: [[[1]], [["point", 0, 0], ["add", 0, 0, 0, 0, -1], ["point", 0, 0]]], expected: [1, 0] },
      {
        input: [[[1, 2, 3], [4, 5, 6]], [["add", 1, 1, 1, 2, 10], ["point", 0, 1], ["point", 1, 2]]],
        expected: [2, 16],
      },
    ],
    hint: "A rectangle add on a difference array is four point updates at the corners.",
  },
  {
    id: "ds-235",
    title: "Persistent Stack Versions",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate persistent stack versions.\n\nVersion 0 is empty. operations contains [\"push\", version, value], [\"pop\", version], or [\"top\", version]. push and pop create a new version and record its id; top records the top value or None. Earlier versions must never change.\n\nReturn the list of recorded results.",
    starterCode: `def persistent_stack_ops(operations, values):
    # Your code here
    pass`,
    solution: `def persistent_stack_ops(operations, values):
    versions = [[]]
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            ver, v = val
            new = list(versions[ver])
            new.append(v)
            versions.append(new)
            out.append(len(versions) - 1)
        elif op == "pop":
            new = list(versions[val])
            if new:
                new.pop()
            versions.append(new)
            out.append(len(versions) - 1)
        else:
            out.append(versions[val][-1] if versions[val] else None)
    return out`,
    testCases: [
      {
        input: [
          ["push", "push", "top", "pop", "top", "top"],
          [[0, "a"], [1, "b"], 1, 2, 1, 3],
        ],
        expected: [1, 2, "a", 3, "a", "a"],
      },
      { input: [["top"], [0]], expected: [null] },
      { input: [["pop"], [0]], expected: [1] },
      { input: [["push", "top"], [[0, "x"], 1]], expected: [1, "x"] },
    ],
    hint: "Copy the referenced version before mutating it so old versions stay intact.",
  },
  {
    id: "ds-236",
    title: "Persistent Queue via Lists",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate persistent queue versions.\n\nVersion 0 is empty. operations contains [\"enqueue\", version, value], [\"dequeue\", version], or [\"front\", version]. enqueue and dequeue create a new version and record its id; front records the front value or None. Earlier versions must never change.\n\nReturn the list of recorded results.",
    starterCode: `def persistent_queue_ops(operations, values):
    # Your code here
    pass`,
    solution: `def persistent_queue_ops(operations, values):
    versions = [[]]
    out = []
    for op, val in zip(operations, values):
        if op == "enqueue":
            ver, v = val
            new = list(versions[ver])
            new.append(v)
            versions.append(new)
            out.append(len(versions) - 1)
        elif op == "dequeue":
            new = list(versions[val])
            if new:
                new.pop(0)
            versions.append(new)
            out.append(len(versions) - 1)
        else:
            out.append(versions[val][0] if versions[val] else None)
    return out`,
    testCases: [
      {
        input: [
          ["enqueue", "enqueue", "front", "dequeue", "front", "front"],
          [[0, "a"], [1, "b"], 1, 2, 3, 2],
        ],
        expected: [1, 2, "a", 3, "b", "a"],
      },
      { input: [["front"], [0]], expected: [null] },
      { input: [["dequeue"], [0]], expected: [1] },
      { input: [["enqueue", "front"], [[0, 5], 1]], expected: [1, 5] },
    ],
    hint: "The front of the queue is the first element of the copied version list.",
  },
  {
    id: "ds-237",
    title: "Immutable List Prepend",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate an immutable list built by prepending values.\n\nVersion 0 is empty. operations contains [\"prepend\", version, value] (creates a new version and records its id) or [\"head\", version] (records the first value or None). Prepending never mutates the version it builds on.\n\nReturn the list of recorded results.",
    starterCode: `def immutable_prepend(operations, values):
    # Your code here
    pass`,
    solution: `def immutable_prepend(operations, values):
    versions = [[]]
    out = []
    for op, val in zip(operations, values):
        if op == "prepend":
            ver, v = val
            versions.append([v] + versions[ver])
            out.append(len(versions) - 1)
        else:
            out.append(versions[val][0] if versions[val] else None)
    return out`,
    testCases: [
      {
        input: [["prepend", "prepend", "head", "prepend", "head"], [[0, 1], [1, 2], 1, [2, 3], 3]],
        expected: [1, 2, 1, 3, 3],
      },
      { input: [["head"], [0]], expected: [null] },
      {
        input: [["prepend", "prepend", "prepend", "head"], [[0, 1], [1, 2], [2, 3], 3]],
        expected: [1, 2, 3, 3],
      },
      { input: [["prepend", "head"], [[0, 9], 1]], expected: [1, 9] },
    ],
    hint: "Sharing the tail between versions is what makes the list persistent.",
  },
  {
    id: "ds-238",
    title: "Rope Concat",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Concatenate two ropes represented as lists of string chunks.\n\nA rope keeps a string as an ordered list of chunks. Concatenation returns a new rope whose chunks are the first rope's followed by the second's, reusing both inputs.\n\nReturn the concatenated chunk list.",
    starterCode: `def rope_concat(a, b):
    # Your code here
    pass`,
    solution: `def rope_concat(a, b):
    return list(a) + list(b)`,
    testCases: [
      { input: [["ab", "cd"], ["ef"]], expected: ["ab", "cd", "ef"] },
      { input: [[], ["x"]], expected: ["x"] },
      { input: [["x"], []], expected: ["x"] },
      { input: [[], []], expected: [] },
    ],
    hint: "Concatenating ropes is just concatenating their chunk sequences.",
  },
  {
    id: "ds-239",
    title: "Rope Index Query",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the character at a given index in a rope.\n\nchunks is the ordered list of strings. Walk the chunks accumulating lengths until the chunk containing the index is found.\n\nReturn the character, or None when the index is out of range.",
    starterCode: `def rope_index(chunks, i):
    # Your code here
    pass`,
    solution: `def rope_index(chunks, i):
    if i < 0:
        return None
    pos = 0
    for ch in chunks:
        if pos + len(ch) > i:
            return ch[i - pos]
        pos += len(ch)
    return None`,
    testCases: [
      { input: [["ab", "cde"], 3], expected: "d" },
      { input: [["ab"], 2], expected: null },
      { input: [[], 0], expected: null },
      { input: [["a", "b", "c"], 0], expected: "a" },
    ],
    hint: "The offset inside the found chunk is index minus the accumulated length.",
  },
  {
    id: "ds-240",
    title: "Rope Split",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Split a rope at a character index.\n\nchunks is the ordered list of string chunks and k is the split position. Chunks entirely before the split go left, chunks after it go right, and the chunk containing the split is cut into two non-empty pieces. Zero-length pieces are never emitted.\n\nReturn [left_chunks, right_chunks].",
    starterCode: `def rope_split(chunks, k):
    # Your code here
    pass`,
    solution: `def rope_split(chunks, k):
    left = []
    right = []
    pos = 0
    for ch in chunks:
        if pos + len(ch) <= k:
            left.append(ch)
        elif pos >= k:
            right.append(ch)
        else:
            cut = k - pos
            left.append(ch[:cut])
            right.append(ch[cut:])
        pos += len(ch)
    return [left, right]`,
    testCases: [
      { input: [["ab", "cde", "f"], 3], expected: [["ab", "c"], ["de", "f"]] },
      { input: [["abc"], 0], expected: [[], ["abc"]] },
      { input: [["abc"], 3], expected: [["abc"], []] },
      { input: [["ab", "cd"], 4], expected: [["ab", "cd"], []] },
      { input: [["a", "b"], 1], expected: [["a"], ["b"]] },
    ],
    hint: "A split strictly inside a chunk creates a piece on each side.",
  },
  {
    id: "ds-241",
    title: "Gap Buffer Insert",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a gap buffer text editor.\n\ntext is the initial text and operations contains [\"move\", pos] (move the cursor to an absolute position, clamped to both ends), [\"insert\", s] (insert a string at the cursor and leave the cursor after it), or [\"text\"] (record the current string).\n\nReturn the list of recorded texts (None for move and insert).",
    starterCode: `def gap_buffer_ops(text, operations):
    # Your code here
    pass`,
    solution: `def gap_buffer_ops(text, operations):
    left = list(text)
    right = []
    out = []
    for op in operations:
        if op[0] == "move":
            pos = max(0, min(op[1], len(left) + len(right)))
            while len(left) > pos:
                right.append(left.pop())
            while len(left) < pos:
                left.append(right.pop())
            out.append(None)
        elif op[0] == "insert":
            for ch in op[1]:
                left.append(ch)
            out.append(None)
        else:
            out.append("".join(left + right[::-1]))
    return out`,
    testCases: [
      {
        input: ["abc", [["move", 1], ["insert", "XY"], ["text"], ["move", 0], ["insert", "z"], ["text"]]],
        expected: [null, null, "aXYbc", null, null, "zaXYbc"],
      },
      { input: ["", [["insert", "hi"], ["text"]]], expected: [null, "hi"] },
      { input: ["ab", [["move", 5], ["insert", "X"], ["text"]]], expected: [null, null, "abX"] },
      { input: ["ab", [["text"]]], expected: ["ab"] },
    ],
    hint: "The gap sits between the left and right buffers; moving the cursor slides characters across it.",
  },
  {
    id: "ds-242",
    title: "Piece Table Insert",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate the insert side of a piece table text buffer.\n\noriginal is the immutable original text and every inserted string goes to an append-only add buffer. operations contains [\"insert\", pos, text] with 0-based positions. Pieces reference a source (0 original, 1 added), a start, and a length.\n\nReturn the materialized final text.",
    starterCode: `def piece_table_insert(original, operations):
    # Your code here
    pass`,
    solution: `def piece_table_insert(original, operations):
    add = ""
    pieces = [[0, 0, len(original)]] if original else []
    texts = [original, ""]

    for op in operations:
        pos = op[1]
        text = op[2]
        start_add = len(add)
        add = add + text
        texts[1] = add
        new_pieces = []
        remaining = pos
        inserted = False
        for p in pieces:
            plen = p[2]
            if not inserted and remaining <= plen:
                if remaining > 0:
                    new_pieces.append([p[0], p[1], remaining])
                new_pieces.append([1, start_add, len(text)])
                if remaining < plen:
                    new_pieces.append([p[0], p[1] + remaining, plen - remaining])
                inserted = True
            else:
                new_pieces.append(p)
                remaining -= plen
        if not inserted:
            new_pieces.append([1, start_add, len(text)])
        pieces = new_pieces
    out = []
    for src, start, length in pieces:
        out.append(texts[src][start:start + length])
    return "".join(out)`,
    testCases: [
      { input: ["abc", [["insert", 1, "XY"], ["insert", 0, "z"]]], expected: "zaXYbc" },
      { input: ["", [["insert", 0, "hi"]]], expected: "hi" },
      { input: ["abc", [["insert", 3, "!"]]], expected: "abc!" },
      { input: ["abc", [["insert", 1, ""]]], expected: "abc" },
    ],
    hint: "An insert at a piece boundary splits the piece and adds a new added-source piece between the halves.",
  },
  {
    id: "ds-243",
    title: "Piece Table Delete",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate delete operations on a piece table and return the final text.\n\noriginal is the immutable original text and operations contains [\"delete\", pos, count] with 0-based positions; deletions longer than the remaining text are clipped. Each delete splits pieces at its boundaries and drops the covered region.\n\nReturn the materialized text after all operations.",
    starterCode: `def piece_table_delete(original, operations):
    # Your code here
    pass`,
    solution: `def piece_table_delete(original, operations):
    pieces = [[0, len(original)]] if original else []
    for op in operations:
        pos = op[1]
        count = op[2]
        total = sum(p[1] for p in pieces)
        to_remove = min(max(0, count), max(0, total - pos))
        if to_remove == 0:
            continue
        new_pieces = []
        remaining = pos
        for start, length in pieces:
            if to_remove == 0:
                new_pieces.append([start, length])
                continue
            if remaining >= length:
                new_pieces.append([start, length])
                remaining -= length
                continue
            keep_left = remaining
            if keep_left > 0:
                new_pieces.append([start, keep_left])
            removed_here = min(length - keep_left, to_remove)
            to_remove -= removed_here
            remaining = 0
            keep_right = length - keep_left - removed_here
            if keep_right > 0:
                new_pieces.append([start + keep_left + removed_here, keep_right])
        pieces = new_pieces
    return "".join(original[start:start + length] for start, length in pieces)`,
    testCases: [
      { input: ["abcdef", [["delete", 2, 2]]], expected: "abef" },
      { input: ["abcdef", [["delete", 0, 3], ["delete", 0, 1]]], expected: "ef" },
      { input: ["", [["delete", 0, 5]]], expected: "" },
      { input: ["abc", [["delete", 1, 10]]], expected: "a" },
    ],
    hint: "Clipping the delete count against the remaining text prevents out-of-range slices.",
  },
  {
    id: "ds-244",
    title: "Piece Table Materialize",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Materialize text from a piece table.\n\noriginal is the original string, added is the appended buffer, and pieces is a list of [source, start, length] triples where source 0 selects original and 1 selects added.\n\nReturn the concatenated text.",
    starterCode: `def piece_table_materialize(original, added, pieces):
    # Your code here
    pass`,
    solution: `def piece_table_materialize(original, added, pieces):
    sources = [original, added]
    out = []
    for src, start, length in pieces:
        out.append(sources[src][start:start + length])
    return "".join(out)`,
    testCases: [
      { input: ["abc", "XY", [[0, 0, 2], [1, 1, 1], [0, 2, 1]]], expected: "abYc" },
      { input: ["", "", []], expected: "" },
      { input: ["hello", "", [[0, 1, 3]]], expected: "ell" },
      { input: ["a", "bc", [[0, 0, 1], [1, 0, 2], [0, 0, 1]]], expected: "abca" },
    ],
    hint: "Each piece is a slice of one of the two source strings.",
  },
  {
    id: "ds-245",
    title: "Edit Distance Table Cache",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute the Levenshtein edit distance with a dynamic programming table.\n\nInsertions, deletions, and substitutions each cost 1. Fill the table row by row, reusing the previous row so only two rows are kept in memory.\n\nReturn the edit distance between a and b.",
    starterCode: `def edit_distance(a, b):
    # Your code here
    pass`,
    solution: `def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[-1]`,
    testCases: [
      { input: ["kitten", "sitting"], expected: 3 },
      { input: ["", ""], expected: 0 },
      { input: ["abc", ""], expected: 3 },
      { input: ["flaw", "lawn"], expected: 2 },
    ],
    hint: "The three neighboring cells represent substitution, deletion, and insertion.",
  },
  {
    id: "ds-246",
    title: "Memoization Cache LRU Eviction",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an LRU memoization cache for a pure function.\n\ncapacity is the maximum number of cached arguments and calls is the sequence of function arguments. A repeated argument is a hit and refreshes recency; a new argument is a miss and evicts the least recently used entry when the cache is full.\n\nReturn [hits, misses, evictions].",
    starterCode: `def memo_cache(capacity, calls):
    # Your code here
    pass`,
    solution: `def memo_cache(capacity, calls):
    cache = []
    hits = 0
    misses = 0
    evictions = 0
    for arg in calls:
        if arg in cache:
            hits += 1
            cache.remove(arg)
            cache.append(arg)
        else:
            misses += 1
            if len(cache) >= capacity:
                cache.pop(0)
                evictions += 1
            cache.append(arg)
    return [hits, misses, evictions]`,
    testCases: [
      { input: [2, [1, 1, 2, 3, 1]], expected: [1, 4, 2] },
      { input: [1, [5, 5, 5]], expected: [2, 1, 0] },
      { input: [3, []], expected: [0, 0, 0] },
      { input: [2, [1, 2, 1, 2, 1]], expected: [3, 2, 0] },
    ],
    hint: "Keep the cache list ordered from least to most recently used.",
  },
  {
    id: "ds-247",
    title: "Coroutine Scheduler Round Robin",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Schedule coroutines with a round-robin time slice.\n\ntasks is a list of [name, work] and quantum is the maximum work units each task runs per turn. A task that still has work after its slice goes to the back of the queue.\n\nReturn the completion order of task names.",
    starterCode: `def round_robin(tasks, quantum):
    # Your code here
    pass`,
    solution: `def round_robin(tasks, quantum):
    queue = [[name, work] for name, work in tasks]
    order = []
    while queue:
        task = queue.pop(0)
        task[1] -= quantum
        if task[1] <= 0:
            order.append(task[0])
        else:
            queue.append(task)
    return order`,
    testCases: [
      { input: [[["a", 5], ["b", 3]], 2], expected: ["b", "a"] },
      { input: [[["x", 2]], 5], expected: ["x"] },
      { input: [[], 2], expected: [] },
      { input: [[["a", 1], ["b", 1]], 1], expected: ["a", "b"] },
    ],
    hint: "A task completing exactly on its slice boundary still finishes that turn.",
  },
  {
    id: "ds-248",
    title: "Task Priority Queue with Aging",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Schedule tasks by priority with aging to prevent starvation.\n\ntasks is a list of [name, priority, work], where a lower priority number is more urgent. Each tick the runnable task with the smallest effective priority (priority minus aging times its waiting ticks, with ties broken by name) executes one unit; other tasks age by one tick and the executed task's wait resets.\n\nReturn the completion order of task names.",
    starterCode: `def priority_aging(tasks, aging):
    # Your code here
    pass`,
    solution: `def priority_aging(tasks, aging):
    entries = [[name, prio, work, 0] for name, prio, work in tasks]
    order = []
    while entries:
        best = min(entries, key=lambda e: (e[1] - aging * e[3], e[0]))
        best[2] -= 1
        for e in entries:
            if e is not best:
                e[3] += 1
        if best[2] == 0:
            order.append(best[0])
            entries.remove(best)
        else:
            best[3] = 0
    return order`,
    testCases: [
      { input: [[["a", 5, 2], ["b", 1, 2]], 1], expected: ["b", "a"] },
      { input: [[["x", 1, 1], ["y", 1, 3]], 0], expected: ["x", "y"] },
      { input: [[["p", 2, 1], ["q", 3, 1]], 5], expected: ["p", "q"] },
      { input: [[], 1], expected: [] },
    ],
    hint: "Aging lowers the effective priority number of waiting tasks, letting old ones catch up.",
  },
  {
    id: "ds-249",
    title: "Fair Queue Deficit Round Robin",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate deficit round robin scheduling.\n\nquantum is added to each backlogged flow's deficit every round, and a flow may send packets while its deficit covers the head packet's size. packets is a list of [flow, size] in arrival order.\n\nReturn the packet indices in service order.",
    starterCode: `def deficit_round_robin(quantum, packets):
    # Your code here
    pass`,
    solution: `def deficit_round_robin(quantum, packets):
    flows = {}
    for i, (f, size) in enumerate(packets):
        flows.setdefault(f, []).append((i, size))
    flow_order = sorted(flows)
    deficit = {f: 0 for f in flow_order}
    out = []
    for _ in range(1000):
        if not any(flows[f] for f in flow_order):
            break
        progressed = False
        for f in flow_order:
            if not flows[f]:
                continue
            deficit[f] += quantum
            while flows[f] and flows[f][0][1] <= deficit[f]:
                i, size = flows[f].pop(0)
                deficit[f] -= size
                out.append(i)
                progressed = True
        if not progressed:
            break
    return out`,
    testCases: [
      { input: [3, [[0, 2], [1, 4], [0, 5]]], expected: [0, 1, 2] },
      { input: [5, [[0, 7], [1, 2]]], expected: [1, 0] },
      { input: [10, [[0, 1], [0, 1]]], expected: [0, 1] },
      { input: [2, []], expected: [] },
    ],
    hint: "Unused deficit carries over, so a flow that skipped a round can burst later.",
  },
  {
    id: "ds-250",
    title: "Weighted Fair Queue Credits",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compute weighted fair queueing finish times for packets.\n\npackets is a list of [flow, size] in arrival order and weights gives each flow's weight. A packet's virtual start is the later of the current virtual time and its flow's previous finish, and its virtual finish is the start plus size divided by the weight. Order packets by finish time, breaking ties by arrival index.\n\nReturn the packet indices in service order.",
    starterCode: `def wfq_finish_times(packets, weights):
    # Your code here
    pass`,
    solution: `def wfq_finish_times(packets, weights):
    vtime = 0.0
    last_finish = {}
    finishes = []
    for i, (flow, size) in enumerate(packets):
        w = weights[flow]
        start = max(vtime, last_finish.get(flow, 0.0))
        finish = start + size / w
        last_finish[flow] = finish
        finishes.append((finish, i))
    return [i for _, i in sorted(finishes)]`,
    testCases: [
      { input: [[[0, 2], [1, 3], [0, 3]], [1, 1]], expected: [0, 1, 2] },
      { input: [[[0, 4], [1, 2]], [2, 1]], expected: [0, 1] },
      { input: [[[0, 3], [1, 1]], [1, 3]], expected: [1, 0] },
      { input: [[[0, 1], [0, 1], [1, 1]], [1, 1]], expected: [0, 2, 1] },
    ],
    hint: "Each flow's finish times are non-decreasing, so the next packet starts where the previous one ended.",
  },
  {
    id: "ds-251",
    title: "Lock-Free Queue Index Math",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Map a lock-free queue's sequence number to a slot index.\n\nProducers and consumers share a monotonically increasing sequence number while the ring has a fixed capacity. Compute the physical slot and how many times the number has wrapped.\n\nReturn [slot, wrap_count].",
    starterCode: `def queue_slot(sequence, capacity):
    # Your code here
    pass`,
    solution: `def queue_slot(sequence, capacity):
    return [sequence % capacity, sequence // capacity]`,
    testCases: [
      { input: [0, 4], expected: [0, 0] },
      { input: [5, 4], expected: [1, 1] },
      { input: [8, 4], expected: [0, 2] },
      { input: [3, 1], expected: [0, 3] },
    ],
    hint: "Modulo gives the slot and integer division gives the lap count.",
  },
  {
    id: "ds-252",
    title: "MPSC Queue Enqueue Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a bounded MPSC queue with several producers and one consumer.\n\ncapacity is the queue size. operations contains \"enqueue\" (producers[i] is the producer id) or \"dequeue\". Enqueues to a full queue are dropped and dequeues from an empty queue do nothing.\n\nReturn a dictionary with \"enqueued\" (sorted [producer, success_count] pairs), \"dropped\", and \"dequeued\" totals.",
    starterCode: `def mpsc_queue(capacity, operations, producers):
    # Your code here
    pass`,
    solution: `def mpsc_queue(capacity, operations, producers):
    occupancy = 0
    success = {}
    dropped = 0
    dequeued = 0
    for op, prod in zip(operations, producers):
        if op == "enqueue":
            if occupancy < capacity:
                occupancy += 1
                success[prod] = success.get(prod, 0) + 1
            else:
                dropped += 1
        else:
            if occupancy > 0:
                occupancy -= 1
                dequeued += 1
    return {
        "enqueued": [[p, success[p]] for p in sorted(success)],
        "dropped": dropped,
        "dequeued": dequeued,
    }`,
    testCases: [
      {
        input: [2, ["enqueue", "enqueue", "enqueue", "dequeue", "enqueue"], [1, 2, 3, 0, 1]],
        expected: { enqueued: [[1, 2], [2, 1]], dropped: 1, dequeued: 1 },
      },
      {
        input: [1, ["enqueue", "enqueue", "enqueue"], [7, 7, 7]],
        expected: { enqueued: [[7, 1]], dropped: 2, dequeued: 0 },
      },
      { input: [1, ["dequeue"], [0]], expected: { enqueued: [], dropped: 0, dequeued: 0 } },
      {
        input: [3, ["enqueue", "dequeue", "enqueue", "dequeue"], [1, 0, 2, 0]],
        expected: { enqueued: [[1, 1], [2, 1]], dropped: 0, dequeued: 2 },
      },
    ],
    hint: "Only producers with at least one successful enqueue appear in the summary.",
  },
  {
    id: "ds-253",
    title: "Semaphore Permit Acquire",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a counting semaphore with non-blocking acquisitions.\n\npermits is the initial number of permits. operations contains [\"acquire\", n] (records True or False, consuming n permits only on success), [\"release\", n] (records None), or [\"value\"] (records the current permits).\n\nReturn the list of recorded results.",
    starterCode: `def semaphore_ops(permits, operations):
    # Your code here
    pass`,
    solution: `def semaphore_ops(permits, operations):
    available = permits
    out = []
    for op in operations:
        if op[0] == "acquire":
            if available >= op[1]:
                available -= op[1]
                out.append(True)
            else:
                out.append(False)
        elif op[0] == "release":
            available += op[1]
            out.append(None)
        else:
            out.append(available)
    return out`,
    testCases: [
      { input: [2, [["acquire", 1], ["acquire", 2], ["acquire", 1], ["release", 2], ["value"]]], expected: [true, false, true, null, 2] },
      { input: [0, [["acquire", 1], ["value"]]], expected: [false, 0] },
      { input: [1, [["release", 5], ["value"]]], expected: [null, 6] },
      { input: [3, [["value"], ["acquire", 3], ["value"], ["release", 1]]], expected: [3, true, 0, null] },
    ],
    hint: "A failed acquire must not change the permit count.",
  },
  {
    id: "ds-254",
    title: "Mutex Lock Order Deadlock Detection",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Detect the first deadlock in a sequence of mutex operations.\n\nEach operation is [\"lock\", thread, lock] or [\"unlock\", thread, lock]. A request for a mutex held by another thread makes the requester wait; unlocking hands the mutex to the earliest waiting thread. After every request, check the wait-for graph for a cycle.\n\nReturn the 0-based index of the first operation that creates a deadlock, or -1 when none does.",
    starterCode: `def deadlock_detect(operations):
    # Your code here
    pass`,
    solution: `def deadlock_detect(operations):
    held = {}
    waiting = {}

    def cycle():
        for start in list(waiting):
            seen = set()
            cur = start
            while cur is not None:
                if cur in seen:
                    return True
                seen.add(cur)
                lk = waiting.get(cur)
                cur = held.get(lk) if lk is not None else None
        return False

    for i, (op, t, lk) in enumerate(operations):
        if op == "lock":
            if lk in held:
                if held[lk] == t:
                    continue
                waiting[t] = lk
                if cycle():
                    return i
            else:
                held[lk] = t
        else:
            if held.get(lk) == t:
                del held[lk]
                candidates = sorted([w for w, l in waiting.items() if l == lk])
                if candidates:
                    w = candidates[0]
                    del waiting[w]
                    held[lk] = w
    return -1`,
    testCases: [
      { input: [[["lock", "t1", "A"], ["lock", "t2", "B"], ["lock", "t1", "B"], ["lock", "t2", "A"]]], expected: 3 },
      { input: [[["lock", "t1", "A"], ["unlock", "t1", "A"], ["lock", "t2", "A"]]], expected: -1 },
      { input: [[["lock", "t1", "A"], ["lock", "t1", "A"]]], expected: -1 },
      {
        input: [[["lock", "t1", "A"], ["lock", "t2", "B"], ["unlock", "t1", "A"], ["lock", "t2", "A"]]],
        expected: -1,
      },
      { input: [[]], expected: -1 },
    ],
    hint: "A deadlock is exactly a cycle in the wait-for graph.",
  },
  {
    id: "ds-255",
    title: "Snapshot Isolation Version List",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate MVCC visibility over a version list.\n\noperations contains \"insert\", \"update\", \"delete\", or \"read\"; times[i] is the transaction timestamp and values[i] the inserted or updated value. A version is visible to a read at ts when start <= ts < end, and the newest version's end is effectively infinite.\n\nReturn the list of recorded results (None for writes, the visible value or None for reads).",
    starterCode: `def mvcc_ops(operations, times, values):
    # Your code here
    pass`,
    solution: `def mvcc_ops(operations, times, values):
    versions = []
    out = []
    for op, ts, val in zip(operations, times, values):
        if op == "insert":
            versions.append([val, ts, 10 ** 18])
            out.append(None)
        elif op == "update":
            if versions:
                versions[-1][2] = ts
            versions.append([val, ts, 10 ** 18])
            out.append(None)
        elif op == "delete":
            if versions:
                versions[-1][2] = ts
            versions.append([None, ts, 10 ** 18])
            out.append(None)
        else:
            found = None
            for v, start, end in versions:
                if start <= ts < end:
                    found = v
                    break
            out.append(found)
    return out`,
    testCases: [
      {
        input: [
          ["insert", "read", "update", "read", "read"],
          [1, 1, 2, 1, 2],
          ["a", 0, "b", 0, 0],
        ],
        expected: [null, "a", null, "a", "b"],
      },
      {
        input: [["insert", "delete", "read", "read"], [1, 3, 2, 3], ["x", 0, 0, 0]],
        expected: [null, null, "x", null],
      },
      { input: [["read"], [5], [0]], expected: [null] },
      {
        input: [["insert", "update", "read", "read"], [1, 1, 2, 1], ["a", "b", 0, 0]],
        expected: [null, null, "b", "b"],
      },
    ],
    hint: "Writes close the previous version's end timestamp before appending a new one.",
  },
  {
    id: "ds-256",
    title: "Bank Account Invariant Check",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check the never-negative balance invariant on a bank account.\n\nstart_balance is the opening balance. operations contains [\"deposit\", amount], [\"withdraw\", amount], or [\"balance\"]. A withdrawal succeeds only when it keeps the balance non-negative.\n\nReturn the list of recorded results (None for deposit, True or False for withdraw, the balance for balance).",
    starterCode: `def bank_invariant(start_balance, operations):
    # Your code here
    pass`,
    solution: `def bank_invariant(start_balance, operations):
    balance = start_balance
    out = []
    for op in operations:
        if op[0] == "deposit":
            balance += op[1]
            out.append(None)
        elif op[0] == "withdraw":
            if op[1] <= balance:
                balance -= op[1]
                out.append(True)
            else:
                out.append(False)
        else:
            out.append(balance)
    return out`,
    testCases: [
      { input: [100, [["withdraw", 30], ["withdraw", 80], ["balance"], ["deposit", 5]]], expected: [true, false, 70, null] },
      { input: [0, [["withdraw", 1], ["balance"]]], expected: [false, 0] },
      { input: [50, [["balance"]]], expected: [50] },
      { input: [10, [["deposit", 0], ["balance"]]], expected: [null, 10] },
    ],
    hint: "A rejected withdrawal must leave the balance untouched.",
  },
  {
    id: "ds-257",
    title: "Write-Ahead Log Append",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Append records to a write-ahead log with monotonic log sequence numbers.\n\nexisting is the current log of [lsn, key, value] entries. Each record in records is a [key, value] pair appended with the next LSN.\n\nReturn the full log after appending.",
    starterCode: `def wal_append(existing, records):
    # Your code here
    pass`,
    solution: `def wal_append(existing, records):
    log = list(existing)
    for key, val in records:
        log.append([len(log) + 1, key, val])
    return log`,
    testCases: [
      { input: [[], [["a", 1], ["b", 2]]], expected: [[1, "a", 1], [2, "b", 2]] },
      { input: [[[1, "x", 0]], [["y", 5]]], expected: [[1, "x", 0], [2, "y", 5]] },
      { input: [[], []], expected: [] },
      {
        input: [[[1, "a", 1], [2, "b", 2]], [["c", 3]]],
        expected: [[1, "a", 1], [2, "b", 2], [3, "c", 3]],
      },
    ],
    hint: "The LSN is one more than the number of entries already in the log.",
  },
  {
    id: "ds-258",
    title: "LSM Compaction Pick",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate leveled LSM-tree compaction cascades.\n\nlevels holds the number of files per level and capacities gives each level's maximum file count. Repeatedly compact the first level that exceeds its capacity by moving all of its files into the next level, until only the last level may remain over capacity.\n\nReturn [compaction_count, files_moved].",
    starterCode: `def lsm_compactions(levels, capacities):
    # Your code here
    pass`,
    solution: `def lsm_compactions(levels, capacities):
    files = list(levels)
    compactions = 0
    moved = 0
    while True:
        over = -1
        for i in range(len(files) - 1):
            if files[i] > capacities[i]:
                over = i
                break
        if over == -1:
            break
        count = files[over]
        files[over] = 0
        files[over + 1] += count
        compactions += 1
        moved += count
    return [compactions, moved]`,
    testCases: [
      { input: [[4, 0], [3, 4]], expected: [1, 4] },
      { input: [[0, 5], [2, 3]], expected: [0, 0] },
      { input: [[5, 5, 0], [1, 2, 100]], expected: [2, 15] },
      { input: [[0, 0], [1, 1]], expected: [0, 0] },
      { input: [[10, 0], [5, 100]], expected: [1, 10] },
    ],
    hint: "A compaction can push the next level over its own capacity, triggering a cascade.",
  },
  {
    id: "ds-259",
    title: "SSTable Index Lookup",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the data offset for a key using an SSTable sparse index.\n\nindex_keys is the sorted list of index keys and index_offsets holds the matching data offsets. Return the offset of the largest index key less than or equal to the target, because that block may contain the key.\n\nReturn the offset, or -1 when the key sorts before the first index key.",
    starterCode: `def sstable_lookup(index_keys, index_offsets, key):
    # Your code here
    pass`,
    solution: `def sstable_lookup(index_keys, index_offsets, key):
    best = -1
    for i, k in enumerate(index_keys):
        if k <= key:
            best = index_offsets[i]
        else:
            break
    return best`,
    testCases: [
      { input: [[10, 20, 30], [100, 200, 300], 25], expected: 200 },
      { input: [[10, 20], [5, 6], 5], expected: -1 },
      { input: [[], [0], 7], expected: -1 },
      { input: [[5], [7], 9], expected: 7 },
    ],
    hint: "Scanning stops at the first index key greater than the target.",
  },
  {
    id: "ds-260",
    title: "Tombstones Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count deletion markers in an SSTable entry list.\n\nentries is a list of [key, value] pairs where a value of None is a tombstone representing a deletion.\n\nReturn the number of tombstones.",
    starterCode: `def count_tombstones(entries):
    # Your code here
    pass`,
    solution: `def count_tombstones(entries):
    return sum(1 for _, v in entries if v is None)`,
    testCases: [
      { input: [[[1, "a"], [2, null], [3, "b"], [4, null]]], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[[1, null]]], expected: 1 },
      { input: [[[1, "x"]]], expected: 0 },
    ],
    hint: "Tombstones must be counted because they suppress older values during merges.",
  },
  {
    id: "ds-261",
    title: "Memtable Flush Trigger",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count memtable flushes for a size threshold.\n\nthreshold is the flush size in bytes and sizes is the sequence of inserted record sizes. After each insert, flush the memtable when its total is at least the threshold.\n\nReturn [flush_count, remaining_bytes].",
    starterCode: `def memtable_flushes(threshold, sizes):
    # Your code here
    pass`,
    solution: `def memtable_flushes(threshold, sizes):
    total = 0
    flushes = 0
    for size in sizes:
        total += size
        if total >= threshold:
            flushes += 1
            total = 0
    return [flushes, total]`,
    testCases: [
      { input: [10, [4, 4, 4, 4]], expected: [1, 4] },
      { input: [5, [10]], expected: [1, 0] },
      { input: [3, []], expected: [0, 0] },
      { input: [10, [5, 5, 10]], expected: [2, 0] },
    ],
    hint: "The flush check happens after every individual insert.",
  },
  {
    id: "ds-262",
    title: "Dictionary Encoding Build",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Build a dictionary encoding for a column of values.\n\nThe dictionary stores each distinct value once in first-appearance order, and the encoded column holds the dictionary index for every input value.\n\nReturn [dictionary, encoded_values].",
    starterCode: `def dictionary_encode(values):
    # Your code here
    pass`,
    solution: `def dictionary_encode(values):
    dictionary = []
    index = {}
    encoded = []
    for v in values:
        if v not in index:
            index[v] = len(dictionary)
            dictionary.append(v)
        encoded.append(index[v])
    return [dictionary, encoded]`,
    testCases: [
      { input: [["b", "a", "b", "c", "a"]], expected: [["b", "a", "c"], [0, 1, 0, 2, 1]] },
      { input: [[]], expected: [[], []] },
      { input: [[1, 1]], expected: [[1], [0, 0]] },
      { input: [["x", "y", "z"]], expected: [["x", "y", "z"], [0, 1, 2]] },
    ],
    hint: "The dictionary index is simply the number of distinct values seen so far.",
  },
  {
    id: "ds-263",
    title: "Column Statistics Min/Max",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute basic column statistics for a nullable column.\n\nvalues may contain None entries. Return [minimum, maximum, null_count]; when every value is None or the column is empty, the minimum and maximum are None.\n\nReturn the statistics list.",
    starterCode: `def column_stats(values):
    # Your code here
    pass`,
    solution: `def column_stats(values):
    real = [v for v in values if v is not None]
    nulls = len(values) - len(real)
    if not real:
        return [None, None, nulls]
    return [min(real), max(real), nulls]`,
    testCases: [
      { input: [[3, null, 1, 7]], expected: [1, 7, 1] },
      { input: [[]], expected: [null, null, 0] },
      { input: [[null, null]], expected: [null, null, 2] },
      { input: [[-5, 0, -1]], expected: [-5, 0, 0] },
    ],
    hint: "Min and max consider only the non-null values.",
  },
  {
    id: "ds-264",
    title: "B+ Tree Fanout Calc",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute B+ tree node capacities from storage sizes.\n\nblock_size is the node size, key_size is the size of a key, and pointer_size is the size of a pointer. An internal node with m pointers also stores m-1 keys, so fanout is (block_size + key_size) // (key_size + pointer_size); a leaf entry is a key plus a record pointer, so leaf capacity is block_size // (key_size + pointer_size).\n\nReturn [internal_fanout, leaf_capacity].",
    starterCode: `def bplus_fanout(block_size, key_size, pointer_size):
    # Your code here
    pass`,
    solution: `def bplus_fanout(block_size, key_size, pointer_size):
    internal = (block_size + key_size) // (key_size + pointer_size)
    leaf = block_size // (key_size + pointer_size)
    return [internal, leaf]`,
    testCases: [
      { input: [4096, 8, 8], expected: [256, 256] },
      { input: [1024, 4, 4], expected: [128, 128] },
      { input: [512, 8, 4], expected: [43, 42] },
      { input: [64, 4, 4], expected: [8, 8] },
    ],
    hint: "Internal nodes store one more pointer than the keys they hold.",
  },
  {
    id: "ds-265",
    title: "KMP Stream Matcher State",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Match a pattern in a text with the KMP algorithm.\n\nBuild the prefix function for pattern, then scan text left to right without ever moving backwards in the text. Overlapping matches are reported. patterns passed to this problem are non-empty.\n\nReturn [prefix_function, match_start_indices].",
    starterCode: `def kmp_matches(text, pattern):
    # Your code here
    pass`,
    solution: `def kmp_matches(text, pattern):
    pi = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j > 0 and pattern[i] != pattern[j]:
            j = pi[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        pi[i] = j
    matches = []
    j = 0
    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = pi[j - 1]
        if ch == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - len(pattern) + 1)
            j = pi[j - 1]
    return [pi, matches]`,
    testCases: [
      { input: ["ababab", "ab"], expected: [[0, 0], [0, 2, 4]] },
      { input: ["aaaa", "aa"], expected: [[0, 1], [0, 1, 2]] },
      { input: ["abc", "d"], expected: [[0], []] },
      { input: ["", "a"], expected: [[0], []] },
    ],
    hint: "On a mismatch fall back to the longest proper prefix that is also a suffix.",
  },
];
