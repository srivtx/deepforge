import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-091",
    title: "Hamming (7,4) Encode",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Encode 4 data bits into a systematic Hamming(7,4) codeword with the data bits at positions 3, 5, 6 and 7 using 1-indexed positions. With data = [d1, d2, d3, d4] compute p1 = d1^d2^d4, p2 = d1^d3^d4 and p4 = d2^d3^d4, then return the codeword [p1, p2, d1, p4, d2, d3, d4].",
    starterCode: `def hamming74_encode(data):
    # Your code here
    pass`,
    solution: `def hamming74_encode(data):
    d1, d2, d3, d4 = data[0], data[1], data[2], data[3]
    p1 = d1 ^ d2 ^ d4
    p2 = d1 ^ d3 ^ d4
    p4 = d2 ^ d3 ^ d4
    return [p1, p2, d1, p4, d2, d3, d4]`,
    testCases: [
      { input: [[0, 0, 0, 0]], expected: [0, 0, 0, 0, 0, 0, 0] },
      { input: [[1, 0, 0, 0]], expected: [1, 1, 1, 0, 0, 0, 0] },
      { input: [[0, 1, 0, 0]], expected: [1, 0, 0, 1, 1, 0, 0] },
      { input: [[1, 1, 1, 1]], expected: [1, 1, 1, 1, 1, 1, 1] },
    ],
    hint: "Each parity bit covers the data positions that have its index bit set.",
  },
  {
    id: "info-092",
    title: "Hamming (7,4) Syndrome",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the integer syndrome of a received 7-bit word for the systematic Hamming(7,4) code. Evaluate s1 = c1^c3^c5^c7, s2 = c2^c3^c6^c7 and s4 = c4^c5^c6^c7, then return s1 + 2 * s2 + 4 * s4. The result is 0 for a valid codeword and gives the 1-indexed error position otherwise.",
    starterCode: `def hamming74_syndrome(received):
    # Your code here
    pass`,
    solution: `def hamming74_syndrome(received):
    s1 = received[0] ^ received[2] ^ received[4] ^ received[6]
    s2 = received[1] ^ received[2] ^ received[5] ^ received[6]
    s4 = received[3] ^ received[4] ^ received[5] ^ received[6]
    return s1 + 2 * s2 + 4 * s4`,
    testCases: [
      { input: [[0, 0, 0, 0, 0, 0, 0]], expected: 0 },
      { input: [[1, 1, 1, 0, 0, 0, 0]], expected: 0 },
      { input: [[0, 1, 1, 0, 0, 0, 0]], expected: 1 },
      { input: [[0, 0, 0, 0, 1, 0, 0]], expected: 5 },
    ],
    hint: "The syndrome bits are read as a little-endian binary position number.",
  },
  {
    id: "info-093",
    title: "Hamming (7,4) Decode",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Correct a single-bit error in a received 7-bit Hamming(7,4) word. Compute the three parity checks, combine them into the position s1 + 2 * s2 + 4 * s4, and flip that 1-indexed bit when the position is nonzero. Return the corrected word.",
    starterCode: `def hamming74_decode(received):
    # Your code here
    pass`,
    solution: `def hamming74_decode(received):
    out = list(received)
    s1 = out[0] ^ out[2] ^ out[4] ^ out[6]
    s2 = out[1] ^ out[2] ^ out[5] ^ out[6]
    s4 = out[3] ^ out[4] ^ out[5] ^ out[6]
    pos = s1 + 2 * s2 + 4 * s4
    if pos > 0:
        out[pos - 1] ^= 1
    return out`,
    testCases: [
      { input: [[1, 1, 1, 0, 0, 0, 0]], expected: [1, 1, 1, 0, 0, 0, 0] },
      { input: [[0, 1, 1, 0, 0, 0, 0]], expected: [1, 1, 1, 0, 0, 0, 0] },
      { input: [[1, 1, 1, 0, 1, 0, 0]], expected: [1, 1, 1, 0, 0, 0, 0] },
      { input: [[0, 0, 0, 0, 1, 0, 0]], expected: [0, 0, 0, 0, 0, 0, 0] },
    ],
    hint: "A zero syndrome means the word is already a valid codeword.",
  },
  {
    id: "info-094",
    title: "Repetition Majority Decode",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Decode a repetition code by majority vote: return 1 when the list contains more ones than zeros and 0 otherwise. Assume the list has odd length.",
    starterCode: `def repetition_majority_decode(bits):
    # Your code here
    pass`,
    solution: `def repetition_majority_decode(bits):
    return 1 if sum(bits) * 2 > len(bits) else 0`,
    testCases: [
      { input: [[1, 1, 1]], expected: 1 },
      { input: [[0, 0, 0]], expected: 0 },
      { input: [[1, 0, 1]], expected: 1 },
      { input: [[0, 0, 1]], expected: 0 },
      { input: [[1, 0, 0, 1, 1]], expected: 1 },
    ],
    hint: "Compare twice the number of ones against the length.",
  },
  {
    id: "info-095",
    title: "Parity-Check Syndrome",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the syndrome of a received binary vector with respect to a parity-check matrix: syndrome = H * received mod 2. Row i of the returned list is the XOR of the received bits selected by row i of H.",
    starterCode: `def parity_check_syndrome(received, h_matrix):
    # Your code here
    pass`,
    solution: `def parity_check_syndrome(received, h_matrix):
    out = []
    for row in h_matrix:
        s = 0
        for a, b in zip(row, received):
            s ^= (a & b)
        out.append(s)
    return out`,
    testCases: [
      { input: [[1, 0, 1], [[1, 1, 0], [0, 1, 1]]], expected: [1, 1] },
      { input: [[1, 1, 1], [[1, 1, 0], [0, 1, 1]]], expected: [0, 0] },
      { input: [[0, 0, 0], [[1, 1, 0], [0, 1, 1]]], expected: [0, 0] },
      {
        input: [[1, 0, 1, 0], [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 1, 1]]],
        expected: [0, 0, 0],
      },
    ],
    hint: "Work in GF(2): multiply and add are AND and XOR.",
  },
  {
    id: "info-096",
    title: "Generator Matrix Encode",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Encode a binary message by multiplying it with a generator matrix mod 2: codeword[j] = XOR over i of message[i] * G[i][j]. Return the codeword list.",
    starterCode: `def generator_matrix_encode(message, g_matrix):
    # Your code here
    pass`,
    solution: `def generator_matrix_encode(message, g_matrix):
    out = []
    for j in range(len(g_matrix[0])):
        s = 0
        for i in range(len(message)):
            s ^= (message[i] & g_matrix[i][j])
        out.append(s)
    return out`,
    testCases: [
      { input: [[1, 0], [[1, 0, 0], [0, 1, 1]]], expected: [1, 0, 0] },
      { input: [[0, 1], [[1, 0, 0], [0, 1, 1]]], expected: [0, 1, 1] },
      { input: [[1, 1], [[1, 0, 0], [0, 1, 1]]], expected: [1, 1, 1] },
      {
        input: [[1, 0, 1], [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]]],
        expected: [1, 0, 1, 0],
      },
    ],
    hint: "Each message bit selects rows of G to XOR together.",
  },
  {
    id: "info-097",
    title: "Minimum Distance",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the minimum Hamming distance between any two distinct codewords in the list. All codewords have the same length. Return 0 when fewer than two codewords are supplied.",
    starterCode: `def minimum_distance(codewords):
    # Your code here
    pass`,
    solution: `def minimum_distance(codewords):
    best = None
    for i in range(len(codewords)):
        for j in range(i + 1, len(codewords)):
            d = 0
            for a, b in zip(codewords[i], codewords[j]):
                if a != b:
                    d += 1
            if best is None or d < best:
                best = d
    if best is None:
        return 0
    return best`,
    testCases: [
      { input: [[[0, 0, 0], [1, 1, 0], [1, 0, 1]]], expected: 2 },
      { input: [[[0, 0, 0], [0, 0, 1], [0, 0, 0]]], expected: 0 },
      { input: [[[1, 1, 1, 1], [0, 0, 0, 0]]], expected: 4 },
      { input: [[[1, 0, 1, 0, 1]]], expected: 0 },
      { input: [[[0, 0], [1, 1], [1, 0], [0, 1]]], expected: 1 },
    ],
    hint: "The minimum distance also equals the minimum weight of a nonzero codeword for linear codes.",
  },
  {
    id: "info-098",
    title: "Code Rate",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the rate k / n of a code that encodes k message bits into n code bits. The rate is the fraction of transmitted bits that carry new information.",
    starterCode: `def code_rate(k, n):
    # Your code here
    pass`,
    solution: `def code_rate(k, n):
    return k / n`,
    testCases: [
      { input: [4, 7], expected: 0.5714285714285714 },
      { input: [1, 3], expected: 0.3333333333333333 },
      { input: [1, 2], expected: 0.5 },
      { input: [4, 4], expected: 1.0 },
    ],
    hint: "An uncoded system has rate 1.",
  },
  {
    id: "info-099",
    title: "Error Correction Capability",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the number of errors a code with minimum distance d can always correct: t = floor((d - 1) / 2).",
    starterCode: `def error_correction_capability(d):
    # Your code here
    pass`,
    solution: `def error_correction_capability(d):
    return (d - 1) // 2`,
    testCases: [
      { input: [1], expected: 0 },
      { input: [2], expected: 0 },
      { input: [3], expected: 1 },
      { input: [7], expected: 3 },
      { input: [4], expected: 1 },
    ],
    hint: "Correctable error spheres of radius t must not overlap.",
  },
  {
    id: "info-100",
    title: "Hamming Bound Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Check the sphere-packing (Hamming) bound for a binary code with parameters (n, k, d). With t = floor((d - 1) / 2), return True when the number of words in a radius-t sphere around a codeword, sum_{i=0}^{t} C(n, i), does not exceed the number of syndromes 2^(n - k).",
    starterCode: `import math
def hamming_bound_holds(n, k, d):
    # Your code here
    pass`,
    solution: `import math
def hamming_bound_holds(n, k, d):
    t = (d - 1) // 2
    sphere = 0
    for i in range(t + 1):
        sphere += math.comb(n, i)
    return sphere <= 2 ** (n - k)`,
    testCases: [
      { input: [7, 4, 3], expected: true },
      { input: [4, 2, 3], expected: false },
      { input: [3, 1, 3], expected: true },
      { input: [7, 3, 4], expected: true },
      { input: [5, 2, 3], expected: true },
    ],
    hint: "Perfect codes such as Hamming(7,4) meet the bound with equality.",
  },
  {
    id: "info-101",
    title: "Singleton Bound Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True when the code parameters (n, k, d) satisfy the Singleton bound d <= n - k + 1, and False otherwise.",
    starterCode: `def singleton_bound_holds(n, k, d):
    # Your code here
    pass`,
    solution: `def singleton_bound_holds(n, k, d):
    return d <= n - k + 1`,
    testCases: [
      { input: [7, 4, 3], expected: true },
      { input: [7, 4, 5], expected: false },
      { input: [5, 2, 4], expected: true },
      { input: [10, 3, 9], expected: false },
    ],
    hint: "Puncturing a code reduces d by at most 1 for each parity symbol removed.",
  },
  {
    id: "info-102",
    title: "Gilbert-Varshamov Bound",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Gilbert-Varshamov lower bound on the maximum size of a binary code of length n and minimum distance d:\n\nM >= ceil(2^n / sum_{i=0}^{d-1} C(n, i))\n\nReturn the value of the right-hand side as an integer.",
    starterCode: `import math
def gilbert_varshamov_bound(n, d):
    # Your code here
    pass`,
    solution: `import math
def gilbert_varshamov_bound(n, d):
    volume = 0
    for i in range(d):
        volume += math.comb(n, i)
    return math.ceil(2 ** n / volume)`,
    testCases: [
      { input: [7, 3], expected: 5 },
      { input: [7, 1], expected: 128 },
      { input: [15, 3], expected: 271 },
      { input: [5, 3], expected: 2 },
      { input: [10, 5], expected: 3 },
    ],
    hint: "For d = 1 the ball volume is 1 and the bound is the whole space.",
  },
  {
    id: "info-103",
    title: "CRC Remainder",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the CRC remainder by binary polynomial long division. Append len(poly) - 1 zero bits to data, then for every position where the current leading bit is 1, XOR the polynomial into the window starting there. Return the final len(poly) - 1 remainder bits.",
    starterCode: `def crc_remainder(data, poly):
    # Your code here
    pass`,
    solution: `def crc_remainder(data, poly):
    m = len(poly) - 1
    bits = list(data) + [0] * m
    for i in range(len(data)):
        if bits[i] == 1:
            for j in range(len(poly)):
                bits[i + j] ^= poly[j]
    return bits[len(data):len(data) + m]`,
    testCases: [
      { input: [[1, 1, 0, 1], [1, 0, 1, 1]], expected: [0, 0, 1] },
      { input: [[1, 0, 1], [1, 1, 0, 1]], expected: [1, 1, 0] },
      { input: [[1], [1, 1]], expected: [1] },
      { input: [[1, 0, 1, 0, 1], [1, 0, 1]], expected: [0, 1] },
      { input: [[0, 0, 0], [1, 0, 1]], expected: [0, 0] },
    ],
    hint: "The polynomial always starts with a leading 1, so XOR clears the leading bit.",
  },
  {
    id: "info-104",
    title: "LFSR Step",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Advance a linear feedback shift register by one step. The feedback bit is the XOR of state[i] for every index in taps; the new state is [feedback] followed by the state minus its last bit.",
    starterCode: `def lfsr_step(state, taps):
    # Your code here
    pass`,
    solution: `def lfsr_step(state, taps):
    feedback = 0
    for i in taps:
        feedback ^= state[i]
    return [feedback] + list(state[:-1])`,
    testCases: [
      { input: [[1, 0, 1], [0, 2]], expected: [0, 1, 0] },
      { input: [[1, 0, 0], [1, 2]], expected: [0, 1, 0] },
      { input: [[0, 1, 1, 0], [0, 3]], expected: [0, 0, 1, 1] },
      { input: [[1, 1], [0, 1]], expected: [0, 1] },
    ],
    hint: "Each step shifts the register toward the end and injects the feedback at the front.",
  },
  {
    id: "info-105",
    title: "M-Sequence Period",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Simulate an n-bit shift register with the given feedback taps starting from the state [1, 0, ..., 0]. Each step computes the feedback as the XOR of the tapped bits and shifts it in at the front. Return the number of steps until the initial state repeats; return 0 if some state repeats before the initial state returns, which means the sequence is not maximal.",
    starterCode: `def m_sequence_period(n, taps):
    # Your code here
    pass`,
    solution: `def m_sequence_period(n, taps):
    start = [1] + [0] * (n - 1)
    state = list(start)
    seen = set()
    steps = 0
    while True:
        key = tuple(state)
        if key in seen:
            return 0
        seen.add(key)
        feedback = 0
        for i in taps:
            feedback ^= state[i]
        state = [feedback] + state[:-1]
        steps += 1
        if state == start:
            return steps`,
    testCases: [
      { input: [2, [0, 1]], expected: 3 },
      { input: [3, [0, 2]], expected: 7 },
      { input: [4, [0, 3]], expected: 15 },
      { input: [4, [1, 3]], expected: 6 },
      { input: [5, [1, 4]], expected: 31 },
    ],
    hint: "A maximal-length LFSR visits every nonzero state exactly once.",
  },
  {
    id: "info-106",
    title: "Convolutional Encoder Step",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute one step of a rate-1/2 convolutional encoder. Form combined = [bit] + state, then output [parity(combined, taps1), parity(combined, taps2)], where a tap list names the indices XORed together for that output.",
    starterCode: `def conv_step(state, bit, taps1, taps2):
    # Your code here
    pass`,
    solution: `def conv_step(state, bit, taps1, taps2):
    combined = [bit] + list(state)
    o1 = 0
    for i in taps1:
        o1 ^= combined[i]
    o2 = 0
    for i in taps2:
        o2 ^= combined[i]
    return [o1, o2]`,
    testCases: [
      { input: [[0, 0], 1, [0, 2], [0, 1, 2]], expected: [1, 1] },
      { input: [[1, 0], 0, [0, 2], [0, 1]], expected: [0, 1] },
      { input: [[1, 1], 1, [0, 1], [1, 2]], expected: [0, 0] },
      { input: [[1, 0, 1], 0, [1, 3], [0, 2, 3]], expected: [0, 1] },
    ],
    hint: "Index 0 of combined is the incoming bit; later indices are the register memory.",
  },
  {
    id: "info-107",
    title: "Viterbi Metric Update",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Perform one add-compare-select update of the Viterbi algorithm. For every next state j, compute new[j] = min over i of metrics[i] + branches[i][j], where branches[i][j] is the branch metric from state i to state j. Return the updated metric list.",
    starterCode: `def viterbi_update(metrics, branches):
    # Your code here
    pass`,
    solution: `def viterbi_update(metrics, branches):
    n = len(branches[0])
    out = []
    for j in range(n):
        best = None
        for i in range(len(metrics)):
            val = metrics[i] + branches[i][j]
            if best is None or val < best:
                best = val
        out.append(best)
    return out`,
    testCases: [
      { input: [[0, 5], [[0, 1], [3, 0]]], expected: [0, 1] },
      { input: [[2, 2], [[1, 0], [0, 1]]], expected: [2, 2] },
      { input: [[1, 4, 2], [[0, 2, 1], [3, 0, 2], [1, 1, 1]]], expected: [1, 3, 2] },
      { input: [[0, 0], [[5, 1], [1, 5]]], expected: [1, 1] },
    ],
    hint: "Each next state keeps only the cheapest incoming path.",
  },
  {
    id: "info-108",
    title: "Trellis State Count",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the number of states in a convolutional code trellis with the given constraint length: 2^(constraint_length - 1).",
    starterCode: `def trellis_state_count(constraint_length):
    # Your code here
    pass`,
    solution: `def trellis_state_count(constraint_length):
    return 2 ** (constraint_length - 1)`,
    testCases: [
      { input: [2], expected: 2 },
      { input: [3], expected: 4 },
      { input: [4], expected: 8 },
      { input: [7], expected: 64 },
    ],
    hint: "The state is the contents of the memory register, one bit shorter than the constraint length.",
  },
  {
    id: "info-109",
    title: "LDPC Sparsity Stats",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return [rows, columns, number_of_ones] for a parity-check matrix given as a list of rows.",
    starterCode: `def ldpc_sparsity_stats(h_matrix):
    # Your code here
    pass`,
    solution: `def ldpc_sparsity_stats(h_matrix):
    rows = len(h_matrix)
    cols = len(h_matrix[0]) if h_matrix else 0
    ones = 0
    for row in h_matrix:
        for v in row:
            if v == 1:
                ones += 1
    return [rows, cols, ones]`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 1]]], expected: [2, 3, 4] },
      { input: [[[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]]], expected: [3, 4, 6] },
      { input: [[[0, 0], [0, 0]]], expected: [2, 2, 0] },
      { input: [[[1, 1, 1, 1, 1]]], expected: [1, 5, 5] },
    ],
    hint: "Sparse parity-check matrices have far fewer ones than entries.",
  },
  {
    id: "info-110",
    title: "Polar Transform Pair",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Apply the 2-bit polar transform to a pair of bits: [u0, u1] -> [u0 ^ u1, u1]. This is the kernel from which larger polar codes are built recursively.",
    starterCode: `def polar_encode_pair(bits):
    # Your code here
    pass`,
    solution: `def polar_encode_pair(bits):
    return [bits[0] ^ bits[1], bits[1]]`,
    testCases: [
      { input: [[0, 0]], expected: [0, 0] },
      { input: [[1, 0]], expected: [1, 0] },
      { input: [[0, 1]], expected: [1, 1] },
      { input: [[1, 1]], expected: [0, 1] },
    ],
    hint: "The transform is its own inverse over GF(2).",
  },
  {
    id: "info-111",
    title: "Z-Channel Capacity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the capacity in bits of a Z-channel with crossover q, where a transmitted 1 is flipped to 0 with probability q and a 0 is never flipped:\n\nC = log2(1 + (1 - q) * q^(q / (1 - q)))\n\nReturn 1.0 for q <= 0 and 0.0 for q >= 1.",
    starterCode: `import math
def z_channel_capacity(q):
    # Your code here
    pass`,
    solution: `import math
def z_channel_capacity(q):
    if q <= 0.0:
        return 1.0
    if q >= 1.0:
        return 0.0
    return math.log2(1.0 + (1.0 - q) * q ** (q / (1.0 - q)))`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.5], expected: 0.32192809488736235 },
      { input: [0.1], expected: 0.7628482520105094 },
      { input: [0.25], expected: 0.5582386267373455 },
      { input: [0.9], expected: 0.05483743386065755 },
    ],
    hint: "The optimal input distribution for a Z-channel is not uniform.",
  },
  {
    id: "info-112",
    title: "Blahut-Arimoto Iteration",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Perform one Blahut-Arimoto iteration for a discrete memoryless channel and return the updated input distribution. With q(y) = sum_x px[x] * P(y|x), set px_new[x] proportional to exp(sum_y P(y|x) * ln(P(y|x) / q(y))), skipping terms where P(y|x) = 0. Subtract the largest exponent before exponentiating for numerical stability.",
    starterCode: `import math
def ba_iteration(px, channel):
    # Your code here
    pass`,
    solution: `import math
def ba_iteration(px, channel):
    n = len(channel)
    m = len(channel[0])
    qy = [0.0] * m
    for x in range(n):
        for y in range(m):
            qy[y] += px[x] * channel[x][y]
    terms = []
    for x in range(n):
        s = 0.0
        for y in range(m):
            if channel[x][y] > 0:
                s += channel[x][y] * math.log(channel[x][y] / qy[y])
        terms.append(s)
    top = max(terms)
    weights = [math.exp(t - top) for t in terms]
    total = sum(weights)
    return [w / total for w in weights]`,
    testCases: [
      { input: [[0.5, 0.5], [[1.0, 0.0], [0.0, 1.0]]], expected: [0.5, 0.5] },
      {
        input: [[0.9, 0.1], [[0.9, 0.1], [0.1, 0.9]]],
        expected: [0.22915688898295755, 0.7708431110170424],
      },
      {
        input: [[0.5, 0.5], [[0.75, 0.25, 0.0], [0.0, 0.25, 0.75]]],
        expected: [0.5, 0.5],
      },
      { input: [[0.3, 0.7], [[1.0, 0.0], [0.0, 1.0]]], expected: [0.7, 0.3] },
    ],
    hint: "For a noiseless channel the update pushes mass toward previously unlikely inputs.",
  },
  {
    id: "info-113",
    title: "Z-Channel Mutual Information",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute I(X;Y) in bits for a Z-channel where P(X = 1) = px1 and a 1 is flipped to 0 with probability q while a 0 is never flipped. With py1 = px1 * (1 - q):\n\nI = H(py1) - px1 * H(q)\n\nwhere H is the binary entropy function in bits.",
    starterCode: `import math
def z_channel_mi(px1, q):
    # Your code here
    pass`,
    solution: `import math
def z_channel_mi(px1, q):
    py1 = px1 * (1.0 - q)
    return binary_entropy(py1) - px1 * binary_entropy(q)

def binary_entropy(x):
    if x <= 0.0 or x >= 1.0:
        return 0.0
    return -x * math.log2(x) - (1.0 - x) * math.log2(1.0 - x)`,
    testCases: [
      { input: [0.5, 0.0], expected: 1.0 },
      { input: [0.5, 0.5], expected: 0.31127812445913283 },
      { input: [1.0, 0.2], expected: 0.0 },
      { input: [0.9, 0.1], expected: 0.27937542565354423 },
    ],
    hint: "Only inputs of 1 can be corrupted, so H(Y|X) = px1 * H(q).",
  },
  {
    id: "info-114",
    title: "Gaussian Q-Function",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Gaussian Q-function, the tail probability of a standard normal variable:\n\nQ(x) = 0.5 * erfc(x / sqrt(2))",
    starterCode: `import math
def gaussian_q(x):
    # Your code here
    pass`,
    solution: `import math
def gaussian_q(x):
    return 0.5 * math.erfc(x / math.sqrt(2.0))`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [1.0], expected: 0.15865525393145705 },
      { input: [2.0], expected: 0.022750131948179216 },
      { input: [-1.0], expected: 0.8413447460685429 },
    ],
    hint: "By symmetry Q(-x) = 1 - Q(x).",
  },
  {
    id: "info-115",
    title: "BPSK BER",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the bit error rate of BPSK over an AWGN channel given the linear signal-to-noise ratio:\n\nBER = 0.5 * erfc(sqrt(snr))",
    starterCode: `import math
def bpsk_ber(snr_linear):
    # Your code here
    pass`,
    solution: `import math
def bpsk_ber(snr_linear):
    return 0.5 * math.erfc(math.sqrt(snr_linear))`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [1.0], expected: 0.07864960352514258 },
      { input: [4.0], expected: 0.0023388674905236322 },
      { input: [10.0], expected: 3.872108215522037e-06 },
      { input: [0.25], expected: 0.23975006109347674 },
    ],
    hint: "The error probability is Q(sqrt(2 * Eb/N0)) with snr = Eb/N0.",
  },
  {
    id: "info-116",
    title: "Repetition Code BER",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the post-decoding bit error rate of a length-n repetition code with majority decoding over a BSC with crossover p:\n\nP_e = sum_{i=(n+1)/2}^{n} C(n, i) * p^i * (1 - p)^(n - i)\n\nAssume n is odd.",
    starterCode: `import math
def repetition_ber(p, n):
    # Your code here
    pass`,
    solution: `import math
def repetition_ber(p, n):
    total = 0.0
    for i in range((n + 1) // 2, n + 1):
        total += math.comb(n, i) * p ** i * (1.0 - p) ** (n - i)
    return total`,
    testCases: [
      { input: [0.1, 3], expected: 0.028000000000000008 },
      { input: [0.5, 3], expected: 0.5 },
      { input: [0.1, 5], expected: 0.008560000000000002 },
      { input: [0.2, 3], expected: 0.10400000000000004 },
    ],
    hint: "An error survives majority decoding only when more than half the bits flip.",
  },
  {
    id: "info-117",
    title: "MRC Combined SNR",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the combined output signal-to-noise ratio of maximal-ratio combining with unit signal power:\n\nSNR = sum(g_i^2 / n_i)\n\nwhere g_i are the channel gains and n_i the branch noise variances.",
    starterCode: `def mrc_snr(gains, noise_vars):
    # Your code here
    pass`,
    solution: `def mrc_snr(gains, noise_vars):
    total = 0.0
    for g, n in zip(gains, noise_vars):
        total += g * g / n
    return total`,
    testCases: [
      { input: [[1, 1], [1, 1]], expected: 2.0 },
      { input: [[1, 2], [1, 1]], expected: 5.0 },
      { input: [[1, 1], [2, 2]], expected: 1.0 },
      { input: [[2, 2], [4, 4]], expected: 2.0 },
    ],
    hint: "MRC adds the branch SNRs, so diversity grows the effective SNR.",
  },
  {
    id: "info-118",
    title: "MRC Weights",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the normalized maximal-ratio combining weights. Each raw weight is g_i / n_i; scale the vector so that the sum of squares of the weights is 1. Return the resulting list.",
    starterCode: `import math
def mrc_weights(gains, noise_vars):
    # Your code here
    pass`,
    solution: `import math
def mrc_weights(gains, noise_vars):
    raw = [g / n for g, n in zip(gains, noise_vars)]
    norm = math.sqrt(sum(w * w for w in raw))
    return [w / norm for w in raw]`,
    testCases: [
      {
        input: [[1, 1], [1, 1]],
        expected: [0.7071067811865475, 0.7071067811865475],
      },
      { input: [[3, 4], [1, 1]], expected: [0.6, 0.8] },
      { input: [[1, 0], [1, 1]], expected: [1.0, 0.0] },
      {
        input: [[2, 1], [1, 4]],
        expected: [0.9922778767136677, 0.12403473458920847],
      },
    ],
    hint: "Weights favor strong channels and quiet branches.",
  },
  {
    id: "info-119",
    title: "LLR Addition",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Combine independent soft observations by adding their log-likelihood ratios. Return the sum of the list.",
    starterCode: `def llr_add(llrs):
    # Your code here
    pass`,
    solution: `def llr_add(llrs):
    total = 0.0
    for v in llrs:
        total += v
    return total`,
    testCases: [
      { input: [[1.0, 2.0]], expected: 3.0 },
      { input: [[-1.0, 1.0]], expected: 0.0 },
      { input: [[0.5]], expected: 0.5 },
      { input: [[2.0, -3.0, 1.0]], expected: 0.0 },
    ],
    hint: "In the log domain, multiplying likelihood ratios becomes adding LLRs.",
  },
  {
    id: "info-120",
    title: "LLR for BSC",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the natural-log likelihood ratio of a received bit over a BSC with crossover probability p: log((1 - p) / p) for a received 0 and log(p / (1 - p)) for a received 1. Assume 0 < p < 1.",
    starterCode: `import math
def llr_bsc(bit, p):
    # Your code here
    pass`,
    solution: `import math
def llr_bsc(bit, p):
    if bit == 0:
        return math.log((1.0 - p) / p)
    return math.log(p / (1.0 - p))`,
    testCases: [
      { input: [0, 0.1], expected: 2.1972245773362196 },
      { input: [1, 0.1], expected: -2.197224577336219 },
      { input: [0, 0.5], expected: 0.0 },
      { input: [1, 0.25], expected: -1.0986122886681098 },
    ],
    hint: "At p = 0.5 the observation carries no information, so the LLR is zero.",
  },
  {
    id: "info-121",
    title: "LLR for AWGN",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the log-likelihood ratio of a BPSK observation y over an AWGN channel with noise variance noise_var. With equally likely symbols transmitted as +1 and -1,\n\nLLR = 2 * y / noise_var",
    starterCode: `def llr_awgn(y, noise_var):
    # Your code here
    pass`,
    solution: `def llr_awgn(y, noise_var):
    return 2.0 * y / noise_var`,
    testCases: [
      { input: [0.5, 1.0], expected: 1.0 },
      { input: [1.0, 2.0], expected: 1.0 },
      { input: [-0.25, 0.5], expected: -1.0 },
      { input: [2.0, 1.0], expected: 4.0 },
    ],
    hint: "The LLR is linear in the observation and inversely proportional to the noise power.",
  },
  {
    id: "info-122",
    title: "MI from LLRs",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Estimate the mutual information in bits from a list of nonnegative LLR samples using the standard J-function style estimator:\n\nI = 1 - mean(log2(1 + exp(-L_i)))\n\nAssume every sample is nonnegative and the list is non-empty.",
    starterCode: `import math
def mi_from_llrs(llrs):
    # Your code here
    pass`,
    solution: `import math
def mi_from_llrs(llrs):
    total = 0.0
    for v in llrs:
        total += math.log2(1.0 + math.exp(-v))
    return 1.0 - total / len(llrs)`,
    testCases: [
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[1.0, 2.0, 3.0]], expected: 0.7649479245566632 },
      { input: [[0.5, 1.5, 2.5]], expected: 0.6372199067226494 },
      { input: [[10.0, 10.0]], expected: 0.999934503233238 },
    ],
    hint: "Zero LLRs mean the observations carry no information about the bits.",
  },
  {
    id: "info-123",
    title: "QPSK Symbol Error Rate",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the symbol error probability of Gray-coded QPSK at the given symbol signal-to-noise ratio:\n\nSER = 2 * Q(sqrt(snr)) - Q(sqrt(snr))^2\n\nwhere Q is the Gaussian Q-function.",
    starterCode: `import math
def qpsk_ser(snr):
    # Your code here
    pass`,
    solution: `import math
def qpsk_ser(snr):
    q = 0.5 * math.erfc(math.sqrt(snr / 2.0))
    return 2.0 * q - q * q`,
    testCases: [
      { input: [0.0], expected: 0.75 },
      { input: [1.0], expected: 0.2921390182628589 },
      { input: [4.0], expected: 0.044982695392698835 },
      { input: [10.0], expected: 0.0015647896369452086 },
    ],
    hint: "A QPSK symbol is correct only when both of its quadrature decisions are correct.",
  },
  {
    id: "info-124",
    title: "Binary to Gray",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert a nonnegative integer to its Gray code representation:\n\ngray = n ^ (n >> 1)\n\nAdjacent integers map to Gray codes that differ in exactly one bit.",
    starterCode: `def binary_to_gray(n):
    # Your code here
    pass`,
    solution: `def binary_to_gray(n):
    return n ^ (n >> 1)`,
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [2], expected: 3 },
      { input: [3], expected: 2 },
      { input: [7], expected: 4 },
      { input: [15], expected: 8 },
    ],
    hint: "XOR each bit with the next more significant bit.",
  },
  {
    id: "info-125",
    title: "QPSK Constellation Mapping",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Map a pair of bits to a Gray-coded QPSK constellation point: 00 -> [1, 1], 01 -> [-1, 1], 11 -> [-1, -1] and 10 -> [1, -1]. Return the two coordinates as a list.",
    starterCode: `def qpsk_map(bits):
    # Your code here
    pass`,
    solution: `def qpsk_map(bits):
    if bits[0] == 0 and bits[1] == 0:
        return [1, 1]
    if bits[0] == 0 and bits[1] == 1:
        return [-1, 1]
    if bits[0] == 1 and bits[1] == 1:
        return [-1, -1]
    return [1, -1]`,
    testCases: [
      { input: [[0, 0]], expected: [1, 1] },
      { input: [[0, 1]], expected: [-1, 1] },
      { input: [[1, 1]], expected: [-1, -1] },
      { input: [[1, 0]], expected: [1, -1] },
    ],
    hint: "Gray mapping keeps neighboring constellation points one bit apart.",
  },
  {
    id: "info-126",
    title: "Quantization SNR",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the signal-to-quantization-noise ratio in dB of an ideal n-bit uniform quantizer:\n\nSNR_dB = 6.02 * n + 1.76\n\nThis is the familiar 6 dB per bit rule.",
    starterCode: `def quantization_snr_db(bits):
    # Your code here
    pass`,
    solution: `def quantization_snr_db(bits):
    return 6.02 * bits + 1.76`,
    testCases: [
      { input: [8], expected: 49.919999999999995 },
      { input: [16], expected: 98.08 },
      { input: [1], expected: 7.779999999999999 },
      { input: [12], expected: 74.0 },
    ],
    hint: "Each additional bit halves the step size and adds roughly 6 dB.",
  },
  {
    id: "info-127",
    title: "Effective Number of Bits",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Invert the ideal quantization SNR rule to find the effective number of bits:\n\nn = (snr_db - 1.76) / 6.02",
    starterCode: `def effective_bits(snr_db):
    # Your code here
    pass`,
    solution: `def effective_bits(snr_db):
    return (snr_db - 1.76) / 6.02`,
    testCases: [
      { input: [49.92], expected: 8.000000000000002 },
      { input: [98.08], expected: 16.0 },
      { input: [7.78], expected: 1.0000000000000002 },
      { input: [25.86], expected: 4.003322259136213 },
    ],
    hint: "Subtract the 1.76 dB constant before dividing by 6.02.",
  },
  {
    id: "info-128",
    title: "Dither Variance",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the variance of uniform dither distributed on [-step/2, step/2]:\n\nvar = step^2 / 12",
    starterCode: `def dither_variance(step):
    # Your code here
    pass`,
    solution: `def dither_variance(step):
    return step * step / 12.0`,
    testCases: [
      { input: [1.0], expected: 0.08333333333333333 },
      { input: [2.0], expected: 0.3333333333333333 },
      { input: [0.5], expected: 0.020833333333333332 },
      { input: [6.0], expected: 3.0 },
    ],
    hint: "This matches the quantization error variance of a uniform quantizer.",
  },
  {
    id: "info-129",
    title: "Adaptive Quantization Step",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Choose the uniform quantization step that achieves a target SNR for a signal with the given variance. With target SNR_linear = 10^(target_snr_db / 10) and mean squared error step^2 / 12, solve for the step:\n\nstep = sqrt(12 * signal_var / SNR_linear)",
    starterCode: `import math
def adaptive_quant_step(signal_var, target_snr_db):
    # Your code here
    pass`,
    solution: `import math
def adaptive_quant_step(signal_var, target_snr_db):
    snr = 10.0 ** (target_snr_db / 10.0)
    return math.sqrt(12.0 * signal_var / snr)`,
    testCases: [
      { input: [1.0, 0.0], expected: 3.4641016151377544 },
      { input: [1.0, 10.0], expected: 1.0954451150103321 },
      { input: [4.0, 20.0], expected: 0.6928203230275509 },
      { input: [9.0, 6.02], expected: 5.196511320715222 },
    ],
    hint: "Louder signals or lower targets allow coarser steps.",
  },
  {
    id: "info-130",
    title: "Predictive Residual Entropy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the differential entropy in bits of the residual after first-order linear prediction:\n\nh = 0.5 * log2(2 * pi * e * var * (1 - rho^2))\n\nwhere var is the signal variance and rho the correlation with the predictor. Assume |rho| < 1.",
    starterCode: `import math
def residual_entropy(var, rho):
    # Your code here
    pass`,
    solution: `import math
def residual_entropy(var, rho):
    return 0.5 * math.log2(2.0 * math.pi * math.e * var * (1.0 - rho * rho))`,
    testCases: [
      { input: [1.0, 0.0], expected: 2.047095585180641 },
      { input: [1.0, 0.5], expected: 1.8395768355412192 },
      { input: [4.0, 0.0], expected: 3.047095585180641 },
      { input: [1.0, 0.9], expected: 0.8491312470150711 },
    ],
    hint: "Better prediction shrinks the residual variance by (1 - rho^2).",
  },
  {
    id: "info-131",
    title: "DPCM Step",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the differential pulse-code modulation residual for one sample: the difference between the sample x and its prediction.",
    starterCode: `def dpcm_step(prediction, x):
    # Your code here
    pass`,
    solution: `def dpcm_step(prediction, x):
    return x - prediction`,
    testCases: [
      { input: [0.5, 0.7], expected: 0.19999999999999996 },
      { input: [1.0, 1.0], expected: 0.0 },
      { input: [-2.0, 3.0], expected: 5.0 },
      { input: [0.0, 0.0], expected: 0.0 },
    ],
    hint: "A perfect prediction produces a zero residual.",
  },
  {
    id: "info-132",
    title: "Energy Compaction",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the fraction of total variance captured by the k largest coefficients: the sum of the k largest values divided by the sum of all values. Assume k is at most the list length and the total is positive.",
    starterCode: `def energy_compaction(variances, k):
    # Your code here
    pass`,
    solution: `def energy_compaction(variances, k):
    ordered = sorted(variances, reverse=True)
    total = sum(ordered)
    return sum(ordered[:k]) / total`,
    testCases: [
      { input: [[4, 3, 2, 1], 2], expected: 0.7 },
      { input: [[1, 1, 1, 1], 2], expected: 0.5 },
      { input: [[9, 1, 0], 1], expected: 0.9 },
      { input: [[2, 2], 2], expected: 1.0 },
    ],
    hint: "Transform coding works because a few coefficients hold most of the energy.",
  },
  {
    id: "info-133",
    title: "8-Point DCT",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the orthonormal 8-point DCT-II of a row of length 8:\n\nX_k = c_k * sum_{i=0}^{7} x_i * cos(pi * (2i + 1) * k / 16)\n\nwith c_0 = sqrt(1/8) and c_k = sqrt(2/8) for k > 0. Return the list of 8 coefficients.",
    starterCode: `import math
def dct8(row):
    # Your code here
    pass`,
    solution: `import math
def dct8(row):
    n = 8
    out = []
    for k in range(n):
        s = 0.0
        for i in range(n):
            s += row[i] * math.cos(math.pi * (2 * i + 1) * k / (2 * n))
        if k == 0:
            out.append(s * math.sqrt(1.0 / n))
        else:
            out.append(s * math.sqrt(2.0 / n))
    return out`,
    testCases: [
      {
        input: [[1, 1, 1, 1, 1, 1, 1, 1]],
        expected: [
          2.8284271247461903,
          3.3306690738754696e-16,
          -2.220446049250313e-16,
          3.3306690738754696e-16,
          5.551115123125783e-17,
          -2.220446049250313e-16,
          -2.1649348980190553e-15,
          3.3306690738754696e-15,
        ],
      },
      {
        input: [[1, 0, 0, 0, 0, 0, 0, 0]],
        expected: [
          0.3535533905932738,
          0.4903926402016152,
          0.46193976625564337,
          0.4157348061512726,
          0.3535533905932738,
          0.27778511650980114,
          0.19134171618254492,
          0.09754516100806417,
        ],
      },
      {
        input: [[1, 2, 3, 4, 5, 6, 7, 8]],
        expected: [
          12.727922061357857,
          -6.4423230227051365,
          -1.3322676295501878e-15,
          -0.6734548009039383,
          -4.440892098500626e-16,
          -0.20090290373599817,
          -1.5765166949677223e-14,
          -0.05070232275962194,
        ],
      },
      {
        input: [[1, -1, 1, -1, 1, -1, 1, -1]],
        expected: [
          0.0,
          0.5097955791041591,
          4.440892098500626e-16,
          0.6013448869350442,
          2.220446049250313e-16,
          0.899976223136416,
          9.43689570931383e-16,
          2.562915447741505,
        ],
      },
    ],
    hint: "The DC coefficient is the average value scaled by sqrt(8).",
  },
  {
    id: "info-134",
    title: "Zigzag Index",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the position (0 to 63) of the cell (row, col) in the standard 8x8 JPEG zigzag order, which starts (0,0), (0,1), (1,0), (2,0), (1,1), (0,2), ... Rows and columns are 0-indexed. Return -1 for out-of-range input.",
    starterCode: `def zigzag_index(row, col):
    # Your code here
    pass`,
    solution: `def zigzag_index(row, col):
    seq = []
    r = 0
    c = 0
    up = True
    for _ in range(64):
        seq.append((r, c))
        if up:
            if c == 7:
                r += 1
                up = False
            elif r == 0:
                c += 1
                up = False
            else:
                r -= 1
                c += 1
        else:
            if r == 7:
                c += 1
                up = True
            elif c == 0:
                r += 1
                up = True
            else:
                r += 1
                c -= 1
    target = (row, col)
    for i in range(len(seq)):
        if seq[i] == target:
            return i
    return -1`,
    testCases: [
      { input: [0, 0], expected: 0 },
      { input: [0, 1], expected: 1 },
      { input: [1, 0], expected: 2 },
      { input: [1, 1], expected: 4 },
      { input: [7, 7], expected: 63 },
    ],
    hint: "The scan alternates between up-right and down-left diagonals.",
  },
  {
    id: "info-135",
    title: "Nonzero AC Count",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Count the nonzero entries of a block excluding the DC term at (0, 0). This is the number of (run, value) symbols a JPEG-style encoder must emit for the alternating-current coefficients.",
    starterCode: `def nonzero_ac_count(block):
    # Your code here
    pass`,
    solution: `def nonzero_ac_count(block):
    count = 0
    for i in range(len(block)):
        for j in range(len(block[i])):
            if not (i == 0 and j == 0) and block[i][j] != 0:
                count += 1
    return count`,
    testCases: [
      { input: [[[5, 1, 0], [0, 2, 0], [0, 0, 3]]], expected: 3 },
      { input: [[[1, 0], [0, 0]]], expected: 0 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 1], [1, 1]]], expected: 3 },
    ],
    hint: "Quantization usually drives most AC coefficients to zero.",
  },
];
