import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-181",
    title: "Weighted Behavioral Cloning Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute a weighted behavioral cloning loss.\n\nEach demonstrated action contributes weights[i] * log_probs[i]; return the negative weighted mean, normalizing by the total weight. If the total weight is zero or the batch is empty, return 0.0.",
    starterCode: `def bc_weighted_loss(log_probs, weights):
    # Your code here
    pass`,
    solution: `def bc_weighted_loss(log_probs, weights):
    total_w = 0.0
    total = 0.0
    for i in range(len(log_probs)):
        total += weights[i] * log_probs[i]
        total_w += weights[i]
    if total_w == 0.0:
        return 0.0
    return -total / total_w`,
    testCases: [
      { input: [[-0.5, -1.0], [1.0, 1.0]], expected: 0.75 },
      { input: [[-0.5, -1.0], [1.0, 3.0]], expected: 0.875 },
      { input: [[], []], expected: 0.0 },
      { input: [[-2.0], [0.0]], expected: 0.0 },
    ],
    hint: "Weighting demonstrations keeps rare but important behaviors from being drowned out.",
  },
  {
    id: "rl-182",
    title: "DAgger Aggregation Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Aggregate a new DAgger round into the training dataset.\n\nAppend the newly queried states and expert actions to the old data and report the fraction of the merged dataset that comes from the new expert labels. Return [merged_states, merged_actions, expert_fraction]; an empty merge gives fraction 0.0.",
    starterCode: `def dagger_aggregation_step(states, actions, new_states, new_actions):
    # Your code here
    pass`,
    solution: `def dagger_aggregation_step(states, actions, new_states, new_actions):
    merged_states = list(states) + list(new_states)
    merged_actions = list(actions) + list(new_actions)
    total = len(merged_states)
    if total == 0:
        expert_fraction = 0.0
    else:
        expert_fraction = len(new_states) / total
    return [merged_states, merged_actions, expert_fraction]`,
    testCases: [
      { input: [["s0"], [0], ["s1", "s2"], [1, 0]], expected: [["s0", "s1", "s2"], [0, 1, 0], 0.6666666666666666] },
      { input: [[], [], [], []], expected: [[], [], 0.0] },
      { input: [[], [], ["x"], [2]], expected: [["x"], [2], 1.0] },
    ],
    hint: "DAgger grows the dataset with expert labels on the learner's own visited states.",
  },
  {
    id: "rl-183",
    title: "IRL Max-Entropy Gradient",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the max-entropy inverse RL gradient as the difference between expert and policy feature expectations: expert_feats[i] - policy_feats[i].",
    starterCode: `def maxent_irl_gradient(expert_feats, policy_feats):
    # Your code here
    pass`,
    solution: `def maxent_irl_gradient(expert_feats, policy_feats):
    return [expert_feats[i] - policy_feats[i] for i in range(len(expert_feats))]`,
    testCases: [
      { input: [[2.0, 3.0], [1.0, 1.0]], expected: [1.0, 2.0] },
      { input: [[1.0], [1.0]], expected: [0.0] },
      { input: [[0.0, 0.0], [2.0, -1.0]], expected: [-2.0, 1.0] },
    ],
    hint: "The gradient vanishes when the policy matches the expert's feature counts.",
  },
  {
    id: "rl-184",
    title: "GAIL Discriminator Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one gradient step on a GAIL discriminator weight vector.\n\nThe binary cross-entropy gradient with respect to the weights is (d_value - label) * features, so return weights - lr * (d_value - label) * features. label is 1.0 for expert samples and 0.0 for policy samples.",
    starterCode: `def gail_discriminator_update(weights, features, label, d_value, lr):
    # Your code here
    pass`,
    solution: `def gail_discriminator_update(weights, features, label, d_value, lr):
    grad_scale = (d_value - label) * lr
    return [weights[i] - grad_scale * features[i] for i in range(len(weights))]`,
    testCases: [
      { input: [[1.0, 1.0], [2.0, 0.0], 1.0, 0.8, 0.1], expected: [1.04, 1.0] },
      { input: [[1.0, 1.0], [2.0, 0.0], 0.0, 0.3, 0.5], expected: [0.7, 1.0] },
      { input: [[0.5, -0.5], [1.0, 1.0], 1.0, 1.0, 0.2], expected: [0.5, -0.5] },
    ],
    hint: "The sign flips between expert and policy samples, pushing the scores apart.",
  },
  {
    id: "rl-185",
    title: "CQL Conservative Penalty",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the batch CQL conservative penalty.\n\nFor each state, penalize log-sum-exp of the Q values minus the Q value of the dataset action, then scale by alpha and average over the batch. An empty batch returns 0.0, and log-sum-exp must be computed with the max-subtraction trick.",
    starterCode: `import math
def cql_conservative_penalty(q_batch, data_actions, alpha):
    # Your code here
    pass`,
    solution: `import math
def cql_conservative_penalty(q_batch, data_actions, alpha):
    n = len(q_batch)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        m = max(q_batch[i])
        lse = m + math.log(sum(math.exp(q - m) for q in q_batch[i]))
        total += lse - q_batch[i][data_actions[i]]
    return alpha * total / n`,
    testCases: [
      { input: [[[1.0, 2.0, 3.0], [0.0, 0.0]], [0, 1], 1.0], expected: 1.550376572502163 },
      { input: [[[5.0, 1.0, 2.0]], [0], 0.5], expected: 0.032941951878714626 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "Pushing down unseen action values is what keeps offline Q-learning conservative.",
  },
  {
    id: "rl-186",
    title: "BCQ Perturbation Filter",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Filter a BCQ candidate action by its perturbation distance.\n\nReturn action when |action - mu| <= threshold, otherwise fall back to the behavior mean mu.",
    starterCode: `def bcq_perturbation_filter(action, mu, threshold):
    # Your code here
    pass`,
    solution: `def bcq_perturbation_filter(action, mu, threshold):
    if abs(action - mu) <= threshold:
        return action
    return mu`,
    testCases: [
      { input: [0.55, 0.5, 0.1], expected: 0.55 },
      { input: [0.8, 0.5, 0.1], expected: 0.5 },
      { input: [-0.5, 0.5, 0.2], expected: 0.5 },
    ],
    hint: "BCQ only trusts candidate actions that stay near the behavior policy.",
  },
  {
    id: "rl-187",
    title: "IQL Expectile Loss",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the IQL expectile regression loss.\n\nFor each sample diff = q - target and the weight is tau when diff >= 0, otherwise 1 - tau; the loss is the mean of weight * diff^2. An empty batch returns 0.0.",
    starterCode: `def iql_expectile_loss(q_values, targets, tau):
    # Your code here
    pass`,
    solution: `def iql_expectile_loss(q_values, targets, tau):
    n = len(q_values)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        diff = q_values[i] - targets[i]
        if diff >= 0:
            w = tau
        else:
            w = 1.0 - tau
        total += w * diff * diff
    return total / n`,
    testCases: [
      { input: [[2.0, 1.0], [1.0, 2.0], 0.5], expected: 0.5 },
      { input: [[2.0, 1.0], [1.0, 2.0], 0.7], expected: 0.5 },
      { input: [[3.0], [3.0], 0.9], expected: 0.0 },
      { input: [[], [], 0.5], expected: 0.0 },
    ],
    hint: "The expectile controls how pessimistic the value estimate is on the offline data.",
  },
  {
    id: "rl-188",
    title: "AWAC Advantage Weights",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute AWAC policy weights as exp(advantage / lam), capped at max_weight to bound the update. Return one weight per advantage.",
    starterCode: `import math
def awac_advantage_weights(advantages, lam, max_weight):
    # Your code here
    pass`,
    solution: `import math
def awac_advantage_weights(advantages, lam, max_weight):
    out = []
    for a in advantages:
        w = math.exp(a / lam)
        if w > max_weight:
            w = max_weight
        out.append(w)
    return out`,
    testCases: [
      { input: [[0.0, 1.0], 1.0, 10.0], expected: [1.0, 2.718281828459045] },
      { input: [[0.0, 5.0], 1.0, 10.0], expected: [1.0, 10.0] },
      { input: [[-1.0], 0.5, 100.0], expected: [0.1353352832366127] },
    ],
    hint: "The exponential tilt makes good actions much more likely to be imitated.",
  },
  {
    id: "rl-189",
    title: "MARWIL Weighted BC",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the MARWIL weighted behavioral cloning loss.\n\nThe weight of each sample is exp(beta * advantage), and the loss is the negative weighted mean of the log-probabilities. A zero total weight or empty batch returns 0.0.",
    starterCode: `import math
def marwil_weighted_loss(log_probs, advantages, beta):
    # Your code here
    pass`,
    solution: `import math
def marwil_weighted_loss(log_probs, advantages, beta):
    total_w = 0.0
    total = 0.0
    for i in range(len(log_probs)):
        w = math.exp(beta * advantages[i])
        total += w * log_probs[i]
        total_w += w
    if total_w == 0.0:
        return 0.0
    return -total / total_w`,
    testCases: [
      { input: [[-0.5, -1.0], [0.0, 0.0], 1.0], expected: 0.75 },
      { input: [[-0.5, -1.0], [1.0, -1.0], 1.0], expected: 0.5596014610110588 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "Beta controls how strongly the advantage tilts the imitation weights.",
  },
  {
    id: "rl-190",
    title: "TD3+BC Policy Term",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the TD3+BC policy loss for one sample.\n\nlambda = alpha / mean_abs_q (0 when mean_abs_q is 0) and the loss is -lambda * q_value + (action - data_action)^2, balancing Q maximization against staying close to the dataset action.",
    starterCode: `def td3bc_policy_term(action, data_action, q_value, alpha, mean_abs_q):
    # Your code here
    pass`,
    solution: `def td3bc_policy_term(action, data_action, q_value, alpha, mean_abs_q):
    if mean_abs_q == 0.0:
        lam = 0.0
    else:
        lam = alpha / mean_abs_q
    return -lam * q_value + (action - data_action) ** 2`,
    testCases: [
      { input: [1.5, 1.0, 2.0, 2.5, 10.0], expected: -0.25 },
      { input: [0.0, 1.0, -3.0, 1.0, 0.0], expected: 1.0 },
      { input: [2.0, 2.0, 5.0, 0.5, 4.0], expected: -0.625 },
    ],
    hint: "Normalizing lambda by the average Q magnitude keeps the BC term competitive across tasks.",
  },
  {
    id: "rl-191",
    title: "CRR Advantage Weights",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute binary CRR advantage weights: 1.0 when the advantage is strictly above the threshold, otherwise 0.0. An empty batch returns [].",
    starterCode: `def crr_advantage_weights(advantages, threshold):
    # Your code here
    pass`,
    solution: `def crr_advantage_weights(advantages, threshold):
    return [1.0 if a > threshold else 0.0 for a in advantages]`,
    testCases: [
      { input: [[1.0, -1.0, 0.0], 0.0], expected: [1.0, 0.0, 0.0] },
      { input: [[-0.5, 0.5], 0.0], expected: [0.0, 1.0] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "Binary CRR simply filters out actions that were worse than average.",
  },
  {
    id: "rl-192",
    title: "MBPO Rollout Steps",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the number of model-generated rollout steps: env_steps * rollouts_per_step * rollout_length.",
    starterCode: `def mbpo_rollout_steps(env_steps, rollouts_per_step, rollout_length):
    # Your code here
    pass`,
    solution: `def mbpo_rollout_steps(env_steps, rollouts_per_step, rollout_length):
    return env_steps * rollouts_per_step * rollout_length`,
    testCases: [
      { input: [1000, 1, 5], expected: 5000 },
      { input: [250, 4, 3], expected: 3000 },
      { input: [0, 10, 10], expected: 0 },
    ],
    hint: "Short model rollouts limit compounding model error.",
  },
  {
    id: "rl-193",
    title: "Dreamer Latent Rollout",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Roll a Dreamer recurrent latent state forward.\n\nAt each step h_next = tanh(W_h h + W_z z_t + W_a a_t + b) using the current latent h, the given stochastic latent z_t, and the action a_t. Return the trajectory including h0, so its length is len(z_seq) + 1.",
    starterCode: `import math
def dreamer_latent_rollout(h0, z_seq, a_seq, w_h, w_z, w_a, bias):
    # Your code here
    pass`,
    solution: `import math
def dreamer_latent_rollout(h0, z_seq, a_seq, w_h, w_z, w_a, bias):
    H = len(h0)
    traj = [list(h0)]
    h = list(h0)
    for t in range(len(z_seq)):
        new_h = []
        for i in range(H):
            val = bias[i]
            for j in range(H):
                val += w_h[i][j] * h[j]
            for j in range(len(z_seq[t])):
                val += w_z[i][j] * z_seq[t][j]
            for j in range(len(a_seq[t])):
                val += w_a[i][j] * a_seq[t][j]
            new_h.append(math.tanh(val))
        h = new_h
        traj.append(h)
    return traj`,
    testCases: [
      { input: [[0.0], [[1.0], [0.0]], [[1.0], [0.0]], [[0.5]], [[1.0]], [[1.0]], [0.0]], expected: [[0.0], [0.9640275800758169], [0.44785493732809273]] },
      { input: [[0.5, -0.5], [[1.0, 0.0]], [[0.0, 1.0]], [[0.0, 0.5], [0.5, 0.0]], [[1.0, 0.0], [0.0, 1.0]], [[0.5, 0.5], [0.5, 0.5]], [0.1, -0.1]], expected: [[0.5, -0.5], [0.874053287886007, 0.5716699660851172]] },
      { input: [[0.0], [[0.5], [1.0]], [[0.0], [1.0]], [[1.0]], [[0.5]], [[-1.0]], [0.25]], expected: [[0.0], [0.46211715726000974], [0.2089920776832724]] },
    ],
    hint: "The deterministic recurrent state carries memory while z captures per-step stochasticity.",
  },
  {
    id: "rl-194",
    title: "World-Model Discounted Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a discounted multi-step world-model loss.\n\nAt each horizon average the squared error over the state dimensions, weight it by gamma^t, and return the discounted sum divided by the number of steps. An empty trajectory returns 0.0.",
    starterCode: `def world_model_discounted_loss(predicted, true, gamma):
    # Your code here
    pass`,
    solution: `def world_model_discounted_loss(predicted, true, gamma):
    n = len(predicted)
    if n == 0:
        return 0.0
    total = 0.0
    power = 1.0
    for t in range(n):
        mse = 0.0
        for p, q in zip(predicted[t], true[t]):
            mse += (p - q) ** 2
        mse /= len(predicted[t])
        total += power * mse
        power *= gamma
    return total / n`,
    testCases: [
      { input: [[[1.0, 1.0], [2.0, 2.0]], [[0.0, 0.0], [0.0, 0.0]], 1.0], expected: 2.5 },
      { input: [[[1.0], [1.0]], [[0.0], [0.0]], 0.5], expected: 0.75 },
      { input: [[[2.0, 0.0]], [[0.0, 0.0]], 0.9], expected: 2.0 },
    ],
    hint: "Discounting later horizons stops long rollouts from dominating the loss.",
  },
  {
    id: "rl-195",
    title: "RND Normalized Bonus",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Normalize RND prediction errors into a bonus by z-scoring them.\n\nReturn (e - mean) / std using population statistics; if the standard deviation is zero return zeros, and an empty batch returns [].",
    starterCode: `import math
def rnd_normalized_bonus(errors):
    # Your code here
    pass`,
    solution: `import math
def rnd_normalized_bonus(errors):
    n = len(errors)
    if n == 0:
        return []
    mean = sum(errors) / n
    var = sum((e - mean) ** 2 for e in errors) / n
    std = math.sqrt(var)
    if std == 0.0:
        return [0.0 for _ in errors]
    return [(e - mean) / std for e in errors]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
      { input: [[5.0, 5.0]], expected: [0.0, 0.0] },
      { input: [[]], expected: [] },
      { input: [[-1.0, 0.0, 1.0]], expected: [-1.224744871391589, 0.0, 1.224744871391589] },
    ],
    hint: "Normalizing novelty across a batch keeps the intrinsic reward scale stable.",
  },
  {
    id: "rl-196",
    title: "ICM Inverse Dynamics Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the ICM inverse dynamics loss for a single transition: the negative log-softmax of the true action under the predicted logits. Return -log(softmax(logits)[action]) computed with the max-subtraction trick.",
    starterCode: `import math
def icm_inverse_loss(logits, action):
    # Your code here
    pass`,
    solution: `import math
def icm_inverse_loss(logits, action):
    m = max(logits)
    total = 0.0
    for z in logits:
        total += math.exp(z - m)
    return -(logits[action] - m) + math.log(total)`,
    testCases: [
      { input: [[0.0, 0.0], 0], expected: 0.6931471805599453 },
      { input: [[2.0, 0.0], 0], expected: 0.1269280110429726 },
      { input: [[1.0, 2.0, 3.0], 1], expected: 1.4076059644443804 },
    ],
    hint: "The inverse model learns which action caused the observed feature change.",
  },
  {
    id: "rl-197",
    title: "BYOL-Explore Loss Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the BYOL-style cosine loss 2 - 2 * cos(predicted, target). If either vector has zero norm, return 2.0 as the maximum loss.",
    starterCode: `import math
def byol_explore_loss(predicted, target):
    # Your code here
    pass`,
    solution: `import math
def byol_explore_loss(predicted, target):
    dot = sum(p * t for p, t in zip(predicted, target))
    np = math.sqrt(sum(p * p for p in predicted))
    nt = math.sqrt(sum(t * t for t in target))
    if np == 0.0 or nt == 0.0:
        return 2.0
    return 2.0 - 2.0 * dot / (np * nt)`,
    testCases: [
      { input: [[1.0, 0.0], [1.0, 0.0]], expected: 0.0 },
      { input: [[1.0, 0.0], [0.0, 1.0]], expected: 2.0 },
      { input: [[1.0, 1.0], [1.0, 1.0]], expected: 4.440892098500626e-16 },
      { input: [[0.0, 0.0], [1.0, 0.0]], expected: 2.0 },
    ],
    hint: "The predictor is trained to match a slowly updated target embedding.",
  },
  {
    id: "rl-198",
    title: "Disagreement Bonus",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute an ensemble disagreement bonus as the range of the ensemble predictions: max(predictions) - min(predictions). An empty ensemble returns 0.0.",
    starterCode: `def disagreement_bonus(predictions):
    # Your code here
    pass`,
    solution: `def disagreement_bonus(predictions):
    if not predictions:
        return 0.0
    return max(predictions) - min(predictions)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: 2.0 },
      { input: [[5.0, 5.0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[-1.0, 1.0]], expected: 2.0 },
    ],
    hint: "Where ensemble members disagree, the agent is uncertain and exploration pays off.",
  },
  {
    id: "rl-199",
    title: "Episodic Memory Bonus",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute a novelty bonus from the distance to the nearest state in episodic memory.\n\nReturn 1 / (1 + d_min) where d_min is the smallest Euclidean distance from state to any memory entry. An empty memory returns 0.0.",
    starterCode: `import math
def episodic_memory_bonus(state, memory):
    # Your code here
    pass`,
    solution: `import math
def episodic_memory_bonus(state, memory):
    if not memory:
        return 0.0
    best = float('inf')
    for m in memory:
        d = 0.0
        for a, b in zip(state, m):
            d += (a - b) ** 2
        d = math.sqrt(d)
        if d < best:
            best = d
    return 1.0 / (1.0 + best)`,
    testCases: [
      { input: [[0.0, 0.0], [[0.0, 0.0], [1.0, 1.0]]], expected: 1.0 },
      { input: [[3.0, 4.0], [[0.0, 0.0]]], expected: 0.16666666666666666 },
      { input: [[1.0], []], expected: 0.0 },
    ],
    hint: "Revisiting a state within the same episode gives no novelty reward.",
  },
  {
    id: "rl-200",
    title: "R2D2 Burn-In",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the number of usable steps after R2D2-style burn-in: seq_len - burn_in, floored at 0 when the burn-in consumes the whole sequence.",
    starterCode: `def r2d2_usable_steps(seq_len, burn_in):
    # Your code here
    pass`,
    solution: `def r2d2_usable_steps(seq_len, burn_in):
    if burn_in >= seq_len:
        return 0
    return seq_len - burn_in`,
    testCases: [
      { input: [80, 40], expected: 40 },
      { input: [40, 40], expected: 0 },
      { input: [20, 40], expected: 0 },
      { input: [10, 0], expected: 10 },
    ],
    hint: "Burn-in lets the recurrent state warm up before gradients are applied.",
  },
  {
    id: "rl-201",
    title: "APE-X Priority Assignment",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Assign a priority to a new transition the APE-X way: the new priority is max over the existing buffer priorities and (|td_error| + epsilon) ** alpha.",
    starterCode: `def apex_priority_assignment(existing_priorities, td_error, alpha, epsilon):
    # Your code here
    pass`,
    solution: `def apex_priority_assignment(existing_priorities, td_error, alpha, epsilon):
    new_priority = (abs(td_error) + epsilon) ** alpha
    best = 0.0
    for p in existing_priorities:
        if p > best:
            best = p
    return max(best, new_priority)`,
    testCases: [
      { input: [[1.0, 2.0, 0.5], 3.0, 1.0, 1e-06], expected: 3.000001 },
      { input: [[5.0], 0.1, 1.0, 1e-06], expected: 5.0 },
      { input: [[], 0.0, 0.5, 1e-06], expected: 0.001 },
    ],
    hint: "Giving new transitions the buffer maximum encourages them to be replayed soon.",
  },
  {
    id: "rl-202",
    title: "R2D3 Demonstration Loss",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Combine a standard Q-learning loss with an auxiliary demonstration loss.\n\nReturn the mean of the Q losses plus lambda_demo times the mean of the demonstration losses over demonstration samples only. If there are no demonstration samples the second term is 0.0.",
    starterCode: `def r2d3_demonstration_loss(q_losses, demo_losses, is_demo, lambda_demo):
    # Your code here
    pass`,
    solution: `def r2d3_demonstration_loss(q_losses, demo_losses, is_demo, lambda_demo):
    n = len(q_losses)
    if n == 0:
        return 0.0
    q_mean = sum(q_losses) / n
    demo_sum = 0.0
    demo_count = 0
    for i in range(len(demo_losses)):
        if is_demo[i]:
            demo_sum += demo_losses[i]
            demo_count += 1
    if demo_count == 0:
        demo_mean = 0.0
    else:
        demo_mean = demo_sum / demo_count
    return q_mean + lambda_demo * demo_mean`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], [0.5, 1.0, 0.0, 0.0], [true, false, true, false], 0.1], expected: 2.525 },
      { input: [[2.0], [5.0], [false], 1.0], expected: 2.0 },
      { input: [[], [], [], 0.5], expected: 0.0 },
    ],
    hint: "The demonstration term is averaged only over demonstration samples, not the whole batch.",
  },
  {
    id: "rl-203",
    title: "DQfD Margin",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the DQfD margin loss for one demonstration transition.\n\nReturn max(0, max_other_Q + margin - Q(expert_action)), where max_other_Q is the largest Q value among the non-expert actions. A single-action vector gives 0.0.",
    starterCode: `def dqfd_margin(q_values, expert_action, margin):
    # Your code here
    pass`,
    solution: `def dqfd_margin(q_values, expert_action, margin):
    best_other = float('-inf')
    for a in range(len(q_values)):
        if a == expert_action:
            continue
        if q_values[a] > best_other:
            best_other = q_values[a]
    if best_other == float('-inf'):
        return 0.0
    loss = best_other + margin - q_values[expert_action]
    if loss < 0.0:
        return 0.0
    return loss`,
    testCases: [
      { input: [[1.0, 3.0], 0, 0.8], expected: 2.8 },
      { input: [[5.0, 3.0], 0, 0.8], expected: 0.0 },
      { input: [[2.0], 0, 1.0], expected: 0.0 },
    ],
    hint: "The margin keeps the expert action ahead of all alternatives by a fixed gap.",
  },
  {
    id: "rl-204",
    title: "Reward Model Training Loss",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the Bradley-Terry reward model loss: the mean of softplus(-(r_preferred - r_rejected)). Use the numerically stable form max(y, 0) + log1p(exp(-|y|)) with y = -(r_preferred - r_rejected). An empty batch returns 0.0.",
    starterCode: `import math
def reward_model_loss(r_preferred, r_rejected):
    # Your code here
    pass`,
    solution: `import math
def reward_model_loss(r_preferred, r_rejected):
    n = len(r_preferred)
    if n == 0:
        return 0.0
    total = 0.0
    for i in range(n):
        y = -(r_preferred[i] - r_rejected[i])
        total += max(y, 0.0) + math.log1p(math.exp(-abs(y)))
    return total / n`,
    testCases: [
      { input: [[2.0, 0.0], [0.0, 1.0]], expected: 0.7200948492805976 },
      { input: [[1.0], [1.0]], expected: 0.6931471805599453 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Training the reward model is simply logistic regression on preference pairs.",
  },
  {
    id: "rl-205",
    title: "Bradley-Terry Likelihood",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the Bradley-Terry probability that the first item is preferred: sigmoid(r1 - r2) = 1 / (1 + exp(-(r1 - r2))).",
    starterCode: `import math
def bradley_terry_likelihood(r1, r2):
    # Your code here
    pass`,
    solution: `import math
def bradley_terry_likelihood(r1, r2):
    return 1.0 / (1.0 + math.exp(-(r1 - r2)))`,
    testCases: [
      { input: [0.0, 0.0], expected: 0.5 },
      { input: [2.0, 0.0], expected: 0.8807970779778823 },
      { input: [0.0, 2.0], expected: 0.11920292202211755 },
    ],
    hint: "Equal rewards give a fifty-fifty preference.",
  },
  {
    id: "rl-206",
    title: "PPO-RLHF Ratio",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the per-token PPO ratio used in RLHF: exp(log_probs_new - log_probs_old) for every token. An empty batch returns [].",
    starterCode: `import math
def ppo_rlhf_ratio(log_probs_new, log_probs_old):
    # Your code here
    pass`,
    solution: `import math
def ppo_rlhf_ratio(log_probs_new, log_probs_old):
    return [math.exp(a - b) for a, b in zip(log_probs_new, log_probs_old)]`,
    testCases: [
      { input: [[-1.0, -2.0], [-1.0, -2.0]], expected: [1.0, 1.0] },
      { input: [[-1.0], [-2.0]], expected: [2.718281828459045] },
      { input: [[-2.0], [-1.0]], expected: [0.36787944117144233] },
      { input: [[], []], expected: [] },
    ],
    hint: "Ratios above 1 mean the new policy assigns more probability to the sampled token.",
  },
  {
    id: "rl-207",
    title: "KL-To-Reference Penalty",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the per-token KL penalty against a reference policy using the non-negative estimator exp(d) - d - 1, where d = ref_log_prob - log_prob. An empty batch returns [].",
    starterCode: `import math
def kl_to_reference_penalty(log_probs, ref_log_probs):
    # Your code here
    pass`,
    solution: `import math
def kl_to_reference_penalty(log_probs, ref_log_probs):
    out = []
    for i in range(len(log_probs)):
        diff = ref_log_probs[i] - log_probs[i]
        out.append(math.exp(diff) - diff - 1.0)
    return out`,
    testCases: [
      { input: [[-1.0, -2.0], [-1.0, -2.0]], expected: [0.0, 0.0] },
      { input: [[-2.0], [-1.0]], expected: [0.7182818284590451] },
      { input: [[-1.0], [-2.0]], expected: [0.36787944117144233] },
      { input: [[], []], expected: [] },
    ],
    hint: "The estimator is always non-negative and zero only when the policies agree.",
  },
  {
    id: "rl-208",
    title: "Reward Hacking Detector",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Detect reward hacking from reward histories.\n\nReturn True when the proxy reward increased from first to last observation while the true reward stayed within threshold of its starting value. Fewer than two observations returns False.",
    starterCode: `def reward_hacking_detected(proxy_rewards, true_rewards, threshold):
    # Your code here
    pass`,
    solution: `def reward_hacking_detected(proxy_rewards, true_rewards, threshold):
    if len(proxy_rewards) < 2:
        return False
    proxy_gain = proxy_rewards[-1] - proxy_rewards[0]
    true_gain = true_rewards[-1] - true_rewards[0]
    return proxy_gain > 0.0 and abs(true_gain) < threshold`,
    testCases: [
      { input: [[1.0, 2.0, 5.0], [3.0, 3.1, 2.9], 0.5], expected: true },
      { input: [[1.0, 2.0, 5.0], [3.0, 4.0, 6.0], 0.5], expected: false },
      { input: [[1.0], [1.0], 0.5], expected: false },
      { input: [[5.0, 4.0], [1.0, 1.0], 0.5], expected: false },
    ],
    hint: "A widening gap between proxy and true reward is the classic hacking signature.",
  },
  {
    id: "rl-209",
    title: "Safety Shield Override",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Override an unsafe action with the safest available one.\n\nIf predicted_costs[action] <= threshold return the action unchanged; otherwise return the index of the minimum predicted cost (smallest index on ties).",
    starterCode: `def safety_shield_override(action, predicted_costs, threshold):
    # Your code here
    pass`,
    solution: `def safety_shield_override(action, predicted_costs, threshold):
    if predicted_costs[action] > threshold:
        best = 0
        for a in range(len(predicted_costs)):
            if predicted_costs[a] < predicted_costs[best]:
                best = a
        return best
    return action`,
    testCases: [
      { input: [2, [0.1, 0.5, 1.0], 0.8], expected: 0 },
      { input: [1, [0.1, 0.5, 1.0], 0.8], expected: 1 },
      { input: [2, [0.5, 0.2, 0.9], 0.7], expected: 1 },
    ],
    hint: "The shield is a runtime filter that guarantees the executed action is safe.",
  },
  {
    id: "rl-210",
    title: "Masked Action Selection",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Select the highest-value valid action without changing the Q values.\n\nReturn the index of the maximum Q value among actions where valid is True, breaking ties toward the smallest index. If no action is valid return -1.",
    starterCode: `def masked_argmax(q_values, valid):
    # Your code here
    pass`,
    solution: `def masked_argmax(q_values, valid):
    best = -1
    for a in range(len(q_values)):
        if not valid[a]:
            continue
        if best == -1 or q_values[a] > q_values[best]:
            best = a
    return best`,
    testCases: [
      { input: [[1.0, 5.0, 3.0], [true, false, true]], expected: 2 },
      { input: [[1.0, 5.0, 3.0], [false, false, true]], expected: 2 },
      { input: [[2.0, 2.0], [true, true]], expected: 0 },
      { input: [[1.0], [false]], expected: -1 },
    ],
    hint: "Selecting among valid actions avoids the large negative bias of masked Q values.",
  },
  {
    id: "rl-211",
    title: "QR-DQN Quantiles",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Return the n quantile midpoints used by QR-DQN: tau_i = (2i + 1) / (2n) for i from 0 to n - 1. Zero quantiles returns [].",
    starterCode: `def qr_quantiles(n):
    # Your code here
    pass`,
    solution: `def qr_quantiles(n):
    return [(2.0 * i + 1.0) / (2.0 * n) for i in range(n)]`,
    testCases: [
      { input: [4], expected: [0.125, 0.375, 0.625, 0.875] },
      { input: [1], expected: [0.5] },
      { input: [0], expected: [] },
    ],
    hint: "Midpoints avoid ever evaluating the quantile function at 0 or 1.",
  },
  {
    id: "rl-212",
    title: "C51 Projection Step",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Project a categorical value distribution onto a fixed support for C51.\n\nFor each atom compute the target value reward + gamma * support[i] (or just reward for a terminal transition), then distribute its probability to the two neighboring atoms by linear interpolation. Mass below v_min goes to the first atom and mass above v_max to the last. Return the projected probability vector.",
    starterCode: `def c51_projection(support, probs, reward, gamma, done, v_min, v_max):
    # Your code here
    pass`,
    solution: `def c51_projection(support, probs, reward, gamma, done, v_min, v_max):
    n = len(support)
    dz = (v_max - v_min) / (n - 1)
    target = [0.0] * n
    for i in range(n):
        if done:
            value = reward
        else:
            value = reward + gamma * support[i]
        if value <= v_min:
            target[0] += probs[i]
        elif value >= v_max:
            target[n - 1] += probs[i]
        else:
            b = (value - v_min) / dz
            l = int(b)
            u = l + 1
            target[l] += probs[i] * (u - b)
            target[u] += probs[i] * (b - l)
    return target`,
    testCases: [
      { input: [[0.0, 1.0, 2.0, 3.0], [0.25, 0.25, 0.25, 0.25], 1.0, 0.9, false, 0.0, 3.0], expected: [0.0, 0.275, 0.275, 0.44999999999999996] },
      { input: [[0.0, 1.0, 2.0, 3.0], [0.1, 0.2, 0.3, 0.4], 1.0, 0.5, false, 0.0, 3.0], expected: [0.0, 0.2, 0.6000000000000001, 0.2] },
      { input: [[0.0, 1.0, 2.0, 3.0], [0.25, 0.25, 0.25, 0.25], 2.0, 0.9, true, 0.0, 3.0], expected: [0.0, 0.0, 1.0, 0.0] },
    ],
    hint: "Projection keeps the distribution on the fixed support after the Bellman update.",
  },
  {
    id: "rl-213",
    title: "Rainbow Component Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how many Rainbow components are enabled versus missing from a boolean list. Return [enabled, missing]; an empty list gives [0, 0].",
    starterCode: `def rainbow_component_count(components):
    # Your code here
    pass`,
    solution: `def rainbow_component_count(components):
    enabled = 0
    missing = 0
    for c in components:
        if c:
            enabled += 1
        else:
            missing += 1
    return [enabled, missing]`,
    testCases: [
      { input: [[true, true, true, true, true, true, true]], expected: [7, 0] },
      { input: [[true, false, true, false, true, false, true]], expected: [4, 3] },
      { input: [[]], expected: [0, 0] },
    ],
    hint: "Rainbow combines double Q-learning, dueling, PER, n-step, distributional, and noisy nets.",
  },
  {
    id: "rl-214",
    title: "Noisy Net Sample Seeded",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample factorized Gaussian noise for a noisy network using rng = random.Random(seed).\n\nReturn weights[i] + sigmas[i] * rng.gauss(0, 1) so every parameter gets its own noise scale. The seed makes the sampled parameters reproducible.",
    starterCode: `import random
def noisy_net_sample(weights, sigmas, seed):
    # Your code here
    pass`,
    solution: `import random
def noisy_net_sample(weights, sigmas, seed):
    rng = random.Random(seed)
    return [weights[i] + sigmas[i] * rng.gauss(0.0, 1.0) for i in range(len(weights))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.1, 0.2], 42], expected: [0.9855909670422072, 1.965419279933696] },
      { input: [[0.0], [1.0], 0], expected: [0.9417154046806644] },
      { input: [[1.0, 1.0, 1.0], [0.5, 0.5, 0.5], 7], expected: [0.8720598557761998, 1.255715756258257, 0.8869519176084476] },
    ],
    hint: "Noisy nets inject learned parametric noise instead of epsilon-greedy exploration.",
  },
  {
    id: "rl-215",
    title: "Dueling Aggregation Avg",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Aggregate a dueling value and advantage stream using the average of the mean and max baselines.\n\nbaseline = (mean(advantage) + max(advantage)) / 2 and Q(a) = value + advantage[a] - baseline.",
    starterCode: `def dueling_aggregation_avg(value, advantage):
    # Your code here
    pass`,
    solution: `def dueling_aggregation_avg(value, advantage):
    n = len(advantage)
    mean_a = sum(advantage) / n
    max_a = max(advantage)
    baseline = (mean_a + max_a) / 2.0
    return [value + a - baseline for a in advantage]`,
    testCases: [
      { input: [5.0, [1.0, 2.0, 3.0]], expected: [3.5, 4.5, 5.5] },
      { input: [0.0, [-1.0, 0.0, 1.0]], expected: [-1.5, -0.5, 0.5] },
      { input: [2.0, [4.0, 4.0]], expected: [2.0, 2.0] },
    ],
    hint: "Averaging the two baselines is a middle ground between mean and max aggregation.",
  },
  {
    id: "rl-216",
    title: "QMIX Monotonic Mix Check",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Mix per-agent Q values with a QMIX mixing network and verify monotonicity.\n\nQ_tot(s) = bias + sum_a agent_qs[s][a] * mixing_weights[a]. monotonic is True when raising any single agent's Q by 1 never decreases any Q_tot. Return [totals, monotonic].",
    starterCode: `def qmix_monotonic_mix(agent_qs, mixing_weights, bias):
    # Your code here
    pass`,
    solution: `def qmix_monotonic_mix(agent_qs, mixing_weights, bias):
    n_states = len(agent_qs)
    n_agents = len(agent_qs[0])
    totals = []
    for s in range(n_states):
        total = bias
        for a in range(n_agents):
            total += agent_qs[s][a] * mixing_weights[a]
        totals.append(total)
    monotonic = True
    for a in range(n_agents):
        for s in range(n_states):
            perturbed = list(agent_qs[s])
            perturbed[a] += 1.0
            p_total = bias
            for j in range(n_agents):
                p_total += perturbed[j] * mixing_weights[j]
            if p_total < totals[s]:
                monotonic = False
    return [totals, monotonic]`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 1.0]], [0.5, 0.5], 0.0], expected: [[1.5, 2.0], true] },
      { input: [[[1.0, 2.0]], [0.5, -0.5], 0.0], expected: [[-0.5], false] },
      { input: [[[1.0, 2.0], [3.0, 1.0]], [0.25, 0.75], 1.0], expected: [[2.75, 2.5], true] },
    ],
    hint: "Non-negative mixing weights guarantee that improving one agent never hurts the team.",
  },
  {
    id: "rl-217",
    title: "VDN Additivity Check",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Check VDN additivity: |sum(individual_qs) - q_total| <= tol. An empty agent list with q_total 0 is consistent and returns True.",
    starterCode: `def vdn_additivity_check(individual_qs, q_total, tol):
    # Your code here
    pass`,
    solution: `def vdn_additivity_check(individual_qs, q_total, tol):
    return abs(sum(individual_qs) - q_total) <= tol`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 6.0, 1e-09], expected: true },
      { input: [[1.0, 2.0, 3.0], 6.5, 1e-09], expected: false },
      { input: [[], 0.0, 1e-09], expected: true },
      { input: [[1.5, 2.5], 4.0, 1e-09], expected: true },
    ],
    hint: "VDN assumes the joint action value is exactly the sum of the individual ones.",
  },
  {
    id: "rl-218",
    title: "MADDPG Critic Input",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Build the centralized critic input used by MADDPG: concatenate all agents' observations followed by all agents' actions. Return the flat list.",
    starterCode: `def maddpg_critic_input(observations, actions):
    # Your code here
    pass`,
    solution: `def maddpg_critic_input(observations, actions):
    out = []
    for o in observations:
        out.extend(o)
    for a in actions:
        out.extend(a)
    return out`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0]], [[0.5], [1.0, 2.0]]], expected: [1.0, 2.0, 3.0, 0.5, 1.0, 2.0] },
      { input: [[[5.0]], [[0.0]]], expected: [5.0, 0.0] },
      { input: [[[1.0], [2.0, 3.0]], [[0.5, 0.5], [0.0]]], expected: [1.0, 2.0, 3.0, 0.5, 0.5, 0.0] },
    ],
    hint: "The centralized critic sees the full joint state so it can model interactions.",
  },
  {
    id: "rl-219",
    title: "Centralized-Decentralized Gap",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the gap between a centralized critic value and the sum of decentralized values: centralized_value - sum(decentralized_values).",
    starterCode: `def centralized_decentralized_gap(centralized_value, decentralized_values):
    # Your code here
    pass`,
    solution: `def centralized_decentralized_gap(centralized_value, decentralized_values):
    return centralized_value - sum(decentralized_values)`,
    testCases: [
      { input: [10.0, [3.0, 4.0]], expected: 3.0 },
      { input: [5.0, []], expected: 5.0 },
      { input: [-1.0, [1.0]], expected: -2.0 },
    ],
    hint: "The gap measures how much cooperative structure the joint value captures.",
  },
  {
    id: "rl-220",
    title: "Communication Budget",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute communication budget usage.\n\nReturn [used, remaining] where used = messages_per_step * steps and remaining = budget - used, which may be negative when over budget.",
    starterCode: `def communication_budget(messages_per_step, steps, budget):
    # Your code here
    pass`,
    solution: `def communication_budget(messages_per_step, steps, budget):
    used = messages_per_step * steps
    return [used, budget - used]`,
    testCases: [
      { input: [3, 5, 20], expected: [15, 5] },
      { input: [10, 3, 20], expected: [30, -10] },
      { input: [0, 100, 5], expected: [0, 5] },
    ],
    hint: "A negative remaining value means the protocol exceeded its budget.",
  },
  {
    id: "rl-221",
    title: "Curriculum Threshold Advance",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Advance a curriculum level when performance meets the threshold.\n\nReturn level + 1 when success_rate >= threshold and level < max_level; otherwise return the current level.",
    starterCode: `def curriculum_advance(level, success_rate, threshold, max_level):
    # Your code here
    pass`,
    solution: `def curriculum_advance(level, success_rate, threshold, max_level):
    if success_rate >= threshold and level < max_level:
        return level + 1
    return level`,
    testCases: [
      { input: [2, 0.8, 0.8, 5], expected: 3 },
      { input: [5, 0.9, 0.8, 5], expected: 5 },
      { input: [0, 0.5, 0.8, 5], expected: 0 },
    ],
    hint: "The threshold is inclusive: exactly meeting it advances the level.",
  },
  {
    id: "rl-222",
    title: "Self-Play Opponent Pick",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Pick a self-play opponent by sampling from a softmax over ratings.\n\nweights = exp((rating - max_rating) / temperature); draw u = rng.random() * sum(weights) with rng = random.Random(seed) and return the first index whose cumulative weight exceeds u, falling back to the last index.",
    starterCode: `import math, random
def self_play_opponent_pick(ratings, temperature, seed):
    # Your code here
    pass`,
    solution: `import math, random
def self_play_opponent_pick(ratings, temperature, seed):
    rng = random.Random(seed)
    m = max(ratings)
    exps = [math.exp((r - m) / temperature) for r in ratings]
    total = sum(exps)
    u = rng.random() * total
    acc = 0.0
    for i in range(len(exps)):
        acc += exps[i]
        if u < acc:
            return i
    return len(ratings) - 1`,
    testCases: [
      { input: [[1500.0, 1600.0, 1400.0], 100.0, 42], expected: 1 },
      { input: [[1.0, 1.0, 1.0], 1.0, 0], expected: 2 },
      { input: [[100.0], 50.0, 7], expected: 0 },
    ],
    hint: "Temperature controls how strongly self-play favors stronger opponents.",
  },
  {
    id: "rl-223",
    title: "PBT Explore-Exploit Decisions",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Decide the population-based training action for every member.\n\nReturn -1 when the score is below bottom_q (copy from a better member), 1 when it is above top_q (keep and perturb), and 0 otherwise.",
    starterCode: `def pbt_decisions(scores, bottom_q, top_q):
    # Your code here
    pass`,
    solution: `def pbt_decisions(scores, bottom_q, top_q):
    out = []
    for s in scores:
        if s < bottom_q:
            out.append(-1)
        elif s > top_q:
            out.append(1)
        else:
            out.append(0)
    return out`,
    testCases: [
      { input: [[1.0, 5.0, 10.0], 2.0, 8.0], expected: [-1, 0, 1] },
      { input: [[5.0, 5.0], 2.0, 8.0], expected: [0, 0] },
      { input: [[], 1.0, 2.0], expected: [] },
    ],
    hint: "The quantile thresholds are strict: scores exactly on a boundary are kept.",
  },
  {
    id: "rl-224",
    title: "League Matchmaking Pair",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Find the pair of league players with the closest Elo ratings.\n\nReturn [i, j] with i < j minimizing |ratings[i] - ratings[j]|, breaking ties by the lexicographically smallest pair. Fewer than two players returns [-1, -1].",
    starterCode: `def league_matchmaking_pair(ratings):
    # Your code here
    pass`,
    solution: `def league_matchmaking_pair(ratings):
    n = len(ratings)
    if n < 2:
        return [-1, -1]
    best_i = 0
    best_j = 1
    best_diff = abs(ratings[0] - ratings[1])
    for i in range(n):
        for j in range(i + 1, n):
            d = abs(ratings[i] - ratings[j])
            if d < best_diff:
                best_diff = d
                best_i = i
                best_j = j
    return [best_i, best_j]`,
    testCases: [
      { input: [[1500.0, 1620.0, 1615.0, 1800.0]], expected: [1, 2] },
      { input: [[1000.0, 1200.0, 1400.0, 1600.0]], expected: [0, 1] },
      { input: [[1500.0]], expected: [-1, -1] },
      { input: [[1500.0, 1500.0]], expected: [0, 1] },
    ],
    hint: "A strict comparison keeps the first pair found when several pairs tie.",
  },
  {
    id: "rl-225",
    title: "Reward Model Ensemble Variance",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the population variance of reward predictions across an ensemble: the mean of (p - mean)^2 over the predictions. An empty ensemble returns 0.0.",
    starterCode: `def reward_model_ensemble_variance(predictions):
    # Your code here
    pass`,
    solution: `def reward_model_ensemble_variance(predictions):
    n = len(predictions)
    if n == 0:
        return 0.0
    mean = sum(predictions) / n
    return sum((p - mean) ** 2 for p in predictions) / n`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: 0.6666666666666666 },
      { input: [[5.0, 5.0, 5.0]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
      { input: [[-1.0, 1.0]], expected: 1.0 },
    ],
    hint: "High ensemble variance marks preference pairs the reward model is unsure about.",
  },
];
