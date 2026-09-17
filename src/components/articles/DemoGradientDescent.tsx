"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  clamp,
  getCanvasPalette,
  type DemoProps,
} from "@/lib/articles-demos";
import {
  GD_INITIAL_POINTS,
  buildKernelQuestion,
  fitLogistic,
  formatKernelChoice,
  type KernelRule,
} from "@/lib/articleKernels";

const W = 520;
const H = 420;
const CX = W / 2;
const CY = H / 2;
const SCALE = 150;
const LIMIT = 1.35;
const STEPS = 300;

interface LabeledPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

type Rule = KernelRule;

function toPx(x: number, y: number): [number, number] {
  return [CX + x * SCALE, CY - y * SCALE];
}

function LossCurve({ curve, rule }: { curve: number[]; rule: Rule }) {
  const width = 400;
  const height = 80;
  const max = Math.max(...curve, 1e-6);
  const n = curve.length;
  const pointsPath = curve
    .map((value, i) => {
      const x = n <= 1 ? 0 : (i / (n - 1)) * width;
      const y = 70 - (value / max) * 58;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const label = rule === "logistic" ? "log loss" : "MSE";
  return (
    <div className="mt-3 rounded-lg border border-hairline bg-canvas px-3 py-2">
      <div className="flex items-center justify-between text-[10px] text-mute">
        <span>{label} per SGD step</span>
        <span className="font-mono">
          {curve[0].toFixed(4)} &rarr; {curve[n - 1].toFixed(4)}
        </span>
      </div>
      <svg
        role="img"
        aria-label={`${label} curve over ${STEPS} stochastic gradient steps. Starts at ${curve[0].toFixed(4)}, ends at ${curve[n - 1].toFixed(4)}.`}
        viewBox={`0 0 ${width} ${height}`}
        className="mt-1 h-20 w-full"
      >
        <line
          x1="0"
          y1="70"
          x2={width}
          y2="70"
          stroke="var(--hairline)"
          strokeWidth="1"
        />
        <polyline
          points={pointsPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={width}
          cy={70 - (curve[n - 1] / max) * 58}
          r="2.5"
          fill="var(--accent)"
        />
      </svg>
    </div>
  );
}

export function GradientDescentDemo({ params }: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<LabeledPoint[]>(GD_INITIAL_POINTS);
  const [adding, setAdding] = useState<1 | -1>(1);
  const [rule, setRule] = useState<Rule>("logistic");
  const [lr, setLr] = useState(() => clamp(params?.lr ?? 0.6, 0.05, 2));
  const [variant, setVariant] = useState(0);
  const [reply, setReply] = useState<{ id: string; index: number } | null>(
    null,
  );

  const fit = useMemo(
    () => fitLogistic(points, rule, lr, STEPS),
    [points, rule, lr],
  );

  const question = useMemo(
    () =>
      buildKernelQuestion({
        kind: "gradient-descent",
        params: { points, rule, lr, steps: STEPS, variant },
      }),
    [points, rule, lr, variant],
  );
  const picked = reply !== null && reply.id === question.id ? reply.index : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const palette = getCanvasPalette(canvas);
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = palette.hairline;
      ctx.lineWidth = 1;
      for (const t of [-1, -0.5, 0.5, 1]) {
        const [gx] = toPx(t, 0);
        const [, gy] = toPx(0, t);
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

      ctx.font = "16px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = palette.mute;
      const corners: [number, number][] = [
        [LIMIT - 0.12, LIMIT - 0.12],
        [-LIMIT + 0.12, LIMIT - 0.12],
        [LIMIT - 0.12, -LIMIT + 0.12],
        [-LIMIT + 0.12, -LIMIT + 0.12],
      ];
      for (const [wx, wy] of corners) {
        const [px, py] = toPx(wx, wy);
        const side = fit.w1 * wx + fit.w2 * wy + fit.b >= 0 ? "+" : "\u2212";
        ctx.fillText(side, px, py);
      }

      if (Math.abs(fit.w2) > 1e-6) {
        const [x0, y0] = toPx(-1.4, -(fit.w1 * -1.4 + fit.b) / fit.w2);
        const [x1, y1] = toPx(1.4, -(fit.w1 * 1.4 + fit.b) / fit.w2);
        ctx.strokeStyle = palette.warning;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      } else if (Math.abs(fit.w1) > 1e-6) {
        const [x0] = toPx(-fit.b / fit.w1, 0);
        ctx.strokeStyle = palette.warning;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, H);
        ctx.stroke();
      }

      for (const p of points) {
        const [px, py] = toPx(p.x, p.y);
        if (p.label === 1) {
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = palette.error;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(px - 5, py - 5);
          ctx.lineTo(px + 5, py + 5);
          ctx.moveTo(px + 5, py - 5);
          ctx.lineTo(px - 5, py + 5);
          ctx.stroke();
        }
      }

      ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = palette.warning;
      ctx.fillText(
        rule === "logistic"
          ? "boundary: sigmoid(w\u00B7x + b) = 0.5"
          : "same boundary line, MSE gradient",
        10,
        16,
      );
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [points, rule, fit]);

  const positives = points.filter((p) => p.label === 1).length;
  const negatives = points.length - positives;

  const handleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = clamp((px - CX) / SCALE, -LIMIT, LIMIT);
    const y = clamp((CY - py) / SCALE, -LIMIT, LIMIT);
    setPoints((prev) => [...prev, { x, y, label: adding }]);
  };

  const ruleLabel = rule === "logistic" ? "log loss" : "mean squared error";
  const ariaLabel =
    `Decision boundary canvas. ${points.length} points: ${positives} positive, ${negatives} negative. ` +
    `Update rule ${ruleLabel}, learning rate ${lr.toFixed(2)}. ` +
    `Weights ${fit.w1.toFixed(2)}, ${fit.w2.toFixed(2)}, bias ${fit.b.toFixed(2)}. ` +
    `Accuracy ${(fit.accuracy * 100).toFixed(0)} percent. Final ${ruleLabel} ${fit.loss.toFixed(4)}.`;

  const status =
    `${points.length} points (${positives} positive, ${negatives} negative). ` +
    `Rule: ${ruleLabel}, lr ${lr.toFixed(2)}. ` +
    `w\u2081 = ${fit.w1.toFixed(2)}, w\u2082 = ${fit.w2.toFixed(2)}, b = ${fit.b.toFixed(2)}. ` +
    `Accuracy ${(fit.accuracy * 100).toFixed(0)}%. Final ${ruleLabel} = ${fit.loss.toFixed(4)}.`;

  const toggleClasses = (active: boolean) =>
    active
      ? "rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas"
      : "rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 text-sm font-semibold text-ink">
        Decision boundary playground
      </figcaption>

      <canvas
        ref={canvasRef}
        width={W * 2}
        height={H * 2}
        role="img"
        aria-label={ariaLabel}
        onClick={handleClick}
        className="block w-full cursor-crosshair touch-none rounded-lg bg-canvas"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-body-mid">Click canvas to add a</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-pressed={adding === 1}
            onClick={() => setAdding(1)}
            className={toggleClasses(adding === 1)}
          >
            + point
          </button>
          <button
            type="button"
            aria-pressed={adding === -1}
            onClick={() => setAdding(-1)}
            className={toggleClasses(adding === -1)}
          >
            &minus; point
          </button>
        </div>
        <span className="mx-1 hidden h-4 w-px bg-hairline sm:block" />
        <span className="text-xs text-body-mid">Update rule</span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-pressed={rule === "logistic"}
            onClick={() => setRule("logistic")}
            className={toggleClasses(rule === "logistic")}
          >
            Log loss
          </button>
          <button
            type="button"
            aria-pressed={rule === "mse"}
            onClick={() => setRule("mse")}
            className={toggleClasses(rule === "mse")}
          >
            MSE
          </button>
        </div>
        <button
          type="button"
          onClick={() => setPoints(GD_INITIAL_POINTS)}
          className="ml-auto rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <label htmlFor="gd-lr" className="shrink-0 text-xs text-body-mid">
          Learning rate
        </label>
        <input
          id="gd-lr"
          type="range"
          min={0.05}
          max={2}
          step={0.05}
          value={lr}
          onChange={(e) => setLr(Number(e.target.value))}
          aria-label="Learning rate"
          aria-valuetext={`learning rate ${lr.toFixed(2)}`}
          className="h-1.5 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-canvas-soft"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="w-10 shrink-0 font-mono text-xs text-ink">
          {lr.toFixed(2)}
        </span>
      </div>

      <LossCurve curve={fit.curve} rule={rule} />

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>

      <div className="mt-4 rounded-lg border border-hairline bg-canvas-soft p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-ink">
            Predict the readout
          </span>
          <button
            type="button"
            onClick={() => setVariant((v) => v + 1)}
            className="rounded-lg border border-hairline bg-canvas px-2.5 py-1 text-xs text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 motion-reduce:transition-none"
          >
            Next question
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-body">
          {question.prompt}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {question.choices.map((value, index) => {
            const chosen = picked === index;
            const isAnswer = index === question.answerIndex;
            const state =
              picked === null
                ? "border-hairline bg-canvas text-body hover:text-ink"
                : isAnswer
                  ? "border-accent/40 bg-accent/5 text-accent"
                  : chosen
                    ? "border-error/40 bg-error/5 text-error"
                    : "border-hairline bg-canvas text-body-mid opacity-60";
            return (
              <button
                key={index}
                type="button"
                disabled={picked !== null}
                aria-pressed={chosen}
                onClick={() => setReply({ id: question.id, index })}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 motion-reduce:transition-none ${state}`}
              >
                {formatKernelChoice(value)}
              </button>
            );
          })}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-xs leading-relaxed text-body-mid"
        >
          {picked === null
            ? "Choose the value the figure reports."
            : picked === question.answerIndex
              ? `Correct. ${question.explain}`
              : `Not quite. Answer ${formatKernelChoice(question.choices[question.answerIndex])}. ${question.explain}`}
        </p>
      </div>
    </figure>
  );
}
