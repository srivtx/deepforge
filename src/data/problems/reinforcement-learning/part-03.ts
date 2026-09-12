import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-091",
    title: "MDP Transition Matrix Build",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Build the policy transition matrix from dense MDP transition lists.\n\ntransitions[s][a] holds [probability, next_state] outcomes and policy[s] selects one action per state. Return P where P[s][s2] is the probability of moving from s to s2 under the policy.",
    starterCode: `def build_transition_matrix(transitions, policy):
    # Your code here
    pass`,
    solution: `def build_transition_matrix(transitions, policy):
    n = len(transitions)
    P = [[0.0] * n for _ in range(n)]
    for s in range(n):
        a = policy[s]
        for prob, s2 in transitions[s][a]:
            P[s][s2] += prob
    return P`,
    testCases: [
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [0, 1]], expected: [[0.0, 1.0], [0.0, 1.0]] },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [0, 0]], expected: [[0.0, 1.0], [1.0, 0.0]] },
      { input: [[[[[1.0, 1]]], [[[1.0, 2]]], [[[1.0, 2]]]], [0, 0, 0]], expected: [[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]] },
    ],
    hint: "Under a deterministic policy each row of P comes from one action's outcome list.",
  },
  {
    id: "rl-092",
    title: "Stationary Distribution",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Find the stationary distribution of a row-stochastic transition matrix by power iteration.\n\nStart from the uniform distribution and repeatedly compute d = d * P until the largest component change is below tol, then renormalize. Return the limit reached from the uniform start.",
    starterCode: `def stationary_distribution(P, tol=1e-9):
    # Your code here
    pass`,
    solution: `def stationary_distribution(P, tol=1e-9):
    n = len(P)
    d = [1.0 / n] * n
    for _ in range(100000):
        new_d = [0.0] * n
        for i in range(n):
            for j in range(n):
                new_d[j] += d[i] * P[i][j]
        diff = max(abs(new_d[i] - d[i]) for i in range(n))
        d = new_d
        if diff < tol:
            break
    total = sum(d)
    return [x / total for x in d]`,
    testCases: [
      { input: [[[0.5, 0.5], [1.0, 0.0]]], expected: [0.6666666669771075, 0.3333333330228925] },
      { input: [[[1.0, 0.0], [0.0, 1.0]]], expected: [0.5, 0.5] },
      { input: [[[0.0, 1.0], [1.0, 0.0]]], expected: [0.5, 0.5] },
      { input: [[[0.8, 0.2], [0.3, 0.7]]], expected: [0.599999999254942, 0.40000000074505804] },
    ],
    hint: "Power iteration converges for any initial distribution when P is row-stochastic.",
  },
  {
    id: "rl-093",
    title: "Discounted Occupancy Measure",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the gamma-discounted state occupancy measure of a policy.\n\nd(s) = (1 - gamma) * sum over t of gamma^t * Pr(state_t = s), starting from the initial distribution mu. Iterate the distribution forward, accumulating each term until the remaining weight is below 1e-15, and return the measure.",
    starterCode: `def discounted_occupancy(P, mu, gamma):
    # Your code here
    pass`,
    solution: `def discounted_occupancy(P, mu, gamma):
    n = len(P)
    d = [(1.0 - gamma) * mu[i] for i in range(n)]
    cur = list(mu)
    power = (1.0 - gamma) * gamma
    while power > 1e-15:
        nxt = [0.0] * n
        for i in range(n):
            for j in range(n):
                nxt[j] += cur[i] * P[i][j]
        cur = nxt
        for i in range(n):
            d[i] += power * cur[i]
        power *= gamma
    return d`,
    testCases: [
      { input: [[[0.0, 1.0], [1.0, 0.0]], [1.0, 0.0], 0.5], expected: [0.6666666666666661, 0.33333333333333215] },
      { input: [[[0.5, 0.5], [0.25, 0.75]], [1.0, 0.0], 0.9], expected: [0.41935483870967416, 0.5806451612903162] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [0.3, 0.7], 0.8], expected: [0.29999999999999866, 0.6999999999999961] },
    ],
    hint: "The (1 - gamma) factor makes the discounted occupancy measure sum to one.",
  },
  {
    id: "rl-094",
    title: "Reward Function From Preferences",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate linear reward weights from pairwise trajectory preferences.\n\nEach pair is [phi1, phi2, pref], where pref >= 0.5 means phi1 is preferred. Add sign * (phi1 - phi2) for every pair and divide by the number of pairs. Return the weight vector, or [] when there are no pairs.",
    starterCode: `def reward_from_preferences(pairs):
    # Your code here
    pass`,
    solution: `def reward_from_preferences(pairs):
    n = len(pairs)
    if n == 0:
        return []
    d = len(pairs[0][0])
    w = [0.0] * d
    for phi1, phi2, pref in pairs:
        sign = 1.0 if pref >= 0.5 else -1.0
        for i in range(d):
            w[i] += sign * (phi1[i] - phi2[i])
    return [x / n for x in w]`,
    testCases: [
      { input: [[[[1.0, 2.0], [0.0, 1.0], 1.0], [[2.0, 0.0], [1.0, 1.0], 0.0]]], expected: [0.0, 1.0] },
      { input: [[[[1.0], [0.0], 1.0], [[1.0], [2.0], 1.0]]], expected: [0.0] },
      { input: [[[[3.0, 1.0], [0.0, 2.0], 0.5]]], expected: [3.0, -1.0] },
    ],
    hint: "Preferences identify reward weights only up to scale, so the sign convention matters.",
  },
  {
    id: "rl-095",
    title: "Inverse RL Max-Entropy Step Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one max-entropy inverse RL gradient step on the reward weights.\n\nThe gradient is the expert feature expectation minus the current policy feature expectation, and the weights move toward the expert by lr. Return weights[i] + lr * (expert[i] - policy[i]).",
    starterCode: `def maxent_irl_step(weights, expert_feats, policy_feats, lr):
    # Your code here
    pass`,
    solution: `def maxent_irl_step(weights, expert_feats, policy_feats, lr):
    return [weights[i] + lr * (expert_feats[i] - policy_feats[i]) for i in range(len(weights))]`,
    testCases: [
      { input: [[1.0, 0.0], [2.0, 3.0], [1.0, 1.0], 0.1], expected: [1.1, 0.2] },
      { input: [[0.0, 0.0], [1.0, 1.0], [1.0, 1.0], 0.5], expected: [0.0, 0.0] },
      { input: [[-1.0, 2.0], [0.0, 0.0], [2.0, 2.0], 0.25], expected: [-1.5, 1.5] },
    ],
    hint: "Max-entropy IRL matches the expert's expected feature counts.",
  },
  {
    id: "rl-096",
    title: "Behavioral Cloning Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the behavioral cloning loss as the negative mean log-probability of the demonstrated actions. An empty batch returns 0.0.",
    starterCode: `def behavioral_cloning_loss(log_probs):
    # Your code here
    pass`,
    solution: `def behavioral_cloning_loss(log_probs):
    n = len(log_probs)
    if n == 0:
        return 0.0
    return -sum(log_probs) / n`,
    testCases: [
      { input: [[-0.5, -1.0]], expected: 0.75 },
      { input: [[0.0]], expected: -0.0 },
      { input: [[-2.0, -0.5, -1.0]], expected: 1.1666666666666667 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Minimizing this loss is equivalent to maximizing the likelihood of the demonstrations.",
  },
  {
    id: "rl-097",
    title: "DAgger Query Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Measure the fraction of queried states where the learner disagrees with the expert, a DAgger diagnostic.\n\nReturn the number of differing actions divided by the number of states; empty input gives 0.0.",
    starterCode: `def dagger_disagreement(states, learner_actions, expert_actions):
    # Your code here
    pass`,
    solution: `def dagger_disagreement(states, learner_actions, expert_actions):
    n = len(learner_actions)
    if n == 0:
        return 0.0
    diff = 0
    for i in range(n):
        if learner_actions[i] != expert_actions[i]:
            diff += 1
    return diff / n`,
    testCases: [
      { input: [["s0", "s1", "s2", "s3"], [0, 1, 1, 0], [0, 0, 1, 1]], expected: 0.5 },
      { input: [["a", "b"], [2, 2], [2, 2]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Disagreement rate tracks how much the learner has drifted from the expert.",
  },
  {
    id: "rl-098",
    title: "GAIL Discriminator Loss Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the binary cross-entropy loss of a GAIL discriminator.\n\nExpert samples have target 1 and policy samples target 0: L = -mean(log(D(expert)) + log(1 - D(policy))). Probabilities are strictly between 0 and 1 and the batch is non-empty.",
    starterCode: `import math
def gail_discriminator_loss(d_expert, d_policy):
    # Your code here
    pass`,
    solution: `import math
def gail_discriminator_loss(d_expert, d_policy):
    n = len(d_expert)
    if n == 0:
        return 0.0
    total = 0.0
    for de, dp in zip(d_expert, d_policy):
        total += math.log(de) + math.log(1.0 - dp)
    return -total / n`,
    testCases: [
      { input: [[0.9, 0.8], [0.1, 0.2]], expected: 0.328504066972036 },
      { input: [[0.5], [0.5]], expected: 1.3862943611198906 },
      { input: [[1.0, 0.99], [0.01, 0.01]], expected: 0.015075503780252176 },
    ],
    hint: "The discriminator tries to distinguish expert transitions from policy transitions.",
  },
  {
    id: "rl-099",
    title: "CQL Penalty Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the CQL conservative penalty for one state.\n\nThe penalty is the log-sum-exp of the Q values minus the Q value of the action in the dataset, pushing down out-of-distribution action values. Return the difference.",
    starterCode: `import math
def cql_penalty_lite(q_values, data_action):
    # Your code here
    pass`,
    solution: `import math
def cql_penalty_lite(q_values, data_action):
    m = max(q_values)
    logsumexp = m + math.log(sum(math.exp(q - m) for q in q_values))
    return logsumexp - q_values[data_action]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0], expected: 2.4076059644443806 },
      { input: [[0.0, 0.0], 1], expected: 0.6931471805599453 },
      { input: [[5.0, 1.0, 2.0], 0], expected: 0.06588390375742925 },
      { input: [[10.0, 10.0, 10.0], 2], expected: 1.0986122886681091 },
    ],
    hint: "CQL lowers Q on actions the dataset never took.",
  },
  {
    id: "rl-100",
    title: "Behavior Cloning Dataset Split",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Split n demonstration episodes into train and validation sets.\n\nThe validation size is int(n * val_fraction) using truncation, and the training set gets the rest. Return [n_train, n_val].",
    starterCode: `def bc_dataset_split(n_episodes, val_fraction):
    # Your code here
    pass`,
    solution: `def bc_dataset_split(n_episodes, val_fraction):
    n_val = int(n_episodes * val_fraction)
    n_train = n_episodes - n_val
    return [n_train, n_val]`,
    testCases: [
      { input: [10, 0.2], expected: [8, 2] },
      { input: [7, 0.3], expected: [5, 2] },
      { input: [5, 0.0], expected: [5, 0] },
      { input: [3, 1.0], expected: [0, 3] },
    ],
    hint: "Truncation keeps the split deterministic for odd episode counts.",
  },
  {
    id: "rl-101",
    title: "World Model Rollout Tiny",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Roll a deterministic linear world model forward for a fixed number of steps.\n\nnext = W * state + b at each step, with each prediction fed back as the next input. Return the trajectory including the initial state, so its length is steps + 1.",
    starterCode: `def world_model_rollout(state, weight, bias, steps):
    # Your code here
    pass`,
    solution: `def world_model_rollout(state, weight, bias, steps):
    traj = [list(state)]
    cur = list(state)
    for _ in range(steps):
        nxt = [sum(weight[i][j] * cur[j] for j in range(len(cur))) + bias[i] for i in range(len(weight))]
        traj.append(nxt)
        cur = nxt
    return traj`,
    testCases: [
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [1.0, -1.0], 2], expected: [[0.0, 0.0], [1.0, -1.0], [2.0, -2.0]] },
      { input: [[1.0], [[2.0]], [0.5], 3], expected: [[1.0], [2.5], [5.5], [11.5]] },
      { input: [[1.0, 2.0], [[1.0, 1.0]], [0.0], 0], expected: [[1.0, 2.0]] },
    ],
    hint: "Feed each prediction back as the next input.",
  },
  {
    id: "rl-102",
    title: "MuZero Value+Policy Target Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Build MuZero targets for one search: a discounted reward value and a normalized visit-count policy.\n\nvalue = sum of gamma^t * rewards[t], and policy = counts / sum(counts). If all counts are zero return an all-zero policy. Return [value, policy].",
    starterCode: `def muzero_targets(rewards, gamma, visit_counts):
    # Your code here
    pass`,
    solution: `def muzero_targets(rewards, gamma, visit_counts):
    value = 0.0
    power = 1.0
    for r in rewards:
        value += power * r
        power *= gamma
    total = sum(visit_counts)
    if total <= 0.0:
        policy = [0.0 for _ in visit_counts]
    else:
        policy = [c / total for c in visit_counts]
    return [value, policy]`,
    testCases: [
      { input: [[1.0, 1.0], 0.9, [4, 2, 2]], expected: [1.9, [0.5, 0.25, 0.25]] },
      { input: [[2.0], 0.5, [1, 0]], expected: [2.0, [1.0, 0.0]] },
      { input: [[], 0.9, [3, 1, 0, 0]], expected: [0.0, [0.75, 0.25, 0.0, 0.0]] },
    ],
    hint: "The value target can be any n-step return; visit counts give the policy target.",
  },
  {
    id: "rl-103",
    title: "AlphaZero Visit Counts",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Turn MCTS visit counts into an improved policy using a temperature exponent.\n\nweights[a] = counts[a] ** (1 / temperature) and the result is normalized to sum to 1. If the total weight is zero return a uniform distribution over the action list.",
    starterCode: `def alphazero_visit_policy(counts, temperature):
    # Your code here
    pass`,
    solution: `def alphazero_visit_policy(counts, temperature):
    weights = [c ** (1.0 / temperature) for c in counts]
    total = sum(weights)
    if total <= 0.0:
        n = len(counts)
        return [1.0 / n] * n if n > 0 else []
    return [w / total for w in weights]`,
    testCases: [
      { input: [[10, 0, 0], 1.0], expected: [1.0, 0.0, 0.0] },
      { input: [[4, 1, 1], 1.0], expected: [0.6666666666666666, 0.16666666666666666, 0.16666666666666666] },
      { input: [[4, 1, 1], 0.5], expected: [0.8888888888888888, 0.05555555555555555, 0.05555555555555555] },
      { input: [[1, 1, 1], 2.0], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "Temperature below 1 sharpens the visit distribution; temperature above 1 flattens it.",
  },
  {
    id: "rl-104",
    title: "PUCT Selection",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Select an MCTS child with PUCT and first-play urgency.\n\nIf the total visit count is zero return 0. Otherwise return the first unvisited action if one exists, else the argmax of W[a]/N[a] + c * priors[a] * sqrt(total) / (1 + N[a]), with ties going to the smallest index.",
    starterCode: `import math
def puct_select(W, N, priors, c):
    # Your code here
    pass`,
    solution: `import math
def puct_select(W, N, priors, c):
    total = sum(N)
    if total == 0:
        return 0
    for a in range(len(W)):
        if N[a] == 0:
            return a
    best_a = 0
    best_score = float('-inf')
    for a in range(len(W)):
        q = W[a] / N[a]
        score = q + c * priors[a] * math.sqrt(total) / (1 + N[a])
        if score > best_score:
            best_score = score
            best_a = a
    return best_a`,
    testCases: [
      { input: [[5.0, 5.0], [0, 3], [0.5, 0.5], 1.0], expected: 0 },
      { input: [[4.0, 1.0], [10, 2], [0.5, 0.5], 1.0], expected: 1 },
      { input: [[1.0, 9.0, 2.0], [1, 1, 1], [0.2, 0.3, 0.5], 0.0], expected: 1 },
      { input: [[2.0, 2.0], [0, 0], [0.5, 0.5], 1.0], expected: 0 },
    ],
    hint: "First-play urgency forces every child to be tried once before PUCT kicks in.",
  },
  {
    id: "rl-105",
    title: "Backup Value At Leaf",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Back up a leaf value into a node's running average.\n\nReturn (total_value + leaf_value) / (visits + 1), the new mean action value after one more visit.",
    starterCode: `def backup_value_at_leaf(total_value, visits, leaf_value):
    # Your code here
    pass`,
    solution: `def backup_value_at_leaf(total_value, visits, leaf_value):
    return (total_value + leaf_value) / (visits + 1)`,
    testCases: [
      { input: [10.0, 2, 4.0], expected: 4.666666666666667 },
      { input: [0.0, 0, 3.0], expected: 3.0 },
      { input: [-2.0, 3, -6.0], expected: -2.0 },
    ],
    hint: "Incremental averaging keeps the node's Q estimate exact.",
  },
  {
    id: "rl-106",
    title: "Dirichlet Noise On Priors",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Mix Dirichlet noise into a prior distribution, as AlphaZero does at the MCTS root.\n\nCreate rng = random.Random(seed), draw n Gamma(alpha, 1) samples with rng.gammavariate, normalize them into a Dirichlet sample, and return (1 - epsilon) * priors + epsilon * noise. The seed makes the result reproducible.",
    starterCode: `import random
def dirichlet_noise_priors(priors, alpha, epsilon, seed):
    # Your code here
    pass`,
    solution: `import random
def dirichlet_noise_priors(priors, alpha, epsilon, seed):
    rng = random.Random(seed)
    n = len(priors)
    gammas = [rng.gammavariate(alpha, 1.0) for _ in range(n)]
    total = sum(gammas)
    noise = [g / total for g in gammas]
    return [(1.0 - epsilon) * priors[i] + epsilon * noise[i] for i in range(n)]`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], 0.5, 0.25, 42], expected: [0.4450821975969227, 0.23796534356096616, 0.3169524588421112] },
      { input: [[0.25, 0.25, 0.25, 0.25], 1.0, 0.1, 0], expected: [0.2701100917755, 0.2593944140089405, 0.23823071911962349, 0.23226477509593607] },
      { input: [[0.6, 0.4], 2.0, 0.5, 7], expected: [0.45664010302237007, 0.5433598969776299] },
    ],
    hint: "Normalized Gamma samples are exactly a Dirichlet sample.",
  },
  {
    id: "rl-107",
    title: "Temperature Move Selection",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample a move from temperature-scaled visit counts.\n\nweights[a] = counts[a] ** (1 / temperature); with rng = random.Random(seed), draw u = rng.random() * sum(weights) and return the first index whose cumulative weight exceeds u, falling back to the last index.",
    starterCode: `import random
def temperature_move_select(counts, temperature, seed):
    # Your code here
    pass`,
    solution: `import random
def temperature_move_select(counts, temperature, seed):
    rng = random.Random(seed)
    weights = [c ** (1.0 / temperature) for c in counts]
    total = sum(weights)
    u = rng.random() * total
    acc = 0.0
    for a in range(len(weights)):
        acc += weights[a]
        if u < acc:
            return a
    return len(counts) - 1`,
    testCases: [
      { input: [[4, 1, 1], 1.0, 0], expected: 2 },
      { input: [[4, 1, 1], 1.0, 1], expected: 0 },
      { input: [[4, 1, 1], 1.0, 2], expected: 2 },
      { input: [[10, 0, 0], 0.5, 42], expected: 0 },
    ],
    hint: "This is inverse-transform sampling over the visit distribution.",
  },
  {
    id: "rl-108",
    title: "Self-Play Reward",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the terminal reward for a self-play player from the final score.\n\nplayer is 0 or 1; the reward is 1.0 for a win, -1.0 for a loss, and 0.0 for a draw.",
    starterCode: `def self_play_reward(score_a, score_b, player):
    # Your code here
    pass`,
    solution: `def self_play_reward(score_a, score_b, player):
    if player == 0:
        mine, theirs = score_a, score_b
    else:
        mine, theirs = score_b, score_a
    if mine > theirs:
        return 1.0
    if mine < theirs:
        return -1.0
    return 0.0`,
    testCases: [
      { input: [3, 1, 0], expected: 1.0 },
      { input: [1, 3, 0], expected: -1.0 },
      { input: [2, 2, 1], expected: 0.0 },
      { input: [1, 3, 1], expected: 1.0 },
    ],
    hint: "Flip the scores when the queried player is the second one.",
  },
  {
    id: "rl-109",
    title: "Elo Self-Play Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Update player A's Elo rating after a self-play game.\n\nE = 1 / (1 + 10 ** ((rating_b - rating_a) / 400)), and the new rating is rating_a + k * (score - E), where score is 1.0 for a win, 0.5 for a draw, and 0.0 for a loss.",
    starterCode: `def elo_self_play_update(rating_a, rating_b, score, k):
    # Your code here
    pass`,
    solution: `def elo_self_play_update(rating_a, rating_b, score, k):
    expected = 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))
    return rating_a + k * (score - expected)`,
    testCases: [
      { input: [1500.0, 1500.0, 1.0, 32.0], expected: 1516.0 },
      { input: [1500.0, 1500.0, 0.5, 32.0], expected: 1500.0 },
      { input: [1600.0, 1400.0, 0.0, 20.0], expected: 1584.8050614670408 },
      { input: [1400.0, 1600.0, 1.0, 20.0], expected: 1415.1949385329592 },
    ],
    hint: "Beating a stronger opponent moves the rating more than beating a weaker one.",
  },
  {
    id: "rl-110",
    title: "League Table Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Update a league table after one game.\n\nEach row is [name, wins, losses, rating]. Increment the winner's wins and the loser's losses, then apply a fixed K = 16 Elo update to both ratings (winner scored 1.0, loser 0.0). Return the updated table as deep copies.",
    starterCode: `def league_table_update(table, winner, loser):
    # Your code here
    pass`,
    solution: `def league_table_update(table, winner, loser):
    new_table = [list(row) for row in table]
    ra = 0.0
    rb = 0.0
    for row in new_table:
        if row[0] == winner:
            row[1] += 1
            ra = row[3]
        elif row[0] == loser:
            row[2] += 1
            rb = row[3]
    expected = 1.0 / (1.0 + 10.0 ** ((rb - ra) / 400.0))
    for row in new_table:
        if row[0] == winner:
            row[3] = ra + 16.0 * (1.0 - expected)
        elif row[0] == loser:
            row[3] = rb + 16.0 * (0.0 - (1.0 - expected))
    return new_table`,
    testCases: [
      { input: [[["A", 5, 3, 1520.0], ["B", 4, 4, 1480.0], ["C", 6, 2, 1600.0]], "A", "B"], expected: [["A", 6, 3, 1527.0830138598033], ["B", 4, 5, 1472.9169861401967], ["C", 6, 2, 1600.0]] },
      { input: [[["X", 0, 0, 1500.0], ["Y", 0, 0, 1500.0]], "Y", "X"], expected: [["X", 0, 1, 1492.0], ["Y", 1, 0, 1508.0]] },
      { input: [[["A", 1, 0, 1550.0], ["B", 0, 1, 1450.0]], "B", "A"], expected: [["A", 1, 1, 1539.7589600031538], ["B", 1, 1, 1460.2410399968462]] },
    ],
    hint: "Ratings are read before the game and updated only after both tallies change.",
  },
  {
    id: "rl-111",
    title: "Fictitious Play Convergence Check",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Check whether a strategy is approximately a best response to itself, the fictitious-play convergence criterion.\n\np is the strategy and A[i][j] is player 1's payoff for action i against action j. Return True when the best-response value against p exceeds the value of p by at most tol.",
    starterCode: `def fictitious_play_converged(p, A, tol):
    # Your code here
    pass`,
    solution: `def fictitious_play_converged(p, A, tol):
    n = len(A)
    m = len(A[0])
    action_values = []
    for i in range(n):
        action_values.append(sum(A[i][j] * p[j] for j in range(m)))
    value = sum(p[i] * action_values[i] for i in range(n))
    best = max(action_values)
    return best - value <= tol`,
    testCases: [
      { input: [[0.5, 0.5], [[1.0, -1.0], [-1.0, 1.0]], 1e-09], expected: true },
      { input: [[0.7, 0.3], [[3.0, 0.0], [0.0, 2.0]], 1e-09], expected: false },
      { input: [[1.0, 0.0], [[3.0, 0.0], [0.0, 2.0]], 1e-09], expected: true },
      { input: [[0.5, 0.5], [[0.0, 2.0], [3.0, 0.0]], 1e-09], expected: false },
    ],
    hint: "Fictitious play converges when nobody wants to deviate from the empirical strategy.",
  },
  {
    id: "rl-112",
    title: "Regret Matching",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Convert cumulative regrets into a strategy with regret matching.\n\nKeep only the positive parts and normalize them to sum to 1. If no regret is positive fall back to a uniform distribution, and an empty list returns [].",
    starterCode: `def regret_matching(regrets):
    # Your code here
    pass`,
    solution: `def regret_matching(regrets):
    n = len(regrets)
    if n == 0:
        return []
    pos = [max(0.0, r) for r in regrets]
    total = sum(pos)
    if total <= 0.0:
        return [1.0 / n] * n
    return [p / total for p in pos]`,
    testCases: [
      { input: [[1.0, -1.0]], expected: [1.0, 0.0] },
      { input: [[-1.0, -2.0]], expected: [0.5, 0.5] },
      { input: [[2.0, 1.0, 1.0]], expected: [0.5, 0.25, 0.25] },
      { input: [[]], expected: [] },
    ],
    hint: "Only actions with positive regret get probability under regret matching.",
  },
  {
    id: "rl-113",
    title: "CFR Regret Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one counterfactual regret minimization update.\n\nThe expected utility is strategy . utilities; add utilities[a] - expected_utility to regrets[a]. Return the new regret list.",
    starterCode: `def cfr_regret_update(regrets, strategy, utilities):
    # Your code here
    pass`,
    solution: `def cfr_regret_update(regrets, strategy, utilities):
    exp_u = 0.0
    for i in range(len(utilities)):
        exp_u += strategy[i] * utilities[i]
    return [regrets[i] + utilities[i] - exp_u for i in range(len(utilities))]`,
    testCases: [
      { input: [[0.0, 0.0], [0.5, 0.5], [1.0, 0.0]], expected: [0.5, -0.5] },
      { input: [[1.0, 2.0], [0.25, 0.75], [0.0, 4.0]], expected: [-2.0, 3.0] },
      { input: [[0.0], [1.0], [3.0]], expected: [0.0] },
    ],
    hint: "Regret is the gain over the strategy's own expected utility.",
  },
  {
    id: "rl-114",
    title: "CFR Average Strategy",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Normalize accumulated strategy sums into the average strategy.\n\nIf the total is not positive return the uniform distribution, and an empty list returns [].",
    starterCode: `def cfr_average_strategy(strategy_sum):
    # Your code here
    pass`,
    solution: `def cfr_average_strategy(strategy_sum):
    n = len(strategy_sum)
    if n == 0:
        return []
    total = sum(strategy_sum)
    if total <= 0.0:
        return [1.0 / n] * n
    return [s / total for s in strategy_sum]`,
    testCases: [
      { input: [[2.0, 1.0, 1.0]], expected: [0.5, 0.25, 0.25] },
      { input: [[0.0, 0.0]], expected: [0.5, 0.5] },
      { input: [[]], expected: [] },
      { input: [[1.0, 3.0]], expected: [0.25, 0.75] },
    ],
    hint: "The average strategy is the object that converges in CFR, not the current strategy.",
  },
  {
    id: "rl-115",
    title: "Exploitability Lite",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the exploitability of a strategy profile in a two-player zero-sum game.\n\nA is player 1's payoff matrix. br1 is the best pure response to q, and br2 is player 2's best response to p (minimizing player 1's payoff). Return (br1 - br2) / 2, which is zero at a Nash equilibrium.",
    starterCode: `def exploitability_lite(A, p, q):
    # Your code here
    pass`,
    solution: `def exploitability_lite(A, p, q):
    n = len(A)
    m = len(q)
    ag = []
    for i in range(n):
        ag.append(sum(A[i][j] * q[j] for j in range(m)))
    br1 = max(ag)
    ap = []
    for j in range(m):
        ap.append(sum(A[i][j] * p[i] for i in range(n)))
    br2 = min(ap)
    return (br1 - br2) / 2.0`,
    testCases: [
      { input: [[[1.0, -1.0], [-1.0, 1.0]], [0.5, 0.5], [0.5, 0.5]], expected: 0.0 },
      { input: [[[3.0, 0.0], [0.0, 1.0]], [1.0, 0.0], [1.0, 0.0]], expected: 1.5 },
      { input: [[[0.0, 2.0], [1.0, 0.0]], [0.5, 0.5], [0.5, 0.5]], expected: 0.25 },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [1.0, 0.0], [0.0, 1.0]], expected: 0.5 },
    ],
    hint: "Exploitability halves the gap between the two best-response values.",
  },
  {
    id: "rl-116",
    title: "Bandit Best Arm Gap",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the suboptimality gap of every arm: max(means) - means[a]. An empty list returns [].",
    starterCode: `def bandit_best_arm_gap(means):
    # Your code here
    pass`,
    solution: `def bandit_best_arm_gap(means):
    if not means:
        return []
    best = max(means)
    return [best - m for m in means]`,
    testCases: [
      { input: [[0.2, 0.5, 0.7]], expected: [0.49999999999999994, 0.19999999999999996, 0.0] },
      { input: [[1.0]], expected: [0.0] },
      { input: [[0.3, 0.3]], expected: [0.0, 0.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Small gaps make arms harder to distinguish, so regret bounds depend on them.",
  },
  {
    id: "rl-117",
    title: "Successive Halving Elimination",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Select the configurations that survive one round of successive halving.\n\nKeep the top ceil(n / eta) configurations by score (ties broken by smaller index) and return the surviving indices in ascending order. If eta <= 1 or there are no configurations, return [].",
    starterCode: `import math
def successive_halving_keep(scores, eta):
    # Your code here
    pass`,
    solution: `import math
def successive_halving_keep(scores, eta):
    n = len(scores)
    if n == 0 or eta <= 1:
        return []
    keep = int(math.ceil(n / eta))
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    return sorted(order[:keep])`,
    testCases: [
      { input: [[1.0, 5.0, 3.0, 2.0], 2], expected: [1, 2] },
      { input: [[9.0, 4.0, 4.0, 1.0, 0.0], 3], expected: [0, 1] },
      { input: [[2.0], 2], expected: [0] },
      { input: [[1.0, 2.0], 1], expected: [] },
    ],
    hint: "Eta is the reduction factor; half the field survives when eta is 2.",
  },
  {
    id: "rl-118",
    title: "Hyperband Budget Calc",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the Hyperband bracket schedule for bracket index s.\n\nFor each round i from 0 to s, n_i = ceil((s + 1) / (i + 1) * eta^i) configurations run for r_i = R * eta^(-i) resources. Return a list of [n_i, r_i] pairs.",
    starterCode: `import math
def hyperband_schedule(R, eta, s):
    # Your code here
    pass`,
    solution: `import math
def hyperband_schedule(R, eta, s):
    schedule = []
    for i in range(s + 1):
        n_i = int(math.ceil((s + 1) / (i + 1) * (eta ** i)))
        r_i = R * (eta ** (-i))
        schedule.append([n_i, r_i])
    return schedule`,
    testCases: [
      { input: [81, 3, 2], expected: [[3, 81], [5, 27.0], [9, 9.0]] },
      { input: [16, 2, 3], expected: [[4, 16], [4, 8.0], [6, 4.0], [8, 2.0]] },
      { input: [10, 2, 0], expected: [[1, 10]] },
    ],
    hint: "Early rounds run many configurations briefly; later rounds run few for long.",
  },
  {
    id: "rl-119",
    title: "Bayesian Regret Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the cumulative pseudo-regret of a bandit algorithm.\n\nFor each arm add counts[a] * (max(means) - means[a]), the expected loss from pulling suboptimal arms. Return the total.",
    starterCode: `def bayesian_regret_lite(means, counts):
    # Your code here
    pass`,
    solution: `def bayesian_regret_lite(means, counts):
    best = max(means)
    total = 0.0
    for i in range(len(means)):
        total += counts[i] * (best - means[i])
    return total`,
    testCases: [
      { input: [[0.2, 0.5], [10, 5]], expected: 3.0 },
      { input: [[0.1, 0.4, 0.6], [3, 4, 5]], expected: 2.3 },
      { input: [[1.0], [7]], expected: 0.0 },
    ],
    hint: "Only pulls of suboptimal arms contribute to regret.",
  },
  {
    id: "rl-120",
    title: "Contextual Bandit Linear Payoff",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the predicted payoff of a contextual bandit as the dot product theta . x.",
    starterCode: `def linear_payoff(theta, x):
    # Your code here
    pass`,
    solution: `def linear_payoff(theta, x):
    return sum(t * v for t, v in zip(theta, x))`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 4.0]], expected: 11.0 },
      { input: [[0.0, 0.0], [5.0, 6.0]], expected: 0.0 },
      { input: [[-1.0, 1.0], [2.0, 2.0]], expected: 0.0 },
      { input: [[0.5], [4.0]], expected: 2.0 },
    ],
    hint: "This is the expected reward of an action under a linear reward model.",
  },
  {
    id: "rl-121",
    title: "LinUCB Selection",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the LinUCB score theta . x + alpha * sqrt(x^T A^{-1} x) for a two-dimensional arm.\n\nA is the 2x2 covariance matrix and theta is the estimated coefficient vector. Return the score; the caller selects the arm with the largest score.",
    starterCode: `import math
def linucb_select(theta, A, x, alpha):
    # Your code here
    pass`,
    solution: `import math
def linucb_select(theta, A, x, alpha):
    det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]]
    quad = 0.0
    for i in range(2):
        for j in range(2):
            quad += x[i] * inv[i][j] * x[j]
    return theta[0] * x[0] + theta[1] * x[1] + alpha * math.sqrt(quad)`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0, 0.0], [0.0, 1.0]], [1.0, 1.0], 0.5], expected: 3.7071067811865475 },
      { input: [[0.0, 0.0], [[2.0, 0.0], [0.0, 2.0]], [1.0, 1.0], 1.0], expected: 1.0 },
      { input: [[1.0, -1.0], [[1.0, 0.5], [0.5, 1.0]], [2.0, 0.0], 0.0], expected: 2.0 },
      { input: [[0.5, 0.5], [[4.0, 2.0], [2.0, 3.0]], [1.0, 2.0], 2.0], expected: 3.845207879911715 },
    ],
    hint: "The exploration term is the Mahalanobis norm of the context under A inverse.",
  },
  {
    id: "rl-122",
    title: "Thompson Linear Posterior",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Update a scalar Bayesian linear regression posterior after observing xs and ys.\n\npost_precision = prior_precision + sum(x^2) / obs_var and post_mean = (prior_precision * prior_mean + sum(x * y) / obs_var) / post_precision. Return [post_mean, post_precision]; with no data return the prior.",
    starterCode: `def thompson_linear_posterior(prior_mean, prior_precision, xs, ys, obs_var):
    # Your code here
    pass`,
    solution: `def thompson_linear_posterior(prior_mean, prior_precision, xs, ys, obs_var):
    if not xs:
        return [prior_mean, prior_precision]
    sum_x2 = sum(x * x for x in xs)
    sum_xy = sum(x * y for x, y in zip(xs, ys))
    post_precision = prior_precision + sum_x2 / obs_var
    post_mean = (prior_precision * prior_mean + sum_xy / obs_var) / post_precision
    return [post_mean, post_precision]`,
    testCases: [
      { input: [0.0, 1.0, [1.0, 2.0, 3.0], [1.0, 2.0, 3.0], 1.0], expected: [0.9333333333333333, 15.0] },
      { input: [0.0, 1.0, [1.0], [2.0], 2.0], expected: [0.6666666666666666, 1.5] },
      { input: [2.0, 0.5, [], [], 0.5], expected: [2.0, 0.5] },
      { input: [2.0, 0.5, [1.0, -1.0, 2.0], [3.0, -3.0, 6.0], 0.5], expected: [2.96, 12.5] },
    ],
    hint: "Precision adds; the posterior mean is the precision-weighted average of prior and data.",
  },
  {
    id: "rl-123",
    title: "Exploration Temperature Decay",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Decay an exploration temperature geometrically and floor it at min_temp.\n\nReturn max(min_temp, start * decay^step).",
    starterCode: `def temperature_decay(step, start, decay, min_temp):
    # Your code here
    pass`,
    solution: `def temperature_decay(step, start, decay, min_temp):
    value = start * (decay ** step)
    return max(min_temp, value)`,
    testCases: [
      { input: [0, 1.0, 0.9, 0.1], expected: 1.0 },
      { input: [5, 1.0, 0.9, 0.1], expected: 0.5904900000000001 },
      { input: [20, 1.0, 0.9, 0.1], expected: 0.12157665459056935 },
      { input: [100, 1.0, 0.9, 0.1], expected: 0.1 },
    ],
    hint: "The floor keeps some exploration alive no matter how long training runs.",
  },
  {
    id: "rl-124",
    title: "Intrinsic Reward Running Average",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Update running statistics of intrinsic rewards with Welford's method and return the normalized reward.\n\nGiven the mean, m2, and count before the reward, compute the new mean and m2, take std = sqrt(m2 / count), and normalize as reward / (1 + std). Return [normalized, new_mean, new_m2, count + 1].",
    starterCode: `import math
def intrinsic_reward_update(mean, m2, count, reward):
    # Your code here
    pass`,
    solution: `import math
def intrinsic_reward_update(mean, m2, count, reward):
    count_new = count + 1
    delta = reward - mean
    mean_new = mean + delta / count_new
    m2_new = m2 + delta * (reward - mean_new)
    std = math.sqrt(m2_new / count_new)
    normalized = reward / (1.0 + std)
    return [normalized, mean_new, m2_new, count_new]`,
    testCases: [
      { input: [0.0, 0.0, 0, 5.0], expected: [5.0, 5.0, 0.0, 1] },
      { input: [5.0, 0.0, 1, 3.0], expected: [1.5, 4.0, 2.0, 2] },
      { input: [4.0, 2.0, 2, 7.0], expected: [2.658571279792899, 5.0, 8.0, 3] },
      { input: [2.0, 1.0, 3, 2.0], expected: [1.3333333333333333, 2.0, 1.0, 4] },
    ],
    hint: "Normalizing by the running standard deviation keeps intrinsic rewards at a stable scale.",
  },
  {
    id: "rl-125",
    title: "Episodic Novelty Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how often a state was visited in the current episode and derive a novelty bonus.\n\nReturn [count, 1 / (1 + count)], where count is the number of occurrences of state in visits.",
    starterCode: `def episodic_novelty_count(visits, state):
    # Your code here
    pass`,
    solution: `def episodic_novelty_count(visits, state):
    c = 0
    for v in visits:
        if v == state:
            c += 1
    bonus = 1.0 / (1.0 + c)
    return [c, bonus]`,
    testCases: [
      { input: [["s0", "s1", "s0"], "s0"], expected: [2, 0.3333333333333333] },
      { input: [[], "s0"], expected: [0, 1.0] },
      { input: [["a"], "b"], expected: [0, 1.0] },
      { input: [["x", "x", "x", "x"], "x"], expected: [4, 0.2] },
    ],
    hint: "The count resets every episode, so novelty returns after a reset.",
  },
  {
    id: "rl-126",
    title: "RND Predictor Error",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the relative RND predictor error ||predicted - target|| / (||target|| + epsilon). An all-zero target with a nonzero prediction yields a large finite value thanks to epsilon.",
    starterCode: `import math
def rnd_predictor_error(predicted, target, epsilon=1e-8):
    # Your code here
    pass`,
    solution: `import math
def rnd_predictor_error(predicted, target, epsilon=1e-8):
    diff = math.sqrt(sum((p - t) ** 2 for p, t in zip(predicted, target)))
    norm = math.sqrt(sum(t * t for t in target))
    return diff / (norm + epsilon)`,
    testCases: [
      { input: [[1.0, 1.0], [1.0, 1.0]], expected: 0.0 },
      { input: [[0.0, 0.0], [3.0, 4.0]], expected: 0.9999999980000001 },
      { input: [[1.0, 2.0], [2.0, 2.0]], expected: 0.35355338934327374 },
      { input: [[2.0, 0.0], [0.0, 1.0]], expected: 2.2360679551391103 },
    ],
    hint: "Dividing by the target norm makes the error scale-free.",
  },
  {
    id: "rl-127",
    title: "Reward-Free Exploration Count",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Choose the least-visited state for reward-free exploration.\n\nReturn the index with the smallest visit count, breaking ties toward the smallest index. An empty list returns -1.",
    starterCode: `def reward_free_exploration_count(visit_counts):
    # Your code here
    pass`,
    solution: `def reward_free_exploration_count(visit_counts):
    if not visit_counts:
        return -1
    best = 0
    for i in range(1, len(visit_counts)):
        if visit_counts[i] < visit_counts[best]:
            best = i
    return best`,
    testCases: [
      { input: [[3, 1, 2]], expected: 1 },
      { input: [[5, 5, 5]], expected: 0 },
      { input: [[2, 0, 1, 0]], expected: 1 },
      { input: [[]], expected: -1 },
    ],
    hint: "A strict less-than comparison makes the first minimum win ties.",
  },
  {
    id: "rl-128",
    title: "Goal-Conditioned Distance",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the Euclidean distance between a state and a goal vector. Return the square root of the sum of squared differences.",
    starterCode: `import math
def goal_conditioned_distance(state, goal):
    # Your code here
    pass`,
    solution: `import math
def goal_conditioned_distance(state, goal):
    total = 0.0
    for s, g in zip(state, goal):
        total += (s - g) ** 2
    return math.sqrt(total)`,
    testCases: [
      { input: [[0.0, 0.0], [3.0, 4.0]], expected: 5.0 },
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[-1.0, -1.0], [2.0, 3.0]], expected: 5.0 },
      { input: [[1.0, 1.0, 1.0], [1.0, 1.0, 1.0]], expected: 0.0 },
    ],
    hint: "Goal-conditioned rewards are often the negative of this distance.",
  },
  {
    id: "rl-129",
    title: "Potential Shaping Reward",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the potential-based shaping reward F(s, s') = gamma * phi(s') - phi(s). This form provably leaves the optimal policy unchanged.",
    starterCode: `def potential_shaping_reward(phi_s, phi_s_next, gamma):
    # Your code here
    pass`,
    solution: `def potential_shaping_reward(phi_s, phi_s_next, gamma):
    return gamma * phi_s_next - phi_s`,
    testCases: [
      { input: [1.0, 2.0, 0.9], expected: 0.8 },
      { input: [0.0, 0.0, 0.9], expected: 0.0 },
      { input: [5.0, 1.0, 0.5], expected: -4.5 },
      { input: [-2.0, 3.0, 1.0], expected: 5.0 },
    ],
    hint: "Any shaping shaped like a discounted potential difference preserves optimal policies.",
  },
  {
    id: "rl-130",
    title: "Action Masking Apply",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Mask invalid actions by replacing their Q values with a large negative constant.\n\nvalid is a boolean list; invalid entries become -1e9 and valid entries keep their Q value.",
    starterCode: `def apply_action_mask(q_values, valid):
    # Your code here
    pass`,
    solution: `def apply_action_mask(q_values, valid):
    return [q if valid[i] else -1000000000.0 for i, q in enumerate(q_values)]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [true, false, true]], expected: [1.0, -1000000000.0, 3.0] },
      { input: [[], []], expected: [] },
      { input: [[0.5], [false]], expected: [-1000000000.0] },
    ],
    hint: "The negative constant is finite so it stays JSON- and gradient-friendly.",
  },
  {
    id: "rl-131",
    title: "Invalid Action Penalty",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Penalize an action that is not in the valid action list.\n\nReturn reward if action is valid, otherwise reward - penalty.",
    starterCode: `def invalid_action_penalty(reward, action, valid_actions, penalty):
    # Your code here
    pass`,
    solution: `def invalid_action_penalty(reward, action, valid_actions, penalty):
    if action in valid_actions:
        return reward
    return reward - penalty`,
    testCases: [
      { input: [1.0, 2, [0, 1, 2], 5.0], expected: 1.0 },
      { input: [1.0, 3, [0, 1, 2], 5.0], expected: -4.0 },
      { input: [0.0, 0, [], 2.0], expected: -2.0 },
      { input: [-1.0, 1, [1], 0.5], expected: -1.0 },
    ],
    hint: "This is a soft alternative to hard action masking.",
  },
  {
    id: "rl-132",
    title: "Safe RL Constraint Check",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Check whether the total constraint cost stays within budget.\n\nReturn True when sum(costs) <= budget, and False otherwise.",
    starterCode: `def safe_rl_constraint_satisfied(costs, budget):
    # Your code here
    pass`,
    solution: `def safe_rl_constraint_satisfied(costs, budget):
    total = 0.0
    for c in costs:
        total += c
    return total <= budget`,
    testCases: [
      { input: [[0.1, 0.2], 0.5], expected: true },
      { input: [[1.0, 2.0, 3.0], 5.0], expected: false },
      { input: [[], 0.0], expected: true },
      { input: [[0.5, 0.5], 1.0], expected: true },
    ],
    hint: "The budget is inclusive: spending exactly the budget is safe.",
  },
  {
    id: "rl-133",
    title: "Lagrangian Penalty Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Take one dual ascent step on the Lagrange multiplier.\n\nReturn max(0, lambda + lr * (cost - limit)) so the multiplier grows only while the constraint is violated.",
    starterCode: `def lagrangian_penalty_update(lambda_, cost, limit, lr):
    # Your code here
    pass`,
    solution: `def lagrangian_penalty_update(lambda_, cost, limit, lr):
    return max(0.0, lambda_ + lr * (cost - limit))`,
    testCases: [
      { input: [0.0, 2.0, 1.0, 0.5], expected: 0.5 },
      { input: [1.0, 0.0, 1.0, 0.5], expected: 0.5 },
      { input: [0.5, 1.0, 1.0, 1.0], expected: 0.5 },
      { input: [0.0, 0.0, 1.0, 2.0], expected: 0.0 },
    ],
    hint: "The projection onto the non-negative orthant keeps the multiplier valid.",
  },
  {
    id: "rl-134",
    title: "CMDP Dual Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one constrained MDP dual step and return the penalized reward plus the new multiplier.\n\npenalized = reward - lambda * cost and new_lambda = max(0, lambda + lr * (cost - limit)). Return [penalized, new_lambda].",
    starterCode: `def cmdp_dual_step(reward, cost, lambda_, limit, lr):
    # Your code here
    pass`,
    solution: `def cmdp_dual_step(reward, cost, lambda_, limit, lr):
    penalized = reward - lambda_ * cost
    new_lambda = max(0.0, lambda_ + lr * (cost - limit))
    return [penalized, new_lambda]`,
    testCases: [
      { input: [1.0, 2.0, 0.5, 1.0, 0.1], expected: [0.0, 0.6] },
      { input: [2.0, 0.0, 1.0, 0.5, 0.5], expected: [2.0, 0.75] },
      { input: [-1.0, 3.0, 0.0, 2.0, 0.2], expected: [-1.0, 0.2] },
      { input: [0.0, 0.0, 2.0, 1.0, 1.0], expected: [0.0, 1.0] },
    ],
    hint: "The current multiplier penalizes the reward before the dual update.",
  },
  {
    id: "rl-135",
    title: "CVaR Return",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the conditional value at risk of a return distribution at level alpha.\n\nSort the returns and average the worst ceil(alpha * n) of them, using at least one return. An empty list returns 0.0.",
    starterCode: `import math
def cvar_return(returns, alpha):
    # Your code here
    pass`,
    solution: `import math
def cvar_return(returns, alpha):
    if not returns:
        return 0.0
    sorted_r = sorted(returns)
    k = max(1, int(math.ceil(alpha * len(returns))))
    return sum(sorted_r[:k]) / k`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], 0.5], expected: 1.5 },
      { input: [[5.0], 0.1], expected: 5.0 },
      { input: [[], 0.5], expected: 0.0 },
      { input: [[-2.0, 1.0, 3.0, 10.0, 7.0], 0.4], expected: -0.5 },
    ],
    hint: "CVaR averages the tail, not the threshold, so it is a coherent risk measure.",
  },
];
