import type { LearningPath } from "@/types/problem";

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "math-foundations",
    title: "Math Foundations",
    description:
      "Build the linear algebra, statistics, probability, and calculus intuition every ML algorithm assumes. You start with vectors and matrix products and finish by computing Jacobians and Hessians by hand. This is the path to take if you want the math to stop feeling like magic.",
    problemIds: [
      "la-011", "la-012", "la-004", "la-001", "la-002", "la-006",
      "la-008", "st-001", "st-002", "pr-002", "ca-001",
      "la-025", "la-009", "la-083", "st-004", "st-025", "pr-005", "pr-001", "ca-002",
      "la-049", "st-042", "pr-048", "ca-004", "ca-005",
    ],
    estimatedHours: 10,
  },
  {
    id: "ml-from-scratch",
    title: "ML From Scratch",
    description:
      "Implement the classic machine learning toolkit with nothing but Python lists and loops. You will build regression, k-NN, k-means, decision trees, naive Bayes, PCA, and boosting, plus the metrics that tell you whether they work. Ideal for anyone who has called fit() and predict() but never written them.",
    problemIds: [
      "ml-008", "ml-017", "ml-023", "ml-026", "ml-029", "ml-006", "ml-007", "ml-002",
      "ml-001", "ml-004", "ml-009", "ml-010", "ml-032", "ml-034",
      "ml-003", "ml-005", "ml-013", "ml-035", "ml-038", "ml-042", "ml-043", "ml-045", "ml-137", "ml-220",
    ],
    estimatedHours: 12,
  },
  {
    id: "deep-learning-essentials",
    title: "Deep Learning Essentials",
    description:
      "Activations, forward passes, and backprop, built one function at a time. You will go from ReLU and dense layers up through batch norm, attention, and a full transformer encoder block, with a little tokenization to feed the models. Perfect before you touch a framework, because you will recognize what every layer is doing.",
    problemIds: [
      "dl-001", "dl-002", "dl-008", "dl-010", "dl-012", "dl-016", "dl-018", "nlp-001", "nlp-002",
      "dl-003", "dl-004", "dl-022", "dl-025", "dl-027", "dl-034", "dl-035", "dl-036", "nlp-003", "nlp-020",
      "dl-005", "dl-043", "dl-045", "dl-087",
    ],
    estimatedHours: 10,
  },
  {
    id: "optimization-mastery",
    title: "Optimization Mastery",
    description:
      "How models actually learn: gradients, momentum, adaptive methods, and the schedules that decide whether training converges. You will implement gradient descent, Adam, and learning rate policies, then reach the quasi-Newton methods used in serious solvers. Take it after ML From Scratch or Deep Learning Essentials.",
    problemIds: [
      "op-005", "op-014", "op-016", "op-019", "op-021", "op-024",
      "op-001", "op-003", "op-006", "op-007", "op-010", "op-011", "op-015", "op-022", "op-054", "op-060", "op-062",
      "op-002", "op-004", "op-012", "op-041", "op-042", "op-055",
    ],
    estimatedHours: 9,
  },
  {
    id: "linear-algebra-deep-dive",
    title: "Linear Algebra Deep Dive",
    description:
      "A complete tour of the matrix machinery behind ML, from dot products to spectral decompositions. You will implement row reduction, LU, Cholesky, Gram-Schmidt, power iteration, and PageRank steps from scratch. Suited to learners who want to reason about rank, conditioning, and eigenvalues fluently.",
    problemIds: [
      "la-011", "la-012", "la-004", "la-001", "la-002", "la-006", "la-008", "la-016",
      "la-025", "la-027", "la-028", "la-038", "la-040", "la-083", "la-084", "la-117",
      "la-047", "la-048", "la-049", "la-050", "la-137", "la-139", "la-178",
    ],
    estimatedHours: 10,
  },
  {
    id: "calculus-for-ml",
    title: "Calculus for ML",
    description:
      "Derivatives, gradients, Jacobians, and Hessians, all computed numerically so you can verify any formula by hand. You will build finite differences, Newton and RK methods, Lagrange multipliers, and convolution integrals. Designed for learners who want optimization and backprop to rest on real calculus rather than hand-waving.",
    problemIds: [
      "ca-001", "ca-006", "ca-003", "ca-009", "ca-010", "ca-015",
      "ca-002", "ca-022", "ca-023", "ca-025", "ca-026", "ca-031", "ca-067", "ca-068", "ca-073",
      "ca-004", "ca-005", "ca-042", "ca-046", "ca-090", "ca-093",
    ],
    estimatedHours: 9,
  },
  {
    id: "probability-foundations",
    title: "Probability Foundations",
    description:
      "The language of uncertainty, from counting and expectation to Markov chains and concentration bounds. You will implement Bayes rule, classic distributions, inclusion-exclusion, gambler's ruin, and a CLT simulation. A good fit for interviews and for anyone starting probabilistic ML.",
    problemIds: [
      "pr-002", "pr-003", "pr-004", "pr-006", "pr-008", "pr-009", "pr-010", "pr-012", "pr-017",
      "pr-001", "pr-005", "pr-022", "pr-024", "pr-025", "pr-028", "pr-031", "pr-036", "pr-038",
      "pr-042", "pr-044", "pr-045", "pr-047", "pr-050", "pr-089",
    ],
    estimatedHours: 10,
  },
  {
    id: "statistics-mastery",
    title: "Statistics Mastery",
    description:
      "Turn data into decisions: descriptive statistics, sampling distributions, hypothesis tests, and robust methods. You will implement t-tests, ANOVA, bootstrap intervals, rank correlations, and multiple-comparison corrections. Best for aspiring data scientists and analysts who need to defend their conclusions.",
    problemIds: [
      "st-001", "st-002", "st-006", "st-007", "st-010", "st-018", "st-019", "st-020",
      "st-003", "st-004", "st-022", "st-023", "st-024", "st-025", "st-028", "st-029", "st-037", "st-077", "st-082",
      "st-042", "st-044", "st-045", "st-047", "st-048", "st-090",
    ],
    estimatedHours: 11,
  },
  {
    id: "nlp-starter",
    title: "NLP Starter",
    description:
      "Text into numbers, from tokenization and n-grams to TF-IDF, edit distance, and attention. You will build the preprocessing pipeline behind search engines and language models with plain Python. Start here if you want to understand what happens before a model sees a sentence.",
    problemIds: [
      "nlp-001", "nlp-002", "nlp-004", "nlp-006", "nlp-009", "nlp-014", "nlp-015", "nlp-017",
      "nlp-003", "nlp-005", "nlp-007", "nlp-019", "nlp-020", "nlp-025", "nlp-027", "nlp-031", "nlp-035", "nlp-036", "nlp-059",
      "nlp-021", "nlp-022", "nlp-029", "nlp-040", "nlp-050", "nlp-061",
    ],
    estimatedHours: 10,
  },
  {
    id: "computer-vision-starter",
    title: "Computer Vision Starter",
    description:
      "Images as grids of numbers, then as features a model can use. You will implement grayscale conversion, padding, convolution, pooling, Gaussian blur, edge detection, and Otsu thresholding from scratch. A hands-on introduction for anyone curious how CNNs see.",
    problemIds: [
      "cv-001", "cv-004", "cv-005", "cv-006", "cv-010", "cv-011", "cv-012", "cv-014",
      "cv-015", "cv-017", "cv-019", "cv-020", "cv-021", "cv-025", "cv-026", "cv-028", "cv-031", "cv-032",
      "cv-033", "cv-034", "cv-035", "cv-036", "cv-037", "cv-039", "cv-040",
    ],
    estimatedHours: 11,
  },
  {
    id: "algorithms-interview-grind",
    title: "Algorithms Interview Grind",
    description:
      "The highest-yield coding interview patterns in one sequence: two pointers, sliding windows, dynamic programming, heaps, and graph search. You will solve the canonical problems that show up in FAANG screens, implemented in pure Python. Built for interview season, not for casual browsing.",
    problemIds: [
      "al-001", "al-002", "al-003", "al-011", "al-041", "al-043", "al-044", "al-053",
      "al-017", "al-024", "al-025", "al-026", "al-027", "al-055", "al-057", "al-062", "al-098", "al-100",
      "al-035", "al-037", "al-073", "al-074", "al-117", "al-125", "al-163",
    ],
    estimatedHours: 15,
  },
  {
    id: "data-structures-core",
    title: "Data Structures Core",
    description:
      "The containers that make algorithms fast, implemented by hand. You will build stacks, queues, linked lists, heaps, tries, BSTs, union-find, and caches, then wire them into classic problems. Essential for interviews and for anyone who wants to know what a library really does.",
    problemIds: [
      "ds-001", "ds-002", "ds-008", "ds-009", "ds-010", "ds-014", "ds-015", "ds-018",
      "ds-003", "ds-005", "ds-019", "ds-021", "ds-023", "ds-025", "ds-028", "ds-030", "ds-033", "ds-034", "ds-040",
      "ds-004", "ds-020", "ds-024", "ds-032", "ds-036", "ds-038",
    ],
    estimatedHours: 14,
  },
  {
    id: "reinforcement-learning-intro",
    title: "Reinforcement Learning Intro",
    description:
      "Agents that learn by acting: MDPs, value iteration, Q-learning, and policy gradients. You will begin with policy evaluation and bandits, then implement TD updates, SARSA, and REINFORCE from scratch. A gentle on-ramp before tackling deep RL.",
    problemIds: [
      "rl-001", "rl-004", "rl-008", "rl-010", "rl-012", "rl-025", "rl-026", "rl-028",
      "rl-002", "rl-005", "rl-007", "rl-013", "rl-014", "rl-016", "rl-017", "rl-019", "rl-020", "rl-021", "rl-029",
      "rl-003", "rl-006", "rl-009", "rl-015", "rl-018", "rl-040",
    ],
    estimatedHours: 12,
  },
  {
    id: "time-series-forecasting",
    title: "Time Series Forecasting",
    description:
      "Data that moves through time, modeled from first principles. You will build differencing, smoothing, autocorrelation, AR/MA simulation, Holt-Winters, and Yule-Walker solvers without a single library. Suited to analysts and ML engineers working with metrics, demand, or finance.",
    problemIds: [
      "ts-001", "ts-002", "ts-005", "ts-006", "ts-007", "ts-011", "ts-012", "ts-016",
      "ts-017", "ts-021", "ts-022", "ts-024", "ts-025", "ts-028", "ts-029", "ts-032", "ts-033", "ts-034",
      "ts-037", "ts-038", "ts-040", "ts-041", "ts-043", "ts-082", "ts-083",
    ],
    estimatedHours: 12,
  },
  {
    id: "graph-algorithms",
    title: "Graph Algorithms",
    description:
      "Networks traversed properly: BFS, DFS, shortest paths, MSTs, PageRank, and max flow. You will implement Dijkstra, Kruskal, Tarjan-style components, centrality measures, and matching from scratch. Great preparation for both interviews and data-centric engineering work.",
    problemIds: [
      "graph-001", "graph-002", "graph-003", "graph-004", "graph-005", "graph-008", "graph-009", "graph-011",
      "graph-017", "graph-019", "graph-020", "graph-021", "graph-024", "graph-025", "graph-027", "graph-029", "graph-033", "graph-057", "graph-058",
      "graph-037", "graph-039", "graph-040", "graph-041", "graph-060", "graph-127",
    ],
    estimatedHours: 12,
  },
  {
    id: "information-theory",
    title: "Information Theory",
    description:
      "How much does a message tell you? Build entropy, KL divergence, mutual information, channel capacity, and source coding from scratch. You will finish with Huffman codes, rate-distortion, and privacy mechanisms that show up across modern ML. Perfect for the mathematically curious.",
    problemIds: [
      "info-001", "info-002", "info-004", "info-012", "info-017", "info-020", "info-026", "info-033",
      "info-003", "info-006", "info-007", "info-008", "info-009", "info-013", "info-015", "info-016", "info-018", "info-034",
      "info-024", "info-027", "info-032", "info-036", "info-037", "info-040", "info-070",
    ],
    estimatedHours: 11,
  },
  {
    id: "deep-learning-advanced",
    title: "Deep Learning Advanced",
    description:
      "Beyond the basics: modern activations, normalization variants, efficient attention, and quantization. You will implement GELU, group norm, multi-query attention, KV caching, and BPTT by hand, then compute the memory and FLOPs budgets of real models. Take it once you are comfortable with backprop.",
    problemIds: [
      "dl-051", "dl-052", "dl-058", "dl-059", "dl-060", "dl-064", "dl-110", "dl-111",
      "dl-067", "dl-070", "dl-071", "dl-073", "dl-074", "dl-077", "dl-112", "dl-113", "dl-115", "dl-116",
      "dl-132", "dl-135", "dl-136", "dl-140", "dl-179", "dl-180", "dl-183",
    ],
    estimatedHours: 14,
  },
  {
    id: "ml-engineer-track",
    title: "ML Engineer Track",
    description:
      "The production-minded sequence: solid fundamentals, training dynamics, evaluation, and the systems math behind serving models. You will move from standard scalers and loss functions to backprop, class-weighted objectives, and memory accounting. Built for engineers who ship models, not just notebooks.",
    problemIds: [
      "ml-017", "ml-021", "ml-023", "ml-026", "ml-029", "dl-016", "dl-018", "nlp-014",
      "ml-001", "ml-010", "ml-012", "ml-014", "ml-022", "ml-039", "ml-049", "ml-083", "dl-025", "op-010",
      "ml-013", "ml-103", "ml-132", "ml-141", "dl-005", "dl-043", "dl-087",
    ],
    estimatedHours: 15,
  },
  {
    id: "data-scientist-track",
    title: "Data Scientist Track",
    description:
      "From summary statistics to causal inference, the full analyst toolkit. You will compute robust descriptives, run hypothesis tests, build regression and classification pipelines, and finish with uplift and causal estimators. The right path if your job is turning messy data into defensible decisions.",
    problemIds: [
      "st-001", "st-002", "st-006", "st-010", "st-018", "pr-002", "ml-008", "ml-017",
      "st-003", "st-004", "st-022", "st-023", "st-024", "st-029", "st-037", "ml-001", "ml-010", "ml-020",
      "st-042", "st-044", "st-048", "ml-073", "ml-075", "ml-141", "ml-195",
    ],
    estimatedHours: 14,
  },
  {
    id: "quant-interview-track",
    title: "Quant Interview Track",
    description:
      "Probability brainteasers, statistics, and fast algorithms, sequenced the way trading interviews ask them. You will drill counting, Bayes, distributions, gambler's ruin, and sliding-window classics until they are automatic. Timed practice recommended once you finish.",
    problemIds: [
      "pr-003", "pr-004", "pr-006", "pr-008", "pr-010", "pr-012", "al-001", "al-008",
      "pr-001", "pr-005", "pr-022", "pr-029", "pr-030", "pr-031", "pr-038", "st-037", "al-017", "al-023",
      "pr-047", "pr-048", "pr-049", "pr-050", "pr-092", "al-037", "al-214",
    ],
    estimatedHours: 16,
  },
  {
    id: "thirty-day-full-curriculum",
    title: "30-Day Full Curriculum",
    description:
      "A month-long sampler that touches every category on the platform, roughly one sitting per day. You will meet vectors, derivatives, distributions, regressions, neural nets, algorithms, graphs, and information theory in a single sweep. Ideal if you are new and want to discover which track to commit to next.",
    problemIds: [
      "la-011", "la-001", "ca-001", "st-001", "st-002", "pr-002", "ml-008", "ml-017",
      "dl-001", "al-001", "ds-001", "cv-001", "nlp-001", "info-001", "ts-001", "graph-001",
      "ml-001", "dl-003", "la-025", "op-001", "al-017", "st-004",
      "dl-005", "ml-003", "pr-048",
    ],
    estimatedHours: 30,
  },
  {
    id: "fast-track-essentials",
    title: "Fast Track (Essentials)",
    description:
      "The shortest route to a working mental model of ML: twelve problems that cover what the rest of the platform builds on. In a single evening you will implement scaling, matrix products, a derivative, expectation, linear regression, softmax, gradient descent, and one backprop pass. Perfect for a first taste of DeepForge.",
    problemIds: [
      "ml-017", "ml-023", "la-004", "la-001", "ca-001", "pr-002", "st-002",
      "ml-001", "dl-003", "op-001",
      "dl-005", "ml-003",
    ],
    estimatedHours: 4,
  },
  {
    id: "generative-models-primer",
    title: "Generative Models Primer",
    description:
      "How models create images and text: VAEs, GANs, diffusion, and language-model sampling. You will implement reconstruction and KL losses, diffusion noise schedules, classifier-free guidance, and preference-optimization objectives. Best for learners who already know backprop and want the generative frontier.",
    problemIds: [
      "dl-141", "dl-142", "dl-143", "dl-144", "dl-145", "dl-148", "dl-149", "dl-151",
      "dl-157", "dl-158", "dl-159", "dl-160", "dl-161", "dl-163", "dl-164", "dl-165", "dl-166", "dl-167",
      "dl-179", "dl-180", "dl-181", "dl-182", "dl-183", "dl-184",
    ],
    estimatedHours: 12,
  },
  {
    id: "ranking-recommendation-systems",
    title: "Ranking & Recommendation Systems",
    description:
      "Search relevance and recommender systems, built from the retrieval stage to the ranking metrics. You will implement TF-IDF, inverted indexes, BM25, collaborative filtering, and NDCG from scratch. A strong fit for ML engineers working on feeds, search, or personalization.",
    problemIds: [
      "ml-221", "ml-222", "ml-225", "nlp-037", "nlp-038", "graph-098", "graph-100", "graph-097",
      "nlp-003", "nlp-041", "nlp-042", "nlp-059", "ml-102", "ml-224", "ml-219", "graph-085", "graph-027",
      "ml-218", "ml-220", "ml-223", "nlp-040", "nlp-092", "graph-040",
    ],
    estimatedHours: 9,
  },
];
