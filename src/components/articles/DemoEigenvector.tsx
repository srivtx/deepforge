"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  clamp,
  getCanvasPalette,
  type DemoProps,
} from "@/lib/articles-demos";

const W = 560;
const H = 420;
const CX = W / 2;
const CY = H / 2;
const SCALE = 70;
const WORLD = 3;

type Vec = [number, number];

interface Mat2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

const ENTRY_KEYS = ["a", "b", "c", "d"] as const;
type EntryKey = (typeof ENTRY_KEYS)[number];

function applyMatrix(m: Mat2, v: Vec): Vec {
  return [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]];
}

function eigenvalues(m: Mat2): [number, number] | null {
  const tr = m.a + m.d;
  const det = m.a * m.d - m.b * m.c;
  const disc = tr * tr - 4 * det;
  if (disc < -1e-9) return null;
  const root = Math.sqrt(Math.max(0, disc));
  return [(tr + root) / 2, (tr - root) / 2];
}

function eigenvectorFor(m: Mat2, lambda: number): Vec | null {
  const r1: Vec = [m.a - lambda, m.b];
  const r2: Vec = [m.c, m.d - lambda];
  const row = Math.hypot(r1[0], r1[1]) >= Math.hypot(r2[0], r2[1]) ? r1 : r2;
  const candidate: Vec = [-row[1], row[0]];
  const norm = Math.hypot(candidate[0], candidate[1]);
  if (norm < 1e-9) return null;
  return [candidate[0] / norm, candidate[1] / norm];
}

function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1];
}

function toPx(v: Vec): Vec {
  return [CX + v[0] * SCALE, CY - v[1] * SCALE];
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Vec,
  to: Vec,
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
  at: Vec,
  color: string,
): void {
  ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, at[0], at[1]);
}

export function EigenvectorDemo({ params }: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);

  const [mat, setMat] = useState<Mat2>(() => ({
    a: params?.a ?? 2,
    b: params?.b ?? 1,
    c: params?.c ?? 0.5,
    d: params?.d ?? 1,
  }));
  const [v, setV] = useState<Vec>(() => [params?.vx ?? 1.6, params?.vy ?? 0.6]);

  const setEntry = (key: EntryKey, value: number) => {
    setMat((prev) => ({ ...prev, [key]: value }));
  };

  const av = applyMatrix(mat, v);
  const vLen = Math.hypot(v[0], v[1]);
  const avLen = Math.hypot(av[0], av[1]);
  const cosTheta =
    vLen > 1e-9 && avLen > 1e-9
      ? clamp(dot(v, av) / (vLen * avLen), -1, 1)
      : 1;
  const angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;
  const isEigen =
    avLen > 1e-9 && Math.abs(Math.sin((angleDeg * Math.PI) / 180)) < 0.02;
  const lambda = vLen > 1e-9 ? dot(v, av) / (vLen * vLen) : 0;
  const eigs = eigenvalues(mat);

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

      const currentEigs = eigenvalues(mat);
      if (currentEigs) {
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = palette.info;
        let real = 0;
        for (const lambdaI of currentEigs) {
          const u = eigenvectorFor(mat, lambdaI);
          if (!u) continue;
          real += 1;
          const p = toPx([u[0] * WORLD, u[1] * WORLD]);
          const q = toPx([-u[0] * WORLD, -u[1] * WORLD]);
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.setLineDash([]);
        if (real === 2) {
          drawLabel(ctx, `\u03BB\u2081 = ${currentEigs[0].toFixed(2)}`, [10, 18], palette.info);
          drawLabel(ctx, `\u03BB\u2082 = ${currentEigs[1].toFixed(2)}`, [10, 34], palette.info);
        } else {
          drawLabel(ctx, `\u03BB = ${currentEigs[0].toFixed(2)}`, [10, 18], palette.info);
        }
      } else {
        drawLabel(
          ctx,
          "complex eigenvalues \u2014 no real eigendirections",
          [10, 18],
          palette.info,
        );
      }

      const basis1 = applyMatrix(mat, [1, 0]);
      const basis2 = applyMatrix(mat, [0, 1]);
      const origin = toPx([0, 0]);
      drawArrow(ctx, origin, toPx(basis1), palette.accent, 1.5);
      drawArrow(ctx, origin, toPx(basis2), palette.info, 1.5);
      const p1 = toPx(basis1);
      const p2 = toPx(basis2);
      drawLabel(ctx, "Ae\u2081", [p1[0] + 7, p1[1] - 7], palette.accent);
      drawLabel(ctx, "Ae\u2082", [p2[0] + 7, p2[1] - 7], palette.info);

      const pointAv = applyMatrix(mat, v);
      const pointAvLen = Math.hypot(pointAv[0], pointAv[1]);
      const vTip = toPx(v);
      const avTip = toPx(pointAv);
      if (pointAvLen > 1e-9) {
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = palette.mute;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vTip[0], vTip[1]);
        ctx.lineTo(avTip[0], avTip[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawArrow(ctx, origin, vTip, palette.ink, 2.5);
      drawArrow(ctx, origin, avTip, palette.warning, 2.5);
      drawLabel(ctx, "v", [vTip[0] + 8, vTip[1] + 10], palette.ink);
      drawLabel(ctx, "Av", [avTip[0] + 8, avTip[1] - 10], palette.warning);

      const dotProduct = dot(v, pointAv);
      const cos =
        Math.hypot(v[0], v[1]) > 1e-9 && pointAvLen > 1e-9
          ? clamp(dotProduct / (Math.hypot(v[0], v[1]) * pointAvLen), -1, 1)
          : 1;
      const nearlyEigen = pointAvLen > 1e-9 && Math.abs(Math.sin(Math.acos(cos))) < 0.02;
      if (nearlyEigen) {
        const rayleigh = dotProduct / (v[0] * v[0] + v[1] * v[1]);
        ctx.font = "12px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = palette.accent;
        ctx.fillText(`Av = ${rayleigh.toFixed(2)}v`, W - 12, 18);
        ctx.textAlign = "left";
      }
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [mat, v]);

  const moveToPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    setV([
      clamp((px - CX) / SCALE, -WORLD + 0.1, WORLD - 0.1),
      clamp((CY - py) / SCALE, -WORLD + 0.1, WORLD - 0.1),
    ]);
  };

  const nudge = (dx: number, dy: number) => {
    setV(([x, y]) => [
      clamp(x + dx, -WORLD + 0.1, WORLD - 0.1),
      clamp(y + dy, -WORLD + 0.1, WORLD - 0.1),
    ]);
  };

  const matrixText = `[[${mat.a.toFixed(2)}, ${mat.b.toFixed(2)}], [${mat.c.toFixed(2)}, ${mat.d.toFixed(2)}]]`;
  const ariaLabel =
    `Canvas showing the linear map A = ${matrixText} applied to the plane. ` +
    `Vector v = (${v[0].toFixed(2)}, ${v[1].toFixed(2)}). ` +
    `A times v = (${av[0].toFixed(2)}, ${av[1].toFixed(2)}). ` +
    `Angle between v and Av is ${angleDeg.toFixed(1)} degrees. ` +
    (isEigen ? "v is an eigenvector." : "v is not an eigenvector.");

  const status = isEigen
    ? `v is (nearly) an eigenvector: Av = ${lambda.toFixed(3)} v. The arrows are parallel.`
    : `v is ${angleDeg.toFixed(1)}\u00B0 away from Av. ` +
      `Rayleigh quotient (v\u00B7Av)/(v\u00B7v) = ${lambda.toFixed(3)}. ` +
      (eigs
        ? `True eigenvalues: ${eigs[0].toFixed(3)} and ${eigs[1].toFixed(3)}.`
        : "The eigenvalues are complex, so no real eigendirection exists.");

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 text-sm font-semibold text-ink">
        The matrix as a transformation
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
              const step = e.shiftKey ? 0.4 : 0.15;
              if (e.key === "ArrowLeft") nudge(-step, 0);
              else if (e.key === "ArrowRight") nudge(step, 0);
              else if (e.key === "ArrowUp") nudge(0, step);
              else if (e.key === "ArrowDown") nudge(0, -step);
              else return;
              e.preventDefault();
            }}
            className="block w-full cursor-grab touch-none rounded-lg bg-canvas focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent active:cursor-grabbing"
          />
          <p className="mt-1.5 text-[10px] text-mute">
            Drag the tip of v (or focus the canvas and use the arrow keys) to
            hunt for an eigendirection. Dashed blue lines are the real
            eigendirections of A.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-60">
          <div className="border-l-2 border-r-2 border-body/40 px-2 py-1">
            <div className="grid grid-cols-2 gap-2">
              {ENTRY_KEYS.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 rounded-lg border border-hairline bg-canvas px-2 py-1.5"
                >
                  <span className="w-3 font-mono text-xs text-body-mid">
                    {key}
                  </span>
                  <input
                    type="range"
                    min={-2}
                    max={2}
                    step={0.05}
                    value={mat[key]}
                    onChange={(e) => setEntry(key, Number(e.target.value))}
                    aria-label={`Matrix entry ${key}`}
                    aria-valuetext={mat[key].toFixed(2)}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-canvas-soft"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="w-9 shrink-0 text-right font-mono text-[11px] text-ink">
                    {mat[key].toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <dl className="mt-3 space-y-1 font-mono text-[11px] text-body-mid">
            <div className="flex justify-between gap-2">
              <dt>v</dt>
              <dd className="text-ink">
                ({v[0].toFixed(2)}, {v[1].toFixed(2)})
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Av</dt>
              <dd className="text-ink">
                ({av[0].toFixed(2)}, {av[1].toFixed(2)})
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>angle</dt>
              <dd className="text-ink">{angleDeg.toFixed(1)}&deg;</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Rayleigh</dt>
              <dd className="text-ink">{lambda.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>eigenvalues</dt>
              <dd className="text-ink">
                {eigs
                  ? `${eigs[0].toFixed(2)}, ${eigs[1].toFixed(2)}`
                  : "complex"}
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
