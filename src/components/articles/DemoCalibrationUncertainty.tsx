"use client";

import { useMemo, useState } from "react";
import { clamp, type DemoProps } from "@/lib/articles-demos";

export interface CalibrationSample {
  score: number;
  outcome: number;
}

export function frac(x: number): number {
  return x - Math.floor(x);
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function logit(p: number): number {
  const safe = clamp(p, 1e-6, 1 - 1e-6);
  return Math.log(safe / (1 - safe));
}

export function buildCalibrationSamples(count = 320): CalibrationSample[] {
  const samples: CalibrationSample[] = [];
  for (let i = 0; i < count; i++) {
    const p = 0.02 + 0.96 * frac(i * 0.6180339887498949 + 0.37);
    const outcome = frac(i * 0.7548776662466927 + 0.13) < p ? 1 : 0;
    const score = 2.4 * logit(p) + 0.15;
    samples.push({ score, outcome });
  }
  return samples;
}

export const CALIBRATION_SAMPLES = buildCalibrationSamples();

export function calibratedConfidence(
  score: number,
  temperature: number,
): number {
  return sigmoid(score / Math.max(temperature, 1e-3));
}

export function accuracyOf(samples: CalibrationSample[]): number {
  if (samples.length === 0) return 0;
  return (
    samples.reduce((sum, sample) => sum + sample.outcome, 0) / samples.length
  );
}

export function meanConfidence(
  samples: CalibrationSample[],
  temperature: number,
): number {
  if (samples.length === 0) return 0;
  return (
    samples.reduce(
      (sum, sample) => sum + calibratedConfidence(sample.score, temperature),
      0,
    ) / samples.length
  );
}

export function negativeLogLikelihood(
  samples: CalibrationSample[],
  temperature: number,
): number {
  if (samples.length === 0) return 0;
  return (
    samples.reduce((sum, sample) => {
      const confidence = clamp(
        calibratedConfidence(sample.score, temperature),
        1e-12,
        1 - 1e-12,
      );
      return (
        sum -
        (sample.outcome === 1
          ? Math.log(confidence)
          : Math.log(1 - confidence))
      );
    }, 0) / samples.length
  );
}

export interface ReliabilityBin {
  lo: number;
  hi: number;
  count: number;
  confidence: number;
  accuracy: number;
  gap: number;
}

export type BinMode = "equal-width" | "equal-frequency";

export function reliabilityBins(
  samples: CalibrationSample[],
  temperature: number,
  binCount: number,
  mode: BinMode,
): ReliabilityBin[] {
  const k = clamp(Math.round(binCount), 2, 40);
  const total = samples.length;
  const confidences = samples.map((sample) =>
    calibratedConfidence(sample.score, temperature),
  );

  const count = new Array<number>(k).fill(0);
  const confidenceSum = new Array<number>(k).fill(0);
  const outcomeSum = new Array<number>(k).fill(0);
  const lo = new Array<number>(k).fill(0);
  const hi = new Array<number>(k).fill(0);
  if (mode === "equal-width") {
    for (let b = 0; b < k; b++) {
      lo[b] = b / k;
      hi[b] = (b + 1) / k;
    }
    for (let i = 0; i < total; i++) {
      const index = clamp(Math.floor(confidences[i] * k), 0, k - 1);
      count[index] += 1;
      confidenceSum[index] += confidences[i];
      outcomeSum[index] += samples[i].outcome;
    }
  } else {
    const order = samples
      .map((_, index) => index)
      .sort((a, b) =>
        confidences[a] === confidences[b]
          ? a - b
          : confidences[a] - confidences[b],
      );
    order.forEach((sampleIndex, rank) => {
      const index = Math.min(k - 1, Math.floor((rank * k) / Math.max(total, 1)));
      if (count[index] === 0) {
        lo[index] = confidences[sampleIndex];
        hi[index] = confidences[sampleIndex];
      } else {
        lo[index] = Math.min(lo[index], confidences[sampleIndex]);
        hi[index] = Math.max(hi[index], confidences[sampleIndex]);
      }
      count[index] += 1;
      confidenceSum[index] += confidences[sampleIndex];
      outcomeSum[index] += samples[sampleIndex].outcome;
    });
    for (let b = 0; b < k; b++) {
      if (count[b] === 0) {
        lo[b] = b / k;
        hi[b] = (b + 1) / k;
      }
    }
  }

  return Array.from({ length: k }, (_, b) => {
    if (count[b] === 0) {
      const midpoint = (lo[b] + hi[b]) / 2;
      return {
        lo: lo[b],
        hi: hi[b],
        count: 0,
        confidence: midpoint,
        accuracy: 0,
        gap: 0,
      };
    }
    const confidence = confidenceSum[b] / count[b];
    const accuracy = outcomeSum[b] / count[b];
    return {
      lo: lo[b],
      hi: hi[b],
      count: count[b],
      confidence,
      accuracy,
      gap: Math.abs(accuracy - confidence),
    };
  });
}

export function expectedCalibrationError(
  bins: ReliabilityBin[],
  total: number,
): number {
  if (total <= 0) return 0;
  return bins.reduce(
    (sum, bin) => sum + (bin.count / total) * bin.gap,
    0,
  );
}

export function fitTemperature(
  samples: CalibrationSample[],
  lo = 0.5,
  hi = 6,
): number {
  const phi = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  let c = b - phi * (b - a);
  let d = a + phi * (b - a);
  let fc = negativeLogLikelihood(samples, c);
  let fd = negativeLogLikelihood(samples, d);
  for (let i = 0; i < 90; i++) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - phi * (b - a);
      fc = negativeLogLikelihood(samples, c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + phi * (b - a);
      fd = negativeLogLikelihood(samples, d);
    }
  }
  return (a + b) / 2;
}

const PLOT_X0 = 70;
const PLOT_X1 = 380;
const PLOT_Y0 = 56;
const PLOT_Y1 = 330;
const HIST_BASE = 376;
const HIST_TOP = 354;

function px(value: number): number {
  return PLOT_X0 + clamp(value, 0, 1) * (PLOT_X1 - PLOT_X0);
}

function py(value: number): number {
  return PLOT_Y1 - clamp(value, 0, 1) * (PLOT_Y1 - PLOT_Y0);
}

export function CalibrationUncertaintyDemo(_props: DemoProps) {
  const [temperature, setTemperature] = useState(1);
  const [binCount, setBinCount] = useState(8);
  const [binMode, setBinMode] = useState<BinMode>("equal-width");

  const fitted = useMemo(() => fitTemperature(CALIBRATION_SAMPLES), []);

  const bins = useMemo(
    () => reliabilityBins(CALIBRATION_SAMPLES, temperature, binCount, binMode),
    [temperature, binCount, binMode],
  );
  const baselineBins = useMemo(
    () => reliabilityBins(CALIBRATION_SAMPLES, 1, binCount, binMode),
    [binCount, binMode],
  );

  const occurrence = CALIBRATION_SAMPLES.length;
  const ece = expectedCalibrationError(bins, occurrence);
  const baselineEce = expectedCalibrationError(baselineBins, occurrence);
  const accuracy = accuracyOf(CALIBRATION_SAMPLES);
  const meanConf = meanConfidence(CALIBRATION_SAMPLES, temperature);
  const nll = negativeLogLikelihood(CALIBRATION_SAMPLES, temperature);
  const maxCount = Math.max(1, ...bins.map((bin) => bin.count));

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const status =
    `T = ${temperature.toFixed(2)} with ${binMode === "equal-width" ? "equal-width" : "equal-frequency"} ` +
    `bins (${binCount}). ECE ${ece.toFixed(3)} versus ${baselineEce.toFixed(3)} at T = 1. ` +
    `Accuracy is ${(accuracy * 100).toFixed(1)}% and does not move with T; mean confidence ` +
    `${(meanConf * 100).toFixed(1)}%. NLL ${nll.toFixed(3)}. ` +
    (Math.abs(temperature - fitted) < 0.03
      ? `This is the fitted temperature ${fitted.toFixed(2)}: the softest probabilities, same ranking.`
      : `The NLL-fitted temperature is ${fitted.toFixed(2)}.`);

  const ariaLabel =
    `Reliability diagram over ${occurrence} simulated predictions at temperature ${temperature.toFixed(2)}. ` +
    `Expected calibration error ${ece.toFixed(3)}; accuracy ${(accuracy * 100).toFixed(1)} percent; ` +
    `mean confidence ${(meanConf * 100).toFixed(1)} percent.`;

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Reliability, then one scalar to fix it
        </span>
        <span className="font-mono text-[11px] text-body-mid">
          p&#770; = &sigma;(z / T)
        </span>
      </figcaption>

      <div className="flex flex-col gap-4 lg:flex-row">
        <svg role="img" aria-label={ariaLabel} viewBox="0 0 420 400" className="w-full lg:max-w-md">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={`tick-${tick}`}>
              <line
                x1={px(tick)}
                y1={PLOT_Y1}
                x2={px(tick)}
                y2={PLOT_Y1 + 4}
                className="stroke-hairline"
              />
              <line
                x1={PLOT_X0 - 4}
                y1={py(tick)}
                x2={PLOT_X0}
                y2={py(tick)}
                className="stroke-hairline"
              />
              <text
                x={px(tick)}
                y={PLOT_Y1 + 18}
                textAnchor="middle"
                className="fill-mute text-[9px] font-mono"
              >
                {tick.toFixed(2)}
              </text>
              {tick !== 0 && (
                <text
                  x={PLOT_X0 - 8}
                  y={py(tick) + 3}
                  textAnchor="end"
                  className="fill-mute text-[9px] font-mono"
                >
                  {tick.toFixed(2)}
                </text>
              )}
            </g>
          ))}

          <line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} className="stroke-hairline" strokeWidth="1.5" />
          <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y1} className="stroke-hairline" strokeWidth="1.5" />
          <line
            x1={px(0)}
            y1={py(0)}
            x2={px(1)}
            y2={py(1)}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            className="stroke-accent/40"
          />

          {bins.map((bin, i) => {
            const baseline = baselineBins[i];
            return (
              <g key={`bin-${i}`}>
                <line
                  x1={px(bin.confidence)}
                  y1={py(bin.confidence)}
                  x2={px(bin.confidence)}
                  y2={py(bin.accuracy)}
                  strokeWidth="1.5"
                  className="stroke-warning/70"
                />
                {bin.count > 0 && (
                  <rect
                    x={PLOT_X0 + (i * (PLOT_X1 - PLOT_X0)) / bins.length + 1}
                    y={HIST_BASE - (bin.count / maxCount) * (HIST_BASE - HIST_TOP)}
                    width={(PLOT_X1 - PLOT_X0) / bins.length - 2}
                    height={Math.max(1, (bin.count / maxCount) * (HIST_BASE - HIST_TOP))}
                    rx={1.5}
                    className="fill-info/30"
                  />
                )}
                {baseline.count > 0 && (
                  <circle
                    cx={px(baseline.confidence)}
                    cy={py(baseline.accuracy)}
                    r={3}
                    className="fill-mute"
                  />
                )}
                {bin.count > 0 && (
                  <circle
                    cx={px(bin.confidence)}
                    cy={py(bin.accuracy)}
                    r={4}
                    className="fill-accent"
                  />
                )}
              </g>
            );
          })}

          <text x={PLOT_X0} y={44} className="fill-mute text-[9px] font-mono">
            accuracy
          </text>
          <text x={PLOT_X1 + 10} y={PLOT_Y1 + 4} className="fill-mute text-[9px] font-mono">
            confidence
          </text>
          <text x={PLOT_X0 + 6} y={PLOT_Y0 + 14} className="fill-accent text-[9.5px] font-mono">
            diagonal = perfect calibration
          </text>
          <circle cx={PLOT_X1 - 96} cy={41} r={3} className="fill-mute" />
          <text x={PLOT_X1 - 88} y={44} className="fill-mute text-[9.5px] font-mono">
            T = 1
          </text>
          <circle cx={PLOT_X1 - 40} cy={41} r={4} className="fill-accent" />
          <text x={PLOT_X1 - 32} y={44} className="fill-accent text-[9.5px] font-mono">
            current T
          </text>
          <text x={PLOT_X0} y={392} className="fill-mute text-[9px] font-mono">
            bin counts
          </text>
        </svg>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="cal-temperature" className="text-xs text-body-mid">
              Temperature T
            </label>
            <input
              id="cal-temperature"
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              aria-label="Temperature"
              aria-valuetext={`T equals ${temperature.toFixed(2)}`}
              className="h-1.5 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-canvas-soft"
              style={{ accentColor: "var(--accent)" }}
            />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-ink">
              {temperature.toFixed(2)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="cal-bins" className="text-xs text-body-mid">
              Bins
            </label>
            <input
              id="cal-bins"
              type="range"
              min={4}
              max={16}
              step={1}
              value={binCount}
              onChange={(e) => setBinCount(Number(e.target.value))}
              aria-label="Number of calibration bins"
              aria-valuetext={`${binCount} bins`}
              className="h-1.5 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-canvas-soft"
              style={{ accentColor: "var(--accent)" }}
            />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-ink">
              {binCount}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1">
            <span className="flex gap-1" role="group" aria-label="Bin construction">
              <button
                type="button"
                aria-pressed={binMode === "equal-width"}
                onClick={() => setBinMode("equal-width")}
                className={toggleClasses(binMode === "equal-width")}
              >
                Equal width
              </button>
              <button
                type="button"
                aria-pressed={binMode === "equal-frequency"}
                onClick={() => setBinMode("equal-frequency")}
                className={toggleClasses(binMode === "equal-frequency")}
              >
                Equal frequency
              </button>
            </span>
            <button
              type="button"
              onClick={() => setTemperature(Number(fitted.toFixed(2)))}
              className="min-h-11 rounded-lg border border-hairline px-3 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              Fit T
            </button>
            <button
              type="button"
              onClick={() => setTemperature(1)}
              className="min-h-11 rounded-lg border border-hairline px-3 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
            >
              Reset
            </button>
          </div>

          <dl className="mt-4 space-y-1 font-mono text-[11px] text-body-mid">
            <div className="flex justify-between gap-2">
              <dt>ECE now</dt>
              <dd className="text-accent">{ece.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>ECE at T = 1</dt>
              <dd className="text-ink">{baselineEce.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>accuracy</dt>
              <dd className="text-ink">
                {(accuracy * 100).toFixed(1)}% <span className="text-mute">(fixed)</span>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>mean confidence</dt>
              <dd className="text-ink">{(meanConf * 100).toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>NLL</dt>
              <dd className="text-ink">{nll.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>fitted T</dt>
              <dd className="text-info">{fitted.toFixed(2)}</dd>
            </div>
          </dl>

          <p className="mt-3 rounded-lg border border-hairline bg-canvas px-3 py-2 text-[11px] leading-relaxed text-body-mid">
            The fixture is {occurrence} predictions from a deliberately
            overconfident model (logit scaled by 2.4). Softening with T moves
            mean confidence down toward accuracy without reordering a single
            prediction.
          </p>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </figure>
  );
}
