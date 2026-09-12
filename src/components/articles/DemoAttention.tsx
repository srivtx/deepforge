"use client";

import { useMemo, useState } from "react";
import { type DemoProps } from "@/lib/articles-demos";

const TOKENS = ["the", "cat", "sat", "on", "the", "mat"];
const D = 4;
const SCALE = Math.sqrt(D);

const Q: number[][] = [
  [1.0, 0.2, -0.3, 0.5],
  [0.6, 1.2, 0.1, -0.4],
  [0.2, 1.4, -0.2, 0.3],
  [0.9, -0.6, 0.4, 0.2],
  [1.0, 0.2, -0.3, 0.5],
  [0.3, 0.8, 0.9, -0.5],
];

const K: number[][] = [
  [0.8, 0.1, 0.2, 0.4],
  [0.5, 1.1, 0.0, -0.2],
  [0.1, 1.3, -0.1, 0.2],
  [0.7, -0.5, 0.3, 0.1],
  [0.8, 0.1, 0.2, 0.4],
  [0.2, 0.7, 0.8, -0.4],
];

function dot(a: number[], b: number[]): number {
  let total = 0;
  for (let i = 0; i < a.length; i++) total += a[i] * b[i];
  return total;
}

function softmaxRow(row: number[]): number[] {
  const max = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

const SCORES: number[][] = Q.map((q) => K.map((k) => dot(q, k) / SCALE));
const WEIGHTS: number[][] = SCORES.map(softmaxRow);
const MAX_WEIGHT = Math.max(...WEIGHTS.flat());
const MAX_SCORE = Math.max(...SCORES.flat().map((s) => Math.abs(s)));

const LEFT = 64;
const TOP = 46;
const CELL_W = 54;
const CELL_H = 40;
const N = TOKENS.length;
const VIEW_W = LEFT + N * CELL_W + 6;
const VIEW_H = TOP + N * CELL_H + 6;

type View = "weights" | "scores";

interface CellRef {
  row: number;
  col: number;
}

export function AttentionDemo(_props: DemoProps) {
  const [hover, setHover] = useState<CellRef | null>(null);
  const [view, setView] = useState<View>("weights");

  const bestCell = useMemo(() => {
    let best: CellRef = { row: 0, col: 0 };
    let bestValue = -Infinity;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (WEIGHTS[i][j] > bestValue) {
          bestValue = WEIGHTS[i][j];
          best = { row: i, col: j };
        }
      }
    }
    return best;
  }, []);

  const focus = hover ?? bestCell;
  const focusWeight = WEIGHTS[focus.row][focus.col];
  const focusScore = SCORES[focus.row][focus.col];
  const topKeys = useMemo(() => {
    return TOKENS.map((token, j) => ({ token, j, weight: WEIGHTS[focus.row][j] }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }, [focus.row]);

  const valueAt = (i: number, j: number) =>
    view === "weights" ? WEIGHTS[i][j] : SCORES[i][j];
  const maxValue = view === "weights" ? MAX_WEIGHT : MAX_SCORE;
  const format = (value: number) =>
    view === "weights" ? `${(value * 100).toFixed(0)}%` : value.toFixed(2);
  const ratioAt = (i: number, j: number) =>
    Math.min(1, Math.abs(valueAt(i, j)) / maxValue);

  const status =
    `View: ${view === "weights" ? "softmax weights" : "raw scaled scores"}. ` +
    `Focused cell: query "${TOKENS[focus.row]}" (row ${focus.row + 1}) against key "${TOKENS[focus.col]}" (column ${focus.col + 1}). ` +
    `q\u00B7k = ${dot(Q[focus.row], K[focus.col]).toFixed(3)}; scaled by 1/\u221Ad = ${focusScore.toFixed(3)}; ` +
    `softmax weight = ${(focusWeight * 100).toFixed(1)}%. ` +
    `Row "${TOKENS[focus.row]}" attends most to ${topKeys
      .map((t) => `"${t.token}" ${(t.weight * 100).toFixed(0)}%`)
      .join(", ")}.`;

  const groupLabel =
    `Attention heatmap. Rows are queries: ${TOKENS.join(", ")}. ` +
    `Columns are keys: ${TOKENS.join(", ")}. ` +
    (view === "weights"
      ? "Cell values are row-softmax attention weights; each row sums to 100 percent."
      : "Cell values are raw scaled dot-product scores before softmax.") +
    ` Highest weight: query "${TOKENS[bestCell.row]}" to key "${TOKENS[bestCell.col]}", ${(WEIGHTS[bestCell.row][bestCell.col] * 100).toFixed(1)} percent.`;

  const toggleClasses = (active: boolean) =>
    active
      ? "rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-canvas"
      : "rounded-lg border border-hairline px-2.5 py-1 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink";

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          QK&#7488; / &radic;d, one softmax per row
        </span>
        <span className="flex gap-1" role="group" aria-label="Grid values">
          <button
            type="button"
            aria-pressed={view === "weights"}
            onClick={() => setView("weights")}
            className={toggleClasses(view === "weights")}
          >
            Attention weights
          </button>
          <button
            type="button"
            aria-pressed={view === "scores"}
            onClick={() => setView("scores")}
            className={toggleClasses(view === "scores")}
          >
            Raw scores
          </button>
        </span>
      </figcaption>

      <svg
        role="group"
        aria-label={groupLabel}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full select-none"
        onMouseLeave={() => setHover(null)}
      >
        {TOKENS.map((token, j) => {
          const highlighted = hover !== null && hover.col === j;
          return (
            <g key={`col-${j}`}>
              <text
                x={LEFT + j * CELL_W + (CELL_W - 2) / 2}
                y={TOP - 22}
                fontSize="10"
                textAnchor="middle"
                fill={highlighted ? "var(--accent)" : "var(--mute)"}
                fontFamily="var(--font-mono)"
              >
                j{j + 1}
              </text>
              <text
                x={LEFT + j * CELL_W + (CELL_W - 2) / 2}
                y={TOP - 9}
                fontSize="11"
                textAnchor="middle"
                fill={highlighted ? "var(--accent)" : "var(--body)"}
                fontFamily="var(--font-mono)"
              >
                {token}
              </text>
            </g>
          );
        })}

        {TOKENS.map((token, i) => {
          const highlighted = hover !== null && hover.row === i;
          return (
            <g key={`row-${i}`}>
              <text
                x={LEFT - 10}
                y={TOP + i * CELL_H + 12}
                fontSize="10"
                textAnchor="end"
                fill={highlighted ? "var(--accent)" : "var(--mute)"}
                fontFamily="var(--font-mono)"
              >
                i{i + 1}
              </text>
              <text
                x={LEFT - 10}
                y={TOP + i * CELL_H + 26}
                fontSize="11"
                textAnchor="end"
                fill={highlighted ? "var(--accent)" : "var(--body)"}
                fontFamily="var(--font-mono)"
              >
                {token}
              </text>
            </g>
          );
        })}

        {hover && (
          <>
            <rect
              x={LEFT - 2}
              y={TOP + hover.row * CELL_H - 1}
              width={N * CELL_W}
              height={CELL_H}
              fill="var(--accent)"
              opacity="0.08"
              pointerEvents="none"
            />
            <rect
              x={LEFT + hover.col * CELL_W - 1}
              y={TOP - 2}
              width={CELL_W}
              height={N * CELL_H}
              fill="var(--accent)"
              opacity="0.08"
              pointerEvents="none"
            />
          </>
        )}

        {TOKENS.map((_, i) =>
          TOKENS.map((__, j) => {
            const value = valueAt(i, j);
            const ratio = ratioAt(i, j);
            const fillOpacity = 0.05 + 0.8 * ratio;
            const inCross =
              hover !== null && (hover.row === i || hover.col === j);
            const dim = hover !== null && !inCross;
            const focused =
              hover !== null && hover.row === i && hover.col === j;
            return (
              <g
                key={`cell-${i}-${j}`}
                role="button"
                tabIndex={0}
                aria-label={`Query ${TOKENS[i]} row ${i + 1}, key ${TOKENS[j]} column ${j + 1}: ${
                  view === "weights"
                    ? `${(WEIGHTS[i][j] * 100).toFixed(1)} percent attention weight`
                    : `scaled score ${SCORES[i][j].toFixed(3)}, raw q dot k ${dot(Q[i], K[j]).toFixed(3)}`
                }`}
                opacity={dim ? 0.45 : 1}
                onMouseEnter={() => setHover({ row: i, col: j })}
                onFocus={() => setHover({ row: i, col: j })}
                onBlur={() => setHover(null)}
                className="cursor-pointer focus:outline-none"
              >
                <rect
                  x={LEFT + j * CELL_W}
                  y={TOP + i * CELL_H}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  rx="2"
                  fill="var(--ink)"
                  opacity={fillOpacity}
                />
                <rect
                  x={LEFT + j * CELL_W}
                  y={TOP + i * CELL_H}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  rx="2"
                  fill="none"
                  stroke={focused ? "var(--accent)" : "var(--hairline)"}
                  strokeWidth={focused ? 2 : 1}
                />
                <text
                  x={LEFT + j * CELL_W + (CELL_W - 2) / 2}
                  y={TOP + i * CELL_H + CELL_H / 2 - 2}
                  fontSize="10"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={fillOpacity > 0.4 ? "var(--canvas)" : "var(--ink)"}
                  fontFamily="var(--font-mono)"
                >
                  {format(value)}
                </text>
              </g>
            );
          }),
        )}

        <text
          x={LEFT}
          y={VIEW_H - 2}
          fontSize="9"
          fill="var(--mute)"
          fontFamily="var(--font-mono)"
        >
          {view === "weights"
            ? "every row sums to 100% \u00B7 darker = more attention"
            : "raw scores before softmax \u00B7 sign preserved"}
        </text>
      </svg>

      <div className="mt-3 rounded-lg border border-hairline bg-canvas px-3 py-2">
        <div className="font-mono text-[11px] text-body-mid">
          q({TOKENS[focus.row]}) &middot; k({TOKENS[focus.col]}) ={" "}
          <span className="text-ink">
            {dot(Q[focus.row], K[focus.col]).toFixed(3)}
          </span>{" "}
          &rarr; /&radic;{D} ={" "}
          <span className="text-ink">{focusScore.toFixed(3)}</span> &rarr;
          softmax row ={" "}
          <span className="text-accent">{(focusWeight * 100).toFixed(1)}%</span>
        </div>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-body-mid">
          {topKeys.map((t) => (
            <li key={t.j}>
              <span className="font-mono">{t.token}</span>{" "}
              <span className="font-mono text-ink">
                {(t.weight * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
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
