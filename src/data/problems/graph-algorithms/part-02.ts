import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-046",
    title: "Eulerian Path Existence",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether an undirected graph with n nodes has an Eulerian path: a trail that visits every edge exactly once.\n\nedges is a list of [u, v] pairs. Ignoring isolated nodes, the graph must be connected and have either 0 or 2 odd-degree nodes. Return a boolean.",
    starterCode: `def has_eulerian_path(n, edges):
    # Your code here
    pass`,
    solution: `def has_eulerian_path(n, edges):
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    active = [i for i in range(n) if degree[i] > 0]
    if not active:
        return True
    seen = {active[0]}
    stack = [active[0]]
    while stack:
        x = stack.pop()
        for y in adj[x]:
            if y not in seen:
                seen.add(y)
                stack.append(y)
    if any(v not in seen for v in active):
        return False
    odd = sum(1 for d in degree if d % 2 == 1)
    return odd == 0 or odd == 2`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: true },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: false },
      { input: [6, [[0, 1], [1, 2], [3, 4], [4, 5]]], expected: false },
      { input: [1, []], expected: true },
    ],
    hint: "Connectivity of all non-isolated nodes plus 0 or 2 odd degrees is necessary and sufficient.",
  },
  {
    id: "graph-047",
    title: "Eulerian Circuit Existence",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether an undirected graph with n nodes has an Eulerian circuit: a closed trail that visits every edge exactly once.\n\nedges is a list of [u, v] pairs. All nodes with nonzero degree must form one connected component and every degree must be even.",
    starterCode: `def has_eulerian_circuit(n, edges):
    # Your code here
    pass`,
    solution: `def has_eulerian_circuit(n, edges):
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    active = [i for i in range(n) if degree[i] > 0]
    if not active:
        return True
    seen = {active[0]}
    stack = [active[0]]
    while stack:
        x = stack.pop()
        for y in adj[x]:
            if y not in seen:
                seen.add(y)
                stack.append(y)
    if any(v not in seen for v in active):
        return False
    return all(d % 2 == 0 for d in degree)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { input: [3, [[0, 1], [1, 2]]], expected: false },
      { input: [6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]], expected: false },
      { input: [1, []], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]], expected: false },
    ],
    hint: "An Eulerian circuit needs every degree even and all edges in one component.",
  },
  {
    id: "graph-048",
    title: "Hamiltonian Path Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether an undirected graph with n nodes contains a Hamiltonian path: a path that visits every node exactly once.\n\nUse backtracking from every possible start node, pruning with visited sets. edges is a list of [u, v] pairs and n is small.",
    starterCode: `def has_hamiltonian_path(n, edges):
    # Your code here
    pass`,
    solution: `def has_hamiltonian_path(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)

    def search(v, visited, count):
        if count == n:
            return True
        for w in adj[v]:
            if w not in visited:
                visited.add(w)
                if search(w, visited, count + 1):
                    return True
                visited.remove(w)
        return False

    for start in range(n):
        if search(start, {start}, 1):
            return True
    return False`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: true },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: false },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: true },
      { input: [4, [[0, 1], [2, 3]]], expected: false },
      { input: [1, []], expected: true },
    ],
    hint: "A node of degree 1 must be an endpoint of any Hamiltonian path.",
  },
  {
    id: "graph-049",
    title: "TSP Nearest-Neighbor Tour",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build a TSP tour with the nearest-neighbor heuristic. dist is a symmetric n by n matrix of travel costs.\n\nStart at city 0 and repeatedly move to the closest unvisited city, breaking ties by the smallest index, and finally return from the last city to city 0. Return [tour, total_cost] where tour lists the cities in visited order.",
    starterCode: `def tsp_nearest_neighbor(dist):
    # Your code here
    pass`,
    solution: `def tsp_nearest_neighbor(dist):
    n = len(dist)
    if n == 1:
        return [[0], 0]
    visited = [False] * n
    visited[0] = True
    tour = [0]
    total = 0
    current = 0
    for _ in range(n - 1):
        best = -1
        for j in range(n):
            if not visited[j] and (best == -1 or dist[current][j] < dist[current][best]):
                best = j
        total += dist[current][best]
        tour.append(best)
        visited[best] = True
        current = best
    total += dist[current][0]
    return [tour, total]`,
    testCases: [
      { input: [[[0, 1, 4, 5], [1, 0, 2, 3], [4, 2, 0, 1], [5, 3, 1, 0]]], expected: [[0, 1, 2, 3], 9] },
      { input: [[[0]]], expected: [[0], 0] },
      { input: [[[0, 3], [3, 0]]], expected: [[0, 1], 6] },
      {
        input: [[[0, 3, 4, 5, 2], [3, 0, 2, 6, 3], [4, 2, 0, 1, 5], [5, 6, 1, 0, 4], [2, 3, 5, 4, 0]]],
        expected: [[0, 4, 1, 2, 3], 13],
      },
    ],
    hint: "Greedily pick the cheapest unvisited city at each step, then close the loop.",
  },
  {
    id: "graph-050",
    title: "TSP 2-Opt Improvement Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Apply the single best 2-opt improvement to a closed TSP tour. dist is a symmetric n by n matrix and tour lists all n cities (the final edge closes back to tour[0]).\n\nFor every pair i < j with j >= i + 2, reversing tour[i+1..j] replaces edges (i, i+1) and (j, j+1) with (i, j) and (i+1, j+1), using cyclic indices. Choose the swap with the smallest negative delta and return the resulting tour; if no swap improves the tour, return it unchanged.",
    starterCode: `def tsp_two_opt_step(dist, tour):
    # Your code here
    pass`,
    solution: `def tsp_two_opt_step(dist, tour):
    n = len(tour)
    best_delta = 0
    best = list(tour)
    for i in range(n - 1):
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            a, b = tour[i], tour[i + 1]
            c, d = tour[j], tour[(j + 1) % n]
            delta = dist[a][c] + dist[b][d] - dist[a][b] - dist[c][d]
            if delta < best_delta:
                best_delta = delta
                best = tour[:i + 1] + tour[i + 1:j + 1][::-1] + tour[j + 1:]
    return best`,
    testCases: [
      {
        input: [[[0, 1, 4, 5], [1, 0, 2, 3], [4, 2, 0, 1], [5, 3, 1, 0]], [0, 2, 1, 3]],
        expected: [0, 1, 2, 3],
      },
      {
        input: [[[0, 1, 4, 5], [1, 0, 2, 3], [4, 2, 0, 1], [5, 3, 1, 0]], [0, 1, 2, 3]],
        expected: [0, 1, 2, 3],
      },
      {
        input: [[[0, 3, 4, 5, 2], [3, 0, 2, 6, 3], [4, 2, 0, 1, 5], [5, 6, 1, 0, 4], [2, 3, 5, 4, 0]], [0, 2, 1, 3, 4]],
        expected: [0, 1, 2, 3, 4],
      },
      {
        input: [[[0, 3, 4, 5, 2], [3, 0, 2, 6, 3], [4, 2, 0, 1, 5], [5, 6, 1, 0, 4], [2, 3, 5, 4, 0]], [0, 3, 1, 2, 4]],
        expected: [0, 3, 2, 1, 4],
      },
    ],
    hint: "Reversing a segment only changes the two edges at its ends, so compare each delta in O(1).",
  },
  {
    id: "graph-051",
    title: "MST Cut Property Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the lightest edge crossing the cut defined by a vertex subset, which by the cut property belongs to some minimum spanning tree.\n\nedges is a list of [u, v, w] triples for an undirected weighted graph and subset lists the vertices on one side. Return [u, v, w] for the crossing edge with the smallest weight, sorting the endpoints and breaking ties by smaller u then v. Return [] when no edge crosses the cut.",
    starterCode: `def lightest_crossing_edge(n, edges, subset):
    # Your code here
    pass`,
    solution: `def lightest_crossing_edge(n, edges, subset):
    inside = set(subset)
    best = None
    for u, v, w in edges:
        if (u in inside) != (v in inside):
            a, b = (u, v) if u < v else (v, u)
            candidate = (w, a, b)
            if best is None or candidate < best:
                best = candidate
    if best is None:
        return []
    return [best[1], best[2], best[0]]`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4]], [0, 1]], expected: [1, 2, 2] },
      { input: [4, [[0, 1, 5], [0, 2, 2], [0, 3, 9]], [0]], expected: [0, 2, 2] },
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]], [0, 1, 2, 3]], expected: [] },
      { input: [4, [[0, 1, 3], [1, 2, 1], [2, 3, 7], [3, 0, 1]], [0, 3]], expected: [0, 1, 3] },
    ],
    hint: "Scan all edges and keep the minimum among those with exactly one endpoint in the subset.",
  },
  {
    id: "graph-052",
    title: "All-Pairs Shortest via Repeated Dijkstra",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute all-pairs shortest paths in a directed weighted graph with non-negative weights by running Dijkstra from every node.\n\nedges is a list of [u, v, w] triples. Return an n by n matrix of distances with 0 on the diagonal and -1 for unreachable pairs.",
    starterCode: `import heapq
def all_pairs_dijkstra(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def all_pairs_dijkstra(n, edges):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    result = []
    for src in range(n):
        dist = [-1] * n
        dist[src] = 0
        heap = [(0, src)]
        while heap:
            d, v = heapq.heappop(heap)
            if d > dist[v]:
                continue
            for w, weight in adj[v]:
                nd = d + weight
                if dist[w] == -1 or nd < dist[w]:
                    dist[w] = nd
                    heapq.heappush(heap, (nd, w))
        result.append(dist)
    return result`,
    testCases: [
      {
        input: [4, [[0, 1, 1], [1, 2, 2], [2, 0, 4], [2, 3, 1], [3, 0, 3]]],
        expected: [[0, 1, 3, 4], [6, 0, 2, 3], [4, 5, 0, 1], [3, 4, 6, 0]],
      },
      { input: [2, [[0, 1, 7]]], expected: [[0, 7], [-1, 0]] },
      { input: [3, []], expected: [[0, -1, -1], [-1, 0, -1], [-1, -1, 0]] },
      { input: [3, [[0, 1, 2], [0, 1, 1], [1, 2, 5]]], expected: [[0, 1, 6], [-1, 0, 5], [-1, -1, 0]] },
    ],
    hint: "Keep the minimum parallel edge for each ordered pair before relaxing.",
  },
  {
    id: "graph-053",
    title: "Transitive Closure",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the transitive closure of a directed graph with n nodes as an n by n 0/1 matrix.\n\nCell [i][j] is 1 when there is a directed path from i to j using at least one edge, so the diagonal is 1 exactly for nodes lying on a cycle. edges is a list of [u, v] pairs.",
    starterCode: `def transitive_closure(n, edges):
    # Your code here
    pass`,
    solution: `def transitive_closure(n, edges):
    reach = [[False] * n for _ in range(n)]
    for u, v in edges:
        reach[u][v] = True
    for k in range(n):
        for i in range(n):
            if reach[i][k]:
                for j in range(n):
                    if reach[k][j]:
                        reach[i][j] = True
    return [[1 if reach[i][j] else 0 for j in range(n)] for i in range(n)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0, 1, 1], [0, 0, 1], [0, 0, 0]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
      { input: [3, []], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      { input: [2, [[0, 0]]], expected: [[1, 0], [0, 0]] },
      { input: [4, [[0, 1], [2, 3], [1, 2]]], expected: [[0, 1, 1, 1], [0, 0, 1, 1], [0, 0, 0, 1], [0, 0, 0, 0]] },
    ],
    hint: "Floyd-Warshall reachability: if i reaches k and k reaches j, then i reaches j.",
  },
  {
    id: "graph-054",
    title: "Warshall Reachability",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the reflexive reachability sets of a directed graph with the Warshall algorithm.\n\nReturn a list of n sorted lists; the i-th list contains every node reachable from i through zero or more edges, so it always includes i itself. edges is a list of [u, v] pairs.",
    starterCode: `def warshall_reachability(n, edges):
    # Your code here
    pass`,
    solution: `def warshall_reachability(n, edges):
    reach = [[False] * n for _ in range(n)]
    for i in range(n):
        reach[i][i] = True
    for u, v in edges:
        reach[u][v] = True
    for k in range(n):
        for i in range(n):
            if reach[i][k]:
                for j in range(n):
                    if reach[k][j]:
                        reach[i][j] = True
    return [[j for j in range(n) if reach[i][j]] for i in range(n)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0, 1, 2], [1, 2], [2]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[0, 1, 2], [0, 1, 2], [0, 1, 2]] },
      { input: [3, []], expected: [[0], [1], [2]] },
      { input: [4, [[0, 1], [2, 3], [1, 2]]], expected: [[0, 1, 2, 3], [1, 2, 3], [2, 3], [3]] },
    ],
    hint: "Initialize the diagonal to True so each node reaches itself.",
  },
  {
    id: "graph-055",
    title: "Tarjan SCC Iterative Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the strongly connected components of a directed graph with n nodes using an iterative Tarjan algorithm.\n\nTrack discovery indices, low-link values, and an explicit DFS work stack so no recursion is used. When low[v] equals index[v], pop the component off the component stack. edges is a list of [u, v] pairs.",
    starterCode: `def tarjan_scc_count(n, edges):
    # Your code here
    pass`,
    solution: `def tarjan_scc_count(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    index = [-1] * n
    low = [0] * n
    on_stack = [False] * n
    stack = []
    counter = [0]
    count = 0
    for start in range(n):
        if index[start] != -1:
            continue
        work = [(start, 0)]
        while work:
            v, i = work[-1]
            if i == 0:
                index[v] = counter[0]
                low[v] = counter[0]
                counter[0] += 1
                stack.append(v)
                on_stack[v] = True
            if i < len(adj[v]):
                w = adj[v][i]
                work[-1] = (v, i + 1)
                if index[w] == -1:
                    work.append((w, 0))
                elif on_stack[w]:
                    low[v] = min(low[v], index[w])
            else:
                work.pop()
                if work:
                    parent = work[-1][0]
                    low[parent] = min(low[parent], low[v])
                if low[v] == index[v]:
                    count += 1
                    while True:
                        w = stack.pop()
                        on_stack[w] = False
                        if w == v:
                            break
    return count`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 3]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 4 },
      { input: [1, []], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0], [0, 2]]], expected: 1 },
      { input: [6, [[0, 1], [1, 2], [2, 1], [3, 4], [4, 5], [5, 3], [1, 3]]], expected: 3 },
    ],
    hint: "Emit an SCC whenever low[v] == index[v] and pop the component stack down to v.",
  },
  {
    id: "graph-056",
    title: "Condensation DAG Edge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the distinct edges of the condensation: the DAG obtained by contracting every strongly connected component of a directed graph into one node.\n\nCompute components with Kosaraju, then count unique ordered pairs (C1, C2) with C1 different from C2 that contain at least one original edge. edges is a list of [u, v] pairs.",
    starterCode: `def condensation_edge_count(n, edges):
    # Your code here
    pass`,
    solution: `def condensation_edge_count(n, edges):
    adj = [[] for _ in range(n)]
    radj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        radj[v].append(u)
    visited = [False] * n
    order = []
    for start in range(n):
        if visited[start]:
            continue
        stack = [(start, 0)]
        visited[start] = True
        while stack:
            v, i = stack[-1]
            if i < len(adj[v]):
                w = adj[v][i]
                stack[-1] = (v, i + 1)
                if not visited[w]:
                    visited[w] = True
                    stack.append((w, 0))
            else:
                order.append(v)
                stack.pop()
    comp = [-1] * n
    component = 0
    for start in reversed(order):
        if comp[start] != -1:
            continue
        comp[start] = component
        stack = [start]
        while stack:
            v = stack.pop()
            for w in radj[v]:
                if comp[w] == -1:
                    comp[w] = component
                    stack.append(w)
        component += 1
    pairs = set()
    for u, v in edges:
        if comp[u] != comp[v]:
            pairs.add((comp[u], comp[v]))
    return len(pairs)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [3, 0]]], expected: 1 },
      { input: [4, [[0, 1], [1, 0], [1, 2], [2, 3], [0, 3]]], expected: 3 },
      { input: [1, []], expected: 0 },
      { input: [5, [[0, 1], [1, 0], [2, 3], [3, 2]]], expected: 0 },
    ],
    hint: "Deduplicate component pairs with a set after contracting the SCCs.",
  },
  {
    id: "graph-057",
    title: "Augmenting Path Matching Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one Kuhn augmenting step on a bipartite graph.\n\nadj[i] lists the right-side nodes adjacent to left node i. match_left[i] and match_right[j] hold the current matching, or -1 when unmatched. Find the smallest-index unmatched left node and try to augment from it, rerouting earlier matches with DFS. Return the updated match_left list; if nothing changes, return it unchanged.",
    starterCode: `def augment_one(L, adj, match_left, match_right):
    # Your code here
    pass`,
    solution: `def augment_one(L, adj, match_left, match_right):
    def try_kuhn(v, visited):
        for to in adj[v]:
            if visited[to]:
                continue
            visited[to] = True
            if match_right[to] == -1 or try_kuhn(match_right[to], visited):
                match_right[to] = v
                match_left[v] = to
                return True
        return False

    for v in range(L):
        if match_left[v] == -1:
            try_kuhn(v, [False] * len(match_right))
            return match_left
    return match_left`,
    testCases: [
      { input: [2, [[0, 1], [1]], [-1, -1], [-1, -1]], expected: [0, -1] },
      { input: [2, [[0], [0]], [-1, -1], [-1, -1]], expected: [0, -1] },
      { input: [3, [[0, 1], [0], [1]], [0, -1, -1], [0, -1, -1]], expected: [1, 0, -1] },
      { input: [2, [[0], [1]], [0, 1], [0, 1]], expected: [0, 1] },
    ],
    hint: "A DFS that can reroute the current owner of a right node extends the matching.",
  },
  {
    id: "graph-058",
    title: "Maximum Bipartite Matching Size",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the size of a maximum matching in a bipartite graph with L left and R right nodes.\n\nadj[i] lists the right nodes adjacent to left node i. Use Kuhn's algorithm: try to augment from each left node in order, rerouting existing matches when needed. Return the number of matched pairs.",
    starterCode: `def max_bipartite_matching(L, R, adj):
    # Your code here
    pass`,
    solution: `def max_bipartite_matching(L, R, adj):
    match_left = [-1] * L
    match_right = [-1] * R

    def try_kuhn(v, visited):
        for to in adj[v]:
            if visited[to]:
                continue
            visited[to] = True
            if match_right[to] == -1 or try_kuhn(match_right[to], visited):
                match_right[to] = v
                match_left[v] = to
                return True
        return False

    size = 0
    for v in range(L):
        if try_kuhn(v, [False] * R):
            size += 1
    return size`,
    testCases: [
      { input: [3, 3, [[0, 1], [0], [1]]], expected: 2 },
      { input: [2, 2, [[0, 1], [0, 1]]], expected: 2 },
      { input: [3, 3, [[], [], []]], expected: 0 },
      { input: [4, 4, [[0], [0], [2, 3], [2]]], expected: 3 },
      { input: [3, 3, [[0, 1], [1, 2], [2]]], expected: 3 },
    ],
    hint: "Kuhn runs one DFS per left node; each success increases the matching by one.",
  },
  {
    id: "graph-059",
    title: "Minimum Vertex Cover from Matching",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Build a minimum vertex cover of a bipartite graph from a maximum matching, as guaranteed by Koenig's theorem.\n\nFirst compute a maximum matching. Then mark vertices reachable from unmatched left nodes by alternating paths: unmatched edges go left to right, matched edges go right to left. The cover is every unmarked left node plus every marked right node. Return it as a sorted list of labels like L0 and R1.",
    starterCode: `def min_vertex_cover_bipartite(L, R, adj):
    # Your code here
    pass`,
    solution: `def min_vertex_cover_bipartite(L, R, adj):
    match_left = [-1] * L
    match_right = [-1] * R

    def try_kuhn(v, visited):
        for to in adj[v]:
            if visited[to]:
                continue
            visited[to] = True
            if match_right[to] == -1 or try_kuhn(match_right[to], visited):
                match_right[to] = v
                match_left[v] = to
                return True
        return False

    for v in range(L):
        try_kuhn(v, [False] * R)
    zl = [False] * L
    zr = [False] * R
    queue = []
    for v in range(L):
        if match_left[v] == -1:
            zl[v] = True
            queue.append((0, v))
    head = 0
    while head < len(queue):
        side, v = queue[head]
        head += 1
        if side == 0:
            for to in adj[v]:
                if not zr[to] and match_left[v] != to:
                    zr[to] = True
                    queue.append((1, to))
        else:
            other = match_right[v]
            if other != -1 and not zl[other]:
                zl[other] = True
                queue.append((0, other))
    cover = []
    for v in range(L):
        if not zl[v]:
            cover.append("L" + str(v))
    for v in range(R):
        if zr[v]:
            cover.append("R" + str(v))
    return sorted(cover)`,
    testCases: [
      { input: [3, 3, [[0, 1], [0], [1]]], expected: ["R0", "R1"] },
      { input: [2, 2, [[0, 1], [0, 1]]], expected: ["L0", "L1"] },
      { input: [3, 2, [[0], [0, 1], [1]]], expected: ["R0", "R1"] },
      { input: [2, 3, [[0], [1, 2]]], expected: ["L0", "L1"] },
    ],
    hint: "The cover size equals the matching size, which is the optimality certificate.",
  },
  {
    id: "graph-060",
    title: "Ford-Fulkerson Max Flow",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the maximum flow from node s to node t in a directed capacitated network with Ford-Fulkerson using DFS augmenting paths.\n\nedges is a list of [u, v, capacity] triples with integer capacities. Maintain a residual capacity matrix, push flow along any path with spare capacity, and return the total flow value.",
    starterCode: `def max_flow(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def max_flow(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
    flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        stack = [s]
        while stack:
            x = stack.pop()
            for y in range(n):
                if parent[y] == -1 and cap[x][y] > 0:
                    parent[y] = x
                    stack.append(y)
        if parent[t] == -1:
            break
        path = []
        x = t
        while x != s:
            path.append(x)
            x = parent[x]
        path.append(s)
        path.reverse()
        bottleneck = min(cap[path[i]][path[i + 1]] for i in range(len(path) - 1))
        for i in range(len(path) - 1):
            cap[path[i]][path[i + 1]] -= bottleneck
            cap[path[i + 1]][path[i]] += bottleneck
        flow += bottleneck
    return flow`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: 5 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: 1 },
      { input: [3, [[0, 1, 5]], 0, 2], expected: 0 },
      { input: [4, [[0, 1, 10], [0, 2, 10], [1, 2, 1], [1, 3, 10], [2, 3, 10]], 0, 3], expected: 20 },
      { input: [2, [[0, 1, 7], [1, 0, 3]], 0, 1], expected: 7 },
    ],
    hint: "Residual reverse edges allow the algorithm to undo earlier routing decisions.",
  },
  {
    id: "graph-061",
    title: "Edmonds-Karp One Augmentation",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Run a single Edmonds-Karp augmentation step in a directed capacitated network.\n\nUse BFS on the residual capacities to find a shortest augmenting path from s to t. Return [path, bottleneck] where path lists the nodes from s to t and bottleneck is the flow that would be pushed, or [[], 0] when no augmenting path exists. edges is a list of [u, v, capacity] triples.",
    starterCode: `def edmonds_karp_one(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def edmonds_karp_one(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
    parent = [-1] * n
    parent[s] = s
    queue = [s]
    head = 0
    while head < len(queue):
        x = queue[head]
        head += 1
        for y in range(n):
            if parent[y] == -1 and cap[x][y] > 0:
                parent[y] = x
                queue.append(y)
    if parent[t] == -1:
        return [[], 0]
    path = []
    x = t
    while x != s:
        path.append(x)
        x = parent[x]
    path.append(s)
    path.reverse()
    bottleneck = min(cap[path[i]][path[i + 1]] for i in range(len(path) - 1))
    return [path, bottleneck]`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: [[0, 1, 3], 2] },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: [[0, 1, 2], 1] },
      { input: [3, [[0, 1, 5]], 0, 2], expected: [[], 0] },
      { input: [4, [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]], 0, 3], expected: [[0, 1, 3], 1] },
    ],
    hint: "BFS explores edges with positive residual capacity and records each node's parent.",
  },
  {
    id: "graph-062",
    title: "Min Cut Value from Max Flow",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute a minimum s-t cut from a maximum flow, using the max-flow min-cut theorem.\n\nRun Ford-Fulkerson with DFS augmenting paths, then find all nodes reachable from s in the residual network. Return [cut_value, source_side] where source_side is the sorted list of reachable nodes. edges is a list of [u, v, capacity] triples.",
    starterCode: `def min_cut(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def min_cut(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
    flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        stack = [s]
        while stack:
            x = stack.pop()
            for y in range(n):
                if parent[y] == -1 and cap[x][y] > 0:
                    parent[y] = x
                    stack.append(y)
        if parent[t] == -1:
            break
        path = []
        x = t
        while x != s:
            path.append(x)
            x = parent[x]
        path.append(s)
        path.reverse()
        bottleneck = min(cap[path[i]][path[i + 1]] for i in range(len(path) - 1))
        for i in range(len(path) - 1):
            cap[path[i]][path[i + 1]] -= bottleneck
            cap[path[i + 1]][path[i]] += bottleneck
        flow += bottleneck
    seen = [False] * n
    seen[s] = True
    stack = [s]
    while stack:
        x = stack.pop()
        for y in range(n):
            if not seen[y] and cap[x][y] > 0:
                seen[y] = True
                stack.append(y)
    return [flow, sorted(i for i in range(n) if seen[i])]`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: [5, [0]] },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: [1, [0]] },
      { input: [3, [[0, 1, 5]], 0, 2], expected: [0, [0, 1]] },
      { input: [4, [[0, 1, 10], [0, 2, 10], [1, 2, 1], [1, 3, 10], [2, 3, 10]], 0, 3], expected: [20, [0]] },
    ],
    hint: "After no augmenting path remains, nodes reachable from s in the residual graph form the source side of a min cut.",
  },
  {
    id: "graph-063",
    title: "Bipartite Minimum Path Cover",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the minimum number of vertex-disjoint paths needed to cover every node of a DAG.\n\nBuild a bipartite graph with a left and a right copy of each node and an edge from left u to right v for every DAG edge u to v. By Dilworth's theorem the answer is n minus the maximum matching. edges is a list of [u, v] pairs.",
    starterCode: `def min_path_cover(n, edges):
    # Your code here
    pass`,
    solution: `def min_path_cover(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    match_right = [-1] * n

    def try_kuhn(v, visited):
        for to in adj[v]:
            if visited[to]:
                continue
            visited[to] = True
            if match_right[to] == -1 or try_kuhn(match_right[to], visited):
                match_right[to] = v
                return True
        return False

    size = 0
    for v in range(n):
        if try_kuhn(v, [False] * n):
            size += 1
    return n - size`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: 2 },
      { input: [3, []], expected: 3 },
      { input: [2, [[0, 1]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
    ],
    hint: "Each matched pair joins two path segments; unmatched right nodes are path starts.",
  },
  {
    id: "graph-064",
    title: "Unique Topological Order Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether a directed graph has exactly one topological order.\n\nRun Kahn's algorithm and check that at every step there is exactly one node with in-degree 0. Return False when the graph has a cycle, since it then has no topological order at all. edges is a list of [u, v] pairs.",
    starterCode: `def has_unique_topological_order(n, edges):
    # Your code here
    pass`,
    solution: `def has_unique_topological_order(n, edges):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1
    available = [i for i in range(n) if in_degree[i] == 0]
    processed = 0
    while available:
        if len(available) > 1:
            return False
        v = available.pop()
        processed += 1
        for w in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                available.append(w)
    return processed == n`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: true },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: false },
      { input: [1, []], expected: true },
      { input: [2, []], expected: false },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: true },
    ],
    hint: "A unique topological order is equivalent to the DAG having a Hamiltonian path.",
  },
  {
    id: "graph-065",
    title: "Bridge-Connected Components Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the 2-edge-connected components of an undirected graph with n nodes: the connected components left after deleting every bridge.\n\nFind bridges with a Tarjan DFS using discovery times and low-link values, then union all non-bridge edges with union-find and count the resulting components. edges is a list of [u, v] pairs.",
    starterCode: `def bridge_connected_components(n, edges):
    # Your code here
    pass`,
    solution: `def bridge_connected_components(n, edges):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    is_bridge = [False] * len(edges)

    def dfs(v, parent_edge):
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        for w, edge_id in adj[v]:
            if edge_id == parent_edge:
                continue
            if disc[w] != -1:
                low[v] = min(low[v], disc[w])
            else:
                dfs(w, edge_id)
                low[v] = min(low[v], low[w])
                if low[w] > disc[v]:
                    is_bridge[edge_id] = True

    for node in range(n):
        if disc[node] == -1:
            dfs(node, -1)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i, (u, v) in enumerate(edges):
        if not is_bridge[i]:
            ru = find(u)
            rv = find(v)
            if ru != rv:
                parent[ru] = rv
    return len({find(i) for i in range(n)})`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 2 },
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1 },
      { input: [2, []], expected: 2 },
    ],
    hint: "Two nodes are 2-edge-connected exactly when there are two edge-disjoint paths between them.",
  },
  {
    id: "graph-066",
    title: "Multi-Source BFS Distances",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the distance from every node of an undirected unweighted graph to the nearest source.\n\nAll sources start in the queue at distance 0 and expand together. Return distances in node order, using -1 for nodes not reachable from any source. edges is a list of [u, v] pairs.",
    starterCode: `def multi_source_bfs(n, edges, sources):
    # Your code here
    pass`,
    solution: `def multi_source_bfs(n, edges, sources):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    queue = []
    for s in sources:
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
    return dist`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], [0, 3]], expected: [0, 1, 1, 0, 1] },
      { input: [6, [[0, 1], [2, 3], [4, 5]], [0, 4]], expected: [0, 1, -1, -1, 0, 1] },
      { input: [3, [[0, 1], [1, 2]], [1]], expected: [1, 0, 1] },
      { input: [2, [], [1]], expected: [-1, 0] },
    ],
    hint: "Seeding the queue with all sources gives every node its nearest-source distance.",
  },
  {
    id: "graph-067",
    title: "0-1 BFS Distances",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest paths when every directed edge weight is 0 or 1, using a deque.\n\nPush relaxation results through the front of the deque for weight 0 and through the back for weight 1. edges is a list of [u, v, w] triples with w in {0, 1}. Return distances from src, using -1 for unreachable nodes.",
    starterCode: `from collections import deque
def zero_one_bfs(n, edges, src):
    # Your code here
    pass`,
    solution: `from collections import deque
def zero_one_bfs(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [-1] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        v = dq.popleft()
        for w, weight in adj[v]:
            nd = dist[v] + weight
            if dist[w] == -1 or nd < dist[w]:
                dist[w] = nd
                if weight == 0:
                    dq.appendleft(w)
                else:
                    dq.append(w)
    return dist`,
    testCases: [
      { input: [5, [[0, 1, 1], [0, 2, 0], [2, 1, 0], [1, 3, 1], [3, 4, 1]], 0], expected: [0, 0, 0, 1, 2] },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0], expected: [0, 1, 2] },
      { input: [3, [[0, 1, 0], [1, 2, 1]], 0], expected: [0, 0, 1] },
      { input: [3, [[0, 1, 1]], 0], expected: [0, 1, -1] },
    ],
    hint: "Keeps the deque sorted by distance, which Dijkstra achieves with a heap.",
  },
  {
    id: "graph-068",
    title: "A* Heuristic Admissibility Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a heuristic is admissible for A* search: h(v) must never exceed the true shortest distance from v to goal.\n\nCompute exact distances to goal by running Dijkstra on the reversed graph, then compare. Negative heuristic values are never admissible. edges is a list of [u, v, w] triples and heuristic is a list of n values.",
    starterCode: `import heapq
def is_admissible(n, edges, goal, heuristic):
    # Your code here
    pass`,
    solution: `import heapq
def is_admissible(n, edges, goal, heuristic):
    radj = [[] for _ in range(n)]
    for u, v, w in edges:
        radj[v].append((u, w))
    dist = [-1] * n
    dist[goal] = 0
    heap = [(0, goal)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for to, weight in radj[v]:
            nd = d + weight
            if dist[to] == -1 or nd < dist[to]:
                dist[to] = nd
                heapq.heappush(heap, (nd, to))
    for v in range(n):
        if heuristic[v] < 0:
            return False
        if dist[v] != -1 and heuristic[v] > dist[v]:
            return False
    return True`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, 1]], 2, [2, 1, 0]], expected: true },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 2, [3, 1, 0]], expected: false },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 2, [-1, 1, 0]], expected: false },
      { input: [4, [[0, 1, 2], [1, 3, 2], [2, 3, 0]], 3, [4, 2, 7, 0]], expected: false },
      { input: [2, [[0, 1, 5]], 1, [5, 0]], expected: true },
    ],
    hint: "Run Dijkstra backwards from the goal to obtain the exact distances for comparison.",
  },
  {
    id: "graph-069",
    title: "A* F-Scores",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the A* f-score f(v) = g(v) + h(v) of every node, where g(v) is the true shortest distance from start and h is the given heuristic.\n\nUse Dijkstra from start for g. Return f-scores in node order, or -1 for nodes unreachable from start. edges is a list of [u, v, w] triples.",
    starterCode: `import heapq
def astar_f_scores(n, edges, start, heuristic):
    # Your code here
    pass`,
    solution: `import heapq
def astar_f_scores(n, edges, start, heuristic):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [-1] * n
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for w, weight in adj[v]:
            nd = d + weight
            if dist[w] == -1 or nd < dist[w]:
                dist[w] = nd
                heapq.heappush(heap, (nd, w))
    return [dist[i] + heuristic[i] if dist[i] != -1 else -1 for i in range(n)]`,
    testCases: [
      { input: [4, [[0, 1, 1], [0, 2, 4], [1, 3, 1], [2, 3, 1]], 0, [3, 2, 1, 0]], expected: [3, 3, 5, 2] },
      { input: [3, [[0, 1, 2], [1, 2, 2]], 0, [4, 2, 0]], expected: [4, 4, 4] },
      { input: [3, [[0, 1, 1]], 0, [1, 0, 5]], expected: [1, 1, -1] },
      { input: [1, [], 0, [0]], expected: [0] },
    ],
    hint: "The f-score combines what a path already cost with the heuristic estimate of what remains.",
  },
  {
    id: "graph-070",
    title: "Bidirectional BFS Meeting Node",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the meeting node of a shortest path with bidirectional BFS.\n\nExpand one level from src, check whether any newly reached node is already known from dst, then expand one level from dst and check again. Return [meeting_node, distance]; when several nodes meet at the minimal distance, pick the smallest node. Return [-1, -1] when the nodes are disconnected. edges is a list of [u, v] pairs.",
    starterCode: `def bidirectional_bfs_meeting(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `def bidirectional_bfs_meeting(n, edges, src, dst):
    if src == dst:
        return [src, 0]
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist_s = [-1] * n
    dist_t = [-1] * n
    dist_s[src] = 0
    dist_t[dst] = 0
    front_s = [src]
    front_t = [dst]
    while front_s and front_t:
        new_front = []
        for v in front_s:
            for w in adj[v]:
                if dist_s[w] == -1:
                    dist_s[w] = dist_s[v] + 1
                    new_front.append(w)
        front_s = new_front
        best = None
        for v in new_front:
            if dist_t[v] != -1:
                candidate = (dist_s[v] + dist_t[v], v)
                if best is None or candidate < best:
                    best = candidate
        if best is not None:
            return [best[1], best[0]]
        new_front = []
        for v in front_t:
            for w in adj[v]:
                if dist_t[w] == -1:
                    dist_t[w] = dist_t[v] + 1
                    new_front.append(w)
        front_t = new_front
        best = None
        for v in new_front:
            if dist_s[v] != -1:
                candidate = (dist_s[v] + dist_t[v], v)
                if best is None or candidate < best:
                    best = candidate
        if best is not None:
            return [best[1], best[0]]
    return [-1, -1]`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [2, 5], [0, 3], [3, 4], [4, 5]], 0, 5], expected: [2, 3] },
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: [1, 2] },
      { input: [3, [[0, 1]], 0, 2], expected: [-1, -1] },
      { input: [2, [], 0, 0], expected: [0, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 3], expected: [2, 3] },
    ],
    hint: "Two BFS frontiers meet in the middle, potentially saving half the explored nodes.",
  },
  {
    id: "graph-071",
    title: "Greedy Graph Coloring Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Color an undirected graph with the greedy algorithm in node order 0 to n-1.\n\nFor each node, give it the smallest non-negative color not used by an already colored neighbor. Return the number of colors used. edges is a list of [u, v] pairs.",
    starterCode: `def greedy_coloring_count(n, edges):
    # Your code here
    pass`,
    solution: `def greedy_coloring_count(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    colors = [-1] * n
    used = 0
    for v in range(n):
        forbidden = {colors[w] for w in adj[v] if colors[w] != -1}
        color = 0
        while color in forbidden:
            color += 1
        colors[v] = color
        used = max(used, color + 1)
    return used`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 2 },
      { input: [3, []], expected: 1 },
    ],
    hint: "A greedy coloring may use more colors than the chromatic number.",
  },
  {
    id: "graph-072",
    title: "Chromatic Number Check",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the chromatic number of a small undirected graph: the fewest colors needed for a proper coloring.\n\nTry k = 1, 2, 3, ... and use backtracking with symmetry breaking (a node may only use colors up to the highest already used plus one). Return the smallest feasible k. edges is a list of [u, v] pairs and n is small.",
    starterCode: `def chromatic_number(n, edges):
    # Your code here
    pass`,
    solution: `def chromatic_number(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    colors = [-1] * n

    def can_color(v, c):
        for w in adj[v]:
            if colors[w] == c:
                return False
        return True

    def solve(v, k):
        if v == n:
            return True
        limit = max(colors) + 2
        if limit > k:
            limit = k
        for c in range(limit):
            if can_color(v, c):
                colors[v] = c
                if solve(v + 1, k):
                    return True
                colors[v] = -1
        return False

    for k in range(1, n + 1):
        colors = [-1] * n
        if solve(0, k):
            return k
    return 0`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 4 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 2 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 2 },
      { input: [3, []], expected: 1 },
    ],
    hint: "Symmetry breaking avoids trying color permutations of the same partial coloring.",
  },
  {
    id: "graph-073",
    title: "Clique Number",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find the size of the largest clique in an undirected graph with n nodes.\n\nUse the Bron-Kerbosch algorithm with three sets: the current clique, candidate nodes, and already excluded nodes. edges is a list of [u, v] pairs and n is small.",
    starterCode: `def clique_number(n, edges):
    # Your code here
    pass`,
    solution: `def clique_number(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    best = 0

    def expand(current, candidates, excluded):
        nonlocal best
        if not candidates and not excluded:
            if len(current) > best:
                best = len(current)
            return
        for v in list(candidates):
            expand(current | {v}, candidates & adj[v], excluded & adj[v])
            candidates = candidates - {v}
            excluded = excluded | {v}

    expand(set(), set(range(n)), set())
    return best`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 4 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 2 },
      { input: [3, []], expected: 1 },
      { input: [5, [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [2, 4]]], expected: 3 },
    ],
    hint: "Bron-Kerbosch grows a clique while keeping candidates adjacent to all chosen nodes.",
  },
  {
    id: "graph-074",
    title: "Maximum Independent Set Greedy",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build an independent set greedily with the minimum-degree heuristic.\n\nRepeatedly select the remaining node with the smallest current degree (ties broken by smallest index), add it to the set, and delete it together with its neighbors. Return the size of the resulting independent set. edges is a list of [u, v] pairs.",
    starterCode: `def greedy_mis_size(n, edges):
    # Your code here
    pass`,
    solution: `def greedy_mis_size(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    remaining = set(range(n))
    chosen = 0
    while remaining:
        v = min(remaining, key=lambda x: (len(adj[x]), x))
        chosen += 1
        for w in list(adj[v]) + [v]:
            remaining.discard(w)
        for x in remaining:
            adj[x] = {y for y in adj[x] if y in remaining}
    return chosen`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1 },
      { input: [3, []], expected: 3 },
    ],
    hint: "Choosing low-degree nodes first tends to keep many nodes available.",
  },
  {
    id: "graph-075",
    title: "Greedy Dominating Set Size",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build a dominating set greedily: every node must be in the set or adjacent to a node in it.\n\nWhile some node is uncovered, choose the uncovered node that covers the most uncovered nodes (ties broken by smallest index), add it to the set, and mark its closed neighborhood covered. Return the set size. edges is a list of [u, v] pairs.",
    starterCode: `def greedy_dominating_set(n, edges):
    # Your code here
    pass`,
    solution: `def greedy_dominating_set(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    covered = [False] * n
    chosen = 0
    while not all(covered):
        best = -1
        best_count = -1
        for v in range(n):
            if covered[v]:
                continue
            count = 1
            for w in adj[v]:
                if not covered[w]:
                    count += 1
            if count > best_count:
                best_count = count
                best = v
        chosen += 1
        covered[best] = True
        for w in adj[best]:
            covered[w] = True
    return chosen`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [3, []], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 2 },
    ],
    hint: "Each step picks the node covering the largest number of still-uncovered nodes.",
  },
  {
    id: "graph-076",
    title: "Edge Connectivity Min Cut Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the edge connectivity of a small undirected graph: the minimum number of edges whose removal disconnects it.\n\nTry every non-trivial vertex subset and count the edges crossing the cut, or return 0 when the graph or a single node case applies. edges is a list of [u, v] pairs and n is at most about 12.",
    starterCode: `def edge_connectivity(n, edges):
    # Your code here
    pass`,
    solution: `def edge_connectivity(n, edges):
    if n <= 1:
        return 0
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)

    def connected(removed):
        rem = [i for i in range(n) if i not in removed]
        if len(rem) <= 1:
            return False
        seen = {rem[0]}
        stack = [rem[0]]
        while stack:
            x = stack.pop()
            for y in adj[x]:
                if y not in removed and y not in seen:
                    seen.add(y)
                    stack.append(y)
        return len(seen) == len(rem)

    if not connected(set()):
        return 0
    best = len(edges)
    for mask in range(1, (1 << n) - 1):
        inside = {i for i in range(n) if mask & (1 << i)}
        cut = sum(1 for u, v in edges if (u in inside) != (v in inside))
        if cut < best:
            best = cut
    return best`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 3 },
      { input: [4, [[0, 1], [2, 3]]], expected: 0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
    ],
    hint: "Every cut is defined by a vertex subset, so brute force over all subsets for small n.",
  },
  {
    id: "graph-077",
    title: "Node Connectivity Min Cut Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the vertex connectivity of a small undirected graph: the minimum number of nodes whose removal disconnects it (or leaves fewer than two nodes).\n\nTry all removal sets of size 1, 2, 3, ... in order and return the first size that works. Return 0 when the graph is already disconnected or has at most one node. edges is a list of [u, v] pairs and n is small.",
    starterCode: `from itertools import combinations
def vertex_connectivity(n, edges):
    # Your code here
    pass`,
    solution: `from itertools import combinations
def vertex_connectivity(n, edges):
    if n <= 1:
        return 0
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)

    def connected(removed):
        rem = [i for i in range(n) if i not in removed]
        if len(rem) <= 1:
            return False
        seen = {rem[0]}
        stack = [rem[0]]
        while stack:
            x = stack.pop()
            for y in adj[x]:
                if y not in removed and y not in seen:
                    seen.add(y)
                    stack.append(y)
        return len(seen) == len(rem)

    if not connected(set()):
        return 0
    for k in range(1, n):
        for combo in combinations(range(n), k):
            if not connected(set(combo)):
                return k
    return n - 1`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]], expected: 1 },
    ],
    hint: "Removing all but one node always disconnects, so the search needs at most n - 1 vertices.",
  },
  {
    id: "graph-078",
    title: "Degree Sequence Check (Graphical)",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether a degree sequence is graphical: whether some simple undirected graph has exactly these degrees.\n\nRun the Havel-Hakimi algorithm: repeatedly remove the largest degree d, subtract 1 from the next d largest values, and fail if any becomes negative or if fewer than d values remain. Return a boolean.",
    starterCode: `def is_graphical(degrees):
    # Your code here
    pass`,
    solution: `def is_graphical(degrees):
    if sum(degrees) % 2 == 1:
        return False
    seq = sorted(degrees, reverse=True)
    while seq:
        seq = [d for d in seq if d > 0]
        if not seq:
            return True
        d = seq.pop(0)
        if d > len(seq):
            return False
        seq = [seq[i] - 1 if i < d else seq[i] for i in range(len(seq))]
        if any(x < 0 for x in seq):
            return False
        seq = sorted(seq, reverse=True)
    return True`,
    testCases: [
      { input: [[3, 3, 2, 2, 2, 2]], expected: true },
      { input: [[3, 3, 3, 1]], expected: false },
      { input: [[2, 2, 2, 2]], expected: true },
      { input: [[3, 3, 0]], expected: false },
      { input: [[0, 0, 0]], expected: true },
    ],
    hint: "Havel-Hakimi greedily connects the largest-degree node to the next largest ones.",
  },
  {
    id: "graph-079",
    title: "Laplacian Matrix Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the Laplacian matrix L = D - A of an undirected simple graph with n nodes.\n\nThe diagonal holds the degree of each node and off-diagonal entry [i][j] is -1 when i and j are adjacent, else 0. edges is a list of [u, v] pairs. Return the n by n integer matrix.",
    starterCode: `def laplacian_matrix(n, edges):
    # Your code here
    pass`,
    solution: `def laplacian_matrix(n, edges):
    lap = [[0] * n for _ in range(n)]
    for u, v in edges:
        lap[u][u] += 1
        lap[v][v] += 1
        lap[u][v] -= 1
        lap[v][u] -= 1
    return lap`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[1, -1, 0], [-1, 2, -1], [0, -1, 1]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[2, -1, -1], [-1, 2, -1], [-1, -1, 2]] },
      { input: [2, []], expected: [[0, 0], [0, 0]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [[3, -1, -1, -1], [-1, 1, 0, 0], [-1, 0, 1, 0], [-1, 0, 0, 1]] },
    ],
    hint: "Each edge adds 1 to both endpoint degrees and -1 to the two corresponding off-diagonal cells.",
  },
  {
    id: "graph-080",
    title: "Laplacian Zero Eigenvalue Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return the multiplicity of the zero eigenvalue of the Laplacian of an undirected graph.\n\nA classical result states that this multiplicity equals the number of connected components, so simply count components, treating isolated nodes as their own component. edges is a list of [u, v] pairs.",
    starterCode: `def zero_eigenvalue_multiplicity(n, edges):
    # Your code here
    pass`,
    solution: `def zero_eigenvalue_multiplicity(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru = find(u)
        rv = find(v)
        if ru != rv:
            parent[ru] = rv
    return len({find(i) for i in range(n)})`,
    testCases: [
      { input: [4, [[0, 1], [1, 2]]], expected: 2 },
      { input: [3, []], expected: 3 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
      { input: [4, [[0, 1], [2, 3]]], expected: 2 },
      { input: [1, []], expected: 1 },
    ],
    hint: "The multiplicity of eigenvalue 0 equals the number of connected components.",
  },
  {
    id: "graph-081",
    title: "Random Walk Stationary Uniform Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether the uniform distribution is stationary for the simple random walk on an undirected graph.\n\nThis happens exactly when the graph is regular: every node has the same degree, counting isolated nodes as degree 0. edges is a list of [u, v] pairs. Return a boolean.",
    starterCode: `def has_uniform_stationary(n, edges):
    # Your code here
    pass`,
    solution: `def has_uniform_stationary(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    return all(d == degree[0] for d in degree)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: false },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: true },
      { input: [3, []], expected: true },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: false },
    ],
    hint: "Uniform stationarity means the degree sequence is constant.",
  },
  {
    id: "graph-082",
    title: "Hitting Time Symmetric Formula",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the expected hitting time h(u, v) of the simple random walk on a tree with n nodes.\n\nThe tree formula is h(u, v) = dist(u, v) + 2 * sum over edges e on the u-to-v path of the number of edges in the component containing u after removing e. Root the tree at u and use subtree sizes. edges is a list of [u, v] pairs; return an integer.",
    starterCode: `def hitting_time_tree(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def hitting_time_tree(n, edges, u, v):
    if u == v:
        return 0
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [-1] * n
    parent[u] = u
    order = [u]
    head = 0
    while head < len(order):
        x = order[head]
        head += 1
        for y in adj[x]:
            if parent[y] == -1:
                parent[y] = x
                order.append(y)
    path = []
    x = v
    while x != u:
        path.append(x)
        x = parent[x]
    size = [1] * n
    for x in reversed(order):
        if x != u:
            size[parent[x]] += size[x]
    total = 0
    for x in path:
        total += n - 1 - size[x]
    return len(path) + 2 * total`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 4 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0, 1], expected: 5 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 6 },
      { input: [2, [[0, 1]], 0, 1], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0, 4], expected: 16 },
    ],
    hint: "For edges closer to v the u-side component contains more of the tree's edges.",
  },
  {
    id: "graph-083",
    title: "Commute Time",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the commute time C(u, v) = 2m * R(u, v) of the simple random walk on a connected undirected graph, where m is the number of edges and R is the effective resistance.\n\nSolve the grounded Laplacian system L x = e_u - e_v with node 0 pinned to 0 using Gaussian elimination, then set R = x[u] - x[v]. edges is a list of [u, v] pairs. Return a float.",
    starterCode: `def commute_time(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def commute_time(n, edges, u, v):
    m = len(edges)
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
        if i == u:
            value += 1.0
        if i == v:
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
    x = [0.0] * n
    for k, i in enumerate(idx):
        x[i] = rhs[k]
    resistance = x[u] - x[v]
    return 2.0 * m * resistance`,
    testCases: [
      { input: [2, [[0, 1]], 0, 1], expected: 2.0 },
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 8.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 1], expected: 6.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 2], expected: 8.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 12.0 },
    ],
    hint: "Effective resistance treats the graph as a resistor network with unit resistors.",
  },
  {
    id: "graph-084",
    title: "Mixing Bound Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the standard upper bound on the mixing time of a lazy random walk on a connected graph with n nodes.\n\nGiven the spectral gap gap and target accuracy epsilon, return ceil(ln(n / epsilon) / gap) as an integer. Use the natural logarithm.",
    starterCode: `import math
def mixing_bound(n, spectral_gap, epsilon):
    # Your code here
    pass`,
    solution: `import math
def mixing_bound(n, spectral_gap, epsilon):
    return math.ceil(math.log(n / epsilon) / spectral_gap)`,
    testCases: [
      { input: [100, 0.1, 0.01], expected: 93 },
      { input: [4, 0.5, 0.25], expected: 6 },
      { input: [16, 0.25, 0.001], expected: 39 },
      { input: [10, 1.0, 0.1], expected: 5 },
    ],
    hint: "A larger spectral gap means faster mixing and a smaller bound.",
  },
  {
    id: "graph-085",
    title: "HITS Hub/Authority One Iteration",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one iteration of the HITS algorithm on a directed graph with n nodes.\n\nStart with all hub and authority scores equal to 1. The new authority score of v is the sum of hub scores of its in-neighbors, and the new hub score of u is the sum of authority scores of its out-neighbors. Normalize each vector by its L2 norm (leave an all-zero vector as zeros). Return [hubs, authorities]. edges is a list of [u, v] pairs.",
    starterCode: `import math
def hits_one_iteration(n, edges):
    # Your code here
    pass`,
    solution: `import math
def hits_one_iteration(n, edges):
    hubs = [1.0] * n
    auth = [1.0] * n
    new_auth = [0.0] * n
    new_hubs = [0.0] * n
    for u, v in edges:
        new_auth[v] += hubs[u]
        new_hubs[u] += auth[v]
    na = math.sqrt(sum(t * t for t in new_auth))
    nh = math.sqrt(sum(t * t for t in new_hubs))
    if na > 0:
        new_auth = [t / na for t in new_auth]
    if nh > 0:
        new_hubs = [t / nh for t in new_hubs]
    return [new_hubs, new_auth]`,
    testCases: [
      { input: [3, [[0, 1], [0, 2]]], expected: [[1.0, 0.0, 0.0], [0.0, 0.7071067811865475, 0.7071067811865475]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[0.5773502691896258, 0.5773502691896258, 0.5773502691896258], [0.5773502691896258, 0.5773502691896258, 0.5773502691896258]] },
      { input: [2, [[0, 1], [1, 0]]], expected: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, 0.7071067811865475]] },
      { input: [2, []], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Hubs point to good authorities; authorities are pointed to by good hubs.",
  },
  {
    id: "graph-086",
    title: "Katz Centrality",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute Katz centrality for a directed graph with n nodes: c = beta * (I - alpha * A_transpose)^(-1) * 1, where A is the adjacency matrix and alpha is small enough for the inverse to exist.\n\nSolve the linear system (I - alpha * A_transpose) c = beta * 1 with Gaussian elimination. edges is a list of [u, v] pairs; return the centrality vector.",
    starterCode: `def katz_centrality(n, edges, alpha, beta):
    # Your code here
    pass`,
    solution: `def katz_centrality(n, edges, alpha, beta):
    adj = [[0.0] * n for _ in range(n)]
    for u, v in edges:
        adj[u][v] += 1.0
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            matrix[i][j] = (1.0 if i == j else 0.0) - alpha * adj[j][i]
    rhs = [beta] * n
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(matrix[r][col]))
        matrix[col], matrix[pivot] = matrix[pivot], matrix[col]
        rhs[col], rhs[pivot] = rhs[pivot], rhs[col]
        pv = matrix[col][col]
        for j in range(col, n):
            matrix[col][j] /= pv
        rhs[col] /= pv
        for r in range(n):
            if r != col and matrix[r][col] != 0.0:
                factor = matrix[r][col]
                for j in range(col, n):
                    matrix[r][j] -= factor * matrix[col][j]
                rhs[r] -= factor * rhs[col]
    return rhs`,
    testCases: [
      { input: [2, [[0, 1]], 0.1, 1.0], expected: [1.0, 1.1] },
      { input: [3, [[0, 1], [1, 2]], 0.1, 1.0], expected: [1.0, 1.1, 1.11] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.05, 1.0], expected: [1.0526315789473684, 1.0526315789473684, 1.0526315789473684] },
      { input: [1, [], 0.5, 2.0], expected: [2.0] },
    ],
    hint: "A_transpose sends attention backwards along the edges, so incoming neighbors boost a node.",
  },
  {
    id: "graph-087",
    title: "Wedge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the wedges of an undirected graph: unordered pairs of edges that share a center, including wedges whose endpoints are also connected.\n\nA node of degree d contributes d * (d - 1) / 2 wedges, so sum that over all nodes. edges is a list of [u, v] pairs.",
    starterCode: `def wedge_count(n, edges):
    # Your code here
    pass`,
    solution: `def wedge_count(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    return sum(d * (d - 1) // 2 for d in degree)`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 12 },
    ],
    hint: "Wedge count relates to degrees by the handshake-style identity sum of d choose 2.",
  },
  {
    id: "graph-088",
    title: "Assortativity Coefficient",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the degree assortativity coefficient of an undirected graph: the Pearson correlation of the degrees at the two ends of each edge.\n\nWith M edges, let a_e = (d_u + d_v) / 2 and p_e = d_u * d_v; then r = (mean(p) - mean(a)^2) / (mean((d_u^2 + d_v^2) / 2) - mean(a)^2). Return 0.0 when the denominator is 0 or the graph has no edges. edges is a list of [u, v] pairs.",
    starterCode: `def degree_assortativity(n, edges):
    # Your code here
    pass`,
    solution: `def degree_assortativity(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    m = len(edges)
    if m == 0:
        return 0.0
    mean_prod = sum(degree[u] * degree[v] for u, v in edges) / m
    mean_avg = sum((degree[u] + degree[v]) / 2.0 for u, v in edges) / m
    mean_sq = sum((degree[u] ** 2 + degree[v] ** 2) / 2.0 for u, v in edges) / m
    denom = mean_sq - mean_avg * mean_avg
    if denom == 0:
        return 0.0
    return (mean_prod - mean_avg * mean_avg) / denom`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: -1.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: -0.5 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 0.0 },
      { input: [3, [[0, 1], [1, 2]]], expected: -1.0 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 0.0 },
    ],
    hint: "A negative value means high-degree nodes prefer low-degree neighbors.",
  },
  {
    id: "graph-089",
    title: "Modularity of a Partition",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the modularity of a partition of an undirected graph into communities.\n\nWith m edges, community c contributes L_c / m - (d_c / (2m))^2, where L_c is the number of edges inside c and d_c is the sum of degrees of its nodes. Return the sum over communities. edges is a list of [u, v] pairs and community maps each node to a community id.",
    starterCode: `def modularity(n, edges, community):
    # Your code here
    pass`,
    solution: `def modularity(n, edges, community):
    m = len(edges)
    if m == 0:
        return 0.0
    degree = [0] * n
    internal = {}
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    for u, v in edges:
        if community[u] == community[v]:
            internal[community[u]] = internal.get(community[u], 0) + 1
    total = 0.0
    for c in set(community):
        tot = sum(degree[i] for i in range(n) if community[i] == c)
        total += internal.get(c, 0) / m - (tot / (2.0 * m)) ** 2
    return total`,
    testCases: [
      { input: [4, [[0, 1], [2, 3]], [0, 0, 1, 1]], expected: 0.5 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 0, 0]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0, 1, 2, 3]], expected: -0.3333333333333333 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 1, 1]], expected: 0.16666666666666666 },
    ],
    hint: "Modularity compares internal edge density against what a random graph would produce.",
  },
  {
    id: "graph-090",
    title: "Label Propagation One Step",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Perform one synchronous step of label propagation on an undirected graph.\n\nEach node adopts the most frequent label among its neighbors; ties are broken by the smallest label, and isolated nodes keep their own label. Return the new label list. labels is the initial list and edges is a list of [u, v] pairs.",
    starterCode: `def label_propagation(labels, edges):
    # Your code here
    pass`,
    solution: `def label_propagation(labels, edges):
    n = len(labels)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    new_labels = []
    for v in range(n):
        if not adj[v]:
            new_labels.append(labels[v])
            continue
        counts = {}
        for w in adj[v]:
            label = labels[w]
            counts[label] = counts.get(label, 0) + 1
        best = None
        for label in sorted(counts):
            if best is None or counts[label] > counts[best]:
                best = label
        new_labels.append(best)
    return new_labels`,
    testCases: [
      { input: [[0, 1, 2], [[0, 1], [1, 2]]], expected: [1, 0, 1] },
      { input: [[0, 1, 1, 1], [[0, 1], [0, 2], [0, 3]]], expected: [1, 0, 0, 0] },
      { input: [[5, 7], [[0, 1]]], expected: [7, 5] },
      { input: [[3], []], expected: [3] },
      { input: [[0, 1, 1], [[0, 1], [1, 2], [2, 0]]], expected: [1, 0, 0] },
    ],
    hint: "All nodes update simultaneously from the labels of the previous round.",
  },
];
