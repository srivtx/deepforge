import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-046",
    title: "DDPG Actor Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one deterministic policy gradient (DDPG) actor update and return the new parameter list.\n\nparams is the actor parameter vector, policy_grads holds d(mu)/d(theta), q_grad is the critic gradient with respect to the chosen action, and lr is the learning rate. Return params[i] + lr * q_grad * policy_grads[i].",
    starterCode: `def ddpg_actor_update(params, policy_grads, q_grad, lr):
    # Your code here
    pass`,
    solution: `def ddpg_actor_update(params, policy_grads, q_grad, lr):
    return [p + lr * q_grad * g for p, g in zip(params, policy_grads)]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, -1.0], 2.0, 0.1], expected: [1.1, 1.8] },
      { input: [[0.0], [1.0], -3.0, 0.5], expected: [-1.5] },
      { input: [[2.0, 4.0], [1.0, 1.0], 0.0, 0.3], expected: [2.0, 4.0] },
      { input: [[1.0], [2.0], 1.0, -0.1], expected: [0.8] },
    ],
    hint: "The actor ascends the critic's value, so the Q gradient scales the policy gradient.",
  },
  {
    id: "rl-047",
    title: "TD3 Target Smoothing",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Smooth a target action the way TD3 does: add clipped noise and clamp to the valid action range.\n\nClip noise to [-clip_range, clip_range], add it to action, then clamp the result to [low, high]. Return the smoothed action.",
    starterCode: `def td3_smooth_target(action, noise, clip_range, low, high):
    # Your code here
    pass`,
    solution: `def td3_smooth_target(action, noise, clip_range, low, high):
    clipped = max(-clip_range, min(clip_range, noise))
    a = action + clipped
    return max(low, min(high, a))`,
    testCases: [
      { input: [0.5, 0.2, 0.1, -1.0, 1.0], expected: 0.6 },
      { input: [0.5, -0.5, 0.1, -1.0, 1.0], expected: 0.4 },
      { input: [0.95, 0.3, 0.2, -1.0, 1.0], expected: 1.0 },
      { input: [-0.9, -0.3, 0.2, -1.0, 1.0], expected: -1.0 },
    ],
    hint: "Clamp the noise first, then clamp the perturbed action.",
  },
  {
    id: "rl-048",
    title: "SAC Alpha Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the SAC temperature (alpha) loss for a batch of action log-probabilities.\n\nJ(alpha) = -alpha * (mean(log_probs) + target_entropy). An empty batch returns 0.0.",
    starterCode: `def sac_alpha_loss(alpha, log_probs, target_entropy):
    # Your code here
    pass`,
    solution: `def sac_alpha_loss(alpha, log_probs, target_entropy):
    n = len(log_probs)
    if n == 0:
        return 0.0
    mean_lp = sum(log_probs) / n
    return -alpha * (mean_lp + target_entropy)`,
    testCases: [
      { input: [0.2, [-0.5, -1.0], -1.0], expected: 0.35000000000000003 },
      { input: [0.2, [-0.5, -1.0], -2.0], expected: 0.55 },
      { input: [1.0, [-0.3], -1.0], expected: 1.3 },
      { input: [0.0, [-0.5, -1.0], -2.0], expected: 0.0 },
      { input: [0.5, [], -1.0], expected: 0.0 },
    ],
    hint: "The temperature is adjusted so the mean entropy matches the target entropy.",
  },
  {
    id: "rl-049",
    title: "Soft Value Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the soft (log-sum-exp) value of an action-value vector with temperature alpha.\n\nV = alpha * log(sum of exp(Q[a] / alpha)) computed with the max-subtraction trick. If alpha is not positive, return max(Q).",
    starterCode: `import math
def soft_value_update(Q, alpha):
    # Your code here
    pass`,
    solution: `import math
def soft_value_update(Q, alpha):
    m = max(Q)
    if alpha <= 0:
        return m
    total = 0.0
    for q in Q:
        total += math.exp((q - m) / alpha)
    return m + alpha * math.log(total)`,
    testCases: [
      { input: [[0.0, 0.0], 1.0], expected: 0.6931471805599453 },
      { input: [[1.0, 2.0, 3.0], 1.0], expected: 3.4076059644443806 },
      { input: [[0.0, 0.0], 0.5], expected: 0.34657359027997264 },
      { input: [[5.0], 1.0], expected: 5.0 },
      { input: [[1000.0, 1000.0], 1.0], expected: 1000.6931471805599 },
    ],
    hint: "Subtract the max before exponentiating so large values stay stable.",
  },
  {
    id: "rl-050",
    title: "Twin Q Min",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the elementwise minimum of the two critic outputs: min(Q1[a], Q2[a]) for every action a. Empty lists return [].",
    starterCode: `def twin_q_min(Q1, Q2):
    # Your code here
    pass`,
    solution: `def twin_q_min(Q1, Q2):
    return [min(a, b) for a, b in zip(Q1, Q2)]`,
    testCases: [
      { input: [[1.0, 5.0, 3.0], [4.0, 2.0, 3.0]], expected: [1.0, 2.0, 3.0] },
      { input: [[-1.0], [2.0]], expected: [-1.0] },
      { input: [[0.0, 0.0], [0.0, 1.0]], expected: [0.0, 0.0] },
      { input: [[], []], expected: [] },
    ],
    hint: "Taking the minimum of twin critics fights the overestimation bias.",
  },
  {
    id: "rl-051",
    title: "Prioritized IS Weight",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute normalized importance-sampling weights for prioritized experience replay.\n\nraw_i = (1 / (n * probs[i])) ** beta, then divide every raw weight by the largest one so the maximum weight becomes 1.0. Probabilities are positive.",
    starterCode: `def prioritized_is_weight(probs, beta):
    # Your code here
    pass`,
    solution: `def prioritized_is_weight(probs, beta):
    n = len(probs)
    raw = [(1.0 / (n * p)) ** beta for p in probs]
    m = max(raw)
    return [w / m for w in raw]`,
    testCases: [
      { input: [[0.5, 0.5], 0.4], expected: [1.0, 1.0] },
      { input: [[0.25, 0.75], 1.0], expected: [1.0, 0.3333333333333333] },
      { input: [[0.1, 0.2, 0.7], 0.5], expected: [1.0, 0.7071067811865476, 0.37796447300922725] },
      { input: [[1.0], 0.6], expected: [1.0] },
    ],
    hint: "High-priority samples are over-represented, so their updates are down-weighted.",
  },
  {
    id: "rl-052",
    title: "N-Step Window Return",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the discounted return inside a window of an episode.\n\nStarting at index start, sum gamma^k * rewards[start + k] for the first n available rewards, truncating at the end of the episode. Return 0.0 when start is out of range or n is 0.",
    starterCode: `def n_step_window_return(rewards, start, n, gamma):
    # Your code here
    pass`,
    solution: `def n_step_window_return(rewards, start, n, gamma):
    if start < 0 or start >= len(rewards):
        return 0.0
    total = 0.0
    power = 1.0
    end = min(start + n, len(rewards))
    for t in range(start, end):
        total += power * rewards[t]
        power *= gamma
    return total`,
    testCases: [
      { input: [[0.0, 1.0, 2.0, 3.0, 4.0], 1, 3, 0.5], expected: 2.75 },
      { input: [[1.0, 2.0, 3.0], 0, 5, 0.9], expected: 5.23 },
      { input: [[1.0, 2.0], 5, 2, 0.9], expected: 0.0 },
      { input: [[2.0, 4.0], 0, 0, 0.9], expected: 0.0 },
    ],
    hint: "This is the raw n-step reward sum with no bootstrap term.",
  },
  {
    id: "rl-053",
    title: "GAE Full Vector",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the full generalized advantage estimation vector.\n\nWalk backwards with delta_t = rewards[t] + gamma * values[t + 1] - values[t] and A_t = delta_t + gamma * lam * A_{t+1}, where the advantage after the last step is 0. Return the list of advantages.",
    starterCode: `def gae_full(rewards, values, gamma, lam):
    # Your code here
    pass`,
    solution: `def gae_full(rewards, values, gamma, lam):
    n = len(rewards)
    adv = [0.0] * n
    gae = 0.0
    for t in range(n - 1, -1, -1):
        delta = rewards[t] + gamma * values[t + 1] - values[t]
        gae = delta + gamma * lam * gae
        adv[t] = gae
    return adv`,
    testCases: [
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.5], expected: [3.565, 1.7000000000000002] },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 1.0], expected: [4.33, 1.7000000000000002] },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.0], expected: [2.8, 1.7000000000000002] },
      { input: [[0.0, 1.0, 2.0], [0.0, 0.0, 0.0, 0.0], 0.9, 0.9], expected: [2.1222000000000003, 2.62, 2.0] },
    ],
    hint: "values has one more entry than rewards; the recursion runs from the episode end.",
  },
  {
    id: "rl-054",
    title: "PPO Value Clip",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the clipped PPO value-function loss over a batch.\n\nFor each sample clip the new value to [old - clip_eps, old + clip_eps] and take the max of the clipped and unclipped squared errors against the return. Return the mean; an empty batch gives 0.0.",
    starterCode: `def ppo_value_loss(values, old_values, returns, clip_eps):
    # Your code here
    pass`,
    solution: `def ppo_value_loss(values, old_values, returns, clip_eps):
    n = len(values)
    if n == 0:
        return 0.0
    total = 0.0
    for v, old, r in zip(values, old_values, returns):
        clipped = max(old - clip_eps, min(old + clip_eps, v))
        total += max((v - r) ** 2, (clipped - r) ** 2)
    return total / n`,
    testCases: [
      { input: [[2.0], [1.0], [3.0], 0.2], expected: 3.24 },
      { input: [[1.1], [1.0], [1.1], 0.2], expected: 0.0 },
      { input: [[5.0], [1.0], [1.0], 0.5], expected: 16.0 },
      { input: [[2.0, 2.0], [1.0, 1.0], [3.0, 0.0], 0.5], expected: 3.125 },
    ],
    hint: "The pessimistic max keeps the value from moving too far in one update.",
  },
  {
    id: "rl-055",
    title: "KL Early-Stop Check",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Decide whether training should stop early because the policy moved too far, measured by KL(p || q).\n\nCompute KL(p || q) = sum of p * log(p / q), skipping zero probabilities, and return True when it exceeds target_kl.",
    starterCode: `import math
def kl_early_stop(p, q, target_kl):
    # Your code here
    pass`,
    solution: `import math
def kl_early_stop(p, q, target_kl):
    kl = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            kl += pi * math.log(pi / qi)
    return kl > target_kl`,
    testCases: [
      { input: [[0.5, 0.5], [0.5, 0.5], 0.01], expected: false },
      { input: [[0.9, 0.1], [0.5, 0.5], 0.1], expected: true },
      { input: [[1.0, 0.0], [0.5, 0.5], 0.5], expected: true },
      { input: [[0.5, 0.5], [0.5, 0.5], 0.0], expected: false },
    ],
    hint: "The check is strict: a KL exactly equal to target_kl does not trigger a stop.",
  },
  {
    id: "rl-056",
    title: "TRPO CG One Step",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Take one conjugate-gradient step of the TRPO trust-region subproblem, starting from x = 0.\n\nWith r = b - A x = b and p = r, compute Ap, then alpha = (r . r) / (p . Ap) and return x + alpha * p. If p . Ap is zero, return the zero vector.",
    starterCode: `def trpo_cg_step(A, b):
    # Your code here
    pass`,
    solution: `def trpo_cg_step(A, b):
    n = len(b)
    x = [0.0] * n
    r = list(b)
    p = list(r)
    Ap = []
    for i in range(n):
        s = 0.0
        for j in range(n):
            s += A[i][j] * p[j]
        Ap.append(s)
    rr = sum(v * v for v in r)
    pAp = sum(p[i] * Ap[i] for i in range(n))
    if pAp == 0.0:
        return x
    alpha = rr / pAp
    return [x[i] + alpha * p[i] for i in range(n)]`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 1.0]], [2.0, 3.0]], expected: [2.0, 3.0] },
      { input: [[[2.0, 0.0], [0.0, 4.0]], [2.0, 4.0]], expected: [0.5555555555555556, 1.1111111111111112] },
      { input: [[[2.0, 1.0], [1.0, 2.0]], [1.0, 0.0]], expected: [0.5, 0.0] },
      { input: [[[1.0, 0.0], [0.0, 1.0]], [0.0, 0.0]], expected: [0.0, 0.0] },
    ],
    hint: "One CG iteration is exact when b is an eigenvector of A.",
  },
  {
    id: "rl-057",
    title: "Advantage Normalization",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Normalize a batch of advantages by its maximum absolute deviation.\n\nSubtract the mean and divide by the largest |a - mean|. If every centered advantage is zero return zeros; an empty batch returns [].",
    starterCode: `def normalize_advantages_max(advantages):
    # Your code here
    pass`,
    solution: `def normalize_advantages_max(advantages):
    n = len(advantages)
    if n == 0:
        return []
    mean = sum(advantages) / n
    m = max(abs(a - mean) for a in advantages)
    if m == 0.0:
        return [0.0 for _ in advantages]
    return [(a - mean) / m for a in advantages]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [-1.0, 0.0, 1.0] },
      { input: [[0.0, 0.0, 0.0]], expected: [0.0, 0.0, 0.0] },
      { input: [[]], expected: [] },
      { input: [[-2.0, 2.0]], expected: [-1.0, 1.0] },
    ],
    hint: "Centering plus max-abs scaling bounds every normalized advantage in [-1, 1].",
  },
  {
    id: "rl-058",
    title: "Running Stats Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Update running mean and sum of squared deviations with one observation using Welford's method.\n\nGiven mean, m2, and count before the observation, return [new_mean, new_m2, count + 1], where new_mean = mean + delta / (count + 1) and new_m2 = m2 + delta * (x - new_mean) with delta = x - mean.",
    starterCode: `def running_stats_update(mean, m2, count, x):
    # Your code here
    pass`,
    solution: `def running_stats_update(mean, m2, count, x):
    count_new = count + 1
    delta = x - mean
    mean_new = mean + delta / count_new
    m2_new = m2 + delta * (x - mean_new)
    return [mean_new, m2_new, count_new]`,
    testCases: [
      { input: [0.0, 0.0, 0, 5.0], expected: [5.0, 0.0, 1] },
      { input: [5.0, 0.0, 1, 3.0], expected: [4.0, 2.0, 2] },
      { input: [4.0, 2.0, 2, 7.0], expected: [5.0, 8.0, 3] },
      { input: [1.0, 2.0, 2, 1.0], expected: [1.0, 2.0, 3] },
    ],
    hint: "m2 divided by count gives the population variance without a second pass.",
  },
  {
    id: "rl-059",
    title: "Observation Normalization Stats",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute per-feature normalization statistics for a batch of observation vectors.\n\nReturn [means, stds] where each standard deviation uses the population formula (divide by n) plus epsilon to avoid division by zero. An empty batch returns [[], []].",
    starterCode: `def obs_norm_stats(observations, epsilon=1e-8):
    # Your code here
    pass`,
    solution: `def obs_norm_stats(observations, epsilon=1e-8):
    n = len(observations)
    if n == 0:
        return [[], []]
    d = len(observations[0])
    means = []
    stds = []
    for j in range(d):
        col = [o[j] for o in observations]
        m = sum(col) / n
        var = sum((v - m) ** 2 for v in col) / n
        means.append(m)
        stds.append(var ** 0.5 + epsilon)
    return [means, stds]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]], expected: [[3.0, 4.0], [1.632993171855452, 1.632993171855452]] },
      { input: [[[5.0]]], expected: [[5.0], [1e-08]] },
      { input: [[]], expected: [[], []] },
      { input: [[[1.0, 1.0], [1.0, 1.0]]], expected: [[1.0, 1.0], [1e-08, 1e-08]] },
    ],
    hint: "These statistics feed (obs - mean) / std for input normalization.",
  },
  {
    id: "rl-060",
    title: "Reward Scaling",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Scale rewards by a running standard deviation.\n\nReturn rewards[i] / (std + epsilon) so the scaled rewards have roughly unit scale. An empty list returns [].",
    starterCode: `def scale_rewards(rewards, std, epsilon=1e-8):
    # Your code here
    pass`,
    solution: `def scale_rewards(rewards, std, epsilon=1e-8):
    return [r / (std + epsilon) for r in rewards]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0.9999999900000002, 1.9999999800000003, 2.9999999700000006] },
      { input: [[10.0], 0.5], expected: [19.999999600000006] },
      { input: [[-1.0, 1.0], 2.0], expected: [-0.4999999975, 0.4999999975] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "The epsilon keeps the division safe when the running std is near zero.",
  },
  {
    id: "rl-061",
    title: "Frame Stack Shape",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the shape of a stack of k frames stacked along the channel axis.\n\nGiven the height, width, and channels of one frame, return [height, width, channels * k].",
    starterCode: `def frame_stack_shape(height, width, channels, k):
    # Your code here
    pass`,
    solution: `def frame_stack_shape(height, width, channels, k):
    return [height, width, channels * k]`,
    testCases: [
      { input: [84, 84, 1, 4], expected: [84, 84, 4] },
      { input: [32, 32, 3, 2], expected: [32, 32, 6] },
      { input: [10, 20, 4, 1], expected: [10, 20, 4] },
    ],
    hint: "Stacking frames as extra channels is the usual Atari input representation.",
  },
  {
    id: "rl-062",
    title: "Linear Epsilon Schedule",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the epsilon used at step t under a linear decay schedule.\n\nEpsilon decreases linearly from start to end over decay_steps steps and then stays at end. If decay_steps is not positive or t is at least decay_steps, return end.",
    starterCode: `def linear_epsilon(t, start, end, decay_steps):
    # Your code here
    pass`,
    solution: `def linear_epsilon(t, start, end, decay_steps):
    if decay_steps <= 0 or t >= decay_steps:
        return float(end)
    frac = t / decay_steps
    return float(start - (start - end) * frac)`,
    testCases: [
      { input: [0, 1.0, 0.1, 100], expected: 1.0 },
      { input: [50, 1.0, 0.1, 100], expected: 0.55 },
      { input: [100, 1.0, 0.1, 100], expected: 0.1 },
      { input: [200, 1.0, 0.1, 100], expected: 0.1 },
      { input: [30, 0.9, 0.0, 60], expected: 0.45 },
    ],
    hint: "The fraction t / decay_steps is the interpolation weight between start and end.",
  },
  {
    id: "rl-063",
    title: "DQN Target Sync Counter",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Decide whether the DQN target network should be synchronized at this step.\n\nReturn True when step is positive and divisible by sync_every, and False otherwise, including non-positive sync intervals.",
    starterCode: `def should_sync_target(step, sync_every):
    # Your code here
    pass`,
    solution: `def should_sync_target(step, sync_every):
    if sync_every <= 0:
        return False
    return step > 0 and step % sync_every == 0`,
    testCases: [
      { input: [100, 100], expected: true },
      { input: [0, 100], expected: false },
      { input: [250, 100], expected: false },
      { input: [300, 100], expected: true },
      { input: [7, 1], expected: true },
    ],
    hint: "Step 0 is the initial copy, not a hard sync.",
  },
  {
    id: "rl-064",
    title: "Double DQN Bias Check",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Measure how much the standard DQN target overestimates relative to the Double DQN target.\n\nstandard = reward + gamma * max(target_next) and double = reward + gamma * target_next[argmax(online_next)], using the smallest index for ties. Return standard - double.",
    starterCode: `def double_dqn_bias_check(reward, gamma, online_next, target_next):
    # Your code here
    pass`,
    solution: `def double_dqn_bias_check(reward, gamma, online_next, target_next):
    best_a = 0
    for i in range(1, len(online_next)):
        if online_next[i] > online_next[best_a]:
            best_a = i
    standard = reward + gamma * max(target_next)
    double = reward + gamma * target_next[best_a]
    return standard - double`,
    testCases: [
      { input: [1.0, 0.9, [1.0, 3.0, 2.0], [5.0, 1.0, 2.0]], expected: 3.6 },
      { input: [0.0, 0.5, [2.0, 2.0], [3.0, 3.0]], expected: 0.0 },
      { input: [2.0, 1.0, [1.0], [0.0]], expected: 0.0 },
      { input: [-1.0, 0.8, [0.0, 1.0], [2.0, 4.0]], expected: 0.0 },
    ],
    hint: "The gap is positive exactly when the max target action is not the online-greedy action.",
  },
  {
    id: "rl-065",
    title: "Thompson Posterior Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Update a Beta-Bernoulli posterior after observing successes and failures. Return [alpha + successes, beta + failures].",
    starterCode: `def thompson_posterior_update(alpha, beta, successes, failures):
    # Your code here
    pass`,
    solution: `def thompson_posterior_update(alpha, beta, successes, failures):
    return [alpha + successes, beta + failures]`,
    testCases: [
      { input: [1.0, 1.0, 3, 2], expected: [4.0, 3.0] },
      { input: [0.5, 0.5, 0, 0], expected: [0.5, 0.5] },
      { input: [2.0, 5.0, 0, 4], expected: [2.0, 9.0] },
    ],
    hint: "The Beta prior is conjugate to the Bernoulli likelihood, so updating is just counting.",
  },
  {
    id: "rl-066",
    title: "UCB Exploration Bonus",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the UCB exploration bonus c * sqrt(ln(t) / count).\n\ncount is how many times the action has been pulled and t is the total number of pulls so far. A non-positive count returns 0.0 to keep the result finite.",
    starterCode: `import math
def ucb_exploration_bonus(count, t, c):
    # Your code here
    pass`,
    solution: `import math
def ucb_exploration_bonus(count, t, c):
    if count <= 0:
        return 0.0
    return c * math.sqrt(math.log(t) / count)`,
    testCases: [
      { input: [5, 10, 1.0], expected: 0.6786140424415112 },
      { input: [1, 100, 2.0], expected: 4.291932052578694 },
      { input: [0, 10, 1.0], expected: 0.0 },
      { input: [4, 4, 1.0], expected: 0.5887050112577373 },
    ],
    hint: "The bonus shrinks as the action is pulled more often.",
  },
  {
    id: "rl-067",
    title: "Softmax Temperature Policy",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the probability that a softmax policy with the given temperature assigns to one action index.\n\nCompute softmax(logits / temperature) with the max-subtraction trick and return the entry at index. Temperature is positive.",
    starterCode: `import math
def softmax_action_prob(logits, index, temperature):
    # Your code here
    pass`,
    solution: `import math
def softmax_action_prob(logits, index, temperature):
    m = max(logits)
    total = 0.0
    for z in logits:
        total += math.exp((z - m) / temperature)
    return math.exp((logits[index] - m) / temperature) / total`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2, 1.0], expected: 0.6652409557748218 },
      { input: [[0.0, 0.0], 0, 1.0], expected: 0.5 },
      { input: [[0.0, 0.0], 1, 0.5], expected: 0.5 },
      { input: [[5.0, 5.0, 5.0], 0, 2.0], expected: 0.3333333333333333 },
    ],
    hint: "Low temperature sharpens the distribution; high temperature flattens it.",
  },
  {
    id: "rl-068",
    title: "REINFORCE Baseline Advantage",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute return-to-go values with a constant baseline subtracted (the REINFORCE variance-reduction trick).\n\nWalk backwards to build G_t = rewards[t] + gamma * G_{t+1}, subtract baseline from each, and return the list. An empty episode returns [].",
    starterCode: `def reinforce_baseline_advantage(rewards, gamma, baseline):
    # Your code here
    pass`,
    solution: `def reinforce_baseline_advantage(rewards, gamma, baseline):
    n = len(rewards)
    out = [0.0] * n
    g = 0.0
    for t in range(n - 1, -1, -1):
        g = rewards[t] + gamma * g
        out[t] = g - baseline
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.5, 0.0], expected: [2.75, 3.5, 3.0] },
      { input: [[1.0, 2.0, 3.0], 0.5, 3.0], expected: [-0.25, 0.5, 0.0] },
      { input: [[-1.0], 0.9, 0.0], expected: [-1.0] },
      { input: [[], 0.9, 1.0], expected: [] },
    ],
    hint: "The baseline does not change the expected gradient but lowers its variance.",
  },
  {
    id: "rl-069",
    title: "Gradient Variance Estimate",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate the mean and variance of a batch of scalar gradient samples.\n\nReturn [mean, population_variance] using division by n. An empty batch returns [0.0, 0.0].",
    starterCode: `def gradient_variance(grads):
    # Your code here
    pass`,
    solution: `def gradient_variance(grads):
    n = len(grads)
    if n == 0:
        return [0.0, 0.0]
    mean = sum(grads) / n
    var = sum((g - mean) ** 2 for g in grads) / n
    return [mean, var]`,
    testCases: [
      { input: [[1.0, 3.0]], expected: [2.0, 1.0] },
      { input: [[2.0, 2.0, 2.0]], expected: [2.0, 0.0] },
      { input: [[-1.0, 0.0, 1.0]], expected: [0.0, 0.6666666666666666] },
      { input: [[]], expected: [0.0, 0.0] },
    ],
    hint: "This estimates how noisy the policy-gradient estimator is.",
  },
  {
    id: "rl-070",
    title: "First-Visit vs Every-Visit MC",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compare first-visit and every-visit Monte Carlo value estimates for a target state.\n\nFind every index where states equals target and compute the discounted return from each occurrence to the end of the episode. Return [first_visit_return, mean_of_all_visit_returns], or [0.0, 0.0] if the state never occurs.",
    starterCode: `def mc_first_vs_every(states, rewards, target, gamma):
    # Your code here
    pass`,
    solution: `def mc_first_vs_every(states, rewards, target, gamma):
    visits = []
    for i in range(len(states)):
        if states[i] == target:
            visits.append(i)
    if not visits:
        return [0.0, 0.0]
    returns = []
    for v in visits:
        g = 0.0
        power = 1.0
        for t in range(v, len(rewards)):
            g += power * rewards[t]
            power *= gamma
        returns.append(g)
    return [returns[0], sum(returns) / len(returns)]`,
    testCases: [
      { input: [["A", "B", "A"], [1.0, 2.0, 3.0], "A", 0.5], expected: [2.75, 2.875] },
      { input: [["A", "A"], [1.0, 1.0], "A", 1.0], expected: [2.0, 1.5] },
      { input: [["A", "B"], [1.0, 2.0], "C", 0.9], expected: [0.0, 0.0] },
      { input: [["B"], [5.0], "B", 0.9], expected: [5.0, 5.0] },
    ],
    hint: "Every-visit averages over all occurrences while first-visit keeps only the earliest.",
  },
  {
    id: "rl-071",
    title: "Eligibility Trace Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Update an accumulating eligibility trace for one state visit.\n\nDecay every entry by gamma * lam, then add 1.0 to trace[s]. Return the new trace without mutating the input.",
    starterCode: `def eligibility_trace_update(trace, s, gamma, lam):
    # Your code here
    pass`,
    solution: `def eligibility_trace_update(trace, s, gamma, lam):
    new_trace = [e * gamma * lam for e in trace]
    new_trace[s] += 1.0
    return new_trace`,
    testCases: [
      { input: [[0.0, 0.0], 0, 0.9, 0.5], expected: [1.0, 0.0] },
      { input: [[1.0, 0.5], 1, 0.9, 0.5], expected: [0.45, 1.225] },
      { input: [[0.2, 0.4, 0.6], 2, 1.0, 1.0], expected: [0.2, 0.4, 1.6] },
    ],
    hint: "Decay first, then bump the visited state so its trace is exactly 1.",
  },
  {
    id: "rl-072",
    title: "Q(Lambda) Accumulate",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Apply a backward-view Q(lambda) update with accumulating traces.\n\nIncrement trace[s][a] by 1, update every Q[i][j] by alpha * delta * trace[i][j], then decay the trace by gamma * lam. Return [new_Q, new_trace] as deep copies with the decay applied.",
    starterCode: `def q_lambda_accumulate(Q, trace, s, a, delta, alpha, gamma, lam):
    # Your code here
    pass`,
    solution: `def q_lambda_accumulate(Q, trace, s, a, delta, alpha, gamma, lam):
    new_trace = [list(row) for row in trace]
    new_trace[s][a] += 1.0
    new_Q = [[Q[i][j] + alpha * delta * new_trace[i][j] for j in range(len(Q[i]))] for i in range(len(Q))]
    new_trace = [[gamma * lam * e for e in row] for row in new_trace]
    return [new_Q, new_trace]`,
    testCases: [
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], 0, 0, 1.0, 0.1, 0.9, 0.5], expected: [[[0.1, 0.0], [0.0, 0.0]], [[0.45, 0.0], [0.0, 0.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.5, 0.0], [0.0, 0.25]], 1, 1, 2.0, 0.5, 0.5, 0.8], expected: [[[1.5, 2.0], [3.0, 5.25]], [[0.2, 0.0], [0.0, 0.5]]] },
      { input: [[[0.0]], [[0.0]], 0, 0, -1.0, 0.2, 1.0, 0.0], expected: [[[-0.2]], [[0.0]]] },
    ],
    hint: "The returned trace is already decayed, so it is ready for the next update.",
  },
  {
    id: "rl-073",
    title: "SARSA(Lambda) Backward",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Apply one backward-view SARSA(lambda) update with accumulating traces.\n\nFirst compute delta = r + gamma * Q[s_next][a_next] - Q[s][a]. Then increment trace[s][a], update Q by alpha * delta * trace, and decay the trace by gamma * lam. Return [new_Q, new_trace] as deep copies with the decay applied.",
    starterCode: `def sarsa_lambda_backward(Q, trace, s, a, r, s_next, a_next, alpha, gamma, lam):
    # Your code here
    pass`,
    solution: `def sarsa_lambda_backward(Q, trace, s, a, r, s_next, a_next, alpha, gamma, lam):
    delta = r + gamma * Q[s_next][a_next] - Q[s][a]
    new_trace = [list(row) for row in trace]
    new_trace[s][a] += 1.0
    new_Q = [[Q[i][j] + alpha * delta * new_trace[i][j] for j in range(len(Q[i]))] for i in range(len(Q))]
    new_trace = [[gamma * lam * e for e in row] for row in new_trace]
    return [new_Q, new_trace]`,
    testCases: [
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [0.0, 0.0]], 0, 0, 1.0, 1, 1, 0.1, 0.9, 0.5], expected: [[[0.1, 0.0], [0.0, 0.0]], [[0.45, 0.0], [0.0, 0.0]]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0.0, 1.0], [0.0, 0.0]], 0, 1, 0.0, 0, 0, 0.5, 0.5, 0.5], expected: [[[1.0, 0.5], [3.0, 4.0]], [[0.0, 0.5], [0.0, 0.0]]] },
      { input: [[[0.0]], [[0.0]], 0, 0, -2.0, 0, 0, 0.25, 0.9, 0.0], expected: [[[-0.5]], [[0.0]]] },
    ],
    hint: "Unlike Q(lambda), the TD error uses the action actually taken next.",
  },
  {
    id: "rl-074",
    title: "Dyna-Q Planning Update",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Run n Dyna-Q planning updates using a learned model and a seeded random generator.\n\nEach planning step picks a model entry [s, a, r, s_next] uniformly with rng.randrange(len(model)) and applies a Q-learning backup with the current table. Return the updated Q table.",
    starterCode: `import random
def dyna_q_planning(Q, model, n, seed, alpha, gamma):
    # Your code here
    pass`,
    solution: `import random
def dyna_q_planning(Q, model, n, seed, alpha, gamma):
    rng = random.Random(seed)
    new_Q = [list(row) for row in Q]
    for _ in range(n):
        s, a, r, s_next = model[rng.randrange(len(model))]
        best = max(new_Q[s_next])
        new_Q[s][a] += alpha * (r + gamma * best - new_Q[s][a])
    return new_Q`,
    testCases: [
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0, 1, 1.0, 1], [1, 0, 2.0, 0]], 3, 0, 0.5, 0.9], expected: [[0.0, 1.175], [1.5, 0.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], [[0, 0, 1.0, 1]], 2, 7, 0.1, 0.5], expected: [[1.38, 2.0], [3.0, 4.0]] },
      { input: [[[0.0]], [[0, 0, 5.0, 0]], 0, 0, 0.1, 0.9], expected: [[0.0]] },
    ],
    hint: "Planning replays simulated experience from the model with the same backup rule.",
  },
  {
    id: "rl-075",
    title: "Prioritized TD Error",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Convert TD errors into non-negative replay priorities.\n\nEach priority is (|delta| + epsilon) ** alpha, so zero errors still receive a small non-zero priority. Return a list of the same length; an empty input returns [].",
    starterCode: `def prioritized_td_error(td_errors, alpha, epsilon=1e-6):
    # Your code here
    pass`,
    solution: `def prioritized_td_error(td_errors, alpha, epsilon=1e-6):
    return [(abs(d) + epsilon) ** alpha for d in td_errors]`,
    testCases: [
      { input: [[1.0, -2.0], 1.0], expected: [1.000001, 2.000001] },
      { input: [[0.0], 0.5], expected: [0.001] },
      { input: [[], 0.5], expected: [] },
      { input: [[4.0, 9.0], 0.5], expected: [2.0000002499999843, 3.000000166666662] },
    ],
    hint: "High-advantage and high-error transitions get replayed more often.",
  },
  {
    id: "rl-076",
    title: "World-Model Prediction Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Predict the next state with a linear world model: next = W * state + b.\n\nweight is a matrix with one row per output dimension and bias is the matching offset vector. Return the predicted vector.",
    starterCode: `def world_model_step(state, weight, bias):
    # Your code here
    pass`,
    solution: `def world_model_step(state, weight, bias):
    return [sum(weight[i][j] * state[j] for j in range(len(state))) + bias[i] for i in range(len(weight))]`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [1.0, -1.0, 0.0]], expected: [2.0, 1.0, 3.0] },
      { input: [[0.0, 0.0], [[2.0, 3.0]], [5.0]], expected: [5.0] },
      { input: [[1.0], [[1.0], [2.0]], [0.0, 0.0]], expected: [1.0, 2.0] },
    ],
    hint: "This is a one-step matrix-vector prediction with a bias.",
  },
  {
    id: "rl-077",
    title: "Model-Based Value Expansion",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Average the model-based value estimates over horizons 1 through H.\n\nmodel_rewards gives the H imagined rewards and values[k] is the value estimate after k imagined steps. For each horizon k, V_k = sum of gamma^t * r_t for t < k plus gamma^k * values[k]. Return the mean of V_1 through V_H.",
    starterCode: `def mbve_value(model_rewards, values, gamma):
    # Your code here
    pass`,
    solution: `def mbve_value(model_rewards, values, gamma):
    h = len(model_rewards)
    total = 0.0
    for k in range(1, h + 1):
        g = 0.0
        power = 1.0
        for t in range(k):
            g += power * model_rewards[t]
            power *= gamma
        g += power * values[k]
        total += g
    return total / h`,
    testCases: [
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9], expected: 3.565 },
      { input: [[2.0], [0.0, 4.0], 0.5], expected: 4.0 },
      { input: [[1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0], 0.9], expected: 1.8699999999999999 },
      { input: [[0.0], [0.0, 5.0], 1.0], expected: 5.0 },
    ],
    hint: "Each horizon bootstraps with the value at that horizon, then the horizons are averaged.",
  },
  {
    id: "rl-078",
    title: "MCTS UCT Select",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Select a child with the PUCT rule used by AlphaZero-style MCTS.\n\nReturn the argmax of Q[a] + c * priors[a] * sqrt(sum(visits)) / (1 + visits[a]), breaking ties toward the smallest index. If no child has been visited, return 0.",
    starterCode: `import math
def mcts_uct_select(Q, visits, priors, c):
    # Your code here
    pass`,
    solution: `import math
def mcts_uct_select(Q, visits, priors, c):
    total = sum(visits)
    if total == 0:
        return 0
    best_a = 0
    best_score = float('-inf')
    for a in range(len(Q)):
        score = Q[a] + c * priors[a] * math.sqrt(total) / (1 + visits[a])
        if score > best_score:
            best_score = score
            best_a = a
    return best_a`,
    testCases: [
      { input: [[1.0, 1.0], [1, 1], [0.5, 0.5], 1.0], expected: 0 },
      { input: [[0.2, 0.3], [10, 1], [0.5, 0.5], 1.0], expected: 1 },
      { input: [[5.0, 0.0], [0, 0], [0.5, 0.5], 1.0], expected: 0 },
      { input: [[5.0, 0.0], [5, 0], [0.5, 0.5], 1.0], expected: 0 },
    ],
    hint: "The prior keeps rarely visited but promising children in the search.",
  },
  {
    id: "rl-079",
    title: "Rollout Average Return",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the average return across a batch of rollout returns. An empty batch returns 0.0.",
    starterCode: `def rollout_average_return(returns):
    # Your code here
    pass`,
    solution: `def rollout_average_return(returns):
    if not returns:
        return 0.0
    return sum(returns) / len(returns)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: 2.0 },
      { input: [[]], expected: 0.0 },
      { input: [[5.0]], expected: 5.0 },
      { input: [[-1.0, 1.0]], expected: 0.0 },
    ],
    hint: "This is the plain Monte Carlo estimate of the policy's expected return.",
  },
  {
    id: "rl-080",
    title: "Minimax Value 2-Ply",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Solve a shallow two-ply game tree where the root maximizes and each child minimizes.\n\ntree[i] is the list of leaf values under the i-th minimizing child. Return [best_child_index, minimax_value], choosing the smallest index on ties.",
    starterCode: `def minimax_2ply(tree):
    # Your code here
    pass`,
    solution: `def minimax_2ply(tree):
    best_i = 0
    best_v = float('-inf')
    for i in range(len(tree)):
        v = min(tree[i])
        if v > best_v:
            best_v = v
            best_i = i
    return [best_i, best_v]`,
    testCases: [
      { input: [[[3, 5], [2, 4], [6, 1]]], expected: [0, 3] },
      { input: [[[1], [0]]], expected: [0, 1] },
      { input: [[[2, 2], [2, 2]]], expected: [0, 2] },
      { input: [[[7]]], expected: [0, 7] },
    ],
    hint: "The opponent minimizes inside each child, so the root picks the best worst case.",
  },
  {
    id: "rl-081",
    title: "Expectimax Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the expectimax value of a shallow tree with a maximizing root and uniform chance nodes.\n\nEach child's value is the average of its leaves. Return the maximum value over the children.",
    starterCode: `def expectimax_value(tree):
    # Your code here
    pass`,
    solution: `def expectimax_value(tree):
    best = float('-inf')
    for child in tree:
        v = sum(child) / len(child)
        if v > best:
            best = v
    return best`,
    testCases: [
      { input: [[[1.0, 3.0], [2.0, 2.0]]], expected: 2.0 },
      { input: [[[0.0, 10.0], [5.0, 5.0], [1.0, 1.0]]], expected: 5.0 },
      { input: [[[3.0]]], expected: 3.0 },
      { input: [[[0.0, 1.0], [0.0, 2.0]]], expected: 1.0 },
    ],
    hint: "Chance nodes average and the max node takes the best expectation.",
  },
  {
    id: "rl-082",
    title: "Best-Arm Identification Check",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Check whether the empirically best arm has been sampled enough to be declared the winner.\n\nFind the arm with the largest mean (smallest index on ties) and return True when its pull count is at least min_pulls.",
    starterCode: `def best_arm_identified(means, counts, min_pulls):
    # Your code here
    pass`,
    solution: `def best_arm_identified(means, counts, min_pulls):
    best = 0
    for i in range(1, len(means)):
        if means[i] > means[best]:
            best = i
    return counts[best] >= min_pulls`,
    testCases: [
      { input: [[0.3, 0.8], [10, 5], 5], expected: true },
      { input: [[0.3, 0.8], [10, 4], 5], expected: false },
      { input: [[1.0], [2], 3], expected: false },
      { input: [[5.0, 5.0], [10, 3], 3], expected: true },
    ],
    hint: "A confident identification needs both the best mean and enough evidence.",
  },
  {
    id: "rl-083",
    title: "Lower Regret Bound Value",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the Lai-Robbins asymptotic lower bound on regret for a Bernoulli bandit.\n\nFor every suboptimal arm a, add (mu* - mu_a) / KL(mu_a || mu*) and multiply the total by ln(T). KL is the Bernoulli divergence mu_a * log(mu_a / mu*) + (1 - mu_a) * log((1 - mu_a) / (1 - mu*)). Means must be strictly between 0 and 1.",
    starterCode: `import math
def lower_regret_bound(means, T):
    # Your code here
    pass`,
    solution: `import math
def lower_regret_bound(means, T):
    best = max(means)
    total = 0.0
    for m in means:
        if m >= best:
            continue
        kl = m * math.log(m / best) + (1.0 - m) * math.log((1.0 - m) / (1.0 - best))
        if kl > 0:
            total += (best - m) / kl
    return total * math.log(T)`,
    testCases: [
      { input: [[0.2, 0.5], 100], expected: 7.16777502612159 },
      { input: [[0.1, 0.4, 0.6], 1000], expected: 23.308857375680173 },
      { input: [[0.5], 100], expected: 0.0 },
      { input: [[0.25, 0.5], 10], expected: 4.400560461481861 },
    ],
    hint: "Regret grows logarithmically; KL divergence sets how hard the arms are to tell apart.",
  },
  {
    id: "rl-084",
    title: "Count-Based Bonus",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the count-based exploration bonus beta / (1 + count), where count is how many times the state-action pair has been visited. More visits shrink the bonus.",
    starterCode: `def count_based_bonus(count, beta):
    # Your code here
    pass`,
    solution: `def count_based_bonus(count, beta):
    return beta / (1.0 + count)`,
    testCases: [
      { input: [0, 1.0], expected: 1.0 },
      { input: [1, 1.0], expected: 0.5 },
      { input: [9, 2.0], expected: 0.2 },
      { input: [3, 0.0], expected: 0.0 },
    ],
    hint: "The bonus is a decreasing function of visitation count.",
  },
  {
    id: "rl-085",
    title: "RND Novelty Error Lite",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the mean squared error between predicted and target random-network-distillation features. An empty vector returns 0.0.",
    starterCode: `def rnd_novelty_error(predicted, target):
    # Your code here
    pass`,
    solution: `def rnd_novelty_error(predicted, target):
    n = len(predicted)
    if n == 0:
        return 0.0
    total = 0.0
    for p, t in zip(predicted, target):
        total += (p - t) ** 2
    return total / n`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0]], expected: 0.0 },
      { input: [[0.0, 0.0], [1.0, 1.0]], expected: 1.0 },
      { input: [[1.0, 3.0], [2.0, 1.0]], expected: 2.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Large prediction error means the state is novel to the predictor network.",
  },
  {
    id: "rl-086",
    title: "ICM Forward Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the ICM forward-model loss: one half of the mean squared error between predicted and actual next-state features. An empty vector returns 0.0.",
    starterCode: `def icm_forward_loss(predicted_next, actual_next):
    # Your code here
    pass`,
    solution: `def icm_forward_loss(predicted_next, actual_next):
    n = len(predicted_next)
    if n == 0:
        return 0.0
    total = 0.0
    for p, a in zip(predicted_next, actual_next):
        total += (p - a) ** 2
    return total / (2.0 * n)`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 1.0]], expected: 0.5 },
      { input: [[1.0, 1.0], [1.0, 1.0]], expected: 0.0 },
      { input: [[2.0], [0.0]], expected: 2.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "The intrinsic reward is proportional to this forward prediction loss.",
  },
  {
    id: "rl-087",
    title: "HER Relabel Goal",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Relabel a hindsight-experience-replay transition with the achieved goal.\n\nReturn [achieved_goal, success_reward] when the achieved goal equals the desired goal, and [achieved_goal, failure_reward] otherwise.",
    starterCode: `def her_relabel(achieved_goal, goal, success_reward, failure_reward):
    # Your code here
    pass`,
    solution: `def her_relabel(achieved_goal, goal, success_reward, failure_reward):
    if list(achieved_goal) == list(goal):
        return [list(achieved_goal), success_reward]
    return [list(achieved_goal), failure_reward]`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0], 1.0, 0.0], expected: [[1.0, 2.0], 1.0] },
      { input: [[0.0, 0.0], [1.0, 1.0], 1.0, -1.0], expected: [[0.0, 0.0], -1.0] },
      { input: [[3.0], [3.0], 5.0, 0.0], expected: [[3.0], 5.0] },
    ],
    hint: "Rewriting the goal as what actually happened turns failures into learning signal.",
  },
  {
    id: "rl-088",
    title: "HER Future Goal Pick",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample future goals for hindsight relabeling with a seeded random generator.\n\nDraw k indices uniformly from [t + 1, T - 1] using rng.randrange(t + 1, T). Return [] when there is no future timestep.",
    starterCode: `import random
def her_future_goals(t, T, k, seed):
    # Your code here
    pass`,
    solution: `import random
def her_future_goals(t, T, k, seed):
    rng = random.Random(seed)
    if T - t - 1 <= 0:
        return []
    return [rng.randrange(t + 1, T) for _ in range(k)]`,
    testCases: [
      { input: [0, 5, 3, 42], expected: [1, 1, 3] },
      { input: [2, 6, 4, 0], expected: [4, 4, 3, 4] },
      { input: [3, 4, 5, 7], expected: [] },
      { input: [1, 3, 2, 123], expected: [2, 2] },
    ],
    hint: "The future strategy relabels with states that were actually reached later.",
  },
  {
    id: "rl-089",
    title: "Reward Machine Transition",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Step a reward machine given the current state and an observed event.\n\ntransitions is a list of [state, event, next_state] triples. Return the matching next state, or -1 when no transition applies.",
    starterCode: `def reward_machine_step(state, event, transitions):
    # Your code here
    pass`,
    solution: `def reward_machine_step(state, event, transitions):
    for s, e, nxt in transitions:
        if s == state and e == event:
            return nxt
    return -1`,
    testCases: [
      { input: ["s0", "e1", [["s0", "e1", "s1"], ["s1", "e0", "s0"]]], expected: "s1" },
      { input: ["s1", "e1", [["s0", "e1", "s1"], ["s1", "e0", "s0"]]], expected: -1 },
      { input: [0, 1, [[0, 1, 2], [2, 0, 0]]], expected: 2 },
      { input: ["x", "y", []], expected: -1 },
    ],
    hint: "The first matching transition wins; an unmatched event returns -1.",
  },
  {
    id: "rl-090",
    title: "Options Termination Value",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the expected discounted value of an option that terminates each step with probability beta.\n\nWhile active the option collects rewards; after each reward it terminates with probability beta, collecting value_after one step later, and if it survives the whole sequence it collects value_after at the end. Return the expectation.",
    starterCode: `def option_termination_value(rewards, beta, gamma, value_after):
    # Your code here
    pass`,
    solution: `def option_termination_value(rewards, beta, gamma, value_after):
    total = 0.0
    surv = 1.0
    power = 1.0
    for r in rewards:
        total += surv * power * r
        total += surv * beta * power * gamma * value_after
        surv *= (1.0 - beta)
        power *= gamma
    total += surv * power * value_after
    return total`,
    testCases: [
      { input: [[1.0, 1.0], 0.5, 0.9, 10.0], expected: 10.0 },
      { input: [[1.0, 1.0, 1.0], 0.0, 0.5, 4.0], expected: 2.25 },
      { input: [[2.0], 1.0, 0.9, 5.0], expected: 6.5 },
      { input: [[0.0], 0.2, 1.0, 0.0], expected: 0.0 },
    ],
    hint: "Weight each step by the survival probability (1 - beta) raised to that step.",
  },
];
