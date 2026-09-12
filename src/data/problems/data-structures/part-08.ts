import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-311",
    title: "Fenwick Tree Index Chains",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Fenwick tree cells are indexed from 1. Given array length n and a 0-based index i, return [update_chain, prefix_chain]. update_chain lists the cells a point update at i visits: i + 1, then x + (x & -x) while x <= n. prefix_chain lists the cells the prefix-sum query ending at i visits: i + 1, then x - (x & -x) down to 1. Assume 0 <= i < n.",
    starterCode: `def fenwick_index_chains(n, i):
    # Your code here
    pass`,
    solution: `def fenwick_index_chains(n, i):
    up = []
    x = i + 1
    while x <= n:
        up.append(x)
        x += x & (-x)
    down = []
    x = i + 1
    while x > 0:
        down.append(x)
        x -= x & (-x)
    return [up, down]`,
    testCases: [
      { input: [8, 0], expected: [[1, 2, 4, 8], [1]] },
      { input: [8, 5], expected: [[6, 8], [6, 4]] },
      { input: [1, 0], expected: [[1], [1]] },
      { input: [10, 9], expected: [[10], [10, 8]] },
    ],
    hint: "Walk parent indices with x += x & -x for updates and x -= x & -x for prefix sums.",
  },
  {
    id: "ds-312",
    title: "Fenwick Range Add and Range Sum",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Support range additions and range sums with two Fenwick trees over the difference array. nums is the initial array. queries is a list of [\"add\", l, r, val] (add val to nums[l..r] inclusive) or [\"sum\", l, r] (sum of nums[l..r]). Keeping one BIT over d[i] and another over d[i] * i makes prefix sums cost two queries. Return the sum-query results in order.",
    starterCode: `def fenwick_range_add_sum(nums, queries):
    # Your code here
    pass`,
    solution: `def fenwick_range_add_sum(nums, queries):
    n = len(nums)
    bit1 = [0] * (n + 1)
    bit2 = [0] * (n + 1)

    def add(tree, i, delta):
        i += 1
        while i <= n:
            tree[i] += delta
            i += i & (-i)

    def prefix(tree, i):
        s = 0
        i += 1
        while i > 0:
            s += tree[i]
            i -= i & (-i)
        return s

    def range_add(l, r, val):
        add(bit1, l, val)
        add(bit2, l, val * l)
        if r + 1 < n:
            add(bit1, r + 1, -val)
            add(bit2, r + 1, -val * (r + 1))

    def prefix_sum(i):
        return (i + 1) * prefix(bit1, i) - prefix(bit2, i)

    for i, x in enumerate(nums):
        range_add(i, i, x)
    out = []
    for q in queries:
        if q[0] == "add":
            range_add(q[1], q[2], q[3])
        else:
            total = prefix_sum(q[2])
            if q[1] > 0:
                total -= prefix_sum(q[1] - 1)
            out.append(total)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4], [["sum", 0, 3], ["add", 1, 2, 10], ["sum", 0, 3], ["sum", 1, 1], ["sum", 2, 3]]], expected: [10, 30, 12, 17] },
      { input: [[-5, 2, 0, 7], [["sum", 0, 0], ["add", 0, 3, -3], ["sum", 0, 3], ["sum", 2, 2]]], expected: [-5, -8, -3] },
      { input: [[0], [["sum", 0, 0], ["add", 0, 0, 5], ["sum", 0, 0]]], expected: [0, 5] },
    ],
    hint: "With d the difference array, prefix_sum(i) = (i + 1) * sum(d[0..i]) - sum(k * d[k] for k <= i).",
  },
  {
    id: "ds-313",
    title: "Segment Tree Range GCD Query",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Support point updates and range-GCD queries with a segment tree. nums is the initial array. queries contains [\"update\", i, val] (set nums[i] = val) or [\"gcd\", l, r] (GCD of nums[l..r] inclusive). Combine nodes with math.gcd and let an out-of-range side contribute 0, the identity for GCD. Return the query results in order.",
    starterCode: `def segment_tree_gcd(nums, queries):
    # Your code here
    pass`,
    solution: `import math


def segment_tree_gcd(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []

    def build(node, lo, hi):
        if lo == hi:
            tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        build(2 * node + 1, lo, mid)
        build(2 * node + 2, mid + 1, hi)
        tree[node] = math.gcd(tree[2 * node + 1], tree[2 * node + 2])

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
        tree[node] = math.gcd(tree[2 * node + 1], tree[2 * node + 2])

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return tree[node]
        mid = (lo + hi) // 2
        return math.gcd(query(2 * node + 1, lo, mid, l, r),
                       query(2 * node + 2, mid + 1, hi, l, r))

    out = []
    for q in queries:
        if q[0] == "update":
            update(0, 0, n - 1, q[1], q[2])
        else:
            out.append(query(0, 0, n - 1, q[1], q[2]))
    return out`,
    testCases: [
      { input: [[12, 18, 24, 30], [["gcd", 0, 3], ["update", 1, 7], ["gcd", 0, 3], ["gcd", 1, 2]]], expected: [6, 1, 1] },
      { input: [[5, 5, 5, 5], [["gcd", 0, 0], ["update", 2, 9], ["gcd", 0, 3], ["gcd", 2, 2]]], expected: [5, 1, 9] },
      { input: [[0], [["gcd", 0, 0], ["update", 0, 6], ["gcd", 0, 0]]], expected: [0, 6] },
    ],
    hint: "GCD is associative and gcd(0, x) = x, so 0 works as the identity for empty ranges.",
  },
  {
    id: "ds-314",
    title: "Segment Tree Lazy Push Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Count how many times a lazy segment tree pushes a non-zero lazy value to its children. nums is the initial array. queries contains [\"add\", l, r, val] or [\"sum\", l, r]; whenever a partial-coverage visit descends through a node with a pending lazy value, that value is pushed to both children before recursing. Return the total number of such pushes.",
    starterCode: `def lazy_push_count(nums, queries):
    # Your code here
    pass`,
    solution: `def lazy_push_count(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []
    lazy = [0] * (4 * n) if n else []
    pushes = 0

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

    def push(node, lo, hi):
        nonlocal pushes
        if lazy[node]:
            pushes += 1
            mid = (lo + hi) // 2
            left = 2 * node + 1
            right = left + 1
            tree[left] += lazy[node] * (mid - lo + 1)
            lazy[left] += lazy[node]
            tree[right] += lazy[node] * (hi - mid)
            lazy[right] += lazy[node]
            lazy[node] = 0

    def update(node, lo, hi, l, r, val):
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            tree[node] += val * (hi - lo + 1)
            lazy[node] += val
            return
        push(node, lo, hi)
        mid = (lo + hi) // 2
        update(2 * node + 1, lo, mid, l, r, val)
        update(2 * node + 2, mid + 1, hi, l, r, val)
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2]

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return tree[node]
        push(node, lo, hi)
        mid = (lo + hi) // 2
        return query(2 * node + 1, lo, mid, l, r) + query(2 * node + 2, mid + 1, hi, l, r)

    for q in queries:
        if q[0] == "add":
            update(0, 0, n - 1, q[1], q[2], q[3])
        else:
            query(0, 0, n - 1, q[1], q[2])
    return pushes`,
    testCases: [
      { input: [[1, 2, 3, 4], [["add", 0, 3, 5], ["add", 1, 2, 1], ["sum", 0, 3]]], expected: 3 },
      { input: [[1, 2, 3, 4], [["add", 0, 3, 5], ["sum", 0, 3], ["add", 1, 2, 1], ["add", 0, 0, 2]]], expected: 3 },
      { input: [[1, 1, 1, 1, 1, 1, 1, 1], [["add", 0, 7, 3], ["add", 0, 3, 1], ["query", 0, 7], ["add", 4, 6, 2]]], expected: 3 },
      { input: [[7], [["add", 0, 0, 1], ["sum", 0, 0]]], expected: 0 },
    ],
    hint: "A push only happens when a node holds lazy work and the next operation needs to look below it.",
  },
  {
    id: "ds-315",
    title: "Persistent Segment Tree Node Count",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Count the nodes a persistent segment tree creates. Build a tree over initial, then apply each update [index, value] to the latest version, copying only the root-to-leaf path. Return [build_nodes, per_update]: build_nodes is the node count of the initial tree and per_update lists how many new nodes each update allocates. Return [0, []] for an empty initial array.",
    starterCode: `def persistent_node_count(initial, updates):
    # Your code here
    pass`,
    solution: `def persistent_node_count(initial, updates):
    n = len(initial)
    if n == 0:
        return [0, []]

    def build(lo, hi):
        if lo == hi:
            return [0]
        mid = (lo + hi) // 2
        return [0, build(lo, mid), build(mid + 1, hi)]

    def count_nodes(node):
        if len(node) == 1:
            return 1
        return 1 + count_nodes(node[1]) + count_nodes(node[2])

    root = build(0, n - 1)
    build_nodes = count_nodes(root)
    per_update = []
    for idx, val in updates:
        created = [0]

        def update(node, lo, hi):
            created[0] += 1
            if lo == hi:
                return [val]
            mid = (lo + hi) // 2
            if idx <= mid:
                return [0, update(node[1], lo, mid), node[2]]
            return [0, node[1], update(node[2], mid + 1, hi)]

        root = update(root, 0, n - 1)
        per_update.append(created[0])
    return [build_nodes, per_update]`,
    testCases: [
      { input: [[0, 0, 0, 0], [[1, 5], [3, 9], [0, 2]]], expected: [7, [3, 3, 3]] },
      { input: [[0], [[0, 7]]], expected: [1, [1]] },
      { input: [[1, 2, 3], [[0, 9], [2, 9], [1, 9]]], expected: [5, [3, 2, 3]] },
    ],
    hint: "An update allocates one node per level of the root-to-leaf path; a full tree with n leaves has 2n - 1 nodes.",
  },
  {
    id: "ds-316",
    title: "Sparse Table Build Size",
    category: "Data Structures",
    difficulty: "Easy",
    description: "A sparse table over an array of length n has one level per power of two up to n, and level j holds aggregates for intervals of length 2^j, so it stores n - 2^j + 1 entries for 2^j <= n. Return [levels, total_entries] for n >= 0.",
    starterCode: `def sparse_table_size(n):
    # Your code here
    pass`,
    solution: `def sparse_table_size(n):
    levels = 0
    total = 0
    length = 1
    while length <= n:
        total += n - length + 1
        levels += 1
        length *= 2
    return [levels, total]`,
    testCases: [
      { input: [0], expected: [0, 0] },
      { input: [1], expected: [1, 1] },
      { input: [5], expected: [3, 11] },
      { input: [8], expected: [4, 21] },
    ],
    hint: "Sum n - 2^j + 1 over every power of two 2^j that is at most n.",
  },
  {
    id: "ds-317",
    title: "Sparse Table Block Selection",
    category: "Data Structures",
    difficulty: "Medium",
    description: "A range-minimum sparse-table query on [l, r] uses k = floor(log2(r - l + 1)) and compares the two overlapping blocks of length 2^k that start at l and at r - 2^k + 1. Given nums and queries of [l, r] pairs, return [k, left_start, right_start] for each query in order. Assume every query is valid and nums is non-empty.",
    starterCode: `def sparse_table_block_selection(nums, queries):
    # Your code here
    pass`,
    solution: `def sparse_table_block_selection(nums, queries):
    n = len(nums)
    log = [0] * (n + 1)
    for i in range(2, n + 1):
        log[i] = log[i // 2] + 1
    out = []
    for l, r in queries:
        k = log[r - l + 1]
        out.append([k, l, r - (1 << k) + 1])
    return out`,
    testCases: [
      { input: [[3, 1, 4, 1, 5, 9, 2, 6], [[0, 7], [1, 4], [2, 2], [3, 6]]], expected: [[3, 0, 0], [2, 1, 1], [0, 2, 2], [2, 3, 3]] },
      { input: [[10, 20, 30, 40, 50], [[0, 4], [1, 3], [2, 2]]], expected: [[2, 0, 1], [1, 1, 2], [0, 2, 2]] },
      { input: [[5], [[0, 0]]], expected: [[0, 0, 0]] },
    ],
    hint: "Precompute floor(log2) for every length once, then each query is O(1).",
  },
  {
    id: "ds-318",
    title: "Sqrt Decomposition Bucket Layout",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Split n elements into blocks of size b = max(1, isqrt(n)) for square-root decomposition. The number of blocks is ceil(n / b) and the last block holds n - (count - 1) * b elements. Return [b, block_count, last_block_size], or [0, 0, 0] when n is 0.",
    starterCode: `def sqrt_bucket_layout(n):
    # Your code here
    pass`,
    solution: `import math


def sqrt_bucket_layout(n):
    if n <= 0:
        return [0, 0, 0]
    b = math.isqrt(n)
    if b < 1:
        b = 1
    count = (n + b - 1) // b
    return [b, count, n - (count - 1) * b]`,
    testCases: [
      { input: [10], expected: [3, 4, 1] },
      { input: [16], expected: [4, 4, 4] },
      { input: [1], expected: [1, 1, 1] },
      { input: [0], expected: [0, 0, 0] },
    ],
    hint: "math.isqrt gives the exact integer square root without floating-point rounding.",
  },
  {
    id: "ds-319",
    title: "Mo's Algorithm Movement Cost",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Mo's algorithm sorts offline queries to reduce pointer movement. Sort queries by (l // block, r ascending when the block is even and r descending when it is odd); ties keep the original order because the sort is stable. Starting from left = 0 and right = -1, the cost is the sum of |l - left| + |r - right| measured before each query. Return the total cost. Assume queries are valid and block >= 1.",
    starterCode: `def mo_movement_cost(n, queries, block):
    # Your code here
    pass`,
    solution: `def mo_movement_cost(n, queries, block):
    ordered = sorted(
        queries,
        key=lambda q: (q[0] // block, q[1] if (q[0] // block) % 2 == 0 else -q[1]),
    )
    left, right = 0, -1
    cost = 0
    for l, r in ordered:
        cost += abs(l - left) + abs(r - right)
        left, right = l, r
    return cost`,
    testCases: [
      { input: [8, [[0, 3], [2, 5], [4, 7], [1, 6]], 3], expected: 14 },
      { input: [10, [[0, 9], [1, 2], [4, 6], [7, 8]], 4], expected: 25 },
      { input: [5, [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]], 2], expected: 13 },
    ],
    hint: "The parity trick makes the right pointer sweep back across the array instead of jumping home each block.",
  },
  {
    id: "ds-320",
    title: "Mo's Algorithm Block Size",
    category: "Data Structures",
    difficulty: "Medium",
    description: "A standard Mo's algorithm block size is n / sqrt(q), which balances left-pointer and right-pointer movement. Using integer arithmetic, block_size = max(1, n // max(1, isqrt(q))) and block_count = ceil(n / block_size). Return [block_size, block_count], or [0, 0] when n is 0.",
    starterCode: `def mo_block_size(n, q):
    # Your code here
    pass`,
    solution: `import math


def mo_block_size(n, q):
    if n <= 0:
        return [0, 0]
    root = math.isqrt(q)
    if root < 1:
        root = 1
    block = n // root
    if block < 1:
        block = 1
    return [block, (n + block - 1) // block]`,
    testCases: [
      { input: [100, 100], expected: [10, 10] },
      { input: [10, 3], expected: [10, 1] },
      { input: [17, 4], expected: [8, 3] },
      { input: [5, 0], expected: [5, 1] },
    ],
    hint: "When q is 0 or 1, isqrt gives at most 1, so the block size collapses to n.",
  },
  {
    id: "ds-321",
    title: "Wavelet Tree Range Count",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Build a 4-bit wavelet tree over nums (values 0..15) and count values in a value range for a subarray. queries contains [l, r, lo, hi] and the answer is how many positions i with l <= i <= r satisfy lo <= nums[i] <= hi. Compute count_less(hi + 1) - count_less(lo) by routing through the bit levels using zero counts. Return the answers in order.",
    starterCode: `def wavelet_range_count(nums, queries):
    # Your code here
    pass`,
    solution: `def wavelet_range_count(nums, queries):
    bits = 4
    levels = []
    cur = list(nums)
    for b in range(bits - 1, -1, -1):
        prefix = [0] * (len(cur) + 1)
        zeros = []
        ones = []
        for i, x in enumerate(cur):
            if (x >> b) & 1:
                prefix[i + 1] = prefix[i] + 1
                ones.append(x)
            else:
                prefix[i + 1] = prefix[i]
                zeros.append(x)
        levels.append((prefix, len(zeros)))
        cur = zeros + ones

    def count_less(l, r, x):
        if l > r or x <= 0:
            return 0
        if x >= (1 << bits):
            return r - l + 1
        res = 0
        for b in range(bits - 1, -1, -1):
            prefix, z = levels[bits - 1 - b]
            ones_l = prefix[l]
            ones_r = prefix[r + 1]
            zeros_l = l - ones_l
            zeros_r = (r + 1) - ones_r
            if (x >> b) & 1:
                res += zeros_r - zeros_l
                l = z + ones_l
                r = z + ones_r - 1
            else:
                l = zeros_l
                r = zeros_r - 1
            if l > r:
                break
        return res

    out = []
    for l, r, lo, hi in queries:
        out.append(count_less(l, r, hi + 1) - count_less(l, r, lo))
    return out`,
    testCases: [
      { input: [[1, 5, 3, 7, 2, 9], [[0, 2, 1, 5], [0, 5, 0, 15], [3, 3, 7, 7], [0, 5, 10, 15]]], expected: [3, 6, 1, 0] },
      { input: [[0, 15, 8, 8, 4], [[1, 4, 4, 15], [0, 0, 0, 0], [2, 3, 8, 8]]], expected: [4, 1, 2] },
      { input: [[10], [[0, 0, 10, 10], [0, 0, 0, 9]]], expected: [1, 0] },
    ],
    hint: "count_less sums the zeros in a range whenever the queried value turns a bit on, then follows the matching branch.",
  },
  {
    id: "ds-322",
    title: "Trie Node Count on Insert",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Insert each word into a prefix trie, creating a new node only when the next character is not already present. Return the total number of trie nodes after all insertions, counting the root. Words are non-empty and contain lowercase letters.",
    starterCode: `def trie_node_count(words):
    # Your code here
    pass`,
    solution: `def trie_node_count(words):
    children = [{}]
    for word in words:
        node = 0
        for ch in word:
            if ch not in children[node]:
                children.append({})
                children[node][ch] = len(children) - 1
            node = children[node][ch]
    return len(children)`,
    testCases: [
      { input: [["cat", "car", "dog"]], expected: 8 },
      { input: [["a", "a", "a"]], expected: 2 },
      { input: [["ab", "ac", "ad"]], expected: 5 },
      { input: [[]], expected: 1 },
    ],
    hint: "Each shared prefix is stored once, so total nodes equal the number of distinct prefixes plus the root.",
  },
  {
    id: "ds-323",
    title: "Radix Trie Edge Split Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Insert words one at a time into a compressed (radix) trie whose edges carry string labels. When an insertion diverges in the middle of an existing edge, that edge splits into a prefix edge and a suffix edge; when the word ends in the middle of an edge, the edge splits there too. Return the total number of edge splits across all insertions. Words are non-empty lowercase strings; duplicates are allowed.",
    starterCode: `def radix_split_count(words):
    # Your code here
    pass`,
    solution: `def radix_split_count(words):
    root = {"children": {}, "terminal": False}
    splits = 0
    for word in words:
        node = root
        i = 0
        while i < len(word):
            ch = word[i]
            label = None
            for lab in node["children"]:
                if lab[0] == ch:
                    label = lab
                    break
            if label is None:
                child = {"children": {}, "terminal": False}
                node["children"][word[i:]] = child
                node = child
                i = len(word)
                continue
            child = node["children"][label]
            rest = word[i:]
            k = 0
            while k < len(label) and k < len(rest) and label[k] == rest[k]:
                k += 1
            if k == len(label):
                node = child
                i += k
            else:
                splits += 1
                mid = {"children": {}, "terminal": False}
                del node["children"][label]
                node["children"][label[:k]] = mid
                mid["children"][label[k:]] = child
                if k == len(rest):
                    mid["terminal"] = True
                    node = mid
                    i = len(word)
                else:
                    newchild = {"children": {}, "terminal": False}
                    mid["children"][rest[k:]] = newchild
                    node = newchild
                    i = len(word)
        node["terminal"] = True
    return splits`,
    testCases: [
      { input: [["car", "cat"]], expected: 1 },
      { input: [["abcde", "abcfg", "ab"]], expected: 2 },
      { input: [["abcd", "abef", "ab"]], expected: 1 },
      { input: [["a", "ab", "abc"]], expected: 0 },
    ],
    hint: "Walk character by character; on a partial edge match, replace the edge with a new middle node and two edges.",
  },
  {
    id: "ds-324",
    title: "Aho-Corasick Failure Link Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Build an Aho-Corasick automaton from patterns. Each trie node's failure link points to the longest proper suffix of its path that is also a trie prefix, or the root when none exists. Return [total_nodes, non_root_failures] where total_nodes includes the root and non_root_failures counts nodes whose failure link is not the root.",
    starterCode: `def ac_failure_links(patterns):
    # Your code here
    pass`,
    solution: `from collections import deque


def ac_failure_links(patterns):
    children = [{}]
    fail = [0]
    for word in patterns:
        node = 0
        for ch in word:
            if ch not in children[node]:
                children.append({})
                fail.append(0)
                children[node][ch] = len(children) - 1
            node = children[node][ch]
    q = deque()
    for ch, nxt in children[0].items():
        q.append(nxt)
    while q:
        node = q.popleft()
        for ch, nxt in children[node].items():
            f = fail[node]
            while f and ch not in children[f]:
                f = fail[f]
            target = children[f].get(ch, 0)
            fail[nxt] = target if target != nxt else 0
            q.append(nxt)
    return [len(children), sum(1 for i in range(1, len(children)) if fail[i] != 0)]`,
    testCases: [
      { input: [["a", "aa"]], expected: [3, 1] },
      { input: [["ab", "bc"]], expected: [5, 1] },
      { input: [["aaa"]], expected: [4, 2] },
      { input: [["he", "she"]], expected: [6, 2] },
      { input: [["a", "ab"]], expected: [3, 0] },
    ],
    hint: "Process nodes in BFS order so every failure target is already computed; follow failure links to fall back on a mismatch.",
  },
  {
    id: "ds-325",
    title: "Aho-Corasick Match Positions",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Scan text once with an Aho-Corasick automaton built from patterns. Return, for each pattern in input order, the sorted list of 0-based start indices where that pattern occurs in text. Overlapping matches are all reported, and patterns may repeat. Patterns are non-empty lowercase strings.",
    starterCode: `def ac_match_positions(text, patterns):
    # Your code here
    pass`,
    solution: `from collections import deque


def ac_match_positions(text, patterns):
    children = [{}]
    fail = [0]
    ends = [[]]
    for pi, word in enumerate(patterns):
        node = 0
        for ch in word:
            if ch not in children[node]:
                children.append({})
                fail.append(0)
                ends.append([])
                children[node][ch] = len(children) - 1
            node = children[node][ch]
        ends[node].append(pi)
    q = deque()
    for ch, nxt in children[0].items():
        q.append(nxt)
    while q:
        node = q.popleft()
        for ch, nxt in children[node].items():
            f = fail[node]
            while f and ch not in children[f]:
                f = fail[f]
            target = children[f].get(ch, 0)
            fail[nxt] = target if target != nxt else 0
            ends[nxt].extend(ends[fail[nxt]])
            q.append(nxt)
    out = [[] for _ in patterns]
    node = 0
    for i, ch in enumerate(text):
        while node and ch not in children[node]:
            node = fail[node]
        node = children[node].get(ch, 0)
        for pi in ends[node]:
            out[pi].append(i - len(patterns[pi]) + 1)
    return out`,
    testCases: [
      { input: ["ababa", ["aba", "ba", "a"]], expected: [[0, 2], [1, 3], [0, 2, 4]] },
      { input: ["aaaa", ["aa", "aaa", "a"]], expected: [[0, 1, 2], [0, 1], [0, 1, 2, 3]] },
      { input: ["xyzxyz", ["yz", "xyz", "q"]], expected: [[1, 4], [0, 3], []] },
      { input: ["abc", ["abc", "ab", "c"]], expected: [[0], [0], [2]] },
    ],
    hint: "Merge each node's match list into its failure target during BFS so one walk reports every pattern ending there.",
  },
  {
    id: "ds-326",
    title: "Suffix Array Doubling Rounds",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Build the suffix array of s by prefix doubling: start with single-character ranks, and each round sort suffixes by the pair (rank[i], rank[i + k]) with k doubling from 1. Stop after the round where all ranks become distinct or k >= n. Return [rounds, suffix_array] where rounds counts the sorting rounds and suffix_array lists 0-based suffix starts in sorted order. For the empty string return [0, []].",
    starterCode: `def suffix_array_rounds(s):
    # Your code here
    pass`,
    solution: `def suffix_array_rounds(s):
    n = len(s)
    if n == 0:
        return [0, []]
    sa = list(range(n))
    rank = [ord(c) for c in s]
    rounds = 0
    k = 1
    while k < n:
        sa.sort(key=lambda i: (rank[i], rank[i + k] if i + k < n else -1))
        new_rank = [0] * n
        for j in range(1, n):
            prev = sa[j - 1]
            cur = sa[j]
            key_prev = (rank[prev], rank[prev + k] if prev + k < n else -1)
            key_cur = (rank[cur], rank[cur + k] if cur + k < n else -1)
            new_rank[cur] = new_rank[prev] + (1 if key_prev != key_cur else 0)
        rank = new_rank
        rounds += 1
        if rank[sa[-1]] == n - 1:
            break
        k *= 2
    return [rounds, sa]`,
    testCases: [
      { input: ["banana"], expected: [2, [5, 3, 1, 0, 4, 2]] },
      { input: ["aaaa"], expected: [2, [3, 2, 1, 0]] },
      { input: ["abc"], expected: [1, [0, 1, 2]] },
      { input: ["abab"], expected: [2, [2, 0, 3, 1]] },
      { input: [""], expected: [0, []] },
    ],
    hint: "Each round halves the number of distinct-rank groups; missing second halves compare as -1.",
  },
  {
    id: "ds-327",
    title: "Kasai LCP Array",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Compute the LCP array of s with Kasai's algorithm. lcp[i] is the length of the longest common prefix of the suffixes at positions i and i + 1 of the sorted suffix array, so the result has n - 1 entries and is empty when n < 2. Build the suffix array first, then use the inverse permutation and carry the running length over after decreasing it by one.",
    starterCode: `def kasai_lcp(s):
    # Your code here
    pass`,
    solution: `def kasai_lcp(s):
    n = len(s)
    if n < 2:
        return []
    sa = sorted(range(n), key=lambda i: s[i:])
    rank = [0] * n
    for r, i in enumerate(sa):
        rank[i] = r
    lcp = [0] * (n - 1)
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i] - 1] = h
            if h:
                h -= 1
        else:
            h = 0
    return lcp`,
    testCases: [
      { input: ["banana"], expected: [1, 3, 0, 0, 2] },
      { input: ["aaaa"], expected: [1, 2, 3] },
      { input: ["abc"], expected: [0, 0] },
      { input: ["abab"], expected: [2, 0, 1] },
      { input: [""], expected: [] },
    ],
    hint: "When moving from suffix i to i + 1, the LCP with the previous suffix drops by at most one, so total work is linear.",
  },
  {
    id: "ds-328",
    title: "Rolling Hash Collision Probability",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Model a polynomial rolling hash as a uniform random value in [0, mod). With n distinct strings, the birthday bound gives the probability of at least one collision as 1 - exp(-n * (n - 1) / (2 * mod)). Return that probability clamped to 1.0, and 0.0 when n < 2 or mod < 1.",
    starterCode: `def collision_probability(mod, n):
    # Your code here
    pass`,
    solution: `import math


def collision_probability(mod, n):
    if n < 2 or mod < 1:
        return 0.0
    p = 1.0 - math.exp(-n * (n - 1) / (2.0 * mod))
    return min(1.0, p)`,
    testCases: [
      { input: [1000, 20], expected: 0.1730408660566377 },
      { input: [1000003, 1000], expected: 0.39316508978983655 },
      { input: [2, 3], expected: 0.7768698398515702 },
      { input: [1000000007, 1], expected: 0.0 },
    ],
    hint: "For small x, 1 - exp(-x) is about x, which is why large moduli make collisions rare.",
  },
  {
    id: "ds-329",
    title: "KMP Border Chain Lengths",
    category: "Data Structures",
    difficulty: "Medium",
    description: "For every prefix pattern[:i] with i from 1 to n, count its proper borders by following the KMP failure function: start at j = pi[i - 1] and count each positive j reached through j = pi[j - 1]. Return the list of chain lengths for i = 1..n, and [] for an empty pattern. Build pi with the standard prefix-function loop.",
    starterCode: `def kmp_border_chain_lengths(pattern):
    # Your code here
    pass`,
    solution: `def kmp_border_chain_lengths(pattern):
    n = len(pattern)
    pi = [0] * n
    k = 0
    for i in range(1, n):
        while k > 0 and pattern[i] != pattern[k]:
            k = pi[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        pi[i] = k
    out = []
    for i in range(n):
        count = 0
        j = pi[i]
        while j > 0:
            count += 1
            j = pi[j - 1]
        out.append(count)
    return out`,
    testCases: [
      { input: ["aabaa"], expected: [0, 1, 0, 1, 2] },
      { input: ["ababab"], expected: [0, 0, 1, 1, 2, 2] },
      { input: ["aaaa"], expected: [0, 1, 2, 3] },
      { input: ["abc"], expected: [0, 0, 0] },
      { input: [""], expected: [] },
    ],
    hint: "Every proper border of a prefix is found by repeatedly following the failure link of the previous border.",
  },
  {
    id: "ds-330",
    title: "Z-Function Box Boundaries",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Compute the Z-array, where z[i] is the length of the longest common prefix of s and s[i:]. The scan maintains a box [l, r] with r = l + z[l] - 1, reusing z[i - l] inside it. Return [z_array, max_right] where max_right is the largest right end of a non-empty box (z[l] > 0) reached while processing positions i >= 1, or -1 for the empty string.",
    starterCode: `def z_box_boundaries(s):
    # Your code here
    pass`,
    solution: `def z_box_boundaries(s):
    n = len(s)
    if n == 0:
        return [[], -1]
    z = [0] * n
    z[0] = n
    l = 0
    r = 0
    max_right = 0
    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if z[i] > 0 and i + z[i] - 1 > r:
            l = i
            r = i + z[i] - 1
            if r > max_right:
                max_right = r
    return [z, max_right]`,
    testCases: [
      { input: ["aabcaabxaaaz"], expected: [[12, 1, 0, 0, 3, 1, 0, 0, 2, 2, 1, 0], 10] },
      { input: ["aaaa"], expected: [[4, 3, 2, 1], 3] },
      { input: ["abc"], expected: [[3, 0, 0], 0] },
      { input: ["a"], expected: [[1], 0] },
      { input: [""], expected: [[], -1] },
    ],
    hint: "Inside the current Z-box, z[i] starts at min(r - i + 1, z[i - l]) and only extends past r.",
  },
  {
    id: "ds-331",
    title: "Next Greater Pop Count",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Count the pops performed while finding next greater elements with a monotonic stack. For each index, pop stack indices whose value is strictly smaller than the current value before pushing the current index. Return [pop_count, push_count], where every index is pushed exactly once.",
    starterCode: `def next_greater_pop_count(nums):
    # Your code here
    pass`,
    solution: `def next_greater_pop_count(nums):
    stack = []
    pops = 0
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            stack.pop()
            pops += 1
        stack.append(i)
    return [pops, len(nums)]`,
    testCases: [
      { input: [[2, 1, 5, 3, 4]], expected: [3, 5] },
      { input: [[1, 2, 3]], expected: [2, 3] },
      { input: [[3, 2, 1]], expected: [0, 3] },
      { input: [[]], expected: [0, 0] },
    ],
    hint: "Each element is pushed once and popped at most once, so the whole scan is O(n).",
  },
  {
    id: "ds-332",
    title: "Sliding Window Deque Moves",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Process every size-k window with a monotonic deque of indices and count its operations. back_pops counts removals from the back while the back value is <= the incoming value; front_pops counts removals from the front when the front index has left the window. Return [back_pops, front_pops], or [] when k is not positive or larger than the array.",
    starterCode: `def sliding_window_deque_moves(nums, k):
    # Your code here
    pass`,
    solution: `def sliding_window_deque_moves(nums, k):
    if k <= 0 or k > len(nums):
        return []
    dq = []
    back = 0
    front = 0
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
            back += 1
        dq.append(i)
        if dq[0] <= i - k:
            dq.pop(0)
            front += 1
    return [back, front]`,
    testCases: [
      { input: [[1, 3, 2, 5, 4], 3], expected: [3, 0] },
      { input: [[5, 5, 5, 5], 2], expected: [3, 0] },
      { input: [[1], 1], expected: [0, 0] },
      { input: [[1, 2], 3], expected: [] },
    ],
    hint: "Values leave the back when a larger newcomer arrives and the front when their index is out of range.",
  },
  {
    id: "ds-333",
    title: "Min Stack Min Change Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Simulate a stack with O(1) minimum tracking. operations contains \"push\", \"pop\", or \"get_min\"; values supplies the pushed value and is ignored otherwise. Return [min_change_count, results] where min_change_count counts pushes that set a new strict minimum (the first push counts) and results collects each get_min value (None when the stack is empty).",
    starterCode: `def min_stack_changes(operations, values):
    # Your code here
    pass`,
    solution: `def min_stack_changes(operations, values):
    stack = []
    mins = []
    changes = 0
    results = []
    for op, val in zip(operations, values):
        if op == "push":
            if not mins or val < mins[-1]:
                changes += 1
            stack.append(val)
            mins.append(val if not mins else min(val, mins[-1]))
        elif op == "pop":
            if stack:
                stack.pop()
                mins.pop()
        else:
            results.append(mins[-1] if mins else None)
    return [changes, results]`,
    testCases: [
      { input: [["push", "push", "get_min", "push", "get_min", "pop", "get_min"], [3, 5, 0, 2, 0, 0, 0]], expected: [2, [3, 2, 3]] },
      { input: [["push", "push", "get_min", "pop", "get_min", "pop", "get_min"], [1, 1, 0, 0, 0, 0, 0]], expected: [1, [1, 1, null]] },
      { input: [[], []], expected: [0, []] },
      { input: [["get_min", "pop"], [0, 0]], expected: [0, [null]] },
    ],
    hint: "Keep a parallel minimum stack: each entry is the minimum of everything pushed so far.",
  },
  {
    id: "ds-334",
    title: "LFU Eviction Order",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Simulate an LFU cache where each access puts the given key. A hit increases the key's frequency; inserting a new key into a full cache evicts the key with the smallest frequency, breaking ties by least recent use, then inserts the new key. Return the evicted keys in eviction order, and [] when capacity <= 0.",
    starterCode: `def lfu_eviction_order(capacity, accesses):
    # Your code here
    pass`,
    solution: `def lfu_eviction_order(capacity, accesses):
    if capacity <= 0:
        return []
    freq = {}
    last = {}
    tick = 0
    evicted = []
    for key in accesses:
        tick += 1
        if key in freq:
            freq[key] += 1
            last[key] = tick
        else:
            if len(freq) >= capacity:
                victim = min(freq, key=lambda k: (freq[k], last[k]))
                del freq[victim]
                del last[victim]
                evicted.append(victim)
            freq[key] = 1
            last[key] = tick
    return evicted`,
    testCases: [
      { input: [2, [1, 2, 1, 3, 2]], expected: [2, 3] },
      { input: [2, [1, 2, 3]], expected: [1] },
      { input: [1, [1, 1, 2]], expected: [1] },
      { input: [3, [1, 2, 1, 3, 1, 2]], expected: [] },
      { input: [0, [1, 2]], expected: [] },
    ],
    hint: "Ties on frequency are broken by the last-access timestamp; every key has a unique timestamp.",
  },
  {
    id: "ds-335",
    title: "LRU Miss Statistics",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Simulate an LRU cache of the given capacity. operations contains \"get\" or \"put\" and keys supplies the key for each. A get of a missing key is a miss, and a put of an absent key is also a miss; an access to a key already in the cache is a hit. Return [total_misses, longest_miss_streak], where capacity 0 makes every access a miss.",
    starterCode: `def lru_miss_stats(capacity, operations, keys):
    # Your code here
    pass`,
    solution: `def lru_miss_stats(capacity, operations, keys):
    order = {}
    tick = 0
    misses = 0
    streak = 0
    best = 0
    for op, key in zip(operations, keys):
        tick += 1
        present = key in order
        if op == "get" and not present:
            misses += 1
            streak += 1
            if streak > best:
                best = streak
            continue
        if op == "put" and not present:
            misses += 1
            streak += 1
            if streak > best:
                best = streak
            if capacity > 0:
                if len(order) >= capacity:
                    lru = min(order, key=lambda k: order[k])
                    del order[lru]
                order[key] = tick
            continue
        streak = 0
        order[key] = tick
    return [misses, best]`,
    testCases: [
      { input: [2, ["put", "put", "get", "put", "get", "get"], [1, 2, 1, 3, 2, 1]], expected: [4, 2] },
      { input: [3, ["put", "put", "put", "get", "put", "get"], [1, 2, 3, 2, 4, 1]], expected: [5, 3] },
      { input: [0, ["get", "put", "get", "put"], [1, 2, 3, 4]], expected: [4, 4] },
      { input: [1, ["put", "get", "put", "get"], [1, 1, 2, 1]], expected: [3, 2] },
    ],
    hint: "Store a logical timestamp per key; the eviction victim is the key with the smallest timestamp.",
  },
  {
    id: "ds-336",
    title: "Path Compression Rewrite Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "parent describes a disjoint-set forest where parent[i] is the parent of i and a root points to itself. Process each query index with find and full path compression: after locating the root, point every node on the path directly at it. Return the total number of parent entries rewritten, not counting nodes that already point at the root.",
    starterCode: `def path_compression_rewrites(parent, queries):
    # Your code here
    pass`,
    solution: `def path_compression_rewrites(parent, queries):
    p = list(parent)
    rewrites = 0
    for q in queries:
        root = q
        while p[root] != root:
            root = p[root]
        x = q
        while p[x] != root:
            nxt = p[x]
            p[x] = root
            rewrites += 1
            x = nxt
    return rewrites`,
    testCases: [
      { input: [[0, 0, 1, 2, 3], [4, 4, 3, 2, 1]], expected: 3 },
      { input: [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4]], expected: 0 },
      { input: [[1, 2, 3, 3, 3], [0, 2]], expected: 2 },
      { input: [[0, 0, 0, 2], [3, 3]], expected: 1 },
    ],
    hint: "After the first find flattens a path, later finds over the same nodes rewrite nothing.",
  },
  {
    id: "ds-337",
    title: "Weighted Union-Find Potential Query",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Maintain a weighted union-find for difference constraints. operations contains [\"union\", a, b, w] meaning val[b] - val[a] = w, or [\"query\", a, b]. A union records True when a and b were in different components (and adds the relation), False when they were already connected; a query records val[b] - val[a] when connected, otherwise None. Use path compression that accumulates potentials.",
    starterCode: `def weighted_dsu(operations):
    # Your code here
    pass`,
    solution: `def weighted_dsu(operations):
    parent = {}
    pot = {}

    def find(x):
        parent.setdefault(x, x)
        pot.setdefault(x, 0)
        if parent[x] == x:
            return x
        orig = parent[x]
        root = find(orig)
        pot[x] += pot[orig]
        parent[x] = root
        return root

    out = []
    for op in operations:
        if op[0] == "union":
            a, b, w = op[1], op[2], op[3]
            ra, rb = find(a), find(b)
            if ra == rb:
                out.append(False)
            else:
                parent[rb] = ra
                pot[rb] = w + pot[a] - pot[b]
                out.append(True)
        else:
            a, b = op[1], op[2]
            if find(a) != find(b):
                out.append(None)
            else:
                out.append(pot[b] - pot[a])
    return out`,
    testCases: [
      { input: [[["union", 0, 1, 5], ["query", 0, 1], ["union", 1, 2, 3], ["query", 0, 2], ["query", 2, 0], ["union", 0, 2, 8], ["query", 1, 2], ["query", 0, 3]]], expected: [true, 5, true, 8, -8, false, 3, null] },
      { input: [[["query", 5, 5], ["union", 5, 6, 10], ["query", 6, 5], ["union", 6, 7, 4], ["query", 5, 7]]], expected: [0, true, -10, true, 14] },
      { input: [[["union", 0, 1, 1], ["union", 1, 2, 2], ["query", 0, 2], ["union", 0, 2, 99], ["query", 1, 1], ["query", 2, 1]]], expected: [true, true, 3, false, 0, -2] },
    ],
    hint: "The potential pot[x] means val[x] - val[parent[x]]; when attaching rb under ra, set pot[rb] = w + pot[a] - pot[b].",
  },
  {
    id: "ds-338",
    title: "DSU Rollback History Size",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Run a union-find with union by size, no path compression, and a history stack. operations contains [\"union\", a, b], which pushes one entry when it merges two components, or [\"rollback\"], which undoes the most recent union when the history is non-empty. Return [log_size, component_count] after all operations.",
    starterCode: `def dsu_rollback_log(n, operations):
    # Your code here
    pass`,
    solution: `def dsu_rollback_log(n, operations):
    parent = list(range(n))
    size = [1] * n
    history = []
    components = n

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for op in operations:
        if op[0] == "union":
            a, b = find(op[1]), find(op[2])
            if a != b:
                if size[a] < size[b]:
                    a, b = b, a
                history.append((b, parent[b], size[a]))
                parent[b] = a
                size[a] += size[b]
                components -= 1
        elif history:
            b, old_parent, old_size = history.pop()
            root = parent[b]
            size[root] = old_size
            parent[b] = old_parent
            components += 1
    return [len(history), components]`,
    testCases: [
      { input: [4, [["union", 0, 1], ["union", 2, 3], ["rollback"], ["union", 1, 2], ["rollback"], ["rollback"]]], expected: [0, 4] },
      { input: [3, [["rollback"], ["union", 0, 1], ["union", 0, 1], ["rollback"], ["find", 0]]], expected: [0, 3] },
      { input: [5, [["union", 0, 1], ["union", 1, 2], ["union", 3, 4], ["rollback"], ["union", 2, 3], ["rollback"]]], expected: [2, 3] },
    ],
    hint: "Store the old parent and the old size of the winning root so a rollback restores both exactly.",
  },
  {
    id: "ds-339",
    title: "Union by Size Height Bound",
    category: "Data Structures",
    difficulty: "Easy",
    description: "With union by size and no path compression, a tree with k nodes has height at most floor(log2 k). Return the maximum possible height in edges for a forest of n nodes, and 0 when n <= 1.",
    starterCode: `def union_by_size_height(n):
    # Your code here
    pass`,
    solution: `def union_by_size_height(n):
    if n <= 1:
        return 0
    h = 0
    while (1 << (h + 1)) <= n:
        h += 1
    return h`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 1 },
      { input: [4], expected: 2 },
      { input: [100], expected: 6 },
      { input: [0], expected: 0 },
    ],
    hint: "A tree of height h needs at least 2^h nodes because each level doubles the subtree size.",
  },
  {
    id: "ds-340",
    title: "Order-Statistic BST Rank Query",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Insert values into a plain BST augmented with subtree sizes, following the given insertion order; duplicate values are ignored. For each query value x, return the 0-based rank, that is, the number of stored values strictly smaller than x, even when x itself is not stored. An empty insertion list makes every rank 0.",
    starterCode: `def ost_rank_queries(values, queries):
    # Your code here
    pass`,
    solution: `def ost_rank_queries(values, queries):
    left = {}
    right = {}
    size = {}
    root = None

    def insert(node, v):
        if node is None:
            left[v] = None
            right[v] = None
            size[v] = 1
            return v
        if v < node:
            left[node] = insert(left[node], v)
        elif v > node:
            right[node] = insert(right[node], v)
        else:
            return node
        lsz = size[left[node]] if left[node] is not None else 0
        rsz = size[right[node]] if right[node] is not None else 0
        size[node] = 1 + lsz + rsz
        return node

    for v in values:
        root = insert(root, v)

    def count_less(node, x):
        if node is None:
            return 0
        if x <= node:
            return count_less(left[node], x)
        lsz = size[left[node]] if left[node] is not None else 0
        return 1 + lsz + count_less(right[node], x)

    return [count_less(root, q) for q in queries]`,
    testCases: [
      { input: [[5, 3, 8, 1, 4, 7, 9], [4, 5, 9, 0, 10]], expected: [2, 3, 6, 0, 7] },
      { input: [[2, 2, 3], [2, 3, 1]], expected: [0, 1, 0] },
      { input: [[], [1, 2]], expected: [0, 0] },
      { input: [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1]], expected: [4, 3, 2, 1, 0] },
    ],
    hint: "When x is larger than the current node, count the node plus its entire left subtree and descend right.",
  },
  {
    id: "ds-341",
    title: "Treap Split and Merge",
    category: "Data Structures",
    difficulty: "Hard",
    description: "values is sorted ascending and priorities define a treap (a max-heap on priorities, so the highest priority becomes the root). Build the treap recursively, split it into values < key and values >= key with the standard recursive treap split, then merge the two parts back with the recursive treap merge. Return [left_preorder, right_preorder, merged_preorder].",
    starterCode: `def treap_split_merge(values, priorities, key):
    # Your code here
    pass`,
    solution: `def treap_split_merge(values, priorities, key):
    n = len(values)
    left = [None] * n
    right = [None] * n

    def build(lo, hi):
        if lo > hi:
            return -1
        best = lo
        for i in range(lo, hi + 1):
            if priorities[i] > priorities[best]:
                best = i
        left[best] = build(lo, best - 1)
        right[best] = build(best + 1, hi)
        return best

    root = build(0, n - 1) if n else -1

    def split(node, k):
        if node == -1:
            return -1, -1
        if values[node] < k:
            a, b = split(right[node], k)
            right[node] = a
            return node, b
        a, b = split(left[node], k)
        left[node] = b
        return a, node

    def merge(a, b):
        if a == -1:
            return b
        if b == -1:
            return a
        if priorities[a] > priorities[b]:
            right[a] = merge(right[a], b)
            return a
        left[b] = merge(a, left[b])
        return b

    def preorder(node, out):
        if node == -1:
            return
        out.append(values[node])
        preorder(left[node], out)
        preorder(right[node], out)

    lroot, rroot = split(root, key)
    lp = []
    rp = []
    preorder(lroot, lp)
    preorder(rroot, rp)
    merged = merge(lroot, rroot)
    mp = []
    preorder(merged, mp)
    return [lp, rp, mp]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [3, 1, 5, 2, 4], 3], expected: [[1, 2], [3, 5, 4], [3, 1, 2, 5, 4]] },
      { input: [[10, 20, 30], [1, 3, 2], 20], expected: [[10], [20, 30], [20, 10, 30]] },
      { input: [[1, 2, 3, 4, 5], [3, 1, 5, 2, 4], 0], expected: [[], [3, 1, 2, 5, 4], [3, 1, 2, 5, 4]] },
      { input: [[1, 2, 3, 4, 5], [3, 1, 5, 2, 4], 6], expected: [[3, 1, 2, 5, 4], [], [3, 1, 2, 5, 4]] },
    ],
    hint: "Split cuts below a node when its value is smaller than the key and above it otherwise; merge undoes the cut.",
  },
  {
    id: "ds-342",
    title: "Splay Rotation Count",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Start with n nodes forming a right-leaning chain: node 0 is the root and node i has right child i + 1. Splay each accessed node to the root with bottom-up rotations: a zig is one rotation, a zig-zig or zig-zag is two. Return the total number of single rotations performed. Accesses are 0-based node ids.",
    starterCode: `def splay_rotation_count(n, accesses):
    # Your code here
    pass`,
    solution: `def splay_rotation_count(n, accesses):
    left = [None] * n
    right = [None] * n
    parent = [None] * n
    for i in range(n - 1):
        right[i] = i + 1
        parent[i + 1] = i
    rotations = [0]

    def rotate(x):
        p = parent[x]
        g = parent[p]
        if left[p] == x:
            b = right[x]
            right[x] = p
            left[p] = b
            if b is not None:
                parent[b] = p
        else:
            b = left[x]
            left[x] = p
            right[p] = b
            if b is not None:
                parent[b] = p
        parent[p] = x
        parent[x] = g
        if g is not None:
            if left[g] == p:
                left[g] = x
            else:
                right[g] = x
        rotations[0] += 1

    def splay(x):
        while parent[x] is not None:
            p = parent[x]
            g = parent[p]
            if g is None:
                rotate(x)
            elif (left[g] == p) == (left[p] == x):
                rotate(p)
                rotate(x)
            else:
                rotate(x)
                rotate(x)

    for a in accesses:
        splay(a)
    return rotations[0]`,
    testCases: [
      { input: [3, [2]], expected: 2 },
      { input: [4, [3]], expected: 3 },
      { input: [5, [4, 0]], expected: 6 },
      { input: [1, [0]], expected: 0 },
      { input: [4, [1, 2, 3]], expected: 3 },
    ],
    hint: "A zig-zig rotates the parent first, a zig-zag rotates the node twice; both count as two single rotations.",
  },
  {
    id: "ds-343",
    title: "Red-Black Tree Black Height",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Verify the black height of a binary tree. colors[i] is \"R\" or \"B\" and children[i] = [left, right] with -1 for an absent child. Every path from the root to a null child must contain the same number of black nodes; return that count (excluding the null child), or -1 when the paths disagree or the root is not black. An empty tree has black height 0.",
    starterCode: `def rb_black_height(colors, children):
    # Your code here
    pass`,
    solution: `def rb_black_height(colors, children):
    n = len(colors)
    if n == 0:
        return 0
    if colors[0] != "B":
        return -1

    def walk(node):
        if node == -1:
            return 0
        lh = walk(children[node][0])
        rh = walk(children[node][1])
        if lh == -1 or rh == -1 or lh != rh:
            return -1
        return lh + (1 if colors[node] == "B" else 0)

    return walk(0)`,
    testCases: [
      { input: [["B"], [[-1, -1]]], expected: 1 },
      { input: [["B", "R"], [[-1, 1], [-1, -1]]], expected: 1 },
      { input: [["B", "R", "R", "B", "B", "B", "B"], [[1, 2], [3, 4], [5, 6], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]], expected: 2 },
      { input: [["R", "B"], [[1, -1], [-1, -1]]], expected: -1 },
      { input: [["B", "B"], [[1, -1], [-1, -1]]], expected: -1 },
    ],
    hint: "Recursively return each subtree's black height, or -1 as soon as two paths disagree.",
  },
  {
    id: "ds-344",
    title: "B-Tree Key Bounds",
    category: "Data Structures",
    difficulty: "Easy",
    description: "For a B-tree with minimum degree t (CLRS definition), every non-root node holds between t - 1 and 2t - 1 keys, non-root internal nodes have between t and 2t children, and the root holds between 1 and 2t - 1 keys. Return [min_keys_non_root, max_keys, min_children_non_root, max_children]. Assume t >= 2.",
    starterCode: `def btree_key_bounds(t):
    # Your code here
    pass`,
    solution: `def btree_key_bounds(t):
    return [t - 1, 2 * t - 1, t, 2 * t]`,
    testCases: [
      { input: [2], expected: [1, 3, 2, 4] },
      { input: [3], expected: [2, 5, 3, 6] },
      { input: [10], expected: [9, 19, 10, 20] },
    ],
    hint: "The classic split-a-full-node rule exists precisely because 2t - 1 is the maximum key count.",
  },
  {
    id: "ds-345",
    title: "B+ Tree Leaf Level Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "For a B+ tree storing num_keys entries, leaves hold at most leaf_capacity keys and each internal node has at most fanout children. Fill leaves left to right, then group nodes level by level the same way. Return [leaf_count, internal_levels, total_nodes], where internal_levels counts the levels above the leaves and total_nodes includes every node. Return [0, 0, 0] when num_keys or leaf_capacity is 0.",
    starterCode: `def bplus_level_count(num_keys, leaf_capacity, fanout):
    # Your code here
    pass`,
    solution: `def bplus_level_count(num_keys, leaf_capacity, fanout):
    if num_keys <= 0 or leaf_capacity <= 0:
        return [0, 0, 0]
    leaves = (num_keys + leaf_capacity - 1) // leaf_capacity
    total = leaves
    levels = 0
    cur = leaves
    while cur > 1:
        cur = (cur + fanout - 1) // fanout
        total += cur
        levels += 1
    return [leaves, levels, total]`,
    testCases: [
      { input: [100, 10, 5], expected: [10, 2, 13] },
      { input: [5, 10, 4], expected: [1, 0, 1] },
      { input: [1, 1, 2], expected: [1, 0, 1] },
      { input: [1000, 50, 20], expected: [20, 1, 21] },
      { input: [0, 10, 4], expected: [0, 0, 0] },
    ],
    hint: "Each level above the leaves groups the previous level into fanout-sized parents with ceiling division.",
  },
  {
    id: "ds-346",
    title: "Skip List Expected Pointers",
    category: "Data Structures",
    difficulty: "Easy",
    description: "In a skip list each node is promoted to the next level with probability p, so the number of levels (pointers) per node is geometric with mean 1 / (1 - p). Return [expected_levels_per_node, expected_total_pointers] for n nodes as floats. Assume 0 < p < 1.",
    starterCode: `def skip_list_expected_pointers(n, p):
    # Your code here
    pass`,
    solution: `def skip_list_expected_pointers(n, p):
    per = 1.0 / (1.0 - p)
    return [per, n * per]`,
    testCases: [
      { input: [100, 0.5], expected: [2.0, 200.0] },
      { input: [10, 0.25], expected: [1.3333333333333333, 13.333333333333332] },
      { input: [0, 0.5], expected: [2.0, 0.0] },
      { input: [1000, 0.1], expected: [1.1111111111111112, 1111.111111111111] },
    ],
    hint: "The expected value of a geometric distribution with success probability 1 - p is 1 / (1 - p).",
  },
  {
    id: "ds-347",
    title: "Skip List Insert Levels",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Generate skip-list node levels: seed the random module with seed, then for each of n nodes start at level 1 and increment while random.random() < p. Return [levels, max_level] where levels is the generated list and max_level is 0 for no nodes. Assume 0 < p < 1.",
    starterCode: `def skip_list_levels(n, p, seed):
    # Your code here
    pass`,
    solution: `import random


def skip_list_levels(n, p, seed):
    random.seed(seed)
    levels = []
    for _ in range(n):
        lvl = 1
        while random.random() < p:
            lvl += 1
        levels.append(lvl)
    return [levels, max(levels) if levels else 0]`,
    testCases: [
      { input: [5, 0.5, 1], expected: [[2, 1, 4, 1, 3], 4] },
      { input: [8, 0.25, 42], expected: [[1, 2, 2, 1, 1, 2, 3, 3], 3] },
      { input: [0, 0.5, 7], expected: [[], 0] },
      { input: [10, 0.9, 3], expected: [[11, 21, 4, 5, 9, 2, 2, 4, 1, 9], 21] },
    ],
    hint: "random.seed at the start makes the promotion coin flips reproducible for a given seed.",
  },
  {
    id: "ds-348",
    title: "Heap Build Comparison Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Count element comparisons in the bottom-up heapify build of a min-heap. For each sift-down step, compare the current candidate with the left child, then with the right child when it exists. Return the total comparison count from building the heap (the heap itself is not returned).",
    starterCode: `def heap_build_comparisons(nums):
    # Your code here
    pass`,
    solution: `def heap_build_comparisons(nums):
    h = list(nums)
    n = len(h)
    comparisons = 0
    for start in range(n // 2 - 1, -1, -1):
        i = start
        while True:
            left = 2 * i + 1
            right = 2 * i + 2
            smallest = i
            if left < n:
                comparisons += 1
                if h[left] < h[smallest]:
                    smallest = left
            if right < n:
                comparisons += 1
                if h[right] < h[smallest]:
                    smallest = right
            if smallest == i:
                break
            h[i], h[smallest] = h[smallest], h[i]
            i = smallest
    return comparisons`,
    testCases: [
      { input: [[5, 4, 3, 2, 1]], expected: 6 },
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[2, 1, 4, 3, 6, 5]], expected: 7 },
    ],
    hint: "Count one comparison per child examined, even when the child is not smaller.",
  },
  {
    id: "ds-349",
    title: "D-ary Heap Height",
    category: "Data Structures",
    difficulty: "Easy",
    description: "A complete d-ary heap with n nodes has height h, the smallest integer such that 1 + d + ... + d^h >= n. Return the height in edges for n >= 0 and d >= 2; the height is 0 when n <= 1.",
    starterCode: `def dary_heap_height(n, d):
    # Your code here
    pass`,
    solution: `def dary_heap_height(n, d):
    if n <= 1:
        return 0
    h = 0
    count = 1
    while count < n:
        h += 1
        count += d ** h
    return h`,
    testCases: [
      { input: [10, 2], expected: 3 },
      { input: [9, 3], expected: 2 },
      { input: [1, 2], expected: 0 },
      { input: [0, 5], expected: 0 },
      { input: [8, 2], expected: 3 },
    ],
    hint: "Level k of a complete d-ary tree holds d^k nodes, so add powers of d until the capacity reaches n.",
  },
  {
    id: "ds-350",
    title: "Leftist Heap Merge Swap Count",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Build leftist heaps by inserting a_values and b_values one at a time with merge, then merge the two heaps together. In each recursive merge the smaller root is kept, its right child becomes the merge of its old right child with the other heap, and the node swaps its two children whenever the left null-path length is smaller than the right one. Return the total number of child swaps performed.",
    starterCode: `def leftist_merge_swaps(a_values, b_values):
    # Your code here
    pass`,
    solution: `def leftist_merge_swaps(a_values, b_values):
    swaps = [0]

    def merge(a, b):
        if a is None:
            return b
        if b is None:
            return a
        if a[0] > b[0]:
            a, b = b, a
        new_right = merge(a[2], b)
        node = [a[0], a[1], new_right, 0]
        lrank = node[1][3] if node[1] is not None else 0
        rrank = node[2][3] if node[2] is not None else 0
        if lrank < rrank:
            node[1], node[2] = node[2], node[1]
            swaps[0] += 1
        node[3] = (node[2][3] if node[2] is not None else 0) + 1
        return node

    def build(values):
        root = None
        for v in values:
            root = merge(root, [v, None, None, 1])
        return root

    first = build(a_values)
    second = build(b_values)
    merge(first, second)
    return swaps[0]`,
    testCases: [
      { input: [[3, 1], [2]], expected: 1 },
      { input: [[5], [4, 6]], expected: 1 },
      { input: [[], [1, 2]], expected: 1 },
      { input: [[2, 1], [4, 3]], expected: 2 },
    ],
    hint: "Each merge unwinds along the right spine; a swap restores the leftist property before returning.",
  },
  {
    id: "ds-351",
    title: "Binomial Heap Tree Orders",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Insert n nodes one at a time into a binomial heap. The heap contains one binomial tree for each set bit of n, whose order equals the bit position. Return [tree_count, orders] with orders listed from largest to smallest, or [0, []] for n = 0.",
    starterCode: `def binomial_heap_orders(n):
    # Your code here
    pass`,
    solution: `def binomial_heap_orders(n):
    orders = []
    bit = 0
    while (1 << bit) <= n:
        if (n >> bit) & 1:
            orders.append(bit)
        bit += 1
    orders.reverse()
    return [len(orders), orders]`,
    testCases: [
      { input: [13], expected: [3, [3, 2, 0]] },
      { input: [7], expected: [3, [2, 1, 0]] },
      { input: [1], expected: [1, [0]] },
      { input: [0], expected: [0, []] },
      { input: [64], expected: [1, [6]] },
    ],
    hint: "Merging equal-order trees is binary carry, so the tree orders are exactly the set bits of n.",
  },
  {
    id: "ds-352",
    title: "Fibonacci Heap Degree Bound",
    category: "Data Structures",
    difficulty: "Easy",
    description: "In a Fibonacci heap a node of degree d has subtree size at least F(d + 2), the (d+2)-th Fibonacci number with F(0) = 0 and F(1) = 1. Return the largest possible degree for n >= 1, and 0 when n <= 1.",
    starterCode: `def fib_heap_degree_bound(n):
    # Your code here
    pass`,
    solution: `def fib_heap_degree_bound(n):
    if n <= 1:
        return 0
    fib = [0, 1]
    while fib[-1] <= n:
        fib.append(fib[-1] + fib[-2])
    d = 0
    while d + 2 < len(fib) and fib[d + 2] <= n:
        d += 1
    return d - 1 if d > 0 else 0`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [4], expected: 2 },
      { input: [12], expected: 4 },
      { input: [100], expected: 9 },
      { input: [1000], expected: 14 },
    ],
    hint: "Plug small n into F(d + 2) <= n: the largest feasible d is the degree bound.",
  },
  {
    id: "ds-353",
    title: "Disjoint Sparse Table Range Minimum",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Build a disjoint sparse table for static range-minimum queries. Pad nums to a power of two, and for each level k precompute suffix minima on the left half and prefix minima on the right half of every block of size 2^(k+1). A query [l, r] with l < r combines the two entries at the level of the highest bit where l and r differ; l == r returns nums[l]. Return the answers to queries in order, and [] for an empty array.",
    starterCode: `def disjoint_sparse_table_min(nums, queries):
    # Your code here
    pass`,
    solution: `def disjoint_sparse_table_min(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    size = 1
    while size < n:
        size *= 2
    arr = list(nums) + [float("inf")] * (size - n)
    levels = []
    k = 1
    while (1 << k) <= size:
        block = 1 << k
        half = block >> 1
        table = [0] * size
        for start in range(0, size, block):
            mid = start + half - 1
            table[mid] = arr[mid]
            for i in range(mid - 1, start - 1, -1):
                table[i] = min(arr[i], table[i + 1])
            table[mid + 1] = arr[mid + 1]
            for i in range(mid + 2, start + block):
                table[i] = min(arr[i], table[i - 1])
        levels.append(table)
        k += 1
    out = []
    for l, r in queries:
        if l == r:
            out.append(nums[l])
            continue
        b = (l ^ r).bit_length() - 1
        out.append(min(levels[b][l], levels[b][r]))
    return out`,
    testCases: [
      { input: [[3, 1, 4, 1, 5, 9, 2, 6], [[0, 7], [1, 4], [2, 5], [0, 3], [4, 7], [2, 2]]], expected: [1, 1, 1, 1, 2, 4] },
      { input: [[7, 2, 9], [[0, 2], [0, 0], [1, 2], [2, 2]]], expected: [2, 7, 2, 9] },
      { input: [[5], [[0, 0]]], expected: [5] },
      { input: [[], []], expected: [] },
    ],
    hint: "The highest differing bit of l and r picks the level whose block split separates them, so two lookup values cover [l, r].",
  },
  {
    id: "ds-354",
    title: "Cartesian Tree Parent Array",
    category: "Data Structures",
    difficulty: "Medium",
    description: "Build the Cartesian tree of nums, a min-heap-by-value tree whose inorder traversal is nums. Equal values keep the left occurrence above the right one, as produced by a monotonic stack that pops while the stack top is strictly greater than the current value. Return the parent array with -1 at the root. An empty array returns [].",
    starterCode: `def cartesian_parent(nums):
    # Your code here
    pass`,
    solution: `def cartesian_parent(nums):
    n = len(nums)
    parent = [-1] * n
    stack = []
    for i, x in enumerate(nums):
        last = -1
        while stack and nums[stack[-1]] > x:
            last = stack.pop()
        if stack:
            parent[i] = stack[-1]
        if last != -1:
            parent[last] = i
        stack.append(i)
    return parent`,
    testCases: [
      { input: [[3, 1, 4, 2]], expected: [1, -1, 3, 1] },
      { input: [[1, 2, 3]], expected: [-1, 0, 1] },
      { input: [[3, 2, 1]], expected: [1, 2, -1] },
      { input: [[2, 2, 1]], expected: [2, 0, -1] },
      { input: [[5]], expected: [-1] },
    ],
    hint: "The stack holds the right spine of the tree built so far; popped nodes become the left subtree of the current node.",
  },
  {
    id: "ds-355",
    title: "Bracket Nesting Depth",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Scan a string of (), [], and {} characters. Return [max_depth, balanced] where depth counts currently open brackets and max_depth is its maximum, and balanced is True only when every opening bracket is closed by the matching type in order with nothing left over. An unmatched closing bracket is ignored for depth but makes balanced False.",
    starterCode: `def bracket_depth(s):
    # Your code here
    pass`,
    solution: `def bracket_depth(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    depth = 0
    max_depth = 0
    balanced = True
    for ch in s:
        if ch in "([{":
            stack.append(ch)
            depth += 1
            if depth > max_depth:
                max_depth = depth
        elif ch in pairs:
            if stack and stack[-1] == pairs[ch]:
                stack.pop()
                depth -= 1
            else:
                balanced = False
    if stack:
        balanced = False
    return [max_depth, balanced]`,
    testCases: [
      { input: ["(()())"], expected: [2, true] },
      { input: ["([{}])"], expected: [3, true] },
      { input: ["(()"], expected: [2, false] },
      { input: [")("], expected: [1, false] },
      { input: [""], expected: [0, true] },
    ],
    hint: "A closing bracket only reduces the depth when it matches the top of the stack.",
  },
];
