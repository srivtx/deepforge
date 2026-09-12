import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-276",
    title: "Log-Odds Bayesian Update",
    category: "Probability",
    difficulty: "Easy",
    description: "In log-odds form, Bayes' rule becomes additive: log posterior odds = log prior odds + sum of the log likelihood ratios. Given the log prior odds and a list of log likelihood ratios, return the log posterior odds. An empty list leaves the prior odds unchanged.",
    starterCode: `def log_odds_bayesian_update(log_prior_odds, log_likelihood_ratios):
    # Your code here
    pass`,
    solution: `def log_odds_bayesian_update(log_prior_odds, log_likelihood_ratios):
    total = log_prior_odds
    for lr in log_likelihood_ratios:
        total += lr
    return total`,
    testCases: [
      { input: [0.0, [1.0]], expected: 1.0 },
      { input: [0.0, []], expected: 0.0 },
      { input: [-2.0, [0.5, 0.5]], expected: -1.0 },
      { input: [1.5, [-0.5, 2.0, -1.0]], expected: 2.0 },
      { input: [-1.0, [0.25, -0.75]], expected: -1.5 },
    ],
    hint: "Multiplying odds by likelihood ratios becomes adding their logarithms.",
  },
  {
    id: "pr-277",
    title: "Sequential Bayesian Update from Likelihoods",
    category: "Probability",
    difficulty: "Medium",
    description: "Given prior probabilities over hypotheses and a sequence of observation likelihood vectors, apply Bayes' rule once per observation. Each row likelihood_vectors[t] gives the probability of observation t under every hypothesis, and the posterior after each step becomes the prior for the next. Return the normalized final posterior, or a list of zeros when it has no mass; rows whose length does not match are skipped.",
    starterCode: `def sequential_bayesian_update(priors, likelihood_vectors):
    # Your code here
    pass`,
    solution: `def sequential_bayesian_update(priors, likelihood_vectors):
    if len(priors) == 0:
        return []
    current = list(priors)
    for lv in likelihood_vectors:
        if len(lv) != len(current):
            continue
        current = [c * l for c, l in zip(current, lv)]
        total = sum(current)
        if total > 0:
            current = [c / total for c in current]
    return current`,
    testCases: [
      { input: [[0.5, 0.5], [[0.9, 0.3], [0.8, 0.4]]], expected: [0.8571428571428572, 0.14285714285714285] },
      { input: [[0.2, 0.8], []], expected: [0.2, 0.8] },
      { input: [[0.5, 0.5], [[1.0, 0.0]]], expected: [1.0, 0.0] },
      { input: [[0.3, 0.7], [[0.0, 0.0], [1.0, 1.0]]], expected: [0.0, 0.0] },
      { input: [[0.25, 0.25, 0.5], [[2.0, 1.0, 1.0]]], expected: [0.4, 0.2, 0.4] },
    ],
    hint: "Multiply the current posterior by each likelihood row, then renormalize.",
  },
  {
    id: "pr-278",
    title: "Normal-Normal Posterior Mean",
    category: "Probability",
    difficulty: "Easy",
    description: "A normal prior with mean prior_mean and variance prior_var is updated with n observations whose sample mean is data_mean and whose known variance is data_var. The posterior mean is the precision-weighted average (prior_mean / prior_var + n * data_mean / data_var) divided by (1 / prior_var + n / data_var). Return prior_mean when n <= 0 or either variance is nonpositive.",
    starterCode: `def normal_normal_posterior_mean(prior_mean, prior_var, data_mean, data_var, n):
    # Your code here
    pass`,
    solution: `def normal_normal_posterior_mean(prior_mean, prior_var, data_mean, data_var, n):
    if prior_var <= 0 or data_var <= 0 or n <= 0:
        return prior_mean
    post_prec = 1.0 / prior_var + n / data_var
    return (prior_mean / prior_var + n * data_mean / data_var) / post_prec`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 1.0, 1], expected: 0.5 },
      { input: [0.0, 1.0, 0.0, 1.0, 10], expected: 0.0 },
      { input: [2.0, 4.0, 6.0, 1.0, 2], expected: 5.555555555555555 },
      { input: [5.0, 2.0, 10.0, 4.0, 0], expected: 5.0 },
      { input: [1.0, 0.5, 0.0, 2.0, 3], expected: 0.5714285714285714 },
    ],
    hint: "Precisions add, and the posterior mean is the precision-weighted average of the prior mean and data mean.",
  },
  {
    id: "pr-279",
    title: "Normal-Normal Posterior Variance",
    category: "Probability",
    difficulty: "Easy",
    description: "Under the conjugate normal model, posterior precision is the sum of the prior precision and n data precisions, so the posterior variance is 1 / (1 / prior_var + n / data_var). Return prior_var when n <= 0 or data_var is nonpositive, and 0.0 when prior_var is nonpositive.",
    starterCode: `def normal_normal_posterior_variance(prior_var, data_var, n):
    # Your code here
    pass`,
    solution: `def normal_normal_posterior_variance(prior_var, data_var, n):
    if prior_var <= 0:
        return 0.0
    if data_var <= 0 or n <= 0:
        return prior_var
    return 1.0 / (1.0 / prior_var + n / data_var)`,
    testCases: [
      { input: [1.0, 1.0, 1], expected: 0.5 },
      { input: [4.0, 2.0, 2], expected: 0.8 },
      { input: [2.0, 1.0, 0], expected: 2.0 },
      { input: [0.5, 1.0, 1], expected: 0.3333333333333333 },
      { input: [0.0, 1.0, 1], expected: 0.0 },
    ],
    hint: "More observations and tighter data precision shrink the posterior variance.",
  },
  {
    id: "pr-280",
    title: "Gamma-Poisson Posterior Parameters",
    category: "Probability",
    difficulty: "Easy",
    description: "A Gamma(alpha, beta) prior on a Poisson rate is updated with a list of observed counts. The conjugate posterior is Gamma(alpha + sum(counts), beta + len(counts)). Return the posterior parameters as [shape, rate], or [0.0, 0.0] when alpha or beta is nonpositive or any count is negative.",
    starterCode: `def gamma_poisson_posterior_parameters(alpha, beta, counts):
    # Your code here
    pass`,
    solution: `def gamma_poisson_posterior_parameters(alpha, beta, counts):
    if alpha <= 0 or beta <= 0:
        return [0.0, 0.0]
    total = 0
    for c in counts:
        if c < 0:
            return [0.0, 0.0]
        total += c
    return [alpha + total, beta + len(counts)]`,
    testCases: [
      { input: [2.0, 1.0, [3, 4, 5]], expected: [14.0, 4.0] },
      { input: [0.5, 0.5, []], expected: [0.5, 0.5] },
      { input: [1.0, 2.0, [0, 0]], expected: [1.0, 4.0] },
      { input: [3.0, 1.0, [2]], expected: [5.0, 2.0] },
      { input: [-1.0, 1.0, [1]], expected: [0.0, 0.0] },
    ],
    hint: "Counts add to the shape and each observation adds one to the rate.",
  },
  {
    id: "pr-281",
    title: "Dirichlet-Multinomial Posterior",
    category: "Probability",
    difficulty: "Easy",
    description: "A Dirichlet(alphas) prior over category probabilities is updated with observed category counts. The conjugate posterior keeps the same form with parameters alphas[i] + counts[i]. Return the updated concentration vector, or an empty list when the lengths differ, any alpha is nonpositive, or any count is negative.",
    starterCode: `def dirichlet_multinomial_posterior(alphas, counts):
    # Your code here
    pass`,
    solution: `def dirichlet_multinomial_posterior(alphas, counts):
    if len(alphas) == 0 or len(alphas) != len(counts):
        return []
    for a in alphas:
        if a <= 0:
            return []
    for c in counts:
        if c < 0:
            return []
    return [a + c for a, c in zip(alphas, counts)]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [4, 5, 6]], expected: [5.0, 7.0, 9.0] },
      { input: [[0.5, 0.5], [3, 1]], expected: [3.5, 1.5] },
      { input: [[1.0, 1.0], [0, 0]], expected: [1.0, 1.0] },
      { input: [[1.0, 2.0], [3]], expected: [] },
      { input: [[0.0, 1.0], [1, 1]], expected: [] },
    ],
    hint: "The posterior concentration is the prior concentration plus the observed counts.",
  },
  {
    id: "pr-282",
    title: "Beta-Binomial Posterior Predictive Variance",
    category: "Probability",
    difficulty: "Medium",
    description: "For a beta-binomial with n future trials after integrating over a Beta(alpha, beta) success probability, the predictive variance is n * p * (1 - p) * (alpha + beta + n) / (alpha + beta + 1), where p = alpha / (alpha + beta). Return 0.0 when alpha or beta is nonpositive or n is negative.",
    starterCode: `def beta_binomial_predictive_variance(alpha, beta, n):
    # Your code here
    pass`,
    solution: `def beta_binomial_predictive_variance(alpha, beta, n):
    if alpha <= 0 or beta <= 0 or n < 0:
        return 0.0
    p = alpha / (alpha + beta)
    return n * p * (1.0 - p) * (alpha + beta + n) / (alpha + beta + 1.0)`,
    testCases: [
      { input: [1.0, 1.0, 10], expected: 10.0 },
      { input: [2.0, 3.0, 5], expected: 2.0 },
      { input: [2.0, 2.0, 1], expected: 0.25 },
      { input: [3.0, 1.0, 0], expected: 0.0 },
      { input: [1.0, 1.0, 2], expected: 0.6666666666666666 },
    ],
    hint: "The predictive variance overdispenses the binomial variance by the factor (alpha + beta + n) / (alpha + beta + 1).",
  },
  {
    id: "pr-283",
    title: "Bayes Factor from Marginal Likelihoods",
    category: "Probability",
    difficulty: "Easy",
    description: "The Bayes factor comparing two models is the ratio of their marginal likelihoods, BF = P(data | model 1) / P(data | model 2). Return that ratio, or 0.0 when evidence_h1 is negative or evidence_h2 is nonpositive.",
    starterCode: `def bayes_factor_from_evidence(evidence_h1, evidence_h2):
    # Your code here
    pass`,
    solution: `def bayes_factor_from_evidence(evidence_h1, evidence_h2):
    if evidence_h1 < 0 or evidence_h2 <= 0:
        return 0.0
    return evidence_h1 / evidence_h2`,
    testCases: [
      { input: [0.02, 0.01], expected: 2.0 },
      { input: [0.5, 0.5], expected: 1.0 },
      { input: [0.0, 0.5], expected: 0.0 },
      { input: [0.3, 0.1], expected: 2.9999999999999996 },
      { input: [1.0, 0.0], expected: 0.0 },
    ],
    hint: "A Bayes factor above 1 favors the first model.",
  },
  {
    id: "pr-284",
    title: "Variable Elimination Factor Size",
    category: "Probability",
    difficulty: "Medium",
    description: "Each factor in a graphical model covers a scope of variables given by a list of variable indices. Eliminating var multiplies the factors that contain it and sums it out, producing a new factor whose scope is the union of their scopes minus var. Return the number of entries in that new factor, the product of the cardinalities of its scope variables, or 0 when var appears in no scope or is out of range.",
    starterCode: `def variable_elimination_factor_size(scopes, cardinalities, var):
    # Your code here
    pass`,
    solution: `def variable_elimination_factor_size(scopes, cardinalities, var):
    if var < 0 or var >= len(cardinalities):
        return 0
    new_scope = set()
    found = False
    for scope in scopes:
        if var in scope:
            found = True
            for v in scope:
                if v != var:
                    new_scope.add(v)
    if not found:
        return 0
    size = 1
    for v in new_scope:
        if v < 0 or v >= len(cardinalities):
            return 0
        size *= cardinalities[v]
    return size`,
    testCases: [
      { input: [[[0, 1], [1, 2]], [2, 3, 4], 1], expected: 8 },
      { input: [[[0, 1], [1, 2]], [2, 3, 4], 0], expected: 3 },
      { input: [[[0, 1], [1, 2]], [2, 3, 4], 2], expected: 3 },
      { input: [[[0, 1], [1, 2]], [2, 3, 4], 3], expected: 0 },
      { input: [[[0, 1], [1, 2]], [2, 2, 2], 1], expected: 4 },
    ],
    hint: "The intermediate factor costs the product of the cardinalities of the remaining variables.",
  },
  {
    id: "pr-285",
    title: "Belief Propagation Factor Message",
    category: "Probability",
    difficulty: "Medium",
    description: "In the sum-product algorithm, the message from a factor to one of its variables sums the factor table over the other variables. Treat factor as a matrix whose rows index the summed-out variable and whose columns index the receiving variable, and return the column sums as the message vector. Return an empty list when the factor is empty or its rows have inconsistent widths.",
    starterCode: `def belief_propagation_factor_message(factor):
    # Your code here
    pass`,
    solution: `def belief_propagation_factor_message(factor):
    if len(factor) == 0:
        return []
    width = len(factor[0])
    if width == 0:
        return []
    for row in factor:
        if len(row) != width:
            return []
    message = []
    for j in range(width):
        total = 0.0
        for i in range(len(factor)):
            total += factor[i][j]
        message.append(total)
    return message`,
    testCases: [
      { input: [[[0.1, 0.2], [0.3, 0.4]]], expected: [0.4, 0.6000000000000001] },
      { input: [[[1.0, 2.0, 3.0]]], expected: [1.0, 2.0, 3.0] },
      { input: [[[1.0], [2.0]]], expected: [3.0] },
      { input: [[[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]]], expected: [1.5, 1.5] },
      { input: [[[1.0, 2.0], [3.0]]], expected: [] },
    ],
    hint: "Marginalizing a factor over one variable means summing over that axis.",
  },
  {
    id: "pr-286",
    title: "HMM Forward Message",
    category: "Probability",
    difficulty: "Medium",
    description: "Compute the unnormalized forward message of a hidden Markov model. Start with alpha[0][i] = initial[i] * emissions[0][i], then iterate alpha[t][j] = emissions[t][j] times the sum over i of alpha[t-1][i] * transition[i][j]. Return the final alpha vector, or initial itself when there are no emission rows; return an empty list for mismatched shapes.",
    starterCode: `def hmm_forward_message(initial, transition, emissions):
    # Your code here
    pass`,
    solution: `def hmm_forward_message(initial, transition, emissions):
    k = len(initial)
    if k == 0:
        return []
    if len(emissions) == 0:
        return list(initial)
    if len(transition) != k:
        return []
    for row in transition:
        if len(row) != k:
            return []
    for em in emissions:
        if len(em) != k:
            return []
    alpha = [initial[i] * emissions[0][i] for i in range(k)]
    for t in range(1, len(emissions)):
        nxt = []
        for j in range(k):
            s = 0.0
            for i in range(k):
                s += alpha[i] * transition[i][j]
            nxt.append(s * emissions[t][j])
        alpha = nxt
    return alpha`,
    testCases: [
      { input: [[0.6, 0.4], [[0.7, 0.3], [0.4, 0.6]], [[0.5, 0.5]]], expected: [0.3, 0.2] },
      { input: [[0.6, 0.4], [[0.7, 0.3], [0.4, 0.6]], [[0.5, 0.5], [0.9, 0.1]]], expected: [0.26100000000000007, 0.021] },
      { input: [[0.6, 0.4], [[0.7, 0.3], [0.4, 0.6]], []], expected: [0.6, 0.4] },
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [[0.2, 0.8], [0.5, 0.5], [1.0, 1.0]]], expected: [0.1, 0.0] },
      { input: [[0.5, 0.5], [[0.9, 0.1]], [[0.5, 0.5]]], expected: [] },
    ],
    hint: "Each step propagates the message through the transition matrix, then multiplies by the emission.",
  },
  {
    id: "pr-287",
    title: "Chordal Graph Clique Count",
    category: "Probability",
    difficulty: "Hard",
    description: "For a chordal graph, a perfect elimination order lists vertices so that each vertex's later neighbors form a clique. The maximal cliques are exactly the maximal sets of the form {v} union its later neighbors, so build those candidate sets, keep the ones not contained in another, and return how many remain. The adjacency matrix is a symmetric 0/1 matrix; return 0 for an invalid order or a non-square matrix.",
    starterCode: `def chordal_graph_clique_count(adjacency, order):
    # Your code here
    pass`,
    solution: `def chordal_graph_clique_count(adjacency, order):
    n = len(adjacency)
    if n == 0:
        return 0
    if len(order) != n or sorted(order) != list(range(n)):
        return 0
    for row in adjacency:
        if len(row) != n:
            return 0
    pos = {}
    for i, v in enumerate(order):
        pos[v] = i
    candidates = []
    for v in order:
        later = [u for u in range(n) if adjacency[v][u] == 1 and pos[u] > pos[v]]
        s = frozenset(later + [v])
        if s not in candidates:
            candidates.append(s)
    maximal = []
    for s in candidates:
        if not any(s != t and s.issubset(t) for t in candidates):
            maximal.append(s)
    return len(maximal)`,
    testCases: [
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [0, 1, 2]], expected: 3 },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], [0, 1, 2]], expected: 1 },
      { input: [[[0, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]], [3, 2, 1, 0]], expected: 3 },
      { input: [[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]], [3, 2, 1, 0]], expected: 2 },
      { input: [[[0, 1], [1, 0]], [0, 0]], expected: 0 },
    ],
    hint: "With a perfect elimination order, each maximal clique appears as a vertex plus its later neighbors, minus the sets contained in bigger ones.",
  },
  {
    id: "pr-288",
    title: "Moralization Edges Added",
    category: "Probability",
    difficulty: "Medium",
    description: "Moralizing a directed acyclic graph connects every pair of parents that share a child unless they are already adjacent, then drops edge directions. Given edges as [parent, child] pairs, return the number of distinct undirected edges that moralization adds. Return 0 for malformed inputs.",
    starterCode: `def moralization_edges_added(edges):
    # Your code here
    pass`,
    solution: `def moralization_edges_added(edges):
    parents = {}
    adjacent = set()
    for e in edges:
        if len(e) != 2:
            return 0
        p, c = e
        parents.setdefault(c, set()).add(p)
        adjacent.add(frozenset((p, c)))
    added = set()
    for c, ps in parents.items():
        ps = list(ps)
        for i in range(len(ps)):
            for j in range(i + 1, len(ps)):
                pair = frozenset((ps[i], ps[j]))
                if pair not in adjacent:
                    added.add(pair)
    return len(added)`,
    testCases: [
      { input: [[[0, 2], [1, 2]]], expected: 1 },
      { input: [[[0, 2], [1, 2], [0, 1]]], expected: 0 },
      { input: [[[0, 2], [1, 2], [3, 2]]], expected: 3 },
      { input: [[[0, 3], [1, 3], [0, 4], [1, 4]]], expected: 1 },
      { input: [[[0, 2, 1]]], expected: 0 },
    ],
    hint: "Count each unmarried parent pair once, even when the parents share several children.",
  },
  {
    id: "pr-289",
    title: "D-Separation Check",
    category: "Probability",
    difficulty: "Hard",
    description: "Check whether nodes x and y are d-separated given the set of observed nodes. Build the ancestral graph of x, y and given, moralize it, remove the observed nodes, and test whether x can still reach y along an undirected path. Return True when they are d-separated and False otherwise, including when a node index is invalid.",
    starterCode: `def d_separation_check(num_nodes, edges, x, y, given):
    # Your code here
    pass`,
    solution: `def d_separation_check(num_nodes, edges, x, y, given):
    if x < 0 or x >= num_nodes or y < 0 or y >= num_nodes:
        return False
    for g in given:
        if g < 0 or g >= num_nodes:
            return False
    parents = [[] for _ in range(num_nodes)]
    for e in edges:
        if len(e) != 2:
            return False
        p, c = e
        if p < 0 or p >= num_nodes or c < 0 or c >= num_nodes:
            return False
        parents[c].append(p)
    anc = set([x, y] + list(given))
    frontier = list(anc)
    while frontier:
        v = frontier.pop()
        for p in parents[v]:
            if p not in anc:
                anc.add(p)
                frontier.append(p)
    adj = {v: set() for v in anc}
    for v in anc:
        for p in parents[v]:
            if p in anc:
                adj[v].add(p)
                adj[p].add(v)
    for v in anc:
        ps = [p for p in parents[v] if p in anc]
        for i in range(len(ps)):
            for j in range(i + 1, len(ps)):
                adj[ps[i]].add(ps[j])
                adj[ps[j]].add(ps[i])
    blocked = set(given)
    if x in blocked or y in blocked:
        return False
    seen = set([x])
    stack = [x]
    while stack:
        v = stack.pop()
        if v == y:
            return False
        for u in adj[v]:
            if u not in blocked and u not in seen:
                seen.add(u)
                stack.append(u)
    return True`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2, []], expected: false },
      { input: [3, [[0, 1], [1, 2]], 0, 2, [1]], expected: true },
      { input: [3, [[0, 1], [2, 1]], 0, 2, []], expected: true },
      { input: [3, [[0, 1], [2, 1]], 0, 2, [1]], expected: false },
      { input: [4, [[0, 1], [2, 1], [1, 3]], 0, 2, [3]], expected: false },
    ],
    hint: "Moralization plus ancestral graph reduction turns d-separation into ordinary graph reachability.",
  },
  {
    id: "pr-290",
    title: "Markov Blanket Size",
    category: "Probability",
    difficulty: "Medium",
    description: "The Markov blanket of a node in a Bayesian network consists of its parents, its children, and the other parents of its children. Given directed edges as [parent, child] pairs and a node index, return the number of distinct nodes in its Markov blanket. Return 0 for malformed edges.",
    starterCode: `def markov_blanket_size(edges, node):
    # Your code here
    pass`,
    solution: `def markov_blanket_size(edges, node):
    parents = set()
    children = set()
    parent_map = {}
    for e in edges:
        if len(e) != 2:
            return 0
        p, c = e
        if c == node:
            parents.add(p)
        if p == node:
            children.add(c)
        parent_map.setdefault(c, set()).add(p)
    co_parents = set()
    for c in children:
        for p in parent_map.get(c, set()):
            if p != node:
                co_parents.add(p)
    return len(parents | children | co_parents)`,
    testCases: [
      { input: [[[0, 1], [2, 1], [1, 3]], 1], expected: 3 },
      { input: [[[0, 1], [2, 1], [1, 3]], 0], expected: 2 },
      { input: [[[0, 1], [0, 2]], 0], expected: 2 },
      { input: [[[1, 2], [3, 2], [1, 4], [3, 4]], 1], expected: 3 },
      { input: [[], 0], expected: 0 },
    ],
    hint: "Union the parents, the children, and everyone who shares a child with the node.",
  },  {
    id: "pr-291",
    title: "Bernoulli Naive Bayes Log-Posterior",
    category: "Probability",
    difficulty: "Medium",
    description: "For a Bernoulli naive Bayes model, the unnormalized log posterior of a class is log(prior) plus the sum over features of x[i] * log(theta[i]) + (1 - x[i]) * log(1 - theta[i]). Given a binary feature vector, the class prior, and per-feature success probabilities, return that score. Return 0.0 for invalid probabilities or mismatched lengths.",
    starterCode: `import math


def bernoulli_naive_bayes_log_posterior(x, prior, feature_probs):
    # Your code here
    pass`,
    solution: `import math


def bernoulli_naive_bayes_log_posterior(x, prior, feature_probs):
    if prior <= 0 or prior > 1 or len(x) != len(feature_probs):
        return 0.0
    score = math.log(prior)
    for xi, theta in zip(x, feature_probs):
        if theta <= 0 or theta >= 1:
            return 0.0
        if xi == 1:
            score += math.log(theta)
        elif xi == 0:
            score += math.log(1.0 - theta)
        else:
            return 0.0
    return score`,
    testCases: [
      { input: [[1, 0], 0.6, [0.9, 0.3]], expected: -0.9728610833625495 },
      { input: [[0, 0], 0.5, [0.2, 0.4]], expected: -1.4271163556401456 },
      { input: [[1, 1], 0.7, [0.95, 0.8]], expected: -0.6311117896404927 },
      { input: [[1], 1.0, [0.5]], expected: -0.6931471805599453 },
      { input: [[1], 0.0, [0.5]], expected: 0.0 },
    ],
    hint: "Take logarithms of the prior and the per-feature Bernoulli probabilities, then add.",
  },
  {
    id: "pr-292",
    title: "Bernoulli Naive Bayes Decision",
    category: "Probability",
    difficulty: "Easy",
    description: "Score each class with the Bernoulli naive Bayes log-posterior log(prior) plus the sum of feature log-probabilities, and return the index of the highest-scoring class, breaking ties toward the earlier class. priors is per class and feature_probs[c][i] is the probability that feature i equals 1 under class c. Return -1 for invalid input or a nonpositive prior.",
    starterCode: `import math


def bernoulli_naive_bayes_decision(x, priors, feature_probs):
    # Your code here
    pass`,
    solution: `import math


def bernoulli_naive_bayes_decision(x, priors, feature_probs):
    if len(priors) == 0 or len(priors) != len(feature_probs):
        return -1
    best = -1
    best_score = None
    for c in range(len(priors)):
        if priors[c] <= 0 or len(feature_probs[c]) != len(x):
            return -1
        score = math.log(priors[c])
        for xi, theta in zip(x, feature_probs[c]):
            if theta <= 0 or theta >= 1:
                return -1
            if xi == 1:
                score += math.log(theta)
            elif xi == 0:
                score += math.log(1.0 - theta)
            else:
                return -1
        if best_score is None or score > best_score:
            best_score = score
            best = c
    return best`,
    testCases: [
      { input: [[1, 1], [0.5, 0.5], [[0.9, 0.8], [0.4, 0.3]]], expected: 0 },
      { input: [[0, 1], [0.5, 0.5], [[0.9, 0.8], [0.4, 0.3]]], expected: 1 },
      { input: [[0, 0], [0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: 0 },
      { input: [[1], [0.3, 0.7], [[0.9], [0.2]]], expected: 0 },
      { input: [[1], [], []], expected: -1 },
    ],
    hint: "Compute every class score, then take the argmax with the earlier class winning ties.",
  },
  {
    id: "pr-293",
    title: "Gaussian Naive Bayes Log-Likelihood",
    category: "Probability",
    difficulty: "Medium",
    description: "For each class, compute the log-likelihood of a point under independent Gaussians: the sum over features of -0.5 * log(2 * pi * variance) - (x - mean)^2 / (2 * variance). means[c] and variances[c] hold the per-feature parameters of class c. Return the list of per-class log-likelihoods, or an empty list for mismatched shapes or a nonpositive variance.",
    starterCode: `import math


def gaussian_naive_bayes_log_likelihood(x, means, variances):
    # Your code here
    pass`,
    solution: `import math


def gaussian_naive_bayes_log_likelihood(x, means, variances):
    if len(means) == 0 or len(means) != len(variances):
        return []
    out = []
    for c in range(len(means)):
        if len(means[c]) != len(x) or len(variances[c]) != len(x):
            return []
        total = 0.0
        for xi, mu, var in zip(x, means[c], variances[c]):
            if var <= 0:
                return []
            total += -0.5 * math.log(2.0 * math.pi * var) - (xi - mu) ** 2 / (2.0 * var)
        out.append(total)
    return out`,
    testCases: [
      { input: [[0.0, 1.0], [[0.0, 1.0], [1.0, 0.0]], [[1.0, 1.0], [1.0, 1.0]]], expected: [-1.8378770664093453, -2.8378770664093453] },
      { input: [[1.0, 1.0], [[0.0, 0.0], [1.0, 1.0]], [[1.0, 1.0], [1.0, 1.0]]], expected: [-2.8378770664093453, -1.8378770664093453] },
      { input: [[2.0], [[0.0]], [[4.0]]], expected: [-2.112085713764618] },
      { input: [[0.0, 0.0], [[0.0]], [[1.0, 1.0]]], expected: [] },
      { input: [[1.0], [[0.0]], [[0.0]]], expected: [] },
    ],
    hint: "The Gaussian log density is a normalization term minus the squared z-score over two.",
  },
  {
    id: "pr-294",
    title: "Laplace Smoothed Log Probability",
    category: "Probability",
    difficulty: "Easy",
    description: "Add-k smoothing estimates a categorical probability as (count + k) / (total + k * vocab_size). Given the token count, the total token count, the vocabulary size, and the smoothing constant k, return the natural log of that estimate. Return 0.0 when the inputs are invalid.",
    starterCode: `import math


def laplace_smoothed_log_probability(count, total, vocab_size, k):
    # Your code here
    pass`,
    solution: `import math


def laplace_smoothed_log_probability(count, total, vocab_size, k):
    if count < 0 or total < 0 or vocab_size <= 0 or k <= 0 or count > total:
        return 0.0
    return math.log((count + k) / (total + k * vocab_size))`,
    testCases: [
      { input: [3, 10, 4, 1], expected: -1.252762968495368 },
      { input: [0, 10, 5, 1], expected: -2.70805020110221 },
      { input: [10, 10, 2, 1], expected: -0.08701137698962981 },
      { input: [0, 0, 3, 2], expected: -1.0986122886681098 },
      { input: [-1, 10, 4, 1], expected: 0.0 },
    ],
    hint: "Smoothing adds k to every count and k times the vocabulary size to the denominator.",
  },
  {
    id: "pr-295",
    title: "MAP with Beta Prior",
    category: "Probability",
    difficulty: "Easy",
    description: "For a Bernoulli parameter with a Beta(alpha, beta) prior, the maximum a posteriori estimate after successes successes in trials trials is (alpha + successes - 1) / (alpha + beta + trials - 2). Return 0.5 when the denominator is zero and 0.0 for invalid arguments.",
    starterCode: `def beta_map_estimate(alpha, beta, successes, trials):
    # Your code here
    pass`,
    solution: `def beta_map_estimate(alpha, beta, successes, trials):
    if alpha <= 0 or beta <= 0 or successes < 0 or trials < 0 or successes > trials:
        return 0.0
    denom = alpha + beta + trials - 2.0
    if denom <= 0:
        return 0.5
    return (alpha + successes - 1.0) / denom`,
    testCases: [
      { input: [2.0, 3.0, 5, 10], expected: 0.46153846153846156 },
      { input: [1.0, 1.0, 3, 10], expected: 0.3 },
      { input: [1.0, 1.0, 0, 0], expected: 0.5 },
      { input: [3.0, 2.0, 0, 4], expected: 0.2857142857142857 },
      { input: [0.0, 1.0, 1, 1], expected: 0.0 },
    ],
    hint: "The Beta MAP behaves like the MLE after subtracting one pseudo-count from each prior parameter.",
  },
  {
    id: "pr-296",
    title: "Posterior Entropy",
    category: "Probability",
    difficulty: "Medium",
    description: "Given unnormalized log weights for a discrete posterior, normalize them with the log-sum-exp trick and return the Shannon entropy -sum of p * log(p) in nats. Return 0.0 for an empty list.",
    starterCode: `import math


def posterior_entropy(log_weights):
    # Your code here
    pass`,
    solution: `import math


def posterior_entropy(log_weights):
    if len(log_weights) == 0:
        return 0.0
    m = max(log_weights)
    total = 0.0
    for lw in log_weights:
        total += math.exp(lw - m)
    entropy = 0.0
    for lw in log_weights:
        p = math.exp(lw - m) / total
        if p > 0:
            entropy -= p * math.log(p)
    return entropy`,
    testCases: [
      { input: [[0.0, 0.0]], expected: 0.6931471805599453 },
      { input: [[0.0, 1.0986122886681098]], expected: 0.5623351446188083 },
      { input: [[0.0, 0.0, 0.0, 0.0]], expected: 1.3862943611198906 },
      { input: [[-0.10536051565782628, -2.302585092994046]], expected: 0.32508297339144837 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Subtract the maximum log weight before exponentiating to keep the normalization stable.",
  },
  {
    id: "pr-297",
    title: "Mixture Average Log-Likelihood",
    category: "Probability",
    difficulty: "Medium",
    description: "Compute the average log density of a data set under a one-dimensional Gaussian mixture. For each point evaluate the log of the sum over components of weights[k] * N(x; means[k], sigmas[k]^2) stably with log-sum-exp, then average over the points. Return 0.0 when the inputs are empty, mismatched, or any standard deviation is nonpositive.",
    starterCode: `import math


def mixture_average_log_likelihood(weights, means, sigmas, data):
    # Your code here
    pass`,
    solution: `import math


def mixture_average_log_likelihood(weights, means, sigmas, data):
    if len(weights) == 0 or len(weights) != len(means) or len(means) != len(sigmas):
        return 0.0
    if len(data) == 0:
        return 0.0
    for s in sigmas:
        if s <= 0:
            return 0.0
    total = 0.0
    for x in data:
        terms = []
        for w, m, s in zip(weights, means, sigmas):
            if w <= 0:
                continue
            terms.append(
                math.log(w)
                - math.log(s)
                - 0.5 * math.log(2.0 * math.pi)
                - 0.5 * ((x - m) / s) ** 2
            )
        if not terms:
            return 0.0
        mx = max(terms)
        ssum = 0.0
        for t in terms:
            ssum += math.exp(t - mx)
        total += mx + math.log(ssum)
    return total / len(data)`,
    testCases: [
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0], [0.0]], expected: -0.9189385332046728 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0], [-1.0, 0.0, 1.0]], expected: -1.252271866538006 },
      { input: [[0.3, 0.7], [-1.0, 2.0], [1.0, 1.0], [0.0, 1.0]], expected: -1.9440342334791008 },
      { input: [[1.0], [3.0], [2.0], [3.0]], expected: -1.612085713764618 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 0.0], [0.0, 1.0]], expected: 0.0 },
    ],
    hint: "Evaluate every component log density, take a log-sum-exp, then average over the points.",
  },
  {
    id: "pr-298",
    title: "EM Q-Function Value",
    category: "Probability",
    difficulty: "Hard",
    description: "The EM Q-function is the expected complete-data log-likelihood under the current responsibilities: the sum over points n and components k of responsibilities[n][k] * (log(weights[k]) + log N(data[n]; means[k], sigmas[k]^2)). Return that value, or 0.0 when the inputs are empty, mismatched, or a used component has a nonpositive weight or standard deviation.",
    starterCode: `import math


def em_q_function_value(weights, means, sigmas, data, responsibilities):
    # Your code here
    pass`,
    solution: `import math


def em_q_function_value(weights, means, sigmas, data, responsibilities):
    if len(weights) == 0 or len(data) == 0 or len(data) != len(responsibilities):
        return 0.0
    k = len(weights)
    if len(means) != k or len(sigmas) != k:
        return 0.0
    for s in sigmas:
        if s <= 0:
            return 0.0
    total = 0.0
    for n in range(len(data)):
        if len(responsibilities[n]) != k:
            return 0.0
        for c in range(k):
            r = responsibilities[n][c]
            if r == 0:
                continue
            if weights[c] <= 0:
                return 0.0
            total += r * (
                math.log(weights[c])
                - math.log(sigmas[c])
                - 0.5 * math.log(2.0 * math.pi)
                - 0.5 * ((data[n] - means[c]) / sigmas[c]) ** 2
            )
    return total`,
    testCases: [
      { input: [[1.0], [0.0], [1.0], [0.0], [[1.0]]], expected: -0.9189385332046727 },
      { input: [[0.5, 0.5], [0.0, 1.0], [1.0, 1.0], [0.0, 1.0], [[0.8, 0.2], [0.3, 0.7]]], expected: -3.474171427529236 },
      { input: [[0.3, 0.7], [-1.0, 1.0], [1.0, 2.0], [0.0, 2.0], [[0.5, 0.5], [0.25, 0.75]]], expected: -5.584384325277145 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0], [], []], expected: 0.0 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, -1.0], [0.0], [[1.0, 0.0]]], expected: 0.0 },
    ],
    hint: "Weight each component log density by its responsibility, then sum over points and components.",
  },
  {
    id: "pr-299",
    title: "EM M-Step Mean Update",
    category: "Probability",
    difficulty: "Easy",
    description: "In the M-step of EM for a Gaussian mixture, the updated mean of the given component is the responsibility-weighted average of the data: the sum of responsibilities[n][component] * data[n] divided by the sum of those responsibilities. Return 0.0 when the weights sum to zero or the shapes are invalid.",
    starterCode: `def em_m_step_mean(data, responsibilities, component):
    # Your code here
    pass`,
    solution: `def em_m_step_mean(data, responsibilities, component):
    if len(data) == 0 or len(data) != len(responsibilities) or component < 0:
        return 0.0
    num = 0.0
    den = 0.0
    for x, row in zip(data, responsibilities):
        if component >= len(row):
            return 0.0
        num += row[component] * x
        den += row[component]
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], [[0.9, 0.1], [0.8, 0.2], [0.2, 0.8], [0.1, 0.9]], 0], expected: 1.75 },
      { input: [[1.0, 2.0, 3.0, 4.0], [[0.9, 0.1], [0.8, 0.2], [0.2, 0.8], [0.1, 0.9]], 1], expected: 3.25 },
      { input: [[1.0, 2.0], [[1.0], [1.0]], 0], expected: 1.5 },
      { input: [[1.0, 2.0], [[0.0], [0.0]], 0], expected: 0.0 },
      { input: [[], [], 0], expected: 0.0 },
    ],
    hint: "This is a weighted average where the responsibilities are the weights.",
  },
  {
    id: "pr-300",
    title: "EM Mixture Weight Update",
    category: "Probability",
    difficulty: "Easy",
    description: "In the M-step of EM, each mixture weight becomes the average responsibility of its component across the data set: (1 / n) times the sum over points of responsibilities[n][k]. Return the list of updated weights, or an empty list for inconsistent shapes.",
    starterCode: `def em_mixture_weight_update(responsibilities):
    # Your code here
    pass`,
    solution: `def em_mixture_weight_update(responsibilities):
    if len(responsibilities) == 0:
        return []
    k = len(responsibilities[0])
    if k == 0:
        return []
    totals = [0.0] * k
    for row in responsibilities:
        if len(row) != k:
            return []
        for c in range(k):
            totals[c] += row[c]
    n = len(responsibilities)
    return [t / n for t in totals]`,
    testCases: [
      { input: [[[0.9, 0.1], [0.8, 0.2], [0.2, 0.8], [0.1, 0.9]]], expected: [0.5, 0.5] },
      { input: [[[0.6, 0.3, 0.1], [0.2, 0.5, 0.3]]], expected: [0.4, 0.4, 0.2] },
      { input: [[[1.0], [1.0]]], expected: [1.0] },
      { input: [[]], expected: [] },
      { input: [[[1.0, 0.0], [0.5, 0.5]]], expected: [0.75, 0.25] },
    ],
    hint: "Average the responsibility columns over the data points.",
  },
  {
    id: "pr-301",
    title: "ELBO Value",
    category: "Probability",
    difficulty: "Hard",
    description: "For a Gaussian mixture with variational responsibilities r, the evidence lower bound is the sum over points n and components k of r[n][k] * (log(weights[k]) + log N(data[n]; means[k], sigmas[k]^2) - log(r[n][k])). Terms with zero responsibility contribute nothing. Return the ELBO, or 0.0 when the inputs are empty, mismatched, or a used component has a nonpositive weight or standard deviation.",
    starterCode: `import math


def gmm_elbo_value(weights, means, sigmas, data, responsibilities):
    # Your code here
    pass`,
    solution: `import math


def gmm_elbo_value(weights, means, sigmas, data, responsibilities):
    if len(weights) == 0 or len(data) == 0 or len(data) != len(responsibilities):
        return 0.0
    k = len(weights)
    if len(means) != k or len(sigmas) != k:
        return 0.0
    for s in sigmas:
        if s <= 0:
            return 0.0
    total = 0.0
    for n in range(len(data)):
        if len(responsibilities[n]) != k:
            return 0.0
        for c in range(k):
            r = responsibilities[n][c]
            if r <= 0:
                continue
            if weights[c] <= 0:
                return 0.0
            log_p = (
                math.log(weights[c])
                - math.log(sigmas[c])
                - 0.5 * math.log(2.0 * math.pi)
                - 0.5 * ((data[n] - means[c]) / sigmas[c]) ** 2
            )
            total += r * (log_p - math.log(r))
    return total`,
    testCases: [
      { input: [[1.0], [0.0], [1.0], [0.0], [[1.0]]], expected: -0.9189385332046727 },
      { input: [[0.5, 0.5], [0.0, 1.0], [1.0, 1.0], [0.0, 1.0], [[0.8, 0.2], [0.3, 0.7]]], expected: -2.362904701936155 },
      { input: [[0.3, 0.7], [-1.0, 1.0], [1.0, 2.0], [0.0, 2.0], [[0.5, 0.5], [0.25, 0.75]]], expected: -4.328902000098392 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0], [], []], expected: 0.0 },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0], [0.0], [[1.0, 0.0]]], expected: -1.612085713764618 },
    ],
    hint: "The ELBO is the Q-function plus the entropy of the responsibilities.",
  },
  {
    id: "pr-302",
    title: "KL Term in ELBO",
    category: "Probability",
    difficulty: "Medium",
    description: "The KL divergence from a discrete variational distribution q to a prior p is the sum over states of q[i] * log(q[i] / p[i]). Return it in nats, skipping states with q[i] equal to zero. Return 0.0 for mismatched or empty inputs, negative entries, or a state with q[i] positive and p[i] equal to zero.",
    starterCode: `import math


def kl_term_in_elbo(q, p):
    # Your code here
    pass`,
    solution: `import math


def kl_term_in_elbo(q, p):
    if len(q) == 0 or len(q) != len(p):
        return 0.0
    total = 0.0
    for qi, pi in zip(q, p):
        if qi < 0 or pi < 0:
            return 0.0
        if qi == 0:
            continue
        if pi == 0:
            return 0.0
        total += qi * math.log(qi / pi)
    return total`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[0.75, 0.25], [0.5, 0.5]], expected: 0.13081203594113697 },
      { input: [[1.0, 0.0], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.0, 1.0], [0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[0.5, 0.5], [0.0, 1.0]], expected: 0.0 },
    ],
    hint: "The KL is the sum of q log(q / p), with 0 log 0 treated as zero.",
  },
  {
    id: "pr-303",
    title: "Mean-Field Mixture Update",
    category: "Probability",
    difficulty: "Medium",
    description: "A mean-field update for mixture assignments sets each logit to the expected log density E[log N(x | mu, sigma^2)] under q(mu) = N(expected_mean, mean_variance), which equals -log(sigma) - 0.5 * log(2 * pi) - ((x - expected_mean)^2 + mean_variance) / (2 * sigma^2). Return the softmax of these logits. Return an empty list for empty or mismatched inputs or a nonpositive standard deviation.",
    starterCode: `import math


def mean_field_mixture_update(x, expected_means, mean_variances, sigmas):
    # Your code here
    pass`,
    solution: `import math


def mean_field_mixture_update(x, expected_means, mean_variances, sigmas):
    if (
        len(expected_means) == 0
        or len(expected_means) != len(mean_variances)
        or len(expected_means) != len(sigmas)
    ):
        return []
    logits = []
    for m, v, s in zip(expected_means, mean_variances, sigmas):
        if s <= 0 or v < 0:
            return []
        logits.append(
            -math.log(s)
            - 0.5 * math.log(2.0 * math.pi)
            - ((x - m) ** 2 + v) / (2.0 * s * s)
        )
    mx = max(logits)
    exps = [math.exp(t - mx) for t in logits]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [0.0, [0.0, 1.0], [0.0, 0.0], [1.0, 1.0]], expected: [0.6224593312018546, 0.37754066879814546] },
      { input: [0.0, [0.0, 2.0], [0.0, 0.0], [1.0, 1.0]], expected: [0.8807970779778823, 0.11920292202211755] },
      { input: [1.0, [0.0], [1.0], [1.0]], expected: [1.0] },
      { input: [0.0, [0.0, 0.0], [0.0, 1.0], [1.0, 1.0]], expected: [0.6224593312018546, 0.37754066879814546] },
      { input: [0.0, [0.0, 1.0], [-1.0, 0.0], [1.0, 1.0]], expected: [] },
    ],
    hint: "The mean-field coordinate update exponentiates expected log densities and normalizes.",
  },
  {
    id: "pr-304",
    title: "Bridge Sampling Estimator",
    category: "Probability",
    difficulty: "Medium",
    description: "Bridge sampling estimates the ratio Z1 / Z0 of normalizing constants as the mean over samples from p0 of l1 * alpha divided by the mean over samples from p1 of l2 * alpha, where l1 and l2 are the unnormalized densities and alpha is the bridge function. Given the four parallel lists of likelihoods and bridge values for each sample set, return that ratio. Return 0.0 for empty, mismatched, or zero-denominator inputs.",
    starterCode: `def bridge_sampling_estimate(likelihoods0, alphas0, likelihoods1, alphas1):
    # Your code here
    pass`,
    solution: `def bridge_sampling_estimate(likelihoods0, alphas0, likelihoods1, alphas1):
    if len(likelihoods0) == 0 or len(likelihoods0) != len(alphas0):
        return 0.0
    if len(likelihoods1) == 0 or len(likelihoods1) != len(alphas1):
        return 0.0
    num = 0.0
    for l, a in zip(likelihoods0, alphas0):
        num += l * a
    num /= len(likelihoods0)
    den = 0.0
    for l, a in zip(likelihoods1, alphas1):
        den += l * a
    den /= len(likelihoods1)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[0.5, 0.7], [1.0, 1.0], [0.4, 0.6], [1.0, 1.0]], expected: 1.2 },
      { input: [[1.0, 2.0], [0.1, 0.2], [3.0, 1.0], [0.5, 0.5]], expected: 0.25 },
      { input: [[1.0], [2.0], [1.0], [0.25]], expected: 8.0 },
      { input: [[1.0, 1.0], [1.0, 1.0], [0.0, 0.0], [1.0, 1.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [1.0], [1.0], [1.0]], expected: 0.0 },
    ],
    hint: "The bridge identity equates Z1 times an expectation under p1 with Z0 times an expectation under p0.",
  },
  {
    id: "pr-305",
    title: "Gibbs Two-Variable Sweep Mean",
    category: "Probability",
    difficulty: "Medium",
    description: "For a bivariate Gaussian with means mu1 and mu2, standard deviations sigma1 and sigma2, and correlation rho, one Gibbs sweep first updates the first coordinate given x2, so its mean is mu1 + rho * (sigma1 / sigma2) * (x2 - mu2). The second coordinate then updates from that mean, giving mu2 + rho * (sigma2 / sigma1) * (first_mean - mu1) after taking its expectation. Return [first_mean, second_mean], or [0.0, 0.0] for invalid parameters.",
    starterCode: `def gibbs_sweep_mean(mu1, mu2, sigma1, sigma2, rho, x2):
    # Your code here
    pass`,
    solution: `def gibbs_sweep_mean(mu1, mu2, sigma1, sigma2, rho, x2):
    if sigma1 <= 0 or sigma2 <= 0 or rho < -1 or rho > 1:
        return [0.0, 0.0]
    first = mu1 + rho * (sigma1 / sigma2) * (x2 - mu2)
    second = mu2 + rho * (sigma2 / sigma1) * (first - mu1)
    return [first, second]`,
    testCases: [
      { input: [0.0, 0.0, 1.0, 1.0, 0.5, 2.0], expected: [1.0, 0.5] },
      { input: [1.0, 2.0, 2.0, 1.0, 0.5, 3.0], expected: [2.0, 2.25] },
      { input: [0.0, 0.0, 1.0, 2.0, 0.8, 4.0], expected: [1.6, 2.5600000000000005] },
      { input: [3.0, 3.0, 1.0, 1.0, 0.0, 7.0], expected: [3.0, 3.0] },
      { input: [0.0, 0.0, 1.0, 1.0, 1.5, 1.0], expected: [0.0, 0.0] },
    ],
    hint: "Apply the bivariate conditional mean formula twice, with the second step averaging over the first update.",
  },  {
    id: "pr-306",
    title: "Ising Gibbs Conditional Probability",
    category: "Probability",
    difficulty: "Medium",
    description: "For an Ising model with local field field, couplings couplings[j] to neighboring spins, and current neighbor spin values, the Gibbs conditional probability that the node equals 1 is sigmoid(2 * (field + sum of couplings[j] * neighbors[j])). Neighbor spins must be 0 or 1. Return 0.0 for mismatched lengths or an invalid spin.",
    starterCode: `import math


def ising_gibbs_conditional_probability(field, couplings, neighbors):
    # Your code here
    pass`,
    solution: `import math


def ising_gibbs_conditional_probability(field, couplings, neighbors):
    if len(couplings) != len(neighbors):
        return 0.0
    local = field
    for j in range(len(neighbors)):
        if neighbors[j] not in (0, 1):
            return 0.0
        local += couplings[j] * neighbors[j]
    return 1.0 / (1.0 + math.exp(-2.0 * local))`,
    testCases: [
      { input: [0.0, [0.5], [1]], expected: 0.7310585786300049 },
      { input: [-0.2, [0.3, 0.4], [0.5, 0.5]], expected: 0.0 },
      { input: [0.0, [0.5], [0]], expected: 0.5 },
      { input: [1.0, [1.0], [0]], expected: 0.8807970779778823 },
      { input: [0.5, [0.5, 0.5], [1, 0]], expected: 0.8807970779778823 },
    ],
    hint: "Collect the field and the coupling-weighted neighbor spins into a single local field.",
  },
  {
    id: "pr-307",
    title: "Hamiltonian Leapfrog Step",
    category: "Probability",
    difficulty: "Medium",
    description: "One leapfrog step for Hamiltonian Monte Carlo with potential U(q) = 0.5 * stiffness * q^2: update the momentum by a half step p_half = p - 0.5 * step_size * stiffness * q, the position by a full step q_new = q + step_size * p_half / mass, then the momentum by another half step using the new position. Return [q_new, p_new], or [q, p] when mass is nonpositive.",
    starterCode: `def hamiltonian_leapfrog_step(q, p, stiffness, mass, step_size):
    # Your code here
    pass`,
    solution: `def hamiltonian_leapfrog_step(q, p, stiffness, mass, step_size):
    if mass <= 0:
        return [q, p]
    p_half = p - 0.5 * step_size * stiffness * q
    q_new = q + step_size * p_half / mass
    p_new = p_half - 0.5 * step_size * stiffness * q_new
    return [q_new, p_new]`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 1.0, 0.5], expected: [0.5, 0.875] },
      { input: [1.0, 0.0, 2.0, 1.0, 0.5], expected: [0.75, -0.875] },
      { input: [0.0, 0.0, 1.0, 2.0, 1.0], expected: [0.0, 0.0] },
      { input: [2.0, -1.0, 1.0, 1.0, 1.0], expected: [0.0, -2.0] },
      { input: [0.5, 0.5, 4.0, 2.0, 0.25], expected: [0.53125, -0.015625] },
    ],
    hint: "The leapfrog integrator alternates half momentum kicks with full position drifts.",
  },
  {
    id: "pr-308",
    title: "HMC Acceptance Probability",
    category: "Probability",
    difficulty: "Easy",
    description: "Hamiltonian Monte Carlo accepts a proposal with probability min(1, exp(H0 - H1)), where the Hamiltonian is H = U + p^2 / (2 * mass). Given the potential energies and momenta before and after a step, return the acceptance probability. Return 0.0 when mass is nonpositive.",
    starterCode: `import math


def hmc_acceptance_probability(energy0, momentum0, energy1, momentum1, mass):
    # Your code here
    pass`,
    solution: `import math


def hmc_acceptance_probability(energy0, momentum0, energy1, momentum1, mass):
    if mass <= 0:
        return 0.0
    delta = (energy1 - energy0) + (momentum1 ** 2 - momentum0 ** 2) / (2.0 * mass)
    if delta <= 0:
        return 1.0
    return math.exp(-delta)`,
    testCases: [
      { input: [1.0, 0.0, 1.0, 0.0, 1.0], expected: 1.0 },
      { input: [0.0, 0.0, 1.0, 0.0, 1.0], expected: 0.36787944117144233 },
      { input: [0.0, 1.0, 0.0, 1.0, 1.0], expected: 1.0 },
      { input: [0.0, 0.0, 0.0, 1.0, 1.0], expected: 0.6065306597126334 },
      { input: [0.0, 0.0, 0.0, 0.0, 0.0], expected: 0.0 },
    ],
    hint: "Accept whenever the total energy did not increase; otherwise exponentiate the energy increase.",
  },
  {
    id: "pr-309",
    title: "Integrated Autocorrelation Time",
    category: "Probability",
    difficulty: "Medium",
    description: "Estimate the integrated autocorrelation time as tau = 1 + 2 * sum over lags 1..max_lag of the sample autocorrelation at that lag. Each autocorrelation is the sum over i of (x[i] - mean) * (x[i + lag] - mean) divided by the total sum of squared deviations. Return 1.0 for fewer than two samples, max_lag < 1, or a constant sequence.",
    starterCode: `def integrated_autocorrelation_time(samples, max_lag):
    # Your code here
    pass`,
    solution: `def integrated_autocorrelation_time(samples, max_lag):
    n = len(samples)
    if n < 2 or max_lag < 1:
        return 1.0
    mean = sum(samples) / n
    var = 0.0
    for x in samples:
        var += (x - mean) ** 2
    if var == 0:
        return 1.0
    tau = 1.0
    lag = 1
    while lag <= max_lag and lag < n:
        s = 0.0
        for i in range(n - lag):
            s += (samples[i] - mean) * (samples[i + lag] - mean)
        tau += 2.0 * (s / var)
        lag += 1
    return tau`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 1], expected: 1.8 },
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 2], expected: 1.6 },
      { input: [[2.0, 2.0, 2.0], 3], expected: 1.0 },
      { input: [[5.0], 4], expected: 1.0 },
      { input: [[1.0, 3.0, 2.0, 4.0, 3.0], 2], expected: 1.046153846153846 },
    ],
    hint: "Positive autocorrelation inflates the variance of the sample mean, so tau exceeds 1.",
  },
  {
    id: "pr-310",
    title: "Rao-Blackwellized Estimator Variance",
    category: "Probability",
    difficulty: "Easy",
    description: "A Rao-Blackwellized estimator averages conditional expectations instead of raw samples, so its variance is (1 / n^2) times the sum over samples of (g[i] - mean)^2, where mean is the average conditional expectation. Return that variance, or 0.0 for an empty list.",
    starterCode: `def rao_blackwellized_variance(conditional_means):
    # Your code here
    pass`,
    solution: `def rao_blackwellized_variance(conditional_means):
    n = len(conditional_means)
    if n == 0:
        return 0.0
    mean = sum(conditional_means) / n
    total = 0.0
    for g in conditional_means:
        total += (g - mean) ** 2
    return total / (n * n)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0]], expected: 0.3125 },
      { input: [[2.0, 2.0, 2.0]], expected: 0.0 },
      { input: [[0.0, 1.0]], expected: 0.125 },
      { input: [[1.0]], expected: 0.0 },
      { input: [[0.0, 0.0, 1.0, 1.0]], expected: 0.0625 },
    ],
    hint: "Conditioning on auxiliary variables removes their contribution to the estimator variance.",
  },
  {
    id: "pr-311",
    title: "Control Variate Optimal Coefficient",
    category: "Probability",
    difficulty: "Medium",
    description: "The optimal coefficient for the control variate estimator X - b * (Y - E[Y]) is b = Cov(X, Y) / Var(Y). Given samples of the estimator values and the control values, return b using population moments, or 0.0 when there are fewer than two pairs or the control variance is zero.",
    starterCode: `def control_variate_optimal_coefficient(values, controls):
    # Your code here
    pass`,
    solution: `def control_variate_optimal_coefficient(values, controls):
    n = len(values)
    if n < 2 or len(controls) != n:
        return 0.0
    mx = sum(values) / n
    my = sum(controls) / n
    cov = 0.0
    vary = 0.0
    for x, y in zip(values, controls):
        cov += (x - mx) * (y - my)
        vary += (y - my) ** 2
    if vary == 0:
        return 0.0
    return cov / vary`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]], expected: 1.0 },
      { input: [[1.0, 2.0, 3.0], [3.0, 2.0, 1.0]], expected: -1.0 },
      { input: [[1.0, 2.0, 3.0, 4.0], [1.0, 1.0, 2.0, 2.0]], expected: 2.0 },
      { input: [[1.0, 2.0], [3.0, 3.0]], expected: 0.0 },
      { input: [[1.0, 2.0], [5.0]], expected: 0.0 },
    ],
    hint: "Regressing the estimator on the control gives the variance-minimizing coefficient.",
  },
  {
    id: "pr-312",
    title: "Probabilistic PCA Posterior Mean",
    category: "Probability",
    difficulty: "Hard",
    description: "For probabilistic PCA with loading matrix loadings, noise variance noise_variance, and observation x, the posterior mean of the latent vector is (W^T W + noise_variance * I)^-1 W^T x. The loadings matrix is d by k and x has length d. Solve the linear system with Gaussian elimination and return the latent mean, or an empty list for invalid shapes or a nonpositive noise variance.",
    starterCode: `def ppca_posterior_mean(x, loadings, noise_variance):
    # Your code here
    pass`,
    solution: `def ppca_posterior_mean(x, loadings, noise_variance):
    d = len(loadings)
    if d == 0 or noise_variance <= 0:
        return []
    k = len(loadings[0])
    if k == 0:
        return []
    for row in loadings:
        if len(row) != k:
            return []
    if len(x) != d:
        return []
    a = [[0.0] * k for _ in range(k)]
    b = [0.0] * k
    for i in range(k):
        for j in range(k):
            s = 0.0
            for r in range(d):
                s += loadings[r][i] * loadings[r][j]
            a[i][j] = s + (noise_variance if i == j else 0.0)
        s = 0.0
        for r in range(d):
            s += loadings[r][i] * x[r]
        b[i] = s
    for col in range(k):
        pivot = col
        for r in range(col + 1, k):
            if abs(a[r][col]) > abs(a[pivot][col]):
                pivot = r
        if abs(a[pivot][col]) < 1e-12:
            return [0.0] * k
        if pivot != col:
            a[col], a[pivot] = a[pivot], a[col]
            b[col], b[pivot] = b[pivot], b[col]
        for r in range(col + 1, k):
            factor = a[r][col] / a[col][col]
            for c in range(col, k):
                a[r][c] -= factor * a[col][c]
            b[r] -= factor * b[col]
    z = [0.0] * k
    for i in range(k - 1, -1, -1):
        s = b[i]
        for j in range(i + 1, k):
            s -= a[i][j] * z[j]
        z[i] = s / a[i][i]
    return z`,
    testCases: [
      { input: [[1.0], [[1.0]], 1.0], expected: [0.5] },
      { input: [[1.0, 2.0], [[1.0], [2.0]], 1.0], expected: [0.8333333333333334] },
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], 1.0], expected: [0.5, 0.0] },
      { input: [[1.0, 2.0], [[1.0, 0.0], [0.0, 1.0]], 2.0], expected: [0.3333333333333333, 0.6666666666666666] },
      { input: [[1.0], [[1.0]], 0.0], expected: [] },
    ],
    hint: "The posterior precision is W-transpose W plus the noise variance on the diagonal.",
  },
  {
    id: "pr-313",
    title: "Factor Analysis Loading Norm",
    category: "Probability",
    difficulty: "Easy",
    description: "In factor analysis the loading matrix maps latent factors to observed features. Return the Euclidean norm of column factor of loadings, that is the square root of the sum of squared loadings of that factor. Return 0.0 for an empty matrix or an out-of-range factor index.",
    starterCode: `import math


def factor_analysis_loading_norm(loadings, factor):
    # Your code here
    pass`,
    solution: `import math


def factor_analysis_loading_norm(loadings, factor):
    if len(loadings) == 0 or factor < 0:
        return 0.0
    total = 0.0
    for row in loadings:
        if factor >= len(row):
            return 0.0
        total += row[factor] ** 2
    return math.sqrt(total)`,
    testCases: [
      { input: [[[0.5, 0.8], [0.3, 0.6]], 0], expected: 0.58309518948453 },
      { input: [[[0.5, 0.8], [0.3, 0.6]], 1], expected: 1.0 },
      { input: [[[1.0], [2.0]], 0], expected: 2.23606797749979 },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 5], expected: 0.0 },
      { input: [[], 0], expected: 0.0 },
    ],
    hint: "The column norm measures how strongly a factor loads on the observed features.",
  },
  {
    id: "pr-314",
    title: "Conditional Gaussian Mean and Variance",
    category: "Probability",
    difficulty: "Medium",
    description: "For a bivariate Gaussian with mean [mu1, mu2] and covariance [[s11, s12], [s12, s22]], the conditional distribution of the first coordinate given that the second equals x2 is Gaussian with mean mu1 + (s12 / s22) * (x2 - mu2) and variance s11 - s12^2 / s22. Return [conditional mean, conditional variance], clamping a negative variance to 0.0 and returning [0.0, 0.0] for invalid shapes or nonpositive marginal variances.",
    starterCode: `def conditional_gaussian_moments(mu, covariance, x2):
    # Your code here
    pass`,
    solution: `def conditional_gaussian_moments(mu, covariance, x2):
    if len(mu) != 2 or len(covariance) != 2:
        return [0.0, 0.0]
    if len(covariance[0]) != 2 or len(covariance[1]) != 2:
        return [0.0, 0.0]
    s11 = covariance[0][0]
    s12 = covariance[0][1]
    s22 = covariance[1][1]
    if s11 <= 0 or s22 <= 0:
        return [0.0, 0.0]
    mean = mu[0] + s12 / s22 * (x2 - mu[1])
    var = s11 - s12 * s12 / s22
    if var < 0:
        var = 0.0
    return [mean, var]`,
    testCases: [
      { input: [[0.0, 0.0], [[1.0, 0.5], [0.5, 1.0]], 1.0], expected: [0.5, 0.75] },
      { input: [[1.0, 2.0], [[2.0, 1.0], [1.0, 2.0]], 3.0], expected: [1.5, 1.5] },
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], 5.0], expected: [0.0, 1.0] },
      { input: [[2.0, 1.0], [[4.0, -1.0], [-1.0, 2.0]], 0.5], expected: [2.25, 3.5] },
      { input: [[0.0, 0.0], [[1.0, 2.0], [2.0, 1.0]], 1.0], expected: [2.0, 0.0] },
    ],
    hint: "The conditional variance does not depend on the observed value.",
  },
  {
    id: "pr-315",
    title: "Gaussian Process Posterior Mean",
    category: "Probability",
    difficulty: "Hard",
    description: "For a zero-mean Gaussian process with squared exponential kernel exp(-(a - b)^2 / (2 * length_scale^2)) and additive noise variance noise, the posterior mean at x_star is k_star^T (K + noise * I)^-1 y. Build the kernel matrix, solve the system with a Cholesky factorization, and return the predictive mean. Return 0.0 for empty or mismatched data or invalid hyperparameters.",
    starterCode: `import math


def gp_posterior_mean(x_train, y_train, x_star, length_scale, noise):
    # Your code here
    pass`,
    solution: `import math


def gp_posterior_mean(x_train, y_train, x_star, length_scale, noise):
    n = len(x_train)
    if n == 0 or len(y_train) != n or length_scale <= 0 or noise < 0:
        return 0.0
    a = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            d = x_train[i] - x_train[j]
            a[i][j] = math.exp(-(d * d) / (2.0 * length_scale * length_scale))
        a[i][i] += noise
    kstar = [
        math.exp(-((x_star - x_train[i]) ** 2) / (2.0 * length_scale * length_scale))
        for i in range(n)
    ]
    alpha = _cholesky_solve(a, list(y_train))
    if alpha is None:
        return 0.0
    total = 0.0
    for i in range(n):
        total += kstar[i] * alpha[i]
    return total


def _cholesky_solve(a, b):
    n = len(a)
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            s = a[i][j]
            for kk in range(j):
                s -= L[i][kk] * L[j][kk]
            if i == j:
                if s <= 0:
                    return None
                L[i][j] = math.sqrt(s)
            else:
                L[i][j] = s / L[j][j]
    y = [0.0] * n
    for i in range(n):
        s = b[i]
        for kk in range(i):
            s -= L[i][kk] * y[kk]
        y[i] = s / L[i][i]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = y[i]
        for kk in range(i + 1, n):
            s -= L[kk][i] * x[kk]
        x[i] = s / L[i][i]
    return x`,
    testCases: [
      { input: [[0.0], [2.0], 1.0, 1.0, 1.0], expected: 0.6065306597126333 },
      { input: [[0.0, 1.0], [0.0, 1.0], 0.5, 1.0, 0.1], expected: 0.5171292397015598 },
      { input: [[0.0, 2.0], [1.0, 3.0], 1.0, 1.0, 0.5], expected: 1.4835628288095244 },
      { input: [[], [], 1.0, 1.0, 1.0], expected: 0.0 },
      { input: [[0.0, 1.0], [1.0], 1.0, 1.0, 1.0], expected: 0.0 },
    ],
    hint: "The predictive mean is the kernel vector against the training targets, smoothed by the regularized kernel inverse.",
  },
  {
    id: "pr-316",
    title: "Gaussian Process Posterior Variance",
    category: "Probability",
    difficulty: "Hard",
    description: "The posterior variance of a zero-mean Gaussian process with squared exponential kernel and additive noise variance noise is 1 minus k_star^T (K + noise * I)^-1 k_star. Build the kernel matrix, solve the system with a Cholesky factorization, clamp tiny negative values to 0.0, and return 1.0 for empty training data.",
    starterCode: `import math


def gp_posterior_variance(x_train, x_star, length_scale, noise):
    # Your code here
    pass`,
    solution: `import math


def gp_posterior_variance(x_train, x_star, length_scale, noise):
    n = len(x_train)
    if n == 0 or length_scale <= 0 or noise < 0:
        return 1.0
    a = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            d = x_train[i] - x_train[j]
            a[i][j] = math.exp(-(d * d) / (2.0 * length_scale * length_scale))
        a[i][i] += noise
    kstar = [
        math.exp(-((x_star - x_train[i]) ** 2) / (2.0 * length_scale * length_scale))
        for i in range(n)
    ]
    v = _cholesky_solve(a, kstar)
    if v is None:
        return 0.0
    quad = 0.0
    for i in range(n):
        quad += kstar[i] * v[i]
    var = 1.0 - quad
    if var < 0:
        return 0.0
    return var


def _cholesky_solve(a, b):
    n = len(a)
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            s = a[i][j]
            for kk in range(j):
                s -= L[i][kk] * L[j][kk]
            if i == j:
                if s <= 0:
                    return None
                L[i][j] = math.sqrt(s)
            else:
                L[i][j] = s / L[j][j]
    y = [0.0] * n
    for i in range(n):
        s = b[i]
        for kk in range(i):
            s -= L[i][kk] * y[kk]
        y[i] = s / L[i][i]
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = y[i]
        for kk in range(i + 1, n):
            s -= L[kk][i] * x[kk]
        x[i] = s / L[i][i]
    return x`,
    testCases: [
      { input: [[0.0], 1.0, 1.0, 1.0], expected: 0.8160602794142788 },
      { input: [[0.0], 0.0, 1.0, 1.0], expected: 0.5 },
      { input: [[0.0, 1.0], 0.5, 1.0, 0.1], expected: 0.08727009545489339 },
      { input: [[], 0.0, 1.0, 1.0], expected: 1.0 },
      { input: [[0.0, 1.0], 2.0, 1.0, 0.5], expected: 0.7451180897502568 },
    ],
    hint: "Observation noise adds to the diagonal, so the posterior variance never reaches zero exactly.",
  },
  {
    id: "pr-317",
    title: "Kernel Matrix Log-Determinant",
    category: "Probability",
    difficulty: "Hard",
    description: "Build the squared exponential kernel matrix over the given points with additive noise variance noise on the diagonal, then return the natural log of its determinant using the Cholesky factorization as 2 times the sum of the log of the diagonal entries. Return 0.0 when the matrix is not positive definite or the inputs are invalid; an empty point list gives 0.0.",
    starterCode: `import math


def kernel_matrix_log_determinant(points, length_scale, noise):
    # Your code here
    pass`,
    solution: `import math


def kernel_matrix_log_determinant(points, length_scale, noise):
    n = len(points)
    if n == 0:
        return 0.0
    if length_scale <= 0 or noise < 0:
        return 0.0
    L = _cholesky_factor(points, length_scale, noise)
    if L is None:
        return 0.0
    total = 0.0
    for i in range(n):
        if L[i][i] <= 0:
            return 0.0
        total += math.log(L[i][i])
    return 2.0 * total


def _cholesky_factor(points, length_scale, noise):
    n = len(points)
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            d = points[i] - points[j]
            s = math.exp(-(d * d) / (2.0 * length_scale * length_scale))
            if i == j:
                s += noise
            for kk in range(j):
                s -= L[i][kk] * L[j][kk]
            if i == j:
                if s <= 0:
                    return None
                L[i][j] = math.sqrt(s)
            else:
                L[i][j] = s / L[j][j]
    return L`,
    testCases: [
      { input: [[0.0], 1.0, 1.0], expected: 0.6931471805599454 },
      { input: [[0.0, 1.0], 1.0, 1.0], expected: 1.28981665369822 },
      { input: [[0.0, 1.0, 2.0], 2.0, 0.5], expected: 0.3587309450766028 },
      { input: [[], 1.0, 1.0], expected: 0.0 },
      { input: [[0.0, 1.0], 0.0, 1.0], expected: 0.0 },
    ],
    hint: "The determinant of a positive definite matrix is the squared product of the Cholesky diagonal.",
  },
  {
    id: "pr-318",
    title: "Gaussian Process Log Marginal Likelihood",
    category: "Probability",
    difficulty: "Hard",
    description: "For a zero-mean Gaussian process with squared exponential kernel and additive noise variance noise, the log marginal likelihood is -0.5 * y^T (K + noise * I)^-1 y - 0.5 * log det(K + noise * I) - (n / 2) * log(2 * pi). Compute it with a Cholesky factorization and return 0.0 for empty or mismatched data or invalid hyperparameters.",
    starterCode: `import math


def gp_log_marginal_likelihood(x_train, y_train, length_scale, noise):
    # Your code here
    pass`,
    solution: `import math


def gp_log_marginal_likelihood(x_train, y_train, length_scale, noise):
    n = len(x_train)
    if n == 0 or len(y_train) != n or length_scale <= 0 or noise <= 0:
        return 0.0
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            d = x_train[i] - x_train[j]
            s = math.exp(-(d * d) / (2.0 * length_scale * length_scale))
            if i == j:
                s += noise
            for kk in range(j):
                s -= L[i][kk] * L[j][kk]
            if i == j:
                if s <= 0:
                    return 0.0
                L[i][j] = math.sqrt(s)
            else:
                L[i][j] = s / L[j][j]
    yv = [0.0] * n
    for i in range(n):
        s = y_train[i]
        for kk in range(i):
            s -= L[i][kk] * yv[kk]
        yv[i] = s / L[i][i]
    alpha = [0.0] * n
    for i in range(n - 1, -1, -1):
        s = yv[i]
        for kk in range(i + 1, n):
            s -= L[kk][i] * alpha[kk]
        alpha[i] = s / L[i][i]
    fit = 0.0
    for i in range(n):
        fit += y_train[i] * alpha[i]
    logdet = 0.0
    for i in range(n):
        logdet += math.log(L[i][i])
    return -0.5 * fit - logdet - 0.5 * n * math.log(2.0 * math.pi)`,
    testCases: [
      { input: [[0.0], [1.0], 1.0, 1.0], expected: -1.5155121234846454 },
      { input: [[0.0, 1.0], [1.0, 2.0], 1.0, 1.0], expected: -3.525410113236392 },
      { input: [[0.0, 1.0], [0.0, 0.0], 2.0, 0.5], expected: -2.0309159974296955 },
      { input: [[], [], 1.0, 1.0], expected: 0.0 },
      { input: [[0.0, 1.0], [1.0], 1.0, 1.0], expected: 0.0 },
    ],
    hint: "The marginal likelihood trades off data fit, the Occam penalty from the determinant, and the normalization.",
  },
  {
    id: "pr-319",
    title: "Bayesian Model Averaging Prediction",
    category: "Probability",
    difficulty: "Easy",
    description: "Bayesian model averaging predicts with the posterior-weighted mean of the model predictions: the sum over models of posteriors[m] * predictions[m]. Return 0.0 for empty or mismatched lists or a negative posterior weight.",
    starterCode: `def bayesian_model_averaging(posteriors, predictions):
    # Your code here
    pass`,
    solution: `def bayesian_model_averaging(posteriors, predictions):
    if len(posteriors) == 0 or len(posteriors) != len(predictions):
        return 0.0
    total = 0.0
    for p, pred in zip(posteriors, predictions):
        if p < 0:
            return 0.0
        total += p * pred
    return total`,
    testCases: [
      { input: [[0.7, 0.3], [10.0, 20.0]], expected: 13.0 },
      { input: [[0.5, 0.5], [0.0, 1.0]], expected: 0.5 },
      { input: [[1.0], [5.0]], expected: 5.0 },
      { input: [[0.2, 0.3, 0.5], [1.0, 2.0, 3.0]], expected: 2.3 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Weight each model prediction by its posterior probability and add them up.",
  },
  {
    id: "pr-320",
    title: "Bayesian Network Joint Probability",
    category: "Probability",
    difficulty: "Medium",
    description: "For a binary Bayesian network, each node i has parents parents[i] and conditional probability table cpts[i]. Rows of cpts[i] are indexed by the parent configuration, where the first parent is the least significant bit of the binary index, and columns are the node's probability of being 0 or 1. Return the joint probability of assignment, or 0.0 when shapes are invalid.",
    starterCode: `def bayesian_network_joint_probability(parents, cpts, assignment):
    # Your code here
    pass`,
    solution: `def bayesian_network_joint_probability(parents, cpts, assignment):
    n = len(assignment)
    if n == 0 or len(parents) != n or len(cpts) != n:
        return 0.0
    total = 1.0
    for i in range(n):
        if assignment[i] not in (0, 1):
            return 0.0
        index = 0
        position = 1
        for p in parents[i]:
            if p < 0 or p >= n:
                return 0.0
            if assignment[p] not in (0, 1):
                return 0.0
            index += assignment[p] * position
            position *= 2
        table = cpts[i]
        if index >= len(table) or len(table[index]) != 2:
            return 0.0
        prob = table[index][assignment[i]]
        if prob <= 0 or prob > 1:
            return 0.0
        total *= prob
    return total`,
    testCases: [
      { input: [[[], [0]], [[[0.6, 0.4]], [[0.9, 0.1], [0.2, 0.8]]], [0, 1]], expected: 0.06 },
      { input: [[[], [0]], [[[0.6, 0.4]], [[0.9, 0.1], [0.2, 0.8]]], [1, 1]], expected: 0.32000000000000006 },
      { input: [[[], [0]], [[[0.6, 0.4]], [[0.9, 0.1], [0.2, 0.8]]], [1, 0]], expected: 0.08000000000000002 },
      { input: [[[], [], [0, 1]], [[[0.5, 0.5]], [[0.8, 0.2]], [[0.1, 0.9], [0.6, 0.4], [0.2, 0.8], [0.7, 0.3]]], [1, 0, 0]], expected: 0.24 },
      { input: [[[], [0]], [[[0.6, 0.4]], [[0.9, 0.1], [0.2, 0.8]]], []], expected: 0.0 },
    ],
    hint: "Multiply the conditional probability of each node given its parents' assigned values.",
  },
];
