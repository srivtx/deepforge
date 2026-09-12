import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-226",
    title: "Dataset Return Distribution Stats",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Summarize a dataset of episode returns.\n\nReturn [mean, population_std, min, max] using division by n for the standard deviation. An empty dataset returns four zeros.",
    starterCode: `import math
def return_distribution_stats(returns):
    # Your code here
    pass`,
    solution: `import math
def return_distribution_stats(returns):
    n = len(returns)
    if n == 0:
        return [0.0, 0.0, 0.0, 0.0]
    mean = sum(returns) / n
    var = sum((r - mean) ** 2 for r in returns) / n
    return [mean, math.sqrt(var), min(returns), max(returns)]`,
    testCases: [
      { input: [[1, 2, 3, 4]], expected: [2.5, 1.118033988749895, 1, 4] },
      { input: [[5.0]], expected: [5.0, 0.0, 5.0, 5.0] },
      { input: [[]], expected: [0.0, 0.0, 0.0, 0.0] },
      { input: [[-1, 0, 1]], expected: [0.0, 0.816496580927726, -1, 1] },
    ],
    hint: "Distribution stats tell you how much the offline dataset explores high-return behavior.",
  },
  {
    id: "rl-227",
    title: "Behavior Policy Estimate",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Estimate the behavior policy from action counts.\n\nReturn counts[a] / total for each action. If all counts are zero return zeros, and an empty list returns [].",
    starterCode: `def behavior_policy_estimate(action_counts):
    # Your code here
    pass`,
    solution: `def behavior_policy_estimate(action_counts):
    total = sum(action_counts)
    if total == 0:
        return [0.0 for _ in action_counts]
    return [c / total for c in action_counts]`,
    testCases: [
      { input: [[3, 1]], expected: [0.75, 0.25] },
      { input: [[0, 0]], expected: [0.0, 0.0] },
      { input: [[2, 2, 2, 2]], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [[]], expected: [] },
    ],
    hint: "Offline methods often need the behavior propensity of each logged action.",
  },
  {
    id: "rl-228",
    title: "FQE Estimate Lite",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute a fitted Q evaluation estimate with importance weights.\n\nFor each transition weight the Q value of the taken action by target_probs[i][a] / behavior_probs[i][a] and return the mean over the batch. An empty batch returns 0.0.",
    starterCode: `def fqe_estimate_lite(q_values, target_probs, behavior_probs, actions):
    # Your code here
    pass`,
    solution: `def fqe_estimate_lite(q_values, target_probs, behavior_probs, actions):
    n = len(q_values)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        ratio = target_probs[i][actions[i]] / behavior_probs[i][actions[i]]
        total += ratio * q_values[i][actions[i]]
    return total / n`,
    testCases: [
      { input: [[[2.0, 4.0], [3.0, 1.0]], [[0.5, 0.5], [0.5, 0.5]], [[0.25, 0.75], [0.5, 0.5]], [0, 1]], expected: 2.5 },
      { input: [[[2.0, 4.0]], [[0.25, 0.75]], [[0.5, 0.5]], [1]], expected: 6.0 },
      { input: [[], [], [], []], expected: 0.0 },
    ],
    hint: "FQE reweights logged actions toward the target policy before averaging values.",
  },
  {
    id: "rl-229",
    title: "Rollout Quality Metric",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a normalized rollout quality score: mean(returns) / optimal_return. An empty rollout or a zero optimal return gives 0.0.",
    starterCode: `def rollout_quality_metric(returns, optimal_return):
    # Your code here
    pass`,
    solution: `def rollout_quality_metric(returns, optimal_return):
    if not returns or optimal_return == 0.0:
        return 0.0
    return (sum(returns) / len(returns)) / optimal_return`,
    testCases: [
      { input: [[5.0, 10.0], 10.0], expected: 0.75 },
      { input: [[2.0], 10.0], expected: 0.2 },
      { input: [[1.0], 0.0], expected: 0.0 },
      { input: [[], 10.0], expected: 0.0 },
    ],
    hint: "Normalizing by the optimal return makes scores comparable across tasks.",
  },
  {
    id: "rl-230",
    title: "Safety Cost Budget",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Summarize safety cost usage: return [total_cost, remaining_budget, within_budget], where remaining = budget - total_cost and within_budget is True when remaining >= 0.",
    starterCode: `def safety_cost_budget(costs, budget):
    # Your code here
    pass`,
    solution: `def safety_cost_budget(costs, budget):
    total = 0.0
    for c in costs:
        total += c
    remaining = budget - total
    return [total, remaining, remaining >= 0.0]`,
    testCases: [
      { input: [[0.1, 0.2, 0.3], 1.0], expected: [0.6000000000000001, 0.3999999999999999, true] },
      { input: [[2.0, 3.0], 4.0], expected: [5.0, -1.0, false] },
      { input: [[], 1.0], expected: [0.0, 1.0, true] },
    ],
    hint: "Negative remaining budget means the policy violated its cost constraint.",
  },
  {
    id: "rl-231",
    title: "Constrained Policy Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply a Lagrangian penalty to advantages: A_pen[a] = advantages[a] - lambda * cost_advantages[a]. Return the penalized advantage list.",
    starterCode: `def constrained_advantage_update(advantages, cost_advantages, lambda_):
    # Your code here
    pass`,
    solution: `def constrained_advantage_update(advantages, cost_advantages, lambda_):
    return [advantages[i] - lambda_ * cost_advantages[i] for i in range(len(advantages))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, 1.0], 1.0], expected: [0.5, 1.0] },
      { input: [[0.0], [2.0], 0.5], expected: [-1.0] },
      { input: [[], [], 1.0], expected: [] },
    ],
    hint: "The multiplier trades reward against constraint violation.",
  },
  {
    id: "rl-232",
    title: "Ensemble Critic Variance",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the per-action variance of Q values across an ensemble.\n\npredictions[m][a] is action a's value from ensemble member m; return the population variance across members for each action. An empty ensemble returns [].",
    starterCode: `def ensemble_critic_variance(predictions):
    # Your code here
    pass`,
    solution: `def ensemble_critic_variance(predictions):
    if not predictions:
        return []
    n_members = len(predictions)
    n_actions = len(predictions[0])
    out = []
    for a in range(n_actions):
        mean = 0.0
        for m in range(n_members):
            mean += predictions[m][a]
        mean /= n_members
        var = 0.0
        for m in range(n_members):
            var += (predictions[m][a] - mean) ** 2
        out.append(var / n_members)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 2.0]]], expected: [1.0, 0.0] },
      { input: [[[1.0], [2.0], [3.0]]], expected: [0.6666666666666666] },
      { input: [[]], expected: [] },
    ],
    hint: "Disagreement across independent critics is a cheap uncertainty signal.",
  },
  {
    id: "rl-233",
    title: "Uncertainty Penalty Coefficient",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Penalize optimistic Q values by uncertainty: return mean_q[a] - beta * std_q[a] for each action.",
    starterCode: `def uncertainty_penalty(mean_q, std_q, beta):
    # Your code here
    pass`,
    solution: `def uncertainty_penalty(mean_q, std_q, beta):
    return [mean_q[i] - beta * std_q[i] for i in range(len(mean_q))]`,
    testCases: [
      { input: [[5.0, 4.0], [1.0, 2.0], 0.5], expected: [4.5, 3.0] },
      { input: [[0.0], [3.0], 1.0], expected: [-3.0] },
      { input: [[1.0, 2.0], [0.0, 0.0], 2.0], expected: [1.0, 2.0] },
    ],
    hint: "Subtracting beta times the standard deviation yields pessimistic value estimates.",
  },
  {
    id: "rl-234",
    title: "Exploration Bonus Schedule",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Cosine-anneal an exploration bonus from beta_start down to beta_min.\n\nReturn beta_min + 0.5 * (beta_start - beta_min) * (1 + cos(pi * t / total_steps)). If total_steps is not positive or t is at least total_steps, return beta_min.",
    starterCode: `import math
def exploration_bonus_schedule(t, total_steps, beta_start, beta_min):
    # Your code here
    pass`,
    solution: `import math
def exploration_bonus_schedule(t, total_steps, beta_start, beta_min):
    if total_steps <= 0 or t >= total_steps:
        return beta_min
    phase = math.pi * t / total_steps
    return beta_min + 0.5 * (beta_start - beta_min) * (1.0 + math.cos(phase))`,
    testCases: [
      { input: [0, 100, 1.0, 0.0], expected: 1.0 },
      { input: [50, 100, 1.0, 0.0], expected: 0.5 },
      { input: [100, 100, 1.0, 0.0], expected: 0.0 },
      { input: [150, 100, 2.0, 0.5], expected: 0.5 },
    ],
    hint: "Cosine annealing starts slow, decays quickly in the middle, then eases out.",
  },
  {
    id: "rl-235",
    title: "Curriculum Stage Promotion",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Promote a curriculum stage when the success streak reaches the requirement: return stage + 1 if success_streak >= required_streak and stage < max_stage, otherwise return stage.",
    starterCode: `def curriculum_stage_promotion(stage, success_streak, required_streak, max_stage):
    # Your code here
    pass`,
    solution: `def curriculum_stage_promotion(stage, success_streak, required_streak, max_stage):
    if success_streak >= required_streak and stage < max_stage:
        return stage + 1
    return stage`,
    testCases: [
      { input: [2, 5, 5, 10], expected: 3 },
      { input: [10, 5, 5, 10], expected: 10 },
      { input: [0, 3, 5, 10], expected: 0 },
    ],
    hint: "Requiring a streak prevents promotion from a lucky episode.",
  },
  {
    id: "rl-236",
    title: "Observation Scaling",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Map observations from their raw range into [0, 1]: (x - low[i]) / (high[i] - low[i]) elementwise.",
    starterCode: `def observation_scaling(observation, low, high):
    # Your code here
    pass`,
    solution: `def observation_scaling(observation, low, high):
    return [(x - low[i]) / (high[i] - low[i]) for i, x in enumerate(observation)]`,
    testCases: [
      { input: [[5.0, 0.0], [0.0, 0.0], [10.0, 10.0]], expected: [0.5, 0.0] },
      { input: [[10.0, 10.0], [0.0, 0.0], [10.0, 10.0]], expected: [1.0, 1.0] },
      { input: [[2.0], [1.0], [5.0]], expected: [0.25] },
    ],
    hint: "Bounded observations stabilize neural network training.",
  },
  {
    id: "rl-237",
    title: "Action Normalization",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Normalize a continuous action from [low, high] into [-1, 1]: 2 * (action - low) / (high - low) - 1.",
    starterCode: `def action_normalization(action, low, high):
    # Your code here
    pass`,
    solution: `def action_normalization(action, low, high):
    return 2.0 * (action - low) / (high - low) - 1.0`,
    testCases: [
      { input: [0.0, -1.0, 1.0], expected: 0.0 },
      { input: [1.0, -1.0, 1.0], expected: 1.0 },
      { input: [-1.0, -1.0, 1.0], expected: -1.0 },
      { input: [2.5, 0.0, 5.0], expected: 0.0 },
    ],
    hint: "The normalized action is what tanh-squashed policies output.",
  },
  {
    id: "rl-238",
    title: "Episodic Life Tracking",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Track remaining lives after a sequence of damage events, clamping at zero: max(0, initial_lives - sum(damage_events)).",
    starterCode: `def episodic_life_tracking(initial_lives, damage_events):
    # Your code here
    pass`,
    solution: `def episodic_life_tracking(initial_lives, damage_events):
    lives = initial_lives - sum(damage_events)
    if lives < 0:
        lives = 0
    return lives`,
    testCases: [
      { input: [3, [1, 1]], expected: 1 },
      { input: [3, [1, 1, 1, 1]], expected: 0 },
      { input: [5, []], expected: 5 },
    ],
    hint: "Lives never go negative even if more damage events are logged than lives remain.",
  },
  {
    id: "rl-239",
    title: "Sample Efficiency AUC",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the area under a learning curve with the trapezoid rule.\n\nsteps and rewards give the curve at checkpoints; sum 0.5 * (r_i + r_{i+1}) * (steps_{i+1} - steps_i). Fewer than two checkpoints returns 0.0.",
    starterCode: `def sample_efficiency_auc(steps, rewards):
    # Your code here
    pass`,
    solution: `def sample_efficiency_auc(steps, rewards):
    n = len(steps)
    if n < 2:
        return 0.0
    area = 0.0
    for i in range(n - 1):
        width = steps[i + 1] - steps[i]
        area += 0.5 * (rewards[i] + rewards[i + 1]) * width
    return area`,
    testCases: [
      { input: [[0, 10, 20], [0.0, 10.0, 20.0]], expected: 200.0 },
      { input: [[0, 5], [2.0, 4.0]], expected: 15.0 },
      { input: [[0], [5.0]], expected: 0.0 },
      { input: [[0, 10, 20], [1.0, 2.0, 3.0]], expected: 40.0 },
    ],
    hint: "The trapezoid rule handles unevenly spaced evaluation checkpoints.",
  },
  {
    id: "rl-240",
    title: "Statistical Significance Bootstrap",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute a seeded bootstrap confidence interval for the mean.\n\nWith rng = random.Random(seed), draw n_resamples bootstrap samples of the same size as scores using rng.randrange(n), average each, sort the means, and return [means[int(0.025 * n_resamples)], means[int(0.975 * n_resamples)]]. An empty input returns [0.0, 0.0].",
    starterCode: `import random
def bootstrap_ci(scores, n_resamples, seed):
    # Your code here
    pass`,
    solution: `import random
def bootstrap_ci(scores, n_resamples, seed):
    n = len(scores)
    if n == 0:
        return [0.0, 0.0]
    rng = random.Random(seed)
    means = []
    for _ in range(n_resamples):
        total = 0.0
        for _ in range(n):
            total += scores[rng.randrange(n)]
        means.append(total / n)
    means.sort()
    lo = means[int(0.025 * n_resamples)]
    hi = means[int(0.975 * n_resamples)]
    return [lo, hi]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 200, 0], expected: [1.8, 4.4] },
      { input: [[0.5, 0.5], 100, 7], expected: [0.5, 0.5] },
      { input: [[], 50, 0], expected: [0.0, 0.0] },
      { input: [[10.0], 50, 42], expected: [10.0, 10.0] },
    ],
    hint: "Bootstrapping builds the sampling distribution of the mean by resampling with replacement.",
  },
  {
    id: "rl-241",
    title: "Effect Size Of Improvement",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute a standardized effect size for an improvement: (mean_new - mean_old) / pooled_std. A zero pooled standard deviation returns 0.0.",
    starterCode: `def effect_size_improvement(mean_new, mean_old, pooled_std):
    # Your code here
    pass`,
    solution: `def effect_size_improvement(mean_new, mean_old, pooled_std):
    if pooled_std == 0.0:
        return 0.0
    return (mean_new - mean_old) / pooled_std`,
    testCases: [
      { input: [10.0, 8.0, 2.0], expected: 1.0 },
      { input: [5.0, 5.0, 3.0], expected: 0.0 },
      { input: [1.0, 0.0, 0.0], expected: 0.0 },
      { input: [0.0, 2.0, 4.0], expected: -0.5 },
    ],
    hint: "Standardizing the gain by the pooled spread makes improvements comparable across benchmarks.",
  },
  {
    id: "rl-242",
    title: "Benchmark Suite Count",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the total number of evaluation runs: sum(suite_sizes) * seeds.",
    starterCode: `def benchmark_suite_count(suite_sizes, seeds):
    # Your code here
    pass`,
    solution: `def benchmark_suite_count(suite_sizes, seeds):
    total = 0
    for s in suite_sizes:
        total += s
    return total * seeds`,
    testCases: [
      { input: [[10, 5, 5], 3], expected: 60 },
      { input: [[7], 1], expected: 7 },
      { input: [[], 10], expected: 0 },
    ],
    hint: "Every task is evaluated once per seed.",
  },
  {
    id: "rl-243",
    title: "Partial-Observability Memory Length",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Find the shortest suffix of the observation history that contains at least distinct_required distinct observations.\n\nScan from the most recent observation backward and return the suffix length; return -1 if even the full history does not contain enough distinct values.",
    starterCode: `def partial_observability_memory_length(observations, distinct_required):
    # Your code here
    pass`,
    solution: `def partial_observability_memory_length(observations, distinct_required):
    seen = set()
    for k in range(1, len(observations) + 1):
        seen.add(observations[-k])
        if len(seen) >= distinct_required:
            return k
    return -1`,
    testCases: [
      { input: [["a", "a", "b"], 2], expected: 2 },
      { input: [["a", "b", "c"], 3], expected: 3 },
      { input: [["a", "a"], 2], expected: -1 },
      { input: [["a", "b", "a"], 1], expected: 1 },
    ],
    hint: "The memory length is the smallest frame stack that reveals enough distinct observations.",
  },
  {
    id: "rl-244",
    title: "Recurrent Policy Hidden State",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Take one GRU hidden-state update.\n\nz = sigmoid(v_h * h + v_x * x), candidate = tanh(w_h * h + w_x * x + bias), and the new hidden state is (1 - z) * h + z * candidate.",
    starterCode: `import math
def gru_hidden_update(h, x, w_h, w_x, v_h, v_x, bias):
    # Your code here
    pass`,
    solution: `import math
def gru_hidden_update(h, x, w_h, w_x, v_h, v_x, bias):
    z = 1.0 / (1.0 + math.exp(-(v_h * h + v_x * x)))
    candidate = math.tanh(w_h * h + w_x * x + bias)
    return (1.0 - z) * h + z * candidate`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], expected: 0.5567699411459397 },
      { input: [0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.1], expected: 0.43822511357700633 },
      { input: [2.0, 0.0, -1.0, 1.0, -1.0, 1.0, -0.5], expected: 1.6439868487073137 },
    ],
    hint: "The update gate decides how much of the candidate state replaces the old one.",
  },
  {
    id: "rl-245",
    title: "Transformer Policy Context",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Count the number of context windows of a given window size with a given overlap.\n\nstride = window - overlap; return 0 for degenerate inputs, 1 when the sequence fits in one window, otherwise ceil((seq_len - window) / stride) + 1.",
    starterCode: `import math
def transformer_context_windows(seq_len, window, overlap):
    # Your code here
    pass`,
    solution: `import math
def transformer_context_windows(seq_len, window, overlap):
    if window <= 0 or seq_len <= 0:
        return 0
    stride = window - overlap
    if stride <= 0:
        return 1
    if seq_len <= window:
        return 1
    return int(math.ceil((seq_len - window) / stride)) + 1`,
    testCases: [
      { input: [100, 20, 0], expected: 5 },
      { input: [100, 20, 10], expected: 9 },
      { input: [15, 20, 0], expected: 1 },
      { input: [21, 20, 10], expected: 2 },
    ],
    hint: "Overlapping windows let the transformer attend across context boundaries.",
  },
  {
    id: "rl-246",
    title: "Decision-Transformer Return Conditioning",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Build return-to-go conditioning tokens for a decision transformer.\n\nAt each step the token is target_return minus the rewards collected so far, so return [target_return, target_return - r_0, target_return - r_0 - r_1, ...].",
    starterCode: `def return_to_go_conditioning(target_return, rewards):
    # Your code here
    pass`,
    solution: `def return_to_go_conditioning(target_return, rewards):
    out = []
    cumulative = 0.0
    for r in rewards:
        out.append(target_return - cumulative)
        cumulative += r
    return out`,
    testCases: [
      { input: [100.0, [10.0, 20.0, 30.0]], expected: [100.0, 90.0, 70.0] },
      { input: [5.0, [1.0, 1.0]], expected: [5.0, 4.0] },
      { input: [10.0, []], expected: [] },
    ],
    hint: "Conditioning on return-to-go lets the transformer ask for higher-return behavior at test time.",
  },
  {
    id: "rl-247",
    title: "Trajectory Transformer Attention",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute softmax attention weights for one query over a list of key vectors.\n\nScores are dot(query, key) / temperature and the softmax uses the max-subtraction trick. Keys is non-empty.",
    starterCode: `import math
def trajectory_transformer_attention(query, keys, temperature):
    # Your code here
    pass`,
    solution: `import math
def trajectory_transformer_attention(query, keys, temperature):
    scores = []
    for k in keys:
        dot = 0.0
        for i in range(len(query)):
            dot += query[i] * k[i]
        scores.append(dot / temperature)
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[1.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], 1.0], expected: [0.7310585786300049, 0.2689414213699951] },
      { input: [[1.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], 1.0], expected: [0.5, 0.5] },
      { input: [[2.0], [[0.0], [1.0]], 1.0], expected: [0.11920292202211755, 0.8807970779778823] },
    ],
    hint: "Low temperature concentrates attention on the most similar key.",
  },
  {
    id: "rl-248",
    title: "In-Context RL Pick",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Pick the action from the demonstration whose state is nearest to the query state (Euclidean distance, ties toward the earlier demonstration). No demonstrations returns -1.",
    starterCode: `def in_context_rl_pick(query_state, demo_states, demo_actions):
    # Your code here
    pass`,
    solution: `def in_context_rl_pick(query_state, demo_states, demo_actions):
    if not demo_states:
        return -1
    best = 0
    best_d = float('inf')
    for i in range(len(demo_states)):
        d = 0.0
        for a, b in zip(query_state, demo_states[i]):
            d += (a - b) ** 2
        if d < best_d:
            best_d = d
            best = i
    return demo_actions[best]`,
    testCases: [
      { input: [[1.0, 1.0], [[0.0, 0.0], [1.0, 2.0], [5.0, 5.0]], [0, 1, 2]], expected: 1 },
      { input: [[4.0, 4.0], [[0.0, 0.0], [5.0, 5.0]], [0, 1]], expected: 1 },
      { input: [[1.0], [], []], expected: -1 },
    ],
    hint: "Nearest-neighbor retrieval is the simplest form of in-context decision making.",
  },
  {
    id: "rl-249",
    title: "Language-Conditioned Reward",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a language-conditioned reward as the cosine similarity between the language embedding and the state embedding. A zero-norm vector gives 0.0.",
    starterCode: `import math
def language_conditioned_reward(language_embedding, state_embedding):
    # Your code here
    pass`,
    solution: `import math
def language_conditioned_reward(language_embedding, state_embedding):
    dot = sum(a * b for a, b in zip(language_embedding, state_embedding))
    na = math.sqrt(sum(a * a for a in language_embedding))
    nb = math.sqrt(sum(b * b for b in state_embedding))
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (na * nb)`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0]], expected: 1.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 0.0 },
      { input: [[1.0, 1.0], [2.0, 2.0]], expected: 0.9999999999999998 },
      { input: [[0.0, 0.0], [1.0, 0.0]], expected: 0.0 },
    ],
    hint: "Cosine similarity makes the reward scale-free with respect to embedding magnitude.",
  },
  {
    id: "rl-250",
    title: "Goal Image Embedding",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Downsample a flattened goal image by average pooling.\n\nReturn one mean per non-overlapping block of the requested pool size. If pool is not positive or does not divide the length evenly, return [].",
    starterCode: `def goal_image_embedding(pixels, pool):
    # Your code here
    pass`,
    solution: `def goal_image_embedding(pixels, pool):
    n = len(pixels)
    if pool <= 0 or n % pool != 0:
        return []
    out = []
    for i in range(0, n, pool):
        total = 0.0
        for j in range(i, i + pool):
            total += pixels[j]
        out.append(total / pool)
    return out`,
    testCases: [
      { input: [[1.0, 3.0, 5.0, 7.0], 2], expected: [2.0, 6.0] },
      { input: [[1.0, 2.0, 3.0], 1], expected: [1.0, 2.0, 3.0] },
      { input: [[1.0, 2.0, 3.0], 2], expected: [] },
      { input: [[], 2], expected: [] },
    ],
    hint: "Pooling compresses the goal image into an embedding cheap enough to compare online.",
  },
  {
    id: "rl-251",
    title: "HER Future Window",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the inclusive index range of future goals for hindsight relabeling.\n\nThe window starts at max(t + 1, T - horizon) and ends at T - 1. Return [] when the window is empty.",
    starterCode: `def her_future_window(t, T, horizon):
    # Your code here
    pass`,
    solution: `def her_future_window(t, T, horizon):
    start = T - horizon
    if start < t + 1:
        start = t + 1
    end = T - 1
    if start > end:
        return []
    return [start, end]`,
    testCases: [
      { input: [0, 10, 5], expected: [5, 9] },
      { input: [7, 10, 5], expected: [8, 9] },
      { input: [9, 10, 5], expected: [] },
      { input: [4, 5, 10], expected: [] },
    ],
    hint: "The horizon caps how far ahead relabeled goals may come from.",
  },
  {
    id: "rl-252",
    title: "Curriculum Goal Sampling",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Interpolate the goal distance for a curriculum level linearly from min_dist at level 0 to max_dist at max_level. A non-positive max_level returns max_dist.",
    starterCode: `def curriculum_goal_distance(level, max_level, min_dist, max_dist):
    # Your code here
    pass`,
    solution: `def curriculum_goal_distance(level, max_level, min_dist, max_dist):
    if max_level <= 0:
        return max_dist
    frac = level / max_level
    return min_dist + (max_dist - min_dist) * frac`,
    testCases: [
      { input: [0, 10, 1.0, 11.0], expected: 1.0 },
      { input: [10, 10, 1.0, 11.0], expected: 11.0 },
      { input: [5, 10, 1.0, 11.0], expected: 6.0 },
      { input: [0, 0, 1.0, 11.0], expected: 11.0 },
    ],
    hint: "Goal distance grows with the curriculum level so tasks get harder gradually.",
  },
  {
    id: "rl-253",
    title: "Novelty Benchmark",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Measure the fraction of test states that were never visited: count test_states not in visited_states divided by the number of test states. An empty test set returns 0.0.",
    starterCode: `def novelty_benchmark(test_states, visited_states):
    # Your code here
    pass`,
    solution: `def novelty_benchmark(test_states, visited_states):
    if not test_states:
        return 0.0
    visited = set(visited_states)
    novel = 0
    for s in test_states:
        if s not in visited:
            novel += 1
    return novel / len(test_states)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "x"]], expected: 0.6666666666666666 },
      { input: [["a", "b"], ["a", "b"]], expected: 0.0 },
      { input: [[], ["a"]], expected: 0.0 },
    ],
    hint: "A novelty benchmark checks behavior on states the agent has not seen.",
  },
  {
    id: "rl-254",
    title: "Gridworld Eval Protocol",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the success rate over evaluation episodes as the fraction of True results. An empty result list returns 0.0.",
    starterCode: `def gridworld_success_rate(results):
    # Your code here
    pass`,
    solution: `def gridworld_success_rate(results):
    if not results:
        return 0.0
    success = 0
    for r in results:
        if r:
            success += 1
    return success / len(results)`,
    testCases: [
      { input: [[true, true, false, true]], expected: 0.75 },
      { input: [[false, false]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Success rate is the standard headline metric for gridworld navigation.",
  },
  {
    id: "rl-255",
    title: "Deterministic Eval Policy",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the greedy (deterministic) action values used for evaluation: the maximum Q value of every state row.",
    starterCode: `def deterministic_eval_values(Q):
    # Your code here
    pass`,
    solution: `def deterministic_eval_values(Q):
    return [max(row) for row in Q]`,
    testCases: [
      { input: [[[1.0, 3.0, 2.0], [5.0, 5.0, 1.0]]], expected: [3.0, 5.0] },
      { input: [[[-1.0, -2.0]]], expected: [-1.0] },
      { input: [[]], expected: [] },
    ],
    hint: "Evaluation uses argmax actions so results are reproducible across runs.",
  },
  {
    id: "rl-256",
    title: "Evaluation Episode Count",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the number of evaluation episodes needed for a target confidence margin: ceil((z * std / margin)^2). A non-positive margin returns 0.",
    starterCode: `import math
def evaluation_episode_count(std, margin, z):
    # Your code here
    pass`,
    solution: `import math
def evaluation_episode_count(std, margin, z):
    if margin <= 0.0:
        return 0
    return int(math.ceil((z * std / margin) ** 2))`,
    testCases: [
      { input: [2.0, 0.5, 1.96], expected: 62 },
      { input: [1.0, 1.0, 2.0], expected: 4 },
      { input: [0.0, 0.5, 1.96], expected: 0 },
      { input: [2.0, 0.0, 1.96], expected: 0 },
    ],
    hint: "Halving the desired margin quadruples the required episode count.",
  },
  {
    id: "rl-257",
    title: "Train/Eval Seed Separation",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the sorted list of seeds that appear in both the training and evaluation seed sets, exposing accidental reuse. Disjoint sets return [].",
    starterCode: `def seed_overlap(train_seeds, eval_seeds):
    # Your code here
    pass`,
    solution: `def seed_overlap(train_seeds, eval_seeds):
    train = set(train_seeds)
    overlap = []
    for s in eval_seeds:
        if s in train and s not in overlap:
            overlap.append(s)
    return sorted(overlap)`,
    testCases: [
      { input: [[1, 2, 3], [4, 5]], expected: [] },
      { input: [[1, 2, 3], [3, 1, 7]], expected: [1, 3] },
      { input: [[], [1, 2]], expected: [] },
    ],
    hint: "Reusing a training seed at evaluation time silently inflates scores.",
  },
  {
    id: "rl-258",
    title: "Leakage Check",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the test-set leakage fraction: the share of test indices that also appear in the training indices. An empty test set returns 0.0.",
    starterCode: `def dataset_leakage_fraction(train_indices, test_indices):
    # Your code here
    pass`,
    solution: `def dataset_leakage_fraction(train_indices, test_indices):
    if not test_indices:
        return 0.0
    train = set(train_indices)
    leaked = 0
    for i in test_indices:
        if i in train:
            leaked += 1
    return leaked / len(test_indices)`,
    testCases: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: 0.0 },
      { input: [[1, 2, 3, 4], [3, 4, 5, 6]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Any nonzero leakage invalidates held-out evaluation claims.",
  },
  {
    id: "rl-259",
    title: "Replay Buffer Warmup",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how many full batches the replay buffer can already provide: buffer_size - batch_size + 1, floored at 0. A non-positive batch size returns 0.",
    starterCode: `def replay_buffer_warmup(buffer_size, batch_size):
    # Your code here
    pass`,
    solution: `def replay_buffer_warmup(buffer_size, batch_size):
    if batch_size <= 0:
        return 0
    if buffer_size < batch_size:
        return 0
    return buffer_size - batch_size + 1`,
    testCases: [
      { input: [100, 32], expected: 69 },
      { input: [10, 32], expected: 0 },
      { input: [32, 32], expected: 1 },
      { input: [50, 0], expected: 0 },
    ],
    hint: "Learning usually starts only after the buffer holds at least one full batch.",
  },
  {
    id: "rl-260",
    title: "Update-To-Data Ratio",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Check whether the update-to-data ratio matches a target: |gradient_steps / new_samples - target_utd| <= tol. A non-positive sample count returns False.",
    starterCode: `def utd_ratio_check(gradient_steps, new_samples, target_utd, tol):
    # Your code here
    pass`,
    solution: `def utd_ratio_check(gradient_steps, new_samples, target_utd, tol):
    if new_samples <= 0:
        return False
    return abs(gradient_steps / new_samples - target_utd) <= tol`,
    testCases: [
      { input: [20, 10, 2.0, 1e-09], expected: true },
      { input: [20, 10, 3.0, 1e-09], expected: false },
      { input: [5, 0, 1.0, 1e-09], expected: false },
    ],
    hint: "UTD above 1 means the critic is updated more than once per new transition.",
  },
  {
    id: "rl-261",
    title: "Gradient Steps Per Env Step",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the number of gradient steps per environment step: epochs * (buffer_size / batch_size) / env_steps. A non-positive batch size or env step count returns 0.0.",
    starterCode: `def gradient_steps_per_env_step(epochs, buffer_size, batch_size, env_steps):
    # Your code here
    pass`,
    solution: `def gradient_steps_per_env_step(epochs, buffer_size, batch_size, env_steps):
    if batch_size <= 0 or env_steps <= 0:
        return 0.0
    return epochs * (buffer_size / batch_size) / env_steps`,
    testCases: [
      { input: [2, 1000, 100, 100], expected: 0.2 },
      { input: [1, 500, 50, 100], expected: 0.1 },
      { input: [4, 64, 32, 8], expected: 1.0 },
      { input: [1, 100, 0, 10], expected: 0.0 },
    ],
    hint: "This is just the replay ratio expressed through epochs over the buffer.",
  },
  {
    id: "rl-262",
    title: "Target Update Interval",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the next step at which the target network will be synchronized: ((step // interval) + 1) * interval. A non-positive interval returns step unchanged.",
    starterCode: `def next_target_update(step, interval):
    # Your code here
    pass`,
    solution: `def next_target_update(step, interval):
    if interval <= 0:
        return step
    return ((step // interval) + 1) * interval`,
    testCases: [
      { input: [0, 100], expected: 100 },
      { input: [250, 100], expected: 300 },
      { input: [100, 100], expected: 200 },
      { input: [7, 0], expected: 7 },
    ],
    hint: "At an exact multiple, the next sync is one whole interval later.",
  },
  {
    id: "rl-263",
    title: "Epsilon Floor",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Decay epsilon by a multiplicative factor and apply a floor: max(min_epsilon, epsilon * decay).",
    starterCode: `def epsilon_floor(epsilon, decay, min_epsilon):
    # Your code here
    pass`,
    solution: `def epsilon_floor(epsilon, decay, min_epsilon):
    value = epsilon * decay
    return max(min_epsilon, value)`,
    testCases: [
      { input: [0.5, 0.9, 0.05], expected: 0.45 },
      { input: [0.4, 0.1, 0.05], expected: 0.05 },
      { input: [0.05, 1.0, 0.05], expected: 0.05 },
    ],
    hint: "The floor keeps a minimum amount of exploration forever.",
  },
  {
    id: "rl-264",
    title: "Entropy Coefficient Schedule",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Geometrically anneal the entropy coefficient from beta_start to beta_end.\n\nReturn beta_start * (beta_end / beta_start)^(t / total_steps). If total_steps is not positive or t is at least total_steps, return beta_end.",
    starterCode: `import math
def entropy_coefficient_schedule(t, total_steps, beta_start, beta_end):
    # Your code here
    pass`,
    solution: `import math
def entropy_coefficient_schedule(t, total_steps, beta_start, beta_end):
    if total_steps <= 0 or t >= total_steps:
        return beta_end
    frac = t / total_steps
    return beta_start * (beta_end / beta_start) ** frac`,
    testCases: [
      { input: [0, 100, 1.0, 0.01], expected: 1.0 },
      { input: [50, 100, 1.0, 0.01], expected: 0.1 },
      { input: [100, 100, 1.0, 0.01], expected: 0.01 },
      { input: [25, 100, 0.04, 0.01], expected: 0.028284271247461905 },
    ],
    hint: "Geometric decay reduces the entropy bonus by a constant factor per unit of progress.",
  },
  {
    id: "rl-265",
    title: "Reward Clipping",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Clip every reward into [-clip_value, clip_value]. An empty list returns [].",
    starterCode: `def clip_rewards(rewards, clip_value):
    # Your code here
    pass`,
    solution: `def clip_rewards(rewards, clip_value):
    return [max(-clip_value, min(clip_value, r)) for r in rewards]`,
    testCases: [
      { input: [[0.5, 2.0, -3.0], 1.0], expected: [0.5, 1.0, -1.0] },
      { input: [[5.0, -5.0], 2.0], expected: [2.0, -2.0] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Clipping keeps large rewards from dominating the value targets.",
  },
  {
    id: "rl-266",
    title: "Observation Clipping",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Clip each observation element into its own [low[i], high[i]] range and return the new list.",
    starterCode: `def clip_observation(observation, low, high):
    # Your code here
    pass`,
    solution: `def clip_observation(observation, low, high):
    return [max(low[i], min(high[i], x)) for i, x in enumerate(observation)]`,
    testCases: [
      { input: [[5.0, -5.0], [-1.0, -1.0], [1.0, 1.0]], expected: [1.0, -1.0] },
      { input: [[0.5, 0.5], [0.0, 0.0], [1.0, 1.0]], expected: [0.5, 0.5] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "Clipping observations protects against rare out-of-range sensor readings.",
  },
  {
    id: "rl-267",
    title: "Time-Limit Truncation",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Decide how to bootstrap at an episode boundary.\n\nReturn [bootstrap_flag, terminal_flag], where the episode is terminal only when done is true and truncated is false; otherwise bootstrapping is allowed.",
    starterCode: `def time_limit_truncation_bootstrap(done, truncated):
    # Your code here
    pass`,
    solution: `def time_limit_truncation_bootstrap(done, truncated):
    terminal = done and not truncated
    if terminal:
        return [0.0, True]
    return [1.0, False]`,
    testCases: [
      { input: [true, false], expected: [0.0, true] },
      { input: [true, true], expected: [1.0, false] },
      { input: [false, false], expected: [1.0, false] },
      { input: [false, true], expected: [1.0, false] },
    ],
    hint: "A time-limit truncation is not a true terminal state, so the value must bootstrap.",
  },
  {
    id: "rl-268",
    title: "Evaluation Reward Smoothing",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Exponentially smooth evaluation rewards: alpha * new_reward + (1 - alpha) * previous.",
    starterCode: `def evaluation_reward_smoothing(previous, new_reward, alpha):
    # Your code here
    pass`,
    solution: `def evaluation_reward_smoothing(previous, new_reward, alpha):
    return alpha * new_reward + (1.0 - alpha) * previous`,
    testCases: [
      { input: [10.0, 20.0, 0.1], expected: 11.0 },
      { input: [10.0, 20.0, 1.0], expected: 20.0 },
      { input: [10.0, 20.0, 0.0], expected: 10.0 },
    ],
    hint: "Smoothing evaluation curves makes checkpoint rankings less noisy.",
  },
  {
    id: "rl-269",
    title: "Best-Eval Checkpoint Selection",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the step of the checkpoint with the highest evaluation score, breaking ties toward the earliest checkpoint. An empty input returns -1.",
    starterCode: `def best_eval_checkpoint(steps, scores):
    # Your code here
    pass`,
    solution: `def best_eval_checkpoint(steps, scores):
    if not scores:
        return -1
    best = 0
    for i in range(1, len(scores)):
        if scores[i] > scores[best]:
            best = i
    return steps[best]`,
    testCases: [
      { input: [[100, 200, 300], [1.0, 5.0, 3.0]], expected: 200 },
      { input: [[10, 20], [2.0, 2.0]], expected: 10 },
      { input: [[], []], expected: -1 },
    ],
    hint: "The strict comparison keeps the earliest checkpoint when scores tie.",
  },
  {
    id: "rl-270",
    title: "Early Stopping Patience for Policy Evaluation",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Check whether early stopping should trigger.\n\nReturn True when the number of evaluations since the best score is at least patience. An empty history returns False.",
    starterCode: `def early_stopping_patience(scores, patience):
    # Your code here
    pass`,
    solution: `def early_stopping_patience(scores, patience):
    if not scores:
        return False
    best = 0
    for i in range(1, len(scores)):
        if scores[i] > scores[best]:
            best = i
    return (len(scores) - 1 - best) >= patience`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 2.0, 2.0, 2.0], 3], expected: true },
      { input: [[1.0, 3.0, 2.0, 2.0], 3], expected: false },
      { input: [[1.0, 2.0], 0], expected: true },
      { input: [[], 1], expected: false },
    ],
    hint: "Patience counts evaluations without a new best, not total evaluations.",
  },
];
