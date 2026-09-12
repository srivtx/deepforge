import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-091",
    title: "Minimum Spanning Tree Verification",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Verify whether a proposed set of edges is a minimum spanning tree of an undirected weighted graph with n nodes.\n\nedges is a list of [u, v, w] triples. The proposed tree must have n - 1 edges, form a spanning tree without cycles, and have total weight equal to the Kruskal MST weight. Return a boolean.",
    starterCode: `def verify_mst(n, edges, tree_edges):
    # Your code here
    pass`,
    solution: `def verify_mst(n, edges, tree_edges):
    if len(tree_edges) != n - 1:
        return False
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    for u, v, w in tree_edges:
        ru = find(u)
        rv = find(v)
        if ru == rv:
            return False
        parent[ru] = rv
        total += w

    parent2 = list(range(n))

    def find2(x):
        while parent2[x] != x:
            parent2[x] = parent2[parent2[x]]
            x = parent2[x]
        return x

    mst = 0
    used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru = find2(u)
        rv = find2(v)
        if ru != rv:
            parent2[ru] = rv
            mst += w
            used += 1
    if used != n - 1:
        return False
    return total == mst`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]], [[0, 1, 1], [1, 2, 2], [2, 3, 3]]], expected: true },
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]], [[0, 3, 10], [1, 2, 2], [2, 3, 3]]], expected: false },
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]], [[0, 1, 1], [1, 2, 2], [0, 2, 2]]], expected: false },
      { input: [3, [[0, 1, 5], [1, 2, 4]], [[0, 1, 5], [1, 2, 4]]], expected: true },
      { input: [1, [], []], expected: true },
    ],
    hint: "A valid spanning tree must have exact size, no cycle, and minimum total weight.",
  },
  {
    id: "graph-092",
    title: "Maximum Spanning Tree Weight",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the total weight of a maximum spanning tree of an undirected weighted graph with n nodes.\n\nRun Kruskal with edges sorted from heaviest to lightest. Return -1 when the graph is disconnected and 0 when there is a single node. edges is a list of [u, v, w] triples.",
    starterCode: `def maximum_spanning_tree_weight(n, edges):
    # Your code here
    pass`,
    solution: `def maximum_spanning_tree_weight(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    total = 0
    used = 0
    for u, v, w in sorted(edges, key=lambda e: -e[2]):
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
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]]], expected: 15 },
      { input: [3, [[0, 1, 5], [1, 2, 4], [0, 2, 3]]], expected: 9 },
      { input: [3, [[0, 1, 1]]], expected: -1 },
      { input: [1, []], expected: 0 },
    ],
    hint: "Maximum spanning trees use the same cut reasoning, only the sort order flips.",
  },
  {
    id: "graph-093",
    title: "Bellman-Ford Early Termination",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count how many relaxation passes Bellman-Ford needs before distances stop changing.\n\nPerform up to n - 1 passes over the edge list, stopping after a pass that relaxes nothing. Return the number of passes actually executed. edges is a list of [u, v, w] triples and src is the source node.",
    starterCode: `def bellman_ford_passes(n, edges, src):
    # Your code here
    pass`,
    solution: `def bellman_ford_passes(n, edges, src):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    passes = 0
    for _ in range(n - 1):
        passes += 1
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    return passes`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1]], 0], expected: 2 },
      { input: [1, [], 0], expected: 0 },
      { input: [2, [[0, 1, 1]], 1], expected: 1 },
      { input: [3, [[0, 1, 5], [1, 2, -3], [0, 2, 10]], 0], expected: 2 },
      { input: [3, [[1, 2, 1], [0, 1, 1]], 0], expected: 2 },
    ],
    hint: "An unfavorable edge order can force one extra wave of relaxations per hop.",
  },
  {
    id: "graph-094",
    title: "Betweenness Normalization",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Normalize raw betweenness values of an undirected graph.\n\nFor undirected graphs the number of possible intermediate pairs is (n - 1) * (n - 2) / 2, so divide each value by that count. Return zeros when n is less than 3. values is the raw betweenness list.",
    starterCode: `def normalize_betweenness(n, values):
    # Your code here
    pass`,
    solution: `def normalize_betweenness(n, values):
    if n < 3:
        return [0.0] * n
    scale = (n - 1) * (n - 2) / 2.0
    return [v / scale for v in values]`,
    testCases: [
      { input: [4, [0, 2, 2, 0]], expected: [0.0, 0.6666666666666666, 0.6666666666666666, 0.0] },
      { input: [3, [1, 2, 3]], expected: [1.0, 2.0, 3.0] },
      { input: [2, [5, 5]], expected: [0.0, 0.0] },
      { input: [5, [0, 6, 6, 6, 0]], expected: [0.0, 1.0, 1.0, 1.0, 0.0] },
    ],
    hint: "Normalization turns raw path counts into the fraction of pairs passing through the node.",
  },
  {
    id: "graph-095",
    title: "Personalized PageRank Normalize",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Normalize a Personalized PageRank vector so its entries sum to 1.\n\nDivide every entry by the total sum. If the sum is 0, return a list of zeros of the same length. ranks is the raw rank list.",
    starterCode: `def normalize_ppr(ranks):
    # Your code here
    pass`,
    solution: `def normalize_ppr(ranks):
    total = sum(ranks)
    if total == 0:
        return [0.0] * len(ranks)
    return [r / total for r in ranks]`,
    testCases: [
      { input: [[1, 1, 2]], expected: [0.25, 0.25, 0.5] },
      { input: [[0, 0, 0]], expected: [0.0, 0.0, 0.0] },
      { input: [[2.5, 2.5]], expected: [0.5, 0.5] },
      { input: [[3]], expected: [1.0] },
    ],
    hint: "Dividing by the sum makes the vector a probability distribution again.",
  },
  {
    id: "graph-096",
    title: "HITS Normalization",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Normalize hub and authority score vectors to unit L2 length.\n\nDivide each vector by its Euclidean norm; leave an all-zero vector unchanged as zeros. Return [hubs, authorities].",
    starterCode: `import math
def normalize_hits(hubs, auth):
    # Your code here
    pass`,
    solution: `import math
def normalize_hits(hubs, auth):
    nh = math.sqrt(sum(t * t for t in hubs))
    na = math.sqrt(sum(t * t for t in auth))
    out_hubs = [t / nh for t in hubs] if nh > 0 else [0.0] * len(hubs)
    out_auth = [t / na for t in auth] if na > 0 else [0.0] * len(auth)
    return [out_hubs, out_auth]`,
    testCases: [
      { input: [[3, 0, 0], [0, 1, 1]], expected: [[1.0, 0.0, 0.0], [0.0, 0.7071067811865475, 0.7071067811865475]] },
      { input: [[0, 0], [0, 0]], expected: [[0.0, 0.0], [0.0, 0.0]] },
      { input: [[1, 1], [2, 2]], expected: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, 0.7071067811865475]] },
      { input: [[0, 3, 4], [0, 0, 0]], expected: [[0.0, 0.6, 0.8], [0.0, 0.0, 0.0]] },
    ],
    hint: "L2 normalization keeps the direction of the score vector but makes its length one.",
  },
  {
    id: "graph-097",
    title: "Adamic-Adar Score",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the Adamic-Adar link prediction score between nodes u and v of an undirected graph.\n\nThe score sums 1 / ln(degree(w)) over all common neighbors w with degree greater than 1. Return 0.0 when there are no such common neighbors. edges is a list of [u, v] pairs.",
    starterCode: `import math
def adamic_adar_score(n, edges, u, v):
    # Your code here
    pass`,
    solution: `import math
def adamic_adar_score(n, edges, u, v):
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    score = 0.0
    for w in adj[u] & adj[v]:
        d = len(adj[w])
        if d > 1:
            score += 1.0 / math.log(d)
    return score`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 1.4426950408889634 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 2], expected: 2.8853900817779268 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 0.9102392266268373 },
      { input: [3, [[0, 1], [1, 2]], 0, 1], expected: 0.0 },
    ],
    hint: "Rare common neighbors carry more signal, so low-degree nodes get larger weights.",
  },
  {
    id: "graph-098",
    title: "Jaccard Neighbor Similarity",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the Jaccard similarity of the open neighborhoods of nodes u and v in an undirected graph.\n\nThe score is |N(u) intersect N(v)| / |N(u) union N(v)|, or 0.0 when both neighborhoods are empty. edges is a list of [u, v] pairs.",
    starterCode: `def jaccard_similarity(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def jaccard_similarity(n, edges, u, v):
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    union = adj[u] | adj[v]
    if not union:
        return 0.0
    return len(adj[u] & adj[v]) / len(union)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 1], expected: 0.3333333333333333 },
      { input: [3, [[0, 1], [1, 2]], 0, 1], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 1.0 },
      { input: [3, [], 0, 1], expected: 0.0 },
    ],
    hint: "Jaccard compares shared neighbors against all neighbors of either node.",
  },
  {
    id: "graph-099",
    title: "Cosine Neighbor Similarity",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the cosine similarity between the adjacency rows of nodes u and v in an undirected graph.\n\nFor unweighted graphs the dot product is the number of common neighbors and each norm is the square root of the degree, so the score is common / sqrt(deg(u) * deg(v)). Return 0.0 when either node is isolated. edges is a list of [u, v] pairs.",
    starterCode: `import math
def cosine_similarity(n, edges, u, v):
    # Your code here
    pass`,
    solution: `import math
def cosine_similarity(n, edges, u, v):
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    dot = len(adj[u] & adj[v])
    nu = math.sqrt(len(adj[u]))
    nv = math.sqrt(len(adj[v]))
    if nu == 0 or nv == 0:
        return 0.0
    return dot / (nu * nv)`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0, 1], expected: 0.5 },
      { input: [3, [[0, 1], [1, 2]], 0, 1], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 1.0 },
      { input: [3, [], 0, 1], expected: 0.0 },
    ],
    hint: "Cosine similarity normalizes the shared-neighbor count by both degrees.",
  },
  {
    id: "graph-100",
    title: "Common Neighbors Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the common neighbors of nodes u and v in an undirected graph with n nodes.\n\nReturn the size of the intersection of their neighbor sets. Self-loops, if present, are ignored. edges is a list of [u, v] pairs.",
    starterCode: `def common_neighbors(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def common_neighbors(n, edges, u, v):
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    return len(adj[u] & adj[v])`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 0, 1], expected: 0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1, 2], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 0, 1], expected: 2 },
    ],
    hint: "Common neighbors are the classic simplest link prediction feature.",
  },
  {
    id: "graph-101",
    title: "Preferential Attachment Score",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the preferential attachment link prediction score of nodes u and v: the product of their degrees in an undirected graph.\n\nReturn an integer. edges is a list of [u, v] pairs, and repeated edges count each time.",
    starterCode: `def preferential_attachment(n, edges, u, v):
    # Your code here
    pass`,
    solution: `def preferential_attachment(n, edges, u, v):
    degree = [0] * n
    for a, b in edges:
        degree[a] += 1
        degree[b] += 1
    return degree[u] * degree[v]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 3], expected: 1 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0, 1], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 0, 1], expected: 9 },
      { input: [3, [], 0, 1], expected: 0 },
    ],
    hint: "Highly connected nodes are expected to connect to each other under preferential attachment.",
  },
  {
    id: "graph-102",
    title: "Graph Partition Balance",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Measure the balance of a graph partition given as a community assignment list.\n\nReturn [largest_community_size, smallest_community_size] over all distinct community labels. community is a list mapping each node to a label.",
    starterCode: `def partition_balance(community):
    # Your code here
    pass`,
    solution: `def partition_balance(community):
    counts = {}
    for c in community:
        counts[c] = counts.get(c, 0) + 1
    sizes = list(counts.values())
    return [max(sizes), min(sizes)]`,
    testCases: [
      { input: [[0, 0, 1, 1, 2]], expected: [2, 1] },
      { input: [[0, 1, 2, 3]], expected: [1, 1] },
      { input: [[1, 1, 1]], expected: [3, 3] },
      { input: [[0, 0, 1]], expected: [2, 1] },
    ],
    hint: "Balanced partitions have a ratio near 1 between largest and smallest blocks.",
  },
  {
    id: "graph-103",
    title: "Triangle Transitivity",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the transitivity of an undirected graph: 3 * triangles / triples, where a triple is a path of length two centered at some node.\n\nThe triple count is the sum of degree choose 2 over all nodes. Return 0.0 when there are no triples. edges is a list of [u, v] pairs.",
    starterCode: `def transitivity(n, edges):
    # Your code here
    pass`,
    solution: `def transitivity(n, edges):
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
    if triples == 0:
        return 0.0
    return 3.0 * triangles / triples`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1.0 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 0.6 },
    ],
    hint: "Each triangle closes exactly three open triples.",
  },
  {
    id: "graph-104",
    title: "Global Clustering Coefficient",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the global clustering coefficient: the average of the local clustering coefficients of all n nodes.\n\nA node with degree less than 2 contributes 0.0. edges is a list of [u, v] pairs. Return the mean value.",
    starterCode: `def global_clustering(n, edges):
    # Your code here
    pass`,
    solution: `def global_clustering(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    total = 0.0
    for v in range(n):
        neighbors = list(adj[v])
        k = len(neighbors)
        if k < 2:
            continue
        links = 0
        for i in range(k):
            for j in range(i + 1, k):
                if neighbors[j] in adj[neighbors[i]]:
                    links += 1
        total += 2.0 * links / (k * (k - 1))
    return total / n`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: 0.5833333333333334 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 0.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 0.0 },
    ],
    hint: "This average differs from transitivity, which weights nodes by their triple count.",
  },
  {
    id: "graph-105",
    title: "Vertex Cover 2-Approximation",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build a vertex cover with the classic 2-approximation: repeatedly take the uncovered edge with lexicographically smallest endpoints and add both endpoints to the cover.\n\nRemove all edges incident to chosen nodes and continue until every edge is covered. Return the sorted cover as a list of node indices. edges is a list of [u, v] pairs.",
    starterCode: `def vertex_cover_approx(n, edges):
    # Your code here
    pass`,
    solution: `def vertex_cover_approx(n, edges):
    remaining = set()
    for u, v in edges:
        remaining.add((u, v) if u < v else (v, u))
    cover = set()
    while remaining:
        u, v = min(remaining)
        cover.add(u)
        cover.add(v)
        remaining = {e for e in remaining if e[0] not in (u, v) and e[1] not in (u, v)}
    return sorted(cover)`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [3, []], expected: [] },
    ],
    hint: "Every chosen edge contributes two cover nodes, and at least one endpoint of each must be in any cover.",
  },
  {
    id: "graph-106",
    title: "Independent Set Greedy by Degree",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build an independent set greedily by always taking the highest-degree remaining node.\n\nPick the remaining node with the largest current degree (ties broken by smallest index), add it, and delete it together with all of its neighbors. Return the number of chosen nodes. edges is a list of [u, v] pairs.",
    starterCode: `def independent_set_by_degree(n, edges):
    # Your code here
    pass`,
    solution: `def independent_set_by_degree(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    remaining = set(range(n))
    chosen = 0
    while remaining:
        v = min(remaining, key=lambda x: (-len(adj[x] & remaining), x))
        chosen += 1
        for w in list(adj[v]) + [v]:
            remaining.discard(w)
    return chosen`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 1 },
      { input: [3, []], expected: 3 },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 1 },
    ],
    hint: "Removing a high-degree node also removes many conflicts at once.",
  },
  {
    id: "graph-107",
    title: "MST Uniqueness Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether the minimum spanning tree of an undirected weighted graph with n nodes is unique.\n\nBuild one MST with Kruskal, then for every non-tree edge compare its weight to the maximum edge weight on the tree path between its endpoints. If any weight is equal, swapping produces a second MST, so the answer is False. edges is a list of [u, v, w] triples; return False for disconnected graphs.",
    starterCode: `def is_mst_unique(n, edges):
    # Your code here
    pass`,
    solution: `def is_mst_unique(n, edges):
    if n <= 1:
        return True
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    order = sorted(range(len(edges)), key=lambda i: (edges[i][2], min(edges[i][0], edges[i][1]), max(edges[i][0], edges[i][1])))
    tree_adj = [[] for _ in range(n)]
    used = set()
    count = 0
    for i in order:
        u, v, w = edges[i]
        ru = find(u)
        rv = find(v)
        if ru != rv:
            parent[ru] = rv
            tree_adj[u].append((v, w))
            tree_adj[v].append((u, w))
            used.add(i)
            count += 1
    if count != n - 1:
        return False

    def path_max(a, b):
        seen = {a}
        stack = [(a, 0)]
        while stack:
            x, m = stack.pop()
            if x == b:
                return m
            for y, w in tree_adj[x]:
                if y not in seen:
                    seen.add(y)
                    stack.append((y, max(m, w)))
        return -1

    for i, (u, v, w) in enumerate(edges):
        if i in used:
            continue
        if path_max(u, v) == w:
            return False
    return True`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]]], expected: true },
      { input: [3, [[0, 1, 1], [1, 2, 1], [0, 2, 1]]], expected: false },
      { input: [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]], expected: true },
      { input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]]], expected: false },
      { input: [2, [[0, 1, 1], [0, 1, 1]]], expected: false },
    ],
    hint: "Equal weights along a cycle alternative are exactly what creates multiple MSTs.",
  },
  {
    id: "graph-108",
    title: "Bottleneck Path Min Max Edge",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the path from src to dst that minimizes the maximum edge weight along the path (the minimax or bottleneck path).\n\nUse a Dijkstra-like search where the cost of a node is the smallest possible maximum edge on a path to it. Return that cost, or -1 when dst is unreachable, and 0 when src equals dst. edges is a list of [u, v, w] triples for an undirected graph.",
    starterCode: `import heapq
def bottleneck_path(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `import heapq
def bottleneck_path(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    best = [-1] * n
    best[src] = 0
    heap = [(0, src)]
    while heap:
        cost, v = heapq.heappop(heap)
        if v == dst:
            return cost
        if cost > best[v]:
            continue
        for to, w in adj[v]:
            nd = cost if cost > w else w
            if best[to] == -1 or nd < best[to]:
                best[to] = nd
                heapq.heappush(heap, (nd, to))
    return best[dst]`,
    testCases: [
      { input: [4, [[0, 1, 3], [1, 2, 5], [2, 3, 1], [0, 2, 4]], 0, 3], expected: 4 },
      { input: [4, [[0, 1, 2], [1, 3, 2], [0, 2, 9], [2, 3, 9]], 0, 3], expected: 2 },
      { input: [3, [[0, 1, 1]], 0, 2], expected: -1 },
      { input: [2, [], 0, 0], expected: 0 },
      { input: [2, [[0, 1, 5], [0, 1, 2]], 0, 1], expected: 2 },
    ],
    hint: "The optimal bottleneck path always lies inside the MST path between the endpoints.",
  },
  {
    id: "graph-109",
    title: "Widest Path Maximum Capacity",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the path from src to dst that maximizes the minimum edge capacity along the path (the widest path).\n\nUse a max-heap search where each node keeps the best bottleneck value found so far. edges is a list of directed [u, v, capacity] triples. Return the widest bottleneck, or -1 when dst is unreachable; if src equals dst return 0.",
    starterCode: `import heapq
def widest_path(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `import heapq
def widest_path(n, edges, src, dst):
    if src == dst:
        return 0
    adj = [[] for _ in range(n)]
    for u, v, c in edges:
        adj[u].append((v, c))
    best = [-1] * n
    heap = [(-10 ** 18, src)]
    while heap:
        negw, v = heapq.heappop(heap)
        w = -negw
        if v == dst:
            return w
        if v != src and w < best[v]:
            continue
        for to, c in adj[v]:
            nw = c if v == src else (w if w < c else c)
            if nw > best[to]:
                best[to] = nw
                heapq.heappush(heap, (-nw, to))
    return best[dst]`,
    testCases: [
      { input: [5, [[0, 1, 5], [1, 2, 4], [0, 2, 3], [2, 3, 6], [1, 3, 2]], 0, 3], expected: 4 },
      { input: [3, [[0, 1, 3]], 0, 2], expected: -1 },
      { input: [4, [[0, 1, 7], [1, 2, 1], [2, 0, 5], [0, 2, 4]], 0, 2], expected: 4 },
      { input: [2, [], 1, 1], expected: 0 },
    ],
    hint: "A widest path problem is a shortest path problem on negated capacities.",
  },
  {
    id: "graph-110",
    title: "Shortest Path with At Most K Edges",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Find the cheapest path from src to dst that uses at most k edges.\n\nRun k rounds of Bellman-Ford style relaxation, each round reading distances from a frozen copy so every round adds at most one edge. edges is a list of directed [u, v, w] triples. Return -1 if no path within k edges exists, and 0 when src equals dst with k >= 0.",
    starterCode: `def shortest_path_at_most_k(n, edges, src, dst, k):
    # Your code here
    pass`,
    solution: `def shortest_path_at_most_k(n, edges, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k):
        new = list(dist)
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return dist[dst] if dist[dst] != INF else -1`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 5]], 0, 3, 2], expected: 2 },
      { input: [4, [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 5]], 0, 3, 1], expected: -1 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2, 2], expected: 2 },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 0, 2, 1], expected: -1 },
      { input: [2, [], 0, 0, 0], expected: 0 },
    ],
    hint: "Copying the distance array each round is what caps the number of edges.",
  },
  {
    id: "graph-111",
    title: "Negative Cycle Detection",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether a directed weighted graph contains any negative-weight cycle.\n\nInitialize all distances to 0 (a virtual source joined to every node) and run n full relaxation passes. If the n-th pass still relaxes an edge, a negative cycle exists. edges is a list of [u, v, w] triples.",
    starterCode: `def has_negative_cycle(n, edges):
    # Your code here
    pass`,
    solution: `def has_negative_cycle(n, edges):
    dist = [0] * n
    for _ in range(n):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            return False
    return True`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, -2], [2, 1, -2]]], expected: true },
      { input: [3, [[0, 1, 1], [1, 2, 2]]], expected: false },
      { input: [2, [[0, 1, -1], [1, 0, -1]]], expected: true },
      { input: [1, []], expected: false },
      { input: [4, [[0, 1, 1], [2, 3, -1], [3, 2, -1]]], expected: true },
    ],
    hint: "Starting all distances at zero makes every negative cycle reachable.",
  },
  {
    id: "graph-112",
    title: "Community Label Propagation Iteration",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Run synchronous label propagation to convergence on an undirected graph.\n\nEach node starts with its own index as its label. In every round each node adopts the most frequent label among its neighbors (ties go to the smallest label), isolated nodes keep their label, and all nodes update at once. Repeat until labels stop changing or 100 rounds pass, and return the final labels. edges is a list of [u, v] pairs.",
    starterCode: `def label_propagation_until_stable(n, edges):
    # Your code here
    pass`,
    solution: `def label_propagation_until_stable(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    labels = list(range(n))
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
        if new_labels == labels:
            break
        labels = new_labels
    return labels`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]], expected: [0, 0, 0, 2, 2, 2] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [0, 1, 1, 1] },
      { input: [3, []], expected: [0, 1, 2] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [0, 0, 0, 0] },
    ],
    hint: "Synchronous updates can oscillate; the round cap keeps the procedure deterministic.",
  },
  {
    id: "graph-113",
    title: "Girvan-Newman Remove Max Edge",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one Girvan-Newman step: compute edge betweenness of every edge and remove the single edge with the highest score.\n\nTies are broken by the normalized endpoint pair with the smallest values. Return the remaining edges as a sorted list of [u, v] pairs with u < v. edges is the input edge list of an undirected graph.",
    starterCode: `def girvan_newman_remove(n, edges):
    # Your code here
    pass`,
    solution: `def girvan_newman_remove(n, edges):
    adj = [[] for _ in range(n)]
    index = {}
    for i, (u, v) in enumerate(edges):
        adj[u].append(v)
        adj[v].append(u)
        index[(u, v)] = i
        index[(v, u)] = i
    scores = [0.0] * len(edges)
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
                c = (sigma[v] / sigma[w]) * (1.0 + delta[w])
                scores[index[(v, w)]] += c
                delta[v] += c
    scores = [s / 2.0 for s in scores]
    worst = 0
    best_key = None
    for i, (u, v) in enumerate(edges):
        a, b = (u, v) if u < v else (v, u)
        key = (-scores[i], a, b)
        if best_key is None or key < best_key:
            best_key = key
            worst = i
    remaining = []
    for j, (u, v) in enumerate(edges):
        if j != worst:
            remaining.append([u, v] if u < v else [v, u])
    remaining.sort()
    return remaining`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]], expected: [[0, 1], [0, 2], [1, 2], [3, 4], [3, 5], [4, 5]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[0, 2], [1, 2]] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[0, 1], [2, 3]] },
    ],
    hint: "The bridge between two dense communities carries the highest edge betweenness.",
  },
  {
    id: "graph-114",
    title: "Normalized Cut Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the normalized cut value of a two-way partition of an undirected graph.\n\nLet A be the community of node 0 and B all remaining nodes. With cut the number of crossing edges and vol the sum of degrees in a side, the value is cut / vol(A) + cut / vol(B); return 0.0 when either volume is zero. edges is a list of [u, v] pairs and community maps each node to a label.",
    starterCode: `def normalized_cut(n, edges, community):
    # Your code here
    pass`,
    solution: `def normalized_cut(n, edges, community):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    cut = 0
    for u, v in edges:
        if community[u] != community[v]:
            cut += 1
    side_a = community[0]
    vol_a = 0
    vol_b = 0
    for i in range(n):
        if community[i] == side_a:
            vol_a += degree[i]
        else:
            vol_b += degree[i]
    if vol_a == 0 or vol_b == 0:
        return 0.0
    return cut / vol_a + cut / vol_b`,
    testCases: [
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]], [0, 0, 0, 1, 1, 1]], expected: 0.2857142857142857 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 1, 1]], expected: 0.6666666666666666 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 0, 0, 0]], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [0, 0, 1, 1]], expected: 1.3333333333333333 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [0, 1, 1, 1]], expected: 2.0 },
    ],
    hint: "Normalizing by volumes penalizes cuts that isolate a tiny set of nodes.",
  },
  {
    id: "graph-115",
    title: "PageRank Convergence Iterations Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count how many PageRank iterations are needed to converge from uniform ranks.\n\nIterate the standard recurrence with dangling mass redistribution until the largest rank change is at most tolerance, or 1000 iterations pass. Return the number of iterations executed. edges is a list of directed [u, v] pairs.",
    starterCode: `def pagerank_iterations(n, edges, damping, tolerance):
    # Your code here
    pass`,
    solution: `def pagerank_iterations(n, edges, damping, tolerance):
    ranks = [1.0 / n] * n
    out_degree = [0] * n
    for u, v in edges:
        out_degree[u] += 1
    count = 0
    for _ in range(1000):
        count += 1
        dangling = sum(ranks[u] for u in range(n) if out_degree[u] == 0)
        base = (1.0 - damping) / n + damping * dangling / n
        new = [base] * n
        for u, v in edges:
            new[v] += damping * ranks[u] / out_degree[u]
        diff = max(abs(new[i] - ranks[i]) for i in range(n))
        ranks = new
        if diff <= tolerance:
            break
    return count`,
    testCases: [
      { input: [3, [], 0.85, 1e-9], expected: 1 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.85, 1e-9], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 0.85, 1e-9], expected: 38 },
      { input: [4, [[0, 1], [0, 2], [1, 2], [2, 0]], 0.85, 1e-9], expected: 38 },
      { input: [4, [[0, 1], [0, 2], [1, 2], [2, 0]], 0.5, 1e-3], expected: 5 },
    ],
    hint: "A smaller damping factor and a looser tolerance both cut the iteration count.",
  },
  {
    id: "graph-116",
    title: "Edge Prediction Top Pairs",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Rank non-adjacent node pairs by their number of common neighbors and return the top k pairs.\n\nOnly pairs with at least one common neighbor are considered. Sort by score descending, then by u and v ascending. edges is a list of [u, v] pairs and each returned pair is [u, v] with u < v.",
    starterCode: `def top_predicted_pairs(n, edges, k):
    # Your code here
    pass`,
    solution: `def top_predicted_pairs(n, edges, k):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    scored = []
    for u in range(n):
        for v in range(u + 1, n):
            if v in adj[u]:
                continue
            score = len(adj[u] & adj[v])
            if score > 0:
                scored.append((-score, u, v))
    scored.sort()
    return [[u, v] for _, u, v in scored[:k]]`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [3, 4]], 2], expected: [[0, 2]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 3], expected: [[1, 2], [1, 3], [2, 3]] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2], expected: [[0, 2], [1, 3]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1], expected: [[1, 2]] },
    ],
    hint: "Common-neighbor scoring is the simplest edge prediction baseline.",
  },
  {
    id: "graph-117",
    title: "Rich-Club Coefficient Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the rich-club coefficient at degree threshold k for an undirected graph.\n\nConsider the nodes with degree strictly greater than k; if there are fewer than two, return 0.0. Otherwise return 2 * E / (m * (m - 1)), where E is the number of edges among those nodes and m their count. edges is a list of [u, v] pairs.",
    starterCode: `def rich_club_coefficient(n, edges, k):
    # Your code here
    pass`,
    solution: `def rich_club_coefficient(n, edges, k):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    nodes = {i for i in range(n) if degree[i] > k}
    m = len(nodes)
    if m < 2:
        return 0.0
    e = sum(1 for u, v in edges if u in nodes and v in nodes)
    return 2.0 * e / (m * (m - 1))`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]], 0], expected: 0.5 },
      { input: [4, [[0, 1], [0, 2], [0, 3]], 1], expected: 0.0 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 1], expected: 1.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 1], expected: 1.0 },
    ],
    hint: "A coefficient above the random baseline suggests the rich nodes form a club.",
  },
  {
    id: "graph-118",
    title: "Onion Decomposition Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the onion layer of every node of an undirected graph.\n\nLayer 1 is the set of nodes with minimum current degree removed all at once; then update degrees and repeat, recording the layer number when each node is removed. Return the layer list in node order. edges is a list of [u, v] pairs.",
    starterCode: `def onion_decomposition(n, edges):
    # Your code here
    pass`,
    solution: `def onion_decomposition(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    remaining = set(range(n))
    layer = [0] * n
    current = 0
    while remaining:
        current += 1
        minimum = min(len(adj[v] & remaining) for v in remaining)
        remove = [v for v in remaining if len(adj[v] & remaining) == minimum]
        for v in remove:
            layer[v] = current
            remaining.discard(v)
    return layer`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [2, 1, 1, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [1, 1, 1, 1] },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [1, 2, 2, 1] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [2, 2, 2, 1] },
      { input: [2, []], expected: [1, 1] },
    ],
    hint: "Onion layers peel all minimum-degree nodes at once, unlike one-at-a-time k-core peeling.",
  },
  {
    id: "graph-119",
    title: "Degeneracy Ordering",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute a degeneracy (smallest-last) ordering of an undirected graph.\n\nRepeatedly remove the node with the smallest current degree, breaking ties by smallest index, and record the removal order. Return the full ordering of n nodes. edges is a list of [u, v] pairs.",
    starterCode: `def degeneracy_ordering(n, edges):
    # Your code here
    pass`,
    solution: `def degeneracy_ordering(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    remaining = set(range(n))
    order = []
    while remaining:
        v = min(remaining, key=lambda x: (len(adj[x] & remaining), x))
        order.append(v)
        remaining.discard(v)
    return order`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [1, 2, 0, 3] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3]]], expected: [3, 0, 1, 2] },
    ],
    hint: "The largest degree seen during peeling is the graph degeneracy.",
  },
  {
    id: "graph-120",
    title: "Graph Bandwidth Greedy",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build a vertex ordering with a Cuthill-McKee style BFS and measure its bandwidth.\n\nStart from the smallest-index minimum-degree node. Add nodes in BFS order, pushing each node's unvisited neighbors sorted by degree then index. The bandwidth is the largest absolute difference between the positions of an edge's endpoints. Return [order, bandwidth]. edges is a list of [u, v] pairs.",
    starterCode: `def greedy_bandwidth(n, edges):
    # Your code here
    pass`,
    solution: `def greedy_bandwidth(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    degree = [len(adj[i]) for i in range(n)]
    start = min(range(n), key=lambda x: (degree[x], x))
    order = []
    visited = [False] * n
    queue = [start]
    visited[start] = True
    head = 0
    while head < len(queue):
        v = queue[head]
        head += 1
        order.append(v)
        neighbors = sorted([w for w in adj[v] if not visited[w]], key=lambda x: (degree[x], x))
        for w in neighbors:
            if not visited[w]:
                visited[w] = True
                queue.append(w)
    pos = {v: i for i, v in enumerate(order)}
    bandwidth = 0
    for u, v in edges:
        bandwidth = max(bandwidth, abs(pos[u] - pos[v]))
    return [order, bandwidth]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[0, 1, 2, 3], 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [[1, 0, 2, 3], 2] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [[0, 1, 3, 2], 2] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: [[0, 1, 2, 3, 4], 1] },
    ],
    hint: "Good orderings place connected nodes close together, keeping the bandwidth small.",
  },
  {
    id: "graph-121",
    title: "Set Cover Greedy Pick",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Solve a set cover instance greedily. The universe is the integers 0 to universe_size - 1 and sets is a list of lists of covered elements.\n\nWhile some element is uncovered, pick the set covering the most uncovered elements (ties broken by smallest index) and record its index. Return the picked indices in order, or [] when some element appears in no set.",
    starterCode: `def greedy_set_cover(universe_size, sets):
    # Your code here
    pass`,
    solution: `def greedy_set_cover(universe_size, sets):
    covered = set()
    picked = []
    counts = [0] * universe_size
    for s in sets:
        for x in s:
            counts[x] += 1
    if any(c == 0 for c in counts):
        return []
    while len(covered) < universe_size:
        best = -1
        best_count = 0
        for i, s in enumerate(sets):
            c = sum(1 for x in s if x not in covered)
            if c > best_count:
                best_count = c
                best = i
        picked.append(best)
        covered.update(sets[best])
    return picked`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [0, 2] },
      { input: [5, [[0, 1, 2, 3], [0, 1], [2, 3], [4], [3, 4]]], expected: [0, 3] },
      { input: [3, [[0], [1]]], expected: [] },
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: [0, 1] },
    ],
    hint: "Greedy set cover is an ln(n) approximation: always grab the most new elements.",
  },
  {
    id: "graph-122",
    title: "TSP Nearest Insertion",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build a TSP tour with the nearest-insertion heuristic. dist is a symmetric n by n distance matrix.\n\nStart with the subtour [0, second] where second is the city closest to 0, then repeatedly pick the remaining city with the smallest distance to any tour city (ties by smallest index) and insert it into the position minimizing the length increase. Return [tour, total_length].",
    starterCode: `def tsp_nearest_insertion(dist):
    # Your code here
    pass`,
    solution: `def tsp_nearest_insertion(dist):
    n = len(dist)
    if n == 1:
        return [[0], 0]
    second = 1
    for j in range(1, n):
        if dist[0][j] < dist[0][second]:
            second = j
    tour = [0, second]
    remaining = [i for i in range(n) if i != 0 and i != second]
    while remaining:
        key = None
        for c in remaining:
            d = min(dist[c][t] for t in tour)
            if key is None or d < key[0] or (d == key[0] and c < key[1]):
                key = (d, c)
        city = key[1]
        m = len(tour)
        best = None
        for i in range(m):
            a = tour[i]
            b = tour[(i + 1) % m]
            delta = dist[a][city] + dist[city][b] - dist[a][b]
            if best is None or delta < best[0] or (delta == best[0] and i < best[1]):
                best = (delta, i)
        pos = best[1] + 1
        tour = tour[:pos] + [city] + tour[pos:]
        remaining.remove(city)
    total = sum(dist[tour[i]][tour[(i + 1) % len(tour)]] for i in range(len(tour)))
    return [tour, total]`,
    testCases: [
      { input: [[[0, 1, 4, 5], [1, 0, 2, 3], [4, 2, 0, 1], [5, 3, 1, 0]]], expected: [[0, 3, 2, 1], 9] },
      {
        input: [[[0, 3, 4, 5, 2], [3, 0, 2, 6, 3], [4, 2, 0, 1, 5], [5, 6, 1, 0, 4], [2, 3, 5, 4, 0]]],
        expected: [[0, 3, 2, 1, 4], 13],
      },
      { input: [[[0, 3], [3, 0]]], expected: [[0, 1], 6] },
    ],
    hint: "Insertion heuristics grow a single cycle instead of extending a path.",
  },
  {
    id: "graph-123",
    title: "TSP Farthest Insertion",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build a TSP tour with the farthest-insertion heuristic. dist is a symmetric n by n distance matrix.\n\nStart with the subtour [0, second] where second is the city closest to 0. Then repeatedly pick the remaining city whose nearest tour city is farthest away (ties by smallest index) and insert it at the position minimizing the length increase. Return [tour, total_length].",
    starterCode: `def tsp_farthest_insertion(dist):
    # Your code here
    pass`,
    solution: `def tsp_farthest_insertion(dist):
    n = len(dist)
    if n == 1:
        return [[0], 0]
    second = 1
    for j in range(1, n):
        if dist[0][j] < dist[0][second]:
            second = j
    tour = [0, second]
    remaining = [i for i in range(n) if i != 0 and i != second]
    while remaining:
        key = None
        for c in remaining:
            d = min(dist[c][t] for t in tour)
            if key is None or d > key[0] or (d == key[0] and c < key[1]):
                key = (d, c)
        city = key[1]
        m = len(tour)
        best = None
        for i in range(m):
            a = tour[i]
            b = tour[(i + 1) % m]
            delta = dist[a][city] + dist[city][b] - dist[a][b]
            if best is None or delta < best[0] or (delta == best[0] and i < best[1]):
                best = (delta, i)
        pos = best[1] + 1
        tour = tour[:pos] + [city] + tour[pos:]
        remaining.remove(city)
    total = sum(dist[tour[i]][tour[(i + 1) % len(tour)]] for i in range(len(tour)))
    return [tour, total]`,
    testCases: [
      { input: [[[0, 1, 4, 5], [1, 0, 2, 3], [4, 2, 0, 1], [5, 3, 1, 0]]], expected: [[0, 2, 3, 1], 9] },
      {
        input: [[[0, 3, 4, 5, 2], [3, 0, 2, 6, 3], [4, 2, 0, 1, 5], [5, 6, 1, 0, 4], [2, 3, 5, 4, 0]]],
        expected: [[0, 3, 2, 1, 4], 13],
      },
      { input: [[[0, 3], [3, 0]]], expected: [[0, 1], 6] },
    ],
    hint: "Farthest insertion builds a robust skeleton early by inserting distant cities first.",
  },
  {
    id: "graph-124",
    title: "Vehicle Routing Nearest Neighbor",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build vehicle routes from depot 0 with the nearest-neighbor rule and a capacity limit.\n\nWhile customers remain, start at the depot and repeatedly drive to the nearest unvisited customer whose demand fits the remaining capacity (ties by smallest index); when no customer fits, return to the depot and start a new route. dist is a symmetric matrix, demands[c] is the demand of customer c, and capacity is the vehicle limit. Return [routes, total_distance] or [[], -1] when some demand exceeds capacity.",
    starterCode: `def vehicle_route_nearest(dist, capacity, demands):
    # Your code here
    pass`,
    solution: `def vehicle_route_nearest(dist, capacity, demands):
    unvisited = set(range(1, len(dist)))
    routes = []
    total = 0
    while unvisited:
        route = [0]
        load = 0
        current = 0
        while True:
            candidates = [c for c in unvisited if load + demands[c] <= capacity]
            if not candidates:
                break
            nxt = min(candidates, key=lambda c: (dist[current][c], c))
            route.append(nxt)
            unvisited.discard(nxt)
            load += demands[nxt]
            total += dist[current][nxt]
            current = nxt
        if len(route) == 1:
            return [[], -1]
        total += dist[current][0]
        route.append(0)
        routes.append(route)
    return [routes, total]`,
    testCases: [
      { input: [[[0, 2, 9, 10], [2, 0, 6, 4], [9, 6, 0, 8], [10, 4, 8, 0]], 3, [0, 1, 2, 1]], expected: [[[0, 1, 3, 0], [0, 2, 0]], 34] },
      { input: [[[0, 2, 9, 10], [2, 0, 6, 4], [9, 6, 0, 8], [10, 4, 8, 0]], 5, [0, 2, 2, 2]], expected: [[[0, 1, 3, 0], [0, 2, 0]], 34] },
      { input: [[[0, 2, 9, 10], [2, 0, 6, 4], [9, 6, 8, 0], [10, 4, 8, 0]], 3, [0, 5, 2, 1]], expected: [[], -1] },
    ],
    hint: "Greedy routing ignores global structure but is fast and easy to reason about.",
  },
  {
    id: "graph-125",
    title: "Capacitated Route Feasibility",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check whether a single vehicle route is feasible for a capacitated problem.\n\nThe route must start and end at depot 0, must not repeat customers, and the sum of demands of visited customers must not exceed capacity. demands maps each node to its demand (depot demand is ignored) and route is the ordered node list. Return a boolean.",
    starterCode: `def route_feasible(demands, capacity, route):
    # Your code here
    pass`,
    solution: `def route_feasible(demands, capacity, route):
    if len(route) < 2 or route[0] != 0 or route[-1] != 0:
        return False
    visited = route[1:-1]
    if len(set(visited)) != len(visited):
        return False
    total = 0
    for c in visited:
        if c < 0 or c >= len(demands):
            return False
        total += demands[c]
    return total <= capacity`,
    testCases: [
      { input: [[0, 2, 1], 3, [0, 1, 2, 0]], expected: true },
      { input: [[0, 2, 2], 3, [0, 1, 2, 0]], expected: false },
      { input: [[0, 1], 5, [1, 0]], expected: false },
      { input: [[0, 1, 1], 5, [0, 1, 1, 0]], expected: false },
      { input: [[0], 1, [0, 0]], expected: true },
    ],
    hint: "Repetition and capacity overload are the two classic infeasibilities.",
  },
  {
    id: "graph-126",
    title: "Depot Assignment Nearest",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Assign each customer to its nearest depot. depot_dist is a matrix where row i lists the distance from customer i to each depot.\n\nReturn the list of chosen depot indices in customer order, breaking ties by the smallest depot index.",
    starterCode: `def assign_to_depots(depot_dist):
    # Your code here
    pass`,
    solution: `def assign_to_depots(depot_dist):
    result = []
    for row in depot_dist:
        best = 0
        for j in range(1, len(row)):
            if row[j] < row[best]:
                best = j
        result.append(best)
    return result`,
    testCases: [
      { input: [[[2, 5], [4, 1], [3, 3]]], expected: [0, 1, 0] },
      { input: [[[7], [8]]], expected: [0, 0] },
      { input: [[[1, 1], [1, 1]]], expected: [0, 0] },
      { input: [[[5, 2], [6, 3]]], expected: [1, 1] },
    ],
    hint: "With a single depot every customer assigns to depot 0.",
  },
  {
    id: "graph-127",
    title: "Negative Cycle Path Extraction Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Extract one negative-weight cycle from a directed weighted graph, if any exists.\n\nRun Bellman-Ford from a virtual source (all distances start at 0) and remember the predecessor of the last relaxed node. Walk n predecessors back to guarantee landing inside the cycle, then follow predecessors until returning to the start. Return the cycle as a node list starting and ending at the same node, or [] when there is no negative cycle. edges is a list of [u, v, w] triples.",
    starterCode: `def find_negative_cycle(n, edges):
    # Your code here
    pass`,
    solution: `def find_negative_cycle(n, edges):
    dist = [0] * n
    pred = [-1] * n
    last = -1
    for _ in range(n):
        last = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pred[v] = u
                last = v
    if last == -1:
        return []
    x = last
    for _ in range(n):
        x = pred[x]
    cycle = [x]
    cur = pred[x]
    while cur != x:
        cycle.append(cur)
        cur = pred[cur]
    cycle.append(x)
    cycle.reverse()
    return cycle`,
    testCases: [
      { input: [3, [[0, 1, 1], [1, 2, -2], [2, 1, -2]]], expected: [2, 1, 2] },
      { input: [3, [[0, 1, 1], [1, 2, 2]]], expected: [] },
      { input: [2, [[0, 1, -1], [1, 0, -1]]], expected: [0, 1, 0] },
      { input: [1, []], expected: [] },
      { input: [4, [[0, 1, 1], [2, 3, -1], [3, 2, -1]]], expected: [2, 3, 2] },
    ],
    hint: "Walking n predecessor steps from any relaxed node always lands inside the cycle.",
  },
  {
    id: "graph-128",
    title: "Johnson's Algorithm Step",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Perform the reweighting step of Johnson's algorithm on a directed weighted graph with n nodes.\n\nAdd a virtual node n joined to every node with weight 0 and run Bellman-Ford to get potentials. Then replace each edge weight w with w + pot[u] - pot[v], which makes all edge weights non-negative. Return the reweighted edge list in the original order, or [] when a negative cycle exists. edges is a list of [u, v, w] triples.",
    starterCode: `def johnson_reweight(n, edges):
    # Your code here
    pass`,
    solution: `def johnson_reweight(n, edges):
    ext = edges + [[n, v, 0] for v in range(n)]
    dist = [0] * (n + 1)
    for _ in range(n + 1):
        changed = False
        for u, v, w in ext:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    else:
        return []
    return [[u, v, w + dist[u] - dist[v]] for u, v, w in edges]`,
    testCases: [
      { input: [3, [[0, 1, 2], [1, 2, -1]]], expected: [[0, 1, 2], [1, 2, 0]] },
      { input: [3, [[0, 1, 1], [1, 0, -3]]], expected: [] },
      { input: [4, [[0, 1, 3], [1, 2, -2], [2, 3, 1], [0, 3, 5]]], expected: [[0, 1, 3], [1, 2, 0], [2, 3, 0], [0, 3, 6]] },
      { input: [2, []], expected: [] },
      { input: [2, [[0, 1, 5]]], expected: [[0, 1, 5]] },
    ],
    hint: "The reweighted graph has the same shortest paths but no negative edges.",
  },
  {
    id: "graph-129",
    title: "Floyd-Warshall Path Reconstruction",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find a concrete shortest path between two nodes using Floyd-Warshall with a next-hop matrix.\n\nedges is a list of [u, v, w] triples for an undirected graph with positive weights. Return the node list of a shortest path from src to dst, or [] when dst is unreachable. When src equals dst return [src].",
    starterCode: `def floyd_warshall_path(n, edges, src, dst):
    # Your code here
    pass`,
    solution: `def floyd_warshall_path(n, edges, src, dst):
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    nxt = [[-1] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        if w < dist[u][v]:
            dist[u][v] = w
            dist[v][u] = w
            nxt[u][v] = v
            nxt[v][u] = u
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[k][j] != INF and dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]
    if dist[src][dst] == INF:
        return []
    path = [src]
    while src != dst:
        src = nxt[src][dst]
        path.append(src)
    return path`,
    testCases: [
      { input: [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]], 0, 3], expected: [0, 1, 2, 3] },
      { input: [3, [[0, 1, 5]], 0, 2], expected: [] },
      { input: [3, [[0, 1, 1], [1, 2, 1]], 2, 0], expected: [2, 1, 0] },
      { input: [3, [[0, 1, 1]], 1, 1], expected: [1] },
    ],
    hint: "The next-hop matrix records which first step realizes each optimal distance.",
  },
  {
    id: "graph-130",
    title: "Edge Betweenness",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the (unnormalized, undirected) edge betweenness of every edge with Brandes' algorithm.\n\nFor each source, count shortest paths and accumulate dependencies along BFS predecessor lists; each edge receives the dependency flowing through it, and undirected contributions are finally divided by 2. Return scores aligned with the input edge order. edges is a list of [u, v] pairs.",
    starterCode: `def edge_betweenness(n, edges):
    # Your code here
    pass`,
    solution: `def edge_betweenness(n, edges):
    adj = [[] for _ in range(n)]
    index = {}
    for i, (u, v) in enumerate(edges):
        adj[u].append(v)
        adj[v].append(u)
        index[(u, v)] = i
        index[(v, u)] = i
    scores = [0.0] * len(edges)
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
                c = (sigma[v] / sigma[w]) * (1.0 + delta[w])
                scores[index[(v, w)]] += c
                delta[v] += c
    return [s / 2.0 for s in scores]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [3.0, 4.0, 3.0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1.0, 1.0, 1.0] },
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]], expected: [1.0, 4.0, 4.0, 9.0, 4.0, 1.0, 4.0] },
    ],
    hint: "The bridge between two cliques gets a score proportional to the product of clique sizes.",
  },
  {
    id: "graph-131",
    title: "Louvain Modularity Gain Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the modularity gain of moving a node into each neighboring community, as in the local phase of Louvain.\n\nFor community c, gain = k_in / m - (total_degree_c * degree_node) / (2 * m^2), where k_in counts edges from the node to c and total_degree_c sums degrees in c. Consider only communities different from the node's own that contain a neighbor. Return [best_community, best_gain] (largest gain, ties by smallest community), or [-1, 0.0] when none exist. edges is a list of [u, v] pairs.",
    starterCode: `def best_community_gain(n, edges, community, node):
    # Your code here
    pass`,
    solution: `def best_community_gain(n, edges, community, node):
    m = len(edges)
    if m == 0:
        return [-1, 0.0]
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    totals = {}
    for i in range(n):
        totals[community[i]] = totals.get(community[i], 0) + degree[i]
    k_in = {}
    for u, v in edges:
        if u == node and community[v] != community[node]:
            k_in[community[v]] = k_in.get(community[v], 0) + 1
        if v == node and community[u] != community[node]:
            k_in[community[u]] = k_in.get(community[u], 0) + 1
    if not k_in:
        return [-1, 0.0]
    best = None
    for c in sorted(k_in):
        gain = k_in[c] / m - (totals[c] * degree[node]) / (2.0 * m * m)
        if best is None or gain > best[1] or (gain == best[1] and c < best[0]):
            best = [c, gain]
    return best`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [0, 1, 0], 1], expected: [0, 0.5] },
      { input: [4, [[0, 1], [1, 2], [2, 3]], [0, 1, 1, 1], 3], expected: [-1, 0.0] },
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]], [0, 0, 0, 1, 1, 1], 2], expected: [1, -0.07142857142857142] },
      { input: [3, [[0, 1], [1, 2]], [0, 0, 0], 0], expected: [-1, 0.0] },
      { input: [3, [], [0, 0, 0], 0], expected: [-1, 0.0] },
    ],
    hint: "Positive gain means the node is more tightly connected to that community than chance predicts.",
  },
  {
    id: "graph-132",
    title: "Spectral Clustering Fiedler Signs",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Partition a connected undirected graph into two spectral clusters by the sign pattern of the Fiedler vector.\n\nBuild the Laplacian, compute its eigenvectors with the Jacobi rotation method, take the eigenvector of the second smallest eigenvalue, and return +1 for entries at least 0 and -1 otherwise. edges is a list of [u, v] pairs and n is small.",
    starterCode: `import math
def fiedler_signs(n, edges):
    # Your code here
    pass`,
    solution: `import math
def fiedler_signs(n, edges):
    A = [[0.0] * n for _ in range(n)]
    for u, v in edges:
        A[u][v] += 1
        A[v][u] += 1
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                L[i][j] = sum(A[i])
            else:
                L[i][j] = -A[i][j]
    V = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    for _ in range(200):
        p, q = 0, 1
        mx = 0.0
        for i in range(n):
            for j in range(i + 1, n):
                if abs(L[i][j]) > mx:
                    mx = abs(L[i][j])
                    p, q = i, j
        if mx < 1e-13:
            break
        theta = (L[q][q] - L[p][p]) / (2.0 * L[p][q])
        t = (1.0 if theta >= 0 else -1.0) / (abs(theta) + math.sqrt(theta * theta + 1.0))
        c = 1.0 / math.sqrt(t * t + 1.0)
        s = t * c
        for k in range(n):
            lkp = L[k][p]
            lkq = L[k][q]
            L[k][p] = c * lkp - s * lkq
            L[k][q] = s * lkp + c * lkq
        for k in range(n):
            lpk = L[p][k]
            lqk = L[q][k]
            L[p][k] = c * lpk - s * lqk
            L[q][k] = s * lpk + c * lqk
        for k in range(n):
            vkp = V[k][p]
            vkq = V[k][q]
            V[k][p] = c * vkp - s * vkq
            V[k][q] = s * vkp + c * vkq
    order = sorted(range(n), key=lambda i: L[i][i])
    vec = [V[i][order[1]] for i in range(n)]
    return [1 if x >= 0 else -1 for x in vec]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [1, 1, -1, -1] },
      { input: [6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]]], expected: [1, 1, 1, -1, -1, -1] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1, -1, 1] },
    ],
    hint: "The Fiedler vector changes sign exactly where the graph is best cut in two.",
  },
  {
    id: "graph-133",
    title: "SimRank One Iteration",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Perform one iteration of SimRank on a directed graph with n nodes and decay factor c.\n\nStart from the identity matrix: s(a, b) is 1 when a equals b and 0 otherwise. One update sets s(a, a) = 1 and, for a different from b with nonempty in-neighbor sets, s(a, b) = c / (|I(a)| * |I(b)|) times the double sum of the previous similarities over all in-neighbor pairs. Return the resulting n by n matrix. edges is a list of [u, v] pairs.",
    starterCode: `def simrank_one_iteration(n, edges, c):
    # Your code here
    pass`,
    solution: `def simrank_one_iteration(n, edges, c):
    incoming = [[] for _ in range(n)]
    for u, v in edges:
        incoming[v].append(u)
    previous = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    new = [[0.0] * n for _ in range(n)]
    for a in range(n):
        for b in range(n):
            if a == b:
                new[a][b] = 1.0
            elif incoming[a] and incoming[b]:
                total = 0.0
                for x in incoming[a]:
                    for y in incoming[b]:
                        total += previous[x][y]
                new[a][b] = c * total / (len(incoming[a]) * len(incoming[b]))
    return new`,
    testCases: [
      { input: [3, [[0, 1], [0, 2]], 0.5], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.5], [0.0, 0.5, 1.0]] },
      { input: [4, [[2, 0], [2, 1], [3, 0], [3, 1]], 0.5], expected: [[1.0, 0.25, 0.0, 0.0], [0.25, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.8], expected: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]] },
    ],
    hint: "Two nodes are similar when their in-neighbors are similar, damped by the factor c.",
  },
  {
    id: "graph-134",
    title: "Link Prediction AUC Lite",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Evaluate link prediction scores with a simplified AUC. positives and negatives are lists of held-out edge pairs, and scores is a dictionary mapping pair keys like 0,2 (endpoints sorted, comma separated) to a score.\n\nFor every positive-negative combination award 1 when the positive scores higher, 0.5 on a tie, and 0 otherwise. Return the average over all combinations, or 0.0 when a set is empty.",
    starterCode: `def link_prediction_auc(positives, negatives, scores):
    # Your code here
    pass`,
    solution: `def link_prediction_auc(positives, negatives, scores):
    wins = 0.0
    for a, b in positives:
        sp = scores[str(min(a, b)) + "," + str(max(a, b))]
        for c, d in negatives:
            sn = scores[str(min(c, d)) + "," + str(max(c, d))]
            if sp > sn:
                wins += 1.0
            elif sp == sn:
                wins += 0.5
    total = len(positives) * len(negatives)
    if total == 0:
        return 0.0
    return wins / total`,
    testCases: [
      { input: [[[0, 2], [1, 3]], [[0, 1], [2, 3]], { "0,2": 0.9, "1,3": 0.8, "0,1": 0.1, "2,3": 0.7 }], expected: 1.0 },
      { input: [[[0, 2]], [[0, 1]], { "0,2": 0.4, "0,1": 0.4 }], expected: 0.5 },
      { input: [[[0, 2]], [[0, 1]], { "0,2": 0.2, "0,1": 0.9 }], expected: 0.0 },
    ],
    hint: "AUC is the probability that a random positive edge outscores a random negative one.",
  },
  {
    id: "graph-135",
    title: "Max Flow with Vertex Capacities",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the maximum flow from s to t in a directed graph where every vertex has a capacity.\n\nSplit each vertex v into v_in and v_out joined by an edge of capacity capacities[v]; source and sink get unlimited capacity. Each original edge u to v becomes an unlimited edge from u_out to v_in. Run Ford-Fulkerson on the split network with large finite capacities. edges is a list of [u, v] pairs.",
    starterCode: `def max_flow_vertex_capacity(n, edges, capacities, s, t):
    # Your code here
    pass`,
    solution: `def max_flow_vertex_capacity(n, edges, capacities, s, t):
    N = 2 * n
    cap = [[0] * N for _ in range(N)]
    INF = sum(capacities) + len(edges) + 1
    for v in range(n):
        if v == s or v == t:
            cap[2 * v][2 * v + 1] = INF
        else:
            cap[2 * v][2 * v + 1] = capacities[v]
    for u, v in edges:
        cap[2 * u + 1][2 * v] = INF
        cap[2 * v + 1][2 * u] = INF
    source = 2 * s
    sink = 2 * t + 1
    flow = 0
    while True:
        parent = [-1] * N
        parent[source] = source
        stack = [source]
        while stack:
            x = stack.pop()
            for y in range(N):
                if parent[y] == -1 and cap[x][y] > 0:
                    parent[y] = x
                    stack.append(y)
        if parent[sink] == -1:
            break
        path = []
        x = sink
        while x != source:
            path.append(x)
            x = parent[x]
        path.append(source)
        path.reverse()
        bottleneck = min(cap[path[i]][path[i + 1]] for i in range(len(path) - 1))
        for i in range(len(path) - 1):
            cap[path[i]][path[i + 1]] -= bottleneck
            cap[path[i + 1]][path[i]] += bottleneck
        flow += bottleneck
    return flow`,
    testCases: [
      { input: [4, [[0, 1], [1, 3], [0, 2], [2, 3]], [0, 2, 1, 0], 0, 3], expected: 3 },
      { input: [3, [[0, 1], [1, 2]], [0, 1, 0], 0, 2], expected: 1 },
      { input: [4, [[0, 1], [1, 3], [2, 3], [0, 2]], [0, 10, 10, 0], 0, 3], expected: 20 },
      { input: [5, [[0, 1], [1, 2], [2, 4], [0, 3], [3, 4]], [0, 2, 2, 2, 0], 0, 4], expected: 4 },
      { input: [3, [], [0, 1, 0], 0, 2], expected: 0 },
    ],
    hint: "Node splitting turns a vertex capacity into a single edge capacity.",
  },
];
