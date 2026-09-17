export interface TheorySection {
  heading: string;
  body: string;
}

export interface ResearchTheory {
  id: string;
  premise: string;
  sections: TheorySection[];
  pitfalls: string[];
  takeaway: string;
}

/**
 * Background notes for each research challenge: what the task really tests,
 * why the baseline is set where it is, and how to think about the metric.
 */
export const RESEARCH_THEORY: ResearchTheory[] = [
  {
    id: "tabular-classification-showdown",
    premise:
      "A classifier only earns its name when it beats class frequency. This task starts from the majority-class floor and asks you to find the boundary between two noisy blobs.",
    sections: [
      {
        heading: "The two overlapping blobs",
        body: "There are 60 training rows and 30 hidden rows. Class 1 is centred at (0.9, 0.45) and class 0 at (-0.9, -0.45), and each coordinate is the centre plus independent uniform noise in [-1.5, 1.5] (standard deviation 1.5/sqrt(3), about 0.87 per axis). Because the noise spread is wider than the 1.8 gap between centres, the blobs overlap and no boundary is perfect. Class 1 lands on every third row by construction, so the training split holds exactly 20 ones, and the hidden split holds 10 of its 30 rows as class 1.",
      },
      {
        heading: "What the baseline actually scores",
        body: "Predicting the majority label scores 20/30 = 0.6667 accuracy on the hidden rows, which is exactly the recorded baseline. The comparison is strict - a score must be greater than the baseline plus 1e-9 to count as beaten - so a tie is a loss. The first score that wins is 21 of 30 rows correct, or 0.70 accuracy.",
      },
      {
        heading: "The boundary that wins",
        body: "Standardize both columns with the training means and standard deviations, then fit logistic regression: p = sigmoid(w . z + b). The log-loss gradient for each row is (p - y) times the standardized feature vector, plus (p - y) for the bias, averaged over the 60 rows. The class centres differ by (1.8, 0.9), so the useful boundary runs roughly perpendicular to that direction - about 2x + y = 0 in raw coordinates - and a few hundred gradient steps at learning rate 0.5 reach 28/30 = 0.933 on a quick internal run.",
      },
      {
        heading: "Reading the score honestly",
        body: "Metric is accuracy, higher is better, and the hidden split is fresh rows from the same generator, not a reshuffle of the training rows. Because the blobs overlap, a model that pushes training accuracy past roughly 0.95 is memorizing individual points; watch the loss flatten instead of chasing 100% on the 60 rows you can see.",
      },
    ],
    pitfalls: [
      "Predicting the majority class and treating 0.6667 as a pass. The check is strict, so a tie scores as a loss and only 21 or more correct hidden rows wins.",
      "Standardizing with the test rows' own means and standard deviations instead of the training split's. The transform must be learned on train and replayed unchanged on test, or the two sets land on different scales.",
      "Forgetting the bias term, which forces the boundary through the origin of the standardized space. The blobs are centred near the origin, so it can look harmless while costing a couple of hidden points.",
    ],
    takeaway:
      "Two overlapping blobs are about as easy as classification gets, but the floor is class frequency, the ruler is the hidden 30 rows, and 21/30 is the first score that actually wins.",
  },
  {
    id: "nonlinear-regression-chase",
    premise:
      "A straight line through a parabola is the classic underfitting picture. This challenge makes the gap between linear and quadratic explicit in MSE.",
    sections: [
      {
        heading: "The generator behind the curve",
        body: "The training split has 50 rows and the hidden split 25. Each row draws x uniformly from [-1, 1], then y = 2x^2 - x + 0.5 plus independent uniform noise in [-0.2, 0.2] (variance 0.4^2/12, about 0.0133). The curve bottoms out at x = 0.25 with y = 0.375 and climbs to 3.5 at x = -1, so a straight line can follow the average slope but never the bend.",
      },
      {
        heading: "Why the line leaves most of the error on the table",
        body: "Least squares on a single linear term records MSE 0.4432 on the hidden rows. Since the noise floor is only about 0.0133, roughly 97% of that error is bias - the constant price of insisting the world is straight. That gap is the entire opportunity of the challenge.",
      },
      {
        heading: "Three unknowns, three normal equations",
        body: "Fit y = c0 + c1*x + c2*x^2. The normal equations are symmetric: the 3x3 matrix holds n, sum(x), sum(x^2) in the first row, sum(x), sum(x^2), sum(x^3) in the second, and sum(x^2), sum(x^3), sum(x^4) in the third, with the right-hand side sum(y), sum(x*y), sum(x^2*y). Gaussian elimination on the 50 training rows recovers about (0.51, -1.01, 2.05), close to the true (0.5, -1, 2), and scores MSE 0.019 on the hidden rows.",
      },
      {
        heading: "Where to stop",
        body: "The irreducible error is the label noise, about 0.0133, and a good quadratic lands just above it. Adding x^3 or x^4 gives the fit enough rope to chase individual noisy points: training MSE falls while hidden MSE rises, because 50 rows and noise standard deviation 0.115 cannot identify more than three coefficients reliably.",
      },
    ],
    pitfalls: [
      "Building the x^2 column in the normal equations but predicting with c0 + c1*x + c2*x. The third coefficient then multiplies the raw feature, and the model is still a line.",
      "Assembling the design matrix in one column order and predicting in another (for example fitting [1, x^2, x] but evaluating [1, x, x^2]), which silently swaps the two slope coefficients.",
      "Ordering the normal equations by hand without keeping the matrix symmetric - the sum of x^3 must appear in both the (1,2) and (2,1) positions - which flips signs during elimination.",
    ],
    takeaway:
      "Feature engineering is model choice here: handing the model x^2 is the whole fix, and the normal equations turn it into a 3x3 linear solve.",
  },
  {
    id: "imbalanced-signal-hunt",
    premise:
      "Twenty columns, three of them real, and roughly a fifth of the rows positive. The baseline predicts nothing and scores zero F1 - the job is to find sparse signal without drowning in noise dimensions.",
    sections: [
      {
        heading: "Exactly how the labels were made",
        body: "Each of the 20 features is uniform on [0, 1]. The label is 1 when 4*f3 - 4*f11 + 3*f17 - 3 plus uniform noise in [-0.6, 0.6] is positive, where the columns are indexed from zero. That places 12 of the 60 training rows in the positive class (20%) and 8 of the 30 hidden rows (26.7%). The signal is a weighted sum of three columns with a threshold of 3, so the features alone span [-4, 7] before noise.",
      },
      {
        heading: "Why F1 refuses to reward the do-nothing model",
        body: "F1 for the positive class is 2*TP / (2*TP + FP + FN). Predicting all zeros gives TP = 0, so F1 = 0 no matter how respectable the accuracy looks - the always-negative baseline would be 80% accurate on train and 73.3% on the hidden rows. Flipping to all-positive scores 2*8 / (2*8 + 22) = 0.421 on the hidden split. Any F1 above 1e-9 counts as beating the zero baseline.",
      },
      {
        heading: "Which columns carry the signal",
        body: "Pearson correlation against the label ranks the columns immediately: f3 is about +0.51, f17 about +0.42, and f11 about -0.26, while the 17 noise columns cluster near zero with a median absolute r of about 0.095 and a maximum near 0.20. A bar chart of correlations is a free feature-selection pass before any model is fit.",
      },
      {
        heading: "Standardize, fit, then respect the rounding",
        body: "Standardize all 20 columns with training statistics and run logistic regression on log-loss: the per-row gradient is (p - y) times the standardized row. Signal weights grow while noise weights hover near zero. The harness rounds each prediction with Python's round before scoring, so returning probabilities is fine, but a value that rounds to 0 can never be a true positive - when recall matters, a small threshold shift is worth more than another hundred iterations.",
      },
    ],
    pitfalls: [
      "Reporting accuracy instead of F1. Dropping all positives is 73.3% accurate on the hidden rows and still scores zero, because the metric is F1 for the positive class.",
      "Training on raw [0, 1] columns with a single learning rate. The irrelevant wide columns contribute gradients of the same magnitude as the three signal columns, so the optimizer spends steps fitting noise before the signal stands out.",
      "Letting a small positive class drive the intercept far negative and then thresholding at 0.5. Predictions concentrate in a narrow band, and Python's round turns borderline values into 0s, quietly destroying recall.",
    ],
    takeaway:
      "With rare positives and many noise features, the metric and the scaling are as important as the model itself - correlation ranking plus standardized logistic regression is enough to clear a zero baseline.",
  },
  {
    id: "noisy-sensor-denoising",
    premise:
      "Every row is a five-sample window of a noisy triangle wave, and the label is the clean value at the end of the window. The trailing average lags; a smarter filter should not.",
    sections: [
      {
        heading: "The wave under the noise",
        body: "The generator walks 94 steps of a period-20 triangle wave: +0.25 per step for ten steps, then -0.25 for ten, plus independent uniform noise in [-0.5, 0.5] (variance 1/12, about 0.0833, so the noise standard deviation 0.289 is larger than one step of the wave). Every row holds the five noisy samples t-4 through t, and the label is the clean wave value at t. The 60 training rows cover t = 4 to 63 and the 30 hidden rows t = 64 to 93 from one random stream.",
      },
      {
        heading: "The baseline lags by exactly two steps",
        body: "Averaging the five window samples estimates the centre of the window, t-2, not its end. On a ramp of slope 0.25 that is a bias of 2 * 0.25 = 0.5, so the squared bias alone is 0.25 before noise - which is why the moving-average baseline records MSE 0.2575 on the hidden rows despite the label being comparatively clean.",
      },
      {
        heading: "Two filters that remove the lag",
        body: "Fit a least-squares line to each five-point window and evaluate it at the last sample: hidden MSE drops to about 0.053. Or learn five weights plus a bias on the 60 training rows; the fit comes out near (-0.005, -0.101, 0.111, 0.290, 0.683), heavily weighting the most recent sample, and reaches about 0.049. Both beat the noise floor of a single sample because the estimate borrows information from all five points.",
      },
      {
        heading: "Where the residuals bunch up",
        body: "Windows that straddle a turning point (t mod 20 near 9, 10, 19, or 0) are not linear, so a straight-line fit overshoots there and the largest residuals sit at the peaks. The wave's two slope regimes are symmetric, which is why one set of weights works for both the up and down ramps.",
      },
    ],
    pitfalls: [
      "Keeping a symmetric weight vector such as the five-point mean. Symmetric weights estimate the window centre and reproduce the two-step lag the challenge is designed to punish.",
      "Using a one-step finite difference (last sample minus the previous one) as the estimate. Its error variance is 2 * 0.0833 = 0.167, about triple the error of a least-squares line over the whole window.",
      "Learning weights on the first 60 rows and then feeding windows in reversed order at predict time. The weights are asymmetric, so index order t-4 ... t is part of the model contract.",
    ],
    takeaway:
      "Denoising is estimation with structure: once you know the signal is piecewise linear, the filter is a line fit, not an average.",
  },
  {
    id: "mini-language-model",
    premise:
      "Next-token prediction on a four-token alphabet from a second-order Markov process. The unigram baseline ignores order entirely - contexts are the whole point.",
    sections: [
      {
        heading: "The hidden rule and its noise",
        body: "Rows are four-token contexts [a, b, c, d] over {0, 1, 2, 3} and the label is the next token. With probability 0.85 the next token is a deterministic function of the last two context tokens: next = (c + d + 1) mod 4, which is the 4x4 table with rows [1,2,3,0], [2,3,0,1], [3,0,1,2], [0,1,2,3]. Otherwise (15% of the time) the next token is uniform over the four tokens. That caps the accuracy of a model that knows the pair exactly at 0.85 + 0.15/4 = 0.8875.",
      },
      {
        heading: "Why the unigram baseline lands on 0.3",
        body: "The 70 training rows contain token counts [19, 19, 11, 21], so the most frequent next token is 3. The hidden 30 rows have counts [7, 5, 9, 9], so the same always-3 rule is right 9 times: exactly 0.300. It never looks at the context, so it cannot see any of the Markov structure.",
      },
      {
        heading: "Counting pairs is a language model",
        body: "Build a table over the last two context tokens (c, d) to the observed next tokens, and predict the most frequent continuation, falling back to the unigram pick for unseen pairs. All 16 pairs appear in the 70 training rows and the hidden rows reuse 14 of them, so a majority lookup scores 29/30 = 0.967 - only a three-way tie on the pair (0, 1) and the mixed (0, 0) rows cost anything.",
      },
      {
        heading: "Why the last-token matrix looks flat",
        body: "The preview's 4x4 matrix counts transitions from the last context token d to the next token. Each row averages over all four possible values of c, and since next = (c + d + 1) mod 4, different c values land in different columns. Row totals of 14, 23, 18, and 15 spread almost evenly across the four columns - that flatness is evidence the process is second order, not first order.",
      },
    ],
    pitfalls: [
      "Keying the lookup on one token (the last one) instead of the last two. Every row of that 4x4 table mixes all four possible continuations, so accuracy stalls near the uniform rate no matter how many rows you count.",
      "Keying on the first two context tokens (a, b) instead of the last two (c, d). Those tokens generated the context but do not determine the next token, so the table leaks no usable signal.",
      "Ignoring ties in a pair's counts. With 70 rows over 16 pairs, ties happen - pair (0, 1) has three different continuations with one vote each - and an arbitrary or unstable tie-break quietly costs hidden rows.",
    ],
    takeaway:
      "A language model is a conditional distribution; counting a transition table on the last two tokens is the smallest honest version of it.",
  },
];

export function getResearchTheory(id: string): ResearchTheory | undefined {
  return RESEARCH_THEORY.find((theory) => theory.id === id);
}
