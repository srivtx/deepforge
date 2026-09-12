import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "ds-041",
    title: "Rotate Array by Reversal",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Rotate an array to the right by k steps using only reversal operations.\n\nk may be larger than the array length, so reduce it modulo n first. The standard trick is to reverse the whole array, then reverse the first k elements, then reverse the remaining n-k elements.\n\nReturn a new rotated list.",
    starterCode: `def rotate_by_reversal(nums, k):
    # Your code here
    pass`,
    solution: `def rotate_by_reversal(nums, k):
    n = len(nums)
    if n == 0:
        return []
    k = k % n
    arr = list(nums)

    def reverse(lo, hi):
        while lo < hi:
            arr[lo], arr[hi] = arr[hi], arr[lo]
            lo += 1
            hi -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return arr`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [5, 6, 7, 1, 2, 3, 4] },
      { input: [[1, 2], 0], expected: [1, 2] },
      { input: [[], 5], expected: [] },
      { input: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100] },
      { input: [[1, 2, 3], 5], expected: [2, 3, 1] },
    ],
    hint: "Reversing the whole array then the two pieces turns a rotation into three reversals.",
  },
  {
    id: "ds-042",
    title: "Partition Array by Pivot",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Partition an array into three stable regions relative to a pivot value.\n\nElements smaller than pivot come first, then elements equal to pivot, then elements greater than pivot. Equal and remaining elements keep their relative order within each region.\n\nReturn the concatenated result.",
    starterCode: `def partition_by_pivot(nums, pivot):
    # Your code here
    pass`,
    solution: `def partition_by_pivot(nums, pivot):
    less = []
    equal = []
    greater = []
    for x in nums:
        if x < pivot:
            less.append(x)
        elif x == pivot:
            equal.append(x)
        else:
            greater.append(x)
    return less + equal + greater`,
    testCases: [
      { input: [[9, 3, 5, 1, 5, 7], 5], expected: [3, 1, 5, 5, 9, 7] },
      { input: [[], 3], expected: [] },
      { input: [[2, 2, 2], 2], expected: [2, 2, 2] },
      { input: [[-1, 0, -5, 3], 0], expected: [-1, -5, 0, 3] },
    ],
    hint: "Collect three lists and concatenate them in the order less, equal, greater.",
  },
  {
    id: "ds-043",
    title: "Find Missing and Duplicate",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "An array of length n contains the integers 1 through n with exactly one value duplicated and one value missing.\n\nScan the array with a set to find the duplicated value, then scan 1 through n to find the value that never appears.\n\nReturn [duplicate, missing].",
    starterCode: `def find_missing_duplicate(nums):
    # Your code here
    pass`,
    solution: `def find_missing_duplicate(nums):
    seen = set()
    duplicate = -1
    for x in nums:
        if x in seen:
            duplicate = x
        seen.add(x)
    missing = -1
    for v in range(1, len(nums) + 1):
        if v not in seen:
            missing = v
            break
    return [duplicate, missing]`,
    testCases: [
      { input: [[1, 2, 2, 4]], expected: [2, 3] },
      { input: [[1, 1]], expected: [1, 2] },
      { input: [[2, 3, 3, 4]], expected: [3, 1] },
      { input: [[1, 2, 3, 4, 4]], expected: [4, 5] },
    ],
    hint: "A set tells you both which value repeats and which of 1..n is absent.",
  },
  {
    id: "ds-044",
    title: "Majority Element (Boyer-Moore)",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Find the majority element (appearing more than n // 2 times) using the Boyer-Moore voting algorithm.\n\nMaintain a candidate and a counter: when the counter reaches zero adopt the current value as the candidate, a matching value increments the counter, and a different value decrements it. After the pass, verify the candidate really exceeds n // 2.\n\nReturn the majority value, or None when no value qualifies (including for an empty list).",
    starterCode: `def majority_element(nums):
    # Your code here
    pass`,
    solution: `def majority_element(nums):
    candidate = None
    count = 0
    for x in nums:
        if count == 0:
            candidate = x
            count = 1
        elif x == candidate:
            count += 1
        else:
            count -= 1
    if candidate is None:
        return None
    if nums.count(candidate) > len(nums) // 2:
        return candidate
    return None`,
    testCases: [
      { input: [[3, 2, 3]], expected: 3 },
      { input: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
      { input: [[1, 2, 3]], expected: null },
      { input: [[5]], expected: 5 },
      { input: [[]], expected: null },
    ],
    hint: "Pairing off different values leaves the majority candidate standing; verify it afterwards.",
  },
  {
    id: "ds-045",
    title: "Two-Sum Indices with Hash Set",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the indices of two values in nums that add up to target.\n\nScan once with a dictionary from value to index; for each element check whether target minus that element has already been seen. Use the earliest j that works.\n\nReturn [i, j] with i < j, or an empty list when no pair exists.",
    starterCode: `def two_sum_indices(nums, target):
    # Your code here
    pass`,
    solution: `def two_sum_indices(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        if x not in seen:
            seen[x] = i
    return []`,
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[1, 2, 3], 7], expected: [] },
      { input: [[], 5], expected: [] },
    ],
    hint: "Store each value's first index and look up the complement before inserting.",
  },
  {
    id: "ds-046",
    title: "Intersection of Two Arrays",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Compute the intersection of two arrays, returning each common value once.\n\nConvert both inputs to sets and take their intersection.\n\nReturn the common values sorted in ascending order.",
    starterCode: `def array_intersection(a, b):
    # Your code here
    pass`,
    solution: `def array_intersection(a, b):
    return sorted(set(a) & set(b))`,
    testCases: [
      { input: [[1, 2, 2, 1], [2, 2]], expected: [2] },
      { input: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [4, 9] },
      { input: [[], [1]], expected: [] },
      { input: [[1, 2], [3, 4]], expected: [] },
    ],
    hint: "Python sets support intersection with the & operator.",
  },
  {
    id: "ds-047",
    title: "Union of Sorted Arrays",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Merge two sorted arrays into their sorted union without duplicates.\n\nAdvance two pointers, always taking the smaller current value, and skip a value when it equals the last one appended. Both inputs are sorted in non-decreasing order.\n\nReturn the union as a sorted list of unique values.",
    starterCode: `def union_sorted(a, b):
    # Your code here
    pass`,
    solution: `def union_sorted(a, b):
    out = []
    i = 0
    j = 0
    while i < len(a) or j < len(b):
        if j >= len(b) or (i < len(a) and a[i] <= b[j]):
            v = a[i]
            i += 1
        else:
            v = b[j]
            j += 1
        if not out or out[-1] != v:
            out.append(v)
    return out`,
    testCases: [
      { input: [[1, 2, 3], [2, 3, 4]], expected: [1, 2, 3, 4] },
      { input: [[], []], expected: [] },
      { input: [[1, 1, 2], [2, 3]], expected: [1, 2, 3] },
      { input: [[-3, 0], [0, 5]], expected: [-3, 0, 5] },
    ],
    hint: "Skip a value whenever it matches the last element already in the output.",
  },
  {
    id: "ds-048",
    title: "Merge Intervals",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Merge all overlapping intervals.\n\nintervals is a list of [start, end] pairs. Sort by start, then extend the current merged interval while the next start is at most the current end; touching intervals such as [1,4] and [4,5] merge.\n\nReturn the merged intervals sorted by start.",
    starterCode: `def merge_intervals(intervals):
    # Your code here
    pass`,
    solution: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda p: (p[0], p[1]))
    out = [list(ordered[0])]
    for lo, hi in ordered[1:]:
        if lo <= out[-1][1]:
            if hi > out[-1][1]:
                out[-1][1] = hi
        else:
            out.append([lo, hi])
    return out`,
    testCases: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[1, 2]]], expected: [[1, 2]] },
      { input: [[]], expected: [] },
      { input: [[[5, 6], [1, 2], [2, 3]]], expected: [[1, 3], [5, 6]] },
    ],
    hint: "After sorting by start, only the end of the last merged interval matters.",
  },
  {
    id: "ds-049",
    title: "Insert into Sorted Array",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Insert value into an already sorted list, keeping it sorted.\n\nBuild the output by copying elements until the first element strictly greater than value, insert value there, then continue copying; append value at the end if no larger element exists. Duplicate values are placed after existing equal ones.\n\nReturn the new list without modifying nums.",
    starterCode: `def insert_sorted(nums, value):
    # Your code here
    pass`,
    solution: `def insert_sorted(nums, value):
    out = []
    placed = False
    for x in nums:
        if not placed and x > value:
            out.append(value)
            placed = True
        out.append(x)
    if not placed:
        out.append(value)
    return out`,
    testCases: [
      { input: [[1, 3, 5], 4], expected: [1, 3, 4, 5] },
      { input: [[1, 1, 2], 1], expected: [1, 1, 1, 2] },
      { input: [[], 5], expected: [5] },
      { input: [[2, 4], 0], expected: [0, 2, 4] },
    ],
    hint: "Insert right before the first element that is strictly greater than the new value.",
  },
  {
    id: "ds-050",
    title: "Binary Search on Sorted List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Find the index of target in a sorted list using binary search.\n\nRepeatedly halve the search range: compare the middle element with target and move the low or high pointer accordingly. When duplicates exist, any matching index is acceptable and this implementation returns the first midpoint that matches.\n\nReturn -1 when target is absent.",
    starterCode: `def binary_search(nums, target):
    # Your code here
    pass`,
    solution: `def binary_search(nums, target):
    lo = 0
    hi = len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[], 1], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[2, 2, 2], 2], expected: 1 },
    ],
    hint: "Keep lo <= hi and discard the half that cannot contain the target.",
  },
  {
    id: "ds-051",
    title: "First and Last Occurrence",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the first and last index of target in a sorted list using binary search.\n\nRun the binary search twice: in one pass keep searching left after a match to find the first occurrence, and in the other keep searching right to find the last occurrence.\n\nReturn [first, last], or [-1, -1] when target is absent.",
    starterCode: `def first_last_occurrence(nums, target):
    # Your code here
    pass`,
    solution: `def first_last_occurrence(nums, target):
    def bound(find_first):
        lo = 0
        hi = len(nums) - 1
        ans = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                ans = mid
                if find_first:
                    hi = mid - 1
                else:
                    lo = mid + 1
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return ans

    return [bound(True), bound(False)]`,
    testCases: [
      { input: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { input: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { input: [[], 1], expected: [-1, -1] },
      { input: [[2, 2], 2], expected: [0, 1] },
    ],
    hint: "After a match, keep going left (or right) instead of returning immediately.",
  },
  {
    id: "ds-052",
    title: "Count Occurrences in Sorted Array",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count how many times target appears in a sorted list using binary search.\n\nFind the first and last occurrence with two bounded binary searches; the answer is last minus first plus one.\n\nReturn 0 when target is absent.",
    starterCode: `def count_occurrences(nums, target):
    # Your code here
    pass`,
    solution: `def count_occurrences(nums, target):
    def bound(find_first):
        lo = 0
        hi = len(nums) - 1
        ans = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                ans = mid
                if find_first:
                    hi = mid - 1
                else:
                    lo = mid + 1
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return ans

    first = bound(True)
    if first == -1:
        return 0
    return bound(False) - first + 1`,
    testCases: [
      { input: [[1, 1, 2, 2, 2, 3], 2], expected: 3 },
      { input: [[1, 2, 3], 4], expected: 0 },
      { input: [[], 5], expected: 0 },
      { input: [[5, 5, 5, 5], 5], expected: 4 },
    ],
    hint: "Count equals last index minus first index plus one.",
  },
  {
    id: "ds-053",
    title: "Floor and Ceil in Sorted Array",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the floor and ceiling of target in a sorted list.\n\nThe floor is the greatest value less than or equal to target and the ceiling is the smallest value greater than or equal to target. Use binary search, recording candidate floors while moving right and candidate ceilings while moving left.\n\nReturn [floor, ceiling], where either entry is None when it does not exist.",
    starterCode: `def floor_ceil(nums, target):
    # Your code here
    pass`,
    solution: `def floor_ceil(nums, target):
    lo = 0
    hi = len(nums) - 1
    floor_val = None
    ceil_val = None
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return [target, target]
        elif nums[mid] < target:
            floor_val = nums[mid]
            lo = mid + 1
        else:
            ceil_val = nums[mid]
            hi = mid - 1
    return [floor_val, ceil_val]`,
    testCases: [
      { input: [[1, 3, 5, 7], 4], expected: [3, 5] },
      { input: [[1, 3, 5, 7], 5], expected: [5, 5] },
      { input: [[2, 4], 1], expected: [null, 2] },
      { input: [[2, 4], 9], expected: [4, null] },
      { input: [[], 3], expected: [null, null] },
    ],
    hint: "Every smaller midpoint is a floor candidate; every larger one is a ceiling candidate.",
  },
  {
    id: "ds-054",
    title: "Run-Length Decode",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Decode a run-length encoded vector.\n\npairs is a list of [count, value] pairs; each pair expands to count copies of value. A count of zero contributes nothing.\n\nReturn the decoded list.",
    starterCode: `def rle_decode(pairs):
    # Your code here
    pass`,
    solution: `def rle_decode(pairs):
    out = []
    for count, value in pairs:
        out.extend([value] * count)
    return out`,
    testCases: [
      { input: [[[2, "a"], [1, "b"], [3, "a"]]], expected: ["a", "a", "b", "a", "a", "a"] },
      { input: [[]], expected: [] },
      { input: [[[0, 5]]], expected: [] },
      { input: [[[2, -1], [2, 0]]], expected: [-1, -1, 0, 0] },
    ],
    hint: "Multiply a one-element list by the count and extend the output.",
  },
  {
    id: "ds-055",
    title: "Sparse Vector Dot Product",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Compute the dot product of two sparse vectors represented as dictionaries.\n\nEach dictionary maps an index (as a string key) to its value, and missing indices are zero. Iterate over the first dictionary and add its value times the matching value from the second when the key is present.\n\nReturn the integer dot product (0 when there are no shared indices).",
    starterCode: `def sparse_dot(a, b):
    # Your code here
    pass`,
    solution: `def sparse_dot(a, b):
    total = 0
    for key, val in a.items():
        if key in b:
            total += val * b[key]
    return total`,
    testCases: [
      { input: [{ "0": 1, "3": 5 }, { "0": 2, "3": -1, "7": 4 }], expected: -3 },
      { input: [{ "1": 2 }, { "2": 3 }], expected: 0 },
      { input: [{}, {}], expected: 0 },
      { input: [{ "5": -3 }, { "5": 4 }], expected: -12 },
    ],
    hint: "Only keys present in both dictionaries contribute to the product.",
  },
  {
    id: "ds-056",
    title: "Circular Array Next Greater Element",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "For each element of a circular array, find the next strictly greater element.\n\nSearch up to n-1 positions ahead, wrapping around the end of the array. Iterate over the array twice (2n positions) with a monotonic stack of indices to resolve every element once.\n\nReturn a list where result[i] is the next greater value or -1 when none exists.",
    starterCode: `def next_greater_circular(nums):
    # Your code here
    pass`,
    solution: `def next_greater_circular(nums):
    n = len(nums)
    out = [-1] * n
    stack = []
    for i in range(2 * n):
        idx = i % n
        while stack and nums[stack[-1]] < nums[idx]:
            out[stack.pop()] = nums[idx]
        if i < n:
            stack.append(idx)
    return out`,
    testCases: [
      { input: [[1, 2, 1]], expected: [2, -1, 2] },
      { input: [[5, 4, 3, 2, 1]], expected: [-1, 5, 5, 5, 5] },
      { input: [[3, 1, 4, 2]], expected: [4, 4, -1, 3] },
      { input: [[2, 2, 3]], expected: [3, 3, -1] },
      { input: [[]], expected: [] },
    ],
    hint: "Loop twice over the indices; only push on the first pass to avoid duplicates.",
  },
  {
    id: "ds-057",
    title: "Stack Using a Queue",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Simulate a stack using only a single queue.\n\noperations contains \"push\", \"pop\", \"top\", or \"empty\"; values provides the pushed value (ignored otherwise). On push, append the value and then rotate all earlier elements behind it so the newest element is always at the front. Record None for push, the removed value (or None if empty) for pop, the top value (or None if empty) for top, and a boolean for empty.\n\nReturn the list of recorded results.",
    starterCode: `def queue_stack_ops(operations, values):
    # Your code here
    pass`,
    solution: `def queue_stack_ops(operations, values):
    q = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            q.append(val)
            for _ in range(len(q) - 1):
                q.append(q.pop(0))
            out.append(None)
        elif op == "pop":
            out.append(q.pop(0) if q else None)
        elif op == "top":
            out.append(q[0] if q else None)
        else:
            out.append(not q)
    return out`,
    testCases: [
      {
        input: [["push", "push", "top", "pop", "empty"], [1, 2, 0, 0, 0]],
        expected: [null, null, 2, 2, false],
      },
      { input: [["pop", "top", "empty"], [0, 0, 0]], expected: [null, null, true] },
      { input: [["push", "pop", "pop"], [5, 0, 0]], expected: [null, 5, null] },
      { input: [["push", "push", "push", "pop"], [1, 2, 3, 0]], expected: [null, null, null, 3] },
    ],
    hint: "After appending, rotate the new element to the front by moving n-1 elements to the back.",
  },
  {
    id: "ds-058",
    title: "Sort a Stack",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Sort the values of a stack using only stack operations.\n\nvalues is the current stack from bottom to top. Pop each element and insert it into a helper stack, first moving larger elements from the helper back to the input stack, which keeps the helper sorted from bottom to top. No general-purpose sort may be used.\n\nReturn the sorted stack from bottom to top (smallest at the bottom).",
    starterCode: `def sort_stack(values):
    # Your code here
    pass`,
    solution: `def sort_stack(values):
    stack = list(values)
    helper = []
    while stack:
        tmp = stack.pop()
        while helper and helper[-1] > tmp:
            stack.append(helper.pop())
        helper.append(tmp)
    return helper`,
    testCases: [
      { input: [[3, 1, 2]], expected: [1, 2, 3] },
      { input: [[]], expected: [] },
      { input: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { input: [[1, 3, 2]], expected: [1, 2, 3] },
    ],
    hint: "Insertion sort using a second stack: move larger elements out of the way before placing each value.",
  },
  {
    id: "ds-059",
    title: "Two Stacks in One Array",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Implement two stacks inside one fixed-size array, growing toward each other from opposite ends.\n\nstack_ids[i] is 0 or 1, operations[i] is \"push\", \"pop\", \"top\", \"size\", or \"is_full\", and values[i] is the pushed value. Stack 0 grows from index 0 upward while stack 1 grows from index capacity-1 downward, and a push fails when no free slot remains. push records a boolean, pop and top record a value or None, size records an int, and is_full records a boolean.\n\nReturn the list of recorded results.",
    starterCode: `def two_stacks_one_array(capacity, stack_ids, operations, values):
    # Your code here
    pass`,
    solution: `def two_stacks_one_array(capacity, stack_ids, operations, values):
    arr = [None] * capacity
    top0 = -1
    top1 = capacity
    out = []
    for sid, op, val in zip(stack_ids, operations, values):
        if op == "push":
            if top0 + 1 == top1:
                out.append(False)
            elif sid == 0:
                top0 += 1
                arr[top0] = val
                out.append(True)
            else:
                top1 -= 1
                arr[top1] = val
                out.append(True)
        elif op == "pop":
            if sid == 0:
                if top0 < 0:
                    out.append(None)
                else:
                    out.append(arr[top0])
                    top0 -= 1
            else:
                if top1 >= capacity:
                    out.append(None)
                else:
                    out.append(arr[top1])
                    top1 += 1
        elif op == "top":
            if sid == 0:
                out.append(arr[top0] if top0 >= 0 else None)
            else:
                out.append(arr[top1] if top1 < capacity else None)
        elif op == "size":
            if sid == 0:
                out.append(top0 + 1)
            else:
                out.append(capacity - top1)
        else:
            out.append(top0 + 1 == top1)
    return out`,
    testCases: [
      {
        input: [
          4,
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
          ["push", "push", "push", "push", "size", "size", "top", "top", "is_full", "pop", "pop"],
          [1, 10, 2, 20, 0, 0, 0, 0, 0, 0, 0],
        ],
        expected: [true, true, true, true, 2, 2, 2, 20, true, 2, 20],
      },
      {
        input: [1, [0, 1, 0, 0], ["push", "push", "pop", "pop"], [5, 6, 0, 0]],
        expected: [true, false, 5, null],
      },
      { input: [2, [0, 1], ["pop", "top"], [0, 0]], expected: [null, null] },
      {
        input: [
          3,
          [0, 0, 1, 0, 1, 1, 0],
          ["push", "push", "push", "is_full", "pop", "size", "size"],
          [1, 2, 9, 0, 0, 0, 0],
        ],
        expected: [true, true, true, true, 9, 0, 2],
      },
    ],
    hint: "The stacks meet when top0 + 1 equals top1; track a top index for each end.",
  },
  {
    id: "ds-060",
    title: "Min Queue with O(1) Minimum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a queue that supports push, pop, and get_min, all in O(1) amortized time.\n\noperations contains \"push\", \"pop\", or \"get_min\"; values provides the pushed value (ignored otherwise). Use two stacks: one for incoming and one for outgoing elements, each carrying a stack of running minima. push records None, pop returns the removed front value or None, and get_min returns the smallest value currently in the queue or None.\n\nReturn the list of recorded results.",
    starterCode: `def min_queue(operations, values):
    # Your code here
    pass`,
    solution: `def min_queue(operations, values):
    inbox = []
    inbox_mins = []
    outbox = []
    outbox_mins = []
    out = []
    for op, val in zip(operations, values):
        if op == "push":
            inbox.append(val)
            if not inbox_mins or val <= inbox_mins[-1]:
                inbox_mins.append(val)
            out.append(None)
        elif op == "pop":
            if not outbox:
                while inbox:
                    v = inbox.pop()
                    outbox.append(v)
                    if not outbox_mins or v <= outbox_mins[-1]:
                        outbox_mins.append(v)
                inbox_mins = []
            if not outbox:
                out.append(None)
            else:
                v = outbox.pop()
                if outbox_mins and outbox_mins[-1] == v:
                    outbox_mins.pop()
                out.append(v)
        else:
            best = None
            if inbox_mins:
                best = inbox_mins[-1]
            if outbox_mins and (best is None or outbox_mins[-1] < best):
                best = outbox_mins[-1]
            out.append(best)
    return out`,
    testCases: [
      { input: [["push", "push", "pop", "get_min"], [1, 2, 0, 0]], expected: [null, null, 1, 2] },
      {
        input: [["push", "push", "push", "get_min", "pop", "get_min"], [3, 1, 2, 0, 0, 0]],
        expected: [null, null, null, 1, 3, 1],
      },
      { input: [["pop", "get_min"], [0, 0]], expected: [null, null] },
      {
        input: [["push", "push", "pop", "pop", "get_min"], [5, 5, 0, 0, 0]],
        expected: [null, null, 5, 5, null],
      },
      {
        input: [["push", "push", "get_min", "pop", "push", "get_min"], [2, 1, 0, 0, 3, 0]],
        expected: [null, null, 1, 2, null, 1],
      },
    ],
    hint: "Each stack keeps a parallel stack of minima; the queue minimum is the smaller of the two tops.",
  },
  {
    id: "ds-061",
    title: "Sliding Window Maximum",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Return the maximum of every contiguous window of size k.\n\nUse a monotonic deque of indices whose values are decreasing: before appending a new index pop smaller values from the back, and pop the front when it has fallen outside the window.\n\nReturn the list of window maxima. Return [] when k is not positive or larger than the array.",
    starterCode: `def sliding_window_max(nums, k):
    # Your code here
    pass`,
    solution: `def sliding_window_max(nums, k):
    if k <= 0 or k > len(nums):
        return []
    dq = []
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.pop(0)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
    testCases: [
      { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { input: [[1], 1], expected: [1] },
      { input: [[9, 8, 7], 5], expected: [] },
      { input: [[4, 4, 4], 2], expected: [4, 4] },
      { input: [[1, -1], 1], expected: [1, -1] },
    ],
    hint: "The deque front is always the index of the current window maximum.",
  },
  {
    id: "ds-062",
    title: "Cycle Length in Linked List",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the length of the cycle in a linked list, or 0 when there is none.\n\nvalues holds the node values and pos is the index the tail links back to, or -1 for no cycle. Use Floyd's tortoise and hare to find a meeting point, then walk the cycle from that point until returning to it while counting nodes.\n\nReturn the number of nodes in the cycle.",
    starterCode: `def cycle_length(values, pos):
    # Your code here
    pass`,
    solution: `def cycle_length(values, pos):
    n = len(values)
    if n == 0 or pos < 0:
        return 0
    nxt = [i + 1 for i in range(n)]
    nxt[n - 1] = pos
    slow = 0
    fast = 0
    while fast != -1 and nxt[fast] != -1:
        slow = nxt[slow]
        fast = nxt[nxt[fast]]
        if slow == fast:
            count = 1
            cur = nxt[slow]
            while cur != slow:
                count += 1
                cur = nxt[cur]
            return count
    return 0`,
    testCases: [
      { input: [[3, 2, 0, -4], 1], expected: 3 },
      { input: [[1, 2], 0], expected: 2 },
      { input: [[1], 0], expected: 1 },
      { input: [[1, 2, 3], -1], expected: 0 },
      { input: [[], -1], expected: 0 },
    ],
    hint: "Once the pointers meet, walk one pointer around the loop until it returns to the meeting node.",
  },
  {
    id: "ds-063",
    title: "Split Linked List in Half",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Split a singly linked list into two halves.\n\nWhen the list has an odd number of nodes, the first half receives the extra node, so it gets the first ceil(n/2) values and the second half gets the rest.\n\nReturn [first_half, second_half], where either may be empty.",
    starterCode: `def split_list(values):
    # Your code here
    pass`,
    solution: `def split_list(values):
    mid = (len(values) + 1) // 2
    return [list(values[:mid]), list(values[mid:])]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [[1, 2, 3], [4, 5]] },
      { input: [[1, 2, 3, 4]], expected: [[1, 2], [3, 4]] },
      { input: [[]], expected: [[], []] },
      { input: [[1]], expected: [[1], []] },
    ],
    hint: "The split point is (n + 1) // 2, which gives the first half one extra node when n is odd.",
  },
  {
    id: "ds-064",
    title: "Reorder List",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Reorder a linked list by interleaving the first half with the reversed second half.\n\nThe result follows L0, Ln-1, L1, Ln-2, ... until all nodes are used. The first half keeps the extra node when the length is odd.\n\nReturn the reordered values.",
    starterCode: `def reorder_list(values):
    # Your code here
    pass`,
    solution: `def reorder_list(values):
    n = len(values)
    first = values[:(n + 1) // 2]
    second = values[(n + 1) // 2:][::-1]
    out = []
    for i in range(len(first)):
        out.append(first[i])
        if i < len(second):
            out.append(second[i])
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { input: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
    ],
    hint: "Split at the middle, reverse the second half, then alternate taking from each half.",
  },
  {
    id: "ds-065",
    title: "Add Two Numbers as Lists",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Add two non-negative integers whose digits are stored as linked lists in least-significant-first order.\n\na and b are lists of decimal digits with the ones digit first. Walk both lists with a carry and append sum % 10 at each step, continuing while any digits or carry remain.\n\nReturn the sum as a digit list in the same least-significant-first order.",
    starterCode: `def add_two_numbers(a, b):
    # Your code here
    pass`,
    solution: `def add_two_numbers(a, b):
    out = []
    i = 0
    j = 0
    carry = 0
    while i < len(a) or j < len(b) or carry:
        s = carry
        if i < len(a):
            s += a[i]
            i += 1
        if j < len(b):
            s += b[j]
            j += 1
        out.append(s % 10)
        carry = s // 10
    return out`,
    testCases: [
      { input: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { input: [[0], [0]], expected: [0] },
      { input: [[9, 9], [1]], expected: [0, 0, 1] },
      { input: [[9], [9]], expected: [8, 1] },
      { input: [[1, 8], [0]], expected: [1, 8] },
    ],
    hint: "Process one digit per list per step and keep the carry until both lists and the carry are exhausted.",
  },
  {
    id: "ds-066",
    title: "Palindrome Linked List",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether a singly linked list reads the same forwards and backwards.\n\nvalues holds the node values in order. Use two pointers moving inward from both ends.\n\nReturn True for a palindrome, including the empty list, and False otherwise.",
    starterCode: `def is_palindrome_list(values):
    # Your code here
    pass`,
    solution: `def is_palindrome_list(values):
    i = 0
    j = len(values) - 1
    while i < j:
        if values[i] != values[j]:
            return False
        i += 1
        j -= 1
    return True`,
    testCases: [
      { input: [[1, 2, 2, 1]], expected: true },
      { input: [[1, 2]], expected: false },
      { input: [[]], expected: true },
      { input: [[1, 2, 1]], expected: true },
      { input: [[1, 2, 3]], expected: false },
    ],
    hint: "Compare the first value with the last, the second with the second-to-last, and so on.",
  },
  {
    id: "ds-067",
    title: "Intersection Point of Two Lists",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find where two singly linked lists merge.\n\na and b hold the node values, and a[skip_a:] and b[skip_b:] are the shared tail. Align the pointers by advancing the pointer in the longer tail by the length difference, then walk forward until the values first match.\n\nReturn the index in b where the shared tail begins, or -1 when there is no intersection.",
    starterCode: `def list_intersection(a, b, skip_a, skip_b):
    # Your code here
    pass`,
    solution: `def list_intersection(a, b, skip_a, skip_b):
    i = skip_a
    j = skip_b
    diff = (len(a) - skip_a) - (len(b) - skip_b)
    if diff > 0:
        i += diff
    else:
        j += -diff
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            return j
        i += 1
        j += 1
    return -1`,
    testCases: [
      { input: [[4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5], 2, 3], expected: 3 },
      { input: [[1, 9, 1, 2, 4], [3, 2, 4], 3, 1], expected: 1 },
      { input: [[2, 6, 4], [1, 5], 3, 2], expected: -1 },
      { input: [[1], [1], 0, 0], expected: 0 },
    ],
    hint: "Skip the length difference between the tails first so both pointers reach the shared part together.",
  },
  {
    id: "ds-068",
    title: "Delete Middle Node",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Delete the middle node from a singly linked list.\n\nThe middle is the node at zero-based index n // 2. A single-node list becomes empty and an empty list stays empty.\n\nReturn the remaining values as a new list.",
    starterCode: `def delete_middle(values):
    # Your code here
    pass`,
    solution: `def delete_middle(values):
    out = list(values)
    if not out:
        return []
    del out[len(out) // 2]
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [1, 2, 4, 5] },
      { input: [[1, 2, 3, 4]], expected: [1, 2, 4] },
      { input: [[1]], expected: [] },
      { input: [[]], expected: [] },
    ],
    hint: "Find the middle with slow and fast pointers, or simply compute n // 2.",
  },
  {
    id: "ds-069",
    title: "Nth Node from End",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Return the value of the n-th node from the end of a singly linked list.\n\nn is 1-based, so n = 1 is the last node. Use the two-pointer trick: advance a lead pointer n steps, then move both pointers until the lead reaches the end.\n\nReturn None when n is out of range.",
    starterCode: `def nth_from_end(values, n):
    # Your code here
    pass`,
    solution: `def nth_from_end(values, n):
    if n <= 0 or n > len(values):
        return None
    return values[len(values) - n]`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: 4 },
      { input: [[1], 1], expected: 1 },
      { input: [[1, 2], 3], expected: null },
      { input: [[], 1], expected: null },
    ],
    hint: "The n-th node from the end sits at index length - n.",
  },
  {
    id: "ds-070",
    title: "BST Floor and Ceil",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Find the floor and ceiling of a target in a binary search tree.\n\nInsert values in order (duplicates ignored), then walk from the root: when the node value is less than the target record it as the floor and go right; when it is greater record it as the ceiling and go left; stop at an exact match.\n\nReturn [floor, ceiling] with None for missing entries.",
    starterCode: `def bst_floor_ceil(values, target):
    # Your code here
    pass`,
    solution: `def bst_floor_ceil(values, target):
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
    floor_val = None
    ceil_val = None
    node = root
    while node is not None:
        if node[0] == target:
            return [target, target]
        elif node[0] < target:
            floor_val = node[0]
            node = node[2]
        else:
            ceil_val = node[0]
            node = node[1]
    return [floor_val, ceil_val]`,
    testCases: [
      { input: [[8, 4, 12, 2, 6, 10, 14], 5], expected: [4, 6] },
      { input: [[8, 4, 12], 8], expected: [8, 8] },
      { input: [[8, 4, 12], 3], expected: [null, 4] },
      { input: [[], 5], expected: [null, null] },
      { input: [[5, 3, 7], 6], expected: [5, 7] },
    ],
    hint: "Smaller nodes are floor candidates on the way right; larger nodes are ceiling candidates on the way left.",
  },
  {
    id: "ds-071",
    title: "BST Kth Smallest",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Return the k-th smallest value in a binary search tree.\n\nInsert values in order (duplicates ignored) and run an iterative inorder traversal, which visits values in sorted order. Stop and return once the k-th node is visited; k is 1-based and valid for the tree.\n\nReturn the k-th smallest value.",
    starterCode: `def bst_kth_smallest(values, k):
    # Your code here
    pass`,
    solution: `def bst_kth_smallest(values, k):
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
    count = 0
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = cur[1]
        cur = stack.pop()
        count += 1
        if count == k:
            return cur[0]
        cur = cur[2]
    return None`,
    testCases: [
      { input: [[5, 3, 6, 2, 4, 1], 3], expected: 3 },
      { input: [[1], 1], expected: 1 },
      { input: [[5, 3, 8, 1, 4], 4], expected: 5 },
      { input: [[2, 1, 3], 1], expected: 1 },
    ],
    hint: "An inorder traversal of a BST visits values in increasing order.",
  },
  {
    id: "ds-072",
    title: "BST Range Sum",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Sum all values of a binary search tree that lie within [lo, hi] inclusive.\n\nInsert values in order (duplicates ignored). Traverse the tree adding values in range, and prune the left subtree when the current value is at most lo and the right subtree when it is at least hi.\n\nReturn the range sum (0 for an empty tree).",
    starterCode: `def bst_range_sum(values, lo, hi):
    # Your code here
    pass`,
    solution: `def bst_range_sum(values, lo, hi):
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
    total = 0
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        if lo <= node[0] <= hi:
            total += node[0]
        if node[0] > lo:
            stack.append(node[1])
        if node[0] < hi:
            stack.append(node[2])
    return total`,
    testCases: [
      { input: [[10, 5, 15, 3, 7, 18], 7, 15], expected: 32 },
      { input: [[1], 1, 1], expected: 1 },
      { input: [[], 1, 5], expected: 0 },
      { input: [[5, 3, 8], 4, 9], expected: 13 },
    ],
    hint: "Only descend left when the node exceeds lo and right when it is below hi.",
  },
  {
    id: "ds-073",
    title: "BST Delete",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Delete a key from a binary search tree and return the preorder traversal of the result.\n\nInsert values in order (duplicates ignored). The delete handles all cases: a leaf is removed directly, a node with one child is replaced by that child, and a node with two children is replaced by its inorder successor before that successor is deleted from the right subtree. If the key is absent the tree is unchanged.\n\nReturn the preorder values (node, then left, then right).",
    starterCode: `def bst_delete(values, key):
    # Your code here
    pass`,
    solution: `def bst_delete(values, key):
    def insert(root, v):
        if root is None:
            return [v, None, None]
        if v < root[0]:
            root[1] = insert(root[1], v)
        elif v > root[0]:
            root[2] = insert(root[2], v)
        return root

    def delete(node, k):
        if node is None:
            return None
        if k < node[0]:
            node[1] = delete(node[1], k)
        elif k > node[0]:
            node[2] = delete(node[2], k)
        else:
            if node[1] is None:
                return node[2]
            if node[2] is None:
                return node[1]
            succ = node[2]
            while succ[1] is not None:
                succ = succ[1]
            node[0] = succ[0]
            node[2] = delete(node[2], succ[0])
        return node

    root = None
    for v in values:
        root = insert(root, v)
    root = delete(root, key)
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
      { input: [[5, 3, 8, 1, 4, 7, 9], 3], expected: [5, 4, 1, 8, 7, 9] },
      { input: [[5, 3, 8], 8], expected: [5, 3] },
      { input: [[5, 3, 8], 3], expected: [5, 8] },
      { input: [[5, 3, 8, 4], 3], expected: [5, 4, 8] },
      { input: [[10, 5, 15], 20], expected: [10, 5, 15] },
    ],
    hint: "For two children, copy the inorder successor's value up and then delete that successor.",
  },
  {
    id: "ds-074",
    title: "Tree Diameter",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Return the diameter of a binary search tree built from the given values, measured in edges.\n\nInsert values in order (duplicates ignored). For every node compute the heights of its left and right subtrees; the diameter is the largest sum of those two heights over all nodes.\n\nReturn the diameter. An empty tree or a single node has diameter 0.",
    starterCode: `def tree_diameter(values):
    # Your code here
    pass`,
    solution: `def tree_diameter(values):
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
    best = 0

    def depth(node):
        nonlocal best
        if node is None:
            return 0
        lh = depth(node[1])
        rh = depth(node[2])
        if lh + rh > best:
            best = lh + rh
        return 1 + (lh if lh > rh else rh)

    depth(root)
    return best`,
    testCases: [
      { input: [[5, 3, 8, 1, 4, 7, 9]], expected: 4 },
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[5]], expected: 0 },
      { input: [[]], expected: 0 },
    ],
    hint: "The longest path through a node is the sum of its left and right subtree heights.",
  },
  {
    id: "ds-075",
    title: "Balanced Binary Tree Check",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Check whether a binary search tree built from the given values is height-balanced.\n\nInsert values in order (duplicates ignored). A tree is balanced when, for every node, the heights of its left and right subtrees differ by at most one. Compute heights with a post-order recursion that reports failure early by returning -1.\n\nReturn True if balanced, otherwise False. An empty tree is balanced.",
    starterCode: `def is_balanced_tree(values):
    # Your code here
    pass`,
    solution: `def is_balanced_tree(values):
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

    def height(node):
        if node is None:
            return 0
        lh = height(node[1])
        if lh < 0:
            return -1
        rh = height(node[2])
        if rh < 0:
            return -1
        if abs(lh - rh) > 1:
            return -1
        return 1 + max(lh, rh)

    return height(root) >= 0`,
    testCases: [
      { input: [[1, 2, 3]], expected: false },
      { input: [[5, 3, 8, 2]], expected: true },
      { input: [[]], expected: true },
      { input: [[2, 1, 3]], expected: true },
      { input: [[10, 5, 15, 3, 7, 12, 20]], expected: true },
    ],
    hint: "Return -1 from the height recursion as soon as any subtree is unbalanced.",
  },
  {
    id: "ds-076",
    title: "Same Tree Check",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether two binary trees given in level order are identical.\n\na and b are LeetCode-style level-order lists where None marks a missing node. Compare the normalized level-order sequences after trimming trailing None placeholders.\n\nReturn True when the trees have the same shape and values, otherwise False.",
    starterCode: `def same_tree(a, b):
    # Your code here
    pass`,
    solution: `def same_tree(a, b):
    def norm(tree):
        out = list(tree)
        while out and out[-1] is None:
            out.pop()
        return out

    return norm(a) == norm(b)`,
    testCases: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: true },
      { input: [[1, 2], [1, null, 2]], expected: false },
      { input: [[], []], expected: true },
      { input: [[1, 2, 3], [1, 2, 4]], expected: false },
      { input: [[1, 2, null, 3], [1, 2, null, 3]], expected: true },
    ],
    hint: "Trailing None placeholders do not change a tree, but Nones in the middle do.",
  },
  {
    id: "ds-077",
    title: "Heap Replace Root",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Replace the root of a min-heap with a new value and restore the heap property.\n\nheap is a valid min-heap list. Overwrite the root with value, then sift it down by swapping with its smaller child until both children are greater than or equal to it. An empty heap becomes [value].\n\nReturn the updated heap as a new list.",
    starterCode: `def heap_replace(heap, value):
    # Your code here
    pass`,
    solution: `def heap_replace(heap, value):
    h = list(heap)
    if not h:
        return [value]
    h[0] = value
    i = 0
    n = len(h)
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
      { input: [[1, 3, 2, 7, 5], 4], expected: [2, 3, 4, 7, 5] },
      { input: [[2, 5], 9], expected: [5, 9] },
      { input: [[], 7], expected: [7] },
      { input: [[1, 2, 3], 0], expected: [0, 2, 3] },
    ],
    hint: "This is the sift-down used when popping; the same routine handles an empty heap.",
  },
  {
    id: "ds-078",
    title: "Check Min-Heap Property",
    category: "Data Structures",
    difficulty: "Easy",
    description:
      "Check whether a list satisfies the min-heap property.\n\nFor every index i, both children at 2*i + 1 and 2*i + 2 must be greater than or equal to heap[i] when they exist. An empty list and a single element are valid heaps.\n\nReturn True if the min-heap property holds, otherwise False.",
    starterCode: `def is_min_heap(heap):
    # Your code here
    pass`,
    solution: `def is_min_heap(heap):
    n = len(heap)
    for i in range(n):
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and heap[left] < heap[i]:
            return False
        if right < n and heap[right] < heap[i]:
            return False
    return True`,
    testCases: [
      { input: [[1, 3, 2, 7, 5]], expected: true },
      { input: [[1, 2, 0]], expected: false },
      { input: [[]], expected: true },
      { input: [[5]], expected: true },
      { input: [[2, 1, 3]], expected: false },
    ],
    hint: "It is enough to compare each parent with its direct children.",
  },
  {
    id: "ds-079",
    title: "Count Words with Prefix",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count how many inserted words start with a given prefix, using a trie.\n\nInsert every word, storing an occurrence count at word endings so duplicates count separately. Walk down the prefix, then sum the occurrence counts in its subtree with a depth-first search.\n\nReturn the count, or 0 when the prefix is not present. An empty prefix matches all words.",
    starterCode: `def count_words_with_prefix(words, prefix):
    # Your code here
    pass`,
    solution: `def count_words_with_prefix(words, prefix):
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node["end"] = node.get("end", 0) + 1
    node = root
    for ch in prefix:
        if ch not in node:
            return 0
        node = node[ch]
    total = 0
    stack = [node]
    while stack:
        cur = stack.pop()
        if "end" in cur:
            total += cur["end"]
        for key, child in cur.items():
            if key != "end":
                stack.append(child)
    return total`,
    testCases: [
      { input: [["apple", "app", "apricot", "banana"], "ap"], expected: 3 },
      { input: [["a", "a"], "a"], expected: 2 },
      { input: [["dog"], "x"], expected: 0 },
      { input: [["ab", "abc"], "abc"], expected: 1 },
      { input: [[], ""], expected: 0 },
    ],
    hint: "Store a count instead of a boolean at word endings so duplicates are counted.",
  },
  {
    id: "ds-080",
    title: "Delete Word from Trie",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Simulate a trie that supports insert, search, and delete.\n\noperations contains \"insert\", \"search\", or \"delete\"; words provides the argument. insert records None, search records whether the exact word is currently present, and delete removes the word once and records whether it was found. Deleting a word must not remove longer words that share its prefix, and empty branches should be pruned.\n\nReturn the list of recorded results.",
    starterCode: `def trie_delete_ops(operations, words):
    # Your code here
    pass`,
    solution: `def trie_delete_ops(operations, words):
    root = {}

    def remove(node, w, i):
        if i == len(w):
            if not node.get("end"):
                return False, False
            node["end"] = False
            prune = not any(k != "end" for k in node)
            return True, prune
        ch = w[i]
        if ch not in node:
            return False, False
        removed, prune = remove(node[ch], w, i + 1)
        if prune:
            del node[ch]
        node_prune = not node.get("end") and len(node) == 0
        return removed, node_prune

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
            ok = True
            for ch in w:
                if ch not in node:
                    ok = False
                    break
                node = node[ch]
            out.append(ok and node.get("end", False) is True)
        else:
            removed, _ = remove(root, w, 0)
            out.append(removed)
    return out`,
    testCases: [
      {
        input: [
          ["insert", "insert", "delete", "search", "search"],
          ["apple", "app", "app", "app", "apple"],
        ],
        expected: [null, null, true, false, true],
      },
      { input: [["insert", "delete", "search"], ["a", "ab", "a"]], expected: [null, false, true] },
      { input: [["delete"], ["x"]], expected: [false] },
      {
        input: [["insert", "delete", "delete"], ["abc", "abc", "abc"]],
        expected: [null, true, false],
      },
    ],
    hint: "Track two things while unwinding: whether the word was found, and whether the node can be pruned.",
  },
  {
    id: "ds-081",
    title: "Group Strings by Sorted Key",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Group strings that are anagrams of each other, using a sorted-character key.\n\nTwo strings belong to the same group when sorting their characters yields the same key. Keep groups in order of first appearance in the input and include duplicate strings.\n\nReturn a list of groups, each sorted in ascending order.",
    starterCode: `def group_by_sorted_key(words):
    # Your code here
    pass`,
    solution: `def group_by_sorted_key(words):
    groups = {}
    order = []
    for w in words:
        key = "".join(sorted(w))
        if key not in groups:
            groups[key] = []
            order.append(key)
        groups[key].append(w)
    return [sorted(groups[k]) for k in order]`,
    testCases: [
      {
        input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: [["ate", "eat", "tea"], ["nat", "tan"], ["bat"]],
      },
      { input: [[]], expected: [] },
      { input: [["a", "a"]], expected: [["a", "a"]] },
      { input: [["ab", "ba", "abc"]], expected: [["ab", "ba"], ["abc"]] },
    ],
    hint: "Use the sorted characters as the dictionary key and remember the order keys first appear.",
  },
  {
    id: "ds-082",
    title: "Longest Consecutive Sequence",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Return the length of the longest run of consecutive integers in the list.\n\nPut all values in a set, then only start counting from a value x when x - 1 is absent; extend upward while consecutive values exist. Every value is visited at most twice, so the algorithm runs in linear time.\n\nReturn 0 for an empty list.",
    starterCode: `def longest_consecutive(nums):
    # Your code here
    pass`,
    solution: `def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 not in values:
            length = 1
            cur = x
            while cur + 1 in values:
                cur += 1
                length += 1
            if length > best:
                best = length
    return best`,
    testCases: [
      { input: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { input: [[]], expected: 0 },
      { input: [[1, 2, 0, 1]], expected: 3 },
      { input: [[5]], expected: 1 },
      { input: [[10, 5, 12, 3, 55]], expected: 1 },
    ],
    hint: "Only begin a run when the previous integer is missing to avoid rescanning runs.",
  },
  {
    id: "ds-083",
    title: "Zero-Sum Subarray Exists",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Determine whether any contiguous subarray sums to zero.\n\nTrack a running prefix sum in a set initialized with 0. If the same prefix sum is seen twice, the elements between those two positions sum to zero.\n\nReturn True if such a subarray exists, otherwise False.",
    starterCode: `def has_zero_sum_subarray(nums):
    # Your code here
    pass`,
    solution: `def has_zero_sum_subarray(nums):
    seen = {0}
    running = 0
    for x in nums:
        running += x
        if running in seen:
            return True
        seen.add(running)
    return False`,
    testCases: [
      { input: [[1, -1, 2]], expected: true },
      { input: [[1, 2, 3]], expected: false },
      { input: [[]], expected: false },
      { input: [[0]], expected: true },
      { input: [[3, -3, 1]], expected: true },
    ],
    hint: "Seeding the set with 0 also catches subarrays that start at index 0.",
  },
  {
    id: "ds-084",
    title: "Number of Provinces",
    category: "Data Structures",
    difficulty: "Medium",
    description:
      "Count the connected components (provinces) in an undirected graph given as an adjacency matrix.\n\nis_connected is an n by n matrix where a 1 at row i column j means nodes i and j are directly connected. Union the endpoints of every edge and count the distinct roots. An empty graph has 0 provinces.\n\nReturn the number of provinces.",
    starterCode: `def count_provinces(is_connected):
    # Your code here
    pass`,
    solution: `def count_provinces(is_connected):
    n = len(is_connected)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j]:
                ri = find(i)
                rj = find(j)
                if ri != rj:
                    parent[rj] = ri
    roots = set()
    for i in range(n):
        roots.add(find(i))
    return len(roots)`,
    testCases: [
      { input: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
      { input: [[[1, 0], [0, 1]]], expected: 2 },
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[[1]]], expected: 1 },
    ],
    hint: "Union i and j for every 1 above the diagonal, then count distinct roots.",
  },
  {
    id: "ds-085",
    title: "Accounts Merge Count",
    category: "Data Structures",
    difficulty: "Hard",
    description:
      "Count how many groups of accounts remain after merging accounts that share an email address.\n\naccounts is a list of [name, email, ...] entries. Two accounts belong to the same person when they share at least one email address; union their indices and count the distinct roots. Accounts with the same name but no shared email stay separate.\n\nReturn the number of merged groups.",
    starterCode: `def accounts_merge_count(accounts):
    # Your code here
    pass`,
    solution: `def accounts_merge_count(accounts):
    n = len(accounts)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra = find(a)
        rb = find(b)
        if ra != rb:
            parent[rb] = ra

    owner = {}
    for i, acc in enumerate(accounts):
        for email in acc[1:]:
            if email in owner:
                union(i, owner[email])
            else:
                owner[email] = i
    roots = set()
    for i in range(n):
        roots.add(find(i))
    return len(roots)`,
    testCases: [
      {
        input: [[["John", "a@x", "b@x"], ["John", "b@x", "c@x"], ["Mary", "m@x"]]],
        expected: 2,
      },
      { input: [[["A", "e1"], ["B", "e2"]]], expected: 2 },
      { input: [[["A", "x", "y"], ["A", "y", "z"], ["A", "z", "w"]]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[["A", "x"], ["A", "x"]]], expected: 1 },
    ],
    hint: "Map each email to the first account that owns it; a repeat email unions the two accounts.",
  },
];
