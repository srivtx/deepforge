export type ResearchMetric = "accuracy" | "mse" | "r2" | "f1";

export interface ResearchChallenge {
  id: string;
  title: string;
  blurb: string;
  metric: ResearchMetric;
  higherIsBetter: boolean;
  baselineScore: number;
  baselineName: string;
  datasetDescription: string;
  trainData: { features: number[][]; labels: (number | number[])[] };
  testData: { features: number[][]; labels: (number | number[])[] };
  starterCode: string;
  hint: string;
  points: number;
}

interface ChallengeDataset {
  features: number[][];
  labels: number[];
}

interface ChallengeSplit {
  train: ChallengeDataset;
  test: ChallengeDataset;
}

/**
 * Seeded 32-bit LCG shared by every generator. State advances as
 * state = (1664525 * state + 1013904223) mod 2^32 and draws in [0, 1).
 */
function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeBlobs(): ChallengeSplit {
  const rng = lcg(21);
  const sample = (n: number): ChallengeDataset => {
    const features: number[][] = [];
    const labels: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const cls = i % 3 === 0 ? 1 : 0;
      const cx = cls === 1 ? 0.9 : -0.9;
      const cy = cls === 1 ? 0.45 : -0.45;
      const x = cx + (rng() * 2 - 1) * 1.5;
      const y = cy + (rng() * 2 - 1) * 1.5;
      features.push([x, y]);
      labels.push(cls);
    }
    return { features, labels };
  };
  const train = sample(60);
  const test = sample(30);
  return { train, test };
}

function makeQuad(): ChallengeSplit {
  const rng = lcg(7);
  const sample = (n: number): ChallengeDataset => {
    const features: number[][] = [];
    const labels: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const x = rng() * 2 - 1;
      const noise = (rng() * 2 - 1) * 0.2;
      features.push([x]);
      labels.push(2 * x * x - x + 0.5 + noise);
    }
    return { features, labels };
  };
  const train = sample(50);
  const test = sample(25);
  return { train, test };
}

function makeImbalanced(): ChallengeSplit {
  const rng = lcg(33);
  const sample = (n: number): ChallengeDataset => {
    const features: number[][] = [];
    const labels: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const feats: number[] = [];
      for (let j = 0; j < 20; j += 1) feats.push(rng());
      const signal =
        4 * feats[3] - 4 * feats[11] + 3 * feats[17] - 3 + 0.6 * (rng() * 2 - 1);
      features.push(feats);
      labels.push(signal > 0 ? 1 : 0);
    }
    return { features, labels };
  };
  const train = sample(60);
  const test = sample(30);
  return { train, test };
}

function makeSensor(): ChallengeSplit {
  const rng = lcg(44);
  const steps = 94;
  const clean: number[] = [];
  const noisy: number[] = [];
  for (let t = 0; t < steps; t += 1) {
    const tri = t % 20;
    const value = tri < 10 ? 0.25 * tri : 0.25 * (20 - tri);
    clean.push(value);
    noisy.push(value + (rng() * 2 - 1) * 0.5);
  }
  const features: number[][] = [];
  const labels: number[] = [];
  for (let t = 4; t < steps; t += 1) {
    features.push(noisy.slice(t - 4, t + 1));
    labels.push(clean[t]);
  }
  return {
    train: { features: features.slice(0, 60), labels: labels.slice(0, 60) },
    test: { features: features.slice(60), labels: labels.slice(60) },
  };
}

const LM_TABLE = [
  [1, 2, 3, 0],
  [2, 3, 0, 1],
  [3, 0, 1, 2],
  [0, 1, 2, 3],
];

function makeLanguage(): ChallengeSplit {
  const rng = lcg(55);
  const step = (a: number, b: number): number => {
    if (rng() < 0.85) return LM_TABLE[a][b];
    return Math.floor(rng() * 4);
  };
  const sample = (n: number): ChallengeDataset => {
    const features: number[][] = [];
    const labels: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const a = Math.floor(rng() * 4);
      const b = Math.floor(rng() * 4);
      const c = step(a, b);
      const d = step(b, c);
      const next = step(c, d);
      features.push([a, b, c, d]);
      labels.push(next);
    }
    return { features, labels };
  };
  const train = sample(70);
  const test = sample(30);
  return { train, test };
}

const BLOBS = makeBlobs();
const QUAD = makeQuad();
const IMBALANCED = makeImbalanced();
const SENSOR = makeSensor();
const LANGUAGE = makeLanguage();

/**
 * Five deterministic research challenges. Baseline scores are the hidden-test
 * metrics of the starter algorithm; beat one and the score is recorded locally.
 */
export const RESEARCH_CHALLENGES: ResearchChallenge[] = [
  {
    id: "tabular-classification-showdown",
    title: "Tabular Classification Showdown",
    blurb:
      "Two noisy 2D blobs, one majority class. Get more labels right than always guessing the majority.",
    metric: "accuracy",
    higherIsBetter: true,
    baselineScore: 0.6666666666666666,
    baselineName: "Majority class",
    datasetDescription:
      "Two overlapping square blobs in 2D. Class 1 is centred at (0.9, 0.45) and class 0 at (-0.9, -0.45); each coordinate is the centre plus uniform noise in [-1.5, 1.5]. Class 1 lands on every third row. 60 train rows and 30 hidden test rows, generated with an LCG (seed 21: state = (1664525 * state + 1013904223) mod 2^32).",
    trainData: BLOBS.train,
    testData: BLOBS.test,
    starterCode: `def solve(train_X, train_y, test_X):
    # Baseline: always predict the most common training label.
    counts = {}
    for label in train_y:
        counts[label] = counts.get(label, 0) + 1
    best = max(counts, key=lambda k: (counts[k], -k))
    return [best for _ in test_X]
`,
    hint:
      "Standardize both features and fit logistic regression with a few hundred steps of gradient descent. The blobs are nearly linearly separable, so even a plain linear boundary clears the majority baseline.",
    points: 20,
  },
  {
    id: "nonlinear-regression-chase",
    title: "Nonlinear Regression Chase",
    blurb:
      "The data follows a parabola plus noise. A straight line leaves the curve on the table — add curvature and drive MSE down.",
    metric: "mse",
    higherIsBetter: false,
    baselineScore: 0.4432152554589641,
    baselineName: "Linear regression",
    datasetDescription:
      "One feature x drawn uniformly from [-1, 1]. The label is 2x² - x + 0.5 plus independent uniform noise in [-0.2, 0.2]. 50 train rows and 25 hidden test rows from a single LCG stream (seed 7), two draws per row (x then noise).",
    trainData: QUAD.train,
    testData: QUAD.test,
    starterCode: `def solve(train_X, train_y, test_X):
    # Baseline: least-squares line y = intercept + slope * x.
    n = len(train_X)
    sx = sum(row[0] for row in train_X)
    sy = sum(train_y)
    sxx = sum(row[0] * row[0] for row in train_X)
    sxy = sum(row[0] * y for row, y in zip(train_X, train_y))
    denom = n * sxx - sx * sx
    slope = (n * sxy - sx * sy) / denom
    intercept = (sy - slope * sx) / n
    return [intercept + slope * row[0] for row in test_X]
`,
    hint:
      "Fit y = c0 + c1·x + c2·x² with the normal equations: build the 3×3 system and solve it with Gaussian elimination. Pure Python is enough — no libraries needed.",
    points: 25,
  },
  {
    id: "imbalanced-signal-hunt",
    title: "Imbalanced Signal Hunt",
    blurb:
      "Twenty features, mostly noise, and rare positives. Beat the all-negative baseline by finding the sparse signal.",
    metric: "f1",
    higherIsBetter: true,
    baselineScore: 0,
    baselineName: "Always negative",
    datasetDescription:
      "20 features drawn uniformly from [0, 1]. The label is 1 when 4·f3 - 4·f11 + 3·f17 - 3 plus uniform noise in [-0.6, 0.6] is positive, which makes roughly a fifth of the rows positive. 60 train rows and 30 hidden test rows from one LCG stream (seed 33), 21 draws per row.",
    trainData: IMBALANCED.train,
    testData: IMBALANCED.test,
    starterCode: `def solve(train_X, train_y, test_X):
    # Baseline: always predict the negative class.
    return [0 for _ in test_X]
`,
    hint:
      "Most of the 20 columns are irrelevant. Standardize every feature and run logistic regression with gradient descent — the weights on f3, f11, and f17 will pull away from zero while the noise columns stay near it.",
    points: 30,
  },
  {
    id: "noisy-sensor-denoising",
    title: "Noisy Sensor Denoising",
    blurb:
      "Each row is five noisy samples of a triangle-wave sensor ending at time t. Beat the trailing moving average on MSE.",
    metric: "mse",
    higherIsBetter: false,
    baselineScore: 0.2575446295977456,
    baselineName: "Moving average",
    datasetDescription:
      "A period-20 triangle wave with slope +0.25 for ten steps and -0.25 for the next ten, plus independent uniform noise in [-0.5, 0.5]. Every row holds the last five noisy samples (t-4 … t) and the label is the clean signal at t. 60 train rows (t = 4 … 63) and 30 hidden test rows (t = 64 … 93) share one LCG stream (seed 44).",
    trainData: SENSOR.train,
    testData: SENSOR.test,
    starterCode: `def solve(train_X, train_y, test_X):
    # Baseline: trailing moving average over the five-sample window.
    return [sum(row) / len(row) for row in test_X]
`,
    hint:
      "A trailing mean lags a ramp by two steps. Fit a least-squares line to each window and evaluate it at the last point — or learn the five filter weights (plus a bias) from the training rows.",
    points: 25,
  },
  {
    id: "mini-language-model",
    title: "Mini Language Model",
    blurb:
      "Next-token prediction over a four-token alphabet generated by a 2nd-order Markov process. Beat the unigram frequency baseline.",
    metric: "accuracy",
    higherIsBetter: true,
    baselineScore: 0.3,
    baselineName: "Unigram frequency",
    datasetDescription:
      "Rows are four-token contexts from the alphabet {0, 1, 2, 3} and the label is the next token. The next token is a deterministic function of the previous two tokens 85% of the time and a uniform draw otherwise. 70 train rows and 30 hidden test rows from one LCG stream (seed 55).",
    trainData: LANGUAGE.train,
    testData: LANGUAGE.test,
    starterCode: `def solve(train_X, train_y, test_X):
    # Baseline: always predict the most frequent next token (unigram).
    counts = {}
    for label in train_y:
        counts[label] = counts.get(label, 0) + 1
    best = max(counts, key=lambda k: (counts[k], -k))
    return [best for _ in test_X]
`,
    hint:
      "The next token depends on the last two tokens. Count (previous two tokens → next token) transitions and predict the most frequent continuation, falling back to the unigram pick for pairs you never saw.",
    points: 35,
  },
];
