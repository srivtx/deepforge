import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-001",
    title: "Self-Information",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the self-information (surprisal) of an event with probability p:\n\nI(p) = -ln(p)\n\nUse the natural logarithm. Assume 0 < p <= 1.",
    starterCode: `import math
def self_information(p):
    # Your code here
    pass`,
    solution: `import math
def self_information(p):
    return -math.log(p)`,
    testCases: [
      { input: [1.0], expected: 0.0 },
      { input: [0.5], expected: 0.6931471805599453 },
      { input: [0.25], expected: 1.3862943611198906 },
      { input: [0.1], expected: 2.3025850929940455 },
    ],
    hint: "Rare events carry more information; a certain event carries none.",
  },
  {
    id: "info-002",
    title: "Entropy of a Distribution",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the Shannon entropy in bits of a discrete probability distribution given as a list of probabilities:\n\nH(p) = -sum(p_i * log2(p_i))\n\nSkip zero-probability outcomes, treating 0 * log(0) as 0.",
    starterCode: `import math
def entropy_bits(probs):
    # Your code here
    pass`,
    solution: `import math
def entropy_bits(probs):
    total = 0.0
    for p in probs:
        if p > 0:
            total -= p * math.log2(p)
    return total`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 1.0 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
      { input: [[0.5, 0.25, 0.25]], expected: 1.5 },
      { input: [[0.7, 0.3]], expected: 0.8812908992306927 },
    ],
    hint: "Entropy is maximized when all outcomes are equally likely.",
  },
  {
    id: "info-003",
    title: "Entropy from Counts",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Convert raw counts into a probability distribution and return its Shannon entropy in bits:\n\nH = -sum(p_i * log2(p_i)),  p_i = c_i / sum(c)\n\nIgnore zero counts. Return 0.0 if the counts sum to zero.",
    starterCode: `import math
def entropy_from_counts(counts):
    # Your code here
    pass`,
    solution: `import math
def entropy_from_counts(counts):
    total = sum(counts)
    if total <= 0:
        return 0.0
    h = 0.0
    for c in counts:
        if c > 0:
            p = c / total
            h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [[1, 1]], expected: 1.0 },
      { input: [[3, 1]], expected: 0.8112781244591328 },
      { input: [[1, 2, 3, 4]], expected: 1.8464393446710154 },
      { input: [[10]], expected: 0.0 },
      { input: [[0, 5, 5]], expected: 1.0 },
    ],
    hint: "Normalize the counts first, then apply the entropy formula.",
  },
  {
    id: "info-004",
    title: "Binary Entropy Function",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the binary entropy function in bits:\n\nH(p) = -p * log2(p) - (1 - p) * log2(1 - p)\n\nReturn 0.0 for p = 0 or p = 1.",
    starterCode: `import math
def binary_entropy(p):
    # Your code here
    pass`,
    solution: `import math
def binary_entropy(p):
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * math.log2(p) - (1.0 - p) * math.log2(1.0 - p)`,
    testCases: [
      { input: [0.0], expected: 0.0 },
      { input: [0.5], expected: 1.0 },
      { input: [1.0], expected: 0.0 },
      { input: [0.25], expected: 0.8112781244591328 },
      { input: [0.9], expected: 0.4689955935892811 },
    ],
    hint: "The function is symmetric: H(p) = H(1 - p).",
  },
  {
    id: "info-005",
    title: "Joint Entropy of a Distribution",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the joint entropy in bits of a 2D joint distribution joint[x][y]:\n\nH(X, Y) = -sum(p * log2(p))\n\nSkip zero entries.",
    starterCode: `import math
def joint_entropy(joint):
    # Your code here
    pass`,
    solution: `import math
def joint_entropy(joint):
    h = 0.0
    for row in joint:
        for p in row:
            if p > 0:
                h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: 2.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 1.0 },
      { input: [[[1.0]]], expected: 0.0 },
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: 1.8464393446710154 },
    ],
    hint: "Flatten the table conceptually and treat every cell as one outcome.",
  },
  {
    id: "info-006",
    title: "Conditional Entropy H(X|Y)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a 2D joint distribution joint[x][y], compute the conditional entropy H(X|Y) in bits using\n\nH(X|Y) = H(X, Y) - H(Y)\n\nwhere H(Y) is the entropy of the column marginals. Skip zero terms.",
    starterCode: `import math
def conditional_entropy(joint):
    # Your code here
    pass`,
    solution: `import math
def conditional_entropy(joint):
    return joint_entropy(joint) - entropy_bits(marginal_y(joint))

def joint_entropy(joint):
    h = 0.0
    for row in joint:
        for p in row:
            if p > 0:
                h -= p * math.log2(p)
    return h

def marginal_y(joint):
    cols = len(joint[0]) if joint else 0
    py = [0.0] * cols
    for row in joint:
        for j, p in enumerate(row):
            py[j] += p
    return py

def entropy_bits(probs):
    total = 0.0
    for p in probs:
        if p > 0:
            total -= p * math.log2(p)
    return total`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: 1.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 0.0 },
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: 0.8754887502163469 },
      { input: [[[0.5, 0.25], [0.0, 0.25]]], expected: 0.5 },
    ],
    hint: "H(X|Y) = H(X, Y) - H(Y) because entropy is additive over the chain rule.",
  },
  {
    id: "info-007",
    title: "Chain Rule Entropy Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Verify the entropy chain rule numerically. From a 2D joint distribution joint[x][y], return the absolute residual\n\n|H(X, Y) - H(Y) - H(X|Y)|\n\nwhere H(X|Y) is built from the row conditionals. The result should be within floating-point error of 0.",
    starterCode: `import math
def chain_rule_gap(joint):
    # Your code here
    pass`,
    solution: `import math
def chain_rule_gap(joint):
    h_xy = joint_entropy(joint)
    py = marginal_y(joint)
    h_y = entropy_bits(py)
    h_x_given_y = 0.0
    for j, pj in enumerate(py):
        if pj > 0:
            cond = [row[j] / pj for row in joint]
            h_x_given_y += pj * entropy_bits(cond)
    return abs(h_xy - h_y - h_x_given_y)

def joint_entropy(joint):
    h = 0.0
    for row in joint:
        for p in row:
            if p > 0:
                h -= p * math.log2(p)
    return h

def marginal_y(joint):
    cols = len(joint[0]) if joint else 0
    py = [0.0] * cols
    for row in joint:
        for j, p in enumerate(row):
            py[j] += p
    return py

def entropy_bits(probs):
    total = 0.0
    for p in probs:
        if p > 0:
            total -= p * math.log2(p)
    return total`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 0.0 },
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: 0.0 },
      { input: [[[0.5, 0.25], [0.0, 0.25]]], expected: 0.0 },
    ],
    hint: "Compute H(X|Y) independently from the conditionals rather than reusing H(X, Y) - H(Y).",
  },
  {
    id: "info-008",
    title: "Mutual Information from Joint",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mutual information I(X; Y) in bits from a 2D joint distribution joint[x][y]:\n\nI = sum(p(x, y) * log2(p(x, y) / (p(x) * p(y))))\n\nSkip terms with p(x, y) = 0.",
    starterCode: `import math
def mutual_information(joint):
    # Your code here
    pass`,
    solution: `import math
def mutual_information(joint):
    px = [sum(row) for row in joint]
    py = marginal_y(joint)
    mi = 0.0
    for i, row in enumerate(joint):
        for j, p in enumerate(row):
            if p > 0:
                mi += p * math.log2(p / (px[i] * py[j]))
    return mi

def marginal_y(joint):
    cols = len(joint[0]) if joint else 0
    py = [0.0] * cols
    for row in joint:
        for j, p in enumerate(row):
            py[j] += p
    return py`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 1.0 },
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: 0.005802149014345649 },
      { input: [[[0.5, 0.25], [0.25, 0.0]]], expected: 0.12255624891826565 },
    ],
    hint: "Mutual information is the KL divergence between the joint and the product of marginals.",
  },
  {
    id: "info-009",
    title: "Mutual Information from Marginals",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a marginal px and a conditional distribution cond[i][j] = P(Y = j | X = i), compute I(X; Y) in bits:\n\nI = sum_i px[i] * sum_j P(j|i) * log2(P(j|i) / p(y_j))\n\nwhere p(y_j) = sum_i px[i] * P(j|i). Skip zero terms.",
    starterCode: `import math
def mi_from_marginals(px, cond):
    # Your code here
    pass`,
    solution: `import math
def mi_from_marginals(px, cond):
    m = len(cond[0]) if cond else 0
    py = [0.0] * m
    for i in range(len(px)):
        for j in range(m):
            py[j] += px[i] * cond[i][j]
    mi = 0.0
    for i in range(len(px)):
        for j in range(m):
            p = cond[i][j]
            if p > 0:
                mi += px[i] * p * math.log2(p / py[j])
    return mi`,
    testCases: [
      { input: [[0.5, 0.5], [[1.0, 0.0], [0.0, 1.0]]], expected: 1.0 },
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[0.75, 0.25], [[0.5, 0.5], [0.0, 1.0]]], expected: 0.204434002924965 },
      { input: [[0.5, 0.5], [[0.9, 0.1], [0.1, 0.9]]], expected: 0.5310044064107189 },
    ],
    hint: "First compute the output marginal p(y), then average the log-ratio over the input marginal.",
  },
  {
    id: "info-010",
    title: "Pointwise Mutual Information",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the pointwise mutual information in bits:\n\nPMI = log2(P(x, y) / (P(x) * P(y)))\n\nThe joint and marginal probabilities are passed as separate arguments.",
    starterCode: `import math
def pointwise_mi(pxy, px, py):
    # Your code here
    pass`,
    solution: `import math
def pointwise_mi(pxy, px, py):
    return math.log2(pxy / (px * py))`,
    testCases: [
      { input: [0.25, 0.5, 0.5], expected: 0.0 },
      { input: [0.5, 0.5, 0.5], expected: 1.0 },
      { input: [0.2, 0.5, 0.5], expected: -0.3219280948873623 },
      { input: [0.125, 0.5, 0.5], expected: -1.0 },
    ],
    hint: "PMI is positive when the events co-occur more than chance would predict.",
  },
  {
    id: "info-011",
    title: "Variation of Information",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the variation of information in bits between the two variables of a joint distribution joint[x][y]:\n\nVI = H(X|Y) + H(Y|X)\n\nBuild the conditionals from the row and column marginals. Skip zero-probability rows or columns.",
    starterCode: `import math
def variation_of_information(joint):
    # Your code here
    pass`,
    solution: `import math
def variation_of_information(joint):
    px = [sum(row) for row in joint]
    py = marginal_y(joint)
    return cond_x_given_y(joint, py) + cond_y_given_x(joint, px)

def marginal_y(joint):
    cols = len(joint[0]) if joint else 0
    py = [0.0] * cols
    for row in joint:
        for j, p in enumerate(row):
            py[j] += p
    return py

def entropy_bits(probs):
    total = 0.0
    for p in probs:
        if p > 0:
            total -= p * math.log2(p)
    return total

def cond_x_given_y(joint, py):
    h = 0.0
    for j, pj in enumerate(py):
        if pj > 0:
            cond = [row[j] / pj for row in joint]
            h += pj * entropy_bits(cond)
    return h

def cond_y_given_x(joint, px):
    h = 0.0
    for i, row in enumerate(joint):
        if px[i] > 0:
            cond = [p / px[i] for p in row]
            h += px[i] * entropy_bits(cond)
    return h`,
    testCases: [
      { input: [[[0.25, 0.25], [0.25, 0.25]]], expected: 2.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]]], expected: 0.0 },
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: 1.8406371956566698 },
      { input: [[[0.5, 0.25], [0.0, 0.25]]], expected: 1.188721875540867 },
    ],
    hint: "VI is a metric: it is 0 only when the variables determine each other perfectly.",
  },
  {
    id: "info-012",
    title: "Cross-Entropy Between Distributions",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the cross-entropy in bits between a true distribution p and a model distribution q:\n\nH(p, q) = -sum(p_i * log2(q_i))\n\nSkip terms with p_i = 0. Assume q_i > 0 wherever p_i > 0.",
    starterCode: `import math
def cross_entropy(p, q):
    # Your code here
    pass`,
    solution: `import math
def cross_entropy(p, q):
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total -= pi * math.log2(qi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 1.207518749639422 },
      { input: [[1.0, 0.0], [0.5, 0.5]], expected: 1.0 },
      { input: [[0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]], expected: 2.0 },
    ],
    hint: "Cross-entropy equals H(p) + D(p || q).",
  },
  {
    id: "info-013",
    title: "KL Divergence (Discrete)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Kullback-Leibler divergence D(p || q) in bits:\n\nD = sum(p_i * log2(p_i / q_i))\n\nSkip terms with p_i = 0. Assume q_i > 0 wherever p_i > 0.",
    starterCode: `import math
def kl_divergence(p, q):
    # Your code here
    pass`,
    solution: `import math
def kl_divergence(p, q):
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total += pi * math.log2(pi / qi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.20751874963942185 },
      { input: [[0.9, 0.1], [0.5, 0.5]], expected: 0.5310044064107189 },
      { input: [[0.25, 0.25, 0.25, 0.25], [0.5, 0.25, 0.125, 0.125]], expected: 0.25 },
      { input: [[1.0, 0.0], [0.25, 0.75]], expected: 2.0 },
    ],
    hint: "KL divergence is always >= 0 and is 0 only when p equals q.",
  },
  {
    id: "info-014",
    title: "KL Divergence Asymmetry Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Quantify how asymmetric KL divergence is for a pair of distributions by returning |D(p || q) - D(q || p)| in bits. Compute both divergences with 0 * log(0) treated as 0 and take the absolute difference.",
    starterCode: `import math
def kl_asymmetry(p, q):
    # Your code here
    pass`,
    solution: `import math
def kl_asymmetry(p, q):
    return abs(kl_divergence(p, q) - kl_divergence(q, p))

def kl_divergence(p, q):
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total += pi * math.log2(pi / qi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.018796874098554683 },
      { input: [[0.9, 0.1], [0.5, 0.5]], expected: 0.20596118775548722 },
      { input: [[0.5, 0.25, 0.25], [0.25, 0.5, 0.25]], expected: 0.0 },
      { input: [[0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]], expected: 0.0 },
    ],
    hint: "KL is not symmetric, so the gap is generally positive.",
  },
  {
    id: "info-015",
    title: "Jensen-Shannon Divergence",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Jensen-Shannon divergence in bits between p and q:\n\nm = (p + q) / 2\nJSD = 0.5 * D(p || m) + 0.5 * D(q || m)\n\nwhere D is the KL divergence in bits. Skip zero probability terms.",
    starterCode: `import math
def jensen_shannon(p, q):
    # Your code here
    pass`,
    solution: `import math
def jensen_shannon(p, q):
    m = [(a + b) / 2.0 for a, b in zip(p, q)]
    return 0.5 * kl_divergence(p, m) + 0.5 * kl_divergence(q, m)

def kl_divergence(p, q):
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            total += pi * math.log2(pi / qi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.0487949406953985 },
      { input: [[0.9, 0.1], [0.5, 0.5]], expected: 0.1467931024360521 },
    ],
    hint: "JSD is symmetric and bounded by 1 bit.",
  },
  {
    id: "info-016",
    title: "KL Divergence of Gaussians",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the KL divergence in nats between two univariate Gaussians:\n\nD = 0.5 * (ln(var2 / var1) + (var1 + (mu1 - mu2)^2) / var2 - 1)\n\nUse the natural logarithm. Assume all variances are positive.",
    starterCode: `import math
def kl_gaussian(mu1, var1, mu2, var2):
    # Your code here
    pass`,
    solution: `import math
def kl_gaussian(mu1, var1, mu2, var2):
    return 0.5 * (math.log(var2 / var1) + (var1 + (mu1 - mu2) ** 2) / var2 - 1.0)`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 1.0], expected: 0.0 },
      { input: [1.0, 1.0, 0.0, 1.0], expected: 0.5 },
      { input: [0.0, 1.0, 0.0, 4.0], expected: 0.3181471805599453 },
      { input: [0.0, 2.0, 0.0, 1.0], expected: 0.1534264097200273 },
      { input: [3.0, 2.0, 1.0, 4.0], expected: 0.5965735902799727 },
    ],
    hint: "Match means or variances and the formula reduces to familiar special cases.",
  },
  {
    id: "info-017",
    title: "Total Variation Distance",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the total variation distance between two probability distributions:\n\nTV = 0.5 * sum(|p_i - q_i|)\n\nThe result always lies between 0 and 1.",
    starterCode: `def total_variation(p, q):
    # Your code here
    pass`,
    solution: `def total_variation(p, q):
    return 0.5 * sum(abs(a - b) for a, b in zip(p, q))`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.25 },
      { input: [[0.1, 0.2, 0.7], [0.2, 0.2, 0.6]], expected: 0.09999999999999999 },
    ],
    hint: "TV is half the L1 distance because probability mass shifted from one outcome must land somewhere else.",
  },
  {
    id: "info-018",
    title: "Hellinger Distance",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the Hellinger distance between two distributions:\n\nH = sqrt(1 - sum(sqrt(p_i * q_i)))\n\nClamp the expression inside the square root at 0 to avoid tiny negative values from floating point.",
    starterCode: `import math
def hellinger(p, q):
    # Your code here
    pass`,
    solution: `import math
def hellinger(p, q):
    bc = 0.0
    for a, b in zip(p, q):
        bc += math.sqrt(a * b)
    return math.sqrt(max(0.0, 1.0 - bc))`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 1.0 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.18459191128251476 },
      { input: [[0.1, 0.2, 0.7], [0.2, 0.2, 0.6]], expected: 0.10249182368318223 },
    ],
    hint: "sum(sqrt(p_i * q_i)) is the Bhattacharyya coefficient.",
  },
  {
    id: "info-019",
    title: "Chi-Square Distance",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the chi-square distance between two distributions:\n\nchi2 = sum((p_i - q_i)^2 / q_i)\n\nAssume q_i > 0 for every outcome.",
    starterCode: `def chi_square_distance(p, q):
    # Your code here
    pass`,
    solution: `def chi_square_distance(p, q):
    total = 0.0
    for a, b in zip(p, q):
        total += (a - b) * (a - b) / b
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.3333333333333333 },
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.25, 0.75], [0.5, 0.5]], expected: 0.25 },
      { input: [[0.2, 0.3, 0.5], [0.25, 0.25, 0.5]], expected: 0.01999999999999999 },
    ],
    hint: "The chi-square distance weights differences by the reference probability 1 / q_i.",
  },
  {
    id: "info-020",
    title: "Perplexity from Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert an entropy measured in bits to perplexity:\n\nperplexity = 2^H\n\nThe result is the effective number of equally likely outcomes.",
    starterCode: `def perplexity_from_entropy(h):
    # Your code here
    pass`,
    solution: `def perplexity_from_entropy(h):
    return 2.0 ** h`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [1.0], expected: 2.0 },
      { input: [4.0], expected: 16.0 },
      { input: [0.5], expected: 1.4142135623730951 },
    ],
    hint: "Perplexity is the exponentiation of entropy, undoing the logarithm.",
  },
  {
    id: "info-021",
    title: "Perplexity from Cross-Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert a cross-entropy measured in bits to perplexity:\n\nperplexity = 2^CE\n\nSmaller values indicate a better model.",
    starterCode: `def perplexity_from_cross_entropy(ce):
    # Your code here
    pass`,
    solution: `def perplexity_from_cross_entropy(ce):
    return 2.0 ** ce`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [3.0], expected: 8.0 },
      { input: [2.5], expected: 5.656854249492381 },
      { input: [10.0], expected: 1024.0 },
    ],
    hint: "A model that assigns probability 1 to every observed token has perplexity 1.",
  },
  {
    id: "info-022",
    title: "Perplexity from Log-Likelihood",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a list of natural-log probabilities assigned to observed events, compute perplexity:\n\nperplexity = exp(-mean(log_probs))\n\nAssume the list is non-empty.",
    starterCode: `import math
def perplexity_from_log_likelihood(log_probs):
    # Your code here
    pass`,
    solution: `import math
def perplexity_from_log_likelihood(log_probs):
    return math.exp(-sum(log_probs) / len(log_probs))`,
    testCases: [
      {
        input: [
          [-0.6931471805599453, -0.6931471805599453, -0.6931471805599453, -0.6931471805599453],
        ],
        expected: 2.0,
      },
      { input: [[0.0, 0.0]], expected: 1.0 },
      { input: [[-1.6094379124341003, -1.6094379124341003]], expected: 4.999999999999999 },
      { input: [[-2.302585092994046, -1.6094379124341003]], expected: 7.071067811865476 },
    ],
    hint: "Exponentiate the mean negative log-likelihood.",
  },
  {
    id: "info-023",
    title: "Uniform Distribution Entropy",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the entropy in bits of a uniform distribution over n equally likely outcomes:\n\nH = log2(n)\n\nReturn 0.0 for n <= 1.",
    starterCode: `import math
def uniform_entropy(n):
    # Your code here
    pass`,
    solution: `import math
def uniform_entropy(n):
    if n <= 1:
        return 0.0
    return math.log2(n)`,
    testCases: [
      { input: [1], expected: 0.0 },
      { input: [2], expected: 1.0 },
      { input: [8], expected: 3.0 },
      { input: [10], expected: 3.321928094887362 },
    ],
    hint: "The uniform distribution maximizes entropy over a fixed support.",
  },
  {
    id: "info-024",
    title: "Maximum Entropy with Mean Constraint",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Over the support {0, 1, 2}, find the maximum-entropy distribution whose mean equals mu. The solution is the exponential family p(x) proportional to exp(theta * x); find theta by bisection on [-60, 60] for 200 iterations so the mean matches mu, then return the entropy in bits. Assume 0 < mu < 2.",
    starterCode: `import math
def max_entropy_mean(mu):
    # Your code here
    pass`,
    solution: `import math
def max_entropy_mean(mu):
    lo, hi = -60.0, 60.0
    for _ in range(200):
        mid = (lo + hi) / 2.0
        w1 = math.exp(mid)
        w2 = math.exp(2.0 * mid)
        mean = (w1 + 2.0 * w2) / (1.0 + w1 + w2)
        if mean < mu:
            lo = mid
        else:
            hi = mid
    theta = (lo + hi) / 2.0
    w1 = math.exp(theta)
    w2 = math.exp(2.0 * theta)
    z = 1.0 + w1 + w2
    probs = [1.0 / z, w1 / z, w2 / z]
    h = 0.0
    for p in probs:
        if p > 0:
            h -= p * math.log2(p)
    return h`,
    testCases: [
      { input: [1.0], expected: 1.584962500721156 },
      { input: [0.5], expected: 1.3002068332819543 },
      { input: [1.5], expected: 1.300206833281954 },
      { input: [0.2], expected: 0.7726396477406536 },
    ],
    hint: "The mean is increasing in theta, so bisection converges; mu = 1 gives the uniform distribution.",
  },
  {
    id: "info-025",
    title: "Entropy of a Geometric Distribution",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the entropy in bits of a geometric distribution on {1, 2, 3, ...} with success probability p:\n\nH = (-(1 - p) * log2(1 - p) - p * log2(p)) / p\n\nReturn 0.0 when p = 1.",
    starterCode: `import math
def geometric_entropy(p):
    # Your code here
    pass`,
    solution: `import math
def geometric_entropy(p):
    if p >= 1.0:
        return 0.0
    return (-(1.0 - p) * math.log2(1.0 - p) - p * math.log2(p)) / p`,
    testCases: [
      { input: [0.5], expected: 2.0 },
      { input: [0.25], expected: 3.2451124978365313 },
      { input: [0.1], expected: 4.689955935892812 },
      { input: [1.0], expected: 0.0 },
    ],
    hint: "For p = 1/2 the numerator is 1, so H = 1 / p = 2 bits.",
  },
  {
    id: "info-026",
    title: "Bernoulli Entropy in Nats",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the entropy of a Bernoulli(p) distribution in nats:\n\nH = -p * ln(p) - (1 - p) * ln(1 - p)\n\nReturn 0.0 for p = 0 or p = 1.",
    starterCode: `import math
def bernoulli_entropy_nats(p):
    # Your code here
    pass`,
    solution: `import math
def bernoulli_entropy_nats(p):
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * math.log(p) - (1.0 - p) * math.log(1.0 - p)`,
    testCases: [
      { input: [0.5], expected: 0.6931471805599453 },
      { input: [0.0], expected: 0.0 },
      { input: [1.0], expected: 0.0 },
      { input: [0.25], expected: 0.5623351446188083 },
    ],
    hint: "The same function in bits is just this value divided by ln(2).",
  },
  {
    id: "info-027",
    title: "Huffman Code Lengths",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Build a Huffman code for the given symbols and frequencies and return a dictionary mapping each symbol to its codeword length. Break ties by preferring the node created earlier, using a min-heap keyed by frequency and then creation order. A lone symbol is assigned length 1.",
    starterCode: `import heapq
def huffman_code_lengths(symbols, freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_code_lengths(symbols, freqs):
    if len(symbols) == 1:
        return {symbols[0]: 1}
    heap = [[freqs[i], i, {symbols[i]: 0}] for i in range(len(symbols))]
    heapq.heapify(heap)
    counter = len(symbols)
    while len(heap) > 1:
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        merged = {}
        for sym in a[2]:
            merged[sym] = a[2][sym] + 1
        for sym in b[2]:
            merged[sym] = b[2][sym] + 1
        counter += 1
        heapq.heappush(heap, [a[0] + b[0], counter, merged])
    return heap[0][2]`,
    testCases: [
      {
        input: [["a", "b"], [1, 1]],
        expected: { a: 1, b: 1 },
      },
      {
        input: [["a", "b", "c", "d"], [1, 2, 3, 4]],
        expected: { d: 1, c: 2, a: 3, b: 3 },
      },
      {
        input: [["x", "y", "z"], [1, 1, 1]],
        expected: { z: 1, x: 2, y: 2 },
      },
      {
        input: [["solo"], [7]],
        expected: { solo: 1 },
      },
      {
        input: [["a", "b", "c", "d", "e"], [5, 4, 3, 2, 1]],
        expected: { c: 2, e: 3, d: 3, b: 2, a: 2 },
      },
    ],
    hint: "Repeatedly merge the two lightest nodes; each merge adds one bit to every leaf beneath it.",
  },
  {
    id: "info-028",
    title: "Huffman Average Code Length",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Build a Huffman code from a list of frequencies and return its expected codeword length in bits:\n\nL = sum(p_i * l_i),  p_i = f_i / sum(f)\n\nUse a min-heap keyed by frequency and then creation order for deterministic ties. A single symbol has length 1.",
    starterCode: `import heapq
def huffman_average_length(freqs):
    # Your code here
    pass`,
    solution: `import heapq
def huffman_average_length(freqs):
    n = len(freqs)
    if n == 1:
        return 1.0
    heap = [[float(freqs[i]), i, {i: 0}] for i in range(n)]
    heapq.heapify(heap)
    counter = n
    while len(heap) > 1:
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        merged = {}
        for sym in a[2]:
            merged[sym] = a[2][sym] + 1
        for sym in b[2]:
            merged[sym] = b[2][sym] + 1
        counter += 1
        heapq.heappush(heap, [a[0] + b[0], counter, merged])
    lengths = heap[0][2]
    total = sum(freqs)
    avg = 0.0
    for i in range(n):
        avg += freqs[i] / total * lengths[i]
    return avg`,
    testCases: [
      { input: [[1, 1]], expected: 1.0 },
      { input: [[1, 2, 3, 4]], expected: 1.9 },
      { input: [[1, 1, 1]], expected: 1.6666666666666665 },
      { input: [[5]], expected: 1.0 },
      { input: [[5, 4, 3, 2, 1]], expected: 2.2 },
    ],
    hint: "The Huffman average length is always within 1 bit of the entropy.",
  },
  {
    id: "info-029",
    title: "Shannon Code Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Shannon code length ceil(-log2(p)) for every probability in probs. A probability of 1.0 yields length 0.",
    starterCode: `import math
def shannon_code_lengths(probs):
    # Your code here
    pass`,
    solution: `import math
def shannon_code_lengths(probs):
    return [math.ceil(-math.log2(p)) for p in probs]`,
    testCases: [
      { input: [[0.5, 0.25, 0.25]], expected: [1, 2, 2] },
      { input: [[1.0]], expected: [0] },
      { input: [[0.1, 0.2, 0.3, 0.4]], expected: [4, 3, 2, 2] },
      {
        input: [[0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125]],
        expected: [3, 3, 3, 3, 3, 3, 3, 3],
      },
    ],
    hint: "Shannon lengths satisfy the Kraft inequality, which is exactly what makes them decodable.",
  },
  {
    id: "info-030",
    title: "Expected Code Length",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given a probability distribution probs and matching integer codeword lengths, return the expected code length:\n\nL = sum(p_i * l_i)\n\nThe two lists have the same length.",
    starterCode: `def expected_code_length(probs, lengths):
    # Your code here
    pass`,
    solution: `def expected_code_length(probs, lengths):
    total = 0.0
    for p, l in zip(probs, lengths):
        total += p * l
    return total`,
    testCases: [
      { input: [[0.5, 0.25, 0.25], [1, 2, 2]], expected: 1.5 },
      { input: [[0.5, 0.5], [1, 1]], expected: 1.0 },
      { input: [[0.25, 0.25, 0.25, 0.25], [2, 2, 2, 2]], expected: 2.0 },
      { input: [[0.1, 0.9], [4, 1]], expected: 1.3 },
    ],
    hint: "Weight each codeword length by the probability of the symbol it encodes.",
  },
  {
    id: "info-031",
    title: "Kraft Inequality Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True if the given codeword lengths satisfy the Kraft inequality:\n\nsum(2^(-l_i)) <= 1\n\nUse a tolerance of 1e-9 when comparing, so exactly complete codes still pass.",
    starterCode: `def kraft_inequality_holds(lengths):
    # Your code here
    pass`,
    solution: `def kraft_inequality_holds(lengths):
    total = 0.0
    for l in lengths:
        total += 2.0 ** (-l)
    return total <= 1.0 + 1e-9`,
    testCases: [
      { input: [[1, 2, 3, 3]], expected: true },
      { input: [[1, 1]], expected: true },
      { input: [[1, 2]], expected: true },
      { input: [[1, 1, 1]], expected: false },
    ],
    hint: "A complete binary prefix code has sum exactly 1.",
  },
  {
    id: "info-032",
    title: "Rate of a Markov Source",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the entropy rate in bits of a Markov source with row-stochastic transition matrix transitions. Find the stationary distribution with 1000 steps of lazy power iteration (mixing in 0.5 of the identity each step to handle periodic chains), then return\n\nR = sum(pi_i * H(row_i))\n\nwhere H is the entropy in bits of row i.",
    starterCode: `import math
def source_rate(transitions):
    # Your code here
    pass`,
    solution: `import math
def source_rate(transitions):
    n = len(transitions)
    pi = [1.0 / n] * n
    for _ in range(1000):
        new = [0.0] * n
        for i in range(n):
            for j in range(n):
                lazy = 0.5 * transitions[i][j] + (0.5 if i == j else 0.0)
                new[j] += pi[i] * lazy
        pi = new
    rate = 0.0
    for i in range(n):
        if pi[i] > 0:
            h = 0.0
            for p in transitions[i]:
                if p > 0:
                    h -= p * math.log2(p)
            rate += pi[i] * h
    return rate`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: 1.0 },
      { input: [[[0.9, 0.1], [0.2, 0.8]]], expected: 0.5533064273553054 },
      { input: [[[0.0, 1.0], [1.0, 0.0]]], expected: 0.0 },
      {
        input: [[[0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]]],
        expected: 0.9219280948873623,
      },
    ],
    hint: "Lazy mixing keeps the stationary distribution unchanged while removing periodic oscillation.",
  },
  {
    id: "info-033",
    title: "Binary Symmetric Channel Capacity",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the capacity in bits of a binary symmetric channel with crossover probability p:\n\nC = 1 - H(p)\n\nwhere H is the binary entropy function in bits.",
    starterCode: `import math
def bsc_capacity(p):
    # Your code here
    pass`,
    solution: `import math
def bsc_capacity(p):
    return 1.0 - binary_entropy(p)

def binary_entropy(p):
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * math.log2(p) - (1.0 - p) * math.log2(1.0 - p)`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.5], expected: 0.0 },
      { input: [0.1], expected: 0.5310044064107188 },
      { input: [0.25], expected: 0.18872187554086717 },
    ],
    hint: "At p = 0.5 the output is independent of the input, so no information gets through.",
  },
  {
    id: "info-034",
    title: "BSC Mutual Information",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the mutual information in bits for a binary symmetric channel when the input is 1 with probability q and the crossover probability is p. With P(Y = 1) = q * (1 - p) + (1 - q) * p,\n\nI = H(P(Y = 1)) - H(p)\n\nwhere H is the binary entropy function in bits.",
    starterCode: `import math
def bsc_mutual_information(q, p):
    # Your code here
    pass`,
    solution: `import math
def bsc_mutual_information(q, p):
    py1 = q * (1.0 - p) + (1.0 - q) * p
    return binary_entropy(py1) - binary_entropy(p)

def binary_entropy(p):
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * math.log2(p) - (1.0 - p) * math.log2(1.0 - p)`,
    testCases: [
      { input: [0.5, 0.5], expected: 0.0 },
      { input: [0.5, 0.0], expected: 1.0 },
      { input: [0.5, 0.1], expected: 0.5310044064107188 },
      { input: [0.3, 0.2], expected: 0.2361139273389372 },
    ],
    hint: "I(X; Y) = H(Y) - H(Y|X) and H(Y|X) is just the crossover entropy.",
  },
  {
    id: "info-035",
    title: "Binary Erasure Channel Capacity",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Compute the capacity in bits of a binary erasure channel with erasure probability pe:\n\nC = 1 - pe\n\nThe receiver knows when a symbol was erased.",
    starterCode: `def bec_capacity(pe):
    # Your code here
    pass`,
    solution: `def bec_capacity(pe):
    return 1.0 - pe`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.5], expected: 0.5 },
      { input: [1.0], expected: 0.0 },
      { input: [0.25], expected: 0.75 },
    ],
    hint: "Only the fraction of symbols that survive the erasure carries information.",
  },
  {
    id: "info-036",
    title: "Channel Capacity via Blahut-Arimoto",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the capacity in bits of a discrete memoryless channel given by a row-stochastic matrix channel[x][y] = P(y | x). Run 500 iterations of the Blahut-Arimoto algorithm from a uniform input distribution:\n\npx_new[x] is proportional to exp(sum_y P(y|x) * ln(P(y|x) / q(y)))\n\nwhere q(y) = sum_x px[x] * P(y|x). Then return I(X; Y) in bits at the final distribution.",
    starterCode: `import math
def channel_capacity(channel):
    # Your code here
    pass`,
    solution: `import math
def channel_capacity(channel):
    n = len(channel)
    m = len(channel[0])
    px = [1.0 / n] * n
    for _ in range(500):
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
        z = sum(weights)
        px = [w / z for w in weights]
    qy = [0.0] * m
    for x in range(n):
        for y in range(m):
            qy[y] += px[x] * channel[x][y]
    cap = 0.0
    for x in range(n):
        for y in range(m):
            if channel[x][y] > 0 and px[x] > 0:
                cap += px[x] * channel[x][y] * math.log2(channel[x][y] / qy[y])
    return cap`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: 1.0 },
      { input: [[[0.9, 0.1], [0.1, 0.9]]], expected: 0.5310044064107189 },
      { input: [[[0.75, 0.25, 0.0], [0.0, 0.25, 0.75]]], expected: 0.75 },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
    ],
    hint: "Subtract the max before exponentiating so the update is numerically stable.",
  },
  {
    id: "info-037",
    title: "Data Processing Inequality Gap",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Check the data processing inequality for the Markov chain X -> Y -> Z. Given the joint pxy[x][y] and the channel channel[y][z] = P(z | y), compute I(X; Y) - I(X; Z) in bits, where Z is obtained by passing Y through the channel. The gap is always >= 0.",
    starterCode: `import math
def data_processing_gap(pxy, channel):
    # Your code here
    pass`,
    solution: `import math
def data_processing_gap(pxy, channel):
    n = len(pxy)
    m = len(pxy[0])
    px = [sum(row) for row in pxy]
    py = [0.0] * m
    for x in range(n):
        for y in range(m):
            py[y] += pxy[x][y]
    ixy = 0.0
    for x in range(n):
        for y in range(m):
            p = pxy[x][y]
            if p > 0:
                ixy += p * math.log2(p / (px[x] * py[y]))
    k = len(channel[0])
    pxz = [[0.0] * k for _ in range(n)]
    for x in range(n):
        for z in range(k):
            s = 0.0
            for y in range(m):
                s += pxy[x][y] * channel[y][z]
            pxz[x][z] = s
    pz = [0.0] * k
    for x in range(n):
        for z in range(k):
            pz[z] += pxz[x][z]
    ixz = 0.0
    for x in range(n):
        for z in range(k):
            p = pxz[x][z]
            if p > 0:
                ixz += p * math.log2(p / (px[x] * pz[z]))
    return ixy - ixz`,
    testCases: [
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]]], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[0.5, 0.5], [0.5, 0.5]]], expected: 1.0 },
      { input: [[[0.25, 0.25], [0.25, 0.25]], [[1.0, 0.0], [0.0, 1.0]]], expected: 0.0 },
      {
        input: [[[0.4, 0.1], [0.1, 0.4]], [[0.9, 0.1], [0.1, 0.9]]],
        expected: 0.10481827760525544,
      },
    ],
    hint: "Post-processing Y into Z can never create information about X.",
  },
  {
    id: "info-038",
    title: "Fano's Inequality Lower Bound",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the weak Fano lower bound on the error probability for estimating X from Y:\n\nP_e >= (H(X|Y) - 1) / log2(|X|)\n\nClamp the result at 0 and assume the alphabet size is at least 2.",
    starterCode: `import math
def fano_lower_bound(h_given, n_classes):
    # Your code here
    pass`,
    solution: `import math
def fano_lower_bound(h_given, n_classes):
    if n_classes <= 1:
        return 0.0
    bound = (h_given - 1.0) / math.log2(n_classes)
    return max(0.0, bound)`,
    testCases: [
      { input: [1.0, 2], expected: 0.0 },
      { input: [2.0, 4], expected: 0.5 },
      { input: [1.5, 2], expected: 0.5 },
      { input: [3.0, 8], expected: 0.6666666666666666 },
    ],
    hint: "Subtracting 1 bit accounts for the binary uncertainty of whether an error occurred.",
  },
  {
    id: "info-039",
    title: "Mutual Information of Independent Variables",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Build the joint distribution p(x, y) = px[x] * py[y] of two independent variables and return their mutual information in bits. The answer should be 0; the point is to confirm it numerically for the product distribution.",
    starterCode: `import math
def mutual_information_independent(px, py):
    # Your code here
    pass`,
    solution: `import math
def mutual_information_independent(px, py):
    joint = [[a * b for b in py] for a in px]
    return mutual_information(joint)

def marginal_y(joint):
    cols = len(joint[0]) if joint else 0
    p_y = [0.0] * cols
    for row in joint:
        for j, p in enumerate(row):
            p_y[j] += p
    return p_y

def mutual_information(joint):
    p_x = [sum(row) for row in joint]
    p_y = marginal_y(joint)
    mi = 0.0
    for i, row in enumerate(joint):
        for j, p in enumerate(row):
            if p > 0:
                mi += p * math.log2(p / (p_x[i] * p_y[j]))
    return mi`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.25, 0.75], [0.1, 0.9]], expected: 0.0 },
      { input: [[0.2, 0.3, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[1.0], [0.4, 0.6]], expected: 0.0 },
    ],
    hint: "Independence means p(x, y) = p(x) * p(y), so every log-ratio is exactly zero.",
  },
  {
    id: "info-040",
    title: "Conditional Mutual Information",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the conditional mutual information I(X; Y | Z) in bits from a 3D joint distribution joint[x][y][z]:\n\nI = sum p(x, y, z) * log2(p(x, y, z) * p(z) / (p(x, z) * p(y, z)))\n\nSkip zero-probability terms.",
    starterCode: `import math
def conditional_mutual_information(joint):
    # Your code here
    pass`,
    solution: `import math
def conditional_mutual_information(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    pxz = [[0.0] * nz for _ in range(nx)]
    pyz = [[0.0] * nz for _ in range(ny)]
    pz = [0.0] * nz
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                pxz[x][z] += p
                pyz[y][z] += p
                pz[z] += p
    cmi = 0.0
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                if p > 0:
                    cmi += p * math.log2(p * pz[z] / (pxz[x][z] * pyz[y][z]))
    return cmi`,
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
        expected: 1.0,
      },
      {
        input: [[[[0.2, 0.1], [0.05, 0.05]], [[0.05, 0.05], [0.1, 0.2]]]],
        expected: 0.12709440467994398,
      },
    ],
    hint: "Marginalize to p(x, z), p(y, z), and p(z) before forming the log-ratio.",
  },
  {
    id: "info-041",
    title: "Interaction Information",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the interaction information in bits from a 3D joint distribution joint[x][y][z]:\n\nII = I(X; Y) - I(X; Y | Z)\n\nUse the marginal p(x, y) for the first term. The result can be negative.",
    starterCode: `import math
def interaction_information(joint):
    # Your code here
    pass`,
    solution: `import math
def interaction_information(joint):
    nx = len(joint)
    ny = len(joint[0])
    pxy = [[0.0] * ny for _ in range(nx)]
    for x in range(nx):
        for y in range(ny):
            s = 0.0
            for p in joint[x][y]:
                s += p
            pxy[x][y] = s
    px = [sum(row) for row in pxy]
    py = [0.0] * ny
    for x in range(nx):
        for y in range(ny):
            py[y] += pxy[x][y]
    ixy = 0.0
    for x in range(nx):
        for y in range(ny):
            p = pxy[x][y]
            if p > 0:
                ixy += p * math.log2(p / (px[x] * py[y]))
    return ixy - conditional_mutual_information(joint)

def conditional_mutual_information(joint):
    nx = len(joint)
    ny = len(joint[0])
    nz = len(joint[0][0])
    pxz = [[0.0] * nz for _ in range(nx)]
    pyz = [[0.0] * nz for _ in range(ny)]
    pz = [0.0] * nz
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                pxz[x][z] += p
                pyz[y][z] += p
                pz[z] += p
    cmi = 0.0
    for x in range(nx):
        for y in range(ny):
            for z in range(nz):
                p = joint[x][y][z]
                if p > 0:
                    cmi += p * math.log2(p * pz[z] / (pxz[x][z] * pyz[y][z]))
    return cmi`,
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
        expected: 0.0,
      },
      {
        input: [[[[0.2, 0.1], [0.05, 0.05]], [[0.05, 0.05], [0.1, 0.2]]]],
        expected: 0.2814255716626396,
      },
    ],
    hint: "Interaction information is symmetric in X, Y, and Z even though this formula does not look symmetric.",
  },
  {
    id: "info-042",
    title: "Entropy Rate of a Markov Chain",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Compute the entropy rate in bits of a Markov chain given its row-stochastic transition matrix and stationary distribution:\n\nR = sum_i pi_i * H(row_i)\n\nwhere H(row_i) is the Shannon entropy of row i in bits. Rows with pi_i = 0 contribute nothing.",
    starterCode: `import math
def entropy_rate(transitions, stationary):
    # Your code here
    pass`,
    solution: `import math
def entropy_rate(transitions, stationary):
    rate = 0.0
    for i, pi_i in enumerate(stationary):
        if pi_i > 0:
            h = 0.0
            for p in transitions[i]:
                if p > 0:
                    h -= p * math.log2(p)
            rate += pi_i * h
    return rate`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]], [0.5, 0.5]], expected: 1.0 },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [0.5, 0.5]], expected: 0.0 },
      {
        input: [[[0.9, 0.1], [0.2, 0.8]], [0.6666666666666666, 0.3333333333333333]],
        expected: 0.5533064273553082,
      },
      {
        input: [
          [[0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]],
          [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
        ],
        expected: 0.9219280948873623,
      },
    ],
    hint: "Weight each row's entropy by how often the chain visits that state.",
  },
  {
    id: "info-043",
    title: "KL of Markov Stationary to Uniform",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Find the stationary distribution of a Markov chain with row-stochastic transition matrix transitions using 1000 steps of lazy power iteration (mixing in 0.5 of the identity each step), then return the KL divergence in bits from the stationary distribution to the uniform distribution.",
    starterCode: `import math
def kl_stationary_uniform(transitions):
    # Your code here
    pass`,
    solution: `import math
def kl_stationary_uniform(transitions):
    n = len(transitions)
    pi = [1.0 / n] * n
    for _ in range(1000):
        new = [0.0] * n
        for i in range(n):
            for j in range(n):
                lazy = 0.5 * transitions[i][j] + (0.5 if i == j else 0.0)
                new[j] += pi[i] * lazy
        pi = new
    kl = 0.0
    for p in pi:
        if p > 0:
            kl += p * math.log2(p * n)
    return kl`,
    testCases: [
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[[0.9, 0.1], [0.2, 0.8]]], expected: 0.08170416594550198 },
      { input: [[[0.0, 1.0], [1.0, 0.0]]], expected: 0.0 },
      {
        input: [[[0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.2, 0.2, 0.6]]],
        expected: 0.06303440583380093,
      },
    ],
    hint: "Doubly stochastic chains are already uniform, so their KL term is zero.",
  },
  {
    id: "info-044",
    title: "Cross-Entropy of a Language Model",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Given the log2-probabilities the model assigned to each observed token, return the average negative log2-probability (cross-entropy in bits):\n\nH = -mean(log2_probs)\n\nAssume the list is non-empty and every value is <= 0.",
    starterCode: `def lm_cross_entropy(log2_probs):
    # Your code here
    pass`,
    solution: `def lm_cross_entropy(log2_probs):
    return -sum(log2_probs) / len(log2_probs)`,
    testCases: [
      { input: [[-1.0, -1.0, -1.0]], expected: 1.0 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[0.0, -2.0]], expected: 1.0 },
      { input: [[-0.5, -1.5, -2.0]], expected: 1.3333333333333333 },
    ],
    hint: "Perplexity is 2 raised to this cross-entropy.",
  },
  {
    id: "info-045",
    title: "Lempel-Ziv 78 Phrase Count",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Parse a string with the LZ78 algorithm and return the number of phrases. Starting at position i, extend the current phrase until it is not already in the phrase dictionary, add that new phrase, and continue right after it. If the remaining suffix is already in the dictionary, count it as one final phrase. Return 0 for the empty string.",
    starterCode: `def lz78_phrase_count(s):
    # Your code here
    pass`,
    solution: `def lz78_phrase_count(s):
    phrases = set()
    count = 0
    i = 0
    n = len(s)
    while i < n:
        j = i + 1
        while j <= n and s[i:j] in phrases:
            j += 1
        if j > n:
            phrases.add(s[i:n])
        else:
            phrases.add(s[i:j])
        count += 1
        i = j
    return count`,
    testCases: [
      { input: ["aaaa"], expected: 3 },
      { input: ["abracadabra"], expected: 7 },
      { input: ["abcabcabc"], expected: 6 },
      { input: ["abcdef"], expected: 6 },
      { input: [""], expected: 0 },
    ],
    hint: "Each phrase is the shortest prefix of the remaining string that has not been seen before.",
  },
];
