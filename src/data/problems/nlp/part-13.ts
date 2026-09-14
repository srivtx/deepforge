import type { Problem } from "@/types/problem";

export const problems: Problem[] = [
  {
    id: "nlp-401",
    title: "Smooth Inverse Document Frequency Value",
    category: "NLP",
    difficulty: "Medium",
    description:
      "A smoothed IDF is ln((N + 1) / (df + 1)) + 1, which stays positive for every term.\n\nGiven the number of documents N and the document frequency df, return the smooth IDF.",
    starterCode: `def smooth_inverse_document_frequency_value(n_docs, df):
    # Your code here
    pass`,
    solution: `def smooth_inverse_document_frequency_value(n_docs, df):
    import math
    return math.log((n_docs + 1.0) / (df + 1.0)) + 1.0`,
    testCases: [
      { input: [100, 10], expected: 3.217225244042889 },
      { input: [5, 5], expected: 1.0 },
      { input: [1000, 1], expected: 7.215607598755275 },
    ],
    hint: "The +1 shift keeps rare and common terms comparable.",
  },
  {
    id: "nlp-402",
    title: "TF-IDF Document Vector",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The TF-IDF vector multiplies each term frequency by its inverse document frequency, following the given vocabulary order.\n\nGiven the vocabulary, the document tokens, and an IDF table keyed by term strings, return the vector.",
    starterCode: `def tf_idf_document_vector(vocab, tokens, idf):
    # Your code here
    pass`,
    solution: `def tf_idf_document_vector(vocab, tokens, idf):
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return [counts.get(t, 0) * idf.get(t, 0.0) for t in vocab]`,
    testCases: [
      { input: [["a", "b"], ["a", "a", "b"], {"a": 1.0, "b": 2.0}], expected: [2.0, 2.0] },
      { input: [["x"], ["x"], {"x": 0.5}], expected: [0.5] },
      { input: [["p", "q"], [], {"p": 1.0, "q": 1.0}], expected: [0.0, 0.0] },
    ],
    hint: "Count term frequencies, then scale each by the matching IDF entry.",
  },
  {
    id: "nlp-403",
    title: "BM25 IDF from Document Frequency",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The BM25 IDF is ln(1 + (N - df + 0.5) / (df + 0.5)).\n\nGiven the number of documents and the document frequency, return the IDF.",
    starterCode: `def bm25_idf_from_document_frequency(n_docs, df):
    # Your code here
    pass`,
    solution: `def bm25_idf_from_document_frequency(n_docs, df):
    import math
    return math.log(1.0 + (n_docs - df + 0.5) / (df + 0.5))`,
    testCases: [
      { input: [100, 10], expected: 2.2637452596777816 },
      { input: [10, 5], expected: 0.6931471805599453 },
      { input: [1000, 1], expected: 6.503289671207057 },
    ],
    hint: "The inner 1 + keeps the weight nonnegative.",
  },
  {
    id: "nlp-404",
    title: "BM25 Term Score Contribution",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The BM25 contribution of one query term is idf * tf (k1 + 1) / (tf + k1 (1 - b + b * dl / avgdl)).\n\nGiven the term frequency, document length, average document length, IDF, k1, and b, return the contribution.",
    starterCode: `def bm25_term_score_contribution(tf, doc_length, avgdoc_length, idf, k1, b):
    # Your code here
    pass`,
    solution: `def bm25_term_score_contribution(tf, doc_length, avgdoc_length, idf, k1, b):
    return idf * tf * (k1 + 1.0) / (tf + k1 * (1.0 - b + b * doc_length / avgdoc_length))`,
    testCases: [
      { input: [3, 50, 40, 2.0, 1.2, 0.75], expected: 2.9830508474576276 },
      { input: [1, 100, 50, 1.0, 1.2, 0.75], expected: 0.7096774193548387 },
      { input: [5, 10, 10, 3.0, 1.5, 0.5], expected: 5.769230769230769 },
    ],
    hint: "Length normalization uses the ratio of document length to the average.",
  },
  {
    id: "nlp-405",
    title: "Query Term Coverage",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Coverage is the fraction of distinct query terms that appear in a document: |Q intersect D| / |Q|, with 1.0 for an empty query.\n\nGiven the query and document tokens, return the coverage.",
    starterCode: `def query_term_coverage(query, document_tokens):
    # Your code here
    pass`,
    solution: `def query_term_coverage(query, document_tokens):
    q = set(query)
    if not q:
        return 1.0
    return len(q & set(document_tokens)) / len(q)`,
    testCases: [
      { input: [["a", "b"], ["a", "c"]], expected: 0.5 },
      { input: [["x"], ["x"]], expected: 1.0 },
      { input: [[], ["anything"]], expected: 1.0 },
    ],
    hint: "Use distinct query terms in the denominator.",
  },
  {
    id: "nlp-406",
    title: "Retrieval Precision at K",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Precision at k is the number of relevant documents among the top k divided by k. Return 0.0 when k <= 0.\n\nGiven the ranked retrieved ids, the set of relevant ids, and k, return precision at k.",
    starterCode: `def retrieval_precision_at_k(retrieved, relevant, k):
    # Your code here
    pass`,
    solution: `def retrieval_precision_at_k(retrieved, relevant, k):
    if k <= 0:
        return 0.0
    relevant_set = set(relevant)
    hits = sum(1 for doc in retrieved[:k] if doc in relevant_set)
    return hits / k`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c"], 2], expected: 0.5 },
      { input: [["x"], ["y"], 1], expected: 0.0 },
      { input: [["a", "b"], ["b"], 2], expected: 0.5 },
    ],
    hint: "Denominator is k even when fewer than k documents were retrieved.",
  },
  {
    id: "nlp-407",
    title: "Retrieval Recall at K",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Recall at k is the number of relevant documents found in the top k divided by the total number of relevant documents; return 0.0 when there are none.\n\nGiven the ranked ids, the relevant set, and k, return recall at k.",
    starterCode: `def retrieval_recall_at_k(retrieved, relevant, k):
    # Your code here
    pass`,
    solution: `def retrieval_recall_at_k(retrieved, relevant, k):
    if not relevant:
        return 0.0
    relevant_set = set(relevant)
    hits = sum(1 for doc in retrieved[:k] if doc in relevant_set)
    return hits / len(relevant_set)`,
    testCases: [
      { input: [["a", "b", "c"], ["a", "c"], 2], expected: 0.5 },
      { input: [["x"], ["y"], 1], expected: 0.0 },
      { input: [["a", "b"], ["a", "b"], 5], expected: 1.0 },
    ],
    hint: "Divide by the number of relevant documents, not by k.",
  },
  {
    id: "nlp-408",
    title: "Mean Reciprocal Rank from Ranks",
    category: "NLP",
    difficulty: "Medium",
    description:
      "For each query, the reciprocal rank is 1 / rank of the first relevant result, or 0 when nothing relevant was found. The mean reciprocal rank averages these values.\n\nGiven the per-query ranks (0 meaning none), return the mean reciprocal rank.",
    starterCode: `def mean_reciprocal_rank_from_ranks(ranks):
    # Your code here
    pass`,
    solution: `def mean_reciprocal_rank_from_ranks(ranks):
    return sum((1.0 / r if r > 0 else 0.0) for r in ranks) / len(ranks)`,
    testCases: [
      { input: [[1, 2, 0]], expected: 0.5 },
      { input: [[2, 4]], expected: 0.375 },
      { input: [[1, 1, 1]], expected: 1.0 },
    ],
    hint: "Only the first hit per query contributes.",
  },
  {
    id: "nlp-409",
    title: "NDCG at K from Relevances",
    category: "NLP",
    difficulty: "Hard",
    description:
      "DCG at k is sum_{i=1}^{k} rel_i / log2(i + 1), and IDCG sorts the relevances descending before applying the same formula. Return DCG / IDCG, or 0.0 when IDCG is zero.\n\nGiven the relevance list and k, return nDCG at k.",
    starterCode: `def ndcg_at_k_from_relevances(relevances, k):
    # Your code here
    pass`,
    solution: `def ndcg_at_k_from_relevances(relevances, k):
    import math
    def dcg(values):
        return sum(v / math.log2(i + 2.0) for i, v in enumerate(values[:k]))
    ideal = dcg(sorted(relevances, reverse=True))
    if ideal == 0.0:
        return 0.0
    return dcg(relevances) / ideal`,
    testCases: [
      { input: [[3, 2, 1], 3], expected: 1.0 },
      { input: [[0, 0], 2], expected: 0.0 },
      { input: [[1, 0, 2], 2], expected: 0.38009376671593426 },
    ],
    hint: "The ideal DCG uses the best possible ordering of the same relevances.",
  },
  {
    id: "nlp-410",
    title: "Average Precision at K",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Average precision at k averages the precision at each rank where a relevant document appears, dividing the sum by the total number of relevant documents.\n\nGiven the binary relevance flags in ranked order and the total number of relevant documents, return average precision at k.",
    starterCode: `def average_precision_at_k(relevance_flags, total_relevant, k):
    # Your code here
    pass`,
    solution: `def average_precision_at_k(relevance_flags, total_relevant, k):
    if total_relevant == 0:
        return 0.0
    hits = 0
    total = 0.0
    for i, flag in enumerate(relevance_flags[:k], start=1):
        if flag:
            hits += 1
            total += hits / i
    return total / total_relevant`,
    testCases: [
      { input: [[1, 0, 1], 2, 3], expected: 0.8333333333333333 },
      { input: [[0, 0], 2, 2], expected: 0.0 },
      { input: [[1, 1], 2, 2], expected: 1.0 },
    ],
    hint: "Precision is recomputed at every hit position.",
  },
  {
    id: "nlp-411",
    title: "Hit Rate at K",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Hit rate at k is one when at least one relevant document appears in the top k and zero otherwise.\n\nGiven the ranked ids, the relevant set, and k, return the hit rate as a boolean.",
    starterCode: `def hit_rate_at_k(retrieved, relevant, k):
    # Your code here
    pass`,
    solution: `def hit_rate_at_k(retrieved, relevant, k):
    relevant_set = set(relevant)
    return any(doc in relevant_set for doc in retrieved[:k])`,
    testCases: [
      { input: [["a", "b"], ["b"], 2], expected: true },
      { input: [["x"], ["y"], 1], expected: false },
      { input: [["a"], ["a"], 0], expected: false },
    ],
    hint: "Only the first k documents are inspected.",
  },
  {
    id: "nlp-412",
    title: "Reciprocal Rank Fusion Score",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Reciprocal rank fusion contributes 1 / (k + rank) for a document at the given rank, where rank starts at one and k is the smoothing constant.\n\nGiven the rank and k, return the contribution.",
    starterCode: `def reciprocal_rank_fusion_score(rank, k):
    # Your code here
    pass`,
    solution: `def reciprocal_rank_fusion_score(rank, k):
    return 1.0 / (k + rank)`,
    testCases: [
      { input: [1, 60], expected: 0.01639344262295082 },
      { input: [10, 60], expected: 0.014285714285714285 },
      { input: [3, 0], expected: 0.3333333333333333 },
    ],
    hint: "The constant damps the influence of very high ranks.",
  },
  {
    id: "nlp-413",
    title: "BM25 Multi Term Score",
    category: "NLP",
    difficulty: "Hard",
    description:
      "The full BM25 score sums over query terms: idf(t) * tf(t) (k1 + 1) / (tf(t) + k1 (1 - b + b dl / avgdl)), with idf(t) = ln(1 + (N - df(t) + 0.5) / (df(t) + 0.5)).\n\nGiven the query term frequencies, the document frequencies, N, the document length, the average length, k1, and b, return the score.",
    starterCode: `def bm25_multi_term_score(query_tfs, document_frequencies, n_docs, doc_length, avgdoc_length, k1, b):
    # Your code here
    pass`,
    solution: `def bm25_multi_term_score(query_tfs, document_frequencies, n_docs, doc_length, avgdoc_length, k1, b):
    import math
    total = 0.0
    for tf, df in zip(query_tfs, document_frequencies):
        idf = math.log(1.0 + (n_docs - df + 0.5) / (df + 0.5))
        total += idf * tf * (k1 + 1.0) / (tf + k1 * (1.0 - b + b * doc_length / avgdoc_length))
    return total`,
    testCases: [
      { input: [[2, 1], [10, 20], 100, 50, 40, 1.2, 0.75], expected: 4.354903273150793 },
      { input: [[1], [5], 10, 100, 100, 1.5, 0.5], expected: 0.6931471805599453 },
      { input: [[3, 3], [2, 2], 50, 30, 60, 1.0, 0.25], expected: 9.338430660697304 },
    ],
    hint: "Compute each term contribution with its own IDF and sum.",
  },
  {
    id: "nlp-414",
    title: "TF-IDF Dot Product Ranking",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Rank documents by the dot product of their TF-IDF vectors with the query vector, returning the index of the highest scoring document (earliest on ties).\n\nGiven the query vector and the list of document vectors, return the best index.",
    starterCode: `def tf_idf_dot_product_ranking(query_vector, doc_vectors):
    # Your code here
    pass`,
    solution: `def tf_idf_dot_product_ranking(query_vector, doc_vectors):
    best = 0
    best_score = None
    for i, doc in enumerate(doc_vectors):
        score = sum(q * d for q, d in zip(query_vector, doc))
        if best_score is None or score > best_score:
            best_score = score
            best = i
    return best`,
    testCases: [
      { input: [[1, 2], [[1, 1], [0, 3]]], expected: 1 },
      { input: [[1, 0], [[0, 5], [1, 0]]], expected: 1 },
      { input: [[0, 0], [[1, 1], [2, 2]]], expected: 0 },
    ],
    hint: "Plain dot product, no normalization.",
  },
  {
    id: "nlp-415",
    title: "Document Frequency Count",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Document frequency counts how many documents contain a term at least once.\n\nGiven the list of documents (each a token list) and the term, return the document frequency.",
    starterCode: `def document_frequency_count(documents, term):
    # Your code here
    pass`,
    solution: `def document_frequency_count(documents, term):
    return sum(1 for doc in documents if term in doc)`,
    testCases: [
      { input: [[["a", "b"], ["b", "c"]], "b"], expected: 2 },
      { input: [[["x"], ["y"]], "z"], expected: 0 },
      { input: [[["a", "a"], ["a"]], "a"], expected: 2 },
    ],
    hint: "Count documents, not occurrences.",
  },
  {
    id: "nlp-416",
    title: "Collection Term Frequency",
    category: "NLP",
    difficulty: "Medium",
    description:
      "Collection term frequency is the total number of occurrences of a term across all documents.\n\nGiven the documents (each a token list) and the term, return the total count.",
    starterCode: `def collection_term_frequency(documents, term):
    # Your code here
    pass`,
    solution: `def collection_term_frequency(documents, term):
    return sum(doc.count(term) for doc in documents)`,
    testCases: [
      { input: [[["a", "a"], ["a"]], "a"], expected: 3 },
      { input: [[["x"], ["y"]], "z"], expected: 0 },
      { input: [[["b", "b", "b"]], "b"], expected: 3 },
    ],
    hint: "Sum per-document counts.",
  },
  {
    id: "nlp-417",
    title: "Shingle Jaccard Duplicate Check",
    category: "NLP",
    difficulty: "Easy",
    description:
      "Two documents are near-duplicates when the Jaccard similarity of their shingle sets reaches the threshold.\n\nGiven two shingle sets and the threshold, return True when the Jaccard similarity is at least the threshold; treat two empty sets as similarity 1.0.",
    starterCode: `def shingle_jaccard_duplicate_check(shingles_a, shingles_b, threshold):
    # Your code here
    pass`,
    solution: `def shingle_jaccard_duplicate_check(shingles_a, shingles_b, threshold):
    a = set(shingles_a)
    b = set(shingles_b)
    union = a | b
    similarity = 1.0 if not union else len(a & b) / len(union)
    return similarity >= threshold`,
    testCases: [
      { input: [["ab", "bc"], ["bc", "cd"], 0.3], expected: true },
      { input: [["p"], ["q"], 0.5], expected: false },
      { input: [["x", "y"], ["y", "z"], 0.6], expected: false },
    ],
    hint: "Compare the Jaccard similarity against the threshold.",
  },
  {
    id: "nlp-418",
    title: "MinHash Signature Minimum",
    category: "NLP",
    difficulty: "Hard",
    description:
      "For each permutation (a, b, m), the MinHash signature value is min over shingle hashes h of (a * h + b) mod m.\n\nGiven the shingle hash values and the list of [a, b, m] permutations, return the signature list in permutation order.",
    starterCode: `def minhash_signature_min(shingle_hashes, permutations):
    # Your code here
    pass`,
    solution: `def minhash_signature_min(shingle_hashes, permutations):
    signature = []
    for a, b, m in permutations:
        signature.append(min((a * h + b) % m for h in shingle_hashes))
    return signature`,
    testCases: [
      { input: [[1, 2, 3], [[1, 0, 7], [2, 1, 7]]], expected: [1, 0] },
      { input: [[5], [[3, 2, 11], [5, 4, 13]]], expected: [6, 3] },
      { input: [[10, 20], [[1, 1, 13]]], expected: [8] },
    ],
    hint: "Apply the affine hash under the modulus first, then take the minimum.",
  },
  {
    id: "nlp-419",
    title: "LSH Band Bucket Keys",
    category: "NLP",
    difficulty: "Easy",
    description:
      "In banded LSH, a signature is split into consecutive bands; candidates collide when a band key matches. Build the per-band keys by joining the signature values in each band with hyphens, using zeros to pad the final partial band.\n\nGiven the signature and the band size, return the list of band key strings.",
    starterCode: `def lsh_band_bucket_keys(signature, band_size):
    # Your code here
    pass`,
    solution: `def lsh_band_bucket_keys(signature, band_size):
    keys = []
    for start in range(0, len(signature), band_size):
        band = signature[start:start + band_size]
        if len(band) < band_size:
            band = band + [0] * (band_size - len(band))
        keys.append("-".join(str(v) for v in band))
    return keys`,
    testCases: [
      { input: [[1, 2, 3, 4], 2], expected: ["1-2", "3-4"] },
      { input: [[5, 6, 7], 2], expected: ["5-6", "7-0"] },
      { input: [[9], 1], expected: ["9"] },
    ],
    hint: "Chunk the signature from left to right and pad the last chunk.",
  },
  {
    id: "nlp-420",
    title: "Rocchio Query Update Vector",
    category: "NLP",
    difficulty: "Medium",
    description:
      "The Rocchio update moves the query toward relevant document centroids and away from nonrelevant ones: alpha q + beta rel - gamma nonrel.\n\nGiven the query vector, the relevant centroid, the nonrelevant centroid, and the weights, return the updated query.",
    starterCode: `def rocchio_query_update_vector(query, relevant_centroid, nonrelevant_centroid, alpha, beta, gamma):
    # Your code here
    pass`,
    solution: `def rocchio_query_update_vector(query, relevant_centroid, nonrelevant_centroid, alpha, beta, gamma):
    return [alpha * q + beta * r - gamma * n for q, r, n in zip(query, relevant_centroid, nonrelevant_centroid)]`,
    testCases: [
      { input: [[1, 0], [1, 1], [0, 0], 1.0, 0.5, 0.25], expected: [1.5, 0.5] },
      { input: [[0, 1], [0, 0], [1, 0], 1.0, 0.8, 0.2], expected: [-0.2, 1.0] },
      { input: [[1, 1], [1, 1], [1, 1], 1.0, 1.0, 1.0], expected: [1.0, 1.0] },
    ],
    hint: "Combine the three weighted vectors coordinatewise.",
  },
];
