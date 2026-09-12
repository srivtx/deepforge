import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-271",
    title: "Max-Flow Augmenting Path Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many augmenting paths Ford-Fulkerson pushes before no s-t path remains.\n\nUse DFS over the residual capacity matrix, push the bottleneck along each found path, and increment a counter once per augmentation. edges is a list of directed [u, v, capacity] triples with integer capacities. Return the number of augmentations.",
    starterCode: `def max_flow_augmenting_paths(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def max_flow_augmenting_paths(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
    count = 0
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
        count += 1
    return count`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: 3 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: 1 },
      { input: [3, [[0, 1, 5]], 0, 2], expected: 0 },
      { input: [4, [[0, 1, 10], [0, 2, 10], [1, 2, 1], [1, 3, 10], [2, 3, 10]], 0, 3], expected: 2 },
      { input: [2, [[0, 1, 7], [1, 0, 3]], 0, 1], expected: 1 },
    ],
    hint: "The path count depends on the traversal order, so scan neighbors in a fixed direction.",
  },
  {
    id: "graph-272",
    title: "Min-Cut Capacity by Enumeration",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Find the minimum s-t cut capacity by enumerating every vertex subset.\n\nFor each subset S containing s but not t, sum the capacities of directed edges from S to the complement, and return the smallest total. edges is a list of [u, v, capacity] triples and n is small so 2^n subsets are affordable. If s equals t return 0.",
    starterCode: `def min_cut_capacity(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def min_cut_capacity(n, edges, s, t):
    if s == t:
        return 0
    best = None
    for mask in range(1 << n):
        if not (mask >> s) & 1:
            continue
        if (mask >> t) & 1:
            continue
        total = 0
        for u, v, c in edges:
            if ((mask >> u) & 1) and not ((mask >> v) & 1):
                total += c
        if best is None or total < best:
            best = total
    return best if best is not None else 0`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: 5 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: 1 },
      { input: [3, [[0, 1, 5]], 0, 2], expected: 0 },
      { input: [2, [[0, 1, 4], [1, 0, 2]], 0, 1], expected: 4 },
      { input: [2, [[0, 1, 4]], 1, 1], expected: 0 },
    ],
    hint: "A cut is fully described by which nodes stay on the source side.",
  },
  {
    id: "graph-273",
    title: "Push-Relabel Discharge Step",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Run the discharge loop of push-relabel on a single active node u.\n\nWhile excess[u] is positive, push along the smallest-index neighbor v with residual capacity and height[u] == height[v] + 1; if no admissible edge exists, relabel height[u] = 1 + min height over residual neighbors. capacity and flow are n by n matrices, height and excess are arrays. Return [flow, height, excess] after the loop stops; a node with no residual edges keeps its excess.",
    starterCode: `def push_relabel_discharge(n, capacity, flow, height, excess, u):
    # Your code here
    pass`,
    solution: `def push_relabel_discharge(n, capacity, flow, height, excess, u):
    while excess[u] > 0:
        pushed = False
        for v in range(n):
            residual = capacity[u][v] - flow[u][v]
            if residual > 0 and height[u] == height[v] + 1:
                delta = min(excess[u], residual)
                flow[u][v] += delta
                flow[v][u] -= delta
                excess[u] -= delta
                excess[v] += delta
                pushed = True
                break
        if not pushed:
            candidates = [height[v] for v in range(n) if capacity[u][v] - flow[u][v] > 0]
            if not candidates:
                break
            height[u] = min(candidates) + 1
    return [flow, height, excess]`,
    testCases: [
      { input: [4, [[0, 3, 2, 0], [0, 0, 5, 2], [0, 0, 0, 3], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 3, 0], [0, -3, 0, 0], [0, 0, 0, 0]], [4, 1, 0, 0], [0, 0, 5, 0], 1], expected: [[[0, 0, 0, 0], [0, 0, 3, 0], [0, -3, 0, 0], [0, 0, 0, 0]], [4, 1, 0, 0], [0, 0, 5, 0]] },
      { input: [3, [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [0, 0, 0], [0, 1, 0], 1], expected: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [0, 0, 0], [0, 1, 0]] },
      { input: [3, [[0, 0, 0], [0, 0, 5], [0, 0, 0]], [[0, 0, 0], [0, 0, 2], [0, -2, 0]], [0, 6, 5], [0, 0, 2], 1], expected: [[[0, 0, 0], [0, 0, 2], [0, -2, 0]], [0, 6, 5], [0, 0, 2]] },
      { input: [4, [[0, 4, 1, 0], [0, 0, 0, 2], [0, 0, 0, 3], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, -2, 0, 0]], [5, 1, 0, 0], [0, 2, 1, 2], 1], expected: [[[0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, -2, 0, 0]], [5, 1, 0, 0], [0, 2, 1, 2]] },
    ],
    hint: "Relabeling only fires when no neighbor sits one level below u.",
  },
  {
    id: "graph-274",
    title: "Max-Flow Min-Cut Duality Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Verify the max-flow min-cut theorem on a small network by computing both sides independently.\n\nRun Ford-Fulkerson with DFS augmenting paths for the flow value, then take the capacity of the cut formed by nodes still reachable from s in the residual graph. Return True when the flow value and the cut capacity agree. edges is a list of [u, v, capacity] triples with integer capacities.",
    starterCode: `def max_flow_min_cut_duality(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def max_flow_min_cut_duality(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    original = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
        original[u][v] += c
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
    cut = 0
    for u in range(n):
        for v in range(n):
            if seen[u] and not seen[v]:
                cut += original[u][v]
    return flow == cut`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: true },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2], expected: true },
      { input: [3, [[0, 1, 5]], 0, 2], expected: true },
      { input: [5, [[0, 1, 4], [0, 2, 2], [1, 3, 3], [2, 3, 1], [1, 2, 1], [3, 4, 5]], 0, 4], expected: true },
    ],
    hint: "The residual reachable set always yields a cut whose capacity equals the flow.",
  },
  {
    id: "graph-275",
    title: "Min-Cost Max-Flow Total Cost",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute a maximum flow of minimum total cost with successive shortest augmenting paths.\n\nEach round run Bellman-Ford on the residual graph with respect to cost, push the bottleneck along the cheapest s-t path, and accumulate flow times path cost. edges is a list of [u, v, capacity, cost] triples with distinct endpoint pairs. Return [max_flow, min_cost].",
    starterCode: `def min_cost_max_flow(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def min_cost_max_flow(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    cost = [[0] * n for _ in range(n)]
    for u, v, c, w in edges:
        cap[u][v] += c
        cost[u][v] = w
    total_flow = 0
    total_cost = 0
    while True:
        dist = [float('inf')] * n
        dist[s] = 0
        parent = [-1] * n
        for _ in range(n - 1):
            changed = False
            for u in range(n):
                if dist[u] == float('inf'):
                    continue
                for v in range(n):
                    if cap[u][v] > 0 and dist[u] + cost[u][v] < dist[v]:
                        dist[v] = dist[u] + cost[u][v]
                        parent[v] = u
                        changed = True
            if not changed:
                break
        if dist[t] == float('inf'):
            break
        push = float('inf')
        x = t
        while x != s:
            p = parent[x]
            if cap[p][x] < push:
                push = cap[p][x]
            x = p
        push = int(push)
        x = t
        while x != s:
            p = parent[x]
            cap[p][x] -= push
            cap[x][p] += push
            x = p
        total_flow += push
        total_cost += push * dist[t]
    return [total_flow, total_cost]`,
    testCases: [
      { input: [4, [[0, 1, 2, 1], [0, 2, 2, 2], [1, 3, 2, 1], [2, 3, 2, 2]], 0, 3], expected: [4, 12] },
      { input: [3, [[0, 1, 3, 2], [1, 2, 3, 3]], 0, 2], expected: [3, 15] },
      { input: [4, [[0, 1, 1, 5], [0, 2, 1, 1], [1, 3, 1, 1], [2, 3, 1, 5]], 0, 3], expected: [2, 12] },
      { input: [3, [[0, 1, 2, 1]], 0, 2], expected: [0, 0] },
    ],
    hint: "Bellman-Ford finds the cheapest residual path even when reverse edges carry negative cost.",
  },
  {
    id: "graph-276",
    title: "Hopcroft-Karp Phase Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the BFS phases Hopcroft-Karp needs to build a maximum bipartite matching.\n\nA phase BFS-layers unmatched left nodes and notices when a free right node is reachable; the following DFS scan augments along the layered graph. adj[i] lists right-side neighbors of left node i. Return [phases, matching_size].",
    starterCode: `def hopcroft_karp_phase_count(L, R, adj):
    # Your code here
    pass`,
    solution: `def hopcroft_karp_phase_count(L, R, adj):
    INF = float('inf')
    pair_u = [-1] * L
    pair_v = [-1] * R
    dist = [0] * L

    def bfs():
        queue = []
        for u in range(L):
            if pair_u[u] == -1:
                dist[u] = 0
                queue.append(u)
            else:
                dist[u] = INF
        found = False
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            for v in sorted(adj[u]):
                w = pair_v[v]
                if w == -1:
                    found = True
                elif dist[w] == INF:
                    dist[w] = dist[u] + 1
                    queue.append(w)
        return found

    def dfs(u):
        for v in sorted(adj[u]):
            w = pair_v[v]
            if w == -1 or (dist[w] == dist[u] + 1 and dfs(w)):
                pair_u[u] = v
                pair_v[v] = u
                return True
        dist[u] = INF
        return False

    phases = 0
    matching = 0
    while bfs():
        phases += 1
        for u in range(L):
            if pair_u[u] == -1 and dfs(u):
                matching += 1
    return [phases, matching]`,
    testCases: [
      { input: [3, 3, [[0, 1], [0], [1]]], expected: [1, 2] },
      { input: [2, 2, [[0, 1], [0, 1]]], expected: [1, 2] },
      { input: [3, 3, [[], [], []]], expected: [0, 0] },
      { input: [4, 4, [[0], [0], [2, 3], [2]]], expected: [2, 3] },
      { input: [4, 4, [[0, 1], [2, 3], [0, 1], [2, 3]]], expected: [1, 4] },
    ],
    hint: "Every phase strictly increases the length of the shortest augmenting path.",
  },
  {
    id: "graph-277",
    title: "Bipartite Matching via Max Flow",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the maximum bipartite matching size by reducing it to an s-t max flow.\n\nWire a unit-capacity network: source to every left node, left node to its right neighbors, every right node to the sink, then run Ford-Fulkerson and return the flow value. adj[i] lists the right nodes adjacent to left node i. L and R give the side sizes.",
    starterCode: `def bipartite_matching_via_flow(L, R, adj):
    # Your code here
    pass`,
    solution: `def bipartite_matching_via_flow(L, R, adj):
    n = L + R + 2
    s = L + R
    t = L + R + 1
    cap = [[0] * n for _ in range(n)]
    for i in range(L):
        cap[s][i] = 1
        for j in adj[i]:
            cap[i][L + j] = 1
    for j in range(R):
        cap[L + j][t] = 1
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
        x = t
        while x != s:
            p = parent[x]
            cap[p][x] -= 1
            cap[x][p] += 1
            x = p
        flow += 1
    return flow`,
    testCases: [
      { input: [3, 3, [[0, 1], [0], [1]]], expected: 2 },
      { input: [2, 2, [[0, 1], [0, 1]]], expected: 2 },
      { input: [3, 3, [[], [], []]], expected: 0 },
      { input: [4, 4, [[0], [0], [2, 3], [2]]], expected: 3 },
    ],
    hint: "Every unit of flow picks one matched pair, so the flow value equals the matching size.",
  },
  {
    id: "graph-278",
    title: "Hungarian Assignment Minimum Cost",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Solve the square assignment problem with the Hungarian algorithm and return the minimum total cost.\n\ncost[i][j] is the cost of assigning worker i to job j; the algorithm maintains dual potentials and grows a shortest augmenting path for each new row. n is small. Return the minimum sum over perfect matchings.",
    starterCode: `def hungarian_assignment(cost):
    # Your code here
    pass`,
    solution: `def hungarian_assignment(cost):
    n = len(cost)
    if n == 0:
        return 0
    u = [0] * (n + 1)
    v = [0] * (n + 1)
    p = [0] * (n + 1)
    way = [0] * (n + 1)
    for i in range(1, n + 1):
        p[0] = i
        j0 = 0
        minv = [float('inf')] * (n + 1)
        used = [False] * (n + 1)
        while True:
            used[j0] = True
            i0 = p[j0]
            delta = float('inf')
            j1 = -1
            for j in range(1, n + 1):
                if not used[j]:
                    cur = cost[i0 - 1][j - 1] - u[i0] - v[j]
                    if cur < minv[j]:
                        minv[j] = cur
                        way[j] = j0
                    if minv[j] < delta:
                        delta = minv[j]
                        j1 = j
            for j in range(n + 1):
                if used[j]:
                    u[p[j]] += delta
                    v[j] -= delta
                else:
                    minv[j] -= delta
            j0 = j1
            if p[j0] == 0:
                break
        while True:
            j1 = way[j0]
            p[j0] = p[j1]
            j0 = j1
            if j0 == 0:
                break
    total = 0
    for j in range(1, n + 1):
        total += cost[p[j] - 1][j - 1]
    return total`,
    testCases: [
      { input: [[[1, 2, 3], [3, 1, 2], [2, 3, 1]]], expected: 3 },
      { input: [[[4, 1, 3], [2, 0, 5], [3, 2, 2]]], expected: 5 },
      { input: [[[7]]], expected: 7 },
      { input: [[[1, 5, 5], [5, 1, 5], [5, 5, 1]]], expected: 3 },
      { input: [[[2, 1], [1, 2]]], expected: 2 },
    ],
    hint: "The potentials keep reduced costs non-negative so each row can be matched with label updates.",
  },
  {
    id: "graph-279",
    title: "Articulation Points Sorted List",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "List all articulation points of an undirected graph in increasing order.\n\nAn articulation point is a node whose removal increases the number of connected components. Run a DFS with discovery times and low-link values: a non-root v qualifies when a child w has low[w] >= disc[v], and the root qualifies with more than one DFS child. edges is a list of [u, v] pairs.",
    starterCode: `def articulation_points_list(n, edges):
    # Your code here
    pass`,
    solution: `def articulation_points_list(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for a in adj:
        a.sort()
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    points = set()

    def dfs(v, parent):
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        children = 0
        for w in adj[v]:
            if w == parent:
                continue
            if disc[w] != -1:
                low[v] = min(low[v], disc[w])
            else:
                children += 1
                dfs(w, v)
                low[v] = min(low[v], low[w])
                if parent != -1 and low[w] >= disc[v]:
                    points.add(v)
        if parent == -1 and children > 1:
            points.add(v)

    for v in range(n):
        if disc[v] == -1:
            dfs(v, -1)
    return sorted(points)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]], expected: [1, 3] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [] },
      { input: [1, []], expected: [] },
    ],
    hint: "Only tree children can expose an articulation, and the root is the special case.",
  },
  {
    id: "graph-280",
    title: "Bridges Sorted Edge List",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "List every bridge of an undirected graph as sorted [min, max] endpoints.\n\nA bridge is an edge whose removal increases the number of connected components. DFS with discovery times and low-link values marks a tree edge u -> v as a bridge when low[v] > disc[u]; parallel edges are handled with edge ids. Return the bridge list sorted by endpoint pair.",
    starterCode: `def bridges_list(n, edges):
    # Your code here
    pass`,
    solution: `def bridges_list(n, edges):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    for a in adj:
        a.sort()
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    result = []

    def dfs(v, parent_edge):
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        for w, eid in adj[v]:
            if eid == parent_edge:
                continue
            if disc[w] != -1:
                low[v] = min(low[v], disc[w])
            else:
                dfs(w, eid)
                low[v] = min(low[v], low[w])
                if low[w] > disc[v]:
                    result.append([min(v, w), max(v, w)])

    for v in range(n):
        if disc[v] == -1:
            dfs(v, -1)
    result.sort()
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0, 1], [1, 2]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]], expected: [[1, 3], [3, 4]] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [] },
      { input: [3, [[0, 1], [0, 1], [1, 2]]], expected: [[1, 2]] },
    ],
    hint: "Track the parent edge by id so a parallel edge does not masquerade as a back edge.",
  },
  {
    id: "graph-281",
    title: "Biconnected Components Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the biconnected components (blocks) of an undirected graph.\n\nRun a DFS with an edge stack and pop a block whenever low[child] >= disc[parent]; every bridge forms its own block and an isolated vertex counts as a block. edges is a list of [u, v] pairs. Return the number of blocks.",
    starterCode: `def biconnected_components_count(n, edges):
    # Your code here
    pass`,
    solution: `def biconnected_components_count(n, edges):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    for a in adj:
        a.sort()
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    stack = []
    blocks = 0

    def dfs(v, parent_edge):
        nonlocal blocks
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        for w, eid in adj[v]:
            if eid == parent_edge:
                continue
            if disc[w] == -1:
                stack.append((v, w))
                dfs(w, eid)
                if low[w] < low[v]:
                    low[v] = low[w]
                if low[w] >= disc[v]:
                    blocks += 1
                    while True:
                        if stack.pop() == (v, w):
                            break
            elif disc[w] < disc[v]:
                stack.append((v, w))
                if disc[w] < low[v]:
                    low[v] = disc[w]

    for v in range(n):
        if disc[v] == -1:
            dfs(v, -1)
            if not adj[v]:
                blocks += 1
    return blocks`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 2 },
      { input: [3, []], expected: 3 },
    ],
    hint: "Whenever no earlier ancestor is reachable from the child's subtree, the edges above the current tree edge form one block.",
  },
  {
    id: "graph-282",
    title: "Kosaraju SCC Size Sequence",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the sizes of all strongly connected components in decreasing order.\n\nRun Kosaraju's algorithm: DFS to compute finish times, then DFS on the reversed graph in reverse finish order, recording each component size. edges is a list of [u, v] pairs. Return the sorted descending list of sizes.",
    starterCode: `def kosaraju_scc_sizes(n, edges):
    # Your code here
    pass`,
    solution: `def kosaraju_scc_sizes(n, edges):
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
            v, index = stack[-1]
            if index < len(adj[v]):
                w = adj[v][index]
                stack[-1] = (v, index + 1)
                if not visited[w]:
                    visited[w] = True
                    stack.append((w, 0))
            else:
                order.append(v)
                stack.pop()
    component = [-1] * n
    sizes = []
    for start in reversed(order):
        if component[start] != -1:
            continue
        size = 0
        component[start] = len(sizes)
        stack = [start]
        while stack:
            v = stack.pop()
            size += 1
            for w in radj[v]:
                if component[w] == -1:
                    component[w] = component[start]
                    stack.append(w)
        sizes.append(size)
    sizes.sort(reverse=True)
    return sizes`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [1, 1, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [3] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3]]], expected: [3, 2] },
      { input: [4, [[0, 1], [1, 0], [2, 3], [3, 2]]], expected: [2, 2] },
      { input: [1, []], expected: [1] },
    ],
    hint: "The second pass can never leave a strongly connected component.",
  },
  {
    id: "graph-283",
    title: "Tarjan Low-Link Values",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Return the Tarjan low-link value of every node of a directed graph.\n\nRun Tarjan's SCC DFS visiting nodes 0 to n-1 and neighbors in increasing order: low[v] is the smallest discovery time reachable from v's subtree by tree or back edges to nodes still on the stack. edges is a list of [u, v] pairs. The result is the low array in node order.",
    starterCode: `def tarjan_low_link_values(n, edges):
    # Your code here
    pass`,
    solution: `def tarjan_low_link_values(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    for a in adj:
        a.sort()
    disc = [-1] * n
    low = [0] * n
    on_stack = [False] * n
    stack = []
    timer = [0]

    def dfs(v):
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        stack.append(v)
        on_stack[v] = True
        for w in adj[v]:
            if disc[w] == -1:
                dfs(w)
                if low[w] < low[v]:
                    low[v] = low[w]
            elif on_stack[w] and disc[w] < low[v]:
                low[v] = disc[w]
        if low[v] == disc[v]:
            while True:
                w = stack.pop()
                on_stack[w] = False
                if w == v:
                    break

    for v in range(n):
        if disc[v] == -1:
            dfs(v)
    return low`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0, 0, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [0, 0, 0, 3] },
      { input: [4, [[0, 1], [0, 2], [1, 3], [3, 1]]], expected: [0, 1, 3, 1] },
      { input: [3, [[0, 1], [1, 2]]], expected: [0, 1, 2] },
      { input: [1, []], expected: [0] },
    ],
    hint: "Back edges only lower the value while their target is still on the stack.",
  },
  {
    id: "graph-284",
    title: "2-SAT Implication Edge Set",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the implication graph of a 2-SAT instance as a sorted edge list.\n\nLiteral +k (variable k true) maps to node 2*(k-1) and literal -k (false) maps to node 2*(k-1)+1. Each clause [a, b] adds the two implications not(a) -> b and not(b) -> a, deduplicated. Return all implication edges as sorted [from, to] pairs. clauses is a list of signed literal pairs.",
    starterCode: `def two_sat_implication_edges(n, clauses):
    # Your code here
    pass`,
    solution: `def two_sat_implication_edges(n, clauses):
    def node(literal):
        return 2 * (abs(literal) - 1) + (0 if literal > 0 else 1)

    def negate(nd):
        return nd + 1 if nd % 2 == 0 else nd - 1

    edges = set()
    for a, b in clauses:
        na = node(a)
        nb = node(b)
        edges.add((negate(na), nb))
        edges.add((negate(nb), na))
    return [list(e) for e in sorted(edges)]`,
    testCases: [
      { input: [2, [[1, -2]]], expected: [[1, 3], [2, 0]] },
      { input: [3, [[1, 2], [-1, 3]]], expected: [[0, 4], [1, 2], [3, 0], [5, 1]] },
      { input: [1, [[1, 1]]], expected: [[1, 0]] },
      { input: [2, [[1, 2], [-1, -2], [1, -2]]], expected: [[0, 3], [1, 2], [1, 3], [2, 0], [2, 1], [3, 0]] },
    ],
    hint: "A clause is equivalent to two contrapositive implications.",
  },
  {
    id: "graph-285",
    title: "Tree DP Maximum Independent Set",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the size of a maximum independent set of a tree with dynamic programming.\n\nRoot the tree at node 0. For each node keep take[v] = 1 + sum of skip over children and skip[v] = sum of max(take, skip) over children, processing nodes in reverse BFS order. edges is a list of [u, v] pairs. Return the best value at the root.",
    starterCode: `def tree_dp_max_independent_set(n, edges):
    # Your code here
    pass`,
    solution: `def tree_dp_max_independent_set(n, edges):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-2] * n
    parent[0] = -1
    order = [0]
    for v in order:
        for w in adj[v]:
            if parent[w] == -2:
                parent[w] = v
                order.append(w)
    take = [0] * n
    skip = [0] * n
    for v in reversed(order):
        take[v] = 1
        skip[v] = 0
        for w in adj[v]:
            if w != parent[v]:
                take[v] += skip[w]
                skip[v] += max(take[w], skip[w])
    return max(take[0], skip[0])`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 3 },
      { input: [1, []], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [1, 3], [3, 4]]], expected: 3 },
      { input: [3, [[0, 1], [1, 2]]], expected: 2 },
    ],
    hint: "A node taken forces every child skipped, but a skipped node lets each child choose freely.",
  },
  {
    id: "graph-286",
    title: "Tree DP Minimum Vertex Cover",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the size of a minimum vertex cover of a tree with dynamic programming.\n\nRoot the tree at node 0. For each node keep take[v] = 1 + sum of min over children and skip[v] = sum of take over children, because an uncovered edge forces the child into the cover. Return the better of take and skip at the root. edges is a list of [u, v] pairs.",
    starterCode: `def tree_dp_min_vertex_cover(n, edges):
    # Your code here
    pass`,
    solution: `def tree_dp_min_vertex_cover(n, edges):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-2] * n
    parent[0] = -1
    order = [0]
    for v in order:
        for w in adj[v]:
            if parent[w] == -2:
                parent[w] = v
                order.append(w)
    take = [0] * n
    skip = [0] * n
    for v in reversed(order):
        take[v] = 1
        skip[v] = 0
        for w in adj[v]:
            if w != parent[v]:
                take[v] += min(take[w], skip[w])
                skip[v] += take[w]
    return min(take[0], skip[0])`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [1, []], expected: 0 },
      { input: [5, [[0, 1], [1, 2], [1, 3], [3, 4]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2]]], expected: 1 },
    ],
    hint: "If a node stays out of the cover, every child must be inside it.",
  },
  {
    id: "graph-287",
    title: "Centroid Decomposition Depth",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Return the number of levels in the centroid decomposition tree of a tree.\n\nRepeatedly find a centroid of the current component (smallest largest child part, ties by smallest index), remove it, and recurse on each remaining part; the depth is one plus the deepest child decomposition. edges is a list of [u, v] pairs. A single node has depth 1.",
    starterCode: `def centroid_decomposition_depth(n, edges):
    # Your code here
    pass`,
    solution: `def centroid_decomposition_depth(n, edges):
    if n == 0:
        return 0
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    removed = [False] * n

    def component_nodes(start):
        nodes = []
        stack = [start]
        seen = {start}
        while stack:
            v = stack.pop()
            nodes.append(v)
            for w in adj[v]:
                if not removed[w] and w not in seen:
                    seen.add(w)
                    stack.append(w)
        return nodes

    def find_centroid(start):
        par = {start: -1}
        order = [start]
        for v in order:
            for w in adj[v]:
                if not removed[w] and w not in par:
                    par[w] = v
                    order.append(w)
        total = len(order)
        size = {v: 1 for v in order}
        for v in reversed(order):
            if par[v] != -1:
                size[par[v]] += size[v]
        best = None
        for v in order:
            largest = total - size[v]
            for w in adj[v]:
                if not removed[w] and par.get(w) == v and size[w] > largest:
                    largest = size[w]
            if best is None or largest < best[0] or (largest == best[0] and v < best[1]):
                best = (largest, v)
        return best[1]

    def solve(start):
        centroid = find_centroid(start)
        removed[centroid] = True
        depth = 0
        for w in sorted(adj[centroid]):
            if not removed[w]:
                depth = max(depth, solve(w))
        return depth + 1

    return solve(0)`,
    testCases: [
      { input: [1, []], expected: 1 },
      { input: [2, [[0, 1]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 3 },
      { input: [7, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]], expected: 3 },
      { input: [6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]], expected: 2 },
    ],
    hint: "Every centroid step at least halves each remaining part, so the depth is logarithmic.",
  },
  {
    id: "graph-288",
    title: "Heavy-Light Chain Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the heavy chains built by a heavy-light decomposition of a tree rooted at 0.\n\nCompute subtree sizes, pick for each node the child with the largest subtree as its heavy child (ties by smallest index), then count one chain per node that is either the root or not the heavy child of its parent. edges is a list of [u, v] pairs. Return the number of chains.",
    starterCode: `def heavy_light_chain_count(n, edges, root):
    # Your code here
    pass`,
    solution: `def heavy_light_chain_count(n, edges, root):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-2] * n
    parent[root] = -1
    order = [root]
    for v in order:
        for w in adj[v]:
            if parent[w] == -2:
                parent[w] = v
                order.append(w)
    size = [1] * n
    for v in reversed(order):
        if parent[v] != -1:
            size[parent[v]] += size[v]
    heavy = [-1] * n
    for v in range(n):
        best = -1
        for w in adj[v]:
            if w != parent[v]:
                if best == -1 or size[w] > size[best] or (size[w] == size[best] and w < best):
                    best = w
        heavy[v] = best
    chains = 0
    for v in range(n):
        if v == root or heavy[parent[v]] != v:
            chains += 1
    return chains`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: 3 },
      { input: [6, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], 0], expected: 3 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0], expected: 1 },
      { input: [1, [], 0], expected: 1 },
    ],
    hint: "A chain starts exactly at a light edge, so count the light edges plus the root's chain.",
  },
  {
    id: "graph-289",
    title: "Euler Tour Entry and Exit",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return entry and exit times for every node of a tree rooted at root.\n\nRun a DFS visiting children in increasing order and assign a global timer that increments on both entry and exit: tin[v] is the time v is first reached and tout[v] is the time after its whole subtree is processed. edges is a list of [u, v] pairs. Return the list of [tin, tout] pairs in node order.",
    starterCode: `def euler_tour_entry_exit(n, edges, root):
    # Your code here
    pass`,
    solution: `def euler_tour_entry_exit(n, edges, root):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for a in adj:
        a.sort()
    tin = [0] * n
    tout = [0] * n
    timer = [0]

    def dfs(v, parent):
        tin[v] = timer[0]
        timer[0] += 1
        for w in adj[v]:
            if w != parent:
                dfs(w, v)
        tout[v] = timer[0]
        timer[0] += 1

    dfs(root, -1)
    return [[tin[i], tout[i]] for i in range(n)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0], expected: [[0, 5], [1, 4], [2, 3]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: [[0, 7], [1, 2], [3, 4], [5, 6]] },
      { input: [1, [], 0], expected: [[0, 1]] },
      { input: [5, [[0, 1], [1, 2], [1, 3], [3, 4]], 0], expected: [[0, 9], [1, 8], [2, 3], [4, 7], [5, 6]] },
    ],
    hint: "tout - tin always equals twice the subtree size, because every node is entered and left once.",
  },
  {
    id: "graph-290",
    title: "LCA Binary Lifting Step Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the ancestor jumps the binary lifting LCA algorithm makes for each query.\n\nAfter building the 2^k ancestor table, equalize depths bit by bit, raise both nodes together from the highest level down while their ancestors differ, and finish with one final parent jump. Count every single table jump, including the final one. Return the step count for each [a, b] query. edges is a list of [u, v] pairs and root is the tree root.",
    starterCode: `def lca_binary_lifting_steps(n, edges, root, queries):
    # Your code here
    pass`,
    solution: `def lca_binary_lifting_steps(n, edges, root, queries):
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
    order = [root]
    for v in order:
        for w in adj[v]:
            if depth[w] == -1:
                depth[w] = depth[v] + 1
                parent[0][w] = v
                order.append(w)
    for k in range(1, levels):
        for v in range(n):
            p = parent[k - 1][v]
            parent[k][v] = parent[k - 1][p] if p != -1 else -1
    result = []
    for a, b in queries:
        steps = 0
        if depth[a] < depth[b]:
            a, b = b, a
        diff = depth[a] - depth[b]
        bit = 0
        while diff:
            if diff & 1:
                a = parent[bit][a]
                steps += 1
            diff >>= 1
            bit += 1
        if a == b:
            result.append(steps)
            continue
        for k in range(levels - 1, -1, -1):
            if parent[k][a] != parent[k][b]:
                a = parent[k][a]
                b = parent[k][b]
                steps += 1
        result.append(steps + 1)
    return result`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 0, [[3, 4], [3, 1], [0, 4], [1, 1]]], expected: [2, 1, 1, 0] },
      { input: [3, [[0, 1], [1, 2]], 0, [[2, 0], [1, 2]]], expected: [1, 1] },
      { input: [4, [[0, 1], [1, 2], [1, 3]], 1, [[2, 3], [0, 2]]], expected: [1, 1] },
      { input: [2, [[0, 1]], 0, [[1, 0]]], expected: [1] },
    ],
    hint: "The algorithm performs at most 2*log2(n) jumps because every jump moves a node up by a power of two.",
  },
  {
    id: "graph-291",
    title: "LCA Euler Tour Sparse Table",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Answer lowest-common-ancestor queries with an Euler tour plus a sparse table.\n\nRecord the Euler walk of a tree rooted at root (each edge adds one entry), build a sparse table over the walk keyed by node depth, and query the minimum-depth node between the two first-occurrence positions. Return the LCA for each [a, b] query in order. edges is a list of [u, v] pairs.",
    starterCode: `def lca_euler_sparse_table(n, edges, root, queries):
    # Your code here
    pass`,
    solution: `def lca_euler_sparse_table(n, edges, root, queries):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for a in adj:
        a.sort()
    depth = [0] * n
    first = [-1] * n
    walk = []

    def dfs(v, parent, d):
        depth[v] = d
        first[v] = len(walk)
        walk.append(v)
        for w in adj[v]:
            if w != parent:
                dfs(w, v, d + 1)
                walk.append(v)

    dfs(root, -1, 0)
    m = len(walk)
    log = [0] * (m + 1)
    for i in range(2, m + 1):
        log[i] = log[i // 2] + 1
    levels = log[m] + 1
    table = [walk[:]]
    for k in range(1, levels):
        span = 1 << (k - 1)
        prev = table[k - 1]
        row = []
        for i in range(m - (1 << k) + 1):
            a = prev[i]
            b = prev[i + span]
            row.append(a if depth[a] <= depth[b] else b)
        table.append(row)

    result = []
    for a, b in queries:
        left = first[a]
        right = first[b]
        if left > right:
            left, right = right, left
        k = log[right - left + 1]
        x = table[k][left]
        y = table[k][right - (1 << k) + 1]
        result.append(x if depth[x] <= depth[y] else y)
    return result`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 0, [[3, 4], [3, 1], [0, 4], [1, 1]]], expected: [0, 1, 0, 1] },
      { input: [4, [[0, 1], [1, 2], [1, 3]], 0, [[2, 3], [0, 1], [3, 0]]], expected: [1, 0, 0] },
      { input: [3, [[0, 1], [1, 2]], 2, [[0, 1], [2, 0]]], expected: [1, 2] },
      { input: [2, [[0, 1]], 0, [[1, 0]]], expected: [0] },
    ],
    hint: "The LCA of two nodes is the shallowest node appearing between their first occurrences in the Euler walk.",
  },
  {
    id: "graph-292",
    title: "Weighted Tree Diameter",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the total weight of the longest path in a weighted tree.\n\nRun one traversal from any node to find a farthest node a, then a second traversal from a to find the farthest distance, which is the diameter. edges is a list of [u, v, weight] triples with non-negative weights. Return the diameter weight.",
    starterCode: `def tree_diameter_weighted(n, edges):
    # Your code here
    pass`,
    solution: `def tree_diameter_weighted(n, edges):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))

    def farthest(start):
        dist = [-1] * n
        dist[start] = 0
        stack = [start]
        best = start
        while stack:
            v = stack.pop()
            if dist[v] > dist[best]:
                best = v
            for w, wt in adj[v]:
                if dist[w] == -1:
                    dist[w] = dist[v] + wt
                    stack.append(w)
        return best, dist[best]

    a, _ = farthest(0)
    b, total = farthest(a)
    return total`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]]], expected: 6 },
      { input: [4, [[0, 1, 5], [0, 2, 1], [0, 3, 1]]], expected: 6 },
      { input: [1, []], expected: 0 },
      { input: [5, [[0, 1, 2], [1, 2, 4], [1, 3, 1], [3, 4, 7]]], expected: 12 },
    ],
    hint: "In a tree, the farthest node from any start is always one endpoint of some diameter.",
  },
  {
    id: "graph-293",
    title: "AHU Canonical Encoding",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the AHU canonical encoding string of an unrooted tree.\n\nRoot the tree at each minimum-degree candidate, encode every rooted tree bottom-up as sorted child encodings wrapped in parentheses, and take the lexicographically smallest encoding as the canonical form. edges is a list of [u, v] pairs. Return that string.",
    starterCode: `def tree_ahu_canonical(n, edges):
    # Your code here
    pass`,
    solution: `def tree_ahu_canonical(n, edges):
    if n == 0:
        return ""
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    def rooted_encoding(root):
        parent = [-2] * n
        parent[root] = -1
        order = [root]
        for v in order:
            for w in adj[v]:
                if parent[w] == -2:
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
    return min(rooted_encoding(c) for c in candidates)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: "(((())))" },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: "((()()))" },
      { input: [1, []], expected: "()" },
      { input: [5, [[0, 1], [1, 2], [1, 3], [3, 4]]], expected: "(((()())))" },
    ],
    hint: "Using every minimum-degree node as a candidate covers the centers of the tree.",
  },
  {
    id: "graph-294",
    title: "Rooted Tree Polynomial Hash",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute a polynomial hash of a tree rooted at root.\n\nWith children of a node sorted by increasing hash and k the number of children, h(v) = ((1 + sum h(c_i) * base^(i+1)) * (k + 1)) mod mod for i starting at 1, using base 131 and mod 1000000007; the arity factor keeps a chain from hashing like a star. Process nodes in reverse BFS order. edges is a list of [u, v] pairs. Return the hash of the root.",
    starterCode: `def rooted_tree_hash(n, edges, root):
    # Your code here
    pass`,
    solution: `def rooted_tree_hash(n, edges, root):
    base = 131
    mod = 1000000007
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    parent = [-2] * n
    parent[root] = -1
    order = [root]
    for v in order:
        for w in adj[v]:
            if parent[w] == -2:
                parent[w] = v
                order.append(w)
    hashes = [0] * n
    for v in reversed(order):
        children = sorted(hashes[w] for w in adj[v] if w != parent[v])
        value = 1
        power = base
        for h in children:
            value = (value + h * power) % mod
            power = (power * base) % mod
        hashes[v] = (value * (len(children) + 1)) % mod
    return hashes[root]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0], expected: 18122542 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: 9061536 },
      { input: [1, [], 0], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [1, 3], [3, 4]], 0], expected: 561079877 },
    ],
    hint: "Sorting sibling hashes before mixing makes the value independent of adjacency order.",
  },
  {
    id: "graph-295",
    title: "Laplacian Eigenvalue Trace Sums",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return the sum and the sum of squares of the Laplacian eigenvalues without computing eigenvalues.\n\nThe trace of L equals the sum of eigenvalues and trace(L^2) equals the sum of squared eigenvalues; build L = D - A and evaluate both by matrix multiplication. edges is a list of [u, v] pairs. Return [trace, trace_square] as integers.",
    starterCode: `def laplacian_spectrum_sums(n, edges):
    # Your code here
    pass`,
    solution: `def laplacian_spectrum_sums(n, edges):
    L = [[0] * n for _ in range(n)]
    for u, v in edges:
        L[u][u] += 1
        L[v][v] += 1
        L[u][v] -= 1
        L[v][u] -= 1
    trace = 0
    square = 0
    for i in range(n):
        trace += L[i][i]
        for j in range(n):
            square += L[i][j] * L[j][i]
    return [trace, square]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [4, 10] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [6, 18] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [6, 18] },
      { input: [1, []], expected: [0, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [8, 24] },
    ],
    hint: "trace(L^2) also equals sum of squared degrees plus twice the number of edges.",
  },
  {
    id: "graph-296",
    title: "Fiedler Rayleigh Quotient",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Evaluate the Rayleigh quotient of a candidate Fiedler vector.\n\nFor the Laplacian L of an undirected graph, compute v^T L v / v^T v, which simplifies to the sum over edges of (v[u] - v[v])^2 divided by the squared norm of v. edges is a list of [u, v] pairs and vector is the candidate float vector. Return 0.0 when the vector is all zeros.",
    starterCode: `def fiedler_rayleigh(n, edges, vector):
    # Your code here
    pass`,
    solution: `def fiedler_rayleigh(n, edges, vector):
    denominator = 0.0
    for x in vector:
        denominator += x * x
    if denominator == 0.0:
        return 0.0
    numerator = 0.0
    for u, v in edges:
        diff = vector[u] - vector[v]
        numerator += diff * diff
    return numerator / denominator`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [1.0, 0.0, -1.0]], expected: 1.0 },
      { input: [3, [[0, 1], [1, 2]], [1.0, 1.0, 1.0]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [1.0, -1.0, 0.0, 0.0]], expected: 3.0 },
      { input: [1, [], [5.0]], expected: 0.0 },
      { input: [3, [[0, 1], [1, 2]], [0.0, 0.0, 0.0]], expected: 0.0 },
    ],
    hint: "The Laplacian quadratic form measures how much the vector changes across edges.",
  },
  {
    id: "graph-297",
    title: "Lazy Walk Mixing Steps Estimate",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Estimate the number of steps a lazy random walk needs to mix within epsilon.\n\nForm the lazy normalized walk M = (I + D^-1/2 A D^-1/2) / 2, deflate the stationary direction D^1/2 1, and run 2000 iterations of power iteration on a deterministic start vector to estimate the second eigenvalue mu. Return ceil(ln(n / epsilon) / (1 - mu)), or -1 when some node is isolated or the gap is non-positive. edges is a list of [u, v] pairs.",
    starterCode: `import math
def mixing_steps_estimate(n, edges, epsilon):
    # Your code here
    pass`,
    solution: `import math
def mixing_steps_estimate(n, edges, epsilon):
    if n <= 1:
        return 0
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    if any(d == 0 for d in degree):
        return -1
    stationary = [math.sqrt(degree[i]) for i in range(n)]
    norm = math.sqrt(sum(t * t for t in stationary))
    stationary = [t / norm for t in stationary]
    x = [float(i + 1) for i in range(n)]
    dot = sum(stationary[i] * x[i] for i in range(n))
    x = [x[i] - dot * stationary[i] for i in range(n)]
    norm = math.sqrt(sum(t * t for t in x))
    if norm == 0.0:
        return -1
    x = [t / norm for t in x]
    mu = 0.0
    for _ in range(2000):
        y = [0.5 * x[i] for i in range(n)]
        for i in range(n):
            acc = 0.0
            for j in adj[i]:
                acc += x[j] / math.sqrt(degree[j])
            y[i] += 0.5 * acc / math.sqrt(degree[i])
        dot = sum(stationary[i] * y[i] for i in range(n))
        y = [y[i] - dot * stationary[i] for i in range(n)]
        norm = math.sqrt(sum(t * t for t in y))
        if norm == 0.0:
            mu = 0.0
            break
        mu = norm
        x = [t / norm for t in y]
    gap = 1.0 - mu
    if gap <= 0.0:
        return -1
    return math.ceil(math.log(n / epsilon) / gap)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0.01], expected: 12 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0.01], expected: 12 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 0.01], expected: 9 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0.05], expected: 32 },
      { input: [3, [[0, 1]], 0.01], expected: -1 },
    ],
    hint: "Deflating the stationary vector makes power iteration converge to the second eigenvalue.",
  },
  {
    id: "graph-298",
    title: "PageRank with Dangling Mass",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one PageRank power iteration that redistributes dangling mass uniformly.\n\nStart from the uniform distribution over n nodes; nodes with out-degree zero contribute their rank to a dangling pool that is spread evenly across all nodes, while every edge forwards damping * rank[u] / out_degree(u) to its target. edges is a list of directed [u, v] pairs and damping is the damping factor. Return the new rank list.",
    starterCode: `def pagerank_dangling(n, edges, damping):
    # Your code here
    pass`,
    solution: `def pagerank_dangling(n, edges, damping):
    if n == 0:
        return []
    rank = [1.0 / n] * n
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    dangling = 0.0
    for u in range(n):
        if out_degree[u] == 0:
            dangling += rank[u]
    base = (1.0 - damping) / n + damping * dangling / n
    new_rank = [base] * n
    for u, v in edges:
        new_rank[v] += damping * rank[u] / out_degree[u]
    return new_rank`,
    testCases: [
      { input: [2, [[0, 1]], 0.85], expected: [0.2875, 0.7124999999999999] },
      { input: [3, [], 0.85], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.5], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [4, [[0, 1], [0, 2], [1, 3]], 0.9], expected: [0.1375, 0.25, 0.25, 0.36250000000000004] },
    ],
    hint: "Forgetting the dangling pool lets probability mass leak out of the graph.",
  },
  {
    id: "graph-299",
    title: "Personalized PageRank Target Mass",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the probability mass landing on a target after a fixed number of personalized PageRank steps.\n\nStart with all rank on source; each step sends (1 - damping) plus all dangling mass back to source, and every edge forwards damping * rank[u] / out_degree(u) to its target. Iterate exactly steps times and return rank[target]. edges is a list of directed [u, v] pairs.",
    starterCode: `def ppr_target_mass(n, edges, source, target, steps, damping):
    # Your code here
    pass`,
    solution: `def ppr_target_mass(n, edges, source, target, steps, damping):
    rank = [0.0] * n
    rank[source] = 1.0
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    for _ in range(steps):
        dangling = 0.0
        for u in range(n):
            if out_degree[u] == 0:
                dangling += rank[u]
        new_rank = [0.0] * n
        new_rank[source] = (1.0 - damping) + damping * dangling
        for u, v in edges:
            new_rank[v] += damping * rank[u] / out_degree[u]
        rank = new_rank
    return rank[target]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2, 2, 0.5], expected: 0.25 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 2, 1, 0.5], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 1, 3, 0.85], expected: 0.06375 },
      { input: [2, [[0, 1]], 1, 1, 0, 0.5], expected: 1.0 },
      { input: [2, [], 0, 1, 2, 0.5], expected: 0.0 },
    ],
    hint: "The teleport term keeps returning mass to the source, so nearby nodes accumulate the most.",
  },
  {
    id: "graph-300",
    title: "Katz Attenuation Radius Check",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Check whether the Katz attenuation factor is small enough for the series to converge.\n\nEstimate the largest eigenvalue of the symmetric adjacency matrix with 1000 power iterations starting from the all-ones vector and the Rayleigh quotient, then return True exactly when alpha * lambda_max < 1. edges is a list of [u, v] pairs with multiplicities collapsed into weights. An empty graph always returns True.",
    starterCode: `import math
def katz_attenuation_check(n, edges, alpha):
    # Your code here
    pass`,
    solution: `import math
def katz_attenuation_check(n, edges, alpha):
    if n == 0:
        return True
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    x = [1.0] * n
    for _ in range(1000):
        y = [0.0] * n
        for u in range(n):
            acc = 0.0
            for v in adj[u]:
                acc += x[v]
            y[u] = acc
        norm = math.sqrt(sum(t * t for t in y))
        if norm == 0.0:
            return True
        x = [t / norm for t in y]
    rayleigh = 0.0
    for u in range(n):
        for v in adj[u]:
            rayleigh += x[u] * x[v]
    return alpha * rayleigh < 1.0`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0.5], expected: true },
      { input: [3, [[0, 1], [1, 2]], 0.8], expected: false },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.4], expected: true },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.6], expected: false },
      { input: [1, [], 0.9], expected: true },
    ],
    hint: "The Katz series converges when the attenuation times the spectral radius stays below one.",
  },
  {
    id: "graph-301",
    title: "Brandes Source Dependencies",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the single-source pair dependencies used by Brandes' betweenness algorithm.\n\nBFS from source builds shortest-path counts sigma and predecessor lists, then nodes are processed in reverse BFS order so each predecessor v gains (sigma[v] / sigma[w]) * (1 + delta[w]). edges is a list of [u, v] pairs of an undirected unweighted graph. Return the dependency array delta with delta[source] = 0.0.",
    starterCode: `def brandes_source_dependencies(n, edges, source):
    # Your code here
    pass`,
    solution: `def brandes_source_dependencies(n, edges, source):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    sigma = [0] * n
    sigma[source] = 1
    dist = [-1] * n
    dist[source] = 0
    pred = [[] for _ in range(n)]
    order = []
    queue = [source]
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        order.append(v)
        for w in adj[v]:
            if dist[w] == -1:
                dist[w] = dist[v] + 1
                queue.append(w)
            if dist[w] == dist[v] + 1:
                sigma[w] += sigma[v]
                pred[w].append(v)
    delta = [0.0] * n
    while order:
        w = order.pop()
        for v in pred[w]:
            delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w])
    delta[source] = 0.0
    return delta`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0], expected: [0.0, 1.0, 0.0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0], expected: [0.0, 0.5, 0.0, 0.5] },
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0], expected: [0.0, 1.0, 1.0, 1.0, 0.0] },
      { input: [1, [], 0], expected: [0.0] },
    ],
    hint: "Dependencies flow backwards from the farthest nodes toward the source.",
  },
  {
    id: "graph-302",
    title: "Harmonic Closeness Centrality",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the harmonic closeness centrality of every node of an undirected unweighted graph.\n\nFor each node sum 1 / d(v, t) over all other reachable nodes t, ignoring unreachable nodes because their reciprocal distance is zero. BFS from every node gives the distances. edges is a list of [u, v] pairs. Return the list of float scores in node order.",
    starterCode: `def harmonic_closeness(n, edges):
    # Your code here
    pass`,
    solution: `def harmonic_closeness(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    result = []
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
        total = 0.0
        for i in range(n):
            if i != source and dist[i] > 0:
                total += 1.0 / dist[i]
        result.append(total)
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [1.5, 2.0, 1.5] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [3.0, 2.0, 2.0, 2.0] },
      { input: [3, [[0, 1]]], expected: [1.0, 1.0, 0.0] },
      { input: [1, []], expected: [0.0] },
    ],
    hint: "Reciprocal distances stay finite for disconnected graphs, unlike the classical closeness.",
  },
  {
    id: "graph-303",
    title: "Eigenvector Power Iteration Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many power iterations eigenvector centrality needs to converge.\n\nStart from the unit all-ones vector, multiply by (A + I) each round and renormalize to unit length, stopping when the largest component change is at most tolerance. Use the +I shift so bipartite graphs still converge. edges is a list of [u, v] pairs. Return the number of iterations performed, capped at 10000.",
    starterCode: `import math
def eigenvector_iteration_count(n, edges, tolerance):
    # Your code here
    pass`,
    solution: `import math
def eigenvector_iteration_count(n, edges, tolerance):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    x = [1.0] * n
    norm = math.sqrt(sum(t * t for t in x))
    x = [t / norm for t in x]
    for iteration in range(1, 10001):
        new = list(x)
        for u in range(n):
            for v in adj[u]:
                new[u] += x[v]
        norm = math.sqrt(sum(t * t for t in new))
        if norm == 0.0:
            return iteration
        new = [t / norm for t in new]
        diff = max(abs(new[i] - x[i]) for i in range(n))
        x = new
        if diff <= tolerance:
            return iteration
    return 10000`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 1e-07], expected: 10 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1e-07], expected: 13 },
      { input: [2, [[0, 1]], 1e-07], expected: 1 },
      { input: [1, [], 1e-07], expected: 1 },
    ],
    hint: "The shift adds one to every adjacency eigenvalue and keeps the iteration away from period two.",
  },
  {
    id: "graph-304",
    title: "Modularity Delta on Community Merge",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the modularity change caused by merging two communities.\n\nWith m edges, merging A and B changes modularity by e_AB / m - (d_A * d_B) / (2 * m^2), where e_AB counts edges between the communities and d_A, d_B sum degrees inside each. edges is a list of [u, v] pairs and community maps nodes to community ids. Return the float delta, or 0.0 when m is zero or a equals b.",
    starterCode: `def modularity_delta_merge(n, edges, community, a, b):
    # Your code here
    pass`,
    solution: `def modularity_delta_merge(n, edges, community, a, b):
    m = len(edges)
    if m == 0 or a == b:
        return 0.0
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    d_a = 0
    d_b = 0
    for i in range(n):
        if community[i] == a:
            d_a += degree[i]
        elif community[i] == b:
            d_b += degree[i]
    cross = 0
    for u, v in edges:
        if (community[u] == a and community[v] == b) or (community[u] == b and community[v] == a):
            cross += 1
    return cross / m - (d_a * d_b) / (2.0 * m * m)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1, 2, 3], 0, 1], expected: 0.2222222222222222 },
      { input: [4, [[0, 1], [2, 3]], [0, 0, 1, 1], 0, 1], expected: -0.5 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 0, 1], 0, 1], expected: 0.2222222222222222 },
      { input: [2, [], [0, 1], 0, 1], expected: 0.0 },
      { input: [2, [[0, 1]], [0, 0], 0, 0], expected: 0.0 },
    ],
    hint: "Internal edges reward the merge while the degree product penalizes it.",
  },
  {
    id: "graph-305",
    title: "Girvan-Newman Removal Sequence",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Run several Girvan-Newman steps and return the sequence of removed edges.\n\nEach step recomputes undirected edge betweenness with Brandes' algorithm on the current graph, removes the edge with the highest score, breaking ties by the smallest [min, max] endpoint pair, and records it. edges is the original list of [u, v] pairs of a simple graph and steps is the number of removals. Return the removed edges in order.",
    starterCode: `def girvan_newman_edge_sequence(n, edges, steps):
    # Your code here
    pass`,
    solution: `def girvan_newman_edge_sequence(n, edges, steps):
    remaining = [[min(u, v), max(u, v)] for u, v in edges]
    remaining.sort()
    removed = []
    for _ in range(steps):
        if not remaining:
            break
        adj = [[] for _ in range(n)]
        for i, (u, v) in enumerate(remaining):
            adj[u].append((v, i))
            adj[v].append((u, i))
        score = [0.0] * len(remaining)
        for s in range(n):
            sigma = [0] * n
            sigma[s] = 1
            dist = [-1] * n
            dist[s] = 0
            pred = [[] for _ in range(n)]
            order = []
            queue = [s]
            head = 0
            while head < len(queue):
                v = queue[head]
                head += 1
                order.append(v)
                for w, eid in adj[v]:
                    if dist[w] == -1:
                        dist[w] = dist[v] + 1
                        queue.append(w)
                    if dist[w] == dist[v] + 1:
                        sigma[w] += sigma[v]
                        pred[w].append((v, eid))
            delta = [0.0] * n
            while order:
                w = order.pop()
                for v, eid in pred[w]:
                    contribution = (sigma[v] / sigma[w]) * (1.0 + delta[w])
                    delta[v] += contribution
                    score[eid] += contribution
        best = 0
        for i in range(1, len(remaining)):
            si = round(score[i], 9)
            sb = round(score[best], 9)
            if si > sb or (si == sb and remaining[i] < remaining[best]):
                best = i
        removed.append(list(remaining[best]))
        remaining.pop(best)
    return removed`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [3, 5]], 2], expected: [[2, 3], [0, 1]] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2], expected: [[0, 1], [2, 3]] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]], 3], expected: [[2, 3], [0, 1], [0, 2]] },
      { input: [3, [[0, 1], [0, 2], [1, 2]], 1], expected: [[0, 1]] },
    ],
    hint: "After the bridge disappears, each community becomes a symmetric cycle where every edge ties.",
  },
  {
    id: "graph-306",
    title: "Label Propagation Rounds",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the synchronous rounds label propagation needs until labels stop changing.\n\nEvery node starts with its own index as its label; each round each node adopts the most frequent label among its neighbors, ties going to the smallest label, while isolated nodes keep their label. If labels change every round for 100 rounds return -1, otherwise return the number of rounds performed including the final stable one. edges is a list of [u, v] pairs.",
    starterCode: `def label_propagation_rounds(n, edges):
    # Your code here
    pass`,
    solution: `def label_propagation_rounds(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    labels = list(range(n))
    rounds = 0
    for _ in range(100):
        new_labels = []
        for v in range(n):
            if not adj[v]:
                new_labels.append(labels[v])
                continue
            counts = {}
            for w in adj[v]:
                lab = labels[w]
                counts[lab] = counts.get(lab, 0) + 1
            best = None
            for lab in sorted(counts):
                if best is None or counts[lab] > counts[best]:
                    best = lab
            new_labels.append(best)
        rounds += 1
        if new_labels == labels:
            return rounds
        labels = new_labels
    return -1`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 3 },
      { input: [3, [[0, 1], [1, 2]]], expected: -1 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 3 },
      { input: [6, [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [3, 5]]], expected: 4 },
      { input: [2, [[0, 1]]], expected: -1 },
    ],
    hint: "Bipartite graphs tend to oscillate forever, so the round cap matters.",
  },
  {
    id: "graph-307",
    title: "Spectral Partition Cut Weight",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the number of edges crossing the spectral bipartition of a connected graph.\n\nAfter seeding random with 12345, run 3000 deflated power iterations on M = (d_max + 1) * I - L with the constant direction removed, so the vector converges to the Fiedler eigenvector; flip it so its largest-magnitude entry is positive, then split nodes by sign (non-negative versus negative). edges is a list of [u, v] pairs. Return the count of edges between the two sides.",
    starterCode: `import random
def spectral_cut_weight(n, edges):
    # Your code here
    pass`,
    solution: `import random
def spectral_cut_weight(n, edges):
    if n == 0:
        return 0
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    shift = max(degree) + 1
    random.seed(12345)
    x = [random.random() - 0.5 for _ in range(n)]
    mean = sum(x) / n
    x = [t - mean for t in x]
    norm = sum(t * t for t in x) ** 0.5
    if norm == 0.0:
        return 0
    x = [t / norm for t in x]
    for _ in range(3000):
        y = [(shift - degree[i]) * x[i] for i in range(n)]
        for u, v in edges:
            y[u] += x[v]
            y[v] += x[u]
        mean = sum(y) / n
        y = [t - mean for t in y]
        norm = sum(t * t for t in y) ** 0.5
        if norm == 0.0:
            return 0
        x = [t / norm for t in y]
    pivot = max(range(n), key=lambda i: abs(x[i]))
    if x[pivot] < 0.0:
        x = [-t for t in x]
    side = [t >= 0.0 for t in x]
    cut = 0
    for u, v in edges:
        if side[u] != side[v]:
            cut += 1
    return cut`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [3, 5]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 1 },
    ],
    hint: "Subtracting the mean each round keeps the power iteration orthogonal to the constant eigenvector.",
  },
  {
    id: "graph-308",
    title: "Minimum Arborescence Total Cost",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the minimum total weight of a spanning arborescence rooted at root.\n\nEnumerate every assignment of one incoming edge to each non-root node, keep the assignments where following parent pointers from every node reaches the root without a cycle, and return the smallest total weight. edges is a list of directed [u, v, w] triples; n is small. Return -1 when no arborescence exists.",
    starterCode: `def min_arborescence_cost(n, edges, root):
    # Your code here
    pass`,
    solution: `def min_arborescence_cost(n, edges, root):
    if n == 0:
        return 0
    incoming = [[] for _ in range(n)]
    for u, v, w in edges:
        if v != root:
            incoming[v].append((w, u))
    for lst in incoming:
        lst.sort()
    nodes = [v for v in range(n) if v != root]
    best = [None]
    parent = [-1] * n

    def valid():
        for v in nodes:
            seen = set()
            x = v
            while x != root:
                if x in seen or parent[x] == -1:
                    return False
                seen.add(x)
                x = parent[x]
        return True

    def search(index, total):
        if index == len(nodes):
            if valid():
                if best[0] is None or total < best[0]:
                    best[0] = total
            return
        v = nodes[index]
        for w, u in incoming[v]:
            parent[v] = u
            search(index + 1, total + w)
        parent[v] = -1

    search(0, 0)
    return best[0] if best[0] is not None else -1`,
    testCases: [
      { input: [3, [[0, 1, 2], [1, 2, 1], [0, 2, 5]], 0], expected: 3 },
      { input: [3, [[0, 1, 3], [0, 2, 4], [1, 2, 1], [2, 1, 1]], 0], expected: 4 },
      { input: [3, [[0, 1, 1], [1, 0, 1]], 0], expected: -1 },
      { input: [1, [], 0], expected: 0 },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 10]], 0], expected: 3 },
    ],
    hint: "Every arborescence corresponds to exactly one choice of incoming edge per non-root node.",
  },
  {
    id: "graph-309",
    title: "Chinese Postman Added Weight",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the minimum extra weight needed to make an undirected weighted graph Eulerian, as in the Chinese postman problem.\n\nFind all odd-degree vertices, compute all-pairs shortest paths with Floyd-Warshall, and pair the odd vertices with minimum total distance using a bitmask DP. edges is a list of [u, v, weight] triples of a connected graph. Return the added weight, or -1 when the odd vertices cannot be paired.",
    starterCode: `def chinese_postman_added_weight(n, edges):
    # Your code here
    pass`,
    solution: `def chinese_postman_added_weight(n, edges):
    if n == 0:
        return 0
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    degree = [0] * n
    for u, v, w in edges:
        degree[u] += 1
        degree[v] += 1
        if w < dist[u][v]:
            dist[u][v] = w
            dist[v][u] = w
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                candidate = dist[i][k] + dist[k][j]
                if candidate < dist[i][j]:
                    dist[i][j] = candidate
    odd = [v for v in range(n) if degree[v] % 2 == 1]
    k = len(odd)
    if k == 0:
        return 0
    full = (1 << k) - 1
    dp = [INF] * (1 << k)
    dp[0] = 0
    for mask in range(1 << k):
        if dp[mask] == INF or mask == full:
            continue
        i = 0
        while (mask >> i) & 1:
            i += 1
        for j in range(i + 1, k):
            if not (mask >> j) & 1:
                d = dist[odd[i]][odd[j]]
                if d == INF:
                    continue
                new_mask = mask | (1 << i) | (1 << j)
                if dp[mask] + d < dp[new_mask]:
                    dp[new_mask] = dp[mask] + d
    return dp[full] if dp[full] < INF else -1`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, 2]]], expected: 3 },
      { input: [3, [[0, 1, 1], [1, 2, 1], [2, 0, 1]]], expected: 0 },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]]], expected: 0 },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1], [0, 2, 5]]], expected: 2 },
      { input: [4, [[0, 1, 1], [0, 2, 1], [0, 3, 1]]], expected: 3 },
    ],
    hint: "Duplicating the edges of a minimum-weight perfect matching of the odd vertices balances every degree.",
  },
  {
    id: "graph-310",
    title: "TSP Held-Karp State Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Run the Held-Karp bitmask DP and report how many states are reachable plus the optimal tour cost.\n\ndist is a symmetric matrix where dist[i][j] = -1 marks a missing edge; dp[mask][j] is the cheapest path starting at 0, visiting exactly the nodes in mask, and ending at j. Count every finite state, including the initial state (mask = 1, j = 0). Return [state_count, optimal_cost], with optimal_cost = -1 when no Hamiltonian cycle exists.",
    starterCode: `def tsp_bitmask_state_count(n, dist):
    # Your code here
    pass`,
    solution: `def tsp_bitmask_state_count(n, dist):
    if n == 0:
        return [0, -1]
    if n == 1:
        return [1, 0]
    INF = float('inf')
    size = 1 << n
    dp = [[INF] * n for _ in range(size)]
    dp[1][0] = 0
    count = 1
    for mask in range(1, size):
        if not (mask & 1):
            continue
        for last in range(n):
            if dp[mask][last] == INF:
                continue
            for nxt in range(n):
                if nxt == 0 or (mask >> nxt) & 1:
                    continue
                weight = dist[last][nxt]
                if weight < 0:
                    continue
                new_mask = mask | (1 << nxt)
                candidate = dp[mask][last] + weight
                if dp[new_mask][nxt] == INF:
                    count += 1
                if candidate < dp[new_mask][nxt]:
                    dp[new_mask][nxt] = candidate
    full = size - 1
    best = INF
    for last in range(1, n):
        if dp[full][last] < INF:
            weight = dist[last][0]
            if weight >= 0 and dp[full][last] + weight < best:
                best = dp[full][last] + weight
    return [count, -1 if best == INF else best]`,
    testCases: [
      { input: [4, [[0, 1, 2, 3], [1, 0, 4, 5], [2, 4, 0, 6], [3, 5, 6, 0]]], expected: [13, 14] },
      { input: [4, [[0, 1, -1, 3], [1, 0, 4, -1], [-1, 4, 0, 6], [3, -1, 6, 0]]], expected: [7, 14] },
      { input: [3, [[0, 2, 3], [2, 0, 4], [3, 4, 0]]], expected: [5, 9] },
      { input: [1, [[0]]], expected: [1, 0] },
      { input: [3, [[0, 1, -1], [1, 0, -1], [-1, -1, 0]]], expected: [2, -1] },
    ],
    hint: "Adding a node extends the mask and gives one new state per possible last city.",
  },
  {
    id: "graph-311",
    title: "Steiner Tree Three Terminals",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the minimum weight of a connected subgraph spanning three terminals.\n\nThe optimal three-terminal Steiner tree is a star centered at some vertex when shortest-path distances are used, so run Floyd-Warshall and return the minimum over all v of dist(a, v) + dist(b, v) + dist(c, v). edges is a list of [u, v, weight] triples with non-negative weights and a, b, c are distinct terminals. Return -1 when no center connects all three.",
    starterCode: `def steiner_three_terminal(n, edges, a, b, c):
    # Your code here
    pass`,
    solution: `def steiner_three_terminal(n, edges, a, b, c):
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
            dist[v][u] = w
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                candidate = dist[i][k] + dist[k][j]
                if candidate < dist[i][j]:
                    dist[i][j] = candidate
    best = INF
    for v in range(n):
        if dist[a][v] < INF and dist[b][v] < INF and dist[c][v] < INF:
            total = dist[a][v] + dist[b][v] + dist[c][v]
            if total < best:
                best = total
    return -1 if best == INF else best`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1]], 0, 1, 2], expected: 2 },
      { input: [5, [[0, 1, 2], [1, 2, 2], [2, 3, 2], [3, 4, 2]], 0, 2, 4], expected: 8 },
      { input: [4, [[0, 1, 5], [1, 2, 5], [2, 3, 5], [0, 3, 1]], 1, 3, 0], expected: 6 },
      { input: [3, [[0, 1, 4]], 0, 1, 2], expected: -1 },
      { input: [3, [[0, 1, 1], [1, 2, 1], [2, 0, 1]], 0, 1, 2], expected: 2 },
    ],
    hint: "Any branching point of a three-terminal tree is the meeting node of the three shortest paths.",
  },
  {
    id: "graph-312",
    title: "Network Reliability by Enumeration",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the probability that every node of a small graph stays connected when each edge survives independently with probability p.\n\nEnumerate all 2^m edge subsets, keep the ones whose union-find structure joins all n nodes into one component, and sum p^k * (1 - p)^(m - k) for k surviving edges. edges is a list of [u, v] pairs. Return the reliability as a float; for n at most 1 return 1.0.",
    starterCode: `def network_reliability(n, edges, p):
    # Your code here
    pass`,
    solution: `def network_reliability(n, edges, p):
    m = len(edges)
    total = 0.0
    for mask in range(1 << m):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        alive = 0
        for i, (u, v) in enumerate(edges):
            if (mask >> i) & 1:
                alive += 1
                ru = find(u)
                rv = find(v)
                if ru != rv:
                    parent[ru] = rv
        roots = set(find(i) for i in range(n))
        if len(roots) == 1:
            total += (p ** alive) * ((1.0 - p) ** (m - alive))
    return total`,
    testCases: [
      { input: [2, [[0, 1]], 0.5], expected: 0.5 },
      { input: [3, [[0, 1], [1, 2]], 0.5], expected: 0.25 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.5], expected: 0.5 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0.5], expected: 0.3125 },
      { input: [3, [[0, 1], [1, 2]], 1.0], expected: 1.0 },
    ],
    hint: "Only subsets spanning all nodes contribute, weighted by the number of surviving edges.",
  },
  {
    id: "graph-313",
    title: "Bandwidth Lower Bound Formula",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute a simple lower bound on the bandwidth of a connected undirected graph.\n\nAny hub needs room for its neighbors within its own position plus or minus the bandwidth, and a layout has to stretch across the diameter, so the bound is max(ceil(max_degree / 2), ceil((n - 1) / diameter)). edges is a list of [u, v] pairs of a connected graph. Return 0 when n is at most 1, otherwise the integer bound.",
    starterCode: `def bandwidth_lower_bound(n, edges):
    # Your code here
    pass`,
    solution: `def bandwidth_lower_bound(n, edges):
    if n <= 1:
        return 0
    adj = [[] for _ in range(n)]
    degree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
        degree[u] += 1
        degree[v] += 1
    max_degree = max(degree)
    diameter = 0
    for start in range(n):
        dist = [-1] * n
        dist[start] = 0
        queue = [start]
        head = 0
        while head < len(queue):
            v = queue[head]
            head += 1
            for w in adj[v]:
                if dist[w] == -1:
                    dist[w] = dist[v] + 1
                    queue.append(w)
        if any(d == -1 for d in dist):
            continue
        far = max(dist)
        if far > diameter:
            diameter = far
    degree_bound = (max_degree + 1) // 2
    diameter_bound = (n - 1 + diameter - 1) // diameter if diameter > 0 else 0
    return max(degree_bound, diameter_bound)`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 2 },
      { input: [5, [[0, 1], [0, 2], [0, 3], [0, 4]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
      { input: [1, []], expected: 0 },
    ],
    hint: "Both the busiest vertex and the farthest pair impose independent constraints on the layout.",
  },
  {
    id: "graph-314",
    title: "K4 Minor Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether an undirected graph has a K4 minor, which is equivalent to treewidth at least 3.\n\nEnumerate all assignments of the n vertices to four non-empty blocks, keep the assignments where every block is connected and every pair of blocks has an edge between them, and return True if any assignment survives. edges is a list of [u, v] pairs and n is small. Graphs with fewer than four vertices return False.",
    starterCode: `def k4_minor_check(n, edges):
    # Your code here
    pass`,
    solution: `def k4_minor_check(n, edges):
    if n < 4:
        return False
    adj = [[False] * n for _ in range(n)]
    for u, v in edges:
        adj[u][v] = True
        adj[v][u] = True
    for code in range(4 ** n):
        blocks = [[], [], [], []]
        x = code
        for v in range(n):
            blocks[x % 4].append(v)
            x //= 4
        if any(len(b) == 0 for b in blocks):
            continue
        ok = True
        for block in blocks:
            seen = {block[0]}
            stack = [block[0]]
            while stack:
                v = stack.pop()
                for w in block:
                    if w not in seen and adj[v][w]:
                        seen.add(w)
                        stack.append(w)
            if len(seen) != len(block):
                ok = False
                break
        if not ok:
            continue
        for i in range(4):
            for j in range(i + 1, 4):
                if not any(adj[a][b] for a in blocks[i] for b in blocks[j]):
                    ok = False
                    break
            if not ok:
                break
        if ok:
            return True
    return False`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: true },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: false },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: false },
      { input: [5, [[0, 1], [0, 2], [0, 3], [0, 4]]], expected: false },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: false },
    ],
    hint: "Each block of a minor model must be connected and adjacent to every other block.",
  },
  {
    id: "graph-315",
    title: "Dinic Level Graph Depth",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the BFS level of the sink in Dinic's residual level graph.\n\nBuild the residual capacity matrix from the directed edges, run a BFS from s that only follows positive residual capacity, and return level[t]; the level counts the number of residual edges on the shortest augmenting path. edges is a list of [u, v, capacity] triples. Return -1 when t is unreachable.",
    starterCode: `def dinic_level_depth(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def dinic_level_depth(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
    level = [-1] * n
    level[s] = 0
    queue = [s]
    head = 0
    while head < len(queue):
        x = queue[head]
        head += 1
        for y in range(n):
            if level[y] == -1 and cap[x][y] > 0:
                level[y] = level[x] + 1
                queue.append(y)
    return level[t]`,
    testCases: [
      { input: [4, [[0, 1, 3], [0, 2, 2], [1, 2, 5], [1, 3, 2], [2, 3, 3]], 0, 3], expected: 2 },
      { input: [3, [[0, 1, 5]], 0, 2], expected: -1 },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1]], 0, 3], expected: 3 },
      { input: [4, [[0, 1, 0], [1, 2, 5]], 0, 2], expected: -1 },
      { input: [2, [[0, 1, 7]], 0, 1], expected: 1 },
    ],
    hint: "The BFS levels form the layered graph that Dinic's blocking flow must respect.",
  },
];
