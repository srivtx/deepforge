import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-001",
    title: "Stack Push and Pop Simulation",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate an array-based stack. Given a list of operations where each operation is either \"push\" or \"pop\", and a parallel list values, execute them in order.\n\nFor a push, append values[i] to the stack and record None. For a pop, remove the top element and record it, or record None if the stack is empty.\n\nReturn the list of recorded results.",
    starterCode: `def stack_ops(operations, values):
    # Your code here
    pass`,
    solution: `def stack_ops(operations, values):
    stack = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            stack.append(val)
            out.append(None)
        else:
            out.append(stack.pop() if stack else None)
    return out`,
    testCases: [
      { input: [["push", "push", "pop"], [1, 2, 0]], expected: [null, null, 2] },
      { input: [["pop"], [0]], expected: [null] },
      { input: [["push", "pop", "pop"], [5, 0, 0]], expected: [null, 5, null] },
      {
        input: [["push", "push", "push", "pop", "pop"], [1, 2, 3, 0, 0]],
        expected: [null, null, null, 3, 2],
      },
    ],
    hint: "A Python list already behaves like a stack: append for push, pop for pop.",
  },
  {
    id: "ds-002",
    title: "Balanced Brackets",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether a string of bracket characters is balanced.\n\nThe string may only contain the characters (), [], and {}. A string is balanced when every opening bracket is closed by the matching type in the correct order.\n\nReturn True if balanced, otherwise False. An empty string is balanced.",
    starterCode: `def is_balanced(s):
    # Your code here
    pass`,
    solution: `def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack`,
    testCases: [
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([{}])"], expected: true },
      { input: [""], expected: true },
      { input: ["("], expected: false },
    ],
    hint: "Push opening brackets; on a closing bracket the top of the stack must be its match.",
  },
  {
    id: "ds-003",
    title: "Postfix Expression Evaluation",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Evaluate an arithmetic expression given in postfix (reverse Polish) notation.\n\ntokens is a list of strings, each either an integer or one of the operators +, -, *, /. For each operator, pop the top two values b then a and push a op b. Division truncates toward zero.\n\nReturn the final integer result.",
    starterCode: `def eval_postfix(tokens):
    # Your code here
    pass`,
    solution: `def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in "+-*/":
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[-1]`,
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      { input: [["3", "4", "+", "2", "*"]], expected: 14 },
      {
        input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
        expected: 22,
      },
    ],
    hint: "Operands go on the stack; an operator pops two operands and pushes the result.",
  },
  {
    id: "ds-004",
    title: "Min Stack with O(1) Minimum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1) time.\n\noperations contains \"push\", \"pop\", \"top\", or \"get_min\"; values provides the pushed value and is ignored for other operations. Record None for push and pop, the top value (or None if empty) for top, and the current minimum (or None if empty) for get_min.\n\nReturn the list of recorded results.",
    starterCode: `def min_stack(operations, values):
    # Your code here
    pass`,
    solution: `def min_stack(operations, values):
    stack = []
    mins = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            stack.append(val)
            mins.append(val if not mins else min(val, mins[-1]))
            out.append(None)
        elif op == "pop":
            if stack:
                stack.pop()
                mins.pop()
            out.append(None)
        elif op == "top":
            out.append(stack[-1] if stack else None)
        else:
            out.append(mins[-1] if mins else None)
    return out`,
    testCases: [
      {
        input: [
          ["push", "push", "push", "get_min", "pop", "top", "get_min"],
          [5, 3, 7, 0, 0, 0, 0],
        ],
        expected: [null, null, null, 3, null, 3, 3],
      },
      {
        input: [
          ["push", "get_min", "push", "get_min", "pop", "get_min"],
          [1, 0, 0, 0, 0, 0],
        ],
        expected: [null, 1, null, 0, null, 1],
      },
      { input: [["pop", "get_min"], [0, 0]], expected: [null, null] },
      { input: [["push", "pop", "get_min"], [1, 0, 0]], expected: [null, null, null] },
    ],
    hint: "Keep a second stack whose top always holds the minimum seen so far.",
  },
  {
    id: "ds-005",
    title: "Queue Implemented with Two Stacks",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Implement a first-in-first-out queue using two stacks.\n\noperations contains \"push\", \"pop\", \"peek\", or \"empty\". values provides the element for push (ignored otherwise). Record None for push, the removed front element (or None if empty) for pop, the front element (or None if empty) for peek, and a boolean for empty.\n\nReturn the list of recorded results.",
    starterCode: `def two_stack_queue(operations, values):
    # Your code here
    pass`,
    solution: `def two_stack_queue(operations, values):
    inbox = []
    outbox = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            inbox.append(val)
            out.append(None)
        elif op == "pop":
            if not outbox:
                while inbox:
                    outbox.append(inbox.pop())
            out.append(outbox.pop() if outbox else None)
        elif op == "peek":
            if not outbox:
                while inbox:
                    outbox.append(inbox.pop())
            out.append(outbox[-1] if outbox else None)
        else:
            out.append(not inbox and not outbox)
    return out`,
    testCases: [
      {
        input: [["push", "push", "peek", "pop", "empty"], [1, 2, 0, 0, 0]],
        expected: [null, null, 1, 1, false],
      },
      {
        input: [["pop", "push", "pop", "pop"], [0, 5, 0, 0]],
        expected: [null, null, 5, null],
      },
      { input: [["push", "pop", "pop", "empty"], [7, 0, 0, 0]], expected: [null, 7, null, true] },
      { input: [["empty"], [0]], expected: [true] },
    ],
    hint: "Push onto an inbox stack; when a pop is needed, move everything to an outbox stack.",
  },
  {
    id: "ds-006",
    title: "Circular Queue Simulation",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a fixed-size circular queue (ring buffer) with the given capacity.\n\noperations contains \"enqueue\", \"dequeue\", \"front\", \"rear\", \"is_empty\", or \"is_full\". enqueue returns False when full and True otherwise, dequeue returns the removed value (or None when empty), front and rear return the end values or None, and the last two return booleans.\n\nReturn the list of recorded results.",
    starterCode: `def circular_queue(capacity, operations, values):
    # Your code here
    pass`,
    solution: `def circular_queue(capacity, operations, values):
    buf = [None] * capacity
    head = 0
    count = 0
    out = []
    for op, val in zip(operations, values):
        if op == "enqueue":
            if count == capacity:
                out.append(False)
            else:
                buf[(head + count) % capacity] = val
                count += 1
                out.append(True)
        elif op == "dequeue":
            if count == 0:
                out.append(None)
            else:
                v = buf[head]
                head = (head + 1) % capacity
                count -= 1
                out.append(v)
        elif op == "front":
            out.append(buf[head] if count else None)
        elif op == "rear":
            out.append(buf[(head + count - 1) % capacity] if count else None)
        elif op == "is_empty":
            out.append(count == 0)
        else:
            out.append(count == capacity)
    return out`,
    testCases: [
      {
        input: [
          3,
          [
            "enqueue",
            "enqueue",
            "enqueue",
            "enqueue",
            "front",
            "rear",
            "dequeue",
            "enqueue",
            "front",
            "rear",
          ],
          [1, 2, 3, 4, 0, 0, 0, 5, 0, 0],
        ],
        expected: [true, true, true, false, 1, 3, 1, true, 2, 5],
      },
      {
        input: [1, ["enqueue", "dequeue", "is_empty", "enqueue", "is_full"], [1, 0, 0, 2, 0]],
        expected: [true, 1, true, true, true],
      },
      {
        input: [2, ["dequeue", "front", "rear", "is_empty"], [0, 0, 0, 0]],
        expected: [null, null, null, true],
      },
      {
        input: [2, ["enqueue", "dequeue", "enqueue", "rear"], [9, 0, 8, 0]],
        expected: [true, 9, true, 8],
      },
    ],
    hint: "Track head and count; the tail position is (head + count - 1) % capacity.",
  },
  {
    id: "ds-007",
    title: "Deque Operations",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a double-ended queue (deque) supporting operations at both ends.\n\noperations contains \"append_left\", \"append_right\", \"pop_left\", \"pop_right\", \"front\", \"back\", or \"size\". Appends record None, pops return the removed value or None when empty, front and back return the end values or None, and size returns the current length.\n\nReturn the list of recorded results.",
    starterCode: `def deque_operations(operations, values):
    # Your code here
    pass`,
    solution: `def deque_operations(operations, values):
    dq = []
    out = []
    for op, val in zip(operations, values):
        if op == "append_left":
            dq.insert(0, val)
            out.append(None)
        elif op == "append_right":
            dq.append(val)
            out.append(None)
        elif op == "pop_left":
            out.append(dq.pop(0) if dq else None)
        elif op == "pop_right":
            out.append(dq.pop() if dq else None)
        elif op == "front":
            out.append(dq[0] if dq else None)
        elif op == "back":
            out.append(dq[-1] if dq else None)
        else:
            out.append(len(dq))
    return out`,
    testCases: [
      {
        input: [
          ["append_right", "append_left", "append_right", "front", "back", "pop_left", "pop_right", "size"],
          [1, 2, 3, 0, 0, 0, 0, 0],
        ],
        expected: [null, null, null, 2, 3, 2, 3, 1],
      },
      {
        input: [["pop_left", "pop_right", "front", "back"], [0, 0, 0, 0]],
        expected: [null, null, null, null],
      },
      { input: [["append_left", "append_left", "size"], [5, 6, 0]], expected: [null, null, 2] },
      { input: [["append_right", "pop_right", "pop_right"], [9, 0, 0]], expected: [null, 9, null] },
    ],
    hint: "A Python list supports both ends; insert(0, x) and pop(0) work on the left.",
  },
  {
    id: "ds-008",
    title: "Reverse a Singly Linked List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Reverse a singly linked list represented as a Python list of values.\n\nBuild the linked list in order, reverse the links so the tail becomes the head, and return the values from the new head to the tail.\n\nAn empty list returns an empty list.",
    starterCode: `def reverse_list(values):
    # Your code here
    pass`,
    solution: `def reverse_list(values):
    head = None
    for v in values:
        head = [v, head]
    out = []
    node = head
    while node:
        out.append(node[0])
        node = node[1]
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 2]], expected: [2, 1] },
    ],
    hint: "Walk the nodes once, and prepend each value to a new list to simulate rerouting the links.",
  },
  {
    id: "ds-009",
    title: "Middle Node of a Linked List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the value of the middle node of a singly linked list given as a list of values.\n\nUse the slow/fast pointer idea: advance a slow pointer by one node and a fast pointer by two until the fast pointer reaches the end. For an even number of nodes, return the second middle value.\n\nReturn None for an empty list.",
    starterCode: `def middle_node(values):
    # Your code here
    pass`,
    solution: `def middle_node(values):
    slow = 0
    fast = 0
    while fast + 1 < len(values):
        slow += 1
        fast += 2
    return values[slow] if values else None`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 3 },
      { input: [[1, 2, 3, 4]], expected: 3 },
      { input: [[1]], expected: 1 },
      { input: [[]], expected: null },
    ],
    hint: "When the fast index passes the end, the slow index sits at the middle.",
  },
  {
    id: "ds-010",
    title: "Merge Two Sorted Lists",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Merge two sorted lists into one sorted list.\n\nBoth inputs are sorted in non-decreasing order and may be empty. Use two pointers to interleave values, taking from a when a[i] is less than or equal to b[j], then append any leftovers.\n\nReturn the merged list.",
    starterCode: `def merge_sorted(a, b):
    # Your code here
    pass`,
    solution: `def merge_sorted(a, b):
    out = []
    i = 0
    j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`,
    testCases: [
      { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { input: [[], [1, 2]], expected: [1, 2] },
      { input: [[], []], expected: [] },
      { input: [[0], [-1, 5]], expected: [-1, 0, 5] },
    ],
    hint: "Compare the current heads, take the smaller one, and drain the remaining list at the end.",
  },
  {
    id: "ds-011",
    title: "Remove Duplicates from Sorted List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Remove duplicates from a sorted list so that each value appears exactly once.\n\nBecause the list is sorted, duplicates are adjacent. Scan once and keep a value only when it differs from the last kept value.\n\nReturn the resulting list.",
    starterCode: `def remove_duplicates(values):
    # Your code here
    pass`,
    solution: `def remove_duplicates(values):
    out = []
    for v in values:
        if not out or out[-1] != v:
            out.append(v)
    return out`,
    testCases: [
      { input: [[1, 1, 2]], expected: [1, 2] },
      { input: [[1, 1, 2, 3, 3]], expected: [1, 2, 3] },
      { input: [[]], expected: [] },
      { input: [[-3, -1, -1, 0, 0, 2]], expected: [-3, -1, 0, 2] },
    ],
    hint: "Compare each value with the last one you kept, not with the previous element alone.",
  },
  {
    id: "ds-012",
    title: "Doubly Linked List Insert and Delete",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a doubly linked list with insert and delete operations.\n\noperations contains \"insert_head\", \"insert_tail\", \"delete\", or \"to_list\"; values provides the value for inserts and for delete (the first occurrence is removed). Record None for every operation except to_list, which records a snapshot of the current list.\n\nReturn the list of recorded results.",
    starterCode: `def doubly_ll_ops(operations, values):
    # Your code here
    pass`,
    solution: `def doubly_ll_ops(operations, values):
    items = []
    out = []
    for op, val in zip(operations, values):
        if op == "insert_head":
            items.insert(0, val)
            out.append(None)
        elif op == "insert_tail":
            items.append(val)
            out.append(None)
        elif op == "delete":
            if val in items:
                items.remove(val)
            out.append(None)
        else:
            out.append(list(items))
    return out`,
    testCases: [
      {
        input: [
          ["insert_tail", "insert_tail", "insert_head", "to_list", "delete", "to_list"],
          [1, 2, 9, 0, 2, 0],
        ],
        expected: [null, null, null, [9, 1, 2], null, [9, 1]],
      },
      { input: [["delete", "to_list"], [5, 0]], expected: [null, []] },
      { input: [["insert_head", "insert_head", "to_list"], [1, 2, 0]], expected: [null, null, [2, 1]] },
      { input: [["insert_tail", "delete", "to_list"], [4, 4, 0]], expected: [null, null, []] },
    ],
    hint: "Insert at the head with insert(0, value) and store snapshots with list(items).",
  },
  {
    id: "ds-013",
    title: "Linked List Cycle Detection",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Detect whether a singly linked list contains a cycle using Floyd's tortoise and hare algorithm.\n\nvalues gives the node values in order and pos is the index the tail links back to, or -1 when there is no cycle. Advance a slow pointer one step and a fast pointer two steps; if they ever meet, a cycle exists.\n\nReturn True if a cycle exists, otherwise False.",
    starterCode: `def has_cycle(values, pos):
    # Your code here
    pass`,
    solution: `def has_cycle(values, pos):
    n = len(values)
    if n == 0 or pos < 0:
        return False
    nxt = [i + 1 for i in range(n)]
    nxt[n - 1] = pos
    slow = 0
    fast = 0
    while fast != -1 and nxt[fast] != -1:
        slow = nxt[slow]
        fast = nxt[nxt[fast]]
        if slow == fast:
            return True
    return False`,
    testCases: [
      { input: [[3, 2, 0, -4], 1], expected: true },
      { input: [[1, 2], 0], expected: true },
      { input: [[1], -1], expected: false },
      { input: [[], -1], expected: false },
      { input: [[1, 2, 3], -1], expected: false },
    ],
    hint: "If there is no cycle the fast pointer reaches the end; if there is one it laps the slow pointer.",
  },
  {
    id: "ds-014",
    title: "djb2 String Hash",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the djb2 string hash, a classic 32-bit hash function.\n\nStart with h = 5381 and for every character update h = (h * 33 + ord(ch)) mod 2**32. Characters are processed from left to right and the empty string hashes to 5381.\n\nReturn the integer hash.",
    starterCode: `def djb2(s):
    # Your code here
    pass`,
    solution: `def djb2(s):
    h = 5381
    for ch in s:
        h = (h * 33 + ord(ch)) % (2 ** 32)
    return h`,
    testCases: [
      { input: [""], expected: 5381 },
      { input: ["a"], expected: 177670 },
      { input: ["ab"], expected: 5863208 },
      { input: ["hello"], expected: 261238937 },
    ],
    hint: "Multiply the running hash by 33 and add the character code, keeping it to 32 bits.",
  },
  {
    id: "ds-015",
    title: "Hash Set Operations",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Simulate a hash set supporting add, remove, and contains.\n\noperations contains \"add\", \"remove\", or \"contains\"; values provides the key. add records None, remove records True when the key was present and False otherwise, and contains records a boolean.\n\nReturn the list of recorded results.",
    starterCode: `def hash_set_ops(operations, values):
    # Your code here
    pass`,
    solution: `def hash_set_ops(operations, values):
    seen = set()
    out = []
    for op, val in zip(operations, values):
        if op == "add":
            seen.add(val)
            out.append(None)
        elif op == "remove":
            if val in seen:
                seen.remove(val)
                out.append(True)
            else:
                out.append(False)
        else:
            out.append(val in seen)
    return out`,
    testCases: [
      {
        input: [["add", "add", "contains", "remove", "contains"], [1, 2, 2, 2, 2]],
        expected: [null, null, true, true, false],
      },
      {
        input: [["remove", "add", "contains"], [5, 5, 5]],
        expected: [false, null, true],
      },
      {
        input: [["add", "add", "add", "contains", "contains"], [1, 1, 2, 1, 2]],
        expected: [null, null, null, true, true],
      },
      { input: [["contains"], [7]], expected: [false] },
    ],
    hint: "Python's built-in set is fine: add, discard, and the in operator are all O(1) average.",
  },
  {
    id: "ds-016",
    title: "String Set Deduplication",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Remove duplicate strings from a list while preserving the order of first occurrences.\n\nComparison is case-sensitive and exact. Keep a string the first time it appears and skip all later repeats.\n\nReturn the deduplicated list.",
    starterCode: `def dedupe_words(words):
    # Your code here
    pass`,
    solution: `def dedupe_words(words):
    seen = set()
    out = []
    for w in words:
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out`,
    testCases: [
      { input: [["a", "b", "a", "c", "b"]], expected: ["a", "b", "c"] },
      { input: [[]], expected: [] },
      { input: [["x"]], expected: ["x"] },
      { input: [["A", "a", "A"]], expected: ["A", "a"] },
    ],
    hint: "Track seen strings in a set and append only when the string is new.",
  },
  {
    id: "ds-017",
    title: "First Non-Repeating Character",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the index of the first character in a string that does not repeat anywhere else.\n\nCount how often each character occurs, then scan left to right for the first character whose count is one. Return -1 if no such character exists, including for the empty string.",
    starterCode: `def first_unique_char(s):
    # Your code here
    pass`,
    solution: `def first_unique_char(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1`,
    testCases: [
      { input: ["leetcode"], expected: 0 },
      { input: ["loveleetcode"], expected: 2 },
      { input: ["aabb"], expected: -1 },
      { input: [""], expected: -1 },
      { input: ["z"], expected: 0 },
    ],
    hint: "Build a frequency map first, then scan the string again.",
  },
  {
    id: "ds-018",
    title: "Binary Heap Parent and Child Indices",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the parent and child indices of a node in an array-based binary heap.\n\nFor a zero-based index i, the parent is (i - 1) // 2 (or -1 for the root), the left child is 2*i + 1, and the right child is 2*i + 2.\n\nReturn [parent, left, right].",
    starterCode: `def heap_indices(i):
    # Your code here
    pass`,
    solution: `def heap_indices(i):
    parent = (i - 1) // 2 if i > 0 else -1
    return [parent, 2 * i + 1, 2 * i + 2]`,
    testCases: [
      { input: [0], expected: [-1, 1, 2] },
      { input: [1], expected: [0, 3, 4] },
      { input: [3], expected: [1, 7, 8] },
      { input: [6], expected: [2, 13, 14] },
    ],
    hint: "Children of i live at 2*i + 1 and 2*i + 2; the parent is their inverse.",
  },
  {
    id: "ds-019",
    title: "Heap Sift Up",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Restore the min-heap property by sifting the element at index up toward the root.\n\nheap is a list that is a valid min-heap everywhere except possibly at the given index. While the element is smaller than its parent, swap the two and continue from the parent position.\n\nReturn the updated heap as a new list.",
    starterCode: `def sift_up(heap, index):
    # Your code here
    pass`,
    solution: `def sift_up(heap, index):
    h = list(heap)
    i = index
    while i > 0:
        parent = (i - 1) // 2
        if h[i] < h[parent]:
            h[i], h[parent] = h[parent], h[i]
            i = parent
        else:
            break
    return h`,
    testCases: [
      { input: [[3, 5, 4], 0], expected: [3, 5, 4] },
      { input: [[10, 20, 30, 5], 3], expected: [5, 10, 30, 20] },
      { input: [[1, 2, 3], 2], expected: [1, 2, 3] },
      { input: [[2, 4, 6, 8, 1], 4], expected: [1, 2, 6, 8, 4] },
    ],
    hint: "Compare with the parent at (i - 1) // 2 and keep swapping while smaller.",
  },
  {
    id: "ds-020",
    title: "Heapify Build Min-Heap",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Build a min-heap from an unsorted list in O(n) time using the bottom-up heapify algorithm.\n\nStarting from the last internal node (n // 2 - 1) down to index 0, sift each element down: repeatedly swap it with its smaller child until both children are greater than or equal to it.\n\nReturn the resulting heap as a new list. The exact layout is deterministic for this algorithm.",
    starterCode: `def heapify(nums):
    # Your code here
    pass`,
    solution: `def heapify(nums):
    h = list(nums)
    n = len(h)
    for start in range(n // 2 - 1, -1, -1):
        i = start
        while True:
            left = 2 * i + 1
            right = 2 * i + 2
            smallest = i
            if left < n and h[left] < h[smallest]:
                smallest = left
            if right < n and h[right] < h[smallest]:
                smallest = right
            if smallest == i:
                break
            h[i], h[smallest] = h[smallest], h[i]
            i = smallest
    return h`,
    testCases: [
      { input: [[]], expected: [] },
      { input: [[5]], expected: [5] },
      { input: [[3, 2, 1]], expected: [1, 2, 3] },
      { input: [[9, 4, 7, 1, -2, 6, 5]], expected: [-2, 1, 5, 9, 4, 6, 7] },
      { input: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5] },
    ],
    hint: "Sift down every internal node from the last one back to the root; leaves are already heaps.",
  },
  {
    id: "ds-021",
    title: "Heap Push and Pop",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a min-heap (priority queue) supporting push, pop, and peek.\n\noperations contains \"push\", \"pop\", or \"peek\"; values provides the pushed value (ignored otherwise). push records None, while pop and peek return the smallest element or None when the heap is empty.\n\nImplement push with sift-up, and pop by moving the last element to the root and sifting it down.",
    starterCode: `def heap_push_pop(operations, values):
    # Your code here
    pass`,
    solution: `def heap_push_pop(operations, values):
    heap = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            heap.append(val)
            i = len(heap) - 1
            while i > 0:
                p = (i - 1) // 2
                if heap[i] < heap[p]:
                    heap[i], heap[p] = heap[p], heap[i]
                    i = p
                else:
                    break
            out.append(None)
        elif op == "pop":
            if not heap:
                out.append(None)
            else:
                top = heap[0]
                last = heap.pop()
                if heap:
                    heap[0] = last
                    i = 0
                    n = len(heap)
                    while True:
                        left = 2 * i + 1
                        right = 2 * i + 2
                        smallest = i
                        if left < n and heap[left] < heap[smallest]:
                            smallest = left
                        if right < n and heap[right] < heap[smallest]:
                            smallest = right
                        if smallest == i:
                            break
                        heap[i], heap[smallest] = heap[smallest], heap[i]
                        i = smallest
                out.append(top)
        else:
            out.append(heap[0] if heap else None)
    return out`,
    testCases: [
      {
        input: [["push", "push", "push", "pop", "peek"], [3, 1, 2, 0, 0]],
        expected: [null, null, null, 1, 2],
      },
      {
        input: [["pop", "push", "pop", "pop"], [0, 5, 0, 0]],
        expected: [null, null, 5, null],
      },
      {
        input: [
          ["push", "push", "push", "pop", "pop", "pop"],
          [2, 3, 1, 0, 0, 0],
        ],
        expected: [null, null, null, 1, 2, 3],
      },
      { input: [["peek"], [0]], expected: [null] },
    ],
    hint: "Pop swaps the root with the last element, shrinks the list, then sifts the new root down.",
  },
  {
    id: "ds-022",
    title: "Kth Largest Element via Heap",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Return the k-th largest element of a list, where k is 1-based.\n\nMaintain a min-heap of at most k elements: push each number and whenever the heap grows past k, pop the smallest. The root of the final heap is the k-th largest element.\n\nYou may use the heapq module. k is always between 1 and len(nums).",
    starterCode: `def kth_largest(nums, k):
    # Your code here
    pass`,
    solution: `import heapq


def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    testCases: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { input: [[1], 1], expected: 1 },
      { input: [[-5, -2, -9], 2], expected: -5 },
    ],
    hint: "A min-heap of size k keeps the k largest values seen so far; its root is the smallest of them.",
  },
  {
    id: "ds-023",
    title: "Trie Insert, Search, and StartsWith",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a trie (prefix tree) supporting insert, search, and starts_with.\n\noperations contains \"insert\", \"search\", or \"starts_with\"; words provides the argument. insert records None, search records whether the exact word was inserted, and starts_with records whether any inserted word begins with the given prefix.\n\nReturn the list of recorded results.",
    starterCode: `def trie_ops(operations, words):
    # Your code here
    pass`,
    solution: `def trie_ops(operations, words):
    root = {}
    out = []
    for op, w in zip(operations, words):
        if op == "insert":
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["end"] = True
            out.append(None)
        elif op == "search":
            node = root
            for ch in w:
                if ch not in node:
                    node = None
                    break
                node = node[ch]
            out.append(node is not None and node.get("end", False) is True)
        else:
            node = root
            for ch in w:
                if ch not in node:
                    node = None
                    break
                node = node[ch]
            out.append(node is not None)
    return out`,
    testCases: [
      {
        input: [["insert", "search", "search", "starts_with"], ["apple", "apple", "app", "app"]],
        expected: [null, true, false, true],
      },
      {
        input: [
          ["insert", "insert", "search", "starts_with", "starts_with"],
          ["app", "apple", "apple", "appl", "b"],
        ],
        expected: [null, null, true, true, false],
      },
      { input: [["search"], ["a"]], expected: [false] },
      { input: [["insert", "search"], ["a", "a"]], expected: [null, true] },
    ],
    hint: "Store an end-of-word marker on the node where a full word finishes.",
  },
  {
    id: "ds-024",
    title: "Trie Collect Words with Prefix",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Collect all words from the given list that start with prefix, using a trie.\n\nInsert every word into a trie, walk down the characters of the prefix, then gather every word stored in the subtree with a depth-first search.\n\nReturn the matching words sorted in ascending lexicographic order.",
    starterCode: `def words_with_prefix(words, prefix):
    # Your code here
    pass`,
    solution: `def words_with_prefix(words, prefix):
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node["end"] = word
    node = root
    for ch in prefix:
        if ch not in node:
            return []
        node = node[ch]
    found = []
    stack = [node]
    while stack:
        cur = stack.pop()
        for key, child in cur.items():
            if key == "end":
                found.append(child)
            else:
                stack.append(child)
    return sorted(found)`,
    testCases: [
      { input: [["apple", "app", "apricot", "banana"], "ap"], expected: ["app", "apple", "apricot"] },
      { input: [["dog", "deer"], "do"], expected: ["dog"] },
      { input: [["a"], "b"], expected: [] },
      { input: [["", "a"], ""], expected: ["", "a"] },
      { input: [["tea", "ted", "ten"], "te"], expected: ["tea", "ted", "ten"] },
    ],
    hint: "The prefix walk ends at a subtree root; DFS that subtree collecting end markers.",
  },
  {
    id: "ds-025",
    title: "BST Insert and Preorder Traversal",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Insert values into an empty binary search tree in the given order, then insert key, and return the preorder traversal.\n\nDuplicates are ignored, so each value appears at most once. Preorder visits a node first, then its left subtree, then its right subtree.\n\nReturn the list of node values in preorder.",
    starterCode: `def bst_insert(values, key):
    # Your code here
    pass`,
    solution: `def bst_insert(values, key):
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
    root = insert(root, key)
    out = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        out.append(node[0])
        stack.append(node[2])
        stack.append(node[1])
    return out`,
    testCases: [
      { input: [[5, 3, 8], 4], expected: [5, 3, 4, 8] },
      { input: [[], 5], expected: [5] },
      { input: [[5, 5], 5], expected: [5] },
      { input: [[10, 5, 15, 3], 12], expected: [10, 5, 3, 15, 12] },
      { input: [[2, 1, 3], 4], expected: [2, 1, 3, 4] },
    ],
    hint: "Compare against each node and descend left when smaller, right when larger.",
  },
  {
    id: "ds-026",
    title: "BST Minimum and Maximum",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the minimum and maximum values stored in a binary search tree built from the given values.\n\nInsert the values in order (duplicates ignored), then walk left from the root to find the minimum and right to find the maximum.\n\nReturn [minimum, maximum], or [] when values is empty.",
    starterCode: `def bst_min_max(values):
    # Your code here
    pass`,
    solution: `def bst_min_max(values):
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
    if root is None:
        return []
    lo = root
    while lo[1] is not None:
        lo = lo[1]
    hi = root
    while hi[2] is not None:
        hi = hi[2]
    return [lo[0], hi[0]]`,
    testCases: [
      { input: [[5, 3, 8, 1]], expected: [1, 8] },
      { input: [[7]], expected: [7, 7] },
      { input: [[]], expected: [] },
      { input: [[4, 4, 2]], expected: [2, 4] },
    ],
    hint: "The minimum sits at the leftmost node and the maximum at the rightmost node.",
  },
  {
    id: "ds-027",
    title: "BST Height",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the height of a binary search tree built from the given values, measured in nodes.\n\nInsert the values in order (duplicates ignored). The height is the number of nodes on the longest path from the root to a leaf: an empty tree has height 0 and a single node has height 1.\n\nReturn the height.",
    starterCode: `def bst_height(values):
    # Your code here
    pass`,
    solution: `def bst_height(values):
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
    if root is None:
        return 0
    best = 0
    stack = [(root, 1)]
    while stack:
        node, d = stack.pop()
        if d > best:
            best = d
        if node[1] is not None:
            stack.append((node[1], d + 1))
        if node[2] is not None:
            stack.append((node[2], d + 1))
    return best`,
    testCases: [
      { input: [[5, 3, 8, 1]], expected: 3 },
      { input: [[5]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[10, 5, 15, 3, 7, 12, 20]], expected: 3 },
    ],
    hint: "Track the depth of each node during a DFS and keep the maximum.",
  },
  {
    id: "ds-028",
    title: "Validate Binary Search Tree",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Check whether a binary tree given in level order is a valid binary search tree.\n\ntree is a list in LeetCode-style level order where None marks a missing node; the children of index i are at 2*i + 1 and 2*i + 2. A valid BST requires every node in the left subtree to be strictly smaller and every node in the right subtree strictly larger.\n\nReturn True if valid, otherwise False. An empty tree is valid.",
    starterCode: `def is_valid_bst(tree):
    # Your code here
    pass`,
    solution: `def is_valid_bst(tree):
    if not tree or tree[0] is None:
        return True

    def check(i, low, high):
        if i >= len(tree) or tree[i] is None:
            return True
        val = tree[i]
        if low is not None and val <= low:
            return False
        if high is not None and val >= high:
            return False
        return check(2 * i + 1, low, val) and check(2 * i + 2, val, high)

    return check(0, None, None)`,
    testCases: [
      { input: [[2, 1, 3]], expected: true },
      { input: [[5, 1, 4, null, null, 3, 6]], expected: false },
      { input: [[]], expected: true },
      { input: [[1, 1]], expected: false },
      { input: [[10, 5, 15, 3, 7, null, 18]], expected: true },
    ],
    hint: "Pass down an allowed (low, high) interval for every node instead of only comparing with the parent.",
  },
  {
    id: "ds-029",
    title: "Iterative Inorder Traversal",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Return the inorder traversal of a binary search tree built from the given values, using an explicit stack instead of recursion.\n\nInsert the values in order (duplicates ignored). The iterative algorithm walks left pushing nodes, pops to visit, then moves to the right child.\n\nReturn the sorted list of values.",
    starterCode: `def inorder_traversal(values):
    # Your code here
    pass`,
    solution: `def inorder_traversal(values):
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
    out = []
    stack = []
    cur = root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = cur[1]
        cur = stack.pop()
        out.append(cur[0])
        cur = cur[2]
    return out`,
    testCases: [
      { input: [[5, 3, 8, 1]], expected: [1, 3, 5, 8] },
      { input: [[]], expected: [] },
      { input: [[2, 1]], expected: [1, 2] },
      { input: [[4, 2, 6, 1, 3, 5, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
    ],
    hint: "Push nodes while going left; pop, visit, then continue into the right child.",
  },
  {
    id: "ds-030",
    title: "Level-Order Traversal",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Return the level-order (breadth-first) traversal of a binary search tree built from the given values.\n\nInsert the values in order (duplicates ignored), then process the tree level by level, collecting each level as its own list.\n\nReturn a list of levels, or [] for an empty tree.",
    starterCode: `def level_order(values):
    # Your code here
    pass`,
    solution: `def level_order(values):
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
    if root is None:
        return []
    out = []
    level = [root]
    while level:
        out.append([node[0] for node in level])
        nxt = []
        for node in level:
            if node[1] is not None:
                nxt.append(node[1])
            if node[2] is not None:
                nxt.append(node[2])
        level = nxt
    return out`,
    testCases: [
      { input: [[5, 3, 8, 1]], expected: [[5], [3, 8], [1]] },
      { input: [[]], expected: [] },
      { input: [[2]], expected: [[2]] },
      { input: [[10, 5, 15, 3, 7, 12, 20]], expected: [[10], [5, 15], [3, 7, 12, 20]] },
    ],
    hint: "Process the current level, collect its values, and build the next level from its children.",
  },
  {
    id: "ds-031",
    title: "Build an Adjacency List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Build an adjacency list for an undirected graph with nodes numbered 0 to n-1.\n\nedges is a list of [u, v] pairs. Add v to the neighbor list of u and u to the neighbor list of v; multiple edges between the same pair are kept as separate entries.\n\nReturn the list of neighbor lists, each sorted in ascending order.",
    starterCode: `def build_adjacency_list(n, edges):
    # Your code here
    pass`,
    solution: `def build_adjacency_list(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for lst in adj:
        lst.sort()
    return adj`,
    testCases: [
      {
        input: [4, [[0, 1], [1, 2], [2, 3], [0, 3]]],
        expected: [[1, 3], [0, 2], [1, 3], [0, 2]],
      },
      { input: [3, []], expected: [[], [], []] },
      { input: [2, [[0, 1], [0, 1]]], expected: [[1, 1], [0, 0]] },
      { input: [4, [[0, 2]]], expected: [[2], [], [0], []] },
    ],
    hint: "Append both directions for every edge, then sort each neighbor list.",
  },
  {
    id: "ds-032",
    title: "Hash Map with Separate Chaining",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a hash map that resolves collisions with separate chaining.\n\nThere are bucket_count buckets indexed by key % bucket_count, and each bucket is a chain of key-value pairs. operations contains \"put\", \"get\", or \"remove\"; keys and values are parallel lists (values is only used by put). put records None, get returns the stored value or -1, and remove returns the removed value or -1 when the key is absent.\n\nReturn the list of recorded results.",
    starterCode: `def chained_hash_map(bucket_count, operations, keys, values):
    # Your code here
    pass`,
    solution: `def chained_hash_map(bucket_count, operations, keys, values):
    buckets = [[] for _ in range(bucket_count)]
    out = []
    for op, key, val in zip(operations, keys, values):
        chain = buckets[key % bucket_count]
        found = None
        for pair in chain:
            if pair[0] == key:
                found = pair
                break
        if op == "put":
            if found is None:
                chain.append([key, val])
            else:
                found[1] = val
            out.append(None)
        elif op == "get":
            out.append(found[1] if found is not None else -1)
        else:
            if found is None:
                out.append(-1)
            else:
                chain.remove(found)
                out.append(found[1])
    return out`,
    testCases: [
      {
        input: [
          5,
          ["put", "put", "get", "put", "get", "remove", "get"],
          [1, 6, 6, 1, 1, 6, 6],
          [10, 20, 0, 30, 0, 0, 0],
        ],
        expected: [null, null, 20, null, 30, 20, -1],
      },
      { input: [3, ["get", "remove"], [4, 4], [0, 0]], expected: [-1, -1] },
      {
        input: [1, ["put", "put", "get", "remove", "get"], [2, 3, 2, 3, 3], [5, 7, 0, 0, 0]],
        expected: [null, null, 5, 7, -1],
      },
      { input: [4, ["put", "get"], [-2, -2], [9, 0]], expected: [null, 9] },
    ],
    hint: "Search the chain for the key first; put updates in place, remove unlinks the pair.",
  },
  {
    id: "ds-033",
    title: "Union-Find Find with Path Compression",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Answer connectivity queries while applying path compression.\n\nparent is a list where parent[i] is the parent of i in a disjoint-set forest (a root points to itself). For each index in queries, find its root and compress the path so future lookups are shorter.\n\nReturn the list of roots, one per query.",
    starterCode: `def uf_find(parent, queries):
    # Your code here
    pass`,
    solution: `def uf_find(parent, queries):
    p = list(parent)

    def find(x):
        root = x
        while p[root] != root:
            root = p[root]
        while p[x] != root:
            nxt = p[x]
            p[x] = root
            x = nxt
        return root

    return [find(q) for q in queries]`,
    testCases: [
      { input: [[0, 0, 0, 1, 2, 4], [3, 4, 5, 1]], expected: [0, 0, 0, 0] },
      { input: [[0, 1, 2, 3, 4], [4, 3, 2, 1, 0]], expected: [4, 3, 2, 1, 0] },
      { input: [[0, 0, 1, 2, 3], [4, 3, 2]], expected: [0, 0, 0] },
      { input: [[0], [0, 0]], expected: [0, 0] },
    ],
    hint: "First walk to the root, then walk again pointing every node on the path at it.",
  },
  {
    id: "ds-034",
    title: "Union-Find Union by Rank",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a union-find (disjoint set) structure with union by rank and path halving.\n\noperations is a list of [\"union\", a, b] or [\"find\", x] commands. A union records True when it merged two different components and False when they were already connected; find records the root of x. Nodes are numbered 0 to n-1 and start in separate components.\n\nReturn the list of recorded results.",
    starterCode: `def uf_union(n, operations):
    # Your code here
    pass`,
    solution: `def uf_union(n, operations):
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    out = []
    for op in operations:
        if op[0] == "union":
            ra = find(op[1])
            rb = find(op[2])
            if ra == rb:
                out.append(False)
            else:
                if rank[ra] < rank[rb]:
                    ra, rb = rb, ra
                parent[rb] = ra
                if rank[ra] == rank[rb]:
                    rank[ra] += 1
                out.append(True)
        else:
            out.append(find(op[1]))
    return out`,
    testCases: [
      {
        input: [
          5,
          [
            ["union", 0, 1],
            ["find", 0],
            ["find", 1],
            ["union", 1, 2],
            ["find", 0],
            ["union", 0, 1],
          ],
        ],
        expected: [true, 0, 0, true, 0, false],
      },
      {
        input: [3, [["union", 0, 1], ["union", 1, 2], ["find", 2], ["find", 0]]],
        expected: [true, true, 0, 0],
      },
      {
        input: [2, [["find", 0], ["find", 1], ["union", 0, 1], ["find", 1]]],
        expected: [0, 1, true, 0],
      },
      {
        input: [4, [["union", 3, 2], ["union", 1, 0], ["union", 2, 0], ["find", 3]]],
        expected: [true, true, true, 3],
      },
    ],
    hint: "Attach the smaller-rank root under the larger one; equal ranks bump the winner's rank.",
  },
  {
    id: "ds-035",
    title: "Detect Cycle in Undirected Graph via DSU",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Detect whether an undirected graph contains a cycle using union-find.\n\nNodes are numbered 0 to n-1 and edges is a list of [u, v] pairs. Union the endpoints of each edge; if an edge connects two nodes that already share a root, a cycle exists.\n\nReturn True if the graph has a cycle, otherwise False. Self-loops and parallel edges count as cycles.",
    starterCode: `def has_cycle_dsu(n, edges):
    # Your code here
    pass`,
    solution: `def has_cycle_dsu(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru = find(u)
        rv = find(v)
        if ru == rv:
            return True
        parent[ru] = rv
    return False`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: true },
      { input: [5, [[0, 1], [1, 2], [3, 4]]], expected: false },
      { input: [2, [[0, 1], [1, 0]]], expected: true },
      { input: [1, []], expected: false },
    ],
    hint: "An edge whose endpoints are already connected closes a cycle.",
  },
  {
    id: "ds-036",
    title: "Segment Tree Range Sum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support range-sum queries and point updates on a list using a segment tree.\n\nnums is the initial array. queries is a list of [\"query\", l, r] (sum of nums[l] through nums[r] inclusive) or [\"update\", i, val] (set nums[i] = val), using 0-based indices. Build the tree once, then process the queries in order.\n\nReturn the list of query results in order.",
    starterCode: `def segment_tree_range_sum(nums, queries):
    # Your code here
    pass`,
    solution: `def segment_tree_range_sum(nums, queries):
    n = len(nums)
    tree = [0] * (4 * n) if n else []

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

    def update(node, lo, hi, idx, val):
        if lo == hi:
            tree[node] = val
            return
        mid = (lo + hi) // 2
        if idx <= mid:
            update(2 * node + 1, lo, mid, idx, val)
        else:
            update(2 * node + 2, mid + 1, hi, idx, val)
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2]

    def query(node, lo, hi, l, r):
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return tree[node]
        mid = (lo + hi) // 2
        return query(2 * node + 1, lo, mid, l, r) + query(2 * node + 2, mid + 1, hi, l, r)

    out = []
    for q in queries:
        if q[0] == "query":
            out.append(query(0, 0, n - 1, q[1], q[2]))
        else:
            update(0, 0, n - 1, q[1], q[2])
    return out`,
    testCases: [
      {
        input: [
          [1, 3, 5, 7, 9, 11],
          [["query", 1, 3], ["update", 1, 10], ["query", 1, 3], ["query", 0, 5]],
        ],
        expected: [15, 22, 43],
      },
      { input: [[5], [["query", 0, 0], ["update", 0, -3], ["query", 0, 0]]], expected: [5, -3] },
      { input: [[2, 4], [["query", 0, 1], ["update", 0, 100], ["query", 0, 0]]], expected: [6, 100] },
      {
        input: [[0, 0, 0, 0], [["query", 0, 3], ["update", 2, 7], ["query", 1, 2]]],
        expected: [0, 7],
      },
    ],
    hint: "Store each node's segment range; a query splits into O(log n) fully covered segments.",
  },
  {
    id: "ds-037",
    title: "Fenwick Tree Prefix Sum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Support point updates and prefix-sum queries with a Fenwick tree (binary indexed tree).\n\nnums is the initial array. queries is a list of [\"update\", i, delta] (add delta to nums[i]), [\"prefix\", i] (sum of nums[0] through nums[i] inclusive), or [\"range\", l, r] (sum of nums[l] through nums[r] inclusive), using 0-based indices.\n\nReturn the list of prefix and range results in order.",
    starterCode: `def fenwick_ops(nums, queries):
    # Your code here
    pass`,
    solution: `def fenwick_ops(nums, queries):
    n = len(nums)
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

    for idx, val in enumerate(nums):
        add(idx, val)
    out = []
    for q in queries:
        if q[0] == "update":
            add(q[1], q[2])
        elif q[0] == "prefix":
            out.append(prefix(q[1]))
        else:
            out.append(prefix(q[2]) - prefix(q[1] - 1))
    return out`,
    testCases: [
      {
        input: [[1, 2, 3, 4, 5], [["prefix", 2], ["update", 1, 10], ["prefix", 2], ["range", 1, 3]]],
        expected: [6, 16, 19],
      },
      { input: [[7], [["prefix", 0], ["update", 0, 3], ["prefix", 0]]], expected: [7, 10] },
      {
        input: [[0, 0, 0], [["range", 0, 2], ["update", 2, 5], ["range", 1, 2], ["prefix", 2]]],
        expected: [0, 5, 5],
      },
      { input: [[4, 2], [["range", 0, 1], ["update", 1, -2], ["prefix", 1]]], expected: [6, 4] },
    ],
    hint: "Update climbs i += i & -i; prefix query climbs i -= i & -i on the 1-based tree.",
  },
  {
    id: "ds-038",
    title: "LRU Cache",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a Least Recently Used (LRU) cache with the given capacity.\n\noperations contains \"put\" or \"get\". For put, values[i] is a [key, value] pair; for get, values[i] is the key. A get returns the stored value or -1 when missing. Both get and put mark the key as most recently used, and put evicts the least recently used key when the cache exceeds capacity.\n\nReturn the list of recorded results (None for put).",
    starterCode: `def lru_cache(capacity, operations, values):
    # Your code here
    pass`,
    solution: `def lru_cache(capacity, operations, values):
    from collections import OrderedDict

    cache = OrderedDict()
    out = []
    for op, val in zip(operations, values):
        if op == "put":
            key, value = val
            if key in cache:
                cache.move_to_end(key)
            cache[key] = value
            if len(cache) > capacity:
                cache.popitem(last=False)
            out.append(None)
        else:
            if val in cache:
                cache.move_to_end(val)
                out.append(cache[val])
            else:
                out.append(-1)
    return out`,
    testCases: [
      {
        input: [
          2,
          ["put", "put", "get", "put", "get", "get"],
          [[1, 1], [2, 2], 1, [3, 3], 2, 3],
        ],
        expected: [null, null, 1, null, -1, 3],
      },
      {
        input: [1, ["put", "get", "put", "get"], [[2, 1], 2, [3, 2], 2]],
        expected: [null, 1, null, -1],
      },
      { input: [2, ["get"], [5]], expected: [-1] },
      { input: [1, ["put", "put", "get"], [[1, 1], [1, 2], 1]], expected: [null, null, 2] },
    ],
    hint: "An OrderedDict keeps insertion order; move_to_end marks recent use and popitem(last=False) evicts.",
  },
  {
    id: "ds-039",
    title: "Median Finder with Two Heaps",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a data structure that supports adding numbers and querying the median.\n\noperations contains \"add\" (values[i] is the number) or \"find_median\" (values[i] is ignored). Keep a max-heap for the lower half and a min-heap for the upper half, rebalancing so their sizes differ by at most one. find_median returns the middle value, or the average of the two middle values as a float, or None when empty.\n\nReturn the list of recorded results.",
    starterCode: `def median_finder(operations, values):
    # Your code here
    pass`,
    solution: `import heapq


def median_finder(operations, values):
    lower = []
    upper = []
    out = []
    for op, val in zip(operations, values):
        if op == "add":
            heapq.heappush(lower, -val)
            heapq.heappush(upper, -heapq.heappop(lower))
            if len(upper) > len(lower):
                heapq.heappush(lower, -heapq.heappop(upper))
            out.append(None)
        else:
            if not lower:
                out.append(None)
            elif len(lower) > len(upper):
                out.append(float(-lower[0]))
            else:
                out.append((-lower[0] + upper[0]) / 2.0)
    return out`,
    testCases: [
      {
        input: [["add", "add", "find_median", "add", "find_median"], [1, 2, 0, 3, 0]],
        expected: [null, null, 1.5, null, 2.0],
      },
      { input: [["find_median"], [0]], expected: [null] },
      { input: [["add", "find_median"], [5, 0]], expected: [null, 5.0] },
      {
        input: [["add", "add", "add", "find_median"], [2, 1, 3, 0]],
        expected: [null, null, null, 2.0],
      },
    ],
    hint: "Push to the max-heap, move its top to the min-heap, then rebalance if the min-heap grew larger.",
  },
  {
    id: "ds-040",
    title: "Next Greater Element with Monotonic Stack",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "For each element in a list, find the next strictly greater element to its right.\n\nUse a monotonic decreasing stack of indices. When a new value is larger than the value at the index on top of the stack, it is the next greater element for that popped index.\n\nReturn a list where result[i] is the next greater value for nums[i], or -1 when none exists.",
    starterCode: `def next_greater(nums):
    # Your code here
    pass`,
    solution: `def next_greater(nums):
    out = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            out[stack.pop()] = x
        stack.append(i)
    return out`,
    testCases: [
      { input: [[2, 1, 2, 4, 3]], expected: [4, 2, 4, -1, -1] },
      { input: [[1, 2, 3, 4]], expected: [2, 3, 4, -1] },
      { input: [[4, 3, 2, 1]], expected: [-1, -1, -1, -1] },
      { input: [[]], expected: [] },
    ],
    hint: "Keep indices with decreasing values; a larger value arriving resolves every smaller top.",
  },
];
