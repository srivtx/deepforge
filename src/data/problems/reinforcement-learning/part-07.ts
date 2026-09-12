import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-271",
    title: "GRPO Objective Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the GRPO clipped surrogate objective over one group.\n\nFor each sample form the ratio exp(log_probs[i] - old_log_probs[i]) and use rewards[i] as the group-relative advantage. Return the mean of min(ratio * advantage, clip(ratio, 1 - clip_eps, 1 + clip_eps) * advantage); an empty group returns 0.0.",
    starterCode: `import math
def grpo_objective(rewards, log_probs, old_log_probs, clip_eps):
    # Your code here
    pass`,
    solution: `import math
def grpo_objective(rewards, log_probs, old_log_probs, clip_eps):
    n = len(rewards)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        ratio = math.exp(log_probs[i] - old_log_probs[i])
        clipped = max(1.0 - clip_eps, min(1.0 + clip_eps, ratio))
        total += min(ratio * rewards[i], clipped * rewards[i])
    return total / n`,
    testCases: [
      { input: [[1.0, -1.0], [0.0, 0.0], [0.0, 0.0], 0.2], expected: 0.0 },
      { input: [[1.0], [-0.1], [-0.5], 0.2], expected: 1.2 },
      { input: [[-1.0], [-0.1], [-0.5], 0.2], expected: -1.4918246976412703 },
      { input: [[], [], [], 0.2], expected: 0.0 },
    ],
    hint: "The pessimistic min keeps the update honest when the ratio leaves the trust region.",
  },
  {
    id: "rl-272",
    title: "GRPO Group Advantage Normalization",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Normalize the rewards inside every group of a GRPO batch.\n\nFor each group compute (r - group_mean) / group_population_std. Groups with fewer than two samples or zero standard deviation become zeros, and an empty group stays empty.",
    starterCode: `import math
def grpo_group_advantages(group_rewards):
    # Your code here
    pass`,
    solution: `import math
def grpo_group_advantages(group_rewards):
    out = []
    for rewards in group_rewards:
        n = len(rewards)
        if n == 0:
            out.append([])
            continue
        mean = sum(rewards) / n
        var = sum((r - mean) ** 2 for r in rewards) / n
        std = math.sqrt(var)
        if n < 2 or std == 0.0:
            out.append([0.0 for _ in rewards])
        else:
            out.append([(r - mean) / std for r in rewards])
    return out`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0]]], expected: [[-1.224744871391589, 0.0, 1.224744871391589]] },
      { input: [[[1.0, 1.0, 1.0], [0.0, 2.0]]], expected: [[0.0, 0.0, 0.0], [-1.0, 1.0]] },
      { input: [[[5.0], []]], expected: [[0.0], []] },
      { input: [[]], expected: [] },
    ],
    hint: "GRPO drops the value network and uses the group itself as the baseline.",
  },
  {
    id: "rl-273",
    title: "GRPO Masked KL Penalty",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate the GRPO KL penalty on completion tokens only.\n\nFor every position with mask[i] = 1 accumulate the non-negative estimator exp(d) - d - 1 where d = ref_log_probs[i] - log_probs[i], then return the masked mean. A zero total mask returns 0.0.",
    starterCode: `import math
def grpo_kl_penalty(log_probs, ref_log_probs, mask):
    # Your code here
    pass`,
    solution: `import math
def grpo_kl_penalty(log_probs, ref_log_probs, mask):
    total = 0.0
    weight = 0.0
    for i in range(len(log_probs)):
        m = mask[i]
        if m == 0:
            continue
        diff = ref_log_probs[i] - log_probs[i]
        total += m * (math.exp(diff) - diff - 1.0)
        weight += m
    if weight == 0.0:
        return 0.0
    return total / weight`,
    testCases: [
      { input: [[-1.0, -1.0], [-1.0, -1.0], [1, 1]], expected: 0.0 },
      { input: [[-2.0], [-1.0], [1]], expected: 0.7182818284590451 },
      { input: [[-2.0], [-1.0], [0]], expected: 0.0 },
      { input: [[-1.0, -2.0], [-2.0, -1.0], [1, 1]], expected: 0.5430806348152437 },
    ],
    hint: "Only completion tokens should pull the policy toward the reference model.",
  },
  {
    id: "rl-274",
    title: "DPO Loss Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the mean DPO loss over preference pairs.\n\nWith margin = beta * ((policy_chosen - ref_chosen) - (policy_rejected - ref_rejected)), each pair contributes softplus(-margin) = log(1 + exp(-margin)). Use the numerically stable form max(y, 0) + log1p(exp(-|y|)) with y = -margin; an empty batch returns 0.0.",
    starterCode: `import math
def dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    # Your code here
    pass`,
    solution: `import math
def dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    n = len(policy_chosen)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        margin = beta * ((policy_chosen[i] - ref_chosen[i]) - (policy_rejected[i] - ref_rejected[i]))
        y = -margin
        total += max(y, 0.0) + math.log1p(math.exp(-abs(y)))
    return total / n`,
    testCases: [
      { input: [[0.0], [0.0], [0.0], [0.0], 0.1], expected: 0.6931471805599453 },
      { input: [[0.0], [-1.0], [0.0], [0.0], 0.1], expected: 0.6443966600735709 },
      { input: [[0.5], [0.0], [0.0], [0.0], 1.0], expected: 0.4740769841801067 },
      { input: [[], [], [], [], 0.5], expected: 0.0 },
    ],
    hint: "DPO turns the reward-model softmax loss into a loss directly on policy log-probabilities.",
  },
  {
    id: "rl-275",
    title: "DPO Implicit Reward Gap",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the mean implicit reward gap of DPO.\n\nEach pair contributes beta * ((policy_chosen - ref_chosen) - (policy_rejected - ref_rejected)); return the average over pairs. An empty batch returns 0.0.",
    starterCode: `def dpo_reward_gap(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    # Your code here
    pass`,
    solution: `def dpo_reward_gap(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    n = len(policy_chosen)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        total += (policy_chosen[i] - ref_chosen[i]) - (policy_rejected[i] - ref_rejected[i])
    return beta * total / n`,
    testCases: [
      { input: [[0.0], [-1.0], [0.0], [0.0], 0.1], expected: 0.1 },
      { input: [[-1.0, -2.0], [-2.0, -1.0], [-1.0, -2.0], [-2.0, -1.0], 0.5], expected: 0.0 },
      { input: [[], [], [], [], 1.0], expected: 0.0 },
    ],
    hint: "This gap is exactly the reward DPO assigns to the chosen response minus the rejected one.",
  },
  {
    id: "rl-276",
    title: "IPO Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the mean identity preference optimization loss.\n\nFor each pair let h = (policy_chosen - ref_chosen) - (policy_rejected - ref_rejected), then average (h - 1 / (2 * beta)) squared over the batch. An empty batch returns 0.0.",
    starterCode: `def ipo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    # Your code here
    pass`,
    solution: `def ipo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta):
    n = len(policy_chosen)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        h = (policy_chosen[i] - ref_chosen[i]) - (policy_rejected[i] - ref_rejected[i])
        total += (h - 1.0 / (2.0 * beta)) ** 2
    return total / n`,
    testCases: [
      { input: [[0.5], [0.0], [0.0], [0.0], 0.1], expected: 20.25 },
      { input: [[0.0], [0.0], [0.0], [0.0], 0.5], expected: 1.0 },
      { input: [[1.0], [0.0], [0.0], [0.0], 1.0], expected: 0.25 },
      { input: [[], [], [], [], 0.5], expected: 0.0 },
    ],
    hint: "IPO targets a fixed margin instead of letting the preference gap grow forever.",
  },
  {
    id: "rl-277",
    title: "KTO Loss Shape",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the mean simplified KTO loss with an asymmetric sigmoid.\n\nWith delta = policy_logp - ref_logp, a desirable sample contributes 1 - sigmoid(beta * (delta - z0)) and an undesirable sample contributes 1 - sigmoid(beta * (z0 - delta)). Return the batch mean, or 0.0 when empty.",
    starterCode: `import math
def kto_loss(policy_logps, ref_logps, desirable, beta, z0):
    # Your code here
    pass`,
    solution: `import math
def kto_loss(policy_logps, ref_logps, desirable, beta, z0):
    n = len(policy_logps)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        delta = policy_logps[i] - ref_logps[i]
        if desirable[i]:
            x = beta * (delta - z0)
        else:
            x = beta * (z0 - delta)
        total += 1.0 - 1.0 / (1.0 + math.exp(-x))
    return total / n`,
    testCases: [
      { input: [[0.0], [0.0], [true], 1.0, 0.0], expected: 0.5 },
      { input: [[1.0], [0.0], [true], 1.0, 0.0], expected: 0.2689414213699951 },
      { input: [[1.0], [0.0], [false], 1.0, 0.0], expected: 0.7310585786300049 },
      { input: [[], [], [], 1.0, 0.0], expected: 0.0 },
    ],
    hint: "KTO treats desirable and undesirable examples asymmetrically, so the same delta gets different losses.",
  },
  {
    id: "rl-278",
    title: "ORPO Odds-Ratio Term",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the ORPO preference term added to the supervised loss.\n\nWith d = chosen_log_odds - rejected_log_odds, the penalty is -log(sigmoid(d)) = softplus(-d); return sft_nll + lambda_ * softplus(-d) using the stable form max(-d, 0) + log1p(exp(-|d|)).",
    starterCode: `import math
def orpo_loss(sft_nll, chosen_log_odds, rejected_log_odds, lambda_):
    # Your code here
    pass`,
    solution: `import math
def orpo_loss(sft_nll, chosen_log_odds, rejected_log_odds, lambda_):
    d = chosen_log_odds - rejected_log_odds
    y = -d
    return sft_nll + lambda_ * (max(y, 0.0) + math.log1p(math.exp(-abs(y))))`,
    testCases: [
      { input: [1.0, 0.0, 0.0, 0.5], expected: 1.3465735902799727 },
      { input: [1.0, 1.0, 0.0, 0.5], expected: 1.1566308437591115 },
      { input: [0.0, -1.0, 0.0, 1.0], expected: 1.3132616875182228 },
    ],
    hint: "ORPO adds this odds-ratio penalty to standard next-token training, avoiding a separate SFT stage.",
  },
  {
    id: "rl-279",
    title: "SimPO Length-Normalized Reward",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the SimPO length-normalized reward margin for one pair.\n\nAverage the token log-probabilities inside each sequence, then return beta * (mean_chosen - mean_rejected) - gamma. If either sequence is empty return 0.0.",
    starterCode: `def simpo_reward(chosen_logps, rejected_logps, beta, gamma):
    # Your code here
    pass`,
    solution: `def simpo_reward(chosen_logps, rejected_logps, beta, gamma):
    if len(chosen_logps) == 0 or len(rejected_logps) == 0:
        return 0.0
    avg_chosen = sum(chosen_logps) / len(chosen_logps)
    avg_rejected = sum(rejected_logps) / len(rejected_logps)
    return beta * (avg_chosen - avg_rejected) - gamma`,
    testCases: [
      { input: [[-1.0, -1.0], [-2.0, -2.0], 2.0, 0.5], expected: 1.5 },
      { input: [[-1.0], [-1.0], 1.0, 0.5], expected: -0.5 },
      { input: [[-0.5, -1.5], [-2.0, -2.0], 1.0, 0.0], expected: 1.0 },
      { input: [[], [], 1.0, 0.0], expected: 0.0 },
    ],
    hint: "Dividing by sequence length removes the model's incentive to pad the preferred answer.",
  },
  {
    id: "rl-280",
    title: "Length-Normalized Sequence Log Prob",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the length-normalized log-probability of every sequence, i.e. the mean token log-probability of that sequence. An empty sequence contributes 0.0, and an empty batch returns [].",
    starterCode: `def mean_sequence_logps(sequences):
    # Your code here
    pass`,
    solution: `def mean_sequence_logps(sequences):
    out = []
    for seq in sequences:
        if len(seq) == 0:
            out.append(0.0)
        else:
            out.append(sum(seq) / len(seq))
    return out`,
    testCases: [
      { input: [[[-1.0, -2.0], [0.0], []]], expected: [-1.5, 0.0, 0.0] },
      { input: [[[-0.5, -0.5, -0.5]]], expected: [-0.5] },
      { input: [[[]]], expected: [0.0] },
    ],
    hint: "Length normalization is what lets you compare log-probabilities across different sequence lengths.",
  },
  {
    id: "rl-281",
    title: "Weighted Bradley-Terry Reward Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a weighted Bradley-Terry reward-model loss.\n\nEach pair contributes weight[i] * softplus(-(r_pref - r_rej)), using the stable form max(y, 0) + log1p(exp(-|y|)) with y = -(r_pref - r_rej), and the total is divided by the sum of the weights. Return 0.0 when the batch is empty or all weights are zero.",
    starterCode: `import math
def weighted_bt_loss(r_pref, r_rej, weights):
    # Your code here
    pass`,
    solution: `import math
def weighted_bt_loss(r_pref, r_rej, weights):
    n = len(r_pref)
    if n == 0:
        return 0.0
    weight_sum = sum(weights)
    if weight_sum == 0.0:
        return 0.0
    total = 0.0
    for i in range(n):
        y = -(r_pref[i] - r_rej[i])
        loss = max(y, 0.0) + math.log1p(math.exp(-abs(y)))
        total += weights[i] * loss
    return total / weight_sum`,
    testCases: [
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, 1.0]], expected: 0.6931471805599453 },
      { input: [[1.0, 0.0], [0.0, 0.0], [1.0, 3.0]], expected: 0.5981758072995147 },
      { input: [[1.0], [0.0], [0.0]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Sample weights let you downweight noisy or low-confidence preference pairs.",
  },
  {
    id: "rl-282",
    title: "Pairwise Reward Accuracy",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Measure the pairwise accuracy of a reward model.\n\nScore 1.0 when r_pref > r_rej, 0.5 on a tie, and 0.0 otherwise, then return the mean over pairs. An empty batch returns 0.0.",
    starterCode: `def pairwise_accuracy(r_pref, r_rej):
    # Your code here
    pass`,
    solution: `def pairwise_accuracy(r_pref, r_rej):
    n = len(r_pref)
    if n == 0:
        return 0.0
    score = 0.0
    for i in range(n):
        if r_pref[i] > r_rej[i]:
            score += 1.0
        elif r_pref[i] == r_rej[i]:
            score += 0.5
    return score / n`,
    testCases: [
      { input: [[2.0, 1.0], [1.0, 2.0]], expected: 0.5 },
      { input: [[1.0, 1.0], [0.0, 1.0]], expected: 0.75 },
      { input: [[3.0], [3.0]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Ties count as half a win because the model failed to separate the pair.",
  },
  {
    id: "rl-283",
    title: "Process Reward Step Values",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the discounted process-reward value at every step.\n\nWalking backward, V[t] = step_rewards[t] + gamma * V[t + 1] with the value after the last step equal to 0. Return the list of values; an empty episode returns [].",
    starterCode: `def prm_step_values(step_rewards, gamma):
    # Your code here
    pass`,
    solution: `def prm_step_values(step_rewards, gamma):
    n = len(step_rewards)
    out = [0.0] * n
    running = 0.0
    for t in range(n - 1, -1, -1):
        running = step_rewards[t] + gamma * running
        out[t] = running
    return out`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], 0.5], expected: [1.75, 1.5, 1.0] },
      { input: [[1.0, 1.0, 1.0], 0.0], expected: [1.0, 1.0, 1.0] },
      { input: [[0.5], 0.9], expected: [0.5] },
      { input: [[], 0.9], expected: [] },
    ],
    hint: "A process reward model scores each reasoning step, not just the final answer.",
  },
  {
    id: "rl-284",
    title: "Best-of-N Expected Quality",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Estimate the expected maximum quality when n samples are drawn uniformly from a finite list.\n\nSort the observed qualities and use the empirical CDF: E[max] = sum over k of q[k] * (F[k]^n - F[k - 1]^n) where F[k] = (k + 1) / m and F[-1] = 0. Return 0.0 for an empty list or n <= 0.",
    starterCode: `def best_of_n_expected_quality(qualities, n):
    # Your code here
    pass`,
    solution: `def best_of_n_expected_quality(qualities, n):
    m = len(qualities)
    if m == 0 or n <= 0:
        return 0.0
    ordered = sorted(qualities)
    total = 0.0
    prev = 0.0
    for k in range(m):
        cdf = (k + 1) / m
        total += ordered[k] * (cdf ** n - prev)
        prev = cdf ** n
    return total`,
    testCases: [
      { input: [[0.0, 1.0], 1], expected: 0.5 },
      { input: [[0.0, 1.0], 2], expected: 0.75 },
      { input: [[1.0, 2.0, 3.0], 2], expected: 2.4444444444444446 },
      { input: [[], 2], expected: 0.0 },
      { input: [[0.5], 3], expected: 0.5 },
    ],
    hint: "Rejection sampling improves the expected best sample, but with diminishing returns.",
  },
  {
    id: "rl-285",
    title: "Best-of-N Pass At K",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the unbiased pass@k estimator from n generated samples with c correct ones: 1 - C(n - c, k) / C(n, k). Return 1.0 when n - c < k or c >= n, and 0.0 when n <= 0 or k <= 0. Use math.comb.",
    starterCode: `import math
def pass_at_k(n, c, k):
    # Your code here
    pass`,
    solution: `import math
def pass_at_k(n, c, k):
    if n <= 0 or k <= 0:
        return 0.0
    if c >= n:
        return 1.0
    if n - c < k:
        return 1.0
    return 1.0 - math.comb(n - c, k) / math.comb(n, k)`,
    testCases: [
      { input: [5, 2, 2], expected: 0.7 },
      { input: [10, 2, 1], expected: 0.2 },
      { input: [5, 0, 3], expected: 0.0 },
      { input: [3, 3, 1], expected: 1.0 },
      { input: [5, 1, 5], expected: 1.0 },
    ],
    hint: "The combinatorial form is an unbiased estimate, unlike simply counting pass rates.",
  },
  {
    id: "rl-286",
    title: "PPO Clip Objective Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the PPO clipped surrogate objective over a batch.\n\nFor each sample take min(ratio * advantage, clip(ratio, 1 - clip_eps, 1 + clip_eps) * advantage) and return the mean. An empty batch returns 0.0.",
    starterCode: `def ppo_clip_objective(ratios, advantages, clip_eps):
    # Your code here
    pass`,
    solution: `def ppo_clip_objective(ratios, advantages, clip_eps):
    n = len(ratios)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        clipped = max(1.0 - clip_eps, min(1.0 + clip_eps, ratios[i]))
        total += min(ratios[i] * advantages[i], clipped * advantages[i])
    return total / n`,
    testCases: [
      { input: [[1.0], [2.0], 0.2], expected: 2.0 },
      { input: [[1.5], [1.0], 0.2], expected: 1.2 },
      { input: [[0.5], [-1.0], 0.2], expected: -0.8 },
      { input: [[1.5, 0.5], [1.0, -1.0], 0.2], expected: 0.2 },
      { input: [[], [], 0.2], expected: 0.0 },
    ],
    hint: "This is the objective PPO maximizes, so the value is a reward-like score rather than a loss.",
  },
  {
    id: "rl-287",
    title: "PPO Minibatch Advantage Normalization",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Standardize PPO advantages inside a minibatch with (a - mean) / (population_std + epsilon). If every advantage is equal, or the batch has one element, return zeros; an empty batch returns [].",
    starterCode: `import math
def ppo_standardize_advantages(advantages, epsilon):
    # Your code here
    pass`,
    solution: `import math
def ppo_standardize_advantages(advantages, epsilon):
    n = len(advantages)
    if n == 0:
        return []
    mean = sum(advantages) / n
    var = sum((a - mean) ** 2 for a in advantages) / n
    std = math.sqrt(var)
    if std == 0.0:
        return [0.0 for _ in advantages]
    return [(a - mean) / (std + epsilon) for a in advantages]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1e-08], expected: [-1.2247448563915893, 0.0, 1.2247448563915893] },
      { input: [[5.0, 5.0], 1e-08], expected: [0.0, 0.0] },
      { input: [[], 1e-08], expected: [] },
      { input: [[2.0], 1e-08], expected: [0.0] },
    ],
    hint: "Normalizing per minibatch keeps the effective learning rate steady as advantage scales drift.",
  },
  {
    id: "rl-288",
    title: "Truncated GAE Lambda Value",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute generalized advantage estimates from a list of TD residuals with a truncation horizon.\n\nA[t] = sum over l from 0 to horizon - 1 of (gamma * lam)^l * deltas[t + l], stopping at the end of the episode. A non-positive horizon yields all zeros, and an empty list returns [].",
    starterCode: `def truncated_gae(deltas, gamma, lam, horizon):
    # Your code here
    pass`,
    solution: `def truncated_gae(deltas, gamma, lam, horizon):
    n = len(deltas)
    if n == 0:
        return []
    if horizon <= 0:
        return [0.0] * n
    out = []
    decay = gamma * lam
    for t in range(n):
        total = 0.0
        weight = 1.0
        for l in range(horizon):
            if t + l >= n:
                break
            total += weight * deltas[t + l]
            weight *= decay
        out.append(total)
    return out`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], 0.9, 0.5, 2], expected: [1.45, 1.45, 1.0] },
      { input: [[1.0, 1.0, 1.0], 0.9, 0.5, 3], expected: [1.6524999999999999, 1.45, 1.0] },
      { input: [[1.0, 1.0, 1.0], 0.9, 1.0, 3], expected: [2.71, 1.9, 1.0] },
      { input: [[1.0, 2.0], 0.5, 0.5, 0], expected: [0.0, 0.0] },
      { input: [[], 0.9, 0.5, 2], expected: [] },
    ],
    hint: "Truncating the GAE sum bounds variance at the cost of some bias.",
  },
  {
    id: "rl-289",
    title: "Entropy Bonus Term In Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Combine a policy-gradient term with an entropy bonus.\n\nReturn -mean(log_probs[i] * advantages[i]) - coef * mean(entropies). An empty batch returns 0.0.",
    starterCode: `def entropy_regularized_loss(log_probs, advantages, entropies, coef):
    # Your code here
    pass`,
    solution: `def entropy_regularized_loss(log_probs, advantages, entropies, coef):
    n = len(log_probs)
    if n == 0:
        return 0.0
    policy = 0.0
    bonus = 0.0
    for i in range(n):
        policy += log_probs[i] * advantages[i]
        bonus += entropies[i]
    return -policy / n - coef * bonus / n`,
    testCases: [
      { input: [[-1.0, -1.0], [1.0, 1.0], [0.5, 0.5], 0.1], expected: 0.95 },
      { input: [[-2.0], [1.0], [1.0], 0.0], expected: 2.0 },
      { input: [[], [], [], 0.1], expected: 0.0 },
    ],
    hint: "The entropy bonus is subtracted so it rewards keeping the policy stochastic.",
  },
  {
    id: "rl-290",
    title: "KL Coefficient Schedule",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Linearly schedule the KL coefficient over training: beta_start + (beta_end - beta_start) * min(1, step / total_steps), with progress clamped to [0, 1]. A non-positive total_steps returns beta_end.",
    starterCode: `def kl_coefficient_schedule(step, total_steps, beta_start, beta_end):
    # Your code here
    pass`,
    solution: `def kl_coefficient_schedule(step, total_steps, beta_start, beta_end):
    if total_steps <= 0:
        return beta_end
    progress = step / total_steps
    if progress < 0.0:
        progress = 0.0
    if progress > 1.0:
        progress = 1.0
    return beta_start + (beta_end - beta_start) * progress`,
    testCases: [
      { input: [0, 100, 0.0, 0.1], expected: 0.0 },
      { input: [50, 100, 0.0, 0.1], expected: 0.05 },
      { input: [200, 100, 0.0, 0.1], expected: 0.1 },
      { input: [10, 0, 0.5, 0.2], expected: 0.2 },
    ],
    hint: "Warming the KL coefficient up often stabilizes the early phase of RLHF.",
  },
  {
    id: "rl-291",
    title: "Reference Model Drift Check",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Measure drift of a policy from its reference model.\n\nReturn [mean(|ref_log_probs[i] - log_probs[i]|), drift > max_drift]. An empty batch returns [0.0, False].",
    starterCode: `def reference_drift(log_probs, ref_log_probs, max_drift):
    # Your code here
    pass`,
    solution: `def reference_drift(log_probs, ref_log_probs, max_drift):
    n = len(log_probs)
    if n == 0:
        return [0.0, False]
    total = 0.0
    for i in range(n):
        total += abs(ref_log_probs[i] - log_probs[i])
    drift = total / n
    return [drift, drift > max_drift]`,
    testCases: [
      { input: [[-1.0, -2.0], [-1.0, -2.0], 0.5], expected: [0.0, false] },
      { input: [[0.0], [-1.0], 0.5], expected: [1.0, true] },
      { input: [[-1.0, -3.0], [-2.0, -2.0], 0.5], expected: [1.0, true] },
      { input: [[], [], 0.5], expected: [0.0, false] },
    ],
    hint: "Monitoring drift catches a policy that has silently wandered away from its reference.",
  },
  {
    id: "rl-292",
    title: "SFT Loss Masking",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute a masked SFT loss over completion tokens: -sum(log_probs[i] * mask[i]) / sum(mask). If the mask sums to zero or the batch is empty return 0.0.",
    starterCode: `def sft_masked_loss(log_probs, mask):
    # Your code here
    pass`,
    solution: `def sft_masked_loss(log_probs, mask):
    total = 0.0
    weight = 0.0
    for i in range(len(log_probs)):
        total += log_probs[i] * mask[i]
        weight += mask[i]
    if weight == 0.0:
        return 0.0
    return -total / weight`,
    testCases: [
      { input: [[-1.0, -1.0], [1, 1]], expected: 1.0 },
      { input: [[-1.0, -5.0], [1, 0]], expected: 1.0 },
      { input: [[0.0], [0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Masking lets you train only on answer tokens, ignoring the prompt.",
  },
  {
    id: "rl-293",
    title: "Sequence Distillation KL",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the mean token-level distillation KL over a batch.\n\nFor each position scale both student_logits and teacher_logits by 1 / temperature, convert them to distributions p (student) and q (teacher) with a stable softmax, and average KL(q || p) = sum q * (log q - log p) across positions. An empty batch returns 0.0.",
    starterCode: `import math
def distillation_kl(student_logits, teacher_logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def distillation_kl(student_logits, teacher_logits, temperature):
    if len(student_logits) == 0:
        return 0.0
    total = 0.0
    for i in range(len(student_logits)):
        s = [z / temperature for z in student_logits[i]]
        t = [z / temperature for z in teacher_logits[i]]
        ms = max(s)
        mt = max(t)
        ls = ms + math.log(sum(math.exp(z - ms) for z in s))
        lt = mt + math.log(sum(math.exp(z - mt) for z in t))
        kl = 0.0
        for j in range(len(s)):
            log_p = s[j] - ls
            log_q = t[j] - lt
            q = math.exp(log_q)
            kl += q * (log_q - log_p)
        total += kl
    return total / len(student_logits)`,
    testCases: [
      { input: [[[1.0, 0.0]], [[1.0, 0.0]], 1.0], expected: 0.0 },
      { input: [[[1.0, 0.0]], [[0.0, 0.0]], 1.0], expected: 0.12011450695827752 },
      { input: [[[2.0, 0.0]], [[0.0, 0.0]], 0.5], expected: 1.325002747357864 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "Higher temperature softens the teacher distribution so the student sees dark knowledge.",
  },
  {
    id: "rl-294",
    title: "Temperature-Scaled Policy Log-Probs",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the full vector of log-probabilities for a policy after temperature scaling.\n\nCompute log_softmax(logits / temperature) using the max-subtraction trick. Temperature is positive.",
    starterCode: `import math
def temperature_log_probs(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def temperature_log_probs(logits, temperature):
    z = [v / temperature for v in logits]
    m = max(z)
    lse = m + math.log(sum(math.exp(v - m) for v in z))
    return [v - lse for v in z]`,
    testCases: [
      { input: [[0.0, 0.0], 1.0], expected: [-0.6931471805599453, -0.6931471805599453] },
      { input: [[0.0, 1.0], 1.0], expected: [-1.3132616875182228, -0.3132616875182228] },
      { input: [[0.0, 1.0], 0.5], expected: [-2.1269280110429727, -0.1269280110429727] },
    ],
    hint: "PPO needs log-probabilities, so returning log-softmax avoids an extra log of a probability.",
  },
  {
    id: "rl-295",
    title: "Nucleus Sampling Cutoff",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the number of top tokens kept by nucleus sampling.\n\nSort the probabilities in descending order and count how many are needed for their cumulative sum to reach top_p, keeping at least one token and at most all of them. An empty distribution returns 0.",
    starterCode: `def nucleus_cutoff(probs, top_p):
    # Your code here
    pass`,
    solution: `def nucleus_cutoff(probs, top_p):
    n = len(probs)
    if n == 0:
        return 0
    ordered = sorted(probs, reverse=True)
    cumulative = 0.0
    for k in range(n):
        cumulative += ordered[k]
        if cumulative >= top_p:
            return k + 1
    return n`,
    testCases: [
      { input: [[0.5, 0.3, 0.2], 0.6], expected: 2 },
      { input: [[0.5, 0.3, 0.2], 0.5], expected: 1 },
      { input: [[0.5, 0.3, 0.2], 1.0], expected: 3 },
      { input: [[], 0.9], expected: 0 },
    ],
    hint: "Top-p adapts the candidate set size to how concentrated the distribution is.",
  },
  {
    id: "rl-296",
    title: "Logit Bias Application",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Apply per-index logit biases and return the new logits.\n\nFor each k add biases[k] to logits[indices[k]] and return a new list; the original must not be modified. Empty index lists return a copy of the logits.",
    starterCode: `def apply_logit_bias(logits, indices, biases):
    # Your code here
    pass`,
    solution: `def apply_logit_bias(logits, indices, biases):
    out = list(logits)
    for i in range(len(indices)):
        out[indices[i]] += biases[i]
    return out`,
    testCases: [
      { input: [[1.0, 2.0], [1], [5.0]], expected: [1.0, 7.0] },
      { input: [[0.0, 0.0], [0, 1], [-1.0, 1.0]], expected: [-1.0, 1.0] },
      { input: [[], [], []], expected: [] },
    ],
    hint: "Bias vectors let you steer generation without retraining the model.",
  },
  {
    id: "rl-297",
    title: "Proxy-Gold Reward Gap Detector",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Detect suspicious proxy reward growth from evaluation endpoints.\n\nReturn True when the proxy gain (end - start) exceeds the gold gain by more than max_gap, indicating the proxy kept improving while true quality did not.",
    starterCode: `def proxy_gold_gap(proxy_start, proxy_end, gold_start, gold_end, max_gap):
    # Your code here
    pass`,
    solution: `def proxy_gold_gap(proxy_start, proxy_end, gold_start, gold_end, max_gap):
    proxy_gain = proxy_end - proxy_start
    gold_gain = gold_end - gold_start
    return (proxy_gain - gold_gain) > max_gap`,
    testCases: [
      { input: [1.0, 3.0, 1.0, 1.2, 1.0], expected: true },
      { input: [1.0, 2.0, 1.0, 2.5, 1.0], expected: false },
      { input: [1.0, 1.0, 1.0, 1.0, 0.0], expected: false },
    ],
    hint: "A widening proxy-gold gap is one of the cheapest reward-hacking alarms.",
  },
  {
    id: "rl-298",
    title: "Length Bias Correlation",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Measure length bias as the Pearson correlation between rewards and response lengths.\n\nReturn cov / sqrt(var_r * var_l) computed with population moments. Return 0.0 when there are fewer than two points or either variance is zero.",
    starterCode: `import math
def length_bias_correlation(rewards, lengths):
    # Your code here
    pass`,
    solution: `import math
def length_bias_correlation(rewards, lengths):
    n = len(rewards)
    if n < 2:
        return 0.0
    mean_r = sum(rewards) / n
    mean_l = sum(lengths) / n
    cov = 0.0
    var_r = 0.0
    var_l = 0.0
    for i in range(n):
        dr = rewards[i] - mean_r
        dl = lengths[i] - mean_l
        cov += dr * dl
        var_r += dr * dr
        var_l += dl * dl
    if var_r == 0.0 or var_l == 0.0:
        return 0.0
    return cov / math.sqrt(var_r * var_l)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0]], expected: 1.0 },
      { input: [[3.0, 2.0, 1.0], [10.0, 20.0, 30.0]], expected: -1.0 },
      { input: [[1.0, 2.0], [5.0, 5.0]], expected: 0.0 },
      { input: [[1.0], [2.0]], expected: 0.0 },
    ],
    hint: "A positive reward-length correlation is the classic signature of length bias.",
  },
  {
    id: "rl-299",
    title: "Reference-Free Preference Eval",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Evaluate a policy without a reference model by averaging its chosen-minus-rejected log-probability margins: mean(chosen_logps[i] - rejected_logps[i]). An empty batch returns 0.0.",
    starterCode: `def reference_free_margin(chosen_logps, rejected_logps):
    # Your code here
    pass`,
    solution: `def reference_free_margin(chosen_logps, rejected_logps):
    n = len(chosen_logps)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        total += chosen_logps[i] - rejected_logps[i]
    return total / n`,
    testCases: [
      { input: [[-1.0, -2.0], [-2.0, -1.0]], expected: 0.0 },
      { input: [[-1.0], [-3.0]], expected: 2.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Reference-free metrics avoid running a second model at evaluation time.",
  },
  {
    id: "rl-300",
    title: "Preference Win Rate Computation",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute a win rate from wins, losses, and ties.\n\nWith tie_mode 'exclude' ties are dropped, with 'half' they count as 0.5, and any other value (including 'include') counts them as wins. Return 0.0 when the denominator is zero.",
    starterCode: `def preference_win_rate(wins, losses, ties, tie_mode):
    # Your code here
    pass`,
    solution: `def preference_win_rate(wins, losses, ties, tie_mode):
    if tie_mode == "exclude":
        denom = wins + losses
        value = float(wins)
    elif tie_mode == "include":
        denom = wins + losses + ties
        value = float(wins + ties)
    else:
        denom = wins + losses + ties
        value = wins + 0.5 * ties
    if denom == 0:
        return 0.0
    return value / denom`,
    testCases: [
      { input: [8, 2, 0, "exclude"], expected: 0.8 },
      { input: [8, 2, 5, "half"], expected: 0.7 },
      { input: [8, 2, 5, "include"], expected: 0.8666666666666667 },
      { input: [0, 0, 0, "half"], expected: 0.0 },
    ],
    hint: "Win rates are only comparable when everyone handles ties the same way.",
  },
  {
    id: "rl-301",
    title: "Elo Round Robin Ratings",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Update Elo ratings through a list of results.\n\nEach result is [i, j, score_i] with score_i in {0, 0.5, 1}; expected_i = 1 / (1 + 10 ** ((rating_j - rating_i) / 400)) and both ratings move by k * (score_i - expected_i) in opposite directions using the current ratings. Return the updated rating list in the original order.",
    starterCode: `def elo_round_robin(ratings, k, results):
    # Your code here
    pass`,
    solution: `def elo_round_robin(ratings, k, results):
    new_ratings = [float(r) for r in ratings]
    for match in results:
        i = match[0]
        j = match[1]
        score = match[2]
        expected = 1.0 / (1.0 + 10.0 ** ((new_ratings[j] - new_ratings[i]) / 400.0))
        delta = k * (score - expected)
        new_ratings[i] += delta
        new_ratings[j] -= delta
    return new_ratings`,
    testCases: [
      { input: [[1500.0, 1500.0], 32.0, [[0, 1, 1.0]]], expected: [1516.0, 1484.0] },
      { input: [[1500.0, 1500.0], 32.0, [[0, 1, 0.5]]], expected: [1500.0, 1500.0] },
      { input: [[1600.0, 1400.0], 16.0, [[1, 0, 1.0]]], expected: [1587.8440491736326, 1412.1559508263674] },
      { input: [[1500.0, 1500.0], 32.0, [[0, 1, 1.0], [1, 0, 1.0]]], expected: [1498.5304984710244, 1501.4695015289756] },
    ],
    hint: "Processing matches sequentially lets later games see the ratings updated by earlier ones.",
  },
  {
    id: "rl-302",
    title: "Bradley-Terry Home Advantage Probability",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the Bradley-Terry win probability for the home side including a home bonus in Elo points: 1 / (1 + 10 ** (-(rating_home + home_bonus - rating_away) / 400)).",
    starterCode: `def bt_home_win_probability(rating_home, rating_away, home_bonus):
    # Your code here
    pass`,
    solution: `def bt_home_win_probability(rating_home, rating_away, home_bonus):
    diff = rating_home + home_bonus - rating_away
    return 1.0 / (1.0 + 10.0 ** (-diff / 400.0))`,
    testCases: [
      { input: [1500.0, 1500.0, 0.0], expected: 0.5 },
      { input: [1500.0, 1500.0, 100.0], expected: 0.6400649998028851 },
      { input: [1400.0, 1600.0, 0.0], expected: 0.2402530733520421 },
    ],
    hint: "A 100 point home bonus is worth roughly a 64 percent win probability against an even side.",
  },
  {
    id: "rl-303",
    title: "Preference Label Uncertainty",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the binary entropy of a preference vote split in bits.\n\nWith p = votes_a / (votes_a + votes_b), return -p * log2(p) - (1 - p) * log2(1 - p), skipping zero terms. A zero total returns 0.0.",
    starterCode: `import math
def preference_label_uncertainty(votes_a, votes_b):
    # Your code here
    pass`,
    solution: `import math
def preference_label_uncertainty(votes_a, votes_b):
    total = votes_a + votes_b
    if total == 0:
        return 0.0
    p = votes_a / total
    h = 0.0
    if p > 0.0:
        h -= p * math.log2(p)
    if p < 1.0:
        h -= (1.0 - p) * math.log2(1.0 - p)
    return h`,
    testCases: [
      { input: [1, 1], expected: 1.0 },
      { input: [3, 1], expected: 0.8112781244591328 },
      { input: [5, 0], expected: 0.0 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "Maximum uncertainty is one bit when annotators split evenly.",
  },
  {
    id: "rl-304",
    title: "Annotator Agreement Kappa",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute Cohen's kappa between two annotators.\n\npo is the fraction of matching labels and pe = sum over labels of (count_a / n) * (count_b / n); return (po - pe) / (1 - pe). Return 0.0 when the batch is empty or chance agreement pe equals 1.",
    starterCode: `def cohen_kappa(labels_a, labels_b):
    # Your code here
    pass`,
    solution: `def cohen_kappa(labels_a, labels_b):
    n = len(labels_a)
    if n == 0:
        return 0.0
    agree = 0
    for i in range(n):
        if labels_a[i] == labels_b[i]:
            agree += 1
    po = agree / n
    counts_a = {}
    counts_b = {}
    for x in labels_a:
        counts_a[x] = counts_a.get(x, 0) + 1
    for x in labels_b:
        counts_b[x] = counts_b.get(x, 0) + 1
    pe = 0.0
    for key in counts_a:
        pe += (counts_a[key] / n) * (counts_b.get(key, 0) / n)
    if 1.0 - pe == 0.0:
        return 0.0
    return (po - pe) / (1.0 - pe)`,
    testCases: [
      { input: [[0, 1, 1, 0], [0, 1, 0, 0]], expected: 0.5 },
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 1, 0, 1], [0, 0, 0, 0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Kappa corrects raw agreement for how often the annotators would agree by chance.",
  },
  {
    id: "rl-305",
    title: "Streaming Reward Normalization",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Normalize a list of rewards by their own mean and population standard deviation: (r - mean) / (std + epsilon). If the standard deviation is zero return zeros, and an empty list returns [].",
    starterCode: `import math
def streaming_reward_normalize(rewards, epsilon):
    # Your code here
    pass`,
    solution: `import math
def streaming_reward_normalize(rewards, epsilon):
    n = len(rewards)
    if n == 0:
        return []
    mean = sum(rewards) / n
    var = sum((r - mean) ** 2 for r in rewards) / n
    std = math.sqrt(var)
    if std == 0.0:
        return [0.0 for _ in rewards]
    return [(r - mean) / (std + epsilon) for r in rewards]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.0], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
      { input: [[5.0], 0.0], expected: [0.0] },
      { input: [[], 0.0], expected: [] },
      { input: [[2.0, 2.0, 2.0], 1e-08], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Reward normalization keeps the advantage scale stable as training progresses.",
  },
  {
    id: "rl-306",
    title: "Group Size For Learning Signal",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Find the smallest GRPO group size whose probability of containing both a success and a failure reaches threshold.\n\nFor group size g that probability is 1 - p ** g - (1 - p) ** g. Return -1 if no size up to max_group qualifies or if p is not strictly between 0 and 1.",
    starterCode: `def group_size_for_signal(p, threshold, max_group):
    # Your code here
    pass`,
    solution: `def group_size_for_signal(p, threshold, max_group):
    if p <= 0.0 or p >= 1.0:
        return -1
    for g in range(1, max_group + 1):
        prob = 1.0 - p ** g - (1.0 - p) ** g
        if prob >= threshold:
            return g
    return -1`,
    testCases: [
      { input: [0.5, 0.8, 4], expected: 4 },
      { input: [0.5, 0.7, 4], expected: 3 },
      { input: [0.1, 0.5, 4], expected: -1 },
      { input: [0.0, 0.5, 8], expected: -1 },
      { input: [1.0, 0.5, 8], expected: -1 },
    ],
    hint: "Groups where every sample succeeds or every sample fails produce zero advantages.",
  },
  {
    id: "rl-307",
    title: "Gradient Accumulation for Policy Updates",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the number of micro-batches needed to reach a global batch size: ceil(global_batch / microbatch). Return 0 when either argument is non-positive.",
    starterCode: `import math
def accumulation_steps(global_batch, microbatch):
    # Your code here
    pass`,
    solution: `import math
def accumulation_steps(global_batch, microbatch):
    if global_batch <= 0 or microbatch <= 0:
        return 0
    return int(math.ceil(global_batch / microbatch))`,
    testCases: [
      { input: [64, 16], expected: 4 },
      { input: [100, 32], expected: 4 },
      { input: [7, 3], expected: 3 },
      { input: [10, 0], expected: 0 },
    ],
    hint: "Accumulating micro-batches emulates a larger batch without more memory.",
  },
  {
    id: "rl-308",
    title: "Minibatch Ratio Recompute",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Recompute PPO probability ratios for consecutive minibatches.\n\nForm ratio[i] = exp(new_log_probs[i] - old_log_probs[i]) and return the mean ratio inside each chunk of minibatch_size samples, keeping the final partial chunk. A non-positive minibatch size or an empty batch returns [].",
    starterCode: `import math
def minibatch_mean_ratios(new_log_probs, old_log_probs, minibatch_size):
    # Your code here
    pass`,
    solution: `import math
def minibatch_mean_ratios(new_log_probs, old_log_probs, minibatch_size):
    if minibatch_size <= 0:
        return []
    out = []
    for start in range(0, len(new_log_probs), minibatch_size):
        chunk = new_log_probs[start:start + minibatch_size]
        total = 0.0
        for i in range(start, start + len(chunk)):
            total += math.exp(new_log_probs[i] - old_log_probs[i])
        out.append(total / len(chunk))
    return out`,
    testCases: [
      { input: [[-0.1, -0.2, -0.3], [-0.2, -0.2, -0.2], 2], expected: [1.0525854590378239, 0.9048374180359596] },
      { input: [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], 2], expected: [1.0, 1.0] },
      { input: [[-0.5], [-1.0], 0], expected: [] },
      { input: [[], [], 2], expected: [] },
    ],
    hint: "Ratios must be recomputed under the current policy at every PPO epoch.",
  },
  {
    id: "rl-309",
    title: "Trust Region Step Size",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the TRPO trust-region step size sqrt(2 * delta / quadratic), where quadratic is the quadratic form g^T H g of the natural-gradient direction. Return 0.0 when delta or quadratic is non-positive.",
    starterCode: `import math
def trust_region_step_size(delta, quadratic):
    # Your code here
    pass`,
    solution: `import math
def trust_region_step_size(delta, quadratic):
    if delta <= 0.0 or quadratic <= 0.0:
        return 0.0
    return math.sqrt(2.0 * delta / quadratic)`,
    testCases: [
      { input: [0.01, 4.0], expected: 0.07071067811865475 },
      { input: [1.0, 0.0], expected: 0.0 },
      { input: [0.0, 1.0], expected: 0.0 },
      { input: [0.5, 2.0], expected: 0.7071067811865476 },
    ],
    hint: "The step size shrinks as the curvature in the natural-gradient direction grows.",
  },
  {
    id: "rl-310",
    title: "Importance Weight Clipping Bound",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Clip importance weights to the range [0, max_ratio]. A negative max_ratio caps everything at zero. Return the clipped list, or [] for an empty input.",
    starterCode: `def clip_importance_weights(weights, max_ratio):
    # Your code here
    pass`,
    solution: `def clip_importance_weights(weights, max_ratio):
    cap = max(0.0, max_ratio)
    return [min(max(0.0, w), cap) for w in weights]`,
    testCases: [
      { input: [[0.5, 1.5, 3.0], 2.0], expected: [0.5, 1.5, 2.0] },
      { input: [[1.0, 1.0], 1.0], expected: [1.0, 1.0] },
      { input: [[-1.0, 0.5], 1.0], expected: [0.0, 0.5] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Clipping importance weights bounds the variance of off-policy estimates.",
  },
  {
    id: "rl-311",
    title: "Relaxed Off-Policy Correction",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a relaxed off-policy correction factor for a trajectory.\n\nMultiply (target_probs[t][action_t] / behavior_probs[t][action_t]) ** eta over all steps. An empty trajectory returns 1.0.",
    starterCode: `def relaxed_off_policy_factor(target_probs, behavior_probs, actions, eta):
    # Your code here
    pass`,
    solution: `def relaxed_off_policy_factor(target_probs, behavior_probs, actions, eta):
    factor = 1.0
    for t in range(len(actions)):
        ratio = target_probs[t][actions[t]] / behavior_probs[t][actions[t]]
        factor *= ratio ** eta
    return factor`,
    testCases: [
      { input: [[[0.4, 0.6]], [[0.2, 0.8]], [0], 1.0], expected: 2.0 },
      { input: [[[0.4, 0.6]], [[0.2, 0.8]], [0], 2.0], expected: 4.0 },
      { input: [[[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]], [0, 1], 1.0], expected: 1.0 },
      { input: [[], [], [], 1.0], expected: 1.0 },
    ],
    hint: "An exponent eta between 0 and 1 trades bias for much lower variance.",
  },
  {
    id: "rl-312",
    title: "Target KL Controller Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Adapt the KL coefficient from the current KL: multiply coef by factor when current_kl > 1.5 * target_kl, divide by factor when current_kl < target_kl / 1.5, and keep it unchanged otherwise. A non-positive target_kl or factor returns coef.",
    starterCode: `def target_kl_controller(current_kl, target_kl, coef, factor):
    # Your code here
    pass`,
    solution: `def target_kl_controller(current_kl, target_kl, coef, factor):
    if target_kl <= 0.0 or factor <= 0.0:
        return coef
    if current_kl > 1.5 * target_kl:
        return coef * factor
    if current_kl < target_kl / 1.5:
        return coef / factor
    return coef`,
    testCases: [
      { input: [0.1, 0.05, 1.0, 2.0], expected: 2.0 },
      { input: [0.01, 0.05, 1.0, 2.0], expected: 0.5 },
      { input: [0.05, 0.05, 1.0, 2.0], expected: 1.0 },
      { input: [0.1, 0.0, 1.0, 2.0], expected: 1.0 },
    ],
    hint: "This two-sided controller holds the measured KL near its target band.",
  },
  {
    id: "rl-313",
    title: "Entropy Collapse Check",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Detect entropy collapse: return True when the last patience entropies are all below ratio * entropies[0], and False when there are fewer entries, patience is non-positive, or any of the last entries is at or above the threshold.",
    starterCode: `def entropy_collapse(entropies, ratio, patience):
    # Your code here
    pass`,
    solution: `def entropy_collapse(entropies, ratio, patience):
    if patience <= 0 or len(entropies) < patience:
        return False
    threshold = ratio * entropies[0]
    for h in entropies[-patience:]:
        if h >= threshold:
            return False
    return True`,
    testCases: [
      { input: [[1.0, 0.5, 0.2, 0.1], 0.3, 2], expected: true },
      { input: [[1.0, 0.5, 0.2], 0.3, 2], expected: false },
      { input: [[1.0], 0.5, 1], expected: false },
      { input: [[], 0.5, 1], expected: false },
    ],
    hint: "A policy whose entropy keeps sinking is becoming deterministic and losing exploration.",
  },
  {
    id: "rl-314",
    title: "Degenerate Group Handling",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Handle a GRPO group whose rewards may carry no signal.\n\nReturn [degenerate, advantages], where the group is degenerate when it has fewer than two entries or all rewards are equal; degenerate groups get zero advantages, otherwise the advantages are the population z-scores.",
    starterCode: `import math
def degenerate_group(rewards):
    # Your code here
    pass`,
    solution: `import math
def degenerate_group(rewards):
    n = len(rewards)
    if n == 0:
        return [True, []]
    low = min(rewards)
    high = max(rewards)
    if n < 2 or low == high:
        return [True, [0.0 for _ in rewards]]
    mean = sum(rewards) / n
    var = sum((r - mean) ** 2 for r in rewards) / n
    std = math.sqrt(var)
    return [False, [(r - mean) / std for r in rewards]]`,
    testCases: [
      { input: [[1.0, 1.0, 1.0]], expected: [true, [0.0, 0.0, 0.0]] },
      { input: [[1.0, 2.0, 3.0]], expected: [false, [-1.224744871391589, 0.0, 1.224744871391589]] },
      { input: [[5.0]], expected: [true, [0.0]] },
      { input: [[]], expected: [true, []] },
    ],
    hint: "A group with zero reward variance contributes no gradient, so it should be skipped.",
  },
  {
    id: "rl-315",
    title: "Curriculum Difficulty Ratio",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of training prompts inside the learning zone, whose success rate lies in [low, high] inclusive. An empty list returns 0.0.",
    starterCode: `def curriculum_difficulty_ratio(success_rates, low, high):
    # Your code here
    pass`,
    solution: `def curriculum_difficulty_ratio(success_rates, low, high):
    n = len(success_rates)
    if n == 0:
        return 0.0
    count = 0
    for r in success_rates:
        if low <= r <= high:
            count += 1
    return count / n`,
    testCases: [
      { input: [[0.1, 0.5, 0.9], 0.3, 0.7], expected: 0.3333333333333333 },
      { input: [[0.0, 1.0], 0.3, 0.7], expected: 0.0 },
      { input: [[0.3, 0.7], 0.3, 0.7], expected: 1.0 },
      { input: [[], 0.3, 0.7], expected: 0.0 },
    ],
    hint: "Prompts that are too easy or too hard give little learning signal.",
  },
];
