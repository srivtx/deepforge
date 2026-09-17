export interface TheorySection {
  heading: string;
  body: string;
}

export interface LabTheory {
  id: string;
  teaches: string;
  sections: TheorySection[];
  pitfalls: string[];
}

/**
 * The idea behind each lab: what the algorithm is really doing, why the
 * target is achievable without libraries, and the mistakes that cost runs.
 */
export const LAB_THEORY: LabTheory[] = [
  {
    id: "lab-01",
    teaches:
      "Fit a sigmoid of a weighted sum with batch gradient descent, then let the 0.5 threshold turn those probabilities into held-out accuracy.",
    sections: [
      {
        heading: "The split in numbers",
        body: "There are 30 training rows with two features and 15 hidden rows. The training labels are exactly balanced (15 ones), so the starter's majority rule - label 1 only when the positive rate is greater than 0.5 - falls through to predicting 0 for every row and scores 9/15 = 0.60 on the hidden split. The target is 0.85, which needs at least 13 of 15 rows correct; 12/15 = 0.80 misses.",
      },
      {
        heading: "The gradient you need",
        body: "The model is p = sigmoid(w1*x1 + w2*x2 + b). Log-loss has the cleanest gradient in machine learning: for each row the bias sees (p - y) and each weight sees (p - y) times its feature, all averaged over the 30 rows. A few hundred steps at a sensible learning rate is plenty; an internal run reaches 14/15 = 0.933 on the hidden rows. Standardize both features first, because the first column has the wider spread and uneven inputs make a single step size behave differently per weight.",
      },
      {
        heading: "What the harness accepts",
        body: "predict() may return probabilities or hard labels; the scorer reads any value >= 0.5 as class 1 and anything below as class 0, and checks the list length matches the 15 test rows. That means raw logits are a trap: a logit of 0 is a probability of 0.5, but the harness reads 0 as class 0, so return sigmoid outputs or already-thresholded 0/1 values.",
      },
    ],
    pitfalls: [
      "Leaving in the starter's majority vote. It is a constant function, so no amount of studying the rows changes the 0.60 score.",
      "Dropping the bias term, which pins the decision boundary through the origin even though these two classes are not centred there.",
      "Using a learning rate so large that the loss bounces around instead of descending, or so small that a few hundred steps barely move the weights off zero.",
    ],
  },
  {
    id: "lab-02",
    teaches:
      "Turn keyword counts into a weighted sum and score the spam class with F1, where precision and recall both have to hold up.",
    sections: [
      {
        heading: "Six counts, 32 rows",
        body: "The training split is 32 rows of six keyword counts (each column ranges from 0 to 5) with 8 spam rows - every fourth training row is label 1. The hidden split is 20 rows with 5 spam. Counts are not centred, and their means differ across columns, so standardizing each column before fitting keeps one busy keyword from dominating every gradient step.",
      },
      {
        heading: "The F1 arithmetic you are judged on",
        body: "Precision is TP / (TP + FP), recall is TP / (TP + FN), and F1 is their harmonic mean 2*TP / (2*TP + FP + FN), computed for the spam class only. Predicting all ham gives recall 0 and F1 0.00, which is the recorded baseline. Predicting all spam gives precision 5/20 and recall 1, for F1 = 0.40. With only 5 hidden spam rows, the 0.85 target allows exactly one mistake of either kind: 4 TP + 0 FP scores 0.889, but 4 TP + 1 FP drops to 0.80 and misses.",
      },
      {
        heading: "What a fitted classifier sees",
        body: "Logistic regression on standardized counts separates the hidden rows cleanly in an internal run (F1 1.0 at threshold 0.5). The fitted weights are telling: roughly +3.1, +1.9, +1.5 on the first three keyword columns and -0.9, -0.9, -1.9 on the last three, so spam is high on the early keywords and low on the later ones. That is the kind of structure a keyword-count model is supposed to find.",
      },
    ],
    pitfalls: [
      "Optimizing accuracy. Predicting all ham is 75% accurate on the training split and scores F1 0.00, which is also the baseline.",
      "Fitting on raw counts. A column with large counts produces large gradients, and the same learning rate that suits it oversteps the small columns.",
      "Judging on the training split. F1 1.0 on 32 rows can hide a threshold that misses one of the five hidden spam rows, and one miss plus one false alarm is already below target.",
    ],
  },
  {
    id: "lab-03",
    teaches:
      "Solve a four-unknown least-squares system by hand - intercept plus three features - and beat the training-mean predictor on MSE.",
    sections: [
      {
        heading: "The split in numbers",
        body: "There are 30 training rows and 15 hidden rows. The features are house size (roughly 830 to 3000), bedrooms (1 to 5), and age (0 to 37), and the targets are prices in the 140 to 360 range. Predicting the training mean costs MSE 2879.57 on the hidden rows, which is the recorded baseline, and the target is 400.",
      },
      {
        heading: "The fitted surface",
        body: "Ordinary least squares gives price = 33.46 + 0.0969*size + 10.78*bedrooms - 0.385*age. On the hidden 15 rows that scores MSE about 283 with R-squared 0.90, comfortably inside the target. The training residual standard deviation is about 12.7, so part of the price is genuinely noisy; do not expect a perfect fit, just a far better one than the mean.",
      },
      {
        heading: "Assembling the system",
        body: "Prepend a constant 1 column to the features, build the 4x4 normal equations (X-transpose X) theta = X-transpose y, and solve with Gaussian elimination. The matrix diagonal holds n, the sums of squares of each feature, and the off-diagonals hold pairwise feature sums - all computable in one pass over the 30 rows with plain Python loops.",
      },
    ],
    pitfalls: [
      "Fitting on unscaled features and then evaluating with a different scaling. Age spans 37 while size spans about 2000, so a scale change that touches only one column silently shifts the intercept and slope.",
      "Reading the first coefficient as a feature weight. The design matrix's first column is the constant 1, so theta[0] is the intercept; mixing up the column order of bedrooms and age flips their weights.",
      "Dividing by a zero or near-zero pivot during elimination without a fallback, which happens whenever a candidate column has no variance in the rows you keep.",
    ],
  },
  {
    id: "lab-04",
    teaches:
      "Add x-squared as a feature and the linear least-squares machinery fits a curve; read R-squared against the noise floor instead of chasing 1.0.",
    sections: [
      {
        heading: "The shape and the floor",
        body: "The single feature x runs across roughly [-3, 3] over 30 training rows and 15 hidden rows, and the target follows a quadratic plus additive noise. A straight-line fit explains only R-squared 0.26 on the hidden rows - the recorded baseline - while the training-mean starter sits at R-squared 0.00 by construction.",
      },
      {
        heading: "Two features, one trick",
        body: "Stack [1, x, x-squared] into each row and solve the same 3x3 normal equations used for a line. The fit comes out near (1.04, -0.62, 0.79) and reaches R-squared 0.939 on the hidden rows, above the 0.88 target. The model is still linear in its coefficients, which is why the identical solver works.",
      },
      {
        heading: "Why R-squared cannot hit 1",
        body: "The label carries noise, so even the correct quadratic leaves residual error - its training MSE bottoms out near 0.24. That is the irreducible floor of this dataset. If a model reports R-squared much above the noise-ceiling estimate, it is fitting individual noisy points, and the hidden rows will disagree.",
      },
    ],
    pitfalls: [
      "Squaring x in the design matrix but predicting with c0 + c1*x + c2*x. The exponent has to appear in both the fit and the evaluation, or the result is still a straight line.",
      "Centering x for conditioning but forgetting to use the same centering when squaring and when predicting; the cross terms no longer cancel and the curve shifts.",
      "Adding x-cubed or x-fourth terms to squeeze out the last few points of training fit. With 30 rows they absorb noise, raising training R-squared while hidden R-squared falls.",
    ],
  },
  {
    id: "lab-05",
    teaches:
      "Run Lloyd's algorithm to four centroids, then predict each test row with the mean training label of its nearest cluster.",
    sections: [
      {
        heading: "Four groups in plain sight",
        body: "The 36 training rows form four well-separated clouds around (0, 0.1), (0.25, 7.8), (7.6, -0.1), and (7.9, 7.9), with mean labels of roughly 2.25, 4.09, 7.92, and 9.84. The global-mean predictor scores R-squared 0.00 (the recorded baseline) and the target is 0.90.",
      },
      {
        heading: "Assignment then update",
        body: "Assign every point to its nearest centroid under squared Euclidean distance, move each centroid to the mean of its assigned points, and repeat until assignments stop changing. Because both axes span about 0 to 10 and the clusters are far apart, the algorithm converges in a few iterations; an internal run reaches R-squared 0.984 on the 16 hidden rows.",
      },
      {
        heading: "Prediction is a lookup",
        body: "For each test row, find the nearest training centroid and return that cluster's mean training label - never the test labels, which are not passed to predict(). The within-cluster label variation is small, so this piecewise-constant prediction explains almost all of the hidden variance.",
      },
    ],
    pitfalls: [
      "Seeding two centroids inside the same cloud and leaving another empty. Empty clusters divide by zero in the mean update; re-seed the empty centroid or leave it where it is.",
      "Returning the cluster index or the centroid coordinates instead of the cluster's mean label. The metric is R-squared against the target values, not cluster alignment.",
      "Stopping after one assignment pass. The first assignments depend entirely on the initial centroids, and a single round can leave a boundary in the wrong place.",
    ],
  },
  {
    id: "lab-06",
    teaches:
      "Imbalanced classification where F1 on the default class - not accuracy - is the whole score, so the threshold and the rare positives decide the run.",
    sections: [
      {
        heading: "About a third positives",
        body: "The training split has 40 rows with 14 defaults (35%) and the hidden split has 20 rows with 7. The starter's majority rule finds a positive rate of 0.35, so it predicts safe for everyone: 65% accurate, F1 0.00, which is the recorded baseline. The target is 0.85.",
      },
      {
        heading: "What the four features say",
        body: "Correlations with the default label run from -0.40 on the first feature to +0.64, +0.45, and +0.58 on the others, so the signal is spread across columns rather than sitting in one. Standardized logistic regression reaches hidden F1 about 0.923 - six of seven defaults caught with no false alarms - and the largest weights land on the two middle features after standardization.",
      },
      {
        heading: "The F1 budget on seven positives",
        body: "With 7 hidden defaults, 6 TP + 0 FP scores 0.923, 6 TP + 1 FP still scores 0.857, but 5 TP + 1 FP is 0.769 and 5 TP + 0 FP is 0.833 - both miss. In other words, one mistake is allowed and two are fatal. That is why returning sensible probabilities and choosing the threshold deliberately matters more here than any extra optimizer tuning.",
      },
    ],
    pitfalls: [
      "Choosing the threshold on accuracy. The majority class dominates accuracy while F1 stays at zero, so the two metrics point in different directions.",
      "Standardizing with statistics computed on the hidden rows. The transform must come from the training split alone, or the score is not reproducible.",
      "Treating the 0.5 threshold as sacred. With rare positives the best F1 often sits below 0.5, and the harness accepts any monotone score you return.",
    ],
  },
  {
    id: "lab-07",
    teaches:
      "Fit both sensor readings with least squares, then find and drop the corrupted rows that pull the fit off the clean relation.",
    sections: [
      {
        heading: "The clean relation plus outliers",
        body: "There are 28 training rows with two sensor readings and 12 hidden rows. Predicting the training mean scores MSE 84.91 on the hidden rows - the recorded baseline - and the target is 8. A plain least-squares fit over all 28 rows gives roughly 11.95 + 1.85*s1 + 1.48*s2 and already reaches MSE 4.44, which shows the relation is mostly linear.",
      },
      {
        heading: "Three rows break the slope",
        body: "Rows 3, 11, and 22 sit 10 to 13 units above the fitted surface - far beyond the remaining noise. Refitting on the other 25 rows moves the coefficients to about 7.67 + 2.50*s1 + 1.54*s2 and drops hidden MSE to roughly 0.30, an order of magnitude better than the plain fit.",
      },
      {
        heading: "Residual screening as a rule",
        body: "Compute residuals on the training rows, drop the rows whose absolute residual exceeds a threshold a few times the median, and refit. A cutoff near 2 to 3 times the residual spread removes the three corrupted rows without touching anything else; removing more than about 15% of rows starts to bias the slope.",
      },
    ],
    pitfalls: [
      "Letting the outliers set the slope and reporting the training MSE. Three bad rows out of 28 are enough to bend a two-feature fit, and the damage only shows on held-out rows.",
      "Dropping rows by feature magnitude instead of residual size. The corruption lives in the label, not in the sensor readings, so a feature-based filter removes good rows and keeps bad ones.",
      "Refitting after removing too many rows. Tightening the cutoff until most rows are gone makes the surface follow the remaining noise rather than the clean relation.",
    ],
  },
  {
    id: "lab-08",
    teaches:
      "XOR is the canonical proof that linear models need a feature: the product x1*x2 turns a non-separable label into a separable one.",
    sections: [
      {
        heading: "The four-quadrant pattern",
        body: "The 32 training rows arrive in mirrored quadruples at (+-x1, +-x2), with label 1 when the signs agree and label 0 when they differ - 16 ones and 16 zeros. The 20 hidden rows follow the same construction. Because the two positive regions sit on opposite diagonals, no straight boundary can isolate both without also catching a negative region.",
      },
      {
        heading: "Why 0.75 is the linear ceiling",
        body: "Any line through the plane slices it into two half-planes; at best it captures three of the four quadrants, so a linear model tops out near 0.75 accuracy, which is the recorded baseline. The starter's constant majority vote (rate 0.5 is not greater than 0.5, so it predicts 0) scores 10/20 = 0.50 on the hidden rows.",
      },
      {
        heading: "The product feature",
        body: "z = x1*x2 is positive exactly in the two label-1 quadrants and negative in the two label-0 quadrants, so the rule z > 0 scores 1.00 on the hidden rows. Logistic regression on [x1, x2, x1*x2] discovers the same boundary; standardize the rows after building the three columns so the product is on a comparable scale.",
      },
    ],
    pitfalls: [
      "Adding x1-squared and x2-squared but not the interaction. Squares are identical across mirrored quadrants, so XOR stays invisible to the model.",
      "Standardizing the raw features and then multiplying the standardized values without refitting the scale of the product column. The engineered feature's magnitude decides how much it can move the boundary.",
      "Stopping at 0.75 because it beats chance. That is exactly the linear ceiling and the baseline; the target is 0.90 and only the interaction gets there.",
    ],
  },
];

export function getLabTheory(id: string): LabTheory | undefined {
  return LAB_THEORY.find((theory) => theory.id === id);
}
