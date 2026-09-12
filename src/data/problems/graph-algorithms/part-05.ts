import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "graph-181",
    title: "Message Passing Mean",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Perform one round of mean message passing on an undirected graph.\n\nEach node's new feature vector is the arithmetic mean of its neighbors' feature vectors; nodes without neighbors get an all-zero vector. features is a list of n equal-length vectors. Return the updated feature matrix.",
    starterCode: `def message_passing_mean(n, edges, features):
    # Your code here
    pass`,
    solution: `def message_passing_mean(n, edges, features):
    dim = len(features[0]) if features else 0
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    result = []
    for v in range(n):
        if not adj[v]:
            result.append([0.0] * dim)
        else:
            k = len(adj[v])
            result.append([sum(features[w][d] for w in adj[v]) / k for d in range(dim)])
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [[1, 0], [0, 1], [1, 1]]], expected: [[0.0, 1.0], [1.0, 0.5], [0.0, 1.0]] },
      { input: [2, [[0, 1]], [[2, 3], [4, 5]]], expected: [[4.0, 5.0], [2.0, 3.0]] },
      { input: [1, [], [[5, 5]]], expected: [[0.0, 0.0]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [[1, 1], [2, 2], [3, 3], [4, 4]]], expected: [[3.0, 3.0], [1.0, 1.0], [1.0, 1.0], [1.0, 1.0]] },
    ],
    hint: "Isolated nodes have no incoming messages, so their aggregation is the zero vector.",
  },
  {
    id: "graph-182",
    title: "Graph Pooling Sum",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Aggregate all node feature vectors of a graph with sum pooling.\n\nfeatures is a list of equal-length vectors. Return the elementwise sum, or an empty list when there are no nodes.",
    starterCode: `def graph_pooling_sum(features):
    # Your code here
    pass`,
    solution: `def graph_pooling_sum(features):
    if not features:
        return []
    dim = len(features[0])
    result = [0.0] * dim
    for row in features:
        for d in range(dim):
            result[d] += row[d]
    return result`,
    testCases: [
      { input: [[[1, 2], [3, 4]]], expected: [4.0, 6.0] },
      { input: [[[1, 1]]], expected: [1.0, 1.0] },
      { input: [[]], expected: [] },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [9.0, 12.0] },
    ],
    hint: "Sum pooling is permutation invariant, a key property of graph readouts.",
  },
  {
    id: "graph-183",
    title: "Graph Pooling Max",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Aggregate all node feature vectors of a graph with elementwise max pooling.\n\nfeatures is a list of equal-length vectors. Return the coordinate-wise maximum, or an empty list when there are no nodes.",
    starterCode: `def graph_pooling_max(features):
    # Your code here
    pass`,
    solution: `def graph_pooling_max(features):
    if not features:
        return []
    dim = len(features[0])
    result = list(features[0])
    for row in features[1:]:
        for d in range(dim):
            if row[d] > result[d]:
                result[d] = row[d]
    return result`,
    testCases: [
      { input: [[[1, 5], [3, 2], [0, 4]]], expected: [3.0, 5.0] },
      { input: [[[7, 1], [2, 9]]], expected: [7.0, 9.0] },
      { input: [[]], expected: [] },
      { input: [[[-1, -2], [-3, -4]]], expected: [-1.0, -2.0] },
    ],
    hint: "Max pooling preserves the strongest activation in each coordinate.",
  },
  {
    id: "graph-184",
    title: "Readout Mean",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Read out a graph-level vector as the arithmetic mean of all node feature vectors.\n\nfeatures is a list of equal-length vectors. Return the elementwise mean, or an empty list when there are no nodes.",
    starterCode: `def readout_mean(features):
    # Your code here
    pass`,
    solution: `def readout_mean(features):
    if not features:
        return []
    dim = len(features[0])
    total = [0.0] * dim
    for row in features:
        for d in range(dim):
            total[d] += row[d]
    return [t / len(features) for t in total]`,
    testCases: [
      { input: [[[2, 4], [0, 2]]], expected: [1.0, 3.0] },
      { input: [[]], expected: [] },
      { input: [[[1, 2]]], expected: [1.0, 2.0] },
      { input: [[[0, 0], [2, 4], [4, 8]]], expected: [2.0, 4.0] },
    ],
    hint: "Mean readout keeps the scale of features comparable across graph sizes.",
  },
  {
    id: "graph-185",
    title: "Typed Edges Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Count the edges of each type in a typed edge list.\n\nedges is a list of [u, v, type] triples where type is a string. Return a dictionary mapping each type to its number of edges; an empty edge list yields an empty dictionary.",
    starterCode: `def typed_edges_count(edges):
    # Your code here
    pass`,
    solution: `def typed_edges_count(edges):
    counts = {}
    for u, v, edge_type in edges:
        counts[edge_type] = counts.get(edge_type, 0) + 1
    return counts`,
    testCases: [
      { input: [[[0, 1, "follow"], [1, 2, "follow"], [2, 0, "like"]]], expected: { "follow": 2, "like": 1 } },
      { input: [[]], expected: {} },
      { input: [[[0, 1, "a"], [0, 1, "b"], [1, 2, "a"]]], expected: { "a": 2, "b": 1 } },
    ],
    hint: "Edge type histograms are the simplest summary of a heterogeneous graph.",
  },
  {
    id: "graph-186",
    title: "Hypergraph Incidence Matrix",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the incidence matrix of a hypergraph with n nodes and the given hyperedges.\n\nhyperedges is a list of vertex lists. Return an n by m matrix where entry [v][j] is 1 when node v belongs to hyperedge j, counting repeated mentions only once.",
    starterCode: `def hypergraph_incidence(n, hyperedges):
    # Your code here
    pass`,
    solution: `def hypergraph_incidence(n, hyperedges):
    matrix = [[0] * len(hyperedges) for _ in range(n)]
    for j, members in enumerate(hyperedges):
        for v in set(members):
            matrix[v][j] = 1
    return matrix`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [0, 2]]], expected: [[1, 0, 1], [1, 1, 0], [0, 1, 1]] },
      { input: [2, []], expected: [[], []] },
      { input: [2, [[0, 0, 1]]], expected: [[1], [1]] },
    ],
    hint: "A hyperedge can contain any number of nodes, and duplicates do not change membership.",
  },
  {
    id: "graph-187",
    title: "Hypergraph Node Degree",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the degree of every node of a hypergraph: the number of hyperedges that contain it.\n\nA node counts each containing hyperedge at most once, even if listed several times. Return the degree list in node order. n is the number of nodes and hyperedges is a list of vertex lists.",
    starterCode: `def hypergraph_degrees(n, hyperedges):
    # Your code here
    pass`,
    solution: `def hypergraph_degrees(n, hyperedges):
    degree = [0] * n
    for members in hyperedges:
        for v in set(members):
            degree[v] += 1
    return degree`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [1, 2, 1] },
      { input: [2, []], expected: [0, 0] },
      { input: [2, [[0, 0, 1]]], expected: [1, 1] },
      { input: [3, [[0, 1, 2], [0, 1]]], expected: [2, 2, 1] },
    ],
    hint: "Hypergraph degree counts incident hyperedges, not edge-endpoint incidences.",
  },
  {
    id: "graph-188",
    title: "Bipartite Projection",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Project a bipartite graph with left_size and right_size nodes onto the left side.\n\nTwo left nodes become adjacent when they share at least one right neighbor. edges is a list of [left, right] pairs. Return the sorted adjacency lists of the left nodes.",
    starterCode: `def bipartite_projection(left_size, right_size, edges):
    # Your code here
    pass`,
    solution: `def bipartite_projection(left_size, right_size, edges):
    by_right = [set() for _ in range(right_size)]
    for u, v in edges:
        by_right[v].add(u)
    adj = [set() for _ in range(left_size)]
    for members in by_right:
        ordered = sorted(members)
        for i in range(len(ordered)):
            for j in range(i + 1, len(ordered)):
                adj[ordered[i]].add(ordered[j])
                adj[ordered[j]].add(ordered[i])
    return [sorted(s) for s in adj]`,
    testCases: [
      { input: [3, 2, [[0, 0], [1, 0], [1, 1], [2, 1]]], expected: [[1], [0, 2], [1]] },
      { input: [2, 2, []], expected: [[], []] },
      { input: [3, 1, [[0, 0], [1, 0], [2, 0]]], expected: [[1, 2], [0, 2], [0, 1]] },
    ],
    hint: "Projection connects nodes through their shared neighbors on the other side.",
  },
  {
    id: "graph-189",
    title: "Line Graph Degree Sequence",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the degree of every edge when edges become nodes of the line graph.\n\nIn a simple undirected graph, an edge u-v is adjacent in the line graph to every other edge at u or at v, so its degree is deg(u) + deg(v) - 2. Return the degrees in input edge order. n is the number of original nodes and edges is a list of [u, v] pairs.",
    starterCode: `def line_graph_degree_sequence(n, edges):
    # Your code here
    pass`,
    solution: `def line_graph_degree_sequence(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    return [degree[u] + degree[v] - 2 for u, v in edges]`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [1, 2, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [2, 2, 2] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [2, 2, 2] },
      { input: [2, [[0, 1]]], expected: [0] },
    ],
    hint: "Subtracting 2 removes the edge itself, counted once at each endpoint.",
  },
  {
    id: "graph-190",
    title: "Adjacency Normalization",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the row-normalized adjacency matrix D^-1 A of an undirected graph with n nodes.\n\nEach entry A[i][j] is divided by the degree of i, so every non-isolated node's outgoing weights sum to 1. Rows of isolated nodes are all zeros. edges is a list of [u, v] pairs. Return the n by n matrix of floats.",
    starterCode: `def normalize_adjacency(n, edges):
    # Your code here
    pass`,
    solution: `def normalize_adjacency(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    matrix = [[0.0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1.0 / degree[u]
        matrix[v][u] = 1.0 / degree[v]
    return matrix`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0.0, 1.0, 0.0], [0.5, 0.0, 0.5], [0.0, 1.0, 0.0]] },
      { input: [3, [[0, 1], [0, 2]]], expected: [[0.0, 0.5, 0.5], [1.0, 0.0, 0.0], [1.0, 0.0, 0.0]] },
      { input: [2, []], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "D^-1 A is the transition matrix of the simple random walk.",
  },
  {
    id: "graph-191",
    title: "Laplacian Normalization",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the symmetric normalized Laplacian L_sym = I - D^-1/2 A D^-1/2 of an undirected graph with n nodes.\n\nThe diagonal is 1 for non-isolated nodes and 0 for isolated ones; off-diagonal entry (i, j) is -1 / sqrt(deg(i) * deg(j)) for every edge. edges is a list of [u, v] pairs.",
    starterCode: `import math
def normalized_laplacian(n, edges):
    # Your code here
    pass`,
    solution: `import math
def normalized_laplacian(n, edges):
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        if degree[i] > 0:
            matrix[i][i] = 1.0
    for u, v in edges:
        w = 1.0 / math.sqrt(degree[u] * degree[v])
        matrix[u][v] -= w
        matrix[v][u] -= w
    return matrix`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[1.0, -0.7071067811865475, 0.0], [-0.7071067811865475, 1.0, -0.7071067811865475], [0.0, -0.7071067811865475, 1.0]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[1.0, -0.5, -0.5], [-0.5, 1.0, -0.5], [-0.5, -0.5, 1.0]] },
      { input: [2, []], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "The normalized Laplacian eigenvalues always lie between 0 and 2.",
  },
  {
    id: "graph-192",
    title: "GCN Normalized Adjacency Build",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Build the propagation matrix used by graph convolutional networks: D~^-1/2 (A + I) D~^-1/2.\n\nAdd self-loops to the undirected graph, let D~ be the resulting degrees, and normalize each entry (A + I)[i][j] by 1 / sqrt(D~[i] * D~[j]). edges is a list of [u, v] pairs. Return the n by n matrix.",
    starterCode: `import math
def gcn_normalized_adjacency(n, edges):
    # Your code here
    pass`,
    solution: `import math
def gcn_normalized_adjacency(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    degree = [len(adj[i]) + 1 for i in range(n)]
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        matrix[i][i] = 1.0 / degree[i]
        for j in adj[i]:
            matrix[i][j] = 1.0 / math.sqrt(degree[i] * degree[j])
    return matrix`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [[0.5, 0.4082482904638631, 0.0], [0.4082482904638631, 0.3333333333333333, 0.4082482904638631], [0.0, 0.4082482904638631, 0.5]] },
      { input: [2, [[0, 1]]], expected: [[0.5, 0.5], [0.5, 0.5]] },
      { input: [1, []], expected: [[1.0]] },
    ],
    hint: "Self-loops make isolated nodes propagate their own features.",
  },
  {
    id: "graph-193",
    title: "Cartesian Product Edge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the number of edges in the Cartesian product G1 x G2 of two undirected graphs.\n\nThe product has n1 * n2 nodes and m1 * n2 + n1 * m2 edges. Return the count given the node counts and edge lists of the two factors.",
    starterCode: `def cartesian_product_edges(n1, edges1, n2, edges2):
    # Your code here
    pass`,
    solution: `def cartesian_product_edges(n1, edges1, n2, edges2):
    return len(edges1) * n2 + n1 * len(edges2)`,
    testCases: [
      { input: [2, [[0, 1]], 3, [[0, 1], [1, 2]]], expected: 7 },
      { input: [1, [], 2, [[0, 1]]], expected: 1 },
      { input: [2, [[0, 1]], 2, []], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], 2, [[0, 1]]], expected: 7 },
    ],
    hint: "Each edge of one factor is copied once for every node of the other factor.",
  },
  {
    id: "graph-194",
    title: "Tensor Product Edge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the number of edges in the tensor (categorical) product G1 x G2 of two undirected graphs.\n\nAn edge exists in the product exactly when both coordinates change along an edge, so each pair of factor edges yields two directed edges, or 2 * m1 * m2 total undirected edges. Return the count.",
    starterCode: `def tensor_product_edges(edges1, edges2):
    # Your code here
    pass`,
    solution: `def tensor_product_edges(edges1, edges2):
    return 2 * len(edges1) * len(edges2)`,
    testCases: [
      { input: [[[0, 1]], [[0, 1], [1, 2]]], expected: 4 },
      { input: [[[0, 1], [1, 2]], [[0, 1]]], expected: 4 },
      { input: [[], [[0, 1]]], expected: 0 },
      { input: [[[0, 1], [1, 2], [2, 0]], [[0, 1]]], expected: 6 },
    ],
    hint: "Every pair of edges in the factors produces two product edges, one per orientation.",
  },
  {
    id: "graph-195",
    title: "Strong Product Edge Count",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the number of edges in the strong product G1 x G2 of two undirected graphs.\n\nThe strong product combines the Cartesian and tensor products, so it has m1 * n2 + n1 * m2 + 2 * m1 * m2 edges. Return the count given the node counts and edge lists.",
    starterCode: `def strong_product_edges(n1, edges1, n2, edges2):
    # Your code here
    pass`,
    solution: `def strong_product_edges(n1, edges1, n2, edges2):
    return len(edges1) * n2 + n1 * len(edges2) + 2 * len(edges1) * len(edges2)`,
    testCases: [
      { input: [2, [[0, 1]], 3, [[0, 1], [1, 2]]], expected: 11 },
      { input: [1, [], 2, [[0, 1]]], expected: 1 },
      { input: [2, [[0, 1]], 2, []], expected: 2 },
    ],
    hint: "The three terms correspond to moving in the first factor, the second, or both.",
  },
  {
    id: "graph-196",
    title: "Euler Characteristic of Planar Graph",
    category: "Graph Algorithms",
    difficulty: "Easy",
    description:
      "Compute the Euler characteristic of a planar graph from its vertex, edge, and face counts: V - E + F.\n\nn is the number of vertices, edges is the edge list, and faces is the number of faces including the outer one. Return the integer value, which equals 2 for any connected planar graph.",
    starterCode: `def euler_characteristic(n, edges, faces):
    # Your code here
    pass`,
    solution: `def euler_characteristic(n, edges, faces):
    return n - len(edges) + faces`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 2], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 2], expected: 2 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], 2], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 0]], 3], expected: 2 },
    ],
    hint: "Euler's formula is the oldest invariant in graph theory.",
  },
  {
    id: "graph-197",
    title: "Node Classification Accuracy",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the accuracy of node classification predictions.\n\nReturn the fraction of nodes where predictions equals labels, or 0.0 when the lists are empty. predictions and labels are equal-length lists of labels, typically integers.",
    starterCode: `def node_classification_accuracy(predictions, labels):
    # Your code here
    pass`,
    solution: `def node_classification_accuracy(predictions, labels):
    if not predictions:
        return 0.0
    correct = 0
    for a, b in zip(predictions, labels):
        if a == b:
            correct += 1
    return correct / len(predictions)`,
    testCases: [
      { input: [[0, 1, 1, 0], [0, 1, 1, 1]], expected: 0.75 },
      { input: [[1, 0], [1, 1]], expected: 0.5 },
      { input: [[5], [5]], expected: 1.0 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Accuracy is the micro-level companion of partition similarity scores.",
  },
  {
    id: "graph-198",
    title: "Hits@k",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the hits@k metric for link prediction.\n\ntrue_edges is a list of [u, v] pairs and predictions is a ranked list of predicted [u, v] pairs. Return the fraction of true edges that appear among the first k predictions, or 0.0 when there are no true edges. Endpoint order is ignored.",
    starterCode: `def hits_at_k(true_edges, predictions, k):
    # Your code here
    pass`,
    solution: `def hits_at_k(true_edges, predictions, k):
    truth = set()
    for u, v in true_edges:
        truth.add((u, v) if u < v else (v, u))
    if not truth:
        return 0.0
    hits = 0
    for i in range(min(k, len(predictions))):
        u, v = predictions[i]
        key = (u, v) if u < v else (v, u)
        if key in truth:
            hits += 1
    return hits / len(truth)`,
    testCases: [
      { input: [[[0, 2], [1, 3]], [[0, 1], [0, 2], [2, 3], [1, 3]], 2], expected: 0.5 },
      { input: [[[0, 2], [1, 3]], [[0, 1], [0, 2], [2, 3], [1, 3]], 4], expected: 1.0 },
      { input: [[[0, 2], [1, 3]], [[0, 1], [0, 2], [2, 3], [1, 3]], 0], expected: 0.0 },
      { input: [[[0, 2]], [[0, 1]], 1], expected: 0.0 },
    ],
    hint: "Hits@k rewards ranking true edges near the top of the prediction list.",
  },
  {
    id: "graph-199",
    title: "Attention Aggregation Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one round of dot-product attention aggregation on an undirected graph.\n\nFor node v and neighbor w compute the raw score as the dot product of their feature vectors, apply a softmax over all neighbors of v, and return the weighted average of neighbor features. Isolated nodes return zeros. features is a list of equal-length vectors.",
    starterCode: `import math
def attention_aggregation(n, edges, features):
    # Your code here
    pass`,
    solution: `import math
def attention_aggregation(n, edges, features):
    dim = len(features[0])
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    result = []
    for v in range(n):
        if not adj[v]:
            result.append([0.0] * dim)
            continue
        scores = []
        for w in adj[v]:
            scores.append(sum(features[v][d] * features[w][d] for d in range(dim)))
        mx = max(scores)
        exps = [math.exp(s - mx) for s in scores]
        total = sum(exps)
        out = [0.0] * dim
        for idx, w in enumerate(adj[v]):
            a = exps[idx] / total
            for d in range(dim):
                out[d] += a * features[w][d]
        result.append(out)
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [[1, 0], [0, 1], [1, 1]]], expected: [[0.0, 1.0], [1.0, 0.7310585786300049], [0.0, 1.0]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], [[1, 0], [1, 0], [0, 1], [0, -1]]], expected: [[0.5761168847658291, 0.0], [1.0, 0.0], [1.0, 0.0], [1.0, 0.0]] },
      { input: [2, [], [[1, 2]]], expected: [[0.0, 0.0], [0.0, 0.0]] },
    ],
    hint: "Subtracting the max score before exponentiating keeps the softmax stable.",
  },
  {
    id: "graph-200",
    title: "GCN Layer Output",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the output of one graph convolutional layer: H = ReLU(D~^-1/2 (A + I) D~^-1/2 X W).\n\nfeatures is an n by dim input matrix and weights is a dim by out_dim parameter matrix. Return the n by out_dim hidden matrix after the ReLU nonlinearity. edges is a list of [u, v] pairs.",
    starterCode: `import math
def gcn_layer_output(n, edges, features, weights):
    # Your code here
    pass`,
    solution: `import math
def gcn_layer_output(n, edges, features, weights):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    degree = [len(adj[i]) + 1 for i in range(n)]
    dim = len(features[0])
    out_dim = len(weights[0])
    hidden = [[0.0] * out_dim for _ in range(n)]
    for i in range(n):
        agg = [0.0] * dim
        for j in range(n):
            if i == j:
                coeff = 1.0 / degree[i]
            elif j in adj[i]:
                coeff = 1.0 / math.sqrt(degree[i] * degree[j])
            else:
                coeff = 0.0
            if coeff != 0.0:
                for d in range(dim):
                    agg[d] += coeff * features[j][d]
        for o in range(out_dim):
            value = 0.0
            for d in range(dim):
                value += agg[d] * weights[d][o]
            hidden[i][o] = value if value > 0 else 0.0
    return hidden`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [[1, 0], [0, 1], [1, 1]], [[1, -1], [2, 1]]], expected: [[1.3164965809277263, 0.0], [2.299659828522119, 0.0], [2.3164965809277263, 0.40824829046386313]] },
      { input: [2, [[0, 1]], [[1, 1], [2, 0]], [[1], [1]]], expected: [[2.0], [2.0]] },
      { input: [3, [], [[1, 0], [0, 1], [1, 1]], [[1, -1], [2, 1]]], expected: [[1.0, 0.0], [2.0, 1.0], [3.0, 0.0]] },
    ],
    hint: "Self-loops inside the normalized adjacency keep a node's own features in the mix.",
  },
  {
    id: "graph-201",
    title: "Graph Autoencoder Loss Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the mean binary cross-entropy reconstruction loss of an adjacency matrix.\n\nscores is an n by n matrix of predicted edge probabilities. For every ordered pair i different from j add -(A[i][j] log p + (1 - A[i][j]) log(1 - p)) using the true adjacency built from edges, and return the mean over all n * (n - 1) pairs.",
    starterCode: `import math
def graph_autoencoder_loss(n, edges, scores):
    # Your code here
    pass`,
    solution: `import math
def graph_autoencoder_loss(n, edges, scores):
    adj = [[0] * n for _ in range(n)]
    for u, v in edges:
        adj[u][v] = 1
        adj[v][u] = 1
    total = 0.0
    count = 0
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            p = scores[i][j]
            total += -(adj[i][j] * math.log(p) + (1 - adj[i][j]) * math.log(1 - p))
            count += 1
    return total / count`,
    testCases: [
      { input: [2, [[0, 1]], [[0.5, 0.9], [0.9, 0.5]]], expected: 0.10536051565782628 },
      { input: [2, [], [[0.5, 0.2], [0.2, 0.5]]], expected: 0.2231435513142097 },
      { input: [3, [[0, 1]], [[0.5, 0.8, 0.1], [0.8, 0.5, 0.3], [0.1, 0.3, 0.5]]], expected: 0.22839300363692283 },
    ],
    hint: "Reconstruction loss rewards high scores on existing edges and low scores elsewhere.",
  },
  {
    id: "graph-202",
    title: "Contrastive Graph Loss Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute a contrastive graph loss over aligned positive and negative pairs: -log(sigmoid((pos - neg) / temperature)).\n\npos_scores and neg_scores are equal-length lists of similarity scores. Return the mean loss over pairs, or 0.0 when the lists are empty.",
    starterCode: `import math
def contrastive_graph_loss(pos_scores, neg_scores, temperature):
    # Your code here
    pass`,
    solution: `import math
def contrastive_graph_loss(pos_scores, neg_scores, temperature):
    if not pos_scores:
        return 0.0
    total = 0.0
    for p, ns in zip(pos_scores, neg_scores):
        x = (p - ns) / temperature
        total += -math.log(1.0 / (1.0 + math.exp(-x)))
    return total / len(pos_scores)`,
    testCases: [
      { input: [[0.9, 0.7], [0.1, 0.3], 1.0], expected: 0.44205795917386514 },
      { input: [[0.5], [0.5], 2.0], expected: 0.6931471805599453 },
      { input: [[], [], 1.0], expected: 0.0 },
    ],
    hint: "The loss shrinks as positive scores pull ahead of negative scores.",
  },
  {
    id: "graph-203",
    title: "Random Walk Negative Sampling Seeded",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Sample k non-edges uniformly from an undirected graph with n nodes as negative examples.\n\nAll pairs i < j that are not edges are candidates. Call random.seed(seed) first so results are reproducible, sample without replacement, and return the chosen pairs sorted. When fewer candidates than k exist, return all of them.",
    starterCode: `import random
def negative_sampling(n, edges, k, seed):
    # Your code here
    pass`,
    solution: `import random
def negative_sampling(n, edges, k, seed):
    random.seed(seed)
    existing = set()
    for u, v in edges:
        existing.add((u, v) if u < v else (v, u))
    candidates = []
    for i in range(n):
        for j in range(i + 1, n):
            if (i, j) not in existing:
                candidates.append((i, j))
    chosen = random.sample(candidates, min(k, len(candidates)))
    return sorted([list(e) for e in chosen])`,
    testCases: [
      { input: [5, [[0, 1], [1, 2], [2, 3]], 3, 42], expected: [[0, 2], [2, 4], [3, 4]] },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 2, 7], expected: [] },
      { input: [3, [[0, 1], [1, 2]], 5, 1], expected: [[0, 2]] },
    ],
    hint: "Negative sampling supplies the contrastive pairs that make link prediction trainable.",
  },
  {
    id: "graph-204",
    title: "Node2Vec Transition Probabilities Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the unnormalized node2vec transition weights from prev to each neighbor of cur.\n\nThe weight is 1/p when the neighbor equals prev, 1 when the neighbor is adjacent to prev, and 1/q otherwise. edges is a list of [u, v] pairs. Return a list of [neighbor, weight] pairs sorted by neighbor.",
    starterCode: `def node2vec_probs(n, edges, prev, cur, p, q):
    # Your code here
    pass`,
    solution: `def node2vec_probs(n, edges, prev, cur, p, q):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    result = []
    for w in sorted(adj[cur]):
        if w == prev:
            weight = 1.0 / p
        elif prev in adj[w]:
            weight = 1.0
        else:
            weight = 1.0 / q
        result.append([w, weight])
    return result`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [1, 3]], 0, 1, 1.0, 1.0], expected: [[0, 1.0], [2, 1.0], [3, 1.0]] },
      { input: [4, [[0, 1], [1, 2], [1, 3]], 0, 1, 2.0, 0.5], expected: [[0, 0.5], [2, 2.0], [3, 2.0]] },
      { input: [4, [[0, 1], [1, 2], [1, 3]], 2, 1, 1.0, 2.0], expected: [[0, 0.5], [2, 1.0], [3, 0.5]] },
    ],
    hint: "The return parameter p and in-out parameter q trade off backtracking against exploration.",
  },
  {
    id: "graph-205",
    title: "Metapath Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count the walks from a start node that follow a given sequence of edge types.\n\nEach metapath step consumes one edge type, and edges can be reused freely. typed_edges is a list of [u, v, type] triples, path_types is the sequence of types, and start is the starting node. Return the number of matching walks.",
    starterCode: `def metapath_count(typed_edges, path_types, start):
    # Your code here
    pass`,
    solution: `def metapath_count(typed_edges, path_types, start):
    adj = {}
    for u, v, t in typed_edges:
        if (u, t) not in adj:
            adj[(u, t)] = []
        if (v, t) not in adj:
            adj[(v, t)] = []
        adj[(u, t)].append(v)
        adj[(v, t)].append(u)
    current = [start]
    for t in path_types:
        nxt = []
        for node in current:
            nxt.extend(adj.get((node, t), []))
        current = nxt
    return len(current)`,
    testCases: [
      { input: [[[0, 1, "a"], [1, 2, "b"], [2, 3, "a"]], ["a", "b"], 0], expected: 1 },
      { input: [[[0, 1, "a"], [1, 2, "b"], [2, 3, "a"]], ["a", "b", "a"], 0], expected: 1 },
      { input: [[[0, 1, "a"], [0, 2, "a"], [1, 3, "b"], [2, 3, "b"]], ["a", "b"], 0], expected: 2 },
      { input: [[[0, 1, "a"]], ["b"], 0], expected: 0 },
    ],
    hint: "Metapaths encode semantically meaningful typed relations in heterogeneous graphs.",
  },
  {
    id: "graph-206",
    title: "Heterogeneous Graph Degree",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the total degree of each node type in a heterogeneous graph.\n\nnodes_types[i] is the type string of node i and typed_edges is a list of [u, v, type] triples. Each edge contributes one incidence to each endpoint's degree. Return a dictionary mapping each node type to the sum of degrees of its nodes.",
    starterCode: `def heterogeneous_degree(node_types, typed_edges):
    # Your code here
    pass`,
    solution: `def heterogeneous_degree(node_types, typed_edges):
    degree = [0] * len(node_types)
    for u, v, edge_type in typed_edges:
        degree[u] += 1
        degree[v] += 1
    result = {}
    for i, tp in enumerate(node_types):
        result[tp] = result.get(tp, 0) + degree[i]
    return result`,
    testCases: [
      { input: [["user", "user", "item", "item"], [[0, 2, "buy"], [1, 2, "buy"], [0, 3, "view"]]], expected: { "user": 3, "item": 3 } },
      { input: [["a", "b", "a"], [[0, 1, "x"], [1, 2, "y"]]], expected: { "a": 2, "b": 2 } },
      { input: [["x"], []], expected: { "x": 0 } },
    ],
    hint: "Type-level degree sums aggregate the activity of each node class.",
  },
  {
    id: "graph-207",
    title: "Clique Expansion",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Convert a hypergraph into a graph with clique expansion: every pair of nodes inside a hyperedge becomes an edge.\n\nDuplicate edges are removed and each hyperedge is treated as a set, so repeated members do not create parallel edges. Return the resulting edges as a sorted list of [u, v] pairs. hyperedges is a list of vertex lists.",
    starterCode: `def clique_expansion(hyperedges):
    # Your code here
    pass`,
    solution: `def clique_expansion(hyperedges):
    edges = set()
    for members in hyperedges:
        ordered = sorted(set(members))
        for i in range(len(ordered)):
            for j in range(i + 1, len(ordered)):
                edges.add((ordered[i], ordered[j]))
    return [[a, b] for a, b in sorted(edges)]`,
    testCases: [
      { input: [[[0, 1, 2], [1, 2, 3]]], expected: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]] },
      { input: [[[0, 1], [1, 2]]], expected: [[0, 1], [1, 2]] },
      { input: [[[0, 0, 1]]], expected: [[0, 1]] },
    ],
    hint: "Clique expansion loses higher-order structure but enables standard graph algorithms.",
  },
  {
    id: "graph-208",
    title: "Lexicographic Product Degree",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the degree matrix of the lexicographic product of two undirected graphs.\n\nIn this product the degree of pair (u, v) is n2 * deg1(u) + deg2(v), where n2 is the node count of the second factor. Given the degree sequences of both factors, return the degrees in row-major order with u as the outer index.",
    starterCode: `def lexicographic_degree(n1, deg1, n2, deg2):
    # Your code here
    pass`,
    solution: `def lexicographic_degree(n1, deg1, n2, deg2):
    return [[n2 * deg1[u] + deg2[v] for v in range(n2)] for u in range(n1)]`,
    testCases: [
      { input: [2, [1, 2], 3, [0, 1, 2]], expected: [[3, 4, 5], [6, 7, 8]] },
      { input: [1, [3], 2, [1, 1]], expected: [[7, 7]] },
      { input: [2, [0, 0], 2, [0, 0]], expected: [[0, 0], [0, 0]] },
    ],
    hint: "In a lexicographic product each copy of the second graph is joined completely between adjacent first-factor nodes.",
  },
  {
    id: "graph-209",
    title: "Random Walk Graph Kernel Count",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Count all walks of length at most k in an undirected graph with n nodes.\n\nThe number of walks of length t is the sum of all entries of A^t, where A is the adjacency matrix. Starting with the n walks of length 0, repeatedly multiply the all-ones vector by A and accumulate. Return the total count.",
    starterCode: `def random_walk_kernel_count(n, edges, k):
    # Your code here
    pass`,
    solution: `def random_walk_kernel_count(n, edges, k):
    A = [[0] * n for _ in range(n)]
    for u, v in edges:
        A[u][v] += 1
        A[v][u] += 1
    vector = [1] * n
    total = n
    for _ in range(k):
        new = [0] * n
        for i in range(n):
            for j in range(n):
                if A[i][j]:
                    new[i] += A[i][j] * vector[j]
        vector = new
        total += sum(vector)
    return total`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], 2], expected: 21 },
      { input: [3, [[0, 1], [1, 2]], 3], expected: 21 },
      { input: [2, [[0, 1]], 0], expected: 2 },
      { input: [2, [[0, 1]], 1], expected: 4 },
    ],
    hint: "The walk kernel compares graphs by counting matching paths, a classic structural kernel.",
  },
  {
    id: "graph-210",
    title: "WL Hash Colors One Round",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Perform one round of Weisfeiler-Lehman color refinement on an undirected graph.\n\nEach node's new color is the string formed by its old color, a vertical bar, and the sorted comma-separated colors of its neighbors. labels is the initial color list. Return the upgraded color list; isolated nodes keep only their old color after the bar.",
    starterCode: `def wl_hash_colors_one_round(n, edges, labels):
    # Your code here
    pass`,
    solution: `def wl_hash_colors_one_round(n, edges, labels):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    result = []
    for v in range(n):
        neighbor_labels = sorted(str(labels[w]) for w in adj[v])
        result.append(str(labels[v]) + "|" + ",".join(neighbor_labels))
    return result`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], [0, 1, 0]], expected: ["0|1", "1|0,0", "0|1"] },
      { input: [4, [[0, 1], [0, 2], [0, 3]], ["c", "l", "l", "l"]], expected: ["c|l,l,l", "l|c", "l|c", "l|c"] },
      { input: [2, [], ["x", "y"]], expected: ["x|", "y|"] },
    ],
    hint: "Sorted neighbor multisets make the refinement independent of node ordering.",
  },
  {
    id: "graph-211",
    title: "WL Kernel Similarity",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the normalized Weisfeiler-Lehman kernel similarity between two color histograms.\n\nlabels_a and labels_b are color lists produced by WL refinement. Build color-count dictionaries, take their dot product, and divide by the product of their L2 norms. Return 0.0 when either list is empty or has zero norm.",
    starterCode: `import math
def wl_kernel_similarity(labels_a, labels_b):
    # Your code here
    pass`,
    solution: `import math
def wl_kernel_similarity(labels_a, labels_b):
    counts_a = {}
    counts_b = {}
    for x in labels_a:
        counts_a[x] = counts_a.get(x, 0) + 1
    for x in labels_b:
        counts_b[x] = counts_b.get(x, 0) + 1
    dot = 0
    for key, val in counts_a.items():
        dot += val * counts_b.get(key, 0)
    norm_a = math.sqrt(sum(v * v for v in counts_a.values()))
    norm_b = math.sqrt(sum(v * v for v in counts_b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)`,
    testCases: [
      { input: [["a", "b", "a"], ["a", "b", "a"]], expected: 1.0 },
      { input: [["a", "b"], ["a", "c"]], expected: 0.5 },
      { input: [["a", "a", "b"], ["a", "b", "b"]], expected: 0.8 },
      { input: [[], []], expected: 0.0 },
    ],
    hint: "Normalized kernels let graphs of different sizes be compared fairly.",
  },
  {
    id: "graph-212",
    title: "Graphlet Kernel Count Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Build the graphlet kernel feature vector of an undirected graph for induced 4-node subgraphs.\n\nFor every 4-node subset count its induced edge number, and return a length-7 list where entry e counts subsets that induce exactly e edges. n is the number of nodes and edges is a list of [u, v] pairs.",
    starterCode: `from itertools import combinations
def graphlet_kernel_count_lite(n, edges):
    # Your code here
    pass`,
    solution: `from itertools import combinations
def graphlet_kernel_count_lite(n, edges):
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    counts = [0] * 7
    for combo in combinations(range(n), 4):
        e = 0
        for i in range(4):
            for j in range(i + 1, 4):
                if combo[j] in adj[combo[i]]:
                    e += 1
        counts[e] += 1
    return counts`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 0, 0, 1, 0, 0, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: [0, 0, 0, 0, 1, 0, 0] },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: [0, 0, 3, 2, 0, 0, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [0, 0, 0, 0, 0, 0, 0] },
    ],
    hint: "Graphlet kernels count small induced patterns as structural features.",
  },
  {
    id: "graph-213",
    title: "Heat Kernel Trace Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Compute the heat kernel trace of an undirected graph: trace(exp(-t L)) = sum of exp(-t * lambda) over the Laplacian eigenvalues.\n\nBuild the Laplacian, diagonalize it with Jacobi rotations, and sum the exponentials of the negated scaled eigenvalues. edges is a list of [u, v] pairs and t is the diffusion time. Return a float.",
    starterCode: `import math
def heat_kernel_trace(n, edges, t):
    # Your code here
    pass`,
    solution: `import math
def heat_kernel_trace(n, edges, t):
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
        tt = (1.0 if theta >= 0 else -1.0) / (abs(theta) + math.sqrt(theta * theta + 1.0))
        c = 1.0 / math.sqrt(tt * tt + 1.0)
        s = tt * c
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
    return sum(math.exp(-t * L[i][i]) for i in range(n))`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]], 1.0], expected: 1.4176665095393064 },
      { input: [3, [[0, 1], [1, 2], [2, 0]], 0.5], expected: 1.4462603202968596 },
      { input: [2, [[0, 1]], 0.0], expected: 2.0 },
      { input: [2, [[0, 1]], 1.0], expected: 1.1353352832366128 },
    ],
    hint: "The heat trace decays fastest along the highest-frequency Laplacian modes.",
  },
  {
    id: "graph-214",
    title: "Resistance Distance Series-Parallel",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Combine resistances with the series and parallel laws.\n\nseries is a list of resistances connected in series, and parallel_groups is a list of groups where each group is connected in parallel; the groups themselves are in series with the first list. Return the total resistance.",
    starterCode: `def resistance_series_parallel(series, parallel_groups):
    # Your code here
    pass`,
    solution: `def resistance_series_parallel(series, parallel_groups):
    total = sum(series)
    for group in parallel_groups:
        total += 1.0 / sum(1.0 / r for r in group)
    return total`,
    testCases: [
      { input: [[2, 3], [[6, 3]]], expected: 7.0 },
      { input: [[], [[1, 1]]], expected: 0.5 },
      { input: [[1, 1, 1], []], expected: 3.0 },
      { input: [[1], [[2, 2], [3, 6]]], expected: 4.0 },
    ],
    hint: "Series resistances add; parallel conductances add.",
  },
  {
    id: "graph-215",
    title: "Flow with Demands Feasibility Lite",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Decide whether a directed capacitated network can route all supplies to all demands.\n\nsupplies[i] is positive for producers, negative for consumers, and must sum to 0. Connect a super source to producers and consumers to a super sink, then check whether the max flow saturates all supply. edges is a list of [u, v, capacity] triples. Return a boolean.",
    starterCode: `def flow_demands_feasible(n, edges, supplies):
    # Your code here
    pass`,
    solution: `def flow_demands_feasible(n, edges, supplies):
    if sum(supplies) != 0:
        return False
    N = n + 2
    source = n
    sink = n + 1
    cap = [[0] * N for _ in range(N)]
    total_supply = 0
    for i, s in enumerate(supplies):
        if s > 0:
            cap[source][i] = s
            total_supply += s
        elif s < 0:
            cap[i][sink] = -s
    for u, v, c in edges:
        cap[u][v] += c
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
    return flow == total_supply`,
    testCases: [
      { input: [3, [[0, 1, 2], [1, 2, 2]], [1, 0, -1]], expected: true },
      { input: [3, [[0, 1, 1], [1, 2, 1]], [2, 0, -2]], expected: false },
      { input: [2, [[0, 1, 5]], [1, -1]], expected: true },
      { input: [2, [], [1, -1]], expected: false },
    ],
    hint: "Demand feasibility is max flow with a super source and a super sink.",
  },
  {
    id: "graph-216",
    title: "Planarity Edge Bound Check",
    category: "Graph Algorithms",
    difficulty: "Medium",
    description:
      "Check the basic necessary density condition for planarity of a simple graph: E <= 3V - 6 when V is at least 3.\n\nA graph violating this bound cannot be planar, while passing it does not guarantee planarity. n is the number of nodes and edges is a list of [u, v] pairs. Return a boolean.",
    starterCode: `def planarity_edge_bound(n, edges):
    # Your code here
    pass`,
    solution: `def planarity_edge_bound(n, edges):
    if n < 3:
        return True
    return len(edges) <= 3 * n - 6`,
    testCases: [
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: true },
      { input: [5, [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]], expected: false },
      { input: [2, [[0, 1]]], expected: true },
      { input: [6, [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]]], expected: true },
    ],
    hint: "K5 needs 10 edges while the planar bound allows only 9.",
  },
  {
    id: "graph-217",
    title: "Tree Edit Distance Small",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the ordered tree edit distance with unit costs for insertion, deletion, and renaming.\n\nA tree is represented as [label, [children]] recursively, and None is the empty tree. Match child sequences with dynamic programming: skip a child subtree at the cost of its size, or recursively align two children. Return the total cost, an integer.",
    starterCode: `def tree_edit_distance(a, b):
    # Your code here
    pass`,
    solution: `def tree_edit_distance(a, b):
    def size(t):
        if t is None:
            return 0
        return 1 + sum(size(c) for c in t[1])

    if a is None:
        return size(b)
    if b is None:
        return size(a)
    rename = 0 if a[0] == b[0] else 1
    children_a = a[1]
    children_b = b[1]
    la = len(children_a)
    lb = len(children_b)
    dp = [[0] * (lb + 1) for _ in range(la + 1)]
    for i in range(1, la + 1):
        dp[i][0] = dp[i - 1][0] + size(children_a[i - 1])
    for j in range(1, lb + 1):
        dp[0][j] = dp[0][j - 1] + size(children_b[j - 1])
    for i in range(1, la + 1):
        for j in range(1, lb + 1):
            dp[i][j] = min(
                dp[i - 1][j] + size(children_a[i - 1]),
                dp[i][j - 1] + size(children_b[j - 1]),
                dp[i - 1][j - 1] + tree_edit_distance(children_a[i - 1], children_b[j - 1]),
            )
    return rename + dp[la][lb]`,
    testCases: [
      { input: [[1, [[2, []]]], [1, [[2, []]]]], expected: 0 },
      { input: [[1, [[2, []]]], [1, [[3, []]]]], expected: 1 },
      { input: [[1, [[2, []], [3, []]]], [1, [[2, []]]]], expected: 1 },
      { input: [[1, []], null], expected: 1 },
    ],
    hint: "Subtree deletion costs the number of nodes being removed.",
  },
  {
    id: "graph-218",
    title: "Spectral Embedding First Two Eigenvectors",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the first two Laplacian eigenvectors of an undirected graph, forming a spectral embedding of its nodes.\n\nDiagonalize the Laplacian with Jacobi rotations, order the eigenvalues, and return an n by 2 matrix whose columns are the eigenvectors of the two smallest eigenvalues. Each column is sign-normalized so its first nonzero entry is positive. edges is a list of [u, v] pairs.",
    starterCode: `import math
def spectral_embedding(n, edges):
    # Your code here
    pass`,
    solution: `import math
def spectral_embedding(n, edges):
    A = [[0.0] * n for _ in range(n)]
    for u, v in edges:
        A[u][v] += 1
        A[v][u] += 1
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            L[i][j] = sum(A[i]) if i == j else -A[i][j]
    V = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    for _ in range(300):
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
        tt = (1.0 if theta >= 0 else -1.0) / (abs(theta) + math.sqrt(theta * theta + 1.0))
        c = 1.0 / math.sqrt(tt * tt + 1.0)
        s = tt * c
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
    result = []
    for row in range(n):
        pair = []
        for idx in order[:2]:
            x = V[row][idx]
            if abs(x) < 1e-12:
                x = 0.0
            pair.append(x)
        result.append(pair)
    for col in range(2):
        first = 0.0
        for i in range(n):
            if abs(result[i][col]) > 1e-12:
                first = result[i][col]
                break
        if first < 0:
            for i in range(n):
                result[i][col] = -result[i][col]
    return result`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[0.49999999999999983, 0.6532814824381882], [0.49999999999999983, 0.27059805007309834], [0.5000000000000001, -0.2705980500730985], [0.49999999999999994, -0.6532814824381882]] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [[0.5, 0.0], [0.4999999999999998, 0.7045253021425352], [0.5, -0.7096602923347868], [0.5, 0.005134990192251667]] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [[0.5773502691896258, 0.7071067811865475], [0.5773502691896258, -0.7071067811865475], [0.5773502691896258, 0.0]] },
      { input: [2, [[0, 1]]], expected: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, -0.7071067811865475]] },
    ],
    hint: "The two smallest Laplacian eigenvectors give the classic spectral layout.",
  },
  {
    id: "graph-219",
    title: "Spanning Tree Edge Probability",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the probability that a given edge belongs to a uniformly random spanning tree of a connected undirected graph.\n\nThis probability equals the effective resistance between the edge endpoints when every edge is a unit resistor. Solve the grounded Laplacian system with one unit of current injected at u and extracted at v. edges is a list of [u, v] pairs and edge is the pair to test. Return a float.",
    starterCode: `def spanning_tree_edge_probability(n, edges, edge):
    # Your code here
    pass`,
    solution: `def spanning_tree_edge_probability(n, edges, edge):
    u, v = edge
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
    return x[u] - x[v]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 1]], expected: 0.6666666666666666 },
      { input: [3, [[0, 1], [1, 2]], [0, 1]], expected: 1.0 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], [0, 1]], expected: 0.75 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], [0, 1]], expected: 0.5 },
    ],
    hint: "Uniform spanning trees connect probability of inclusion to electrical resistance.",
  },
  {
    id: "graph-220",
    title: "Vertex-Disjoint Paths Count (Menger)",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the maximum number of internally vertex-disjoint paths between s and t in an undirected graph.\n\nBy Menger's theorem this equals the minimum vertex cut size. Split each internal node into an in and out copy with capacity 1, make every graph edge infinite, and run max flow from s to t. Return the flow value.",
    starterCode: `def max_vertex_disjoint_paths(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def max_vertex_disjoint_paths(n, edges, s, t):
    N = 2 * n
    cap = [[0] * N for _ in range(N)]
    INF = len(edges) + 1
    for v in range(n):
        if v == s or v == t:
            cap[2 * v][2 * v + 1] = INF
        else:
            cap[2 * v][2 * v + 1] = 1
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
      { input: [4, [[0, 1], [1, 3], [0, 2], [2, 3]], 0, 3], expected: 2 },
      { input: [3, [[0, 1], [1, 2]], 0, 2], expected: 1 },
      { input: [5, [[0, 1], [1, 4], [0, 2], [2, 3], [3, 4], [1, 2]], 0, 4], expected: 2 },
      { input: [4, [[0, 1], [2, 3]], 0, 3], expected: 0 },
    ],
    hint: "Node splitting turns a vertex cut problem into an edge cut problem.",
  },
  {
    id: "graph-221",
    title: "Edge-Disjoint Paths Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the maximum number of edge-disjoint paths between s and t in an undirected graph.\n\nBy Menger's theorem this equals the minimum edge cut size. Give every edge unit capacity and run max flow from s to t. edges is a list of [u, v] pairs. Return the flow value.",
    starterCode: `def max_edge_disjoint_paths(n, edges, s, t):
    # Your code here
    pass`,
    solution: `def max_edge_disjoint_paths(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    for u, v in edges:
        cap[u][v] += 1
        cap[v][u] += 1
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
      { input: [4, [[0, 1], [1, 3], [0, 2], [2, 3]], 0, 3], expected: 2 },
      { input: [3, [[0, 1], [1, 2], [0, 2]], 0, 2], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3]], 0, 3], expected: 1 },
    ],
    hint: "Unit edge capacities make max flow equal the edge connectivity between s and t.",
  },
  {
    id: "graph-222",
    title: "Block-Cut Tree Size",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the size of the block-cut tree of an undirected graph with n nodes.\n\nRun a DFS that tracks discovery and low-link values, pushing tree edges on a stack and popping a block whenever low[child] >= disc[parent]; nodes that start blocks are articulation points. Return [block_count, articulation_count, total_nodes] where total_nodes is blocks plus articulation points.",
    starterCode: `def block_cut_tree_size(n, edges):
    # Your code here
    pass`,
    solution: `def block_cut_tree_size(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    stack = []
    blocks = [0]
    articulation = set()

    def dfs(v, parent):
        disc[v] = timer[0]
        low[v] = timer[0]
        timer[0] += 1
        children = 0
        for w in adj[v]:
            if disc[w] == -1:
                stack.append((v, w))
                children += 1
                dfs(w, v)
                low[v] = min(low[v], low[w])
                if low[w] >= disc[v]:
                    if parent != -1:
                        articulation.add(v)
                    blocks[0] += 1
                    while True:
                        e = stack.pop()
                        if e == (v, w):
                            break
            elif w != parent and disc[w] < disc[v]:
                stack.append((v, w))
                low[v] = min(low[v], disc[w])
        if parent == -1 and children > 1:
            articulation.add(v)

    for v in range(n):
        if disc[v] == -1:
            dfs(v, -1)
    return [blocks[0], len(articulation), blocks[0] + len(articulation)]`,
    testCases: [
      { input: [3, [[0, 1], [1, 2]]], expected: [2, 1, 3] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [1, 0, 1] },
      { input: [4, [[0, 1], [0, 2], [0, 3]]], expected: [3, 1, 4] },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]], expected: [2, 1, 3] },
      { input: [3, []], expected: [0, 0, 0] },
    ],
    hint: "The block-cut tree alternates block nodes and articulation points.",
  },
  {
    id: "graph-223",
    title: "Ear Decomposition Step",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Find one ear to extend a cycle in an undirected graph.\n\nAn ear is a path whose endpoints lie on the given cycle and whose internal nodes lie outside it. Scan the edges in input order for the first edge crossing from the cycle to outside, then DFS through outside nodes until reaching a different cycle node. Return the ear path from one cycle endpoint to the other, or [] when no ear exists. cycle is a list of distinct cycle nodes.",
    starterCode: `def ear_decomposition_step(n, edges, cycle):
    # Your code here
    pass`,
    solution: `def ear_decomposition_step(n, edges, cycle):
    on_cycle = set(cycle)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    for lst in adj:
        lst.sort()
    for u, v in edges:
        if (u in on_cycle) == (v in on_cycle):
            continue
        a, b = (u, v) if u in on_cycle else (v, u)
        parent = {b: a}
        stack = [b]
        while stack:
            x = stack.pop()
            for w in adj[x]:
                if w == parent[x]:
                    continue
                if w in on_cycle:
                    if w != a:
                        path = [w]
                        cur = x
                        while cur != b:
                            path.append(cur)
                            cur = parent[cur]
                        path.append(b)
                        path.append(a)
                        path.reverse()
                        return path
                elif w not in parent:
                    parent[w] = x
                    stack.append(w)
    return []`,
    testCases: [
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], [0, 1, 2]], expected: [2, 3, 0] },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], [0, 1, 2]], expected: [2, 3, 0] },
      { input: [3, [[0, 1], [1, 2], [2, 0]], [0, 1, 2]], expected: [] },
    ],
    hint: "Ear decomposition builds any 2-connected graph from a cycle by adding ears.",
  },
  {
    id: "graph-224",
    title: "Dual Graph Face Count",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Compute the number of faces of a connected plane graph from its edge count and vertex count.\n\nEuler's formula V - E + F = 2 gives F = E - V + 2, where the outer face is included. n is the number of vertices and edges is the edge list of the embedded connected planar graph. Return F as an integer.",
    starterCode: `def dual_graph_face_count(n, edges):
    # Your code here
    pass`,
    solution: `def dual_graph_face_count(n, edges):
    return len(edges) - n + 2`,
    testCases: [
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: 2 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]], expected: 4 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 2 },
    ],
    hint: "Every face of the plane graph becomes a vertex of the dual graph.",
  },
  {
    id: "graph-225",
    title: "Min-Cost Flow Successive Shortest Path One Step",
    category: "Graph Algorithms",
    difficulty: "Hard",
    description:
      "Perform one successive-shortest-path augmentation for min-cost flow from s to t.\n\nStarting from zero flow, run Dijkstra on positive residual capacities using the edge costs, recording parents. Return [path, bottleneck, path_cost] where path is the node list from s to t, bottleneck is the smallest residual capacity along it, and path_cost is the total cost; return [[], 0, 0] when no path exists. edges is a list of [u, v, capacity, cost] tuples with non-negative costs.",
    starterCode: `import heapq
def min_cost_flow_step(n, edges, s, t):
    # Your code here
    pass`,
    solution: `import heapq
def min_cost_flow_step(n, edges, s, t):
    cap = [[0] * n for _ in range(n)]
    cost = [[0] * n for _ in range(n)]
    adj = [[] for _ in range(n)]
    for u, v, c, w in edges:
        cap[u][v] += c
        cost[u][v] = w
        adj[u].append(v)
    dist = [-1] * n
    prev = [-1] * n
    dist[s] = 0
    heap = [(0, s)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue
        for w in adj[v]:
            if cap[v][w] <= 0:
                continue
            nd = d + cost[v][w]
            if dist[w] == -1 or nd < dist[w]:
                dist[w] = nd
                prev[w] = v
                heapq.heappush(heap, (nd, w))
    if dist[t] == -1:
        return [[], 0, 0]
    path = []
    x = t
    while x != s:
        path.append(x)
        x = prev[x]
    path.append(s)
    path.reverse()
    bottleneck = min(cap[path[i]][path[i + 1]] for i in range(len(path) - 1))
    return [path, bottleneck, dist[t]]`,
    testCases: [
      { input: [3, [[0, 1, 2, 1], [1, 2, 2, 3], [0, 2, 1, 5]], 0, 2], expected: [[0, 1, 2], 2, 4] },
      { input: [3, [[0, 1, 1, 2], [1, 2, 1, 1]], 0, 2], expected: [[0, 1, 2], 1, 3] },
      { input: [3, [[0, 1, 1, 1]], 0, 2], expected: [[], 0, 0] },
    ],
    hint: "Successive shortest paths with residual reverse edges solve min-cost flow exactly.",
  },
];
