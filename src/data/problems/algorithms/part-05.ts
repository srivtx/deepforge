import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-171",
    title: "Integer Square Root",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the integer square root of a non-negative integer n: the largest integer x with x * x <= n.\n\nUse Newton's iteration x = (x + n // x) // 2 starting from n, which converges in O(log n) steps. Return n unchanged for 0 and 1.",
    starterCode: `def integer_sqrt(n):
    # Your code here
    pass`,
    solution: `def integer_sqrt(n):
    if n < 2:
        return n
    x = n
    y = (x + 1) // 2
    while y < x:
        x = y
        y = (x + n // x) // 2
    return x`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [4], expected: 2 },
      { input: [8], expected: 2 },
      { input: [16], expected: 4 },
      { input: [1000000], expected: 1000 },
    ],
    hint: "Newton's method halves the error each round, so the loop stops quickly.",
  },
  {
    id: "al-172",
    title: "Perfect Square Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if n is a perfect square, meaning it equals some integer multiplied by itself, and False otherwise.\n\nReuse the integer square root and check whether squaring it recovers n exactly. Negative numbers are never perfect squares.",
    starterCode: `def is_perfect_square(n):
    # Your code here
    pass`,
    solution: `def is_perfect_square(n):
    if n < 0:
        return False
    root = n
    if root >= 2:
        y = (root + 1) // 2
        while y < root:
            root = y
            y = (root + n // root) // 2
    return root * root == n`,
    testCases: [
      { input: [16], expected: true },
      { input: [14], expected: false },
      { input: [0], expected: true },
      { input: [1], expected: true },
      { input: [100000000], expected: true },
    ],
    hint: "Floating point square roots can round incorrectly for large inputs, so use integer arithmetic.",
  },
  {
    id: "al-173",
    title: "Integer Cube Root",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the integer cube root of a non-negative integer n: the largest integer x with x * x * x <= n.\n\nBinary search the answer between 0 and an upper bound found by doubling, comparing mid cubed with n. Always return the floor value.",
    starterCode: `def integer_cube_root(n):
    # Your code here
    pass`,
    solution: `def integer_cube_root(n):
    lo, hi = 0, 1
    while hi * hi * hi <= n:
        hi *= 2
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid * mid <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    testCases: [
      { input: [27], expected: 3 },
      { input: [26], expected: 2 },
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [1000], expected: 10 },
      { input: [2], expected: 1 },
    ],
    hint: "Doubling the upper bound first keeps the binary search range small.",
  },
  {
    id: "al-174",
    title: "Min Cost Climbing Stairs",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given cost where cost[i] is the fee to stand on step i, return the minimum total cost to reach the top just past the last step.\n\nYou may start at step 0 or step 1, and each move advances one or two steps. The recurrence is cur = cost[i] + min(previous two best values).",
    starterCode: `def min_cost_climbing_stairs(cost):
    # Your code here
    pass`,
    solution: `def min_cost_climbing_stairs(cost):
    prev2 = 0
    prev1 = 0
    for c in cost:
        cur = c + min(prev1, prev2)
        prev2, prev1 = prev1, cur
    return min(prev1, prev2)`,
    testCases: [
      { input: [[10, 15, 20]], expected: 15 },
      {
        input: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]],
        expected: 6,
      },
      { input: [[0, 0]], expected: 0 },
      { input: [[1, 2]], expected: 1 },
      { input: [[5, 5]], expected: 5 },
    ],
    hint: "The top is one step past the end, so the answer is the cheaper of the last two states.",
  },
  {
    id: "al-175",
    title: "Maximum Ribbon Cut",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given a ribbon of length n and a list of allowed cut sizes, return the maximum number of pieces that sum exactly to n, or -1 if no combination works.\n\nUse unbounded knapsack DP where dp[x] is the most pieces for length x, trying every cut size at each length. dp[0] = 0 and unreachable lengths stay at -1.",
    starterCode: `def max_ribbon_cut(n, sizes):
    # Your code here
    pass`,
    solution: `def max_ribbon_cut(n, sizes):
    dp = [-1] * (n + 1)
    dp[0] = 0
    for x in range(1, n + 1):
        best = -1
        for s in sizes:
            if s <= x and dp[x - s] != -1:
                if dp[x - s] + 1 > best:
                    best = dp[x - s] + 1
        dp[x] = best
    return dp[n]`,
    testCases: [
      { input: [5, [2, 3]], expected: 2 },
      { input: [7, [2, 3]], expected: 3 },
      { input: [7, [5]], expected: -1 },
      { input: [9, [2, 5]], expected: 3 },
      { input: [4, [4]], expected: 1 },
      { input: [0, [1]], expected: 0 },
    ],
    hint: "Prefer smaller pieces for more total pieces, but only if the remainder is reachable.",
  },
  {
    id: "al-176",
    title: "Minimum Rounds to Complete Tasks",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given task difficulty levels, return the minimum number of rounds to complete all tasks, where each round completes either 2 or 3 tasks of the same level, or -1 if any level appears exactly once.\n\nFor a level with count c the minimum rounds is (c + 2) // 3, which prefers groups of three. Any singleton makes the schedule impossible.",
    starterCode: `def min_rounds_tasks(tasks):
    # Your code here
    pass`,
    solution: `def min_rounds_tasks(tasks):
    counts = {}
    for t in tasks:
        counts[t] = counts.get(t, 0) + 1
    rounds = 0
    for c in counts.values():
        if c == 1:
            return -1
        rounds += (c + 2) // 3
    return rounds`,
    testCases: [
      { input: [[2, 2, 3, 3, 2, 4, 4, 4, 4, 4]], expected: 4 },
      { input: [[5, 5, 5, 5]], expected: 2 },
      { input: [[2, 3, 3]], expected: -1 },
      { input: [[7, 7, 7, 7, 7, 7]], expected: 2 },
      { input: [[1]], expected: -1 },
    ],
    hint: "Counts of 2 and 3 take one round, and every larger count can be built from 2s and 3s.",
  },
  {
    id: "al-177",
    title: "Score of Parentheses",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the score of a balanced parentheses string where () scores 1, concatenation adds scores, and wrapping a group in parentheses doubles its score.\n\nUse a stack of running scores: push a new zero on each opening bracket, and on a closing bracket add either 1 or twice the popped value to the new top. Return 0 for the empty string.",
    starterCode: `def score_of_parentheses(s):
    # Your code here
    pass`,
    solution: `def score_of_parentheses(s):
    stack = [0]
    for ch in s:
        if ch == "(":
            stack.append(0)
        else:
            value = stack.pop()
            if value == 0:
                stack[-1] += 1
            else:
                stack[-1] += 2 * value
    return stack[0]`,
    testCases: [
      { input: ["()"], expected: 1 },
      { input: ["(())"], expected: 2 },
      { input: ["()()"], expected: 2 },
      { input: ["(()(()))"], expected: 6 },
      { input: [""], expected: 0 },
    ],
    hint: "A popped score of zero means the pair was an empty (), which is worth 1.",
  },
  {
    id: "al-178",
    title: "Minimum Add to Make Parentheses Valid",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the minimum number of parenthesis insertions needed to make s a valid parentheses string.\n\nTrack the count of unmatched openers; each unmatched closer needs one insertion, and every opener left at the end needs one closing insertion. Return 0 when s is already valid.",
    starterCode: `def min_add_parentheses(s):
    # Your code here
    pass`,
    solution: `def min_add_parentheses(s):
    open_count = 0
    needed = 0
    for ch in s:
        if ch == "(":
            open_count += 1
        else:
            if open_count > 0:
                open_count -= 1
            else:
                needed += 1
    return needed + open_count`,
    testCases: [
      { input: ["())"], expected: 1 },
      { input: ["((("], expected: 3 },
      { input: ["()"], expected: 0 },
      { input: ["()))(("], expected: 4 },
      { input: [""], expected: 0 },
    ],
    hint: "Every unmatched closer and every leftover opener costs exactly one insertion.",
  },
  {
    id: "al-179",
    title: "Wiggle Sort Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if nums already satisfies the wiggle pattern nums[0] <= nums[1] >= nums[2] <= nums[3] and so on.\n\nCompare each adjacent pair with the required direction based on index parity. Lists of length 0 or 1 are trivially wiggle sorted.",
    starterCode: `def is_wiggle_sorted(nums):
    # Your code here
    pass`,
    solution: `def is_wiggle_sorted(nums):
    for i in range(1, len(nums)):
        if i % 2 == 1:
            if nums[i - 1] > nums[i]:
                return False
        else:
            if nums[i - 1] < nums[i]:
                return False
    return True`,
    testCases: [
      { input: [[1, 2, 3]], expected: false },
      { input: [[1, 3, 2]], expected: true },
      { input: [[1, 2, 1, 2]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[]], expected: true },
      { input: [[1]], expected: true },
    ],
    hint: "Odd positions must be local maxima and even positions must be local minima.",
  },
  {
    id: "al-180",
    title: "Count Palindromic Substrings",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count all palindromic substrings of s, including single characters and overlapping occurrences.\n\nExpand around every center, considering both odd-length and even-length palindromes, and add one for each successful expansion step. An empty string has zero palindromic substrings.",
    starterCode: `def count_palindromic_substrings(s):
    # Your code here
    pass`,
    solution: `def count_palindromic_substrings(s):
    total = 0
    for center in range(len(s)):
        left, right = center, center
        while left >= 0 and right < len(s) and s[left] == s[right]:
            total += 1
            left -= 1
            right += 1
        left, right = center, center + 1
        while left >= 0 and right < len(s) and s[left] == s[right]:
            total += 1
            left -= 1
            right += 1
    return total`,
    testCases: [
      { input: ["abc"], expected: 3 },
      { input: ["aaa"], expected: 6 },
      { input: [""], expected: 0 },
      { input: ["a"], expected: 1 },
      { input: ["aba"], expected: 4 },
    ],
    hint: "A palindrome of length L contributes one to the count for every center expansion.",
  },
  {
    id: "al-181",
    title: "Find All Anagrams in a String",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the sorted starting indices of every substring of s that is an anagram of p.\n\nThe window length is fixed at len(p): slide it forward one character at a time, updating a frequency table and recording the start whenever the table matches p's counts. Return an empty list for an empty pattern.",
    starterCode: `def find_anagram_indices(s, p):
    # Your code here
    pass`,
    solution: `def find_anagram_indices(s, p):
    if not p or len(p) > len(s):
        return []
    need = {}
    for ch in p:
        need[ch] = need.get(ch, 0) + 1
    window = {}
    for ch in s[:len(p)]:
        window[ch] = window.get(ch, 0) + 1
    result = []
    if window == need:
        result.append(0)
    for i in range(len(p), len(s)):
        entering = s[i]
        window[entering] = window.get(entering, 0) + 1
        leaving = s[i - len(p)]
        window[leaving] -= 1
        if window[leaving] == 0:
            del window[leaving]
        if window == need:
            result.append(i - len(p) + 1)
    return result`,
    testCases: [
      { input: ["cbaebabacd", "abc"], expected: [0, 6] },
      { input: ["abab", "ab"], expected: [0, 1, 2] },
      { input: ["a", "a"], expected: [0] },
      { input: ["", "a"], expected: [] },
      { input: ["abc", "d"], expected: [] },
    ],
    hint: "Delete zero entries from the window table so it compares equal to the need table.",
  },
  {
    id: "al-182",
    title: "Minimum Deletions to Make Palindrome",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the minimum number of characters to delete from s so that the remaining string is a palindrome.\n\nThe answer is len(s) minus the longest palindromic subsequence, computed with interval DP. An empty string needs zero deletions.",
    starterCode: `def min_deletions_palindrome(s):
    # Your code here
    pass`,
    solution: `def min_deletions_palindrome(s):
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
    return n - dp[0][n - 1]`,
    testCases: [
      { input: ["aab"], expected: 1 },
      { input: ["abca"], expected: 1 },
      { input: ["abcde"], expected: 4 },
      { input: [""], expected: 0 },
      { input: ["aba"], expected: 0 },
    ],
    hint: "Deleting all characters except a longest palindromic subsequence is optimal.",
  },
  {
    id: "al-183",
    title: "Maximum Points from Cards",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given card_points in a row, return the maximum score from taking exactly k cards, each from the left or right end of the remaining row.\n\nThe taken cards always form the complement of one contiguous window of size n - k, so subtract the minimum window sum from the total. Return the total when k covers the whole row.",
    starterCode: `def max_points_cards(card_points, k):
    # Your code here
    pass`,
    solution: `def max_points_cards(card_points, k):
    total = sum(card_points)
    if k >= len(card_points):
        return total
    window_size = len(card_points) - k
    current = sum(card_points[:window_size])
    smallest = current
    for i in range(window_size, len(card_points)):
        current += card_points[i] - card_points[i - window_size]
        if current < smallest:
            smallest = current
    return total - smallest`,
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6, 1], 3], expected: 12 },
      { input: [[2, 2, 2], 2], expected: 4 },
      { input: [[9, 7, 7, 9, 7, 7, 9], 7], expected: 55 },
      { input: [[1, 1000, 1], 1], expected: 1 },
      { input: [[5], 1], expected: 5 },
    ],
    hint: "Maximising the ends equals minimising the contiguous middle that is left behind.",
  },
  {
    id: "al-184",
    title: "Fast Matrix Power",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Raise a square integer matrix to a non-negative integer power p using binary exponentiation.\n\nSquare the matrix and halve the exponent, multiplying into the result whenever the current bit is set, exactly like fast integer power. The zeroth power is the identity matrix.",
    starterCode: `def matrix_power(mat, p):
    # Your code here
    pass`,
    solution: `def matrix_power(mat, p):
    n = len(mat)
    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    base = [row[:] for row in mat]
    while p > 0:
        if p & 1:
            result = [[sum(result[i][k] * base[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
        base = [[sum(base[i][k] * base[k][j] for k in range(n)) for j in range(n)] for i in range(n)]
        p >>= 1
    return result`,
    testCases: [
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 0], [0, 1]] },
      { input: [[[1, 2], [3, 4]], 1], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2], [3, 4]], 2], expected: [[7, 10], [15, 22]] },
      { input: [[[1, 0], [0, 1]], 5], expected: [[1, 0], [0, 1]] },
      { input: [[[2, 0], [0, 3]], 3], expected: [[8, 0], [0, 27]] },
    ],
    hint: "Matrix multiplication is not commutative, so always keep the result on the left.",
  },
  {
    id: "al-185",
    title: "Job Scheduling with Deadlines",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given jobs as [deadline, profit] pairs where each job takes one unit of time and only one job runs per slot, return the maximum total profit from jobs finished before their deadlines.\n\nSort jobs by descending profit and greedily place each in the latest free slot at or before its deadline, skipping jobs whose slots are all taken. Return 0 for no jobs.",
    starterCode: `def job_scheduling_max_profit(jobs):
    # Your code here
    pass`,
    solution: `def job_scheduling_max_profit(jobs):
    if not jobs:
        return 0
    ordered = sorted(jobs, key=lambda j: -j[1])
    max_deadline = max(d for d, _ in jobs)
    slots = [False] * (max_deadline + 1)
    total = 0
    for deadline, profit in ordered:
        for slot in range(deadline, 0, -1):
            if not slots[slot]:
                slots[slot] = True
                total += profit
                break
    return total`,
    testCases: [
      { input: [[[2, 100], [1, 19], [2, 27], [1, 25], [3, 15]]], expected: 142 },
      { input: [[[1, 5], [1, 10], [1, 20]]], expected: 20 },
      { input: [[[2, 10], [1, 5]]], expected: 15 },
      { input: [[[1, 1]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Placing a high-profit job as late as possible keeps earlier slots free for tighter deadlines.",
  },
  {
    id: "al-186",
    title: "Optimal Merge Cost",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given the sizes of piles, return the minimum total cost of repeatedly merging piles in pairs, where merging two piles costs the sum of their sizes.\n\nThis is the optimal merge pattern, identical to Huffman coding: always merge the two smallest piles. Use a min-heap and accumulate each merge cost.",
    starterCode: `def optimal_merge_cost(piles):
    # Your code here
    pass`,
    solution: `import heapq

def optimal_merge_cost(piles):
    if len(piles) <= 1:
        return 0
    heap = list(piles)
    heapq.heapify(heap)
    total = 0
    while len(heap) > 1:
        first = heapq.heappop(heap)
        second = heapq.heappop(heap)
        combined = first + second
        total += combined
        heapq.heappush(heap, combined)
    return total`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 33 },
      { input: [[5]], expected: 0 },
      { input: [[1, 1]], expected: 2 },
      { input: [[10, 20, 30]], expected: 90 },
      { input: [[2, 2, 2, 2]], expected: 16 },
    ],
    hint: "Merging the smallest piles first keeps large piles out of the total as long as possible.",
  },
  {
    id: "al-187",
    title: "KMP Failure Function",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compute the KMP prefix function of pattern: table[i] is the length of the longest proper prefix of pattern[:i+1] that is also a suffix.\n\nUse the standard linear scan that falls back through earlier table values on a mismatch. Return an empty list for an empty pattern.",
    starterCode: `def kmp_failure_function(pattern):
    # Your code here
    pass`,
    solution: `def kmp_failure_function(pattern):
    n = len(pattern)
    table = [0] * n
    k = 0
    for i in range(1, n):
        while k > 0 and pattern[i] != pattern[k]:
            k = table[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        table[i] = k
    return table`,
    testCases: [
      { input: ["ababaca"], expected: [0, 0, 1, 2, 3, 0, 1] },
      { input: ["aabaaab"], expected: [0, 1, 0, 1, 2, 2, 3] },
      { input: [""], expected: [] },
      { input: ["a"], expected: [0] },
      { input: ["aaaa"], expected: [0, 1, 2, 3] },
    ],
    hint: "On a mismatch, fall back to the longest border of the prefix already matched.",
  },
  {
    id: "al-188",
    title: "Rabin-Karp Search",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the sorted starting indices of all occurrences of pattern in text using the Rabin-Karp rolling hash.\n\nHash the pattern and the first window with base 256 modulo 101, roll the window in O(1), and verify any hash match character by character. Return an empty list when the pattern is empty or longer than the text.",
    starterCode: `def rabin_karp_search(text, pattern):
    # Your code here
    pass`,
    solution: `def rabin_karp_search(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return []
    base = 256
    mod = 101
    high = pow(base, m - 1, mod)
    pattern_hash = 0
    window_hash = 0
    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
        window_hash = (window_hash * base + ord(text[i])) % mod
    result = []
    for i in range(n - m + 1):
        if pattern_hash == window_hash and text[i:i + m] == pattern:
            result.append(i)
        if i < n - m:
            window_hash = (window_hash - ord(text[i]) * high) * base + ord(text[i + m])
            window_hash %= mod
    return result`,
    testCases: [
      { input: ["ababcababa", "aba"], expected: [0, 5, 7] },
      { input: ["aaaa", "aa"], expected: [0, 1, 2] },
      { input: ["abc", "d"], expected: [] },
      { input: ["a", "a"], expected: [0] },
      { input: ["", "a"], expected: [] },
    ],
    hint: "Hash equality is only a candidate; always verify the characters to rule out collisions.",
  },
  {
    id: "al-189",
    title: "Boyer-Moore Search",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the index of the first occurrence of pattern in text using the bad-character heuristic of Boyer-Moore, or -1 if it is absent.\n\nPreprocess the last occurrence of each character in the pattern, compare from the right, and shift by the larger of 1 and the mismatch index minus the last occurrence. Return -1 for an empty pattern.",
    starterCode: `def boyer_moore_search(text, pattern):
    # Your code here
    pass`,
    solution: `def boyer_moore_search(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return -1
    last = {}
    for i, ch in enumerate(pattern):
        last[ch] = i
    shift = 0
    while shift <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[shift + j]:
            j -= 1
        if j < 0:
            return shift
        bad = last.get(text[shift + j], -1)
        shift += max(1, j - bad)
    return -1`,
    testCases: [
      { input: ["HERE IS A SIMPLE EXAMPLE", "EXAMPLE"], expected: 17 },
      { input: ["abcabc", "abc"], expected: 0 },
      { input: ["abc", "d"], expected: -1 },
      { input: ["a", "a"], expected: 0 },
      { input: ["", "a"], expected: -1 },
    ],
    hint: "Compared characters are skipped by moving the pattern so the bad character aligns with its last occurrence.",
  },
  {
    id: "al-190",
    title: "Suffix Array (Naive)",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the starting indices of all suffixes of s sorted in lexicographic order.\n\nFor small inputs, sorting indices with the suffix itself as the comparison key is acceptable and fully deterministic. Return an empty list for an empty string.",
    starterCode: `def suffix_array_naive(s):
    # Your code here
    pass`,
    solution: `def suffix_array_naive(s):
    return sorted(range(len(s)), key=lambda i: s[i:])`,
    testCases: [
      { input: ["banana"], expected: [5, 3, 1, 0, 4, 2] },
      { input: ["cba"], expected: [2, 1, 0] },
      { input: [""], expected: [] },
      { input: ["a"], expected: [0] },
      { input: ["aaaa"], expected: [3, 2, 1, 0] },
    ],
    hint: "For the string banana the suffixes start a, ana, anana, banana, na, nana.",
  },
  {
    id: "al-191",
    title: "LCP Array",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a string s and its suffix array sa, return the LCP array where entry i is the longest common prefix length of the suffixes starting at sa[i] and sa[i+1].\n\nUse Kasai's algorithm: compute the rank of each suffix, then scan the string maintaining a running prefix length that decreases by at most one per step. Return an empty list when the string has fewer than two characters.",
    starterCode: `def lcp_array(s, sa):
    # Your code here
    pass`,
    solution: `def lcp_array(s, sa):
    n = len(s)
    if n <= 1:
        return []
    rank = [0] * n
    for i, suffix_start in enumerate(sa):
        rank[suffix_start] = i
    lcp = [0] * (n - 1)
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i] - 1] = h
            if h > 0:
                h -= 1
        else:
            h = 0
    return lcp`,
    testCases: [
      { input: ["banana", [5, 3, 1, 0, 4, 2]], expected: [1, 3, 0, 0, 2] },
      { input: ["aaaa", [3, 2, 1, 0]], expected: [1, 2, 3] },
      { input: ["abc", [0, 1, 2]], expected: [0, 0] },
      { input: ["a", [0]], expected: [] },
      { input: ["", []], expected: [] },
    ],
    hint: "When moving from suffix i to i + 1, the LCP with the previous suffix drops by at most one.",
  },
  {
    id: "al-192",
    title: "Sliding Window Median",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the median of every contiguous window of size k in nums, in left-to-right order.\n\nFor each window, sort it and take the middle element, averaging the two middle elements when k is even. Return an empty list when k is non-positive or larger than the list.",
    starterCode: `def sliding_window_median(nums, k):
    # Your code here
    pass`,
    solution: `def sliding_window_median(nums, k):
    result = []
    if k <= 0 or k > len(nums):
        return result
    for i in range(len(nums) - k + 1):
        window = sorted(nums[i:i + k])
        if k % 2 == 1:
            result.append(float(window[k // 2]))
        else:
            result.append((window[k // 2 - 1] + window[k // 2]) / 2.0)
    return result`,
    testCases: [
      {
        input: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
        expected: [1.0, -1.0, -1.0, 3.0, 5.0, 6.0],
      },
      { input: [[1, 2], 2], expected: [1.5] },
      { input: [[1], 1], expected: [1.0] },
      { input: [[5, 5, 5], 2], expected: [5.0, 5.0] },
      { input: [[], 3], expected: [] },
    ],
    hint: "Even windows average the two central elements, so return floats consistently.",
  },
  {
    id: "al-193",
    title: "Longest Mountain Subarray",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the length of the longest contiguous mountain subarray: strictly increasing to a peak and then strictly decreasing, with at least one element on each side.\n\nFor every peak, expand left while increasing and right while decreasing, then continue scanning after the right end. Return 0 when no mountain exists.",
    starterCode: `def longest_mountain_subarray(arr):
    # Your code here
    pass`,
    solution: `def longest_mountain_subarray(arr):
    n = len(arr)
    best = 0
    i = 1
    while i < n - 1:
        if arr[i - 1] < arr[i] and arr[i] > arr[i + 1]:
            left = i - 1
            while left > 0 and arr[left - 1] < arr[left]:
                left -= 1
            right = i + 1
            while right < n - 1 and arr[right] > arr[right + 1]:
                right += 1
            if right - left + 1 > best:
                best = right - left + 1
            i = right
        else:
            i += 1
    return best`,
    testCases: [
      { input: [[2, 1, 4, 7, 3, 2, 5]], expected: 5 },
      { input: [[2, 2, 2]], expected: 0 },
      { input: [[1, 2, 3, 4, 5]], expected: 0 },
      { input: [[1, 3, 2, 1, 4, 5, 3]], expected: 4 },
      { input: [[1, 2]], expected: 0 },
    ],
    hint: "A peak needs a strictly smaller neighbour on both sides before it can start a mountain.",
  },
  {
    id: "al-194",
    title: "Maximum Sum Circular Subarray",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the maximum sum of a non-empty subarray of nums, where the subarray may wrap around the end of the array.\n\nCompute the best ordinary subarray with Kadane's algorithm and the best circular one as the total minus the minimum subarray. If every value is negative, return the ordinary maximum.",
    starterCode: `def max_circular_subarray(nums):
    # Your code here
    pass`,
    solution: `def max_circular_subarray(nums):
    total = sum(nums)
    best_max = current_max = nums[0]
    best_min = current_min = nums[0]
    for x in nums[1:]:
        current_max = max(x, current_max + x)
        if current_max > best_max:
            best_max = current_max
        current_min = min(x, current_min + x)
        if current_min < best_min:
            best_min = current_min
    if best_max < 0:
        return best_max
    return max(best_max, total - best_min)`,
    testCases: [
      { input: [[1, -2, 3, -2]], expected: 3 },
      { input: [[5, -3, 5]], expected: 10 },
      { input: [[3, -1, 2, -1]], expected: 4 },
      { input: [[-3, -2, -5]], expected: -2 },
      { input: [[1]], expected: 1 },
    ],
    hint: "Removing the minimum middle subarray from the total leaves the best wrap-around sum.",
  },
  {
    id: "al-195",
    title: "Subarray Sums Divisible by K",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the subarrays whose sum is divisible by k, where values may be negative.\n\nMaintain counts of prefix sums modulo k and, for each new prefix, add the number of earlier prefixes with the same residue. Python's modulo keeps every residue non-negative.",
    starterCode: `def subarrays_divisible_by_k(nums, k):
    # Your code here
    pass`,
    solution: `def subarrays_divisible_by_k(nums, k):
    counts = {0: 1}
    prefix = 0
    total = 0
    for x in nums:
        prefix = (prefix + x) % k
        total += counts.get(prefix, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total`,
    testCases: [
      { input: [[4, 5, 0, -2, -3, 1], 5], expected: 7 },
      { input: [[5], 5], expected: 1 },
      { input: [[0, 0, 0], 3], expected: 6 },
      { input: [[-1, 2, 9], 2], expected: 2 },
      { input: [[], 5], expected: 0 },
    ],
    hint: "A subarray between two equal prefix residues has a sum divisible by k.",
  },
  {
    id: "al-196",
    title: "Count Subarrays with XOR K",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the contiguous subarrays whose XOR equals k.\n\nMaintain counts of prefix XOR values; for each new prefix p, the number of earlier prefixes equal to p XOR k gives the subarrays ending here. Runs in O(n) time.",
    starterCode: `def subarrays_xor_k(nums, k):
    # Your code here
    pass`,
    solution: `def subarrays_xor_k(nums, k):
    counts = {0: 1}
    prefix = 0
    total = 0
    for x in nums:
        prefix ^= x
        total += counts.get(prefix ^ k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total`,
    testCases: [
      { input: [[4, 2, 2, 6, 4], 6], expected: 4 },
      { input: [[1, 1, 1], 0], expected: 2 },
      { input: [[1], 1], expected: 1 },
      { input: [[], 0], expected: 0 },
      { input: [[0], 0], expected: 1 },
    ],
    hint: "XOR is its own inverse, so the needed earlier prefix is prefix XOR k.",
  },
  {
    id: "al-197",
    title: "Minimum Size Subarray Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given positive integers nums and a target, return the minimal length of a contiguous subarray whose sum is at least target, or 0 if no such subarray exists.\n\nGrow a right pointer and shrink from the left while the window sum meets the target, recording the best length. All values are positive.",
    starterCode: `def min_size_subarray_sum(nums, target):
    # Your code here
    pass`,
    solution: `def min_size_subarray_sum(nums, target):
    left = 0
    total = 0
    best = len(nums) + 1
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            if right - left + 1 < best:
                best = right - left + 1
            total -= nums[left]
            left += 1
    return best if best <= len(nums) else 0`,
    testCases: [
      { input: [[2, 3, 1, 2, 4, 3], 7], expected: 2 },
      { input: [[1, 4, 4], 4], expected: 1 },
      { input: [[1, 1, 1, 1, 1, 1, 1, 1], 11], expected: 0 },
      { input: [[1, 2, 3], 6], expected: 3 },
      { input: [[], 5], expected: 0 },
    ],
    hint: "Because all values are positive, shrinking the window never breaks a valid sum until it drops below target.",
  },
  {
    id: "al-198",
    title: "Kth Largest via Quickselect",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the k-th largest element (1-indexed) of nums using quickselect.\n\nPartition around the last element and recurse only into the side containing the target index len(nums) - k, giving average O(n) time. Duplicates are allowed and the input may contain negatives.",
    starterCode: `def kth_largest_quickselect(nums, k):
    # Your code here
    pass`,
    solution: `def kth_largest_quickselect(nums, k):
    target = len(nums) - k
    arr = list(nums)
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        pivot = arr[hi]
        i = lo
        for j in range(lo, hi):
            if arr[j] <= pivot:
                arr[i], arr[j] = arr[j], arr[i]
                i += 1
        arr[i], arr[hi] = arr[hi], arr[i]
        if i == target:
            return arr[i]
        if i < target:
            lo = i + 1
        else:
            hi = i - 1
    return arr[target]`,
    testCases: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { input: [[1], 1], expected: 1 },
      { input: [[7, 7, 7], 2], expected: 7 },
      { input: [[-1, -2, -3], 1], expected: -1 },
    ],
    hint: "The k-th largest sits at sorted index len(nums) - k.",
  },
  {
    id: "al-199",
    title: "Count Inversions",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the pairs (i, j) with i < j and arr[i] > arr[j].\n\nAdapt merge sort: whenever an element from the right half is taken during a merge, all remaining left elements form inversions with it. Equal elements never count.",
    starterCode: `def count_inversions(arr):
    # Your code here
    pass`,
    solution: `def count_inversions(arr):
    def sort_count(items):
        if len(items) <= 1:
            return items, 0
        mid = len(items) // 2
        left, count_left = sort_count(items[:mid])
        right, count_right = sort_count(items[mid:])
        count = count_left + count_right
        i = j = 0
        merged = []
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
                count += len(left) - i
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, count
    return sort_count(list(arr))[1]`,
    testCases: [
      { input: [[2, 4, 1, 3, 5]], expected: 3 },
      { input: [[5, 4, 3, 2, 1]], expected: 10 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[2, 2, 2]], expected: 0 },
    ],
    hint: "Taking from the right half means every left element still unmerged is strictly larger.",
  },
  {
    id: "al-200",
    title: "Count Unique BSTs",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the number of structurally unique binary search trees that store the values 1 through n.\n\nThis is the n-th Catalan number, computed with the multiplicative formula C(2n, n) // (n + 1). n = 0 counts the empty tree.",
    starterCode: `def count_unique_bsts(n):
    # Your code here
    pass`,
    solution: `def count_unique_bsts(n):
    total = 1
    for i in range(1, n + 1):
        total = total * (n + i) // i
    return total // (n + 1)`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
      { input: [3], expected: 5 },
      { input: [5], expected: 42 },
      { input: [10], expected: 16796 },
    ],
    hint: "Choosing root r splits the problem into counts for r - 1 and n - r left and right subtrees.",
  },
  {
    id: "al-201",
    title: "Two City Scheduling",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given 2n people and costs as [cost_a, cost_b], send exactly n people to city A and n to city B to minimize the total cost.\n\nSort by the difference cost_a - cost_b and send the first n people to A, since they are the cheapest to put in A relative to B, and the rest to B. Return 0 when there are no people.",
    starterCode: `def two_city_scheduling(costs):
    # Your code here
    pass`,
    solution: `def two_city_scheduling(costs):
    n = len(costs) // 2
    ordered = sorted(costs, key=lambda c: c[0] - c[1])
    total = 0
    for i, (a, b) in enumerate(ordered):
        total += a if i < n else b
    return total`,
    testCases: [
      { input: [[[10, 20], [30, 200], [400, 50], [30, 20]]], expected: 110 },
      {
        input: [[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]],
        expected: 1859,
      },
      { input: [[[1, 2], [3, 4]]], expected: 5 },
      { input: [[[5, 5], [5, 5]]], expected: 10 },
      { input: [[]], expected: 0 },
    ],
    hint: "The relative saving of sending someone to A instead of B is cost_a - cost_b.",
  },
  {
    id: "al-202",
    title: "Geometric Series Sum Mod",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the sum a + a*r + ... + a*r^(n-1) modulo m without iterating n times.\n\nUse the divide-and-conquer identity S(2k) = S(k) * (1 + r^k) with fast modular exponentiation, pulling out one term for odd counts. Return 0 when m is 1 or n is 0.",
    starterCode: `def geometric_series_mod(a, r, n, m):
    # Your code here
    pass`,
    solution: `def geometric_series_mod(a, r, n, m):
    if m == 1:
        return 0
    r %= m
    def power(base, e):
        result = 1 % m
        base %= m
        while e > 0:
            if e & 1:
                result = result * base % m
            base = base * base % m
            e >>= 1
        return result
    def series(count):
        if count == 0:
            return 0
        if count % 2 == 0:
            return series(count // 2) * (1 + power(r, count // 2)) % m
        return (1 + r * series(count - 1)) % m
    return a % m * series(n) % m`,
    testCases: [
      { input: [1, 2, 4, 1000], expected: 15 },
      { input: [2, 3, 3, 100], expected: 26 },
      { input: [5, 1, 4, 7], expected: 6 },
      { input: [1, 10, 5, 7], expected: 2 },
      { input: [0, 5, 10, 13], expected: 0 },
      { input: [1, 2, 0, 10], expected: 0 },
    ],
    hint: "The even-length half can be built from the first half multiplied by one plus r to the half power.",
  },
  {
    id: "al-203",
    title: "Modular Inverse",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the multiplicative inverse of a modulo m, meaning x with a*x congruent to 1 modulo m, or -1 when a and m are not coprime.\n\nRun the extended Euclidean algorithm and reduce the resulting coefficient into the range from 0 to m - 1. Every integer is invertible modulo 1, and the answer is 0 there.",
    starterCode: `def modular_inverse(a, m):
    # Your code here
    pass`,
    solution: `def modular_inverse(a, m):
    if m == 1:
        return 0
    old_r, r = a % m, m
    old_s, s = 1, 0
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    if old_r != 1:
        return -1
    return old_s % m`,
    testCases: [
      { input: [3, 11], expected: 4 },
      { input: [10, 17], expected: 12 },
      { input: [2, 4], expected: -1 },
      { input: [1, 1], expected: 0 },
      { input: [7, 13], expected: 2 },
    ],
    hint: "The inverse exists exactly when the extended Euclidean algorithm ends with gcd equal to 1.",
  },
  {
    id: "al-204",
    title: "Count Paths via Matrix Power",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a directed graph with n nodes and edges as [u, v] pairs, return the number of walks of exactly the given length from start to end.\n\nBuild the adjacency matrix, where parallel edges increase an entry, raise it to the length with fast matrix exponentiation, and read the entry [start][end]. Length 0 gives 1 when start equals end.",
    starterCode: `def count_paths_matrix_power(n, edges, length, start, end):
    # Your code here
    pass`,
    solution: `def count_paths_matrix_power(n, edges, length, start, end):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] += 1
    def multiply(a, b):
        size = len(a)
        out = [[0] * size for _ in range(size)]
        for i in range(size):
            for k in range(size):
                if a[i][k]:
                    aik = a[i][k]
                    for j in range(size):
                        out[i][j] += aik * b[k][j]
        return out
    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    base = matrix
    p = length
    while p > 0:
        if p & 1:
            result = multiply(result, base)
        base = multiply(base, base)
        p >>= 1
    return result[start][end]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 3, 0, 0], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 6, 0, 0], expected: 1 },
      { input: [3, [[0, 1], [1, 2]], 2, 0, 2], expected: 1 },
      { input: [1, [], 0, 0, 0], expected: 1 },
      { input: [2, [[0, 1], [1, 0]], 2, 0, 0], expected: 1 },
    ],
    hint: "The (i, j) entry of the adjacency matrix raised to power L counts walks of length L.",
  },
  {
    id: "al-205",
    title: "Meet in the Middle Sum Count",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the subsets of nums, by index and including the empty subset, whose elements sum to target.\n\nSplit nums in half, enumerate all subset sums of each half, and for every sum in the second half add the count of target minus that sum in the first table. Suitable for inputs up to about 20 elements.",
    starterCode: `def meet_in_middle_sum_count(nums, target):
    # Your code here
    pass`,
    solution: `def meet_in_middle_sum_count(nums, target):
    n = len(nums)
    mid = n // 2
    first = {}
    def collect_first(i, total):
        if i == mid:
            first[total] = first.get(total, 0) + 1
            return
        collect_first(i + 1, total)
        collect_first(i + 1, total + nums[i])
    collect_first(0, 0)
    total_count = 0
    def collect_second(i, total):
        nonlocal total_count
        if i == n:
            total_count += first.get(target - total, 0)
            return
        collect_second(i + 1, total)
        collect_second(i + 1, total + nums[i])
    collect_second(mid, 0)
    return total_count`,
    testCases: [
      { input: [[1, 2, 3, 4], 5], expected: 2 },
      { input: [[0, 0], 0], expected: 4 },
      { input: [[1, 1, 1, 1], 2], expected: 6 },
      { input: [[], 0], expected: 1 },
      { input: [[5], 5], expected: 1 },
    ],
    hint: "Duplicate sums are counted with their multiplicity, which is what the hash table stores.",
  },
  {
    id: "al-206",
    title: "Boggle Word Count",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a board of characters and a list of words, return how many words can be traced through horizontally or vertically adjacent cells without reusing a cell.\n\nRun DFS from every cell for each word, temporarily marking visited cells and restoring them while backtracking. Each list entry is counted separately, and an empty word list gives 0.",
    starterCode: `def boggle_word_count(board, words):
    # Your code here
    pass`,
    solution: `def boggle_word_count(board, words):
    if not words:
        return 0
    rows = len(board)
    cols = len(board[0]) if rows else 0
    found = 0
    for word in words:
        if not word:
            continue
        def dfs(r, c, i):
            if i == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
                return False
            temp = board[r][c]
            board[r][c] = "#"
            ok = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                  or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = temp
            return ok
        if any(dfs(r, c, 0) for r in range(rows) for c in range(cols)):
            found += 1
    return found`,
    testCases: [
      {
        input: [
          [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
          ["ABCCED", "SEE", "ABCB"],
        ],
        expected: 2,
      },
      {
        input: [
          [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
          ["A", "B"],
        ],
        expected: 2,
      },
      { input: [[["a"]], ["a", "b"]], expected: 1 },
      { input: [[[]], ["a"]], expected: 0 },
      { input: [[["A"]], []], expected: 0 },
    ],
    hint: "The same word appearing twice in the list counts twice.",
  },
  {
    id: "al-207",
    title: "Z-Function",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Compute the Z-array of s, where z[i] is the length of the longest substring starting at i that matches a prefix of s.\n\nUse the standard linear algorithm with the rightmost Z-box, reusing previously computed values while inside the box. Define z[0] as len(s).",
    starterCode: `def z_function(s):
    # Your code here
    pass`,
    solution: `def z_function(s):
    n = len(s)
    z = [0] * n
    if n:
        z[0] = n
    left = right = 0
    for i in range(1, n):
        if i <= right:
            z[i] = min(right - i + 1, z[i - left])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] - 1 > right:
            left, right = i, i + z[i] - 1
    return z`,
    testCases: [
      {
        input: ["aabcaabxaaaz"],
        expected: [12, 1, 0, 0, 3, 1, 0, 0, 2, 2, 1, 0],
      },
      { input: ["aaaa"], expected: [4, 3, 2, 1] },
      { input: ["abc"], expected: [3, 0, 0] },
      { input: [""], expected: [] },
      { input: ["a"], expected: [1] },
    ],
    hint: "Extending beyond the current Z-box is the only case that costs more than constant time.",
  },
  {
    id: "al-208",
    title: "Aho-Corasick Matches",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given text and a list of patterns, return the total number of pattern occurrences in text, counting overlapping matches and repeated patterns separately.\n\nBuild a trie with failure links and accumulated output counts, then run the automaton over the text. Return 0 for no matches, and an empty pattern list gives 0.",
    starterCode: `def aho_corasick_matches(text, patterns):
    # Your code here
    pass`,
    solution: `from collections import deque

def aho_corasick_matches(text, patterns):
    goto = [{}]
    fail = [0]
    out = [0]
    for pattern in patterns:
        node = 0
        for ch in pattern:
            if ch not in goto[node]:
                goto[node][ch] = len(goto)
                goto.append({})
                fail.append(0)
                out.append(0)
            node = goto[node][ch]
        out[node] += 1
    queue = deque()
    for child in goto[0].values():
        queue.append(child)
        fail[child] = 0
    while queue:
        node = queue.popleft()
        out[node] += out[fail[node]]
        for ch, child in goto[node].items():
            f = fail[node]
            while f and ch not in goto[f]:
                f = fail[f]
            if ch in goto[f] and goto[f][ch] != child:
                fail[child] = goto[f][ch]
            else:
                fail[child] = 0
            queue.append(child)
    count = 0
    node = 0
    for ch in text:
        while node and ch not in goto[node]:
            node = fail[node]
        node = goto[node].get(ch, 0)
        count += out[node]
    return count`,
    testCases: [
      {
        input: ["ahishers", ["he", "she", "his", "hers"]],
        expected: 4,
      },
      { input: ["aaaa", ["a", "aa"]], expected: 7 },
      { input: ["abc", ["d"]], expected: 0 },
      { input: ["", ["a"]], expected: 0 },
      { input: ["abab", ["ab", "ba"]], expected: 3 },
    ],
    hint: "Output counts propagate along failure links so suffix patterns are also counted.",
  },
  {
    id: "al-209",
    title: "Manacher Radii",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the Manacher radii for odd-length palindromes: d1[i] is the number of characters in the longest odd palindrome centered at index i.\n\nUse the linear Manacher algorithm that reuses the mirrored radius inside the current rightmost palindrome. Return an empty list for an empty string.",
    starterCode: `def manacher_radii(s):
    # Your code here
    pass`,
    solution: `def manacher_radii(s):
    n = len(s)
    d1 = [0] * n
    left, right = 0, -1
    for i in range(n):
        k = 1 if i > right else min(d1[left + right - i], right - i + 1)
        while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:
            k += 1
        d1[i] = k
        if i + k - 1 > right:
            left = i - k + 1
            right = i + k - 1
    return d1`,
    testCases: [
      { input: ["babad"], expected: [1, 2, 2, 1, 1] },
      { input: ["aaaa"], expected: [1, 2, 2, 1] },
      { input: ["abc"], expected: [1, 1, 1] },
      { input: ["a"], expected: [1] },
      { input: [""], expected: [] },
    ],
    hint: "A radius of k means the palindrome spans from i - k + 1 through i + k - 1.",
  },
  {
    id: "al-210",
    title: "Shortest Palindrome",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the shortest palindrome that can be formed by adding characters only to the front of s.\n\nFind the longest palindromic prefix of s with the KMP prefix function on s plus a separator plus the reverse of s, then prepend the reversed leftover suffix. An empty or single-character string is already a palindrome.",
    starterCode: `def shortest_palindrome(s):
    # Your code here
    pass`,
    solution: `def shortest_palindrome(s):
    if len(s) <= 1:
        return s
    combined = s + "#" + s[::-1]
    table = [0] * len(combined)
    for i in range(1, len(combined)):
        j = table[i - 1]
        while j > 0 and combined[i] != combined[j]:
            j = table[j - 1]
        if combined[i] == combined[j]:
            j += 1
        table[i] = j
    prefix_len = table[-1]
    return s[prefix_len:][::-1] + s`,
    testCases: [
      { input: ["aacecaaa"], expected: "aaacecaaa" },
      { input: ["abcd"], expected: "dcbabcd" },
      { input: [""], expected: "" },
      { input: ["a"], expected: "a" },
      { input: ["aba"], expected: "aba" },
    ],
    hint: "The last value of the KMP table on s + separator + reverse(s) is the longest palindromic prefix length.",
  },
  {
    id: "al-211",
    title: "Strange Printer",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a string s, return the minimum number of turns of a strange printer to print it; each turn prints one character over a contiguous range and may overwrite existing characters.\n\nUse interval DP: start dp[i][j] at dp[i+1][j] + 1, and whenever s[k] equals s[i] for some k in the interval, merging the print of s[i] over that range can lower the cost. Return 0 for an empty string.",
    starterCode: `def strange_printer(s):
    # Your code here
    pass`,
    solution: `def strange_printer(s):
    n = len(s)
    if n == 0:
        return 0
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = dp[i + 1][j] + 1
            for k in range(i + 1, j + 1):
                if s[k] == s[i]:
                    left = dp[i + 1][k - 1] if k > i + 1 else 0
                    if left + dp[k][j] < dp[i][j]:
                        dp[i][j] = left + dp[k][j]
    return dp[0][n - 1]`,
    testCases: [
      { input: ["aaabbb"], expected: 2 },
      { input: ["aba"], expected: 2 },
      { input: ["abc"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["aaaa"], expected: 1 },
      { input: ["abba"], expected: 2 },
    ],
    hint: "Reusing s[i] at position k lets the printer paint the middle first and s[i] later over a wider span.",
  },
  {
    id: "al-212",
    title: "Kth Element of Two Sorted Arrays",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the k-th smallest element (1-indexed) of two sorted arrays a and b in O(log(min(len(a), len(b)))) time.\n\nBinary search a partition of the shorter array such that the left parts together hold k elements and every left value is at most every right value. Sentinels handle empty partitions.",
    starterCode: `def kth_two_sorted_arrays(a, b, k):
    # Your code here
    pass`,
    solution: `def kth_two_sorted_arrays(a, b, k):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    lo = max(0, k - n)
    hi = min(k, m)
    while lo < hi:
        i = (lo + hi) // 2
        j = k - i
        a_left = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i] if i < m else float("inf")
        b_left = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j] if j < n else float("inf")
        if a_left > b_right:
            hi = i - 1
        elif b_left > a_right:
            lo = i + 1
        else:
            return max(a_left, b_left)
    i = lo
    j = k - i
    a_left = a[i - 1] if i > 0 else float("-inf")
    b_left = b[j - 1] if j > 0 else float("-inf")
    return max(a_left, b_left)`,
    testCases: [
      { input: [[1, 3], [2], 2], expected: 2 },
      { input: [[1, 2], [3, 4], 3], expected: 3 },
      { input: [[], [1], 1], expected: 1 },
      { input: [[0, 0], [0, 0], 4], expected: 0 },
      { input: [[2], [], 1], expected: 2 },
    ],
    hint: "Partitioning the shorter array fixes the partition of the longer one because together they must hold k elements.",
  },
  {
    id: "al-213",
    title: "Count Smaller After Self",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return a list where result[i] is the number of elements to the right of i that are smaller than nums[i].\n\nCoordinate-compress the values and sweep from right to left with a Fenwick tree, querying how many already-seen ranks are below the current one. Return an empty list for empty input.",
    starterCode: `def count_smaller_after_self(nums):
    # Your code here
    pass`,
    solution: `def count_smaller_after_self(nums):
    if not nums:
        return []
    ordered = sorted(set(nums))
    rank = {value: i + 1 for i, value in enumerate(ordered)}
    size = len(ordered)
    tree = [0] * (size + 1)
    def update(i):
        while i <= size:
            tree[i] += 1
            i += i & (-i)
    def query(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & (-i)
        return total
    result = [0] * len(nums)
    for i in range(len(nums) - 1, -1, -1):
        r = rank[nums[i]]
        result[i] = query(r - 1)
        update(r)
    return result`,
    testCases: [
      { input: [[5, 2, 6, 1]], expected: [2, 1, 1, 0] },
      { input: [[-1]], expected: [0] },
      { input: [[-1, -1]], expected: [0, 0] },
      { input: [[3, 4, 9, 6, 1]], expected: [1, 1, 2, 1, 0] },
      { input: [[]], expected: [] },
    ],
    hint: "The Fenwick tree stores counts of ranks seen so far; query below the current rank.",
  },
  {
    id: "al-214",
    title: "Count Reverse Pairs",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the pairs (i, j) with i < j and nums[i] > 2 * nums[j].\n\nAdapt merge sort: before each merge, advance a pointer over the sorted right half while the condition holds, adding the pointer count for every left element. Counts accumulate across all merge levels.",
    starterCode: `def count_reverse_pairs(nums):
    # Your code here
    pass`,
    solution: `def count_reverse_pairs(nums):
    def sort_count(arr):
        if len(arr) <= 1:
            return arr, 0
        mid = len(arr) // 2
        left, count_left = sort_count(arr[:mid])
        right, count_right = sort_count(arr[mid:])
        count = count_left + count_right
        j = 0
        for x in left:
            while j < len(right) and x > 2 * right[j]:
                j += 1
            count += j
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
        return merged, count
    return sort_count(list(nums))[1]`,
    testCases: [
      { input: [[1, 3, 2, 3, 1]], expected: 2 },
      { input: [[2, 4, 3, 5, 1]], expected: 3 },
      { input: [[-5, -5]], expected: 1 },
      { input: [[5, 4, 3, 2, 1]], expected: 4 },
      { input: [[]], expected: 0 },
    ],
    hint: "Both halves are sorted before counting, so the pointer over the right half only moves forward.",
  },
  {
    id: "al-215",
    title: "TSP with Bitmask DP",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a symmetric distance matrix dist for n cities, return the minimum cost of a tour that starts at city 0, visits every city exactly once and returns to 0.\n\nUse bitmask DP: dp[mask][u] is the cheapest path visiting the cities in mask and ending at u, then close the tour back to 0. A single city costs 0.",
    starterCode: `def tsp_bitmask(dist):
    # Your code here
    pass`,
    solution: `def tsp_bitmask(dist):
    n = len(dist)
    if n <= 1:
        return 0
    size = 1 << n
    dp = [[float("inf")] * n for _ in range(size)]
    dp[1][0] = 0
    for mask in range(size):
        for u in range(n):
            if dp[mask][u] == float("inf"):
                continue
            for v in range(n):
                if mask & (1 << v):
                    continue
                new_mask = mask | (1 << v)
                cost = dp[mask][u] + dist[u][v]
                if cost < dp[new_mask][v]:
                    dp[new_mask][v] = cost
    full = size - 1
    best = float("inf")
    for u in range(1, n):
        cost = dp[full][u] + dist[u][0]
        if cost < best:
            best = cost
    return int(best)`,
    testCases: [
      {
        input: [[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]],
        expected: 80,
      },
      { input: [[[0, 1, 2], [1, 0, 1], [2, 1, 0]]], expected: 4 },
      { input: [[[0]]], expected: 0 },
      { input: [[[0, 5], [5, 0]]], expected: 10 },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]]], expected: 3 },
    ],
    hint: "Mask 1 starts at city 0 for free, and the answer closes each full-mask state back to city 0.",
  },
];
