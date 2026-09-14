"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clamp,
  getCanvasPalette,
  prefersReducedMotion,
  type DemoProps,
} from "@/lib/articles-demos";

export type Mat = number[][];

const BASE_B: Mat = [
  [0.85, 0.18],
  [-0.42, 0.66],
  [0.31, 1.05],
];

const BASE_A: Mat = [
  [0.78, -0.52, 0.41],
  [0.29, 0.87, -0.58],
];

const NOISE: Mat = [
  [0.04, -0.02, 0.015],
  [0.01, 0.03, -0.025],
  [-0.02, 0.015, 0.035],
];

export const FROZEN_W: Mat = [
  [0.42, -0.18, 0.11],
  [0.3, 0.51, -0.33],
  [-0.16, 0.22, 0.47],
];

export function identity(size: number): Mat {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0)),
  );
}

export function zeros(rows: number, cols: number): Mat {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

export function matmul(a: Mat, b: Mat): Mat {
  const rows = a.length;
  const inner = b.length;
  const cols = b[0]?.length ?? 0;
  const out = zeros(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const factor = a[i][k];
      if (factor === 0) continue;
      for (let j = 0; j < cols; j++) out[i][j] += factor * b[k][j];
    }
  }
  return out;
}

export function transpose(a: Mat): Mat {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  const out = zeros(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) out[j][i] = a[i][j];
  }
  return out;
}

export function addMats(a: Mat, b: Mat): Mat {
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function scaleMat(a: Mat, factor: number): Mat {
  return a.map((row) => row.map((value) => value * factor));
}

export function frobeniusNorm(a: Mat): number {
  let sum = 0;
  for (const row of a) {
    for (const value of row) sum += value * value;
  }
  return Math.sqrt(sum);
}

export interface SymmetricEigen {
  values: number[];
  vectors: Mat;
}

export function symmetricEigen(matrix: Mat): SymmetricEigen {
  const n = matrix.length;
  const a = matrix.map((row) => [...row]);
  const vectors = identity(n);

  for (let sweep = 0; sweep < 100; sweep++) {
    let offDiagonal = 0;
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) offDiagonal += a[p][q] * a[p][q];
    }
    if (offDiagonal < 1e-20) break;

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        const app = a[p][p];
        const aqq = a[q][q];
        const apq = a[p][q];
        a[p][p] = app - t * apq;
        a[q][q] = aqq + t * apq;
        a[p][q] = 0;
        a[q][p] = 0;
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue;
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[p][k] = a[k][p];
          a[k][q] = s * akp + c * akq;
          a[q][k] = a[k][q];
        }
        for (let k = 0; k < n; k++) {
          const vkp = vectors[k][p];
          const vkq = vectors[k][q];
          vectors[k][p] = c * vkp - s * vkq;
          vectors[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (x, y) => a[y][y] - a[x][x],
  );
  return {
    values: order.map((i) => a[i][i]),
    vectors: order.map((i) => vectors.map((row) => row[i])),
  };
}

export interface SvdResult {
  singularValues: number[];
  u: Mat;
  v: Mat;
}

export function svdSmall(target: Mat): SvdResult {
  const rows = target.length;
  const cols = target[0]?.length ?? 0;
  const gram = matmul(transpose(target), target);
  const eigen = symmetricEigen(gram);
  const singularValues = eigen.values.map((value) => Math.sqrt(Math.max(0, value)));

  const u = zeros(rows, cols);
  for (let j = 0; j < cols; j++) {
    const sigma = singularValues[j];
    if (sigma > 1e-9) {
      for (let i = 0; i < rows; i++) {
        let sum = 0;
        for (let k = 0; k < cols; k++) sum += target[i][k] * eigen.vectors[j][k];
        u[i][j] = sum / sigma;
      }
      continue;
    }
    for (let basis = 0; basis < rows; basis++) {
      const candidate = Array.from({ length: rows }, (_, i) =>
        i === basis ? 1 : 0,
      );
      for (let prev = 0; prev < j; prev++) {
        let dot = 0;
        for (let i = 0; i < rows; i++) dot += candidate[i] * u[i][prev];
        for (let i = 0; i < rows; i++) candidate[i] -= dot * u[i][prev];
      }
      const norm = Math.hypot(...candidate);
      if (norm > 1e-6) {
        for (let i = 0; i < rows; i++) u[i][j] = candidate[i] / norm;
        break;
      }
    }
  }

  return { singularValues, u, v: eigen.vectors };
}

export interface RankApproximation {
  b: Mat;
  a: Mat;
  approx: Mat;
  error: number;
  totalEnergy: number;
  retainedEnergy: number;
}

export function rankApproximation(target: Mat, rank: number): RankApproximation {
  const rows = target.length;
  const cols = target[0]?.length ?? 0;
  const k = clamp(Math.round(rank), 1, Math.min(rows, cols));
  const { singularValues, u, v } = svdSmall(target);

  const b = zeros(rows, k);
  const a = zeros(k, cols);
  for (let j = 0; j < k; j++) {
    const root = Math.sqrt(Math.max(0, singularValues[j]));
    for (let i = 0; i < rows; i++) b[i][j] = u[i][j] * root;
    for (let i = 0; i < cols; i++) a[j][i] = v[j][i] * root;
  }

  const totalEnergy = singularValues.reduce((sum, value) => sum + value * value, 0);
  const error = Math.sqrt(
    singularValues
      .slice(k)
      .reduce((sum, value) => sum + value * value, 0),
  );
  return {
    b,
    a,
    approx: matmul(b, a),
    error,
    totalEnergy,
    retainedEnergy: totalEnergy - error * error,
  };
}

export const LORA_TARGET: Mat = addMats(matmul(BASE_B, BASE_A), NOISE);

export function loraParamCount(dIn: number, dOut: number, rank: number): number {
  const r = Math.max(0, Math.round(rank));
  return r * (Math.max(0, Math.round(dIn)) + Math.max(0, Math.round(dOut)));
}

export function denseParamCount(dIn: number, dOut: number): number {
  return Math.max(0, Math.round(dIn)) * Math.max(0, Math.round(dOut));
}

export function mergeWeights(w: Mat, b: Mat, a: Mat): Mat {
  return addMats(w, matmul(b, a));
}

export function qloraMemoryBytes(
  baseParams: number,
  dIn: number,
  dOut: number,
  rank: number,
): number {
  const adapter = loraParamCount(dIn, dOut, rank);
  return baseParams * 0.5 + adapter * 12;
}

export function fullFinetuneMemoryBytes(baseParams: number): number {
  return baseParams * 12;
}

const BASE_MODEL_PARAMS = 7e9;
const CELL = 52;
const GRID_GAP = 26;
const GRID_TOP = 34;
const GRID_LEFT = 14;
const PANEL_STRIDE = 3 * CELL + GRID_GAP;
const CANVAS_W = GRID_LEFT * 2 + 3 * (3 * CELL) + 2 * GRID_GAP;
const CANVAS_H = GRID_TOP + 3 * CELL + 44;

function formatCount(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

export function LoraRankDemo(_props: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rank, setRank] = useState(2);
  const [width, setWidth] = useState(4096);
  const [qlora, setQlora] = useState(true);
  const [merged, setMerged] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const approximation = useMemo(() => rankApproximation(LORA_TARGET, rank), [rank]);
  const targetNorm = frobeniusNorm(LORA_TARGET);
  const relativeError = approximation.error / Math.max(targetNorm, 1e-12);
  const retained = approximation.retainedEnergy / Math.max(approximation.totalEnergy, 1e-12);

  const loraParams = loraParamCount(width, width, rank);
  const denseParams = denseParamCount(width, width);
  const adapterBytes = loraParams * 2;
  const trainingBytes = qlora
    ? qloraMemoryBytes(BASE_MODEL_PARAMS, width, width, rank)
    : fullFinetuneMemoryBytes(BASE_MODEL_PARAMS);
  const fullBytes = fullFinetuneMemoryBytes(BASE_MODEL_PARAMS);

  useEffect(() => {
    if (!merged) return;
    if (prefersReducedMotion()) {
      const frame = requestAnimationFrame(() => setMergeProgress(1));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (time: number) => {
      if (start === null) start = time;
      const progress = clamp((time - start) / 420, 0, 1);
      setMergeProgress(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [merged]);

  const toggleMerged = () => {
    if (merged) {
      setMerged(false);
      setMergeProgress(0);
      return;
    }
    setMerged(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { approx } = approximation;
    const visibleDelta = scaleMat(approx, merged ? mergeProgress : 0);
    const panels: { data: Mat; label: string }[] = [
      { data: LORA_TARGET, label: "\u0394W target" },
      { data: approx, label: `B\u00b7A  (r = ${rank})` },
      {
        data: merged ? addMats(FROZEN_W, visibleDelta) : FROZEN_W,
        label: merged ? "W + BA merged" : "frozen W",
      },
    ];

    let maxAbs = 0;
    for (const panel of panels) {
      for (const row of panel.data) {
        for (const value of row) maxAbs = Math.max(maxAbs, Math.abs(value));
      }
    }
    const scale = Math.max(maxAbs, 1e-6);

    const palette = getCanvasPalette(canvas);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    panels.forEach((panel, panelIndex) => {
      const originX = GRID_LEFT + panelIndex * PANEL_STRIDE;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const value = panel.data[row][col];
          const intensity = Math.min(1, Math.abs(value) / scale);
          const x = originX + col * CELL;
          const y = GRID_TOP + row * CELL;
          ctx.fillStyle = value >= 0 ? palette.accent : palette.error;
          ctx.globalAlpha = 0.12 + intensity * 0.68;
          ctx.fillRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = palette.hairline;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, CELL, CELL);
          ctx.fillStyle = palette.ink;
          ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(value.toFixed(2), x + CELL / 2, y + CELL / 2);
        }
      }
      ctx.fillStyle = panelIndex === 1 ? palette.info : palette.body;
      ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(panel.label, originX, GRID_TOP + 3 * CELL + 18);
    });

    ctx.fillStyle = palette.mute;
    ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "\u0394W = B\u00b7A + residual   \u00b7   green positive, red negative",
      GRID_LEFT,
      CANVAS_H - 8,
    );
  }, [rank, merged, mergeProgress, approximation]);

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const status =
    `Rank r = ${rank}: the low-rank update captures ${(retained * 100).toFixed(1)}% of the update energy ` +
    `with a relative Frobenius error of ${(relativeError * 100).toFixed(1)}%. ` +
    `For a ${width}\u00d7${width} weight, LoRA trains ${formatCount(loraParams)} parameters ` +
    `instead of ${formatCount(denseParams)} (${((loraParams / denseParams) * 100).toFixed(2)}%). ` +
    (merged
      ? "Merged: W + BA is a single matrix, so inference sees zero extra latency."
      : qlora
        ? `QLoRA fits a 7B base in ${(trainingBytes / 1e9).toFixed(1)} GB (NF4 base + bf16 adapters); full fine-tuning needs about ${(fullBytes / 1e9).toFixed(0)} GB.`
        : `16-bit training needs about ${(trainingBytes / 1e9).toFixed(0)} GB before activations.`);

  const ariaLabel =
    `Three 3 by 3 matrices: the target update, its rank ${rank} approximation, and the ` +
    `${merged ? "merged weight" : "frozen weight"}. Relative approximation error ` +
    `${(relativeError * 100).toFixed(1)} percent. LoRA uses ${formatCount(loraParams)} parameters against ` +
    `${formatCount(denseParams)} dense parameters.`;

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Train a low-rank shadow, then fold it back in
        </span>
        <span className="font-mono text-[11px] text-body-mid">
          h = Wx + (&#945;/r)&#183;B&#183;A&#183;x
        </span>
      </figcaption>

      <canvas
        ref={canvasRef}
        width={CANVAS_W * 2}
        height={CANVAS_H * 2}
        role="img"
        aria-label={ariaLabel}
        className="block w-full rounded-lg bg-canvas"
      />

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-xs text-body-mid">
              rank r
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={rank}
                onChange={(e) => setRank(Number(e.target.value))}
                aria-label="LoRA rank"
                aria-valuetext={`rank ${rank}`}
                className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-canvas-soft"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="w-6 font-mono text-[11px] text-ink">{rank}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-body-mid">
              d
              <input
                type="range"
                min={1024}
                max={8192}
                step={1024}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                aria-label="Module width"
                aria-valuetext={`${width} by ${width}`}
                className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-canvas-soft"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="w-12 font-mono text-[11px] text-ink">{width}</span>
            </label>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              aria-pressed={qlora}
              onClick={() => setQlora((value) => !value)}
              className={toggleClasses(qlora)}
            >
              QLoRA (NF4 base)
            </button>
            <button
              type="button"
              aria-pressed={merged}
              onClick={toggleMerged}
              className={toggleClasses(merged)}
            >
              Merge adapter
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 self-center font-mono text-[11px] text-body-mid sm:w-64">
          <div className="flex justify-between gap-2">
            <dt>rel. error</dt>
            <dd className="text-warning">{(relativeError * 100).toFixed(1)}%</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>energy</dt>
            <dd className="text-ink">{(retained * 100).toFixed(1)}%</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>LoRA params</dt>
            <dd className="text-accent">{formatCount(loraParams)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>dense params</dt>
            <dd className="text-ink">{formatCount(denseParams)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>adapter</dt>
            <dd className="text-ink">{(adapterBytes / 1e6).toFixed(1)} MB</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>{qlora ? "QLoRA train" : "full train"}</dt>
            <dd className="text-ink">{(trainingBytes / 1e9).toFixed(1)} GB</dd>
          </div>
        </dl>
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
