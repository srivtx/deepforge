/**
 * Pure, deterministic derivations used by the dataset preview components.
 *
 * Everything here is a total function over a `Dataset` shape (features plus
 * labels) and is safe to call during server rendering: no clocks, no random
 * values, no browser APIs. The five research challenges and eight labs feed
 * these helpers directly, so the rendering layer never has to know which
 * challenge it is looking at.
 */

export interface PreviewPoint {
  x: number;
  y: number;
  label: number;
}

export interface Dataset {
  features: number[][];
  labels: (number | number[])[];
}

export type PreviewKind = "scatter" | "correlations" | "matrix" | "series";

/** Side of the token alphabet in the mini language model matrix. */
export const TOKEN_ALPHABET_SIZE = 4;

/** |r| at or above this value is treated as a meaningful correlation. */
export const CORRELATION_SIGNAL_THRESHOLD = 0.3;

/**
 * Column counts at or above this get the per-feature correlation view instead
 * of a two-axis scatter, because two axes would hide the sparse signal.
 */
export const CORRELATION_WIDE_COLUMNS = 12;

export interface TransitionCell {
  from: number;
  to: number;
  count: number;
}

function numericLabels(data: Dataset): number[] | null {
  const labels: number[] = [];
  for (const label of data.labels) {
    if (typeof label !== "number" || !Number.isFinite(label)) return null;
    labels.push(label);
  }
  return labels;
}

function columnCount(data: Dataset): number {
  return data.features[0]?.length ?? 0;
}

/**
 * True when every feature row is a fixed-length vector of small non-negative
 * integers — i.e. a sequence of token ids rather than measurements. This is
 * what separates the language challenge (token grid) from a four-feature
 * tabular set such as the credit-default lab.
 */
function isTokenAlphabet(data: Dataset): boolean {
  const columns = columnCount(data);
  if (columns === 0) return false;
  return data.features.every(
    (row) =>
      row.length === columns &&
      row.every(
        (value) =>
          Number.isInteger(value) &&
          value >= 0 &&
          value < TOKEN_ALPHABET_SIZE,
      ),
  );
}

function isTokenTarget(labels: number[]): boolean {
  return labels.every(
    (label) =>
      Number.isInteger(label) && label >= 0 && label < TOKEN_ALPHABET_SIZE,
  );
}

/**
 * Pick the most informative preview for a dataset:
 *
 * - many columns -> per-feature correlations against the label,
 * - five-sample window with numeric targets -> noisy vs clean series,
 * - integer token contexts with token targets -> transition matrix,
 * - everything else -> a two-axis scatter.
 */
export function previewKindFor(data: Dataset): PreviewKind {
  const columns = columnCount(data);
  const labels = numericLabels(data);
  if (labels && columns >= CORRELATION_WIDE_COLUMNS) return "correlations";
  if (labels && columns === 5) return "series";
  if (
    labels &&
    columns === TOKEN_ALPHABET_SIZE &&
    isTokenAlphabet(data) &&
    isTokenTarget(labels)
  ) {
    return "matrix";
  }
  return "scatter";
}

/**
 * Flatten rows into points. With two or more columns the first two features
 * form the axes; with a single column the label becomes the y value.
 */
export function scatterPoints(data: Dataset): PreviewPoint[] {
  const labels = numericLabels(data) ?? [];
  return data.features.map((row, index) => {
    const label = labels[index] ?? 0;
    const x = typeof row[0] === "number" && Number.isFinite(row[0]) ? row[0] : 0;
    const hasSecond =
      row.length >= 2 &&
      typeof row[1] === "number" &&
      Number.isFinite(row[1]);
    return { x, y: hasSecond ? row[1] : label, label };
  });
}

/**
 * Pearson correlation between each feature column and the label, in column
 * order. Columns with no variance (or unusable rows) contribute 0.
 */
export function correlations(data: Dataset): number[] {
  const labels = numericLabels(data);
  const rows = data.features;
  const n = rows.length;
  if (!labels || labels.length !== n || n === 0) return [];
  const columns = rows[0]?.length ?? 0;
  const meanLabel = labels.reduce((sum, value) => sum + value, 0) / n;
  let varLabel = 0;
  for (const label of labels) varLabel += (label - meanLabel) ** 2;

  const out: number[] = [];
  for (let c = 0; c < columns; c += 1) {
    let meanX = 0;
    let usable = true;
    for (const row of rows) {
      const value = row[c];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        usable = false;
        break;
      }
      meanX += value;
    }
    if (!usable) {
      out.push(0);
      continue;
    }
    meanX /= n;
    let covariance = 0;
    let varX = 0;
    for (let i = 0; i < n; i += 1) {
      const dx = rows[i][c] - meanX;
      const dy = labels[i] - meanLabel;
      covariance += dx * dy;
      varX += dx * dx;
    }
    const denominator = Math.sqrt(varX * varLabel);
    out.push(denominator === 0 ? 0 : covariance / denominator);
  }
  return out;
}

/**
 * Count transitions per training row: the row of the matrix is the last token
 * of the context, the column is the next token. Cells stay zero for pairs that
 * never occur (or for non-token data).
 */
export function transitionMatrix(data: Dataset): number[][] {
  const labels = numericLabels(data) ?? [];
  const matrix = Array.from({ length: TOKEN_ALPHABET_SIZE }, () =>
    Array<number>(TOKEN_ALPHABET_SIZE).fill(0),
  );
  data.features.forEach((row, index) => {
    const from = row[row.length - 1];
    const to = labels[index];
    if (
      Number.isInteger(from) &&
      from >= 0 &&
      from < TOKEN_ALPHABET_SIZE &&
      Number.isInteger(to) &&
      to >= 0 &&
      to < TOKEN_ALPHABET_SIZE
    ) {
      matrix[from][to] += 1;
    }
  });
  return matrix;
}

/** Heaviest populated cell of a transition matrix, or null when empty. */
export function strongestTransition(
  matrix: number[][],
): TransitionCell | null {
  let best: TransitionCell | null = null;
  for (let from = 0; from < matrix.length; from += 1) {
    const row = matrix[from];
    for (let to = 0; to < row.length; to += 1) {
      const count = row[to];
      if (best === null || count > best.count) {
        best = { from, to, count };
      }
    }
  }
  if (best === null || best.count === 0) return null;
  return best;
}

/**
 * Split the sensor preview into the clean target series (the labels) and the
 * noisy observations (the last sample of each feature window).
 */
export function series(data: Dataset): { clean: number[]; noisy: number[] } {
  const labels = numericLabels(data) ?? [];
  return {
    clean: labels,
    noisy: data.features.map((row) =>
      row.length > 0 ? row[row.length - 1] : Number.NaN,
    ),
  };
}
