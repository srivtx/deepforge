export interface Concept {
  id: string;
  title: string;
  category: string;
  blurb: string;
  workedExampleId: string;
  workedSteps: string[];
  practiceIds: [string, string, string];
  codeProblemIds?: string[];
  prerequisites: string[];
}

export const CONCEPTS: Concept[] = [
  {
    id: "la-vectors",
    title: "Vectors, Norms & Projection",
    category: "Linear Algebra",
    blurb:
      "Compute dot products, measure the length of vectors and matrices, and find how much of one vector lies along another.",
    workedExampleId: "pp-002",
    workedSteps: [
      "Multiply matching components: 1*4 = 4, 2*(-5) = -10, and 3*6 = 18.",
      "Add the three products: 4 + (-10) + 18.",
      "4 + (-10) = -6, then -6 + 18 = 12. The dot product is 12.",
    ],
    practiceIds: ["pp-002", "pp-006", "pp-011"],
    codeProblemIds: ["la-004", "la-006", "la-007"],
    prerequisites: [],
  },
  {
    id: "la-matrix-ops",
    title: "Matrix Products, Trace & Rank",
    category: "Linear Algebra",
    blurb:
      "Multiply matrices, read off the trace, track how shapes combine, and detect when rows collapse to a lower rank.",
    workedExampleId: "pp-003",
    workedSteps: [
      "First row of A times first column of B: (1)(5) + (2)(7) = 19, so the top-left entry of AB is 19.",
      "First row of A times second column of B: (1)(6) + (2)(8) = 22.",
      "Second row of A times first column of B: (3)(5) + (4)(7) = 43.",
      "Second row of A times second column of B: (3)(6) + (4)(8) = 50.",
      "Trace is the sum of the diagonal: 19 + 50 = 69.",
    ],
    practiceIds: ["pp-003", "pp-012", "pp-007"],
    codeProblemIds: ["la-001", "la-003", "la-038"],
    prerequisites: [],
  },
  {
    id: "la-determinants",
    title: "Determinants",
    category: "Linear Algebra",
    blurb:
      "Evaluate 2x2 and 3x3 determinants by hand and use them to reason about orthogonal matrices.",
    workedExampleId: "pp-001",
    workedSteps: [
      "For [[a, b], [c, d]] the determinant is ad - bc.",
      "Here a = 2, b = 1, c = 3, d = 4, so ad = 2*4 = 8 and bc = 1*3 = 3.",
      "Subtract: 8 - 3 = 5.",
    ],
    practiceIds: ["pp-001", "pp-009", "pp-010"],
    codeProblemIds: ["la-008", "la-009", "la-041"],
    prerequisites: ["la-matrix-ops"],
  },
  {
    id: "la-eigen-inverse",
    title: "Inverses & Eigenvalues",
    category: "Linear Algebra",
    blurb:
      "Invert 2x2 matrices, recognize orthogonal matrices, and solve the characteristic equation for eigenvalues.",
    workedExampleId: "pp-008",
    workedSteps: [
      "For A = [[a, b], [c, d]], first compute the determinant: det(A) = ad - bc = 2*1 - 1*1 = 1.",
      "Build the adjugate by swapping a and d and negating b and c: [[d, -b], [-c, a]] = [[1, -1], [-1, 2]].",
      "Divide every entry by det(A). Since det(A) = 1, the inverse is A^-1 = [[1, -1], [-1, 2]].",
    ],
    practiceIds: ["pp-008", "pp-004", "pp-005"],
    codeProblemIds: ["la-010", "la-033", "la-040", "la-050"],
    prerequisites: ["la-determinants"],
  },
  {
    id: "calc-derivatives",
    title: "Basic Derivatives",
    category: "Calculus",
    blurb:
      "Differentiate powers, logs, and trigonometric functions, then evaluate the derivative at a point.",
    workedExampleId: "pp-013",
    workedSteps: [
      "Apply the power rule: d/dx x^3 = 3x^2.",
      "Substitute x = 2: 3*(2)^2 = 3*4.",
      "Simplify: 3*4 = 12.",
    ],
    practiceIds: ["pp-013", "pp-014", "pp-020"],
    codeProblemIds: ["ca-001", "ca-006"],
    prerequisites: [],
  },
  {
    id: "calc-chain-rule",
    title: "Chain Rule & Higher Derivatives",
    category: "Calculus",
    blurb:
      "Differentiate composed functions with the chain rule and take second derivatives.",
    workedExampleId: "pp-017",
    workedSteps: [
      "Treat e^(2x) as e^u with inner function u = 2x.",
      "The derivative of e^u is e^u, and the inner derivative is du/dx = 2.",
      "The chain rule multiplies them: d/dx e^(2x) = 2e^(2x).",
    ],
    practiceIds: ["pp-017", "pp-022", "pp-018"],
    codeProblemIds: ["ca-029", "ca-007"],
    prerequisites: ["calc-derivatives"],
  },
  {
    id: "calc-integrals",
    title: "Definite Integrals",
    category: "Calculus",
    blurb:
      "Find antiderivatives and evaluate definite integrals, including one integration by parts.",
    workedExampleId: "pp-015",
    workedSteps: [
      "Find the antiderivative of 3x^2 using the power rule for integrals: x^3.",
      "Evaluate at the upper limit: 1^3 = 1.",
      "Evaluate at the lower limit: 0^3 = 0.",
      "Subtract: 1 - 0 = 1.",
    ],
    practiceIds: ["pp-015", "pp-016", "pp-019"],
    codeProblemIds: ["ca-003", "ca-008", "ca-010"],
    prerequisites: ["calc-derivatives"],
  },
  {
    id: "stats-central",
    title: "Mean, Median & Mode",
    category: "Statistics",
    blurb:
      "Summarize a data set with its three classic centers: the mean, the median, and the most frequent value.",
    workedExampleId: "pp-023",
    workedSteps: [
      "Add the values: 2 + 4 + 4 + 4 + 5 + 5 + 7 + 9 = 40.",
      "Count the values: n = 8.",
      "Mean = sum / n = 40 / 8 = 5.",
    ],
    practiceIds: ["pp-023", "pp-027", "pp-031"],
    codeProblemIds: ["st-001"],
    prerequisites: [],
  },
  {
    id: "stats-spread",
    title: "Variance & Spread",
    category: "Statistics",
    blurb:
      "Measure spread with population and sample variance, and understand why Bessel's correction uses n - 1.",
    workedExampleId: "pp-024",
    workedSteps: [
      "Find the mean: (1 + 2 + 3 + 4 + 5) / 5 = 3.",
      "Squared deviations from the mean: (1-3)^2 = 4, (2-3)^2 = 1, (3-3)^2 = 0, (4-3)^2 = 1, (5-3)^2 = 4.",
      "Sum them: 4 + 1 + 0 + 1 + 4 = 10.",
      "Population variance divides by n = 5: 10 / 5 = 2.",
    ],
    practiceIds: ["pp-024", "pp-025", "pp-029"],
    codeProblemIds: ["st-002"],
    prerequisites: ["stats-central"],
  },
  {
    id: "stats-correlation",
    title: "Covariance, Correlation & z-Scores",
    category: "Statistics",
    blurb:
      "Quantify how two variables move together, standardize individual values, and interpret a correlation of zero.",
    workedExampleId: "pp-030",
    workedSteps: [
      "Compute the means: x_bar = (1 + 2 + 3) / 3 = 2 and y_bar = (2 + 4 + 5) / 3 = 11/3.",
      "Products of deviations: (-1)(-5/3) = 5/3, (0)(1/3) = 0, (1)(4/3) = 4/3.",
      "Sum of products: 5/3 + 0 + 4/3 = 3.",
      "The sample covariance divides by n - 1 = 2: 3 / 2 = 1.5.",
    ],
    practiceIds: ["pp-030", "pp-026", "pp-028"],
    codeProblemIds: ["st-003", "st-004"],
    prerequisites: ["stats-spread"],
  },
  {
    id: "prob-basics",
    title: "Probability & Expectation",
    category: "Probability",
    blurb:
      "Count equally likely outcomes, use complements, and compute expected values for simple random experiments.",
    workedExampleId: "pp-032",
    workedSteps: [
      "Each die has 6 outcomes, so there are 6*6 = 36 equally likely ordered pairs.",
      "Count the pairs that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) gives 6 favorable pairs.",
      "Probability = 6/36 = 1/6, which is about 0.1667.",
    ],
    practiceIds: ["pp-032", "pp-033", "pp-038"],
    codeProblemIds: ["pr-002"],
    prerequisites: [],
  },
  {
    id: "prob-counting",
    title: "Counting & Independent Events",
    category: "Probability",
    blurb:
      "Use binomial coefficients, the independence multiplication rule, and expected waiting times in counting problems.",
    workedExampleId: "pp-035",
    workedSteps: [
      "Use the binomial coefficient C(8, 3) = 8! / (3! * 5!).",
      "Cancel 5! with the tail of 8! to get (8 * 7 * 6) / 3!.",
      "Compute the denominator 3! = 3 * 2 * 1 = 6.",
      "Divide: (8 * 7 * 6) / 6 = 8 * 7 = 56.",
    ],
    practiceIds: ["pp-035", "pp-036", "pp-039"],
    codeProblemIds: ["pr-003", "pr-004"],
    prerequisites: ["prob-basics"],
  },
  {
    id: "prob-distributions",
    title: "Variance & Distributions",
    category: "Probability",
    blurb:
      "Work with binomial and geometric variables, and add variances of independent random variables.",
    workedExampleId: "pp-037",
    workedSteps: [
      "Single die: E[X] = 3.5 and E[X^2] = (1 + 4 + 9 + 16 + 25 + 36) / 6 = 91/6.",
      "Var(X) = E[X^2] - (E[X])^2 = 91/6 - 49/4 = 35/12.",
      "The two dice are independent, so their variances add: Var(X + Y) = 2 * 35/12.",
      "Simplify: 35/6 = 5.8333...",
    ],
    practiceIds: ["pp-037", "pp-040", "pp-041"],
    codeProblemIds: ["pr-005"],
    prerequisites: ["prob-basics"],
  },
  {
    id: "ml-metrics",
    title: "Precision, Recall & F1",
    category: "ML Fundamentals",
    blurb:
      "Evaluate classifiers with precision, recall, and their harmonic mean.",
    workedExampleId: "pp-043",
    workedSteps: [
      "Precision = TP / (TP + FP).",
      "Substitute the counts: 40 / (40 + 10).",
      "40 / 50 = 0.8.",
    ],
    practiceIds: ["pp-043", "pp-044", "pp-045"],
    codeProblemIds: ["ml-009", "ml-015", "ml-016"],
    prerequisites: [],
  },
  {
    id: "ml-generalization",
    title: "Regularization & Generalization",
    category: "ML Fundamentals",
    blurb:
      "Understand overfitting, the bias-variance tradeoff, and how L1 regularization creates sparse models.",
    workedExampleId: "pp-046",
    workedSteps: [
      "The expected squared test error splits into three additive pieces.",
      "Bias^2 measures how far the average prediction is from the true function.",
      "Variance measures how much predictions move around across different training sets.",
      "Irreducible noise is the error floor that no model can remove.",
      "So expected error = bias^2 + variance + irreducible noise.",
    ],
    practiceIds: ["pp-046", "pp-042", "pp-050"],
    codeProblemIds: ["ml-013", "ml-020"],
    prerequisites: [],
  },
  {
    id: "ml-objectives",
    title: "Losses & Gradients",
    category: "ML Fundamentals",
    blurb:
      "Compute mean squared error, differentiate it with respect to a weight, and state the k-means objective.",
    workedExampleId: "pp-049",
    workedSteps: [
      "Errors are prediction minus target: 2-2 = 0, 3-5 = -2, 4-3 = 1.",
      "Square each error: 0, 4, 1.",
      "Sum the squared errors: 0 + 4 + 1 = 5.",
      "MSE is their mean: 5 / 3 = 1.6667.",
    ],
    practiceIds: ["pp-049", "pp-048", "pp-051"],
    codeProblemIds: ["ml-001", "ml-003", "ml-012", "ml-017"],
    prerequisites: [],
  },
  {
    id: "ml-probabilistic",
    title: "Sigmoid, Bayes & Entropy",
    category: "ML Fundamentals",
    blurb:
      "Use probability inside models: sigmoid outputs, Bayes' rule for a positive test, and entropy as uncertainty.",
    workedExampleId: "pp-034",
    workedSteps: [
      "Prior and sensitivity give the true-positive mass: P(D) * P(+|D) = 0.01 * 0.99 = 0.0099.",
      "The healthy share is 0.99 and the false-positive rate is 5%: 0.99 * 0.05 = 0.0495.",
      "Total probability of a positive test: 0.0099 + 0.0495 = 0.0594.",
      "Bayes' rule: P(D|+) = 0.0099 / 0.0594 = 1/6, about 0.167.",
    ],
    practiceIds: ["pp-034", "pp-047", "pp-060"],
    codeProblemIds: ["ml-002", "ml-037", "ml-038", "ml-006"],
    prerequisites: [],
  },
  {
    id: "opt-foundations",
    title: "Minima, Convexity & Limits",
    category: "Optimization",
    blurb:
      "Locate minima, test convexity with second derivatives, and evaluate the limit that shows up throughout optimization.",
    workedExampleId: "pp-053",
    workedSteps: [
      "The expression (x - 3)^2 is a square, so it is never negative.",
      "It is smallest when x - 3 = 0, which gives x = 3.",
      "At x = 3 the function value is 0 + 7 = 7, the global minimum.",
    ],
    practiceIds: ["pp-053", "pp-021", "pp-055"],
    codeProblemIds: ["ca-005", "ca-035"],
    prerequisites: [],
  },
  {
    id: "opt-methods",
    title: "Iterative Methods & Step Sizes",
    category: "Optimization",
    blurb:
      "Take a gradient descent update, run one Newton step, and find the step-size bound set by the curvature.",
    workedExampleId: "pp-054",
    workedSteps: [
      "Write f(x) = x^2 - 2 and f'(x) = 2x.",
      "Evaluate at x0 = 1: f(1) = 1 - 2 = -1 and f'(1) = 2.",
      "Apply the Newton step x1 = x0 - f(x0)/f'(x0) = 1 - (-1)/2.",
      "Simplify: 1 + 0.5 = 1.5.",
    ],
    practiceIds: ["pp-054", "pp-052", "pp-056"],
    codeProblemIds: ["op-001", "ca-022"],
    prerequisites: ["opt-foundations"],
  },
  {
    id: "info-entropy",
    title: "Entropy & KL Divergence",
    category: "Information Theory",
    blurb:
      "Measure uncertainty in bits for coins and uniform distributions, and reason about KL divergence.",
    workedExampleId: "pp-057",
    workedSteps: [
      "Shannon entropy is H = -sum of p*log2(p).",
      "A fair coin has two outcomes with p = 1/2: H = -(1/2)log2(1/2) - (1/2)log2(1/2).",
      "log2(1/2) = -1, so both terms contribute -(-1/2) = 1/2.",
      "H = 1/2 + 1/2 = 1 bit.",
    ],
    practiceIds: ["pp-057", "pp-058", "pp-059"],
    codeProblemIds: ["info-002", "info-004", "info-013"],
    prerequisites: [],
  },
];
