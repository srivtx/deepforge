"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCanvasPalette,
  prefersReducedMotion,
  type DemoPalette,
} from "@/lib/articles-demos";

const W = 640;
const H = 320;
const XR = 10.5;
const YR = 2.3;
const MAX_STEPS = 1500;
const SUBSTEPS = 2;
const CONVERGE_LOSS = 2e-4;
const EPS = 1e-8;
const START = { x: -9, y: 1.8 };

type OptId = "sgd" | "momentum" | "nesterov" | "adagrad" | "rmsprop" | "adam";

function loss(x: number, y: number): number {
  return (x * x) / 20 + y * y;
}

interface OptSpec {
  id: OptId;
  name: string;
  colorKey: keyof DemoPalette;
  cssVar: string;
}

const SPECS: OptSpec[] = [
  { id: "sgd", name: "SGD", colorKey: "body", cssVar: "var(--body)" },
  { id: "momentum", name: "Momentum", colorKey: "info", cssVar: "var(--info)" },
  { id: "nesterov", name: "Nesterov", colorKey: "warning", cssVar: "var(--warning)" },
  { id: "adagrad", name: "AdaGrad", colorKey: "error", cssVar: "var(--error)" },
  { id: "rmsprop", name: "RMSProp", colorKey: "accent", cssVar: "var(--accent)" },
  { id: "adam", name: "Adam", colorKey: "ink", cssVar: "var(--ink)" },
];

interface OptState {
  x: number; y: number; vx: number; vy: number; sx: number; sy: number;
  steps: number; done: boolean; diverged: boolean; trail: number[];
}

function initialOpt(): OptState {
  return {
    x: START.x, y: START.y, vx: 0, vy: 0, sx: 0, sy: 0, steps: 0,
    done: false, diverged: false, trail: [START.x, START.y],
  };
}

function initialSim(): OptState[] {
  return SPECS.map(() => initialOpt());
}

function stepOnce(id: OptId, o: OptState, lr: number): OptState {
  const gx = o.x / 10;
  const gy = 2 * o.y;
  const t = o.steps + 1;
  let { x, y, vx, vy, sx, sy } = o;

  if (id === "sgd") {
    x -= lr * gx;
    y -= lr * gy;
  } else if (id === "momentum") {
    vx = 0.9 * vx + gx; vy = 0.9 * vy + gy;
    x -= lr * vx; y -= lr * vy;
  } else if (id === "nesterov") {
    vx = 0.9 * o.vx + (o.x - lr * 0.9 * o.vx) / 10;
    vy = 0.9 * o.vy + 2 * (o.y - lr * 0.9 * o.vy);
    x -= lr * vx; y -= lr * vy;
  } else if (id === "adagrad") {
    sx += gx * gx; sy += gy * gy;
    x -= (lr * gx) / (Math.sqrt(sx) + EPS);
    y -= (lr * gy) / (Math.sqrt(sy) + EPS);
  } else if (id === "rmsprop") {
    sx = 0.9 * sx + 0.1 * gx * gx; sy = 0.9 * sy + 0.1 * gy * gy;
    x -= (lr * gx) / (Math.sqrt(sx) + EPS);
    y -= (lr * gy) / (Math.sqrt(sy) + EPS);
  } else {
    const c1 = 1 - Math.pow(0.9, t);
    const c2 = 1 - Math.pow(0.999, t);
    vx = 0.9 * vx + 0.1 * gx; vy = 0.9 * vy + 0.1 * gy;
    sx = 0.999 * sx + 0.001 * gx * gx; sy = 0.999 * sy + 0.001 * gy * gy;
    x -= (lr * (vx / c1)) / (Math.sqrt(sx / c2) + EPS);
    y -= (lr * (vy / c1)) / (Math.sqrt(sy / c2) + EPS);
  }

  const diverged =
    !Number.isFinite(x) || !Number.isFinite(y) ||
    Math.abs(x) > 1e5 || Math.abs(y) > 1e5;
  return {
    x, y, vx, vy, sx, sy, steps: t, diverged,
    done: diverged || t >= MAX_STEPS || loss(x, y) < CONVERGE_LOSS,
    trail: diverged ? o.trail : o.trail.concat([x, y]),
  };
}

function advance(prev: OptState[], lr: number, n = SUBSTEPS): OptState[] {
  let changed = false;
  const next = prev.map((o, i) => {
    if (o.done) return o;
    let s = o;
    for (let k = 0; k < n && !s.done; k++) {
      s = stepOnce(SPECS[i].id, s, lr);
      changed = true;
    }
    return s;
  });
  return changed ? next : prev;
}

function toPx(x: number, y: number): [number, number] {
  return [((x + XR) / (2 * XR)) * W, ((YR - y) / (2 * YR)) * H];
}

function parseColor(v: string): { r: number; g: number; b: number } | null {
  const s = v.trim().replace("#", "");
  const hex = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  if (hex.length < 6) return null;
  const n = parseInt(hex.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function buildHeatmap(palette: DemoPalette, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.round(W * dpr);
  c.height = Math.round(H * dpr);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const base = parseColor(palette.canvas) ?? { r: 10, g: 10, b: 10 };
  const accent = parseColor(palette.accent) ?? { r: 127, g: 255, b: 159 };
  const norm = Math.log1p(loss(XR, YR));
  for (let py = 0; py < H; py += 4) {
    for (let px = 0; px < W; px += 4) {
      const x = (px / W) * 2 * XR - XR;
      const y = YR - (py / H) * 2 * YR;
      const u = Math.log1p(loss(x, y)) / norm;
      const band = Math.min(13, Math.max(0, Math.floor(u * 14)));
      const t = 0.07 + 0.5 * ((band + 1) / 14);
      const r = Math.round(base.r + (accent.r - base.r) * t);
      const g = Math.round(base.g + (accent.g - base.g) * t);
      const b = Math.round(base.b + (accent.b - base.b) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(px * dpr, py * dpr, 4 * dpr + 0.5, 4 * dpr + 0.5);
    }
  }
  return c;
}

const formatLoss = (v: number): string =>
  !Number.isFinite(v) ? "\u2014" : v < 0.001 ? v.toExponential(1) : v.toFixed(4);

const statusOf = (o: OptState): string =>
  o.diverged
    ? "Diverged"
    : !o.done
      ? "In progress"
      : o.steps >= MAX_STEPS
        ? "Step limit"
        : "Converged";

export function OptimizerRace({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatRef = useRef<HTMLCanvasElement | null>(null);
  const heatKeyRef = useRef("");
  const [sim, setSim] = useState<OptState[]>(() => initialSim());
  const [running, setRunning] = useState(false);
  const [lr, setLr] = useState(0.08);
  const [themeEpoch, setThemeEpoch] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => setThemeEpoch((e) => e + 1));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const allDone = sim.every((o) => o.done);
  const playing = running && !allDone;

  useEffect(() => {
    if (!playing || !active) return;
    let raf = 0;
    const tick = () => {
      setSim((prev) => advance(prev, lr));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, active, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const palette = getCanvasPalette(canvas);
    const key = `${palette.canvas}|${palette.accent}`;
    if (!heatRef.current || heatKeyRef.current !== key) {
      heatRef.current = buildHeatmap(palette, dpr);
      heatKeyRef.current = key;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (heatRef.current) ctx.drawImage(heatRef.current, 0, 0, W, H);
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 0; i < sim.length; i++) {
      const o = sim[i];
      if (o.trail.length < 4) continue;
      ctx.strokeStyle = palette[SPECS[i].colorKey];
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      for (let k = 0; k < o.trail.length; k += 2) {
        const [px, py] = toPx(o.trail[k], o.trail[k + 1]);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const [startX, startY] = toPx(START.x, START.y);
    ctx.strokeStyle = palette.mute;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(startX, startY, 5, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < sim.length; i++) {
      const o = sim[i];
      if (o.diverged || !Number.isFinite(o.x) || !Number.isFinite(o.y)) continue;
      const [px, py] = toPx(o.x, o.y);
      ctx.fillStyle = palette[SPECS[i].colorKey];
      ctx.beginPath();
      ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.canvas;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.fillStyle = palette.body;
    ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`f(x, y) = x\u00B2/20 + y\u00B2   \u00B7   lr ${lr.toFixed(2)}`, 10, 10);
  }, [sim, lr, themeEpoch]);

  const leader = sim.reduce(
    (best, o) => (loss(o.x, o.y) < loss(best.x, best.y) ? o : best),
    sim[0],
  );
  const leaderName = SPECS[sim.indexOf(leader)]?.name ?? SPECS[0].name;
  const ariaLabel =
    `Optimizer race on the elongated quadratic f(x,y) = x squared over 20 plus y squared. ` +
    `Learning rate ${lr.toFixed(2)}. ` +
    sim
      .map((o, i) =>
        `${SPECS[i].name}: ${statusOf(o).toLowerCase()}, ${o.steps} steps, ` +
        `loss ${formatLoss(loss(o.x, o.y))}`,
      )
      .join(". ") +
    `. Lowest loss: ${leaderName}.`;
  const secondary = "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-40";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-1 text-sm font-semibold text-ink">
        Optimizer Race
      </figcaption>
      <p className="mb-3 text-xs leading-relaxed text-body-mid">
        Six optimizers start from the same point on an elongated valley.
        Momentum and Adam escape the flat direction fast, plain SGD crawls, and
        AdaGrad&apos;s accumulated squared gradients shrink its steps until the
        rate is raised. Drag the slider and stage your own race.
      </p>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label={ariaLabel}
        className="block w-full rounded-lg bg-canvas"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (running) setRunning(false);
            else if (prefersReducedMotion()) setSim((prev) => advance(prev, lr, MAX_STEPS));
            else setRunning(true);
          }}
          disabled={allDone}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {running ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => setSim((prev) => advance(prev, lr, 1))}
          disabled={allDone}
          className={secondary}
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSim(initialSim());
          }}
          className={secondary}
        >
          Reset
        </button>
        <span className="ml-auto font-mono text-[11px] text-body-mid">
          {allDone
            ? `race over \u00B7 best ${leaderName}`
            : `step ${Math.max(...sim.map((o) => o.steps))}/${MAX_STEPS}`}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label htmlFor="opt-lr" className="shrink-0 text-xs text-body-mid">
          Learning rate
        </label>
        <input
          id="opt-lr"
          type="range"
          min={0.01}
          max={0.5}
          step={0.01}
          value={lr}
          onChange={(e) => setLr(Number(e.target.value))}
          aria-label="Learning rate"
          aria-valuetext={`learning rate ${lr.toFixed(2)}`}
          className="h-1.5 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-canvas-soft"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="w-10 shrink-0 font-mono text-xs text-ink">
          {lr.toFixed(2)}
        </span>
      </div>

      <div className="df-scroll mt-4 overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[420px] text-left text-xs">
          <caption className="sr-only">
            Current optimizer state: steps, loss, and status
          </caption>
          <thead>
            <tr className="border-b border-hairline text-[10px] uppercase tracking-wide text-mute">
              <th className="px-3 py-2 font-medium">Optimizer</th>
              <th className="px-3 py-2 font-medium">Steps</th>
              <th className="px-3 py-2 font-medium">Loss</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {sim.map((o, i) => (
              <tr key={SPECS[i].id} className="border-b border-hairline last:border-b-0">
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-2 font-sans text-ink">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: SPECS[i].cssVar }}
                      aria-hidden
                    />
                    {SPECS[i].name}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-body">
                  {o.steps === 0 ? "\u2014" : o.steps}
                </td>
                <td className="px-3 py-1.5 text-body">{formatLoss(loss(o.x, o.y))}</td>
                <td className="px-3 py-1.5 text-body-mid">{statusOf(o)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
