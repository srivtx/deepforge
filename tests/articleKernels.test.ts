import { describe, expect, test } from "bun:test";
import {
  GD_INITIAL_POINTS,
  GD_STEPS,
  assignAll,
  buildGradientDescentQuestion,
  buildKMeansQuestion,
  buildKernelQuestion,
  buildSoftmaxQuestion,
  centroidUpdate,
  fitLogistic,
  formatKernelChoice,
  gumbelPick,
  inertiaOf,
  kMeansInitial,
  kMeansStep,
  meanLoss,
  nearestCentroid,
  roundTo,
  runKMeans,
  sgdStep,
  sigmoid,
  softmaxWithTemperature,
  type KernelLabeledPoint,
  type KernelPoint,
} from "@/lib/articleKernels";

const LOGITS = [2.4, 2.1, 0.7, -0.4];
const TOKENS = ["cat", "dog", "fox", "eel"];
const GUMBEL = [0.2, -0.6, 1.4, 1.9];

const KMEANS_POINTS: KernelPoint[] = [
  { x: 0, y: 0 },
  { x: 0.2, y: 0.1 },
  { x: -0.1, y: -0.2 },
  { x: 4, y: 4 },
  { x: 4.2, y: 4.1 },
  { x: -4, y: 3 },
  { x: -3.8, y: 3.2 },
];

const KMEANS_CENTROIDS: KernelPoint[] = [
  { x: 0, y: 0 },
  { x: 3, y: 3 },
  { x: -3, y: -0.5 },
];

const TWO_POINTS: KernelLabeledPoint[] = [
  { x: 0, y: 0, label: 1 },
  { x: 0, y: 0, label: -1 },
];

const ONE_POINT: KernelLabeledPoint[] = [{ x: 0, y: 0, label: 1 }];

describe("softmax kernel parity", () => {
  test("softmax with temperature matches hand-computed fixtures", () => {
    expect(softmaxWithTemperature([2, 0], 2)).toEqual([
      0.7310585786300049,
      0.2689414213699951,
    ]);
    expect(softmaxWithTemperature([0, 0, 0], 1)).toEqual([
      1 / 3,
      1 / 3,
      1 / 3,
    ]);
    const flattened = softmaxWithTemperature([5, -5], 1e9);
    expect(Math.abs(flattened[0] - flattened[1])).toBeLessThan(1e-8);
  });

  test("softmax probabilities always sum to one", () => {
    for (const temp of [0.05, 0.5, 1, 2.5, 5]) {
      const sum = softmaxWithTemperature(LOGITS, temp).reduce(
        (a, b) => a + b,
        0,
      );
      expect(Math.abs(sum - 1)).toBeLessThan(1e-12);
    }
  });

  test("gumbel pick follows logits/T + gumbel and keeps the lower index on ties", () => {
    expect(gumbelPick(LOGITS, GUMBEL, 1)).toBe(0);
    expect(gumbelPick(LOGITS, GUMBEL, 5)).toBe(3);
    expect(gumbelPick(LOGITS, GUMBEL, 0.05)).toBe(0);
    expect(gumbelPick([1, 0], [0.1, 1.1], 1)).toBe(0);
    expect(gumbelPick([0, 1], [0.1, 1.1], 1)).toBe(1);
  });
});

describe("gradient-descent kernel parity", () => {
  test("sigmoid matches hand-computed values", () => {
    expect(sigmoid(0)).toBe(0.5);
    expect(sigmoid(1)).toBe(0.7310585786300049);
    expect(sigmoid(-1)).toBe(0.2689414213699951);
  });

  test("mean loss matches the two-point hand fixture", () => {
    expect(meanLoss(TWO_POINTS, "logistic", 0, 0, 0)).toBe(
      0.6931471805599453,
    );
    expect(meanLoss(TWO_POINTS, "mse", 0, 0, 0)).toBe(0.25);
    expect(meanLoss([], "logistic", 0, 0, 0)).toBe(0);
  });

  test("one SGD step from zero weights matches hand computation", () => {
    const p: KernelLabeledPoint = { x: 0.5, y: -0.25, label: 1 };
    const logistic = sgdStep(p, "logistic", 0.6, 0, 0, 0);
    expect(logistic.b).toBe(0.3);
    expect(logistic.w1).toBe(0.15);
    expect(logistic.w2).toBe(-0.075);
    const mse = sgdStep(p, "mse", 0.6, 0, 0, 0);
    expect(mse.b).toBe(0.075);
    expect(mse.w1).toBe(0.0375);
    expect(mse.w2).toBe(-0.01875);
  });

  test("fitLogistic matches the single-point hand fixture", () => {
    const fit = fitLogistic(ONE_POINT, "logistic", 1, 1);
    expect(fit.w1).toBe(0);
    expect(fit.w2).toBe(0);
    expect(fit.b).toBe(0.5);
    expect(fit.curve).toEqual([0.6931471805599453]);
    expect(fit.loss).toBe(0.6931471805599453);
    expect(fit.accuracy).toBe(1);
    expect(fit.correct).toBe(1);
  });

  test("fitLogistic samples the curve every five steps", () => {
    const frozen = fitLogistic(ONE_POINT, "logistic", 0, 5);
    expect(frozen.curve).toEqual([
      0.6931471805599453,
      0.6931471805599453,
    ]);
    const twoPushes = fitLogistic(ONE_POINT, "logistic", 0, 10);
    expect(twoPushes.curve).toHaveLength(3);
  });
});

describe("k-means kernel parity", () => {
  test("nearest centroid matches hand-computed distances and ties", () => {
    expect(
      nearestCentroid({ x: 0, y: 0 }, [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ]),
    ).toBe(0);
    expect(
      nearestCentroid({ x: 0, y: 0 }, [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ]),
    ).toBe(0);
    expect(
      nearestCentroid({ x: 0, y: 0 }, [
        { x: 5, y: 0 },
        { x: 1, y: 0 },
      ]),
    ).toBe(1);
  });

  test("assignment and inertia match the hand fixture", () => {
    const points: KernelPoint[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    const centroids: KernelPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    expect(assignAll(points, centroids)).toEqual([0, 0]);
    expect(inertiaOf(points, centroids, [0, 0])).toBe(4);
    expect(centroidUpdate(points, [0, 0], centroids)).toEqual([
      { x: 1, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  test("one step assigns then updates and inertia only falls", () => {
    const points: KernelPoint[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    const start = kMeansInitial(points, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(start.assignments).toEqual([0, 0]);
    expect(start.inertia).toBe(4);
    expect(start.iter).toBe(0);
    expect(start.converged).toBe(false);

    const step = kMeansStep(points, start);
    expect(step.assignments).toEqual([0, 0]);
    expect(step.centroids).toEqual([
      { x: 1, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(step.inertia).toBe(2);
    expect(step.iter).toBe(1);
    expect(step.converged).toBe(false);

    const settled = runKMeans(points, start, 50);
    expect(settled.converged).toBe(true);
    expect(settled.iter).toBe(2);
    expect(settled.inertia).toBe(2);
    expect(kMeansStep(points, settled)).toBe(settled);
  });
});

describe("kernel question builders", () => {
  const softmax = (
    temp: number,
    variant = 0,
  ): ReturnType<typeof buildSoftmaxQuestion> =>
    buildSoftmaxQuestion({ logits: LOGITS, tokens: TOKENS, temp, variant });
  const gradient = (
    lr: number,
    variant = 0,
    rule: "logistic" | "mse" = "logistic",
  ) =>
    buildGradientDescentQuestion({
      points: GD_INITIAL_POINTS,
      rule,
      lr,
      variant,
      steps: GD_STEPS,
    });
  const kmeans = (variant = 0, centroids = KMEANS_CENTROIDS) =>
    buildKMeansQuestion({
      points: KMEANS_POINTS,
      centroids,
      variant,
    });

  const expectWellFormed = (choices: number[], answerIndex: number) => {
    expect(choices.length).toBeGreaterThanOrEqual(2);
    expect(choices.length).toBeLessThanOrEqual(4);
    expect(new Set(choices).size).toBe(choices.length);
    expect(answerIndex).toBeGreaterThanOrEqual(0);
    expect(answerIndex).toBeLessThan(choices.length);
  };

  test("softmax answers come from the same kernel that renders the bars", () => {
    const probs = softmaxWithTemperature(LOGITS, 1);
    const top = probs.indexOf(Math.max(...probs));
    const ranked = [...probs].sort((a, b) => b - a);
    const expected = [probs[top], probs[1], ranked[0] + ranked[1]];
    for (let variant = 0; variant < 3; variant++) {
      const question = softmax(1, variant);
      expectWellFormed(question.choices, question.answerIndex);
      expect(question.choices[question.answerIndex]).toBe(
        roundTo(expected[variant], 4),
      );
      expect(question.explain).toContain("exp(z_i/T)");
    }
  });

  test("softmax stays well formed across the temperature range", () => {
    for (const temp of [0.05, 0.2, 0.5, 1, 2, 5]) {
      for (let variant = 0; variant < 3; variant++) {
        const question = softmax(temp, variant);
        expectWellFormed(question.choices, question.answerIndex);
        expect(question.prompt).toContain(`T = ${temp.toFixed(2)}`);
      }
    }
  });

  test("gradient descent answers come from the same kernel that fits the line", () => {
    const fit = fitLogistic(GD_INITIAL_POINTS, "logistic", 0.6, GD_STEPS);
    const questionLoss = gradient(0.6, 0);
    const questionBias = gradient(0.6, 1);
    const questionCount = gradient(0.6, 2);
    expectWellFormed(questionLoss.choices, questionLoss.answerIndex);
    expectWellFormed(questionBias.choices, questionBias.answerIndex);
    expectWellFormed(questionCount.choices, questionCount.answerIndex);
    expect(questionLoss.choices[questionLoss.answerIndex]).toBe(
      roundTo(fit.loss, 4),
    );
    const firstStep = sgdStep(GD_INITIAL_POINTS[0], "logistic", 0.6, 0, 0, 0);
    expect(questionBias.choices[questionBias.answerIndex]).toBe(
      roundTo(firstStep.b, 4),
    );
    expect(questionCount.choices[questionCount.answerIndex]).toBe(fit.correct);
    expect(questionLoss.explain).toContain("lr");
    expect(questionBias.explain).toContain("sigmoid");
    expect(questionCount.explain).toContain(">= 0.5");
  });

  test("gradient descent stays well formed for both rules and extreme rates", () => {
    for (const rule of ["logistic", "mse"] as const) {
      for (const lr of [0.05, 0.6, 2]) {
        for (let variant = 0; variant < 3; variant++) {
          const question = gradient(lr, variant, rule);
          expectWellFormed(question.choices, question.answerIndex);
          expect(Number.isFinite(question.choices[question.answerIndex])).toBe(
            true,
          );
        }
      }
    }
  });

  test("k-means answers come from the same kernel that steps the loop", () => {
    const assignments = assignAll(KMEANS_POINTS, KMEANS_CENTROIDS);
    const counts = KMEANS_CENTROIDS.map(
      (_, cluster) => assignments.filter((a) => a === cluster).length,
    );
    for (let variant = 0; variant < 3; variant++) {
      const question = kmeans(variant);
      expectWellFormed(question.choices, question.answerIndex);
      expect(question.choices[question.answerIndex]).toBe(counts[variant]);
      expect(question.explain).toContain("nearest centroid");
    }
    const stepped = kMeansStep(
      KMEANS_POINTS,
      kMeansInitial(KMEANS_POINTS, KMEANS_CENTROIDS),
    );
    const inertiaQuestion = kmeans(3);
    expectWellFormed(
      inertiaQuestion.choices,
      inertiaQuestion.answerIndex,
    );
    expect(inertiaQuestion.choices[inertiaQuestion.answerIndex]).toBe(
      roundTo(stepped.inertia, 4),
    );
    expect(inertiaQuestion.explain).toContain("squared distance");
  });

  test("the dispatch layer returns the matching builder output", () => {
    expect(buildKernelQuestion({
      kind: "softmax-temperature",
      params: { logits: LOGITS, tokens: TOKENS, temp: 1, variant: 0 },
    })).toEqual(softmax(1, 0));
    expect(buildKernelQuestion({
      kind: "gradient-descent",
      params: {
        points: GD_INITIAL_POINTS,
        rule: "logistic",
        lr: 0.6,
        variant: 1,
      },
    })).toEqual(gradient(0.6, 1));
    expect(buildKernelQuestion({
      kind: "kmeans",
      params: {
        points: KMEANS_POINTS,
        centroids: KMEANS_CENTROIDS,
        variant: 2,
      },
    })).toEqual(kmeans(2));
  });

  test("two builds from the same params are deep-equal", () => {
    expect(softmax(0.8, 1)).toEqual(softmax(0.8, 1));
    expect(gradient(1.1, 2, "mse")).toEqual(gradient(1.1, 2, "mse"));
    expect(kmeans(3)).toEqual(kmeans(3));
  });

  test("questions regenerate when the sim params change", () => {
    expect(softmax(0.5)).not.toEqual(softmax(2));
    expect(gradient(0.1)).not.toEqual(gradient(1.9));
    expect(gradient(0.6, 0, "logistic")).not.toEqual(gradient(0.6, 0, "mse"));
    expect(
      kmeans(0, [
        { x: 0, y: 0 },
        { x: 4, y: 4 },
        { x: -4, y: -4 },
      ]),
    ).not.toEqual(kmeans(0, KMEANS_CENTROIDS));
    expect(kmeans(0)).not.toEqual(kmeans(1));
  });

  test("rounding and formatting stay stable for display", () => {
    expect(roundTo(0.7310585786300049, 4)).toBe(0.7311);
    expect(roundTo(2.99999, 0)).toBe(3);
    expect(formatKernelChoice(3)).toBe("3");
    expect(formatKernelChoice(0.7311)).toBe("0.7311");
    expect(formatKernelChoice(-0.075)).toBe("-0.0750");
  });
});
