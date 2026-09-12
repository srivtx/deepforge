import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "op-186",
    title: "Discrete LQR Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Take one discrete LQR step for the scalar system x_next = a * x + b * u with stage cost Q * x ** 2 + R * u ** 2.\n\nGiven the current Riccati value P, compute the gain K = a * b * P / (R + b ** 2 * P), the control u = -K * x, the next state, and the stage cost. Return [u, x_next, cost].",
    starterCode: `def lqr_step(x, a, b, Q, R, P):
    # Returns [u, x_next, cost]
    # Your code here
    pass`,
    solution: `def lqr_step(x, a, b, Q, R, P):
    K = a * b * P / (R + b * b * P)
    u = -K * x
    x_next = a * x + b * u
    cost = Q * x * x + R * u * u
    return [u, x_next, cost]`,
    testCases: [
      { input: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0], expected: [-0.5, 0.5, 1.25] },
      { input: [2.0, 0.9, 0.5, 1.0, 0.5, 2.0], expected: [-1.8, 0.9, 5.62] },
      { input: [0.0, 1.0, 1.0, 1.0, 1.0, 1.0], expected: [-0.0, 0.0, 0.0] },
    ],
    hint: "The optimal gain balances the control cost R against the future value b squared times P.",
  },
  {
    id: "op-187",
    title: "Riccati Recursion",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Run n iterations of the scalar discrete Riccati recursion.\n\nEach iteration updates P to Q + a ** 2 * P - (a * P * b) ** 2 / (R + b ** 2 * P). Return the final value of P after n iterations.",
    starterCode: `def riccati_recursion(P, a, b, Q, R, n):
    # Your code here
    pass`,
    solution: `def riccati_recursion(P, a, b, Q, R, n):
    for _ in range(n):
        P = Q + a * a * P - (a * P * b) ** 2 / (R + b * b * P)
    return P`,
    testCases: [
      { input: [0.0, 1.0, 1.0, 1.0, 1.0, 3], expected: 1.6 },
      { input: [1.0, 0.9, 0.5, 1.0, 0.5, 5], expected: 1.7571388609021663 },
      { input: [2.0, 1.0, 1.0, 1.0, 1.0, 0], expected: 2.0 },
    ],
    hint: "The recursion converges to the infinite-horizon value as n grows.",
  },
  {
    id: "op-188",
    title: "Infinite-Horizon Value Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the closed-form infinite-horizon LQR value for a scalar system.\n\nWith s = b ** 2 and beta = R * (1 - a ** 2) - s * Q, return (-beta + sqrt(beta ** 2 + 4 * s * R * Q)) / (2 * s), the positive root of the algebraic Riccati equation. If s is 0, return Q.",
    starterCode: `def infinite_horizon_value(a, b, Q, R):
    # Your code here
    pass`,
    solution: `def infinite_horizon_value(a, b, Q, R):
    s = b * b
    if s == 0:
        return Q
    beta = R * (1 - a * a) - s * Q
    disc = beta * beta + 4 * s * R * Q
    return (-beta + disc ** 0.5) / (2 * s)`,
    testCases: [
      { input: [1.0, 1.0, 1.0, 1.0], expected: 1.618033988749895 },
      { input: [0.9, 0.5, 1.0, 0.5], expected: 1.7577914214416384 },
      { input: [1.0, 0.0, 2.0, 1.0], expected: 2.0 },
    ],
    hint: "This is the fixed point of the Riccati recursion, obtained from a quadratic equation.",
  },
  {
    id: "op-189",
    title: "MPC Horizon Cost",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the finite-horizon MPC cost for a state and control sequence.\n\nReturn sum over t of (Q * xs[t] ** 2 + R * us[t] ** 2) plus the terminal term Qf * xs[n] ** 2, where n = len(us) and xs has n + 1 entries.",
    starterCode: `def mpc_horizon_cost(xs, us, Q, R, Qf):
    # Your code here
    pass`,
    solution: `def mpc_horizon_cost(xs, us, Q, R, Qf):
    total = 0.0
    n = len(us)
    for t in range(n):
        total = total + Q * xs[t] * xs[t] + R * us[t] * us[t]
    total = total + Qf * xs[n] * xs[n]
    return total`,
    testCases: [
      { input: [[1.0, 0.5, 0.0], [-1.0, 0.0], 1.0, 1.0, 1.0], expected: 2.25 },
      { input: [[2.0, 1.0], [0.5], 2.0, 0.5, 3.0], expected: 11.125 },
      { input: [[0.0], [], 1.0, 1.0, 1.0], expected: 0.0 },
    ],
    hint: "The terminal state costs Qf but has no control term.",
  },
  {
    id: "op-190",
    title: "MPC Constraint Projection",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Project a control sequence onto box and rate constraints.\n\nFirst clamp every control into [lo, hi], then enforce the slew-rate limit |u_i - u_{i-1}| <= rate sequentially from left to right. Return the projected list.",
    starterCode: `def mpc_project(u, lo, hi, rate):
    # Your code here
    pass`,
    solution: `def mpc_project(u, lo, hi, rate):
    out = []
    for v in u:
        if v < lo:
            v = lo
        if v > hi:
            v = hi
        out.append(v)
    for i in range(1, len(out)):
        lower = out[i - 1] - rate
        upper = out[i - 1] + rate
        if out[i] < lower:
            out[i] = lower
        if out[i] > upper:
            out[i] = upper
    return out`,
    testCases: [
      { input: [[0.0, 5.0, -5.0], -1.0, 1.0, 0.5], expected: [0.0, 0.5, 0.0] },
      { input: [[0.0, 0.1, 0.2], -1.0, 1.0, 0.05], expected: [0.0, 0.05, 0.1] },
      { input: [[0.0], -1.0, 1.0, 0.5], expected: [0.0] },
    ],
    hint: "Box clipping comes first; rate limiting then sees the clipped values.",
  },
  {
    id: "op-191",
    title: "Receding Horizon Update",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Shift an MPC state trajectory forward one step after applying the first control.\n\nDrop the first entry of xs and append x_new at the end. Return the new trajectory.",
    starterCode: `def receding_horizon_update(xs, x_new):
    # Your code here
    pass`,
    solution: `def receding_horizon_update(xs, x_new):
    return list(xs[1:]) + [x_new]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], 4.0], expected: [2.0, 3.0, 4.0] },
      { input: [[5.0], 6.0], expected: [6.0] },
      { input: [[0.0, 0.0], 1.0], expected: [0.0, 1.0] },
    ],
    hint: "This is the classic warm start for the next MPC solve.",
  },
  {
    id: "op-192",
    title: "Bellman Equation Check",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Check the Bellman optimality equation at a single state.\n\nWith deterministic transitions, the right-hand side is rewards[s] + gamma * max(V[ns] for ns in transitions[s]), or rewards[s] when there are no successors. Return True when V[s] matches within tol.",
    starterCode: `def bellman_check(V, rewards, transitions, gamma, s, tol):
    # Your code here
    pass`,
    solution: `def bellman_check(V, rewards, transitions, gamma, s, tol):
    nxt = transitions[s]
    if len(nxt) == 0:
        rhs = rewards[s]
    else:
        best = V[nxt[0]]
        for ns in nxt[1:]:
            if V[ns] > best:
                best = V[ns]
        rhs = rewards[s] + gamma * best
    return abs(V[s] - rhs) <= tol`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0.0, 0.0, 1.0], [[1], [2], []], 0.9, 1, 1e-9], expected: false },
      { input: [[1.0, 2.0, 3.0], [0.0, 0.0, 1.0], [[1], [2], []], 0.9, 0, 1e-9], expected: false },
      { input: [[0.5, 1.0], [0.5, 0.5], [[], [0]], 1.0, 1, 1e-9], expected: true },
    ],
    hint: "Compare the stored value with one Bellman backup at the state.",
  },
  {
    id: "op-193",
    title: "Value Iteration Grid Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one value iteration backup on a line of states.\n\nFrom state i the agent may stay or move to an adjacent state within the line, so V_new[i] = rewards[i] + gamma * max(V[i - 1], V[i], V[i + 1]) over valid indices. Return the updated value list.",
    starterCode: `def value_iteration_step(V, rewards, gamma):
    # Your code here
    pass`,
    solution: `def value_iteration_step(V, rewards, gamma):
    n = len(V)
    out = []
    for i in range(n):
        best = V[i]
        if i > 0 and V[i - 1] > best:
            best = V[i - 1]
        if i < n - 1 and V[i + 1] > best:
            best = V[i + 1]
        out.append(rewards[i] + gamma * best)
    return out`,
    testCases: [
      { input: [[1.0, 2.0, 3.0], [0.0, 0.0, 0.0], 0.9], expected: [1.8, 2.7, 2.7] },
      { input: [[0.0, 0.0], [1.0, 2.0], 0.5], expected: [1.0, 2.0] },
      { input: [[5.0], [1.0], 0.9], expected: [5.5] },
    ],
    hint: "Boundary states have only two candidate successors, including themselves.",
  },
  {
    id: "op-194",
    title: "Simplex Pivot",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Perform a Gauss-Jordan pivot on a simplex tableau.\n\nDivide the pivot row by the pivot element tableau[row][col], then eliminate the pivot column from every other row by subtracting a multiple of the normalized pivot row. Return the new tableau as a list of rows.",
    starterCode: `def simplex_pivot(tableau, row, col):
    # Your code here
    pass`,
    solution: `def simplex_pivot(tableau, row, col):
    rows = len(tableau)
    cols = len(tableau[0])
    pivot = tableau[row][col]
    new = [[0.0] * cols for _ in range(rows)]
    for j in range(cols):
        new[row][j] = tableau[row][j] / pivot
    for i in range(rows):
        if i == row:
            continue
        factor = tableau[i][col]
        for j in range(cols):
            new[i][j] = tableau[i][j] - factor * new[row][j]
    return new`,
    testCases: [
      { input: [[[1.0, 1.0, 1.0, 4.0], [2.0, 1.0, 0.0, 5.0], [-3.0, -2.0, 0.0, 0.0]], 0, 0], expected: [[1.0, 1.0, 1.0, 4.0], [0.0, -1.0, -2.0, -3.0], [0.0, 1.0, 3.0, 12.0]] },
      { input: [[[2.0, 1.0, 5.0], [1.0, 3.0, 6.0], [-1.0, -2.0, 0.0]], 1, 0], expected: [[0.0, -5.0, -7.0], [1.0, 3.0, 6.0], [0.0, 1.0, 6.0]] },
      { input: [[[2.0, 1.0, 4.0], [1.0, 1.0, 3.0], [-1.0, -1.0, 0.0]], 0, 1], expected: [[2.0, 1.0, 4.0], [-1.0, 0.0, -1.0], [1.0, 0.0, 4.0]] },
    ],
    hint: "The pivot column becomes a unit vector with a 1 in the pivot row.",
  },
  {
    id: "op-195",
    title: "LP Duality Gap",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the LP duality gap between a primal and dual solution.\n\nReturn c dot x - b dot y, which is zero at optimality for a correctly paired primal and dual.",
    starterCode: `def duality_gap(c, x, b, y):
    # Your code here
    pass`,
    solution: `def duality_gap(c, x, b, y):
    cx = 0.0
    by = 0.0
    for i in range(len(c)):
        cx = cx + c[i] * x[i]
    for j in range(len(b)):
        by = by + b[j] * y[j]
    return cx - by`,
    testCases: [
      { input: [[1.0, 2.0], [3.0, 1.0], [4.0], [11.0]], expected: -39.0 },
      { input: [[1.0], [2.0], [2.0], [2.0]], expected: -2.0 },
      { input: [[3.0, 1.0], [1.0, 1.0], [1.0, 1.0], [4.0, 0.0]], expected: 0.0 },
    ],
    hint: "The gap is the difference between primal and dual objective values.",
  },
  {
    id: "op-196",
    title: "Interior-Point Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one Newton step on the barrier subproblem for a 2-variable LP.\n\nWith x1 = x and x2 = 1 - x, the barrier objective has gradient (c1 - c2) - mu / x + mu / (1 - x) and Hessian mu / x ** 2 + mu / (1 - x) ** 2. Return x - gradient / hessian.",
    starterCode: `def interior_point_step(x, c1, c2, mu):
    # Your code here
    pass`,
    solution: `def interior_point_step(x, c1, c2, mu):
    g = (c1 - c2) - mu / x + mu / (1 - x)
    h = mu / (x * x) + mu / ((1 - x) * (1 - x))
    return x - g / h`,
    testCases: [
      { input: [0.5, 1.0, 2.0, 0.5], expected: 0.75 },
      { input: [0.5, 2.0, 1.0, 0.25], expected: 0.0 },
      { input: [0.25, 1.0, 1.0, 0.1], expected: 0.4 },
    ],
    hint: "The equality constraint x1 + x2 = 1 reduces the problem to one variable.",
  },
  {
    id: "op-197",
    title: "Barrier Update",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Update the barrier parameter in a primal-dual interior-point method.\n\nReturn min(sigma * mu, gap / (2 * n_constraints)), combining the centering weight with the duality-gap-based target.",
    starterCode: `def barrier_update(mu, sigma, gap, n_constraints):
    # Your code here
    pass`,
    solution: `def barrier_update(mu, sigma, gap, n_constraints):
    a = sigma * mu
    b = gap / (2.0 * n_constraints)
    return a if a < b else b`,
    testCases: [
      { input: [1.0, 0.1, 8.0, 4], expected: 0.1 },
      { input: [0.5, 0.2, 1.0, 2], expected: 0.1 },
      { input: [2.0, 0.5, 100.0, 10], expected: 1.0 },
    ],
    hint: "The target never exceeds the gap-based value divided by the number of constraints.",
  },
  {
    id: "op-198",
    title: "KKT For LP Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Verify KKT conditions for the LP min c dot x subject to A x <= b and x >= 0.\n\nCheck primal feasibility, dual feasibility c + A^T y >= 0 with y >= 0, and complementary slackness y dot (b - A x) = 0 and x dot (c + A^T y) = 0, all within tol. Return True when every condition holds.",
    starterCode: `def kkt_lp_check(x, y, c, A, b, tol):
    # Your code here
    pass`,
    solution: `def kkt_lp_check(x, y, c, A, b, tol):
    n = len(c)
    m = len(b)
    for i in range(m):
        s = 0.0
        for j in range(n):
            s = s + A[i][j] * x[j]
        if s > b[i] + tol:
            return False
    for j in range(n):
        if x[j] < -tol:
            return False
    for i in range(m):
        if y[i] < -tol:
            return False
    z = []
    for j in range(n):
        s = c[j]
        for i in range(m):
            s = s + A[i][j] * y[i]
        if s < -tol:
            return False
        z.append(s)
    for i in range(m):
        slack = b[i]
        for j in range(n):
            slack = slack - A[i][j] * x[j]
        if abs(y[i] * slack) > tol:
            return False
    for j in range(n):
        if abs(x[j] * z[j]) > tol:
            return False
    return True`,
    testCases: [
      { input: [[0.0, 0.0], [0.0], [1.0, 1.0], [[1.0, 1.0]], [1.0], 1e-9], expected: true },
      { input: [[1.0, 0.0], [1.0], [-1.0, 1.0], [[1.0, 1.0]], [1.0], 1e-9], expected: true },
      { input: [[1.0, 0.0], [0.0], [-1.0, 1.0], [[1.0, 1.0]], [1.0], 1e-9], expected: false },
      { input: [[2.0, 0.0], [0.0], [1.0, 1.0], [[1.0, 1.0]], [1.0], 1e-9], expected: false },
    ],
    hint: "Stationarity gives the reduced cost vector z = c + A^T y.",
  },
  {
    id: "op-199",
    title: "Integer Relaxation Gap",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Measure the gap between an integer program and its LP relaxation.\n\nFor a minimization problem, return lp_value - integer_value, which is non-negative and bounds the integrality gap.",
    starterCode: `def integer_relaxation_gap(lp_value, integer_value):
    # Your code here
    pass`,
    solution: `def integer_relaxation_gap(lp_value, integer_value):
    return lp_value - integer_value`,
    testCases: [
      { input: [10.5, 10.0], expected: 0.5 },
      { input: [7.0, 7.0], expected: 0.0 },
      { input: [3.25, 2.0], expected: 1.25 },
      { input: [0.0, 0.0], expected: 0.0 },
    ],
    hint: "The relaxation can only be at least as good as the integer optimum.",
  },
  {
    id: "op-200",
    title: "Branch-And-Bound Bound",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Combine bounds in a branch-and-bound node for a minimization problem.\n\nReturn [best, prune] where best = min(parent_bound, min(child_bounds)) and prune is True when best is at least the incumbent. An empty child list leaves the parent bound unchanged.",
    starterCode: `def branch_and_bound_bound(parent_bound, incumbent, child_bounds):
    # Returns [best, prune]
    # Your code here
    pass`,
    solution: `def branch_and_bound_bound(parent_bound, incumbent, child_bounds):
    best = parent_bound
    for cb in child_bounds:
        if cb < best:
            best = cb
    return [best, best >= incumbent]`,
    testCases: [
      { input: [5.0, 6.0, [4.0, 7.0]], expected: [4.0, false] },
      { input: [5.0, 4.0, [5.5, 6.0]], expected: [5.0, true] },
      { input: [3.0, 10.0, []], expected: [3.0, false] },
      { input: [2.0, 2.0, [1.0]], expected: [1.0, false] },
    ],
    hint: "A node is pruned when no solution under it can beat the incumbent.",
  },
  {
    id: "op-201",
    title: "Gomory Cut Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Generate the coefficients of a Gomory fractional cut from a tableau row x_B = b - sum a_j x_j. Return [frac(b)] followed by frac(a_j) for every coefficient, where frac(v) = v - floor(v). The cut is sum frac(a_j) x_j >= frac(b).",
    starterCode: `def gomory_cut(b, coeffs):
    # Your code here
    pass`,
    solution: `def gomory_cut(b, coeffs):
    import math
    fb = b - math.floor(b)
    out = [fb]
    for a in coeffs:
        out.append(a - math.floor(a))
    return out`,
    testCases: [
      { input: [3.7, [1.2, -0.4, 2.0]], expected: [0.7000000000000002, 0.19999999999999996, 0.6, 0.0] },
      { input: [0.25, [0.5, -1.75]], expected: [0.25, 0.5, 0.25] },
      { input: [-2.3, []], expected: [0.7000000000000002] },
    ],
    hint: "Only the fractional parts enter the cut; integer coefficients contribute zero.",
  },
  {
    id: "op-202",
    title: "Transportation Simplex Step",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Build an initial basic feasible solution for a transportation problem with the northwest corner rule.\n\nRepeatedly allocate the smaller of the current supply and demand at the current cell, then advance past the row or column that becomes exhausted. Return the allocation matrix.",
    starterCode: `def transportation_step(supply, demand):
    # Your code here
    pass`,
    solution: `def transportation_step(supply, demand):
    s = list(supply)
    d = list(demand)
    n = len(s)
    m = len(d)
    alloc = [[0.0] * m for _ in range(n)]
    i = 0
    j = 0
    while i < n and j < m:
        q = s[i] if s[i] < d[j] else d[j]
        alloc[i][j] = q
        s[i] = s[i] - q
        d[j] = d[j] - q
        if s[i] == 0:
            i = i + 1
        elif d[j] == 0:
            j = j + 1
        else:
            break
    return alloc`,
    testCases: [
      { input: [[3.0, 2.0], [2.0, 3.0]], expected: [[2.0, 1.0], [0.0, 2.0]] },
      { input: [[5.0], [2.0, 3.0]], expected: [[2.0, 3.0]] },
      { input: [[0.0, 4.0], [1.0, 3.0]], expected: [[0.0, 0.0], [1.0, 3.0]] },
      { input: [[1.0, 1.0], [1.0, 1.0]], expected: [[1.0, 0.0], [0.0, 1.0]] },
    ],
    hint: "Move right when demand is exhausted and down when supply is exhausted.",
  },
  {
    id: "op-203",
    title: "Assignment Dual Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Check feasibility of a dual solution for the assignment problem.\n\nThe dual maximizes sum(pi) + sum(v) subject to pi[i] + v[j] <= costs[i][j] for all pairs. Return [feasible, objective], where objective is 0.0 when the dual is infeasible.",
    starterCode: `def assignment_dual_check(costs, pi, v, tol):
    # Returns [feasible, objective]
    # Your code here
    pass`,
    solution: `def assignment_dual_check(costs, pi, v, tol):
    n = len(costs)
    for i in range(n):
        for j in range(n):
            if pi[i] + v[j] > costs[i][j] + tol:
                return [False, 0.0]
    obj = 0.0
    for u in pi:
        obj = obj + u
    for u in v:
        obj = obj + u
    return [True, obj]`,
    testCases: [
      { input: [[[4.0, 1.0], [2.0, 3.0]], [2.0, 1.0], [2.0, 0.0], 1e-9], expected: [false, 0.0] },
      { input: [[[4.0, 1.0], [2.0, 3.0]], [0.0, 0.0], [2.0, 1.0], 1e-9], expected: [true, 3.0] },
      { input: [[[1.0]], [0.0], [1.0], 1e-9], expected: [true, 1.0] },
    ],
    hint: "Every dual constraint is pi_i + v_j <= c_ij.",
  },
  {
    id: "op-204",
    title: "Shortest Path Dual",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Check a potential vector for the shortest-path LP dual.\n\nThe dual requires d[v] <= d[u] + cost for every arc (u, v, cost). If all arcs satisfy this within tol, return [True, d[t] - d[s]]; otherwise return [False, 0.0].",
    starterCode: `def shortest_path_dual(edges, n, d, s, t, tol):
    # Returns [feasible, value]
    # Your code here
    pass`,
    solution: `def shortest_path_dual(edges, n, d, s, t, tol):
    for e in edges:
        if d[e[1]] > d[e[0]] + e[2] + tol:
            return [False, 0.0]
    return [True, d[t] - d[s]]`,
    testCases: [
      { input: [[[0, 1, 2.0], [1, 2, 3.0]], 3, [0.0, 2.0, 5.0], 0, 2, 1e-9], expected: [true, 5.0] },
      { input: [[[0, 1, 2.0], [1, 2, 1.0]], 3, [0.0, 2.0, 5.0], 0, 2, 1e-9], expected: [false, 0.0] },
      { input: [[[0, 1, 1.0]], 2, [0.0, 1.0], 0, 1, 1e-9], expected: [true, 1.0] },
    ],
    hint: "Feasible potentials are exactly the distance labels of the shortest-path tree.",
  },
  {
    id: "op-205",
    title: "Convex Hull Trick Envelope",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Query the lower envelope of a set of lines.\n\nGiven lines as [slope, intercept] pairs and a query x, return [value, index] for the line minimizing slope * x + intercept. The lowest index wins ties.",
    starterCode: `def convex_hull_envelope(lines, x):
    # Returns [value, index]
    # Your code here
    pass`,
    solution: `def convex_hull_envelope(lines, x):
    best = 0
    best_val = lines[0][0] * x + lines[0][1]
    for i in range(1, len(lines)):
        val = lines[i][0] * x + lines[i][1]
        if val < best_val:
            best_val = val
            best = i
    return [best_val, best]`,
    testCases: [
      { input: [[[-1.0, 0.0], [1.0, -4.0]], 1.0], expected: [-3.0, 1] },
      { input: [[[2.0, 0.0], [1.0, 1.0], [0.0, 5.0]], 3.0], expected: [4.0, 1] },
      { input: [[[0.0, 3.0], [0.0, 3.0]], 2.0], expected: [3.0, 0] },
    ],
    hint: "The envelope is the pointwise minimum over all inserted lines.",
  },
  {
    id: "op-206",
    title: "Li Chao Query Value",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Query the maximum value over a set of lines at a given x.\n\nGiven lines as [slope, intercept] pairs, return the largest slope * x + intercept. This is the value a Li Chao tree returns for its stored segment set.",
    starterCode: `def li_chao_value(lines, x):
    # Your code here
    pass`,
    solution: `def li_chao_value(lines, x):
    best = lines[0][0] * x + lines[0][1]
    for i in range(1, len(lines)):
        val = lines[i][0] * x + lines[i][1]
        if val > best:
            best = val
    return best`,
    testCases: [
      { input: [[[1.0, 0.0], [0.0, 2.0]], 3.0], expected: 3.0 },
      { input: [[[-1.0, 5.0], [1.0, -2.0]], 0.0], expected: 5.0 },
      { input: [[[2.0, 1.0]], 4.0], expected: 9.0 },
    ],
    hint: "A Li Chao tree answers maximum queries by descending to the best line at x.",
  },
  {
    id: "op-207",
    title: "Lagrangian Relaxation Bound",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the Lagrangian relaxation bound for a set of candidate solutions.\n\nFor candidate i with objective f_values[i] and constraint values g_values[i], compute f_i + dot(lam, g_i) and return the minimum over all candidates. This is the Lagrangian dual value for the fixed multipliers.",
    starterCode: `def lagrangian_relaxation_bound(f_values, g_values, lam):
    # Your code here
    pass`,
    solution: `def lagrangian_relaxation_bound(f_values, g_values, lam):
    best = None
    for i in range(len(f_values)):
        total = f_values[i]
        for j in range(len(lam)):
            total = total + lam[j] * g_values[i][j]
        if best is None or total < best:
            best = total
    return best`,
    testCases: [
      { input: [[1.0, 2.0], [[1.0], [0.0]], [0.5]], expected: 1.5 },
      { input: [[3.0, 1.0, 2.0], [[2.0, 1.0], [0.0, 2.0], [1.0, -1.0]], [0.5, 0.5]], expected: 2.0 },
      { input: [[1.0], [[-1.0]], [2.0]], expected: -1.0 },
    ],
    hint: "Relaxing constraints turns the problem into an unconstrained minimum over candidates.",
  },
  {
    id: "op-208",
    title: "Dual Subgradient Step",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Take one projected subgradient ascent step on the dual multipliers.\n\nReturn max(0, lam[i] + lr * g[i]) for every coordinate, where g is the constraint violation subgradient. Projection keeps the multipliers non-negative.",
    starterCode: `def dual_subgradient_step(lam, g, lr):
    # Your code here
    pass`,
    solution: `def dual_subgradient_step(lam, g, lr):
    out = []
    for i in range(len(lam)):
        v = lam[i] + lr * g[i]
        if v < 0:
            v = 0.0
        out.append(v)
    return out`,
    testCases: [
      { input: [[0.5, 0.2], [1.0, -1.0], 0.1], expected: [0.6, 0.1] },
      { input: [[0.0, 0.0], [-1.0, 0.5], 0.5], expected: [0.0, 0.25] },
      { input: [[1.0], [2.0], 0.25], expected: [1.5] },
    ],
    hint: "The dual is maximized, so a violated constraint increases its multiplier.",
  },
  {
    id: "op-209",
    title: "Column Generation Reduced Cost",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the reduced cost of a new column in column generation.\n\nReturn c_j - dot(y, a_j), where c_j is the column cost, y the current dual prices, and a_j the column coefficients. A negative reduced cost means the column can improve the master.",
    starterCode: `def reduced_cost(c_j, y, a_j):
    # Your code here
    pass`,
    solution: `def reduced_cost(c_j, y, a_j):
    s = c_j
    for i in range(len(y)):
        s = s - y[i] * a_j[i]
    return s`,
    testCases: [
      { input: [5.0, [1.0, 2.0], [1.0, 1.0]], expected: 2.0 },
      { input: [3.0, [0.5, 0.5], [2.0, 4.0]], expected: 0.0 },
      { input: [-1.0, [1.0], [0.0]], expected: -1.0 },
    ],
    hint: "Price out the column against the current dual solution.",
  },
  {
    id: "op-210",
    title: "Dantzig-Wolfe Step Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one convex-combination update in the Dantzig-Wolfe master.\n\nWith current weights x, a new column, and a right-hand side rhs for the single linking constraint, set theta = (rhs - sum(x)) / (sum(column) - sum(x)) clamped to [0, 1]. Return (1 - theta) * x + theta * column; if the denominator is zero return x unchanged.",
    starterCode: `def dantzig_wolfe_step(x, column, rhs):
    # Your code here
    pass`,
    solution: `def dantzig_wolfe_step(x, column, rhs):
    sx = 0.0
    sc = 0.0
    for v in x:
        sx = sx + v
    for v in column:
        sc = sc + v
    denom = sc - sx
    if denom == 0:
        return list(x)
    theta = (rhs - sx) / denom
    if theta > 1:
        theta = 1.0
    if theta < 0:
        theta = 0.0
    return [(1 - theta) * x[i] + theta * column[i] for i in range(len(x))]`,
    testCases: [
      { input: [[0.2, 0.2], [0.5, 0.5], 1.0], expected: [0.5, 0.5] },
      { input: [[0.4, 0.4], [0.6, 0.2], 1.0], expected: [0.4, 0.4] },
      { input: [[0.1, 0.1], [0.4, 0.6], 0.5], expected: [0.2125, 0.2875] },
    ],
    hint: "The step moves the restricted master toward the new column while restoring the linking constraint.",
  },
  {
    id: "op-211",
    title: "Benders Cut Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Evaluate an optimality cut generated by Benders decomposition.\n\nGiven the subproblem value at the trial solution y_hat and its dual multipliers, the cut at a candidate y is sub_value + dot(duals, y - y_hat). Return that value, which lower-bounds the recourse cost in the master problem.",
    starterCode: `def benders_cut(sub_value, duals, y_hat, y):
    # Your code here
    pass`,
    solution: `def benders_cut(sub_value, duals, y_hat, y):
    total = sub_value
    for i in range(len(duals)):
        total = total + duals[i] * (y[i] - y_hat[i])
    return total`,
    testCases: [
      { input: [10.0, [2.0, -1.0], [1.0, 1.0], [2.0, 0.5]], expected: 12.5 },
      { input: [5.0, [1.0], [0.0], [3.0]], expected: 8.0 },
      { input: [2.0, [], [], []], expected: 2.0 },
    ],
    hint: "The cut is the first-order Taylor expansion of the recourse function at y_hat.",
  },
  {
    id: "op-212",
    title: "Two-Stage Recourse Value",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the expected second-stage recourse cost.\n\nFor each scenario with shortage scenario - x (floored at 0), the recourse buys the shortfall at unit cost. Return sum over scenarios of probs[k] * cost * max(0, scenarios[k] - x).",
    starterCode: `def two_stage_recourse(x, scenarios, probs, cost):
    # Your code here
    pass`,
    solution: `def two_stage_recourse(x, scenarios, probs, cost):
    total = 0.0
    for k in range(len(scenarios)):
        short = scenarios[k] - x
        if short < 0:
            short = 0.0
        total = total + probs[k] * cost * short
    return total`,
    testCases: [
      { input: [5.0, [4.0, 8.0], [0.5, 0.5], 2.0], expected: 3.0 },
      { input: [10.0, [5.0, 10.0], [0.5, 0.5], 1.0], expected: 0.0 },
      { input: [0.0, [3.0], [1.0], 4.0], expected: 12.0 },
    ],
    hint: "Only scenarios above the first-stage decision incur recourse.",
  },
  {
    id: "op-213",
    title: "Expected Value Lite",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the expected value of a discrete random variable.\n\nReturn sum(values[i] * probs[i]).",
    starterCode: `def expected_value_lite(values, probs):
    # Your code here
    pass`,
    solution: `def expected_value_lite(values, probs):
    total = 0.0
    for i in range(len(values)):
        total = total + values[i] * probs[i]
    return total`,
    testCases: [
      { input: [[1.0, 3.0], [0.5, 0.5]], expected: 2.0 },
      { input: [[2.0, 4.0, 6.0], [0.2, 0.3, 0.5]], expected: 4.6 },
      { input: [[0.0], [1.0]], expected: 0.0 },
    ],
    hint: "Weight each outcome by its probability.",
  },
  {
    id: "op-214",
    title: "Robust Counterpart Check",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Check whether x satisfies the robust counterpart of a box-uncertain constraint.\n\nWith coefficients a_i uncertain in [a_i - d_i, a_i + d_i], the worst case uses a_i + d_i for positive x_i and a_i - d_i for negative x_i. Return True when the worst-case left-hand side is at most b + tol.",
    starterCode: `def robust_counterpart_check(a, d, x, b, tol):
    # Your code here
    pass`,
    solution: `def robust_counterpart_check(a, d, x, b, tol):
    worst = 0.0
    for i in range(len(a)):
        if x[i] >= 0:
            worst = worst + (a[i] + d[i]) * x[i]
        else:
            worst = worst + (a[i] - d[i]) * x[i]
    return worst <= b + tol`,
    testCases: [
      { input: [[1.0, 1.0], [0.1, 0.1], [1.0, 1.0], 2.1, 1e-9], expected: false },
      { input: [[1.0, 1.0], [0.1, 0.1], [1.0, 1.0], 2.0, 1e-9], expected: false },
      { input: [[1.0, -2.0], [0.5, 0.5], [2.0, 3.0], -1.0, 1e-9], expected: true },
    ],
    hint: "The sign of x decides which uncertainty endpoint is worst.",
  },
  {
    id: "op-215",
    title: "Chance-Constraint Quantile",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Evaluate the empirical quantile used by a chance constraint.\n\nSort the sampled values and return the element at index ceil((1 - alpha) * n) - 1, clamped into range. This is the value that the constraint must not exceed with probability 1 - alpha.",
    starterCode: `def chance_constraint_quantile(values, alpha):
    # Your code here
    pass`,
    solution: `def chance_constraint_quantile(values, alpha):
    import math
    n = len(values)
    if n == 0:
        return 0.0
    s = sorted(values)
    idx = int(math.ceil((1 - alpha) * n)) - 1
    if idx < 0:
        idx = 0
    if idx >= n:
        idx = n - 1
    return s[idx]`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.2], expected: 4.0 },
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.5], expected: 3.0 },
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.0], expected: 5.0 },
      { input: [[1.0, 2.0, 3.0, 4.0, 5.0], 0.9], expected: 1.0 },
    ],
    hint: "The empirical (1 - alpha) quantile covers all but the worst alpha fraction.",
  },
  {
    id: "op-216",
    title: "CVaR Linearization",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Evaluate the Rockafellar-Uryasev CVaR linearization at a given threshold.\n\nReturn v + sum(max(0, loss - v)) / (alpha * n), where v is the VaR candidate, alpha the tail level, and n the number of scenarios. Minimizing this over v yields the CVaR.",
    starterCode: `def cvar_linearized(losses, v, alpha):
    # Your code here
    pass`,
    solution: `def cvar_linearized(losses, v, alpha):
    n = len(losses)
    if n == 0 or alpha <= 0:
        return v
    total = 0.0
    for l in losses:
        if l - v > 0:
            total = total + l - v
    return v + total / (alpha * n)`,
    testCases: [
      { input: [[1.0, 2.0, 3.0, 4.0], 2.0, 0.5], expected: 3.5 },
      { input: [[0.5, 1.0, 1.5], 1.0, 0.25], expected: 1.6666666666666665 },
      { input: [[2.0, 2.0], 2.0, 0.5], expected: 2.0 },
    ],
    hint: "Only losses above the threshold contribute to the tail average.",
  },
  {
    id: "op-217",
    title: "Mean-Variance Weights",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the optimal two-asset mean-variance weights with a budget constraint.\n\nFor expected returns mu1, mu2, variances var1, var2, and risk aversion gamma, return [w1, 1 - w1] with w1 = (mu1 - mu2 + gamma * var2) / (gamma * (var1 + var2)). Return [0.5, 0.5] when the denominator is zero.",
    starterCode: `def mean_variance_weights(mu1, mu2, var1, var2, gamma):
    # Returns [w1, w2]
    # Your code here
    pass`,
    solution: `def mean_variance_weights(mu1, mu2, var1, var2, gamma):
    denom = gamma * (var1 + var2)
    if denom == 0:
        return [0.5, 0.5]
    w1 = (mu1 - mu2 + gamma * var2) / denom
    return [w1, 1 - w1]`,
    testCases: [
      { input: [0.1, 0.05, 0.04, 0.01, 2.0], expected: [0.7000000000000001, 0.29999999999999993] },
      { input: [0.08, 0.08, 0.09, 0.01, 3.0], expected: [0.1, 0.9] },
      { input: [0.05, 0.1, 0.04, 0.04, 1.0], expected: [-0.12500000000000003, 1.125] },
    ],
    hint: "Higher risk aversion tilts the allocation away from the higher-variance asset.",
  },
  {
    id: "op-218",
    title: "CRRA Log Utility Maximization",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the optimal fraction of wealth invested in a binary gamble under log utility.\n\nThe gamble gains r_gain with probability p and loses r_loss otherwise. Maximizing p * ln(1 + alpha * r_gain) + (1 - p) * ln(1 + alpha * r_loss) gives alpha = -(p * r_gain + (1 - p) * r_loss) / (r_gain * r_loss). Return that fraction, or 0.0 when the denominator is zero.",
    starterCode: `def crra_log_optimal_fraction(p, r_gain, r_loss):
    # Your code here
    pass`,
    solution: `def crra_log_optimal_fraction(p, r_gain, r_loss):
    denom = r_gain * r_loss
    if denom == 0:
        return 0.0
    return -(p * r_gain + (1 - p) * r_loss) / denom`,
    testCases: [
      { input: [0.6, 0.2, -0.1], expected: 3.9999999999999987 },
      { input: [0.5, 0.1, -0.1], expected: 0.0 },
      { input: [0.8, 0.05, -0.2], expected: 1.3877787807814455e-15 },
    ],
    hint: "The first-order condition is linear in the fraction for log utility.",
  },
  {
    id: "op-219",
    title: "Arrow-Pratt Aversion",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Arrow-Pratt absolute risk aversion for CRRA utility.\n\nFor u(c) = c ** (1 - gamma) / (1 - gamma), the coefficient -u''(c) / u'(c) equals gamma / c. Return that value.",
    starterCode: `def arrow_pratt_aversion(c, gamma):
    # Your code here
    pass`,
    solution: `def arrow_pratt_aversion(c, gamma):
    return gamma / c`,
    testCases: [
      { input: [10.0, 2.0], expected: 0.2 },
      { input: [5.0, 1.0], expected: 0.2 },
      { input: [2.0, 0.5], expected: 0.25 },
    ],
    hint: "Absolute risk aversion decreases as wealth rises for CRRA utility.",
  },
  {
    id: "op-220",
    title: "Certainty Equivalent",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the certainty equivalent of a gamble under CRRA utility.\n\nFor gamma equal to 1 use exp(sum(probs[i] * ln(wealths[i]))). Otherwise return (sum(probs[i] * wealths[i] ** (1 - gamma))) ** (1 / (1 - gamma)).",
    starterCode: `def certainty_equivalent(wealths, probs, gamma):
    # Your code here
    pass`,
    solution: `def certainty_equivalent(wealths, probs, gamma):
    import math
    if gamma == 1:
        total = 0.0
        for i in range(len(wealths)):
            total = total + probs[i] * math.log(wealths[i])
        return math.exp(total)
    total = 0.0
    for i in range(len(wealths)):
        total = total + probs[i] * (wealths[i] ** (1 - gamma))
    return total ** (1.0 / (1 - gamma))`,
    testCases: [
      { input: [[100.0, 50.0], [0.5, 0.5], 2.0], expected: 66.66666666666667 },
      { input: [[100.0, 50.0], [0.5, 0.5], 1.0], expected: 70.71067811865478 },
      { input: [[10.0], [1.0], 0.5], expected: 10.000000000000002 },
    ],
    hint: "The certainty equivalent is the inverse utility of the expected utility.",
  },
  {
    id: "op-221",
    title: "Insurance Premium",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the Arrow-Pratt approximation of a risk-loaded insurance premium.\n\nReturn loss_mean + 0.5 * gamma * loss_var / wealth, the expected loss plus the curvature-based risk loading.",
    starterCode: `def insurance_premium(wealth, loss_mean, loss_var, gamma):
    # Your code here
    pass`,
    solution: `def insurance_premium(wealth, loss_mean, loss_var, gamma):
    return loss_mean + 0.5 * gamma * loss_var / wealth`,
    testCases: [
      { input: [100.0, 10.0, 25.0, 2.0], expected: 10.25 },
      { input: [50.0, 5.0, 4.0, 1.0], expected: 5.04 },
      { input: [200.0, 0.0, 0.0, 3.0], expected: 0.0 },
    ],
    hint: "The loading grows with risk aversion and loss variance but shrinks with wealth.",
  },
  {
    id: "op-222",
    title: "Optimal Stopping Threshold",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Find the optimal stopping time by backward induction.\n\nCompute V[t] = max(exercise[t], continuation[t] + gamma * V[t + 1]) from the end, then scan forward and stop at the first t where exercise[t] >= continuation[t] + gamma * V[t + 1] (with no successor at the last index). Return [stop_index, stopped_value].",
    starterCode: `def optimal_stopping_threshold(exercise, continuation, gamma):
    # Returns [stop_index, value]
    # Your code here
    pass`,
    solution: `def optimal_stopping_threshold(exercise, continuation, gamma):
    n = len(exercise)
    v = [0.0] * n
    v[n - 1] = exercise[n - 1]
    if continuation[n - 1] > v[n - 1]:
        v[n - 1] = continuation[n - 1]
    for t in range(n - 2, -1, -1):
        cont = continuation[t] + gamma * v[t + 1]
        if exercise[t] > cont:
            v[t] = exercise[t]
        else:
            v[t] = cont
    for t in range(n):
        if t == n - 1:
            cont = continuation[n - 1]
        else:
            cont = continuation[t] + gamma * v[t + 1]
        if exercise[t] >= cont:
            return [t, exercise[t]]
    return [n - 1, exercise[n - 1]]`,
    testCases: [
      { input: [[0.0, 1.0, 5.0], [0.0, 0.0, 0.0], 0.9], expected: [2, 5.0] },
      { input: [[1.0, 1.0, 1.0], [0.5, 0.5, 0.5], 1.0], expected: [2, 1.0] },
      { input: [[3.0], [2.0], 0.9], expected: [0, 3.0] },
    ],
    hint: "The stopping region is where exercising beats the discounted continuation value.",
  },
  {
    id: "op-223",
    title: "Binomial American Option Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one backward-induction step for an American put in a binomial tree.\n\nWith up and down factors u, d, risk-neutral probability p, rate r, and step dt, the continuation value is exp(-r * dt) * (p * max(K - S * u, 0) + (1 - p) * max(K - S * d, 0)) and the exercise value is max(K - S, 0). Return [exercise, continuation, max(exercise, continuation)].",
    starterCode: `def binomial_american_step(S, K, u, d, r, dt, p):
    # Returns [exercise, continuation, value]
    # Your code here
    pass`,
    solution: `def binomial_american_step(S, K, u, d, r, dt, p):
    import math
    disc = math.exp(-r * dt)
    up = K - S * u
    if up < 0:
        up = 0.0
    down = K - S * d
    if down < 0:
        down = 0.0
    continuation = disc * (p * up + (1 - p) * down)
    exercise = K - S
    if exercise < 0:
        exercise = 0.0
    value = exercise if exercise > continuation else continuation
    return [exercise, continuation, value]`,
    testCases: [
      { input: [100.0, 100.0, 1.1, 0.9, 0.05, 1.0, 0.5], expected: [0.0, 4.75614712250357, 4.75614712250357] },
      { input: [80.0, 100.0, 1.1, 0.9, 0.05, 1.0, 0.5], expected: [20.0, 19.02458849001428, 20.0] },
      { input: [120.0, 100.0, 1.1, 0.9, 0.05, 1.0, 0.5], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Early exercise has value when the immediate payoff exceeds the discounted continuation.",
  },
  {
    id: "op-224",
    title: "Black-Scholes Delta Lite",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Compute Black-Scholes deltas for a European call and put.\n\nWith d1 = (ln(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * sqrt(T)) and Phi the standard normal CDF, return [Phi(d1), Phi(d1) - 1].",
    starterCode: `def black_scholes_delta(S, K, r, sigma, T):
    # Returns [delta_call, delta_put]
    # Your code here
    pass`,
    solution: `def black_scholes_delta(S, K, r, sigma, T):
    import math
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * T ** 0.5)
    cdf = 0.5 * (1 + math.erf(d1 / (2 ** 0.5)))
    return [cdf, cdf - 1]`,
    testCases: [
      { input: [100.0, 100.0, 0.05, 0.2, 1.0], expected: [0.6368306511756191, -0.3631693488243809] },
      { input: [110.0, 100.0, 0.05, 0.2, 0.5], expected: [0.8215875666655357, -0.17841243333446433] },
      { input: [90.0, 100.0, 0.0, 0.3, 1.0], expected: [0.42027042376084733, -0.5797295762391527] },
    ],
    hint: "The put delta is the call delta minus one by put-call parity.",
  },
  {
    id: "op-225",
    title: "Implied Vol Newton Step",
    category: "Optimization",
    difficulty: "Hard",
    description:
      "Take one Newton step toward the implied volatility of a European call.\n\nCompute the Black-Scholes model price at the current sigma, the vega S * phi(d1) * sqrt(T), and return sigma - (model - price) / vega. Return sigma unchanged when vega is zero.",
    starterCode: `def implied_vol_newton_step(sigma, price, S, K, r, T):
    # Your code here
    pass`,
    solution: `def implied_vol_newton_step(sigma, price, S, K, r, T):
    import math
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * T ** 0.5)
    d2 = d1 - sigma * T ** 0.5
    cdf1 = 0.5 * (1 + math.erf(d1 / (2 ** 0.5)))
    cdf2 = 0.5 * (1 + math.erf(d2 / (2 ** 0.5)))
    model = S * cdf1 - K * math.exp(-r * T) * cdf2
    vega = S * math.exp(-0.5 * d1 * d1) / ((2 * math.pi) ** 0.5) * T ** 0.5
    if vega == 0:
        return sigma
    return sigma - (model - price) / vega`,
    testCases: [
      { input: [0.2, 10.45, 100.0, 100.0, 0.05, 1.0], expected: 0.19998444804269158 },
      { input: [0.25, 5.0, 100.0, 100.0, 0.03, 0.5], expected: 0.1506720363707626 },
      { input: [0.3, 15.0, 100.0, 90.0, 0.05, 1.0], expected: 0.15283331733069402 },
    ],
    hint: "Vega is largest near the money, which makes the Newton step well behaved there.",
  },
  {
    id: "op-226",
    title: "Greeks Numeric",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Estimate option Greeks with finite differences.\n\nGiven the base value f0, bumped values f_up and f_down, a later-time value f_t, spot bump ds, and time bump dt, return [delta, gamma, theta] with delta = (f_up - f_down) / (2 * ds), gamma = (f_up - 2 * f0 + f_down) / ds ** 2, and theta = (f_t - f0) / dt.",
    starterCode: `def numeric_greeks(f0, f_up, f_down, f_t, ds, dt):
    # Returns [delta, gamma, theta]
    # Your code here
    pass`,
    solution: `def numeric_greeks(f0, f_up, f_down, f_t, ds, dt):
    delta = (f_up - f_down) / (2 * ds)
    gamma = (f_up - 2 * f0 + f_down) / (ds * ds)
    theta = (f_t - f0) / dt
    return [delta, gamma, theta]`,
    testCases: [
      { input: [10.0, 11.0, 9.0, 9.8, 1.0, 0.1], expected: [1.0, 0.0, -1.999999999999993] },
      { input: [5.0, 5.2, 4.7, 4.9, 0.5, 0.25], expected: [0.5, -0.3999999999999986, -0.3999999999999986] },
      { input: [2.0, 2.0, 2.0, 2.0, 1.0, 1.0], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Delta is a central first difference and gamma a second difference.",
  },
  {
    id: "op-227",
    title: "Hedging Error Lite",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the total absolute hedging error between realized and hedged payoffs.\n\nReturn sum of abs(realized[i] - hedged[i]).",
    starterCode: `def hedging_error_lite(realized, hedged):
    # Your code here
    pass`,
    solution: `def hedging_error_lite(realized, hedged):
    total = 0.0
    for i in range(len(realized)):
        total = total + abs(realized[i] - hedged[i])
    return total`,
    testCases: [
      { input: [[1.0, 2.0], [0.9, 2.2]], expected: 0.30000000000000016 },
      { input: [[3.0], [5.0]], expected: 2.0 },
      { input: [[1.0, -1.0], [1.0, -1.0]], expected: 0.0 },
    ],
    hint: "Lower absolute error means a tighter hedge.",
  },
  {
    id: "op-228",
    title: "Frontier Point",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the volatility of a portfolio on the mean-variance frontier.\n\nFor target return mu_p and two assets with means mu1, mu2, volatilities sigma1, sigma2, and correlation rho, set w1 = (mu_p - mu2) / (mu1 - mu2) and return the standard deviation of the resulting portfolio. If the means are equal, return sigma1.",
    starterCode: `def frontier_point(mu_p, mu1, mu2, sigma1, sigma2, rho):
    # Your code here
    pass`,
    solution: `def frontier_point(mu_p, mu1, mu2, sigma1, sigma2, rho):
    if mu1 == mu2:
        return sigma1
    w1 = (mu_p - mu2) / (mu1 - mu2)
    w2 = 1 - w1
    var = w1 * w1 * sigma1 * sigma1 + w2 * w2 * sigma2 * sigma2 + 2 * w1 * w2 * rho * sigma1 * sigma2
    if var < 0:
        var = 0.0
    return var ** 0.5`,
    testCases: [
      { input: [0.08, 0.1, 0.05, 0.2, 0.1, 0.3], expected: 0.13740451229854134 },
      { input: [0.05, 0.1, 0.05, 0.2, 0.1, 0.3], expected: 0.1 },
      { input: [0.15, 0.1, 0.05, 0.2, 0.1, 0.0], expected: 0.412310562561766 },
    ],
    hint: "Weights follow from the target return; then apply the two-asset variance formula.",
  },
  {
    id: "op-229",
    title: "Sharpe Tangency Weights",
    category: "Optimization",
    difficulty: "Medium",
    description:
      "Compute the tangency portfolio weights for two risky assets plus a risk-free rate.\n\nWith diagonal covariance, weights are proportional to (mu_i - rf) / sigma_i ** 2. Normalize them to sum to 1 and return [w1, w2]. Return [0.0, 0.0] when a volatility or the total is zero.",
    starterCode: `def sharpe_tangency(mu1, mu2, s1, s2, rf):
    # Returns [w1, w2]
    # Your code here
    pass`,
    solution: `def sharpe_tangency(mu1, mu2, s1, s2, rf):
    if s1 == 0 or s2 == 0:
        return [0.0, 0.0]
    raw1 = (mu1 - rf) / (s1 * s1)
    raw2 = (mu2 - rf) / (s2 * s2)
    total = raw1 + raw2
    if total == 0:
        return [0.0, 0.0]
    return [raw1 / total, raw2 / total]`,
    testCases: [
      { input: [0.1, 0.15, 0.2, 0.3, 0.02], expected: [0.5806451612903225, 0.4193548387096775] },
      { input: [0.1, 0.15, 0.2, 0.3, 0.2], expected: [0.8181818181818181, 0.1818181818181819] },
      { input: [0.1, 0.1, 0.2, 0.2, 0.05], expected: [0.5, 0.5] },
    ],
    hint: "The tangency portfolio maximizes the Sharpe ratio, scaling each excess return by its variance.",
  },
  {
    id: "op-230",
    title: "Transaction Cost Penalty",
    category: "Optimization",
    difficulty: "Easy",
    description:
      "Compute the transaction cost of a rebalance.\n\nReturn cost_rate * sum(abs(w_new[i] - w_old[i])) over all positions, the proportional cost of the traded notional.",
    starterCode: `def transaction_cost_penalty(w_old, w_new, cost_rate):
    # Your code here
    pass`,
    solution: `def transaction_cost_penalty(w_old, w_new, cost_rate):
    total = 0.0
    for i in range(len(w_old)):
        total = total + abs(w_new[i] - w_old[i])
    return cost_rate * total`,
    testCases: [
      { input: [[0.5, 0.5], [0.6, 0.4], 0.01], expected: 0.0019999999999999996 },
      { input: [[1.0, 0.0], [0.0, 1.0], 0.05], expected: 0.1 },
      { input: [[0.25, 0.25, 0.5], [0.25, 0.25, 0.5], 0.1], expected: 0.0 },
    ],
    hint: "Transaction costs scale with total turnover.",
  },
];
