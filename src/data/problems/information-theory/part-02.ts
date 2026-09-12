import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-046",
    title: "Huffman Tree Total Cost",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Build a Huffman code for the given frequencies and return its total cost sum(f_i * l_i) in bits, where l_i is the codeword length of the i-th frequency. A useful identity: for two or more symbols the total cost equals the sum of all merged node weights during the bottom-up merge. Break ties with a min-heap keyed by weight and creation order. A single symbol gets codeword length 1.",
    starterCode: `import heapq
def huffman_total_cost(freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_total_cost(freqs):
    n = len(freqs)
    if n == 1:
        return float(freqs[0])
    heap = [[float(freqs[i]), i] for i in range(n)]
    heapq.heapify(heap)
    counter = n
    cost = 0.0
    while len(heap) > 1:
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        s = a[0] + b[0]
        cost += s
        counter += 1
        heapq.heappush(heap, [s, counter])
    return cost`,
    testCases: [
      { input: [[1, 1]], expected: 2.0 },
      { input: [[1, 2, 3, 4]], expected: 19.0 },
      { input: [[1, 1, 1]], expected: 5.0 },
      { input: [[7]], expected: 7.0 },
      { input: [[5, 4, 3, 2, 1]], expected: 33.0 },
    ],
    hint: "Every merge charges the combined weight to every leaf beneath it.",
  },
  {
    id: "info-047",
    title: "Canonical Code Words",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given symbols and their codeword lengths, assign canonical code words. Sort the pairs by (length, symbol), give the first code word that many zeros, and obtain each next code word by incrementing the previous code and shifting left by the increase in length. Return a dict mapping each symbol to its binary code string.",
    starterCode: `def canonical_codes(symbols, lengths):
    # Your code here
    pass`,
    solution: `def canonical_codes(symbols, lengths):
    pairs = sorted(zip(symbols, lengths), key=lambda pr: (pr[1], pr[0]))
    codes = {}
    code = 0
    prev_len = pairs[0][1]
    for i in range(len(pairs)):
        sym, l = pairs[i]
        if i > 0:
            code = (code + 1) << (l - prev_len)
        codes[sym] = format(code, "0" + str(l) + "b")
        prev_len = l
    return codes`,
    testCases: [
      {
        input: [["a", "b", "c", "d"], [1, 2, 3, 3]],
        expected: { a: "0", b: "10", c: "110", d: "111" },
      },
      {
        input: [["x", "y"], [1, 1]],
        expected: { x: "0", y: "1" },
      },
      {
        input: [["a", "b", "c"], [2, 2, 2]],
        expected: { a: "00", b: "01", c: "10" },
      },
      {
        input: [["z"], [1]],
        expected: { z: "0" },
      },
      {
        input: [["d", "b", "a", "c"], [3, 2, 1, 3]],
        expected: { a: "0", b: "10", c: "110", d: "111" },
      },
    ],
    hint: "Canonical codes need only the sorted lengths to be reconstructed.",
  },
  {
    id: "info-048",
    title: "Shannon-Fano Split",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Given probabilities in descending order, choose the split index k in 1..n-1 that minimizes the absolute difference between the sum of the first k probabilities and the sum of the rest. Return k, breaking ties toward the smaller index.",
    starterCode: `def shannon_fano_split(probs):
    # Your code here
    pass`,
    solution: `def shannon_fano_split(probs):
    n = len(probs)
    total = sum(probs)
    best_k = 1
    best_diff = None
    for k in range(1, n):
        left = sum(probs[:k])
        diff = abs(left - (total - left))
        if best_diff is None or diff < best_diff - 1e-12:
            best_diff = diff
            best_k = k
    return best_k`,
    testCases: [
      { input: [[0.5, 0.25, 0.25]], expected: 1 },
      { input: [[0.4, 0.3, 0.2, 0.1]], expected: 1 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 2 },
      { input: [[0.6, 0.2, 0.2]], expected: 1 },
      { input: [[0.7, 0.1, 0.1, 0.1]], expected: 1 },
    ],
    hint: "Scan every split point; the probabilities are already sorted so the halves stay contiguous.",
  },
  {
    id: "info-049",
    title: "Arithmetic Coding Interval Update",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Update an arithmetic coding interval when the next symbol owns the cumulative range [cum_low, cum_high) inside the current interval. Return [low + width * cum_low, low + width * cum_high] where width = high - low.",
    starterCode: `def arithmetic_update(low, high, cum_low, cum_high):
    # Your code here
    pass`,
    solution: `def arithmetic_update(low, high, cum_low, cum_high):
    width = high - low
    return [low + width * cum_low, low + width * cum_high]`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 0.5], expected: [0.0, 0.5] },
      { input: [0.0, 1.0, 0.5, 1.0], expected: [0.5, 1.0] },
      { input: [0.25, 0.75, 0.5, 0.75], expected: [0.5, 0.625] },
      { input: [0.1, 0.3, 0.2, 0.9], expected: [0.14, 0.28] },
    ],
    hint: "Scale the cumulative range by the current interval width.",
  },
  {
    id: "info-050",
    title: "Final Interval Width",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the width of the final arithmetic coding interval for a sequence, which is the product of the symbol probabilities: prod(p_i). A long sequence therefore narrows the interval exponentially.",
    starterCode: `def interval_width(probs):
    # Your code here
    pass`,
    solution: `def interval_width(probs):
    w = 1.0
    for p in probs:
        w *= p
    return w`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 0.25 },
      { input: [[0.5, 0.25, 0.25]], expected: 0.03125 },
      { input: [[1.0]], expected: 1.0 },
      { input: [[0.1, 0.2, 0.3]], expected: 0.006000000000000001 },
    ],
    hint: "The interval width equals the probability of the whole sequence.",
  },
  {
    id: "info-051",
    title: "LZ78 Dictionary",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Parse s with the LZ78 algorithm and return the list of phrases in the order they are added. Each new phrase is the shortest prefix of the remaining string that is not already in the dictionary; if the remaining suffix is already known, it forms the final phrase. Return an empty list for the empty string.",
    starterCode: `def lz78_dictionary(s):
    # Your code here
    pass`,
    solution: `def lz78_dictionary(s):
    phrases = set()
    order = []
    i = 0
    n = len(s)
    while i < n:
        j = i + 1
        while j <= n and s[i:j] in phrases:
            j += 1
        if j > n:
            phrase = s[i:n]
        else:
            phrase = s[i:j]
        phrases.add(phrase)
        order.append(phrase)
        i = j
    return order`,
    testCases: [
      { input: ["aaaa"], expected: ["a", "aa", "a"] },
      { input: ["abracadabra"], expected: ["a", "b", "r", "ac", "ad", "ab", "ra"] },
      { input: ["abcabcabc"], expected: ["a", "b", "c", "ab", "ca", "bc"] },
      { input: [""], expected: [] },
      { input: ["banana"], expected: ["b", "a", "n", "an", "a"] },
    ],
    hint: "Grow each phrase one character at a time until it is new.",
  },
  {
    id: "info-052",
    title: "LZ77 Triple Encode",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Encode s with greedy LZ77 using a sliding window of the given size. At each position find the longest match against earlier positions within the window; a match may not run past the current position. Break ties toward the nearest match. Emit [offset, length, next_char] and advance past the match plus its next character; when the match reaches the end of the string use an empty string as the character. With no match emit [0, 0, s[i]]. Return the list of triples.",
    starterCode: `def lz77_encode(s, window):
    # Your code here
    pass`,
    solution: `def lz77_encode(s, window):
    n = len(s)
    out = []
    i = 0
    while i < n:
        best_len = 0
        best_off = 0
        start = max(0, i - window)
        for j in range(start, i):
            max_len = i - j
            l = 0
            while l < max_len and i + l < n and s[j + l] == s[i + l]:
                l += 1
            if l > best_len or (l == best_len and l > 0 and (i - j) < best_off):
                best_len = l
                best_off = i - j
        if best_len > 0:
            if i + best_len < n:
                out.append([best_off, best_len, s[i + best_len]])
                i += best_len + 1
            else:
                out.append([best_off, best_len, ""])
                i += best_len
        else:
            out.append([0, 0, s[i]])
            i += 1
    return out`,
    testCases: [
      { input: ["aaaaa", 3], expected: [[0, 0, "a"], [1, 1, "a"], [2, 2, ""]] },
      {
        input: ["abcabcabc", 6],
        expected: [[0, 0, "a"], [0, 0, "b"], [0, 0, "c"], [3, 3, "a"], [3, 2, ""]],
      },
      { input: ["banana", 3], expected: [[0, 0, "b"], [0, 0, "a"], [0, 0, "n"], [2, 2, "a"]] },
      { input: ["abcd", 4], expected: [[0, 0, "a"], [0, 0, "b"], [0, 0, "c"], [0, 0, "d"]] },
      { input: ["", 2], expected: [] },
    ],
    hint: "Compare each candidate match start against the current position and cap the overlap.",
  },
  {
    id: "info-053",
    title: "Run-Length Encoded Entropy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Run-length encode s and return the empirical Shannon entropy in bits of the run-length values, where each run contributes one sample. Return 0.0 for the empty string. Compute the runs first, then take the entropy of their value distribution.",
    starterCode: `import math
def rle_entropy(s):
    # Your code here
    pass`,
    solution: `import math
def rle_entropy(s):
    if not s:
        return 0.0
    runs = []
    count = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            count += 1
        else:
            runs.append(count)
            count = 1
    runs.append(count)
    counts = {}
    for r in runs:
        counts[r] = counts.get(r, 0) + 1
    n = len(runs)
    h = 0.0
    for c in counts.values():
        p = c / n
        h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: ["aaabbbcc"], expected: 0.9182958340544896 },
      { input: ["aaabbc"], expected: 1.584962500721156 },
      { input: ["aaaa"], expected: 0.0 },
      { input: ["aabbaabb"], expected: 0.0 },
      { input: ["abab"], expected: 0.0 },
    ],
    hint: "A constant run-length distribution means the run-length code carries no information.",
  },
  {
    id: "info-054",
    title: "Compression Ratio Proxy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return a simple compression ratio proxy: the source entropy in bits per symbol divided by the raw bits per symbol. The result lies in (0, 1] for a compressible source.",
    starterCode: `def compression_ratio(entropy_bits, raw_bits):
    # Your code here
    pass`,
    solution: `def compression_ratio(entropy_bits, raw_bits):
    return entropy_bits / raw_bits`,
    testCases: [
      { input: [1.0, 8.0], expected: 0.125 },
      { input: [4.0, 4.0], expected: 1.0 },
      { input: [2.0, 8.0], expected: 0.25 },
      { input: [0.0, 8.0], expected: 0.0 },
    ],
    hint: "This is the fraction of the raw bit rate that an ideal entropy coder needs.",
  },
  {
    id: "info-055",
    title: "MDL Two-Part Code",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the two-part MDL description length in bits: the negative log-likelihood plus one log2(n) term per parameter:\n\nDL = NLL + k * log2(n)\n\nHere n is the number of samples and k the number of parameters.",
    starterCode: `import math
def mdl_two_part(nll_bits, n_samples, n_params):
    # Your code here
    pass`,
    solution: `import math
def mdl_two_part(nll_bits, n_samples, n_params):
    return nll_bits + n_params * math.log2(n_samples)`,
    testCases: [
      { input: [10.0, 8, 2], expected: 16.0 },
      { input: [0.0, 1, 1], expected: 0.0 },
      { input: [5.0, 16, 3], expected: 17.0 },
      { input: [8.0, 10, 2], expected: 14.643856189774723 },
    ],
    hint: "Each parameter costs log2(n) bits to encode in the two-part code.",
  },
  {
    id: "info-056",
    title: "BIC Code Length",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Express the BIC score of a model as a code length in bits. Given the natural-log likelihood LL, n samples and k parameters:\n\nlen = (k * ln(n) - 2 * LL) / (2 * ln 2)\n\nAssume n > 0.",
    starterCode: `import math
def bic_code_length(log_likelihood, n_samples, n_params):
    # Your code here
    pass`,
    solution: `import math
def bic_code_length(log_likelihood, n_samples, n_params):
    return (n_params * math.log(n_samples) - 2.0 * log_likelihood) / (2.0 * math.log(2.0))`,
    testCases: [
      { input: [0.0, 8, 2], expected: 3.0 },
      { input: [-10.0, 16, 1], expected: 16.426950408889635 },
      { input: [-5.0, 4, 2], expected: 9.213475204444817 },
      { input: [-2.0, 100, 3], expected: 12.851174366440015 },
    ],
    hint: "Dividing the BIC by 2 ln 2 converts the score into bits.",
  },
  {
    id: "info-057",
    title: "AIC vs BIC Delta",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the difference AIC - BIC for a model with k parameters fitted to n samples. The likelihood terms cancel, leaving\n\ndelta = k * (2 - ln(n))",
    starterCode: `import math
def aic_bic_delta(n_samples, n_params):
    # Your code here
    pass`,
    solution: `import math
def aic_bic_delta(n_samples, n_params):
    return n_params * (2.0 - math.log(n_samples))`,
    testCases: [
      { input: [8, 2], expected: -0.1588830833596715 },
      { input: [16, 3], expected: -2.3177661667193434 },
      { input: [2, 5], expected: 6.534264097200273 },
      { input: [100, 1], expected: -2.605170185988092 },
    ],
    hint: "AIC and BIC only differ in their complexity penalty for the same model.",
  },
  {
    id: "info-058",
    title: "KL Chain Rule Gap",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Verify the KL chain rule numerically. Given joints pxy and qxy, return the absolute residual between KL(p(x, y) || q(x, y)) and the chain decomposition KL(p(x) || q(x)) + sum_x p(x) * KL(p(y | x) || q(y | x)). All divergences are in bits and the residual should be within floating-point error of 0.",
    starterCode: `import math
def kl_chain_rule_gap(pxy, qxy):
    # Your code here
    pass`,
    solution: `import math
def kl_chain_rule_gap(pxy, qxy):
    def kl2(a, b):
        t = 0.0
        for x, y in zip(a, b):
            if x > 0:
                t += x * math.log2(x / y)
        return t

    px = [sum(row) for row in pxy]
    qx = [sum(row) for row in qxy]
    joint_kl = 0.0
    for i in range(len(pxy)):
        for j in range(len(pxy[0])):
            p = pxy[i][j]
            if p > 0:
                joint_kl += p * math.log2(p / qxy[i][j])
    chain = kl2(px, qx)
    for i in range(len(pxy)):
        if px[i] > 0:
            pyx = [p / px[i] for p in pxy[i]]
            qyx = [q / qx[i] for q in qxy[i]]
            chain += px[i] * kl2(pyx, qyx)
    return abs(joint_kl - chain)`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]], [[0.1, 0.4], [0.4, 0.1]]], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[0.25, 0.25], [0.25, 0.25]]], expected: 0.0 },
      { input: [[[0.4, 0.1], [0.2, 0.3]], [[0.25, 0.25], [0.25, 0.25]]], expected: 0.0 },
      { input: [[[0.3, 0.2], [0.1, 0.4]], [[0.2, 0.3], [0.3, 0.2]]], expected: 0.0 },
    ],
    hint: "Build the conditionals by dividing each row by its marginal.",
  },
  {
    id: "info-059",
    title: "MI Chain Rule Gap",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Verify the mutual information chain rule numerically. From a 3D joint joint[x][y][z], return the absolute residual\n\n|I(X; Y,Z) - I(X; Y) - I(X; Z | Y)|\n\nAll quantities are in bits and the residual should be within floating-point error of 0.",
    starterCode: `import math
def mi_chain_rule_gap(joint):
    # Your code here
    pass`,
    solution: `import math
def mi_chain_rule_gap(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    px = [0.0] * nx
    py = [0.0] * ny
    pyz = [[0.0] * nz for _ in range(ny)]
    pxy = [[0.0] * ny for _ in range(nx)]
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                px[x] += p
                py[y] += p
                pyz[y][z] += p
                pxy[x][y] += p
    ixyz = 0.0
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                if p > 0:
                    ixyz += p * math.log2(p / (px[x] * pyz[y][z]))
    ixy = 0.0
    for x in range(nx):
        for y in range(ny):
            p = pxy[x][y]
            if p > 0:
                ixy += p * math.log2(p / (px[x] * py[y]))
    ixz_y = 0.0
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                if p > 0:
                    ixz_y += p * math.log2(p * py[y] / (pxy[x][y] * pyz[y][z]))
    return abs(ixyz - ixy - ixz_y)`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.5, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.5]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.25, 0.25], [0.0, 0.0]], [[0.0, 0.0], [0.25, 0.25]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.2, 0.1], [0.05, 0.05]], [[0.05, 0.05], [0.1, 0.2]]]],
        expected: 0.0,
      },
    ],
    hint: "I(X; Z | Y) = sum p(x, y, z) log2(p(x, y, z) * p(y) / (p(x, y) * p(y, z))).",
  },
  {
    id: "info-060",
    title: "Differential Entropy of Uniform",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the differential entropy in bits of a uniform distribution on [a, b]:\n\nh = log2(b - a)\n\nReturn 0.0 when b <= a.",
    starterCode: `import math
def de_uniform(a, b):
    # Your code here
    pass`,
    solution: `import math
def de_uniform(a, b):
    if b <= a:
        return 0.0
    return math.log2(b - a)`,
    testCases: [
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [0.0, 4.0], expected: 2.0 },
      { input: [-1.0, 1.0], expected: 1.0 },
      { input: [2.0, 10.0], expected: 3.0 },
    ],
    hint: "Differential entropy can be negative for narrow supports; this support starts at width 1.",
  },
  {
    id: "info-061",
    title: "Differential Entropy of Gaussian",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the differential entropy in bits of a Gaussian with variance var:\n\nh = 0.5 * log2(2 * pi * e * var)\n\nAssume var > 0.",
    starterCode: `import math
def de_gaussian(var):
    # Your code here
    pass`,
    solution: `import math
def de_gaussian(var):
    return 0.5 * math.log2(2.0 * math.pi * math.e * var)`,
    testCases: [
      { input: [1.0], expected: 2.047095585180641 },
      { input: [4.0], expected: 3.047095585180641 },
      { input: [0.25], expected: 1.047095585180641 },
      { input: [0.05854983152431917], expected: 0.0 },
    ],
    hint: "Gaussians maximize differential entropy for a fixed variance.",
  },
  {
    id: "info-062",
    title: "Differential Entropy of Exponential",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the differential entropy in bits of an exponential distribution with rate parameter lambda:\n\nh = (1 - ln(lambda)) / ln(2)\n\nAssume lambda > 0.",
    starterCode: `import math
def de_exponential(rate):
    # Your code here
    pass`,
    solution: `import math
def de_exponential(rate):
    return (1.0 - math.log(rate)) / math.log(2.0)`,
    testCases: [
      { input: [1.0], expected: 1.4426950408889634 },
      { input: [0.5], expected: 2.442695040888964 },
      { input: [2.0], expected: 0.44269504088896344 },
      { input: [0.25], expected: 3.442695040888964 },
    ],
    hint: "The exponential distribution with rate 1 has entropy log2(e) bits.",
  },
  {
    id: "info-063",
    title: "Differential Entropy of Laplace",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the differential entropy in bits of a Laplace distribution with scale b:\n\nh = log2(2 * e * b)\n\nAssume b > 0.",
    starterCode: `import math
def de_laplace(b):
    # Your code here
    pass`,
    solution: `import math
def de_laplace(b):
    return math.log2(2.0 * math.e * b)`,
    testCases: [
      { input: [1.0], expected: 2.4426950408889634 },
      { input: [0.5], expected: 1.4426950408889634 },
      { input: [2.0], expected: 3.4426950408889634 },
      { input: [0.25], expected: 0.44269504088896333 },
    ],
    hint: "The Laplace scale b relates to its variance by var = 2 * b^2.",
  },
  {
    id: "info-064",
    title: "KL Between Two Uniforms",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the KL divergence in bits from Uniform(a1, b1) to Uniform(a2, b2), assuming the first interval is contained in the second:\n\nD = log2((b2 - a2) / (b1 - a1))",
    starterCode: `import math
def kl_uniform(a1, b1, a2, b2):
    # Your code here
    pass`,
    solution: `import math
def kl_uniform(a1, b1, a2, b2):
    return math.log2((b2 - a2) / (b1 - a1))`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 2.0], expected: 1.0 },
      { input: [1.0, 2.0, 0.0, 4.0], expected: 2.0 },
      { input: [0.0, 4.0, 0.0, 4.0], expected: 0.0 },
      { input: [2.0, 4.0, 0.0, 8.0], expected: 2.0 },
    ],
    hint: "Within the shared support the density ratio is constant, so no integral is needed.",
  },
  {
    id: "info-065",
    title: "Cross-Entropy of Gaussians",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the differential cross-entropy in nats between two univariate Gaussians p = N(mu1, var1) and q = N(mu2, var2):\n\nH(p, q) = 0.5 * ln(2 * pi * var2) + (var1 + (mu1 - mu2)^2) / (2 * var2)\n\nAssume all variances are positive.",
    starterCode: `import math
def cross_entropy_gaussians(mu1, var1, mu2, var2):
    # Your code here
    pass`,
    solution: `import math
def cross_entropy_gaussians(mu1, var1, mu2, var2):
    return 0.5 * math.log(2.0 * math.pi * var2) + (var1 + (mu1 - mu2) ** 2) / (2.0 * var2)`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 1.0], expected: 1.4189385332046727 },
      { input: [1.0, 1.0, 0.0, 1.0], expected: 1.9189385332046727 },
      { input: [0.0, 2.0, 0.0, 1.0], expected: 1.9189385332046727 },
      { input: [0.0, 1.0, 0.0, 4.0], expected: 1.737085713764618 },
    ],
    hint: "Cross-entropy equals the entropy of q plus KL(p || q).",
  },
  {
    id: "info-066",
    title: "MI of Gaussian Channel",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the mutual information in bits between an input X ~ N(0, power) and the output Y = X + N with independent noise N ~ N(0, noise_var):\n\nI = 0.5 * log2(1 + power / noise_var)",
    starterCode: `import math
def gaussian_channel_mi(power, noise_var):
    # Your code here
    pass`,
    solution: `import math
def gaussian_channel_mi(power, noise_var):
    return 0.5 * math.log2(1.0 + power / noise_var)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.5 },
      { input: [3.0, 1.0], expected: 1.0 },
      { input: [15.0, 1.0], expected: 2.0 },
      { input: [1.0, 4.0], expected: 0.16096404744368117 },
    ],
    hint: "Quadrupling the signal-to-noise ratio adds 1 bit.",
  },
  {
    id: "info-067",
    title: "AWGN Capacity from SNR in dB",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the capacity in bits per channel use of an AWGN channel given the signal-to-noise ratio in decibels:\n\nC = 0.5 * log2(1 + 10^(snr_db / 10))",
    starterCode: `import math
def awgn_capacity(snr_db):
    # Your code here
    pass`,
    solution: `import math
def awgn_capacity(snr_db):
    return 0.5 * math.log2(1.0 + 10.0 ** (snr_db / 10.0))`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [10.0], expected: 1.7297158093186487 },
      { input: [20.0], expected: 3.3291057413758973 },
      { input: [-10.0], expected: 0.06875176187496751 },
    ],
    hint: "First convert decibels to a linear power ratio: 10^(dB / 10).",
  },
  {
    id: "info-068",
    title: "Arithmetic Coding CDF",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the cumulative distribution boundaries used by an arithmetic coder: a list starting with 0.0 followed by the running cumulative sums of probs, so the result has len(probs) + 1 entries.",
    starterCode: `def arithmetic_cdf(probs):
    # Your code here
    pass`,
    solution: `def arithmetic_cdf(probs):
    out = [0.0]
    total = 0.0
    for p in probs:
        total += p
        out.append(total)
    return out`,
    testCases: [
      { input: [[0.5, 0.5]], expected: [0.0, 0.5, 1.0] },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: [0.0, 0.25, 0.5, 0.75, 1.0] },
      { input: [[0.1, 0.2, 0.7]], expected: [0.0, 0.1, 0.30000000000000004, 1.0] },
      { input: [[1.0]], expected: [0.0, 1.0] },
    ],
    hint: "Symbol i occupies the interval [cdf[i], cdf[i + 1]).",
  },
  {
    id: "info-069",
    title: "Wideband Capacity Limit",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the limiting capacity in bits per second as bandwidth grows without bound for signal power P and one-sided noise spectral density N0:\n\nC = log2(e) * P / N0\n\nAssume N0 > 0.",
    starterCode: `import math
def wideband_capacity_limit(power, noise_psd):
    # Your code here
    pass`,
    solution: `import math
def wideband_capacity_limit(power, noise_psd):
    return math.log2(math.e) * power / noise_psd`,
    testCases: [
      { input: [1.0, 1.0], expected: 1.4426950408889634 },
      { input: [2.0, 1.0], expected: 2.8853900817779268 },
      { input: [1.0, 2.0], expected: 0.7213475204444817 },
      { input: [5.0, 0.5], expected: 14.426950408889635 },
    ],
    hint: "Spreading power over more bandwidth eventually saturates at P / (N0 ln 2).",
  },
  {
    id: "info-070",
    title: "Water-Filling Power Allocation",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Allocate total_power across parallel channels with the given noise variances using water-filling. The optimal powers are p_i = max(0, level - n_i) where the water level is chosen so the powers sum to total_power. Find the level by bisection on [min(n), max(n) + total_power] for 200 iterations and return the power list.",
    starterCode: `def water_filling(noise_vars, total_power):
    # Your code here
    pass`,
    solution: `def water_filling(noise_vars, total_power):
    lo = min(noise_vars)
    hi = max(noise_vars) + total_power
    for _ in range(200):
        mid = (lo + hi) / 2.0
        used = 0.0
        for n in noise_vars:
            if mid > n:
                used += mid - n
        if used < total_power:
            lo = mid
        else:
            hi = mid
    level = (lo + hi) / 2.0
    out = []
    for n in noise_vars:
        if level > n:
            out.append(level - n)
        else:
            out.append(0.0)
    return out`,
    testCases: [
      { input: [[1.0, 1.0], 2.0], expected: [1.0, 1.0] },
      { input: [[1.0, 3.0], 4.0], expected: [3.0, 1.0] },
      { input: [[1.0, 3.0], 1.0], expected: [1.0, 0.0] },
      { input: [[2.0, 2.0, 2.0], 3.0], expected: [1.0, 1.0, 1.0] },
      { input: [[0.5, 1.5, 4.0], 3.0], expected: [2.0, 1.0, 0.0] },
    ],
    hint: "Noisy channels sometimes receive zero power when the water level stays below their noise.",
  },
  {
    id: "info-071",
    title: "Gaussian Rate-Distortion Distortion",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Gaussian rate-distortion distortion at rate R for a source with variance var:\n\nD(R) = var * 2^(-2R)",
    starterCode: `def gaussian_distortion(rate, var):
    # Your code here
    pass`,
    solution: `def gaussian_distortion(rate, var):
    return var * 2.0 ** (-2.0 * rate)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.25 },
      { input: [0.5, 4.0], expected: 2.0 },
      { input: [2.0, 1.0], expected: 0.0625 },
      { input: [1.0, 2.0], expected: 0.5 },
    ],
    hint: "Each additional bit per sample quarters the distortion.",
  },
  {
    id: "info-072",
    title: "Gaussian Distortion-Rate Inverse",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Gaussian distortion-rate rate needed to achieve distortion D for a source with variance var:\n\nR(D) = 0.5 * log2(var / D)\n\nAssume 0 < D <= var.",
    starterCode: `import math
def gaussian_rate(distortion, var):
    # Your code here
    pass`,
    solution: `import math
def gaussian_rate(distortion, var):
    return 0.5 * math.log2(var / distortion)`,
    testCases: [
      { input: [0.25, 1.0], expected: 1.0 },
      { input: [2.0, 4.0], expected: 0.5 },
      { input: [0.0625, 1.0], expected: 2.0 },
      { input: [0.5, 2.0], expected: 1.0 },
    ],
    hint: "This inverts D(R) = var * 2^(-2R).",
  },
  {
    id: "info-073",
    title: "Binary Source RD Point",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the rate-distortion function in bits for a Bernoulli(p) source at distortion d:\n\nR(d) = H(p) - H(d)\n\nwhere H is the binary entropy function in bits with H(0) = 0. Assume 0 <= d <= min(p, 1 - p).",
    starterCode: `import math
def binary_rd(p, d):
    # Your code here
    pass`,
    solution: `import math
def binary_rd(p, d):
    return binary_entropy(p) - binary_entropy(d)

def binary_entropy(x):
    if x <= 0.0 or x >= 1.0:
        return 0.0
    return -x * math.log2(x) - (1.0 - x) * math.log2(1.0 - x)`,
    testCases: [
      { input: [0.5, 0.25], expected: 0.18872187554086717 },
      { input: [0.5, 0.0], expected: 1.0 },
      { input: [0.25, 0.1], expected: 0.3422825308698516 },
      { input: [0.5, 0.1], expected: 0.5310044064107188 },
    ],
    hint: "At zero distortion the rate equals the source entropy.",
  },
  {
    id: "info-074",
    title: "Uniform Quantizer Distortion",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the mean squared error of a uniform quantizer with n levels for a source uniform on [-a, a]. With step size delta = 2a / n and uniform quantization error,\n\nMSE = delta^2 / 12 = a^2 / (3 * n^2)",
    starterCode: `def uniform_quantizer_mse(a, n):
    # Your code here
    pass`,
    solution: `def uniform_quantizer_mse(a, n):
    return a * a / (3.0 * n * n)`,
    testCases: [
      { input: [1.0, 2], expected: 0.08333333333333333 },
      { input: [3.0, 4], expected: 0.1875 },
      { input: [2.0, 8], expected: 0.020833333333333332 },
      { input: [1.0, 1], expected: 0.3333333333333333 },
    ],
    hint: "Doubling the number of levels reduces the step size by half and the MSE by four.",
  },
  {
    id: "info-075",
    title: "Lloyd-Max One Update",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Perform one Lloyd-Max iteration. Assign every sample to its nearest centroid, breaking ties toward the lower index, then move each centroid to the mean of the samples assigned to it. A centroid that receives no samples keeps its old value. Return the updated centroid list.",
    starterCode: `def lloyd_max_update(samples, centroids):
    # Your code here
    pass`,
    solution: `def lloyd_max_update(samples, centroids):
    k = len(centroids)
    sums = [0.0] * k
    counts = [0] * k
    for x in samples:
        best = 0
        best_d = abs(x - centroids[0])
        for i in range(1, k):
            d = abs(x - centroids[i])
            if d < best_d:
                best_d = d
                best = i
        sums[best] += x
        counts[best] += 1
    out = []
    for i in range(k):
        if counts[i] > 0:
            out.append(sums[i] / counts[i])
        else:
            out.append(float(centroids[i]))
    return out`,
    testCases: [
      { input: [[0.0, 1.0, 2.0, 10.0], [0.0, 5.0]], expected: [1.0, 10.0] },
      { input: [[1.0, 2.0, 3.0, 10.0, 11.0, 12.0], [2.0, 11.0]], expected: [2.0, 11.0] },
      { input: [[0.0, 0.4, 0.6, 1.0], [0.25, 0.75]], expected: [0.2, 0.8] },
      { input: [[5.0], [0.0, 10.0]], expected: [5.0, 10.0] },
      { input: [[-3.0, -1.0, 4.0, 6.0], [0.0, 5.0]], expected: [-2.0, 5.0] },
    ],
    hint: "The assignment step uses the old centroids; the update step uses the new assignments.",
  },
  {
    id: "info-076",
    title: "Quantized Gaussian Entropy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Approximate the entropy in bits of a Gaussian with variance var after uniform quantization with step size step:\n\nH ~ 0.5 * log2(2 * pi * e * var) - log2(step)\n\nThat is the differential entropy minus the quantization resolution.",
    starterCode: `import math
def quantized_gaussian_entropy(var, step):
    # Your code here
    pass`,
    solution: `import math
def quantized_gaussian_entropy(var, step):
    return 0.5 * math.log2(2.0 * math.pi * math.e * var) - math.log2(step)`,
    testCases: [
      { input: [1.0, 1.0], expected: 2.047095585180641 },
      { input: [1.0, 0.5], expected: 3.047095585180641 },
      { input: [4.0, 1.0], expected: 3.047095585180641 },
      { input: [1.0, 2.0], expected: 1.047095585180641 },
    ],
    hint: "Finer quantization (smaller step) increases the discrete entropy.",
  },
  {
    id: "info-077",
    title: "Interaction Information Sign",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "From a 3D joint distribution joint[x][y][z], return the sign of the interaction information using the entropy expansion\n\nII = H(X) + H(Y) + H(Z) - H(X,Y) - H(X,Z) - H(Y,Z) + H(X,Y,Z)\n\nReturn 1 if II > 1e-9, -1 if II < -1e-9, and 0 otherwise. All entropies are in bits.",
    starterCode: `import math
def interaction_information_sign(joint):
    # Your code here
    pass`,
    solution: `import math
def interaction_information_sign(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    px = [0.0] * nx
    py = [0.0] * ny
    pz = [0.0] * nz
    pxy = [[0.0] * ny for _ in range(nx)]
    pxz = [[0.0] * nz for _ in range(nx)]
    pyz = [[0.0] * nz for _ in range(ny)]
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                px[x] += p
                py[y] += p
                pz[z] += p
                pxy[x][y] += p
                pxz[x][z] += p
                pyz[y][z] += p
    h_x = entropy_bits(px)
    h_y = entropy_bits(py)
    h_z = entropy_bits(pz)
    h_xy = entropy_bits(flatten(pxy))
    h_xz = entropy_bits(flatten(pxz))
    h_yz = entropy_bits(flatten(pyz))
    h_xyz = entropy_bits(flatten3(joint))
    ii = h_x + h_y + h_z - h_xy - h_xz - h_yz + h_xyz
    if ii > 1e-9:
        return 1
    if ii < -1e-9:
        return -1
    return 0

def flatten(table):
    out = []
    for row in table:
        for v in row:
            out.append(v)
    return out

def flatten3(table):
    out = []
    for a in table:
        for b in a:
            for v in b:
                out.append(v)
    return out

def entropy_bits(probs):
    t = 0.0
    for p in probs:
        if p > 0:
            t -= p * math.log2(p)
    return t`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0,
      },
      {
        input: [[[[0.25, 0.0], [0.0, 0.25]], [[0.0, 0.25], [0.25, 0.0]]]],
        expected: -1,
      },
      {
        input: [[[[0.5, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.5]]]],
        expected: 1,
      },
      {
        input: [[[[0.25, 0.25], [0.0, 0.0]], [[0.0, 0.0], [0.25, 0.25]]]],
        expected: 0,
      },
    ],
    hint: "The XOR distribution is the classic case of negative interaction information.",
  },
  {
    id: "info-078",
    title: "Total Correlation",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the total correlation (multi-information) in bits of a 3D joint distribution joint[x][y][z]:\n\nTC = H(X) + H(Y) + H(Z) - H(X, Y, Z)",
    starterCode: `import math
def total_correlation(joint):
    # Your code here
    pass`,
    solution: `import math
def total_correlation(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    px = [0.0] * nx
    py = [0.0] * ny
    pz = [0.0] * nz
    h_xyz = 0.0
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                px[x] += p
                py[y] += p
                pz[z] += p
                if p > 0:
                    h_xyz -= p * math.log2(p)
    h_x = 0.0
    for p in px:
        if p > 0:
            h_x -= p * math.log2(p)
    h_y = 0.0
    for p in py:
        if p > 0:
            h_y -= p * math.log2(p)
    h_z = 0.0
    for p in pz:
        if p > 0:
            h_z -= p * math.log2(p)
    return h_x + h_y + h_z - h_xyz`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.5, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.5]]]],
        expected: 2.0,
      },
      {
        input: [[[[0.25, 0.25], [0.0, 0.0]], [[0.0, 0.0], [0.25, 0.25]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.2, 0.1], [0.05, 0.05]], [[0.05, 0.05], [0.1, 0.2]]]],
        expected: 0.715084951819779,
      },
    ],
    hint: "Total correlation is zero exactly when the three variables are independent.",
  },
  {
    id: "info-079",
    title: "Dual Total Correlation",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the dual total correlation in bits of a 3D joint distribution joint[x][y][z]:\n\nDTC = H(X,Y) + H(X,Z) + H(Y,Z) - 2 * H(X,Y,Z)\n\nEquivalently, H(X,Y,Z) minus the sum of H(X|YZ) + H(Y|XZ) + H(Z|XY).",
    starterCode: `import math
def dual_total_correlation(joint):
    # Your code here
    pass`,
    solution: `import math
def dual_total_correlation(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    h_xyz = 0.0
    pxy = [[0.0] * ny for _ in range(nx)]
    pxz = [[0.0] * nz for _ in range(nx)]
    pyz = [[0.0] * nz for _ in range(ny)]
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                pxy[x][y] += p
                pxz[x][z] += p
                pyz[y][z] += p
                if p > 0:
                    h_xyz -= p * math.log2(p)
    h_xy = 0.0
    for row in pxy:
        for p in row:
            if p > 0:
                h_xy -= p * math.log2(p)
    h_xz = 0.0
    for row in pxz:
        for p in row:
            if p > 0:
                h_xz -= p * math.log2(p)
    h_yz = 0.0
    for row in pyz:
        for p in row:
            if p > 0:
                h_yz -= p * math.log2(p)
    return h_xy + h_xz + h_yz - 2.0 * h_xyz`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.5, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.5]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.25, 0.25], [0.0, 0.0]], [[0.0, 0.0], [0.25, 0.25]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.2, 0.1], [0.05, 0.05]], [[0.05, 0.05], [0.1, 0.2]]]],
        expected: 0.43365938015714,
      },
    ],
    hint: "Dual total correlation equals total correlation for three variables only in special cases.",
  },
  {
    id: "info-080",
    title: "Transfer Entropy (Lag 1)",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the lag-1 transfer entropy in bits from X to Y given the joint joint[x_prev][y_prev][y_t]:\n\nT = H(Y_t | Y_prev) - H(Y_t | X_prev, Y_prev)\n\nBuild the needed marginals and use entropy in bits for every term.",
    starterCode: `import math
def transfer_entropy(joint):
    # Your code here
    pass`,
    solution: `import math
def transfer_entropy(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    pyz = [[0.0] * nz for _ in range(ny)]
    pyp = [0.0] * ny
    pxyp = [[0.0] * ny for _ in range(nx)]
    h_all = 0.0
    for x in range(nx):
        for yp in range(ny):
            for y in range(nz):
                p = joint[x][yp][y]
                pyz[yp][y] += p
                pyp[yp] += p
                pxyp[x][yp] += p
                if p > 0:
                    h_all -= p * math.log2(p)
    h_pyz = 0.0
    for row in pyz:
        for p in row:
            if p > 0:
                h_pyz -= p * math.log2(p)
    h_yp = 0.0
    for p in pyp:
        if p > 0:
            h_yp -= p * math.log2(p)
    h_xyp = 0.0
    for row in pxyp:
        for p in row:
            if p > 0:
                h_xyp -= p * math.log2(p)
    return (h_pyz - h_yp) - (h_all - h_xyp)`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.25, 0.0], [0.25, 0.0]], [[0.0, 0.25], [0.0, 0.25]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.4, 0.1], [0.1, 0.4]], [[0.4, 0.1], [0.1, 0.4]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.15, 0.1], [0.1, 0.15]], [[0.05, 0.2], [0.2, 0.05]]]],
        expected: 0.12451124978365313,
      },
    ],
    hint: "Transfer entropy is zero when the past of X adds nothing beyond Y's own past.",
  },
  {
    id: "info-081",
    title: "Predictive Information",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the predictive information in bits from the joint joint[x_prev][x_cur][x_next]:\n\nPI = I((X_prev, X_cur); X_next) = H(X_next) - H(X_next | X_prev, X_cur)",
    starterCode: `import math
def predictive_information(joint):
    # Your code here
    pass`,
    solution: `import math
def predictive_information(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    pxn = [0.0] * nz
    pxy = [[0.0] * ny for _ in range(nx)]
    h_all = 0.0
    for xp in range(nx):
        for xc in range(ny):
            for xn in range(nz):
                p = joint[xp][xc][xn]
                pxn[xn] += p
                pxy[xp][xc] += p
                if p > 0:
                    h_all -= p * math.log2(p)
    h_xn = 0.0
    for p in pxn:
        if p > 0:
            h_xn -= p * math.log2(p)
    h_xp_xc = 0.0
    for row in pxy:
        for p in row:
            if p > 0:
                h_xp_xc -= p * math.log2(p)
    return h_xn - (h_all - h_xp_xc)`,
    testCases: [
      {
        input: [[[[0.125, 0.125], [0.125, 0.125]], [[0.125, 0.125], [0.125, 0.125]]]],
        expected: 0.0,
      },
      {
        input: [[[[0.25, 0.0], [0.0, 0.25]], [[0.25, 0.0], [0.0, 0.25]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.25, 0.0], [0.0, 0.25]], [[0.0, 0.25], [0.25, 0.0]]]],
        expected: 1.0,
      },
      {
        input: [[[[0.2, 0.05], [0.05, 0.2]], [[0.2, 0.05], [0.05, 0.2]]]],
        expected: 0.2780719051126379,
      },
    ],
    hint: "Predictive information measures how much the two-step history tells us about the future.",
  },
  {
    id: "info-082",
    title: "Information Bottleneck Objective",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the information bottleneck objective in bits for the joint pxy and the encoder pt_given_x where pt_given_x[x][t] = P(t | x):\n\nL = I(X; T) - beta * I(T; Y)\n\nBuild p(x, t, y) = pxy[x][y] * P(t | x), marginalize, and evaluate both mutual informations in bits.",
    starterCode: `import math
def information_bottleneck(pxy, pt_given_x, beta):
    # Your code here
    pass`,
    solution: `import math
def information_bottleneck(pxy, pt_given_x, beta):
    nx = len(pxy)
    ny = len(pxy[0])
    nt = len(pt_given_x[0])
    pxt = [[0.0] * nt for _ in range(nx)]
    pty = [[0.0] * ny for _ in range(nt)]
    pt = [0.0] * nt
    px = [0.0] * nx
    py = [0.0] * ny
    for x in range(nx):
        for y in range(ny):
            for t in range(nt):
                p = pxy[x][y] * pt_given_x[x][t]
                pxt[x][t] += p
                pty[t][y] += p
                pt[t] += p
    for x in range(nx):
        for y in range(ny):
            px[x] += pxy[x][y]
            py[y] += pxy[x][y]
    i_xt = 0.0
    for x in range(nx):
        for t in range(nt):
            p = pxt[x][t]
            if p > 0:
                i_xt += p * math.log2(p / (px[x] * pt[t]))
    i_ty = 0.0
    for t in range(nt):
        for y in range(ny):
            p = pty[t][y]
            if p > 0:
                i_ty += p * math.log2(p / (pt[t] * py[y]))
    return i_xt - beta * i_ty`,
    testCases: [
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]], 0.5], expected: 0.5 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]], 2.0], expected: -1.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[0.5, 0.5], [0.5, 0.5]], 1.0], expected: 0.0 },
      {
        input: [[[0.4, 0.1], [0.1, 0.4]], [[0.9, 0.1], [0.1, 0.9]], 1.0],
        expected: 0.35775077890333673,
      },
    ],
    hint: "A constant encoder destroys all information, so I(X; T) and I(T; Y) both vanish.",
  },
  {
    id: "info-083",
    title: "Bigram Perplexity",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a 2D table of bigram counts, compute the conditional entropy H(Y | X) in bits and return the perplexity 2^H. Rows with zero total are skipped.",
    starterCode: `import math
def bigram_perplexity(counts):
    # Your code here
    pass`,
    solution: `import math
def bigram_perplexity(counts):
    total = 0.0
    for row in counts:
        total += sum(row)
    h = 0.0
    for row in counts:
        rs = sum(row)
        if rs > 0:
            for c in row:
                if c > 0:
                    p = c / rs
                    h -= (rs / total) * p * math.log2(p)
    return 2.0 ** h`,
    testCases: [
      { input: [[[1, 1], [1, 1]]], expected: 2.0 },
      { input: [[[10, 0], [0, 10]]], expected: 1.0 },
      { input: [[[3, 1], [0, 4]]], expected: 1.324675564281052 },
      { input: [[[1, 2, 3], [3, 2, 1]]], expected: 2.7494592739972052 },
    ],
    hint: "Perplexity is the exponentiated conditional entropy of the next token.",
  },
  {
    id: "info-084",
    title: "Cross-Entropy with Smoothing",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the cross-entropy in bits of a smoothed model. With n outcomes and smoothing eps, the model probability becomes\n\nq'_i = (1 - eps) * q_i + eps / n\n\nand the cross-entropy is -sum(p_i * log2(q'_i)) over outcomes with p_i > 0.",
    starterCode: `import math
def smoothed_cross_entropy(p, q, eps):
    # Your code here
    pass`,
    solution: `import math
def smoothed_cross_entropy(p, q, eps):
    n = len(p)
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total -= pi * math.log2((1.0 - eps) * qi + eps / n)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5], 0.1], expected: 1.0 },
      { input: [[1.0, 0.0], [1.0, 0.0], 0.5], expected: 0.4150374992788438 },
      { input: [[0.5, 0.5], [0.25, 0.75], 0.2], expected: 1.125769383497982 },
      {
        input: [[0.25, 0.25, 0.25, 0.25], [1.0, 0.0, 0.0, 0.0], 0.4],
        expected: 2.6200893643729612,
      },
    ],
    hint: "Smoothing lifts zero probabilities, so the cross-entropy stays finite.",
  },
  {
    id: "info-085",
    title: "KL Smoothing Penalty",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the KL divergence in bits from p to its own eps-smoothed version:\n\np'_i = (1 - eps) * p_i + eps / n\n\nD(p || p') is the information cost of adding eps of uniform smoothing.",
    starterCode: `import math
def kl_smoothing_penalty(p, eps):
    # Your code here
    pass`,
    solution: `import math
def kl_smoothing_penalty(p, eps):
    n = len(p)
    total = 0.0
    for pi in p:
        if pi > 0:
            qi = (1.0 - eps) * pi + eps / n
            total += pi * math.log2(pi / qi)
    return total`,
    testCases: [
      { input: [[1.0, 0.0], 0.5], expected: 0.41503749927884376 },
      { input: [[0.5, 0.5], 0.25], expected: 0.0 },
      { input: [[0.9, 0.1], 0.2], expected: 0.03607129188493674 },
      { input: [[0.5, 0.5], 0.0], expected: 0.0 },
    ],
    hint: "Smoothing an already uniform distribution changes nothing.",
  },
  {
    id: "info-086",
    title: "Perplexity of Uniform Distribution",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the perplexity of a uniform distribution over vocab_size outcomes, which equals the vocabulary size itself as a float: 2^(log2(V)) = V.",
    starterCode: `def uniform_perplexity(vocab_size):
    # Your code here
    pass`,
    solution: `def uniform_perplexity(vocab_size):
    return float(vocab_size)`,
    testCases: [
      { input: [2], expected: 2.0 },
      { input: [10], expected: 10.0 },
      { input: [1], expected: 1.0 },
      { input: [32000], expected: 32000.0 },
    ],
    hint: "A uniform model is maximally uncertain, so its perplexity is the whole vocabulary.",
  },
  {
    id: "info-087",
    title: "Cross-Entropy from Counts",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Given raw counts and a model distribution q, return the cross-entropy in bits of the empirical distribution:\n\nH = -sum((c_i / sum(c)) * log2(q_i))\n\nSkip outcomes with c_i = 0.",
    starterCode: `import math
def cross_entropy_from_counts(counts, q):
    # Your code here
    pass`,
    solution: `import math
def cross_entropy_from_counts(counts, q):
    total = sum(counts)
    ce = 0.0
    for c, qi in zip(counts, q):
        if c > 0:
            ce -= (c / total) * math.log2(qi)
    return ce`,
    testCases: [
      { input: [[1, 1], [0.5, 0.5]], expected: 1.0 },
      { input: [[3, 1], [0.5, 0.5]], expected: 1.0 },
      { input: [[1, 0], [0.25, 0.75]], expected: 2.0 },
      { input: [[1, 2, 3, 4], [0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
    ],
    hint: "Normalize the counts into frequencies before weighting the log probabilities.",
  },
  {
    id: "info-088",
    title: "Markov Entropy Rate (2-State)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "For a two-state Markov chain with transition probabilities p01 (0 -> 1) and p10 (1 -> 0), return the entropy rate in bits:\n\npi0 = p10 / (p01 + p10), pi1 = p01 / (p01 + p10)\nR = pi0 * H(p01) + pi1 * H(p10)\n\nwhere H is the binary entropy function in bits.",
    starterCode: `import math
def markov_rate_2state(p01, p10):
    # Your code here
    pass`,
    solution: `import math
def markov_rate_2state(p01, p10):
    pi0 = p10 / (p01 + p10)
    pi1 = p01 / (p01 + p10)
    return pi0 * binary_entropy(p01) + pi1 * binary_entropy(p10)

def binary_entropy(x):
    if x <= 0.0 or x >= 1.0:
        return 0.0
    return -x * math.log2(x) - (1.0 - x) * math.log2(1.0 - x)`,
    testCases: [
      { input: [0.5, 0.5], expected: 1.0 },
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [0.1, 0.2], expected: 0.5533064273553082 },
      { input: [0.5, 0.25], expected: 0.8741854163060885 },
    ],
    hint: "The stationary distribution weights each state's transition entropy.",
  },
  {
    id: "info-089",
    title: "Periodic Source Entropy Rate",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "A source picks one of several equal-length deterministic periodic patterns with the given probabilities and repeats it forever. Return the entropy rate in bits per symbol:\n\nR = entropy_bits(probs) / len(patterns[0])\n\nThe entropy of the pattern choice is spread over the period length.",
    starterCode: `import math
def periodic_source_rate(patterns, probs):
    # Your code here
    pass`,
    solution: `import math
def periodic_source_rate(patterns, probs):
    h = 0.0
    for p in probs:
        if p > 0:
            h -= p * math.log2(p)
    return h / len(patterns[0])`,
    testCases: [
      { input: [["ab", "cd"], [0.5, 0.5]], expected: 0.5 },
      { input: [["abc"], [1.0]], expected: 0.0 },
      {
        input: [["01", "10", "00"], [0.3333333333333333, 0.3333333333333333, 0.3333333333333333]],
        expected: 0.792481250360578,
      },
      { input: [["abcd", "bcda", "cdab", "dabc"], [0.25, 0.25, 0.25, 0.25]], expected: 0.5 },
    ],
    hint: "One deterministic pattern carries no information, so its rate is zero.",
  },
  {
    id: "info-090",
    title: "Directed Information Lite",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the one-step directed information in bits over the joint joint[x0][y0][x1][y1]:\n\nDI = I(X0, X1; Y1 | Y0) = H(X0, X1 | Y0) - H(X0, X1 | Y0, Y1)\n\nMarginalize the 4D table to build both conditional entropies.",
    starterCode: `import math
def directed_information_lite(joint):
    # Your code here
    pass`,
    solution: `import math
def directed_information_lite(joint):
    n0 = len(joint)
    m0 = len(joint[0])
    n1 = len(joint[0][0])
    m1 = len(joint[0][0][0])
    pxxy0 = [[[0.0] * m0 for _ in range(n1)] for _ in range(n0)]
    py0 = [0.0] * m0
    py0y1 = [[0.0] * m1 for _ in range(m0)]
    h_all = 0.0
    for x0 in range(n0):
        for y0 in range(m0):
            for x1 in range(n1):
                for y1 in range(m1):
                    p = joint[x0][y0][x1][y1]
                    pxxy0[x0][x1][y0] += p
                    py0[y0] += p
                    py0y1[y0][y1] += p
                    if p > 0:
                        h_all -= p * math.log2(p)
    h_xxy0 = 0.0
    for a in pxxy0:
        for row in a:
            for p in row:
                if p > 0:
                    h_xxy0 -= p * math.log2(p)
    h_y0 = 0.0
    for p in py0:
        if p > 0:
            h_y0 -= p * math.log2(p)
    h_y0y1 = 0.0
    for row in py0y1:
        for p in row:
            if p > 0:
                h_y0y1 -= p * math.log2(p)
    return (h_xxy0 - h_y0) - (h_all - h_y0y1)`,
    testCases: [
      {
        input: [
          [
            [[[0.0625, 0.0625], [0.0625, 0.0625]], [[0.0625, 0.0625], [0.0625, 0.0625]]],
            [[[0.0625, 0.0625], [0.0625, 0.0625]], [[0.0625, 0.0625], [0.0625, 0.0625]]],
          ],
        ],
        expected: 0.0,
      },
      {
        input: [
          [
            [[[0.125, 0.0], [0.125, 0.0]], [[0.125, 0.0], [0.125, 0.0]]],
            [[[0.0, 0.125], [0.0, 0.125]], [[0.0, 0.125], [0.0, 0.125]]],
          ],
        ],
        expected: 1.0,
      },
      {
        input: [
          [
            [[[0.125, 0.0], [0.0, 0.125]], [[0.125, 0.0], [0.0, 0.125]]],
            [[[0.125, 0.0], [0.0, 0.125]], [[0.125, 0.0], [0.0, 0.125]]],
          ],
        ],
        expected: 1.0,
      },
      {
        input: [
          [
            [[[0.1, 0.025], [0.1, 0.025]], [[0.1, 0.025], [0.1, 0.025]]],
            [[[0.025, 0.1], [0.025, 0.1]], [[0.025, 0.1], [0.025, 0.1]]],
          ],
        ],
        expected: 0.27807190511263835,
      },
    ],
    hint: "Condition on Y0 by subtracting H(Y0) from the joint entropies of the remaining variables.",
  },
];
