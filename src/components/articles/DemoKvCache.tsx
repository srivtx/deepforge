"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clamp,
  getCanvasPalette,
  prefersReducedMotion,
  type DemoProps,
} from "@/lib/articles-demos";

/* ---------------------------------- math --------------------------------- */

export type KvMode = "mha" | "gqa" | "mqa";
export type KvDtype = "bf16" | "fp8" | "int4";

export const KV_DTYPE_BYTES: Record<KvDtype, number> = {
  bf16: 2,
  fp8: 1,
  int4: 0.5,
};

export const KV_DTYPE_LABEL: Record<KvDtype, string> = {
  bf16: "bf16",
  fp8: "fp8",
  int4: "int4",
};

export function kvHeadsFor(heads: number, mode: KvMode): number {
  if (mode === "mha") return heads;
  if (mode === "gqa") return Math.max(1, Math.round(heads / 4));
  return 1;
}

export interface KvBudget {
  layers: number;
  heads: number;
  headDim: number;
  mode: KvMode;
  dtype: KvDtype;
}

export function kvBytesPerToken(budget: KvBudget): number {
  return (
    2 *
    budget.layers *
    kvHeadsFor(budget.heads, budget.mode) *
    budget.headDim *
    KV_DTYPE_BYTES[budget.dtype]
  );
}

export function kvGb(
  budget: KvBudget,
  context: number,
  concurrency: number,
): number {
  return (kvBytesPerToken(budget) * context * concurrency) / 1e9;
}

export function weightsGb(paramsB: number): number {
  return paramsB * 2;
}

export interface OnlineStep {
  mOld: number;
  mNew: number;
  lOld: number;
  lNew: number;
  rescale: number;
}

export function onlineSoftmaxTrace(
  scores: number[],
  tile: number,
): { steps: OnlineStep[]; m: number; l: number } {
  let m = Number.NEGATIVE_INFINITY;
  let l = 0;
  const steps: OnlineStep[] = [];
  for (let start = 0; start < scores.length; start += tile) {
    const chunk = scores.slice(start, start + tile);
    const mNew = Math.max(m, ...chunk);
    const rescale = l === 0 ? 0 : l * Math.exp(m - mNew);
    const add = chunk.reduce((sum, x) => sum + Math.exp(x - mNew), 0);
    const lNew = rescale + add;
    steps.push({ mOld: m, mNew, lOld: l, lNew, rescale });
    m = mNew;
    l = lNew;
  }
  return { steps, m, l };
}

export function softmaxWeights(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const m = Math.max(...scores);
  const exps = scores.map((x) => Math.exp(x - m));
  const sum = exps.reduce((s, x) => s + x, 0);
  return exps.map((x) => x / sum);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KiB`;
  return `${bytes.toFixed(0)} B`;
}

/* --------------------------------- decode -------------------------------- */

export const DECODE_TOKENS = [
  "The",
  "cat",
  "sat",
  "on",
  "the",
  "warm",
  "mat",
  "and",
  "purred",
  "softly",
  "at",
  "the",
  "rain",
  "outside",
  "all",
  "night",
];

export const DECODE_TILE = 4;
export const DECODE_MAX = DECODE_TOKENS.length;
export const TOY_QUERY_HEADS = 8;
export const TOY_HEAD_DIM = 128;

export type EvictPolicy = "none" | "window" | "sink";

export function visiblePositions(
  pos: number,
  budget: number,
  policy: EvictPolicy,
): number[] {
  const all = Array.from({ length: pos }, (_, i) => i);
  if (policy === "none" || pos <= budget) return all;
  if (policy === "window") return all.slice(pos - budget);
  const sinks = Math.min(2, budget);
  return [
    ...all.slice(0, sinks),
    ...all.slice(pos - (budget - sinks)),
  ];
}

export function tokenScores(pos: number): number[] {
  return Array.from({ length: pos }, (_, i) => {
    const sink = i === 0 ? 1.6 : 0;
    const recent = i === pos - 1 ? 4.5 : 0;
    return 2 * Math.sin(0.85 * i + 0.2) + sink + recent;
  });
}

function toyBytesPerToken(kvHeads: number): number {
  return 2 * kvHeads * TOY_HEAD_DIM * KV_DTYPE_BYTES.bf16;
}

/* ------------------------------ budget panel ----------------------------- */

const PARAM_PRESETS = [
  { label: "7B", params: 7 },
  { label: "13B", params: 13 },
  { label: "70B", params: 70 },
];

const CONTEXTS = [4096, 8192, 16384, 32768, 65536, 131072];

function BudgetPanel() {
  const [paramsB, setParamsB] = useState(7);
  const [layers, setLayers] = useState(32);
  const [heads, setHeads] = useState(32);
  const [headDim, setHeadDim] = useState(128);
  const [mode, setMode] = useState<KvMode>("gqa");
  const [dtype, setDtype] = useState<KvDtype>("bf16");
  const [concurrency, setConcurrency] = useState(8);
  const [ctxIndex, setCtxIndex] = useState(3);

  const context = CONTEXTS[ctxIndex];
  const budget = useMemo<KvBudget>(
    () => ({ layers, heads, headDim, mode, dtype }),
    [layers, heads, headDim, mode, dtype],
  );

  const perToken = kvBytesPerToken(budget);
  const kvHeads = kvHeadsFor(heads, mode);
  const totalKv = kvGb(budget, context, concurrency);
  const weights = weightsGb(paramsB);
  const ratio = totalKv / weights;
  const mhaBf16 = kvBytesPerToken({ ...budget, mode: "mha", dtype: "bf16" });
  const compression = mhaBf16 / perToken;

  const rows = [4096, 32768, 131072].map((c) => ({
    context: c,
    kv: kvGb(budget, c, concurrency),
  }));
  const maxGb = Math.max(weights + rows[2].kv, 1);
  const BAR_X = 118;
  const BAR_MAX = 600;
  const scale = (gb: number) => (gb / maxGb) * (BAR_MAX - BAR_X);

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const status =
    `${layers} layers, ${heads} query heads, head dim ${headDim}, ${mode.toUpperCase()}, ${KV_DTYPE_LABEL[dtype]}. ` +
    `${kvHeads} KV head${kvHeads === 1 ? "" : "s"} -> ${formatBytes(perToken)} per token. ` +
    `${concurrency} sequences at ${context / 1024}k tokens: ${totalKv.toFixed(1)} GB of cache vs ${weights.toFixed(0)} GB of weights ` +
    `(${ratio.toFixed(1)}x the weights). ${compression.toFixed(1)}x smaller than MHA bf16.`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex gap-1" role="group" aria-label="Model size">
          {PARAM_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={paramsB === preset.params}
              onClick={() => setParamsB(preset.params)}
              className={toggleClasses(paramsB === preset.params)}
            >
              {preset.label}
            </button>
          ))}
        </span>
        <span className="flex gap-1" role="group" aria-label="KV head layout">
          {(["mha", "gqa", "mqa"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={toggleClasses(mode === m)}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </span>
        <span className="flex gap-1" role="group" aria-label="KV dtype">
          {(["bf16", "fp8", "int4"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={dtype === d}
              onClick={() => setDtype(d)}
              className={toggleClasses(dtype === d)}
            >
              {d}
            </button>
          ))}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {(
          [
            {
              id: "kv-layers",
              label: "Layers",
              value: layers,
              min: 12,
              max: 80,
              step: 1,
              set: setLayers,
            },
            {
              id: "kv-heads",
              label: "Query heads",
              value: heads,
              min: 8,
              max: 64,
              step: 8,
              set: setHeads,
            },
            {
              id: "kv-dim",
              label: "Head dim",
              value: headDim,
              min: 64,
              max: 256,
              step: 64,
              set: setHeadDim,
            },
            {
              id: "kv-concurrency",
              label: "Concurrent sequences",
              value: concurrency,
              min: 1,
              max: 64,
              step: 1,
              set: setConcurrency,
            },
          ] as const
        ).map((control) => (
          <div key={control.id} className="flex items-center gap-3">
            <label htmlFor={control.id} className="w-40 shrink-0 text-xs text-body-mid">
              {control.label}
            </label>
            <input
              id={control.id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={control.value}
              onChange={(e) => control.set(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-canvas-soft"
              style={{ accentColor: "var(--accent)" }}
            />
            <span className="w-14 shrink-0 text-right font-mono text-xs text-ink">
              {control.value}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-3 sm:col-span-2">
          <label htmlFor="kv-context" className="w-40 shrink-0 text-xs text-body-mid">
            Context length
          </label>
          <input
            id="kv-context"
            type="range"
            min={0}
            max={CONTEXTS.length - 1}
            step={1}
            value={ctxIndex}
            onChange={(e) => setCtxIndex(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-canvas-soft"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="w-14 shrink-0 text-right font-mono text-xs text-ink">
            {context / 1024}k
          </span>
        </div>
      </div>

      <svg
        role="img"
        aria-label={`KV cache against model weights. ${status}`}
        viewBox="0 0 760 180"
        className="mt-4 w-full"
      >
        {rows.map((row, i) => {
          const y = 20 + i * 48;
          const kvWidth = scale(row.kv);
          const weightWidth = scale(weights);
          const selected = row.context === context;
          return (
            <g key={row.context}>
              <text
                x={14}
                y={y + 20}
                className={
                  selected
                    ? "fill-accent text-[11px] font-mono"
                    : "fill-body-mid text-[11px] font-mono"
                }
              >
                {row.context / 1024}k
              </text>
              <rect
                x={BAR_X}
                y={y}
                width={weightWidth}
                height={30}
                rx={4}
                className={selected ? "fill-info/70" : "fill-info/40"}
              />
              <rect
                x={BAR_X + weightWidth}
                y={y}
                width={Math.max(0, kvWidth)}
                height={30}
                rx={4}
                className={selected ? "fill-accent/70" : "fill-accent/35"}
              />
              <text
                x={BAR_X + weightWidth + kvWidth + 8}
                y={y + 20}
                className={
                  selected
                    ? "fill-accent text-[10.5px] font-mono"
                    : "fill-body-mid text-[10.5px] font-mono"
                }
              >
                {(weights + row.kv).toFixed(0)} GB total
              </text>
              <text x={BAR_X} y={y + 42} className="fill-mute text-[8.5px] font-mono">
                KV {row.kv.toFixed(1)} GB
              </text>
            </g>
          );
        })}
        <rect x={BAR_X} y={164} width={10} height={10} className="fill-info/70" />
        <text x={BAR_X + 16} y={173} className="fill-body-mid text-[9.5px] font-mono">
          weights {weights.toFixed(0)} GB (constant)
        </text>
        <rect x={BAR_X + 190} y={164} width={10} height={10} className="fill-accent/70" />
        <text x={BAR_X + 206} y={173} className="fill-body-mid text-[9.5px] font-mono">
          KV cache at {concurrency} sequence{concurrency === 1 ? "" : "s"}
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 font-mono text-[11px] text-body-mid sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-2">
          <span className="block text-[9.5px] uppercase tracking-wide text-mute">
            per token
          </span>
          <span className="text-accent">{formatBytes(perToken)}</span>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-2">
          <span className="block text-[9.5px] uppercase tracking-wide text-mute">
            total cache
          </span>
          <span className="text-ink">{totalKv.toFixed(1)} GB</span>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas px-3 py-2">
          <span className="block text-[9.5px] uppercase tracking-wide text-mute">
            cache : weights
          </span>
          <span className={ratio >= 1 ? "text-warning" : "text-ink"}>
            {ratio.toFixed(1)}&times;
          </span>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </>
  );
}

/* ------------------------------ decode panel ----------------------------- */

const CANVAS_W = 680;
const CANVAS_H = 250;
const CANVAS_TOP = 26;
const ROW_H = 25;
const LABEL_W = 52;
const CELL_W = (CANVAS_W - LABEL_W - 14) / DECODE_MAX;

function DecodePanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pos, setPos] = useState(6);
  const [mode, setMode] = useState<KvMode>("mha");
  const [policy, setPolicy] = useState<EvictPolicy>("window");
  const [budget, setBudget] = useState(8);
  const [tileStep, setTileStep] = useState(0);
  const [running, setRunning] = useState(false);

  const kvHeads = kvHeadsFor(TOY_QUERY_HEADS, mode);
  const visible = useMemo(
    () => visiblePositions(pos, budget, policy),
    [pos, budget, policy],
  );
  const evicted = useMemo(
    () => Array.from({ length: pos }, (_, i) => i).filter((i) => !visible.includes(i)),
    [pos, visible],
  );
  const scores = useMemo(() => tokenScores(pos), [pos]);
  const visibleScores = visible.map((i) => scores[i]);
  const tileCount = Math.ceil(visibleScores.length / DECODE_TILE);
  const trace = useMemo(
    () => onlineSoftmaxTrace(visibleScores, DECODE_TILE),
    [visibleScores],
  );
  const shownTiles = Math.min(tileStep, tileCount);
  const lastStep = shownTiles > 0 ? trace.steps[shownTiles - 1] : null;
  const done = shownTiles >= tileCount && tileCount > 0;
  const weights = useMemo(() => softmaxWeights(visibleScores), [visibleScores]);
  const toyBytes = toyBytesPerToken(kvHeads);
  const mqaBytes = toyBytesPerToken(1);

  useEffect(() => {
    if (!running || prefersReducedMotion() || pos >= DECODE_MAX) return;
    const id = window.setTimeout(() => {
      if (pos + 1 >= DECODE_MAX) setRunning(false);
      setPos(Math.min(DECODE_MAX, pos + 1));
      setTileStep(0);
    }, 600);
    return () => window.clearTimeout(id);
  }, [running, pos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const palette = getCanvasPalette(canvas);
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.font = "9px 'JetBrains Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      for (let c = 0; c < DECODE_MAX; c++) {
        const x = LABEL_W + c * CELL_W;
        ctx.fillStyle = c < pos ? palette.body : palette.mute;
        ctx.fillText(DECODE_TOKENS[c].slice(0, 4), x + CELL_W / 2, 14);
      }

      for (let r = 0; r < kvHeads; r++) {
        const y = CANVAS_TOP + r * ROW_H;
        ctx.textAlign = "left";
        ctx.fillStyle = palette.mute;
        ctx.fillText(`kv ${r + 1}`, 8, y + ROW_H / 2 + 3);
        for (let c = 0; c < DECODE_MAX; c++) {
          const x = LABEL_W + c * CELL_W + 2;
          const w = CELL_W - 4;
          const h = ROW_H - 6;
          if (c >= pos) {
            ctx.strokeStyle = palette.hairline;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y + 2, w, h);
          } else if (visible.includes(c)) {
            ctx.fillStyle = palette.accent;
            ctx.globalAlpha = 0.16 + (r / Math.max(1, kvHeads - 1)) * 0.3;
            ctx.fillRect(x, y + 2, w, h);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = palette.accent;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 2.5, w - 1, h - 1);
          } else {
            ctx.strokeStyle = palette.error;
            ctx.globalAlpha = 0.5;
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 2.5, w - 1, h - 1);
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x + 3, y + 5);
            ctx.lineTo(x + w - 3, y + h - 3);
            ctx.moveTo(x + w - 3, y + 5);
            ctx.lineTo(x + 3, y + h - 3);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      ctx.textAlign = "left";
      ctx.fillStyle = palette.body;
      ctx.fillText(
        `${pos} cached tokens per layer \u00b7 ${visible.length} live \u00b7 ${evicted.length} evicted`,
        LABEL_W,
        CANVAS_H - 8,
      );
      ctx.textAlign = "right";
      ctx.fillStyle = palette.warning;
      if (pos > budget && policy === "none") {
        ctx.fillText(`over budget: ${pos} > ${budget}`, CANVAS_W - 8, CANVAS_H - 8);
      } else {
        ctx.fillText(`${mode.toUpperCase()} \u00b7 ${kvHeads} KV head${kvHeads === 1 ? "" : "s"}`, CANVAS_W - 8, CANVAS_H - 8);
      }
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [pos, mode, visible, evicted, kvHeads, budget, policy]);

  const stepOnce = () => {
    setPos((p) => Math.min(DECODE_MAX, p + 1));
    setTileStep(0);
  };

  const runAll = () => {
    if (prefersReducedMotion()) {
      setPos(DECODE_MAX);
      setTileStep(0);
      return;
    }
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setPos(6);
    setTileStep(0);
  };

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  const secondary =
    "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50";

  const barRows = visible.map((i, rank) => ({
    i,
    score: scores[i],
    weight: done ? weights[rank] : null,
    processed: rank < shownTiles * DECODE_TILE,
    current: rank >= (shownTiles - 1) * DECODE_TILE && rank < shownTiles * DECODE_TILE,
  }));
  const scoreMin = Math.min(...visibleScores, 0);
  const scoreMax = Math.max(...visibleScores, 1);
  const barX = (s: number) =>
    70 + ((s - scoreMin) / Math.max(1e-6, scoreMax - scoreMin)) * 560;

  const status =
    `Decode step ${pos - 6}: ${evicted.length > 0 ? `${evicted.length} evicted, ` : ""}` +
    `${visible.length} positions live in ${mode.toUpperCase()} (${kvHeads} KV head${kvHeads === 1 ? "" : "s"}). ` +
    `${formatBytes(toyBytes)} per token in this toy layer vs ${formatBytes(mqaBytes)} for MQA ` +
    `(${(toyBytes / mqaBytes).toFixed(1)}x). ` +
    (done
      ? `Online softmax done: m = ${trace.m.toFixed(2)}, l = ${trace.l.toFixed(2)}, weights sum to ${weights.reduce((s, w) => s + w, 0).toFixed(3)}.`
      : `Tiles processed: ${shownTiles} of ${tileCount}.`);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={stepOnce}
          disabled={pos >= DECODE_MAX && !running}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Append token
        </button>
        <button
          type="button"
          onClick={runAll}
          disabled={running || pos >= DECODE_MAX}
          className={secondary}
        >
          Decode to 16
        </button>
        <button type="button" onClick={reset} className={secondary}>
          Reset
        </button>
        <span className="flex flex-wrap gap-1 sm:ml-auto" role="group" aria-label="Eviction policy">
          {(
            [
              ["none", "No eviction"],
              ["window", "Sliding window"],
              ["sink", "Sink + recent"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={policy === value}
              onClick={() => {
                setPolicy(value);
                setTileStep(0);
              }}
              className={toggleClasses(policy === value)}
            >
              {label}
            </button>
          ))}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="flex gap-1" role="group" aria-label="KV head layout">
          {(["mha", "gqa", "mqa"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setTileStep(0);
              }}
              className={toggleClasses(mode === m)}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </span>
        <label htmlFor="kv-budget" className="text-xs text-body-mid">
          Cache budget
        </label>
        <input
          id="kv-budget"
          type="range"
          min={4}
          max={12}
          step={1}
          value={budget}
          onChange={(e) => {
            setBudget(Number(e.target.value));
            setTileStep(0);
          }}
          aria-valuetext={`${budget} slots`}
          className="h-1.5 w-full max-w-[160px] cursor-pointer appearance-none rounded-full bg-canvas-soft"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="font-mono text-xs text-ink">{budget} slots</span>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W * 2}
        height={CANVAS_H * 2}
        role="img"
        aria-label={`KV cache grid with ${pos} cached tokens, ${visible.length} live and ${evicted.length} evicted under the ${policy} policy. ${kvHeads} KV heads.`}
        className="mt-4 block w-full rounded-lg bg-canvas"
      />

      <div className="mt-4 rounded-lg border border-hairline bg-canvas px-3 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-ink">
            Online softmax over {visible.length} visible positions
          </span>
          <span className="font-mono text-[10px] text-body-mid">
            tile = {DECODE_TILE} &middot; m&#8320; ={" "}
            {lastStep
              ? Number.isFinite(lastStep.mOld)
                ? lastStep.mOld.toFixed(2)
                : "\u2212\u221E"
              : "\u2014"}{" "}
            &middot; m = {lastStep ? lastStep.mNew.toFixed(2) : "\u2014"} &middot;
            l = {lastStep ? lastStep.lNew.toFixed(3) : "\u2014"}
          </span>
        </div>

        <svg
          role="img"
          aria-label={`Scores for the query over ${visible.length} cached positions, processed in tiles of ${DECODE_TILE}. ${shownTiles} of ${tileCount} tiles processed.`}
          viewBox="0 0 700 150"
          className="mt-2 w-full"
        >
          <line x1={70} y1={118} x2={630} y2={118} className="stroke-hairline" strokeWidth="1.5" />
          <line x1={barX(0) } y1={24} x2={barX(0)} y2={118} strokeDasharray="3 4" className="stroke-mute/60" />
          <text x={barX(0) - 4} y={134} textAnchor="end" className="fill-mute text-[8.5px] font-mono">
            0
          </text>
          {barRows.map((row) => {
            const x = barX(row.score);
            const top = Math.min(barX(0), x);
            const width = Math.abs(x - barX(0));
            return (
              <g key={row.i}>
                <rect
                  x={top}
                  y={34}
                  width={Math.max(1, width)}
                  height={72}
                  rx={3}
                  className={
                    row.current
                      ? "fill-warning/80"
                      : row.processed
                        ? "fill-accent/70"
                        : "fill-mute/25"
                  }
                />
                <text x={70 - 8} y={74} textAnchor="end" className="fill-mute text-[8.5px] font-mono">
                  {row.i}
                </text>
                {row.weight !== null && (
                  <text
                    x={x}
                    y={28}
                    textAnchor="middle"
                    className="fill-accent text-[8.5px] font-mono"
                  >
                    {row.weight.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
          <text x={70} y={20} className="fill-warning text-[9px] font-mono">
            tile {Math.max(1, shownTiles)}/{Math.max(1, tileCount)} &middot; rescale l&#8320;&middot;e^(m&#8320; &minus; m):{" "}
            {lastStep ? lastStep.rescale.toFixed(3) : "\u2014"}
          </text>
        </svg>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTileStep((t) => Math.min(tileCount, t + 1))}
            disabled={done}
            className={secondary}
          >
            Process tile
          </button>
          <button
            type="button"
            onClick={() => setTileStep(0)}
            disabled={shownTiles === 0}
            className={secondary}
          >
            Restart tiles
          </button>
          <span className="font-mono text-[10px] text-body-mid">
            {done
              ? `softmax weights sum to ${weights.reduce((s, w) => s + w, 0).toFixed(3)}`
              : "running max and sum rescale once per tile"}
          </span>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-relaxed text-body-mid"
      >
        {status}
      </p>
    </>
  );
}

/* ---------------------------------- main --------------------------------- */

export function KvCacheDemo(_props: DemoProps) {
  const [tab, setTab] = useState<"budget" | "decode">("budget");

  const toggleClasses = (active: boolean) =>
    active
      ? "min-h-11 rounded-lg bg-accent px-3 py-1 text-xs font-medium text-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
      : "min-h-11 rounded-lg border border-hairline px-3 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          {tab === "budget"
            ? "Size the cache before you size the model"
            : "Every token appends one K and one V per layer"}
        </span>
        <span className="flex gap-1" role="group" aria-label="Demo mode">
          <button
            type="button"
            aria-pressed={tab === "budget"}
            onClick={() => setTab("budget")}
            className={toggleClasses(tab === "budget")}
          >
            KV budget
          </button>
          <button
            type="button"
            aria-pressed={tab === "decode"}
            onClick={() => setTab("decode")}
            className={toggleClasses(tab === "decode")}
          >
            Decode + softmax
          </button>
        </span>
      </figcaption>

      {tab === "budget" ? <BudgetPanel /> : <DecodePanel />}

      <p className="mt-3 text-[10px] leading-relaxed text-mute">
        KV bytes per token = 2 (K and V) &middot; layers &middot; KV heads &middot; head dim &middot; bytes per element.
        GQA shares one KV head across four query heads; MQA shares one across all of them.
      </p>
    </figure>
  );
}
