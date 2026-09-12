import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-271",
    title: "Huffman Coded Size in Bytes",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Build a Huffman code from the given symbol frequencies and return the total compressed size in whole bytes. The total bit count is the sum of frequency times codeword length, which equals the sum of all merge weights for two or more symbols, while a lone symbol costs one bit per occurrence. Return 0 for an empty frequency list.",
    starterCode: `import heapq
def huffman_size_bytes(freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_size_bytes(freqs):
    if not freqs:
        return 0
    if len(freqs) == 1:
        bits = freqs[0]
    else:
        heap = [(f, i) for i, f in enumerate(freqs)]
        heapq.heapify(heap)
        order = len(freqs)
        bits = 0
        while len(heap) > 1:
            w1, _ = heapq.heappop(heap)
            w2, _ = heapq.heappop(heap)
            w = w1 + w2
            bits += w
            heapq.heappush(heap, (w, order))
            order += 1
    return (bits + 7) // 8`,
    testCases: [
      { input: [[5, 2, 1]], expected: 2 },
      { input: [[1, 1]], expected: 1 },
      { input: [[8]], expected: 1 },
      { input: [[1, 1, 1, 1]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "The total Huffman bit count equals the sum of every merge weight when there are at least two symbols.",
  },
  {
    id: "info-272",
    title: "Huffman Length Variance",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Build a Huffman code from a list of frequencies using a min-heap keyed by frequency and then creation order, and return the variance of the codeword lengths under the frequency distribution. The variance is E[l^2] - (E[l])^2 where each symbol is weighted by its normalized frequency. Return 0.0 for fewer than two symbols.",
    starterCode: `import heapq
def huffman_length_variance(freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_length_variance(freqs):
    if len(freqs) <= 1:
        return 0.0
    n = len(freqs)
    lengths = [0] * n
    heap = [(f, i, [i]) for i, f in enumerate(freqs)]
    heapq.heapify(heap)
    order = n
    while len(heap) > 1:
        w1, _, a = heapq.heappop(heap)
        w2, _, b = heapq.heappop(heap)
        for idx in a + b:
            lengths[idx] += 1
        heapq.heappush(heap, (w1 + w2, order, a + b))
        order += 1
    total = float(sum(freqs))
    p = [f / total for f in freqs]
    mean = sum(pi * li for pi, li in zip(p, lengths))
    return sum(pi * (li - mean) ** 2 for pi, li in zip(p, lengths))`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: 0.0 },
      { input: [[5, 2, 1]], expected: 0.234375 },
      { input: [[1, 1]], expected: 0.0 },
      { input: [[3, 3, 3, 1, 1]], expected: 0.14876033057851237 },
    ],
    hint: "All codeword lengths are equal only for a uniform distribution on a power-of-two alphabet.",
  },
  {
    id: "info-273",
    title: "Huffman Entropy Gap",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the gap in bits between the expected Huffman codeword length and the source entropy, L - H(freqs). Build the Huffman lengths with a min-heap keyed by frequency and then creation order, and compute H over the normalized frequencies. Return 0.0 for fewer than two symbols and clamp tiny negative floating-point noise to 0.0.",
    starterCode: `import heapq, math
def huffman_entropy_gap(freqs):
    # Your code here
    pass`,
    solution: `import heapq, math
def huffman_entropy_gap(freqs):
    if len(freqs) <= 1:
        return 0.0
    n = len(freqs)
    lengths = [0] * n
    heap = [(f, i, [i]) for i, f in enumerate(freqs)]
    heapq.heapify(heap)
    order = n
    while len(heap) > 1:
        w1, _, a = heapq.heappop(heap)
        w2, _, b = heapq.heappop(heap)
        for idx in a + b:
            lengths[idx] += 1
        heapq.heappush(heap, (w1 + w2, order, a + b))
        order += 1
    total = float(sum(freqs))
    p = [f / total for f in freqs]
    L = sum(pi * li for pi, li in zip(p, lengths))
    H = -sum(pi * math.log2(pi) for pi in p if pi > 0)
    return max(0.0, L - H)`,
    testCases: [
      { input: [[1, 1]], expected: 0.0 },
      { input: [[5, 2, 1]], expected: 0.07620505930460153 },
      { input: [[4, 1]], expected: 0.2780719051126377 },
      { input: [[3, 3, 3, 1, 1]], expected: 0.019174063770921457 },
    ],
    hint: "The expected Huffman length is always at least the entropy, and the gap is below one bit.",
  },
  {
    id: "info-274",
    title: "Shannon Code Expected Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the expected codeword length of a Shannon code for the given symbol probabilities. Each symbol gets length ceil(-log2(p)), skipping symbols with p <= 0, and a probability of 1.0 gets length 0. Return the weighted sum sum(p * length).",
    starterCode: `import math
def shannon_expected_length(probs):
    # Your code here
    pass`,
    solution: `import math
def shannon_expected_length(probs):
    total = 0.0
    for p in probs:
        if p <= 0.0:
            continue
        total += p * math.ceil(max(0.0, -math.log2(p)))
    return total`,
    testCases: [
      { input: [[0.5, 0.25, 0.25]], expected: 1.5 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.0, 1.0]], expected: 0.0 },
    ],
    hint: "Shannon's code assigns each symbol ceil(-log2 p) bits and is within one bit of the entropy.",
  },
  {
    id: "info-275",
    title: "Arithmetic Coding Bits Needed",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "After arithmetic coding, the final interval has some width. Return the number of bits needed to distinguish a point in that interval, which is ceil(-log2(width)). Assume 0 < width <= 1, so an interval of width 1.0 needs 0 bits.",
    starterCode: `import math
def arithmetic_bits_needed(width):
    # Your code here
    pass`,
    solution: `import math
def arithmetic_bits_needed(width):
    return max(0, math.ceil(-math.log2(width) - 1e-9))`,
    testCases: [
      { input: [0.125], expected: 3 },
      { input: [0.3], expected: 2 },
      { input: [1.0], expected: 0 },
      { input: [0.01], expected: 7 },
      { input: [0.5], expected: 1 },
    ],
    hint: "Halving the interval width adds exactly one bit to the description.",
  },
  {
    id: "info-276",
    title: "Adaptive Arithmetic Update",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "An adaptive arithmetic coder keeps running symbol counts and updates them after every symbol. Given the current count list and the index of the observed symbol, increment that count and return the new normalized probability list. Assume the symbol index is valid and the counts are non-negative.",
    starterCode: `def adaptive_arithmetic_update(counts, symbol):
    # Your code here
    pass`,
    solution: `def adaptive_arithmetic_update(counts, symbol):
    new = list(counts)
    new[symbol] += 1
    total = float(sum(new))
    return [c / total for c in new]`,
    testCases: [
      { input: [[1, 1], 0], expected: [0.6666666666666666, 0.3333333333333333] },
      { input: [[0, 3, 1], 1], expected: [0.0, 0.8, 0.2] },
      { input: [[0, 0], 1], expected: [0.0, 1.0] },
      { input: [[2, 0, 0, 0], 3], expected: [0.6666666666666666, 0.0, 0.0, 0.3333333333333333] },
    ],
    hint: "The increment happens before the probabilities are normalized.",
  },
  {
    id: "info-277",
    title: "LZ77 Match Bit Savings",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Each LZ77 token is a triple [offset, length, next_char]. A token with length > 0 replaces that many literal characters, so its saving is length * literal_bits - offset_bits - length_bits, while pure literals save nothing. Return the total savings in bits over all triples, which may be negative for short matches.",
    starterCode: `def lz77_match_savings(triples, offset_bits, length_bits, literal_bits):
    # Your code here
    pass`,
    solution: `def lz77_match_savings(triples, offset_bits, length_bits, literal_bits):
    total = 0
    for _, length, _ in triples:
        if length > 0:
            total += length * literal_bits - offset_bits - length_bits
    return total`,
    testCases: [
      { input: [[[0, 3, "x"], [0, 0, "y"], [2, 4, ""]], 5, 4, 8], expected: 38 },
      { input: [[[1, 1, "a"]], 8, 8, 8], expected: -8 },
      { input: [[], 5, 4, 8], expected: 0 },
      { input: [[[0, 0, "a"]], 5, 4, 8], expected: 0 },
    ],
    hint: "Only matched runs replace literals, and each reference costs a fixed offset plus length field.",
  },
  {
    id: "info-278",
    title: "LZ78 Index Cost",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Parse a string with LZ78, emitting the shortest prefix starting at the current position that is not yet in the dictionary. An index into a dictionary of d stored phrases costs ceil(log2(d + 1)) bits, because index 0 points at the empty prefix. Return the total number of index bits, and 0 for the empty string.",
    starterCode: `import math
def lz78_index_cost(s):
    # Your code here
    pass`,
    solution: `import math
def lz78_index_cost(s):
    d = set()
    total = 0
    i = 0
    n = len(s)
    while i < n:
        j = i + 1
        while j < n and s[i:j] in d:
            j += 1
        total += math.ceil(math.log2(len(d) + 1))
        d.add(s[i:j])
        i = j
    return total`,
    testCases: [
      { input: ["ABABABA"], expected: 5 },
      { input: ["AAAAAAAA"], expected: 5 },
      { input: [""], expected: 0 },
      { input: ["A"], expected: 0 },
    ],
    hint: "The first phrase always references the empty prefix, so it costs zero index bits.",
  },
  {
    id: "info-279",
    title: "LZW Code Count",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Run the LZW encoder starting from a dictionary containing every single character that appears in the input. Emit the code for the current string whenever adding the next character would create an unknown phrase, and flush one final code at the end. Return the number of codes emitted, and 0 for the empty string.",
    starterCode: `def lzw_code_count(s):
    # Your code here
    pass`,
    solution: `def lzw_code_count(s):
    if not s:
        return 0
    d = set(s)
    w = s[0]
    count = 0
    for c in s[1:]:
        if w + c in d:
            w = w + c
        else:
            count += 1
            d.add(w + c)
            w = c
    return count + 1`,
    testCases: [
      { input: ["AAA"], expected: 2 },
      { input: ["ABABABA"], expected: 4 },
      { input: [""], expected: 0 },
      { input: ["A"], expected: 1 },
      { input: ["TOBEORNOTTOBEORTOBEORNOT"], expected: 16 },
    ],
    hint: "A repeated pattern makes the dictionary grow, so fewer codes are needed than there are characters.",
  },
  {
    id: "info-280",
    title: "RLE Compression Ratio",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Run-length encoding stores every maximal run as a value plus a run count, so it needs 2 * runs integers for n input values. Return the ratio of encoded length to original length, which is 2 * runs / n. Return 0.0 for an empty list.",
    starterCode: `def rle_compression_ratio(values):
    # Your code here
    pass`,
    solution: `def rle_compression_ratio(values):
    if not values:
        return 0.0
    runs = 1
    for i in range(1, len(values)):
        if values[i] != values[i - 1]:
            runs += 1
    return 2.0 * runs / len(values)`,
    testCases: [
      { input: [[1, 1, 1, 1]], expected: 0.5 },
      { input: [[1, 2, 3]], expected: 2.0 },
      { input: [[1, 1, 2, 2, 2, 1]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Long runs make the ratio small, while alternating values make it approach 2.",
  },
  {
    id: "info-281",
    title: "Delta Encoding Savings",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compare raw fixed-width storage of a sorted list of non-negative integers against delta encoding, where the first value is stored relative to 0. Return saved bits, the sum of the bit lengths of the raw values minus the sum of the bit lengths of the consecutive differences. Return 0 for an empty list.",
    starterCode: `def delta_encoding_savings(values):
    # Your code here
    pass`,
    solution: `def delta_encoding_savings(values):
    raw = sum(v.bit_length() for v in values)
    prev = 0
    delta = 0
    for v in values:
        delta += (v - prev).bit_length()
        prev = v
    return raw - delta`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 4 },
      { input: [[10, 11, 12]], expected: 6 },
      { input: [[100, 200, 300]], expected: 3 },
      { input: [[0, 0, 0]], expected: 0 },
      { input: [[1, 256, 257]], expected: 9 },
    ],
    hint: "Sorted inputs have small gaps, so the differences need many fewer bits than the values.",
  },
  {
    id: "info-282",
    title: "BWT Last Column",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the Burrows-Wheeler transform last column without a sentinel. Sort all n rotations of the string lexicographically and return the concatenation of their final characters. Return an empty string for empty input.",
    starterCode: `def bwt_last_column(s):
    # Your code here
    pass`,
    solution: `def bwt_last_column(s):
    n = len(s)
    if n == 0:
        return ""
    rotations = sorted(s[i:] + s[:i] for i in range(n))
    return "".join(r[-1] for r in rotations)`,
    testCases: [
      { input: ["banana"], expected: "nnbaaa" },
      { input: ["mississippi"], expected: "pssmipissii" },
      { input: [""], expected: "" },
      { input: ["a"], expected: "a" },
    ],
    hint: "Sort the rotations, not the suffixes; for a general string they are different sets.",
  },
  {
    id: "info-283",
    title: "Move-to-Front Rank",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Apply move-to-front coding to a sequence using a given initial alphabet order. For each symbol, output its current index in the list and then move it to the front. Assume every symbol in the sequence appears in the alphabet and that alphabet entries are distinct. Return the list of ranks.",
    starterCode: `def mtf_ranks(seq, alphabet):
    # Your code here
    pass`,
    solution: `def mtf_ranks(seq, alphabet):
    lst = list(alphabet)
    out = []
    for x in seq:
        r = lst.index(x)
        out.append(r)
        lst.pop(r)
        lst.insert(0, x)
    return out`,
    testCases: [
      { input: [[1, 1, 0], [0, 1]], expected: [1, 0, 1] },
      { input: [[0, 1, 2, 2], [0, 1, 2]], expected: [0, 1, 2, 0] },
      { input: [[], [0, 1]], expected: [] },
      { input: [["b", "a", "b"], ["a", "b"]], expected: [1, 1, 1] },
    ],
    hint: "Frequently used symbols drift toward rank 0, making later ranks cheap.",
  },
  {
    id: "info-284",
    title: "MTF Entropy Estimate",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Transform a sequence with move-to-front coding and then estimate its compressibility as the empirical Shannon entropy in bits of the rank sequence. Return 0.0 for an empty sequence. Use the given initial alphabet order for the move-to-front step.",
    starterCode: `import math
def mtf_entropy(seq, alphabet):
    # Your code here
    pass`,
    solution: `import math
def mtf_entropy(seq, alphabet):
    if not seq:
        return 0.0
    lst = list(alphabet)
    ranks = []
    for x in seq:
        r = lst.index(x)
        ranks.append(r)
        lst.pop(r)
        lst.insert(0, x)
    n = len(ranks)
    counts = {}
    for r in ranks:
        counts[r] = counts.get(r, 0) + 1
    H = 0.0
    for c in counts.values():
        p = c / n
        H -= p * math.log2(p)
    return H`,
    testCases: [
      { input: [["a", "a", "a", "a", "a"], ["a", "b"]], expected: 0.0 },
      { input: [["a", "b", "a", "b", "a", "b"], ["a", "b"]], expected: 0.6500224216483541 },
      { input: [[], ["a", "b"]], expected: 0.0 },
      { input: [["a"], ["a"]], expected: 0.0 },
    ],
    hint: "Clustered symbols produce mostly low ranks, which lowers the entropy.",
  },
  {
    id: "info-285",
    title: "Golomb Coding Parameter",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "For a geometric source P(k) = (1 - p) * p^k, the optimal Golomb modulus m is the smallest integer with p^m <= 1/2, that is m = ceil(-1 / log2(p)), never below 1. Return that parameter for 0 < p < 1, and 1 when p <= 0 or p >= 1.",
    starterCode: `import math
def golomb_parameter(p):
    # Your code here
    pass`,
    solution: `import math
def golomb_parameter(p):
    if p <= 0.0 or p >= 1.0:
        return 1
    return max(1, math.ceil(-1.0 / math.log2(p) - 1e-9))`,
    testCases: [
      { input: [0.5], expected: 1 },
      { input: [0.9], expected: 7 },
      { input: [0.25], expected: 1 },
      { input: [0.1], expected: 1 },
      { input: [0.7], expected: 2 },
    ],
    hint: "Pick m so that the geometric probability at m is about one half.",
  },
  {
    id: "info-286",
    title: "Rice Remainder Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Encode a non-negative integer n with a Rice code of parameter k >= 1. The quotient q = n >> k is written in unary using q + 1 bits and the k-bit remainder is appended, so the total codeword length is q + 1 + k. Return that length.",
    starterCode: `def rice_remainder_length(n, k):
    # Your code here
    pass`,
    solution: `def rice_remainder_length(n, k):
    return (n >> k) + 1 + k`,
    testCases: [
      { input: [0, 3], expected: 4 },
      { input: [8, 3], expected: 5 },
      { input: [100, 3], expected: 16 },
      { input: [5, 1], expected: 4 },
    ],
    hint: "The unary part grows with the quotient while the binary remainder is always k bits.",
  },
  {
    id: "info-287",
    title: "Elias Gamma Code Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the length in bits of the Elias gamma code for n >= 1. The code writes floor(log2(n)) leading zeros, then the binary representation of n, so the length is 2 * floor(log2(n)) + 1. Return 0 for n <= 0.",
    starterCode: `def elias_gamma_length(n):
    # Your code here
    pass`,
    solution: `def elias_gamma_length(n):
    return 2 * (n.bit_length() - 1) + 1`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 3 },
      { input: [7], expected: 5 },
      { input: [8], expected: 7 },
      { input: [100], expected: 13 },
    ],
    hint: "n.bit_length() - 1 is floor(log2(n)) for n >= 1.",
  },
  {
    id: "info-288",
    title: "Elias Delta Code Length",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the length in bits of the Elias delta code for n >= 1. With L = floor(log2(n)) + 1 equal to the bit length of n, the code stores L using a gamma codeword and then the remaining L - 1 bits, for a total of gamma_length(L) + L - 1. Return 0 for n <= 0.",
    starterCode: `def elias_delta_length(n):
    # Your code here
    pass`,
    solution: `def elias_delta_length(n):
    L = n.bit_length()
    return 2 * (L.bit_length() - 1) + 1 + (L - 1)`,
    testCases: [
      { input: [1], expected: 1 },
      { input: [2], expected: 4 },
      { input: [8], expected: 8 },
      { input: [100], expected: 11 },
      { input: [7], expected: 5 },
    ],
    hint: "Delta coding first encodes the length of the number with a gamma code.",
  },
  {
    id: "info-289",
    title: "Fibonacci Code Length",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Use the Fibonacci sequence F1 = 1, F2 = 2, Fk = Fk-1 + Fk-2 and the Zeckendorf representation of n as a sum of non-consecutive Fibonacci numbers. If i is the largest index used, the Fibonacci codeword has i bits plus one terminating bit, so its length is i + 1. Return 0 for n <= 0.",
    starterCode: `def fibonacci_code_length(n):
    # Your code here
    pass`,
    solution: `def fibonacci_code_length(n):
    if n <= 0:
        return 0
    fib = [1, 2]
    while fib[-1] + fib[-2] <= n:
        fib.append(fib[-1] + fib[-2])
    idx_max = 0
    rem = n
    for i in range(len(fib) - 1, -1, -1):
        if fib[i] <= rem:
            rem -= fib[i]
            idx_max = max(idx_max, i + 1)
    return idx_max + 1`,
    testCases: [
      { input: [1], expected: 2 },
      { input: [2], expected: 3 },
      { input: [4], expected: 4 },
      { input: [11], expected: 6 },
      { input: [12], expected: 6 },
    ],
    hint: "Greedily subtract the largest Fibonacci number that fits; the largest index sets the length.",
  },
  {
    id: "info-290",
    title: "Shannon-Fano Average Length",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Build a Shannon-Fano code from probabilities given in descending order. Recursively split the list at the index k that minimizes the absolute difference between the sum of the first k probabilities and the rest, breaking ties toward the smaller k, and give every symbol one more bit per recursion level. Return the probability-weighted average codeword length, 0.0 for fewer than two symbols, and 0.0 for an empty list.",
    starterCode: `def shannon_fano_average_length(probs):
    # Your code here
    pass`,
    solution: `def shannon_fano_average_length(probs):
    if len(probs) <= 1:
        return 0.0
    total = float(sum(probs))
    best_k = 1
    best_diff = None
    run = 0.0
    for k in range(1, len(probs)):
        run += probs[k - 1]
        diff = abs(run - (total - run))
        if best_diff is None or diff < best_diff - 1e-12:
            best_diff = diff
            best_k = k
    left = probs[:best_k]
    right = probs[best_k:]
    sl = sum(left)
    sr = sum(right)
    avg_left = shannon_fano_average_length(left)
    avg_right = shannon_fano_average_length(right)
    return (sl * (avg_left + 1) + sr * (avg_right + 1)) / total`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.4, 0.3, 0.2, 0.1]], expected: 1.9 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
    ],
    hint: "Each recursive split adds one bit to every symbol on both sides.",
  },
  {
    id: "info-291",
    title: "Kraft Inequality Slack",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "The Kraft sum for codeword lengths is sum(2^(-l)). Return the slack 1 - sum(2^(-l)), which is non-negative for a valid prefix-free length assignment and exactly 0 for a complete code. An empty length list has slack 1.0.",
    starterCode: `def kraft_slack(lengths):
    # Your code here
    pass`,
    solution: `def kraft_slack(lengths):
    return 1.0 - sum(2.0 ** (-l) for l in lengths)`,
    testCases: [
      { input: [[1, 1]], expected: 0.0 },
      { input: [[2, 2, 2, 2]], expected: 0.0 },
      { input: [[1, 2]], expected: 0.25 },
      { input: [[3]], expected: 0.875 },
      { input: [[]], expected: 1.0 },
    ],
    hint: "A complete binary prefix code uses all of the probability budget, leaving zero slack.",
  },
  {
    id: "info-292",
    title: "Prefix-Free Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return True when no codeword in the list is a prefix of another codeword. Duplicate codewords count as a violation because each is a prefix of the other. Empty and single-element lists are prefix-free.",
    starterCode: `def is_prefix_free(words):
    # Your code here
    pass`,
    solution: `def is_prefix_free(words):
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            if words[i].startswith(words[j]) or words[j].startswith(words[i]):
                return False
    return True`,
    testCases: [
      { input: [["0", "10", "11"]], expected: true },
      { input: [["0", "01"]], expected: false },
      { input: [["00", "01", "10", "11"]], expected: true },
      { input: [["1", "1"]], expected: false },
      { input: [[]], expected: true },
    ],
    hint: "Only compare each unordered pair once; startswith covers both directions.",
  },
  {
    id: "info-293",
    title: "Nearest Codeword Decode",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Decode a received binary word by maximum-likelihood nearest-neighbor decoding. Return the index of the codeword at minimum Hamming distance from received, breaking ties toward the smallest index. Return -1 when the code list is empty.",
    starterCode: `def nearest_codeword(received, code):
    # Your code here
    pass`,
    solution: `def nearest_codeword(received, code):
    if not code:
        return -1
    best = -1
    best_dist = None
    for i, cw in enumerate(code):
        dist = sum(a != b for a, b in zip(received, cw))
        if best_dist is None or dist < best_dist:
            best_dist = dist
            best = i
    return best`,
    testCases: [
      { input: [[1, 0, 1], [[0, 0, 0], [1, 0, 0], [1, 1, 1]]], expected: 1 },
      { input: [[0, 0, 1], [[1, 1, 0], [0, 0, 0]]], expected: 1 },
      { input: [[1, 1], []], expected: -1 },
      { input: [[0, 0, 0], [[0, 0, 1], [0, 0, 0]]], expected: 1 },
    ],
    hint: "Strictly less than the best distance keeps the earliest index on ties.",
  },
  {
    id: "info-294",
    title: "Hamming (7,4) Batch Encode",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Encode a list of 4-bit data blocks with the systematic Hamming(7,4) code. For data [d1, d2, d3, d4] compute p1 = d1 ^ d2 ^ d4, p2 = d1 ^ d3 ^ d4, and p4 = d2 ^ d3 ^ d4, then emit the codeword [p1, p2, d1, p4, d2, d3, d4]. Return a list with one codeword per input block, and an empty list for empty input.",
    starterCode: `def hamming_74_batch_encode(blocks):
    # Your code here
    pass`,
    solution: `def hamming_74_batch_encode(blocks):
    out = []
    for d in blocks:
        d1, d2, d3, d4 = d
        out.append([d1 ^ d2 ^ d4, d1 ^ d3 ^ d4, d1, d2 ^ d3 ^ d4, d2, d3, d4])
    return out`,
    testCases: [
      { input: [[[1, 0, 1, 1]]], expected: [[0, 1, 1, 0, 0, 1, 1]] },
      { input: [[[0, 0, 0, 0], [1, 1, 1, 1]]], expected: [[0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1]] },
      { input: [[]], expected: [] },
      { input: [[[1, 0, 0, 0]]], expected: [[1, 1, 1, 0, 0, 0, 0]] },
    ],
    hint: "Each parity bit covers the data positions whose binary labels contain that parity bit.",
  },
  {
    id: "info-295",
    title: "Syndrome Error Probability",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "A single-error-correcting block code of length n is sent over a binary symmetric channel with crossover probability p. The syndrome is zero exactly when zero or one bit flipped, so the probability of a nonzero syndrome is 1 - (1 - p)^n - n * p * (1 - p)^(n - 1). Return that probability.",
    starterCode: `def syndrome_error_probability(n, p):
    # Your code here
    pass`,
    solution: `def syndrome_error_probability(n, p):
    return 1.0 - (1.0 - p) ** n - n * p * (1.0 - p) ** (n - 1)`,
    testCases: [
      { input: [7, 0.1], expected: 0.14969439999999978 },
      { input: [3, 0.5], expected: 0.5 },
      { input: [7, 0.0], expected: 0.0 },
      { input: [7, 1.0], expected: 1.0 },
    ],
    hint: "Subtract the probabilities of exactly zero and exactly one flipped bit from one.",
  },
  {
    id: "info-296",
    title: "Hamming Bound Redundancy",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "For a binary code of block length n with minimum distance d, let t = floor((d - 1) / 2). The sphere-packing bound requires 2^r syndromes to cover a radius-t ball of size sum_{i=0}^{t} C(n, i), where r is the number of redundancy bits. Return the smallest r >= 0 that satisfies 2^r >= that sphere size.",
    starterCode: `import math
def hamming_bound_redundancy(n, d):
    # Your code here
    pass`,
    solution: `import math
def hamming_bound_redundancy(n, d):
    t = (d - 1) // 2
    sphere = sum(math.comb(n, i) for i in range(t + 1))
    r = 0
    while 2 ** r < sphere:
        r += 1
    return r`,
    testCases: [
      { input: [7, 3], expected: 3 },
      { input: [15, 3], expected: 4 },
      { input: [7, 7], expected: 6 },
      { input: [4, 3], expected: 3 },
      { input: [3, 3], expected: 2 },
    ],
    hint: "Increasing the redundancy by one bit doubles the number of available syndromes.",
  },
  {
    id: "info-297",
    title: "Singleton Bound Max Dimension",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "The Singleton bound for a code of block length n and minimum distance d limits the message dimension to k <= n - d + 1. Return the largest feasible k, clamped at 0 when the parameters are impossible. Assume n >= 1 and d >= 1.",
    starterCode: `def singleton_max_dimension(n, d):
    # Your code here
    pass`,
    solution: `def singleton_max_dimension(n, d):
    return max(0, n - d + 1)`,
    testCases: [
      { input: [10, 3], expected: 8 },
      { input: [5, 1], expected: 5 },
      { input: [7, 7], expected: 1 },
      { input: [3, 5], expected: 0 },
    ],
    hint: "Every extra unit of minimum distance costs one dimension.",
  },
  {
    id: "info-298",
    title: "Code Rate from Codewords",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "For a possibly nonlinear binary code with M codewords of block length n, the rate is log2(M) / n bits per channel use. Return that rate for M >= 1 and n >= 1, so a code with a single codeword has rate 0.0.",
    starterCode: `import math
def code_rate_from_codewords(m, n):
    # Your code here
    pass`,
    solution: `import math
def code_rate_from_codewords(m, n):
    return math.log2(m) / n`,
    testCases: [
      { input: [16, 7], expected: 0.5714285714285714 },
      { input: [8, 3], expected: 1.0 },
      { input: [2, 5], expected: 0.2 },
      { input: [1, 4], expected: 0.0 },
    ],
    hint: "log2(M) is the number of message bits the codebook can carry.",
  },
  {
    id: "info-299",
    title: "Repetition Code Encode",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Encode a single bit with a repetition code of length n by returning a list containing that bit n times. Assume bit is 0 or 1 and n >= 1.",
    starterCode: `def repetition_encode(bit, n):
    # Your code here
    pass`,
    solution: `def repetition_encode(bit, n):
    return [bit] * n`,
    testCases: [
      { input: [1, 5], expected: [1, 1, 1, 1, 1] },
      { input: [0, 3], expected: [0, 0, 0] },
      { input: [1, 1], expected: [1] },
      { input: [0, 4], expected: [0, 0, 0, 0] },
    ],
    hint: "Repetition trades rate for a larger minimum Hamming distance.",
  },
  {
    id: "info-300",
    title: "CRC Encode Message",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute a systematic CRC codeword from data bits and a generator polynomial given as bits, most significant first. Append len(poly) - 1 zero bits, perform binary polynomial long division by XOR-ing the generator at every leading 1, and return the data bits followed by the final remainder. Assume poly starts with 1.",
    starterCode: `def crc_encode(data, poly):
    # Your code here
    pass`,
    solution: `def crc_encode(data, poly):
    msg = list(data) + [0] * (len(poly) - 1)
    for i in range(len(data)):
        if msg[i]:
            for j in range(len(poly)):
                msg[i + j] ^= poly[j]
    return list(data) + msg[len(data):]`,
    testCases: [
      { input: [[1, 1, 0, 1], [1, 0, 1, 1]], expected: [1, 1, 0, 1, 0, 0, 1] },
      { input: [[1, 0, 1], [1, 1, 0]], expected: [1, 0, 1, 0, 0] },
      { input: [[1, 1, 1, 1], [1, 0, 0, 1, 1]], expected: [1, 1, 1, 1, 0, 0, 1, 0] },
      { input: [[0, 1, 0, 1, 1], [1, 0, 0, 1]], expected: [0, 1, 0, 1, 1, 0, 1, 0] },
    ],
    hint: "Only iterate over the data positions; the remaining bits after the loop are the remainder.",
  },
  {
    id: "info-301",
    title: "Convolutional Encode Stream",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Encode a whole bit stream with a rate-1/2 convolutional encoder. The state list holds the previous input bits, and for each new bit form combined = [bit] + state; each output parity is the XOR of the combined bits named by its tap list, after which the state shifts in the new bit. Return the flat interleaved stream [p1, p2, p1, p2, ...].",
    starterCode: `def convolutional_encode(bits, state, taps1, taps2):
    # Your code here
    pass`,
    solution: `def convolutional_encode(bits, state, taps1, taps2):
    out = []
    s = list(state)
    for b in bits:
        combined = [b] + s
        p1 = 0
        for i in taps1:
            p1 ^= combined[i]
        p2 = 0
        for i in taps2:
            p2 ^= combined[i]
        out.extend([p1, p2])
        if s:
            s = [b] + s[:-1]
    return out`,
    testCases: [
      { input: [[1, 0, 1], [0, 0], [0, 1, 2], [0, 2]], expected: [1, 1, 1, 0, 0, 0] },
      { input: [[1, 1], [0, 0], [0, 1], [0, 1, 2]], expected: [1, 1, 0, 0] },
      { input: [[], [0, 0], [0, 1], [0, 1, 2]], expected: [] },
      { input: [[1, 0, 0, 1], [0], [0, 1], [0]], expected: [1, 1, 1, 0, 0, 0, 1, 1] },
    ],
    hint: "Tap index 0 is the current bit, so a tap list of [0] just copies the input to that output.",
  },
  {
    id: "info-302",
    title: "Viterbi Best Path Metric",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Run the Viterbi dynamic program over a sequence of transition metric matrices. step_metrics[t][i][j] is the cost of moving from state i to state j at time t, the path starts in state 0 with metric 0 and all other states at infinity, and every state keeps the minimum accumulated cost. Return the minimum final path metric as an integer.",
    starterCode: `def viterbi_best_metric(step_metrics):
    # Your code here
    pass`,
    solution: `def viterbi_best_metric(step_metrics):
    inf = float("inf")
    states = len(step_metrics[0])
    metrics = [0] + [inf] * (states - 1)
    for mat in step_metrics:
        new = []
        for j in range(states):
            best = inf
            for i in range(states):
                if metrics[i] != inf:
                    v = metrics[i] + mat[i][j]
                    if v < best:
                        best = v
            new.append(best)
        metrics = new
    return min(metrics)`,
    testCases: [
      { input: [[[[0, 1], [2, 0]], [[1, 0], [0, 1]]]], expected: 0 },
      { input: [[[[0, 2], [1, 0]]]], expected: 0 },
      { input: [[[[0, 1], [2, 0]], [[1, 0], [0, 1]], [[0, 0], [1, 1]]]], expected: 1 },
      { input: [[[[0, 5], [5, 0]], [[5, 0], [0, 5]]]], expected: 0 },
    ],
    hint: "Each step keeps, for every state, the cheapest incoming path in add-compare-select fashion.",
  },
  {
    id: "info-303",
    title: "BEC Mutual Information",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mutual information in bits of a binary erasure channel with erasure probability pe when the input is 1 with probability px1. The formula is I = (1 - pe) * H(px1), where H is the binary entropy function in bits; degenerate inputs with px1 = 0 or 1 carry no information.",
    starterCode: `import math
def bec_mutual_information(px1, pe):
    # Your code here
    pass`,
    solution: `import math
def bec_mutual_information(px1, pe):
    if px1 <= 0.0 or px1 >= 1.0:
        h = 0.0
    else:
        h = -px1 * math.log2(px1) - (1 - px1) * math.log2(1 - px1)
    return (1.0 - pe) * h`,
    testCases: [
      { input: [0.5, 0.0], expected: 1.0 },
      { input: [0.5, 0.5], expected: 0.5 },
      { input: [0.25, 0.2], expected: 0.6490224995673063 },
      { input: [1.0, 0.3], expected: 0.0 },
    ],
    hint: "Erasures only scale the information down by the fraction of symbols that arrive.",
  },
  {
    id: "info-304",
    title: "BEC Correct Decode Probability",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "A bit is sent n times over a binary erasure channel with erasure probability pe. Decoding succeeds as long as at least one copy is not erased, so the probability of a correct decode is 1 - pe^n. Assume n >= 1 and 0 <= pe <= 1.",
    starterCode: `def bec_correct_decode(n, pe):
    # Your code here
    pass`,
    solution: `def bec_correct_decode(n, pe):
    return 1.0 - pe ** n`,
    testCases: [
      { input: [3, 0.5], expected: 0.875 },
      { input: [1, 0.3], expected: 0.7 },
      { input: [5, 0.0], expected: 1.0 },
      { input: [2, 1.0], expected: 0.0 },
    ],
    hint: "Compute the probability that every copy is erased and subtract it from one.",
  },
  {
    id: "info-305",
    title: "Channel Coding Theorem Threshold",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Shannon's channel coding theorem says reliable communication is possible exactly when the code rate is below the channel capacity. Return True when code_rate < capacity and False otherwise. Assume both values are non-negative.",
    starterCode: `def channel_coding_threshold(code_rate, capacity):
    # Your code here
    pass`,
    solution: `def channel_coding_threshold(code_rate, capacity):
    return code_rate < capacity`,
    testCases: [
      { input: [0.4, 0.5], expected: true },
      { input: [0.5, 0.5], expected: false },
      { input: [0.6, 0.5], expected: false },
      { input: [0.1, 0.5], expected: true },
    ],
    hint: "At exactly the capacity the theorem makes no promise of vanishing error.",
  },
  {
    id: "info-306",
    title: "Z-Channel Optimal Input",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "For a Z-channel where a transmitted 1 is flipped to 0 with probability q and a 0 is never flipped, the capacity-achieving output distribution satisfies py1 = 1 / (1 + 2^(H(q) / (1 - q))) with H the binary entropy in bits. Return the corresponding input P(X = 1) = py1 / (1 - q). Return 1.0 for q <= 0 and 0.0 for q >= 1.",
    starterCode: `import math
def z_channel_optimal_input(q):
    # Your code here
    pass`,
    solution: `import math
def z_channel_optimal_input(q):
    if q <= 1e-12:
        return 1.0
    if q >= 1.0:
        return 0.0
    h = -q * math.log2(q) - (1 - q) * math.log2(1 - q)
    py1 = 1.0 / (1.0 + 2.0 ** (h / (1.0 - q)))
    return py1 / (1.0 - q)`,
    testCases: [
      { input: [0.5], expected: 0.4 },
      { input: [0.25], expected: 0.42782559679176746 },
      { input: [0.1], expected: 0.45629812363536315 },
      { input: [0.9], expected: 0.3729708346843838 },
    ],
    hint: "Optimize I(X;Y) = H(py1) - px1 * H(q) over px1 and solve the derivative condition.",
  },
  {
    id: "info-307",
    title: "Fountain Code Overhead",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "A fountain decoder needs slightly more than k encoded symbols to reconstruct the original k symbols. Return the fractional overhead (received - k) / k, which is negative when fewer than k symbols arrived. Assume k >= 1.",
    starterCode: `def fountain_code_overhead(k, received):
    # Your code here
    pass`,
    solution: `def fountain_code_overhead(k, received):
    return (received - k) / k`,
    testCases: [
      { input: [100, 105], expected: 0.05 },
      { input: [50, 50], expected: 0.0 },
      { input: [20, 24], expected: 0.2 },
      { input: [10, 8], expected: -0.2 },
    ],
    hint: "Overhead is measured relative to the number of source symbols.",
  },
  {
    id: "info-308",
    title: "Erasure Code Recover Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "An erasure code stores k data symbols plus n - k parity symbols and can recover any pattern of erased positions up to the number of parities. Return True when erasures <= n - k and False otherwise. Assume 0 <= k <= n and erasures >= 0.",
    starterCode: `def erasure_code_recover_check(k, n, erasures):
    # Your code here
    pass`,
    solution: `def erasure_code_recover_check(k, n, erasures):
    return erasures <= n - k`,
    testCases: [
      { input: [4, 6, 2], expected: true },
      { input: [4, 6, 3], expected: false },
      { input: [10, 10, 0], expected: true },
      { input: [5, 8, 4], expected: false },
    ],
    hint: "With erasure positions known, each parity symbol can replace one missing data symbol.",
  },
  {
    id: "info-309",
    title: "XOR Parity Recover",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "A set of integers is protected by a single XOR parity symbol equal to the XOR of the complete set. Given every symbol except one plus the parity, recover the missing symbol as parity ^ XOR(data), since XOR is its own inverse. Return the parity itself when data is empty.",
    starterCode: `def xor_parity_recover(data, parity):
    # Your code here
    pass`,
    solution: `def xor_parity_recover(data, parity):
    x = 0
    for v in data:
        x ^= v
    return x ^ parity`,
    testCases: [
      { input: [[1, 2, 3], 4], expected: 4 },
      { input: [[5, 10], 8], expected: 7 },
      { input: [[], 7], expected: 7 },
      { input: [[9, 9, 9], 9], expected: 0 },
    ],
    hint: "XOR-ing the known values and the parity cancels every known symbol.",
  },
  {
    id: "info-310",
    title: "Reed-Solomon Symbol Overhead",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "A Reed-Solomon code that corrects t arbitrary symbol errors needs 2t parity symbols, so k message symbols become a block of n = k + 2t symbols. Return the parity fraction 2t / (k + 2t), which is 0.0 when t is 0. Assume k >= 1 and t >= 0.",
    starterCode: `def reed_solomon_overhead(k, t):
    # Your code here
    pass`,
    solution: `def reed_solomon_overhead(k, t):
    return (2.0 * t) / (k + 2.0 * t)`,
    testCases: [
      { input: [10, 2], expected: 0.2857142857142857 },
      { input: [8, 1], expected: 0.2 },
      { input: [4, 0], expected: 0.0 },
      { input: [12, 3], expected: 0.3333333333333333 },
    ],
    hint: "Error correction costs twice as much redundancy as erasure correction.",
  },
  {
    id: "info-311",
    title: "Interleaving Burst Protection",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Interleaving with depth D spreads consecutive symbols across D codewords, so if each codeword can correct t errors, a burst is handled as long as its length does not exceed D * t. Return the maximum correctable burst length. Assume D >= 1 and t >= 0.",
    starterCode: `def interleaving_burst_protection(depth, t):
    # Your code here
    pass`,
    solution: `def interleaving_burst_protection(depth, t):
    return depth * t`,
    testCases: [
      { input: [5, 2], expected: 10 },
      { input: [1, 3], expected: 3 },
      { input: [10, 1], expected: 10 },
      { input: [4, 0], expected: 0 },
    ],
    hint: "Each codeword receives only every D-th symbol of the burst.",
  },
  {
    id: "info-312",
    title: "Measured Compression Ratio",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Given the original size and the compressed size in bytes, return the compression ratio compressed / original. This equals the ratio of the bit counts, since both sizes scale by the same factor of eight. Return 0.0 when the original size is zero.",
    starterCode: `def measured_compression_ratio(original_bytes, compressed_bytes):
    # Your code here
    pass`,
    solution: `def measured_compression_ratio(original_bytes, compressed_bytes):
    if original_bytes == 0:
        return 0.0
    return compressed_bytes / original_bytes`,
    testCases: [
      { input: [1000, 400], expected: 0.4 },
      { input: [100, 100], expected: 1.0 },
      { input: [100, 150], expected: 1.5 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "A ratio below 1 means the compressed file is smaller than the original.",
  },
  {
    id: "info-313",
    title: "Kolmogorov Structure Function Lite",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Each candidate model is a pair [program_bits, data_bits]. The lite structure function at model budget alpha is the smallest program_bits + data_bits among candidates whose program_bits is at most alpha. Return that minimum total, or -1 when no candidate fits the budget.",
    starterCode: `def kolmogorov_structure_function(candidates, alpha):
    # Your code here
    pass`,
    solution: `def kolmogorov_structure_function(candidates, alpha):
    best = None
    for prog, data in candidates:
        if prog <= alpha:
            total = prog + data
            if best is None or total < best:
                best = total
    return -1 if best is None else best`,
    testCases: [
      { input: [[[10, 90], [20, 70], [30, 50]], 25], expected: 90 },
      { input: [[[10, 90], [20, 70], [30, 50]], 5], expected: -1 },
      { input: [[[10, 90], [20, 70], [30, 50]], 100], expected: 80 },
      { input: [[], 10], expected: -1 },
    ],
    hint: "A more expressive model costs more program bits but describes the data in fewer bits.",
  },
  {
    id: "info-314",
    title: "MDL Penalty in Nats",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the MDL / BIC-style complexity penalty in nats for a model with k parameters fitted to n samples, which is 0.5 * k * ln(n). Natural logarithms make the penalty add directly to a negative log-likelihood measured in nats. Assume n >= 1 and k >= 0.",
    starterCode: `import math
def mdl_penalty_nats(k, n):
    # Your code here
    pass`,
    solution: `import math
def mdl_penalty_nats(k, n):
    return 0.5 * k * math.log(n)`,
    testCases: [
      { input: [2, 100], expected: 4.605170185988092 },
      { input: [0, 100], expected: 0.0 },
      { input: [5, 10], expected: 5.756462732485115 },
      { input: [3, 1], expected: 0.0 },
    ],
    hint: "Each parameter is charged half a natural log of the sample count.",
  },
  {
    id: "info-315",
    title: "Cross-Entropy Nats to Bits",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert a cross-entropy measured in nats into bits by dividing by ln(2), which is the same as multiplying by log2(e). One nat equals about 1.4427 bits, and a cross-entropy of 0.0 stays 0.0.",
    starterCode: `import math
def cross_entropy_bits_from_nats(nats):
    # Your code here
    pass`,
    solution: `import math
def cross_entropy_bits_from_nats(nats):
    return nats / math.log(2.0)`,
    testCases: [
      { input: [1.0], expected: 1.4426950408889634 },
      { input: [0.6931471805599453], expected: 1.0 },
      { input: [0.0], expected: 0.0 },
      { input: [10.0], expected: 14.426950408889635 },
    ],
    hint: "Change of base: log2(x) = ln(x) / ln(2).",
  },
];
