import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-261",
    title: "Evaluate Reverse Polish Notation",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Evaluate an arithmetic expression given in reverse Polish notation, where tokens are integers or the operators +, -, * and /.\n\nPush numbers onto a stack and, for each operator, pop the two most recent values, apply the operation and push the result. Division truncates toward zero; the input is always a valid expression.",
    starterCode: `def eval_rpn(tokens):
    # Your code here
    pass`,
    solution: `def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                quotient = abs(a) // abs(b)
                if (a < 0) != (b < 0):
                    quotient = -quotient
                stack.append(quotient)
        else:
            stack.append(int(token))
    return stack[-1]`,
    testCases: [
      { input: [["2", "1", "+", "3", "*"]], expected: 9 },
      { input: [["4", "13", "5", "/", "+"]], expected: 6 },
      { input: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]], expected: 22 },
      { input: [["3"]], expected: 3 },
      { input: [["7", "-2", "/"]], expected: -3 },
    ],
    hint: "For division, compute with absolute values and then reapply the sign to truncate toward zero.",
  },
  {
    id: "al-262",
    title: "IPv4 Address to Integer",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert a dotted IPv4 address string to its 32-bit unsigned integer value.\n\nTreat the four octets as base-256 digits: multiply the running value by 256 and add each octet in order. Assume the address is well formed.",
    starterCode: `def ip_to_int(ip):
    # Your code here
    pass`,
    solution: `def ip_to_int(ip):
    parts = ip.split(".")
    result = 0
    for part in parts:
        result = result * 256 + int(part)
    return result`,
    testCases: [
      { input: ["0.0.0.0"], expected: 0 },
      { input: ["255.255.255.255"], expected: 4294967295 },
      { input: ["192.168.1.1"], expected: 3232235777 },
      { input: ["1.2.3.4"], expected: 16909060 },
      { input: ["10.0.0.1"], expected: 167772161 },
    ],
    hint: "192.168.1.1 is 192 * 256 cubed plus 168 * 256 squared and so on.",
  },
  {
    id: "al-263",
    title: "Integer to IPv4 Address",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert a 32-bit unsigned integer to its dotted IPv4 address string.\n\nExtract four octets from the least significant end using division by 256, then join them from most to least significant. Assume the value is between 0 and 2 to the 32 minus 1.",
    starterCode: `def int_to_ip(value):
    # Your code here
    pass`,
    solution: `def int_to_ip(value):
    parts = []
    for _ in range(4):
        parts.append(str(value % 256))
        value //= 256
    return ".".join(reversed(parts))`,
    testCases: [
      { input: [0], expected: "0.0.0.0" },
      { input: [4294967295], expected: "255.255.255.255" },
      { input: [3232235777], expected: "192.168.1.1" },
      { input: [1], expected: "0.0.0.1" },
      { input: [16909060], expected: "1.2.3.4" },
    ],
    hint: "Taking value modulo 256 peels off the least significant octet.",
  },
  {
    id: "al-264",
    title: "Validate IPv4 Address",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the string is a valid IPv4 address, and False otherwise.\n\nAn address has exactly four parts separated by dots, each part is one to three digits with no leading zeros unless it is exactly 0, and each numeric value is at most 255. The empty string is invalid.",
    starterCode: `def valid_ipv4(s):
    # Your code here
    pass`,
    solution: `def valid_ipv4(s):
    parts = s.split(".")
    if len(parts) != 4:
        return False
    for part in parts:
        if not part or not part.isdigit():
            return False
        if len(part) > 1 and part[0] == "0":
            return False
        if int(part) > 255:
            return False
    return True`,
    testCases: [
      { input: ["192.168.1.1"], expected: true },
      { input: ["255.255.255.255"], expected: true },
      { input: ["256.1.1.1"], expected: false },
      { input: ["192.168.01.1"], expected: false },
      { input: ["1.1.1"], expected: false },
      { input: ["1.1.1.1.1"], expected: false },
    ],
    hint: "Leading zeros are the classic trap, so check for them before the numeric range.",
  },
  {
    id: "al-265",
    title: "Validate MAC Address",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the string is a valid MAC address in either colon-separated or dash-separated form, and False otherwise.\n\nA MAC address has exactly six groups of exactly two hexadecimal digits. Hex digits are 0 through 9 and a through f in either case.",
    starterCode: `def valid_mac(s):
    # Your code here
    pass`,
    solution: `def valid_mac(s):
    if ":" in s:
        parts = s.split(":")
    elif "-" in s:
        parts = s.split("-")
    else:
        return False
    if len(parts) != 6:
        return False
    hex_digits = set("0123456789abcdefABCDEF")
    for part in parts:
        if len(part) != 2:
            return False
        if part[0] not in hex_digits or part[1] not in hex_digits:
            return False
    return True`,
    testCases: [
      { input: ["00:1A:2B:3C:4D:5E"], expected: true },
      { input: ["00-1a-2b-3c-4d-5e"], expected: true },
      { input: ["00:1A:2B:3C:4D"], expected: false },
      { input: ["00:1G:2B:3C:4D:5E"], expected: false },
      { input: ["001A2B3C4D5E"], expected: false },
      { input: ["00:1A:2B:3C:4D:5E:6F"], expected: false },
    ],
    hint: "Reject strings that use neither separator or that mix the two.",
  },
  {
    id: "al-266",
    title: "Validate Roman Numeral",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the string is a valid Roman numeral in the standard range 1 to 3999, and False otherwise.\n\nParse the numeral using the subtractive rule, then convert the parsed value back to Roman form and compare with the input; canonical round-tripping rejects repetitions like IIII and invalid pairs like IC. The empty string is invalid.",
    starterCode: `def valid_roman(s):
    # Your code here
    pass`,
    solution: `def valid_roman(s):
    if not s:
        return False
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        if ch not in values:
            return False
        if i + 1 < len(s) and values[s[i + 1]] > values[ch]:
            total -= values[ch]
        else:
            total += values[ch]
    if total <= 0 or total > 3999:
        return False
    table = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]
    remaining = total
    out = []
    for value, symbol in table:
        while remaining >= value:
            out.append(symbol)
            remaining -= value
    return "".join(out) == s`,
    testCases: [
      { input: ["III"], expected: true },
      { input: ["IV"], expected: true },
      { input: ["IIII"], expected: false },
      { input: ["MCMXCIV"], expected: true },
      { input: ["IC"], expected: false },
      { input: [""], expected: false },
    ],
    hint: "Round-tripping through the canonical Roman form catches every invalid numeral.",
  },
  {
    id: "al-267",
    title: "Number to Spreadsheet Column",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert a positive column number to its spreadsheet column title, where 1 is A, 26 is Z, 27 is AA and so on.\n\nRepeatedly take (n - 1) modulo 26 to get the letter offset and divide n - 1 by 26, then reverse the collected letters. Assume n >= 1.",
    starterCode: `def number_to_column(n):
    # Your code here
    pass`,
    solution: `def number_to_column(n):
    result = []
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        result.append(chr(65 + remainder))
    return "".join(reversed(result))`,
    testCases: [
      { input: [1], expected: "A" },
      { input: [26], expected: "Z" },
      { input: [27], expected: "AA" },
      { input: [701], expected: "ZY" },
      { input: [52], expected: "AZ" },
      { input: [703], expected: "AAA" },
    ],
    hint: "Subtracting 1 converts the 1-based title system into ordinary base-26 digits.",
  },
  {
    id: "al-268",
    title: "Strobogrammatic Number Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the digit string looks the same when rotated 180 degrees, and False otherwise.\n\nOnly 0, 1, 6, 8 and 9 remain valid digits after rotation, with 6 and 9 swapping and the others fixed. Compare characters from the two ends; the empty string is considered valid.",
    starterCode: `def is_strobogrammatic(s):
    # Your code here
    pass`,
    solution: `def is_strobogrammatic(s):
    pairs = {"0": "0", "1": "1", "6": "9", "8": "8", "9": "6"}
    left, right = 0, len(s) - 1
    while left <= right:
        if s[left] not in pairs or s[right] not in pairs:
            return False
        if pairs[s[left]] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
    testCases: [
      { input: ["69"], expected: true },
      { input: ["88"], expected: true },
      { input: ["962"], expected: false },
      { input: ["609"], expected: true },
      { input: [""], expected: true },
      { input: ["2"], expected: false },
    ],
    hint: "The pair check simultaneously validates the middle character when the length is odd.",
  },
  {
    id: "al-269",
    title: "Confusing Number Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if rotating the number 180 degrees produces a valid but different number, and False otherwise.\n\nDigits 0, 1 and 8 stay the same, 6 and 9 swap, and any other digit makes the rotation invalid. A number that rotates to itself, such as 11 or 0, is not confusing.",
    starterCode: `def is_confusing_number(n):
    # Your code here
    pass`,
    solution: `def is_confusing_number(n):
    mapping = {"0": "0", "1": "1", "6": "9", "8": "8", "9": "6"}
    rotated = []
    for ch in reversed(str(n)):
        if ch not in mapping:
            return False
        rotated.append(mapping[ch])
    return int("".join(rotated)) != n`,
    testCases: [
      { input: [6], expected: true },
      { input: [89], expected: true },
      { input: [11], expected: false },
      { input: [25], expected: false },
      { input: [0], expected: false },
      { input: [8000], expected: true },
    ],
    hint: "Reversing the digits before mapping mirrors the 180-degree rotation.",
  },
  {
    id: "al-270",
    title: "Self-Dividing Numbers",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the sorted list of numbers in the inclusive range from left to right that are divisible by each of their non-zero digits.\n\nSingle-digit numbers are always self-dividing, and the digit 0 is ignored. Test each number in the range directly.",
    starterCode: `def self_dividing_numbers(left, right):
    # Your code here
    pass`,
    solution: `def self_dividing_numbers(left, right):
    result = []
    for x in range(left, right + 1):
        ok = True
        for ch in str(x):
            digit = int(ch)
            if digit != 0 and x % digit != 0:
                ok = False
                break
        if ok:
            result.append(x)
    return result`,
    testCases: [
      { input: [1, 22], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 22] },
      { input: [47, 85], expected: [48, 50, 55, 60, 66, 70, 77, 80] },
      { input: [10, 12], expected: [10, 11, 12] },
      { input: [20, 20], expected: [20] },
      { input: [21, 21], expected: [] },
    ],
    hint: "Zero digits are skipped rather than dividing, which is why 10 counts as self-dividing.",
  },
  {
    id: "al-271",
    title: "Count Happy Numbers Below N",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count how many happy numbers strictly less than n exist, where a happy number reaches 1 by repeatedly replacing it with the sum of the squares of its digits.\n\nRun the digit-square process with a seen set for every value from 1 to n - 1. Return 0 for n <= 1.",
    starterCode: `def count_happy_below(n):
    # Your code here
    pass`,
    solution: `def count_happy_below(n):
    count = 0
    for x in range(1, n):
        seen = set()
        current = x
        while current != 1 and current not in seen:
            seen.add(current)
            total = 0
            while current > 0:
                d = current % 10
                total += d * d
                current //= 10
            current = total
        if current == 1:
            count += 1
    return count`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 1 },
      { input: [10], expected: 2 },
      { input: [20], expected: 5 },
      { input: [100], expected: 19 },
    ],
    hint: "1 is happy, and unhappy numbers fall into a cycle that the seen set detects.",
  },
  {
    id: "al-272",
    title: "Count Ugly Numbers Below N",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count the ugly numbers strictly less than n, where an ugly number has no prime factors other than 2, 3 and 5 and 1 counts as ugly.\n\nFor every candidate, divide out all factors of 2, 3 and 5 and check whether 1 remains. Return 0 for n <= 1.",
    starterCode: `def count_ugly_below(n):
    # Your code here
    pass`,
    solution: `def count_ugly_below(n):
    count = 0
    for x in range(1, n):
        current = x
        for p in (2, 3, 5):
            while current % p == 0:
                current //= p
        if current == 1:
            count += 1
    return count`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [10], expected: 8 },
      { input: [12], expected: 9 },
      { input: [30], expected: 17 },
      { input: [0], expected: 0 },
    ],
    hint: "Only 7 is missing from 1 through 9, since 7 has a prime factor outside the allowed set.",
  },
  {
    id: "al-273",
    title: "Big Integer Subtraction",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Subtract one non-negative integer string from another and return the difference as a string, without converting the inputs to integers.\n\nWalk both strings from the right with a borrow, then strip leading zeros. Assume the first number is greater than or equal to the second.",
    starterCode: `def big_subtract(a, b):
    # Your code here
    pass`,
    solution: `def big_subtract(a, b):
    i, j = len(a) - 1, len(b) - 1
    borrow = 0
    out = []
    while i >= 0:
        digit = (ord(a[i]) - 48) - borrow
        if j >= 0:
            digit -= ord(b[j]) - 48
            j -= 1
        if digit < 0:
            digit += 10
            borrow = 1
        else:
            borrow = 0
        out.append(chr(digit + 48))
        i -= 1
    while len(out) > 1 and out[-1] == "0":
        out.pop()
    return "".join(reversed(out))`,
    testCases: [
      { input: ["100", "1"], expected: "99" },
      { input: ["12345", "12345"], expected: "0" },
      { input: ["1000", "999"], expected: "1" },
      { input: ["5", "0"], expected: "5" },
      { input: ["1000000000000000000000", "1"], expected: "999999999999999999999" },
    ],
    hint: "Keep the result digits in reverse while computing, then flip them at the end.",
  },
  {
    id: "al-274",
    title: "Valid Word Square",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return True if the list of words forms a word square, meaning the k-th row and the k-th column contain the same sequence of characters wherever both positions exist.\n\nCompare words[i][j] with words[j][i] and fail on any mismatch or out-of-range access. Empty input is trivially valid.",
    starterCode: `def valid_word_square(words):
    # Your code here
    pass`,
    solution: `def valid_word_square(words):
    for i, word in enumerate(words):
        for j, ch in enumerate(word):
            if j >= len(words) or i >= len(words[j]):
                return False
            if words[j][i] != ch:
                return False
    return True`,
    testCases: [
      { input: [["abcd", "bnrt", "crmy", "dtye"]], expected: true },
      { input: [["ab", "ba"]], expected: true },
      { input: [["ball", "area", "read", "lady"]], expected: false },
      { input: [["a"]], expected: true },
      { input: [[]], expected: true },
      { input: [["abc", "b"]], expected: false },
    ],
    hint: "A position outside the bounds of the transposed word breaks the square.",
  },
  {
    id: "al-275",
    title: "Rotated Digits Count",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Count how many numbers from 1 through n become a different valid number when each digit is rotated 180 degrees.\n\nDigits 0, 1 and 8 stay valid and unchanged, 2, 5, 6 and 9 stay valid but change, and 3, 4 and 7 make the number invalid. A number counts only if it is valid and at least one digit changes.",
    starterCode: `def rotated_digits_count(n):
    # Your code here
    pass`,
    solution: `def rotated_digits_count(n):
    count = 0
    for x in range(1, n + 1):
        valid = True
        changed = False
        for ch in str(x):
            if ch in "347":
                valid = False
                break
            if ch in "2569":
                changed = True
        if valid and changed:
            count += 1
    return count`,
    testCases: [
      { input: [10], expected: 4 },
      { input: [1], expected: 0 },
      { input: [2], expected: 1 },
      { input: [20], expected: 9 },
      { input: [100], expected: 40 },
    ],
    hint: "A number containing any of 3, 4 or 7 can never be rotated at all.",
  },
  {
    id: "al-276",
    title: "Count Binary Strings Without Consecutive Ones",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of binary strings of length n that contain no two consecutive 1s.\n\nBuild the strings ending in 0 and ending in 1 as Fibonacci-style counts: a string ending in 1 must be preceded by 0, while a string ending in 0 extends anything. Assume n >= 1.",
    starterCode: `def count_binary_strings_no_ones(n):
    # Your code here
    pass`,
    solution: `def count_binary_strings_no_ones(n):
    a, b = 1, 2
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
    testCases: [
      { input: [1], expected: 2 },
      { input: [2], expected: 3 },
      { input: [3], expected: 5 },
      { input: [5], expected: 13 },
      { input: [10], expected: 144 },
    ],
    hint: "The counts follow the Fibonacci sequence shifted by two positions.",
  },
  {
    id: "al-277",
    title: "Range Sum Query - Mutable",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Support point updates and inclusive range sum queries on a list of integers. Operations are [1, index, value] to set an element and [2, left, right] to query the sum, and the results of queries are returned in order.\n\nUse a Fenwick tree so both updates and queries take O(log n). An empty operation list returns an empty list.",
    starterCode: `def range_sum_mutable(nums, operations):
    # Your code here
    pass`,
    solution: `def range_sum_mutable(nums, operations):
    size = len(nums)
    tree = [0] * (size + 1)
    def update(index, delta):
        i = index + 1
        while i <= size:
            tree[i] += delta
            i += i & (-i)
    def prefix(index):
        total = 0
        i = index + 1
        while i > 0:
            total += tree[i]
            i -= i & (-i)
        return total
    current = list(nums)
    for i, value in enumerate(current):
        update(i, value)
    results = []
    for operation in operations:
        if operation[0] == 1:
            index, value = operation[1], operation[2]
            delta = value - current[index]
            current[index] = value
            update(index, delta)
        else:
            left, right = operation[1], operation[2]
            results.append(prefix(right) - (prefix(left - 1) if left > 0 else 0))
    return results`,
    testCases: [
      { input: [[1, 3, 5], [[2, 0, 2], [1, 1, 2], [2, 0, 2]]], expected: [9, 8] },
      { input: [[1], [[2, 0, 0], [1, 0, 5], [2, 0, 0]]], expected: [1, 5] },
      { input: [[], []], expected: [] },
      { input: [[1, 2, 3, 4], [[2, 1, 3], [1, 3, 0], [2, 0, 3]]], expected: [9, 6] },
      { input: [[0, 0, 0], [[1, 1, 7], [2, 1, 1]]], expected: [7] },
    ],
    hint: "Update the tree with the difference between the new and old values.",
  },
  {
    id: "al-278",
    title: "Range Update Point Query",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Start with an array of n zeros and process operations: [1, left, right, value] adds value to every index in the inclusive range, and [2, index] asks for the current value at an index. Return the query results in order.\n\nUse a difference array where a range update touches only two positions, and a query takes the prefix sum. Values may be negative.",
    starterCode: `def range_update_point_query(n, operations):
    # Your code here
    pass`,
    solution: `def range_update_point_query(n, operations):
    diff = [0] * (n + 1)
    results = []
    for operation in operations:
        if operation[0] == 1:
            left, right, value = operation[1], operation[2], operation[3]
            diff[left] += value
            if right + 1 <= n:
                diff[right + 1] -= value
        else:
            index = operation[1]
            total = 0
            for i in range(index + 1):
                total += diff[i]
            results.append(total)
    return results`,
    testCases: [
      { input: [5, [[1, 1, 3, 2], [2, 0], [2, 2], [1, 0, 2, 1], [2, 1], [2, 4]]], expected: [0, 2, 3, 0] },
      { input: [1, [[2, 0]]], expected: [0] },
      { input: [3, []], expected: [] },
      { input: [2, [[1, 0, 1, 5], [2, 1], [1, 0, 0, -5], [2, 0]]], expected: [5, 0] },
    ],
    hint: "Adding val at left and subtracting it at right + 1 makes the prefix sum apply the range.",
  },
  {
    id: "al-279",
    title: "2D Prefix Sum Range Query",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Answer axis-aligned rectangle sum queries on a matrix, where each query is [r1, c1, r2, c2] with inclusive bounds.\n\nBuild a 2D prefix sum table where each entry is the sum of the rectangle from the origin, then combine four table entries per query. Return the query answers in order.",
    starterCode: `def matrix_sum_queries(matrix, queries):
    # Your code here
    pass`,
    solution: `def matrix_sum_queries(matrix, queries):
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            prefix[r + 1][c + 1] = matrix[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c]
    results = []
    for r1, c1, r2, c2 in queries:
        total = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1]
        results.append(total)
    return results`,
    testCases: [
      { input: [[[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]], [[2, 1, 4, 3], [1, 1, 2, 2], [1, 2, 2, 4]]], expected: [8, 11, 12] },
      { input: [[[1, 2], [3, 4]], [[0, 0, 1, 1], [0, 0, 0, 0], [1, 1, 1, 1]]], expected: [10, 1, 4] },
      { input: [[[5]], [[0, 0, 0, 0]]], expected: [5] },
    ],
    hint: "Inclusion-exclusion adds the bottom-right corner and subtracts the two strips plus the overlap.",
  },
  {
    id: "al-280",
    title: "2D Range Update Point Query",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Start with an n by m matrix of zeros and process operations: [1, r1, c1, r2, c2, value] adds value to the inclusive subrectangle, and [2, r, c] asks for the value at a cell. Return the query results in order.\n\nUse a 2D difference array where each rectangle update touches four corners, and a query takes the 2D prefix sum.",
    starterCode: `def matrix_range_update_queries(n, m, operations):
    # Your code here
    pass`,
    solution: `def matrix_range_update_queries(n, m, operations):
    diff = [[0] * (m + 1) for _ in range(n + 1)]
    results = []
    for operation in operations:
        if operation[0] == 1:
            r1, c1, r2, c2, value = operation[1], operation[2], operation[3], operation[4], operation[5]
            diff[r1][c1] += value
            diff[r1][c2 + 1] -= value
            diff[r2 + 1][c1] -= value
            diff[r2 + 1][c2 + 1] += value
        else:
            r, c = operation[1], operation[2]
            total = 0
            for i in range(r + 1):
                for j in range(c + 1):
                    total += diff[i][j]
            results.append(total)
    return results`,
    testCases: [
      { input: [3, 3, [[1, 0, 0, 1, 1, 5], [2, 0, 0], [2, 1, 1], [2, 2, 2]]], expected: [5, 5, 0] },
      { input: [2, 2, [[2, 0, 0]]], expected: [0] },
      { input: [1, 1, [[1, 0, 0, 0, 0, 7], [2, 0, 0]]], expected: [7] },
      { input: [3, 3, [[1, 1, 1, 2, 2, 3], [1, 0, 0, 0, 0, 1], [2, 1, 2], [2, 1, 1], [2, 0, 0]]], expected: [3, 3, 1] },
    ],
    hint: "The corner pattern is add at the top-left, subtract on the far edges, and add back at the opposite corner.",
  },
  {
    id: "al-281",
    title: "Base Conversion",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Convert a non-negative integer to its string representation in any base from 2 to 36, using digits 0 through 9 and letters A through Z.\n\nRepeatedly divide by the base and collect the remainders, then reverse them. The value 0 is represented as the single digit 0.",
    starterCode: `def base_conversion(n, base):
    # Your code here
    pass`,
    solution: `def base_conversion(n, base):
    if n == 0:
        return "0"
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    out = []
    while n > 0:
        n, remainder = divmod(n, base)
        out.append(digits[remainder])
    return "".join(reversed(out))`,
    testCases: [
      { input: [255, 16], expected: "FF" },
      { input: [10, 2], expected: "1010" },
      { input: [0, 2], expected: "0" },
      { input: [1000, 8], expected: "1750" },
      { input: [35, 36], expected: "Z" },
      { input: [255, 10], expected: "255" },
    ],
    hint: "divmod gives both the next quotient and the digit in one step.",
  },
  {
    id: "al-282",
    title: "Big Integer Division",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Divide one non-negative integer string by another and return the quotient as a string, truncating any remainder, without converting the whole numbers to integers at once.\n\nSimulate long division digit by digit: bring down the next digit, find how many times the divisor fits by repeated subtraction, and keep the remainder. Assume the divisor is greater than zero.",
    starterCode: `def big_divide(a, b):
    # Your code here
    pass`,
    solution: `def big_divide(a, b):
    divisor = int(b)
    out = []
    remainder = 0
    for ch in a:
        remainder = remainder * 10 + (ord(ch) - 48)
        digit = 0
        while remainder >= divisor:
            remainder -= divisor
            digit += 1
        out.append(str(digit))
    result = "".join(out).lstrip("0")
    return result if result else "0"`,
    testCases: [
      { input: ["10", "3"], expected: "3" },
      { input: ["123456789", "123"], expected: "1003713" },
      { input: ["999", "999"], expected: "1" },
      { input: ["0", "5"], expected: "0" },
      { input: ["7", "10"], expected: "0" },
      { input: ["1000000000000", "2"], expected: "500000000000" },
    ],
    hint: "The leading zeros in the quotient digits are stripped at the end.",
  },
  {
    id: "al-283",
    title: "Infix to Postfix",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Convert a list of expression tokens from infix order to postfix (reverse Polish) order and return the resulting token list.\n\nUse the shunting-yard rule: operands go straight to the output, operators wait on a stack until lower or equal precedence operators are popped, and parentheses control the stack. Operators + and - share precedence, with * and / higher, and all are left-associative.",
    starterCode: `def infix_to_postfix(tokens):
    # Your code here
    pass`,
    solution: `def infix_to_postfix(tokens):
    precedence = {"+": 1, "-": 1, "*": 2, "/": 2}
    output = []
    stack = []
    for token in tokens:
        if token == "(":
            stack.append(token)
        elif token == ")":
            while stack and stack[-1] != "(":
                output.append(stack.pop())
            stack.pop()
        elif token in precedence:
            while stack and stack[-1] != "(" and precedence[stack[-1]] >= precedence[token]:
                output.append(stack.pop())
            stack.append(token)
        else:
            output.append(token)
    while stack:
        output.append(stack.pop())
    return output`,
    testCases: [
      { input: [["A", "+", "B", "*", "C"]], expected: ["A", "B", "C", "*", "+"] },
      { input: [["(", "A", "+", "B", ")", "*", "C"]], expected: ["A", "B", "+", "C", "*"] },
      { input: [["A", "+", "B"]], expected: ["A", "B", "+"] },
      { input: [["A"]], expected: ["A"] },
      { input: [["A", "*", "B", "+", "C", "*", "D"]], expected: ["A", "B", "*", "C", "D", "*", "+"] },
    ],
    hint: "Left-associative equal precedence is what makes the comparison greater-or-equal.",
  },
  {
    id: "al-284",
    title: "Basic Calculator",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Evaluate a string arithmetic expression containing non-negative integers, the operators +, -, * and /, and spaces, without parentheses.\n\nTrack the previous operator and a stack: numbers are pushed, negated or combined with the top of the stack for multiplication and division. Division truncates toward zero.",
    starterCode: `def basic_calculator(s):
    # Your code here
    pass`,
    solution: `def basic_calculator(s):
    expression = s.replace(" ", "")
    stack = []
    number = 0
    operation = "+"
    for ch in expression + "+":
        if ch.isdigit():
            number = number * 10 + (ord(ch) - 48)
        else:
            if operation == "+":
                stack.append(number)
            elif operation == "-":
                stack.append(-number)
            elif operation == "*":
                stack.append(stack.pop() * number)
            else:
                previous = stack.pop()
                quotient = abs(previous) // number
                if (previous < 0) != (number < 0):
                    quotient = -quotient
                stack.append(quotient)
            operation = ch
            number = 0
    return sum(stack)`,
    testCases: [
      { input: ["3+2*2"], expected: 7 },
      { input: [" 3/2 "], expected: 1 },
      { input: [" 3+5 / 2 "], expected: 5 },
      { input: ["14-3/2"], expected: 13 },
      { input: ["1+1"], expected: 2 },
    ],
    hint: "Appending a sentinel plus sign forces the final number to be processed.",
  },
  {
    id: "al-285",
    title: "Count Numbers with Unique Digits",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given n, count all numbers in the range from 0 up to 10 to the n minus 1 whose decimal digits are all distinct.\n\nThe answer for length 0 is 1; for each further digit length, multiply the previous unique count by the number of still available digits and add it to the total. Once the available digit count reaches zero the total stops growing.",
    starterCode: `def count_unique_digits(n):
    # Your code here
    pass`,
    solution: `def count_unique_digits(n):
    if n == 0:
        return 1
    total = 10
    unique = 9
    available = 9
    for _ in range(2, n + 1):
        unique *= available
        total += unique
        available -= 1
        if available == 0:
            break
    return total`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 10 },
      { input: [2], expected: 91 },
      { input: [3], expected: 739 },
      { input: [4], expected: 5275 },
    ],
    hint: "The leading digit has 9 choices and each later position one fewer.",
  },
  {
    id: "al-286",
    title: "Nth Digit of the Sequence",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the n-th digit (1-indexed) of the infinite sequence formed by writing the positive integers in order: 123456789101112 and so on.\n\nSkip whole blocks of numbers by their digit length, then locate the exact number and digit position. Assume n >= 1.",
    starterCode: `def nth_digit(n):
    # Your code here
    pass`,
    solution: `def nth_digit(n):
    digits = 1
    start = 1
    count = 9
    while n > digits * count:
        n -= digits * count
        digits += 1
        start *= 10
        count *= 10
    number = start + (n - 1) // digits
    index = (n - 1) % digits
    return int(str(number)[index])`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [10], expected: 1 },
      { input: [11], expected: 0 },
      { input: [12], expected: 1 },
      { input: [1000], expected: 3 },
    ],
    hint: "The block of d-digit numbers starts at 10 to the d minus 1 and holds 9 times that many digits.",
  },
  {
    id: "al-287",
    title: "Prime Palindrome",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the smallest prime number that is also a palindrome and is greater than or equal to n.\n\nCheck each candidate for palindromic form and primality, testing divisibility up to the square root. Numbers below 2 are not prime; assume n >= 1.",
    starterCode: `def prime_palindrome(n):
    # Your code here
    pass`,
    solution: `def prime_palindrome(n):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True
    candidate = n
    while True:
        text = str(candidate)
        if text == text[::-1] and is_prime(candidate):
            return candidate
        candidate += 1`,
    testCases: [
      { input: [1], expected: 2 },
      { input: [6], expected: 7 },
      { input: [8], expected: 11 },
      { input: [13], expected: 101 },
      { input: [100], expected: 101 },
    ],
    hint: "Every even-length palindrome greater than 11 is divisible by 11.",
  },
  {
    id: "al-288",
    title: "Count Palindrome Partitions",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of ways to partition the string s so that every part is a palindrome. Parts may repeat and every character must be used.\n\nPrecompute the palindrome table for all substrings, then let dp[i] be the number of ways to split the prefix of length i, accumulating dp[j] whenever s[j:i] is a palindrome. The empty string has zero partitions.",
    starterCode: `def count_palindrome_partitions(s):
    # Your code here
    pass`,
    solution: `def count_palindrome_partitions(s):
    n = len(s)
    if n == 0:
        return 0
    is_pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or is_pal[i + 1][j - 1]):
                is_pal[i][j] = True
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for j in range(i):
            if is_pal[j][i - 1]:
                dp[i] += dp[j]
    return dp[n]`,
    testCases: [
      { input: ["aab"], expected: 2 },
      { input: ["ab"], expected: 1 },
      { input: ["aaa"], expected: 4 },
      { input: ["aabb"], expected: 4 },
      { input: [""], expected: 0 },
    ],
    hint: "dp[i] sums dp[j] over every j where the suffix from j to i - 1 is a palindrome.",
  },
  {
    id: "al-289",
    title: "Largest Multiple of Three",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a list of digits, return the largest number divisible by 3 that can be formed using some or all of the digits, as a string without leading zeros, or the empty string if impossible.\n\nCount digit frequencies and remove the fewest digits needed to make the digit sum divisible by 3, then arrange the rest in descending order. All zeros produce the string 0.",
    starterCode: `def largest_multiple_of_three(digits):
    # Your code here
    pass`,
    solution: `def largest_multiple_of_three(digits):
    counts = [0] * 10
    total = 0
    for d in digits:
        counts[d] += 1
        total += d
    remainder = total % 3

    def remove_one(rem):
        for d in range(rem, 10, 3):
            if d != 0 and counts[d] > 0:
                counts[d] -= 1
                return True
        return False

    if remainder == 1:
        if not remove_one(1):
            if not (remove_one(2) and remove_one(2)):
                return ""
    elif remainder == 2:
        if not remove_one(2):
            if not (remove_one(1) and remove_one(1)):
                return ""
    if sum(counts) == 0:
        return ""
    joined = "".join(str(d) * counts[d] for d in range(9, -1, -1))
    stripped = joined.lstrip("0")
    return stripped if stripped else "0"`,
    testCases: [
      { input: [[8, 1, 9]], expected: "981" },
      { input: [[8, 6, 7, 1, 0]], expected: "8760" },
      { input: [[1]], expected: "" },
      { input: [[0, 0, 0]], expected: "0" },
      { input: [[1, 2, 3]], expected: "321" },
    ],
    hint: "For a remainder of 1, either drop one digit with remainder 1 or two digits with remainder 2.",
  },
  {
    id: "al-290",
    title: "Count Digit Strings Divisible by K",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the digit strings of length n, allowing leading zeros, whose numeric value is divisible by k.\n\nTrack the number of strings for every remainder modulo k and extend each state by appending each of the ten digits. Assume n >= 1 and k >= 1.",
    starterCode: `def count_divisible_digit_strings(n, k):
    # Your code here
    pass`,
    solution: `def count_divisible_digit_strings(n, k):
    dp = [0] * k
    dp[0] = 1
    for _ in range(n):
        nxt = [0] * k
        for r in range(k):
            if dp[r]:
                for d in range(10):
                    nxt[(r * 10 + d) % k] += dp[r]
        dp = nxt
    return dp[0]`,
    testCases: [
      { input: [1, 2], expected: 5 },
      { input: [1, 10], expected: 1 },
      { input: [2, 7], expected: 15 },
      { input: [3, 3], expected: 334 },
      { input: [4, 5], expected: 2000 },
    ],
    hint: "Appending a digit transforms remainder r into (r * 10 + d) modulo k.",
  },
  {
    id: "al-291",
    title: "Count Sorted Vowel Strings",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the strings of length n over the vowels a, e, i, o and u that are non-decreasing in alphabetical order.\n\nThe count equals the number of ways to choose n items from 5 types with repetition, which is C(n + 4, 4). Compute it with the multiplicative formula and integer division.",
    starterCode: `def count_sorted_vowel_strings(n):
    # Your code here
    pass`,
    solution: `def count_sorted_vowel_strings(n):
    total = 1
    for i in range(1, 5):
        total = total * (n + i) // i
    return total`,
    testCases: [
      { input: [1], expected: 5 },
      { input: [2], expected: 15 },
      { input: [3], expected: 35 },
      { input: [5], expected: 126 },
      { input: [10], expected: 1001 },
    ],
    hint: "A non-decreasing string is determined by how many of each vowel it contains.",
  },
  {
    id: "al-292",
    title: "Lexicographic Numbers up to N",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the integers from 1 through n in lexicographic order as strings compared character by character.\n\nStart at 1 and repeatedly either descend by appending a zero when that stays within n, or move to the next sibling by incrementing and falling back to a parent. Stop after n numbers.",
    starterCode: `def lexicographic_numbers(n):
    # Your code here
    pass`,
    solution: `def lexicographic_numbers(n):
    result = []
    current = 1
    for _ in range(n):
        result.append(current)
        if current * 10 <= n:
            current *= 10
        else:
            while current % 10 == 9 or current + 1 > n:
                current //= 10
            current += 1
    return result`,
    testCases: [
      { input: [13], expected: [1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9] },
      { input: [2], expected: [1, 2] },
      { input: [1], expected: [1] },
      { input: [10], expected: [1, 10, 2, 3, 4, 5, 6, 7, 8, 9] },
      { input: [20], expected: [1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 3, 4, 5, 6, 7, 8, 9] },
    ],
    hint: "Falling back to the parent happens whenever the next sibling would exceed n.",
  },
  {
    id: "al-293",
    title: "Count Strings Without AAA or BBB",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the strings of length n over the alphabet a and b that contain neither aaa nor bbb as a substring.\n\nTrack the last character and whether the current run has length 1 or 2. Adding the other character is always allowed, while continuing the run is only allowed from a run of length 1.",
    starterCode: `def count_strings_without_aaa_bbb(n):
    # Your code here
    pass`,
    solution: `def count_strings_without_aaa_bbb(n):
    if n == 0:
        return 1
    dp = {("a", 1): 1, ("b", 1): 1}
    for _ in range(1, n):
        nxt = {}
        for (ch, run), count in dp.items():
            other = "b" if ch == "a" else "a"
            key = (other, 1)
            nxt[key] = nxt.get(key, 0) + count
            if run < 2:
                key = (ch, run + 1)
                nxt[key] = nxt.get(key, 0) + count
        dp = nxt
    return sum(dp.values())`,
    testCases: [
      { input: [1], expected: 2 },
      { input: [2], expected: 4 },
      { input: [3], expected: 6 },
      { input: [4], expected: 10 },
      { input: [5], expected: 16 },
    ],
    hint: "A run is never allowed to grow beyond two, so the state only needs a run flag.",
  },
  {
    id: "al-294",
    title: "Count Vowel Permutations",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count the strings of length n over the vowels a, e, i, o and u where each vowel is followed only by allowed vowels: a may be followed by e; e by a or i; i by a, e, o or u; o by i or u; and u by a.\n\nRun a DP over the five ending vowels, applying the allowed transitions n - 1 times, and sum the final counts. Assume n >= 1.",
    starterCode: `def count_vowel_permutations(n):
    # Your code here
    pass`,
    solution: `def count_vowel_permutations(n):
    transitions = {
        "a": ["e"],
        "e": ["a", "i"],
        "i": ["a", "e", "o", "u"],
        "o": ["i", "u"],
        "u": ["a"],
    }
    dp = {v: 1 for v in transitions}
    for _ in range(1, n):
        nxt = {v: 0 for v in transitions}
        for v, count in dp.items():
            for w in transitions[v]:
                nxt[w] += count
        dp = nxt
    return sum(dp.values())`,
    testCases: [
      { input: [1], expected: 5 },
      { input: [2], expected: 10 },
      { input: [3], expected: 19 },
      { input: [5], expected: 68 },
      { input: [10], expected: 1739 },
    ],
    hint: "Each DP state is just the final vowel of the current string.",
  },
  {
    id: "al-295",
    title: "Longest Chunked Palindrome Decomposition",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Split the string into the maximum number of chunks so that the first chunk equals the last, the second equals the second last, and so on.\n\nGreedily look for the shortest prefix that matches the equally long suffix; when found, add two chunks and continue with the middle. If no split exists, the whole remainder counts as one chunk.",
    starterCode: `def longest_chunked_palindrome(text):
    # Your code here
    pass`,
    solution: `def longest_chunked_palindrome(text):
    left, right = 0, len(text) - 1
    chunks = 0
    while left < right:
        left_end = left
        right_start = right
        matched = False
        while left_end < right_start:
            if text[left:left_end + 1] == text[right_start:right + 1]:
                chunks += 2
                left = left_end + 1
                right = right_start - 1
                matched = True
                break
            left_end += 1
            right_start -= 1
        if not matched:
            break
    if left <= right:
        chunks += 1
    return chunks`,
    testCases: [
      { input: ["ghiabcdefhelloadamhiabcdefgh"], expected: 7 },
      { input: ["merchant"], expected: 1 },
      { input: ["antaprezatepzapreanta"], expected: 11 },
      { input: ["aaa"], expected: 3 },
      { input: ["aa"], expected: 2 },
    ],
    hint: "Taking the shortest possible matching pair leaves the most room for further chunks.",
  },
  {
    id: "al-296",
    title: "Additive Number Check",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if the digit string can be split into an additive sequence of at least three numbers where every number from the third onward is the sum of the previous two.\n\nTry every possible first and second number, reject numbers with leading zeros unless they are the single digit 0, and grow the sequence until it matches the whole string. Numbers may be very large.",
    starterCode: `def additive_number(num):
    # Your code here
    pass`,
    solution: `def additive_number(num):
    n = len(num)
    for i in range(1, n):
        for j in range(i + 1, n):
            first = num[:i]
            second = num[i:j]
            if (len(first) > 1 and first[0] == "0") or (len(second) > 1 and second[0] == "0"):
                continue
            sequence = [int(first), int(second)]
            while len("".join(str(x) for x in sequence)) < n:
                sequence.append(sequence[-1] + sequence[-2])
            if len(sequence) >= 3 and "".join(str(x) for x in sequence) == num:
                return True
    return False`,
    testCases: [
      { input: ["112358"], expected: true },
      { input: ["199100199"], expected: true },
      { input: ["123"], expected: true },
      { input: ["1023"], expected: false },
      { input: ["1203"], expected: false },
    ],
    hint: "A leading zero in a multi-digit number immediately disqualifies that split.",
  },
  {
    id: "al-297",
    title: "Numbers at Most N Given Digit Set",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given a set of allowed digit characters and a bound n, count the positive integers less than or equal to n that can be written using only those digits, with no leading zeros.\n\nCount all valid numbers with fewer digits than n, then walk the digits of n from the left, adding the numbers that are smaller at each position and stopping when the current digit is not allowed.",
    starterCode: `def at_most_n_digit_set(digits, n):
    # Your code here
    pass`,
    solution: `def at_most_n_digit_set(digits, n):
    digit_set = set(digits)
    s = str(n)
    length = len(s)
    total = 0
    for size in range(1, length):
        if size == 1:
            total += len([d for d in digit_set if d != "0"])
        else:
            first_choices = len([d for d in digit_set if d != "0"])
            total += first_choices * (len(digit_set) ** (size - 1))
    prefix_ok = True
    for i, ch in enumerate(s):
        choices = len([d for d in digit_set if d < ch and not (i == 0 and d == "0")])
        total += choices * (len(digit_set) ** (length - 1 - i))
        if ch not in digit_set:
            prefix_ok = False
            break
    if prefix_ok:
        total += 1
    return total`,
    testCases: [
      { input: [["1", "3", "5", "7"], 100], expected: 20 },
      { input: [["1", "4", "9"], 1000000000], expected: 29523 },
      { input: [["7"], 8], expected: 1 },
      { input: [["1"], 1], expected: 1 },
      { input: [["2", "4"], 5], expected: 2 },
    ],
    hint: "For a prefix that matches n exactly, any smaller allowed digit at the next position is safe.",
  },
  {
    id: "al-298",
    title: "Count Digit One",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count how many times the digit 1 appears in all numbers from 0 through n inclusive.\n\nFor every decimal position, split n into the higher part, the current digit and the lower part, and count ones contributed at that position: high times factor for current 0, high times factor plus low plus 1 for current 1, and high plus one times factor for larger digits.",
    starterCode: `def count_digit_one(n):
    # Your code here
    pass`,
    solution: `def count_digit_one(n):
    count = 0
    factor = 1
    while factor <= n:
        high = n // (factor * 10)
        current = (n // factor) % 10
        low = n % factor
        if current == 0:
            count += high * factor
        elif current == 1:
            count += high * factor + low + 1
        else:
            count += (high + 1) * factor
        factor *= 10
    return count`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [13], expected: 6 },
      { input: [100], expected: 21 },
      { input: [1000], expected: 301 },
      { input: [20], expected: 12 },
    ],
    hint: "The three cases for the current digit handle how many complete or partial cycles of the position are included.",
  },
  {
    id: "al-299",
    title: "Strobogrammatic Number Count",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the strobogrammatic numbers of length n, which read the same when rotated 180 degrees and have no leading zero unless the number is a single digit.\n\nRecursively wrap an inner strobogrammatic string with each valid outer pair, then discard results with a leading zero when n is greater than 1. Assume n >= 1.",
    starterCode: `def strobogrammatic_count(n):
    # Your code here
    pass`,
    solution: `def strobogrammatic_count(n):
    def build(k):
        if k == 0:
            return [""]
        if k == 1:
            return ["0", "1", "8"]
        prev = build(k - 2)
        result = []
        for s in prev:
            for a, b in (("1", "1"), ("6", "9"), ("8", "8"), ("9", "6"), ("0", "0")):
                result.append(a + s + b)
        return result
    numbers = build(n)
    if n == 1:
        return len(numbers)
    return sum(1 for s in numbers if s[0] != "0")`,
    testCases: [
      { input: [1], expected: 3 },
      { input: [2], expected: 4 },
      { input: [3], expected: 12 },
      { input: [4], expected: 20 },
      { input: [5], expected: 60 },
    ],
    hint: "Even lengths always lose exactly the counts whose outermost pair is zero.",
  },
  {
    id: "al-300",
    title: "Remove Outermost Parentheses",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Remove the outermost pair of every primitive group in the balanced parentheses string s and return the concatenation of the inner parts.\n\nTrack the current nesting depth: append an opening bracket only when the depth before it is positive, and append a closing bracket only when the depth after it is positive. Assume s is a valid parentheses string.",
    starterCode: `def remove_outer_parentheses(s):
    # Your code here
    pass`,
    solution: `def remove_outer_parentheses(s):
    out = []
    depth = 0
    for ch in s:
        if ch == "(":
            if depth > 0:
                out.append(ch)
            depth += 1
        else:
            depth -= 1
            if depth > 0:
                out.append(ch)
    return "".join(out)`,
    testCases: [
      { input: ["(()())(())"], expected: "()()()" },
      { input: ["(()())(())(()(()))"], expected: "()()()()(())" },
      { input: ["()()"], expected: "" },
      { input: ["(()())"], expected: "()()" },
      { input: [""], expected: "" },
    ],
    hint: "A primitive group returns to depth zero exactly at its closing outer bracket.",
  },
  {
    id: "al-301",
    title: "Basic Calculator with Parentheses",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Evaluate an expression string with non-negative integers, +, -, parentheses and spaces, where a minus sign may also precede an opening parenthesis or a number.\n\nUse a stack to save the result and sign whenever an opening parenthesis appears, restart the running result inside, and fold it back in when the parenthesis closes. The input is always a valid expression.",
    starterCode: `def basic_calculator_with_parens(s):
    # Your code here
    pass`,
    solution: `def basic_calculator_with_parens(s):
    expression = s.replace(" ", "")
    result = 0
    sign = 1
    stack = []
    number = 0
    index = 0
    while index < len(expression):
        ch = expression[index]
        if ch.isdigit():
            number = number * 10 + (ord(ch) - 48)
        elif ch == "+":
            result += sign * number
            number = 0
            sign = 1
        elif ch == "-":
            result += sign * number
            number = 0
            sign = -1
        elif ch == "(":
            stack.append(result)
            stack.append(sign)
            result = 0
            sign = 1
        else:
            result += sign * number
            number = 0
            previous_sign = stack.pop()
            previous_result = stack.pop()
            result = previous_result + previous_sign * result
        index += 1
    return result + sign * number`,
    testCases: [
      { input: ["1 + 1"], expected: 2 },
      { input: [" 2-1 + 2 "], expected: 3 },
      { input: ["(1+(4+5+2)-3)+(6+8)"], expected: 23 },
      { input: ["2-(5-6)"], expected: 3 },
      { input: ["-(2+3)"], expected: -5 },
    ],
    hint: "Saving both the result and the sign before a parenthesis is what makes nested groups work.",
  },
  {
    id: "al-302",
    title: "Smallest Good Base",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given an integer n as a number, return the smallest base as a string in which n is written as all ones.\n\nFor every possible digit count from the binary length down to 2, binary search the base such that 1 + b + ... + b to the k minus 1 equals n; if no base below n works, n itself is the answer. Assume n >= 3.",
    starterCode: `def smallest_good_base(n):
    # Your code here
    pass`,
    solution: `def smallest_good_base(n):
    def value(base, digits):
        total = 0
        for _ in range(digits):
            total = total * base + 1
        return total
    max_digits = n.bit_length()
    for digits in range(max_digits, 1, -1):
        lo, hi = 2, n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            current = value(mid, digits)
            if current == n:
                return str(mid)
            if current < n:
                lo = mid + 1
            else:
                hi = mid - 1
    return str(n - 1)`,
    testCases: [
      { input: [13], expected: "3" },
      { input: [4681], expected: "8" },
      { input: [3], expected: "2" },
      { input: [15], expected: "2" },
      { input: [1000], expected: "999" },
    ],
    hint: "With two digits the representation is 1 plus the base, so base n - 1 always works.",
  },
  {
    id: "al-303",
    title: "Count Strings with At Most K Adjacent Equal",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the strings of length n over 26 lowercase letters that have at most k positions i where the character at i equals the character at i + 1.\n\nA string with exactly j adjacent equal pairs is determined by choosing those j positions among n - 1 gaps, then choosing 26 letters for the first position and 25 different letters after every gap. Sum over j from 0 to k.",
    starterCode: `def count_strings_at_most_k_adjacent_equal(n, k):
    # Your code here
    pass`,
    solution: `from math import comb

def count_strings_at_most_k_adjacent_equal(n, k):
    total = 0
    for j in range(0, min(k, n - 1) + 1):
        total += comb(n - 1, j) * 26 * (25 ** (n - 1 - j))
    return total`,
    testCases: [
      { input: [1, 0], expected: 26 },
      { input: [2, 0], expected: 650 },
      { input: [2, 1], expected: 676 },
      { input: [3, 1], expected: 17550 },
      { input: [5, 2], expected: 11878750 },
    ],
    hint: "Every gap either repeats the previous letter or changes to one of the other 25.",
  },
  {
    id: "al-304",
    title: "Count Non-Decreasing Digit Numbers",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the positive integers from 1 through n whose decimal digits are non-decreasing from left to right, so each digit is at least the one before it.\n\nUse digit DP with the position, last digit, a tight flag for matching the prefix of n, and a started flag that ignores leading zeros before the first digit. Assume n >= 1.",
    starterCode: `def count_non_decreasing_digits(n):
    # Your code here
    pass`,
    solution: `def count_non_decreasing_digits(n):
    s = str(n)
    memo = {}
    def dp(pos, last, tight, started):
        key = (pos, last, tight, started)
        if key in memo:
            return memo[key]
        if pos == len(s):
            return 1 if started else 0
        limit = int(s[pos]) if tight else 9
        total = 0
        for d in range(0, limit + 1):
            if started and d < last:
                continue
            total += dp(pos + 1, d if (started or d > 0) else last, tight and d == limit, started or d > 0)
        memo[key] = total
        return total
    return dp(0, 0, True, False)`,
    testCases: [
      { input: [10], expected: 9 },
      { input: [20], expected: 18 },
      { input: [100], expected: 54 },
      { input: [200], expected: 99 },
      { input: [1000], expected: 219 },
    ],
    hint: "Leading zeros must not count as a first digit, so a started flag is required.",
  },
  {
    id: "al-305",
    title: "Count Necklaces",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Count the distinct necklaces of length n using k colours, where two necklaces are the same when one is a rotation of the other.\n\nApply Burnside's lemma: average the number of colourings fixed by each rotation, where a rotation by i positions fixes k to the power gcd(i, n) colourings. Assume n >= 1 and k >= 1.",
    starterCode: `def count_necklaces(n, k):
    # Your code here
    pass`,
    solution: `from math import gcd

def count_necklaces(n, k):
    total = 0
    for i in range(n):
        total += k ** gcd(i, n)
    return total // n`,
    testCases: [
      { input: [3, 2], expected: 4 },
      { input: [4, 2], expected: 6 },
      { input: [2, 3], expected: 6 },
      { input: [1, 5], expected: 5 },
      { input: [6, 2], expected: 14 },
    ],
    hint: "The sum over rotations is always divisible by n, so integer division is exact.",
  },
];
