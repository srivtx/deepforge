import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-226",
    title: "Hypergraph Laplacian Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the normalized hypergraph Laplacian L = D_v - H D_e^-1 H^T with unit hyperedge weights.\n\nH is the incidence matrix, D_v holds node degrees, and D_e holds hyperedge sizes. Two nodes in the same hyperedge of size s contribute -1/s off-diagonal, and every incidence adds 1 to the diagonal. hyperedges is a list of vertex lists. Return the n by n float matrix.",
    starterCode: `def hypergraph_laplacian(n, hyperedges):
    # Your code here
    pass`,
    solution: `def hypergraph_laplacian(n, hyperedges):
    matrix = [[0.0] * n for _ in range(n)]
    for members in hyperedges:
        unique = sorted(set(members))
        size = len(unique)
        if size == 0:
            continue
        for v in unique:
            matrix[v][v] += 1.0
        for i in range(size):
            for j in range(size):
                if i != j:
                    matrix[unique[i]][unique[j]] -= 1.0 / size
    return matrix`,
    testCases: [
      { input: [3, [[0, 1, 2]]], expected: [[1.0, -0.3333333333333333, -0.3333333333333333], [-0.3333333333333333, 1.0, -0.3333333333333333], [-0.3333333333333333, -0.3333333333333333, 1.0]] },
      { input: [3, [[0, 1], [1, 2]]], expected: [[1.0, -0.5, 0.0], [-0.5, 2.0, -0.5], [0.0, -0.5, 1.0]] },
      { input: [2, []], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Dividing by the hyperedge size makes larger hyperedges contribute weaker pairwise couplings.",
  },
  {
    id: "graph-227",
    title: "Edge Sampling Probability",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Sample a subgraph by keeping each edge independently with probability p.\n\nCall random.seed(seed) first so the sample is reproducible, then scan the edges in input order and keep each when random.random() is below p. Return the kept edges normalized so u < v and sorted. edges is a list of [u, v] pairs.",
    starterCode: `import random
def edge_sampling_probability(edges, seed, p):
    # Your code here
    pass`,
    solution: `import random
def edge_sampling_probability(edges, seed, p):
    random.seed(seed)
    kept = []
    for u, v in edges:
        if random.random() < p:
            kept.append([u, v] if u < v else [v, u])
    kept.sort()
    return kept`,
    testCases: [
      { input: [[[0, 1], [1, 2], [2, 3], [3, 0]], 42, 0.5], expected: [[0, 3], [1, 2], [2, 3]] },
      { input: [[[0, 1], [1, 2]], 7, 0.0], expected: [] },
      { input: [[[0, 1], [1, 2]], 7, 1.0], expected: [[0, 1], [1, 2]] },
    ],
    hint: "Seeding the generator is what makes randomized graph experiments reproducible.",
  },
  {
    id: "graph-228",
    title: "Random Walk Sampling Node",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Simulate a simple random walk on an undirected graph and return the visited sequence.\n\nStart at start, and at each step move to a uniformly random neighbor chosen from the sorted neighbor list using the seeded generator. If the current node has no neighbors the walk stops. Return the visited nodes including the start. edges is a list of [u, v] pairs.",
    starterCode: `import random
def random_walk_sampling_node(n, edges, start, steps, seed):
    # Your code here
    pass`,
    solution: `import random
def random_walk_sampling_node(n, edges, start, steps, seed):
    random.seed(seed)
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    walk = [start]
    current = start
    for _ in range(steps):
        neighbors = sorted(adj[current])
        if not neighbors:
            break
        current = neighbors[random.randrange(len(neighbors))]
        walk.append(current)
    return walk`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 4, 42], expected: [0, 1, 0, 1, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 1, 5, 7], expected: [1, 2, 0, 2, 0, 1] },
      { input: [2, [], 1, 3, 1], expected: [1] },
    ],
    hint: "Sorting the neighbor list before choosing keeps results stable across Python versions.",
  },
  {
    id: "graph-229",
    title: "Snowball Sampling Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the nodes collected by snowball sampling within k hops of a set of seeds.\n\nRun a multi-source BFS from the seeds and count nodes whose distance is at most k. edges is a list of [u, v] pairs. Return the count as an integer.",
    starterCode: `def snowball_sampling_count(n, edges, seeds, k):
    # Your code here
    pass`,
    solution: `def snowball_sampling_count(n, edges, seeds, k):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    queue = []
    for s in seeds:
        if dist[s] == -1:
            dist[s] = 0
            queue.append(s)
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for w in adj[v]:
            if dist[w] == -1:
                dist[w] = dist[v] + 1
                queue.append(w)
    return sum(1 for d in dist if 0 <= d <= k)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0], 2], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 3], 1], expected: 4 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0], 0], expected: 1 },
      { input: [3, [], [1], 2], expected: 1 },
    ],
    hint: "Snowball sampling is just a BFS truncated at a hop limit.",
  },
  {
    id: "graph-230",
    title: "GIN Sum vs Mean Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Check whether sum pooling and mean pooling can distinguish two bags of node features.\n\nfeatures_a and features_b are lists of numbers representing each graph's node features. Return [s, m] where s is 1 when the sums differ and m is 1 when the means differ, else 0.",
    starterCode: `def gin_sum_vs_mean_check(features_a, features_b):
    # Your code here
    pass`,
    solution: `def gin_sum_vs_mean_check(features_a, features_b):
    sum_a = sum(features_a)
    sum_b = sum(features_b)
    mean_a = sum_a / len(features_a) if features_a else 0.0
    mean_b = sum_b / len(features_b) if features_b else 0.0
    return [1 if sum_a != sum_b else 0, 1 if mean_a != mean_b else 0]`,
    testCases: [
      { input: [[1, 2], [3]], expected: [0, 1] },
      { input: [[1, 2], [1, 2]], expected: [0, 0] },
      { input: [[1], [2]], expected: [1, 1] },
      { input: [[], []], expected: [0, 0] },
    ],
    hint: "A graph neural network with mean readout cannot tell apart equal-size bags with equal means.",
  },
  {
    id: "graph-231",
    title: "Weighted Matching Greedy",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build a maximal weighted matching greedily: sort edges by decreasing weight, breaking ties by endpoint pair, and take each edge whose endpoints are still free.\n\nedges is a list of [u, v, w] triples. Return [total_weight, pairs] where pairs are the chosen edges sorted.",
    starterCode: `def weighted_matching_greedy(n, edges):
    # Your code here
    pass`,
    solution: `def weighted_matching_greedy(n, edges):
    ordered = sorted(edges, key=lambda e: (-e[2], min(e[0], e[1]), max(e[0], e[1])))
    used = [False] * n
    total = 0
    pairs = []
    for u, v, w in ordered:
        if not used[u] and not used[v]:
            used[u] = True
            used[v] = True
            total += w
            pairs.append([u, v] if u < v else [v, u])
    pairs.sort()
    return [total, pairs]`,
    testCases: [
      { input: [4, [[0, 1, 5], [1, 2, 3], [2, 3, 4]]], expected: [9, [[0, 1], [2, 3]]] },
      { input: [3, [[0, 1, 2], [1, 2, 3], [0, 2, 1]]], expected: [3, [[1, 2]]] },
      { input: [4, []], expected: [0, []] },
      { input: [2, [[0, 1, 7]]], expected: [7, [[0, 1]]] },
    ],
    hint: "Greedy matching is a 1/2 approximation for maximum weight matching.",
  },
  {
    id: "graph-232",
    title: "Transitive Reduction Size",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the edges kept by the transitive reduction of a directed graph.\n\nAn edge u to v is redundant when there is a directed path from u to v of length at least two, otherwise it must be kept. edges is a list of [u, v] pairs. Return the number of kept edges.",
    starterCode: `def transitive_reduction_size(n, edges):
    # Your code here
    pass`,
    solution: `def transitive_reduction_size(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
    kept = 0
    for u, v in edges:
        seen = {u}
        stack = [u]
        found = False
        while stack and not found:
            x = stack.pop()
            for y in adj[x]:
                if y == v and x != u:
                    found = True
                    break
                if y not in seen:
                    seen.add(y)
                    stack.append(y)
        if not found:
            kept += 1
    return kept`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3]]], expected: 4 },
    ],
    hint: "The transitive reduction keeps exactly the edges that no longer path can replace.",
  },
  {
    id: "graph-233",
    title: "Reachability Tree Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build a BFS tree of an undirected graph from a root and return parent and depth arrays.\n\nNeighbors are explored in ascending order and unreachable nodes keep parent -1 and depth -1. The root is its own parent with depth 0. edges is a list of [u, v] pairs. Return [parent, depth].",
    starterCode: `def reachability_tree(n, edges, root):
    # Your code here
    pass`,
    solution: `def reachability_tree(n, edges, root):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    depth = [-1] * n
    parent[root] = root
    depth[root] = 0
    queue = [root]
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for w in sorted(adj[v]):
            if depth[w] == -1:
                depth[w] = depth[v] + 1
                parent[w] = v
                queue.append(w)
    return [parent, depth]`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3]], 0], expected: [[0, 0, 0, 1], [0, 1, 1, 2]] },
      { input: [3, [[0, 1], [1, 2]], 1], expected: [[1, 1, 1], [1, 0, 1]] },
      { input: [4, [[0, 1], [2, 3]], 0], expected: [[0, 0, -1, -1], [0, 1, -1, -1]] },
    ],
    hint: "A BFS tree captures shortest-path structure from the root.",
  },
  {
    id: "graph-234",
    title: "Path Decomposition Width",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the width of a path decomposition: the size of its largest bag minus 1.\n\nbags is a list of vertex lists, and one vertex is added at a time along the path. Return 0 for an empty decomposition.",
    starterCode: `def path_decomposition_width(bags):
    # Your code here
    pass`,
    solution: `def path_decomposition_width(bags):
    if not bags:
        return 0
    largest = 0
    for bag in bags:
        if len(bag) > largest:
            largest = len(bag)
    return largest - 1`,
    testCases: [
      { input: [[[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [[[0, 1, 2]]], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[[0], [0, 1]]], expected: 1 },
    ],
    hint: "The width is what makes treewidth and pathwidth hard problems tractable when small.",
  },
  {
    id: "graph-235",
    title: "Vertex Separation Bound",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the vertex separation of a vertex ordering: the maximum over prefixes of the number of prefix vertices that have a neighbor outside the prefix.\n\norder is a permutation of the n nodes and edges is a list of [u, v] pairs. Return the maximum boundary size.",
    starterCode: `def vertex_separation(order, edges):
    # Your code here
    pass`,
    solution: `def vertex_separation(order, edges):
    adj = [set() for _ in range(len(order))]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = 0
    inside = set()
    for v in order:
        inside.add(v)
        boundary = 0
        for x in inside:
            for y in adj[x]:
                if y not in inside:
                    boundary += 1
                    break
        if boundary > best:
            best = boundary
    return best`,
    testCases: [
      { input: [[0, 1, 2, 3], [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [[0, 1, 2, 3], [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [[1, 2, 3, 0], [[0, 1], [0, 2], [0, 3]]], expected: 3 },
      { input: [[0, 1], [[0, 1]]], expected: 1 },
    ],
    hint: "Vertex separation and pathwidth are closely related: the minimum over orderings is the pathwidth.",
  },
  {
    id: "graph-236",
    title: "Graph Compression Reference Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the duplicate edge references that a compression pass would remove.\n\nNormalize every edge so u < v and count how many edges are repetitions of an edge already seen. Return the number of duplicates. edges is a list of [u, v] pairs.",
    starterCode: `def compression_reference_count(edges):
    # Your code here
    pass`,
    solution: `def compression_reference_count(edges):
    seen = set()
    duplicates = 0
    for u, v in edges:
        key = (u, v) if u < v else (v, u)
        if key in seen:
            duplicates += 1
        else:
            seen.add(key)
    return duplicates`,
    testCases: [
      { input: [[[0, 1], [1, 0], [1, 2], [2, 1], [0, 1]]], expected: 3 },
      { input: [[[0, 1], [1, 2]]], expected: 0 },
      { input: [[[0, 1], [0, 1], [0, 1]]], expected: 2 },
    ],
    hint: "Canonicalizing undirected edges is the first step of any edge-list compression.",
  },
  {
    id: "graph-237",
    title: "Small-World Coefficient",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the small-world coefficient sigma = (C / C_rand) / (L / L_rand).\n\nclustering and avg_path are the graph's clustering coefficient and average shortest path length; clustering_random and avg_path_random are the values of an equivalent random graph. Return sigma as a float.",
    starterCode: `def small_world_coefficient(clustering, avg_path, clustering_random, avg_path_random):
    # Your code here
    pass`,
    solution: `def small_world_coefficient(clustering, avg_path, clustering_random, avg_path_random):
    return (clustering / clustering_random) / (avg_path / avg_path_random)`,
    testCases: [
      { input: [0.6, 3.0, 0.1, 5.0], expected: 10.0 },
      { input: [0.4, 4.0, 0.2, 2.0], expected: 1.0 },
      { input: [0.5, 2.0, 0.5, 2.0], expected: 1.0 },
    ],
    hint: "A small world has much higher clustering than random while keeping short paths.",
  },
  {
    id: "graph-238",
    title: "Epidemic R0 from Graph Degree",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Estimate the basic reproduction number of an SIR process from the mean degree: R0 = beta * mean_degree / gamma.\n\nbeta is the transmission rate per edge, gamma the recovery rate, and edges the contact list of an undirected graph with n nodes. Return the float value, or 0.0 when n is 0 or gamma is 0.",
    starterCode: `def epidemic_r0(n, edges, beta, gamma):
    # Your code here
    pass`,
    solution: `def epidemic_r0(n, edges, beta, gamma):
    if n == 0 or gamma == 0:
        return 0.0
    mean_degree = 2.0 * len(edges) / n
    return beta * mean_degree / gamma`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0.5, 0.25], expected: 2.6666666666666665 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0.2, 0.5], expected: 0.6000000000000001 },
      { input: [1, [], 0.5, 0.25], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 0.3, 0.2], expected: 4.5 },
    ],
    hint: "A denser contact network raises R0 and makes outbreaks harder to contain.",
  },
  {
    id: "graph-239",
    title: "Vaccination Target Set Greedy",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Choose k nodes to vaccinate by highest degree, breaking ties by smallest index.\n\nReturn the chosen node indices sorted in ascending order. n is the number of nodes and edges is a list of [u, v] pairs.",
    starterCode: `def vaccination_targets(n, edges, k):
    # Your code here
    pass`,
    solution: `def vaccination_targets(n, edges, k):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    order = sorted(range(n), key=lambda x: (-degree[x], x))
    return sorted(order[:k])`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]], 2], expected: [0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1], expected: [0] },
      { input: [3, [], 2], expected: [0, 1] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 4], expected: [0, 1, 2, 3] },
    ],
    hint: "Degree centrality is a simple but effective first guess for immunization.",
  },
  {
    id: "graph-240",
    title: "Firewall Edge Cut Value",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the firewall edges that run between a protected set and the rest of an undirected graph.\n\nAn edge counts when exactly one endpoint is protected. protected is a list of node indices and edges is a list of [u, v] pairs. Return the integer count.",
    starterCode: `def firewall_cut(n, edges, protected):
    # Your code here
    pass`,
    solution: `def firewall_cut(n, edges, protected):
    inside = set(protected)
    cut = 0
    for u, v in edges:
        if (u in inside) != (v in inside):
            cut += 1
    return cut`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 2]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], []], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1, 2, 3]], expected: 0 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], [0, 1]], expected: 2 },
    ],
    hint: "Firewalling a node set pays for every connection that leaves it.",
  },
  {
    id: "graph-241",
    title: "Graph Anomaly Score Lite",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Score each node by the z-score of its degree: (degree - mean) / standard deviation.\n\nWhen the standard deviation is zero, return zeros. Return the scores in node order as floats. n is the number of nodes and edges is a list of [u, v] pairs.",
    starterCode: `import math
def anomaly_scores(n, edges):
    # Your code here
    pass`,
    solution: `import math
def anomaly_scores(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    if n == 0:
        return []
    mean = sum(degree) / n
    variance = sum((d - mean) ** 2 for d in degree) / n
    std = math.sqrt(variance)
    if std == 0:
        return [0.0] * n
    return [(d - mean) / std for d in degree]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [-1.0, 1.0, 1.0, -1.0] },
      { input: [3, []], expected: [0.0, 0.0, 0.0] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1.7320508075688772, -0.5773502691896257, -0.5773502691896257, -0.5773502691896257] },
    ],
    hint: "Degree z-scores highlight nodes whose connectivity is unusual for the network.",
  },
  {
    id: "graph-242",
    title: "Graph Coarsening Matching Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one coarsening round with greedy matching: scan nodes in order and match each unmatched node with its smallest-index unmatched neighbor.\n\nMatched pairs and unmatched nodes become clusters, so the cluster count is n minus the number of pairs. Return [cluster_count, pairs] with pairs sorted.",
    starterCode: `def coarsening_matching(n, edges):
    # Your code here
    pass`,
    solution: `def coarsening_matching(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    matched = [-1] * n
    pairs = []
    for v in range(n):
        if matched[v] != -1:
            continue
        for w in sorted(adj[v]):
            if matched[w] == -1:
                matched[v] = w
                matched[w] = v
                pairs.append([v, w])
                break
    clusters = n - len(pairs)
    return [clusters, pairs]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [2, [[0, 1], [2, 3]]] },
      { input: [5, [[0, 1], [2, 3], [1, 2]]], expected: [3, [[0, 1], [2, 3]]] },
      { input: [3, []], expected: [3, []] },
      { input: [2, [[0, 1]]], expected: [1, [[0, 1]]] },
    ],
    hint: "Coarsening halves the graph at best, which is why multilevel methods scale well.",
  },
  {
    id: "graph-243",
    title: "Multilevel Partition Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Coarsen an undirected graph repeatedly with greedy matching until at most k nodes remain.\n\nEach round matches nodes pairwise, contracts matched pairs into supernodes, and deduplicates the contracted edges. Return [levels, final_node_count]; stop early if a round cannot match anything.",
    starterCode: `def multilevel_partition(n, edges, k):
    # Your code here
    pass`,
    solution: `def multilevel_partition(n, edges, k):
    current = n
    current_edges = set()
    for u, v in edges:
        current_edges.add((u, v) if u < v else (v, u))
    levels = 0
    while current > k:
        adj = [set() for _ in range(current)]
        for u, v in current_edges:
            adj[u].add(v)
            adj[v].add(u)
        used = [False] * current
        pairs = {}
        pair_count = 0
        for v in range(current):
            if used[v]:
                continue
            for w in sorted(adj[v]):
                if not used[w]:
                    used[v] = True
                    used[w] = True
                    pairs[v] = w
                    pairs[w] = v
                    pair_count += 1
                    break
        new_id = {}
        next_id = 0
        for v in range(current):
            if v not in new_id:
                if v in pairs:
                    new_id[v] = next_id
                    new_id[pairs[v]] = next_id
                    next_id += 1
                else:
                    new_id[v] = next_id
                    next_id += 1
        new_edges = set()
        for u, v in current_edges:
            a = new_id[u]
            b = new_id[v]
            if a != b:
                new_edges.add((a, b) if a < b else (b, a))
        current = next_id
        current_edges = new_edges
        levels += 1
        if pair_count == 0:
            break
    return [levels, current]`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 2], expected: [2, 2] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 1], expected: [2, 1] },
      { input: [3, [], 2], expected: [1, 3] },
    ],
    hint: "Multilevel partitioning alternates coarsening, initial partitioning, and refinement.",
  },
  {
    id: "graph-244",
    title: "Forest Fire Sampling Seeded",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Sample a subgraph with the forest fire model starting from one seed.\n\nProcess a queue: for each visited node, burn each unvisited sorted neighbor independently with probability burn_prob using the seeded generator, adding burned nodes to the frontier. Return the sorted visited nodes. edges is a list of [u, v] pairs.",
    starterCode: `import random
def forest_fire_sampling(n, edges, start, burn_prob, seed):
    # Your code here
    pass`,
    solution: `import random
def forest_fire_sampling(n, edges, start, burn_prob, seed):
    random.seed(seed)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = {start}
    queue = [start]
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for w in sorted(adj[v]):
            if w not in visited and random.random() < burn_prob:
                visited.add(w)
                queue.append(w)
    return sorted(visited)`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0, 0.5, 42], expected: [0] },
      { input: [4, [[0, 1], [0, 2], [1, 2], [2, 3]], 0, 0.3, 7], expected: [0, 2, 3] },
      { input: [3, [[0, 1]], 0, 1.0, 1], expected: [0, 1] },
      { input: [2, [], 0, 0.5, 1], expected: [0] },
    ],
    hint: "Forest fire sampling explores more broadly as the burning probability rises.",
  },
  {
    id: "graph-245",
    title: "LINE First-Order Loss",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the first-order LINE loss from precomputed dot products.\n\nPositive terms are scored with -log(sigmoid(x)) and negative terms with -log(sigmoid(-x)); the loss is the mean over all terms, or 0.0 when there are none. pos_dots and neg_dots are lists of embedding dot products.",
    starterCode: `import math
def line_first_order_loss(pos_dots, neg_dots):
    # Your code here
    pass`,
    solution: `import math
def line_first_order_loss(pos_dots, neg_dots):
    total = 0.0
    for x in pos_dots:
        total += -math.log(1.0 / (1.0 + math.exp(-x)))
    for x in neg_dots:
        total += -math.log(1.0 - 1.0 / (1.0 + math.exp(-x)))
    count = len(pos_dots) + len(neg_dots)
    if count == 0:
        return 0.0
    return total / count`,
    testCases: [
      { input: [[1.0, 0.5], [-1.0, -0.5]], expected: 0.39366933584916475 },
      { input: [[2.0], [-2.0]], expected: 0.12692801104297258 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "First-order LINE pulls connected nodes together and pushes sampled non-neighbors apart.",
  },
  {
    id: "graph-246",
    title: "LINE Second-Order Loss",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the second-order LINE loss for one context node: the negative log softmax probability of the true neighbor.\n\nscores is the list of context scores and true_index marks the observed neighbor. Apply a numerically stable softmax and return -log p as a float.",
    starterCode: `import math
def line_second_order_loss(scores, true_index):
    # Your code here
    pass`,
    solution: `import math
def line_second_order_loss(scores, true_index):
    mx = max(scores)
    exps = [math.exp(s - mx) for s in scores]
    total = sum(exps)
    return -math.log(exps[true_index] / total)`,
    testCases: [
      { input: [[1.0, 2.0, 0.5], 1], expected: 0.46436878410794485 },
      { input: [[0.0, 0.0], 0], expected: 0.6931471805599453 },
      { input: [[3.0, 1.0], 0], expected: 0.12692801104297258 },
    ],
    hint: "Second-order LINE treats every other node as negative context, weighted by softmax.",
  },
  {
    id: "graph-247",
    title: "WL Subtree Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count distinct Weisfeiler-Lehman colors after each refinement round, including round 0 before any refinement.\n\nEach new color is the old color plus the sorted neighbor colors. labels is the initial color list, rounds is the number of refinements, and edges is a list of [u, v] pairs. Return the list of distinct color counts per round.",
    starterCode: `def wl_subtree_count(n, edges, labels, rounds):
    # Your code here
    pass`,
    solution: `def wl_subtree_count(n, edges, labels, rounds):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    current = [str(x) for x in labels]
    counts = [len(set(current))]
    for _ in range(rounds):
        nxt = []
        for v in range(n):
            nxt.append(current[v] + "|" + ",".join(sorted(current[w] for w in adj[v])))
        current = nxt
        counts.append(len(set(current)))
    return counts`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1, 1, 0], 2], expected: [2, 2, 2] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 0, 0], 2], expected: [1, 1, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [1, 0, 0, 0], 1], expected: [2, 2] },
      { input: [2, [[0, 1]], ["a", "b"], 1], expected: [2, 2] },
    ],
    hint: "The number of distinct WL colors bounds how much structural information the test can see.",
  },
  {
    id: "graph-248",
    title: "K-Truss Decomposition Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the k-truss of an undirected graph: the largest edge set where every edge lies in at least k - 2 triangles within the set.\n\nRepeatedly delete edges with too few triangle supports until stable, then return the remaining edges sorted as [u, v] pairs. n is the number of nodes and edges is a list of [u, v] pairs.",
    starterCode: `def k_truss_step(n, edges, k):
    # Your code here
    pass`,
    solution: `def k_truss_step(n, edges, k):
    remaining = set()
    for u, v in edges:
        remaining.add((u, v) if u < v else (v, u))
    changed = True
    while changed:
        changed = False
        to_remove = []
        for e in remaining:
            u, v = e
            triangles = 0
            for w in range(n):
                key1 = (u, w) if u < w else (w, u)
                key2 = (v, w) if v < w else (w, v)
                if key1 in remaining and key2 in remaining:
                    triangles += 1
            if triangles < k - 2:
                to_remove.append(e)
        if to_remove:
            changed = True
            for e in to_remove:
                remaining.discard(e)
    return sorted([list(e) for e in remaining])`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]], 3], expected: [[0, 1], [0, 2], [1, 2]] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 3], expected: [] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [1, 3], [2, 3], [0, 3]], 4], expected: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] },
      { input: [3, [[0, 1]], 3], expected: [] },
    ],
    hint: "Triangle counts drop as edges are removed, so k-truss peeling iterates to a fixed point.",
  },
  {
    id: "graph-249",
    title: "Densest Subgraph Greedy",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Approximate the densest subgraph by repeatedly deleting the minimum-degree node (ties by smallest index).\n\nAfter each deletion record the density edges/nodes and keep the best seen, returning [best_density, best_size]. n is the number of nodes and edges is a list of [u, v] pairs.",
    starterCode: `def densest_subgraph_greedy(n, edges):
    # Your code here
    pass`,
    solution: `def densest_subgraph_greedy(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    remaining = set(range(n))
    best_density = 0.0
    best_size = 0
    while remaining:
        size = len(remaining)
        edge_count = 0
        for u, v in edges:
            if u in remaining and v in remaining:
                edge_count += 1
        density = edge_count / size
        if density > best_density:
            best_density = density
            best_size = size
        v = min(remaining, key=lambda x: (len(adj[x] & remaining), x))
        remaining.discard(v)
    return [best_density, best_size]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [1.0, 4] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [1.5, 4] },
      { input: [3, [[0, 1]]], expected: [0.5, 2] },
    ],
    hint: "This greedy is a 1/2 approximation to the densest subgraph problem.",
  },
  {
    id: "graph-250",
    title: "Independent Set Local Search",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Grow a given independent set by first adding every node not adjacent to it, then repeatedly try (1,2)-swaps: replace one set node adjacent to exactly one outside node with that outside node when it increases the size after greedy completion.\n\nReturn the final set sorted. edges is a list of [u, v] pairs and initial lists the starting independent set.",
    starterCode: `def independent_set_local_search(n, edges, initial):
    # Your code here
    pass`,
    solution: `def independent_set_local_search(n, edges, initial):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    current = set(initial)
    for v in range(n):
        if v in current:
            continue
        if not (adj[v] & current):
            current.add(v)
    improved = True
    while improved:
        improved = False
        for v in range(n):
            if v in current:
                continue
            neighbors_inside = adj[v] & current
            if len(neighbors_inside) == 1:
                u = next(iter(neighbors_inside))
                trial = set(current)
                trial.discard(u)
                trial.add(v)
                added = True
                while added:
                    added = False
                    for w in range(n):
                        if w not in trial and not (adj[w] & trial):
                            trial.add(w)
                            added = True
                if len(trial) > len(current):
                    current = trial
                    improved = True
    return sorted(current)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0]], expected: [0, 2] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0]], expected: [1, 2, 3] },
      { input: [3, [], [1]], expected: [0, 1, 2] },
    ],
    hint: "Local search escapes bad starting sets by exchanging one node for several.",
  },
  {
    id: "graph-251",
    title: "DSATUR Coloring Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one DSATUR step on a partially colored graph.\n\nPick the uncolored node with the largest number of distinct colors among its colored neighbors (saturation), breaking ties by largest degree then smallest index; assign it the smallest available color. Return [node, color, updated_colors], or [-1, -1, colors] when all nodes are colored.",
    starterCode: `def dsatur_step(n, edges, colors):
    # Your code here
    pass`,
    solution: `def dsatur_step(n, edges, colors):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = None
    for v in range(n):
        if colors[v] != -1:
            continue
        saturation = len({colors[w] for w in adj[v] if colors[w] != -1})
        key = (-saturation, -len(adj[v]), v)
        if best is None or key < best[0]:
            best = (key, v)
    if best is None:
        return [-1, -1, list(colors)]
    v = best[1]
    forbidden = {colors[w] for w in adj[v] if colors[w] != -1}
    color = 0
    while color in forbidden:
        color += 1
    updated = list(colors)
    updated[v] = color
    return [v, color, updated]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], [-1, -1, -1]], expected: [0, 0, [0, -1, -1]] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], [0, -1, -1, -1]], expected: [1, 1, [0, 1, -1, -1]] },
      { input: [2, [[0, 1]], [0, 1]], expected: [-1, -1, [0, 1]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0, -1, -1, -1]], expected: [1, 1, [0, 1, -1, -1]] },
    ],
    hint: "DSATUR greedily colors the most constrained node first, which often beats simple order.",
  },
  {
    id: "graph-252",
    title: "Stable Roommates Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a perfect matching of the stable roommates problem is stable.\n\nprefs[i] is node i's preference list from most to least preferred and partner[i] is i's assigned partner. A blocking pair is two non-partners who each prefer the other over their assignment. Return False when any blocking pair exists.",
    starterCode: `def stable_roommates_check(prefs, partner):
    # Your code here
    pass`,
    solution: `def stable_roommates_check(prefs, partner):
    rank = []
    for p in prefs:
        rank.append({x: i for i, x in enumerate(p)})
    n = len(prefs)
    for a in range(n):
        for b in range(a + 1, n):
            if partner[a] == b:
                continue
            if rank[a][b] < rank[a][partner[a]] and rank[b][a] < rank[b][partner[b]]:
                return False
    return True`,
    testCases: [
      { input: [[[1, 2, 3], [0, 2, 3], [1, 0, 3], [0, 1, 2]], [1, 0, 3, 2]], expected: true },
      { input: [[[1, 2, 3], [0, 2, 3], [1, 0, 3], [0, 1, 2]], [2, 3, 0, 1]], expected: false },
      { input: [[[1], [0]], [1, 0]], expected: true },
    ],
    hint: "Stability forbids any pair of non-partners who would rather be together.",
  },
  {
    id: "graph-253",
    title: "Kidney Exchange Cycle Length",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the length of the shortest directed cycle through a given start node in a donor graph.\n\nSolve the shortest cycle by BFS from every out-neighbor of start back to start. Return the cycle length, or -1 when start lies on no cycle. edges is a list of directed [u, v] pairs.",
    starterCode: `def kidney_cycle_length(edges, start):
    # Your code here
    pass`,
    solution: `def kidney_cycle_length(edges, start):
    n = 0
    for u, v in edges:
        n = max(n, u + 1, v + 1)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    best = -1
    for first in adj[start]:
        dist = {first: 1}
        queue = [first]
        head = 0
        while head < len(queue):
            x = queue[head]
            head += 1
            for y in adj[x]:
                if y == start:
                    if best == -1 or dist[x] + 1 < best:
                        best = dist[x] + 1
                elif y not in dist:
                    dist[y] = dist[x] + 1
                    queue.append(y)
    return best`,
    testCases: [
      { input: [[[0, 1], [1, 2], [2, 0], [2, 3], [3, 2]], 0], expected: 3 },
      { input: [[[0, 1], [1, 2], [2, 3]], 0], expected: -1 },
      { input: [[[0, 1], [1, 0]], 0], expected: 2 },
      { input: [[[0, 1], [1, 0], [0, 2], [2, 1]], 0], expected: 2 },
    ],
    hint: "Short cycles let more donor pairs be transplanted simultaneously.",
  },
  {
    id: "graph-254",
    title: "SPFA Shortest Path",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest paths with the SPFA queue-based relaxation.\n\nedges is a list of directed [u, v, w] triples. Return [distances, relax_count] where distances use -1 for unreachable nodes and relax_count counts successful relaxations. Nodes are re-enqueued only when they are not already in the queue.",
    starterCode: `def spfa_shortest_path(n, edges, src):
    # Your code here
    pass`,
    solution: `def spfa_shortest_path(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    queue = [src]
    in_queue = [False] * n
    in_queue[src] = True
    relax_count = 0
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        in_queue[v] = False
        for w, weight in adj[v]:
            if dist[v] + weight < dist[w]:
                dist[w] = dist[v] + weight
                relax_count += 1
                if not in_queue[w]:
                    in_queue[w] = True
                    queue.append(w)
    return [[d if d != INF else -1 for d in dist], relax_count]`,
    testCases: [
      { input: [4, [[0, 1, 1], [0, 2, 4], [1, 2, 2], [2, 3, 1], [1, 3, 5]], 0], expected: [[0, 1, 3, 4], 5] },
      { input: [3, [[0, 1, 3], [1, 2, 1]], 0], expected: [[0, 3, 4], 2] },
      { input: [3, [[0, 1, 2]], 0], expected: [[0, 2, -1], 1] },
    ],
    hint: "SPFA is Bellman-Ford with a queue, often much faster in practice.",
  },
  {
    id: "graph-255",
    title: "Contraction Hierarchy Order Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Pick the next node to contract in a contraction hierarchy by minimum edge difference.\n\nThe edge difference of a node is the number of neighbor pairs that are not yet connected minus its degree. Compute it for every node and return [node, difference] for the minimum (ties by smallest index). edges is a list of [u, v] pairs.",
    starterCode: `def ch_edge_difference(n, edges):
    # Your code here
    pass`,
    solution: `def ch_edge_difference(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = None
    for v in range(n):
        neighbors = sorted(adj[v])
        missing = 0
        for i in range(len(neighbors)):
            for j in range(i + 1, len(neighbors)):
                if neighbors[j] not in adj[neighbors[i]]:
                    missing += 1
        difference = missing - len(neighbors)
        key = (difference, v)
        if best is None or key < best[0]:
            best = (key, v)
    return [best[1], best[0][0]]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [0, -1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1, -1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0, -2] },
    ],
    hint: "Cheap contractions add few shortcuts, keeping the hierarchy small.",
  },
  {
    id: "graph-256",
    title: "A* Landmark Heuristic",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build a landmark heuristic for A*: h(v) = |dist(landmark, v) - dist(landmark, goal)|.\n\nRun Dijkstra from the landmark on the undirected weighted graph, then return the heuristic for every node in order. Nodes or goals disconnected from the landmark get -1. edges is a list of [u, v, w] triples.",
    starterCode: `import heapq
def landmark_heuristic(n, edges, landmark, goal):
    # Your code here
    pass`,
    solution: `import heapq
def landmark_heuristic(n, edges, landmark, goal):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    dist = [-1] * n
    dist[landmark] = 0
    heap = [(0, landmark)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for w, weight in adj[v]:
            nd = d + weight
            if dist[w] == -1 or nd < dist[w]:
                dist[w] = nd
                heapq.heappush(heap, (nd, w))
    result = []
    for v in range(n):
        if dist[v] == -1 or dist[goal] == -1:
            result.append(-1)
        else:
            result.append(abs(dist[v] - dist[goal]))
    return result`,
    testCases: [
      { input: [4, [[0, 1, 2], [1, 2, 1], [2, 3, 3]], 0, 3], expected: [6, 4, 3, 0] },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1]], 0, 2], expected: [2, 1, 0, 1] },
      { input: [3, [[0, 1, 1]], 0, 2], expected: [-1, -1, -1] },
    ],
    hint: "Landmark heuristics stay admissible because distances obey the triangle inequality.",
  },
  {
    id: "graph-257",
    title: "Degree Distribution Fit Slope",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Fit the slope of the degree distribution on a log-log plot.\n\nCount how many nodes have each positive degree, take logs of degree and count, and compute the least-squares slope of count versus degree. Return 0.0 when fewer than two distinct degrees exist or the fit is degenerate. edges is a list of [u, v] pairs.",
    starterCode: `import math
def degree_slope(n, edges):
    # Your code here
    pass`,
    solution: `import math
def degree_slope(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    counts = {}
    for d in degree:
        if d > 0:
            counts[d] = counts.get(d, 0) + 1
    xs = []
    ys = []
    for d in sorted(counts):
        xs.append(math.log(d))
        ys.append(math.log(counts[d]))
    if len(xs) < 2:
        return 0.0
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    num = 0.0
    den = 0.0
    for i in range(len(xs)):
        num += (xs[i] - mx) * (ys[i] - my)
        den += (xs[i] - mx) ** 2
    if den == 0:
        return 0.0
    return num / den`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 0.5849625007211563 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: -1.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 0.0 },
    ],
    hint: "Scale-free networks show an approximately straight line with negative slope on log-log axes.",
  },
  {
    id: "graph-258",
    title: "Six-Degrees Estimate",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Estimate small-world distances: the fraction of ordered node pairs within six hops and the mean finite distance.\n\nRun a BFS from every node. Return [fraction_within_six, average_distance], where the fraction uses all n * (n - 1) ordered pairs and the average uses only connected pairs (0.0 when none exist). edges is a list of [u, v] pairs.",
    starterCode: `def six_degrees(n, edges):
    # Your code here
    pass`,
    solution: `def six_degrees(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    within = 0
    total_distance = 0
    connected = 0
    for s in range(n):
        dist = [-1] * n
        dist[s] = 0
        queue = [s]
        head = 0
        while head < len(queue):
            v = queue[head]
            head += 1
            for w in adj[v]:
                if dist[w] == -1:
                    dist[w] = dist[v] + 1
                    queue.append(w)
        for v in range(n):
            if v != s and dist[v] != -1:
                connected += 1
                total_distance += dist[v]
                if dist[v] <= 6:
                    within += 1
    pairs = n * (n - 1)
    if pairs == 0:
        return [0.0, 0.0]
    average = total_distance / connected if connected else 0.0
    return [within / pairs, average]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [1.0, 1.6666666666666667] },
      { input: [4, [[0, 1], [2, 3]]], expected: [0.3333333333333333, 1.0] },
      { input: [1, []], expected: [0.0, 0.0] },
    ],
    hint: "Six degrees of separation is the empirical claim that this fraction stays near 1.",
  },
  {
    id: "graph-259",
    title: "Temporal Reachability Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether dst is temporally reachable from src in an evolving graph.\n\nProcess snapshots in order; at each step, edges of the current snapshot may be traversed by nodes reached so far. Return True as soon as dst is reached, and check the start node before any step. snapshots is a list of edge lists.",
    starterCode: `def temporal_reachability(n, snapshots, src, dst):
    # Your code here
    pass`,
    solution: `def temporal_reachability(n, snapshots, src, dst):
    known = {src}
    if dst in known:
        return True
    for snapshot in snapshots:
        new = set()
        for u, v in snapshot:
            if u in known and v not in known:
                new.add(v)
            if v in known and u not in known:
                new.add(u)
        known.update(new)
        if dst in known:
            return True
    return False`,
    testCases: [
      { input: [4, [[[0, 1]], [[1, 2]], [[2, 3]]], 0, 3], expected: true },
      { input: [4, [[[0, 1]], [[2, 3]], [[1, 2]]], 0, 3], expected: false },
      { input: [3, [], 1, 1], expected: true },
      { input: [3, [], 1, 2], expected: false },
    ],
    hint: "A temporal path must respect the chronological order of contacts.",
  },
  {
    id: "graph-260",
    title: "Contact Tracing Exposure Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the distinct nodes exposed to a fixed infected set during a time window.\n\nFor snapshots with indices from start_time up to start_time + t - 1, every edge with an infected endpoint exposes the other endpoint. Return the number of exposed nodes that are not themselves infected. snapshots is a list of edge lists.",
    starterCode: `def contact_tracing_count(n, snapshots, infected, start_time, t):
    # Your code here
    pass`,
    solution: `def contact_tracing_count(n, snapshots, infected, start_time, t):
    infected_set = set(infected)
    exposed = set()
    for step in range(start_time, min(start_time + t, len(snapshots))):
        for u, v in snapshots[step]:
            if u in infected_set:
                exposed.add(v)
            if v in infected_set:
                exposed.add(u)
    exposed -= infected_set
    return len(exposed)`,
    testCases: [
      { input: [4, [[[0, 1], [2, 3]], [[1, 2]], [[0, 3]]], [0], 0, 2], expected: 1 },
      { input: [4, [[[0, 1], [2, 3]], [[1, 2]], [[0, 3]]], [1], 0, 3], expected: 2 },
      { input: [4, [[[0, 1], [2, 3]]], [0], 0, 1], expected: 1 },
      { input: [4, [[[0, 1]]], [2], 0, 1], expected: 0 },
    ],
    hint: "Contact tracing looks one snapshot window back from each confirmed case.",
  },
  {
    id: "graph-261",
    title: "Graph Transformer Positional Encoding",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute a walk-based positional encoding for every node.\n\nThe encoding of a node is the number of walks of length exactly k starting at it (summed over all endpoints). Compute it by repeatedly multiplying the all-ones vector by the adjacency matrix k times. edges is a list of [u, v] pairs. Return the encoding values in node order.",
    starterCode: `def positional_encoding(n, edges, k):
    # Your code here
    pass`,
    solution: `def positional_encoding(n, edges, k):
    A = [[0] * n for _ in range(n)]
    for u, v in edges:
        A[u][v] += 1
        A[v][u] += 1
    counts = [1] * n
    for _ in range(k):
        new = [0] * n
        for i in range(n):
            for j in range(n):
                if A[i][j]:
                    new[i] += A[i][j] * counts[j]
        counts = new
    return counts`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 2], expected: [4, 4, 4] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 1], expected: [1, 2, 2, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 1], expected: [2, 2, 2] },
      { input: [2, [], 2], expected: [0, 0] },
    ],
    hint: "Walk counts give each node a structural signature independent of node labels.",
  },
  {
    id: "graph-262",
    title: "Maximum Clique Branch Bound",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find a lexicographically smallest maximum clique with a branch-and-bound search.\n\nMaintain a candidate set, branch on the node with the most connections inside it, and prune when the current clique plus candidates cannot beat the best. Return the clique as a sorted list of nodes. edges is a list of [u, v] pairs and n is small.",
    starterCode: `def maximum_clique_branch_bound(n, edges):
    # Your code here
    pass`,
    solution: `def maximum_clique_branch_bound(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = []

    def expand(candidates, current):
        nonlocal best
        if not candidates:
            candidate = sorted(current)
            if len(candidate) > len(best) or (len(candidate) == len(best) and candidate < best):
                best = candidate
            return
        ordered = sorted(candidates, key=lambda x: (-len(adj[x] & candidates), x))
        while ordered:
            v = ordered.pop(0)
            expand(candidates & adj[v], current | {v})
            candidates = candidates - {v}
            if len(current) + len(candidates) <= len(best):
                return

    expand(set(range(n)), set())
    return best`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: [0, 1] },
      { input: [5, [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [2, 4]]], expected: [0, 1, 2] },
    ],
    hint: "Coloring-based bounds make maximum clique tractable far beyond the naive O(2^n).",
  },
  {
    id: "graph-263",
    title: "Chromatic Polynomial Small",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the proper colorings of an undirected graph with k colors using inclusion-exclusion over edge subsets.\n\nFor each subset S of edges, count k^(number of connected components of (V, S)) with sign (-1)^|S|. Return the resulting integer, which is the chromatic polynomial evaluated at k. edges is a list of [u, v] pairs.",
    starterCode: `def chromatic_polynomial(k, n, edges):
    # Your code here
    pass`,
    solution: `def chromatic_polynomial(k, n, edges):
    m = len(edges)
    total = 0
    for mask in range(1 << m):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        bits = 0
        for i in range(m):
            if mask & (1 << i):
                bits += 1
                a = find(edges[i][0])
                b = find(edges[i][1])
                if a != b:
                    parent[a] = b
        components = len({find(i) for i in range(n)})
        sign = -1 if bits % 2 == 1 else 1
        total += sign * (k ** components)
    return total`,
    testCases: [
      { input: [3, 3, [[0, 1], [1, 2], [2, 0]]], expected: 6 },
      { input: [2, 3, [[0, 1], [1, 2]]], expected: 2 },
      { input: [3, 4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 0 },
      { input: [4, 3, []], expected: 64 },
      { input: [2, 2, [[0, 1]]], expected: 2 },
    ],
    hint: "Inclusion-exclusion converts chromatic polynomial evaluation into component counting.",
  },
  {
    id: "graph-264",
    title: "Yen K-Shortest Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Return the costs of the k shortest simple paths from s to t in a small directed weighted graph.\n\nEnumerate all simple paths with DFS from s, collect their costs, sort them, and return the k smallest costs (or fewer when the graph has fewer paths). Return [] when t is unreachable. edges is a list of [u, v, w] triples.",
    starterCode: `def yen_k_shortest(n, edges, s, t, k):
    # Your code here
    pass`,
    solution: `def yen_k_shortest(n, edges, s, t, k):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    costs = []

    def dfs(node, visited, cost):
        if node == t:
            costs.append(cost)
            return
        for nxt, weight in adj[node]:
            if nxt not in visited:
                visited.add(nxt)
                dfs(nxt, visited, cost + weight)
                visited.discard(nxt)

    dfs(s, {s}, 0)
    costs.sort()
    return costs[:k]`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 5], [1, 2, 1]], 0, 3, 3], expected: [2, 6, 7] },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2, 3], expected: [2] },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 10]], 0, 3, 2], expected: [3, 10] },
    ],
    hint: "Yen's algorithm generates deviations from the shortest path instead of enumerating everything.",
  },
  {
    id: "graph-265",
    title: "Struct2Vec Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Rank nodes by structural similarity to a target using degree difference as a lightweight proxy.\n\nReturn all other nodes ordered by increasing absolute degree difference to the target, breaking ties by smallest index. edges is a list of [u, v] pairs and node is the target.",
    starterCode: `def struct2vec_lite(n, edges, node):
    # Your code here
    pass`,
    solution: `def struct2vec_lite(n, edges, node):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    order = sorted(range(n), key=lambda x: (abs(degree[x] - degree[node]), x))
    return [x for x in order if x != node]`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 2], [2, 3]], 0], expected: [1, 2, 3, 4] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 1], expected: [2, 0, 3] },
      { input: [3, [[0, 1], [1, 2]], 0], expected: [2, 1] },
    ],
    hint: "Struct2Vec captures structural identity rather than proximity in the graph.",
  },
  {
    id: "graph-266",
    title: "Network Resilience Remove-Node Check",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Measure the resilience impact of removing each node by counting the resulting connected components.\n\nFor every node, remove it, count components among the remaining nodes, and collect the counts in node order. Removing a node from an edgeless graph leaves isolated components. edges is a list of [u, v] pairs.",
    starterCode: `def node_removal_impact(n, edges):
    # Your code here
    pass`,
    solution: `def node_removal_impact(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    result = []
    for remove in range(n):
        seen = set()
        components = 0
        for start in range(n):
            if start == remove or start in seen:
                continue
            components += 1
            seen.add(start)
            stack = [start]
            while stack:
                x = stack.pop()
                for y in adj[x]:
                    if y != remove and y not in seen:
                        seen.add(y)
                        stack.append(y)
        result.append(components)
    return result`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [1, 2, 2, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [3, 1, 1, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1, 1, 1] },
      { input: [3, []], expected: [2, 2, 2] },
    ],
    hint: "Nodes whose removal fragments the network are the critical infrastructure.",
  },
  {
    id: "graph-267",
    title: "Percolation Threshold Check",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Estimate percolation behavior by randomly removing a fraction of nodes and measuring the largest remaining component.\n\nCall random.seed(seed), choose int(n * remove_fraction) distinct nodes to delete, and return the size of the largest connected component divided by n. Return 0.0 when nothing remains. edges is a list of [u, v] pairs.",
    starterCode: `import random
def percolation_check(n, edges, remove_fraction, seed):
    # Your code here
    pass`,
    solution: `import random
def percolation_check(n, edges, remove_fraction, seed):
    random.seed(seed)
    count = int(n * remove_fraction)
    removed = set(random.sample(range(n), min(count, n)))
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    seen = set()
    largest = 0
    for start in range(n):
        if start in removed or start in seen:
            continue
        seen.add(start)
        stack = [start]
        size = 0
        while stack:
            x = stack.pop()
            size += 1
            for y in adj[x]:
                if y not in removed and y not in seen:
                    seen.add(y)
                    stack.append(y)
        if size > largest:
            largest = size
    return largest / n if n else 0.0`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0.25, 42], expected: 0.75 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], 0.4, 7], expected: 0.6 },
      { input: [3, [[0, 1], [1, 2]], 0.0, 1], expected: 1.0 },
      { input: [2, [[0, 1]], 1.0, 5], expected: 0.0 },
    ],
    hint: "Percolation thresholds mark where the giant component suddenly disappears.",
  },
  {
    id: "graph-268",
    title: "Influence Blocking Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Simulate one step of influence spread with a blocked set that cannot be activated.\n\nSeeds try to activate all their neighbors, except seeds themselves, already-active nodes, and blocked nodes. Blocked nodes also cannot spread. Return the sorted list of newly activated nodes. edges is a list of [u, v] pairs.",
    starterCode: `def influence_blocking(n, edges, seeds, blocked):
    # Your code here
    pass`,
    solution: `def influence_blocking(n, edges, seeds, blocked):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    seed_set = set(seeds)
    blocked_set = set(blocked)
    activated = set()
    for s in seeds:
        for w in adj[s]:
            if w not in seed_set and w not in blocked_set:
                activated.add(w)
    return sorted(activated)`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [0], [1]], expected: [] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [2, 3]], [1], []], expected: [0] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [0, 2], [1]], expected: [3] },
    ],
    hint: "Blocking high-degree intermediaries halts cascades at their source.",
  },
  {
    id: "graph-269",
    title: "Cascade Depth Seeded",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Simulate an independent cascade and return the number of spreading rounds.\n\nIn each round, every newly active node tries to activate each inactive sorted neighbor independently with probability probabilities[v] using the seeded generator. Stop when no new nodes activate or after max_steps; return the number of completed rounds.",
    starterCode: `import random
def cascade_depth(n, edges, seeds, probabilities, seed, max_steps):
    # Your code here
    pass`,
    solution: `import random
def cascade_depth(n, edges, seeds, probabilities, seed, max_steps):
    random.seed(seed)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    active = set(seeds)
    depth = 0
    frontier = list(seeds)
    for _ in range(max_steps):
        new = set()
        for v in frontier:
            for w in sorted(adj[v]):
                if w not in active and random.random() < probabilities[v]:
                    new.add(w)
        if not new:
            break
        active.update(new)
        frontier = sorted(new)
        depth += 1
    return depth`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0], [1.0, 1.0, 1.0, 0.0], 42, 10], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0], [1.0, 1.0, 1.0, 1.0], 42, 10], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0], [0.0, 0.0, 0.0, 0.0], 42, 10], expected: 0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0], [0.5, 1.0, 1.0, 1.0], 42, 10], expected: 1 },
    ],
    hint: "Cascade depth measures how many generations an outbreak survives.",
  },
  {
    id: "graph-270",
    title: "Rumor Source Detection Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Guess the rumor source as the node minimizing the sum of shortest-path distances to the infected set.\n\nRun a BFS from every node, keep only nodes that can reach all infected nodes, and return the node with the smallest distance sum (ties by smallest index). Return -1 when no node can reach the whole infected set. edges is a list of [u, v] pairs.",
    starterCode: `def rumor_source_detection(n, edges, infected):
    # Your code here
    pass`,
    solution: `def rumor_source_detection(n, edges, infected):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    best = None
    for source in range(n):
        dist = [-1] * n
        dist[source] = 0
        queue = [source]
        head = 0
        while head < len(queue):
            v = queue[head]
            head += 1
            for w in adj[v]:
                if dist[w] == -1:
                    dist[w] = dist[v] + 1
                    queue.append(w)
        total = 0
        for node in infected:
            if dist[node] == -1:
                total = -1
                break
            total += dist[node]
        if total == -1:
            continue
        key = (total, source)
        if best is None or key < best[0]:
            best = (key, source)
    return best[1] if best is not None else -1`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 5]], [1, 3]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1]], expected: 0 },
      { input: [3, [[0, 1], [1, 2]], [2]], expected: 2 },
    ],
    hint: "The rumor center is a robust maximum-likelihood estimate under distance-based models.",
  },
];