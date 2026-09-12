import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-041",
    title: "Valid Parentheses",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Determine whether the string s made of bracket characters is balanced.\n\nUse a stack: push every opening bracket, and on a closing bracket verify it matches the most recent unmatched opener. Return True for the empty string and False on any mismatch or leftover opener.",
    starterCode: `def is_valid_parentheses(s):
    # Your code here
    pass`,
    solution: `def is_valid_parentheses(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack`,
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([{}])"], expected: true },
      { input: [""], expected: true },
    ],
    hint: "A closing bracket must match the most recently opened one, which is exactly a last-in-first-out check.",
  },
  {
    id: "al-042",
    title: "Climbing Stairs",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of distinct ways to climb a staircase of n steps when each move is either 1 or 2 steps.\n\nThe count follows the Fibonacci recurrence ways(n) = ways(n-1) + ways(n-2) with ways(0) = 1 and ways(1) = 1. Assume n >= 0.",
    starterCode: `def climb_stairs(n):
    # Your code here
    pass`,
    solution: `def climb_stairs(n):
    if n <= 1:
        return 1
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
      { input: [5], expected: 8 },
      { input: [10], expected: 89 },
    ],
    hint: "The number of ways to reach step n equals the ways to reach n-1 plus the ways to reach n-2.",
  },
  {
    id: "al-043",
    title: "Missing Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given nums containing n distinct integers taken from the range 0 to n, return the single missing value from that range.\n\nXOR every index together with every value so matching pairs cancel out and only the missing number remains. Runs in O(n) time with O(1) extra space.",
    starterCode: `def missing_number(nums):
    # Your code here
    pass`,
    solution: `def missing_number(nums):
    result = len(nums)
    for i, x in enumerate(nums):
        result ^= i ^ x
    return result`,
    testCases: [
      { input: [[3, 0, 1]], expected: 2 },
      { input: [[0, 1]], expected: 2 },
      { input: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { input: [[0]], expected: 1 },
      { input: [[1]], expected: 0 },
    ],
    hint: "XOR of a value with itself is 0, so start from n and XOR in each index and value.",
  },
  {
    id: "al-044",
    title: "Single Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Every element of nums appears exactly twice except for one element that appears once; return that unique value.\n\nXOR all the numbers together so duplicate pairs cancel to 0 and the odd one out survives. Runs in O(n) time with O(1) extra space.",
    starterCode: `def single_number(nums):
    # Your code here
    pass`,
    solution: `def single_number(nums):
    result = 0
    for x in nums:
        result ^= x
    return result`,
    testCases: [
      { input: [[2, 2, 1]], expected: 1 },
      { input: [[4, 1, 2, 1, 2]], expected: 4 },
      { input: [[1]], expected: 1 },
      { input: [[-1, -1, -2]], expected: -2 },
      { input: [[0, 0, 5]], expected: 5 },
    ],
    hint: "XOR is associative and commutative, so the order of cancellation does not matter.",
  },
  {
    id: "al-045",
    title: "Power of Two",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the integer n is a power of two and False otherwise, including for n <= 0.\n\nA positive power of two has exactly one set bit, so the expression n & (n - 1) equals zero. Do not use logarithms or loops.",
    starterCode: `def is_power_of_two(n):
    # Your code here
    pass`,
    solution: `def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0`,
    testCases: [
      { input: [1], expected: true },
      { input: [16], expected: true },
      { input: [3], expected: false },
      { input: [0], expected: false },
      { input: [-4], expected: false },
    ],
    hint: "Subtracting 1 flips the single set bit and all lower bits, so the AND clears everything.",
  },
  {
    id: "al-046",
    title: "GCD of Array",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the greatest common divisor of all integers in nums.\n\nFold the Euclidean algorithm across the list, starting the accumulator at 0 because gcd(0, x) is x. Return 0 for an empty list or a list containing only zeros.",
    starterCode: `def gcd_array(nums):
    # Your code here
    pass`,
    solution: `def gcd_array(nums):
    result = 0
    for x in nums:
        a, b = result, abs(x)
        while b:
            a, b = b, a % b
        result = a
    return result`,
    testCases: [
      { input: [[12, 18, 24]], expected: 6 },
      { input: [[7]], expected: 7 },
      { input: [[]], expected: 0 },
      { input: [[0, 0]], expected: 0 },
      { input: [[5, 10, 15, 20]], expected: 5 },
    ],
    hint: "gcd(a, b, c) equals gcd(gcd(a, b), c), so one running accumulator is enough.",
  },
  {
    id: "al-047",
    title: "LCM of Array",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the least common multiple of all integers in nums.\n\nFold lcm(a, b) = a // gcd(a, b) * b across the list, dividing before multiplying to keep the numbers small. Return 0 if the list is empty or contains a zero.",
    starterCode: `def lcm_array(nums):
    # Your code here
    pass`,
    solution: `from math import gcd

def lcm_array(nums):
    if not nums:
        return 0
    result = 1
    for x in nums:
        if x == 0:
            return 0
        result = result // gcd(result, abs(x)) * abs(x)
    return result`,
    testCases: [
      { input: [[4, 6]], expected: 12 },
      { input: [[3, 5, 7]], expected: 105 },
      { input: [[1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[0, 5]], expected: 0 },
    ],
    hint: "Divide by the GCD before multiplying so the product never exceeds the true LCM.",
  },
  {
    id: "al-048",
    title: "N-th Prime",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the n-th prime number with 1-indexed counting, so nth_prime(1) is 2 and nth_prime(10) is 29.\n\nTest candidate integers in increasing order and count primes until reaching n, checking divisibility only up to the square root. Return -1 for n < 1.",
    starterCode: `def nth_prime(n):
    # Your code here
    pass`,
    solution: `def nth_prime(n):
    if n < 1:
        return -1
    count = 0
    candidate = 1
    while count < n:
        candidate += 1
        prime = candidate > 1
        d = 2
        while d * d <= candidate:
            if candidate % d == 0:
                prime = False
                break
            d += 1
        if prime:
            count += 1
    return candidate`,
    testCases: [
      { input: [1], expected: 2 },
      { input: [2], expected: 3 },
      { input: [6], expected: 13 },
      { input: [10], expected: 29 },
      { input: [100], expected: 541 },
    ],
    hint: "A number is prime when no divisor up to its square root divides it evenly.",
  },
  {
    id: "al-049",
    title: "Roman to Integer",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert a valid Roman numeral string to its integer value.\n\nAdd each symbol's value, except when a smaller symbol precedes a larger one, in which case subtract the smaller value, as in IV = 4 and IX = 9. Assume s is a valid numeral between 1 and 3999.",
    starterCode: `def roman_to_int(s):
    # Your code here
    pass`,
    solution: `def roman_to_int(s):
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        value = values[ch]
        if i + 1 < len(s) and values[s[i + 1]] > value:
            total -= value
        else:
            total += value
    return total`,
    testCases: [
      { input: ["III"], expected: 3 },
      { input: ["IV"], expected: 4 },
      { input: ["MCMXCIV"], expected: 1994 },
      { input: ["LVIII"], expected: 58 },
      { input: ["IX"], expected: 9 },
    ],
    hint: "Only the subtractive pairs put a smaller symbol before a larger one.",
  },
  {
    id: "al-050",
    title: "Excel Column Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert an Excel column title such as A, Z, AA or ZY to its 1-based column number.\n\nProcess characters left to right treating the title as a base-26 number where A is 1 rather than 0: result = result * 26 + (letter position). Assume s contains only uppercase letters.",
    starterCode: `def excel_column_number(s):
    # Your code here
    pass`,
    solution: `def excel_column_number(s):
    result = 0
    for ch in s:
        result = result * 26 + (ord(ch) - ord("A") + 1)
    return result`,
    testCases: [
      { input: ["A"], expected: 1 },
      { input: ["Z"], expected: 26 },
      { input: ["AA"], expected: 27 },
      { input: ["ZY"], expected: 701 },
      { input: ["AZ"], expected: 52 },
    ],
    hint: "Shift the running value by one base-26 digit per character, with A having value 1.",
  },
  {
    id: "al-051",
    title: "Meeting Rooms",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given meeting time intervals as [start, end] pairs, return True if one person can attend every meeting without overlap.\n\nSort intervals by start time and check that each meeting begins at or after the previous one ends. Touching endpoints, such as [1, 2] and [2, 3], do not count as overlap.",
    starterCode: `def can_attend_all(intervals):
    # Your code here
    pass`,
    solution: `def can_attend_all(intervals):
    ordered = sorted(intervals, key=lambda x: x[0])
    for i in range(1, len(ordered)):
        if ordered[i][0] < ordered[i - 1][1]:
            return False
    return True`,
    testCases: [
      { input: [[[0, 30], [5, 10], [15, 20]]], expected: false },
      { input: [[[7, 10], [2, 4]]], expected: true },
      { input: [[]], expected: true },
      { input: [[[1, 5]]], expected: true },
      { input: [[[1, 2], [2, 3]]], expected: true },
    ],
    hint: "After sorting by start, only consecutive pairs can conflict.",
  },
  {
    id: "al-052",
    title: "Unique Paths",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the number of paths from the top-left to the bottom-right corner of an m by n grid when each move goes one cell right or one cell down.\n\nUse dynamic programming where the first row and column are all 1 and every other cell is the sum of the cell above and the cell to the left. Assume m >= 1 and n >= 1.",
    starterCode: `def unique_paths(m, n):
    # Your code here
    pass`,
    solution: `def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[n - 1]`,
    testCases: [
      { input: [3, 7], expected: 28 },
      { input: [3, 3], expected: 6 },
      { input: [1, 1], expected: 1 },
      { input: [1, 5], expected: 1 },
      { input: [5, 5], expected: 70 },
    ],
    hint: "Each cell is reachable only from the cell above and the cell to the left.",
  },
  {
    id: "al-053",
    title: "House Robber",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Given the money in each house on a street, return the maximum amount that can be robbed without robbing two adjacent houses.\n\nAt each house choose between skipping it, which keeps the previous best, or taking it plus the best total from two houses back. Return 0 for an empty list.",
    starterCode: `def rob(nums):
    # Your code here
    pass`,
    solution: `def rob(nums):
    prev2 = 0
    prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
    testCases: [
      { input: [[1, 2, 3, 1]], expected: 4 },
      { input: [[2, 7, 9, 3, 1]], expected: 12 },
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 5 },
      { input: [[2, 1, 1, 2]], expected: 4 },
    ],
    hint: "best(i) = max(best(i-1), best(i-2) + money[i]); only two previous values are needed.",
  },
  {
    id: "al-054",
    title: "Perfect Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if n is a perfect number, meaning n equals the sum of its proper divisors, and False otherwise.\n\nSum divisor pairs up to the square root, starting from 1, and compare the total with n. Numbers less than or equal to 1 are not perfect.",
    starterCode: `def is_perfect_number(n):
    # Your code here
    pass`,
    solution: `def is_perfect_number(n):
    if n <= 1:
        return False
    total = 1
    d = 2
    while d * d <= n:
        if n % d == 0:
            total += d
            if d != n // d:
                total += n // d
        d += 1
    return total == n`,
    testCases: [
      { input: [6], expected: true },
      { input: [28], expected: true },
      { input: [12], expected: false },
      { input: [1], expected: false },
      { input: [496], expected: true },
    ],
    hint: "Every divisor below the square root has a partner above it; add both while avoiding double counting a perfect square.",
  },
  {
    id: "al-055",
    title: "Merge Intervals",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a list of [start, end] intervals, merge every group that overlaps or touches and return the resulting sorted intervals.\n\nSort by start time, then extend the last merged interval when the next start is at most its current end, otherwise append it as a new interval. Return an empty list for empty input.",
    starterCode: `def merge_intervals(intervals):
    # Your code here
    pass`,
    solution: `def merge_intervals(intervals):
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda x: x[0])
    merged = [list(ordered[0])]
    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            if end > merged[-1][1]:
                merged[-1][1] = end
        else:
            merged.append([start, end])
    return merged`,
    testCases: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[]], expected: [] },
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      { input: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
    ],
    hint: "After sorting by start, a new interval merges whenever its start does not exceed the current merged end.",
  },
  {
    id: "al-056",
    title: "Minimum Meeting Rooms",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the minimum number of meeting rooms needed to schedule all intervals without overlap.\n\nCreate a start event (+1) and an end event (-1) for each interval, sort all events by time, and process ends before starts at the same time. The answer is the maximum number of simultaneously active meetings.",
    starterCode: `def min_meeting_rooms(intervals):
    # Your code here
    pass`,
    solution: `def min_meeting_rooms(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort()
    rooms = 0
    best = 0
    for _, delta in events:
        rooms += delta
        if rooms > best:
            best = rooms
    return best`,
    testCases: [
      { input: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { input: [[[7, 10], [2, 4]]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[[1, 5], [5, 10]]], expected: 1 },
      { input: [[[1, 10], [2, 3], [4, 5]]], expected: 2 },
    ],
    hint: "Sorting time, delta with ends as -1 makes meetings that touch endpoints not overlap.",
  },
  {
    id: "al-057",
    title: "Subarray Sum Equals K",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count how many contiguous subarrays of nums sum to exactly k. Values may be negative.\n\nTrack the running prefix sum in a hash map of prefix counts: for each prefix p, the number of earlier prefixes equal to p - k gives the subarrays ending here. Runs in O(n) time.",
    starterCode: `def subarray_sum(nums, k):
    # Your code here
    pass`,
    solution: `def subarray_sum(nums, k):
    counts = {0: 1}
    prefix = 0
    total = 0
    for x in nums:
        prefix += x
        total += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total`,
    testCases: [
      { input: [[1, 1, 1], 2], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 2 },
      { input: [[1, -1, 0], 0], expected: 3 },
      { input: [[-1, -1, 1], 0], expected: 1 },
      { input: [[], 0], expected: 0 },
      { input: [[0, 0, 0], 0], expected: 6 },
    ],
    hint: "A subarray between indices i and j sums to k exactly when prefix[j] - prefix[i] equals k.",
  },
  {
    id: "al-058",
    title: "Product of Array Except Self",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return a list where position i holds the product of every element of nums except nums[i], without using division.\n\nBuild prefix products in a first pass and multiply by suffix products in a second pass. Zeros are handled naturally, and the input always has at least one element.",
    starterCode: `def product_except_self(nums):
    # Your code here
    pass`,
    solution: `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { input: [[2, 3]], expected: [3, 2] },
      { input: [[1, 0]], expected: [0, 1] },
      { input: [[0, 0]], expected: [0, 0] },
    ],
    hint: "The answer for index i is the product of everything before i times the product of everything after i.",
  },
  {
    id: "al-059",
    title: "Rotate Matrix 90 Degrees",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Rotate an n by n matrix 90 degrees clockwise and return the new matrix, leaving the input unchanged.\n\nThe element at row i, column j moves to row j, column n - 1 - i. Return an empty list for empty input.",
    starterCode: `def rotate_matrix(matrix):
    # Your code here
    pass`,
    solution: `def rotate_matrix(matrix):
    if not matrix:
        return []
    n = len(matrix)
    out = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            out[j][n - 1 - i] = matrix[i][j]
    return out`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
      },
      { input: [[[1]]], expected: [[1]] },
      { input: [[]], expected: [] },
    ],
    hint: "A clockwise rotation sends the first row to the last column.",
  },
  {
    id: "al-060",
    title: "Group Anagrams",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Group words that are anagrams of one another and return the groups as a list of lists.\n\nIterate the words in order and bucket each into a dictionary keyed by its sorted characters, so groups appear in order of first occurrence and words keep their input order.",
    starterCode: `def group_anagrams(words):
    # Your code here
    pass`,
    solution: `def group_anagrams(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word))
        if key not in groups:
            groups[key] = []
        groups[key].append(word)
    return list(groups.values())`,
    testCases: [
      {
        input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
      },
      { input: [[""]], expected: [[""]] },
      { input: [["a"]], expected: [["a"]] },
      {
        input: [["ab", "ba", "abc", "cba", "bac"]],
        expected: [["ab", "ba"], ["abc", "cba", "bac"]],
      },
    ],
    hint: "Two words are anagrams exactly when their sorted character sequences match.",
  },
  {
    id: "al-061",
    title: "Longest Palindromic Substring",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the longest palindromic substring of s; when several share the maximum length, return the first one found scanning centers left to right.\n\nExpand around every center, treating both odd-length and even-length palindromes, and keep the longest expansion. Return the empty string for empty input.",
    starterCode: `def longest_palindrome(s):
    # Your code here
    pass`,
    solution: `def longest_palindrome(s):
    if not s:
        return ""
    best = s[0]
    for center in range(len(s)):
        for left, right in ((center, center), (center, center + 1)):
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            if right - left - 1 > len(best):
                best = s[left + 1:right]
    return best`,
    testCases: [
      { input: ["babad"], expected: "bab" },
      { input: ["cbbd"], expected: "bb" },
      { input: [""], expected: "" },
      { input: ["a"], expected: "a" },
      { input: ["forgeeksskeegfor"], expected: "geeksskeeg" },
    ],
    hint: "Every palindrome has a center, either one character or a gap between two characters.",
  },
  {
    id: "al-062",
    title: "Word Break",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if s can be segmented into a sequence of one or more dictionary words from the list words, reusing words as often as needed.\n\nLet dp[i] mean the prefix of length i is segmentable; dp[i] is True when some split point j has dp[j] True and s[j:i] is in the dictionary. Assume dictionary entries are non-empty.",
    starterCode: `def word_break(s, words):
    # Your code here
    pass`,
    solution: `def word_break(s, words):
    word_set = set(words)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[n]`,
    testCases: [
      { input: ["leetcode", ["leet", "code"]], expected: true },
      { input: ["applepenapple", ["apple", "pen"]], expected: true },
      {
        input: ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
        expected: false,
      },
      { input: ["", ["a"]], expected: true },
      { input: ["a", ["b"]], expected: false },
    ],
    hint: "Try every split point j of the current prefix and reuse previously computed answers.",
  },
  {
    id: "al-063",
    title: "Decode Ways",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of ways to decode a digit string s where 1 maps to A through 26 mapping to Z.\n\nUse dynamic programming: a single digit can stand alone when it is not zero, and a two-digit group is valid only when it lies between 10 and 26. Return 0 for the empty string or any string that cannot be fully decoded.",
    starterCode: `def num_decodings(s):
    # Your code here
    pass`,
    solution: `def num_decodings(s):
    if not s:
        return 0
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        if s[i - 1] != "0":
            dp[i] += dp[i - 1]
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]
    return dp[n]`,
    testCases: [
      { input: ["12"], expected: 2 },
      { input: ["226"], expected: 3 },
      { input: ["06"], expected: 0 },
      { input: ["10"], expected: 1 },
      { input: ["27"], expected: 1 },
      { input: [""], expected: 0 },
    ],
    hint: "A leading zero can only be consumed as the second digit of 10 or 20.",
  },
  {
    id: "al-064",
    title: "Minimum Path Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the minimum sum of a path from the top-left to the bottom-right of a grid of non-negative numbers, moving only right or down.\n\nFill a DP table where the first row and column accumulate directly and every other cell adds the smaller of its top and left neighbours. Return 0 for an empty grid.",
    starterCode: `def min_path_sum(grid):
    # Your code here
    pass`,
    solution: `def min_path_sum(grid):
    if not grid or not grid[0]:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = grid[0][0]
    for j in range(1, cols):
        dp[0][j] = dp[0][j - 1] + grid[0][j]
    for i in range(1, rows):
        dp[i][0] = dp[i - 1][0] + grid[i][0]
        for j in range(1, cols):
            dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
    return dp[rows - 1][cols - 1]`,
    testCases: [
      { input: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { input: [[[1, 2], [3, 4]]], expected: 7 },
      { input: [[[5]]], expected: 5 },
      { input: [[]], expected: 0 },
      { input: [[[1, 2, 3]]], expected: 6 },
    ],
    hint: "Each cell's best path comes from the cheaper of the cell above and the cell to the left.",
  },
  {
    id: "al-065",
    title: "Partition Equal Subset Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if nums can be split into two subsets with equal sums, and False otherwise.\n\nIf the total is odd the answer is immediately False; otherwise run subset-sum dynamic programming for half the total, using each number at most once. An empty list sums to zero and can be partitioned.",
    starterCode: `def can_partition(nums):
    # Your code here
    pass`,
    solution: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for x in nums:
        for t in range(target, x - 1, -1):
            if dp[t - x]:
                dp[t] = True
    return dp[target]`,
    testCases: [
      { input: [[1, 5, 11, 5]], expected: true },
      { input: [[1, 2, 3, 5]], expected: false },
      { input: [[]], expected: true },
      { input: [[1]], expected: false },
      { input: [[2, 2, 2, 2]], expected: true },
    ],
    hint: "This is the subset-sum problem on half the total; sweep capacities downward so each number is used once.",
  },
  {
    id: "al-066",
    title: "Target Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of ways to assign a plus or minus sign to every element of nums so the resulting expression equals target.\n\nUse a dictionary DP mapping each reachable sum to its number of assignments, expanding both signs for every element. Return 1 when nums is empty and target is 0.",
    starterCode: `def target_sum(nums, target):
    # Your code here
    pass`,
    solution: `def target_sum(nums, target):
    dp = {0: 1}
    for x in nums:
        nxt = {}
        for s, count in dp.items():
            nxt[s + x] = nxt.get(s + x, 0) + count
            nxt[s - x] = nxt.get(s - x, 0) + count
        dp = nxt
    return dp.get(target, 0)`,
    testCases: [
      { input: [[1, 1, 1, 1], 1], expected: 0 },
      { input: [[1, 2, 3], 4], expected: 1 },
      { input: [[0], 0], expected: 2 },
      { input: [[1], 2], expected: 0 },
      { input: [[], 0], expected: 1 },
    ],
    hint: "Each element doubles the number of reachable sums, so merge counts per sum in a dictionary.",
  },
  {
    id: "al-067",
    title: "Maximum Product Subarray",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the largest product of a non-empty contiguous subarray of nums.\n\nTrack both the maximum and minimum product ending at the current position, since multiplying a negative minimum by a negative value can create the new maximum. Return 0 for an empty list.",
    starterCode: `def max_product(nums):
    # Your code here
    pass`,
    solution: `def max_product(nums):
    if not nums:
        return 0
    best = nums[0]
    cur_max = cur_min = nums[0]
    for x in nums[1:]:
        candidates = (x, cur_max * x, cur_min * x)
        cur_max = max(candidates)
        cur_min = min(candidates)
        if cur_max > best:
            best = cur_max
    return best`,
    testCases: [
      { input: [[2, 3, -2, 4]], expected: 6 },
      { input: [[-2, 0, -1]], expected: 0 },
      { input: [[-2, 3, -4]], expected: 24 },
      { input: [[-2]], expected: -2 },
      { input: [[0, 2]], expected: 2 },
      { input: [[]], expected: 0 },
    ],
    hint: "Keep the running minimum too: a very negative product can flip into the best answer.",
  },
  {
    id: "al-068",
    title: "Prime Factorization",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the prime factorization of n as a list of [prime, exponent] pairs sorted by prime in ascending order.\n\nDivide out each candidate factor up to the square root, counting repetitions, and treat any remaining value greater than 1 as a final prime factor. Return an empty list for n = 1.",
    starterCode: `def prime_factorization(n):
    # Your code here
    pass`,
    solution: `def prime_factorization(n):
    factors = []
    d = 2
    while d * d <= n:
        if n % d == 0:
            count = 0
            while n % d == 0:
                n //= d
                count += 1
            factors.append([d, count])
        d += 1
    if n > 1:
        factors.append([n, 1])
    return factors`,
    testCases: [
      { input: [12], expected: [[2, 2], [3, 1]] },
      { input: [1], expected: [] },
      { input: [97], expected: [[97, 1]] },
      { input: [360], expected: [[2, 3], [3, 2], [5, 1]] },
      { input: [100], expected: [[2, 2], [5, 2]] },
    ],
    hint: "After dividing out all smaller factors, what remains above the square root must be prime.",
  },
  {
    id: "al-069",
    title: "Extended Euclidean Algorithm",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the triple [g, x, y] such that g is the greatest common divisor of a and b and a*x + b*y = g.\n\nUse the recursive identity egcd(a, b) = egcd(b, a mod b) with base case egcd(a, 0) = [a, 1, 0], then back-substitute the coefficients. The coefficients returned by this implementation are deterministic.",
    starterCode: `def extended_gcd(a, b):
    # Your code here
    pass`,
    solution: `def extended_gcd(a, b):
    if b == 0:
        return [a, 1, 0]
    g, x, y = extended_gcd(b, a % b)
    return [g, y, x - (a // b) * y]`,
    testCases: [
      { input: [30, 18], expected: [6, -1, 2] },
      { input: [3, 7], expected: [1, -2, 1] },
      { input: [0, 5], expected: [5, 0, 1] },
      { input: [0, 0], expected: [0, 1, 0] },
      { input: [12, 8], expected: [4, 1, -1] },
    ],
    hint: "After the recursive call returns coefficients for (b, a mod b), swap them and subtract the quotient times the second.",
  },
  {
    id: "al-070",
    title: "Integer to Roman",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Convert an integer num between 1 and 3999 to its Roman numeral string.\n\nGreedily subtract the largest table value that fits, where the table also contains the subtractive pairs such as CM (900), CD (400) and IV (4). The output is the standard shortest Roman form.",
    starterCode: `def int_to_roman(num):
    # Your code here
    pass`,
    solution: `def int_to_roman(num):
    table = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]
    out = []
    for value, symbol in table:
        while num >= value:
            out.append(symbol)
            num -= value
    return "".join(out)`,
    testCases: [
      { input: [4], expected: "IV" },
      { input: [9], expected: "IX" },
      { input: [58], expected: "LVIII" },
      { input: [1994], expected: "MCMXCIV" },
      { input: [3999], expected: "MMMCMXCIX" },
    ],
    hint: "Include 4, 9, 40, 90, 400 and 900 directly in the value table so no special cases are needed.",
  },
  {
    id: "al-071",
    title: "Generate Parentheses",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Generate all strings of n pairs of balanced parentheses and return them as a list.\n\nBacktrack by adding an opening parenthesis while fewer than n are open and a closing parenthesis while the number of closers is less than the number of openers. For n = 0 return a list containing only the empty string.",
    starterCode: `def generate_parentheses(n):
    # Your code here
    pass`,
    solution: `def generate_parentheses(n):
    result = []
    def build(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            build(current + "(", open_count + 1, close_count)
        if close_count < open_count:
            build(current + ")", open_count, close_count + 1)
    build("", 0, 0)
    return result`,
    testCases: [
      { input: [0], expected: [""] },
      { input: [1], expected: ["()"] },
      { input: [2], expected: ["(())", "()()"] },
      {
        input: [3],
        expected: ["((()))", "(()())", "(())()", "()(())", "()()()"],
      },
    ],
    hint: "A closing parenthesis is only legal when more openers than closers have been placed.",
  },
  {
    id: "al-072",
    title: "Jump Game",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given nums where nums[i] is the maximum jump length from index i, return True if you can reach the last index starting from index 0, and False otherwise.\n\nGreedily track the farthest reachable index; if the current index ever exceeds it, the end is unreachable. A single-element list is already at the last index.",
    starterCode: `def can_jump(nums):
    # Your code here
    pass`,
    solution: `def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        if i + x > reach:
            reach = i + x
    return True`,
    testCases: [
      { input: [[2, 3, 1, 1, 4]], expected: true },
      { input: [[3, 2, 1, 0, 4]], expected: false },
      { input: [[0]], expected: true },
      { input: [[0, 1]], expected: false },
      { input: [[2, 0, 0]], expected: true },
    ],
    hint: "Extend the reachable frontier with i + nums[i] as long as i never overtakes it.",
  },
  {
    id: "al-073",
    title: "Largest Rectangle in Histogram",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the area of the largest rectangle that fits inside a histogram whose bar heights are given by heights with unit width.\n\nMaintain a monotonic stack of indices with increasing heights; when a shorter bar arrives, pop each taller bar and compute its best rectangle using the new right boundary. A sentinel zero at the end flushes any remaining bars.",
    starterCode: `def largest_rectangle_area(heights):
    # Your code here
    pass`,
    solution: `def largest_rectangle_area(heights):
    stack = []
    best = 0
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
      { input: [[2, 2, 2]], expected: 6 },
    ],
    hint: "Popped bar height times the distance between its new left boundary and the current index gives its best width.",
  },
  {
    id: "al-074",
    title: "Sliding Window Maximum",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the maximum of every contiguous window of size k as a list, in left-to-right order.\n\nUse a deque of indices holding candidates in decreasing value order: pop smaller values from the back when adding a new index, and pop the front once it falls out of the window. Return an empty list when k is non-positive or larger than the list.",
    starterCode: `def max_sliding_window(nums, k):
    # Your code here
    pass`,
    solution: `def max_sliding_window(nums, k):
    if k <= 0 or len(nums) < k:
        return []
    dq = []
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.pop(0)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result`,
    testCases: [
      { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { input: [[1], 1], expected: [1] },
      { input: [[], 3], expected: [] },
      { input: [[9, 8, 7, 6], 2], expected: [9, 8, 7] },
      { input: [[4, 2, 12, 3, 8], 3], expected: [12, 12, 12] },
    ],
    hint: "The deque front is always the index of the current window maximum.",
  },
  {
    id: "al-075",
    title: "Wildcard Matching",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Match the whole string s against the pattern p where ? matches any single character and * matches any sequence of characters including the empty one.\n\nUse dynamic programming over prefixes: a star either consumes nothing from s or one more character from s, while a literal or question mark must consume one character from each. Return True only when the entire string matches.",
    starterCode: `def wildcard_match(s, p):
    # Your code here
    pass`,
    solution: `def wildcard_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 1]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
            elif p[j - 1] == "?" or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]`,
    testCases: [
      { input: ["aa", "a"], expected: false },
      { input: ["aa", "*"], expected: true },
      { input: ["cb", "?a"], expected: false },
      { input: ["adceb", "*a*b"], expected: true },
      { input: ["", "*"], expected: true },
      { input: ["acdcb", "a*c?b"], expected: false },
    ],
    hint: "Initialize the first row carefully: a pattern of stars can match the empty string.",
  },
  {
    id: "al-076",
    title: "Regular Expression Matching",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Match the whole string s against the pattern p where . matches any single character and * means zero or more of the preceding element.\n\nUse dynamic programming: on a star either skip the whole pattern pair or consume one matching character from s, otherwise a literal or dot consumes one character from each. Return True only when the entire string matches.",
    starterCode: `def regex_match(s, p):
    # Your code here
    pass`,
    solution: `def regex_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 2]
                if p[j - 2] == "." or p[j - 2] == s[i - 1]:
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
            elif p[j - 1] == "." or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]`,
    testCases: [
      { input: ["aa", "a"], expected: false },
      { input: ["aa", "a*"], expected: true },
      { input: ["ab", ".*"], expected: true },
      { input: ["aab", "c*a*b"], expected: true },
      { input: ["mississippi", "mis*is*p*."], expected: false },
      { input: ["", "c*"], expected: true },
    ],
    hint: "A star always applies to the single element immediately before it, so skip two pattern characters when taking zero.",
  },
  {
    id: "al-077",
    title: "Matrix Chain Order",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given dims = [p0, p1, ..., pn] describing n matrices where matrix i has shape p[i-1] by p[i], return the minimum number of scalar multiplications needed to multiply the whole chain.\n\nUse interval dynamic programming: for each subchain try every split point k and add the cost dims[i-1] * dims[k] * dims[j] to the two subproblems. Return 0 when fewer than two matrices are given.",
    starterCode: `def matrix_chain_order(dims):
    # Your code here
    pass`,
    solution: `def matrix_chain_order(dims):
    n = len(dims) - 1
    if n <= 0:
        return 0
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            best = None
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                if best is None or cost < best:
                    best = cost
            dp[i][j] = best
    return dp[1][n]`,
    testCases: [
      { input: [[10, 20, 30]], expected: 6000 },
      { input: [[40, 20, 30, 10, 30]], expected: 26000 },
      { input: [[10, 30, 5, 60]], expected: 4500 },
      { input: [[10, 20]], expected: 0 },
      { input: [[5, 10, 3]], expected: 150 },
    ],
    hint: "The final multiplication for a split at k costs dims[i-1] * dims[k] * dims[j] regardless of the two sub-results.",
  },
  {
    id: "al-078",
    title: "Fast Longest Increasing Subsequence",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the length of the longest strictly increasing subsequence of arr using the O(n log n) patience sorting method.\n\nMaintain tails where tails[l] is the smallest possible tail of an increasing subsequence of length l + 1, binary searching the first tail that is not smaller than the current value. Return 0 for an empty list.",
    starterCode: `def lis_length_fast(arr):
    # Your code here
    pass`,
    solution: `def lis_length_fast(arr):
    tails = []
    for x in arr:
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(x)
        else:
            tails[lo] = x
    return len(tails)`,
    testCases: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { input: [[1, 2, 3, 4, 5]], expected: 5 },
      { input: [[5, 4, 3, 2, 1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[7, 7, 7]], expected: 1 },
    ],
    hint: "Replacing the first tail not smaller than x keeps every tail as small as possible.",
  },
  {
    id: "al-079",
    title: "Chinese Remainder Theorem",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given remainders and pairwise coprime moduli, return the smallest non-negative integer x with x mod m[i] equal to remainders[i] for every i, assuming a solution exists.\n\nBuild the answer incrementally: keep a current x and a step equal to the product of the moduli processed so far, then advance x by step until it satisfies the next congruence. Return 0 when the lists are empty.",
    starterCode: `def chinese_remainder(remainders, moduli):
    # Your code here
    pass`,
    solution: `from math import gcd

def chinese_remainder(remainders, moduli):
    x = 0
    step = 1
    for r, mod in zip(remainders, moduli):
        while x % mod != r % mod:
            x += step
        step = step // gcd(step, mod) * mod
    return x`,
    testCases: [
      { input: [[2, 3, 2], [3, 5, 7]], expected: 23 },
      { input: [[0, 0], [2, 3]], expected: 0 },
      { input: [[1], [5]], expected: 1 },
      { input: [[1, 2, 3], [2, 3, 5]], expected: 23 },
      { input: [[4, 5], [5, 7]], expected: 19 },
    ],
    hint: "Adding the product of the already-satisfied moduli preserves all previous congruences.",
  },
  {
    id: "al-080",
    title: "Word Search",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return True if word can be traced through a grid of characters by moving between horizontally or vertically adjacent cells without reusing a cell.\n\nRun DFS from every starting cell, temporarily marking visited cells and restoring them on backtracking. An empty word is trivially found.",
    starterCode: `def word_search(board, word):
    # Your code here
    pass`,
    solution: `def word_search(board, word):
    if not word:
        return True
    rows = len(board)
    cols = len(board[0]) if rows else 0
    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
            return False
        temp = board[r][c]
        board[r][c] = "#"
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                 or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = temp
        return found
    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False`,
    testCases: [
      {
        input: [
          [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
          "ABCCED",
        ],
        expected: true,
      },
      {
        input: [
          [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
          "SEE",
        ],
        expected: true,
      },
      {
        input: [
          [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
          "ABCB",
        ],
        expected: false,
      },
      { input: [[["a"]], "a"], expected: true },
      { input: [[["a"]], "b"], expected: false },
      { input: [[[]], ""], expected: true },
    ],
    hint: "Mark the current cell before recursing so the same cell cannot be counted twice, then unmark it.",
  },
];
