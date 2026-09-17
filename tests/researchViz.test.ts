import { describe, expect, test } from "bun:test";
import { LABS } from "@/data/labs";
import { RESEARCH_CHALLENGES } from "@/data/research";
import {
  CORRELATION_SIGNAL_THRESHOLD,
  correlations,
  previewKindFor,
  scatterPoints,
  series,
  strongestTransition,
  transitionMatrix,
  type Dataset,
  type PreviewKind,
} from "@/lib/researchViz";

const CHALLENGE_KINDS: Record<string, PreviewKind> = {
  "tabular-classification-showdown": "scatter",
  "nonlinear-regression-chase": "scatter",
  "imbalanced-signal-hunt": "correlations",
  "noisy-sensor-denoising": "series",
  "mini-language-model": "matrix",
};

const LAB_KINDS: Record<string, PreviewKind> = {
  "lab-01": "scatter",
  "lab-02": "scatter",
  "lab-03": "scatter",
  "lab-04": "scatter",
  "lab-05": "scatter",
  "lab-06": "scatter",
  "lab-07": "scatter",
  "lab-08": "scatter",
};

const SIGNAL_COLUMNS = [3, 11, 17];

function allDatasets(): Dataset[] {
  const sets: Dataset[] = [];
  for (const challenge of RESEARCH_CHALLENGES) {
    sets.push(challenge.trainData, challenge.testData);
  }
  for (const lab of LABS) {
    sets.push(lab.trainData, lab.testData);
  }
  return sets;
}

function cloneDataset(data: Dataset): Dataset {
  return JSON.parse(JSON.stringify(data)) as Dataset;
}

function absoluteSorted(values: number[]): number[] {
  return values.map((value) => Math.abs(value)).sort((a, b) => a - b);
}

describe("previewKindFor", () => {
  test("maps every research challenge to its intended preview", () => {
    expect(Object.keys(CHALLENGE_KINDS).sort()).toEqual(
      RESEARCH_CHALLENGES.map((challenge) => challenge.id).sort(),
    );
    for (const challenge of RESEARCH_CHALLENGES) {
      const expected = CHALLENGE_KINDS[challenge.id];
      expect(previewKindFor(challenge.trainData), challenge.id).toBe(expected);
      expect(previewKindFor(challenge.testData), `${challenge.id}/test`).toBe(
        expected,
      );
    }
  });

  test("maps every lab to its intended preview", () => {
    expect(Object.keys(LAB_KINDS).sort()).toEqual(
      LABS.map((lab) => lab.id).sort(),
    );
    for (const lab of LABS) {
      const expected = LAB_KINDS[lab.id];
      expect(previewKindFor(lab.trainData), lab.id).toBe(expected);
      expect(previewKindFor(lab.testData), `${lab.id}/test`).toBe(expected);
    }
  });

  test("falls back to scatter for shapes the previews do not special-case", () => {
    expect(previewKindFor({ features: [], labels: [] })).toBe("scatter");
    expect(
      previewKindFor({ features: [[0.1, 0.2, 0.3]], labels: [1] }),
    ).toBe("scatter");
    expect(
      previewKindFor({
        features: [[0.1, 0.2, 0.3, 0.4]],
        labels: [0],
      }),
    ).toBe("scatter");
    expect(
      previewKindFor({ features: [[0, 1, 2, 3]], labels: [[1, 0, 0, 0]] }),
    ).toBe("scatter");
    const wide: Dataset = {
      features: Array.from({ length: 13 }, () =>
        Array.from({ length: 13 }, (_, column) => column / 13),
      ),
      labels: Array.from({ length: 13 }, (_, index) => index % 2),
    };
    expect(previewKindFor(wide)).toBe("correlations");
  });
});

describe("determinism", () => {
  test("same input yields deep-equal output on every derivation", () => {
    for (const data of allDatasets()) {
      const copy = cloneDataset(data);
      expect(scatterPoints(copy)).toEqual(scatterPoints(data));
      expect(correlations(copy)).toEqual(correlations(data));
      expect(transitionMatrix(copy)).toEqual(transitionMatrix(data));
      expect(series(copy)).toEqual(series(data));
      expect(previewKindFor(copy)).toBe(previewKindFor(data));
      expect(strongestTransition(transitionMatrix(copy))).toEqual(
        strongestTransition(transitionMatrix(data)),
      );
    }
  });
});

describe("scatterPoints", () => {
  test("emits one point per row using the first two features", () => {
    for (const data of allDatasets()) {
      const points = scatterPoints(data);
      expect(points, `rows ${data.features.length}`).toHaveLength(
        data.features.length,
      );
      points.forEach((point, index) => {
        const row = data.features[index];
        const label = data.labels[index];
        expect(point.x).toBe(row[0]);
        expect(point.y).toBe(row.length >= 2 ? row[1] : label);
        expect(point.label).toBe(typeof label === "number" ? label : 0);
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
        expect(Number.isFinite(point.label)).toBe(true);
      });
    }
    expect(scatterPoints({ features: [], labels: [] })).toEqual([]);
  });
});

describe("correlations", () => {
  test("returns one Pearson r per feature column against the label", () => {
    for (const data of allDatasets()) {
      const columns = data.features[0]?.length ?? 0;
      expect(correlations(data), `${data.features.length} rows`).toHaveLength(
        columns,
      );
    }
    expect(correlations({ features: [], labels: [] })).toEqual([]);
  });

  test("matches closed-form values on tiny datasets", () => {
    expect(
      correlations({ features: [[1], [2], [3]], labels: [2, 4, 6] }),
    ).toEqual([1]);
    expect(
      correlations({ features: [[1], [2], [3]], labels: [6, 4, 2] }),
    ).toEqual([-1]);
    expect(
      correlations({ features: [[1], [1], [1]], labels: [0, 1, 0] }),
    ).toEqual([0]);
  });

  test("separates the sparse signal columns from the noise columns", () => {
    const imbalanced = RESEARCH_CHALLENGES.find(
      (challenge) => challenge.id === "imbalanced-signal-hunt",
    );
    expect(imbalanced === undefined).toBe(false);
    for (const split of [imbalanced!.trainData, imbalanced!.testData]) {
      const values = correlations(split);
      const noise = values.filter(
        (_, index) => !SIGNAL_COLUMNS.includes(index),
      );
      const signal = SIGNAL_COLUMNS.map((index) => Math.abs(values[index]));
      const noiseSorted = absoluteSorted(noise);
      const medianNoise = noiseSorted[Math.floor(noiseSorted.length / 2)];
      const maxNoise = noiseSorted[noiseSorted.length - 1];

      expect(Math.min(...signal)).toBeGreaterThan(medianNoise);
      expect(Math.min(...signal)).toBeGreaterThan(maxNoise);
      expect(Math.max(...signal)).toBeGreaterThan(
        CORRELATION_SIGNAL_THRESHOLD,
      );
      expect(values[3]).toBeGreaterThan(0);
      expect(values[11]).toBeLessThan(0);
      expect(values[17]).toBeGreaterThan(0);
    }
  });
});

describe("transitionMatrix", () => {
  test("counts last-token to next-token transitions", () => {
    const matrix = transitionMatrix({
      features: [
        [1, 1, 1, 3],
        [0, 0, 0, 2],
        [1, 1, 1, 1],
      ],
      labels: [0, 1, 3],
    });
    expect(matrix).toHaveLength(4);
    for (const row of matrix) expect(row).toHaveLength(4);
    expect(matrix[3][0]).toBe(1);
    expect(matrix[2][1]).toBe(1);
    expect(matrix[1][3]).toBe(1);
    expect(matrix.flat().reduce((a, b) => a + b, 0)).toBe(3);
  });

  test("stays a 4x4 table with bounded, dominant rows on the language data", () => {
    const language = RESEARCH_CHALLENGES.find(
      (challenge) => challenge.id === "mini-language-model",
    );
    expect(language === undefined).toBe(false);
    for (const split of [language!.trainData, language!.testData]) {
      const matrix = transitionMatrix(split);
      const rows = split.features.length;
      expect(matrix).toHaveLength(4);
      for (const row of matrix) {
        expect(row).toHaveLength(4);
        for (const count of row) {
          expect(Number.isInteger(count)).toBe(true);
          expect(count).toBeGreaterThanOrEqual(0);
        }
      }
      const rowSums = matrix.map((row) =>
        row.reduce((sum, count) => sum + count, 0),
      );
      for (const sum of rowSums) {
        expect(sum).toBeGreaterThan(0);
        expect(sum).toBeLessThanOrEqual(rows);
      }
      expect(rowSums.reduce((a, b) => a + b, 0)).toBe(rows);
      matrix.forEach((row, index) => {
        const uniformShare = rowSums[index] / 4;
        expect(Math.max(...row), `row ${index}`).toBeGreaterThan(uniformShare);
      });
      const uniqueRows = matrix.filter((row) => {
        const max = Math.max(...row);
        return row.filter((count) => count === max).length === 1;
      });
      expect(uniqueRows.length).toBeGreaterThanOrEqual(3);
      const flat = matrix.flat();
      const globalMax = Math.max(...flat);
      expect(flat.filter((count) => count === globalMax)).toHaveLength(1);
    }
  });

  test("strongestTransition returns the heaviest cell or null when empty", () => {
    expect(
      strongestTransition([
        [0, 0, 0, 0],
        [0, 2, 1, 0],
        [0, 0, 0, 0],
        [3, 0, 0, 0],
      ]),
    ).toEqual({ from: 3, to: 0, count: 3 });
    expect(strongestTransition(transitionMatrix({ features: [], labels: [] }))).toBeNull();
  });
});

describe("series", () => {
  test("keeps labels as the clean series and window ends as the noisy one", () => {
    const sensor = RESEARCH_CHALLENGES.find(
      (challenge) => challenge.id === "noisy-sensor-denoising",
    );
    expect(sensor === undefined).toBe(false);
    for (const split of [sensor!.trainData, sensor!.testData]) {
      const { clean, noisy } = series(split);
      expect(clean).toHaveLength(split.features.length);
      expect(noisy).toHaveLength(split.features.length);
      expect(clean).toEqual(split.labels);
      noisy.forEach((value, index) => {
        expect(value).toBe(split.features[index][4]);
      });
    }
    expect(series(sensor!.trainData).clean).toHaveLength(60);
    expect(series(sensor!.testData).clean).toHaveLength(30);
    expect(series({ features: [], labels: [] })).toEqual({
      clean: [],
      noisy: [],
    });
  });
});
