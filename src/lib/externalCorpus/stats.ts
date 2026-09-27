/**
 * External-corpus contract — statistics.
 *
 * These are the only functions in the external-replication path that produce an
 * interval, an effect size, or a required sample size, and both the external run
 * report and the comparison document are built from them. One implementation
 * means a report's interval and the comparison's interval cannot disagree.
 *
 * The statistics are chosen for the shape of the problem, not for convenience:
 *
 *  - **The unit matters.** A rate over mutants is *clustered*: the ~24 mutants
 *    inside one exercise share a reference program, a probe basis, and a shipped
 *    test set, so they are nowhere near independent. A binomial interval over
 *    3,733 mutants is therefore anti-conservative, and the fix is not a fudge
 *    factor but the cluster-robust standard error the committed BDL gate
 *    already computes (`rate_metric` in `scripts/py_bdl_verify.py:947`):
 *    `se = sqrt(sum((a_i - p*b_i)^2)) / sum(b_i)` over exercises. On the
 *    DeepForge-internal 240-problem sample this came out 1.64x-1.85x the
 *    binomial SE for the mutant-level rates, i.e. a variance inflation of
 *    2.7x-3.4x, and exactly equal to it for exercise-level rates (where every
 *    cluster has b_i = 1, so the two formulas coincide — a useful consistency
 *    check on the implementation). Every report therefore carries both SEs and
 *    the ratio, and the sample-size guidance inflates by the observed ratio.
 *  - **Wilson, not Wald.** A proportion near 0 or 1 with a small denominator has
 *    a Wald interval that runs past [0, 1] and can even invert. Wilson's score
 *    interval stays inside [0, 1] at every n, which matters here because an
 *    external corpus is small by construction.
 *  - **Newcombe for the difference, Katz/Woolf for the ratios.** The primary
 *    effect size is the risk difference with a Newcombe hybrid-score interval,
 *    which uses only Wilson limits and is accurate at small n. Risk ratio and
 *    odds ratio are reported with their classical log-method intervals, labelled
 *    as such. When a cell is empty the log methods are undefined; the estimate
 *    is then reported as `undefined` with a reason, never patched with a
 *    continuity correction. A Haldane-Anscombe 0.5 is a number nobody measured.
 *  - **Sample size is stated as a rule, not a wish.** Two figures are reported
 *    per statistic: the n at which the 95% interval is *narrower than the
 *    pre-registered margin* (so agreement is decidable at all), and the n at
 *    which a margin-sized departure is detected with 80% power at alpha = 0.05.
 *    Both are inflated by the observed design effect for clustered rates.
 *
 * Every function here is pure and total: no throw, no NaN, no Infinity in a
 * returned value. Undefined statistics come back as `null` with a reason.
 */

import { DEFAULT_ALPHA, DEFAULT_POWER, Z_95 } from "./constants";

/** A proportion with an interval, or `null`s with a stated reason. */
export interface ProportionEstimate {
  readonly numerator: number;
  readonly denominator: number;
  readonly point: number | null;
  readonly ci95: readonly [number | null, number | null];
  readonly method: "wilson-score" | "none";
  readonly seBinomial: number | null;
  /** Set when `point` is `null`. */
  readonly undefinedReason: string | null;
}

/** An effect size with an interval, or `null`s with a stated reason. */
export interface EffectSize {
  readonly value: number | null;
  readonly ci95: readonly [number | null, number | null];
  readonly method: string;
  readonly undefinedReason: string | null;
}

/** The normal quantile for a cumulative probability, by bisection on erf. */
function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26; |error| < 1.5e-7, which is far below the
  // precision any of the intervals below need.
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/** The two-sided normal quantile `z` with `P(|Z| <= z) = p`. */
export function normalQuantile(p: number): number {
  if (!(p > 0) || p >= 1) return Number.NaN;
  if (p === 0.5) return 0;
  let low = 0;
  let high = 10;
  for (let step = 0; step < 200; step += 1) {
    const mid = (low + high) / 2;
    const cdf = 0.5 * (1 + erf(mid / Math.SQRT2));
    if (cdf < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** `z` for a one-sided tail area `alpha`; equals `normalQuantile(1 - 2*alpha)`. */
export function zForAlpha(alpha: number): number {
  return normalQuantile(1 - 2 * alpha);
}

/** Binomial standard error at `point`; `null` outside [0, 1] or at n = 0. */
function binomialSe(point: number, trials: number): number | null {
  if (!(trials > 0) || point < 0 || point > 1) return null;
  return Math.sqrt((point * (1 - point)) / trials);
}

/**
 * Wilson score interval for a binomial proportion.
 *
 * `z` defaults to 1.959963984540054, the exact two-sided 95% normal quantile,
 * so the interval is not a rounded `1.96`.
 */
export function wilsonInterval(
  successes: number,
  trials: number,
  z: number = Z_95,
): readonly [number, number] {
  if (!(trials > 0) || successes < 0 || successes > trials) return [0, 1];
  const p = successes / trials;
  const z2 = z * z;
  const denominator = 1 + z2 / trials;
  const centre = p + z2 / (2 * trials);
  const spread = z * Math.sqrt((p * (1 - p) + z2 / (4 * trials)) / trials);
  const lower = (centre - spread) / denominator;
  const upper = (centre + spread) / denominator;
  return [Math.max(0, Math.min(1, lower)), Math.max(0, Math.min(1, upper))];
}

/**
 * A binomial proportion with its Wilson interval and standard error.
 *
 * `denominator === 0` yields `point: null` and a stated reason, never 0: a rate
 * over nothing is not a small rate, it is an absent rate.
 */
export function proportion(
  successes: number,
  trials: number,
  z: number = Z_95,
): ProportionEstimate {
  if (!(trials > 0)) {
    return {
      numerator: successes,
      denominator: trials,
      point: null,
      ci95: [null, null],
      method: "none",
      seBinomial: null,
      undefinedReason: "denominator is zero: the rate is undefined, not 0",
    };
  }
  const point = successes / trials;
  const [lower, upper] = wilsonInterval(successes, trials, z);
  return {
    numerator: successes,
    denominator: trials,
    point,
    ci95: [lower, upper],
    method: "wilson-score",
    seBinomial: binomialSe(point, trials),
    undefinedReason: null,
  };
}

/**
 * Cluster-robust standard error for a ratio of sums, exactly as the committed
 * BDL gate computes it.
 *
 * `pairs` is `(numerator_i, denominator_i)` per cluster (an exercise). The
 * estimate is `p = sum(a_i) / sum(b_i)` and
 * `se = sqrt(sum((a_i - p*b_i)^2)) / sum(b_i)`.
 *
 * With every `b_i === 1` this reduces algebraically to `sqrt(p(1-p)/n)`, the
 * binomial standard error, which is why the internal sample's exercise-level
 * rate and its mutant-level rate need different treatment.
 */
export function clusterRobustSe(pairs: readonly (readonly [number, number])[]): number | null {
  let numerator = 0;
  let denominator = 0;
  for (const [a, b] of pairs) {
    numerator += a;
    denominator += b;
  }
  if (!(denominator > 0)) return null;
  const p = numerator / denominator;
  let sum = 0;
  for (const [a, b] of pairs) {
    const deviation = a - p * b;
    sum += deviation * deviation;
  }
  return Math.sqrt(sum) / denominator;
}

/** A normal-approximation interval around a point, clamped to [0, 1]. */
function normalInterval(point: number, se: number, z: number = Z_95): readonly [number, number] {
  if (!Number.isFinite(se) || se <= 0) return [point, point];
  const half = z * se;
  return [Math.max(0, point - half), Math.min(1, point + half)];
}

/** A clustered rate: the point estimate, its cluster-robust interval, and both SEs. */
export interface ClusteredRate {
  readonly numerator: number;
  readonly denominator: number;
  readonly point: number | null;
  readonly ci95: readonly [number | null, number | null];
  readonly method: "wilson-score" | "cluster-robust-normal" | "none";
  readonly seCluster: number | null;
  readonly seBinomial: number | null;
  readonly designEffect: number | null;
  readonly undefinedReason: string | null;
}

/**
 * A rate over clustered pairs, with the interval the report must publish.
 *
 * Exercise-unit rates (`b_i === 1` for every cluster) get the Wilson interval,
 * which equals the cluster-robust normal interval to within a rounding error
 * and never leaves [0, 1]. Mutant-unit rates get the cluster-robust normal
 * interval, which is the honest one.
 */
export function clusteredRate(
  pairs: readonly (readonly [number, number])[],
  z: number = Z_95,
): ClusteredRate {
  let numerator = 0;
  let denominator = 0;
  for (const [a, b] of pairs) {
    numerator += a;
    denominator += b;
  }
  if (!(denominator > 0)) {
    return {
      numerator,
      denominator,
      point: null,
      ci95: [null, null],
      method: "none",
      seCluster: null,
      seBinomial: null,
      designEffect: null,
      undefinedReason: "denominator is zero: the rate is undefined, not 0",
    };
  }
  const point = numerator / denominator;
  const seCluster = clusterRobustSe(pairs);
  const seBinomial = binomialSe(point, denominator);
  const exerciseUnit = pairs.every(([, b]) => b === 1);
  const [lower, upper] = exerciseUnit
    ? wilsonInterval(numerator, denominator, z)
    : normalInterval(point, seCluster ?? Number.NaN, z);
  return {
    numerator,
    denominator,
    point,
    ci95: [lower, upper],
    method: exerciseUnit ? "wilson-score" : "cluster-robust-normal",
    seCluster,
    seBinomial,
    // A degenerate rate (every cluster identical, so the point is exactly 0 or
    // 1) has a zero binomial SE and therefore no defined variance inflation.
    // Reported as `null` rather than as 0/0, which is not a number.
    designEffect:
      seCluster !== null && seBinomial !== null && seBinomial > 0
        ? seCluster / seBinomial
        : null,
    undefinedReason: null,
  };
}

/**
 * A per-cluster mean with a cluster-robust normal interval.
 *
 * Used for the one reported statistic whose numerator is a *total* rather than a
 * count of events in a denominator — "mutants per analyzable exercise" — where
 * the binomial variance p(1-p)/n is not defined (the point estimate is 6.75 per
 * exercise, not a proportion) and a [0, 1] clamp would be meaningless. The
 * interval is the normal interval around the mean, unclamped, and
 * `seBinomial`/`designEffect` are `null` because there is no binomial
 * reference to compare against.
 */
export function meanOfClusters(
  pairs: readonly (readonly [number, number])[],
  z: number = Z_95,
): ClusteredRate {
  let numerator = 0;
  let denominator = 0;
  for (const [a, b] of pairs) {
    numerator += a;
    denominator += b;
  }
  if (!(denominator > 0)) {
    return {
      numerator,
      denominator,
      point: null,
      ci95: [null, null],
      method: "none",
      seCluster: null,
      seBinomial: null,
      designEffect: null,
      undefinedReason: "denominator is zero: the mean is undefined, not 0",
    };
  }
  const point = numerator / denominator;
  const seCluster = clusterRobustSe(pairs);
  const half = seCluster === null ? 0 : z * seCluster;
  return {
    numerator,
    denominator,
    point,
    ci95: [point - half, point + half],
    method: "cluster-robust-normal",
    seCluster,
    seBinomial: null,
    designEffect: null,
    undefinedReason: null,
  };
}

/**
 * Risk difference (external minus internal) with a Newcombe hybrid-score
 * (method 10) interval, built from the two Wilson limits.
 *
 * `lower = d - sqrt((p1 - l1)^2 + (u2 - p2)^2)`
 * `upper = d + sqrt((u1 - p1)^2 + (p2 - l2)^2)`
 *
 * Accurate at small n, symmetric about nothing in particular, and it needs no
 * continuity correction, which is why it is the primary effect size here.
 */
export function riskDifference(
  external: ProportionEstimate,
  internal: ProportionEstimate,
): EffectSize {
  if (external.point === null || internal.point === null) {
    return {
      value: null,
      ci95: [null, null],
      method: "newcombe-hybrid-score-10",
      undefinedReason:
        external.undefinedReason ?? internal.undefinedReason ?? "a proportion is undefined",
    };
  }
  const eLower = external.ci95[0] ?? 0;
  const eUpper = external.ci95[1] ?? 1;
  const iLower = internal.ci95[0] ?? 0;
  const iUpper = internal.ci95[1] ?? 1;
  const difference = external.point - internal.point;
  const lowerSpan = Math.sqrt(
    (external.point - eLower) ** 2 + (iUpper - internal.point) ** 2,
  );
  const upperSpan = Math.sqrt(
    (eUpper - external.point) ** 2 + (internal.point - iLower) ** 2,
  );
  return {
    value: difference,
    ci95: [Math.max(-1, difference - lowerSpan), Math.min(1, difference + upperSpan)],
    method: "newcombe-hybrid-score-10",
    undefinedReason: null,
  };
}

/** Shared machinery for the log-method ratio estimators. */
function logRatio(
  eventsA: number,
  totalA: number,
  eventsB: number,
  totalB: number,
  labels: { readonly variance: number; readonly method: string },
): EffectSize {
  if (!(totalA > 0) || !(totalB > 0)) {
    return {
      value: null,
      ci95: [null, null],
      method: labels.method,
      undefinedReason: "a denominator is zero",
    };
  }
  const nonEventsA = totalA - eventsA;
  const nonEventsB = totalB - eventsB;
  if (eventsA === 0 || nonEventsA === 0 || eventsB === 0 || nonEventsB === 0) {
    return {
      value: null,
      ci95: [null, null],
      method: labels.method,
      undefinedReason:
        `a 2x2 cell is empty (events ${String(eventsA)}/${String(totalA)} vs ` +
        `${String(eventsB)}/${String(totalB)}); the log interval is undefined and is reported as ` +
        "undefined rather than patched with a 0.5 continuity correction",
    };
  }
  const ratio = eventsA / nonEventsA / (eventsB / nonEventsB);
  const se = Math.sqrt(labels.variance);
  if (!(se > 0) || !Number.isFinite(ratio)) {
    return { value: null, ci95: [null, null], method: labels.method, undefinedReason: "degenerate odds" };
  }
  return {
    value: ratio,
    ci95: [ratio * Math.exp(-Z_95 * se), ratio * Math.exp(Z_95 * se)],
    method: labels.method,
    undefinedReason: null,
  };
}

/** Risk ratio with a Katz log-method interval (no continuity correction). */
export function riskRatio(external: ProportionEstimate, internal: ProportionEstimate): EffectSize {
  return logRatio(
    external.numerator,
    external.denominator,
    internal.numerator,
    internal.denominator,
    {
      variance:
        1 / external.numerator -
        1 / external.denominator +
        (1 / internal.numerator - 1 / internal.denominator),
      method: "katz-log-rr",
    },
  );
}

/** Odds ratio with a Woolf log-method interval (no continuity correction). */
export function oddsRatio(external: ProportionEstimate, internal: ProportionEstimate): EffectSize {
  return logRatio(
    external.numerator,
    external.denominator,
    internal.numerator,
    internal.denominator,
    {
      variance:
        1 / external.numerator +
        1 / (external.denominator - external.numerator) +
        1 / internal.numerator +
        1 / (internal.denominator - internal.numerator),
      method: "woolf-log-orr",
    },
  );
}

/* ─────────────────────────── sample size and power ───────────────────────── */

/**
 * The smallest `n` at which a binomial proportion near `p` has a 95% interval
 * no wider than `halfWidth`: `ceil(z^2 p (1 - p) / halfWidth^2)`.
 *
 * This is the "can the question be decided at all" figure. It is the number a
 * reader should check first, because it is the one that exposes an
 * underpowered comparison: with a pre-registered margin of 5pp on a rate of
 * 0.44 the answer is 380 analyzable exercises, and a 240-exercise sample —
 * which is what the committed internal gate uses — cannot decide anything at
 * that margin no matter how its tolerance band is drawn.
 */
export function nForHalfWidth(p: number, halfWidth: number, z: number = Z_95): number {
  if (!(halfWidth > 0)) return Number.POSITIVE_INFINITY;
  const bounded = Math.min(0.999_999, Math.max(0.000_001, p));
  return Math.ceil((z * z * bounded * (1 - bounded)) / (halfWidth * halfWidth));
}

/**
 * Power of a one-sided-in-effect two-sided test of `H0: p = p0` against a true
 * `p1`, at sample size `n`:
 *
 *   beta  = Phi( z - (p1 - p0) * sqrt(n) / sqrt(p0 (1 - p0)) )
 *         + Phi( -z - (p1 - p0) * sqrt(n) / sqrt(p0 (1 - p0)) )
 *   power = 1 - beta
 *
 * The standard normal approximation for a one-sample proportion test, with the
 * null variance in the denominator. It is an approximation and is labelled as
 * one; it is used only to say "this many observations would be needed", never to
 * adjust a result.
 */
export function powerAgainst(p0: number, p1: number, n: number, alpha = DEFAULT_ALPHA): number {
  if (!(n > 0) || p0 === p1) return p0 === p1 ? alpha : 0;
  const z = zForAlpha(alpha);
  const shift = ((p1 - p0) * Math.sqrt(n)) / Math.sqrt(p0 * (1 - p0));
  const cdf = (x: number): number => 0.5 * (1 + erf(x / Math.SQRT2));
  const beta = cdf(z - shift) + cdf(-z - shift);
  return Math.max(0, Math.min(1, 1 - beta));
}

/**
 * The smallest `n` with power at least `target` for detecting `p1` against
 * `p0`, found by bisection on the integer `n`. `p0 === p1` has no finite answer
 * and returns `Infinity`, which is the honest result.
 */
export function nForPower(
  p0: number,
  p1: number,
  target: number = DEFAULT_POWER,
  alpha = DEFAULT_ALPHA,
  ceiling = 50_000_000,
): number {
  if (p0 === p1) return Number.POSITIVE_INFINITY;
  let low = 1;
  let high = 16;
  while (high < ceiling && powerAgainst(p0, p1, high, alpha) < target) high *= 2;
  if (high >= ceiling && powerAgainst(p0, p1, high, alpha) < target) return Number.POSITIVE_INFINITY;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (powerAgainst(p0, p1, mid, alpha) >= target) high = mid;
    else low = mid + 1;
  }
  return low;
}

/** Multiply a required `n` by a variance-inflation factor, rounding up. */
export function inflate(n: number, designEffect: number | null): number {
  if (!Number.isFinite(n)) return n;
  if (designEffect === null || !Number.isFinite(designEffect) || designEffect <= 1) return n;
  return Math.ceil(n * designEffect);
}

/**
 * The decision rule, stated once so every verdict in a comparison document is
 * produced by the same sentence.
 */
export const DECISION_RULE =
  "For a pre-registered equivalence margin d and the external 95% interval " +
  "[l, u]: AGREE iff [l, u] is entirely inside [p_internal - d, p_internal + d]; " +
  "DISAGREE iff [l, u] is entirely outside that band; otherwise INCONCLUSIVE. " +
  "A wide interval therefore can never be read as agreement, which is the " +
  "failure mode a symmetric 3-sigma tolerance band produces.";

/** Format a proportion as a percentage string, or a dash when undefined. */
export function percent(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "n/a";
  return `${(value * 100).toFixed(digits)}%`;
}

/** Format a signed percentage-point difference, or a dash when undefined. */
export function percentagePoints(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "n/a";
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(digits)}pp`;
}
