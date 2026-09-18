"use client";

import { useState } from "react";
import type {
  InventionBlock,
  InventionFigure,
  InventionFigureBar,
  InventionPaper,
} from "@/data/inventions/types";
import { splitBionic } from "@/lib/bionic";

/**
 * Renders a full invention paper: numbered sections, paragraphs, lists,
 * formulas, code, tables, deterministic inline-SVG figures, callouts, and the
 * numbered reference list.
 *
 * Client component because the reading-mode control is interactive: bionic
 * reading is on by default and applies to prose (paragraphs, list items, and
 * callout text) only. Code, formulas, tables, figure labels, section
 * headings, and references are never transformed; the PDF projection is
 * unaffected. With client JavaScript disabled the server-rendered HTML still
 * shows the bionic default.
 */

const FIGURE_WIDTH = 720;
const FIGURE_HEIGHT = 340;
const FIGURE_HEIGHT_ROTATED = 420;
const FIGURE_MARGIN = { top: 38, right: 16, bottom: 74, left: 48 };
const FIGURE_MARGIN_ROTATED = { top: 38, right: 16, bottom: 154, left: 48 };
const ROTATED_LABEL_THRESHOLD = 8;

function Figure({ figure }: { figure: InventionFigure }) {
  const groups = Math.max(
    1,
    ...figure.series.map((series) => series.bars.length),
  );
  const rotated = groups > ROTATED_LABEL_THRESHOLD;
  const height = rotated ? FIGURE_HEIGHT_ROTATED : FIGURE_HEIGHT;
  const margin = rotated ? FIGURE_MARGIN_ROTATED : FIGURE_MARGIN;
  const labels = figure.series.reduce<readonly InventionFigureBar[]>(
    (widest, series) => (series.bars.length > widest.length ? series.bars : widest),
    [],
  );
  const seriesCount = figure.series.length;
  const plotWidth = FIGURE_WIDTH - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const groupWidth = plotWidth / groups;
  const barWidth = Math.min(30, Math.max(8, (groupWidth * 0.6) / seriesCount));
  const barGap = 6;
  const baseline = margin.top + plotHeight;
  const titleId = `figure-${figure.id}-title`;
  const descId = `figure-${figure.id}-desc`;

  const y = (value: number) => margin.top + plotHeight * (1 - value / figure.max);

  const ticks = [0, 1, 2, 3].map((step) => (figure.max * step) / 3);

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4 print:break-inside-avoid">
      <svg
        viewBox={`0 0 ${FIGURE_WIDTH} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full"
      >
        <title id={titleId}>{figure.title}</title>
        <desc id={descId}>{figure.caption}</desc>

        {figure.series.map((series, index) => (
          <g key={series.label}>
            <rect
              x={margin.left + index * 116}
              y={12}
              width={10}
              height={10}
              rx={2}
              className={
                index === 0 ? "fill-current text-mute" : "fill-current text-accent"
              }
            />
            <text
              x={margin.left + index * 116 + 16}
              y={21}
              fontSize={11}
              className="fill-current text-body-mid"
            >
              {series.label}
            </text>
          </g>
        ))}

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={FIGURE_WIDTH - margin.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-hairline"
              strokeWidth={1}
            />
            <text
              x={margin.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={11}
              className="fill-current text-mute"
            >
              {Math.round(tick * 10) / 10}
            </text>
          </g>
        ))}

        {typeof figure.gate === "number" && (
          <g>
            <line
              x1={margin.left}
              x2={FIGURE_WIDTH - margin.right}
              y1={y(figure.gate)}
              y2={y(figure.gate)}
              strokeDasharray="5 4"
              strokeWidth={1}
              className="stroke-current text-body-mid"
            />
            <text
              x={FIGURE_WIDTH - margin.right}
              y={y(figure.gate) - 5}
              textAnchor="end"
              fontSize={10}
              className="fill-current text-body-mid"
            >
              {figure.gate}% gate
            </text>
          </g>
        )}

        {figure.series.map((series, seriesIndex) =>
          series.bars.map((bar, barIndex) => {
            const clusterWidth =
              barWidth * seriesCount + barGap * (seriesCount - 1);
            const groupLeft = margin.left + barIndex * groupWidth;
            const x =
              groupLeft +
              (groupWidth - clusterWidth) / 2 +
              seriesIndex * (barWidth + barGap);
            const top = y(bar.value);
            const barHeight = Math.max(1, baseline - top);
            return (
              <g key={`${series.label}-${bar.label}`}>
                <rect
                  x={x}
                  y={top}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                  className={
                    seriesIndex === 0
                      ? "fill-current text-mute"
                      : "fill-current text-accent"
                  }
                />
                <text
                  x={x + barWidth / 2}
                  y={top - 4}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-current text-body"
                >
                  {bar.value}
                </text>
              </g>
            );
          }),
        )}

        {labels.map((bar, barIndex) => {
          const x = margin.left + barIndex * groupWidth + groupWidth / 2;
          const y = baseline + (rotated ? 16 : 26);
          return (
            <text
              key={bar.label}
              x={x}
              y={y}
              textAnchor={rotated ? "end" : "middle"}
              fontSize={rotated ? 11 : 12}
              transform={rotated ? `rotate(-45 ${x} ${y})` : undefined}
              className="fill-current text-body-mid"
            >
              {bar.label}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-body-mid">
        <span className="font-medium text-body">{figure.title}.</span>{" "}
        {figure.caption}{" "}
        <span className="text-mute">{figure.unit}.</span>
      </figcaption>
    </figure>
  );
}

/**
 * Prose renderer for the bionic mode: bold segments use spans with
 * `font-semibold` (never `<strong>`, so screen readers read the text
 * normally). In normal mode the original string is rendered untouched.
 */
function ProseText({ text, bionic }: { text: string; bionic: boolean }) {
  if (!bionic) return <>{text}</>;
  return (
    <>
      {splitBionic(text).map((segment, index) => (
        <span
          key={`${index}-${segment.bold ? "b" : "p"}`}
          className={segment.bold ? "font-semibold" : undefined}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

function BlockView({
  block,
  bionic,
}: {
  block: InventionBlock;
  bionic: boolean;
}) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-body">
          <ProseText text={block.text} bionic={bionic} />
        </p>
      );

    case "list": {
      const ListTag = block.ordered === true ? "ol" : "ul";
      return (
        <ListTag
          className={
            block.ordered === true
              ? "list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-body"
              : "list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-body"
          }
        >
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              <ProseText text={item} bionic={bionic} />
            </li>
          ))}
        </ListTag>
      );
    }

    case "formula":
      return (
        <div className="rounded-lg border border-hairline bg-canvas-card px-4 py-3 print:break-inside-avoid">
          {block.label && (
            <p className="text-xs font-medium text-body-mid">{block.label}</p>
          )}
          <pre className="df-scroll mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
            {block.expression}
          </pre>
          {block.note && (
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              {block.note}
            </p>
          )}
        </div>
      );

    case "code":
      return (
        <figure className="overflow-hidden rounded-lg border border-hairline bg-canvas-card print:break-inside-avoid">
          {block.title && (
            <figcaption className="border-b border-hairline px-4 py-2 text-xs font-medium text-body-mid">
              {block.title}
            </figcaption>
          )}
          <pre className="df-code-editor df-scroll overflow-x-auto whitespace-pre px-4 py-3 text-body">
            {block.code}
          </pre>
        </figure>
      );

    case "table":
      return (
        <div className="print:break-inside-avoid">
          <div className="df-scroll overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
              {block.title && (
                <caption className="border-b border-hairline px-3 py-2 text-left text-xs font-medium text-body-mid">
                  {block.title}
                </caption>
              )}
              <thead>
                <tr>
                  {block.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-hairline px-3 py-2 font-medium text-body-mid"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="align-top">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-b border-hairline px-3 py-2 text-body"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              {block.caption}
            </p>
          )}
        </div>
      );

    case "figure":
      return <Figure figure={block.figure} />;

    case "callout":
      return (
        <aside className="rounded-lg border border-hairline bg-canvas-card p-4 print:break-inside-avoid">
          <p className="text-sm font-medium text-ink">{block.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-body">
            <ProseText text={block.text} bionic={bionic} />
          </p>
        </aside>
      );
  }
}

function ReadingModeControl({
  bionic,
  onChange,
}: {
  bionic: boolean;
  onChange: (next: boolean) => void;
}) {
  const buttonClass = (active: boolean) =>
    `min-h-11 rounded-md border px-2.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 lg:min-h-9 ${
      active
        ? "border-accent/40 bg-accent/5 text-accent"
        : "border-hairline bg-canvas text-body-mid hover:text-ink"
    }`;

  return (
    <div
      role="group"
      aria-label="Reading mode"
      className="flex flex-wrap items-center gap-1.5 rounded-lg border border-hairline bg-canvas-card p-1.5 lg:fixed lg:right-4 lg:top-24 lg:z-30 lg:w-24 lg:flex-col lg:items-stretch print:hidden"
    >
      <span className="px-1.5 text-xs text-mute lg:text-center">Reading</span>
      <button
        type="button"
        aria-pressed={bionic}
        onClick={() => onChange(true)}
        className={buttonClass(bionic)}
      >
        Bionic
      </button>
      <button
        type="button"
        aria-pressed={!bionic}
        onClick={() => onChange(false)}
        className={buttonClass(!bionic)}
      >
        Normal
      </button>
    </div>
  );
}

export function PaperBody({ paper }: { paper: InventionPaper }) {
  const [bionic, setBionic] = useState(true);

  return (
    <div className="flex flex-col gap-10">
      <ReadingModeControl bionic={bionic} onChange={setBionic} />
      {paper.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="flex scroll-mt-20 flex-col gap-4"
        >
          <h2
            id={`${section.id}-heading`}
            className="text-lg font-semibold tracking-tight text-ink"
          >
            {section.heading}
          </h2>
          <div className="flex flex-col gap-4">
            {section.blocks.map((block, blockIndex) => (
              <BlockView key={blockIndex} block={block} bionic={bionic} />
            ))}
          </div>
        </section>
      ))}

      <section
        id="references"
        aria-labelledby="references-heading"
        className="flex scroll-mt-20 flex-col gap-4"
      >
        <h2
          id="references-heading"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          References
        </h2>
        <ol className="flex flex-col gap-2">
          {paper.references.map((reference, index) => (
            <li
              key={reference.id}
              id={`ref-${reference.id}`}
              className="flex gap-2 text-sm leading-relaxed text-body"
            >
              <span className="shrink-0 font-mono text-xs text-mute">
                [{index + 1}]
              </span>
              <span className="min-w-0">
                {reference.citation}.{" "}
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all rounded-sm text-body-mid underline decoration-hairline underline-offset-2 transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {reference.url}
                </a>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
