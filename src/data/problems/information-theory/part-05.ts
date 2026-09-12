import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-181",
    title: "Qubit Amplitude Norm Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True when the real amplitudes (a, b) of a qubit state satisfy the normalization condition a^2 + b^2 = 1 within a tolerance of 1e-9. Physical qubit states must have unit norm.",
    starterCode: `import math
def qubit_norm_valid(a, b):
    # Your code here
    pass`,
    solution: `import math
def qubit_norm_valid(a, b):
    return abs(a * a + b * b - 1.0) <= 1e-9`,
    testCases: [
      { input: [1.0, 0.0], expected: true },
      { input: [0.7071067811865476, 0.7071067811865476], expected: true },
      { input: [0.6, 0.8], expected: true },
      { input: [0.5, 0.5], expected: false },
      { input: [0.0, 0.0], expected: false },
    ],
    hint: "The squared amplitudes are probabilities and must sum to one.",
  },
  {
    id: "info-182",
    title: "Qubit Measurement Probability",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the probability of measuring outcome 0 for a qubit in the state (a, b): P(0) = a^2. The Born rule squares the amplitude.",
    starterCode: `def qubit_measure_prob0(a, b):
    # Your code here
    pass`,
    solution: `def qubit_measure_prob0(a, b):
    return a * a`,
    testCases: [
      { input: [1.0, 0.0], expected: 1.0 },
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [0.7071067811865476, 0.7071067811865476], expected: 0.5000000000000001 },
      { input: [0.6, 0.8], expected: 0.36 },
    ],
    hint: "Probabilities come from squaring amplitudes, not from the amplitudes themselves.",
  },
  {
    id: "info-183",
    title: "Von Neumann Entropy (2x2)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the von Neumann entropy in bits of a 2x2 density matrix [[a, b], [b, d]]. Compute the eigenvalues from the trace and determinant:\n\nlambda = (tr +/- sqrt(tr^2 - 4 * det)) / 2\n\nThen H = -sum lambda * log2(lambda), skipping zero eigenvalues. Clamp negative discriminants to 0.",
    starterCode: `import math
def von_neumann_entropy_2x2(matrix):
    # Your code here
    pass`,
    solution: `import math
def von_neumann_entropy_2x2(matrix):
    a = matrix[0][0]
    b = matrix[0][1]
    c = matrix[1][0]
    d = matrix[1][1]
    tr = a + d
    det = a * d - b * c
    disc = tr * tr - 4.0 * det
    if disc < 0.0:
        disc = 0.0
    root = math.sqrt(disc)
    h = 0.0
    for lam in ((tr + root) / 2.0, (tr - root) / 2.0):
        if lam > 0:
            h -= lam * math.log2(lam)
    return h`,
    testCases: [
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 1.0 },
      { input: [[[1.0, 0.0], [0.0, 0.0]]], expected: 0.0 },
      { input: [[[0.75, 0.0], [0.0, 0.25]]], expected: 0.8112781244591328 },
      { input: [[[0.5, 0.2], [0.2, 0.5]]], expected: 0.8812908992306927 },
    ],
    hint: "A maximally mixed qubit has entropy 1 bit; a pure state has entropy 0.",
  },
  {
    id: "info-184",
    title: "Tensor Product of States",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the 2x2 tensor product (outer product) of two state vectors u and v: entry (i, j) is u[i] * v[j]. The Kronecker product of state vectors describes composite quantum systems.",
    starterCode: `def tensor_product(u, v):
    # Your code here
    pass`,
    solution: `def tensor_product(u, v):
    return [[u[i] * v[j] for j in range(len(v))] for i in range(len(u))]`,
    testCases: [
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: [[0.0, 1.0], [0.0, 0.0]] },
      { input: [[1.0, 0.0], [1.0, 0.0]], expected: [[1.0, 0.0], [0.0, 0.0]] },
      { input: [[0.5, 0.5], [0.5, -0.5]], expected: [[0.25, -0.25], [0.25, -0.25]] },
      { input: [[0.6, 0.8], [1.0, 0.0]], expected: [[0.6, 0.0], [0.8, 0.0]] },
    ],
    hint: "The flattened 4-vector lists the amplitudes of |00>, |01>, |10>, |11>.",
  },
  {
    id: "info-185",
    title: "Bell State Amplitude",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the amplitude of the basis state |x, y> in the Bell state (|00> + |11>) / sqrt(2): 1 / sqrt(2) when x == y and 0.0 otherwise.",
    starterCode: `import math
def bell_amplitude(x, y):
    # Your code here
    pass`,
    solution: `import math
def bell_amplitude(x, y):
    if x == y:
        return 1.0 / math.sqrt(2.0)
    return 0.0`,
    testCases: [
      { input: [0, 0], expected: 0.7071067811865475 },
      { input: [1, 1], expected: 0.7071067811865475 },
      { input: [0, 1], expected: 0.0 },
      { input: [1, 0], expected: 0.0 },
    ],
    hint: "The Bell state is an equal superposition of only the aligned basis states.",
  },
  {
    id: "info-186",
    title: "MIMO Capacity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the capacity in bits per channel use of a 2x2 MIMO channel: C = log2 det(I + (snr / n_t) H H^T) with n_t = 2 transmit antennas. Build M = H H^T, set g = snr / 2, form the 2x2 matrix with entries (1 + g * M00), (g * M01), (g * M01), (1 + g * M11), and return the base-2 log of its determinant.",
    starterCode: `import math
def mimo_capacity(h, snr):
    # Your code here
    pass`,
    solution: `import math
def mimo_capacity(h, snr):
    g = snr / 2.0
    m00 = h[0][0] * h[0][0] + h[0][1] * h[0][1]
    m01 = h[0][0] * h[1][0] + h[0][1] * h[1][1]
    m11 = h[1][0] * h[1][0] + h[1][1] * h[1][1]
    det = (1.0 + g * m00) * (1.0 + g * m11) - (g * m01) * (g * m01)
    return math.log2(det)`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], 2.0], expected: 2.0 },
      { input: [[[1.0, 0.0], [0.0, 1.0]], 0.0], expected: 0.0 },
      { input: [[[1.0, 0.5], [0.5, 1.0]], 10.0], expected: 4.7846348455575205 },
      { input: [[[1.0, 1.0], [1.0, 1.0]], 4.0], expected: 3.169925001442312 },
    ],
    hint: "An identity channel diagonalizes the determinant into two independent paths.",
  },
  {
    id: "info-187",
    title: "Water-Filling Level Update",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Perform one water-filling update. Given noise variances, the current water level and the target total power, count the active channels with n_i < level, compute the used power sum(max(0, level - n_i)), and return level + (target_power - used) / active. Return the level unchanged when no channel is active.",
    starterCode: `def water_filling_update(noise_vars, level, target_power):
    # Your code here
    pass`,
    solution: `def water_filling_update(noise_vars, level, target_power):
    used = 0.0
    active = 0
    for n in noise_vars:
        if level > n:
            used += level - n
            active += 1
    if active == 0:
        return level
    return level + (target_power - used) / active`,
    testCases: [
      { input: [[1.0, 1.0], 2.0, 2.0], expected: 2.0 },
      { input: [[1.0, 1.0], 0.0, 4.0], expected: 0.0 },
      { input: [[1.0, 3.0], 2.0, 4.0], expected: 5.0 },
      { input: [[1.0, 3.0], 0.5, 1.0], expected: 0.5 },
    ],
    hint: "If the used power already matches the target, the level does not move.",
  },
  {
    id: "info-188",
    title: "Beamforming Gain",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the beamforming gain of weights w and real channel h: (sum_i w_i * h_i)^2. This is the received power with unit transmit power when the beamformer is matched to the channel.",
    starterCode: `def beamforming_gain(weights, channel):
    # Your code here
    pass`,
    solution: `def beamforming_gain(weights, channel):
    s = 0.0
    for w, h in zip(weights, channel):
        s += w * h
    return s * s`,
    testCases: [
      { input: [[1.0, 1.0], [1.0, 1.0]], expected: 4.0 },
      { input: [[0.5, 0.5], [1.0, 1.0]], expected: 1.0 },
      { input: [[1.0, 0.0], [1.0, 5.0]], expected: 1.0 },
      { input: [[0.6, 0.8], [0.6, 0.8]], expected: 1.0 },
    ],
    hint: "Matched-filter weights maximize this gain when they align with the channel.",
  },
  {
    id: "info-189",
    title: "Outage Probability",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the outage probability of a Rayleigh fading channel with mean SNR mean_snr when the SNR must exceed the given threshold:\n\nP_out = 1 - exp(-threshold / mean_snr)",
    starterCode: `import math
def outage_probability(threshold, mean_snr):
    # Your code here
    pass`,
    solution: `import math
def outage_probability(threshold, mean_snr):
    return 1.0 - math.exp(-threshold / mean_snr)`,
    testCases: [
      { input: [1.0, 1.0], expected: 0.6321205588285577 },
      { input: [2.0, 1.0], expected: 0.8646647167633873 },
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [1.0, 2.0], expected: 0.3934693402873666 },
    ],
    hint: "Rayleigh power is exponential, so the outage probability follows its CDF.",
  },
  {
    id: "info-190",
    title: "Ergodic Capacity (Uniform Fading)",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the ergodic capacity in bits of a channel whose SNR is uniform on [a, b]:\n\nC = (f(b) - f(a)) / ((b - a) * ln(2)),  f(x) = (1 + x) * ln(1 + x) - x\n\nAssume b > a >= 0.",
    starterCode: `import math
def ergodic_capacity_uniform(a, b):
    # Your code here
    pass`,
    solution: `import math
def ergodic_capacity_uniform(a, b):
    def f(x):
        return (1.0 + x) * math.log(1.0 + x) - x
    return (f(b) - f(a)) / ((b - a) * math.log(2.0))`,
    testCases: [
      { input: [0.0, 1.0], expected: 0.5573049591110365 },
      { input: [0.0, 2.0], expected: 0.934748710192771 },
      { input: [1.0, 2.0], expected: 1.3121924612745053 },
      { input: [0.0, 4.0], expected: 1.4597150777202395 },
    ],
    hint: "Averaging log2(1 + gamma) over the fading distribution gives the ergodic capacity.",
  },
  {
    id: "info-191",
    title: "Link Budget",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the received power of a radio link in dBm:\n\ntx_dbm + tx_gain_db + rx_gain_db - path_loss_db",
    starterCode: `def link_budget(tx_dbm, tx_gain_db, rx_gain_db, path_loss_db):
    # Your code here
    pass`,
    solution: `def link_budget(tx_dbm, tx_gain_db, rx_gain_db, path_loss_db):
    return tx_dbm + tx_gain_db + rx_gain_db - path_loss_db`,
    testCases: [
      { input: [30.0, 10.0, 5.0, 100.0], expected: -55.0 },
      { input: [20.0, 0.0, 0.0, 0.0], expected: 20.0 },
      { input: [10.0, 3.0, 3.0, 20.0], expected: -4.0 },
      { input: [0.0, 0.0, 0.0, 50.0], expected: -50.0 },
    ],
    hint: "All terms are already in decibels, so they simply add and subtract.",
  },
  {
    id: "info-192",
    title: "Noise Figure Cascade",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the total noise factor of a receive chain using the Friis formula, all in linear units:\n\nF = F1 + (F2 - 1) / G1 + (F3 - 1) / (G1 * G2) + ...\n\nfactors[i] are the linear noise factors of the stages and gains[i] the linear gain of stage i (so gains[i - 1] precedes factors[i]).",
    starterCode: `def noise_figure_cascade(factors, gains):
    # Your code here
    pass`,
    solution: `def noise_figure_cascade(factors, gains):
    total = factors[0]
    gain_prod = 1.0
    for i in range(1, len(factors)):
        gain_prod *= gains[i - 1]
        total += (factors[i] - 1.0) / gain_prod
    return total`,
    testCases: [
      { input: [[2.0, 3.0], [10.0]], expected: 2.2 },
      { input: [[1.5, 2.0], [4.0]], expected: 1.75 },
      { input: [[2.0, 3.0, 4.0], [10.0, 5.0]], expected: 2.2600000000000002 },
      { input: [[1.0, 5.0], [2.0]], expected: 3.0 },
    ],
    hint: "Later stages matter less because earlier gain suppresses their contribution.",
  },
  {
    id: "info-193",
    title: "Eb/N0 to SNR",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert Eb/N0 in decibels to the SNR in decibels for a given spectral efficiency (bits per symbol):\n\nSNR_dB = Eb/N0_dB + 10 * log10(rate)",
    starterCode: `import math
def ebn0_to_snr_db(ebn0_db, rate):
    # Your code here
    pass`,
    solution: `import math
def ebn0_to_snr_db(ebn0_db, rate):
    return ebn0_db + 10.0 * math.log10(rate)`,
    testCases: [
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [10.0, 0.5], expected: 6.9897000433601875 },
      { input: [3.0, 0.25], expected: -3.020599913279624 },
      { input: [6.0, 2.0], expected: 9.010299956639813 },
    ],
    hint: "SNR scales with the bit rate, so a factor of two costs about 3 dB.",
  },
  {
    id: "info-194",
    title: "Spectral Efficiency",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the spectral efficiency in bits per second per hertz:\n\nSE = capacity_bps / bandwidth_hz",
    starterCode: `def spectral_efficiency(capacity_bps, bandwidth_hz):
    # Your code here
    pass`,
    solution: `def spectral_efficiency(capacity_bps, bandwidth_hz):
    return capacity_bps / bandwidth_hz`,
    testCases: [
      { input: [1000000.0, 100000.0], expected: 10.0 },
      { input: [3000000.0, 1000000.0], expected: 3.0 },
      { input: [0.0, 20000.0], expected: 0.0 },
      { input: [56000.0, 56000.0], expected: 1.0 },
    ],
    hint: "Spectral efficiency is the capacity normalized by bandwidth.",
  },
  {
    id: "info-195",
    title: "HARQ Chase-Combining Gain",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the SNR gain in dB from coherently combining num_copies identical HARQ retransmissions:\n\ngain_db = 10 * log10(num_copies)",
    starterCode: `import math
def harq_combining_gain_db(num_copies):
    # Your code here
    pass`,
    solution: `import math
def harq_combining_gain_db(num_copies):
    return 10.0 * math.log10(num_copies)`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 3.010299956639812 },
      { input: [4], expected: 6.020599913279624 },
      { input: [10], expected: 10.0 },
    ],
    hint: "Each doubling of the number of copies adds about 3 dB.",
  },
  {
    id: "info-196",
    title: "Incremental Redundancy Rate",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the effective code rate of an incremental-redundancy scheme: k information bits divided by the total number of transmitted bits. As more redundancy is sent the effective rate drops.",
    starterCode: `def incremental_redundancy_rate(k, transmitted):
    # Your code here
    pass`,
    solution: `def incremental_redundancy_rate(k, transmitted):
    return k / transmitted`,
    testCases: [
      { input: [1, 2], expected: 0.5 },
      { input: [2, 3], expected: 0.6666666666666666 },
      { input: [1, 1], expected: 1.0 },
      { input: [3, 9], expected: 0.3333333333333333 },
    ],
    hint: "The rate is information bits over total transmitted bits.",
  },
  {
    id: "info-197",
    title: "LDPC Check-Node Update",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Perform one min-sum check-node update. For each incoming message index i, the outgoing message is the product of the signs of all other messages times the smallest absolute value among the other messages. A single message produces 0.0.",
    starterCode: `def ldpc_check_update(messages):
    # Your code here
    pass`,
    solution: `def ldpc_check_update(messages):
    n = len(messages)
    if n == 1:
        return [0.0]
    out = []
    for i in range(n):
        sign = 1
        mag = None
        for j in range(n):
            if j != i:
                v = messages[j]
                if v < 0:
                    sign = -sign
                a = abs(v)
                if mag is None or a < mag:
                    mag = a
        out.append(sign * mag)
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [2.0, 1.0, 1.0] },
      { input: [[-1.0, 2.0, -3.0]], expected: [-2.0, 1.0, -1.0] },
      { input: [[5.0]], expected: [0.0] },
      { input: [[-2.0, 2.0]], expected: [2.0, -2.0] },
      { input: [[0.5, -1.5, 2.5]], expected: [-1.5, 0.5, -0.5] },
    ],
    hint: "Every outgoing message excludes its own incoming message.",
  },
  {
    id: "info-198",
    title: "Polar SC Decode Step",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Perform one 2-bit successive-cancellation decision for a polar code. Decide u0 = 1 when llr0 + llr1 < 0, otherwise 0. Take the hard decision of llr1 and set u1 = hard(llr1) XOR u0. Return [u0, u1].",
    starterCode: `def polar_sc_step(llr0, llr1):
    # Your code here
    pass`,
    solution: `def polar_sc_step(llr0, llr1):
    u0 = 1 if llr0 + llr1 < 0 else 0
    hard1 = 1 if llr1 < 0 else 0
    u1 = hard1 ^ u0
    return [u0, u1]`,
    testCases: [
      { input: [1.0, 1.0], expected: [0, 0] },
      { input: [-1.0, -1.0], expected: [1, 0] },
      { input: [-1.0, 1.0], expected: [0, 0] },
      { input: [1.0, -1.0], expected: [0, 1] },
      { input: [-2.0, -0.5], expected: [1, 0] },
    ],
    hint: "u0 is decided first from the combined LLR, then it corrects the hard decision of u1.",
  },
  {
    id: "info-199",
    title: "Belief Propagation Message",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the check-to-variable message from a check node when one incoming message (at `index`) is excluded. The message is the product of the signs of the other messages times the smallest absolute value among them. Return 0.0 when no other messages exist.",
    starterCode: `def bp_check_message(messages, index):
    # Your code here
    pass`,
    solution: `def bp_check_message(messages, index):
    sign = 1
    mag = None
    for j in range(len(messages)):
        if j != index:
            v = messages[j]
            if v < 0:
                sign = -sign
            a = abs(v)
            if mag is None or a < mag:
                mag = a
    if mag is None:
        return 0.0
    return sign * mag`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0], expected: 2.0 },
      { input: [[1.0, 2.0, 3.0], 1], expected: 1.0 },
      { input: [[-1.0, 2.0, -3.0], 0], expected: -2.0 },
      { input: [[1.0], 0], expected: 0.0 },
      { input: [[2.0, -4.0, 6.0], 2], expected: -2.0 },
    ],
    hint: "This is the extrinsic min-sum rule used by LDPC decoders.",
  },
  {
    id: "info-200",
    title: "Tanner Graph Degrees",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return [check_degrees, variable_degrees] for the parity-check matrix H. Check degrees are the row sums and variable degrees are the column sums of H.",
    starterCode: `def tanner_degrees(h_matrix):
    # Your code here
    pass`,
    solution: `def tanner_degrees(h_matrix):
    checks = []
    for row in h_matrix:
        checks.append(sum(row))
    var = []
    for j in range(len(h_matrix[0])):
        s = 0
        for row in h_matrix:
            s += row[j]
        var.append(s)
    return [checks, var]`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 1]]], expected: [[2, 2], [1, 2, 1]] },
      {
        input: [[[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]]],
        expected: [[2, 2, 2], [1, 2, 2, 1]],
      },
      { input: [[[1, 1], [1, 1]]], expected: [[2, 2], [2, 2]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
    ],
    hint: "Degrees count the edges incident to each check node and variable node.",
  },
  {
    id: "info-201",
    title: "Syndrome Decode Step",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a parity-check matrix H and a syndrome vector, return the 0-indexed column of H that equals the syndrome, which identifies the single-bit error position. Return -1 when no column matches.",
    starterCode: `def syndrome_decode_step(h_matrix, syndrome):
    # Your code here
    pass`,
    solution: `def syndrome_decode_step(h_matrix, syndrome):
    n = len(h_matrix[0])
    for j in range(n):
        col = [h_matrix[i][j] for i in range(len(h_matrix))]
        if col == syndrome:
            return j
    return -1`,
    testCases: [
      { input: [[[1, 1, 0], [0, 1, 1]], [1, 0]], expected: 0 },
      { input: [[[1, 1, 0], [0, 1, 1]], [1, 1]], expected: 1 },
      { input: [[[1, 1, 0], [0, 1, 1]], [0, 1]], expected: 2 },
      { input: [[[1, 1, 0], [0, 1, 1]], [0, 0]], expected: -1 },
      { input: [[[1, 0, 1], [0, 1, 1], [1, 1, 0]], [0, 1, 1]], expected: 1 },
    ],
    hint: "For single-error correction each error position gets a unique syndrome column.",
  },
  {
    id: "info-202",
    title: "Plotkin Bound",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Plotkin upper bound on the number of codewords of a binary code of length n and minimum distance d. When 2d > n the bound is floor(2d / (2d - n)); otherwise return 0 because the bound does not apply.",
    starterCode: `def plotkin_bound(n, d):
    # Your code here
    pass`,
    solution: `def plotkin_bound(n, d):
    if 2 * d <= n:
        return 0
    return (2 * d) // (2 * d - n)`,
    testCases: [
      { input: [7, 4], expected: 8 },
      { input: [7, 5], expected: 3 },
      { input: [15, 8], expected: 16 },
      { input: [5, 3], expected: 6 },
      { input: [4, 2], expected: 0 },
    ],
    hint: "The Plotkin bound is powerful when the minimum distance exceeds half the block length.",
  },
  {
    id: "info-203",
    title: "MacWilliams Dual Distribution",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Given the weight distribution weights[i] of a binary linear code (weights[i] = number of codewords of weight i) of length n, return the weight distribution of its dual using the MacWilliams identity:\n\nB_j = (1 / 2^k) * sum_i A_i * K_j(i)\n\nwhere K_j(i) = sum_t (-1)^t * C(i, t) * C(n - i, j - t). Find k from k = log2(sum of weights) and round each integer result.",
    starterCode: `import math
def macwilliams_dual(weights):
    # Your code here
    pass`,
    solution: `import math
def macwilliams_dual(weights):
    n = len(weights) - 1
    k = round(math.log2(sum(weights)))
    out = []
    for j in range(n + 1):
        s = 0.0
        for i in range(n + 1):
            kraw = 0
            for t in range(j + 1):
                if t <= i and (j - t) <= n - i:
                    kraw += (-1) ** t * math.comb(i, t) * math.comb(n - i, j - t)
            s += weights[i] * kraw
        out.append(round(s / (2 ** k)))
    return out`,
    testCases: [
      { input: [[1, 0, 0, 1]], expected: [1, 0, 3, 0] },
      { input: [[1, 0, 3, 0]], expected: [1, 0, 0, 1] },
      { input: [[1, 0, 0, 7, 7, 0, 0, 1]], expected: [1, 0, 0, 0, 7, 0, 0, 0] },
      { input: [[1, 0, 0, 0]], expected: [1, 3, 3, 1] },
    ],
    hint: "Applying the transform twice returns the original distribution.",
  },
  {
    id: "info-204",
    title: "Entropy Power Inequality Check",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Check the entropy power inequality for continuous random variables. Define the entropy power N(h) = 2^(2h) / (2 * pi * e) for a differential entropy h in bits, and return True when N(X+Y) >= N(X) + N(Y) within 1e-12.",
    starterCode: `import math
def entropy_power_inequality_holds(hx, hy, hxy):
    # Your code here
    pass`,
    solution: `import math
def entropy_power_inequality_holds(hx, hy, hxy):
    const = 2.0 * math.pi * math.e
    nx = (2.0 ** (2.0 * hx)) / const
    ny = (2.0 ** (2.0 * hy)) / const
    nxy = (2.0 ** (2.0 * hxy)) / const
    return nxy >= nx + ny - 1e-12`,
    testCases: [
      { input: [2.047095585180641, 2.047095585180641, 2.547095585180641], expected: true },
      { input: [2.0, 1.0, 2.6], expected: true },
      { input: [1.0, 1.0, 1.5], expected: true },
      { input: [2.047095585180641, 0.0, 1.5], expected: false },
    ],
    hint: "Two independent Gaussians achieve equality in the entropy power inequality.",
  },
  {
    id: "info-205",
    title: "Slepian-Wolf Corner Rates",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the achievable Slepian-Wolf rate pair [R1, R2] = [H(X|Y), H(Y)] in bits for the 2D joint distribution joint[x][y]. This corner point lets one encoder compress independently while the decoder uses the other sequence as side information.",
    starterCode: `import math
def slepian_wolf_rates(joint):
    # Your code here
    pass`,
    solution: `import math
def slepian_wolf_rates(joint):
    py = [0.0] * len(joint[0])
    for row in joint:
        for j, p in enumerate(row):
            py[j] += p
    h_xy = 0.0
    for row in joint:
        for p in row:
            if p > 0:
                h_xy -= p * math.log2(p)
    h_y = 0.0
    for p in py:
        if p > 0:
            h_y -= p * math.log2(p)
    return [h_xy - h_y, h_y]`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: [1.0, 1.0] },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: [0.0, 1.0] },
      { input: [[[0.4, 0.1], [0.2, 0.3]]], expected: [0.8754887502163469, 0.9709505944546686] },
      { input: [[[0.5, 0.25], [0.0, 0.25]]], expected: [0.5, 1.0] },
    ],
    hint: "Measure exactly one sequence and the decoder recovers the other at rate H(X|Y).",
  },
  {
    id: "info-206",
    title: "Linear Code Rank mod 2",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the rank over GF(2) of a binary matrix, computed by Gaussian elimination in which adding two rows means XORing them. The rank is the number of linearly independent rows over the two-element field.",
    starterCode: `def gaussian_rank_mod2(matrix):
    # Your code here
    pass`,
    solution: `def gaussian_rank_mod2(matrix):
    rows = [row[:] for row in matrix]
    rank = 0
    cols = len(rows[0]) if rows else 0
    for col in range(cols):
        pivot = None
        for r in range(rank, len(rows)):
            if rows[r][col] == 1:
                pivot = r
                break
        if pivot is None:
            continue
        rows[rank], rows[pivot] = rows[pivot], rows[rank]
        for r in range(len(rows)):
            if r != rank and rows[r][col] == 1:
                for c in range(cols):
                    rows[r][c] ^= rows[rank][c]
        rank += 1
        if rank == len(rows):
            break
    return rank`,
    testCases: [
      { input: [[[1, 0], [0, 1]]], expected: 2 },
      { input: [[[1, 1], [1, 1]]], expected: 1 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 1, 0], [0, 0, 1]]], expected: 2 },
      { input: [[[1, 0, 1], [0, 1, 1], [1, 1, 0]]], expected: 2 },
    ],
    hint: "A row that is the XOR of two others adds no rank.",
  },
  {
    id: "info-207",
    title: "Cut-Set Bound",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the min-cut capacity of a directed network given the capacity matrix capacity[i][j], a source and a sink. A cut is a set S of vertices that contains the source but not the sink; its capacity is the sum of capacities of edges from S to its complement. Return the minimum over all cuts.",
    starterCode: `def cut_set_bound(capacity, source, sink):
    # Your code here
    pass`,
    solution: `def cut_set_bound(capacity, source, sink):
    n = len(capacity)
    others = [i for i in range(n) if i != source and i != sink]
    best = None
    for mask in range(2 ** len(others)):
        s_set = set([source])
        for k in range(len(others)):
            if (mask >> k) & 1:
                s_set.add(others[k])
        cut = 0
        for i in s_set:
            for j in range(n):
                if j not in s_set:
                    cut += capacity[i][j]
        if best is None or cut < best:
            best = cut
    return best`,
    testCases: [
      { input: [[[0, 2, 3], [0, 0, 4], [0, 0, 0]], 0, 2], expected: 5 },
      { input: [[[0, 5, 0], [0, 0, 5], [0, 0, 0]], 0, 2], expected: 5 },
      { input: [[[0, 3, 0, 0], [0, 0, 2, 0], [0, 0, 0, 3], [0, 0, 0, 0]], 0, 3], expected: 2 },
      { input: [[[0, 1, 1], [0, 0, 0], [0, 0, 0]], 0, 2], expected: 1 },
    ],
    hint: "Max-flow equals min-cut, so the bottleneck cut bounds the achievable rate.",
  },
  {
    id: "info-208",
    title: "Secrecy Capacity (Gaussian Wiretap)",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Gaussian wiretap secrecy capacity in bits:\n\nmax(0, 0.5 * log2(1 + P / N_main) - 0.5 * log2(1 + P / N_eaves))\n\nIf the eavesdropper's channel is better, no positive secret rate is achievable.",
    starterCode: `import math
def secrecy_capacity(power, noise_main, noise_eaves):
    # Your code here
    pass`,
    solution: `import math
def secrecy_capacity(power, noise_main, noise_eaves):
    rate = 0.5 * math.log2(1.0 + power / noise_main) - 0.5 * math.log2(1.0 + power / noise_eaves)
    return max(0.0, rate)`,
    testCases: [
      { input: [1.0, 1.0, 1.0], expected: 0.0 },
      { input: [10.0, 1.0, 10.0], expected: 1.2297158093186487 },
      { input: [1.0, 1.0, 4.0], expected: 0.3390359525563188 },
      { input: [5.0, 2.0, 1.0], expected: 0.0 },
    ],
    hint: "Secrecy needs the legitimate channel to be less noisy than the eavesdropper's.",
  },
  {
    id: "info-209",
    title: "Key Agreement Rate",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the achievable secret-key rate from mutual informations:\n\nrate = max(0, I(A;B) - I(A;E))\n\nThe legitimate pair must share more information with each other than the eavesdropper shares with them.",
    starterCode: `def key_agreement_rate(mi_ab, mi_ae):
    # Your code here
    pass`,
    solution: `def key_agreement_rate(mi_ab, mi_ae):
    return max(0.0, mi_ab - mi_ae)`,
    testCases: [
      { input: [2.0, 0.5], expected: 1.5 },
      { input: [1.0, 1.0], expected: 0.0 },
      { input: [0.5, 1.0], expected: 0.0 },
      { input: [3.0, 2.0], expected: 1.0 },
    ],
    hint: "The advantage over the eavesdropper sets the key rate.",
  },
  {
    id: "info-210",
    title: "Privacy Amplification Bits",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the number of secure bits produced by privacy amplification:\n\nmax(0, min_entropy - leaked - 2 * log2(1 / epsilon))\n\nwhere min_entropy is the min-entropy the eavesdropper does not know, leaked is the number of exposed bits, and epsilon the desired statistical security parameter.",
    starterCode: `import math
def privacy_amplification_bits(min_entropy, leaked, epsilon):
    # Your code here
    pass`,
    solution: `import math
def privacy_amplification_bits(min_entropy, leaked, epsilon):
    return max(0.0, min_entropy - leaked - 2.0 * math.log2(1.0 / epsilon))`,
    testCases: [
      { input: [10.0, 2.0, 0.001], expected: 0.0 },
      { input: [20.0, 2.0, 0.01], expected: 4.712287620450551 },
      { input: [8.0, 0.0, 0.5], expected: 6.0 },
      { input: [5.0, 4.0, 0.1], expected: 0.0 },
    ],
    hint: "A smaller epsilon costs two extra bits per decade of security.",
  },
  {
    id: "info-211",
    title: "Min-Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the min-entropy in bits of a probability distribution:\n\nH_min = -log2(max(p))\n\nThe min-entropy is governed by the single most likely outcome rather than by the whole distribution.",
    starterCode: `import math
def min_entropy(probs):
    # Your code here
    pass`,
    solution: `import math
def min_entropy(probs):
    return -math.log2(max(probs))`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[0.25, 0.75]], expected: 0.4150374992788438 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.1, 0.2, 0.7]], expected: 0.5145731728297583 },
    ],
    hint: "Min-entropy is never larger than Shannon entropy.",
  },
  {
    id: "info-212",
    title: "Collision Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the collision entropy (Renyi entropy of order 2) in bits:\n\nH2 = -log2(sum(p_i^2))\n\nA larger collision probability means lower entropy.",
    starterCode: `import math
def collision_entropy(probs):
    # Your code here
    pass`,
    solution: `import math
def collision_entropy(probs):
    total = 0.0
    for p in probs:
        total += p * p
    return -math.log2(total)`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
      { input: [[0.5, 0.25, 0.25]], expected: 1.415037499278844 },
    ],
    hint: "The sum of squared probabilities is the probability that two independent draws collide.",
  },
  {
    id: "info-213",
    title: "Tsallis Entropy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Tsallis entropy of order q:\n\nS_q = (1 - sum(p_i^q)) / (q - 1)\n\nAssume q != 1 and all probabilities are positive.",
    starterCode: `import math
def tsallis_entropy(probs, q):
    # Your code here
    pass`,
    solution: `import math
def tsallis_entropy(probs, q):
    total = 0.0
    for p in probs:
        total += p ** q
    return (1.0 - total) / (q - 1.0)`,
    testCases: [
      { input: [[0.5, 0.5], 2.0], expected: 0.5 },
      { input: [[0.5, 0.5], 3.0], expected: 0.375 },
      { input: [[0.25, 0.25, 0.25, 0.25], 2.0], expected: 0.75 },
      { input: [[0.5, 0.5], 0.5], expected: 0.8284271247461903 },
    ],
    hint: "As q approaches 1 the Tsallis entropy converges to the Shannon entropy.",
  },
  {
    id: "info-214",
    title: "Fisher Information (Gaussian)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the 2x2 Fisher information matrix for a Gaussian with unknown mean and variance:\n\ndiag(1 / var, 1 / (2 * var^2))\n\nThe matrix is diagonal and each entry measures how sharply the likelihood responds to one parameter.",
    starterCode: `def fisher_information_gaussian(var):
    # Your code here
    pass`,
    solution: `def fisher_information_gaussian(var):
    return [[1.0 / var, 0.0], [0.0, 1.0 / (2.0 * var * var)]]`,
    testCases: [
      { input: [1.0], expected: [[1.0, 0.0], [0.0, 0.5]] },
      { input: [2.0], expected: [[0.5, 0.0], [0.0, 0.125]] },
      { input: [0.5], expected: [[2.0, 0.0], [0.0, 2.0]] },
      { input: [4.0], expected: [[0.25, 0.0], [0.0, 0.03125]] },
    ],
    hint: "The mean and variance parameters are orthogonal for a Gaussian.",
  },
  {
    id: "info-215",
    title: "Cramer-Rao Bound",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Cramer-Rao variance lower bound for an unbiased estimator:\n\nVar(theta_hat) >= 1 / fisher_info",
    starterCode: `def cramer_rao_bound(fisher_info):
    # Your code here
    pass`,
    solution: `def cramer_rao_bound(fisher_info):
    return 1.0 / fisher_info`,
    testCases: [
      { input: [2.0], expected: 0.5 },
      { input: [0.5], expected: 2.0 },
      { input: [10.0], expected: 0.1 },
      { input: [1.0], expected: 1.0 },
    ],
    hint: "More Fisher information means a tighter bound on estimator variance.",
  },
  {
    id: "info-216",
    title: "Estimator Efficiency",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the efficiency of an unbiased estimator:\n\nefficiency = (1 / fisher_info) / variance\n\nAn efficient estimator attains the Cramer-Rao bound and scores 1.0.",
    starterCode: `def estimator_efficiency(variance, fisher_info):
    # Your code here
    pass`,
    solution: `def estimator_efficiency(variance, fisher_info):
    return (1.0 / fisher_info) / variance`,
    testCases: [
      { input: [1.0, 1.0], expected: 1.0 },
      { input: [2.0, 1.0], expected: 0.5 },
      { input: [0.5, 2.0], expected: 1.0 },
      { input: [4.0, 0.5], expected: 0.5 },
    ],
    hint: "Efficiency is below 1 whenever the estimator is noisier than the bound.",
  },
  {
    id: "info-217",
    title: "Partition Function",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the exponential-family partition function for a single sufficient statistic:\n\nZ(eta) = sum_x exp(eta * t_x)\n\nwhere t_values lists the statistic values over the support.",
    starterCode: `import math
def partition_function(eta, t_values):
    # Your code here
    pass`,
    solution: `import math
def partition_function(eta, t_values):
    total = 0.0
    for t in t_values:
        total += math.exp(eta * t)
    return total`,
    testCases: [
      { input: [0.0, [1, 2, 3]], expected: 3.0 },
      { input: [1.0, [0, 1]], expected: 3.718281828459045 },
      { input: [2.0, [-1, 0, 1]], expected: 8.524391382167263 },
      { input: [-0.5, [0, 2]], expected: 1.3678794411714423 },
    ],
    hint: "The partition function normalizes the exponential family distribution.",
  },
  {
    id: "info-218",
    title: "Natural Parameter to Mean",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert the natural parameter of a Bernoulli distribution to its mean:\n\np = 1 / (1 + exp(-eta))\n\nThe logistic sigmoid maps the real line to the interval (0, 1).",
    starterCode: `import math
def bernoulli_natural_to_mean(eta):
    # Your code here
    pass`,
    solution: `import math
def bernoulli_natural_to_mean(eta):
    return 1.0 / (1.0 + math.exp(-eta))`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [1.0], expected: 0.7310585786300049 },
      { input: [-2.0], expected: 0.11920292202211755 },
      { input: [5.0], expected: 0.9933071490757153 },
    ],
    hint: "eta = 0 corresponds to a fair coin.",
  },
  {
    id: "info-219",
    title: "KL Projection Step",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Perform one Newton step of KL projection (moment matching) onto an exponential family. Given probs over values x_values and a target mean, compute the current mean and variance, set theta = (target_mean - mean) / variance, reweight q_i proportional to p_i * exp(theta * x_i), and return the normalized result. Return probs unchanged if the variance is zero or the mean already matches.",
    starterCode: `import math
def kl_projection_step(probs, x_values, target_mean):
    # Your code here
    pass`,
    solution: `import math
def kl_projection_step(probs, x_values, target_mean):
    mean = 0.0
    for p, x in zip(probs, x_values):
        mean += p * x
    var = 0.0
    for p, x in zip(probs, x_values):
        var += p * (x - mean) * (x - mean)
    if var <= 0.0 or abs(target_mean - mean) < 1e-15:
        return list(probs)
    theta = (target_mean - mean) / var
    weights = []
    for p, x in zip(probs, x_values):
        weights.append(p * math.exp(theta * x))
    z = sum(weights)
    return [w / z for w in weights]`,
    testCases: [
      { input: [[0.5, 0.5], [0, 1], 0.5], expected: [0.5, 0.5] },
      {
        input: [[0.5, 0.5], [0, 1], 0.75],
        expected: [0.2689414213699951, 0.7310585786300049],
      },
      {
        input: [[0.5, 0.5], [0, 1], 0.25],
        expected: [0.7310585786300049, 0.2689414213699951],
      },
      {
        input: [[0.25, 0.5, 0.25], [0, 1, 2], 1.5],
        expected: [0.07232948812851327, 0.39322386648296365, 0.534446645388523],
      },
    ],
    hint: "Iterating this step converges to the I-projection of p onto the moment constraint.",
  },
  {
    id: "info-220",
    title: "Variational Free Energy",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the variational free energy in nats:\n\nF = sum_i q_i * (ln(q_i) - ln p_i)\n\nover states with q_i > 0, where q_probs is the variational posterior and log_p_joint gives ln p(x, z). Free energy is the negative evidence lower bound.",
    starterCode: `import math
def free_energy_decomposition(q_probs, log_p_joint):
    # Your code here
    pass`,
    solution: `import math
def free_energy_decomposition(q_probs, log_p_joint):
    total = 0.0
    for q, lp in zip(q_probs, log_p_joint):
        if q > 0:
            total += q * (math.log(q) - lp)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.0, 0.0]], expected: -0.6931471805599453 },
      { input: [[1.0, 0.0], [0.0, -100.0]], expected: 0.0 },
      { input: [[0.5, 0.5], [-1.0, -1.0]], expected: 0.3068528194400547 },
      { input: [[0.25, 0.75], [-2.0, -0.5]], expected: 0.3126648553811917 },
    ],
    hint: "Free energy equals negative log evidence plus KL(q || posterior).",
  },
  {
    id: "info-221",
    title: "Bits-Back Coding",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the total description length in bits of a bits-back code:\n\nlength = nll_bits + kl_bits\n\nwhere nll_bits is the negative log-likelihood and kl_bits the KL divergence from the posterior to the prior.",
    starterCode: `def bits_back_coding(nll_bits, kl_bits):
    # Your code here
    pass`,
    solution: `def bits_back_coding(nll_bits, kl_bits):
    return nll_bits + kl_bits`,
    testCases: [
      { input: [10.0, 2.0], expected: 12.0 },
      { input: [0.0, 0.0], expected: 0.0 },
      { input: [5.5, 1.5], expected: 7.0 },
      { input: [3.0, 0.0], expected: 3.0 },
    ],
    hint: "A tighter posterior (smaller KL) shortens the code.",
  },
  {
    id: "info-222",
    title: "Butterfly Network Capacity",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the multicast capacity of the symmetric butterfly network when each link has capacity link_capacity. Each receiver has two edge-disjoint paths, so network coding achieves 2 * link_capacity while plain routing only achieves link_capacity.",
    starterCode: `def butterfly_capacity(link_capacity):
    # Your code here
    pass`,
    solution: `def butterfly_capacity(link_capacity):
    return 2.0 * link_capacity`,
    testCases: [
      { input: [1.0], expected: 2.0 },
      { input: [0.0], expected: 0.0 },
      { input: [0.5], expected: 1.0 },
      { input: [10.0], expected: 20.0 },
    ],
    hint: "The middle link is coded so both receivers benefit from a single transmission.",
  },
  {
    id: "info-223",
    title: "Wyner-Ziv Gaussian Rate",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Wyner-Ziv rate in bits for a Gaussian source with side information:\n\nR = 0.5 * log2(var * (1 - rho^2) / distortion)\n\nwhere rho is the correlation with the side information at the decoder. Assume 0 < distortion <= var * (1 - rho^2).",
    starterCode: `import math
def wyner_ziv_gaussian_rate(var, rho, distortion):
    # Your code here
    pass`,
    solution: `import math
def wyner_ziv_gaussian_rate(var, rho, distortion):
    return 0.5 * math.log2(var * (1.0 - rho * rho) / distortion)`,
    testCases: [
      { input: [1.0, 0.0, 0.25], expected: 1.0 },
      { input: [1.0, 0.5, 0.75], expected: 0.0 },
      { input: [4.0, 0.0, 1.0], expected: 1.0 },
      { input: [4.0, 0.6, 2.0], expected: 0.17807190511263768 },
    ],
    hint: "Stronger side information reduces the conditional variance and the rate.",
  },
  {
    id: "info-224",
    title: "Griesmer Bound",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Griesmer lower bound on the length of a binary linear code with k information bits and minimum distance d:\n\nn >= sum_{i=0}^{k-1} ceil(d / 2^i)",
    starterCode: `import math
def griesmer_bound(k, d):
    # Your code here
    pass`,
    solution: `import math
def griesmer_bound(k, d):
    total = 0
    for i in range(k):
        total += math.ceil(d / (2 ** i))
    return total`,
    testCases: [
      { input: [4, 3], expected: 7 },
      { input: [3, 4], expected: 7 },
      { input: [2, 4], expected: 6 },
      { input: [1, 5], expected: 5 },
    ],
    hint: "The Hamming code meets the Griesmer bound with equality.",
  },
  {
    id: "info-225",
    title: "Stochastic Complexity",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the stochastic complexity of a model in nats: the negative log-likelihood plus half a log term per parameter:\n\nSC = nll_nats + 0.5 * n_params * ln(n_samples)\n\nAssume n_samples >= 1.",
    starterCode: `import math
def stochastic_complexity(nll_nats, n_params, n_samples):
    # Your code here
    pass`,
    solution: `import math
def stochastic_complexity(nll_nats, n_params, n_samples):
    return nll_nats + 0.5 * n_params * math.log(n_samples)`,
    testCases: [
      { input: [10.0, 2, 100], expected: 14.605170185988092 },
      { input: [0.0, 1, 1], expected: 0.0 },
      { input: [5.0, 3, 8], expected: 8.119162312519753 },
      { input: [2.5, 0, 50], expected: 2.5 },
    ],
    hint: "This is the BIC-style penalty expressed in nats instead of bits.",
  },
];
