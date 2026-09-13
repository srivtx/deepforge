"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCanvasPalette, prefersReducedMotion, type DemoPalette } from "@/lib/articles-demos";

const W = 440, H = 360, S = 130, RANGE = 1.35, GRID = 60;
const CX = W / 2, CY = H / 2;
const NET_SEED = 1337, INITIAL_HIDDEN = 8;

interface Pt { x: number; y: number; label: 0 | 1 }

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function xorPoints(): Pt[] {
  const rand = mulberry32(7);
  const quads: [number, number, 0 | 1][] = [
    [-0.55, -0.55, 0], [-0.55, 0.55, 1], [0.55, -0.55, 1], [0.55, 0.55, 0],
  ];
  const pts: Pt[] = [];
  for (const [qx, qy, label] of quads)
    for (let i = 0; i < 10; i++)
      pts.push({ x: qx + (rand() * 2 - 1) * 0.18, y: qy + (rand() * 2 - 1) * 0.18, label });
  return pts;
}

function circlePoints(): Pt[] {
  const rand = mulberry32(21);
  const pts: Pt[] = [];
  const ring = (n: number, r0: number, r1: number, label: 0 | 1) => {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = r0 + rand() * (r1 - r0);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, label });
    }
  };
  ring(30, 0.22, 0.42, 0);
  ring(30, 0.68, 0.93, 1);
  return pts;
}

function moonPoints(): Pt[] {
  const rand = mulberry32(99);
  const pts: Pt[] = [];
  const moon = (fx: (t: number) => number, fy: (t: number) => number, label: 0 | 1) => {
    for (let i = 0; i < 30; i++) {
      const t = (i / 29) * Math.PI;
      pts.push({ x: fx(t) + (rand() * 2 - 1) * 0.07, y: fy(t) + (rand() * 2 - 1) * 0.07, label });
    }
  };
  moon((t) => Math.cos(t) * 0.6 - 0.3, (t) => Math.sin(t) * 0.6 - 0.15, 0);
  moon((t) => (1 - Math.cos(t)) * 0.6 - 0.3, (t) => (0.5 - Math.sin(t)) * 0.6 - 0.15, 1);
  return pts;
}

type DatasetId = "xor" | "circles" | "moons";
const DATASETS: Record<DatasetId, { name: string; points: Pt[] }> = {
  xor: { name: "XOR quadrants", points: xorPoints() },
  circles: { name: "Two circles", points: circlePoints() },
  moons: { name: "Two moons", points: moonPoints() },
};

interface Net { h: number; w1: Float64Array; b1: Float64Array; w2: Float64Array; b2: number }

function makeNet(h: number, seed: number): Net {
  const rand = mulberry32(seed);
  const vec = (n: number, s: number) =>
    Float64Array.from({ length: n }, () => (rand() * 2 - 1) * s);
  return { h, w1: vec(h * 2, 1.5), b1: vec(h, 0.5), w2: vec(h, 1.5), b2: (rand() * 2 - 1) * 0.5 };
}

const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

function forward(net: Net, x: number, y: number): [Float64Array, number] {
  const hs = new Float64Array(net.h);
  let z = net.b2;
  for (let j = 0; j < net.h; j++) {
    const h = sigmoid(net.w1[2 * j] * x + net.w1[2 * j + 1] * y + net.b1[j]);
    hs[j] = h;
    z += net.w2[j] * h;
  }
  return [hs, sigmoid(z)];
}

function logLoss(out: number, label: 0 | 1): number {
  const c = Math.min(1 - 1e-7, Math.max(1e-7, out));
  return -(label * Math.log(c) + (1 - label) * Math.log(1 - c));
}

function evaluate(net: Net, pts: Pt[]): { loss: number; acc: number } {
  let loss = 0, ok = 0;  for (const p of pts) {
    const out = forward(net, p.x, p.y)[1];
    loss += logLoss(out, p.label);
    if ((out >= 0.5 ? 1 : 0) === p.label) ok += 1;
  }
  return { loss: loss / pts.length, acc: ok / pts.length };
}

function trainEpoch(net: Net, pts: Pt[], lr: number): number {
  let total = 0;
  const dh = new Float64Array(net.h);
  for (const p of pts) {
    const [hs, out] = forward(net, p.x, p.y);
    total += logLoss(out, p.label);
    const delta = out - p.label;
    for (let j = 0; j < net.h; j++) dh[j] = delta * net.w2[j] * hs[j] * (1 - hs[j]);
    for (let j = 0; j < net.h; j++) {
      net.w2[j] -= lr * delta * hs[j];
      net.w1[2 * j] -= lr * dh[j] * p.x;
      net.w1[2 * j + 1] -= lr * dh[j] * p.y;
      net.b1[j] -= lr * dh[j];
    }
    net.b2 -= lr * delta;
  }
  return total / pts.length;
}

function pushCurve(prev: number[], added: number[]): number[] {
  let c = prev.concat(added);
  while (c.length > 600) {
    const next: number[] = [];
    for (let i = 0; i < c.length; i += 2) next.push(c[i]);
    c = next;
  }
  return c;
}

const fit = (x: number, y: number): [number, number] => [CX + x * S, CY - y * S];

function parseColor(v: string): { r: number; g: number; b: number } | null {
  const s = v.trim().replace("#", "");
  const hex = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  if (hex.length < 6) return null;
  const n = parseInt(hex.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function paintBoundary(off: HTMLCanvasElement, net: Net, palette: DemoPalette): void {
  const ctx = off.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(GRID, GRID);
  const pos = parseColor(palette.accent) ?? { r: 127, g: 255, b: 159 };
  const neg = parseColor(palette.error) ?? { r: 255, g: 107, b: 107 };
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const x = ((gx + 0.5) / GRID) * 2 * RANGE - RANGE;
      const y = RANGE - ((gy + 0.5) / GRID) * 2 * RANGE;
      const out = forward(net, x, y)[1];
      const c = out >= 0.5 ? pos : neg;
      const i = (gy * GRID + gx) * 4;
      img.data[i] = c.r;
      img.data[i + 1] = c.g;
      img.data[i + 2] = c.b;
      img.data[i + 3] = Math.round(22 + 76 * Math.min(1, Math.abs(out - 0.5) * 2.4));
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function NeuralNetTrainer({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const [net, setNet] = useState<Net>(() => makeNet(INITIAL_HIDDEN, NET_SEED));
  const [datasetId, setDatasetId] = useState<DatasetId>("xor");
  const [lr, setLr] = useState(0.5);
  const [hidden, setHidden] = useState(INITIAL_HIDDEN);
  const [epoch, setEpoch] = useState(0);
  const [curve, setCurve] = useState<number[]>([]);
  const [stats, setStats] = useState(() => evaluate(makeNet(INITIAL_HIDDEN, NET_SEED), DATASETS.xor.points));
  const [running, setRunning] = useState(false);
  const [themeEpoch, setThemeEpoch] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => setThemeEpoch((e) => e + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const applyStructure = useCallback((nextDataset: DatasetId, nextHidden: number) => {
    const nextNet = makeNet(nextHidden, NET_SEED);
    setNet(nextNet); setDatasetId(nextDataset); setHidden(nextHidden);
    setRunning(false); setEpoch(0); setCurve([]);
    setStats(evaluate(nextNet, DATASETS[nextDataset].points));
  }, []);

  const runEpochs = useCallback(
    (n: number) => {
      const pts = DATASETS[datasetId].points;
      let last = 0;
      const added: number[] = [];
      for (let i = 0; i < n; i++) {
        last = trainEpoch(net, pts, lr);
        added.push(last);
      }
      setEpoch((e) => e + n);
      setCurve((prev) => pushCurve(prev, added));
      setStats(evaluate(net, pts));
    },
    [net, datasetId, lr],
  );

  useEffect(() => {
    if (!running || !active) return;
    let raf = 0;
    const tick = () => {
      runEpochs(1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, active, runEpochs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const palette = getCanvasPalette(canvas);
    if (!offRef.current) {
      offRef.current = document.createElement("canvas");
      offRef.current.width = GRID;
      offRef.current.height = GRID;
    }
    paintBoundary(offRef.current, net, palette);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offRef.current, 0, 0, GRID, GRID, 0, 0, W, H);
    ctx.strokeStyle = palette.hairline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX, 0); ctx.lineTo(CX, H);
    ctx.moveTo(0, CY); ctx.lineTo(W, CY);
    ctx.stroke();
    for (const p of DATASETS[datasetId].points) {
      const [px, py] = fit(p.x, p.y);
      if (p.label === 1) {
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = palette.error;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px - 4.5, py - 4.5); ctx.lineTo(px + 4.5, py + 4.5);
        ctx.moveTo(px + 4.5, py - 4.5); ctx.lineTo(px - 4.5, py + 4.5);
        ctx.stroke();
      }
    }
    ctx.fillStyle = palette.body;
    ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      `2 \u2192 ${hidden} \u2192 1   \u00B7   lr ${lr.toFixed(2)}   \u00B7   epoch ${epoch}`,
      10,
      10,
    );
  }, [net, stats, epoch, datasetId, hidden, lr, themeEpoch]);

  const points = DATASETS[datasetId].points;
  const overfitting = epoch >= 50 && stats.loss < 0.05 && hidden >= 10;
  const ariaLabel =
    `Neural network decision boundary canvas. Dataset ${DATASETS[datasetId].name}, ` +
    `${points.length} points. Hidden units ${hidden}, learning rate ${lr.toFixed(2)}, ` +
    `epoch ${epoch}. Train loss ${stats.loss.toFixed(4)}, ` +
    `accuracy ${Math.round(stats.acc * 100)} percent.`;
  const values = curve.map((v) => Math.log10(Math.max(v, 1e-4)));
  const hi = Math.max(...values, -3), span = Math.max(hi - Math.min(...values), 1e-3);
  const curvePoints = curve.map((v, i) => {
    const x = 8 + (i / Math.max(1, curve.length - 1)) * 224;
    const y = 8 + ((hi - Math.log10(Math.max(v, 1e-4))) / span) * 104;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const secondary = "min-h-11 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-1 text-sm font-semibold text-ink">
        Neural Net Trainer
      </figcaption>
      <p className="mb-3 text-xs leading-relaxed text-body-mid">
        A 2 &rarr; h &rarr; 1 sigmoid network trained with plain SGD on the
        same points every epoch. Pick a dataset, add hidden units, and watch
        the boundary bend to separate the classes. High learning rates
        scramble it; low rates crawl.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <canvas ref={canvasRef} width={W} height={H} role="img" aria-label={ariaLabel}
          className="block h-auto w-full min-w-0 rounded-lg bg-canvas sm:flex-1" />
        <div className="flex w-full flex-col gap-2 sm:w-60 sm:shrink-0">
          <div className="rounded-lg border border-hairline bg-canvas px-3 py-2">
            <div className="flex items-center justify-between text-[10px] text-mute">
              <span>BCE loss (log scale)</span>
              <span className="font-mono">
                {curve.length > 0 ? curve[curve.length - 1].toFixed(4) : "\u2014"}
              </span>
            </div>
            <svg role="img" viewBox="0 0 240 120" className="mt-1 h-28 w-full"
              aria-label={`Training loss curve over ${epoch} epochs. Current loss ${stats.loss.toFixed(4)}.`}>
              <line x1="8" y1="112" x2="232" y2="112" stroke="var(--hairline)" strokeWidth="1" />
              {curve.length > 1 && (
                <polyline points={curvePoints} fill="none" stroke="var(--accent)"
                  strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              )}
            </svg>
          </div>
          <p className="rounded-lg border border-hairline bg-canvas px-2.5 py-2 font-mono text-[10px] leading-relaxed text-body">
            epoch {epoch} &middot; loss {stats.loss.toFixed(4)} &middot; acc{" "}
            {Math.round(stats.acc * 100)}% &middot; params {hidden * 3 + 1}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(Object.keys(DATASETS) as DatasetId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={datasetId === id}
            onClick={() => applyStructure(id, hidden)}
            className={
              datasetId === id
                ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0"
                : secondary
            }
          >
            {DATASETS[id].name}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-hairline sm:block" />
        <button type="button"
          onClick={() => {
            if (running) setRunning(false);
            else if (prefersReducedMotion()) runEpochs(200);
            else setRunning(true);
          }}
          className="ml-auto min-h-11 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0">
          {running ? "Pause" : "Run"}
        </button>
        <button type="button" onClick={() => runEpochs(1)} className={secondary}>
          Step
        </button>
        <button type="button" onClick={() => applyStructure(datasetId, hidden)} className={secondary}>
          Reset
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex flex-1 items-center gap-3">
          <label htmlFor="nn-lr" className="shrink-0 text-xs text-body-mid">
            Learning rate
          </label>
          <input id="nn-lr" type="range" min={0.01} max={3} step={0.01} value={lr}
            onChange={(e) => setLr(Number(e.target.value))} aria-label="Learning rate"
            aria-valuetext={`learning rate ${lr.toFixed(2)}`}
            className="box-content h-1.5 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-canvas-soft bg-clip-content py-[19px] sm:py-0"
            style={{ accentColor: "var(--accent)" }} />
          <span className="w-10 shrink-0 font-mono text-xs text-ink">
            {lr.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-3">
          <label htmlFor="nn-h" className="shrink-0 text-xs text-body-mid">
            Hidden units
          </label>
          <input id="nn-h" type="range" min={2} max={16} step={1} value={hidden}
            onChange={(e) => applyStructure(datasetId, Number(e.target.value))}
            aria-label="Hidden units" aria-valuetext={`${hidden} hidden units`}
            className="box-content h-1.5 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-canvas-soft bg-clip-content py-[19px] sm:py-0"
            style={{ accentColor: "var(--accent)" }} />
          <span className="w-10 shrink-0 font-mono text-xs text-ink">
            {hidden}
          </span>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 text-xs leading-relaxed text-body-mid">
        Epoch {epoch}. Train loss {stats.loss.toFixed(4)}, accuracy{" "}
        {Math.round(stats.acc * 100)}%.{" "}
        {running ? "Training one epoch per frame\u2026" : epoch === 0 ? "Press Run or Step to start training." : "Paused."}
        {overfitting &&
          ` Very low train loss with ${hidden} hidden units \u2014 the network can memorize these ${points.length} points instead of learning the shape. Try fewer hidden units.`}
      </p>
    </figure>
  );
}
