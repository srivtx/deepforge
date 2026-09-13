import type { LearningPath } from "@/types/problem";

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "math-foundations",
    title: "Math Foundations",
    description:
      "Build the linear algebra, statistics, probability, and calculus intuition every ML algorithm assumes. You start with vectors and matrix products and finish by computing Jacobians and Hessians by hand. This is the path to take if you want the math to stop feeling like magic.",
    estimatedHours: 10,
    slug: "math-foundations",
    level: "Beginner",
    tags: ["linear-algebra", "calculus", "probability", "statistics", "math"],
    goals: [
      "Compute dot products, matrix products, and determinants by hand",
      "Summarize a dataset with mean, variance, correlation, and skewness",
      "Apply Bayes' rule and compute expectations for discrete random variables",
      "Differentiate numerically and build gradients, Jacobians, and Hessians",
    ],
    prerequisites: [],
    problemIds: ["la-011", "la-012", "la-004", "la-006", "la-001", "la-002", "la-008", "st-001", "st-002", "st-004", "st-025", "pr-002", "pr-005", "ca-001", "ca-002", "la-025", "la-009", "la-083", "pr-001", "la-040", "la-049", "st-042", "pr-048", "ca-004", "ca-005"],
    stages: [
      {
        id: "vectors-and-matrices",
        title: "Vectors and Matrices",
        blurb:
          "Vectors and matrix products are the language every model is written in. Start with addition, scaling, dot products, and norms, then build matrix multiplication, transposes, and determinants.",
        problemIds: ["la-011", "la-012", "la-004", "la-006", "la-001", "la-002", "la-008"],
      },
      {
        id: "describing-data",
        title: "Describing Data",
        blurb:
          "Before models, learn to compress a list of numbers into a few meaningful summaries: center, spread, and how two variables move together.",
        problemIds: ["st-001", "st-002", "st-004", "st-025", "pr-002", "pr-005"],
      },
      {
        id: "change-and-uncertainty",
        title: "Change and Uncertainty",
        blurb:
          "Calculus measures how outputs respond to inputs and probability measures how sure we are. This stage pairs numerical differentiation with Bayes' rule, cosine similarity, and 2x2 eigenvalues.",
        problemIds: ["ca-001", "ca-002", "la-025", "la-009", "la-083", "pr-001"],
      },
      {
        id: "toward-ml-mathematics",
        title: "Toward ML Mathematics",
        blurb:
          "The tools behind PCA, regression, and ranking: orthonormalization, eigenpair checks, rank correlation, and the Jacobian and Hessian that power backprop.",
        problemIds: ["la-040", "la-049", "st-042", "pr-048", "ca-004", "ca-005"],
      },
    ],
  },

  {
    id: "ml-from-scratch",
    title: "ML From Scratch",
    description:
      "Implement the classic machine learning toolkit with nothing but Python lists and loops. You will build regression, k-NN, k-means, decision trees, naive Bayes, PCA, and boosting, plus the metrics that tell you whether they work. Ideal for anyone who has called fit() and predict() but never written them.",
    estimatedHours: 12,
    slug: "ml-from-scratch",
    level: "Intermediate",
    tags: ["ml-fundamentals", "supervised-learning", "unsupervised-learning", "metrics"],
    goals: [
      "Implement regression, k-NN, k-means, trees, and naive Bayes in pure Python",
      "Split data honestly and compute the core classification and regression metrics",
      "Derive closed-form ridge regression and run power iteration for PCA",
      "Build boosting and matrix-factorization update steps from the maths",
    ],
    prerequisites: ["math-foundations"],
    problemIds: ["ml-008", "ml-017", "ml-023", "ml-026", "ml-029", "ml-021", "ml-010", "ml-002", "ml-001", "ml-004", "ml-009", "ml-012", "ml-014", "ml-083", "ml-006", "ml-007", "ml-032", "ml-034", "ml-003", "ml-005", "ml-035", "ml-013", "ml-038", "ml-042", "ml-043", "ml-045", "ml-137", "ml-220"],
    stages: [
      {
        id: "data-and-metrics",
        title: "Data and Metrics",
        blurb:
          "Machine learning starts with clean features and honest measurement. Standardize columns, encode categories, split folds, and compute accuracy, MSE, and distance.",
        problemIds: ["ml-008", "ml-017", "ml-023", "ml-026", "ml-029", "ml-021", "ml-010"],
      },
      {
        id: "supervised-core",
        title: "Supervised Core",
        blurb:
          "Fit the workhorse models: the sigmoid, linear regression, k-NN, and the loss gradients that train them, from MSE to binary cross-entropy.",
        problemIds: ["ml-002", "ml-001", "ml-004", "ml-009", "ml-012", "ml-014", "ml-083"],
      },
      {
        id: "trees-clusters-ensembles",
        title: "Trees, Clusters, and Ensembles",
        blurb:
          "Split data by impurity, group it with k-means, and combine weak learners. Entropy, Gini, information gain, and AdaBoost's reweighting rule.",
        problemIds: ["ml-006", "ml-007", "ml-032", "ml-034", "ml-003", "ml-005", "ml-035"],
      },
      {
        id: "regularization-latent-bayes",
        title: "Regularization, Latent Structure, and Bayes",
        blurb:
          "Control model complexity and find structure: ridge regression, naive Bayes, covariance matrices, power iteration, explained variance, and matrix-factorization SGD.",
        problemIds: ["ml-013", "ml-038", "ml-042", "ml-043", "ml-045", "ml-137", "ml-220"],
      },
    ],
  },

  {
    id: "deep-learning-essentials",
    title: "Deep Learning Essentials",
    description:
      "Activations, forward passes, and backprop, built one function at a time. You will go from ReLU and dense layers up through batch norm, attention, and a full transformer encoder block, with a little tokenization to feed the models. Perfect before you touch a framework, because you will recognize what every layer is doing.",
    estimatedHours: 10,
    slug: "deep-learning-essentials",
    level: "Intermediate",
    tags: ["deep-learning", "neural-networks", "backpropagation", "attention"],
    goals: [
      "Implement activation functions, dense layers, and a full forward pass",
      "Backpropagate through softmax cross-entropy and train with SGD",
      "Tokenize text and turn tokens into embeddings with positional information",
      "Assemble scaled dot-product attention and a transformer encoder block",
    ],
    prerequisites: ["ml-from-scratch"],
    problemIds: ["dl-001", "dl-002", "dl-008", "dl-010", "dl-018", "dl-016", "dl-012", "dl-003", "dl-004", "dl-022", "dl-025", "dl-027", "dl-005", "dl-043", "nlp-001", "nlp-002", "dl-020", "nlp-003", "nlp-020", "dl-033", "nlp-021", "dl-034", "dl-035", "dl-036", "dl-045", "dl-047", "dl-087"],
    stages: [
      {
        id: "neurons-and-forward-passes",
        title: "Neurons and Forward Passes",
        blurb:
          "The building blocks: ReLU, sigmoid, and tanh activations, a dense layer forward pass, and the initialization and update rules that keep training stable.",
        problemIds: ["dl-001", "dl-002", "dl-008", "dl-010", "dl-018", "dl-016", "dl-012"],
      },
      {
        id: "training-and-backprop",
        title: "Training and Backprop",
        blurb:
          "Make the network learn: stable softmax, MLP and convolution forward passes, normalization layers, and gradient computation through the loss.",
        problemIds: ["dl-003", "dl-004", "dl-022", "dl-025", "dl-027", "dl-005", "dl-043"],
      },
      {
        id: "text-to-embeddings",
        title: "Text to Embeddings",
        blurb:
          "Models read numbers, not words. Tokenize, count, weight with TF-IDF, learn BPE merges, and look up embeddings with sinusoidal positions.",
        problemIds: ["nlp-001", "nlp-002", "dl-020", "nlp-003", "nlp-020", "dl-033", "nlp-021"],
      },
      {
        id: "attention-and-transformers",
        title: "Attention and Transformers",
        blurb:
          "Attention lets every token look at every other. Build the scores, softmax weights, and weighted sum, then add an LSTM gate, beam search, and a full encoder block.",
        problemIds: ["dl-034", "dl-035", "dl-036", "dl-045", "dl-047", "dl-087"],
      },
    ],
  },

  {
    id: "optimization-mastery",
    title: "Optimization Mastery",
    description:
      "How models actually learn: gradients, momentum, adaptive methods, and the schedules that decide whether training converges. You will implement gradient descent, Adam, and learning rate policies, then reach the quasi-Newton methods used in serious solvers. Take it after ML From Scratch or Deep Learning Essentials.",
    estimatedHours: 9,
    slug: "optimization-mastery",
    level: "Advanced",
    tags: ["optimization", "gradient-descent", "adam", "learning-rate-schedules"],
    goals: [
      "Tune training with warmup, decay, clipping, and weight-decay schedules",
      "Implement SGD, momentum, Nesterov, Adam, AdamW, and Lion updates",
      "Handle constraints and stochastic gradients with projected methods",
      "Reach quasi-Newton solvers: BFGS, L-BFGS, Gauss-Newton, and trust regions",
    ],
    prerequisites: ["ml-from-scratch", "calculus-for-ml"],
    problemIds: ["op-005", "op-014", "op-016", "op-019", "op-021", "op-022", "op-024", "op-001", "op-003", "op-006", "op-007", "op-010", "op-011", "op-013", "op-008", "op-009", "op-054", "op-060", "op-062", "op-002", "op-004", "op-012", "op-042", "op-040", "op-057", "op-058", "op-039", "op-041", "op-055", "op-056"],
    stages: [
      {
        id: "schedules-and-stability",
        title: "Schedules and Stability",
        blurb:
          "The learning-rate policy decides whether training converges. Implement exponential, step, warmup, polynomial, and cosine schedules, plus value and norm gradient clipping.",
        problemIds: ["op-005", "op-014", "op-016", "op-019", "op-021", "op-022", "op-024"],
      },
      {
        id: "first-order-optimizers",
        title: "First-Order Optimizers",
        blurb:
          "Follow the gradient: full-batch and mini-batch descent, momentum, Nesterov acceleration, Adam, AdamW, and the sign-based Lion update.",
        problemIds: ["op-001", "op-003", "op-006", "op-007", "op-010", "op-011", "op-013"],
      },
      {
        id: "adaptive-and-constrained",
        title: "Adaptive and Constrained Methods",
        blurb:
          "Variants that adapt per parameter and methods that respect constraints: Adagrad, RMSProp, stochastic regression, AMSGrad, projected gradient, conjugate gradients, natural gradient, and Frank-Wolfe.",
        problemIds: ["op-008", "op-009", "op-054", "op-060", "op-062", "op-002", "op-004", "op-012", "op-042"],
      },
      {
        id: "second-order-and-quasi-newton",
        title: "Second-Order and Quasi-Newton",
        blurb:
          "When first-order steps stall, use curvature: Hessian-vector products, finite-difference Newton steps, BFGS, L-BFGS, Gauss-Newton, Levenberg-Marquardt, and trust-region updates.",
        problemIds: ["op-040", "op-057", "op-058", "op-039", "op-041", "op-055", "op-056"],
      },
    ],
  },

  {
    id: "linear-algebra-deep-dive",
    title: "Linear Algebra Deep Dive",
    description:
      "A complete tour of the matrix machinery behind ML, from dot products to spectral decompositions. You will implement row reduction, LU, Cholesky, Gram-Schmidt, power iteration, and PageRank steps from scratch. Suited to learners who want to reason about rank, conditioning, and eigenvalues fluently.",
    estimatedHours: 10,
    slug: "linear-algebra-deep-dive",
    level: "Advanced",
    tags: ["linear-algebra", "matrix-decompositions", "eigenvalues", "numerical-methods"],
    goals: [
      "Move fluently between vectors, matrices, and linear systems",
      "Factorize matrices with LU, Cholesky, QR, and Gram-Schmidt",
      "Compute eigenvalues and eigenvectors with power-iteration methods",
      "Apply spectral ideas to whitening, PageRank, and low-rank approximation",
    ],
    prerequisites: ["math-foundations"],
    problemIds: ["la-011", "la-012", "la-004", "la-006", "la-016", "la-027", "la-028", "la-001", "la-002", "la-008", "la-025", "la-038", "la-040", "la-083", "la-047", "la-048", "la-049", "la-050", "la-137", "la-139", "la-084", "la-117", "la-089", "la-088", "la-132", "la-177", "la-178"],
    stages: [
      {
        id: "vectors-and-products",
        title: "Vectors and Products",
        blurb:
          "Rebuild the basics with intent: vector operations, norms, identity matrices, outer products, and the Kronecker product that appears in tensor code.",
        problemIds: ["la-011", "la-012", "la-004", "la-006", "la-016", "la-027", "la-028"],
      },
      {
        id: "matrices-and-systems",
        title: "Matrices and Systems",
        blurb:
          "Matrix products, transposes, determinants, and rank, plus the eigenpair check and cosine similarity that everything else builds on.",
        problemIds: ["la-001", "la-002", "la-008", "la-025", "la-038", "la-040", "la-083"],
      },
      {
        id: "factorizations",
        title: "Factorizations",
        blurb:
          "The matrix decompositions numerical libraries actually run: LU with Doolittle, Cholesky, Gram-Schmidt, QR, power iteration, and rank-1 approximation.",
        problemIds: ["la-047", "la-048", "la-049", "la-050", "la-137", "la-139"],
      },
      {
        id: "spectral-applications",
        title: "Spectral Applications",
        blurb:
          "Put the eigen-decomposition to work: normalized eigenvectors, Rayleigh quotients, singular values, whitening, the spectral norm, deflation, and PageRank's stationary distribution.",
        problemIds: ["la-084", "la-117", "la-089", "la-088", "la-132", "la-177", "la-178"],
      },
    ],
  },

  {
    id: "calculus-for-ml",
    title: "Calculus for ML",
    description:
      "Derivatives, gradients, Jacobians, and Hessians, all computed numerically so you can verify any formula by hand. You will build finite differences, Newton and RK methods, Lagrange multipliers, and convolution integrals. Designed for learners who want optimization and backprop to rest on real calculus rather than hand-waving.",
    estimatedHours: 9,
    slug: "calculus-for-ml",
    level: "Intermediate",
    tags: ["calculus", "gradients", "jacobian", "hessian", "odes"],
    goals: [
      "Approximate derivatives and integrals with finite differences and quadrature",
      "Build gradients, partials, Jacobians, and Hessians numerically",
      "Apply the chain rule and matrix calculus to ML losses",
      "Solve ODEs and take transforms used in signal and generative models",
    ],
    prerequisites: ["math-foundations"],
    problemIds: ["ca-001", "ca-006", "ca-003", "ca-009", "ca-010", "ca-015", "ca-002", "ca-022", "ca-023", "ca-025", "ca-026", "ca-031", "ca-067", "ca-068", "ca-073", "ca-004", "ca-005", "ca-042", "ca-019", "ca-267", "ca-046", "ca-090", "ca-091", "ca-093"],
    stages: [
      {
        id: "derivatives-and-integrals",
        title: "Derivatives and Integrals",
        blurb:
          "Numerical differentiation and integration: forward differences, trapezoidal and Simpson rules, midpoint quadrature, and directional derivatives.",
        problemIds: ["ca-001", "ca-006", "ca-003", "ca-009", "ca-010", "ca-015"],
      },
      {
        id: "gradients-and-newton",
        title: "Gradients and Newton's Method",
        blurb:
          "From one variable to many: numerical gradients, Newton's method in one and several steps, partial derivatives of quadratic forms, and the Hessian of a quadratic.",
        problemIds: ["ca-002", "ca-022", "ca-023", "ca-025", "ca-026", "ca-031"],
      },
      {
        id: "multivariable-calculus",
        title: "Multivariable Calculus for Backprop",
        blurb:
          "The tools behind backprop and constrained optimization: mixed partials, gradient-descent steps, softmax gradients, Jacobians, Hessians, and Lagrange multipliers.",
        problemIds: ["ca-067", "ca-068", "ca-073", "ca-004", "ca-005", "ca-042"],
      },
      {
        id: "odes-and-transforms",
        title: "ODEs and Transforms",
        blurb:
          "Continuous dynamics and frequency-domain tools: Euler and Runge-Kutta steps, convolution integrals, Fourier coefficients, and inverse Laplace transforms.",
        problemIds: ["ca-019", "ca-267", "ca-046", "ca-090", "ca-091", "ca-093"],
      },
    ],
  },

  {
    id: "probability-foundations",
    title: "Probability Foundations",
    description:
      "The language of uncertainty, from counting and expectation to Markov chains and concentration bounds. You will implement Bayes rule, classic distributions, inclusion-exclusion, gambler's ruin, and a CLT simulation. A good fit for interviews and for anyone starting probabilistic ML.",
    estimatedHours: 10,
    slug: "probability-foundations",
    level: "Beginner",
    tags: ["probability", "distributions", "bayes", "markov-chains"],
    goals: [
      "Count outcomes with permutations, combinations, and inclusion-exclusion",
      "Work with geometric, binomial, Poisson, exponential, and normal distributions",
      "Apply conditional probability, total probability, and Bayes' rule",
      "Analyze Markov chains, hitting times, and limit theorems",
    ],
    prerequisites: [],
    problemIds: ["pr-002", "pr-003", "pr-004", "pr-006", "pr-008", "pr-009", "pr-017", "pr-018", "pr-010", "pr-012", "pr-013", "pr-014", "pr-019", "pr-020", "pr-023", "pr-005", "pr-001", "pr-022", "pr-024", "pr-025", "pr-028", "pr-031", "pr-036", "pr-038", "pr-042", "pr-044", "pr-045", "pr-047", "pr-048", "pr-050", "pr-089"],
    stages: [
      {
        id: "counting-and-basics",
        title: "Counting and Basics",
        blurb:
          "Probability starts with counting. Combinations, permutations, factorials, complements, independence, and the expectation of indicator variables.",
        problemIds: ["pr-002", "pr-003", "pr-004", "pr-006", "pr-008", "pr-009", "pr-017", "pr-018"],
      },
      {
        id: "random-variables-and-distributions",
        title: "Random Variables and Distributions",
        blurb:
          "Expected value and variance, then the distributions that recur: geometric, Poisson, exponential, and normal, plus covariance between indicators.",
        problemIds: ["pr-010", "pr-012", "pr-013", "pr-014", "pr-019", "pr-020", "pr-023", "pr-005"],
      },
      {
        id: "conditional-and-bayes",
        title: "Conditional Probability and Bayes",
        blurb:
          "Update beliefs with evidence: conditional tables, total probability, Bayes with two and three hypotheses, multinomial counts, hypergeometric sampling, and CDFs.",
        problemIds: ["pr-001", "pr-022", "pr-024", "pr-025", "pr-028", "pr-031", "pr-036"],
      },
      {
        id: "chains-and-limits",
        title: "Chains and Limit Theorems",
        blurb:
          "Sequences of random events: stationary distributions, inclusion-exclusion, Markov n-step laws, hitting times, gambler's ruin, the Central Limit Theorem, and a Chernoff bound.",
        problemIds: ["pr-038", "pr-042", "pr-044", "pr-045", "pr-047", "pr-048", "pr-050", "pr-089"],
      },
    ],
  },

  {
    id: "statistics-mastery",
    title: "Statistics Mastery",
    description:
      "Turn data into decisions: descriptive statistics, sampling distributions, hypothesis tests, and robust methods. You will implement t-tests, ANOVA, bootstrap intervals, rank correlations, and multiple-comparison corrections. Best for aspiring data scientists and analysts who need to defend their conclusions.",
    estimatedHours: 11,
    slug: "statistics-mastery",
    level: "Intermediate",
    tags: ["statistics", "hypothesis-testing", "confidence-intervals", "bootstrap"],
    goals: [
      "Summarize datasets with robust, weighted, and standardized descriptives",
      "Quantify relationships with covariance, correlation, and rank measures",
      "Run and interpret t-tests, confidence intervals, and non-parametric tests",
      "Correct for multiple comparisons and resample with the bootstrap",
    ],
    prerequisites: ["probability-foundations"],
    problemIds: ["st-001", "st-002", "st-006", "st-007", "st-010", "st-018", "st-019", "st-020", "st-003", "st-004", "st-022", "st-023", "st-024", "st-025", "st-028", "st-029", "st-037", "st-077", "st-082", "st-044", "st-045", "st-047", "st-048", "st-042", "st-049", "st-090", "st-132", "st-133", "st-134"],
    stages: [
      {
        id: "describing-data",
        title: "Describing Data",
        blurb:
          "Center, spread, and shape: means (including weighted), variance, median, mode, z-scores, standard error, and coefficient of variation.",
        problemIds: ["st-001", "st-002", "st-006", "st-007", "st-010", "st-018", "st-019", "st-020"],
      },
      {
        id: "relationships",
        title: "Relationships Between Variables",
        blurb:
          "How variables move together: covariance, Pearson correlation, correlation matrices, trimmed means and variances, quartiles, percentiles, skewness, and rolling means.",
        problemIds: ["st-003", "st-004", "st-022", "st-023", "st-024", "st-025", "st-028", "st-029"],
      },
      {
        id: "inference",
        title: "Inference from Samples",
        blurb:
          "Draw conclusions from data: one-sample and Welch t-statistics, degrees of freedom, confidence intervals with known and unknown sigma, KS statistics, permutation p-values, and bootstrap intervals.",
        problemIds: ["st-037", "st-077", "st-082", "st-044", "st-045", "st-047", "st-048"],
      },
      {
        id: "robust-and-multiple-testing",
        title: "Robust Tests and Multiple Comparisons",
        blurb:
          "When assumptions break and tests multiply: rank correlations with ties, Mann-Whitney U, bootstrap-t and percentile intervals, permutation tests on medians, sign flips, and Benjamini-Hochberg.",
        problemIds: ["st-042", "st-049", "st-090", "st-132", "st-133", "st-134"],
      },
    ],
  },

  {
    id: "nlp-starter",
    title: "NLP Starter",
    description:
      "Text into numbers, from tokenization and n-grams to TF-IDF, edit distance, and attention. You will build the preprocessing pipeline behind search engines and language models with plain Python. Start here if you want to understand what happens before a model sees a sentence.",
    estimatedHours: 10,
    slug: "nlp-starter",
    level: "Beginner",
    tags: ["nlp", "tokenization", "tf-idf", "language-models"],
    goals: [
      "Tokenize, normalize, and build vocabularies from raw text",
      "Represent documents with bag-of-words, TF-IDF, and similarity scores",
      "Build n-gram language models with smoothing and subword tokenization",
      "Retrieve documents and score generated text",
    ],
    prerequisites: [],
    problemIds: ["nlp-001", "nlp-006", "nlp-009", "nlp-004", "nlp-014", "nlp-015", "nlp-017", "nlp-019", "nlp-002", "nlp-003", "nlp-005", "nlp-007", "nlp-035", "nlp-036", "nlp-059", "nlp-020", "nlp-025", "nlp-027", "nlp-021", "nlp-022", "nlp-029", "nlp-031", "nlp-041", "nlp-040", "nlp-061", "nlp-050", "nlp-092"],
    stages: [
      {
        id: "tokens-and-text-normalization",
        title: "Tokens and Text Normalization",
        blurb:
          "Turn raw strings into tokens: whitespace and punctuation handling, stopword removal, n-grams, vocabulary indices, one-hot encoding, and sentence splitting.",
        problemIds: ["nlp-001", "nlp-006", "nlp-009", "nlp-004", "nlp-014", "nlp-015", "nlp-017", "nlp-019"],
      },
      {
        id: "document-representations",
        title: "Document Representations",
        blurb:
          "Documents as vectors: bag-of-words, TF-IDF, cosine similarity, offset tokenization, Jaccard and Dice overlap, and PMI collocation scores.",
        problemIds: ["nlp-002", "nlp-003", "nlp-005", "nlp-007", "nlp-035", "nlp-036", "nlp-059"],
      },
      {
        id: "language-models",
        title: "Language Models",
        blurb:
          "Predict the next token: BPE merges and encoding, bigram probabilities with Laplace smoothing, log-likelihood, backoff, and WordPiece segmentation.",
        problemIds: ["nlp-020", "nlp-025", "nlp-027", "nlp-021", "nlp-022", "nlp-029"],
      },
      {
        id: "search-and-evaluation",
        title: "Search and Evaluation",
        blurb:
          "Find and judge text: edit distance, inverted indexes, BM25, log-likelihood ratio collocations, scaled dot-product attention, and ROUGE-2.",
        problemIds: ["nlp-031", "nlp-041", "nlp-040", "nlp-061", "nlp-050", "nlp-092"],
      },
    ],
  },

  {
    id: "computer-vision-starter",
    title: "Computer Vision Starter",
    description:
      "Images as grids of numbers, then as features a model can use. You will implement grayscale conversion, padding, convolution, pooling, Gaussian blur, edge detection, and Otsu thresholding from scratch. A hands-on introduction for anyone curious how CNNs see.",
    estimatedHours: 11,
    slug: "computer-vision-starter",
    level: "Beginner",
    tags: ["computer-vision", "convolution", "image-processing", "filters"],
    goals: [
      "Manipulate images as arrays: crop, pad, flip, threshold, and normalize",
      "Build filters, blurring, histograms, and pooling from scratch",
      "Detect edges and segment with morphology and Otsu's method",
      "Connect classical vision to CNN and ViT building blocks",
    ],
    prerequisites: [],
    problemIds: ["cv-001", "cv-004", "cv-005", "cv-006", "cv-010", "cv-011", "cv-012", "cv-014", "cv-015", "cv-017", "cv-019", "cv-020", "cv-021", "cv-025", "cv-026", "cv-028", "cv-031", "cv-032", "cv-033", "cv-034", "cv-035", "cv-036", "dl-022", "dl-024", "dl-131", "cv-037", "cv-039", "cv-040"],
    stages: [
      {
        id: "image-basics",
        title: "Image Basics",
        blurb:
          "Images are number grids. Convert color to grayscale, crop, pad, flip, invert, threshold, average-pool, and min-max normalize.",
        problemIds: ["cv-001", "cv-004", "cv-005", "cv-006", "cv-010", "cv-011", "cv-012", "cv-014"],
      },
      {
        id: "filtering",
        title: "Filtering and Blurring",
        blurb:
          "Local operations: reflect padding, nearest-neighbour resize, cross-correlation, Gaussian kernels and blur, median filters, max pooling, and histogram binning.",
        problemIds: ["cv-015", "cv-017", "cv-019", "cv-020", "cv-021", "cv-025", "cv-026", "cv-028"],
      },
      {
        id: "morphology-and-edges",
        title: "Morphology and Edges",
        blurb:
          "Shape from pixels: dilation, erosion, bilinear interpolation, Otsu thresholding, full 2D convolution, and Sobel gradient magnitudes.",
        problemIds: ["cv-031", "cv-032", "cv-033", "cv-034", "cv-035", "cv-036"],
      },
      {
        id: "toward-recognition",
        title: "Toward Recognition",
        blurb:
          "From handcrafted features to learnt ones: histogram equalization, intersection over union, non-max suppression, and the convolution, pooling, and patch-embedding layers inside CNNs and ViTs.",
        problemIds: ["dl-022", "dl-024", "dl-131", "cv-037", "cv-039", "cv-040"],
      },
    ],
  },

  {
    id: "algorithms-interview-grind",
    title: "Algorithms Interview Grind",
    description:
      "The highest-yield coding interview patterns in one sequence: two pointers, sliding windows, dynamic programming, heaps, and graph search. You will solve the canonical problems that show up in FAANG screens, implemented in pure Python. Built for interview season, not for casual browsing.",
    estimatedHours: 15,
    slug: "algorithms-interview-grind",
    level: "Advanced",
    tags: ["algorithms", "interviews", "dynamic-programming", "graphs"],
    goals: [
      "Master two-pointer, prefix-sum, and sliding-window patterns",
      "Solve the canonical dynamic-programming problems without hints",
      "Run BFS, Dijkstra, and topological order under interview time pressure",
      "Handle heaps, deques, and hard string problems",
    ],
    prerequisites: ["data-structures-core"],
    problemIds: ["al-001", "al-002", "al-003", "al-008", "al-011", "al-041", "al-043", "al-044", "al-017", "al-027", "al-055", "al-057", "al-062", "al-073", "al-024", "al-025", "al-026", "al-053", "al-035", "al-037", "al-098", "al-100", "al-074", "al-117", "al-125", "al-163"],
    stages: [
      {
        id: "arrays-and-two-pointers",
        title: "Arrays and Two Pointers",
        blurb:
          "Interview warm-ups: binary search, sorted pair sums, prefix sums, anagram checks, bracket matching, fast exponentiation, and bit tricks.",
        problemIds: ["al-001", "al-002", "al-003", "al-008", "al-011", "al-041", "al-043", "al-044"],
      },
      {
        id: "windows-and-subarrays",
        title: "Windows and Subarrays",
        blurb:
          "Contiguous-range patterns: maximum subarray sum, longest increasing subsequence, merging intervals, subarray sums, word break, and the largest histogram rectangle.",
        problemIds: ["al-017", "al-027", "al-055", "al-057", "al-062", "al-073"],
      },
      {
        id: "dynamic-programming",
        title: "Dynamic Programming",
        blurb:
          "The DP canon: 0/1 knapsack, longest common subsequence, coin change, house robber, edit distance, and the median of two sorted arrays.",
        problemIds: ["al-024", "al-025", "al-026", "al-053", "al-035", "al-037"],
      },
      {
        id: "graphs-and-hard-patterns",
        title: "Graphs and Hard Patterns",
        blurb:
          "Graph search and the hard tier: Dijkstra, course scheduling, sliding-window maximum with a deque, word ladder, merging k sorted lists, and minimum window substring.",
        problemIds: ["al-098", "al-100", "al-074", "al-117", "al-125", "al-163"],
      },
    ],
  },

  {
    id: "data-structures-core",
    title: "Data Structures Core",
    description:
      "The containers that make algorithms fast, implemented by hand. You will build stacks, queues, linked lists, heaps, tries, BSTs, union-find, and caches, then wire them into classic problems. Essential for interviews and for anyone who wants to know what a library really does.",
    estimatedHours: 14,
    slug: "data-structures-core",
    level: "Intermediate",
    tags: ["data-structures", "interviews", "trees", "hashing", "heaps"],
    goals: [
      "Implement stacks, queues, and linked lists from scratch",
      "Build heaps, hash maps, and caches layered on top",
      "Code BSTs, tries, and range-query trees",
      "Use union-find and monotonic stacks for classic problems",
    ],
    prerequisites: [],
    problemIds: ["ds-001", "ds-002", "ds-003", "ds-005", "ds-008", "ds-009", "ds-004", "ds-010", "ds-018", "ds-019", "ds-021", "ds-020", "ds-039", "ds-025", "ds-028", "ds-030", "ds-023", "ds-024", "ds-036", "ds-014", "ds-015", "ds-033", "ds-034", "ds-040", "ds-032", "ds-038"],
    stages: [
      {
        id: "linear-structures",
        title: "Linear Structures",
        blurb:
          "The containers everything else builds on: stack simulation, balanced brackets, postfix evaluation, a min stack, a queue built from two stacks, and linked-list traversal.",
        problemIds: ["ds-001", "ds-002", "ds-003", "ds-005", "ds-008", "ds-009", "ds-004"],
      },
      {
        id: "linked-lists-and-heaps",
        title: "Linked Lists and Heaps",
        blurb:
          "Pointer surgery and priority order: merging sorted lists, heap parent/child indices, sift-up, heap push and pop, heapify, and the two-heap median finder.",
        problemIds: ["ds-010", "ds-018", "ds-019", "ds-021", "ds-020", "ds-039"],
      },
      {
        id: "trees-and-tries",
        title: "Trees and Tries",
        blurb:
          "Hierarchical structures: trie insert/search/prefix, BST insert and preorder traversal, BST validation, level-order traversal, prefix collection, and segment-tree range sums.",
        problemIds: ["ds-025", "ds-028", "ds-030", "ds-023", "ds-024", "ds-036"],
      },
      {
        id: "hashing-union-find-and-caches",
        title: "Hashing, Union-Find, and Caches",
        blurb:
          "Hash-based and near-constant-time structures: string hashing, hash sets, separate chaining, union-find with path compression and union by rank, monotonic stacks, and an LRU cache.",
        problemIds: ["ds-014", "ds-015", "ds-033", "ds-034", "ds-040", "ds-032", "ds-038"],
      },
    ],
  },

  {
    id: "reinforcement-learning-intro",
    title: "Reinforcement Learning Intro",
    description:
      "Agents that learn by acting: MDPs, value iteration, Q-learning, and policy gradients. You will begin with policy evaluation and bandits, then implement TD updates, SARSA, and REINFORCE from scratch. A gentle on-ramp before tackling deep RL.",
    estimatedHours: 12,
    slug: "reinforcement-learning-intro",
    level: "Intermediate",
    tags: ["reinforcement-learning", "mdp", "q-learning", "policy-gradients"],
    goals: [
      "Evaluate policies and extract actions from value functions",
      "Implement value iteration, TD updates, and Q-learning",
      "Balance exploration with epsilon-greedy and SARSA variants",
      "Train policies directly with REINFORCE and actor-critic updates",
    ],
    prerequisites: ["probability-foundations", "ml-from-scratch"],
    problemIds: ["rl-001", "rl-004", "rl-008", "rl-010", "rl-012", "rl-028", "rl-026", "rl-025", "rl-002", "rl-005", "rl-007", "rl-013", "rl-014", "rl-029", "rl-016", "rl-017", "rl-019", "rl-020", "rl-021", "rl-018", "rl-003", "rl-022", "rl-009", "rl-015", "rl-006", "rl-044", "rl-040"],
    stages: [
      {
        id: "mdp-foundations",
        title: "MDP Foundations",
        blurb:
          "The vocabulary of RL: policy-evaluation sweeps, policy extraction, state values from action values, discounted returns, Monte Carlo returns, incremental means, action values, and advantages.",
        problemIds: ["rl-001", "rl-004", "rl-008", "rl-010", "rl-012", "rl-028", "rl-026", "rl-025"],
      },
      {
        id: "value-based-methods",
        title: "Value-Based Methods",
        blurb:
          "Plan and learn from experience: value-iteration sweeps, policy improvement, Q-values from transitions, TD(0), n-step returns, and generalized advantage estimation.",
        problemIds: ["rl-002", "rl-005", "rl-007", "rl-013", "rl-014", "rl-029"],
      },
      {
        id: "control-and-exploration",
        title: "Control and Exploration",
        blurb:
          "Choose actions and improve them: SARSA, Q-learning, expected SARSA, epsilon-greedy selection and probabilities, double Q-learning, and value iteration to convergence.",
        problemIds: ["rl-016", "rl-017", "rl-019", "rl-020", "rl-021", "rl-018", "rl-003"],
      },
      {
        id: "policy-gradients",
        title: "Policy Gradients",
        blurb:
          "Optimize the policy directly: Bellman residuals, TD(lambda), policy iteration, softmax policy probabilities, an actor-critic update, and the REINFORCE log-probability gradient.",
        problemIds: ["rl-022", "rl-009", "rl-015", "rl-006", "rl-044", "rl-040"],
      },
    ],
  },

  {
    id: "time-series-forecasting",
    title: "Time Series Forecasting",
    description:
      "Data that moves through time, modeled from first principles. You will build differencing, smoothing, autocorrelation, AR/MA simulation, Holt-Winters, and Yule-Walker solvers without a single library. Suited to analysts and ML engineers working with metrics, demand, or finance.",
    estimatedHours: 12,
    slug: "time-series-forecasting",
    level: "Intermediate",
    tags: ["time-series", "forecasting", "exponential-smoothing", "autocorrelation"],
    goals: [
      "Transform and difference series into a stationary form",
      "Forecast with moving averages, exponential smoothing, and Holt-Winters",
      "Fit AR and MA structure with Yule-Walker and Durbin-Levinson",
      "Diagnose forecasts with autocorrelation, Ljung-Box, and Theil's U",
    ],
    prerequisites: ["statistics-mastery"],
    problemIds: ["ts-001", "ts-002", "ts-005", "ts-006", "ts-007", "ts-011", "ts-012", "ts-016", "ts-017", "ts-021", "ts-022", "ts-024", "ts-025", "ts-028", "ts-029", "ts-032", "ts-033", "ts-034", "ts-037", "ts-038", "ts-040", "ts-082", "ts-083", "ts-041", "ts-042", "ts-043", "ts-044", "ts-045", "ts-084"],
    stages: [
      {
        id: "series-basics",
        title: "Series Basics",
        blurb:
          "Look before you model: absolute changes, first differences, expanding means, seasonal naive forecasts, log transforms, error metrics, stationarity, and rolling means.",
        problemIds: ["ts-001", "ts-002", "ts-005", "ts-006", "ts-007", "ts-011", "ts-012", "ts-016", "ts-017"],
      },
      {
        id: "smoothing",
        title: "Smoothing and Trend",
        blurb:
          "Averaging with memory: simple and double exponential smoothing, Holt forecasts, autocovariance and autocorrelation, partial autocorrelation, and OLS trend slopes.",
        problemIds: ["ts-021", "ts-022", "ts-024", "ts-025", "ts-028", "ts-029", "ts-032"],
      },
      {
        id: "ar-ma-models",
        title: "AR and MA Models",
        blurb:
          "Model the dependence structure: MA(1) and AR(1) generation, Holt-Winters, Ljung-Box diagnostics, Yule-Walker solves, and Durbin-Levinson recursion.",
        problemIds: ["ts-033", "ts-034", "ts-037", "ts-038", "ts-040", "ts-082", "ts-083"],
      },
      {
        id: "diagnostics-and-horizons",
        title: "Diagnostics and Horizons",
        blurb:
          "Judge and extend forecasts: ARMA one-step forecasts, Theil's U, the Hurst exponent, lead-lag discovery, and Granger-style predictability tests.",
        problemIds: ["ts-041", "ts-042", "ts-043", "ts-044", "ts-045", "ts-084"],
      },
    ],
  },

  {
    id: "graph-algorithms",
    title: "Graph Algorithms",
    description:
      "Networks traversed properly: BFS, DFS, shortest paths, MSTs, PageRank, and max flow. You will implement Dijkstra, Kruskal, Tarjan-style components, centrality measures, and matching from scratch. Great preparation for both interviews and data-centric engineering work.",
    estimatedHours: 12,
    slug: "graph-algorithms",
    level: "Intermediate",
    tags: ["graph-algorithms", "shortest-paths", "spanning-trees", "network-flow", "centrality"],
    goals: [
      "Represent graphs as lists and matrices and traverse them breadth- and depth-first",
      "Find shortest paths and minimum spanning trees",
      "Compute centrality, PageRank, and bipartite matchings",
      "Handle bridges, strongly connected components, and max flow",
    ],
    prerequisites: ["data-structures-core"],
    problemIds: ["graph-001", "graph-002", "graph-003", "graph-004", "graph-005", "graph-008", "graph-009", "graph-011", "graph-017", "graph-019", "graph-020", "graph-021", "graph-024", "graph-025", "graph-033", "graph-029", "graph-027", "graph-057", "graph-058", "graph-040", "graph-041", "graph-038", "graph-037", "graph-039", "graph-130", "graph-060", "graph-127"],
    stages: [
      {
        id: "representations-and-traversal",
        title: "Representations and Traversal",
        blurb:
          "Build adjacency lists and matrices, then walk the graph: BFS order, iterative DFS, connected components, density, degree centrality, and a PageRank sweep.",
        problemIds: ["graph-001", "graph-002", "graph-003", "graph-004", "graph-005", "graph-008", "graph-009", "graph-011"],
      },
      {
        id: "paths-and-spanning-trees",
        title: "Paths and Spanning Trees",
        blurb:
          "Connectivity with cost: cycle detection, Kahn's topological order, BFS shortest paths, Dijkstra with a heap, Prim, Kruskal, and course scheduling.",
        problemIds: ["graph-017", "graph-019", "graph-020", "graph-021", "graph-024", "graph-025", "graph-033"],
      },
      {
        id: "centrality-and-matching",
        title: "Centrality and Matching",
        blurb:
          "Rank nodes and pair them: PageRank to tolerance, closeness, Brandes betweenness, eigenvector centrality, augmenting paths, and maximum bipartite matching.",
        problemIds: ["graph-029", "graph-027", "graph-057", "graph-058", "graph-040", "graph-041"],
      },
      {
        id: "robustness-and-flow",
        title: "Robustness and Flow",
        blurb:
          "Cuts, components, and capacity: articulation points, bridges, Kosaraju SCCs, edge betweenness, Ford-Fulkerson max flow, and negative-cycle path extraction.",
        problemIds: ["graph-038", "graph-037", "graph-039", "graph-130", "graph-060", "graph-127"],
      },
    ],
  },

  {
    id: "information-theory",
    title: "Information Theory",
    description:
      "How much does a message tell you? Build entropy, KL divergence, mutual information, channel capacity, and source coding from scratch. You will finish with Huffman codes, rate-distortion, and privacy mechanisms that show up across modern ML. Perfect for the mathematically curious.",
    estimatedHours: 11,
    slug: "information-theory",
    level: "Advanced",
    tags: ["information-theory", "entropy", "kl-divergence", "source-coding"],
    goals: [
      "Quantify information with entropy, cross-entropy, and perplexity",
      "Compute mutual information, KL, Jensen-Shannon, and Hellinger divergences",
      "Understand channel capacity and data-processing bounds",
      "Design source codes with Huffman, Shannon, and Kraft's inequality",
    ],
    prerequisites: ["probability-foundations"],
    problemIds: ["info-001", "info-002", "info-004", "info-012", "info-017", "info-020", "info-026", "info-033", "info-003", "info-006", "info-007", "info-008", "info-009", "info-013", "info-015", "info-016", "info-018", "info-034", "info-024", "info-036", "info-037", "info-029", "info-031", "info-049", "info-028", "info-030", "info-027", "info-032", "info-045"],
    stages: [
      {
        id: "information-and-entropy",
        title: "Information and Entropy",
        blurb:
          "Surprise and uncertainty: self-information, entropy of distributions, binary entropy, cross-entropy, total variation, perplexity, entropy in nats, and BSC capacity.",
        problemIds: ["info-001", "info-002", "info-004", "info-012", "info-017", "info-020", "info-026", "info-033"],
      },
      {
        id: "joint-and-mutual-information",
        title: "Joint and Mutual Information",
        blurb:
          "Relationships between variables: entropy from counts, conditional entropy, the chain rule, mutual information from joints and marginals, KL divergence, and Jensen-Shannon divergence.",
        problemIds: ["info-003", "info-006", "info-007", "info-008", "info-009", "info-013", "info-015"],
      },
      {
        id: "divergences-and-limits",
        title: "Divergences and Fundamental Limits",
        blurb:
          "Distances between distributions and the limits of processing: Gaussian KL, Hellinger distance, BSC mutual information, maximum entropy, Blahut-Arimoto capacity, and the data-processing gap.",
        problemIds: ["info-016", "info-018", "info-034", "info-024", "info-036", "info-037"],
      },
      {
        id: "source-coding",
        title: "Source Coding",
        blurb:
          "Compress messages down to their entropy: Huffman code lengths and average length, Shannon code lengths, expected code length, Kraft's inequality, Markov-source rate, LZ78 parsing, and arithmetic coding.",
        problemIds: ["info-029", "info-031", "info-049", "info-028", "info-030", "info-027", "info-032", "info-045"],
      },
    ],
  },

  {
    id: "deep-learning-advanced",
    title: "Deep Learning Advanced",
    description:
      "Beyond the basics: modern activations, normalization variants, efficient attention, and quantization. You will implement GELU, group norm, multi-query attention, KV caching, and BPTT by hand, then compute the memory and FLOPs budgets of real models. Take it once you are comfortable with backprop.",
    estimatedHours: 14,
    slug: "deep-learning-advanced",
    level: "Advanced",
    tags: ["deep-learning", "transformers", "quantization", "training-systems"],
    goals: [
      "Implement modern activations and normalization variants",
      "Build efficient attention: multi-query, Bahdanau, and masked decoder attention",
      "Quantize models and budget their compute with int8 and FLOP accounting",
      "Work through VAE, DPO, and diffusion update steps",
    ],
    prerequisites: ["deep-learning-essentials"],
    problemIds: ["dl-051", "dl-052", "dl-067", "dl-070", "dl-071", "dl-072", "dl-077", "dl-073", "dl-112", "dl-113", "dl-115", "dl-116", "dl-135", "dl-058", "dl-059", "dl-060", "dl-064", "dl-132", "dl-140", "dl-091", "dl-093", "dl-110", "dl-111", "dl-136", "dl-179", "dl-180", "dl-183"],
    stages: [
      {
        id: "modern-activations-and-norm",
        title: "Modern Activations and Normalization",
        blurb:
          "The non-linearities and normalizers in current architectures: SiLU, softplus, exact GELU, group norm, instance norm, layer scale, and per-channel quantization scales.",
        problemIds: ["dl-051", "dl-052", "dl-067", "dl-070", "dl-071", "dl-072", "dl-077"],
      },
      {
        id: "attention-variants",
        title: "Attention Variants",
        blurb:
          "Attend efficiently: multi-query KV repeat, peephole LSTM, bidirectional RNN concatenation, additive Bahdanau attention, masked decoder attention, and positional-embedding interpolation.",
        problemIds: ["dl-073", "dl-112", "dl-113", "dl-115", "dl-116", "dl-135"],
      },
      {
        id: "compression-and-training-systems",
        title: "Compression and Training Systems",
        blurb:
          "Ship models under budget: int8 scale, quantization and dequantization, checkpoint averaging, BPTT gradients, ZeRO memory accounting, transformer parameter counts, and inference FLOP estimates.",
        problemIds: ["dl-058", "dl-059", "dl-060", "dl-064", "dl-132", "dl-140", "dl-091", "dl-093"],
      },
      {
        id: "generative-and-alignment",
        title: "Generative and Alignment Objectives",
        blurb:
          "The losses behind modern generative systems: MAE patch masking, ViT class tokens, DETR set loss, the VAE ELBO, DPO loss, and a DDIM sampling step.",
        problemIds: ["dl-110", "dl-111", "dl-136", "dl-179", "dl-180", "dl-183"],
      },
    ],
  },

  {
    id: "ml-engineer-track",
    title: "ML Engineer Track",
    description:
      "The production-minded sequence: solid fundamentals, training dynamics, evaluation, and the systems math behind serving models. You will move from standard scalers and loss functions to backprop, class-weighted objectives, and memory accounting. Built for engineers who ship models, not just notebooks.",
    estimatedHours: 15,
    slug: "ml-engineer-track",
    level: "Advanced",
    tags: ["ml-engineering", "production-ml", "evaluation", "training-systems"],
    goals: [
      "Build clean training data with scaling, encoding, and split strategies",
      "Train models with the right losses and optimizer steps",
      "Diagnose models with validation, regularization, and importance",
      "Reason about neural training and serving costs",
    ],
    prerequisites: ["ml-from-scratch"],
    problemIds: ["ml-017", "ml-021", "ml-023", "ml-026", "ml-029", "ml-010", "ml-022", "ml-049", "dl-016", "dl-018", "ml-012", "ml-014", "ml-083", "ml-039", "op-010", "ml-001", "ml-013", "ml-103", "ml-132", "dl-025", "ml-141", "nlp-014", "dl-005", "dl-043", "dl-087", "dl-091", "dl-093"],
    stages: [
      {
        id: "data-hygiene",
        title: "Data Hygiene",
        blurb:
          "Reproducible splits and features: MSE, train/test splits, shuffled and stratified sampling, standardization, one-hot encoding, distances, and k-fold indices.",
        problemIds: ["ml-017", "ml-021", "ml-023", "ml-026", "ml-029", "ml-010", "ml-022", "ml-049"],
      },
      {
        id: "losses-and-optimization",
        title: "Losses and Optimization",
        blurb:
          "What training actually minimizes: MSE and BCE gradients, gradient-descent steps, SGD updates, Xavier initialization, bootstrap sampling, and a full Adam update.",
        problemIds: ["dl-016", "dl-018", "ml-012", "ml-014", "ml-083", "ml-039", "op-010"],
      },
      {
        id: "models-and-diagnostics",
        title: "Models and Diagnostics",
        blurb:
          "Fit and interrogate models: linear and ridge regression, logistic gradients, Adam steps, batch-norm forward passes, and permutation importance.",
        problemIds: ["ml-001", "ml-013", "ml-103", "ml-132", "dl-025", "ml-141"],
      },
      {
        id: "neural-and-systems-cost",
        title: "Neural Systems and Cost",
        blurb:
          "The deep-learning end of engineering: vocabulary mapping, backprop, softmax cross-entropy backward, a transformer encoder block, transformer parameter counts, and inference FLOP estimates.",
        problemIds: ["nlp-014", "dl-005", "dl-043", "dl-087", "dl-091", "dl-093"],
      },
    ],
  },

  {
    id: "data-scientist-track",
    title: "Data Scientist Track",
    description:
      "From summary statistics to causal inference, the full analyst toolkit. You will compute robust descriptives, run hypothesis tests, build regression and classification pipelines, and finish with uplift and causal estimators. The right path if your job is turning messy data into defensible decisions.",
    estimatedHours: 14,
    slug: "data-scientist-track",
    level: "Intermediate",
    tags: ["data-science", "statistics", "experimentation", "causal-inference"],
    goals: [
      "Produce robust descriptive and distributional summaries",
      "Measure relationships and test hypotheses end to end",
      "Build and evaluate regression and classification baselines",
      "Estimate causal effects and read ranking curves correctly",
    ],
    prerequisites: ["statistics-mastery", "probability-foundations"],
    problemIds: ["st-001", "st-002", "st-006", "st-010", "st-018", "st-023", "st-024", "pr-002", "st-003", "st-004", "st-022", "st-029", "st-037", "st-042", "st-044", "ml-008", "ml-017", "ml-016", "ml-001", "ml-020", "ml-010", "st-048", "ml-073", "ml-075", "ml-141", "ml-195", "ml-074", "ml-076"],
    stages: [
      {
        id: "descriptives",
        title: "Descriptives",
        blurb:
          "The daily bread of analysis: mean, variance, median, weighted mean, z-scores, quartiles, percentiles, and expected value.",
        problemIds: ["st-001", "st-002", "st-006", "st-010", "st-018", "st-023", "st-024", "pr-002"],
      },
      {
        id: "relationships-and-testing",
        title: "Relationships and Testing",
        blurb:
          "Do variables move together, and is it real? Covariance, Pearson and Spearman correlation, trimmed means, rolling means, one-sample t-statistics, and Welch's test.",
        problemIds: ["st-003", "st-004", "st-022", "st-029", "st-037", "st-042", "st-044"],
      },
      {
        id: "models-and-metrics",
        title: "Models and Metrics",
        blurb:
          "Fit baselines and score them: accuracy, MSE, linear regression, R-squared, k-fold splits, bootstrap confidence intervals, and confusion-matrix counts.",
        problemIds: ["ml-008", "ml-017", "ml-016", "ml-001", "ml-020", "ml-010", "st-048"],
      },
      {
        id: "causal-and-ranking",
        title: "Causal and Ranking Evaluation",
        blurb:
          "Beyond correlation: ROC and precision-recall curves, permutation importance, IPW average treatment effects, AUC by trapezoid, and average precision.",
        problemIds: ["ml-073", "ml-075", "ml-141", "ml-195", "ml-074", "ml-076"],
      },
    ],
  },

  {
    id: "quant-interview-track",
    title: "Quant Interview Track",
    description:
      "Probability brainteasers, statistics, and fast algorithms, sequenced the way trading interviews ask them. You will drill counting, Bayes, distributions, gambler's ruin, and sliding-window classics until they are automatic. Timed practice recommended once you finish.",
    estimatedHours: 16,
    slug: "quant-interview-track",
    level: "Advanced",
    tags: ["quantitative-finance", "interviews", "probability", "algorithms"],
    goals: [
      "Drill counting, combinatorics, and conditional probability",
      "Solve classic brainteasers: birthday, coupon collector, gambler's ruin",
      "Handle expectation, variance, and limit theorems under time pressure",
      "Pair probability with fast algorithmic warm-ups",
    ],
    prerequisites: ["probability-foundations"],
    problemIds: ["pr-003", "pr-004", "pr-006", "pr-007", "pr-008", "pr-010", "pr-012", "pr-001", "pr-005", "pr-022", "pr-024", "pr-025", "pr-029", "pr-030", "pr-031", "pr-038", "pr-047", "pr-048", "pr-092", "pr-049", "pr-050", "al-001", "al-008", "al-017", "al-023", "al-037", "al-214"],
    stages: [
      {
        id: "counting",
        title: "Counting",
        blurb:
          "Combinatorial speed drills: combinations, permutations, factorials, stars and bars, complements, binomial moments, and the geometric PMF.",
        problemIds: ["pr-003", "pr-004", "pr-006", "pr-007", "pr-008", "pr-010", "pr-012"],
      },
      {
        id: "conditional-probability",
        title: "Conditional Probability",
        blurb:
          "Given what you know: Bayes, total probability, conditional tables, variances, multinomial counts, the birthday problem, and the coupon collector.",
        problemIds: ["pr-001", "pr-005", "pr-022", "pr-024", "pr-025", "pr-029", "pr-030"],
      },
      {
        id: "walks-and-limits",
        title: "Walks and Limits",
        blurb:
          "Long-run behavior: binomial CDFs, two-state stationary distributions, expected hitting times, gambler's ruin and its duration, the law of large numbers, and the Central Limit Theorem.",
        problemIds: ["pr-031", "pr-038", "pr-047", "pr-048", "pr-092", "pr-049", "pr-050"],
      },
      {
        id: "algorithms-under-pressure",
        title: "Algorithms Under Pressure",
        blurb:
          "The algorithm half of a quant screen: binary search, fast exponentiation, maximum subarray, binomial coefficients, the median of two sorted arrays, and counting reverse pairs.",
        problemIds: ["al-001", "al-008", "al-017", "al-023", "al-037", "al-214"],
      },
    ],
  },

  {
    id: "thirty-day-full-curriculum",
    title: "30-Day Full Curriculum",
    description:
      "A month-long sampler that touches every category on the platform, roughly one sitting per day. You will meet vectors, derivatives, distributions, regressions, neural nets, algorithms, graphs, and information theory in a single sweep. Ideal if you are new and want to discover which track to commit to next.",
    estimatedHours: 30,
    slug: "thirty-day-full-curriculum",
    level: "Mixed",
    tags: ["full-curriculum", "sampler", "math", "machine-learning", "breadth"],
    goals: [
      "Sample every category with one focused sitting per day",
      "Build a mental map of the whole platform",
      "Finish with a synthesis week across maths, models, and evaluation",
    ],
    prerequisites: [],
    problemIds: ["la-011", "la-001", "ca-001", "st-001", "st-002", "pr-002", "la-025", "ml-008", "ml-017", "al-001", "st-004", "ml-010", "ml-001", "ml-003", "dl-001", "ds-001", "dl-016", "dl-003", "op-001", "ml-032", "dl-005", "cv-001", "nlp-001", "ts-001", "graph-001", "info-001", "pr-048", "nlp-003", "al-017", "op-010", "dl-087", "st-048", "ca-005"],
    stages: [
      {
        id: "week-1-math",
        title: "Week 1: Mathematical Language",
        blurb:
          "Start where every model starts: vectors, matrix products, cosine similarity, numerical derivatives, mean and variance, and expected value.",
        problemIds: ["la-011", "la-001", "ca-001", "st-001", "st-002", "pr-002", "la-025"],
      },
      {
        id: "week-2-data-and-models",
        title: "Week 2: Data and First Models",
        blurb:
          "Turn data into predictions: correlation, accuracy and MSE, linear regression, k-means, k-fold splits, and binary search as an algorithm warm-up.",
        problemIds: ["ml-008", "ml-017", "al-001", "st-004", "ml-010", "ml-001", "ml-003"],
      },
      {
        id: "week-3-deep-learning-and-optimization",
        title: "Week 3: Deep Learning and Optimization",
        blurb:
          "Neural networks and how they train: ReLU, stable softmax, one backprop pass, an SGD update, gradient descent, a stack simulation, and the k-means assignment step.",
        problemIds: ["dl-001", "ds-001", "dl-016", "dl-003", "op-001", "ml-032", "dl-005"],
      },
      {
        id: "week-4-breadth",
        title: "Week 4: Breadth Across Modalities",
        blurb:
          "Touch every remaining modality: grayscale conversion, tokenization, first differences, adjacency lists, self-information, and a probability classic.",
        problemIds: ["cv-001", "nlp-001", "ts-001", "graph-001", "info-001", "pr-048"],
      },
      {
        id: "week-5-synthesis",
        title: "Week 5: Synthesis",
        blurb:
          "Bring it together with a transformer encoder block, TF-IDF, bootstrap confidence intervals, maximum subarray, an Adam update, and the Hessian.",
        problemIds: ["nlp-003", "al-017", "op-010", "dl-087", "st-048", "ca-005"],
      },
    ],
  },

  {
    id: "fast-track-essentials",
    title: "Fast Track (Essentials)",
    description:
      "The shortest route to a working mental model of ML: twelve problems that cover what the rest of the platform builds on. In a single evening you will implement scaling, matrix products, a derivative, expectation, linear regression, softmax, gradient descent, and one backprop pass. Perfect for a first taste of DeepForge.",
    estimatedHours: 4,
    slug: "fast-track-essentials",
    level: "Beginner",
    tags: ["quick-start", "essentials", "math", "machine-learning"],
    goals: [
      "Cover the mathematics every ML interview assumes",
      "Fit your first regression and classify with softmax",
      "Run a gradient-descent step and one backprop pass",
    ],
    prerequisites: [],
    problemIds: ["la-004", "la-001", "ca-001", "pr-002", "st-002", "ml-023", "ml-017", "ml-008", "ml-001", "dl-003", "op-001", "la-025", "dl-001", "dl-005", "ml-003", "ml-010", "dl-016", "ml-020"],
    stages: [
      {
        id: "math-in-an-hour",
        title: "Math in an Hour",
        blurb:
          "The minimum mathematical kit: dot products, matrix multiplication, numerical derivatives, expected value, variance, and feature standardization.",
        problemIds: ["la-004", "la-001", "ca-001", "pr-002", "st-002", "ml-023"],
      },
      {
        id: "first-models",
        title: "First Models",
        blurb:
          "Put the maths to work: MSE, linear regression, numerically stable softmax, gradient descent, accuracy, and cosine similarity.",
        problemIds: ["ml-017", "ml-008", "ml-001", "dl-003", "op-001", "la-025"],
      },
      {
        id: "one-layer-deeper",
        title: "One Layer Deeper",
        blurb:
          "See how networks actually learn: ReLU, backprop, k-means, k-fold splits, an SGD weight update, and the R-squared score.",
        problemIds: ["dl-001", "dl-005", "ml-003", "ml-010", "dl-016", "ml-020"],
      },
    ],
  },

  {
    id: "generative-models-primer",
    title: "Generative Models Primer",
    description:
      "How models create images and text: VAEs, GANs, diffusion, and language-model sampling. You will implement reconstruction and KL losses, diffusion noise schedules, classifier-free guidance, and preference-optimization objectives. Best for learners who already know backprop and want the generative frontier.",
    estimatedHours: 12,
    slug: "generative-models-primer",
    level: "Advanced",
    tags: ["generative-models", "vae", "gans", "diffusion", "language-models"],
    goals: [
      "Derive VAE losses: reconstruction, KL, reparameterization, and ELBO",
      "Train GAN-style objectives and measure sample quality",
      "Implement diffusion forward processes, schedules, and DDIM sampling",
      "Understand language-model generation, preference optimization, and PEFT",
    ],
    prerequisites: ["deep-learning-essentials"],
    problemIds: ["dl-141", "dl-157", "dl-158", "dl-159", "dl-179", "dl-175", "dl-160", "dl-161", "dl-162", "dl-178", "dl-177", "dl-184", "dl-142", "dl-143", "dl-163", "dl-164", "dl-165", "dl-166", "dl-167", "dl-183", "dl-144", "dl-145", "dl-148", "dl-149", "dl-151", "dl-180", "dl-181", "dl-182"],
    stages: [
      {
        id: "autoencoders-and-vaes",
        title: "Autoencoders and VAEs",
        blurb:
          "Compress and reconstruct: VAE reconstruction loss, the KL term, reparameterization, beta-VAE loss, the ELBO, and a sparse-autoencoder objective.",
        problemIds: ["dl-141", "dl-157", "dl-158", "dl-159", "dl-179", "dl-175"],
      },
      {
        id: "gans-and-sample-quality",
        title: "GANs and Sample Quality",
        blurb:
          "Adversarial training and evaluation: GAN discriminator and generator losses, WGAN critic loss, Frechet distance, FID feature statistics, and contrastive divergence.",
        problemIds: ["dl-160", "dl-161", "dl-162", "dl-178", "dl-177", "dl-184"],
      },
      {
        id: "diffusion",
        title: "Diffusion Models",
        blurb:
          "Add noise, then learn to remove it: the linear beta schedule, U-Net downsample counts, forward steps, cumulative alpha bars, MSE loss, classifier-free guidance, time embeddings, and a DDIM step.",
        problemIds: ["dl-142", "dl-143", "dl-163", "dl-164", "dl-165", "dl-166", "dl-167", "dl-183"],
      },
      {
        id: "language-model-generation",
        title: "Language-Model Generation and Alignment",
        blurb:
          "Decode, sample, and align: causal LM shifts, span corruption, rejection sampling, self-consistency voting, DPO, GRPO advantage, PPO clipping, and LoRA.",
        problemIds: ["dl-144", "dl-145", "dl-148", "dl-149", "dl-151", "dl-180", "dl-181", "dl-182"],
      },
    ],
  },

  {
    id: "ranking-recommendation-systems",
    title: "Ranking & Recommendation Systems",
    description:
      "Search relevance and recommender systems, built from the retrieval stage to the ranking metrics. You will implement TF-IDF, inverted indexes, BM25, collaborative filtering, and NDCG from scratch. A strong fit for ML engineers working on feeds, search, or personalization.",
    estimatedHours: 9,
    slug: "ranking-recommendation-systems",
    level: "Intermediate",
    tags: ["ranking", "recommendation-systems", "retrieval", "evaluation"],
    goals: [
      "Build retrieval with TF-IDF, inverted indexes, and BM25",
      "Score rankings with precision@k, MAP, MRR, and NDCG",
      "Recommend with neighbourhood and matrix-factorization methods",
      "Blend signals with rank fusion and graph similarity",
    ],
    prerequisites: ["ml-from-scratch", "nlp-starter"],
    problemIds: ["ml-221", "ml-222", "ml-225", "nlp-037", "nlp-038", "graph-098", "graph-100", "nlp-003", "nlp-041", "nlp-042", "nlp-059", "graph-097", "nlp-040", "ml-102", "ml-224", "graph-027", "graph-085", "ml-223", "nlp-092", "graph-040", "ml-226", "ml-217", "ml-219", "nlp-248", "ml-218", "ml-220"],
    stages: [
      {
        id: "candidate-signals",
        title: "Candidate Signals",
        blurb:
          "The raw signals behind feed ranking: implicit-feedback confidence, precision at k, mean reciprocal rank, term frequency, inverse document frequency, and graph similarity scores.",
        problemIds: ["ml-221", "ml-222", "ml-225", "nlp-037", "nlp-038", "graph-098", "graph-100"],
      },
      {
        id: "retrieval",
        title: "Retrieval",
        blurb:
          "Find candidates fast: TF-IDF, inverted indexes, positional search, PMI collocations, Adamic-Adar scores, and BM25.",
        problemIds: ["nlp-003", "nlp-041", "nlp-042", "nlp-059", "graph-097", "nlp-040"],
      },
      {
        id: "ranking-metrics-and-graph-ranking",
        title: "Ranking Metrics and Graph Ranking",
        blurb:
          "Measure and rank: lift at k, mean average precision, NDCG, ROUGE-2, HITS hub and authority scores, Brandes betweenness, and PageRank to tolerance.",
        problemIds: ["ml-102", "ml-224", "graph-027", "graph-085", "ml-223", "nlp-092", "graph-040"],
      },
      {
        id: "collaborative-filtering",
        title: "Collaborative Filtering",
        blurb:
          "Learn user and item vectors: user-based and item-based prediction, matrix-factorization SGD, association lift, feature-crossing hashes, and weighted reciprocal-rank fusion.",
        problemIds: ["ml-226", "ml-217", "ml-219", "nlp-248", "ml-218", "ml-220"],
      },
    ],
  },

  {
    id: "llm-engineering",
    title: "LLM Engineering",
    description:
      "Build and operate language models end to end: tokenization, embeddings, transformer internals, decoding and serving, then retrieval-augmented generation and evaluation. Every stage is implemented in pure Python, from byte-level BPE counts to KV-cache sizing and nDCG. Take it after Deep Learning Essentials and NLP Starter.",
    estimatedHours: 7,
    slug: "llm-engineering",
    level: "Advanced",
    tags: ["llm", "nlp", "transformers", "rag", "evaluation", "inference"],
    goals: [
      "Tokenize and measure text with BPE, fertility, and vocabulary budgets",
      "Train and inspect embeddings, including negative sampling and pooling",
      "Build transformer internals: attention, norms, and gated activations",
      "Serve models with KV caches and decode with modern sampling strategies",
      "Evaluate RAG pipelines with retrieval and ranking metrics",
    ],
    prerequisites: ["deep-learning-essentials", "nlp-starter"],
    problemIds: ["nlp-096", "nlp-231", "nlp-234", "nlp-238", "nlp-239", "nlp-240", "nlp-241", "nlp-232", "nlp-233", "nlp-064", "nlp-152", "nlp-063", "nlp-065", "nlp-067", "nlp-151", "dl-209", "nlp-066", "nlp-072", "nlp-074", "nlp-049", "nlp-073", "nlp-075", "dl-376", "dl-372", "nlp-050", "nlp-076", "nlp-291", "dl-186", "dl-187", "nlp-077", "nlp-079", "nlp-080", "dl-075", "nlp-078", "nlp-293", "nlp-141", "nlp-142", "nlp-184", "nlp-185", "nlp-147", "nlp-148", "nlp-252", "st-241", "nlp-253", "dl-180"],
    stages: [
      {
        id: "tokenization-and-vocabulary",
        title: "Tokenization and Vocabulary",
        blurb:
          "Everything starts at the tokenizer: byte-level BPE token counts, pair frequencies, vocabulary growth and merge savings, WordPiece pieces, tokenizer fertility, characters per token, vocabulary coverage, special-token budgets, and chunk lengths.",
        problemIds: ["nlp-096", "nlp-231", "nlp-234", "nlp-238", "nlp-239", "nlp-240", "nlp-241", "nlp-232", "nlp-233"],
      },
      {
        id: "embeddings-and-representations",
        title: "Embeddings and Representations",
        blurb:
          "Tokens become vectors: skip-gram context pairs, CBOW averaging, negative-sampling probabilities, word2vec analogies, top-k cosine ranking, sentence mean pooling, whitening transforms, and rotary position application.",
        problemIds: ["nlp-064", "nlp-152", "nlp-063", "nlp-065", "nlp-067", "nlp-151", "dl-209", "nlp-066"],
      },
      {
        id: "transformer-internals",
        title: "Transformer Internals",
        blurb:
          "Inside the block: scaled attention scores, softmax weights, attention scaling factors, entropy and row sums, temperature, cross-attention, RMSNorm, and SwiGLU gating.",
        problemIds: ["nlp-072", "nlp-074", "nlp-049", "nlp-073", "nlp-075", "dl-376", "dl-372", "nlp-050", "nlp-076"],
      },
      {
        id: "decoding-and-serving",
        title: "Decoding and Serving",
        blurb:
          "Generate and serve: greedy decoding, two-step beam search, top-p and top-k filtering, temperature-adjusted entropy, repetition penalties, KV-cache appends and sizing, and continuous batching rounds.",
        problemIds: ["nlp-291", "dl-186", "dl-187", "nlp-077", "nlp-079", "nlp-080", "dl-075", "nlp-078", "nlp-293"],
      },
      {
        id: "rag-evaluation-and-alignment",
        title: "RAG, Evaluation, and Alignment",
        blurb:
          "Retrieve, rank, and judge: RAG top-k retrieval, dense passage scores, hybrid score fusion, reciprocal rank fusion, precision and recall at k, MRR, nDCG, expected calibration error, and DPO loss.",
        problemIds: ["nlp-141", "nlp-142", "nlp-184", "nlp-185", "nlp-147", "nlp-148", "nlp-252", "st-241", "nlp-253", "dl-180"],
      },
    ],
  },

  {
    id: "math-for-machine-learning",
    title: "Math for Machine Learning",
    description:
      "A single sequence for the mathematics ML actually uses: linear algebra first, then eigen-decomposition, then calculus, then probability and statistics. You implement every operation by hand, from dot products to Jacobians and t-statistics. Start here if you want one path that covers the whole mathematical toolkit.",
    estimatedHours: 5,
    slug: "math-for-machine-learning",
    level: "Beginner",
    tags: ["linear-algebra", "calculus", "probability", "statistics", "math"],
    goals: [
      "Operate on vectors and matrices the way models do",
      "Reason about rank, eigenvalues, and orthogonalization",
      "Compute gradients, Jacobians, and Hessians by hand",
      "Use distributions, expectation, and correlation in modeling",
    ],
    prerequisites: [],
    problemIds: ["la-011", "la-012", "la-004", "la-006", "la-001", "la-002", "la-003", "la-020", "la-025", "la-038", "la-083", "la-040", "la-117", "la-049", "la-050", "ca-001", "ca-006", "ca-015", "ca-002", "ca-022", "ca-025", "ca-004", "ca-005", "pr-002", "pr-005", "pr-001", "pr-036", "st-001", "st-002", "st-004", "st-037"],
    stages: [
      {
        id: "vectors-and-matrix-algebra",
        title: "Vectors and Matrix Algebra",
        blurb:
          "The linear algebra ML runs on: vector arithmetic, dot products, norms, matrix transpose and multiplication, trace, and Hadamard products.",
        problemIds: ["la-011", "la-012", "la-004", "la-006", "la-001", "la-002", "la-003", "la-020"],
      },
      {
        id: "eigen-and-orthogonality",
        title: "Eigenvalues and Orthogonality",
        blurb:
          "Why PCA and spectral methods work: cosine similarity, rank via row reduction, eigenvalues and eigenvectors, orthonormalization, power iteration, and Rayleigh quotients.",
        problemIds: ["la-025", "la-038", "la-083", "la-040", "la-117", "la-049", "la-050"],
      },
      {
        id: "calculus-and-gradients",
        title: "Calculus and Gradients",
        blurb:
          "How models improve: numerical derivatives and gradients, directional derivatives, Newton steps, partial derivatives of quadratic forms, and full Jacobians and Hessians.",
        problemIds: ["ca-001", "ca-006", "ca-015", "ca-002", "ca-022", "ca-025", "ca-004", "ca-005"],
      },
      {
        id: "probability-and-statistics",
        title: "Probability and Statistics",
        blurb:
          "The modeling half: expected value and variance, Bayes' rule, the normal CDF, means and variances, Pearson correlation, and one-sample t-statistics.",
        problemIds: ["pr-002", "pr-005", "pr-001", "pr-036", "st-001", "st-002", "st-004", "st-037"],
      },
    ],
  },

  {
    id: "time-series-and-forecasting",
    title: "Time Series & Forecasting",
    description:
      "The applied forecasting workflow, from raw timestamps to monitored production forecasts. You will engineer lag and rolling features, establish baselines, fit smoothing and seasonal models, then validate with rolling-origin backtests and decay monitoring. Complements Time Series Forecasting with a stronger machine-learning and ops flavour.",
    estimatedHours: 5,
    slug: "time-series-and-forecasting",
    level: "Intermediate",
    tags: ["time-series", "forecasting", "feature-engineering", "backtesting", "ml"],
    goals: [
      "Engineer lag, rolling, and calendar features from raw series",
      "Establish baselines and score forecasts with robust metrics",
      "Fit exponential smoothing and seasonal models",
      "Validate forecasts with backtests and monitor production decay",
    ],
    prerequisites: ["statistics-mastery"],
    problemIds: ["ts-003", "ts-004", "ts-017", "ts-240", "ts-238", "ts-239", "ts-259", "ts-260", "ts-006", "ts-226", "ts-227", "ts-228", "ts-229", "ts-011", "ts-012", "ts-163", "ts-007", "ts-027", "ts-021", "ts-024", "ts-026", "ts-037", "ts-294", "ts-161", "ts-162", "ts-268", "ts-261", "ts-265", "ts-267", "ts-042", "ts-220"],
    stages: [
      {
        id: "features-and-windows",
        title: "Features and Windows",
        blurb:
          "Turn a series into supervised rows: the lag operator, lag-k series, rolling means and stats, windowing counts, series padding, and Fourier and time-encoding features.",
        problemIds: ["ts-003", "ts-004", "ts-017", "ts-240", "ts-238", "ts-239", "ts-259", "ts-260"],
      },
      {
        id: "baselines-and-error-metrics",
        title: "Baselines and Error Metrics",
        blurb:
          "Never model before you have a baseline: seasonal naive forecasts, persistence, moving-average and exponential baselines, MAE, RMSE, and the seasonal MASE denominator.",
        problemIds: ["ts-006", "ts-226", "ts-227", "ts-228", "ts-229", "ts-011", "ts-012", "ts-163"],
      },
      {
        id: "smoothing-and-decomposition",
        title: "Smoothing and Decomposition",
        blurb:
          "Separate level, trend, and season: log transforms, detrending by differencing, simple and double exponential smoothing, seasonal indices, Holt-Winters, and STL remainder values.",
        problemIds: ["ts-007", "ts-027", "ts-021", "ts-024", "ts-026", "ts-037", "ts-294"],
      },
      {
        id: "backtesting-and-production",
        title: "Backtesting and Production",
        blurb:
          "Trust the forecast in production: rolling-origin evaluation counts, expanding training sizes, backtest window ranges, retrain cadence, performance-decay monitoring, online updates, Theil's U, and Diebold-Mariano statistics.",
        problemIds: ["ts-161", "ts-162", "ts-268", "ts-261", "ts-265", "ts-267", "ts-042", "ts-220"],
      },
    ],
  },

  {
    id: "graph-machine-learning",
    title: "Graph Machine Learning",
    description:
      "Representation learning on graphs: message passing, pooling, and normalized adjacency first, then centrality and similarity for link prediction, then embeddings with random walks, LINE, and WL kernels. Finish by training GNN-style layers and finding communities spectrally. Take it after Graph Algorithms and Deep Learning Essentials.",
    estimatedHours: 7,
    slug: "graph-machine-learning",
    level: "Advanced",
    tags: ["graph-neural-networks", "embeddings", "spectral-methods", "representation-learning"],
    goals: [
      "Turn graphs into tensors with adjacency, message passing, and pooling",
      "Measure node importance and similarity for link prediction",
      "Learn node embeddings with random walks, LINE, and WL kernels",
      "Train GNN-style layers and detect communities spectrally",
    ],
    prerequisites: ["graph-algorithms", "deep-learning-essentials"],
    problemIds: ["graph-001", "graph-002", "graph-181", "graph-182", "graph-183", "graph-184", "graph-190", "graph-192", "graph-009", "graph-011", "graph-027", "graph-097", "graph-098", "graph-099", "graph-101", "graph-203", "graph-204", "graph-205", "graph-245", "graph-246", "graph-210", "graph-211", "graph-197", "graph-198", "graph-199", "graph-200", "graph-201", "graph-202", "graph-230", "graph-261", "graph-079", "graph-132", "graph-218", "graph-089", "graph-112", "graph-131"],
    stages: [
      {
        id: "graph-data-and-message-passing",
        title: "Graph Data and Message Passing",
        blurb:
          "The computational primitives: building adjacency lists and matrices, message-passing means, sum and max pooling, readout means, and GCN-style adjacency normalization.",
        problemIds: ["graph-001", "graph-002", "graph-181", "graph-182", "graph-183", "graph-184", "graph-190", "graph-192"],
      },
      {
        id: "centrality-and-similarity",
        title: "Centrality and Similarity",
        blurb:
          "Score nodes and edges: degree centrality, PageRank sweeps and convergence, Adamic-Adar and Jaccard scores, cosine similarity, and preferential attachment for link prediction.",
        problemIds: ["graph-009", "graph-011", "graph-027", "graph-097", "graph-098", "graph-099", "graph-101"],
      },
      {
        id: "node-embeddings",
        title: "Node Embeddings",
        blurb:
          "Learn representations: random-walk negative sampling, Node2Vec transition probabilities, metapath counts, LINE first- and second-order losses, and Weisfeiler-Lehman hashes and kernels.",
        problemIds: ["graph-203", "graph-204", "graph-205", "graph-245", "graph-246", "graph-210", "graph-211"],
      },
      {
        id: "gnn-training",
        title: "GNN Training",
        blurb:
          "Train and evaluate: node-classification accuracy, hits@k, attention aggregation, a full GCN layer output, graph-autoencoder and contrastive losses, GIN sum-versus-mean checks, and graph-transformer positional encodings.",
        problemIds: ["graph-197", "graph-198", "graph-199", "graph-200", "graph-201", "graph-202", "graph-230", "graph-261"],
      },
      {
        id: "spectral-and-community",
        title: "Spectral Methods and Communities",
        blurb:
          "Global structure: Laplacian construction, spectral clustering with Fiedler signs, spectral embeddings, modularity, label propagation, and Louvain modularity gain.",
        problemIds: ["graph-079", "graph-132", "graph-218", "graph-089", "graph-112", "graph-131"],
      },
    ],
  },
];
