import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-126",
    title: "Palindrome Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the integer x reads the same forwards and backwards, and False otherwise.\n\nNegative numbers are never palindromes because of the minus sign. Reverse the digits arithmetically and compare with the original.",
    starterCode: `def palindrome_number(x):
    # Your code here
    pass`,
    solution: `def palindrome_number(x):
    if x < 0:
        return False
    original = x
    rev = 0
    while x > 0:
        rev = rev * 10 + x % 10
        x //= 10
    return rev == original`,
    testCases: [
      { input: [121], expected: true },
      { input: [-121], expected: false },
      { input: [10], expected: false },
      { input: [0], expected: true },
      { input: [12321], expected: true },
    ],
    hint: "Building the reversed number with rev * 10 + digit avoids converting to a string.",
  },
  {
    id: "al-127",
    title: "Reverse Integer",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Reverse the digits of a signed 32-bit integer and return the result, or 0 if the reversed value would overflow beyond the range from minus 2 to the 31st power through 2 to the 31st power minus 1.\n\nReverse the absolute value digit by digit and reapply the sign. Trailing zeros become leading zeros and disappear.",
    starterCode: `def reverse_integer(x):
    # Your code here
    pass`,
    solution: `def reverse_integer(x):
    sign = -1 if x < 0 else 1
    n = abs(x)
    rev = 0
    while n:
        rev = rev * 10 + n % 10
        n //= 10
    rev *= sign
    if rev < -2 ** 31 or rev > 2 ** 31 - 1:
        return 0
    return rev`,
    testCases: [
      { input: [123], expected: 321 },
      { input: [-123], expected: -321 },
      { input: [120], expected: 21 },
      { input: [0], expected: 0 },
      { input: [1534236469], expected: 0 },
    ],
    hint: "Check the final reversed value against the 32-bit bounds after applying the sign.",
  },
  {
    id: "al-128",
    title: "Add Strings",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Add two non-negative integers given as decimal strings and return their sum as a decimal string, without converting the inputs to integers.\n\nWalk both strings from the right, summing digits plus a carry and emitting the result digit. Any remaining carry becomes a final leading 1.",
    starterCode: `def add_strings(num1, num2):
    # Your code here
    pass`,
    solution: `def add_strings(num1, num2):
    i, j = len(num1) - 1, len(num2) - 1
    carry = 0
    out = []
    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += ord(num1[i]) - 48
            i -= 1
        if j >= 0:
            total += ord(num2[j]) - 48
            j -= 1
        out.append(chr(total % 10 + 48))
        carry = total // 10
    return "".join(reversed(out))`,
    testCases: [
      { input: ["11", "123"], expected: "134" },
      { input: ["0", "0"], expected: "0" },
      { input: ["999", "1"], expected: "1000" },
      { input: ["1", "9"], expected: "10" },
      { input: ["456", "77"], expected: "533" },
    ],
    hint: "Build the result in reverse and flip it at the end; do not forget the final carry.",
  },
  {
    id: "al-129",
    title: "Sum of Digits",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the sum of the decimal digits of a non-negative integer n.\n\nPeel off digits with n % 10 and divide by 10 until the number becomes 0. Return 0 for n = 0.",
    starterCode: `def sum_of_digits(n):
    # Your code here
    pass`,
    solution: `def sum_of_digits(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [123], expected: 6 },
      { input: [9999], expected: 36 },
      { input: [10], expected: 1 },
      { input: [1000000], expected: 1 },
    ],
    hint: "Repeated modulo and integer division visits every digit once.",
  },
  {
    id: "al-130",
    title: "Digital Root",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the digital root of a non-negative integer n: repeatedly sum its digits until a single digit remains.\n\nUse the closed form 1 + (n - 1) mod 9 for n > 0, and return 0 when n is 0. The modulo operation must not be replaced by digit loops if you want the constant-time version.",
    starterCode: `def digital_root(n):
    # Your code here
    pass`,
    solution: `def digital_root(n):
    if n == 0:
        return 0
    return 1 + (n - 1) % 9`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [9], expected: 9 },
      { input: [38], expected: 2 },
      { input: [12345], expected: 6 },
      { input: [9999], expected: 9 },
    ],
    hint: "A positive number is congruent to its digit sum modulo 9.",
  },
  {
    id: "al-131",
    title: "Happy Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if n is a happy number: repeatedly replace it with the sum of the squares of its digits, and check whether it eventually reaches 1.\n\nUnhappy numbers fall into a cycle, so remember every value seen and stop if one repeats. Return False if the cycle is entered.",
    starterCode: `def happy_number(n):
    # Your code here
    pass`,
    solution: `def happy_number(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        total = 0
        while n > 0:
            d = n % 10
            total += d * d
            n //= 10
        n = total
    return n == 1`,
    testCases: [
      { input: [19], expected: true },
      { input: [2], expected: false },
      { input: [1], expected: true },
      { input: [7], expected: true },
      { input: [4], expected: false },
    ],
    hint: "1 is happy by definition; every other happy chain eventually reaches it.",
  },
  {
    id: "al-132",
    title: "Ugly Number",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if n is an ugly number, meaning its only prime factors are 2, 3 and 5, and False otherwise.\n\nRepeatedly divide n by each of 2, 3 and 5 while possible, then check whether exactly 1 remains. Values less than or equal to 0 are not ugly.",
    starterCode: `def ugly_number(n):
    # Your code here
    pass`,
    solution: `def ugly_number(n):
    if n <= 0:
        return False
    for p in (2, 3, 5):
        while n % p == 0:
            n //= p
    return n == 1`,
    testCases: [
      { input: [6], expected: true },
      { input: [8], expected: true },
      { input: [14], expected: false },
      { input: [1], expected: true },
      { input: [0], expected: false },
    ],
    hint: "After removing all factors 2, 3 and 5, an ugly number is exactly 1.",
  },
  {
    id: "al-133",
    title: "Isomorphic Strings",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if characters of s can be replaced to obtain t while preserving order, with a one-to-one character mapping.\n\nMaintain mappings in both directions and fail if a character maps inconsistently either way. Strings of different lengths are never isomorphic.",
    starterCode: `def is_isomorphic(s, t):
    # Your code here
    pass`,
    solution: `def is_isomorphic(s, t):
    if len(s) != len(t):
        return False
    forward = {}
    backward = {}
    for a, b in zip(s, t):
        if a in forward and forward[a] != b:
            return False
        if b in backward and backward[b] != a:
            return False
        forward[a] = b
        backward[b] = a
    return True`,
    testCases: [
      { input: ["egg", "add"], expected: true },
      { input: ["foo", "bar"], expected: false },
      { input: ["paper", "title"], expected: true },
      { input: ["ab", "aa"], expected: false },
      { input: ["", ""], expected: true },
    ],
    hint: "The backward map prevents two different source characters mapping to the same target.",
  },
  {
    id: "al-134",
    title: "Word Pattern",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the pattern string matches the space-separated words in text, with a bijection between pattern characters and words.\n\nSplit the text on whitespace and require the same length as the pattern. Use mappings in both directions, exactly like isomorphic strings.",
    starterCode: `def word_pattern(pattern, text):
    # Your code here
    pass`,
    solution: `def word_pattern(pattern, text):
    words = text.split()
    if len(pattern) != len(words):
        return False
    forward = {}
    backward = {}
    for ch, word in zip(pattern, words):
        if ch in forward and forward[ch] != word:
            return False
        if word in backward and backward[word] != ch:
            return False
        forward[ch] = word
        backward[word] = ch
    return True`,
    testCases: [
      { input: ["abba", "dog cat cat dog"], expected: true },
      { input: ["abba", "dog cat cat fish"], expected: false },
      { input: ["aaaa", "dog cat cat dog"], expected: false },
      { input: ["ab", "dog dog"], expected: false },
      { input: ["", ""], expected: true },
    ],
    hint: "Python split with no arguments collapses runs of spaces and handles the empty string.",
  },
  {
    id: "al-135",
    title: "Count and Say",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the n-th term of the count-and-say sequence, where term 1 is the string 1 and each following term describes the runs of the previous one.\n\nFor example 1 becomes 11, then 21, then 1211. Repeat the run-length description n - 1 times and assume n >= 1.",
    starterCode: `def count_and_say(n):
    # Your code here
    pass`,
    solution: `def count_and_say(n):
    current = "1"
    for _ in range(n - 1):
        parts = []
        i = 0
        while i < len(current):
            j = i
            while j < len(current) and current[j] == current[i]:
                j += 1
            parts.append(str(j - i) + current[i])
            i = j
        current = "".join(parts)
    return current`,
    testCases: [
      { input: [1], expected: "1" },
      { input: [2], expected: "11" },
      { input: [3], expected: "21" },
      { input: [4], expected: "1211" },
      { input: [5], expected: "111221" },
    ],
    hint: "Each term is the run-length encoding of the previous term, written as count then digit.",
  },
  {
    id: "al-136",
    title: "Valid Mountain Array",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if arr is a mountain array: strictly increasing to a peak and then strictly decreasing, with at least three elements.\n\nWalk up while values increase, require that the peak is neither the first nor the last element, then walk down and require reaching the end. Equal neighbours invalidate the mountain.",
    starterCode: `def valid_mountain_array(arr):
    # Your code here
    pass`,
    solution: `def valid_mountain_array(arr):
    n = len(arr)
    if n < 3:
        return False
    i = 0
    while i + 1 < n and arr[i] < arr[i + 1]:
        i += 1
    if i == 0 or i == n - 1:
        return False
    while i + 1 < n and arr[i] > arr[i + 1]:
        i += 1
    return i == n - 1`,
    testCases: [
      { input: [[2, 1]], expected: false },
      { input: [[3, 5, 5]], expected: false },
      { input: [[0, 3, 2, 1]], expected: true },
      { input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: false },
      { input: [[1, 3, 2]], expected: true },
      { input: [[9, 8, 7, 6, 5]], expected: false },
    ],
    hint: "The up-walk must stop before the last element and the down-walk must reach it.",
  },
  {
    id: "al-137",
    title: "Reverse Words in a String",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Reverse the order of words in text and return the result with single spaces between words, with no leading or trailing spaces.\n\nSplit on arbitrary whitespace and rejoin the reversed list with single spaces. An input of only spaces yields the empty string.",
    starterCode: `def reverse_words(text):
    # Your code here
    pass`,
    solution: `def reverse_words(text):
    return " ".join(reversed(text.split()))`,
    testCases: [
      { input: ["the sky is blue"], expected: "blue is sky the" },
      { input: ["  hello world  "], expected: "world hello" },
      { input: ["a good   example"], expected: "example good a" },
      { input: [""], expected: "" },
      { input: ["  "], expected: "" },
    ],
    hint: "Python split without arguments handles all whitespace and removes empty strings.",
  },
  {
    id: "al-138",
    title: "Rotate String Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if goal can be obtained by rotating s some number of positions to the left.\n\nA rotation of s is always a substring of s concatenated with itself, so check membership of goal in s + s after confirming equal lengths. Empty strings rotate to each other.",
    starterCode: `def rotate_string(s, goal):
    # Your code here
    pass`,
    solution: `def rotate_string(s, goal):
    return len(s) == len(goal) and goal in (s + s)`,
    testCases: [
      { input: ["abcde", "cdeab"], expected: true },
      { input: ["abcde", "abced"], expected: false },
      { input: ["", ""], expected: true },
      { input: ["a", "a"], expected: true },
      { input: ["abc", "cab"], expected: true },
    ],
    hint: "s + s contains every rotation of s as a contiguous block.",
  },
  {
    id: "al-139",
    title: "Count Binary Substrings",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count substrings of s that have an equal number of consecutive 0s and consecutive 1s, grouped together as in 0011 or 10.\n\nTrack the length of the current run and the previous run; each position contributes min(previous, current) valid substrings. Assume s contains only 0 and 1 characters.",
    starterCode: `def count_binary_substrings(s):
    # Your code here
    pass`,
    solution: `def count_binary_substrings(s):
    prev = 0
    cur = 1
    total = 0
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            cur += 1
        else:
            total += min(prev, cur)
            prev = cur
            cur = 1
    total += min(prev, cur)
    return total`,
    testCases: [
      { input: ["00110011"], expected: 6 },
      { input: ["10101"], expected: 4 },
      { input: [""], expected: 0 },
      { input: ["1"], expected: 0 },
      { input: ["000111"], expected: 3 },
    ],
    hint: "Only boundaries between a run and the next run can produce valid substrings.",
  },
  {
    id: "al-140",
    title: "Hamming Distance",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of bit positions at which the non-negative integers x and y differ.\n\nXOR the two values so differing bits become 1, then count the set bits with n = n & (n - 1). Equal values give 0.",
    starterCode: `def hamming_distance(x, y):
    # Your code here
    pass`,
    solution: `def hamming_distance(x, y):
    value = x ^ y
    count = 0
    while value:
        value &= value - 1
        count += 1
    return count`,
    testCases: [
      { input: [1, 4], expected: 2 },
      { input: [3, 1], expected: 1 },
      { input: [0, 0], expected: 0 },
      { input: [255, 0], expected: 8 },
      { input: [5, 5], expected: 0 },
    ],
    hint: "Hamming distance is exactly the popcount of the XOR.",
  },
  {
    id: "al-141",
    title: "Swap Odd and Even Bits",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Swap every pair of adjacent bits in the binary representation of a non-negative integer n and return the result.\n\nMask the even-position bits with 0xAAAAAAAA and shift them right, mask the odd-position bits with 0x55555555 and shift them left, then OR the two parts. Bits are numbered from 0 at the least significant position.",
    starterCode: `def swap_odd_even_bits(n):
    # Your code here
    pass`,
    solution: `def swap_odd_even_bits(n):
    return ((n & 0xAAAAAAAA) >> 1) | ((n & 0x55555555) << 1)`,
    testCases: [
      { input: [2], expected: 1 },
      { input: [3], expected: 3 },
      { input: [0], expected: 0 },
      { input: [5], expected: 10 },
      { input: [10], expected: 5 },
    ],
    hint: "The two masks select alternating bits, so shifting each part by one places them in the other slot.",
  },
  {
    id: "al-142",
    title: "Valid Palindrome with One Removal",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if s can become a palindrome after deleting at most one character, and False otherwise.\n\nWalk with two pointers; on the first mismatch try skipping either the left or the right character and test the remainder. An empty or single-character string is already a palindrome.",
    starterCode: `def valid_palindrome_one_removal(s):
    # Your code here
    pass`,
    solution: `def valid_palindrome_one_removal(s):
    def is_pal(left, right):
        while left < right:
            if s[left] != s[right]:
                return False
            left += 1
            right -= 1
        return True
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return is_pal(left + 1, right) or is_pal(left, right - 1)
        left += 1
        right -= 1
    return True`,
    testCases: [
      { input: ["aba"], expected: true },
      { input: ["abca"], expected: true },
      { input: ["abc"], expected: false },
      { input: [""], expected: true },
      { input: ["a"], expected: true },
      { input: ["abccba"], expected: true },
    ],
    hint: "Only the first mismatch matters because at most one deletion is allowed.",
  },
  {
    id: "al-143",
    title: "Custom Sort String",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Rearrange the characters of s so they appear in the order given by order, followed by any remaining characters in alphabetical order.\n\nCount the characters of s, emit the counts in the order string, then emit the leftover characters sorted. Characters of order that do not occur in s are skipped.",
    starterCode: `def custom_sort_string(order, s):
    # Your code here
    pass`,
    solution: `def custom_sort_string(order, s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    out = []
    for ch in order:
        if ch in counts:
            out.append(ch * counts[ch])
            del counts[ch]
    for ch in sorted(counts):
        out.append(ch * counts[ch])
    return "".join(out)`,
    testCases: [
      { input: ["cba", "abcd"], expected: "cbad" },
      { input: ["bcafg", "abcd"], expected: "bcad" },
      { input: ["exv", "xwvee"], expected: "eexvw" },
      { input: ["", "abc"], expected: "abc" },
      { input: ["abc", ""], expected: "" },
    ],
    hint: "Delete characters from the count table as you emit them so leftovers are easy to append.",
  },
  {
    id: "al-144",
    title: "String to Integer (atoi)",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Implement atoi: skip leading spaces, read an optional plus or minus sign, then read digits until a non-digit appears, and return the parsed integer clamped to the signed 32-bit range.\n\nIf no digits are read the result is 0; values beyond the range saturate at the boundary. Ignore any trailing characters.",
    starterCode: `def my_atoi(s):
    # Your code here
    pass`,
    solution: `def my_atoi(s):
    i = 0
    n = len(s)
    while i < n and s[i] == " ":
        i += 1
    sign = 1
    if i < n and s[i] in "+-":
        if s[i] == "-":
            sign = -1
        i += 1
    value = 0
    while i < n and s[i].isdigit():
        value = value * 10 + (ord(s[i]) - 48)
        i += 1
    value *= sign
    if value < -2 ** 31:
        return -2 ** 31
    if value > 2 ** 31 - 1:
        return 2 ** 31 - 1
    return value`,
    testCases: [
      { input: ["42"], expected: 42 },
      { input: ["   -42"], expected: -42 },
      { input: ["4193 with words"], expected: 4193 },
      { input: ["words and 987"], expected: 0 },
      { input: ["-91283472332"], expected: -2147483648 },
      { input: ["+1"], expected: 1 },
    ],
    hint: "The sign is only consumed if it immediately follows the leading whitespace.",
  },
  {
    id: "al-145",
    title: "Repeated Substring Pattern",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if s can be built by repeating a shorter non-empty substring two or more times, and False otherwise.\n\nA string with such a periodic structure appears inside s + s with its first and last characters stripped. The empty string is not a repetition.",
    starterCode: `def repeated_substring_pattern(s):
    # Your code here
    pass`,
    solution: `def repeated_substring_pattern(s):
    return len(s) > 0 and s in (s + s)[1:-1]`,
    testCases: [
      { input: ["abab"], expected: true },
      { input: ["aba"], expected: false },
      { input: ["abcabcabcabc"], expected: true },
      { input: ["a"], expected: false },
      { input: [""], expected: false },
    ],
    hint: "Removing the first and last characters of s + s eliminates the trivial full-length match.",
  },
  {
    id: "al-146",
    title: "Arithmetic Progression",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given first term a, common difference d and a count n, return [nth term, sum of the first n terms].\n\nThe nth term is a + (n - 1) * d and the sum is n * (2 * a + (n - 1) * d) // 2. Assume n >= 1; a and d may be negative or zero.",
    starterCode: `def arithmetic_progression(a, d, n):
    # Your code here
    pass`,
    solution: `def arithmetic_progression(a, d, n):
    nth = a + (n - 1) * d
    total = n * (2 * a + (n - 1) * d) // 2
    return [nth, total]`,
    testCases: [
      { input: [2, 3, 5], expected: [14, 40] },
      { input: [1, 1, 10], expected: [10, 55] },
      { input: [0, 0, 1], expected: [0, 0] },
      { input: [5, -2, 4], expected: [-1, 8] },
      { input: [10, 5, 1], expected: [10, 10] },
    ],
    hint: "The sum pairs the first and last terms, so it is n times their average.",
  },
  {
    id: "al-147",
    title: "Geometric Series Sum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given first term a, integer ratio r and a count n, return [nth term, sum of the first n terms].\n\nThe nth term is a * r ** (n - 1); for r != 1 the sum is a * (r ** n - 1) // (r - 1), and for r == 1 it is a * n. Assume n >= 1 and integer arithmetic.",
    starterCode: `def geometric_series(a, r, n):
    # Your code here
    pass`,
    solution: `def geometric_series(a, r, n):
    nth = a * (r ** (n - 1))
    if r == 1:
        total = a * n
    else:
        total = a * (r ** n - 1) // (r - 1)
    return [nth, total]`,
    testCases: [
      { input: [1, 2, 4], expected: [8, 15] },
      { input: [2, 3, 3], expected: [18, 26] },
      { input: [5, 1, 4], expected: [5, 20] },
      { input: [0, 7, 5], expected: [0, 0] },
      { input: [3, -1, 4], expected: [-3, 0] },
    ],
    hint: "The closed form divides exactly for integer geometric series with r != 1.",
  },
  {
    id: "al-148",
    title: "Counting Bits from 0 to N",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return a list counts where counts[i] is the number of set bits in the binary representation of i, for every i from 0 through n.\n\nUse the recurrence counts[i] = counts[i >> 1] + (i & 1) to compute each value in constant time. Return [0] for n = 0.",
    starterCode: `def count_bits_upto(n):
    # Your code here
    pass`,
    solution: `def count_bits_upto(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp`,
    testCases: [
      { input: [2], expected: [0, 1, 1] },
      { input: [5], expected: [0, 1, 1, 2, 1, 2] },
      { input: [0], expected: [0] },
      {
        input: [10],
        expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2],
      },
    ],
    hint: "Dropping the lowest bit of i gives a smaller number whose popcount is already known.",
  },
  {
    id: "al-149",
    title: "Coin Change Ways Count",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given unlimited coins of the listed denominations, count the number of combinations that sum to amount, where order does not matter.\n\nProcess one coin at a time and sweep amounts upward so each coin can be reused, accumulating dp[x] += dp[x - coin]. An amount of 0 has exactly one combination: the empty one.",
    starterCode: `def coin_change_ways(coins, amount):
    # Your code here
    pass`,
    solution: `def coin_change_ways(coins, amount):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:
        for x in range(c, amount + 1):
            dp[x] += dp[x - c]
    return dp[amount]`,
    testCases: [
      { input: [[1, 2, 5], 5], expected: 4 },
      { input: [[2], 3], expected: 0 },
      { input: [[1], 0], expected: 1 },
      { input: [[1, 2, 3], 4], expected: 4 },
      { input: [[], 0], expected: 1 },
    ],
    hint: "Outer loop over coins (not amounts) prevents counting different orders as distinct.",
  },
  {
    id: "al-150",
    title: "Count Unique Subsets",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given nums that may contain duplicates, return the number of distinct subsets, including the empty subset.\n\nA value appearing c times can contribute 0 through c copies, giving c + 1 independent choices. Multiply those choices across all distinct values.",
    starterCode: `def count_unique_subsets(nums):
    # Your code here
    pass`,
    solution: `def count_unique_subsets(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    result = 1
    for c in counts.values():
        result *= c + 1
    return result`,
    testCases: [
      { input: [[1, 2, 3]], expected: 8 },
      { input: [[1, 1, 2]], expected: 6 },
      { input: [[1, 1, 1]], expected: 4 },
      { input: [[]], expected: 1 },
      { input: [[1, 2, 2]], expected: 6 },
    ],
    hint: "Identical values are interchangeable, so only their multiplicity matters.",
  },
  {
    id: "al-151",
    title: "Count Distinct Permutations",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given nums that may contain duplicates, return the number of distinct permutations of all elements.\n\nThe answer is the multinomial coefficient n! divided by the factorial of every value's frequency. An empty list has exactly one permutation.",
    starterCode: `def count_distinct_permutations(nums):
    # Your code here
    pass`,
    solution: `from math import factorial

def count_distinct_permutations(nums):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    result = factorial(len(nums))
    for c in counts.values():
        result //= factorial(c)
    return result`,
    testCases: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[1, 1, 2]], expected: 3 },
      { input: [[1, 1, 1]], expected: 1 },
      { input: [[]], expected: 1 },
      { input: [[1, 2, 2, 3]], expected: 12 },
    ],
    hint: "Dividing by the repeated frequencies removes permutations that only swap equal values.",
  },
  {
    id: "al-152",
    title: "Partition Labels",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Partition the string s into as many parts as possible so that each letter appears in at most one part, and return the list of part lengths.\n\nRecord the last index of every character, then extend the current part's end until the scan reaches it before cutting. The parts are returned in order.",
    starterCode: `def partition_labels(s):
    # Your code here
    pass`,
    solution: `def partition_labels(s):
    last = {}
    for i, ch in enumerate(s):
        last[ch] = i
    result = []
    start = 0
    end = 0
    for i, ch in enumerate(s):
        if last[ch] > end:
            end = last[ch]
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result`,
    testCases: [
      { input: ["ababcbacadefegdehijhklij"], expected: [9, 7, 8] },
      { input: ["eccbbbbdec"], expected: [10] },
      { input: ["a"], expected: [1] },
      { input: [""], expected: [] },
      { input: ["abac"], expected: [3, 1] },
    ],
    hint: "A part can only end at an index that is the last occurrence of every letter seen so far.",
  },
  {
    id: "al-153",
    title: "Interval Intersection",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given two lists of closed intervals, each sorted and internally non-overlapping, return every intersection as a list of [start, end] pairs.\n\nAdvance two pointers: the intersection is [max of starts, min of ends] when that range is non-empty, then move the pointer whose interval ends first. An overlap that is a single point is included.",
    starterCode: `def interval_intersection(first, second):
    # Your code here
    pass`,
    solution: `def interval_intersection(first, second):
    i = 0
    j = 0
    result = []
    while i < len(first) and j < len(second):
        start = max(first[i][0], second[j][0])
        end = min(first[i][1], second[j][1])
        if start <= end:
            result.append([start, end])
        if first[i][1] < second[j][1]:
            i += 1
        else:
            j += 1
    return result`,
    testCases: [
      {
        input: [
          [[0, 2], [5, 10], [13, 23], [24, 25]],
          [[1, 5], [8, 12], [15, 24], [25, 26]],
        ],
        expected: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]],
      },
      { input: [[], [[1, 2]]], expected: [] },
      { input: [[[1, 2]], []], expected: [] },
      { input: [[[1, 5]], [[2, 3]]], expected: [[2, 3]] },
      { input: [[[1, 2]], [[2, 3]]], expected: [[2, 2]] },
    ],
    hint: "After recording an intersection, discarding the interval that ends earlier is always safe.",
  },
  {
    id: "al-154",
    title: "Car Pool Feasibility",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given trips as [passengers, start, end] and a vehicle capacity, return True if all passengers can be picked up and dropped off without ever exceeding the capacity.\n\nBuild a pickup event and a drop-off event for each trip, sort by location with drop-offs before pickups at the same point, and track the running passenger count. An empty trip list is feasible.",
    starterCode: `def car_pool_feasibility(trips, capacity):
    # Your code here
    pass`,
    solution: `def car_pool_feasibility(trips, capacity):
    events = []
    for num, start, end in trips:
        events.append((start, num))
        events.append((end, -num))
    events.sort()
    current = 0
    for _, delta in events:
        current += delta
        if current > capacity:
            return False
    return True`,
    testCases: [
      { input: [[[2, 1, 5], [3, 3, 7]], 4], expected: false },
      { input: [[[2, 1, 5], [3, 3, 7]], 5], expected: true },
      { input: [[[2, 1, 5], [3, 5, 7]], 3], expected: true },
      { input: [[], 4], expected: true },
      { input: [[[2, 0, 2]], 1], expected: false },
    ],
    hint: "Negative deltas sort before positive ones at the same location, so drop-offs free space first.",
  },
  {
    id: "al-155",
    title: "Zigzag Conversion",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Write the string s in a zigzag pattern across num_rows rows and read it back row by row.\n\nTrack the current row and a direction that flips at the top and bottom rows. If num_rows is 1 or not smaller than the string length, the original string is returned.",
    starterCode: `def zigzag_conversion(s, num_rows):
    # Your code here
    pass`,
    solution: `def zigzag_conversion(s, num_rows):
    if num_rows == 1 or num_rows >= len(s):
        return s
    rows = [""] * num_rows
    row = 0
    step = 1
    for ch in s:
        rows[row] += ch
        if row == 0:
            step = 1
        elif row == num_rows - 1:
            step = -1
        row += step
    return "".join(rows)`,
    testCases: [
      { input: ["PAYPALISHIRING", 3], expected: "PAHNAPLSIIGYIR" },
      { input: ["PAYPALISHIRING", 4], expected: "PINALSIGYAHRPI" },
      { input: ["A", 1], expected: "A" },
      { input: ["", 3], expected: "" },
      { input: ["AB", 1], expected: "AB" },
    ],
    hint: "The direction is updated before moving to the next row, so it flips exactly at the edges.",
  },
  {
    id: "al-156",
    title: "Josephus Problem",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n people arranged in a circle and a step k, return the 1-based position of the survivor when every k-th person is eliminated repeatedly.\n\nThe recurrence P(1) = 0 and P(n) = (P(n-1) + k) mod n gives a 0-based survivor, so add 1 at the end. Assume n >= 1 and k >= 1.",
    starterCode: `def josephus(n, k):
    # Your code here
    pass`,
    solution: `def josephus(n, k):
    position = 0
    for size in range(2, n + 1):
        position = (position + k) % size
    return position + 1`,
    testCases: [
      { input: [5, 2], expected: 3 },
      { input: [7, 3], expected: 4 },
      { input: [1, 1], expected: 1 },
      { input: [6, 5], expected: 1 },
      { input: [41, 3], expected: 31 },
    ],
    hint: "Solving for n people reuses the answer for n - 1 people shifted by k positions.",
  },
  {
    id: "al-157",
    title: "Minimum Perfect Squares",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the minimum number of perfect squares that sum to n, where squares may repeat.\n\nUse DP where dp[i] tries every square j * j <= i and keeps 1 + dp[i - j * j]. By Lagrange's theorem the answer is never larger than 4.",
    starterCode: `def min_perfect_squares(n):
    # Your code here
    pass`,
    solution: `def min_perfect_squares(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        best = i
        j = 1
        while j * j <= i:
            if dp[i - j * j] + 1 < best:
                best = dp[i - j * j] + 1
            j += 1
        dp[i] = best
    return dp[n]`,
    testCases: [
      { input: [12], expected: 3 },
      { input: [13], expected: 2 },
      { input: [1], expected: 1 },
      { input: [0], expected: 0 },
      { input: [100], expected: 1 },
      { input: [27], expected: 3 },
    ],
    hint: "The worst case uses only 1s, so initialise dp[i] with i.",
  },
  {
    id: "al-158",
    title: "Integer Break",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given an integer n >= 2, break it into at least two positive integers and return the maximum product of those parts.\n\nLet dp[i] be the best product for i; for each split j, take the larger of j * (i - j) and j * dp[i - j]. The answer for n is dp[n].",
    starterCode: `def integer_break(n):
    # Your code here
    pass`,
    solution: `def integer_break(n):
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        best = 0
        for j in range(1, i):
            candidate = max(j * (i - j), j * dp[i - j])
            if candidate > best:
                best = candidate
        dp[i] = best
    return dp[n]`,
    testCases: [
      { input: [2], expected: 1 },
      { input: [10], expected: 36 },
      { input: [3], expected: 2 },
      { input: [4], expected: 4 },
      { input: [8], expected: 18 },
    ],
    hint: "dp[i - j] already accounts for breaking the remainder further, while j * (i - j) stops after one split.",
  },
  {
    id: "al-159",
    title: "Gray Code Sequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the standard reflected Gray code sequence of length 2 to the n starting from 0.\n\nThe i-th value is i XOR (i >> 1), which guarantees that consecutive values differ in exactly one bit. Return [0] for n = 0.",
    starterCode: `def gray_code(n):
    # Your code here
    pass`,
    solution: `def gray_code(n):
    return [i ^ (i >> 1) for i in range(1 << n)]`,
    testCases: [
      { input: [1], expected: [0, 1] },
      { input: [2], expected: [0, 1, 3, 2] },
      { input: [3], expected: [0, 1, 3, 2, 6, 7, 5, 4] },
      { input: [0], expected: [0] },
    ],
    hint: "XOR with the value shifted right one bit converts binary counting into Gray code.",
  },
  {
    id: "al-160",
    title: "Nim Game",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a pile of n stones and the rule that each player removes 1 to 3 stones, return True if the first player has a winning strategy.\n\nMultiples of 4 are losing positions because every move leaves a non-multiple that the opponent can restore. Any other value is a win; n = 0 is a loss.",
    starterCode: `def nim_game(n):
    # Your code here
    pass`,
    solution: `def nim_game(n):
    return n % 4 != 0`,
    testCases: [
      { input: [4], expected: false },
      { input: [1], expected: true },
      { input: [2], expected: true },
      { input: [5], expected: true },
      { input: [0], expected: false },
    ],
    hint: "Whatever the opponent takes, you can take 4 minus that amount.",
  },
  {
    id: "al-161",
    title: "Divisor Game",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n, two players alternate choosing a divisor x of n with 0 < x < n and subtract it from n; the player who cannot move loses. Return True if the first player wins.\n\nThe first player wins exactly when n is even and greater than 1, because choosing 1 forces an odd number onto the opponent. For n = 1 there is no move and the first player loses.",
    starterCode: `def divisor_game(n):
    # Your code here
    pass`,
    solution: `def divisor_game(n):
    return n > 1 and n % 2 == 0`,
    testCases: [
      { input: [2], expected: true },
      { input: [3], expected: false },
      { input: [4], expected: true },
      { input: [1], expected: false },
      { input: [9], expected: false },
      { input: [10], expected: true },
    ],
    hint: "Every odd n can only be reduced to an even number by the only odd divisor, 1.",
  },
  {
    id: "al-162",
    title: "Longest Repeating Substring",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the length of the longest substring of s that occurs at least twice; the two occurrences may overlap.\n\nUse dynamic programming where dp[i][j] extends dp[i-1][j-1] when s[i-1] equals s[j-1] and the two positions are different. Return 0 when no character repeats.",
    starterCode: `def longest_repeating_substring(s):
    # Your code here
    pass`,
    solution: `def longest_repeating_substring(s):
    n = len(s)
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    best = 0
    for i in range(1, n + 1):
        for j in range(i + 1, n + 1):
            if s[i - 1] == s[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                if dp[i][j] > best:
                    best = dp[i][j]
    return best`,
    testCases: [
      { input: ["abcd"], expected: 0 },
      { input: ["abbaba"], expected: 2 },
      { input: ["aabcaabdaab"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["aaaaa"], expected: 4 },
    ],
    hint: "Restricting the inner loop to j > i guarantees the two occurrences start at different positions.",
  },
  {
    id: "al-163",
    title: "Minimum Window Substring",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the shortest substring of s that contains every character of t with the required multiplicities, or the empty string if none exists.\n\nGrow a right pointer while counting characters and counting how many requirements are satisfied, then shrink from the left while the window stays valid. Track the smallest valid window seen.",
    starterCode: `def min_window_substring(s, t):
    # Your code here
    pass`,
    solution: `def min_window_substring(s, t):
    if not s or not t:
        return ""
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    required = len(need)
    formed = 0
    counts = {}
    left = 0
    best = None
    for right, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        if ch in need and counts[ch] == need[ch]:
            formed += 1
        while formed == required:
            if best is None or right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            out = s[left]
            counts[out] -= 1
            if out in need and counts[out] < need[out]:
                formed -= 1
            left += 1
    if best is None:
        return ""
    return s[best[1]:best[2] + 1]`,
    testCases: [
      { input: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { input: ["a", "a"], expected: "a" },
      { input: ["a", "aa"], expected: "" },
      { input: ["", ""], expected: "" },
      { input: ["abc", ""], expected: "" },
    ],
    hint: "The formed counter tracks how many distinct requirements are exactly satisfied.",
  },
  {
    id: "al-164",
    title: "Palindrome Pairs Count",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a list of words, count ordered pairs (i, j) with i != j such that words[i] + words[j] is a palindrome.\n\nFor small inputs, test every ordered pair and check whether the concatenation reads the same forwards and backwards. A single-element list contains no pairs.",
    starterCode: `def count_palindrome_pairs(words):
    # Your code here
    pass`,
    solution: `def count_palindrome_pairs(words):
    def is_pal(w):
        return w == w[::-1]
    total = 0
    for i in range(len(words)):
        for j in range(len(words)):
            if i != j and is_pal(words[i] + words[j]):
                total += 1
    return total`,
    testCases: [
      { input: [["abcd", "dcba", "lls", "s", "sssll"]], expected: 4 },
      { input: [["bat", "tab", "cat"]], expected: 2 },
      { input: [["a", ""]], expected: 2 },
      { input: [["abc", "cba", "bca"]], expected: 2 },
      { input: [[""]], expected: 0 },
    ],
    hint: "The pair is ordered and the two indices must differ, even when both words are empty.",
  },
  {
    id: "al-165",
    title: "Multiply Strings",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Multiply two non-negative integers given as decimal strings and return the product as a decimal string, without converting the inputs to integers.\n\nThe classic grade-school algorithm stores partial products in a digit array of length m + n: digit i + j + 1 receives the ones and i + j receives the carry. Strip leading zeros and return 0 when either input is 0.",
    starterCode: `def multiply_strings(num1, num2):
    # Your code here
    pass`,
    solution: `def multiply_strings(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"
    m, n = len(num1), len(num2)
    digits = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        a = ord(num1[i]) - 48
        for j in range(n - 1, -1, -1):
            b = ord(num2[j]) - 48
            low = i + j + 1
            high = i + j
            total = a * b + digits[low]
            digits[low] = total % 10
            digits[high] += total // 10
    start = 0
    while start < len(digits) - 1 and digits[start] == 0:
        start += 1
    return "".join(chr(d + 48) for d in digits[start:])`,
    testCases: [
      { input: ["2", "3"], expected: "6" },
      { input: ["123", "456"], expected: "56088" },
      { input: ["0", "0"], expected: "0" },
      { input: ["999", "999"], expected: "998001" },
      { input: ["12", "0"], expected: "0" },
    ],
    hint: "The digit at position i + j + 1 is the ones place of a partial product, and i + j carries.",
  },
  {
    id: "al-166",
    title: "Fraction to Recurring Decimal",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given numerator and denominator, return the fraction as a decimal string, wrapping any repeating part in parentheses, such as 0.(3) for one third.\n\nHandle the sign, emit the integer part, then simulate long division while remembering where each remainder was first seen; a repeated remainder marks the start of the cycle. Return 0 immediately when the numerator is 0.",
    starterCode: `def fraction_to_decimal(numerator, denominator):
    # Your code here
    pass`,
    solution: `def fraction_to_decimal(numerator, denominator):
    if numerator == 0:
        return "0"
    sign = "-" if (numerator < 0) != (denominator < 0) else ""
    numerator, denominator = abs(numerator), abs(denominator)
    integer = numerator // denominator
    remainder = numerator % denominator
    if remainder == 0:
        return sign + str(integer)
    digits = []
    seen = {}
    while remainder != 0 and remainder not in seen:
        seen[remainder] = len(digits)
        remainder *= 10
        digits.append(str(remainder // denominator))
        remainder %= denominator
    if remainder == 0:
        return sign + str(integer) + "." + "".join(digits)
    index = seen[remainder]
    return sign + str(integer) + "." + "".join(digits[:index]) + "(" + "".join(digits[index:]) + ")"`,
    testCases: [
      { input: [1, 2], expected: "0.5" },
      { input: [2, 1], expected: "2" },
      { input: [4, 333], expected: "0.(012)" },
      { input: [1, 3], expected: "0.(3)" },
      { input: [-50, 8], expected: "-6.25" },
      { input: [1, 6], expected: "0.1(6)" },
    ],
    hint: "A remainder that repeats means the digits from its first appearance repeat forever.",
  },
  {
    id: "al-167",
    title: "Kth Permutation",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the k-th permutation (1-indexed) of the numbers 1 through n in lexicographic order, as a string.\n\nThe first position is chosen by dividing k - 1 by (n - 1) factorial, then the process repeats on the remaining numbers with the remainder. Assume 1 <= k <= n factorial.",
    starterCode: `def kth_permutation(n, k):
    # Your code here
    pass`,
    solution: `from math import factorial

def kth_permutation(n, k):
    items = list(range(1, n + 1))
    result = []
    k -= 1
    while items:
        size = len(items)
        block = factorial(size - 1)
        index = k // block
        result.append(str(items.pop(index)))
        k %= block
    return "".join(result)`,
    testCases: [
      { input: [3, 3], expected: "213" },
      { input: [4, 9], expected: "2314" },
      { input: [3, 1], expected: "123" },
      { input: [1, 1], expected: "1" },
      { input: [3, 6], expected: "321" },
    ],
    hint: "Each remaining position blocks together (size - 1) factorial permutations.",
  },
  {
    id: "al-168",
    title: "Reorganize String",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Rearrange the characters of s so that no two adjacent characters are the same, and return the arrangement, or the empty string if it is impossible.\n\nUse a max-heap of character counts; place the most frequent character, hold it back for one step so it cannot repeat immediately, and return the result only if every character was placed. The arrangement is deterministic for a given input.",
    starterCode: `def reorganize_string(s):
    # Your code here
    pass`,
    solution: `import heapq

def reorganize_string(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    heap = [(-c, ch) for ch, c in counts.items()]
    heapq.heapify(heap)
    result = []
    prev_count = 0
    prev_ch = ""
    while heap:
        count, ch = heapq.heappop(heap)
        result.append(ch)
        if prev_count < 0:
            heapq.heappush(heap, (prev_count, prev_ch))
        prev_count, prev_ch = count + 1, ch
    if len(result) != len(s):
        return ""
    return "".join(result)`,
    testCases: [
      { input: ["aab"], expected: "aba" },
      { input: ["aaab"], expected: "" },
      { input: ["vvvlo"], expected: "vlvov" },
      { input: ["a"], expected: "a" },
      { input: [""], expected: "" },
      { input: ["aaabbb"], expected: "ababab" },
    ],
    hint: "A character is only re-pushed after a different character has been placed.",
  },
  {
    id: "al-169",
    title: "Remove K Digits",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Remove exactly k digits from the decimal string num to produce the smallest possible number, and return it without leading zeros.\n\nMaintain a monotonic increasing stack: pop larger digits while removals remain and the new digit is smaller. After the scan, drop digits from the end if removals remain, strip leading zeros, and return 0 for an all-zero result.",
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
    start = 0
    while start < len(stack) - 1 and stack[start] == "0":
        start += 1
    return "".join(stack[start:]) if stack else "0"`,
    testCases: [
      { input: ["1432219", 3], expected: "1219" },
      { input: ["10200", 1], expected: "200" },
      { input: ["10", 2], expected: "0" },
      { input: ["9", 1], expected: "0" },
      { input: ["112", 1], expected: "11" },
    ],
    hint: "A bigger digit earlier is always worse, so pop it whenever a smaller digit can replace it.",
  },
  {
    id: "al-170",
    title: "Monotone Increasing Digits",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the largest integer less than or equal to n whose decimal digits are non-decreasing from left to right.\n\nFind the first position where a digit drops, decrement the digit before the drop, and set every following digit to 9 while back-propagating any new violation. If the digits are already non-decreasing, return n unchanged.",
    starterCode: `def monotone_increasing_digits(n):
    # Your code here
    pass`,
    solution: `def monotone_increasing_digits(n):
    digits = list(str(n))
    i = 1
    while i < len(digits) and digits[i - 1] <= digits[i]:
        i += 1
    if i == len(digits):
        return n
    while i > 0 and digits[i - 1] > digits[i]:
        digits[i - 1] = chr(ord(digits[i - 1]) - 1)
        i -= 1
    for j in range(i + 1, len(digits)):
        digits[j] = "9"
    return int("".join(digits))`,
    testCases: [
      { input: [10], expected: 9 },
      { input: [1234], expected: 1234 },
      { input: [332], expected: 299 },
      { input: [100], expected: 99 },
      { input: [120], expected: 119 },
      { input: [0], expected: 0 },
    ],
    hint: "After decrementing, a new violation may appear further left, so keep backtracking.",
  },
];
