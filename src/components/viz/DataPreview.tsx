import type { ReactNode } from "react";
import {
  CORRELATION_SIGNAL_THRESHOLD,
  correlations,
  previewKindFor,
  scatterPoints,
  series,
  strongestTransition,
  transitionMatrix,
  type Dataset,
  type PreviewKind,
} from "@/lib/researchViz";
import { cn } from "@/lib/utils";

const W = 320;
const H = 170;
const PAD_LEFT = 18;
const PAD_RIGHT = 10;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

type Domain = [number, number];

function extent(values: number[], fallback: Domain): Domain {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fallback;
  if (min === max) {
    const delta = Math.abs(min) || 1;
    return [min - delta, max + delta];
  }
  const breathing = (max - min) * 0.06;
  return [min - breathing, max + breathing];
}

function scale(domain: Domain, start: number, end: number): (value: number) => number {
  const span = domain[1] - domain[0] || 1;
  return (value) => start + ((value - domain[0]) / span) * (end - start);
}

function Grid() {
  const rows = [0.25, 0.5, 0.75];
  return (
    <g>
      {rows.map((fraction) => {
        const y = PAD_TOP + PLOT_H * fraction;
        return (
          <line
            key={`row-${fraction}`}
            x1={PAD_LEFT}
            x2={PAD_LEFT + PLOT_W}
            y1={y}
            y2={y}
            className="stroke-hairline"
            strokeWidth={1}
            opacity={0.6}
          />
        );
      })}
      {rows.map((fraction) => {
        const x = PAD_LEFT + PLOT_W * fraction;
        return (
          <line
            key={`column-${fraction}`}
            x1={x}
            x2={x}
            y1={PAD_TOP}
            y2={PAD_TOP + PLOT_H}
            className="stroke-hairline"
            strokeWidth={1}
            opacity={0.6}
          />
        );
      })}
    </g>
  );
}

function Axes() {
  return (
    <g className="stroke-hairline" strokeWidth={1}>
      <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + PLOT_H} />
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP + PLOT_H}
        x2={PAD_LEFT + PLOT_W}
        y2={PAD_TOP + PLOT_H}
      />
    </g>
  );
}

function Scatter({ data }: { data: Dataset }) {
  const points = scatterPoints(data);
  const classes = new Set(points.map((point) => point.label));
  const categorical =
    points.length > 0 &&
    classes.size <= 3 &&
    points.every(
      (point) => Number.isInteger(point.label) && point.label >= 0 && point.label <= 2,
    );
  const singleSeries = !categorical || classes.size === 1;
  const xDomain = extent(
    points.map((point) => point.x),
    [0, 1],
  );
  const yDomain = extent(
    points.map((point) => point.y),
    [0, 1],
  );
  const sx = scale(xDomain, PAD_LEFT, PAD_LEFT + PLOT_W);
  const sy = scale(yDomain, PAD_TOP + PLOT_H, PAD_TOP);
  const radius = points.length > 120 ? 2 : 3;
  const classOf = (label: number) =>
    label === 1 ? "fill-accent" : label === 2 ? "fill-warning" : "fill-body-mid";
  const opacityOf = (label: number) =>
    singleSeries ? 0.7 : label === 0 ? 0.45 : 0.85;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
      <Grid />
      <Axes />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={sx(point.x)}
          cy={sy(point.y)}
          r={radius}
          className={singleSeries ? "fill-accent" : classOf(point.label)}
          opacity={opacityOf(point.label)}
        />
      ))}
    </svg>
  );
}

function CorrelationBars({ data }: { data: Dataset }) {
  const values = correlations(data);
  const sy = scale([-1, 1], PAD_TOP + PLOT_H, PAD_TOP);
  const zeroY = sy(0);
  const barSlot = PLOT_W / Math.max(1, values.length);
  const barInset = Math.min(1.5, barSlot * 0.15);
  const barWidth = Math.max(1.5, barSlot - barInset * 2);
  const labelled = values
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => Math.abs(value) >= CORRELATION_SIGNAL_THRESHOLD)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 4)
    .map(({ index }) => index);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
      {[0.5, -0.5].map((r) => (
        <line
          key={r}
          x1={PAD_LEFT}
          x2={PAD_LEFT + PLOT_W}
          y1={sy(r)}
          y2={sy(r)}
          className="stroke-hairline"
          strokeWidth={1}
          opacity={0.6}
        />
      ))}
      <line
        x1={PAD_LEFT}
        x2={PAD_LEFT + PLOT_W}
        y1={zeroY}
        y2={zeroY}
        className="stroke-hairline"
        strokeWidth={1}
      />
      {values.map((value, index) => {
        const strong = Math.abs(value) >= CORRELATION_SIGNAL_THRESHOLD;
        const top = Math.min(zeroY, sy(value));
        return (
          <rect
            key={index}
            x={PAD_LEFT + index * barSlot + barInset}
            y={top}
            width={barWidth}
            height={Math.max(1, Math.abs(sy(value) - zeroY))}
            className={strong ? "fill-accent" : "fill-body-mid"}
            opacity={strong ? 0.9 : 0.3}
          />
        );
      })}
      {[1, 0, -1].map((tick) => (
        <text
          key={tick}
          x={PAD_LEFT - 3}
          y={sy(tick) + 3}
          textAnchor="end"
          fontSize={7}
          className="fill-body-mid"
        >
          {tick === 1 ? "+1" : tick === 0 ? "0" : "\u22121"}
        </text>
      ))}
      {labelled.map((index) => (
        <text
          key={index}
          x={PAD_LEFT + index * barSlot + barSlot / 2}
          y={H - 5}
          textAnchor="middle"
          fontSize={7}
          className="fill-body-mid"
        >
          f{index}
        </text>
      ))}
    </svg>
  );
}

function MatrixGrid({ data }: { data: Dataset }) {
  const matrix = transitionMatrix(data);
  const size = matrix.length;
  const max = Math.max(1, ...matrix.flat());
  const cell = Math.min((PLOT_W - 12) / size, (PLOT_H - 4) / size);
  const gridSize = cell * size;
  const x0 = PAD_LEFT + 12 + (PLOT_W - 12 - gridSize) / 2;
  const y0 = PAD_TOP + (PLOT_H - gridSize) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
      {matrix.map((row, r) =>
        row.map((count, c) => {
          const share = count / max;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x0 + c * cell + 1}
                y={y0 + r * cell + 1}
                width={cell - 2}
                height={cell - 2}
                rx={2}
                className={count === 0 ? "stroke-hairline" : "fill-accent"}
                fillOpacity={count === 0 ? 0 : 0.1 + 0.85 * share}
                strokeWidth={count === 0 ? 1 : 0}
              />
              {cell >= 26 && count > 0 && (
                <text
                  x={x0 + c * cell + cell / 2}
                  y={y0 + r * cell + cell / 2 + 3}
                  textAnchor="middle"
                  fontSize={8}
                  className="text-ink"
                  fill="currentColor"
                  opacity={share > 0.55 ? 0.95 : 0.65}
                >
                  {count}
                </text>
              )}
            </g>
          );
        }),
      )}
      {matrix.map((_, index) => (
        <text
          key={`row-${index}`}
          x={x0 - 5}
          y={y0 + index * cell + cell / 2 + 3}
          textAnchor="end"
          fontSize={8}
          className="fill-body-mid"
        >
          {index}
        </text>
      ))}
      {matrix.map((_, index) => (
        <text
          key={`column-${index}`}
          x={x0 + index * cell + cell / 2}
          y={y0 + gridSize + 11}
          textAnchor="middle"
          fontSize={8}
          className="fill-body-mid"
        >
          {index}
        </text>
      ))}
    </svg>
  );
}

function SeriesLines({ data }: { data: Dataset }) {
  const { clean, noisy } = series(data);
  const count = Math.max(clean.length, noisy.length);
  const sy = scale(
    extent([...clean, ...noisy], [0, 1]),
    PAD_TOP + PLOT_H,
    PAD_TOP,
  );
  const sx = (index: number) =>
    PAD_LEFT + (count <= 1 ? PLOT_W / 2 : (index / (count - 1)) * PLOT_W);
  const toPath = (values: number[]) =>
    values
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"}${sx(index).toFixed(1)} ${sy(value).toFixed(1)}`,
      )
      .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" aria-hidden>
      <Grid />
      <Axes />
      <path
        d={toPath(noisy)}
        fill="none"
        className="stroke-body-mid"
        strokeWidth={1.25}
        opacity={0.6}
      />
      <path
        d={toPath(clean)}
        fill="none"
        className="stroke-accent"
        strokeWidth={2}
      />
    </svg>
  );
}

function DotLegend({ items }: { items: { label: string; className: string }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mute">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <circle cx={5} cy={5} r={4} className={item.className} />
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function TextLegend({ items }: { items: string[] }) {
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-mute">
      {items.join(" \u00b7 ")}
    </p>
  );
}

function legendFor(kind: PreviewKind, data: Dataset): ReactNode {
  if (kind === "scatter") {
    const points = scatterPoints(data);
    const classes = [...new Set(points.map((point) => point.label))].sort(
      (a, b) => a - b,
    );
    const categorical =
      classes.length > 1 &&
      classes.length <= 3 &&
      classes.every(
        (label) => Number.isInteger(label) && label >= 0 && label <= 2,
      );
    if (categorical) {
      return (
        <DotLegend
          items={classes.map((label) => ({
            label: `class ${label}`,
            className:
              label === 1
                ? "fill-accent"
                : label === 2
                  ? "fill-warning"
                  : "fill-body-mid",
          }))}
        />
      );
    }
    const columns = data.features[0]?.length ?? 0;
    return (
      <TextLegend
        items={[
          "x: feature 1",
          columns >= 2 ? "y: feature 2" : "y: label",
        ]}
      />
    );
  }
  if (kind === "correlations") {
    return (
      <TextLegend
        items={[
          `accent: |r| \u2265 ${CORRELATION_SIGNAL_THRESHOLD.toFixed(2)}`,
          "muted: weaker",
          "y axis: Pearson r from \u22121 to +1",
        ]}
      />
    );
  }
  if (kind === "matrix") {
    return (
      <TextLegend
        items={[
          "rows: last token of the context",
          "columns: next token",
          "cells: transition counts",
        ]}
      />
    );
  }
  return (
    <TextLegend
      items={[
        "accent: clean signal (the label)",
        "muted: last sample of each noisy window",
      ]}
    />
  );
}

function captionFor(kind: PreviewKind, data: Dataset): string {
  if (kind === "scatter") {
    const columns = data.features[0]?.length ?? 0;
    return columns >= 2
      ? "Each dot is one training row: feature 1 against feature 2, coloured by class."
      : "Each dot is one training row: the single feature on x, its label on y.";
  }
  if (kind === "correlations") {
    const columns = data.features[0]?.length ?? 0;
    return `Pearson correlation between each of the ${columns} feature columns and the label. Accent bars mark |r| \u2265 ${CORRELATION_SIGNAL_THRESHOLD.toFixed(2)}.`;
  }
  if (kind === "matrix") {
    const strongest = strongestTransition(transitionMatrix(data));
    const rows = data.features.length;
    const base =
      "Transition counts: rows are the last token of the context, columns the next token; darker cells are more frequent.";
    return strongest
      ? `${base} The heaviest cell is ${strongest.from} \u2192 ${strongest.to} with ${strongest.count} of ${rows} rows.`
      : base;
  }
  return "The five-sample noisy windows (muted) against the clean wave each window ends on (accent).";
}

export function DataPreview({ data, className }: { data: Dataset; className?: string }) {
  const kind = previewKindFor(data);
  const empty = data.features.length === 0;
  return (
    <div className={cn("rounded-md border border-hairline bg-canvas p-3", className)}>
      <div className="h-[170px] w-full">
        {empty ? (
          <p className="flex h-full items-center justify-center text-xs text-mute">
            No rows to preview.
          </p>
        ) : (
          <>
            {kind === "scatter" && <Scatter data={data} />}
            {kind === "correlations" && <CorrelationBars data={data} />}
            {kind === "matrix" && <MatrixGrid data={data} />}
            {kind === "series" && <SeriesLines data={data} />}
          </>
        )}
      </div>
      {!empty && legendFor(kind, data)}
      <p className="mt-2 text-[11px] leading-relaxed text-mute">
        {empty ? "No rows to preview." : captionFor(kind, data)}
      </p>
    </div>
  );
}
