"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCanvasPalette,
  prefersReducedMotion,
  type DemoProps,
} from "@/lib/articles-demos";

const W = 520;
const H = 420;
const CX = W / 2;
const CY = H / 2;
const SCALE = 175;

interface Pt {
  x: number;
  y: number;
}

const POINTS: Pt[] = [
  { x: 0.5, y: 0.6 },
  { x: 0.7, y: 0.7 },
  { x: 0.6, y: 0.4 },
  { x: 0.8, y: 0.5 },
  { x: 0.4, y: 0.8 },
  { x: 0.7, y: 0.35 },
  { x: -0.6, y: 0.5 },
  { x: -0.8, y: 0.3 },
  { x: -0.5, y: 0.7 },
  { x: -0.9, y: 0.5 },
  { x: -0.7, y: 0.2 },
  { x: -0.6, y: 0.4 },
  { x: 0.0, y: -0.7 },
  { x: 0.2, y: -0.9 },
  { x: -0.2, y: -0.8 },
  { x: 0.1, y: -0.6 },
  { x: -0.1, y: -0.6 },
  { x: 0.3, y: -0.75 },
];

const INITIAL_CENTROIDS: Pt[] = [
  { x: 0.1, y: 0.9 },
  { x: -0.2, y: -0.1 },
  { x: 0.9, y: -0.4 },
];

interface Snapshot {
  centroids: Pt[];
  assignments: number[];
  inertia: number;
  iter: number;
  converged: boolean;
}

function nearestCentroid(p: Pt, centroids: Pt[]): number {
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

function inertiaOf(
  points: Pt[],
  centroids: Pt[],
  assignments: number[],
): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const c = centroids[assignments[i]];
    total += (points[i].x - c.x) ** 2 + (points[i].y - c.y) ** 2;
  }
  return total;
}

function initialSnapshot(): Snapshot {
  const centroids = INITIAL_CENTROIDS.map((c) => ({ ...c }));
  const assignments = POINTS.map((p) => nearestCentroid(p, centroids));
  return {
    centroids,
    assignments,
    inertia: inertiaOf(POINTS, centroids, assignments),
    iter: 0,
    converged: false,
  };
}

function stepOnce(prev: Snapshot): Snapshot {
  if (prev.converged) return prev;
  const assignments = POINTS.map((p) => nearestCentroid(p, prev.centroids));
  const sums = prev.centroids.map(() => ({ x: 0, y: 0, n: 0 }));
  for (let i = 0; i < POINTS.length; i++) {
    const c = assignments[i];
    sums[c].x += POINTS[i].x;
    sums[c].y += POINTS[i].y;
    sums[c].n += 1;
  }
  const centroids = prev.centroids.map((c, i) =>
    sums[i].n > 0
      ? { x: sums[i].x / sums[i].n, y: sums[i].y / sums[i].n }
      : { ...c },
  );
  const moved = centroids.some(
    (c, i) =>
      Math.hypot(c.x - prev.centroids[i].x, c.y - prev.centroids[i].y) > 1e-9,
  );
  const changed = assignments.some((a, i) => a !== prev.assignments[i]);
  return {
    centroids,
    assignments,
    inertia: inertiaOf(POINTS, centroids, assignments),
    iter: prev.iter + 1,
    converged: !moved && !changed,
  };
}

function runToConvergence(start: Snapshot): Snapshot {
  let next = start;
  for (let i = 0; i < 50 && !next.converged; i++) {
    next = stepOnce(next);
  }
  return next;
}

function toPx(p: Pt): [number, number] {
  return [CX + p.x * SCALE, CY - p.y * SCALE];
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cluster: number,
  color: string,
): void {
  const size = 5;
  if (cluster === 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (cluster === 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
    return;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size - 1);
  ctx.lineTo(x + size + 1, y);
  ctx.lineTo(x, y + size + 1);
  ctx.lineTo(x - size - 1, y);
  ctx.closePath();
  ctx.fill();
}

export function KMeansDemo(_props: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || snapshot.converged) return;
    const id = window.setTimeout(() => {
      const next = stepOnce(snapshot);
      setSnapshot(next);
      if (next.converged) setRunning(false);
    }, 650);
    return () => window.clearTimeout(id);
  }, [running, snapshot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const palette = getCanvasPalette(canvas);
      const clusterColors = [palette.accent, palette.info, palette.warning];
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = palette.hairline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, CY);
      ctx.lineTo(W, CY);
      ctx.moveTo(CX, 0);
      ctx.lineTo(CX, H);
      ctx.stroke();

      const sizes = [0, 0, 0];
      for (const a of snapshot.assignments) sizes[a] += 1;

      for (let i = 0; i < POINTS.length; i++) {
        const cluster = snapshot.assignments[i];
        const [px, py] = toPx(POINTS[i]);
        const [cx, cy] = toPx(snapshot.centroids[cluster]);
        ctx.strokeStyle = clusterColors[cluster];
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < POINTS.length; i++) {
        const [px, py] = toPx(POINTS[i]);
        drawMarker(ctx, px, py, snapshot.assignments[i], clusterColors[snapshot.assignments[i]]);
      }

      for (let i = 0; i < snapshot.centroids.length; i++) {
        const [px, py] = toPx(snapshot.centroids[i]);
        ctx.strokeStyle = clusterColors[i];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = clusterColors[i];
        ctx.font = "bold 11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), px, py + 0.5);
        ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = palette.body;
        ctx.fillText(`#${i + 1} (${sizes[i]})`, px + 14, py - 12);
      }

      ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = palette.body;
      ctx.fillText(
        snapshot.converged
          ? `converged after ${snapshot.iter} iteration${snapshot.iter === 1 ? "" : "s"}`
          : `iteration ${snapshot.iter}`,
        10,
        16,
      );
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [snapshot]);

  const sizes = [0, 0, 0];
  for (const a of snapshot.assignments) sizes[a] += 1;

  const ariaLabel =
    `K-means canvas: 18 points, 3 centroids, iteration ${snapshot.iter}. ` +
    `Inertia ${snapshot.inertia.toFixed(4)}. Cluster sizes ${sizes.join(", ")}. ` +
    (snapshot.converged ? "Converged." : "Still moving.");

  const status =
    `Iteration ${snapshot.iter}. Inertia ${snapshot.inertia.toFixed(4)}. ` +
    `Cluster sizes: ${sizes.join(" / ")}. ` +
    (snapshot.converged
      ? "Converged \u2014 assignments and centroids stopped changing."
      : running
        ? "Running one step every 0.65 s\u2026"
        : "Press Step to run one assignment + update pass.");

  const secondary =
    "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 text-sm font-semibold text-ink">
        Assignment, then update
      </figcaption>

      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        role="img"
        aria-label={ariaLabel}
        className="block w-full rounded-lg bg-canvas"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSnapshot((prev) => stepOnce(prev))}
          disabled={snapshot.converged}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => {
            if (prefersReducedMotion()) {
              setSnapshot((prev) => runToConvergence(prev));
            } else {
              setRunning(true);
            }
          }}
          disabled={running && !prefersReducedMotion()}
          className={secondary}
        >
          Run to convergence
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSnapshot(initialSnapshot());
          }}
          className={secondary}
        >
          Reset
        </button>
        <span className="ml-auto flex items-center gap-3 text-[10px] text-body-mid">
          <span>&#9679; cluster 1</span>
          <span>&#9632; cluster 2</span>
          <span>&#9670; cluster 3</span>
        </span>
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
