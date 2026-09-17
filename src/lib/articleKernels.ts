export interface KernelPoint {
  x: number;
  y: number;
}

export interface KernelLabeledPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

export type KernelRule = "logistic" | "mse";

export interface KernelWeights {
  w1: number;
  w2: number;
  b: number;
}

export interface KernelFit extends KernelWeights {
  curve: number[];
  loss: number;
  accuracy: number;
  correct: number;
}

export interface KernelKMeansSnapshot {
  centroids: KernelPoint[];
  assignments: number[];
  inertia: number;
  iter: number;
  converged: boolean;
}

export interface KernelQuestion {
  id: string;
  prompt: string;
  choices: number[];
  answerIndex: number;
  explain: string;
}

export const GD_STEPS = 300;

export const GD_INITIAL_POINTS: KernelLabeledPoint[] = [
  { x: 0.3, y: 0.65, label: 1 },
  { x: 0.6, y: 0.4, label: 1 },
  { x: 0.75, y: 0.8, label: 1 },
  { x: 0.4, y: 0.95, label: 1 },
  { x: 0.95, y: 0.35, label: 1 },
  { x: 0.2, y: 0.45, label: 1 },
  { x: 0.65, y: 0.15, label: 1 },
  { x: -0.35, y: -0.6, label: -1 },
  { x: -0.65, y: -0.35, label: -1 },
  { x: -0.8, y: -0.75, label: -1 },
  { x: -0.45, y: -0.9, label: -1 },
  { x: -0.95, y: -0.3, label: -1 },
  { x: -0.25, y: -0.5, label: -1 },
  { x: -0.6, y: -0.15, label: -1 },
];

function clampValue(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

function modulo(value: number, base: number): number {
  if (!Number.isFinite(value)) return 0;
  return ((Math.round(value) % base) + base) % base;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatKernelChoice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

export function softmaxWithTemperature(
  logits: number[],
  temp: number,
): number[] {
  const scaled = logits.map((z) => z / temp);
  const max = Math.max(...scaled);
  const exps = scaled.map((z) => Math.exp(z - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function gumbelPick(
  logits: number[],
  gumbel: number[],
  temp: number,
): number {
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    const score = logits[i] / temp + gumbel[i];
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function probability(
  p: KernelLabeledPoint,
  w1: number,
  w2: number,
  b: number,
): number {
  return sigmoid(w1 * p.x + w2 * p.y + b);
}

export function meanLoss(
  points: KernelLabeledPoint[],
  rule: KernelRule,
  w1: number,
  w2: number,
  b: number,
): number {
  if (points.length === 0) return 0;
  let total = 0;
  for (const p of points) {
    const prob = clampValue(probability(p, w1, w2, b), 1e-9, 1 - 1e-9);
    const y = p.label === 1 ? 1 : 0;
    total +=
      rule === "logistic"
        ? -(y * Math.log(prob) + (1 - y) * Math.log(1 - prob))
        : (prob - y) * (prob - y);
  }
  return total / points.length;
}

export function sgdStep(
  p: KernelLabeledPoint,
  rule: KernelRule,
  lr: number,
  w1: number,
  w2: number,
  b: number,
): KernelWeights {
  const y = p.label === 1 ? 1 : 0;
  const prob = sigmoid(w1 * p.x + w2 * p.y + b);
  const err = rule === "logistic" ? prob - y : (prob - y) * prob * (1 - prob);
  return {
    w1: w1 - lr * err * p.x,
    w2: w2 - lr * err * p.y,
    b: b - lr * err,
  };
}

export function fitLogistic(
  points: KernelLabeledPoint[],
  rule: KernelRule,
  lr: number,
  steps: number,
): KernelFit {
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  const curve: number[] = [meanLoss(points, rule, w1, w2, b)];

  for (let s = 0; s < steps; s++) {
    const p = points[s % points.length];
    const next = sgdStep(p, rule, lr, w1, w2, b);
    w1 = next.w1;
    w2 = next.w2;
    b = next.b;
    if ((s + 1) % 5 === 0) curve.push(meanLoss(points, rule, w1, w2, b));
  }

  let correct = 0;
  for (const p of points) {
    const predicted = probability(p, w1, w2, b) >= 0.5 ? 1 : -1;
    if (predicted === p.label) correct += 1;
  }
  return {
    w1,
    w2,
    b,
    curve,
    loss: curve[curve.length - 1],
    accuracy: points.length > 0 ? correct / points.length : 0,
    correct,
  };
}

export function nearestCentroid(
  p: KernelPoint,
  centroids: KernelPoint[],
): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < centroids.length; i++) {
    const dx = p.x - centroids[i].x;
    const dy = p.y - centroids[i].y;
    const d = dx * dx + dy * dy;
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
}

export function assignAll(
  points: KernelPoint[],
  centroids: KernelPoint[],
): number[] {
  return points.map((p) => nearestCentroid(p, centroids));
}

export function inertiaOf(
  points: KernelPoint[],
  centroids: KernelPoint[],
  assignments: number[],
): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const c = centroids[assignments[i]];
    total += (points[i].x - c.x) ** 2 + (points[i].y - c.y) ** 2;
  }
  return total;
}

export function centroidUpdate(
  points: KernelPoint[],
  assignments: number[],
  centroids: KernelPoint[],
): KernelPoint[] {
  const sums = centroids.map(() => ({ x: 0, y: 0, n: 0 }));
  for (let i = 0; i < points.length; i++) {
    const c = assignments[i];
    sums[c].x += points[i].x;
    sums[c].y += points[i].y;
    sums[c].n += 1;
  }
  return centroids.map((c, i) =>
    sums[i].n > 0
      ? { x: sums[i].x / sums[i].n, y: sums[i].y / sums[i].n }
      : { ...c },
  );
}

export function kMeansInitial(
  points: KernelPoint[],
  centroids: KernelPoint[],
): KernelKMeansSnapshot {
  const copy = centroids.map((c) => ({ ...c }));
  const assignments = assignAll(points, copy);
  return {
    centroids: copy,
    assignments,
    inertia: inertiaOf(points, copy, assignments),
    iter: 0,
    converged: false,
  };
}

export function kMeansStep(
  points: KernelPoint[],
  prev: KernelKMeansSnapshot,
): KernelKMeansSnapshot {
  if (prev.converged) return prev;
  const assignments = assignAll(points, prev.centroids);
  const centroids = centroidUpdate(points, assignments, prev.centroids);
  const moved = centroids.some(
    (c, i) =>
      Math.hypot(c.x - prev.centroids[i].x, c.y - prev.centroids[i].y) > 1e-9,
  );
  const changed = assignments.some((a, i) => a !== prev.assignments[i]);
  return {
    centroids,
    assignments,
    inertia: inertiaOf(points, centroids, assignments),
    iter: prev.iter + 1,
    converged: !moved && !changed,
  };
}

export function runKMeans(
  points: KernelPoint[],
  start: KernelKMeansSnapshot,
  maxIter = 50,
): KernelKMeansSnapshot {
  let next = start;
  for (let i = 0; i < maxIter && !next.converged; i++) {
    next = kMeansStep(points, next);
  }
  return next;
}

interface ChoiceOptions {
  correct: number;
  candidates: number[];
  decimals: number;
  deltas: number[];
  min?: number;
  max?: number;
}

function buildChoices(options: ChoiceOptions): {
  choices: number[];
  answerIndex: number;
} {
  const answer = roundTo(options.correct, options.decimals);
  const kept: number[] = [answer];
  const inBounds = (value: number) =>
    (options.min === undefined || value >= options.min) &&
    (options.max === undefined || value <= options.max);
  const push = (value: number) => {
    if (kept.length >= 4) return;
    if (!Number.isFinite(value)) return;
    const rounded = roundTo(value, options.decimals);
    if (!inBounds(rounded)) return;
    if (kept.some((v) => v === rounded)) return;
    kept.push(rounded);
  };
  for (const candidate of options.candidates) push(candidate);
  for (const delta of options.deltas) push(answer + delta);
  kept.sort((a, b) => a - b);
  return { choices: kept, answerIndex: kept.indexOf(answer) };
}

export interface SoftmaxQuestionParams {
  logits: number[];
  tokens: string[];
  temp: number;
  variant?: number;
}

export function buildSoftmaxQuestion(
  params: SoftmaxQuestionParams,
): KernelQuestion {
  const logits = params.logits;
  const temp = clampValue(params.temp, 1e-3, 1e3);
  const variant = modulo(params.variant ?? 0, 3);
  const probs = softmaxWithTemperature(logits, temp);
  const token = (index: number) =>
    params.tokens[index] ?? `token ${index + 1}`;
  const ranked = probs
    .map((p, index) => ({ p, index }))
    .sort((a, b) => b.p - a.p);
  const uniform = 1 / logits.length;

  if (variant === 0) {
    const top = ranked[0].index;
    const { choices, answerIndex } = buildChoices({
      correct: probs[top],
      candidates: [uniform, ...probs.filter((_, index) => index !== top)],
      decimals: 4,
      deltas: [0.001, -0.001, 0.002, -0.002],
      min: 0,
      max: 1,
    });
    return {
      id: `softmax-top-t${temp.toFixed(2)}-a${formatKernelChoice(choices[answerIndex])}`,
      prompt: `At T = ${temp.toFixed(2)}, what is p(${token(top)}) for the top-logit token, to 4 decimals?`,
      choices,
      answerIndex,
      explain:
        "p_i = exp(z_i/T) / sum_j exp(z_j/T); temperature rescales the gaps but never the ranking.",
    };
  }

  if (variant === 1) {
    const index = 1 % logits.length;
    const { choices, answerIndex } = buildChoices({
      correct: probs[index],
      candidates: [uniform, ...probs.filter((_, i) => i !== index)],
      decimals: 4,
      deltas: [0.001, -0.001, 0.002, -0.002],
      min: 0,
      max: 1,
    });
    return {
      id: `softmax-second-t${temp.toFixed(2)}-a${formatKernelChoice(choices[answerIndex])}`,
      prompt: `At T = ${temp.toFixed(2)}, what is p(${token(index)}) to 4 decimals?`,
      choices,
      answerIndex,
      explain: `p_i = exp(z_i/T) / sum_j exp(z_j/T) evaluated for ${token(index)} at T = ${temp.toFixed(2)}.`,
    };
  }

  const topTwo = ranked
    .slice(0, 2)
    .reduce((sum, entry) => sum + entry.p, 0);
  const bottomTwo = ranked
    .slice(-2)
    .reduce((sum, entry) => sum + entry.p, 0);
  const runnerUp = ranked[Math.min(1, ranked.length - 1)].p;
  const { choices, answerIndex } = buildChoices({
    correct: topTwo,
    candidates: [ranked[0].p, runnerUp, bottomTwo, 1],
    decimals: 4,
    deltas: [0.001, -0.001, 0.002, -0.002],
    min: 0,
    max: 1,
  });
  return {
    id: `softmax-sum-t${temp.toFixed(2)}-a${formatKernelChoice(choices[answerIndex])}`,
    prompt: `At T = ${temp.toFixed(2)}, what is the sum of the two largest probabilities, to 4 decimals?`,
    choices,
    answerIndex,
    explain:
      "Summing the top two bars of p_i = exp(z_i/T) / sum_j exp(z_j/T) gives the mass sitting on the two leaders.",
  };
}

export interface GradientDescentQuestionParams {
  points: KernelLabeledPoint[];
  rule: KernelRule;
  lr: number;
  variant?: number;
  steps?: number;
}

export function buildGradientDescentQuestion(
  params: GradientDescentQuestionParams,
): KernelQuestion {
  const points =
    params.points.length > 0 ? params.points : GD_INITIAL_POINTS;
  const rule: KernelRule = params.rule === "mse" ? "mse" : "logistic";
  const otherRule: KernelRule = rule === "logistic" ? "mse" : "logistic";
  const lr = clampValue(params.lr, 0.05, 2);
  const steps = Math.max(1, Math.round(params.steps ?? GD_STEPS));
  const variant = modulo(params.variant ?? 0, 3);
  const ruleLabel = rule === "logistic" ? "log loss" : "mean squared error";

  if (variant === 0) {
    const fit = fitLogistic(points, rule, lr, steps);
    const { choices, answerIndex } = buildChoices({
      correct: fit.loss,
      candidates: [
        fitLogistic(points, otherRule, lr, steps).loss,
        fitLogistic(points, rule, clampValue(lr * 0.5, 0.05, 2), steps).loss,
        fitLogistic(points, rule, clampValue(lr * 2, 0.05, 2), steps).loss,
      ],
      decimals: 4,
      deltas: [0.001, -0.001, 0.002, -0.002],
    });
    return {
      id: `gd-loss-${rule}-lr${lr.toFixed(2)}-s${steps}-a${formatKernelChoice(choices[answerIndex])}`,
      prompt: `With ${ruleLabel} and lr = ${lr.toFixed(2)}, what is the loss after ${steps} SGD steps, to 4 decimals?`,
      choices,
      answerIndex,
      explain:
        rule === "logistic"
          ? "SGD uses w -= lr * (p - y) * x and b -= lr * (p - y); the final loss averages -[y log p + (1 - y) log(1 - p)]."
          : "SGD uses w -= lr * (p - y)p(1 - p) * x and b -= lr * (p - y)p(1 - p); the final loss averages (p - y)^2.",
    };
  }

  if (variant === 1) {
    const first = points[0];
    const step = sgdStep(first, rule, lr, 0, 0, 0);
    const { choices, answerIndex } = buildChoices({
      correct: step.b,
      candidates: [
        sgdStep(first, otherRule, lr, 0, 0, 0).b,
        sgdStep(first, rule, clampValue(lr * 0.5, 0.05, 2), 0, 0, 0).b,
        step.w1,
        step.w2,
      ],
      decimals: 4,
      deltas: [0.001, -0.001, 0.002, -0.002],
    });
    return {
      id: `gd-bias-${rule}-lr${lr.toFixed(2)}-a${formatKernelChoice(choices[answerIndex])}`,
      prompt: `From w1 = w2 = b = 0, one ${ruleLabel} update on the first point at lr = ${lr.toFixed(2)} makes b equal to what, to 4 decimals?`,
      choices,
      answerIndex,
      explain:
        "p = sigmoid(w1 x + w2 y + b) starts at 0.5, then b -= lr * err with err = p - y for log loss or (p - y)p(1 - p) for MSE.",
    };
  }

  const fit = fitLogistic(points, rule, lr, steps);
  const { choices, answerIndex } = buildChoices({
    correct: fit.correct,
    candidates: [
      points.length - fit.correct,
      fitLogistic(points, otherRule, lr, steps).correct,
      fitLogistic(points, rule, clampValue(lr * 2, 0.05, 2), steps).correct,
    ],
    decimals: 0,
    deltas: [1, -1, 2, -2],
    min: 0,
    max: points.length,
  });
  return {
    id: `gd-correct-${rule}-lr${lr.toFixed(2)}-s${steps}-a${formatKernelChoice(choices[answerIndex])}`,
    prompt: `After ${steps} ${ruleLabel} steps at lr = ${lr.toFixed(2)}, how many of the ${points.length} points are classified correctly?`,
    choices,
    answerIndex,
    explain:
      "A point is correct when sigmoid(w1 x + w2 y + b) >= 0.5 matches its label after the full SGD run.",
  };
}

export interface KMeansQuestionParams {
  points: KernelPoint[];
  centroids: KernelPoint[];
  variant?: number;
}

export function buildKMeansQuestion(
  params: KMeansQuestionParams,
): KernelQuestion {
  const points = params.points;
  const centroids = params.centroids;
  const variant = modulo(params.variant ?? 0, 4);

  if (centroids.length === 0) {
    const { choices, answerIndex } = buildChoices({
      correct: 0,
      candidates: [points.length],
      decimals: 0,
      deltas: [1, 2, 3, 4],
      min: 0,
    });
    return {
      id: "kmeans-empty",
      prompt: "Place at least one centroid before predicting a readout.",
      choices,
      answerIndex,
      explain:
        "Inertia is the sum of squared distances to the nearest centroid; with no centroids there is nothing to assign.",
    };
  }

  const assignments = assignAll(points, centroids);
  const counts = centroids.map(
    (_, cluster) => assignments.filter((a) => a === cluster).length,
  );

  if (variant < 3) {
    const cluster = Math.min(variant, centroids.length - 1);
    const { choices, answerIndex } = buildChoices({
      correct: counts[cluster],
      candidates: [
        ...counts.filter((_, index) => index !== cluster),
        points.length,
      ],
      decimals: 0,
      deltas: [1, -1, 2, -2],
      min: 0,
      max: points.length,
    });
    return {
      id: `kmeans-count-${cluster}-n${assignments.join("")}-a${formatKernelChoice(choices[answerIndex])}`,
      prompt: `After the next assignment step, how many of the ${points.length} points join cluster ${cluster + 1}?`,
      choices,
      answerIndex,
      explain: `Assignment gives every point to its nearest centroid by squared distance, ties to the lower index; cluster ${cluster + 1} holds the points nearest to centroid ${cluster + 1}.`,
    };
  }

  const first = kMeansStep(points, kMeansInitial(points, centroids));
  const second = kMeansStep(points, first);
  const currentInertia = inertiaOf(points, centroids, assignments);
  const { choices, answerIndex } = buildChoices({
    correct: first.inertia,
    candidates: [currentInertia, second.inertia],
    decimals: 4,
    deltas: [0.01, -0.01, 0.1, -0.1],
    min: 0,
  });
  return {
    id: `kmeans-inertia-${first.inertia.toFixed(4)}`,
    prompt:
      "After the next assignment + update step, what is the total inertia, to 4 decimals?",
    choices,
    answerIndex,
    explain:
      "Inertia = sum over points of squared distance to the assigned centroid; one step assigns, then moves each centroid to its cluster mean.",
  };
}

export type KernelQuestionRequest =
  | { kind: "softmax-temperature"; params: SoftmaxQuestionParams }
  | { kind: "gradient-descent"; params: GradientDescentQuestionParams }
  | { kind: "kmeans"; params: KMeansQuestionParams };

export function buildKernelQuestion(
  request: KernelQuestionRequest,
): KernelQuestion {
  if (request.kind === "softmax-temperature") {
    return buildSoftmaxQuestion(request.params);
  }
  if (request.kind === "gradient-descent") {
    return buildGradientDescentQuestion(request.params);
  }
  return buildKMeansQuestion(request.params);
}
