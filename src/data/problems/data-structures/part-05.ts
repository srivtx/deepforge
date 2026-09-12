import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-176",
    title: "D-ary Heap Parent and Child Indices",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the parent and children indices of a node in a d-ary heap stored as an array.\n\nEvery node has exactly d children. For a zero-based index i the parent is (i - 1) // d (or -1 for the root), the first child is d*i + 1, and the last child is d*i + d.\n\nReturn [parent, first_child, last_child].",
    starterCode: `def dary_heap_indices(d, i):
    # Your code here
    pass`,
    solution: `def dary_heap_indices(d, i):
    parent = (i - 1) // d if i > 0 else -1
    return [parent, d * i + 1, d * i + d]`,
    testCases: [
      { input: [2, 0], expected: [-1, 1, 2] },
      { input: [2, 3], expected: [1, 7, 8] },
      { input: [3, 4], expected: [1, 13, 15] },
      { input: [4, 2], expected: [0, 9, 12] },
    ],
    hint: "The children of i occupy the contiguous block from d*i + 1 through d*i + d.",
  },
  {
    id: "ds-177",
    title: "Pairing Heap Merge Lite",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Merge two pairing heaps in one step.\n\nA pairing heap is represented as a nested list: [root_value, child1, child2, ...] where each child is itself a heap. Merging compares the two roots and makes the larger root the first child of the smaller one; ties keep the first heap as the root. None represents an empty heap.\n\nReturn the merged heap.",
    starterCode: `def pairing_merge(a, b):
    # Your code here
    pass`,
    solution: `def pairing_merge(a, b):
    if a is None:
        return b
    if b is None:
        return a
    if a[0] <= b[0]:
        return [a[0], b] + a[1:]
    return [b[0], a] + b[1:]`,
    testCases: [
      { input: [[1, [3], [4]], [2, [5]]], expected: [1, [2, [5]], [3], [4]] },
      { input: [[5], [3, [1]]], expected: [3, [5], [1]] },
      { input: [null, [1]], expected: [1] },
      { input: [null, null], expected: null },
      { input: [[2], [2]], expected: [2, [2]] },
    ],
    hint: "Only the two roots are compared; the loser becomes the new first child of the winner.",
  },
  {
    id: "ds-178",
    title: "Skew Heap Merge Lite",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Merge two skew heaps and return the resulting binary tree.\n\nA node is [value, left, right] and None is an empty heap. Recursively merge: keep the smaller root, merge its right child with the other heap, then swap the node's children.\n\nReturn the merged tree in node-list form.",
    starterCode: `def skew_merge(a, b):
    # Your code here
    pass`,
    solution: `def skew_merge(a, b):
    if a is None:
        return b
    if b is None:
        return a
    if a[0] > b[0]:
        a, b = b, a
    merged = skew_merge(a[2], b)
    return [a[0], merged, a[1]]`,
    testCases: [
      {
        input: [
          [1, [4, null, null], [5, null, null]],
          [2, [3, null, null], null],
        ],
        expected: [1, [2, [5, null, null], [3, null, null]], [4, null, null]],
      },
      { input: [[5, null, null], [3, null, null]], expected: [3, [5, null, null], null] },
      { input: [null, [1, null, null]], expected: [1, null, null] },
      { input: [[2, null, null], [2, null, null]], expected: [2, [2, null, null], null] },
    ],
    hint: "The unconditional swap keeps the amortized cost logarithmic.",
  },
  {
    id: "ds-179",
    title: "Leftist Heap Merge Rank",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Merge two leftist heaps built from insertion lists and report values with their ranks.\n\nA leftist node is [value, left, right, rank] where rank is the null-path length. Merge keeps the smaller root, merges its right child, then ensures the left child has the larger rank. Values are inserted one at a time by merging singleton nodes.\n\nReturn the preorder traversal as [value, rank] pairs.",
    starterCode: `def leftist_heap_merge(values_a, values_b):
    # Your code here
    pass`,
    solution: `def leftist_heap_merge(values_a, values_b):
    def merge(a, b):
        if a is None:
            return b
        if b is None:
            return a
        if a[0] > b[0]:
            a, b = b, a
        new_right = merge(a[2], b)
        node = [a[0], a[1], new_right, 0]
        if node[1] is None or (node[2] is not None and node[1][3] < node[2][3]):
            node[1], node[2] = node[2], node[1]
        rr = node[2][3] if node[2] is not None else 0
        node[3] = rr + 1
        return node

    def build(values):
        root = None
        for v in values:
            root = merge(root, [v, None, None, 1])
        return root

    root = merge(build(values_a), build(values_b))
    out = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        out.append([node[0], node[3]])
        stack.append(node[2])
        stack.append(node[1])
    return out`,
    testCases: [
      { input: [[3, 5, 2], [4, 1]], expected: [[1, 2], [4, 1], [2, 1], [3, 1], [5, 1]] },
      { input: [[10, 20], [15, 30, 5]], expected: [[5, 2], [15, 1], [30, 1], [10, 1], [20, 1]] },
      { input: [[], []], expected: [] },
      { input: [[7], []], expected: [[7, 1]] },
    ],
    hint: "The rank is one plus the rank of the right child, after swapping to keep it smaller.",
  },
  {
    id: "ds-180",
    title: "Binomial Heap Union Step",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Perform the linking phase of a binomial heap union.\n\nEach heap is a list of [degree, root_value] trees sorted by degree. Combine the two lists, then repeatedly link two trees of equal degree: the smaller root becomes the parent and the new degree increases by one. Continue until every degree appears at most once.\n\nReturn the resulting list of [degree, root_value] sorted by degree.",
    starterCode: `def binomial_union_step(heap_a, heap_b):
    # Your code here
    pass`,
    solution: `def binomial_union_step(heap_a, heap_b):
    trees = sorted(heap_a + heap_b, key=lambda t: t[0])
    changed = True
    while changed:
        changed = False
        i = 0
        while i + 1 < len(trees):
            if trees[i][0] == trees[i + 1][0]:
                d = trees[i][0]
                a, b = trees[i], trees[i + 1]
                root = a if a[1] <= b[1] else b
                trees = trees[:i] + [[d + 1, root[1]]] + trees[i + 2:]
                changed = True
                break
            i += 1
        if changed:
            trees.sort(key=lambda t: t[0])
    return trees`,
    testCases: [
      { input: [[[0, 5]], [[0, 3]]], expected: [[1, 3]] },
      { input: [[[0, 1], [1, 4]], [[0, 2]]], expected: [[2, 1]] },
      { input: [[[1, 5]], []], expected: [[1, 5]] },
      { input: [[[0, 9], [2, 4]], [[0, 3], [2, 7]]], expected: [[1, 3], [3, 4]] },
    ],
    hint: "Linking two degree-d trees always produces one degree-(d+1) tree.",
  },
  {
    id: "ds-181",
    title: "Min-Max Heap Level Logic",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Classify the level of a node in a min-max heap and find its grandparent.\n\nA min-max heap alternates min levels and max levels: even depths (0, 2, 4, ...) are min levels and odd depths are max levels. The grandparent of index i is ((i - 1) // 2 - 1) // 2, or -1 when i is in the top two levels.\n\nReturn [\"min\" or \"max\", grandparent_index].",
    starterCode: `def minmax_level(i):
    # Your code here
    pass`,
    solution: `def minmax_level(i):
    level = (i + 1).bit_length() - 1
    if i >= 3:
        gp = ((i - 1) // 2 - 1) // 2
    else:
        gp = -1
    return ["min" if level % 2 == 0 else "max", gp]`,
    testCases: [
      { input: [0], expected: ["min", -1] },
      { input: [1], expected: ["max", -1] },
      { input: [3], expected: ["min", 0] },
      { input: [8], expected: ["max", 1] },
      { input: [14], expected: ["max", 2] },
    ],
    hint: "The depth of index i in a complete binary tree is floor(log2(i + 1)).",
  },
  {
    id: "ds-182",
    title: "Tournament Tree Winner",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Find the overall winner of a knockout tournament.\n\nresults holds the score of each player, indexed from 0. Players are paired in index order; the higher score advances and a tie goes to the smaller index. Odd players receive a bye. Continue in rounds until one player remains.\n\nReturn the winner's original index, or None for an empty list.",
    starterCode: `def tournament_winner(results):
    # Your code here
    pass`,
    solution: `def tournament_winner(results):
    if not results:
        return None
    current = list(range(len(results)))
    while len(current) > 1:
        nxt = []
        for i in range(0, len(current) - 1, 2):
            a, b = current[i], current[i + 1]
            if results[a] >= results[b]:
                nxt.append(a)
            else:
                nxt.append(b)
        if len(current) % 2 == 1:
            nxt.append(current[-1])
        current = nxt
    return current[0]`,
    testCases: [
      { input: [[3, 1, 4, 2]], expected: 2 },
      { input: [[5, 5, 1, 1]], expected: 0 },
      { input: [[7]], expected: 0 },
      { input: [[]], expected: null },
      { input: [[2, 9, 9, 1]], expected: 1 },
    ],
    hint: "Simulate round by round, letting the last player advance when the round size is odd.",
  },
  {
    id: "ds-183",
    title: "Loser Tree Update",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a loser tree built over a list of scores.\n\nEach match compares two players: the winner advances and the loser is recorded. Ties go to the smaller index. Results are recorded round by round, left to right. Odd players receive a bye.\n\nReturn [winner_index, loser_indices_in_match_order].",
    starterCode: `def loser_tree_lite(scores):
    # Your code here
    pass`,
    solution: `def loser_tree_lite(scores):
    if not scores:
        return [None, []]
    current = list(range(len(scores)))
    losers = []
    while len(current) > 1:
        nxt = []
        for i in range(0, len(current) - 1, 2):
            a, b = current[i], current[i + 1]
            if scores[a] >= scores[b]:
                nxt.append(a)
                losers.append(b)
            else:
                nxt.append(b)
                losers.append(a)
        if len(current) % 2 == 1:
            nxt.append(current[-1])
        current = nxt
    return [current[0], losers]`,
    testCases: [
      { input: [[3, 1, 4, 2]], expected: [2, [1, 3, 0]] },
      { input: [[5, 5, 1, 1]], expected: [0, [1, 3, 2]] },
      { input: [[7]], expected: [0, []] },
      { input: [[2, 9, 9, 1]], expected: [1, [0, 3, 2]] },
    ],
    hint: "A loser tree stores the loser of every match instead of replaying comparisons at query time.",
  },
  {
    id: "ds-184",
    title: "Segment Tree Lazy Assignment",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range assignment and range-sum queries with a lazy segment tree.\n\nnums is the initial array. queries is a list of [\"assign\", l, r, val] (set every element in nums[l..r] to val) or [\"query\", l, r] (inclusive sum). A None in the lazy array means there is no pending assignment for that node.\n\nReturn the list of query results.",
    starterCode: `def lazy_assignment(nums, queries):
    # Your code here
    pass`,
    solution: `def lazy_assignment(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []
    lazy = [None] * (4 * n) if n else []

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
        tree[node] = val * (hi - lo + 1)
        lazy[node] = val

    def push(node, lo, hi):
        if lazy[node] is not None and lo != hi:
            mid = (lo + hi) // 2
            apply(2 * node + 1, lo, mid, lazy[node])
            apply(2 * node + 2, mid + 1, hi, lazy[node])
            lazy[node] = None

    def assign(node, lo, hi, l, r, val):
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            apply(node, lo, hi, val)
            return
        push(node, lo, hi)
        mid = (lo + hi) // 2
        assign(2 * node + 1, lo, mid, l, r, val)
        assign(2 * node + 2, mid + 1, hi, l, r, val)
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
            assign(0, 0, n - 1, q[1], q[2], q[3])
    return out`,
    testCases: [
      {
        input: [[1, 2, 3, 4], [["assign", 0, 1, 5], ["query", 0, 3], ["assign", 2, 3, 0], ["query", 0, 3]]],
        expected: [17, 10],
      },
      { input: [[5], [["query", 0, 0], ["assign", 0, 0, 2], ["query", 0, 0]]], expected: [5, 2] },
      { input: [[0, 0, 0], [["assign", 1, 2, 7], ["query", 0, 2]]], expected: [14] },
      {
        input: [[1, 2, 3, 4], [["assign", 0, 3, 9], ["assign", 1, 2, 1], ["query", 0, 0], ["query", 1, 2]]],
        expected: [9, 2],
      },
      { input: [[], []], expected: [] },
    ],
    hint: "An assignment overwrites any older pending assignment, so one lazy value per node suffices.",
  },
  {
    id: "ds-185",
    title: "Segment Tree Merge Sort Tree Count",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Count values less than or equal to x inside a range using a merge sort tree.\n\nnums is the array. queries is a list of [\"count\", l, r, x] and each answer is how many elements in the inclusive range are at most x. Every tree node stores its segment sorted, and a query binary-searches each fully covered node.\n\nReturn the list of counts.",
    starterCode: `def merge_sort_tree_count(nums, queries):
    # Your code here
    pass`,
    solution: `import bisect


def merge_sort_tree_count(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    tree = [None] * (4 * n)

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = [nums[lo]]
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        left = tree[2 * node + 1]
        right = tree[2 * node + 2]
        merged = []
        i = 0
        j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        tree[node] = merged

    build(0, 0, n - 1)

    def count(node, lo, hi, l, r, x):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return bisect.bisect_right(tree[node], x)
        mid = (lo + hi) // 2
        return count(2 * node + 1, lo, mid, l, r, x) + count(2 * node + 2, mid + 1, hi, l, r, x)

    out = []
    for q in queries:
        out.append(count(0, 0, n - 1, q[1], q[2], q[3]))
    return out`,
    testCases: [
      { input: [[5, 2, 6, 1], [["count", 0, 3, 4]]], expected: [2] },
      { input: [[1, 3, 5, 7], [["count", 1, 2, 6], ["count", 0, 0, 0]]], expected: [2, 0] },
      { input: [[2, 2, 2], [["count", 0, 2, 2]]], expected: [3] },
      { input: [[], []], expected: [] },
      { input: [[4], [["count", 0, 0, 5]]], expected: [1] },
    ],
    hint: "bisect_right on the sorted node lists counts values at most x.",
  },
  {
    id: "ds-186",
    title: "Persistent Segment Tree Version Copy Lite",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a persistent array where each point update creates a new version.\n\nVersion 0 is the initial array. operations is a list of [\"set\", version, index, value] or [\"get\", version, index]. A set copies the given version, changes one index, appends the new version, and records its version id; a get returns the value in that version.\n\nReturn the list of recorded results.",
    starterCode: `def persistent_point_set(initial, operations):
    # Your code here
    pass`,
    solution: `def persistent_point_set(initial, operations):
    versions = [list(initial)]
    out = []
    for op in operations:
        if op[0] == "get":
            _, ver, idx = op
            out.append(versions[ver][idx])
        else:
            _, ver, idx, val = op
            new = list(versions[ver])
            new[idx] = val
            versions.append(new)
            out.append(len(versions) - 1)
    return out`,
    testCases: [
      {
        input: [
          [1, 2, 3],
          [["set", 0, 1, 9], ["get", 0, 1], ["get", 1, 1], ["set", 1, 2, 7], ["get", 2, 2], ["get", 0, 2]],
        ],
        expected: [1, 2, 9, 2, 7, 3],
      },
      { input: [[5], [["get", 0, 0], ["set", 0, 0, 1], ["get", 1, 0]]], expected: [5, 1, 1] },
      {
        input: [[1, 2], [["set", 0, 0, 9], ["set", 0, 1, 8], ["get", 1, 0], ["get", 2, 1], ["get", 0, 0]]],
        expected: [1, 2, 9, 8, 1],
      },
      { input: [[], []], expected: [] },
    ],
    hint: "Each set creates a new version id equal to its position in the version list.",
  },
  {
    id: "ds-187",
    title: "Offline Distinct Range Queries (Sort by Right)",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count the distinct values in each inclusive range using offline queries and a Fenwick tree.\n\nnums is the array and queries is a list of [l, r] pairs. Sort queries by right endpoint; sweep the array keeping only the most recent occurrence of each value in the BIT, so the range sum equals the number of distinct values. Answers are returned in the original query order.\n\nReturn the list of distinct counts.",
    starterCode: `def distinct_range_queries(nums, queries):
    # Your code here
    pass`,
    solution: `def distinct_range_queries(nums, queries):
    n = len(nums)
    bit = [0] * (n + 1)

    def update(i, delta):
        i += 1
        while i <= n:
            bit[i] += delta
            i += i & (-i)

    def prefix(i):
        i += 1
        s = 0
        while i > 0:
            s += bit[i]
            i -= i & (-i)
        return s

    order = sorted(range(len(queries)), key=lambda i: queries[i][1])
    last = {}
    ans = [0] * len(queries)
    idx = 0
    for qi in order:
        l, r = queries[qi]
        while idx <= r:
            x = nums[idx]
            if x in last:
                update(last[x], -1)
            update(idx, 1)
            last[x] = idx
            idx += 1
        ans[qi] = prefix(r) - prefix(l - 1)
    return ans`,
    testCases: [
      { input: [[1, 2, 1, 3], [[0, 2], [1, 3], [0, 3]]], expected: [2, 3, 3] },
      { input: [[1, 1, 1], [[0, 2]]], expected: [1] },
      { input: [[], []], expected: [] },
      { input: [[5, 5, 6], [[0, 1], [1, 2]]], expected: [1, 2] },
    ],
    hint: "Moving a value's 1 to its latest position makes a range sum count each value once.",
  },
  {
    id: "ds-188",
    title: "Fenwick Tree Range XOR",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Support point updates and range XOR queries with a Fenwick tree.\n\nnums is the initial array. queries is a list of [\"update\", i, val] (set nums[i] = val) or [\"query\", l, r] (XOR of nums[l..r] inclusive). XOR is its own inverse, so the binary indexed tree simply replaces addition with the xor operator.\n\nReturn the list of query results.",
    starterCode: `def xor_range_queries(nums, queries):
    # Your code here
    pass`,
    solution: `def xor_range_queries(nums, queries):
    n = len(nums)
    bit = [0] * (n + 1)

    def add(i, val):
        i += 1
        while i <= n:
            bit[i] ^= val
            i += i & (-i)

    def prefix(i):
        i += 1
        s = 0
        while i > 0:
            s ^= bit[i]
            i -= i & (-i)
        return s

    for i, x in enumerate(nums):
        add(i, x)
    out = []
    for q in queries:
        if q[0] == "update":
            i, val = q[1], q[2]
            add(i, nums[i] ^ val)
            nums[i] = val
        else:
            out.append(prefix(q[2]) ^ prefix(q[1] - 1))
    return out`,
    testCases: [
      { input: [[1, 2, 3], [["query", 0, 2], ["update", 1, 0], ["query", 0, 2]]], expected: [0, 2] },
      { input: [[5], [["query", 0, 0]]], expected: [5] },
      { input: [[0, 0, 0], [["update", 1, 7], ["query", 0, 2], ["query", 1, 1]]], expected: [7, 7] },
      { input: [[1, 1], [["query", 0, 1]]], expected: [0] },
    ],
    hint: "A range XOR is prefix(r) xor prefix(l - 1), just like a range sum with subtraction replaced.",
  },
  {
    id: "ds-189",
    title: "Fenwick for Range Max with Limitations",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Support prefix maximum queries when values only increase, using a Fenwick tree.\n\nnums is the initial array. queries is a list of [\"increase\", i, val] (set nums[i] to the larger of its current value and val) or [\"max\", r] (maximum of nums[0..r]). A max Fenwick tree cannot support arbitrary decreases, which is why updates are restricted to increases.\n\nReturn the list of prefix maxima.",
    starterCode: `def prefix_max_queries(nums, queries):
    # Your code here
    pass`,
    solution: `def prefix_max_queries(nums, queries):
    n = len(nums)
    tree = [0] * (n + 1)

    def update(i, val):
        i += 1
        while i <= n:
            if val > tree[i]:
                tree[i] = val
            i += i & (-i)

    def query(i):
        i += 1
        best = None
        while i > 0:
            if best is None or tree[i] > best:
                best = tree[i]
            i -= i & (-i)
        return best

    for i, x in enumerate(nums):
        update(i, x)
    out = []
    for q in queries:
        if q[0] == "max":
            out.append(query(q[1]))
        else:
            update(q[1], q[2])
    return out`,
    testCases: [
      { input: [[1, 3, 2], [["max", 2], ["increase", 0, 5], ["max", 2], ["max", 0]]], expected: [3, 5, 5] },
      { input: [[0], [["max", 0], ["increase", 0, 4], ["max", 0]]], expected: [0, 4] },
      { input: [[1, 2, 3], [["increase", 1, 0], ["max", 2]]], expected: [3] },
      { input: [[5, 1], [["max", 1], ["increase", 0, 2], ["max", 1]]], expected: [5, 5] },
    ],
    hint: "Decreasing a value cannot be undone in a prefix-max BIT, so only increases are allowed.",
  },
  {
    id: "ds-190",
    title: "Double-Ended Priority Queue",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a double-ended priority queue supporting both minimum and maximum operations.\n\noperations contains \"insert\" (values[i] is the value), \"pop_min\", \"pop_max\", \"peek_min\", or \"peek_max\". Pops return the removed extreme or None when empty, and peeks return the current extreme or None.\n\nReturn the list of recorded results (None for insert).",
    starterCode: `def depq_ops(operations, values):
    # Your code here
    pass`,
    solution: `def depq_ops(operations, values):
    items = []
    out = []
    for op, val in zip(operations, values):
        if op == "insert":
            items.append(val)
            items.sort()
            out.append(None)
        elif op == "pop_min":
            out.append(items.pop(0) if items else None)
        elif op == "pop_max":
            out.append(items.pop() if items else None)
        elif op == "peek_min":
            out.append(items[0] if items else None)
        else:
            out.append(items[-1] if items else None)
    return out`,
    testCases: [
      {
        input: [["insert", "insert", "insert", "peek_min", "peek_max", "pop_min", "pop_max"], [5, 1, 3, 0, 0, 0, 0]],
        expected: [null, null, null, 1, 5, 1, 5],
      },
      { input: [["pop_min", "pop_max", "peek_min"], [0, 0, 0]], expected: [null, null, null] },
      { input: [["insert", "peek_min", "peek_max"], [7, 0, 0]], expected: [null, 7, 7] },
      {
        input: [["insert", "insert", "pop_min", "pop_min", "pop_min"], [2, 2, 0, 0, 0]],
        expected: [null, null, 2, 2, null],
      },
    ],
    hint: "A sorted list gives O(1) access to both extremes.",
  },
  {
    id: "ds-191",
    title: "Indexed Priority Queue Decrease-Key",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an indexed priority queue with a decrease-key operation.\n\noperations contains \"insert\" (ids[i] with priority values[i]), \"decrease\" (lower the priority of ids[i] to values[i]), \"pop_min\" (return the id with the smallest priority or None), or \"get\" (return the priority of ids[i] or None). A position map keeps every id's index in the heap so decrease-key can sift up directly.\n\nReturn the list of recorded results (None for insert and decrease).",
    starterCode: `def indexed_pq_ops(operations, ids, values):
    # Your code here
    pass`,
    solution: `def indexed_pq_ops(operations, ids, values):
    heap = []
    pos = {}
    val = {}

    def sift_up(i):
        while i > 0:
            p = (i - 1) // 2
            if val[heap[i]] < val[heap[p]]:
                heap[i], heap[p] = heap[p], heap[i]
                pos[heap[i]] = i
                pos[heap[p]] = p
                i = p
            else:
                break

    def sift_down(i):
        n = len(heap)
        while True:
            left = 2 * i + 1
            right = 2 * i + 2
            small = i
            if left < n and val[heap[left]] < val[heap[small]]:
                small = left
            if right < n and val[heap[right]] < val[heap[small]]:
                small = right
            if small == i:
                break
            heap[i], heap[small] = heap[small], heap[i]
            pos[heap[i]] = i
            pos[heap[small]] = small
            i = small

    out = []
    for op, i, v in zip(operations, ids, values):
        if op == "insert":
            if i in pos:
                out.append(None)
                continue
            heap.append(i)
            pos[i] = len(heap) - 1
            val[i] = v
            sift_up(len(heap) - 1)
            out.append(None)
        elif op == "decrease":
            if i not in pos:
                out.append(None)
            else:
                val[i] = v
                sift_up(pos[i])
                out.append(None)
        elif op == "pop_min":
            if not heap:
                out.append(None)
            else:
                top = heap[0]
                last = heap.pop()
                del pos[top]
                del val[top]
                if heap:
                    heap[0] = last
                    pos[last] = 0
                    sift_down(0)
                out.append(top)
        else:
            out.append(val[i] if i in val else None)
    return out`,
    testCases: [
      {
        input: [
          ["insert", "insert", "insert", "pop_min", "decrease", "pop_min", "pop_min"],
          [1, 2, 3, 0, 1, 0, 0],
          [5, 3, 4, 0, 1, 0, 0],
        ],
        expected: [null, null, null, 2, null, 1, 3],
      },
      { input: [["pop_min"], [0], [0]], expected: [null] },
      { input: [["insert", "get", "decrease", "get"], [7, 7, 7, 7], [9, 0, 2, 0]], expected: [null, 9, null, 2] },
      {
        input: [["insert", "insert", "decrease", "pop_min"], [1, 2, 1, 0], [10, 20, 5, 0]],
        expected: [null, null, null, 1],
      },
    ],
    hint: "The position map turns decrease-key into a sift-up from a known index.",
  },
  {
    id: "ds-192",
    title: "Sliding Window Aggregation Struct",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Maintain a sliding window that answers sum and distinct-count queries.\n\noperations contains \"push\" (append values[i]), \"pop\" (remove the oldest element), \"sum\" (record the total), or \"distinct\" (record the number of distinct values). Keep a dictionary of value counts alongside the running total.\n\nReturn the list of recorded results (None for push and pop).",
    starterCode: `def window_aggregates(operations, values):
    # Your code here
    pass`,
    solution: `def window_aggregates(operations, values):
    window = []
    counts = {}
    total = 0
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            window.append(val)
            counts[val] = counts.get(val, 0) + 1
            total += val
            out.append(None)
        elif op == "pop":
            v = window.pop(0)
            counts[v] -= 1
            if counts[v] == 0:
                del counts[v]
            total -= v
            out.append(None)
        elif op == "sum":
            out.append(total)
        else:
            out.append(len(counts))
    return out`,
    testCases: [
      {
        input: [["push", "push", "push", "sum", "distinct", "pop", "sum", "distinct"], [2, 2, 3, 0, 0, 0, 0, 0]],
        expected: [null, null, null, 7, 2, null, 5, 2],
      },
      { input: [["sum", "distinct"], [0, 0]], expected: [0, 0] },
      { input: [["push", "pop", "sum"], [5, 0, 0]], expected: [null, null, 0] },
      { input: [["push", "push", "pop", "distinct"], [1, 2, 0, 0]], expected: [null, null, null, 1] },
    ],
    hint: "Deleting a dictionary entry when its count hits zero keeps the distinct count exact.",
  },
  {
    id: "ds-193",
    title: "Deque with Max Maintenance",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a deque that also reports its maximum element.\n\noperations contains \"push_front\", \"push_back\", \"pop_front\", \"pop_back\", or \"get_max\"; values provides pushed values. Pops return the removed value or None when empty, and get_max returns the current maximum or None.\n\nReturn the list of recorded results (None for pushes).",
    starterCode: `def deque_max_ops(operations, values):
    # Your code here
    pass`,
    solution: `def deque_max_ops(operations, values):
    dq = []
    out = []
    for op, val in zip(operations, values):
        if op == "push_back":
            dq.append(val)
            out.append(None)
        elif op == "push_front":
            dq.insert(0, val)
            out.append(None)
        elif op == "pop_back":
            out.append(dq.pop() if dq else None)
        elif op == "pop_front":
            out.append(dq.pop(0) if dq else None)
        else:
            out.append(max(dq) if dq else None)
    return out`,
    testCases: [
      { input: [["push_back", "push_front", "get_max", "pop_back", "get_max"], [3, 5, 0, 0, 0]], expected: [null, null, 5, 3, 5] },
      { input: [["get_max", "pop_front"], [0, 0]], expected: [null, null] },
      { input: [["push_back", "push_back", "pop_front", "get_max"], [1, 9, 0, 0]], expected: [null, null, 1, 9] },
      { input: [["push_front", "get_max"], [7, 0]], expected: [null, 7] },
    ],
    hint: "Remember that push_front and push_back place values at opposite ends.",
  },
  {
    id: "ds-194",
    title: "Hash Map with Doubly Linked List Ordering",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an ordered map that keeps keys in least-recently-used order with a doubly linked list on top of a hash map.\n\ncapacity is the maximum number of keys. operations contains \"set\" (keys[i], values[i], evicting the LRU key when full), \"get\" (value or -1, marking the key as recently used), \"delete\" (True when the key existed), \"peek_lru\" and \"peek_mru\" (key or None), or \"to_list\" (all keys from LRU to MRU).\n\nReturn the list of recorded results (None for set).",
    starterCode: `def ordered_map_ops(capacity, operations, keys, values):
    # Your code here
    pass`,
    solution: `def ordered_map_ops(capacity, operations, keys, values):
    data = {}
    order = []

    def touch(k):
        if k in order:
            order.remove(k)
        order.append(k)

    out = []
    for op, key, val in zip(operations, keys, values):
        if op == "set":
            if key not in data and len(data) >= capacity:
                victim = order.pop(0)
                del data[victim]
            data[key] = val
            touch(key)
            out.append(None)
        elif op == "get":
            if key in data:
                touch(key)
                out.append(data[key])
            else:
                out.append(-1)
        elif op == "delete":
            if key in data:
                del data[key]
                order.remove(key)
                out.append(True)
            else:
                out.append(False)
        elif op == "peek_lru":
            out.append(order[0] if order else None)
        elif op == "peek_mru":
            out.append(order[-1] if order else None)
        else:
            out.append(list(order))
    return out`,
    testCases: [
      {
        input: [
          2,
          ["set", "set", "get", "peek_lru", "peek_mru", "set", "to_list"],
          [1, 2, 1, 0, 0, 3, 0],
          [10, 20, 0, 0, 0, 30, 0],
        ],
        expected: [null, null, 10, 2, 1, null, [1, 3]],
      },
      { input: [1, ["set", "get", "delete", "get"], [1, 1, 1, 1], [5, 0, 0, 0]], expected: [null, 5, true, -1] },
      { input: [2, ["get", "peek_lru"], [9, 0], [0, 0]], expected: [-1, null] },
      { input: [2, ["set", "delete", "set", "to_list"], [1, 1, 2, 0], [1, 0, 2, 0]], expected: [null, true, null, [2]] },
    ],
    hint: "Both get and set must move the key to the most-recently-used end of the list.",
  },
  {
    id: "ds-195",
    title: "TTL Cache Purge Logic",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a cache whose entries expire after a time-to-live and can be purged explicitly.\n\nttl is the maximum idle time. operations contains \"set\" (keys[i], values[i] at times[i]), \"get\" (lazily removes the key when it has expired and returns its value or -1), \"purge\" (removes all expired entries and records how many were removed), or \"size\" (record the number of live entries). An entry expires when times[i] - stored_time is at least ttl.\n\nReturn the list of recorded results (None for set).",
    starterCode: `def ttl_purge_cache(ttl, operations, keys, values, times):
    # Your code here
    pass`,
    solution: `def ttl_purge_cache(ttl, operations, keys, values, times):
    data = {}
    stamp = {}
    out = []
    for op, key, val, t in zip(operations, keys, values, times):
        if op == "set":
            data[key] = val
            stamp[key] = t
            out.append(None)
        elif op == "get":
            if key in data and t - stamp[key] < ttl:
                out.append(data[key])
            else:
                if key in data:
                    del data[key]
                    del stamp[key]
                out.append(-1)
        elif op == "purge":
            expired = [k for k in list(data) if t - stamp[k] >= ttl]
            for k in expired:
                del data[k]
                del stamp[k]
            out.append(len(expired))
        else:
            out.append(len(data))
    return out`,
    testCases: [
      {
        input: [
          5,
          ["set", "set", "get", "purge", "size", "get"],
          [1, 2, 1, 0, 0, 2],
          [10, 20, 0, 0, 0, 0],
          [0, 0, 3, 5, 5, 5],
        ],
        expected: [null, null, 10, 2, 0, -1],
      },
      { input: [10, ["set", "purge", "size"], [1, 0, 0], [5, 0, 0], [0, 9, 9]], expected: [null, 0, 1] },
      { input: [3, ["get"], [1], [0], [10]], expected: [-1] },
      { input: [3, ["set", "get", "size"], [1, 1, 0], [7, 0, 0], [0, 2, 2]], expected: [null, 7, 1] },
    ],
    hint: "A get refreshes nothing: expiry is measured from the last set for that key.",
  },
  {
    id: "ds-196",
    title: "Write-Through vs Write-Back Policy Simulation",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the memory writes performed under two cache policies.\n\npolicy is either \"through\" or \"back\". operations contains \"write\" (dirty the block in addresses[i]) or \"flush\" (write all dirty blocks to memory and clear them). A write-through cache writes to memory on every write, while a write-back cache writes only on flush.\n\nReturn the total number of memory writes.",
    starterCode: `def memory_write_count(policy, operations, addresses):
    # Your code here
    pass`,
    solution: `def memory_write_count(policy, operations, addresses):
    dirty = set()
    writes = 0
    for op, addr in zip(operations, addresses):
        if op == "write":
            if policy == "through":
                writes += 1
            else:
                dirty.add(addr)
        else:
            if policy == "back":
                writes += len(dirty)
                dirty.clear()
    return writes`,
    testCases: [
      { input: ["through", ["write", "write", "flush"], [1, 2, 0]], expected: 2 },
      { input: ["back", ["write", "write", "flush"], [1, 2, 0]], expected: 2 },
      { input: ["back", ["write", "write", "write"], [1, 1, 2]], expected: 0 },
      { input: ["back", ["write", "flush", "write", "flush"], [1, 0, 1, 0]], expected: 2 },
      { input: ["through", ["flush"], [0]], expected: 0 },
    ],
    hint: "A set of dirty block addresses is enough; repeating a write to the same block stays one dirty block.",
  },
  {
    id: "ds-197",
    title: "Page Replacement Optimal vs LRU Comparison",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Compare the number of page faults produced by the optimal and LRU replacement policies.\n\npages is the reference string and capacity is the number of frames. Optimal (Belady) evicts the page whose next use is farthest in the future; LRU evicts the least recently used page.\n\nReturn [optimal_faults, lru_faults]. A non-positive capacity faults on every reference.",
    starterCode: `def page_fault_counts(pages, capacity):
    # Your code here
    pass`,
    solution: `def page_fault_counts(pages, capacity):
    def optimal():
        frames = []
        faults = 0
        for i, p in enumerate(pages):
            if p in frames:
                continue
            faults += 1
            if len(frames) < capacity:
                frames.append(p)
            else:
                victim = None
                farthest = -1
                for f in frames:
                    nxt = len(pages)
                    for j in range(i + 1, len(pages)):
                        if pages[j] == f:
                            nxt = j
                            break
                    if nxt > farthest:
                        farthest = nxt
                        victim = f
                frames[frames.index(victim)] = p
        return faults

    def lru():
        frames = []
        recent = []
        faults = 0
        for p in pages:
            if p in frames:
                recent.remove(p)
                recent.append(p)
            else:
                faults += 1
                if len(frames) < capacity:
                    frames.append(p)
                else:
                    victim = recent.pop(0)
                    frames.remove(victim)
                    frames.append(p)
                recent.append(p)
        return faults

    if capacity <= 0:
        n = len(pages)
        return [n, n]
    return [optimal(), lru()]`,
    testCases: [
      { input: [[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3], expected: [7, 10] },
      { input: [[1, 2, 1], 1], expected: [3, 3] },
      { input: [[1, 2, 3], 3], expected: [3, 3] },
      { input: [[7], 1], expected: [1, 1] },
      { input: [[], 2], expected: [0, 0] },
    ],
    hint: "The optimal policy needs knowledge of future references, so it is only a benchmark.",
  },
  {
    id: "ds-198",
    title: "Clock Algorithm Second-Chance",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count page faults under the clock (second-chance) replacement algorithm.\n\npages is the reference string and capacity is the number of frames. Each frame has a reference bit set on a hit or load; the clock hand clears bits as it sweeps, and the first frame with a cleared bit (or an empty frame) is replaced.\n\nReturn the number of faults. A non-positive capacity faults on every reference.",
    starterCode: `def clock_faults(pages, capacity):
    # Your code here
    pass`,
    solution: `def clock_faults(pages, capacity):
    if capacity <= 0:
        return len(pages)
    frames = [None] * capacity
    ref = [0] * capacity
    hand = 0
    faults = 0
    for p in pages:
        if p in frames:
            ref[frames.index(p)] = 1
        else:
            faults += 1
            while True:
                if frames[hand] is None or ref[hand] == 0:
                    frames[hand] = p
                    ref[hand] = 1
                    hand = (hand + 1) % capacity
                    break
                ref[hand] = 0
                hand = (hand + 1) % capacity
    return faults`,
    testCases: [
      { input: [[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], 3], expected: 9 },
      { input: [[1, 2, 1, 3], 2], expected: 3 },
      { input: [[1, 2, 3], 3], expected: 3 },
      { input: [[7], 1], expected: 1 },
      { input: [[], 2], expected: 0 },
    ],
    hint: "A hit only sets the reference bit; the hand does the eviction work later.",
  },
  {
    id: "ds-199",
    title: "Working Set Window Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the size of the working set after every reference.\n\nreferences is the sequence of page references and window is the number of most recent references considered. After each reference, the working set is the set of distinct pages in the last window references (or all references so far when fewer exist).\n\nReturn the list of working set sizes.",
    starterCode: `def working_set_pages(references, window):
    # Your code here
    pass`,
    solution: `def working_set_pages(references, window):
    out = []
    for i in range(len(references)):
        start = max(0, i - window + 1)
        out.append(len(set(references[start:i + 1])))
    return out`,
    testCases: [
      { input: [[1, 2, 1, 3, 4], 3], expected: [1, 2, 2, 3, 3] },
      { input: [[1, 1, 1], 2], expected: [1, 1, 1] },
      { input: [[], 3], expected: [] },
      { input: [[5, 6], 5], expected: [1, 2] },
    ],
    hint: "The window slides forward by one reference at each step.",
  },
  {
    id: "ds-200",
    title: "TLB Hit Ratio Simulation",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a fully associative TLB with LRU replacement and count hits and misses.\n\npages is the sequence of page references and tlb_size is the number of TLB entries. A reference that is present is a hit and refreshes the entry's recency; otherwise it is a miss and the least recently used entry is evicted.\n\nReturn [hits, misses]. A non-positive TLB size misses on every reference.",
    starterCode: `def tlb_hit_misses(pages, tlb_size):
    # Your code here
    pass`,
    solution: `def tlb_hit_misses(pages, tlb_size):
    tlb = []
    hits = 0
    misses = 0
    for p in pages:
        if p in tlb:
            hits += 1
            tlb.remove(p)
            tlb.append(p)
        else:
            misses += 1
            if tlb_size <= 0:
                continue
            if len(tlb) >= tlb_size:
                tlb.pop(0)
            tlb.append(p)
    return [hits, misses]`,
    testCases: [
      { input: [[1, 2, 3, 1, 2], 3], expected: [2, 3] },
      { input: [[1, 1, 1], 1], expected: [2, 1] },
      { input: [[1, 2, 3, 4], 2], expected: [0, 4] },
      { input: [[], 3], expected: [0, 0] },
      { input: [[5], 1], expected: [0, 1] },
    ],
    hint: "Store TLB entries from least to most recently used and trim the front on a miss.",
  },
  {
    id: "ds-201",
    title: "Slab Class Sizing",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Find the slab class for an object size in a power-of-two allocator.\n\nSlab classes double starting at 8 bytes. Return the smallest class that can hold an object of the given size, so any size up to 8 maps to 8 and larger sizes round up to the next power of two.\n\nReturn the class size in bytes.",
    starterCode: `def slab_class(size):
    # Your code here
    pass`,
    solution: `def slab_class(size):
    cls = 8
    while cls < size:
        cls *= 2
    return cls`,
    testCases: [
      { input: [5], expected: 8 },
      { input: [8], expected: 8 },
      { input: [17], expected: 32 },
      { input: [1024], expected: 1024 },
      { input: [1025], expected: 2048 },
    ],
    hint: "Double the class until it is at least the requested size.",
  },
  {
    id: "ds-202",
    title: "Object Pool Checkout and Checkin",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate an object pool with fixed capacity.\n\noperations contains \"checkout\" (lend the smallest free object id, or -1 when none are free), \"checkin\" (values[i] is the returned object id, recording True or False), \"available\" (record the number of free objects), or \"in_use\" (record the number of lent objects).\n\nReturn the list of recorded results.",
    starterCode: `def pool_ops(capacity, operations, values):
    # Your code here
    pass`,
    solution: `def pool_ops(capacity, operations, values):
    in_use = set()
    out = []
    for op, val in zip(operations, values):
        if op == "checkout":
            chosen = -1
            for i in range(capacity):
                if i not in in_use:
                    chosen = i
                    break
            if chosen == -1:
                out.append(-1)
            else:
                in_use.add(chosen)
                out.append(chosen)
        elif op == "checkin":
            if val in in_use:
                in_use.remove(val)
                out.append(True)
            else:
                out.append(False)
        elif op == "available":
            out.append(capacity - len(in_use))
        else:
            out.append(len(in_use))
    return out`,
    testCases: [
      {
        input: [3, ["checkout", "checkout", "checkin", "checkout", "available", "in_use"], [0, 0, 0, 0, 0, 0]],
        expected: [0, 1, true, 0, 1, 2],
      },
      { input: [1, ["checkout", "checkout", "available"], [0, 0, 0]], expected: [0, -1, 0] },
      { input: [2, ["checkin", "available"], [5, 0]], expected: [false, 2] },
      { input: [2, ["checkout", "checkin", "checkin", "available"], [0, 0, 0, 0]], expected: [0, true, false, 2] },
    ],
    hint: "Checking in an id that is not currently lent must be rejected.",
  },
  {
    id: "ds-203",
    title: "Arena Bump Allocation Pointer",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a bump-pointer arena allocator.\n\nsize is the total arena size and operations is a list of integers: a non-negative value requests that many bytes at the current pointer, and -1 resets the arena. An allocation that does not fit fails without moving the pointer.\n\nReturn the start offset for each allocation, None for each reset, or -1 when an allocation fails.",
    starterCode: `def arena_bump(size, operations):
    # Your code here
    pass`,
    solution: `def arena_bump(size, operations):
    offset = 0
    out = []
    for op in operations:
        if op == -1:
            offset = 0
            out.append(None)
        else:
            if offset + op <= size:
                out.append(offset)
                offset += op
            else:
                out.append(-1)
    return out`,
    testCases: [
      { input: [10, [3, 4, 3, 0, 1]], expected: [0, 3, 7, 10, -1] },
      { input: [8, [-1, 5, 5]], expected: [null, 0, -1] },
      { input: [0, [1]], expected: [-1] },
      { input: [5, [2, -1, 4]], expected: [0, null, 0] },
    ],
    hint: "A failed allocation leaves the bump pointer unchanged.",
  },
  {
    id: "ds-204",
    title: "GC Mark Phase",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Run the mark phase of a tracing garbage collector.\n\nroots is the list of root object ids and edges is a list of [from, to] references. Starting from the roots, follow references transitively and collect every reachable object.\n\nReturn the reachable ids sorted in ascending order.",
    starterCode: `def gc_mark(roots, edges):
    # Your code here
    pass`,
    solution: `def gc_mark(roots, edges):
    graph = {}
    for a, b in edges:
        graph.setdefault(a, []).append(b)
    seen = set()
    stack = list(roots)
    while stack:
        obj = stack.pop()
        if obj in seen:
            continue
        seen.add(obj)
        for nxt in graph.get(obj, []):
            if nxt not in seen:
                stack.append(nxt)
    return sorted(seen)`,
    testCases: [
      { input: [[1], [[1, 2], [2, 3], [4, 5]]], expected: [1, 2, 3] },
      { input: [[], [[1, 2]]], expected: [] },
      { input: [[1, 2], []], expected: [1, 2] },
      { input: [[1], [[1, 1]]], expected: [1] },
      { input: [[1], [[1, 2], [2, 1]]], expected: [1, 2] },
    ],
    hint: "A visited set prevents infinite loops when references form cycles.",
  },
  {
    id: "ds-205",
    title: "GC Sweep Phase Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Run mark and sweep and report the objects that are collected.\n\nobjects is the complete list of object ids, roots is the list of roots, and edges is a list of [from, to] references. Mark everything reachable from the roots, then sweep (collect) every other object.\n\nReturn the collected ids sorted in ascending order.",
    starterCode: `def gc_collect(objects, roots, edges):
    # Your code here
    pass`,
    solution: `def gc_collect(objects, roots, edges):
    graph = {}
    for a, b in edges:
        graph.setdefault(a, []).append(b)
    seen = set()
    stack = list(roots)
    while stack:
        obj = stack.pop()
        if obj in seen:
            continue
        seen.add(obj)
        for nxt in graph.get(obj, []):
            if nxt not in seen:
                stack.append(nxt)
    return sorted(o for o in objects if o not in seen)`,
    testCases: [
      { input: [[1, 2, 3, 4], [1], [[1, 2], [2, 3]]], expected: [4] },
      { input: [[1, 2], [], [[1, 2]]], expected: [1, 2] },
      { input: [[], [], []], expected: [] },
      { input: [[1, 2, 3], [1, 2, 3], []], expected: [] },
      { input: [[1, 2, 3], [1], [[2, 3]]], expected: [2, 3] },
    ],
    hint: "Anything not marked reachable is swept.",
  },
  {
    id: "ds-206",
    title: "Reference Counting Increment",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate reference counting on object ids.\n\noperations contains \"add_ref\" (increment the count of targets[i]) or \"release\" (decrement it, never below zero). After every operation, record the current reference count of that same target.\n\nReturn the list of counts.",
    starterCode: `def refcount_ops(operations, targets):
    # Your code here
    pass`,
    solution: `def refcount_ops(operations, targets):
    counts = {}
    out = []
    for op, t in zip(operations, targets):
        if op == "add_ref":
            counts[t] = counts.get(t, 0) + 1
        elif op == "release":
            counts[t] = max(0, counts.get(t, 0) - 1)
        out.append(counts.get(t, 0))
    return out`,
    testCases: [
      { input: [["add_ref", "release"], [7, 7]], expected: [1, 0] },
      { input: [["release"], [3]], expected: [0] },
      {
        input: [["add_ref", "add_ref", "release", "release", "release"], [2, 2, 2, 2, 2]],
        expected: [1, 2, 1, 0, 0],
      },
      { input: [[], []], expected: [] },
    ],
    hint: "Releasing an object with count zero must stay at zero.",
  },
  {
    id: "ds-207",
    title: "Reference Cycle Detection",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Detect whether a directed graph of object references contains a cycle.\n\nn is the number of objects and edges is a list of [from, to] references. A reference cycle means reference counting alone can never free the objects, so it must be found by a graph traversal.\n\nReturn True when a cycle exists, otherwise False.",
    starterCode: `def has_reference_cycle(n, edges):
    # Your code here
    pass`,
    solution: `def has_reference_cycle(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
    state = [0] * n

    def dfs(u):
        state[u] = 1
        for v in graph[u]:
            if state[v] == 1:
                return True
            if state[v] == 0 and dfs(v):
                return True
        state[u] = 2
        return False

    for i in range(n):
        if state[i] == 0 and dfs(i):
            return True
    return False`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { input: [3, [[0, 1], [1, 2]]], expected: false },
      { input: [1, [[0, 0]]], expected: true },
      { input: [2, [[0, 1], [1, 0]]], expected: true },
      { input: [0, []], expected: false },
    ],
    hint: "Track visiting versus visited states so back edges reveal cycles.",
  },
  {
    id: "ds-208",
    title: "Copy-on-Write Page Fault Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count copy-on-write faults after a process fork.\n\nfork_pages is the set of pages shared by parent and child at fork time, operations contains \"read\" or \"write\", and pages gives the page referenced. A write to a shared page faults only the first time, because it then becomes private; reads and non-shared writes never cause a copy fault.\n\nReturn the number of copy-on-write faults.",
    starterCode: `def cow_page_faults(fork_pages, operations, pages):
    # Your code here
    pass`,
    solution: `def cow_page_faults(fork_pages, operations, pages):
    shared = set(fork_pages)
    copied = set()
    faults = 0
    for op, p in zip(operations, pages):
        if op == "write" and p in shared and p not in copied:
            faults += 1
            copied.add(p)
    return faults`,
    testCases: [
      { input: [[1, 2], ["read", "write", "write", "write"], [1, 1, 1, 2]], expected: 2 },
      { input: [[1], ["write", "write"], [1, 1]], expected: 1 },
      { input: [[], ["write"], [5]], expected: 0 },
      { input: [[1, 2], ["read", "read"], [1, 2]], expected: 0 },
      { input: [[1], ["write"], [2]], expected: 0 },
    ],
    hint: "Once a shared page is copied it is private, so later writes do not fault.",
  },
  {
    id: "ds-209",
    title: "Weak Reference Promotion",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate object lifetimes with strong references and weak reference checks.\n\noperations contains \"create\" (register a new object with one strong reference), \"ref\" (add a strong reference when the object is alive), \"release\" (drop a strong reference and destroy the object at zero), \"weak\" (record whether a weak reference could be promoted, meaning the object is still alive), or \"alive\".\n\nReturn the list of recorded results (None for create, ref, and release).",
    starterCode: `def weak_ref_sim(operations, values):
    # Your code here
    pass`,
    solution: `def weak_ref_sim(operations, values):
    strong = {}
    out = []
    for op, i in zip(operations, values):
        if op == "create":
            strong[i] = strong.get(i, 0) + 1
            out.append(None)
        elif op == "ref":
            if i in strong:
                strong[i] += 1
            out.append(None)
        elif op == "release":
            if i in strong:
                strong[i] -= 1
                if strong[i] <= 0:
                    del strong[i]
            out.append(None)
        else:
            out.append(i in strong)
    return out`,
    testCases: [
      { input: [["create", "weak", "release", "weak"], [1, 1, 1, 1]], expected: [null, true, null, false] },
      { input: [["create", "ref", "release", "alive"], [2, 2, 2, 2]], expected: [null, null, null, true] },
      { input: [["weak"], [3]], expected: [false] },
      { input: [["create", "create", "release", "alive"], [1, 1, 1, 1]], expected: [null, null, null, true] },
    ],
    hint: "A weak reference becomes invalid the moment the strong count reaches zero.",
  },
  {
    id: "ds-210",
    title: "Undo Stack with Transactions",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a key-value store with nested transactions and rollback.\n\noperations contains \"set\" (keys[i] = values[i]), \"begin\", \"commit\" (merge the transaction into its parent), \"rollback\" (undo the current transaction and record how many sets were reverted), or \"get\" (value or None). A rollback without an active transaction records 0.\n\nReturn the list of recorded results (None for set, begin, and commit).",
    starterCode: `def undo_transactions(operations, keys, values):
    # Your code here
    pass`,
    solution: `def undo_transactions(operations, keys, values):
    state = {}
    stack = []
    out = []
    for op, key, val in zip(operations, keys, values):
        if op == "begin":
            stack.append([])
            out.append(None)
        elif op == "set":
            if stack:
                stack[-1].append((key, state.get(key)))
            state[key] = val
            out.append(None)
        elif op == "commit":
            log = stack.pop() if stack else []
            if stack:
                stack[-1].extend(log)
            out.append(None)
        elif op == "rollback":
            if stack:
                log = stack.pop()
                for k, prev in reversed(log):
                    if prev is None:
                        state.pop(k, None)
                    else:
                        state[k] = prev
                out.append(len(log))
            else:
                out.append(0)
        else:
            out.append(state.get(key))
    return out`,
    testCases: [
      {
        input: [["set", "begin", "set", "rollback", "get"], ["a", "", "a", "", "a"], [1, 0, 2, 0, 0]],
        expected: [null, null, null, 1, 1],
      },
      {
        input: [["begin", "set", "commit", "rollback", "get"], ["", "a", "", "", "a"], [0, 5, 0, 0, 0]],
        expected: [null, null, null, 0, 5],
      },
      { input: [["rollback"], [""], [0]], expected: [0] },
      {
        input: [["begin", "begin", "set", "rollback", "get"], ["", "", "a", "", "a"], [0, 0, 9, 0, 0]],
        expected: [null, null, null, 1, null],
      },
    ],
    hint: "Each transaction logs the set operations so rollback can restore previous values.",
  },
  {
    id: "ds-211",
    title: "Redo Stack Behavior",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a text editor with undo and redo stacks.\n\noperations contains \"type\" (append values[i]), \"undo\" (move the last character to the redo stack), \"redo\" (restore the last undone character), or \"current\" (record the text so far). Typing clears the redo stack.\n\nReturn the list of recorded results (None for type, undo, and redo).",
    starterCode: `def undo_redo(operations, values):
    # Your code here
    pass`,
    solution: `def undo_redo(operations, values):
    done = []
    undone = []
    out = []
    for op, val in zip(operations, values):
        if op == "type":
            done.append(val)
            undone = []
            out.append(None)
        elif op == "undo":
            if done:
                undone.append(done.pop())
            out.append(None)
        elif op == "redo":
            if undone:
                done.append(undone.pop())
            out.append(None)
        else:
            out.append("".join(done))
    return out`,
    testCases: [
      { input: [["type", "type", "undo", "current", "redo", "current"], ["a", "b", 0, 0, 0, 0]], expected: [null, null, null, "a", null, "ab"] },
      { input: [["redo"], [0]], expected: [null] },
      { input: [["type", "undo", "undo", "current"], ["x", 0, 0, 0]], expected: [null, null, null, ""] },
      {
        input: [["type", "undo", "type", "redo", "current"], ["a", 0, "b", 0, 0]],
        expected: [null, null, null, null, "b"],
      },
    ],
    hint: "A new typed character discards everything on the redo stack.",
  },
  {
    id: "ds-212",
    title: "Command Pattern Apply/Undo",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a counter driven by reversible command objects.\n\noperations contains \"apply\" (add values[i] to the counter and push the command), \"undo\" (revert the most recent applied command), \"redo\" (reapply the most recently undone command), or \"value\" (record the counter). A new apply clears the redo stack.\n\nReturn the list of recorded results (None for apply, undo, and redo).",
    starterCode: `def command_ops(operations, values):
    # Your code here
    pass`,
    solution: `def command_ops(operations, values):
    total = 0
    done = []
    undone = []
    out = []
    for op, val in zip(operations, values):
        if op == "apply":
            total += val
            done.append(val)
            undone = []
            out.append(None)
        elif op == "undo":
            if done:
                delta = done.pop()
                total -= delta
                undone.append(delta)
            out.append(None)
        elif op == "redo":
            if undone:
                delta = undone.pop()
                total += delta
                done.append(delta)
            out.append(None)
        else:
            out.append(total)
    return out`,
    testCases: [
      { input: [["apply", "apply", "undo", "value", "redo", "value"], [3, 4, 0, 0, 0, 0]], expected: [null, null, null, 3, null, 7] },
      { input: [["undo", "value"], [0, 0]], expected: [null, 0] },
      { input: [["redo"], [0]], expected: [null] },
      {
        input: [["apply", "undo", "apply", "redo", "value"], [5, 0, 10, 0, 0]],
        expected: [null, null, null, null, 10],
      },
    ],
    hint: "Commands are deltas, so undo subtracts and redo adds the stored amount.",
  },
  {
    id: "ds-213",
    title: "Priority Event Queue Ordering",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Order simulated events by time and priority.\n\nevents is a list of [time, priority, id] triples. Sort by time ascending, then by priority ascending (a smaller number is more urgent), and finally by id ascending so ties are deterministic.\n\nReturn the list of ids in processing order.",
    starterCode: `def event_order(events):
    # Your code here
    pass`,
    solution: `def event_order(events):
    ordered = sorted(events, key=lambda e: (e[0], e[1], e[2]))
    return [e[2] for e in ordered]`,
    testCases: [
      { input: [[[5, 1, "a"], [1, 3, "b"], [1, 1, "c"], [5, 0, "d"]]], expected: ["c", "b", "d", "a"] },
      { input: [[[2, 0, "x"], [1, 0, "y"]]], expected: ["y", "x"] },
      { input: [[[1, 2, "a"], [1, 2, "b"]]], expected: ["a", "b"] },
      { input: [[]], expected: [] },
      { input: [[[3, 5, "z"]]], expected: ["z"] },
    ],
    hint: "The tuple (time, priority, id) provides a total, deterministic order.",
  },
  {
    id: "ds-214",
    title: "Timing Wheel Bucket Index",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the bucket and round for a timer in a hashed timing wheel.\n\nGiven the current tick, the number of wheel slots, and a delay in ticks, the fire time is tick + delay. The bucket is that time modulo the wheel size and the round counts how many full revolutions must pass first.\n\nReturn [bucket, round].",
    starterCode: `def timing_wheel_bucket(tick, wheel_size, delay):
    # Your code here
    pass`,
    solution: `def timing_wheel_bucket(tick, wheel_size, delay):
    total = tick + delay
    return [total % wheel_size, total // wheel_size]`,
    testCases: [
      { input: [0, 8, 5], expected: [5, 0] },
      { input: [3, 8, 10], expected: [5, 1] },
      { input: [7, 4, 1], expected: [0, 2] },
      { input: [0, 1, 0], expected: [0, 0] },
    ],
    hint: "Modulo selects the slot and integer division counts the cascades.",
  },
  {
    id: "ds-215",
    title: "Rendezvous Hash Pick",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Choose a node for a key with the rendezvous (highest random weight) hashing scheme.\n\nFor each node compute the djb2 hash of the string \"node:key\" and pick the node with the largest score, breaking ties by the lexicographically smallest node name. The djb2 hash starts at 5381 and updates h = (h * 33 + ord(ch)) mod 2**32.\n\nReturn the chosen node, or None for an empty node list.",
    starterCode: `def rendezvous_hash(nodes, key):
    # Your code here
    pass`,
    solution: `def rendezvous_hash(nodes, key):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    if not nodes:
        return None
    best = None
    best_score = -1
    for node in sorted(nodes):
        score = h(node + ":" + key)
        if score > best_score:
            best_score = score
            best = node
    return best`,
    testCases: [
      { input: [["a", "b", "c"], "x"], expected: "c" },
      { input: [["n1", "n2", "n3"], "user42"], expected: "n1" },
      { input: [["only"], "k"], expected: "only" },
      { input: [[], "k"], expected: null },
    ],
    hint: "Scanning nodes in sorted order with a strict greater-than comparison makes ties deterministic.",
  },
  {
    id: "ds-216",
    title: "Jump Consistent Hash",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Implement Jump Consistent Hash, which maps a key to a bucket without storing a ring.\n\nkey is an integer and buckets is the number of buckets. The algorithm repeatedly jumps forward using the 64-bit linear congruential step k = (k * 2862933555777941757 + 1) mod 2**64 and computes the next bucket as ((b + 1) * 2**31) // ((k >> 33) + 1) until it passes the bucket count.\n\nReturn the chosen bucket index, or -1 when buckets is not positive.",
    starterCode: `def jump_hash(key, buckets):
    # Your code here
    pass`,
    solution: `def jump_hash(key, buckets):
    if buckets <= 0:
        return -1
    b = -1
    j = 0
    k = key % (2 ** 64)
    while j < buckets:
        b = j
        k = (k * 2862933555777941757 + 1) % (2 ** 64)
        j = ((b + 1) * (2 ** 31)) // ((k >> 33) + 1)
    return b`,
    testCases: [
      { input: [0, 1], expected: 0 },
      { input: [42, 10], expected: 2 },
      { input: [12345, 100], expected: 29 },
      { input: [7, 5], expected: 0 },
      { input: [99, 0], expected: -1 },
    ],
    hint: "The jump length shrinks geometrically so the loop runs in O(log n) iterations.",
  },
  {
    id: "ds-217",
    title: "Counting Bloom Increment",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Update a counting Bloom filter with insertions and deletions.\n\nwidth is the number of counters and num_hashes is the number of hash functions. Inserts increment counters at djb2(seed:item) mod width for each seed; deletions decrement the same counters, never below zero. Unlike a plain Bloom filter, deletions are safe because counts are tracked.\n\nReturn the counter list.",
    starterCode: `def counting_bloom(width, num_hashes, inserts, deletes):
    # Your code here
    pass`,
    solution: `def counting_bloom(width, num_hashes, inserts, deletes):
    def h(s):
        v = 5381
        for ch in s:
            v = (v * 33 + ord(ch)) % (2 ** 32)
        return v

    counters = [0] * width
    for item in inserts:
        for seed in range(num_hashes):
            counters[h(str(seed) + ":" + item) % width] += 1
    for item in deletes:
        for seed in range(num_hashes):
            idx = h(str(seed) + ":" + item) % width
            if counters[idx] > 0:
                counters[idx] -= 1
    return counters`,
    testCases: [
      { input: [8, 2, ["a", "b"], []], expected: [1, 2, 1, 0, 0, 0, 0, 0] },
      { input: [4, 1, ["a", "a", "b"], ["a"]], expected: [1, 1, 0, 0] },
      { input: [5, 2, [], ["x"]], expected: [0, 0, 0, 0, 0] },
      { input: [3, 1, ["x"], ["x"]], expected: [0, 0, 0] },
    ],
    hint: "Deleting an item decrements exactly the counters that insertion incremented.",
  },
  {
    id: "ds-218",
    title: "Bitset Set Operations",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Apply bitwise set operations to two integers used as bitsets.\n\nEach integer's set bits represent a set of small non-negative integers. Compute the union, intersection, and symmetric difference in one pass.\n\nReturn [union, intersection, difference], where difference is the XOR.",
    starterCode: `def bitset_ops(a, b):
    # Your code here
    pass`,
    solution: `def bitset_ops(a, b):
    return [a | b, a & b, a ^ b]`,
    testCases: [
      { input: [5, 3], expected: [7, 1, 6] },
      { input: [0, 0], expected: [0, 0, 0] },
      { input: [255, 1], expected: [255, 1, 254] },
      { input: [10, 12], expected: [14, 8, 6] },
    ],
    hint: "Bitwise or, and, and xor correspond exactly to union, intersection, and symmetric difference.",
  },
  {
    id: "ds-219",
    title: "Sparse Set Add/Remove/Contains",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a sparse set with O(1) membership, insertion, removal, and clearing.\n\noperations contains \"add\" (record None), \"remove\" (record True when the value was present), \"contains\" (record a boolean), \"size\" (record the number of stored values), or \"clear\" (empty the set, recording None).\n\nReturn the list of recorded results.",
    starterCode: `def sparse_set_ops(operations, values):
    # Your code here
    pass`,
    solution: `def sparse_set_ops(operations, values):
    present = set()
    out = []
    for op, val in zip(operations, values):
        if op == "add":
            present.add(val)
            out.append(None)
        elif op == "remove":
            if val in present:
                present.remove(val)
                out.append(True)
            else:
                out.append(False)
        elif op == "contains":
            out.append(val in present)
        elif op == "size":
            out.append(len(present))
        else:
            present.clear()
            out.append(None)
    return out`,
    testCases: [
      {
        input: [["add", "add", "contains", "remove", "contains", "clear", "contains", "size"], [5, 3, 5, 5, 5, 0, 5, 0]],
        expected: [null, null, true, true, false, null, false, 0],
      },
      { input: [["contains", "remove"], [1, 1]], expected: [false, false] },
      { input: [["add", "clear", "add", "contains"], [2, 0, 2, 2]], expected: [null, null, null, true] },
      { input: [["add", "add", "size", "clear", "size"], [1, 2, 0, 0, 0]], expected: [null, null, 2, null, 0] },
    ],
    hint: "The clear operation resets the whole set at once instead of removing values one by one.",
  },
  {
    id: "ds-220",
    title: "Total Covered Interval Length",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute the total length covered by a set of intervals.\n\nintervals is a list of [start, end] pairs; overlapping and touching intervals merge into one covered span. The covered length of a span is end minus start, so zero-width intervals contribute nothing.\n\nReturn the total covered length.",
    starterCode: `def covered_length(intervals):
    # Your code here
    pass`,
    solution: `def covered_length(intervals):
    if not intervals:
        return 0
    ordered = sorted(intervals, key=lambda p: (p[0], p[1]))
    total = 0
    cur_lo, cur_hi = ordered[0]
    for lo, hi in ordered[1:]:
        if lo <= cur_hi:
            if hi > cur_hi:
                cur_hi = hi
        else:
            total += cur_hi - cur_lo
            cur_lo, cur_hi = lo, hi
    total += cur_hi - cur_lo
    return total`,
    testCases: [
      { input: [[[1, 3], [2, 5], [8, 10]]], expected: 6 },
      { input: [[]], expected: 0 },
      { input: [[[1, 2]]], expected: 1 },
      { input: [[[1, 1]]], expected: 0 },
      { input: [[[5, 7], [1, 2], [2, 3]]], expected: 4 },
    ],
    hint: "After sorting by start, extend the current span while the next start is at most the current end.",
  },
];
