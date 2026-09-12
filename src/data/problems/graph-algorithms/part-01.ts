import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-001",
    title: "Adjacency List Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build an undirected adjacency list for n nodes labeled 0 to n-1 from a list of edges.\n\nedges is a list of [u, v] pairs. Return a list of n lists, where the i-th list holds the neighbors of node i in ascending order.",
    starterCode: `def build_adjacency_list(n, edges):
    # Your code here
    pass`,
    solution: `def build_adjacency_list(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for neighbors in adj:
        neighbors.sort()
    return adj`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[1], [0, 2], [1, 3], [2]] },
      { input: [3, [[0, 1], [0, 2], [1, 2]]], expected: [[1, 2], [0, 2], [0, 1]] },
      { input: [2, []], expected: [[], []] },
      { input: [1, []], expected: [[]] },
    ],
    hint: "Append each endpoint to the other node's list, then sort every list.",
  },
  {
    id: "graph-002",
    title: "Adjacency Matrix Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the n by n adjacency matrix of an undirected graph from a list of edges.\n\nedges is a list of [u, v] pairs. Return an n by n matrix of 0/1 values where both [u][v] and [v][u] are 1 for every edge.",
    starterCode: `def build_adjacency_matrix(n, edges):
    # Your code here
    pass`,
    solution: `def build_adjacency_matrix(n, edges):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1
        matrix[v][u] = 1
    return matrix`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0, 1, 0], [1, 0, 1], [0, 1, 0]] },
      { input: [3, [[0, 1], [0, 2], [1, 2]]], expected: [[0, 1, 1], [1, 0, 1], [1, 1, 0]] },
      { input: [1, []], expected: [[0]] },
      { input: [4, []], expected: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
    ],
    hint: "Set both directions for each edge on a fresh zero matrix.",
  },
  {
    id: "graph-003",
    title: "BFS Traversal Order",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return the order in which nodes are visited by a breadth-first traversal starting at start.\n\nThe graph is undirected with n nodes. Visit neighbors in ascending order and skip nodes unreachable from start.",
    starterCode: `def bfs_order(n, edges, start):
    # Your code here
    pass`,
    solution: `def bfs_order(n, edges, start):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for neighbors in adj:
        neighbors.sort()
    visited = [False] * n
    order = []
    queue = [start]
    visited[start] = True
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        order.append(v)
        for w in adj[v]:
            if not visited[w]:
                visited[w] = True
                queue.append(w)
    return order`,
    testCases: [
      { input: [6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0], expected: [0, 1, 2, 3, 4] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 1], expected: [1, 0, 2, 3] },
      { input: [3, [[1, 2]], 0], expected: [0] },
      { input: [1, [], 0], expected: [0] },
    ],
    hint: "Use a FIFO queue and mark nodes when you enqueue them.",
  },
  {
    id: "graph-004",
    title: "DFS Traversal Order (Iterative)",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Return the order in which nodes are visited by an iterative depth-first traversal starting at start, visiting the smallest neighbor first.\n\nThe graph is undirected with n nodes. Implement the stack yourself (no recursion) and skip unreachable nodes.",
    starterCode: `def dfs_order(n, edges, start):
    # Your code here
    pass`,
    solution: `def dfs_order(n, edges, start):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for neighbors in adj:
        neighbors.sort()
    visited = [False] * n
    order = []
    stack = [start]
    while stack:
        v = stack.pop()
        if visited[v]:
            continue
        visited[v] = True
        order.append(v)
        for w in reversed(adj[v]):
            if not visited[w]:
                stack.append(w)
    return order`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 0], expected: [0, 1, 3, 2, 4] },
      { input: [5, [[0, 1], [0, 2], [1, 3], [2, 4]], 2], expected: [2, 0, 1, 3, 4] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [1, 3]], 0], expected: [0, 1, 2, 3] },
      { input: [2, [], 1], expected: [1] },
    ],
    hint: "Push neighbors in reverse sorted order so the smallest one is popped first.",
  },
  {
    id: "graph-005",
    title: "Connected Components Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the connected components of an undirected graph with n nodes.\n\nedges is a list of [u, v] pairs. Isolated nodes each form their own component.",
    starterCode: `def count_components(n, edges):
    # Your code here
    pass`,
    solution: `def count_components(n, edges):
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
      { input: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { input: [4, []], expected: 4 },
      { input: [1, []], expected: 1 },
      { input: [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]], expected: 1 },
    ],
    hint: "Union endpoints together, then count distinct roots.",
  },
  {
    id: "graph-006",
    title: "Bipartite Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether an undirected graph with n nodes is bipartite.\n\nA graph is bipartite when its nodes can be 2-colored so that every edge joins different colors. Use BFS coloring from every unvisited node to handle disconnected graphs.",
    starterCode: `def is_bipartite(n, edges):
    # Your code here
    pass`,
    solution: `def is_bipartite(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    color = [-1] * n
    for start in range(n):
        if color[start] != -1:
            continue
        color[start] = 0
        queue = [start]
        head = 0
        while head < len(queue):
            v = queue[head]
            head += 1
            for w in adj[v]:
                if color[w] == -1:
                    color[w] = 1 - color[v]
                    queue.append(w)
                elif color[w] == color[v]:
                    return False
    return True`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: true },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: false },
      { input: [4, []], expected: true },
      { input: [5, [[0, 1], [1, 2], [2, 0], [3, 4]]], expected: false },
    ],
    hint: "An odd cycle makes 2-coloring impossible.",
  },
  {
    id: "graph-007",
    title: "Floyd-Warshall Small",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute all-pairs shortest paths in an undirected weighted graph with the Floyd-Warshall algorithm.\n\nedges is a list of [u, v, w] triples with w > 0. Return an n by n matrix of shortest distances, using -1 for unreachable pairs and 0 on the diagonal.",
    starterCode: `def floyd_warshall(n, edges):
    # Your code here
    pass`,
    solution: `def floyd_warshall(n, edges):
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
                if dist[k][j] != INF and dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return [[d if d != INF else -1 for d in row] for row in dist]`,
    testCases: [
      {
        input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]]],
        expected: [[0, 1, 3, 6], [1, 0, 2, 5], [3, 2, 0, 3], [6, 5, 3, 0]],
      },
      { input: [2, [[0, 1, 5]]], expected: [[0, 5], [5, 0]] },
      { input: [3, []], expected: [[0, -1, -1], [-1, 0, -1], [-1, -1, 0]] },
      { input: [3, [[0, 1, 4], [0, 1, 2], [1, 2, 1]]], expected: [[0, 2, 3], [2, 0, 1], [3, 1, 0]] },
    ],
    hint: "Try every intermediate node k between every pair i, j.",
  },
  {
    id: "graph-008",
    title: "Graph Density",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the density of an undirected simple graph with n nodes: density = 2 * m / (n * (n - 1)), where m is the number of edges.\n\nAssume edges are unique and contain no self-loops. Return 0.0 when n is less than 2.",
    starterCode: `def graph_density(n, edges):
    # Your code here
    pass`,
    solution: `def graph_density(n, edges):
    if n < 2:
        return 0.0
    return 2.0 * len(edges) / (n * (n - 1))`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1.0 },
      { input: [4, [[0, 1], [1, 2]]], expected: 0.3333333333333333 },
      { input: [1, []], expected: 0.0 },
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: 1.0 },
    ],
    hint: "A complete graph has n * (n - 1) / 2 edges, so its density is 1.",
  },
  {
    id: "graph-009",
    title: "Degree Centrality",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the degree centrality of every node in an undirected graph: degree(v) / (n - 1).\n\nReturn a list of floats in node order. When n is less than 2, every node has centrality 0.0.",
    starterCode: `def degree_centrality(n, edges):
    # Your code here
    pass`,
    solution: `def degree_centrality(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    if n < 2:
        return [0.0] * n
    return [d / (n - 1) for d in degree]`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1.0, 0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: [1.0, 1.0, 1.0] },
      { input: [1, []], expected: [0.0] },
      { input: [3, [[0, 1], [1, 2]]], expected: [0.5, 1.0, 0.5] },
    ],
    hint: "Count each node's incident edges, then divide by the maximum possible degree.",
  },
  {
    id: "graph-010",
    title: "In/Out Degree Stats",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the out-degree and in-degree of every node in a directed multigraph with n nodes.\n\nedges is a list of [u, v] pairs representing directed edges. Return a list of [out_degree, in_degree] pairs in node order; repeated edges count every time.",
    starterCode: `def in_out_degrees(n, edges):
    # Your code here
    pass`,
    solution: `def in_out_degrees(n, edges):
    out_degree = [0] * n
    in_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
        in_degree[v] += 1
    return [[out_degree[i], in_degree[i]] for i in range(n)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[1, 1], [1, 1], [1, 1]] },
      { input: [4, [[0, 1], [0, 2], [3, 0]]], expected: [[2, 1], [0, 1], [0, 1], [1, 0]] },
      { input: [1, []], expected: [[0, 0]] },
      { input: [2, [[0, 1], [0, 1]]], expected: [[2, 0], [0, 2]] },
    ],
    hint: "u contributes to out_degree, v contributes to in_degree.",
  },
  {
    id: "graph-011",
    title: "PageRank One Iteration",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Perform one power iteration of PageRank on a directed graph with n nodes.\n\nStart from uniform ranks of 1/n. For damping factor d, the new rank of i is (1 - d)/n plus d times the rank sent along each incoming edge, where a node splits its rank evenly across its outgoing edges. The rank of dangling nodes (no outgoing edges) is spread uniformly over all nodes. Return the new list of ranks.",
    starterCode: `def pagerank_step(n, edges, damping):
    # Your code here
    pass`,
    solution: `def pagerank_step(n, edges, damping):
    ranks = [1.0 / n] * n
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    dangling = sum(ranks[u] for u in range(n) if out_degree[u] == 0)
    base = (1.0 - damping) / n + damping * dangling / n
    new = [base] * n
    for u, v in edges:
        new[v] += damping * ranks[u] / out_degree[u]
    return new`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.85], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [3, [[0, 1], [0, 2]], 0.85], expected: [0.2388888888888889, 0.38055555555555554, 0.38055555555555554] },
      { input: [1, [], 0.85], expected: [1.0] },
      { input: [4, [[0, 1], [1, 0]], 0.5], expected: [0.3125, 0.3125, 0.1875, 0.1875] },
    ],
    hint: "Compute the dangling contribution first, then add each edge's flow into the target node.",
  },
  {
    id: "graph-012",
    title: "Clustering Coefficient (Local)",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the local clustering coefficient of every node in an undirected simple graph.\n\nFor a node with degree k < 2 the coefficient is 0.0; otherwise it is 2 * L / (k * (k - 1)), where L is the number of edges among the node's neighbors. Return a list of floats in node order.",
    starterCode: `def clustering_coefficients(n, edges):
    # Your code here
    pass`,
    solution: `def clustering_coefficients(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    result = []
    for v in range(n):
        neighbors = list(adj[v])
        k = len(neighbors)
        if k < 2:
            result.append(0.0)
            continue
        links = 0
        for i in range(k):
            for j in range(i + 1, k):
                if neighbors[j] in adj[neighbors[i]]:
                    links += 1
        result.append(2.0 * links / (k * (k - 1)))
    return result`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [1.0, 1.0, 0.3333333333333333, 0.0] },
      { input: [3, [[0, 1], [1, 2]]], expected: [0.0, 0.0, 0.0] },
      { input: [2, [[0, 1]]], expected: [0.0, 0.0] },
      { input: [1, []], expected: [0.0] },
    ],
    hint: "Count the edges inside the neighbor set, then normalize by the number of possible pairs.",
  },
  {
    id: "graph-013",
    title: "Triangle Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the number of triangles in an undirected simple graph with n nodes.\n\nA triangle is a set of three nodes that are pairwise connected. Return the total count.",
    starterCode: `def count_triangles(n, edges):
    # Your code here
    pass`,
    solution: `def count_triangles(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    count = 0
    for u in range(n):
        for v in adj[u]:
            if v > u:
                for w in adj[v]:
                    if w > v and w in adj[u]:
                        count += 1
    return count`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 4 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 0 },
    ],
    hint: "Order the triple u < v < w so each triangle is counted once.",
  },
  {
    id: "graph-014",
    title: "Number of Islands via Graph Traversal",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the islands in a grid of string cells, where 1 is land and 0 is water.\n\nAn island is a maximal group of land cells connected horizontally or vertically (4-connectivity). Return the number of islands; an empty grid has 0.",
    starterCode: `def num_islands(grid):
    # Your code here
    pass`,
    solution: `def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    seen = set()
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1" or (r, c) in seen:
                continue
            count += 1
            stack = [(r, c)]
            seen.add((r, c))
            while stack:
                cr, cc = stack.pop()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1" and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        stack.append((nr, nc))
    return count`,
    testCases: [
      { input: [[["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]]], expected: 2 },
      { input: [[["1", "1"], ["1", "1"]]], expected: 1 },
      { input: [[["0", "0"], ["0", "0"]]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[["1"]]], expected: 1 },
    ],
    hint: "Flood fill from every unvisited land cell and increment the counter.",
  },
  {
    id: "graph-015",
    title: "Clone Graph",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Deep-copy a graph given as an adjacency dictionary keyed by node name.\n\nadj maps each node to the list of its neighbors; neighbor lists must be preserved in order. Return a new dictionary with the same keys and copied neighbor lists, built by traversing the graph rather than reusing any list objects.",
    starterCode: `def clone_graph(adj):
    # Your code here
    pass`,
    solution: `def clone_graph(adj):
    clone = {}
    for start in adj:
        if start in clone:
            continue
        clone[start] = []
        queue = [start]
        head = 0
        while head < len(queue):
            node = queue[head]
            head += 1
            for neighbor in adj[node]:
                clone[node].append(neighbor)
                if neighbor not in clone:
                    clone[neighbor] = []
                    queue.append(neighbor)
    return clone`,
    testCases: [
      {
        input: [{ "0": ["1", "2"], "1": ["0"], "2": ["0"] }],
        expected: { "0": ["1", "2"], "1": ["0"], "2": ["0"] },
      },
      { input: [{ "0": [] }], expected: { "0": [] } },
      { input: [{}], expected: {} },
      {
        input: [{ "0": ["1"], "1": ["0", "2"], "2": ["1"] }],
        expected: { "0": ["1"], "1": ["0", "2"], "2": ["1"] },
      },
    ],
    hint: "Traverse with a queue and create a shallow entry in the copy before expanding each node.",
  },
  {
    id: "graph-016",
    title: "Graph Valid Tree Check",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Decide whether an undirected graph with n nodes and the given edges is a valid tree.\n\nA graph is a tree when it is connected and acyclic, which for n nodes is equivalent to having exactly n - 1 edges and no cycle. edges is a list of [u, v] pairs.",
    starterCode: `def valid_tree(n, edges):
    # Your code here
    pass`,
    solution: `def valid_tree(n, edges):
    if len(edges) != n - 1:
        return False
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru = find(u)
        rv = find(v)
        if ru == rv:
            return False
        parent[ru] = rv
    return True`,
    testCases: [
      { input: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expected: true },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: false },
      { input: [1, []], expected: true },
      { input: [2, []], expected: false },
      { input: [2, [[0, 1]]], expected: true },
    ],
    hint: "n - 1 edges plus no cycle implies connectivity.",
  },
  {
    id: "graph-017",
    title: "Cycle Detection Undirected",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether an undirected graph with n nodes contains a cycle.\n\nSelf-loops and parallel edges (the same pair listed twice) both count as cycles. edges is a list of [u, v] pairs.",
    starterCode: `def has_cycle_undirected(n, edges):
    # Your code here
    pass`,
    solution: `def has_cycle_undirected(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        if u == v:
            return True
        ru = find(u)
        rv = find(v)
        if ru == rv:
            return True
        parent[ru] = rv
    return False`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: false },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { input: [4, [[0, 1], [0, 1]]], expected: true },
      { input: [1, []], expected: false },
      { input: [3, [[0, 0]]], expected: true },
    ],
    hint: "An edge whose endpoints already share a root closes a cycle.",
  },
  {
    id: "graph-018",
    title: "Cycle Detection Directed",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether a directed graph with n nodes contains a directed cycle.\n\nUse three colors: white (unvisited), gray (on the current DFS stack), and black (finished). An edge into a gray node closes a cycle. edges is a list of [u, v] pairs.",
    starterCode: `def has_cycle_directed(n, edges):
    # Your code here
    pass`,
    solution: `def has_cycle_directed(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    color = [0] * n

    def dfs(v):
        color[v] = 1
        for w in adj[v]:
            if color[w] == 1:
                return True
            if color[w] == 0 and dfs(w):
                return True
        color[v] = 2
        return False

    for node in range(n):
        if color[node] == 0 and dfs(node):
            return True
    return False`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: false },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: true },
      { input: [3, [[0, 1], [0, 2], [1, 2]]], expected: false },
      { input: [1, [[0, 0]]], expected: true },
      { input: [3, [[0, 1], [1, 2]]], expected: false },
    ],
    hint: "A back edge to a node still on the recursion stack proves a directed cycle.",
  },
  {
    id: "graph-019",
    title: "Topological Sort (Kahn)",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the lexicographically smallest topological order of a directed graph with n nodes.\n\nedges is a list of [u, v] pairs meaning u must come before v. Use Kahn's algorithm and always remove the smallest available node with in-degree 0. Return an empty list when the graph has a cycle.",
    starterCode: `import heapq
def topological_sort(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def topological_sort(n, edges):
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
    if len(order) != n:
        return []
    return order`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [3, [[0, 2], [1, 2]]], expected: [0, 1, 2] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [1, []], expected: [0] },
      { input: [3, [[0, 1], [1, 2]]], expected: [0, 1, 2] },
    ],
    hint: "A min-heap of in-degree zero nodes gives the smallest order.",
  },
  {
    id: "graph-020",
    title: "BFS Shortest Path Unweighted",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Return the number of edges in a shortest path between src and dst in an undirected unweighted graph with n nodes.\n\nIf dst is unreachable, return -1; if src equals dst, return 0. edges is a list of [u, v] pairs.",
    starterCode: `def bfs_shortest_path(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `def bfs_shortest_path(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    dist[src] = 0
    queue = [src]
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        for w in adj[v]:
            if dist[w] == -1:
                dist[w] = dist[v] + 1
                queue.append(w)
    return dist[dst]`,
    testCases: [
      { input: [6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]], 0, 5], expected: 4 },
      { input: [6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]], 1, 2], expected: 2 },
      { input: [3, [[0, 1]], 0, 2], expected: -1 },
      { input: [2, [], 1, 1], expected: 0 },
    ],
    hint: "First time a node is dequeued its distance is final in BFS.",
  },
  {
    id: "graph-021",
    title: "Dijkstra with Heap",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest paths in a directed weighted graph with positive edge weights using Dijkstra's algorithm and a min-heap.\n\nedges is a list of [u, v, w] triples. Return a list of distances from src in node order, using -1 for unreachable nodes.",
    starterCode: `import heapq
def dijkstra(n, edges, src):
    # Your code here
    pass`,
    solution: `import heapq
def dijkstra(n, edges, src):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
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
    return dist`,
    testCases: [
      { input: [5, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]], 0], expected: [0, 3, 1, 4, 7] },
      { input: [4, [[0, 1, 1], [2, 3, 1]], 0], expected: [0, 1, -1, -1] },
      { input: [1, [], 0], expected: [0] },
      { input: [3, [[0, 1, 10], [0, 2, 1], [2, 1, 1]], 0], expected: [0, 2, 1] },
    ],
    hint: "Skip stale heap entries whose distance is larger than the recorded best.",
  },
  {
    id: "graph-022",
    title: "Network Delay Time",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Nodes are labeled 1 to n. times is a list of [u, v, w] directed edges. Starting from node k, find the time for all n nodes to receive a signal: the maximum shortest-path distance from k.\n\nReturn -1 if some node is unreachable. A single node network takes 0 time.",
    starterCode: `import heapq
def network_delay_time(n, times, k):
    # Your code here
    pass`,
    solution: `import heapq
def network_delay_time(n, times, k):
    adj = [[] for _ in range(n + 1)]
    for u, v, w in times:
        adj[u].append((v, w))
    dist = [-1] * (n + 1)
    dist[k] = 0
    heap = [(0, k)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for to, weight in adj[v]:
            nd = d + weight
            if dist[to] == -1 or nd < dist[to]:
                dist[to] = nd
                heapq.heappush(heap, (nd, to))
    result = 0
    for node in range(1, n + 1):
        if dist[node] == -1:
            return -1
        result = max(result, dist[node])
    return result`,
    testCases: [
      { input: [4, [[2, 1, 1], [2, 3, 1], [3, 4, 1]], 2], expected: 2 },
      { input: [2, [[1, 2, 1]], 2], expected: -1 },
      { input: [1, [], 1], expected: 0 },
      { input: [3, [[1, 2, 4], [1, 3, 2], [3, 2, 1]], 1], expected: 3 },
    ],
    hint: "The answer is the largest finite distance after running Dijkstra.",
  },
  {
    id: "graph-023",
    title: "Bellman-Ford with Negative Edges",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute single-source shortest paths in a directed weighted graph that may contain negative edge weights (but no negative cycles).\n\nedges is a list of [u, v, w] triples. Relax every edge n - 1 times. Return distances from src in node order, using -1 for unreachable nodes.",
    starterCode: `def bellman_ford(n, edges, src):
    # Your code here
    pass`,
    solution: `def bellman_ford(n, edges, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    return [d if d != INF else -1 for d in dist]`,
    testCases: [
      { input: [4, [[0, 1, 4], [0, 2, 2], [2, 1, -1], [1, 3, 3], [2, 3, 5]], 0], expected: [0, 1, 2, 4] },
      { input: [3, [[0, 1, 5], [1, 2, -3], [0, 2, 10]], 0], expected: [0, 5, 2] },
      { input: [4, [[0, 1, 2], [0, 2, 7]], 0], expected: [0, 2, 7, -1] },
      { input: [1, [], 0], expected: [0] },
    ],
    hint: "n - 1 passes are enough for any shortest path without negative cycles.",
  },
  {
    id: "graph-024",
    title: "Prim MST Weight",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the total weight of a minimum spanning tree of a connected undirected weighted graph using Prim's algorithm.\n\nedges is a list of [u, v, w] triples. Return -1 when the graph is disconnected and 0 when there is a single node.",
    starterCode: `import heapq
def prim_mst_weight(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def prim_mst_weight(n, edges):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    visited = [False] * n
    total = 0
    count = 0
    heap = [(0, 0)]
    while heap:
        weight, v = heapq.heappop(heap)
        if visited[v]:
            continue
        visited[v] = True
        total += weight
        count += 1
        for to, w in adj[v]:
            if not visited[to]:
                heapq.heappush(heap, (w, to))
    if count != n:
        return -1
    return total`,
    testCases: [
      { input: [4, [[0, 1, 1], [0, 2, 3], [1, 2, 1], [1, 3, 4], [2, 3, 2]]], expected: 4 },
      { input: [3, [[0, 1, 1]]], expected: -1 },
      { input: [1, []], expected: 0 },
      { input: [2, [[0, 1, 7]]], expected: 7 },
    ],
    hint: "Grow the tree one cheapest crossing edge at a time.",
  },
  {
    id: "graph-025",
    title: "Kruskal MST Weight",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the total weight of a minimum spanning tree using Kruskal's algorithm with union-find.\n\nedges is a list of [u, v, w] triples describing an undirected weighted graph. Return -1 when the graph is disconnected and 0 for a single node.",
    starterCode: `def kruskal_mst_weight(n, edges):
    # Your code here
    pass`,
    solution: `def kruskal_mst_weight(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru = find(u)
        rv = find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            used += 1
    if used != n - 1:
        return -1
    return total`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]]], expected: 6 },
      { input: [4, [[0, 1, 1], [1, 2, 2]]], expected: -1 },
      { input: [1, []], expected: 0 },
      { input: [3, [[0, 1, 3], [1, 2, 2], [0, 2, 1]]], expected: 3 },
    ],
    hint: "Sort by weight and take any edge that joins two different components.",
  },
  {
    id: "graph-026",
    title: "Redundant Connection (DSU)",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "A graph started as a tree with n nodes and one extra edge was added, creating exactly one cycle. edges lists [u, v] pairs in the order added.\n\nReturn the edge that can be removed to restore a tree. If several answers exist, return the one appearing last in the input.",
    starterCode: `def redundant_connection(edges):
    # Your code here
    pass`,
    solution: `def redundant_connection(edges):
    n = 0
    for u, v in edges:
        n = max(n, u, v)
    parent = list(range(n + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in edges:
        ru = find(u)
        rv = find(v)
        if ru == rv:
            return [u, v]
        parent[ru] = rv
    return []`,
    testCases: [
      { input: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
      { input: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
      { input: [[[1, 2], [1, 2]]], expected: [1, 2] },
      { input: [[[1, 2], [2, 3], [1, 3], [3, 4]]], expected: [1, 3] },
    ],
    hint: "The first edge whose endpoints are already connected is the redundant one.",
  },
  {
    id: "graph-027",
    title: "PageRank Iterate to Tolerance",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Iterate the PageRank recurrence until the largest rank change between two rounds is at most tolerance (or 1000 rounds pass).\n\nStart from uniform ranks 1/n. With damping d, each node keeps (1 - d)/n of the teleport mass, dangling nodes spread their rank uniformly, and every edge passes d * rank_u / out_degree(u) to its target. Return the final rank list.",
    starterCode: `def pagerank_iterate(n, edges, damping, tolerance):
    # Your code here
    pass`,
    solution: `def pagerank_iterate(n, edges, damping, tolerance):
    ranks = [1.0 / n] * n
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    for _ in range(1000):
        dangling = sum(ranks[u] for u in range(n) if out_degree[u] == 0)
        base = (1.0 - damping) / n + damping * dangling / n
        new = [base] * n
        for u, v in edges:
            new[v] += damping * ranks[u] / out_degree[u]
        diff = max(abs(new[i] - ranks[i]) for i in range(n))
        ranks = new
        if diff <= tolerance:
            break
    return ranks`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [1, 2], [2, 0]], 0.85, 1e-9], expected: [0.3693235345111402, 0.2045815501752522, 0.3784758676945599, 0.04761904761904763] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0.85, 1e-9], expected: [0.08118361651499265, 0.15018969072346783, 0.20884485377079753, 0.25870174205376656, 0.30108009693697546] },
      { input: [3, [], 0.85, 1e-9], expected: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333] },
      { input: [1, [], 0.85, 1e-9], expected: [1.0] },
    ],
    hint: "Track the maximum absolute change and stop as soon as it fits the tolerance.",
  },
  {
    id: "graph-028",
    title: "Personalized PageRank",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute personalized PageRank where the teleport mass always returns to a single source node.\n\nStart with all rank on the source. Each round, source gets (1 - d) plus the dangling mass, and every edge passes d * rank_u / out_degree(u) to its target. Iterate until the largest change is at most tolerance (or 1000 rounds). Return the final ranks.",
    starterCode: `def personalized_pagerank(n, edges, source, damping, tolerance):
    # Your code here
    pass`,
    solution: `def personalized_pagerank(n, edges, source, damping, tolerance):
    ranks = [0.0] * n
    ranks[source] = 1.0
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    for _ in range(1000):
        dangling = sum(ranks[u] for u in range(n) if out_degree[u] == 0)
        new = [0.0] * n
        new[source] = (1.0 - damping) + damping * dangling
        for u, v in edges:
            new[v] += damping * ranks[u] / out_degree[u]
        diff = max(abs(new[i] - ranks[i]) for i in range(n))
        ranks = new
        if diff <= tolerance:
            break
    return ranks`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]], 0, 0.85, 1e-9], expected: [0.3472749771422889, 0.29518373021944766, 0.25090617000328175, 0.10663512263498164] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]], 3, 0.85, 1e-9], expected: [0.0, 0.0, 0.0, 1.0] },
      { input: [3, [], 1, 0.85, 1e-9], expected: [0.0, 1.0, 0.0] },
      { input: [1, [], 0, 0.85, 1e-9], expected: [1.0] },
    ],
    hint: "Replace the uniform teleport vector with a one-hot vector at source.",
  },
  {
    id: "graph-029",
    title: "Closeness Centrality",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the closeness centrality of every node in an undirected unweighted graph.\n\nFor each node, run BFS and let R be the number of reachable nodes excluding itself and S the sum of their distances. The centrality is R / S, or 0.0 when no other node is reachable.",
    starterCode: `def closeness_centrality(n, edges):
    # Your code here
    pass`,
    solution: `def closeness_centrality(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    result = []
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
        count = 0
        total = 0
        for i in range(n):
            if dist[i] > 0:
                count += 1
                total += dist[i]
        result.append(count / total if total > 0 else 0.0)
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [0.6666666666666666, 1.0, 0.6666666666666666] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1.0, 0.6, 0.6, 0.6] },
      { input: [3, [[0, 1]]], expected: [1.0, 1.0, 0.0] },
      { input: [1, []], expected: [0.0] },
    ],
    hint: "A BFS from each node gives both the count and the sum of distances.",
  },
  {
    id: "graph-030",
    title: "Path Count via Matrix Powers",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the number of walks of length exactly k from src to dst in a directed graph with n nodes.\n\nThe entry (src, dst) of the k-th power of the adjacency matrix counts such walks. edges is a list of [u, v] pairs; repeated edges are counted with multiplicity. Use fast exponentiation on 0/1 matrices.",
    starterCode: `def count_walks(n, edges, src, dst, k):
    # Your code here
    pass`,
    solution: `def count_walks(n, edges, src, dst, k):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] += 1

    def multiply(a, b):
        out = [[0] * n for _ in range(n)]
        for i in range(n):
            for t in range(n):
                if a[i][t] == 0:
                    continue
                factor = a[i][t]
                for j in range(n):
                    out[i][j] += factor * b[t][j]
        return out

    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    base = matrix
    while k > 0:
        if k % 2 == 1:
            result = multiply(result, base)
        base = multiply(base, base)
        k //= 2
    return result[src][dst]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 0, 3], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 1, 4], expected: 1 },
      { input: [2, [[0, 1], [1, 0]], 0, 0, 2], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3, 2], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], 0, 2, 1], expected: 0 },
    ],
    hint: "Binary exponentiation computes the k-th matrix power in O(n^3 log k).",
  },
  {
    id: "graph-031",
    title: "Graph Diameter by BFS",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the diameter of a connected undirected unweighted graph: the maximum shortest-path distance between any two nodes.\n\nRun a BFS from every node and take the largest distance found. Return -1 when the graph is disconnected and 0 for a single node.",
    starterCode: `def graph_diameter(n, edges):
    # Your code here
    pass`,
    solution: `def graph_diameter(n, edges):
    if n <= 1:
        return 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    best = 0
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
            return -1
        best = max(best, max(dist))
    return best`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 4 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 2 },
      { input: [4, [[0, 1], [2, 3]]], expected: -1 },
      { input: [1, []], expected: 0 },
      { input: [2, [[0, 1]]], expected: 1 },
    ],
    hint: "The longest BFS distance over all starting nodes is the diameter.",
  },
  {
    id: "graph-032",
    title: "K-Core Numbers",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the core number of every node in an undirected graph: the largest k such that the node belongs to the k-core, the maximal subgraph with all degrees at least k.\n\nRepeatedly remove the node with the smallest current degree; its core number is that degree when removed. Return the core numbers in node order.",
    starterCode: `import heapq
def k_core_numbers(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def k_core_numbers(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        if u != v:
            adj[u].append(v)
            adj[v].append(u)
    degree = [len(neighbors) for neighbors in adj]
    removed = [False] * n
    heap = [(degree[i], i) for i in range(n)]
    heapq.heapify(heap)
    core = [0] * n
    level = 0
    while heap:
        d, v = heapq.heappop(heap)
        if removed[v] or d != degree[v]:
            continue
        level = max(level, d)
        removed[v] = True
        core[v] = level
        for w in adj[v]:
            if not removed[w]:
                degree[w] -= 1
                heapq.heappush(heap, (degree[w], w))
    return core`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [2, 2, 2, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [3, 3, 3, 3] },
      { input: [3, [[0, 1], [1, 2]]], expected: [1, 1, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1, 1, 1, 1] },
      { input: [3, []], expected: [0, 0, 0] },
    ],
    hint: "Peel away the current minimum-degree node and decrease its neighbors' degrees.",
  },
  {
    id: "graph-033",
    title: "Course Schedule Order",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Given num_courses courses labeled 0 to num_courses-1 and prerequisite pairs [a, b] meaning b must be taken before a, return a valid course order.\n\nAlways take the smallest available course first (lexicographically smallest order). Return an empty list when the prerequisites contain a cycle.",
    starterCode: `import heapq
def course_schedule_order(num_courses, prerequisites):
    # Your code here
    pass`,
    solution: `import heapq
def course_schedule_order(num_courses, prerequisites):
    adj = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for a, b in prerequisites:
        adj[b].append(a)
        in_degree[a] += 1
    heap = [i for i in range(num_courses) if in_degree[i] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        v = heapq.heappop(heap)
        order.append(v)
        for w in adj[v]:
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    if len(order) != num_courses:
        return []
    return order`,
    testCases: [
      { input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
      { input: [2, [[1, 0]]], expected: [0, 1] },
      { input: [2, [[1, 0], [0, 1]]], expected: [] },
      { input: [3, [[0, 1], [1, 2]]], expected: [2, 1, 0] },
      { input: [3, []], expected: [0, 1, 2] },
    ],
    hint: "Build edges from prerequisite to course, then run Kahn with a min-heap.",
  },
  {
    id: "graph-034",
    title: "Snake and Ladder BFS",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the minimum number of dice rolls to travel from square 1 to square n*n on a snakes-and-ladders board.\n\nboard is an n by n grid with -1 for a plain square or a target square number for a snake or ladder. Rows alternate direction starting left to right on the bottom row. Each roll moves 1 to 6 squares. Return -1 when the last square cannot be reached.",
    starterCode: `def snakes_and_ladders(board):
    # Your code here
    pass`,
    solution: `def snakes_and_ladders(board):
    n = len(board)
    jump = [0] * (n * n + 1)
    for r in range(n):
        for c in range(n):
            row = n - 1 - r
            if row % 2 == 0:
                square = row * n + c + 1
            else:
                square = row * n + (n - c)
            value = board[r][c]
            jump[square] = value if value != -1 else square
    dist = [-1] * (n * n + 1)
    dist[1] = 0
    queue = [1]
    head = 0
    while head < len(queue):
        square = queue[head]
        head += 1
        if square == n * n:
            return dist[square]
        for roll in range(1, 7):
            nxt = square + roll
            if nxt > n * n:
                break
            dest = jump[nxt]
            if dist[dest] == -1:
                dist[dest] = dist[square] + 1
                queue.append(dest)
    return -1`,
    testCases: [
      {
        input: [[[-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, 35, -1, -1, 13, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1]]],
        expected: 4,
      },
      { input: [[[-1]]], expected: 0 },
      { input: [[[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]], expected: 2 },
      { input: [[[-1, -1], [-1, 4]]], expected: 1 },
    ],
    hint: "Map each board row to square numbers, then BFS over dice outcomes with jumps applied.",
  },
  {
    id: "graph-035",
    title: "Grid Shortest Path with Obstacles",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the length of the shortest path from the top-left to the bottom-right cell of a grid, moving up, down, left, or right.\n\ngrid contains 0 for free cells and 1 for obstacles. Return the number of moves, or -1 when no path exists. A 1x1 free grid needs 0 moves.",
    starterCode: `def shortest_path_grid(grid):
    # Your code here
    pass`,
    solution: `def shortest_path_grid(grid):
    if not grid or not grid[0]:
        return -1
    rows = len(grid)
    cols = len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return -1
    dist = [[-1] * cols for _ in range(rows)]
    dist[0][0] = 0
    queue = [(0, 0)]
    head = 0
    while head < len(queue):
        r, c = queue[head]
        head += 1
        if r == rows - 1 and c == cols - 1:
            return dist[r][c]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    return -1`,
    testCases: [
      { input: [[[0, 0, 1], [0, 1, 0], [0, 0, 0]]], expected: 4 },
      { input: [[[0, 1], [1, 0]]], expected: -1 },
      { input: [[[0]]], expected: 0 },
      { input: [[[0, 0], [0, 0]]], expected: 2 },
    ],
    hint: "BFS over free cells gives the fewest moves in an unweighted grid.",
  },
  {
    id: "graph-036",
    title: "Rotting Oranges Minutes",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "In a grid, 0 is empty, 1 is a fresh orange, and 2 is a rotten orange. Every minute, fresh oranges adjacent (4-directionally) to a rotten orange become rotten.\n\nReturn the number of minutes until no fresh orange remains, or -1 if that never happens. A grid with no fresh oranges takes 0 minutes.",
    starterCode: `def oranges_rotting(grid):
    # Your code here
    pass`,
    solution: `def oranges_rotting(grid):
    rows = len(grid)
    cols = len(grid[0])
    queue = []
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    head = 0
    while head < len(queue) and fresh > 0:
        level = len(queue) - head
        for _ in range(level):
            r, c = queue[head]
            head += 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
    testCases: [
      { input: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { input: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
      { input: [[[0, 2]]], expected: 0 },
      { input: [[[1]]], expected: -1 },
      { input: [[[1, 2]]], expected: 1 },
    ],
    hint: "Start BFS from every rotten orange at once and process one minute per level.",
  },
  {
    id: "graph-037",
    title: "Bridges Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the bridges of an undirected graph with n nodes: edges whose removal increases the number of connected components.\n\nUse a DFS with discovery times and low-link values; a tree edge u -> v is a bridge when low[v] > disc[u]. edges is a list of [u, v] pairs.",
    starterCode: `def count_bridges(n, edges):
    # Your code here
    pass`,
    solution: `def count_bridges(n, edges):
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    bridges = 0

    def dfs(v, parent_edge):
        nonlocal bridges
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
                    bridges += 1

    for node in range(n):
        if disc[node] == -1:
            dfs(node, -1)
    return bridges`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 0 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]]], expected: 2 },
      { input: [2, [[0, 1]]], expected: 1 },
    ],
    hint: "Track edge ids so the DFS does not walk back along its own edge.",
  },
  {
    id: "graph-038",
    title: "Articulation Points Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the articulation points of an undirected graph with n nodes: nodes whose removal increases the number of connected components.\n\nA non-root node v is an articulation point when some DFS child w has low[w] >= disc[v]; the DFS root qualifies when it has more than one child. edges is a list of [u, v] pairs.",
    starterCode: `def count_articulation_points(n, edges):
    # Your code here
    pass`,
    solution: `def count_articulation_points(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    total = 0

    def dfs(v, parent):
        nonlocal total
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        children = 0
        is_articulation = False
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
                    is_articulation = True
        if parent == -1 and children > 1:
            is_articulation = True
        if is_articulation:
            total += 1

    for node in range(n):
        if disc[node] == -1:
            dfs(node, -1)
    return total`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]], expected: 1 },
      { input: [6, [[0, 1], [1, 2], [3, 4], [4, 5]]], expected: 2 },
    ],
    hint: "The root is special: it is an articulation point only with two or more DFS children.",
  },
  {
    id: "graph-039",
    title: "SCC Count (Kosaraju)",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Count the strongly connected components of a directed graph with n nodes.\n\nRun Kosaraju's algorithm: DFS to get finish order, then DFS on the reversed graph in reverse finish order. edges is a list of [u, v] pairs.",
    starterCode: `def count_scc(n, edges):
    # Your code here
    pass`,
    solution: `def count_scc(n, edges):
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
    count = 0
    for start in reversed(order):
        if component[start] != -1:
            continue
        count += 1
        component[start] = count
        stack = [start]
        while stack:
            v = stack.pop()
            for w in radj[v]:
                if component[w] == -1:
                    component[w] = count
                    stack.append(w)
    return count`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [3, 0]]], expected: 2 },
      { input: [3, [[0, 1], [1, 2]]], expected: 3 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 3]]], expected: 2 },
      { input: [5, []], expected: 5 },
    ],
    hint: "Components of the reversed graph processed in reverse finish order come out one SCC at a time.",
  },
  {
    id: "graph-040",
    title: "Betweenness Centrality (Brandes-lite)",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the (unnormalized) betweenness centrality of every node in an undirected unweighted graph.\n\nFor each ordered source, accumulate dependencies with Brandes' algorithm: when a shortest path has sigma[w] prefixes reaching w and sigma[v] via v, node v receives (sigma[v] / sigma[w]) * (1 + delta[w]). Sum over all sources and divide by 2 for the undirected pairs. Return floats in node order.",
    starterCode: `def betweenness_centrality(n, edges):
    # Your code here
    pass`,
    solution: `def betweenness_centrality(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    cb = [0.0] * n
    for s in range(n):
        stack = []
        pred = [[] for _ in range(n)]
        sigma = [0] * n
        sigma[s] = 1
        dist = [-1] * n
        dist[s] = 0
        queue = [s]
        head = 0
        while head < len(queue):
            v = queue[head]
            head += 1
            stack.append(v)
            for w in adj[v]:
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
                if dist[w] == dist[v] + 1:
                    sigma[w] += sigma[v]
                    pred[w].append(v)
        delta = [0.0] * n
        while stack:
            w = stack.pop()
            for v in pred[w]:
                delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w])
            if w != s:
                cb[w] += delta[w]
    return [c / 2.0 for c in cb]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [0.0, 1.0, 0.0] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [3.0, 0.0, 0.0, 0.0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [0.5, 0.5, 0.5, 0.5] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0.0, 2.0, 2.0, 0.0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0.0, 0.0, 0.0] },
    ],
    hint: "Accumulate dependency contributions while unwinding the BFS stack, deepest nodes first.",
  },
  {
    id: "graph-041",
    title: "Eigenvector Centrality (Power Iteration)",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the eigenvector centrality of an undirected graph with power iteration.\n\nStart with all ones. Each round multiply by (A + I) where A is the adjacency matrix, then normalize to unit length. This shift guarantees convergence on bipartite graphs. Stop when the largest component change is at most tolerance, and return the unit vector.",
    starterCode: `import math
def eigenvector_centrality(n, edges, tolerance):
    # Your code here
    pass`,
    solution: `import math
def eigenvector_centrality(n, edges, tolerance):
    x = [1.0] * n
    for _ in range(1000):
        new = list(x)
        for u, v in edges:
            new[u] += x[v]
            new[v] += x[u]
        norm = math.sqrt(sum(t * t for t in new))
        if norm == 0:
            return [0.0] * n
        new = [t / norm for t in new]
        diff = max(abs(new[i] - x[i]) for i in range(n))
        x = new
        if diff <= tolerance:
            break
    return x`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 1e-12], expected: [0.5, 0.7071067811865476, 0.5] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1e-12], expected: [0.7071067811865476, 0.4082482904638631, 0.4082482904638631, 0.4082482904638631] },
      { input: [2, [[0, 1]], 1e-12], expected: [0.7071067811865476, 0.7071067811865476] },
      { input: [1, [], 1e-12], expected: [1.0] },
    ],
    hint: "Adding the identity keeps the Perron eigenvalue strictly dominant even for bipartite graphs.",
  },
  {
    id: "graph-042",
    title: "Critical Path Length",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Given a weighted DAG of n tasks, find the length of the critical path: the maximum total weight of any directed path.\n\nedges is a list of [u, v, w] triples with w > 0, meaning v depends on u and takes w time after u. Process nodes in topological order and relax each edge to its latest finish time. Return -1 if the graph has a cycle.",
    starterCode: `import heapq
def critical_path_length(n, edges):
    # Your code here
    pass`,
    solution: `import heapq
def critical_path_length(n, edges):
    adj = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        in_degree[v] += 1
    heap = [i for i in range(n) if in_degree[i] == 0]
    heapq.heapify(heap)
    dist = [0] * n
    processed = 0
    while heap:
        v = heapq.heappop(heap)
        processed += 1
        for w, weight in adj[v]:
            if dist[v] + weight > dist[w]:
                dist[w] = dist[v] + weight
            in_degree[w] -= 1
            if in_degree[w] == 0:
                heapq.heappush(heap, w)
    if processed != n:
        return -1
    return max(dist) if dist else 0`,
    testCases: [
      { input: [6, [[0, 1, 3], [0, 2, 2], [1, 3, 2], [2, 3, 4], [3, 4, 3], [1, 4, 1]]], expected: 9 },
      { input: [1, []], expected: 0 },
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]]], expected: 6 },
      { input: [4, [[0, 1, 1], [0, 2, 4], [1, 3, 1], [2, 3, 1]]], expected: 5 },
    ],
    hint: "Earliest finish time of a node is the maximum over its incoming edges.",
  },
  {
    id: "graph-043",
    title: "Word Ladder Length",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find the length of the shortest transformation sequence from begin_word to end_word, where each step changes exactly one letter and every intermediate word must be in word_list.\n\nThe sequence length counts both endpoints. Return 0 when no sequence exists. If begin_word equals end_word, return 1. All words have the same length and contain lowercase letters.",
    starterCode: `def word_ladder_length(begin_word, end_word, word_list):
    # Your code here
    pass`,
    solution: `def word_ladder_length(begin_word, end_word, word_list):
    if begin_word == end_word:
        return 1
    words = set(word_list)
    if end_word not in words:
        return 0
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    queue = [begin_word]
    seen = {begin_word}
    steps = 1
    head = 0
    while head < len(queue):
        level = len(queue) - head
        steps += 1
        for _ in range(level):
            word = queue[head]
            head += 1
            for i in range(len(word)):
                for ch in alphabet:
                    nxt = word[:i] + ch + word[i + 1:]
                    if nxt in seen or nxt not in words:
                        continue
                    if nxt == end_word:
                        return steps
                    seen.add(nxt)
                    queue.append(nxt)
    return 0`,
    testCases: [
      { input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]], expected: 5 },
      { input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], expected: 0 },
      { input: ["a", "c", ["a", "b", "c"]], expected: 2 },
      { input: ["hot", "hot", ["hot"]], expected: 1 },
      { input: ["a", "b", ["b"]], expected: 2 },
    ],
    hint: "BFS level by level; generate neighbors by substituting each letter in every position.",
  },
  {
    id: "graph-044",
    title: "Cheapest Flights Within K Stops",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find the cheapest price from src to dst using at most k stops, where a stop is an intermediate city.\n\nflights is a list of [u, v, w] directed edges between n cities. Use Bellman-Ford style relaxation limited to k + 1 rounds, reading from a frozen copy of the previous distances so each round adds at most one flight. Return -1 when there is no route within the stop limit.",
    starterCode: `def find_cheapest_price(n, flights, src, dst, k):
    # Your code here
    pass`,
    solution: `def find_cheapest_price(n, flights, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):
        new = list(dist)
        for u, v, w in flights:
            if dist[u] != INF and dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return dist[dst] if dist[dst] != INF else -1`,
    testCases: [
      { input: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], expected: 200 },
      { input: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], expected: 500 },
      { input: [3, [[0, 1, 100], [1, 2, 100]], 0, 2, 5], expected: 200 },
      { input: [2, [[0, 1, 50]], 1, 0, 3], expected: -1 },
      { input: [1, [], 0, 0, 0], expected: 0 },
    ],
    hint: "Copy the distance array before each round so one round means one more flight.",
  },
  {
    id: "graph-045",
    title: "Path with Minimum Effort",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Given a rows by cols grid of heights, find the minimum effort to travel from the top-left to the bottom-right cell moving up, down, left, or right.\n\nThe effort of a path is the maximum absolute height difference between consecutive cells. Return the minimum possible effort; each cell can be visited as needed.",
    starterCode: `import heapq
def minimum_effort(heights):
    # Your code here
    pass`,
    solution: `import heapq
def minimum_effort(heights):
    rows = len(heights)
    cols = len(heights[0])
    best = [[-1] * cols for _ in range(rows)]
    best[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        effort, r, c = heapq.heappop(heap)
        if r == rows - 1 and c == cols - 1:
            return effort
        if effort > best[r][c]:
            continue
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                candidate = max(effort, abs(heights[r][c] - heights[nr][nc]))
                if best[nr][nc] == -1 or candidate < best[nr][nc]:
                    best[nr][nc] = candidate
                    heapq.heappush(heap, (candidate, nr, nc))
    return best[rows - 1][cols - 1]`,
    testCases: [
      { input: [[[1, 2, 2], [3, 8, 2], [5, 3, 5]]], expected: 2 },
      { input: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], expected: 1 },
      { input: [[[1, 1, 1], [1, 1, 1]]], expected: 0 },
      { input: [[[1, 2], [3, 4]]], expected: 2 },
    ],
    hint: "Dijkstra where the path cost is the maximum edge weight seen so far.",
  },
];
