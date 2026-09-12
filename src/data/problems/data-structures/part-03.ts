import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-086",
    title: "Ring Buffer with Overwrite",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a circular ring buffer that overwrites its oldest element when full.\n\noperations contains \"write\" (values[i] is the value), \"read\" (returns the oldest value or None when empty), or \"to_list\" (records the contents from oldest to newest). Once capacity elements are present, each new write replaces the oldest element and advances the read pointer.\n\nReturn the list of recorded results.",
    starterCode: `def ring_buffer_overwrite(capacity, operations, values):
    # Your code here
    pass`,
    solution: `def ring_buffer_overwrite(capacity, operations, values):
    buf = [None] * capacity
    start = 0
    count = 0
    out = []
    for op, val in zip(operations, values):
        if op == "write":
            if count < capacity:
                buf[(start + count) % capacity] = val
                count += 1
            else:
                buf[start] = val
                start = (start + 1) % capacity
            out.append(None)
        elif op == "read":
            if count == 0:
                out.append(None)
            else:
                v = buf[start]
                start = (start + 1) % capacity
                count -= 1
                out.append(v)
        else:
            out.append([buf[(start + i) % capacity] for i in range(count)])
    return out`,
    testCases: [
      {
        input: [3, ["write", "write", "write", "to_list", "write", "to_list"], [1, 2, 3, 0, 4, 0]],
        expected: [null, null, null, [1, 2, 3], null, [2, 3, 4]],
      },
      {
        input: [2, ["write", "write", "write", "read", "read", "read"], [1, 2, 3, 0, 0, 0]],
        expected: [null, null, null, 2, 3, null],
      },
      { input: [1, ["write", "write", "to_list", "read"], [5, 6, 0, 0]], expected: [null, null, [6], 6] },
      { input: [2, ["read", "to_list"], [0, 0]], expected: [null, []] },
    ],
    hint: "Track a start index and a count; the next write position is (start + count) % capacity.",
  },
  {
    id: "ds-087",
    title: "Next Smaller Element",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "For each element of a list, find the next strictly smaller element to its right.\n\nUse a monotonic increasing stack of indices; when a new value is smaller than the value at the index on top, it is the next smaller element for that index.\n\nReturn a list where result[i] is the next smaller value, or -1 when none exists.",
    starterCode: `def next_smaller(nums):
    # Your code here
    pass`,
    solution: `def next_smaller(nums):
    out = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] > x:
            out[stack.pop()] = x
        stack.append(i)
    return out`,
    testCases: [
      { input: [[2, 1, 2, 4, 3]], expected: [1, -1, -1, 3, -1] },
      { input: [[1, 2, 3, 4]], expected: [-1, -1, -1, -1] },
      { input: [[4, 3, 2, 1]], expected: [3, 2, 1, -1] },
      { input: [[]], expected: [] },
    ],
    hint: "Keep indices with increasing values; a smaller value arriving resolves every larger top.",
  },
  {
    id: "ds-088",
    title: "Stack Permutations Validity",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Determine whether a sequence can be produced as a stack permutation of another sequence.\n\npushed is the order in which values are pushed and popped is the proposed pop order. Simulate with a stack: push each value, then pop while the top matches the next expected value.\n\nReturn True when the whole popped sequence is produced and the stack ends empty, otherwise False.",
    starterCode: `def valid_stack_permutations(pushed, popped):
    # Your code here
    pass`,
    solution: `def valid_stack_permutations(pushed, popped):
    stack = []
    j = 0
    for x in pushed:
        stack.append(x)
        while stack and j < len(popped) and stack[-1] == popped[j]:
            stack.pop()
            j += 1
    return j == len(popped) and not stack`,
    testCases: [
      { input: [[1, 2, 3], [3, 2, 1]], expected: true },
      { input: [[1, 2, 3], [3, 1, 2]], expected: false },
      { input: [[1, 2], [2, 1]], expected: true },
      { input: [[], []], expected: true },
      { input: [[1, 2, 3, 4], [2, 1, 4, 3]], expected: true },
    ],
    hint: "Greedily pop whenever the stack top equals the next value of popped; at the end the stack must be empty.",
  },
  {
    id: "ds-089",
    title: "Histogram Largest Rectangle via Monotonic Stack",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Find the area of the largest rectangle that fits inside a histogram.\n\nheights[i] is the bar height at position i and every bar has width 1. Use a monotonic increasing stack of indices; for each popped bar the rectangle extends to the previous smaller bar on the left and the current smaller bar on the right.\n\nReturn the maximum area (0 for an empty histogram).",
    starterCode: `def largest_rectangle(heights):
    # Your code here
    pass`,
    solution: `def largest_rectangle(heights):
    best = 0
    stack = []
    for i, h in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            area = height * (i - left - 1)
            if area > best:
                best = area
        stack.append(i)
    return best`,
    testCases: [
      { input: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { input: [[2, 4]], expected: 4 },
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 5 },
      { input: [[3, 3, 3, 3]], expected: 12 },
    ],
    hint: "Appending a zero height forces every remaining bar to be popped and evaluated.",
  },
  {
    id: "ds-090",
    title: "Daily Temperatures",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "For each day, return how many days must pass until a warmer temperature.\n\ntemps holds the daily temperatures. Use a monotonic stack of indices with decreasing temperatures; a warmer day resolves every colder day waiting on the stack.\n\nReturn a list where result[i] is the wait in days, or 0 when no warmer day exists later.",
    starterCode: `def daily_temperatures(temps):
    # Your code here
    pass`,
    solution: `def daily_temperatures(temps):
    out = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            out[j] = i - j
        stack.append(i)
    return out`,
    testCases: [
      { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { input: [[30, 30, 30]], expected: [0, 0, 0] },
      { input: [[90, 80, 70]], expected: [0, 0, 0] },
      { input: [[]], expected: [] },
    ],
    hint: "Keep unresolved days on the stack until a warmer temperature arrives.",
  },
  {
    id: "ds-091",
    title: "Stock Span",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the stock span for each day.\n\nThe span of day i is the number of consecutive days ending at day i whose price is less than or equal to prices[i]. Maintain a stack of indices with strictly decreasing prices, popping smaller or equal prices before answering.\n\nReturn the list of spans.",
    starterCode: `def stock_span(prices):
    # Your code here
    pass`,
    solution: `def stock_span(prices):
    out = []
    stack = []
    for i, p in enumerate(prices):
        while stack and prices[stack[-1]] <= p:
            stack.pop()
        out.append(i - stack[-1] if stack else i + 1)
        stack.append(i)
    return out`,
    testCases: [
      { input: [[100, 80, 60, 70, 60, 75, 85]], expected: [1, 1, 1, 2, 1, 4, 6] },
      { input: [[10, 20, 30]], expected: [1, 2, 3] },
      { input: [[30, 20, 10]], expected: [1, 1, 1] },
      { input: [[]], expected: [] },
    ],
    hint: "The span is the distance to the nearest previous day with a strictly higher price.",
  },
  {
    id: "ds-092",
    title: "Remove K Digits with Monotonic Stack",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Remove exactly k digits from a non-negative integer string to make the smallest possible number.\n\nnum is a string of digits and k is the number of digits to remove. Use a monotonic increasing stack: while removals remain and the new digit is smaller than the stack top, pop. Then drop remaining digits from the end if needed, and strip leading zeros.\n\nReturn the result as a string, or \"0\" when the result is empty.",
    starterCode: `def remove_k_digits(num, k):
    # Your code here
    pass`,
    solution: `def remove_k_digits(num, k):
    stack = []
    for ch in num:
        while k > 0 and stack and stack[-1] > ch:
            stack.pop()
            k -= 1
        stack.append(ch)
    while k > 0 and stack:
        stack.pop()
        k -= 1
    result = "".join(stack).lstrip("0")
    return result if result else "0"`,
    testCases: [
      { input: ["1432219", 3], expected: "1219" },
      { input: ["10200", 1], expected: "200" },
      { input: ["10", 2], expected: "0" },
      { input: ["112", 1], expected: "11" },
      { input: ["4321", 2], expected: "21" },
    ],
    hint: "A larger digit followed by a smaller one should be removed first.",
  },
  {
    id: "ds-093",
    title: "Decode String",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Decode a string with repeated blocks written in k[encoded] form.\n\nThe encoded part inside brackets is repeated k times and blocks may nest. Use a stack of previously built strings and repeat counts: digits accumulate into the current count, an opening bracket saves the state, and a closing bracket pops and repeats the current string.\n\nReturn the fully decoded string.",
    starterCode: `def decode_string(s):
    # Your code here
    pass`,
    solution: `def decode_string(s):
    counts = []
    parts = []
    cur = ""
    num = 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            counts.append(num)
            parts.append(cur)
            num = 0
            cur = ""
        elif ch == "]":
            repeat = counts.pop()
            prev = parts.pop()
            cur = prev + cur * repeat
        else:
            cur += ch
    return cur`,
    testCases: [
      { input: ["3[a]2[bc]"], expected: "aaabcbc" },
      { input: ["3[a2[c]]"], expected: "accaccacc" },
      { input: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
      { input: ["10[a]"], expected: "aaaaaaaaaa" },
      { input: ["abc"], expected: "abc" },
    ],
    hint: "Push the string built so far and the repeat count when entering a bracket; multiply on exit.",
  },
  {
    id: "ds-094",
    title: "Simplify Path",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simplify a Unix-style absolute path to its canonical form.\n\nSplit on \"/\"; skip empty parts and \".\", pop the stack for \"..\", and push ordinary names. The canonical path always starts with a single slash and never ends with one except at the root.\n\nReturn the canonical path.",
    starterCode: `def simplify_path(path):
    # Your code here
    pass`,
    solution: `def simplify_path(path):
    stack = []
    for part in path.split("/"):
        if part == "" or part == ".":
            continue
        if part == "..":
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return "/" + "/".join(stack)`,
    testCases: [
      { input: ["/home/"], expected: "/home" },
      { input: ["/../"], expected: "/" },
      { input: ["/home//foo/"], expected: "/home/foo" },
      { input: ["/a/./b/../../c/"], expected: "/c" },
      { input: ["/a/../../b/../c//.//"], expected: "/c" },
    ],
    hint: "A \"..\" at the root has no effect because the stack is already empty.",
  },
  {
    id: "ds-095",
    title: "Basic Calculator I",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Evaluate a basic arithmetic expression containing +, -, parentheses, and spaces.\n\nDigits form multi-digit numbers, and a sign before a parenthesis applies to the whole group. Keep a current result, a pending sign, and a stack of outer results and signs. Subtraction is handled by adding the negated value.\n\nReturn the integer value of the expression.",
    starterCode: `def basic_calculator(s):
    # Your code here
    pass`,
    solution: `def basic_calculator(s):
    result = 0
    num = 0
    sign = 1
    stack = []
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            result += sign * num
            num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            stack.append(result)
            stack.append(sign)
            result = 0
            sign = 1
        elif ch == ")":
            result += sign * num
            num = 0
            prev_sign = stack.pop()
            prev_result = stack.pop()
            result = prev_result + prev_sign * result
    result += sign * num
    return result`,
    testCases: [
      { input: ["1 + 1"], expected: 2 },
      { input: [" 2-1 + 2 "], expected: 3 },
      { input: ["(1+(4+5+2)-3)+(6+8)"], expected: 23 },
      { input: ["-2+ 1"], expected: -1 },
      { input: ["0"], expected: 0 },
    ],
    hint: "On an opening parenthesis push the result so far and the current sign, then start fresh.",
  },
  {
    id: "ds-096",
    title: "Tree Level Sums",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the sum of values at each level of a binary tree given in level order.\n\ntree is a LeetCode-style list with None marking missing nodes; the children of index i are at 2*i + 1 and 2*i + 2. Traverse level by level and add the real values.\n\nReturn one sum per non-empty level ([] for an empty tree).",
    starterCode: `def level_sums(tree):
    # Your code here
    pass`,
    solution: `def level_sums(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return []
    out = []
    level = [0]
    while level:
        total = 0
        found = False
        nxt = []
        for i in level:
            if i >= n or tree[i] is None:
                continue
            found = True
            total += tree[i]
            nxt.append(2 * i + 1)
            nxt.append(2 * i + 2)
        if not found:
            break
        out.append(total)
        level = nxt
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, null, 6]], expected: [1, 5, 10] },
      { input: [[]], expected: [] },
      { input: [[5]], expected: [5] },
      { input: [[1, null, 3]], expected: [1, 3] },
    ],
    hint: "Collect child indices from non-None nodes only; stop when a level contributes nothing.",
  },
  {
    id: "ds-097",
    title: "Count Complete Tree Nodes",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the nodes of a complete binary tree given in level order.\n\ntree is a list where real values are nodes and None marks missing positions; trailing Nones may be omitted.\n\nReturn the number of non-None entries.",
    starterCode: `def count_complete_nodes(tree):
    # Your code here
    pass`,
    solution: `def count_complete_nodes(tree):
    return sum(1 for x in tree if x is not None)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6]], expected: 6 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[1, null, 2]], expected: 2 },
    ],
    hint: "In a complete tree every value present in the level-order list is a node.",
  },
  {
    id: "ds-098",
    title: "Sum of Left Leaves",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Sum the values of all left leaves in a binary tree given in level order.\n\nA left leaf is a node that is the left child of its parent and has no children of its own. tree is a LeetCode-style list with None marking missing nodes.\n\nReturn the sum, or 0 when there are no left leaves.",
    starterCode: `def sum_left_leaves(tree):
    # Your code here
    pass`,
    solution: `def sum_left_leaves(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return 0
    total = 0
    for i, val in enumerate(tree):
        if val is None:
            continue
        left = 2 * i + 1
        if left < n and tree[left] is not None:
            ll = 2 * left + 1
            lr = 2 * left + 2
            is_leaf = (ll >= n or tree[ll] is None) and (lr >= n or tree[lr] is None)
            if is_leaf:
                total += tree[left]
    return total`,
    testCases: [
      { input: [[3, 9, 20, null, null, 15, 7]], expected: 24 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 0 },
      { input: [[1, 2, null, 3]], expected: 3 },
    ],
    hint: "For each left child, check that it has no children of its own.",
  },
  {
    id: "ds-099",
    title: "Tree Right View",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the right-side view of a binary tree, from top to bottom.\n\ntree is a level-order list with None marking missing nodes; children of index i are at 2*i + 1 and 2*i + 2. The right view takes the rightmost existing node at each depth.\n\nReturn the list of visible values.",
    starterCode: `def right_view(tree):
    # Your code here
    pass`,
    solution: `def right_view(tree):
    if not tree or tree[0] is None:
        return []
    out = []
    level = [0]
    while level:
        values = [(i, tree[i]) for i in level if i < len(tree) and tree[i] is not None]
        if not values:
            break
        out.append(values[-1][1])
        nxt = []
        for i, _ in values:
            nxt.append(2 * i + 1)
            nxt.append(2 * i + 2)
        level = nxt
    return out`,
    testCases: [
      { input: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { input: [[1, 2]], expected: [1, 2] },
      { input: [[]], expected: [] },
      { input: [[1, 2, 3, 4]], expected: [1, 3, 4] },
    ],
    hint: "Process each level left to right and keep the last real value seen.",
  },
  {
    id: "ds-100",
    title: "Tree Boundary Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count the nodes on the boundary of a binary tree.\n\ntree is a level-order list with None marking missing nodes. The boundary consists of the root, the left boundary (excluding leaves), all leaves from left to right, and the right boundary (excluding leaves).\n\nReturn the number of boundary nodes.",
    starterCode: `def count_boundary(tree):
    # Your code here
    pass`,
    solution: `def count_boundary(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return 0

    def get(i):
        return tree[i] if i < n else None

    def is_leaf(i):
        if i >= n or tree[i] is None:
            return False
        return get(2 * i + 1) is None and get(2 * i + 2) is None

    count = 0
    if not is_leaf(0):
        count += 1
    i = 1
    while i < n and tree[i] is not None:
        if not is_leaf(i):
            count += 1
        left = 2 * i + 1
        if left < n and tree[left] is not None:
            i = left
        else:
            i = 2 * i + 2
    i = 2
    while i < n and tree[i] is not None:
        if not is_leaf(i):
            count += 1
        right = 2 * i + 2
        if right < n and tree[right] is not None:
            i = right
        else:
            i = 2 * i + 1
    for i in range(n):
        if is_leaf(i):
            count += 1
    return count`,
    testCases: [
      { input: [[1, 2, 3, null, 5, null, 4]], expected: 5 },
      { input: [[1, 2, 3, 4, 5, 6, 7]], expected: 7 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[1, 2]], expected: 2 },
    ],
    hint: "Count the root, the non-leaf nodes on the left and right spines, and every leaf once.",
  },
  {
    id: "ds-101",
    title: "Tree Top View Keys",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the top view of a binary tree as a list of keys.\n\ntree is a level-order list with None marking missing nodes. Assign horizontal distances to nodes (root 0, left child one less, right child one more); the first node seen at each distance in a breadth-first traversal is the top view.\n\nReturn the visible values ordered from the leftmost distance to the rightmost.",
    starterCode: `def top_view(tree):
    # Your code here
    pass`,
    solution: `def top_view(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return []
    first = {}
    queue = [(0, 0)]
    while queue:
        idx, dist = queue.pop(0)
        if idx >= n or tree[idx] is None:
            continue
        if dist not in first:
            first[dist] = tree[idx]
        queue.append((2 * idx + 1, dist - 1))
        queue.append((2 * idx + 2, dist + 1))
    return [first[d] for d in sorted(first)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7]], expected: [4, 2, 1, 3, 7] },
      { input: [[]], expected: [] },
      { input: [[1, 2]], expected: [2, 1] },
      { input: [[1, null, 2, null, null, 3]], expected: [1, 2] },
    ],
    hint: "BFS guarantees that the first node seen at a horizontal distance is the topmost.",
  },
  {
    id: "ds-102",
    title: "BST Iterator",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an iterator over the inorder traversal of a binary search tree.\n\nvalues are inserted in order into a BST (duplicates ignored). operations contains \"next\" and \"has_next\": next returns the next value in ascending order and has_next reports whether another value remains. Keep the left spine of the tree on a stack so each call is O(1) amortized.\n\nReturn the list of recorded results.",
    starterCode: `def bst_iterator_ops(values, operations):
    # Your code here
    pass`,
    solution: `def bst_iterator_ops(values, operations):
    def insert(root, v):
        if root is None:
            return [v, None, None]
        if v < root[0]:
            root[1] = insert(root[1], v)
        elif v > root[0]:
            root[2] = insert(root[2], v)
        return root

    root = None
    for v in values:
        root = insert(root, v)
    stack = []
    cur = root
    while cur is not None:
        stack.append(cur)
        cur = cur[1]
    out = []
    for op in operations:
        if op == "has_next":
            out.append(len(stack) > 0)
        else:
            node = stack.pop()
            nxt = node[2]
            while nxt is not None:
                stack.append(nxt)
                nxt = nxt[1]
            out.append(node[0])
    return out`,
    testCases: [
      {
        input: [
          [7, 3, 15, 9, 20],
          ["has_next", "next", "next", "next", "has_next", "next", "next", "has_next"],
        ],
        expected: [true, 3, 7, 9, true, 15, 20, false],
      },
      { input: [[1], ["next", "has_next"]], expected: [1, false] },
      { input: [[], ["has_next"]], expected: [false] },
      { input: [[2, 1, 3], ["next", "next", "next"]], expected: [1, 2, 3] },
    ],
    hint: "Initialize the stack with the left spine and refill it from the right child's left spine.",
  },
  {
    id: "ds-103",
    title: "BST Successor and Predecessor",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the successor and predecessor of a key in a binary search tree.\n\nInsert values in order (duplicates ignored). The successor is the smallest value strictly greater than key and the predecessor is the largest value strictly smaller. Walk from the root keeping candidates, and when the key is found take the minimum of its right subtree and the maximum of its left subtree.\n\nReturn [successor, predecessor] with None for missing entries.",
    starterCode: `def bst_successor_predecessor(values, key):
    # Your code here
    pass`,
    solution: `def bst_successor_predecessor(values, key):
    def insert(root, v):
        if root is None:
            return [v, None, None]
        if v < root[0]:
            root[1] = insert(root[1], v)
        elif v > root[0]:
            root[2] = insert(root[2], v)
        return root

    root = None
    for v in values:
        root = insert(root, v)
    succ = None
    pred = None
    node = root
    while node is not None:
        if key < node[0]:
            succ = node[0]
            node = node[1]
        elif key > node[0]:
            pred = node[0]
            node = node[2]
        else:
            left = node[1]
            while left is not None:
                pred = left[0]
                left = left[2]
            right = node[2]
            while right is not None:
                succ = right[0]
                right = right[1]
            break
    return [succ, pred]`,
    testCases: [
      { input: [[20, 8, 22, 4, 12, 10, 14], 8], expected: [10, 4] },
      { input: [[20, 8, 22, 4, 12, 10, 14], 14], expected: [20, 12] },
      { input: [[20, 8, 22, 4, 12, 10, 14], 25], expected: [null, 22] },
      { input: [[5], 5], expected: [null, null] },
      { input: [[], 3], expected: [null, null] },
    ],
    hint: "Ancestors passed while descending left are successor candidates; those passed descending right are predecessor candidates.",
  },
  {
    id: "ds-104",
    title: "BST Lowest Common Ancestor",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the lowest common ancestor of two values in a binary search tree.\n\nInsert values in order (duplicates ignored). Starting at the root, descend left while both values are smaller and right while both are larger; the first node that is not on the same side is the LCA. If either value is missing return None.\n\nReturn the value of the LCA.",
    starterCode: `def bst_lca(values, p, q):
    # Your code here
    pass`,
    solution: `def bst_lca(values, p, q):
    def insert(root, v):
        if root is None:
            return [v, None, None]
        if v < root[0]:
            root[1] = insert(root[1], v)
        elif v > root[0]:
            root[2] = insert(root[2], v)
        return root

    root = None
    for v in values:
        root = insert(root, v)

    def contains(node, v):
        while node is not None:
            if node[0] == v:
                return True
            node = node[1] if v < node[0] else node[2]
        return False

    if not contains(root, p) or not contains(root, q):
        return None
    node = root
    while node is not None:
        if p < node[0] and q < node[0]:
            node = node[1]
        elif p > node[0] and q > node[0]:
            node = node[2]
        else:
            return node[0]
    return None`,
    testCases: [
      { input: [[6, 2, 8, 0, 4, 7, 9, 3, 5], 2, 8], expected: 6 },
      { input: [[6, 2, 8, 0, 4, 7, 9, 3, 5], 2, 4], expected: 2 },
      { input: [[6, 2, 8, 0, 4, 7, 9, 3, 5], 3, 5], expected: 4 },
      { input: [[5], 5, 5], expected: 5 },
      { input: [[3, 1], 4, 1], expected: null },
    ],
    hint: "In a BST the split point where the two search paths diverge is the lowest common ancestor.",
  },
  {
    id: "ds-105",
    title: "Tree Vertical Order Keys",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Group the values of a binary tree by vertical column.\n\ntree is a level-order list with None marking missing nodes. Assign each node a horizontal distance (root 0, left child one less, right child one more) and collect nodes column by column, ordered by level and then left to right within a column.\n\nReturn a list of columns from leftmost to rightmost.",
    starterCode: `def vertical_order(tree):
    # Your code here
    pass`,
    solution: `def vertical_order(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return []
    cols = {}
    queue = [(0, 0)]
    while queue:
        idx, dist = queue.pop(0)
        if idx >= n or tree[idx] is None:
            continue
        cols.setdefault(dist, []).append(tree[idx])
        queue.append((2 * idx + 1, dist - 1))
        queue.append((2 * idx + 2, dist + 1))
    return [cols[d] for d in sorted(cols)]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7]], expected: [[4], [2], [1, 5, 6], [3], [7]] },
      { input: [[]], expected: [] },
      { input: [[1, 2]], expected: [[2], [1]] },
      { input: [[1, 2, 3]], expected: [[2], [1], [3]] },
    ],
    hint: "BFS visits nodes level by level, which matches the required ordering inside each column.",
  },
  {
    id: "ds-106",
    title: "Serialize Binary Tree",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Serialize a binary tree into a preorder list with explicit None markers.\n\ntree is a LeetCode-style level-order list with None marking missing nodes. Visit the root, then the left subtree, then the right subtree, appending None whenever a child is missing. An empty tree serializes to [].\n\nReturn the preorder serialization.",
    starterCode: `def serialize_tree(tree):
    # Your code here
    pass`,
    solution: `def serialize_tree(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return []
    out = []
    stack = [0]
    while stack:
        i = stack.pop()
        if i >= n or tree[i] is None:
            out.append(None)
            continue
        out.append(tree[i])
        stack.append(2 * i + 2)
        stack.append(2 * i + 1)
    return out`,
    testCases: [
      { input: [[1, 2, 3]], expected: [1, 2, null, null, 3, null, null] },
      { input: [[1]], expected: [1, null, null] },
      { input: [[]], expected: [] },
      { input: [[1, null, 2]], expected: [1, null, 2, null, null] },
    ],
    hint: "Push the right child before the left so the left subtree is processed first.",
  },
  {
    id: "ds-107",
    title: "Deserialize Binary Tree",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Rebuild a binary tree from its preorder serialization and return it in level-order form.\n\ndata is a preorder list produced with explicit None markers for missing children. Reconstruct the tree recursively, then emit a LeetCode-style level-order list with None gaps and trailing Nones trimmed. An empty or [None] input returns [].\n\nReturn the level-order representation.",
    starterCode: `def deserialize_tree(data):
    # Your code here
    pass`,
    solution: `def deserialize_tree(data):
    if not data or data[0] is None:
        return []
    pos = [0]

    def build():
        if pos[0] >= len(data) or data[pos[0]] is None:
            pos[0] += 1
            return None
        node = [data[pos[0]], None, None]
        pos[0] += 1
        node[1] = build()
        node[2] = build()
        return node

    root = build()
    out = [root[0]]
    queue = [root]
    while queue:
        node = queue.pop(0)
        for child in (node[1], node[2]):
            if child is None:
                out.append(None)
            else:
                out.append(child[0])
                queue.append(child)
    while out and out[-1] is None:
        out.pop()
    return out`,
    testCases: [
      { input: [[1, 2, null, null, 3, null, null]], expected: [1, 2, 3] },
      { input: [[1, null, null]], expected: [1] },
      { input: [[]], expected: [] },
      { input: [[1, null, 2, null, null]], expected: [1, null, 2] },
    ],
    hint: "A position pointer that advances on every value or None makes the recursive rebuild simple.",
  },
  {
    id: "ds-108",
    title: "Tree Path Sum II Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count all downward paths in a binary tree that sum to a target value.\n\nA path may start and end at any nodes but must always move from parent to child. tree is a level-order list with None marking missing nodes. Use prefix sums with backtracking: at each node count how many earlier prefix sums equal current_sum minus target.\n\nReturn the number of such paths.",
    starterCode: `def count_paths_with_sum(tree, target):
    # Your code here
    pass`,
    solution: `def count_paths_with_sum(tree, target):
    n = len(tree)
    if n == 0:
        return 0
    counts = {0: 1}

    def walk(i, running):
        if i >= n or tree[i] is None:
            return 0
        running += tree[i]
        total = counts.get(running - target, 0)
        counts[running] = counts.get(running, 0) + 1
        total += walk(2 * i + 1, running)
        total += walk(2 * i + 2, running)
        counts[running] -= 1
        if counts[running] == 0:
            del counts[running]
        return total

    return walk(0, 0)`,
    testCases: [
      { input: [[10, 5, -3, 3, 2, null, 11], 8], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 2 },
      { input: [[], 5], expected: 0 },
      { input: [[5], 5], expected: 1 },
      { input: [[1], 2], expected: 0 },
    ],
    hint: "Remove a prefix sum from the map when leaving a node so only the current root-to-node path counts.",
  },
  {
    id: "ds-109",
    title: "Binary Tree Max Width",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Return the maximum width of a binary tree.\n\ntree is a level-order list with None marking missing nodes. The width of a level is the distance between its leftmost and rightmost nodes counting the missing positions between them, using the array indices as positions.\n\nReturn the largest width over all levels (0 for an empty tree).",
    starterCode: `def max_width(tree):
    # Your code here
    pass`,
    solution: `def max_width(tree):
    n = len(tree)
    if n == 0 or tree[0] is None:
        return 0
    best = 0
    level = [0]
    while level:
        width = level[-1] - level[0] + 1
        if width > best:
            best = width
        nxt = []
        for i in level:
            left = 2 * i + 1
            right = 2 * i + 2
            if left < n and tree[left] is not None:
                nxt.append(left)
            if right < n and tree[right] is not None:
                nxt.append(right)
        level = nxt
    return best`,
    testCases: [
      { input: [[1, 3, 2, 5, 3, null, 9]], expected: 4 },
      { input: [[1, 3, null, 5, 3]], expected: 2 },
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
    ],
    hint: "Use the heap indices themselves as x-coordinates; the width is last minus first plus one.",
  },
  {
    id: "ds-110",
    title: "Tree is Subtree Check",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Check whether one binary tree is a subtree of another.\n\ntree and sub are level-order lists with None marking missing nodes. sub is a subtree when some node of tree roots a structurally identical tree with the same values.\n\nReturn True if sub is a subtree, otherwise False. An empty sub counts as a subtree and an empty tree does not contain a non-empty sub.",
    starterCode: `def is_subtree(tree, sub):
    # Your code here
    pass`,
    solution: `def is_subtree(tree, sub):
    n = len(tree)
    m = len(sub)
    if m == 0 or sub[0] is None:
        return True
    if n == 0 or tree[0] is None:
        return False

    def same(i, j):
        a = tree[i] if i < n else None
        b = sub[j] if j < m else None
        if a is None and b is None:
            return True
        if a is None or b is None or a != b:
            return False
        return same(2 * i + 1, 2 * j + 1) and same(2 * i + 2, 2 * j + 2)

    def dfs(i):
        if i >= n or tree[i] is None:
            return False
        if same(i, 0):
            return True
        return dfs(2 * i + 1) or dfs(2 * i + 2)

    return dfs(0)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], [2, 4, 5]], expected: true },
      { input: [[1, 2, 3, 4, 5], [2, 4]], expected: false },
      { input: [[1, 2, 3], [1, 2, 3]], expected: true },
      { input: [[1, 2, 3], [4]], expected: false },
      { input: [[1], [1]], expected: true },
    ],
    hint: "A missing node in sub must line up with a missing node in tree, not match anything.",
  },
  {
    id: "ds-111",
    title: "Nested List Flatten",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Flatten a nested list of integers into a single list of integers.\n\nnested is a list whose elements are either integers or other nested lists. Flatten depth-first, preserving the left-to-right order.\n\nReturn the flat list.",
    starterCode: `def flatten_nested(nested):
    # Your code here
    pass`,
    solution: `def flatten_nested(nested):
    out = []
    for item in nested:
        if isinstance(item, list):
            out.extend(flatten_nested(item))
        else:
            out.append(item)
    return out`,
    testCases: [
      { input: [[1, [2, 3], 4]], expected: [1, 2, 3, 4] },
      { input: [[]], expected: [] },
      { input: [[[1, 2], [3, [4, 5]]]], expected: [1, 2, 3, 4, 5] },
      { input: [[[[]]]], expected: [] },
    ],
    hint: "Recurse when the element is a list and append otherwise.",
  },
  {
    id: "ds-112",
    title: "Flatten Nested List Iterator",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate an iterator that flattens a nested list lazily.\n\nnested is a list whose elements are integers or nested lists; operations contains \"next\" and \"has_next\". next returns the next integer in flattened order and has_next reports whether more remain. The iterator is consumed in order.\n\nReturn the list of recorded results.",
    starterCode: `def nested_iterator_ops(nested, operations):
    # Your code here
    pass`,
    solution: `def nested_iterator_ops(nested, operations):
    flat = []

    def walk(items):
        for item in items:
            if isinstance(item, list):
                walk(item)
            else:
                flat.append(item)

    walk(nested)
    pos = [0]
    out = []
    for op in operations:
        if op == "has_next":
            out.append(pos[0] < len(flat))
        else:
            out.append(flat[pos[0]])
            pos[0] += 1
    return out`,
    testCases: [
      {
        input: [[1, [2, 3], 4], ["has_next", "next", "next", "has_next", "next", "next", "has_next"]],
        expected: [true, 1, 2, true, 3, 4, false],
      },
      { input: [[], ["has_next"]], expected: [false] },
      { input: [[[[1]]], ["next", "has_next"]], expected: [1, false] },
      { input: [[[1, 2]], ["next", "next"]], expected: [1, 2] },
    ],
    hint: "You may flatten eagerly into a list and then serve it with a position pointer.",
  },
  {
    id: "ds-113",
    title: "Trie Wildcard Search",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a trie whose search supports the wildcard character \".\" matching any single letter.\n\noperations contains \"insert\" or \"search\"; words provides the argument. insert records None and search records whether a stored word matches, where each \".\" in the pattern may stand for any character. Matching uses recursion that branches on wildcards.\n\nReturn the list of recorded results.",
    starterCode: `def wildcard_trie_ops(operations, words):
    # Your code here
    pass`,
    solution: `def wildcard_trie_ops(operations, words):
    root = {}
    out = []

    def match(node, w, i):
        if i == len(w):
            return node.get("end", False) is True
        ch = w[i]
        if ch == ".":
            for key in node:
                if key != "end" and match(node[key], w, i + 1):
                    return True
            return False
        if ch not in node:
            return False
        return match(node[ch], w, i + 1)

    for op, w in zip(operations, words):
        if op == "insert":
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["end"] = True
            out.append(None)
        else:
            out.append(match(root, w, 0))
    return out`,
    testCases: [
      { input: [["insert", "search", "search"], ["bad", "bad", ".ad"]], expected: [null, true, true] },
      {
        input: [["insert", "insert", "search", "search"], ["mad", "dad", ".ad", "b.."]],
        expected: [null, null, true, false],
      },
      { input: [["insert", "search"], ["a", "."]], expected: [null, true] },
      { input: [["search"], ["."]], expected: [false] },
    ],
    hint: "A dot explores every child; the end marker is not a child character.",
  },
  {
    id: "ds-114",
    title: "Trie Longest Word Building",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the longest word that can be built one character at a time from the given words.\n\nA word is buildable when every proper prefix of it is also in the list. Ties on length are broken by choosing the lexicographically smallest word.\n\nReturn the longest buildable word, or \"\" when none exists.",
    starterCode: `def longest_word_built(words):
    # Your code here
    pass`,
    solution: `def longest_word_built(words):
    wordset = set(words)
    best = ""
    for w in words:
        ok = True
        for k in range(1, len(w)):
            if w[:k] not in wordset:
                ok = False
                break
        if ok:
            if len(w) > len(best) or (len(w) == len(best) and w < best):
                best = w
    return best`,
    testCases: [
      { input: [["w", "wo", "wor", "worl", "world"]], expected: "world" },
      {
        input: [["a", "banana", "app", "appl", "ap", "apply", "apple"]],
        expected: "apple",
      },
      { input: [["a", "ab", "abc"]], expected: "abc" },
      { input: [[]], expected: "" },
      { input: [["b", "ba"]], expected: "ba" },
    ],
    hint: "A single-letter word is always buildable if it appears in the list.",
  },
  {
    id: "ds-115",
    title: "Suffix Trie Count Distinct Substrings",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Count the distinct substrings of a string using a suffix trie.\n\nInsert every suffix of s into a trie. Each newly created node corresponds to one distinct substring, so counting created nodes counts distinct substrings, excluding the empty substring.\n\nReturn the number of distinct substrings.",
    starterCode: `def count_distinct_substrings(s):
    # Your code here
    pass`,
    solution: `def count_distinct_substrings(s):
    root = {}
    count = 0
    for i in range(len(s)):
        node = root
        for j in range(i, len(s)):
            ch = s[j]
            if ch not in node:
                node[ch] = {}
                count += 1
            node = node[ch]
    return count`,
    testCases: [
      { input: ["aba"], expected: 5 },
      { input: ["aaa"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["abc"], expected: 6 },
      { input: ["abab"], expected: 7 },
    ],
    hint: "A substring is determined by a path from the root, so distinct paths equal distinct substrings.",
  },
  {
    id: "ds-116",
    title: "Hash Table Resize Decision",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Decide whether a hash table should be resized given its load factor.\n\ncount is the number of stored entries, capacity is the number of buckets, and load_factor is the resizing threshold. The table should resize when count / capacity is greater than or equal to the threshold. A non-positive capacity always requires resizing.\n\nReturn True if the table should resize, otherwise False.",
    starterCode: `def should_resize(count, capacity, load_factor):
    # Your code here
    pass`,
    solution: `def should_resize(count, capacity, load_factor):
    if capacity <= 0:
        return True
    return count / capacity >= load_factor`,
    testCases: [
      { input: [7, 10, 0.7], expected: true },
      { input: [6, 10, 0.7], expected: false },
      { input: [0, 4, 0.75], expected: false },
      { input: [3, 4, 0.75], expected: true },
      { input: [0, 0, 0.75], expected: true },
    ],
    hint: "Compare count divided by capacity against the threshold with a greater-or-equal test.",
  },
  {
    id: "ds-117",
    title: "Hash Map Collision Count",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Count hash collisions when inserting keys into a table with chaining.\n\nThe bucket index of a key is key % capacity. A collision occurs whenever an insertion lands in a bucket that already holds at least one key; inserting a duplicate key also collides. Assume capacity is positive.\n\nReturn the number of collisions.",
    starterCode: `def count_collisions(capacity, keys):
    # Your code here
    pass`,
    solution: `def count_collisions(capacity, keys):
    occupied = set()
    collisions = 0
    for k in keys:
        idx = k % capacity
        if idx in occupied:
            collisions += 1
        else:
            occupied.add(idx)
    return collisions`,
    testCases: [
      { input: [5, [0, 1, 5, 6, 10]], expected: 3 },
      { input: [3, [1, 2, 3, 4, 5, 6]], expected: 3 },
      { input: [4, [7, 11, 15]], expected: 2 },
      { input: [5, [1, 2, 3]], expected: 0 },
    ],
    hint: "Track which bucket indices have been used; every repeat is a collision.",
  },
  {
    id: "ds-118",
    title: "Open Addressing Linear Probe Insert",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Insert a key into an open-addressing hash table using linear probing.\n\nBuild the table by inserting keys in order, then find the slot for key. Probing starts at key % capacity and advances one slot at a time, wrapping around. A key already present is considered found at its existing slot.\n\nReturn the slot index where the key is or would be stored, or -1 when the table is full and the key is absent.",
    starterCode: `def linear_probe_insert(capacity, keys, key):
    # Your code here
    pass`,
    solution: `def linear_probe_insert(capacity, keys, key):
    table = [None] * capacity
    count = 0
    for k in keys:
        if count >= capacity:
            break
        idx = k % capacity
        while table[idx] is not None and table[idx] != k:
            idx = (idx + 1) % capacity
        if table[idx] is None:
            count += 1
        table[idx] = k
    if key in table:
        return table.index(key)
    if count >= capacity:
        return -1
    idx = key % capacity
    while table[idx] is not None:
        idx = (idx + 1) % capacity
    return idx`,
    testCases: [
      { input: [7, [10, 20, 30], 17], expected: 4 },
      { input: [7, [10, 20, 30], 10], expected: 3 },
      { input: [3, [0, 1, 2], 3], expected: -1 },
      { input: [5, [], 8], expected: 3 },
      { input: [4, [4, 8], 0], expected: 2 },
    ],
    hint: "Duplicate keys occupy their original slot, so the probe stops on either an empty slot or a match.",
  },
  {
    id: "ds-119",
    title: "Quadratic Probe Insert",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Insert a key into an open-addressing hash table using quadratic probing.\n\nBuild the table by inserting keys in order, then find the slot for key. Probing starts at key % capacity and visits (base + i*i) % capacity for i = 0, 1, 2, ... Quadratic probes may fail to reach every slot, so give up after capacity attempts.\n\nReturn the slot index for the key, or -1 when it cannot be placed.",
    starterCode: `def quadratic_probe_insert(capacity, keys, key):
    # Your code here
    pass`,
    solution: `def quadratic_probe_insert(capacity, keys, key):
    table = [None] * capacity
    count = 0
    for k in keys:
        if count >= capacity:
            break
        base = k % capacity
        i = 0
        while True:
            idx = (base + i * i) % capacity
            if table[idx] is None:
                table[idx] = k
                count += 1
                break
            if table[idx] == k:
                break
            i += 1
            if i > capacity:
                break
    if key in table:
        return table.index(key)
    if count >= capacity:
        return -1
    base = key % capacity
    i = 0
    while i <= capacity:
        idx = (base + i * i) % capacity
        if table[idx] is None:
            return idx
        i += 1
    return -1`,
    testCases: [
      { input: [7, [10, 20], 17], expected: 4 },
      { input: [5, [0, 1, 5], 6], expected: 2 },
      { input: [2, [0, 1], 2], expected: -1 },
      { input: [3, [], 4], expected: 1 },
    ],
    hint: "The i-th probe lands at (key + i*i) % capacity, so the offsets are squares.",
  },
  {
    id: "ds-120",
    title: "Double Hashing Probe Count",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count the total number of probes used to insert keys with double hashing.\n\nThe primary hash is key % capacity and the step is 1 + (key % (capacity - 1)). Probing visits (h1 + i * h2) % capacity for i = 0, 1, 2, ... Each visited slot counts as one probe; stop after the first empty slot. Assume keys are distinct and capacity is at least 2.\n\nReturn the total number of probes over all insertions.",
    starterCode: `def double_hashing_probes(capacity, keys):
    # Your code here
    pass`,
    solution: `def double_hashing_probes(capacity, keys):
    table = [None] * capacity
    total = 0
    for k in keys:
        h1 = k % capacity
        h2 = 1 + (k % (capacity - 1))
        i = 0
        while True:
            idx = (h1 + i * h2) % capacity
            total += 1
            if table[idx] is None:
                table[idx] = k
                break
            i += 1
    return total`,
    testCases: [
      { input: [7, [10, 20, 30]], expected: 3 },
      { input: [5, [0, 5]], expected: 3 },
      { input: [3, [0, 3, 6]], expected: 5 },
      { input: [2, []], expected: 0 },
    ],
    hint: "The step is never zero, so the probe sequence eventually visits slots spread across the table.",
  },
  {
    id: "ds-121",
    title: "Consistent Hashing Ring Position",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the node that owns a key on a consistent hashing ring.\n\nEach node name and the key are hashed with the djb2 hash (start at 5381, then h = (h * 33 + ord(ch)) mod 2**32). Sort the node hashes into a ring and return the first node whose hash is greater than or equal to the key hash, wrapping around to the smallest hash when none qualifies.\n\nReturn the chosen node name, or None for an empty node list.",
    starterCode: `def ring_position(nodes, key):
    # Your code here
    pass`,
    solution: `def ring_position(nodes, key):
    def h(s):
        value = 5381
        for ch in s:
            value = (value * 33 + ord(ch)) % (2 ** 32)
        return value

    if not nodes:
        return None
    ring = sorted((h(node), node) for node in nodes)
    target = h(key)
    for hv, node in ring:
        if hv >= target:
            return node
    return ring[0][1]`,
    testCases: [
      { input: [["a", "b", "c"], "x"], expected: "a" },
      { input: [["node1", "node2"], "key1"], expected: "node1" },
      { input: [["only"], "anything"], expected: "only" },
      { input: [[], "k"], expected: null },
    ],
    hint: "Sorting the (hash, node) pairs turns the ring into a binary-searchable list.",
  },
  {
    id: "ds-122",
    title: "Deque via Doubly Linked List",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a deque backed by a doubly linked list.\n\noperations contains \"push_front\", \"push_back\", \"pop_front\", \"pop_back\", \"remove\" (first occurrence of values[i], records whether it existed), \"reverse\", or \"to_list\" (snapshot). Pushes and reverse record None and pops return the removed value or None when empty.\n\nReturn the list of recorded results.",
    starterCode: `def dll_deque_ops(operations, values):
    # Your code here
    pass`,
    solution: `def dll_deque_ops(operations, values):
    items = []
    out = []
    for op, val in zip(operations, values):
        if op == "push_front":
            items.insert(0, val)
            out.append(None)
        elif op == "push_back":
            items.append(val)
            out.append(None)
        elif op == "pop_front":
            out.append(items.pop(0) if items else None)
        elif op == "pop_back":
            out.append(items.pop() if items else None)
        elif op == "remove":
            if val in items:
                items.remove(val)
                out.append(True)
            else:
                out.append(False)
        elif op == "reverse":
            items.reverse()
            out.append(None)
        else:
            out.append(list(items))
    return out`,
    testCases: [
      {
        input: [
          ["push_back", "push_back", "push_front", "to_list", "reverse", "to_list", "remove", "to_list"],
          [2, 3, 1, 0, 0, 0, 3, 0],
        ],
        expected: [null, null, null, [1, 2, 3], null, [3, 2, 1], true, [2, 1]],
      },
      { input: [["pop_front", "pop_back"], [0, 0]], expected: [null, null] },
      { input: [["push_front", "to_list"], [7, 0]], expected: [null, [7]] },
      { input: [["remove", "push_back", "remove", "to_list"], [5, 5, 5, 0]], expected: [false, null, true, []] },
    ],
    hint: "A doubly linked list allows O(1) pushes and pops at both ends, while remove scans for the value.",
  },
  {
    id: "ds-123",
    title: "LFU Cache Operations",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate an LFU (least frequently used) cache with the given capacity.\n\noperations contains \"put\" (keys[i] and values[i]) or \"get\" (keys[i]); get returns the stored value or -1. When the cache is full, put evicts the key with the smallest access frequency, breaking ties by least recent use.\n\nReturn the list of recorded results (None for put).",
    starterCode: `def lfu_cache(capacity, operations, keys, values):
    # Your code here
    pass`,
    solution: `def lfu_cache(capacity, operations, keys, values):
    cache = {}
    freq = {}
    last = {}
    tick = 0
    out = []
    for op, key, val in zip(operations, keys, values):
        tick += 1
        if op == "get":
            if key not in cache:
                out.append(-1)
            else:
                freq[key] += 1
                last[key] = tick
                out.append(cache[key])
        else:
            if capacity <= 0:
                out.append(None)
                continue
            if key in cache:
                cache[key] = val
                freq[key] += 1
                last[key] = tick
            else:
                if len(cache) >= capacity:
                    victim = min(cache, key=lambda k: (freq[k], last[k]))
                    del cache[victim]
                    del freq[victim]
                    del last[victim]
                cache[key] = val
                freq[key] = 1
                last[key] = tick
            out.append(None)
    return out`,
    testCases: [
      {
        input: [
          2,
          ["put", "put", "get", "put", "get", "get", "put", "get", "get", "get"],
          [1, 2, 1, 3, 2, 3, 4, 1, 3, 4],
          [1, 2, 0, 3, 0, 0, 4, 0, 0, 0],
        ],
        expected: [null, null, 1, null, -1, 3, null, -1, 3, 4],
      },
      { input: [1, ["put", "put", "get", "get"], [1, 2, 1, 2], [10, 20, 0, 0]], expected: [null, null, -1, 20] },
      { input: [2, ["get"], [5], [0]], expected: [-1] },
      {
        input: [2, ["put", "put", "get", "put", "get", "get"], [1, 2, 1, 1, 2, 1], [5, 6, 0, 7, 0, 0]],
        expected: [null, null, 5, null, 6, 7],
      },
    ],
    hint: "Track frequency and last-use tick for every key; evict the minimum of the pair (frequency, tick).",
  },
  {
    id: "ds-124",
    title: "Maximum Frequency Stack",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a maximum frequency stack.\n\noperations contains \"push\" (values[i]) or \"pop\". push records None. pop removes and returns the most frequently pushed value; ties are broken by recency, so the most recently pushed among the most frequent wins. Frequency counts update on every pop.\n\nReturn the list of recorded results.",
    starterCode: `def max_freq_stack(operations, values):
    # Your code here
    pass`,
    solution: `def max_freq_stack(operations, values):
    freq = {}
    groups = {}
    maxf = 0
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            f = freq.get(val, 0) + 1
            freq[val] = f
            groups.setdefault(f, []).append(val)
            if f > maxf:
                maxf = f
            out.append(None)
        else:
            v = groups[maxf].pop()
            freq[v] -= 1
            if not groups[maxf]:
                maxf -= 1
            out.append(v)
    return out`,
    testCases: [
      {
        input: [
          ["push", "push", "push", "push", "push", "pop", "pop", "pop", "pop"],
          [5, 7, 5, 7, 4, 0, 0, 0, 0],
        ],
        expected: [null, null, null, null, null, 7, 5, 4, 7],
      },
      { input: [["push", "pop"], [1, 0]], expected: [null, 1] },
      { input: [["push", "push", "pop", "pop"], [2, 2, 0, 0]], expected: [null, null, 2, 2] },
      { input: [["push", "push", "push", "pop"], [1, 2, 3, 0]], expected: [null, null, null, 3] },
    ],
    hint: "Keep one list per frequency level; the top of the highest non-empty list is the value to pop.",
  },
  {
    id: "ds-125",
    title: "Design Hit Counter",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a hit counter that counts hits in the last 300 seconds.\n\noperations contains \"hit\" (records a hit at timestamps[i]) or \"get_hits\" (timestamps[i] is the query time). A hit is counted when its timestamp lies in [t - 299, t].\n\nReturn the list of recorded results (None for hit, an integer for get_hits).",
    starterCode: `def hit_counter(operations, timestamps):
    # Your code here
    pass`,
    solution: `def hit_counter(operations, timestamps):
    hits = []
    out = []
    for op, t in zip(operations, timestamps):
        if op == "hit":
            hits.append(t)
            out.append(None)
        else:
            cutoff = t - 299
            out.append(sum(1 for x in hits if x >= cutoff and x <= t))
    return out`,
    testCases: [
      { input: [["hit", "hit", "hit", "get_hits", "get_hits"], [1, 2, 3, 4, 300]], expected: [null, null, null, 3, 3] },
      { input: [["hit", "get_hits"], [1, 301]], expected: [null, 0] },
      { input: [["get_hits"], [10]], expected: [0] },
      {
        input: [["hit", "hit", "hit", "hit", "get_hits"], [10, 10, 10, 400, 401]],
        expected: [null, null, null, null, 1],
      },
    ],
    hint: "The window is inclusive on both ends: cutoff = query time - 299.",
  },
  {
    id: "ds-126",
    title: "Snapshot Array Set and Get",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a snapshot array that supports point writes and historical lookups.\n\noperations contains \"set\" (indices[i] = values[i]), \"snap\" (returns the current snapshot id and then increments it), or \"get\" (indices[i] is the position and values[i] is the snapshot id). get returns the value of that position at the time of the given snapshot, or 0 if it had never been set.\n\nReturn the list of recorded results.",
    starterCode: `def snapshot_array(operations, indices, values):
    # Your code here
    pass`,
    solution: `def snapshot_array(operations, indices, values):
    history = {}
    current = {}
    snap_id = 0
    out = []
    for op, idx, val in zip(operations, indices, values):
        if op == "set":
            current[idx] = val
            history.setdefault(idx, []).append((snap_id, val))
            out.append(None)
        elif op == "snap":
            out.append(snap_id)
            snap_id += 1
        else:
            entries = history.get(idx, [])
            result = 0
            for sid, v in entries:
                if sid <= val:
                    result = v
                else:
                    break
            out.append(result)
    return out`,
    testCases: [
      { input: [["set", "snap", "get", "set", "get"], [0, 0, 0, 0, 0], [5, 0, 0, 6, 0]], expected: [null, 0, 5, null, 5] },
      {
        input: [["set", "snap", "set", "snap", "get", "get"], [0, 0, 1, 1, 1, 0], [1, 0, 2, 0, 0, 1]],
        expected: [null, 0, null, 1, 0, 1],
      },
      { input: [["get"], [0], [0]], expected: [0] },
      { input: [["snap", "snap", "get"], [0, 0, 2], [0, 0, 0]], expected: [0, 1, 0] },
    ],
    hint: "Record (snapshot id, value) on every set and scan the history for the largest id not exceeding the query.",
  },
  {
    id: "ds-127",
    title: "Time-Based Key-Value Store",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a time-based key-value store.\n\noperations contains \"set\" (keys[i], values[i] at timestamps[i]) or \"get\" (return the value for keys[i] at the largest timestamp less than or equal to timestamps[i]). Sets for the same key are performed with non-decreasing timestamps.\n\nReturn the list of recorded results (None for set, a string for get; \"\" when no value qualifies).",
    starterCode: `def time_map_ops(operations, keys, values, timestamps):
    # Your code here
    pass`,
    solution: `def time_map_ops(operations, keys, values, timestamps):
    store = {}
    out = []
    for op, key, val, ts in zip(operations, keys, values, timestamps):
        if op == "set":
            store.setdefault(key, []).append((ts, val))
            out.append(None)
        else:
            entries = store.get(key, [])
            result = ""
            for t, v in entries:
                if t <= ts:
                    result = v
                else:
                    break
            out.append(result)
    return out`,
    testCases: [
      {
        input: [
          ["set", "set", "get", "get", "get"],
          ["foo", "foo", "foo", "foo", "foo"],
          ["bar", "bar2", "", "", ""],
          [1, 4, 1, 4, 5],
        ],
        expected: [null, null, "bar", "bar2", "bar2"],
      },
      { input: [["set", "get"], ["a", "b"], [1, ""], [10, 5]], expected: [null, ""] },
      { input: [["get"], ["x"], [""], [0]], expected: [""] },
      {
        input: [["set", "set", "get", "get"], ["k", "k", "k", "k"], [1, 2, "", ""], [5, 5, 5, 6]],
        expected: [null, null, 2, 2],
      },
    ],
    hint: "Appending (timestamp, value) pairs keeps each key's history sorted, and the last qualifying entry wins.",
  },
  {
    id: "ds-128",
    title: "Random Pick Index (Seeded)",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Pick a uniformly random index of target in a list using a seeded generator.\n\nCollect the positions where nums equals target, then use random.Random(seed).randrange to choose one so the result is reproducible. Return -1 when target does not appear.\n\nReturn the chosen index.",
    starterCode: `def random_pick_index(nums, target, seed):
    # Your code here
    pass`,
    solution: `def random_pick_index(nums, target, seed):
    import random

    indices = [i for i, x in enumerate(nums) if x == target]
    if not indices:
        return -1
    rng = random.Random(seed)
    return indices[rng.randrange(len(indices))]`,
    testCases: [
      { input: [[1, 2, 3, 3, 3], 3, 0], expected: 3 },
      { input: [[1, 2, 3, 3, 3], 3, 1], expected: 2 },
      { input: [[], 5, 0], expected: -1 },
      { input: [[5, 5], 5, 42], expected: 0 },
    ],
    hint: "Seeding a fresh Random instance makes the pick fully deterministic.",
  },
  {
    id: "ds-129",
    title: "Weighted Random Pick (Seeded)",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Pick a value with probability proportional to its weight using a seeded generator.\n\nDraw r = random.Random(seed).random() times the total weight and return the value whose cumulative weight first exceeds r. If the total weight is not positive return None.\n\nReturn the chosen value.",
    starterCode: `def weighted_random_pick(values, weights, seed):
    # Your code here
    pass`,
    solution: `def weighted_random_pick(values, weights, seed):
    import random

    total = sum(weights)
    if total <= 0:
        return None
    rng = random.Random(seed)
    r = rng.random() * total
    upto = 0
    for i, w in enumerate(weights):
        upto += w
        if r < upto:
            return values[i]
    return values[-1]`,
    testCases: [
      { input: [["a", "b"], [1, 3], 1], expected: "a" },
      { input: [["a", "b"], [1, 3], 2], expected: "b" },
      { input: [["x"], [5], 7], expected: "x" },
      { input: [["a", "b", "c"], [0, 0, 1], 3], expected: "c" },
      { input: [[], [], 0], expected: null },
    ],
    hint: "Walk the cumulative sums until the cumulative weight passes r.",
  },
  {
    id: "ds-130",
    title: "Insert Delete GetRandom O(1)",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a set supporting insert, remove, and get_random in O(1) average time.\n\noperations contains \"insert\" (values[i]), \"remove\" (values[i]), or \"get_random\". insert returns False when the value is already present and True otherwise; remove returns True when the value was present and False otherwise. get_random uses random.Random(0) so results are reproducible, and returns None for an empty set.\n\nReturn the list of recorded results.",
    starterCode: `def insert_delete_random(operations, values):
    # Your code here
    pass`,
    solution: `def insert_delete_random(operations, values):
    import random

    items = []
    pos = {}
    rng = random.Random(0)
    out = []
    for op, val in zip(operations, values):
        if op == "insert":
            if val in pos:
                out.append(False)
            else:
                pos[val] = len(items)
                items.append(val)
                out.append(True)
        elif op == "remove":
            if val not in pos:
                out.append(False)
            else:
                idx = pos[val]
                last = items[-1]
                items[idx] = last
                pos[last] = idx
                items.pop()
                del pos[val]
                out.append(True)
        else:
            out.append(items[rng.randrange(len(items))] if items else None)
    return out`,
    testCases: [
      {
        input: [["insert", "insert", "remove", "insert", "get_random"], [1, 2, 2, 2, 0]],
        expected: [true, true, true, true, 2],
      },
      { input: [["remove", "get_random"], [5, 0]], expected: [false, null] },
      {
        input: [["insert", "insert", "insert", "get_random", "get_random"], [1, 2, 3, 0, 0]],
        expected: [true, true, true, 2, 2],
      },
      { input: [["insert", "insert"], [1, 1]], expected: [true, false] },
    ],
    hint: "Removing in O(1) swaps the value with the last element before popping, fixing the position map.",
  },
];
