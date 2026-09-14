"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { clamp, getCanvasPalette, type DemoProps } from "@/lib/articles-demos";

export type Vec2 = [number, number];

export const PCA_POINTS: Vec2[] = [
  [-2.6, -1.6],
  [-2.15, -1.3],
  [-1.7, -1.62],
  [-1.3, -0.8],
  [-0.9, -0.9],
  [-0.62, -0.22],
  [-0.25, -0.5],
  [0.1, 0.12],
  [0.36, -0.08],
  [0.62, 0.5],
  [0.92, 0.34],
  [1.26, 0.82],
  [1.6, 0.6],
  [1.92, 1.12],
  [2.2, 0.88],
  [2.56, 1.34],
  [0.22, 1.12],
  [-1.05, 0.62],
];

export interface PcaOptions {
  center: boolean;
  standardize: boolean;
}

export function meanOf(points: Vec2[]): Vec2 {
  let sx = 0;
  let sy = 0;
  for (const point of points) {
    sx += point[0];
    sy += point[1];
  }
  const n = Math.max(points.length, 1);
  return [sx / n, sy / n];
}

export function standardDeviationOf(points: Vec2[]): Vec2 {
  const mean = meanOf(points);
  let sxx = 0;
  let syy = 0;
  for (const point of points) {
    sxx += (point[0] - mean[0]) ** 2;
    syy += (point[1] - mean[1]) ** 2;
  }
  const n = Math.max(points.length, 1);
  return [Math.sqrt(sxx / n), Math.sqrt(syy / n)];
}

export function toWorkingSpace(points: Vec2[], options: PcaOptions): Vec2[] {
  if (!options.center && !options.standardize) {
    return points.map((point) => [point[0], point[1]] as Vec2);
  }
  const mean = meanOf(points);
  const std = options.standardize ? standardDeviationOf(points) : null;
  return points.map((point) => {
    const dx = point[0] - mean[0];
    const dy = point[1] - mean[1];
    if (std) {
      return [dx / Math.max(std[0], 1e-9), dy / Math.max(std[1], 1e-9)];
    }
    return [dx, dy];
  });
}

export function momentMatrix(
  points: Vec2[],
  centered: boolean,
): [number, number, number] {
  if (centered) {
    const mean = meanOf(points);
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (const point of points) {
      const dx = point[0] - mean[0];
      const dy = point[1] - mean[1];
      xx += dx * dx;
      xy += dx * dy;
      yy += dy * dy;
    }
    const n = Math.max(points.length, 1);
    return [xx / n, xy / n, yy / n];
  }
  let xx = 0;
  let xy = 0;
  let yy = 0;
  for (const point of points) {
    xx += point[0] * point[0];
    xy += point[0] * point[1];
    yy += point[1] * point[1];
  }
  const n = Math.max(points.length, 1);
  return [xx / n, xy / n, yy / n];
}

export function normalize2(v: Vec2): Vec2 {
  const norm = Math.hypot(v[0], v[1]);
  if (norm < 1e-9) return [1, 0];
  return [v[0] / norm, v[1] / norm];
}

export function dot2(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function rotateVec(v: Vec2, radians: number): Vec2 {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos];
}

export interface PcaAxes {
  values: [number, number];
  axes: [Vec2, Vec2];
}

export function pcaAxes(points: Vec2[], options: PcaOptions): PcaAxes {
  const working = toWorkingSpace(points, options);
  const [xx, xy, yy] = momentMatrix(
    working,
    options.center || options.standardize,
  );
  const trace = xx + yy;
  const determinant = xx * yy - xy * xy;
  const discriminant = Math.max(0, (trace * trace) / 4 - determinant);
  const root = Math.sqrt(discriminant);
  const values: [number, number] = [
    trace / 2 + root,
    Math.max(0, trace / 2 - root),
  ];

  const eigenvector = (lambda: number): Vec2 => {
    const candidates: Vec2[] = [
      [xy, yy - lambda],
      [xx - lambda, xy],
    ];
    let best: Vec2 = [1, 0];
    let bestNorm = 0;
    for (const candidate of candidates) {
      const norm = Math.hypot(candidate[0], candidate[1]);
      if (norm > bestNorm) {
        best = candidate;
        bestNorm = norm;
      }
    }
    if (bestNorm < 1e-9) {
      return lambda === values[0] ? [1, 0] : [0, 1];
    }
    return [-best[1] / bestNorm, best[0] / bestNorm];
  };

  return { values, axes: [eigenvector(values[0]), eigenvector(values[1])] };
}

function quadraticForm(
  points: Vec2[],
  axis: Vec2,
  centered: boolean,
): number {
  const [xx, xy, yy] = momentMatrix(points, centered);
  const u = normalize2(axis);
  return xx * u[0] * u[0] + 2 * xy * u[0] * u[1] + yy * u[1] * u[1];
}

export function projectionVariance(
  points: Vec2[],
  axis: Vec2,
  options: PcaOptions,
): number {
  const working = toWorkingSpace(points, options);
  return quadraticForm(working, axis, options.center || options.standardize);
}

export function residualError(
  points: Vec2[],
  axis: Vec2,
  options: PcaOptions,
): number {
  const working = toWorkingSpace(points, options);
  const centered = options.center || options.standardize;
  const [xx, xy, yy] = momentMatrix(working, centered);
  return Math.max(0, xx + yy - quadraticForm(working, axis, centered));
}

export function explainedRatio(axes: PcaAxes, index: 0 | 1): number {
  const total = axes.values[0] + axes.values[1];
  if (total < 1e-12) return 0;
  return axes.values[index] / total;
}

export interface Reconstruction {
  display: Vec2[];
  error: number;
  retained: number;
}

export function rankReconstruction(
  points: Vec2[],
  rank: number,
  options: PcaOptions,
): Reconstruction {
  const working = toWorkingSpace(points, options);
  const { values, axes } = pcaAxes(points, options);
  const kept = clamp(Math.round(rank), 0, 2);
  const mean = meanOf(points);
  const std = options.standardize ? standardDeviationOf(points) : null;

  const reconstructed = working.map((point) => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < kept; i++) {
      const coefficient = dot2(point, axes[i]);
      x += coefficient * axes[i][0];
      y += coefficient * axes[i][1];
    }
    return [x, y] as Vec2;
  });

  const error =
    reconstructed.reduce((sum, point, i) => {
      const dx = point[0] - working[i][0];
      const dy = point[1] - working[i][1];
      return sum + dx * dx + dy * dy;
    }, 0) / Math.max(working.length, 1);

  const display = reconstructed.map((point) => {
    if (!options.center && !options.standardize) return point;
    if (std) {
      return [
        point[0] * Math.max(std[0], 1e-9) + mean[0],
        point[1] * Math.max(std[1], 1e-9) + mean[1],
      ] as Vec2;
    }
    return [point[0] + mean[0], point[1] + mean[1]] as Vec2;
  });

  const total = values[0] + values[1];
  const retained =
    total < 1e-12
      ? 0
      : clamp(
          ((kept > 0 ? values[0] : 0) + (kept > 1 ? values[1] : 0)) / total,
          0,
          1,
        );

  return { display, error, retained };
}

const W = 560;
const H = 420;
const CX = W / 2;
const CY = H / 2;
const SCALE = 70;
const WORLD = 3;

type Mode = "project" | "reconstruct";

function toPx(v: Vec2): Vec2 {
  return [CX + v[0] * SCALE, CY - v[1] * SCALE];
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Vec2,
  to: Vec2,
  color: string,
  width: number,
): void {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ux = dx / len;
  const uy = dy / len;
  const head = Math.min(11, len * 0.35);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0] - ux * head, to[1] - uy * head);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to[0], to[1]);
  ctx.lineTo(
    to[0] - ux * head - uy * head * 0.55,
    to[1] - uy * head + ux * head * 0.55,
  );
  ctx.lineTo(
    to[0] - ux * head + uy * head * 0.55,
    to[1] - uy * head - ux * head * 0.55,
  );
  ctx.closePath();
  ctx.fill();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  at: Vec2,
  color: string,
): void {
  ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, at[0], at[1]);
}

export function PcaProjectionDemo(_props: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);

  const [mode, setMode] = useState<Mode>("project");
  const [rank, setRank] = useState(1);
  const [center, setCenter] = useState(true);
  const [standardize, setStandardize] = useState(false);
  const [axis, setAxis] = useState<Vec2>([1, 0.32]);

  const options: PcaOptions = { center, standardize };
  const pca = pcaAxes(PCA_POINTS, options);
  const u = normalize2(axis);
  const projected = projectionVariance(PCA_POINTS, u, options);
  const best = pca.values[0];
  const totalVariance = pca.values[0] + pca.values[1];
  const residual = residualError(PCA_POINTS, u, options);
  const reconstruction = rankReconstruction(PCA_POINTS, rank, options);
  const pc1Ratio = explainedRatio(pca, 0);
  const axisRatio = totalVariance > 1e-12 ? projected / totalVariance : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const palette = getCanvasPalette(canvas);
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.lineWidth = 1;
      ctx.strokeStyle = palette.hairline;
      for (let i = -WORLD; i <= WORLD; i++) {
        if (i === 0) continue;
        const gx = toPx([i, 0])[0];
        const gy = toPx([0, i])[1];
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }
      ctx.strokeStyle = palette.mute;
      ctx.beginPath();
      ctx.moveTo(0, CY);
      ctx.lineTo(W, CY);
      ctx.moveTo(CX, 0);
      ctx.lineTo(CX, H);
      ctx.stroke();

      const origin = toPx([0, 0]);
      const drawAxisLine = (direction: Vec2, color: string, alpha: number) => {
        const tip = toPx([direction[0] * WORLD, direction[1] * WORLD]);
        const tail = toPx([-direction[0] * WORLD, -direction[1] * WORLD]);
        ctx.globalAlpha = alpha;
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.lineTo(tip[0], tip[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      };

      drawAxisLine(pca.axes[0], palette.info, 0.7);
      drawAxisLine(pca.axes[1], palette.info, 0.35);
      drawLabel(
        ctx,
        "PC\u2081",
        toPx([pca.axes[0][0] * WORLD, pca.axes[0][1] * WORLD]),
        palette.info,
      );
      drawLabel(
        ctx,
        "PC\u2082",
        toPx([pca.axes[1][0] * WORLD, pca.axes[1][1] * WORLD]),
        palette.info,
      );

      if (mode === "project") {
        drawAxisLine(u, palette.accent, 0.5);
        drawArrow(ctx, origin, toPx([u[0] * 2.6, u[1] * 2.6]), palette.accent, 2.5);

        for (const point of PCA_POINTS) {
          const coefficient = dot2(point, u);
          const foot = toPx([coefficient * u[0], coefficient * u[1]]);
          const tip = toPx(point);
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = palette.hairline;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tip[0], tip[1]);
          ctx.lineTo(foot[0], foot[1]);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.arc(foot[0], foot[1], 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        for (let i = 0; i < PCA_POINTS.length; i++) {
          const tip = toPx(PCA_POINTS[i]);
          const foot = toPx(reconstruction.display[i]);
          if (rank < 2) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = palette.warning;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tip[0], tip[1]);
            ctx.lineTo(foot[0], foot[1]);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = palette.warning;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(foot[0] - 3.5, foot[1] - 3.5, 7, 7);
        }
      }

      ctx.fillStyle = palette.ink;
      for (const point of PCA_POINTS) {
        const px = toPx(point);
        ctx.beginPath();
        ctx.arc(px[0], px[1], 3.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = palette.body;
      if (mode === "project") {
        ctx.fillText(
          `var(u) = ${projected.toFixed(3)}  (${(axisRatio * 100).toFixed(1)}% of total)`,
          10,
          18,
        );
        ctx.fillText(`residual = ${residual.toFixed(3)}`, 10, 34);
      } else {
        ctx.fillText(
          `rank r = ${Math.round(rank)}  \u00b7  energy kept ${(reconstruction.retained * 100).toFixed(1)}%`,
          10,
          18,
        );
        ctx.fillText(`residual MSE = ${reconstruction.error.toFixed(4)}`, 10, 34);
      }
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [mode, rank, center, standardize, axis]);

  const moveToPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (mode !== "project") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const candidate: Vec2 = [px - CX, CY - py];
    if (Math.hypot(candidate[0], candidate[1]) < 8) return;
    setAxis(normalize2(candidate));
  };

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const status =
    mode === "project"
      ? `Projecting onto u = (${u[0].toFixed(2)}, ${u[1].toFixed(2)}): variance ${projected.toFixed(3)}, ` +
        `residual ${residual.toFixed(3)}. The best direction, PC\u2081, reaches ${best.toFixed(3)} ` +
        `(${(pc1Ratio * 100).toFixed(1)}% of total). ` +
        (Math.abs(axisRatio - pc1Ratio) < 0.01
          ? "u is the principal axis."
          : "Drag u onto the dashed PC\u2081 line to make the residual as small as possible.")
      : `Keeping r = ${Math.round(rank)} of 2 components retains ` +
        `${(reconstruction.retained * 100).toFixed(1)}% of the variance with a reconstruction MSE of ` +
        `${reconstruction.error.toFixed(4)}. ` +
        (rank < 2
          ? "The residual is exactly the variance on the dropped axis."
          : "With both components the reconstruction is exact.");

  const ariaLabel =
    `Scatter of ${PCA_POINTS.length} points. ` +
    (mode === "project"
      ? `A projection axis u points at an angle of ${((Math.atan2(u[1], u[0]) * 180) / Math.PI).toFixed(0)} degrees. ` +
        `Variance along u is ${projected.toFixed(3)} with residual ${residual.toFixed(3)}.`
      : `A rank ${Math.round(rank)} reconstruction keeps ${(reconstruction.retained * 100).toFixed(1)} percent of the variance.`) +
    ` Principal axis one captures ${(pc1Ratio * 100).toFixed(1)} percent of total variance.`;

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Project, then rebuild from the top axes
        </span>
        <span className="font-mono text-[11px] text-body-mid">
          X &#8776; X&#8322; = U&#8322;&Sigma;&#8322;V&#8322;&#7480;
        </span>
      </figcaption>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            width={W * 2}
            height={H * 2}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            onPointerDown={(e) => {
              if (mode !== "project") return;
              draggingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              moveToPointer(e);
            }}
            onPointerMove={(e) => {
              if (draggingRef.current) moveToPointer(e);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (mode !== "project") return;
              const step = e.shiftKey ? 0.26 : 0.08;
              if (e.key === "ArrowLeft") setAxis((prev) => normalize2(rotateVec(prev, -step)));
              else if (e.key === "ArrowRight") setAxis((prev) => normalize2(rotateVec(prev, step)));
              else return;
              e.preventDefault();
            }}
            className={
              mode === "project"
                ? "block w-full cursor-grab touch-none rounded-lg bg-canvas focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent active:cursor-grabbing"
                : "block w-full touch-none rounded-lg bg-canvas focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
            }
          />
          <p className="mt-1.5 text-[10px] text-mute">
            {mode === "project"
              ? "Drag the tip of u (or focus the canvas and use the arrow keys). The dashed blue lines are the true principal axes."
              : "Squares are the rank-r rebuild of each point; the warm segments are what the dropped components would have explained."}
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-64">
          <span className="flex gap-1" role="group" aria-label="Demo mode">
            <button
              type="button"
              aria-pressed={mode === "project"}
              onClick={() => setMode("project")}
              className={toggleClasses(mode === "project")}
            >
              Project
            </button>
            <button
              type="button"
              aria-pressed={mode === "reconstruct"}
              onClick={() => setMode("reconstruct")}
              className={toggleClasses(mode === "reconstruct")}
            >
              Reconstruct
            </button>
          </span>

          <div className="mt-3 flex flex-wrap gap-1">
            <button
              type="button"
              aria-pressed={center}
              onClick={() => setCenter((value) => !value)}
              className={toggleClasses(center)}
            >
              Center
            </button>
            <button
              type="button"
              aria-pressed={standardize}
              onClick={() => setStandardize((value) => !value)}
              className={toggleClasses(standardize)}
            >
              Standardize
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-hairline bg-canvas px-2.5 py-2">
            <label className="flex items-center gap-2 text-xs text-body-mid">
              rank r
              <input
                type="range"
                min={1}
                max={2}
                step={1}
                value={rank}
                onChange={(e) => setRank(Number(e.target.value))}
                aria-label="Number of principal components kept"
                aria-valuetext={`${rank} component${rank === 1 ? "" : "s"}`}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-canvas-soft"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink">
                {rank}
              </span>
            </label>
          </div>

          <dl className="mt-3 space-y-1 font-mono text-[11px] text-body-mid">
            <div className="flex justify-between gap-2">
              <dt>{mode === "project" ? "var(u)" : "variance kept"}</dt>
              <dd className="text-ink">
                {mode === "project"
                  ? projected.toFixed(3)
                  : `${(reconstruction.retained * 100).toFixed(1)}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>PC&#8321; variance</dt>
              <dd className="text-info">{best.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>PC&#8321; share</dt>
              <dd className="text-ink">{(pc1Ratio * 100).toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>{mode === "project" ? "residual" : "residual MSE"}</dt>
              <dd className="text-warning">
                {mode === "project"
                  ? residual.toFixed(3)
                  : reconstruction.error.toFixed(4)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>u angle</dt>
              <dd className="text-ink">
                {((Math.atan2(u[1], u[0]) * 180) / Math.PI).toFixed(1)}&deg;
              </dd>
            </div>
          </dl>
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
