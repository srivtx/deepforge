"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clamp,
  getCanvasPalette,
  type DemoProps,
} from "@/lib/articles-demos";

const W = 540;
const H = 420;
const CX = W / 2;
const CY = H / 2;
const SCALE = 50;
const WORLD = 3.6;
const NUDGE = 0.2;

type Vec = [number, number];
type Metric = "cosine" | "dot" | "euclidean";

interface WordVec {
  word: string;
  v: Vec;
}

const WORDS: WordVec[] = [
  { word: "puppy", v: [2.6, 1.5] },
  { word: "dog", v: [2.1, 2.1] },
  { word: "cat", v: [1.3, 2.5] },
  { word: "kitten", v: [2.9, 0.8] },
  { word: "battery", v: [-2.8, 1.2] },
  { word: "semiconductor", v: [-2.2, 2.2] },
  { word: "algebra", v: [-2.4, -1.5] },
  { word: "pizza", v: [0.9, -2.7] },
];

function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1];
}

function length(a: Vec): number {
  return Math.hypot(a[0], a[1]);
}

function cosine(a: Vec, b: Vec): number {
  const la = length(a);
  const lb = length(b);
  if (la < 1e-9 || lb < 1e-9) return 0;
  return clamp(dot(a, b) / (la * lb), -1, 1);
}

function distance(a: Vec, b: Vec): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function toPx(v: Vec): Vec {
  return [CX + v[0] * SCALE, CY - v[1] * SCALE];
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  to: Vec,
  color: string,
  width: number,
): void {
  const origin = toPx([0, 0]);
  const tip = toPx(to);
  const dx = tip[0] - origin[0];
  const dy = tip[1] - origin[1];
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
  ctx.moveTo(origin[0], origin[1]);
  ctx.lineTo(tip[0] - ux * head, tip[1] - uy * head);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip[0], tip[1]);
  ctx.lineTo(tip[0] - ux * head - uy * head * 0.55, tip[1] - uy * head + ux * head * 0.55);
  ctx.lineTo(tip[0] - ux * head + uy * head * 0.55, tip[1] - uy * head - ux * head * 0.55);
  ctx.closePath();
  ctx.fill();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  at: Vec,
  color: string,
): void {
  ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, at[0], at[1]);
}

export function EmbeddingCosineDemo(_props: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);

  const [q, setQ] = useState<Vec>([2.4, 0.7]);
  const [metric, setMetric] = useState<Metric>("cosine");
  const [normalized, setNormalized] = useState(false);

  const qLen = length(q);
  const usedQ = useMemo<Vec>(
    () => (normalized && qLen > 1e-9 ? [q[0] / qLen, q[1] / qLen] : q),
    [q, normalized, qLen],
  );

  const ranked = useMemo(() => {
    const rows = WORDS.map((entry) => ({
      word: entry.word,
      v: entry.v,
      cos: cosine(usedQ, entry.v),
      dot: dot(usedQ, entry.v),
      dist: distance(usedQ, entry.v),
      value: 0,
    }));
    for (const row of rows) {
      row.value =
        metric === "cosine" ? row.cos : metric === "dot" ? row.dot : row.dist;
    }
    rows.sort((a, b) =>
      metric === "euclidean" ? a.value - b.value : b.value - a.value,
    );
    return rows;
  }, [usedQ, metric]);

  const top = ranked[0];
  const topCos = cosine(usedQ, top.v);
  const topAngle = (Math.acos(clamp(topCos, -1, 1)) * 180) / Math.PI;

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
      for (let i = -3; i <= 3; i++) {
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

      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = palette.info;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(CX, CY, SCALE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      for (const entry of WORDS) {
        const isTop = entry.word === top.word;
        ctx.globalAlpha = isTop ? 1 : 0.7;
        drawArrow(ctx, entry.v, isTop ? palette.warning : palette.info, isTop ? 2.5 : 1.5);
        ctx.globalAlpha = 1;
        const tip = toPx(entry.v);
        const labelX = entry.v[0] >= 0 ? tip[0] + 8 : tip[0] - 8;
        ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = entry.v[0] >= 0 ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isTop ? palette.warning : palette.body;
        ctx.fillText(entry.word, labelX, tip[1]);
      }

      const topAngleScreen = Math.atan2(-top.v[1], top.v[0]);
      const qAngleScreen = Math.atan2(-usedQ[1], usedQ[0]);
      const arcR = 36;
      let delta = topAngleScreen - qAngleScreen;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      ctx.strokeStyle = palette.warning;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(CX, CY, arcR, qAngleScreen, qAngleScreen + delta, delta < 0);
      ctx.stroke();
      const mid = qAngleScreen + delta / 2;
      ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = palette.warning;
      ctx.fillText(
        `\u03B8 = ${topAngle.toFixed(1)}\u00B0`,
        CX + Math.cos(mid) * (arcR + 14),
        CY + Math.sin(mid) * (arcR + 14),
      );

      if (normalized && qLen > 1e-9) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = palette.mute;
        ctx.lineWidth = 1.5;
        const rawTip = toPx(q);
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(rawTip[0], rawTip[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(rawTip[0], rawTip[1], 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = palette.mute;
        ctx.fillText("raw q", rawTip[0] + 8, rawTip[1] + 10);
      }

      drawArrow(ctx, usedQ, palette.accent, 2.5);
      const qTip = toPx(usedQ);
      drawLabel(ctx, normalized ? "q\u0302" : "q", [qTip[0] + 8, qTip[1] - 10], palette.accent);
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [q, usedQ, normalized, qLen, top, topAngle]);

  const moveToPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    setQ([
      clamp((px - CX) / SCALE, -WORLD, WORLD),
      clamp((CY - py) / SCALE, -WORLD, WORLD),
    ]);
  };

  const nudge = (dx: number, dy: number) => {
    setQ(([x, y]) => [
      clamp(x + dx, -WORLD, WORLD),
      clamp(y + dy, -WORLD, WORLD),
    ]);
  };

  const valueOf = (row: (typeof ranked)[number]) =>
    row.value.toFixed(metric === "cosine" ? 3 : 2);

  const hint =
    metric === "cosine"
      ? "Cosine ignores length — drag farther out along a ray and the ranking barely moves."
      : metric === "dot"
        ? "Dot grows with length — long vectors climb even when the angle is wide."
        : "Distance cares about position — a far vector ranks low even when it points the same way.";

  const ariaLabel =
    `Embedding space with a draggable query vector at (${q[0].toFixed(2)}, ${q[1].toFixed(2)}). ` +
    `Metric ${metric}${normalized ? ", query normalized to unit length" : ""}. ` +
    `Nearest neighbors: ${ranked
      .slice(0, 3)
      .map((row) => `${row.word} ${row.value.toFixed(2)}`)
      .join(", ")}.`;

  const status =
    `q = (${q[0].toFixed(2)}, ${q[1].toFixed(2)}), \u2016q\u2016 = ${qLen.toFixed(2)}` +
    `${normalized ? " \u2192 normalized to 1 before scoring" : ""}. ` +
    `Metric: ${metric}. Best match: ${top.word} (${valueOf(top)}), ` +
    `angle ${topAngle.toFixed(1)}\u00B0, cosine ${top.cos.toFixed(3)}. ${hint}`;

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Drag the query, watch the ranking
        </span>
        <span className="flex flex-wrap gap-1" role="group" aria-label="Similarity metric">
          {(["cosine", "dot", "euclidean"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              onClick={() => setMetric(m)}
              className={toggleClasses(metric === m)}
            >
              {m === "cosine" ? "Cosine" : m === "dot" ? "Dot" : "Euclidean"}
            </button>
          ))}
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
              if (e.key === "ArrowLeft") nudge(-NUDGE, 0);
              else if (e.key === "ArrowRight") nudge(NUDGE, 0);
              else if (e.key === "ArrowUp") nudge(0, NUDGE);
              else if (e.key === "ArrowDown") nudge(0, -NUDGE);
              else return;
              e.preventDefault();
            }}
            className="block w-full cursor-grab touch-none rounded-lg bg-canvas focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent active:cursor-grabbing"
          />
          <p className="mt-1.5 text-[10px] text-mute">
            Drag the query (or focus the canvas and use the arrow keys). The
            dashed circle is the unit circle; word vectors can reach past it.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-64">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-body-mid">
              Ranked by {metric}
            </span>
            <button
              type="button"
              aria-pressed={normalized}
              onClick={() => setNormalized((v) => !v)}
              className={toggleClasses(normalized)}
            >
              Normalize q
            </button>
          </div>

          <ol className="mt-2 space-y-1">
            {ranked.map((row, i) => (
              <li
                key={row.word}
                className={
                  i === 0
                    ? "flex items-center justify-between gap-2 rounded-lg border border-accent/40 bg-accent/5 px-2 py-1"
                    : "flex items-center justify-between gap-2 rounded-lg border border-hairline px-2 py-1"
                }
              >
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="font-mono text-[10px] text-mute">
                    {i + 1}
                  </span>
                  <span
                    className={
                      i === 0
                        ? "truncate text-xs font-medium text-accent"
                        : "truncate text-xs text-body"
                    }
                  >
                    {row.word}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink">
                  {valueOf(row)}
                </span>
              </li>
            ))}
          </ol>

          <dl className="mt-3 space-y-1 font-mono text-[11px] text-body-mid">
            <div className="flex justify-between gap-2">
              <dt>&#8741;q&#8741;</dt>
              <dd className="text-ink">{qLen.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>&theta; to {top.word}</dt>
              <dd className="text-ink">{topAngle.toFixed(1)}&deg;</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>cos(q, {top.word})</dt>
              <dd className="text-accent">{top.cos.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>q &middot; {top.word}</dt>
              <dd className="text-ink">{top.dot.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>dist(q, {top.word})</dt>
              <dd className="text-ink">{top.dist.toFixed(2)}</dd>
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
