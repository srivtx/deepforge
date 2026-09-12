import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "pr-186",
    title: "Failure Rate From Counts",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Estimate the failure rate from failures observed over total_time units of operation:\n\nrate = failures / total_time.\n\nReturn 0.0 when total_time <= 0.",
    starterCode: `def failure_rate_from_counts(failures, total_time):
    # Your code here
    pass`,
    solution: `def failure_rate_from_counts(failures, total_time):
    if total_time <= 0:
        return 0.0
    return failures / total_time`,
    testCases: [
      { input: [3, 1000], expected: 0.003 },
      { input: [0, 500], expected: 0.0 },
      { input: [7, 2], expected: 3.5 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "For exponential lifetimes the failure rate is the reciprocal of the MTBF.",
  },
  {
    id: "pr-187",
    title: "Series Reliability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Reliability of a series system where every component must work:\n\nR = product of reliabilities.\n\nAn empty list returns 1.0, since there is no component to fail.",
    starterCode: `def series_reliability(reliabilities):
    # Your code here
    pass`,
    solution: `def series_reliability(reliabilities):
    product = 1.0
    for r in reliabilities:
        product *= r
    return product`,
    testCases: [
      { input: [[0.9, 0.8]], expected: 0.7200000000000001 },
      { input: [[0.5, 0.5, 0.5]], expected: 0.125 },
      { input: [[]], expected: 1.0 },
      { input: [[1.0, 0.4]], expected: 0.4 },
    ],
    hint: "Independence lets you multiply the component reliabilities.",
  },
  {
    id: "pr-188",
    title: "Parallel Reliability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Reliability of a parallel system that works when at least one component works:\n\nR = 1 - product(1 - reliabilities).\n\nAn empty list returns 0.0.",
    starterCode: `def parallel_reliability(reliabilities):
    # Your code here
    pass`,
    solution: `def parallel_reliability(reliabilities):
    fail = 1.0
    for r in reliabilities:
        fail *= 1.0 - r
    return 1.0 - fail`,
    testCases: [
      { input: [[0.9, 0.8]], expected: 0.98 },
      { input: [[0.5, 0.5]], expected: 0.75 },
      { input: [[]], expected: 0.0 },
      { input: [[1.0, 0.3]], expected: 1.0 },
    ],
    hint: "The system fails only when all components fail.",
  },
  {
    id: "pr-189",
    title: "k-out-of-n Reliability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Reliability of a k-out-of-n system of identical components, each working independently with probability r:\n\nR = sum from i = k to n of C(n, i) * r^i * (1 - r)^(n - i).\n\nReturn 0.0 for invalid parameters.",
    starterCode: `import math


def k_out_of_n_reliability(n, k, r):
    # Your code here
    pass`,
    solution: `import math


def k_out_of_n_reliability(n, k, r):
    if n < 0 or k < 0 or k > n or r < 0 or r > 1:
        return 0.0
    total = 0.0
    for i in range(k, n + 1):
        total += math.comb(n, i) * (r ** i) * ((1.0 - r) ** (n - i))
    return total`,
    testCases: [
      { input: [3, 2, 0.9], expected: 0.9720000000000001 },
      { input: [3, 1, 0.5], expected: 0.875 },
      { input: [1, 1, 0.3], expected: 0.3 },
      { input: [3, 4, 0.5], expected: 0.0 },
      { input: [2, 0, 0.4], expected: 1.0 },
    ],
    hint: "The number of working components is Binomial(n, r); sum the upper tail.",
  },
  {
    id: "pr-190",
    title: "M/M/1 Utilization",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Utilization (traffic intensity) of an M/M/1 queue with arrival rate lam and service rate mu:\n\nrho = lam / mu.\n\nReturn 0.0 when mu <= 0 or lam < 0.",
    starterCode: `def mm1_utilization(lam, mu):
    # Your code here
    pass`,
    solution: `def mm1_utilization(lam, mu):
    if mu <= 0 or lam < 0:
        return 0.0
    return lam / mu`,
    testCases: [
      { input: [1, 2], expected: 0.5 },
      { input: [3, 4], expected: 0.75 },
      { input: [0, 5], expected: 0.0 },
      { input: [1, 0], expected: 0.0 },
    ],
    hint: "The fraction of time the server is busy is the arrival rate over the service rate.",
  },
  {
    id: "pr-191",
    title: "Throughput Bottleneck",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Throughput of a pipeline is limited by its slowest stage. Return the minimum of the stage rates, and 0.0 for an empty list.",
    starterCode: `def throughput_bottleneck(stage_rates):
    # Your code here
    pass`,
    solution: `def throughput_bottleneck(stage_rates):
    if len(stage_rates) == 0:
        return 0.0
    return min(stage_rates)`,
    testCases: [
      { input: [[10, 5, 8]], expected: 5 },
      { input: [[3]], expected: 3 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Throughput is a minimum over stages, not an average.",
  },
  {
    id: "pr-192",
    title: "Lindley Recursion Step",
    category: "Probability",
    difficulty: "Easy",
    description:
      "One step of the Lindley recursion for waiting times in a single-server queue:\n\nW_next = max(0, W + service - interarrival).\n\nReturn the next waiting time.",
    starterCode: `def lindley_step(wait, service, interarrival):
    # Your code here
    pass`,
    solution: `def lindley_step(wait, service, interarrival):
    return max(0.0, wait + service - interarrival)`,
    testCases: [
      { input: [2, 3, 4], expected: 1.0 },
      { input: [0, 1, 5], expected: 0.0 },
      { input: [5, 2, 1], expected: 6.0 },
      { input: [1.5, 2.5, 2.0], expected: 2.0 },
    ],
    hint: "Wait times cannot go negative: an idle server resets the queue.",
  },
  {
    id: "pr-193",
    title: "Simulation Clock Advance",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Advance a discrete-event simulation clock to the next scheduled event strictly after current_time. Return the smallest event time greater than current_time, or current_time when no future event exists.",
    starterCode: `def clock_advance(current_time, event_times):
    # Your code here
    pass`,
    solution: `def clock_advance(current_time, event_times):
    best = None
    for t in event_times:
        if t > current_time and (best is None or t < best):
            best = t
    if best is None:
        return current_time
    return best`,
    testCases: [
      { input: [0, [3, 1, 2]], expected: 1 },
      { input: [2, [3, 1, 2]], expected: 3 },
      { input: [5, [3, 1, 2]], expected: 5 },
      { input: [1, [2, 2, 3]], expected: 2 },
    ],
    hint: "Ignore events at or before the current clock.",
  },
  {
    id: "pr-194",
    title: "Steady-State Availability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Steady-state availability of a repairable system with mean time between failures mtbf and mean time to repair mttr:\n\nA = mtbf / (mtbf + mttr).\n\nReturn 0.0 when both are 0 or inputs are negative.",
    starterCode: `def steady_state_availability(mtbf, mttr):
    # Your code here
    pass`,
    solution: `def steady_state_availability(mtbf, mttr):
    if mtbf < 0 or mttr < 0:
        return 0.0
    total = mtbf + mttr
    if total == 0:
        return 0.0
    return mtbf / total`,
    testCases: [
      { input: [100, 10], expected: 0.9090909090909091 },
      { input: [50, 50], expected: 0.5 },
      { input: [10, 0], expected: 1.0 },
      { input: [0, 0], expected: 0.0 },
    ],
    hint: "The system is up during the MTBF portion of each cycle.",
  },
  {
    id: "pr-195",
    title: "Discrete-Event Step",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Apply one event to a queue state. event_type 1 is an arrival (queue length plus 1), event_type 0 is a departure (queue length minus 1, never below 0), and any other event type changes nothing. Return the new queue length.",
    starterCode: `def discrete_event_step(queue_length, event_type):
    # Your code here
    pass`,
    solution: `def discrete_event_step(queue_length, event_type):
    if event_type == 1:
        return queue_length + 1
    if event_type == 0:
        if queue_length > 0:
            return queue_length - 1
        return 0
    return queue_length`,
    testCases: [
      { input: [0, 1], expected: 1 },
      { input: [0, 0], expected: 0 },
      { input: [3, 0], expected: 2 },
      { input: [3, 5], expected: 3 },
    ],
    hint: "Departures from an empty queue are lost.",
  },
  {
    id: "pr-196",
    title: "Hazard From Density",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Hazard rate from a density value and the corresponding survival value:\n\nh = density / survival.\n\nReturn 0.0 when survival <= 0.",
    starterCode: `def hazard_from_density(density, survival):
    # Your code here
    pass`,
    solution: `def hazard_from_density(density, survival):
    if survival <= 0:
        return 0.0
    return density / survival`,
    testCases: [
      { input: [0.2, 0.8], expected: 0.25 },
      { input: [0.5, 0.5], expected: 1.0 },
      { input: [1.0, 0.0], expected: 0.0 },
      { input: [0.1, 0.4], expected: 0.25 },
    ],
    hint: "The hazard is the instantaneous failure rate among survivors.",
  },
  {
    id: "pr-197",
    title: "Bathtub Hazard",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Bathtub-shaped hazard rate with infant-mortality, constant and wear-out components:\n\nh(t) = a / t + b + c * t for t > 0.\n\nReturn 0.0 for t <= 0 or negative coefficients.",
    starterCode: `def bathtub_hazard(t, a, b, c):
    # Your code here
    pass`,
    solution: `def bathtub_hazard(t, a, b, c):
    if t <= 0 or a < 0 or b < 0 or c < 0:
        return 0.0
    return a / t + b + c * t`,
    testCases: [
      { input: [1, 0.1, 0.2, 0.3], expected: 0.6000000000000001 },
      { input: [2, 0.2, 0.0, 0.1], expected: 0.30000000000000004 },
      { input: [0, 1, 1, 1], expected: 0.0 },
      { input: [1, 0, 1, 0], expected: 1.0 },
    ],
    hint: "The three terms capture early failures, random failures and wear-out.",
  },
  {
    id: "pr-198",
    title: "Repair Rate Availability",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Steady-state availability of a two-state system with failure rate lam and repair rate mu:\n\nA = mu / (lam + mu).\n\nReturn 0.0 for mu <= 0 or lam < 0.",
    starterCode: `def repair_rate_availability(lam, mu):
    # Your code here
    pass`,
    solution: `def repair_rate_availability(lam, mu):
    if lam < 0 or mu <= 0:
        return 0.0
    return mu / (lam + mu)`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [1, 3], expected: 0.75 },
      { input: [0, 2], expected: 1.0 },
      { input: [1, 0], expected: 0.0 },
    ],
    hint: "Faster repairs relative to failures raise availability.",
  },
  {
    id: "pr-199",
    title: "Survival From Hazard",
    category: "Probability",
    difficulty: "Easy",
    description:
      "Approximate survival probability from a piecewise-constant hazard over steps of width dt:\n\nR = exp(-dt * sum(hazards)).\n\nAn empty list returns 1.0.",
    starterCode: `import math


def survival_from_hazard(hazards, dt):
    # Your code here
    pass`,
    solution: `import math


def survival_from_hazard(hazards, dt):
    return math.exp(-dt * sum(hazards))`,
    testCases: [
      { input: [[0.1, 0.2, 0.3], 1.0], expected: 0.5488116360940264 },
      { input: [[1.0], 2.0], expected: 0.1353352832366127 },
      { input: [[], 5], expected: 1.0 },
      { input: [[0.5, 0.5], 0.5], expected: 0.6065306597126334 },
    ],
    hint: "The cumulative hazard is the area under the hazard curve.",
  },
  {
    id: "pr-200",
    title: "Shortest-Job-First Expected Wait",
    category: "Probability",
    difficulty: "Easy",
    description:
      "For jobs of the given sizes all available at time 0, shortest-job-first minimizes the mean waiting time. Sort the sizes ascending, form the prefix sums (the first job waits 0), and return their mean.\n\nReturn 0.0 for an empty list.",
    starterCode: `def sjf_expected_wait(job_sizes):
    # Your code here
    pass`,
    solution: `def sjf_expected_wait(job_sizes):
    if len(job_sizes) == 0:
        return 0.0
    ordered = sorted(job_sizes)
    elapsed = 0.0
    total_wait = 0.0
    for s in ordered:
        total_wait += elapsed
        elapsed += s
    return total_wait / len(ordered)`,
    testCases: [
      { input: [[1, 2, 3]], expected: 1.3333333333333333 },
      { input: [[3, 1, 2]], expected: 1.3333333333333333 },
      { input: [[5]], expected: 0.0 },
      { input: [[]], expected: 0.0 },
    ],
    hint: "Sorting ascending is what makes the prefix sums smallest overall.",
  },
  {
    id: "pr-201",
    title: "Thinned Autocorrelation",
    category: "Probability",
    difficulty: "Easy",
    description:
      "If a Markov chain has lag-1 autocorrelation rho, keeping every k-th sample (thinning) reduces the lag-1 autocorrelation to:\n\nrho_thinned = rho^k.\n\nReturn 0.0 for k < 0.",
    starterCode: `def thinned_autocorrelation(rho, k):
    # Your code here
    pass`,
    solution: `def thinned_autocorrelation(rho, k):
    if k < 0:
        return 0.0
    return rho ** k`,
    testCases: [
      { input: [0.9, 10], expected: 0.3486784401000001 },
      { input: [0.5, 3], expected: 0.125 },
      { input: [0.9, 0], expected: 1.0 },
      { input: [0.5, -1], expected: 0.0 },
    ],
    hint: "Autocorrelation decays geometrically under an AR(1)-like chain.",
  },
  {
    id: "pr-202",
    title: "Weibull Conditional Reliability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Conditional Weibull reliability of a component with scale lam and shape k that has already survived time t, for an additional mission time s:\n\nR = exp(-((t + s) / lam)^k + (t / lam)^k).\n\nReturn 0.0 for invalid inputs.",
    starterCode: `import math


def weibull_conditional_reliability(lam, k, t, s):
    # Your code here
    pass`,
    solution: `import math


def weibull_conditional_reliability(lam, k, t, s):
    if lam <= 0 or k <= 0 or t < 0 or s < 0:
        return 0.0
    return math.exp(-(((t + s) / lam) ** k) + ((t / lam) ** k))`,
    testCases: [
      { input: [1, 1, 2, 3], expected: 0.049787068367863944 },
      { input: [2, 1, 2, 2], expected: 0.36787944117144233 },
      { input: [1, 2, 1, 1], expected: 0.049787068367863944 },
      { input: [1, 1, 0, 1], expected: 0.36787944117144233 },
    ],
    hint: "Divide the survival at t + s by the survival at t.",
  },
  {
    id: "pr-203",
    title: "Weibull MTTF Numeric Integral",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Mean time to failure of a Weibull life distribution is the integral of the reliability R(t) = exp(-(t / lam)^k) from 0 to infinity. Approximate it on [0, t_max] with the trapezoid rule using steps intervals. Return 0.0 for invalid arguments.",
    starterCode: `import math


def mttf_weibull_integral(lam, k, t_max, steps):
    # Your code here
    pass`,
    solution: `import math


def mttf_weibull_integral(lam, k, t_max, steps):
    if lam <= 0 or k <= 0 or t_max <= 0 or steps < 1:
        return 0.0
    dt = t_max / steps
    total = 0.0
    for i in range(steps + 1):
        t = i * dt
        r = math.exp(-(((t / lam) ** k)))
        w = 0.5 if (i == 0 or i == steps) else 1.0
        total += w * r
    return total * dt`,
    testCases: [
      { input: [1, 1, 20, 1000], expected: 1.0000333310498923 },
      { input: [2, 1, 50, 2000], expected: 2.000026041571072 },
      { input: [1, 2, 10, 5000], expected: 0.8862269254527574 },
      { input: [1, 1, 0, 10], expected: 0.0 },
    ],
    hint: "For k = 1 the exact MTTF is lam, and for k = 2 it is lam * Gamma(1.5).",
  },
  {
    id: "pr-204",
    title: "Fault Tree AND-OR",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Given cut sets where each cut set is a list of independent event probabilities, the top event occurs if some cut set has all of its events (AND within a cut set, OR across cut sets):\n\nP = 1 - product over cut sets of (1 - product of probabilities in the cut set).\n\nReturn 0.0 when there are no cut sets.",
    starterCode: `def fault_tree_and_or(cut_sets):
    # Your code here
    pass`,
    solution: `def fault_tree_and_or(cut_sets):
    fail = 1.0
    for cut in cut_sets:
        and_prob = 1.0
        for p in cut:
            and_prob *= p
        fail *= 1.0 - and_prob
    return 1.0 - fail`,
    testCases: [
      { input: [[[0.1, 0.2], [0.3]]], expected: 0.31400000000000006 },
      { input: [[[0.5, 0.5]]], expected: 0.25 },
      { input: [[[1.0], [0.5]]], expected: 1.0 },
      { input: [[]], expected: 0.0 },
      { input: [[[]]], expected: 1.0 },
    ],
    hint: "An AND gate multiplies probabilities; an OR gate complements a product.",
  },
  {
    id: "pr-205",
    title: "Minimal Cut Count",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Given cut sets as lists of event labels, return the number of distinct minimal cut sets: a set is minimal when no other distinct set in the list is a proper subset of it. Empty cut sets are ignored.\n\nReturn 0 for an empty list.",
    starterCode: `def minimal_cut_count(cut_sets):
    # Your code here
    pass`,
    solution: `def minimal_cut_count(cut_sets):
    unique = []
    for s in cut_sets:
        fs = frozenset(s)
        if fs not in unique:
            unique.append(fs)
    count = 0
    for a in unique:
        if len(a) == 0:
            continue
        minimal = True
        for b in unique:
            if b != a and b < a:
                minimal = False
                break
        if minimal:
            count += 1
    return count`,
    testCases: [
      { input: [[[1, 2, 3], [1, 2], [1]]], expected: 1 },
      { input: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
      { input: [[[1], [2], [3]]], expected: 3 },
      { input: [[[1, 2], [1, 2]]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hint: "Drop duplicates first, then remove any set that contains another listed set.",
  },
  {
    id: "pr-206",
    title: "Markov Reliability Two-State",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Time-dependent availability of a two-state (up/down) system starting in the up state, with failure rate lam and repair rate mu:\n\nA(t) = mu / (lam + mu) + lam / (lam + mu) * exp(-(lam + mu) * t).\n\nReturn 0.0 for invalid inputs.",
    starterCode: `import math


def markov_reliability_2state(lam, mu, t):
    # Your code here
    pass`,
    solution: `import math


def markov_reliability_2state(lam, mu, t):
    if lam < 0 or mu <= 0 or t < 0:
        return 0.0
    total = lam + mu
    steady = mu / total
    transient = (lam / total) * math.exp(-total * t)
    return steady + transient`,
    testCases: [
      { input: [0.1, 0.2, 10], expected: 0.6832623561226213 },
      { input: [1, 1, 0], expected: 1.0 },
      { input: [1, 1, 1], expected: 0.5676676416183064 },
      { input: [0.5, 0.5, 5], expected: 0.5033689734995427 },
    ],
    hint: "The availability relaxes from 1 toward the steady-state value mu / (lam + mu).",
  },
  {
    id: "pr-207",
    title: "Erlang B Blocking Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Erlang B blocking probability for traffic erlangs offered to servers circuits, using the recursion B(0) = 1 and:\n\nB(k) = traffic * B(k - 1) / (k + traffic * B(k - 1)).\n\nReturn B(servers), and 0.0 for negative inputs.",
    starterCode: `def erlang_b(traffic, servers):
    # Your code here
    pass`,
    solution: `def erlang_b(traffic, servers):
    if traffic < 0 or servers < 0:
        return 0.0
    b = 1.0
    for k in range(1, servers + 1):
        b = traffic * b / (k + traffic * b)
    return b`,
    testCases: [
      { input: [1, 1], expected: 0.5 },
      { input: [1, 2], expected: 0.2 },
      { input: [2, 3], expected: 0.2105263157894737 },
      { input: [0, 5], expected: 0.0 },
      { input: [1, 0], expected: 1.0 },
    ],
    hint: "Each recursion step adds one circuit; no calls wait in the Erlang B model.",
  },
  {
    id: "pr-208",
    title: "Erlang C Waiting Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Erlang C probability that an arriving customer must wait when traffic erlangs are offered to servers, computed from the Erlang B value:\n\nC = B / (1 - rho * (1 - B)) with rho = traffic / servers.\n\nReturn 0.0 when traffic or servers is not positive, and 1.0 when rho >= 1.",
    starterCode: `def erlang_c(traffic, servers):
    # Your code here
    pass`,
    solution: `def erlang_c(traffic, servers):
    if traffic <= 0 or servers <= 0:
        return 0.0
    rho = traffic / servers
    if rho >= 1.0:
        return 1.0
    b = erlang_b(traffic, servers)
    return b / (1.0 - rho * (1.0 - b))


def erlang_b(traffic, servers):
    if traffic < 0 or servers < 0:
        return 0.0
    b = 1.0
    for k in range(1, servers + 1):
        b = traffic * b / (k + traffic * b)
    return b`,
    testCases: [
      { input: [1, 2], expected: 0.33333333333333337 },
      { input: [2, 3], expected: 0.4444444444444445 },
      { input: [1, 1], expected: 1.0 },
      { input: [0.5, 2], expected: 0.10000000000000002 },
      { input: [0, 2], expected: 0.0 },
    ],
    hint: "Erlang C equals Erlang B divided by one minus the carried-load correction.",
  },
  {
    id: "pr-209",
    title: "M/M/1 Wait Exceedance Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For a stable M/M/1 queue, return the probability that a customer waits more than time t:\n\nP(W > t) = rho * exp(-(mu - lam) * t).\n\nReturn 0.0 when the queue is unstable or inputs are invalid.",
    starterCode: `import math


def mm1_wait_exceed_probability(lam, mu, t):
    # Your code here
    pass`,
    solution: `import math


def mm1_wait_exceed_probability(lam, mu, t):
    if lam < 0 or mu <= 0 or t < 0:
        return 0.0
    rho = lam / mu
    if rho >= 1.0:
        return 0.0
    return rho * math.exp(-(mu - lam) * t)`,
    testCases: [
      { input: [1, 2, 1], expected: 0.18393972058572117 },
      { input: [1, 2, 0], expected: 0.5 },
      { input: [2, 4, 2], expected: 0.00915781944436709 },
      { input: [1, 1, 1], expected: 0.0 },
    ],
    hint: "The waiting time is exponential with rate mu - lam, taken with probability rho.",
  },
  {
    id: "pr-210",
    title: "M/M/1 Waiting-Line Length Probability",
    category: "Probability",
    difficulty: "Medium",
    description:
      "For a stable M/M/1 queue, return the probability that k customers are waiting in line, excluding the customer in service:\n\nP(Lq = 0) = 1 - rho and P(Lq = k) = (1 - rho) * rho^(k + 1) for k >= 1.\n\nReturn 0.0 for invalid inputs or an unstable queue.",
    starterCode: `def mm1_waiting_line_length_probability(lam, mu, k):
    # Your code here
    pass`,
    solution: `def mm1_waiting_line_length_probability(lam, mu, k):
    if lam < 0 or mu <= 0 or k < 0:
        return 0.0
    rho = lam / mu
    if rho >= 1.0:
        return 0.0
    if k == 0:
        return 1.0 - rho
    return (1.0 - rho) * (rho ** (k + 1))`,
    testCases: [
      { input: [1, 2, 0], expected: 0.5 },
      { input: [1, 2, 1], expected: 0.125 },
      { input: [1, 2, 2], expected: 0.0625 },
      { input: [1, 1, 0], expected: 0.0 },
    ],
    hint: "Shift the geometric distribution of the number in system by one.",
  },
  {
    id: "pr-211",
    title: "M/G/1 Pollaczek-Khinchine Queue Length",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Expected queue length in an M/G/1 queue from the Pollaczek-Khinchine formula:\n\nLq = (lam^2 * var_service + rho^2) / (2 * (1 - rho)) with rho = lam * mean_service.\n\nReturn -1.0 when rho >= 1 and 0.0 for invalid inputs.",
    starterCode: `def mg1_expected_queue_length(lam, mean_service, var_service):
    # Your code here
    pass`,
    solution: `def mg1_expected_queue_length(lam, mean_service, var_service):
    if lam < 0 or mean_service <= 0 or var_service < 0:
        return 0.0
    rho = lam * mean_service
    if rho >= 1.0:
        return -1.0
    return (lam * lam * var_service + rho * rho) / (2.0 * (1.0 - rho))`,
    testCases: [
      { input: [1, 0.5, 0.25], expected: 0.5 },
      { input: [2, 0.25, 0.0625], expected: 0.5 },
      { input: [1, 0.5, 1.0], expected: 1.25 },
      { input: [1, 1, 0], expected: -1.0 },
    ],
    hint: "With exponential service this reduces to the M/M/1 result rho^2 / (1 - rho).",
  },
  {
    id: "pr-212",
    title: "Priority Queue Waiting Time",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Non-preemptive priority M/G/1 queue. lambdas, mean_services and var_services are ordered from highest priority (index 0) to lowest. Return the expected waiting time for class class_index:\n\nW_k = sum over i of lam_i * (var_i + mean_i^2) / (2 * (1 - sigma_{k-1}) * (1 - sigma_k))\n\nwhere sigma_j is the cumulative utilization through class j. Return -1.0 when the denominator is nonpositive and 0.0 for invalid indices.",
    starterCode: `def priority_queue_waiting_time(lambdas, mean_services, var_services, class_index):
    # Your code here
    pass`,
    solution: `def priority_queue_waiting_time(lambdas, mean_services, var_services, class_index):
    n = len(lambdas)
    if n == 0 or class_index < 0 or class_index >= n:
        return 0.0
    second = 0.0
    for i in range(n):
        second += lambdas[i] * (var_services[i] + mean_services[i] ** 2)
    sigma_prev = 0.0
    for i in range(class_index):
        sigma_prev += lambdas[i] * mean_services[i]
    sigma_k = sigma_prev + lambdas[class_index] * mean_services[class_index]
    denom = 2.0 * (1.0 - sigma_prev) * (1.0 - sigma_k)
    if denom <= 0:
        return -1.0
    return second / denom`,
    testCases: [
      { input: [[1, 1], [0.2, 0.2], [0.04, 0.04], 0], expected: 0.10000000000000002 },
      { input: [[1, 1], [0.2, 0.2], [0.04, 0.04], 1], expected: 0.1666666666666667 },
      { input: [[1, 1], [0.6, 0.2], [0.36, 0.04], 1], expected: 5.000000000000001 },
      { input: [[2, 2], [0.6, 0.6], [0.36, 0.36], 1], expected: 5.142857142857144 },
      { input: [[], [], [], 0], expected: 0.0 },
    ],
    hint: "Low-priority classes are slowed by the work of all higher-priority classes.",
  },
  {
    id: "pr-213",
    title: "Round-Robin Response Times",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Deterministically simulate round-robin scheduling for jobs with the given service times that all arrive at time 0, using the given time quantum. Rotate through unfinished jobs giving each at most quantum units. Return the list of completion times in the original job order.\n\nReturn an empty list for an empty input or quantum <= 0.",
    starterCode: `def round_robin_response_times(services, quantum):
    # Your code here
    pass`,
    solution: `def round_robin_response_times(services, quantum):
    if quantum <= 0 or len(services) == 0:
        return []
    remaining = [float(s) for s in services]
    completion = [0.0] * len(services)
    time = 0.0
    while True:
        done = True
        for i in range(len(remaining)):
            if remaining[i] > 0:
                done = False
                run = min(quantum, remaining[i])
                time += run
                remaining[i] -= run
                if remaining[i] <= 1e-12:
                    completion[i] = time
                    remaining[i] = 0.0
        if done:
            break
    return completion`,
    testCases: [
      { input: [[1, 1, 1], 1], expected: [1.0, 2.0, 3.0] },
      { input: [[5, 1], 1], expected: [6.0, 2.0] },
      { input: [[2, 3], 10], expected: [2.0, 5.0] },
      { input: [[], 1], expected: [] },
      { input: [[1], 0], expected: [] },
    ],
    hint: "Each pass through the job list advances the clock by up to one quantum per job.",
  },
  {
    id: "pr-214",
    title: "Lindley Waiting Time Sequence",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Simulate the Lindley recursion over a sequence of service times and interarrival times, starting from an empty queue:\n\nW_next = max(0, W + service - interarrival).\n\nReturn the average waiting time over the jobs. Return 0.0 for an empty sequence.",
    starterCode: `def lindley_waiting_times(services, interarrivals):
    # Your code here
    pass`,
    solution: `def lindley_waiting_times(services, interarrivals):
    if len(services) == 0:
        return 0.0
    wait = 0.0
    total = 0.0
    for i in range(len(services)):
        total += wait
        wait = max(0.0, wait + services[i] - interarrivals[i])
    return total / len(services)`,
    testCases: [
      { input: [[2, 3], [4, 1]], expected: 0.0 },
      { input: [[3, 2], [1, 2]], expected: 1.0 },
      { input: [[1, 1, 1], [1, 1, 1]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Accumulate each job's wait before updating it with the recursion.",
  },
  {
    id: "pr-215",
    title: "Inverse Transform Discrete Counts",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Generate n samples from a discrete distribution by inverse transform with random.Random(seed). For each uniform u, return the first index whose cumulative probability exceeds u, and count the results. Return [] for an empty distribution or n <= 0.",
    starterCode: `import random


def inverse_transform_discrete(probs, n, seed):
    # Your code here
    pass`,
    solution: `import random


def inverse_transform_discrete(probs, n, seed):
    if len(probs) == 0 or n <= 0:
        return []
    rng = random.Random(seed)
    counts = [0] * len(probs)
    for _ in range(n):
        u = rng.random()
        cumulative = 0.0
        idx = len(probs) - 1
        for i, p in enumerate(probs):
            cumulative += p
            if u < cumulative:
                idx = i
                break
        counts[idx] += 1
    return counts`,
    testCases: [
      { input: [[0.5, 0.5], 1000, 42], expected: [480, 520] },
      { input: [[1 / 3, 1 / 3, 1 / 3], 600, 7], expected: [218, 190, 192] },
      { input: [[1.0], 50, 1], expected: [50] },
      { input: [[], 5, 0], expected: [] },
    ],
    hint: "Walk the cumulative distribution and pick the first crossing index.",
  },
  {
    id: "pr-216",
    title: "Exponential Variate Mean (Seeded)",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Estimate the mean of an Exponential(lam) distribution by inverse-transform simulation. Draw n uniforms from random.Random(seed), transform each with -log(1 - U) / lam, and return the average. Return 0.0 for invalid inputs.",
    starterCode: `import math
import random


def exponential_variate_mean(lam, n, seed):
    # Your code here
    pass`,
    solution: `import math
import random


def exponential_variate_mean(lam, n, seed):
    if lam <= 0 or n <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(n):
        total += -math.log(1.0 - rng.random()) / lam
    return total / n`,
    testCases: [
      { input: [1, 10000, 42], expected: 0.9995207951445273 },
      { input: [2, 10000, 7], expected: 0.49812329121720605 },
      { input: [0.5, 5000, 123], expected: 1.9953393953396754 },
      { input: [1, 0, 5], expected: 0.0 },
    ],
    hint: "The inverse CDF of the exponential is -log(1 - U) / lam.",
  },
  {
    id: "pr-217",
    title: "Exponential Mixture Composition (Seeded)",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Sample from a two-component exponential mixture using the composition method: with probability p1 draw from Exponential(lam1), otherwise from Exponential(lam2). Return the seeded sample mean over n draws. Return 0.0 for invalid inputs.",
    starterCode: `import math
import random


def composition_sample_mean(lam1, lam2, p1, n, seed):
    # Your code here
    pass`,
    solution: `import math
import random


def composition_sample_mean(lam1, lam2, p1, n, seed):
    if lam1 <= 0 or lam2 <= 0 or n <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(n):
        if rng.random() < p1:
            total += -math.log(1.0 - rng.random()) / lam1
        else:
            total += -math.log(1.0 - rng.random()) / lam2
    return total / n`,
    testCases: [
      { input: [1, 2, 0.5, 20000, 42], expected: 0.7507352428918592 },
      { input: [1, 2, 0.5, 20000, 7], expected: 0.7461103728816006 },
      { input: [3, 0.5, 0.7, 10000, 1], expected: 0.8352886808240652 },
      { input: [1, 2, 0.5, 0, 0], expected: 0.0 },
    ],
    hint: "Choose the component first, then sample from it with a second uniform.",
  },
  {
    id: "pr-218",
    title: "Alias Table Build",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Build Walker's alias table for a discrete distribution over probs. Return [prob, alias] where prob[i] is the probability of keeping column i and alias[i] is the fallback column. Return [[], []] for an empty or all-zero distribution.",
    starterCode: `def alias_table(probs):
    # Your code here
    pass`,
    solution: `def alias_table(probs):
    n = len(probs)
    if n == 0:
        return [[], []]
    total = sum(probs)
    if total <= 0:
        return [[], []]
    scaled = [p * n / total for p in probs]
    small = []
    large = []
    for i in range(n):
        if scaled[i] < 1.0:
            small.append(i)
        else:
            large.append(i)
    prob = [0.0] * n
    alias = list(range(n))
    while small and large:
        s = small.pop()
        l = large.pop()
        prob[s] = scaled[s]
        alias[s] = l
        scaled[l] = scaled[l] + scaled[s] - 1.0
        if scaled[l] < 1.0:
            small.append(l)
        else:
            large.append(l)
    while large:
        prob[large.pop()] = 1.0
    while small:
        prob[small.pop()] = 1.0
    return [prob, alias]`,
    testCases: [
      { input: [[0.5, 0.5]], expected: [[1.0, 1.0], [0, 1]] },
      { input: [[0.7, 0.3]], expected: [[1.0, 0.6], [0, 0]] },
      { input: [[1 / 3, 1 / 3, 1 / 3]], expected: [[1.0, 1.0, 1.0], [0, 1, 2]] },
      { input: [[1.0]], expected: [[1.0], [0]] },
      {
        input: [[0.1, 0.2, 0.7]],
        expected: [[0.30000000000000004, 0.6000000000000001, 1.0], [2, 2, 2]],
      },
      { input: [[0.5, 0.25, 0.25]], expected: [[1.0, 0.75, 0.75], [0, 0, 0]] },
    ],
    hint: "Pair small columns with large ones, moving the surplus into the large column.",
  },
  {
    id: "pr-219",
    title: "MCMC Burn-In Mean",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Discard the first burn_in samples of a Markov chain and return the mean of the remaining samples. A negative burn_in is treated as 0, and 0.0 is returned when nothing remains.",
    starterCode: `def mcmc_burn_in_mean(samples, burn_in):
    # Your code here
    pass`,
    solution: `def mcmc_burn_in_mean(samples, burn_in):
    if burn_in < 0:
        burn_in = 0
    if burn_in >= len(samples):
        return 0.0
    kept = samples[burn_in:]
    return sum(kept) / len(kept)`,
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: 4.0 },
      { input: [[1, 2], 0], expected: 1.5 },
      { input: [[1, 2, 3], 3], expected: 0.0 },
      { input: [[], 0], expected: 0.0 },
    ],
    hint: "Burn-in removes the transient before averaging.",
  },
  {
    id: "pr-220",
    title: "Lag-1 Autocorrelation",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Lag-1 autocorrelation of a sample sequence:\n\nrho = sum((x_i - mean) * (x_{i+1} - mean)) / sum((x_i - mean)^2).\n\nReturn 0.0 for fewer than 2 samples or a constant sequence.",
    starterCode: `def autocorrelation_lag1(samples):
    # Your code here
    pass`,
    solution: `def autocorrelation_lag1(samples):
    n = len(samples)
    if n < 2:
        return 0.0
    mean = sum(samples) / n
    num = 0.0
    den = 0.0
    for i in range(n):
        d = samples[i] - mean
        den += d * d
        if i < n - 1:
            num += d * (samples[i + 1] - mean)
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 0.4 },
      { input: [[1, 1, 1]], expected: 0.0 },
      { input: [[1, 2]], expected: -0.5 },
      { input: [[5]], expected: 0.0 },
      { input: [[1, 3, 1, 3]], expected: -0.75 },
    ],
    hint: "Use the same mean for both the numerator and denominator.",
  },
  {
    id: "pr-221",
    title: "Variance Reduction Factor",
    category: "Probability",
    difficulty: "Medium",
    description:
      "Antithetic variates average each pair (X, X') with correlation correlation, reducing the variance of the pair mean to (1 + correlation) / 2 times the original variance. Return that factor.\n\nReturn 0.0 when correlation is outside [-1, 1].",
    starterCode: `def variance_reduction_factor(correlation):
    # Your code here
    pass`,
    solution: `def variance_reduction_factor(correlation):
    if correlation < -1.0 or correlation > 1.0:
        return 0.0
    return (1.0 + correlation) / 2.0`,
    testCases: [
      { input: [0.0], expected: 0.5 },
      { input: [0.8], expected: 0.9 },
      { input: [-1.0], expected: 0.0 },
      { input: [1.0], expected: 1.0 },
    ],
    hint: "Negative correlation between the pair halves the variance when it reaches -1.",
  },
  {
    id: "pr-222",
    title: "Gelman-Rubin R-hat",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Gelman-Rubin convergence diagnostic for several equal-length chains. Compute the within-chain variance W and the between-chain variance B, then return:\n\nR = sqrt(((n - 1) / n * W + B / n) / W)\n\nReturn 0.0 when there are fewer than 2 chains of fewer than 2 samples, lengths differ, or W is 0.",
    starterCode: `import math


def gelman_rubin_rhat(chains):
    # Your code here
    pass`,
    solution: `import math


def gelman_rubin_rhat(chains):
    m = len(chains)
    if m < 2:
        return 0.0
    n = len(chains[0])
    if n < 2:
        return 0.0
    for c in chains:
        if len(c) != n:
            return 0.0
    means = [sum(c) / n for c in chains]
    grand = sum(means) / m
    within = 0.0
    for c, mu in zip(chains, means):
        within += sum((x - mu) ** 2 for x in c) / (n - 1)
    w = within / m
    b = n * sum((mu - grand) ** 2 for mu in means) / (m - 1)
    if w == 0:
        return 0.0
    var_hat = (n - 1.0) / n * w + b / n
    return math.sqrt(var_hat / w)`,
    testCases: [
      { input: [[[1, 2, 3], [1, 2, 3]]], expected: 0.816496580927726 },
      { input: [[[1, 2, 3], [2, 3, 4]]], expected: 1.0801234497346432 },
      { input: [[[1, 1, 1], [1, 1, 1]]], expected: 0.0 },
      { input: [[[1, 2], [3, 4]]], expected: 2.1213203435596424 },
      { input: [[[1, 2, 3]]], expected: 0.0 },
    ],
    hint: "R-hat near 1 suggests the chains have mixed; use sample variances with n - 1 and m - 1.",
  },
  {
    id: "pr-223",
    title: "Alias Sampling (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Sample n values from a discrete distribution over probs using Walker's alias table and random.Random(seed). For each draw pick a column uniformly, keep it with prob[col], and otherwise take alias[col]. Return the counts per value.\n\nReturn [] for an empty distribution or n <= 0.",
    starterCode: `import random


def alias_sample_seeded(probs, n, seed):
    # Your code here
    pass`,
    solution: `import random


def alias_sample_seeded(probs, n, seed):
    if len(probs) == 0 or n <= 0:
        return []
    table = _alias_table(probs)
    prob = table[0]
    alias = table[1]
    k = len(prob)
    rng = random.Random(seed)
    counts = [0] * k
    for _ in range(n):
        col = int(rng.random() * k)
        if rng.random() < prob[col]:
            counts[col] += 1
        else:
            counts[alias[col]] += 1
    return counts


def _alias_table(probs):
    n = len(probs)
    total = sum(probs)
    if n == 0 or total <= 0:
        return [[], []]
    scaled = [p * n / total for p in probs]
    small = []
    large = []
    for i in range(n):
        if scaled[i] < 1.0:
            small.append(i)
        else:
            large.append(i)
    prob = [0.0] * n
    alias = list(range(n))
    while small and large:
        s = small.pop()
        l = large.pop()
        prob[s] = scaled[s]
        alias[s] = l
        scaled[l] = scaled[l] + scaled[s] - 1.0
        if scaled[l] < 1.0:
            small.append(l)
        else:
            large.append(l)
    while large:
        prob[large.pop()] = 1.0
    while small:
        prob[small.pop()] = 1.0
    return [prob, alias]`,
    testCases: [
      { input: [[0.5, 0.5], 1000, 42], expected: [491, 509] },
      { input: [[0.7, 0.3], 2000, 7], expected: [1419, 581] },
      { input: [[1 / 3, 1 / 3, 1 / 3], 900, 123], expected: [310, 314, 276] },
      { input: [[1.0], 100, 0], expected: [100] },
      { input: [[], 10, 1], expected: [] },
    ],
    hint: "Sampling from an alias table costs O(1) per draw after the build.",
  },
  {
    id: "pr-224",
    title: "Control Variates Estimate",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Control-variate estimator of E[X] using samples_x, samples_y and the known mean of Y. Estimate beta = Cov(X, Y) / Var(Y) with n - 1 denominators, then return mean(X) - beta * (mean(Y) - known_mean_y).\n\nReturn mean(X) when the sample is degenerate or Y has zero variance.",
    starterCode: `def control_variates_estimate(samples_x, samples_y, known_mean_y):
    # Your code here
    pass`,
    solution: `def control_variates_estimate(samples_x, samples_y, known_mean_y):
    n = len(samples_x)
    if n == 0 or len(samples_y) != n:
        return 0.0
    mean_x = sum(samples_x) / n
    if n < 2:
        return mean_x
    mean_y = sum(samples_y) / n
    cov = 0.0
    var_y = 0.0
    for i in range(n):
        cov += (samples_x[i] - mean_x) * (samples_y[i] - mean_y)
        var_y += (samples_y[i] - mean_y) ** 2
    if var_y == 0:
        return mean_x
    beta = cov / var_y
    return mean_x - beta * (mean_y - known_mean_y)`,
    testCases: [
      { input: [[1, 2, 3, 4], [2, 4, 6, 8], 5.0], expected: 2.5 },
      { input: [[2, 4, 6, 8], [1, 2, 3, 4], 2.0], expected: 4.0 },
      { input: [[1, 1, 1, 1], [1, 2, 3, 4], 2.5], expected: 1.0 },
      { input: [[1, 2, 3], [1, 1, 1], 2.0], expected: 2.0 },
    ],
    hint: "Subtract the control's observed error scaled by the regression coefficient.",
  },
  {
    id: "pr-225",
    title: "Antithetic Variates Estimate (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Estimate E[exp(U)] for U uniform on (0, 1), whose exact value is e - 1, using n antithetic pairs. For each pair draw u with random.Random(seed), average exp(u) and exp(1 - u), and return the overall mean.\n\nReturn 0.0 for n <= 0.",
    starterCode: `import math
import random


def antithetic_variate_estimate(n, seed):
    # Your code here
    pass`,
    solution: `import math
import random


def antithetic_variate_estimate(n, seed):
    if n <= 0:
        return 0.0
    rng = random.Random(seed)
    total = 0.0
    for _ in range(n):
        u = rng.random()
        total += (math.exp(u) + math.exp(1.0 - u)) / 2.0
    return total / n`,
    testCases: [
      { input: [20000, 42], expected: 1.718325754686535 },
      { input: [20000, 7], expected: 1.7184331002239301 },
      { input: [100, 0], expected: 1.7132295901718049 },
      { input: [0, 5], expected: 0.0 },
    ],
    hint: "The two values of each pair are negatively correlated because exp is monotone.",
  },
  {
    id: "pr-226",
    title: "Common Random Numbers Estimate (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Using common random numbers, estimate P(U < p1) and P(U < p2) from the same uniforms drawn with random.Random(seed) and return [estimate1, estimate2, estimate1 - estimate2].\n\nReturn [0.0, 0.0, 0.0] for n <= 0.",
    starterCode: `import random


def common_random_numbers_estimate(p1, p2, n, seed):
    # Your code here
    pass`,
    solution: `import random


def common_random_numbers_estimate(p1, p2, n, seed):
    if n <= 0:
        return [0.0, 0.0, 0.0]
    rng = random.Random(seed)
    c1 = 0
    c2 = 0
    for _ in range(n):
        u = rng.random()
        if u < p1:
            c1 += 1
        if u < p2:
            c2 += 1
    f1 = c1 / n
    f2 = c2 / n
    return [f1, f2, f1 - f2]`,
    testCases: [
      { input: [0.5, 0.5, 10000, 42], expected: [0.499, 0.499, 0.0] },
      {
        input: [0.4, 0.6, 10000, 7],
        expected: [0.4043, 0.6043, -0.19999999999999996],
      },
      { input: [0.2, 0.9, 5000, 1], expected: [0.1994, 0.8958, -0.6964] },
      { input: [0.5, 0.5, 0, 0], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Sharing uniforms couples the two estimators and reduces the variance of their difference.",
  },
  {
    id: "pr-227",
    title: "Particle Filter Weight Update",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Update particle weights with a likelihood: return the normalized product weights:\n\nw_i_new = w_i * l_i / sum over j of w_j * l_j.\n\nReturn an empty list for empty, mismatched or all-zero inputs.",
    starterCode: `def particle_filter_weight_update(weights, likelihoods):
    # Your code here
    pass`,
    solution: `def particle_filter_weight_update(weights, likelihoods):
    if len(weights) == 0 or len(weights) != len(likelihoods):
        return []
    total = 0.0
    for w, l in zip(weights, likelihoods):
        total += w * l
    if total == 0:
        return []
    return [w * l / total for w, l in zip(weights, likelihoods)]`,
    testCases: [
      { input: [[0.5, 0.5], [1.0, 2.0]], expected: [0.3333333333333333, 0.6666666666666666] },
      {
        input: [[0.2, 0.3, 0.5], [0.1, 0.2, 0.7]],
        expected: [0.04651162790697675, 0.13953488372093023, 0.813953488372093],
      },
      { input: [[0.5, 0.5], [0.0, 0.0]], expected: [] },
      { input: [[1.0], [3.0]], expected: [1.0] },
    ],
    hint: "Multiply then normalize so the weights sum to 1.",
  },
  {
    id: "pr-228",
    title: "Systematic Resampling (Seeded)",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Systematic resampling of normalized weights with random.Random(seed). Draw one uniform offset u in [0, 1 / n), then select indices at positions u, u + 1/n, ..., u + (n - 1)/n of the cumulative distribution. Return the resampled index list.\n\nReturn [] for an empty or all-zero weight vector.",
    starterCode: `import random


def sequential_importance_resampling(weights, seed):
    # Your code here
    pass`,
    solution: `import random


def sequential_importance_resampling(weights, seed):
    n = len(weights)
    if n == 0:
        return []
    total = sum(weights)
    if total <= 0:
        return []
    norm = [w / total for w in weights]
    rng = random.Random(seed)
    u = rng.random() / n
    result = []
    cumulative = norm[0]
    i = 0
    for _ in range(n):
        while u > cumulative:
            i += 1
            cumulative += norm[i]
        result.append(i)
        u += 1.0 / n
    return result`,
    testCases: [
      { input: [[0.25, 0.25, 0.25, 0.25], 42], expected: [0, 1, 2, 3] },
      { input: [[0.7, 0.2, 0.1], 7], expected: [0, 0, 1] },
      { input: [[1.0], 5], expected: [0] },
      { input: [[], 1], expected: [] },
    ],
    hint: "One random offset produces a stratified set of selection points.",
  },
  {
    id: "pr-229",
    title: "Effective Sample Size",
    category: "Probability",
    difficulty: "Hard",
    description:
      "Effective sample size of a weight vector after normalizing:\n\nESS = 1 / sum(w_i^2).\n\nReturn 0.0 for an empty vector or one with zero total weight.",
    starterCode: `def effective_sample_size(weights):
    # Your code here
    pass`,
    solution: `def effective_sample_size(weights):
    if len(weights) == 0:
        return 0.0
    total = sum(weights)
    if total <= 0:
        return 0.0
    sq = 0.0
    for w in weights:
        sq += (w / total) ** 2
    return 1.0 / sq`,
    testCases: [
      { input: [[0.25, 0.25, 0.25, 0.25]], expected: 4.0 },
      { input: [[1.0]], expected: 1.0 },
      { input: [[0.5, 0.5]], expected: 2.0 },
      { input: [[0.9, 0.1]], expected: 1.2195121951219512 },
      { input: [[0.0, 0.0]], expected: 0.0 },
    ],
    hint: "ESS is maximal for uniform weights and drops toward 1 for degenerate ones.",
  },
  {
    id: "pr-230",
    title: "Sobol First-Order Index",
    category: "Probability",
    difficulty: "Hard",
    description:
      "First-order Sobol sensitivity index from conditional means, conditional variances and probabilities of a conditioning variable:\n\nS = Var(E[Y | X]) / (E[Var(Y | X)] + Var(E[Y | X])).\n\nReturn 0.0 when the total variance is 0 or the inputs are empty.",
    starterCode: `def sobol_first_order_index(cond_means, cond_vars, probs):
    # Your code here
    pass`,
    solution: `def sobol_first_order_index(cond_means, cond_vars, probs):
    if len(cond_means) == 0:
        return 0.0
    mean = sum(p * m for p, m in zip(probs, cond_means))
    e_var = sum(p * v for p, v in zip(probs, cond_vars))
    var_mean = sum(p * (m - mean) ** 2 for p, m in zip(probs, cond_means))
    total = e_var + var_mean
    if total == 0:
        return 0.0
    return var_mean / total`,
    testCases: [
      { input: [[0, 10], [1, 1], [0.5, 0.5]], expected: 0.9615384615384616 },
      { input: [[2, 4], [3, 5], [0.25, 0.75]], expected: 0.14285714285714285 },
      { input: [[1, 1], [2, 3], [0.5, 0.5]], expected: 0.0 },
      { input: [[], [], []], expected: 0.0 },
    ],
    hint: "Use the law of total variance decomposition and take the fraction explained by the conditioning variable.",
  },
];
