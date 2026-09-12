export interface PenPaperProblem {
  id: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options?: string[];
  answer: string | number;
  tolerance?: number;
  explanation: string;
  hint?: string;
}

export const PENPAPER_PROBLEMS: PenPaperProblem[] = [
  {
    id: "pp-001",
    category: "Linear Algebra",
    difficulty: "Easy",
    question: "What is the determinant of the 2x2 matrix [[2, 1], [3, 4]]?",
    options: ["5", "-5", "11", "8"],
    answer: "5",
    explanation:
      "For [[a, b], [c, d]] the determinant is ad - bc = (2)(4) - (1)(3) = 8 - 3 = 5.",
    hint: "For a 2x2 matrix use ad - bc.",
  },
  {
    id: "pp-002",
    category: "Linear Algebra",
    difficulty: "Easy",
    question: "What is the dot product of u = [1, 2, 3] and v = [4, -5, 6]?",
    answer: 12,
    explanation:
      "Multiply componentwise and add: 1*4 + 2*(-5) + 3*6 = 4 - 10 + 18 = 12.",
    hint: "Multiply matching components, then sum the results.",
  },
  {
    id: "pp-003",
    category: "Linear Algebra",
    difficulty: "Medium",
    question:
      "For A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]], what is the trace of AB?",
    options: ["69", "50", "19", "75"],
    answer: "69",
    explanation:
      "AB = [[19, 22], [43, 50]], and the trace is the sum of the diagonal entries: 19 + 50 = 69.",
    hint: "Compute AB first, then add its diagonal entries.",
  },
  {
    id: "pp-004",
    category: "Linear Algebra",
    difficulty: "Easy",
    question: "Which of these matrices is orthogonal?",
    options: [
      "[[0, 1], [1, 0]]",
      "[[1, 1], [0, 1]]",
      "[[2, 0], [0, 2]]",
      "[[1, 2], [2, 1]]",
    ],
    answer: "[[0, 1], [1, 0]]",
    explanation:
      "A matrix is orthogonal when its columns are orthonormal, so A^T A = I. For [[0, 1], [1, 0]] the columns (0, 1) and (1, 0) are unit length and perpendicular.",
    hint: "Check whether the columns have length 1 and are perpendicular.",
  },
  {
    id: "pp-005",
    category: "Linear Algebra",
    difficulty: "Medium",
    question: "What is the largest eigenvalue of [[4, 2], [1, 3]]?",
    answer: 5,
    explanation:
      "det(A - lambda I) = (4 - lambda)(3 - lambda) - 2 = lambda^2 - 7 lambda + 10 = (lambda - 5)(lambda - 2), so the eigenvalues are 5 and 2.",
    hint: "Solve the characteristic equation det(A - lambda I) = 0.",
  },
  {
    id: "pp-006",
    category: "Linear Algebra",
    difficulty: "Medium",
    question:
      "What is the Frobenius norm of [[1, 2], [3, 4]]? Give a decimal answer.",
    answer: 5.477225575051661,
    tolerance: 0.0001,
    explanation:
      "The Frobenius norm is the square root of the sum of squared entries: sqrt(1 + 4 + 9 + 16) = sqrt(30) = 5.4772...",
    hint: "Square every entry, sum, then take the square root.",
  },
  {
    id: "pp-007",
    category: "Linear Algebra",
    difficulty: "Medium",
    question: "What is the rank of the matrix [[1, 2], [2, 4]]?",
    options: ["1", "2", "0", "4"],
    answer: "1",
    explanation:
      "The second row is 2 times the first, so the rows are linearly dependent and the rank is 1.",
    hint: "Are the two rows multiples of each other?",
  },
  {
    id: "pp-008",
    category: "Linear Algebra",
    difficulty: "Hard",
    question: "What is the inverse of A = [[2, 1], [1, 1]]?",
    options: [
      "[[1, -1], [-1, 2]]",
      "[[1, 1], [1, 2]]",
      "[[2, -1], [-1, 1]]",
      "[[-1, 1], [1, -2]]",
    ],
    answer: "[[1, -1], [-1, 2]]",
    explanation:
      "det(A) = 2*1 - 1*1 = 1, so A^-1 = (1/det) [[d, -b], [-c, a]] = [[1, -1], [-1, 2]].",
    hint: "For 2x2 use the adjugate formula, swapping a and d and negating b and c.",
  },
  {
    id: "pp-009",
    category: "Linear Algebra",
    difficulty: "Medium",
    question:
      "What is the determinant of [[1, 2, 3], [4, 5, 6], [7, 8, 10]]?",
    answer: -3,
    explanation:
      "Expanding along the first row: 1*(5*10 - 6*8) - 2*(4*10 - 6*7) + 3*(4*8 - 5*7) = 1*2 - 2*(-2) + 3*(-3) = -3.",
    hint: "Expand along the first row using 2x2 minors.",
  },
  {
    id: "pp-010",
    category: "Linear Algebra",
    difficulty: "Easy",
    question:
      "What are the possible values of the determinant of an orthogonal matrix?",
    options: ["1 or -1", "0", "1 only", "Any real number"],
    answer: "1 or -1",
    explanation:
      "From A^T A = I we get det(A)^2 = det(I) = 1, so det(A) is either 1 or -1.",
    hint: "Take determinants on both sides of A^T A = I.",
  },
  {
    id: "pp-011",
    category: "Linear Algebra",
    difficulty: "Hard",
    question:
      "What is the Euclidean norm of the projection of v = [1, 2, 2] onto u = [1, 1, 0]? Give a decimal answer.",
    answer: 2.121320343559643,
    tolerance: 0.0001,
    explanation:
      "proj_u(v) = (v.u / u.u) u = (3/2)[1, 1, 0], whose norm is (3/2)*sqrt(2) = 2.1213...",
    hint: "First find the scalar v.u / u.u, then scale u and take its length.",
  },
  {
    id: "pp-012",
    category: "Linear Algebra",
    difficulty: "Medium",
    question: "If A is 2x3 and B is 3x5, what is the shape of AB?",
    options: ["2 x 5", "3 x 3", "2 x 3", "5 x 2"],
    answer: "2 x 5",
    explanation:
      "The product keeps the outer dimensions: rows of A by columns of B, so AB is 2x5.",
    hint: "Inner dimensions must match and disappear; outer dimensions survive.",
  },
  {
    id: "pp-013",
    category: "Calculus",
    difficulty: "Easy",
    question: "What is the value of d/dx (x^3) at x = 2?",
    answer: 12,
    explanation: "d/dx x^3 = 3x^2, and 3*(2)^2 = 12.",
    hint: "Use the power rule, then substitute x = 2.",
  },
  {
    id: "pp-014",
    category: "Calculus",
    difficulty: "Easy",
    question: "What is the value of d/dx ln(x) at x = e? Give a decimal answer.",
    answer: 0.36787944117144233,
    tolerance: 0.0001,
    explanation: "d/dx ln(x) = 1/x, so at x = e the value is 1/e = 0.367879...",
    hint: "The derivative of ln(x) is 1/x.",
  },
  {
    id: "pp-015",
    category: "Calculus",
    difficulty: "Medium",
    question: "What is the integral of 3x^2 from x = 0 to x = 1?",
    answer: 1,
    explanation:
      "The antiderivative is x^3, so the definite integral is 1^3 - 0^3 = 1.",
    hint: "The antiderivative of 3x^2 is x^3.",
  },
  {
    id: "pp-016",
    category: "Calculus",
    difficulty: "Medium",
    question: "What is the integral of sin(x) from x = 0 to x = pi?",
    answer: 2,
    explanation:
      "The antiderivative of sin(x) is -cos(x), so the integral is -cos(pi) - (-cos(0)) = 1 + 1 = 2.",
    hint: "The antiderivative of sin(x) is -cos(x).",
  },
  {
    id: "pp-017",
    category: "Calculus",
    difficulty: "Medium",
    question: "What is the derivative of e^(2x)?",
    options: ["2e^(2x)", "e^(2x)", "2e^x", "e^(2x) / 2"],
    answer: "2e^(2x)",
    explanation:
      "The chain rule gives d/dx e^(2x) = e^(2x) * d/dx(2x) = 2e^(2x).",
    hint: "Differentiate the exponent and bring it down as a factor.",
  },
  {
    id: "pp-018",
    category: "Calculus",
    difficulty: "Hard",
    question: "For f(x) = x^4, what is f''(1)?",
    answer: 12,
    explanation: "f'(x) = 4x^3 and f''(x) = 12x^2, so f''(1) = 12.",
    hint: "Differentiate twice, then plug in x = 1.",
  },
  {
    id: "pp-019",
    category: "Calculus",
    difficulty: "Medium",
    question: "What is the integral of x*e^x from x = 0 to x = 1?",
    answer: 1,
    explanation:
      "Integration by parts gives [x e^x - e^x] from 0 to 1 = (e - e) - (0 - 1) = 1.",
    hint: "Integrate by parts with u = x and dv = e^x dx.",
  },
  {
    id: "pp-020",
    category: "Calculus",
    difficulty: "Easy",
    question: "What is the derivative of tan(x)?",
    options: ["sec^2(x)", "sec(x) tan(x)", "-sec^2(x)", "cos^2(x)"],
    answer: "sec^2(x)",
    explanation:
      "d/dx tan(x) = sec^2(x), which also equals 1 + tan^2(x).",
    hint: "This is a standard derivative worth memorizing.",
  },
  {
    id: "pp-021",
    category: "Calculus",
    difficulty: "Hard",
    question: "What is the limit of (1 - cos(x)) / x^2 as x goes to 0?",
    options: ["1/2", "1", "0", "2"],
    answer: "1/2",
    explanation:
      "Using 1 - cos(x) ~ x^2/2 near 0, the ratio tends to 1/2. L'Hopital applied twice also gives 1/2.",
    hint: "Use the small-angle approximation or apply L'Hopital twice.",
  },
  {
    id: "pp-022",
    category: "Calculus",
    difficulty: "Medium",
    question: "What is the derivative of ln(3x + 1)?",
    options: ["3 / (3x + 1)", "1 / (3x + 1)", "3x / (3x + 1)", "1 / (3x)"],
    answer: "3 / (3x + 1)",
    explanation:
      "Chain rule: d/dx ln(3x + 1) = (1/(3x + 1)) * 3 = 3/(3x + 1).",
    hint: "Differentiate the inside function and divide by the inside function.",
  },
  {
    id: "pp-023",
    category: "Statistics",
    difficulty: "Easy",
    question: "What is the mean of the numbers 2, 4, 4, 4, 5, 5, 7, 9?",
    answer: 5,
    explanation: "The sum is 40 and there are 8 values, so the mean is 40/8 = 5.",
    hint: "Add all values, then divide by how many there are.",
  },
  {
    id: "pp-024",
    category: "Statistics",
    difficulty: "Easy",
    question: "What is the population variance of 1, 2, 3, 4, 5?",
    answer: 2,
    explanation:
      "The mean is 3. The squared deviations are 4, 1, 0, 1, 4, which sum to 10; dividing by n = 5 gives 2.",
    hint: "Average the squared deviations from the mean.",
  },
  {
    id: "pp-025",
    category: "Statistics",
    difficulty: "Medium",
    question:
      "What is the sample variance of 1, 2, 3, 4, 5 (dividing by n - 1)?",
    answer: 2.5,
    explanation:
      "The mean is 3 and the squared deviations sum to 10. Dividing by n - 1 = 4 gives 10/4 = 2.5.",
    hint: "Bessel's correction: divide by n - 1 instead of n.",
  },
  {
    id: "pp-026",
    category: "Statistics",
    difficulty: "Medium",
    question:
      "The Pearson correlation coefficient between two variables is 0. What does this mean?",
    options: [
      "There is no linear association between them",
      "The variables are independent",
      "One variable causes the other",
      "The regression slope is 1",
    ],
    answer: "There is no linear association between them",
    explanation:
      "Correlation measures linear association only. A value of 0 says there is no linear trend, though a non-linear relationship or dependence may still exist.",
    hint: "Correlation detects straight-line trends, not every kind of relationship.",
  },
  {
    id: "pp-027",
    category: "Statistics",
    difficulty: "Medium",
    question: "What is the median of 7, 1, 5, 3, 9?",
    answer: 5,
    explanation:
      "Sorted: 1, 3, 5, 7, 9. The middle (third) value of five ordered numbers is 5.",
    hint: "Sort the values first, then take the middle one.",
  },
  {
    id: "pp-028",
    category: "Statistics",
    difficulty: "Hard",
    question:
      "A value is 130, the mean is 100, and the standard deviation is 15. What is the z-score?",
    options: ["2", "1.5", "3", "0.5"],
    answer: "2",
    explanation: "z = (x - mean) / sd = (130 - 100) / 15 = 2.",
    hint: "Subtract the mean, then divide by the standard deviation.",
  },
  {
    id: "pp-029",
    category: "Statistics",
    difficulty: "Medium",
    question:
      "To get an unbiased estimate of the population variance from a sample, what should you divide the sum of squared deviations by?",
    options: ["n - 1", "n", "n + 1", "sqrt(n)"],
    answer: "n - 1",
    explanation:
      "Dividing by n - 1 (Bessel's correction) makes the sample variance an unbiased estimator of the population variance.",
    hint: "The correction accounts for the sample mean being estimated from the same data.",
  },
  {
    id: "pp-030",
    category: "Statistics",
    difficulty: "Hard",
    question:
      "For x = [1, 2, 3] and y = [2, 4, 5], what is the sample covariance (dividing by n - 1)?",
    answer: 1.5,
    explanation:
      "x_bar = 2 and y_bar = 11/3. The sum of products of deviations is (-1)(-5/3) + 0 + (1)(4/3) = 3, so the sample covariance is 3/2 = 1.5.",
    hint: "Compute means first, then sum (x_i - x_bar)(y_i - y_bar) and divide by n - 1.",
  },
  {
    id: "pp-031",
    category: "Statistics",
    difficulty: "Easy",
    question: "What is the mode of 4, 1, 4, 2, 4, 3?",
    options: ["4", "1", "2", "3"],
    answer: "4",
    explanation: "The value 4 appears three times, more than any other value.",
    hint: "The mode is the most frequent value.",
  },
  {
    id: "pp-032",
    category: "Probability",
    difficulty: "Easy",
    question:
      "Two fair six-sided dice are rolled. What is the probability that the sum is 7? Give a decimal answer.",
    answer: 0.16666666666666666,
    tolerance: 0.0001,
    explanation:
      "There are 6 favorable outcomes (1+6 through 6+1) out of 36 equally likely outcomes, so 6/36 = 1/6 = 0.1667.",
    hint: "Count the pairs that sum to 7, then divide by 36.",
  },
  {
    id: "pp-033",
    category: "Probability",
    difficulty: "Easy",
    question: "What is the expected value of a single fair six-sided die roll?",
    answer: 3.5,
    explanation:
      "The mean of 1 through 6 is (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = 3.5.",
    hint: "Average the six equally likely outcomes.",
  },
  {
    id: "pp-034",
    category: "Probability",
    difficulty: "Medium",
    question:
      "A disease affects 1% of people. A test has 99% sensitivity and 95% specificity. Given a positive test, what is the approximate probability of having the disease?",
    options: ["About 1/6", "About 0.99", "About 0.5", "About 0.01"],
    answer: "About 1/6",
    explanation:
      "Bayes: P(D|+) = 0.01*0.99 / (0.01*0.99 + 0.99*0.05) = 0.0099 / 0.0594 = 1/6 ~ 0.167. The low base rate keeps the posterior small.",
    hint: "Compute true positives divided by all positives, including false positives.",
  },
  {
    id: "pp-035",
    category: "Probability",
    difficulty: "Medium",
    question:
      "How many ways are there to choose 3 items from 8 distinct items (order does not matter)?",
    answer: 56,
    explanation: "C(8, 3) = 8! / (3! 5!) = (8*7*6)/(3*2*1) = 56.",
    hint: "Use the binomial coefficient n choose k.",
  },
  {
    id: "pp-036",
    category: "Probability",
    difficulty: "Medium",
    question: "If events A and B are independent, how do you compute P(A and B)?",
    options: [
      "P(A) * P(B)",
      "P(A) + P(B)",
      "P(A) + P(B) - P(A)P(B)",
      "P(A) / P(B)",
    ],
    answer: "P(A) * P(B)",
    explanation:
      "Independence means the occurrence of one event does not change the probability of the other, so P(A and B) = P(A)P(B).",
    hint: "Independence turns intersection into multiplication.",
  },
  {
    id: "pp-037",
    category: "Probability",
    difficulty: "Hard",
    question:
      "Two fair six-sided dice are rolled. What is the variance of the sum? Give a decimal answer.",
    answer: 5.833333333333333,
    tolerance: 0.0001,
    explanation:
      "A single die has variance E[X^2] - (E[X])^2 = 91/6 - 49/4 = 35/12. Sums of independent dice add variances, so the total is 2 * 35/12 = 35/6 = 5.8333.",
    hint: "Variances add for independent variables.",
  },
  {
    id: "pp-038",
    category: "Probability",
    difficulty: "Medium",
    question:
      "A fair coin is flipped 3 times. What is the probability of at least one head? Give a decimal answer.",
    answer: 0.875,
    explanation:
      "The complement is three tails: (1/2)^3 = 1/8. So P(at least one head) = 1 - 1/8 = 7/8 = 0.875.",
    hint: "Use the complement: one minus the probability of zero heads.",
  },
  {
    id: "pp-039",
    category: "Probability",
    difficulty: "Hard",
    question:
      "On average, how many rolls of a fair six-sided die are needed to see all six faces?",
    options: ["14.7", "6", "12.5", "21"],
    answer: "14.7",
    explanation:
      "Coupon collector: 6*(1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = 6*2.45 = 14.7.",
    hint: "Sum the expected waits for each new face: 1, 6/5, 6/4, ...",
  },
  {
    id: "pp-040",
    category: "Probability",
    difficulty: "Medium",
    question:
      "For a binomial random variable with n trials and success probability p, what is the variance?",
    options: ["n p (1 - p)", "n p", "sqrt(n p (1 - p))", "p (1 - p)"],
    answer: "n p (1 - p)",
    explanation:
      "The sum of n independent Bernoulli(p) variables has variance n * p * (1 - p).",
    hint: "A binomial is a sum of independent Bernoulli trials, and variances add.",
  },
  {
    id: "pp-041",
    category: "Probability",
    difficulty: "Hard",
    question:
      "A geometric random variable counts trials until the first success, with success probability p = 0.25. What is its expected value?",
    answer: 4,
    explanation: "The mean of a geometric distribution is 1/p = 1/0.25 = 4.",
    hint: "The expected number of trials is the reciprocal of the success probability.",
  },
  {
    id: "pp-042",
    category: "ML Fundamentals",
    difficulty: "Easy",
    question:
      "What is the characteristic effect of L1 (Lasso) regularization on model weights?",
    options: [
      "It drives some weights exactly to zero, giving sparse solutions",
      "It shrinks all weights equally but keeps them non-zero",
      "It has no effect on weights",
      "It produces the same solution as L2",
    ],
    answer: "It drives some weights exactly to zero, giving sparse solutions",
    explanation:
      "The L1 penalty's diamond-shaped constraint region has corners on the axes, so the optimum often lands with some coefficients exactly zero.",
    hint: "Think about the shape of the L1 constraint region.",
  },
  {
    id: "pp-043",
    category: "ML Fundamentals",
    difficulty: "Medium",
    question:
      "A classifier has 40 true positives and 10 false positives. What is its precision? Give a decimal answer.",
    answer: 0.8,
    explanation: "Precision = TP / (TP + FP) = 40 / 50 = 0.8.",
    hint: "Precision asks how many predicted positives were actually positive.",
  },
  {
    id: "pp-044",
    category: "ML Fundamentals",
    difficulty: "Medium",
    question:
      "A classifier has 40 true positives and 10 false negatives. What is its recall? Give a decimal answer.",
    answer: 0.8,
    explanation: "Recall = TP / (TP + FN) = 40 / 50 = 0.8.",
    hint: "Recall asks how many actual positives were found.",
  },
  {
    id: "pp-045",
    category: "ML Fundamentals",
    difficulty: "Medium",
    question:
      "A classifier has 50 true positives, 10 false positives, and 30 false negatives. What is its F1 score? Give a decimal answer.",
    answer: 0.7142857142857143,
    tolerance: 0.0001,
    explanation:
      "Precision = 50/60 = 5/6 and recall = 50/80 = 5/8, so F1 = 2 * (5/6)(5/8) / (5/6 + 5/8) = 5/7 = 0.7143.",
    hint: "F1 is the harmonic mean of precision and recall.",
  },
  {
    id: "pp-046",
    category: "ML Fundamentals",
    difficulty: "Hard",
    question:
      "According to the bias-variance decomposition, expected test error equals which of the following?",
    options: [
      "Bias^2 + variance + irreducible noise",
      "Bias + variance",
      "Bias^2 - variance",
      "Variance + irreducible noise only",
    ],
    answer: "Bias^2 + variance + irreducible noise",
    explanation:
      "The decomposition splits expected squared prediction error into squared bias, variance, and the irreducible noise floor.",
    hint: "Bias is squared in the decomposition, and noise never goes away.",
  },
  {
    id: "pp-047",
    category: "ML Fundamentals",
    difficulty: "Easy",
    question:
      "What is the value of the sigmoid function 1 / (1 + e^(-z)) at z = 0?",
    options: ["0.5", "0", "1", "e"],
    answer: "0.5",
    explanation: "At z = 0, e^(-0) = 1, so 1 / (1 + 1) = 0.5.",
    hint: "e^0 equals 1.",
  },
  {
    id: "pp-048",
    category: "ML Fundamentals",
    difficulty: "Medium",
    question: "What objective does k-means clustering minimize?",
    options: [
      "The within-cluster sum of squared distances to centroids",
      "The number of misclassified points",
      "The distance between cluster centroids only",
      "The sum of absolute weights",
    ],
    answer: "The within-cluster sum of squared distances to centroids",
    explanation:
      "k-means alternates assigning points to the nearest centroid and moving each centroid to the mean, which minimizes the within-cluster sum of squares.",
    hint: "Think about what the assignment and update steps each reduce.",
  },
  {
    id: "pp-049",
    category: "ML Fundamentals",
    difficulty: "Medium",
    question:
      "Predictions are [2, 3, 4] and targets are [2, 5, 3]. What is the mean squared error? Give a decimal answer.",
    answer: 1.6666666666666667,
    tolerance: 0.0001,
    explanation: "Squared errors are 0, 4, and 1; their mean is 5/3 = 1.6667.",
    hint: "Square each error, then average them.",
  },
  {
    id: "pp-050",
    category: "ML Fundamentals",
    difficulty: "Easy",
    question:
      "A model has very low training error but high test error. What is this called?",
    options: ["Overfitting", "Underfitting", "Perfect generalization", "High bias"],
    answer: "Overfitting",
    explanation:
      "The model has memorized the training data, so it fits training noise and fails to generalize to unseen data.",
    hint: "The gap between train and test performance is the giveaway.",
  },
  {
    id: "pp-051",
    category: "ML Fundamentals",
    difficulty: "Hard",
    question:
      "For linear regression, predictions are y_hat = wx + b with MSE loss. Using x = [1, 2], w = 1, b = 0, targets y = [1, 3], what is the gradient of the loss with respect to w?",
    answer: -2,
    explanation:
      "dL/dw = (2/n) * sum(x_i (y_hat_i - y_i)). With y_hat = [1, 2] the errors are [0, -1], so the gradient is (2/2)*(1*0 + 2*(-1)) = -2.",
    hint: "Differentiate the MSE with respect to w, then substitute the numbers.",
  },
  {
    id: "pp-052",
    category: "Optimization",
    difficulty: "Medium",
    question:
      "What is the gradient descent update rule for a parameter w with learning rate eta and gradient g?",
    options: ["w - eta * g", "w + eta * g", "w * eta * g", "w / (eta * g)"],
    answer: "w - eta * g",
    explanation:
      "Gradient descent steps opposite the gradient: w_new = w - eta * (dL/dw).",
    hint: "Move against the gradient, scaled by the learning rate.",
  },
  {
    id: "pp-053",
    category: "Optimization",
    difficulty: "Easy",
    question:
      "At what value of x does f(x) = (x - 3)^2 + 7 reach its minimum?",
    answer: 3,
    explanation:
      "The square term is minimized when x - 3 = 0, so x = 3 (the minimum value is 7).",
    hint: "A squared term is smallest when it equals zero.",
  },
  {
    id: "pp-054",
    category: "Optimization",
    difficulty: "Medium",
    question:
      "Newton's method is applied to f(x) = x^2 - 2 starting at x0 = 1. What is x1?",
    answer: 1.5,
    explanation: "x1 = x0 - f(x0)/f'(x0) = 1 - (-1)/2 = 1.5.",
    hint: "Newton's step is x - f(x)/f'(x).",
  },
  {
    id: "pp-055",
    category: "Optimization",
    difficulty: "Hard",
    question: "Which of these functions is convex on the entire real line?",
    options: ["f(x) = x^2", "f(x) = x^3", "f(x) = sin(x)", "f(x) = cos(x)"],
    answer: "f(x) = x^2",
    explanation:
      "f(x) = x^2 has second derivative 2 > 0 everywhere. x^3 has f'' = 6x, which is negative for x < 0, and sin and cos oscillate.",
    hint: "A function is convex when its second derivative is never negative.",
  },
  {
    id: "pp-056",
    category: "Optimization",
    difficulty: "Hard",
    question:
      "For f(x) = 3x^2, gradient descent is stable when the step size satisfies eta < 2/L, where L is the curvature. What is the value of 2/L? Give a decimal answer.",
    answer: 0.3333333333333333,
    tolerance: 0.0001,
    explanation:
      "For f(x) = 3x^2, f''(x) = 6, so L = 6 and 2/L = 2/6 = 1/3 = 0.3333.",
    hint: "The curvature L is the constant second derivative of this quadratic.",
  },
  {
    id: "pp-057",
    category: "Information Theory",
    difficulty: "Easy",
    question: "What is the Shannon entropy of a fair coin flip, in bits?",
    answer: 1,
    explanation:
      "H = -(1/2)log2(1/2) - (1/2)log2(1/2) = 1 bit.",
    hint: "Two equally likely outcomes correspond to one bit.",
  },
  {
    id: "pp-058",
    category: "Information Theory",
    difficulty: "Medium",
    question:
      "What is the Shannon entropy, in bits, of a uniform distribution over 8 outcomes?",
    answer: 3,
    explanation:
      "H = log2(8) = 3 bits for a uniform distribution over 2^3 equally likely outcomes.",
    hint: "For a uniform distribution entropy is log2 of the number of outcomes.",
  },
  {
    id: "pp-059",
    category: "Information Theory",
    difficulty: "Medium",
    question: "Which statement is true about the KL divergence D(p || q)?",
    options: [
      "It is always greater than or equal to 0",
      "It is always less than or equal to 0",
      "It always equals 1",
      "It can be any real number",
    ],
    answer: "It is always greater than or equal to 0",
    explanation:
      "Gibbs' inequality states D(p || q) >= 0, with equality if and only if p = q.",
    hint: "KL divergence is not symmetric, but it is never negative.",
  },
  {
    id: "pp-060",
    category: "Information Theory",
    difficulty: "Hard",
    question:
      "What is the Shannon entropy, in bits, of a Bernoulli random variable with success probability p = 0.25? Give a decimal answer.",
    answer: 0.8112781244591328,
    tolerance: 0.0001,
    explanation:
      "H = -0.25 log2(0.25) - 0.75 log2(0.75) = 0.5 + 0.3113 = 0.8113 bits.",
    hint: "Use H = -p log2(p) - (1 - p) log2(1 - p).",
  },
];
