"use client";

import { useMemo, useState } from "react";
import { clamp, type DemoProps } from "@/lib/articles-demos";
import {
  buildKernelQuestion,
  formatKernelChoice,
  gumbelPick,
  softmaxWithTemperature,
} from "@/lib/articleKernels";

const TOKENS = ["cat", "dog", "fox", "eel"];
const LOGITS = [2.4, 2.1, 0.7, -0.4];
// One fixed Gumbel draw. Deterministic, so the demo says the same thing on
// every visit — the flip points below are a property of this draw only.
const GUMBEL = [0.2, -0.6, 1.4, 1.9];

const T_MIN = 0.05;
const T_MAX = 5;
const BAR_X = 96;
const BAR_MAX = 348;
const ROW_Y = 16;
const ROW_H = 36;

function findFlips(lo: number, hi: number, samples: number): number[] {
  const flips: number[] = [];
  let prev = gumbelPick(LOGITS, GUMBEL, lo);
  for (let k = 1; k <= samples; k++) {
    const t = lo + ((hi - lo) * k) / samples;
    const pick = gumbelPick(LOGITS, GUMBEL, t);
    if (pick !== prev) {
      const rounded = Math.round(t * 100) / 100;
      const last = flips.length > 0 ? flips[flips.length - 1] : -1;
      if (rounded - last > 0.02) flips.push(rounded);
      prev = pick;
    }
  }
  return flips;
}

const FLIPS = findFlips(T_MIN, T_MAX, 4000);

function tempFromPosition(position: number): number {
  const f = clamp(position, 0, 1000) / 1000;
  return Math.exp(Math.log(T_MIN) + f * (Math.log(T_MAX) - Math.log(T_MIN)));
}

function positionFromTemp(temp: number): number {
  const safe = clamp(temp, T_MIN, T_MAX);
  const f =
    (Math.log(safe) - Math.log(T_MIN)) / (Math.log(T_MAX) - Math.log(T_MIN));
  return Math.round(f * 1000);
}

function trackX(temp: number): number {
  const safe = clamp(temp, T_MIN, T_MAX);
  const f =
    (Math.log(safe) - Math.log(T_MIN)) / (Math.log(T_MAX) - Math.log(T_MIN));
  return BAR_X + f * BAR_MAX;
}

export function SoftmaxTemperatureDemo({ params }: DemoProps) {
  const [temp, setTemp] = useState<number>(() =>
    clamp(params?.temp ?? 1, T_MIN, T_MAX),
  );
  const [variant, setVariant] = useState(0);
  const [reply, setReply] = useState<{ id: string; index: number } | null>(
    null,
  );

  const probs = useMemo(() => softmaxWithTemperature(LOGITS, temp), [temp]);
  const greedy = useMemo(() => probs.indexOf(Math.max(...probs)), [probs]);
  const sampled = gumbelPick(LOGITS, GUMBEL, temp);
  const top = probs[greedy];

  const question = useMemo(
    () =>
      buildKernelQuestion({
        kind: "softmax-temperature",
        params: { logits: LOGITS, tokens: TOKENS, temp, variant },
      }),
    [temp, variant],
  );
  const picked = reply !== null && reply.id === question.id ? reply.index : null;

  const pct = (p: number) => `${(p * 100).toFixed(1)}%`;
  const rows = TOKENS.map((token, i) => ({ token, i }));
  const status =
    `T = ${temp.toFixed(2)}. Most likely "${TOKENS[greedy]}" at ${pct(top)}. ` +
    `Gumbel sample: "${TOKENS[sampled]}". ` +
    (FLIPS.length > 0
      ? `The sampled token flips at T ≈ ${FLIPS.map((f) => f.toFixed(2)).join(", ")}. `
      : "The sampled token never flips in this range. ") +
    "The greedy argmax never flips for positive T.";

  const ariaLabel =
    `Softmax probability bars at temperature ${temp.toFixed(2)}: ` +
    TOKENS.map((t, i) => `${t} ${pct(probs[i])}`).join(", ") +
    `. Greedy argmax ${TOKENS[greedy]}; Gumbel sample ${TOKENS[sampled]}.`;

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Temperature scaling
        </span>
        <span className="font-mono text-xs text-body-mid">
          p_i = exp(z_i/T) / &Sigma;_j exp(z_j/T)
        </span>
      </figcaption>

      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox="0 0 640 236"
        className="w-full"
      >
        <line
          x1={BAR_X}
          y1={ROW_Y}
          x2={BAR_X}
          y2={ROW_Y + 4 * ROW_H - 10}
          stroke="var(--hairline)"
          strokeWidth="1"
        />
        {rows.map(({ token, i }) => {
          const y = ROW_Y + i * ROW_H;
          const width = Math.max(1.5, probs[i] * BAR_MAX);
          const isGreedy = i === greedy;
          const isSampled = i === sampled;
          return (
            <g key={token}>
              <text
                x="4"
                y={y + 16}
                fontSize="12"
                fill="var(--body)"
                fontFamily="var(--font-mono)"
              >
                {token}
              </text>
              <text
                x="44"
                y={y + 15}
                fontSize="9"
                fill="var(--mute)"
                fontFamily="var(--font-mono)"
              >
                {LOGITS[i].toFixed(1)}
              </text>
              {isGreedy && (
                <polygon
                  points={`${74},${y + 5} ${80},${y + 19} ${68},${y + 19}`}
                  fill="var(--accent)"
                />
              )}
              {isSampled && (
                <polygon
                  points={`${90},${y + 3} ${97},${y + 11} ${90},${y + 19} ${83},${y + 11}`}
                  fill="var(--warning)"
                />
              )}
              <rect
                x={BAR_X}
                y={y + 1}
                width={width}
                height={20}
                rx="3"
                fill="var(--accent)"
                opacity={isGreedy ? 0.95 : 0.55}
              />
              <text
                x={BAR_X + width + 6}
                y={y + 15}
                fontSize="10"
                fill="var(--body)"
                fontFamily="var(--font-mono)"
              >
                {pct(probs[i])}
              </text>
            </g>
          );
        })}

        <line
          x1={BAR_X}
          y1="196"
          x2={BAR_X + BAR_MAX}
          y2="196"
          stroke="var(--hairline)"
          strokeWidth="2"
        />
        {FLIPS.map((f) => (
          <g key={f}>
            <line
              x1={trackX(f)}
              y1="190"
              x2={trackX(f)}
              y2="202"
              stroke="var(--warning)"
              strokeWidth="1.5"
            />
            <text
              x={trackX(f)}
              y="184"
              fontSize="9"
              textAnchor="middle"
              fill="var(--warning)"
              fontFamily="var(--font-mono)"
            >
              {f.toFixed(2)}
            </text>
          </g>
        ))}
        <polygon
          points={`${trackX(temp)},${210} ${trackX(temp) - 5},${218} ${trackX(temp) + 5},${218}`}
          fill="var(--accent)"
        />
        <text x={BAR_X} y="228" fontSize="9" fill="var(--mute)" fontFamily="var(--font-mono)">
          T={T_MIN}
        </text>
        <text
          x={BAR_X + BAR_MAX}
          y="228"
          fontSize="9"
          textAnchor="end"
          fill="var(--mute)"
          fontFamily="var(--font-mono)"
        >
          T={T_MAX}
        </text>
      </svg>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-body-mid">
        <span>
          <span aria-hidden>&#9650;</span> greedy argmax
        </span>
        <span>
          <span aria-hidden>&#9670;</span> sampled token (fixed Gumbel draw)
        </span>
        <span>ticks mark temperatures where the sample flips</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="softmax-temp" className="text-xs text-body-mid">
          Temperature
        </label>
        <input
          id="softmax-temp"
          type="range"
          min={0}
          max={1000}
          step={1}
          value={positionFromTemp(temp)}
          onChange={(e) => setTemp(tempFromPosition(Number(e.target.value)))}
          aria-label="Temperature"
          aria-valuetext={`T equals ${temp.toFixed(2)}`}
          className="h-1.5 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-canvas-soft"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="w-14 shrink-0 text-right font-mono text-xs text-ink">
          {temp.toFixed(2)}
        </span>
      </div>

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
