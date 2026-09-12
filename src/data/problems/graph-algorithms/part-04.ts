import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-136",
    title: "Degree Buckets Summary",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Summarize the degree distribution of an undirected graph with n nodes.\n\nCount how many nodes have each degree, including degree 0, and return a list of [degree, count] pairs sorted by degree. edges is a list of [u, v] pairs.",
    starterCode: `def degree_buckets(n, edges):
    # Your code here
    pass`,
    solution: `def degree_buckets(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    counts = {}
    for d in degree:
        counts[d] = counts.get(d, 0) + 1
    return [[d, counts[d]] for d in sorted(counts)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[1, 2], [2, 1]] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[1, 2], [2, 2]] },
      { input: [3, []], expected: [[0, 3]] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [[3, 4]] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: [[2, 5]] },
    ],
    hint: "The degree distribution is one of the simplest graph fingerprints.",
  },
  {
    id: "graph-137",
    title: "Conductance of a Cut",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the conductance of a two-way partition of an undirected graph.\n\nLet A be the community containing node 0 and B all other nodes. The conductance is cut / min(vol(A), vol(B)), where vol is the sum of degrees in a side; return 0.0 when either volume is zero. edges is a list of [u, v] pairs and community maps nodes to labels.",
    starterCode: `def conductance(n, edges, community):
    # Your code here
    pass`,
    solution: `def conductance(n, edges, community):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    cut = 0
    for u, v in edges:
        if community[u] != community[v]:
            cut += 1
    side = community[0]
    vol_a = 0
    for i in range(n):
        if community[i] == side:
            vol_a += degree[i]
    total = sum(degree)
    vol_b = total - vol_a
    smaller = vol_a if vol_a < vol_b else vol_b
    if smaller == 0:
        return 0.0
    return cut / smaller`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 1, 1]], expected: 0.3333333333333333 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [0, 0, 1, 1]], expected: 0.6666666666666666 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 0, 0]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0, 1, 1, 1]], expected: 1.0 },
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]], [0, 0, 0, 1, 1, 1]], expected: 0.14285714285714285 },
    ],
    hint: "Normalizing by the smaller volume exposes bottlenecks even in unbalanced cuts.",
  },
  {
    id: "graph-138",
    title: "Expansion of a Set",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the edge expansion of a vertex subset S of an undirected graph: the number of edges crossing from S to its complement, divided by |S|.\n\nReturn 0.0 when S is empty or contains every node. edges is a list of [u, v] pairs and subset lists the nodes in S.",
    starterCode: `def expansion(n, edges, subset):
    # Your code here
    pass`,
    solution: `def expansion(n, edges, subset):
    inside = set(subset)
    if not inside or len(inside) == n:
        return 0.0
    boundary = 0
    for u, v in edges:
        if (u in inside) != (v in inside):
            boundary += 1
    return boundary / len(inside)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1]], expected: 0.5 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0]], expected: 1.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [0, 1]], expected: 2.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1, 2, 3]], expected: 0.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], []], expected: 0.0 },
    ],
    hint: "Small sets with many boundary edges are poor clusters.",
  },
  {
    id: "graph-139",
    title: "Partition Accuracy vs Ground Truth",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Measure how well a predicted partition matches ground truth labels by node-wise agreement.\n\nReturn the fraction of positions where predicted equals truth, or 0.0 when the lists are empty. predicted and truth are equal-length label lists.",
    starterCode: `def partition_accuracy(predicted, truth):
    # Your code here
    pass`,
    solution: `def partition_accuracy(predicted, truth):
    if not predicted:
        return 0.0
    same = 0
    for a, b in zip(predicted, truth):
        if a == b:
            same += 1
    return same / len(predicted)`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 0, 1, 1], [0, 1, 0, 1]], expected: 0.5 },
      { input: [[0, 1, 2], [0, 1, 2]], expected: 1.0 },
      { input: [[0, 1], [1, 0]], expected: 0.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Node-wise accuracy is strict about label identity, unlike NMI.",
  },
  {
    id: "graph-140",
    title: "Effective Resistance on a Tree",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the effective resistance between two nodes of a tree whose edges are unit resistors.\n\nOn a tree there is a unique path between any two nodes, so the resistance is simply the number of edges on it. Return 0 when u equals v. edges is a list of [u, v] pairs.",
    starterCode: `def tree_effective_resistance(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def tree_effective_resistance(n, edges, u, v):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    dist = [-1] * n
    dist[u] = 0
    queue = [u]
    head = 0
    while head < len(queue):
        x = queue[head]
        head += 1
        for y in adj[x]:
            if dist[y] == -1:
                dist[y] = dist[x] + 1
                queue.append(y)
    return dist[v]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 3], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], 0, 0], expected: 0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0, 1], expected: 1 },
    ],
    hint: "Series resistors add along the unique tree path.",
  },
  {
    id: "graph-141",
    title: "Commute Time Matrix Property Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Verify that a matrix is a valid commute time matrix.\n\nA commute time matrix must be square with zero diagonal, non-negative entries, and perfect symmetry (C[i][j] equals C[j][i]). Return True when all of these hold. matrix is a list of n lists of numbers.",
    starterCode: `def commute_time_symmetric(matrix):
    # Your code here
    pass`,
    solution: `def commute_time_symmetric(matrix):
    n = len(matrix)
    for i in range(n):
        if len(matrix[i]) != n:
            return False
        if matrix[i][i] != 0:
            return False
        for j in range(n):
            if matrix[i][j] < 0:
                return False
            if matrix[i][j] != matrix[j][i]:
                return False
    return True`,
    testCases: [
      { input: [[[0, 4, 8], [4, 0, 4], [8, 4, 0]]], expected: true },
      { input: [[[0, 4], [5, 0]]], expected: false },
      { input: [[[1, 2], [2, 0]]], expected: false },
      { input: [[[0, -1], [-1, 0]]], expected: false },
      { input: [[[0]]], expected: true },
    ],
    hint: "Commute time is symmetric even on directed graphs because it uses the underlying walk.",
  },
  {
    id: "graph-142",
    title: "Closed Walk Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count closed walks of length exactly k in an undirected graph: walks that start and end at the same node.\n\nThe count equals the trace of A^k, where A is the adjacency matrix. A length-0 walk counts once per node. If k is 0 return n. edges is a list of [u, v] pairs with each edge listed once.",
    starterCode: `def closed_walk_count(n, edges, k):
    # Your code here
    pass`,
    solution: `def closed_walk_count(n, edges, k):
    A = [[0] * n for _ in range(n)]
    for u, v in edges:
        A[u][v] += 1
        A[v][u] += 1

    def multiply(x, y):
        out = [[0] * n for _ in range(n)]
        for i in range(n):
            for t in range(n):
                if x[i][t]:
                    factor = x[i][t]
                    for j in range(n):
                        out[i][j] += factor * y[t][j]
        return out

    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    base = A
    e = k
    while e > 0:
        if e % 2 == 1:
            result = multiply(result, base)
        base = multiply(base, base)
        e //= 2
    return sum(result[i][i] for i in range(n))`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 3], expected: 6 },
      { input: [2, [[0, 1]], 2], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 4], expected: 32 },
      { input: [1, [], 5], expected: 0 },
      { input: [1, [], 0], expected: 1 },
    ],
    hint: "The trace of A^k counts closed walks because the diagonal restricts start and end to the same node.",
  },
  {
    id: "graph-143",
    title: "Arborescence Count 2-Node",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the spanning arborescences rooted at root in a directed graph with exactly two nodes.\n\nAn arborescence needs one directed path from the root to the other node, so simply count the edges that go from the root to the other node, including parallel edges. edges is a list of [u, v] pairs.",
    starterCode: `def arborescence_count_2node(edges, root):
    # Your code here
    pass`,
    solution: `def arborescence_count_2node(edges, root):
    other = 1 - root
    count = 0
    for u, v in edges:
        if u == root and v == other:
            count += 1
    return count`,
    testCases: [
      { input: [[[0, 1], [0, 1]], 0], expected: 2 },
      { input: [[[1, 0]], 0], expected: 0 },
      { input: [[[1, 0]], 1], expected: 1 },
      { input: [[[0, 1], [1, 0]], 1], expected: 1 },
      { input: [[], 0], expected: 0 },
    ],
    hint: "For two nodes the count is just the number of usable root-to-node edges.",
  },
  {
    id: "graph-144",
    title: "DAG All Paths Count DP",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the number of distinct directed paths from src to dst in a DAG with n nodes.\n\nProcess nodes in topological order and propagate the number of ways to reach each node: ways[src] starts at 1 and every edge adds ways[u] to ways[v]. If src cannot reach dst the count is 0. edges is a list of [u, v] pairs.",
    starterCode: `import heapq
def dag_all_paths(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `import heapq
def dag_all_paths(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
    heap = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        v = heapq.heappop(heap)
        order.append(v)
        for w in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    ways = [0] * n
    ways[src] = 1
    for v in order:
        if ways[v]:
            for w in adj[v]:
                ways[w] += ways[v]
    return ways[dst]`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [1, 3], [2, 3]], 0, 3], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 1 },
      { input: [3, [[0, 1]], 0, 2], expected: 0 },
    ],
    hint: "Path counts multiply and add along a topological order.",
  },
  {
    id: "graph-145",
    title: "DAG Reachability DP",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the set of nodes reachable from src in a DAG with n nodes.\n\nProcess nodes in reverse topological order and union each node's reachability with the reachability of its out-neighbors. Return the sorted list of reachable nodes, including src itself. edges is a list of [u, v] pairs.",
    starterCode: `import heapq
def dag_reachable(n, edges, src):
    # Your code here
    pass`,
    solution: `import heapq
def dag_reachable(n, edges, src):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
    heap = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        v = heapq.heappop(heap)
        order.append(v)
        for w in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    reach = [set() for _ in range(n)]
    for v in reversed(order):
        for w in adj[v]:
            reach[v].add(w)
            reach[v].update(reach[w])
    return sorted([src] + list(reach[src]))`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0], expected: [0, 1, 2, 3] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0], expected: [0] },
      { input: [3, [[0, 1]], 2], expected: [2] },
    ],
    hint: "Reverse topological order makes every successor already computed.",
  },
  {
    id: "graph-146",
    title: "Temporal Snapshot BFS",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute which nodes are reachable in a temporal graph given as a list of snapshots.\n\nStart at node src at time 0. For each of the first t snapshots in order, all edges of that snapshot can be traversed simultaneously; a node reached at time i may use snapshot i+1 next. Return the sorted list of nodes reachable by time t. snapshots is a list of edge lists.",
    starterCode: `def temporal_bfs(n, snapshots, src, t):
    # Your code here
    pass`,
    solution: `def temporal_bfs(n, snapshots, src, t):
    known = {src}
    for step in range(min(t, len(snapshots))):
        new = set()
        for u, v in snapshots[step]:
            if u in known and v not in known:
                new.add(v)
            if v in known and u not in known:
                new.add(u)
        known.update(new)
    return sorted(known)`,
    testCases: [
      { input: [4, [[[0, 1]], [[1, 2]], [[2, 3]]], 0, 3], expected: [0, 1, 2, 3] },
      { input: [4, [[[0, 1]], [[1, 2]], [[2, 3]]], 0, 1], expected: [0, 1] },
      { input: [4, [[[0, 1]], [[2, 3]], [[1, 2]]], 0, 3], expected: [0, 1, 2] },
      { input: [3, [], 1, 5], expected: [1] },
      { input: [4, [[[0, 1]], [[1, 2]], [[2, 3]]], 0, 0], expected: [0] },
    ],
    hint: "Time only moves forward, so a snapshot that has passed cannot be used later.",
  },
  {
    id: "graph-147",
    title: "Line Graph Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the line graph of an undirected graph: every original edge becomes a node, and two line-graph nodes are adjacent when the original edges share exactly one endpoint.\n\nedges is the original list of [u, v] pairs. Return the sorted adjacency lists of the line graph, whose node count is len(edges).",
    starterCode: `def line_graph(edges):
    # Your code here
    pass`,
    solution: `def line_graph(edges):
    m = len(edges)
    adj = [[] for _ in range(m)]
    for i in range(m):
        a, b = edges[i]
        for j in range(i + 1, m):
            c, d = edges[j]
            if len({a, b} & {c, d}) == 1:
                adj[i].append(j)
                adj[j].append(i)
    for lst in adj:
        lst.sort()
    return adj`,
    testCases: [
      { input: [[[0, 1], [1, 2], [0, 2]]], expected: [[1, 2], [0, 2], [0, 1]] },
      { input: [[[0, 1], [2, 3]]], expected: [[], []] },
      { input: [[[0, 1], [1, 2], [2, 3]]], expected: [[1], [0, 2], [1]] },
      { input: [[[0, 1]]], expected: [[]] },
    ],
    hint: "Edges sharing two endpoints are parallel edges and do not create line-graph adjacency here.",
  },
  {
    id: "graph-148",
    title: "Walk Count Length K",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count directed walks of length exactly k that start at src in a directed graph with n nodes.\n\nReturn the number of walks ending at each node, using dynamic programming over k steps: start with one walk at src and extend every walk along each outgoing edge. edges is a list of [u, v] pairs.",
    starterCode: `def walk_count_dp(n, edges, src, k):
    # Your code here
    pass`,
    solution: `def walk_count_dp(n, edges, src, k):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    counts = [0] * n
    counts[src] = 1
    for _ in range(k):
        new = [0] * n
        for v in range(n):
            if counts[v]:
                for w in adj[v]:
                    new[w] += counts[v]
        counts = new
    return counts`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 3], expected: [1, 0, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 4], expected: [0, 1, 0] },
      { input: [2, [[0, 1], [1, 0]], 0, 2], expected: [1, 0] },
      { input: [3, [[0, 1], [1, 2]], 0, 1], expected: [0, 1, 0] },
    ],
    hint: "The DP vector is exactly the row of A^k corresponding to the source.",
  },
  {
    id: "graph-149",
    title: "Bipartite Spectrum Symmetry Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a list of eigenvalues is symmetric about zero, a necessary condition for the adjacency spectrum of a graph to come from a bipartite graph.\n\nFor every value x there must be another value within tolerance of -x. Return a boolean. eigenvalues is a list of numbers and tol is the tolerance.",
    starterCode: `def spectrum_symmetry(eigenvalues, tol):
    # Your code here
    pass`,
    solution: `def spectrum_symmetry(eigenvalues, tol):
    for x in eigenvalues:
        found = False
        for y in eigenvalues:
            if abs(x + y) <= tol:
                found = True
                break
        if not found:
            return False
    return True`,
    testCases: [
      { input: [[2, 1, 0, -1, -2], 1e-9], expected: true },
      { input: [[2, 1, -1], 1e-9], expected: false },
      { input: [[0, 0], 1e-9], expected: true },
      { input: [[3], 1e-9], expected: false },
      { input: [[], 1e-9], expected: true },
    ],
    hint: "Symmetric spectra are a fingerprint of bipartiteness for connected graphs.",
  },
  {
    id: "graph-150",
    title: "Tree Maximum Matching Greedy",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the maximum matching size of a tree with n nodes.\n\nProcess nodes in reverse BFS order (leaves first): whenever a node and its parent are both unmatched, match them. This greedy is optimal on trees. edges is a list of [u, v] pairs and the tree is rooted at 0.",
    starterCode: `def tree_max_matching(n, edges):
    # Your code here
    pass`,
    solution: `def tree_max_matching(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    parent[0] = 0
    order = [0]
    head = 0
    while head < len(order):
        v = order[head]
        head += 1
        for w in adj[v]:
            if parent[w] == -1:
                parent[w] = v
                order.append(w)
    matched = [False] * n
    count = 0
    for v in reversed(order):
        p = parent[v]
        if v != 0 and not matched[v] and not matched[p]:
            matched[v] = True
            matched[p] = True
            count += 1
    return count`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
      { input: [2, [[0, 1]]], expected: 1 },
      { input: [1, []], expected: 0 },
    ],
    hint: "Matching a leaf with its parent never hurts: the parent has no better use.",
  },
  {
    id: "graph-151",
    title: "Tree Euler Tour Order",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the DFS preorder of a tree rooted at root, visiting smaller-index children first, together with subtree sizes.\n\nReturn [order, sizes] where order is the node sequence of the depth-first traversal and sizes[i] is the number of nodes in the subtree rooted at i. edges is a list of [u, v] pairs.",
    starterCode: `def tree_euler_tour(n, edges, root):
    # Your code here
    pass`,
    solution: `def tree_euler_tour(n, edges, root):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for lst in adj:
        lst.sort()
    parent = [-1] * n
    parent[root] = root
    order = []
    stack = [root]
    while stack:
        v = stack.pop()
        order.append(v)
        for w in reversed(adj[v]):
            if w != parent[v]:
                parent[w] = v
                stack.append(w)
    sizes = [1] * n
    for v in reversed(order):
        if v != root:
            sizes[parent[v]] += sizes[v]
    return [order, sizes]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0], expected: [[0, 1, 2, 3], [4, 3, 2, 1]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: [[0, 1, 2, 3], [4, 1, 1, 1]] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 1], expected: [[1, 0, 2, 3], [1, 4, 2, 1]] },
      { input: [1, [], 0], expected: [[0], [1]] },
    ],
    hint: "Subtree sizes fall out of the reverse preorder accumulation.",
  },
  {
    id: "graph-152",
    title: "Core-Periphery Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a labeled partition matches the idealized core-periphery model.\n\nThe core nodes must form a clique, the periphery nodes must be independent (no edges among them), and every periphery node must have at least one core neighbor. Return a boolean. edges is a list of [u, v] pairs and core is a 0/1 list marking core nodes.",
    starterCode: `def core_periphery_check(n, edges, core):
    # Your code here
    pass`,
    solution: `def core_periphery_check(n, edges, core):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    core_nodes = [i for i in range(n) if core[i] == 1]
    periphery = [i for i in range(n) if core[i] == 0]
    for i in range(len(core_nodes)):
        for j in range(i + 1, len(core_nodes)):
            if core_nodes[j] not in adj[core_nodes[i]]:
                return False
    for p in periphery:
        for q in periphery:
            if p != q and q in adj[p]:
                return False
        if not any(c in adj[p] for c in core_nodes):
            return False
    return True`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]], [1, 0, 0, 0]], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]], [1, 1, 1, 0]], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]], [0, 0, 0, 1]], expected: false },
      { input: [3, [[0, 1], [1, 2]], [1, 0, 1]], expected: false },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [1, 1, 0, 0]], expected: false },
    ],
    hint: "The idealized model has a dense core and a star-like periphery.",
  },
  {
    id: "graph-153",
    title: "Modularity Compare Two Partitions",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compare the modularity of two partitions of the same undirected graph.\n\nCompute Q = sum over communities of L_c / m - (d_c / (2m))^2, where L_c is the number of internal edges and d_c the total degree. Return [Qa, Qb, better] where better is 0 when Qa is at least Qb and 1 otherwise. edges is a list of [u, v] pairs.",
    starterCode: `def best_partition(n, edges, part_a, part_b):
    # Your code here
    pass`,
    solution: `def best_partition(n, edges, part_a, part_b):
    def quality(community):
        m = len(edges)
        if m == 0:
            return 0.0
        degree = [0] * n
        for u, v in edges:
            degree[u] += 1
            degree[v] += 1
        internal = {}
        for u, v in edges:
            if community[u] == community[v]:
                internal[community[u]] = internal.get(community[u], 0) + 1
        total = 0.0
        for c in set(community):
            tot = 0
            for i in range(n):
                if community[i] == c:
                    tot += degree[i]
            total += internal.get(c, 0) / m - (tot / (2.0 * m)) ** 2
        return total

    qa = quality(part_a)
    qb = quality(part_b)
    better = 0 if qa >= qb else 1
    return [qa, qb, better]`,
    testCases: [
      { input: [4, [[0, 1], [2, 3]], [0, 0, 1, 1], [0, 1, 0, 1]], expected: [0.5, -0.5, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 1, 1], [0, 1, 2, 3]], expected: [0.16666666666666663, -0.2777777777777778, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 0, 0], [0, 1, 0]], expected: [0.0, -0.2222222222222222, 0] },
    ],
    hint: "Higher modularity means communities capture more edges than chance would predict.",
  },
  {
    id: "graph-154",
    title: "Cheeger Check Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Verify the Cheeger inequality on a small graph: the edge conductance h(G) is at most sqrt(2 * lambda2), where lambda2 is the second smallest Laplacian eigenvalue.\n\nCompute h(G) by brute-forcing every non-trivial subset and its conductance. Return True when h(G) is at most the bound plus tol. edges is a list of [u, v] pairs.",
    starterCode: `import math
def cheeger_check(n, edges, spectral_gap, tol):
    # Your code here
    pass`,
    solution: `import math
def cheeger_check(n, edges, spectral_gap, tol):
    if n <= 1:
        return True
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    degree = [len(adj[i]) for i in range(n)]
    total_edges = len(edges)
    best = None
    for mask in range(1, (1 << n) - 1):
        inside = set()
        for i in range(n):
            if mask & (1 << i):
                inside.add(i)
        cut = 0
        for u in inside:
            for v in adj[u]:
                if v not in inside:
                    cut += 1
        vol = 0
        for i in inside:
            vol += degree[i]
        vol_other = 2 * total_edges - vol
        if vol == 0 or vol_other == 0:
            continue
        h = cut / min(vol, vol_other)
        if best is None or h < best:
            best = h
    if best is None:
        best = 0.0
    bound = math.sqrt(2.0 * spectral_gap)
    return best <= bound + tol`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2.0, 1e-9], expected: true },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 3.0, 1e-9], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0.01, 1e-9], expected: false },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0.5, 1e-9], expected: true },
    ],
    hint: "Cheeger relates the best cut to the spectral gap, both ways up to square roots.",
  },
  {
    id: "graph-155",
    title: "Heat Kernel Diffusion Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one explicit Euler step of heat diffusion on an undirected graph: x' = x - tau * L x, where L is the Laplacian and tau is the step size.\n\nReturn the updated signal in node order. edges is a list of [u, v] pairs, signal is the current value at each node, and tau is the step size.",
    starterCode: `def heat_kernel_step(n, edges, signal, tau):
    # Your code here
    pass`,
    solution: `def heat_kernel_step(n, edges, signal, tau):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    neighbor_sum = [0.0] * n
    for u, v in edges:
        neighbor_sum[u] += signal[v]
        neighbor_sum[v] += signal[u]
    return [signal[i] - tau * (degree[i] * signal[i] - neighbor_sum[i]) for i in range(n)]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], [1.0, 0.0, 0.0, 0.0], 0.5], expected: [0.0, 0.5, 0.0, 0.5] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [1.0, 1.0, 1.0], 1.0], expected: [1.0, 1.0, 1.0] },
      { input: [2, [[0, 1]], [2.0, 4.0], 0.25], expected: [2.5, 3.5] },
    ],
    hint: "Constant signals are stationary because the Laplacian annihilates them.",
  },
  {
    id: "graph-156",
    title: "Random Walk Diffusion Distance",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the diffusion distance between two nodes after t steps of the simple random walk.\n\nLet p_u(t) and p_v(t) be the distributions of the walk started at u and v. Return the Euclidean distance between these two distributions. edges is a list of [u, v] pairs.",
    starterCode: `import math
def diffusion_distance(n, edges, u, v, t):
    # Your code here
    pass`,
    solution: `import math
def diffusion_distance(n, edges, u, v, t):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def distribution(start):
        dist = [0.0] * n
        dist[start] = 1.0
        for _ in range(t):
            new = [0.0] * n
            for x in range(n):
                if dist[x]:
                    for y in adj[x]:
                        new[y] += dist[x] / len(adj[x])
            dist = new
        return dist

    pu = distribution(u)
    pv = distribution(v)
    return math.sqrt(sum((pu[i] - pv[i]) ** 2 for i in range(n)))`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 2, 1], expected: 0.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 1, 2], expected: 1.0 },
      { input: [3, [[0, 1], [1, 2]], 0, 2, 2], expected: 0.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 1, 2], expected: 1.0606601717798212 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 3, 1], expected: 1.4142135623730951 },
    ],
    hint: "Diffusion distance measures how distinguishable two starting points are after t steps.",
  },
  {
    id: "graph-157",
    title: "Electrical Flow One Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the current on every edge when one unit of current is injected at s and extracted at t in a graph with unit resistors.\n\nSolve the grounded Laplacian system to get node potentials, then return the current phi[u] - phi[v] for each edge in input order. edges is a list of [u, v] pairs.",
    starterCode: `def electrical_flow_step(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def electrical_flow_step(n, edges, s, t):
    lap = [[0.0] * n for _ in range(n)]
    for a, b in edges:
        lap[a][a] += 1
        lap[b][b] += 1
        lap[a][b] -= 1
        lap[b][a] -= 1
    idx = list(range(1, n))
    size = n - 1
    matrix = [[lap[i][j] for j in idx] for i in idx]
    rhs = []
    for i in idx:
        value = 0.0
        if i == s:
            value += 1.0
        if i == t:
            value -= 1.0
        rhs.append(value)
    for col in range(size):
        pivot = max(range(col, size), key=lambda r: abs(matrix[r][col]))
        matrix[col], matrix[pivot] = matrix[pivot], matrix[col]
        rhs[col], rhs[pivot] = rhs[pivot], rhs[col]
        pv = matrix[col][col]
        for j in range(col, size):
            matrix[col][j] /= pv
        rhs[col] /= pv
        for r in range(size):
            if r != col and matrix[r][col] != 0.0:
                factor = matrix[r][col]
                for j in range(col, size):
                    matrix[r][j] -= factor * matrix[col][j]
                rhs[r] -= factor * rhs[col]
    phi = [0.0] * n
    for k, i in enumerate(idx):
        phi[i] = rhs[k]
    return [phi[a] - phi[b] for a, b in edges]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: [1.0, 1.0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 2], expected: [0.5, 0.5, -0.5, -0.5] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: [-1.0, 1.0, 0.0] },
    ],
    hint: "Current flows downhill in potential and is conserved at every internal node.",
  },
  {
    id: "graph-158",
    title: "Dependency Projectivity Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a dependency tree is projective. arcs is a list of [head, dependent] pairs with positions 0 to n-1; use -1 as head for root nodes.\n\nAn arc h to d is projective when every position between h and d is a descendant of h. Build the tree, compute DFS entry and exit times, and test every arc. Return a boolean.",
    starterCode: `def is_projective(arcs, n):
    # Your code here
    pass`,
    solution: `def is_projective(arcs, n):
    children = [[] for _ in range(n)]
    has_head = [False] * n
    for h, d in arcs:
        if h != -1:
            children[h].append(d)
        has_head[d] = True
    tin = [0] * n
    tout = [0] * n
    timer = [0]

    def dfs(v):
        tin[v] = timer[0]
        timer[0] += 1
        for c in children[v]:
            dfs(c)
        tout[v] = timer[0] - 1

    for v in range(n):
        if not has_head[v]:
            dfs(v)
    for h, d in arcs:
        if h == -1:
            continue
        for k in range(min(h, d), max(h, d) + 1):
            if not (tin[h] <= tin[k] <= tout[h]):
                return False
    return True`,
    testCases: [
      { input: [[[0, 1], [1, 2]], 3], expected: true },
      { input: [[[0, 1], [0, 2], [1, 3], [2, 4]], 5], expected: false },
      { input: [[[0, 1], [0, 2], [1, 3]], 4], expected: false },
      { input: [[[0, 1], [0, 3], [1, 2]], 4], expected: true },
      { input: [[], 1], expected: true },
    ],
    hint: "Crossing arcs are exactly the non-projective configurations in dependency trees.",
  },
  {
    id: "graph-159",
    title: "DAG Shortest Path",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest paths in a directed acyclic graph in linear time, even with negative edge weights.\n\nProcess nodes in topological order and relax every outgoing edge. Return distances from src in node order, using -1 for unreachable nodes. edges is a list of [u, v, w] triples. Avoid tests whose reachable distance equals -1.",
    starterCode: `import heapq
def dag_shortest_path(n, edges, src):
    # Your code here
    pass`,
    solution: `import heapq
def dag_shortest_path(n, edges, src):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        in_degree[v] += 1
    heap = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        v = heapq.heappop(heap)
        order.append(v)
        for w, _ in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for v in order:
        if dist[v] == INF:
            continue
        for w, weight in adj[v]:
            if dist[v] + weight < dist[w]:
                dist[w] = dist[v] + weight
    return [d if d != INF else -1 for d in dist]`,
    testCases: [
      { input: [4, [[0, 1, 2], [0, 2, 5], [1, 2, -1], [2, 3, 3]], 0], expected: [0, 2, 1, 4] },
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]], 0], expected: [0, 1, 3, 6] },
      { input: [3, [[0, 1, 4]], 0], expected: [0, 4, -1] },
    ],
    hint: "Topological order means each node's distance is final before its edges are relaxed.",
  },
  {
    id: "graph-160",
    title: "Critical Path Slack",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the slack of every task in a weighted project DAG.\n\nFirst compute earliest start times in topological order. Then compute the project duration and latest start times in reverse order without delaying the finish. Slack is latest minus earliest; nodes with zero slack form the critical path. edges is a list of [u, v, w] triples.",
    starterCode: `import heapq
def critical_path_slack(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def critical_path_slack(n, edges):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        in_degree[v] += 1
    heap = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        v = heapq.heappop(heap)
        order.append(v)
        for w, _ in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    early = [0] * n
    for v in order:
        for w, weight in adj[v]:
            if early[v] + weight > early[w]:
                early[w] = early[v] + weight
    duration = max(early) if early else 0
    late = [duration] * n
    for v in reversed(order):
        for w, weight in adj[v]:
            if late[w] - weight < late[v]:
                late[v] = late[w] - weight
    return [late[i] - early[i] for i in range(n)]`,
    testCases: [
      { input: [4, [[0, 1, 3], [1, 3, 2], [0, 2, 2], [2, 3, 4]]], expected: [0, 1, 0, 0] },
      { input: [3, [[0, 1, 5], [1, 2, 3]]], expected: [0, 0, 0] },
      { input: [3, [[0, 1, 1], [0, 2, 10]]], expected: [0, 9, 0] },
    ],
    hint: "Slack is how long a task can wait without pushing the project end date.",
  },
  {
    id: "graph-161",
    title: "PERT Expected Duration",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute PERT expected durations for a list of activities.\n\nEach activity is [optimistic, likely, pessimistic] and its expected duration is (o + 4m + p) / 6. Return [durations, total] where durations lists every activity's expectation and total is their sum.",
    starterCode: `def pert_expected_duration(activities):
    # Your code here
    pass`,
    solution: `def pert_expected_duration(activities):
    durations = [(o + 4.0 * m + p) / 6.0 for o, m, p in activities]
    return [durations, sum(durations)]`,
    testCases: [
      { input: [[[2, 4, 6], [3, 5, 7]]], expected: [[4.0, 5.0], 9.0] },
      { input: [[[1, 1, 1], [6, 6, 6]]], expected: [[1.0, 6.0], 7.0] },
      { input: [[[2, 3, 10], [4, 4, 4]]], expected: [[4.0, 4.0], 8.0] },
    ],
    hint: "The beta distribution mean weights the most likely estimate four times.",
  },
  {
    id: "graph-162",
    title: "PERT Variance",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute PERT variances for a list of activities.\n\nEach activity is [optimistic, likely, pessimistic] and its variance is ((p - o) / 6)^2. Return [variances, total] where variances lists every activity's variance and total is their sum (assuming independent activities).",
    starterCode: `def pert_variance(activities):
    # Your code here
    pass`,
    solution: `def pert_variance(activities):
    variances = [((p - o) / 6.0) ** 2 for o, m, p in activities]
    return [variances, sum(variances)]`,
    testCases: [
      { input: [[[2, 4, 6], [3, 5, 7]]], expected: [[0.4444444444444444, 0.4444444444444444], 0.8888888888888888] },
      { input: [[[2, 3, 10], [4, 4, 4]]], expected: [[1.7777777777777777, 0.0], 1.7777777777777777] },
      { input: [[[1, 1, 1]]], expected: [[0.0], 0.0] },
    ],
    hint: "The wider the optimistic-pessimistic range, the larger the variance.",
  },
  {
    id: "graph-163",
    title: "Precedence Constraints Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Check whether a proposed task order satisfies all precedence constraints.\n\nEach constraint [a, b] means task a must appear before task b in order. Return False when a task is missing from order or when some constraint is violated. order is a permutation of task labels.",
    starterCode: `def precedence_feasible(order, constraints):
    # Your code here
    pass`,
    solution: `def precedence_feasible(order, constraints):
    position = {}
    for i, task in enumerate(order):
        position[task] = i
    for a, b in constraints:
        if a not in position or b not in position:
            return False
        if position[a] >= position[b]:
            return False
    return True`,
    testCases: [
      { input: [[0, 1, 2], [[0, 1], [1, 2]]], expected: true },
      { input: [[2, 1, 0], [[0, 1]]], expected: false },
      { input: [[1, 0], []], expected: true },
      { input: [[0, 1], [[0, 1], [1, 0]]], expected: false },
      { input: [[1, 2, 0], [[0, 2]]], expected: false },
    ],
    hint: "Map each task to its position once, then compare positions for every constraint.",
  },
  {
    id: "graph-164",
    title: "Evolving Graph Components Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Track the number of connected components as edges arrive over time.\n\ntimeline is a list of snapshots, each a list of undirected [u, v] edges. After adding each snapshot cumulatively, return the component count for that point in time; the number of nodes is one plus the largest node index seen anywhere.",
    starterCode: `def evolving_components(timeline):
    # Your code here
    pass`,
    solution: `def evolving_components(timeline):
    largest = -1
    for snapshot in timeline:
        for u, v in snapshot:
            if u > largest:
                largest = u
            if v > largest:
                largest = v
    n = largest + 1 if largest >= 0 else 1
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    result = []
    for snapshot in timeline:
        for u, v in snapshot:
            ru = find(u)
            rv = find(v)
            if ru != rv:
                parent[ru] = rv
        result.append(len({find(i) for i in range(n)}))
    return result`,
    testCases: [
      { input: [[[[0, 1]], [[2, 3]], [[1, 2]]]], expected: [3, 2, 1] },
      { input: [[[[0, 1], [2, 3], [4, 5]], [[1, 2]], [[3, 4]]]], expected: [3, 2, 1] },
      { input: [[[[0, 1]], [[0, 1]]]], expected: [1, 1] },
    ],
    hint: "Union-find handles incremental edge additions in near constant time each.",
  },
  {
    id: "graph-165",
    title: "Interval Graph Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether a graph is exactly the intersection graph of a given set of closed intervals.\n\nTwo nodes must be adjacent exactly when their intervals overlap (sharing an endpoint counts). Return a boolean. edges is a list of [u, v] pairs and intervals[i] is [start, end] for node i.",
    starterCode: `def is_interval_graph(n, edges, intervals):
    # Your code here
    pass`,
    solution: `def is_interval_graph(n, edges, intervals):
    edge_set = set()
    for u, v in edges:
        edge_set.add((u, v) if u < v else (v, u))
    for i in range(n):
        for j in range(i + 1, n):
            overlaps = intervals[i][0] <= intervals[j][1] and intervals[j][0] <= intervals[i][1]
            if overlaps != ((i, j) in edge_set):
                return False
    return True`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [0, 2]], [[0, 2], [1, 3], [2, 4]]], expected: true },
      { input: [3, [], [[0, 1], [2, 3], [4, 5]]], expected: true },
      { input: [3, [[0, 1], [1, 2]], [[0, 2], [1, 3], [2, 4]]], expected: false },
      { input: [3, [], [[0, 1], [1, 2], [2, 3]]], expected: false },
    ],
    hint: "Interval graphs are chordal, but this check goes straight at the overlap definition.",
  },
  {
    id: "graph-166",
    title: "Bipartite Double Cover",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build the bipartite double cover of an undirected graph with n nodes.\n\nThe cover has 2n nodes: (v, 0) and (v, 1) for every v. Each original edge u-v becomes edges between (u, 0) and (v, 1), and between (u, 1) and (v, 0). Number the cover nodes as v and n + v. Return the sorted adjacency lists of the 2n cover nodes. edges is a list of [u, v] pairs.",
    starterCode: `def bipartite_double_cover(n, edges):
    # Your code here
    pass`,
    solution: `def bipartite_double_cover(n, edges):
    adj = [[] for _ in range(2 * n)]
    for u, v in edges:
        adj[u].append(n + v)
        adj[n + v].append(u)
        adj[v].append(n + u)
        adj[n + u].append(v)
    for lst in adj:
        lst.sort()
    return adj`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[4], [3, 5], [4], [1], [0, 2], [1]] },
      { input: [2, [[0, 1]]], expected: [[3], [2], [1], [0]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[4, 5], [3, 5], [3, 4], [1, 2], [0, 2], [0, 1]] },
    ],
    hint: "The double cover is always bipartite, split by the second coordinate.",
  },
  {
    id: "graph-167",
    title: "Graph Motif 3-Node Census",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the two induced 3-node motifs of an undirected graph: triangles and open wedges.\n\nA triangle has three edges; an open wedge is a path of length two whose endpoints are not adjacent. Return [triangles, open_wedges]. edges is a list of [u, v] pairs.",
    starterCode: `def motif_3_census(n, edges):
    # Your code here
    pass`,
    solution: `def motif_3_census(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    triangles = 0
    for u in range(n):
        for v in adj[u]:
            if v > u:
                for w in adj[v]:
                    if w > v and w in adj[u]:
                        triangles += 1
    triples = sum(len(adj[i]) * (len(adj[i]) - 1) // 2 for i in range(n))
    return [triangles, triples - 3 * triangles]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1, 0] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [0, 3] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [1, 2] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]]], expected: [2, 4] },
    ],
    hint: "Every triple either closes into a triangle or stays an open wedge.",
  },
  {
    id: "graph-168",
    title: "Normalized Mutual Information Partitions",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compare two partitions of the same nodes with normalized mutual information.\n\nCompute NMI = I(A; B) / sqrt(H(A) * H(B)) using natural logarithms, where H is Shannon entropy of the label distribution and I is the mutual information. Return 0.0 when either partition has zero entropy. a and b are label lists of equal length.",
    starterCode: `import math
def normalized_mutual_information(a, b):
    # Your code here
    pass`,
    solution: `import math
def normalized_mutual_information(a, b):
    n = len(a)
    if n == 0:
        return 0.0

    def entropy(labels):
        counts = {}
        for x in labels:
            counts[x] = counts.get(x, 0) + 1
        h = 0.0
        for c in counts.values():
            p = c / n
            h -= p * math.log(p)
        return h

    count_a = {}
    count_b = {}
    joint = {}
    for i in range(n):
        count_a[a[i]] = count_a.get(a[i], 0) + 1
        count_b[b[i]] = count_b.get(b[i], 0) + 1
        joint[(a[i], b[i])] = joint.get((a[i], b[i]), 0) + 1
    mi = 0.0
    for (x, y), c in joint.items():
        pxy = c / n
        mi += pxy * math.log(pxy / ((count_a[x] / n) * (count_b[y] / n)))
    ha = entropy(a)
    hb = entropy(b)
    if ha == 0 or hb == 0:
        return 0.0
    return mi / math.sqrt(ha * hb)`,
    testCases: [
      { input: [[0, 0, 1, 1], [0, 0, 1, 1]], expected: 1.0 },
      { input: [[0, 0, 1, 1], [0, 1, 0, 1]], expected: 0.0 },
      { input: [[0, 0, 1, 2], [0, 1, 2, 0]], expected: 0.6666666666666667 },
      { input: [[0, 0, 1, 1, 2, 2], [0, 1, 0, 1, 2, 2]], expected: 0.579380164285695 },
      { input: [[0, 0, 0, 0], [0, 0, 0, 0]], expected: 0.0 },
    ],
    hint: "NMI is invariant to relabeling of the communities, unlike node accuracy.",
  },
  {
    id: "graph-169",
    title: "Spanning Tree Count via Matrix-Tree",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the spanning trees of a connected undirected graph with the Matrix-Tree theorem.\n\nBuild the Laplacian L, delete the first row and column, and compute the determinant of the cofactor with exact integer elimination. Return the count, or 0 when the graph is disconnected. edges is a list of [u, v] pairs.",
    starterCode: `def spanning_tree_count(n, edges):
    # Your code here
    pass`,
    solution: `def spanning_tree_count(n, edges):
    if n <= 1:
        return 1
    lap = [[0] * n for _ in range(n)]
    for u, v in edges:
        lap[u][u] += 1
        lap[v][v] += 1
        lap[u][v] -= 1
        lap[v][u] -= 1
    size = n - 1
    matrix = [[lap[i][j] for j in range(1, n)] for i in range(1, n)]
    sign = 1
    for col in range(size):
        pivot = -1
        for r in range(col, size):
            if matrix[r][col] != 0:
                pivot = r
                break
        if pivot == -1:
            return 0
        if pivot != col:
            matrix[col], matrix[pivot] = matrix[pivot], matrix[col]
            sign = -sign
        for r in range(col + 1, size):
            while matrix[r][col] != 0:
                factor = matrix[r][col] // matrix[col][col]
                for j in range(col, size):
                    matrix[r][j] -= factor * matrix[col][j]
                if matrix[r][col] != 0:
                    matrix[col], matrix[r] = matrix[r], matrix[col]
                    sign = -sign
    det = sign
    for i in range(size):
        det *= matrix[i][i]
    return abs(det)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 4 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 16 },
      { input: [2, [[0, 1]]], expected: 1 },
      { input: [4, [[0, 1], [2, 3]]], expected: 0 },
    ],
    hint: "Cayley's formula gives n^(n-2) trees for the complete graph.",
  },
  {
    id: "graph-170",
    title: "Minimum Arborescence Step Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Perform the first greedy step of the Chu-Liu/Edmonds minimum arborescence algorithm.\n\nFor every non-root node pick its cheapest incoming edge and sum the weights, then check whether the chosen edges form a cycle. Return [total_weight, has_cycle], or [-1, False] when some non-root node has no incoming edge. edges is a list of directed [u, v, w] triples.",
    starterCode: `def arborescence_greedy_step(n, edges, root):
    # Your code here
    pass`,
    solution: `def arborescence_greedy_step(n, edges, root):
    best = [-1] * n
    for u, v, w in edges:
        if v == root:
            continue
        if best[v] == -1 or w < best[v]:
            best[v] = w
    total = 0
    for v in range(n):
        if v == root:
            continue
        if best[v] == -1:
            return [-1, False]
        total += best[v]
    parent = [-1] * n
    for u, v, w in edges:
        if v != root and best[v] == w and parent[v] == -1:
            parent[v] = u
    for start in range(n):
        if start == root:
            continue
        seen = set()
        x = start
        while x != root and x not in seen:
            seen.add(x)
            x = parent[x]
        if x != root and x in seen:
            return [total, True]
    return [total, False]`,
    testCases: [
      { input: [3, [[0, 1, 2], [1, 2, 1], [0, 2, 5]], 0], expected: [3, false] },
      { input: [3, [[0, 1, 1], [1, 0, 1]], 0], expected: [-1, false] },
      { input: [3, [[0, 1, 3], [0, 2, 1], [2, 1, 1]], 0], expected: [2, false] },
      { input: [3, [[0, 1, 5], [2, 1, 1], [1, 2, 1]], 0], expected: [2, true] },
      { input: [2, [], 0], expected: [-1, false] },
    ],
    hint: "A cycle of cheapest incoming edges must be contracted in the full algorithm.",
  },
  {
    id: "graph-171",
    title: "Subgraph Isomorphism Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the (not necessarily induced) subgraphs of a graph that are isomorphic to a small pattern with m nodes.\n\nThe pattern is given by pattern_edges with nodes 0 to m-1, where m is one plus the largest endpoint. Backtrack over injective mappings of pattern nodes to graph nodes, requiring every pattern edge to map to an edge. Return the number of mappings; mappings that differ only by node labels count separately.",
    starterCode: `def subgraph_isomorphism_count(n, edges, pattern_edges):
    # Your code here
    pass`,
    solution: `def subgraph_isomorphism_count(n, edges, pattern_edges):
    m = 0
    for a, b in pattern_edges:
        m = max(m, a + 1, b + 1)
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    mapping = [-1] * m
    used = [False] * n
    count = [0]

    def valid(node):
        for a, b in pattern_edges:
            if a == node or b == node:
                other = b if a == node else a
                if mapping[other] != -1 and mapping[node] not in adj[mapping[other]]:
                    return False
        return True

    def backtrack(idx):
        if idx == m:
            count[0] += 1
            return
        for c in range(n):
            if used[c]:
                continue
            mapping[idx] = c
            if valid(idx):
                used[c] = True
                backtrack(idx + 1)
                used[c] = False
            mapping[idx] = -1

    backtrack(0)
    return count[0]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], [[0, 1], [1, 2]]], expected: 8 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [[0, 1], [1, 2], [0, 2]]], expected: 6 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [[0, 1], [0, 2]]], expected: 6 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [[0, 1]]], expected: 6 },
    ],
    hint: "Ordered mappings mean each pattern automorphism multiplies the count.",
  },
  {
    id: "graph-172",
    title: "Four-Node Motif Count Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count induced four-node paths P4 in an undirected graph with n nodes.\n\nA P4 is a set of four nodes that induces exactly a path of length three: the induced degrees must sort to [1, 1, 2, 2] and there must be exactly three induced edges. edges is a list of [u, v] pairs.",
    starterCode: `from itertools import combinations
def four_node_motif_count(n, edges):
    # Your code here
    pass`,
    solution: `from itertools import combinations
def four_node_motif_count(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    count = 0
    for combo in combinations(range(n), 4):
        degrees = []
        for v in combo:
            d = 0
            for w in combo:
                if w in adj[v]:
                    d += 1
            degrees.append(d)
        edge_count = sum(degrees) // 2
        if edge_count != 3:
            continue
        if sorted(degrees) == [1, 1, 2, 2]:
            count += 1
    return count`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 0 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 0 },
    ],
    hint: "The induced edge count and degree sequence together pin down the P4 shape.",
  },
  {
    id: "graph-173",
    title: "LCA Binary Lifting Build",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Build a binary lifting table for a tree with n nodes rooted at root, then answer lowest-common-ancestor queries.\n\nparent[k][v] is the 2^k-th ancestor of v. Lift the deeper node by depth difference, then raise both nodes together while their ancestors differ. Return the LCA for each [a, b] query in order. edges is a list of [u, v] pairs.",
    starterCode: `def lca_binary_lifting(n, edges, root, queries):
    # Your code here
    pass`,
    solution: `def lca_binary_lifting(n, edges, root, queries):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    levels = 1
    while (1 << levels) <= n:
        levels += 1
    parent = [[-1] * n for _ in range(levels)]
    depth = [-1] * n
    depth[root] = 0
    queue = [root]
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for w in adj[v]:
            if depth[w] == -1:
                depth[w] = depth[v] + 1
                parent[0][w] = v
                queue.append(w)
    for k in range(1, levels):
        for v in range(n):
            p = parent[k - 1][v]
            parent[k][v] = parent[k - 1][p] if p != -1 else -1

    def lca(a, b):
        if depth[a] < depth[b]:
            a, b = b, a
        diff = depth[a] - depth[b]
        bit = 0
        while diff:
            if diff & 1:
                a = parent[bit][a]
            diff >>= 1
            bit += 1
        if a == b:
            return a
        for k in range(levels - 1, -1, -1):
            if parent[k][a] != parent[k][b]:
                a = parent[k][a]
                b = parent[k][b]
        return parent[0][a]

    return [lca(a, b) for a, b in queries]`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 3], [1, 4]], 0, [[3, 4], [3, 2], [1, 2], [0, 4]]], expected: [1, 0, 0, 0] },
      { input: [3, [[0, 1], [1, 2]], 0, [[0, 2], [2, 2]]], expected: [0, 2] },
      { input: [3, [[0, 1], [0, 2]], 0, [[1, 2]]], expected: [0] },
      { input: [1, [], 0, [[0, 0]]], expected: [0] },
    ],
    hint: "Binary lifting reduces each LCA query to O(log n) ancestor jumps.",
  },
  {
    id: "graph-174",
    title: "Reroot DP Max Distance",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the eccentricity of every node of a tree with the rerooting technique.\n\nFirst compute downward heights with a post-order pass, then propagate best distances from the parent side using the two largest child heights. Return the maximum distance from each node. edges is a list of [u, v] pairs; the tree is rooted at 0 internally.",
    starterCode: `def reroot_max_distance(n, edges):
    # Your code here
    pass`,
    solution: `def reroot_max_distance(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    parent[0] = 0
    order = [0]
    head = 0
    while head < len(order):
        v = order[head]
        head += 1
        for w in adj[v]:
            if parent[w] == -1:
                parent[w] = v
                order.append(w)
    down = [0] * n
    for v in reversed(order):
        for w in adj[v]:
            if w != parent[v] and down[w] + 1 > down[v]:
                down[v] = down[w] + 1
    up = [0] * n
    for v in order:
        best1 = -1
        best2 = -1
        child1 = -1
        for w in adj[v]:
            if w != parent[v]:
                value = down[w] + 1
                if value > best1:
                    best2 = best1
                    best1 = value
                    child1 = w
                elif value > best2:
                    best2 = value
        for w in adj[v]:
            if w != parent[v]:
                if w == child1:
                    sibling = best2 + 1 if best2 >= 0 else 1
                else:
                    sibling = best1 + 1
                up[w] = max(up[v] + 1, sibling)
    return [max(down[i], up[i]) for i in range(n)]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [3, 2, 2, 3] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1, 2, 2, 2] },
      { input: [1, []], expected: [0] },
      { input: [2, [[0, 1]]], expected: [1, 1] },
    ],
    hint: "Each node uses the best child path plus the best path through its parent.",
  },
  {
    id: "graph-175",
    title: "Tree Isomorphism AHU Canonical Form",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Decide whether two unrooted trees are isomorphic using AHU canonical forms.\n\nRoot each tree at every minimum-degree candidate, encode each rooted tree bottom-up with sorted child encodings in parentheses, and take the lexicographically smallest encoding as the tree's canonical form. Return True when the two canonical forms are equal. n1, edges1, n2, edges2 describe the two trees.",
    starterCode: `def tree_isomorphism(n1, edges1, n2, edges2):
    # Your code here
    pass`,
    solution: `def tree_isomorphism(n1, edges1, n2, edges2):
    if n1 != n2:
        return False

    def canonical(n, edges):
        adj = [set() for _ in range(n)]
        for u, v in edges:
            adj[u].add(v)
            adj[v].add(u)

        def rooted_encoding(root):
            parent = [-1] * n
            parent[root] = root
            order = [root]
            head = 0
            while head < len(order):
                v = order[head]
                head += 1
                for w in adj[v]:
                    if parent[w] == -1:
                        parent[w] = v
                        order.append(w)
            labels = [""] * n
            for v in reversed(order):
                parts = sorted(labels[w] for w in adj[v] if w != parent[v])
                labels[v] = "(" + "".join(parts) + ")"
            return labels[root]

        degree = [len(adj[i]) for i in range(n)]
        minimum = min(degree)
        candidates = [i for i in range(n) if degree[i] == minimum]
        return min(rooted_encoding(c) for c in candidates)

    return canonical(n1, edges1) == canonical(n2, edges2)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 4, [[3, 2], [2, 1], [1, 0]]], expected: true },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 4, [[0, 1], [1, 2], [1, 3]]], expected: true },
      { input: [3, [[0, 1], [1, 2]], 3, [[0, 1], [0, 2]]], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 3, [[0, 1], [1, 2]]], expected: false },
    ],
    hint: "Canonical parenthesized encodings make isomorphism a string comparison.",
  },
  {
    id: "graph-176",
    title: "Temporal Centrality Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute temporal reachability for every node of an evolving undirected graph.\n\nA temporal path from v starts at time 0 and may traverse at most one snapshot per time step in order, using edges from the current snapshot only. For each node count how many nodes are temporally reachable (including itself). snapshots is a list of edge lists.",
    starterCode: `def temporal_centrality(n, snapshots):
    # Your code here
    pass`,
    solution: `def temporal_centrality(n, snapshots):
    result = [0] * n
    for src in range(n):
        known = {src}
        for snapshot in snapshots:
            new = set()
            for u, v in snapshot:
                if u in known and v not in known:
                    new.add(v)
                if v in known and u not in known:
                    new.add(u)
            known.update(new)
        result[src] = len(known)
    return result`,
    testCases: [
      { input: [4, [[[0, 1]], [[1, 2]], [[2, 3]]]], expected: [4, 4, 3, 2] },
      { input: [4, [[[0, 1], [2, 3]], [[1, 2]]]], expected: [3, 3, 3, 3] },
      { input: [3, []], expected: [1, 1, 1] },
    ],
    hint: "Missing a snapshot window can make a temporally central node unreachable.",
  },
  {
    id: "graph-177",
    title: "Tree Centroid Find",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find a centroid of a tree with n nodes: a node whose removal leaves components of size at most n/2.\n\nFor every candidate root compute subtree sizes and the largest resulting component; return the candidate with the smallest largest component, breaking ties by smallest index. edges is a list of [u, v] pairs.",
    starterCode: `def tree_centroid(n, edges):
    # Your code here
    pass`,
    solution: `def tree_centroid(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = None
    for root in range(n):
        parent = [-1] * n
        parent[root] = root
        order = [root]
        head = 0
        while head < len(order):
            v = order[head]
            head += 1
            for w in adj[v]:
                if parent[w] == -1:
                    parent[w] = v
                    order.append(w)
        size = [1] * n
        for v in reversed(order):
            if v != root:
                size[parent[v]] += size[v]
        largest = n - size[root]
        for v in range(n):
            if v != root and size[v] > largest:
                largest = size[v]
        if best is None or largest < best[0]:
            best = (largest, root)
    return best[1]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 0 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
    ],
    hint: "A tree has one centroid or two adjacent centroids.",
  },
  {
    id: "graph-178",
    title: "Tree Path Sum Prefix Counts",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the unordered pairs of distinct nodes in a tree whose node-value sum equals target.\n\nFor every start node, explore the tree with a stack carrying the running path sum and count endpoints greater than the start whose sum matches. values[i] is the value of node i. edges is a list of [u, v] pairs.",
    starterCode: `def tree_path_sum_counts(n, edges, values, target):
    # Your code here
    pass`,
    solution: `def tree_path_sum_counts(n, edges, values, target):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    count = 0
    for start in range(n):
        stack = [(start, -1, values[start])]
        while stack:
            v, prev, total = stack.pop()
            if v > start and total == target:
                count += 1
            for w in adj[v]:
                if w != prev:
                    stack.append((w, v, total + values[w]))
    return count`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [1, 2, 3, 4], 5], expected: 1 },
      { input: [3, [[0, 1], [1, 2]], [1, 1, 1], 2], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], [1, 2, 3], 3], expected: 1 },
    ],
    hint: "Paths in a tree are unique, so a DFS from each start enumerates them all.",
  },
  {
    id: "graph-179",
    title: "Difference Array on Tree",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many given paths cover each node of a tree using the standard difference trick.\n\nFor each path u-v add 1 at u and v, subtract 1 at their LCA, and subtract 1 at the LCA's parent; then accumulate counts upward in reverse BFS order. Return the coverage count of every node. edges is a list of [u, v] pairs and paths is a list of endpoint pairs; the tree is rooted at 0.",
    starterCode: `def tree_difference_counts(n, edges, paths):
    # Your code here
    pass`,
    solution: `def tree_difference_counts(n, edges, paths):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-1] * n
    depth = [-1] * n
    parent[0] = 0
    depth[0] = 0
    order = [0]
    head = 0
    while head < len(order):
        v = order[head]
        head += 1
        for w in adj[v]:
            if depth[w] == -1:
                depth[w] = depth[v] + 1
                parent[w] = v
                order.append(w)

    def lca(a, b):
        while depth[a] > depth[b]:
            a = parent[a]
        while depth[b] > depth[a]:
            b = parent[b]
        while a != b:
            a = parent[a]
            b = parent[b]
        return a

    diff = [0] * n
    for u, v in paths:
        l = lca(u, v)
        diff[u] += 1
        diff[v] += 1
        diff[l] -= 1
        if parent[l] != l:
            diff[parent[l]] -= 1
    counts = [0] * n
    for v in reversed(order):
        counts[v] += diff[v]
        if parent[v] != v:
            counts[parent[v]] += counts[v]
    return counts`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [[0, 3], [1, 2]]], expected: [1, 2, 2, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [[1, 2], [1, 3]]], expected: [2, 2, 1, 1] },
      { input: [3, [[0, 1], [1, 2]], [[0, 2], [0, 1]]], expected: [2, 2, 1] },
    ],
    hint: "The four-point update makes each path contribute exactly on its nodes.",
  },
  {
    id: "graph-180",
    title: "Graph Quotient Contraction Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build the quotient graph obtained by contracting nodes that share a group label.\n\ngroups[v] is the supernode label of node v. Collect all edges between different groups, deduplicate them, drop self-loops, and return them as a sorted list of [a, b] pairs with a < b. edges is a list of [u, v] pairs.",
    starterCode: `def contract_vertices(n, edges, groups):
    # Your code here
    pass`,
    solution: `def contract_vertices(n, edges, groups):
    seen = set()
    for u, v in edges:
        a = groups[u]
        b = groups[v]
        if a == b:
            continue
        if a > b:
            a, b = b, a
        seen.add((a, b))
    return sorted([a, b] for a, b in seen)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 1, 1]], expected: [[0, 1]] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 0, 0]], expected: [] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [0, 1, 0, 1, 0]], expected: [[0, 1]] },
    ],
    hint: "Contraction replaces each group by a supernode and keeps inter-group links.",
  },
];
