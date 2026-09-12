import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-316",
    title: "C51 Support Spacing",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Build the fixed support of a C51 categorical value distribution.\n\nWith n_atoms atoms spanning [v_min, v_max], the spacing is dz = (v_max - v_min) / (n_atoms - 1) and support[i] = v_min + i * dz. A single atom gives [v_min] and a non-positive atom count gives [].",
    starterCode: `def c51_support_spacing(v_min, v_max, n_atoms):
    # Your code here
    pass`,
    solution: `def c51_support_spacing(v_min, v_max, n_atoms):
    if n_atoms <= 0:
        return []
    if n_atoms == 1:
        return [v_min]
    dz = (v_max - v_min) / (n_atoms - 1)
    return [v_min + i * dz for i in range(n_atoms)]`,
    testCases: [
      { input: [0.0, 3.0, 4], expected: [0.0, 1.0, 2.0, 3.0] },
      { input: [-1.0, 1.0, 5], expected: [-1.0, -0.5, 0.0, 0.5, 1.0] },
      { input: [2.0, 2.0, 3], expected: [2.0, 2.0, 2.0] },
      { input: [0.0, 1.0, 1], expected: [0.0] },
      { input: [0.0, 1.0, 0], expected: [] },
    ],
    hint: "The support is a uniform grid, so every Bellman target is projected back onto it.",
  },
  {
    id: "rl-317",
    title: "C51 Projection Index Pair",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Find the two support atoms a projected C51 target would land between.\n\nCompute b = (value - v_min) / dz with dz = (v_max - v_min) / (n_atoms - 1), then return [lower_index, upper_index, upper_weight] where upper_weight = b - lower_index. Values at or below v_min give [0, 1, 0.0], values at or above v_max give [n_atoms - 1, n_atoms - 1, 0.0], and fewer than two atoms give [0, 0, 0.0].",
    starterCode: `def c51_projection_indices(value, v_min, v_max, n_atoms):
    # Your code here
    pass`,
    solution: `def c51_projection_indices(value, v_min, v_max, n_atoms):
    if n_atoms < 2:
        return [0, 0, 0.0]
    if value <= v_min:
        return [0, 1, 0.0]
    if value >= v_max:
        return [n_atoms - 1, n_atoms - 1, 0.0]
    dz = (v_max - v_min) / (n_atoms - 1)
    b = (value - v_min) / dz
    l = int(b)
    return [l, l + 1, b - l]`,
    testCases: [
      { input: [1.7, 0.0, 3.0, 4], expected: [1, 2, 0.7] },
      { input: [-0.5, 0.0, 3.0, 4], expected: [0, 1, 0.0] },
      { input: [3.0, 0.0, 3.0, 4], expected: [3, 3, 0.0] },
      { input: [2.4, 0.0, 3.0, 4], expected: [2, 3, 0.3999999999999999] },
      { input: [1.0, 0.0, 1.0, 1], expected: [0, 0, 0.0] },
    ],
    hint: "The upper weight is the fractional part of the support coordinate b.",
  },
  {
    id: "rl-318",
    title: "QR-DQN Quantile Midpoint Bin",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Map a probability level p to the index of the quantile midpoint bin it falls in.\n\nSplit [0, 1] into n_quantiles equal bins and return floor(p * n_quantiles), clamped so p <= 0 gives 0 and p >= 1 gives n_quantiles - 1. A non-positive quantile count returns -1.",
    starterCode: `def qr_midpoint_bin(p, n_quantiles):
    # Your code here
    pass`,
    solution: `def qr_midpoint_bin(p, n_quantiles):
    if n_quantiles <= 0:
        return -1
    if p <= 0.0:
        return 0
    if p >= 1.0:
        return n_quantiles - 1
    idx = int(p * n_quantiles)
    return idx if idx < n_quantiles else n_quantiles - 1`,
    testCases: [
      { input: [0.3, 4], expected: 1 },
      { input: [0.75, 4], expected: 3 },
      { input: [0.999, 4], expected: 3 },
      { input: [0.0, 5], expected: 0 },
      { input: [1.0, 5], expected: 4 },
    ],
    hint: "The bin index tells you which quantile head should receive the sampled tau.",
  },
  {
    id: "rl-319",
    title: "IQN Quantile Huber Loss",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the IQN quantile Huber loss for one predicted quantile value.\n\nWith delta = target - predicted, the Huber term is 0.5 * delta^2 when |delta| <= kappa and kappa * (|delta| - 0.5 * kappa) otherwise, and the quantile weight is (1 - tau) when delta < 0 else tau. Return weight * huber / kappa. kappa is positive.",
    starterCode: `def iqn_quantile_huber(predicted, target, tau, kappa):
    # Your code here
    pass`,
    solution: `def iqn_quantile_huber(predicted, target, tau, kappa):
    delta = target - predicted
    ad = abs(delta)
    if ad <= kappa:
        huber = 0.5 * delta * delta
    else:
        huber = kappa * (ad - 0.5 * kappa)
    weight = 1.0 - tau if delta < 0.0 else tau
    return weight * huber / kappa`,
    testCases: [
      { input: [1.0, 1.5, 0.5, 1.0], expected: 0.0625 },
      { input: [1.0, 2.5, 0.9, 1.0], expected: 0.9 },
      { input: [2.0, 1.0, 0.1, 0.5], expected: 0.675 },
      { input: [0.0, 0.0, 0.5, 1.0], expected: 0.0 },
      { input: [3.0, 2.0, 0.9, 0.25], expected: 0.08749999999999998 },
    ],
    hint: "The asymmetric weight |tau - 1{delta < 0}| turns regression into quantile estimation.",
  },
  {
    id: "rl-320",
    title: "Distributional Return Variance",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the variance of a categorical return distribution.\n\nWith mean = sum probs[i] * atoms[i], return sum probs[i] * (atoms[i] - mean)^2. An empty distribution returns 0.0.",
    starterCode: `def distributional_variance(atoms, probs):
    # Your code here
    pass`,
    solution: `def distributional_variance(atoms, probs):
    n = len(atoms)
    if n == 0:
        return 0.0
    mean = 0.0
    for i in range(n):
        mean += probs[i] * atoms[i]
    var = 0.0
    for i in range(n):
        var += probs[i] * (atoms[i] - mean) ** 2
    return var`,
    testCases: [
      { input: [[0.0, 1.0, 2.0], [0.2, 0.3, 0.5]], expected: 0.6100000000000001 },
      { input: [[1.0], [1.0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[0.0, 10.0], [0.5, 0.5]], expected: 25.0 },
    ],
    hint: "Distributional RL predicts the whole distribution, and its spread is a risk signal.",
  },
  {
    id: "rl-321",
    title: "Dueling Centered Advantage",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Center a dueling advantage stream by subtracting its mean.\n\nReturn advantage[a] - mean(advantage) for every action, which makes the advantage identifiable without changing the greedy action. An empty list returns [].",
    starterCode: `def dueling_centered_advantage(advantage):
    # Your code here
    pass`,
    solution: `def dueling_centered_advantage(advantage):
    if not advantage:
        return []
    m = sum(advantage) / len(advantage)
    return [a - m for a in advantage]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [-1.0, 0.0, 1.0] },
      { input: [[5.0, 5.0]], expected: [0.0, 0.0] },
      { input: [[]], expected: [] },
      { input: [[-1.0, 0.0, 1.0]], expected: [-1.0, 0.0, 1.0] },
    ],
    hint: "The value stream must carry the average action quality once advantages are centered.",
  },
  {
    id: "rl-322",
    title: "Noisy Net Effective Epsilon",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate the effective epsilon-greedy exploration of a noisy linear layer.\n\nThe expected absolute Gaussian noise is |sigma| * sqrt(2 / pi); per parameter the exploration share is that value divided by |weight| plus it, and the result is the mean share across parameters. Empty inputs return 0.0 and zero-noise, zero-weight parameters contribute nothing.",
    starterCode: `import math
def noisy_net_effective_epsilon(weights, sigmas):
    # Your code here
    pass`,
    solution: `import math
def noisy_net_effective_epsilon(weights, sigmas):
    n = len(weights)
    if n == 0:
        return 0.0
    total = 0.0
    for w, s in zip(weights, sigmas):
        e = abs(s) * math.sqrt(2.0 / math.pi)
        denom = abs(w) + e
        if denom > 0.0:
            total += e / denom
    return total / n`,
    testCases: [
      { input: [[1.0], [0.1]], expected: 0.07389267372789357 },
      { input: [[0.0], [0.1]], expected: 1.0 },
      { input: [[1.0, 1.0], [0.0, 0.0]], expected: 0.0 },
      { input: [[1.0, 0.5], [0.1, 0.2]], expected: 0.15791548331105915 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Comparing noise magnitude to weight magnitude approximates how exploratory the layer is.",
  },
  {
    id: "rl-323",
    title: "Rainbow Coverage Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how many canonical Rainbow components appear in a configuration list.\n\nThe canonical set is double_q, dueling, prioritized, n_step, distributional, and noisy. Return the number of canonical names present in components, ignoring duplicates and unknown names.",
    starterCode: `def rainbow_coverage_count(components):
    # Your code here
    pass`,
    solution: `def rainbow_coverage_count(components):
    canonical = ["double_q", "dueling", "prioritized", "n_step", "distributional", "noisy"]
    count = 0
    for name in canonical:
        if name in components:
            count += 1
    return count`,
    testCases: [
      { input: [["double_q", "dueling", "prioritized", "n_step", "distributional", "noisy"]], expected: 6 },
      { input: [["dueling"]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [["double_q", "double_q", "unknown"]], expected: 1 },
    ],
    hint: "Rainbow is the union of six orthogonal DQN improvements.",
  },
  {
    id: "rl-324",
    title: "N-Step Advantage Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute an n-step bootstrapped return minus a state-value baseline.\n\nAccumulate sum gamma^t * rewards[t], add gamma^n * next_value when done is False, then subtract value0 to get the n-step advantage. An empty reward list uses gamma^0 = 1 for the bootstrap.",
    starterCode: `def n_step_advantage_value(rewards, gamma, next_value, value0, done):
    # Your code here
    pass`,
    solution: `def n_step_advantage_value(rewards, gamma, next_value, value0, done):
    total = 0.0
    power = 1.0
    for r in rewards:
        total += power * r
        power *= gamma
    if not done:
        total += power * next_value
    return total - value0`,
    testCases: [
      { input: [[1.0, 1.0], 0.9, 5.0, 2.0, false], expected: 3.950000000000001 },
      { input: [[1.0, 1.0], 0.9, 100.0, 2.0, true], expected: -0.10000000000000009 },
      { input: [[], 0.9, 3.0, 1.0, false], expected: 2.0 },
      { input: [[2.0], 0.5, 4.0, 0.0, false], expected: 4.0 },
    ],
    hint: "Subtracting the baseline turns the n-step return into a variance-reduced advantage.",
  },
  {
    id: "rl-325",
    title: "R2D2 Burn-In Masked Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Average only the loss terms that come after an R2D2 burn-in prefix.\n\nReturn the mean of losses[burn_in:] with negative burn_in treated as 0. When the burn-in consumes the whole sequence or the list is empty, return 0.0.",
    starterCode: `def r2d2_masked_loss(losses, burn_in):
    # Your code here
    pass`,
    solution: `def r2d2_masked_loss(losses, burn_in):
    n = len(losses)
    if burn_in < 0:
        burn_in = 0
    if burn_in >= n:
        return 0.0
    total = 0.0
    count = 0
    for i in range(burn_in, n):
        total += losses[i]
        count += 1
    if count == 0:
        return 0.0
    return total / count`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], 2], expected: 3.5 },
      { input: [[5.0], 0], expected: 5.0 },
      { input: [[1.0, 2.0], 2], expected: 0.0 },
      { input: [[], 0], expected: 0.0 },
      { input: [[1.0, 2.0, 3.0], -1], expected: 2.0 },
    ],
    hint: "Burn-in steps warm up the recurrent state but must not contribute gradients.",
  },
  {
    id: "rl-326",
    title: "V-Trace Clipped Ratio",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the clipped importance ratios used by IMPALA V-trace.\n\nFor each step take ratio = target_probs[t][action] / behavior_probs[t][action], clip it to rho_bar to get the value ratio, and clip it to c_bar to get the trace coefficient. Return the list of [rho, c] pairs. Behavior probabilities are positive.",
    starterCode: `def vtrace_clipped_ratio(target_probs, behavior_probs, actions, rho_bar, c_bar):
    # Your code here
    pass`,
    solution: `def vtrace_clipped_ratio(target_probs, behavior_probs, actions, rho_bar, c_bar):
    res = []
    for t in range(len(actions)):
        ratio = target_probs[t][actions[t]] / behavior_probs[t][actions[t]]
        rho = ratio if ratio < rho_bar else rho_bar
        c = ratio if ratio < c_bar else c_bar
        res.append([rho, c])
    return res`,
    testCases: [
      { input: [[[0.5, 0.5], [0.8, 0.2]], [[0.25, 0.75], [0.5, 0.5]], [0, 1], 1.0, 1.0], expected: [[1.0, 1.0], [0.4, 0.4]] },
      { input: [[[0.5, 0.5], [0.8, 0.2]], [[0.25, 0.75], [0.5, 0.5]], [0, 1], 0.5, 1.0], expected: [[0.5, 1.0], [0.4, 0.4]] },
      { input: [[], [], [], 1.0, 1.0], expected: [] },
      { input: [[[0.9, 0.1]], [[0.3, 0.7]], [1], 3.0, 0.9], expected: [[0.14285714285714288, 0.14285714285714288]] },
    ],
    hint: "Separate clipping bounds keep the target variance low while allowing longer traces.",
  },
  {
    id: "rl-327",
    title: "Ape-X Actor Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute how many distributed actors are needed to hit a target transition rate.\n\nReturn ceil(target_rate / rate_per_actor). A non-positive rate per actor or target rate returns 0.",
    starterCode: `import math
def apex_actor_count(target_rate, rate_per_actor):
    # Your code here
    pass`,
    solution: `import math
def apex_actor_count(target_rate, rate_per_actor):
    if target_rate <= 0.0 or rate_per_actor <= 0.0:
        return 0
    return int(math.ceil(target_rate / rate_per_actor))`,
    testCases: [
      { input: [100.0, 8.0], expected: 13 },
      { input: [32.0, 8.0], expected: 4 },
      { input: [0.0, 5.0], expected: 0 },
      { input: [5.0, 0.0], expected: 0 },
      { input: [9.0, 4.0], expected: 3 },
    ],
    hint: "Ape-X scales exploration by adding actors, not by stretching a single stream.",
  },
  {
    id: "rl-328",
    title: "Prioritized Alpha Effect",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the sampling-probability ratio induced by the prioritized replay exponent alpha.\n\nReturn (p_max / p_min)^alpha. If p_min is not positive or p_max is below p_min, return 0.0.",
    starterCode: `def prioritized_alpha_effect(p_min, p_max, alpha):
    # Your code here
    pass`,
    solution: `def prioritized_alpha_effect(p_min, p_max, alpha):
    if p_min <= 0.0 or p_max < p_min:
        return 0.0
    return (p_max / p_min) ** alpha`,
    testCases: [
      { input: [1.0, 100.0, 0.5], expected: 10.0 },
      { input: [1.0, 10.0, 2.0], expected: 100.0 },
      { input: [2.0, 8.0, 1.0], expected: 4.0 },
      { input: [0.0, 5.0, 1.0], expected: 0.0 },
      { input: [5.0, 5.0, 0.7], expected: 1.0 },
    ],
    hint: "Alpha of 0 flattens the ratio to 1 and alpha of 1 passes the raw priority ratio through.",
  },
  {
    id: "rl-329",
    title: "PER Beta Annealed Weight",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a single prioritized replay importance-sampling weight with beta annealing.\n\nThe schedule is beta = beta0 + (1 - beta0) * (step / total_steps) with step clamped to [0, total_steps], and the weight is (1 / (n * prob))^beta. A non-positive total_steps uses beta = 1.0, and non-positive n or prob returns 0.0.",
    starterCode: `def per_beta_annealed_weight(prob, n, beta0, step, total_steps):
    # Your code here
    pass`,
    solution: `def per_beta_annealed_weight(prob, n, beta0, step, total_steps):
    if prob <= 0.0 or n <= 0:
        return 0.0
    if total_steps <= 0:
        beta = 1.0
    else:
        if step < 0:
            step = 0
        if step > total_steps:
            step = total_steps
        beta = beta0 + (1.0 - beta0) * (step / total_steps)
    return (1.0 / (n * prob)) ** beta`,
    testCases: [
      { input: [0.2, 10, 0.4, 0, 100], expected: 0.757858283255199 },
      { input: [0.2, 10, 0.4, 100, 100], expected: 0.5 },
      { input: [0.2, 10, 0.4, 50, 100], expected: 0.6155722066724582 },
      { input: [0.2, 10, 0.0, 50, 100], expected: 0.7071067811865476 },
      { input: [0.0, 10, 0.4, 50, 100], expected: 0.0 },
    ],
    hint: "Annealing beta from beta0 to 1 gradually removes the importance-sampling bias.",
  },
  {
    id: "rl-330",
    title: "Next TD3 Actor Update Step",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the first step at or after the current step where TD3 fires an actor update.\n\nActor updates happen on multiples of delay, so return step when step % delay == 0, otherwise advance to the next multiple. A non-positive delay returns 0.",
    starterCode: `def next_td3_actor_step(step, delay):
    # Your code here
    pass`,
    solution: `def next_td3_actor_step(step, delay):
    if delay <= 0:
        return 0
    rem = step % delay
    if rem == 0:
        return step
    return step + (delay - rem)`,
    testCases: [
      { input: [10, 2], expected: 10 },
      { input: [11, 2], expected: 12 },
      { input: [5, 3], expected: 6 },
      { input: [0, 4], expected: 0 },
      { input: [7, 0], expected: 0 },
    ],
    hint: "Delayed policy updates let the critic catch up before the actor moves.",
  },
  {
    id: "rl-331",
    title: "TD3 Target Noise Sample",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample the clipped target-policy noise that TD3 adds when smoothing the critic target.\n\nDraw one Gaussian sample N(0, sigma) with rng = random.Random(seed), then clamp it to [-clip_range, clip_range]. sigma is positive and the seed makes the sample reproducible.",
    starterCode: `import random
def td3_target_noise_sample(sigma, clip_range, seed):
    # Your code here
    pass`,
    solution: `import random
def td3_target_noise_sample(sigma, clip_range, seed):
    rng = random.Random(seed)
    noise = rng.gauss(0.0, sigma)
    if noise > clip_range:
        return clip_range
    if noise < -clip_range:
        return -clip_range
    return noise`,
    testCases: [
      { input: [0.2, 0.5, 42], expected: -0.028818065915585674 },
      { input: [0.2, 0.5, 0], expected: 0.1883430809361329 },
      { input: [1.0, 0.1, 7], expected: -0.1 },
      { input: [0.3, 0.2, 123], expected: 0.12126852996739997 },
    ],
    hint: "Clipping the target noise keeps the smoothed bootstrap value close to the true one.",
  },
  {
    id: "rl-332",
    title: "DDPG Noise Decay Schedule",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Linearly decay an exploration noise standard deviation and floor it.\n\nReturn max(sigma_min, sigma0 - (sigma0 - sigma_min) * step / total_steps) with step clamped to [0, total_steps]. A non-positive total_steps returns sigma_min.",
    starterCode: `def ddpg_noise_decay(step, sigma0, sigma_min, total_steps):
    # Your code here
    pass`,
    solution: `def ddpg_noise_decay(step, sigma0, sigma_min, total_steps):
    if total_steps <= 0:
        return sigma_min
    if step < 0:
        step = 0
    if step > total_steps:
        step = total_steps
    value = sigma0 - (sigma0 - sigma_min) * (step / total_steps)
    if value < sigma_min:
        return sigma_min
    return value`,
    testCases: [
      { input: [0, 0.5, 0.05, 100], expected: 0.5 },
      { input: [100, 0.5, 0.05, 100], expected: 0.05 },
      { input: [50, 0.5, 0.05, 100], expected: 0.275 },
      { input: [200, 0.5, 0.05, 100], expected: 0.05 },
      { input: [10, 0.5, 0.6, 100], expected: 0.6 },
    ],
    hint: "A nonzero noise floor keeps a deterministic policy exploring late in training.",
  },
  {
    id: "rl-333",
    title: "SAC Log-Alpha Update Step",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Take one gradient step on the SAC temperature parameterized as log_alpha.\n\nWith alpha = exp(log_alpha) and mean_lp the mean action log-probability, the loss is J = -alpha * (mean_lp + target_entropy), so dJ/d(log_alpha) = -alpha * (mean_lp + target_entropy). Return exp(log_alpha - lr * dJ/dlog_alpha), clamped below at min_alpha. Empty log_probs returns exp(log_alpha).",
    starterCode: `import math
def sac_log_alpha_step(log_alpha, log_probs, target_entropy, lr, min_alpha):
    # Your code here
    pass`,
    solution: `import math
def sac_log_alpha_step(log_alpha, log_probs, target_entropy, lr, min_alpha):
    if not log_probs:
        return math.exp(log_alpha)
    alpha = math.exp(log_alpha)
    mean_lp = sum(log_probs) / len(log_probs)
    grad = -alpha * (mean_lp + target_entropy)
    new_alpha = math.exp(log_alpha - lr * grad)
    if new_alpha < min_alpha:
        return min_alpha
    return new_alpha`,
    testCases: [
      { input: [-1.6094379124341003, [-1.0, -2.0], -2.0, 0.01, 0.01], expected: 0.19860488858664707 },
      { input: [0.0, [-4.0], -1.0, 1.0, 0.01], expected: 0.01 },
      { input: [-0.6931471805599453, [], -1.0, 0.1, 0.0], expected: 0.5 },
      { input: [-1.6094379124341003, [-0.5], -2.0, 0.5, 0.0], expected: 0.155760156614281 },
    ],
    hint: "The temperature rises when the policy entropy falls below the target entropy.",
  },
  {
    id: "rl-334",
    title: "SAC Soft Twin-Q Target",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the soft Bellman target used by SAC with twin critics.\n\nIf done, return reward. Otherwise return reward + gamma * (min(q1, q2) - alpha * log_prob), where the subtracted entropy term rewards next actions with low probability. gamma, alpha, and the probabilities follow the usual SAC conventions.",
    starterCode: `def sac_soft_twin_q_target(reward, done, gamma, q1, q2, log_prob, alpha):
    # Your code here
    pass`,
    solution: `def sac_soft_twin_q_target(reward, done, gamma, q1, q2, log_prob, alpha):
    if done:
        return reward
    return reward + gamma * (min(q1, q2) - alpha * log_prob)`,
    testCases: [
      { input: [1.0, false, 0.99, 2.0, 3.0, -0.5, 0.2], expected: 3.079 },
      { input: [1.0, true, 0.99, 2.0, 3.0, -0.5, 0.2], expected: 1.0 },
      { input: [0.0, false, 0.5, -1.0, 2.0, -1.0, 1.0], expected: 0.0 },
      { input: [2.0, false, 0.9, 4.0, 4.0, 0.0, 0.5], expected: 5.6 },
    ],
    hint: "The entropy term equals alpha times the negative log-probability of the next action.",
  },
  {
    id: "rl-335",
    title: "Continuous Action Target Entropy",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the standard SAC target entropy for a continuous action space: the negative action dimensionality, -action_dim.",
    starterCode: `def continuous_target_entropy(action_dim):
    # Your code here
    pass`,
    solution: `def continuous_target_entropy(action_dim):
    return -action_dim`,
    testCases: [
      { input: [1], expected: -1 },
      { input: [3], expected: -3 },
      { input: [6], expected: -6 },
      { input: [0], expected: 0 },
    ],
    hint: "One nat of entropy per action dimension is the usual heuristic target.",
  },
  {
    id: "rl-336",
    title: "IQL Expectile Update Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one IQL expectile regression update for a set of values.\n\nGiven a reference estimate, weight each value by tau when it is at or above the reference and by 1 - tau otherwise, then return the weighted mean sum(w * v) / sum(w). An empty list or zero total weight returns the reference unchanged.",
    starterCode: `def iql_expectile_update(values, reference, tau):
    # Your code here
    pass`,
    solution: `def iql_expectile_update(values, reference, tau):
    if not values:
        return reference
    total_w = 0.0
    total = 0.0
    for v in values:
        diff = v - reference
        w = tau if diff >= 0.0 else 1.0 - tau
        total += w * v
        total_w += w
    if total_w == 0.0:
        return reference
    return total / total_w`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2.0, 0.5], expected: 2.0 },
      { input: [[1.0, 2.0, 3.0], 0.0, 0.7], expected: 2.0 },
      { input: [[1.0, 2.0, 3.0], 2.5, 0.9], expected: 2.727272727272727 },
      { input: [[], 5.0, 0.5], expected: 5.0 },
      { input: [[2.0], 1.0, 0.0], expected: 1.0 },
    ],
    hint: "Expectile regression with tau above 0.5 leans the value toward the upper tail.",
  },
  {
    id: "rl-337",
    title: "CQL Hinge Penalty",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the per-state CQL hinge penalty against out-of-distribution actions.\n\nFor each state take the maximum Q over the other actions and add max(0, max_other_q - q_data + margin), then average over states. An empty batch returns 0.0.",
    starterCode: `def cql_hinge_penalty(q_data, q_other, margin):
    # Your code here
    pass`,
    solution: `def cql_hinge_penalty(q_data, q_other, margin):
    n = len(q_data)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        hinge = max(q_other[i]) - q_data[i] + margin
        if hinge > 0.0:
            total += hinge
    return total / n`,
    testCases: [
      { input: [[1.0, 2.0], [[0.0, 3.0], [1.0, 1.5]], 0.5], expected: 1.25 },
      { input: [[5.0], [[1.0, 2.0]], 1.0], expected: 0.0 },
      { input: [[], [], 1.0], expected: 0.0 },
      { input: [[0.0, 0.0], [[1.0], [2.0]], 0.25], expected: 1.75 },
    ],
    hint: "The margin forces dataset actions to stay ahead of the best unseen action.",
  },
  {
    id: "rl-338",
    title: "TD3+BC Lambda Value",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the TD3+BC mixing coefficient lambda = alpha / mean(|Q|).\n\nDivide alpha by the mean absolute Q value over the batch. An empty batch or an all-zero Q batch returns 0.0.",
    starterCode: `def td3bc_lambda(q_values, alpha):
    # Your code here
    pass`,
    solution: `def td3bc_lambda(q_values, alpha):
    if not q_values:
        return 0.0
    mean_abs = sum(abs(q) for q in q_values) / len(q_values)
    if mean_abs == 0.0:
        return 0.0
    return alpha / mean_abs`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2.5], expected: 1.25 },
      { input: [[-1.0, 1.0], 1.0], expected: 1.0 },
      { input: [[0.0, 0.0], 2.0], expected: 0.0 },
      { input: [[], 1.0], expected: 0.0 },
      { input: [[2.0, 4.0], 3.0], expected: 1.0 },
    ],
    hint: "Scaling by the Q magnitude keeps the behavioral cloning term unitless.",
  },
  {
    id: "rl-339",
    title: "AWAC Normalized Advantage Weight",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute AWAC advantage weights with batch mean normalization.\n\nSubtract the mean advantage before exponentiating: w_i = exp((a_i - mean(a)) / lam). This shifts all weights by a constant factor while keeping their ratios intact. An empty list returns [] and lam is positive.",
    starterCode: `import math
def awac_normalized_advantage_weight(advantages, lam):
    # Your code here
    pass`,
    solution: `import math
def awac_normalized_advantage_weight(advantages, lam):
    if not advantages:
        return []
    m = sum(advantages) / len(advantages)
    return [math.exp((a - m) / lam) for a in advantages]`,
    testCases: [
      { input: [[0.0, 1.0], 1.0], expected: [0.6065306597126334, 1.6487212707001282] },
      { input: [[1.0, 1.0], 0.5], expected: [1.0, 1.0] },
      { input: [[], 1.0], expected: [] },
      { input: [[2.0, 0.0], 2.0], expected: [1.6487212707001282, 0.6065306597126334] },
    ],
    hint: "Mean subtraction makes the exponent numerically safe without changing relative weights.",
  },
  {
    id: "rl-340",
    title: "Model Rollout Horizon",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Choose a model rollout horizon from per-step model accuracy.\n\nReliability after h steps is accuracy^h, so the smallest h with accuracy^h <= tolerance is ceil(ln(tolerance) / ln(accuracy)), floored at 1. Return 0 when accuracy or tolerance is outside (0, 1).",
    starterCode: `import math
def model_rollout_horizon(accuracy, tolerance):
    # Your code here
    pass`,
    solution: `import math
def model_rollout_horizon(accuracy, tolerance):
    if not (0.0 < accuracy < 1.0) or not (0.0 < tolerance < 1.0):
        return 0
    h = int(math.ceil(math.log(tolerance) / math.log(accuracy)))
    return h if h > 1 else 1`,
    testCases: [
      { input: [0.9, 0.5], expected: 7 },
      { input: [0.5, 0.25], expected: 2 },
      { input: [0.8, 0.8], expected: 1 },
      { input: [0.99, 0.9], expected: 11 },
      { input: [1.0, 0.5], expected: 0 },
    ],
    hint: "Compounding model error limits how far imagined rollouts stay trustworthy.",
  },
  {
    id: "rl-341",
    title: "Latent Gaussian Reconstruction Loss",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the Gaussian negative log-likelihood of latent dynamics predictions.\n\nFor a batch of latent vectors, add log(2 * pi) + log_var + (target - mu)^2 / exp(log_var) over every dimension, then return 0.5 times the sum divided by the batch size. An empty batch returns 0.0.",
    starterCode: `import math
def latent_gaussian_reconstruction_loss(mu, log_var, target):
    # Your code here
    pass`,
    solution: `import math
def latent_gaussian_reconstruction_loss(mu, log_var, target):
    n = len(mu)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        for d in range(len(mu[i])):
            total += math.log(2.0 * math.pi) + log_var[i][d] + (target[i][d] - mu[i][d]) ** 2 / math.exp(log_var[i][d])
    return 0.5 * total / n`,
    testCases: [
      { input: [[[0.0]], [[0.0]], [[0.0]]], expected: 0.9189385332046727 },
      { input: [[[1.0]], [[0.0]], [[0.0]]], expected: 1.4189385332046727 },
      { input: [[[0.0, 0.0]], [[0.0, 0.0]], [[1.0, 1.0]]], expected: 2.8378770664093453 },
      { input: [[[0.0, 0.0], [0.0, 0.0]], [[0.0, 0.0], [1.0, 1.0]], [[0.0, 0.0], [0.0, 0.0]]], expected: 2.3378770664093453 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "The log-variance head lets the model trade off uncertainty against reconstruction error.",
  },
  {
    id: "rl-342",
    title: "RSSM Balanced KL Terms",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the two weighted KL terms of the Dreamer RSSM balance loss.\n\nFor univariate Gaussians, KL(post || prior) = ln(prior_std / post_std) + (post_std^2 + (post_mean - prior_mean)^2) / (2 * prior_std^2) - 0.5. Return [beta_dyn * KL, beta_rep * KL], the dynamics and representation shares of the loss. All standard deviations are positive.",
    starterCode: `import math
def rssm_balanced_kl(post_mean, post_std, prior_mean, prior_std, beta_dyn, beta_rep):
    # Your code here
    pass`,
    solution: `import math
def rssm_balanced_kl(post_mean, post_std, prior_mean, prior_std, beta_dyn, beta_rep):
    kl = math.log(prior_std / post_std) + (post_std ** 2 + (post_mean - prior_mean) ** 2) / (2.0 * prior_std ** 2) - 0.5
    return [beta_dyn * kl, beta_rep * kl]`,
    testCases: [
      { input: [0.0, 1.0, 0.0, 1.0, 1.0, 0.2], expected: [0.0, 0.0] },
      { input: [0.0, 1.0, 1.0, 1.0, 1.0, 0.2], expected: [0.5, 0.1] },
      { input: [0.0, 0.5, 0.0, 1.0, 0.5, 0.5], expected: [0.15907359027997264, 0.15907359027997264] },
      { input: [2.0, 0.5, 1.0, 2.0, 1.0, 0.1], expected: [1.0425443611198906, 0.10425443611198906] },
    ],
    hint: "Different weights on dynamics and representation gradient flow keep the prior from collapsing.",
  },
  {
    id: "rl-343",
    title: "Imagination Lambda Return",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the lambda return of a Dreamer-style imagined trajectory.\n\nStarting from the bootstrap value at the horizon, apply the backward recursion G_t = rewards[t] + gamma * ((1 - lam) * values[t + 1] + lam * G_{t + 1}) for each step. values has one more entry than rewards and the final value initializes the recursion.",
    starterCode: `def imagination_lambda_return(rewards, values, gamma, lam):
    # Your code here
    pass`,
    solution: `def imagination_lambda_return(rewards, values, gamma, lam):
    g = values[len(rewards)]
    for t in range(len(rewards) - 1, -1, -1):
        g = rewards[t] + gamma * ((1.0 - lam) * values[t + 1] + lam * g)
    return g`,
    testCases: [
      { input: [[1.0, 1.0], [0.0, 0.0, 0.0], 0.9, 0.5], expected: 1.45 },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.0], expected: 2.8 },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 1.0], expected: 4.33 },
      { input: [[], [4.0], 0.9, 0.5], expected: 4.0 },
      { input: [[2.0], [1.0, 1.0], 0.5, 0.5], expected: 2.5 },
    ],
    hint: "Lambda blends the one-step value estimate with the longer-horizon return.",
  },
  {
    id: "rl-344",
    title: "Imagined Actor Gradient Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one actor update averaged over a batch of imagined states.\n\nFor each parameter take the mean over imagined steps of advantage_t * policy_grads[t][i], scale by lr, and add it to params[i]. An empty advantage list returns the parameters unchanged.",
    starterCode: `def imagined_actor_step(params, policy_grads, advantages, lr):
    # Your code here
    pass`,
    solution: `def imagined_actor_step(params, policy_grads, advantages, lr):
    n = len(advantages)
    if n == 0:
        return list(params)
    res = []
    for i in range(len(params)):
        g = 0.0
        for t in range(n):
            g += advantages[t] * policy_grads[t][i]
        res.append(params[i] + lr * g / n)
    return res`,
    testCases: [
      { input: [[1.0], [[2.0], [4.0]], [1.0, 1.0], 0.5], expected: [2.5] },
      { input: [[0.0, 1.0], [[1.0, 0.0], [0.0, -1.0]], [2.0, -1.0], 0.1], expected: [0.1, 1.05] },
      { input: [[1.0], [], [], 1.0], expected: [1.0] },
      { input: [[2.0, 3.0], [[1.0, 2.0]], [0.0], 5.0], expected: [2.0, 3.0] },
    ],
    hint: "In Dreamer the actor learns entirely from imagined trajectories, not real transitions.",
  },
  {
    id: "rl-345",
    title: "MPC Replan Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how many full-horizon plans a receding-horizon controller can run.\n\nA plan starting at step t needs t + horizon <= episode_length, so the number of start steps is episode_length - horizon + 1. Return 0 when the horizon is non-positive or longer than the episode.",
    starterCode: `def mpc_replan_count(episode_length, horizon):
    # Your code here
    pass`,
    solution: `def mpc_replan_count(episode_length, horizon):
    if horizon <= 0 or episode_length < horizon:
        return 0
    return episode_length - horizon + 1`,
    testCases: [
      { input: [10, 3], expected: 8 },
      { input: [5, 5], expected: 1 },
      { input: [4, 5], expected: 0 },
      { input: [10, 0], expected: 0 },
      { input: [1, 1], expected: 1 },
    ],
    hint: "MPC executes only the first action of each plan, then plans again.",
  },
  {
    id: "rl-346",
    title: "CEM Elite Sample Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute how many candidates the cross-entropy method keeps as elites.\n\nReturn floor(population * elite_fraction) raised to at least 1 and capped at population. A non-positive population or fraction returns 0.",
    starterCode: `import math
def cem_elite_count(population, elite_fraction):
    # Your code here
    pass`,
    solution: `import math
def cem_elite_count(population, elite_fraction):
    if population <= 0 or elite_fraction <= 0.0:
        return 0
    count = int(math.floor(population * elite_fraction))
    if count < 1:
        count = 1
    if count > population:
        count = population
    return count`,
    testCases: [
      { input: [100, 0.1], expected: 10 },
      { input: [100, 0.05], expected: 5 },
      { input: [7, 0.1], expected: 1 },
      { input: [10, 1.0], expected: 10 },
      { input: [0, 0.5], expected: 0 },
    ],
    hint: "At least one elite is kept so the distribution always has a target to refit.",
  },
  {
    id: "rl-347",
    title: "MCTS UCB Score Vector",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Score every MCTS child with the UCB rule.\n\nFor child i with visits n_i (at least 1 for the exploration term) the score is wins[i] / n_i + c * sqrt(ln(parent_visits + 1) / n_i). Unvisited children use n_i = 1, so they get an optimistic bonus. Return the list of scores.",
    starterCode: `import math
def mcts_ucb_scores(wins, visits, parent_visits, c):
    # Your code here
    pass`,
    solution: `import math
def mcts_ucb_scores(wins, visits, parent_visits, c):
    log_parent = math.log(parent_visits + 1.0)
    scores = []
    for i in range(len(wins)):
        n = visits[i] if visits[i] > 0 else 1
        scores.append(wins[i] / n + c * math.sqrt(log_parent / n))
    return scores`,
    testCases: [
      { input: [[5.0, 2.0], [10, 10], 20, 1.0], expected: [1.0517719128157417, 0.7517719128157416] },
      { input: [[0.0, 1.0], [0, 5], 10, 2.0], expected: [3.097027783406775, 1.5850329303806088] },
      { input: [[3.0], [4], 0, 1.0], expected: [0.75] },
      { input: [[], [], 7, 1.5], expected: [] },
    ],
    hint: "The exploration bonus shrinks as a child accumulates visits.",
  },
  {
    id: "rl-348",
    title: "PUCT Exploration Term",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the exploration term that AlphaZero adds to a child's action value.\n\nReturn c * prior * sqrt(parent_visits + 1) / (1 + child_visits). Adding one inside the square root and the denominator keeps the term finite for unvisited children.",
    starterCode: `import math
def puct_exploration_term(prior, parent_visits, child_visits, c):
    # Your code here
    pass`,
    solution: `import math
def puct_exploration_term(prior, parent_visits, child_visits, c):
    return c * prior * math.sqrt(parent_visits + 1.0) / (1.0 + child_visits)`,
    testCases: [
      { input: [0.5, 100, 10, 1.0], expected: 0.45681252823276774 },
      { input: [0.25, 4, 0, 2.0], expected: 1.118033988749895 },
      { input: [0.5, 0, 0, 1.0], expected: 0.5 },
      { input: [0.1, 25, 3, 0.5], expected: 0.06373774391990981 },
    ],
    hint: "The prior scales how strongly an unvisited but promising child is pushed.",
  },
  {
    id: "rl-349",
    title: "Root Dirichlet Concentration",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the Dirichlet concentration AlphaZero uses for root exploration noise.\n\nThe standard choice is alpha = 10 / n_legal_moves, so the noise stays proportional to the number of available moves. A non-positive move count returns 0.0.",
    starterCode: `def root_dirichlet_concentration(n_legal_moves):
    # Your code here
    pass`,
    solution: `def root_dirichlet_concentration(n_legal_moves):
    if n_legal_moves <= 0:
        return 0.0
    return 10.0 / n_legal_moves`,
    testCases: [
      { input: [10], expected: 1.0 },
      { input: [1], expected: 10.0 },
      { input: [0], expected: 0.0 },
      { input: [4], expected: 2.5 },
    ],
    hint: "Small concentrations concentrate the noise on a few moves; large ones spread it.",
  },
  {
    id: "rl-350",
    title: "Virtual Loss Apply",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Apply a virtual loss to a node so parallel MCTS workers spread out.\n\nReturn [[w - virtual_loss for w in wins], [v + 1 for v in visits]], discouraging other workers from selecting the same path.",
    starterCode: `def virtual_loss_apply(wins, visits, virtual_loss):
    # Your code here
    pass`,
    solution: `def virtual_loss_apply(wins, visits, virtual_loss):
    return [[w - virtual_loss for w in wins], [v + 1 for v in visits]]`,
    testCases: [
      { input: [[3.0, 1.0], [2, 4], 1.0], expected: [[2.0, 0.0], [3, 5]] },
      { input: [[0.0], [0], 0.5], expected: [[-0.5], [1]] },
      { input: [[], [], 2.0], expected: [[], []] },
      { input: [[2.0, -1.0], [5, 2], 0.25], expected: [[1.75, -1.25], [6, 3]] },
    ],
    hint: "The virtual visit count also lowers the node's average value.",
  },
  {
    id: "rl-351",
    title: "Self-Play Temperature Schedule",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the move-selection temperature during self-play.\n\nBefore switch_move the temperature is 1.0. Afterwards it decays linearly, tau = 1 - (move_index - switch_move) * (1 - tau_min) / decay_steps, floored at tau_min. A non-positive decay_steps jumps straight to tau_min.",
    starterCode: `def self_play_temperature_schedule(move_index, switch_move, decay_steps, tau_min):
    # Your code here
    pass`,
    solution: `def self_play_temperature_schedule(move_index, switch_move, decay_steps, tau_min):
    if move_index < switch_move:
        return 1.0
    if decay_steps <= 0:
        return tau_min
    over = move_index - switch_move
    tau = 1.0 - over * (1.0 - tau_min) / decay_steps
    if tau < tau_min:
        return tau_min
    return tau`,
    testCases: [
      { input: [0, 10, 20, 0.1], expected: 1.0 },
      { input: [10, 10, 20, 0.1], expected: 1.0 },
      { input: [20, 10, 20, 0.1], expected: 0.55 },
      { input: [50, 10, 20, 0.1], expected: 0.1 },
      { input: [15, 10, 0, 0.5], expected: 0.5 },
    ],
    hint: "Early moves stay exploratory; late moves become nearly greedy.",
  },
  {
    id: "rl-352",
    title: "Elo Win Probability",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the Elo probability that player A beats player B: 1 / (1 + 10^((rating_b - rating_a) / 400)). Equal ratings give 0.5.",
    starterCode: `def elo_win_probability(rating_a, rating_b):
    # Your code here
    pass`,
    solution: `def elo_win_probability(rating_a, rating_b):
    return 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))`,
    testCases: [
      { input: [1500.0, 1500.0], expected: 0.5 },
      { input: [1600.0, 1400.0], expected: 0.7597469266479578 },
      { input: [1400.0, 1600.0], expected: 0.2402530733520421 },
      { input: [2000.0, 1000.0], expected: 0.9968476908167399 },
    ],
    hint: "A 400-point gap corresponds to roughly a 10-to-1 expected score.",
  },
  {
    id: "rl-353",
    title: "League Exploiter Fraction",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the fraction of a league population made up of exploiters: exploiter_agents / (main_agents + exploiter_agents). An empty league returns 0.0.",
    starterCode: `def league_exploiter_fraction(main_agents, exploiter_agents):
    # Your code here
    pass`,
    solution: `def league_exploiter_fraction(main_agents, exploiter_agents):
    total = main_agents + exploiter_agents
    if total <= 0:
        return 0.0
    return exploiter_agents / total`,
    testCases: [
      { input: [10, 5], expected: 0.3333333333333333 },
      { input: [0, 4], expected: 1.0 },
      { input: [7, 0], expected: 0.0 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "Exploiters specialize in beating the current main agents to expose weaknesses.",
  },
  {
    id: "rl-354",
    title: "MAML Inner Loop Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Run the MAML inner loop on one task by applying a sequence of gradient steps.\n\nStarting from params, apply theta = theta - lr * grads for each gradient vector in grad_steps and return the adapted parameters. An empty grad_steps returns a copy of params.",
    starterCode: `def maml_inner_loop(params, grad_steps, lr):
    # Your code here
    pass`,
    solution: `def maml_inner_loop(params, grad_steps, lr):
    theta = list(params)
    for grads in grad_steps:
        theta = [theta[i] - lr * grads[i] for i in range(len(theta))]
    return theta`,
    testCases: [
      { input: [[1.0, 2.0], [[0.5, -0.5]], 0.1], expected: [0.95, 2.05] },
      { input: [[0.0], [[1.0], [1.0]], 0.5], expected: [-1.0] },
      { input: [[1.0], [], 1.0], expected: [1.0] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "These are the fast adaptation steps MAML differentiates through when computing the meta-gradient.",
  },
  {
    id: "rl-355",
    title: "Reptile Meta Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one Reptile meta-update toward a task-adapted parameter vector.\n\nReturn params + meta_lr * (adapted_params - params) elementwise, moving the initialization toward the adapted solution. Empty vectors return [].",
    starterCode: `def reptile_meta_update(params, adapted_params, meta_lr):
    # Your code here
    pass`,
    solution: `def reptile_meta_update(params, adapted_params, meta_lr):
    return [params[i] + meta_lr * (adapted_params[i] - params[i]) for i in range(len(params))]`,
    testCases: [
      { input: [[0.0, 1.0], [1.0, 3.0], 0.1], expected: [0.1, 1.2] },
      { input: [[1.0, 1.0], [0.0, 2.0], 0.5], expected: [0.5, 1.5] },
      { input: [[1.0], [1.0], 1.0], expected: [1.0] },
      { input: [[], [], 0.5], expected: [] },
    ],
    hint: "Reptile needs no second derivatives because it moves toward the adapted weights directly.",
  },
  {
    id: "rl-356",
    title: "In-Context RL Prompt Length",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute how many tokens of an in-context RL prompt fit before hitting the context window.\n\nThe available budget is context_window - reserve, and the prompt wants n_transitions * tokens_per_transition tokens. Return the smaller of the two, floored at 0 when the budget is non-positive.",
    starterCode: `def in_context_prompt_length(n_transitions, tokens_per_transition, context_window, reserve):
    # Your code here
    pass`,
    solution: `def in_context_prompt_length(n_transitions, tokens_per_transition, context_window, reserve):
    budget = context_window - reserve
    if budget <= 0:
        return 0
    wanted = n_transitions * tokens_per_transition
    return wanted if wanted < budget else budget`,
    testCases: [
      { input: [20, 50, 2048, 128], expected: 1000 },
      { input: [50, 50, 2048, 128], expected: 1920 },
      { input: [10, 0, 1024, 24], expected: 0 },
      { input: [100, 10, 32, 32], expected: 0 },
      { input: [2, 3, 10, 4], expected: 6 },
    ],
    hint: "Longer demonstration prompts help until they crowd out room for the answer.",
  },
  {
    id: "rl-357",
    title: "Skill Mutual Information",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the mutual information between skills and states for unsupervised skill discovery.\n\nWith a uniform state distribution, MI = (1 / n_states) * sum over states and skills of p(z|s) * ln(p(z|s) / p(z)), counting only terms with positive probability. Empty inputs return 0.0.",
    starterCode: `import math
def skill_mutual_information(skill_probs, posteriors):
    # Your code here
    pass`,
    solution: `import math
def skill_mutual_information(skill_probs, posteriors):
    if not skill_probs or not posteriors:
        return 0.0
    mi = 0.0
    for row in posteriors:
        for z in range(len(skill_probs)):
            p = row[z]
            if p > 0.0 and skill_probs[z] > 0.0:
                mi += p * math.log(p / skill_probs[z])
    return mi / len(posteriors)`,
    testCases: [
      { input: [[0.5, 0.5], [[1.0, 0.0]]], expected: 0.6931471805599453 },
      { input: [[0.5, 0.5], [[0.5, 0.5], [0.5, 0.5]]], expected: 0.0 },
      { input: [[0.25, 0.75], [[0.25, 0.75], [0.5, 0.5]]], expected: 0.07192051811294521 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Maximizing this objective makes skills distinguishable from the states they visit.",
  },
  {
    id: "rl-358",
    title: "Option Termination Probability",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the probability that an option with per-step termination probability beta has ended after a number of steps.\n\nReturn 1 - (1 - beta)^steps. Non-positive steps or beta give 0.0 and beta at least 1 gives 1.0.",
    starterCode: `def option_termination_probability(beta, steps):
    # Your code here
    pass`,
    solution: `def option_termination_probability(beta, steps):
    if steps <= 0:
        return 0.0
    if beta <= 0.0:
        return 0.0
    if beta >= 1.0:
        return 1.0
    return 1.0 - (1.0 - beta) ** steps`,
    testCases: [
      { input: [0.1, 1], expected: 0.09999999999999998 },
      { input: [0.5, 3], expected: 0.875 },
      { input: [0.0, 10], expected: 0.0 },
      { input: [1.0, 5], expected: 1.0 },
      { input: [0.2, 0], expected: 0.0 },
    ],
    hint: "Termination is geometric, so survival decays as (1 - beta) per step.",
  },
  {
    id: "rl-359",
    title: "SMDP Discounted Target",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the semi-Markov decision process target for an option that lasted duration steps.\n\nReturn total_reward + gamma^duration * max_q_next, discounting the next-state value once per primitive step consumed by the option.",
    starterCode: `def smdp_discounted_target(total_reward, duration, gamma, max_q_next):
    # Your code here
    pass`,
    solution: `def smdp_discounted_target(total_reward, duration, gamma, max_q_next):
    return total_reward + (gamma ** duration) * max_q_next`,
    testCases: [
      { input: [5.0, 3, 0.9, 10.0], expected: 12.290000000000001 },
      { input: [0.0, 0, 0.5, 4.0], expected: 4.0 },
      { input: [1.0, 1, 1.0, 2.0], expected: 3.0 },
      { input: [2.0, 2, 0.5, 8.0], expected: 4.0 },
    ],
    hint: "Long options are discounted by gamma raised to their duration, not to one.",
  },
  {
    id: "rl-360",
    title: "Potential Shaping Return Offset",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Measure how potential-based shaping changes the discounted return.\n\nCompute the plain discounted return of rewards, the return of the shaped rewards r_t + gamma * potentials[t + 1] - potentials[t], and return their difference. potentials has one more entry than rewards and an empty reward list returns 0.0.",
    starterCode: `def shaping_return_offset(rewards, potentials, gamma):
    # Your code here
    pass`,
    solution: `def shaping_return_offset(rewards, potentials, gamma):
    g = 0.0
    power = 1.0
    for r in rewards:
        g += power * r
        power *= gamma
    g_shaped = 0.0
    power = 1.0
    for t in range(len(rewards)):
        g_shaped += power * (rewards[t] + gamma * potentials[t + 1] - potentials[t])
        power *= gamma
    return g_shaped - g`,
    testCases: [
      { input: [[1.0, 2.0], [0.0, 1.0, 2.0], 0.9], expected: 1.62 },
      { input: [[1.0], [1.0, 1.0], 0.9], expected: -0.10000000000000009 },
      { input: [[2.0, 0.0], [2.0, 0.0, 0.0], 0.5], expected: -2.0 },
      { input: [[], [3.0], 0.9], expected: 0.0 },
      { input: [[0.0, 4.0], [1.0, 3.0, 2.0], 1.0], expected: 1.0 },
    ],
    hint: "The offset telescopes to gamma^T * phi(s_T) - phi(s_0), independent of the rewards.",
  },
];
