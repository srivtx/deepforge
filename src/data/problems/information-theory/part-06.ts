import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "info-226",
    title: "VC Dimension Lookup",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the VC dimension of a named hypothesis class, where d is the ambient dimension for classes that depend on it. Use these rules: interval -> 2, rectangle -> 4, halfspace -> d + 1, monotone_conjunction -> d, sinusoid -> -1 (infinite), and 0 for anything else.",
    starterCode: `def vc_dimension(name, d):
    # Your code here
    pass`,
    solution: `def vc_dimension(name, d):
    if name == "interval":
        return 2
    if name == "rectangle":
        return 4
    if name == "halfspace":
        return d + 1
    if name == "monotone_conjunction":
        return d
    if name == "sinusoid":
        return -1
    return 0`,
    testCases: [
      { input: ["interval", 1], expected: 2 },
      { input: ["rectangle", 2], expected: 4 },
      { input: ["halfspace", 3], expected: 4 },
      { input: ["sinusoid", 1], expected: -1 },
      { input: ["monotone_conjunction", 5], expected: 5 },
    ],
    hint: "A class with infinite VC dimension cannot be PAC learned without restrictions.",
  },
  {
    id: "info-227",
    title: "Growth Function of Intervals",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the growth function of intervals on the real line for n points in general position:\n\nm(n) = 1 + n + n * (n - 1) / 2\n\nAn interval realizes every contiguous block of points plus the empty set.",
    starterCode: `def growth_function_intervals(n):
    # Your code here
    pass`,
    solution: `def growth_function_intervals(n):
    return 1 + n + n * (n - 1) // 2`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 2 },
      { input: [2], expected: 4 },
      { input: [3], expected: 7 },
      { input: [5], expected: 16 },
    ],
    hint: "The growth function counts distinct labelings realizable on n points.",
  },
  {
    id: "info-228",
    title: "Sauer-Shelah Bound",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Sauer-Shelah bound on the growth function of a class with VC dimension d:\n\nm(n) <= sum_{i=0}^{d} C(n, i)\n\nWhen d >= n the bound is the full 2^n labelings.",
    starterCode: `import math
def sauer_shelah_bound(n, d):
    # Your code here
    pass`,
    solution: `import math
def sauer_shelah_bound(n, d):
    if d >= n:
        return 2 ** n
    total = 0
    for i in range(d + 1):
        total += math.comb(n, i)
    return total`,
    testCases: [
      { input: [10, 2], expected: 56 },
      { input: [5, 1], expected: 6 },
      { input: [4, 4], expected: 16 },
      { input: [3, 0], expected: 1 },
      { input: [7, 3], expected: 64 },
    ],
    hint: "For fixed d the bound grows only polynomially in n.",
  },
  {
    id: "info-229",
    title: "Rademacher Complexity (Exact)",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Compute the exact empirical Rademacher complexity of a finite hypothesis class. vectors contains each hypothesis evaluated on n points. Average max_h |sum_i sigma_i * h_i| over all 2^n sign vectors sigma, then divide by n. Assume n is small (at most about 12).",
    starterCode: `def rademacher_complexity(vectors):
    # Your code here
    pass`,
    solution: `def rademacher_complexity(vectors):
    n = len(vectors[0])
    total = 0.0
    for mask in range(2 ** n):
        best = 0.0
        for h in vectors:
            s = 0.0
            for i in range(n):
                bit = 1 if (mask >> i) & 1 else -1
                s += bit * h[i]
            if abs(s) > best:
                best = abs(s)
        total += best
    return total / (2 ** n * n)`,
    testCases: [
      { input: [[[1.0, 0.0]]], expected: 0.5 },
      { input: [[[1.0, 1.0]]], expected: 0.5 },
      { input: [[[1.0, 1.0], [1.0, -1.0]]], expected: 1.0 },
      { input: [[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]], expected: 0.3333333333333333 },
    ],
    hint: "Richer hypothesis classes can correlate with more random sign patterns.",
  },
  {
    id: "info-230",
    title: "Generalization Bound",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Rademacher generalization bound:\n\ntrue risk <= empirical risk + rademacher + sqrt(ln(1 / delta) / (2 * m))\n\nReturn just the two-term complexity penalty added to the empirical risk.",
    starterCode: `import math
def generalization_bound(rademacher, m, delta):
    # Your code here
    pass`,
    solution: `import math
def generalization_bound(rademacher, m, delta):
    return rademacher + math.sqrt(math.log(1.0 / delta) / (2.0 * m))`,
    testCases: [
      { input: [0.1, 100, 0.05], expected: 0.22238734153404083 },
      { input: [0.0, 50, 0.1], expected: 0.15174271293851463 },
      { input: [0.2, 10, 0.01], expected: 0.6798525912188081 },
      { input: [0.05, 1000, 0.2], expected: 0.07836756873997225 },
    ],
    hint: "More samples shrink the confidence term as 1 / sqrt(m).",
  },
  {
    id: "info-231",
    title: "PAC Sample Complexity",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the PAC sample complexity for a finite hypothesis class:\n\nm >= ceil((ln|H| + ln(1 / delta)) / (2 * epsilon^2))\n\nThis is the number of samples needed to learn a hypothesis with error at most epsilon and confidence 1 - delta.",
    starterCode: `import math
def pac_sample_complexity(num_hypotheses, epsilon, delta):
    # Your code here
    pass`,
    solution: `import math
def pac_sample_complexity(num_hypotheses, epsilon, delta):
    value = (math.log(num_hypotheses) + math.log(1.0 / delta)) / (2.0 * epsilon * epsilon)
    return math.ceil(value)`,
    testCases: [
      { input: [100, 0.1, 0.05], expected: 381 },
      { input: [2, 0.1, 0.1], expected: 150 },
      { input: [1000, 0.05, 0.01], expected: 2303 },
      { input: [10, 0.2, 0.2], expected: 49 },
    ],
    hint: "Halving epsilon quadruples the sample requirement.",
  },
  {
    id: "info-232",
    title: "Uniform Convergence Gap",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the uniform convergence gap bound from a union bound over a finite hypothesis class:\n\ngap = sqrt(ln(2 * |H| / delta) / (2m))\n\nWith probability 1 - delta, every hypothesis has true risk within gap of its empirical risk.",
    starterCode: `import math
def uniform_convergence_gap(num_hypotheses, m, delta):
    # Your code here
    pass`,
    solution: `import math
def uniform_convergence_gap(num_hypotheses, m, delta):
    return math.sqrt(math.log(2.0 * num_hypotheses / delta) / (2.0 * m))`,
    testCases: [
      { input: [10, 100, 0.05], expected: 0.17308183826022852 },
      { input: [2, 50, 0.1], expected: 0.19206455826398416 },
      { input: [1, 10, 0.5], expected: 0.26327688477341593 },
      { input: [100, 1000, 0.01], expected: 0.07036862778446133 },
    ],
    hint: "The gap scales logarithmically in the number of hypotheses.",
  },
  {
    id: "info-233",
    title: "Bias-Variance Decomposition",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the expected squared error at a point from its information decomposition:\n\nE[(y - f_hat)^2] = bias^2 + variance + noise\n\nwhere noise is the irreducible error of the data-generating process.",
    starterCode: `def bias_variance_decomposition(bias, variance, noise):
    # Your code here
    pass`,
    solution: `def bias_variance_decomposition(bias, variance, noise):
    return bias * bias + variance + noise`,
    testCases: [
      { input: [1.0, 1.0, 1.0], expected: 3.0 },
      { input: [0.0, 0.0, 0.0], expected: 0.0 },
      { input: [0.5, 0.25, 0.25], expected: 0.75 },
      { input: [2.0, 3.0, 0.0], expected: 7.0 },
    ],
    hint: "Only the bias and variance terms are under the modeler's control.",
  },
  {
    id: "info-234",
    title: "AIC from Residuals",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Akaike information criterion computed from the residual sum of squares for a Gaussian model:\n\nAIC = n * ln(RSS / n) + 2k\n\nusing the natural logarithm, with n samples and k parameters (including the variance).",
    starterCode: `import math
def aic_from_rss(rss, n, k):
    # Your code here
    pass`,
    solution: `import math
def aic_from_rss(rss, n, k):
    return n * math.log(rss / n) + 2 * k`,
    testCases: [
      { input: [10.0, 100, 2], expected: -226.25850929940455 },
      { input: [100.0, 100, 2], expected: 4.0 },
      { input: [1.0, 10, 1], expected: -21.025850929940454 },
      { input: [400.0, 100, 5], expected: 148.62943611198907 },
    ],
    hint: "The penalty 2k grows linearly with the number of parameters.",
  },
  {
    id: "info-235",
    title: "BIC Prior Term",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the parameter-complexity term of the Bayesian information criterion:\n\npenalty = k * ln(n)\n\nwhere k is the number of parameters and n the number of samples. This term approximates the volume of the parameter prior.",
    starterCode: `import math
def bic_prior_term(k, n):
    # Your code here
    pass`,
    solution: `import math
def bic_prior_term(k, n):
    return k * math.log(n)`,
    testCases: [
      { input: [1, 8], expected: 2.0794415416798357 },
      { input: [2, 16], expected: 5.545177444479562 },
      { input: [3, 100], expected: 13.815510557964275 },
      { input: [0, 10], expected: 0.0 },
    ],
    hint: "Unlike AIC, the BIC penalty grows with the sample size.",
  },
  {
    id: "info-236",
    title: "MDL Crude Two-Part",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the crude (Rissanen) two-part minimum description length in bits:\n\nDL = nll_bits + 0.5 * n_params * log2(n_samples)\n\nEach parameter costs half a log2(n) term rather than a full one.",
    starterCode: `import math
def mdl_crude_two_part(nll_bits, n_samples, n_params):
    # Your code here
    pass`,
    solution: `import math
def mdl_crude_two_part(nll_bits, n_samples, n_params):
    return nll_bits + 0.5 * n_params * math.log2(n_samples)`,
    testCases: [
      { input: [10.0, 8, 2], expected: 13.0 },
      { input: [0.0, 1, 1], expected: 0.0 },
      { input: [5.0, 16, 3], expected: 11.0 },
      { input: [8.0, 10, 2], expected: 11.321928094887362 },
    ],
    hint: "The half-log penalty matches the BIC complexity term up to constants.",
  },
  {
    id: "info-237",
    title: "Solomonoff Prior Weight",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Solomonoff universal prior weight of a string with the given description length K:\n\nM(x) = 2^(-K)\n\nShorter programs contribute exponentially more probability mass.",
    starterCode: `def solomonoff_prior_weight(description_length):
    # Your code here
    pass`,
    solution: `def solomonoff_prior_weight(description_length):
    return 2.0 ** (-description_length)`,
    testCases: [
      { input: [0], expected: 1.0 },
      { input: [1], expected: 0.5 },
      { input: [10], expected: 0.0009765625 },
      { input: [3], expected: 0.125 },
    ],
    hint: "Each extra bit halves the prior weight.",
  },
  {
    id: "info-238",
    title: "Entropy of Model Parameters",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Model each parameter's posterior as an independent Gaussian with the given variance and return the total differential entropy in bits:\n\nH = sum_i 0.5 * log2(2 * pi * e * var_i)",
    starterCode: `import math
def entropy_of_model_parameters(variances):
    # Your code here
    pass`,
    solution: `import math
def entropy_of_model_parameters(variances):
    total = 0.0
    for v in variances:
        total += 0.5 * math.log2(2.0 * math.pi * math.e * v)
    return total`,
    testCases: [
      { input: [[1.0]], expected: 2.047095585180641 },
      { input: [[1.0, 1.0]], expected: 4.094191170361282 },
      { input: [[4.0, 0.25]], expected: 4.094191170361282 },
      { input: [[0.05854983152431917]], expected: 0.0 },
    ],
    hint: "Uncertainty in the parameters is uncertainty about the model itself.",
  },
  {
    id: "info-239",
    title: "Deterministic Information Bottleneck",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Evaluate the deterministic information bottleneck objective for a joint pxy and a hard assignment of each x to a cluster t (assignment[x]). Return\n\nI(X; T) - beta * I(T; Y)\n\nin bits, where I(X; T) is the entropy of the cluster marginal because T is a deterministic function of X.",
    starterCode: `import math
def deterministic_information_bottleneck(pxy, assignment, beta):
    # Your code here
    pass`,
    solution: `import math
def deterministic_information_bottleneck(pxy, assignment, beta):
    nx = len(pxy)
    ny = len(pxy[0])
    nt = max(assignment) + 1
    pt = [0.0] * nt
    px = [0.0] * nx
    for x in range(nx):
        for y in range(ny):
            px[x] += pxy[x][y]
    for x in range(nx):
        pt[assignment[x]] += px[x]
    h_t = entropy_bits(pt)
    pty = [[0.0] * ny for _ in range(nt)]
    for x in range(nx):
        t = assignment[x]
        for y in range(ny):
            pty[t][y] += pxy[x][y]
    py = [0.0] * ny
    for t in range(nt):
        for y in range(ny):
            py[y] += pty[t][y]
    i_ty = 0.0
    for t in range(nt):
        for y in range(ny):
            p = pty[t][y]
            if p > 0:
                i_ty += p * math.log2(p / (pt[t] * py[y]))
    return h_t - beta * i_ty

def entropy_bits(probs):
    total = 0.0
    for p in probs:
        if p > 0:
            total -= p * math.log2(p)
    return total`,
    testCases: [
      { input: [[[0.5, 0.0], [0.0, 0.5]], [0, 1], 1.0], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [0, 0], 1.0], expected: 0.0 },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [0, 1], 2.0], expected: -1.0 },
      { input: [[[0.4, 0.1], [0.1, 0.4]], [0, 1], 1.0], expected: 0.7219280948873623 },
    ],
    hint: "Collapsing the classes reduces I(X; T) but also destroys predictive information.",
  },
  {
    id: "info-240",
    title: "Information Plane Point",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the information plane coordinates [H(T), I(T; Y)] in bits for a representation T defined by the encoder pt_given_x[x][t] on the joint pxy. H(T) is the entropy of the marginal over t and I(T; Y) is computed from the coarsened joint p(t, y).",
    starterCode: `import math
def information_plane_point(pxy, pt_given_x):
    # Your code here
    pass`,
    solution: `import math
def information_plane_point(pxy, pt_given_x):
    nx = len(pxy)
    ny = len(pxy[0])
    nt = len(pt_given_x[0])
    px = [0.0] * nx
    py = [0.0] * ny
    for x in range(nx):
        for y in range(ny):
            px[x] += pxy[x][y]
            py[y] += pxy[x][y]
    p_t = [0.0] * nt
    pty = [[0.0] * ny for _ in range(nt)]
    for x in range(nx):
        for t in range(nt):
            p_t[t] += px[x] * pt_given_x[x][t]
            for y in range(ny):
                pty[t][y] += pxy[x][y] * pt_given_x[x][t]
    h_t = 0.0
    for p in p_t:
        if p > 0:
            h_t -= p * math.log2(p)
    i_ty = 0.0
    for t in range(nt):
        for y in range(ny):
            p = pty[t][y]
            if p > 0:
                i_ty += p * math.log2(p / (p_t[t] * py[y]))
    return [h_t, i_ty]`,
    testCases: [
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[1.0, 0.0], [0.0, 1.0]]], expected: [1.0, 1.0] },
      { input: [[[0.5, 0.0], [0.0, 0.5]], [[0.5, 0.5], [0.5, 0.5]]], expected: [1.0, 0.0] },
      {
        input: [[[0.4, 0.1], [0.1, 0.4]], [[0.9, 0.1], [0.1, 0.9]]],
        expected: [1.0, 0.1732536275073823],
      },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [[0.0, 1.0], [1.0, 0.0]]], expected: [0.0, 0.0] },
    ],
    hint: "The information plane tracks how much a layer remembers and how much it predicts.",
  },
  {
    id: "info-241",
    title: "InfoNCE Mutual Information Bound",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the InfoNCE contrastive loss in nats for one positive pair and the given negative similarities:\n\nloss = -ln(exp(pos) / (exp(pos) + sum_i exp(neg_i)))",
    starterCode: `import math
def infonce_loss(pos_sim, neg_sims):
    # Your code here
    pass`,
    solution: `import math
def infonce_loss(pos_sim, neg_sims):
    denom = math.exp(pos_sim)
    for s in neg_sims:
        denom += math.exp(s)
    return -math.log(math.exp(pos_sim) / denom)`,
    testCases: [
      { input: [1.0, [0.0]], expected: 0.3132616875182228 },
      { input: [0.0, [0.0, 0.0]], expected: 1.0986122886681098 },
      { input: [2.0, [0.0]], expected: 0.12692801104297252 },
      { input: [1.0, [1.0, 1.0]], expected: 1.0986122886681098 },
    ],
    hint: "InfoNCE is a lower bound on the mutual information between the paired views.",
  },
  {
    id: "info-242",
    title: "Contrastive Information Gap",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the contrastive information gap in bits: the average negative similarity minus the positive similarity, converted from nats to bits by dividing by ln(2).",
    starterCode: `import math
def contrastive_information_gap(pos_sim, neg_sims):
    # Your code here
    pass`,
    solution: `import math
def contrastive_information_gap(pos_sim, neg_sims):
    total = 0.0
    for s in neg_sims:
        total += s
    return (total / len(neg_sims) - pos_sim) / math.log(2.0)`,
    testCases: [
      { input: [1.0, [0.0, 0.0]], expected: -1.4426950408889634 },
      { input: [0.5, [1.0, 2.0]], expected: 1.4426950408889634 },
      { input: [0.0, [0.0, 0.0]], expected: 0.0 },
      { input: [2.0, [1.0]], expected: -1.4426950408889634 },
    ],
    hint: "A large gap means the positive pair is far more similar than unrelated pairs.",
  },
  {
    id: "info-243",
    title: "Augmentation Invariance Objective",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the contrastive objective that trades predictive information against augmentation invariance:\n\nobjective = mi_label - lam * mi_aug\n\nwhere mi_label is the mutual information with the label and mi_aug the information shared between two augmented views.",
    starterCode: `def augmentation_objective(mi_label, mi_aug, lam):
    # Your code here
    pass`,
    solution: `def augmentation_objective(mi_label, mi_aug, lam):
    return mi_label - lam * mi_aug`,
    testCases: [
      { input: [2.0, 1.0, 0.5], expected: 1.5 },
      { input: [1.0, 1.0, 1.0], expected: 0.0 },
      { input: [3.0, 0.0, 10.0], expected: 3.0 },
      { input: [2.0, 2.0, 0.25], expected: 1.5 },
    ],
    hint: "Pushing invariance too far can discard label-relevant information.",
  },
  {
    id: "info-244",
    title: "Total Correlation of Gaussian Pair",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the total correlation in bits of a bivariate Gaussian with correlation coefficient rho:\n\nTC = -0.5 * log2(1 - rho^2)\n\nThe total correlation is the KL divergence from the joint to the product of its marginals.",
    starterCode: `import math
def total_correlation_gaussian(rho):
    # Your code here
    pass`,
    solution: `import math
def total_correlation_gaussian(rho):
    return -0.5 * math.log2(1.0 - rho * rho)`,
    testCases: [
      { input: [0.0], expected: 0.0 },
      { input: [0.5], expected: 0.2075187496394219 },
      { input: [0.9], expected: 1.1979643381655698 },
      { input: [0.8], expected: 0.7369655941662064 },
    ],
    hint: "Uncorrelated Gaussian variables carry no total correlation.",
  },
  {
    id: "info-245",
    title: "Mutual Information Gap",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the mutual information gap (MIG) score for one factor:\n\nMIG = (largest MI - second largest MI) / H(v)\n\nwhere the MI values are the estimated mutual information between the factor and each latent dimension. When only one value is given the second largest is 0.",
    starterCode: `def mutual_information_gap(mi_values, entropy_v):
    # Your code here
    pass`,
    solution: `def mutual_information_gap(mi_values, entropy_v):
    ordered = sorted(mi_values, reverse=True)
    if len(ordered) < 2:
        second = 0.0
    else:
        second = ordered[1]
    return (ordered[0] - second) / entropy_v`,
    testCases: [
      { input: [[0.5, 0.2], 1.0], expected: 0.3 },
      { input: [[0.3, 0.3], 1.0], expected: 0.0 },
      { input: [[2.0, 1.0, 0.5], 2.0], expected: 0.5 },
      { input: [[0.1], 1.0], expected: 0.1 },
    ],
    hint: "A high MIG means the factor is captured by only one latent dimension.",
  },
  {
    id: "info-246",
    title: "DCI Disentanglement",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the DCI disentanglement score of an importance matrix. Rows are ground-truth factors and columns are learned generators. For each factor, normalize its row into a distribution over generators, take the Shannon entropy in bits, then return\n\n1 - mean(entropy) / log2(num_generators)\n\nA score of 1 means every factor is controlled by a single generator.",
    starterCode: `import math
def dci_disentanglement(importance):
    # Your code here
    pass`,
    solution: `import math
def dci_disentanglement(importance):
    n_factors = len(importance)
    n_gen = len(importance[0])
    total_h = 0.0
    for row in importance:
        s = sum(row)
        h = 0.0
        for v in row:
            if v > 0:
                p = v / s
                h -= p * math.log2(p)
        total_h += h
    return 1.0 - (total_h / n_factors) / math.log2(n_gen)`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: 1.0 },
      { input: [[[1.0, 1.0], [1.0, 1.0]]], expected: 0.0 },
      {
        input: [[[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]],
        expected: 1.0,
      },
      {
        input: [[[1.0, 0.0, 0.0], [0.0, 2.0, 0.0], [1.0, 1.0, 0.0]]],
        expected: 0.7896900821428475,
      },
    ],
    hint: "Entangled factors spread their importance across several generators.",
  },
  {
    id: "info-247",
    title: "Effective Information",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the effective information in bits of a channel channel[x][y] under a maximum-entropy (uniform) input distribution. Compute the output marginal p(y) and average the KL divergence of each row from that marginal:\n\nEI = (1 / n) * sum_x KL(P(Y | x) || p(Y))",
    starterCode: `import math
def effective_information(channel):
    # Your code here
    pass`,
    solution: `import math
def effective_information(channel):
    n = len(channel)
    m = len(channel[0])
    py = [0.0] * m
    for x in range(n):
        for y in range(m):
            py[y] += channel[x][y] / n
    ei = 0.0
    for x in range(n):
        for y in range(m):
            p = channel[x][y]
            if p > 0:
                ei += (1.0 / n) * p * math.log2(p / py[y])
    return ei`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: 1.0 },
      { input: [[[0.9, 0.1], [0.1, 0.9]]], expected: 0.5310044064107189 },
      { input: [[[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[[0.75, 0.25, 0.0], [0.0, 0.25, 0.75]]], expected: 0.75 },
    ],
    hint: "Effective information is the mutual information the mechanism generates from noise.",
  },
  {
    id: "info-248",
    title: "Bernoulli Fisher Information",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Fisher information of n Bernoulli trials with success probability p:\n\nI(p) = n / (p * (1 - p))",
    starterCode: `def bernoulli_fisher_information(p, n):
    # Your code here
    pass`,
    solution: `def bernoulli_fisher_information(p, n):
    return n / (p * (1.0 - p))`,
    testCases: [
      { input: [0.5, 1], expected: 4.0 },
      { input: [0.5, 10], expected: 40.0 },
      { input: [0.25, 1], expected: 5.333333333333333 },
      { input: [0.1, 5], expected: 55.55555555555555 },
    ],
    hint: "Information is smallest when the coin is fair, since p(1-p) is largest there.",
  },
  {
    id: "info-249",
    title: "Natural Gradient Step",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Perform one natural gradient descent step with a diagonal Fisher information matrix:\n\nparams_new[i] = params[i] - eta * gradient[i] / fisher_diag[i]\n\nReturn the updated parameter list.",
    starterCode: `def natural_gradient_step(params, gradient, fisher_diag, eta):
    # Your code here
    pass`,
    solution: `def natural_gradient_step(params, gradient, fisher_diag, eta):
    out = []
    for i in range(len(params)):
        out.append(params[i] - eta * gradient[i] / fisher_diag[i])
    return out`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 2.0], [1.0, 1.0], 0.1], expected: [-0.1, -0.2] },
      { input: [[1.0, -1.0], [0.5, -0.5], [2.0, 2.0], 0.5], expected: [0.875, -0.875] },
      { input: [[0.0], [1.0], [4.0], 1.0], expected: [-0.25] },
      { input: [[2.0, 3.0], [0.0, 0.0], [1.0, 1.0], 0.1], expected: [2.0, 3.0] },
    ],
    hint: "Dividing by the Fisher information rescales steps by parameter uncertainty.",
  },
  {
    id: "info-250",
    title: "KL of Bernoulli Natural Parameters",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the KL divergence in nats between two Bernoulli distributions given their natural parameters eta1 and eta2. Convert each with p = 1 / (1 + exp(-eta)) and evaluate\n\nD = p * ln(p / q) + (1 - p) * ln((1 - p) / (1 - q))",
    starterCode: `import math
def kl_bernoulli_natural(eta1, eta2):
    # Your code here
    pass`,
    solution: `import math
def kl_bernoulli_natural(eta1, eta2):
    p = 1.0 / (1.0 + math.exp(-eta1))
    q = 1.0 / (1.0 + math.exp(-eta2))
    total = 0.0
    if p > 0:
        total += p * math.log(p / q)
    if p < 1:
        total += (1.0 - p) * math.log((1.0 - p) / (1.0 - q))
    return total`,
    testCases: [
      { input: [0.0, 0.0], expected: 0.0 },
      { input: [1.0, 0.0], expected: 0.11094407167172735 },
      { input: [-1.0, 1.0], expected: 0.46211715726000974 },
      { input: [2.0, 0.5], expected: 0.16834459010395766 },
    ],
    hint: "KL divergence in the natural parameterization is a Bregman divergence.",
  },
  {
    id: "info-251",
    title: "Bregman Divergence in Information Geometry",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the Bregman divergence generated by f(x) = x ln(x) applied to two discrete distributions p and q:\n\nD(p, q) = sum_i (p_i * ln(p_i / q_i) - p_i + q_i)\n\nSkip the log term when p_i = 0. Assume q_i > 0 wherever p_i > 0.",
    starterCode: `import math
def bregman_divergence(p, q):
    # Your code here
    pass`,
    solution: `import math
def bregman_divergence(p, q):
    total = 0.0
    for a, b in zip(p, q):
        if a > 0:
            total += a * math.log(a / b)
        total += b - a
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.25, 0.75], [0.5, 0.5]], expected: 0.130812035941137 },
      { input: [[0.5, 0.5], [0.25, 0.75]], expected: 0.14384103622589042 },
    ],
    hint: "The negentropy generator makes the Bregman divergence equal to KL plus a correction.",
  },
  {
    id: "info-252",
    title: "Convex Conjugate of exp",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the convex conjugate of f(x) = exp(x):\n\nf*(y) = sup_x (x * y - exp(x)) = y * ln(y) - y  for y > 0\n\nand 0 at y = 0.",
    starterCode: `import math
def convex_conjugate_exp(y):
    # Your code here
    pass`,
    solution: `import math
def convex_conjugate_exp(y):
    if y <= 0.0:
        return 0.0
    return y * math.log(y) - y`,
    testCases: [
      { input: [1.0], expected: -1.0 },
      { input: [2.0], expected: -0.6137056388801094 },
      { input: [0.5], expected: -0.8465735902799727 },
      { input: [0.0], expected: 0.0 },
    ],
    hint: "The conjugate of the exponential is the negative entropy of a Poisson-like variable.",
  },
  {
    id: "info-253",
    title: "Dual Flatness Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Check whether the Bernoulli family looks dually flat at the given parameters. Mix the natural parameters linearly, eta_mix = (1 - alpha) * eta1 + alpha * eta2, and return True when sigmoid(eta_mix) matches the same linear mixture of the individual means within 1e-9.",
    starterCode: `import math
def dual_flatness_check(eta1, eta2, alpha):
    # Your code here
    pass`,
    solution: `import math
def dual_flatness_check(eta1, eta2, alpha):
    mix = (1.0 - alpha) * eta1 + alpha * eta2
    mean_mix = 1.0 / (1.0 + math.exp(-mix))
    linear = (1.0 - alpha) / (1.0 + math.exp(-eta1)) + alpha / (1.0 + math.exp(-eta2))
    return abs(mean_mix - linear) <= 1e-9`,
    testCases: [
      { input: [0.0, 0.0, 0.5], expected: true },
      { input: [1.0, -1.0, 0.5], expected: true },
      { input: [1.0, 2.0, 0.5], expected: false },
      { input: [2.0, -2.0, 0.25], expected: false },
    ],
    hint: "The sigmoid is nonlinear, so only symmetric parameter pairs stay affine.",
  },
  {
    id: "info-254",
    title: "Bernoulli Entropy from Natural Parameter",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Shannon entropy of a Bernoulli distribution in nats given its natural parameter eta:\n\np = 1 / (1 + exp(-eta))\nH = -p * ln(p) - (1 - p) * ln(1 - p)",
    starterCode: `import math
def bernoulli_entropy_from_eta(eta):
    # Your code here
    pass`,
    solution: `import math
def bernoulli_entropy_from_eta(eta):
    p = 1.0 / (1.0 + math.exp(-eta))
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * math.log(p) - (1.0 - p) * math.log(1.0 - p)`,
    testCases: [
      { input: [0.0], expected: 0.6931471805599453 },
      { input: [1.0], expected: 0.5822031088882179 },
      { input: [-2.0], expected: 0.36533385508720767 },
      { input: [2.0], expected: 0.36533385508720784 },
    ],
    hint: "Entropy is symmetric around eta = 0, where the coin is fair.",
  },
  {
    id: "info-255",
    title: "Exponential Family Softmax",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the exponential-family distribution over the given feature rows:\n\np_i proportional to exp(sum_k etas[k] * features[i][k])\n\nEach feature row is one outcome. Normalize the weights and return them as a list.",
    starterCode: `import math
def exp_family_softmax(etas, features):
    # Your code here
    pass`,
    solution: `import math
def exp_family_softmax(etas, features):
    scores = []
    for f in features:
        s = 0.0
        for k in range(len(etas)):
            s += etas[k] * f[k]
        scores.append(s)
    top = max(scores)
    weights = [math.exp(s - top) for s in scores]
    z = sum(weights)
    return [w / z for w in weights]`,
    testCases: [
      {
        input: [[0.0], [[0], [1], [2]]],
        expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
      },
      {
        input: [[1.0], [[0], [1], [2]]],
        expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218],
      },
      {
        input: [[1.0, -1.0], [[0, 0], [1, 0], [0, 1], [1, 1]]],
        expected: [0.19661193324148185, 0.5344466453885229, 0.07232948812851327, 0.19661193324148185],
      },
      {
        input: [[2.0], [[0], [1], [2]]],
        expected: [0.015876239976466765, 0.11731042782619838, 0.8668133321973349],
      },
    ],
    hint: "Subtracting the maximum score before exponentiating keeps the computation stable.",
  },
  {
    id: "info-256",
    title: "Partition Function Gradient",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the gradient of the log-partition function with respect to the natural parameter, which equals the expected sufficient statistic:\n\nE[T] = sum_i t_i * exp(eta * t_i) / Z",
    starterCode: `import math
def partition_gradient(eta, t_values):
    # Your code here
    pass`,
    solution: `import math
def partition_gradient(eta, t_values):
    weights = []
    z = 0.0
    for t in t_values:
        w = math.exp(eta * t)
        weights.append(w)
        z += w
    total = 0.0
    for i in range(len(t_values)):
        total += t_values[i] * weights[i] / z
    return total`,
    testCases: [
      { input: [0.0, [1, 2, 3]], expected: 2.0 },
      { input: [1.0, [0, 1]], expected: 0.7310585786300049 },
      { input: [2.0, [-1, 0, 1]], expected: 0.8509370922208681 },
      { input: [-0.5, [0, 2]], expected: 0.5378828427399902 },
    ],
    hint: "The gradient of A(eta) = ln Z(eta) is the mean of the sufficient statistic.",
  },
  {
    id: "info-257",
    title: "Log-Partition Convexity Check",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Check numerically that the log-partition function A(eta) = ln(sum_t exp(eta * t)) is convex. Return True when the etas are equally spaced within 1e-9 and every second difference A[i+1] - 2 A[i] + A[i-1] is at least -1e-12. Otherwise return False.",
    starterCode: `import math
def log_partition_convexity_check(etas, t_values):
    # Your code here
    pass`,
    solution: `import math
def log_partition_convexity_check(etas, t_values):
    n = len(etas)
    if n >= 3:
        gap = etas[1] - etas[0]
        for i in range(2, n):
            if abs((etas[i] - etas[i - 1]) - gap) > 1e-9:
                return False
    vals = []
    for e in etas:
        z = 0.0
        for t in t_values:
            z += math.exp(e * t)
        vals.append(math.log(z))
    for i in range(1, len(vals) - 1):
        if vals[i + 1] - 2.0 * vals[i] + vals[i - 1] < -1e-12:
            return False
    return True`,
    testCases: [
      { input: [[-1.0, 0.0, 1.0], [0, 1]], expected: true },
      { input: [[0.0, 1.0, 2.0], [0]], expected: true },
      { input: [[0.0, 1.0, 2.0], [1]], expected: true },
      { input: [[0.0, 1.0, 3.0], [0, 1]], expected: false },
    ],
    hint: "Convexity of A(eta) is equivalent to the variance of the statistic being nonnegative.",
  },
  {
    id: "info-258",
    title: "Variational Bound Tightness",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the gap between the log evidence and the evidence lower bound:\n\ngap = log_evidence - elbo\n\nThe gap equals the KL divergence from the variational posterior to the true posterior, so the bound is tight exactly when the gap is zero.",
    starterCode: `def elbo_gap(log_evidence, elbo):
    # Your code here
    pass`,
    solution: `def elbo_gap(log_evidence, elbo):
    return log_evidence - elbo`,
    testCases: [
      { input: [10.0, 9.0], expected: 1.0 },
      { input: [0.0, 0.0], expected: 0.0 },
      { input: [-5.0, -7.0], expected: 2.0 },
      { input: [3.5, 3.5], expected: 0.0 },
    ],
    hint: "The ELBO is always at most the log evidence for any variational family.",
  },
  {
    id: "info-259",
    title: "Posterior Collapse Check",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return True when the KL divergence of a latent variable's variational posterior from its prior falls below the given threshold, which signals posterior collapse: the latent is ignored by the decoder.",
    starterCode: `def posterior_collapse_check(kl_value, threshold):
    # Your code here
    pass`,
    solution: `def posterior_collapse_check(kl_value, threshold):
    return kl_value < threshold`,
    testCases: [
      { input: [0.001, 0.01], expected: true },
      { input: [0.1, 0.01], expected: false },
      { input: [0.0, 0.0], expected: false },
      { input: [0.009, 0.01], expected: true },
    ],
    hint: "Collapsed latents carry almost no information about the data.",
  },
  {
    id: "info-260",
    title: "Bits per Dimension",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the bits-per-dimension score of a generative model from its total negative log-likelihood in nats:\n\nBPD = nll_nats / (num_samples * dims * ln(2))",
    starterCode: `import math
def bits_per_dimension(nll_nats, num_samples, dims):
    # Your code here
    pass`,
    solution: `import math
def bits_per_dimension(nll_nats, num_samples, dims):
    return nll_nats / (num_samples * dims * math.log(2.0))`,
    testCases: [
      { input: [1000.0, 10, 100], expected: 1.4426950408889636 },
      { input: [693.1471805599454, 10, 100], expected: 1.0000000000000002 },
      { input: [0.0, 5, 10], expected: 0.0 },
      { input: [100.0, 4, 25], expected: 1.4426950408889634 },
    ],
    hint: "Dividing by ln(2) converts nats into bits.",
  },
  {
    id: "info-261",
    title: "Compression Rate Bound",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Check Shannon's source coding bound: return True when the coder's rate in bits is at least the source entropy in bits (within 1e-9). No lossless coder can beat the entropy on average.",
    starterCode: `def compression_rate_bound(entropy_bits, coder_bits):
    # Your code here
    pass`,
    solution: `def compression_rate_bound(entropy_bits, coder_bits):
    return coder_bits >= entropy_bits - 1e-9`,
    testCases: [
      { input: [2.0, 2.0], expected: true },
      { input: [2.0, 3.0], expected: true },
      { input: [2.0, 1.5], expected: false },
      { input: [0.0, 0.0], expected: true },
    ],
    hint: "Entropy is the fundamental limit of lossless compression.",
  },
  {
    id: "info-262",
    title: "Prequential Code Length",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the prequential (sequential) code length in bits for a sequence of conditional probabilities:\n\nL = sum_i -log2(p_i)\n\nEach p_i is the probability the model assigned to the i-th outcome given the past.",
    starterCode: `import math
def prequential_code_length(conditional_probs):
    # Your code here
    pass`,
    solution: `import math
def prequential_code_length(conditional_probs):
    total = 0.0
    for p in conditional_probs:
        total -= math.log2(p)
    return total`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 2.0 },
      { input: [[1.0, 1.0]], expected: 0.0 },
      { input: [[0.5, 0.25]], expected: 3.0 },
      { input: [[0.1]], expected: 3.321928094887362 },
    ],
    hint: "Summing predictive log losses yields a valid code length for the whole sequence.",
  },
  {
    id: "info-263",
    title: "Hedge Regret Bound",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the Hedge (multiplicative weights) regret bound for T rounds and K experts:\n\nR_T <= sqrt(2 * T * ln(K))\n\nReturn the value in nats.",
    starterCode: `import math
def hedge_regret_bound(T, num_experts):
    # Your code here
    pass`,
    solution: `import math
def hedge_regret_bound(T, num_experts):
    return math.sqrt(2.0 * T * math.log(num_experts))`,
    testCases: [
      { input: [100, 2], expected: 11.774100225154747 },
      { input: [1000, 10], expected: 67.86140424415112 },
      { input: [100, 1], expected: 0.0 },
      { input: [10, 2], expected: 3.723297411059034 },
    ],
    hint: "With a single expert there is nothing to regret.",
  },
  {
    id: "info-264",
    title: "Bayes Factor",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Return the log Bayes factor comparing two models:\n\nlog BF = log_evidence1 - log_evidence0\n\nPositive values favor model 1. Both inputs are log evidences from the same data.",
    starterCode: `def bayes_factor(log_evidence1, log_evidence0):
    # Your code here
    pass`,
    solution: `def bayes_factor(log_evidence1, log_evidence0):
    return log_evidence1 - log_evidence0`,
    testCases: [
      { input: [0.0, 0.0], expected: 0.0 },
      { input: [5.0, 3.0], expected: 2.0 },
      { input: [-10.0, -12.0], expected: 2.0 },
      { input: [1.0, 2.0], expected: -1.0 },
    ],
    hint: "Working in logs turns the evidence ratio into a difference.",
  },
  {
    id: "info-265",
    title: "Best Information Criterion",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Given a dictionary mapping model names to information criterion values, return the name of the model with the smallest value. Break ties alphabetically by choosing the first name in sorted order.",
    starterCode: `def best_information_criterion(criteria):
    # Your code here
    pass`,
    solution: `def best_information_criterion(criteria):
    best = None
    for name in sorted(criteria):
        if best is None or criteria[name] < criteria[best]:
            best = name
    return best`,
    testCases: [
      { input: [{ A: 100.0, B: 98.0 }], expected: "B" },
      { input: [{ X: 1.0, Y: 1.0 }], expected: "X" },
      { input: [{ P: 10.0, Q: 20.0, R: 5.0 }], expected: "R" },
      { input: [{ M: 3.0 }], expected: "M" },
    ],
    hint: "Lower AIC or BIC means a better trade-off between fit and complexity.",
  },
  {
    id: "info-266",
    title: "Exponential Family Entropy",
    category: "Information Theory",
    difficulty: "Hard",
    description:
      "Return the entropy in nats of the exponential family p(t) proportional to exp(eta * t):\n\nH = ln(Z) - eta * E[T]\n\nwhere Z is the partition function and E[T] the mean of the sufficient statistic under p.",
    starterCode: `import math
def exponential_family_entropy(eta, t_values):
    # Your code here
    pass`,
    solution: `import math
def exponential_family_entropy(eta, t_values):
    z = 0.0
    for t in t_values:
        z += math.exp(eta * t)
    mean = 0.0
    for t in t_values:
        mean += t * math.exp(eta * t) / z
    return math.log(z) - eta * mean`,
    testCases: [
      { input: [0.0, [1, 2, 3]], expected: 1.0986122886681098 },
      { input: [1.0, [0, 1]], expected: 0.5822031088882179 },
      { input: [2.0, [-1, 0, 1]], expected: 0.4410574440581634 },
      { input: [-0.5, [0, 2]], expected: 0.582203108888218 },
    ],
    hint: "This is the Legendre transform relationship H = A - eta * A'(eta).",
  },
  {
    id: "info-267",
    title: "Hedge Update Weights",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Perform one multiplicative-weights (Hedge) update and return the new normalized expert weights:\n\nw_new[i] proportional to w[i] * exp(-eta * loss[i])",
    starterCode: `import math
def hedge_update_weights(weights, losses, eta):
    # Your code here
    pass`,
    solution: `import math
def hedge_update_weights(weights, losses, eta):
    raw = []
    for i in range(len(weights)):
        raw.append(weights[i] * math.exp(-eta * losses[i]))
    z = sum(raw)
    return [w / z for w in raw]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, 0.0], 0.5], expected: [0.37754066879814546, 0.6224593312018546] },
      { input: [[1.0, 1.0], [0.0, 0.0], 1.0], expected: [0.5, 0.5] },
      { input: [[0.5, 0.5], [0.0, 1.0], 2.0], expected: [0.8807970779778823, 0.11920292202211755] },
      { input: [[0.25, 0.75], [1.0, 1.0], 1.0], expected: [0.25, 0.75] },
    ],
    hint: "Experts that suffer larger losses lose weight exponentially fast.",
  },
  {
    id: "info-268",
    title: "Token Perplexity",
    category: "Information Theory",
    difficulty: "Easy",
    description:
      "Convert an average negative log-likelihood per token measured in nats to perplexity:\n\nperplexity = exp(nll_nats_per_token)",
    starterCode: `import math
def token_perplexity(nll_nats_per_token):
    # Your code here
    pass`,
    solution: `import math
def token_perplexity(nll_nats_per_token):
    return math.exp(nll_nats_per_token)`,
    testCases: [
      { input: [0.0], expected: 1.0 },
      { input: [0.6931471805599453], expected: 2.0 },
      { input: [1.6094379124341003], expected: 4.999999999999999 },
      { input: [2.302585092994046], expected: 10.000000000000002 },
    ],
    hint: "Perplexity is the effective number of equally likely next tokens.",
  },
  {
    id: "info-269",
    title: "AIC Weight",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the Akaike weights for a list of AIC values:\n\nw_i = exp(-(AIC_i - min(AIC)) / 2), normalized to sum to 1\n\nSubtracting the minimum before exponentiating keeps the computation stable.",
    starterCode: `import math
def aic_weight(aic_values):
    # Your code here
    pass`,
    solution: `import math
def aic_weight(aic_values):
    m = min(aic_values)
    raw = [math.exp(-(a - m) / 2.0) for a in aic_values]
    z = sum(raw)
    return [w / z for w in raw]`,
    testCases: [
      { input: [[0.0, 0.0]], expected: [0.5, 0.5] },
      { input: [[0.0, 2.0]], expected: [0.7310585786300049, 0.2689414213699951] },
      { input: [[0.0, 4.0]], expected: [0.8807970779778823, 0.11920292202211755] },
      {
        input: [[10.0, 12.0, 14.0]],
        expected: [0.6652409557748218, 0.24472847105479764, 0.09003057317038046],
      },
    ],
    hint: "A difference of 2 AIC units gives the better model about 73 percent of the weight.",
  },
  {
    id: "info-270",
    title: "Growth Function of Halfspaces (2D)",
    category: "Information Theory",
    difficulty: "Medium",
    description:
      "Return the growth function of oriented halfspaces (lines) in two dimensions for n points in general position:\n\nm(0) = 1,  m(n) = n^2 - n + 2 for n >= 1\n\nThe quadratic growth mirrors the VC dimension of 3.",
    starterCode: `def growth_function_halfspaces_2d(n):
    # Your code here
    pass`,
    solution: `def growth_function_halfspaces_2d(n):
    if n == 0:
        return 1
    return n * n - n + 2`,
    testCases: [
      { input: [0], expected: 1 },
      { input: [1], expected: 2 },
      { input: [2], expected: 4 },
      { input: [3], expected: 8 },
      { input: [10], expected: 92 },
    ],
    hint: "At n = 3 all eight dichotomies are realizable, but not at n = 4.",
  },
];
