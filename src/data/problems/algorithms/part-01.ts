import type { Problem } from "@/types/problem";

// Algorithms problems are generated here.
export const problems: Problem[] = [
  {
    id: "al-001",
    title: "Binary Search",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Search for target in a sorted list of integers and return its index, or -1 if it is absent.\n\nUse the classic binary search loop: keep low and high pointers, compare the middle element, and halve the remaining range each step. The list is sorted in ascending order.",
    starterCode: `def binary_search(arr, target):
    # Your code here
    pass`,
    solution: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    testCases: [
      { input: [[1, 3, 5, 7, 9], 5], expected: 2 },
      { input: [[1, 3, 5, 7], 2], expected: -1 },
      { input: [[], 1], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[5], 4], expected: -1 },
    ],
    hint: "Halve the search range each iteration by comparing arr[mid] with the target.",
  },
  {
    id: "al-002",
    title: "Pair Sum in Sorted Array",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given arr sorted in ascending order and an integer target, find two distinct indices i < j with arr[i] + arr[j] == target, and return them as [i, j].\n\nUse the two-pointer technique in O(n) time: move the left pointer up when the sum is too small and the right pointer down when it is too large. Return an empty list if no such pair exists.",
    starterCode: `def pair_sum_sorted(arr, target):
    # Your code here
    pass`,
    solution: `def pair_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            return [lo, hi]
        if s < target:
            lo += 1
        else:
            hi -= 1
    return []`,
    testCases: [
      { input: [[1, 2, 3, 4, 6], 6], expected: [1, 3] },
      { input: [[2, 3, 4], 6], expected: [0, 2] },
      { input: [[1, 1], 2], expected: [0, 1] },
      { input: [[-3, -1, 2, 4], 1], expected: [0, 3] },
      { input: [[1, 2], 10], expected: [] },
    ],
    hint: "Start with pointers at both ends and move them inward based on the current sum.",
  },
  {
    id: "al-003",
    title: "Prefix Sum Array",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Build the prefix sum array of arr, returning a list of length n + 1 where out[i] is the sum of the first i elements, so out[0] = 0.\n\nThis structure lets any contiguous range sum be computed in O(1) as out[right] - out[left]. The input may contain negative numbers or be empty.",
    starterCode: `def prefix_sums(arr):
    # Your code here
    pass`,
    solution: `def prefix_sums(arr):
    out = [0]
    total = 0
    for x in arr:
        total += x
        out.append(total)
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [0, 1, 3, 6, 10] },
      { input: [[]], expected: [0] },
      { input: [[-1, 1, -1]], expected: [0, -1, 0, -1] },
      { input: [[5]], expected: [0, 5] },
    ],
    hint: "Carry a running total and append it after each element, starting with 0.",
  },
  {
    id: "al-004",
    title: "Bubble Sort",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Sort a list of integers in ascending order and return the sorted list.\n\nImplement bubble sort: repeatedly walk the list and swap adjacent out-of-order pairs until a full pass makes no swaps. Return a new list; the input may be empty or contain duplicates.",
    starterCode: `def bubble_sort(arr):
    # Your code here
    pass`,
    solution: `def bubble_sort(arr):
    a = list(arr)
    n = len(a)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a`,
    testCases: [
      { input: [[5, 2, 9, 1]], expected: [1, 2, 5, 9] },
      { input: [[]], expected: [] },
      { input: [[3]], expected: [3] },
      { input: [[4, 4, 2, 2]], expected: [2, 2, 4, 4] },
      { input: [[-1, -5, 0]], expected: [-5, -1, 0] },
    ],
    hint: "After each pass the largest remaining element bubbles to the end; stop early if a pass swaps nothing.",
  },
  {
    id: "al-005",
    title: "Insertion Sort",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Sort a list of integers in ascending order and return the sorted list.\n\nImplement insertion sort: grow a sorted prefix one element at a time, shifting larger elements right until the new element finds its place. Return a new list and handle empty input and duplicates.",
    starterCode: `def insertion_sort(arr):
    # Your code here
    pass`,
    solution: `def insertion_sort(arr):
    a = list(arr)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
    testCases: [
      { input: [[12, 11, 13, 5, 6]], expected: [5, 6, 11, 12, 13] },
      { input: [[]], expected: [] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[0, -2, 8, -2]], expected: [-2, -2, 0, 8] },
    ],
    hint: "Shift elements greater than the key to the right, then drop the key into the gap.",
  },
  {
    id: "al-006",
    title: "Selection Sort",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Sort a list of integers in ascending order and return the sorted list.\n\nImplement selection sort: for each position i, scan the unsorted suffix for the minimum and swap it into position i. The algorithm always performs about n squared over 2 comparisons. Return a new list and handle empty input.",
    starterCode: `def selection_sort(arr):
    # Your code here
    pass`,
    solution: `def selection_sort(arr):
    a = list(arr)
    n = len(a)
    for i in range(n):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a`,
    testCases: [
      { input: [[64, 25, 12, 22, 11]], expected: [11, 12, 22, 25, 64] },
      { input: [[]], expected: [] },
      { input: [[7]], expected: [7] },
      { input: [[3, -1, 3, 0]], expected: [-1, 0, 3, 3] },
    ],
    hint: "Find the minimum of the unsorted suffix, then swap it with the first unsorted element.",
  },
  {
    id: "al-007",
    title: "Greatest Common Divisor",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the greatest common divisor of two non-negative integers a and b using the Euclidean algorithm.\n\nRepeatedly replace the pair (a, b) with (b, a mod b) until b becomes 0, then return a. By convention gcd(0, 0) is 0.",
    starterCode: `def gcd(a, b):
    # Your code here
    pass`,
    solution: `def gcd(a, b):
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a`,
    testCases: [
      { input: [48, 18], expected: 6 },
      { input: [0, 5], expected: 5 },
      { input: [0, 0], expected: 0 },
      { input: [13, 7], expected: 1 },
      { input: [270, 192], expected: 6 },
    ],
    hint: "gcd(a, b) equals gcd(b, a mod b); the process ends when the second value is 0.",
  },
  {
    id: "al-008",
    title: "Fast Exponentiation",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute base raised to a non-negative integer exponent using binary exponentiation in O(log exp) multiplications.\n\nSquare the base while halving the exponent, multiplying the result whenever the current exponent bit is set. Return the exact integer result; base may be zero or negative.",
    starterCode: `def power(base, exp):
    # Your code here
    pass`,
    solution: `def power(base, exp):
    result = 1
    b = base
    e = exp
    while e > 0:
        if e & 1:
            result *= b
        b *= b
        e >>= 1
    return result`,
    testCases: [
      { input: [2, 10], expected: 1024 },
      { input: [5, 0], expected: 1 },
      { input: [0, 0], expected: 1 },
      { input: [-3, 3], expected: -27 },
      { input: [7, 1], expected: 7 },
    ],
    hint: "Peel off one bit of the exponent at a time while squaring the base.",
  },
  {
    id: "al-009",
    title: "Iterative Factorial",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute n! for a non-negative integer n using an iterative loop.\n\nBy definition 0! = 1 and 1! = 1, and n! = 1 * 2 * ... * n for n >= 2. Return the exact integer value.",
    starterCode: `def factorial(n):
    # Your code here
    pass`,
    solution: `def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
    testCases: [
      { input: [5], expected: 120 },
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
      { input: [12], expected: 479001600 },
    ],
    hint: "Start from 1 and multiply by every integer from 2 through n.",
  },
  {
    id: "al-010",
    title: "Fibonacci Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the n-th Fibonacci number with F(0) = 0 and F(1) = 1, computed iteratively in O(n) time and O(1) space.\n\nThe sequence satisfies F(n) = F(n-1) + F(n-2) for n >= 2. Assume n is a non-negative integer.",
    starterCode: `def fibonacci(n):
    # Your code here
    pass`,
    solution: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [10], expected: 55 },
      { input: [30], expected: 832040 },
      { input: [45], expected: 1134903170 },
    ],
    hint: "Keep only the last two values and roll them forward n times.",
  },
  {
    id: "al-011",
    title: "Anagram Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if strings s and t are anagrams, meaning they contain exactly the same characters with the same multiplicities.\n\nComparison is case-sensitive and every character counts, including spaces and punctuation. For example, listen and silent are anagrams.",
    starterCode: `def is_anagram(s, t):
    # Your code here
    pass`,
    solution: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in t:
        if counts.get(ch, 0) == 0:
            return False
        counts[ch] -= 1
    return True`,
    testCases: [
      { input: ["listen", "silent"], expected: true },
      { input: ["hello", "world"], expected: false },
      { input: ["", ""], expected: true },
      { input: ["aab", "aba"], expected: true },
      { input: ["abc", "ab"], expected: false },
    ],
    hint: "Count characters of one string, then consume the counts with the other.",
  },
  {
    id: "al-012",
    title: "Longest Common Prefix",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the longest common prefix shared by every string in the list strs.\n\nIf the list is empty, or the strings share no leading character, return the empty string. For example, the longest common prefix of flower, flow and flight is fl.",
    starterCode: `def longest_common_prefix(strs):
    # Your code here
    pass`,
    solution: `def longest_common_prefix(strs):
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`,
    testCases: [
      { input: [["flower", "flow", "flight"]], expected: "fl" },
      { input: [["dog", "racecar", "car"]], expected: "" },
      { input: [[]], expected: "" },
      { input: [["abc"]], expected: "abc" },
      { input: [["", "b"]], expected: "" },
    ],
    hint: "Start with the first string as the prefix and shrink it until every other string starts with it.",
  },
  {
    id: "al-013",
    title: "Caesar Cipher",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Apply a Caesar shift of k positions to text, preserving letter case and leaving non-letter characters unchanged.\n\nLetters wrap around the alphabet, so shifting z by 1 gives a, and k may be negative to shift backwards. Return the transformed string.",
    starterCode: `def caesar_shift(text, k):
    # Your code here
    pass`,
    solution: `def caesar_shift(text, k):
    out = []
    for ch in text:
        if "a" <= ch <= "z":
            out.append(chr((ord(ch) - 97 + k) % 26 + 97))
        elif "A" <= ch <= "Z":
            out.append(chr((ord(ch) - 65 + k) % 26 + 65))
        else:
            out.append(ch)
    return "".join(out)`,
    testCases: [
      { input: ["abc", 3], expected: "def" },
      { input: ["xyz", 3], expected: "abc" },
      { input: ["Hello, World!", 5], expected: "Mjqqt, Btwqi!" },
      { input: ["abc", -3], expected: "xyz" },
      { input: ["", 10], expected: "" },
    ],
    hint: "Use modulo 26 on the 0 to 25 letter index, separate for lowercase and uppercase.",
  },
  {
    id: "al-014",
    title: "Count Set Bits",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the number of 1 bits in the binary representation of a non-negative integer n.\n\nUse Brian Kernighan's trick, which clears the lowest set bit with the expression n = n & (n - 1), looping exactly popcount times. Return the count as an integer.",
    starterCode: `def count_set_bits(n):
    # Your code here
    pass`,
    solution: `def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [7], expected: 3 },
      { input: [8], expected: 1 },
      { input: [255], expected: 8 },
      { input: [1024], expected: 1 },
    ],
    hint: "n & (n - 1) removes the lowest set bit, so count how many times you can do it.",
  },
  {
    id: "al-015",
    title: "First Occurrence in Sorted Array",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the smallest index at which target appears in the sorted list arr, or -1 if it is absent.\n\nModify binary search so that whenever a match is found you record it and keep searching the left half for an earlier occurrence. This lower-bound search runs in O(log n) time and must handle duplicates.",
    starterCode: `def first_occurrence(arr, target):
    # Your code here
    pass`,
    solution: `def first_occurrence(arr, target):
    lo, hi = 0, len(arr) - 1
    result = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            result = mid
            hi = mid - 1
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    testCases: [
      { input: [[1, 2, 2, 2, 3], 2], expected: 1 },
      { input: [[1, 2, 2, 2, 3], 4], expected: -1 },
      { input: [[], 1], expected: -1 },
      { input: [[5, 5, 5], 5], expected: 0 },
      { input: [[1, 3, 5], 2], expected: -1 },
    ],
    hint: "On a match, save the index but continue searching left instead of returning immediately.",
  },
  {
    id: "al-016",
    title: "Maximum Sum Subarray of Size K",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a list of integers arr and an integer k, return the largest sum among all contiguous subarrays of length exactly k.\n\nUse a fixed-size sliding window: add the entering element and remove the leaving one to update the sum in O(1). Return None if k <= 0 or the list is shorter than k; values may be negative.",
    starterCode: `def max_sum_subarray_k(arr, k):
    # Your code here
    pass`,
    solution: `def max_sum_subarray_k(arr, k):
    if k <= 0 or len(arr) < k:
        return None
    window = sum(arr[:k])
    best = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]
        if window > best:
            best = window
    return best`,
    testCases: [
      { input: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
      { input: [[1], 1], expected: 1 },
      { input: [[1, 2], 3], expected: null },
      { input: [[-3, -1, -2], 2], expected: -3 },
      { input: [[-5, 4, -1, 2], 2], expected: 3 },
    ],
    hint: "Slide the window one step at a time and compare each new window sum with the best so far.",
  },
  {
    id: "al-017",
    title: "Maximum Subarray Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the largest possible sum of a non-empty contiguous subarray of arr, using Kadane's algorithm in O(n) time.\n\nAt each position either extend the previous best subarray or start fresh with the current element, keeping the running maximum. Return 0 for an empty input.",
    starterCode: `def max_subarray_sum(arr):
    # Your code here
    pass`,
    solution: `def max_subarray_sum(arr):
    if not arr:
        return 0
    best = current = arr[0]
    for x in arr[1:]:
        current = max(x, current + x)
        best = max(best, current)
    return best`,
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[-3, -1, -2]], expected: -1 },
      { input: [[5, -1, 5]], expected: 9 },
    ],
    hint: "current = max(x, current + x) decides whether to extend or restart at x.",
  },
  {
    id: "al-018",
    title: "Merge Sort",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Sort a list of integers in ascending order and return the sorted list using merge sort.\n\nRecursively split the list in half, sort each half, then merge the two sorted halves by repeatedly taking the smaller front element. Return a new list and handle empty input.",
    starterCode: `def merge_sort(arr):
    # Your code here
    pass`,
    solution: `def merge_sort(arr):
    if len(arr) <= 1:
        return list(arr)
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    out = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out`,
    testCases: [
      { input: [[38, 27, 43, 3, 9, 82, 10]], expected: [3, 9, 10, 27, 38, 43, 82] },
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
    ],
    hint: "Split, recurse, then merge with two pointers; take from the left half on ties for stability.",
  },
  {
    id: "al-019",
    title: "Quick Sort",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Sort a list of integers in ascending order and return the sorted list using quicksort with Lomuto partitioning.\n\nChoose the last element as the pivot, partition the range so all smaller or equal elements come first, then recurse on both sides of the pivot. Return a new list and handle duplicates and empty input.",
    starterCode: `def quick_sort(arr):
    # Your code here
    pass`,
    solution: `def quick_sort(arr):
    a = list(arr)
    def sort(lo, hi):
        if lo >= hi:
            return
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] <= pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        sort(lo, i - 1)
        sort(i + 1, hi)
    sort(0, len(a) - 1)
    return a`,
    testCases: [
      { input: [[10, 7, 8, 9, 1, 5]], expected: [1, 5, 7, 8, 9, 10] },
      { input: [[]], expected: [] },
      { input: [[3, 3, 3]], expected: [3, 3, 3] },
      { input: [[-2, 5, 0, -2]], expected: [-2, -2, 0, 5] },
    ],
    hint: "Lomuto partition walks j through the range and swaps every element not greater than the pivot behind index i.",
  },
  {
    id: "al-020",
    title: "Counting Sort",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Sort a list of non-negative integers in ascending order and return the sorted list using counting sort.\n\nCount occurrences of each value into a table indexed by value, then rebuild the output by appending each value as many times as it was counted. This runs in O(n + max value) time; assume all values are non-negative integers.",
    starterCode: `def counting_sort(arr):
    # Your code here
    pass`,
    solution: `def counting_sort(arr):
    if not arr:
        return []
    counts = [0] * (max(arr) + 1)
    for x in arr:
        counts[x] += 1
    out = []
    for value, count in enumerate(counts):
        out.extend([value] * count)
    return out`,
    testCases: [
      { input: [[4, 2, 2, 8, 3, 3, 1]], expected: [1, 2, 2, 3, 3, 4, 8] },
      { input: [[0]], expected: [0] },
      { input: [[]], expected: [] },
      { input: [[5, 0, 5, 0]], expected: [0, 0, 5, 5] },
    ],
    hint: "The value itself is the index into the count table, so no comparisons are needed.",
  },
  {
    id: "al-021",
    title: "Sieve of Eratosthenes",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count how many prime numbers are strictly less than n using the sieve of Eratosthenes.\n\nStart with every number marked prime, then for each prime p mark its multiples starting from p squared as composite. Return 0 for n < 3; for example count_primes(10) is 4.",
    starterCode: `def count_primes(n):
    # Your code here
    pass`,
    solution: `def count_primes(n):
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
    return sum(1 for flag in sieve if flag)`,
    testCases: [
      { input: [10], expected: 4 },
      { input: [2], expected: 0 },
      { input: [0], expected: 0 },
      { input: [1], expected: 0 },
      { input: [100], expected: 25 },
    ],
    hint: "Only sieve with primes up to sqrt(n); composite numbers below that are already marked.",
  },
  {
    id: "al-022",
    title: "Modular Exponentiation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compute base raised to exp modulo mod using fast modular exponentiation in O(log exp) multiplications.\n\nReduce base modulo mod first, square the base each round while halving the exponent, and multiply into the result whenever the current bit is set. Assume mod >= 1 and exp >= 0, and return 0 when mod is 1.",
    starterCode: `def mod_pow(base, exp, mod):
    # Your code here
    pass`,
    solution: `def mod_pow(base, exp, mod):
    if mod == 1:
        return 0
    result = 1
    base = base % mod
    while exp > 0:
        if exp & 1:
            result = (result * base) % mod
        base = (base * base) % mod
        exp >>= 1
    return result`,
    testCases: [
      { input: [2, 10, 1000], expected: 24 },
      { input: [3, 0, 7], expected: 1 },
      { input: [5, 3, 13], expected: 8 },
      { input: [10, 100, 7], expected: 4 },
      { input: [0, 0, 1], expected: 0 },
    ],
    hint: "Keep every intermediate product reduced modulo mod to avoid huge numbers.",
  },
  {
    id: "al-023",
    title: "Binomial Coefficient",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compute the binomial coefficient n choose k, the number of ways to choose k items from n distinct items, returning 0 when k < 0 or k > n.\n\nUse the multiplicative formula result = result * (n - k + i) // i for i from 1 to k after replacing k with min(k, n - k). Each step divides exactly, so the result stays an integer.",
    starterCode: `def binomial(n, k):
    # Your code here
    pass`,
    solution: `def binomial(n, k):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    result = 1
    for i in range(1, k + 1):
        result = result * (n - k + i) // i
    return result`,
    testCases: [
      { input: [5, 2], expected: 10 },
      { input: [0, 0], expected: 1 },
      { input: [10, 3], expected: 120 },
      { input: [5, 6], expected: 0 },
      { input: [52, 5], expected: 2598960 },
    ],
    hint: "Reduce k to min(k, n - k) first so the loop and the numbers stay small.",
  },
  {
    id: "al-024",
    title: "0/1 Knapsack",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given item weights, item values and a capacity, return the maximum total value achievable without exceeding the capacity, where each item may be taken at most once.\n\nUse one-dimensional dynamic programming over capacities, processing each item and updating capacities from high to low so no item is reused. Weights, values and capacity are non-negative integers.",
    starterCode: `def knapsack(weights, values, capacity):
    # Your code here
    pass`,
    solution: `def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            if dp[c - w] + v > dp[c]:
                dp[c] = dp[c - w] + v
    return dp[capacity]`,
    testCases: [
      { input: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { input: [[2, 2, 3], [3, 4, 5], 4], expected: 7 },
      { input: [[], [], 0], expected: 0 },
      { input: [[5], [10], 4], expected: 0 },
      { input: [[1, 2, 3], [6, 10, 12], 5], expected: 22 },
    ],
    hint: "Iterate capacities downward so each item can be chosen at most once.",
  },
  {
    id: "al-025",
    title: "Longest Common Subsequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the length of the longest common subsequence of strings a and b using dynamic programming.\n\nLet dp[i][j] be the LCS length of the first i characters of a and the first j characters of b. On a character match extend the diagonal; otherwise take the better of the state above and the state to the left. An empty string gives length 0.",
    starterCode: `def lcs_length(a, b):
    # Your code here
    pass`,
    solution: `def lcs_length(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    testCases: [
      { input: ["abcde", "ace"], expected: 3 },
      { input: ["abc", "abc"], expected: 3 },
      { input: ["abc", "def"], expected: 0 },
      { input: ["", "abc"], expected: 0 },
      { input: ["abcba", "abcbc"], expected: 4 },
    ],
    hint: "Characters must appear in both strings in the same relative order, but not necessarily consecutively.",
  },
  {
    id: "al-026",
    title: "Coin Change",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given unlimited coins of the listed denominations and a target amount, return the fewest coins needed to make the amount, or -1 if it is impossible.\n\nUse bottom-up dynamic programming where dp[x] is the minimum coins for value x, initialised with a sentinel larger than any real answer, and return 0 for amount 0.",
    starterCode: `def coin_change(coins, amount):
    # Your code here
    pass`,
    solution: `def coin_change(coins, amount):
    big = amount + 1
    dp = [0] + [big] * amount
    for c in coins:
        for x in range(c, amount + 1):
            if dp[x - c] + 1 < dp[x]:
                dp[x] = dp[x - c] + 1
    return -1 if dp[amount] > amount else dp[amount]`,
    testCases: [
      { input: [[1, 2, 5], 11], expected: 3 },
      { input: [[2], 3], expected: -1 },
      { input: [[1], 0], expected: 0 },
      { input: [[2, 5, 10, 1], 27], expected: 4 },
      { input: [[], 0], expected: 0 },
    ],
    hint: "For each coin, sweep amounts upward so the coin can be reused.",
  },
  {
    id: "al-027",
    title: "Longest Increasing Subsequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the length of the longest strictly increasing subsequence of arr using the O(n squared) dynamic programming approach.\n\nLet dp[i] be the length of the longest increasing subsequence ending at index i; extend it from any earlier index j where arr[j] < arr[i]. Return 0 for an empty list.",
    starterCode: `def lis_length(arr):
    # Your code here
    pass`,
    solution: `def lis_length(arr):
    if not arr:
        return 0
    dp = [1] * len(arr)
    for i in range(1, len(arr)):
        for j in range(i):
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
    return max(dp)`,
    testCases: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { input: [[1, 2, 3, 4, 5]], expected: 5 },
      { input: [[5, 4, 3, 2, 1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[7, 7, 7]], expected: 1 },
    ],
    hint: "The subsequence does not need to be contiguous, only strictly increasing.",
  },
  {
    id: "al-028",
    title: "Interval Scheduling",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given intervals as [start, end] pairs, return the maximum number of mutually non-overlapping intervals that can be selected.\n\nUse the greedy earliest-finish-first rule: sort by end time, then always take an interval whose start is at least the end of the last chosen interval. Intervals that only touch at an endpoint are considered compatible.",
    starterCode: `def max_non_overlapping(intervals):
    # Your code here
    pass`,
    solution: `def max_non_overlapping(intervals):
    if not intervals:
        return 0
    ordered = sorted(intervals, key=lambda x: x[1])
    count = 0
    last_end = None
    for start, end in ordered:
        if last_end is None or start >= last_end:
            count += 1
            last_end = end
    return count`,
    testCases: [
      { input: [[[1, 3], [2, 4], [3, 5]]], expected: 2 },
      { input: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
      { input: [[]], expected: 0 },
      { input: [[[1, 5]]], expected: 1 },
      { input: [[[1, 2], [2, 3], [1, 3]]], expected: 2 },
    ],
    hint: "Choosing the interval that finishes earliest leaves the most room for the rest.",
  },
  {
    id: "al-029",
    title: "Subsets Generation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Generate every subset of the integers in nums and return them as a list of lists.\n\nEnumerate bitmasks from 0 to 2^n - 1 and include nums[i] whenever bit i is set, which yields a fixed deterministic order starting with the empty subset. Return a list containing only the empty list when nums is empty.",
    starterCode: `def subsets(nums):
    # Your code here
    pass`,
    solution: `def subsets(nums):
    n = len(nums)
    result = []
    for mask in range(1 << n):
        current = []
        for i in range(n):
            if mask & (1 << i):
                current.append(nums[i])
        result.append(current)
    return result`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]],
      },
      { input: [[0]], expected: [[], [0]] },
      { input: [[]], expected: [[]] },
      { input: [[1, 2]], expected: [[], [1], [2], [1, 2]] },
    ],
    hint: "Each of the n elements independently has two choices: in the subset or out.",
  },
  {
    id: "al-030",
    title: "Permutations Generation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Generate every permutation of the integers in nums and return them as a list of lists in lexicographic order.\n\nBacktrack over a sorted copy of the input, tracking which positions are already used, and append each completed arrangement. The input may be unsorted; return a list containing only the empty list when nums is empty.",
    starterCode: `def permutations(nums):
    # Your code here
    pass`,
    solution: `def permutations(nums):
    items = sorted(nums)
    result = []
    used = [False] * len(items)
    current = []
    def backtrack():
        if len(current) == len(items):
            result.append(list(current))
            return
        for i in range(len(items)):
            if used[i]:
                continue
            used[i] = True
            current.append(items[i])
            backtrack()
            current.pop()
            used[i] = False
    backtrack()
    return result`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
      },
      { input: [[0]], expected: [[0]] },
      { input: [[]], expected: [[]] },
      {
        input: [[3, 1, 2]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
      },
    ],
    hint: "Sort a copy first, then choose elements position by position with a used flag.",
  },
  {
    id: "al-031",
    title: "Run-Length Encoding",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Encode a string by replacing each maximal run of identical characters with the character followed by the run length.\n\nFor example aaabbc encodes to a3b2c1 and a single character encodes to a1. Return the empty string for empty input.",
    starterCode: `def run_length_encode(s):
    # Your code here
    pass`,
    solution: `def run_length_encode(s):
    if not s:
        return ""
    out = []
    count = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            count += 1
        else:
            out.append(s[i - 1] + str(count))
            count = 1
    out.append(s[-1] + str(count))
    return "".join(out)`,
    testCases: [
      { input: ["aaabbc"], expected: "a3b2c1" },
      { input: [""], expected: "" },
      { input: ["a"], expected: "a1" },
      { input: ["abcd"], expected: "a1b1c1d1" },
      { input: ["aabbaa"], expected: "a2b2a2" },
    ],
    hint: "Track a run counter and flush it whenever the character changes, including at the end.",
  },
  {
    id: "al-032",
    title: "Dutch National Flag",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Sort a list containing only the values 0, 1 and 2 in ascending order and return the sorted list.\n\nUse the three-pointer Dutch national flag partition: a low pointer for the boundary of zeros, a mid pointer scanning forward and a high pointer for the boundary of twos. The array is sorted in a single pass without counting.",
    starterCode: `def sort_colors(arr):
    # Your code here
    pass`,
    solution: `def sort_colors(arr):
    a = list(arr)
    low, mid, high = 0, 0, len(a) - 1
    while mid <= high:
        if a[mid] == 0:
            a[low], a[mid] = a[mid], a[low]
            low += 1
            mid += 1
        elif a[mid] == 1:
            mid += 1
        else:
            a[mid], a[high] = a[high], a[mid]
            high -= 1
    return a`,
    testCases: [
      { input: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { input: [[]], expected: [] },
      { input: [[0]], expected: [0] },
      { input: [[1, 0, 2, 0, 1, 2]], expected: [0, 0, 1, 1, 2, 2] },
      { input: [[2, 2, 1, 1, 0, 0]], expected: [0, 0, 1, 1, 2, 2] },
    ],
    hint: "After swapping a two to the back, do not advance mid because the new element is unexamined.",
  },
  {
    id: "al-033",
    title: "Heapsort",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Sort a list of integers in ascending order and return the sorted list using heapsort.\n\nBuild a max-heap in place with sift-down starting from the last parent, then repeatedly swap the root to the end and shrink the heap, sifting the new root down. Handle empty input, negatives and duplicates.",
    starterCode: `def heapsort(arr):
    # Your code here
    pass`,
    solution: `def heapsort(arr):
    a = list(arr)
    n = len(a)
    def sift_down(i, size):
        while True:
            left = 2 * i + 1
            right = left + 1
            largest = i
            if left < size and a[left] > a[largest]:
                largest = left
            if right < size and a[right] > a[largest]:
                largest = right
            if largest == i:
                return
            a[i], a[largest] = a[largest], a[i]
            i = largest
    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(0, end)
    return a`,
    testCases: [
      { input: [[12, 11, 13, 5, 6, 7]], expected: [5, 6, 7, 11, 12, 13] },
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[3, 0, 2, 5, -1, 4, 1]], expected: [-1, 0, 1, 2, 3, 4, 5] },
    ],
    hint: "First heapify from the last parent down to index 0, then extract the maximum n - 1 times.",
  },
  {
    id: "al-034",
    title: "Fibonacci by Fast Doubling",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the n-th Fibonacci number with F(0) = 0 and F(1) = 1 using fast doubling in O(log n) time.\n\nUse the identities F(2k) = F(k) * (2 * F(k+1) - F(k)) and F(2k+1) = F(k)^2 + F(k+1)^2, which let a recursive pair of values halve n on each call. Assume n is a non-negative integer.",
    starterCode: `def fib_fast(n):
    # Your code here
    pass`,
    solution: `def fib_fast(n):
    def fd(k):
        if k == 0:
            return (0, 1)
        a, b = fd(k >> 1)
        c = a * (2 * b - a)
        d = a * a + b * b
        if k & 1:
            return (d, c + d)
        return (c, d)
    return fd(n)[0]`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [10], expected: 55 },
      { input: [50], expected: 12586269025 },
      { input: [60], expected: 1548008755920 },
    ],
    hint: "The recursive helper returns the pair (F(k), F(k+1)), and the two identities build the pair for k doubled or doubled plus one.",
  },
  {
    id: "al-035",
    title: "Edit Distance",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Compute the Levenshtein edit distance between strings a and b: the minimum number of single-character insertions, deletions or substitutions needed to turn a into b.\n\nUse dynamic programming over prefixes where a match copies the diagonal and a mismatch takes 1 plus the minimum of the diagonal, upper and left neighbours. Two empty strings have distance 0.",
    starterCode: `def edit_distance(a, b):
    # Your code here
    pass`,
    solution: `def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    testCases: [
      { input: ["kitten", "sitting"], expected: 3 },
      { input: ["", ""], expected: 0 },
      { input: ["abc", ""], expected: 3 },
      { input: ["flaw", "lawn"], expected: 2 },
      { input: ["intention", "execution"], expected: 5 },
    ],
    hint: "The first row and column encode the cost of building each prefix from an empty string.",
  },
  {
    id: "al-036",
    title: "N-Queens Count",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the number of ways to place n non-attacking queens on an n by n chessboard.\n\nBacktrack row by row, tracking occupied columns and both diagonal families in sets, and prune any square attacked by an earlier queen. By convention n = 0 counts as one empty placement, and n_queens(8) equals 92.",
    starterCode: `def n_queens(n):
    # Your code here
    pass`,
    solution: `def n_queens(n):
    cols = set()
    diag = set()
    anti = set()
    count = 0
    def place(row):
        nonlocal count
        if row == n:
            count += 1
            return
        for col in range(n):
            if col in cols or (row - col) in diag or (row + col) in anti:
                continue
            cols.add(col)
            diag.add(row - col)
            anti.add(row + col)
            place(row + 1)
            cols.remove(col)
            diag.remove(row - col)
            anti.remove(row + col)
    place(0)
    return count`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
      { input: [4], expected: 2 },
      { input: [6], expected: 4 },
      { input: [8], expected: 92 },
    ],
    hint: "A queen at (r, c) attacks row r, column c, diagonal r - c and anti-diagonal r + c.",
  },
  {
    id: "al-037",
    title: "Median of Two Sorted Arrays",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the median of two sorted lists a and b as a float in O(log(min(len(a), len(b)))) time.\n\nBinary search a partition of the shorter list so the left halves together hold (m + n + 1) // 2 elements and every left value is at most every right value. For an odd total return the largest left value, otherwise the average of the largest left and the smallest right.",
    starterCode: `def find_median_sorted(a, b):
    # Your code here
    pass`,
    solution: `def find_median_sorted(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    lo, hi = 0, m
    half = (m + n + 1) // 2
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        left_a = a[i - 1] if i > 0 else float("-inf")
        right_a = a[i] if i < m else float("inf")
        left_b = b[j - 1] if j > 0 else float("-inf")
        right_b = b[j] if j < n else float("inf")
        if left_a <= right_b and left_b <= right_a:
            if (m + n) % 2 == 1:
                return float(max(left_a, left_b))
            return (max(left_a, left_b) + min(right_a, right_b)) / 2.0
        elif left_a > right_b:
            hi = i - 1
        else:
            lo = i + 1
    return 0.0`,
    testCases: [
      { input: [[1, 3], [2]], expected: 2.0 },
      { input: [[1, 2], [3, 4]], expected: 2.5 },
      { input: [[], [1]], expected: 1.0 },
      { input: [[0, 0], [0, 0]], expected: 0.0 },
      { input: [[2], []], expected: 2.0 },
    ],
    hint: "Swap so the shorter list is partitioned; sentinels handle empty left or right sides.",
  },
  {
    id: "al-038",
    title: "Topological Sort",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given n nodes labelled 0 to n-1 and directed edges as [u, v] pairs forming a DAG, return a topological ordering of all nodes.\n\nUse Kahn's algorithm with a min-heap of zero-indegree nodes so the result is the lexicographically smallest valid order. If a cycle prevents every node from being ordered, return an empty list.",
    starterCode: `def topological_sort(n, edges):
    # Your code here
    pass`,
    solution: `import heapq

def topological_sort(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    heap = [i for i in range(n) if indeg[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(heap, v)
    if len(order) != n:
        return []
    return order`,
    testCases: [
      {
        input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]],
        expected: [0, 1, 2, 3],
      },
      { input: [3, [[0, 2], [1, 2]]], expected: [0, 1, 2] },
      { input: [1, []], expected: [0] },
      { input: [0, []], expected: [] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 2, 3] },
    ],
    hint: "Repeatedly take the smallest node with indegree zero and relax its outgoing edges.",
  },
  {
    id: "al-039",
    title: "Trapping Rain Water",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given elevation heights, compute how many units of water are trapped between the bars after raining.\n\nUse two pointers from both ends while maintaining the maximum height seen on each side; the lower side determines the water above the current bar. Return 0 for empty or strictly monotonic input.",
    starterCode: `def trap(height):
    # Your code here
    pass`,
    solution: `def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water`,
    testCases: [
      {
        input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
        expected: 6,
      },
      { input: [[]], expected: 0 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[3, 2, 1]], expected: 0 },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
    ],
    hint: "Water above a bar equals min(left_max, right_max) - height, and the smaller side is always safe to settle.",
  },
  {
    id: "al-040",
    title: "Longest Unique Substring",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the length of the longest substring of s that contains no repeated characters.\n\nUse a sliding window with a dictionary storing each character's last index; when a repeat falls inside the current window, move the window start to just past the previous occurrence. Return 0 for the empty string.",
    starterCode: `def length_of_longest_unique_substring(s):
    # Your code here
    pass`,
    solution: `def length_of_longest_unique_substring(s):
    last = {}
    start = 0
    best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1
        last[ch] = i
        if i - start + 1 > best:
            best = i - start + 1
    return best`,
    testCases: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: [""], expected: 0 },
      { input: ["pwwkew"], expected: 3 },
      { input: ["dvdf"], expected: 3 },
    ],
    hint: "Only move the start forward when the previous occurrence is still inside the window.",
  },
];
