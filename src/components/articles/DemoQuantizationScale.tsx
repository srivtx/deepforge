"use client";

import { useMemo, useState } from "react";
import { clamp, type DemoProps } from "@/lib/articles-demos";

const CHANNELS: number[][] = [
  [-1.9, -1.2, -0.45, 0.3, 1.05, 1.7],
  [-0.5, 0.2, 0.9, 1.5, 2.1, 5.2],
  [-1.65, -0.75, 0.1, 0.8, 1.35, 1.95],
  [-2.2, -1.4, -0.6, 0.55, 1.25, 2.05],
];

const VALUES = CHANNELS.flat();
const T_MIN = 1;
const T_MAX = 6;
const T_STEP = 0.05;
const DOMAIN = 6;
const NL_AX0 = 50;
const NL_AX1 = 730;
const NL_AXIS = 160;
const HB_X0 = 50;
const HB_X1 = 610;
const HB_BASE = 140;
const HB_TOP = 30;

interface GroupResult {
  codes: number[];
  recon: number[];
  scale: number;
  zeroPoint: number;
}

interface QuantResult {
  codes: number[];
  recon: number[];
  errors: number[];
  scales: number[];
  zeroPoints: number[];
  maxAbs: number;
  rmse: number;
  sqnr: number;
  clipped: number;
}

function quantizeGroup(
  group: number[],
  t: number,
  symmetric: boolean,
): GroupResult {
  const min = Math.min(...group);
  const max = Math.max(...group);

  if (symmetric) {
    const bound = Math.min(
      t,
      Math.max(Math.abs(min), Math.abs(max), 1e-9),
    );
    const scale = bound / 127;
    const codes = group.map((x) => clamp(Math.round(x / scale), -127, 127));
    return { codes, recon: codes.map((q) => q * scale), scale, zeroPoint: 0 };
  }

  const lo = Math.max(-t, min);
  const hi = Math.min(t, max);
  const scale = Math.max(hi - lo, 1e-9) / 255;
  const zeroPoint = Math.round(-lo / scale);
  const codes = group.map((x) =>
    clamp(Math.round(x / scale + zeroPoint), 0, 255),
  );
  return {
    codes,
    recon: codes.map((q) => (q - zeroPoint) * scale),
    scale,
    zeroPoint,
  };
}

function quantizeAll(
  t: number,
  symmetric: boolean,
  perChannel: boolean,
): QuantResult {
  const groups = perChannel ? CHANNELS : [VALUES];
  const results = groups.map((group) => quantizeGroup(group, t, symmetric));

  const codes: number[] = [];
  const recon: number[] = [];
  for (const group of results) {
    codes.push(...group.codes);
    recon.push(...group.recon);
  }

  const errors = VALUES.map((x, i) => recon[i] - x);
  const maxAbs = errors.reduce((m, e) => Math.max(m, Math.abs(e)), 0);
  const mse =
    errors.reduce((sum, e) => sum + e * e, 0) / Math.max(errors.length, 1);
  const signal =
    VALUES.reduce((sum, x) => sum + x * x, 0) / Math.max(VALUES.length, 1);
  const sqnr = 10 * Math.log10(signal / Math.max(mse, 1e-12));

  return {
    codes,
    recon,
    errors,
    scales: results.map((group) => group.scale),
    zeroPoints: results.map((group) => group.zeroPoint),
    maxAbs,
    rmse: Math.sqrt(mse),
    sqnr,
    clipped: VALUES.filter((x) => Math.abs(x) > t).length,
  };
}

const NLX = (v: number) =>
  NL_AX0 + ((clamp(v, -DOMAIN, DOMAIN) + DOMAIN) / (2 * DOMAIN)) * (NL_AX1 - NL_AX0);

const EXAMPLES = [9, 11, 18];

export function QuantizationScaleDemo(_props: DemoProps) {
  const [t, setT] = useState(2.5);
  const [symmetric, setSymmetric] = useState(true);
  const [perChannel, setPerChannel] = useState(false);

  const result = useMemo(
    () => quantizeAll(t, symmetric, perChannel),
    [t, symmetric, perChannel],
  );

  const codeQs = useMemo(() => {
    if (perChannel) return [];
    const scale = result.scales[0];
    const qs: number[] = [];
    for (let q = -120; q <= 120; q += 15) qs.push(q);
    return qs.map((q) => q * scale).filter((v) => Math.abs(v) <= DOMAIN);
  }, [result.scales, perChannel]);

  const maxErrorIndex = result.errors.reduce(
    (best, e, i, arr) => (Math.abs(e) > Math.abs(arr[best]) ? i : best),
    0,
  );

  const errMax = Math.max(0.02, result.maxAbs * 1.05);
  const hist = useMemo(() => {
    const bins = 9;
    const counts = new Array(bins).fill(0) as number[];
    for (const e of result.errors) {
      const idx = clamp(
        Math.floor(((e + errMax) / (2 * errMax)) * bins),
        0,
        bins - 1,
      );
      counts[idx] += 1;
    }
    return { bins, counts, maxCount: Math.max(1, ...counts) };
  }, [result.errors, errMax]);

  const maxBin = clamp(
    Math.floor(((result.errors[maxErrorIndex] + errMax) / (2 * errMax)) * hist.bins),
    0,
    hist.bins - 1,
  );

  const scaleText = result.scales.map((s) => s.toFixed(4)).join(" · ");
  const zeroText = result.zeroPoints.join(" · ");

  const numberLineLabel =
    `Number line of ${VALUES.length} values from a weight tensor, mapped to int8 codes. ` +
    `Clip threshold ${t.toFixed(2)}, ${symmetric ? "symmetric" : "asymmetric"}, ` +
    `${perChannel ? "per-channel" : "per-tensor"}. ` +
    `${result.clipped} value${result.clipped === 1 ? "" : "s"} clipped. ` +
    `Largest error ${result.maxAbs.toFixed(3)}.`;

  const histogramLabel =
    `Histogram of quantization error over ${VALUES.length} values. ` +
    `RMSE ${result.rmse.toFixed(3)}, SQNR ${result.sqnr.toFixed(1)} decibels, ` +
    `largest error ${result.maxAbs.toFixed(3)}.`;

  const status =
    `t = ${t.toFixed(2)} · ${symmetric ? "symmetric" : "asymmetric"} · ` +
    `${perChannel ? "per-channel" : "per-tensor"}. ` +
    `scale${result.scales.length > 1 ? "s" : ""} ${scaleText}` +
    `${symmetric ? ", zero point 0" : `, zero point${result.zeroPoints.length > 1 ? "s" : ""} ${zeroText}`}. ` +
    `Max error ${result.maxAbs.toFixed(3)}, RMSE ${result.rmse.toFixed(3)}, ` +
    `SQNR ${result.sqnr.toFixed(1)} dB, ${result.clipped} clipped.`;

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Clip the range, watch the error
        </span>
        <span className="font-mono text-[11px] text-body-mid">
          x &asymp; scale &middot; (q &minus; zero point)
        </span>
      </figcaption>

      <svg
        role="img"
        aria-label={numberLineLabel}
        viewBox="0 0 760 190"
        className="w-full"
      >
        <line
          x1={NLX(-DOMAIN)}
          y1={NL_AXIS}
          x2={NLX(DOMAIN)}
          y2={NL_AXIS}
          className="stroke-hairline"
          strokeWidth="1.5"
        />
        {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
          <g key={v}>
            <line
              x1={NLX(v)}
              y1={NL_AXIS - 4}
              x2={NLX(v)}
              y2={NL_AXIS + 4}
              className="stroke-hairline"
            />
            <text
              x={NLX(v)}
              y={NL_AXIS + 20}
              textAnchor="middle"
              className="fill-mute text-[9px] font-mono"
            >
              {v}
            </text>
          </g>
        ))}

        <rect
          x={NLX(-t)}
          y={92}
          width={Math.max(0, NLX(t) - NLX(-t))}
          height={66}
          className="fill-accent/5"
        />
        <line
          x1={NLX(-t)}
          y1={92}
          x2={NLX(-t)}
          y2={NL_AXIS}
          className="stroke-accent/60"
          strokeDasharray="4 4"
        />
        <line
          x1={NLX(t)}
          y1={92}
          x2={NLX(t)}
          y2={NL_AXIS}
          className="stroke-accent/60"
          strokeDasharray="4 4"
        />
        <text
          x={NLX(-t)}
          y={86}
          textAnchor="middle"
          className="fill-accent text-[9px] font-mono"
        >
          &minus;t = {(-t).toFixed(2)}
        </text>
        <text
          x={NLX(t)}
          y={86}
          textAnchor="middle"
          className="fill-accent text-[9px] font-mono"
        >
          +t = {t.toFixed(2)}
        </text>

        {codeQs.map((v) => (
          <line
            key={v.toFixed(5)}
            x1={NLX(v)}
            y1={NL_AXIS - 6}
            x2={NLX(v)}
            y2={NL_AXIS + 6}
            className="stroke-accent"
            strokeOpacity="0.35"
          />
        ))}

        {VALUES.map((x, i) => {
          const xHat = result.recon[i];
          const outlier = Math.abs(x) > t;
          return (
            <g key={`v-${i}`}>
              <line
                x1={NLX(x)}
                y1={116}
                x2={NLX(xHat)}
                y2={140}
                className="stroke-error"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <circle
                cx={NLX(x)}
                cy={116}
                r={4}
                className={outlier ? "fill-warning" : "fill-ink"}
              />
              <polygon
                points={`${NLX(xHat)},134 ${NLX(xHat) + 3.5},140 ${NLX(xHat)},146 ${NLX(xHat) - 3.5},140`}
                className="fill-accent"
              />
            </g>
          );
        })}

        <text
          x={NLX(VALUES[maxErrorIndex]) + (VALUES[maxErrorIndex] >= 0 ? 8 : -8)}
          y={104}
          textAnchor={VALUES[maxErrorIndex] >= 0 ? "start" : "end"}
          className="fill-warning text-[9.5px] font-mono"
        >
          {VALUES[maxErrorIndex].toFixed(2)} &rarr; {result.recon[maxErrorIndex].toFixed(2)}
        </text>
        <text
          x={NLX(VALUES[maxErrorIndex]) + (VALUES[maxErrorIndex] >= 0 ? 8 : -8)}
          y={92}
          textAnchor={VALUES[maxErrorIndex] >= 0 ? "start" : "end"}
          className="fill-warning text-[9.5px] font-mono"
        >
          error {Math.abs(result.errors[maxErrorIndex]).toFixed(2)}
        </text>

        <circle cx={NLX(0)} cy={168} r={3} className="fill-ink" />
        <text x={NLX(0) + 8} y={172} className="fill-mute text-[9px] font-mono">
          original
        </text>
        <polygon
          points={`${NLX(1.1)},164 ${NLX(1.1) + 3.5},168 ${NLX(1.1)},172 ${NLX(1.1) - 3.5},168`}
          className="fill-accent"
        />
        <text x={NLX(1.1) + 8} y={172} className="fill-mute text-[9px] font-mono">
          dequantized
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="quant-clip" className="text-xs text-body-mid">
          Clip threshold t
        </label>
        <input
          id="quant-clip"
          type="range"
          min={T_MIN}
          max={T_MAX}
          step={T_STEP}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          aria-label="Clip threshold"
          aria-valuetext={`t equals ${t.toFixed(2)}`}
          className="h-1.5 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-canvas-soft"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="w-14 shrink-0 text-right font-mono text-xs text-ink">
          {t.toFixed(2)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex gap-1" role="group" aria-label="Quantization mode">
          <button
            type="button"
            aria-pressed={symmetric}
            onClick={() => setSymmetric(true)}
            className={toggleClasses(symmetric)}
          >
            Symmetric
          </button>
          <button
            type="button"
            aria-pressed={!symmetric}
            onClick={() => setSymmetric(false)}
            className={toggleClasses(!symmetric)}
          >
            Asymmetric
          </button>
        </span>
        <span className="flex gap-1" role="group" aria-label="Quantization granularity">
          <button
            type="button"
            aria-pressed={!perChannel}
            onClick={() => setPerChannel(false)}
            className={toggleClasses(!perChannel)}
          >
            Per-tensor
          </button>
          <button
            type="button"
            aria-pressed={perChannel}
            onClick={() => setPerChannel(true)}
            className={toggleClasses(perChannel)}
          >
            Per-channel
          </button>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <svg
            role="img"
            aria-label={histogramLabel}
            viewBox="0 0 660 170"
            className="w-full"
          >
            {hist.counts.map((count, i) => {
              const barW = (HB_X1 - HB_X0) / hist.bins - 4;
              const x = HB_X0 + (i * (HB_X1 - HB_X0)) / hist.bins + 2;
              const h = (count / hist.maxCount) * (HB_BASE - HB_TOP);
              return (
                <g key={`bin-${i}`}>
                  <rect
                    x={x}
                    y={HB_BASE - h}
                    width={barW}
                    height={Math.max(count > 0 ? 2 : 0, h)}
                    rx={2}
                    className={i === maxBin ? "fill-warning/80" : "fill-accent/70"}
                  />
                  {count === hist.maxCount && (
                    <text
                      x={x + barW / 2}
                      y={HB_BASE - h - 5}
                      textAnchor="middle"
                      className="fill-body-mid text-[9px] font-mono"
                    >
                      {count}
                    </text>
                  )}
                </g>
              );
            })}
            <line
              x1={HB_X0}
              y1={HB_BASE}
              x2={HB_X1}
              y2={HB_BASE}
              className="stroke-hairline"
            />
            <line
              x1={(HB_X0 + HB_X1) / 2}
              y1={HB_TOP}
              x2={(HB_X0 + HB_X1) / 2}
              y2={HB_BASE}
              className="stroke-hairline"
              strokeDasharray="3 4"
            />
            <text
              x={HB_X0}
              y={HB_BASE + 18}
              className="fill-mute text-[9px] font-mono"
            >
              &minus;{errMax.toFixed(2)}
            </text>
            <text
              x={HB_X1}
              y={HB_BASE + 18}
              textAnchor="end"
              className="fill-mute text-[9px] font-mono"
            >
              +{errMax.toFixed(2)}
            </text>
            <text
              x={(HB_X0 + HB_X1) / 2}
              y={HB_BASE + 18}
              textAnchor="middle"
              className="fill-body-mid text-[9px] font-mono"
            >
              error = x&#770; &minus; x
            </text>
          </svg>
        </div>

        <dl className="space-y-1 self-center font-mono text-[11px] text-body-mid">
          <div className="flex justify-between gap-2">
            <dt>max |error|</dt>
            <dd className="text-ink">{result.maxAbs.toFixed(3)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>RMSE</dt>
            <dd className="text-ink">{result.rmse.toFixed(3)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>SQNR</dt>
            <dd className="text-accent">{result.sqnr.toFixed(1)} dB</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>clipped</dt>
            <dd className="text-ink">
              {result.clipped} / {VALUES.length}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>scale{result.scales.length > 1 ? "s" : ""}</dt>
            <dd className="truncate text-ink">{scaleText}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-3 rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-[10px] text-body-mid">
        {EXAMPLES.map((i) => {
          const x = VALUES[i];
          const q = result.codes[i];
          const xHat = result.recon[i];
          const err = Math.abs(result.errors[i]);
          return (
            <div key={`ex-${i}`} className="flex flex-wrap items-baseline gap-x-2">
              <span className="w-24 shrink-0 text-ink">x = {x.toFixed(2)}</span>
              <span className="text-mute">&rarr;</span>
              <span className="w-16">q = {q}</span>
              <span className="text-mute">&rarr;</span>
              <span className="w-28 text-accent">x&#770; = {xHat.toFixed(3)}</span>
              <span className="text-mute">&rarr;</span>
              <span>error {err.toFixed(3)}</span>
            </div>
          );
        })}
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
