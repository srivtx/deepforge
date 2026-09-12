import type { Problem } from "@/types/problem";

// Reinforcement Learning problems are generated here.
export const problems: Problem[] = [
  {
    id: "rl-001",
    title: "Policy Evaluation Sweep",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Apply one synchronous sweep of policy evaluation on a small MDP and return the new state values.\n\ntransitions[s][a] is a list of [probability, next_state] pairs, rewards[s][a] is the expected immediate reward, and policy[s] is the chosen action. Compute V_new[s] = sum over outcomes of p * (r + gamma * V[next]). Return a new list and do not mutate V.",
    starterCode: `def policy_evaluation_sweep(transitions, rewards, policy, gamma, V):
    # Your code here
    pass`,
    solution: `def policy_evaluation_sweep(transitions, rewards, policy, gamma, V):
    new_V = []
    for s in range(len(transitions)):
        a = policy[s]
        total = 0.0
        for prob, s2 in transitions[s][a]:
            total += prob * (rewards[s][a] + gamma * V[s2])
        new_V.append(total)
    return new_V`,
    testCases: [
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], [0, 1], 0.9, [4.0, 10.0]], expected: [11.0, 9.0] },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], [1, 0], 0.9, [4.0, 10.0]], expected: [7.3, 6.6] },
      { input: [[[[[1.0, 1]]], [[[1.0, 1]]]], [[1.0], [2.0]], [0, 0], 0.5, [0.0, 0.0]], expected: [1.0, 2.0] },
      { input: [[[[[1.0, 0]]], [[[1.0, 0]]]], [[3.0], [4.0]], [0, 0], 0.0, [9.0, 9.0]], expected: [3.0, 4.0] },
    ],
    hint: "For each state use its policy action, average over the transition outcomes, and bootstrap from the old V.",
  },
  {
    id: "rl-002",
    title: "Value Iteration One Sweep",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one synchronous sweep of value iteration (Bellman optimality backup) and return the updated values.\n\nFor each state s compute the action value of every action as sum of p * (r + gamma * V[next]), then take the maximum over actions. The transition and reward layout is the same as in policy evaluation.",
    starterCode: `def value_iteration_sweep(transitions, rewards, gamma, V):
    # Your code here
    pass`,
    solution: `def value_iteration_sweep(transitions, rewards, gamma, V):
    new_V = []
    for s in range(len(transitions)):
        best = float('-inf')
        for a in range(len(transitions[s])):
            total = 0.0
            for prob, s2 in transitions[s][a]:
                total += prob * (rewards[s][a] + gamma * V[s2])
            if total > best:
                best = total
        new_V.append(best)
    return new_V`,
    testCases: [
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], 0.9, [1.0, 2.0]], expected: [3.8, 3.9] },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], 0.9, [0.0, 0.0]], expected: [2.0, 3.0] },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], 0.0, [5.0, 7.0]], expected: [2.0, 3.0] },
    ],
    hint: "Backup every action with the old V, then keep the largest one per state.",
  },
  {
    id: "rl-003",
    title: "Value Iteration To Convergence",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Run value iteration until convergence and return the final value function.\n\nUse synchronous updates V_new[s] = max_a sum of p * (r + gamma * V[next]), starting from V = 0. Stop when the maximum absolute change across states is below tol, or after 10000 sweeps, and return V.",
    starterCode: `def value_iteration(transitions, rewards, gamma, tol=1e-9):
    # Your code here
    pass`,
    solution: `def value_iteration(transitions, rewards, gamma, tol=1e-9):
    V = [0.0] * len(transitions)
    for _ in range(10000):
        new_V = []
        for s in range(len(transitions)):
            best = float('-inf')
            for a in range(len(transitions[s])):
                total = 0.0
                for prob, s2 in transitions[s][a]:
                    total += prob * (rewards[s][a] + gamma * V[s2])
                if total > best:
                    best = total
            new_V.append(best)
        diff = max(abs(new_V[i] - V[i]) for i in range(len(V)))
        V = new_V
        if diff < tol:
            break
    return V`,
    testCases: [
      { input: [[[[[1.0, 1]]], [[[0.8, 0], [0.2, 1]]]], [[2.0], [1.0]], 0.9], expected: [14.76744185221068, 14.186046503373474] },
      { input: [[[[[1.0, 1]]], [[[1.0, 2]]], [[[1.0, 2]]]], [[1.0], [2.0], [0.0]], 0.9], expected: [2.8, 2.0, 0.0] },
      { input: [[[[[1.0, 1]], [[1.0, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[1.0, 4.0], [0.0, -2.0]], 0.5], expected: [5.3333333330228925, 2.666666666045785] },
      { input: [[[[[1.0, 1]]], [[[1.0, 1]]]], [[3.0], [5.0]], 0.0], expected: [3.0, 5.0] },
    ],
    hint: "Compare the largest change between the old and new value vectors to decide when to stop.",
  },
  {
    id: "rl-004",
    title: "Policy Extraction From Q",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Extract a greedy policy from an action-value table.\n\nFor each state row return the index of the largest Q value, breaking ties by choosing the smallest action index. An empty Q table returns an empty list.",
    starterCode: `def policy_from_q(Q):
    # Your code here
    pass`,
    solution: `def policy_from_q(Q):
    policy = []
    for row in Q:
        best_a = 0
        for a in range(1, len(row)):
            if row[a] > row[best_a]:
                best_a = a
        policy.append(best_a)
    return policy`,
    testCases: [
      { input: [[[1.0, 3.0, 2.0], [5.0, 5.0, 1.0]]], expected: [1, 0] },
      { input: [[[0.0, -1.0], [-2.0, -3.0]]], expected: [0, 0] },
      { input: [[[7.0]]], expected: [0] },
      { input: [[]], expected: [] },
    ],
    hint: "Use a strict greater-than comparison so the earliest maximum wins ties.",
  },
  {
    id: "rl-005",
    title: "Policy Improvement Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Perform one policy improvement step given the current value function.\n\nFor every state compute Q(s,a) = sum of p * (r + gamma * V[next]) for all actions and return the greedy action per state. Break ties by choosing the smallest action index.",
    starterCode: `def policy_improvement(transitions, rewards, gamma, V):
    # Your code here
    pass`,
    solution: `def policy_improvement(transitions, rewards, gamma, V):
    policy = []
    for s in range(len(transitions)):
        best_a = 0
        best_q = float('-inf')
        for a in range(len(transitions[s])):
            total = 0.0
            for prob, s2 in transitions[s][a]:
                total += prob * (rewards[s][a] + gamma * V[s2])
            if total > best_q:
                best_q = total
                best_a = a
        policy.append(best_a)
    return policy`,
    testCases: [
      { input: [[[[[1.0, 0]], [[1.0, 1]]], [[[1.0, 1]], [[1.0, 0]]]], [[1.0, 0.0], [0.0, 2.0]], 0.9, [0.0, 0.0]], expected: [0, 1] },
      { input: [[[[[1.0, 0]], [[1.0, 1]]], [[[1.0, 1]], [[1.0, 0]]]], [[1.0, 0.0], [0.0, 2.0]], 0.9, [0.0, 5.0]], expected: [1, 0] },
      { input: [[[[[1.0, 0]], [[1.0, 1]]], [[[1.0, 1]], [[1.0, 0]]]], [[1.0, 0.0], [0.0, 2.0]], 1.0, [1.0, 1.0]], expected: [0, 1] },
      { input: [[[[[1.0, 0]], [[1.0, 0]]]], [[2.0, 2.0]], 0.9, [3.0]], expected: [0] },
    ],
    hint: "This is policy evaluation's one-step backup followed by an argmax over actions.",
  },
  {
    id: "rl-006",
    title: "Policy Iteration One Round",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Run one round of policy iteration: first evaluate the current policy, then improve it.\n\nEvaluation starts from V = 0 and performs sweeps synchronous updates V_new[s] = sum of p * (r + gamma * V[next]) under policy[s]. Then compute the greedy policy from that V (smallest action index on ties) and return [V, new_policy].",
    starterCode: `def policy_iteration_round(transitions, rewards, gamma, policy, sweeps):
    # Your code here
    pass`,
    solution: `def policy_iteration_round(transitions, rewards, gamma, policy, sweeps):
    V = [0.0] * len(transitions)
    for _ in range(sweeps):
        new_V = []
        for s in range(len(transitions)):
            a = policy[s]
            total = 0.0
            for prob, s2 in transitions[s][a]:
                total += prob * (rewards[s][a] + gamma * V[s2])
            new_V.append(total)
        V = new_V
    new_policy = []
    for s in range(len(transitions)):
        best_a = 0
        best_q = float('-inf')
        for a in range(len(transitions[s])):
            total = 0.0
            for prob, s2 in transitions[s][a]:
                total += prob * (rewards[s][a] + gamma * V[s2])
            if total > best_q:
                best_q = total
                best_a = a
        new_policy.append(best_a)
    return [V, new_policy]`,
    testCases: [
      { input: [[[[[1.0, 0]], [[1.0, 1]]], [[[1.0, 1]], [[1.0, 0]]]], [[1.0, 0.0], [0.0, 2.0]], 0.9, [0, 0], 20], expected: [[8.784233454094307, 0.0], [0, 1]] },
      { input: [[[[[1.0, 0]], [[1.0, 1]]], [[[1.0, 1]], [[1.0, 0]]]], [[1.0, 0.0], [0.0, 2.0]], 0.9, [1, 1], 20], expected: [[8.321905377563029, 9.246561530625588], [0, 1]] },
      { input: [[[[[1.0, 0]]]], [[2.0]], 0.5, [0], 5], expected: [[3.875], [0]] },
    ],
    hint: "Evaluate exactly `sweeps` times, then reuse the same one-step backup for the greedy policy.",
  },
  {
    id: "rl-007",
    title: "Q-Value From Transitions",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the action value Q(s,a) from a transition list and a value function.\n\ntransitions is a list of [probability, next_state] pairs, reward is the immediate reward for the action, and V holds the state values. Return sum of p * (reward + gamma * V[next]).",
    starterCode: `def q_value_from_transitions(transitions, reward, gamma, V):
    # Your code here
    pass`,
    solution: `def q_value_from_transitions(transitions, reward, gamma, V):
    total = 0.0
    for prob, s2 in transitions:
        total += prob * (reward + gamma * V[s2])
    return total`,
    testCases: [
      { input: [[[0.7, 0], [0.3, 1]], 2.0, 0.9, [1.0, 4.0]], expected: 3.71 },
      { input: [[[1.0, 1]], -1.0, 0.5, [0.0, 3.0]], expected: 0.5 },
      { input: [[[0.25, 0], [0.25, 1], [0.5, 1]], 0.0, 1.0, [2.0, 4.0]], expected: 3.5 },
      { input: [[[1.0, 0]], 5.0, 0.0, [100.0]], expected: 5.0 },
    ],
    hint: "Weight the reward plus discounted next value by each transition probability.",
  },
  {
    id: "rl-008",
    title: "State-Value From Action Values",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the state value V(s) as the expectation of action values under a policy: V(s) = sum_a probs[a] * Q[a]. Empty inputs return 0.0.",
    starterCode: `def state_value_from_q(Q, probs):
    # Your code here
    pass`,
    solution: `def state_value_from_q(Q, probs):
    return sum(p * q for p, q in zip(probs, Q))`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0.2, 0.3, 0.5]], expected: 2.3 },
      { input: [[5.0], [1.0]], expected: 5.0 },
      { input: [[1.0, 0.0], [0.5, 0.5]], expected: 0.5 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "This is just a dot product between the policy probabilities and the action values.",
  },
  {
    id: "rl-009",
    title: "Bellman Residual",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Measure how far V is from satisfying the Bellman expectation equation under a policy.\n\nFor each state compute the one-step backup sum of p * (r + gamma * V[next]) using policy[s], take the absolute difference from V[s], and return the largest difference. An empty MDP returns 0.0.",
    starterCode: `def bellman_residual(transitions, rewards, policy, gamma, V):
    # Your code here
    pass`,
    solution: `def bellman_residual(transitions, rewards, policy, gamma, V):
    worst = 0.0
    for s in range(len(transitions)):
        a = policy[s]
        total = 0.0
        for prob, s2 in transitions[s][a]:
            total += prob * (rewards[s][a] + gamma * V[s2])
        diff = abs(V[s] - total)
        if diff > worst:
            worst = diff
    return worst`,
    testCases: [
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], [0, 1], 0.9, [10.0, 10.0]], expected: 1.0 },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], [0, 1], 0.9, [11.0, 9.0]], expected: 0.9000000000000004 },
      { input: [[[[[1.0, 1]], [[0.5, 0], [0.5, 1]]], [[[1.0, 0]], [[1.0, 1]]]], [[2.0, 1.0], [3.0, 0.0]], [0, 1], 0.5, [1.0, 2.0]], expected: 2.0 },
      { input: [[], [], [], 0.9, []], expected: 0.0 },
    ],
    hint: "The residual is zero exactly when V is the fixed point of the policy's Bellman operator.",
  },
  {
    id: "rl-010",
    title: "Expected Return With Discount",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the discounted return of a reward sequence: G = sum over t of gamma^t * rewards[t]. An empty sequence returns 0.0.",
    starterCode: `def discounted_return(rewards, gamma):
    # Your code here
    pass`,
    solution: `def discounted_return(rewards, gamma):
    total = 0.0
    power = 1.0
    for r in rewards:
        total += power * r
        power *= gamma
    return total`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.5], expected: 2.75 },
      { input: [[], 0.9], expected: 0.0 },
      { input: [[5.0, 5.0], 1.0], expected: 10.0 },
      { input: [[9.0, 9.0], 0.0], expected: 9.0 },
      { input: [[1.0, -1.0, 1.0], 0.9], expected: 0.91 },
    ],
    hint: "Keep a running power of gamma instead of recomputing gamma ** t.",
  },
  {
    id: "rl-011",
    title: "Discounted Return List",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the discounted return-to-go G_t for every timestep.\n\nG_t = rewards[t] + gamma * G_{t+1}, with the value after the last step equal to 0. Return a list of the same length as rewards; an empty episode returns [].",
    starterCode: `def discounted_returns_list(rewards, gamma):
    # Your code here
    pass`,
    solution: `def discounted_returns_list(rewards, gamma):
    out = [0.0] * len(rewards)
    g = 0.0
    for t in range(len(rewards) - 1, -1, -1):
        g = rewards[t] + gamma * g
        out[t] = g
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 0.5], expected: [2.75, 3.5, 3.0] },
      { input: [[0.0, 0.0, 1.0], 0.9], expected: [0.81, 0.9, 1.0] },
      { input: [[], 0.5], expected: [] },
      { input: [[4.0], 1.0], expected: [4.0] },
    ],
    hint: "Sweep backwards and carry one accumulated return.",
  },
  {
    id: "rl-012",
    title: "Monte Carlo Return",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Estimate the value of a target state from a fixed episode using first-visit Monte Carlo.\n\nFind the first index where states equals target and return the discounted sum of rewards from that index onward. If the target never appears, return 0.0.",
    starterCode: `def monte_carlo_return(states, rewards, target, gamma):
    # Your code here
    pass`,
    solution: `def monte_carlo_return(states, rewards, target, gamma):
    start = -1
    for i in range(len(states)):
        if states[i] == target:
            start = i
            break
    if start == -1:
        return 0.0
    g = 0.0
    power = 1.0
    for t in range(start, len(rewards)):
        g += power * rewards[t]
        power *= gamma
    return g`,
    testCases: [
      { input: [["A", "B", "A"], [1.0, 2.0, 3.0], "A", 0.5], expected: 2.75 },
      { input: [["A", "B", "A"], [1.0, 2.0, 3.0], "B", 0.5], expected: 3.5 },
      { input: [["A", "B", "A"], [1.0, 2.0, 3.0], "C", 0.5], expected: 0.0 },
      { input: [["S"], [5.0], "S", 0.99], expected: 5.0 },
    ],
    hint: "The first visit matters: ignore later occurrences of the target state.",
  },
  {
    id: "rl-013",
    title: "TD(0) Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply a one-step TD(0) update to the value table and return the updated copy.\n\nV[s] becomes V[s] + alpha * (r + gamma * V[s_next] - V[s]). Do not mutate the input list.",
    starterCode: `def td0_update(V, s, r, s_next, alpha, gamma):
    # Your code here
    pass`,
    solution: `def td0_update(V, s, r, s_next, alpha, gamma):
    new_V = list(V)
    new_V[s] = new_V[s] + alpha * (r + gamma * V[s_next] - V[s])
    return new_V`,
    testCases: [
      { input: [[0.0, 0.0], 0, 1.0, 1, 0.1, 0.9], expected: [0.1, 0.0] },
      { input: [[1.0, 2.0], 1, 0.0, 0, 0.5, 1.0], expected: [1.0, 1.5] },
      { input: [[3.0, 4.0, 5.0], 0, 2.0, 2, 0.2, 0.9], expected: [3.7, 4.0, 5.0] },
    ],
    hint: "Copy the list first, then move V[s] toward the bootstrapped target by alpha.",
  },
  {
    id: "rl-014",
    title: "N-Step Return",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the n-step return from a list of rewards.\n\nUse the first min(n, len(rewards)) rewards and bootstrap with v_next only if n rewards were available; if the episode ended early there is no bootstrap. G = sum of gamma^t * r_t + gamma^n * v_next.",
    starterCode: `def n_step_return(rewards, gamma, v_next, n):
    # Your code here
    pass`,
    solution: `def n_step_return(rewards, gamma, v_next, n):
    used = min(n, len(rewards))
    total = 0.0
    power = 1.0
    for t in range(used):
        total += power * rewards[t]
        power *= gamma
    if used == n:
        total += power * v_next
    return total`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], 0.9, 5.0, 2], expected: 5.950000000000001 },
      { input: [[1.0, 1.0], 0.5, 100.0, 3], expected: 1.5 },
      { input: [[2.0], 0.9, 3.0, 1], expected: 4.7 },
      { input: [[], 0.9, 7.0, 3], expected: 0.0 },
    ],
    hint: "If fewer than n rewards are available the episode terminated, so drop the bootstrap term.",
  },
  {
    id: "rl-015",
    title: "TD(Lambda) Forward View",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the TD(lambda) forward-view return from time 0 using the backward recursion.\n\nvalues[i] is the value of the state reached after i rewards, so values[-1] bootstraps the end. Starting from g = values[-1], iterate backwards: g = reward[t] + gamma * ((1 - lam) * values[t + 1] + lam * g). If the episode is empty return values[0].",
    starterCode: `def td_lambda_forward(rewards, values, gamma, lam):
    # Your code here
    pass`,
    solution: `def td_lambda_forward(rewards, values, gamma, lam):
    g = values[-1]
    for t in range(len(rewards) - 1, -1, -1):
        g = rewards[t] + gamma * ((1.0 - lam) * values[t + 1] + lam * g)
    return g`,
    testCases: [
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.5], expected: 3.565 },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 1.0], expected: 4.33 },
      { input: [[1.0, 1.0], [0.0, 2.0, 3.0], 0.9, 0.0], expected: 2.8 },
      { input: [[2.0], [1.0, 4.0], 0.5, 0.8], expected: 4.0 },
      { input: [[], [5.0], 0.9, 0.5], expected: 5.0 },
    ],
    hint: "This backward recursion gives the same weighted average of n-step returns as the forward view.",
  },
  {
    id: "rl-016",
    title: "SARSA Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one SARSA on-policy update and return the updated Q table.\n\nQ[s][a] += alpha * (r + gamma * Q[s_next][a_next] - Q[s][a]). Return a deep copy so the original table is not modified.",
    starterCode: `def sarsa_update(Q, s, a, r, s_next, a_next, alpha, gamma):
    # Your code here
    pass`,
    solution: `def sarsa_update(Q, s, a, r, s_next, a_next, alpha, gamma):
    new_Q = [list(row) for row in Q]
    td = r + gamma * Q[s_next][a_next] - Q[s][a]
    new_Q[s][a] = Q[s][a] + alpha * td
    return new_Q`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 0, 0, 1.0, 1, 1, 0.1, 0.9], expected: [[1.3599999999999999, 2.0], [3.0, 4.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1, 0, -1.0, 0, 1, 0.5, 0.5], expected: [[1.0, 2.0], [1.5, 4.0]] },
      { input: [[[0.0]], 0, 0, 2.0, 0, 0, 1.0, 0.9], expected: [[2.0]] },
    ],
    hint: "SARSA bootstraps from the next action actually taken, unlike Q-learning.",
  },
  {
    id: "rl-017",
    title: "Q-Learning Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one Q-learning off-policy update and return the updated Q table.\n\nQ[s][a] += alpha * (r + gamma * max_a' Q[s_next][a'] - Q[s][a]). Return a deep copy so the original table is not modified.",
    starterCode: `def q_learning_update(Q, s, a, r, s_next, alpha, gamma):
    # Your code here
    pass`,
    solution: `def q_learning_update(Q, s, a, r, s_next, alpha, gamma):
    new_Q = [list(row) for row in Q]
    best = max(Q[s_next])
    td = r + gamma * best - Q[s][a]
    new_Q[s][a] = Q[s][a] + alpha * td
    return new_Q`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 0, 0, 1.0, 1, 0.1, 0.9], expected: [[1.3599999999999999, 2.0], [3.0, 4.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1, 1, 0.0, 0, 0.5, 0.5], expected: [[1.0, 2.0], [3.0, 2.5]] },
      { input: [[[0.0]], 0, 0, 2.0, 0, 0.25, 0.9], expected: [[0.5]] },
    ],
    hint: "Use the maximum over the next state's actions regardless of the behavior policy.",
  },
  {
    id: "rl-018",
    title: "Double Q-Learning Update",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Apply one Double Q-learning update to one of two Q tables.\n\nIf update_first is true, select the greedy action from Q1[s_next] and evaluate it with Q2[s_next], updating Q1[s][a]; otherwise select from Q2 and evaluate with Q1, updating Q2. Break argmax ties by smallest index and return [Q1, Q2] as deep copies.",
    starterCode: `def double_q_learning_update(Q1, Q2, s, a, r, s_next, alpha, gamma, update_first):
    # Your code here
    pass`,
    solution: `def double_q_learning_update(Q1, Q2, s, a, r, s_next, alpha, gamma, update_first):
    new_Q1 = [list(row) for row in Q1]
    new_Q2 = [list(row) for row in Q2]
    if update_first:
        row = Q1[s_next]
        best_a = 0
        for i in range(1, len(row)):
            if row[i] > row[best_a]:
                best_a = i
        td = r + gamma * Q2[s_next][best_a] - Q1[s][a]
        new_Q1[s][a] = Q1[s][a] + alpha * td
    else:
        row = Q2[s_next]
        best_a = 0
        for i in range(1, len(row)):
            if row[i] > row[best_a]:
                best_a = i
        td = r + gamma * Q1[s_next][best_a] - Q2[s][a]
        new_Q2[s][a] = Q2[s][a] + alpha * td
    return [new_Q1, new_Q2]`,
    testCases: [
      { input: [[[1.0, 2.0], [0.5, 3.0]], [[4.0, 1.0], [2.0, 2.5]], 0, 1, 1.5, 1, 0.1, 0.9, true], expected: [[[1.0, 2.175], [0.5, 3.0]], [[4.0, 1.0], [2.0, 2.5]]] },
      { input: [[[1.0, 2.0], [0.5, 3.0]], [[4.0, 1.0], [2.0, 2.5]], 0, 1, 1.5, 1, 0.1, 0.9, false], expected: [[[1.0, 2.0], [0.5, 3.0]], [[4.0, 1.32], [2.0, 2.5]]] },
      { input: [[[0.0, 0.0], [3.0, 3.0]], [[1.0, 1.0], [5.0, 1.0]], 0, 0, 0.0, 1, 0.5, 1.0, true], expected: [[[2.5, 0.0], [3.0, 3.0]], [[1.0, 1.0], [5.0, 1.0]]] },
    ],
    hint: "One table chooses the action, the other table scores it, which fights maximization bias.",
  },
  {
    id: "rl-019",
    title: "Expected SARSA Update",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Apply one Expected SARSA update using the full policy distribution over next actions.\n\nexpected = sum_b probs[b] * Q[s_next][b], then Q[s][a] += alpha * (r + gamma * expected - Q[s][a]). Return a deep copy of Q.",
    starterCode: `def expected_sarsa_update(Q, s, a, r, s_next, probs, alpha, gamma):
    # Your code here
    pass`,
    solution: `def expected_sarsa_update(Q, s, a, r, s_next, probs, alpha, gamma):
    new_Q = [list(row) for row in Q]
    exp_q = 0.0
    for i in range(len(probs)):
        exp_q += probs[i] * Q[s_next][i]
    td = r + gamma * exp_q - Q[s][a]
    new_Q[s][a] = Q[s][a] + alpha * td
    return new_Q`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 4.0]], 0, 0, 1.0, 1, [0.25, 0.75], 0.1, 0.9], expected: [[1.3375, 2.0], [3.0, 4.0]] },
      { input: [[[1.0, 2.0], [3.0, 4.0]], 1, 1, -1.0, 0, [1.0, 0.0], 0.5, 0.5], expected: [[1.0, 2.0], [3.0, 1.75]] },
      { input: [[[1.0, 2.0]], 0, 1, 0.0, 0, [0.5, 0.5], 1.0, 1.0], expected: [[1.0, 1.5]] },
    ],
    hint: "Replace the sampled next action with its expectation under the policy.",
  },
  {
    id: "rl-020",
    title: "Epsilon-Greedy Action",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Choose an action with the epsilon-greedy policy using a seeded random generator.\n\nCreate rng = random.Random(seed) and draw u = rng.random(). If u < epsilon return rng.randrange(len(Q)); otherwise return the greedy action (smallest index on ties). The seed makes the result fully deterministic.",
    starterCode: `import random
def epsilon_greedy_action(Q, epsilon, seed):
    # Your code here
    pass`,
    solution: `import random
def epsilon_greedy_action(Q, epsilon, seed):
    rng = random.Random(seed)
    u = rng.random()
    if u < epsilon:
        return rng.randrange(len(Q))
    best_a = 0
    for i in range(1, len(Q)):
        if Q[i] > Q[best_a]:
            best_a = i
    return best_a`,
    testCases: [
      { input: [[0.2, 1.0, 0.5], 0.0, 0], expected: 1 },
      { input: [[0.2, 1.0, 0.5], 0.5, 1], expected: 0 },
      { input: [[0.2, 1.0, 0.5], 0.3, 3], expected: 2 },
      { input: [[0.2, 1.0, 0.5], 1.0, 7], expected: 0 },
      { input: [[0.2, 1.0, 0.5], 0.3, 5], expected: 1 },
    ],
    hint: "Draw the uniform number first so the random stream matches for every epsilon.",
  },
  {
    id: "rl-021",
    title: "Epsilon-Greedy Action Probabilities",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Return the action-probability vector induced by an epsilon-greedy policy.\n\nEvery action starts with epsilon / n, and the greedy action (smallest index on ties) additionally receives 1 - epsilon. An empty Q table returns [].",
    starterCode: `def epsilon_greedy_probs(Q, epsilon):
    # Your code here
    pass`,
    solution: `def epsilon_greedy_probs(Q, epsilon):
    n = len(Q)
    if n == 0:
        return []
    best_a = 0
    for i in range(1, n):
        if Q[i] > Q[best_a]:
            best_a = i
    probs = [epsilon / n] * n
    probs[best_a] += 1.0 - epsilon
    return probs`,
    testCases: [
      { input: [[1.0, 2.0, 2.0], 0.3], expected: [0.09999999999999999, 0.7999999999999999, 0.09999999999999999] },
      { input: [[5.0], 0.4], expected: [1.0] },
      { input: [[0.0, 0.0], 0.5], expected: [0.75, 0.25] },
      { input: [[-1.0, -2.0, -2.0], 0.0], expected: [1.0, 0.0, 0.0] },
      { input: [[], 0.5], expected: [] },
    ],
    hint: "All actions share the exploration mass; only the greedy action gets the extra exploit mass.",
  },
  {
    id: "rl-022",
    title: "Softmax Policy Probabilities",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Convert action preferences into a probability distribution with a temperature parameter.\n\nReturn softmax(logits / temperature) computed with the max-subtraction trick so large logits do not overflow. The temperature is positive and logits is non-empty.",
    starterCode: `import math
def softmax_probs(logits, temperature):
    # Your code here
    pass`,
    solution: `import math
def softmax_probs(logits, temperature):
    m = max(logits)
    exps = [math.exp((z - m) / temperature) for z in logits]
    total = sum(exps)
    return [e / total for e in exps]`,
    testCases: [
      { input: [[0.0, 0.0], 1.0], expected: [0.5, 0.5] },
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0.09003057317038046, 0.24472847105479764, 0.6652409557748218] },
      { input: [[1000.0, 1000.0], 1.0], expected: [0.5, 0.5] },
      { input: [[2.0, 1.0, 0.0], 0.5], expected: [0.8668133321973349, 0.11731042782619838, 0.015876239976466765] },
      { input: [[-1.0, -1.0, -1.0], 2.0], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "Subtracting the maximum leaves the ratio unchanged but keeps exp() in range.",
  },
  {
    id: "rl-023",
    title: "UCB Action Choice",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Pick an action with the UCB1 rule.\n\nIf any action has count 0, return the first such action. Otherwise return the argmax of Q[a] + c * sqrt(ln(t) / counts[a]), breaking ties toward the smallest index. t is the total number of pulls so far.",
    starterCode: `import math
def ucb_action(Q, counts, t, c):
    # Your code here
    pass`,
    solution: `import math
def ucb_action(Q, counts, t, c):
    best_a = 0
    best_score = float('-inf')
    for a in range(len(Q)):
        if counts[a] == 0:
            return a
    for a in range(len(Q)):
        score = Q[a] + c * math.sqrt(math.log(t) / counts[a])
        if score > best_score:
            best_score = score
            best_a = a
    return best_a`,
    testCases: [
      { input: [[0.5, 0.4], [5, 2], 10, 1.0], expected: 1 },
      { input: [[1.0, 1.0, 1.0], [0, 3, 3], 6, 2.0], expected: 0 },
      { input: [[0.5, 0.4], [5, 2], 10, 0.1], expected: 0 },
      { input: [[0.9, 0.1], [100, 1], 10, 1.0], expected: 1 },
    ],
    hint: "The exploration bonus shrinks as 1 / sqrt(count), so rare actions get sampled first.",
  },
  {
    id: "rl-024",
    title: "Optimistic Initialization Effect",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Simulate a deterministic multi-armed bandit to measure how long optimistic initialization drives exploration.\n\nAll Q values start at q_init and pulling arm a returns its true mean. At each step choose the greedy arm (smallest index on ties), update its sample average, and stop the first time the chosen arm is a true optimal arm. Return the 1-based step number, or -1 if the optimal arm is not chosen within 1000 steps.",
    starterCode: `def optimistic_init_steps(means, q_init):
    # Your code here
    pass`,
    solution: `def optimistic_init_steps(means, q_init):
    n = len(means)
    Q = [float(q_init)] * n
    counts = [0] * n
    for step in range(1, 1001):
        best_a = 0
        for a in range(1, n):
            if Q[a] > Q[best_a]:
                best_a = a
        reward = means[best_a]
        counts[best_a] += 1
        Q[best_a] += (reward - Q[best_a]) / counts[best_a]
        best_true = 0
        for a in range(1, n):
            if means[a] > means[best_true]:
                best_true = a
        if best_a == best_true:
            return step
    return -1`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 5.0], expected: 3 },
      { input: [[1.0, 2.0, 3.0], 0.0], expected: -1 },
      { input: [[1.0, 2.0, 3.0], 10.0], expected: 3 },
      { input: [[3.0, 2.0, 1.0], 0.0], expected: 1 },
      { input: [[5.0, 5.0], 10.0], expected: 1 },
    ],
    hint: "High initial values make every arm look promising until it has been sampled down.",
  },
  {
    id: "rl-025",
    title: "Bandit Sample Average Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Update an arm's sample-average estimate after observing a reward.\n\nIncrement counts[a], then set Q[a] += (reward - Q[a]) / counts[a]. Return [new_Q, new_counts] without mutating the inputs.",
    starterCode: `def sample_average_update(Q, counts, a, reward):
    # Your code here
    pass`,
    solution: `def sample_average_update(Q, counts, a, reward):
    new_Q = list(Q)
    new_counts = list(counts)
    new_counts[a] += 1
    new_Q[a] = Q[a] + (reward - Q[a]) / new_counts[a]
    return [new_Q, new_counts]`,
    testCases: [
      { input: [[0.0, 0.0], [0, 0], 0, 2.0], expected: [[2.0, 0.0], [1, 0]] },
      { input: [[2.0, 0.0], [1, 0], 0, 4.0], expected: [[3.0, 0.0], [2, 0]] },
      { input: [[1.0, 3.0, 5.0], [2, 1, 4], 2, 0.0], expected: [[1.0, 3.0, 4.0], [2, 1, 5]] },
    ],
    hint: "The incremental formula keeps the exact running mean without storing every reward.",
  },
  {
    id: "rl-026",
    title: "Incremental Mean Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Update a running mean with one new observation.\n\nGiven the mean of n samples and a new value x, return mean + (x - mean) / (n + 1), which is the mean of the n + 1 samples.",
    starterCode: `def incremental_mean(mean, n, x):
    # Your code here
    pass`,
    solution: `def incremental_mean(mean, n, x):
    return mean + (x - mean) / (n + 1)`,
    testCases: [
      { input: [2.0, 3, 6.0], expected: 3.0 },
      { input: [0.0, 0, 10.0], expected: 10.0 },
      { input: [5.0, 1, 1.0], expected: 3.0 },
      { input: [-2.0, 4, 3.0], expected: -1.0 },
    ],
    hint: "Pull the old mean toward the new value by 1 / (n + 1).",
  },
  {
    id: "rl-027",
    title: "Reward Normalization",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Normalize a list of rewards by dividing by the largest absolute reward.\n\nAn empty list returns []. If every reward is zero, return a list of zeros instead of dividing by zero.",
    starterCode: `def normalize_rewards(rewards):
    # Your code here
    pass`,
    solution: `def normalize_rewards(rewards):
    if not rewards:
        return []
    m = max(abs(r) for r in rewards)
    if m == 0.0:
        return [0.0 for _ in rewards]
    return [r / m for r in rewards]`,
    testCases: [
      { input: [[1.0, -2.0, 4.0]], expected: [0.25, -0.5, 1.0] },
      { input: [[]], expected: [] },
      { input: [[0.0, 0.0]], expected: [0.0, 0.0] },
      { input: [[-3.0, -6.0]], expected: [-0.5, -1.0] },
    ],
    hint: "Scaling by the maximum magnitude keeps signs and bounds every value in [-1, 1].",
  },
  {
    id: "rl-028",
    title: "Advantage Function",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the advantage of each action: A(s,a) = Q(s,a) - V(s). Return a list with the same length as Q_values.",
    starterCode: `def advantage_function(Q_values, state_value):
    # Your code here
    pass`,
    solution: `def advantage_function(Q_values, state_value):
    return [q - state_value for q in Q_values]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 2.0], expected: [-1.0, 0.0, 1.0] },
      { input: [[0.0, 0.0], 0.0], expected: [0.0, 0.0] },
      { input: [[-1.0, 5.0], 3.0], expected: [-4.0, 2.0] },
      { input: [[], 1.0], expected: [] },
    ],
    hint: "The value function is the baseline; advantages say which actions beat it.",
  },
  {
    id: "rl-029",
    title: "GAE One Step",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute one step of generalized advantage estimation.\n\nFirst form the TD residual delta = reward + gamma * next_value - value, then return delta + gamma * lam * next_advantage. Pass next_advantage = 0.0 for the final step of an episode.",
    starterCode: `def gae_one_step(reward, value, next_value, gamma, lam, next_advantage):
    # Your code here
    pass`,
    solution: `def gae_one_step(reward, value, next_value, gamma, lam, next_advantage):
    delta = reward + gamma * next_value - value
    return delta + gamma * lam * next_advantage`,
    testCases: [
      { input: [1.0, 2.0, 3.0, 0.9, 0.95, 0.0], expected: 1.7000000000000002 },
      { input: [1.0, 2.0, 3.0, 0.9, 0.95, 2.0], expected: 3.41 },
      { input: [0.0, 0.0, 0.0, 0.99, 0.5, 1.0], expected: 0.495 },
      { input: [-1.0, 1.0, 2.0, 0.5, 1.0, -0.5], expected: -1.25 },
    ],
    hint: "GAE mixes the current TD residual with the discounted advantage of the next step.",
  },
  {
    id: "rl-030",
    title: "TD Error",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the one-step temporal-difference error: delta = reward + gamma * next_value - value. This is the residual between the bootstrapped target and the current estimate.",
    starterCode: `def td_error(reward, value, next_value, gamma):
    # Your code here
    pass`,
    solution: `def td_error(reward, value, next_value, gamma):
    return reward + gamma * next_value - value`,
    testCases: [
      { input: [1.0, 2.0, 3.0, 0.9], expected: 1.7000000000000002 },
      { input: [0.0, 0.0, 0.0, 0.9], expected: 0.0 },
      { input: [-1.0, 2.0, 1.0, 0.5], expected: -2.5 },
      { input: [5.0, 5.0, 5.0, 1.0], expected: 5.0 },
    ],
    hint: "It is the reward plus discounted next value minus the current value estimate.",
  },
  {
    id: "rl-031",
    title: "Importance Sampling Ratio",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the importance-sampling ratio of a sequence of actions.\n\nMultiply target_probs[a] / behavior_probs[a] over every action in order. An empty action list gives a ratio of 1.0; assume behavior probabilities are positive.",
    starterCode: `def importance_ratio(target_probs, behavior_probs, actions):
    # Your code here
    pass`,
    solution: `def importance_ratio(target_probs, behavior_probs, actions):
    ratio = 1.0
    for a in actions:
        ratio *= target_probs[a] / behavior_probs[a]
    return ratio`,
    testCases: [
      { input: [[0.5, 0.5], [0.25, 0.75], [0, 1]], expected: 1.3333333333333333 },
      { input: [[0.5, 0.5], [0.25, 0.75], [0]], expected: 2.0 },
      { input: [[0.5, 0.5], [0.25, 0.75], []], expected: 1.0 },
      { input: [[0.5, 0.5], [0.25, 0.75], [1, 1]], expected: 0.4444444444444444 },
    ],
    hint: "The ratio corrects a trajectory sampled by the behavior policy to the target policy.",
  },
  {
    id: "rl-032",
    title: "Off-Policy Corrected Return",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the per-decision importance-sampling estimate of the return.\n\nAt each step t multiply the running ratio by target_probs[t][a_t] / behavior_probs[t][a_t], then add ratio * gamma^t * rewards[t] to the total. Return the accumulated total.",
    starterCode: `def off_policy_corrected_return(rewards, target_probs, behavior_probs, actions, gamma):
    # Your code here
    pass`,
    solution: `def off_policy_corrected_return(rewards, target_probs, behavior_probs, actions, gamma):
    total = 0.0
    ratio = 1.0
    for t in range(len(rewards)):
        ratio *= target_probs[t][actions[t]] / behavior_probs[t][actions[t]]
        total += ratio * (gamma ** t) * rewards[t]
    return total`,
    testCases: [
      { input: [[1.0, 1.0, 1.0], [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], [[0.25, 0.75], [0.5, 0.5], [0.8, 0.2]], [0, 1, 0], 0.9], expected: 4.8125 },
      { input: [[2.0, 0.0], [[0.5, 0.5], [0.5, 0.5]], [[0.5, 0.5], [0.5, 0.5]], [1, 0], 0.5], expected: 2.0 },
      { input: [[1.0], [[0.9, 0.1]], [[0.3, 0.7]], [1], 0.99], expected: 0.14285714285714288 },
    ],
    hint: "The running product reweights each reward by the probability of the partial trajectory.",
  },
  {
    id: "rl-033",
    title: "Replay Buffer Sample",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Sample batch indices from a replay buffer of the given size, with replacement.\n\nUse random.Random(seed) and call rng.randrange(buffer_size) once per sample so the output is reproducible. Return the list of integer indices.",
    starterCode: `import random
def replay_sample_indices(buffer_size, batch_size, seed):
    # Your code here
    pass`,
    solution: `import random
def replay_sample_indices(buffer_size, batch_size, seed):
    rng = random.Random(seed)
    return [rng.randrange(buffer_size) for _ in range(batch_size)]`,
    testCases: [
      { input: [10, 5, 42], expected: [1, 0, 4, 3, 3] },
      { input: [5, 3, 0], expected: [3, 3, 0] },
      { input: [1, 4, 7], expected: [0, 0, 0, 0] },
      { input: [100, 6, 123], expected: [6, 34, 11, 98, 52, 34] },
    ],
    hint: "randrange(n) returns an index in [0, n), which is exactly uniform sampling from the buffer.",
  },
  {
    id: "rl-034",
    title: "Prioritized Replay Probability",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Convert replay priorities into a sampling distribution.\n\nReturn p_i^alpha / sum_j p_j^alpha for each priority. Priorities are positive and the list is non-empty.",
    starterCode: `def prioritized_probs(priorities, alpha):
    # Your code here
    pass`,
    solution: `def prioritized_probs(priorities, alpha):
    powered = [p ** alpha for p in priorities]
    total = sum(powered)
    return [p / total for p in powered]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 1.0], expected: [0.16666666666666666, 0.3333333333333333, 0.5] },
      { input: [[1.0, 1.0, 1.0, 1.0], 0.5], expected: [0.25, 0.25, 0.25, 0.25] },
      { input: [[4.0, 9.0], 0.5], expected: [0.4, 0.6] },
      { input: [[1.0, 2.0, 3.0], 0.0], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
    ],
    hint: "Alpha of 0 gives uniform sampling; alpha of 1 samples proportional to priority.",
  },
  {
    id: "rl-035",
    title: "Target Network Soft Update",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Polyak-average an online network into a target network.\n\nReturn tau * online[i] + (1 - tau) * target[i] for every element. Do not mutate either input list.",
    starterCode: `def soft_update(target, online, tau):
    # Your code here
    pass`,
    solution: `def soft_update(target, online, tau):
    return [tau * o + (1.0 - tau) * t for t, o in zip(target, online)]`,
    testCases: [
      { input: [[0.0, 0.0], [10.0, 20.0], 0.1], expected: [1.0, 2.0] },
      { input: [[5.0], [5.0], 1.0], expected: [5.0] },
      { input: [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], 0.5], expected: [2.5, 3.5, 4.5] },
      { input: [[2.0, 4.0], [0.0, 0.0], 0.0], expected: [2.0, 4.0] },
    ],
    hint: "Tau controls how fast the target network tracks the online network.",
  },
  {
    id: "rl-036",
    title: "DQN Loss (MSE)",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the mean squared DQN loss over a batch.\n\nFor each sample the target is reward + gamma * next_q_max * (1 - done), where done is a boolean, and the prediction is q_values[i][actions[i]]. Return the mean of the squared errors; the batch is non-empty.",
    starterCode: `def dqn_loss(q_values, actions, rewards, next_q_max, dones, gamma):
    # Your code here
    pass`,
    solution: `def dqn_loss(q_values, actions, rewards, next_q_max, dones, gamma):
    total = 0.0
    n = len(q_values)
    for i in range(n):
        target = rewards[i] + gamma * next_q_max[i] * (1.0 - dones[i])
        total += (q_values[i][actions[i]] - target) ** 2
    return total / n`,
    testCases: [
      { input: [[[1.0, 2.0], [3.0, 1.0]], [1, 0], [1.0, 0.0], [2.0, 4.0], [false, true], 0.9], expected: 4.82 },
      { input: [[[0.0, 0.0]], [0], [1.0], [2.0], [false], 0.5], expected: 4.0 },
      { input: [[[5.0, 5.0], [0.0, 0.0]], [0, 1], [5.0, 2.0], [0.0, 0.0], [false, false], 0.9], expected: 2.0 },
      { input: [[[1.0]], [0], [1.0], [10.0], [true], 0.99], expected: 0.0 },
    ],
    hint: "Only the Q value of the action that was taken contributes to the loss.",
  },
  {
    id: "rl-037",
    title: "Dueling Split",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Combine a state value and advantages into Q values using the dueling architecture.\n\nIf mode is \"max\", subtract max(advantage); otherwise subtract the mean of the advantages. Then Q(a) = value + advantage[a] - baseline.",
    starterCode: `def dueling_combine(value, advantage, mode):
    # Your code here
    pass`,
    solution: `def dueling_combine(value, advantage, mode):
    n = len(advantage)
    if mode == "max":
        baseline = max(advantage)
    else:
        baseline = sum(advantage) / n
    return [value + a - baseline for a in advantage]`,
    testCases: [
      { input: [5.0, [1.0, 2.0, 3.0], "mean"], expected: [4.0, 5.0, 6.0] },
      { input: [5.0, [1.0, 2.0, 3.0], "max"], expected: [3.0, 4.0, 5.0] },
      { input: [0.0, [-1.0, 0.0, 1.0], "mean"], expected: [-1.0, 0.0, 1.0] },
      { input: [2.0, [4.0, 4.0], "max"], expected: [2.0, 2.0] },
    ],
    hint: "Subtracting a baseline makes the advantage stream identifiable without changing the argmax.",
  },
  {
    id: "rl-038",
    title: "Double DQN Target",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the Double DQN bootstrap target.\n\nIf the episode is done, return reward. Otherwise select the greedy next action using online_next (smallest index on ties) and return reward + gamma * target_next[that action].",
    starterCode: `def double_dqn_target(reward, done, gamma, online_next, target_next):
    # Your code here
    pass`,
    solution: `def double_dqn_target(reward, done, gamma, online_next, target_next):
    if done:
        return float(reward)
    best_a = 0
    for i in range(1, len(online_next)):
        if online_next[i] > online_next[best_a]:
            best_a = i
    return reward + gamma * target_next[best_a]`,
    testCases: [
      { input: [1.0, false, 0.9, [1.0, 3.0, 2.0], [5.0, 1.0, 2.0]], expected: 1.9 },
      { input: [2.0, true, 0.9, [1.0, 2.0], [3.0, 4.0]], expected: 2.0 },
      { input: [0.0, false, 1.0, [2.0, 2.0, 1.0], [1.0, 9.0, 5.0]], expected: 1.0 },
      { input: [-1.0, false, 0.5, [0.0, 0.0], [-2.0, -4.0]], expected: -2.0 },
    ],
    hint: "The online network picks the action; the target network supplies the value.",
  },
  {
    id: "rl-039",
    title: "N-Step Q Target",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Compute the n-step Q-learning target from a list of n rewards.\n\nG = sum of gamma^t * rewards[t]. If the episode is not done, add gamma^n * next_q; if it is done, do not bootstrap.",
    starterCode: `def n_step_q_target(rewards, gamma, next_q, done):
    # Your code here
    pass`,
    solution: `def n_step_q_target(rewards, gamma, next_q, done):
    total = 0.0
    power = 1.0
    for r in rewards:
        total += power * r
        power *= gamma
    if not done:
        total += power * next_q
    return total`,
    testCases: [
      { input: [[1.0, 1.0], 0.9, 5.0, false], expected: 5.950000000000001 },
      { input: [[1.0, 1.0], 0.9, 100.0, true], expected: 1.9 },
      { input: [[], 0.9, 3.0, false], expected: 3.0 },
      { input: [[2.0], 0.5, 4.0, false], expected: 4.0 },
    ],
    hint: "The discount applied to next_q is gamma raised to the number of collected rewards.",
  },
  {
    id: "rl-040",
    title: "REINFORCE Log-Prob Gradient",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Compute the REINFORCE score-function gradient estimate for a trajectory.\n\nWalk backwards to build the return-to-go G_t = rewards[t] + gamma * G_{t+1}, then sum log_probs[t] * G_t over every timestep. Return the scalar gradient estimate.",
    starterCode: `def reinforce_gradient(log_probs, rewards, gamma):
    # Your code here
    pass`,
    solution: `def reinforce_gradient(log_probs, rewards, gamma):
    g = 0.0
    total = 0.0
    for t in range(len(rewards) - 1, -1, -1):
        g = rewards[t] + gamma * g
        total += log_probs[t] * g
    return total`,
    testCases: [
      { input: [[-0.5, -1.0], [1.0, 2.0], 0.9], expected: -3.4 },
      { input: [[-0.2, -0.3, -0.4], [1.0, 1.0, 1.0], 1.0], expected: -1.6 },
      { input: [[0.0, 0.0], [1.0, 2.0], 0.9], expected: 0.0 },
      { input: [[-1.0], [-3.0], 0.5], expected: 3.0 },
    ],
    hint: "Weight each action's log-probability by the return that followed it, not by the full episode return.",
  },
  {
    id: "rl-041",
    title: "Policy Gradient Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the vanilla policy-gradient loss for a batch.\n\nReturn the mean of -log_probs[i] * returns[i]. An empty batch gives 0.0.",
    starterCode: `def policy_gradient_loss(log_probs, returns):
    # Your code here
    pass`,
    solution: `def policy_gradient_loss(log_probs, returns):
    n = len(log_probs)
    if n == 0:
        return 0.0
    total = 0.0
    for lp, g in zip(log_probs, returns):
        total += -lp * g
    return total / n`,
    testCases: [
      { input: [[-0.5, -1.0], [2.0, 3.0]], expected: 2.0 },
      { input: [[0.0], [5.0]], expected: 0.0 },
      { input: [[-2.0], [-1.0]], expected: -2.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Minimizing this loss is gradient ascent on expected return.",
  },
  {
    id: "rl-042",
    title: "Entropy Bonus",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the entropy of an action distribution in nats: H = -sum p * ln(p).\n\nSkip zero probabilities and return 0.0 for an empty distribution.",
    starterCode: `import math
def entropy_bonus(probs):
    # Your code here
    pass`,
    solution: `import math
def entropy_bonus(probs):
    h = 0.0
    for p in probs:
        if p > 0:
            h -= p * math.log(p)
    return h`,
    testCases: [
      { input: [[0.5, 0.5]], expected: 0.6931471805599453 },
      { input: [[1.0, 0.0]], expected: 0.0 },
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 1.3862943611198906 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Maximum entropy is ln(n) for a uniform distribution over n actions.",
  },
  {
    id: "rl-043",
    title: "Value Function Loss",
    category: "Reinforcement Learning",
    difficulty: "Easy",
    description:
      "Compute the mean squared error between predicted state values and their targets. An empty batch returns 0.0.",
    starterCode: `def value_loss(values, targets):
    # Your code here
    pass`,
    solution: `def value_loss(values, targets):
    if not values:
        return 0.0
    total = 0.0
    for v, t in zip(values, targets):
        total += (v - t) ** 2
    return total / len(values)`,
    testCases: [
      { input: [[1.0, 2.0], [1.0, 4.0]], expected: 2.0 },
      { input: [[], []], expected: 0.0 },
      { input: [[3.0], [3.0]], expected: 0.0 },
      { input: [[0.0, 1.0, 2.0], [2.0, 1.0, 0.0]], expected: 2.6666666666666665 },
    ],
    hint: "The critic regresses the value estimate onto the bootstrapped return target.",
  },
  {
    id: "rl-044",
    title: "Actor-Critic Update",
    category: "Reinforcement Learning",
    difficulty: "Hard",
    description:
      "Apply one actor-critic update step and return [new_log_prob, new_value].\n\nFirst compute the TD error delta = reward + gamma * next_value - value. Then nudge the log-probability by actor_lr * delta and update the critic by critic_lr * delta.",
    starterCode: `def actor_critic_update(log_prob, value, reward, next_value, gamma, actor_lr, critic_lr):
    # Your code here
    pass`,
    solution: `def actor_critic_update(log_prob, value, reward, next_value, gamma, actor_lr, critic_lr):
    delta = reward + gamma * next_value - value
    new_log_prob = log_prob + actor_lr * delta
    new_value = value + critic_lr * delta
    return [new_log_prob, new_value]`,
    testCases: [
      { input: [-0.5, 2.0, 3.0, 1.0, 0.9, 0.1, 0.2], expected: [-0.31, 2.38] },
      { input: [0.0, 0.0, 0.0, 0.0, 0.99, 0.05, 0.1], expected: [0.0, 0.0] },
      { input: [-1.5, 4.0, -2.0, 1.0, 0.5, 0.2, 0.3], expected: [-2.6, 2.35] },
    ],
    hint: "The same TD error scales both the actor step and the critic step.",
  },
  {
    id: "rl-045",
    title: "A2C Advantage Normalization",
    category: "Reinforcement Learning",
    difficulty: "Medium",
    description:
      "Normalize a batch of advantages to zero mean and unit variance.\n\nUse the population standard deviation (divide by n) and add epsilon to the denominator for stability. Return [] for an empty batch, and return zeros when the standard deviation is below epsilon.",
    starterCode: `def normalize_advantages(advantages, epsilon=1e-8):
    # Your code here
    pass`,
    solution: `def normalize_advantages(advantages, epsilon=1e-8):
    n = len(advantages)
    if n == 0:
        return []
    mean = sum(advantages) / n
    var = sum((a - mean) ** 2 for a in advantages) / n
    std = var ** 0.5
    if std < epsilon:
        return [0.0 for _ in advantages]
    return [(a - mean) / (std + epsilon) for a in advantages]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0]], expected: [-1.2247448563915893, 0.0, 1.2247448563915893] },
      { input: [[5.0, 5.0, 5.0]], expected: [0.0, 0.0, 0.0] },
      { input: [[]], expected: [] },
      { input: [[-1.0, 0.0, 1.0, 2.0]], expected: [-1.341640774499874, -0.447213591499958, 0.447213591499958, 1.341640774499874] },
    ],
    hint: "A2C standardizes the advantage batch so the policy gradient has a stable scale.",
  },
];
