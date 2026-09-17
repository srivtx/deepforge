import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-316",
    title: "Directed Adjacency List",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build an adjacency list for a directed graph from an edge list.\n\nedges is a list of directed [u, v] pairs. Return a list of n lists where entry u holds the sorted out-neighbors of node u. Nodes with no outgoing edges get an empty list.",
    starterCode: `def directed_adjacency_list(n, edges):
    # Your code here
    pass`,
    solution: `def directed_adjacency_list(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    for neighbors in adj:
        neighbors.sort()
    return adj`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[1], [2], [0]] },
      { input: [4, []], expected: [[], [], [], []] },
      { input: [4, [[3, 1], [0, 3], [3, 0]]], expected: [[3], [], [], [0, 1]] },
      { input: [3, [[1, 1], [2, 0]]], expected: [[], [1], [0]] },
    ],
    hint: "Only record u to v for each directed edge, then sort every neighbor list.",
  },
  {
    id: "graph-317",
    title: "Adjacency List to Edge List",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Convert an undirected adjacency list back into a sorted edge list.\n\nadj[u] lists the neighbors of node u and the representation is symmetric. Return every edge once as [u, v] with u < v, sorted in ascending order. Isolated nodes simply contribute no edges.",
    starterCode: `def adjacency_list_to_edges(adj):
    # Your code here
    pass`,
    solution: `def adjacency_list_to_edges(adj):
    edges = []
    for u in range(len(adj)):
        for v in adj[u]:
            if u < v:
                edges.append([u, v])
    edges.sort()
    return edges`,
    testCases: [
      { input: [[[1], [0]]], expected: [[0, 1]] },
      { input: [[[1, 2], [0], [0]]], expected: [[0, 1], [0, 2]] },
      { input: [[[], [], []]], expected: [] },
      { input: [[[1, 2, 3], [0, 2], [0, 1], [0]]], expected: [[0, 1], [0, 2], [0, 3], [1, 2]] },
    ],
    hint: "Keep only the direction where u is smaller than v to avoid listing each edge twice.",
  },
  {
    id: "graph-318",
    title: "Sorted Out-Degree Sequence",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the out-degree of every node and return the sequence sorted in descending order.\n\nedges is a list of directed [u, v] pairs and out-degree counts how many edges leave a node. Return a list of n numbers, largest first, so isolated nodes appear as trailing zeros.",
    starterCode: `def sorted_out_degrees(n, edges):
    # Your code here
    pass`,
    solution: `def sorted_out_degrees(n, edges):
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    out_degree.sort(reverse=True)
    return out_degree`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1, 1, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [3, 0, 0, 0] },
      { input: [1, []], expected: [0] },
      { input: [3, []], expected: [0, 0, 0] },
    ],
    hint: "Tally one increment for the source of each directed edge.",
  },
  {
    id: "graph-319",
    title: "Handshake Edge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Recover the number of undirected edges from a degree sequence using the handshake lemma.\n\nEach undirected edge contributes 2 to the degree sum, so return total // 2. If the sum is odd the sequence cannot come from any graph, so return -1 instead.",
    starterCode: `def edge_count_from_degrees(degrees):
    # Your code here
    pass`,
    solution: `def edge_count_from_degrees(degrees):
    total = sum(degrees)
    if total % 2 != 0:
        return -1
    return total // 2`,
    testCases: [
      { input: [[2, 2, 2]], expected: 3 },
      { input: [[1, 1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[3]], expected: -1 },
      { input: [[0, 0, 0]], expected: 0 },
    ],
    hint: "Sum the degrees, reject odd sums, then divide by two.",
  },
  {
    id: "graph-320",
    title: "Sparse vs Dense Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Classify a graph as sparse or dense using the classic O(n log n) edge bound.\n\nGiven n nodes and m edges, compute threshold = n times floor(log2(n)) for n >= 2 and 0 otherwise. Return [threshold, m, label] where label is \"sparse\" when m <= threshold and \"dense\" otherwise.",
    starterCode: `def sparse_or_dense(n, m):
    # Your code here
    pass`,
    solution: `def sparse_or_dense(n, m):
    if n >= 2:
        threshold = n * (n.bit_length() - 1)
    else:
        threshold = 0
    label = "sparse" if m <= threshold else "dense"
    return [threshold, m, label]`,
    testCases: [
      { input: [8, 24], expected: [24, 24, "sparse"] },
      { input: [8, 25], expected: [24, 25, "dense"] },
      { input: [1, 0], expected: [0, 0, "sparse"] },
      { input: [4, 6], expected: [8, 6, "sparse"] },
      { input: [10, 40], expected: [30, 40, "dense"] },
    ],
    hint: "n.bit_length() - 1 equals floor(log2(n)) for n >= 1, so no import is needed.",
  },
  {
    id: "graph-321",
    title: "BFS Distance Sum",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Sum the BFS distances from a start node to every reachable node in an unweighted undirected graph.\n\nedges is a list of [u, v] pairs and start is a single node. Distances already include the start itself at distance 0, which contributes nothing to the sum. Unreachable nodes are ignored, so return 0 when start is isolated.",
    starterCode: `def bfs_distance_sum(n, edges, start):
    # Your code here
    pass`,
    solution: `def bfs_distance_sum(n, edges, start):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    dist[start] = 0
    queue = [start]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return sum(d for d in dist if d > 0)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0], expected: 6 },
      { input: [5, [[0, 1], [0, 2]], 0], expected: 2 },
      { input: [3, [], 1], expected: 0 },
      { input: [4, [[0, 1], [2, 3]], 0], expected: 1 },
      { input: [2, [[0, 1]], 0], expected: 1 },
    ],
    hint: "Run a standard BFS, then add up the positive distances only.",
  },
  {
    id: "graph-322",
    title: "DFS Finish Order",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the postorder in which nodes finish during an iterative depth-first search.\n\nedges is an undirected edge list, start is the DFS root, and neighbors are visited from smallest index to largest. A node enters the output only after all of its descendants have finished. Nodes unreachable from start never finish and are omitted.",
    starterCode: `def dfs_finish_order(n, edges, start):
    # Your code here
    pass`,
    solution: `def dfs_finish_order(n, edges, start):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for neighbors in adj:
        neighbors.sort(reverse=True)
    visited = [False] * n
    order = []
    stack = [(start, False)]
    while stack:
        node, expanded = stack.pop()
        if expanded:
            order.append(node)
            continue
        if visited[node]:
            continue
        visited[node] = True
        stack.append((node, True))
        for v in adj[node]:
            if not visited[v]:
                stack.append((v, False))
    return order`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0], expected: [2, 1, 0] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: [1, 2, 3, 0] },
      { input: [2, [], 1], expected: [1] },
      { input: [5, [[0, 1], [2, 3]], 2], expected: [3, 2] },
    ],
    hint: "Push a second copy of a node so it is appended after its children pop.",
  },
  {
    id: "graph-323",
    title: "Component Size Multiset",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return the sizes of all connected components in ascending order.\n\nedges is an undirected edge list and isolated nodes count as components of size 1. Traverse every unvisited node, measure the reachable region, and collect its size. The output is the sorted multiset of those sizes.",
    starterCode: `def component_sizes(n, edges):
    # Your code here
    pass`,
    solution: `def component_sizes(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * n
    sizes = []
    for s in range(n):
        if visited[s]:
            continue
        visited[s] = True
        stack = [s]
        size = 0
        while stack:
            u = stack.pop()
            size += 1
            for v in adj[u]:
                if not visited[v]:
                    visited[v] = True
                    stack.append(v)
        sizes.append(size)
    sizes.sort()
    return sizes`,
    testCases: [
      { input: [4, [[0, 1], [2, 3]]], expected: [2, 2] },
      { input: [5, []], expected: [1, 1, 1, 1, 1] },
      { input: [3, [[0, 1], [1, 2]]], expected: [3] },
      { input: [6, [[0, 1], [2, 3], [4, 5]]], expected: [2, 2, 2] },
    ],
    hint: "Flood fill from each unvisited node, then sort the collected sizes.",
  },
  {
    id: "graph-324",
    title: "BFS Level Counts",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many nodes sit at each BFS distance from a source.\n\nedges is an undirected edge list and start is the source node. Return a list whose index d holds the number of nodes at distance d from start, beginning with the source at index 0. Nodes in other components are unreachable and are not counted.",
    starterCode: `def bfs_level_counts(n, edges, start):
    # Your code here
    pass`,
    solution: `def bfs_level_counts(n, edges, start):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    dist[start] = 0
    queue = [start]
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    max_level = max(dist)
    counts = [0] * (max_level + 1)
    for d in dist:
        if d >= 0:
            counts[d] += 1
    return counts`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3]], 0], expected: [1, 2, 1] },
      { input: [5, [[0, 1], [2, 3]], 0], expected: [1, 1] },
      { input: [3, [], 2], expected: [1] },
      { input: [3, [[0, 1], [1, 2]], 0], expected: [1, 1, 1] },
    ],
    hint: "First compute every distance with BFS, then bin the visited nodes by distance.",
  },
  {
    id: "graph-325",
    title: "Smallest Node on a Cycle",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the lowest-index node that lies on at least one directed cycle.\n\nedges is a list of directed [u, v] pairs and n is small, so a separate reachability check from each node is affordable. Node s lies on a cycle when some node in adj[s] can reach s again, which includes the self-loop case. Return the smallest such s, or -1 when the graph is a DAG.",
    starterCode: `def smallest_cycle_node(n, edges):
    # Your code here
    pass`,
    solution: `def smallest_cycle_node(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    for s in range(n):
        seen = [False] * n
        stack = list(adj[s])
        found = False
        while stack:
            x = stack.pop()
            if x == s:
                found = True
                break
            if seen[x]:
                continue
            seen[x] = True
            for y in adj[x]:
                stack.append(y)
        if found:
            return s
    return -1`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 0 },
      { input: [4, [[1, 2], [2, 3], [3, 1]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2]]], expected: -1 },
      { input: [3, [[2, 2]]], expected: 2 },
      { input: [4, [[0, 1], [2, 3]]], expected: -1 },
    ],
    hint: "A node is cyclic exactly when one of its out-neighbors can walk back to it.",
  },
  {
    id: "graph-326",
    title: "First Cycle Edge via Union-Find",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Process undirected edges in order and report the first one that closes a cycle.\n\nMaintain a union-find structure; an edge [u, v] creates a cycle when u and v already share a root. Return that edge exactly as given, or an empty list when the graph stays a forest. Assume no self-loops appear before a repeated connection.",
    starterCode: `def first_cycle_edge(n, edges):
    # Your code here
    pass`,
    solution: `def first_cycle_edge(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]
        parent[ru] = rv
    return []`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0]]], expected: [2, 0] },
      { input: [3, [[0, 1], [1, 2]]], expected: [] },
      { input: [4, [[0, 1], [0, 1]]], expected: [0, 1] },
      { input: [5, [[0, 1], [2, 3], [1, 2], [3, 4], [4, 0]]], expected: [4, 0] },
    ],
    hint: "An edge is redundant exactly when its two endpoints already have the same root.",
  },
  {
    id: "graph-327",
    title: "Feedback Edge Set Size",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute how many undirected edges must be deleted to make the graph acyclic.\n\nA forest with c components and n nodes has n - c edges, so the answer is m - (n - c), where m is the number of edges. Count the components with union-find first. Return 0 for an empty graph.",
    starterCode: `def feedback_edge_count(n, edges):
    # Your code here
    pass`,
    solution: `def feedback_edge_count(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            components -= 1
    return len(edges) - n + components`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
      { input: [3, [[0, 1], [1, 2]]], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 1 },
      { input: [5, []], expected: 0 },
      { input: [2, [[0, 1], [0, 1]]], expected: 1 },
    ],
    hint: "Every component with k nodes and k - 1 edges is a tree; extra edges are the culprits.",
  },
  {
    id: "graph-328",
    title: "Smallest Topological Order",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the lexicographically smallest topological order of a directed graph.\n\nRun Kahn's algorithm but keep the ready set in a min-heap so the smallest available node is always emitted next. edges is a list of directed [u, v] pairs. If the graph has a cycle, return an empty list.",
    starterCode: `import heapq

def smallest_topological_order(n, edges):
    # Your code here
    pass`,
    solution: `import heapq

def smallest_topological_order(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    heap = [x for x in range(n) if indeg[x] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(heap, v)
    if len(order) != n:
        return []
    return order`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [3, [[2, 0], [2, 1]]], expected: [2, 0, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [1, []], expected: [0] },
      { input: [4, [[3, 1], [1, 0]]], expected: [2, 3, 1, 0] },
    ],
    hint: "Swapping the queue for a heap turns any Kahn order into the smallest one.",
  },
  {
    id: "graph-329",
    title: "DFS Topological Order",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Produce a topological order with depth-first search instead of Kahn's algorithm.\n\nVisit start nodes in increasing index order and each node's out-neighbors in increasing index order, appending nodes to a postorder list when their recursion finishes. Reverse the postorder at the end. If a gray node is reached again a directed cycle exists, so return an empty list.",
    starterCode: `def dfs_topological_order(n, edges):
    # Your code here
    pass`,
    solution: `def dfs_topological_order(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    for neighbors in adj:
        neighbors.sort()
    state = [0] * n
    order = []

    def visit(u):
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return False
            if state[v] == 0 and not visit(v):
                return False
        state[u] = 2
        order.append(u)
        return True

    for s in range(n):
        if state[s] == 0 and not visit(s):
            return []
    order.reverse()
    return order`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: [0, 2, 1, 3] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [1, []], expected: [0] },
      { input: [4, [[0, 1], [1, 2], [0, 2]]], expected: [3, 0, 1, 2] },
      { input: [3, []], expected: [2, 1, 0] },
    ],
    hint: "A node is finished only after every descendant completes; seeing a gray node means a cycle.",
  },
  {
    id: "graph-330",
    title: "Dijkstra Directed Distances",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest distances in a directed graph with positive weights.\n\nedges is a list of [u, v, w] triples where w > 0, and source is a node index. Return the distance list in node order, using -1 for nodes that cannot be reached from the source. The method must be Dijkstra with a heap, not Bellman-Ford.",
    starterCode: `import heapq

def dijkstra_distances(n, edges, source):
    # Your code here
    pass`,
    solution: `import heapq

def dijkstra_distances(n, edges, source):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [-1] * n
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            nd = d + w
            if dist[v] == -1 or nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))
    return dist`,
    testCases: [
      { input: [4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0], expected: [0, 3, 1, 4] },
      { input: [3, [[0, 1, 1]], 0], expected: [0, 1, -1] },
      { input: [2, [[0, 1, 7], [1, 0, 2]], 1], expected: [2, 0] },
      { input: [1, [], 0], expected: [0] },
      { input: [3, [[0, 1, 5], [0, 2, 2], [2, 1, 1]], 0], expected: [0, 3, 2] },
    ],
    hint: "Use -1 to mean infinite, and skip heap entries that are stale.",
  },
  {
    id: "graph-331",
    title: "Dijkstra Shortest Path Trace",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Reconstruct one concrete shortest path in an undirected graph with positive weights.\n\nedges is a list of [u, v, w] triples and both directions are usable. Track predecessors whenever a strict distance improvement happens, then walk backward from target to source. Return [] when target is unreachable and [source] when both nodes are equal.",
    starterCode: `import heapq

def dijkstra_path(n, edges, source, target):
    # Your code here
    pass`,
    solution: `import heapq

def dijkstra_path(n, edges, source, target):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    INF = float("inf")
    dist = [INF] * n
    prev = [-1] * n
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                prev[v] = u
                heapq.heappush(heap, (nd, v))
    if dist[target] == INF:
        return []
    path = [target]
    while path[-1] != source:
        path.append(prev[path[-1]])
    path.reverse()
    return path`,
    testCases: [
      { input: [5, [[0, 1, 2], [0, 2, 1], [1, 3, 2], [2, 3, 2], [3, 4, 1]], 0, 4], expected: [0, 2, 3, 4] },
      { input: [3, [[0, 1, 1]], 0, 2], expected: [] },
      { input: [3, [[0, 1, 5], [1, 2, 5]], 0, 0], expected: [0] },
      { input: [4, [[0, 1, 10], [0, 2, 1], [2, 1, 1], [1, 3, 1]], 0, 3], expected: [0, 2, 1, 3] },
      { input: [2, [[0, 1, 3]], 1, 0], expected: [1, 0] },
    ],
    hint: "Only overwrite the predecessor on a strict improvement, then backtrack from target.",
  },
  {
    id: "graph-332",
    title: "Bellman-Ford After K Rounds",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Run exactly k rounds of Bellman-Ford relaxation and report the resulting tentative distances.\n\nedges is a list of directed [u, v, w] triples with possibly negative w, and rounds is a non-negative integer. Each round relaxes every edge in the given order in place, so later edges in the same round see earlier updates. Return -1 for nodes whose distance is still infinite; no early stopping is allowed.",
    starterCode: `def bellman_ford_after_rounds(n, edges, source, rounds):
    # Your code here
    pass`,
    solution: `def bellman_ford_after_rounds(n, edges, source, rounds):
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    for _ in range(rounds):
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    result = []
    for d in dist:
        if d == INF:
            result.append(-1)
        else:
            result.append(d)
    return result`,
    testCases: [
      { input: [5, [[0, 1, 6], [0, 2, 7], [1, 2, 8], [1, 3, 5], [1, 4, -4], [2, 3, -3], [2, 4, 9], [3, 1, -2], [4, 0, 2], [4, 3, 7]], 0, 1], expected: [0, 2, 7, 4, 2] },
      { input: [3, [[0, 1, 5], [1, 2, -3]], 0, 0], expected: [0, -1, -1] },
      { input: [4, [[0, 1, 4], [2, 3, 1]], 0, 3], expected: [0, 4, -1, -1] },
      { input: [3, [[0, 1, 2], [1, 2, 2], [0, 2, 5]], 0, 1], expected: [0, 2, 4] },
    ],
    hint: "Relax in place: the edge order inside a round genuinely changes the final array.",
  },
  {
    id: "graph-333",
    title: "Negative Cycle Reachable Sources",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "List every source node from which a negative-weight cycle is reachable.\n\nFor each candidate source run Bellman-Ford for n rounds; if round n still relaxes an edge, a negative cycle is reachable from that source. edges is a list of directed [u, v, w] triples that may contain negative weights. Return the qualifying sources in ascending order.",
    starterCode: `def negative_cycle_sources(n, edges):
    # Your code here
    pass`,
    solution: `def negative_cycle_sources(n, edges):
    INF = float("inf")
    result = []
    for s in range(n):
        dist = [INF] * n
        dist[s] = 0
        changed = False
        for _ in range(n):
            changed = False
            for u, v, w in edges:
                if dist[u] != INF and dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    changed = True
            if not changed:
                break
        if changed:
            result.append(s)
    return result`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, -1], [2, 1, -1]]], expected: [0, 1, 2] },
      { input: [3, [[0, 1, 1], [1, 2, -1]]], expected: [] },
      { input: [4, [[1, 2, -1], [2, 1, -1], [0, 3, 5]]], expected: [1, 2] },
      { input: [1, []], expected: [] },
      { input: [2, [[0, 1, -5], [1, 0, 2]]], expected: [0, 1] },
    ],
    hint: "A change during the n-th full round is the textbook proof that a reachable negative cycle exists.",
  },
  {
    id: "graph-334",
    title: "Floyd-Warshall After Vertex k",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the Floyd-Warshall distance matrix after allowing only intermediate vertices 0 through k.\n\nStart from the direct-edge distance matrix and run the main triple loop with mid ranging over 0..k inclusive; k = -1 means no intermediate vertex has been processed yet. edges is an undirected [u, v, w] list with positive weights. Report -1 for pairs that are still unreachable.",
    starterCode: `def floyd_after_intermediate(n, edges, k):
    # Your code here
    pass`,
    solution: `def floyd_after_intermediate(n, edges, k):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
            dist[v][u] = w
    for mid in range(k + 1):
        for i in range(n):
            if dist[i][mid] == INF:
                continue
            for j in range(n):
                if dist[mid][j] != INF and dist[i][mid] + dist[mid][j] < dist[i][j]:
                    dist[i][j] = dist[i][mid] + dist[mid][j]
    result = []
    for i in range(n):
        row = []
        for j in range(n):
            if dist[i][j] == INF:
                row.append(-1)
            else:
                row.append(dist[i][j])
        result.append(row)
    return result`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 5]], -1], expected: [[0, 1, 5], [1, 0, 1], [5, 1, 0]] },
      { input: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 5]], 1], expected: [[0, 1, 2], [1, 0, 1], [2, 1, 0]] },
      { input: [2, [[0, 1, 3]], 0], expected: [[0, 3], [3, 0]] },
      { input: [3, [[0, 1, 2]], 0], expected: [[0, 2, -1], [2, 0, -1], [-1, -1, 0]] },
      { input: [1, [], -1], expected: [[0]] },
    ],
    hint: "Processing vertex k early can still change distances because smaller intermediates chain together.",
  },
  {
    id: "graph-335",
    title: "Floyd-Warshall Update Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count how many strict distance improvements the Floyd-Warshall triple loop makes.\n\nedges is a directed [u, v, w] list with arbitrary weights and the diagonal starts at 0. For every (k, i, j) triple, count an update when dist[i][k] + dist[k][j] < dist[i][j] before the write. Skip triples touching infinity. Return the total number of updates.",
    starterCode: `def floyd_update_count(n, edges):
    # Your code here
    pass`,
    solution: `def floyd_update_count(n, edges):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
    count = 0
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            dik = dist[i][k]
            for j in range(n):
                if dist[k][j] != INF and dik + dist[k][j] < dist[i][j]:
                    dist[i][j] = dik + dist[k][j]
                    count += 1
    return count`,
    testCases: [
      { input: [3, [[0, 1, 4], [1, 2, 3], [0, 2, 10]]], expected: 1 },
      { input: [2, [[0, 1, 4], [1, 0, 3]]], expected: 0 },
      { input: [4, [[0, 1, 2], [1, 2, 3], [2, 3, 4], [0, 3, 20]]], expected: 3 },
      { input: [1, []], expected: 0 },
      { input: [2, []], expected: 0 },
    ],
    hint: "A shorter route through k must beat the current entry strictly; count after the comparison succeeds.",
  },
  {
    id: "graph-336",
    title: "Kruskal Selection Trace",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Run Kruskal's algorithm and list the edges it selects, in selection order.\n\nSort edges by (weight, u, v) so ties are broken deterministically, then sweep with union-find and keep an edge only when it joins two different components. edges is an undirected [u, v, w] list. Return the chosen edges as [u, v] pairs; a disconnected graph simply yields fewer edges.",
    starterCode: `def kruskal_selection_trace(n, edges):
    # Your code here
    pass`,
    solution: `def kruskal_selection_trace(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    ordered = sorted([w, u, v] for u, v, w in edges)
    chosen = []
    for w, u, v in ordered:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            chosen.append([u, v])
    return chosen`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4]]], expected: [[0, 1], [1, 2], [2, 3]] },
      { input: [4, [[0, 1, 1], [2, 3, 1], [0, 2, 1]]], expected: [[0, 1], [0, 2], [2, 3]] },
      { input: [3, [[0, 1, 5]]], expected: [[0, 1]] },
      { input: [2, []], expected: [] },
      { input: [3, [[1, 2, 2], [0, 1, 2], [0, 2, 2]]], expected: [[0, 1], [0, 2]] },
    ],
    hint: "Sort by weight first, then add an edge only if union-find keeps the forest acyclic.",
  },
  {
    id: "graph-337",
    title: "Union-Find Parent Writes",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count every assignment to the parent array during a sequence of union-find merges with path compression.\n\nA find walks x to its root and then reassigns parent[y] = root for each node on the path except the root, counting one write per node even when the value is unchanged. A successful union then writes once more by attaching the second root to the first root. merges is a list of [a, b] pairs; return the total number of parent writes.",
    starterCode: `def union_find_parent_writes(n, merges):
    # Your code here
    pass`,
    solution: `def union_find_parent_writes(n, merges):
    parent = list(range(n))
    writes = 0

    def find(x):
        nonlocal writes
        root = x
        while parent[root] != root:
            root = parent[root]
        y = x
        while y != root:
            nxt = parent[y]
            parent[y] = root
            writes += 1
            y = nxt
        return root

    for a, b in merges:
        ra = find(a)
        rb = find(b)
        if ra != rb:
            parent[rb] = ra
            writes += 1
    return writes`,
    testCases: [
      { input: [4, [[0, 1]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2]]], expected: 3 },
      { input: [5, [[0, 1], [1, 2], [2, 3]]], expected: 5 },
      { input: [3, [[0, 1], [0, 1]]], expected: 2 },
      { input: [2, []], expected: 0 },
    ],
    hint: "Compression writes only happen for nodes strictly below the root on the path.",
  },
  {
    id: "graph-338",
    title: "Prim Growth Order",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Record the order in which nodes join Prim's minimum spanning tree grown from node 0.\n\nPush candidate edges into a heap keyed by (weight, node) so ties always pick the smallest node index, and ignore stale entries for visited nodes. edges is an undirected [u, v, w] list with positive weights. If the graph is disconnected, return an empty list instead of a partial order.",
    starterCode: `import heapq

def prim_growth_order(n, edges):
    # Your code here
    pass`,
    solution: `import heapq

def prim_growth_order(n, edges):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    visited = [False] * n
    heap = [(0, 0)]
    order = []
    while heap:
        w, u = heapq.heappop(heap)
        if visited[u]:
            continue
        visited[u] = True
        order.append(u)
        for v, nw in adj[u]:
            if not visited[v]:
                heapq.heappush(heap, (nw, v))
    if len(order) < n:
        return []
    return order`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]]], expected: [0, 1, 2, 3] },
      { input: [4, [[0, 1, 5], [0, 2, 1], [1, 3, 1], [2, 3, 5]]], expected: [0, 2, 1, 3] },
      { input: [3, [[0, 1, 2]]], expected: [] },
      { input: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 5]]], expected: [0, 1, 2] },
      { input: [1, []], expected: [0] },
    ],
    hint: "Heap entries are (weight, node); skip any node that already joined the tree.",
  },
  {
    id: "graph-339",
    title: "Edges Until Connected",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Add undirected edges one at a time and report when the graph first becomes connected.\n\nReturn the number of edges processed at the moment all n nodes share a single component; count includes the edge that completed the connection. If the given edge list never connects the graph, return -1. A graph with n <= 1 is already connected and needs 0 edges.",
    starterCode: `def edges_until_connected(n, edges):
    # Your code here
    pass`,
    solution: `def edges_until_connected(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for i, (u, v) in enumerate(edges):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            components -= 1
        if components == 1:
            return i + 1
    if components == 1:
        return 0
    return -1`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [0, 3]]], expected: 3 },
      { input: [4, [[0, 1], [2, 3]]], expected: -1 },
      { input: [1, []], expected: 0 },
      { input: [3, [[0, 1], [0, 2]]], expected: 2 },
    ],
    hint: "Track the component count as unions succeed and stop the first time it equals 1.",
  },
  {
    id: "graph-340",
    title: "Bipartite Color Assignment",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Two-color an undirected graph if possible, returning the color of every node.\n\nProcess components in increasing start-node order, give each start color 0, and BFS alternating 0/1 across edges. Return the color list when the graph is bipartite, or an empty list as soon as two adjacent nodes must share a color. Neighbors are scanned in sorted order.",
    starterCode: `def bipartite_coloring(n, edges):
    # Your code here
    pass`,
    solution: `def bipartite_coloring(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for neighbors in adj:
        neighbors.sort()
    color = [-1] * n
    for s in range(n):
        if color[s] != -1:
            continue
        color[s] = 0
        queue = [s]
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return []
    return color`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [0, 1, 0, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [4, [[0, 1], [2, 3]]], expected: [0, 1, 0, 1] },
      { input: [5, []], expected: [0, 0, 0, 0, 0] },
      { input: [2, [[0, 1], [0, 1]]], expected: [0, 1] },
    ],
    hint: "A conflict appears exactly when an already colored neighbor has the same color as the current node.",
  },
  {
    id: "graph-341",
    title: "Articulation Split Counts",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "For every articulation point, report how many components remain after deleting it.\n\nCompute the baseline component count of the undirected graph, then for each node v count the components of the subgraph induced by all nodes except v. Node v qualifies when that count exceeds the baseline. Return [v, count] pairs in increasing v order; return an empty list when the graph has no articulation points.",
    starterCode: `def articulation_split_counts(n, edges):
    # Your code here
    pass`,
    solution: `def articulation_split_counts(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    def component_count(skip):
        visited = [False] * n
        count = 0
        for s in range(n):
            if s == skip or visited[s]:
                continue
            count += 1
            visited[s] = True
            stack = [s]
            while stack:
                u = stack.pop()
                for v in adj[u]:
                    if v != skip and not visited[v]:
                        visited[v] = True
                        stack.append(v)
        return count

    base = component_count(-1)
    result = []
    for v in range(n):
        after = component_count(v)
        if after > base:
            result.append([v, after])
    return result`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [[2, 2]] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: [[1, 2], [2, 2], [3, 2]] },
      { input: [3, [[0, 1], [1, 2]]], expected: [[1, 2]] },
      { input: [4, [[0, 1], [2, 3]]], expected: [] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
    ],
    hint: "Compare the component count without v to the count of the original graph; increases reveal articulation points.",
  },
  {
    id: "graph-342",
    title: "Flood Fill Region Size",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Measure the size of the 4-connected region of ones that contains a given cell.\n\ngrid is a rectangular list of rows holding only 0 and 1. If grid[r][c] is 0 return 0 immediately, otherwise flood fill through horizontally and vertically adjacent ones. The starting cell counts toward the size.",
    starterCode: `def flood_fill_size(grid, r, c):
    # Your code here
    pass`,
    solution: `def flood_fill_size(grid, r, c):
    if grid[r][c] != 1:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    seen[r][c] = True
    stack = [(r, c)]
    size = 0
    while stack:
        x, y = stack.pop()
        size += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and not seen[nx][ny] and grid[nx][ny] == 1:
                seen[nx][ny] = True
                stack.append((nx, ny))
    return size`,
    testCases: [
      { input: [[[1, 1, 0], [1, 0, 1], [0, 0, 1]], 0, 0], expected: 3 },
      { input: [[[1, 1, 0], [1, 0, 1], [0, 0, 1]], 0, 2], expected: 0 },
      { input: [[[1, 1, 0], [1, 0, 1], [0, 0, 1]], 2, 2], expected: 2 },
      { input: [[[1, 1], [1, 1]], 1, 1], expected: 4 },
      { input: [[[1]], 0, 0], expected: 1 },
    ],
    hint: "Guard against water at the start, then walk four directions while marking visited cells.",
  },
  {
    id: "graph-343",
    title: "Enclosed Lakes Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count connected regions of zeros that are fully surrounded by ones.\n\ngrid is a rectangular list of rows holding only 0 and 1, and connectivity is 4-directional. A zero-region counts as a lake only when none of its cells sits on the grid border. Flood fill each unvisited region and track whether the border is touched.",
    starterCode: `def count_enclosed_lakes(grid):
    # Your code here
    pass`,
    solution: `def count_enclosed_lakes(grid):
    rows = len(grid)
    cols = len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    lakes = 0
    for sr in range(rows):
        for sc in range(cols):
            if grid[sr][sc] != 0 or seen[sr][sc]:
                continue
            seen[sr][sc] = True
            stack = [(sr, sc)]
            touches_border = False
            while stack:
                x, y = stack.pop()
                if x == 0 or y == 0 or x == rows - 1 or y == cols - 1:
                    touches_border = True
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < rows and 0 <= ny < cols and not seen[nx][ny] and grid[nx][ny] == 0:
                        seen[nx][ny] = True
                        stack.append((nx, ny))
            if not touches_border:
                lakes += 1
    return lakes`,
    testCases: [
      { input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: 1 },
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 0 },
      { input: [[[1, 1, 1, 1], [1, 0, 0, 1], [1, 1, 1, 1]]], expected: 1 },
      { input: [[[1, 1, 1, 1], [1, 0, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1]]], expected: 2 },
    ],
    hint: "A region touching any border cell drains away, so only strictly interior zero regions are lakes.",
  },
  {
    id: "graph-344",
    title: "Matrix to Edge List",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Convert an undirected adjacency matrix into a sorted edge list.\n\nmatrix is a square 0/1 matrix and the graph is simple, so only the upper triangle matters. Emit each edge once as [u, v] with u < v and sort the result. A matrix with all zero entries yields an empty list.",
    starterCode: `def matrix_to_edge_list(matrix):
    # Your code here
    pass`,
    solution: `def matrix_to_edge_list(matrix):
    n = len(matrix)
    edges = []
    for u in range(n):
        for v in range(u + 1, n):
            if matrix[u][v] == 1:
                edges.append([u, v])
    return edges`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: [[0, 1]] },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]]], expected: [[0, 1], [1, 2]] },
      { input: [[[0, 0], [0, 0]]], expected: [] },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]]], expected: [[0, 1], [0, 2], [1, 2]] },
      { input: [[[0]]], expected: [] },
    ],
    hint: "Scan u < v only; iterating the full matrix would list every edge twice.",
  },
  {
    id: "graph-345",
    title: "Walk Count Two Entry",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute a single entry of the squared adjacency matrix after one multiplication step.\n\nFor adjacency matrix A, the entry (A*A)[i][j] counts walks of length exactly 2 from i to j and equals the dot product of row i with column j. matrix is a square 0/1 matrix for a directed or undirected graph. Return that integer count.",
    starterCode: `def walk_count_two(matrix, i, j):
    # Your code here
    pass`,
    solution: `def walk_count_two(matrix, i, j):
    total = 0
    for k in range(len(matrix)):
        total += matrix[i][k] * matrix[k][j]
    return total`,
    testCases: [
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], 0, 2], expected: 1 },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]], 0, 0], expected: 1 },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], 0, 0], expected: 2 },
      { input: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], 1, 2], expected: 1 },
      { input: [[[0, 1, 0], [0, 0, 1], [1, 0, 0]], 0, 2], expected: 1 },
    ],
    hint: "Sum A[i][k] * A[k][j] over all middle nodes k.",
  },
  {
    id: "graph-346",
    title: "Length-Two Walk Matrix",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Multiply the adjacency matrix by itself once and return the full result.\n\nmatrix is a square 0/1 matrix; entry [i][j] of the product counts length-two walks from i to j. Implement the triple loop directly instead of using any library. The output has the same shape as the input.",
    starterCode: `def walk_matrix_two(matrix):
    # Your code here
    pass`,
    solution: `def walk_matrix_two(matrix):
    n = len(matrix)
    result = []
    for i in range(n):
        row = []
        for j in range(n):
            total = 0
            for k in range(n):
                total += matrix[i][k] * matrix[k][j]
            row.append(total)
        result.append(row)
    return result`,
    testCases: [
      { input: [[[0, 1], [1, 0]]], expected: [[1, 0], [0, 1]] },
      { input: [[[0, 1, 0], [1, 0, 1], [0, 1, 0]]], expected: [[1, 0, 1], [0, 2, 0], [1, 0, 1]] },
      { input: [[[0, 0], [0, 0]]], expected: [[0, 0], [0, 0]] },
      { input: [[[0, 1, 0], [0, 0, 1], [1, 0, 0]]], expected: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] },
      { input: [[[0]]], expected: [[0]] },
    ],
    hint: "The diagonal of the product gives each node's degree in a simple graph.",
  },
  {
    id: "graph-347",
    title: "Transitive Closure Row Bits",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return one row of the transitive closure as 0/1 bits.\n\nFor node k, bit j is 1 exactly when j is reachable from k by a directed path, and bit k is always 1 because a node reaches itself with a zero-length walk. edges is a directed [u, v] list. The returned list has length n.",
    starterCode: `def transitive_closure_row(n, edges, k):
    # Your code here
    pass`,
    solution: `def transitive_closure_row(n, edges, k):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    reach = [0] * n
    reach[k] = 1
    stack = [k]
    while stack:
        u = stack.pop()
        for v in adj[u]:
            if reach[v] == 0:
                reach[v] = 1
                stack.append(v)
    return reach`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0], expected: [1, 1, 1] },
      { input: [3, [[0, 1], [1, 2]], 2], expected: [0, 0, 1] },
      { input: [3, [[0, 1], [2, 1]], 1], expected: [0, 1, 0] },
      { input: [4, [[0, 1], [1, 0], [2, 3]], 2], expected: [0, 0, 1, 1] },
      { input: [1, [], 0], expected: [1] },
    ],
    hint: "One graph search from k fills the whole row, including k itself.",
  },
  {
    id: "graph-348",
    title: "Greedy Coloring by Degree",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Color an undirected graph greedily in descending degree order.\n\nSort nodes by (-degree, index), then give each node the smallest non-negative color not used by an already colored neighbor. edges is a simple undirected [u, v] list. Return colors in node-index order.",
    starterCode: `def greedy_coloring_by_degree(n, edges):
    # Your code here
    pass`,
    solution: `def greedy_coloring_by_degree(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    order = sorted(range(n), key=lambda x: (-len(adj[x]), x))
    color = [-1] * n
    for node in order:
        used = set()
        for v in adj[node]:
            if color[v] != -1:
                used.add(color[v])
        c = 0
        while c in used:
            c += 1
        color[node] = c
    return color`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [1, 0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [0, 1, 1, 1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0, 1, 2] },
      { input: [3, [[0, 1], [0, 2]]], expected: [0, 1, 1] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [1, 2, 0, 1] },
    ],
    hint: "High-degree nodes go first, which usually keeps the palette small.",
  },
  {
    id: "graph-349",
    title: "PageRank Teleport Step",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Perform one PageRank iteration with a custom teleport distribution.\n\nStart from the uniform vector 1/n, let p be weights normalized to sum to 1, and use new[j] = (1 - d) * p[j] + d * p[j] * dangling + d * sum of rank[u] / outdeg(u) over edges u -> j. Rank carried by dangling nodes is redistributed by p, not uniformly. weights must contain at least one positive entry.",
    starterCode: `def pagerank_teleport_step(n, edges, damping, weights):
    # Your code here
    pass`,
    solution: `def pagerank_teleport_step(n, edges, damping, weights):
    total = sum(weights)
    p = [w / total for w in weights]
    rank = [1.0 / n] * n
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    dangling = 0.0
    for u in range(n):
        if out_degree[u] == 0:
            dangling += rank[u]
    new_rank = [(1.0 - damping) * p[j] + damping * dangling * p[j] for j in range(n)]
    for u, v in edges:
        new_rank[v] += damping * rank[u] / out_degree[u]
    return new_rank`,
    testCases: [
      { input: [2, [[0, 1], [1, 1]], 0.85, [1, 1]], expected: [0.075, 0.925] },
      { input: [2, [], 0.85, [1, 3]], expected: [0.25, 0.75] },
      { input: [3, [[0, 1], [1, 2]], 0.5, [1, 1, 1]], expected: [0.2222222222222222, 0.3888888888888889, 0.3888888888888889] },
      { input: [1, [], 0.85, [5]], expected: [1.0] },
      { input: [2, [[0, 1]], 0.5, [1, 0]], expected: [0.75, 0.25] },
    ],
    hint: "Dangling mass joins the teleport term, and every rank vector entry must still sum to 1.",
  },
  {
    id: "graph-350",
    title: "Largest Region Size",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Find the size of the largest 4-connected region of ones in a binary grid.\n\ngrid is a rectangular list of rows holding only 0 and 1. Flood fill every unvisited land cell and keep the biggest region size seen. Return 0 when the grid contains no ones at all.",
    starterCode: `def largest_region_size(grid):
    # Your code here
    pass`,
    solution: `def largest_region_size(grid):
    rows = len(grid)
    cols = len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    best = 0
    for sr in range(rows):
        for sc in range(cols):
            if grid[sr][sc] != 1 or seen[sr][sc]:
                continue
            seen[sr][sc] = True
            stack = [(sr, sc)]
            size = 0
            while stack:
                x, y = stack.pop()
                size += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < rows and 0 <= ny < cols and not seen[nx][ny] and grid[nx][ny] == 1:
                        seen[nx][ny] = True
                        stack.append((nx, ny))
            if size > best:
                best = size
    return best`,
    testCases: [
      { input: [[[1, 1, 0], [1, 0, 1], [0, 0, 1]]], expected: 3 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1, 1], [1, 1]]], expected: 4 },
      { input: [[[1, 0, 0, 1]]], expected: 1 },
      { input: [[[1]]], expected: 1 },
    ],
    hint: "Mark cells when you push them so diagonally touching regions stay separate.",
  },
  {
    id: "graph-351",
    title: "DFS Tree and Back Edges",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Classify every undirected edge as a DFS tree edge or a non-tree edge.\n\nRun a depth-first search that starts from each unvisited node in increasing order and explores neighbors in increasing order. An edge is a tree edge when it first discovers an unvisited node and a back edge when it meets an already visited node; each edge is classified once. Return [tree_count, back_count].",
    starterCode: `def dfs_tree_back_counts(n, edges):
    # Your code here
    pass`,
    solution: `def dfs_tree_back_counts(n, edges):
    adj = [[] for _ in range(n)]
    for idx, (u, v) in enumerate(edges):
        adj[u].append((v, idx))
        adj[v].append((u, idx))
    for lst in adj:
        lst.sort()
    seen = [False] * n
    used = [False] * len(edges)
    tree = 0
    back = 0
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, 0)]
        while stack:
            u, pos = stack.pop()
            if pos >= len(adj[u]):
                continue
            v, idx = adj[u][pos]
            stack.append((u, pos + 1))
            if used[idx]:
                continue
            used[idx] = True
            if not seen[v]:
                seen[v] = True
                tree += 1
                stack.append((v, 0))
            else:
                back += 1
    return [tree, back]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [3, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [2, 1] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [3, 1] },
      { input: [5, [[0, 1], [2, 3]]], expected: [2, 0] },
      { input: [4, [[0, 1], [0, 1], [2, 3]]], expected: [2, 1] },
    ],
    hint: "Track used edge indices so a shared edge is not counted twice after being traversed.",
  },
  {
    id: "graph-352",
    title: "Bridges After Extra Tree Edge",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Given a tree plus one extra edge, find which tree edges are still bridges.\n\ntree_edges has n - 1 undirected [u, v] pairs forming a tree, and extra_edge adds exactly one edge, creating one cycle. Every tree edge on the unique cycle stops being a bridge, while all other tree edges remain bridges. Return the surviving bridges as sorted [u, v] pairs with u < v.",
    starterCode: `def bridges_after_extra_edge(n, tree_edges, extra_edge):
    # Your code here
    pass`,
    solution: `def bridges_after_extra_edge(n, tree_edges, extra_edge):
    adj = [[] for _ in range(n)]
    for a, b in tree_edges:
        adj[a].append(b)
        adj[b].append(a)
    u, v = extra_edge
    parent = [-1] * n
    parent[u] = u
    stack = [u]
    while stack:
        x = stack.pop()
        for y in adj[x]:
            if parent[y] == -1:
                parent[y] = x
                stack.append(y)
    on_cycle = set()
    x = v
    while x != u:
        a, b = x, parent[x]
        on_cycle.add((min(a, b), max(a, b)))
        x = parent[x]
    bridges = []
    for a, b in tree_edges:
        key = (min(a, b), max(a, b))
        if key not in on_cycle:
            bridges.append([key[0], key[1]])
    bridges.sort()
    return bridges`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 3]], expected: [] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1]], expected: [[1, 2], [2, 3]] },
      { input: [5, [[0, 1], [0, 2], [0, 3], [0, 4]], [1, 2]], expected: [[0, 3], [0, 4]] },
      { input: [2, [[1, 0]], [0, 1]], expected: [] },
      { input: [3, [[0, 2], [2, 1]], [2, 1]], expected: [[0, 2]] },
    ],
    hint: "Find the tree path between the extra edge endpoints; exactly those tree edges lie on the new cycle.",
  },
  {
    id: "graph-353",
    title: "Reverse Directed Edges",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Reverse every edge of a directed graph and sort the result.\n\nedges is a list of directed [u, v] pairs; the reversed graph contains [v, u] for each one and keeps duplicates. Return the reversed pairs sorted in ascending order. An empty input yields an empty list.",
    starterCode: `def reverse_directed_edges(edges):
    # Your code here
    pass`,
    solution: `def reverse_directed_edges(edges):
    reversed_edges = [[v, u] for u, v in edges]
    reversed_edges.sort()
    return reversed_edges`,
    testCases: [
      { input: [[[0, 1], [1, 2]]], expected: [[1, 0], [2, 1]] },
      { input: [[]], expected: [] },
      { input: [[[2, 0], [0, 1], [1, 0]]], expected: [[0, 1], [0, 2], [1, 0]] },
      { input: [[[1, 1]]], expected: [[1, 1]] },
    ],
    hint: "Swap the endpoints of every pair, then sort the list of swapped pairs.",
  },
  {
    id: "graph-354",
    title: "DAG Longest Path Levels",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Assign each node of a DAG the length of the longest path that ends at it.\n\nSource nodes with no incoming edges get level 0, and every node's level is the maximum over its predecessors of level + 1. Process nodes with Kahn's algorithm so each level is final before it is used. Return the level list, or an empty list when the graph contains a cycle.",
    starterCode: `def dag_longest_levels(n, edges):
    # Your code here
    pass`,
    solution: `def dag_longest_levels(n, edges):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    level = [0] * n
    queue = [x for x in range(n) if indeg[x] == 0]
    head = 0
    seen = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        seen += 1
        for v in adj[u]:
            if level[u] + 1 > level[v]:
                level[v] = level[u] + 1
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    if seen != n:
        return []
    return level`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: [0, 1, 1, 2] },
      { input: [3, [[0, 1], [1, 2]]], expected: [0, 1, 2] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [4, [[1, 2], [1, 3], [0, 2]]], expected: [0, 0, 1, 1] },
      { input: [1, []], expected: [0] },
    ],
    hint: "Relax level[v] = max(level[v], level[u] + 1) while peeling indegree-zero nodes.",
  },
  {
    id: "graph-355",
    title: "Dijkstra Relaxation Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many times Dijkstra strictly improves a tentative distance.\n\nedges is a directed [u, v, w] list with positive weights and the heap always pops the smallest (distance, node) pair. Every time a popped edge d + w beats the current dist[v], count one improvement and push the new pair. Return the total count, which is 0 when no edge leaves the source.",
    starterCode: `import heapq

def dijkstra_relaxation_count(n, edges, source):
    # Your code here
    pass`,
    solution: `import heapq

def dijkstra_relaxation_count(n, edges, source):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    heap = [(0, source)]
    count = 0
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                count += 1
                heapq.heappush(heap, (d + w, v))
    return count`,
    testCases: [
      { input: [4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0], expected: 5 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0], expected: 2 },
      { input: [2, [[0, 1, 5]], 0], expected: 1 },
      { input: [1, [], 0], expected: 0 },
      { input: [3, [[0, 1, 10], [0, 2, 1], [2, 1, 1]], 0], expected: 3 },
    ],
    hint: "A node can be improved several times, so count every strict decrease, not just the final values.",
  },
  {
    id: "graph-356",
    title: "Component Label Array",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Label each node of an undirected graph with its component identifier.\n\nThe label of a component is the smallest node index it contains, so scanning start nodes in increasing order automatically produces the right labels. edges is a list of [u, v] pairs and isolated nodes form their own components. Return labels in node-index order.",
    starterCode: `def component_labels(n, edges):
    # Your code here
    pass`,
    solution: `def component_labels(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    label = [-1] * n
    for s in range(n):
        if label[s] != -1:
            continue
        label[s] = s
        stack = [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if label[v] == -1:
                    label[v] = s
                    stack.append(v)
    return label`,
    testCases: [
      { input: [4, [[0, 1], [2, 3]]], expected: [0, 0, 2, 2] },
      { input: [5, []], expected: [0, 1, 2, 3, 4] },
      { input: [3, [[1, 2]]], expected: [0, 1, 1] },
      { input: [4, [[1, 3], [0, 2]]], expected: [0, 1, 0, 1] },
      { input: [2, [[0, 1]]], expected: [0, 0] },
    ],
    hint: "The first node visited in a component is its minimum index because starts are ascending.",
  },
  {
    id: "graph-357",
    title: "Edges to Make Connected",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the minimum number of new undirected edges needed to connect the whole graph.\n\nCount the connected components c of the given edge list, then the answer is c - 1 because each added edge can merge two components. edges is a list of [u, v] pairs. A graph with n <= 1 is already connected and needs 0 edges.",
    starterCode: `def edges_to_make_connected(n, edges):
    # Your code here
    pass`,
    solution: `def edges_to_make_connected(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            components -= 1
    return components - 1`,
    testCases: [
      { input: [4, [[0, 1], [2, 3]]], expected: 1 },
      { input: [5, []], expected: 4 },
      { input: [3, [[0, 1], [1, 2]]], expected: 0 },
      { input: [1, []], expected: 0 },
      { input: [6, [[0, 1], [2, 3], [4, 5]]], expected: 2 },
    ],
    hint: "One new edge drops the component count by exactly one, so c - 1 edges always suffice.",
  },
  {
    id: "graph-358",
    title: "Bottleneck Spanning Weight",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Minimize the heaviest edge used by a spanning tree.\n\nRun Kruskal on the undirected [u, v, w] list and return the weight of the last edge added to the tree; that greedy bound is optimal for the bottleneck objective. Return -1 when no spanning tree exists, and 0 when n <= 1.",
    starterCode: `def bottleneck_spanning_weight(n, edges):
    # Your code here
    pass`,
    solution: `def bottleneck_spanning_weight(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    ordered = sorted([w, u, v] for u, v, w in edges)
    components = n
    last = 0
    for w, u, v in ordered:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            components -= 1
            last = w
    if components > 1:
        return -1
    return last`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]]], expected: 3 },
      { input: [4, [[0, 1, 5], [0, 2, 1], [1, 3, 1], [2, 3, 5]]], expected: 5 },
      { input: [3, [[0, 1, 2]]], expected: -1 },
      { input: [2, [[0, 1, 7]]], expected: 7 },
      { input: [1, []], expected: 0 },
    ],
    hint: "Any spanning tree must bridge the cut that forced the last heavy edge, so that weight is a lower bound.",
  },
  {
    id: "graph-359",
    title: "Negative Closed Walk Nodes",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "List the nodes that admit a closed walk of negative total weight.\n\nRun Floyd-Warshall on the directed [u, v, w] edge list and report every node i whose final dist[i][i] is negative, which certifies a negative cycle on or reachable from i's closed walk. Return the qualifying nodes in ascending order. Return an empty list when all diagonals stay non-negative.",
    starterCode: `def negative_closed_walk_nodes(n, edges):
    # Your code here
    pass`,
    solution: `def negative_closed_walk_nodes(n, edges):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[k][j] != INF and dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    result = []
    for i in range(n):
        if dist[i][i] < 0:
            result.append(i)
    return result`,
    testCases: [
      { input: [2, [[0, 1, -1], [1, 0, 2]]], expected: [] },
      { input: [2, [[0, 1, -2], [1, 0, 1]]], expected: [0, 1] },
      { input: [3, [[0, 1, 0], [1, 2, -5], [2, 1, 0]]], expected: [1, 2] },
      { input: [3, [[0, 1, 1], [1, 2, 1], [2, 0, -5]]], expected: [0, 1, 2] },
      { input: [1, []], expected: [] },
    ],
    hint: "A negative diagonal after Floyd-Warshall can only appear through a negative cycle.",
  },
  {
    id: "graph-360",
    title: "Second MST Weight",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find the weight of the lightest spanning tree strictly heavier than the MST.\n\nAll edge weights are distinct and edges is an undirected [u, v, w] list. Compute the MST, then for each tree edge rerun Kruskal with that edge banned and keep the smallest resulting spanning weight above the MST. Return -1 when the graph is disconnected, has a single node, or admits only one spanning tree.",
    starterCode: `def second_mst_weight(n, edges):
    # Your code here
    pass`,
    solution: `def second_mst_weight(n, edges):
    def kruskal(skip):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        weight = 0
        count = 0
        for idx, (u, v, w) in enumerate(edges):
            if idx == skip:
                continue
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                weight += w
                count += 1
        if count == n - 1:
            return weight
        return -1

    base = kruskal(-1)
    if base == -1:
        return -1
    order = sorted(range(len(edges)), key=lambda i: (edges[i][2], edges[i][0], edges[i][1]))
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    used = []
    for idx in order:
        u, v, w = edges[idx]
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            used.append(idx)
    best = -1
    for idx in used:
        candidate = kruskal(idx)
        if candidate != -1 and candidate > base and (best == -1 or candidate < best):
            best = candidate
    return best`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4], [0, 2, 5]]], expected: 7 },
      { input: [3, [[0, 1, 1], [1, 2, 2]]], expected: -1 },
      { input: [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]], expected: 4 },
      { input: [1, []], expected: -1 },
      { input: [3, [[0, 1, 1]]], expected: -1 },
    ],
    hint: "Banning one MST edge at a time is enough because every non-MST spanning tree differs from the MST somewhere.",
  },
];
