import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "al-306",
    title: "Run-Length Decoding",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Decode a run-length encoded string where each character is followed by the number of times it repeats, so a3b2c1 decodes to aaabbc.\n\nCounts may have more than one digit. Return the empty string for empty input; assume the input is well formed.",
    starterCode: `def run_length_decode(s):
    # Your code here
    pass`,
    solution: `def run_length_decode(s):
    out = []
    pending = ""
    count = 0
    for ch in s:
        if ch.isdigit():
            count = count * 10 + (ord(ch) - 48)
        else:
            if pending:
                out.append(pending * count)
            pending = ch
            count = 0
    if pending:
        out.append(pending * count)
    return "".join(out)`,
    testCases: [
      { input: ["a3b2c1"], expected: "aaabbc" },
      { input: [""], expected: "" },
      { input: ["a1"], expected: "a" },
      { input: ["x10"], expected: "xxxxxxxxxx" },
      { input: ["a2b2a2"], expected: "aabbaa" },
    ],
    hint: "Hold the pending character until the next character or the end of the string.",
  },
  {
    id: "al-307",
    title: "Delta Encoding",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Encode a list of integers as its first element followed by the differences between consecutive elements.\n\nFor example [4, 7, 9, 15] becomes [4, 3, 2, 6]. Return an empty list for empty input.",
    starterCode: `def delta_encode(nums):
    # Your code here
    pass`,
    solution: `def delta_encode(nums):
    if not nums:
        return []
    out = [nums[0]]
    for i in range(1, len(nums)):
        out.append(nums[i] - nums[i - 1])
    return out`,
    testCases: [
      { input: [[4, 7, 9, 15]], expected: [4, 3, 2, 6] },
      { input: [[5]], expected: [5] },
      { input: [[]], expected: [] },
      { input: [[-3, 0, -3]], expected: [-3, 3, -3] },
      { input: [[10, 10, 10]], expected: [10, 0, 0] },
    ],
    hint: "The first value is kept as the starting point for the differences.",
  },
  {
    id: "al-308",
    title: "Varint Size",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the number of bytes needed to encode a non-negative integer as a base-128 varint, where every byte stores 7 payload bits and the high bit is a continuation flag.\n\nZero still needs one byte, so the size is at least 1. Assume n >= 0.",
    starterCode: `def varint_size(n):
    # Your code here
    pass`,
    solution: `def varint_size(n):
    size = 1
    value = n >> 7
    while value > 0:
        size += 1
        value >>= 7
    return size`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [127], expected: 1 },
      { input: [128], expected: 2 },
      { input: [16384], expected: 3 },
      { input: [2097151], expected: 3 },
      { input: [2097152], expected: 4 },
    ],
    hint: "Shift the value right by 7 bits per byte until nothing is left.",
  },
  {
    id: "al-309",
    title: "Zigzag Encoding",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Map a signed integer to an unsigned integer so small magnitudes of either sign get small codes: non-negative values become twice themselves and negative values become minus twice themselves minus one.\n\nFor example 0, -1, 1, -2, 2 map to 0, 1, 2, 3, 4.",
    starterCode: `def zigzag_encode(n):
    # Your code here
    pass`,
    solution: `def zigzag_encode(n):
    if n >= 0:
        return 2 * n
    return -2 * n - 1`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [-1], expected: 1 },
      { input: [1], expected: 2 },
      { input: [-2], expected: 3 },
      { input: [2], expected: 4 },
      { input: [100], expected: 200 },
    ],
    hint: "Negative values are mapped to odd codes and non-negative values to even codes.",
  },
  {
    id: "al-310",
    title: "Base64 Encode",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Encode a string to standard base64 using the alphabet A through Z, a through z, 0 through 9, plus and slash, with equals-sign padding.\n\nEach group of three bytes becomes four characters; a final group of one or two bytes uses two or three characters plus padding. The empty string encodes to the empty string.",
    starterCode: `def base64_encode(data):
    # Your code here
    pass`,
    solution: `def base64_encode(data):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    out = []
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        values = [ord(ch) for ch in chunk]
        while len(values) < 3:
            values.append(0)
        combined = (values[0] << 16) | (values[1] << 8) | values[2]
        out.append(alphabet[(combined >> 18) & 63])
        out.append(alphabet[(combined >> 12) & 63])
        if len(chunk) > 1:
            out.append(alphabet[(combined >> 6) & 63])
        else:
            out.append("=")
        if len(chunk) > 2:
            out.append(alphabet[combined & 63])
        else:
            out.append("=")
    return "".join(out)`,
    testCases: [
      { input: ["hello"], expected: "aGVsbG8=" },
      { input: [""], expected: "" },
      { input: ["a"], expected: "YQ==" },
      { input: ["ab"], expected: "YWI=" },
      { input: ["abc"], expected: "YWJj" },
      { input: ["Man"], expected: "TWFu" },
    ],
    hint: "Pack three bytes into a 24-bit number and read it back six bits at a time.",
  },
  {
    id: "al-311",
    title: "Base64 Decode",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Decode a standard base64 string back to the original text, ignoring padding.\n\nUnpack each group of four characters into three bytes, keeping only the bytes that were actually encoded. The empty string decodes to the empty string.",
    starterCode: `def base64_decode(s):
    # Your code here
    pass`,
    solution: `def base64_decode(s):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    table = {ch: i for i, ch in enumerate(alphabet)}
    s = s.rstrip("=")
    values = [table[ch] for ch in s]
    out = []
    for i in range(0, len(values), 4):
        chunk = values[i:i + 4]
        while len(chunk) < 4:
            chunk.append(0)
        combined = (chunk[0] << 18) | (chunk[1] << 12) | (chunk[2] << 6) | chunk[3]
        out.append(chr((combined >> 16) & 255))
        if len(values) - i > 2:
            out.append(chr((combined >> 8) & 255))
        if len(values) - i > 3:
            out.append(chr(combined & 255))
    return "".join(out)`,
    testCases: [
      { input: ["aGVsbG8="], expected: "hello" },
      { input: [""], expected: "" },
      { input: ["YQ=="], expected: "a" },
      { input: ["YWJj"], expected: "abc" },
      { input: ["TWFu"], expected: "Man" },
    ],
    hint: "The number of original bytes in the final group is known from how many characters remain after stripping padding.",
  },
  {
    id: "al-312",
    title: "XOR Checksum",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the XOR checksum of a string by XOR-ing the numeric character codes of all its characters.\n\nThe empty string has checksum 0, and repeated characters cancel in pairs. This is a simple error-detection checksum, not a cryptographic hash.",
    starterCode: `def xor_checksum(data):
    # Your code here
    pass`,
    solution: `def xor_checksum(data):
    result = 0
    for ch in data:
        result ^= ord(ch)
    return result`,
    testCases: [
      { input: [""], expected: 0 },
      { input: ["a"], expected: 97 },
      { input: ["ab"], expected: 3 },
      { input: ["hello"], expected: 98 },
      { input: ["AAAA"], expected: 0 },
    ],
    hint: "Every character that appears an even number of times cancels out of the XOR.",
  },
  {
    id: "al-313",
    title: "Fletcher Checksum",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the Fletcher-16 checksum of a string: keep two running sums modulo 255, adding each character code to the first sum and then the first sum to the second, and return the second sum shifted left eight bits plus the first.\n\nThis detects both single-bit errors and many transpositions. The empty string gives 0.",
    starterCode: `def fletcher_checksum(data):
    # Your code here
    pass`,
    solution: `def fletcher_checksum(data):
    sum1 = 0
    sum2 = 0
    for ch in data:
        sum1 = (sum1 + ord(ch)) % 255
        sum2 = (sum2 + sum1) % 255
    return (sum2 << 8) | sum1`,
    testCases: [
      { input: [""], expected: 0 },
      { input: ["a"], expected: 24929 },
      { input: ["abc"], expected: 19495 },
      { input: ["hello"], expected: 11542 },
      { input: ["ABC"], expected: 35782 },
    ],
    hint: "The second sum accumulates the running value of the first, which makes order matter.",
  },
  {
    id: "al-314",
    title: "Adler-32 Checksum",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the Adler-32 checksum of a string using modulus 65521: one sum starts at 1, the other at 0, each character code is added to the first sum and the first sum is then added to the second.\n\nReturn the second sum shifted left sixteen bits plus the first. The empty string gives 1.",
    starterCode: `def adler32_checksum(data):
    # Your code here
    pass`,
    solution: `def adler32_checksum(data):
    a = 1
    b = 0
    for ch in data:
        a = (a + ord(ch)) % 65521
        b = (b + a) % 65521
    return (b << 16) | a`,
    testCases: [
      { input: [""], expected: 1 },
      { input: ["a"], expected: 6422626 },
      { input: ["Wikipedia"], expected: 300286872 },
      { input: ["hello"], expected: 103547413 },
      { input: ["123456789"], expected: 152961502 },
    ],
    hint: "65521 is the largest prime below 2 to the 16th power.",
  },
  {
    id: "al-315",
    title: "FNV-1a Hash",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the 32-bit FNV-1a hash of a string: start from the offset basis 2166136261, XOR each character code into the hash and multiply by the prime 16777619, keeping only the low 32 bits.\n\nAll arithmetic is unsigned and wraps modulo 2 to the 32nd power. The empty string hashes to the offset basis.",
    starterCode: `def fnv1a_hash(data):
    # Your code here
    pass`,
    solution: `def fnv1a_hash(data):
    result = 2166136261
    for ch in data:
        result ^= ord(ch)
        result = (result * 16777619) & 0xFFFFFFFF
    return result`,
    testCases: [
      { input: [""], expected: 2166136261 },
      { input: ["a"], expected: 3826002220 },
      { input: ["foobar"], expected: 3214735720 },
      { input: ["hello"], expected: 1335831723 },
      { input: ["abc"], expected: 440920331 },
    ],
    hint: "XOR before the multiply is what distinguishes FNV-1a from FNV-1.",
  },
  {
    id: "al-316",
    title: "djb2 Hash",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Compute the djb2 hash of a string: start from 5381 and for each character update the hash as hash times 33 plus the character code, keeping only the low 32 bits.\n\nMultiplying by 33 is written as a left shift of five plus the value itself. The empty string hashes to 5381.",
    starterCode: `def djb2_hash(data):
    # Your code here
    pass`,
    solution: `def djb2_hash(data):
    result = 5381
    for ch in data:
        result = ((result << 5) + result + ord(ch)) & 0xFFFFFFFF
    return result`,
    testCases: [
      { input: [""], expected: 5381 },
      { input: ["a"], expected: 177670 },
      { input: ["hello"], expected: 261238937 },
      { input: ["abc"], expected: 193485963 },
      { input: ["foobar"], expected: 4259602622 },
    ],
    hint: "The result is masked to 32 bits after every character.",
  },
  {
    id: "al-317",
    title: "Gray Code Decode",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Convert a Gray code value back to its binary value. In a Gray code, consecutive values differ by exactly one bit, and the binary value is recovered by repeatedly XOR-ing the code with itself shifted right.\n\nOne efficient method accumulates the XOR of every suffix of the Gray code bits. Assume g >= 0.",
    starterCode: `def gray_decode(g):
    # Your code here
    pass`,
    solution: `def gray_decode(g):
    result = 0
    while g > 0:
        result ^= g
        g >>= 1
    return result`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [3], expected: 2 },
      { input: [6], expected: 4 },
      { input: [4], expected: 7 },
    ],
    hint: "Accumulating XOR of the code shifted right one bit at a time undoes the Gray encoding.",
  },
  {
    id: "al-318",
    title: "Reverse Bits",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Reverse the lowest width bits of the integer n and return the result, where width is at least 1.\n\nFor example, reversing 1 in 8 bits gives 128 and reversing 6 in 3 bits gives 3. Bits above the given width are ignored.",
    starterCode: `def reverse_bits(n, width):
    # Your code here
    pass`,
    solution: `def reverse_bits(n, width):
    result = 0
    for i in range(width):
        result = (result << 1) | ((n >> i) & 1)
    return result`,
    testCases: [
      { input: [1, 8], expected: 128 },
      { input: [2, 8], expected: 64 },
      { input: [0, 8], expected: 0 },
      { input: [255, 8], expected: 255 },
      { input: [6, 3], expected: 3 },
      { input: [5, 3], expected: 5 },
    ],
    hint: "Build the result by shifting left and appending the next bit of n from the bottom.",
  },
  {
    id: "al-319",
    title: "Thue-Morse Sequence",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the first n characters of the Thue-Morse sequence, which starts with 0 and repeatedly appends the bitwise complement of everything produced so far.\n\nThe sequence begins 0, 1, 1, 0, 1, 0, 0, 1. Return the empty string for n <= 0.",
    starterCode: `def thue_morse(n):
    # Your code here
    pass`,
    solution: `def thue_morse(n):
    current = "0"
    while len(current) < n:
        flipped = "".join("1" if ch == "0" else "0" for ch in current)
        current += flipped
    return current[:n]`,
    testCases: [
      { input: [0], expected: "" },
      { input: [1], expected: "0" },
      { input: [4], expected: "0110" },
      { input: [8], expected: "01101001" },
      { input: [16], expected: "0110100110010110" },
    ],
    hint: "Each doubling step maps every 0 to 1 and every 1 to 0.",
  },
  {
    id: "al-320",
    title: "Ruler Function",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "Return the first n values of the ruler sequence for the integers 1 through n, where the i-th value is the exponent of the largest power of two that divides i.\n\nSo 1 gives 0, 2 gives 1, 4 gives 2, 8 gives 3 and odd numbers give 0. Return an empty list for n <= 0.",
    starterCode: `def ruler_function(n):
    # Your code here
    pass`,
    solution: `def ruler_function(n):
    return [(i & -i).bit_length() - 1 for i in range(1, n + 1)]`,
    testCases: [
      { input: [0], expected: [] },
      { input: [1], expected: [0] },
      { input: [4], expected: [0, 1, 0, 2] },
      { input: [8], expected: [0, 1, 0, 2, 0, 1, 0, 3] },
      { input: [16], expected: [0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4] },
    ],
    hint: "i & -i isolates the lowest set bit, whose bit length minus one is the exponent.",
  },
  {
    id: "al-321",
    title: "Subtraction Game Win Check",
    category: "Algorithms",
    difficulty: "Easy",
    description:
      "In a game where each player removes between 1 and k stones from a pile, return True if the first player can force a win with perfect play, and False otherwise.\n\nThe losing positions are exactly the multiples of k + 1, because every move leaves a non-multiple that the opponent can restore. Return False for 0 stones.",
    starterCode: `def subtraction_game_win(n, k):
    # Your code here
    pass`,
    solution: `def subtraction_game_win(n, k):
    return n % (k + 1) != 0`,
    testCases: [
      { input: [10, 3], expected: true },
      { input: [8, 3], expected: false },
      { input: [1, 1], expected: true },
      { input: [0, 3], expected: false },
      { input: [7, 3], expected: true },
    ],
    hint: "Whatever the opponent removes, you can remove enough to complete a group of k + 1.",
  },
  {
    id: "al-322",
    title: "Convex Hull Area",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the area of the convex hull of a set of points as a float, or 0.0 when fewer than three non-collinear points are given.\n\nBuild the hull with the monotone chain algorithm keeping only strict left turns, then apply the shoelace formula and halve the absolute result. Duplicate points are ignored.",
    starterCode: `def convex_hull_area(points):
    # Your code here
    pass`,
    solution: `def convex_hull_area(points):
    pts = sorted(set(tuple(p) for p in points))
    if len(pts) < 3:
        return 0.0
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    if len(hull) < 3:
        return 0.0
    total = 0
    for i in range(len(hull)):
        x1, y1 = hull[i]
        x2, y2 = hull[(i + 1) % len(hull)]
        total += x1 * y2 - x2 * y1
    return abs(total) / 2.0`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 1.0 },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2], [1, 1]]], expected: 4.0 },
      { input: [[[0, 0], [3, 0], [0, 4]]], expected: 6.0 },
      { input: [[[0, 0], [1, 0]]], expected: 0.0 },
      { input: [[[5, 5]]], expected: 0.0 },
    ],
    hint: "The shoelace sum is twice the signed area, so halve its absolute value.",
  },
  {
    id: "al-323",
    title: "Point in Convex Polygon",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return True if the point lies inside or on the boundary of the convex polygon given by its vertices in order, and False otherwise.\n\nCheck the sign of the cross product between each edge and the vector to the point: every non-zero sign must agree for the point to be inside or on the hull.",
    starterCode: `def point_in_convex_polygon(points, point):
    # Your code here
    pass`,
    solution: `def point_in_convex_polygon(points, point):
    n = len(points)
    if n == 0:
        return False
    if n < 3:
        return tuple(point) in [tuple(p) for p in points]
    sign = 0
    for i in range(n):
        ax, ay = points[i]
        bx, by = points[(i + 1) % n]
        cross = (bx - ax) * (point[1] - ay) - (by - ay) * (point[0] - ax)
        if cross != 0:
            current = 1 if cross > 0 else -1
            if sign == 0:
                sign = current
            elif current != sign:
                return False
    return True`,
    testCases: [
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2]], [1, 1]], expected: true },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2]], [2, 2]], expected: true },
      { input: [[[0, 0], [2, 0], [2, 2], [0, 2]], [3, 3]], expected: false },
      { input: [[[0, 0], [4, 0], [2, 4]], [2, 2]], expected: true },
      { input: [[[0, 0], [4, 0], [2, 4]], [1, 3]], expected: false },
    ],
    hint: "Boundary points have a cross product of zero for one edge and are still inside.",
  },
  {
    id: "al-324",
    title: "Axis-Aligned Segment Intersections",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Count how many pairs of segments intersect, where horizontal segments are [x1, x2, y] and vertical segments are [x, y1, y2].\n\nA horizontal and vertical segment cross when the vertical x lies between the horizontal endpoints and the horizontal y lies between the vertical endpoints, including endpoints. Brute force over the two lists is fine.",
    starterCode: `def axis_aligned_intersections(horizontal, vertical):
    # Your code here
    pass`,
    solution: `def axis_aligned_intersections(horizontal, vertical):
    count = 0
    for x1, x2, y in horizontal:
        for x, y1, y2 in vertical:
            if x1 <= x <= x2 and y1 <= y <= y2:
                count += 1
    return count`,
    testCases: [
      { input: [[[0, 2, 1]], [[1, 0, 2]]], expected: 1 },
      { input: [[[0, 2, 1], [0, 2, 1]], [[1, 0, 2]]], expected: 2 },
      { input: [[], [[1, 0, 1]]], expected: 0 },
      { input: [[[0, 1, 0]], [[1, 0, 1]]], expected: 1 },
      { input: [[[0, 1, 0]], [[2, 0, 1]]], expected: 0 },
    ],
    hint: "Parallel segments never intersect, so only horizontal-vertical pairs need checking.",
  },
  {
    id: "al-325",
    title: "Quadtree Insert Depth",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given distinct points in an n by n grid, return the maximum depth reached by recursively splitting the square into four quadrants until each square holds at most one point.\n\nThe depth of a square holding 0 or 1 points is 0; otherwise it is 1 plus the deepest child. Squares of side 1 stop splitting even if points coincide.",
    starterCode: `def quadtree_depth(points, n):
    # Your code here
    pass`,
    solution: `def quadtree_depth(points, n):
    unique = list(set(tuple(p) for p in points))
    def depth(pts, x, y, size):
        if len(pts) <= 1 or size <= 1:
            return 0
        half = size // 2
        buckets = [[], [], [], []]
        for px, py in pts:
            index = (0 if px < x + half else 1) + (0 if py < y + half else 2)
            buckets[index].append((px, py))
        best = 0
        offsets = [(0, 0), (half, 0), (0, half), (half, half)]
        for (dx, dy), bucket in zip(offsets, buckets):
            current = depth(bucket, x + dx, y + dy, half)
            if current > best:
                best = current
        return 1 + best
    return depth(unique, 0, 0, n)`,
    testCases: [
      { input: [[[0, 0], [1, 1]], 2], expected: 1 },
      { input: [[[0, 0]], 4], expected: 0 },
      { input: [[], 4], expected: 0 },
      { input: [[[0, 0], [1, 0], [2, 0], [3, 0]], 4], expected: 2 },
      { input: [[[0, 0], [3, 3], [1, 2], [2, 1]], 4], expected: 1 },
    ],
    hint: "A square only stops splitting early when it holds at most one point or has side 1.",
  },
  {
    id: "al-326",
    title: "Range Minimum Query Sparse Table",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Answer inclusive range minimum queries on a static list of integers, returning the answers in query order.\n\nPrecompute a sparse table where entry k covers intervals of length 2 to the k, then answer each query by combining the two overlapping power-of-two intervals. An empty list returns an empty result.",
    starterCode: `def range_min_sparse(nums, queries):
    # Your code here
    pass`,
    solution: `def range_min_sparse(nums, queries):
    n = len(nums)
    if n == 0:
        return []
    logs = [0] * (n + 1)
    for i in range(2, n + 1):
        logs[i] = logs[i // 2] + 1
    table = [nums[:]]
    k = 1
    while (1 << k) <= n:
        prev = table[-1]
        half = 1 << (k - 1)
        length = n - (1 << k) + 1
        table.append([min(prev[i], prev[i + half]) for i in range(length)])
        k += 1
    results = []
    for left, right in queries:
        length = right - left + 1
        j = logs[length]
        results.append(min(table[j][left], table[j][right - (1 << j) + 1]))
    return results`,
    testCases: [
      { input: [[2, 1, 3, 4], [[0, 3], [1, 2], [2, 3]]], expected: [1, 1, 3] },
      { input: [[5], [[0, 0]]], expected: [5] },
      { input: [[], []], expected: [] },
      { input: [[3, 3, 3], [[0, 2], [1, 1]]], expected: [3, 3] },
      { input: [[-1, -5, 2], [[0, 2], [1, 1]]], expected: [-5, -5] },
    ],
    hint: "Two overlapping blocks of length 2 to the floor of log length cover any range.",
  },
  {
    id: "al-327",
    title: "Burrows-Wheeler Transform",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compute the Burrows-Wheeler transform of a string: append a sentinel dollar sign, sort all rotations of the result, and take the last column of the sorted rotations.\n\nFor example banana becomes annb dollar sign aa. Assume the input contains no dollar sign; the empty string transforms to a single sentinel.",
    starterCode: `def burrows_wheeler_transform(s):
    # Your code here
    pass`,
    solution: `def burrows_wheeler_transform(s):
    text = s + "$"
    rotations = sorted(text[i:] + text[:i] for i in range(len(text)))
    return "".join(row[-1] for row in rotations)`,
    testCases: [
      { input: ["banana"], expected: "annb$aa" },
      { input: [""], expected: "$" },
      { input: ["a"], expected: "a$" },
      { input: ["ab"], expected: "b$a" },
      { input: ["mississippi"], expected: "ipssm$pissii" },
    ],
    hint: "The sentinel makes the rotation order unambiguous and all rotations distinct.",
  },
  {
    id: "al-328",
    title: "Inverse Burrows-Wheeler Transform",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Reconstruct the original string from its Burrows-Wheeler transform, which ends with the sentinel dollar sign.\n\nRepeatedly sort and prepend the transform characters n times to rebuild the rotation table, then return the row that ends with the sentinel, without the sentinel. Return the empty string for empty input.",
    starterCode: `def inverse_bwt(t):
    # Your code here
    pass`,
    solution: `def inverse_bwt(t):
    n = len(t)
    if n == 0:
        return ""
    table = [""] * n
    for _ in range(n):
        table = sorted(t[i] + table[i] for i in range(n))
    for row in table:
        if row.endswith("$"):
            return row[:-1]
    return ""`,
    testCases: [
      { input: ["annb$aa"], expected: "banana" },
      { input: ["a$"], expected: "a" },
      { input: ["$"], expected: "" },
      { input: ["b$a"], expected: "ab" },
      { input: ["ipssm$pissii"], expected: "mississippi" },
    ],
    hint: "After n rounds of stable prepending, the row ending in the sentinel is the original text.",
  },
  {
    id: "al-329",
    title: "FM-Index Rank Query",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a Burrows-Wheeler transformed string t, a character and a prefix length i, count how many times the character appears in the first i characters of t.\n\nThis rank query is the core primitive of an FM-index. Clamp the prefix to the string length and return 0 for an empty string.",
    starterCode: `def fm_index_rank(t, char, i):
    # Your code here
    pass`,
    solution: `def fm_index_rank(t, char, i):
    count = 0
    for k in range(min(i, len(t))):
        if t[k] == char:
            count += 1
    return count`,
    testCases: [
      { input: ["annb$aa", "a", 7], expected: 3 },
      { input: ["annb$aa", "n", 3], expected: 2 },
      { input: ["annb$aa", "$", 7], expected: 1 },
      { input: ["annb$aa", "z", 5], expected: 0 },
      { input: ["", "a", 0], expected: 0 },
    ],
    hint: "Rank is a prefix count, so only characters before index i matter.",
  },
  {
    id: "al-330",
    title: "Move-to-Front Encoding",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Encode a string over the given alphabet using the move-to-front transform: for each character output its current index in the alphabet and then move it to the front.\n\nCharacters not present in the alphabet are undefined behaviour; assume all input characters belong to it. Return the list of indices.",
    starterCode: `def move_to_front_encode(s, alphabet):
    # Your code here
    pass`,
    solution: `def move_to_front_encode(s, alphabet):
    order = list(alphabet)
    result = []
    for ch in s:
        index = order.index(ch)
        result.append(index)
        order.pop(index)
        order.insert(0, ch)
    return result`,
    testCases: [
      { input: ["abc", "abc"], expected: [0, 1, 2] },
      { input: ["banana", "abn"], expected: [1, 1, 2, 1, 1, 1] },
      { input: ["aaa", "abc"], expected: [0, 0, 0] },
      { input: ["cab", "abc"], expected: [2, 1, 2] },
      { input: ["", "abc"], expected: [] },
    ],
    hint: "Frequently used characters drift towards index 0, which is the point of the transform.",
  },
  {
    id: "al-331",
    title: "LZW Encode",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compress a string with the LZW algorithm and return the list of emitted integer codes.\n\nThe dictionary starts with the 256 single-character strings mapped to their character codes, new phrases get the next integer codes starting at 256, and the final phrase is always emitted. Return an empty list for empty input.",
    starterCode: `def lzw_encode(s):
    # Your code here
    pass`,
    solution: `def lzw_encode(s):
    if not s:
        return []
    dictionary = {chr(i): i for i in range(256)}
    next_code = 256
    result = []
    current = s[0]
    for ch in s[1:]:
        candidate = current + ch
        if candidate in dictionary:
            current = candidate
        else:
            result.append(dictionary[current])
            dictionary[candidate] = next_code
            next_code += 1
            current = ch
    result.append(dictionary[current])
    return result`,
    testCases: [
      { input: ["ababab"], expected: [97, 98, 256, 256] },
      { input: ["aaaa"], expected: [97, 256, 97] },
      { input: [""], expected: [] },
      { input: ["abcabcabc"], expected: [97, 98, 99, 256, 258, 257] },
      { input: ["TOBEORNOTTOBEORTOBEORNOT"], expected: [84, 79, 66, 69, 79, 82, 78, 79, 84, 256, 258, 260, 265, 259, 261, 263] },
    ],
    hint: "Only emit a code when the current phrase cannot be extended by the next character.",
  },
  {
    id: "al-332",
    title: "Bit Packing Decode",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Unpack count integers of the given bit width from a list of byte values, where bytes are laid out least-significant first and values are packed continuously without padding.\n\nThe first value occupies the lowest bits of the stream. Assume 1 <= bits <= 8 and that the byte list holds enough bits.",
    starterCode: `def bit_packing_decode(packed, bits, count):
    # Your code here
    pass`,
    solution: `def bit_packing_decode(packed, bits, count):
    stream = 0
    for i, value in enumerate(packed):
        stream |= value << (8 * i)
    mask = (1 << bits) - 1
    return [(stream >> (bits * i)) & mask for i in range(count)]`,
    testCases: [
      { input: [[170], 2, 4], expected: [2, 2, 2, 2] },
      { input: [[1, 2], 8, 2], expected: [1, 2] },
      { input: [[5], 4, 2], expected: [5, 0] },
      { input: [[0, 0], 1, 8], expected: [0, 0, 0, 0, 0, 0, 0, 0] },
      { input: [[129, 3], 1, 16], expected: [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
    ],
    hint: "Build one big integer from the bytes, then shift and mask out each field.",
  },
  {
    id: "al-333",
    title: "CRC32 Checksum",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Compute the standard CRC-32 checksum of a string using the reflected polynomial 0xEDB88320, without any library.\n\nStart from all ones, XOR each character code into the register, shift it right eight times flipping bits with the polynomial on every odd register, and invert the final value. The empty string has checksum 0.",
    starterCode: `def crc32_checksum(data):
    # Your code here
    pass`,
    solution: `def crc32_checksum(data):
    crc = 0xFFFFFFFF
    for ch in data:
        crc ^= ord(ch)
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xEDB88320
            else:
                crc >>= 1
            crc &= 0xFFFFFFFF
    return crc ^ 0xFFFFFFFF`,
    testCases: [
      { input: [""], expected: 0 },
      { input: ["a"], expected: 3904355907 },
      { input: ["hello"], expected: 907060870 },
      { input: ["123456789"], expected: 3421780262 },
      { input: ["The quick brown fox"], expected: 3074782430 },
    ],
    hint: "The check string 123456789 produces the well-known CRC-32 value 0xCBF43926.",
  },
  {
    id: "al-334",
    title: "MurmurHash Finalizer",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Apply the 32-bit finalizer mix from MurmurHash3 to the integer h and return the result.\n\nThe mix XORs the value with its own high half, multiplies by 0x85EBCA6B, XORs again with a shift of 13, multiplies by 0xC2B2AE35, and ends with another XOR shift of 16. All operations keep only the low 32 bits.",
    starterCode: `def murmur_finalizer(h):
    # Your code here
    pass`,
    solution: `def murmur_finalizer(h):
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    h ^= h >> 16
    return h`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1364076727 },
      { input: [123456789], expected: 3126909082 },
      { input: [4294967295], expected: 2180083513 },
      { input: [42], expected: 142593372 },
    ],
    hint: "Every shift is a logical right shift, so mask back to 32 bits after the multiplies.",
  },
  {
    id: "al-335",
    title: "Jump Consistent Hash",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Given a key and a number of buckets, return the bucket chosen by jump consistent hash, which is the algorithm of Lamping and Veach.\n\nStarting from no bucket, repeatedly jump the current key forward with a linear congruential step and compute the next candidate bucket from the top bits of the key. The result is deterministic and changes at most one bucket when the bucket count grows.",
    starterCode: `def jump_consistent_hash(key, buckets):
    # Your code here
    pass`,
    solution: `def jump_consistent_hash(key, buckets):
    b = -1
    j = 0
    while j < buckets:
        b = j
        key = (key * 2862933555777941757 + 1) & ((1 << 64) - 1)
        j = int((b + 1) * ((1 << 31) / ((key >> 33) + 1)))
    return b`,
    testCases: [
      { input: [123456, 1000], expected: 984 },
      { input: [0, 1], expected: 0 },
      { input: [42, 10], expected: 2 },
      { input: [9999, 100], expected: 15 },
      { input: [7, 2], expected: 0 },
    ],
    hint: "The key is updated with 64-bit wraparound before each jump.",
  },
  {
    id: "al-336",
    title: "Weighted Random Selection Seeded",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Pick an index at random from a list of non-negative integer weights using a deterministic linear congruential generator seeded by the given seed.\n\nThe probability of index i is its weight divided by the total weight; walk the cumulative weights and return the first index whose cumulative total exceeds the drawn value. Return -1 when the total weight is 0.",
    starterCode: `def weighted_random_seeded(weights, seed):
    # Your code here
    pass`,
    solution: `def weighted_random_seeded(weights, seed):
    total = sum(weights)
    if total <= 0:
        return -1
    state = seed & 0xFFFFFFFF
    state = (1103515245 * state + 12345) & 0x7FFFFFFF
    target = state % total
    cumulative = 0
    for i, w in enumerate(weights):
        cumulative += w
        if target < cumulative:
            return i
    return len(weights) - 1`,
    testCases: [
      { input: [[1], 42], expected: 0 },
      { input: [[1, 0, 0], 7], expected: 0 },
      { input: [[0, 0, 5], 3], expected: 2 },
      { input: [[1, 1, 1], 0], expected: 0 },
      { input: [[5, 1], 42], expected: 0 },
    ],
    hint: "The cumulative walk is the inverse of the weighted cumulative distribution.",
  },
  {
    id: "al-337",
    title: "Box-Muller Gaussian Pair Seeded",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Generate a pair of independent standard normal values using the Box-Muller transform and two uniform values from a deterministic seeded linear congruential generator.\n\nTake the square root of minus two times the log of the first uniform for the radius and twice pi times the second uniform for the angle, then return the cosine and sine components. Return both values as a list.",
    starterCode: `def box_muller_seeded(seed):
    # Your code here
    pass`,
    solution: `from math import sqrt, cos, sin, pi, log

def box_muller_seeded(seed):
    state = seed & 0xFFFFFFFF
    state = (1103515245 * state + 12345) & 0x7FFFFFFF
    u1 = (state + 1) / (2 ** 31)
    state = (1103515245 * state + 12345) & 0x7FFFFFFF
    u2 = (state + 1) / (2 ** 31)
    radius = (-2 * log(u1)) ** 0.5
    angle = 2 * pi * u2
    return [radius * cos(angle), radius * sin(angle)]`,
    testCases: [
      { input: [0], expected: [-2.757317421369682, -4.065728843223583] },
      { input: [1], expected: [0.519081643367445, 1.0305939400147504] },
      { input: [42], expected: [-1.0319055258013532, -0.12916623646437947] },
      { input: [7], expected: [-0.309379456599555, 0.9673535547282357] },
    ],
    hint: "Adding one to the state and dividing by 2 to the 31 avoids the logarithm of zero.",
  },
  {
    id: "al-338",
    title: "Exponential Sample Seeded",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Draw an exponential random value with the given mean using inverse transform sampling and a deterministic seeded linear congruential generator.\n\nGenerate one uniform value in the open interval from 0 to 1 and return minus the mean times the natural log of one minus that value. A mean of zero always returns zero.",
    starterCode: `def exponential_sample_seeded(mean, seed):
    # Your code here
    pass`,
    solution: `from math import log

def exponential_sample_seeded(mean, seed):
    state = seed & 0xFFFFFFFF
    state = (1103515245 * state + 12345) & 0x7FFFFFFF
    u = (state + 1) / (2 ** 31)
    return -mean * log(1 - u)`,
    testCases: [
      { input: [1.0, 42], expected: 0.8730099789912349 },
      { input: [5.0, 7], expected: 4.5447891162704845 },
      { input: [1.0, 0], expected: 5.74907077897709e-06 },
      { input: [2.5, 123], expected: 0.5745340035424549 },
    ],
    hint: "The inverse CDF of the exponential distribution is minus mean times log of one minus u.",
  },
  {
    id: "al-339",
    title: "Permutation Rank",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the zero-based lexicographic rank of a permutation of distinct integers.\n\nFor each position count how many unused smaller values remain to the right, multiply that count by the factorial of the remaining length, and sum the terms. The identity permutation has rank 0.",
    starterCode: `def permutation_rank(perm):
    # Your code here
    pass`,
    solution: `from math import factorial

def permutation_rank(perm):
    n = len(perm)
    rank = 0
    for i in range(n):
        smaller = sum(1 for j in range(i + 1, n) if perm[j] < perm[i])
        rank += smaller * factorial(n - 1 - i)
    return rank`,
    testCases: [
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[3, 2, 1]], expected: 5 },
      { input: [[2, 1, 3]], expected: 2 },
      { input: [[1, 3, 2]], expected: 1 },
      { input: [[2, 3, 1]], expected: 3 },
    ],
    hint: "Each term counts the permutations that would have come before this choice at that position.",
  },
  {
    id: "al-340",
    title: "Next Permutation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the next lexicographically greater permutation of the list nums, or the smallest permutation when nums is already the largest.\n\nFind the rightmost ascent, swap its first element with the smallest larger value to its right, and reverse the suffix. Return a new list and handle duplicates.",
    starterCode: `def next_permutation(nums):
    # Your code here
    pass`,
    solution: `def next_permutation(nums):
    a = list(nums)
    i = len(a) - 2
    while i >= 0 and a[i] >= a[i + 1]:
        i -= 1
    if i >= 0:
        j = len(a) - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
    left, right = i + 1, len(a) - 1
    while left < right:
        a[left], a[right] = a[right], a[left]
        left += 1
        right -= 1
    return a`,
    testCases: [
      { input: [[1, 2, 3]], expected: [1, 3, 2] },
      { input: [[3, 2, 1]], expected: [1, 2, 3] },
      { input: [[1, 1, 5]], expected: [1, 5, 1] },
      { input: [[1]], expected: [1] },
      { input: [[2, 3, 1]], expected: [3, 1, 2] },
    ],
    hint: "Reversing the descending suffix turns it into the smallest possible tail.",
  },
  {
    id: "al-341",
    title: "Previous Permutation",
    category: "Algorithms",
    difficulty: "Medium",
    description:
      "Return the previous lexicographically smaller permutation of the list nums, or the largest permutation when nums is already the smallest.\n\nFind the rightmost descent, swap its first element with the largest smaller value to its right, and reverse the suffix. Return a new list and handle duplicates.",
    starterCode: `def previous_permutation(nums):
    # Your code here
    pass`,
    solution: `def previous_permutation(nums):
    a = list(nums)
    i = len(a) - 2
    while i >= 0 and a[i] <= a[i + 1]:
        i -= 1
    if i >= 0:
        j = len(a) - 1
        while a[j] >= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
    left, right = i + 1, len(a) - 1
    while left < right:
        a[left], a[right] = a[right], a[left]
        left += 1
        right -= 1
    return a`,
    testCases: [
      { input: [[1, 3, 2]], expected: [1, 2, 3] },
      { input: [[1, 2, 3]], expected: [3, 2, 1] },
      { input: [[2, 3, 1]], expected: [2, 1, 3] },
      { input: [[1, 1, 5]], expected: [5, 1, 1] },
      { input: [[1]], expected: [1] },
    ],
    hint: "It mirrors next permutation with both comparisons reversed.",
  },
  {
    id: "al-342",
    title: "Rotating Calipers Diameter",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the squared diameter of a set of points: the maximum squared distance between any two of them, found from the convex hull of the set.\n\nBuild the hull with monotone chain, then for each hull edge advance the farthest antipodal vertex while the triangle area increases, testing the distances to both edge endpoints. Return 0 for fewer than two distinct points.",
    starterCode: `def rotating_calipers_diameter(points):
    # Your code here
    pass`,
    solution: `def rotating_calipers_diameter(points):
    pts = sorted(set(tuple(p) for p in points))
    if len(pts) < 2:
        return 0
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def dist2(a, b):
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    if len(hull) == 2:
        return dist2(hull[0], hull[1])
    n = len(hull)
    best = 0
    j = 1
    for i in range(n):
        ni = (i + 1) % n
        while abs(cross(hull[i], hull[ni], hull[(j + 1) % n])) > abs(cross(hull[i], hull[ni], hull[j])):
            j = (j + 1) % n
        for k in (i, ni):
            d = dist2(hull[k], hull[j])
            if d > best:
                best = d
    return best`,
    testCases: [
      { input: [[[0, 0], [1, 0], [1, 1], [0, 1]]], expected: 2 },
      { input: [[[0, 0], [3, 0], [0, 4]]], expected: 25 },
      { input: [[[0, 0], [1, 1], [2, 2]]], expected: 8 },
      { input: [[[5, 5]]], expected: 0 },
      { input: [[[0, 0], [2, 0], [1, 3]]], expected: 10 },
    ],
    hint: "The diameter of a point set is always achieved by two hull vertices.",
  },
  {
    id: "al-343",
    title: "Rectangle Union Area",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given axis-aligned rectangles as [x1, y1, x2, y2], return the total area covered by their union, counting overlaps only once.\n\nCompress the x coordinates into strips, and for each strip merge the y intervals of all rectangles that fully span it. Add width times merged height for every strip.",
    starterCode: `def rectangle_union_area(rectangles):
    # Your code here
    pass`,
    solution: `def rectangle_union_area(rectangles):
    if not rectangles:
        return 0
    xs = sorted(set([r[0] for r in rectangles] + [r[2] for r in rectangles]))
    total = 0
    for i in range(len(xs) - 1):
        left, right = xs[i], xs[i + 1]
        intervals = []
        for x1, y1, x2, y2 in rectangles:
            if x1 <= left and right <= x2:
                intervals.append((y1, y2))
        if not intervals:
            continue
        intervals.sort()
        merged = 0
        current_start, current_end = intervals[0]
        for start, end in intervals[1:]:
            if start > current_end:
                merged += current_end - current_start
                current_start, current_end = start, end
            elif end > current_end:
                current_end = end
        merged += current_end - current_start
        total += (right - left) * merged
    return total`,
    testCases: [
      { input: [[[0, 0, 2, 2], [1, 1, 3, 3]]], expected: 7 },
      { input: [[[0, 0, 2, 2], [2, 0, 4, 2]]], expected: 8 },
      { input: [[[0, 0, 1, 1]]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[[0, 0, 3, 3], [1, 1, 2, 2]]], expected: 9 },
    ],
    hint: "Merging y intervals inside each x strip handles any amount of overlap.",
  },
  {
    id: "al-344",
    title: "Skyline Outline",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given buildings as [left, right, height], return the skyline as a list of [x, height] key points where the silhouette changes, including drops to height 0.\n\nSweep the x coordinates with a max-heap of active building heights, discarding buildings whose right edge has passed. Emit a key point only when the current maximum height differs from the last recorded height.",
    starterCode: `def skyline_outline(buildings):
    # Your code here
    pass`,
    solution: `import heapq

def skyline_outline(buildings):
    events = []
    for left, right, height in buildings:
        events.append((left, -height, right))
        events.append((right, 0, 0))
    events.sort()
    heap = []
    result = []
    index = 0
    while index < len(events):
        x = events[index][0]
        while index < len(events) and events[index][0] == x:
            _, neg_height, right = events[index]
            if neg_height < 0:
                heapq.heappush(heap, (neg_height, right))
            index += 1
        while heap and heap[0][1] <= x:
            heapq.heappop(heap)
        height = -heap[0][0] if heap else 0
        if not result or result[-1][1] != height:
            result.append([x, height])
    return result`,
    testCases: [
      { input: [[[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]], expected: [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]] },
      { input: [[[0, 2, 3], [2, 4, 3], [4, 6, 3]]], expected: [[0, 3], [6, 0]] },
      { input: [[]], expected: [] },
      { input: [[[1, 2, 1]]], expected: [[1, 1], [2, 0]] },
      { input: [[[0, 1, 2], [1, 2, 2]]], expected: [[0, 2], [2, 0]] },
    ],
    hint: "Storing negative heights lets a min-heap act as a max-heap.",
  },
  {
    id: "al-345",
    title: "Minimum Enclosing Circle",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Return the smallest circle enclosing all points as [centre_x, centre_y, radius], or an empty list for no points.\n\nThe optimal circle is determined by either one point, a diameter through two points, or the circumcircle of three points, so test every one, two and three point candidate and keep the smallest that contains all points. Return floats.",
    starterCode: `def min_enclosing_circle(points):
    # Your code here
    pass`,
    solution: `def min_enclosing_circle(points):
    if not points:
        return []
    n = len(points)
    best = None
    def try_circle(cx, cy, r2):
        nonlocal best
        for x, y in points:
            if (x - cx) ** 2 + (y - cy) ** 2 > r2 + 1e-9:
                return
        if best is None or r2 < best[2] - 1e-9:
            best = [cx, cy, r2]
    for x, y in points:
        try_circle(x, y, 0)
    for i in range(n):
        for j in range(i + 1, n):
            x1, y1 = points[i]
            x2, y2 = points[j]
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            r2 = ((x1 - x2) ** 2 + (y1 - y2) ** 2) / 4
            try_circle(cx, cy, r2)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                x1, y1 = points[i]
                x2, y2 = points[j]
                x3, y3 = points[k]
                d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
                if d == 0:
                    continue
                ux = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / d
                uy = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / d
                r2 = (x1 - ux) ** 2 + (y1 - uy) ** 2
                try_circle(ux, uy, r2)
    return [best[0], best[1], best[2] ** 0.5]`,
    testCases: [
      { input: [[[0, 0], [2, 0], [0, 2], [2, 2]]], expected: [1.0, 1.0, 1.4142135623730951] },
      { input: [[[0, 0], [1, 0]]], expected: [0.5, 0.0, 0.5] },
      { input: [[[5, 5]]], expected: [5, 5, 0.0] },
      { input: [[[0, 0], [3, 0], [0, 4]]], expected: [1.5, 2.0, 2.5] },
    ],
    hint: "Collinear triples have a zero denominator and can be skipped safely.",
  },
  {
    id: "al-346",
    title: "Offline Distinct Queries",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given nums and inclusive queries [left, right], return the number of distinct values inside each queried range, in the original query order.\n\nProcess queries sorted by right endpoint with a Fenwick tree that keeps a 1 only at the last seen position of each value: when a value reappears, remove its previous position and add the new one. A range sum then counts distinct values.",
    starterCode: `def offline_distinct_queries(nums, queries):
    # Your code here
    pass`,
    solution: `def offline_distinct_queries(nums, queries):
    n = len(nums)
    tree = [0] * (n + 1)
    def update(i, delta):
        while i <= n:
            tree[i] += delta
            i += i & (-i)
    def query(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & (-i)
        return total
    order = sorted(range(len(queries)), key=lambda q: queries[q][1])
    last = {}
    results = [0] * len(queries)
    position = 0
    for q in order:
        left, right = queries[q][0], queries[q][1]
        while position <= right:
            value = nums[position]
            if value in last:
                update(last[value] + 1, -1)
            last[value] = position
            update(position + 1, 1)
            position += 1
        results[q] = query(right + 1) - query(left)
    return results`,
    testCases: [
      { input: [[1, 2, 1, 3], [[0, 3], [1, 2], [2, 3]]], expected: [3, 2, 2] },
      { input: [[], []], expected: [] },
      { input: [[1, 1, 1], [[0, 2]]], expected: [1] },
      { input: [[1, 2, 3], [[0, 2], [1, 1]]], expected: [3, 1] },
      { input: [[5, 5, 5, 5], [[0, 3], [1, 2]]], expected: [1, 1] },
    ],
    hint: "Keeping only the latest occurrence makes a prefix sum count each distinct value once.",
  },
  {
    id: "al-347",
    title: "Kth Smallest in a Range",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Answer queries [left, right, k] returning the k-th smallest value in the inclusive subarray nums[left..right].\n\nBuild a merge sort tree over the array, then binary search the answer and count how many elements in the range are at most a candidate using the tree. Return the answers in query order.",
    starterCode: `def kth_smallest_in_range(nums, queries):
    # Your code here
    pass`,
    solution: `from bisect import bisect_right

def kth_smallest_in_range(nums, queries):
    n = len(nums)
    size = 1
    while size < n:
        size *= 2
    tree = [[] for _ in range(2 * size)]
    for i, x in enumerate(nums):
        tree[size + i] = [x]
    for i in range(size - 1, 0, -1):
        tree[i] = sorted(tree[2 * i] + tree[2 * i + 1])
    def count_le(left, right, value):
        left += size
        right += size + 1
        total = 0
        while left < right:
            if left & 1:
                total += bisect_right(tree[left], value)
                left += 1
            if right & 1:
                right -= 1
                total += bisect_right(tree[right], value)
            left >>= 1
            right >>= 1
        return total
    results = []
    for left, right, k in queries:
        lo = min(nums[left:right + 1])
        hi = max(nums[left:right + 1])
        while lo < hi:
            mid = (lo + hi) // 2
            if count_le(left, right, mid) >= k:
                hi = mid
            else:
                lo = mid + 1
        results.append(lo)
    return results`,
    testCases: [
      { input: [[1, 5, 2, 6, 3, 7, 4], [[2, 5, 3], [0, 6, 1], [4, 4, 1]]], expected: [6, 1, 3] },
      { input: [[1], [[0, 0, 1]]], expected: [1] },
      { input: [[3, 3, 3], [[0, 2, 2]]], expected: [3] },
      { input: [[5, 1, 4, 2, 3], [[0, 4, 5], [1, 3, 2]]], expected: [5, 2] },
      { input: [[2, 2], [[0, 1, 1]]], expected: [2] },
    ],
    hint: "Counting elements at most a candidate over a range lets you binary search the value.",
  },
  {
    id: "al-348",
    title: "Mo's Algorithm Query Order",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given the array length n and queries as [left, right] pairs, return the indices of the queries in the order Mo's algorithm would process them.\n\nThe left endpoint is bucketed into blocks of size roughly the square root of n, and within a block the right endpoint is sorted ascending for even blocks and descending for odd blocks, which keeps the right pointer mostly monotone.",
    starterCode: `def mos_query_order(n, queries):
    # Your code here
    pass`,
    solution: `def mos_query_order(n, queries):
    block = max(1, int(n ** 0.5)) if n > 0 else 1
    def key(index):
        left, right = queries[index]
        block_index = left // block
        if block_index % 2 == 0:
            return (block_index, right)
        return (block_index, -right)
    return sorted(range(len(queries)), key=key)`,
    testCases: [
      { input: [10, [[0, 9], [1, 3], [2, 5], [4, 8], [0, 0], [5, 9]]], expected: [4, 1, 2, 0, 5, 3] },
      { input: [4, [[0, 3], [1, 2], [0, 0]]], expected: [2, 1, 0] },
      { input: [1, [[0, 0]]], expected: [0] },
      { input: [6, []], expected: [] },
      { input: [9, [[0, 8], [1, 1], [2, 2]]], expected: [1, 2, 0] },
    ],
    hint: "Python's sort is stable, so equal keys keep their original relative order.",
  },
  {
    id: "al-349",
    title: "Huffman Canonical Codes",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Given symbol-frequency pairs, build a Huffman tree and return a dictionary of canonical prefix codes.\n\nMerge the two lightest nodes, breaking ties deterministically by insertion order, then assign code lengths from the tree and hand out canonical codes sorted by length and then symbol. A single symbol gets the code 0 and no symbols gives an empty dictionary.",
    starterCode: `def huffman_canonical_codes(pairs):
    # Your code here
    pass`,
    solution: `import heapq

def huffman_canonical_codes(pairs):
    if not pairs:
        return {}
    if len(pairs) == 1:
        return {pairs[0][0]: "0"}
    heap = []
    counter = 0
    for symbol, freq in pairs:
        heapq.heappush(heap, (freq, counter, [(symbol, 0)]))
        counter += 1
    while len(heap) > 1:
        freq_a, _, items_a = heapq.heappop(heap)
        freq_b, _, items_b = heapq.heappop(heap)
        merged = [(sym, depth + 1) for sym, depth in items_a] + [(sym, depth + 1) for sym, depth in items_b]
        heapq.heappush(heap, (freq_a + freq_b, counter, merged))
        counter += 1
    _, _, items = heap[0]
    lengths = sorted((depth, sym) for sym, depth in items)
    codes = {}
    code = 0
    previous = 0
    for depth, sym in lengths:
        code <<= depth - previous
        codes[sym] = format(code, "0{}b".format(depth))
        code += 1
        previous = depth
    return codes`,
    testCases: [
      { input: [[["a", 5], ["b", 2], ["c", 1]]], expected: {"a": "0", "b": "10", "c": "11"} },
      { input: [[["a", 1]]], expected: {"a": "0"} },
      { input: [[]], expected: {} },
      { input: [[["a", 1], ["b", 1], ["c", 1], ["d", 1]]], expected: {"a": "00", "b": "01", "c": "10", "d": "11"} },
      { input: [[["x", 10], ["y", 5], ["z", 5], ["w", 1]]], expected: {"x": "0", "z": "10", "w": "110", "y": "111"} },
    ],
    hint: "Canonical codes are assigned in order of increasing length, incrementing the previous code after shifting it.",
  },
  {
    id: "al-350",
    title: "Arithmetic Coding Interval",
    category: "Algorithms",
    difficulty: "Hard",
    description:
      "Encode a message with arithmetic coding given a list of symbols and their positive integer weights, and return the final interval as [low, high] floats within [0, 1].\n\nEach symbol owns a subinterval of proportional width; encoding narrows the current interval by that subinterval for every character. Use exact fractions internally and return floats. The empty message gives [0.0, 1.0].",
    starterCode: `def arithmetic_coding_interval(message, symbols, weights):
    # Your code here
    pass`,
    solution: `from fractions import Fraction

def arithmetic_coding_interval(message, symbols, weights):
    total = sum(weights)
    low = Fraction(0)
    high = Fraction(1)
    for ch in message:
        index = symbols.index(ch)
        cumulative = Fraction(sum(weights[:index]), total)
        width = Fraction(weights[index], total)
        span = high - low
        new_low = low + span * cumulative
        new_high = low + span * (cumulative + width)
        low, high = new_low, new_high
    return [float(low), float(high)]`,
    testCases: [
      { input: ["ab", ["a", "b"], [1, 1]], expected: [0.25, 0.5] },
      { input: ["xyz", ["x", "y", "z"], [1, 1, 2]], expected: [0.09375, 0.125] },
      { input: ["aaa", ["a"], [1]], expected: [0.0, 1.0] },
      { input: ["", ["a"], [1]], expected: [0.0, 1.0] },
      { input: ["ba", ["a", "b"], [1, 1]], expected: [0.5, 0.75] },
    ],
    hint: "Each character scales the remaining interval by its own probability subinterval.",
  },
];
