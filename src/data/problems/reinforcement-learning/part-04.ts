import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "rl-136",
    title: "RVI Convergence Check",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Check convergence of relative value iteration using the span semi-norm.\n\nTwo successive value vectors agree in relative terms when |(V_new[s] - V_new[ref]) - (V_old[s] - V_old[ref])| is below tol for every state. Return True when the largest such difference is strictly below tol.",
    starterCode: `def rvi_converged(V_old, V_new, ref, tol):
    # Your code here
    pass`,
    solution: `def rvi_converged(V_old, V_new, ref, tol):
    best = 0.0
    for s in range(len(V_old)):
        diff = abs((V_new[s] - V_new[ref]) - (V_old[s] - V_old[ref]))
        if diff > best:
            best = diff
    return best < tol`,
    testCases: [
      { input: [[0.0, 1.0, 2.0], [10.0, 11.0, 12.0], 0, 1e-06], expected: true },
      { input: [[0.0, 1.0, 2.0], [5.0, 6.0, 6.0], 0, 1e-06], expected: false },
      { input: [[1.0, 2.0, 3.0], [2.0, 3.0, 4.0000001], 1, 1e-06], expected: true },
      { input: [[1.0, 2.0, 3.0], [2.0, 3.0, 4.0001], 1, 1e-06], expected: false },
    ],
    hint: "Subtracting the reference state removes the arbitrary constant that value iteration adds each sweep.",
  },
  {
    id: "rl-137",
    title: "Average Reward Optimality",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the average reward (gain) of a policy from its stationary distribution and per-state rewards: sum of d[s] * rewards[s].",
    starterCode: `def average_reward(d, rewards):
    # Your code here
    pass`,
    solution: `def average_reward(d, rewards):
    return sum(d[i] * rewards[i] for i in range(len(d)))`,
    testCases: [
      { input: [[0.5, 0.5], [2.0, 4.0]], expected: 3.0 },
      { input: [[1.0, 0.0], [1.0, 10.0]], expected: 1.0 },
      { input: [[0.25, 0.25, 0.5], [1.0, 2.0, 3.0]], expected: 2.25 },
    ],
    hint: "Under the average-reward criterion the gain is the stationary-weighted mean reward.",
  },
  {
    id: "rl-138",
    title: "Semi-Gradient TD Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply a semi-gradient TD(0) update for linear function approximation.\n\nCompute v_s = w . phi_s, v_next = w . phi_next, and delta = r + gamma * v_next - v_s. The update uses only phi_s because the bootstrap target is treated as constant: return w + alpha * delta * phi_s.",
    starterCode: `def semi_gradient_td_update(weights, phi_s, phi_next, r, alpha, gamma):
    # Your code here
    pass`,
    solution: `def semi_gradient_td_update(weights, phi_s, phi_next, r, alpha, gamma):
    v_s = sum(weights[i] * phi_s[i] for i in range(len(weights)))
    v_n = sum(weights[i] * phi_next[i] for i in range(len(weights)))
    delta = r + gamma * v_n - v_s
    return [weights[i] + alpha * delta * phi_s[i] for i in range(len(weights))]`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 0.0], [0.0, 1.0], 1.0, 0.1, 0.9], expected: [1.18, 2.0] },
      { input: [[0.0, 0.0], [1.0, 1.0], [1.0, 1.0], 2.0, 0.5, 1.0], expected: [1.0, 1.0] },
      { input: [[0.5, -1.0], [2.0, 0.0], [0.0, 2.0], 0.0, 0.25, 0.5], expected: [-0.5, -1.0] },
    ],
    hint: "Ignoring the gradient of the bootstrap target is what makes it semi-gradient.",
  },
  {
    id: "rl-139",
    title: "True Online TD(Lambda) Lite",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Take one true online TD(lambda) step with Dutch traces.\n\nAfter computing delta = r + gamma * w.phi_next - w.phi_s, decay the trace to z = gamma*lam*trace, compute scale = 1 - alpha*gamma*lam*(z.phi_s), set z = z + scale*phi_s, and return [w + alpha*delta*z, z].",
    starterCode: `def true_online_td_lambda(weights, phi_s, phi_next, r, trace, alpha, gamma, lam):
    # Your code here
    pass`,
    solution: `def true_online_td_lambda(weights, phi_s, phi_next, r, trace, alpha, gamma, lam):
    v_s = sum(weights[i] * phi_s[i] for i in range(len(weights)))
    v_n = sum(weights[i] * phi_next[i] for i in range(len(weights)))
    delta = r + gamma * v_n - v_s
    z = [gamma * lam * trace[i] for i in range(len(trace))]
    z_dot_phi = sum(z[i] * phi_s[i] for i in range(len(phi_s)))
    scale = 1.0 - alpha * gamma * lam * z_dot_phi
    z = [z[i] + scale * phi_s[i] for i in range(len(phi_s))]
    new_weights = [weights[i] + alpha * delta * z[i] for i in range(len(weights))]
    return [new_weights, z]`,
    testCases: [
      { input: [[0.0, 0.0], [1.0, 0.0], [0.0, 1.0], 1.0, [0.0, 0.0], 0.1, 0.9, 0.5], expected: [[0.1, 0.0], [1.0, 0.0]] },
      { input: [[1.0, 1.0], [1.0, 1.0], [1.0, 0.0], 0.0, [0.5, 0.5], 0.2, 0.5, 0.1], expected: [[0.69265, 0.69265], [1.0245, 1.0245]] },
      { input: [[0.5, -0.5], [1.0, 1.0], [0.5, 0.5], 1.0, [0.2, 0.2], 0.1, 0.9, 0.9], expected: [[0.6135756, -0.3864244], [1.135756, 1.135756]] },
    ],
    hint: "The scale factor corrects the trace so the algorithm is exactly online-equivalent to TD(lambda).",
  },
  {
    id: "rl-140",
    title: "Emphatic TD Lite",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Update the follow-on trace and emphasis used by emphatic TD.\n\nF_new = gamma * follow_on + interest and M = lam * interest + (1 - lam) * F_new. Return [F_new, M].",
    starterCode: `def emphatic_td_lite(follow_on, interest, gamma, lam):
    # Your code here
    pass`,
    solution: `def emphatic_td_lite(follow_on, interest, gamma, lam):
    F_new = gamma * follow_on + interest
    M = lam * interest + (1.0 - lam) * F_new
    return [F_new, M]`,
    testCases: [
      { input: [0.0, 1.0, 0.9, 0.5], expected: [1.0, 1.0] },
      { input: [2.0, 3.0, 0.5, 0.1], expected: [4.0, 3.9000000000000004] },
      { input: [1.0, 1.0, 1.0, 1.0], expected: [2.0, 1.0] },
    ],
    hint: "The emphatic weight re-weights updates so they do not vanish under off-policy sampling.",
  },
  {
    id: "rl-141",
    title: "Gradient TD One Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one GTD(0) gradient-TD step with a secondary weights vector.\n\nWith delta = r + gamma*w.phi_next - w.phi_s and xv = v.phi_s, update w by alpha*delta*phi_s - alpha*gamma*xv*phi_next and v by beta*delta*phi_s. Return [new_w, new_v].",
    starterCode: `def gtd_one_step(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def gtd_one_step(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    v_s = sum(weights[i] * phi_s[i] for i in range(len(weights)))
    v_n = sum(weights[i] * phi_next[i] for i in range(len(weights)))
    delta = r + gamma * v_n - v_s
    x_dot_v = sum(phi_s[i] * v[i] for i in range(len(v)))
    new_w = [weights[i] + alpha * delta * phi_s[i] - alpha * gamma * x_dot_v * phi_next[i] for i in range(len(weights))]
    new_v = [v[i] + beta * delta * phi_s[i] for i in range(len(v))]
    return [new_w, new_v]`,
    testCases: [
      { input: [[1.0, 0.0], [0.5, 0.5], [1.0, 0.0], [0.0, 1.0], 1.0, 0.1, 0.05, 0.9], expected: [[1.0, -0.045000000000000005], [0.5, 0.5]] },
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, 1.0], [1.0, 0.0], 2.0, 0.2, 0.1, 0.5], expected: [[0.4, 0.4], [0.2, 0.2]] },
      { input: [[0.5, 0.5], [1.0, -1.0], [0.0, 1.0], [1.0, 0.0], 0.5, 0.05, 0.2, 0.95], expected: [[0.5475, 0.52375], [1.0, -0.905]] },
    ],
    hint: "Gradient TD stays stable off-policy because it follows the true gradient of the projected error.",
  },
  {
    id: "rl-142",
    title: "TDC Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one TDC (temporal-difference with gradient correction) step.\n\nWith delta = r + gamma*w.phi_next - w.phi_s and xv = v.phi_s, update w by alpha*delta*phi_s - alpha*gamma*xv*(phi_next - phi_s) and v by beta*delta*phi_s. Return [new_w, new_v].",
    starterCode: `def tdc_update(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def tdc_update(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    v_s = sum(weights[i] * phi_s[i] for i in range(len(weights)))
    v_n = sum(weights[i] * phi_next[i] for i in range(len(weights)))
    delta = r + gamma * v_n - v_s
    x_dot_v = sum(phi_s[i] * v[i] for i in range(len(v)))
    new_w = [weights[i] + alpha * delta * phi_s[i] - alpha * gamma * x_dot_v * (phi_next[i] - phi_s[i]) for i in range(len(weights))]
    new_v = [v[i] + beta * delta * phi_s[i] for i in range(len(v))]
    return [new_w, new_v]`,
    testCases: [
      { input: [[1.0, 0.0], [0.5, 0.5], [1.0, 0.0], [0.0, 1.0], 1.0, 0.1, 0.05, 0.9], expected: [[1.045, -0.045000000000000005], [0.5, 0.5]] },
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, 1.0], [1.0, 0.0], 2.0, 0.2, 0.1, 0.5], expected: [[0.4, 0.4], [0.2, 0.2]] },
      { input: [[0.5, 0.5], [1.0, -1.0], [0.0, 1.0], [1.0, 0.0], 0.5, 0.05, 0.2, 0.95], expected: [[0.5475, 0.47625000000000006], [1.0, -0.905]] },
    ],
    hint: "TDC applies the gradient correction almost surely while GTD2 applies it in expectation.",
  },
  {
    id: "rl-143",
    title: "GTD2 Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one GTD2 step, which factors the gradient correction.\n\nWith delta = r + gamma*w.phi_next - w.phi_s and xv = v.phi_s, update w by alpha*xv*(delta*phi_s - gamma*phi_next) and v by beta*delta*phi_s. Return [new_w, new_v].",
    starterCode: `def gtd2_update(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def gtd2_update(weights, v, phi_s, phi_next, r, alpha, beta, gamma):
    v_s = sum(weights[i] * phi_s[i] for i in range(len(weights)))
    v_n = sum(weights[i] * phi_next[i] for i in range(len(weights)))
    delta = r + gamma * v_n - v_s
    x_dot_v = sum(phi_s[i] * v[i] for i in range(len(v)))
    new_w = [weights[i] + alpha * x_dot_v * (delta * phi_s[i] - gamma * phi_next[i]) for i in range(len(weights))]
    new_v = [v[i] + beta * delta * phi_s[i] for i in range(len(v))]
    return [new_w, new_v]`,
    testCases: [
      { input: [[1.0, 0.0], [0.5, 0.5], [1.0, 0.0], [0.0, 1.0], 1.0, 0.1, 0.05, 0.9], expected: [[1.0, -0.045000000000000005], [0.5, 0.5]] },
      { input: [[0.0, 0.0], [0.0, 0.0], [1.0, 1.0], [1.0, 0.0], 2.0, 0.2, 0.1, 0.5], expected: [[0.0, 0.0], [0.2, 0.2]] },
      { input: [[0.5, 0.5], [1.0, -1.0], [0.0, 1.0], [1.0, 0.0], 0.5, 0.05, 0.2, 0.95], expected: [[0.5475, 0.47625], [1.0, -0.905]] },
    ],
    hint: "GTD2 collects two independent estimates of the same gradient direction.",
  },
  {
    id: "rl-144",
    title: "Actor-Critic With Eligibility Traces",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Apply one actor-critic update with accumulating eligibility traces.\n\nCompute delta = r + gamma * V(phi_next) - V(phi_s), accumulate both traces as gamma*trace + phi_s, then update the critic by alpha*delta*critic_trace and the actor by beta*delta*actor_trace. Return [critic_w, actor_w, critic_trace, actor_trace].",
    starterCode: `def actor_critic_trace_update(critic_w, actor_w, critic_trace, actor_trace, phi_s, r, phi_next, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def actor_critic_trace_update(critic_w, actor_w, critic_trace, actor_trace, phi_s, r, phi_next, alpha, beta, gamma):
    v_s = sum(critic_w[i] * phi_s[i] for i in range(len(critic_w)))
    v_n = sum(critic_w[i] * phi_next[i] for i in range(len(critic_w)))
    delta = r + gamma * v_n - v_s
    new_critic_trace = [gamma * critic_trace[i] + phi_s[i] for i in range(len(phi_s))]
    new_actor_trace = [gamma * actor_trace[i] + phi_s[i] for i in range(len(phi_s))]
    new_critic_w = [critic_w[i] + alpha * delta * new_critic_trace[i] for i in range(len(critic_w))]
    new_actor_w = [actor_w[i] + beta * delta * new_actor_trace[i] for i in range(len(actor_w))]
    return [new_critic_w, new_actor_w, new_critic_trace, new_actor_trace]`,
    testCases: [
      { input: [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [1.0, 0.0], 1.0, [0.0, 1.0], 0.1, 0.2, 0.9], expected: [[0.1, 0.0], [0.2, 0.0], [1.0, 0.0], [1.0, 0.0]] },
      { input: [[1.0, 1.0], [0.5, 0.5], [1.0, 0.0], [0.0, 1.0], [1.0, 1.0], 0.0, [1.0, 0.0], 0.2, 0.1, 0.5], expected: [[0.5499999999999999, 0.7], [0.35, 0.27499999999999997], [1.5, 1.0], [1.0, 1.5]] },
      { input: [[0.2, 0.2], [1.0, -1.0], [0.1, 0.1], [0.3, 0.0], [0.0, 1.0], 1.0, [1.0, 1.0], 0.1, 0.05, 0.9], expected: [[0.21044000000000002, 0.32644000000000006], [1.01566, -0.942], [0.09000000000000001, 1.09], [0.27, 1.0]] },
    ],
    hint: "Both the critic and the actor reuse the same TD error, scaled by their own traces.",
  },
  {
    id: "rl-145",
    title: "Natural Actor-Critic Step",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Take a natural policy gradient step using the Fisher information matrix.\n\nInvert the 2x2 Fisher matrix, map the gradient through it, and return params + lr * F^{-1} g.",
    starterCode: `def natural_actor_critic_step(params, fisher, grad, lr):
    # Your code here
    pass`,
    solution: `def natural_actor_critic_step(params, fisher, grad, lr):
    det = fisher[0][0] * fisher[1][1] - fisher[0][1] * fisher[1][0]
    inv = [[fisher[1][1] / det, -fisher[0][1] / det], [-fisher[1][0] / det, fisher[0][0] / det]]
    ng = [inv[0][0] * grad[0] + inv[0][1] * grad[1], inv[1][0] * grad[0] + inv[1][1] * grad[1]]
    return [params[i] + lr * ng[i] for i in range(2)]`,
    testCases: [
      { input: [[0.0, 0.0], [[1.0, 0.0], [0.0, 1.0]], [2.0, 3.0], 0.1], expected: [0.2, 0.30000000000000004] },
      { input: [[0.5, -0.5], [[2.0, 0.0], [0.0, 4.0]], [2.0, 4.0], 0.5], expected: [1.0, 0.0] },
      { input: [[1.0, 1.0], [[2.0, 1.0], [1.0, 2.0]], [1.0, 0.0], 1.0], expected: [1.6666666666666665, 0.6666666666666667] },
    ],
    hint: "The natural gradient is invariant to reparameterization of the policy.",
  },
  {
    id: "rl-146",
    title: "Compatible Features Check",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Check whether the actor features match the score function gradient, the condition for compatible function approximation. Return True when every element differs by at most tol.",
    starterCode: `def compatible_features_check(phi, grad_log_pi, tol):
    # Your code here
    pass`,
    solution: `def compatible_features_check(phi, grad_log_pi, tol):
    for i in range(len(phi)):
        if abs(phi[i] - grad_log_pi[i]) > tol:
            return False
    return True`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 2.0], 1e-09], expected: true },
      { input: [[1.0, 2.0], [1.0, 2.0000001], 1e-06], expected: true },
      { input: [[1.0, 2.0], [1.0, 2.1], 1e-06], expected: false },
      { input: [[], [], 1e-09], expected: true },
    ],
    hint: "Compatible features make the policy gradient exact for the linear critic.",
  },
  {
    id: "rl-147",
    title: "Linear FA Value Predict",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Predict a value with a linear function approximator that includes a bias.\n\nweights[0] is the bias and weights[i + 1] multiplies features[i]: return weights[0] + w[1:] . features.",
    starterCode: `def linear_value_predict(weights, features):
    # Your code here
    pass`,
    solution: `def linear_value_predict(weights, features):
    v = weights[0]
    for i in range(len(features)):
        v += weights[i + 1] * features[i]
    return v`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [4.0, 5.0]], expected: 24.0 },
      { input: [[0.0, 0.0], [1.0]], expected: 0.0 },
      { input: [[2.0, -1.0, 0.5], [2.0, 4.0]], expected: 2.0 },
      { input: [[5.0], []], expected: 5.0 },
    ],
    hint: "The first weight is a constant feature equal to one.",
  },
  {
    id: "rl-148",
    title: "Tile Coding Index",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the tile-coding index for a continuous state.\n\nEach dimension maps to int((state[i] + offsets[i] * widths[i]) // widths[i]) mod n_tiles[i], then dimensions are combined with mixed-radix strides, last dimension fastest. Return the integer index.",
    starterCode: `def tile_coding_index(state, widths, offsets, n_tiles):
    # Your code here
    pass`,
    solution: `def tile_coding_index(state, widths, offsets, n_tiles):
    index = 0
    stride = 1
    for i in range(len(state) - 1, -1, -1):
        coord = int((state[i] + offsets[i] * widths[i]) // widths[i]) % n_tiles[i]
        index += coord * stride
        stride *= n_tiles[i]
    return index`,
    testCases: [
      { input: [[0.5, 0.5], [0.1, 0.1], [0.0, 0.0], [10, 10]], expected: 44 },
      { input: [[0.95, 0.05], [0.1, 0.1], [0.0, 0.0], [10, 10]], expected: 90 },
      { input: [[0.5, 0.5], [0.1, 0.1], [0.5, 0.5], [10, 10]], expected: 55 },
      { input: [[0.25], [0.5], [0.0], [4]], expected: 0 },
    ],
    hint: "Offsets shift the grid so different tilings cover different boundaries.",
  },
  {
    id: "rl-149",
    title: "Coarse Coding Overlap Count",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of coarse-coding receptive fields that are strictly positive in a feature vector. An empty vector returns 0.0.",
    starterCode: `def coarse_coding_overlap(features):
    # Your code here
    pass`,
    solution: `def coarse_coding_overlap(features):
    if not features:
        return 0.0
    active = 0
    for f in features:
        if f > 0:
            active += 1
    return active / len(features)`,
    testCases: [
      { input: [[1.0, 0.0, 1.0, 1.0]], expected: 0.75 },
      { input: [[0.0, 0.0]], expected: 0.0 },
      { input: [[0.5]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Overlapping receptive fields give generalization between nearby states.",
  },
  {
    id: "rl-150",
    title: "RBF Feature Activation",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Evaluate a Gaussian radial basis function: exp(-||x - center||^2 / (2 * sigma^2)).",
    starterCode: `import math
def rbf_activation(x, center, sigma):
    # Your code here
    pass`,
    solution: `import math
def rbf_activation(x, center, sigma):
    total = 0.0
    for i in range(len(x)):
        total += (x[i] - center[i]) ** 2
    return math.exp(-total / (2.0 * sigma * sigma))`,
    testCases: [
      { input: [[0.0, 0.0], [0.0, 0.0], 1.0], expected: 1.0 },
      { input: [[1.0, 0.0], [0.0, 0.0], 1.0], expected: 0.6065306597126334 },
      { input: [[1.0, 1.0], [0.0, 0.0], 2.0], expected: 0.7788007830714049 },
      { input: [[2.0, 0.0], [0.0, 0.0], 1.0], expected: 0.1353352832366127 },
    ],
    hint: "Sigma controls how quickly the activation decays with distance.",
  },
  {
    id: "rl-151",
    title: "Fourier Basis Feature Value",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Evaluate a Fourier basis feature: cos(pi * order . state). The order vector holds non-negative integer frequencies, one per state dimension.",
    starterCode: `import math
def fourier_feature(state, order):
    # Your code here
    pass`,
    solution: `import math
def fourier_feature(state, order):
    dot = 0.0
    for i in range(len(state)):
        dot += order[i] * state[i]
    return math.cos(math.pi * dot)`,
    testCases: [
      { input: [[0.5], [1]], expected: 6.123233995736766e-17 },
      { input: [[0.0, 0.0], [1, 1]], expected: 1.0 },
      { input: [[0.25, 0.25], [2, 2]], expected: -1.0 },
      { input: [[0.3], [0]], expected: 1.0 },
    ],
    hint: "The all-zero order gives the constant feature 1.",
  },
  {
    id: "rl-152",
    title: "Polynomial Feature Value",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Build the polynomial feature vector [1, x, x^2, ..., x^degree] for a scalar input.",
    starterCode: `def polynomial_features(x, degree):
    # Your code here
    pass`,
    solution: `def polynomial_features(x, degree):
    return [x ** k for k in range(degree + 1)]`,
    testCases: [
      { input: [2.0, 3], expected: [1.0, 2.0, 4.0, 8.0] },
      { input: [0.5, 2], expected: [1.0, 0.5, 0.25] },
      { input: [-1.0, 1], expected: [1.0, -1.0] },
      { input: [3.0, 0], expected: [1.0] },
    ],
    hint: "The constant 1 feature lets the linear weights carry a bias.",
  },
  {
    id: "rl-153",
    title: "Feature Normalization In FA",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Normalize features with per-feature mean and standard deviation: (x - mean) / (std + epsilon) elementwise. The epsilon prevents division by zero for constant features.",
    starterCode: `def feature_normalization(features, mean, std, epsilon):
    # Your code here
    pass`,
    solution: `def feature_normalization(features, mean, std, epsilon):
    return [(features[i] - mean[i]) / (std[i] + epsilon) for i in range(len(features))]`,
    testCases: [
      { input: [[2.0, 4.0], [1.0, 2.0], [1.0, 2.0], 1e-08], expected: [0.9999999900000002, 0.999999995] },
      { input: [[0.0], [5.0], [0.0], 1e-08], expected: [-500000000.0] },
      { input: [[1.0, -1.0], [0.0, 0.0], [0.5, 0.5], 0.0], expected: [2.0, -2.0] },
    ],
    hint: "Normalizing features keeps one large-scale dimension from dominating the gradient.",
  },
  {
    id: "rl-154",
    title: "Deadly Triad Example Check Lite",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Count how many conditions of the deadly triad are present: function approximation, bootstrapping, and off-policy learning. The instability risk is highest when all three are true.",
    starterCode: `def deadly_triad_count(function_approx, bootstrapping, off_policy):
    # Your code here
    pass`,
    solution: `def deadly_triad_count(function_approx, bootstrapping, off_policy):
    count = 0
    if function_approx:
        count += 1
    if bootstrapping:
        count += 1
    if off_policy:
        count += 1
    return count`,
    testCases: [
      { input: [true, true, true], expected: 3 },
      { input: [true, false, true], expected: 2 },
      { input: [false, false, false], expected: 0 },
      { input: [true, true, false], expected: 2 },
    ],
    hint: "Tabular on-policy methods avoid the triad entirely.",
  },
  {
    id: "rl-155",
    title: "Divergence Detect In Off-Policy FA",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Detect divergence by checking whether any value in the history exceeds the threshold in absolute value. Return True on the first violation.",
    starterCode: `def divergence_detected(history, threshold):
    # Your code here
    pass`,
    solution: `def divergence_detected(history, threshold):
    for v in history:
        if abs(v) > threshold:
            return True
    return False`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 10.0], expected: false },
      { input: [[1.0, -50.0, 3.0], 10.0], expected: true },
      { input: [[], 1.0], expected: false },
      { input: [[100.0], 100.0], expected: false },
    ],
    hint: "The check is strict: values exactly at the threshold are still considered stable.",
  },
  {
    id: "rl-156",
    title: "Target Network Lag Effect",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the target network after a fixed number of soft updates while the online network stays fixed.\n\nAfter n steps the target equals online + (target0 - online) * (1 - tau)^n. Return the resulting vector.",
    starterCode: `def target_network_lag(target, online, tau, steps):
    # Your code here
    pass`,
    solution: `def target_network_lag(target, online, tau, steps):
    factor = (1.0 - tau) ** steps
    return [online[i] + (target[i] - online[i]) * factor for i in range(len(target))]`,
    testCases: [
      { input: [[0.0, 0.0], [10.0, 20.0], 0.1, 1], expected: [1.0, 2.0] },
      { input: [[0.0, 0.0], [10.0, 20.0], 0.1, 10], expected: [6.513215598999999, 13.026431197999997] },
      { input: [[1.0, 2.0], [1.0, 2.0], 0.5, 5], expected: [1.0, 2.0] },
    ],
    hint: "The target lags the online network by a geometric factor (1 - tau) per step.",
  },
  {
    id: "rl-157",
    title: "Replay Ratio",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the replay ratio: gradient updates divided by environment steps. A non-positive step count returns 0.0.",
    starterCode: `def replay_ratio(gradient_steps, env_steps):
    # Your code here
    pass`,
    solution: `def replay_ratio(gradient_steps, env_steps):
    if env_steps <= 0:
        return 0.0
    return gradient_steps / env_steps`,
    testCases: [
      { input: [100, 25], expected: 4.0 },
      { input: [1, 4], expected: 0.25 },
      { input: [0, 10], expected: 0.0 },
      { input: [7, 0], expected: 0.0 },
    ],
    hint: "A replay ratio of 1 means one gradient update per environment step.",
  },
  {
    id: "rl-158",
    title: "Prioritized Exponent Alpha",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Recover the prioritization exponent from a desired max/min sampling-probability ratio.\n\nalpha = ln(prob_ratio) / ln(p_max / p_min). Return 0.0 when the inputs are degenerate: p_min <= 0, p_max <= p_min, or prob_ratio <= 1.",
    starterCode: `import math
def prioritized_exponent(p_min, p_max, prob_ratio):
    # Your code here
    pass`,
    solution: `import math
def prioritized_exponent(p_min, p_max, prob_ratio):
    if p_min <= 0 or p_max <= p_min or prob_ratio <= 1.0:
        return 0.0
    return math.log(prob_ratio) / math.log(p_max / p_min)`,
    testCases: [
      { input: [1.0, 10.0, 2.0], expected: 0.30102999566398114 },
      { input: [1.0, 4.0, 2.0], expected: 0.5 },
      { input: [2.0, 2.0, 3.0], expected: 0.0 },
      { input: [1.0, 10.0, 1.0], expected: 0.0 },
    ],
    hint: "Alpha of 0 samples uniformly; alpha of 1 samples proportional to priority.",
  },
  {
    id: "rl-159",
    title: "Importance Sampling Variance",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate the variance of the importance-sampling return estimator from samples of weight times return: Var = E[(wG)^2] - E[wG]^2. An empty batch returns 0.0.",
    starterCode: `def importance_sampling_variance(weights, returns):
    # Your code here
    pass`,
    solution: `def importance_sampling_variance(weights, returns):
    n = len(weights)
    if n == 0:
        return 0.0
    m1 = sum(weights[i] * returns[i] for i in range(n)) / n
    m2 = sum((weights[i] * returns[i]) ** 2 for i in range(n)) / n
    return m2 - m1 * m1`,
    testCases: [
      { input: [[1.0, 1.0], [1.0, 3.0]], expected: 1.0 },
      { input: [[0.5, 2.0], [2.0, 1.0]], expected: 0.25 },
      { input: [[1.0], [5.0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Large importance weights inflate estimator variance quickly.",
  },
  {
    id: "rl-160",
    title: "Per-Decision IS",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the per-decision importance-sampling terms of an off-policy episode.\n\nAt each step multiply the running ratio by target_probs[t][a_t] / behavior_probs[t][a_t] and record ratio * gamma^t * reward_t. Return the list of terms.",
    starterCode: `def per_decision_is(rewards, target_probs, behavior_probs, actions, gamma):
    # Your code here
    pass`,
    solution: `def per_decision_is(rewards, target_probs, behavior_probs, actions, gamma):
    ratio = 1.0
    terms = []
    power = 1.0
    for t in range(len(rewards)):
        ratio *= target_probs[t][actions[t]] / behavior_probs[t][actions[t]]
        terms.append(ratio * power * rewards[t])
        power *= gamma
    return terms`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], [[0.25, 0.75], [0.5, 0.5], [0.8, 0.2]], [0, 1, 0], 0.9], expected: [2.0, 1.8, 1.0125000000000002] },
      { input: [[2.0, 0.0], [[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]], [1, 0], 0.5], expected: [2.0, 0.0] },
      { input: [[1.0, 2.0], [[0.6, 0.4], [0.2, 0.8]], [[0.3, 0.7], [0.5, 0.5]], [1, 0], 1.0], expected: [0.5714285714285715, 0.45714285714285724] },
    ],
    hint: "Per-decision IS only reweights rewards from the step of each ratio onward.",
  },
  {
    id: "rl-161",
    title: "Tree Backup Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the one-step tree-backup target.\n\nIf the episode is done return the reward; otherwise return reward + gamma * (policy_probs . q_next). The policy probabilities come from the target policy, not the behavior policy.",
    starterCode: `def tree_backup_lite(reward, done, gamma, policy_probs, q_next):
    # Your code here
    pass`,
    solution: `def tree_backup_lite(reward, done, gamma, policy_probs, q_next):
    if done:
        return reward
    expected = 0.0
    for a in range(len(policy_probs)):
        expected += policy_probs[a] * q_next[a]
    return reward + gamma * expected`,
    testCases: [
      { input: [1.0, false, 0.9, [0.5, 0.5], [2.0, 4.0]], expected: 3.7 },
      { input: [1.0, true, 0.9, [0.5, 0.5], [2.0, 4.0]], expected: 1.0 },
      { input: [0.0, false, 0.5, [1.0, 0.0], [6.0, 1.0]], expected: 3.0 },
    ],
    hint: "Tree backup never uses importance ratios, so it is safe off-policy.",
  },
  {
    id: "rl-162",
    title: "N-Step Tree Backup One Node",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute a two-step tree-backup target.\n\nThe target is r0 + gamma * sum_a pi1[a] * (r1[a] + gamma * sum_b pi2[a][b] * q2[a][b]), where pi2 and q2 are indexed first by the action at the next state and then by the following action.",
    starterCode: `def tree_backup_two_step(r0, gamma, pi1, r1, pi2, q2):
    # Your code here
    pass`,
    solution: `def tree_backup_two_step(r0, gamma, pi1, r1, pi2, q2):
    exp1 = 0.0
    for a in range(len(pi1)):
        inner = 0.0
        for b in range(len(pi2[a])):
            inner += pi2[a][b] * q2[a][b]
        exp1 += pi1[a] * (r1[a] + gamma * inner)
    return r0 + gamma * exp1`,
    testCases: [
      { input: [0.0, 0.9, [0.5, 0.5], [1.0, 2.0], [[0.5, 0.5], [1.0, 0.0]], [[2.0, 4.0], [3.0, 0.0]]], expected: 3.7800000000000002 },
      { input: [1.0, 0.5, [1.0, 0.0], [2.0, 0.0], [[0.25, 0.75], [0.5, 0.5]], [[4.0, 8.0], [1.0, 1.0]]], expected: 3.75 },
      { input: [0.5, 1.0, [0.5, 0.5], [1.0, 1.0], [[1.0, 0.0], [0.0, 1.0]], [[2.0, 1.0], [1.0, 2.0]]], expected: 3.5 },
    ],
    hint: "Every branch of the tree is weighted by the target policy, never by the behavior policy.",
  },
  {
    id: "rl-163",
    title: "Q(Sigma) Lite",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the Q(sigma) target, which interpolates between expected SARSA and Q-learning.\n\nWith E = policy_probs . q_next and G = max(q_next), return r + gamma * (sigma * E + (1 - sigma) * G); a done episode returns just the reward.",
    starterCode: `def q_sigma_lite(reward, done, gamma, sigma, policy_probs, q_next):
    # Your code here
    pass`,
    solution: `def q_sigma_lite(reward, done, gamma, sigma, policy_probs, q_next):
    if done:
        return reward
    expected = 0.0
    for a in range(len(policy_probs)):
        expected += policy_probs[a] * q_next[a]
    greedy = max(q_next)
    return reward + gamma * (sigma * expected + (1.0 - sigma) * greedy)`,
    testCases: [
      { input: [1.0, false, 0.9, 0.5, [0.5, 0.5], [2.0, 4.0]], expected: 4.15 },
      { input: [0.0, false, 1.0, 0.0, [0.25, 0.75], [1.0, 5.0]], expected: 5.0 },
      { input: [2.0, true, 0.9, 0.5, [0.5, 0.5], [1.0, 1.0]], expected: 2.0 },
    ],
    hint: "Sigma of 1 is expected SARSA; sigma of 0 is Q-learning.",
  },
  {
    id: "rl-164",
    title: "Retrace Lite",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute a one-step Retrace target with a truncated importance ratio.\n\nc = min(c_bar, target_probs[a] / behavior_probs[a]) and V = target_probs . q_next; return reward + gamma * c * V. A done episode returns just the reward.",
    starterCode: `def retrace_lite(reward, done, gamma, target_probs, behavior_probs, action, q_next, c_bar):
    # Your code here
    pass`,
    solution: `def retrace_lite(reward, done, gamma, target_probs, behavior_probs, action, q_next, c_bar):
    if done:
        return reward
    ratio = target_probs[action] / behavior_probs[action]
    c = min(c_bar, ratio)
    v = 0.0
    for a in range(len(target_probs)):
        v += target_probs[a] * q_next[a]
    return reward + gamma * c * v`,
    testCases: [
      { input: [1.0, false, 0.9, [0.5, 0.5], [0.25, 0.75], 0, [2.0, 4.0], 1.0], expected: 3.7 },
      { input: [1.0, false, 0.9, [0.5, 0.5], [0.05, 0.95], 0, [2.0, 4.0], 0.2], expected: 1.54 },
      { input: [0.0, true, 0.9, [0.5, 0.5], [0.5, 0.5], 1, [2.0, 4.0], 1.0], expected: 0.0 },
    ],
    hint: "Truncating the ratio bounds the variance Retrace can inherit from a bad behavior policy.",
  },
  {
    id: "rl-165",
    title: "CEM Mean Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Update the cross-entropy method distribution by averaging the elite samples.\n\nTake the top max(1, int(n * elite_frac)) samples by score (ties broken by smallest index) and return their mean vector. No samples returns [].",
    starterCode: `def cem_mean_update(samples, scores, elite_frac):
    # Your code here
    pass`,
    solution: `def cem_mean_update(samples, scores, elite_frac):
    n = len(samples)
    if n == 0:
        return []
    k = max(1, int(n * elite_frac))
    order = sorted(range(n), key=lambda i: (-scores[i], i))
    elite = order[:k]
    d = len(samples[0])
    return [sum(samples[i][j] for i in elite) / k for j in range(d)]`,
    testCases: [
      { input: [[[0.0, 0.0], [1.0, 2.0], [2.0, 4.0], [3.0, 6.0]], [1.0, 4.0, 3.0, 2.0], 0.5], expected: [1.5, 3.0] },
      { input: [[[1.0], [2.0], [3.0]], [5.0, 5.0, 1.0], 1.0], expected: [2.0] },
      { input: [[[0.0], [1.0]], [1.0, 2.0], 0.6], expected: [1.0] },
    ],
    hint: "Only the elite fraction of samples shapes the next search distribution.",
  },
  {
    id: "rl-166",
    title: "Evolution Strategies Gradient Estimate",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Estimate the evolution strategies gradient from sampled perturbations: (1 / (n * sigma)) * sum of fitness[i] * epsilon[i], returned as a vector. An empty batch returns [].",
    starterCode: `def es_gradient_estimate(fitness, epsilons, sigma):
    # Your code here
    pass`,
    solution: `def es_gradient_estimate(fitness, epsilons, sigma):
    n = len(fitness)
    if n == 0:
        return []
    d = len(epsilons[0])
    return [sum(fitness[i] * epsilons[i][j] for i in range(n)) / (n * sigma) for j in range(d)]`,
    testCases: [
      { input: [[1.0, -1.0], [[1.0, 0.0], [1.0, 0.0]], 1.0], expected: [0.0, 0.0] },
      { input: [[2.0, 4.0], [[1.0, -1.0], [0.0, 1.0]], 0.5], expected: [2.0, 2.0] },
      { input: [[1.0, 2.0, 3.0], [[1.0, 0.0], [0.0, 1.0], [-1.0, -1.0]], 2.0], expected: [-0.3333333333333333, -0.16666666666666666] },
    ],
    hint: "The score-function trick turns black-box fitness into a gradient estimate.",
  },
  {
    id: "rl-167",
    title: "ARS Perturbation Seeded",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Draw a Gaussian perturbation direction with rng = random.Random(seed) and rng.gauss(0, 1) per dimension. The seed makes the direction reproducible.",
    starterCode: `import random
def ars_perturbation(dim, seed):
    # Your code here
    pass`,
    solution: `import random
def ars_perturbation(dim, seed):
    rng = random.Random(seed)
    return [rng.gauss(0.0, 1.0) for _ in range(dim)]`,
    testCases: [
      { input: [3, 42], expected: [-0.14409032957792836, -0.1729036003315193, -0.11131586156766246] },
      { input: [2, 0], expected: [0.9417154046806644, -1.3965781047011498] },
      { input: [1, 7], expected: [-0.2558802884476004] },
    ],
    hint: "Augmented random search samples one direction and evaluates both signs of it.",
  },
  {
    id: "rl-168",
    title: "Parameter Space Noise",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Perturb parameters for exploration by adding sigma * noise elementwise. Return the perturbed parameter vector.",
    starterCode: `def parameter_space_noise(weights, noise, sigma):
    # Your code here
    pass`,
    solution: `def parameter_space_noise(weights, noise, sigma):
    return [weights[i] + sigma * noise[i] for i in range(len(weights))]`,
    testCases: [
      { input: [[1.0, 2.0], [0.5, -0.5], 0.1], expected: [1.05, 1.95] },
      { input: [[0.0], [1.0], 0.0], expected: [0.0] },
      { input: [[1.0, 1.0, 1.0], [1.0, 2.0, 3.0], 0.5], expected: [1.5, 2.0, 2.5] },
    ],
    hint: "Parameter-space noise explores consistently across time, unlike independent action noise.",
  },
  {
    id: "rl-169",
    title: "Action Space Noise",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Add noise to an action for exploration and clip the result to the valid range [low, high].",
    starterCode: `def action_space_noise(action, noise, low, high):
    # Your code here
    pass`,
    solution: `def action_space_noise(action, noise, low, high):
    a = action + noise
    return max(low, min(high, a))`,
    testCases: [
      { input: [0.5, 0.2, -1.0, 1.0], expected: 0.7 },
      { input: [0.9, 0.5, -1.0, 1.0], expected: 1.0 },
      { input: [-0.9, -0.5, -1.0, 1.0], expected: -1.0 },
    ],
    hint: "Clipping keeps the noisy action inside the environment's action bounds.",
  },
  {
    id: "rl-170",
    title: "OU Noise Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Take one Ornstein-Uhlenbeck step: x + theta*(mu - x)*dt + sigma*sqrt(dt)*noise. The process mean-reverts toward mu.",
    starterCode: `import math
def ou_noise_step(x, mu, theta, sigma, dt, noise):
    # Your code here
    pass`,
    solution: `import math
def ou_noise_step(x, mu, theta, sigma, dt, noise):
    return x + theta * (mu - x) * dt + sigma * math.sqrt(dt) * noise`,
    testCases: [
      { input: [0.0, 0.0, 0.15, 0.2, 0.01, 1.0], expected: 0.020000000000000004 },
      { input: [1.0, 0.0, 0.5, 0.3, 0.25, -1.0], expected: 0.725 },
      { input: [0.5, 0.5, 0.1, 0.1, 0.0, 1.0], expected: 0.5 },
    ],
    hint: "OU noise creates temporally correlated exploration for continuous control.",
  },
  {
    id: "rl-171",
    title: "DDPG Critic Target Compute",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the DDPG critic target: reward + gamma * target_q_next * (1 - done). A done flag removes the bootstrap term.",
    starterCode: `def ddpg_critic_target(reward, done, gamma, target_q_next):
    # Your code here
    pass`,
    solution: `def ddpg_critic_target(reward, done, gamma, target_q_next):
    return reward + gamma * target_q_next * (1 - done)`,
    testCases: [
      { input: [1.0, false, 0.9, 2.0], expected: 2.8 },
      { input: [1.0, true, 0.9, 2.0], expected: 1.0 },
      { input: [0.0, false, 0.5, -2.0], expected: -1.0 },
    ],
    hint: "The target policy, not the behavior policy, produces the next action.",
  },
  {
    id: "rl-172",
    title: "TD3 Policy Smoothing",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Average two smoothed TD3 target actions for variance reduction.\n\nClip each noise to [-clip_range, clip_range], add it to the action, clamp the result to [low, high], and return the mean of the two smoothed actions.",
    starterCode: `def td3_policy_smoothing(action, noise1, noise2, clip_range, low, high):
    # Your code here
    pass`,
    solution: `def td3_policy_smoothing(action, noise1, noise2, clip_range, low, high):
    c1 = max(-clip_range, min(clip_range, noise1))
    c2 = max(-clip_range, min(clip_range, noise2))
    a1 = max(low, min(high, action + c1))
    a2 = max(low, min(high, action + c2))
    return (a1 + a2) / 2.0`,
    testCases: [
      { input: [0.5, 0.2, -0.1, 0.15, -1.0, 1.0], expected: 0.525 },
      { input: [0.95, 0.5, 0.5, 0.2, -1.0, 1.0], expected: 1.0 },
      { input: [-0.9, -0.5, 0.5, 0.2, -1.0, 1.0], expected: -0.85 },
    ],
    hint: "Averaging two smoothed targets further reduces the variance of the critic target.",
  },
  {
    id: "rl-173",
    title: "Delayed Policy Update Counter",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return how many policy updates are now due under delayed policy updates: step // delay minus updates_done, floored at 0. A non-positive delay returns 0.",
    starterCode: `def delayed_policy_updates(step, delay, updates_done):
    # Your code here
    pass`,
    solution: `def delayed_policy_updates(step, delay, updates_done):
    if delay <= 0:
        return 0
    due = step // delay
    return max(0, due - updates_done)`,
    testCases: [
      { input: [10, 2, 3], expected: 2 },
      { input: [10, 2, 5], expected: 0 },
      { input: [1, 2, 0], expected: 0 },
      { input: [8, 0, 0], expected: 0 },
    ],
    hint: "TD3 updates the actor and target networks less often than the critic.",
  },
  {
    id: "rl-174",
    title: "Target Policy Noise Clip",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Clip target policy noise to the interval [-clip_range, clip_range].",
    starterCode: `def clip_target_noise(noise, clip_range):
    # Your code here
    pass`,
    solution: `def clip_target_noise(noise, clip_range):
    return max(-clip_range, min(clip_range, noise))`,
    testCases: [
      { input: [0.2, 0.5], expected: 0.2 },
      { input: [0.8, 0.5], expected: 0.5 },
      { input: [-0.8, 0.5], expected: -0.5 },
    ],
    hint: "Bounding the noise keeps the smoothed target close to the true target action.",
  },
  {
    id: "rl-175",
    title: "SAC Log Prob Tanh Correction",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Correct a Gaussian log-probability for tanh squashing.\n\nSubtract the sum of log(1 - tanh(u)^2) over the pre-tanh actions, using the stable identity 2*(ln 2 - u - ln(1 + exp(-2u))) for each u.",
    starterCode: `import math
def sac_tanh_log_prob(base_log_prob, pre_tanh_actions):
    # Your code here
    pass`,
    solution: `import math
def sac_tanh_log_prob(base_log_prob, pre_tanh_actions):
    total = base_log_prob
    for u in pre_tanh_actions:
        total -= 2.0 * (math.log(2.0) - u - math.log1p(math.exp(-2.0 * u)))
    return total`,
    testCases: [
      { input: [0.0, [0.0]], expected: 0.0 },
      { input: [0.0, [1.0]], expected: 0.8675616609660544 },
      { input: [-1.0, [0.5, -0.5]], expected: -0.51954197216689 },
      { input: [0.0, []], expected: 0.0 },
    ],
    hint: "The change-of-variables term keeps the squashed density normalized.",
  },
  {
    id: "rl-176",
    title: "Squashed Gaussian Sample Seeded",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample u ~ Normal(mu, sigma) with rng = random.Random(seed), then squash it with tanh. Return [u, tanh(u)] so callers can also use the pre-squash value in the log-probability.",
    starterCode: `import random, math
def squashed_gaussian_sample(mu, sigma, seed):
    # Your code here
    pass`,
    solution: `import random, math
def squashed_gaussian_sample(mu, sigma, seed):
    rng = random.Random(seed)
    u = rng.gauss(mu, sigma)
    a = math.tanh(u)
    return [u, a]`,
    testCases: [
      { input: [0.0, 1.0, 42], expected: [-0.14409032957792836, -0.1431013398880218] },
      { input: [1.0, 0.5, 0], expected: [1.4708577023403322, 0.8997409430816226] },
      { input: [-1.0, 2.0, 7], expected: [-1.5117605768952007, -0.907250987286807] },
    ],
    hint: "SAC samples via reparameterization so the policy stays differentiable.",
  },
  {
    id: "rl-177",
    title: "Discrete SAC Entropy Target",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the discrete SAC target entropy: 0.98 * ln(n_actions).",
    starterCode: `import math
def discrete_sac_entropy_target(n_actions):
    # Your code here
    pass`,
    solution: `import math
def discrete_sac_entropy_target(n_actions):
    return 0.98 * math.log(n_actions)`,
    testCases: [
      { input: [4], expected: 1.3585684738974928 },
      { input: [2], expected: 0.6792842369487464 },
      { input: [10], expected: 2.2565333911341647 },
    ],
    hint: "A fraction of the maximum entropy keeps the policy from collapsing too early.",
  },
  {
    id: "rl-178",
    title: "PPO Advantage Estimate",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute PPO value targets by adding GAE advantages back to the value estimates.\n\nBuild the GAE vector backwards with delta = r + gamma*V_{t+1} - V_t and A_t = delta + gamma*lam*A_{t+1}, then return A_t + V_t for every step. values has one more entry than rewards.",
    starterCode: `def ppo_value_targets(rewards, values, gamma, lam):
    # Your code here
    pass`,
    solution: `def ppo_value_targets(rewards, values, gamma, lam):
    n = len(rewards)
    adv = [0.0] * n
    gae = 0.0
    for t in range(n - 1, -1, -1):
        delta = rewards[t] + gamma * values[t + 1] - values[t]
        gae = delta + gamma * lam * gae
        adv[t] = gae
    return [adv[t] + values[t] for t in range(n)]`,
    testCases: [
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.5], expected: [3.565, 3.7] },
      { input: [[0.0, 1.0, 2.0], [0.0, 0.0, 0.0, 0.0], 0.9, 0.9], expected: [2.1222000000000003, 2.62, 2.0] },
      { input: [[2.0], [1.0, 4.0], 0.5, 1.0], expected: [4.0] },
    ],
    hint: "The critic regresses toward advantage plus value, which is a variance-reduced return.",
  },
  {
    id: "rl-179",
    title: "PPO Minibatch Epochs",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the total number of gradient updates in a PPO iteration: ceil(batch_size / minibatch_size) minibatches per epoch times the number of epochs. A non-positive minibatch size returns 0.",
    starterCode: `import math
def ppo_minibatch_updates(batch_size, minibatch_size, epochs):
    # Your code here
    pass`,
    solution: `import math
def ppo_minibatch_updates(batch_size, minibatch_size, epochs):
    if minibatch_size <= 0:
        return 0
    return int(math.ceil(batch_size / minibatch_size)) * epochs`,
    testCases: [
      { input: [64, 16, 4], expected: 16 },
      { input: [100, 32, 3], expected: 12 },
      { input: [10, 10, 1], expected: 1 },
      { input: [10, 0, 5], expected: 0 },
    ],
    hint: "The last minibatch is kept even when the batch does not divide evenly.",
  },
  {
    id: "rl-180",
    title: "PPO Clip Fraction Diagnostics",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the fraction of probability ratios outside [1 - clip_eps, 1 + clip_eps], a diagnostic for how often PPO's clipping is active. An empty batch returns 0.0.",
    starterCode: `def ppo_clip_fraction(ratios, clip_eps):
    # Your code here
    pass`,
    solution: `def ppo_clip_fraction(ratios, clip_eps):
    n = len(ratios)
    if n == 0:
        return 0.0
    clipped = 0
    for r in ratios:
        if r < 1.0 - clip_eps or r > 1.0 + clip_eps:
            clipped += 1
    return clipped / n`,
    testCases: [
      { input: [[1.0, 1.05, 0.9, 1.3], 0.2], expected: 0.25 },
      { input: [[1.0, 1.1], 0.2], expected: 0.0 },
      { input: [[], 0.2], expected: 0.0 },
      { input: [[0.5, 1.5, 1.0], 0.5], expected: 0.0 },
    ],
    hint: "A large clip fraction signals that the policy is moving too fast per update.",
  },
];
